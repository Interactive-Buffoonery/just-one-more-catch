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
