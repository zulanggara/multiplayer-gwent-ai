import { NextResponse } from "next/server";
import {
  dispatchAction,
  playerIndexInRoom,
  readRoom,
  setFaction,
  viewRoomAs,
} from "@/lib/rooms";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const roomId = id.toUpperCase();
  const body = await request.json().catch(() => ({}));
  const playerId = (body?.playerId ?? "").toString();
  const action = body?.action;

  if (!playerId || !action?.type) {
    return NextResponse.json(
      { error: "playerId and action required" },
      { status: 400 }
    );
  }

  let result;

  if (action.type === "set_faction") {
    result = await setFaction(roomId, playerId, action.faction);
  } else if (
    action.type === "play_card" ||
    action.type === "pass" ||
    action.type === "next_round"
  ) {
    result = await dispatchAction(roomId, playerId, action);
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const viewerIndex = playerIndexInRoom(result, playerId);

  return NextResponse.json({
    room: viewRoomAs(result, viewerIndex),
    viewerIndex,
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const roomId = id.toUpperCase();
  const url = new URL(request.url);
  const playerId = url.searchParams.get("playerId") ?? "";

  const room = await readRoom(roomId);

  if (!room) {
    return NextResponse.json(
      { error: "Room not found" },
      { status: 404 }
    );
  }

  const viewerIndex = playerId
    ? playerIndexInRoom(room, playerId)
    : -1;

  return NextResponse.json({
    room: viewRoomAs(room, viewerIndex),
    viewerIndex,
  });
}