"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { RoomRecord } from "@/types/room";
import type { Faction } from "@/types/game";
import { DeckSelect } from "@/components/DeckSelect";
import { Board } from "@/components/Board";
import { Hand } from "@/components/Hand";
import { GameLog } from "@/components/GameLog";

interface Props {
  roomId: string;
}

interface RoomResponse {
  room: RoomRecord;
  viewerIndex: 0 | 1 | -1;
}

const POLL_MS = 1500;

export function OnlineRoom({ roomId }: Props) {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [data, setData] = useState<RoomResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`gwent:room:${roomId}`);
    setPlayerId(stored);
  }, [roomId]);

  const fetchRoom = useCallback(async () => {
    try {
      const url = playerId
        ? `/api/room/${roomId}?playerId=${playerId}`
        : `/api/room/${roomId}`;
      const res = await fetch(url);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as RoomResponse;
      setData(json);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [roomId, playerId]);

  useEffect(() => {
    fetchRoom();
    const id = setInterval(fetchRoom, POLL_MS);
    return () => clearInterval(id);
  }, [fetchRoom]);

  async function post(action: unknown) {
    if (!playerId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/room/${roomId}/action`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerId, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-amber-200/70">
          {error ? (
            <div className="text-red-300">{error}</div>
          ) : (
            "Connecting to room…"
          )}
        </div>
      </main>
    );
  }

  const { room, viewerIndex } = data;
  const inRoom = viewerIndex === 0 || viewerIndex === 1;

  // Spectator or not joined yet: show room info and allow ghost-mode viewing
  if (!inRoom) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center">
        <div className="max-w-md text-center space-y-4">
          <Link href="/online" className="text-amber-300 text-sm">
            ← Lobby
          </Link>
          <h1 className="text-2xl text-amber-200">Room {roomId}</h1>
          <p className="text-amber-100/70 text-sm">
            You are viewing this room as a spectator or your session was lost.
            Use the lobby to join with a new session.
          </p>
        </div>
      </main>
    );
  }

  // Lobby: waiting for second player + faction selection
  if (room.status === "lobby" || !room.game) {
    const mySeat = room.seats[viewerIndex];
    const oppSeat = room.seats[viewerIndex === 0 ? 1 : 0];
    return (
      <main className="min-h-screen p-6 flex flex-col items-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/online" className="text-amber-300 text-sm">
              ← Lobby
            </Link>
            <h1 className="text-2xl text-amber-200">Room {roomId}</h1>
            <div />
          </div>

          <div className="text-center">
            <p className="text-amber-100/60 text-sm">Share this code:</p>
            <p className="text-4xl font-bold tracking-widest text-amber-300 my-2">
              {roomId}
            </p>
            <button
              onClick={() => navigator.clipboard?.writeText(roomId)}
              className="text-xs text-amber-200 underline"
            >
              Copy
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-stone-900/70 p-4 rounded border border-amber-700/40">
              <div className="font-semibold text-amber-200">You</div>
              <div className="text-sm text-amber-100/70">{mySeat?.name}</div>
              <div className="text-[10px] text-amber-200/60 mt-1">
                {mySeat?.faction ? `Faction: ${mySeat.faction}` : "Choose your faction"}
              </div>
              {mySeat?.ready ? (
                <div className="mt-2 text-emerald-300 text-xs">Ready</div>
              ) : null}
            </div>
            <div className="bg-stone-900/70 p-4 rounded border border-amber-700/40">
              <div className="font-semibold text-amber-200">Opponent</div>
              {oppSeat ? (
                <>
                  <div className="text-sm text-amber-100/70">{oppSeat.name}</div>
                  <div className="text-[10px] text-amber-200/60 mt-1">
                    {oppSeat.ready ? "Ready" : "Choosing…"}
                  </div>
                </>
              ) : (
                <div className="text-amber-200/60 text-sm italic">
                  Waiting for opponent…
                </div>
              )}
            </div>
          </div>

          {!mySeat?.ready && (
            <DeckSelect
              label="Your faction"
              value={mySeat?.faction ?? null}
              onChange={(f: Faction) =>
                post({ type: "set_faction", faction: f })
              }
            />
          )}

          {error && (
            <div className="text-red-300 text-sm">{error}</div>
          )}
        </div>
      </main>
    );
  }

  // Playing / round_over / finished
  const game = room.game;
  const me = game.players[viewerIndex];
  const opp = game.players[viewerIndex === 0 ? 1 : 0];
  const isMyTurn = game.currentPlayer === viewerIndex;
  const canAct = game.status === "playing" && !me.passed && isMyTurn;

  // Flip display so "me" is always on the bottom
  const displayState = viewerIndex === 0 ? game : {
    ...game,
    players: [game.players[1], game.players[0]] as [typeof game.players[0], typeof game.players[1]],
    currentPlayer: (game.currentPlayer === 0 ? 1 : 0) as 0 | 1,
  };

  return (
    <main className="min-h-screen p-4">
      <div className="flex items-center justify-between max-w-5xl mx-auto mb-3">
        <Link href="/" className="text-amber-300 hover:text-amber-200 text-sm font-display tracking-widest">
          ← HOME
        </Link>
        <div className="text-amber-200/80 text-xs font-display tracking-widest flex items-center gap-2">
          ROOM {roomId} · ROUND {game.round}
          {isMyTurn && game.status === "playing" && (
            <span className="ml-1 px-2 py-0.5 bg-amber-950/70 border border-amber-500/80 rounded text-amber-200 tracking-widest turn-pulse">
              YOUR TURN
            </span>
          )}
        </div>
        <button
          disabled={busy || !canAct}
          onClick={() => post({ type: "pass" })}
          className="px-4 py-1.5 rounded panel-leather border border-amber-600/60 text-amber-200 font-display tracking-widest hover:text-amber-100 hover:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs"
        >
          PASS
        </button>
      </div>

      <div className="space-y-3 max-w-5xl mx-auto">
        <Hand cards={opp.hand} faceDown label={`${opp.name.toUpperCase()} · OPPONENT`} />
        <Board state={displayState} />
        <Hand
          cards={me.hand}
          canPlay={canAct}
          onPlay={(id) => post({ type: "play_card", instanceId: id })}
          label={`${me.name.toUpperCase()} · YOUR HAND`}
        />

        {game.status === "round_over" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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
              onClick={() => post({ type: "next_round" })}
              className="mt-4 px-6 py-2 rounded panel-leather border border-amber-500 text-amber-200 font-display tracking-widest hover:text-amber-100 hover:glow-active transition"
            >
              BEGIN ROUND {game.round + 1}
            </button>
          </motion.div>
        )}

        {game.status === "finished" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center panel-leather rounded p-8 mt-4"
          >
            <h2 className="font-display text-4xl gold-shimmer mb-2 tracking-widest">
              MATCH OVER
            </h2>
            <p className="text-xl text-amber-100 font-serif italic">
              {game.matchWinner === "draw"
                ? "It's a draw!"
                : `${game.players[game.matchWinner as 0 | 1].name} is victorious!`}
            </p>
            <Link
              href="/online"
              className="inline-block mt-6 px-6 py-2 rounded panel-leather border border-amber-500 text-amber-200 font-display tracking-widest hover:text-amber-100 hover:glow-active transition"
            >
              BACK TO LOBBY
            </Link>
          </motion.div>
        )}

        <div className="flex justify-center">
          <GameLog log={game.log} />
        </div>
      </div>
    </main>
  );
}
