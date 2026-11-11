export const VERSION_IDS = [
  "heartgold",
  "soulsilver",
  "crystal",
  "firered",
  "leafgreen",
  "ultrasun",
  "ultramoon",
] as const;
export type VersionId = (typeof VERSION_IDS)[number];
