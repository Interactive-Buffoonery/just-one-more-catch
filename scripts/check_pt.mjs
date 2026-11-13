import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import { execFileSync } from 'node:child_process';

const game = JSON.parse(readFileSync('client/data/pt.ts', 'utf8').split('export default ')[1].trim().replace(/;$/, ''));
const mon = n => game.dex.find(p => p.n === n);
const needs = r => [...game.chapters[r.chap].needs, ...(r.need || [])];
assert.equal(game.dex.length, 493);
assert.equal(game.dex.filter(p => p.j).length, 210);
for (const n of [387, 390, 393]) assert.ok(mon(n).rows.some(r => r.place === 'Route 201' && r.m === 'gift'));
for (const n of [483, 484]) assert.ok(mon(n).rows.every(r => needs(r).includes('Elite Four') && needs(r).includes('dragon-legend')));
assert.ok(mon(487).rows.some(r => r.place === 'Distortion World' && !needs(r).includes('Elite Four')));
assert.ok(mon(479).rows.some(r => !needs(r).includes('national-dex')));
assert.ok(mon(425).rows.some(r => r.cond.includes('weekday-friday') && needs(r).includes('windworks')));
for (const p of game.dex) for (const r of p.rows) {
  assert.equal(r.v, 't');
  assert.ok(!r.cond.includes('story-progress-national-dex'));
  if (r.cond.includes('radar-on')) assert.ok(needs(r).includes('national-dex') && needs(r).includes('poke-radar'));
  assert.ok(!/Flower Paradise|Newmoon Island|Hall of Origin|Pokemart/.test(r.place));
  assert.notEqual(r.m, 'pokemon-ranger');
}

const rows = game.dex.flatMap(p => p.rows);
const league = rows.filter(r => r.place === 'Pokémon League');
assert.ok(league.length > 0);
for (const r of league) assert.ok(needs(r).includes('surf') && needs(r).includes('waterfall'));
assert.ok(!rows.some(r => r.place === 'Turnback Cave After Pillar 3' && r.m === 'walk'));
assert.ok(mon(487).rows.some(r => r.place === 'Turnback Cave After Pillar 3' && r.m === 'static' && r.lo === 47));
for (const place of ['Before Pillar 1', 'Between Pillars 1 And 2', 'Between Pillars 2 And 3', 'Pillar 1', 'Pillar 2', 'Pillar 3']) {
  assert.ok(rows.some(r => r.place === `Turnback Cave ${place}` && r.m === 'walk'));
}

const source = readFileSync('client/game.ts', 'utf8');
const packs = readFileSync('client/packs.ts', 'utf8');
const platinum = runInNewContext(stripTypeScriptTypes(packs.slice(packs.indexOf('const PLATINUM:'), packs.indexOf('const USUM:'))) + '\nPLATINUM');
const run = { caught: new Set(), badges: new Set(['Elite Four']), kit: new Set(['poke-radar', 'defog', 'surf']), events: new Set() };
const context = {
  R: () => run, P: () => platinum, EVENTS: Object.fromEntries(game.events.map(e => [e.id, e])),
  eventDone: id => run.events.has(id), isBadge: k => /^[A-Z]/.test(k),
  chapterNeeds: i => game.chapters[i].needs,
  needText: k => k, TIME: {}, OK_COND: {}, DEX: game.dex,
  coinLabel: () => null, specialLabel: c => c,
};
const hasCode = source.slice(source.indexOf('export function has('), source.indexOf('export const badgesWord')).replace('export ', '');
const methods = source.slice(source.indexOf('export const METHOD:'), source.indexOf('export const ONE_TIME')).replace('export ', '');
const rowCode = source.slice(source.indexOf('export function rowStatus('), source.indexOf('export function howElse(')).replace('export ', '');
const { status, has } = runInNewContext(stripTypeScriptTypes(hasCode + methods + rowCode) + '\n({status: rowStatus, has})', context);
// Defeating the League alone does not unlock Radar; seeing 210 and receiving the upgrade does.
const radar = game.dex.flatMap(p => p.rows).find(r => r.chap === 0 && r.cond.includes('radar-on'));
assert.ok(radar);
assert.equal(status(radar).need, 'national-dex');
run.badges.delete('Elite Four');
run.events.add('national-dex');
assert.equal(status(radar).s, 'special');
run.kit.delete('poke-radar');
assert.equal(status(radar).need, 'poke-radar');
// Platinum's third badge permits Defog; Surf waits for the fifth badge.
run.badges.add('Relic');
assert.equal(has('defog'), true);
assert.equal(has('surf'), false);
run.badges.add('Fen');
assert.equal(has('surf'), true);
execFileSync('python3', ['scripts/check_pt_generator.py'], { stdio: 'inherit', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
console.log('Platinum: dex, special encounters, National Dex and HM progression ok');
