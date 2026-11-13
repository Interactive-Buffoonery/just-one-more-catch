import { loadGeneratedPack } from './check-utils.mjs';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const game = loadGeneratedPack('yellow');
const mon = n => game.dex.find(p => p.n === n);
assert.equal(game.dex.length, 151);
for (const n of [25, 35, 39, 106, 107, 113, 122, 124, 125, 126, 143]) {
  assert.equal(mon(n).from, null, `${mon(n).name} has no pre-evolution in Gen 1`);
  assert.equal(mon(n).evo, null);
}
for (const n of [81, 82]) assert.deepEqual(mon(n).types, ['electric']);
assert.deepEqual(mon(35).types, ['normal']);
assert.deepEqual(mon(122).types, ['psychic']);
assert.match(mon(26).evo, /starter Pikachu refuses/);
assert.equal(mon(65).evo, 'Trade');
assert.equal(mon(149).evo, 'Lv 55');
assert.ok(mon(1).rows.some(r => r.m === 'gift' && r.need.includes('pikachu-happy')));
assert.ok(mon(7).rows.some(r => r.m === 'gift' && r.need.includes('Thunder')));
assert.ok(mon(4).rows.some(r => r.m === 'gift' && r.chap === 1 && !r.need));
assert.ok(mon(131).rows.every(r => r.need.includes('fuji') && r.need.includes('silph-rival')));
assert.ok(mon(144).rows.every(r => r.need.includes('strength')));
assert.ok(mon(146).rows.every(r => r.place === 'Victory Road (2F)' && r.need.includes('strength')));
assert.ok(mon(150).rows.every(r => game.chapters[r.chap].needs.includes('Elite Four')));
// Keep floor-specific odds: merging these would inflate both catches to 100%.
assert.ok(mon(74).rows.some(r => r.place === 'Rock Tunnel (1F)' && r.m === 'walk' && r.c === 40));
assert.ok(mon(74).rows.some(r => r.place === 'Rock Tunnel (B1F)' && r.m === 'walk' && r.c === 30));
for (const p of game.dex) {
  assert.ok(!p.from || game.dex.some(pre => pre.name === p.from));
  assert.ok(!p.forms);
  for (const r of p.rows) {
    assert.equal(r.v, 'y');
    assert.ok(r.c > 0 && r.c <= 100);
    assert.ok(!r.cond.some(c => c.startsWith('time-')));
    if (r.place === 'Route 23' && r.m === 'walk') assert.ok(r.need.includes('Marsh') && r.need.includes('surf'));
  }
  for (const prefix of ['', 'shiny/']) assert.ok(existsSync(`public/sprites/yellow/${prefix}${p.n}.png`));
  assert.ok(readFileSync(`public/sprites/yellow/${p.n}.png`).equals(readFileSync(`public/sprites/yellow/shiny/${p.n}.png`)));
}
console.log('Yellow: Gen 1 evolutions/types, gift gates, floor odds and original sprites ok');
