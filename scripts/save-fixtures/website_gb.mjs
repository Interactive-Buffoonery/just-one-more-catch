import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

assert.ok(process.env.PLAYWRIGHT_MODULE, 'Set PLAYWRIGHT_MODULE to an installed Playwright index.mjs');
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const root = path.resolve('dist');
const cache = path.resolve(process.argv[2] || '.cache/save-tests');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.wasm': 'application/wasm', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let file = path.resolve(root, '.' + new URL(req.url, 'http://local').pathname);
  if (file !== root && !file.startsWith(root + path.sep)) return res.writeHead(404).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const old = { id: 'local-old', version: 'crystal', state: JSON.stringify({ caught: [1], badges: ['Zephyr'], notes: 'Keep me' }), createdAt: '2026-01-01T00:00:00.000Z' };
const results = [];
const matrix = ['RD', 'BU', 'YW', 'GD', 'SI'].flatMap((id, i) => [false, true].map(empty => ({ name: `synthetic/${id}${empty ? '-empty' : ''}`, version: ['red', 'blue', 'yellow', 'gold', 'silver'][i], caught: empty ? [] : [25, 133] })));
const raw = JSON.parse(fs.readFileSync(path.join(cache, 'wasm-results.json'))).results;
for (const [name, version] of [['red', 'red'], ['yellow', 'yellow'], ['gold', 'gold'], ['crystal', 'crystal']]) matrix.push({ name: `public/${name}`, version, caught: raw.find(r => r.name === `public/${name}`).inspected.pokedex.caughtSpecies });
matrix.push({ name: 'in-game/red-zero', version: 'red', caught: [] });
const readRows = page => page.evaluate(() => JSON.parse(localStorage.getItem('jomc.guest')));
async function setup(mobile = false) {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 1000 } });
  await context.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
  await context.routeWebSocket('**/*', socket => socket.close());
  await context.addInitScript(row => {
    if (!localStorage.getItem('jomc.guest')) localStorage.setItem('jomc.guest', JSON.stringify([row]));
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) {
      if (k === 'jomc.guest' && window.failStorage) throw new Error('quota');
      return set.call(this, k, v);
    };
  }, old);
  const page = await context.newPage();
  const errors = [];
  const writes = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.method() !== 'GET') writes.push(request.url()); });
  await page.goto(base);
  await page.locator('[data-k=import-save]').click();
  await page.waitForURL(base + '/import/');
  return { context, page, errors, writes };
}
async function preview(page, file, version) {
  if (file.endsWith('SI-empty.sav')) {
    await page.locator('.si-drop').evaluate((node, bytes) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array(bytes)], 'dropped.sav', { type: 'application/octet-stream' }));
      node.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
    }, [...fs.readFileSync(file)]);
  } else await page.locator('input[type=file]').setInputFiles(file);
  let choices = [];
  for (let i = 0; i < 4; i++) {
    await page.waitForFunction(() => document.querySelector('[data-import-action=format], [data-import-action=version], [data-import-action=create], .si-oops'), null, { timeout: 60000 });
    if (await page.locator('[data-format=pkhex]').count()) { await page.locator('[data-format=pkhex]').click(); continue; }
    if (await page.locator('[data-import-action=version]').count()) {
      choices = await page.locator('[data-import-action=version]').evaluateAll(nodes => nodes.map(node => node.dataset.version));
      await page.locator(`[data-version="${version}"]`).click();
    }
    await page.locator('[data-import-action=create]').waitFor();
    return choices;
  }
  throw new Error('No preview');
}
try {
  for (const test of matrix) {
    const { context, page, errors, writes } = await setup(test.name === 'synthetic/YW');
    try {
      const file = path.join(cache, test.name + '.sav');
      const hash = () => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      const before = hash();
      const choices = await preview(page, file, test.version);
      const expectedChoices = ['red', 'blue'].includes(test.version) ? ['red', 'blue'] : ['gold', 'silver'].includes(test.version) ? ['gold', 'silver'] : [];
      assert.deepEqual(choices, expectedChoices, test.name);
      assert.match((await page.locator('.si-count').innerText()).replace(/\s+/g, ' '), new RegExp(`^${test.caught.length} of`));
      assert.match(await page.locator('.si-start').innerText(), /This save doesn't record a start date/);
      assert.deepEqual(await readRows(page), [old]);
      await page.locator('[data-import-action=create]').click();
      await page.locator('[data-filter=caught][aria-pressed=true]').waitFor();
      const rows = await readRows(page);
      assert.equal(rows.length, 2);
      assert.deepEqual(rows[0], old);
      assert.equal(rows[1].version, test.version);
      assert.deepEqual(JSON.parse(rows[1].state), { caught: test.caught });
      const localDate = await page.evaluate(value => [new Date(value).toDateString(), new Date().toDateString()], rows[1].createdAt);
      assert.equal(localDate[0], localDate[1]);
      await page.reload();
      assert.deepEqual(await readRows(page), rows);
      assert.equal(hash(), before);
      assert.deepEqual(errors, []);
      assert.deepEqual(writes, []);
      results.push({ ...test, caught: test.caught.length, choices, unchanged: true, persisted: true });
      console.log('PASS', test.name);
    } finally { await context.close(); }
  }
  for (const scenario of ['cancel', 'invalid', 'storage-retry']) {
    const { context, page, writes } = await setup();
    try {
      if (scenario === 'invalid') {
        await page.locator('input[type=file]').setInputFiles({ name: 'broken.sav', mimeType: 'application/octet-stream', buffer: Buffer.from([1, 2, 3]) });
        await page.locator('.si-oops').waitFor();
      } else {
        await preview(page, path.join(cache, 'synthetic/RD.sav'), 'red');
        if (scenario === 'cancel') await page.locator('[data-import-action=close]').click();
        else {
          await page.evaluate(() => { window.failStorage = true; });
          await page.locator('[data-import-action=create]').click();
          await page.locator('[data-import-action=retry]').waitFor();
          assert.deepEqual(await readRows(page), [old]);
          await page.evaluate(() => { window.failStorage = false; });
          await page.locator('[data-import-action=retry]').click();
          await page.locator('[data-import-action=create]').click();
          await page.locator('[data-filter=caught][aria-pressed=true]').waitFor();
        }
      }
      const rows = await readRows(page);
      assert.deepEqual(rows[0], old);
      assert.equal(rows.length, scenario === 'storage-retry' ? 2 : 1);
      assert.deepEqual(writes, []);
      results.push({ scenario, passed: true });
      console.log('PASS', scenario);
    } finally { await context.close(); }
  }
  fs.writeFileSync(path.join(cache, 'website-results.json'), JSON.stringify({ results }, null, 2));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
