import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

const data = JSON.parse(readFileSync('client/data/b2w2.ts', 'utf8').split('export default ')[1].replace(/;\s*$/, ''));
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
