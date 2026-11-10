// Convex documents top out at 1 MB; a playthrough is one field, so leave headroom
export const MAX_RUN_BYTES = 512 * 1024;
export const runBytes = (state: string) => new TextEncoder().encode(state).length;
export const MAX_RUNS = 100;
