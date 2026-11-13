// Partner Pokémon a trainer can pick for their avatar, in picker order
// box: visible sprite bounds [left, top, right, bottom] in the 80px image
export const AVATARS: [n: number, name: string, box: [number, number, number, number]][] = [
  [1, "Bulbasaur", [20, 22, 59, 58]],
  [4, "Charmander", [23, 19, 57, 61]],
  [7, "Squirtle", [19, 21, 60, 59]],
  [25, "Pikachu", [16, 15, 64, 65]],
  [152, "Chikorita", [20, 18, 59, 62]],
  [155, "Cyndaquil", [18, 19, 61, 60]],
  [158, "Totodile", [21, 22, 58, 58]],
  [252, "Treecko", [14, 19, 66, 61]],
  [255, "Torchic", [25, 18, 54, 61]],
  [258, "Mudkip", [21, 20, 58, 59]],
  [387, "Turtwig", [24, 19, 56, 61]],
  [390, "Chimchar", [25, 17, 55, 62]],
  [393, "Piplup", [28, 22, 51, 57]],
  [94, "Gengar", [12, 14, 68, 66]],
  [133, "Eevee", [16, 19, 64, 61]],
  [143, "Snorlax", [9, 9, 71, 70]],
  [149, "Dragonite", [7, 1, 73, 79]],
  [175, "Togepi", [29, 28, 51, 52]],
  [196, "Espeon", [15, 13, 65, 66]],
  [197, "Umbreon", [19, 14, 61, 65]],
  [448, "Lucario", [15, 13, 64, 66]],
  [151, "Mew", [13, 16, 66, 64]],
  [249, "Lugia", [0, 2, 80, 78]],
  [250, "Ho-Oh", [0, 0, 80, 80]],
];
export const isAvatar = (n: unknown) => AVATARS.some(([a]) => a === n);
