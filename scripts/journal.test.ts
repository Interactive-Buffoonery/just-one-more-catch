import { describe, expect, it } from "vitest";
import { acquisition, journalItems, preserveJournal, validDay, validateJournal } from "../shared/journal";
import { summarize } from "../shared/summary";
import { importCaughtState } from "../shared/save-import";

const notes = [{ id: "first", day: "2024-02-29", text: "A personal memory" }];
describe("personal journal", () => {
  it("uses calendar dates without timestamps or timezone conversion", () => {
    for (const day of ["2024-02-29", "0001-01-01", "2000-02-29"]) expect(validDay(day)).toBe(true);
    for (const day of ["2023-02-29", "1900-02-29", "2024-04-31", "0000-01-01", "2024-1-01", "2024-01-01T00:00:00Z"]) expect(validDay(day)).toBe(false);
    expect(acquisition({})).toBeUndefined();
    expect(acquisition({ place: "  Route 1  " })).toEqual({ place: "Route 1", method: undefined, day: undefined });
  });
  it("keeps duplicates separate, excludes bare caught flags, and sorts unknown dates last", () => {
    const mons = [{ id: 1 }, { id: 2, acquisition: { day: "2024-03-01" } }, { id: 3, acquisition: { place: "Trade" } }];
    expect(journalItems(mons, notes).map(row => row.key)).toEqual(["mon-2", "note-first", "mon-3"]);
    expect(journalItems(mons.filter(m => m.id !== 2), notes).map(row => row.key)).toEqual(["note-first", "mon-3"]);
    expect(journalItems([], [])).toEqual([]);
    expect(JSON.parse(importCaughtState("yellow", [25]))).toEqual({ caught: [25] });
  });
  it("preserves omitted journal data from older clients but honors explicit clearing", () => {
    const previous = JSON.stringify({ journalEntries: notes });
    expect(JSON.parse(preserveJournal('{"caught":[1]}', previous))).toEqual({ caught: [1], journalEntries: notes });
    expect(JSON.parse(preserveJournal('{"journalEntries":[]}', previous))).toEqual({ journalEntries: [] });
  });
  it("limits text and notes and rejects malformed fields before storage", () => {
    expect(() => validateJournal({ journalEntries: notes })).not.toThrow();
    for (const entry of [{ ...notes[0], day: "2024-02-30" }, { ...notes[0], text: " " }, { ...notes[0], text: "x".repeat(501) }, { ...notes[0], id: '<script>' }])
      expect(() => validateJournal({ journalEntries: [entry] })).toThrow();
    expect(() => validateJournal({ journalEntries: [...notes, ...notes] })).toThrow();
    expect(() => validateJournal({ journalEntries: Array.from({ length: 201 }, (_, i) => ({ id: `${i}`, text: "note" })) })).toThrow();
    expect(() => validateJournal({ mons: [{ acquisition: { method: "guess" } }] })).toThrow();
    expect(() => validateJournal({ mons: [{ acquisition: { place: "x".repeat(121) } }] })).toThrow();
  });
  it("keeps private details out of the existing dashboard summary", () => {
    expect(summarize(JSON.stringify({ caught: [25], mons: [{ id: 1, n: 25, box: "party", acquisition: { place: "Private place" } }], journalEntries: notes })))
      .toEqual({ caught: 1, badges: [], party: [{ n: 25, nick: "", shiny: false }] });
  });
});
