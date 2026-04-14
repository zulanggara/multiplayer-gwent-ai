import { nanoid } from "nanoid";
import type {
  Action,
  Board,
  Card,
  Faction,
  GameState,
  PlayerState,
  Row,
  UnitCard,
  WeatherEffect,
} from "@/types/game";
import { DECKS, type CardTemplate } from "@/data/cards";

const INITIAL_HAND_SIZE = 10;

export function buildDeck(faction: Faction): Card[] {
  const templates = DECKS[faction].templates;
  return templates.map((t) => instantiate(t));
}

function instantiate(template: CardTemplate): Card {
  return { ...template, instanceId: nanoid(8) } as Card;
}

export function shuffle<T>(arr: T[], seed?: number): T[] {
  const a = [...arr];
  let random = seed ?? Math.random();
  const rng = () => {
    // simple LCG — good enough for shuffling cards
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor((seed === undefined ? Math.random() : rng()) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawCards(deck: Card[], count: number): { drawn: Card[]; deck: Card[] } {
  const drawn = deck.slice(0, count);
  return { drawn, deck: deck.slice(count) };
}

export function emptyBoard(): Board {
  return { melee: [], ranged: [], siege: [] };
}

export function createPlayer(id: string, name: string, faction: Faction): PlayerState {
  const deck = shuffle(buildDeck(faction));
  const { drawn, deck: rest } = drawCards(deck, INITIAL_HAND_SIZE);
  return {
    id,
    name,
    faction,
    deck: rest,
    hand: drawn,
    board: emptyBoard(),
    graveyard: [],
    roundsWon: 0,
    passed: false,
    lives: 2,
  };
}

export function createGame(
  roomId: string,
  mode: "local" | "online",
  p0: { id: string; name: string; faction: Faction },
  p1: { id: string; name: string; faction: Faction },
): GameState {
  return {
    roomId,
    mode,
    players: [
      createPlayer(p0.id, p0.name, p0.faction),
      createPlayer(p1.id, p1.name, p1.faction),
    ],
    currentPlayer: Math.random() < 0.5 ? 0 : 1,
    round: 1,
    status: "playing",
    weather: {
      biting_frost: false,
      impenetrable_fog: false,
      torrential_rain: false,
    },
    roundWinner: null,
    matchWinner: null,
    log: ["Match started — best of 3 rounds"],
    version: 0,
    updatedAt: Date.now(),
  };
}

// ---- Scoring ------------------------------------------------------------

export function cardStrength(
  card: UnitCard,
  row: Row,
  weather: GameState["weather"],
  hornInRow: boolean,
): number {
  if (card.type === "hero") return card.strength;
  const weatherActive =
    (row === "melee" && weather.biting_frost) ||
    (row === "ranged" && weather.impenetrable_fog) ||
    (row === "siege" && weather.torrential_rain);
  let strength = weatherActive ? 1 : card.strength;
  if (hornInRow) strength *= 2;
  return strength;
}

export function rowScore(cards: Card[], row: Row, weather: GameState["weather"]): number {
  const horn = cards.some((c) => c.type === "special" && c.ability === "commanders_horn");
  const units = cards.filter((c): c is UnitCard => c.type === "unit" || c.type === "hero");
  return units.reduce((sum, c) => sum + cardStrength(c, row, weather, horn), 0);
}

export function playerScore(player: PlayerState, weather: GameState["weather"]): number {
  return (
    rowScore(player.board.melee, "melee", weather) +
    rowScore(player.board.ranged, "ranged", weather) +
    rowScore(player.board.siege, "siege", weather)
  );
}

// ---- Actions ------------------------------------------------------------

export function findCardInHand(player: PlayerState, instanceId: string): Card | undefined {
  return player.hand.find((c) => c.instanceId === instanceId);
}

export function applyAction(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "play_card":
      return playCard(state, action.playerIndex, action.instanceId);
    case "pass":
      return passTurn(state, action.playerIndex);
    default:
      return state;
  }
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function log(state: GameState, msg: string): void {
  state.log.push(msg);
  if (state.log.length > 40) state.log.shift();
}

export function playCard(
  state: GameState,
  playerIndex: 0 | 1,
  instanceId: string,
): GameState {
  if (state.status !== "playing") return state;
  if (state.currentPlayer !== playerIndex) return state;
  const next = clone(state);
  const player = next.players[playerIndex];
  if (player.passed) return state;
  const cardIdx = player.hand.findIndex((c) => c.instanceId === instanceId);
  if (cardIdx < 0) return state;
  const card = player.hand[cardIdx];
  player.hand.splice(cardIdx, 1);

  if (card.type === "weather") {
    applyWeather(next, card.effect);
    // weather cards go to graveyard of playing player
    player.graveyard.push(card);
    log(next, `${player.name} played ${card.name}`);
  } else if (card.type === "special") {
    applySpecial(next, playerIndex, card);
  } else {
    const row = card.row;
    player.board[row].push(card);
    log(next, `${player.name} played ${card.name} (${row})`);
  }

  next.version += 1;
  next.updatedAt = Date.now();

  advanceTurn(next);
  return next;
}

export function passTurn(state: GameState, playerIndex: 0 | 1): GameState {
  if (state.status !== "playing") return state;
  if (state.currentPlayer !== playerIndex) return state;
  const next = clone(state);
  const player = next.players[playerIndex];
  if (player.passed) return state;
  player.passed = true;
  log(next, `${player.name} passed`);
  next.version += 1;
  next.updatedAt = Date.now();
  advanceTurn(next);
  return next;
}

function applyWeather(state: GameState, effect: WeatherEffect): void {
  if (effect === "clear_weather") {
    state.weather = {
      biting_frost: false,
      impenetrable_fog: false,
      torrential_rain: false,
    };
  } else {
    state.weather[effect] = true;
  }
}

function applySpecial(
  state: GameState,
  playerIndex: 0 | 1,
  card: Card,
): void {
  if (card.type !== "special") return;
  const player = state.players[playerIndex];
  player.graveyard.push(card);
  switch (card.ability) {
    case "scorch":
      scorch(state);
      log(state, `${player.name} played Scorch`);
      break;
    case "commanders_horn": {
      // default: put horn on melee row of current player
      player.board.melee.push(card);
      // remove from graveyard since it stays in play
      player.graveyard.pop();
      log(state, `${player.name} played Commander's Horn on melee`);
      break;
    }
    case "decoy":
      // not implemented here in the simple engine
      log(state, `${player.name} played Decoy (no-op)`);
      break;
    case "clear_weather":
      applyWeather(state, "clear_weather");
      log(state, `${player.name} played Clear Weather`);
      break;
  }
}

function scorch(state: GameState): void {
  // find highest strength non-hero on the board across all rows/players
  let max = -Infinity;
  const allSpots: {
    player: 0 | 1;
    row: Row;
    idx: number;
    strength: number;
    card: UnitCard;
  }[] = [];
  for (const pi of [0, 1] as const) {
    const p = state.players[pi];
    (["melee", "ranged", "siege"] as Row[]).forEach((row) => {
      p.board[row].forEach((c, idx) => {
        if (c.type === "unit") {
          const horn = p.board[row].some(
            (x) => x.type === "special" && x.ability === "commanders_horn",
          );
          const str = cardStrength(c as UnitCard, row, state.weather, horn);
          allSpots.push({ player: pi, row, idx, strength: str, card: c as UnitCard });
          if (str > max) max = str;
        }
      });
    });
  }
  if (max === -Infinity || max <= 0) return;
  const toRemove = allSpots.filter((s) => s.strength === max);
  // remove from boards highest-idx first so indices stay valid
  toRemove
    .sort((a, b) => b.idx - a.idx)
    .forEach(({ player, row, idx, card }) => {
      const p = state.players[player];
      p.board[row].splice(idx, 1);
      p.graveyard.push(card);
    });
}

function advanceTurn(state: GameState): void {
  const [p0, p1] = state.players;
  const bothPassed = p0.passed && p1.passed;
  const bothEmptyAndPassed = bothPassed;
  if (bothEmptyAndPassed) {
    finishRound(state);
    return;
  }
  const other = (state.currentPlayer === 0 ? 1 : 0) as 0 | 1;
  const otherPlayer = state.players[other];
  if (otherPlayer.passed) {
    // play stays with current player; but if current also passed, round ends
    const cur = state.players[state.currentPlayer];
    if (cur.passed) {
      finishRound(state);
      return;
    }
    // current keeps turn
    return;
  }
  state.currentPlayer = other;
}

function finishRound(state: GameState): void {
  const s0 = playerScore(state.players[0], state.weather);
  const s1 = playerScore(state.players[1], state.weather);
  let winner: 0 | 1 | "draw";
  if (s0 > s1) {
    winner = 0;
    state.players[0].roundsWon += 1;
    state.players[1].lives -= 1;
  } else if (s1 > s0) {
    winner = 1;
    state.players[1].roundsWon += 1;
    state.players[0].lives -= 1;
  } else {
    winner = "draw";
    state.players[0].lives -= 1;
    state.players[1].lives -= 1;
  }
  state.roundWinner = winner;
  log(
    state,
    winner === "draw"
      ? `Round ${state.round} drawn (${s0}-${s1})`
      : `Round ${state.round} won by ${state.players[winner].name} (${s0}-${s1})`,
  );

  // check match end
  if (
    state.players[0].lives <= 0 ||
    state.players[1].lives <= 0 ||
    state.round >= 3
  ) {
    finishMatch(state);
    return;
  }

  state.status = "round_over";
}

function finishMatch(state: GameState): void {
  const p0 = state.players[0];
  const p1 = state.players[1];
  if (p0.roundsWon > p1.roundsWon) state.matchWinner = 0;
  else if (p1.roundsWon > p0.roundsWon) state.matchWinner = 1;
  else state.matchWinner = "draw";
  state.status = "finished";
  log(
    state,
    state.matchWinner === "draw"
      ? "Match ended in a draw"
      : `${state.players[state.matchWinner as 0 | 1].name} wins the match!`,
  );
}

export function startNextRound(state: GameState): GameState {
  if (state.status !== "round_over") return state;
  const next = clone(state);
  next.round += 1;
  next.status = "playing";
  // clear boards to graveyard
  for (const p of next.players) {
    (["melee", "ranged", "siege"] as Row[]).forEach((row) => {
      p.graveyard.push(...p.board[row]);
      p.board[row] = [];
    });
    p.passed = false;
  }
  next.weather = {
    biting_frost: false,
    impenetrable_fog: false,
    torrential_rain: false,
  };
  next.roundWinner = null;
  // loser of previous round (or random on draw) starts
  if (state.roundWinner === "draw" || state.roundWinner == null) {
    next.currentPlayer = Math.random() < 0.5 ? 0 : 1;
  } else {
    next.currentPlayer = (state.roundWinner === 0 ? 1 : 0) as 0 | 1;
  }
  next.version += 1;
  next.updatedAt = Date.now();
  log(next, `Round ${next.round} begins`);
  return next;
}
