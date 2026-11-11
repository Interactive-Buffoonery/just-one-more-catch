import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
const files = readdirSync("client", { recursive: true }).filter(f => f.endsWith(".ts")).map(f => `client/${f}`);
for (const file of [...files, "scripts/build_game_pages.ts"]) {
  const source = readFileSync(file, "utf8");
  assert(!/\?v=\d/.test(source), `${file}: manual image version`);
  assert(!/src=["']\/(?:covers|sprites|badges|items)\//.test(source), `${file}: image bypasses imageUrl`);
  for (const line of source.split("\n")) {
    if (/[`"']\/(?:covers|sprites|badges|items)\//.test(line)) {
      assert(line.includes("imageUrl(") || (file === "scripts/build_game_pages.ts" && line.includes("const src =")), `${file}: image bypasses helper`);
    }
  }
}
console.log("image URL fingerprints ok");
