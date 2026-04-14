"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import type { Card, Row as RowType, Weather } from "@/types/game";
import { rowScore } from "@/lib/engine";
import { CardView } from "./Card";
import { AnimatedScore } from "./AnimatedScore";

interface Props {
  row: RowType;
  cards: Card[];
  weather: Weather;
  mirrored?: boolean;
}

const rowLabel: Record<RowType, string> = {
  melee: "Close Combat",
  ranged: "Ranged",
  siege: "Siege",
};

const rowIcon: Record<RowType, string> = {
  melee: "⚔",
  ranged: "🏹",
  siege: "🏰",
};

const rowBorder: Record<RowType, string> = {
  melee: "border-red-900/60",
  ranged: "border-emerald-900/60",
  siege: "border-sky-900/60",
};

const rowTint: Record<RowType, string> = {
  melee: "row-melee-tint",
  ranged: "row-ranged-tint",
  siege: "row-siege-tint",
};

function isWeatherActive(row: RowType, w: Weather): boolean {
  if (row === "melee") return w.biting_frost;
  if (row === "ranged") return w.impenetrable_fog;
  return w.torrential_rain;
}

export function RowView({ row, cards, weather, mirrored }: Props) {
  const score = rowScore(cards, row, weather);
  const active = isWeatherActive(row, weather);
  const hasHorn = cards.some(
    (c) => c.type === "special" && c.ability === "commanders_horn",
  );
  return (
    <div
      className={clsx(
        "relative flex items-center gap-2 px-2 py-1 min-h-[110px] border-y-2",
        rowBorder[row],
        rowTint[row],
      )}
    >
      {active && (
        <div className="absolute inset-0 weather-overlay pointer-events-none" />
      )}
      {/* Row score / label capsule */}
      <div
        className={clsx(
          "relative z-10 flex flex-col items-center justify-center w-16 shrink-0",
          "panel-leather rounded-md py-1.5 px-1",
        )}
      >
        <div className="text-xl leading-none drop-shadow">{rowIcon[row]}</div>
        <div className="font-display text-[8px] text-amber-200/80 mt-0.5">
          {rowLabel[row]}
        </div>
        <AnimatedScore
          value={score}
          className={clsx(
            "mt-1 w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm",
            "bg-gradient-to-br from-amber-200 to-amber-500 text-amber-950 ring-2 ring-amber-500 shadow",
          )}
        />
        <div className="h-3 mt-0.5 text-[8px] font-display tracking-wider">
          {hasHorn && <span className="text-amber-300">HORN</span>}
          {active && !hasHorn && <span className="text-sky-300">WEATHER</span>}
        </div>
      </div>
      {/* Cards */}
      <div
        className={clsx(
          "relative z-10 flex-1 flex gap-1 items-center overflow-x-auto min-h-[100px] py-1",
          mirrored && "flex-row-reverse",
        )}
      >
        <AnimatePresence mode="popLayout">
          {cards.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-amber-200/20 text-xs w-full text-center italic font-serif"
            >
              empty
            </motion.div>
          )}
          {cards.map((c) => (
            <CardView key={c.instanceId} card={c} size="sm" />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
