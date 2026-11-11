// Run: node scripts/check_sw.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const store = new Map();
const cache = {put: async (key, res) => void store.set(key.url ?? key, res)};
const handlers = {};
let online = true;
const fetched = [];
const response = (body, status = 200) => ({body, status, ok: status === 200, clone() { return this; }});
runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
  URL,
  Response: {error: () => response('error', 0)},
  location: {origin: 'https://app.example'},
  caches: {
    open: async () => cache,
    match: async key => store.get(key.url ?? key),
    keys: async () => [],
  },
  fetch: async req => {
    fetched.push(req.url);
    if (!online) throw new Error('offline');
    return response('net ' + req.url);
  },
  self: {addEventListener: (type, fn) => (handlers[type] = fn), skipWaiting() {}, clients: {claim() {}}},
});
const get = async (path, mode = 'no-cors', method = 'GET') => {
  let answer;
  handlers.fetch({request: {url: new URL(path, 'https://app.example').href, mode, method}, respondWith: p => (answer = p)});
  const res = answer && (await answer);
  await new Promise(setImmediate);
  return res;
};

assert.equal(await get('https://api.example/x'), undefined, 'other origins are left alone');
assert.equal(await get('/sprites/a.png', 'no-cors', 'POST'), undefined, 'only GET is handled');
assert.equal(await get('/privacy/', 'navigate'), undefined, 'legal pages go straight to the network');

assert.match((await get('/?tab=dex', 'navigate')).body, /^net /, 'the app page comes from the network when online');
assert.match((await get('/assets/app-abc.js')).body, /^net /);
const before = fetched.length;
assert.match((await get('/assets/app-abc.js')).body, /^net /, 'a cached file is served again');
assert.equal(fetched.length, before, 'without another request');

online = false;
assert.match((await get('/?tab=journey', 'navigate')).body, /^net /, 'offline, the app page comes from the cache');
assert.match((await get('/assets/app-abc.js')).body, /^net /, 'offline, cached files still load');
await assert.rejects(get('/sprites/never-seen.png'), 'offline, uncached files fail as usual');
console.log('service worker ok: offline app page, cache-first static files, everything else untouched');
