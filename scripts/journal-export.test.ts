import { expect, it, vi } from "vitest";
const fixture = vi.hoisted(() => {
  const pack = { load: vi.fn(async () => ({ dex: [{ n: 25, j: 25, name: "Pikachu" }] })) };
  return { state: { caught: [25], mons: [{ id: 1, n: 25, box: "party", acquisition: { day: "2020-01-01", place: "Private" } }], journalEntries: [{ id: "one", text: "Unsaved memory" }] }, pack };
});
vi.mock("../client/game", () => ({
  bridge: { auth: { displayName: "QA" }, getState: vi.fn(async () => '{}') },
  run: { id: "open" }, R: () => fixture.state, dumpRun: (r: unknown) => JSON.stringify(r),
  loaded: new Map(), startDay: () => "2000-01-01", verOf: () => ({ name: "Yellow", pack: fixture.pack }),
}));
import { fetchStates, jsonParts, caughtCsv, playthroughCsv } from "../client/export";
import type { RunRow } from "../client/types";
it("includes unsaved private metadata in JSON but keeps caught CSV species-only", async () => {
  const rows = [{ id: "open", version: "yellow", createdAt: "2000-01-01" }] as RunRow[];
  const states = await fetchStates(rows, () => {});
  const exported = JSON.parse(jsonParts(rows, states).join(""));
  expect(exported.runs[0]).toMatchObject(fixture.state);
  const csv = await caughtCsv(rows, states);
  expect(csv).toContain("Pikachu");
  expect(csv).not.toContain("Private");
  expect(csv).not.toContain("memory");
  expect(csv.split('\r\n')[0]).toBe('\ufeffGame,Started,Playthrough ID,National No.,Regional No.,Species,Shiny');
});


it("exports individual duplicates and completion-only species without invented details", async () => {
  const row = { id: "open", version: "yellow" } as RunRow;
  const state = JSON.stringify({ caught: [25, 1], mons: [
    { id: 1, n: 25, nick: "First", acquisition: { day: "2020-02-29", place: "Route 1" } },
    { id: 2, n: 25, nick: "Second" },
  ] });
  const output = await playthroughCsv(row, state);
  const lines = output.split("\r\n");
  expect(lines).toHaveLength(5);
  expect(lines[1]).toContain("Individual,1,25,Pikachu,yes");
  expect(lines[1]).toContain("2020-02-29,Route 1");
  expect(lines[2]).toContain("Individual,2,25,Pikachu,yes");
  expect(lines[2]).not.toContain("2020-02-29");
  expect(lines[3]).toContain("Species completion,,1,#1,yes");
});

it("exports journal chronology and unknown dates, escaping text and spreadsheet formulas", async () => {
  const row = { id: "open", version: "yellow" } as RunRow;
  const output = await playthroughCsv(row, JSON.stringify({ caught: [1], mons: [
    { id: 1, n: 25, nick: "=SUM(1)", note: 'Said "hi", then\nleft', acquisition: { day: "2020-01-01", method: "trade" } },
  ], journalEntries: [
    { id: "unknown", text: "Unknown date" },
    { id: "dated", day: "2021-01-01", text: "+formula" },
  ] }), true);
  expect(output.indexOf("2021-01-01")).toBeLessThan(output.indexOf("2020-01-01"));
  expect(output.indexOf("2020-01-01")).toBeLessThan(output.indexOf("Unknown date"));
  expect(output).toContain("Note,unknown,,,,,,,Unknown date");
  expect(output).toContain("'+formula");
  expect(output).toContain("'=SUM(1)");
  expect(output).toContain('"Said ""hi"", then\nleft"');
  expect(output).not.toContain("Species completion");
});

it("exports empty playthroughs and journals with headers only", async () => {
  const row = { id: "open", version: "yellow" } as RunRow;
  for (const journal of [false, true]) expect((await playthroughCsv(row, "{}", journal)).split("\r\n")).toHaveLength(2);
});
