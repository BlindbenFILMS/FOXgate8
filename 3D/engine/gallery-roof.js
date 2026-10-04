// Blind Canvas gallery: stained glass in the main hall's roof, and "HOLT for HOPE" in braille.
// Each bay between the roof beams gets its own design (gallery-stained.js roofGlass: mosaic, ripples, harlequin, sunburst,
// waves, rose). In the second bay (just past the hanging MAIN GALLERY sign as you walk in from the entry hall), HOLT / for / HOPE is set in braille:
// three centred lines of glowing gold-white glass dots on a deep blue plate. On the floor beneath, the glass "casts" its braille
// shadow inside a pool of coloured light, with a hotspot: LEARN · BRAILLE AND BRILLIANCE (the braille alphabet and the story of
// Steve Holt's idea). The idea, in Holt's words: "What if there were braille on the ceiling glass, with a braille shadow on the floor?"
import { roofGlass } from './gallery-stained.js';

// letters as braille dots (1-2-3 down the left column, 4-5-6 down the right)
export const BRAILLE = { a: [1], b: [1, 2], c: [1, 4], d: [1, 4, 5], e: [1, 5], f: [1, 2, 4], g: [1, 2, 4, 5], h: [1, 2, 5], i: [2, 4], j: [2, 4, 5], k: [1, 3], l: [1, 2, 3], m: [1, 3, 4],
  n: [1, 3, 4, 5], o: [1, 3, 5], p: [1, 2, 3, 4], q: [1, 2, 3, 4, 5], r: [1, 2, 3, 5], s: [2, 3, 4], t: [2, 3, 4, 5], u: [1, 3, 6], v: [1, 2, 3, 6], w: [2, 4, 5, 6], x: [1, 3, 4, 6], y: [1, 3, 4, 5, 6], z: [1, 3, 5, 6] };

// the bays between the beams (x ranges), from the entry-hall end inward; the roof glass sits just above the beams
const BAYS = [[-81.22, -77.03], [-86.22, -82.03], [-91.22, -87.03], [-96.22, -92.03], [-101.22, -97.03], [-106.22, -102.03], [-111.22, -107.03], [-116.22, -112.03]];
const Y = 13.86, Z0 = -21.6, Z1 = 21.6;
const LINES = ['holt', 'for', 'hope'];

export function buildRoof({ G }) {
  const { THREE, scene } = G.world;
  const g = new THREE.Group(); scene.add(g);
  const styles = [0, 1, 2, 3, 4, 5, 2, 1];
  BAYS.forEach(([xa, xb], i) => {
    const cx = (xa + xb) / 2, w = xb - xa, d = Z1 - Z0;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), roofGlass({ style: styles[i], cx, cz: 0, hx: w / 2, hz: d / 2, seed: i * 1.7 + 0.3 }));
    m.rotation.x = Math.PI / 2; m.position.set(cx, Y, (Z0 + Z1) / 2); m.renderOrder = 4; g.add(m);
  });

  // ---- HOLT / for / HOPE in the first bay. Read from below while walking in (facing -x): the top line is the furthest (-x),
  // left is +z. Dot pitch S, cell pitch CP, line pitch LP.
  const [xa, xb] = BAYS[1], bx = (xa + xb) / 2,   // the second bay: the first is behind the hanging MAIN GALLERY sign as you walk in
    S = 0.36, CP = 0.9, LP = 1.4, R = 0.13;
  const dots = [];   // world x, z of every dot
  LINES.forEach((word, li) => {
    const n = word.length, wz = (n - 1) * CP + S, z0 = wz / 2, x0 = bx - LP + li * LP - S;   // line li: rows at x0, x0+S, x0+2S
    [...word].forEach((ch, ci) => (BRAILLE[ch] || []).forEach(dn => {
      const col = dn > 3 ? 1 : 0, row = (dn - 1) % 3;
      dots.push([x0 + row * S, z0 - ci * CP - col * S]);
    }));
  });
  const xs = dots.map(p => p[0]), zs = dots.map(p => p[1]);
  const pw = Math.max(...xs) - Math.min(...xs) + 1.0, pd = Math.max(...zs) - Math.min(...zs) + 1.0, pcx = (Math.max(...xs) + Math.min(...xs)) / 2, pcz = (Math.max(...zs) + Math.min(...zs)) / 2;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(pw, pd), new THREE.MeshBasicMaterial({ color: 0x0c1f6e, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide }));
  plate.rotation.x = Math.PI / 2; plate.position.set(pcx, Y - 0.01, pcz); plate.renderOrder = 5; g.add(plate);
  const rim = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(pw, 0.001, pd)), new THREE.LineBasicMaterial({ color: 0xe6c87a })); rim.position.copy(plate.position); g.add(rim);
  const dotGeo = new THREE.CircleGeometry(R, 24), haloGeo = new THREE.CircleGeometry(R * 1.9, 24);
  const dotM = new THREE.MeshBasicMaterial({ color: 0xfff1c4, side: THREE.DoubleSide });
  const haloT = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); const gr = c.createRadialGradient(32, 32, 6, 32, 32, 31); gr.addColorStop(0, 'rgba(255,225,150,.9)'); gr.addColorStop(1, 'rgba(255,225,150,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
  const haloM = new THREE.MeshBasicMaterial({ map: haloT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  for (const [x, z] of dots) {
    const d = new THREE.Mesh(dotGeo, dotM); d.rotation.x = Math.PI / 2; d.position.set(x, Y - 0.02, z); d.renderOrder = 6; g.add(d);
    const h = new THREE.Mesh(haloGeo, haloM); h.rotation.x = Math.PI / 2; h.position.set(x, Y - 0.03, z); h.renderOrder = 7; g.add(h);
  }

  // ---- the braille shadow on the floor, inside a pool of coloured light from the glass
  const fy = (() => { const y = G.world.groundAt(pcx, 0, pcz); return y > -50 ? y : -3.38; })();
  const FW = pw + 1.6, FD = pd + 1.6, cw = 1024, ch = Math.round(1024 * FD / FW);
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const c = cv.getContext('2d');
  const toU = x => (x - (pcx - FW / 2)) / FW * cw, toV = z => (z - (pcz - FD / 2)) / FD * ch;
  { const gr = c.createRadialGradient(cw / 2, ch / 2, 10, cw / 2, ch / 2, Math.max(cw, ch) * 0.55); gr.addColorStop(0, 'rgba(150,190,255,.42)'); gr.addColorStop(0.6, 'rgba(120,160,240,.25)'); gr.addColorStop(1, 'rgba(120,160,240,0)'); c.fillStyle = gr; c.fillRect(0, 0, cw, ch); }
  for (let i = 0; i < 40; i++) { const x = Math.random() * cw, y = Math.random() * ch, r = 30 + Math.random() * 60; const gr = c.createRadialGradient(x, y, 2, x, y, r); const col = Math.random() < 0.2 ? '255,220,150' : Math.random() < 0.5 ? '90,140,255' : '200,225,255'; gr.addColorStop(0, `rgba(${col},.18)`); gr.addColorStop(1, `rgba(${col},0)`); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }   // dapples of colour from the other panes
  const rpx = R / FW * cw * 1.15;
  for (const [x, z] of dots) { const u = toU(x), v = toV(z), gr = c.createRadialGradient(u, v, rpx * 0.55, u, v, rpx * 1.25); gr.addColorStop(0, 'rgba(10,20,60,.62)'); gr.addColorStop(1, 'rgba(10,20,60,0)'); c.fillStyle = gr; c.beginPath(); c.arc(u, v, rpx * 1.25, 0, Math.PI * 2); c.fill(); }
  const ft = new THREE.CanvasTexture(cv); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 8;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(FW, FD), new THREE.MeshBasicMaterial({ map: ft, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(pcx, fy + 0.012, pcz); floor.renderOrder = 3; g.add(floor);
  // a faint shaft of light from the glass down to the floor
  const shaftM = new THREE.MeshBasicMaterial({ color: 0x9fbfff, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(pw * 0.9, Y - fy - 0.2, pd * 0.9), shaftM); shaft.position.set(pcx, (Y + fy) / 2, pcz); g.add(shaft);

  // ---- the hotspot
  G.world.addNear(pl => Math.hypot(pl.x - pcx, pl.z - pcz) < Math.max(pw, pd) / 2 + 0.8 && Math.abs(pl.y - fy) < 2 ? { kind: 'braille', item: null, label: 'Learn: braille and brilliance' } : null);
  return { group: g, center: [pcx, fy, pcz] };
}

// the braille alphabet card for the panel: a to z, the dots over each letter, and HOLT for HOPE at the foot
export function brailleCard() {
  const cols = 7, cellW = 120, cellH = 150, pad = 30, rows = Math.ceil(26 / cols), W = cols * cellW + pad * 2, H = rows * cellH + pad * 2 + 170;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  c.fillStyle = '#0c1f6e'; c.fillRect(0, 0, W, H); c.fillStyle = '#ec3013'; c.fillRect(0, 0, W, 8);
  const cell = (dots, x, y, r, on = '#fff1c4', off = 'rgba(255,255,255,.14)') => { for (let n = 1; n <= 6; n++) { const col = n > 3 ? 1 : 0, row = (n - 1) % 3; c.beginPath(); c.arc(x + col * r * 3, y + row * r * 3, r, 0, Math.PI * 2); c.fillStyle = dots.includes(n) ? on : off; c.fill(); } };
  Object.keys(BRAILLE).forEach((ch, i) => {
    const cx = pad + (i % cols) * cellW + cellW / 2, cy = pad + Math.floor(i / cols) * cellH;
    cell(BRAILLE[ch], cx - 15, cy + 20, 10);
    c.fillStyle = '#fff'; c.font = '800 34px Archivo, Arimo, Arial, sans-serif'; c.textAlign = 'center'; c.fillText(ch.toUpperCase(), cx, cy + 125);
  });
  const y0 = pad + rows * cellH + 20; c.fillStyle = '#ff9783'; c.font = '800 22px Archivo, Arimo, Arial, sans-serif'; c.textAlign = 'left'; c.fillText('IN THE ROOF GLASS', pad, y0);
  let x = pad; ['holt', 'for', 'hope'].forEach(w => { [...w].forEach(ch => { cell(BRAILLE[ch], x, y0 + 30, 8, '#ffd27a'); x += 42; }); c.fillStyle = '#fff'; c.font = '700 26px Archivo, Arimo, Arial, sans-serif'; c.fillText(w === 'for' ? 'for' : w.toUpperCase(), x - w.length * 42, y0 + 120); x += 46; });
  return cv;
}
