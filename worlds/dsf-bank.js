// LATINUM VAULT [dsfBank] interior (s351): the station bank. Black steel + gold. Teller counter (east) behind brass bars with
// Auditor Kess, an exchange-rate ticker (west wall), a slip desk, and the round VAULT DOOR in the north wall that swings open
// on request: latinum bar stacks and the deposit-box wall inside, BOX 8 = yours (glows). Deposit / withdraw = save.stats.dsfVault.
// Built far from the ring at (OX, 0, 0). Local frame: promenade door south (z = +hd).
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
export const BK = { OX: 9600, hw: 9, hd: 9, h: 5.6, door: { x: 0, z: 8.2 }, enter: { x: 0, z: 5.8 }, hiring: { x: -6.8, z: 6.4 }, keeper: { x: 6.3, z: -0.2 }, wall: -4.5, myBox: { x: 0, z: -7.9 } };
export function buildBank(K) {
  const { THREE, scene, M, BOX, toon, basic, rr, LOW } = K;
  const g = new THREE.Group(); g.position.set(BK.OX, 0, 0); scene.add(g);
  const anims = [], blocks = [], circles = [];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, p = g) => M(BOX(w, h, d), mat, x, y, z, p, 0);
  const C = (r1, r2, h, mat, x, y, z, seg = 16, p = g) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0);
  const plane = (w, h, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#111113') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry); };
  const { hw, hd, h, wall } = BK, GOLD = '#f2c94c', gold = toon(GOLD), steel = toon('#1c1c1e'), steel2 = toon('#2c2c30');
  // floor: dark marble squares with gold inlay lines
  const marble = tex(canvas(256, 256, (c, w) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#1a1a1c' : '#26262a'; c.fillRect(i * 128, j * 128, 128, 128); } c.strokeStyle = '#8a7330'; c.lineWidth = 3; c.strokeRect(0, 0, w, w); }));
  marble.wrapS = marble.wrapT = THREE.RepeatWrapping; marble.repeat.set(hw / 2, hd / 2);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#ffffff', { map: marble })); f.rotation.x = -Math.PI / 2; g.add(f); }
  B(2.2, 0.02, hd - wall - 1.5, toon('#5a1a1a'), 0, 0.012, (hd + wall) / 2 + 0.5); B(2.4, 0.019, hd - wall - 1.5, gold, 0, 0.01, (hd + wall) / 2 + 0.5);
  // shell (hall z wall..hd), gold dado + crown, south door
  for (const s of [-1, 1]) B(0.3, h, hd * 2, steel, s * hw, h / 2, 0);
  B(hw - 1.5, h, 0.3, steel, -(hw + 1.5) / 2, h / 2, hd); B(hw - 1.5, h, 0.3, steel, (hw + 1.5) / 2, h / 2, hd); B(3, h - 3.3, 0.3, steel, 0, 3.3 + (h - 3.3) / 2, hd);
  for (const s of [-1, 1]) B(0.16, 3.3, 0.36, basic(GOLD), s * 1.5, 1.65, hd); B(3.2, 0.16, 0.36, basic(GOLD), 0, 3.3, hd);
  for (const s of [-1, 1]) for (const y of [1.0, h - 0.2]) B(0.05, 0.1, hd * 2, gold, s * (hw - 0.17), y, 0);
  { const ce = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#121214', { side: THREE.DoubleSide })); ce.rotation.x = Math.PI / 2; ce.position.y = h; g.add(ce); }
  for (const [x, z] of [[-4, 0], [4, 0], [-4, 5], [4, 5], [0, 2.5]]) { B(0.03, 0.8, 0.03, gold, x, h - 0.4, z); C(0.5, 0.5, 0.08, gold, x, h - 0.84, z, 16); C(0.42, 0.42, 0.04, basic('#ffe9b0'), x, h - 0.9, z, 16); }
  // ---- the VAULT WALL (z = wall) with a round opening; thick steel ring frame
  const VR = 1.95, VY = 2.15;
  { const sh = new THREE.Shape(); sh.moveTo(-hw, 0); sh.lineTo(hw, 0); sh.lineTo(hw, h); sh.lineTo(-hw, h); sh.lineTo(-hw, 0); const hole = new THREE.Path(); hole.absarc(0, VY, VR + 0.05, 0, Math.PI * 2, true); sh.holes.push(hole);
    const wg = new THREE.ExtrudeGeometry(sh, { depth: 0.7, bevelEnabled: false, curveSegments: 32 }); const wm = new THREE.Mesh(wg, steel2); wm.position.set(0, 0, wall - 0.35); g.add(wm);
    const fr = new THREE.Mesh(new THREE.TorusGeometry(VR + 0.15, 0.16, 8, 40), gold); fr.position.set(0, VY, wall + 0.38); g.add(fr); }
  blocks.push([-hw, -1.5, wall - 0.4, wall + 0.4], [1.5, hw, wall - 0.4, wall + 0.4]);
  sign(['THE VAULT', 'NINE BOLTS · THREE LOCKS'], 3.6, 0.9, GOLD, 0, 4.85, wall + 0.37);
  // the door: a pivot on the east hinge, the disc + 9 bolts + a wheel, swings into the hall
  const piv = new THREE.Group(); piv.position.set(VR, VY, wall + 0.5); g.add(piv);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(VR, VR, 0.5, 40), toon('#3a3a40')); disc.rotation.x = Math.PI / 2; disc.position.set(-VR, 0, 0); piv.add(disc);
  { const face = new THREE.Mesh(new THREE.CircleGeometry(VR - 0.2, 40), toon('#4a4a52')); face.position.set(-VR, 0, 0.26); piv.add(face);
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, b = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10), gold); b.rotation.x = Math.PI / 2; b.position.set(-VR + Math.cos(a) * (VR - 0.32), Math.sin(a) * (VR - 0.32), 0.3); piv.add(b); } }
  const wheel = new THREE.Group(); wheel.position.set(-VR, 0, 0.34); piv.add(wheel);
  { const r = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 24), gold); wheel.add(r); for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(BOX(1.1, 0.07, 0.07), gold); s.rotation.z = i * Math.PI / 4; wheel.add(s); } const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 12), gold); hb.rotation.x = Math.PI / 2; wheel.add(hb); }
  const V = { open: false, a: 0, spin: 0 };
  // ---- inside the vault (z -hd..wall, x -4..4): side walls, latinum stacks, the deposit-box wall, warm light
  for (const s of [-1, 1]) B(0.3, h, hd + wall, steel2, s * 4.15, h / 2, (wall - hd) / 2);
  B(8.3, h, 0.3, steel2, 0, h / 2, -hd);
  const boxes = tex(canvas(512, 256, (c, W, H) => { c.fillStyle = '#6a5a2a'; c.fillRect(0, 0, W, H); for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) { c.fillStyle = '#b39340'; c.fillRect(i * 64 + 3, j * 64 + 3, 58, 58); c.fillStyle = '#4a3a18'; c.beginPath(); c.arc(i * 64 + 32, j * 64 + 32, 5, 0, 7); c.fill(); } }));
  plane(7.6, 3.8, toon('#ffffff', { map: boxes }), 0, 2.2, -hd + 0.17);
  const mine = B(0.9, 0.9, 0.1, basic('#ffe066'), BK.myBox.x, 1.3, -hd + 0.22); anims.push((dt, t) => { mine.material.color.setHSL(0.13, 1, 0.55 + Math.sin(t * 3) * 0.1); });
  sign(['BOX 8', 'STEWARD'], 1.1, 0.4, GOLD, BK.myBox.x, 2.0, -hd + 0.24);
  const bar = new THREE.BoxGeometry(0.42, 0.14, 0.2); const barM = toon('#e8c860');
  const stack = (x, z, n) => { B(1.8, 0.15, 1.2, toon('#3a2a1a'), x, 0.08, z); for (let l = 0; l < n; l++) for (let i = 0; i < 4 - l; i++) for (let j = 0; j < 3; j++) { const m = new THREE.Mesh(bar, barM); m.position.set(x - 0.66 + l * 0.22 + i * 0.44, 0.23 + l * 0.14, z - 0.4 + j * 0.4); g.add(m); } blocks.push([x - 1.0, x + 1.0, z - 0.7, z + 0.7]); };
  stack(-2.7, -6.4, LOW ? 2 : 4); stack(2.7, -6.4, LOW ? 2 : 4);
  const vLight = new THREE.PointLight(0xffd27a, 0, 9, 1.6); vLight.position.set(0, h - 0.6, -6.6); g.add(vLight);
  // ---- teller counter (east) behind brass bars, Kess stands behind it
  B(1.1, 1.1, 6.4, toon('#2a2018'), 5.0, 0.55, -0.2); B(1.3, 0.08, 6.6, gold, 5.0, 1.14, -0.2); blocks.push([4.4, 5.6, -3.5, 3.1]);
  for (let i = 0; i < 13; i++) C(0.025, 0.025, 1.5, gold, 4.72, 1.93, -3.2 + i * 0.5, 6); B(0.05, 0.06, 6.4, gold, 4.72, 2.7, -0.2);
  plane(6.4, 1.5, new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }), 4.78, 1.93, -0.2, Math.PI / 2);
  B(0.5, 0.4, 0.6, toon('#111'), 5.15, 1.38, 1.2); const coins = []; for (let i = 0; i < 5; i++) coins.push(C(0.09, 0.09, 0.05 + i * 0.012, gold, 5.2, 1.21, -1.0 + i * 0.22, 10));
  sign(['TELLER', 'DEPOSIT · WITHDRAW'], 2.6, 0.8, GOLD, 4.4, 3.3, -0.2, -Math.PI / 2);
  // brass queue posts + red rope along the counter's south end
  for (const z of [3.6, 6.0]) { C(0.06, 0.06, 0.95, gold, 3.6, 0.48, z, 8); M(new THREE.SphereGeometry(0.09, 8, 6), gold, 3.6, 1.0, z, g, 0); circles.push([3.6, z, 0.2]); }
  { const rp = C(0.04, 0.04, 2.4, toon('#8a1a1a'), 3.6, 0.82, 4.8, 6); rp.rotation.x = Math.PI / 2; blocks.push([3.5, 3.7, 3.6, 6.0]); }
  // ---- west: the exchange ticker (scrolls), a slip desk, a bench
  const tick = tex(canvas(2048, 128, (c, W, H) => { c.fillStyle = '#0b0b0c'; c.fillRect(0, 0, W, H); c.font = `900 64px ${FONT}`; c.textBaseline = 'middle'; let x = 20; for (const [n, v, up] of [['GOLD', '1.00', 1], ['LATINUM', '0.98', 0], ['KUFA COPPER', '1.12', 1], ['GAYAN SILK', '0.87', 0], ['MERU GRAIN', '1.03', 1], ['RELIC SHARDS', '2.40', 1], ['NEBO SUGAR', '0.95', 0]]) { c.fillStyle = '#f3f2f2'; c.fillText(n, x, H / 2); x += c.measureText(n).width + 16; c.fillStyle = up ? '#44e27a' : '#ff5a3a'; const s = (up ? '\u25B2 ' : '\u25BC ') + v; c.fillText(s, x, H / 2); x += c.measureText(s).width + 60; } }));
  tick.wrapS = THREE.RepeatWrapping; tick.repeat.set(0.6, 1);
  B(0.1, 1.1, 7.4, gold, -hw + 0.2, 3.7, 0.8); plane(7.2, 0.9, new THREE.MeshBasicMaterial({ map: tick, toneMapped: false }), -hw + 0.27, 3.7, 0.8, Math.PI / 2);
  anims.push(dt => { tick.offset.x = (tick.offset.x + dt * 0.04) % 1; });
  sign(['EXCHANGE', 'RATES TO GOLD'], 2.0, 0.6, GOLD, -hw + 0.27, 4.65, -2.0, Math.PI / 2);
  B(2.2, 1.0, 0.9, toon('#2a2018'), -5.2, 0.5, 0.6); B(2.3, 0.06, 1.0, gold, -5.2, 1.03, 0.6); blocks.push([-6.3, -4.1, 0.15, 1.05]);
  for (let i = 0; i < 3; i++) { const s = B(0.35, 0.01, 0.25, basic('#e8e4d8'), -5.9 + i * 0.6, 1.07, 0.5); s.rotation.y = rr(-0.3, 0.3); }
  B(2.6, 0.45, 0.7, toon('#5a1a1a'), -7.6, 0.23, 4.0); B(0.7, 0.8, 2.6, toon('#2a2018'), -8.3, 0.4, 4.0); blocks.push([-8.7, -6.3, 3.6, 4.4]);
  C(0.32, 0.26, 0.55, steel2, 8.3, 0.28, 7.8, 12); C(0.05, 0.45, 1.2, toon('#4f8a3a'), 8.3, 1.1, 7.8, 7); circles.push([8.3, 7.8, 0.45]);
  sign(['LATINUM VAULT', 'BANK OF SPACE STATION 8'], 6.0, 1.1, GOLD, 0, 4.6, hd - 0.17, Math.PI);
  // NOW HIRING
  sign(['NOW HIRING', 'COIN COUNTER · ASK KESS'], 2.2, 1.1, '#ec3013', BK.hiring.x, 1.9, BK.hiring.z - 0.06); B(2.3, 1.2, 0.08, toon('#2a1a12'), BK.hiring.x, 1.9, BK.hiring.z - 0.12); C(0.05, 0.05, 1.3, gold, BK.hiring.x, 0.65, BK.hiring.z - 0.12, 6); circles.push([BK.hiring.x, BK.hiring.z - 0.12, 0.45]);
  // gold dust in the vault light
  if (!LOW) { const n = 30, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(-3.5, 3.5); pos[i * 3 + 1] = rr(0.5, 4); pos[i * 3 + 2] = rr(-8.5, -5); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pm = new THREE.PointsMaterial({ color: 0xffe2a0, size: 0.05, transparent: true, opacity: 0, depthWrite: false }); const pts = new THREE.Points(geo, pm); g.add(pts); anims.push((dt, t) => { pm.opacity = V.a * 0.7; pts.position.y = Math.sin(t * 0.3) * 0.2; }); }
  anims.push(dt => { const tgt = V.open ? 1 : 0; if (V.spin > 0) { V.spin = Math.max(0, V.spin - dt); wheel.rotation.z += dt * 5 * (V.open ? 1 : -1); } else V.a += (tgt - V.a) * Math.min(1, dt * 1.4);
    piv.rotation.y = V.a * 1.7; vLight.intensity = V.a * 2.2; });
  function setVault(open) { if (V.open === open) return false; V.open = open; V.spin = 0.9; return true; }
  let pz = BK.enter.z;
  function walk(x, z) { pz = z; if (z < wall + 0.45) { if (!(V.open && V.a > 0.85)) return false; if (z > wall - 0.45) return Math.abs(x) < 1.5; if (x < -3.7 || x > 3.7 || z < -hd + 0.5) return false; }
    else if (x < -hw + 0.5 || x > hw - 0.5 || z > hd - 0.4) return Math.abs(x) < 1.3 && z > hd - 0.4 && z < hd + 0.8;
    // keep clear of the open door's swing
    if (V.a > 0.02) { const a = V.a * 1.7, hx = VR, hz = wall + 0.5, ex = hx - Math.cos(a) * VR * 2, ez = hz + Math.sin(a) * VR * 2, dx = ex - hx, dz = ez - hz, u = Math.max(0, Math.min(1, ((x - hx) * dx + (z - hz) * dz) / (dx * dx + dz * dz)));
      if (Math.hypot(x - hx - dx * u, z - hz - dz * u) < 0.65) return false; }
    for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false; for (const [cx, cz, r] of circles) if (Math.hypot(x - cx, z - cz) < r + 0.3) return false; return true; }
  function clampCam(v) { if (pz > wall) { if (v.z < wall + 0.6 && !(V.a > 0.85 && Math.abs(v.x) < 1.5)) v.z = wall + 0.6; } else { v.x = Math.max(-3.6, Math.min(3.6, v.x)); v.z = Math.max(-hd + 0.6, v.z); } }
  return { g, anims, walk, clampCam, setVault, vault: V, coins };
}
