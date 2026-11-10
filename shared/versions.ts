export const VERSION_IDS = ["heartgold", "soulsilver"] as const;
export type VersionId = (typeof VERSION_IDS)[number];
