"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Board } from "@/components/Board";
import { Hand } from "@/components/Hand";
import { GameLog } from "@/components/GameLog";
import { useLocalGame } from "@/store/localGame";

export function LocalGame() {
  const { game, revealed, dispatch, nextRound, toggleReveal, reset } =
    useLocalGame();
  const [selectedId] = useState<string | null>(null);
  if (!game) return null;

  const currentPlayer = game.players[game.currentPlayer];
  const opponent = game.players[game.currentPlayer === 0 ? 1 : 0];
  const canAct = game.status === "playing" && !currentPlayer.passed;

  if (game.status === "finished") {
    const winner = game.matchWinner;
    return (
      <div className="w-full max-w-5xl mx-auto space-y-4">
        <Board state={game} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center panel-leather rounded p-8 mt-4"
        >
          <h2 className="font-display text-4xl gold-shimmer mb-2 tracking-widest">
            MATCH OVER
          </h2>
          <p className="text-xl text-amber-100 font-serif italic">
            {winner === "draw"
              ? "It's a draw!"
              : `${game.players[winner as 0 | 1].name} is victorious!`}
          </p>
          <button
            onClick={reset}
            className="mt-6 px-6 py-2 rounded panel-leather border border-amber-500 text-amber-200 font-display tracking-widest hover:text-amber-100 hover:glow-active transition"
          >
            NEW MATCH
          </button>
        </motion.div>
      </div>
    );
  }

  if (game.status === "round_over") {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-4">
        <Board state={game} />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="text-center panel-leather rounded p-6"
        >
          <h2 className="font-display text-2xl text-amber-300 tracking-widest">
            ROUND {game.round} COMPLETE
          </h2>
          <p className="text-amber-100 mt-2 font-serif italic">
            {game.roundWinner === "draw"
              ? "The round was drawn."
              : `${game.players[game.roundWinner as 0 | 1].name} claimed the round.`}
          </p>
          <button
            onClick={nextRound}
            className="mt-4 px-6 py-2 rounded panel-leather border border-amber-500 text-amber-200 font-display tracking-widest hover:text-amber-100 hover:glow-active transition"
          >
            BEGIN ROUND {game.round + 1}
          </button>
        </motion.div>
      </div>
    );
  }

  if (!revealed) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <Board state={game} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center panel-leather rounded p-8 mt-4"
        >
          <p className="text-amber-200/70 text-xs font-display tracking-[0.3em]">
            PASS THE DEVICE TO
          </p>
          <h2 className="font-display text-3xl text-amber-300 my-2 tracking-widest">
            {currentPlayer.name.toUpperCase()}
          </h2>
          <p className="text-amber-100/70 text-sm mb-4 capitalize italic font-serif">
            {currentPlayer.faction.replace("_", " ")}
          </p>
          <button
            onClick={() => toggleReveal(true)}
            className="px-6 py-2 rounded panel-leather border border-amber-500 text-amber-200 font-display tracking-widest hover:text-amber-100 hover:glow-active transition"
          >
            REVEAL MY HAND
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3">
      <div className="flex justify-between items-center gap-4">
        <div className="text-amber-200/80 text-sm font-display tracking-widest">
          ROUND {game.round} · {currentPlayer.name.toUpperCase()}&apos;S TURN
        </div>
        <div className="flex gap-2">
          <button
            disabled={!canAct}
            onClick={() => {
              dispatch({ type: "pass", playerIndex: game.currentPlayer });
            }}
            className="px-4 py-1.5 rounded panel-leather border border-amber-600/60 text-amber-200 font-display tracking-widest hover:text-amber-100 hover:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs"
          >
            PASS
          </button>
        </div>
      </div>

      <Hand
        cards={opponent.hand}
        faceDown
        label={`${opponent.name.toUpperCase()} · OPPONENT`}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={`round-${game.round}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Board state={game} />
        </motion.div>
      </AnimatePresence>
      <Hand
        cards={currentPlayer.hand}
        canPlay={canAct}
        onPlay={(id) => {
          dispatch({
            type: "play_card",
            playerIndex: game.currentPlayer,
            instanceId: id,
          });
        }}
        label={`${currentPlayer.name.toUpperCase()} · YOUR HAND`}
        selectedId={selectedId}
      />

      <div className="flex justify-center mt-2">
        <GameLog log={game.log} />
      </div>
    </div>
  );
}
