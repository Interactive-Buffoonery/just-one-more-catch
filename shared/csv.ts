// RFC 4180 CSV with a BOM so Excel and Numbers read UTF-8 names correctly.
export const cell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const csv = (rows: unknown[][]) =>
  "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
