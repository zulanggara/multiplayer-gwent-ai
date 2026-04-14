# Gwent Classic — Web App

A fan-made, non-commercial re-implementation of **Gwent Classic** (The Witcher 3 mini-game) as a fully serverless web app.

Built with:

- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS** for styling
- **Zustand** for client state (local mode)
- **Upstash Redis** for room/game state (online mode)
- Deployable to **Vercel** with no long-running servers

## Features

- **Local multiplayer** — two players on one device, alternating turns with a hidden-hand handoff screen.
- **Online multiplayer** — create a room code, share it, play across devices. State lives in Redis; clients poll every 1.5 s.
- **Best of 3 rounds** with 2 lives per player.
- **Three rows**: melee, ranged, siege.
- **Card types**: unit, hero (immune to weather & abilities), special, weather.
- **Abilities**: Scorch, Commander's Horn, weather (Biting Frost / Fog / Rain), Clear Weather.
- **Pass mechanic** — passing in the current round ends your involvement in it.
- **Deck selection** — two playable factions out of the box (Northern Realms, Monsters).
- **Event log** of every action.

## Structure

```
src/
  app/
    page.tsx                 # Home / mode select
    local/                   # Local multiplayer flow
    online/                  # Room lobby + online game
    api/room/…               # Serverless endpoints
  components/                # Card, Row, Board, Hand, GameLog, DeckSelect
  lib/
    engine.ts                # Pure game logic (actions, scoring, rounds)
    redis.ts                 # Upstash client + dev in-memory fallback
    rooms.ts                 # Room lifecycle + per-viewer redaction
  store/
    localGame.ts             # Zustand store for local mode
  data/
    cards.ts                 # Card templates & deck definitions
  types/                     # TS interfaces
```

The **engine is a pure module**: every action is `applyAction(state, action) -> state`. Local and online modes share the same rule set — online, the server is the source of truth, and redaction hides the opponent's hand before sending state to the client.

## Running locally

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000.

### Online mode without Redis

If you don't configure Upstash, a process-local in-memory store is used as a fallback. This only works within a single Node process — perfect for dev on one machine, but **it will not work on Vercel production** (each serverless instance would have its own memory). Configure Upstash env vars for real deployment.

### Online mode with Upstash

1. Create a free Redis database at https://console.upstash.com/
2. Copy the REST URL and token
3. Create `.env.local`:

   ```
   UPSTASH_REDIS_REST_URL=https://…
   UPSTASH_REDIS_REST_TOKEN=…
   ```

4. Restart the dev server.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to the project environment variables.
4. Deploy — no further configuration needed. All routes are serverless.

## Gameplay notes

- **Scorch** removes the strongest non-hero unit(s) across both players' boards.
- **Commander's Horn** stays on the melee row of the player who plays it and doubles all unit strengths in that row.
- **Weather** sets all non-hero units in the affected row to strength 1. Clear Weather removes all active weather effects.
- **Heroes** (gold frame) are immune to weather, horns, and scorch.

## Roadmap

Not implemented (left as future work):

- Spy, Medic, Muster, Tight-Bond, Morale Boost abilities
- Decoy swap interaction
- AI opponent
- Ranked matchmaking / deck builder
- Upstash pub/sub channel (currently uses polling — swap for subscribe when ready)

## Credits

Data and gameplay inspired by [asundr/gwent-classic](https://github.com/asundr/gwent-classic). This project is a standalone re-implementation and is not affiliated with CD Projekt Red.
