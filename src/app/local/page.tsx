"use client";

import { useState } from "react";
import Link from "next/link";
import type { Faction } from "@/types/game";
import { DeckSelect } from "@/components/DeckSelect";
import { useLocalGame } from "@/store/localGame";
import { LocalGame } from "./LocalGame";

export default function LocalPage() {
  const [p0Faction, setP0Faction] = useState<Faction | null>("northern_realms");
  const [p1Faction, setP1Faction] = useState<Faction | null>("monsters");
  const [p0Name, setP0Name] = useState("Player 1");
  const [p1Name, setP1Name] = useState("Player 2");
  const { game, startGame, reset } = useLocalGame();

  if (game) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto mb-3">
          <Link
            href="/"
            onClick={() => reset()}
            className="text-amber-300 hover:text-amber-200 text-sm"
          >
            ← Home
          </Link>
          <button
            onClick={() => reset()}
            className="text-xs text-amber-200/70 hover:text-amber-200 underline"
          >
            New Match
          </button>
        </div>
        <LocalGame />
      </div>
    );
  }

  const canStart = p0Faction && p1Faction;

  return (
    <main className="min-h-screen p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-amber-300 hover:text-amber-200 text-sm font-display tracking-widest">
            ← HOME
          </Link>
          <h1 className="font-display text-3xl gold-shimmer tracking-[0.3em]">
            LOCAL MULTIPLAYER
          </h1>
          <div />
        </div>

        <p className="text-amber-100/70 text-center text-sm italic font-serif">
          Pick a faction for each player. You&apos;ll take turns on the same device.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3 panel-leather rounded-lg p-4">
            <input
              className="w-full bg-stone-950/80 border border-amber-800/60 rounded px-3 py-2 text-amber-100 font-display tracking-widest focus:outline-none focus:border-amber-400"
              value={p0Name}
              onChange={(e) => setP0Name(e.target.value)}
              placeholder="Player 1 name"
            />
            <DeckSelect
              label="Player 1 Faction"
              value={p0Faction}
              onChange={setP0Faction}
            />
          </div>
          <div className="space-y-3 panel-leather rounded-lg p-4">
            <input
              className="w-full bg-stone-950/80 border border-amber-800/60 rounded px-3 py-2 text-amber-100 font-display tracking-widest focus:outline-none focus:border-amber-400"
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              placeholder="Player 2 name"
            />
            <DeckSelect
              label="Player 2 Faction"
              value={p1Faction}
              onChange={setP1Faction}
            />
          </div>
        </div>

        <div className="text-center">
          <button
            disabled={!canStart}
            onClick={() => startGame(p0Faction!, p1Faction!, p0Name, p1Name)}
            className="px-8 py-3 rounded panel-leather border border-amber-500 text-amber-200 font-display tracking-[0.3em] hover:text-amber-100 hover:glow-active disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            BEGIN MATCH
          </button>
        </div>
      </div>
    </main>
  );
}
