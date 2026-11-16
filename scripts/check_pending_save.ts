import assert from "node:assert/strict";
import { stateHash, replayPending } from "../client/pending-save.ts";
const pending = JSON.stringify({ state: "edited", base: stateHash("loaded") });
assert.equal(replayPending("loaded", pending), "edited");
assert.equal(replayPending("newer remote", pending), null);
for (const raw of [null, "{", "null", "{}", '{"state":3}']) {
  assert.equal(replayPending("loaded", raw), null);
}
console.log("Pending save replay checks passed");
