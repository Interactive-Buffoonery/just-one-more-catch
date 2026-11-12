export const VERSION_IDS = [
  "crystal",
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
