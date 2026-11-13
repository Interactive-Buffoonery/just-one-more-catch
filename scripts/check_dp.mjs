import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
const game = JSON.parse(readFileSync('client/data/dp.ts', 'utf8').split('export default ')[1].replace(/;\s*$/, ''));
const mon = n => game.dex[n - 1];
assert.equal(game.dex.length, 493);
assert.equal(game.dex.filter(p => p.j).length, 151);
assert.deepEqual(mon(35).types, ['normal']);
for (const n of [387, 390, 393]) assert(mon(n).rows.some(r => r.place === 'Lake Verity' && r.m === 'gift' && r.chap === 0));
assert(mon(483).rows.every(r => r.v === 'd'));
assert(mon(484).rows.every(r => r.v === 'p'));
assert(mon(434).rows.every(r => r.v === 'd'));
assert(mon(431).rows.every(r => r.v === 'p'));
assert.equal(mon(487).rows.length, 0); // Known PokeAPI gap; do not synthesize a Giratina row.
for (const n of [491, 492, 493]) assert.equal(mon(n).rows.length, 0);
for (const p of game.dex) {
  for (const prefix of ['', 'shiny/']) assert(existsSync(`public/sprites/dp/${prefix}${p.n}.png`));
  for (const f of p.forms || []) for (const prefix of ['', 'shiny/']) assert(existsSync(`public/sprites/dp/forms/${prefix}${f.id}.png`));
  for (const r of p.rows) {
    assert(!r.cond.includes('story-progress-national-dex'));
    assert(r.c > 0 && r.c <= 100);
    if (r.cond.some(c => /^(radar-on|slot2-|swarm-yes|backlot-mentioned)/.test(c))) assert(r.need?.includes('national-dex'));
  }
}
const source = readFileSync('client/game.ts', 'utf8');
const packs = readFileSync('client/packs.ts', 'utf8');
const pack = runInNewContext(stripTypeScriptTypes(packs.slice(packs.indexOf('const DP:'), packs.indexOf('const USUM:'))) + '\nDP');
const known = new Set([...game.events.map(e => e.id), ...pack.kit.map(k => k[0]), ...pack.badges.map(b => b[0]), 'Elite Four']);
for (const c of game.chapters) for (const n of c.needs) assert(known.has(n), n);
for (const p of game.dex) for (const r of p.rows) for (const n of r.need || []) assert(known.has(n), n);
const run = { caught: new Set(), badges: new Set(), kit: new Set(), events: new Set() };
const context = {
  R: () => run, P: () => pack, EVENTS: Object.fromEntries(game.events.map(e => [e.id, e])),
  eventDone: id => run.events.has(id), isBadge: k => /^[A-Z]/.test(k),
  chapterNeeds: i => game.chapters[i].needs, needText: k => k,
  TIME: { 'time-night': 'Night' }, OK_COND: {}, DEX: game.dex,
};
const has = source.slice(source.indexOf('export function has('), source.indexOf('export const badgesWord')).replace('export ', '');
const methods = source.slice(source.indexOf('export const METHOD:'), source.indexOf('export const ONE_TIME')).replace('export ', '');
const rows = source.slice(source.indexOf('export function rowStatus('), source.indexOf('export function howElse(')).replace('export ', '');
const status = runInNewContext(stripTypeScriptTypes(has + methods + rows) + '\nrowStatus', context);
const eevee = mon(133).rows.find(r => r.m === 'gift');
run.kit.add('bicycle');
run.badges.add('Elite Four');
assert.equal(status(eevee).need, 'national-dex');
run.events.add('national-dex');
assert.equal(status(eevee).s, 'now');
const psyduck = mon(54).rows.find(r => r.m === 'surf' && r.chap === 0);
run.kit.add('surf');
assert.equal(status(psyduck).need, 'surf');
run.badges.add('Relic');
assert.equal(status(psyduck).s, 'now');
console.log('D/P: version exclusives, National Dex, HM badges, forms and sprites ok');
