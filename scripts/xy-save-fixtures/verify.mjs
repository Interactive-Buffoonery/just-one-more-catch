import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

assert.ok(process.env.PLAYWRIGHT_MODULE, 'Set PLAYWRIGHT_MODULE to an installed Playwright index.mjs');
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const cache = path.resolve(process.argv[2] || '.cache/xy-save-tests');
const build = path.resolve('dist');
const reader = path.resolve('node_modules/@serabi/pokemon-save-reader');
const invalid = ['invalid', 'truncated'];
const native = JSON.parse(fs.readFileSync(path.join(cache, 'native-results.json')));
const names = [...native.map(row => row.name), ...invalid];
const isEmpty = name => name.endsWith('-empty');
const expected = [25, 133, 252, 386, 493, 649, 650, 651, 652, 653, 656, 666, 669, 678, 716, 717, 718, 719, 720, 721];
const versionFor = name => name.startsWith('Y-') ? 'y' : 'x';
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const before = new Map(names.map(name => [name, digest(fs.readFileSync(path.join(cache, name + '.sav')))]));
for (const row of native) {
  const bytes = fs.readFileSync(path.join(cache, row.name + '.sav'));
  const dex = 0x15000;
  const bits = offsets => Array.from({ length: 721 }, (_, i) => i + 1).filter(n => offsets.some(offset => bytes[dex + offset + ((n - 1) >> 3)] & (1 << ((n - 1) & 7))));
  const flags = isEmpty(row.name) ? [] : expected;
  assert.deepEqual(bits([0x8]), flags);
  assert.deepEqual(bits([0x68, 0xC8, 0x128, 0x188]), isEmpty(row.name) ? [] : [1, 2, 3, ...expected]);
  assert.deepEqual(row.caught, flags);
  assert.deepEqual(row.seen, bits([0x68, 0xC8, 0x128, 0x188]));
  assert.equal(bytes[0x14004], { X: 24, Y: 25 }[row.version]);
}

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.wasm': 'application/wasm', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  if (req.method !== 'GET') return res.writeHead(405).end();
  const url = new URL(req.url, 'http://local').pathname;
  const [root, relative] = url.startsWith('/__fixtures/') ? [cache, url.slice(12)] : url.startsWith('/__reader/') ? [reader, url.slice(10)] : [build, '.' + url];
  let file = path.resolve(root, relative);
  if (file !== root && !file.startsWith(root + path.sep)) return res.writeHead(404).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const old = { id: 'local-old', version: 'crystal', state: JSON.stringify({ caught: [1], notes: 'Keep me' }), createdAt: '2026-01-01T00:00:00.000Z' };
const readRows = page => page.evaluate(() => JSON.parse(localStorage.getItem('jomc.guest')));
async function setup(mobile = false) {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 1000 } });
  await context.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
  await context.routeWebSocket('**/*', socket => socket.close());
  await context.addInitScript(row => {
    if (!localStorage.getItem('jomc.guest')) localStorage.setItem('jomc.guest', JSON.stringify([row]));
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'jomc.guest' && window.failStorage) throw new Error('quota');
      return set.call(this, key, value);
    };
  }, old);
  const page = await context.newPage();
  const errors = [], writes = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.method() !== 'GET') writes.push(request.url()); });
  await page.goto(base + '/import/');
  await page.locator('input[type=file]').waitFor();
  if (!process.env.WORKER_ONLY) assert.ok((await page.locator('.tags').innerText()).split(/\s+/).includes('X'));
  return { context, page, errors, writes };
}
async function choose(page, name, drop = false) {
  const file = path.join(cache, name + '.sav');
  if (drop) await page.locator('.si-drop').evaluate((node, bytes) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(bytes)], 'wrong-title.srm'));
    node.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
  }, [...fs.readFileSync(file)]);
  else await page.locator('input[type=file]').setInputFiles(file);
  await page.waitForFunction(() => document.querySelector('[data-import-action=format], [data-import-action=version], [data-import-action=create], .si-oops'), null, { timeout: 60000 });
  if (await page.locator('[data-format=pkhex]').count()) await page.locator('[data-format=pkhex]').click();
}
const results = [];
try {
  const { context, page, errors, writes } = await setup();
  try {
    const worker = await page.evaluate(async (names) => {
      const { createSaveReader } = await import('/__reader/dist/index.js');
      const reader = await createSaveReader({ baseUrl: '/__reader/assets/' });
      const results = [];
      try {
        for (const name of names) {
          const bytes = new Uint8Array(await (await fetch(`/__fixtures/${name}.sav`)).arrayBuffer());
          const hash = async () => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).join(',');
          const before = await hash();
          let inspected = await reader.inspect(bytes, { fileName: 'unrelated-name.sav' });
          if (inspected.code === 'format-choice-required') inspected = await reader.inspect(bytes, { formatId: 'pkhex' });
          results.push({ name, inspected, unchanged: before === await hash() });
        }
        return results;
      } finally { reader.dispose(); }
    }, names);
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
    console.log('PASS published worker: X/Y exact identities, raw National Dex flags, empty dex, input preservation, rejected invalid/truncated files');
  } finally { await context.close(); }
  if (process.env.WORKER_ONLY) { console.log('Worker gate passed'); process.exitCode = 0; }
  else for (const name of [...names, 'cancel']) {
    const { context, page, errors, writes } = await setup(isEmpty(name));
    try {
      await choose(page, name === 'cancel' ? 'X-caught' : name, name === 'Y-caught');
      if (invalid.includes(name)) {
        await page.locator('.si-oops').waitFor();
        assert.equal(await page.locator('[data-import-action=create]').count(), 0);
      } else {
        assert.equal(await page.locator('[data-import-action=version]').count(), 0);
        await page.locator('[data-import-action=create]').waitFor();
        assert.match(await page.locator('#import-title').innerText(), new RegExp(`^${versionFor(name)}$`, 'i'));
        assert.match((await page.locator('.si-count').innerText()).replace(/\s+/g, ' '), new RegExp(`${isEmpty(name) ? 0 : expected.length} of 721 caught`));
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
        let failed = false;
        await context.route('**/save-reader/**/worker.js', route => {
          if (!failed) { failed = true; return route.abort(); }
          return route.continue();
        });
        await choose(page, 'X-caught');
        await page.locator('[data-import-action=retry]').click();
        await page.locator('[data-import-action=create]').waitFor();
      } else if (scenario === 'cancel-preparing') {
        let release;
        const held = new Promise(resolve => { release = resolve; });
        await context.route('**/save-reader/**/worker.js', async route => { await held; await route.abort(); });
        try {
          await page.locator('input[type=file]').setInputFiles(path.join(cache, 'X-caught.sav'));
          await page.locator('[data-import-action=cancel]').click();
          await page.locator('input[type=file]').waitFor();
        } finally { release(); }
      } else {
        await choose(page, 'X-caught');
        await page.locator('[data-import-action=create]').waitFor();
        if (scenario === 'storage-retry') {
          await page.evaluate(() => { window.failStorage = true; });
          await page.locator('[data-import-action=create]').click();
          await page.locator('[data-import-action=retry]').waitFor();
          assert.deepEqual(await readRows(page), [old]);
          await page.evaluate(() => { window.failStorage = false; });
          await page.locator('[data-import-action=retry]').click();
          await page.locator('[data-import-action=create]').click();
          await page.locator('[data-filter=caught][aria-pressed=true]').waitFor();
        } else if (scenario === 'duplicate') {
          await page.locator('[data-import-action=create]').evaluate(button => { button.click(); button.click(); });
          await page.locator('[data-filter=caught][aria-pressed=true]').waitFor();
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
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
