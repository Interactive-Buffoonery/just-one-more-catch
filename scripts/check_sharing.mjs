import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { runInNewContext } from "node:vm";
import { evaluatePacks } from "./check-utils.mjs";
import { projectionOf, validateProjection } from "../shared/share-projection.ts";

const read = path => readFileSync(path, "utf8");
const moduleCode = path => stripTypeScriptTypes(read(path)).replace(/^import .*;\n/gm, "").replace(/^export /gm, "");
const { VERSIONS } = evaluatePacks(read("client/packs.ts"), "({ VERSIONS })");
const esc = runInNewContext(moduleCode("client/dom.ts") + "\nesc");
const SPECIES_NAMES = runInNewContext(moduleCode("shared/species-names.ts") + "\nSPECIES_NAMES");
const renderSnapshot = runInNewContext(moduleCode("client/views/share.ts") + "\nrenderSnapshot", { esc, VERSIONS, SPECIES_NAMES, validateProjection, imageUrl: x => x });
const projection = projectionOf(JSON.stringify({ caught: [25, 1], badges: ["Zephyr", "Elite Four"], mons: [{nick: "PRIVATE_NICKNAME"}] }), "heartgold");
const html = renderSnapshot(projection);
assert.match(html, /Bulbasaur/);
assert.match(html, /Pikachu/);
assert.doesNotMatch(html, /PRIVATE_NICKNAME|Elite Four|Kanto badges|%/);
assert.match(renderSnapshot({...projection, badges: ["Zephyr", "Boulder"]}), /Kanto badges/);
assert.match(renderSnapshot(projection, "h1"), /<h1 class="lg">HeartGold<\/h1>/);
assert.throws(() => renderSnapshot({...projection, badges: ["../../private"]}));
assert.throws(() => renderSnapshot({...projection, nick: "PRIVATE_NICKNAME"}));
assert.match(renderSnapshot({v: 1, game: "sun", caught: [], badges: []}), /Alola trials/);
for (const game of Object.keys(VERSIONS)) {
  const p = projectionOf('{"badges":["Elite Four","../../private"],"caught":[1]}', game);
  assert.doesNotMatch(renderSnapshot(p), /Elite Four|private|undefined|%/);
}

const page = read("share/index.html"), main = read("client/main.ts");
assert.match(page, /name="robots" content="noindex, nofollow"/);
assert.match(page, /name="referrer" content="no-referrer"/);
assert.doesNotMatch(page, /cloudflareinsights|beacon|clerk|serviceWorker/i);
assert.doesNotMatch(main, /^import (?!type)[^\n]*from ["'](?:convex\/|.*_generated\/api)/m);
const publicSource = stripTypeScriptTypes(main.slice(main.indexOf("async function startShare()"), main.indexOf("async function startContact()")))
  .replace('const { validateProjection } = await import("../shared/share-projection");', '')
  .replace('const { renderSnapshot } = await import("./views/share");', '')
  .replace(/await import\("\.\/[^"\n]+\.css"\);/g, "")
  .replace('import.meta.env.VITE_CONVEX_URL', '"https://example.convex.cloud"');
assert.doesNotMatch(publicSource, /Clerk|ConvexClient|track\(|analytics|serviceWorker/);
async function publicRead(token, response, ok = true) {
  const target = { dataset: {} }, requests = [];
  const start = runInNewContext(publicSource + "\nstartShare", {
    URL, URLSearchParams, validateProjection, renderSnapshot, document: {getElementById: () => target},
    location: { hash: token }, fetch: async (url, options) => { requests.push({url: String(url), ...options}); return {ok, json: async () => response}; },
  });
  await start();
  return {target, requests};
}
const token = "a".repeat(43);
const available = await publicRead(`#s=${token}`, projection);
assert.equal(available.requests.length, 1);
assert.equal(available.requests[0].url, "https://example.convex.site/share");
assert.equal(available.requests[0].headers["X-Share-Token"], token);
assert.equal(available.requests[0].cache, "no-store");
assert.doesNotMatch(available.requests[0].url, new RegExp(token));
const unavailable = await publicRead("#s=bad", projection);
assert.equal(unavailable.requests.length, 0);
for (const response of [null, {...projection, nick: "private"}, {error: "Unavailable"}]) {
  const result = await publicRead(`#s=${token}`, response);
  assert.equal(result.target.innerHTML, unavailable.target.innerHTML);
}
assert.equal((await publicRead(`#s=${token}`, projection, false)).target.innerHTML, unavailable.target.innerHTML);

let body, activeSheet, currentProjection, saved, publishes, failSave, mismatch, revisionConflict;
let status;
const bridge = {
  auth: {isAuthenticated: true, userId: "owner"}, runs: [{id: "run", version: "heartgold"}],
  getState: async () => JSON.stringify({caught: currentProjection.caught, badges: currentProjection.badges}),
  shareStatus: async () => status,
  publishShare: async (id, p, revision) => {
    publishes++;
    assert.equal(revision, status.revision);
    if (mismatch) throw {data: {code: "SHARE_PREVIEW_MISMATCH", projection: currentProjection}};
    if (revisionConflict) throw {data: {code: "SHARE_REVISION_CONFLICT"}};
    status = {token, projection: p, revision: revision + 1}; return status;
  },
  replaceShare: async (id, p, revision) => {status = {token: "b".repeat(43), projection: p, revision: revision + 1}; return status;},
  stopShare: async (id, revision) => {status = {token: null, projection: null, revision: revision + 1}; return status;},
};
const ui = {};
const sheet = runInNewContext(moduleCode("client/share-owner.ts") + "\nshareSheet", {
  $, esc, bridge, ui, projectionOf, validateProjection, renderSnapshot, verOf: game => VERSIONS[game],
  isGuest: () => !bridge.auth.isAuthenticated, run: null, navigator: {}, location: {origin: "https://example.com", host: "example.com"},
});
function $(selector) { return selector === "#sheetbody" ? body : {close() {ui.sheet = null;}}; }
const tick = () => new Promise(setImmediate);
async function open() {
  body = {innerHTML: ""}; activeSheet = {}; ui.sheet = activeSheet; saved = 0; publishes = 0;
  const action = sheet("run", async () => {saved++; if (failSave) throw new Error("offline");}, () => {}, () => {});
  await tick(); return action;
}
currentProjection = projection;
status = {token: null, projection: null, revision: 0};
let action = await open();
assert.equal(saved, 1);
assert.equal(publishes, 0, "opening must never publish");
assert.match(body.innerHTML, /Create link/);
await action("publish");
assert.equal(publishes, 1);
assert.match(body.innerHTML, /Progress link/);
assert.match(body.innerHTML, /https:\/\/example.com\/share\/#s=/);
currentProjection = {...projection, caught: [1, 25, 26]};
await action("update");
assert.match(body.innerHTML, /Update link/);
assert.equal(publishes, 1, "updating must preview before publishing");
await action("publish");
assert.equal(status.projection.caught.length, 3);
await action("replace");
assert.equal(status.token, "b".repeat(43));
await action("stop");
assert.match(body.innerHTML, /Stop sharing\?/);
assert.ok(status.token);
await action("stopconfirm");
assert.equal(status.token, null);
assert.equal(ui.sheet, null);
failSave = true;
action = await open();
assert.match(body.innerHTML, /Couldn't save or load/);
assert.equal(publishes, 0);
failSave = false;
bridge.auth.isAuthenticated = false;
action = await open();
assert.match(body.innerHTML, /Sign in to make a link/);
assert.doesNotMatch(body.innerHTML, /data-shareaction="publish"/);
bridge.auth.isAuthenticated = true;
action = await open();
mismatch = true;
currentProjection = {...projection, caught: [1, 2, 25]};
await action("publish");
assert.match(body.innerHTML, /Ivysaur/);
assert.match(body.innerHTML, /Create link/);
mismatch = false;
revisionConflict = true;
await action("publish");
assert.match(body.innerHTML, /Create link/);
revisionConflict = false;
console.log("sharing renderer, isolated public reader and owner lifecycle ok");
