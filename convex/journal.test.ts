import { expect, it } from "vitest";
import { setup } from "./setup.testing";
import { api } from "./_generated/api";

it("round trips personal details, protects ownership, supports corrections and deletion", async () => {
  const t = setup(), a = t.withIdentity({ subject: "A", sid: "sess_A" }), b = t.withIdentity({ subject: "B", sid: "sess_B" });
  const id = await a.mutation(api.runs.create, { version: "yellow" });
  const state = { caught: [25], mons: [{ id: 1, n: 25, box: "party", acquisition: { method: "gift", day: "2020-01-01", place: "Pallet Town" } }], journalEntries: [{ id: "note-1", text: "Private memory" }] };
  await a.mutation(api.runs.save, { id, state: JSON.stringify(state) });
  expect(JSON.parse(await a.query(api.runs.get, { id }))).toEqual(state);
  await expect(b.query(api.runs.get, { id })).rejects.toThrow("Not your playthrough");
  await expect(b.mutation(api.runs.save, { id, state: "{}" })).rejects.toThrow("Not your playthrough");
  // Older clients have no top-level journal field. Species toggles retain notes.
  await a.mutation(api.runs.save, { id, state: JSON.stringify({ caught: [], mons: state.mons }) });
  expect(JSON.parse(await a.query(api.runs.get, { id }))).toEqual({ caught: [], mons: state.mons, journalEntries: state.journalEntries });
  await expect(a.mutation(api.runs.save, { id, state: JSON.stringify({ journalEntries: [{ id: "bad", text: "" }] }) })).rejects.toThrow();
  expect(JSON.parse(await a.query(api.runs.get, { id }))).toHaveProperty("journalEntries", state.journalEntries);
  await a.mutation(api.runs.save, { id, state: '{"mons":[],"journalEntries":[]}' });
  expect(JSON.parse(await a.query(api.runs.get, { id }))).toEqual({ mons: [], journalEntries: [] });
});
