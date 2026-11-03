// DABA (s358): Ben's 2D game (minigames/dsf/logic/daba.js) played IN QUIRK'S BAR on the real table, rules 1:1
// (two 6-colour rings, one bet on each ring, PAYS 2, the x METER multiplies every return, both rings hit = DABA x2,
// 4 tables with a NET target in N spins, chips 1 / 5 / 10 / 25 / 50). Ben s358: bets use the player's REAL gold.
// In 3D: a big rounded felt table with marquee bulbs, the wheel set into it (outer + inner ring turn opposite ways under
// a brass pointer arm), the x meter as a lit inlay, a chip rack, a big red SPIN button and a brass plaque that says what
// to do next. CELESTE (the host in a satin gown) deals, the crowd cheers a win and goes wild on a DABA, coins jump out of the wheel.
// Portrait: the console kit turns the view 90°, so every label on the table turns with it (no sideways text).
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const STEP = 60, PAYS = 2, CHIPS = [1, 5, 10, 25, 50];
const METER = [
  { m: 2, w: 15.5, fill: '#5a7fa8', ink: '#eaf2fa' }, { m: 3, w: 15.5, fill: '#2f7d3a', ink: '#e9f5ec' }, { m: 1, w: 15.5, fill: '#6b3330', ink: '#e8bcb4' },
  { m: 5, w: 7.0, fill: '#f0c040', ink: '#231a08' },
  { m: 1, w: 15.5, fill: '#6b3330', ink: '#e8bcb4' }, { m: 3, w: 15.5, fill: '#2f7d3a', ink: '#e9f5ec' }, { m: 2, w: 15.5, fill: '#5a7fa8', ink: '#eaf2fa' }];
const METER_MS = 1600;
function meterIdx(p) { let acc = 0; const at = clamp(p, 0, 1) * 100; for (let i = 0; i < METER.length; i++) { acc += METER[i].w; if (at <= acc) return i; } return METER.length - 1; }
function meterPos(el) { const t = (el % METER_MS) / METER_MS; return t < 0.5 ? t * 2 : 2 - t * 2; }
const OUTER = ['#d9a84e', '#d9628a', '#2fbfae', '#8a6ad9', '#6f9d4a', '#4f8fd6'];
const INNER = ['#e8913a', '#2fd6c0', '#cfc63f', '#b02334', '#5a3fa0', '#dfe7ec'];
const MARKS = ['M -4.4 0 L 0 -4.4 L 4.4 0 L 0 4.4 Z', 'M -4.2 -4.2 L 4.2 -4.2 L 4.2 4.2 L -4.2 4.2 Z', 'M 0 -4.8 L 4.4 3 L -4.4 3 Z',
  'M -4.8 0 a 4.8 4.8 0 1 0 9.6 0 a 4.8 4.8 0 1 0 -9.6 0 Z M -1.9 0 a 1.9 1.9 0 1 1 3.8 0 a 1.9 1.9 0 1 1 -3.8 0 Z',
  'M 0 -5 L 1.5 -1.5 L 5 -1.5 L 2 1 L 3.2 4.8 L 0 2.4 L -3.2 4.8 L -2 1 L -5 -1.5 L -1.5 -1.5 Z',
  'M -5 -1.7 L -1.7 -1.7 L -1.7 -5 L 1.7 -5 L 1.7 -1.7 L 5 -1.7 L 5 1.7 L 1.7 1.7 L 1.7 5 L -1.7 5 L -1.7 1.7 L -5 1.7 Z'];
const TABLES = [{ name: 'The quiet table', target: 60, spins: 8 }, { name: 'Evening crowd', target: 110, spins: 9 }, { name: 'The high table', target: 180, spins: 10 }, { name: 'Quirk\u2019s own table', target: 260, spins: 11 }];
const CHIP_COL = { 1: ['#f3f2f2', '#201e1d'], 5: ['#ec3013', '#f3f2f2'], 10: ['#2f6fc0', '#f3f2f2'], 25: ['#2f7d3a', '#f3f2f2'], 50: ['#201e1d', '#f0c040'] };
// the 2D lounge vamp with a little casino sparkle
const MUSIC = (() => { const notes = [], bass = [45, 45, 52, 52, 43, 43, 50, 50];
  bass.forEach((m, i) => notes.push({ b: i * 4, m: m - 12, d: 3.4, v: 'bass' }));
  [[1, 76], [2.5, 79], [4, 81], [6.5, 79], [9, 76], [11, 72], [13, 74], [17, 79], [18.5, 83], [21, 84], [23.5, 81], [25, 79], [27.5, 76], [30, 72]].forEach(p => notes.push({ b: p[0], m: p[1], d: 1.6, v: 'vibe' }));
  for (let b = 0; b < 32; b += 2) notes.push({ b: b + 1, m: 93, d: 0.08, v: 'tick' }); return { notes, beats: 32, spb: 0.42 }; })();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

export function makeDaba(K, { group, OX, at, audio, save, LOW, portrait = () => false, hooks = {} }) {
  const { THREE, glowSprite, toon } = K;
  const YT = 1.0, TW = 6.4, TD = 3.1, TR = 0.9, FW = TW - 0.3, FD = TD - 0.3, SW = 6.0, SH = 2.7;
  const WX = -1.4, WZ = 0, RO = 1.2, RM = 0.78, RI = 0.3, MX = 0.55, ML = 2.3, MW = 0.36, CXR = 1.3, BX = 2.35, BZ = 0, BR = 0.42;
  const chipZ = i => -1.1 + i * 0.55, RED = '#ec3013', GOLD = '#f0c040', INK = '#f3f2f2';
  const root = new THREE.Group(); root.position.set(at.x, 0, at.z); group.add(root);
  const tx = cvs => { const t = new THREE.CanvasTexture(cvs); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const mesh = (geo, mat, x, y, z, p = root) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  const flat = (geo, mat, x, y, z, p = root) => { const m = mesh(geo, mat, x, y, z, p); m.rotation.x = -Math.PI / 2; return m; };
  const add = (c, o = 0) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const copper = toon('#b8742a', { emissive: new THREE.Color('#3a2008'), emissiveIntensity: 0.4 }), wood = toon('#2a1a0c'), dark = toon('#141010');
  function rrect(w, d, r) { const s = new THREE.Shape(), x = -w / 2, y = -d / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false); s.lineTo(x + w, y + d - r); s.absarc(x + w - r, y + d - r, r, 0, Math.PI / 2, false); s.lineTo(x + r, y + d); s.absarc(x + r, y + d - r, r, Math.PI / 2, Math.PI, false); s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false); return s; }
  const ext = (shape, depth, mat, y) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 12 }); geo.rotateX(-Math.PI / 2); return mesh(geo, mat, 0, y, 0); };
  // ---- the table: wood apron + top, copper rail, the felt (a canvas: gold pinstripes + wells for the wheel, meter, rack, button)
  ext(rrect(TW - 0.4, TD - 0.4, TR - 0.2), YT - 0.1, wood, 0); ext(rrect(TW, TD, TR), 0.1, toon('#3a2414'), YT - 0.1);
  { const sh = rrect(TW, TD, TR); sh.holes.push(rrect(FW, FD, TR - 0.15)); ext(sh, 0.07, copper, YT); }
  B(TW - 0.6, 0.06, 0.04, new THREE.MeshBasicMaterial({ color: 0xffb454, toneMapped: false }), 0, 0.1, TD / 2 - 0.19);
  function B(w, h, d, mat, x, y, z, p) { return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p); }
  { const CW = LOW ? 900 : 1400, CH = Math.round(CW * FD / FW), k = CW / FW, P = (x, z) => [(x / FW + 0.5) * CW, (z / FD + 0.5) * CH];
    const cv = canvas(CW, CH, (c, w, h) => { c.fillStyle = '#1b4a2b'; c.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '120,200,140'},${(Math.random() * 0.06).toFixed(3)})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      const g = c.createRadialGradient(w * 0.45, h * 0.5, 10, w * 0.45, h * 0.5, w * 0.6); g.addColorStop(0, 'rgba(255,220,150,0.16)'); g.addColorStop(1, 'rgba(0,0,0,0.25)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#c8a050'; c.lineWidth = k * 0.025; const rr2 = (x0, y0, ww, hh, r) => { c.beginPath(); c.roundRect(x0, y0, ww, hh, r); c.stroke(); }; rr2(k * 0.08, k * 0.08, w - k * 0.16, h - k * 0.16, k * 0.7); c.lineWidth = k * 0.01; rr2(k * 0.14, k * 0.14, w - k * 0.28, h - k * 0.28, k * 0.64);
      const [wx, wz] = P(WX, WZ); c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.arc(wx, wz, k * 1.36, 0, 6.283); c.fill(); c.strokeStyle = '#c8a050'; c.lineWidth = k * 0.02; c.beginPath(); c.arc(wx, wz, k * 1.42, 0, 6.283); c.stroke();
      const [mx, mz] = P(MX - MW / 2 - 0.06, -ML / 2 - 0.08); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(mx, mz, (MW + 0.12) * k, (ML + 0.16) * k);
      const [rx, rz] = P(CXR - 0.33, chipZ(0) - 0.33); c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.roundRect(rx, rz, 0.66 * k, (chipZ(4) - chipZ(0) + 0.66) * k, 0.3 * k); c.fill();
      const [bx, bz] = P(BX, BZ); c.strokeStyle = '#c8a050'; c.lineWidth = k * 0.02; c.beginPath(); c.arc(bx, bz, k * 0.6, 0, 6.283); c.stroke(); });
    const t = tx(cv); t.repeat.set(1 / FW, 1 / FD); t.offset.set(0.5, 0.5);
    const geo = new THREE.ShapeGeometry(rrect(FW, FD, TR - 0.15), 12); geo.rotateX(-Math.PI / 2); mesh(geo, toon('#ffffff', { map: t }), 0, YT + 0.003, 0); }
  // ---- marquee bulbs round the rail (chase while the wheel runs, all flash on a DABA)
  const NB = LOW ? 22 : 34, bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), NB), bc = new THREE.Color();
  { const pts = rrect(TW - 0.15, TD - 0.15, TR - 0.08).getSpacedPoints(NB), o = new THREE.Object3D(); for (let i = 0; i < NB; i++) { o.position.set(pts[i].x, YT + 0.1, -pts[i].y); o.updateMatrix(); bulbs.setMatrixAt(i, o.matrix); bulbs.setColorAt(i, bc.set('#ffcf8a')); } root.add(bulbs); }
  // ---- the wheel: base well, two rings (canvas sectors + raised gold dividers), copper hub, the brass pointer arm
  const wheel = new THREE.Group(); wheel.position.set(WX, YT, WZ); root.add(wheel);
  mesh(new THREE.CylinderGeometry(1.32, 1.32, 0.08, 48), dark, 0, 0.04, 0, wheel); { const t = mesh(new THREE.TorusGeometry(1.3, 0.04, 6, 64), copper, 0, 0.1, 0, wheel); t.rotation.x = Math.PI / 2; }
  function ringCanvas(cols, r0, r1, R, marks) { return canvas(512, 512, (c, w) => { const k = w / 2 / R, cx = w / 2; for (let i = 0; i < 6; i++) { const a0 = (i * STEP - 90 - 30) * Math.PI / 180, a1 = a0 + STEP * Math.PI / 180; c.beginPath(); c.arc(cx, cx, r1 * k, a0, a1); c.arc(cx, cx, r0 * k, a1, a0, true); c.closePath(); c.fillStyle = cols[i]; c.fill(); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 3; c.stroke();
        if (marks) { const am = (i * STEP - 90) * Math.PI / 180, rm = (r0 + r1) / 2 * k; c.save(); c.translate(cx + Math.cos(am) * rm, cx + Math.sin(am) * rm); c.rotate(am + Math.PI / 2); c.scale(k * 0.026, k * 0.026); c.fillStyle = i === 5 ? '#3a3836' : 'rgba(255,255,255,0.92)'; c.fill(new Path2D(MARKS[i]), 'evenodd'); c.restore(); } }
      c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cx, r1 * k - 3, 0, 6.283); c.stroke(); }); }
  const oG = new THREE.Group(), iG = new THREE.Group(); oG.position.y = 0.1; iG.position.y = 0.13; wheel.add(oG, iG);
  flat(new THREE.RingGeometry(RM, RO, 72, 1), new THREE.MeshBasicMaterial({ map: tx(ringCanvas(OUTER, RM, RO, RO, false)), toneMapped: false }), 0, 0, 0, oG);
  flat(new THREE.CircleGeometry(RM - 0.02, 64), new THREE.MeshBasicMaterial({ map: tx(ringCanvas(INNER, RI, RM - 0.02, RM - 0.02, true)), toneMapped: false }), 0, 0, 0, iG);
  const divM = toon('#e0b860', { emissive: new THREE.Color('#5a4010'), emissiveIntensity: 0.5 });
  for (const [G, r0, r1] of [[oG, RM, RO], [iG, RI, RM - 0.02]]) for (let i = 0; i < 6; i++) { const th = (i * STEP + 30) * Math.PI / 180, rm = (r0 + r1) / 2, d = mesh(new THREE.BoxGeometry(0.025, 0.035, r1 - r0), divM, Math.sin(th) * rm, 0.017, -Math.cos(th) * rm, G); d.rotation.y = -th; }
  mesh(new THREE.CylinderGeometry(0.29, 0.31, 0.1, 32), copper, 0, 0.05, 0, iG); mesh(new THREE.SphereGeometry(0.12, 16, 10), toon('#e0b860'), 0, 0.12, 0, iG);
  for (let i = 0; i < 6; i++) { const th = i * STEP * Math.PI / 180; mesh(new THREE.SphereGeometry(0.03, 8, 6), toon(INNER[i]), Math.sin(th) * 0.2, 0.1, -Math.cos(th) * 0.2, iG); }
  { const L = RO - 0.22, arm = mesh(new THREE.BoxGeometry(0.06, 0.035, L), toon('#e0b860', { emissive: new THREE.Color('#5a4010'), emissiveIntensity: 0.6 }), 0, 0.34, -(0.22 + L / 2), wheel);
    void arm; mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.34, 10), copper, 0, 0.17, -RO - 0.06, wheel); mesh(new THREE.SphereGeometry(0.07, 14, 10), new THREE.MeshBasicMaterial({ color: RED, toneMapped: false }), 0, 0.36, -RO - 0.06, wheel);
    const tri = new THREE.Shape(); tri.moveTo(-0.09, 0); tri.lineTo(0.09, 0); tri.lineTo(0, 0.16); tri.closePath(); const tg = new THREE.ShapeGeometry(tri); tg.rotateX(-Math.PI / 2); mesh(tg, new THREE.MeshBasicMaterial({ color: RED, toneMapped: false, side: THREE.DoubleSide }), 0, 0.33, -RO + 0.02, wheel).rotation.y = Math.PI; }
  // segment overlays (bet here / your bet / the result) ride on each ring
  const seg = (r0, r1, i) => new THREE.RingGeometry(r0, r1, 12, 1, (60 - i * STEP) * Math.PI / 180, STEP * Math.PI / 180);
  const ovO = [], ovI = []; for (let i = 0; i < 6; i++) { ovO.push(flat(seg(RM, RO, i), add('#ffffff'), 0, 0.006, 0, oG)); ovI.push(flat(seg(RI, RM - 0.02, i), add('#ffffff'), 0, 0.006, 0, iG)); }
  // chips: rack chips with a value face, and small stacks that sit on the wheel
  const chipFace = v => tx(canvas(256, 256, (c, w) => { const [bg, ink] = CHIP_COL[v]; c.fillStyle = bg; c.beginPath(); c.arc(128, 128, 126, 0, 6.283); c.fill(); c.strokeStyle = ink; c.lineWidth = 14; c.setLineDash([22, 18]); c.beginPath(); c.arc(128, 128, 108, 0, 6.283); c.stroke(); c.setLineDash([]); c.lineWidth = 4; c.beginPath(); c.arc(128, 128, 86, 0, 6.283); c.stroke(); c.fillStyle = ink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `900 ${v >= 10 ? 104 : 124}px ${FONT}`; c.fillText(String(v), 128, 136); }));
  const sideM = {}; for (const v of CHIPS) sideM[v] = toon(CHIP_COL[v][0]);
  const chipG = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 28), miniG = new THREE.CylinderGeometry(0.1, 0.1, 0.024, 16), yawers = [];
  const rack = CHIPS.map((v, i) => { const g = new THREE.Group(); g.position.set(CXR, YT, chipZ(i)); root.add(g); mesh(chipG, sideM[v], 0, 0.03, 0, g); mesh(chipG, sideM[v], 0.015, 0.085, 0.01, g);
    const top = new THREE.Group(); top.position.y = 0.14; g.add(top); mesh(chipG, sideM[v], 0, 0, 0, top); const yw = new THREE.Group(); yw.position.y = 0.027; top.add(yw); flat(new THREE.CircleGeometry(0.215, 32), new THREE.MeshBasicMaterial({ map: chipFace(v), toneMapped: false }), 0, 0, 0, yw); yawers.push(yw);
    const halo = flat(new THREE.RingGeometry(0.25, 0.32, 32), add(GOLD), 0, 0.01, 0, g); return { v, g, top, halo, lift: 0 }; });
  function stack(v, G, r, i) { const g = new THREE.Group(), th = i * STEP * Math.PI / 180; g.position.set(Math.sin(th) * r, 0.02, -Math.cos(th) * r); G.add(g); const n = v >= 25 ? 3 : v >= 5 ? 2 : 1; for (let k = 0; k < n; k++) mesh(miniG, sideM[v], k * 0.006, 0.012 + k * 0.026, 0, g); const tp = new THREE.Mesh(new THREE.CircleGeometry(0.095, 20), new THREE.MeshBasicMaterial({ color: CHIP_COL[v][1], toneMapped: false })); tp.rotation.x = -Math.PI / 2; tp.position.y = n * 0.026 + 0.001; tp.scale.setScalar(0.45); g.add(tp); g.userData.t = 0; return g; }
  // ---- the x meter: lit bands, labels, the sweeping marker
  const meter = new THREE.Group(); meter.position.set(MX, YT, 0); root.add(meter); const bands = []; let acc = 0;
  B(MW + 0.1, 0.05, ML + 0.1, copper, 0, 0.02, 0, meter);
  METER.forEach((b, i) => { const len = b.w / 100 * ML, z = -ML / 2 + (acc + b.w / 2) / 100 * ML; acc += b.w; const bm = B(MW, 0.03, len - 0.008, new THREE.MeshBasicMaterial({ color: b.fill, toneMapped: false }), 0, 0.06, z, meter);
    const s = Math.min(0.3, len * 0.92), lb = new THREE.Group(); lb.position.set(0, 0.078, z); meter.add(lb); flat(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: tx(canvas(128, 128, (c) => { c.fillStyle = b.ink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `900 ${b.m === 5 ? 74 : 68}px ${FONT}`; c.fillText('\u00d7' + b.m, 64, 70); })), transparent: true, depthWrite: false, toneMapped: false }), 0, 0, 0, lb); yawers.push(lb);
    const hl = new THREE.Group(); hl.position.set(0, 0.08, z); meter.add(hl); const hm = add('#ffffff'); hl.material = hm; for (const [w, d, x, zz] of [[MW + 0.1, 0.035, 0, -len / 2], [MW + 0.1, 0.035, 0, len / 2], [0.035, len, -MW / 2 - 0.03, 0], [0.035, len, MW / 2 + 0.03, 0]]) B(w, 0.02, d, hm, x, 0, zz, hl); bands.push({ bm, hl, z, len }); });
  const marker = B(MW + 0.16, 0.05, 0.045, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), 0, 0.11, -ML / 2, meter); const mGlow = glowSprite(0, 0.14, -ML / 2, 0xfff0c0, 0.7, 0.7, meter);
  // ---- SPIN button + the brass plaque (both carry live canvas text)
  const btn = new THREE.Group(); btn.position.set(BX, YT, BZ); root.add(btn); mesh(new THREE.CylinderGeometry(0.52, 0.55, 0.06, 40), copper, 0, 0.03, 0, btn);
  const capM = toon(RED).clone(), cap = new THREE.Group(); btn.add(cap); mesh(new THREE.CylinderGeometry(BR, BR + 0.02, 0.12, 40), capM, 0, 0.12, 0, cap);
  const bcv = document.createElement('canvas'); bcv.width = 512; bcv.height = 256; const btex = tx(bcv), byaw = new THREE.Group(); byaw.position.y = 0.182; cap.add(byaw); yawers.push(byaw);
  flat(new THREE.PlaneGeometry(0.76, 0.38), new THREE.MeshBasicMaterial({ map: btex, transparent: true, depthWrite: false, toneMapped: false }), 0, 0, 0, byaw);
  const bHalo = flat(new THREE.RingGeometry(0.56, 0.66, 40), add('#ffffff'), 0, 0.01, 0, btn);
  const pcv = document.createElement('canvas'); pcv.width = 640; pcv.height = 320; const ptex = tx(pcv), plq = new THREE.Group(); root.add(plq);
  B(0.86, 0.04, 0.46, copper, 0, 0.02, 0, plq); const pyaw = new THREE.Group(); pyaw.position.y = 0.043; plq.add(pyaw); flat(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshBasicMaterial({ map: ptex, toneMapped: false }), 0, 0, 0, pyaw);
  // ---- the result banner over the wheel + the coins that jump out of it
  const fcv = document.createElement('canvas'); fcv.width = 768; fcv.height = 256; const ftex = tx(fcv), fl = new THREE.Group(); fl.position.set(WX, YT + 0.5, WZ); root.add(fl); const fyaw = new THREE.Group(); fl.add(fyaw); yawers.push(fyaw);
  const fMat = new THREE.MeshBasicMaterial({ map: ftex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 }); flat(new THREE.PlaneGeometry(1.8, 0.6), fMat, 0, 0, 0, fyaw); let flT = 0;
  const NC = 36, coins = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.055, 0.055, 0.014, 12), toon('#f0c040', { emissive: new THREE.Color('#6a4a00'), emissiveIntensity: 0.6 }), NC), CP = [], cO = new THREE.Object3D();
  for (let i = 0; i < NC; i++) CP.push({ x: 0, y: -9, z: 0, vx: 0, vy: 0, vz: 0, r: 0, t: 0 }); root.add(coins); coins.frustumCulled = false;
  function burst(n) { let k = 0; for (const c of CP) { if (k >= n) break; if (c.t > 0) continue; const a = Math.random() * 6.283, sp = 0.6 + Math.random() * 1.4; Object.assign(c, { x: WX + Math.cos(a) * 0.3, y: YT + 0.3, z: WZ + Math.sin(a) * 0.3, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: 2.2 + Math.random() * 1.8, r: Math.random() * 6, t: 2.2 + Math.random() * 0.6 }); k++; } }
  // ---- chandelier over the table: rises into the ceiling when you sit down so the camera has the room
  const chan = new THREE.Group(); chan.position.set(0, 6.6, 0); root.add(chan); const chanY0 = 6.6, chanY1 = 8.65;
  for (const [w, d, x, z] of [[3.8, 0.06, 0, -0.8], [3.8, 0.06, 0, 0.8], [0.06, 1.66, -1.9, 0], [0.06, 1.66, 1.9, 0]]) B(w, 0.08, d, copper, x, 0, z, chan);
  const chanGlow = []; for (const x of [-1.9, 0, 1.9]) for (const z of [-0.8, 0.8]) { mesh(new THREE.SphereGeometry(0.11, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffcf8a, toneMapped: false }), x, -0.1, z, chan); chanGlow.push(glowSprite(x, -0.12, z, 0xffb454, 1.3, 0.5, chan)); }
  const rods = []; for (const x of [-1.9, 1.9]) rods.push(mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 6), toon('#111'), x, 0, 0));
  const pool = flat(new THREE.PlaneGeometry(TW * 0.9, TD * 1.1), new THREE.MeshBasicMaterial({ map: tx(canvas(256, 128, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(255,210,140,0.55)'); g.addColorStop(1, 'rgba(255,210,140,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); })), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35, toneMapped: false }), 0, YT + 0.02, 0);
  // ---- the stand: red floor ring + the big post sign (Ben: big, high contrast)
  const stX = CXR, stZ = TD / 2 + 0.95; { const fr = flat(new THREE.RingGeometry(0.75, 0.95, 48), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.95 }), stX, 0.04, stZ); const fi = flat(new THREE.CircleGeometry(0.75, 40), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.18, depthWrite: false }), stX, 0.035, stZ); root.userData.ring = [fr, fi];
    const px = TW / 2 + 0.5, pz = TD / 2 + 1.1; mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 8), toon('#2a1a0c'), px, 0.95, pz);
    mesh(new THREE.PlaneGeometry(2.2, 0.66), new THREE.MeshBasicMaterial({ map: tx(canvas(1024, 308, (c, w, h) => { c.fillStyle = '#0e0d0c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e0a13c'; c.lineWidth = 12; c.strokeRect(6, 6, w - 12, h - 12); c.textBaseline = 'middle'; c.fillStyle = '#e0a13c'; c.font = `900 120px ${FONT}`; c.fillText('DABA', 40, 104); c.fillStyle = INK; c.font = `900 62px ${FONT}`; c.fillText('STAND ON THE RED RING', 40, 220); })), toneMapped: false }), px - 0.6, 2.1, pz + 0.04);
    B(2.3, 0.76, 0.05, toon('#2a1a0c'), px - 0.6, 2.1, pz); }

  // ---- sound through the station mixer (+ a synth crowd)
  let bus = null, mStart = 0, mBar = 0, noise = null;
  const AC = () => audio.ctx && !audio.muted ? audio.ctx : null;
  function tone(freq, dur, gain, type, to) { const ac = AC(); if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(audio.master || ac.destination); o.start(t); o.stop(t + dur + 0.02); }
  function hiss(at0, dur, gain, f, q, type = 'bandpass') { const ac = AC(); if (!ac) return; if (!noise) { noise = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(), fl2 = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime + at0; s.buffer = noise; s.loop = true; fl2.type = type; fl2.frequency.value = f; fl2.Q.value = q; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.15, dur * 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(fl2); fl2.connect(g); g.connect(audio.master || ac.destination); s.start(t); s.stop(t + dur + 0.05); }
  function crowd(level) { if (level < 0) { hiss(0, 0.9, 0.03, 500, 1.2); tone(300, 0.7, 0.012, 'sine', 180); return; } const L = level > 1; hiss(0, L ? 2.6 : 1.4, L ? 0.07 : 0.045, 1100, 0.6); hiss(0.1, L ? 2.2 : 1.1, L ? 0.04 : 0.025, 2400, 1.0);
    for (let i = 0; i < (L ? 26 : 12); i++) hiss(0.1 + Math.random() * (L ? 2.0 : 1.0), 0.05, 0.05, 1800 + Math.random() * 1200, 2.5, 'bandpass'); }
  function sfx(k) { if (k === 'tick') tone(1900, 0.025, 0.018, 'square');
    else if (k === 'chip') { tone(2500, 0.04, 0.03, 'triangle'); setTimeout(() => tone(1700, 0.05, 0.025, 'triangle'), 35); }
    else if (k === 'pick') tone(1200, 0.06, 0.03, 'triangle', 1800);
    else if (k === 'spin') tone(220, 0.5, 0.04, 'sawtooth', 660);
    else if (k === 'stop') tone(330, 0.18, 0.05, 'square', 200);
    else if (k === 'clear') tone(900, 0.08, 0.03, 'triangle', 600);
    else if (k === 'win') [0, 4, 7].forEach((v, i) => setTimeout(() => tone(midiHz(76 + v), 0.16, 0.05, 'triangle'), i * 60));
    else if (k === 'miss') tone(190, 0.22, 0.05, 'square', 120);
    else if (k === 'daba') [0, 4, 7, 12, 16, 19].forEach((v, i) => setTimeout(() => tone(midiHz(72 + v), 0.24, 0.055, 'triangle'), i * 90));
    else if (k === 'close') [0, 5, 9, 12].forEach((v, i) => setTimeout(() => tone(midiHz(72 + v), 0.26, 0.05, 'triangle'), i * 110)); }
  function voice(nt, at0) { const ac = audio.ctx, g = ac.createGain(), o = ac.createOscillator(), dur = nt.d * MUSIC.spb; let peak = 0.02;
    if (nt.v === 'bass') { o.type = 'triangle'; peak = 0.045; } else if (nt.v === 'vibe') { o.type = 'sine'; peak = 0.03; } else { o.type = 'sine'; peak = 0.012; }
    o.frequency.setValueAtTime(midiHz(nt.m), at0); g.gain.setValueAtTime(0.0001, at0); g.gain.exponentialRampToValueAtTime(peak, at0 + 0.014); g.gain.exponentialRampToValueAtTime(0.0001, at0 + dur); o.connect(g); g.connect(bus); o.start(at0); o.stop(at0 + dur + 0.03); }
  function music() { const ac = AC(); if (!ac) return; if (!bus) { bus = ac.createGain(); bus.gain.value = 0.5; bus.connect(audio.master || ac.destination); mStart = ac.currentTime + 0.12; mBar = 0; }
    const L = MUSIC.beats * MUSIC.spb; while (mStart + mBar * L < ac.currentTime + 0.9) { const base = mStart + mBar * L; MUSIC.notes.forEach(nt => { const a = base + nt.b * MUSIC.spb; if (a > ac.currentTime - 0.05) voice(nt, a); }); mBar++; } }
  function killMusic() { if (bus) { try { bus.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.15); const b = bus; setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 800); } catch (e) {} } bus = null; }

  // ---- the game (the 2D rules)
  let s = null, overlay = 'intro', cardInfo = null, open = false, ending = false, openK = 0, chip = 5, flash = null, flashT = 0, idleO = 0, idleI = 0, dabaFx = 0, lastClick = -1, stacks = { o: null, i: null }, gone = [];
  const gold = () => save.data.gold || 0;
  function fresh(round) { const cfg = TABLES[round % TABLES.length]; return { round, cfg, net: 0, spinsLeft: cfg.spins, outer: -1, inner: -1, oAmt: 0, iAmt: 0, staked: 0, oRot: idleO, iRot: idleI, phase: null, spinAt: 0, freeFrom: [0, 0], from: [0, 0], to: [0, 0], mP: 0, mIdx: -1, mult: 1, result: null, dabas: 0, hits: 0, best: 0, done: false }; }
  function say(k) { flash = k; flashT = 1.6; }
  function dropStack(which) { const g = stacks[which]; if (g) { gone.push(g); stacks[which] = null; } }
  function place(ring, i) { if (overlay || !s || s.phase || s.done) return; if (s.result) { s.result = null; }
    const isO = ring === 'outer', cur = isO ? s.outer : s.inner;
    if (cur === i) { const amt = isO ? s.oAmt : s.iAmt; save.addGold(amt); s.staked -= amt; if (isO) { s.outer = -1; s.oAmt = 0; } else { s.inner = -1; s.iAmt = 0; } dropStack(isO ? 'o' : 'i'); sfx('clear'); return; }
    const want = s.outer < 0 ? 'outer' : s.inner < 0 ? 'inner' : null;
    if (ring !== want) { sfx('miss'); say(want ? 'wrong' : 'both'); return; }
    if (!save.spend(chip)) { sfx('miss'); say('gold'); return; }
    s.staked += chip; if (isO) { s.outer = i; s.oAmt = chip; stacks.o = stack(chip, oG, (RM + RO) / 2, i); } else { s.inner = i; s.iAmt = chip; stacks.i = stack(chip, iG, (RI + RM) / 2 + 0.03, i); } sfx('chip'); }
  function spin() { if (overlay || !s || s.done) return; if (s.phase === 'free') { stop(); return; } if (s.phase) return; if (s.result) { s.result = null; sfx('clear'); return; }
    if (s.outer < 0 && s.inner < 0) { sfx('miss'); say('bet'); return; } s.phase = 'free'; s.spinAt = performance.now(); s.freeFrom = [s.oRot, s.iRot]; sfx('spin'); hooks.spin && hooks.spin(); }
  function stop() { if (!s || s.phase !== 'free') return; const oi = Math.floor(Math.random() * 6), ii = Math.floor(Math.random() * 6); s.mIdx = meterIdx(s.mP); s.mult = METER[s.mIdx].m;
    let base = -oi * 60, k = Math.ceil((s.oRot + 720 - base) / 360); const to0 = base + k * 360; base = -ii * 60; k = Math.floor((s.iRot - 720 - base) / 360); const to1 = base + k * 360;
    s.res = { oi, ii }; s.from = [s.oRot, s.iRot]; s.to = [to0, to1]; s.phase = 'brake'; s.spinAt = performance.now(); sfx(s.mult >= 5 ? 'daba' : s.mult > 1 ? 'chip' : 'miss'); }
  function settle() { const { oi, ii } = s.res, oHit = s.outer === oi ? s.oAmt : 0, iHit = s.inner === ii ? s.iAmt : 0, daba = oHit > 0 && iHit > 0;
    let win = (oHit + iHit) * PAYS * s.mult; if (daba) win *= 2; const net = win - s.staked; if (win > 0) save.addGold(win);
    s.net += net; s.best = Math.max(s.best, net); s.spinsLeft--; s.dabas += daba ? 1 : 0; s.hits += win > 0 ? 1 : 0;
    s.result = { oi, ii, oHit: oHit > 0, iHit: iHit > 0, win, daba, net, mult: s.mult }; s.phase = null; s.oRot = s.to[0]; s.iRot = s.to[1];
    if (daba) { sfx('daba'); crowd(2); burst(NC); dabaFx = 3; hooks.cheer && hooks.cheer(2); } else if (win > 0) { sfx('win'); crowd(1); burst(Math.min(NC, 8 + Math.round(win / 4))); hooks.cheer && hooks.cheer(1); } else { sfx('miss'); crowd(-1); }
    drawFloat(daba ? 'DABA!  +' + win : win > 0 ? '+' + win + ' GOLD' : 'NO WIN', daba ? GOLD : win > 0 ? '#8fe38f' : INK); flT = 2.4;
    { const old = [stacks.o, stacks.i]; stacks.o = stacks.i = null; setTimeout(() => old.forEach(g => g && gone.push(g)), 1400); }
    s.outer = s.inner = -1; s.oAmt = s.iAmt = 0; s.staked = 0;
    if (s.spinsLeft <= 0) { s.done = true; const me = s; setTimeout(() => { if (s === me && open) { sfx('close'); finish(); } }, 1800); } }
  function finish() { const t = s.cfg.target, beat = s.net >= t, stars = beat ? 3 : s.net >= t / 2 ? 2 : s.net > 0 ? 1 : 0;
    const prev = save.stat('dsfDabaBest', 0), isBest = s.net > 0 && save.best('dsfDabaBest', s.net); save.setStat('dsfDabaSpins', save.stat('dsfDabaSpins', 0) + s.cfg.spins);
    if (beat) { save.setStat('dsfDabaRound', s.round + 1); if (!save.flag('dsfDabaDone')) save.setFlag('dsfDabaDone'); }
    const pct = clamp(s.net / t, 0, 1), sg = v => (v >= 0 ? '+' : '') + v; overlay = 'card';
    cardInfo = { kicker: s.cfg.name + (beat ? ' \u00b7 beaten' : ''), title: sg(s.net) + ' gold', mood: beat ? 'Table beaten. Quirk is not smiling.' : s.net > 0 ? 'Up on the night, short of the goal.' : 'The house wins tonight.',
      stars, best: isBest ? 'NEW BEST' : 'BEST ' + sg(Math.max(prev, s.net > 0 ? s.net : 0)), gold: sg(s.net) + ' G',
      rows: [{ name: 'Goal ' + sg(t), val: Math.round(pct * 100) + '%', pct: pct * 100 + '%', color: beat ? '#8fe38f' : pct >= 0.5 ? '#ffd23a' : RED }, { name: 'Wins', val: s.hits + '/' + s.cfg.spins, pct: s.hits / s.cfg.spins * 100 + '%', color: '#8fe38f' }],
      notes: [s.dabas ? s.dabas + ' DABA' + (s.dabas > 1 ? 's' : '') + ' tonight. Both rings, double pay.' : 'Hit both rings at once for a DABA: double pay.'], buttons: [beat ? 'NEXT TABLE' : 'PLAY THIS TABLE AGAIN', 'LEAVE THE TABLE'] }; }

  // ---- live canvases
  let pKey = '', bKey = '';
  function txt(c, t, x, y, size, col, w = 900) { c.font = `${w} ${size}px ${FONT}`; c.fillStyle = col; c.textBaseline = 'middle'; c.fillText(t, x, y); }
  function plaqueLines() { if (!s || overlay === 'intro') return ['DABA', 'TAKE A SEAT'];
    if (flash && flashT > 0) return { gold: ['NOT ENOUGH', 'GOLD FOR ' + chip], wrong: ['OUTER RING', 'FIRST'], both: ['BETS DOWN', 'TAP SPIN'], bet: ['PLACE A BET', 'FIRST'] }[flash];
    if (s.done) return ['TABLE', 'CLOSED'];
    if (s.phase === 'free') return ['TAP TO STOP', 'AIM FOR \u00d75'];
    if (s.phase === 'brake') return ['\u00d7' + s.mult, 'ROUND IT GOES'];
    if (s.result && s.outer < 0 && s.inner < 0) { const r = s.result; return r.daba ? ['DABA! \u00d7' + r.mult, '+' + r.win + ' GOLD'] : r.win > 0 ? ['YOU WIN \u00d7' + r.mult, '+' + r.win + ' GOLD'] : ['NO WIN \u00b7 \u00d7' + r.mult, 'BET AGAIN']; }
    if (s.outer < 0) return ['CHIP ' + chip, 'TAP OUTER RING'];
    if (s.inner < 0) return ['INNER RING', 'OR TAP SPIN'];
    return ['BETS DOWN', 'TAP SPIN']; }
  function drawPlaque() { const L = plaqueLines(), k = L.join('|'); if (k === pKey) return; pKey = k; const c = pcv.getContext('2d'), w = pcv.width, h = pcv.height;
    c.fillStyle = '#120d08'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c8a050'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10);
    const fit = (t, size) => { c.font = `900 ${size}px ${FONT}`; const tw = c.measureText(t).width; return tw > w - 60 ? size * (w - 60) / tw : size; };
    txt(c, L[0], 30, h * 0.33, fit(L[0], 104), flash && flashT > 0 ? RED : GOLD); txt(c, L[1], 30, h * 0.72, fit(L[1], 76), INK); ptex.needsUpdate = true; }
  function drawButton() { const lab = !s || s.done ? 'SPIN' : s.phase === 'free' ? 'STOP' : s.phase === 'brake' ? '\u2026' : 'SPIN', k = lab; if (k === bKey) return; bKey = k; const c = bcv.getContext('2d'), w = bcv.width, h = bcv.height;
    c.clearRect(0, 0, w, h); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `900 150px ${FONT}`; c.lineWidth = 14; c.strokeStyle = 'rgba(0,0,0,0.45)'; c.strokeText(lab, w / 2, h / 2 + 8); c.fillStyle = INK; c.fillText(lab, w / 2, h / 2 + 8); btex.needsUpdate = true; }
  function drawFloat(t, col) { const c = fcv.getContext('2d'), w = fcv.width, h = fcv.height; c.clearRect(0, 0, w, h); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `900 150px ${FONT}`; const tw = c.measureText(t).width; if (tw > w - 40) c.font = `900 ${150 * (w - 40) / tw}px ${FONT}`;
    c.lineWidth = 18; c.strokeStyle = '#120d08'; c.strokeText(t, w / 2, h / 2 + 6); c.fillStyle = col; c.fillText(t, w / 2, h / 2 + 6); ftex.needsUpdate = true; }
  drawPlaque(); drawButton();

  let portraitWas = null;
  function layout() { const p = portrait(); if (p === portraitWas) return; portraitWas = p; const yaw = p ? -Math.PI / 2 : 0; for (const y of yawers) y.rotation.y = yaw; pyaw.rotation.y = yaw; plq.position.set(BX, YT, p ? -0.93 : -1.06); }
  function render3D(dt, T) { const now = performance.now(); openK = open && !ending ? Math.min(1, openK + dt / 1.1) : Math.max(0, openK - dt / 0.9); layout();
    const e = openK * openK * (3 - 2 * openK); chan.position.y = chanY0 + (chanY1 - chanY0) * e; for (const r of rods) { const len = Math.max(0.05, 9 - chan.position.y); r.scale.y = len; r.position.y = chan.position.y + len / 2; }
    chanGlow.forEach((g2, i) => { g2.material.opacity = (0.5 - e * 0.3) + 0.04 * Math.sin(T * 2 + i); }); pool.material.opacity = 0.3 + 0.15 * e;
    const [fr, fi] = root.userData.ring; fi.material.opacity = 0.12 + 0.1 * Math.sin(T * 3); fr.scale.setScalar(1 + 0.04 * Math.sin(T * 3)); fr.visible = fi.visible = !open;
    // the wheel (idle drift when nobody plays)
    if (s && open) { if (s.phase === 'free') { const el = now - s.spinAt; s.mP = meterPos(el); s.oRot = s.freeFrom[0] + el * 0.62; s.iRot = s.freeFrom[1] - el * 0.78; if (el > 8000) stop(); }
      else if (s.phase === 'brake') { const t = clamp((now - s.spinAt) / 1500, 0, 1), k = 1 - Math.pow(1 - t, 3); s.oRot = s.from[0] + (s.to[0] - s.from[0]) * k; s.iRot = s.from[1] + (s.to[1] - s.from[1]) * k; if (t >= 1) { sfx('stop'); settle(); } }
      if (s.phase) { const cr = Math.floor(Math.abs(s.oRot) / STEP); if (cr !== lastClick) { lastClick = cr; sfx('tick'); } }
      idleO = s.oRot; idleI = s.iRot; } else { idleO += dt * 14; idleI -= dt * 18; }
    oG.rotation.y = -idleO * Math.PI / 180; iG.rotation.y = -idleI * Math.PI / 180;
    // overlays: which ring to bet (pulse), your bets (steady), the result (gold on a hit)
    const want = s && open && !overlay && !s.phase && !s.done ? (s.outer < 0 ? 'outer' : s.inner < 0 ? 'inner' : null) : null, pul = 0.5 + 0.5 * Math.sin(T * 5), r = s && open ? s.result : null, showR = r && s.outer < 0 && s.inner < 0;
    for (let i = 0; i < 6; i++) { const o = ovO[i], n = ovI[i];
      o.material.opacity = s && s.outer === i ? 0.45 : showR && r.oi === i ? (r.oHit ? 0.55 + 0.35 * pul : 0.3) : want === 'outer' ? 0.06 + 0.12 * pul : 0; o.material.color.set(showR && r.oi === i && r.oHit ? GOLD : '#ffffff');
      n.material.opacity = s && s.inner === i ? 0.45 : showR && r.ii === i ? (r.iHit ? 0.55 + 0.35 * pul : 0.3) : want === 'inner' ? 0.06 + 0.12 * pul : 0; n.material.color.set(showR && r.ii === i && r.iHit ? GOLD : '#ffffff'); }
    for (let i = gone.length - 1; i >= 0; i--) { const g2 = gone[i]; g2.userData.t += dt; const k = 1 - g2.userData.t / 0.4; if (k <= 0) { g2.parent && g2.parent.remove(g2); gone.splice(i, 1); } else g2.scale.setScalar(k); }
    // chips in the rack: the selected one floats with a gold halo
    for (const c of rack) { const sel = open && c.v === chip; c.lift += ((sel ? 1 : 0) - c.lift) * Math.min(1, dt * 10); c.top.position.y = 0.14 + c.lift * (0.1 + 0.02 * Math.sin(T * 4)); c.halo.material.opacity = c.lift * (0.5 + 0.3 * pul); }
    // meter
    const mOn = s && open && (s.phase || (s.result && !s.done && s.mIdx >= 0)); marker.visible = !!(s && open); mGlow.material.opacity = s && s.phase === 'free' ? 0.8 : 0.3;
    if (s) marker.position.z = mGlow.position.z = -ML / 2 + s.mP * ML;
    bands.forEach((b, i) => { b.hl.material.opacity = mOn && s.phase !== 'free' && s.mIdx === i ? 0.6 + 0.4 * pul : s && s.phase === 'free' && METER[i].m === 5 ? 0.35 * pul : 0; });
    // button: pulse when it is the next thing to press, sinks when spinning
    const ready = s && open && !overlay && !s.done && ((s.outer >= 0 || s.inner >= 0) && !s.phase || s.phase === 'free');
    capM.color.set(!s || !open || ready || s.phase ? RED : '#7a2a22'); cap.position.y = s && s.phase === 'brake' ? -0.05 : 0; bHalo.material.opacity = ready ? 0.25 + 0.5 * pul : 0; bHalo.scale.setScalar(1 + (ready ? 0.06 * pul : 0));
    // bulbs: twinkle idle, chase while spinning, all flash on a DABA
    dabaFx = Math.max(0, dabaFx - dt); const spinning = s && open && s.phase; for (let i = 0; i < NB; i++) { let v;
      if (dabaFx > 0) v = Math.sin(T * 18) > 0 ? 1 : 0.2; else if (spinning) v = ((i - Math.floor(T * 22)) % 4 + 4) % 4 === 0 ? 1 : 0.25; else v = 0.55 + 0.25 * Math.sin(T * 1.5 + i * 0.7);
      bulbs.setColorAt(i, bc.set(dabaFx > 0 && i % 2 ? '#ec3013' : '#ffcf8a').multiplyScalar(v)); } bulbs.instanceColor.needsUpdate = true;
    // result banner + coins
    flT = Math.max(0, flT - dt); fMat.opacity = flT > 0 ? Math.min(1, flT / 0.4, (2.4 - flT) / 0.15 + 0.01) : 0; fl.position.y = YT + 0.45 + (2.4 - flT) * 0.12;
    for (let i = 0; i < NC; i++) { const c = CP[i]; if (c.t > 0) { c.t -= dt; c.vy -= 9 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt; c.r += dt * 9; if (c.y < YT + 0.02) { c.y = YT + 0.02; c.vy *= -0.35; c.vx *= 0.6; c.vz *= 0.6; } if (Math.abs(c.x) > TW / 2 - 0.2) c.vx *= -0.5; if (Math.abs(c.z) > TD / 2 - 0.2) c.vz *= -0.5; }
      cO.position.set(c.x, c.t > 0 ? c.y : -9, c.z); cO.rotation.set(c.r, c.r * 0.7, 0); cO.scale.setScalar(c.t > 0 ? Math.min(1, c.t * 2) : 0.001); cO.updateMatrix(); coins.setMatrixAt(i, cO.matrix); } coins.instanceMatrix.needsUpdate = true;
    flashT = Math.max(0, flashT - dt); if (flashT <= 0) flash = null; drawPlaque(); drawButton(); }

  return {
    title: 'DABA', where: 'Quirk\u2019s Bar \u00b7 CELESTE DEALS', W: SW * 100, H: SH * 100,
    surface: { c: new THREE.Vector3(OX + at.x, YT + 0.1, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: SW, h: SH, maxD: 6.2, maxY: 8.3 },
    stand: { x: OX + at.x + stX, z: at.z + stZ, face: Math.PI }, _s: () => s,
    idle(dt, T) { if (!open) render3D(dt, T); },
    begin() { open = true; ending = false; overlay = 'intro'; s = fresh(save.stat('dsfDabaRound', 0) % TABLES.length); pKey = bKey = ''; hooks.deal && hooks.deal(true); },
    end() { ending = true; killMusic(); if (s && s.staked > 0) { save.addGold(s.staked); s.staked = 0; } if (s) { s.phase = null; s.outer = s.inner = -1; } dropStack('o'); dropStack('i'); open = false; hooks.deal && hooks.deal(false); },
    tick(dt, T, fly) { if (!open) return; if (fly > 0.85 && !ending && overlay === null && s && !s.done) music(); else if (overlay !== null || ending) killMusic(); render3D(dt, T); },
    down(x, y) { if (overlay || !s || s.done) return; const lx = x / 100 - SW / 2, lz = y / 100 - SH / 2;
      if (s.phase === 'free') { stop(); return; }
      if (Math.hypot(lx - BX, lz - BZ) < 0.62) { spin(); return; }
      for (let i = 0; i < CHIPS.length; i++) if (Math.hypot(lx - CXR, lz - chipZ(i)) < 0.3) { if (s.phase) return; chip = CHIPS[i]; sfx('pick'); return; }
      const dx = lx - WX, dz = lz - WZ, rr = Math.hypot(dx, dz); if (s.phase || rr < RI - 0.04 || rr > RO + 0.06) return;
      const th = Math.atan2(dx, -dz) * 180 / Math.PI, ring = rr >= RM - 0.01 ? 'outer' : 'inner', rot = ring === 'outer' ? s.oRot : s.iRot, i = ((Math.round((th - rot) / STEP) % 6) + 6) % 6; place(ring, i); },
    move() {}, up() {},
    hud() { if (overlay === 'intro') { const t = s ? s.cfg : TABLES[0], g = gold();
        return { card: { kicker: 'Quirk\u2019s Bar \u00b7 ' + t.name, title: 'Daba', body: g > 0 ? 'Pick a chip. Bet one colour on the outer ring, then the inner. SPIN, then STOP on a big \u00d7. Both rings hit = DABA, double pay. You bet real gold. Goal: +' + t.target + ' in ' + t.spins + ' spins.' : 'You have no gold to bet. Come back with some, STEWARD.', buttons: g > 0 ? ['TAKE A SEAT', 'NOT NOW'] : ['NOT NOW'] } }; }
      if (overlay === 'card' && cardInfo) return { card: cardInfo };
      if (!s) return {}; const n = s.net, t = s.cfg.target;
      return { showStats: true, stats: [['Gold', String(gold()), '#ffd23a'], ['Net', (n >= 0 ? '+' : '') + n + '/' + t, n >= t ? '#8fe38f' : n < 0 ? RED : INK], ['Spins', String(s.spinsLeft), INK]] }; },
    cardPick(i) { if (overlay === 'intro') { if (i === 0 && gold() > 0) { tone(660, 0.12, 0.04, 'triangle'); overlay = null; } else return 'leave'; return; }
      if (overlay === 'card') { if (i === 0) { s = fresh(save.stat('dsfDabaRound', 0) % TABLES.length); overlay = null; cardInfo = null; if (gold() <= 0) overlay = 'intro'; } else return 'leave'; } },
  };
}
