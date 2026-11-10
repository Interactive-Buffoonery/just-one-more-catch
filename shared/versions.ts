export const VERSION_IDS = [
  "heartgold",
  "soulsilver",
  "crystal",
  "firered",
  "leafgreen",
] as const;
export type VersionId = (typeof VERSION_IDS)[number];
