import { launchHarness, choose, inspectWorker, digest, old, readRows, setupPage, closeHarness, duplicateImport, storageRetry, cancelPreparing, prepareRetry } from '../save-fixtures/harness.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const cache = path.resolve(process.argv[2] || '.cache/bw-save-tests');
const invalid = ['invalid', 'truncated'];
const native = JSON.parse(fs.readFileSync(path.join(cache, 'native-results.json')));
const names = [...native.map(row => row.name), ...invalid];
const isEmpty = name => name.endsWith('-empty');
const expected = [25, 133, 252, 386, 493, 494, 495, 496, 497, 498, 501, 550, 585, 643, 644, 646, 647, 648, 649];
const versionFor = name => ({ B: 'black', W: 'white', B2: 'black-2', W2: 'white-2' }[name.split('-')[0]] || 'black');
const isSequel = name => /^(B2|W2)-/.test(name);
const before = new Map(names.map(name => [name, digest(fs.readFileSync(path.join(cache, name + '.sav')))]));
for (const row of native) {
  const bytes = fs.readFileSync(path.join(cache, row.name + '.sav'));
  const dex = isSequel(row.name) ? 0x21400 : 0x21600;
  const bits = offsets => Array.from({ length: 649 }, (_, i) => i + 1).filter(n => offsets.some(offset => bytes[dex + offset + ((n - 1) >> 3)] & (1 << ((n - 1) & 7))));
  const flags = isEmpty(row.name) ? [] : expected;
  assert.deepEqual(bits([0x8]), flags);
  assert.deepEqual(bits([0x5C, 0xB0, 0x104, 0x158]), isEmpty(row.name) ? [] : [1, 2, 3, ...expected]);
  assert.deepEqual(row.caught, flags);
  assert.deepEqual(row.seen, bits([0x5C, 0xB0, 0x104, 0x158]));
  assert.equal(bytes[0x1941F], { B: 21, W: 20, B2: 23, W2: 22 }[row.version]);
}

const { base, browser, server } = await launchHarness(cache);
async function setup(mobile = false) {
  const session = await setupPage(browser, base, mobile, true);
  const { page } = session;
  if (!process.env.WORKER_ONLY) assert.ok((await page.locator('.tags').innerText()).includes('Black'));
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
      assert.deepEqual(inspected.pokedex.caughtSpecies, isEmpty(name) ? [] : expected);
      assert.deepEqual(inspected.pokedex.seenSpecies, isEmpty(name) ? [] : [1, 2, 3, ...expected]);
      assert.equal(inspected.startDate, undefined);
      assert.equal(inspected.pokedex.warnings.length, 0);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(writes, []);
    fs.writeFileSync(path.join(cache, 'wasm-results.json'), JSON.stringify(worker, null, 2));
    console.log('PASS published worker: B/W and B2/W2 exact identities, raw National Dex flags, empty dex, input preservation, rejected invalid/truncated files');
  } finally { await context.close(); }
  if (process.env.WORKER_ONLY) { console.log('Worker gate passed'); process.exitCode = 0; }
  else for (const name of [...names, 'cancel']) {
    const { context, page, errors, writes } = await setup(isEmpty(name));
    try {
      await choose(cache, page, name === 'cancel' ? 'B-caught' : name, name === 'W-caught');
      if (invalid.includes(name)) {
        await page.locator('.si-oops').waitFor();
        assert.equal(await page.locator('[data-import-action=create]').count(), 0);
      } else {
        assert.equal(await page.locator('[data-import-action=version]').count(), 0);
        await page.locator('[data-import-action=create]').waitFor();
        assert.match(await page.locator('#import-title').innerText(), new RegExp(`^${versionFor(name).replace('-', ' ')}$`, 'i'));
        assert.match((await page.locator('.si-count').innerText()).replace(/\s+/g, ' '), new RegExp(`${isEmpty(name) ? 0 : expected.length} of 649 caught`));
        assert.equal(await page.locator('.si-facts .warn').count(), 0);
        assert.match(await page.locator('.si-start').innerText(), /This save doesn't record a start date/);
        assert.deepEqual(await readRows(page), [old]);
        if (name === 'cancel') await page.locator('[data-import-action=close]').click();
        else {
          await page.locator('[data-import-action=create]').click();
          await page.locator('[data-filter=caught][aria-pressed=true]').waitFor();
          const rows = await readRows(page);
          assert.equal(rows.length, 2);
          assert.deepEqual(rows[0], old);
          assert.equal(rows[1].version, versionFor(name));
          assert.deepEqual(JSON.parse(rows[1].state), { caught: isEmpty(name) ? [] : expected });
          const days = await page.evaluate(value => [new Date(value).toDateString(), new Date().toDateString()], rows[1].createdAt);
          assert.equal(days[0], days[1]);
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
        await choose(cache, page, 'B-caught');
        await page.locator('[data-import-action=retry]').click();
        await page.locator('[data-import-action=create]').waitFor();
      } else if (scenario === 'cancel-preparing') {
        await cancelPreparing(context, page, path.join(cache, 'B-caught.sav'));
      } else {
        await choose(cache, page, 'B-caught');
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
