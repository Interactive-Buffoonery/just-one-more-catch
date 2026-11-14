export const JOHTO_BADGES = [
  ["Zephyr", "Falkner"],
  ["Hive", "Bugsy"],
  ["Plain", "Whitney"],
  ["Fog", "Morty"],
  ["Storm", "Chuck"],
  ["Mineral", "Jasmine"],
  ["Glacier", "Pryce"],
  ["Rising", "Clair"],
];
export const kantoBadges = (soul: string, earth: string) => [
  ["Boulder", "Brock"],
  ["Cascade", "Misty"],
  ["Thunder", "Lt. Surge"],
  ["Rainbow", "Erika"],
  ["Soul", soul],
  ["Marsh", "Sabrina"],
  ["Volcano", "Blaine"],
  ["Earth", earth],
];
export const RS_BADGES = [
    ["Stone", "Roxanne"], ["Knuckle", "Brawly"], ["Dynamo", "Wattson"],
    ["Heat", "Flannery"], ["Balance", "Norman"], ["Feather", "Winona"],
    ["Mind", "Tate & Liza"], ["Rain", "Wallace"],
  ];
export const EMERALD_BADGES = [
    ["Stone", "Roxanne"], ["Knuckle", "Brawly"], ["Dynamo", "Wattson"],
    ["Heat", "Flannery"], ["Balance", "Norman"], ["Feather", "Winona"],
    ["Mind", "Tate & Liza"], ["Rain", "Juan"],
  ];
export const BW_BADGES = [
    ["Trio", "Cilan / Chili / Cress"], ["Basic", "Lenora"],
    ["Insect", "Burgh"], ["Bolt", "Elesa"], ["Quake", "Clay"],
    ["Jet", "Skyla"], ["Freeze", "Brycen"], ["Legend", "Drayden / Iris"],
  ];
export const XY_BADGES = [
    ["Bug", "Viola"], ["Cliff", "Grant"], ["Rumble", "Korrina"],
    ["Plant", "Ramos"], ["Voltage", "Clemont"], ["Fairy", "Valerie"],
    ["Psychic", "Olympia"], ["Iceberg", "Wulfric"],
  ];
export const DP_BADGES = [
    ["Coal", "Roark"], ["Forest", "Gardenia"], ["Cobble", "Maylene"],
    ["Fen", "Crasher Wake"], ["Relic", "Fantina"], ["Mine", "Byron"],
    ["Icicle", "Candice"], ["Beacon", "Volkner"],
  ];
export const USUM_BADGES = [
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
  ];
export const B2W2_BADGES = [
    ["Basic", "Cheren"], ["Toxic", "Roxie"], ["Insect", "Burgh"],
    ["Bolt", "Elesa"], ["Quake", "Clay"], ["Jet", "Skyla"],
    ["Legend", "Drayden"], ["Wave", "Marlon"],
  ];
export const PLATINUM_BADGES = [
    ["Coal", "Roark"], ["Forest", "Gardenia"], ["Relic", "Fantina"],
    ["Cobble", "Maylene"], ["Fen", "Crasher Wake"], ["Mine", "Byron"],
    ["Icicle", "Candice"], ["Beacon", "Volkner"],
  ];
export const SM_BADGES = [
    ["Normalium", "Ilima"],
    ["Fightinium", "Hala"],
    ["Waterium", "Lana"],
    ["Firium", "Kiawe"],
    ["Grassium", "Mallow"],
    ["Rockium", "Olivia"],
    ["Electrium", "Sophocles"],
    ["Ghostium", "Acerola"],
    ["Darkinium", "Nanu"],
    ["Groundium", "Hapu"],
    ["Dragonium", "Vast Poni Canyon"],
  ];
export const ORAS_BADGES = [
    ["Stone", "Roxanne"], ["Knuckle", "Brawly"], ["Dynamo", "Wattson"],
    ["Heat", "Flannery"], ["Balance", "Norman"], ["Feather", "Winona"],
    ["Mind", "Tate & Liza"], ["Rain", "Wallace"],
  ];

export const MILESTONES = {
  "omega-ruby": (ORAS_BADGES).map((b) => b[0]),
  "alpha-sapphire": (ORAS_BADGES).map((b) => b[0]),
  "platinum": (PLATINUM_BADGES).map((b) => b[0]),
  "black-2": (B2W2_BADGES).map((b) => b[0]),
  "white-2": (B2W2_BADGES).map((b) => b[0]),
  "ruby": (RS_BADGES).map((b) => b[0]),
  "sapphire": (RS_BADGES).map((b) => b[0]),
  "black": (BW_BADGES).map((b) => b[0]),
  "white": (BW_BADGES).map((b) => b[0]),
  "x": (XY_BADGES).map((b) => b[0]),
  "y": (XY_BADGES).map((b) => b[0]),
  "diamond": (DP_BADGES).map((b) => b[0]),
  "pearl": (DP_BADGES).map((b) => b[0]),
  "emerald": (EMERALD_BADGES).map((b) => b[0]),
  "red": (kantoBadges("Koga", "Giovanni")).map((b) => b[0]),
  "blue": (kantoBadges("Koga", "Giovanni")).map((b) => b[0]),
  "yellow": (kantoBadges("Koga", "Giovanni")).map((b) => b[0]),
  "gold": (JOHTO_BADGES.concat(kantoBadges("Janine", "Blue"))).map((b) => b[0]),
  "silver": (JOHTO_BADGES.concat(kantoBadges("Janine", "Blue"))).map((b) => b[0]),
  "crystal": (JOHTO_BADGES.concat(kantoBadges("Janine", "Blue"))).map((b) => b[0]),
  "firered": (kantoBadges("Koga", "Giovanni")).map((b) => b[0]),
  "leafgreen": (kantoBadges("Koga", "Giovanni")).map((b) => b[0]),
  "heartgold": (JOHTO_BADGES.concat(kantoBadges("Janine", "Blue"))).map((b) => b[0]),
  "soulsilver": (JOHTO_BADGES.concat(kantoBadges("Janine", "Blue"))).map((b) => b[0]),
  "sun": (SM_BADGES).map((b) => b[0]),
  "moon": (SM_BADGES).map((b) => b[0]),
  "ultrasun": (USUM_BADGES).map((b) => b[0]),
  "ultramoon": (USUM_BADGES).map((b) => b[0]),
  "firered-switch": (kantoBadges("Koga", "Giovanni")).map((b) => b[0]),
  "leafgreen-switch": (kantoBadges("Koga", "Giovanni")).map((b) => b[0]),
};
