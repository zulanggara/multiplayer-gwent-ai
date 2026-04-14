"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnlineLobby() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/room/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerName: name || "Host" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      localStorage.setItem(`gwent:room:${data.roomId}`, data.playerId);
      router.push(`/online/${data.roomId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setError("Enter a room code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/room/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roomId: code, playerName: name || "Guest" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      localStorage.setItem(`gwent:room:${data.roomId}`, data.playerId);
      router.push(`/online/${data.roomId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-amber-300 hover:text-amber-200 text-sm font-display tracking-widest">
            ← HOME
          </Link>
          <h1 className="font-display text-2xl gold-shimmer tracking-[0.3em]">
            ONLINE DUEL
          </h1>
          <div />
        </div>

        <div>
          <label className="text-amber-300/80 text-[10px] font-display tracking-[0.3em]">
            YOUR NAME
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full bg-stone-950/80 border border-amber-800/60 rounded px-3 py-2 text-amber-100 focus:outline-none focus:border-amber-400"
            placeholder="e.g. Geralt"
          />
        </div>

        <div className="p-4 panel-leather rounded space-y-3">
          <h2 className="font-display text-amber-200 tracking-widest">
            CREATE A ROOM
          </h2>
          <p className="text-xs text-amber-100/60 font-serif italic">
            You&apos;ll get a code to share with your opponent.
          </p>
          <button
            disabled={loading}
            onClick={handleCreate}
            className="w-full px-4 py-2 rounded border border-amber-500 bg-gradient-to-b from-amber-800 to-amber-950 text-amber-100 font-display tracking-widest hover:glow-active disabled:opacity-50 transition"
          >
            CREATE ROOM
          </button>
        </div>

        <div className="p-4 panel-leather rounded space-y-3">
          <h2 className="font-display text-amber-200 tracking-widest">
            JOIN A ROOM
          </h2>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="w-full bg-stone-950/80 border border-amber-800/60 rounded px-3 py-2 text-amber-100 tracking-[0.3em] uppercase font-display focus:outline-none focus:border-amber-400"
            placeholder="ROOM CODE"
            maxLength={8}
          />
          <button
            disabled={loading}
            onClick={handleJoin}
            className="w-full px-4 py-2 rounded border border-amber-700/60 bg-stone-900/80 text-amber-100 font-display tracking-widest hover:border-amber-400 hover:text-amber-200 disabled:opacity-50 transition"
          >
            JOIN ROOM
          </button>
        </div>

        {error && (
          <div className="text-red-300 text-sm bg-red-950/50 border border-red-900/50 rounded p-2 font-serif">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
