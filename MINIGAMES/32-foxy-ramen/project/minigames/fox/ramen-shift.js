// 8 GATES — FOX WORLDS · FOXY RAMEN [foxyRamen]. A late-night ramen bar that drops into ANY building of any FOX world.
// Two ways to be here:
//   WALK  — Ben walks in off the street and around the shop on the standard Game HUD (stick, TALK, 1 WAVE · 2 SIT · 3 JUMP).
//           TAP THE FLOOR to walk there, tap a stool to sit, tap a fox to go and talk. Drag the empty floor to turn the camera.
//           Talk to KITSU at the counter: "Can I work a shift?" opens the welcome card. "Could I get a bowl?" = sit + slurp.
//   SHIFT — the restaurant game (Meru Burgers / Foxy Blends engine + engine/restaurant-kit.js), steps from the 2D Foxy Ramen game:
//           DOUGH: tap the flour bin, SWIPE across the dough to cut (slow = neat strands) → nest.
//           BOIL: drag (or tap) the nest into a basket. A gauge climbs FIRM › NORMAL › SOFT. TAP the basket to lift it in the band.
//           SHAKE: swipe UP on the lifted basket 3 times to drain it.
//           BOWL: tap the bowl stack, HOLD the right broth pot (SHOYU / MISO / SPICY), let go between the lines.
//           Drag the basket onto the bowl. DRAG each topping where you want it on the bowl (spread them = bonus), tap = auto spot.
//           TAP the bowl → SEND IT, or SLIDE IT YOURSELF: drag along the bar to aim (a ring shows where it stops), let go (land it = +1g tip).
//           PAY: give exact change at the register.
// MERGE: buildRamen(ctx) builds the interior at ctx.origin; createRamenShop({ container }) runs it stand-alone.
// Save keys fox.ramen.*, flag ramenUniform. Upgrades: sharp knife, third basket, big ladle, timer bell, lantern radio.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, registerKit, dinerUniform } from '../../engine/restaurant-kit.js';
import { createRamenAudio } from './ramen-audio.js';

export const RAMEN = { name: 'FOXY RAMEN · THE SHIFT', room: 'foxyRamen', shift: 180, owner: 'KITSU' };
export const BROTHS = {
  shoyu: { name: 'SHOYU', col: '#7a4420', soup: '#a8682e', day: 1, price: 6 },
  miso: { name: 'MISO', col: '#c98a3c', soup: '#d9a456', day: 2, price: 7 },
  spicy: { name: 'SPICY', col: '#b8321f', soup: '#d4502a', day: 3, price: 8 } };
export const DONE = {
  firm: { name: 'FIRM', z: [0.36, 0.54], col: '#e6b45a', day: 1 },
  normal: { name: 'NORMAL', z: [0.54, 0.72], col: '#22c55e', day: 1 },
  soft: { name: 'SOFT', z: [0.72, 0.88], col: '#38bdf8', day: 2 } };
const doneOf = v => v < 0.36 ? 'raw' : v < 0.54 ? 'firm' : v < 0.72 ? 'normal' : v < 0.88 ? 'soft' : 'mushy';
const DONE_NAME = k => DONE[k] ? DONE[k].name : k === 'raw' ? 'RAW' : 'MUSHY';
const DONE_ORDER = ['raw', 'firm', 'normal', 'soft', 'mushy'];
export const TOPS = { chashu: { name: 'CHASHU', day: 1 }, egg: { name: 'EGG', day: 1 }, nori: { name: 'NORI', day: 2 }, negi: { name: 'NEGI', day: 3 }, corn: { name: 'CORN', day: 4 }, menma: { name: 'MENMA', day: 5 } };
const TK = Object.keys(TOPS), BK = Object.keys(BROTHS);
export const UPGRADES = [
  { id: 'knife', name: 'SHARP KNIFE', cost: 40, line: 'Dough cuts in 3 swipes, not 4.' },
  { id: 'basket', name: 'THIRD BASKET', cost: 50, line: 'Boil three nests at once.' },
  { id: 'ladle', name: 'BIG LADLE', cost: 35, line: 'Broth pours 40% faster.' },
  { id: 'bell', name: 'TIMER BELL', cost: 30, line: 'A bell rings when noodles hit the ticket.' },
  { id: 'radio', name: 'LANTERN RADIO', cost: 60, line: 'Happy customers wait 20% longer.' }];
const CUSTOMERS = [
  { name: 'YUZU', fur: '#ee7d24', furDark: '#b8531a', torso: ['#1f3350', '#e6ecf4', '#16263c'] },
  { name: 'MOCHI', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#4a3a5c', '#ede9fe', '#332745'] },
  { name: 'KUMA', fur: '#c9682a', furDark: '#8a4213', torso: ['#3f5d47', '#e6b45a', '#2b4232'], outfit: 'coat' },
  { name: 'HANA', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#8f2b1e', '#fce7f3', '#661a10'] },
  { name: 'SORA', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'] },
  { name: 'GINGER', fur: '#d9733a', furDark: '#9a4a1e', torso: ['#e6b45a', '#fbf8ec', '#8a6a3a'] },
  { name: 'TOFU', fur: '#f2ede1', furDark: '#c9c2b0', torso: ['#7a5a3a', '#efe2c4', '#4a3420'], outfit: 'coat' },
  { name: 'PIP', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#2f9a8f', '#f2d970', '#1f6a62'] }];
const LINES = { order: ['One bowl, please!', 'I have been dreaming of this all day.', 'Make it hot!', 'Long night. I need noodles.', 'The usual, chef!'], angry: ['Too slow!', 'I will get dumplings instead.'] };
const SAVE = { day: 'fox.ramen.day', best: 'fox.ramen.best', upg: 'fox.ramen.upg.', stars: 'fox.ramen.stars' };
const BROTH_OK = [0.62, 0.84];

// ---------------- little ramen art ----------------
function noodleNest(T3, toon, col = '#f2dc9a', s = 1) {
  const g = new T3.Group(), m = toon(col);
  for (let i = 0; i < 7; i++) { const t = new T3.Mesh(new T3.TorusGeometry(0.055 * s + (i % 3) * 0.012 * s, 0.009 * s, 5, 16, Math.PI * rr(1.2, 1.9)), m); t.rotation.set(Math.PI / 2 + rr(-0.3, 0.3), rr(-0.3, 0.3), i * 1.3); t.position.set(rr(-0.02, 0.02) * s, 0.012 * s + (i % 2) * 0.008 * s, rr(-0.02, 0.02) * s); g.add(t); }
  return g; }
export function topMesh(T3, toon, k, outline) {
  const g = new T3.Group(), add = (geo, col, x = 0, y = 0, z = 0, o = 0.004) => { const m = new T3.Mesh(geo, toon(col)); m.position.set(x, y, z); if (outline && o) outline(m, o); g.add(m); return m; };
  if (k === 'chashu') { for (let i = 0; i < 2; i++) { const d = add(new T3.CylinderGeometry(0.05, 0.05, 0.012, 16), '#e8b0a0', i * 0.035 - 0.018, 0.008 + i * 0.006, i * 0.01); d.rotation.x = 0.25; d.rotation.z = 0.15 - i * 0.3; add(new T3.TorusGeometry(0.048, 0.007, 4, 18), '#9a5a3c', i * 0.035 - 0.018, 0.008 + i * 0.006, i * 0.01, 0).rotation.x = Math.PI / 2 + 0.25; } }
  else if (k === 'egg') { for (let i = 0; i < 2; i++) { const e = add(new T3.SphereGeometry(0.034, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#f6efe2', i * 0.045 - 0.022, 0.0, 0); e.scale.set(1, 0.8, 1.25); add(new T3.CircleGeometry(0.017, 12), '#f0a83a', i * 0.045 - 0.022, 0.0275, 0, 0).rotation.x = -Math.PI / 2; } }
  else if (k === 'nori') { const n = add(new T3.BoxGeometry(0.09, 0.11, 0.006), '#1d2a22', 0, 0.045, 0); n.rotation.x = -0.35; add(new T3.BoxGeometry(0.05, 0.005, 0.007), '#3d5c47', 0, 0.06, 0.004, 0).rotation.x = -0.35; }
  else if (k === 'negi') { for (let i = 0; i < 7; i++) { const r = add(new T3.TorusGeometry(0.011, 0.004, 4, 10), i % 2 ? '#7fa85a' : '#c9e0a8', Math.cos(i * 2.4) * 0.03, 0.006, Math.sin(i * 2.4) * 0.03, 0); r.rotation.x = Math.PI / 2; } }
  else if (k === 'corn') { for (let i = 0; i < 9; i++) add(new T3.SphereGeometry(0.011, 6, 4), '#f2c53d', Math.cos(i * 2.4) * (0.008 + (i % 3) * 0.012), 0.008 + (i % 2) * 0.006, Math.sin(i * 2.4) * (0.008 + (i % 3) * 0.012), 0); }
  else { for (let i = 0; i < 4; i++) { const b = add(new T3.BoxGeometry(0.07, 0.012, 0.016), i % 2 ? '#d9b06a' : '#c49a52', 0, 0.008 + i * 0.004, -0.024 + i * 0.016, 0.003); b.rotation.y = i * 0.4 - 0.6; } }
  return g; }
// glossy broth surface: a soft highlight + little fat droplets on top of the broth colour (one texture per broth, cached)
function soupMat(T3, toon, k) { const C = toon.__soup || (toon.__soup = {}); if (C[k]) return C[k];
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'), col = BROTHS[k].soup;
  g.fillStyle = col; g.fillRect(0, 0, 128, 128); const gr = g.createRadialGradient(46, 42, 4, 64, 64, 66); gr.addColorStop(0, 'rgba(255,240,210,0.55)'); gr.addColorStop(0.35, 'rgba(255,230,190,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0.18)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 26; i++) { const a = i * 2.39, r = 8 + (i * 37 % 46), x = 64 + Math.cos(a) * r, y = 64 + Math.sin(a) * r, rad = 1.5 + (i % 4); g.fillStyle = 'rgba(255,214,120,0.55)'; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(x - rad * 0.3, y - rad * 0.3, rad * 0.35, 0, 7); g.fill(); }
  if (k === 'spicy') { g.fillStyle = 'rgba(160,20,10,0.6)'; for (let i = 0; i < 40; i++) g.fillRect((i * 53) % 128, (i * 29) % 128, 2, 2); }
  const t = new T3.CanvasTexture(cv); t.colorSpace = T3.SRGBColorSpace; return (C[k] = new T3.MeshToonMaterial({ map: t, gradientMap: toon('#ffffff').gradientMap })); }
// a bowl: red lacquer outside, cream inside, a broth disc and a noodle slot. bowlMesh().set({ broth, lvl, noodle }).
export function bowlMesh(T3, toon, outline) {
  const g = new T3.Group(), R = 0.2, r0 = 0.12, H = 0.14;
  const out = new T3.Mesh(new T3.CylinderGeometry(R, r0, H, 26, 1, true), toon('#b8312a')); out.position.y = H / 2; g.add(out); if (outline) outline(out, 0.008, R);
  const inn = new T3.Mesh(new T3.CylinderGeometry(R * 0.96, r0 * 0.95, H * 0.98, 26, 1, true), toon('#f4ead6', { side: T3.BackSide })); inn.position.y = H / 2 + 0.002; g.add(inn);
  const foot = new T3.Mesh(new T3.CylinderGeometry(r0 * 0.85, r0 * 0.85, 0.018, 20), toon('#201e1d')); foot.position.y = 0.009; g.add(foot);
  const rim = new T3.Mesh(new T3.TorusGeometry(R, 0.007, 5, 30), toon('#201e1d')); rim.rotation.x = Math.PI / 2; rim.position.y = H; g.add(rim);
  const band = new T3.Mesh(new T3.CylinderGeometry(R * 0.93, R * 0.9, 0.02, 26, 1, true), toon('#f4ead6')); band.position.y = H - 0.025; g.add(band);
  const soup = new T3.Mesh(new T3.CircleGeometry(1, 26), toon('#a8682e')); soup.rotation.x = -Math.PI / 2; soup.visible = false; g.add(soup);
  const lines = []; for (const v of BROTH_OK) { const l = new T3.Mesh(new T3.TorusGeometry(1, 0.05, 4, 30), new T3.MeshBasicMaterial({ color: 0xec3013 })); l.rotation.x = Math.PI / 2; const y = 0.012 + v * (H - 0.02), rr0 = r0 * 0.95 + (R * 0.96 - r0 * 0.95) * (y / H); l.position.y = y; l.scale.set(rr0, rr0, 0.06); l.visible = false; g.add(l); lines.push(l); }
  const nest = new T3.Group(); g.add(nest); const tops = new T3.Group(); g.add(tops);
  const surfY = lvl => 0.012 + lvl * (H - 0.02), surfR = lvl => r0 * 0.95 + (R * 0.96 - r0 * 0.95) * (surfY(lvl) / H);
  g.userData = { R, H, soup, lines, nest, tops, surfY, surfR,
    set(b, showLines) { const lv = b.lvl || 0; soup.visible = lv > 0.01; if (soup.visible) { soup.material = soupMat(T3, toon, b.broth); const y = surfY(Math.min(1, lv)); soup.position.y = y; soup.scale.setScalar(surfR(Math.min(1, lv))); }
      lines.forEach(l => l.visible = !!showLines);
      while (nest.children.length) nest.remove(nest.children[0]);
      if (b.noodle) { const col = { raw: '#f6ecc8', firm: '#f2dc9a', normal: '#ecd088', soft: '#e6c477', mushy: '#dcc79a' }[b.noodle.done] || '#f2dc9a', n = noodleNest(T3, toon, col, b.noodle.done === 'mushy' ? 1.6 : 1.45); n.position.y = Math.max(surfY(Math.min(1, lv)) - 0.012, 0.03); nest.add(n); }
      while (tops.children.length) tops.remove(tops.children[0]);
      (b.tops || []).forEach(t => { const m = topMesh(T3, toon, t.k, outline); m.position.set(t.x, Math.max(surfY(Math.min(1, lv)), 0.05) + (b.noodle ? 0.022 : 0.004), t.z); m.rotation.y = Math.atan2(t.x, t.z); tops.add(m); }); } };
  return g; }

// ---------------- the shop interior ----------------
export function buildRamen(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const W = 12, D = 10, H = 4.2, wood = toon('#8a5a32'), woodD = toon('#5a3a22'), woodL = toon('#c99a62'), ink = toon('#201e1d'), red = toon('#b8312a'), cream = toon('#f4ead6'), steel = toon('#c9ced3'), steelD = toon('#7d868e'), indigo = toon('#23305a');
  const KZ = -2.3, T = 1.0, PZ = KZ + 1.32, PY = 1.14, SZ = KZ + 2.15;
  const K = { root, z: KZ, top: T, W, D, H, cut: [], front: [], dining: [], solids: [], seats: [], tables: [] };
  const solid = (x0, z0, x1, z1) => K.solids.push([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)]);
  // floor: dark planks inside, stone outside
  const floorT = CTX(256, 256, c => { for (let i = 0; i < 8; i++) { c.fillStyle = ['#6b4528', '#74502f', '#5f3d22', '#7a5533'][i % 4]; c.fillRect(0, i * 32, 256, 32); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, i * 32, 256, 2); c.fillRect((i * 97) % 256, i * 32, 2, 32); } }); floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 3, D / 3);
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), new T3.MeshToonMaterial({ map: floorT, gradientMap: ctx.grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  const kitT = CTX(128, 128, c => { c.fillStyle = '#d8d2c4'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#b8b0a0'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if ((x + y) % 2) c.fillRect(x * 32, y * 32, 32, 32); }); kitT.wrapS = kitT.wrapT = T3.RepeatWrapping; kitT.repeat.set(4, 2);
  { const kf = new T3.Mesh(new T3.PlaneGeometry(6.7, 2.6), new T3.MeshToonMaterial({ map: kitT, gradientMap: ctx.grad })); kf.rotation.x = -Math.PI / 2; kf.position.set(0, 0.004, -D / 2 + 1.3); root.add(kf); }
  const stoneT = CTX(128, 128, c => { c.fillStyle = '#3a3c48'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#2a2b34'; c.lineWidth = 3; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) c.strokeRect(x * 32 + (y % 2) * 16, y * 32, 32, 32); }); stoneT.wrapS = stoneT.wrapT = T3.RepeatWrapping; stoneT.repeat.set(8, 3);
  { const st = new T3.Mesh(new T3.PlaneGeometry(W + 8, 6), new T3.MeshToonMaterial({ map: stoneT, gradientMap: ctx.grad })); st.rotation.x = -Math.PI / 2; st.position.set(0, -0.002, D / 2 + 3); root.add(st); }
  // walls: plaster over dark wood wainscot, red stripe
  const wallT = CTX(256, 256, c => { c.fillStyle = '#efe2c4'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#e6d6b2'; for (let i = 0; i < 40; i++) c.fillRect((i * 53) % 256, (i * 37) % 150, 18, 2); c.fillStyle = '#5a3a22'; c.fillRect(0, 160, 256, 96); c.fillStyle = '#4a2e1a'; for (let x = 0; x < 256; x += 32) c.fillRect(x, 160, 3, 96); c.fillStyle = '#b8312a'; c.fillRect(0, 150, 256, 10); });
  wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(3, 1); const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: ctx.grad });
  { const b = new T3.Mesh(new T3.PlaneGeometry(W, H), wallM); b.position.set(0, H / 2, -D / 2); root.add(b); K.cut.push(b); }
  for (const s of [-1, 1]) { const m = new T3.Mesh(new T3.PlaneGeometry(D, H), wallM); m.position.set(s * W / 2, H / 2, 0); m.rotation.y = -s * Math.PI / 2; root.add(m); }
  solid(-W / 2 - 1, -D / 2 - 1, W / 2 + 1, -D / 2 + 0.25); solid(-W / 2 - 1, -D / 2, -W / 2 + 0.25, D / 2); solid(W / 2 - 0.25, -D / 2, W / 2 + 1, D / 2);
  K.ceil = [M(new T3.BoxGeometry(W, 0.2, D), toon('#3a2a1e'), 0, H + 0.1, 0, root, 0)];
  for (let i = -2; i <= 2; i++) K.ceil.push(M(new T3.BoxGeometry(0.22, 0.22, D), woodD, i * 2.6, H - 0.11, 0, root, 0)); K.cut.push(...K.ceil);
  const lanT = CTX(64, 128, c => { c.fillStyle = '#e2453f'; c.fillRect(0, 0, 64, 128); c.fillStyle = '#ffb08a'; c.fillRect(0, 50, 64, 28); c.fillStyle = '#201e1d'; c.fillRect(0, 0, 64, 10); c.fillRect(0, 118, 64, 10); c.fillStyle = '#fff3d0'; c.font = '900 26px Archivo, Arial'; c.textAlign = 'center'; c.fillText('麺', 32, 74); });
  // FRONT WALL with the door gap (x 3.2..4.8), the window, noren curtain, outside sign + lanterns
  { const fc = root.children.length, FZ = D / 2, th = 0.24, wallO = toon('#2a2232'), segs = [[-W / 2, 3.2], [4.8, W / 2]];
    for (const [a, b] of segs) { const w = b - a, cx = (a + b) / 2; if (a < 0) { M(new T3.BoxGeometry(w, 0.9, th), woodD, cx, 0.45, FZ, root, 0.02); M(new T3.BoxGeometry(w, 1.0, th), wallO, cx, H - 0.5, FZ, root, 0.02); M(new T3.BoxGeometry(0.9, 2.3, th), wallO, a + 0.45, 2.05, FZ, root, 0.02); M(new T3.BoxGeometry(0.7, 2.3, th), wallO, b - 0.35, 2.05, FZ, root, 0.02); }
      else M(new T3.BoxGeometry(w, H, th), wallO, cx, H / 2, FZ, root, 0.02); solid(a, FZ - th, b, FZ + th); }
    M(new T3.BoxGeometry(1.6, H - 2.7, th), wallO, 4.0, 2.7 + (H - 2.7) / 2, FZ, root, 0.02);
    // night window (two panes) between x -5.55..2.85
    const nightT = CTX(512, 256, c => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#0d1230'); gr.addColorStop(1, '#2a2050'); c.fillStyle = gr; c.fillRect(0, 0, 512, 256); for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,240,200,' + rr(0.3, 0.9) + ')'; c.fillRect(rr(0, 512), rr(0, 110), 2, 2); } c.fillStyle = '#151a3a'; for (let i = 0; i < 9; i++) { const h = rr(60, 140); c.fillRect(i * 60, 256 - h, 52, h); c.fillStyle = '#ffd88a'; for (let k = 0; k < 6; k++) if (Math.random() < 0.5) c.fillRect(i * 60 + 8 + (k % 3) * 14, 256 - h + 14 + Math.floor(k / 3) * 22, 8, 10); c.fillStyle = '#151a3a'; } c.fillStyle = '#ff6a5a'; c.beginPath(); c.arc(420, 60, 16, 0, 7); c.fill(); });
    const win = new T3.Mesh(new T3.PlaneGeometry(7.5, 2.3), new T3.MeshBasicMaterial({ map: nightT })); win.position.set(-1.35, 2.05, FZ - th / 2 - 0.01); win.rotation.y = Math.PI; root.add(win);
    const winO = win.clone(); winO.rotation.y = 0; winO.position.z = FZ + th / 2 + 0.01; winO.material = new T3.MeshBasicMaterial({ color: 0xffc47a, transparent: true, opacity: 0.55 }); root.add(winO);
    for (const x of [-5.1, -1.35, 2.4]) M(new T3.BoxGeometry(0.1, 2.3, th + 0.06), woodD, x, 2.05, FZ, root, 0.01);
    // noren: 3 indigo panels with a white fox + bowl
    const norenT = CTX(256, 128, c => { c.fillStyle = '#23305a'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#f4ead6'; c.beginPath(); c.arc(128, 70, 30, 0, Math.PI); c.fill(); c.fillRect(96, 66, 64, 6); c.beginPath(); c.moveTo(112, 40); c.lineTo(104, 14); c.lineTo(122, 30); c.lineTo(134, 30); c.lineTo(152, 14); c.lineTo(144, 40); c.closePath(); c.fill(); c.font = '900 20px Archivo, Arial'; c.textAlign = 'center'; c.fillText('FOXY RAMEN', 128, 120); });
    K.noren = []; for (let i = 0; i < 3; i++) { const p = new T3.Mesh(new T3.PlaneGeometry(0.5, 0.75), new T3.MeshToonMaterial({ map: norenT, gradientMap: ctx.grad, side: T3.DoubleSide })); p.geometry.translate(0, -0.375, 0); p.position.set(3.47 + i * 0.53, 2.7, FZ); root.add(p); K.noren.push(p); p.material.map = norenT.clone(); p.material.map.needsUpdate = true; p.material.map.repeat.set(1 / 3, 1); p.material.map.offset.set(i / 3, 0); }
    // outside sign + lanterns
    const signT = CTX(512, 128, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 512, 128); c.strokeStyle = '#ffd23a'; c.lineWidth = 6; c.strokeRect(8, 8, 496, 112); c.font = '900 70px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff6a3a'; c.shadowBlur = 20; c.fillStyle = '#fff3d0'; c.fillText('FOXY RAMEN', 256, 68); });
    const sign = new T3.Mesh(new T3.PlaneGeometry(3.2, 0.8), new T3.MeshBasicMaterial({ map: signT })); sign.position.set(4.0, 3.45, FZ + th / 2 + 0.03); root.add(sign);
    K.lanterns = []; for (const [x, y, z] of [[2.9, 2.6, FZ + 0.45], [5.1, 2.6, FZ + 0.45], [-3.2, 3.2, FZ + 0.4], [0.3, 3.2, FZ + 0.4]]) { const l = new T3.Mesh(new T3.CylinderGeometry(0.22, 0.22, 0.5, 14), new T3.MeshBasicMaterial({ map: lanT })); l.scale.set(1, 1, 1); l.position.set(x, y, z); root.add(l); K.lanterns.push(l); M(new T3.CylinderGeometry(0.01, 0.01, 0.3, 4), ink, x, y + 0.4, z, root, 0); }
    // street lamp post + bench outside
    M(new T3.CylinderGeometry(0.06, 0.08, 3.4, 8), ink, -4.8, 1.7, FZ + 2.6, root, 0.01); K.lanterns.push(M(new T3.SphereGeometry(0.22, 12, 10), new T3.MeshBasicMaterial({ color: 0xffe0a0 }), -4.8, 3.5, FZ + 2.6, root, 0));
    M(new T3.BoxGeometry(1.6, 0.08, 0.42), woodL, -1.6, 0.45, FZ + 1.1, root, 0.01); for (const x of [-2.25, -0.95]) M(new T3.BoxGeometry(0.08, 0.45, 0.38), ink, x, 0.22, FZ + 1.1, root, 0); solid(-2.45, FZ + 0.85, -0.75, FZ + 1.35);
    solid(-W / 2 - 4, FZ + 5.2, W / 2 + 4, FZ + 6); solid(-W / 2 - 4, FZ, -W / 2 - 3.5, FZ + 6); solid(W / 2 + 3.5, FZ, W / 2 + 4, FZ + 6);
    K.front.push(...root.children.slice(fc)); }
  // ---------- the kitchen: work counter with every station ----------
  K.cut.push(M(new T3.BoxGeometry(6.6, 0.95, 0.7), steelD, 0, 0.475, -D / 2 + 0.5, root, 0.02)); // back line
  for (const x of [-2.4, -0.8, 0.8, 2.4]) { const s = M(new T3.CylinderGeometry(0.25, 0.25, 0.3, 14), steel, x, 1.1, -D / 2 + 0.5, root, 0.01, 0.25); K.cut.push(s); }
  K.cut.push(M(new T3.BoxGeometry(6.4, 0.05, 0.35), woodD, 0, 2.2, -D / 2 + 0.2, root, 0.006)); for (let i = 0; i < 12; i++) K.cut.push(M(new T3.CylinderGeometry(0.1, 0.07, 0.12, 12), i % 3 ? cream : red, -2.9 + i * 0.52, 2.3, -D / 2 + 0.2, root, 0.004, 0.1));
  // menu board on the back wall
  const menuT = CTX(1024, 512, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 1024, 512); c.fillStyle = '#ffd23a'; c.font = '900 80px Archivo, Arial'; c.fillText('FOXY RAMEN', 40, 96); c.font = '700 34px Archivo, Arial'; c.fillStyle = '#f7f6f2'; BK.forEach((k, i) => { c.fillText(BROTHS[k].name + ' RAMEN', 40, 180 + i * 60); c.fillText(BROTHS[k].price + 'g', 520, 180 + i * 60); }); c.fillStyle = '#e6b45a'; c.fillText('TOPPINGS +1g EACH', 40, 380); c.fillStyle = '#9fe0d6'; c.font = '700 28px Archivo, Arial'; c.fillText('CHASHU · EGG · NORI · NEGI · CORN · MENMA', 40, 440); c.fillStyle = '#ec3013'; c.fillRect(640, 140, 340, 260); c.fillStyle = '#fff'; c.font = '900 44px Archivo, Arial'; c.fillText('NOODLES', 670, 220); c.fillText('CUT BY', 670, 280); c.fillText('HAND', 670, 340); });
  { const mb = new T3.Mesh(new T3.PlaneGeometry(4.4, 2.2), new T3.MeshBasicMaterial({ map: menuT })); mb.position.set(0, 3.2, -D / 2 + 0.06); root.add(mb); K.cut.push(mb); }
  M(new T3.BoxGeometry(6.6, T - 0.04, 1.5), woodD, 0, (T - 0.04) / 2, KZ, root, 0.03); M(new T3.BoxGeometry(6.7, 0.06, 1.6), steel, 0, T - 0.02, KZ, root, 0.012);
  // kitchen side half-walls
  for (const s of [-1, 1]) { M(new T3.BoxGeometry(0.2, 1.25, KZ + 1.65 + D / 2), wood, s * 3.45, 0.625, (KZ + 1.65 - D / 2) / 2, root, 0.02); solid(s * 3.45 - 0.15, -D / 2, s * 3.45 + 0.15, KZ + 1.65); }
  // DOUGH: flour bin + cutting board
  K.flour = { x: -2.85, z: KZ + 0.38 }; M(new T3.BoxGeometry(0.46, 0.2, 0.42), woodL, K.flour.x, T + 0.1, K.flour.z, root, 0.01); M(new T3.BoxGeometry(0.4, 0.02, 0.36), toon('#f7f3ea'), K.flour.x, T + 0.2, K.flour.z, root, 0);
  for (let i = 0; i < 3; i++) M(new T3.SphereGeometry(0.07, 12, 8), toon('#f2e6c8'), K.flour.x - 0.1 + i * 0.1, T + 0.24, K.flour.z + (i % 2) * 0.06, root, 0.005, 0.07).scale.y = 0.6;
  K.board = { x: -2.15, z: KZ - 0.12 }; M(new T3.BoxGeometry(0.7, 0.04, 0.5), woodL, K.board.x, T + 0.02, K.board.z, root, 0.01);
  // BOIL: the noodle boiler with three basket slots
  K.boiler = { x: -0.95, z: KZ - 0.05 }; M(new T3.BoxGeometry(1.05, 0.28, 0.62), steel, K.boiler.x, T + 0.14, K.boiler.z, root, 0.015);
  { const w = new T3.Mesh(new T3.PlaneGeometry(0.95, 0.52), new T3.MeshBasicMaterial({ color: 0xbfe4f0 })); w.rotation.x = -Math.PI / 2; w.position.set(K.boiler.x, T + 0.25, K.boiler.z); root.add(w); K.water = w; }
  K.slots = [-1.27, -0.95, -0.63].map(x => ({ x, z: K.boiler.z }));
  // BROTH: three pots + the bowl mat + bowl stack
  K.pots = {}; BK.forEach((k, i) => { const x = 0.12 + i * 0.44, z = KZ + 0.45; M(new T3.CylinderGeometry(0.18, 0.17, 0.3, 18), steel, x, T + 0.15, z, root, 0.01, 0.18); const s = new T3.Mesh(new T3.CircleGeometry(0.165, 18), toon(BROTHS[k].soup)); s.rotation.x = -Math.PI / 2; s.position.set(x, T + 0.27, z); root.add(s);
    const tag = CTX(128, 48, c => { c.fillStyle = BROTHS[k].col; c.fillRect(0, 0, 128, 48); c.fillStyle = '#fff'; c.font = '900 28px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(BROTHS[k].name, 64, 26); });
    const tg = new T3.Mesh(new T3.PlaneGeometry(0.3, 0.11), new T3.MeshBasicMaterial({ map: tag })); tg.position.set(x, T + 0.15, z - 0.185); tg.rotation.y = Math.PI; root.add(tg); K.pots[k] = { x, z, surf: s }; });
  K.mat = { x: 0.56, z: KZ - 0.25 }; M(new T3.CylinderGeometry(0.27, 0.27, 0.012, 24), toon('#2a2826'), K.mat.x, T + 0.006, K.mat.z, root, 0);
  K.bowls = { x: -0.22, z: KZ + 0.42 }; for (let i = 0; i < 4; i++) { const b = bowlMesh(T3, toon, null); b.scale.setScalar(0.85); b.position.set(K.bowls.x, T + i * 0.045, K.bowls.z); root.add(b); }
  // TOPPINGS: six trays in two rows
  K.tops = {}; TK.forEach((k, i) => { const x = 1.16 + (i % 3) * 0.31, z = KZ - 0.36 + Math.floor(i / 3) * 0.33; M(new T3.BoxGeometry(0.28, 0.05, 0.28), steel, x, T + 0.025, z, root, 0.006); for (let j = 0; j < 3; j++) { const m = topMesh(T3, toon, k, null); m.position.set(x + (j - 1) * 0.08, T + 0.05, z + (j % 2) * 0.05 - 0.02); root.add(m); } K.tops[k] = { x, z }; });
  // the register (right end of the counter)
  K.register = { x: 2.95, z: KZ + 0.42 }; M(new T3.BoxGeometry(0.42, 0.3, 0.34), ink, K.register.x, T + 0.15, K.register.z - 0.6, root, 0.01); M(new T3.BoxGeometry(0.36, 0.12, 0.04), red, K.register.x, T + 0.34, K.register.z - 0.77, root, 0);
  // the BAR: raised pass counter the customers eat at, stools in front
  M(new T3.BoxGeometry(6.6, PY - 0.04, 0.42), wood, 0, (PY - 0.04) / 2, PZ, root, 0.025); M(new T3.BoxGeometry(6.8, 0.06, 0.6), woodL, 0, PY, PZ + 0.04, root, 0.015); solid(-3.45, PZ - 0.3, 3.45, PZ + 0.34);
  for (let i = 0; i < 14; i++) M(new T3.BoxGeometry(0.03, PY - 0.2, 0.02), toon('#4a2e1a'), -3.1 + i * 0.48, (PY - 0.2) / 2 + 0.04, PZ + 0.215, root, 0);
  K.seatX = [-2.25, -0.75, 0.75, 2.25];
  K.seatX.forEach(x => { M(new T3.CylinderGeometry(0.05, 0.07, 0.68, 8), ink, x, 0.34, SZ, root, 0); M(new T3.CylinderGeometry(0.23, 0.21, 0.08, 16), red, x, 0.7, SZ, root, 0.01, 0.23); solid(x - 0.2, SZ - 0.2, x + 0.2, SZ + 0.2); K.seats.push({ x, z: SZ, y: 0.74, face: Math.PI, bar: true, out: { x, z: SZ + 0.6 } }); });
  // DINING: two tables on the left with stools, a booth at the back-left, plant + shelf right
  const tableAt = (x, z) => { const bc = root.children.length; M(new T3.BoxGeometry(1.1, 0.06, 0.8), woodL, x, 0.78, z, root, 0.012); M(new T3.CylinderGeometry(0.06, 0.08, 0.75, 8), ink, x, 0.38, z, root, 0); solid(x - 0.55, z - 0.4, x + 0.55, z + 0.4);
    for (const s of [-1, 1]) { M(new T3.CylinderGeometry(0.2, 0.2, 0.08, 14), indigo, x, 0.5, z + s * 0.75, root, 0.01, 0.2); M(new T3.CylinderGeometry(0.04, 0.05, 0.46, 6), ink, x, 0.23, z + s * 0.75, root, 0); K.seats.push({ x, z: z + s * 0.75, y: 0.54, face: s > 0 ? Math.PI : 0, out: { x, z: z + s * 1.4 } }); solid(x - 0.16, z + s * 0.75 - 0.16, x + 0.16, z + s * 0.75 + 0.16); }
    const L = { x, z, bowls: [] }; K.tables.push(L); K.dining.push(...root.children.slice(bc)); };
  tableAt(-4.6, 0.6); tableAt(-4.6, 3.1); tableAt(-1.9, 3.3);
  { const bc = root.children.length, x = -4.75, z = -3.1; M(new T3.BoxGeometry(1.8, 0.45, 0.6), indigo, x, 0.22, z - 0.9, root, 0.02); M(new T3.BoxGeometry(1.8, 1.1, 0.16), indigo, x, 0.75, z - 1.2, root, 0.02); M(new T3.BoxGeometry(1.6, 0.06, 0.8), woodL, x, 0.78, z, root, 0.012); M(new T3.CylinderGeometry(0.06, 0.08, 0.75, 8), ink, x, 0.38, z, root, 0); solid(x - 0.9, -D / 2, x + 0.9, z + 0.4); K.seats.push({ x: x - 0.35, z: z - 0.82, y: 0.46, face: 0, npc: true }, { x: x + 0.35, z: z - 0.82, y: 0.46, face: 0, npc: true }); K.tables.push({ x, z }); K.dining.push(...root.children.slice(bc)); }
  { const p = new T3.Group(); p.position.set(5.0, 0, -3.6); root.add(p); M(new T3.CylinderGeometry(0.3, 0.24, 0.5, 14), red, 0, 0.25, 0, p, 0.01); for (let i = 0; i < 9; i++) { const lf = M(new T3.ConeGeometry(0.1, 1.1, 4), toon('#4f8a3a'), Math.cos(i) * 0.15, 1.0, Math.sin(i) * 0.15, p, 0.006); lf.rotation.set(Math.sin(i) * 0.4, 0, -Math.cos(i) * 0.4); } solid(4.7, -3.9, 5.3, -3.3); }
  { const x = 4.9, z = -1.4; M(new T3.BoxGeometry(1.6, 0.42, 0.5), indigo, x, 0.21, z, root, 0.015); M(new T3.BoxGeometry(1.6, 0.7, 0.12), indigo, x, 0.6, z + 0.25, root, 0.015); solid(x - 0.8, z - 0.25, x + 0.8, z + 0.32); K.seats.push({ x: x - 0.4, z: z - 0.05, y: 0.43, face: Math.PI, out: { x: x - 0.4, z: z - 0.62 } }, { x: x + 0.4, z: z - 0.05, y: 0.43, face: Math.PI, out: { x: x + 0.4, z: z - 0.62 } }); }
  // maneki fox on a shelf + hanging lanterns over the bar
  { const sx = 5.85, sz = 1.4; M(new T3.BoxGeometry(0.25, 0.05, 1.2), woodD, sx, 1.9, sz, root, 0.006); const cat = new T3.Group(); cat.position.set(sx - 0.05, 1.93, sz); cat.rotation.y = -Math.PI / 2; root.add(cat); M(new T3.SphereGeometry(0.16, 12, 10), cream, 0, 0.16, 0, cat, 0.008, 0.16); M(new T3.SphereGeometry(0.12, 12, 10), cream, 0, 0.38, 0, cat, 0.008, 0.12); for (const s of [-1, 1]) M(new T3.ConeGeometry(0.05, 0.12, 4), toon('#ee7d24'), s * 0.07, 0.5, 0, cat, 0.004); K.arm = M(new T3.CapsuleGeometry(0.035, 0.12, 3, 6), cream, 0.13, 0.36, 0.04, cat, 0.004); M(new T3.CylinderGeometry(0.05, 0.05, 0.02, 10), toon('#e6b45a'), 0, 0.2, 0.15, cat, 0).rotation.x = Math.PI / 2; }
  K.barLamps = []; for (const x of [-2.2, -0.75, 0.75, 2.2]) { K.cut.push(M(new T3.CylinderGeometry(0.008, 0.008, 1.1, 4), ink, x, H - 0.55, PZ - 0.2, root, 0)); const l = new T3.Mesh(new T3.SphereGeometry(0.2, 14, 10), new T3.MeshBasicMaterial({ map: lanT })); l.scale.set(1, 1.25, 1); l.position.set(x, H - 1.25, PZ - 0.2); root.add(l); K.cut.push(l); K.barLamps.push(l); }
  // ---------- set dressing (final polish) ----------
  // bar-top kit at every seat: soy bottle, chopstick cup, napkin box
  K.seatX.forEach((x, i) => { const bx = x + (i % 2 ? -0.48 : 0.48), bz = PZ + 0.2;
    M(new T3.CylinderGeometry(0.03, 0.035, 0.12, 10), toon('#3a1a10'), bx, PY + 0.09, bz, root, 0.004, 0.035); M(new T3.CylinderGeometry(0.018, 0.022, 0.04, 8), red, bx, PY + 0.17, bz, root, 0);
    M(new T3.CylinderGeometry(0.035, 0.035, 0.1, 10), woodL, bx + 0.1, PY + 0.08, bz, root, 0.004, 0.035); for (let j = 0; j < 5; j++) { const st = M(new T3.CylinderGeometry(0.005, 0.004, 0.2, 4), toon('#e8d4a8'), bx + 0.1 + Math.cos(j * 1.3) * 0.015, PY + 0.17, bz + Math.sin(j * 1.3) * 0.015, root, 0); st.rotation.z = Math.cos(j) * 0.12; }
    M(new T3.BoxGeometry(0.1, 0.07, 0.06), cream, bx - 0.11, PY + 0.065, bz, root, 0.004); });
  // stainless hood over the boiler and broth pots (hidden with the ceiling while working)
  { const hood = M(new T3.BoxGeometry(2.7, 0.5, 1.1), steel, -0.35, 2.75, KZ - 0.1, root, 0.02); K.cut.push(hood, M(new T3.BoxGeometry(2.8, 0.06, 1.2), steelD, -0.35, 2.48, KZ - 0.1, root, 0), M(new T3.BoxGeometry(0.6, 1.0, 0.6), steel, -0.35, 3.5, KZ - 0.3, root, 0.01)); }
  // warm light pools on the floor under the bar lanterns + two pendant lamps over the tables
  const pool = (x, z, r, o) => { const m = new T3.Mesh(new T3.CircleGeometry(r, 28), new T3.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: o, depthWrite: false, blending: T3.AdditiveBlending })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.012, z); root.add(m); return m; };
  K.seatX.forEach(x => pool(x, SZ + 0.2, 0.75, 0.12)); K.pools = [];
  for (const [x, z] of [[-4.6, 0.6], [-4.6, 3.1], [-1.9, 3.3]]) { K.cut.push(M(new T3.CylinderGeometry(0.008, 0.008, 1.5, 4), ink, x, H - 0.75, z, root, 0)); const sh = M(new T3.ConeGeometry(0.28, 0.24, 16, 1, true), toon('#b8312a', { side: T3.DoubleSide }), x, H - 1.55, z, root, 0.008); K.cut.push(sh); K.barLamps.push(sh); pool(x, z, 1.0, 0.1); }
  // side wall: wooden menu tags + a framed fox print
  { const tagT = CTX(512, 128, c => { const items = ['醤油', '味噌', '辛', '卵', '海苔', '葱', '麺']; c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, 512, 128); items.forEach((t, i) => { const x = 8 + i * 72; c.fillStyle = '#e6c88a'; c.fillRect(x, 6, 60, 116); c.strokeStyle = '#5a3a22'; c.lineWidth = 3; c.strokeRect(x, 6, 60, 116); c.fillStyle = '#201e1d'; c.font = '900 30px serif'; c.textAlign = 'center'; [...t].forEach((ch, j) => c.fillText(ch, x + 30, 44 + j * 34)); }); });
    const tg = new T3.Mesh(new T3.PlaneGeometry(3.4, 0.85), new T3.MeshBasicMaterial({ map: tagT, transparent: true })); tg.position.set(-W / 2 + 0.03, 2.75, 1.5); tg.rotation.y = Math.PI / 2; root.add(tg);
    const artT = CTX(256, 256, c => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#f2d9a0'); gr.addColorStop(1, '#e8a060'); c.fillStyle = gr; c.fillRect(0, 0, 256, 256); c.fillStyle = '#c4402a'; c.beginPath(); c.arc(170, 80, 34, 0, 7); c.fill(); c.fillStyle = '#5a3a22'; c.beginPath(); c.moveTo(0, 200); c.quadraticCurveTo(90, 120, 256, 190); c.lineTo(256, 256); c.lineTo(0, 256); c.fill(); c.fillStyle = '#ee7d24'; c.beginPath(); c.moveTo(70, 196); c.lineTo(84, 150); c.lineTo(96, 170); c.lineTo(110, 150); c.lineTo(122, 196); c.closePath(); c.fill(); c.beginPath(); c.ellipse(96, 205, 30, 18, 0, 0, 7); c.fill(); c.fillStyle = '#fbf8ec'; c.beginPath(); c.moveTo(126, 205); c.quadraticCurveTo(170, 170, 150, 222); c.fill(); });
    const art = new T3.Mesh(new T3.PlaneGeometry(1.0, 1.0), new T3.MeshBasicMaterial({ map: artT })); art.position.set(W / 2 - 0.03, 2.3, 1.8); art.rotation.y = -Math.PI / 2; root.add(art); M(new T3.BoxGeometry(0.05, 1.12, 1.12), woodD, W / 2 - 0.05, 2.3, 1.8, root, 0.006); }
  // entrance mat inside the door
  { const matT = CTX(128, 64, c => { c.fillStyle = '#23305a'; c.fillRect(0, 0, 128, 64); c.strokeStyle = '#f4ead6'; c.lineWidth = 3; c.strokeRect(6, 6, 116, 52); c.fillStyle = '#f4ead6'; c.font = '900 18px Archivo, Arial'; c.textAlign = 'center'; c.fillText('いらっしゃい', 64, 40); }); const m = new T3.Mesh(new T3.PlaneGeometry(1.5, 0.75), new T3.MeshToonMaterial({ map: matT, gradientMap: ctx.grad })); m.rotation.x = -Math.PI / 2; m.position.set(4.0, 0.008, D / 2 - 0.7); root.add(m); }
  // outside: potted bamboo by the door + a string of little lights along the facade
  { const fc = root.children.length; for (const x of [2.75, 5.25]) { M(new T3.CylinderGeometry(0.28, 0.22, 0.5, 12), toon('#3a3836'), x, 0.25, D / 2 + 0.55, root, 0.01); for (let j = 0; j < 4; j++) { const st = M(new T3.CylinderGeometry(0.025, 0.03, 2.2 + j * 0.2, 6), toon('#5f8a3a'), x + (j - 1.5) * 0.08, 1.4 + j * 0.1, D / 2 + 0.55 + (j % 2) * 0.06, root, 0.004); st.rotation.z = (j - 1.5) * 0.06; for (let q = 0; q < 3; q++) { const lf = M(new T3.ConeGeometry(0.05, 0.35, 4), toon('#7fb84a'), x + (j - 1.5) * 0.12 + (q - 1) * 0.12, 1.9 + q * 0.35 + j * 0.1, D / 2 + 0.55, root, 0.003); lf.rotation.z = (q - 1) * 1.1; } } }
    for (let i = 0; i < 22; i++) { const x = -5.6 + i * 0.53, y = 3.95 - Math.abs(Math.sin(i * 0.6)) * 0.12; M(new T3.SphereGeometry(0.045, 8, 6), new T3.MeshBasicMaterial({ color: i % 3 ? 0xffd88a : 0xff8a6a }), x, y, D / 2 + 0.18, root, 0); }
    K.front.push(...root.children.slice(fc)); }
  K.cut.forEach(m => m.traverse(o => o.castShadow = false));
  K.origin = { x: origin.x, z: origin.z }; K.toWorld = (x, z) => ({ x: x + origin.x, z: z + origin.z });
  Object.assign(K, { T, PZ, PY, SZ, door: { x: 4.0, z: D / 2 }, kitsuSpot: { x: 2.35, z: KZ + 0.82 } });
  return K; }

// ---------------- the stand-alone shop ----------------
export async function createRamenShop({ container, onState = () => {}, start = 'walk' }) {
  const ST = createStage(container, { bg: '#141a33' }), { CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS, sun } = ST;
  const snd = createRamenAudio(audio); let musicGo = false;
  const audioGo = () => { snd.unlock(); if (!musicGo) { musicGo = true; snd.music(S.phase === 'shift' || S.phase === 'glide' ? 'shift' : 'walk'); } };
  addEventListener('pointerdown', audioGo, true); addEventListener('keydown', audioGo, true);
  const onVis = () => snd.pause(document.hidden); document.addEventListener('visibilitychange', onVis);
  scene.fog = new THREE.Fog('#141a33', 16, 34); sun.intensity = 0.9; sun.color.set('#ffe2b0');
  const K = buildRamen({ THREE, M, toon, canvasTex, scene, grad, addOutline }), T = K.top;
  const warm = new THREE.PointLight(0xffb070, 1.4, 14, 1.4); warm.position.set(0, 3.2, K.PZ); scene.add(warm);
  const glows = [...K.barLamps, ...K.lanterns].map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb070, transparent: true, depthWrite: false, opacity: 0.5, blending: THREE.AdditiveBlending })); s.position.copy(l.position); s.scale.setScalar(1.4); scene.add(s); s.userData.cut = K.barLamps.includes(l); return s; });
  const steamS = []; for (let i = 0; i < 18; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); scene.add(s); steamS.push({ s, life: 0, v: V3() }); } let stI = 0;
  const steam = (x, y, z, n = 1) => { for (let i = 0; i < n; i++) { const p = steamS[stI = (stI + 1) % steamS.length]; p.s.position.set(x + rr(-0.06, 0.06), y, z + rr(-0.06, 0.06)); p.life = 1; p.v.set(rr(-0.04, 0.04), rr(0.25, 0.4), rr(-0.04, 0.04)); } };
  const knife = (() => { const g = new THREE.Group(); const bl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.008, 0.09), toon('#d7dde3')); bl.position.x = 0.16; addOutline(bl, 0.005); g.add(bl); const h = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.04), toon('#201e1d')); h.position.x = -0.06; addOutline(h, 0.005); g.add(h); g.visible = false; scene.add(g); return g; })();
  const noHands = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };

  // ---------- cast ----------
  const kitsu = noHands(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#f0dcbe', furDark: '#c2a577' }, torso: ['#23305a', '#f4ead6', '#16203e'], outfit: 'vest', crest: '', gear: 'none', mood: 'happy' }));
  kitsu.position.set(K.kitsuSpot.x, 0, K.kitsuSpot.z); scene.add(kitsu);
  const kitsuBand = (() => { const BP = kitsu.userData.P, hs = BP.head.scale.x || 1, b = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.045, 6, 20), toon('#fbfbf7')); b.rotation.x = Math.PI / 2 - 0.15; b.position.set(0, BP.head.position.y + 0.12 * hs, 0); b.scale.setScalar(hs); BP.body.add(b); const r = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), toon('#b8312a')); r.position.set(0, 0.0, 0.33); b.add(r); return b; })();
  const benW = noHands(kit.makeFox({ ...CAST.player, gear: 'none' })); scene.add(benW);  // walking Ben: the cast look, 8 armour
  const ben = noHands(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#b8312a'], crest: '', gear: 'none', mood: 'happy' })); scene.add(ben); const BP = ben.userData.P;
  const drawBowlIcon = (g, s) => { g.save(); g.scale(s, s); g.lineJoin = 'round'; const st = () => { g.strokeStyle = '#201e1d'; g.lineWidth = 7; g.stroke(); };
    g.fillStyle = '#b8312a'; g.beginPath(); g.moveTo(-70, -10); g.lineTo(70, -10); g.quadraticCurveTo(64, 56, 0, 60); g.quadraticCurveTo(-64, 56, -70, -10); g.closePath(); g.fill(); st();
    g.fillStyle = '#f2dc9a'; g.beginPath(); g.ellipse(0, -10, 70, 14, 0, 0, 7); g.fill(); st(); g.strokeStyle = '#201e1d'; g.lineWidth = 6; g.beginPath(); g.moveTo(20, -14); g.lineTo(80, -88); g.moveTo(34, -10); g.lineTo(92, -78); g.stroke(); g.restore(); };
  const uniform = new THREE.Group(); { const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 100); drawBowlIcon(g, 0.8); g.restore();
      g.save(); g.translate(128, 196); g.rotate(-0.06); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(-122, -24); g.lineTo(126, -30); g.lineTo(116, 34); g.lineTo(-130, 30); g.closePath(); g.fill(); g.fillStyle = '#23305a'; g.beginPath(); g.moveTo(-114, -18); g.lineTo(118, -24); g.lineTo(110, 26); g.lineTo(-121, 23); g.closePath(); g.fill();
      g.font = 'italic 900 42px Archivo, "Arial Black", Arial, sans-serif'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.strokeText('FOXY RAMEN', 0, 2); g.fillStyle = '#ffd23a'; g.fillText('FOXY RAMEN', 0, 2); g.restore(); });
    uniform.userData.parts = dinerUniform(ST, ben, { print, printY: 1.17, stripe: '#23305a', towelCol: '#b8312a' }).parts; }
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uniform.userData.parts.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); };
  const custFox = CUSTOMERS.map(cu => { const f = noHands(kit.makeFox({ ...CAST.player, look: cu.fur ? { ...CAST.player.look, fur: cu.fur, furDark: cu.furDark } : CAST.player.look, torso: cu.torso, outfit: cu.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; scene.add(f); return f; });
  // ambient diners (walk mode): each on a seat with a bowl, slurping
  const AMB = [{ ci: 0, seat: 0, line: 'Shh... the broth is talking to me.' }, { ci: 3, seat: 5, line: 'Kitsu cuts every noodle by hand. You can taste it!' }, { ci: 2, seat: 10, line: 'Third bowl tonight. Do not judge me.' }];
  AMB.forEach(a => { a.f = custFox[a.ci]; const s = K.seats[a.seat]; a.bowl = bowlMesh(THREE, toon, addOutline); a.bowl.scale.setScalar(0.85); a.bowl.userData.set({ broth: pick(BK), lvl: 0.7, noodle: { done: 'normal' }, tops: [{ k: 'chashu', x: 0.06, z: 0.02 }, { k: 'egg', x: -0.06, z: 0.03 }] }); scene.add(a.bowl);
    const tb = s.bar ? null : K.tables.reduce((b, t) => Math.hypot(t.x - s.x, t.z - s.z) < Math.hypot(b.x - s.x, b.z - s.z) ? t : b);
    if (s.bar) a.bowl.position.set(s.x, K.PY + 0.03, K.PZ + 0.1); else a.bowl.position.set(tb.x, 0.81, tb.z + (s.z > tb.z ? 0.18 : -0.18)); });

  // ---------- cameras ----------
  const CAM = { look: V3(), from: null, to: null, t: 1, dur: 1 };
  const { SAFE, shotFor } = cameraFit(ST);
  const wideShot = () => { const port = CW() < CHh(), z = K.SZ + 0.9, box = [V3(1.5, 0.05, z), V3(3.0, 0.05, z), V3(1.5, 2.3, z), V3(3.0, 2.3, z), V3(K.kitsuSpot.x, 2.4, K.kitsuSpot.z)];
    return port ? shotFor('wideP', () => box, 0.12, Math.PI - 0.32, 0.1) : shotFor('wideL', () => box, 0.12, Math.PI - 0.4, 0.06); };
  const FOCUS = { all: 1, noodle: 1, boil: 1, bowl: 1, top: 1, serve: 1 };
  function workShot(id = S.focus || 'all') { const port = CW() < CHh(); return shotFor('w:' + id, () => shotPoints(id), id === 'serve' ? (port ? 0.62 : 0.5) : id === 'all' ? (port ? 1.1 : 0.9) : port ? 1.08 : 1.05, 0, id === 'all' ? 0.02 : 0.04); }
  function setFocus(id) { if (!FOCUS[id] || S.focus === id) return; S.focus = id; S.userFocusT = performance.now(); }
  function shotPoints(id) { const P = (x, z, y = T) => V3(x, y, z), out = [];
    if (id === 'noodle') out.push(P(K.flour.x - 0.24, K.flour.z - 0.22, T + 0.22), P(K.flour.x + 0.24, K.flour.z - 0.22, T + 0.22), P(K.flour.x - 0.24, K.flour.z + 0.22, T + 0.22), P(K.flour.x + 0.24, K.flour.z + 0.22, T + 0.22), P(K.board.x + 0.36, K.board.z + 0.26), P(K.board.x - 0.36, K.board.z + 0.26), P(K.board.x + 0.36, K.board.z - 0.26), P(K.board.x, K.board.z, T + 0.2));
    else if (id === 'boil') { for (const sx of [-0.54, 0.54]) for (const sz of [-0.32, 0.32]) out.push(P(K.boiler.x + sx, K.boiler.z + sz), P(K.boiler.x + sx, K.boiler.z + sz, T + 0.62)); }
    else if (id === 'bowl') { BK.forEach(k => out.push(P(K.pots[k].x - 0.19, K.pots[k].z - 0.19, T + 0.3), P(K.pots[k].x + 0.19, K.pots[k].z - 0.19, T + 0.3), P(K.pots[k].x, K.pots[k].z + 0.19, T + 0.32))); out.push(P(K.mat.x - 0.27, K.mat.z + 0.27), P(K.mat.x + 0.27, K.mat.z + 0.27), P(K.mat.x + 0.27, K.mat.z - 0.27, T + 0.2), P(K.bowls.x - 0.18, K.bowls.z + 0.18), P(K.bowls.x - 0.18, K.bowls.z - 0.18, T + 0.25)); }
    else if (id === 'top') { out.push(P(K.mat.x - 0.27, K.mat.z + 0.27), P(K.mat.x - 0.27, K.mat.z - 0.27, T + 0.2), P(K.mat.x + 0.27, K.mat.z + 0.27)); TK.forEach(k => out.push(P(K.tops[k].x - 0.15, K.tops[k].z - 0.15, T + 0.08), P(K.tops[k].x + 0.15, K.tops[k].z + 0.15, T + 0.08))); }
    else if (id === 'serve') { out.push(P(-3.2, K.PZ, K.PY), P(3.2, K.PZ, K.PY), P(K.mat.x, K.mat.z)); K.seatX.forEach(x => out.push(P(x - 0.4, K.SZ, 2.15), P(x + 0.4, K.SZ, 2.15), P(x, K.SZ, 0.9))); }
    else out.push(P(-3.0, K.z - 0.5), P(3.1, K.z - 0.5), P(-3.0, K.z + 0.6), P(3.1, K.register.z), ...K.seatX.map(x => P(x, K.SZ, 1.95)));
    return out; }
  function glideTo(shot, dur = 1.6) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }

  // ---------- game state ----------
  const S = { phase: start === 'walk' ? 'walk' : 'intro', focus: 'all', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], flash: null, flashT: 0, say: '', sayT: 0, pay: null, next: 3, done: null, combo: 0, hold: null, dough: null, nest: null, bowl: null };
  const upg = id => !!save.stat(SAVE.upg + id, 0), CUTS = () => upg('knife') ? 3 : 4, NB = () => upg('basket') ? 3 : 2;
  const orders = [], pass = []; let drag = null, idSeq = 1;
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  const brothsAvail = () => BK.filter(k => BROTHS[k].day <= S.day), donesAvail = () => Object.keys(DONE).filter(k => DONE[k].day <= S.day), topsAvail = () => TK.filter(k => TOPS[k].day <= S.day);
  const work = () => S.phase === 'shift';

  // ---------- baskets ----------
  const gaugeCv = [], baskets = K.slots.map((sl, i) => { const g = new THREE.Group(); g.position.set(sl.x, T + 0.12, sl.z); scene.add(g);
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.18, 14, 1, true), toon('#8a939b', { side: THREE.DoubleSide, wireframe: false })); wire.position.y = 0.09; g.add(wire); addOutline(wire, 0.005, 0.12);
    for (let k = 0; k < 3; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.115 - k * 0.008, 0.005, 4, 18), toon('#5a646d')); r.rotation.x = Math.PI / 2; r.position.y = 0.03 + k * 0.07; g.add(r); }
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.36), toon('#201e1d')); handle.position.set(0, 0.2, 0.26); handle.rotation.x = 0.5; g.add(handle);
    const noodles = noodleNest(THREE, toon, '#f2dc9a', 1.5); noodles.position.y = 0.04; noodles.visible = false; g.add(noodles);
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; gaugeCv.push(cv);
    const gauge = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false })); gauge.scale.set(0.72, 0.225, 1); gauge.renderOrder = 25; gauge.position.set(sl.x, T + 0.7, sl.z); gauge.visible = false; scene.add(gauge);
    return { i, g, noodles, gauge, tx, cv, st: 'empty', v: 0, shakes: 0, cut: 'neat', y: 0, rung: false, bob: 0 }; });
  function drawTag(B) { B.tagDrawn = true; const c = B.cv.getContext('2d'); c.clearRect(0, 0, 64, 64); c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(32, 32, 30, 0, 7); c.fill(); c.lineWidth = 5; c.strokeStyle = '#201e1d'; c.stroke(); c.fillStyle = '#201e1d'; c.font = '900 38px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(B.i + 1), 32, 35); B.tx.needsUpdate = true; }
  function drawGauge(B, want) { const c = B.cv.getContext('2d'); c.setTransform(1.6, 0, 0, 1.54, 0, 0); c.clearRect(0, 0, 160, 52); c.fillStyle = '#000'; c.fillRect(0, 0, 160, 52); const zones = [[0, 0.36, '#6b6560'], [0.36, 0.54, DONE.firm.col], [0.54, 0.72, DONE.normal.col], [0.72, 0.88, DONE.soft.col], [0.88, 1, '#ec3013']];
    zones.forEach(([a, b, col]) => { c.fillStyle = col; c.fillRect(6 + a * 148, 26, (b - a) * 148 - 1, 18); });
    if (want && DONE[want]) { const [a, b] = DONE[want].z; c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.strokeRect(6 + a * 148, 23, (b - a) * 148, 24); }
    const x = 6 + Math.min(1, B.v) * 148; c.fillStyle = '#fff'; c.fillRect(x - 2, 20, 4, 30); c.font = '900 17px Archivo, Arial'; c.textBaseline = 'top'; c.fillStyle = B.st === 'cook' ? '#ffd23a' : '#22c55e'; c.fillText(B.st === 'cook' ? DONE_NAME(doneOf(B.v)) : B.shakes >= 3 ? 'DRAINED' : 'SHAKE ' + B.shakes + ' / 3', 6, 3); B.tx.needsUpdate = true; }
  const basketTop = B => V3(K.slots[B.i].x, B.g.position.y + 0.12, K.slots[B.i].z);
  function dropNest(B) { if (!S.nest) return false; if (B.st !== 'empty') { flash('THAT BASKET IS BUSY', '#ffffff', 1); return false; } B.st = 'cook'; B.v = 0; B.shakes = 0; B.cut = S.nest.cut; B.rung = false; B.noodles.visible = true; scene.remove(S.nest.mesh); S.nest = null; snd.play('splash'); snd.buzz(10); steam(K.slots[B.i].x, T + 0.3, K.slots[B.i].z, 3); flash('NOODLES IN · WATCH THE GAUGE', '#ffffff', 1.2); return true; }
  function liftBasket(B) { if (B.st !== 'cook') return; B.st = 'up'; snd.play('lift'); snd.buzz(12); const d = doneOf(B.v), w = wantDone(); flash('LIFTED · ' + DONE_NAME(d) + (w ? (w === d ? ' · JUST RIGHT' : ' · TICKET SAYS ' + DONE_NAME(w)) : '') + ' · SWIPE UP TO SHAKE', w && w !== d ? '#ff9a8a' : '#22c55e', 1.8); }
  function shakeBasket(B) { if (B.st !== 'up' || B.shakes >= 3) return; B.shakes++; B.bob = 1; snd.play('shake'); snd.buzz(10); for (let k = 0; k < 4; k++) puff(K.slots[B.i].x, T + 0.4, K.slots[B.i].z, 0xbfe4f0, 1); if (B.shakes >= 3) flash('DRAINED!', '#22c55e', 0.9); }
  function basketToBowl(B) { if (B.st !== 'up') return false; if (!S.bowl) { flash('TAP THE BOWL STACK FOR A BOWL FIRST', '#ffffff', 1.2); return false; } if (S.bowl.noodle) { flash('THIS BOWL HAS NOODLES', '#ffffff', 1); return false; }
    S.bowl.noodle = { done: doneOf(B.v), v: B.v, drained: B.shakes >= 3, cut: B.cut }; B.st = 'empty'; B.v = 0; B.shakes = 0; B.noodles.visible = false; showBowl(); snd.play('drop'); steam(K.mat.x, T + 0.2, K.mat.z, 3); if (!S.bowl.noodle.drained) flash('NOT SHAKEN · A BIT WATERY', '#ff9a8a', 1.2); return true; }
  // ---------- dough ----------
  const doughMesh = new THREE.Group(); { const d = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.3), toon('#f2e6c8')); d.position.y = 0.03; addOutline(d, 0.006); doughMesh.add(d); } doughMesh.position.set(K.board.x, T + 0.04, K.board.z); doughMesh.visible = false; scene.add(doughMesh);
  const cutLines = new THREE.Group(); doughMesh.add(cutLines);
  function getDough() { if (S.dough) { flash('SWIPE ACROSS THE DOUGH TO CUT', '#ffffff', 1); return; } if (S.nest) { flash('PUT THE NEST IN A BASKET FIRST', '#ffffff', 1.1); return; } S.dough = { cuts: 0, neat: 0, last: 0 }; doughMesh.visible = true; while (cutLines.children.length) cutLines.remove(cutLines.children[0]); snd.play('plop'); puff(K.board.x, T + 0.1, K.board.z, 0xffffff, 3); }
  function cutOnce(speed) { const D0 = S.dough, now = performance.now() / 1000; if (!D0 || now - D0.last < 0.12) return; D0.last = now; D0.cuts++; const neat = speed < 1.5; if (neat) D0.neat++; snd.play('chop'); snd.buzz(8);
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.004, 0.31), toon('#c9b48a')); l.position.set(-0.18 + D0.cuts * (0.36 / (CUTS() + 1)), 0.062, 0); cutLines.add(l);
    flash(neat ? 'NEAT CUT ' + D0.cuts + ' / ' + CUTS() : 'ROUGH CUT · SLOWER = THINNER', neat ? '#22c55e' : '#e6b45a', 0.7);
    if (D0.cuts >= CUTS()) { doughMesh.visible = false; knife.visible = false; const cut = D0.neat >= Math.ceil(CUTS() / 2) ? 'neat' : 'rough', m = noodleNest(THREE, toon, '#f6ecc8', 2); m.position.set(K.board.x, T + 0.045, K.board.z); scene.add(m); S.nest = { cut, mesh: m }; S.dough = null; snd.play('nest'); flash(cut === 'neat' ? 'SILKY NOODLES!' : 'NOODLES CUT', '#22c55e', 1); } }
  // ---------- the bowl on the mat ----------
  const bowlG = bowlMesh(THREE, toon, addOutline); bowlG.position.set(K.mat.x, T + 0.012, K.mat.z); bowlG.visible = false; scene.add(bowlG);
  const ladle = (() => { const g = new THREE.Group(), c = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon('#c9ced3', { side: THREE.DoubleSide })); addOutline(c, 0.004, 0.07); g.add(c); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.45, 6), toon('#5a3a22')); h.position.set(0, 0.2, -0.08); h.rotation.x = -0.4; g.add(h); g.visible = false; scene.add(g); return g; })();
  const stream = (() => { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 1, 8), new THREE.MeshBasicMaterial({ color: 0xa8682e })); st.visible = false; scene.add(st); return st; })();
  function showBowl() { bowlG.visible = !!S.bowl; if (S.bowl) bowlG.userData.set(S.bowl, S.hold && S.hold.kind === 'pour'); }
  function placeBowl() { if (S.bowl) { flash('A BOWL IS ALREADY ON THE MAT', '#ffffff', 1); return; } S.bowl = { broth: null, lvl: 0, noodle: null, tops: [] }; showBowl(); snd.play('clink'); }
  function addTop(k, at) { const b = S.bowl; if (!b) { flash('NO BOWL ON THE MAT', '#ffffff', 1); return false; } if (!b.noodle && !b.broth) { flash('BROTH AND NOODLES FIRST', '#ffffff', 1); return false; } if (b.tops.some(t => t.k === k)) { flash(TOPS[k].name + ' IS ALREADY ON', '#ffffff', 1); return false; }
    const R = 0.125; let x, z; if (at) { const d = Math.hypot(at.x, at.z), s = d > R ? R / d : 1; x = at.x * s; z = at.z * s; if (d < 0.04) { x = 0.08; z = 0; } } else { let best = null; for (let a = 0; a < 12; a++) { const ang = a / 12 * Math.PI * 2, px = Math.cos(ang) * 0.1, pz = Math.sin(ang) * 0.1, md = b.tops.reduce((m, t) => Math.min(m, Math.hypot(t.x - px, t.z - pz)), 9); if (!best || md > best.md) best = { px, pz, md }; } x = best.px; z = best.pz; }
    b.tops.push({ k, x, z }); showBowl(); snd.play('top'); puff(K.mat.x + x, T + 0.2, K.mat.z + z, 0xfff3d0, 1); return true; }
  const spreadOf = b => { if (b.tops.length < 2) return 1; let m = 9; for (let i = 0; i < b.tops.length; i++) for (let j = i + 1; j < b.tops.length; j++) m = Math.min(m, Math.hypot(b.tops[i].x - b.tops[j].x, b.tops[i].z - b.tops[j].z)); return clamp(m / 0.09, 0, 1); };
  // HOLD (pour broth)
  function startPour(k) { if (!S.bowl) { flash('TAP THE BOWL STACK FOR A BOWL FIRST', '#ffffff', 1.2); return; } if (S.bowl.broth && S.bowl.broth !== k) { flash('THIS BOWL HAS ' + BROTHS[S.bowl.broth].name + ' · BIN IT TO CHANGE', '#ec3013', 1.4); return; } if (S.bowl.lvl >= 1) { flash('BOWL IS FULL', '#ffffff', 1); return; } S.bowl.broth = k; S.hold = { kind: 'pour', k, t: 0 }; showBowl(); stream.material.color.set(BROTHS[k].soup); }
  function stepHold(dt) { const H = S.hold; if (!H) { return; } H.t += dt; const b = S.bowl; if (!b) { S.hold = null; snd.loop('pour', 0); return; } snd.loop('pour', H.t > 0.3 ? 1 : 0); b.lvl = Math.min(1.05, b.lvl + dt * (upg('ladle') ? 0.5 : 0.36)); if (b.lvl >= 1.05 && !b.spilt) { b.spilt = true; flash('OVERFLOW!', '#ec3013', 1); snd.play('refused'); snd.buzz(30); } showBowl(); if (Math.random() < dt * 6) steam(K.mat.x, T + 0.2, K.mat.z, 1); }
  const pourZone = v => v < BROTH_OK[0] ? 'LOW' : v <= BROTH_OK[1] ? 'GOOD' : 'TOO FULL';
  function releaseHold() { const H = S.hold; if (!H) return; S.hold = null; snd.loop('pour', 0); const b = S.bowl; showBowl(); if (!b) return; const z = pourZone(b.lvl); flash(BROTHS[H.k].name + ' · ' + z, z === 'GOOD' ? '#22c55e' : '#e6b45a', 1); snd.play(z === 'GOOD' ? 'ding' : 'okay'); }
  // ---------- pass (bowls waiting on the bar) ----------
  const PASS_X = [0.15, 1.0, -0.7];
  function toPass(b) { const slot = [0, 1, 2].find(i => !pass.some(p => p.slot === i)); if (slot == null) { flash('THE BAR IS FULL · SLIDE ONE OUT', '#ffffff', 1.2); return null; } const m = bowlMesh(THREE, toon, addOutline); m.userData.set(b); m.position.set(PASS_X[slot], K.PY + 0.03, K.PZ - 0.08); scene.add(m); const p = { b, m, slot, x: PASS_X[slot], v: 0, sliding: false }; pass.push(p); return p; }
  const aim = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.2, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthTest: false, depthWrite: false })); aim.renderOrder = 28; aim.visible = false; scene.add(aim);
  const AIM_GAIN = 4;
  function removePass(p) { const i = pass.indexOf(p); if (i >= 0) pass.splice(i, 1); scene.remove(p.m); }

  // ---------- orders ----------
  const SEATS = K.seatX.map(x => ({ x, z: K.SZ, y: 0.74 }));
  function newOrder() { const free = SEATS.findIndex((_, i) => !orders.some(o => o.spot === i)); if (free < 0) return; const used = orders.map(o => o.ci), pool = CUSTOMERS.map((_, i) => i).filter(i => !used.includes(i) && !AMB.some(a => a.ci === i && a.f.visible)), ci = pick(pool);
    const d = S.day, broth = pick(brothsAvail()), done = d <= 1 ? pick(['normal', 'normal', 'firm']) : pick(donesAvail()), ta = topsAvail(), nT = clamp(Math.round(rr(1, Math.min(4, ta.length) + 0.4)), 1, ta.length), tops = ta.slice().sort(() => Math.random() - 0.5).slice(0, nT);
    const total = BROTHS[broth].price + tops.length, patMax = (88 - Math.min(20, (d - 1) * 4)) * (upg('radio') ? 1.2 : 1);
    const f = custFox[ci]; f.visible = true; const fast = !orders.length; f.position.set(fast ? SEATS[free].x : K.door.x, 0, fast ? K.SZ + 1.6 : K.door.z - 0.4); f.rotation.y = Math.PI; f.userData.mood = 'happy';
    const path = fast ? [V3(SEATS[free].x, 0, K.SZ + 0.32)] : [V3(SEATS[free].x, 0, K.SZ + 0.9), V3(SEATS[free].x, 0, K.SZ + 0.32)];
    snd.play('door'); orders.push({ id: idSeq++, ci, spot: free, broth, done, tops, total, pat: patMax, patMax, st: 'walk', path, f, line: pick(LINES.order) }); }
  const waiting = () => orders.filter(o => o.st === 'wait').sort((a, b) => a.pat - b.pat);
  const wantDone = () => { const o = waiting()[0]; return o ? o.done : null; };
  const matchOrder = b => { const w = waiting(); return w.find(o => o.broth === b.broth && o.done === (b.noodle && b.noodle.done) && sameTops(o, b)) || w.find(o => o.broth === b.broth) || null; };
  const sameTops = (o, b) => o.tops.length === b.tops.length && o.tops.every(k => b.tops.some(t => t.k === k));
  function grade(o, b) { const parts = []; parts.push(b.lvl >= BROTH_OK[0] && b.lvl <= BROTH_OK[1] ? 1 : b.lvl > 0.3 ? 0.55 : 0.2);
    const di = Math.abs(DONE_ORDER.indexOf(b.noodle.done) - DONE_ORDER.indexOf(o.done)); parts.push(di === 0 ? 1 : di === 1 ? 0.55 : 0.15);
    parts.push(b.noodle.drained ? 1 : 0.6); const hit = o.tops.filter(k => b.tops.some(t => t.k === k)).length, extra = b.tops.filter(t => !o.tops.includes(t.k)).length; parts.push(o.tops.length ? hit / (o.tops.length + extra) : 1);
    parts.push(b.noodle.cut === 'neat' ? 1 : 0.85); const q = parts.reduce((a, v) => a + v, 0) / parts.length + (spreadOf(b) > 0.8 && b.tops.length >= 2 ? 0.03 : 0); return { q, doneOk: di === 0, levelOk: parts[0] === 1, topsOk: hit === o.tops.length && !extra }; }
  const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['This broth could wake the moon!', 'Perfect noodles. PERFECT.', 'I am telling everyone about this place.'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Mmm, so warm. Thank you!', 'Just how I like it.', 'Slurp-tastic!'] }, okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['It is fine. Not quite what I asked for.', 'Hmm. The noodles are a bit off.', 'Okay. Thanks.'] }, grumpy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad', lines: ['This is not my bowl...', 'Where are my toppings?', 'I waited for this?'] }, refused: { word: 'NOT MINE!', col: '#ec3013', mood: 'stern', lines: ['I ordered a different broth!', 'That is NOT my order!', 'Are you even listening?'] } };
  function serve(o, b, bonus) { if (!b.noodle || o.broth !== b.broth) { startReact(o, 'refused', 0, null); return false; }
    const g = grade(o, b), pq = o.pat / o.patMax, stars = g.q >= 0.92 ? (pq > 0.45 ? 3 : 2) : g.q >= 0.75 ? 2 : g.q >= 0.55 ? 1 : 0; o.st = 'eat'; o.stars = stars; o.bowl = b;
    const level = stars === 3 ? 'thrilled' : stars === 2 ? 'happy' : stars === 1 ? 'okay' : 'grumpy'; o.tip = (level === 'thrilled' ? Math.ceil(o.total * 0.4) + 2 : level === 'happy' ? Math.ceil(o.total * 0.2) + 1 : 0) + (bonus && stars ? 1 : 0); o.flick = !!bonus;
    const bill = [5, 10, 20, 50].find(v => v > o.total + (Math.random() < 0.3 ? 4 : 0)) || 50; startReact(o, level, stars, { oid: o.id, total: o.total, paid: bill, owed: bill - o.total, given: 0 }); return true; }
  function startReact(o, level, stars, pay) { const R = REACT[level]; o.f.userData.mood = R.mood; o.f.userData.lineMood = R.mood; S.react = { o, level, stars, pay, t: 0, word: R.word, col: R.col, line: pick(R.lines), who: CUSTOMERS[o.ci].name, tip: o.tip || 0 }; snd.play(level); if (level !== 'refused') setTimeout(() => snd.play('slurp'), 900); }
  function reactDone() { const r = S.react; S.react = null; r.o.f.userData.lineMood = null; if (r.pay) { S.pay = r.pay; payProps(r.pay); tone(880, 0.1, 0.05); } else { r.o.pat = Math.max(4, r.o.pat - 8); if (r.o.served) { scene.remove(r.o.served); r.o.served = null; } flash('BOWL BINNED · MAKE ' + CUSTOMERS[r.o.ci].name + ' A ' + BROTHS[r.o.broth].name, '#ec3013', 1.8); } }
  const REG = V3(K.register.x, T, K.register.z - 0.6), RG = registerKit(ST, REG, { open: 'FOXY RAMEN  ·  OPEN' }), { DISH, regDisp, drawer, regDraw, coinsOut, payProps, coinDrop } = RG;
  function giveCoin(v) { const P = S.pay; if (!P) return; P.given += v; coinDrop(v); regDraw(P); snd.play('coin'); snd.buzz(5); if (P.given === P.owed) payDone(); else if (P.given > P.owed) { flash('TOO MUCH · TRY AGAIN', '#ec3013'); P.given = 0; tone(220, 0.2, 0.04, 'sawtooth'); coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; regDraw(P); } }
  function payDone() { const P = S.pay, o = orders.find(q => q.id === P.oid); S.pay = null; S.payOut = { t: 0, o }; regDraw({ ...P, given: P.owed }); if (!o) return; S.earned += o.total; S.tips += o.tip; S.served++; S.starList.push(o.stars); S.combo = o.stars === 3 ? S.combo + 1 : 0;
    flash('+' + (o.total + o.tip) + 'g' + (o.flick ? ' · NICE SLIDE!' : '') + (S.combo >= 2 ? ' · COMBO ×' + S.combo : ''), '#22c55e', 1.6); o.st = 'eating'; o.t = 0; snd.play('register'); }

  // ---------- reveal (close-up of a finished bowl) ----------
  function revealBowl() { const b = S.bowl; if (!b) return; const miss = [!b.broth && 'BROTH', !b.noodle && 'NOODLES'].filter(Boolean); if (miss.length) { flash('STILL NEEDS ' + miss.join(' + '), '#ffffff', 1.3); return; }
    const o = matchOrder(b); S.reveal = { t: 0, oid: o ? o.id : null, who: o ? CUSTOMERS[o.ci].name : '', g: o ? grade(o, b) : null, want: o ? { done: o.done, tops: o.tops } : null }; snd.play('ding'); }
  function revealDone(choice) { const r = S.reveal; if (!r) return; S.reveal = null; bowlG.rotation.y = 0; bowlG.scale.setScalar(1); const b = S.bowl;
    if (choice === 'bin') { S.bowl = null; showBowl(); flash('BOWL BINNED', '#ec3013', 1); tone(160, 0.2, 0.04); return; }
    if (choice === 'bar') { const p = toPass(b); if (p) { S.bowl = null; showBowl(); flash('DRAG ALONG THE BAR TO AIM · LET GO', '#ffd23a', 1.8); setFocus('serve'); } return; }
    const o = orders.find(q => q.id === r.oid && q.st === 'wait'); if (!o) { revealDone('bar'); return; } const p = toPass(b); if (!p) return; S.bowl = null; showBowl(); sendTo(p, o, false); }
  // slide a pass bowl along the bar
  function sendTo(p, o, bonus) { p.sliding = true; p.auto = { o, bonus, x0: p.x, x1: SEATS[o.spot].x, t: 0 }; setFocus('serve'); }
  function flickPass(p, vx) { p.sliding = true; p.v = clamp(vx, -7, 7); p.free = true; }
  const FRIC = 2.4, stopAt = (x, v) => x + Math.sign(v) * v * v / (2 * FRIC);
  function stepPass(dt) { let sl = 0; for (const p of pass) if (p.sliding) sl = Math.max(sl, p.auto ? 0.7 : Math.min(1, Math.abs(p.v) / 4)); snd.loop('slide', sl); for (const p of pass.slice()) { if (!p.sliding) continue;
      if (p.auto) { const A = p.auto; A.t = Math.min(1, A.t + dt / (0.35 + Math.abs(A.x1 - A.x0) * 0.22)); p.x = A.x0 + (A.x1 - A.x0) * smooth(0, 1, A.t); p.m.position.x = p.x; p.m.position.z = K.PZ - 0.08 + smooth(0, 1, A.t) * 0.16; if (A.t >= 1) { p.sliding = false; landOn(p, A.o, A.bonus); } continue; }
      const s = Math.sign(p.v); p.v -= s * FRIC * dt; if (Math.sign(p.v) !== s) p.v = 0; p.x += p.v * dt; p.m.position.x = p.x; p.m.rotation.y += p.v * dt * 0.6;
      if (Math.abs(p.x) > 3.25) { p.sliding = false; flash('CRASH! THE BOWL FLEW OFF THE BAR', '#ec3013', 1.6); snd.play('crash'); snd.buzz([30, 40, 30]); puff(p.x, K.PY, K.PZ, 0xffffff, 6); removePass(p); continue; }
      if (Math.abs(p.v) < 0.05) { p.sliding = false; p.v = 0; const o = waiting().find(q => Math.abs(SEATS[q.spot].x - p.x) < 0.42); if (o) { p.m.position.z = K.PZ + 0.08; landOn(p, o, o.broth === p.b.broth); } else flash('NOBODY CAUGHT IT · SLIDE IT AGAIN', '#ffffff', 1.2); } } }
  function landOn(p, o, bonus) { snd.play('knock'); snd.buzz(15); const i = pass.indexOf(p); if (i >= 0) pass.splice(i, 1); o.served = p.m; p.m.position.set(SEATS[o.spot].x, K.PY + 0.03, K.PZ + 0.08); serve(o, p.b, bonus); }

  // ---------- input ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(T + 0.15)), hit = V3();
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  const onPlane = (x, y, h) => { plane.constant = -h; ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.ray.intersectPlane(plane, hit) ? hit.clone() : null; };
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const TARGETS = () => { const t = [];
    t.push({ kind: 'flour', p: V3(K.flour.x, T + 0.2, K.flour.z), r: 44 }); t.push({ kind: S.nest ? 'nest' : 'board', p: V3(K.board.x, T + 0.06, K.board.z), r: 62 });
    baskets.forEach((B, i) => { if (i < NB()) t.push({ kind: 'basket', B, p: basketTop(B), r: 44 }); });
    BK.forEach(k => { if (BROTHS[k].day <= S.day) t.push({ kind: 'pot', k, p: V3(K.pots[k].x, T + 0.28, K.pots[k].z), r: 40 }); });
    t.push({ kind: 'bowls', p: V3(K.bowls.x, T + 0.16, K.bowls.z), r: 40 }); if (S.bowl) t.push({ kind: 'bowl', p: V3(K.mat.x, T + 0.1, K.mat.z), r: 54 });
    TK.forEach(k => { if (TOPS[k].day <= S.day) t.push({ kind: 'top', k, p: V3(K.tops[k].x, T + 0.08, K.tops[k].z), r: 34 }); });
    pass.forEach(p => !p.sliding && t.push({ kind: 'pass', p0: p, p: p.m.position.clone().setY(K.PY + 0.1), r: 46 }));
    orders.forEach(o => o.st === 'wait' && t.push({ kind: 'cust', o, p: V3(o.f.position.x, 1.75, o.f.position.z), r: 64 })); return t; };
  function pickAt(x, y, kinds) { let best = null, bd = 1e9; for (const t of TARGETS()) { if (kinds && !kinds.includes(t.kind)) continue; const s = scr(t.p), d = Math.hypot(s.x - x, s.y - y); if (d < t.r * scale() && d < bd) { bd = d; best = t; } } return best; }
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const STATION = { flour: 'noodle', board: 'noodle', nest: 'noodle', basket: 'boil', pot: 'bowl', bowls: 'bowl', bowl: 'bowl', top: 'top', pass: 'serve', cust: 'serve' };
  function onDown(e) { audio.init && audio.init(); S.lastInput = performance.now(); const { x, y } = local(e);
    if (S.phase === 'walk') return;
    if (S.phase !== 'shift' || S.pay || DM.on || S.reveal || S.react || S.hold) return; const t = pickAt(x, y);
    if (S.dough && (!t || t.kind === 'board' || t.kind === 'flour' || (() => { const v = scr(V3(K.board.x, T + 0.08, K.board.z)); return Math.abs(x - v.x) < 120 * scale() && Math.abs(y - v.y) < 90 * scale(); })())) { e.preventDefault(); setFocus('noodle'); S.stroke = { x, y, tm: performance.now() }; strokeMove(x, y); return; } if (!t) return; e.preventDefault();
    if (S.focus === 'all' && !['nest', 'basket', 'pass', 'cust', 'bowl'].includes(t.kind)) setFocus(STATION[t.kind]);
    if (t.kind === 'flour') { getDough(); setFocus('noodle'); }
    else if (t.kind === 'board') flash('TAP THE FLOUR BIN FOR DOUGH', '#ffffff', 1);
    else if (t.kind === 'nest') { S.nest.mesh.visible = false; const m = noodleNest(THREE, toon, '#f6ecc8', 1.6); scene.add(m); m.position.copy(S.nest.mesh.position); drag = { kind: 'nest', mesh: m, x0: x, y0: y }; }
    else if (t.kind === 'basket') { const B = t.B; if (B.st === 'cook') liftBasket(B); else if (B.st === 'up') { drag = { kind: 'basket', B, x0: x, y0: y, tm: performance.now(), mesh: null }; } else if (S.nest) dropNest(B); else flash('CUT SOME NOODLES FIRST', '#ffffff', 1); }
    else if (t.kind === 'pot') startPour(t.k);
    else if (t.kind === 'bowls') placeBowl();
    else if (t.kind === 'bowl') drag = { kind: 'bowl', x0: x, y0: y };
    else if (t.kind === 'top') { const m = topMesh(THREE, toon, t.k, addOutline); m.scale.setScalar(1.3); m.position.copy(t.p); scene.add(m); drag = { kind: 'top', k: t.k, mesh: m, x0: x, y0: y }; setFocus('top'); }
    else if (t.kind === 'pass') { const h0 = onPlane(x, y, K.PY + 0.05); drag = { kind: 'pass', p: t.p0, x0: x, y0: y, sx: t.p0.x, hx: h0 ? h0.x : t.p0.x, dx: 0 }; setFocus('serve'); }
    else if (t.kind === 'cust') { const o = t.o, p = pass.find(q => !q.sliding && q.b.broth === o.broth) || pass.find(q => !q.sliding); if (p) sendTo(p, o, false); else flash(CUSTOMERS[o.ci].name + ' WANTS ' + BROTHS[o.broth].name + ' · ' + DONE[o.done].name, '#ffffff', 1.4); } }
  function onMove(e) { if (S.phase === 'walk') return; const { x, y } = local(e); if (S.stroke) { strokeMove(x, y); return; } if (!drag) return;
    if (drag.kind === 'nest' || drag.kind === 'top') { const h = onPlane(x, y, T + 0.2); if (h) drag.mesh.position.set(h.x, T + 0.2, h.z); if (drag.kind === 'top') drag.hover = !!S.bowl && Math.hypot(h ? h.x - K.mat.x : 9, h ? h.z - K.mat.z : 9) < 0.32; }
    else if (drag.kind === 'basket') { const B = drag.B; if (y - drag.y0 < -38 * scale() && performance.now() - drag.tm < 600) { shakeBasket(B); drag.y0 = y; drag.tm = performance.now(); drag.shook = true; } else if (Math.hypot(x - drag.x0, y - drag.y0) > 30 && !drag.shook && !drag.mesh) { drag.mesh = noodleNest(THREE, toon, '#f2dc9a', 1.5); scene.add(drag.mesh); B.noodles.visible = false; } if (drag.mesh) { const h = onPlane(x, y, T + 0.25); if (h) drag.mesh.position.set(h.x, T + 0.25, h.z); } }
    else if (drag.kind === 'pass') { const h = onPlane(x, y, K.PY + 0.05); if (h) { const p = drag.p, dx = clamp(h.x - drag.hx, -0.9, 0.9); drag.dx = dx; p.m.position.x = drag.sx + dx * 0.25; const land = clamp(drag.sx + dx * AIM_GAIN, -3.6, 3.6), who = waiting().find(q => Math.abs(SEATS[q.spot].x - land) < 0.42); aim.visible = Math.abs(dx) > 0.03; aim.position.set(land, K.PY + 0.04, K.PZ - 0.08); aim.material.color.set(Math.abs(land) > 3.25 ? 0xec3013 : who ? 0x22c55e : 0xffd23a); aim.scale.setScalar(1); drag.who = who ? CUSTOMERS[who.ci].name : ''; } } }
  function onUp(e) { if (S.phase === 'walk') return; if (S.stroke) { S.stroke = null; knife.visible = false; return; } if (S.hold && !DM.on) { releaseHold(); return; } if (!drag) return; const { x, y } = local(e), d = drag; drag = null; const tap = Math.hypot(x - d.x0, y - d.y0) < 14;
    const nearBowl = () => { const s = scr(V3(K.mat.x, T + 0.1, K.mat.z)); return Math.hypot(s.x - x, s.y - y) < 80 * scale(); };
    if (d.kind === 'nest') { scene.remove(d.mesh); let B = null; if (tap) B = baskets.find((q, i) => i < NB() && q.st === 'empty'); else { const t = pickAt(x, y, ['basket']); B = t && t.B; } if (B) { if (dropNest(B)) setFocus('boil'); else S.nest && (S.nest.mesh.visible = true); } else { if (S.nest) S.nest.mesh.visible = true; if (tap) flash('ALL BASKETS ARE BUSY', '#ffffff', 1); } }
    else if (d.kind === 'basket') { if (d.mesh) scene.remove(d.mesh); if (d.shook) { d.B.noodles.visible = d.B.st !== 'empty'; return; } if (tap || nearBowl()) { if (!basketToBowl(d.B)) d.B.noodles.visible = true; } else d.B.noodles.visible = true; }
    else if (d.kind === 'bowl') { if (tap) revealBowl(); }
    else if (d.kind === 'top') { scene.remove(d.mesh); if (tap) addTop(d.k); else if (nearBowl() || d.hover) { const h = onPlane(x, y, T + 0.15); addTop(d.k, h ? { x: h.x - K.mat.x, z: h.z - K.mat.z } : null); } }
    else if (d.kind === 'pass') { aim.visible = false; d.p.x = d.sx; d.p.m.position.x = d.sx; const dist = (d.dx || 0) * AIM_GAIN; if (tap || Math.abs(d.dx || 0) < 0.03) flash('DRAG ALONG THE BAR TO AIM · LET GO TO SLIDE · OR TAP THE CUSTOMER', '#ffffff', 1.8); else flickPass(d.p, Math.sign(dist) * Math.sqrt(2 * FRIC * Math.abs(dist))); } }
  function strokeMove(x, y) { const D0 = S.dough, st = S.stroke; if (!D0 || !st) return; const v = scr(V3(K.board.x, T + 0.08, K.board.z)), R = 80 * scale(), now = performance.now();
    if ((st.x - v.x) * (x - v.x) < 0 && Math.abs(y - v.y) < R) { const sp = Math.hypot(x - st.x, y - st.y) / Math.max(1, now - st.tm) / scale(); cutOnce(sp); }
    else if ((st.y - v.y) * (y - v.y) < 0 && Math.abs(x - v.x) < R) { const sp = Math.hypot(x - st.x, y - st.y) / Math.max(1, now - st.tm) / scale(); cutOnce(sp); }
    st.x = x; st.y = y; st.tm = now; const h = onPlane(x, y, T + 0.15); if (h) { knife.visible = true; knife.position.set(h.x, T + 0.14, h.z - 0.1); knife.rotation.set(0, Math.PI / 2 + 0.15, -0.25); } }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- WALK MODE: Ben walks in off the street ----------
  const Wk = { x: K.door.x, z: K.door.z + 2.4, face: Math.PI, yaw: 0, dist: 6.2, pitch: 0.5, stick: { x: 0, y: 0 }, keys: new Set(), target: null, sit: null, wave: 0, toast: '', toastT: 0, dlg: null, near: null, eat: null, place: '' };
  const NPCS = () => [{ id: 'kitsu', name: 'KITSU', role: 'Owner · chef', f: kitsu, at: V3(K.kitsuSpot.x, 0, K.SZ + 0.3) }, ...AMB.map(a => ({ id: 'amb' + a.ci, name: CUSTOMERS[a.ci].name, role: 'Regular', f: a.f, at: a.f.position.clone(), a }))];
  const RAD = 0.32;
  function collide(x, z) { for (let k = 0; k < 2; k++) for (const [x0, z0, x1, z1] of K.solids) { const cx = clamp(x, x0, x1), cz = clamp(z, z0, z1), dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz); if (d < RAD) { if (d < 1e-4) { const pen = [x - x0, x1 - x, z - z0, z1 - z], m = Math.min(...pen), i = pen.indexOf(m); if (i === 0) x = x0 - RAD; else if (i === 1) x = x1 + RAD; else if (i === 2) z = z0 - RAD; else z = z1 + RAD; } else { x = cx + dx / d * RAD; z = cz + dz / d * RAD; } } } return { x, z }; }
  function walkToast(t, s = 2.6) { Wk.toast = t; Wk.toastT = s; }
  function standUp() { if (!Wk.sit) return; const s = Wk.sit; Wk.sit = null; Wk.eat = null; const o = s.out || { x: s.x, z: s.z + 0.6 }; Wk.x = o.x; Wk.z = o.z; if (eatBowl) eatBowl.visible = false; }
  const seatFree = s => !s.npc && !AMB.some(a => K.seats[a.seat] === s) && !orders.some(o => SEATS[o.spot] && Math.abs(SEATS[o.spot].x - s.x) < 0.01 && Math.abs(SEATS[o.spot].z - s.z) < 0.01);
  function sitNear(maxD = 1.6) { const s = K.seats.filter(seatFree).sort((a, b) => Math.hypot(a.x - Wk.x, a.z - Wk.z) - Math.hypot(b.x - Wk.x, b.z - Wk.z))[0]; if (!s || Math.hypot(s.x - Wk.x, s.z - Wk.z) > maxD) return false; Wk.sit = s; Wk.target = null; snd.play('plop'); return true; }
  const eatBowl = (() => { const b = bowlMesh(THREE, toon, addOutline); b.scale.setScalar(0.85); b.visible = false; scene.add(b); return b; })();
  function orderBowl() { const s = K.seats.filter(q => q.bar && seatFree(q)).sort((a, b) => Math.hypot(a.x - Wk.x, a.z - Wk.z) - Math.hypot(b.x - Wk.x, b.z - Wk.z))[0]; if (!s) { walkToast('KITSU: "Bar is full. Grab a table!"'); return; } Wk.target = { x: s.x, z: s.z + 0.6, then: () => { Wk.sit = s; Wk.eat = { t: 0 }; eatBowl.userData.set({ broth: pick(brothsAvail()), lvl: 0.72, noodle: { done: 'normal' }, tops: [{ k: 'chashu', x: 0.07, z: 0.02 }, { k: 'egg', x: -0.06, z: 0.04 }, { k: 'nori', x: 0, z: -0.09 }] }); eatBowl.position.set(K.kitsuSpot.x, K.PY + 0.03, K.PZ - 0.1); eatBowl.visible = true; } }; }
  // dialogue
  const KITSU_TALK = { lines: ['Irasshai! Welcome to FOXY RAMEN.', 'Slow-simmered broth, noodles cut by hand, open till the lanterns go out.'],
    choices: [{ text: 'Can I work a shift?', go: () => ({ lines: ['You? Behind MY counter? ...Ha! I like you. Grab an apron.'], then: () => openIntro() }) },
      { text: 'Could I get a bowl, please?', go: () => ({ lines: ['Sit anywhere at the bar. One bowl, coming right up!'], then: () => orderBowl() }) },
      { text: 'How do you make a bowl?', ask: 1, go: () => ({ lines: ['Cut the dough slow and the strands come out silky. Boil them to the ticket: FIRM, NORMAL or SOFT.', 'Shake the basket dry, ladle the broth to the line, noodles in, toppings spread out nice.', 'Then send it down the bar. Drag to aim, let go, and it lands right in front of them. Customers love a good slide.'], back: 1 }) },
      { text: 'See you later.', bye: 1, go: () => ({ lines: ['Come back hungry!'] }) }] };
  function openDialog(npc) { if (npc.id === 'kitsu') { Wk.dlg = { name: 'KITSU', role: 'Owner · chef', f: kitsu, lines: KITSU_TALK.lines.slice(), i: 0, choices: KITSU_TALK.choices, asked: Wk.dlg ? Wk.dlg.asked : {} }; }
    else Wk.dlg = { name: npc.name, role: npc.role, f: npc.f, lines: [npc.a.line], i: 0 }; npc.f.userData.talking = true; npc.f.userData.lookAt = benW.position.clone().setY(1.6); snd.play('ui'); }
  function closeDialog() { const d = Wk.dlg; if (!d) return; d.f.userData.talking = false; d.f.userData.lookAt = null; Wk.dlg = null; const then = d.then; d.then = null; if (then) then(); }
  function nextLine() { const d = Wk.dlg; if (!d) return; if (d.showChoices) return; if (d.i < d.lines.length - 1) { d.i++; return; } if (d.choices && !d.ended) { d.showChoices = true; d.f.userData.talking = false; return; } closeDialog(); }
  function choose(i) { const d = Wk.dlg; if (!d || !d.showChoices) return; const c = d.choices[i]; if (!c) return; const r = c.go(); d.showChoices = false; d.lines = r.lines; d.i = 0; d.f.userData.talking = true; if (c.ask) (d.asked = d.asked || {})[i] = 1; d.ended = !r.back; d.then = r.then || null; }
  function nearestNpc() { let best = null; for (const n of NPCS()) { if (!n.f.visible) continue; const d = Math.hypot(n.at.x - Wk.x, n.at.z - Wk.z); if (d < (n.id === 'kitsu' ? 1.5 : 1.7) && (!best || d < best.d)) best = { ...n, d }; } return best; }
  function talk() { if (S.phase !== 'walk') return; if (Wk.dlg) { nextLine(); return; } const n = nearestNpc(); if (n) openDialog(n); }
  function wave() { if (S.phase !== 'walk' || Wk.dlg) return; Wk.wave = 1.3; snd.play('happy'); for (const n of NPCS()) { const d = Math.hypot(n.at.x - Wk.x, n.at.z - Wk.z); if (d < 5) { n.f.userData.waveBack = 1.2 + Math.random() * 0.4; n.f.userData.mood = 'excited'; n.f.userData.lookAt = benW.position.clone().setY(1.6); setTimeout(() => { n.f.userData.lookAt = null; n.f.userData.mood = 'happy'; }, 2000); } } const kd = Math.hypot(K.kitsuSpot.x - Wk.x, K.SZ - Wk.z); if (kd < 6) walkToast('KITSU: "Hey hey! Hungry?"', 2); }
  function sitBtn() { if (S.phase !== 'walk' || Wk.dlg) return; if (Wk.sit) { standUp(); return; } if (!sitNear()) walkToast('Walk up to a stool or a seat to sit', 1.8); }
  function jump() { if (S.phase !== 'walk' || Wk.dlg) return; if (Wk.sit) { standUp(); return; } benW.userData.hop = 1; snd.play('ui'); }
  // tap-to-walk + drag-to-look
  let wp = null;
  function walkDown(e, x, y) { if (Wk.dlg) return; wp = { x0: x, y0: y, x, y, id: e.pointerId, moved: false }; }
  function walkMove(e) { if (!wp || e.pointerId !== wp.id) return; const { x, y } = local(e), dx = x - wp.x; if (Math.hypot(x - wp.x0, y - wp.y0) > 12) wp.moved = true; if (wp.moved) { Wk.yaw -= dx * 0.008; Wk.pitch = clamp(Wk.pitch + (y - wp.y) * 0.004, 0.25, 0.95); } wp.x = x; wp.y = y; }
  function walkUp(e) { if (!wp || e.pointerId !== wp.id) return; const w = wp; wp = null; if (w.moved) return; const { x, y } = local(e);
    // tap a fox → walk over and talk
    for (const n of NPCS()) { if (!n.f.visible) continue; const s = scr(V3(n.f.position.x, 1.4, n.f.position.z)); if (Math.hypot(s.x - x, s.y - y) < 60 * scale()) { if (Wk.sit) standUp(); Wk.target = { x: n.at.x, z: n.at.z + (n.id === 'kitsu' ? 0.45 : 0.7), then: () => openDialog(n) }; return; } }
    // tap a free seat → walk + sit
    for (const s of K.seats) { if (!seatFree(s)) continue; const p = scr(V3(s.x, s.y, s.z)); if (Math.hypot(p.x - x, p.y - y) < 34 * scale()) { if (Wk.sit) standUp(); Wk.target = { x: s.x, z: s.z + (s.face === 0 ? -0.6 : 0.6), then: () => { Wk.sit = s; } }; return; } }
    const h = onPlane(x, y, 0); if (h) { if (Wk.sit) standUp(); Wk.target = { x: h.x, z: h.z }; Wk.mark.position.set(h.x, 0.02, h.z); Wk.mark.visible = true; Wk.markT = 1; } }
  // the HUD's floating-stick zone covers the left of the screen: a TAP there (no drag) still walks, so listen on window in capture
  const walkOK = e => { const t = e.target; if (!t || !t.closest) return false; if (t.closest('button,a,input,select,textarea')) return false; return t === renderer.domElement || (t.style && t.style.width === '55%' && !!t.closest('[data-hud-host]')); };
  const wDown = e => { if (S.phase !== 'walk' || !walkOK(e)) return; audio.init && audio.init(); const { x, y } = local(e); walkDown(e, x, y); wp.canvas = e.target === renderer.domElement; wp.t0 = performance.now(); };
  const wMove = e => { if (S.phase === 'walk' && wp && wp.canvas) walkMove(e); else if (wp && e.pointerId === wp.id) { const { x, y } = local(e); if (Math.hypot(x - wp.x0, y - wp.y0) > 12) wp.moved = true; } };
  const wUp = e => { if (S.phase === 'walk' && wp && !(performance.now() - wp.t0 > 450 && !wp.canvas)) walkUp(e); else wp = null; };
  addEventListener('pointerdown', wDown, true); addEventListener('pointermove', wMove, true); addEventListener('pointerup', wUp, true);
  Wk.mark = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.24, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthWrite: false })); Wk.mark.visible = false; scene.add(Wk.mark);
  const KMAP = { KeyW: [0, 1], ArrowUp: [0, 1], KeyS: [0, -1], ArrowDown: [0, -1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };
  const onKD = e => { if (S.phase !== 'walk') return; if (KMAP[e.code]) { Wk.keys.add(e.code); e.preventDefault(); return; } if (e.repeat) return; if (e.code === 'KeyE') talk(); else if (e.code === 'Digit1') wave(); else if (e.code === 'Digit2') sitBtn(); else if (e.code === 'Space') { e.preventDefault(); jump(); } else if (Wk.dlg && /^Digit[1-4]$/.test(e.code)) choose(+e.code.slice(5) - 1); };
  const onKU = e => Wk.keys.delete(e.code), onBlur = () => Wk.keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);
  function stepWalk(dt) { let sx = Wk.stick.x, sy = Wk.stick.y; for (const k of Wk.keys) { sx += KMAP[k][0]; sy += KMAP[k][1]; } const m = Math.hypot(sx, sy); if (m > 1) { sx /= m; sy /= m; }
    if (Wk.dlg) { sx = sy = 0; Wk.target = null; }
    if (Wk.sit && Math.hypot(sx, sy) > 0.4) standUp();
    let mvx = 0, mvz = 0; const cy = Math.cos(Wk.yaw), sy0 = Math.sin(Wk.yaw);
    if (Math.hypot(sx, sy) > 0.08) { Wk.target = null; mvx = sx * cy - sy * sy0; mvz = -sy * cy - sx * sy0; }
    else if (Wk.target) { const dx = Wk.target.x - Wk.x, dz = Wk.target.z - Wk.z, d = Math.hypot(dx, dz); if (d < 0.18) { const th = Wk.target.then; Wk.target = null; if (th) th(); } else { const s = Math.min(1, d / 0.5); mvx = dx / d * s; mvz = dz / d * s; } }
    const sp = 3.0, spd = Math.hypot(mvx, mvz) * sp; if (!Wk.sit && spd > 0.01) { const ox = Wk.x, oz = Wk.z, c = collide(Wk.x + mvx * sp * dt, Wk.z + mvz * sp * dt); Wk.x = c.x; Wk.z = c.z; Wk.face = Math.atan2(mvx, mvz); if (Wk.target && Math.hypot(Wk.x - ox, Wk.z - oz) < spd * dt * 0.15) { Wk.stuck = (Wk.stuck || 0) + dt; if (Wk.stuck > 0.5) { const tg = Wk.target, dd = Math.hypot(tg.x - Wk.x, tg.z - Wk.z); Wk.target = null; Wk.stuck = 0; if (dd < 0.9 && tg.then) tg.then(); } } else Wk.stuck = 0; Wk.stepD = (Wk.stepD || 0) + spd * dt; if (Wk.stepD > 0.62) { Wk.stepD = 0; snd.play('step'); } }
    if (Wk.sit) { benW.position.set(Wk.sit.x, Wk.sit.y - 0.46, Wk.sit.z); benW.rotation.y = Wk.sit.face; } else { benW.position.set(Wk.x, 0, Wk.z); benW.rotation.y = damp(benW.rotation.y, benW.rotation.y + (((Wk.face - benW.rotation.y + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI), 12, dt); }
    kit.animFox && kit.animFox(benW, dt, Wk.sit ? 0 : spd); const P = benW.userData.P;
    if (Wk.sit) { P.legs.forEach(l => l.rotation.x = -1.45); } if (Wk.wave > 0) { Wk.wave -= dt; P.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(Wk.wave * 14) * 0.32); }
    if (Wk.eat) { Wk.eat.t += dt; const e = Wk.eat; if (e.t < 1.2) { const k = smooth(0, 1, e.t / 1.2), s = Wk.sit; eatBowl.position.lerpVectors(V3(K.kitsuSpot.x, K.PY + 0.03, K.PZ - 0.1), V3(s.x, K.PY + 0.03, K.PZ + 0.08), k); } else { P.arms[1].rotation.x = -1.3 + Math.sin(e.t * 10) * 0.25; P.arms[0].rotation.x = -0.9; if (Math.random() < dt * 5) steam(eatBowl.position.x, K.PY + 0.25, eatBowl.position.z, 1); if (Math.random() < dt * 0.5) snd.play('slurp'); }
      if (e.t > 6 && !e.done) { e.done = true; walkToast('SLURP! Warm all the way down. +HP · +EN', 3); eatBowl.userData.set({ broth: 'shoyu', lvl: 0.1, noodle: null, tops: [] }); benW.userData.mood = 'excited'; setTimeout(() => benW.userData.mood = 'determined', 2500); } }
    // camera: orbit-follow
    const look = V3(benW.position.x, (Wk.sit ? 1.0 : 1.15) + (CW() > CHh() * 1.4 ? 0.55 : 0.2), benW.position.z), dir = V3(Math.sin(Wk.yaw) * Math.cos(Wk.pitch), Math.sin(Wk.pitch), Math.cos(Wk.yaw) * Math.cos(Wk.pitch)); const port = CW() < CHh(), dist = Wk.dist * (port ? 1.45 : 1); const fov = port ? 58 : 50; if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    const inside = Wk.z < K.D / 2;
    const pos = look.clone().addScaledVector(dir, dist); if (inside) { pos.x = clamp(pos.x, -K.W / 2 + 0.3, K.W / 2 - 0.3); pos.z = Math.max(pos.z, -K.D / 2 + 0.3); }
    if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, pos, k); CAM.look.lerpVectors(CAM.from.look, look, k); } else { camera.position.lerp(pos, Math.min(1, dt * 6)); CAM.look.lerp(look, Math.min(1, dt * 8)); }
    // what's hidden: front wall when Ben is inside and the camera is outside
    const cut = inside && camera.position.z > K.D / 2 - 0.4; K.front.forEach(m => m.visible = !cut); K.cut.forEach(m => m.visible = true); const over = camera.position.y > K.H - 0.25; K.ceil.forEach(m => m.visible = !over); K.barLamps.forEach(m => m.visible = !over);
    const near = Wk.dlg ? null : nearestNpc(); Wk.near = near; Wk.place = inside ? 'Foxy Ramen' : 'Outside · Foxy Ramen';
    if (Wk.markT > 0) { Wk.markT -= dt; Wk.mark.material.opacity = Wk.markT; if (Wk.markT <= 0) Wk.mark.visible = false; }
    if (Wk.toastT > 0) { Wk.toastT -= dt; if (Wk.toastT <= 0) Wk.toast = ''; }
    // noren sways when Ben walks through
    { const nearDoor = Math.abs(Wk.x - 4) < 0.9 && Math.abs(Wk.z - K.D / 2) < 0.5; if (nearDoor && !Wk.inDoor) snd.play('swish'); Wk.inDoor = nearDoor; }
    K.noren.forEach((p, i) => { const d = Math.hypot(p.position.x - Wk.x, K.D / 2 - Wk.z); p.rotation.x = damp(p.rotation.x, d < 0.8 ? -0.7 * Math.sign(Wk.z - K.D / 2 || 1) : Math.sin(performance.now() / 900 + i) * 0.04, 6, dt); }); }
  function stepAmbient(dt) { const show = S.phase === 'walk' || S.phase === 'intro' || S.phase === 'done'; AMB.forEach((a, i) => { a.f.visible = show; a.bowl.visible = show; if (!show) return; const s = K.seats[a.seat]; a.f.position.set(s.x, s.y - 0.46, s.z); if (!a.f.userData.lookAt) a.f.rotation.y = s.face; kit.animFox(a.f, dt, 0); const P = a.f.userData.P; P.legs.forEach(l => l.rotation.x = -1.45);
      if (a.f.userData.waveBack > 0) { a.f.userData.waveBack -= dt; P.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(a.f.userData.waveBack * 14) * 0.32); } else if (!a.f.userData.talking) { const tt = performance.now() / 1000 + i * 1.7; P.arms[1].rotation.x = -1.2 + Math.sin(tt * 9) * 0.22 * (Math.sin(tt * 0.7) > 0 ? 1 : 0.1); P.arms[0].rotation.x = -0.8; if (Math.random() < dt * 1.5) steam(a.bowl.position.x, a.bowl.position.y + 0.2, a.bowl.position.z, 1); } }); }

  // ---------- flow ----------
  function clearAll() { snd.loop('pour', 0); snd.loop('slide', 0); S.hold = null; stream.visible = false; ladle.visible = false; knife.visible = false; doughMesh.visible = false; S.dough = null; if (S.nest) { scene.remove(S.nest.mesh); S.nest = null; } S.bowl = null; showBowl(); S.reveal = null; S.react = null; drag = null; S.stroke = null;
    baskets.forEach(B => { B.st = 'empty'; B.v = 0; B.shakes = 0; B.noodles.visible = false; B.gauge.visible = false; }); pass.slice().forEach(removePass); orders.forEach(o => { o.f.visible = false; if (o.served) scene.remove(o.served); }); orders.length = 0; payProps(null); S.payOut = null; S.pay = null; }
  function benAtCounter() { ben.visible = true; ben.position.set(2.3, 0, K.SZ + 0.9); ben.rotation.y = 0.35; kitsu.visible = true; kitsu.position.set(K.kitsuSpot.x, 0, K.kitsuSpot.z); kitsu.rotation.y = 0; }
  function openIntro() { if (S.phase !== 'walk') return; closeDialog(); Wk.sit = null; Wk.eat = null; eatBowl.visible = false; S.phase = 'intro'; S.done = null; benW.visible = false; setUniform(true); benAtCounter(); resetFov(); K.ceil.forEach(m => m.visible = true); K.barLamps.forEach(m => m.visible = true); K.front.forEach(m => m.visible = false); glideTo(wideShot(), 1.2); }
  function toWalk() { if (DM.on) demoStop(); if (S.phase === 'shift' || S.phase === 'glide') return; clearAll(); S.phase = 'walk'; S.done = null; ben.visible = false; benW.visible = true; Wk.x = 2.3; Wk.z = K.SZ + 0.9; Wk.face = Math.PI; Wk.yaw = 0; kitsu.visible = true; kitsu.position.set(K.kitsuSpot.x, 0, K.kitsuSpot.z); kitsu.rotation.y = 0; glideTo({ pos: camera.position.clone(), look: CAM.look.clone() }, 0.8); CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.t = 0; CAM.dur = 0.9; audio.water && audio.water.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.3); }
  function resetFov() { if (camera.fov !== 50) { camera.fov = 50; camera.updateProjectionMatrix(); } }
  function startShift() { if (S.phase !== 'intro' && S.phase !== 'done') return; resetFov(); if (!S.demo && DM.on) demoStop(); audio.init && audio.init(); try { audio.wind.gain.value = 0; } catch (e) {} clearAll(); Object.assign(S, { phase: 'glide', t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 2.2, done: null, pay: null, combo: 0 });
    S.focus = 'all'; setUniform(!!save.flag('ramenUniform')); ben.visible = false; kitsu.visible = false; glideTo(workShot(), 1.6); say('KITSU: "Dough on the left, boiler next, broth and bowls in the middle, toppings on the right. Go!"', 6); S.glideT = 1.65; }
  function endShift() { S.phase = 'done'; S.hold = null; stream.visible = false; ladle.visible = false; const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = S.served >= 4 + S.day && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips;
    let newDay = false, unlock = []; try { save.addGold(total); save.best(SAVE.best, total); if (S.served >= 2 + S.day) { const nd = S.day + 1; save.setStat(SAVE.day, nd); newDay = true; unlock = [...BK.filter(k => BROTHS[k].day === nd).map(k => BROTHS[k].name + ' BROTH'), ...Object.values(DONE).filter(v => v.day === nd).map(v => v.name + ' NOODLES'), ...TK.filter(k => TOPS[k].day === nd).map(k => TOPS[k].name + ' TOPPING')]; } if (!save.flag('ramenUniform') && S.served >= 3) { save.setFlag('ramenUniform'); unlock.push('RAMEN UNIFORM (cap + towel + tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, served: S.served, lost: S.lost, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0), gold: save.data.gold };
    if (newDay) S.day += 1; snd.play('fanfare'); snd.music('walk'); clearAll(); setUniform(true); benAtCounter(); glideTo(wideShot(), 1.4); say(eod ? 'KITSU: "EMPLOYEE OF THE DAY! The whole street smells your broth!"' : S.served >= 3 ? 'KITSU: "Good shift. Same time tomorrow?"' : 'KITSU: "Rough night. The noodles will be kinder tomorrow."', 6); audio.water && audio.ctx && audio.water.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.3); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); snd.play('register'); if (S.done) S.done.gold = save.data.gold; return true; }

  // ---------- DEMO: an autopilot works a real shift with captions (nothing is saved) ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, served: 0, anim: null, day0: 1, holdTo: null, flicked: false };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.32); hand.visible = false; hand.renderOrder = 20; scene.add(hand);
  const handTo = (p, f) => { hand.visible = true; hand.position.copy(p); hand.scale.setScalar(0.5); if (f) setFocus(f); DM.hint = { p: p.clone().setY(Math.max(T, p.y - 0.15)), r: 0.18 }; };
  const cap = (id, key, text) => { if (DM.seen[id]) return; DM.seen[id] = true; DM.cap = text; DM.key = key; DM.cd = Math.max(DM.cd, 1.6); };
  function slide(mesh, from, to, dur, done) { scene.add(mesh); mesh.position.copy(from); DM.anim = { mesh, from: from.clone(), to: to.clone(), t: 0, dur, done }; }
  function demoAct() { const o = waiting()[0];
    if (S.pay) { const P = S.pay, left = P.owed - P.given, v = [10, 5, 2, 1].find(c => c <= left); if (!DM.seen.pay) { cap('pay', 'COINS', 'THEY PAID ' + P.paid + 'g FOR A ' + P.total + 'g BOWL. TAP COINS TO GIVE ' + P.owed + 'g CHANGE'); return 1.8; } DM.cap = 'GIVE ' + P.owed + 'g CHANGE · ' + (P.given + v) + ' / ' + P.owed + 'g'; DM.key = v + 'g'; giveCoin(v); if (!S.pay) { DM.served++; DM.cap = 'EXACT CHANGE! THE COINS GO TO THE CUSTOMER'; DM.key = '✓'; DM.seen = { pay: 1, flick: 1, reveal: 1 }; return 1.6; } return 0.85; }
    const pb = pass.find(p => !p.sliding); if (pb && o) { const tgt = waiting().find(q => q.broth === pb.b.broth) || o; if (!DM.flicked) { DM.flicked = true; cap('flick', 'DRAG', 'DRAG ALONG THE BAR: THE RING SHOWS WHERE IT STOPS. LET GO ON ' + CUSTOMERS[tgt.ci].name + ' = +1g TIP'); handTo(pb.m.position.clone(), 'serve'); const dx = SEATS[tgt.spot].x - pb.x, v = Math.sign(dx) * Math.sqrt(2 * FRIC * Math.abs(dx)); flickPass(pb, v || 0.01); return 2.2; } cap('send', 'TAP', 'OR TAP THE CUSTOMER: THE BOWL SLIDES OVER BY ITSELF'); handTo(V3(tgt.f.position.x, 1.6, tgt.f.position.z), 'serve'); sendTo(pb, tgt, false); return 1.5; }
    if (!o) return 0.4; const b = S.bowl;
    if (S.hold) return 0.2;
    // keep a basket cooking for this order
    const cooking = baskets.filter((B, i) => i < NB() && B.st !== 'empty');
    const upB = baskets.find((B, i) => i < NB() && B.st === 'up');
    if (upB && upB.shakes < 3) { cap('shake', 'SWIPE ↑', 'SWIPE UP ON THE BASKET 3 TIMES TO SHAKE THE WATER OUT'); handTo(basketTop(upB), 'boil'); shakeBasket(upB); return 0.45; }
    const ready = baskets.find((B, i) => i < NB() && B.st === 'cook' && doneOf(B.v) === o.done && (DONE[o.done].z[0] + DONE[o.done].z[1]) / 2 <= B.v);
    if (ready && !upB) { cap('lift', 'TAP', 'THE GAUGE HIT ' + DONE[o.done].name + ': TAP THE BASKET TO LIFT IT'); handTo(basketTop(ready), 'boil'); liftBasket(ready); return 0.7; }
    if (!b) { cap('bowl', 'TAP', 'TAP THE BOWL STACK: A BOWL GOES ON THE BLACK MAT'); handTo(V3(K.bowls.x, T + 0.2, K.bowls.z), 'bowl'); placeBowl(); return 0.7; }
    if (!b.broth || b.lvl < BROTH_OK[0]) { cap('pour', 'HOLD', 'HOLD THE ' + BROTHS[o.broth].name + ' POT TO LADLE. LET GO BETWEEN THE RED LINES'); handTo(V3(K.pots[o.broth].x, T + 0.3, K.pots[o.broth].z), 'bowl'); startPour(o.broth); DM.holdTo = (BROTH_OK[0] + BROTH_OK[1]) / 2; return 0.1; }
    if (upB && !b.noodle) { cap('drop', 'DRAG', 'DRAG THE DRAINED BASKET ONTO THE BOWL (OR TAP IT)'); const from = basketTop(upB); handTo(from, 'boil'); upB.noodles.visible = false; slide(noodleNest(THREE, toon, '#f2dc9a', 1.5), from, V3(K.mat.x, T + 0.2, K.mat.z), 0.6, () => basketToBowl(upB)); return 0.9; }
    if (!cooking.length && !S.nest && !b.noodle) { if (S.dough) { cap('cut', 'SWIPE', 'SWIPE ACROSS THE DOUGH, SLOWLY: SLOW CUTS MAKE SILKY NOODLES'); handTo(V3(K.board.x, T + 0.12, K.board.z), 'noodle'); knife.visible = true; knife.position.set(K.board.x + (S.dough.cuts % 2 ? 0.14 : -0.14), T + 0.14, K.board.z - 0.1); knife.rotation.set(0, Math.PI / 2 + 0.15, -0.25); cutOnce(0.8); if (!S.dough) knife.visible = false; return 0.45; }
      cap('flour', 'TAP', 'TAP THE FLOUR BIN FOR A BALL OF DOUGH'); handTo(V3(K.flour.x, T + 0.25, K.flour.z), 'noodle'); getDough(); return 0.8; }
    if (S.nest) { const B = baskets.find((q, i) => i < NB() && q.st === 'empty'); if (B) { cap('nest', 'DRAG', 'DRAG THE NOODLE NEST INTO A BASKET. THE GAUGE STARTS CLIMBING'); const from = S.nest.mesh.position.clone(); handTo(from, 'boil'); S.nest.mesh.visible = false; slide(noodleNest(THREE, toon, '#f6ecc8', 1.6), from, basketTop(B), 0.6, () => dropNest(B)); return 1.0; } }
    if (b.noodle) { const need = o.tops.find(k => !b.tops.some(t => t.k === k)); if (need) { cap('top', 'DRAG', 'DRAG EACH TOPPING ONTO THE BOWL. SPREAD THEM AROUND!'); const from = V3(K.tops[need].x, T + 0.08, K.tops[need].z); handTo(from, 'top'); const ang = b.tops.length * 2.2, to = { x: Math.cos(ang) * 0.1, z: Math.sin(ang) * 0.1 }; slide(topMesh(THREE, toon, need, addOutline), from, V3(K.mat.x + to.x, T + 0.15, K.mat.z + to.z), 0.55, () => addTop(need, to)); return 0.75; }
      cap('reveal', 'TAP', 'BOWL DONE? TAP IT TO CHECK IT AGAINST THE TICKET'); handTo(V3(K.mat.x, T + 0.12, K.mat.z), 'bowl'); revealBowl(); return 0.5; }
    cap('wait', '…', 'WAIT FOR THE GAUGE TO REACH ' + DONE[o.done].name + ' (THE WHITE BOX)'); handTo(basketTop(cooking[0] || baskets[0]), 'boil'); return 0.5; }
  function demoStep(dt) { if (DM.anim) { const a = DM.anim; a.t += dt / a.dur; const k = Math.min(1, a.t), p = a.from.clone().lerp(a.to, smooth(0, 1, k)); p.y += Math.sin(k * Math.PI) * 0.25; a.mesh.position.copy(p); hand.position.copy(p); if (k >= 1) { DM.anim = null; scene.remove(a.mesh); a.done && a.done(); } return; }
    if (S.hold && DM.holdTo != null) { if (S.bowl && S.bowl.lvl >= DM.holdTo) { DM.holdTo = null; releaseHold(); DM.cd = 0.7; } return; }
    hand.scale.setScalar(Math.max(0.3, hand.scale.x - dt * 0.6)); if (S.phase !== 'shift' || S.react || S.payOut) return; if (S.reveal) { if (S.reveal.t > 1.8) revealDone(S.reveal.oid ? 'bar' : 'bin'); return; } DM.cd -= dt; if (DM.cd > 0) return; const f0 = S.focus; DM.cd = demoAct(); if (S.focus !== f0) DM.cd += 0.5;
    if (DM.served >= 2 || S.t > 160) { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; DM.cd = 99; setTimeout(() => DM.on && demoStop(), 2600); } }
  function demoStart() { if (DM.on) return; if (S.phase === 'walk') openIntro(); audio.init && audio.init(); DM.on = true; DM.seen = {}; DM.served = 0; DM.anim = null; DM.holdTo = null; DM.flicked = false; DM.cd = 2.2; DM.day0 = S.day; S.day = Math.max(S.day, 2); DM.cap = 'WATCH A SHIFT AT FOXY RAMEN'; DM.key = ''; S.phase = 'intro'; S.done = null; S.demo = true; startShift(); S.next = 0.6; }
  function demoStop() { if (!DM.on) return; DM.on = false; S.demo = false; hand.visible = false; if (DM.anim) { scene.remove(DM.anim.mesh); DM.anim = null; } S.day = DM.day0; clearAll(); S.phase = 'intro'; S.done = null; setUniform(true); benAtCounter(); glideTo(wideShot(), 1.2); }

  // ---------- NEXT-STEP HINT ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'shift' || S.pay) return null; const P3 = (x, z, y = T) => V3(x, y, z), Hh = (p, station, text, r = 0.16) => ({ p, station, text, r });
    if (S.hold) return Hh(P3(K.mat.x, K.mat.z), 'bowl', 'LET GO BETWEEN THE RED LINES', 0.22);
    const o = waiting()[0]; if (!o) return null; const who = CUSTOMERS[o.ci].name, b = S.bowl;
    const pb = pass.find(p => !p.sliding); if (pb) return Hh(P3(pb.x, K.PZ, K.PY), 'serve', 'DRAG THE BOWL TO AIM AT ' + who + ' · OR TAP ' + who, 0.24);
    const upB = baskets.find((B, i) => i < NB() && B.st === 'up');
    if (upB && upB.shakes < 3) return Hh(P3(K.slots[upB.i].x, K.slots[upB.i].z, T + 0.3), 'boil', 'SWIPE UP ON THE BASKET TO SHAKE · ' + upB.shakes + ' / 3', 0.15);
    const ready = baskets.find((B, i) => i < NB() && B.st === 'cook' && doneOf(B.v) === o.done);
    if (ready) return Hh(P3(K.slots[ready.i].x, K.slots[ready.i].z, T + 0.3), 'boil', 'TAP THE BASKET NOW · ' + DONE[o.done].name, 0.15);
    if (S.dough) return Hh(P3(K.board.x, K.board.z), 'noodle', 'SWIPE ACROSS THE DOUGH · ' + S.dough.cuts + ' / ' + CUTS(), 0.24);
    if (S.nest && baskets.some((B, i) => i < NB() && B.st === 'empty')) return Hh(P3(K.board.x, K.board.z), 'noodle', 'DRAG THE NEST INTO A BASKET', 0.2);
    if (!b) return Hh(P3(K.bowls.x, K.bowls.z), 'bowl', 'TAP THE BOWL STACK', 0.16);
    if (!b.broth || b.lvl < BROTH_OK[0]) return Hh(P3(K.pots[o.broth].x, K.pots[o.broth].z, T + 0.3), 'bowl', 'HOLD THE ' + BROTHS[o.broth].name + ' POT · ' + who, 0.19);
    if (upB && !b.noodle) return Hh(P3(K.slots[upB.i].x, K.slots[upB.i].z, T + 0.3), 'boil', 'DRAG THE BASKET ONTO THE BOWL', 0.15);
    if (b.noodle) { const need = o.tops.find(k => !b.tops.some(t => t.k === k)); if (need) return Hh(P3(K.tops[need].x, K.tops[need].z), 'top', 'DRAG ' + TOPS[need].name + ' ONTO THE BOWL', 0.16); return Hh(P3(K.mat.x, K.mat.z), 'bowl', 'TAP THE BOWL · IT IS READY', 0.22); }
    if (S.nest) return Hh(P3(K.board.x, K.board.z), 'noodle', 'DRAG THE NEST INTO A BASKET', 0.2);
    if (S.dough) return Hh(P3(K.board.x, K.board.z), 'noodle', 'SWIPE ACROSS THE DOUGH · ' + S.dough.cuts + ' / ' + CUTS(), 0.24);
    const cooking = baskets.find((B, i) => i < NB() && B.st === 'cook'); if (cooking) return Hh(P3(K.slots[cooking.i].x, K.slots[cooking.i].z, T + 0.3), 'boil', 'WAIT FOR ' + DONE[o.done].name + ' ON THE GAUGE', 0.15);
    return Hh(P3(K.flour.x, K.flour.z), 'noodle', 'TAP THE FLOUR BIN FOR DOUGH', 0.18); }
  let HINT = null, hintT = 0;
  function autoFollow() { if (DM.on || !HINT || !HINT.station || S.focus === 'all' || S.focus === HINT.station) return; if (drag || S.hold || S.stroke || S.reveal || S.react || S.pay) return; if (S.focus === 'noodle' && S.dough) return; if (S.focus === 'top' && S.bowl && S.bowl.noodle) return; const idle = (performance.now() - (S.lastInput || 0)) / 1000; if (idle > 2.2 && performance.now() - (S.userFocusT || 0) > 3200) S.focus = HINT.station; }
  function updHint(dt) { hintT += dt; HINT = DM.on ? (DM.hint && !DM.anim ? DM.hint : null) : nextHint(); RINGS.place(HINT && !S.reveal && !S.react ? HINT : null, hintT, dt); if (RINGS.pulse.visible) { RINGS.pulse.scale.setScalar(HINT.r * 1.05); RINGS.pulse.material.opacity = 0.85; RINGS.pulse2.visible = false; } }

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  const lerpCam = (sh, k) => { camera.position.lerp(sh.pos, k); CAM.look.lerp(sh.look, k); };
  function step(dt) {
    const tNow = clock.elapsedTime;
    for (const p of [...smokeS, ...steamS]) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.4 * p.life; p.s.scale.setScalar(0.16 + (1 - p.life) * 0.3); }
    glows.forEach(s => s.material.opacity = 0.32); if (K.arm) K.arm.rotation.x = Math.sin(tNow * 3) * 0.5;
    BK.forEach((k, i) => { if (Math.random() < dt * 1.2) steam(K.pots[k].x, T + 0.32, K.pots[k].z, 1); }); if (Math.random() < dt * 2) steam(K.boiler.x + rr(-0.4, 0.4), T + 0.3, K.boiler.z, 1);
    if (S.phase === 'walk') { stepWalk(dt); stepAmbient(dt); kit.animFox(kitsu, dt, 0); kitsu.rotation.y = damp(kitsu.rotation.y, kitsu.userData.lookAt ? Math.atan2(benW.position.x - kitsu.position.x, benW.position.z - kitsu.position.z) * 0.6 : 0, 4, dt); if (kitsu.userData.waveBack > 0) { kitsu.userData.waveBack -= dt; kitsu.userData.P.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(kitsu.userData.waveBack * 14) * 0.32); } camera.lookAt(CAM.look); glows.forEach(s => s.visible = true); S.flashT -= dt; if (S.flashT <= 0) S.flash = null; return; }
    if (S.reveal) { S.reveal.t += dt; const r = S.reveal, sh = shotFor('reveal', () => { const p = K.mat; return [V3(p.x - 0.22, T, p.z - 0.22), V3(p.x + 0.22, T, p.z + 0.22), V3(p.x - 0.2, T + 0.2, p.z), V3(p.x + 0.2, T + 0.2, p.z)]; }, 0.75, 0.15, 0.12); lerpCam(sh, Math.min(1, dt * 6)); bowlG.rotation.y += dt * 1.2; bowlG.scale.setScalar(1 + Math.sin(Math.min(1, r.t / 0.35) * Math.PI) * 0.1); }
    else if (S.pay || S.payOut) { const port = CW() < CHh(), sh = shotFor('pay', () => [V3(REG.x - 0.24, REG.y, REG.z - 0.38), V3(REG.x + 0.24, REG.y + 0.1, REG.z + 0.05), V3(DISH.x - 0.14, DISH.y, DISH.z - 0.14), V3(DISH.x + 0.14, DISH.y, DISH.z + 0.14), V3(REG.x + 0.52, REG.y, REG.z - 0.5), V3(REG.x - 0.24, REG.y + 0.5, REG.z - 0.05), V3(REG.x + 0.24, REG.y + 0.5, REG.z - 0.05)], 1.0, 0.25, 0.07); lerpCam(sh, Math.min(1, dt * 5)); regDisp.scale.set(port ? 0.36 : 0.46, port ? 0.133 : 0.17, 1); }
    else if (S.react) { S.react.t += dt; const o = S.react.o, f = o.f.position, sh = shotFor('react' + o.spot, () => [V3(f.x - 1.0, 0.7, f.z), V3(f.x + 1.0, 0.7, f.z), V3(f.x, 2.6, f.z), V3(f.x, K.PY, K.PZ)], 0.3, 0.12, 0.12); lerpCam(sh, Math.min(1, dt * 5)); if (S.react.t > (DM.on ? 2.0 : 2.4)) reactDone(); }
    else if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); }
    else if ((S.phase === 'intro' || S.phase === 'done') && !DM.on) lerpCam(wideShot(), Math.min(1, dt * 4));
    else if (S.phase === 'shift' || S.phase === 'glide') lerpCam(workShot(), Math.min(1, dt * 3.2));
    { const hide = S.phase === 'intro' || S.phase === 'done' || (S.phase === 'glide' && CAM.t < 0.5); K.front.forEach(m => m.visible = !hide); }
    camera.lookAt(CAM.look);
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) { S.phase = 'shift'; S.next = 99; newOrder(); S.next = S.demo ? 6 : 9; flash('DOORS OPEN!', '#22c55e', 1.4); snd.play('gong'); snd.music('shift'); try { audio.water.gain.setTargetAtTime(0.03, audio.ctx.currentTime, 0.5); } catch (e) {} } }
    { const hide = (S.phase === 'shift' || S.phase === 'glide') && (CAM.t > 0.35 || !CAM.from); K.cut.forEach(m => m.visible = !hide); glows.forEach(s => s.visible = !(hide && s.userData.cut)); }
    stepAmbient(dt); if (kitsu.visible) kit.animFox(kitsu, dt, 0);
    const wk = S.phase === 'shift';
    if (wk) { S.t += dt; if (S.t >= RAMEN.shift && !DM.on) endShift(); }
    if (wk) stepHold(dt);
    // baskets: cook + gauges
    const want = wantDone(); if (wk) snd.boil(dt, baskets.filter((B, i) => i < NB() && B.st === 'cook').length);
    baskets.forEach((B, i) => { const on = i < NB(); B.g.visible = on; if (!on) return; if (B.st === 'cook' && wk) { B.v = Math.min(1.05, B.v + dt / (DM.on ? 9 : 15)); if (upg('bell') && want && !B.rung && doneOf(B.v) === want) { B.rung = true; snd.play('bell'); snd.buzz([10, 60, 10]); flash('DING! ' + DONE[want].name, '#22c55e', 0.9); } if (B.v >= 1 && !B.mushed) { B.mushed = true; flash('MUSHY NOODLES! LIFT THEM', '#ec3013', 1.2); } if (Math.random() < dt * 3) steam(K.slots[i].x, T + 0.3, K.slots[i].z, 1); }
      const ty = B.st === 'up' ? T + 0.42 : T + 0.12; B.bob = Math.max(0, B.bob - dt * 5); B.g.position.y = damp(B.g.position.y, ty + B.bob * 0.08, 12, dt); B.gauge.visible = B.st !== 'empty' && wk; B.gauge.position.set(K.slots[i].x, B.g.position.y + 0.36, K.slots[i].z + 0.12); { const gw = clamp(camera.position.distanceTo(B.gauge.position) * 0.05, 0.07, 0.2); B.gauge.scale.set(gw, gw, 1); } if (B.gauge.visible && !B.tagDrawn) drawTag(B); if (B.st === 'up' && B.shakes < 3 && Math.random() < dt * 8) puff(K.slots[i].x + rr(-0.06, 0.06), B.g.position.y - 0.02, K.slots[i].z, 0xbfe4f0, 1); if (B.st === 'empty') B.mushed = false; });
    // ladle + stream while pouring
    { const H = S.hold; ladle.visible = !!H; stream.visible = false; if (H) { const pk = K.pots[H.k], k = clamp(H.t * 3, 0, 1), from = V3(pk.x, T + 0.4, pk.z), to = V3(K.mat.x - 0.05, T + 0.42, K.mat.z - 0.08); ladle.position.lerpVectors(from, to, k); ladle.rotation.z = k * -1.1; if (k >= 1) { stream.visible = true; const top = ladle.position.y - 0.02, bot = T + 0.02 + bowlG.userData.surfY(Math.min(1, S.bowl ? S.bowl.lvl : 0)), h = Math.max(0.02, top - bot); stream.scale.set(1 + Math.sin(tNow * 40) * 0.15, h, 1); stream.position.set(to.x + 0.04, bot + h / 2, to.z + 0.04); } } }
    stepPass(dt);
    if (DM.on) demoStep(dt);
    updHint(dt); if (wk) autoFollow();
    regDisp.visible = !!(S.pay || S.payOut); drawer.position.z = damp(drawer.position.z, REG.z - 0.05 - (S.pay ? 0.26 : 0), 10, dt);
    for (const m of coinsOut) { if (m.userData.t < 1) { m.userData.t = Math.min(1, m.userData.t + dt / 0.35); const k = m.userData.t, a = V3(drawer.position.x, drawer.position.y + 0.08, drawer.position.z); m.position.lerpVectors(a, m.userData.target, k); m.position.y += Math.sin(k * Math.PI) * 0.12; m.rotation.x = k * 6; if (k >= 1) { m.rotation.x = 0; tone(2400 + Math.random() * 400, 0.04, 0.03, 'square'); } } }
    if (S.payOut) { S.payOut.t += dt; const o = S.payOut.o; if (o) { const to = V3(o.f.position.x, K.PY + 0.03, K.PZ + 0.1); coinsOut.forEach(m => m.position.lerp(to, Math.min(1, dt * 4))); if (RG.bill()) RG.bill().position.lerp(V3(REG.x, REG.y + 0.02, REG.z - 0.2), Math.min(1, dt * 6)); } if (S.payOut.t > 1.1) { S.payOut = null; payProps(null); } }
    // customers
    if (wk) { S.next -= dt; const maxQ = Math.min(4, 1 + Math.ceil(S.day / 2)); if (S.next <= 0 && orders.filter(o => o.st !== 'leave').length < maxQ && S.t < RAMEN.shift - 14) { newOrder(); S.next = Math.max(10, 20 - S.day * 1.5) * rr(0.8, 1.2); } }
    for (let i = orders.length - 1; i >= 0; i--) { const o = orders[i], sp = SEATS[o.spot], P = o.f.userData.P; o.t = (o.t || 0) + dt; let spd = 0;
      if (o.st === 'walk' || o.st === 'leave') { const tg = o.path[0]; if (tg) { const dx = tg.x - o.f.position.x, dz = tg.z - o.f.position.z, d = Math.hypot(dx, dz); if (d < 0.08) o.path.shift(); else { const s = Math.min(d, dt * (o.st === 'walk' ? 3.4 : 2.4)); o.f.position.x += dx / d * s; o.f.position.z += dz / d * s; o.f.rotation.y = damp(o.f.rotation.y, Math.atan2(dx, dz), 10, dt); spd = 2; } }
        if (!o.path.length) { if (o.st === 'walk') { o.st = 'wait'; o.f.rotation.y = Math.PI; say(CUSTOMERS[o.ci].name + ': "' + o.line + '"', 3); tone(1046, 0.06, 0.03); } else { o.f.visible = false; orders.splice(i, 1); continue; } } }
      if (o.st === 'wait' || o.st === 'eat' || o.st === 'eating') { o.f.position.set(sp.x, sp.y - 0.46, sp.z); o.f.rotation.y = Math.PI; }
      kit.animFox && kit.animFox(o.f, dt, spd); if (o.st === 'wait' || o.st === 'eat' || o.st === 'eating') P.legs.forEach(l => l.rotation.x = -1.45);
      if (o.st === 'wait' && wk) { o.pat -= DM.on ? 0 : dt; o.f.userData.mood = o.pat / o.patMax < 0.3 ? 'stern' : o.pat / o.patMax < 0.6 ? 'neutral' : 'happy'; if (o.pat <= 0) { o.st = 'leave'; o.t = 0; S.lost++; S.combo = 0; o.path = [V3(sp.x, 0, K.SZ + 0.9), V3(K.door.x, 0, K.door.z - 0.6), V3(K.door.x, 0, K.door.z + 1.5)]; flash(CUSTOMERS[o.ci].name + ' LEFT · ' + pick(LINES.angry), '#ec3013', 1.8); snd.play('walkout'); } }
      if (o.st === 'eat' || o.st === 'eating') { P.arms[1].rotation.x = -1.2 + Math.sin(o.t * 10) * 0.25; P.arms[0].rotation.x = -0.8; if (o.served && Math.random() < dt * 4) steam(o.served.position.x, K.PY + 0.25, o.served.position.z, 1); }
      if (o.st === 'eating' && o.t > 2.6) { o.st = 'leave'; if (o.served) { scene.remove(o.served); o.served = null; } o.f.userData.mood = 'happy'; o.path = [V3(sp.x, 0, K.SZ + 0.9), V3(K.door.x, 0, K.door.z - 0.6), V3(K.door.x, 0, K.door.z + 1.5)]; } }
    const greet = S.phase === 'intro' || S.phase === 'done'; ben.rotation.y = damp(ben.rotation.y, 0.35, 4, dt); ben.userData.mood = greet ? 'excited' : 'happy'; if (ben.visible) kit.animFox(ben, dt, 0);
    if (greet && BP.arms && BP.arms[0]) { const w = performance.now() / 1000; BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(w * 7) * 0.32); }
  }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  function hud() {
    const ticket = o => ({ id: o.id, name: CUSTOMERS[o.ci].name, broth: BROTHS[o.broth].name, brothCol: BROTHS[o.broth].col, done: DONE[o.done].name, doneCol: DONE[o.done].col, tops: o.tops.map(k => TOPS[k].name), total: o.total, pat: Math.max(0, o.pat / o.patMax), waiting: o.st === 'wait' });
    const b = S.bowl, H = S.hold, want0 = wantDone();
    const press = H && b ? { label: BROTHS[H.k].name + ' BROTH', d: Math.min(1, b.lvl / 1.05), zone: pourZone(b.lvl), want: 'GOOD', zones: [{ name: 'LOW', w: Math.round(BROTH_OK[0] / 1.05 * 100), col: '#9ca3af' }, { name: 'GOOD', w: Math.round((BROTH_OK[1] - BROTH_OK[0]) / 1.05 * 100), col: '#22c55e', want: true }, { name: 'FULL', w: 100 - Math.round(BROTH_OK[1] / 1.05 * 100), col: '#ec3013' }] } : null;
    const nUp = baskets.filter((B, i) => i < NB() && B.st === 'up').length, nCook = baskets.filter((B, i) => i < NB() && B.st === 'cook').length;
    const walkHud = S.phase === 'walk' ? { prompt: Wk.near ? 'TALK · ' + Wk.near.name : null, dialog: Wk.dlg ? { name: Wk.dlg.name, role: Wk.dlg.role, text: Wk.dlg.showChoices ? '' : Wk.dlg.lines[Wk.dlg.i], choices: Wk.dlg.showChoices ? Wk.dlg.choices.map((c, i) => ({ text: c.text, asked: !!(Wk.dlg.asked && Wk.dlg.asked[i]), bye: !!c.bye })) : null, step: Wk.dlg.i + 1, total: Wk.dlg.lines.length, more: !!Wk.dlg.choices && !Wk.dlg.ended } : null, toast: Wk.toast || null, place: Wk.place, sitting: !!Wk.sit, quest: Wk.sit ? (Wk.eat ? 'Slurping a bowl at the bar · move to stand up' : 'Sitting · press 2 or move to stand up') : Wk.z > K.D / 2 ? 'Walk in through the noren (the blue curtains)' : 'Talk to KITSU at the counter to work a shift' } : null;
    return { phase: S.phase, walk: walkHud, day: S.day, left: Math.max(0, RAMEN.shift - S.t), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: S.starList.length ? Math.round(S.starList.reduce((a, c) => a + c, 0) / S.starList.length * 10) / 10 : 0, combo: S.combo,
      orders: orders.filter(o => o.st === 'wait' || o.st === 'walk').sort((a, c) => a.spot - c.spot).map(ticket),
      baskets: baskets.filter((B, i) => i < NB() && B.st !== 'empty').map(B => ({ n: B.i + 1, st: B.st, v: Math.min(1, B.v), done: DONE_NAME(doneOf(B.v)), shakes: B.shakes })), want: want0 ? { name: DONE[want0].name, z: DONE[want0].z } : null,
      bowl: b ? { broth: b.broth ? BROTHS[b.broth].name : '', lvl: b.lvl, zone: b.broth ? pourZone(b.lvl) : '', noodle: b.noodle ? DONE_NAME(b.noodle.done) + (b.noodle.drained ? '' : ' · WET') : '', tops: b.tops.map(t => TOPS[t.k].name) } : null, pass: pass.length,
      audio: snd.state(), pay: S.pay ? { ...S.pay } : null, flash: S.flash, say: S.say, done: S.done, gold: save.data.gold, uniform: !!save.flag('ramenUniform'),
      upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), menu: brothsAvail().map(k => ({ name: BROTHS[k].name, price: BROTHS[k].price })), tops: topsAvail().map(k => TOPS[k].name), dones: donesAvail().map(k => DONE[k].name),
      demo: DM.on ? { cap: DM.cap, key: DM.key, n: DM.served, of: 2 } : null, focus: S.focus, press,
      hint: HINT && HINT.text && !S.reveal && !S.react ? { text: HINT.text, station: HINT.station } : null,
      reveal: S.reveal && b ? { broth: BROTHS[b.broth].name, lvl: pourZone(b.lvl), done: DONE_NAME(b.noodle.done), drained: b.noodle.drained, cut: b.noodle.cut, tops: b.tops.map(t => TOPS[t.k].name), spread: spreadOf(b), who: S.reveal.who, ok: !!S.reveal.oid, g: S.reveal.g, want: S.reveal.want ? { done: DONE[S.reveal.want.done].name, tops: S.reveal.want.tops.map(k => TOPS[k].name) } : null } : null,
      react: S.react ? { word: S.react.word, col: S.react.col, line: S.react.line, who: S.react.who, stars: S.react.stars, tip: S.react.tip } : null,
      badges: { noodle: S.dough ? S.dough.cuts + ' / ' + CUTS() : S.nest ? 'NEST!' : '', boil: nUp ? (baskets.some(B => B.st === 'up' && B.shakes < 3) ? 'SHAKE' : 'READY') : nCook ? 'COOKING ' + nCook : '', bowl: H ? 'POURING' : b ? (b.noodle ? 'NOODLES IN' : b.broth ? 'BROTH' : 'EMPTY') : '', top: b && b.noodle ? (b.tops.length ? b.tops.length + ' ON' : 'READY') : '', serve: pass.length ? 'ON BAR ' + pass.length : '', all: waiting().length ? waiting().length + ' WAIT' : '' } }; }
  function emit() { onState(hud()); }
  if (S.phase === 'walk') { benW.visible = true; ben.visible = false; benW.position.set(Wk.x, 0, Wk.z); camera.position.set(Wk.x, 4.5, Wk.z + 6); CAM.look.set(Wk.x, 1.1, Wk.z); } else { benW.visible = false; benAtCounter(); camera.position.set(2.0, 2.2, K.SZ + 4); CAM.look.set(2.3, 1.2, K.SZ); setUniform(true); }
  camera.lookAt(CAM.look); frame();
  const api = {
    setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    revealChoice: c => S.reveal && revealDone(c), setFocus, demoStart, demoStop, startShift, endShift, giveCoin, buyUpgrade, hud, openIntro, toWalk,
    toIntro() { if (S.phase === 'done') { S.phase = 'intro'; S.done = null; benAtCounter(); glideTo(wideShot(), 1); } },
    // ENGINE CONTRACT for Game HUD (walk mode)
    start() {}, talk, choose, closeDialog, nextLine, clearToast() { Wk.toast = ''; Wk.toastT = 0; }, melee: wave, range: sitBtn, jump, meleeUp() {}, useItem() { walkToast('No snacks from outside! (Kitsu is watching.)', 2); }, closeWheel() {}, skipTime() {},
    setPaused(v) { PAUSE = !!v; }, setHudPad() {}, setStick(x, y) { Wk.stick.x = x; Wk.stick.y = y; }, eyeLook() {}, eyeRelease() {}, togglePov() { return false; },
    lookBy(dx, dy) { Wk.yaw -= dx * 0.006; Wk.pitch = clamp(Wk.pitch + dy * 0.004, 0.25, 0.95); }, zoomBy(f) { Wk.dist = clamp(Wk.dist * f, 3.2, 9); }, getCam() { return { dist: Wk.dist, pitch: Wk.pitch }; }, setCam(d, p) { if (d) Wk.dist = d; if (p) Wk.pitch = p; },
    mapData() { return { p: [Wk.x, Wk.z, Wk.face], b: [['COUNTER', 0, K.PZ], ['DOOR', K.door.x, K.door.z], ['TABLES', -4.6, 1.8]], f: [[kitsu.position.x, kitsu.position.z], ...AMB.map(a => [a.f.position.x, a.f.position.z])], e: [], q: S.phase === 'walk' ? [K.kitsuSpot.x, K.SZ, 'KITSU'] : null }; },
    setMinimap() {}, toggleSound() { const st = snd.state(); snd.setSound(!st.sound); snd.setMusic(!st.sound); }, cycleWeather() {},
    setSound: v => snd.setSound(v), setMusic: v => snd.setMusic(v), cycleAudio() { const st = snd.state(); if (st.sound && st.music) snd.setMusic(false); else if (st.sound) snd.setSound(false); else { snd.setSound(true); snd.setMusic(true); } audioGo(); return snd.state(); },
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); emit(); }, _skip(t) { S.t = Math.max(S.t, RAMEN.shift - t); }, _state: () => S, _walk: () => Wk, _K: K,
    _auto() { return { orders, pass, baskets, K, getDough, cutOnce, dropNest, liftBasket, shakeBasket, basketToBowl, placeBowl, startPour, releaseHold, addTop, revealBowl, flickPass, sendTo, scr, SEATS }; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); removeEventListener('pointerdown', audioGo, true); removeEventListener('keydown', audioGo, true); document.removeEventListener('visibilitychange', onVis); snd.destroy(); removeEventListener('pointerdown', wDown, true); removeEventListener('pointermove', wMove, true); removeEventListener('pointerup', wUp, true); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
