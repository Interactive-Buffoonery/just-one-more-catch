import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {createContext, runInNewContext, SourceTextModule, SyntheticModule} from 'node:vm';
const source = readFileSync(new URL('../client/main.ts', import.meta.url), 'utf8');
async function run({failImport = false, cookie = '', search = '', user = null, signal = false, pathname = '/', contactStalled = false, importCheck = false, idleCallback = false} = {}) {
  let release;
  const loaded = new Promise(r => release = r);
  const mounted = [];
  const bridges = [];
  const imports = [];
  const contacts = [];
  const redirects = [];
  const mutations = [];
  const replaced = [];
  let authenticated = false;
  const clients = [];
  let clerkInstance;
  let constructed = 0;
  let loads = 0;
  class Element { closest() { return true; } }
  const listeners = {};
  let idle;
  class Clerk {
    constructor() { constructed++; clerkInstance = this; }
    loaded = false;
    async load() { loads++; await loaded; this.loaded = true; }
    user = user;
    session = user && {id: 'session-a', getToken: async () => 'token'};
    addListener(fn) { fn({user}); }
    mountSignIn(el) { mounted.push(el); }
    unmountSignIn() {}
  }
  class ConvexClient {
    constructor() { clients.push(this); }
    async close() { this.closed = true; }
    setAuth(token, onAuth) { this.tokenProvider = token; Promise.resolve(token({})).then(t => { authenticated = !!t; onAuth?.(!!t); }); }
    mutation(api, input) { mutations.push({input, authenticated}); return Promise.resolve({ok:true}); }
    onUpdate() { return () => {}; }
  }
  let giveUp;
  const window = idleCallback ? {requestIdleCallback(fn, options) {assert.equal(options.timeout, 1500); idle = fn;}} : {};
  const context = createContext({clearTimeout(){},setTimeout:(fn,delay)=>{if(delay===10000)giveUp=fn;else if(delay===1000)idle=fn;},window,URLSearchParams,Element,console:{warn(){}},document:{cookie,getElementById:()=>({addEventListener(event, fn){listeners[event]=fn;}})},location:{hash:'',pathname,search,replace:url=>redirects.push(url)},history:{replaceState:(state,title,url)=>replaced.push(url)}});
  const modules = new Map();
  function makeModule(name, exports) {
    if (!modules.has(name)) modules.set(name,new SyntheticModule(Object.keys(exports), function(){for (const [k,v] of Object.entries(exports)) this.setExport(k,v);},{context}));
    return modules.get(name);
  }
  const main = new SourceTextModule(stripTypeScriptTypes(source),{
    context,
    initializeImportMeta(meta) {meta.env={VITE_CONVEX_URL:'https://example.convex.cloud',VITE_CLERK_PUBLISHABLE_KEY:'example'};},
    async importModuleDynamically(name) {
      if (name === './app' || name === './contact') {
        const exports = name === './app' ? {mount:(el,b)=>bridges.push(b),update:b=>bridges.push(b)} : {mountContact:send=>contacts.push(send)};
        const m=makeModule(name,exports);
        await m.link(()=>{}); await m.evaluate(); return m;
      }
      imports.push(name);
      if (failImport) throw new Error('simulated blocked auth bundle');
      const m=makeModule(name,name==='@clerk/clerk-js'?{Clerk}:{ui:{}});
      await m.link(()=>{}); await m.evaluate(); return m;
    }
  });
  const asyncModule = new SourceTextModule(stripTypeScriptTypes(readFileSync('client/async.ts', 'utf8')), {context});
  await asyncModule.link(()=>{}); await asyncModule.evaluate();
  await main.link(name=>name==='./async'?asyncModule:makeModule(name,name==='convex/browser'?{ConvexClient}:name.endsWith('/api')?{api:{runs:{}}}:name==='./app'?{mount:(el,b)=>bridges.push(b),update:b=>bridges.push(b)}:{}));
  await main.evaluate();
  await new Promise(setImmediate);
  if (pathname === '/contact/') {
    assert.equal(contacts.length,1,'the dedicated page must bind its form');
    assert.equal(bridges.length,0,'Contact must not mount the tracker');
    assert.equal(imports.length,0,'Contact must defer Clerk until a signed-in sender submits');
    assert.equal(idle,undefined,'Contact must not schedule auth preloading');
    if (!contactStalled) release();
    const sent = contacts[0]({message:'Hello',email:'',website:''});
    if (contactStalled) {
      await new Promise(setImmediate);
      giveUp();
      await assert.rejects(sent,/timed out/);
      assert.equal(mutations.length,0,'a stalled session must never send anonymously');
    } else if (failImport && cookie) {
      await assert.rejects(sent,/blocked auth/);
      assert.equal(mutations.length,0,'a failed session must retain the message instead of sending anonymously');
    } else {
      await sent;
      assert.equal(mutations.length,1);
      assert.equal(mutations[0].authenticated,!!user,'signed-in messages must retain account ownership');
      assert.equal(imports.length,cookie?2:0,'guest messages must not need Clerk');
      assert.equal(mutations[0].input.message,'Hello');
    }
    return;
  }
  if (search === '?tab=contact') {
    assert.deepEqual(redirects,['/contact/']);
    assert.equal(bridges.length,0);
    assert.equal(imports.length,0);
    return;
  }
  const bridge=bridges[0];
  if (pathname === '/pair') {
    assert.deepEqual(replaced,['/settings/devices/'],'a pairing link must land on Devices without the code');
    assert.equal(bridge.pairCode,'BCDF-GHJK');
    assert.ok(imports.length>0,'a pairing link must load Clerk at startup');
    assert.equal(bridge.auth.isLoading,false,'a pairing link must not hide guest play');
    return;
  }
  assert.equal(imports.length>0,signal,signal?`${cookie||search} must load Clerk at startup`:`${cookie||'a guest'} must defer Clerk until idle or intent`);
  if (signal) {
    assert.equal(bridge.auth.isLoading,true,'a returning session must show loading, not the guest view');
    giveUp();
    assert.equal(bridges.at(-1).auth.isLoading,false,'a stalled sign-in must fall back to guest play');
    if (user) {
      await new Promise(setImmediate);
      assert.equal(bridges.at(-1).auth.isAuthenticated,false,'the fallback must be guest play, not signed in');
      release();
      await new Promise(setImmediate);
      assert.equal(bridges.at(-1).auth.isAuthenticated,true,'a slow sign-in must still finish after the fallback');
    }
    return;
  }
  const initialRenders = bridges.length;
  idle();
  await new Promise(setImmediate);
  assert.equal(imports.length, 2, 'idle downloads both Clerk modules');
  assert.equal(constructed, failImport ? 0 : 1, 'idle must initialize Clerk before a sign-in tap');
  assert.equal(loads, failImport ? 0 : 1, 'idle must start the session requests');
  assert.equal(bridges.length, initialRenders, 'idle must not render');
  assert.equal(mounted.length, 0, 'idle must not mount');
  listeners.pointerover({target:new Element()});
  await new Promise(setImmediate);
  listeners.focusin({target:new Element()});
  assert.equal(constructed, failImport ? 0 : 1);
  assert.equal(loads, failImport ? 0 : 1);
  const beforeRetry = imports.length;
  listeners.pointerover({target:new Element()});
  assert.equal(imports.length, beforeRetry, 'passive intent only tries once');
  if (!user && !failImport) {
    const open = {isConnected:true,textContent:''};
    bridge.mountSignIn(open);
    release();
    await new Promise(setImmediate);
    assert.deepEqual(mounted, [open], 'click during load mounts once');
    bridge.unmountSignIn(open);
    mounted.length = 0;
    return;
  }
  if (user) {
    const el={isConnected:true,textContent:''};
    bridge.mountSignIn(el);
    release();
    await new Promise(setImmediate);
    assert.equal(mounted.length,0,'an existing session must not mount sign-in');
    assert.equal(bridges.at(-1).auth.isAuthenticated,true,'an existing session must sign in once Clerk loads');
    if (importCheck) {
      const b = bridges.at(-1);
      assert.equal(b.auth.userId, 'user_1');
      const importId = '00000000-0000-4000-8000-000000000001';
      await b.importRun('leafgreen', [25], importId);
      const connection = clients.at(-1);
      assert.notEqual(connection, clients[0], 'imports need a connection bound to their confirming session');
      assert.equal(connection.closed, true, 'imports must release their connection');
      assert.deepEqual(JSON.parse(JSON.stringify(mutations.at(-1).input)), {version:'leafgreen', caught:[25], importId});
      assert.equal(await connection.tokenProvider({forceRefreshToken:false}), 'token');
      clerkInstance.user = {id:'other-user'};
      clerkInstance.session = {id:'session-b',getToken:async ()=>'other-token'};
      assert.equal(await connection.tokenProvider({forceRefreshToken:true}), null, 'retries must never use another account token');
    }
    return;
  }
  assert.equal(bridge.auth.isLoading,false,'guest mode must start before auth resolves');
  const el={isConnected:true,textContent:''};
  bridge.mountSignIn(el);
  assert.ok(imports.length,'the first sign-in tap must load Clerk');
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
    assert.ok(imports.length > beforeRetry, 'explicit sign-in retries imports');
    assert.match(open.textContent,/couldn't load/);
    assert.equal(bridges.at(-1).auth.isAuthenticated,false);
  }
}
await run({pathname:'/contact/'});
await run({pathname:'/contact/',cookie:'__client_uat=1731300000'});
await run({pathname:'/contact/',cookie:'__client_uat=1731300000',user:{id:'user_1'}});
await run({pathname:'/contact/',cookie:'__client_uat=1731300000',failImport:true});
await run({pathname:'/contact/',cookie:'__client_uat=1731300000',contactStalled:true});
await run({search:'?tab=contact'});
await run({pathname:'/import/'});
await run({pathname:'/import/',failImport:true});
await run({pathname:'/import/',cookie:'__client_uat=1731300000',user:{id:'user_1'},signal:true});
await run({pathname:'/pair',search:'?code=bcdfghjk'});
await run();
await run({idleCallback:true});
await run({idleCallback:true,failImport:true});
await run({failImport:true});
await run({user:{id:'user_1'},importCheck:true});
await run({cookie:'__client_uat=0; theme=dark'});
await run({cookie:'theme=dark; __client_uat=1731300000',signal:true});
await run({cookie:'__client_uat_abc123=1731300000',signal:true});
await run({search:'?__clerk_handshake=x',signal:true});
await run({cookie:'__client_uat=1731300000',user:{id:'user_1'},signal:true});

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
console.log('startup ok: idle initialization, intent reuse, retry limits, session signals, delayed/failed sign-in, cancellation, reopening, and recovery');
