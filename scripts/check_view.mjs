import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stripTypeScriptTypes} from "node:module";
import {runInNewContext} from "node:vm";

const game = readFileSync(new URL("../client/game.ts", import.meta.url), "utf8");
const load = runInNewContext(stripTypeScriptTypes(game.slice(game.indexOf("function loadRun("), game.indexOf("export const dumpRun"))) + "\nloadRun", {
  verOf: () => ({pack: {start: "Start", boxes: [1]}}), MON_DEFAULTS: {},
});
for (const [view, expected] of [[undefined, "journey"], ["unknown", "journey"], ["journey", "journey"], ["dex", "dex"], ["dexonly", "dexonly"]]) {
  assert.equal(load({id: "guest", version: "example"}, JSON.stringify({view})).view, expected);
}
const app = readFileSync(new URL("../client/app.ts", import.meta.url), "utf8");
const start = app.match(/if \(start && run\) (ui.tab = .*?);/)[1];
for (const view of ["journey", "dex", "dexonly"]) {
  const ui = {};
  runInNewContext(start, {ui, run: {view}});
  assert.equal(ui.tab, view === "journey" ? "journey" : "dex");
  const fromUrl = runInNewContext(app.slice(app.indexOf("function tabFromUrl()"), app.indexOf("function render()")) + "\ntabFromUrl", {
    URLSearchParams, location: {search: "?tab=journey"}, run: {view}, VIEWS: {journey: true},
  });
  assert.equal(fromUrl(), view === "dexonly" ? "dex" : "journey");
}
console.log("playthrough view ok");

const parts = readFileSync(new URL("../client/parts.ts", import.meta.url), "utf8");
const placeCard = runInNewContext(stripTypeScriptTypes(parts.slice(parts.indexOf("export function placeCard("), parts.indexOf("// Places in a chapter"))).replace("export ", "") + "\nplaceCard", {
  isHere: () => false, fold: () => "", R: () => ({}),
  monRow: () => "", subFold: () => "", strip: () => "", CHEV: "",
});
const card = placeCard("Route 29", {now: [], later: [{}, {}, {}], got: 4, caught: [], once: []});
assert(!card.includes("donepl") && !card.includes("quietpl"));
assert(card.includes("mini-meter") && card.includes("<b>4</b> / 7") && card.includes("3 later"));
