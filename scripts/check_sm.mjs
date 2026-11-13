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

for (const [n, code] of [[791, 'S'], [792, 'M'], [794, 'S'], [795, 'M'], [797, 'M'], [798, 'S']]) {
  assert.ok(mon(n).rows.length);
  assert.ok(mon(n).rows.every(r => r.v === code), `Wrong version for #${n}`);
}
assert.ok(game.dex.every(p => p.rows.every(r => !r.place.includes('New Mauville'))));
assert.equal(mon(801).rows.length, 0, 'Do not synthesize a missing Magearna encounter');
console.log('Sun/Moon: mission availability, rescue, early SOS and version exclusives ok');
