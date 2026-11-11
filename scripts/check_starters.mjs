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
