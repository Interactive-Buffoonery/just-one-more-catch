import { launchHarness, choose, inspectWorker, digest, old, readRows, setupPage, closeHarness } from '../save-fixtures/harness.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const cache = path.resolve(process.argv[2] || '.cache/rs-save-tests');
const invalid = ['half'];
const names = ['caught', 'empty', 'rotated', ...invalid];
const isEmpty = name => name === 'empty';
const expected = [25, 133, 252, 255, 258, 280, 290, 292, 349, 350, 380, 381, 384, 386];
const native = JSON.parse(fs.readFileSync(path.join(cache, 'native-results.json')));
const before = new Map(native.map(({ name }) => [name, digest(fs.readFileSync(path.join(cache, name + '.sav')))]));
for (const name of ['caught', 'empty', 'rotated']) {
  const bytes = fs.readFileSync(path.join(cache, name + '.sav'));
  const sectors = [];
  for (let offset = 0; offset < Math.min(bytes.length, 28 * 0x1000); offset += 0x1000)
    if (bytes.readUInt16LE(offset + 0xFF4) === 0) sectors.push(offset);
  const active = sectors.sort((a, b) => bytes.readUInt32LE(b + 0xFFC) - bytes.readUInt32LE(a + 0xFFC))[0];
  if (name === 'rotated') assert.ok(active >= 14 * 0x1000 && active !== 14 * 0x1000);
  const bits = offset => Array.from({ length: 386 }, (_, i) => i + 1).filter(n => bytes[active + offset + ((n - 1) >> 3)] & (1 << ((n - 1) & 7)));
  const flags = isEmpty(name) ? [] : expected;
  assert.deepEqual(bits(0x28), flags);
  assert.deepEqual(bits(0x5C), isEmpty(name) ? [] : [1, ...expected]);
  assert.deepEqual(native.find(row => row.name === name).caught, flags);
}

const { base, browser, server } = await launchHarness(cache);
async function setup(mobile = false) {
  const session = await setupPage(browser, base, mobile, false);
  const { page } = session;
  if (!process.env.WORKER_ONLY) assert.ok((await page.locator('.tags').innerText()).includes('Ruby'));
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
      assert.equal(inspected.game.version, 'RS');
      assert.deepEqual(inspected.game.versions, ['S', 'R']);
      assert.equal(inspected.pokedex.speciesNamespace, 'national-dex');
      assert.equal(inspected.pokedex.coverage, 'complete');
      assert.deepEqual(inspected.pokedex.caughtSpecies, isEmpty(name) ? [] : expected);
      assert.deepEqual(inspected.pokedex.seenSpecies, isEmpty(name) ? [] : [1, ...expected]);
      assert.equal(inspected.startDate, undefined);
      assert.equal(inspected.pokedex.warnings.length, 0);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(writes, []);
    fs.writeFileSync(path.join(cache, 'wasm-results.json'), JSON.stringify(worker, null, 2));
    console.log('PASS published worker: RS paired identity, raw National Dex flags, active slot, empty dex, input preservation, rejected 64 KiB layout');
  } finally { await context.close(); }
  if (process.env.WORKER_ONLY) { console.log('Worker gate passed'); process.exitCode = 0; }
  else for (const name of [...names, 'cancel']) {
    const { context, page, errors, writes } = await setup(isEmpty(name));
    try {
      await choose(cache, page, name === 'cancel' ? 'caught' : name, name === 'rotated');
      if (invalid.includes(name)) {
        await page.locator('.si-oops').waitFor();
        assert.equal(await page.locator('[data-import-action=create]').count(), 0);
      } else {
        await page.locator('[data-version=ruby]').waitFor();
        await page.locator(`[data-version=${name === 'rotated' ? 'sapphire' : 'ruby'}]`).click();
        await page.locator('[data-import-action=create]').waitFor();
        assert.match(await page.locator('#import-title').innerText(), /^(Ruby|Sapphire)$/i);
        assert.match((await page.locator('.si-count').innerText()).replace(/\s+/g, ' '), new RegExp(`${isEmpty(name) ? 0 : expected.length} of 386 caught`));
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
          assert.equal(rows[1].version, name === 'rotated' ? 'sapphire' : 'ruby');
          assert.deepEqual(JSON.parse(rows[1].state), { caught: isEmpty(name) ? [] : expected });
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
  for (const [name, hash] of before) assert.equal(digest(fs.readFileSync(path.join(cache, name + '.sav'))), hash);
  fs.writeFileSync(path.join(cache, 'website-results.json'), JSON.stringify(results, null, 2));
} finally {
  await closeHarness(browser, server);
}
