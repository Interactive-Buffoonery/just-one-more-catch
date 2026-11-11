import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, relative } from "node:path";

export function imageVersions(root = resolve("public")): Record<string, string> {
  const folders = ["covers", "badges", "items", ...readdirSync(resolve(root, "sprites"), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => `sprites/${e.name}`)];
  return Object.fromEntries(folders.map(folder => {
    const base = resolve(root, folder);
    const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(resolve(dir, e.name)) : [resolve(dir, e.name)]);
    const hash = createHash("sha256");
    for (const file of files(base).sort()) {
      const bytes = readFileSync(file);
      hash.update(relative(base, file)).update("\0").update(String(bytes.length)).update("\0").update(bytes);
    }
    return [folder, hash.digest("hex").slice(0, 8)];
  }));
}
