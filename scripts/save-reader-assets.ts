import { createReadStream, readFileSync, cpSync, mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, sep } from "node:path";
import type { Plugin } from "vite";

export function saveReaderAssets(): { version: string; plugin: Plugin } {
  const pkgPath = fileURLToPath(import.meta.resolve("@serabi/pokemon-save-reader/package.json"));
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const assets = join(dirname(pkgPath), "assets");
  const manifest = JSON.parse(readFileSync(join(assets, "manifest.json"), "utf8"));
  if (manifest.sourceDirty !== false || manifest.version !== pkg.version ||
      !/^[a-f0-9]{40}$/.test(manifest.sourceCommit))
    throw new Error("The save reader must be built from a committed release");
  for (const file of manifest.files) {
    const path = resolve(assets, file.path);
    if (!path.startsWith(assets + sep) || statSync(path).size !== file.bytes ||
        file.bytes > 25 * 1024 * 1024 ||
        createHash("sha256").update(readFileSync(path)).digest("hex") !== file.sha256)
      throw new Error(`Invalid save-reader asset: ${file.path}`);
  }
  const version = `${pkg.version}-${manifest.sourceCommit.slice(0, 12)}`;
  const prefix = `/save-reader/${version}/`;
  return {
    version,
    plugin: {
      name: "save-reader-assets",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith(prefix)) return next();
          let path: string;
          try { path = resolve(assets, decodeURIComponent(req.url.slice(prefix.length).split("?")[0])); }
          catch { res.writeHead(400).end(); return; }
          if (!path.startsWith(assets + sep)) { res.writeHead(404).end(); return; }
          const fileName = req.url.slice(prefix.length).split("?")[0];
          if (fileName === "LICENSE" || fileName === "README.md") path = join(dirname(pkgPath), fileName);
          const stream = createReadStream(path);
          stream.on("error", () => { if (!res.headersSent) res.writeHead(404); res.end(); });
          res.setHeader("Content-Type", path.endsWith(".wasm") ? "application/wasm" : path.endsWith(".js") ? "text/javascript" : path.endsWith(".json") ? "application/json" : "text/plain");
          stream.pipe(res);
        });
      },
      writeBundle() {
        const target = resolve("dist", "save-reader", version);
        mkdirSync(target, { recursive: true });
        cpSync(assets, target, { recursive: true });
        cpSync(join(dirname(pkgPath), "LICENSE"), join(target, "LICENSE"));
        cpSync(join(dirname(pkgPath), "README.md"), join(target, "README.md"));
      },
    },
  };
}
