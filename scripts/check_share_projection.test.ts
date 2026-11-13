import assert from "node:assert/strict";
import { projectionOf, validateProjection, canonical, SHARE_MAX_BYTES } from "../shared/share-projection.ts";
import { VERSION_IDS } from "../shared/versions.ts";
import { MILESTONES } from "../shared/milestones.ts";
import { IMPORT_SPECIES_LIMITS } from "../shared/save-import.ts";
import { existsSync } from "node:fs";
const p = projectionOf(JSON.stringify({ caught: [3, 1, 3], badges: ["Zephyr", "Elite Four", "../../x"], mons: [{ nick: "private", shiny: true }] }), "heartgold");
assert.deepEqual(p, { v: 1, game: "heartgold", caught: [1, 3], badges: ["Zephyr"] });
assert(!canonical(p).includes("private"));
assert.equal(validateProjection({ ...p, nick: "private" }), null);
assert.equal(validateProjection({ ...p, caught: [494] }), null);
assert.equal(validateProjection({ ...p, caught: [3, 1] }), null);
assert.equal(validateProjection({ ...p, caught: [1, 1] }), null);
assert.equal(validateProjection({ ...p, badges: ["x".repeat(SHARE_MAX_BYTES)] }), null);
assert.throws(() => projectionOf('{"caught":[0]}', "heartgold"));
for (const game of VERSION_IDS) {
  assert(MILESTONES[game].length);
  assert(IMPORT_SPECIES_LIMITS[game] > 0);
  for (const badge of MILESTONES[game]) assert(existsSync(`public/badges/${badge}.png`), badge);
}
console.log("share projection and milestone assets ok");

assert.deepEqual(Object.keys(p).sort(), ["badges", "caught", "game", "v"]);
assert.equal(validateProjection({ ...p, badges: ["Hive", "Zephyr"] }), null);
assert.equal(validateProjection({ ...p, badges: ["Zephyr", "Zephyr"] }), null);
for (const caught of [[-1], [0], [1.5], [NaN], [Infinity], ["1"]])
  assert.equal(validateProjection({ ...p, caught }), null);
assert.equal(validateProjection({ ...p, game: "unknown" }), null);
assert.equal(validateProjection({ ...p, v: 2 }), null);
for (const game of VERSION_IDS) {
  const full = projectionOf(JSON.stringify({
    caught: Array.from({ length: IMPORT_SPECIES_LIMITS[game] }, (_, i) => i + 1),
    badges: [...MILESTONES[game]].reverse(),
  }), game);
  assert.deepEqual(full.badges, MILESTONES[game]);
  assert(new TextEncoder().encode(canonical(full)).length <= SHARE_MAX_BYTES);
  assert.equal(validateProjection({ ...full, caught: [IMPORT_SPECIES_LIMITS[game] + 1] }), null);
}
