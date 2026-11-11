import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { runInNewContext } from "node:vm";

const read = (p) => readFileSync(p, "utf8");
const data = (pack) => JSON.parse(read(`client/data/${pack}.ts`).split("export default ")[1].replace(/;\s*$/, ""));
const catalogs = {};
for (const pack of ["crystal", "frlg", "hgss", "usum"]) {
  const source = JSON.parse(read(`data/${pack}.json`)).obtainable_forms;
  const dex = data(pack).dex;
  catalogs[pack] = dex;
  for (const [n, ids] of Object.entries(source)) {
    const p = dex.find((p) => p.n === +n);
    assert.deepEqual(p.forms.map((f) => f.id), ids);
    assert.equal(new Set(ids).size, ids.length);
    for (const f of p.forms) {
      assert(f.name && /^[a-z0-9-]+$/.test(f.id));
      assert(!/mega|totem|meteor|cosplay|cap$|zen|primal|(?:^|-)ash(?:-|$)|eternal|complete/.test(f.id), f.id);
      for (const shiny of ["", "shiny/"]) assert(existsSync(`public/sprites/${pack}/forms/${shiny}${f.id}.png`));
    }
  }
  assert.equal(dex.filter((p) => p.forms).length, Object.keys(source).length);
}
assert.equal(catalogs.crystal.find((p) => p.n === 201).forms.length, 26);
assert.equal(catalogs.hgss.find((p) => p.n === 201).forms.length, 28);
assert.equal(catalogs.frlg.find((p) => p.n === 201).forms.length, 28);
assert.equal(catalogs.hgss.find((p) => p.n === 19).forms, undefined);
assert.deepEqual(catalogs.usum.find((p) => p.n === 19).forms.map((f) => f.id), ["rattata-alola"]);
assert.equal(catalogs.usum.find((p) => p.n === 774).forms.length, 7);
assert.equal(catalogs.usum.find((p) => p.n === 745).forms.length, 2);

const source = read("client/game.ts");
const defaults = { nick: "", lvl: "", g: "", shiny: false, item: "", note: "" };
const stateCode = source.slice(source.indexOf("function loadRun("), source.indexOf("export let bridge:"));
let current;
const api = runInNewContext(stripTypeScriptTypes(stateCode.replaceAll("export ", "")) + "\n({ loadRun, dumpRun, collectedForms })", {
  verOf: () => ({ pack: { start: "Start", boxes: [2] } }),
  MON_DEFAULTS: defaults,
  compactMon: (m) => Object.fromEntries(Object.entries(m).filter(([k, v]) => defaults[k] !== v)),
  R: () => current,
});
const row = { id: "guest", version: "heartgold" };
current = api.loadRun(row, "{}");
assert.equal(current.forms.size, 0);
assert.equal(current.caught.size, 0);
current = api.loadRun(row, JSON.stringify({ forms: ["unown-b", "unown-b"], mons: [{ id: 1, n: 201, box: 1 }, { id: 2, n: 201, box: 1, form: "unown-question" }] }));
const unown = catalogs.hgss.find((p) => p.n === 201);
assert.deepEqual([...api.collectedForms(unown)].sort(), ["unown-a", "unown-b", "unown-question"]);
current.caught.add(201);
const roundtrip = api.loadRun(row, api.dumpRun(current));
assert.equal(roundtrip.forms.size, 1);
assert(roundtrip.forms.has("unown-b"));
assert.equal(roundtrip.mons[0].form, undefined);
assert.equal(roundtrip.mons[1].form, "unown-question");
assert.equal(roundtrip.caught.size, 1);
assert.equal(api.loadRun(row, '{"forms":null}').forms.size, 0);
assert.equal(api.loadRun(row, '{"forms":{}}').forms.size, 0);
assert.equal(api.loadRun(row, '{"forms":[null,1,"unown-a"]}').forms.size, 1);
console.log("form catalogs, sprites and run state ok");

// Exercise the rendered sheets and save path with old and new stored Pokemon.
const esc = (v) => String(v).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const elements = {};
const $ = (s) => elements[s] ?? null;
elements['#sheetbody'] = { innerHTML: '' };
elements['#live'] = { textContent: '' };
const ui = { sheet: { n: 201 }, filter: 'all', bulk: false };
const byN = Object.fromEntries(catalogs.hgss.map((p) => [p.n, p]));
const moduleCode = (path) => stripTypeScriptTypes(read(path).replace(/^import[\s\S]*?from "[^"]+";\n/gm, '').replaceAll('export ', ''));
const parts = read('client/parts.ts');
const spriteCode = stripTypeScriptTypes(parts.slice(parts.indexOf('const ring ='), parts.indexOf('export const lvl')).replaceAll('export ', ''));
const context = {
  $, esc, ui, byN, R: () => current, run: true, P: () => ({ art: 'hgss', boxes: [2, 30] }),
  PARTY_SIZE: 6, HELD_ITEMS: [], FIT: {}, TYPE: { psychic: 'pink', normal: 'grey' },
  collectedForms: api.collectedForms, num: (p) => p.n, pad: (n) => String(n).padStart(3, '0'),
  tagBits: () => [], isHere: () => false, rowStatus: () => ({ s: 'now' }), howElse: () => '', cap: (s) => s,
};
const views = runInNewContext(spriteCode + '\n' + moduleCode('client/views/boxes.ts') + '\n' + moduleCode('client/views/dex.ts') + '\n({ fillMonSheet, saveMon, monLine, fillSpecies, tile })', context);
current = api.loadRun(row, '{}');
views.fillMonSheet({ n: 201 });
assert(elements['#sheetbody'].innerHTML.indexOf('id="f-box"') < elements['#sheetbody'].innerHTML.indexOf('id="f-form"'));
assert.equal((elements['#sheetbody'].innerHTML.match(/<option value="unown-/g) || []).length, 28);
views.fillMonSheet({ n: 19 });
assert(!elements['#sheetbody'].innerHTML.includes('id="f-form"'));
for (const [id, value] of Object.entries({ box: '1', form: 'unown-question', lvl: '5', nick: '', g: '', item: '', note: '' })) elements['#f-' + id] = { value };
elements['#f-shiny'] = { checked: false };
views.saveMon();
assert.equal(current.mons[0].form, 'unown-question');
assert(current.forms.has('unown-question'));
assert.equal(current.caught.size, 1);
const line = views.monLine(current.mons[0], true);
assert(line.includes('/sprites/hgss/forms/unown-question.png'));
assert(line.indexOf('Box 1</span>') < line.indexOf('>?</span>'));
views.fillSpecies(201);
let html = elements['#sheetbody'].innerHTML;
assert(html.includes('Forms · 1 / 28'));
assert(html.indexOf('caught">') < html.indexOf('Forms ·'));
assert(html.indexOf('Forms ·') < html.indexOf('Yours'));
assert.equal((html.match(/class="form"/g) || []).length, 28);
assert(views.tile(unown, 'caught').includes('<i>1/28</i>'));
current = api.loadRun(row, JSON.stringify({ mons: [{ n: 201, id: 1, box: 1 }] }));
assert(views.monLine(current.mons[0]).includes('/forms/unown-a.png'));
views.fillSpecies(201);
assert(elements['#sheetbody'].innerHTML.includes('Forms · 1 / 28'));

const app = read('client/app.ts');
const formClick = app.slice(app.indexOf('  if (d.form && d.species)'), app.indexOf('  if (d.savemon)'));
const toggle = runInNewContext('(function(d, r) { ' + formClick + ' })', {
  byN, scheduleSave() {}, render() {}, fillSpecies() {},
});
current = api.loadRun(row, '{}');
toggle({ form: 'unown-b', species: '201' }, current);
assert(current.forms.has('unown-b'));
assert(current.caught.has(201));
toggle({ form: 'unown-b', species: '201' }, current);
assert(!current.forms.has('unown-b'));
assert(current.caught.has(201));
toggle({ form: 'rattata-alola', species: '201' }, current);
assert.equal(current.forms.size, 0);
assert.equal(api.loadRun({ ...row, id: 'other' }, '{}').forms.size, 0);
console.log('form sheets, stored sprites and toggles ok');
