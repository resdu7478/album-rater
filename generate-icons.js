/* Generates the app icons (no external dependencies).
   A dark rounded tile with a Spotify-green 5-pointed star — matching the app's
   dark theme and its ★ rating motif. Run: node generate-icons.js */
const fs = require('fs');
const zlib = require('zlib');

// ---- tiny PNG encoder (RGBA, 8-bit) ----
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---- geometry helpers ----
function starPoints(cx, cy, outer, inner) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 === 0 ? outer : inner;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}
function inPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function lerp(a, b, t) { return a + (b - a) * t; }

function render(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const radius = size * 0.22;            // corner radius (iOS re-masks anyway)
  const star = starPoints(size / 2, size / 2, size * 0.33, size * 0.33 * 0.44);
  const SS = 4;                          // supersampling for smooth edges
  const bgTop = [30, 30, 30], bgBot = [18, 18, 18]; // #1e1e1e -> #121212
  const green = [29, 185, 84];           // #1db954
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let cov = 0, inTile = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const px = x + (sx + 0.5) / SS, py = y + (sy + 0.5) / SS;
        // rounded-rect membership
        let insideTile = true;
        const rx = Math.min(px, size - px), ry = Math.min(py, size - py);
        if (rx < radius && ry < radius) {
          const dx = radius - rx, dy = radius - ry;
          if (dx * dx + dy * dy > radius * radius) insideTile = false;
        }
        if (insideTile) { inTile++; if (inPoly(px, py, star)) cov++; }
      }
      const n = SS * SS;
      const tileA = inTile / n;           // tile alpha (rounded corners)
      const starA = cov / n;              // star coverage
      const t = y / (size - 1);
      const bg = [lerp(bgTop[0], bgBot[0], t), lerp(bgTop[1], bgBot[1], t), lerp(bgTop[2], bgBot[2], t)];
      // composite star over tile background
      const r = lerp(bg[0], green[0], starA);
      const g = lerp(bg[1], green[1], starA);
      const b = lerp(bg[2], green[2], starA);
      const o = (y * size + x) * 4;
      rgba[o] = r | 0; rgba[o + 1] = g | 0; rgba[o + 2] = b | 0; rgba[o + 3] = Math.round(tileA * 255);
    }
  }
  return encodePNG(size, size, rgba);
}

fs.writeFileSync('icon-512.png', render(512));
fs.writeFileSync('icon-192.png', render(192));
fs.writeFileSync('apple-touch-icon.png', render(180));
console.log('icons written: icon-512.png, icon-192.png, apple-touch-icon.png');
