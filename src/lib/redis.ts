import { Redis } from "@upstash/redis";

// In development without Redis configured, fall back to an in-memory store so
// the online mode UX can still be demoed. This map is per-server-instance and
// is NOT suitable for production — configure Upstash env vars for real use.
// Attach to globalThis so it survives Next.js dev hot-reload module swaps.
const g = globalThis as unknown as { __gwentMemory?: Map<string, string> };
const memory: Map<string, string> = g.__gwentMemory ?? new Map();
g.__gwentMemory = memory;

function makeMemoryClient(): Redis {
  const fake = {
    async get(key: string) {
      const v = memory.get(key);
      return v ? JSON.parse(v) : null;
    },
    async set(key: string, value: unknown, opts?: { ex?: number }) {
      memory.set(key, JSON.stringify(value));
      if (opts?.ex) {
        setTimeout(() => memory.delete(key), opts.ex * 1000);
      }
      return "OK";
    },
    async del(key: string) {
      memory.delete(key);
      return 1;
    },
  };
  return fake as unknown as Redis;
}

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    client = new Redis({ url, token });
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "UPSTASH_REDIS_REST_URL / TOKEN are not configured — online mode will not persist across serverless instances.",
      );
    }
    client = makeMemoryClient();
  }
  return client;
}

export const ROOM_TTL_SECONDS = 60 * 60 * 2; // 2 hours

export function roomKey(roomId: string): string {
  return `gwent:room:${roomId}`;
}
