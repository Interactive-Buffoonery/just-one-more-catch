import { $, esc } from "./dom";
import { bridge, dumpRun, isGuest, run, ui, verOf } from "./game";
import { projectionOf, validateProjection, type ShareProjection } from "../shared/share-projection";
import type { ShareStatus } from "../convex/shares";
import type { VersionId } from "../shared/versions";
import { renderSnapshot } from "./views/share";

const statuses = new Map<string, ShareStatus | null>();
let owner: string | undefined;
export const shareActive = (id: string) => !!statuses.get(id)?.token;
export function loadShareStatuses(changed: () => void) {
  if (owner !== bridge.auth.userId) {
    owner = bridge.auth.userId;
    statuses.clear();
  }
  if (!bridge.auth.isAuthenticated) return;
  const user = owner;
  for (const row of bridge.runs ?? []) {
    if (statuses.has(row.id)) continue;
    statuses.set(row.id, null);
    void bridge.shareStatus(row.id).then(status => {
      if (owner !== user) return;
      if ((statuses.get(row.id)?.revision ?? -1) > status.revision) return;
      statuses.set(row.id, status);
      changed();
    }, () => {});
  }
}

export function shareSheet(id: string, save: () => Promise<void>, changed: () => void, notify: (message: string) => void) {
  const sheet = ui.sheet, user = bridge.auth.userId;
  const valid = () => ui.sheet === sheet && bridge.auth.userId === user;
  let status: ShareStatus = { token: null, projection: null, revision: 0 };
  let preview: ShareProjection;
  let mode = "preview", action = "create", busy = false;
  const button = (act: string, label: string, cls = "app-quiet") => `<button class="${cls}" data-shareaction="${act}"${busy ? " disabled" : ""}>${label}</button>`;
  const url = () => `${location.origin}/share/#s=${status.token}`;
  const summary = (p: ShareProjection) => `${p.caught.length} caught, ${p.badges.length} ${(verOf(p.game).pack.badgesWord ?? "badges").slice(0, p.badges.length === 1 ? -1 : undefined)}`;
  const paint = (error = "") => {
    if (!valid()) return;
    let html: string;
    if (mode === "stop") {
      html = `<h2 class="lg" id="sheet-title">Stop sharing?</h2><p>The link stops working right away. Anyone who already saved a copy keeps it.</p><div class="hv-actions">${button("back", "Keep sharing")}${button("stopconfirm", "Stop sharing", "app-primary share-stop")}</div>`;
    } else if (mode === "live" && status.projection) {
      const fresh = status.projection.caught.length === preview.caught.length && status.projection.badges.length === preview.badges.length;
      html = `<h2 class="lg" id="sheet-title">Progress link</h2><div class="linkrow"><span class="url">${esc(location.host)}/share/#s=<b>${esc(status.token)}</b></span></div><div class="rowbtns">${button("copy", "Copy link", "app-primary")}${typeof navigator.share === "function" ? button("native", "Share…") : ""}</div><div class="notice"><span>Link shows <b>${esc(summary(status.projection))}</b>. ${fresh ? "Up to date." : `You're at <b>${esc(summary(preview))}</b>.`}</span>${fresh ? "" : button("update", "Update", "app-primary")}</div><details class="more"><summary>More options</summary><div class="hv-actions">${button("replace", "Replace link")}${button("stop", "Stop sharing", "app-quiet danger")}</div><p class="soft" style="margin:10px 0 0">Replacing makes a new link. Anyone with the old one loses access.</p></details><div class="hv-actions">${button("close", "Done")}<a class="app-quiet" href="${esc(url())}" target="_blank" rel="noopener noreferrer">Open public page</a>${fresh ? button("update", "Update snapshot") : ""}</div>`;
    } else {
      const guest = isGuest();
      html = `<h2 class="lg" id="sheet-title">${action === "update" ? "Update link" : action === "replace" ? "Replace link" : "Share progress"}</h2><p class="eyebrow">Anyone with the link sees this</p><article class="pub snap" data-game="${preview.game}">${renderSnapshot(preview)}</article><p class="soft" style="margin:12px 0 0">Shares this game, the species you've marked caught, and the ${verOf(preview.game).pack.badgesWord ?? "badges"} you've recorded. The link keeps showing this until you update it.</p>${guest ? `<p>Sign in to make a link for this playthrough. Your progress comes with you.</p>` : ""}<div class="hv-actions">${button(status.token ? "back" : "close", "Not now")}${guest ? `<button class="app-primary" data-signinsheet="1">Sign in</button>` : button("publish", action === "update" ? "Update snapshot" : action === "replace" ? "Replace link" : "Create link", "app-primary")}</div>`;
    }
    $("#sheetbody").innerHTML = html + (error ? `<p class="soft" role="alert">${esc(error)}</p>` : "");
  };
  const current = async () => {
    await save();
    if (!valid()) throw new Error("Closed");
    const row = bridge.runs?.find(row => row.id === id);
    if (!row) throw new Error("Playthrough unavailable");
    const state = run?.id === id ? dumpRun(run) : await bridge.getState(id);
    if (!valid()) throw new Error("Closed");
    preview = projectionOf(state, row.version as VersionId);
  };
  const ready = (async () => {
    try {
      await current();
      if (!isGuest()) status = await bridge.shareStatus(id);
      if (!valid()) return;
      statuses.set(id, status);
      mode = status.token ? "live" : "preview";
      paint();
    } catch {
      if (valid()) $("#sheetbody").innerHTML = `<h2 class="lg" id="sheet-title">Share progress</h2><p role="alert">Couldn't save or load this playthrough. Please try again.</p><div class="hv-actions">${button("close", "Done")}</div>`;
    }
  })();
  return async (act: string) => {
    await ready;
    if (busy || !valid()) return;
    if (act === "close") { $("#sheet").close(); return; }
    if (act === "stop") { mode = "stop"; paint(); return; }
    if (act === "back") { mode = "live"; paint(); return; }
    busy = true;
    paint();
    try {
      if (act === "copy") {
        await navigator.clipboard.writeText(url());
        notify("Link copied");
      } else if (act === "native") {
        await navigator.share({ url: url() });
      } else if (act === "update") {
        await current();
        action = act;
        mode = "preview";
      } else if (act === "publish" || act === "replace" || act === "stopconfirm") {
        if (act === "replace") action = "replace";
        if (!bridge.auth.isAuthenticated) return;
        status = act === "stopconfirm" ? await bridge.stopShare(id, status.revision) : action === "replace" ? await bridge.replaceShare(id, preview, status.revision) : await bridge.publishShare(id, preview, status.revision);
        if (!valid()) return;
        statuses.set(id, status);
        changed();
        notify(act === "stopconfirm" ? "Sharing stopped" : action === "update" ? "Link updated" : action === "replace" ? "New link ready. The old one stopped working." : "Link created");
        if (!status.token) { $("#sheet").close(); return; }
        mode = "live";
      }
      busy = false;
      paint();
    } catch (error) {
      busy = false;
      if (!valid()) return;
      const data = (error as { data?: { code?: string; projection?: unknown } }).data;
      if (data?.code === "SHARE_PREVIEW_MISMATCH" && validateProjection(data.projection)) {
        preview = validateProjection(data.projection)!;
        mode = "preview";
        paint();
      } else if (data?.code === "SHARE_REVISION_CONFLICT") {
        try {
          status = await bridge.shareStatus(id);
          await current();
          if (!valid()) return;
          statuses.set(id, status);
          mode = status.token ? "live" : "preview";
          paint();
        } catch { paint("Couldn't load this link. Please try again."); }
      } else if ((error as Error).name === "AbortError") paint();
      else paint("Couldn't update this link. Please try again.");
    }
  };
}
