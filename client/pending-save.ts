export function stateHash(state: string): string {
  let hash = 2166136261;
  for (let i = 0; i < state.length; i++) hash = Math.imul(hash ^ state.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(36);
}

export function replayPending(loaded: string, raw: string | null): string | null {
  try {
    const pending = JSON.parse(raw || "null");
    return typeof pending?.state === "string" && pending.base === stateHash(loaded)
      ? pending.state : null;
  } catch { return null; }
}
