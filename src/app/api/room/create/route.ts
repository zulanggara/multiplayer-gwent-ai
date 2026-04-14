import { NextRequest, NextResponse } from "next/server";
import { createRoom } from "@/lib/rooms";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const playerName = (body?.playerName ?? "").toString().slice(0, 32);
  const { roomId, playerId } = await createRoom(playerName);
  return NextResponse.json({ roomId, playerId });
}
