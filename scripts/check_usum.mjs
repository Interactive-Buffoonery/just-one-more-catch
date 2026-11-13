import { loadGameRuntime } from './check-utils.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

const { game, run, context, status, methods, pack: usum } = loadGameRuntime('usum');
const mon = n => game.dex.find(p => p.n === n);
const first = (n, method) => mon(n).rows.find(r => !method || r.m === method);

// Verify each terrain correction and its source bucket, including species filters.
const config = JSON.parse(readFileSync('data/usum.json', 'utf8'));
const allRows = game.dex.flatMap(p => p.rows);
const methodTable = runInNewContext(stripTypeScriptTypes(methods) + '\nMETHOD');
const landMethods = ['dirt-cloud', 'sand-cloud', 'rustling-grass', 'rustling-tree', 'rustling-bush', 'flying-shadow', 'cave-shadow'];
for (const m of landMethods) {
  assert.ok(allRows.some(r => r.m === m), `Missing ${m}`);
  assert.equal(methodTable[m][1], null);
}
assert.equal(allRows.filter(r => landMethods.includes(r.m)).length, 44);
for (const override of config.area_methods) {
  const place = override.place.replace('Digletts', "Diglett's");
  const rows = game.dex.filter(p => !override.species || override.species.includes(p.n))
    .flatMap(p => p.rows).filter(r => r.place === place || r.place.startsWith(place + ' '));
  assert.ok(rows.some(r => r.m === override.methods['bubbling-spots']), `Missing terrain for ${place}`);
  assert.ok(rows.every(r => !Object.keys(override.methods).includes(r.m)), `Fishing ambush at ${place}`);
}
run.kit.delete('fishing-rod');
run.badges.delete('Waterium');
const ekans = mon(23).rows.find(r => r.place === 'Route 2 North' && r.m === 'rustling-grass');
assert.equal(status(ekans).s, 'now');
const fish = mon(129).rows.find(r => r.place === 'Paniola Town' && r.m === 'bubbling-spots');
assert.equal(status(fish).need, 'fishing-rod');
run.kit.add('fishing-rod');
assert.equal(status(fish).s, 'now');
run.badges.add('Waterium');
for (const n of [343, 351, 444, 622]) {
  const rows = mon(n).rows.filter(r => r.place === 'Haina Desert');
  assert.ok(rows.length);
  assert.ok(rows.every(r => r.m === 'sos'));
}
for (const [n, place] of [[72, 'Hano Beach'], [321, 'Poni Breaker Coast'], [691, 'Poni Breaker Coast'], [693, 'Poni Breaker Coast']]) {
  const splash = mon(n).rows.find(r => r.place === place && r.m === 'water-splash');
  assert.ok(splash);
  run.kit.delete('surf');
  assert.equal(status(splash).need, 'surf');
  run.kit.add('surf');
  run.kit.delete('fishing-rod');
  run.events.add('aether');
  assert.equal(status(splash).s, 'now');
}
const wailordSOS = mon(321).rows.find(r => r.place === 'Poni Breaker Coast' && r.m === 'sos-from-bubbling-spot');
assert.equal(status(wailordSOS).need, 'fishing-rod');
run.kit.add('fishing-rod');
run.events.delete('aether');
run.badges.add('Elite Four');
const machampRows = allRows.filter(r => r.need?.includes('machamp'));
assert.ok(machampRows.length);
for (const r of machampRows) assert.equal(status(r).need, 'aether');
run.events.add('aether');
for (const r of machampRows) assert.equal(status(r).s, 'now');
const diglett = mon(50).rows.find(r => r.place === 'Route 5' && r.m === 'dirt-cloud');
assert.ok(diglett.need.includes('Firium'), 'Preserve the northern Route 5 approach');
console.log('Ultra Sun/Moon: ambush terrain, fishing, splash and Machamp gates ok');
