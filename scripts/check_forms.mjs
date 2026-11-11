import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { runInNewContext } from "node:vm";

const read = (p) => readFileSync(p, "utf8");
const data = (pack) => JSON.parse(read(`client/data/${pack}.ts`).split("export default ")[1].replace(/;\s*$/, ""));
const catalogs = {};
for (const pack of ["crystal", "frlg", "hgss", "usum"]) {
  const packData = JSON.parse(read(`data/${pack}.json`));
  const source = packData.obtainable_forms;
  const traded = packData.traded_forms || {};
  for (const [n, ids] of Object.entries(traded)) {
    assert(ids.every((id) => source[n]?.includes(id)));
    assert(!ids.includes(source[n][0]));
    assert.equal(new Set(ids).size, ids.length);
  }
  const dex = data(pack).dex;
  catalogs[pack] = dex;
  for (const p of dex) {
    assert(Number.isInteger(p.genderRate) && p.genderRate >= -1 && p.genderRate <= 8);
  }
  for (const [n, ids] of Object.entries(source)) {
    const p = dex.find((p) => p.n === +n);
    assert.deepEqual(p.forms.map((f) => f.id), ids);
    assert.equal(new Set(ids).size, ids.length);
    for (const f of p.forms) {
      assert.equal(f.trade === true, (traded[n] || []).includes(f.id));
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
assert.deepEqual(catalogs.usum.find((p) => p.n === 19).forms.map((f) => f.id), ["rattata-alola", "rattata"]);
assert.equal(catalogs.usum.find((p) => p.n === 774).forms.length, 7);
assert.equal(catalogs.usum.find((p) => p.n === 745).forms.length, 2);

const source = read("client/game.ts");
const defaults = { nick: "", lvl: "", g: "", shiny: false, item: "", note: "" };
const stateCode = source.slice(source.indexOf("function loadRun("), source.indexOf("export let bridge:"));
let current;
const api = runInNewContext(stripTypeScriptTypes(stateCode.replaceAll("export ", "")) + "\n({ loadRun, dumpRun, collectedForms, visibleForms, hasGenders, collectedGenders, GENDERS })", {
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
  collectedForms: api.collectedForms, visibleForms: api.visibleForms, collectedGenders: api.collectedGenders, hasGenders: api.hasGenders, GENDERS: api.GENDERS, num: (p) => p.n, pad: (n) => String(n).padStart(3, '0'),
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
  byN, visibleForms: api.visibleForms, scheduleSave() {}, render() {}, fillSpecies() {},
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

// Per-playthrough options default safely and preserve independent collections.
current = api.loadRun(row, '{}');
assert.equal(current.trackForms, true);
assert.equal(current.trackGenders, false);
assert.equal(Object.keys(current.genders).length, 0);
current = api.loadRun(row, JSON.stringify({ trackForms: false, trackGenders: true, forms: ['unown-b'], genders: { 25: ['m', 'm', 'unknown', null], 422: ['f'] } }));
const options = api.loadRun(row, api.dumpRun(current));
assert.equal(options.trackForms, false);
assert.equal(options.trackGenders, true);
assert.deepEqual([...options.genders[25]], ['m']);
assert.deepEqual([...options.genders[422]], ['f']);
assert(options.forms.has('unown-b'));
for (const [n, expected] of [[25, true], [81, false], [128, false], [113, false], [201, false], [422, true]]) {
  assert.equal(api.hasGenders(byN[n]), expected, byN[n].name);
}
current = api.loadRun(row, JSON.stringify({ trackGenders: true, genders: { 25: ['f'] }, mons: [{ id: 1, n: 25, box: 1, g: 'm' }] }));
assert.deepEqual([...api.collectedGenders(byN[25])].sort(), ['f', 'm']);
assert.equal(api.collectedForms(byN[25]).size, 0);
views.fillSpecies(25);
html = elements['#sheetbody'].innerHTML;
assert(html.includes('Genders · 2 / 2'));
assert.match(html, /data-gender="m"[^>]*aria-pressed="true"[^>]*disabled/);
assert.match(html, /data-gender="f"[^>]*aria-pressed="true"[^>]*>/);
assert(!/data-gender="f"[^>]*disabled/.test(html));
assert(views.tile(byN[25], 'caught').includes('<b class="on"'));
for (const n of [81, 128, 113, 201]) {
  views.fillSpecies(n);
  assert(!elements['#sheetbody'].innerHTML.includes('Genders ·'), byN[n].name);
  assert(!views.tile(byN[n], 'caught').includes('class="gx"'), byN[n].name);
}
current.trackGenders = false;
views.fillSpecies(25);
assert(!elements['#sheetbody'].innerHTML.includes('Genders ·'));
assert(!views.tile(byN[25], 'caught').includes('class="gx"'));
assert(views.monLine(current.mons[0]).includes('♂'));

current = api.loadRun(row, JSON.stringify({ trackTraded: true, trackGenders: true, mons: [{ id: 1, n: 422, box: 1, form: 'shellos-east', g: 'f' }] }));
current.caught.add(422);
views.fillSpecies(422);
html = elements['#sheetbody'].innerHTML;
assert(html.indexOf('Forms · 1 / 2') < html.indexOf('Genders · 1 / 2'));
assert(html.indexOf('Genders · 1 / 2') < html.indexOf('Yours'));
current.trackForms = false;
views.fillSpecies(422);
assert(!elements['#sheetbody'].innerHTML.includes('Forms ·'));
assert(elements['#sheetbody'].innerHTML.includes('Genders · 1 / 2'));
const hiddenFormRow = views.monLine(current.mons[0]);
assert(hiddenFormRow.includes('/sprites/hgss/422.png'));
assert(!hiddenFormRow.includes('East Sea'));
assert(hiddenFormRow.includes('♀'));
assert(!views.tile(byN[422], 'caught').includes('<i>1/2</i>'));
views.fillMonSheet({ id: 1 });
assert(!elements['#sheetbody'].innerHTML.includes('id="f-form"'));
ui.sheet = { id: 1 };
delete elements['#f-form'];
elements['#f-g'].value = 'f';
views.saveMon();
assert.equal(current.mons[0].form, 'shellos-east');
assert.equal(api.collectedForms(byN[422]).size, 1);
assert.equal(api.collectedGenders(byN[422]).size, 1);
current.trackForms = true;
assert(views.monLine(current.mons[0]).includes('/forms/shellos-east.png'));

const genderClick = app.slice(app.indexOf('  if (d.gender && d.species)'), app.indexOf('  if (d.form && d.species)'));
const toggleGender = runInNewContext('(function(d, r) { ' + genderClick + ' })', {
  byN, hasGenders: api.hasGenders, scheduleSave() {}, render() {}, fillSpecies() {},
});
current = api.loadRun(row, '{"trackGenders":true}');
toggleGender({ gender: 'm', species: '25' }, current);
assert(current.genders[25].has('m'));
assert(current.caught.has(25));
assert.equal(current.forms.size, 0);
toggleGender({ gender: 'm', species: '25' }, current);
assert.equal(current.genders[25].size, 0);
current.mons.push({ n: 25, g: 'm' });
toggleGender({ gender: 'm', species: '25' }, current);
assert.equal(current.genders[25].size, 0);
for (const n of [81, 128, 113, 201]) toggleGender({ gender: 'f', species: String(n) }, current);
assert.equal(Object.keys(current.genders).length, 1);
current.trackGenders = false;
toggleGender({ gender: 'f', species: '25' }, current);
assert.equal(current.genders[25].size, 0);
assert.equal(Object.keys(api.loadRun({ ...row, id: 'other' }, '{}').genders).length, 0);

const journey = read('client/views/journey.ts');
const custom = runInNewContext(stripTypeScriptTypes(journey.slice(journey.indexOf('const SECTIONS ='), journey.indexOf('/* ---- Story events:')).replaceAll('export ', '')) + '\nfillCustom', {
  $, R: () => current, ver: () => ({ name: 'HeartGold' }), badgesWord: () => 'badges',
});
current = api.loadRun(row, '{}');
custom();
html = elements['#sheetbody'].innerHTML;
assert(html.indexOf('Journey sections') < html.indexOf('<p class="eyebrow">Dex</p>'));
assert.match(html, /role="switch" aria-checked="true" data-dexoption="trackForms"/);
assert.match(html, /role="switch" aria-checked="false" data-dexoption="trackGenders"/);
assert.match(html, /<b>Forms<\/b><\/span>/);
assert.match(html, /<b>Genders<\/b><\/span>/);
current.view = 'dexonly';
custom();
assert(elements['#sheetbody'].innerHTML.includes('data-dexoption="trackForms"'));
assert(elements['#sheetbody'].innerHTML.includes('data-dexoption="trackGenders"'));
console.log('Forms/Genders options, eligibility, tiles and preserved data ok');
const optionClick = app.slice(app.indexOf('  } else if (d.dexoption'), app.indexOf('  } else if (d.showlater')).replace(/^  } else /, '') + '\n}';
const toggleOption = runInNewContext('(function(d, r) { ' + optionClick + ' })');
current.forms.add('unown-b');
current.genders[25] = new Set(['f']);
const collections = () => JSON.stringify({ forms: [...current.forms], genders: [...current.genders[25]] });
const beforeOptions = collections();
toggleOption({ dexoption: 'trackForms' }, current);
toggleOption({ dexoption: 'trackGenders' }, current);
assert.equal(current.trackForms, false);
assert.equal(current.trackGenders, true);
assert.equal(collections(), beforeOptions);
const switched = api.loadRun(row, api.dumpRun(current));
assert.equal(switched.trackForms, false);
assert.equal(switched.trackGenders, true);
assert(switched.forms.has('unown-b'));
assert(switched.genders[25].has('f'));


// Traded forms filter presentation without changing stored collections.
current = api.loadRun(row, '{}');
assert.equal(current.trackTraded, false);
assert.equal(api.loadRun(row, '{"trackTraded":"true"}').trackTraded, false);
const shellos = byN[422];
assert.deepEqual([...api.visibleForms(shellos)].map((f) => f.id), ['shellos-west']);
current.forms.add('shellos-east');
current.mons.push({ id: 1, n: 422, box: 1, form: 'shellos-east' });
current.caught.add(422);
assert.equal(api.collectedForms(shellos).size, 0);
views.fillSpecies(422);
assert(!elements['#sheetbody'].innerHTML.includes('Forms ·'));
assert(!elements['#sheetbody'].innerHTML.includes('data-form="shellos-east"'));
assert(!views.tile(shellos, 'caught').includes('<i>'));
assert(views.monLine(current.mons[0]).includes('/forms/shellos-east.png'));
assert(views.monLine(current.mons[0]).includes('East Sea'));
views.fillMonSheet({ n: 422 });
assert(!elements['#sheetbody'].innerHTML.includes('id="f-form"'));
views.fillMonSheet({ id: 1 });
assert.match(elements['#sheetbody'].innerHTML, /value="shellos-east" selected/);
assert.equal((elements['#sheetbody'].innerHTML.match(/<option value="shellos-/g) || []).length, 2);
views.fillMonSheet({ n: 479 });
assert(!elements['#sheetbody'].innerHTML.includes('id="f-form"'));
toggle({ form: 'rotom-heat', species: '479' }, current);
assert(!current.forms.has('rotom-heat'));
custom();
assert.match(elements['#sheetbody'].innerHTML, /role="switch" aria-checked="false" data-dexoption="trackTraded"/);
assert.match(elements['#sheetbody'].innerHTML, /<b>Traded forms<\/b><\/span>/);
toggleOption({ dexoption: 'trackTraded' }, current);
assert.equal(current.trackTraded, true);
assert.equal(api.collectedForms(shellos).size, 1);
views.fillSpecies(422);
assert(elements['#sheetbody'].innerHTML.includes('Forms · 1 / 2'));
assert(views.tile(shellos, 'caught').includes('<i>1/2</i>'));
toggle({ form: 'rotom-heat', species: '479' }, current);
assert(current.forms.has('rotom-heat'));
const tradedRoundtrip = api.loadRun(row, api.dumpRun(current));
assert.equal(tradedRoundtrip.trackTraded, true);
assert(tradedRoundtrip.forms.has('shellos-east'));
current.trackTraded = false;
const hiddenRoundtrip = api.loadRun(row, api.dumpRun(current));
assert.equal(hiddenRoundtrip.trackTraded, false);
assert(hiddenRoundtrip.forms.has('shellos-east'));
assert.equal(hiddenRoundtrip.mons[0].form, 'shellos-east');
current.trackForms = false;
custom();
assert(!elements['#sheetbody'].innerHTML.includes('data-dexoption="trackTraded"'));
assert.equal(api.loadRun({ ...row, id: 'another' }, '{}').trackTraded, false);
for (const n of [201, 386, 412, 413, 585, 586, 710, 711]) {
  const p = catalogs.usum.find((p) => p.n === n);
  assert(p.forms.length > 1);
  assert(!p.forms[0].trade);
  assert(p.forms.slice(1).every((f) => f.trade));
}
for (const n of [26, 103, 105, 422, 423, 479, 774]) {
  assert(catalogs.usum.find((p) => p.n === n).forms.every((f) => !f.trade));
}
assert(!catalogs.usum.find((p) => p.n === 676).forms);
console.log('traded catalogs, filtering, stored forms and run options ok');

current = api.loadRun(row, '{}');
byN[669] = catalogs.usum.find((p) => p.n === 669);
current.forms = new Set(['flabebe-yellow', 'flabebe-red']);
views.fillSpecies(669);
assert(elements['#sheetbody'].innerHTML.includes('Forms · 1 / 3'));
assert(!elements['#sheetbody'].innerHTML.includes('data-form="flabebe-red"'));
assert(views.tile(byN[669], 'caught').includes('<i>1/3</i>'));
views.fillMonSheet({ n: 669 });
assert.equal((elements['#sheetbody'].innerHTML.match(/<option value="flabebe-/g) || []).length, 3);
current.mons.push({ id: 1, n: 669, box: 1, form: 'flabebe-red' });
views.fillMonSheet({ id: 1 });
assert.equal((elements['#sheetbody'].innerHTML.match(/<option value="flabebe-/g) || []).length, 4);
assert.match(elements['#sheetbody'].innerHTML, /value="flabebe-red" selected/);
assert(!elements['#sheetbody'].innerHTML.includes('value="flabebe-blue"'));
ui.sheet = { id: 1 };
elements['#f-form'] = { value: 'flabebe-red' };
views.saveMon();
assert.equal(current.mons[0].form, 'flabebe-red');
current.trackTraded = true;
views.fillSpecies(669);
assert(elements['#sheetbody'].innerHTML.includes('Forms · 2 / 5'));
assert(views.tile(byN[669], 'caught').includes('<i>2/5</i>'));
console.log('mixed local/traded lists and editing retained forms ok');
