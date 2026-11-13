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
import { fetchStates, jsonParts, caughtCsv } from "../client/export";
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
