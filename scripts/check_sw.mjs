// Run: node scripts/check_sw.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const store = new Map();
const path = key => new URL(key.url ?? key, 'https://app.example').pathname + new URL(key.url ?? key, 'https://app.example').search;
const cache = {delete: async key => {
  const pathname = path(key).split('?')[0];
  for (const entry of store.keys()) if (entry.split('?')[0] === pathname) store.delete(entry);
}, put: async (key, res) => void store.set(path(key), res)};
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
    match: async key => store.get(path(key)),
    keys: async () => [],
  },
  fetch: async req => {
    fetched.push(req.url ?? req);
    if (!online) throw new Error('offline');
    return response('net ' + (req.url ?? req));
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
assert.equal(await get('/about/', 'navigate'), undefined, 'About goes straight to the network');
assert.equal(await get('/terms/', 'navigate'), undefined, 'Terms goes straight to the network');
assert.equal(await get('/privacy/', 'navigate'), undefined, 'legal pages go straight to the network');

assert.match((await get('/?tab=dex', 'navigate')).body, /^net /, 'the app page comes from the network when online');
assert.match((await get('/assets/app-abc.js')).body, /^net /);
const before = fetched.length;
assert.match((await get('/assets/app-abc.js')).body, /^net /, 'a cached file is served again');
assert.equal(fetched.length, before, 'without another request');

let stored;
handlers.message({
  data: ['https://app.example/assets/first-visit.js', 'https://api.example/x', 'https://app.example/privacy/'],
  waitUntil: p => (stored = p),
});
await stored;
assert.deepEqual([...store.keys()].sort(), ['/', '/assets/app-abc.js', '/assets/first-visit.js'], 'a first visit stores the app page and only its own static files');

await get('/covers/red.jpg?v=aaaaaaaa');
await get('/covers/red.jpg?v=bbbbbbbb');
assert.equal(store.has('/covers/red.jpg?v=aaaaaaaa'), false);
assert.equal(store.has('/covers/red.jpg?v=bbbbbbbb'), true);
handlers.message({data: ['https://app.example/sprites/hgss/25.png?v=cccccccc'], waitUntil: p => (stored = p)});
await stored;
assert.equal(store.has('/sprites/hgss/25.png?v=cccccccc'), true);
online = false;
await get('/sprites/hgss/25.png?v=cccccccc');
assert.match((await get('/?tab=journey', 'navigate')).body, /^net /, 'offline, the app page comes from the cache');
for (const route of ['/settings/', '/settings/devices/', '/pair?code=ABCDEFGH'])
  assert.match((await get(route, 'navigate')).body, /^net /, `offline, ${route} gets the cached app page`);
assert.match((await get('/assets/app-abc.js')).body, /^net /, 'offline, cached files still load');
assert.match((await get('/assets/first-visit.js')).body, /^net /, 'offline, first-visit files load');
await assert.rejects(get('/sprites/never-seen.png'), 'offline, uncached files fail as usual');
console.log('service worker ok: offline app page, cache-first static files, everything else untouched');
