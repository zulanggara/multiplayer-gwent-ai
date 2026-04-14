import { NextRequest, NextResponse } from "next/server";
import { playerIndexInRoom, readRoom, viewRoomAs } from "@/lib/rooms";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: { id: string } },
) {
  const roomId = ctx.params.id.toUpperCase();
  const playerId = req.nextUrl.searchParams.get("playerId") ?? "";
  const room = await readRoom(roomId);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  const viewerIndex = playerId ? playerIndexInRoom(room, playerId) : -1;
  const view = viewRoomAs(room, viewerIndex);
  return NextResponse.json({ room: view, viewerIndex });
}
