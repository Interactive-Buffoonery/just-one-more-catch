import { loadGeneratedPack } from './check-utils.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {runInNewContext} from 'node:vm';
const source = readFileSync(new URL('../client/game.ts', import.meta.url), 'utf8');
const start = source.indexOf('export function rowStatus(');
const end = source.indexOf('export function howElse(', start);
const rows = [1, 2, 3].map(() => ({place: 'Start', chap: 0, m: 'gift', cond: []}));
const run = {caught: new Set(), badges: new Set()};
const status = runInNewContext(stripTypeScriptTypes(source.slice(start, end).replace('export ', '')) + '\nrowStatus', {
  EVENTS: {}, eventPick: () => undefined,
  R: () => run, P: () => ({start: 'Start', starters: [1, 2, 3]}),
  chapterNeeds: () => [], METHOD: {}, TIME: {}, OK_COND: {},
  DEX: rows.map((r, i) => ({n: i + 1, rows: [r]})),
});
assert.equal(status(rows[0]).s, 'now');
run.caught.add(1);
assert.equal(status(rows[0]).why, 'Your starter');
assert.equal(status(rows[0]).kind, 'starter');
assert.equal(status(rows[1]).why, 'Trade only');
assert.equal(status(rows[1]).kind, 'trade');
assert.equal(status(rows[2]).why, 'Trade only');
assert.equal(status(rows[0]).s, 'special');
run.caught.add(2);
assert.equal(status(rows[1]).why, 'Your starter');
assert.equal(status(rows[1]).kind, 'starter');
console.log('starter tags ok');
const frlg = loadGeneratedPack('frlg');
for (const n of [249, 250, 386]) {
  const rows = frlg.dex.find(p => p.n === n).rows;
  for (const code of ['F', 'L']) assert.ok(rows.some(r => r.v.includes(code) && r.m === 'static' && r.need.includes('Elite Four')));
  assert.ok(rows.every(r => !r.v.includes('f') && !r.v.includes('l')));
}

const events = {fossil: {id: 'fossil', pick: {options: [138, 140], tag: 'Your fossil'}}};
const giftRows = [138, 140].map(() => ({place: 'Lab', chap: 0, m: 'gift', cond: []}));
run.events = new Set();
run.caught.clear();
const pickSource = source.slice(source.indexOf('export const eventPick'), source.indexOf('export function clearPick')).replace('export ', '');
const giftStatus = runInNewContext(stripTypeScriptTypes(pickSource + source.slice(start, end).replace('export ', '')) + '\nrowStatus', {
  EVENTS: events, R: () => run, P: () => ({start: 'Start', starters: []}),
  chapterNeeds: () => [], METHOD: {}, TIME: {}, OK_COND: {},
  DEX: giftRows.map((r, i) => ({n: [138, 140][i], rows: [r]})),
});
assert.equal(giftStatus(giftRows[0]).s, 'now');
run.events.add('pick:fossil:138');
assert.equal(giftStatus(giftRows[0]).why, 'Your fossil');
assert.equal(giftStatus(giftRows[1]).why, 'Trade only');
run.caught.add(140);
assert.equal(giftStatus(giftRows[0]).why, 'Your fossil');
run.events.clear();
assert.equal(giftStatus(giftRows[1]).why, 'Your fossil');
assert.equal(giftStatus(giftRows[0]).why, 'Trade only');
console.log('gift picks ok');

const doneSource = source.slice(source.indexOf('export const eventDone'), source.indexOf('// An HM only counts')).replace('export ', '');
const giftDone = runInNewContext(stripTypeScriptTypes(pickSource + doneSource) + '\neventDone', {
  EVENTS: events, R: () => run, forced: () => false, laterEvents: () => [],
});
assert.equal(giftDone('fossil'), true);
run.caught.clear();
assert.equal(giftDone('fossil'), false);
run.events.add('pick:fossil:138');
assert.equal(giftDone('fossil'), true);
