export const VERSION_IDS = [
  "crystal",
  "firered",
  "leafgreen",
  "heartgold",
  "soulsilver",
  "ultrasun",
  "ultramoon",
] as const;
export type VersionId = (typeof VERSION_IDS)[number];
