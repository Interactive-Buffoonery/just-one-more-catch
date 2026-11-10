// Run: node scripts/check_clock.ts
import assert from "node:assert/strict";
import { gameNow } from "../shared/clock.ts";

const at = Date.UTC(2026, 0, 1);
const sat2350 = 6 * 1440 + 23 * 60 + 50;
assert.deepEqual(gameNow({ mode: "manual", min: sat2350, at }, at), { day: 6, hour: 23, minute: 50 });
assert.deepEqual(gameNow({ mode: "manual", min: sat2350, at }, at + 15 * 60000), { day: 0, hour: 0, minute: 5 });
assert.deepEqual(gameNow({ mode: "manual", min: 0, at }, at - 60000), { day: 6, hour: 23, minute: 59 });
// 2026-01-01 00:30 UTC is Wednesday 19:30 in New York
assert.deepEqual(gameNow({ mode: "device", tz: "America/New_York" }, at + 30 * 60000), { day: 3, hour: 19, minute: 30 });
assert.equal(gameNow({ mode: "device", tz: "Not/AZone" }).day >= 0, true);
console.log("clock ok");
