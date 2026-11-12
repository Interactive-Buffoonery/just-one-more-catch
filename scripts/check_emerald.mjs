import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

const game = JSON.parse(readFileSync('client/data/emerald.ts', 'utf8').split('export default ')[1].trim().replace(/;$/, ''));
const pack = JSON.parse(readFileSync('data/emerald.json', 'utf8'));
const mon = n => game.dex.find(p => p.n === n);
const needs = r => [...game.chapters[r.chap].needs, ...(r.need || [])];
assert.equal(game.dex.length, 386);
assert.equal(game.dex.filter(p => p.j).length, 202);
// Later-generation babies must not leak into Emerald's evolution instructions.
for (const n of [113, 122, 143, 185, 315, 358]) {
  assert.equal(mon(n).from, null);
  assert.equal(mon(n).evo, null);
}
assert.deepEqual(mon(35).types, ['normal']);
assert.deepEqual(mon(81).types, ['electric', 'steel']);
for (const n of [252, 255, 258]) assert.ok(mon(n).rows.some(r => r.place === 'Route 101' && r.m === 'gift' && r.chap === 0));
for (const n of [27, 328, 331, 343]) {
  const r = mon(n).rows.find(r => r.place === 'Route 111' && r.m === 'walk');
  assert.ok(needs(r).includes('goggles'));
}
for (const n of [380, 381]) for (const r of mon(n).rows.filter(r => r.place === 'Roaming Hoenn')) {
  assert.ok(needs(r).includes('Elite Four'));
  assert.ok(needs(r).includes(n === 380 ? 'tv-red' : 'tv-blue'));
}
assert.ok(mon(374).rows.every(r => needs(r).includes('Elite Four')));
assert.ok(mon(384).rows.every(r => needs(r).includes('rayquaza') && needs(r).includes('mach-bike')));
assert.ok(mon(371).rows.every(r => needs(r).includes('waterfall')));
assert.ok(mon(349).rows.some(r => r.m === 'feebas-tile-fishing' && r.c === 50));
for (const n of [27, 328]) assert.ok(mon(n).rows.filter(r => r.place === 'Mirage Tower').every(r => !needs(r).includes('mach-bike')));
assert.ok(mon(81).rows.filter(r => r.place === 'New Mauville Entrance').every(r => !needs(r).includes('basement-key')));
for (const n of [380, 381]) assert.ok(mon(n).rows.filter(r => r.place === 'Southern Island').every(r => needs(r).includes(n === 380 ? 'tv-blue' : 'tv-red')));
for (const p of game.dex) for (const r of p.rows) {
  if (r.place === 'Fortree City' || r.place === 'Route 120') assert.ok(needs(r).includes('weather-institute'));
  if (r.place === 'Route 123') assert.ok(needs(r).includes('scope'));
  if (r.place === 'Victory Road B2F') assert.ok(needs(r).includes('strength'));
}

for (const p of game.dex) {
  assert.ok(!p.from || game.dex.some(pre => pre.name === p.from));
  for (const r of p.rows) {
    assert.equal(r.v, 'e');
    assert.ok(r.c > 0 && r.c <= 100);
    assert.ok(!/^Cave of Origin B[123]F$/.test(r.place));
    assert.notEqual(r.place, 'Team Magma Hideout');
    if (r.place.startsWith('Safari Zone Expansion')) assert.ok(needs(r).includes('Elite Four'));
  }
  for (const prefix of ['', 'shiny/']) assert.ok(existsSync(`public/sprites/emerald/${prefix}${p.n}.png`));
}
const known = new Set([...pack.events.map(e => e.id), 'Stone', 'Knuckle', 'Dynamo', 'Heat', 'Balance', 'Feather', 'Mind', 'Rain', 'Elite Four', 'surf', 'dive', 'waterfall', 'rock-smash', 'strength', 'mach-bike', 'acro-bike']);
for (const c of game.chapters) for (const n of c.needs) assert.ok(known.has(n), `Unknown chapter need: ${n}`);
for (const p of game.dex) for (const r of p.rows) for (const n of r.need || []) assert.ok(known.has(n), `Unknown row need: ${n}`);
console.log('Emerald: historical species, progression, special methods and assets ok');

// Exercise the actual game's HM badge and row availability code.
const source = readFileSync('client/game.ts', 'utf8');
const packs = readFileSync('client/packs.ts', 'utf8');
const emerald = runInNewContext(stripTypeScriptTypes(packs.slice(packs.indexOf('const EMERALD:'), packs.indexOf('const USUM:'))) + '\nEMERALD');
const run = { caught: new Set(), badges: new Set(), kit: new Set(), events: new Set(['stern']) };
const context = {
  R: () => run, P: () => emerald, EVENTS: Object.fromEntries(game.events.map(e => [e.id, e])),
  eventDone: id => run.events.has(id), isBadge: k => /^[A-Z]/.test(k),
  chapterNeeds: i => game.chapters[i].needs,
  needText: k => k, TIME: {}, OK_COND: {}, DEX: game.dex,
};
const hasCode = source.slice(source.indexOf('export function has('), source.indexOf('export const badgesWord')).replace('export ', '');
const methods = source.slice(source.indexOf('export const METHOD:'), source.indexOf('export const ONE_TIME')).replace('export ', '');
const rowCode = source.slice(source.indexOf('export function rowStatus('), source.indexOf('export function howElse(')).replace('export ', '');
const status = runInNewContext(stripTypeScriptTypes(hasCode + methods + rowCode) + '\nrowStatus', context);
run.kit.add('rock-smash');
const rock = mon(74).rows.find(r => r.place === 'Route 111' && r.m === 'rock-smash');
assert.equal(status(rock).need, 'rock-smash');
run.badges.add('Dynamo');
assert.equal(status(rock).need, 'museum');
context.EVENTS.museum = {};
run.events.add('museum');
assert.equal(status(rock).s, 'now');
run.kit.add('surf'); run.badges.add('Balance'); run.kit.add('dive');
const underwater = mon(170).rows.find(r => r.place === 'Route 124 Underwater');
context.EVENTS['aqua-hideout'] = {}; run.events.add('aqua-hideout');
assert.equal(status(underwater).need, 'dive');
run.badges.add('Mind');
assert.equal(status(underwater).s, 'now');
const feebas = { ...mon(349).rows.find(r => r.m === 'feebas-tile-fishing'), chap: 0, need: [] };
assert.equal(status(feebas).need, 'old-rod');
for (const rod of ['old-rod', 'good-rod', 'super-rod']) {
  run.kit.add(rod);
  assert.equal(status(feebas).s, 'now');
  run.kit.delete(rod);
}
console.log('Emerald runtime rules: HM badges and Feebas with any rod ok');
