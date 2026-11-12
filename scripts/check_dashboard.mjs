import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {runInNewContext} from 'node:vm';
const source = readFileSync(new URL('../client/views/runs.ts', import.meta.url), 'utf8');
const packs = readFileSync(new URL('../client/packs.ts', import.meta.url), 'utf8');
const {VERSIONS, CONSOLES} = runInNewContext(stripTypeScriptTypes(packs).replace(/^import .*$/gm, '').replace(/export /g, '') + '\n({VERSIONS, CONSOLES})');
for (const v of Object.values(VERSIONS)) readFileSync(new URL(`../public/covers/${v.cover ?? v.short.toLowerCase()}.jpg`, import.meta.url));

const titles = CONSOLES.flatMap(c => c.titles);
const listed = titles.flat().filter(g => typeof g === 'string');
assert.deepEqual([...listed].sort(), Object.keys(VERSIONS).sort(), 'every version is listed in exactly one title');
for (const t of titles) {
  assert.ok(t.length <= 2);
  if (t.length === 2 && typeof t[0] === 'string') assert.equal(VERSIONS[t[0]].pack, VERSIONS[t[1]].pack, `${t} share a pack`);
  assert.ok(t.every(g => typeof g === 'string') || t.every(g => typeof g !== 'string'));
}
for (const g of titles.flat().filter(g => typeof g !== 'string')) readFileSync(new URL(`../public/covers/${g.short.toLowerCase()}.jpg`, import.meta.url));

const game = readFileSync(new URL('../client/game.ts', import.meta.url), 'utf8');
const badgesWord = runInNewContext(stripTypeScriptTypes(game.slice(game.indexOf('export const badgesWord'), game.indexOf(';', game.indexOf('export const badgesWord')) + 1)).replace('export ', '') + '\nbadgesWord');
const ctx = {
  imageUrl: x => x, esc: x => x, $: () => null, VERSIONS, CONSOLES, verOf: v => VERSIONS[v], byN: {}, ui: {},
  badgesWord, badgeName: b => b, startDay: () => '2026-11-01', ymd: () => '2026-11-12',
  bridge: {runs: [], auth: {isAuthenticated: false}}, run: null,
  summarize: () => ctx.bridge.runs.find(r => r.id === ctx.run.id).summary, dumpRun: () => null, R: () => null, guestRows: () => [], moving: false, waitingNote: () => '',
  MAX_RUNS: 1000, AVATARS: [], isAvatar: () => false,
};
const view = runInNewContext(stripTypeScriptTypes(source.slice(source.indexOf('const badgeCount'), source.indexOf('function emailLine'))).replace(/export /g, '') + '\n({dash, titleTile, picker, stats, Runs, confirmGame})', ctx);

for (const [i, t] of titles.entries()) {
  const html = view.titleTile(t, 'Tag');
  const live = t.filter(g => typeof g === 'string');
  assert.equal((html.match(/<button /g) || []).length, live.length);
  for (const id of live) assert.match(html, new RegExp(`data-newrun="${id}"`));
  if (!live.length) assert.match(html, /^<div class="pt soon" role="group" aria-label="[^"]+, Coming soon">/, `soon title ${i}`);
}
assert.match(view.titleTile(['firered-switch', 'leafgreen-switch'], 'Switch'), /FireRed<span class="sr"> \(Switch\)<\/span>/);

const row = (id, version, at, r = {}) => ({id, version, createdAt: at, updatedAt: at, summary: {badges: [], caught: 0, party: [], ...r}});
const shelfNames = () => [...view.picker().matchAll(/data-shelf="(\w+)"/g)].map(m => m[1]);
assert.deepEqual(shelfNames(), ['Unplayed', 'Soon']);
ctx.bridge.runs = [row('a', 'heartgold', '2026-11-10T00:00:00Z')];
assert.deepEqual(shelfNames(), ['Unplayed', 'Played', 'Soon']);
view.dash.shelf = 'Played';
assert.match(view.picker(), /data-newrun="soulsilver"/, 'played title offers its other flavor');
assert.doesNotMatch(view.picker(), /data-newrun="red"/);
view.dash.shelf = 'Unplayed';

const summary = (caught, badges = []) => ({r: {caught, badges}});
assert.match(view.stats([summary(3)]), /<b>1<\/b> playthrough<\/span>/);
assert.match(view.stats([summary(3), summary(4)]), /<b>2<\/b> playthroughs<\/span>.*<b>7<\/b> caught/);
assert.doesNotMatch(view.stats([summary(3)]), /Champion/);
assert.match(view.stats([summary(3, ['Elite Four'])]), /<b>1<\/b> Champion/);

ctx.bridge.runs = [];
const fresh = view.Runs();
assert.doesNotMatch(fresh, /class="rail"|class="stats"/);
assert.match(fresh, /data-newrun="heartgold"/);

ctx.bridge.runs = [row('a', 'heartgold', '2026-11-10T00:00:00Z', {caught: 140}), row('b', 'red', '2026-11-12T00:00:00Z'), row('c', 'emerald', '2026-11-01T00:00:00Z')];
const slots = html => [...html.matchAll(/data-slot="(\w+)"[^>]*aria-pressed="(\w+)"/g)].map(m => m[1] + (m[2] === 'true' ? '*' : ''));
assert.deepEqual(slots(view.Runs()), ['b*', 'a', 'c', 'new'], 'most recent first, selected by default');
ctx.run = {id: 'a'};
assert.deepEqual(slots(view.Runs()), ['b', 'a*', 'c', 'new'], 'open playthrough is selected');
assert.match(view.Runs(), /data-switch="a"[^>]*>Continue/);
view.dash.slot = 'c';
assert.deepEqual(slots(view.Runs()), ['b', 'a', 'c*', 'new']);
view.dash.slot = 'gone';
assert.deepEqual(slots(view.Runs()), ['b', 'a*', 'c', 'new'], 'deleted selection falls back');
view.dash.slot = 'new';
assert.deepEqual(slots(view.Runs()), ['b', 'a', 'c', 'new*']);
assert.match(view.Runs(), /data-newrun="yellow"/);
ctx.MAX_RUNS = 3;
assert.match(view.Runs(), /You have 3 playthroughs/);
assert.doesNotMatch(view.Runs(), /data-newrun/);

const confirm = view.confirmGame;
assert.match(confirm('heartgold'), /Start HeartGold\?/);
assert.match(confirm('heartgold'), /Start a new playthrough/);
assert.match(confirm('heartgold'), /href="\/import\/" data-tab="import"/);
assert.match(confirm('heartgold'), /No thank you, just browsing!/);
assert.match(confirm('heartgold'), /data-confirmrun="heartgold"/);
assert.match(confirm('heartgold'), /data-close=/);

const app = readFileSync(new URL('../client/app.ts', import.meta.url), 'utf8');
assert.doesNotMatch(app.slice(app.indexOf('  if (d.newrun) {'), app.indexOf('  if (d.confirmrun) {')), /createRun/);
assert.match(app, /e\.repeat &&\s*\(e\.key === "Enter" \|\| e\.key === " "\) &&\s*\(e\.target as HTMLElement\)\.closest\("\[data-confirmrun\]"\)\s*\) e\.preventDefault\(\)/);
assert.match(app, /if \(d\.slot\) dash\.slot = d\.slot/);
assert.match(app, /if \(d\.shelf\) dash\.shelf = d\.shelf/);
assert.equal((source.match(/<a class="chip" href="\/import\/" data-tab="import"/g) || []).length, 1, 'Import a save must be a real link to the /import/ page');
console.log('dashboard ok');
