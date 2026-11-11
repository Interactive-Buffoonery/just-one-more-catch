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
const trainer = runInNewContext(stripTypeScriptTypes(source.slice(source.indexOf('const trainerCard'), source.indexOf('const signInNote'))) + '\ntrainerCard', {
  esc: x => x, trainerName: () => 'Trainer', partner: () => '', champion: () => false,
  verOf: version => ({pack: version}), badgesWord: p => p,
  badgeCount: (_, r) => r.count,
});
assert.doesNotMatch(trainer([]), /<\/b> (badges|trials)/);
const html = trainer(['badges', 'trials'].map(version => ({row: {version}, r: {count: 3, caught: 0}})));
assert.match(html, /<b>3<\/b> badges/);
assert.match(html, /<b>3<\/b> trials/);
console.log('dashboard ok');
