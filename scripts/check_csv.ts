// Run: node scripts/check_csv.ts
import assert from "node:assert/strict";
import { cell, csv } from "../shared/csv.ts";

assert.equal(cell("Nidoran♀"), "Nidoran♀");
assert.equal(cell(25), "25");
assert.equal(cell(null), "");
assert.equal(cell("Mr. Mime, Jr."), '"Mr. Mime, Jr."');
assert.equal(cell('say "hi"'), '"say ""hi"""');
assert.equal(cell("a\nb"), '"a\nb"');
assert.equal(cell("a\rb"), '"a\rb"');
assert.equal(
  csv([
    ["a", "b"],
    [1, ""],
  ]),
  "﻿a,b\r\n1,\r\n",
);
console.log("csv ok");
