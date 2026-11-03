// SECURITY · BRIG [dsfSecurity] interior (s350): Warf + ODD the O's office on the west side of the ring.
// Built far from the ring at (OX, 0, 0); promenade door south (z = +hd). Red-brown, hard-edged. The duty desk + camera wall
// (CARGO BAY 4 · CAM 2 shows the three loaders, eyes flickering red to cyan: the hack, Machine Fleet arc), the BRIG: two
// cells behind amber force fields (Rosk in cell 1, from the 2D), the weapon locker, the incident board.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
export const SB = { OX: 5000, hw: 12, hd: 9, h: 6, door: { x: 0, z: 8.2 }, enter: { x: 0, z: 5.4 }, warf: { x: -4.2, z: -2.6 }, odd: { x: 3.0, z: -2.8 }, rosk: { x: 3.0, z: -5.4 }, scan: { x: -6.6, z: 4.6 } };
export function buildSecurity(K) {
  const { THREE, scene, M, BOX, toon, basic, rnd, rr, pick, LOW } = K;
  const g = new THREE.Group(); g.position.set(SB.OX, 0, 0); scene.add(g);
  const anims = [], blocks = [], circles = [];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, p = g) => M(BOX(w, h, d), mat, x, y, z, p, 0);
  const C = (r1, r2, h, mat, x, y, z, seg = 16, p = g) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0);
  const plane = (w, h, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#140a08') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry); };
  const { hw, hd, h } = SB, red = '#ff8a6a', trim = toon('#1a1414');
  const deck = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#3a3230'; c.fillRect(0, 0, w, w); c.strokeStyle = '#241e1c'; c.lineWidth = 3; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, w); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } c.fillStyle = '#4a403c'; for (let i = 0; i < 16; i++) c.fillRect((i % 4) * 64 + 28, ((i / 4) | 0) * 64 + 28, 8, 8); }));
  deck.wrapS = deck.wrapT = THREE.RepeatWrapping; deck.repeat.set(hw / 2, hd / 2);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#ffffff', { map: deck })); f.rotation.x = -Math.PI / 2; g.add(f); }
  const wallM = toon('#3a1e1a');
  B(hw * 2, h, 0.3, wallM, 0, h / 2, -hd); for (const s of [-1, 1]) B(0.3, h, hd * 2, wallM, s * hw, h / 2, 0);
  B(hw - 1.6, h, 0.3, wallM, -(hw + 1.6) / 2, h / 2, hd); B(hw - 1.6, h, 0.3, wallM, (hw + 1.6) / 2, h / 2, hd); B(3.2, h - 3.4, 0.3, wallM, 0, 3.4 + (h - 3.4) / 2, hd);
  for (const s of [-1, 1]) B(0.16, 3.4, 0.36, basic(red), s * 1.6, 1.7, hd); B(3.4, 0.16, 0.36, basic(red), 0, 3.4, hd);
  { const ce = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#1e1614', { side: THREE.DoubleSide })); ce.rotation.x = Math.PI / 2; ce.position.y = h; g.add(ce); }
  for (const x of [-7, 0, 7]) for (const z of [-4, 3]) B(2.6, 0.06, 0.5, basic('#ffe0d0'), x, h - 0.04, z);
  for (const [x, z, w, d] of [[0, -hd + 0.17, hw * 2, 0.05], [-hw + 0.17, 0, 0.05, hd * 2], [hw - 0.17, 0, 0.05, hd * 2]]) B(w, 0.1, d, basic(red, 0.9), x, 1.0, z);
  // yellow-black hazard line in front of the brig
  { const hz = tex(canvas(256, 32, (c, w, hh) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#1a1414' : '#f2c94c'; c.beginPath(); c.moveTo(i * 16, 0); c.lineTo(i * 16 + 16, 0); c.lineTo(i * 16 + 8, hh); c.lineTo(i * 16 - 8, hh); c.fill(); } })); hz.wrapS = THREE.RepeatWrapping; hz.repeat.set(4, 1); const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.3), toon('#ffffff', { map: hz })); m.rotation.x = -Math.PI / 2; m.position.set(5.4, 0.013, -3.9); g.add(m); }
  sign(['SECURITY', 'BRIG · LT. WARF · CONSTABLE ODD'], 8, 1.4, red, -3.4, 4.6, -hd + 0.18);
  // THE BRIG (north-east): two cells, back walls + dividers, amber force fields that shimmer
  const cell = (cx, n) => { B(0.3, h, 4.6, wallM, cx - 2.35, h / 2, -hd + 2.3); B(0.3, h, 4.6, wallM, cx + 2.35, h / 2, -hd + 2.3); B(3.2, 0.5, 1.0, toon('#4a403c'), cx, 0.35, -hd + 0.8); B(3.0, 0.12, 0.9, toon('#6a5a50'), cx, 0.66, -hd + 0.8);
    for (const s of [-1, 1]) B(0.2, h, 0.3, toon('#2a2222'), cx + s * 2.2, h / 2, -hd + 4.55); B(4.6, 0.3, 0.3, toon('#2a2222'), cx, 0.15, -hd + 4.55); B(4.6, 0.3, 0.3, toon('#2a2222'), cx, h - 0.6, -hd + 4.55);
    const ft = tex(canvas(128, 128, (c, w) => { c.fillStyle = 'rgba(255,170,60,0.0)'; c.fillRect(0, 0, w, w); c.strokeStyle = 'rgba(255,190,90,0.9)'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(0, i * 16); c.lineTo(w, i * 16); c.stroke(); } })); ft.wrapT = THREE.RepeatWrapping;
    const ff = plane(4.2, h - 0.9, new THREE.MeshBasicMaterial({ map: ft, color: 0xffa040, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), cx, (h - 0.6) / 2 + 0.15, -hd + 4.55);
    anims.push((dt, t) => { ft.offset.y = (t * 0.25) % 1; ff.material.opacity = 0.28 + Math.sin(t * 5 + cx) * 0.06 + (Math.random() < 0.01 ? 0.25 : 0); });
    sign(['CELL ' + n], 1.4, 0.5, red, cx, h - 0.25, -hd + 4.72); blocks.push([cx - 2.5, cx + 2.5, -hd, -hd + 4.75]); };
  cell(3.0, 1); cell(7.8, 2);
  // the duty desk + the camera wall (north-west); one feed is Cargo Bay Four: the loaders, eyes flickering
  B(5.0, 1.0, 1.2, toon('#2a2424'), SB.warf.x, 0.5, -1.2); B(5.2, 0.08, 1.4, basic(red, 0.6), SB.warf.x, 1.04, -1.2); blocks.push([SB.warf.x - 2.6, SB.warf.x + 2.6, -1.85, -0.55]);
  const feed = (x, y, label, robots) => { const cv = canvas(256, 160, () => {}), t = tex(cv), ctx = cv.getContext('2d'); let k = rnd() * 10;
    const draw = tt => { ctx.fillStyle = '#0c1410'; ctx.fillRect(0, 0, 256, 160); ctx.fillStyle = '#18261e'; ctx.fillRect(0, 100, 256, 60); ctx.strokeStyle = '#2e4a3a'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(128, 70); ctx.lineTo(i * 52, 160); ctx.stroke(); }
      if (robots) for (let i = 0; i < 3; i++) { const rx = 60 + i * 68; ctx.fillStyle = '#3a3e44'; ctx.fillRect(rx - 16, 64, 32, 46); ctx.fillRect(rx - 10, 46, 20, 18); const cyan = Math.sin(tt * 3 + i * 2.1) > 0.85; ctx.fillStyle = cyan ? '#7fe3ff' : '#ff3a2a'; ctx.fillRect(rx - 7, 52, 5, 4); ctx.fillRect(rx + 2, 52, 5, 4); }
      else for (let i = 0; i < 3; i++) { const px = (tt * 18 + i * 90 + k * 20) % 300 - 20; ctx.fillStyle = '#4a6a5a'; ctx.fillRect(px, 84, 8, 22); ctx.beginPath(); ctx.arc(px + 4, 80, 5, 0, 7); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let y2 = (tt * 40) % 4; y2 < 160; y2 += 4) ctx.fillRect(0, y2, 256, 1); ctx.font = `900 14px ${FONT}`; ctx.fillStyle = robots ? '#ff8a6a' : '#9fd8b0'; ctx.fillText(label, 8, 18); if (robots && Math.sin(tt * 3) > 0.85) { ctx.fillStyle = '#7fe3ff'; ctx.fillText('SIGNAL: NOT OURS', 8, 150); } t.needsUpdate = true; };
    let acc = 0; anims.push((dt, tt) => { acc += dt; if (acc > 0.1) { acc = 0; draw(tt); } }); draw(0);
    plane(2.0, 1.25, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, -hd + 0.18); };
  const FEEDS = [['PROMENADE · CAM 1', 0], ['CARGO BAY 4 · CAM 2', 1], ['PYLON ONE · CAM 3', 0], ['QUIRK\u2019S · CAM 4', 0], ['DOCKING RING · CAM 5', 0], ['HUB · CAM 6', 0]];
  FEEDS.forEach(([l, r], i) => feed(SB.warf.x - 2.2 + (i % 3) * 2.2, 2.0 + Math.floor(i / 3) * 1.4, l, r)); B(6.8, 3.0, 0.1, trim, SB.warf.x, 2.7, -hd + 0.12);
  // CARGO SCAN belt (s355) sits along the south-west: worlds/dsf-cargo-scan.js. The incident board (west wall, north half): the loaders flagged
  sign(['INCIDENTS', 'CARGO BAY 4: LOADERS L-1, L-2, L-3', 'ACTING ODD. VOICES NOT THEIR OWN.', 'STATUS: CORDONED. DO NOT ENGAGE.'], 3.6, 2.0, red, -hw + 0.18, 2.4, -4.6, Math.PI / 2);
  // weapon locker (east wall, south of the brig) + a bench of confiscated goods
  B(0.6, 2.6, 3.0, toon('#2a2424'), hw - 0.45, 1.3, 1.8); for (let i = 0; i < 5; i++) B(0.06, 1.6, 0.12, toon('#c8ccd2'), hw - 0.8, 1.5, 0.7 + i * 0.55); blocks.push([hw - 0.8, hw, 0.3, 3.3]);
  B(2.6, 0.8, 1.0, toon('#4a403c'), 7.6, 0.4, 5.6); for (let i = 0; i < 6; i++) B(rr(0.2, 0.45), rr(0.15, 0.35), rr(0.2, 0.4), toon(pick(['#c9a24a', '#6a3a6a', '#8a8f98', '#b3121b'])), 6.6 + i * 0.38, 0.9, 5.6 + rr(-0.3, 0.3)); blocks.push([6.3, 8.9, 5.1, 6.1]);
  sign(['CONFISCATED', 'ASK THE CONSTABLE'], 1.6, 0.6, red, 7.6, 1.6, 5.05, 0);
  function walk(x, z) { if (x < -hw + 0.5 || x > hw - 0.5 || z < -hd + 0.6 || z > hd - 0.4) return Math.abs(x) < 1.4 && z > hd - 0.4 && z < hd + 0.8; for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false; for (const [cx, cz, r] of circles) if (Math.hypot(x - cx, z - cz) < r + 0.3) return false; return true; }
  return { g, anims, walk, blocks };
}
