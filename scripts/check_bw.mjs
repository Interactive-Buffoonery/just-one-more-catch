import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

const data = JSON.parse(readFileSync('client/data/bw.ts', 'utf8').split('export default ')[1].trim().replace(/;$/, ''));
const config = JSON.parse(readFileSync('data/bw.json', 'utf8'));
const source = readFileSync('client/game.ts', 'utf8');
const mon = n => data.dex.find(p => p.n === n);
const needs = r => [...data.chapters[r.chap].needs, ...(data.chapters[r.chap].kit ? [data.chapters[r.chap].kit] : []), ...(r.need || [])];
assert.equal(data.dex.length, 649);
assert.equal(data.dex.filter(p => p.j != null).length, 156);
assert.equal(mon(494).j, 0);
for (const [n, code] of [[643, 'k'], [644, 'w']]) {
  assert.ok(mon(n).rows.length);
  assert.ok(mon(n).rows.every(r => r.v === code));
  assert.ok(mon(n).rows.filter(r => r.place === 'Dragonspiral Tower 7F').every(r => needs(r).includes('dragon-deferred')));
}
for (const n of [641, 642]) assert.equal(mon(n).rows.length, 0);
for (const n of [495, 498, 501]) assert.ok(mon(n).rows.some(r => r.place === 'Nuvema Town' && r.m === 'gift'));
for (const [n, starter] of [[511, 'tepig'], [513, 'oshawott'], [515, 'snivy']]) {
  const r = mon(n).rows.find(r => r.place === 'Dreamyard' && r.m === 'gift');
  assert.deepEqual(r.cond, ['starter-' + starter]);
  assert.ok(!needs(r).includes('cut-hm'));
}
assert.ok(mon(518).rows.filter(r => r.m === 'static').every(r => r.cond.includes('weekday-friday') && needs(r).includes('ghetsis')));
for (const n of [639, 640]) assert.ok(mon(n).rows.every(r => needs(r).includes('cobalion-battle')));
assert.ok(mon(646).rows.every(r => needs(r).includes('kyurem-snow') && needs(r).includes('ghetsis')));
assert.ok(mon(645).rows.every(r => needs(r).includes('landorus-party') && needs(r).includes('waterfall')));
const stone = config.events.find(e => e.id === 'stone-received');
assert.equal(stone.chap, 9);
assert.deepEqual(stone.after, ['dragon-awakened']);
assert.ok(!data.chapters[stone.chap].needs.includes(stone.id));
const rows = data.dex.flatMap(p => p.rows);
const route9 = rows.filter(r => r.place === 'Route 9');
assert.ok(route9.length);
assert.ok(route9.every(r => needs(r).includes('stone-received')));
assert.ok(rows.filter(r => r.place.startsWith('Relic Castle B')).every(r => !needs(r).includes('stone-received')));
assert.ok(mon(645).rows.some(r => r.v.includes('k')));
assert.ok(mon(645).rows.every(r => !r.cond.includes('special-encounter-couldnt-capture-before')));
const dreamyardDark = rows.filter(r => r.place.startsWith('Dreamyard') && r.m === 'dark-grass');
assert.ok(dreamyardDark.length);
assert.ok(dreamyardDark.every(r => !needs(r).includes('cut-hm') && needs(r).includes('ghetsis')));
const basementRules = config.row_needs.filter(r => r.place === 'Dreamyard B1F');
assert.ok(basementRules.length);
assert.ok(basementRules.every(r => !r.needs.includes('cut-hm')));
const musharnaStatics = mon(518).rows.filter(r => r.m === 'static');
assert.equal(musharnaStatics.length, 1);
assert.ok(!needs(musharnaStatics[0]).includes('cut-hm'));
const ruinsGrass = rows.filter(r => r.place === 'Dreamyard' && ['walk', 'grass-spots'].includes(r.m));
assert.ok(ruinsGrass.length);
assert.ok(ruinsGrass.every(r => needs(r).includes('cut-hm')));
assert.ok(mon(494).rows.every(r => needs(r).includes('liberty-pass')));
assert.ok(mon(570).rows.every(r => needs(r).includes('event-celebi')));
assert.ok(mon(571).rows.every(r => needs(r).includes('event-beast')));
assert.ok(mon(585).rows.some(r => r.cond.includes('season-winter')));
assert.ok(mon(462).evo.includes('Chargestone'));
assert.ok(mon(470).evo.includes('Pinwheel'));
assert.ok(mon(471).evo.includes('Twist Mountain'));
assert.ok(mon(350).evo.includes('Prism Scale'));
for (const p of data.dex) {
  for (const prefix of ['', 'shiny/']) assert.ok(existsSync(`public/sprites/bw/${prefix}${p.n}.png`));
  for (const r of p.rows) {
    assert.ok(r.c > 0 && r.c <= 100);
    assert.ok(/^[kw]+$/.test(r.v));
    assert.ok(!r.place.includes('Team Flare'));
  }
}
const known = new Set([...config.events.map(e => e.id), 'Trio', 'Basic', 'Insect', 'Bolt', 'Quake', 'Jet', 'Freeze', 'Legend', 'Elite Four', 'cut-hm', 'surf', 'strength', 'waterfall', 'super-rod', 'bicycle']);
for (const p of data.dex) for (const r of p.rows) for (const k of needs(r)) assert.ok(known.has(k), k);

// Regional #000 must be visible, numbered and counted before the League.
const run = { caught: new Set([494, 495, 1]), badges: new Set(), kit: new Set(), events: new Set() };
const context = { R: () => run, e4: () => false, byN: Object.fromEntries(data.dex.map(p => [p.n, p])) };
const regional = runInNewContext(stripTypeScriptTypes(source.slice(source.indexOf('export const visible ='), source.indexOf('export const gameTime')).replaceAll('export ', '')) + '\n({visible, num, regionalCaught})', context);
assert.equal(regional.visible(mon(494)), true);
assert.equal(regional.num(mon(494)), 0);
assert.equal(regional.regionalCaught(), 2);
assert.equal(regional.visible(mon(1)), false);
console.log('Black/White: regional #000, version exclusives, conditions, gates and assets ok');
