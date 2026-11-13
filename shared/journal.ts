export const ACQUISITION_METHODS = {
  caught: "Caught", hatched: "Hatched", gift: "Gift", trade: "Trade", other: "Other",
} as const;
export type Acquisition = { method?: keyof typeof ACQUISITION_METHODS; day?: string; place?: string };
export type JournalEntry = { id: string; day?: string; text: string };
export const MAX_JOURNAL_ENTRIES = 200;
export const MAX_JOURNAL_TEXT = 500;
export const MAX_ACQUISITION_PLACE = 120;

export function validDay(day: unknown): day is string {
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const [year, month, date] = day.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || date < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return date <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

export function acquisition(input: Acquisition): Acquisition | undefined {
  const result = { ...input, place: input.place?.trim() || undefined, day: input.day || undefined, method: input.method || undefined };
  validateAcquisition(result);
  return result.method || result.day || result.place ? result : undefined;
}

function validateAcquisition(value: unknown): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid acquisition details");
  const a = value as Acquisition;
  if (a.method !== undefined && !Object.hasOwn(ACQUISITION_METHODS, a.method)) throw new Error("Choose how you obtained this Pokémon");
  if (a.day !== undefined && !validDay(a.day)) throw new Error("Choose a valid calendar date");
  if (a.place !== undefined && (typeof a.place !== "string" || a.place.length > MAX_ACQUISITION_PLACE)) throw new Error("Location is too long");
}

export function validateJournal(state: { mons?: unknown; journalEntries?: unknown }): void {
  if (!state || typeof state !== "object") throw new Error("Invalid playthrough state");
  if (Array.isArray(state.mons)) for (const m of state.mons) {
    if (m?.acquisition !== undefined) validateAcquisition(m.acquisition);
  }
  if (state.journalEntries === undefined) return;
  const entries = state.journalEntries;
  if (!Array.isArray(entries) || entries.length > MAX_JOURNAL_ENTRIES) throw new Error(`Your journal holds up to ${MAX_JOURNAL_ENTRIES} notes`);
  const ids = new Set<string>();
  for (const entry of entries) {
    if (!entry || typeof entry !== "object" || typeof entry.id !== "string" || !/^[\w-]{1,64}$/.test(entry.id) || ids.has(entry.id)) throw new Error("Invalid journal note");
    ids.add(entry.id);
    if (typeof entry.text !== "string" || !entry.text.trim() || entry.text.length > MAX_JOURNAL_TEXT) throw new Error(`Write a note of up to ${MAX_JOURNAL_TEXT} characters`);
    if (entry.day !== undefined && !validDay(entry.day)) throw new Error("Choose a valid calendar date");
  }
}

export function preserveJournal(state: string, previous: string): string {
  const next = JSON.parse(state), old = JSON.parse(previous);
  if (next && typeof next === "object" && !Array.isArray(next) && !Object.hasOwn(next, "journalEntries") && Array.isArray(old?.journalEntries)) {
    next.journalEntries = old.journalEntries;
    return JSON.stringify(next);
  }
  return state;
}

export type JournalItem = { key: string; day?: string } & ({ kind: "mon"; id: number } | { kind: "note"; entry: JournalEntry });
export function journalItems(mons: { id: number; acquisition?: Acquisition }[], entries: JournalEntry[]): JournalItem[] {
  return [
    ...mons.filter(m => m.acquisition && Object.values(m.acquisition).some(Boolean)).map(m => ({ key: `mon-${m.id}`, kind: "mon" as const, id: m.id, day: m.acquisition?.day })),
    ...entries.map(entry => ({ key: `note-${entry.id}`, kind: "note" as const, entry, day: entry.day })),
  ].sort((a, b) => (b.day || "").localeCompare(a.day || "") || a.key.localeCompare(b.key, "en", { numeric: true }));
}
