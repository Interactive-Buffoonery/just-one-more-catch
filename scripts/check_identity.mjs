import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../convex/", import.meta.url);
const offenders = readdirSync(dir, { recursive: true })
  .filter((f) => /\.ts$/.test(f) && !f.startsWith("_generated") && f !== "auth.ts")
  .filter((f) => readFileSync(new URL(f, dir), "utf8").includes("getUserIdentity"));
assert.deepEqual(offenders, [], "Use identityOf from convex/auth.ts instead of ctx.auth.getUserIdentity()");
