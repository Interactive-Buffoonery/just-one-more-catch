import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

export async function launchHarness(cache) {
  assert.ok(process.env.PLAYWRIGHT_MODULE, 'Set PLAYWRIGHT_MODULE to an installed Playwright index.mjs');
  const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
  const build = path.resolve('dist');
  const reader = path.resolve('node_modules/@serabi/pokemon-save-reader');
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
return { base, browser, server };
}

export async function choose(cache, page, name, drop = false, fileName = 'wrong-title.srm') {
  const file = path.join(cache, name + '.sav');
  if (drop) await page.locator('.si-drop').evaluate((node, { bytes, fileName }) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(bytes)], fileName));
    node.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
  }, { bytes: [...fs.readFileSync(file)], fileName });
  else await page.locator('input[type=file]').setInputFiles(file);
  await page.waitForFunction(() => document.querySelector('[data-import-action=format], [data-import-action=version], [data-import-action=create], .si-oops'), null, { timeout: 60000 });
  if (await page.locator('[data-format=pkhex]').count()) await page.locator('[data-format=pkhex]').click();
}

export async function inspectWorker(page, names) {
  return await page.evaluate(async (names) => {
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
}

export const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

export const old = { id: 'local-old', version: 'crystal', state: JSON.stringify({ caught: [1], notes: 'Keep me' }), createdAt: '2026-01-01T00:00:00.000Z' };
export const readRows = page => page.evaluate(() => JSON.parse(localStorage.getItem('jomc.guest')));
export async function setupPage(browser, base, mobile = false, failStorage = true) {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 1000 } });
  await context.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
  await context.routeWebSocket('**/*', socket => socket.close());
  await context.addInitScript(({ row, failStorage }) => {
    if (!localStorage.getItem('jomc.guest')) localStorage.setItem('jomc.guest', JSON.stringify([row]));
    if (!failStorage) return;
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'jomc.guest' && window.failStorage) throw new Error('quota');
      return set.call(this, key, value);
    };
  }, { row: old, failStorage });
  const page = await context.newPage();
  const errors = [], writes = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.method() !== 'GET') writes.push(request.url()); });
  await page.goto(base + '/import/');
  await page.locator('input[type=file]').waitFor();
  return { context, page, errors, writes };
}

export async function closeHarness(browser, server) {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

export async function prepareRetry(context) {
  let failed = false;
  await context.route('**/save-reader/**/worker.js', route => {
    if (!failed) { failed = true; return route.abort(); }
    return route.continue();
  });
}

export async function cancelPreparing(context, page, file) {
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await context.route('**/save-reader/**/worker.js', async route => { await held; await route.abort(); });
  try {
    await page.locator('input[type=file]').setInputFiles(file);
    await page.locator('[data-import-action=cancel]').click();
    await page.locator('input[type=file]').waitFor();
  } finally { release(); }
}

export async function storageRetry(page) {
  await page.evaluate(() => { window.failStorage = true; });
  await page.locator('[data-import-action=create]').click();
  await page.locator('[data-import-action=retry]').waitFor();
  assert.deepEqual(await readRows(page), [old]);
  await page.evaluate(() => { window.failStorage = false; });
  await page.locator('[data-import-action=retry]').click();
  await page.locator('[data-import-action=create]').click();
  await page.locator('[data-filter=caught][aria-pressed=true]').waitFor();
}

export async function duplicateImport(page) {
  await page.locator('[data-import-action=create]').evaluate(button => { button.click(); button.click(); });
  await page.locator('[data-filter=caught][aria-pressed=true]').waitFor();
}
