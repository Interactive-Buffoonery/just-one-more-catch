import assert from "node:assert/strict";
import { chance, fiftyAt, unitFor, eggTarget } from "../client/hunt.ts";
import hgss from "../client/data/hgss.ts";
import gs from "../client/data/gs.ts";
assert.equal(chance(0, 8192), 0);
assert.equal(chance(1, 2), 0.5);
for (const odds of [1, 2, 4096, 8192]) {
  const n = fiftyAt(odds);
  assert(chance(n, odds) >= 0.5);
  assert(chance(n - 1, odds) < 0.5);
}
for (const [method, unit] of [["walk", "encounters"], ["static", "resets"], ["eggs", "eggs"], ["npc-trade", null]]) assert.equal(unitFor(method!), unit);
for (const [n, target] of [[181, 179], [249, null], [132, null], [25, 172], [183, 183], [298, 298]]) assert.equal(eggTarget(n!, hgss), target);
assert.equal(eggTarget(183, gs), 183);
console.log("hunt checks passed");
