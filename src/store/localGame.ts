"use client";

import { create } from "zustand";
import type { Action, Faction, GameState } from "@/types/game";
import { applyAction, createGame, startNextRound } from "@/lib/engine";
import { nanoid } from "nanoid";

interface LocalGameStore {
  game: GameState | null;
  revealed: boolean; // for hidden-hand handoff in local mode
  startGame: (p0Faction: Faction, p1Faction: Faction, p0Name?: string, p1Name?: string) => void;
  dispatch: (action: Action) => void;
  nextRound: () => void;
  reset: () => void;
  toggleReveal: (val: boolean) => void;
}

export const useLocalGame = create<LocalGameStore>((set, get) => ({
  game: null,
  revealed: false,
  startGame: (p0Faction, p1Faction, p0Name = "Player 1", p1Name = "Player 2") => {
    const game = createGame(
      nanoid(6),
      "local",
      { id: "p0", name: p0Name, faction: p0Faction },
      { id: "p1", name: p1Name, faction: p1Faction },
    );
    set({ game, revealed: false });
  },
  dispatch: (action) => {
    const { game, revealed } = get();
    if (!game) return;
    const next = applyAction(game, action);
    // keep revealed only if the active player didn't change (opponent passed)
    const sameTurn =
      next.currentPlayer === game.currentPlayer && next.status === "playing";
    set({ game: next, revealed: sameTurn ? revealed : false });
  },
  nextRound: () => {
    const { game } = get();
    if (!game) return;
    set({ game: startNextRound(game), revealed: false });
  },
  toggleReveal: (val) => set({ revealed: val }),
  reset: () => set({ game: null, revealed: false }),
}));
