export type Row = "melee" | "ranged" | "siege";

export type CardType = "unit" | "hero" | "special" | "weather";

export type SpecialAbility =
  | "scorch"
  | "decoy"
  | "commanders_horn"
  | "clear_weather";

export type WeatherEffect =
  | "biting_frost"
  | "impenetrable_fog"
  | "torrential_rain"
  | "clear_weather";

export type Faction = "northern_realms" | "nilfgaard" | "scoiatael" | "monsters";

export interface BaseCard {
  id: string;
  instanceId: string;
  name: string;
  description?: string;
  type: CardType;
  faction?: Faction;
  art?: string;
}

export interface UnitCard extends BaseCard {
  type: "unit" | "hero";
  strength: number;
  row: Row;
  isHero?: boolean;
}

export interface SpecialCard extends BaseCard {
  type: "special";
  ability: SpecialAbility;
}

export interface WeatherCard extends BaseCard {
  type: "weather";
  effect: WeatherEffect;
}

export type Card = UnitCard | SpecialCard | WeatherCard;

export interface Board {
  melee: Card[];
  ranged: Card[];
  siege: Card[];
}

export interface PlayerState {
  id: string;
  name: string;
  faction: Faction;
  deck: Card[];
  hand: Card[];
  board: Board;
  graveyard: Card[];
  roundsWon: number;
  passed: boolean;
  lives: number;
}

export type Weather = {
  biting_frost: boolean;
  impenetrable_fog: boolean;
  torrential_rain: boolean;
};

export interface GameState {
  roomId: string;
  mode: "local" | "online";
  players: [PlayerState, PlayerState];
  currentPlayer: 0 | 1;
  round: number;
  status: "waiting" | "deck_selection" | "playing" | "round_over" | "finished";
  weather: Weather;
  roundWinner?: 0 | 1 | "draw" | null;
  matchWinner?: 0 | 1 | "draw" | null;
  log: string[];
  version: number;
  updatedAt: number;
}

export type Action =
  | { type: "play_card"; playerIndex: 0 | 1; instanceId: string; targetRow?: Row }
  | { type: "pass"; playerIndex: 0 | 1 }
  | { type: "start_round"; playerIndex: 0 | 1 }
  | { type: "start_game" };
