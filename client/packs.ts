import { JOHTO_BADGES, kantoBadges, RS_BADGES, EMERALD_BADGES, BW_BADGES, XY_BADGES, DP_BADGES, USUM_BADGES, B2W2_BADGES, PLATINUM_BADGES, SM_BADGES, ORAS_BADGES } from "../shared/milestones.ts";
// Everything that differs between games. Encounter data is generated per pack
// and loaded only when a playthrough of that game is opened.
import type { VersionId } from "../shared/versions";

export type GameData = {
  chapters: {
    title: string;
    needs: string[];
    kit?: string;
    places: string[];
  }[];
  events: {
    id: string;
    label: string;
    q: string;
    chap: number;
    after?: string[];
    by?: string;
  }[];
  dex: any[];
};
export type Pack = {
  load: () => Promise<GameData>;
  art: string;
  region: string;
  regional: number;
  national: number;
  start: string;
  starters: number[];
  badges: string[][];
  // what follows a badge name in the UI: "Zephyr Badge", "Normalium Z"
  badgeWord?: string;
  // what the set is called: "badges" unless the game has none
  badgesWord?: string;
  postgame?: [string, string[][]];
  kit: string[][];
  // HM kit id -> badge needed to use it outside battle
  hm: Record<string, string>;
  safari?: string[];
  nightFrom?: number;
  morningFrom?: number;
  boxes: [count: number, size: number];
};
export type Version = {
  platform?: string;
  cover?: string;
  clockOffset?: number;
  name: string;
  short: string;
  code: string;
  gen: string;
  pack: Pack;
  other?: string;
  ring: string[];
};

const ALOLA_KIT = [
  ["fishing-rod", "Fishing Rod"],
  ["tauros", "Tauros Charge"],
  ["surf", "Lapras Paddle"],
  ["mudsdale", "Mudsdale Gallop"],
  ["machamp", "Machamp Shove"],
  ["island-scan", "Island Scan"],
];
const JOHTO_KIT = [
  ["old-rod", "Old Rod"],
  ["headbutt", "Headbutt"],
  ["rock-smash", "Rock Smash"],
  ["surf", "Surf"],
  ["strength", "Strength"],
  ["good-rod", "Good Rod"],
  ["whirlpool", "Whirlpool"],
  ["waterfall", "Waterfall"],
  ["super-rod", "Super Rod"],
  ["bicycle", "Bicycle"],
];

const HGSS: Pack = {
  load: () => import("./data/hgss").then((m) => m.default),
  art: "hgss",
  region: "Johto",
  regional: 256,
  national: 493,
  start: "New Bark Town",
  starters: [152, 155, 158],
  badges: JOHTO_BADGES,
  postgame: ["Kanto badges", kantoBadges("Janine", "Blue")],
  kit: JOHTO_KIT,
  hm: {
    "rock-smash": "Zephyr",
    surf: "Fog",
    strength: "Plain",
    whirlpool: "Glacier",
    waterfall: "Rising",
  },
  safari: [
    "Plains",
    "Meadow",
    "Savannah",
    "Peak",
    "Rocky Beach",
    "Wetland",
    "Forest",
    "Swamp",
    "Marshland",
    "Mountain",
    "Desert",
    "Wasteland",
  ],
  nightFrom: 20,
  boxes: [18, 30],
};

const GS: Pack = {
  load: () => import("./data/gs").then((m) => m.default),
  art: "gs",
  region: "Johto",
  regional: 251,
  national: 251,
  start: "New Bark Town",
  starters: [152, 155, 158],
  badges: JOHTO_BADGES,
  postgame: ["Kanto badges", kantoBadges("Janine", "Blue")],
  kit: [...JOHTO_KIT, ["cut-hm", "Cut"]],
  hm: {
    "cut-hm": "Hive",
    surf: "Fog",
    strength: "Plain",
    whirlpool: "Glacier",
    waterfall: "Rising",
  },
  nightFrom: 18,
  boxes: [14, 20],
};

const CRYSTAL: Pack = {
  load: () => import("./data/crystal").then((m) => m.default),
  art: "crystal",
  region: "Johto",
  regional: 251,
  national: 251,
  start: "New Bark Town",
  starters: [152, 155, 158],
  badges: JOHTO_BADGES,
  postgame: ["Kanto badges", kantoBadges("Janine", "Blue")],
  kit: [...JOHTO_KIT, ["rock-climb", "Rock Climb"]],
  hm: {
    surf: "Fog",
    strength: "Plain",
    whirlpool: "Glacier",
    waterfall: "Rising",
    "rock-climb": "Earth",
  },
  nightFrom: 18,
  boxes: [14, 20],
};

const RB: Pack = {
  load: () => import("./data/rb").then((m) => m.default),
  art: "rb",
  region: "Kanto",
  regional: 151,
  national: 151,
  start: "Pallet Town",
  starters: [1, 4, 7],
  badges: kantoBadges("Koga", "Giovanni"),
  kit: [
    ["old-rod", "Old Rod"],
    ["good-rod", "Good Rod"],
    ["super-rod", "Super Rod"],
    ["surf", "Surf"],
    ["strength", "Strength"],
    ["bicycle", "Bicycle"],
  ],
  hm: { surf: "Soul", strength: "Rainbow" },
  boxes: [12, 20],
};

const YELLOW: Pack = {
  load: () => import("./data/yellow").then((m) => m.default),
  art: "yellow",
  region: "Kanto",
  regional: 151,
  national: 151,
  start: "Pallet Town",
  starters: [25],
  badges: kantoBadges("Koga", "Giovanni"),
  kit: [
    ["old-rod", "Old Rod"],
    ["good-rod", "Good Rod"],
    ["super-rod", "Super Rod"],
    ["yellow-cut", "Cut"],
    ["surf", "Surf"],
    ["strength", "Strength"],
    ["bicycle", "Bicycle"],
  ],
  hm: { "yellow-cut": "Cascade", surf: "Soul", strength: "Rainbow" },
  boxes: [12, 20],
};

const FRLG: Pack = {
  load: () => import("./data/frlg").then((m) => m.default),
  art: "frlg",
  region: "Kanto",
  regional: 151,
  national: 386,
  start: "Pallet Town",
  starters: [1, 4, 7],
  badges: kantoBadges("Koga", "Giovanni"),
  kit: [
    ["old-rod", "Old Rod"],
    ["good-rod", "Good Rod"],
    ["surf", "Surf"],
    ["strength", "Strength"],
    ["rock-smash", "Rock Smash"],
    ["super-rod", "Super Rod"],
    ["waterfall", "Waterfall"],
    ["bicycle", "Bicycle"],
  ],
  hm: {
    surf: "Soul",
    strength: "Rainbow",
    "rock-smash": "Marsh",
    waterfall: "Volcano",
  },
  boxes: [14, 30],
};

const RS: Pack = {
  load: () => import("./data/rs").then((m) => m.default),
  art: "rs",
  region: "Hoenn",
  regional: 202,
  national: 386,
  start: "Route 101",
  starters: [252, 255, 258],
  badges: RS_BADGES,
  kit: [
    ["old-rod", "Old Rod"], ["good-rod", "Good Rod"], ["super-rod", "Super Rod"],
    ["cut-hm", "Cut"], ["flash", "Flash"], ["rock-smash", "Rock Smash"],
    ["strength", "Strength"], ["surf", "Surf"], ["dive", "Dive"],
    ["waterfall", "Waterfall"], ["mach-bike", "Mach Bike"], ["acro-bike", "Acro Bike"],
  ],
  hm: {
    "cut-hm": "Stone", flash: "Knuckle", "rock-smash": "Dynamo",
    strength: "Heat", surf: "Balance", dive: "Mind", waterfall: "Rain",
  },
  boxes: [14, 30],
};

const EMERALD: Pack = {
  load: () => import("./data/emerald").then((m) => m.default),
  art: "emerald",
  region: "Hoenn",
  regional: 202,
  national: 386,
  start: "Route 101",
  starters: [252, 255, 258],
  badges: EMERALD_BADGES,
  kit: [
    ["old-rod", "Old Rod"], ["good-rod", "Good Rod"], ["super-rod", "Super Rod"],
    ["cut-hm", "Cut"], ["flash", "Flash"], ["rock-smash", "Rock Smash"],
    ["strength", "Strength"], ["surf", "Surf"], ["dive", "Dive"],
    ["waterfall", "Waterfall"], ["mach-bike", "Mach Bike"],
    ["acro-bike", "Acro Bike"], ["wailmer-pail", "Wailmer Pail"],
  ],
  hm: {
    "cut-hm": "Stone", flash: "Knuckle", "rock-smash": "Dynamo",
    strength: "Heat", surf: "Balance", dive: "Mind", waterfall: "Rain",
  },
  boxes: [14, 30],
};

const BW: Pack = {
  load: () => import("./data/bw").then((m) => m.default),
  art: "bw",
  region: "Unova",
  regional: 156,
  national: 649,
  start: "Nuvema Town",
  starters: [495, 498, 501],
  badges: BW_BADGES,
  kit: [
    ["cut-hm", "Cut"], ["surf", "Surf"], ["strength", "Strength"],
    ["waterfall", "Waterfall"], ["super-rod", "Super Rod"],
    ["bicycle", "Bicycle"],
  ],
  hm: {},
  boxes: [24, 30],
};

const XY: Pack = {
  load: () => import("./data/xy").then((m) => m.default),
  art: "xy",
  region: "Kalos",
  regional: 457,
  national: 721,
  start: "Aquacorde Town",
  starters: [650, 653, 656],
  badges: XY_BADGES,
  kit: [
    ["old-rod", "Old Rod"], ["good-rod", "Good Rod"], ["super-rod", "Super Rod"],
    ["cut-hm", "Cut"], ["rock-smash", "Rock Smash"], ["strength", "Strength"],
    ["surf", "Surf"], ["waterfall", "Waterfall"],
  ],
  hm: { "cut-hm": "Bug", strength: "Cliff", surf: "Rumble", waterfall: "Iceberg" },
  nightFrom: 21,
  boxes: [31, 30],
};

const DP: Pack = {
  load: () => import("./data/dp").then((m) => m.default),
  art: "dp",
  region: "Sinnoh",
  regional: 151,
  national: 493,
  start: "Lake Verity",
  starters: [387, 390, 393],
  badges: DP_BADGES,
  kit: [
    ["old-rod", "Old Rod"], ["good-rod", "Good Rod"], ["super-rod", "Super Rod"],
    ["rock-smash", "Rock Smash"], ["cut-hm", "Cut"], ["fly", "Fly"],
    ["defog", "Defog"], ["surf", "Surf"], ["strength", "Strength"],
    ["rock-climb", "Rock Climb"], ["waterfall", "Waterfall"], ["bicycle", "Bicycle"],
  ],
  hm: {
    "rock-smash": "Coal", "cut-hm": "Forest", fly: "Cobble", defog: "Fen",
    surf: "Relic", strength: "Mine", "rock-climb": "Icicle", waterfall: "Beacon",
  },
  nightFrom: 20,
  boxes: [18, 30],
};

const USUM: Pack = {
  load: () => import("./data/usum").then((m) => m.default),
  art: "usum",
  region: "Alola",
  regional: 403,
  national: 807,
  start: "Route 1",
  starters: [722, 725, 728],
  // trial and grand trial Z-Crystals, in island challenge order
  badges: USUM_BADGES,
  badgeWord: "Z",
  badgesWord: "trials",
  kit: ALOLA_KIT,
  hm: {},
  boxes: [32, 30],
};

const B2W2: Pack = {
  load: () => import("./data/b2w2").then((m) => m.default),
  art: "b2w2",
  region: "Unova",
  regional: 301,
  national: 649,
  start: "Aspertia City",
  starters: [495, 498, 501],
  badges: B2W2_BADGES,
  kit: [
    ["cut-hm", "Cut"], ["surf", "Surf"], ["strength", "Strength"],
    ["waterfall", "Waterfall"], ["super-rod", "Super Rod"],
  ],
  hm: {},
  boxes: [24, 30],
};

const PLATINUM: Pack = {
  load: () => import("./data/pt").then((m) => m.default),
  art: "pt",
  region: "Sinnoh",
  regional: 210,
  national: 493,
  start: "Route 201",
  starters: [387, 390, 393],
  badges: PLATINUM_BADGES,
  kit: [
    ["old-rod", "Old Rod"], ["good-rod", "Good Rod"], ["super-rod", "Super Rod"],
    ["rock-smash", "Rock Smash"], ["cut-hm", "Cut"], ["defog", "Defog"],
    ["surf", "Surf"], ["strength", "Strength"], ["rock-climb", "Rock Climb"],
    ["waterfall", "Waterfall"], ["bicycle", "Bicycle"], ["honey", "Honey"],
    ["underground-kit", "Explorer Kit"], ["poke-radar", "Poké Radar"],
  ],
  hm: {
    "rock-smash": "Coal", "cut-hm": "Forest", defog: "Relic", surf: "Fen",
    strength: "Mine", "rock-climb": "Icicle", waterfall: "Beacon",
  },
  nightFrom: 20,
  boxes: [18, 30],
};

const SM: Pack = {
  load: () => import("./data/sm").then((m) => m.default),
  art: "sm",
  region: "Alola",
  regional: 302,
  national: 802,
  start: "Iki Town",
  starters: [722, 725, 728],
  // trial and grand trial Z-Crystals, in island challenge order
  badges: SM_BADGES,
  badgeWord: "Z",
  badgesWord: "trials",
  kit: ALOLA_KIT,
  hm: { tauros: "Fightinium", "fishing-rod": "Waterium", mudsdale: "Electrium", machamp: "Darkinium" },
  nightFrom: 18,
  morningFrom: 6,
  boxes: [32, 30],
};

const ORAS: Pack = {
  load: () => import("./data/oras").then((m) => m.default),
  art: "oras",
  region: "Hoenn",
  regional: 211,
  national: 721,
  start: "Route 101",
  starters: [252, 255, 258],
  badges: ORAS_BADGES,
  kit: [
    ["old-rod", "Old Rod"], ["good-rod", "Good Rod"], ["super-rod", "Super Rod"],
    ["cut-hm", "Cut"], ["rock-smash", "Rock Smash"], ["strength", "Strength"],
    ["surf", "Surf"], ["dive", "Dive"], ["waterfall", "Waterfall"],
    ["mach-bike", "Mach Bike"], ["acro-bike", "Acro Bike"],
  ],
  hm: {
    "cut-hm": "Stone", "rock-smash": "Dynamo", strength: "Heat",
    surf: "Balance", dive: "Mind", waterfall: "Rain",
  },
  nightFrom: 21,
  boxes: [31, 30],
};

export const VERSIONS: Record<VersionId, Version> = {
  "omega-ruby": {
    name: "Omega Ruby", short: "OR", code: "o", gen: "Gen 6",
    pack: ORAS, other: "Alpha Sapphire", ring: ["ground", "fire"],
  },
  "alpha-sapphire": {
    name: "Alpha Sapphire", short: "AS", code: "a", gen: "Gen 6",
    pack: ORAS, other: "Omega Ruby", ring: ["water", "dragon"],
  },
  platinum: {
    name: "Platinum", short: "PT", code: "t", gen: "Gen 4",
    pack: PLATINUM, ring: ["ghost", "dragon"],
  },
  "black-2": {
    name: "Black 2", short: "B2", code: "j", gen: "Gen 5",
    pack: B2W2, other: "White 2", ring: ["dragon", "ice"],
  },
  "white-2": {
    name: "White 2", short: "W2", code: "k", gen: "Gen 5",
    pack: B2W2, other: "Black 2", ring: ["ice", "dragon"],
  },
  ruby: {
    name: "Ruby", short: "RU", code: "R", gen: "Gen 3",
    pack: RS, other: "Sapphire", ring: ["fire", "ground"],
  },
  sapphire: {
    name: "Sapphire", short: "SA", code: "S", gen: "Gen 3",
    pack: RS, other: "Ruby", ring: ["water", "ice"],
  },
  black: {
    name: "Black", short: "BL", code: "k", gen: "Gen 5",
    pack: BW, other: "White", ring: ["dragon", "fire"],
  },
  white: {
    name: "White", short: "W", code: "w", gen: "Gen 5",
    pack: BW, other: "Black", ring: ["dragon", "electric"],
  },
  x: {
    name: "X", short: "X", code: "X", gen: "Gen 6",
    pack: XY, other: "Y", ring: ["fairy", "psychic"],
  },
  y: {
    name: "Y", short: "YY", code: "Y", gen: "Gen 6",
    pack: XY, other: "X", ring: ["dark", "flying"],
  },
  diamond: {
    name: "Diamond", short: "D", code: "d", gen: "Gen 4",
    pack: DP, other: "Pearl", ring: ["steel", "dragon"],
  },
  pearl: {
    name: "Pearl", short: "P", code: "p", gen: "Gen 4",
    pack: DP, other: "Diamond", ring: ["water", "dragon"],
  },
  emerald: {
    name: "Emerald", short: "E", code: "e", gen: "Gen 3",
    pack: EMERALD, ring: ["grass", "dragon"],
  },
  red: {
    name: "Red", short: "R", code: "r", gen: "Gen 1",
    pack: RB, other: "Blue", ring: ["fire", "fighting"],
  },
  blue: {
    name: "Blue", short: "B", code: "b", gen: "Gen 1",
    pack: RB, other: "Red", ring: ["water", "ice"],
  },
  yellow: {
    name: "Yellow",
    short: "Y",
    code: "y",
    gen: "Gen 1",
    pack: YELLOW,
    ring: ["electric", "normal"],
  },
  gold: {
    name: "Gold", short: "G", code: "g", gen: "Gen 2",
    pack: GS, other: "Silver", ring: ["fire", "flying"],
  },
  silver: {
    name: "Silver", short: "SI", code: "i", gen: "Gen 2",
    pack: GS, other: "Gold", ring: ["psychic", "flying"],
  },
  crystal: {
    name: "Crystal",
    short: "C",
    code: "c",
    gen: "Gen 2",
    pack: CRYSTAL,
    ring: ["water", "ice"],
  },
  firered: {
    name: "FireRed",
    short: "FR",
    code: "f",
    gen: "Gen 3",
    pack: FRLG,
    other: "LeafGreen",
    ring: ["fire", "fighting"],
  },
  leafgreen: {
    name: "LeafGreen",
    short: "LG",
    code: "l",
    gen: "Gen 3",
    pack: FRLG,
    other: "FireRed",
    ring: ["grass", "bug"],
  },
  heartgold: {
    name: "HeartGold",
    short: "HG",
    code: "h",
    gen: "Gen 4",
    pack: HGSS,
    other: "SoulSilver",
    ring: ["fire", "normal"],
  },
  soulsilver: {
    name: "SoulSilver",
    short: "SS",
    code: "s",
    gen: "Gen 4",
    pack: HGSS,
    other: "HeartGold",
    ring: ["steel", "water"],
  },
  sun: {
    name: "Sun", short: "SU", code: "S", gen: "Gen 7",
    pack: SM, other: "Moon", ring: ["fire", "psychic"],
  },
  moon: {
    name: "Moon", short: "MO", code: "M", gen: "Gen 7",
    clockOffset: 12, pack: SM, other: "Sun", ring: ["ghost", "dragon"],
  },
  ultrasun: {
    name: "Ultra Sun",
    short: "US",
    code: "u",
    gen: "Gen 7",
    pack: USUM,
    other: "Ultra Moon",
    ring: ["fire", "psychic"],
  },
  ultramoon: {
    name: "Ultra Moon",
    short: "UM",
    code: "m",
    gen: "Gen 7",
    pack: USUM,
    other: "Ultra Sun",
    ring: ["ghost", "dragon"],
  },
  "firered-switch": {
    name: "FireRed", short: "FR", code: "F", gen: "Gen 3",
    platform: "Switch", cover: "frs", pack: FRLG, other: "LeafGreen (Switch)",
    ring: ["fire", "fighting"],
  },
  "leafgreen-switch": {
    name: "LeafGreen", short: "LG", code: "L", gen: "Gen 3",
    platform: "Switch", cover: "lgs", pack: FRLG, other: "FireRed (Switch)",
    ring: ["grass", "bug"],
  },
};

export type Soon = { name: string; short: string; color: string; region: string };
export const CONSOLES: { name: string; tag: string; titles: (VersionId | Soon)[][] }[] = [
  { name: "Game Boy", tag: "Game Boy", titles: [["red", "blue"], ["yellow"]] },
  { name: "Game Boy Color", tag: "GB Color", titles: [["gold", "silver"], ["crystal"]] },
  { name: "Game Boy Advance", tag: "GBA", titles: [
    ["ruby", "sapphire"],
    ["firered", "leafgreen"],
    ["emerald"],
  ] },
  { name: "Nintendo DS", tag: "DS", titles: [
    ["diamond", "pearl"],
    ["platinum"],
    ["heartgold", "soulsilver"],
    ["black", "white"],
    ["black-2", "white-2"],
  ] },
  { name: "Nintendo 3DS", tag: "3DS", titles: [
    ["x", "y"],
    ["omega-ruby", "alpha-sapphire"],
    ["sun", "moon"],
    ["ultrasun", "ultramoon"],
  ] },
  { name: "Nintendo Switch", tag: "Switch", titles: [["firered-switch", "leafgreen-switch"]] },
];
