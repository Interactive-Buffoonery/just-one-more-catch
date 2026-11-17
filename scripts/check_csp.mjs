// Run: node scripts/check_csp.mjs
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

const headers = readFileSync("public/_headers", "utf8");
const block = headers.match(/^\/\*\n((?:[ \t]+.*\n?)*)/m)?.[1] ?? "";
const policy = block.match(/^\s*Content-Security-Policy(?:-Report-Only)?:\s*(.+)$/m)?.[1];
assert.ok(policy, "public/_headers needs a Content-Security-Policy for /*");

const parsed = policy.split(";").map(d => d.trim().split(/\s+/)).filter(d => d[0]).map(([name, ...values]) => [name.toLowerCase(), values]);
const directives = new Map(parsed);
assert.equal(directives.size, parsed.length, "CSP repeats a directive; browsers only read the first");
for (const name of ["script-src-elem", "script-src-attr"])
  assert.ok(!directives.has(name), `${name} would override script-src checks`);
for (const name of ["default-src", "script-src", "connect-src", "img-src", "style-src", "worker-src", "frame-src", "object-src", "base-uri", "frame-ancestors", "form-action"])
  assert.ok(directives.has(name), `CSP is missing ${name}`);
assert.ok(directives.get("connect-src").includes("https://blissful-cod-978.convex.site"));
assert.match(headers, /\/share\/\*\n  Referrer-Policy: no-referrer\n  X-Robots-Tag: noindex, nofollow/);
const scripts = directives.get("script-src");
for (const bad of ["'unsafe-inline'", "'unsafe-eval'", "'unsafe-hashes'", "*", "https:", "http:", "data:", "blob:"])
  assert.ok(!scripts.includes(bad), `script-src must not allow ${bad}`);
assert.deepEqual(directives.get("default-src"), ["'self'"]);
assert.deepEqual(directives.get("object-src"), ["'none'"]);
assert.deepEqual(directives.get("frame-ancestors"), ["'none'"]);
assert.doesNotMatch(policy, /clerk\.accounts\.dev|localhost|chatty-lyrebird/, "dev hosts must stay out of the production CSP");

const pages = ["index.html", "contact/index.html", "share/index.html", "scripts/game-page.html",
  ...readdirSync("public", { recursive: true }).filter(f => f.endsWith(".html")).map(f => `public/${f}`)];
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\b[^>]*>/gi)) {
    const type = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1].toLowerCase() ?? "";
    if (/\bsrc\s*=/i.test(attrs) || type.includes("json") && type !== "importmap") continue;
    const hash = `'sha256-${createHash("sha256").update(body).digest("base64")}'`;
    assert.ok(scripts.includes(hash), `${page} has an inline script not allowed by hash; add ${hash} to script-src or move it to a file`);
  }
  assert.doesNotMatch(html, /<[^>]+\son[a-z]+\s*=|javascript:/i, `${page} has an inline event handler or javascript: URL`);
}
console.log(`csp ok: ${pages.length} pages, ${directives.size} directives`);
