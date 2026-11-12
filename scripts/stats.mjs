import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const prod = process.argv.includes("--prod");
const sample = process.argv.indexOf("--sample");
const data = JSON.parse(sample >= 0 ? readFileSync(process.argv[sample + 1], "utf8") :
  execFileSync("npx", ["convex", "run", "stats:overview", JSON.stringify({ now: Date.now() }), ...(prod ? ["--prod"] : [])], { encoding: "utf8" }));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const table = (rows) => "<table>" + rows.map((r) => "<tr>" + r.map((c) => "<td>" + esc(c) + "</td>").join("") + "</tr>").join("") + "</table>";
const chart = (key) => {
  const max = Math.max(1, ...data.weekly.map((w) => w[key]));
  return data.weekly.map((w) => '<div class="bar"><span>' + esc(w.start) + '</span><i style="width:' + (w[key] / max * 60) + '%"></i> ' + esc(w[key]) + "</div>").join("");
};
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Just One More Catch stats</title>
<style>:root{color-scheme:light dark}body{font:15px system-ui;max-width:1000px;margin:40px auto;padding:20px}h1,h2{font-family:monospace}.tiles{display:flex;gap:16px;flex-wrap:wrap}.tile{border:1px solid #888;padding:18px;border-radius:12px}strong{display:block;font-size:28px}table{border-collapse:collapse;width:100%;margin:16px 0}td{padding:8px;border-bottom:1px solid #888;text-align:left}.bar{display:flex;align-items:center;gap:10px;margin:8px 0}.bar span{width:100px}.bar i{display:inline-block;background:#399b91;height:18px}</style>
<h1>Just One More Catch</h1><p>${prod ? "Production" : sample >= 0 ? "Sample" : "Development"} · ${esc(new Date().toISOString())} · Weeks start Monday (UTC)</p>
<h2>Totals and active users</h2><div class="tiles">${Object.entries({ Users: data.totals.users, Playthroughs: data.totals.runs, "Pokémon caught": data.totals.caught, "Active users · 7 days": data.activeUsers.days7, "Active users · 30 days": data.activeUsers.days30 }).map(([k,v]) => '<div class="tile">' + esc(k) + '<strong>' + esc(v) + '</strong></div>').join("")}</div>
${[["newUsers","New users"],["runsStarted","Playthroughs started"],["activeRuns","Playthroughs played (by last save)"]].map(([key,label]) => "<h2>" + label + "</h2>" + chart(key)).join("")}
<h2>Playthroughs per game</h2>${table([["Game","Playthroughs"],...Object.entries(data.versions)])}
<h2>Badge distribution</h2>${table([["Badges","Playthroughs"],...Object.entries(data.badges)])}
<h2>Events · all time</h2>${table([["Event","Signed in","Guest"],...Object.entries(data.events).map(([name,c]) => [name,c.signedIn,c.guest])])}
<h2>Events · weekly</h2>${table([["Event","Week (UTC)","Signed in","Guest"],...Object.entries(data.events).flatMap(([name,c]) => c.weekly.filter((w) => w.signedIn + w.guest).map((w) => [name,w.start,w.signedIn,w.guest]))])}</html>`;
const path = resolve("stats.html");
writeFileSync(path, html);
console.log("Wrote " + path);
if (process.platform === "darwin") execFileSync("open", [path]);
