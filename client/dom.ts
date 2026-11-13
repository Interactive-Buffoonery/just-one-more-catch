/* ---- Rendering helpers ---- */
export let root: HTMLElement;
export const setRoot = (el: HTMLElement) => {
  root = el;
};
export const $ = (s: string) => root.querySelector(s) as any;
// Cleared first so the same message is read again when repeated.
export const announce = (msg: string) => {
  const live = root?.querySelector("#live");
  if (!live) return;
  live.textContent = "";
  requestAnimationFrame(() => (live.textContent = msg));
};
export const esc = (v: unknown) =>
  String(v).replace(
    /[&<>"]/g,
    (c) =>
      (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }) as any)[c],
  );
