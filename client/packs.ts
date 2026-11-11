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
  boxes: [count: number, size: number];
};
export type Version = {
  name: string;
  short: string;
  code: string;
  gen: string;
  pack: Pack;
  other?: string;
  ring: string[];
};

const JOHTO_BADGES = [
  ["Zephyr", "Falkner"],
  ["Hive", "Bugsy"],
  ["Plain", "Whitney"],
  ["Fog", "Morty"],
  ["Storm", "Chuck"],
  ["Mineral", "Jasmine"],
  ["Glacier", "Pryce"],
  ["Rising", "Clair"],
];
const kantoBadges = (soul: string, earth: string) => [
  ["Boulder", "Brock"],
  ["Cascade", "Misty"],
  ["Thunder", "Lt. Surge"],
  ["Rainbow", "Erika"],
  ["Soul", soul],
  ["Marsh", "Sabrina"],
  ["Volcano", "Blaine"],
  ["Earth", earth],
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

const USUM: Pack = {
  load: () => import("./data/usum").then((m) => m.default),
  art: "usum",
  region: "Alola",
  regional: 403,
  national: 807,
  start: "Route 1",
  starters: [722, 725, 728],
  // trial and grand trial Z-Crystals, in island challenge order
  badges: [
    ["Normalium", "Ilima"],
    ["Fightinium", "Hala"],
    ["Waterium", "Lana"],
    ["Firium", "Kiawe"],
    ["Grassium", "Mallow"],
    ["Rockium", "Olivia"],
    ["Electrium", "Sophocles"],
    ["Ghostium", "Acerola"],
    ["Darkinium", "Nanu"],
    ["Dragonium", "Vast Poni Canyon"],
    ["Fairium", "Mina"],
    ["Groundium", "Hapu"],
  ],
  badgeWord: "Z",
  badgesWord: "trials",
  kit: [
    ["fishing-rod", "Fishing Rod"],
    ["tauros", "Tauros Charge"],
    ["surf", "Lapras Paddle"],
    ["mudsdale", "Mudsdale Gallop"],
    ["machamp", "Machamp Shove"],
    ["island-scan", "Island Scan"],
  ],
  hm: {},
  boxes: [32, 30],
};

export const VERSIONS: Record<VersionId, Version> = {
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
};

export const CONSOLES: { name: string; games: (VersionId | { name: string; short: string; color: string })[] }[] = [
  { name: "Game Boy", games: [
    { name: "Red", short: "R", color: "#d8403a" },
    { name: "Blue", short: "B", color: "#3a67c9" },
    { name: "Yellow", short: "Y", color: "#d4a136" },
  ] },
  { name: "Game Boy Color", games: [
    { name: "Gold", short: "G", color: "#d8403a" },
    { name: "Silver", short: "SI", color: "#3a67c9" },
    "crystal",
  ] },
  { name: "Game Boy Advance", games: [
    { name: "Ruby", short: "RU", color: "#d8403a" },
    { name: "Sapphire", short: "SA", color: "#3a67c9" },
    "firered",
    "leafgreen",
    { name: "Emerald", short: "E", color: "#3a67c9" },
  ] },
  { name: "Nintendo DS", games: [
    { name: "Diamond", short: "D", color: "#d8403a" },
    { name: "Pearl", short: "P", color: "#3a67c9" },
    { name: "Platinum", short: "PT", color: "#d4a136" },
    "heartgold",
    "soulsilver",
    { name: "Black", short: "BL", color: "#d4a136" },
    { name: "White", short: "W", color: "#d8403a" },
    { name: "Black 2", short: "B2", color: "#3a67c9" },
    { name: "White 2", short: "W2", color: "#d4a136" },
  ] },
  { name: "Nintendo 3DS", games: [
    { name: "X", short: "X", color: "#d8403a" },
    { name: "Y", short: "YY", color: "#3a67c9" },
    { name: "Omega Ruby", short: "OR", color: "#d4a136" },
    { name: "Alpha Sapphire", short: "AS", color: "#d8403a" },
    { name: "Sun", short: "SU", color: "#3a67c9" },
    { name: "Moon", short: "MO", color: "#d4a136" },
    "ultrasun",
    "ultramoon",
  ] },
];
