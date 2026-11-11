// Run: node scripts/check_summary.ts
import assert from "node:assert/strict";
import { summarize } from "../shared/summary.ts";

const empty = { badges: [], caught: 0, party: [] };
assert.deepEqual(summarize("{}"), empty);
assert.deepEqual(summarize("not json"), empty);
assert.deepEqual(summarize("null"), empty);
assert.deepEqual(summarize('{"badges":"Zephyr","caught":5,"mons":{}}'), empty);

const mons = [
  { id: 1, n: 155, box: "party", nick: "Cyndi", shiny: true },
  { id: 2, n: 16, box: 1 },
  { id: 3, n: 19, box: "party" },
  { id: 4, n: "x", box: "party" },
  ...Array.from({ length: 8 }, (_, i) => ({ id: 10 + i, n: 20 + i, box: "party", nick: "y".repeat(50) })),
];
const s = summarize(
  JSON.stringify({ badges: ["Zephyr", "Elite Four", 7, "z".repeat(99)], caught: [155, 16, 16, 19], mons }),
);
assert.deepEqual(s.badges, ["Zephyr", "Elite Four", "z".repeat(40)]);
assert.equal(s.caught, 3);
assert.equal(s.party.length, 6);
assert.deepEqual(s.party[0], { n: 155, shiny: true, nick: "Cyndi" });
assert.deepEqual(s.party[1], { n: 19, shiny: false, nick: "" });
assert.equal(s.party[2].nick.length, 20);
assert.equal(summarize(JSON.stringify({ badges: Array(500).fill("Hive") })).badges.length, 64);
console.log("summary ok");
