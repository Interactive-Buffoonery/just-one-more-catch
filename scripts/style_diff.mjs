// Compares computed styles between a base ref and this checkout, at phone and
// desktop widths in light and dark. Use it for CSS-only changes.
//   pnpm check:styles [route ...]
//   BASE=<ref> (default origin/main)
//   FIXTURE=<file.html> injects extra markup for elements guest pages don't render.
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { createReadStream, existsSync, mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve, sep } from "node:path";
import { chromium } from "playwright-core";

const base = process.env.BASE ?? "origin/main";
const routes = process.argv.length > 2 ? process.argv.slice(2) : ["/", "/emerald/", "/contact/", "/settings/", "/boxes/"];
const fixture = process.env.FIXTURE ? readFileSync(process.env.FIXTURE, "utf8") : "";
const run = (cmd, args, cwd = ".") => execFileSync(cmd, args, { cwd, stdio: ["ignore", "ignore", "inherit"] });
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };

function serve(dir) {
  return new Promise((done) => {
    const server = createServer((req, res) => {
      let file = resolve(dir, "." + new URL(req.url, "http://x").pathname);
      if (file !== dir && !file.startsWith(dir + sep)) return res.writeHead(403).end();
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
      if (!existsSync(file)) file = join(dir, "index.html");
      res.writeHead(200, { "content-type": mime[extname(file)] ?? "application/octet-stream" });
      createReadStream(file).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => done(server));
  });
}

async function collect(browser, port) {
  const out = {};
  for (const route of routes) for (const width of [390, 1280]) for (const colorScheme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    out[`${route} ${width} ${colorScheme}`] = await page.evaluate((html) => {
      if (html) document.body.insertAdjacentHTML("beforeend", `<div id="style-diff-fixture">${html}</div>`);
      const read = (cs) => Object.fromEntries([...cs].map((k) => [k, cs.getPropertyValue(k)]));
      const styles = {};
      document.querySelectorAll("body *").forEach((el, i) => {
        const key = `${i}:${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${[...el.classList].join(".")}`;
        styles[key] = read(getComputedStyle(el));
        for (const pseudo of ["::before", "::after"]) {
          const cs = getComputedStyle(el, pseudo);
          if (cs.content !== "none") styles[key + pseudo] = read(cs);
        }
      });
      return styles;
    }, fixture);
    await ctx.close();
  }
  return out;
}

const baseDir = mkdtempSync(join(tmpdir(), "jomc-style-base-"));
run("git", ["worktree", "add", "--detach", baseDir, base]);
let diffs = 0, props = 0;
try {
  run("sh", ["scripts/setup-worktree.sh"], baseDir);
  run("pnpm", ["build"], baseDir);
  run("pnpm", ["build"]);
  const servers = await Promise.all([serve(resolve(baseDir, "dist")), serve(resolve("dist"))]);
  const browser = await chromium.launch();
  const results = [];
  for (const server of servers) results.push(await collect(browser, server.address().port));
  await browser.close();
  servers.forEach((s) => s.close());
  const [a, b] = results;
  for (const cfg of Object.keys(a)) {
    for (const el of new Set([...Object.keys(a[cfg]), ...Object.keys(b[cfg])])) {
      const x = a[cfg][el], y = b[cfg][el];
      if (!x || !y) { diffs++; console.log(`${cfg} ${el} only in ${x ? "base" : "this checkout"}`); continue; }
      for (const p of Object.keys(x)) {
        props++;
        if (x[p] !== y[p]) { diffs++; console.log(`${cfg} ${el} ${p}: ${x[p]} -> ${y[p]}`); }
      }
    }
  }
} finally {
  run("git", ["worktree", "remove", "--force", baseDir]);
}
console.log(`${props} properties compared against ${base}, ${diffs} differences`);
process.exit(diffs ? 1 : 0);
