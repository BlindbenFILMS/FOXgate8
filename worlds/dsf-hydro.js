// HYDROPONICS BAY [dsfHydro] interior (s352): deep green + pink grow light. Grower Moss (DRAFT name) at the SEED BANK, four
// long grow beds (GREENS · HONEYROOT for Pav's · BLUEFRUIT · STAR KELP) with water running beside them, misters, a starfield
// skylight, the KELP MINNOW tank, and Fleet-built POLLINATOR drones; P-3 loops one bed, glitching (Machine Fleet hint).
import { roomKit } from './dsf-room-kit.js?v=352';
export const HY = { OX: 12600, hw: 13, hd: 11, h: 7, door: { x: 0, z: 10.2 }, enter: { x: 0, z: 7.6 }, hiring: { x: -10.6, z: 8.6 }, keeper: { x: 0, z: -8.0 }, beds: [-9.2, -4.6, 4.6, 9.2], bz0: -6.5, bz1: 4.5, harvest: { x: -4.6, z: 5.8 }, tank: { x: 10.4, z: -8.6 }, p3: { x: 9.2, z: -5.0 } };
export function buildHydro(K) {
  const R = roomKit(K, HY), { THREE, g, anims, B, C, S, plane, flat, lit, sign, tex, canvas, toon, basic, rr, LOW, block, circle, spots, glowSprite } = R;
  const { hw, hd, h } = HY, GR = '#9ff09f', dark = toon('#1a221c'), steel = toon('#5a665e');
  const grate = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#24302a'; c.fillRect(0, 0, w, w); c.strokeStyle = '#33433a'; c.lineWidth = 4; for (let i = 0; i <= w; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, w); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }), [hw, hd]);
  R.shell({ wall: '#1a2a1e', floor: grate, ceil: '#0e1410', trim: GR, title: ['HYDROPONICS', 'BAY · FARM · SPACE STATION 8'] });
  // starfield skylight + beams
  { const st = tex(canvas(1024, 1024, (c, w) => { c.fillStyle = '#03040a'; c.fillRect(0, 0, w, w); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`; const s = Math.random() < 0.08 ? 3 : 1.5; c.fillRect(Math.random() * w, Math.random() * w, s, s); } }));
    const m = plane(hw * 1.3, hd * 1.3, lit(st), 0, h - 0.03, -1); m.rotation.x = Math.PI / 2;
    for (const x of [-4, 0, 4]) B(0.3, 0.3, hd * 1.3, dark, x, h - 0.2, -1); for (const z of [-5, -1, 3]) B(hw * 1.3, 0.3, 0.3, dark, 0, h - 0.2, z); }
  // water texture that runs along every bed
  const wt = tex(canvas(64, 256, (c, W, H) => { c.fillStyle = '#2a7aa0'; c.fillRect(0, 0, W, H); c.strokeStyle = '#7fd8ff'; c.lineWidth = 3; for (let y = 0; y < H; y += 32) { c.beginPath(); c.moveTo(0, y); c.quadraticCurveTo(W / 2, y + 12, W, y); c.stroke(); } }), [1, 4]);
  const waterM = new THREE.MeshBasicMaterial({ map: wt, toneMapped: false, transparent: true, opacity: 0.85 }); anims.push(dt => { wt.offset.y -= dt * 0.25; });
  // grow beds
  const BL = HY.bz1 - HY.bz0, bzc = (HY.bz0 + HY.bz1) / 2, per = 12;
  const KINDS = [{ n: 'GREENS', leaf: '#6fbf4a', s: [1.1, 0.7, 1.1], y: 0.92 }, { n: 'HONEYROOT · FOR PAV\u2019S', leaf: '#b8c040', s: [0.6, 1.4, 0.6], y: 1.05, fruit: '#e0a13c', fs: 1.9, fy: 0.84 }, { n: 'BLUEFRUIT', leaf: '#3f9a5a', s: [0.9, 1.1, 0.9], y: 1.0, fruit: '#4a7ad0', fs: 1, fy: 1.15 }, { n: 'STAR KELP', leaf: '#2fa08a', s: [0.5, 1.8, 0.5], y: 1.25 }];
  const leaves = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.26, 0), toon('#ffffff'), per * 4), fruits = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 8, 6), toon('#ffffff'), per * 2);
  leaves.castShadow = !LOW; g.add(leaves, fruits);
  const D3 = new THREE.Object3D(), col = new THREE.Color(), honey = []; let li = 0, fi = 0;
  const setI = (im, i, x, y, z, sx, sy, sz, ry) => { D3.position.set(x, y, z); D3.scale.set(sx, sy, sz); D3.rotation.set(0, ry, 0); D3.updateMatrix(); im.setMatrixAt(i, D3.matrix); };
  const mists = [];
  HY.beds.forEach((bx, b) => { const KD = KINDS[b];
    B(1.8, 0.75, BL, toon('#3a4a3e'), bx, 0.38, bzc); B(1.62, 0.05, BL - 0.2, toon('#3a2a1a'), bx, 0.77, bzc); for (const s of [-1, 1]) B(0.05, 0.05, BL, basic(GR), bx + s * 0.92, 0.77, bzc);
    flat(0.34, BL, waterM, bx + (b < 2 ? 1.15 : -1.15), 0.02, bzc);
    for (const s of [-1, 1]) for (const z of [HY.bz0 + 0.3, HY.bz1 - 0.3]) C(0.04, 0.04, 1.95, steel, bx + s * 0.85, 1.72, z, 6);
    B(1.6, 0.1, BL - 0.2, dark, bx, 2.72, bzc); flat(1.4, BL - 0.4, basic('#ff6ad8'), bx, 2.665, bzc);
    sign([KD.n], 1.8, 0.4, GR, bx, 3.05, HY.bz1 - 0.1);
    if (!LOW) for (const z of [-4, -1, 2]) { glowSprite(bx, 2.4, z, 0xff6ad8, 2.6, 0.22, g); mists.push({ s: glowSprite(bx, 1.3, z, 0xdff6ff, 1.0, 0, g), ph: rr(0, 6) }); }
    for (let i = 0; i < per; i++) { const z = HY.bz0 + 0.5 + i * (BL - 1) / (per - 1), x = bx + (i % 2 ? 0.35 : -0.35), ry = rr(0, 6), k = rr(0.85, 1.15);
      const P = { x, z, ry, sx: KD.s[0] * k, sy: KD.s[1] * k, sz: KD.s[2] * k, y: KD.y, li, t: 0 }; setI(leaves, li, x, KD.y, z, P.sx, P.sy, P.sz, ry); col.set(KD.leaf).offsetHSL(0, 0, rr(-0.06, 0.06)); leaves.setColorAt(li, col); li++;
      if (KD.fruit && i % 2 === 0) { P.fi = fi; P.fs = KD.fs; P.fy = KD.fy; setI(fruits, fi, x + 0.12, KD.fy, z + 0.1, KD.fs, KD.fs, KD.fs, 0); fruits.setColorAt(fi, col.set(KD.fruit)); fi++; }
      if (b === 1) honey.push(P); }
    block(bx - 0.95, bx + 0.95, HY.bz0, HY.bz1); });
  fruits.count = fi; leaves.instanceMatrix.needsUpdate = fruits.instanceMatrix.needsUpdate = true;
  anims.push((dt, t) => { for (const m of mists) { const u = Math.max(0, Math.sin(t * 0.8 + m.ph)); m.s.material.opacity = Math.pow(u, 4) * 0.35; m.s.scale.setScalar(0.8 + u * 1.2); }
    let dirty = false; for (const p of honey) { if (!(p.t > 0)) continue; p.t += dt; dirty = true; let k = 1, up = 0;
      if (p.t < 0.6) { k = 1 - p.t / 0.6; up = (p.t / 0.6) * 0.8; } else if (p.t < 10) k = 0; else if (p.t < 11) k = p.t - 10; else { p.t = 0; }
      setI(leaves, p.li, p.x, p.y + up, p.z, p.sx * k, p.sy * k, p.sz * k, p.ry); if (p.fi != null) setI(fruits, p.fi, p.x + 0.12, p.fy + up, p.z + 0.1, p.fs * k, p.fs * k, p.fs * k, 0); }
    if (dirty) leaves.instanceMatrix.needsUpdate = fruits.instanceMatrix.needsUpdate = true; });
  function harvest(X) { const p = honey.find(q => q.t === 0 && q.fi != null); if (!p) { X.toast('Nothing ready yet. Honeyroot grows back fast up here.'); return; } p.t = 0.0001; X.audio.tone(320, 0.25, 0.05, 'triangle', 1.8);
    const n = ((X.save.data.stats || {}).dsfHoneyroot || 0) + 1; X.save.setStat('dsfHoneyroot', n); X.toast('You pull a fat honeyroot. ' + n + ' picked. Pav pays for these.'); }
  function harvestMenu(X) { X.prompt('HONEYROOT', 'Bed two · for Pav\u2019s', [['PULL ONE', () => harvest(X)], ['NOT NOW', null]]); }
  // SEED BANK (north wall): bench, seedling trays, pipes
  B(6.0, 0.95, 1.0, toon('#4a3a2a'), 0, 0.48, -10.2); for (let i = 0; i < 6; i++) { B(0.8, 0.08, 0.6, dark, -2.5 + i, 0.99, -10.2); B(0.7, 0.06, 0.5, toon(i % 2 ? '#7fd060' : '#5fb050'), -2.5 + i, 1.05, -10.2); } block(-3.1, 3.1, -hd, -9.6);
  sign(['SEED BANK', 'EVERY LEAF STARTS HERE'], 3.6, 0.9, GR, 0, 3.2, -hd + 0.18);
  for (const y of [4.3, 4.7]) C(0.1, 0.1, hw * 2 - 0.6, toon('#3a7a4a'), 0, y, -hd + 0.35, 10).rotation.z = Math.PI / 2;
  // KELP MINNOW tank (north-east): fish circle, bubbles rise
  const TK = HY.tank, glassM = new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
  C(1.3, 1.4, 0.4, dark, TK.x, 0.2, TK.z, 20); C(1.2, 1.2, 3.2, glassM, TK.x, 2.0, TK.z, 20); C(1.15, 1.15, 2.9, new THREE.MeshBasicMaterial({ color: 0x2a8aa8, transparent: true, opacity: 0.35, depthWrite: false }), TK.x, 1.9, TK.z, 20); C(1.3, 1.3, 0.2, dark, TK.x, 3.7, TK.z, 20);
  const fish = []; for (let i = 0; i < 6; i++) { const f = new THREE.Group(); g.add(f); B(0.22, 0.09, 0.06, toon(i % 2 ? '#f2a03a' : '#ffd36a'), 0, 0, 0, f); B(0.08, 0.1, 0.02, toon('#ec3013'), -0.14, 0, 0, f); fish.push({ f, a: rr(0, 6), r: rr(0.4, 0.95), y: rr(0.9, 3.0), sp: rr(0.4, 0.9) * (i % 2 ? 1 : -1) }); }
  const BN = LOW ? 8 : 20, bp = new Float32Array(BN * 3); for (let i = 0; i < BN; i++) { bp[i * 3] = rr(-0.8, 0.8); bp[i * 3 + 1] = rr(0.5, 3.3); bp[i * 3 + 2] = rr(-0.8, 0.8); }
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(bp, 3)); const bub = new THREE.Points(bg, new THREE.PointsMaterial({ color: 0xdff6ff, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false })); bub.position.set(TK.x, 0, TK.z); g.add(bub);
  anims.push(dt => { for (const q of fish) { q.a += q.sp * dt; q.f.position.set(TK.x + Math.cos(q.a) * q.r, q.y, TK.z + Math.sin(q.a) * q.r); q.f.rotation.y = q.sp > 0 ? -q.a - Math.PI / 2 : -q.a + Math.PI / 2; }
    for (let i = 0; i < BN; i++) { bp[i * 3 + 1] += dt * 0.6; if (bp[i * 3 + 1] > 3.3) bp[i * 3 + 1] = 0.5; } bg.attributes.position.needsUpdate = true; });
  circle(TK.x, TK.z, 1.45); sign(['KELP MINNOWS', 'THEY KEEP THE WATER CLEAN'], 2.4, 0.6, GR, hw - 0.18, 3.0, TK.z + 0.4, -Math.PI / 2);
  // POLLINATOR drones: three fly the beds; P-3 loops one spot and glitches
  const mkDrone = () => { const d = new THREE.Group(); S(0.16, toon('#f2c94c'), 0, 0, 0, d); C(0.165, 0.165, 0.06, toon('#201e1d'), 0, 0, 0, 12, d); const eyeM = new THREE.MeshBasicMaterial({ color: 0x5fe3ff, toneMapped: false }); const e = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.05), eyeM); e.position.set(0, 0.03, 0.165); d.add(e);
    for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.CircleGeometry(0.14, 12), basic('#e8f4ff', 0.35)); r.rotation.x = -Math.PI / 2; r.position.set(s * 0.22, 0.14, 0); d.add(r); B(0.22, 0.03, 0.03, toon('#201e1d'), s * 0.11, 0.1, 0, d); } g.add(d); return { d, eyeM }; };
  const flyers = [0, 2, 3].map((b, i) => ({ ...mkDrone(), bx: HY.beds[b], ph: i * 2.1 })), p3 = mkDrone(); let p3real = 0, p3f = 1;
  anims.push((dt, t) => { for (const q of flyers) { const a = t * 0.35 + q.ph; q.d.position.set(q.bx + Math.sin(t * 0.7 + q.ph) * 0.6, 1.75 + Math.sin(t * 2 + q.ph) * 0.1, bzc + Math.sin(a) * BL * 0.42); q.d.rotation.y = Math.cos(a) > 0 ? 0 : Math.PI; }
    const a = t * 3.2; p3.d.position.set(HY.p3.x + Math.cos(a) * 0.4 + rr(-0.02, 0.02), 1.6 + rr(-0.02, 0.02), HY.p3.z + Math.sin(a) * 0.4); p3.d.rotation.y = -a;
    p3f -= dt; if (p3real > 0) p3real -= dt; else if (p3f < 0) { p3real = 0.2; p3f = rr(1.5, 4); } p3.eyeM.color.set(p3real > 0 ? 0x5fe3ff : 0xff2a10); });
  sign(['P-3 · POLLINATOR', 'LOOPING · FLAGGED'], 1.6, 0.45, '#ff6a4a', HY.p3.x, 2.2, HY.bz0 + 0.05, 0, '#160c0c');
  R.motes(0xdff6ff, 30); R.hiring('HARVEST HAND · ASK MOSS');
  spots.push({ key: 'hyHarvest', x: HY.harvest.x, z: HY.harvest.z, r: 1.3, run: X => harvestMenu(X) },
    { key: 'hyP3', x: 6.9, z: HY.p3.z, r: 1.6, run: X => { p3real = 2.0; X.audio.tone(520, 0.4, 0.03, 'triangle', 0.6); X.note('POLLINATOR P-3', 'It hums Moss\u2019s tune backwards. Its eye flicks cyan: \u201C...not... my... flowers...\u201D'); if (!X.save.flag('dsfPollinator')) X.save.setFlag('dsfPollinator'); } },
    { key: 'hyTank', x: 8.3, z: TK.z, r: 1.3, run: X => X.note('KELP MINNOWS', 'They eat the algae. The algae feeds the beds. Moss feeds the minnows.') });
  return { g, anims, walk: R.walk, spots, harvest, harvestMenu };
}
