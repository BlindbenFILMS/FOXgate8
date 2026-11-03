// QUIRK'S HOLOSUITES [dsfHolosuites] interior (s351): Quirk's sport venue. Lobby (booking desk + Pix, programs board, bench)
// then a partition with SUITE ONE's arch (free) and SUITE TWO / THREE (booked, red lamps). Behind it the HOLODECK: black room,
// glowing orange grid on every surface. Book a program = a scan sweep, then the court / batting cage / ring appears as a hologram.
// Built far from the ring at (OX, 0, 0). Local frame: promenade door south (z = +hd).
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
export const HB = { OX: 9000, hw: 12, hd: 10, h: 6.5, door: { x: 0, z: 9.2 }, enter: { x: 0, z: 6.4 }, hiring: { x: -9.4, z: 7.2 }, keeper: { x: 7.2, z: 3.7 }, desk: { x: 7.2, z: 5.0 }, part: 1.5, arch: { x: 2.9, z: 0.9 }, deck: { x: 0, z: -4.5 } };
export const PROGRAMS = [['tennis', 'TENNIS COURT'], ['cage', 'BATTING CAGE'], ['ring', 'BOXING RING']];
export function buildHolo(K) {
  const { THREE, scene, M, BOX, toon, basic, rr, LOW } = K;
  const g = new THREE.Group(); g.position.set(HB.OX, 0, 0); scene.add(g);
  const anims = [], blocks = [], circles = [];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, p = g) => M(BOX(w, h, d), mat, x, y, z, p, 0);
  const C = (r1, r2, h, mat, x, y, z, seg = 16, p = g) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0);
  const plane = (w, h, mat, x, y, z, ry = 0, p = g) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#120e16') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry); };
  const { hw, hd, h, part } = HB, ORANGE = '#ff9a3a';
  // ---- LOBBY (z part..hd): hex-tiled dark walls, warm orange strip lights, a booking desk, a bench
  const hex = tex(canvas(256, 222, (c, W, H) => { c.fillStyle = '#1e1a26'; c.fillRect(0, 0, W, H); c.strokeStyle = '#2e2838'; c.lineWidth = 5; const r = 32, dx = r * 1.5, dy = r * Math.sqrt(3);
    for (let i = -1; i < 7; i++) for (let j = -1; j < 5; j++) { const cx = i * dx, cy = j * dy + (i % 2 ? dy / 2 : 0); c.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } c.closePath(); c.stroke(); } }));
  hex.wrapS = hex.wrapT = THREE.RepeatWrapping; hex.repeat.set(6, 2);
  const lobbyWall = toon('#ffffff', { map: hex });
  const lf = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd - part), toon('#18141e')); lf.rotation.x = -Math.PI / 2; lf.position.set(0, 0.001, (hd + part) / 2); g.add(lf);
  B(2.4, 0.02, hd - part - 1, toon('#3a2414'), 0, 0.012, (hd + part) / 2 + 0.4); B(2.6, 0.019, hd - part - 1, basic(ORANGE), 0, 0.01, (hd + part) / 2 + 0.4);
  for (const s of [-1, 1]) B(0.3, h, hd - part, lobbyWall, s * hw, h / 2, (hd + part) / 2);
  B(hw - 1.5, h, 0.3, lobbyWall, -(hw + 1.5) / 2, h / 2, hd); B(hw - 1.5, h, 0.3, lobbyWall, (hw + 1.5) / 2, h / 2, hd); B(3, h - 3.3, 0.3, lobbyWall, 0, 3.3 + (h - 3.3) / 2, hd);
  for (const s of [-1, 1]) B(0.16, 3.3, 0.36, basic(ORANGE), s * 1.5, 1.65, hd); B(3.2, 0.16, 0.36, basic(ORANGE), 0, 3.3, hd);
  for (const s of [-1, 1]) B(0.08, 0.08, hd - part, basic(ORANGE), s * (hw - 0.2), 4.2, (hd + part) / 2);
  { const ce = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd - part), toon('#141018', { side: THREE.DoubleSide })); ce.rotation.x = Math.PI / 2; ce.position.set(0, h, (hd + part) / 2); g.add(ce); }
  for (const x of [-6, 0, 6]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 6, 24), basic(ORANGE)); r.rotation.x = Math.PI / 2; r.position.set(x, h - 0.15, 5.5); g.add(r); }
  // booking desk (east) with a glowing console top; Pix stands behind it (north side)
  const D = HB.desk; B(3.4, 1.05, 1.2, toon('#2a2232'), D.x, 0.53, D.z); B(3.5, 0.08, 1.3, basic(ORANGE), D.x, 1.08, D.z); blocks.push([D.x - 1.7, D.x + 1.7, D.z - 0.6, D.z + 0.6]);
  const scr = B(1.0, 0.6, 0.06, basic('#ffb870'), D.x - 0.6, 1.45, D.z - 0.3); scr.rotation.x = -0.3; anims.push((dt, t) => { scr.material.color.setHSL(0.08, 1, 0.62 + Math.sin(t * 3) * 0.06); });
  sign(['PROGRAMS', 'COURT · CAGE · RING'], 3.2, 1.2, ORANGE, hw - 0.17, 3.0, D.z, -Math.PI / 2);
  sign(["QUIRK'S HOLOSUITES", 'BOOK A PROGRAM AT THE DESK'], 7.0, 1.2, ORANGE, 0, 5.3, hd - 0.17, Math.PI);
  B(3.0, 0.45, 0.8, toon('#3a2414'), -8.2, 0.23, 4.2); B(3.0, 0.7, 0.15, toon('#3a2414'), -8.2, 0.8, 3.8); blocks.push([-9.7, -6.7, 3.6, 4.7]);
  C(0.32, 0.26, 0.55, toon('#2a2232'), -10.8, 0.28, 2.6, 12); C(0.05, 0.45, 1.2, toon('#4f8a3a'), -10.8, 1.1, 2.6, 7); circles.push([-10.8, 2.6, 0.45]);
  // NOW HIRING
  sign(['NOW HIRING', 'HOLO TECH · ASK PIX'], 2.2, 1.1, '#ec3013', HB.hiring.x, 1.9, HB.hiring.z - 0.06); B(2.3, 1.2, 0.08, toon('#2a1a12'), HB.hiring.x, 1.9, HB.hiring.z - 0.12); C(0.05, 0.05, 1.3, basic(ORANGE), HB.hiring.x, 0.65, HB.hiring.z - 0.12, 6); circles.push([HB.hiring.x, HB.hiring.z - 0.12, 0.45]);
  // ---- PARTITION (z = part): SUITE ONE arch in the middle, SUITE TWO (west) + THREE (east) shut
  const pw = toon('#221c2a');
  B(hw - 2.6, h, 0.4, pw, -(hw + 2.6) / 2, h / 2, part); B(hw - 2.6, h, 0.4, pw, (hw + 2.6) / 2, h / 2, part); B(5.2, h - 4.0, 0.4, pw, 0, 4.0 + (h - 4.0) / 2, part);
  blocks.push([-hw, -2.5, part - 0.25, part + 0.25], [2.5, hw, part - 0.25, part + 0.25]);
  for (const s of [-1, 1]) B(0.25, 4.0, 0.6, basic(ORANGE), s * 2.6, 2.0, part); B(5.45, 0.25, 0.6, basic(ORANGE), 0, 4.0, part);
  sign(['SUITE ONE', 'FREE · STEP IN'], 3.4, 0.9, ORANGE, 0, 4.85, part + 0.22);
  const freeLamp = C(0.16, 0.16, 0.1, basic('#44e27a'), 0, 5.55, part + 0.25, 12); freeLamp.rotation.x = Math.PI / 2;
  for (const [x, n] of [[-8, 'SUITE TWO'], [8, 'SUITE THREE']]) { B(2.2, 3.2, 0.12, toon('#3a3044'), x, 1.6, part + 0.22); B(0.06, 3.2, 0.14, basic(ORANGE), x, 1.6, part + 0.24);
    const lamp = C(0.14, 0.14, 0.1, basic('#ff3b2f'), x, 3.55, part + 0.27, 12); lamp.rotation.x = Math.PI / 2; anims.push((dt, t) => { lamp.material.color.setHSL(0.01, 1, 0.45 + Math.sin(t * 2 + x) * 0.1); });
    sign([n, 'BOOKED · SECOND SHIFT'], 2.4, 0.8, '#ff6a4a', x, 4.2, part + 0.22); }
  // arch control panel inside the suite (beside the arch)
  B(0.7, 1.2, 0.12, toon('#2a2232'), HB.arch.x, 1.3, part - 0.3); const ap = B(0.5, 0.8, 0.02, basic('#ffb870'), HB.arch.x, 1.4, part - 0.37); sign(['ARCH', 'PROGRAMS'], 0.9, 0.36, ORANGE, HB.arch.x, 2.2, part - 0.33, Math.PI);
  // ---- HOLODECK (z -hd..part): black, an orange grid on every surface that breathes
  const gridTex = tex(canvas(256, 256, (c, W) => { c.fillStyle = '#050407'; c.fillRect(0, 0, W, W); c.strokeStyle = '#ff9a3a'; c.lineWidth = 4; c.strokeRect(2, 2, W - 4, W - 4); c.globalAlpha = 0.35; c.lineWidth = 2; c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, W); c.moveTo(0, W / 2); c.lineTo(W, W / 2); c.stroke(); }));
  gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping;
  const gm = (rx, ry) => { const t = gridTex.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new THREE.MeshBasicMaterial({ map: t, toneMapped: false, color: 0xffffff }); };
  const dd = hd + part, dz = (part - hd) / 2, gridMats = [];
  { const f = plane(hw * 2, dd, gm(hw, dd / 2), 0, 0.002, dz); f.rotation.set(-Math.PI / 2, 0, 0); gridMats.push(f.material);
    const ce = plane(hw * 2, dd, gm(hw, dd / 2), 0, h, dz); ce.rotation.set(Math.PI / 2, 0, 0); gridMats.push(ce.material);
    gridMats.push(plane(hw * 2, h, gm(hw, h / 2), 0, h / 2, -hd + 0.01).material);
    for (const s of [-1, 1]) gridMats.push(plane(dd, h, gm(dd / 2, h / 2), s * (hw - 0.01), h / 2, dz, -s * Math.PI / 2).material);
    for (const s of [-1, 1]) gridMats.push(plane(hw - 2.75, h, gm((hw - 2.75) / 2, h / 2), s * (hw + 2.75) / 2, h / 2, part - 0.21, Math.PI).material);
    gridMats.push(plane(5.5, h - 4.1, gm(2.75, (h - 4.1) / 2), 0, 4.1 + (h - 4.1) / 2, part - 0.21, Math.PI).material); }
  // holo props: one shared additive cyan material, each program its own group
  const HM = new THREE.MeshBasicMaterial({ color: 0x7fe8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const Z = HB.deck.z, progs = {};
  const line = (grp, x0, z0, x1, z1, w = 0.08, y = 0.02) => { const L = Math.hypot(x1 - x0, z1 - z0), m = M(BOX(w, 0.02, L), HM, (x0 + x1) / 2, y, Z + (z0 + z1) / 2, grp, 0); m.rotation.y = Math.atan2(x1 - x0, z1 - z0); return m; };
  { const T = new THREE.Group(); g.add(T); progs.tennis = T; const X = 6.5, W = 3.0, w2 = 2.3;
    for (const z of [-W, W]) line(T, -X, z, X, z); for (const z of [-w2, w2]) line(T, -X, z, X, z, 0.05); for (const x of [-X, X]) line(T, x, -W, x, W); for (const x of [-3.5, 3.5]) line(T, x, -w2, x, w2, 0.05); line(T, -3.5, 0, 3.5, 0, 0.05);
    plane(W * 2 + 0.6, 0.9, HM, 0, 0.45, Z, Math.PI / 2, T); for (const z of [-W - 0.3, W + 0.3]) C(0.04, 0.04, 1.05, HM, 0, 0.53, Z + z, 6, T);
    const ball = M(new THREE.SphereGeometry(0.09, 10, 8), HM, 0, 1, Z, T, 0); T.userData.tick = t => { const u = (t * 0.45) % 2, s = u < 1 ? u : 2 - u; ball.position.set(-5 + s * 10, 0.3 + Math.abs(Math.sin(s * Math.PI * 2)) * 1.4, Z + Math.sin(t * 0.9) * 1.5); }; }
  { const T = new THREE.Group(); g.add(T); progs.cage = T; const S = 3.6, hx = 0, hz = 3.2;
    const P = [[hx, hz], [hx + S, hz - S], [hx, hz - S * 2], [hx - S, hz - S]]; for (let i = 0; i < 4; i++) { const [a, b] = P[i], [c, d] = P[(i + 1) % 4]; line(T, a, b, c, d); const base = M(BOX(0.5, 0.06, 0.5), HM, a, 0.04, Z + b, T, 0); base.rotation.y = Math.PI / 4; }
    C(0.9, 1.0, 0.15, HM, hx, 0.08, Z + hz - S, 20, T);
    for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const b = M(BOX(0.04, 3.2, 0.04), HM, s * 2.2, 1.6, Z + hz + 0.9 - k * 0.9, T, 0); void b; }
    const pitch = M(new THREE.SphereGeometry(0.09, 10, 8), HM, 0, 1, 0, T, 0); T.userData.tick = t => { const u = (t * 0.7) % 1; pitch.position.set(hx, 1.2 - u * 0.4, Z + hz - S + u * S); }; }
  { const T = new THREE.Group(); g.add(T); progs.ring = T; const S = 3.0;
    const fl = M(BOX(S * 2, 0.04, S * 2), HM, 0, 0.5, Z, T, 0); void fl;
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) C(0.09, 0.09, 1.7, HM, sx * S, 1.3, Z + sz * S, 8, T);
    for (const y of [1.0, 1.45, 1.9]) { line(T, -S, -S, S, -S, 0.04, y); line(T, -S, S, S, S, 0.04, y); line(T, -S, -S, -S, S, 0.04, y); line(T, S, -S, S, S, 0.04, y); }
    const bag = C(0.35, 0.35, 1.3, HM, 0, 1.6, Z, 12, T); T.userData.tick = t => { bag.rotation.z = Math.sin(t * 2.2) * 0.12; }; }
  for (const k in progs) progs[k].visible = false;
  // scan sweep: a glowing sheet that rises through the room when a program loads
  const sweepM = new THREE.MeshBasicMaterial({ color: 0xffb060, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const sweep = plane(hw * 2 - 0.2, dd - 0.6, sweepM, 0, 0.1, dz); sweep.rotation.set(-Math.PI / 2, 0, 0);
  const S = { prog: null, load: 0 };
  function setProgram(key) { S.prog = key; S.load = 1.2; }
  // embers drifting up in the holodeck
  if (!LOW) { const n = 50, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(-hw + 1, hw - 1); pos[i * 3 + 1] = rr(0, h); pos[i * 3 + 2] = rr(-hd + 1, part - 1); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffb060, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false })); g.add(pts);
    anims.push(dt => { for (let i = 0; i < n; i++) { pos[i * 3 + 1] += dt * 0.25; if (pos[i * 3 + 1] > h) pos[i * 3 + 1] = 0; } geo.attributes.position.needsUpdate = true; }); }
  anims.push((dt, t) => { const k = 0.75 + Math.sin(t * 1.3) * 0.15 + (S.load > 0 ? 0.35 : 0); for (const m of gridMats) m.color.setScalar(k);
    ap.material.color.setHSL(0.08, 1, 0.6 + Math.sin(t * 4) * 0.08);
    if (S.load > 0) { S.load = Math.max(0, S.load - dt); const u = 1 - S.load / 1.2; sweep.position.y = u * h; sweepM.opacity = Math.sin(u * Math.PI) * 0.35; }
    for (const k2 in progs) { progs[k2].visible = k2 === S.prog && S.load < 0.6; if (progs[k2].visible && progs[k2].userData.tick) progs[k2].userData.tick(t); }
    const target = S.prog && S.load < 0.6 ? 0.55 + Math.sin(t * 9) * 0.04 + (Math.random() < 0.02 ? -0.3 : 0) : 0; HM.opacity += (target - HM.opacity) * Math.min(1, dt * 6); });
  let pz = HB.enter.z;
  function walk(x, z) { pz = z; if (x < -hw + 0.5 || x > hw - 0.5 || z < -hd + 0.5 || z > hd - 0.4) return Math.abs(x) < 1.3 && z > hd - 0.4 && z < hd + 0.8;
    for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false; for (const [cx, cz, r] of circles) if (Math.hypot(x - cx, z - cz) < r + 0.3) return false; return true; }
  // camera: never through the partition (stay on the player's side of it unless under the arch)
  function clampCam(v) { if (Math.abs(v.x) < 2.2) return; if (pz > part && v.z < part + 0.5) v.z = part + 0.5; else if (pz <= part && v.z > part - 0.5) v.z = part - 0.5; }
  const inDeck = z => z < part;
  return { g, anims, walk, clampCam, setProgram, inDeck, state: S };
}
