import { loadGeneratedPack } from './check-utils.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

const data = loadGeneratedPack('b2w2');
const byN = Object.fromEntries(data.dex.map(p => [p.n, p]));
assert.equal(byN[494].j, 0);
assert.equal(data.dex.filter(p => p.j != null).length, 301);
const source = readFileSync('client/game.ts', 'utf8');
const start = source.indexOf('export const visible =');
const end = source.indexOf('export const gameTime =', start);
const run = { caught: new Set([494, 495, 1]), badges: new Set() };
const game = runInNewContext(stripTypeScriptTypes(source.slice(start, end).replaceAll('export ', '')) + '\n({visible, num, regionalCaught, dexList})', {
  R: () => run, e4: () => run.badges.has('Elite Four'), byN, DEX: data.dex,
});
assert.equal(game.visible(byN[494]), true, 'regional #000 must be visible');
assert.equal(game.num(byN[494]), 0);
assert.equal(game.regionalCaught(), 2, '#000 must count toward the regional total');
assert.equal(game.dexList()[0].n, 494);
run.badges.add('Elite Four');
assert.equal(game.num(byN[494]), 494);
assert.equal(game.dexList().length, 649);
// The paired version codes must keep the opposite N dragons separate.
assert(byN[643].rows.every(r => r.v === 'k'));
assert(byN[644].rows.every(r => r.v === 'j'));
assert(byN[380].rows.every(r => r.v === 'k'));
assert(byN[381].rows.every(r => r.v === 'j'));
assert(byN[443].rows.filter(r => r.m === 'gift').every(r => r.v === 'j'));
assert(byN[147].rows.filter(r => r.m === 'gift').every(r => r.v === 'k'));
for (const n of [480, 481, 482]) assert(byN[n].rows.every(r => r.need.includes('lake-guardians')));
assert(byN[646].rows.every(r => r.need.includes('catch-n-dragon')));
assert(byN[485].rows.every(r => r.need.includes('magma-stone')));
assert(data.dex.some(p => p.rows.some(r => r.cond.includes('season-winter'))));
assert(data.dex.some(p => p.rows.some(r => r.m === 'hidden-grotto')));
console.log('B2W2 regional #000, paired encounters and story gates ok');

const config = JSON.parse(readFileSync('data/b2w2.json', 'utf8'));
const outbreaks = data.dex.flatMap(p => p.rows.filter(r => r.cond.includes('daily-outbreak')).map(r => ({ n: p.n, ...r })));
assert.equal(outbreaks.length, 23);
const sharedOutbreaks = [79, 450, 97, 332, 83, 22, 84, 277, 284, 204, 187, 177, 162, 195, 317];
for (const [v, exclusive] of [['j', [313, 311, 185, 168]], ['k', [314, 312, 122, 166]]]) {
  const rows = outbreaks.filter(r => r.v.includes(v));
  assert.equal(rows.length, 19, `${v}: outbreak row count`);
  assert.deepEqual(rows.map(r => r.n).sort((a, b) => a - b), [...sharedOutbreaks, ...exclusive].sort((a, b) => a - b));
}
for (const row of outbreaks) {
  const supplement = config.extra_encounters.find(r => r.n === row.n);
  assert.equal(row.place, config.rename[supplement.area] || supplement.area);
  assert.equal(row.m, 'walk');
  assert.equal(row.lo, 40);
  assert.equal(row.hi, 55);
  assert.equal(row.c, 40);
  assert(row.need.includes('Elite Four'), 'outbreaks must stay postgame');
  assert.equal(row.src, supplement.src);
  assert.equal(row.url, supplement.url);
  assert(supplement.quote.includes('entry5-2|'), 'use the B2/W2 source table');
  assert.deepEqual(row.cond, row.n === 195 ? ['daily-outbreak', 'season-not-winter'] : ['daily-outbreak']);
}
const basement = data.dex.flatMap(p => p.rows).filter(r => r.place === 'Dreamyard B1F');
assert(basement.length > 0);
assert(basement.every(r => !r.need?.includes('cut-hm')));
for (const n of [380, 381]) assert(byN[n].rows.every(r => r.need.includes('cut-hm')));
assert(byN[526].rows.filter(r => r.m === 'trade').every(r => r.place === 'Route 7'), 'Part 10 puts the Hiker under Route 7');
assert(byN[638].rows.every(r => !r.need?.includes('cut-hm')), 'Cobalion awaits gameplay verification');
assert(readFileSync('scripts/build_game_pages.ts', 'utf8').includes('(m.j == null && !has("Elite Four"))'));

const matches = (place, prefix) => place === prefix || place.startsWith(prefix + ' ');
const inventory = readFileSync('docs/b2w2-access.md', 'utf8').split('\n').filter(l => l.startsWith('| ') && !l.startsWith('| PokeAPI') && !l.startsWith('| ---'));
assert.equal(inventory.length, 137);
for (const line of inventory) {
  const [area, chapter, needs] = line.slice(2, -2).split(' | ');
  const place = config.rename[area] || area;
  const candidates = config.chapters.flatMap((c, i) => c.places.filter(p => matches(place, p)).map(p => ({ p, c, i })));
  const best = candidates.sort((a, b) => b.p.length - a.p.length)[0];
  assert(best, `no chapter for ${area}`);
  assert.equal(chapter, `${best.i}: ${best.c.title} (needs ${best.c.needs.length ? JSON.stringify(best.c.needs).replaceAll('"', "'").replaceAll(',', ', ') : 'nothing'})`, area);
  const key = Object.keys(config.needs).find(k => matches(area, k));
  const raw = key ? config.needs[key] : [];
  const list = typeof raw === 'string' ? [raw] : Array.isArray(raw) ? raw : raw.needs;
  assert.equal(needs, list.join(', ') || '—', area);
}
console.log('B2W2 outbreaks (19/version), Dreamyard and access inventory ok');
