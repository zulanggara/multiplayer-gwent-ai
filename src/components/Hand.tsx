"use client";

import clsx from "clsx";
import { AnimatePresence } from "framer-motion";
import type { Card } from "@/types/game";
import { CardView } from "./Card";

interface Props {
  cards: Card[];
  faceDown?: boolean;
  canPlay?: boolean;
  onPlay?: (instanceId: string) => void;
  label?: string;
  selectedId?: string | null;
}

export function Hand({
  cards,
  faceDown,
  canPlay,
  onPlay,
  label,
  selectedId,
}: Props) {
  return (
    <div className="w-full">
      {label && (
        <div className="text-center text-[10px] font-display tracking-[0.3em] text-amber-300/80 mb-1">
          {label}
        </div>
      )}
      <div
        className={clsx(
          "flex gap-2 justify-center items-end flex-wrap min-h-[120px] py-2 px-3",
          "rounded-lg",
          canPlay
            ? "bg-gradient-to-t from-amber-950/30 via-amber-900/10 to-transparent"
            : "bg-gradient-to-t from-black/40 to-transparent",
        )}
      >
        <AnimatePresence mode="popLayout">
          {cards.length === 0 && (
            <div className="text-amber-200/40 italic font-serif">No cards</div>
          )}
          {cards.map((c) => (
            <CardView
              key={c.instanceId}
              card={c}
              size="md"
              faceDown={faceDown}
              playable={canPlay}
              selected={selectedId === c.instanceId}
              onClick={
                canPlay && onPlay ? () => onPlay(c.instanceId) : undefined
              }
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
