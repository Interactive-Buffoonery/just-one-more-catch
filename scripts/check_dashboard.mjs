import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {runInNewContext} from 'node:vm';
const source = readFileSync(new URL('../client/views/runs.ts', import.meta.url), 'utf8');
const packs = readFileSync(new URL('../client/packs.ts', import.meta.url), 'utf8');
const ids = [...packs.slice(packs.indexOf('export const VERSIONS')).matchAll(/^  (\w+): \{/gm)].map(m => m[1]);
assert.ok(ids.length);
for (const games of [ids, ['example'], [...ids, ...Array.from({length: 20}, (_, i) => 'example' + i)]]) {
  const VERSIONS = Object.fromEntries(games.map(id => [id, {name: id, pack: {region: 'Example'}}]));
  const render = runInNewContext(source.slice(source.indexOf('const gameChoices'), source.indexOf('const pickGame')) + '\ngameChoices', {imageUrl: x => x, CONSOLES: [{name: 'Example', games}], VERSIONS, esc: x => x, cover: () => '<img alt="">'});
  assert.equal((render().match(/<button /g) || []).length, games.length);
}
const realPacks = runInNewContext(stripTypeScriptTypes(packs).replace(/^import .*$/gm, "").replace(/export /g, "") + "\nVERSIONS");
const game = readFileSync(new URL("../client/game.ts", import.meta.url), "utf8");
const badgesWord = runInNewContext(stripTypeScriptTypes(game.slice(game.indexOf("export const badgesWord"), game.indexOf(";", game.indexOf("export const badgesWord")) + 1)).replace("export ", "") + "\nbadgesWord");
const verOf = version => realPacks[version];
const badgeCount = runInNewContext(stripTypeScriptTypes(source.slice(source.indexOf("const badgeCount"), source.indexOf("export const cover"))) + "\nbadgeCount", {verOf});
const trainer = runInNewContext(stripTypeScriptTypes(source.slice(source.indexOf('const trainerCard'), source.indexOf('const signInNote'))) + '\ntrainerCard', {imageUrl: x => x,
  esc: x => x, trainerName: () => 'Trainer', partner: () => '', champion: () => false,
  verOf, badgesWord, badgeCount,
});
assert.doesNotMatch(trainer([]), /<\/b> (badges|trials)/);
const rows = ['heartgold', 'ultrasun'].map(version => ({row: {version}, r: {badges: verOf(version).pack.badges.slice(0, 3).map(b => b[0]), caught: 0}}));
const html = trainer(rows);
assert.match(html, /<b>3<\/b> badges/);
assert.match(html, /<b>3<\/b> trials/);
for (const row of rows) {
  row.r.badges = row.r.badges.slice(0, 1);
  const singular = trainer([row]);
  assert.match(singular, /<b>1<\/b> playthrough<\/li>/);
  assert.match(singular, /<b>1<\/b> (badge|trial)<\/li>/);
}


for (const count of [0, 1, 2]) {
  const render = runInNewContext(stripTypeScriptTypes(source.slice(source.indexOf('export function Runs()'), source.indexOf('function Account()'))).replace('export ', '') + '\nRuns', {
    recentRuns: () => Array.from({length: count}, () => ({row: {}, r: {}, at: ''})),
    partner: () => '<img class="partner" src="/sprites/hgss/25.png" alt="" width="80" height="80">',
    gameChoices: () => '', signInNote: () => '', resumeCard: () => '', trainerCard: () => '', miniCard: () => '', MAX_RUNS: 10,
  });
  const dashboard = render();
  assert.equal(dashboard.includes('class="trainer hello"'), count === 0);
  assert.equal(dashboard.includes('Welcome, Trainer'), count === 0);
  assert.equal(dashboard.includes('Pick your game'), count === 0);
}

const confirm = runInNewContext(stripTypeScriptTypes(source.slice(source.indexOf('export const confirmGame'), source.indexOf('const gameChoices'))).replace('export ', '') + '\nconfirmGame', {verOf, esc: x => x, cover: () => '<img alt="">'});
assert.match(confirm('heartgold'), /Start HeartGold\?/);
assert.match(confirm('heartgold'), /Yes please!/);
assert.match(confirm('heartgold'), /No thank you, just browsing!/);

assert.match(confirm('heartgold'), /data-confirmrun="heartgold"/);
assert.match(confirm('heartgold'), /data-close=/);
const choices = runInNewContext(source.slice(source.indexOf('const gameChoices'), source.indexOf('const pickGame')) + '\ngameChoices', {imageUrl: x => x, CONSOLES: runInNewContext(stripTypeScriptTypes(packs).replace(/^import .*$/gm, '').replace(/export /g, '') + '\nCONSOLES'), VERSIONS: realPacks, esc: x => x, cover: () => '<img alt="">'});
assert.match(choices(), /data-newrun="heartgold"/);
const app = readFileSync(new URL('../client/app.ts', import.meta.url), 'utf8');
assert.doesNotMatch(app.slice(app.indexOf('  if (d.newrun) {'), app.indexOf('  if (d.confirmrun) {')), /createRun/);
assert.match(app, /e\.repeat &&\s*\(e\.key === "Enter" \|\| e\.key === " "\) &&\s*\(e\.target as HTMLElement\)\.closest\("\[data-confirmrun\]"\)\s*\) e\.preventDefault\(\)/);
console.log('dashboard ok');

for (const card of choices().matchAll(/<div class="gb soon"[^>]*>.*?<\/div>/g)) assert.doesNotMatch(card[0], /data-newrun|<button/);
