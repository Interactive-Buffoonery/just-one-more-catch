import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

export function loadGeneratedPack(name) {
  return JSON.parse(readFileSync(new URL(`../client/data/${name}.ts`, import.meta.url), 'utf8').split('export default ')[1].trim().replace(/;$/, ''));
}

export function loadGameRuntime(name) {
  const game = loadGeneratedPack(name);
  const source = readFileSync('client/game.ts', 'utf8');
  const packs = readFileSync('client/packs.ts', 'utf8');
  const pack = runInNewContext(stripTypeScriptTypes(packs.slice(packs.indexOf('const ALOLA_KIT'), packs.indexOf('const JOHTO_KIT')) + packs.slice(packs.indexOf(`const ${name.toUpperCase()}:`), packs.indexOf('export const VERSIONS'))) + '\n' + name.toUpperCase());
  const run = { caught: new Set(), badges: new Set(pack.badges.map(b => b[0])), kit: new Set(pack.kit.map(k => k[0])), events: new Set() };
  const context = {
    R: () => run, P: () => pack, EVENTS: Object.fromEntries(game.events.map(e => [e.id, e])),
    eventDone: id => run.events.has(id), isBadge: k => /^[A-Z]/.test(k),
    chapterNeeds: i => game.chapters[i].needs, needText: k => k,
    TIME: {}, DEX: game.dex, coinLabel: () => null, specialLabel: c => c,
  };
  const has = source.slice(source.indexOf('export function has('), source.indexOf('export const badgesWord')).replace('export ', '');
  const methods = source.slice(source.indexOf('export const METHOD:'), source.indexOf('export const ONE_TIME')).replace('export ', '');
  const conditions = source.slice(source.indexOf('export const OK_COND:'), source.indexOf('const STORY:')).replace('export ', '');
  const row = source.slice(source.indexOf('export function rowStatus('), source.indexOf('export function howElse(')).replace('export ', '');
  const status = runInNewContext(stripTypeScriptTypes(has + methods + conditions + row) + '\nrowStatus', context);
  return { game, run, context, status, methods, pack };
}
