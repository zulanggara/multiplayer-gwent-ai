"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { Faction } from "@/types/game";
import { AVAILABLE_FACTIONS, DECKS } from "@/data/cards";

interface Props {
  value: Faction | null;
  onChange: (f: Faction) => void;
  label: string;
}

const factionAccent: Record<Faction, string> = {
  northern_realms: "from-sky-900/80 via-blue-950/60 to-stone-950",
  monsters: "from-red-900/80 via-stone-950 to-stone-950",
  nilfgaard: "from-yellow-900/70 via-amber-950/60 to-stone-950",
  scoiatael: "from-emerald-900/70 via-green-950/60 to-stone-950",
};

export function DeckSelect({ value, onChange, label }: Props) {
  return (
    <div className="space-y-3">
      <div className="text-amber-300/80 text-[10px] font-display tracking-[0.3em]">
        {label.toUpperCase()}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {AVAILABLE_FACTIONS.map((f) => {
          const deck = DECKS[f];
          const selected = value === f;
          return (
            <motion.button
              key={f}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(f)}
              className={clsx(
                "text-left p-4 rounded-lg bg-gradient-to-br text-amber-50 transition-all border relative overflow-hidden",
                factionAccent[f],
                selected
                  ? "border-amber-300 glow-active"
                  : "border-amber-900/40 hover:border-amber-500",
              )}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                }}
              />
              <div className="relative font-display text-lg tracking-widest">
                {deck.name.toUpperCase()}
              </div>
              <div className="relative text-xs text-amber-100/80 mt-1 font-serif italic">
                {deck.description}
              </div>
              <div className="relative text-[10px] text-amber-300/70 mt-2 font-display tracking-widest">
                {deck.templates.length} CARDS
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
