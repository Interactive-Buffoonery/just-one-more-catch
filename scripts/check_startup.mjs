import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {createContext, runInNewContext, SourceTextModule, SyntheticModule} from 'node:vm';
const source = readFileSync(new URL('../client/main.ts', import.meta.url), 'utf8');
async function run(failImport = false) {
  let release;
  const loaded = new Promise(r => release = r);
  const mounted = [];
  const bridges = [];
  class Clerk {
    loaded = false;
    async load() { await loaded; this.loaded = true; }
    addListener(fn) { fn({user:null}); }
    mountSignIn(el) { mounted.push(el); }
    unmountSignIn() {}
  }
  class ConvexClient {
    setAuth(token, onAuth) { onAuth(false); }
  }
  const context = createContext({console:{warn(){}},document:{getElementById:()=>({})},location:{hash:'',pathname:'/',search:''},history:{replaceState(){}}});
  const modules = new Map();
  function makeModule(name, exports) {
    if (!modules.has(name)) modules.set(name,new SyntheticModule(Object.keys(exports), function(){for (const [k,v] of Object.entries(exports)) this.setExport(k,v);},{context}));
    return modules.get(name);
  }
  const main = new SourceTextModule(stripTypeScriptTypes(source),{
    context,
    initializeImportMeta(meta) {meta.env={VITE_CONVEX_URL:'https://example.convex.cloud',VITE_CLERK_PUBLISHABLE_KEY:'example'};},
    async importModuleDynamically(name) {
      if (failImport) throw new Error('simulated blocked auth bundle');
      const m=makeModule(name,name==='@clerk/clerk-js'?{Clerk}:{ui:{}});
      await m.link(()=>{}); await m.evaluate(); return m;
    }
  });
  await main.link(name=>makeModule(name,name==='convex/browser'?{ConvexClient}:name.endsWith('/api')?{api:{runs:{}}}:name==='./app'?{mount:(el,b)=>bridges.push(b),update:b=>bridges.push(b)}:{}));
  await main.evaluate();
  const bridge=bridges[0];
  assert.equal(bridge.auth.isLoading,false,'guest mode must start before auth resolves');
  const el={isConnected:true,textContent:''};
  bridge.mountSignIn(el);
  bridge.unmountSignIn(el);
  release();
  await new Promise(setImmediate);
  assert.equal(mounted.length,0,'a closed sign-in sheet must not mount after auth resolves');
  if (!failImport) {
    const open={isConnected:true,textContent:''};
    bridge.mountSignIn(open);
    assert.deepEqual(mounted,[open],'reopened sign-in sheet should mount normally');
  } else {
    const open={isConnected:true,textContent:''};
    bridge.mountSignIn(open);
    await new Promise(setImmediate);
    assert.match(open.textContent,/couldn't load/);
    assert.equal(bridges.at(-1).auth.isAuthenticated,false);
  }
}
await run();
await run(true);

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const recoveryScript = html.match(/<script>([\s\S]*?)<\/script>/)[1];
let recovery = {hidden:true};
let timeout;
let failed;
let reload;
let reloaded = false;
runInNewContext(recoveryScript, {
  document: {
    getElementById: id => id === 'startup-recovery' ? recovery : {
      addEventListener: (event, callback) => reload = callback,
    },
  },
  window: {addEventListener: (event, callback) => failed = callback},
  location: {reload: () => reloaded = true},
  setTimeout: (callback, delay) => {
    assert.equal(delay, 12000);
    timeout = callback;
  },
});
assert.equal(recovery.hidden, true);
failed();
assert.equal(recovery.hidden, false, 'a failed entry must offer recovery');
recovery.hidden = true;
timeout();
assert.equal(recovery.hidden, false, 'a stalled entry must offer recovery');
reload();
assert.equal(reloaded, true);
recovery = null;
assert.doesNotThrow(timeout, 'recovery must be harmless after the app mounts');
console.log('startup ok: delayed/failed sign-in, cancellation, reopening, and recovery');
