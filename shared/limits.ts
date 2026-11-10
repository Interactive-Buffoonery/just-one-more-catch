// Lakebed stores at most 64 KiB per field, and a run is one field
export const MAX_RUN_BYTES = 64 * 1024;
export const runBytes = (state: string) => new TextEncoder().encode(state).length;
