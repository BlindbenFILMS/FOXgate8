// AIRLOCK 3 · RUNABOUT VOLE [dsfShip] (s350): the docking-ring vestibule, the airlock [dsfLockInner] → [dsfLockOuter] with a real
// cycle (amber lamp, hiss, one door at a time), and the U.S.S. VOLE (NCC-72451) docked behind it: rear cabin + transport pad,
// cockpit with the HELM (launch to Kufa Station [dsfOutKu], a coming build). Built far from the ring at (OX, 0, 0); ring door south.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
export const VB = { OX: 5600, hw: 7, hd: 15, h: 5, door: { x: 0, z: 14.2 }, enter: { x: 0, z: 12 }, helm: { x: -1.2, z: -9.5 }, panels: [{ x: 2.6, z: 9.0 }, { x: 1.7, z: 5.5 }, { x: 2.6, z: 1.6 }] };
export function buildShip(K) {
  const { THREE, scene, M, BOX, toon, basic, rnd, rr, LOW } = K;
  const g = new THREE.Group(); g.position.set(VB.OX, 0, 0); scene.add(g);
  const anims = [];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, p = g) => M(BOX(w, h, d), mat, x, y, z, p, 0);
  const C = (r1, r2, h, mat, x, y, z, seg = 16, p = g) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0);
  const plane = (w, h, mat, x, y, z, ry = 0, p = g) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#0b1218') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry); };
  const amber = '#ffb454', cyan = '#7fd8ff', yel = toon('#e8c45a'), trim = toon('#24282e'), hull = toon('#5a6068'), wallM = toon('#3a3e44', { side: THREE.DoubleSide });
  const floor = (x0, x1, z0, z1, col) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), toon(col)); f.rotation.x = -Math.PI / 2; f.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); g.add(f); const c = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), toon('#1e2228', { side: THREE.DoubleSide })); c.rotation.x = Math.PI / 2; c.position.set((x0 + x1) / 2, VB.h, (z0 + z1) / 2); g.add(c); };
  // ---- the vestibule on the docking ring (z 8..15) ----
  floor(-7, 7, 8, 15, '#3a3632'); B(1.4, 0.02, 7, basic(amber, 0.5), 0, 0.012, 11.5);
  B(14, VB.h, 0.3, wallM, 0, VB.h / 2, 15.1).visible = false; for (const s of [-1, 1]) B(5.7, VB.h, 0.3, wallM, s * 4.15, VB.h / 2, 15.1); B(2.6, VB.h - 3.4, 0.3, wallM, 0, 3.4 + (VB.h - 3.4) / 2, 15.1);
  for (const s of [-1, 1]) B(0.16, 3.4, 0.36, basic(amber), s * 1.3, 1.7, 15.1);
  B(0.3, VB.h, 7, wallM, -7, VB.h / 2, 11.5);
  // east wall: the long window onto the Vole's nose, docked alongside
  B(0.3, 0.9, 7, wallM, 7, 0.45, 11.5); B(0.3, 0.8, 7, wallM, 7, VB.h - 0.4, 11.5); for (const z of [8.2, 10.5, 12.8, 14.9]) B(0.3, VB.h, 0.25, trim, 7, VB.h / 2, z);
  plane(6.8, 3.3, new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide }), 7, 2.55, 11.5, -Math.PI / 2);
  { const st = tex(canvas(1024, 512, (c, w, h) => { c.fillStyle = '#02030a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(255,255,255,${(0.3 + rnd() * 0.7).toFixed(2)})`; c.fillRect(rnd() * w, rnd() * h, 1.6, 1.6); } const ng = c.createRadialGradient(w * 0.3, h * 0.4, 10, w * 0.3, h * 0.4, 300); ng.addColorStop(0, 'rgba(120,70,180,0.35)'); ng.addColorStop(1, 'rgba(120,70,180,0)'); c.fillStyle = ng; c.fillRect(0, 0, w, h); }));
    plane(60, 30, new THREE.MeshBasicMaterial({ map: st, toneMapped: false }), 40, 3, 11.5, -Math.PI / 2); }
  { const v = new THREE.Group(); v.position.set(14, 1.4, 9.5); g.add(v); const vh = toon('#c8ccd2'), vd = toon('#5a6068');
    M(BOX(4.0, 2.4, 11), vh, 0, 0, 0, v, 0.03); const nose = M(new THREE.CylinderGeometry(0.01, 2.0, 3.4, 4, 1), vh, 0, -0.1, 7.2, v, 0.03); nose.rotation.x = Math.PI / 2; nose.rotation.y = Math.PI / 4; nose.scale.set(1.4, 1, 0.85);
    M(BOX(3.0, 0.5, 2.0), basic('#7fd8ff', 0.85), 0, 0.75, 5.6, v, 0); for (const s of [-1, 1]) { const n = M(BOX(1.0, 0.9, 8), vd, s * 3.0, -0.7, -1.0, v, 0.03); void n; M(BOX(0.6, 0.5, 6.4), basic('#5fb8ff', 0.9), s * 3.0, -0.7, -1.0, v, 0); M(BOX(1.6, 0.25, 2.4), vd, s * 2.1, -0.6, -1.0, v, 0); }
    M(BOX(4.1, 0.2, 0.2), basic('#b3121b'), 0, 0.5, 2.0, v, 0); const lbl = sign(['NCC-72451', 'U.S.S. VOLE'], 3.2, 0.9, '#b3121b', 0, 0, 0, -Math.PI / 2, '#c8ccd2'); v.add(lbl); lbl.position.set(-2.02, 0.2, 0.5);
    const blink = M(new THREE.SphereGeometry(0.16, 8, 6), basic('#ff3a2a'), -2.1, 1.3, -5.0, v, 0); anims.push((dt, t) => { blink.visible = (t % 1.6) < 0.25; v.position.y = 1.4 + Math.sin(t * 0.6) * 0.06; }); }
  sign(['AIRLOCK 3', 'RUNABOUT VOLE · NCC-72451'], 6, 1.2, amber, -6.83, 3.7, 11.5, Math.PI / 2);
  B(3.0, 0.45, 0.8, toon('#4a4038'), -5.9, 0.25, 12.6); // waiting bench
  // ---- a round cog door (rolls aside into the wall) ----
  const cogDoor = (z, label) => { const fr = new THREE.Group(); fr.position.set(0, 0, z); g.add(fr);
    for (const s of [-1, 1]) M(BOX(s < 0 ? 5.5 : 5.5, VB.h, 0.5), wallM, s * 4.25, VB.h / 2, 0, fr, 0); M(BOX(3.0, VB.h - 3.4, 0.5), wallM, 0, 3.4 + (VB.h - 3.4) / 2, 0, fr, 0); M(BOX(3.0, 0.1, 0.5), wallM, 0, 0.05, 0, fr, 0);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.2, 8, 36), yel); ring.position.set(0, 1.75, 0.27); fr.add(ring); const ring2 = ring.clone(); ring2.position.z = -0.27; fr.add(ring2);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; for (const zz of [0.27, -0.27]) { const tth = M(BOX(0.34, 0.34, 0.14), yel, Math.cos(a) * 1.92, 1.75 + Math.sin(a) * 1.92, zz, fr, 0); tth.rotation.z = a; } }
    const dg = new THREE.Group(); dg.position.set(0, 1.75, 0); fr.add(dg); const dt = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#4a5058'; c.beginPath(); c.arc(w / 2, w / 2, w / 2, 0, 7); c.fill(); c.strokeStyle = '#2a2e34'; c.lineWidth = 10; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(w / 2, w / 2); c.lineTo(w / 2 + Math.cos(k * 2.094) * w / 2, w / 2 + Math.sin(k * 2.094) * w / 2); c.stroke(); } c.fillStyle = '#e8c45a'; c.beginPath(); c.arc(w / 2, w / 2, 26, 0, 7); c.fill(); }));
    const disc = M(new THREE.CylinderGeometry(1.5, 1.5, 0.18, 32), new THREE.MeshToonMaterial({ map: dt }), 0, 0, 0, dg, 0); disc.rotation.x = Math.PI / 2;
    const lamp = new THREE.MeshBasicMaterial({ color: 0xd23a2a, toneMapped: false }); for (const zz of [0.3, -0.3]) M(BOX(0.6, 0.22, 0.1), lamp, 0, 3.95, zz, fr, 0);
    sign([label], 2.2, 0.42, amber, 0, 4.45, z + 0.27); sign([label], 2.2, 0.42, amber, 0, 4.45, z - 0.27, Math.PI);
    return { dg, disc, lamp, open: 0, want: 0, z }; };
  const inner = cogDoor(8, 'INNER DOOR'), outer = cogDoor(3, 'OUTER DOOR');
  // ---- the airlock chamber (z 3..8): amber beacon, side walls, the CYCLE panels ----
  floor(-2.5, 2.5, 3, 8, '#2a2c30'); for (const s of [-1, 1]) B(0.3, VB.h, 5, wallM, s * 2.5, VB.h / 2, 5.5);
  { const hz = tex(canvas(256, 32, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#1a1414' : '#f2c94c'; c.beginPath(); c.moveTo(i * 16, 0); c.lineTo(i * 16 + 16, 0); c.lineTo(i * 16 + 8, h); c.lineTo(i * 16 - 8, h); c.fill(); } })); hz.wrapS = THREE.RepeatWrapping; hz.repeat.set(2, 1);
    for (const z of [3.5, 7.5]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.3), toon('#ffffff', { map: hz })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.013, z); g.add(m); } }
  const bea = new THREE.Group(); bea.position.set(0, VB.h - 0.3, 5.5); g.add(bea); C(0.3, 0.3, 0.3, basic(amber, 0.6), 0, 0, 0, 12, bea); const beam = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.4), new THREE.MeshBasicMaterial({ color: 0xffb454, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); beam.rotation.x = -Math.PI / 2; bea.add(beam);
  const mist = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.2, 4.4), new THREE.MeshBasicMaterial({ color: 0xdde8ff, transparent: true, opacity: 0, depthWrite: false })); mist.position.set(0, 1.6, 5.5); g.add(mist);
  const panel = (x, z, ry) => { const p = new THREE.Group(); p.position.set(x, 1.4, z); p.rotation.y = ry; g.add(p); M(BOX(0.7, 0.9, 0.12), trim, 0, 0, 0, p, 0); const sc = M(BOX(0.5, 0.36, 0.04), new THREE.MeshBasicMaterial({ color: 0x3ad26a, toneMapped: false }), 0, 0.15, 0.07, p, 0); M(BOX(0.24, 0.16, 0.06), basic(amber), 0, -0.22, 0.07, p, 0); return sc.material; };
  const pmats = [panel(2.6, 8.35, 0), panel(2.32, 5.5, -Math.PI / 2), panel(2.6, 2.65, Math.PI)];
  sign(['CYCLE', 'PANEL'], 0.9, 0.5, amber, 2.6, 2.25, 8.37); sign(['CYCLE AIRLOCK', 'ONE DOOR AT A TIME'], 1.8, 0.6, amber, 2.33, 2.4, 5.5, -Math.PI / 2);
  // ---- the U.S.S. VOLE (z -14..3): rear cabin + transport pad, cockpit + helm ----
  floor(-4, 4, -14, 3, '#2e3238'); B(8, VB.h, 0.3, wallM, 0, VB.h / 2, -14.1); for (const s of [-1, 1]) B(0.3, VB.h, 17, toon('#c8ccd2', { side: THREE.DoubleSide }), s * 4, VB.h / 2, -5.5);
  for (const s of [-1, 1]) B(0.04, 0.12, 17, basic(cyan, 0.9), s * 3.83, 1.0, -5.5);
  for (const z of [1, -3, -7]) B(8, 0.08, 0.6, basic('#e8f4ff'), 0, VB.h - 0.05, z);
  sign(['U.S.S. VOLE', 'NCC-72451 · RUNABOUT'], 3.6, 0.9, cyan, -3.83, 3.6, -1.0, Math.PI / 2);
  for (const s of [-1, 1]) { B(0.9, 0.5, 4.2, toon('#3a4a5a'), s * 3.3, 0.25, -0.6); B(0.2, 0.9, 4.2, toon('#3a4a5a'), s * 3.72, 0.8, -0.6); }
  { const pad = C(1.1, 1.2, 0.14, toon('#4a5260'), 0, 0.07, -4.2, 24); void pad; const pr = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.05, 6, 32), basic(cyan)); pr.rotation.x = Math.PI / 2; pr.position.set(0, 0.16, -4.2); g.add(pr); anims.push((dt, t) => { pr.material.opacity = 1; pr.scale.setScalar(1 + Math.sin(t * 2) * 0.03); }); }
  // cockpit divider with an opening, the console, two seats, the viewscreen
  for (const s of [-1, 1]) B(2.4, VB.h, 0.2, wallM, s * 2.8, VB.h / 2, -7.5); B(3.2, VB.h - 3.0, 0.2, wallM, 0, 3.0 + (VB.h - 3.0) / 2, -7.5);
  B(7.4, 1.0, 1.4, trim, 0, 0.5, -12.9); { const cs = B(7.2, 0.06, 1.2, basic('#3a6a8a', 0.9), 0, 1.04, -12.8); cs.rotation.x = 0.25; for (let i = 0; i < (LOW ? 6 : 14); i++) B(0.2, 0.04, 0.14, basic(['#ff5a3a', '#7fd8ff', '#f2c94c', '#3ad26a'][i % 4]), -3 + i * (6 / (LOW ? 6 : 14)), 1.1, -12.6); }
  for (const x of [-1.2, 1.2]) { C(0.12, 0.2, 0.5, trim, x, 0.25, -10.9, 10); B(0.9, 0.18, 0.9, toon('#3a4a5a'), x, 0.6, -10.9); B(0.9, 1.1, 0.18, toon('#3a4a5a'), x, 1.15, -10.4); }
  sign(['HELM', 'PILOT SEAT'], 1.1, 0.5, cyan, -1.2, 1.95, -10.3);
  const vs = canvas(1024, 384, () => {}), vst = tex(vs), vctx = vs.getContext('2d'); const STARS = Array.from({ length: 220 }, () => [rr(-1, 1), rr(-1, 1), rr(0.05, 1)]); let warp = 0;
  const drawView = () => { vctx.fillStyle = '#02030a'; vctx.fillRect(0, 0, 1024, 384); for (const s of STARS) { const k = 1 / s[2], x = 512 + s[0] * 512 * k * 0.5, y = 192 + s[1] * 192 * k * 0.5; vctx.strokeStyle = `rgba(220,235,255,${Math.min(1, 1.2 - s[2]).toFixed(2)})`; vctx.lineWidth = 1.6; vctx.beginPath(); vctx.moveTo(x, y); const L = warp * 40 * k; vctx.lineTo(x + s[0] * L, y + s[1] * L); vctx.stroke(); if (!warp) vctx.fillRect(x, y, 1.6, 1.6); } vst.needsUpdate = true; };
  drawView(); plane(7.0, 2.6, new THREE.MeshBasicMaterial({ map: vst, toneMapped: false }), 0, 2.7, -13.9); B(7.3, 0.25, 0.2, trim, 0, 4.1, -13.85); B(7.3, 0.25, 0.2, trim, 0, 1.3, -13.85);
  let vacc = 0; anims.push(dt => { if (warp > 0 || vacc < 0) { for (const s of STARS) { s[2] -= dt * (0.08 + warp * 1.4); if (s[2] < 0.05) { s[0] = rr(-1, 1); s[1] = rr(-1, 1); s[2] = 1; } } vacc += dt; if (vacc > 0.05) { vacc = 0; drawView(); } } });
  // ---- the airlock cycle ----
  const L = { state: 'station', t: 0, to: null };
  const zone = z => z > 8.4 ? 'ring' : z > 2.6 ? 'lock' : 'ship';
  function cycle(pz, audio) { if (L.state === 'cycling') return 'busy'; const z = zone(pz), target = z === 'ring' ? 'station' : z === 'ship' ? 'ship' : L.state === 'station' ? 'ship' : 'station'; if (target === L.state) return 'open';
    L.state = 'cycling'; L.to = target; L.t = 2.8; if (audio) { audio.tone(220, 0.25, 0.05, 'square'); setTimeout(() => audio.tone(180, 2.2, 0.025, 'sawtooth', 0.6), 300); } return 'cycling'; }
  function tick(dt, t, lx, lz) { if (L.state === 'cycling') { L.t -= dt; if (L.t <= 0) L.state = L.to; }
    const near = d => Math.hypot(lx, lz - d.z) < 3.4; inner.want = L.state === 'station' && (near(inner) || zone(lz) === 'lock') ? 1 : 0; outer.want = L.state === 'ship' && (near(outer) || zone(lz) === 'lock') ? 1 : 0;
    for (const d of [inner, outer]) { d.open += (d.want - d.open) * Math.min(1, dt * 4); d.dg.position.x = d.open * 2.9; d.disc.rotation.y = d.open * 4; d.lamp.color.set(L.state === 'cycling' ? 0xffb454 : d.open > 0.5 ? 0x3ad26a : 0xd23a2a); }
    const cyc = L.state === 'cycling'; bea.rotation.y += dt * (cyc ? 6 : 0); beam.material.opacity = cyc ? 0.45 : 0; mist.material.opacity = cyc ? 0.18 * Math.sin(Math.PI * (L.t / 2.8)) : 0;
    for (const m of pmats) m.color.set(cyc ? (Math.sin(t * 10) > 0 ? 0xffb454 : 0x3a2a10) : 0x3ad26a); }
  function walk(x, z) { if (z > 15.6) return false; if (z > 14.6) return Math.abs(x) < 1.1; if (z > 8.5) return Math.abs(x) < 6.5 && !(x < -4.3 && z > 12.0 && z < 13.2) && !(x > 2.1 && x < 3.1 && z < 9.2);
    if (z > 7.5) return Math.abs(x) < 1.1 && inner.open > 0.7; if (z > 3.5) return Math.abs(x) < 2.0; if (z > 2.5) return Math.abs(x) < 1.1 && outer.open > 0.7;
    if (z > -7.2) return Math.abs(x) < 3.4 && !(Math.abs(x) > 2.6 && z > -2.9 && z < 1.7) && !(x > 2.1 && z > 2.0); if (z > -7.8) return Math.abs(x) < 1.4; return Math.abs(x) < 3.4 && z > -12.0 && !(Math.abs(Math.abs(x) - 1.2) < 0.6 && z > -11.5 && z < -10.1); }
  function clampCam(v) { const z = zone(v.z); if (v.z > 8.6) { v.x = Math.max(-6.5, Math.min(6.5, v.x)); v.z = Math.min(v.z, 14.6); } else if (v.z > 2.4) v.x = Math.max(-2.0, Math.min(2.0, v.x)); else { v.x = Math.max(-3.5, Math.min(3.5, v.x)); v.z = Math.max(v.z, -13.5); } v.y = Math.min(v.y, VB.h - 0.4); void z; }
  const label = z => { const k = zone(z); return k === 'ring' ? 'Deep Space Fox · Airlock 3' : k === 'lock' ? 'Deep Space Fox · Airlock [dsfLockInner]' : 'U.S.S. Vole · NCC-72451'; };
  const setWarp = w => { warp = w; vacc = -1; if (!w) setTimeout(() => { vacc = 0; drawView(); }, 50); };
  return { g, anims, walk, tick, cycle, clampCam, label, zone, L, setWarp };
}
