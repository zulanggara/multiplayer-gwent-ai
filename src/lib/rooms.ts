import { nanoid } from "nanoid";
import { getRedis, ROOM_TTL_SECONDS, roomKey } from "./redis";
import type { RoomRecord, Seat } from "@/types/room";
import type { Faction } from "@/types/game";
import { applyAction, createGame, startNextRound } from "./engine";

export async function readRoom(roomId: string): Promise<RoomRecord | null> {
  const redis = getRedis();
  const raw = await redis.get<RoomRecord | string>(roomKey(roomId));
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as RoomRecord;
    } catch {
      return null;
    }
  }
  return raw as RoomRecord;
}

export async function writeRoom(room: RoomRecord): Promise<void> {
  const redis = getRedis();
  room.updatedAt = Date.now();
  await redis.set(roomKey(room.roomId), JSON.stringify(room), {
    ex: ROOM_TTL_SECONDS,
  });
}

export async function createRoom(playerName: string): Promise<{
  room: RoomRecord;
  playerId: string;
  roomId: string;
}> {
  const roomId = nanoid(6).toUpperCase();
  const playerId = nanoid(12);
  const seat: Seat = {
    playerId,
    name: playerName || "Player 1",
    faction: null,
    ready: false,
  };
  const room: RoomRecord = {
    roomId,
    status: "lobby",
    seats: [seat, null],
    game: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await writeRoom(room);
  return { room, playerId, roomId };
}

export async function joinRoom(
  roomId: string,
  playerName: string,
): Promise<{ room: RoomRecord; playerId: string } | { error: string }> {
  const room = await readRoom(roomId);
  if (!room) return { error: "Room not found" };
  if (room.status !== "lobby") return { error: "Room is no longer joinable" };
  const emptyIdx = room.seats.findIndex((s) => s == null);
  if (emptyIdx < 0) return { error: "Room is full" };
  const playerId = nanoid(12);
  room.seats[emptyIdx] = {
    playerId,
    name: playerName || `Player ${emptyIdx + 1}`,
    faction: null,
    ready: false,
  };
  await writeRoom(room);
  return { room, playerId };
}

export function playerIndexInRoom(
  room: RoomRecord,
  playerId: string,
): 0 | 1 | -1 {
  if (room.seats[0]?.playerId === playerId) return 0;
  if (room.seats[1]?.playerId === playerId) return 1;
  return -1;
}

export async function setFaction(
  roomId: string,
  playerId: string,
  faction: Faction,
): Promise<RoomRecord | { error: string }> {
  const room = await readRoom(roomId);
  if (!room) return { error: "Room not found" };
  const idx = playerIndexInRoom(room, playerId);
  if (idx < 0) return { error: "You are not in this room" };
  const seat = room.seats[idx as 0 | 1];
  if (!seat) return { error: "Seat missing" };
  seat.faction = faction;
  seat.ready = true;
  // if both ready, start the game
  if (
    room.seats[0]?.ready &&
    room.seats[1]?.ready &&
    room.seats[0].faction &&
    room.seats[1].faction &&
    !room.game
  ) {
    room.game = createGame(
      room.roomId,
      "online",
      {
        id: room.seats[0].playerId,
        name: room.seats[0].name,
        faction: room.seats[0].faction,
      },
      {
        id: room.seats[1].playerId,
        name: room.seats[1].name,
        faction: room.seats[1].faction,
      },
    );
    room.status = "playing";
  }
  await writeRoom(room);
  return room;
}

export async function dispatchAction(
  roomId: string,
  playerId: string,
  action:
    | { type: "play_card"; instanceId: string }
    | { type: "pass" }
    | { type: "next_round" },
): Promise<RoomRecord | { error: string }> {
  const room = await readRoom(roomId);
  if (!room) return { error: "Room not found" };
  const idx = playerIndexInRoom(room, playerId);
  if (idx < 0) return { error: "Not in this room" };
  if (!room.game) return { error: "Game not started" };

  if (action.type === "next_round") {
    if (room.game.status !== "round_over")
      return { error: "Round is not over" };
    room.game = startNextRound(room.game);
  } else if (action.type === "pass") {
    if (room.game.status !== "playing") return { error: "Match not active" };
    room.game = applyAction(room.game, { type: "pass", playerIndex: idx as 0 | 1 });
  } else if (action.type === "play_card") {
    if (room.game.status !== "playing") return { error: "Match not active" };
    room.game = applyAction(room.game, {
      type: "play_card",
      playerIndex: idx as 0 | 1,
      instanceId: action.instanceId,
    });
  }

  if (room.game.status === "finished") room.status = "finished";
  await writeRoom(room);
  return room;
}

/**
 * Redact a room for a specific viewer — hides opponent's hand and deck.
 */
export function viewRoomAs(room: RoomRecord, viewerIndex: 0 | 1 | -1): RoomRecord {
  if (!room.game) return room;
  const game = JSON.parse(JSON.stringify(room.game)) as typeof room.game;
  if (!game) return room;
  for (let i = 0; i < 2; i++) {
    if (i === viewerIndex) continue;
    const p = game.players[i as 0 | 1];
    p.hand = p.hand.map((c) => ({
      ...c,
      id: "hidden",
      instanceId: c.instanceId,
      name: "Hidden",
      type: "unit",
      strength: 0,
      row: "melee",
      faction: undefined,
      description: "Opponent card",
    })) as typeof p.hand;
    p.deck = p.deck.map(() => ({
      id: "hidden",
      instanceId: "hidden",
      name: "Hidden",
      type: "unit",
      strength: 0,
      row: "melee",
    })) as typeof p.deck;
  }
  return { ...room, game };
}
