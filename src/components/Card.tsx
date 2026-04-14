"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { Card as CardT } from "@/types/game";

interface Props {
  card: CardT;
  size?: "sm" | "md" | "lg";
  faceDown?: boolean;
  playable?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "w-14 h-20 text-[10px]",
  md: "w-20 h-28 text-xs",
  lg: "w-28 h-40 text-sm",
};

function rowTone(card: CardT): string {
  if (card.type !== "unit" && card.type !== "hero") return "";
  switch (card.row) {
    case "melee":
      return "from-red-950/70 via-red-900/50 to-stone-950";
    case "ranged":
      return "from-green-950/70 via-green-900/40 to-stone-950";
    case "siege":
      return "from-blue-950/70 via-blue-900/40 to-stone-950";
  }
}

function typeTint(card: CardT): string {
  if (card.type === "hero") return "from-amber-700/90 via-amber-900/70 to-stone-950";
  if (card.type === "weather") return "from-sky-950/80 via-slate-900/60 to-stone-950";
  if (card.type === "special") return "from-emerald-900/80 via-emerald-950/60 to-stone-950";
  return rowTone(card);
}

function frameRing(card: CardT): string {
  if (card.type === "hero") return "ring-2 ring-amber-400/90 shadow-[0_0_12px_rgba(245,200,114,0.45)]";
  if (card.type === "weather") return "ring-1 ring-sky-400/70";
  if (card.type === "special") return "ring-1 ring-emerald-400/70";
  return "ring-1 ring-amber-700/60";
}

function abilityIcon(card: CardT): string | null {
  if (card.type === "weather") {
    switch (card.effect) {
      case "biting_frost":
        return "❄";
      case "impenetrable_fog":
        return "☁";
      case "torrential_rain":
        return "🌧";
      case "clear_weather":
        return "☀";
    }
  }
  if (card.type === "special") {
    switch (card.ability) {
      case "scorch":
        return "🔥";
      case "commanders_horn":
        return "📯";
      case "decoy":
        return "⇄";
      case "clear_weather":
        return "☀";
    }
  }
  if (card.type === "hero") return "★";
  return null;
}

function rowGlyph(card: CardT): string | null {
  if (card.type !== "unit" && card.type !== "hero") return null;
  if (card.row === "melee") return "⚔";
  if (card.row === "ranged") return "🏹";
  return "🏰";
}

export function CardView({
  card,
  size = "md",
  faceDown,
  playable,
  selected,
  onClick,
}: Props) {
  if (faceDown) {
    return (
      <div
        className={clsx(
          sizeClasses[size],
          "relative rounded-md overflow-hidden shadow-lg",
          "bg-gradient-to-br from-[#2a1810] via-[#1a0f08] to-[#0a0604]",
          "ring-1 ring-amber-600/50",
        )}
      >
        <div className="absolute inset-1 rounded-sm border border-amber-600/40 flex items-center justify-center">
          <div className="font-display text-amber-400/80 text-xl drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]">
            G
          </div>
        </div>
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(245,200,114,0.3), transparent 60%)",
          }}
        />
      </div>
    );
  }

  const isUnit = card.type === "unit" || card.type === "hero";
  const icon = abilityIcon(card);
  const glyph = rowGlyph(card);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: -6, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      whileHover={
        onClick
          ? { y: -6, scale: 1.06, boxShadow: "0 8px 24px rgba(245,200,114,0.35)" }
          : undefined
      }
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      disabled={!onClick}
      className={clsx(
        sizeClasses[size],
        "relative rounded-md text-left overflow-hidden",
        "bg-gradient-to-b",
        typeTint(card),
        frameRing(card),
        playable && "cursor-pointer",
        selected && "ring-4 ring-amber-300",
        !onClick && "cursor-default",
      )}
      title={card.description ?? card.name}
    >
      {/* inner gold frame */}
      <div className="pointer-events-none absolute inset-[3px] rounded-[4px] border border-amber-600/40" />

      {/* subtle noise */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* strength */}
      {isUnit && (
        <div
          className={clsx(
            "absolute top-1 left-1 rounded-full flex items-center justify-center font-bold font-display shadow",
            size === "sm" ? "w-5 h-5 text-[11px]" : "w-7 h-7 text-sm",
            card.type === "hero"
              ? "bg-gradient-to-br from-amber-200 to-amber-500 text-amber-950 ring-2 ring-amber-100"
              : "bg-gradient-to-br from-amber-100 to-amber-300 text-amber-950 ring-1 ring-amber-700",
          )}
        >
          {card.strength}
        </div>
      )}

      {/* ability icon top-right */}
      {icon && (
        <div
          className={clsx(
            "absolute top-1 right-1 rounded-full flex items-center justify-center",
            size === "sm" ? "w-5 h-5 text-[11px]" : "w-6 h-6 text-sm",
            "bg-black/60 ring-1 ring-amber-500/60 text-amber-200",
          )}
          aria-label="ability"
        >
          {icon}
        </div>
      )}

      {/* row glyph on unit cards — middle */}
      {glyph && size !== "sm" && (
        <div className="absolute inset-0 flex items-center justify-center text-amber-300/15 text-5xl select-none">
          {glyph}
        </div>
      )}

      {/* name banner */}
      <div className="absolute inset-x-0 bottom-0">
        <div
          className={clsx(
            "px-1.5 py-0.5 text-center leading-tight font-display",
            "bg-gradient-to-t from-black/90 via-black/70 to-black/0",
            size === "sm" ? "text-[9px]" : "text-[10px]",
          )}
        >
          <div className="truncate text-amber-100">{card.name}</div>
          {size !== "sm" && (
            <div className="text-[8px] text-amber-300/70 uppercase tracking-widest">
              {card.type === "hero"
                ? "Hero"
                : card.type === "weather"
                  ? "Weather"
                  : card.type === "special"
                    ? "Special"
                    : card.row}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
