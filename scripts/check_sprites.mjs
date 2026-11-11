// Every Pokémon sprite must be centred on its canvas, and client/data/sprite-fit.ts
// must hold the ring zoom that keeps it inside the circle. Both come from
// scripts/fetch_sprites.py, so a pack added without running it fails here.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const ZOOM = 130;
const FIX = 'Run: uv run scripts/fetch_sprites.py';

/** Opacity of each pixel, for the palette and RGBA PNGs the sprite script writes. */
function alpha(file) {
  const png = readFileSync(file);
  const w = png.readUInt32BE(16), h = png.readUInt32BE(20), depth = png[24], type = png[25];
  assert(type === 3 || (type === 6 && depth === 8), `${file}: unexpected PNG format. ${FIX}`);
  const idat = [];
  let clear = Buffer.alloc(0);
  for (let at = 8; at < png.length; ) {
    const size = png.readUInt32BE(at), name = png.toString('latin1', at + 4, at + 8), body = png.subarray(at + 8, at + 8 + size);
    if (name === 'IDAT') idat.push(body);
    if (name === 'tRNS') clear = body;
    at += size + 12;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = type === 6 ? 4 : 1, line = type === 6 ? w * 4 : Math.ceil((w * depth) / 8);
  const px = Buffer.alloc(line * h);
  for (let y = 0; y < h; y++) {
    const filter = raw[y * (line + 1)];
    for (let i = 0; i < line; i++) {
      const a = i >= bpp ? px[y * line + i - bpp] : 0, b = y ? px[(y - 1) * line + i] : 0, c = y && i >= bpp ? px[(y - 1) * line + i - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const add = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][filter];
      px[y * line + i] = raw[y * (line + 1) + 1 + i] + add;
    }
  }
  const at = (x, y) => {
    if (type === 6) return px[y * line + x * 4 + 3];
    const index = (px[y * line + ((x * depth) >> 3)] >> (8 - depth - ((x * depth) & 7))) & ((1 << depth) - 1);
    return index < clear.length ? clear[index] : 255;
  };
  return { w, h, at };
}

/** The same sums as centre() in scripts/fetch_sprites.py. */
function measure(file) {
  const { w, h, at } = alpha(file);
  let x0 = w, y0 = h, x1 = 0, y1 = 0, far = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (at(x, y)) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x + 1); y0 = Math.min(y0, y); y1 = Math.max(y1, y + 1);
        far = Math.max(far, Math.max(Math.abs(2 * x - w), Math.abs(2 * x + 2 - w)) ** 2 + Math.max(Math.abs(2 * y - h), Math.abs(2 * y + 2 - h)) ** 2);
      }
  assert(far, `${file} is empty`);
  assert(Math.abs(x0 + x1 - w) <= 1 && Math.abs(y0 + y1 - h) <= 1, `${file} is off centre. ${FIX}`);
  return Math.min(ZOOM, Math.floor(Math.sqrt(Math.floor((100 * w) ** 2 / far))));
}

const fit = JSON.parse(readFileSync('client/data/sprite-fit.ts', 'utf8').match(/export default (\{.*\}) as /)[1]);
const packs = [...readFileSync('client/packs.ts', 'utf8').matchAll(/\bart: "(\w+)"/g)].map((m) => m[1]);
assert(packs.length, 'no sprite sets found in client/packs.ts');
assert(readFileSync('client/styles.css', 'utf8').includes(`var(--z,${ZOOM}%)`), 'ring zoom in styles.css no longer matches ZOOM');
let count = 0;
for (const pack of packs) {
  const dir = `public/sprites/${pack}`;
  assert(existsSync(dir), `${dir} is missing. ${FIX}`);
  assert(fit[pack], `${pack} is missing from client/data/sprite-fit.ts. ${FIX}`);
  const zoom = {};
  for (const sub of ['', 'shiny/'])
    for (const name of readdirSync(dir + '/' + sub).filter((f) => f.endsWith('.png'))) {
      const n = parseInt(name);
      zoom[n] = Math.min(zoom[n] ?? ZOOM, measure(`${dir}/${sub}${name}`));
      count++;
    }
  for (const [n, z] of Object.entries(zoom))
    assert.equal(fit[pack][n] ?? ZOOM, z, `${pack} #${n}: ring zoom is out of date. ${FIX}`);
  for (const n of Object.keys(fit[pack])) assert(zoom[n], `${pack} #${n} has a zoom but no sprite. ${FIX}`);
}
console.log(`check_sprites: ${count} sprites centred and sized`);
