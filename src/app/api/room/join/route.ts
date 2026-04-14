import { NextRequest, NextResponse } from "next/server";
import { joinRoom } from "@/lib/rooms";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const roomId = (body?.roomId ?? "")
    .toString()
    .toUpperCase()
    .trim();

  const playerName = (body?.playerName ?? "")
    .toString()
    .trim()
    .slice(0, 32);

  if (!roomId) {
    return NextResponse.json(
      { error: "roomId required" },
      { status: 400 }
    );
  }

  const result = await joinRoom(roomId, playerName);

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json({
    roomId: result.room.roomId,
    playerId: result.playerId,
  });
}