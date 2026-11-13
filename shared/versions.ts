export const VERSION_IDS = [
  "platinum",
  "red",
  "blue",
  "yellow",
  "gold",
  "silver",
  "crystal",
  "emerald",
  "firered",
  "leafgreen",
  "heartgold",
  "soulsilver",
  "ultrasun",
  "ultramoon",
  "firered-switch",
  "leafgreen-switch",
] as const;
export type VersionId = (typeof VERSION_IDS)[number];
