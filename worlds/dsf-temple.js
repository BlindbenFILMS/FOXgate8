// TEMPLE OF GAYA [dsfTemple] interior (s350): the candle-lit shrine. Keeper Opa lit the FIRST FLAME the day the yards went quiet
// and it has not been out since (2D bio). Built far from the ring at (OX, 0, 0); promenade door south (z = +hd).
// The flame burns in a bronze bowl on a dais (north) ringed by EIGHT standing stones (THE EIGHT); rows of votive candles,
// kneeling cushions, hanging lanterns, warm haze. KNEEL at the flame + LIGHT A CANDLE (adds one to the votive rack, saved).
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
export const TP = { OX: 4400, hw: 11, hd: 10, h: 8, door: { x: 0, z: 9.2 }, enter: { x: 0, z: 6.2 }, flame: { x: 0, z: -5.2 }, kneel: { x: 0, z: -0.6 }, votive: { x: 7.4, z: 1.0 }, keeper: { x: -3.2, z: -3.4 }, shrine: { x: -7.4, z: -3.4 }, hiring: { x: -10.0, z: 5.0 } };
export function buildTemple(K, lit = 0) {
  const { THREE, scene, M, BOX, toon, basic, rnd, rr, pick, LOW } = K;
  const g = new THREE.Group(); g.position.set(TP.OX, 0, 0); scene.add(g);
  const anims = [], blocks = [], circles = [];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, p = g) => M(BOX(w, h, d), mat, x, y, z, p, 0);
  const C = (r1, r2, h, mat, x, y, z, seg = 16, p = g) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0);
  const plane = (w, h, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#1a1008') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry); };
  const { hw, hd, h } = TP, gold = '#f2d98b', bronze = toon('#8a5a2a'), stone = toon('#6a5a48');
  // shell: warm flagstones, ochre walls, a timber-beamed ceiling
  const flag = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#5a4632'; c.fillRect(0, 0, w, w); c.strokeStyle = '#3a2a1c'; c.lineWidth = 4; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = pick(['#5e4a36', '#56422e', '#62503a']); c.fillRect(x * 64 + 2 + (y % 2) * 32, y * 64 + 2, 60, 60); } }));
  flag.wrapS = flag.wrapT = THREE.RepeatWrapping; flag.repeat.set(hw / 3, hd / 3);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#ffffff', { map: flag })); f.rotation.x = -Math.PI / 2; g.add(f); }
  B(2.4, 0.02, hd * 1.2, toon('#7a2a1a'), 0, 0.012, 3.0); for (const s of [-1, 1]) B(0.12, 0.022, hd * 1.2, toon(gold), s * 1.2, 0.012, 3.0);
  const wallM = toon('#3a2a18');
  B(hw * 2, h, 0.3, wallM, 0, h / 2, -hd); for (const s of [-1, 1]) B(0.3, h, hd * 2, wallM, s * hw, h / 2, 0);
  B(hw - 1.6, h, 0.3, wallM, -(hw + 1.6) / 2, h / 2, hd); B(hw - 1.6, h, 0.3, wallM, (hw + 1.6) / 2, h / 2, hd); B(3.2, h - 3.6, 0.3, wallM, 0, 3.6 + (h - 3.6) / 2, hd);
  for (const s of [-1, 1]) B(0.18, 3.6, 0.36, toon(gold), s * 1.6, 1.8, hd); B(3.4, 0.18, 0.36, toon(gold), 0, 3.6, hd);
  { const ce = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#24180e', { side: THREE.DoubleSide })); ce.rotation.x = Math.PI / 2; ce.position.y = h; g.add(ce); }
  for (let z = -hd + 2; z < hd; z += 3) B(hw * 2, 0.4, 0.4, toon('#2a1a0e'), 0, h - 0.2, z);
  // tall banners on the side walls (the eight gates as gold bars)
  for (const s of [-1, 1]) for (const z of [-4, 2]) { const bt = tex(canvas(128, 512, (c, w, hh) => { c.fillStyle = '#7a2a1a'; c.fillRect(0, 0, w, hh); c.fillStyle = gold; for (let i = 0; i < 8; i++) c.fillRect(28, 40 + i * 52, 72, 18); c.fillRect(0, hh - 30, w, 8); })); plane(1.4, 5.0, new THREE.MeshBasicMaterial({ map: bt }), s * (hw - 0.17), 4.2, z, -s * Math.PI / 2); }
  sign(['TEMPLE OF GAYA', 'THE FIRST FLAME · KEEPER OPA'], 7.5, 1.4, gold, 0, 6.6, -hd + 0.18);
  // the dais, the bronze bowl and THE FIRST FLAME, ringed by eight standing stones
  const F = TP.flame; C(3.6, 3.9, 0.4, stone, F.x, 0.2, F.z, 32); C(3.0, 3.2, 0.3, toon('#7a6a54'), F.x, 0.55, F.z, 32);
  C(0.9, 0.5, 0.6, bronze, F.x, 1.0, F.z, 20); C(0.3, 0.4, 0.5, bronze, F.x, 0.55, F.z, 12);
  const flames = []; for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.42 - i * 0.08, 1.2 - i * 0.15, 10), new THREE.MeshBasicMaterial({ color: [0xff7a1a, 0xffa33a, 0xffd36a, 0xfff2c0][i], transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })); f.position.set(F.x, 1.85, F.z); g.add(f); flames.push(f); }
  const haze = new THREE.Mesh(new THREE.SphereGeometry(2.6, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false })); haze.position.set(F.x, 2.0, F.z); g.add(haze);
  let flareK = 0; // s359: the First Flame flares when the Shrine Candles rite is kept
  anims.push((dt, t) => { flareK = Math.max(0, flareK - dt * 0.4); const fk = 1 + flareK * 0.7; flames.forEach((f, i) => { f.scale.set((1 + Math.sin(t * 7 + i) * 0.08) * fk, (1 + Math.sin(t * 9.3 + i * 2) * 0.16) * fk, (1 + Math.cos(t * 6.1 + i) * 0.08) * fk); f.rotation.y = t * (0.4 + i * 0.2); }); haze.material.opacity = 0.07 + Math.sin(t * 3.1) * 0.02 + flareK * 0.12; });
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8, x = F.x + Math.sin(a) * 3.3, z = F.z + Math.cos(a) * 3.3, ht = 2.2 + (i % 2) * 0.5; const st = B(0.55, ht, 0.4, stone, x, 0.7 + ht / 2, z); st.rotation.y = a; B(0.2, 0.2, 0.42, toon(gold), x, 0.7 + ht - 0.4, z).rotation.y = a; }
  circles.push([F.x, F.z, 3.9]);
  // kneeling cushions before the dais
  for (const x of [-1.6, 0, 1.6]) { const k = C(0.45, 0.5, 0.18, toon('#7a2a1a'), x, 0.09, TP.kneel.z, 16); void k; }
  sign(['KNEEL', 'BEFORE THE FLAME'], 1.6, 0.7, gold, 2.8, 1.4, TP.kneel.z + 0.3, -0.3);
  // the votive rack (east): stepped shelves of candles; a candle you light is added and stays (save)
  const V = TP.votive; for (let i = 0; i < 3; i++) B(1.0 - i * 0.0, 0.3, 3.4, toon('#4a3018'), V.x + 0.6 - i * 0.45, 0.4 + i * 0.4, V.z); blocks.push([V.x - 0.6, V.x + 1.2, V.z - 1.8, V.z + 1.8]);
  const cand = [], fm = new THREE.MeshBasicMaterial({ color: 0xffcf7a, toneMapped: false });
  const slots = []; for (let i = 0; i < 3; i++) for (let k = 0; k < 9; k++) slots.push([V.x + 0.6 - i * 0.45, 0.62 + i * 0.4, V.z - 1.5 + k * 0.375]);
  const addCandle = (s, on) => { const c = C(0.05, 0.05, 0.2, toon('#f3efe4'), s[0], s[1], s[2], 8); const f = M(new THREE.SphereGeometry(0.055, 8, 6), fm, s[0], s[1] + 0.16, s[2], g, 0); f.visible = on; cand.push(f); void c; };
  const base = LOW ? 10 : 18; slots.forEach((s, i) => addCandle(s, i < base + lit));
  anims.push((dt, t) => { cand.forEach((f, i) => { if (f.visible) f.scale.y = 1 + Math.sin(t * 10 + i * 1.7) * 0.3; }); });
  sign(['LIGHT A CANDLE', 'FOR SOMEONE FAR AWAY'], 1.8, 0.8, gold, V.x - 1.0, 1.9, V.z + 2.1, -Math.PI / 4);
  // hanging lanterns + the offering bowl by the door
  for (const [x, z] of [[-6, -6], [6, -6], [-6, 2], [6, 2], [-6, 6.5], [6, 6.5]]) { B(0.03, 2.4, 0.03, toon('#2a1a0e'), x, h - 1.2, z); const ln = M(new THREE.SphereGeometry(0.3, 10, 8), basic('#ffb454'), x, h - 2.6, z, g, 0); anims.push((dt, t) => { ln.position.x = x + Math.sin(t * 0.8 + z) * 0.04; }); }
  C(0.6, 0.4, 0.8, bronze, -5.5, 0.4, 6.0, 16); C(0.55, 0.55, 0.05, toon('#c9a24a'), -5.5, 0.82, 6.0, 16); circles.push([-5.5, 6.0, 0.7]);
  // low benches either side of the runner
  for (const s of [-1, 1]) for (const z of [1.5, 4.5]) { B(4.0, 0.45, 0.8, toon('#4a3018'), s * 4.4, 0.23, z); blocks.push([s * 4.4 - 2.0, s * 4.4 + 2.0, z - 0.4, z + 0.4]); }
  // warm dust in the flame light
  if (!LOW) { const n = 50, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(-5, 5); pos[i * 3 + 1] = rr(0.6, 6); pos[i * 3 + 2] = rr(-8, 2); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.05, transparent: true, opacity: 0.6, depthWrite: false })); g.add(pts); anims.push((dt, t) => { pts.position.y = Math.sin(t * 0.25) * 0.3; pts.rotation.y = t * 0.015; }); }
  function light() { const next = cand.find(f => !f.visible); if (next) next.visible = true; return !!next; }
  function walk(x, z) { if (x < -hw + 0.5 || x > hw - 0.5 || z < -hd + 0.6 || z > hd - 0.4) return Math.abs(x) < 1.4 && z > hd - 0.4 && z < hd + 0.8; for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false; for (const [cx, cz, r] of circles) if (Math.hypot(x - cx, z - cz) < r + 0.3) return false; return true; }
  return { g, anims, walk, light, blocks, flare() { flareK = 1; } };
}
