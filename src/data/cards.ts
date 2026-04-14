import type {
  Card,
  Faction,
  SpecialAbility,
  WeatherEffect,
  Row,
} from "@/types/game";

export type CardTemplate = Omit<Card, "instanceId">;

const unit = (
  id: string,
  name: string,
  strength: number,
  row: Row,
  faction?: Faction,
  description?: string,
): CardTemplate => ({
  id,
  name,
  type: "unit",
  strength,
  row,
  faction,
  description,
} as CardTemplate);

const hero = (
  id: string,
  name: string,
  strength: number,
  row: Row,
  faction?: Faction,
  description?: string,
): CardTemplate => ({
  id,
  name,
  type: "hero",
  strength,
  row,
  isHero: true,
  faction,
  description,
} as CardTemplate);

const weather = (
  id: string,
  name: string,
  effect: WeatherEffect,
  description: string,
): CardTemplate => ({
  id,
  name,
  type: "weather",
  effect,
  description,
} as CardTemplate);

const special = (
  id: string,
  name: string,
  ability: SpecialAbility,
  description: string,
): CardTemplate => ({
  id,
  name,
  type: "special",
  ability,
  description,
} as CardTemplate);

export const NEUTRAL_TEMPLATES: CardTemplate[] = [
  weather("w_frost", "Biting Frost", "biting_frost", "Melee row strength = 1"),
  weather("w_fog", "Impenetrable Fog", "impenetrable_fog", "Ranged row strength = 1"),
  weather("w_rain", "Torrential Rain", "torrential_rain", "Siege row strength = 1"),
  weather("w_clear", "Clear Weather", "clear_weather", "Removes all weather"),
  special("s_scorch", "Scorch", "scorch", "Destroy strongest non-hero unit(s)"),
  special("s_horn", "Commander's Horn", "commanders_horn", "Doubles strength of a row"),
];

export const NORTHERN_REALMS_TEMPLATES: CardTemplate[] = [
  hero("nr_geralt", "Geralt of Rivia", 15, "melee", "northern_realms", "Hero"),
  hero("nr_ciri", "Cirilla", 15, "melee", "northern_realms", "Hero"),
  hero("nr_vernon", "Vernon Roche", 10, "melee", "northern_realms", "Hero"),
  unit("nr_blue_stripe_1", "Blue Stripes Commando", 4, "melee", "northern_realms"),
  unit("nr_blue_stripe_2", "Blue Stripes Commando", 4, "melee", "northern_realms"),
  unit("nr_poor_infantry_1", "Poor F'ing Infantry", 1, "melee", "northern_realms"),
  unit("nr_poor_infantry_2", "Poor F'ing Infantry", 1, "melee", "northern_realms"),
  unit("nr_poor_infantry_3", "Poor F'ing Infantry", 1, "melee", "northern_realms"),
  unit("nr_crinfrid_1", "Crinfrid Reaver", 5, "ranged", "northern_realms"),
  unit("nr_crinfrid_2", "Crinfrid Reaver", 5, "ranged", "northern_realms"),
  unit("nr_archer", "Kaedweni Archer", 1, "ranged", "northern_realms"),
  unit("nr_ballista", "Ballista", 6, "siege", "northern_realms"),
  unit("nr_catapult", "Catapult", 8, "siege", "northern_realms"),
  unit("nr_trebuchet", "Trebuchet", 6, "siege", "northern_realms"),
  unit("nr_dethmold", "Dethmold", 6, "ranged", "northern_realms"),
  unit("nr_knight_1", "Redanian Knight", 4, "melee", "northern_realms"),
  unit("nr_knight_2", "Redanian Knight", 4, "melee", "northern_realms"),
  unit("nr_dandelion", "Dandelion", 2, "melee", "northern_realms"),
  unit("nr_yarpen", "Yarpen Zigrin", 2, "melee", "northern_realms"),
  unit("nr_sigismund", "Sigismund Dijkstra", 4, "melee", "northern_realms"),
  unit("nr_philippa", "Philippa Eilhart", 10, "ranged", "northern_realms"),
  unit("nr_sheldon", "Sheldon Skaggs", 4, "melee", "northern_realms"),
  unit("nr_siegfried", "Siegfried of Denesle", 5, "melee", "northern_realms"),
  ...NEUTRAL_TEMPLATES,
];

export const MONSTERS_TEMPLATES: CardTemplate[] = [
  hero("mon_imlerith", "Imlerith", 10, "melee", "monsters", "Hero"),
  hero("mon_eredin", "Eredin", 10, "melee", "monsters", "Hero"),
  hero("mon_kayran", "Kayran", 8, "melee", "monsters", "Hero"),
  unit("mon_ghoul_1", "Ghoul", 1, "melee", "monsters"),
  unit("mon_ghoul_2", "Ghoul", 1, "melee", "monsters"),
  unit("mon_ghoul_3", "Ghoul", 1, "melee", "monsters"),
  unit("mon_nekker_1", "Nekker", 2, "melee", "monsters"),
  unit("mon_nekker_2", "Nekker", 2, "melee", "monsters"),
  unit("mon_nekker_3", "Nekker", 2, "melee", "monsters"),
  unit("mon_werewolf", "Werewolf", 5, "melee", "monsters"),
  unit("mon_foglet_1", "Foglet", 2, "ranged", "monsters"),
  unit("mon_foglet_2", "Foglet", 2, "ranged", "monsters"),
  unit("mon_harpy", "Harpy", 2, "ranged", "monsters"),
  unit("mon_wyvern", "Wyvern", 2, "ranged", "monsters"),
  unit("mon_cockatrice", "Cockatrice", 2, "ranged", "monsters"),
  unit("mon_fiend", "Fiend", 6, "melee", "monsters"),
  unit("mon_forktail", "Forktail", 2, "melee", "monsters"),
  unit("mon_endrega", "Endrega", 2, "melee", "monsters"),
  unit("mon_arachas_1", "Arachas", 4, "siege", "monsters"),
  unit("mon_arachas_2", "Arachas", 4, "siege", "monsters"),
  unit("mon_arachas_3", "Arachas", 4, "siege", "monsters"),
  unit("mon_katakan", "Katakan", 5, "melee", "monsters"),
  unit("mon_griffin", "Griffin", 5, "ranged", "monsters"),
  ...NEUTRAL_TEMPLATES,
];

export const DECKS: Record<
  Faction,
  { name: string; description: string; templates: CardTemplate[]; color: string }
> = {
  northern_realms: {
    name: "Northern Realms",
    description: "Armies of the North — disciplined commanders and deadly siege engines.",
    templates: NORTHERN_REALMS_TEMPLATES,
    color: "from-blue-900 to-blue-700",
  },
  monsters: {
    name: "Monsters",
    description: "Creatures of the night with overwhelming numbers.",
    templates: MONSTERS_TEMPLATES,
    color: "from-red-900 to-red-700",
  },
  nilfgaard: {
    name: "Nilfgaard",
    description: "(Coming soon)",
    templates: NORTHERN_REALMS_TEMPLATES,
    color: "from-yellow-900 to-yellow-700",
  },
  scoiatael: {
    name: "Scoia'tael",
    description: "(Coming soon)",
    templates: MONSTERS_TEMPLATES,
    color: "from-green-900 to-green-700",
  },
};

export const AVAILABLE_FACTIONS: Faction[] = ["northern_realms", "monsters"];
