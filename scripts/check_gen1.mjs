import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync("client/data/rb.ts", "utf8").split("export default ")[1].replace(/;\s*$/, ""));
const byN = Object.fromEntries(data.dex.map(p => [p.n, p]));
// Later-added babies must not turn original species into evolution-only catches.
for (const n of [25, 35, 39, 106, 107, 113, 122, 124, 125, 126, 143]) {
  assert.equal(byN[n].from, null, `Gen I #${n} has a later pre-evolution`);
  assert.equal(byN[n].evo, null);
}
assert.deepEqual(byN[81].types, ["electric"]);
assert.deepEqual(byN[82].types, ["electric"]);
assert.deepEqual(byN[35].types, ["normal"]);
assert.deepEqual(byN[122].types, ["psychic"]);
assert.equal(byN[26].from, "Pikachu");
assert.equal(byN[26].evo, "Thunder Stone");
assert.equal(byN[65].evo, "Trade");
// Collapsing floors silently sums unrelated encounter tables and loses odds.
assert.deepEqual(byN[41].rows.filter(r => r.place.startsWith("Mt. Moon")).map(r => [r.place, r.c, r.lo, r.hi]), [
  ["Mt. Moon 1F", 79, 6, 11],
  ["Mt. Moon B1F", 60, 7, 11],
  ["Mt. Moon B2F", 49, 9, 12],
]);
assert.deepEqual(byN[41].rows.filter(r => r.place.startsWith("Rock Tunnel")).map(r => [r.place, r.c, r.lo, r.hi]), [
  ["Rock Tunnel 1F", 55, 15, 18],
  ["Rock Tunnel B1F", 50, 16, 18],
]);
for (const p of data.dex) {
  for (const r of p.rows) {
    assert(r.v === "r" || r.v === "b" || r.v === "rb");
    assert(r.c > 0 && r.c <= 100);
  }
  for (const folder of ["", "shiny/"]) {
    const regular = readFileSync(`public/sprites/rb/${p.n}.png`);
    assert(regular.equals(readFileSync(`public/sprites/rb/${folder}${p.n}.png`)), "Gen I shiny fallback differs from regular art");
  }
}
assert(byN[23].rows.length && byN[23].rows.every(r => r.v === "r"));
assert(byN[27].rows.length && byN[27].rows.every(r => r.v === "b"));
console.log("Gen I evolution, types, floor odds, exclusives and sprite fallback ok");
