// OPERATIONS [dsfOps] + THE CAPTAIN'S OFFICE [dsfOffice] (s349): the top deck, ON TOP of the station round the lift tube (y = OPS.y).
// The lift rides straight up to it (no fade). Ops table + station hologram, wall consoles, the main viewscreen, the ROYAL
// TELEPORT PAD, the ROYAL SHUTTLE PAD in the south alcove under a skylight, and the Captain's Office (north-east, glass front).
import { FONT } from '../engine/textures.js';
import { canvas, pol, D } from './dsf-look.js?v=349f';
export const OPS = { y: 28, r: 27.5, walkR: 22.8, table: { x: 0, z: -12.5, r: 3.4 }, pad: { x: -15, z: -4, r: 2.3 }, shuttle: { x: 0, z: 19.5, r: 4.6 }, shuttleFront: { x: 0, z: 13.6 },
  office: { x0: 8, x1: 17, z0: -20, z1: -11.5, doorZ: -15.4 }, desk: { x: 12.6, z: -17.2 } };
export function buildOps(K) {
  const { THREE, scene, M, BOX, toon, basic, glowSprite, rnd, rr, pick, LOW } = K;
  const Y = OPS.y, g = new THREE.Group(); g.position.set(0, Y, 0); scene.add(g);
  const anims = [], circles = [[OPS.table.x, OPS.table.z, OPS.table.r + 0.5], [OPS.shuttle.x, OPS.shuttle.z, 3.4]];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, ol = 0, p = g) => M(BOX(w, h, d), mat, x, y, z, p, ol);
  const C = (r1, r2, h, mat, x, y, z, seg = 16, p = g) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0);
  const flat = (geo, mat, x, y, z, p = g) => { const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); p.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#0b1218') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const wall = (r, y0, y1, a, b, mat) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, y1 - y0, Math.max(8, Math.round((b - a) / 2)), 1, true, Math.PI - b * D, (b - a) * D), mat); m.position.y = (y0 + y1) / 2; g.add(m); return m; };
  const cyan = '#7fe3ff', R = OPS.r;
  // floor: dark plating, a cyan inlay ring, amber rings round the table
  const deck = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#2c3038'; c.fillRect(0, 0, w, w); c.strokeStyle = '#1c1f25'; c.lineWidth = 3; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, w); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } }));
  deck.wrapS = deck.wrapT = THREE.RepeatWrapping; deck.repeat.set(12, 12); flat(new THREE.RingGeometry(5, R, 96, 1), toon('#b8c0cc', { map: deck }), 0, 0, 0).receiveShadow = true;
  for (const [r, c, o] of [[OPS.walkR + 0.3, cyan, 0.9], [7.0, cyan, 0.8], [17, '#ffb454', 0.5]]) flat(new THREE.RingGeometry(r - 0.08, r + 0.08, 160, 1), basic(c, o, true), 0, 0.02, 0);
  // the outer wall with the window band, the dome over it
  const wM = toon('#262a31', { side: THREE.DoubleSide }); wall(R, 0, 2.5, 0, 360, wM); wall(R, 7.2, 8.2, 0, 360, wM);
  const gl = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 4.7, 96, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide })); gl.position.y = 4.85; g.add(gl);
  for (let th = 0; th < 360; th += 7.5) { const [x, z] = pol(R - 0.1, th); const m = B(0.26, 4.8, 0.26, toon('#1a1d22'), x, 4.85, z); m.rotation.y = -th * D; }
  { const dome = new THREE.Mesh(new THREE.CylinderGeometry(9, R + 0.4, 5, 64, 1, true), toon('#5a5f68', { side: THREE.DoubleSide })); dome.position.y = 10.7; g.add(dome); const cap = new THREE.Mesh(new THREE.CircleGeometry(9, 48), toon('#5a5f68', { side: THREE.DoubleSide })); cap.rotation.x = -Math.PI / 2; cap.position.y = 13.2; g.add(cap); }
  // ceiling (with the skylight over the shuttle pad)
  const ce = flat(new THREE.RingGeometry(5, R, 96, 1), toon('#1d2026', { side: THREE.DoubleSide }), 0, 8.2, 0); void ce;
  for (const r of [10, 16, 22]) flat(new THREE.RingGeometry(r - 0.25, r + 0.25, 128, 1), basic('#dff4ff', 0.85), 0, 8.15, 0);
  const sky = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#03040a'; c.fillRect(0, 0, w, w); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${(rnd() * 0.9).toFixed(2)})`; c.fillRect(rnd() * w, rnd() * w, 2, 2); } const gr = c.createRadialGradient(w * 0.7, w * 0.3, 4, w * 0.7, w * 0.3, 90); gr.addColorStop(0, 'rgba(120,70,180,0.45)'); gr.addColorStop(1, 'rgba(120,70,180,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); }));
  const sl = new THREE.Mesh(new THREE.CircleGeometry(6.5, 48), new THREE.MeshBasicMaterial({ map: sky, side: THREE.DoubleSide })); sl.rotation.x = Math.PI / 2; sl.position.set(OPS.shuttle.x, 8.12, OPS.shuttle.z); g.add(sl);
  const slr = new THREE.Mesh(new THREE.TorusGeometry(6.6, 0.18, 8, 64), basic(cyan)); slr.rotation.x = Math.PI / 2; slr.position.set(OPS.shuttle.x, 8.1, OPS.shuttle.z); g.add(slr);
  const ffT = tex(canvas(128, 128, (c, w) => { c.strokeStyle = 'rgba(160,235,255,0.5)'; c.lineWidth = 1.5; for (let y = 0; y < w; y += 12) { c.beginPath(); for (let x = 0; x <= w; x += 6) c.lineTo(x, y + Math.sin(x * 0.1) * 3); c.stroke(); } })); ffT.wrapS = ffT.wrapT = THREE.RepeatWrapping;
  const ff = new THREE.Mesh(new THREE.CircleGeometry(6.5, 48), new THREE.MeshBasicMaterial({ map: ffT, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); ff.rotation.x = Math.PI / 2; ff.position.set(OPS.shuttle.x, 8.0, OPS.shuttle.z); g.add(ff); anims.push((dt, t) => { ffT.offset.y -= dt * 0.1; ff.material.opacity = 0.35 + 0.15 * Math.sin(t * 2); });
  // wall consoles all round (skipping the office, the alcove and the viewscreen)
  { const list = []; for (let th = 0; th < 360; th += 9) { const [x, z] = pol(OPS.walkR + 1.3, th); if (Math.abs(((th - 180) % 360 + 360) % 360 - 0) < 20 || (th > 340 || th < 20) || (x > 7 && z < -10)) continue; list.push([x, z, th]); }
    const body = toon('#3a3f48'), scrC = ['#7fe3ff', '#ffb454', '#8fe38f', '#ff8a6a']; const scr = [];
    list.forEach(([x, z, th], i) => { const cg = new THREE.Group(); cg.position.set(x, 0, z); cg.rotation.y = -th * D; g.add(cg); const b = new THREE.Mesh(BOX(2.6, 1.1, 1.0), body); b.position.y = 0.55; cg.add(b); const top = new THREE.Mesh(BOX(2.6, 0.12, 1.2), toon('#22262c')); top.position.set(0, 1.16, 0.1); top.rotation.x = 0.35; cg.add(top);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.7), basic(scrC[i % 4], 0.85)); s.position.set(0, 1.25, 0.38); s.rotation.x = -Math.PI / 2 + 0.35; cg.add(s); scr.push(s); const up = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), basic(scrC[(i + 1) % 4], 0.55)); up.position.set(0, 2.4, -0.45); cg.add(up); scr.push(up); });
    anims.push((dt, t) => scr.forEach((s, i) => { s.material.opacity = 0.55 + 0.3 * Math.abs(Math.sin(t * (0.6 + (i % 5) * 0.2) + i)); })); }
  // the main viewscreen (north): Meru + the gate, a scan line
  { const vt = tex(canvas(1024, 448, (c, w, h) => { c.fillStyle = '#03040a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(255,255,255,${(rnd() * 0.8).toFixed(2)})`; c.fillRect(rnd() * w, rnd() * h, 2, 2); } const gr = c.createRadialGradient(w * 0.5, h * 2.4, h * 1.6, w * 0.5, h * 2.4, h * 2.05); gr.addColorStop(0, '#2c6ea8'); gr.addColorStop(0.92, '#5aa8e8'); gr.addColorStop(1, 'rgba(120,200,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 400; i++) { const t = i / 400, a = t * 20, r = t * 70; c.fillStyle = `rgba(200,230,255,${(0.5 * (1 - t)).toFixed(2)})`; c.beginPath(); c.arc(w * 0.78 + Math.cos(a) * r, h * 0.3 + Math.sin(a) * r, 2 + 6 * (1 - t), 0, 6.283); c.fill(); }
      c.fillStyle = '#7fe3ff'; c.font = `900 34px ${FONT}`; c.fillText('OPS · LIVE · MERU ORBIT', 24, 46); c.strokeStyle = '#7fe3ff'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); }));
    const vs = new THREE.Mesh(new THREE.PlaneGeometry(13, 5.7), new THREE.MeshBasicMaterial({ map: vt, toneMapped: false })); vs.position.set(0, 4.6, -OPS.walkR - 1.5); g.add(vs); B(13.6, 6.3, 0.3, toon('#1a1d22'), 0, 4.6, -OPS.walkR - 1.7);
    const scan = new THREE.Mesh(new THREE.PlaneGeometry(13, 0.12), basic('#bff4ff', 0.35, true)); scan.position.set(0, 4.6, -OPS.walkR - 1.48); g.add(scan); anims.push((dt, t) => { scan.position.y = 1.9 + ((t * 0.8) % 5.4); }); }
  // THE OPS TABLE + the station hologram
  let holo;
  { const T = OPS.table, oct = new THREE.CylinderGeometry(T.r, T.r + 0.2, 1.1, 8); const tb = new THREE.Mesh(oct, toon('#3a3f48')); tb.position.set(T.x, 0.55, T.z); g.add(tb);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(T.r + 0.15, T.r + 0.15, 0.1, 8), toon('#22262c')); top.position.set(T.x, 1.15, T.z); g.add(top);
    const gt = tex(canvas(512, 512, (c, w) => { c.fillStyle = '#081018'; c.fillRect(0, 0, w, w); c.strokeStyle = '#7fe3ff'; c.lineWidth = 2; for (let i = 0; i < w; i += 32) { c.globalAlpha = 0.3; c.beginPath(); c.moveTo(i, 0); c.lineTo(i, w); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } c.globalAlpha = 1; c.strokeStyle = '#ffb454'; c.lineWidth = 6; c.beginPath(); c.arc(w / 2, w / 2, w * 0.36, 0, 6.283); c.stroke(); c.beginPath(); c.arc(w / 2, w / 2, w * 0.14, 0, 6.283); c.stroke(); }));
    const gp = new THREE.Mesh(new THREE.CircleGeometry(T.r, 8), new THREE.MeshBasicMaterial({ map: gt, toneMapped: false })); gp.rotation.x = -Math.PI / 2; gp.position.set(T.x, 1.21, T.z); g.add(gp);
    holo = new THREE.Group(); holo.position.set(T.x, 2.3, T.z); g.add(holo); const hm = basic(cyan, 0.65, true);
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.1, 6, 48), hm); r1.rotation.x = Math.PI / 2; holo.add(r1); const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 6, 32), hm); r2.rotation.x = Math.PI / 2; holo.add(r2); const core = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8), hm); holo.add(core);
    for (const b of [67.5, 202.5, 315]) for (const s of [1, -1]) { const pts = [[1.3, 0], [1.55, 0.2], [1.75, 0.5], [1.6, 0.75]].map(([r, y]) => { const [x, z] = pol(r, b); return new THREE.Vector3(x, s * y, z); }); holo.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.05, 5), hm)); }
    for (let i = 0; i < 4; i++) { const sp = new THREE.Mesh(BOX(0.04, 0.04, 0.75), hm); sp.rotation.y = i * Math.PI / 2; sp.position.set(Math.sin(i * Math.PI / 2) * 0.92, 0, Math.cos(i * Math.PI / 2) * 0.92); holo.add(sp); }
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 0.3, 1.1, 24, 1, true), basic(cyan, 0.08, true)); beam.position.set(T.x, 1.75, T.z); g.add(beam); glowSprite(T.x, 2.3, T.z, 0x7fe3ff, 4, 0.35, g);
    anims.push((dt, t) => { holo.rotation.y += dt * 0.25; holo.position.y = 2.3 + Math.sin(t * 1.2) * 0.05; }); }
  // DOCKING CONTROL stand (s354): a red floor ring where you take the board + a big sign on the table's south face
  { const T = OPS.table, sx = T.x, sz = T.z + 4.4; const fr = flat(new THREE.RingGeometry(0.75, 0.95, 48), basic('#ec3013', 0.95), sx, 0.04, sz); const fi = flat(new THREE.CircleGeometry(0.75, 40), basic('#ec3013', 0.18, true), sx, 0.035, sz);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), new THREE.MeshBasicMaterial({ map: tex(canvas(512, 100, (c, w, h) => { c.fillStyle = '#f3f2f2'; c.font = `900 56px ${FONT}`; c.textBaseline = 'middle'; c.fillText('DOCKING CONTROL', 8, h / 2); })), transparent: true, depthWrite: false, toneMapped: false })); lab.rotation.x = -Math.PI / 2; lab.position.set(sx - 0.1, 0.05, sz + 1.35); g.add(lab);
    sign(['DOCKING CONTROL', 'STAND ON THE RED RING'], 2.6, 0.75, '#ec3013', sx, 0.62, T.z + T.r + 0.27, 0, '#0e0d0c');
    anims.push((dt, t) => { fi.material.opacity = 0.12 + 0.1 * Math.sin(t * 3); fr.scale.setScalar(1 + 0.04 * Math.sin(t * 3)); }); }
  // ROYAL TELEPORT PAD (west)
  { const P = OPS.pad; flat(new THREE.CircleGeometry(P.r + 0.1, 48), toon('#101821'), P.x, 0.03, P.z); const rs = [1, 0.72, 0.44].map((k, i) => flat(new THREE.RingGeometry(P.r * k - 0.07, P.r * k, 64), basic('#7dd3fc', i ? 0.6 : 1), P.x, 0.05, P.z)); const pg = glowSprite(P.x, 0.4, P.z, 0x7dd3fc, P.r * 4, 0.4, g);
    anims.push((dt, t) => { const k = 0.55 + Math.sin(t * 2.4) * 0.3; rs.forEach((r, i) => { if (i) r.material.opacity = k * (1 - i * 0.25); }); pg.material.opacity = 0.25 + k * 0.25; });
    sign(['ROYAL TELEPORT PAD', 'HUB · CARGO BAY FOUR · MERU'], 3.6, 0.9, '#7dd3fc', P.x - 3.4, 1.8, P.z, Math.PI / 2); }
  // ROYAL SHUTTLE PAD (south alcove) + the Captain's shuttle
  { const S = OPS.shuttle; flat(new THREE.CircleGeometry(S.r, 48), toon('#1a1d22'), S.x, 0.03, S.z); flat(new THREE.RingGeometry(S.r - 0.25, S.r, 64), basic('#e8c45a'), S.x, 0.04, S.z); flat(new THREE.RingGeometry(1.4, 1.7, 48), basic('#e8c45a', 0.8), S.x, 0.04, S.z);
    const lights = []; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; lights.push(glowSprite(S.x + Math.cos(a) * (S.r + 0.3), 0.2, S.z + Math.sin(a) * (S.r + 0.3), 0xffc040, 0.8, 0.8, g)); } anims.push((dt, t) => lights.forEach((s, i) => { s.material.opacity = ((t * 5 - i) % 10 + 10) % 10 < 1.2 ? 1 : 0.25; }));
    const sh = new THREE.Group(); sh.position.set(S.x, 0, S.z); sh.rotation.y = Math.PI; g.add(sh); const hull = toon('#e8ecf0');
    const hb = new THREE.Mesh(BOX(3.6, 1.8, 6.2), hull); hb.position.y = 1.5; sh.add(hb); const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 1.2, 2.2, 4), hull); nose.rotation.set(-Math.PI / 2, Math.PI / 4, 0); nose.position.set(0, 1.5, -4.1); sh.add(nose);
    const win = new THREE.Mesh(BOX(2.6, 0.6, 0.1), toon('#38bdf8', { emissive: new THREE.Color('#0e4a6e'), emissiveIntensity: 0.7 })); win.position.set(0, 2.0, -3.12); sh.add(win); const st = new THREE.Mesh(BOX(3.65, 0.28, 6.25), toon('#ec3013')); st.position.y = 1.1; sh.add(st);
    for (const s of [-1, 1]) { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4.4, 12), toon('#8a919a')); n.rotation.x = Math.PI / 2; n.position.set(s * 2.5, 1.3, 0.5); sh.add(n); glowSprite(s * 2.5, 1.3, 2.8, 0x7fd8ff, 1.6, 0.35, sh); }
    const cr = new THREE.Mesh(new THREE.CircleGeometry(0.7, 32), new THREE.MeshBasicMaterial({ map: tex(canvas(128, 128, (c, w) => { c.fillStyle = '#c8a050'; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 2, 0, 6.283); c.fill(); c.fillStyle = '#0c1038'; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 14, 0, 6.283); c.fill(); c.fillStyle = '#f3f2f2'; c.font = `900 64px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('8', w / 2, w / 2 + 4); })) })); cr.position.set(1.82, 1.6, 0); cr.rotation.y = Math.PI / 2; sh.add(cr);
    sign(['ROYAL SHUTTLE PAD', "THE CAPTAIN'S SHUTTLE"], 4.4, 1.0, '#e8c45a', S.x, 4.6, 25.6, Math.PI, '#0e0d0c'); }
  // THE CAPTAIN'S OFFICE (glass front on the west + south, door west)
  { const O = OPS.office, ow = O.x1 - O.x0, od = O.z1 - O.z0, cx = (O.x0 + O.x1) / 2, cz = (O.z0 + O.z1) / 2, wm = toon('#2a3038');
    flat(new THREE.PlaneGeometry(ow, od), toon('#5a4a3a'), cx, 0.025, cz);
    B(ow, 5.0, 0.3, wm, cx, 2.5, O.z0); B(0.3, 5.0, od, wm, O.x1, 2.5, cz);
    const glass = basic('#bfe8ff', 0.16); const gw = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), m = new THREE.Mesh(new THREE.PlaneGeometry(L, 4.2), glass); m.position.set((x0 + x1) / 2, 2.1, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); g.add(m); B(L, 0.18, 0.18, basic(cyan), (x0 + x1) / 2, 0.09, (z0 + z1) / 2).rotation.y = m.rotation.y; B(L, 0.18, 0.18, toon('#1a1d22'), (x0 + x1) / 2, 4.3, (z0 + z1) / 2).rotation.y = m.rotation.y; };
    gw(O.x0, O.z1, O.x1, O.z1); gw(O.x0, O.z0, O.x0, O.doorZ - 1.2); gw(O.x0, O.doorZ + 1.2, O.x0, O.z1);
    for (const z of [O.doorZ - 1.2, O.doorZ + 1.2]) B(0.24, 4.4, 0.24, basic(cyan), O.x0, 2.2, z); B(0.24, 0.24, 2.6, basic(cyan), O.x0, 4.4, O.doorZ);
    const ceil = new THREE.Mesh(BOX(ow, 0.2, od), toon('#1d2026')); ceil.position.set(cx, 5.0, cz); g.add(ceil);
    // desk, chair, the baseball on its stand, a shelf of things from home
    const dk = OPS.desk; B(3.4, 0.9, 1.4, toon('#3a2a1a'), dk.x, 0.45, dk.z, 0.03); B(3.6, 0.1, 1.6, toon('#5a4030'), dk.x, 0.95, dk.z); const ds = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), basic('#9fd8ff', 0.8)); ds.position.set(dk.x - 0.8, 1.3, dk.z - 0.3); ds.rotation.x = -0.4; g.add(ds);
    C(0.5, 0.5, 0.1, toon('#1a1d22'), dk.x, 0.6, dk.z - 1.5, 16); B(1.0, 1.2, 0.2, toon('#1a1d22'), dk.x, 1.2, dk.z - 2.0);
    C(0.04, 0.06, 0.25, toon('#c8a050'), dk.x + 1.2, 1.12, dk.z + 0.2, 8); M(new THREE.SphereGeometry(0.13, 14, 10), toon('#f3f2f2'), dk.x + 1.2, 1.36, dk.z + 0.2, g, 0);
    B(0.4, 3.2, 3.6, toon('#3a2a1a'), O.x1 - 0.4, 1.6, cz + 0.6); for (let i = 0; i < 3; i++) for (let k = 0; k < 4; k++) B(0.3, 0.4, 0.4, toon(pick(['#c8a050', '#8a4a2a', '#5a6a3a', '#b3121b', '#7fb8de'])), O.x1 - 0.45, 0.8 + i * 1.0, cz - 0.6 + k * 0.8);
    circles.push([dk.x, dk.z, 1.9]);
    sign(["CAPTAIN'S OFFICE"], 5, 0.9, cyan, O.x0 - 0.02, 4.9, cz, -Math.PI / 2); sign(["CAPTAIN'S OFFICE", 'CAPT. BENNY'], 1.8, 0.8, cyan, O.x0 - 0.04, 1.7, O.doorZ + 2.2, -Math.PI / 2); }
  // big OPERATIONS sign over the lift doors (south face)
  sign(['OPERATIONS', 'DECK ONE · COMMAND'], 6, 1.4, cyan, 0, 4.4, 5.6, 0);
  function inOfficeBox(x, z, m = 0) { const O = OPS.office; return x > O.x0 - m && x < O.x1 + m && z > O.z0 - m && z < O.z1 + m; }
  function walk(x, z) { const r = Math.hypot(x, z); if (r < 5.75) return false; for (const [cx, cz, cr] of circles) if (Math.hypot(x - cx, z - cz) < cr) return false;
    const O = OPS.office; if (inOfficeBox(x, z, 0.4)) { if (inOfficeBox(x, z, -0.4)) return true; return x < O.x0 + 0.4 && Math.abs(z - O.doorZ) < 1.0; }
    if (r <= OPS.walkR) return true; return z > 12 && Math.abs(x) < 6.6 && z < 25.5; }
  const inOffice = (x, z) => inOfficeBox(x, z, -0.2);
  return { g, anims, walk, inOffice, holo };
}
