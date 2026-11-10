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
  dex: any[];
};
export type Pack = {
  load: () => Promise<GameData>;
  region: string;
  regional: number;
  national: number;
  start: string;
  starters: number[];
  badges: string[][];
  postgame?: [string, string[][]];
  kit: string[][];
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
  ["good-rod", "Good Rod"],
  ["whirlpool", "Whirlpool"],
  ["waterfall", "Waterfall"],
  ["super-rod", "Super Rod"],
];

const HGSS: Pack = {
  load: () => import("./data/hgss").then((m) => m.default),
  region: "Johto",
  regional: 256,
  national: 493,
  start: "New Bark Town",
  starters: [152, 155, 158],
  badges: JOHTO_BADGES,
  postgame: ["Kanto badges", kantoBadges("Janine", "Blue")],
  kit: JOHTO_KIT,
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
  region: "Johto",
  regional: 251,
  national: 251,
  start: "New Bark Town",
  starters: [152, 155, 158],
  badges: JOHTO_BADGES,
  postgame: ["Kanto badges", kantoBadges("Janine", "Blue")],
  kit: JOHTO_KIT,
  nightFrom: 18,
  boxes: [14, 20],
};

const FRLG: Pack = {
  load: () => import("./data/frlg").then((m) => m.default),
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
    ["rock-smash", "Rock Smash"],
    ["super-rod", "Super Rod"],
    ["waterfall", "Waterfall"],
  ],
  boxes: [14, 30],
};

export const VERSIONS: Record<VersionId, Version> = {
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
};
