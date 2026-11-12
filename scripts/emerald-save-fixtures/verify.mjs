import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

assert.ok(process.env.PLAYWRIGHT_MODULE, 'Set PLAYWRIGHT_MODULE to an installed Playwright index.mjs');
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const cache = path.resolve(process.argv[2] || '.cache/emerald-save-tests');
const build = path.resolve('dist');
const reader = path.resolve('node_modules/@serabi/pokemon-save-reader');
const expected = [25, 133, 252, 255, 258, 280, 290, 292, 349, 350, 380, 381, 384, 386];
const native = JSON.parse(fs.readFileSync(path.join(cache, 'native-results.json')));
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const before = new Map(native.map(({ name }) => [name, digest(fs.readFileSync(path.join(cache, name + '.sav')))]));
for (const name of ['caught', 'empty', 'rotated']) {
  const bytes = fs.readFileSync(path.join(cache, name + '.sav'));
  const sectors = [];
  for (let offset = 0; offset < 28 * 0x1000; offset += 0x1000)
    if (bytes.readUInt16LE(offset + 0xFF4) === 0) sectors.push(offset);
  const active = sectors.sort((a, b) => bytes.readUInt32LE(b + 0xFFC) - bytes.readUInt32LE(a + 0xFFC))[0];
  if (name === 'rotated') assert.ok(active >= 14 * 0x1000 && active !== 14 * 0x1000);
  const bits = offset => Array.from({ length: 386 }, (_, i) => i + 1).filter(n => bytes[active + offset + ((n - 1) >> 3)] & (1 << ((n - 1) & 7)));
  const flags = name === 'empty' ? [] : expected;
  assert.deepEqual(bits(0x28), flags);
  assert.deepEqual(bits(0x5C), name === 'empty' ? [] : [1, ...expected]);
  assert.deepEqual(native.find(row => row.name === name).caught, flags);
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
const browser = await chromium.launch({ headless: true });
const old = { id: 'local-old', version: 'crystal', state: JSON.stringify({ caught: [1], notes: 'Keep me' }), createdAt: '2026-01-01T00:00:00.000Z' };
const readRows = page => page.evaluate(() => JSON.parse(localStorage.getItem('jomc.guest')));
async function setup(mobile = false) {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 1000 } });
  await context.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
  await context.routeWebSocket('**/*', socket => socket.close());
  await context.addInitScript(row => {
    if (!localStorage.getItem('jomc.guest')) localStorage.setItem('jomc.guest', JSON.stringify([row]));
  }, old);
  const page = await context.newPage();
  const errors = [], writes = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.method() !== 'GET') writes.push(request.url()); });
  await page.goto(base + '/import/');
  await page.locator('input[type=file]').waitFor();
  assert.ok((await page.locator('.tags').innerText()).includes('Emerald'));
  return { context, page, errors, writes };
}
async function choose(page, name, drop = false) {
  const file = path.join(cache, name + '.sav');
  if (drop) await page.locator('.si-drop').evaluate((node, bytes) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(bytes)], 'Emerald.srm'));
    node.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
  }, [...fs.readFileSync(file)]);
  else await page.locator('input[type=file]').setInputFiles(file);
  await page.waitForFunction(() => document.querySelector('[data-import-action=format], [data-import-action=create], .si-oops'), null, { timeout: 60000 });
  if (await page.locator('[data-format=pkhex]').count()) await page.locator('[data-format=pkhex]').click();
}
const results = [];
try {
  const { context, page, errors, writes } = await setup();
  try {
    const worker = await page.evaluate(async () => {
      const { createSaveReader } = await import('/__reader/dist/index.js');
      const reader = await createSaveReader({ baseUrl: '/__reader/assets/' });
      const results = [];
      try {
        for (const name of ['caught', 'empty', 'rotated', 'half', 'ruby-sapphire']) {
          const bytes = new Uint8Array(await (await fetch(`/__fixtures/${name}.sav`)).arrayBuffer());
          const hash = async () => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).join(',');
          const before = await hash();
          let inspected = await reader.inspect(bytes, { fileName: 'unrelated-name.sav' });
          if (inspected.code === 'format-choice-required') inspected = await reader.inspect(bytes, { formatId: 'pkhex' });
          results.push({ name, inspected, unchanged: before === await hash() });
        }
        return results;
      } finally { reader.dispose(); }
    });
    for (const { name, inspected, unchanged } of worker) {
      assert.ok(unchanged);
      if (name === 'half') { assert.equal(inspected.status, 'error'); continue; }
      assert.equal(inspected.status, 'ok');
      if (name === 'ruby-sapphire') { assert.ok(!inspected.game.versions.includes('E')); continue; }
      assert.deepEqual(inspected.game.versions, ['E']);
      assert.equal(inspected.pokedex.speciesNamespace, 'national-dex');
      assert.equal(inspected.pokedex.coverage, 'complete');
      assert.deepEqual(inspected.pokedex.caughtSpecies, name === 'empty' ? [] : expected);
      assert.deepEqual(inspected.pokedex.seenSpecies, name === 'empty' ? [] : [1, ...expected]);
      assert.equal(inspected.startDate, undefined);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(writes, []);
    fs.writeFileSync(path.join(cache, 'wasm-results.json'), JSON.stringify(worker, null, 2));
    console.log('PASS published worker: Emerald identity, raw National Dex flags, active slot, empty dex, input preservation, unsupported formats');
  } finally { await context.close(); }
  for (const name of ['caught', 'empty', 'rotated', 'half', 'ruby-sapphire', 'cancel']) {
    const { context, page, errors, writes } = await setup(name === 'empty');
    try {
      await choose(page, name === 'cancel' ? 'caught' : name, name === 'rotated');
      if (['half', 'ruby-sapphire'].includes(name)) {
        await page.locator('.si-oops').waitFor();
        assert.equal(await page.locator('[data-import-action=create]').count(), 0);
      } else {
        await page.locator('[data-import-action=create]').waitFor();
        assert.match(await page.locator('#import-title').innerText(), /^Emerald$/i);
        assert.match((await page.locator('.si-count').innerText()).replace(/\s+/g, ' '), new RegExp(`${name === 'empty' ? 0 : expected.length} of 386 caught`));
        assert.match(await page.locator('.si-start').innerText(), /This save doesn't record a start date/);
        assert.deepEqual(await readRows(page), [old]);
        if (name === 'cancel') await page.locator('[data-import-action=close]').click();
        else {
          await page.locator('[data-import-action=create]').click();
          await page.locator('[data-filter=caught][aria-pressed=true]').waitFor();
          const rows = await readRows(page);
          assert.equal(rows.length, 2);
          assert.deepEqual(rows[0], old);
          assert.equal(rows[1].version, 'emerald');
          assert.deepEqual(JSON.parse(rows[1].state), { caught: name === 'empty' ? [] : expected });
          await page.reload();
          assert.deepEqual(await readRows(page), rows);
        }
      }
      if (['half', 'ruby-sapphire', 'cancel'].includes(name)) assert.deepEqual(await readRows(page), [old]);
      assert.deepEqual(errors, []);
      assert.deepEqual(writes, []);
      results.push({ name, passed: true });
      console.log('PASS website:', name);
    } finally { await context.close(); }
  }
  for (const [name, hash] of before) assert.equal(digest(fs.readFileSync(path.join(cache, name + '.sav'))), hash);
  fs.writeFileSync(path.join(cache, 'website-results.json'), JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
