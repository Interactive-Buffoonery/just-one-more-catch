import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

const game = JSON.parse(readFileSync('client/data/sm.ts', 'utf8').split('export default ')[1].trim().replace(/;$/, ''));
const source = readFileSync('client/game.ts', 'utf8');
const packs = readFileSync('client/packs.ts', 'utf8');
const sm = runInNewContext(stripTypeScriptTypes(packs.slice(packs.indexOf('const SM:'), packs.indexOf('export const VERSIONS'))) + '\nSM');
const run = { caught: new Set(), badges: new Set(sm.badges.map(b => b[0])), kit: new Set(sm.kit.map(k => k[0])), events: new Set() };
const context = {
  R: () => run, P: () => sm, EVENTS: Object.fromEntries(game.events.map(e => [e.id, e])),
  eventDone: id => run.events.has(id), isBadge: k => /^[A-Z]/.test(k),
  chapterNeeds: i => game.chapters[i].needs, needText: k => k,
  TIME: {}, DEX: game.dex, coinLabel: () => null, specialLabel: c => c,
};
const has = source.slice(source.indexOf('export function has('), source.indexOf('export const badgesWord')).replace('export ', '');
const methods = source.slice(source.indexOf('export const METHOD:'), source.indexOf('export const ONE_TIME')).replace('export ', '');
const conditions = source.slice(source.indexOf('export const OK_COND:'), source.indexOf('const STORY:')).replace('export ', '');
const row = source.slice(source.indexOf('export function rowStatus('), source.indexOf('export function howElse(')).replace('export ', '');
const status = runInNewContext(stripTypeScriptTypes(has + methods + conditions + row) + '\nrowStatus', context);
const mon = n => game.dex.find(p => p.n === n);
const first = (n, method) => mon(n).rows.find(r => !method || r.m === method);

// A Champion still needs each postgame mission; ticking the final report opens Necrozma.
run.badges.add('Elite Four');
for (const [n, mission] of [[793, 'sm-ub01'], [794, 'sm-ub02'], [795, 'sm-ub02'], [796, 'sm-ub03'], [797, 'sm-ub04'], [798, 'sm-ub04'], [799, 'sm-ub05'], [800, 'sm-ub-done']]) {
  run.events.clear();
  const r = first(n);
  assert.equal(status(r).need, mission, `#${n} must wait for its mission`);
  run.events.add(mission);
  assert.equal(status(r).s, 'now', `#${n} must open after its mission`);
}
for (const n of [791, 792]) {
  assert.equal(status(first(n)).need, 'sm-ultra-rescue');
}
run.events.add('sm-ultra-rescue');
for (const n of [791, 792]) assert.equal(status(first(n)).s, 'now');

// Early SOS waits for Ilima even when the ordinary grass already opens.
run.badges.delete('Normalium');
const earlySOS = game.dex.flatMap(p => p.rows).find(r => r.chap === 0 && r.m === 'sos');
assert.equal(status(earlySOS).need, 'Normalium');
run.badges.add('Normalium');
assert.equal(status(earlySOS).s, 'now');

// Ambush labels and kit requirements must follow the terrain, not PokeAPI's bucket.
const allRows = game.dex.flatMap(p => p.rows);
const landMethods = ['dirt-cloud', 'sand-cloud', 'rustling-grass', 'rustling-tree', 'rustling-bush', 'flying-shadow'];
const methodTable = runInNewContext(stripTypeScriptTypes(methods) + '\nMETHOD');
for (const m of landMethods) {
  assert.ok(allRows.some(r => r.m === m), `Missing ${m} encounters`);
  assert.equal(methodTable[m][1], null, `${m} must not require a kit item`);
}
assert.equal(allRows.filter(r => landMethods.includes(r.m)).length, 32);
for (const r of allRows.filter(r => /^(Route 2 |Route 3 North|Verdant Cavern|Route 5$|Route 7$|Diglett's Tunnel|Route 10$|Haina Desert|Vast Poni Canyon Inside|Poni Coast|Poni Plains|Lush Jungle West)/.test(r.place))) {
  assert.ok(!['bubbling-spots', 'sos-from-bubbling-spot'].includes(r.m), `${r.place} has a fishing ambush`);
}
run.kit.delete('fishing-rod');
run.badges.delete('Waterium');
const rattata = mon(19).rows.find(r => r.place === 'Route 2 North' && r.m === 'rustling-grass');
assert.equal(status(rattata).s, 'now', 'Land ambush must open without rod or Waterium');
const water = mon(129).rows.find(r => r.place === 'Paniola Town' && r.m === 'bubbling-spots');
assert.equal(status(water).need, 'fishing-rod');
run.kit.add('fishing-rod');
assert.equal(status(water).need, 'fishing-rod', 'Rod must still require Waterium');
run.badges.add('Waterium');
assert.equal(status(water).s, 'now');
for (const n of [351, 444]) {
  assert.ok(mon(n).rows.filter(r => r.place === 'Haina Desert').every(r => r.m === 'sos'));
}
const splash = mon(72).rows.find(r => r.place === 'Hano Beach' && r.m === 'water-splash');
assert.ok(splash);
run.kit.delete('surf');
assert.equal(status(splash).need, 'surf');
run.kit.add('surf');
const wailordSplash = mon(321).rows.find(r => r.place === 'Poni Wilds' && r.m === 'water-splash');
const wailordSOS = mon(321).rows.find(r => r.place === 'Poni Wilds' && r.m === 'sos-from-bubbling-spot');
assert.ok(wailordSplash);
assert.ok(wailordSOS);
run.events.add('sm-aether');
run.kit.delete('fishing-rod');
assert.equal(status(wailordSplash).s, 'now');
assert.equal(status(wailordSOS).need, 'fishing-rod');
run.kit.add('fishing-rod');

// Selecting Machamp after Nanu must not bypass the later Aether rescue.
const machampRows = allRows.filter(r => r.need?.includes('machamp'));
assert.ok(machampRows.length);
run.events.delete('sm-aether');
for (const r of machampRows) assert.equal(status(r).need, 'sm-aether');
run.events.add('sm-aether');
for (const r of machampRows) assert.equal(status(r).s, 'now');

for (const [n, code] of [[791, 'S'], [792, 'M'], [794, 'S'], [795, 'M'], [797, 'M'], [798, 'S']]) {
  assert.ok(mon(n).rows.length);
  assert.ok(mon(n).rows.every(r => r.v === code), `Wrong version for #${n}`);
}
assert.ok(game.dex.every(p => p.rows.every(r => !r.place.includes('New Mauville'))));
const magearna = mon(801).rows;
assert.equal(magearna.length, 1);
assert.equal(magearna[0].v, 'SM');
assert.equal(magearna[0].place, "Hau'oli City Shopping District");
assert.equal(magearna[0].m, 'gift');
assert.equal(magearna[0].lo, 50);
assert.equal(magearna[0].hi, 50);
assert.ok(magearna[0].cond.includes('Scan the regional Magearna QR Code'));
run.badges.delete('Elite Four');
assert.equal(status(magearna[0]).need, 'Elite Four');
run.badges.add('Elite Four');
assert.equal(status(magearna[0]).s, 'special');
assert.equal(status(magearna[0]).why, 'Scan the regional Magearna QR Code');
console.log('Sun/Moon: mission availability, rescue, ambush terrain, Machamp and version exclusives ok');
