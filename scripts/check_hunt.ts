import assert from "node:assert/strict";
import { chance, fiftyAt, unitFor, eggTarget, masudaOdds, parseHunt } from "../client/hunt.ts";
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
for (const [n, target] of [[181, 179], [249, null], [132, null], [25, 172], [183, 183], [298, 298]]) assert.equal(eggTarget(n!, hgss.dex, 4), target);
assert.equal(eggTarget(183, gs.dex, 2), 183);
assert.equal(eggTarget(26, hgss.dex.filter((p) => p.n <= 151), 3), 25);
assert.equal(eggTarget(181, hgss.dex, 1), null);
assert.equal(Math.round(masudaOdds(5)!), 1365);
assert.equal(Math.round(masudaOdds(6)!), 683);
const hunt = { species: 179, place: "Eggs", unit: "eggs", method: "masuda", odds: 4096 / 6, count: 3, startedAt: 1 };
assert.deepEqual(parseHunt({ ...hunt, extra: "x" }), hunt);
for (const bad of [{ count: -1 }, { count: 1.5 }, { count: 2 ** 60 }, { unit: "steps" }, { odds: 0 }, { species: "179" }]) assert.equal(parseHunt({ ...hunt, ...bad }), undefined);
console.log("hunt checks passed");

const placeHunt = { ...hunt, species: 0, kind: "walk", unit: "encounters", method: "full" };
assert.deepEqual(parseHunt(placeHunt), placeHunt);
for (const bad of [{kind: ""}, {kind: 1}, {species: 1}, {unit: "eggs"}, {method: "masuda"}, {kind: undefined}]) assert.equal(parseHunt({...placeHunt, ...bad}), undefined);
