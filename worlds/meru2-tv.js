// MERU 2.0 — s109 MERU TV STUDIO [meruTVStation] (Ben s109 picks: BOTH keepers give jobs (Sterling Gloss: CUE CARDS · MAKE-UP + LIGHTS · CONTROL ROOM;
// Weather Fox: WEATHER REPORT · LIVE ON THE SCENE) · studio + a small control room with a window · GENTLE · prizes: NEWS SUIT + earpiece (1st clear),
// TV AT HOME shows your reports (2 jobs), MICROPHONE item (3), YOUR FACE on the billboard + lobby screens (4), GOLDEN MIC + 60 gold (all 5) ·
// look: ON AIR lights, lobby screens = live feed, audience seats, the weather wall = today's forecast (day-seeded; Meru 2 has no live weather yet)).
// The STUDIO = an extra room in the cluster lobby row (clusters.addRoom), through a STUDIO door in the Meru TV lobby back wall (quick fade).
// News kit pieces (card, panel, marker, arrow, fade, job camera) follow worlds/meru2-news.js.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { CLUSTER_LINES } from './meru2-cluster-lines.js';
export function buildTVStation({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, clusters, renderer, terrainAt = () => 0, go, aptTV = null }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'tvStation'); if (!LR || !clusters.addRoom) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, LOX = LR.ox, RH = 6;
  const SR = clusters.addRoom({ key: 'tvStudio', room: 'meruTVStation', title: 'MERU TV \u00b7 STUDIO' }, RH); SR.out = LR.out; const OX = SR.ox;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', NAVY = '#1d2a33', BLUE = '#2e4a6b', STEEL = '#9aa0a6', DARK = '#3d3b3a', BLACK = '#26292d', GREEN = '#3f9a5e';
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c })), BM = c => new THREE.MeshBasicMaterial({ color: c });
  const VCM = new THREE.MeshLambertMaterial({ vertexColors: true });
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(1, 1, 1)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } g.dispose(); };
    return { box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 10, rx = 0, rz = 0, ry = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, ry, rx, rz),
      sph: (r, hex, x, y, z) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex),
      mesh(parent) { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); const m = new THREE.Mesh(g0, VCM); m.userData.noCull = true; parent.add(m); return m; } }; };
  const plate = (txt, w, h, bg, fg, bar) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); if (bar) { g.fillStyle = bar; g.fillRect(0, 0, Math.max(8, W * 0.03), H); } g.fillStyle = fg; g.textBaseline = 'middle'; let s = Math.round(H * 0.6); g.font = '900 ' + s + 'px Archivo, sans-serif'; while (g.measureText(txt).width > W * 0.86 && s > 10) { s -= 2; g.font = '900 ' + s + 'px Archivo, sans-serif'; } g.fillText(txt, bar ? W * 0.07 : W * 0.06, H / 2 + 2); });
  const planeT = (tex, w, h, x, y, z, ry, parent, both = false, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: both ? THREE.DoubleSide : THREE.FrontSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0, 'YXZ'); m.userData.noCull = true; parent.add(m); return m; };
  const rectL = (a, b, c, d) => cols.push({ f: [OX + a, OX + b, LZ + c, LZ + d], y0: LY - 3, y1: LY + 12 }), circL = (x, z, r) => cols.push({ c: [OX + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  const G = new THREE.Group(); G.name = 'meruTVStudio'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const toW = (x, y, z) => V(OX + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ });
  const glowT = CT(32, 32, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, W, W); });
  const today = () => save.stat('meru2Day', 1), night = () => { const h = hour(); return h >= 19 || h < 6.5; };
  const done = () => save.stat('mtvDone', null) || {};
  // ================= TODAY'S WEATHER (day-seeded, one per region; the weather wall + Weather Fox + lobby screen all read it) =================
  const REG = [['spire', 'THE SPIRE', 30, 92, 310, 222], ['deco', 'DECO', 30, 330, 310, 230], ['square', 'TOWN SQUARE', 356, 92, 312, 468], ['lake', 'THE LAKE', 684, 92, 310, 262], ['garden', 'GARDEN ISLAND', 684, 370, 310, 190]];
  const KINDS = ['SUN', 'CLOUD', 'RAIN', 'FOG', 'WIND'], KNAME = { SUN: 'SUNSHINE', CLOUD: 'CLOUD', RAIN: 'RAIN', FOG: 'FOG', WIND: 'WIND', MOON: 'A CLEAR NIGHT' };
  const hash = n => { n = (n * 2654435761) >>> 0; n ^= n >>> 15; n = Math.imul(n, 2246822519) >>> 0; n ^= n >>> 13; return n >>> 0; };
  const forecast = (d = today()) => Object.fromEntries(REG.map(([k], i) => [k, KINDS[hash(d * 7 + i) % (i === 3 ? 5 : 4)]]));
  const temp = (d = today()) => 14 + hash(d * 3 + 1) % 12;
  function icon(g, kind, x, y, s) { g.save(); g.translate(x, y); g.lineCap = 'round';
    const cloud = (c, dy = 0) => { g.fillStyle = c; for (const [a, b, r] of [[-0.42, 0.08, 0.3], [-0.05, -0.12, 0.38], [0.36, 0.06, 0.3]]) { g.beginPath(); g.arc(a * s, (b + dy) * s, r * s, 0, 7); g.fill(); } g.fillRect(-0.7 * s, (0.08 + dy) * s, 1.36 * s, 0.3 * s); };
    if (kind === 'SUN') { g.strokeStyle = YEL; g.lineWidth = s * 0.1; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(Math.cos(a) * s * 0.52, Math.sin(a) * s * 0.52); g.lineTo(Math.cos(a) * s * 0.78, Math.sin(a) * s * 0.78); g.stroke(); } g.fillStyle = YEL; g.beginPath(); g.arc(0, 0, s * 0.38, 0, 7); g.fill(); }
    else if (kind === 'MOON') { g.fillStyle = '#f3e7b0'; g.beginPath(); g.arc(0, 0, s * 0.42, 0, 7); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(s * 0.2, -s * 0.12, s * 0.36, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }
    else if (kind === 'CLOUD') cloud('#f3f2f2');
    else if (kind === 'RAIN') { cloud('#cfd5da', -0.2); g.strokeStyle = '#7cc4ff'; g.lineWidth = s * 0.09; for (const a of [-0.4, 0, 0.4]) { g.beginPath(); g.moveTo(a * s, 0.32 * s); g.lineTo((a - 0.1) * s, 0.62 * s); g.stroke(); } }
    else if (kind === 'FOG') { g.fillStyle = '#cfd5da'; for (let i = 0; i < 3; i++) g.fillRect((-0.6 + (i % 2) * 0.12) * s, (-0.3 + i * 0.26) * s, 1.1 * s, 0.13 * s); }
    else if (kind === 'WIND') { g.strokeStyle = '#f3f2f2'; g.lineWidth = s * 0.1; for (let i = 0; i < 3; i++) { const yy = (-0.3 + i * 0.3) * s; g.beginPath(); g.moveTo(-0.6 * s, yy); g.lineTo((0.25 - (i % 2) * 0.2) * s, yy); g.arc((0.25 - (i % 2) * 0.2) * s, yy - 0.12 * s, 0.12 * s, Math.PI / 2, -Math.PI / 2, true); g.stroke(); } }
    g.restore(); }
  // the weather wall canvas: idle = today's forecast; in the job = what you have pointed at so far
  const wxT = CT(1024, 576, () => {}); let wxShown = null, wxKey = '';
  function drawWx(shown, hot) { const d = today(), nt = night(), fc = forecast(d), key = JSON.stringify([shown, hot, d, nt]); if (key === wxKey) return; wxKey = key; const g = wxT.userData.c.getContext('2d');
    g.fillStyle = NAVY; g.fillRect(0, 0, 1024, 576); g.fillStyle = RED; g.fillRect(0, 0, 1024, 72); g.fillStyle = '#fff'; g.font = '900 40px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU TV WEATHER', 26, 38);
    g.font = '800 26px Archivo, sans-serif'; const r = 'DAY ' + d + ' \u00b7 ' + (shown ? 'LIVE' : nt ? 'TONIGHT' : 'TODAY') + ' \u00b7 ' + temp(d) + '\u00b0'; g.fillText(r, 1000 - g.measureText(r).width, 38);
    for (const [k, nm, x, y, w, h] of REG) { g.fillStyle = k === 'lake' ? '#2e6a96' : k === 'garden' ? '#3d6b4a' : k === 'square' ? '#4b5258' : k === 'deco' ? '#5a3f3a' : '#3d4652'; g.fillRect(x, y, w, h);
      if (hot === k) { g.strokeStyle = YEL; g.lineWidth = 10; g.strokeRect(x + 5, y + 5, w - 10, h - 10); }
      g.fillStyle = '#fff'; g.font = '900 30px Archivo, sans-serif'; g.fillText(nm, x + 16, y + 30);
      const kind = shown ? shown[k] : (nt && fc[k] === 'SUN' ? 'MOON' : fc[k]); if (kind) icon(g, kind, x + w / 2, y + h / 2 + 18, Math.min(w, h) * 0.42); }
    wxT.needsUpdate = true; }
  drawWx(null, null);
  // ================= STUDIO SHELL =================
  const R0 = mk(), { box, cyl, sph } = R0, WALL = '#3a3e44';
  box(20, 0.1, 20, '#474c54', 0, -0.05, 0); box(20, 0.2, 20, '#1b1d20', 0, RH + 0.1, 0);
  box(20, RH, 0.3, WALL, 0, RH / 2, -10); for (const s of [-1, 1]) { box(0.3, RH, 20, WALL, s * 10, RH / 2, 0); box(8.4, RH, 0.3, WALL, s * 5.8, RH / 2, 10); }
  box(3.2, RH - 3.2, 0.3, WALL, 0, 3.2 + (RH - 3.2) / 2, 10); box(3.2, 3.2, 0.05, '#141517', 0, 1.6, 10.12);
  for (const s of [-1, 1]) box(0.14, 3.3, 0.16, STEEL, s * 1.66, 1.65, 9.8); box(3.46, 0.14, 0.16, STEEL, 0, 3.27, 9.8);
  box(2.0, 0.02, 9.0, '#2b2f35', 0, 0.006, 4.8); for (let z = 1; z < 9.4; z += 1.2) box(0.5, 0.012, 0.08, YEL, 0, 0.014, z);   // walkway tape
  for (const [x, z] of [[-3.6, -6.8], [1.8, -8.4], [-8.4, -4.4]]) { box(0.6, 0.014, 0.08, YEL, x, 0.016, z); box(0.08, 0.014, 0.6, YEL, x, 0.016, z); }   // presenter marks
  rectL(-10, 10, -10.2, -9.8); rectL(9.8, 10.2, -10, 10); rectL(-10.2, -9.8, -10, 10); rectL(-10, -1.6, 9.8, 10.2); rectL(1.6, 10, 9.8, 10.2);
  // NEWS DESK (Sterling) + backdrop frame
  box(4.4, 0.1, 1.2, '#c9ced3', -3.6, 1.0, -5.8); box(4.2, 0.95, 0.12, RED, -3.6, 0.48, -5.24); box(4.2, 0.95, 1.0, BLACK, -3.6, 0.48, -5.8); box(4.2, 0.08, 0.14, INK, -3.6, 0.96, -5.2);
  for (const x of [-4.8, -2.4]) { box(0.3, 0.04, 0.22, PAPER, x, 1.07, -5.9); box(0.05, 0.25, 0.05, INK, x + 0.5, 1.18, -5.6); } box(0.6, 0.6, 0.06, DARK, -3.6, 0.4, -7.2); box(0.6, 0.06, 0.6, DARK, -3.6, 0.55, -7.0);
  rectL(-5.8, -1.4, -6.45, -5.15); box(7.2, 4.0, 0.12, INK, -3.6, 2.6, -9.76);
  // WEATHER WALL frame
  box(6.3, 3.68, 0.1, INK, 5.0, 2.5, -9.78);
  // three studio CAMERAS (tripod + body + lens + red tally)
  const CAMS = [{ x: -6.8, z: 0.4, ry: Math.atan2(-3.6 + 6.8, -6.4 - 0.4) }, { x: -1.0, z: -1.6, ry: Math.atan2(-3.6 + 1.0, -6.8 + 1.6) }, { x: 4.0, z: -1.6, ry: Math.atan2(5.0 - 4.0, -9.4 + 1.6) }];
  for (const c of CAMS) { for (let k = 0; k < 3; k++) { const a = k * 2.094; box(0.05, 1.5, 0.05, DARK, c.x + Math.sin(a) * 0.3, 0.7, c.z + Math.cos(a) * 0.3, 0, Math.cos(a) * 0.22, -Math.sin(a) * 0.22); }
    box(0.1, 0.4, 0.1, DARK, c.x, 1.55, c.z); box(0.5, 0.42, 0.8, BLACK, c.x, 1.95, c.z, c.ry); const fx = Math.sin(c.ry), fz = Math.cos(c.ry); cyl(0.14, 0.17, 0.4, INK, c.x + fx * 0.55, 1.95, c.z + fz * 0.55, 12, Math.PI / 2, 0, c.ry);
    box(0.36, 0.26, 0.04, '#5a6168', c.x - fx * 0.42, 2.05, c.z - fz * 0.42, c.ry); box(0.5, 0.04, 0.04, STEEL, c.x - fx * 0.6, 1.9, c.z - fz * 0.6, c.ry); circL(c.x, c.z, 0.55); }
  const tally = CAMS.map(c => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.06), BM('#4a1410')); m.position.set(c.x + Math.sin(c.ry) * 0.2, 2.2, c.z + Math.cos(c.ry) * 0.2); m.rotation.y = c.ry; G.add(m); return m; });
  // MAKE-UP corner (west wall): mirror with bulbs, chair, counter
  box(0.08, 1.3, 2.0, '#cfd8de', -9.8, 2.0, -4.4); box(0.12, 1.5, 2.2, INK, -9.86, 2.0, -4.4); box(0.6, 0.08, 2.4, '#c9ced3', -9.5, 0.95, -4.4); box(0.55, 0.9, 2.3, BLACK, -9.5, 0.46, -4.4);
  for (const z of [-5.3, -4.4, -3.5]) sph(0.07, '#fff1c4', -9.72, 2.72, z); for (const y of [1.6, 2.2]) for (const z of [-5.45, -3.35]) sph(0.07, '#fff1c4', -9.72, y, z); box(0.08, 0.2, 0.08, RED, -9.4, 1.1, -5.0); box(0.1, 0.16, 0.1, '#c9a24a', -9.4, 1.07, -3.9);
  box(0.6, 0.08, 0.6, RED, -8.4, 0.62, -4.4); box(0.08, 0.6, 0.6, RED, -8.72, 0.95, -4.4); cyl(0.05, 0.05, 0.58, STEEL, -8.4, 0.3, -4.4, 8); cyl(0.3, 0.3, 0.04, STEEL, -8.4, 0.02, -4.4, 12); rectL(-9.9, -9.1, -5.6, -3.2);
  // CONTROL ROOM (south-west booth, glass window onto the studio)
  for (const [a, b, c2, d] of [[-10, -4.6, 2.5, 2.7], [-4.7, -4.5, 2.6, 6.6], [-4.7, -4.5, 8.4, 10]]) { const w = b - a, dd = d - c2, cx = (a + b) / 2, cz = (c2 + d) / 2; box(w, 1.0, dd, '#4b5258', cx, 0.5, cz); box(w, RH - 3.0, dd, WALL, cx, 3.0 + (RH - 3.0) / 2, cz); box(Math.max(w, 0.12), 0.1, Math.max(dd, 0.12), STEEL, cx, 1.02, cz); rectL(a, b, c2, d); }
  box(4.6, 0.9, 0.9, BLACK, -7.3, 0.45, 3.2); box(4.6, 0.06, 1.0, '#5a6168', -7.3, 0.93, 3.3); for (let k = 0; k < 12; k++) box(0.08, 0.05, 0.22, k % 4 ? STEEL : RED, -9.0 + k * 0.3, 0.98, 3.5); rectL(-9.6, -5.0, 2.7, 3.75);
  box(0.6, 0.08, 0.6, DARK, -7.3, 0.55, 4.6); box(0.6, 0.6, 0.06, DARK, -7.3, 0.9, 4.92); cyl(0.04, 0.04, 0.5, STEEL, -7.3, 0.27, 4.6, 6);
  // AUDIENCE risers (south-east): 3 stepped rows of benches facing the desk
  const ROWS = [[3.6, 0], [5.2, 0.3], [6.8, 0.6]]; for (const [z, y] of ROWS) { if (y) box(5.4, y, 1.5, '#33373d', 6.6, y / 2, z); box(5.0, 0.12, 0.5, RED, 6.6, y + 0.48, z + 0.15); box(5.0, 0.42, 0.08, BLACK, 6.6, y + 0.21, z + 0.35); box(5.0, 0.5, 0.08, RED, 6.6, y + 0.78, z + 0.42); } rectL(3.8, 9.4, 2.9, 7.7);
  // road cases by the door (LIVE ON THE SCENE kit), coat rack, cooler
  for (let k = 0; k < 3; k++) { box(0.9, 0.6, 0.6, BLACK, -3.4, 0.3 + k * 0.6, 9.3); box(0.92, 0.06, 0.62, STEEL, -3.4, 0.6 + k * 0.6, 9.3); } box(0.5, 0.3, 0.06, YEL, -3.4, 1.5, 8.98); rectL(-3.9, -2.9, 8.9, 9.8);
  // TRUSS + hanging cans (the 3 key lights over the desk are their own meshes)
  for (const z of [-3.4, 1.2]) box(19, 0.18, 0.18, STEEL, 0, 5.5, z); for (const x of [-6, 0, 6]) box(0.18, 0.18, 4.8, STEEL, x, 5.5, -1.1);
  const CANS = [[4.0, 1.2], [6.6, 1.2], [1.4, 1.2], [5.0, -3.4], [8.2, -3.4]]; for (const [x, z] of CANS) { box(0.04, 0.4, 0.04, INK, x, 5.25, z); cyl(0.2, 0.26, 0.5, BLACK, x, 4.9, z, 10); }
  R0.mesh(G);
  // backdrop + weather wall + signs
  const backT = CT(1024, 568, (g, W, H) => { g.fillStyle = BLUE; g.fillRect(0, 0, W, H); g.fillStyle = '#26405e'; for (let i = 0; i < 18; i++) { const w = 30 + hash(i) % 50, h = 90 + hash(i + 40) % 220, x = i * 58; g.fillRect(x, H - 120 - h, w, h); } g.fillStyle = '#16263c'; g.fillRect(0, H - 120, W, 120);
    g.fillStyle = '#ffd23a'; for (let i = 0; i < 70; i++) g.fillRect((hash(i + 9) % W), H - 160 - hash(i + 3) % 230, 6, 6); g.fillStyle = RED; g.fillRect(0, 36, W, 96); g.fillStyle = '#fff'; g.font = '900 72px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU TV NEWS', 36, 86); g.font = '900 32px Archivo, sans-serif'; g.fillText('AT SIX \u00b7 EVERY NIGHT', 36, H - 60); });
  planeT(backT, 7.0, 3.88, -3.6, 2.6, -9.69, 0, G);
  const wallM = planeT(wxT, 6.0, 3.375, 5.0, 2.5, -9.72, 0, G);
  planeT(plate('LOBBY \u00b7 MERU TV', 512, 96, INK, PAPER, RED), 2.4, 0.45, 0, 3.6, 9.83, Math.PI, G);
  planeT(plate('CONTROL ROOM', 512, 96, INK, PAPER, RED), 2.2, 0.42, -4.44, 3.4, 7.5, Math.PI / 2, G);
  planeT(plate('MAKE-UP', 384, 96, INK, PAPER, RED), 1.5, 0.38, -9.82, 3.1, -4.4, Math.PI / 2, G);
  const onAirT = on => CT(256, 96, (g, W, H) => { g.fillStyle = on ? '#ff2a1a' : '#4a1410'; g.fillRect(0, 0, W, H); g.fillStyle = on ? '#fff' : '#7a3a30'; g.font = '900 54px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('ON AIR', 22, H / 2 + 3); });
  const AIR_ON = onAirT(true), AIR_OFF = onAirT(false), airSigns = [planeT(AIR_OFF, 1.6, 0.6, 1.05, 4.6, -9.82, 0, G), planeT(AIR_OFF, 1.2, 0.45, 0, 4.2, 9.83, Math.PI, G)];
  // the control desk monitors (thumbnails get painted in once the control room job has its pictures)
  const monT = CT(1024, 160, () => {}); const drawMon = (imgs = [], pgm = -1) => { const g = monT.userData.c.getContext('2d'); g.fillStyle = INK; g.fillRect(0, 0, 1024, 160); for (let i = 0; i < 4; i++) { const x = 8 + i * 254; g.fillStyle = '#0b1a2e'; g.fillRect(x, 8, 246, 144); const im = imgs[i < 3 ? i : pgm]; if (im && im.complete) g.drawImage(im, x, 8, 246, 144); g.fillStyle = i === 3 ? RED : INK; g.fillRect(x, 124, 246, 28); g.fillStyle = '#fff'; g.font = '900 20px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(i < 3 ? 'CAM ' + (i + 1) : 'PROGRAM', x + 10, 139); } monT.needsUpdate = true; }; drawMon();
  planeT(monT, 4.4, 0.69, -7.3, 1.45, 2.84, 0, G); planeT(monT, 4.4, 0.69, -7.3, 1.45, 2.8, Math.PI, G);
  const glassM = new THREE.MeshLambertMaterial({ color: '#9fc4e0', transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  for (const [w, x, z, ry] of [[5.4, -7.3, 2.6, 0], [4.0, -4.6, 4.6, Math.PI / 2], [1.6, -4.6, 9.2, Math.PI / 2]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 2.0), glassM); m.position.set(x, 2.0, z); m.rotation.y = ry; m.userData.noCull = true; G.add(m); }
  // KEY LIGHTS over the desk (make-up + lights job aims them): can + beam cone
  const beamMk = () => new THREE.MeshBasicMaterial({ color: '#fff1c4', transparent: true, opacity: 0.14, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const KEYS = [-6.2, -3.6, -1.0].map((x, i) => { const can = new THREE.Group(); can.position.set(x, 5.0, -3.4); G.add(can); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.6, 12), LM(BLACK)); can.add(b);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 6, 20), BM(YEL)); ring.rotation.x = Math.PI / 2; ring.visible = false; can.add(ring);
    const bm = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1, 18, 1, true), beamMk()); bm.userData.noCull = true; G.add(bm); return { can, ring, bm, x, sx: -3.6, lock: true, ph: i * 2.1 }; });
  const aimKey = (k, sx) => { const from = V(k.x, 4.8, -3.4), to = V(sx, 0.05, -6.2), d = to.clone().sub(from), len = d.length(); k.bm.position.copy(from).addScaledVector(d, 0.5); k.bm.scale.set(1, len, 1); k.bm.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().negate().normalize()); };
  KEYS.forEach(k => aimKey(k, k.sx));
  const bulbs = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(CANS.flatMap(([x, z]) => [x, 4.6, z]), 3)), new THREE.PointsMaterial({ size: 1.3, color: '#ffe6b0', map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); bulbs.frustumCulled = false; G.add(bulbs);
  // ================= LOBBY: STUDIO door + ON AIR lamp + the 3 lobby screens (live feed / weather / promo) =================
  const LG = new THREE.Group(); LG.position.set(LOX, LY, LZ); scene.add(LG); LG.visible = false;
  { const D = mk(); D.box(1.9, 2.9, 0.06, '#141517', 5.6, 1.45, -9.82); for (const s of [-1, 1]) D.box(0.12, 3.0, 0.12, STEEL, 5.6 + s * 1.0, 1.5, -9.8); D.box(2.12, 0.12, 0.12, STEEL, 5.6, 3.0, -9.8); D.box(1.6, 0.02, 1.0, RED, 5.6, 0.012, -9.1); D.mesh(LG);
    planeT(plate('STUDIO \u00b7 COME IN', 512, 96, INK, PAPER, RED), 2.0, 0.38, 5.6, 3.35, -9.83, 0, LG); }
  airSigns.push(planeT(AIR_OFF, 1.0, 0.38, 5.6, 3.85, -9.83, 0, LG));
  const feedT = CT(512, 296, () => {}); const RWx = GEO.RW / 2 - 0.29;
  planeT(feedT, 2.36, 1.36, RWx, 2.8, -3.6, -Math.PI / 2, LG); planeT(wxT, 2.36, 1.36, RWx, 2.8, -0.6, -Math.PI / 2, LG);
  const promoT = CT(512, 296, (g, W, H) => { g.drawImage(backT.userData.c, 0, 0, W, H); g.fillStyle = INK; g.fillRect(0, H - 70, W, 70); g.fillStyle = YEL; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('STERLING GLOSS \u00b7 6 PM', 20, H - 35); });
  planeT(promoT, 2.36, 1.36, RWx, 2.8, 2.4, -Math.PI / 2, LG);
  const LDOOR = [5.6, -8.6], SDOOR = [0, 8.8];
  // ================= YOUR FACE (portrait for the billboard / lobby / home TV) =================
  const FK = 'meru2.tvFace'; let faceImg = null; const loadFace = () => { const u = localStorage.getItem(FK); if (!u) return null; if (faceImg && faceImg.src === u) return faceImg; faceImg = new Image(); faceImg.onload = () => { feedKey = ''; drawBill(true); drawHome(true); }; faceImg.src = u; return faceImg; };
  const facePic = () => { const im = save.stat('mtvFace', false) ? loadFace() : null; return im && im.complete && im.naturalWidth ? im : null; };
  const drawFace = (g, im, x, y, w, h) => { g.save(); g.filter = 'grayscale(1) contrast(1.1)'; g.drawImage(im, x, y, w, h); g.restore(); };
  const lastShow = () => save.stat('mtvLast', null);
  let feedKey = ''; function drawFeed() { const live = (busy === 'job' || busy === 'errand') && J ? GN[J.g].name.toUpperCase() : '', ls = lastShow(), im = facePic(), key = [live, ls && ls.g + ls.s + ls.d, !!im].join('|'); if (key === feedKey) return; feedKey = key; const g = feedT.userData.c.getContext('2d'), W = 512, H = 296;
    g.fillStyle = NAVY; g.fillRect(0, 0, W, H); if (im) drawFace(g, im, W - 220, 0, 220, 226); g.fillStyle = live ? '#ff2a1a' : RED; g.fillRect(0, 0, live ? 150 : 210, 46); g.fillStyle = '#fff'; g.font = '900 26px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(live ? '\u25cf LIVE' : 'MERU TV', 16, 24);
    g.font = '900 34px Archivo, sans-serif'; const big = live ? 'ON AIR NOW' : ls ? 'JUST AIRED' : 'NEWS AT SIX'; g.fillText(big, 18, 100); g.font = '800 24px Archivo, sans-serif'; g.fillText(live || (ls ? (GN[ls.g] ? GN[ls.g].name.toUpperCase() : '') : 'STERLING GLOSS'), 18, 142); if (ls && !live) g.fillText('\u2605'.repeat(ls.s) + '\u2606'.repeat(3 - ls.s), 18, 178);
    g.fillStyle = INK; g.fillRect(0, H - 70, W, 70); g.fillStyle = YEL; g.font = '900 24px Archivo, sans-serif'; g.fillText(im ? "MERU TV'S NEWEST FACE" : 'WEATHER AT TEN PAST', 18, H - 35); feedT.needsUpdate = true; }
  // ================= OUTSIDE: BILLBOARD by the tower door =================
  const CBt = (L.CLUSTER_BUILDINGS || []).find(c => c.key === 'tvStation'), D0 = CBt && CBt.D;
  const OUTW = (lx, lz) => { const c = Math.cos(D0.ry), s = Math.sin(D0.ry); return [D0.x + lx * c + lz * s, D0.z - lx * s + lz * c]; };
  const OG = new THREE.Group(); OG.name = 'meruTVBillboard'; scene.add(OG); const billT = CT(768, 440, () => {});
  if (D0) { OG.position.set(D0.x, 0, D0.z); OG.rotation.y = D0.ry; const S = mk(), bx = -8.6, bz = 4.2; for (const s of [-1, 1]) S.box(0.24, 4.6, 0.24, INK, bx + s * 1.9, 2.3, bz - 0.2); S.box(4.6, 2.8, 0.16, INK, bx, 4.4, bz - 0.3); S.box(4.6, 0.12, 0.5, STEEL, bx, 2.95, bz - 0.05); S.mesh(OG);
    planeT(billT, 4.3, 2.46, bx, 4.4, bz - 0.21, 0, OG); for (const s of [-1, 1]) { const [x, z] = OUTW(bx + s * 1.9, bz - 0.2); cols.push({ c: [x, z, 0.3] }); } }
  let billKey = ''; function drawBill(force) { const im = facePic(), key = (im ? 'f' : 'p') + today(); if (!force && key === billKey) return; billKey = key; const g = billT.userData.c.getContext('2d'), W = 768, H = 440;
    if (im) { g.fillStyle = PAPER; g.fillRect(0, 0, W, H); drawFace(g, im, W - 360, 0, 360, H); g.fillStyle = RED; g.fillRect(0, 0, W - 360, 110); g.fillStyle = '#fff'; g.font = '900 54px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU TV', 28, 58);
      g.fillStyle = INK; g.font = '900 52px Archivo, sans-serif'; ['MERU TV\u2019S', 'NEWEST', 'FACE'].forEach((t, i) => g.fillText(t, 28, 170 + i * 60)); g.font = '800 26px Archivo, sans-serif'; g.fillText('NEWS AT SIX \u00b7 WEATHER AT TEN PAST', 28, H - 40); }
    else { g.drawImage(backT.userData.c, 0, 0, W, H); g.fillStyle = INK; g.fillRect(0, H - 110, W, 110); g.fillStyle = '#fff'; g.font = '900 48px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('STERLING GLOSS', 28, H - 72); g.fillStyle = YEL; g.font = '800 26px Archivo, sans-serif'; g.fillText('NEWS AT SIX \u00b7 EVERYONE KNOWS THE FACE', 28, H - 30); }
    billT.needsUpdate = true; }
  // HOME TV (2 jobs): every apartment TV runs MERU TV with your last report
  const homeC = aptTV && aptTV.userData && aptTV.userData.c; let homeKey = '';
  function drawHome(force) { if (!homeC || !save.stat('mtvHome', false)) return; const ls = lastShow(), im = facePic(), key = (ls ? ls.g + ls.s + ls.d : '-') + !!im; if (!force && key === homeKey) return; homeKey = key; const g = homeC.getContext('2d'), W = homeC.width, H = homeC.height;
    g.fillStyle = NAVY; g.fillRect(0, 0, W, H); if (im) drawFace(g, im, W - 100, 0, 100, H - 36); g.fillStyle = RED; g.fillRect(0, 0, 118, 30); g.fillStyle = '#fff'; g.font = '900 20px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU TV', 10, 16);
    g.font = '900 18px Archivo, sans-serif'; g.fillText('YOUR REPORT', 10, 54); g.font = '800 15px Archivo, sans-serif'; g.fillText(ls && GN[ls.g] ? GN[ls.g].name.toUpperCase() : 'COMING UP', 10, 78); if (ls) { g.fillStyle = YEL; g.fillText('\u2605'.repeat(ls.s) + '\u2606'.repeat(3 - ls.s), 10, 98); }
    g.fillStyle = RED; g.fillRect(0, H - 36, W, 36); g.fillStyle = '#fff'; g.font = '900 18px Archivo, sans-serif'; g.fillText('DAY ' + (ls ? ls.d : today()) + ' \u00b7 ' + temp() + '\u00b0', 10, H - 18); aptTV.needsUpdate = true; }
  // ================= FOXES =================
  const ST0 = [-3.6, -6.8, 0], WF0 = [8.9, -7.4, -0.5], CO0 = [-6.8, 1.3, Math.PI * 0.85];
  const sterling = kit.makeFox({ key: 'tvAnchor', name: 'Sterling Gloss', torso: ['#f3f2f2', '#2e4a6b', '#16263c'], outfit: 'suit', mood: 'happy' }); sterling.position.set(ST0[0], 0, ST0[1]); sterling.rotation.y = ST0[2]; sterling.userData.noCull = true; sterling.userData.rosterShop = 'Meru TV'; G.add(sterling); circL(ST0[0], ST0[1], 0.45);
  const wfox = kit.makeFox({ key: 'tvWeather', name: 'Weather Fox', torso: ['#ffd23a', '#2e86b8', '#16435c'], outfit: 'dress', mood: 'happy' }); wfox.position.set(WF0[0], 0, WF0[1]); wfox.rotation.y = WF0[2]; wfox.userData.noCull = true; wfox.userData.rosterShop = 'Meru TV'; wfox.userData.rosterRole = 'keeper'; G.add(wfox); circL(WF0[0], WF0[1], 0.45);
  const camOp = kit.makeFox({ key: 'tvCamera', name: 'Camera Operator', torso: ['#201e1d', '#ec3013', '#111111'], outfit: 'vest', mood: 'neutral' }); camOp.position.set(CO0[0], 0, CO0[1]); camOp.rotation.y = CO0[2]; camOp.userData.noCull = true; camOp.userData.rosterShop = 'Meru TV'; G.add(camOp); circL(CO0[0], CO0[1], 0.45);
  const AUD = [[5.0, 3.5, 0], [7.4, 3.5, 0.3], [6.0, 5.1, 0.3], [8.4, 6.7, 0.6]].map(([x, z, y], i) => { const f = kit.makeFox({ key: 'tvAud' + i, torso: [['#2e4a6b', '#e7e4dc', '#16263c'], ['#7a1d2a', '#f3f2f2', '#3d1218'], ['#4f7d3a', '#e2d2b4', '#2a3d20'], ['#c97a3a', '#f3f2f2', '#7a3d1a']][i], outfit: ['coat', 'vest', 'robe', 'coat'][i], mood: 'happy' }); f.position.set(x, y + 0.42, z); f.scale.setScalar(0.92); f.rotation.y = Math.PI + (x - 6.4) * 0.08; f.userData.crowd = true; f.userData.y0 = y + 0.42; G.add(f); return f; });
  // ================= shopKit (Sterling = keeper; Weather Fox has her own idle below) =================
  const GAMES = [{ k: 'weather', name: 'Weather Report', color: '#2e86b8', who: 'wf' }, { k: 'cue', name: 'Cue Cards', color: RED, who: 'st' }, { k: 'makeup', name: 'Make-up + Lights', color: '#c9a24a', who: 'st' }, { k: 'control', name: 'Control Room', color: DARK, who: 'st' }, { k: 'live', name: 'Live on the Scene', color: GREEN, who: 'wf' }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { weather: [3.4, -6.0], cue: [-0.2, -3.4], makeup: [-7.2, -3.0], control: [-7.3, 5.8], live: [-2.6, 6.6] };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'mtv', color: RED, boardTitle: 'Meru TV board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.3], keeper: sterling, keeperRy: 0, games: GAMES, toWorld: v => v.add(G.position),
    board: { x: 9.83, y: 2.7, z: -1.6, ry: -Math.PI / 2, w: 1.5 }, hiring: { x: 2.4, z: 7.8, ry: 0 }, hiringLine: 'WEATHER \u00b7 CAMERAS \u00b7 LIVE', sun: [], lamps: CANS.map(([x, z]) => [x, 4.6, z]), lampsOn: () => true,
    browse: [[2.6, 2.4, Math.PI], [1.8, -2.2, Math.PI], [-2.4, 3.6, -Math.PI / 2]], looks: [['#2e4a6b', '#e7e4dc', '#16263c'], ['#7a1d2a', '#f3f2f2', '#3d1218'], ['#4f7d3a', '#e2d2b4', '#2a3d20']], clock: { x: 0, y: 5.0, z: 9.83, ry: Math.PI } });
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringMeshes = {};
  for (const k in RINGS) { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(RINGS[k][0], 0.03, RINGS[k][1]); G.add(m); ringMeshes[k] = m; }
  // ================= KIT: sound, toast, fade, card, panel, strip, markers =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, blip = () => tone(880, 0.04, 0.08, 'square');
  const clap = (n = 14) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const len = 0.05, buf = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    for (let i = 0; i < n; i++) { const s = ac.createBufferSource(), gn = ac.createGain(), f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200 + Math.random() * 1400; s.buffer = buf; gn.gain.value = 0.12; s.connect(f).connect(gn).connect(ac.destination); s.start(ac.currentTime + Math.random() * 1.4); } } catch (e) {} };
  let veil = null, fading = false; const fade = fn => { if (fading) return; fading = true; if (!veil) { veil = document.createElement('div'); Object.assign(veil.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity .28s', zIndex: '40' }); document.body.appendChild(veil); }
    void veil.offsetWidth; veil.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { veil.style.opacity = '0'; fading = false; }, 160); } }, 300); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,270px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(36vw, 250px)' : 'min(58vw, 270px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + RED + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = (next, stopBtn) => '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span>' + (stopBtn ? '<button data-stop style="pointer-events:auto;min-height:44px;min-width:64px;padding:0 12px;text-align:left;background:#f3f2f2;color:#201e1d;border:2px solid #f3f2f2;border-radius:0;font:900 12px Archivo,sans-serif;cursor:pointer">STOP</button>' : '<span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span>') + '</div>';
  const meter = (f, c) => '<div style="position:relative;height:14px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:0;top:0;bottom:0;width:' + (clamp(f, 0, 1) * 100).toFixed(1) + '%;background:' + c + '"></div></div>';
  const steps = items => '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">' + items.map(([t, ok]) => '<span style="padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;line-height:1.3;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffd23a' : '#201e1d') + '">' + (ok ? '\u2713 ' : '') + t + '</span>').join('') + '</div>';
  const tipH = (who, t) => '<div style="margin-top:6px;font-size:12px;font-weight:800;line-height:1.3"><span style="color:' + RED + ';font-weight:900">' + who + ' \u00b7 </span>' + t + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; const b = card.querySelector('[data-stop]'); if (b) b.onclick = e => { e.stopPropagation(); quit(); }; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const stopEv = el => { for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'touchstart', 'touchmove']) el.addEventListener(ev, e => e.stopPropagation(), { passive: true }); };
  const PANEL = document.createElement('div'); PANEL.style.cssText = 'position:fixed;z-index:34;display:none;flex-direction:column;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;box-sizing:border-box;overflow:hidden;-webkit-user-select:none;user-select:none;touch-action:none';
  document.body.appendChild(PANEL); stopEv(PANEL);
  const sideM = () => { const W = innerWidth, H = innerHeight; return H < 520 ? Math.max(8, Math.min(180, (W - 320) / 2)) : 8; };
  const fitPanel = () => { const W = innerWidth, H = innerHeight, short = H < 520, side = sideM(), w = Math.min(640, W - side * 2); Object.assign(PANEL.style, { left: Math.round((W - w) / 2) + 'px', width: Math.round(w) + 'px', top: (short ? 8 : 56) + 'px', bottom: (short ? 8 : 80) + 'px' }); };
  const panelHead = (l, r) => '<div style="display:flex;align-items:center;gap:10px;background:' + RED + ';color:#fff;padding:0 0 0 12px;font-weight:900;font-size:14px;flex:none;min-height:46px"><span style="flex:1;min-width:0;padding:6px 0;line-height:1.2;text-wrap:balance">' + l + '</span><span style="white-space:nowrap">' + r + '</span><button data-stop style="align-self:stretch;min-width:72px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 13px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">STOP</button></div>';
  const showPanel = html => { fitPanel(); PANEL.innerHTML = html; PANEL.style.display = 'flex'; const b = PANEL.querySelector('[data-stop]'); if (b) b.onclick = () => quit(); };
  const hidePanel = () => { PANEL.style.display = 'none'; PANEL.innerHTML = ''; };
  // the CUE STRIP (cue cards): a low sheet so Sterling stays in view; clear of the phone's right button column (portrait) and side columns (landscape)
  const STRIP = document.createElement('div'); STRIP.style.cssText = 'position:fixed;z-index:34;display:none;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;box-sizing:border-box;-webkit-user-select:none;user-select:none';
  document.body.appendChild(STRIP); stopEv(STRIP);
  const fitStrip = () => { const W = innerWidth, H = innerHeight, short = H < 520, side = sideM(), port = W < H, w = Math.min(560, W - side * 2); Object.assign(STRIP.style, { left: Math.round((W - w) / 2) + 'px', width: Math.round(w) + 'px', bottom: (short ? 8 : touch && port ? 250 : 90) + 'px' }); };
  addEventListener('resize', () => { if (PANEL.style.display !== 'none') { fitPanel(); if (J && GD[J.g].draw) GD[J.g].draw(); } if (STRIP.style.display !== 'none') fitStrip(); });
  const shake = el => { try { el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 }); } catch (e) {} };
  const pulse = el => { try { el.animate([{ outlineColor: '#ffd23a', outlineWidth: '4px' }, { outlineColor: 'rgba(255,210,58,0)', outlineWidth: '8px' }], { duration: 700, iterations: 3 }); } catch (e) {} };
  const beamM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const bangT = CT(64, 96, (g, W, H) => { g.fillStyle = YEL; g.strokeStyle = INK; g.lineWidth = 6; g.fillRect(4, 4, W - 8, H - 8); g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = INK; g.font = '900 64px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('!', 22, H / 2 + 3); });
  const marker = (x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 16, 10, 1, true), beamM); b.position.y = 8; g.add(b); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bangT, depthTest: false, transparent: true })); s.scale.set(0.5, 0.75, 1); s.position.y = 2.9; s.renderOrder = 5; g.add(s); g.userData.tag = s; g.traverse(o => { o.userData.noCull = true; }); scene.add(g); return g; };
  const ARW = document.createElement('div'); ARW.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;background:#201e1d;color:#ffd23a;font-weight:900;font-size:15px;padding:6px 10px;border:2px solid #ffd23a;white-space:nowrap;transform:translate(-50%,-100%)';
  document.body.appendChild(ARW); const tmp = V();
  function arrowTo(w, label) { if (!w) { ARW.style.display = 'none'; return; } tmp.copy(w).project(camera); let x = (tmp.x + 1) / 2 * innerWidth, y = (1 - tmp.y) / 2 * innerHeight; const behind = tmp.z > 1; if (behind) { x = innerWidth - x; y = innerHeight - y; }
    const m = 120, mr = innerWidth < 600 ? 130 : 270, mt = innerHeight < 520 ? 60 : 130, mb = innerHeight < 520 ? 70 : 250, off = behind || x < m || x > innerWidth - mr || y < mt || y > innerHeight - mb, cx = innerWidth / 2, cy = innerHeight / 2;
    let ar = '\u25bc'; if (off) { const a = Math.atan2(y - cy, x - cx); x = clamp(x, m, innerWidth - mr); y = clamp(y, mt, innerHeight - mb); ar = '<span style="display:inline-block;transform:rotate(' + (a * 180 / Math.PI + 90).toFixed(0) + 'deg)">\u25b2</span>'; }
    ARW.style.display = 'block'; ARW.style.left = Math.round(x) + 'px'; ARW.style.top = Math.round(y) + 'px'; const h = ar + ' ' + label; if (ARW._h !== h) { ARW._h = h; ARW.innerHTML = h; } }
  // ================= input (3D taps: weather wall, make-up sparkles, key lights) =================
  let busy = null, J = null, lastP = null, lastFox = null, snapK = false, endClear = 0;
  const ptr = { x: 0, y: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (PANEL.contains(t) || STRIP.contains(t)) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && J && !fading && GD[J.g].tap3d;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); GD[J.g].tap(ptr.x, ptr.y); }, true);
  const RAD = () => (touch ? 54 : 34) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const pdAt = (v, x, y) => { const s = scrW(v); return s[2] > 1 ? 1e9 : Math.hypot(s[0] - x, s[1] - y); };
  const addGold = n => { n = Math.max(0, Math.round(n)); if (!J) return 0; J.gold += n; save.addGold(n); coin(); return n; };
  const missOne = (msg, s = 1.8) => { if (!J) return; J.miss++; nope(); toast(msg, s); const tip = (PANEL.style.display !== 'none' ? PANEL : STRIP).querySelector('[data-tip]'); if (tip) { tip.textContent = msg; tip.style.background = '#ec3013'; tip.style.color = '#ffffff'; } };
  // ================= talk targets =================
  const ln = (who, role) => text => ({ who, role, text });
  const T_ST = { key: 'tvAnchor', name: 'Sterling Gloss', role: 'MERU TV NEWS', obj: sterling, ry: ST0[2], r: 6 }, stLn = ln('Sterling Gloss', 'MERU TV NEWS');
  const T_WF = { key: 'tvWeather', name: 'Weather Fox', role: 'MERU TV WEATHER', obj: wfox, ry: WF0[2], r: 6 }, wfLn = ln('Weather Fox', 'MERU TV WEATHER');
  const T_CO = { key: 'tvCamera', name: 'Camera Operator', role: 'MERU TV', obj: camOp, ry: CO0[2], r: 4 };
  const giver = g => (GN[g].who === 'wf' ? [T_WF, wfLn] : [T_ST, stLn]);
  const goRoom = (x, z, yaw) => go(OX + x, LY, LZ + z, yaw);
  const place = (f, x, z, ry) => { f.position.set(x, 0, z); f.rotation.y = ry; };
  const armUp = (f, side, rz, rx = 0) => { const A = f && f.userData && f.userData.P && f.userData.P.arms; if (A && A[side]) { A[side].rotation.z = rz; A[side].rotation.x = rx; } };
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
  const GD = {};
  // ---------- 1 WEATHER REPORT (3D): read the autocue, tap the right part of the map in time ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const regAt = (x, y) => { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); const h = ray.intersectObject(wallM)[0]; if (!h || !h.uv) return null; const px = h.uv.x * 1024, py = (1 - h.uv.y) * 576; const r = REG.find(([, , rx, ry, w, hh]) => px > rx - 10 && px < rx + w + 10 && py > ry - 10 && py < ry + hh + 10); return r ? r[0] : null; };
  const regW = k => { const r = REG.find(q => q[0] === k); return toW(5.0 - 3 + (r[2] + r[4] / 2) / 1024 * 6, 2.5 + 3.375 / 2 - (r[3] + r[5] / 2) / 576 * 3.375, -9.7); };
  const WXTIME = 7;
  GD.weather = { tap3d: true, shot: () => [toW(4.2, 2.3, -9.0), 7.6, 4.0, 0.06, 6, 0, 13],
    begin() { const fc = forecast(), d = today(), regs = shuffle(REG.map(r => r[0])).filter(k => k !== 'square').slice(0, 4);
      J.cues = [...regs.map((k, i) => ({ k, kind: KINDS[hash(d * 11 + i + 3) % 5] })), { k: 'square', kind: fc.square, today: true }]; J.ci = 0; J.cueT = WXTIME; J.shown = {}; J.pointT = 0;
      goRoom(1.8, -8.4, 0); place(wfox, 8.4, -1.2, -Math.PI * 0.85); snapK = true; drawWx(J.shown, null); },
    cue() { const c = J.cues[J.ci]; return c ? (c.today ? 'AND TODAY IN TOWN SQUARE: ' + KNAME[c.kind] + ', ' + temp() + '\u00b0' : KNAME[c.kind] + ' OVER ' + REG.find(r => r[0] === c.k)[1]) : ''; },
    tap(x, y) { const c = J.cues[J.ci]; if (!c || J.wait > 0) return; const k = regAt(x, y); if (!k) return; J.idle = 0;
      if (k !== c.k) { missOne('WRONG SPOT \u00b7 READ THE AUTOCUE'); drawWx(J.shown, k); setTimeout(() => { if (J && J.g === 'weather') drawWx(J.shown, null); }, 400); return; }
      J.shown[k] = c.kind; J.pointT = 1.1; addGold(c.today ? 6 : 4); ding(); this.next(); },
    next() { J.ci++; J.cueT = WXTIME; J.wait = 0.6; drawWx(J.shown, null); if (J.ci >= J.cues.length) { addGold(6); clap(); setTimeout(finishGame, 900); } },
    tick(dt) { J.idle = (J.idle || 0) + dt; if (J.wait > 0) { J.wait -= dt; } else if (J.ci < J.cues.length && (J.cueT -= dt) <= 0) { missOne('TOO SLOW \u00b7 NEXT ONE'); this.next(); }
      if (lastFox) { if (J.pointT > 0) { J.pointT -= dt; armUp(lastFox, 1, 1.45); } } kit.animFox(wfox, dt, 0, false); },
    card() { const c = J.cues[J.ci]; return { key: 'w' + J.ci + '|' + Math.ceil(J.cueT * 4), right: Math.min(J.ci, J.cues.length) + ' / ' + J.cues.length, next: 'TAP THE MAP WHERE IT SAYS',
      body: '<div style="font-size:11px;font-weight:900;margin-top:6px;color:#ec3013">AUTOCUE</div><div style="font-size:17px;font-weight:900;line-height:1.15;margin-top:2px;text-wrap:balance">' + (c ? this.cue() : 'THAT\u2019S THE WEATHER!') + '</div>' + meter(J.cueT / WXTIME, J.cueT < 2.5 ? RED : INK) + tipH('WEATHER FOX', 'Point, smile, never say "probably".') }; },
    hint() { const c = J.cues[J.ci]; return c && J.idle > 3 ? [regW(c.k), 'TAP ' + REG.find(r => r[0] === c.k)[1]] : null; } };
  // ---------- 2 CUE CARDS (strip): Sterling stops mid-line; hold up the card that finishes it ----------
  const CUES = [["Good evening, Meru. I'm ___.", 'STERLING GLOSS', 'STERLING SILVER', 'A POTATO'], ['Top story: bandits hold ___ buildings.', 'TWO', 'TWELVE', 'ALL THE'], ['The ferry ran ___ today.', 'ON TIME', 'ON TOAST', 'BACKWARDS'],
    ['Robots ran wild on ___ Street.', 'FACTORY', 'PUDDING', 'BANANA'], ['The Salt and Pepper families are still ___.', 'FEUDING', 'DANCING', 'SNEEZING'], ['And now, the weather with ___!', 'WEATHER FOX', 'WEATHER DOG', 'MY HAIR'], ['The fire station is looking for ___.', 'VOLUNTEERS', 'ITS HOSE', 'DRAGONS'], ['Goodnight, Meru. Stay ___.', 'CURIOUS', 'CRUNCHY', 'INDOORS FOREVER']];
  const CUETIME = 9;
  GD.cue = { strip: true, shot: () => [toW(-3.6, 1.9, -6.8), 6, 3.6, 0.12, 6, 0.42, 9],
    begin() { J.list = [...shuffle(CUES.slice(0, 7)).slice(0, 5), CUES[7]]; J.ci = 0; J.cueT = CUETIME; goRoom(0.6, -2.6, Math.atan2(-3.6 - 0.6, -6.8 + 2.6)); place(sterling, ST0[0], ST0[1], 0); place(camOp, -1.0, -0.8, Math.PI); snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; fitStrip(); if (!c) { STRIP.style.display = 'none'; return; } const opts = J.opts || (J.opts = shuffle(c.slice(1)));
      STRIP.innerHTML = '<div style="display:flex;align-items:center;gap:10px;background:' + RED + ';color:#fff;padding:0 0 0 12px;font-weight:900;font-size:13px;min-height:40px"><span style="flex:1">CUE CARDS \u00b7 ' + (J.ci + 1) + ' / ' + J.list.length + '</span><button data-stop style="align-self:stretch;min-width:64px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 12px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">STOP</button></div>'
        + '<div style="padding:8px 12px 4px"><div style="font-size:11px;font-weight:900;color:#ec3013">STERLING</div><div style="font-size:18px;font-weight:900;line-height:1.2;text-wrap:balance">\u201c' + c[0].replace('___', '<span style="background:#ffd23a;padding:0 6px">\u2026</span>') + '\u201d</div><div data-time style="height:8px;background:#201e1d;margin-top:6px;width:100%"></div></div>'
        + '<div style="display:flex;gap:8px;padding:8px 12px 10px">' + opts.map(o => '<button data-o="' + o + '" style="flex:1 1 0;min-width:0;min-height:56px;padding:6px 10px;text-align:left;background:#fff;color:#201e1d;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;line-height:1.1;cursor:pointer;outline:0 solid transparent">' + o + '</button>').join('') + '</div>'
        + '<div data-tip style="background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:6px 12px">HOLD UP THE CARD THAT FINISHES THE LINE</div>';
      STRIP.style.display = 'block'; STRIP.querySelector('[data-stop]').onclick = () => quit(); STRIP.querySelectorAll('[data-o]').forEach(b => { b.onclick = () => this.pick(b.dataset.o, b); }); J.idle = 0; J.hinted = false; },
    pick(o, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (o !== c[1]) { missOne('WRONG CARD \u00b7 STERLING IMPROVISES'); shake(el); el.disabled = true; el.style.background = '#cfcac3'; el.style.color = '#8a847a'; return; }
      addGold(4); ding(); el.style.background = '#201e1d'; el.style.color = '#ffd23a'; J.say = c[0].replace('___', c[1]); J.sayT = 1.6; J.wait = 1.0; setTimeout(() => this.next(), 900); },
    next() { if (!J || J.g !== 'cue') return; J.ci++; J.opts = null; J.cueT = CUETIME; J.wait = 0; if (J.ci >= J.list.length) { STRIP.style.display = 'none'; addGold(6); clap(); setTimeout(finishGame, 600); return; } this.draw(); },
    tick(dt) { J.idle = (J.idle || 0) + dt; if (J.ci < J.list.length && !(J.wait > 0)) { J.cueT -= dt; const tb = STRIP.querySelector('[data-time]'); if (tb) { tb.style.width = (clamp(J.cueT / CUETIME, 0, 1) * 100).toFixed(1) + '%'; tb.style.background = J.cueT < 3 ? RED : INK; } if (J.cueT <= 0) { missOne('DEAD AIR \u00b7 STERLING ADLIBS'); this.next(); } }
      if (J.idle > 3 && !J.hinted) { J.hinted = true; const c = J.list[J.ci], b = c && STRIP.querySelector('[data-o="' + c[1] + '"]'); if (b) { b.style.outline = '4px solid #ffd23a'; pulse(b); } }
      const A = sterling.userData.P && sterling.userData.P.arms; if (A) { kit.animFox(sterling, dt, 0, false); A[0].rotation.x = -0.5 + Math.sin(performance.now() / 300) * 0.15; } kit.animFox(camOp, dt, 0, false); } };
  // ---------- 3 MAKE-UP + LIGHTS (3D): tap the shiny spots off Sterling's face, then lock each key light when its beam turns green on the desk ----------
  const sparkT = CT(64, 64, (g, W) => { g.fillStyle = '#fff'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 8 : 30; g.lineTo(W / 2 + Math.cos(a) * r, W / 2 + Math.sin(a) * r); } g.closePath(); g.fill(); });
  const headW = f => { const h = f.userData.P && f.userData.P.head, v = V(); if (h) h.getWorldPosition(v); else f.getWorldPosition(v).add(V(0, 1.7, 0)); return v; };
  GD.makeup = { tap3d: true, shot() { if (J.ph === 0) { const h = headW(sterling); return [h.clone().add(V(0, -0.15, 0)), 2.6, 1.8, 0.06, 3.4, Math.PI / 2, 4.6]; } return [toW(-3.6, 2.7, -5.2), 8, 5.4, 0.2, 7, 0, 12]; },
    begin() { J.ph = 0; place(sterling, -8.4, -4.4, Math.PI / 2); goRoom(-7.2, -5.4, -Math.PI * 0.75); snapK = true; J.sp = []; J.pend = 1; },
    spawnSparks() { const h = headW(sterling); J.sp = [[0.3, 0.06, 0.12], [0.32, 0.16, -0.08], [0.28, -0.06, -0.16], [0.34, 0.0, 0.0]].map(o => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkT, color: '#fff7c0', transparent: true, depthTest: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.2); s.position.copy(h).add(V(...o)); s.renderOrder = 6; scene.add(s); J.objs.push(s); return { s, on: true }; }); },
    tap(x, y) { J.idle = 0; if (J.ph === 0) { const hit = J.sp.filter(q => q.on).sort((a, b) => pdAt(a.s.position, x, y) - pdAt(b.s.position, x, y))[0]; if (!hit || pdAt(hit.s.position, x, y) > RAD() * 1.4) return;
        hit.on = false; hit.s.visible = false; addGold(2); tone(1200 + J.sp.filter(q => !q.on).length * 160, 0.04, 0.18, 'triangle'); if (J.sp.every(q => !q.on)) { toast('NO SHINE \u00b7 NOW THE LIGHTS', 1.8); ding(); J.ph = 0.5; setTimeout(() => fade(() => { if (!J || J.g !== 'makeup') return; place(sterling, ST0[0], ST0[1], 0); goRoom(1.6, -1.6, -Math.PI * 0.8); J.ph = 1; J.ki = 0; KEYS.forEach(k => { k.lock = false; }); snapK = true; }), 500); } return; }
      if (J.ph !== 1) return; const k = KEYS[J.ki]; if (!k) return; if (Math.abs(k.sx - ST0[0]) < 0.75) { k.lock = true; k.sx = ST0[0]; addGold(4); ding(); J.ki++; if (J.ki >= KEYS.length) { addGold(6); clap(); J.ph = 2; setTimeout(finishGame, 900); } } else missOne('TOO EARLY \u00b7 WAIT FOR GREEN'); },
    tick(dt, t) { J.idle = (J.idle || 0) + dt; if (J.ph === 0) { if (J.pend && (J.pend -= dt) <= 0) { J.pend = 0; this.spawnSparks(); } J.sp.forEach((q, i) => { if (q.on) q.s.material.rotation = t * 2 + i; q.s.scale.setScalar(0.2 + 0.04 * Math.sin(t * 6 + i)); }); }
      if (J.ph === 1) KEYS.forEach((k, i) => { if (!k.lock) k.sx = i === J.ki ? ST0[0] + Math.sin(t * 1.9 + k.ph) * 3.4 : k.x; });
      kit.animFox(sterling, dt, 0, false); },
    card() { if (J.ph < 1) { const n = J.sp.filter(q => !q.on).length; return { key: 'm0|' + n, right: n + ' / 4', next: 'TAP THE SHINY SPOTS', body: steps([['POWDER', J.ph > 0], ['LIGHTS', false]]) + tipH('STERLING', 'Shine is for shoes, darling. Not for anchors.') }; }
      const k = KEYS[J.ki], on = k && Math.abs(k.sx - ST0[0]) < 0.75; return { key: 'm1|' + J.ki + on, right: Math.min(J.ki, 3) + ' / 3', next: on ? 'GREEN \u00b7 TAP NOW' : 'WAIT FOR GREEN \u00b7 THEN TAP', body: steps([['POWDER', true], ['LIGHT 1', J.ki > 0], ['LIGHT 2', J.ki > 1], ['LIGHT 3', J.ki > 2]]) + tipH('STERLING', 'The light finds me. That is its job.') }; },
    hint() { if (J.idle < 3) return null; if (J.ph === 0) { const q = J.sp.find(s => s.on); return q ? [q.s.position, 'TAP'] : null; } const k = KEYS[J.ki]; return k && Math.abs(k.sx - ST0[0]) < 0.75 ? [toW(k.x, 5.0, -3.4), 'TAP NOW'] : null; } };
  // ---------- 4 CONTROL ROOM (panel): cut to the right camera on each cue; page 2 has no camera numbers ----------
  const CAMV = [{ n: 'STUDIO WIDE', p: [-6.8, 2.1, 0.4], l: [-2.0, 1.6, -6.8] }, { n: 'STERLING CLOSE', p: [-1.0, 1.9, -1.6], l: [-3.6, 1.75, -6.8] }, { n: 'WEATHER WALL', p: [4.0, 2.0, -1.6], l: [4.6, 2.2, -9.4] }];
  const RUN = [['STERLING SAYS GOOD EVENING', 0, true], ['THE TOP STORY, CLOSE UP', 1, true], ['OVER TO THE WEATHER', 2, true], ['BACK TO THE DESK', 0, true], ['WEATHER FOX POINTS AT THE LAKE', 2, false], ['STERLING LEANS IN FOR A SECRET', 1, false], ['A WIDE SHOT OF THE WHOLE STUDIO', 0, false], ['STERLING WINKS AT THE LENS', 1, false]];
  const CTTIME = 7, pcam = new THREE.PerspectiveCamera(46, 16 / 9, 0.1, 80);
  function grab(cv) { if (!renderer) return null; try { const a = toW(...cv.p), b = toW(...cv.l); pcam.position.copy(a).addScaledVector(b.clone().sub(a).normalize(), 1.0); pcam.lookAt(b); pcam.updateMatrixWorld(); renderer.render(scene, pcam); const src = renderer.domElement, c = document.createElement('canvas'); c.width = 320; c.height = 180; const g = c.getContext('2d'), sw = src.width, sh = src.height; let w = sw, h = sw * 9 / 16; if (h > sh) { h = sh; w = sh * 16 / 9; } g.drawImage(src, (sw - w) / 2, (sh - h) / 2, w, h, 0, 0, 320, 180); return c.toDataURL('image/jpeg', 0.7); } catch (e) { return null; } }
  GD.control = { panel: true, shot: () => [toW(-7.3, 1.6, 2.4), 5.0, 2.8, 0.18, 3.0, Math.PI, 5.4],
    begin() { goRoom(-7.3, 4.6, Math.PI); place(sterling, ST0[0], ST0[1], 0); place(wfox, 2.9, -8.6, 0.2); place(camOp, CAMS[0].x - Math.sin(CAMS[0].ry) * 0.9, CAMS[0].z - Math.cos(CAMS[0].ry) * 0.9, CAMS[0].ry);
      const was = G.visible; G.visible = true; J.th = CAMV.map(grab); G.visible = was; J.img = J.th.map(u => { if (!u) return null; const im = new Image(); im.onload = () => drawMon(J && J.img || [], J ? J.pgm : -1); im.src = u; return im; });
      J.list = [...RUN.slice(0, 4), ...shuffle(RUN.slice(4))]; J.ci = 0; J.cueT = CTTIME; J.pgm = 0; J.wait = 0.8; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci], pg = J.ci < 4 ? 1 : 2, th = J.th || [];
      showPanel(panelHead('CONTROL ROOM \u00b7 PAGE ' + pg + ' / 2', J.gold ? J.gold + ' G' : 'MERU TV') + '<div data-body style="flex:1;min-height:0;display:flex;gap:10px;padding:10px;box-sizing:border-box;overflow:auto"></div><div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:13px;padding:8px 12px">' + (pg === 1 ? 'CUT TO THE CAMERA ON THE RUNDOWN' : 'NO NUMBERS NOW \u00b7 PICK THE RIGHT SHOT') + '</div>');
      const body = PANEL.querySelector('[data-body]'), wide = body.clientWidth > body.clientHeight * 1.3; body.style.flexDirection = wide ? 'row' : 'column';
      const pic = (i, extra) => th[i] ? '<div style="position:relative;aspect-ratio:16/9;background:url(' + th[i] + ') center/cover;filter:grayscale(0.15)' + extra + '"></div>' : '<div style="aspect-ratio:16/9;background:#0b1a2e;color:#f3f2f2;display:flex;align-items:flex-end;padding:6px;font-weight:900;font-size:13px' + extra + '">' + CAMV[i].n + '</div>';
      body.innerHTML = '<div style="flex:' + (wide ? '1.25' : 'none') + ' 1 0;min-width:0;display:flex;flex-direction:column;gap:6px"><div style="position:relative;border:2px solid #201e1d">' + pic(J.pgm, '') + '<div style="position:absolute;left:0;top:0;background:#ff2a1a;color:#fff;font-weight:900;font-size:12px;padding:3px 8px">\u25cf PROGRAM \u00b7 CAM ' + (J.pgm + 1) + '</div></div>'
        + '<div style="border:2px solid #201e1d;padding:6px 8px"><div style="font-size:11px;font-weight:900;color:#ec3013">RUNDOWN \u00b7 ' + Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length + '</div><div style="font-size:17px;font-weight:900;line-height:1.15;text-wrap:balance">' + (c ? c[0] + (c[2] ? ' \u00b7 CAM ' + (c[1] + 1) : '') : 'THAT\u2019S A WRAP') + '</div><div data-time style="height:8px;background:#201e1d;margin-top:6px;width:100%"></div></div></div>'
        + '<div style="flex:1 1 0;min-width:0;min-height:0;display:' + (wide ? 'flex;flex-direction:column' : 'grid;grid-template-columns:repeat(3,minmax(0,1fr))') + ';gap:8px">' + CAMV.map((cv, i) => '<button data-cam="' + i + '" style="' + (wide ? 'flex:1 1 0;min-height:56px;' : 'min-height:56px;') + 'display:flex;flex-direction:column;gap:0;padding:0;background:#fff;border:2px solid ' + (i === J.pgm ? '#ff2a1a' : '#201e1d') + ';border-radius:0;cursor:pointer;text-align:left;overflow:hidden;outline:0 solid transparent">' + (wide ? (th[i] ? '<div style="flex:1 1 0;min-height:0;width:100%;background:url(' + th[i] + ') center/cover"></div>' : '<div style="flex:1 1 0;min-height:0;width:100%;background:#0b1a2e"></div>') : pic(i, '')) + '<span style="display:block;background:#201e1d;color:#f3f2f2;font:900 12px Archivo,sans-serif;padding:5px 8px">CAM ' + (i + 1) + ' \u00b7 ' + cv.n + '</span></button>').join('') + '</div>';
      body.querySelectorAll('[data-cam]').forEach(b => { b.onclick = () => this.pick(+b.dataset.cam, b); }); J.idle = 0; J.hinted = false; },
    pick(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (i !== c[1]) { missOne('WRONG SHOT \u00b7 THE DIRECTOR SIGHS'); shake(el); return; } J.pgm = i; addGold(3); blip(); tone(1320, 0.04, 0.2, 'triangle', 0.06); drawMon(J.img || [], i); this.next(); },
    next() { J.ci++; J.cueT = CTTIME; J.wait = 0.5; if (J.ci >= J.list.length) { addGold(8); clap(); this.draw(); setTimeout(finishGame, 900); return; } this.draw(); },
    tick(dt) { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; const tb = PANEL.querySelector('[data-time]'); if (tb) { tb.style.width = (clamp(J.cueT / CTTIME, 0, 1) * 100).toFixed(1) + '%'; tb.style.background = J.cueT < 2.5 ? RED : INK; } if (J.cueT <= 0) { missOne('LATE CUT \u00b7 NEXT CUE'); this.next(); } }
      if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; const b = PANEL.querySelector('[data-cam="' + J.list[J.ci][1] + '"]'); if (b) { b.style.outline = '4px solid #ffd23a'; pulse(b); } }
      tally.forEach((m, i) => m.material.color.set(i === J.pgm ? '#ff2a1a' : '#4a1410')); kit.animFox(sterling, dt, 0, false); kit.animFox(wfox, dt, 0, false); } };
  // ---------- 5 LIVE ON THE SCENE (walk the town): reach the mark, then answer Weather Fox in your earpiece, live ----------
  const EVENTS = [
    { title: 'THE GIANT PUMPKIN', prop: 'pumpkin', intro: 'A giant pumpkin! Our camera is on the mark. Go, go!', q: [['Ask the grower: how heavy is it?', 'AS HEAVY AS THREE FOXES', 'IT FLOATS, LIKE A CLOUD'], ['What happens to it now?', 'PIE FOR THE WHOLE STREET', 'IT RUNS FOR MAYOR']] },
    { title: 'THE NEW BENCH', prop: 'bench', intro: 'A new bench opens today. Big crowd. Get to the mark!', q: [['How many foxes came?', 'A DOZEN, AND ONE DOG', 'EVERY FOX ON EARTH'], ['Is it comfy?', 'VERY. EVERYONE WANTS A TURN', 'NO. IT BITES']] },
    { title: 'THE FERRY PARADE', prop: 'flags', intro: 'A parade for the ferry! Find our camera on the street.', q: [['What is the parade for?', 'THE FERRY\u2019S 1000TH TRIP', 'NOBODY KNOWS. NOBODY EVER KNOWS'], ['Who leads it?', 'THE FERRY CAPTAIN', 'A VERY BRAVE SANDWICH']] }];
  const SIGNOFF = ['Lovely! Sign off for us.', 'BACK TO YOU IN THE STUDIO', 'I LIVE HERE NOW'];
  const freeAt = (x, z) => { if (L.outOfMap && L.outOfMap(x, z, 6)) return false; if (L.lakeF && L.lakeF(x, z) < 1.2) return false; if ((L.BUILDINGS || []).some(b => b.f && x > b.f[0] - 1 && x < b.f[1] + 1 && z > b.f[2] - 1 && z < b.f[3] + 1)) return false;
    return !cols.some(c => c.y0 == null && c.on !== false && (c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + 2.2 : c.f && c.f[1] - c.f[0] < 300 && x > c.f[0] - 2.2 && x < c.f[1] + 2.2 && z > c.f[2] - 2.2 && z < c.f[3] + 2.2)); };
  function sidewalkSpots(cx, cz, r0, r1) { const out = []; for (const R of L.ROADS || []) { const p = R.p || []; for (let k = 0; k < p.length - 1; k++) { const [ax, az] = p[k], [bx, bz] = p[k + 1], len = Math.hypot(bx - ax, bz - az); if (len < 12) continue; const nx = -(bz - az) / len, nz = (bx - ax) / len, off = (R.w || 8) / 2 + 2.2;
      for (let s = 6; s < len - 6; s += 8) { const x0 = ax + (bx - ax) * s / len, z0 = az + (bz - az) * s / len; for (const sg of [-1, 1]) { const x = x0 + nx * off * sg, z = z0 + nz * off * sg, d = Math.hypot(x - cx, z - cz); if (d < r0 || d > r1 || !freeAt(x, z)) continue; out.push([x, z, nx * sg, nz * sg, bx - ax, bz - az]); } } } } return out; }
  const doorOut = () => (D0 ? [...OUTW(0, 11), D0.ry] : LR.out ? [LR.out.x, LR.out.z, LR.out.yaw] : null);
  const propAt = (kind, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); const S = mk();
    if (kind === 'pumpkin') { S.sph(0.9, '#e07a1f', 0, 0.8, 0); S.sph(0.75, '#c96a18', 0.45, 0.7, 0.2); S.sph(0.75, '#c96a18', -0.45, 0.7, -0.2); S.cyl(0.08, 0.1, 0.4, '#4f7d3a', 0, 1.75, 0); S.box(1.6, 0.2, 1.6, '#7a5a3c', 0, 0.1, 0); }
    else if (kind === 'bench') { S.box(2.2, 0.1, 0.6, '#7a5a3c', 0, 0.5, 0); S.box(2.2, 0.5, 0.08, '#7a5a3c', 0, 0.85, -0.28); for (const s of [-1, 1]) S.box(0.08, 0.5, 0.6, INK, s * 1.0, 0.25, 0); S.box(2.6, 0.06, 0.06, RED, 0, 1.25, 0.32); }
    else { for (const s of [-1, 0, 1]) { S.box(0.06, 2.6, 0.06, INK, s * 1.1, 1.3, 0); S.box(0.7, 0.45, 0.02, s ? RED : YEL, s * 1.1 + 0.36, 2.3, 0); } }
    S.mesh(g); g.traverse(o => { o.userData.noCull = true; }); scene.add(g); return g; };
  const LIVETIME = 90;
  GD.live = { errand: true,
    shot() { if (!J.onAir) return null; const m = J.mark, c = J.cam; return [V(m.x, m.y + 1.5, m.z), 3.2, 2.2, 0.06, 3.4, Math.atan2(c.x - m.x, c.z - m.z), 6, true]; },
    begin() { const n = save.stat('mtvLiveN', 0); save.setStat('mtvLiveN', n + 1); J.E = EVENTS[n % EVENTS.length]; const o = doorOut(); if (!o) { stop(); return; }
      const all = sidewalkSpots(o[0], o[1], 30, 90); const sp = all.length ? all[Math.floor(Math.random() * all.length)] : null; const bx = sp ? sp[0] : OUTW(-6, 24)[0], bz = sp ? sp[1] : OUTW(-6, 24)[1];
      const ux = sp ? sp[2] : 0, uz = sp ? sp[3] : 1, tx = sp ? sp[4] : 1, tz = sp ? sp[5] : 0, tl = Math.hypot(tx, tz) || 1, y = terrainAt(bx, bz) || 0;
      J.mark = V(bx, y, bz); J.cam = V(bx - ux * 3.6, y, bz - uz * 3.6); const pc = V(bx + ux * 2.4 + tx / tl * 1.2, terrainAt(bx + ux * 2.4, bz + uz * 2.4) || y, bz + uz * 2.4 + tz / tl * 1.2);
      J.objs.push(propAt(J.E.prop, pc.x, pc.y, pc.z)); const c1 = { c: [pc.x, pc.z, 1.1] }; cols.push(c1); J.cols.push(c1);
      const op = kit.makeFox({ key: 'tvCamLive', name: 'Camera Operator', torso: ['#201e1d', '#ec3013', '#111111'], outfit: 'vest', mood: 'neutral' }); op.position.set(J.cam.x - ux * 0.7, y, J.cam.z - uz * 0.7); op.rotation.y = Math.atan2(ux, uz); op.userData.noCull = true; scene.add(op); J.objs.push(op); J.op = op;
      { const S = mk(); for (let k = 0; k < 3; k++) { const a = k * 2.094; S.box(0.05, 1.5, 0.05, DARK, Math.sin(a) * 0.3, 0.7, Math.cos(a) * 0.3, 0, Math.cos(a) * 0.22, -Math.sin(a) * 0.22); } S.box(0.5, 0.42, 0.8, BLACK, 0, 1.6, 0); S.cyl(0.14, 0.17, 0.4, INK, 0, 1.6, 0.55, 12, Math.PI / 2); const g = new THREE.Group(); g.position.copy(J.cam); g.rotation.y = Math.atan2(ux, uz); S.mesh(g); g.traverse(q => { q.userData.noCull = true; }); scene.add(g); J.objs.push(g); const c2 = { c: [J.cam.x, J.cam.z, 0.6] }; cols.push(c2); J.cols.push(c2); }
      J.crowd = [0, 1, 2].map(i => { const a = (i - 1) * 0.9, r = 2.6, x = pc.x + (Math.cos(a) * tx / tl - Math.sin(a) * ux) * r, z = pc.z + (Math.cos(a) * tz / tl - Math.sin(a) * uz) * r, f = kit.makeFox({ key: 'tvLiveCrowd' + i, torso: [['#2e4a6b', '#e7e4dc', '#16263c'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#7c4dc4', '#e7e4dc', '#3d2563']][i], outfit: ['coat', 'vest', 'robe'][i], mood: 'happy' });
        f.position.set(x, terrainAt(x, z) || y, z); f.rotation.y = Math.atan2(pc.x - x, pc.z - z); f.userData.noCull = true; f.userData.crowd = true; scene.add(f); J.objs.push(f); const cc2 = { c: [x, z, 0.45] }; cols.push(cc2); J.cols.push(cc2); return f; });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 1.0, 28), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.9, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(bx, y + 0.06, bz); ring.userData.noCull = true; scene.add(ring); J.objs.push(ring); J.ring = ring;
      J.m = marker(bx, y, bz); J.objs.push(J.m); J.t0 = performance.now(); J.onAir = false; fade(() => { go(o[0], 0.6, o[1], o[2]); }); },
    arrive() { J.onAir = true; J.time = (performance.now() - J.t0) / 1000; if (J.time < LIVETIME) addGold(10); busy = 'job'; J.m.visible = false; J.ring.visible = false; ARW.style.display = 'none';
      go(J.mark.x, J.mark.y + 0.05, J.mark.z, Math.atan2(J.cam.x - J.mark.x, J.cam.z - J.mark.z)); snapK = true; tone(1320, 0.05, 0.4); toast('\u25cf LIVE \u00b7 YOU ARE ON AIR', 2); J.qi = 0; setTimeout(() => this.ask(), 900); },
    ask() { if (!J || J.g !== 'live') return; const T = { key: 'tvEarpiece', name: 'Weather Fox', role: 'IN YOUR EARPIECE', obj: J.op, ry: J.op.rotation.y, r: 99 }, l = ln('Weather Fox', 'IN YOUR EARPIECE'), q = J.qi < J.E.q.length ? J.E.q[J.qi] : SIGNOFF;
      const opts = [{ text: q[1], pick: () => this.answer(true) }, { text: q[2], pick: () => this.answer(false) }]; if (J.qi < J.E.q.length && Math.random() < 0.5) opts.reverse(); J.talking = true; sayTo(T, [{ ...l(q[0]), choices: opts }]); },
    answer(good) { if (!J) return; J.talking = false; if (good) { addGold(5); tone(1040, 0.05, 0.2); J.crowd.forEach((f, i) => { f.userData.hop = 0.6 + i * 0.1; }); } else missOne('OOPS \u00b7 STICK TO THE FACTS', 2);
      J.qi++; if (J.qi > J.E.q.length) { clap(10); toast('THAT\u2019S A WRAP \u00b7 BACK TO THE STUDIO', 2); setTimeout(finishGame, 1300); } else setTimeout(() => this.ask(), 500); },
    tick(dt, t) { if (J.m.visible) J.m.userData.tag.position.y = 2.9 + Math.sin(t * 3) * 0.12; J.ring.scale.setScalar(1 + 0.08 * Math.sin(t * 4));
      if (lastP && Math.hypot(lastP.x - J.mark.x, lastP.z - J.mark.z) < 60) { kit.animFox(J.op, dt, 0, false); J.crowd.forEach(f => { kit.animFox(f, dt, 0, false); if (f.userData.hop > 0) { f.userData.hop -= dt; f.position.y = (terrainAt(f.position.x, f.position.z) || J.mark.y) + Math.abs(Math.sin(f.userData.hop * 12)) * 0.25; armUp(f, 1, 2.6); } }); }
      if (!J.onAir) { const d = lastP ? Math.hypot(lastP.x - J.mark.x, lastP.z - J.mark.z) : 99; arrowTo(V(J.mark.x, J.mark.y + 2.2, J.mark.z), 'LIVE MARK \u00b7 ' + Math.round(d) + ' M'); if (d < 1.4) this.arrive(); } },
    card() { const sec = Math.floor(J.time || (performance.now() - J.t0) / 1000); return { key: 'l' + J.onAir + '|' + sec + '|' + J.qi, right: Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'), stop: !J.onAir, next: J.onAir ? '\u25cf LIVE \u00b7 ANSWER ON AIR' : 'FOLLOW THE YELLOW MARKER',
      body: '<div style="font-size:13px;font-weight:900;margin-top:6px">' + J.E.title + '</div>' + steps([['GET TO THE MARK', J.onAir], ['ON AIR', J.qi > J.E.q.length]]) + tipH('WEATHER FOX', J.onAir ? 'Look at the lens. Facts, then smile.' : 'Under ' + LIVETIME + ' seconds and the bonus is yours.') }; } };
  // ================= PRIZES =================
  const SUIT = { outfit: 'suit', torso: ['#f3f2f2', '#2e4a6b', '#16263c'], name: 'NEWS SUIT' };
  const suitOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === SUIT.name); };
  const GIFT = { suit: ['Your own NEWS SUIT, with an earpiece. The Tailor keeps a copy.', 'st'], home: ['Turn on any apartment TV. Your reports run on Meru TV now.', 'wf'], mic: ['A Meru TV MICROPHONE. Use it from your bag. Foxes love a camera.', 'st'], face: ['Look outside. Your face is on our billboard. And the lobby screens.', 'wf'], all: ['Five for five. The GOLDEN MIC, and 60 gold. A star is born.', 'st'] };
  function giveGift() { save.setStat('mtvClears', save.stat('mtvClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('mtvSuit', false)) { save.setStat('mtvSuit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) save.setStat('tailorOutfits', [...list, SUIT]); save.setOutfit(SUIT); wear && wear(SUIT); return 'suit'; }
    if (nd >= 2 && !save.stat('mtvHome', false)) { save.setStat('mtvHome', true); drawHome(true); return 'home'; }
    if (nd >= 3 && !save.stat('mtvMic', false)) { save.setStat('mtvMic', true); save.give('tvMic'); return 'mic'; }
    if (nd >= 4 && !save.stat('mtvFace', false)) { save.setStat('mtvFace', true); return 'face'; }
    if (nd >= GAMES.length && !save.stat('mtvAll', false)) { save.setStat('mtvAll', true); save.give('goldenMic'); save.addGold(60); return 'all'; } return null; }
  // earpiece when the NEWS SUIT is worn
  let wornE = null; function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.head) return; const on = suitOn(); if (wornE && wornE.on === on && wornE.fox === fox && (!wornE.m || wornE.m.parent === P.head)) return; if (wornE && wornE.m && wornE.m.parent) wornE.m.parent.remove(wornE.m); wornE = { on, fox, m: null }; if (!on) return;
    const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), LM(INK)); g.add(b); const c = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 4, 10, Math.PI), LM('#cfd5da')); c.position.set(0, -0.06, -0.03); c.rotation.y = Math.PI / 2; g.add(c); g.position.set(-0.26, 0.02, 0.02); P.head.add(g); wornE.m = g; }
  // portrait for the billboard: a small camera in front of your face, in the studio
  function takeFace() { if (!renderer || !lastFox) return; try { const h = headW(lastFox), yaw = lastP ? lastP.yaw || 0 : 0, f = V(Math.sin(yaw), 0, Math.cos(yaw)), cm = new THREE.PerspectiveCamera(38, 1, 0.05, 30); cm.position.copy(h).addScaledVector(f, 2.6).add(V(0, 0.15, 0)); cm.lookAt(h.clone().add(V(0, -0.1, 0))); cm.updateMatrixWorld();
    const vis = lastFox.visible; lastFox.visible = true; renderer.render(scene, cm); lastFox.visible = vis; const src = renderer.domElement, s = Math.min(src.width, src.height), c = document.createElement('canvas'); c.width = c.height = 256; c.getContext('2d').drawImage(src, (src.width - s) / 2, (src.height - s) / 2, s, s, 0, 0, 256, 256);
    localStorage.setItem(FK, c.toDataURL('image/jpeg', 0.8)); faceImg = null; loadFace(); } catch (e) { console.warn('tv face', e); } }
  // MICROPHONE (item): say a line on camera; foxes near you turn and cheer
  const MICL = ['THIS IS ME, LIVE FOR MERU TV!', 'BREAKING NEWS: IT IS A LOVELY DAY.', 'BACK TO YOU IN THE STUDIO!', 'ANY COMMENT FOR MERU TV?'], CHEER = ['ON TV! HI, MUM!', 'IS THIS LIVE?', 'I WATCH YOU EVERY NIGHT!', 'MY GOOD SIDE IS THE LEFT.'];
  let micN = 0; const cheers = []; const bubT = CT(64, 96, (g, W, H) => { g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 6; g.fillRect(4, 4, W - 8, H - 8); g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = RED; g.font = '900 60px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('\u2605', 9, H / 2 + 3); });
  function useMic() { if (!lastP) return false; const P = lastP, v = V(), seen = new Set(), near = []; scene.traverse(o => { const u = o.userData; if (!u || !u.P || o === lastFox || seen.has(o) || o.visible === false) return; seen.add(o); o.getWorldPosition(v); if (Math.abs(v.y - (P.y || 0)) < 3 && Math.hypot(v.x - P.x, v.z - P.z) < 7) near.push(o); });
    near.slice(0, 5).forEach(o => { o.getWorldPosition(v); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubT, depthTest: false, transparent: true })); s.scale.set(0.42, 0.63, 1); s.position.copy(v).add(V(0, 2.6, 0)); s.renderOrder = 6; scene.add(s); cheers.push({ s, t: 1.8, y: s.position.y });
      if (o.parent) { const wp = o.parent.worldToLocal(V(P.x, v.y, P.z)); o.rotation.y = Math.atan2(wp.x - o.position.x, wp.z - o.position.z); } });
    tone(660, 0.05, 0.2, 'triangle'); tone(990, 0.04, 0.3, 'triangle', 0.12); if (near.length) clap(6); toast('\u201c' + MICL[micN++ % MICL.length] + '\u201d' + (near.length ? ' \u00b7 ' + CHEER[micN % CHEER.length] : ' \u00b7 NOBODY HERE TO HEAR IT'), 2.8); return true; }
  function useItem(id) { if (id === 'tvMic' && save.count('tvMic')) { if (busy === 'job') return false; return useMic(); } if (id === 'goldenMic' && save.count('goldenMic')) { toast('THE GOLDEN MIC \u00b7 FIVE FOR FIVE AT MERU TV', 2.4); return true; } return false; }
  // ================= run a job =================
  const INTRO = { weather: 'You present tonight. Read the autocue, point at the map. In time, please!', cue: 'Hold my cue cards. When I stop, show me the right word.', makeup: 'Powder off the shine, then aim my three lights. I glow, but not too much.', control: 'Run the control room. Cut to the right camera when the rundown says.' };
  const DONE = { weather: 'Perfect forecast. Nobody got wet who did not deserve it.', cue: 'Not one stumble. I looked brilliant. Thank you, I suppose.', makeup: 'Matte and lit. I could cry. I will not. Ruins the powder.', control: 'Clean cuts all show. The director even smiled. Once.', live: 'Live from the street, and nobody fell over. Lovely work!' };
  const nextOf = who => { const d = done(), list = GAMES.filter(q => !who || q.who === who), n = list.find(q => !d[q.k]); return (n || list.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; const [T, l] = giver(g), n = save.stat('mtvLiveN', 0); sayTo(T, [l(g === 'live' ? EVENTS[n % EVENTS.length].intro : INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('mtvVisits', save.stat('mtvVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], cols: [], t: 0 }; const D = GD[g]; busy = D.errand ? 'errand' : 'job'; ding(); feedKey = '';
    if (D.errand) { D.begin(); return; } fade(() => D.begin()); }
  function finishGame() { if (!J || (busy !== 'job' && busy !== 'errand')) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold, away = !!GD[g].errand;
    const d = { ...done() }; d[g] = true; save.setStat('mtvDone', d); save.setStat('mtvLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); STRIP.style.display = 'none'; hideCard(); ARW.style.display = 'none'; HINT.style.display = 'none'; feedKey = ''; drawHome();
    const [T, l] = giver(g); const say = () => { if (gift === 'face') takeFace(); const L1 = [l(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift) { const [txt, who] = GIFT[gift]; L1.push((who === 'wf' ? wfLn : stLn)(txt)); } K.finish(g, stars, gold, first); AUD.forEach((f, i) => { f.userData.hop = 1.2 + i * 0.1; }); clap(); sayTo(T, L1, () => { if (busy === 'end') { busy = null; J = null; } }); };
    fade(() => { cleanup(); goRoom(GN[g].who === 'wf' ? 6.4 : -2.2, GN[g].who === 'wf' ? -5.0 : -3.8, GN[g].who === 'wf' ? Math.PI * 0.85 : Math.PI * 0.9); snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 25000); }
  function cleanup() { if (J) { J.objs.forEach(o => o.parent && o.parent.remove(o)); J.objs = []; J.cols.forEach(c => { const i = cols.indexOf(c); if (i >= 0) cols.splice(i, 1); }); J.cols = []; } hidePanel(); STRIP.style.display = 'none'; hideCard(); ARW.style.display = 'none'; HINT.style.display = 'none';
    place(sterling, ST0[0], ST0[1], ST0[2]); place(wfox, WF0[0], WF0[1], WF0[2]); place(camOp, CO0[0], CO0[1], CO0[2]); KEYS.forEach(k => { k.lock = true; k.sx = ST0[0]; aimKey(k, k.sx); k.ring.visible = false; k.bm.material.color.set('#fff1c4'); }); tally.forEach(m => m.material.color.set('#4a1410')); drawWx(null, null); }
  function stop() { const away = J && GD[J.g].errand; cleanup(); busy = null; J = null; feedKey = ''; if (away) fade(() => goRoom(0, 7.2, Math.PI)); }
  function quit() { if (busy === 'intro') { busy = null; return; } if (!J || busy === 'end') return; stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  // ================= camera (job shots) =================
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !fading && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.08; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on || snapK) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(snapK ? camT.pos : cam.position); } snapK = false; const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    if (!v[7]) camCur.pos.set(clamp(camCur.pos.x, OX - 9.5, OX + 9.5), clamp(camCur.pos.y, LY + 0.6, LY + RH - 0.4), clamp(camCur.pos.z, LZ - 9.5, LZ + 9.5)); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ================= hint hand (3D jobs) =================
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT);
  const hintTick = t => { const g = jobOn() && GD[J.g].hint ? GD[J.g] : null, h = g ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; HINT.lastChild.textContent = h[1]; };
  // ================= talk + prompt =================
  const inRoom = P => !!P && Math.abs(P.x - OX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const inLobby = P => !!P && Math.abs(P.x - LOX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const nearL = (p, x, z, r) => Math.hypot(p.x - x, p.z - z) < r;
  const ringAt = p => GAMES.find(q => nearL(p, RINGS[q.k][0], RINGS[q.k][1], 1.05));
  const nearSt = p => nearL(p, -3.6, -4.6, 1.9) || nearL(p, sterling.position.x, sterling.position.z, 1.8), nearWf = p => nearL(p, wfox.position.x, wfox.position.z, 2.0);
  const atBill = P => { if (!D0) return false; const [x, z] = OUTW(-8.6, 6.0); return Math.hypot(P.x - x, P.z - z) < 2.4; };
  function prompt(P) { if (busy === 'errand' && J) return null;
    if (busy) return null; if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; return nearL(p, LDOOR[0], LDOOR[1], 1.6) ? 'STUDIO \u00b7 COME IN' : null; }
    if (atBill(P)) return 'BILLBOARD \u00b7 MERU TV';
    if (!inRoom(P)) return null; const p = toL(P); if (nearL(p, SDOOR[0], SDOOR[1], 1.5)) return 'LOBBY \u00b7 MERU TV'; const r = ringAt(p); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearSt(p)) return 'TALK \u00b7 STERLING GLOSS'; if (nearWf(p)) return 'TALK \u00b7 WEATHER FOX'; if (nearL(p, camOp.position.x, camOp.position.z, 1.8)) return 'TALK \u00b7 CAMERA OPERATOR';
    if (nearL(p, 5.0, -8.6, 2.2)) return 'WEATHER WALL \u00b7 TODAY'; return null; }
  let talkS = save.stat('mtvTalkedS', 0), talkW = save.stat('mtvTalkedW', 0), coN = 0;
  const ST_HI = ['You may know my face. Everyone knows my face.', 'Back again? Good. The camera likes you. Almost as much as me.', 'Live in four minutes. Always four minutes.'];
  function stMenu() { const first = !talkS; talkS++; save.setStat('mtvTalkedS', talkS); const mine = GAMES.filter(q => q.who === 'st');
    sayTo(T_ST, [{ ...stLn(first ? 'Sterling Gloss, Meru TV news. Want to work in television? I have three jobs.' : ST_HI[(talkS - 2) % ST_HI.length]), choices: [{ text: CHOICE_WORK, pick: () => startGame(nextOf('st')) },
      { text: 'PICK A JOB', pick: () => sayTo(T_ST, [{ ...stLn('Which one, darling?'), choices: [...mine.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'ANY NEWS?', pick: () => sayTo(T_ST, [stLn('Robots on a Spire street, bandits in two buildings. And my hair, which is perfect.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(T_ST, [stLn('Goodnight, Meru. That means you.')]) }] }]); }
  function wfMenu() { const first = !talkW; talkW++; save.setStat('mtvTalkedW', talkW); const fc = forecast(), mine = GAMES.filter(q => q.who === 'wf');
    sayTo(T_WF, [{ ...wfLn(first ? 'Weather Fox here! I need a presenter and a reporter. Fancy it?' : 'Hello again! ' + KNAME[fc.square].charAt(0) + KNAME[fc.square].slice(1).toLowerCase() + ' in Town Square today. Probably. Kidding!'), choices: [{ text: CHOICE_WORK, pick: () => startGame(nextOf('wf')) },
      { text: 'PICK A JOB', pick: () => sayTo(T_WF, [{ ...wfLn('Which one?'), choices: [...mine.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'WILL IT RAIN?', pick: () => { const wet = REG.filter(r => fc[r[0]] === 'RAIN').map(r => r[1]); sayTo(T_WF, [wfLn(wet.length ? 'Rain over ' + wet.join(' and ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) + ' today. Bring a coat.' : 'No rain anywhere today. ' + temp() + ' degrees. I love my job.')]); } },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(T_WF, [wfLn('Bye! Sunny smiles!')]) }] }]); }
  function talk(P) { lastP = P; if (busy === 'job') return true; if (busy === 'errand' && J) return !!J.talking; if (busy) return false;
    if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; if (nearL(p, LDOOR[0], LDOOR[1], 1.6)) { fade(() => { goRoom(0, 7.2, Math.PI); }); K.chime(); return true; } return false; }
    if (atBill(P)) { toast(facePic() ? 'THAT\u2019S YOU \u00b7 MERU TV\u2019S NEWEST FACE' : 'STERLING GLOSS \u00b7 NEWS AT SIX \u00b7 WORK AT MERU TV TO GET UP THERE', 2.6); return true; }
    if (!inRoom(P)) return false; const p = toL(P);
    if (nearL(p, SDOOR[0], SDOOR[1], 1.5)) { fade(() => { go(LOX + LDOOR[0], LY, LZ + LDOOR[1] + 1.2, 0); }); return true; }
    const r = ringAt(p); if (r) { startGame(r.k); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf(null)); return true; }
    if (nearSt(p)) { tone(1320, 0.05, 0.5); stMenu(); return true; } if (nearWf(p)) { tone(1480, 0.05, 0.5); wfMenu(); return true; }
    if (nearL(p, camOp.position.x, camOp.position.z, 1.8)) { const LN = (CLUSTER_LINES.tvCamera || {}).say || ['Smile. Camera two is always on.']; sayTo(T_CO, [ln('Camera Operator', 'MERU TV')(LN[coN++ % LN.length])]); return true; }
    if (nearL(p, 5.0, -8.6, 2.2)) { const fc = forecast(); toast('TODAY \u00b7 ' + REG.map(r => r[1] + ' ' + (night() && fc[r[0]] === 'SUN' ? 'CLEAR' : fc[r[0]])).join(' \u00b7 ') + ' \u00b7 ' + temp() + '\u00b0', 3.4); return true; }
    return false; }
  // ================= per frame =================
  let dayCheck = 0, airOn = null;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt; applyWear(fox);
    const inR = inRoom(P), inL = inLobby(P); G.visible = inR || busy === 'job'; LG.visible = inL; if (D0) OG.visible = Math.hypot(P.x - D0.x, P.z - D0.z) < (touch ? 110 : 180);
    if ((dayCheck -= dt) <= 0) { dayCheck = 2; if (!J) drawWx(null, null); drawBill(); drawHome(); if (inL) drawFeed(); }
    const air = (busy === 'job' || busy === 'errand') && !!J; if (air !== airOn) { airOn = air; airSigns.forEach(m => { m.material.map = air ? AIR_ON : AIR_OFF; m.material.needsUpdate = true; }); feedKey = ''; }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if ((busy === 'job' || busy === 'errand') && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('tv job: ' + (e && e.stack || e)); stop(); }
      if (J && D.card && (J.talking || (J.g === 'live' && J.onAir && J.talking))) hideCard(); else if (J && D.card && !D.panel) { const c = D.card(); setCard(J.g + c.key + J.miss + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), c.right || (J.gold ? J.gold + ' G' : 'MERU TV')) + foot(c.next, c.stop) + '<div style="padding:4px 10px 8px">' + c.body + '</div>'); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && GD[J.g].panel && !fading && J.ci < (J.list || []).length) GD[J.g].draw();
    hintTick(t);
    for (let i = cheers.length - 1; i >= 0; i--) { const c = cheers[i]; c.t -= dt; c.s.position.y = c.y + (1.8 - c.t) * 0.4; c.s.material.opacity = clamp(c.t, 0, 1); if (c.t <= 0) { scene.remove(c.s); cheers.splice(i, 1); } }
    if (G.visible) { const job = busy === 'job' && J;
      for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
      KEYS.forEach((k, i) => { aimKey(k, k.sx); const act = job && J.g === 'makeup' && J.ph === 1; const on = act && i === J.ki ? Math.abs(k.sx - ST0[0]) < 0.75 : false; k.ring.visible = act && i === J.ki; k.bm.material.color.set(!act ? '#fff1c4' : k.lock ? '#fff1c4' : i === J.ki ? (on ? '#7dff9a' : '#ff8a6a') : '#333333'); k.bm.material.opacity = act && !k.lock && i !== J.ki ? 0.04 : 0.16; });
      if (!(job && J.g === 'control')) tally.forEach((m, i) => m.material.color.set(air && i === 1 ? '#ff2a1a' : '#4a1410'));
      const h = hour(), crowdOn = h >= 10 && h < 21; AUD.forEach((f, i) => { f.visible = crowdOn; if (!crowdOn) return; kit.animFox(f, dt, 0, false); if (f.userData.hop > 0) { f.userData.hop -= dt; f.position.y = f.userData.y0 + Math.abs(Math.sin(f.userData.hop * 11 + i)) * 0.18; armUp(f, 0, -2.6); armUp(f, 1, 2.6); } else f.position.y = f.userData.y0; });
      if (!(job && (J.g === 'weather' || J.g === 'control'))) { kit.animFox(wfox, dt, 0, false); if (!busy) { const p = toL(P), dd = Math.hypot(p.x - wfox.position.x, p.z - wfox.position.z), want = dd < 4.5 ? Math.atan2(p.x - wfox.position.x, p.z - wfox.position.z) : WF0[2] + Math.sin(t * 0.5) * 0.2; let df = want - wfox.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); wfox.rotation.y += df * Math.min(1, dt * 3); } }
      if (!(job && J.g === 'cue')) { kit.animFox(camOp, dt, 0, false); if (!busy) { const p = toL(P), dd = Math.hypot(p.x - camOp.position.x, p.z - camOp.position.z), want = dd < 3.5 ? Math.atan2(p.x - camOp.position.x, p.z - camOp.position.z) : CO0[2]; let df = want - camOp.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); camOp.rotation.y += df * Math.min(1, dt * 3); } } }
    K.tick(dt, toL(P), { inShop: inR, busy: !!busy, near: inR ? 0 : 99, talking: busy === 'job', clear: endClear > 0 ? [0, -3.8, 2.6] : null }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? busy : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, room: SR, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading }),
    spawn: { tvstudio: [OX, LZ + 7.2, Math.PI, LY], tv: D0 ? [...OUTW(0, 11), D0.ry, 0] : null }, forecast, finish: () => finishGame(), takeFace, useMic, drawHome, sterling, wfox, camOp, feedTex: feedT, onAir: () => !!airOn,
    tap(x, y) { if (jobOn()) GD[J.g].tap(x, y); }, scr: v => scrW(v), hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), regW, keys: KEYS,
    _billView() { if (!D0) return null; const [x, z] = OUTW(-8.6, 14), [lx, lz] = OUTW(-8.6, 4); const c = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 400); c.position.set(x, 4, z); c.lookAt(lx, 4, lz); c.updateMatrixWorld(); OG.visible = true; renderer.render(scene, c); return renderer.domElement.toDataURL('image/jpeg', 0.8); },
    _view(p, l, fov = 60) { const c = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 400); c.position.copy(toW(...p)); c.lookAt(toW(...l)); c.updateMatrixWorld(); const v = G.visible; G.visible = true; renderer.render(scene, c); G.visible = v; return renderer.domElement.toDataURL('image/jpeg', 0.8); },
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    dispose() { card.remove(); HINT.remove(); PANEL.remove(); STRIP.remove(); ARW.remove(); K.dispose(); } };
  window.__tv = API; return API;
}
