import { launchHarness, choose, inspectWorker, digest, old, readRows, setupPage, closeHarness, duplicateImport, storageRetry, cancelPreparing, prepareRetry } from '../save-fixtures/harness.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const cache = path.resolve(process.argv[2] || '.cache/sm-save-tests');
const invalid = ['invalid', 'truncated'];
const native = JSON.parse(fs.readFileSync(path.join(cache, 'native-results.json')));
const names = [...native.map(row => row.name), ...invalid];
const isEmpty = name => name.endsWith('-empty');
const expected = [25, 133, 252, 386, 493, 649, 721, 722, 723, 724, 725, 728, 741, 746, 778, 791, 792, 800, 801, 802];
const versionFor = name => ({ SN: 'sun', MN: 'moon', US: 'ultrasun', UM: 'ultramoon' })[name.split('-')[0]];
const ultra = name => /^(US|UM)-/.test(name);
const limitFor = name => ultra(name) ? 807 : 802;
const caughtFor = name => isEmpty(name) ? [] : ultra(name) ? [...expected, 803, 804, 805, 806, 807] : expected;
const titleFor = name => ({ SN: 'Sun', MN: 'Moon', US: 'Ultra Sun', UM: 'Ultra Moon' })[name.split('-')[0]];
const before = new Map(names.map(name => [name, digest(fs.readFileSync(path.join(cache, name + '.sav')))]));
for (const row of native) {
  const bytes = fs.readFileSync(path.join(cache, row.name + '.sav'));
  const dex = ultra(row.name) ? 0x2C00 : 0x2A00;
  const bits = offsets => Array.from({ length: limitFor(row.name) }, (_, i) => i + 1).filter(n => offsets.some(offset => bytes[dex + offset + ((n - 1) >> 3)] & (1 << ((n - 1) & 7))));
  const flags = caughtFor(row.name);
  assert.deepEqual(bits([0x88]), flags);
  assert.deepEqual(bits([0xF0, 0x17C, 0x208, 0x294]), isEmpty(row.name) ? [] : [1, 2, 3, ...caughtFor(row.name)]);
  assert.deepEqual(row.caught, flags);
  assert.deepEqual(row.seen, bits([0xF0, 0x17C, 0x208, 0x294]));
  const seconds = bytes.readUInt32LE((ultra(row.name) ? 0x4A00 : 0x4600) + 0x28);
  assert.equal(seconds, isEmpty(row.name) ? 0 : (Date.UTC(2020, 1, 29, 12) - Date.UTC(2000, 0, 1)) / 1000);
  assert.equal(bytes[ultra(row.name) ? 0x1404 : 0x1204], { SN: 30, MN: 31, US: 32, UM: 33 }[row.version]);
}

const { base, browser, server } = await launchHarness(cache);
async function setup(mobile = false) {
  const session = await setupPage(browser, base, mobile, true);
  const { page } = session;
  if (!process.env.WORKER_ONLY) assert.ok((await page.locator('.tags').innerText()).split(/\s+/).includes('Sun'));
  return session;
}
const results = [];
try {
  const { context, page, errors, writes } = await setup();
  try {
    const worker = await inspectWorker(page, names);
    for (const { name, inspected, unchanged } of worker) {
      assert.ok(unchanged);
      if (invalid.includes(name)) { assert.equal(inspected.code, 'invalid-save'); continue; }
      assert.equal(inspected.status, 'ok');
      assert.equal(inspected.game.version, name.split('-')[0]);
      assert.deepEqual(inspected.game.versions, [name.split('-')[0]]);
      assert.equal(inspected.pokedex.speciesNamespace, 'national-dex');
      assert.equal(inspected.pokedex.coverage, 'complete');
      assert.deepEqual(inspected.pokedex.caughtSpecies, caughtFor(name));
      assert.deepEqual(inspected.pokedex.seenSpecies, isEmpty(name) ? [] : [1, 2, 3, ...caughtFor(name)]);
      assert.equal(inspected.startDate, isEmpty(name) ? undefined : '2020-02-29');
      assert.equal(inspected.pokedex.warnings.length, 0);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(writes, []);
    fs.writeFileSync(path.join(cache, 'wasm-results.json'), JSON.stringify(worker, null, 2));
    console.log('PASS published worker: SM/USUM exact identities, raw National Dex flags, empty dex, input preservation, rejected invalid/truncated files');
  } finally { await context.close(); }
  if (process.env.WORKER_ONLY) { console.log('Worker gate passed'); process.exitCode = 0; }
  else for (const name of [...names, 'cancel']) {
    const { context, page, errors, writes } = await setup(isEmpty(name));
    try {
      await choose(cache, page, name === 'cancel' ? 'SN-caught' : name, name === 'MN-caught');
      if (invalid.includes(name)) {
        await page.locator('.si-oops').waitFor();
        assert.equal(await page.locator('[data-import-action=create]').count(), 0);
      } else {
        assert.equal(await page.locator('[data-import-action=version]').count(), 0);
        await page.locator('[data-import-action=create]').waitFor();
        assert.match(await page.locator('#import-title').innerText(), new RegExp(`^${titleFor(name === "cancel" ? "SN-caught" : name)}$`, 'i'));
        assert.match((await page.locator('.si-count').innerText()).replace(/\s+/g, ' '), new RegExp(`${caughtFor(name).length} of ${limitFor(name)} caught`));
        assert.equal(await page.locator('.si-facts .warn').count(), 0);
        assert.match(await page.locator('.si-start').innerText(), isEmpty(name) ? /This save doesn't record a start date/ : /2020/);
        assert.deepEqual(await readRows(page), [old]);
        if (name === 'cancel') await page.locator('[data-import-action=close]').click();
        else {
          await page.locator('[data-import-action=create]').click();
          await page.locator('[data-filter=caught][aria-pressed=true]').waitFor();
          const rows = await readRows(page);
          assert.equal(rows.length, 2);
          assert.deepEqual(rows[0], old);
          assert.equal(rows[1].version, versionFor(name));
          assert.deepEqual(JSON.parse(rows[1].state), { caught: caughtFor(name) });
          const days = await page.evaluate(value => [new Date(value).toDateString(), new Date().toDateString()], rows[1].createdAt);
          assert.equal(days[0], isEmpty(name) ? days[1] : new Date(2020, 1, 29).toDateString());
          await page.reload();
          assert.deepEqual(await readRows(page), rows);
        }
      }
      if ([...invalid, 'cancel'].includes(name)) assert.deepEqual(await readRows(page), [old]);
      assert.deepEqual(errors, []);
      assert.deepEqual(writes, []);
      results.push({ name, passed: true });
      console.log('PASS website:', name);
    } finally { await context.close(); }
  }
  if (!process.env.WORKER_ONLY) for (const scenario of ['storage-retry', 'duplicate', 'navigation', 'prepare-retry', 'cancel-preparing']) {
    const { context, page, errors, writes } = await setup();
    try {
      if (scenario === 'prepare-retry') {
        await prepareRetry(context);
        await choose(cache, page, 'SN-caught');
        await page.locator('[data-import-action=retry]').click();
        await page.locator('[data-import-action=create]').waitFor();
      } else if (scenario === 'cancel-preparing') {
        await cancelPreparing(context, page, path.join(cache, 'SN-caught.sav'));
      } else {
        await choose(cache, page, 'SN-caught');
        await page.locator('[data-import-action=create]').waitFor();
        if (scenario === 'storage-retry') {
          await storageRetry(page);
        } else if (scenario === 'duplicate') {
          await duplicateImport(page);
        } else {
          await page.goto(base + '/');
          await page.goBack();
          await page.locator('input[type=file]').waitFor();
          assert.equal(await page.locator('[data-import-action=create]').count(), 0);
        }
      }
      const rows = await readRows(page);
      assert.deepEqual(rows[0], old);
      assert.equal(rows.length, ['storage-retry', 'duplicate'].includes(scenario) ? 2 : 1);
      if (rows.length === 2) assert.deepEqual(JSON.parse(rows[1].state), { caught: expected });
      assert.deepEqual(errors, []);
      assert.deepEqual(writes, []);
      results.push({ name: scenario, passed: true });
      console.log('PASS website:', scenario);
    } finally { await context.close(); }
  }
  for (const [name, hash] of before) assert.equal(digest(fs.readFileSync(path.join(cache, name + '.sav'))), hash);
  fs.writeFileSync(path.join(cache, 'website-results.json'), JSON.stringify(results, null, 2));
} finally {
  await closeHarness(browser, server);
}
