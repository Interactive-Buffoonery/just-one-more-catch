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
  const render = runInNewContext(source.slice(source.indexOf('const gameChoices'), source.indexOf('const pickGame')) + '\ngameChoices', {VERSIONS, esc: x => x, cover: () => '<img alt="">'});
  assert.equal((render().match(/<button /g) || []).length, games.length);
}
const realPacks = runInNewContext(stripTypeScriptTypes(packs).replace(/^import .*$/gm, "").replace(/export /g, "") + "\nVERSIONS");
const game = readFileSync(new URL("../client/game.ts", import.meta.url), "utf8");
const badgesWord = runInNewContext(stripTypeScriptTypes(game.slice(game.indexOf("export const badgesWord"), game.indexOf(";", game.indexOf("export const badgesWord")) + 1)).replace("export ", "") + "\nbadgesWord");
const verOf = version => realPacks[version];
const badgeCount = runInNewContext(stripTypeScriptTypes(source.slice(source.indexOf("const badgeCount"), source.indexOf("export const cover"))) + "\nbadgeCount", {verOf});
const trainer = runInNewContext(stripTypeScriptTypes(source.slice(source.indexOf('const trainerCard'), source.indexOf('const signInNote'))) + '\ntrainerCard', {
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
assert.doesNotMatch(source.slice(source.indexOf('const gameChoices'), source.indexOf('const pickGame')), /aria-label=/);
console.log('dashboard ok');
