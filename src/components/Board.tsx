"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import type { GameState, PlayerState } from "@/types/game";
import { playerScore } from "@/lib/engine";
import { RowView } from "./Row";
import { AnimatedScore } from "./AnimatedScore";

interface Props {
  state: GameState;
}

function RoundTracker({
  player,
  top,
}: {
  player: PlayerState;
  top?: boolean;
}) {
  return (
    <div className={clsx("flex items-center gap-1", top && "order-last")}>
      {Array.from({ length: 2 }).map((_, i) => {
        const alive = i < player.lives;
        return (
          <motion.div
            key={i}
            initial={false}
            animate={{ scale: alive ? 1 : 0.8, opacity: alive ? 1 : 0.3 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={clsx(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              alive
                ? "border-amber-400 bg-gradient-to-br from-red-500 to-red-800 shadow-[0_0_6px_rgba(245,100,100,0.6)]"
                : "border-stone-700 bg-stone-900",
            )}
            title={`Life ${i + 1}`}
          >
            {alive && (
              <span className="text-[10px] text-amber-100 leading-none">
                ♥
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function ScorePanel({
  player,
  state,
  top,
  active,
}: {
  player: PlayerState;
  state: GameState;
  top?: boolean;
  active: boolean;
}) {
  const score = playerScore(player, state.weather);
  return (
    <div
      className={clsx(
        "relative flex items-center gap-3 px-4 py-2 panel-leather",
        top ? "border-b-2" : "border-t-2",
        "border-amber-700/60",
      )}
    >
      <div
        className={clsx(
          "relative w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-2xl",
          "bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 text-amber-950 ring-2 ring-amber-700",
          active && "turn-pulse",
        )}
      >
        <AnimatedScore value={score} />
      </div>
      <div className="flex flex-col min-w-[140px]">
        <span className="font-display text-amber-100 tracking-wider">
          {player.name}
        </span>
        <span className="text-[11px] text-amber-300/70 capitalize italic">
          {player.faction.replace("_", " ")}
        </span>
      </div>

      <RoundTracker player={player} top={top} />

      <div className="ml-auto flex items-center gap-3 text-xs text-amber-200/80 font-display">
        <div className="flex flex-col items-center">
          <span className="text-amber-300/60 text-[9px]">HAND</span>
          <span className="text-amber-100 text-sm">{player.hand.length}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-amber-300/60 text-[9px]">DECK</span>
          <span className="text-amber-100 text-sm">{player.deck.length}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-amber-300/60 text-[9px]">ROUNDS</span>
          <span className="text-amber-100 text-sm">{player.roundsWon}</span>
        </div>
        {player.passed && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-2 py-0.5 bg-red-950/80 border border-red-700/70 rounded text-red-200 font-display text-[10px] tracking-widest"
          >
            PASSED
          </motion.span>
        )}
        {active && state.status === "playing" && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-2 py-0.5 bg-amber-950/70 border border-amber-500/80 rounded text-amber-200 font-display text-[10px] tracking-widest"
          >
            TURN
          </motion.span>
        )}
      </div>
    </div>
  );
}

export function Board({ state }: Props) {
  const [p0, p1] = state.players;
  return (
    <motion.div
      layout
      className="relative w-full max-w-5xl mx-auto rounded-lg overflow-hidden panel-wood gold-border shadow-[0_10px_40px_rgba(0,0,0,0.7)]"
    >
      {/* top player */}
      <ScorePanel
        player={p1}
        state={state}
        top
        active={state.currentPlayer === 1}
      />
      <RowView row="siege" cards={p1.board.siege} weather={state.weather} mirrored />
      <RowView row="ranged" cards={p1.board.ranged} weather={state.weather} mirrored />
      <RowView row="melee" cards={p1.board.melee} weather={state.weather} mirrored />

      {/* central divider w/ round tracker */}
      <div className="relative bg-gradient-to-r from-amber-950 via-amber-700 to-amber-950 py-0.5">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="panel-leather rounded-full px-3 py-0.5 text-[10px] font-display tracking-[0.3em] text-amber-200 border border-amber-600/70">
            ROUND {state.round} · BEST OF 3
          </div>
        </div>
        <div className="h-[14px]" />
      </div>

      <RowView row="melee" cards={p0.board.melee} weather={state.weather} />
      <RowView row="ranged" cards={p0.board.ranged} weather={state.weather} />
      <RowView row="siege" cards={p0.board.siege} weather={state.weather} />

      {/* bottom player */}
      <ScorePanel
        player={p0}
        state={state}
        active={state.currentPlayer === 0}
      />
    </motion.div>
  );
}
