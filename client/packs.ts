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
  platform?: string;
  cover?: string;
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

const EMERALD: Pack = {
  load: () => import("./data/emerald").then((m) => m.default),
  art: "emerald",
  region: "Hoenn",
  regional: 202,
  national: 386,
  start: "Route 101",
  starters: [252, 255, 258],
  badges: [
    ["Stone", "Roxanne"], ["Knuckle", "Brawly"], ["Dynamo", "Wattson"],
    ["Heat", "Flannery"], ["Balance", "Norman"], ["Feather", "Winona"],
    ["Mind", "Tate & Liza"], ["Rain", "Juan"],
  ],
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

const XY: Pack = {
  load: () => import("./data/xy").then((m) => m.default),
  art: "xy",
  region: "Kalos",
  regional: 457,
  national: 721,
  start: "Aquacorde Town",
  starters: [650, 653, 656],
  badges: [
    ["Bug", "Viola"], ["Cliff", "Grant"], ["Rumble", "Korrina"],
    ["Plant", "Ramos"], ["Voltage", "Clemont"], ["Fairy", "Valerie"],
    ["Psychic", "Olympia"], ["Iceberg", "Wulfric"],
  ],
  kit: [
    ["old-rod", "Old Rod"], ["good-rod", "Good Rod"], ["super-rod", "Super Rod"],
    ["cut-hm", "Cut"], ["rock-smash", "Rock Smash"], ["strength", "Strength"],
    ["surf", "Surf"], ["waterfall", "Waterfall"],
  ],
  hm: { "cut-hm": "Bug", strength: "Cliff", surf: "Rumble", waterfall: "Iceberg" },
  nightFrom: 21,
  boxes: [31, 30],
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
  x: {
    name: "X", short: "X", code: "X", gen: "Gen 6",
    pack: XY, other: "Y", ring: ["fairy", "psychic"],
  },
  y: {
    name: "Y", short: "YY", code: "Y", gen: "Gen 6",
    pack: XY, other: "X", ring: ["dark", "flying"],
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
    [
      { name: "Ruby", short: "RU", color: "#c8323c", region: "Hoenn" },
      { name: "Sapphire", short: "SA", color: "#2f5fb3", region: "Hoenn" },
    ],
    ["firered", "leafgreen"],
    ["emerald"],
  ] },
  { name: "Nintendo DS", tag: "DS", titles: [
    [
      { name: "Diamond", short: "D", color: "#5b8fd6", region: "Sinnoh" },
      { name: "Pearl", short: "P", color: "#c98aa8", region: "Sinnoh" },
    ],
    [{ name: "Platinum", short: "PT", color: "#8d8f9c", region: "Sinnoh" }],
    ["heartgold", "soulsilver"],
    [
      { name: "Black", short: "BL", color: "#3a3a40", region: "Unova" },
      { name: "White", short: "W", color: "#c9c9d0", region: "Unova" },
    ],
    [
      { name: "Black 2", short: "B2", color: "#2f3a4a", region: "Unova" },
      { name: "White 2", short: "W2", color: "#d9c6bb", region: "Unova" },
    ],
  ] },
  { name: "Nintendo 3DS", tag: "3DS", titles: [
    ["x", "y"],
    [
      { name: "Omega Ruby", short: "OR", color: "#c8323c", region: "Hoenn" },
      { name: "Alpha Sapphire", short: "AS", color: "#2f5fb3", region: "Hoenn" },
    ],
    [
      { name: "Sun", short: "SU", color: "#e8892a", region: "Alola" },
      { name: "Moon", short: "MO", color: "#6a4fc9", region: "Alola" },
    ],
    ["ultrasun", "ultramoon"],
  ] },
  { name: "Nintendo Switch", tag: "Switch", titles: [["firered-switch", "leafgreen-switch"]] },
];
