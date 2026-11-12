import { $, esc } from "../dom";
import { bridge, ui } from "../game";
import type { Device, PairingLookup, PairingState } from "../types";

const CHEVRON = `<svg viewBox="0 0 10 16" aria-hidden="true"><path d="M2 2l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const BACK = `<svg viewBox="0 0 10 16" aria-hidden="true"><path d="M8 2L2 8l6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const HANDHELD =
  "(orientation:landscape) and (max-height:560px) and (min-width:560px)";

export const pairLetters = (v: string) =>
  v
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 8);
export const showCode = (letters: string) =>
  letters.length > 4 ? `${letters.slice(0, 4)}-${letters.slice(4)}` : letters;
const spell = (code: string) =>
  code
    .replace("-", "")
    .split("")
    .join(" ")
    .replace(/^(\S \S \S \S) /, "$1, ");

const ago = (t: number, fresh: string) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 2) return fresh;
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} hr ago`;
  return new Date(t).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export const devicesRow = () =>
  bridge.auth.isAuthenticated
    ? `<section class="s-devrow"><a class="navrow" href="/settings/devices/" data-nav="devices" data-k="devrow"><span>Devices</span><span class="nv">${ui.devices ? `${ui.devices.length} signed in` : ""}</span>${CHEVRON}</a></section>`
    : "";

function deviceItem(d: Device) {
  const meta = `${ago(d.lastActiveAt, "Active now")}${d.city ? ` · ${esc(d.city)}` : ""}`;
  const who = `<span class="who"><b>${esc(d.label)}${d.current ? ` <span class="tag">This device</span>` : ""}</b><span class="small muted">${meta}</span></span>`;
  if (d.current) return `<li>${who}</li>`;
  if (ui.revoking === d.id)
    return `<li class="ask">${who}<div class="acts"><button class="app-quiet" data-revokecancel="${d.id}" data-k="rvc-${d.id}">Cancel</button><button class="app-danger" data-revoke="${d.id}" data-k="rv-${d.id}">Revoke</button></div></li>`;
  return `<li>${who}<button class="danger" data-revokeask="${d.id}" data-k="rva-${d.id}" aria-label="Revoke ${esc(d.label)}">Revoke</button></li>`;
}

const deviceList = () =>
  ui.devicesError
    ? `<p class="small" role="alert" style="margin:0;color:var(--coral)">${ui.devicesError}</p><div class="chips"><button class="chip" data-devretry="1" data-k="devretry">Retry</button></div>`
    : !ui.devices
      ? `<p class="muted" style="margin:0">Loading…</p>`
      : `<ul class="devs">${[...(ui.devices as Device[])]
          .sort(
            (a, b) =>
              Number(b.current) - Number(a.current) ||
              b.lastActiveAt - a.lastActiveAt,
          )
          .map(deviceItem)
          .join("")}</ul>`;

export function Devices() {
  const head = `<a class="back" href="/settings/" data-nav="settings" data-k="back">${BACK}<span>Settings</span></a><h1 class="lg pgtitle" tabindex="-1" data-k="pgtitle">Devices</h1>`;
  if (!bridge.auth.isAuthenticated)
    return `${head}<div class="chips"><button class="chip" data-signinsheet="1" data-k="signin-devices">Sign in</button></div>`;
  const letters = pairLetters(ui.pairInput || "");
  return `${head}<div class="devpage">
    <section class="s-pair"><h3>Sign in another device</h3><form class="codeform" id="pairform"><label class="field"><span>Code</span><input id="paircode" data-k="paircode" value="${showCode(letters)}" maxlength="9" autocapitalize="characters" autocomplete="off" spellcheck="false" enterkeyhint="go"></label><button class="app-primary" id="pairgo" data-k="pairgo"${letters.length < 8 || ui.pairBusy ? " disabled" : ""}>Continue</button></form>${ui.pairError ? `<p class="small" role="alert" style="margin:8px 0 0;color:var(--coral)">${ui.pairError}</p>` : ""}</section>
    <section class="s-dev"><h3 id="devs-title" tabindex="-1">Signed-in devices</h3>${deviceList()}</section></div>`;
}

export const pairErrorText = (r: {
  status: string;
  retryAfterSeconds?: number;
}) =>
  r.status === "limited"
    ? `Too many tries. Try again in ${Math.max(1, Math.ceil((r.retryAfterSeconds ?? 60) / 60))} min.`
    : "Code not found";

export function fillApprove(p: Extract<PairingLookup, { status: "ok" }>) {
  $("#sheetbody").innerHTML =
    `<div class="grab" aria-hidden="true"></div><h2 class="lg" id="sheet-title">Sign in a device</h2><div class="approve">
    <p class="pcode" aria-label="${spell(p.code)}">${esc(p.code)}</p>
    <p class="warnline">Approve only if this code matches the device's screen.</p>
    <dl class="meta"><dt>Device</dt><dd>${esc(p.label)}</dd><dt>Started</dt><dd>${ago(p.startedAt, "Just now")}</dd></dl>
    <p class="small approve-status" id="approve-status" role="status"></p>
    <div class="acts"><button class="app-quiet" data-deny="1" autofocus>Deny</button><button class="app-primary" data-approve="1">Approve</button></div></div>`;
}

/* ---- Device side: the guest shows a code and waits ---- */
export type PairView = {
  state: PairingState | "starting";
  code?: string;
  url?: string;
  expiresAt?: number;
};
const ICON_EXPIRED = `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
const ICON_BAD = `<svg class="ico bad" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>`;
export const ttl = (expiresAt: number) => {
  const s = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
  return `Expires in ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export async function pairBody(v: PairView) {
  const retry = `<div class="acts"><button class="app-primary" data-pairstart="1" data-autofocus>New code</button><button class="app-quiet" data-close="1">Cancel</button></div>`;
  const ended = (icon: string, text: string) =>
    `<div class="status">${icon}<p class="big">${text}</p>${retry}</div>`;
  if (v.state === "pending" && v.code && v.url) {
    const { renderSVG } = await import("uqr");
    return `<div class="pair"><div class="qr" role="img" aria-label="QR code for ${esc(new URL(v.url).host)}/pair">${renderSVG(v.url, { border: 0 })}</div>
      <p class="pcode" aria-label="${spell(v.code)}">${esc(v.code)}</p>
      <p class="url">${esc(new URL(v.url).host)}/pair</p>
      <p class="ttl" id="pairttl" aria-live="off">${ttl(v.expiresAt!)}</p>
      <div class="acts"><button class="app-quiet" data-close="1" data-autofocus>Cancel</button></div></div>`;
  }
  if (
    v.state === "starting" ||
    v.state === "approved" ||
    v.state === "signed-in"
  )
    return `<div class="status"><div class="spin" aria-hidden="true"></div><p class="big">${v.state === "starting" ? "Getting a code" : "Signing in"}</p>${v.code ? `<p class="pcode" aria-label="${spell(v.code)}">${esc(v.code)}</p>` : ""}</div>`;
  if (v.state === "expired") return ended(ICON_EXPIRED, "Code expired");
  if (v.state === "denied") return ended(ICON_BAD, "Sign-in denied");
  return ended(ICON_BAD, "Couldn't sign in");
}
