type Turnstile = {
  render(container: HTMLElement, options: {
    sitekey: string;
    action: string;
    cData: string;
    execution: "execute";
    appearance: "interaction-only";
    callback(token: string): void;
    "error-callback"(): void;
    "expired-callback"(): void;
    "timeout-callback"(): void;
  }): string;
  execute(id: string): void;
  remove(id: string): void;
};
const turnstile = () => (window as Window & { turnstile?: Turnstile }).turnstile;
let loading: Promise<Turnstile> | undefined;
let visitor: string | undefined;
function visitorId() {
  if (visitor) return visitor;
  try { visitor = localStorage.getItem("jomc.visitor") ?? undefined; } catch {}
  if (!visitor || !/^[a-f0-9]{32}$/.test(visitor)) {
    visitor = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join("");
    try { localStorage.setItem("jomc.visitor", visitor); } catch {}
  }
  return visitor;
}
function load(): Promise<Turnstile> {
  return loading ??= new Promise<Turnstile>((resolve, reject) => {
    let script: HTMLScriptElement | undefined;
    const fail = () => { script?.remove(); reject(new Error("Verification couldn't load. Please try again.")); };
    const timeout = setTimeout(fail, 10000);
    const loaded = (api: Turnstile) => { clearTimeout(timeout); resolve(api); };
    const existing = turnstile();
    if (existing) return loaded(existing);
    script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onerror = () => { clearTimeout(timeout); fail(); };
    script.onload = () => {
      const api = turnstile();
      if (api) loaded(api); else { clearTimeout(timeout); fail(); }
    };
    document.head.append(script);
  }).catch(error => { loading = undefined; throw error; });
}
export async function verificationToken(action: "contact" | "pairing" | "analytics") {
  const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  if (!sitekey) throw new Error("Verification unavailable. Please try again.");
  const api = await load();
  const container = document.createElement("div");
  container.setAttribute("aria-label", "Security check");
  Object.assign(container.style, { position: "fixed", bottom: "16px", right: "16px", zIndex: "10000" });
  (document.querySelector("dialog:modal") ?? document.body).append(container);
  let widget: string | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await new Promise<string>((resolve, reject) => {
      const fail = () => reject(new Error("Verification failed. Please try again."));
      timeout = setTimeout(fail, 120000);
      widget = api.render(container, {
        sitekey, action, cData: visitorId(), execution: "execute", appearance: "interaction-only",
        callback: resolve, "error-callback": fail, "expired-callback": fail, "timeout-callback": fail,
      });
      api.execute(widget);
    });
  } finally {
    clearTimeout(timeout);
    if (widget !== undefined) api.remove(widget);
    container.remove();
  }
}
