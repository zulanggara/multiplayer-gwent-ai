import type { Faction, GameState } from "./game";

export interface Seat {
  playerId: string;
  name: string;
  faction: Faction | null;
  ready: boolean;
}

export interface RoomRecord {
  roomId: string;
  status: "lobby" | "playing" | "finished";
  seats: [Seat | null, Seat | null];
  game: GameState | null;
  createdAt: number;
  updatedAt: number;
}
