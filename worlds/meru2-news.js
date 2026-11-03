// MERU 2.0 — s108 MERU DAILY NEWSROOM [meruNewspaper] (Ben s108 picks: Meru Daily first · the ACE REPORTER gives the jobs · 5 jobs · GENTLE ·
// prizes: PRESS VEST + hat (1st clear), DAILY PAPER (2 jobs: a free paper a day at the stand, headline + tip), PRESS CAMERA (3 jobs), GOLDEN PRESS (all 5) + 60 gold ·
// look: the press runs, paper stacks, NEWSSTAND outside with today's headline, headlines change with what you have done).
// The NEWSROOM = an extra room in the cluster lobby row (clusters.addRoom), entered through a door in the Meru Daily lobby's back wall (quick fade).
// JOBS (each its own yellow ring + stars on Ace's board): CHASE A SCOOP (walk the Deco streets, interview 3 marked foxes) · LAYOUT DESK (tap or drag
// pieces into the page grid, 2 pages) · RUN THE PRESS (hold to run, keep the speed in the yellow, tap the ink can when it runs low) · PAPER ROUND (4 Deco
// doors, throw from under 8 m) · CROSSWORD (pick the right word for each clue). Shared NEWS KIT pieces (card, panel, markers, camera) live in this file for TV / Radio / Tabloid.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { CLUSTER_LINES } from './meru2-cluster-lines.js';
import { storyHeadlines } from './meru2-tips.js';
export function buildNewsroom({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, clusters, renderer, terrainAt = () => 0, go }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'newspaper'); if (!LR || !clusters.addRoom) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, LOX = LR.ox, RH = 5.2;
  const NR = clusters.addRoom({ key: 'newsroom', room: 'meruNewspaper', title: 'MERU DAILY \u00b7 NEWSROOM' }, RH); NR.out = LR.out; const OX = NR.ox;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
  const INK = '#201e1d', RED = '#ec3013', DEEP = '#7a1d2a', YEL = '#ffd23a', PAPER = '#f3f2f2', NEWS = '#ebe5d6', GREEN = '#2f4a3e', BRASS = '#c9a24a', WOOD = '#7a5a3c', DWOOD = '#5a3f28', DARK = '#3d3b3a', STEEL = '#9aa0a6';
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
  const G = new THREE.Group(); G.name = 'meruNewsroom'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const toW = (x, y, z) => V(OX + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ });
  const glowT = CT(32, 32, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, W, W); });
  const today = () => save.stat('meru2Day', 1);
  // ================= HEADLINES (change with what you have done) =================
  const done = () => save.stat('nwDone', null) || {};
  function headline(d = today()) { const fs = save.stat('fsDone', null) || {}, P = [];
    if (save.stat('nwHeadline', '')) P.push(save.stat('nwHeadline', '')); if (save.stat('fsAll', false)) P.push('GOLDEN HELMET FOR THE NEWEST FIREFIGHTER'); else if (fs.fire) P.push('MARKET FIRE OUT IN MINUTES, NOBODY HURT');
    if (fs.cat) P.push('CAT SAVED FROM TREE. CAT UNIMPRESSED'); if (fs.ladder) P.push('LAKE ROW RESCUE: FOX SWEARS OFF TOAST'); if (Object.keys(done()).length) P.push('NEW FACE AT THE MERU DAILY');
    const GEN = ['BANDITS HOLD TWO BUILDINGS. WHO SENT THEM?', 'ROBOTS GONE WILD ON FACTORY STREET', 'SALT AND PEPPER FEUD HEATS UP', 'EIGHT GATES, ONE TOWN: A GUIDE', 'FERRY RUNS ON TIME, TOWN SHOCKED'];
    const ST = storyHeadlines(save, 'paper'); if (ST.length && d % 2 === 0) return ST[Math.floor(d / 2) % ST.length];   // s137: the Salt / Pepper tip-offs + the VAX thread print every other day
    return P.length && d % 3 !== 2 ? P[d % P.length] : GEN[d % GEN.length]; }
  function tipOfDay(d = today()) { const fs = save.stat('fsDone', null) || {}, nd = Object.keys(done()).length, T = [];
    if (!fs.fire) T.push('FIRE STATION BY THE LAKE NEEDS VOLUNTEERS. ASK CHIEF EMBER.'); if (nd < 5) T.push('THE MERU DAILY IS HIRING. ASK THE ACE REPORTER IN THE NEWSROOM.');
    T.push('THE MUSEUM BUYS RELICS. SO DO THE RELIC STORES, AT TODAY\u2019S PRICE.', 'A TRAIN TICKET COSTS LESS THAN A FARE-DODGING FINE.', 'BANDITS IN THE PEPPER AND SALT BUILDINGS. BRING A SWORD.', 'EVERY SHOP HAS A NOW HIRING SIGN. WALK UP AND PRESS TALK.');
    return T.length > 2 && d % 2 ? T[0] : T[d % T.length]; }
  // ================= NEWSROOM SHELL =================
  const R0 = mk(), { box, cyl, sph } = R0;
  box(20, 0.1, 20, '#6e5034', 0, -0.05, 0); for (let x = -9.6; x < 9.7; x += 0.8) box(0.03, 0.012, 20, DWOOD, x, 0.006, 0);
  box(2.2, 0.02, 14.4, DEEP, 0, 0.012, 1.6); box(1.8, 0.024, 14.0, '#9a2a35', 0, 0.014, 1.6);
  box(20, 0.2, 20, '#d9d4cc', 0, RH + 0.1, 0);
  const WALL = '#ece4d2';
  box(20, RH, 0.3, WALL, 0, RH / 2, -10); for (const s of [-1, 1]) { box(0.3, RH, 20, WALL, s * 10, RH / 2, 0); box(8.4, RH, 0.3, WALL, s * 5.8, RH / 2, 10); }
  box(3.2, RH - 3.2, 0.3, WALL, 0, 3.2 + (RH - 3.2) / 2, 10); box(3.2, 3.2, 0.05, '#2a2622', 0, 1.6, 10.12);
  box(19.4, 1.1, 0.06, GREEN, 0, 0.55, -9.82); for (const s of [-1, 1]) { box(0.06, 1.1, 19.4, GREEN, s * 9.82, 0.55, 0); box(8.2, 1.1, 0.06, GREEN, s * 5.8, 0.55, 9.82); }
  box(19.4, 0.06, 0.1, BRASS, 0, 1.13, -9.8); for (const s of [-1, 1]) { box(0.1, 0.06, 19.4, BRASS, s * 9.8, 1.13, 0); box(8.2, 0.06, 0.1, BRASS, s * 5.8, 1.13, 9.8); }
  for (const s of [-1, 1]) box(0.14, 3.3, 0.16, BRASS, s * 1.66, 1.65, 9.8); box(3.46, 0.14, 0.16, BRASS, 0, 3.27, 9.8);
  rectL(-10, 10, -10.2, -9.8); rectL(9.8, 10.2, -10, 10); rectL(-10.2, -9.8, -10, 10); rectL(-10, -1.6, 9.8, 10.2); rectL(1.6, 10, 9.8, 10.2);
  // ACE's desk (front of the walkway) + typewriter, TIP LINE phone, papers, chair
  box(3.8, 0.08, 1.1, WOOD, 0, 0.98, -5.2); for (const s of [-1, 1]) box(0.9, 0.94, 1.0, DWOOD, s * 1.35, 0.47, -5.2); box(3.8, 0.6, 0.05, DWOOD, 0, 0.65, -4.68);
  box(0.55, 0.18, 0.42, INK, -0.6, 1.11, -5.3); box(0.42, 0.34, 0.02, PAPER, -0.6, 1.36, -5.45, 0, -0.25); box(0.5, 0.05, 0.12, '#55524f', -0.6, 1.22, -5.12);
  for (let k = 0; k < 5; k++) box(0.45, 0.03, 0.32, k % 2 ? NEWS : PAPER, 1.1, 1.04 + k * 0.03, -5.2, k * 0.12); box(0.24, 0.1, 0.18, RED, 0.45, 1.07, -5.4);
  box(0.6, 0.06, 0.6, DWOOD, 0, 0.62, -6.6); box(0.6, 0.7, 0.06, DWOOD, 0, 1.0, -6.95); box(0.12, 0.59, 0.12, INK, 0, 0.3, -6.6);   /* s181 FOX SCALE seat 0.65 + a post */ rectL(-1.95, 1.95, -5.8, -4.6);
  // TIP LINE stand (scoop) + town map on the north wall
  box(0.7, 1.05, 0.6, DWOOD, -3.2, 0.52, -6.8); box(0.36, 0.12, 0.26, RED, -3.2, 1.12, -6.8); box(0.42, 0.06, 0.08, INK, -3.2, 1.21, -6.8); circL(-3.2, -6.8, 0.5);
  // the PRESS (west): base, frames, beams; rollers / web / feed roll / stack are their own meshes below
  box(2.8, 0.5, 10.4, DARK, -6.6, 0.25, -1.6); for (const sx of [-7.9, -5.3]) { box(0.18, 0.45, 10, GREEN, sx, 0.72, -1.6); box(0.18, 0.14, 10, GREEN, sx, 2.48, -1.6); for (const z of [-6.4, -3.2, 0.0, 3.2]) box(0.22, 2.3, 0.22, GREEN, sx, 1.4, z); for (const [z, y] of [[-5, 1.15], [-3.2, 1.75], [-1.4, 1.15], [0.4, 1.75], [2.2, 1.15]]) cyl(0.12, 0.12, 0.12, BRASS, sx, y, z, 10, 0, Math.PI / 2); } for (const z of [-6.2, -3.0, 0.2, 3.2]) box(2.8, 0.16, 0.2, GREEN, -6.6, 2.62, z);
  for (const sx of [-7.9, -5.3]) for (const z of [3.9, 5.3]) box(0.14, 1.4, 0.14, DARK, sx, 0.7, z); box(2.4, 0.9, 1.6, '#5a5f63', -6.6, 0.45, -8.3); box(0.6, 0.06, 0.6, DARK, -4.85, 1.0, 0.4); box(0.06, 0.4, 0.5, DARK, -5.15, 0.82, 0.4);
  box(0.08, 1.4, 0.08, DARK, -5.3, 3.3, -6.6); rectL(-8.1, -5.1, -7.0, 5.6); rectL(-8.0, -5.2, -9.2, -7.4);
  for (let k = 0; k < 6; k++) { box(0.9, 0.36, 0.6, k % 2 ? NEWS : PAPER, -3.4 + (k % 2) * 0.05, 0.18 + Math.floor(k / 2) * 0.36, -8.9 + (k % 3) * 0.02); } box(0.95, 0.02, 0.04, '#b08a5e', -3.4, 1.09, -8.9); rectL(-3.9, -2.9, -9.3, -8.5);
  // LAYOUT light table (east)
  for (const [x, z] of [[5.15, 1.25], [7.65, 1.25], [5.15, 2.75], [7.65, 2.75]]) box(0.08, 0.95, 0.08, STEEL, x, 0.47, z); box(2.8, 0.08, 1.8, '#c9ced3', 6.4, 0.98, 2.0); rectL(4.9, 7.9, 1.0, 3.0);
  box(0.05, 1.4, 0.05, STEEL, 7.7, 1.7, 2.9); box(0.9, 0.05, 0.05, STEEL, 7.3, 2.4, 2.9);
  // CROSSWORD desk + green banker's lamp + chair
  box(2.2, 0.08, 1.1, WOOD, 7.0, 0.98, -5.4); for (const [x, z] of [[6.0, -5.85], [8.0, -5.85], [6.0, -4.95], [8.0, -4.95]]) box(0.08, 0.94, 0.08, DWOOD, x, 0.47, z); cyl(0.12, 0.14, 0.05, BRASS, 7.7, 1.04, -5.6, 10); box(0.03, 0.3, 0.03, BRASS, 7.7, 1.18, -5.6); box(0.42, 0.12, 0.16, '#2f6b46', 7.7, 1.36, -5.6);   /* s181 desk top 1.02 (was 0.9) */
  box(0.6, 0.06, 0.6, DWOOD, 7.0, 0.62, -6.4); box(0.6, 0.6, 0.06, DWOOD, 7.0, 0.95, -6.73); box(0.12, 0.59, 0.12, INK, 7.0, 0.3, -6.4); rectL(5.9, 8.1, -6.6, -4.8);
  // reporter desk + typewriter, filing cabinets, water cooler, coat rack, paper bundles + bag (paper round)
  box(2.0, 0.08, 1.0, WOOD, 7.0, 0.86, -1.6); for (const [x, z] of [[6.1, -2.0], [7.9, -2.0], [6.1, -1.2], [7.9, -1.2]]) box(0.08, 0.82, 0.08, DWOOD, x, 0.41, z); box(0.5, 0.17, 0.4, INK, 6.6, 0.98, -1.6); box(0.4, 0.3, 0.02, PAPER, 6.6, 1.2, -1.75, 0, -0.25); for (let k = 0; k < 4; k++) box(0.4, 0.03, 0.3, PAPER, 7.5, 0.92 + k * 0.03, -1.5, k * 0.2); rectL(6.0, 8.0, -2.1, -1.1);
  for (let k = 0; k < 3; k++) { box(0.9, 1.3, 0.6, '#6b737b', 5.9 + k * 1.0, 0.65, 9.45); for (let r = 0; r < 3; r++) box(0.3, 0.04, 0.02, INK, 5.9 + k * 1.0, 0.35 + r * 0.42, 9.14); } rectL(5.4, 8.9, 9.1, 9.8);
  cyl(0.24, 0.24, 1.0, STEEL, 8.9, 0.5, 7.4, 12); cyl(0.2, 0.18, 0.5, '#9fd0f0', 8.9, 1.25, 7.4, 12); circL(8.9, 7.4, 0.35);
  box(0.06, 1.8, 0.06, DWOOD, -8.8, 0.9, 8.6); for (const a of [0, 2.1, 4.2]) box(0.4, 0.04, 0.04, DWOOD, -8.8 + Math.cos(a) * 0.15, 1.75, 8.6 + Math.sin(a) * 0.15, a); box(0.3, 0.6, 0.2, '#6b4a32', -8.6, 1.4, 8.6); circL(-8.8, 8.6, 0.35);
  for (let k = 0; k < 3; k++) { box(0.7, 0.32, 0.5, k % 2 ? NEWS : PAPER, 4.7, 0.16 + k * 0.32, 8.7); box(0.72, 0.02, 0.04, '#b08a5e', 4.7, 0.3 + k * 0.32, 8.7); } box(0.6, 0.5, 0.2, '#b59a6a', 5.5, 1.5, 9.62); box(0.04, 0.5, 0.04, '#8a6a3a', 5.5, 1.9, 9.6); rectL(4.3, 5.1, 8.4, 9.0);
  // pendants (cord + green shade)
  const PEND = [[0, -4], [-6.6, -1.5], [6.4, 2], [6.8, -4], [2.4, 6.4]]; for (const [x, z] of PEND) { box(0.03, 1.1, 0.03, INK, x, RH - 0.55, z); cyl(0.12, 0.5, 0.34, GREEN, x, RH - 1.2, z, 12); }
  R0.mesh(G);
  // north wall: NEWSROOM sign · town map (scoop) · door plate inside; lamp bulbs (glow under the shades)
  planeT(plate('MERU DAILY \u00b7 NEWSROOM', 768, 112, INK, PAPER, RED), 6, 0.88, 0, 4.2, -9.83, 0, G);
  const mapT = CT(512, 340, (g, W, H) => { g.fillStyle = '#e8e2d2'; g.fillRect(0, 0, W, H); g.strokeStyle = '#bdb5a2'; g.lineWidth = 10; for (const y of [90, 210]) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 20); g.stroke(); } for (const x of [140, 330]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x - 30, H); g.stroke(); }
    g.fillStyle = '#9ec5e0'; g.beginPath(); g.ellipse(420, 300, 140, 70, 0, 0, 7); g.fill(); g.fillStyle = INK; g.fillRect(0, 0, W, 50); g.fillStyle = YEL; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('TIP LINE \u00b7 STORY MAP', 18, 26);
    g.strokeStyle = RED; g.lineWidth = 3; g.beginPath(); g.moveTo(90, 140); g.lineTo(260, 110); g.lineTo(380, 250); g.lineTo(200, 280); g.stroke(); for (const [x, y] of [[90, 140], [260, 110], [380, 250], [200, 280]]) { g.fillStyle = RED; g.beginPath(); g.arc(x, y, 11, 0, 7); g.fill(); g.fillStyle = PAPER; g.fillRect(x + 14, y - 12, 60, 24); } });
  planeT(mapT, 2.4, 1.6, -3.4, 2.5, -9.83, 0, G);
  planeT(plate('LOBBY \u00b7 MERU DAILY', 512, 96, INK, PAPER, RED), 2.4, 0.45, 0, 3.6, 9.83, Math.PI, G);
  const bulbs = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(PEND.flatMap(([x, z]) => [x, RH - 1.42, z]), 3)), new THREE.PointsMaterial({ size: 1.2, color: '#ffd38a', map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); bulbs.frustumCulled = false; G.add(bulbs);
  // ================= THE PRESS (moving parts) =================
  const stripeT = CT(64, 64, (g, W, H) => { g.fillStyle = '#8e959c'; g.fillRect(0, 0, W, H); g.fillStyle = INK; g.fillRect(0, 0, W, 10); g.fillStyle = '#b8bec4'; g.fillRect(0, 30, W, 4); });
  const rollM = new THREE.MeshLambertMaterial({ map: stripeT }), inkRollM = new THREE.MeshLambertMaterial({ color: '#2b2b2b' });
  const rollers = [[-5, 1.15], [-3.2, 1.75], [-1.4, 1.15], [0.4, 1.75], [2.2, 1.15]].map(([z, y], i) => { const g = new THREE.Group(); g.position.set(-6.6, y, z); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 2.42, 16), i % 2 ? inkRollM : rollM); m.rotation.z = Math.PI / 2; g.add(m); const s = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.07, 0.08), LM(i % 2 ? '#55524f' : INK)); s.position.y = 0.3; g.add(s); G.add(g); return g; });
  const webT = CT(128, 256, (g, W, H) => { g.fillStyle = NEWS; g.fillRect(0, 0, W, H); g.fillStyle = INK; for (let y = 0; y < H; y += 64) { g.fillRect(10, y + 6, W - 20, 10); for (let r = 0; r < 4; r++) { g.fillStyle = '#6b6560'; g.fillRect(10, y + 24 + r * 8, (W - 30) / 2, 4); g.fillRect(W / 2 + 4, y + 24 + r * 8, (W - 30) / 2, 4); } g.fillStyle = INK; } });
  webT.wrapS = webT.wrapT = THREE.RepeatWrapping; webT.repeat.set(1, 4);
  const web = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 9.6), new THREE.MeshLambertMaterial({ map: webT, side: THREE.DoubleSide })); web.rotation.x = -Math.PI / 2; web.position.set(-6.6, 2.1, -1.5); G.add(web);
  const feed = new THREE.Group(); feed.position.set(-6.6, 1.05, 4.6); G.add(feed); { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.2, 20), LM('#f1ede4')); m.rotation.z = Math.PI / 2; feed.add(m); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.3, 10), LM(DARK)); c.rotation.z = Math.PI / 2; feed.add(c); const l = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.05, 0.05), LM('#d8d0bf')); l.position.y = 0.75; feed.add(l); }
  { const s = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.25), new THREE.MeshLambertMaterial({ color: NEWS, side: THREE.DoubleSide })); s.position.set(-6.6, 1.95, 3.9); s.rotation.x = -Math.PI / 2 + 0.25; G.add(s); }
  const stack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1, 0.95), LM(PAPER)); stack.position.set(-6.6, 0.9, -8.3); G.add(stack); const setStack = h => { stack.scale.y = Math.max(0.02, h); stack.position.y = 0.9 + stack.scale.y / 2; }; setStack(0.25);
  const inkCan = new THREE.Group(); inkCan.position.set(-4.85, 1.03, 0.4); G.add(inkCan); { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.34, 14), LM(INK)); b.position.y = 0.17; inkCan.add(b); }
  const inkLid = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.05, 14), BM(YEL)); inkLid.position.y = 0.36; inkCan.add(inkLid);
  const inkGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: YEL, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); inkGlow.scale.setScalar(1.2); inkGlow.position.y = 0.3; inkGlow.visible = false; inkCan.add(inkGlow);
  const jamLamp = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), BM('#5a1a12')); jamLamp.position.set(-5.3, 4.05, -6.6); G.add(jamLamp);
  planeT(plate('MERU DAILY \u00b7 PRESS No. 1', 512, 80, BRASS, INK), 2.6, 0.4, -5.2, 1.5, -1.6, Math.PI / 2, G);
  const pageT = CT(256, 160, (g, W, H) => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, W, H); g.fillStyle = INK; g.fillRect(10, 8, W - 20, 18); g.fillStyle = '#9a948a'; g.fillRect(10, 34, 150, 80); for (let r = 0; r < 10; r++) g.fillRect(170, 34 + r * 9, 76, 4); g.fillStyle = RED; g.fillRect(10, 122, 70, 30); });
  planeT(pageT, 2.5, 1.56, 6.4, 1.03, 2.0, 0, G, false, -Math.PI / 2);
  const cwT = CT(128, 128, (g, W) => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, W, W); g.strokeStyle = INK; g.lineWidth = 3; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { g.fillStyle = (i * 3 + j * 7) % 5 === 0 ? INK : '#fffaf0'; g.fillRect(14 + i * 20, 14 + j * 20, 20, 20); g.strokeRect(14 + i * 20, 14 + j * 20, 20, 20); } });
  planeT(cwT, 0.6, 0.6, 6.8, 0.91, -5.3, 0.2, G, false, -Math.PI / 2);
  // ================= CORKBOARD (your PRESS CAMERA photos) =================
  const PK = 'meru2.newsPhotos', photos = () => { try { return JSON.parse(localStorage.getItem(PK) || '[]'); } catch (e) { return []; } };
  const corkT = CT(512, 352, () => {}), imgs = {};
  function drawCork() { const g = corkT.userData.c.getContext('2d'), W = 512, H = 352; g.fillStyle = '#b8875a'; g.fillRect(0, 0, W, H); for (let i = 0; i < 260; i++) { g.fillStyle = i % 2 ? '#a5764c' : '#c9996a'; g.fillRect((i * 97) % W, (i * 53) % H, 4, 3); } g.strokeStyle = DWOOD; g.lineWidth = 14; g.strokeRect(0, 0, W, H);
    g.fillStyle = INK; g.fillRect(14, 14, 250, 34); g.fillStyle = YEL; g.font = '900 22px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('YOUR PHOTOS', 26, 32);
    const L2 = photos().slice(-6); for (let i = 0; i < 6; i++) { const x = 22 + (i % 3) * 162, y = 62 + Math.floor(i / 3) * 140, u = L2[i]; g.save(); g.translate(x + 74, y + 62); g.rotate(((i * 37) % 7 - 3) * 0.015); g.fillStyle = u ? '#ffffff' : 'rgba(255,255,255,0.35)'; g.fillRect(-74, -60, 148, 124);
      if (u && imgs[u] && imgs[u].complete) { g.filter = 'grayscale(1)'; g.drawImage(imgs[u], -66, -52, 132, 88); g.filter = 'none'; } else if (u) { if (!imgs[u]) { imgs[u] = new Image(); imgs[u].onload = drawCork; imgs[u].src = u; } } else { g.fillStyle = '#8a6a4a'; g.font = '800 14px Archivo, sans-serif'; g.fillText('NO PHOTO YET', -48, -6); }
      g.fillStyle = RED; g.beginPath(); g.arc(0, -56, 7, 0, 7); g.fill(); g.restore(); } corkT.needsUpdate = true; }
  drawCork(); planeT(corkT, 2.6, 1.79, 9.83, 2.5, -1.6, -Math.PI / 2, G);
  // ================= LOBBY DOOR (back wall of the Meru Daily lobby) =================
  const LG = new THREE.Group(); LG.position.set(LOX, LY, LZ); scene.add(LG); LG.visible = false;
  { const D = mk(); D.box(1.9, 2.9, 0.06, '#2a2622', 5.6, 1.45, -9.82); for (const s of [-1, 1]) D.box(0.12, 3.0, 0.12, BRASS, 5.6 + s * 1.0, 1.5, -9.8); D.box(2.12, 0.12, 0.12, BRASS, 5.6, 3.0, -9.8); D.box(1.6, 0.02, 1.0, DEEP, 5.6, 0.012, -9.1); D.mesh(LG);
    planeT(plate('NEWSROOM \u00b7 COME IN', 512, 96, INK, PAPER, RED), 2.0, 0.38, 5.6, 3.35, -9.83, 0, LG); }
  const LDOOR = [5.6, -8.6], NDOOR = [0, 8.8];
  // ================= FOXES =================
  const DECO = ['#e2d2b4', '#ec3013', '#7a1d2a'];
  const pressHat = () => { const g = new THREE.Group(); const br = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.33, 0.025, 18), LM('#5a4632')); g.add(br); const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.17, 16), LM('#5a4632')); cr.position.y = 0.09; g.add(cr);
    const bd = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.04, 16), LM(INK)); bd.position.y = 0.035; g.add(bd); const cd = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.07), new THREE.MeshBasicMaterial({ map: pressCardT })); cd.position.set(0.07, 0.07, 0.2); cd.rotation.y = 0.35; g.add(cd); return g; };
  const pressCardT = CT(96, 56, (g, W, H) => { g.fillStyle = PAPER; g.fillRect(0, 0, W, H); g.fillStyle = INK; g.font = '900 26px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('PRESS', 8, H / 2 + 1); });
  const hatOn = f => { const P = f.userData && f.userData.P; if (!P || !P.head) return; const h = pressHat(); h.position.y = 0.26; P.head.add(h); };
  const ACE0 = [0, -6.5, 0], ace = kit.makeFox({ key: 'paperReporter', name: 'Ace Reporter', torso: DECO, outfit: 'coat', mood: 'warm' }); ace.position.set(ACE0[0], 0, ACE0[1]); ace.rotation.y = ACE0[2]; ace.userData.noCull = true; ace.userData.rosterShop = 'Meru Daily'; G.add(ace); hatOn(ace); circL(0, -6.5, 0.45);
  const OP0 = [-4.0, 2.8, -Math.PI / 2], oper = kit.makeFox({ key: 'paperPress', name: 'Press Operator', torso: ['#9aa0a6', '#3d3b3a', '#201e1d'], outfit: 'vest', mood: 'neutral' }); oper.position.set(OP0[0], 0, OP0[1]); oper.rotation.y = OP0[2]; oper.userData.noCull = true; oper.userData.rosterShop = 'Meru Daily'; G.add(oper); circL(OP0[0], OP0[1], 0.45);
  // ================= OUTSIDE: NEWSSTAND by the tower door (seller + headline A-frame) =================
  const CBn = (L.CLUSTER_BUILDINGS || []).find(c => c.key === 'newspaper'), D0 = CBn && CBn.D;
  const OG = new THREE.Group(); OG.name = 'meruNewsstand'; scene.add(OG); let seller = null, headT = null, standLamp = null; const OUTW = (lx, lz) => { const c = Math.cos(D0.ry), s = Math.sin(D0.ry); return [D0.x + lx * c + lz * s, D0.z - lx * s + lz * c]; };
  if (D0) { OG.position.set(D0.x, 0, D0.z); OG.rotation.y = D0.ry; const S = mk(), cx = 7.4, cz = 3.4;
    S.box(2.6, 2.5, 0.12, DEEP, cx, 1.25, cz - 1.0); for (const s of [-1, 1]) S.box(0.12, 2.5, 2.0, DEEP, cx + s * 1.3, 1.25, cz); S.box(3.0, 0.14, 2.4, INK, cx, 2.57, cz + 0.1); S.box(3.0, 0.42, 0.06, RED, cx, 2.3, cz + 1.3);
    S.box(2.6, 1.0, 0.5, DEEP, cx, 0.5, cz + 0.85); S.box(2.7, 0.06, 0.6, INK, cx, 1.03, cz + 0.85); for (let k = 0; k < 4; k++) S.box(0.5, 0.06 + (k % 2) * 0.04, 0.36, k % 2 ? NEWS : PAPER, cx - 0.9 + k * 0.6, 1.09, cz + 0.85);
    for (const s of [-1, 1]) { S.box(0.7, 1.1, 0.4, INK, cx + s * 1.75, 0.55, cz + 0.6); for (let r = 0; r < 3; r++) S.box(0.6, 0.02, 0.34, r % 2 ? NEWS : PAPER, cx + s * 1.75, 0.5 + r * 0.25, cz + 0.62, 0, -0.5); }
    for (const s of [-1, 1]) for (const z of [-0.36, 0.36]) S.box(0.06, 1.5, 0.06, INK, 4.6 + s * 0.62, 0.72, 5.4 + z, 0, z > 0 ? -0.24 : 0.24);
    S.mesh(OG); planeT(plate('MERU DAILY \u00b7 ONE COIN', 512, 72, RED, PAPER), 2.9, 0.4, cx, 2.3, cz + 1.34, 0, OG);
    headT = CT(512, 400, () => {}); for (const s of [1, -1]) { const m = planeT(headT, 1.2, 0.94, 4.6, 0.95, 5.4 + s * 0.2, s > 0 ? 0 : Math.PI, OG, false, -s * 0.24); m.renderOrder = 1; }
    standLamp = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 0.12), BM('#6b5a3a')); standLamp.position.set(cx, 2.48, cz + 1.2); OG.add(standLamp);
    const wb = (x0, x1, z0, z1) => { const a = OUTW(x0, z0), b = OUTW(x1, z1); cols.push({ f: [Math.min(a[0], b[0]), Math.max(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[1], b[1])] }); };
    wb(cx - 1.4, cx + 1.4, cz - 1.1, cz + 1.15); wb(cx - 2.1, cx - 1.4, cz + 0.3, cz + 0.9); wb(cx + 1.4, cx + 2.1, cz + 0.3, cz + 0.9); { const [x, z] = OUTW(4.6, 5.4); cols.push({ c: [x, z, 0.75] }); }
    seller = kit.makeFox({ key: 'paperSeller', name: 'Paper Seller', torso: ['#201e1d', '#c9a24a', '#111111'], outfit: 'coat', mood: 'happy' }); seller.position.set(cx, 0, cz); seller.rotation.y = 0; seller.userData.noCull = true; seller.userData.rosterShop = 'Meru Daily'; OG.add(seller); hatOn(seller); }
  let headDay = -1, headTxt = ''; function drawHead() { if (!headT) return; const h = headline(), d = today(); if (h === headTxt && d === headDay) return; headTxt = h; headDay = d; const g = headT.userData.c.getContext('2d'), W = 512, H = 400;
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H); g.fillStyle = INK; g.fillRect(0, 0, W, 70); g.fillStyle = PAPER; g.font = '900 44px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU DAILY', 22, 36); g.fillStyle = RED; g.fillRect(0, 70, W, 10); g.fillStyle = INK; g.font = '800 22px Archivo, sans-serif'; g.fillText('DAY ' + d + ' \u00b7 TODAY\u2019S HEADLINE', 22, 108);
    const words = h.split(' '), lines = []; let cur = ''; g.font = '900 52px Archivo, sans-serif'; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > W - 44 && cur) { lines.push(cur); cur = w; } else cur = t; } lines.push(cur);
    const s = lines.length > 4 ? 40 : 52; g.font = '900 ' + s + 'px Archivo, sans-serif'; lines.slice(0, 5).forEach((l, i) => g.fillText(l, 22, 162 + i * s * 1.08)); headT.needsUpdate = true; }
  drawHead(); if (document.fonts && document.fonts.load) document.fonts.load('900 52px Archivo').then(() => { headTxt = ''; drawHead(); }).catch(() => {});
  // ================= shopKit (Ace = keeper) =================
  const GAMES = [{ k: 'scoop', name: 'Chase a Scoop', color: RED }, { k: 'layout', name: 'Layout Desk', color: '#2e4a6b' }, { k: 'press', name: 'Run the Press', color: DARK }, { k: 'round', name: 'Paper Round', color: '#b8892a' }, { k: 'cross', name: 'Crossword', color: '#3f7a52' }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { scoop: [-3.0, -5.1], layout: [4.2, 2.0], press: [-4.0, -1.2], round: [3.4, 7.0], cross: [5.0, -4.4] };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'nw', color: RED, boardTitle: "Ace Reporter's board", room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.3], keeper: ace, keeperRy: 0, games: GAMES, toWorld: v => v.add(G.position),
    board: { x: 3.6, y: 2.5, z: -9.8, ry: 0, w: 1.5 }, hiring: { x: -3.0, z: 7.4, ry: 0 }, hiringLine: 'PRESS \u00b7 ROUNDS \u00b7 PUZZLES', sun: [], lamps: PEND.map(([x, z]) => [x, RH - 1.42, z]), lampsOn: () => true,
    browse: [[2.6, 4.6, Math.PI / 2], [6.6, -0.5, Math.PI], [-2.4, 3.2, -Math.PI / 2], [4.4, -6.6, 0]], looks: [['#2e4a6b', '#e7e4dc', '#16263c'], ['#7a1d2a', '#f3f2f2', '#3d1218'], ['#4f7d3a', '#e2d2b4', '#2a3d20']], clock: { x: 0, y: 4.5, z: 9.83, ry: Math.PI } });
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringMeshes = {};
  for (const k in RINGS) { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(RINGS[k][0], 0.03, RINGS[k][1]); G.add(m); ringMeshes[k] = m; }
  // ================= NEWS KIT: sound, toast, fade, card, panel, markers =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, clack = () => { for (let i = 0; i < 4; i++) tone(900 + i * 60, 0.03, 0.05, 'square', i * 0.07); };
  let veil = null, fading = false; const fade = fn => { if (fading) return; fading = true; if (!veil) { veil = document.createElement('div'); Object.assign(veil.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity .28s', zIndex: '40' }); document.body.appendChild(veil); }
    void veil.offsetWidth; veil.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { veil.style.opacity = '0'; fading = false; }, 160); } }, 300); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,270px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(36vw, 250px)' : 'min(58vw, 270px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + RED + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = (next, stopBtn) => '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span>' + (stopBtn ? '<button data-stop style="pointer-events:auto;min-height:44px;min-width:64px;padding:0 12px;text-align:left;background:#f3f2f2;color:#201e1d;border:2px solid #f3f2f2;border-radius:0;font:900 12px Archivo,sans-serif;cursor:pointer">STOP</button>' : '<span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span>') + '</div>';
  const meter = (f, c, band, mid) => '<div style="position:relative;height:16px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px">' + (band ? '<div style="position:absolute;left:' + band[0] * 100 + '%;width:' + (band[1] - band[0]) * 100 + '%;top:0;bottom:0;background:#ffd23a"></div>' : '') + (mid ? '<div style="position:absolute;left:calc(' + (clamp(f, 0, 1) * 100).toFixed(1) + '% - 3px);top:-2px;bottom:-2px;width:6px;background:' + c + '"></div>' : '<div style="position:absolute;left:0;top:' + (band ? 4 : 0) + 'px;bottom:' + (band ? 4 : 0) + 'px;width:' + (clamp(f, 0, 1) * 100).toFixed(1) + '%;background:' + c + '"></div>') + '</div>';
  const steps = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">' + items.map(([t, ok]) => '<span style="padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;line-height:1.3;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffd23a' : '#201e1d') + '">' + (ok ? '\u2713 ' : '') + t + '</span>').join('') + '</div>' : items.map(([t, ok]) => '<div style="display:flex;gap:8px;align-items:center;padding:3px 0;border-top:1px solid #cfcac3;font-weight:800;font-size:13px"><span style="width:14px;height:14px;flex:none;border:2px solid #201e1d;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:#ffd23a;font-size:10px;line-height:10px;text-align:center">' + (ok ? '\u2713' : '') + '</span><span>' + t + '</span></div>').join('');
  const tipH = (who, t) => '<div style="margin-top:6px;font-size:12px;font-weight:800;line-height:1.3"><span style="color:' + RED + ';font-weight:900">' + who + ' \u00b7 </span>' + t + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; const b = card.querySelector('[data-stop]'); if (b) b.onclick = e => { e.stopPropagation(); quit(); }; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // the PANEL (desk jobs): a modal sheet, Modernist, clear of the phone's side columns in landscape
  const PANEL = document.createElement('div'); PANEL.style.cssText = 'position:fixed;z-index:34;display:none;flex-direction:column;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;box-sizing:border-box;overflow:hidden;-webkit-user-select:none;user-select:none;touch-action:none';
  document.body.appendChild(PANEL); for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'touchstart', 'touchmove']) PANEL.addEventListener(ev, e => e.stopPropagation(), { passive: true });
  const fitPanel = () => { const W = innerWidth, H = innerHeight, short = H < 520, side = short ? Math.max(8, Math.min(180, (W - 320) / 2)) : 8, w = Math.min(620, W - side * 2);
    Object.assign(PANEL.style, { left: Math.round((W - w) / 2) + 'px', width: Math.round(w) + 'px', top: (short ? 8 : 56) + 'px', bottom: (short ? 8 : 80) + 'px' }); }; fitPanel(); addEventListener('resize', () => { fitPanel(); if (PANEL.style.display !== 'none' && J && GD[J.g].draw) GD[J.g].draw(); });
  const panelHead = (l, r) => '<div style="display:flex;align-items:center;gap:10px;background:' + RED + ';color:#fff;padding:0 0 0 12px;font-weight:900;font-size:14px;flex:none;min-height:46px"><span style="flex:1;min-width:0;padding:6px 0;line-height:1.2;text-wrap:balance">' + l + '</span><span style="white-space:nowrap">' + r + '</span><button data-stop style="align-self:stretch;min-width:72px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 13px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">STOP</button></div>';
  const showPanel = html => { PANEL.innerHTML = html; PANEL.style.display = 'flex'; const b = PANEL.querySelector('[data-stop]'); if (b) b.onclick = () => quit(); };
  const hidePanel = () => { PANEL.style.display = 'none'; PANEL.innerHTML = ''; };
  const shake = el => { try { el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 }); } catch (e) {} };
  const pulse = el => { try { el.animate([{ outlineColor: '#ffd23a', outlineWidth: '4px' }, { outlineColor: 'rgba(255,210,58,0)', outlineWidth: '8px' }], { duration: 700, iterations: 3 }); } catch (e) {} };
  // MARKERS (errands): a yellow beam + bobbing tag in the world, and a big screen label with distance (points to the edge when off screen)
  const beamM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const bangT = CT(64, 96, (g, W, H) => { g.fillStyle = YEL; g.strokeStyle = INK; g.lineWidth = 6; g.fillRect(4, 4, W - 8, H - 8); g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = INK; g.font = '900 64px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('!', 22, H / 2 + 3); });
  const marker = (x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 16, 10, 1, true), beamM); b.position.y = 8; g.add(b); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bangT, depthTest: false, transparent: true })); s.scale.set(0.5, 0.75, 1); s.position.y = 2.9; s.renderOrder = 5; g.add(s); g.userData.tag = s; g.traverse(o => { o.userData.noCull = true; }); scene.add(g); return g; };
  const ARW = document.createElement('div'); ARW.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;background:#201e1d;color:#ffd23a;font-weight:900;font-size:15px;padding:6px 10px;border:2px solid #ffd23a;white-space:nowrap;transform:translate(-50%,-100%)';
  document.body.appendChild(ARW); const tmp = V();
  function arrowTo(w, label) { if (!w) { ARW.style.display = 'none'; return; } tmp.copy(w).project(camera); let x = (tmp.x + 1) / 2 * innerWidth, y = (1 - tmp.y) / 2 * innerHeight; const behind = tmp.z > 1; if (behind) { x = innerWidth - x; y = innerHeight - y; }
    const m = 120, mr = innerWidth < 600 ? 130 : 270, mt = innerHeight < 520 ? 60 : 130, mb = innerHeight < 520 ? 70 : 250, off = behind || x < m || x > innerWidth - mr || y < mt || y > innerHeight - mb, cx = innerWidth / 2, cy = innerHeight / 2;
    let ar = '\u25bc'; if (off) { const a = Math.atan2(y - cy, x - cx); x = clamp(x, m, innerWidth - mr); y = clamp(y, mt, innerHeight - mb); ar = '<span style="display:inline-block;transform:rotate(' + (a * 180 / Math.PI + 90).toFixed(0) + 'deg)">\u25b2</span>'; }
    ARW.style.display = 'block'; ARW.style.left = Math.round(x) + 'px'; ARW.style.top = Math.round(y) + 'px'; const h = ar + ' ' + label; if (ARW._h !== h) { ARW._h = h; ARW.innerHTML = h; } }
  // ================= input (press job taps / holds) =================
  let busy = null, J = null, lastP = null, lastFox = null, snapK = false, endClear = 0;
  const ptr = { down: false, x: 0, y: 0, id: null, t0: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (PANEL.contains(t)) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && J && !fading && GD[J.g].press3d;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; ptr.t0 = performance.now(); e.stopPropagation(); press(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const pd = v => { const s = scrW(v); return s[2] > 1 ? 1e9 : Math.hypot(s[0] - ptr.x, s[1] - ptr.y); };
  function press() { if (!J) return; const g = GD[J.g]; g.press && g.press(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  const addGold = n => { n = Math.max(0, Math.round(n)); if (!J) return 0; J.gold += n; save.addGold(n); coin(); return n; };
  const missOne = (msg, s = 1.8) => { if (!J) return; J.miss++; nope(); toast(msg, s); const tip = PANEL.style.display !== 'none' && PANEL.querySelector('[data-tip]'); if (tip) { tip.textContent = msg; tip.style.background = '#ec3013'; tip.style.color = '#ffffff'; } };
  // ================= talk targets =================
  const ln = (who, role) => text => ({ who, role, text });
  const T_ACE = { key: 'paperReporter', name: 'Ace Reporter', role: 'MERU DAILY', obj: ace, ry: ACE0[2], r: 6 }, aceLn = ln('Ace Reporter', 'MERU DAILY');
  const T_OP = { key: 'paperPress', name: 'Press Operator', role: 'MERU DAILY', obj: oper, ry: OP0[2], r: 4 }, T_SELL = seller ? { key: 'paperSeller', name: 'Paper Seller', role: 'MERU DAILY', obj: seller, ry: 0, r: 4 } : null;
  const goRoom = (x, z, yaw) => go(OX + x, LY, LZ + z, yaw);
  // ================= JOBS =================
  const GD = {};
  // ---------- 1 LAYOUT DESK (panel): tap a piece then its box, or drag it. Page 1 shows labels; page 2 = shapes only ----------
  const PAGES = [{ name: 'FRONT PAGE', labels: true, slots: [['head', 0, 0, 6, 1, 'HEADLINE'], ['photo', 0, 1, 4, 3, 'PHOTO'], ['story', 4, 1, 2, 5, 'STORY'], ['ad', 0, 4, 2, 2, 'AD'], ['weather', 2, 4, 2, 1, 'WEATHER'], ['inside', 2, 5, 2, 1, 'INSIDE']] },
    { name: 'BACK PAGE', labels: false, slots: [['comics', 0, 0, 6, 2, 'COMICS'], ['puzzle', 0, 2, 3, 3, 'CROSSWORD'], ['class', 3, 2, 3, 4, 'CLASSIFIEDS'], ['tides', 0, 5, 3, 1, 'LAKE TIMES']] }];
  const bars = (n, u, w = '100%') => [...Array(n)].map((_, i) => '<div style="height:' + Math.max(2, u * 0.07) + 'px;background:#8a847a;margin-top:' + Math.max(2, u * 0.07) + 'px;width:' + (i === n - 1 ? '60%' : w) + '"></div>').join('');
  function pieceHTML(k, u) { const f = s => Math.max(7, Math.round(u * s)) + 'px', ph = photos().slice(-1)[0];
    switch (k) { case 'head': return '<div style="font-weight:900;font-size:' + f(0.3) + ';line-height:1.05;padding:' + f(0.06) + '">' + headline() + '</div>';
      case 'photo': return ph ? '<div style="position:absolute;inset:0;background:url(' + ph + ') center/cover;filter:grayscale(1)"></div>' : '<div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,#9a948a 0 6px,#b3ada3 6px 12px);display:flex;align-items:flex-end;padding:' + f(0.08) + '"><span style="background:#201e1d;color:#f3f2f2;font-weight:900;font-size:' + f(0.2) + ';padding:1px 4px">PHOTO</span></div>';
      case 'story': return '<div style="padding:' + f(0.08) + '"><div style="font-weight:900;font-size:' + f(0.2) + '">STORY</div>' + bars(Math.max(4, Math.floor(u * 0.3)), u) + '</div>';
      case 'ad': return '<div style="position:absolute;inset:0;background:#ec3013;color:#fff;padding:' + f(0.1) + ';font-weight:900;font-size:' + f(0.24) + ';line-height:1.05">PIE SHOP<br>2 FOR 1</div>';
      case 'weather': return '<div style="padding:' + f(0.06) + ';font-weight:900;font-size:' + f(0.22) + '">\u2600 SUNNY 21\u00b0</div>';
      case 'inside': return '<div style="padding:' + f(0.06) + ';font-weight:800;font-size:' + f(0.18) + '">INSIDE: SPORTS 4 \u00b7 PUZZLES 8</div>';
      case 'comics': return '<div style="position:absolute;inset:' + f(0.08) + ';display:flex;gap:' + f(0.08) + '">' + [0, 1, 2].map(i => '<div style="flex:1;border:2px solid #201e1d;background:#fff;display:flex;align-items:flex-end;padding:2px;font-weight:900;font-size:' + f(0.16) + '">' + ['FOXY', 'SAYS', 'HI!'][i] + '</div>').join('') + '</div>';
      case 'puzzle': return '<div style="position:absolute;inset:' + f(0.12) + ';display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:#201e1d;border:2px solid #201e1d">' + [...Array(25)].map((_, i) => '<div style="background:' + ((i * 7) % 5 === 0 ? '#201e1d' : '#fff') + '"></div>').join('') + '</div>';
      case 'class': return '<div style="padding:' + f(0.08) + '"><div style="font-weight:900;font-size:' + f(0.2) + '">FOR SALE</div>' + bars(Math.max(5, Math.floor(u * 0.5)), u) + '</div>';
      case 'tides': return '<div style="padding:' + f(0.06) + ';font-weight:900;font-size:' + f(0.2) + '">LAKE TIMES \u00b7 CALM</div>'; } return ''; }
  GD.layout = { panel: true, shot: () => [toW(6.4, 1.0, 2.0), 3.4, 2.2, 0.75, 3.4, -Math.PI / 2, 7],
    begin() { J.pg = 0; J.placed = {}; J.sel = null; J.idle = 0; goRoom(RINGS.layout[0], RINGS.layout[1], Math.PI / 2); snapK = true; this.draw(); },
    pieces() { const P0 = PAGES[J.pg]; return P0.slots.map(s => s[0]).filter(k => !Object.values(J.placed).includes(k)); },
    fits(piece, slot) { const P0 = PAGES[J.pg], a = P0.slots.find(s => s[0] === piece), b = P0.slots.find(s => s[0] === slot); if (!a || !b || J.placed[slot]) return false; return P0.labels ? piece === slot : a[3] === b[3] && a[4] === b[4]; },
    draw() { const P0 = PAGES[J.pg]; showPanel(panelHead('LAYOUT DESK \u00b7 ' + P0.name + ' ' + (J.pg + 1) + ' / ' + PAGES.length, J.gold ? J.gold + ' G' : 'MERU DAILY') + '<div data-body style="flex:1;min-height:0;display:flex;gap:12px;padding:10px;box-sizing:border-box"></div><div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:13px;padding:8px 12px">' + (J.sel ? 'NOW TAP ITS BOX ON THE PAGE' : P0.labels ? 'TAP A PIECE, THEN ITS BOX \u00b7 OR DRAG IT' : 'NO LABELS NOW \u00b7 MATCH THE SHAPES') + '</div>');
      const body = PANEL.querySelector('[data-body]'), bw = body.clientWidth - 20, bh = body.clientHeight - 20, wide = bw > bh * 1.15;
      body.style.flexDirection = wide ? 'row' : 'column'; const u = Math.floor(wide ? Math.min(bw * 0.6 / 6, bh / 7) : Math.min(bw / 6, bh * 0.6 / 7)), trayW = wide ? bw - 6 * u - 20 : bw, ut = Math.max(12, Math.floor(Math.min(u * 0.72, (trayW - 24) / 6.4)));
      const page = document.createElement('div'); page.style.cssText = 'flex:none;width:' + (6 * u + 8) + 'px;background:#fffaf0;border:2px solid #201e1d;padding:2px;box-sizing:border-box';
      page.innerHTML = '<div style="height:' + u + 'px;border-bottom:3px solid #201e1d;display:flex;align-items:center;justify-content:flex-start;padding-left:6px;font-weight:900;font-size:' + Math.round(u * 0.56) + 'px;letter-spacing:-0.02em">MERU DAILY</div><div data-grid style="position:relative;height:' + 6 * u + 'px"></div>';
      body.appendChild(page); const grid = page.querySelector('[data-grid]');
      for (const [k, c, r, w, h, lab] of P0.slots) { const s = document.createElement('div'); s.dataset.slot = k; const on = J.placed[k];
        s.style.cssText = 'position:absolute;left:' + (c * u + 2) + 'px;top:' + (r * u + 2) + 'px;width:' + (w * u - 4) + 'px;height:' + (h * u - 4) + 'px;box-sizing:border-box;overflow:hidden;outline:0 solid transparent;' + (on ? 'border:2px solid #201e1d;background:#fff' : 'border:2px dashed #8a847a;background:' + (J.sel && this.fits(J.sel, k) && !P0.labels ? '#fff3c4' : 'rgba(0,0,0,0.03)'));
        s.innerHTML = on ? pieceHTML(on, u) : P0.labels ? '<div style="padding:4px;font-weight:900;font-size:' + Math.max(10, Math.round(u * 0.2)) + 'px;color:#8a847a">' + lab + '</div>' : ''; grid.appendChild(s); s.onclick = () => this.tap(k); }
      const tray = document.createElement('div'); tray.style.cssText = 'flex:1;min-width:0;min-height:0;display:flex;flex-wrap:wrap;align-content:flex-start;gap:10px;overflow:auto;padding:2px';
      tray.innerHTML = '<div style="width:100%;font-weight:900;font-size:13px;border-bottom:2px solid #201e1d;padding-bottom:4px">PIECES \u00b7 ' + this.pieces().length + ' LEFT</div>'; body.appendChild(tray);
      for (const k of this.pieces()) { const sl = P0.slots.find(s => s[0] === k), el = document.createElement('div'), inn = document.createElement('div'); el.dataset.piece = k;
        el.style.cssText = 'flex:none;padding:' + Math.max(4, Math.ceil((44 - Math.min(sl[3], sl[4]) * ut) / 2)) + 'px 4px;margin:-4px 0;cursor:grab;touch-action:none';
        inn.style.cssText = 'position:relative;width:' + sl[3] * ut + 'px;height:' + sl[4] * ut + 'px;background:#fff;border:2px solid #201e1d;box-sizing:border-box;overflow:hidden;pointer-events:none;' + (J.sel === k ? 'box-shadow:0 0 0 4px #ec3013' : '');
        inn.innerHTML = pieceHTML(k, Math.max(ut, 22)); el.appendChild(inn); tray.appendChild(el); this.drag(el, k); } },
    drag(el, k) { let st = null, ghost = null; el.onpointerdown = e => { st = { x: e.clientX, y: e.clientY }; J.idle = 0; try { el.setPointerCapture(e.pointerId); } catch (er) {} };
      el.onpointermove = e => { if (!st) return; if (!ghost && Math.hypot(e.clientX - st.x, e.clientY - st.y) > 8) { ghost = el.cloneNode(true); Object.assign(ghost.style, { position: 'fixed', zIndex: 36, pointerEvents: 'none', opacity: '0.9', boxShadow: '0 6px 0 rgba(0,0,0,0.25)' }); document.body.appendChild(ghost); }
        if (ghost) { ghost.style.left = (e.clientX - ghost.offsetWidth / 2) + 'px'; ghost.style.top = (e.clientY - ghost.offsetHeight / 2) + 'px'; } };
      el.onpointerup = e => { const moved = !!ghost; if (ghost) { ghost.remove(); ghost = null; } st = null; if (!moved) { J.sel = J.sel === k ? null : k; tone(700, 0.03, 0.08, 'square'); this.draw(); return; }
        const t = document.elementFromPoint(e.clientX, e.clientY), s = t && t.closest && t.closest('[data-slot]'); if (s) { J.sel = k; this.tap(s.dataset.slot); } };
      el.onpointercancel = () => { if (ghost) ghost.remove(); ghost = null; st = null; }; },
    tap(slot) { J.idle = 0; if (!J.sel) { toast('PICK A PIECE FIRST', 1.2); return; } if (J.placed[slot]) return; const P0 = PAGES[J.pg];
      if (!this.fits(J.sel, slot)) { missOne(P0.labels ? 'WRONG BOX \u00b7 READ THE LABEL' : 'WRONG SHAPE \u00b7 TRY ANOTHER BOX'); const el = PANEL.querySelector('[data-slot="' + slot + '"]'); if (el) shake(el); return; }
      J.placed[slot] = J.sel; J.sel = null; addGold(3); clack(); this.draw();
      if (!this.pieces().length) { if (J.pg + 1 < PAGES.length) { toast(P0.name + ' DONE \u00b7 NEXT PAGE', 1.6); ding(); setTimeout(() => { if (!J || J.g !== 'layout') return; J.pg++; J.placed = {}; this.draw(); }, 700); } else { addGold(8); setTimeout(finishGame, 600); } } },
    tick(dt) { J.idle += dt; if (J.idle > 3 && !J.hinted) { J.hinted = true; const P0 = PAGES[J.pg], k = J.sel || this.pieces()[0]; if (!k) return; const tgt = J.sel ? P0.slots.find(s => this.fits(k, s[0])) : null, el = tgt ? PANEL.querySelector('[data-slot="' + tgt[0] + '"]') : PANEL.querySelector('[data-piece="' + k + '"]');
      if (el) { el.style.outline = '4px solid #ffd23a'; pulse(el); setTimeout(() => { if (el) el.style.outline = ''; }, 2200); } } if (J.idle < 3) J.hinted = false; } };
  // ---------- 2 CROSSWORD (panel): pick the right word for each clue ----------
  const PUZ = [{ g: ['LAKE', 'A..A', 'M..S', 'POST'], w: [['LAKE', 0, 0, 'A', 'The ferry crosses it', ['LANE', 'LIKE']], ['POST', 3, 0, 'A', 'An office with a clock tower', ['PAST', 'PEST']], ['LAMP', 0, 0, 'D', 'It lines every path at night', ['LUMP', 'LIMP']], ['EAST', 0, 3, 'D', 'The sun comes up in the ___', ['VAST', 'EASY']]] },
    { g: ['GATE', 'O..A', 'L..S', 'DUTY'], w: [['GATE', 0, 0, 'A', 'There are eight of them', ['GAME', 'DATE']], ['DUTY', 3, 0, 'A', 'A guard on ___ walks the beat', ['DUST', 'DUSK']], ['GOLD', 0, 0, 'D', 'Coins you earn on every job', ['GOAL', 'COLD']], ['EASY', 0, 3, 'D', 'Gentle. Not hard', ['EAST', 'ECHO']]] },
    { g: ['BELL', 'O..A', 'A..K', 'TIDE'], w: [['BELL', 0, 0, 'A', 'It rings at the fire station on every call', ['BALL', 'BELT']], ['TIDE', 3, 0, 'A', 'The sea has one. The lake does not', ['TIME', 'RIDE']], ['BOAT', 0, 0, 'D', 'Axle drives the fire ___', ['COAT', 'BOOT']], ['LAKE', 0, 3, 'D', 'Meru sits on its shore', ['LACE', 'CAKE']]] }];
  GD.cross = { panel: true, shot: () => [toW(7.0, 0.9, -5.4), 2.6, 1.8, 0.75, 3.0, -Math.PI / 2, 6],
    begin() { const n = save.stat('nwCrossN', 0); save.setStat('nwCrossN', n + 1); J.pz = PUZ[n % PUZ.length]; J.got = {}; J.cur = 0; J.wrong = {}; J.idle = 0; goRoom(RINGS.cross[0], RINGS.cross[1], Math.PI / 2); snapK = true; this.draw(); },
    cells(w) { const [word, r, c, d] = w; return [...word].map((ch, i) => [d === 'A' ? r : r + i, d === 'A' ? c + i : c, ch]); },
    draw() { const PZ = J.pz, cur = PZ.w[J.cur], show = {}; PZ.w.forEach((w, i) => { if (J.got[i]) this.cells(w).forEach(([r, c, ch]) => { show[r + ',' + c] = ch; }); }); const hot = new Set(cur && !J.got[J.cur] ? this.cells(cur).map(([r, c]) => r + ',' + c) : []);
      showPanel(panelHead('CROSSWORD \u00b7 BACK PAGE', J.gold ? J.gold + ' G' : 'MERU DAILY') + '<div data-body style="flex:1;min-height:0;display:flex;gap:14px;padding:12px;box-sizing:border-box;overflow:auto"></div><div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:13px;padding:8px 12px">PICK THE WORD THAT FITS THE CLUE</div>');
      const body = PANEL.querySelector('[data-body]'), bw = body.clientWidth - 24, bh = body.clientHeight - 24, wide = bw > bh * 1.2; body.style.flexDirection = wide ? 'row' : 'column'; body.style.alignItems = 'flex-start';
      const cs = Math.max(34, Math.floor(Math.min(wide ? bw * 0.42 : bw, wide ? bh : bh * 0.42) / 4) - 2), num = { '0,0': 1, '0,3': 2, '3,0': 3 };
      let gh = '<div style="flex:none;display:grid;grid-template-columns:repeat(4,' + cs + 'px);gap:2px;background:#201e1d;border:2px solid #201e1d">';
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const ch = PZ.g[r][c], k = r + ',' + c; gh += ch === '.' ? '<div style="background:#201e1d"></div>' : '<div style="position:relative;height:' + cs + 'px;background:' + (hot.has(k) ? '#ffd23a' : '#fff') + ';display:flex;align-items:center;justify-content:center;font-weight:900;font-size:' + Math.round(cs * 0.55) + 'px">' + (num[k] ? '<span style="position:absolute;left:3px;top:1px;font-size:' + Math.max(9, Math.round(cs * 0.22)) + 'px">' + num[k] + '</span>' : '') + (show[k] || '') + '</div>'; }
      gh += '</div>'; const numOf = w => num[w[1] + ',' + w[2]];
      const ch = cur && !J.got[J.cur] ? [cur[0], ...cur[5]].sort((a, b) => ((a.charCodeAt(1) * 7 + J.cur) % 5) - ((b.charCodeAt(1) * 7 + J.cur) % 5)) : [];
      const right = '<div style="flex:1 0 auto;min-width:0;width:100%;display:flex;flex-direction:column;gap:8px">' + (cur && !J.got[J.cur] ? '<div style="font-weight:900;font-size:13px;color:#ec3013">' + numOf(cur) + (cur[3] === 'A' ? ' ACROSS' : ' DOWN') + ' \u00b7 ' + cur[0].length + ' LETTERS</div><div style="font-weight:900;font-size:19px;line-height:1.2;text-wrap:pretty">' + cur[4] + '</div><div style="display:flex;flex-wrap:wrap;gap:8px">' + ch.map(w => '<button data-w="' + w + '" ' + (J.wrong[w + J.cur] ? 'disabled ' : '') + 'style="min-height:48px;min-width:96px;padding:0 14px;text-align:left;background:' + (J.wrong[w + J.cur] ? '#cfcac3' : '#201e1d') + ';color:' + (J.wrong[w + J.cur] ? '#8a847a' : '#f3f2f2') + ';border:0;border-radius:0;font:900 18px Archivo,sans-serif;letter-spacing:0.08em;cursor:pointer">' + w + '</button>').join('') + '</div>' : '')
        + '<div style="flex:none;border-top:2px solid #201e1d;margin-top:4px">' + PZ.w.map((w, i) => '<div data-c="' + i + '" style="flex:none;display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #cfcac3;font-weight:800;font-size:13px;cursor:pointer;min-height:32px;' + (i === J.cur && !J.got[i] ? 'color:#ec3013' : '') + '"><span style="width:16px;height:16px;flex:none;border:2px solid #201e1d;background:' + (J.got[i] ? '#201e1d' : '#fff') + ';color:#ffd23a;font-size:11px;line-height:12px;text-align:center">' + (J.got[i] ? '\u2713' : '') + '</span><span>' + numOf(w) + (w[3] === 'A' ? 'A' : 'D') + ' \u00b7 ' + w[4] + '</span></div>').join('') + '</div></div>';
      body.innerHTML = gh + right; body.querySelectorAll('[data-w]').forEach(b => { b.onclick = () => this.pick(b.dataset.w); }); body.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => { const i = +b.dataset.c; if (!J.got[i]) { J.cur = i; this.draw(); } }; }); },
    pick(w) { J.idle = 0; const cur = J.pz.w[J.cur]; if (w !== cur[0]) { J.wrong[w + J.cur] = true; this.draw(); missOne('NOT THAT ONE \u00b7 TRY ANOTHER WORD'); return; }
      J.got[J.cur] = true; addGold(4); clack(); const nx = J.pz.w.findIndex((_, i) => !J.got[i]); if (nx < 0) { this.draw(); addGold(6); setTimeout(finishGame, 700); return; } J.cur = nx; this.draw(); },
    tick(dt) { J.idle += dt; if (J.idle > 3 && !J.hinted) { J.hinted = true; const b = PANEL.querySelector('[data-w="' + J.pz.w[J.cur][0] + '"]'); if (b) pulse(b); } if (J.idle < 3) J.hinted = false; } };
  // ---------- 3 RUN THE PRESS (3D): hold to run, keep the speed in the yellow; tap the ink can when it runs low ----------
  const BAND = [0.42, 0.76], GOAL = 40, inkPt = () => toW(-4.85, 1.35, 0.4);
  let rollA = 0, idleSp = 0.3;
  GD.press = { press3d: true, shot: () => [toW(-6.6, 1.5, -1.6), 11, 4.2, 0.3, 7, Math.PI / 2 - 0.42, 15.5],
    begin() { J.sp = 0.1; J.n = 0; J.inkLow = 0; J.inkNext = [12, 28]; J.jamT = 0; J.tens = 0; setStack(0.04); goRoom(-3.6, -6.6, -Math.PI / 2); oper.position.set(-4.3, 0, 4.9); oper.rotation.y = -Math.PI / 2; snapK = true; },
    press() { if (J.inkLow > 0 && pd(inkPt()) < RAD() * 1.7) { J.inkLow = 0; inkGlow.visible = false; addGold(3); tone(520, 0.05, 0.25, 'triangle'); tone(780, 0.04, 0.3, 'triangle', 0.1); toast('INK TOPPED UP', 1.2); ptr.down = false; } },
    tick(dt) { if (J.jamT > 0) { J.jamT -= dt; J.sp = Math.max(0, J.sp - dt * 0.6); } else { J.sp = clamp(J.sp + (ptr.down ? 0.5 : -0.34) * dt, 0, 1); if (J.sp > 0.93) { missOne('PAPER JAM! EASE OFF'); J.jamT = 1.6; J.sp = 0.3; tone(110, 0.08, 0.6, 'sawtooth'); } }
      const inB = J.sp >= BAND[0] && J.sp <= BAND[1]; J.rate = J.jamT > 0 ? 0 : inB ? 3.0 : J.sp > 0.15 ? 0.8 : 0; J.n = Math.min(GOAL, J.n + J.rate * dt); setStack(0.04 + J.n / GOAL * 0.9);
      const tens = Math.floor(J.n / 10); if (tens > J.tens) { J.tens = tens; addGold(4); }
      if (J.inkNext.length && J.n >= J.inkNext[0]) { J.inkNext.shift(); J.inkLow = 7; inkGlow.visible = true; tone(330, 0.05, 0.3, 'square'); toast('INK LOW \u00b7 TAP THE INK CAN', 2.4); }
      if (J.inkLow > 0) { J.inkLow -= dt; inkLid.material.color.set(Math.sin(performance.now() / 120) > 0 ? YEL : '#fff6c0'); if (J.inkLow <= 0) { inkGlow.visible = false; missOne('SMUDGED BATCH \u00b7 THE INK RAN DRY'); } } else inkLid.material.color.set(YEL);
      jamLamp.material.color.set(J.jamT > 0 ? (Math.sin(performance.now() / 90) > 0 ? '#ff3b1f' : '#5a1a12') : inB ? '#3fd36b' : '#5a1a12');
      if (J.n >= GOAL && !J.doneT) { J.doneT = 1.2; addGold(10); ding(); } if (J.doneT && (J.doneT -= dt) <= 0) finishGame(); },
    speed: () => (J ? J.sp : idleSp),
    card() { return { key: 'p' + Math.round(J.sp * 30) + '|' + Math.floor(J.n) + '|' + (J.inkLow > 0) + (J.jamT > 0), next: J.inkLow > 0 ? 'TAP THE YELLOW INK CAN' : 'HOLD TO RUN \u00b7 KEEP IN THE YELLOW', right: Math.floor(J.n) + ' / ' + GOAL,
      body: '<div style="font-size:12px;font-weight:900;margin-top:6px">' + (J.jamT > 0 ? 'JAMMED \u00b7 CLEARING' : 'PRESS SPEED') + '</div>' + meter(J.sp, INK, BAND, true) + '<div style="font-size:12px;font-weight:900;margin-top:6px">PAPERS PRINTED</div>' + meter(J.n / GOAL, RED) + tipH('OPERATOR', J.inkLow > 0 ? 'Ink! The yellow can, quick!' : 'Steady. Fast is not the same as good.') }; },
    hint() { return J.inkLow > 0 ? [inkPt(), 'TAP THE INK'] : [toW(-6.6, 2.4, -1.4), J.sp < BAND[0] ? 'HOLD' : 'LET GO A BIT']; } };
  // ---------- 4 CHASE A SCOOP (walk the town): interview 3 marked foxes, pick the right question ----------
  const SCOOPS = [
    { title: 'THE MIDNIGHT BELL', head: 'MIDNIGHT BELL? THE WIND DID IT', intro: 'The fire bell rang at midnight. No fire. Find three foxes who heard it.', w: [
      ['Night Baker', 'BAKERY', ['#f3f2f2', '#d8c9a8', '#8a6a3a'], 'Shh, the bread is rising. You want something?', 'DID YOU HEAR THE BELL?', 'Twice, at midnight. Then a big gust shook my shutters.', 'IS THE BREAD FREE?', 'No. But yes, I heard it. Twice. Windy night.'],
      ['Lamp Lighter', 'STREET LAMPS', ['#2e4a6b', '#c9a24a', '#16263c'], 'Evening. Or morning. I lose track up the ladder.', 'WHAT DID YOU SEE?', 'The station door was open, flapping in the wind like a flag.', 'CAN I CLIMB YOUR LADDER?', 'Absolutely not. Fine. The station door was flapping open.'],
      ['Sleepy Tenant', 'DECO APARTMENTS', ['#7c4dc4', '#e7e4dc', '#3d2563'], 'Yawn. Is this about the bell? It woke me up.', 'WHAT TIME WAS IT?', 'Midnight exactly. Then the wind slammed my window. Clang, bang.', 'DO YOU SNORE?', 'Rude. I sleep like a stone. Except at midnight. Bell.']] },
    { title: 'THE PIE THIEF', head: 'PIE MYSTERY SOLVED: HUNGRY PUP, BLUE FACE', intro: 'A pie vanished off a windowsill. Find three foxes who saw something.', w: [
      ['Pie Fan', 'WINDOWSILL', ['#c97a3a', '#f3f2f2', '#7a3d1a'], 'My pie was on the sill. Now it is not.', 'WHERE WAS THE PIE?', 'Cooling on the windowsill. Blueberry. Gone in ten minutes.', 'WAS IT A GOOD PIE?', 'The best. Which makes this worse. Windowsill, ten minutes.'],
      ['Street Sweeper', 'DECO STREETS', ['#4f7d3a', '#facc15', '#2a3d20'], 'I sweep, I see. Crumbs tell stories.', 'SEEN ANY CRUMBS?', 'A blue trail, all the way to the park. Little paw prints too.', 'CAN I BORROW THE BROOM?', 'No. Look down instead. Blue crumbs, heading for the park.'],
      ['Bench Sitter', 'PARK BENCH', ['#8a8f96', '#e2d2b4', '#4b5563'], 'Nice day for sitting. I do a lot of sitting.', 'ANYONE PASS BY?', 'A pup with a blue face. Very happy pup. Very full pup.', 'IS THIS BENCH COMFY?', 'Very. A blue-faced pup sat here too, licking its paws.']] },
    { title: 'THE GLOWING LAKE', head: 'LAKE GLOWS: THE GLOW-FISH ARE BACK', intro: 'Green light on the lake last night. Find three foxes who saw it.', w: [
      ['Night Fisher', 'THE JETTY', ['#2e86b8', '#e7e4dc', '#16435c'], 'Caught nothing. Saw something. Fair trade.', 'WHAT DID YOU SEE?', 'Green light under the water, out past the jetty. Pretty.', 'CATCH ANYTHING?', 'I said nothing. But green light, under the water. Odd.'],
      ['Early Jogger', 'LAP THREE', ['#ec3013', '#f3f2f2', '#7a1d2a'], "Can't stop long, I'm on lap three.", 'WHERE WAS THE GLOW?', 'Near the fire dock. It moved slowly, like it was swimming.', 'CAN I JOG WITH YOU?', "You'd fall behind. The glow was near the fire dock."],
      ['Ferry Fan', 'EVERY FERRY', ['#c9a24a', '#201e1d', '#7a5a2a'], 'I ride the ferry every day. Every single day.', 'IS IT DANGEROUS?', 'No! Glow-fish. They come up every spring. Nobody believes me.', 'WHY THE FERRY?', 'It goes in circles. Like me. Anyway, glow-fish. Spring.']] }];
  const freeAt = (x, z) => { if (L.outOfMap && L.outOfMap(x, z, 6)) return false; if (L.lakeF && L.lakeF(x, z) < 1.2) return false; if ((L.BUILDINGS || []).some(b => b.f && x > b.f[0] - 1 && x < b.f[1] + 1 && z > b.f[2] - 1 && z < b.f[3] + 1)) return false;
    return !cols.some(c => c.y0 == null && c.on !== false && (c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + 0.9 : c.f && c.f[1] - c.f[0] < 300 && x > c.f[0] - 0.9 && x < c.f[1] + 0.9 && z > c.f[2] - 0.9 && z < c.f[3] + 0.9)); };
  function sidewalkSpots(cx, cz, r0, r1) { const out = []; for (const R of L.ROADS || []) { const p = R.p || []; for (let k = 0; k < p.length - 1; k++) { const [ax, az] = p[k], [bx, bz] = p[k + 1], len = Math.hypot(bx - ax, bz - az); if (len < 8) continue; const nx = -(bz - az) / len, nz = (bx - ax) / len, off = (R.w || 8) / 2 + 1.7;
      for (let s = 4; s < len - 4; s += 7) { const x0 = ax + (bx - ax) * s / len, z0 = az + (bz - az) * s / len; for (const sg of [-1, 1]) { const x = x0 + nx * off * sg, z = z0 + nz * off * sg, d = Math.hypot(x - cx, z - cz); if (d < r0 || d > r1 || !freeAt(x, z)) continue; out.push([x, z, Math.atan2(-nx * sg, -nz * sg)]); } } } } return out; }
  const pickSpread = (list, n, gap) => { const L2 = list.slice().sort(() => Math.random() - 0.5), out = []; for (const p of L2) { if (out.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) >= gap)) out.push(p); if (out.length >= n) break; } return out; };
  const doorOut = () => (D0 ? [...OUTW(0, 11), D0.ry] : LR.out ? [LR.out.x, LR.out.z, LR.out.yaw] : null);
  const ringSpots = (cx, cz, r0, r1) => { const out = []; for (let r = r0; r <= r1; r += 6) for (let a = 0; a < 6.28; a += 5 / r) { const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (freeAt(x, z) && (!L.surfaceAt || L.surfaceAt(x, z) !== 'water')) out.push([x, z, Math.atan2(cx - x, cz - z)]); } return out; };
  GD.scoop = { errand: true,
    begin() { const n = save.stat('nwScoopN', 0); save.setStat('nwScoopN', n + 1); J.S = SCOOPS[n % SCOOPS.length]; const o = doorOut(); if (!o) { stop(); return; }
      let spots = pickSpread(sidewalkSpots(o[0], o[1], 22, 80), 3, 22); if (spots.length < 3) spots = [...spots, ...pickSpread(ringSpots(o[0], o[1], 22, 60).filter(p => spots.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 20)), 3 - spots.length, 20)]; if (spots.length < 3) spots = [...spots, ...[[-8, 10], [8, 16], [0, 24]].map(([a, b]) => [...OUTW(a, b), D0 ? D0.ry + Math.PI : 0])].slice(0, 3);
      J.W = J.S.w.map((d, i) => { const [x, z, ry] = spots[i], f = kit.makeFox({ key: 'nwWit' + i, name: d[0], torso: d[2], outfit: ['coat', 'vest', 'robe'][i], mood: 'warm' }), y = terrainAt(x, z) || 0; f.position.set(x, y, z); f.rotation.y = ry; f.userData.noCull = true; scene.add(f); J.objs.push(f);
        const m = marker(x, y, z); J.objs.push(m); const c = { c: [x, z, 0.45] }; cols.push(c); J.cols.push(c); return { d, f, m, done: false, T: { key: 'nwWit_' + i, name: d[0], role: d[1], obj: f, ry, r: 4 } }; });
      fade(() => { go(o[0], 0.6, o[1], o[2]); }); },
    near(P) { return J.W.find(w => !w.done && Math.hypot(P.x - w.f.position.x, P.z - w.f.position.z) < 2.6); },
    interview(w) { const [nm, role, , hello, gq, ga, sq, sa] = w.d, l = ln(nm, role), opts = [{ text: gq, pick: () => this.answer(w, l(ga), true) }, { text: sq, pick: () => this.answer(w, l(sa), false) }];
      if (Math.random() < 0.5) opts.reverse(); J.talking = true; w.f.rotation.y = Math.atan2(lastP.x - w.f.position.x, lastP.z - w.f.position.z); sayTo(w.T, [{ ...l(hello), choices: opts }]); },
    answer(w, line, good) { if (!J) return; if (good) addGold(6); else missOne('SILLY QUESTION \u00b7 THEY ANSWER ANYWAY', 2.2); sayTo(w.T, [line], () => { if (!J) return; J.talking = false; w.done = true; w.m.visible = false; tone(880 + J.W.filter(q => q.done).length * 120, 0.05, 0.2, 'triangle');
      if (J.W.every(q => q.done)) { addGold(10); save.setStat('nwHeadline', J.S.head); toast('STORY DONE \u00b7 PHONING IT IN', 2.2); setTimeout(finishGame, 1200); } else toast('QUOTE IN THE NOTEBOOK \u00b7 ' + J.W.filter(q => q.done).length + ' / 3', 2); }); },
    tick(dt, t) { for (const w of J.W) { w.m.userData.tag.position.y = 2.9 + Math.sin(t * 3) * 0.12; if (lastP && Math.hypot(lastP.x - w.f.position.x, lastP.z - w.f.position.z) < 60) kit.animFox(w.f, dt, 0, false); }
      const n = this.next(); arrowTo(n && !J.talking ? n.f.position.clone().add(V(0, 2.4, 0)) : null, n ? n.d[0].toUpperCase() + ' \u00b7 ' + Math.round(Math.hypot(lastP.x - n.f.position.x, lastP.z - n.f.position.z)) + ' M' : ''); },
    next() { if (!lastP) return null; return J.W.filter(w => !w.done).sort((a, b) => Math.hypot(lastP.x - a.f.position.x, lastP.z - a.f.position.z) - Math.hypot(lastP.x - b.f.position.x, lastP.z - b.f.position.z))[0] || null; },
    card() { const n = J.W.filter(w => w.done).length; return { key: 's' + n, next: 'FOLLOW THE YELLOW MARKERS \u00b7 TALK', right: n + ' / 3', stop: true, body: '<div style="font-size:13px;font-weight:900;margin-top:6px">' + J.S.title + '</div>' + steps(J.W.map(w => [w.d[0].toUpperCase(), w.done])) + tipH('ACE', 'Ask what they SAW. Facts only.') }; } };
  // ---------- 5 PAPER ROUND (walk the Deco doors): throw from under 8 m ----------
  const THROW = 8;
  const paperMesh = () => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.22), LM(NEWS)); g.add(b); const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.11, 0.23), LM(RED)); g.add(s); g.traverse(o => { o.userData.noCull = true; }); return g; };
  GD.round = { errand: true,
    begin() { const o = doorOut(); if (!o) { stop(); return; } const list = (L.CLUSTER_BUILDINGS || []).filter(c => c.cl === 'deco' && !c.battle && c.key !== 'newspaper' && c.D);
      J.M = list.map(c => { const D = c.D, k = D.lm ? 4.6 : 2.6, x = D.x + D.fx * k, z = D.z + D.fz * k, y = terrainAt(x, z) || 0; const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.85, 28), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.9, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(x, y + 0.06, z); ring.userData.noCull = true; scene.add(ring); J.objs.push(ring);
        const m = marker(x, y, z); J.objs.push(m); return { c, x, y, z, ring, m, done: false, name: c.kind === 'hq' ? c.title + ' HQ' : c.title }; });
      if (!J.M.length) { stop(); return; } J.fly = []; J.t0 = performance.now(); fade(() => { go(o[0], 0.6, o[1], o[2]); }); },
    near(P) { let best = null, bd = 12; for (const M of J.M) { if (M.done) continue; const d = Math.hypot(P.x - M.x, P.z - M.z); if (d < bd) { bd = d; best = M; } } return best ? { M: best, d: bd } : null; },
    throwAt(P) { const n = this.near(P); if (!n) return false; const { M, d } = n, hit = d <= THROW, p = paperMesh(), from = V(P.x, (P.y || 0) + 1.4, P.z), to = hit ? V(M.x, M.y + 0.08, M.z) : from.clone().lerp(V(M.x, M.y, M.z), 0.55).setY(M.y + 0.08);
      scene.add(p); J.objs.push(p); J.fly.push({ p, from, to, t: 0, M, hit }); tone(600, 0.04, 0.15, 'triangle'); return true; },
    tick(dt, t) { for (const F of J.fly) { if (F.t >= 1) continue; F.t = Math.min(1, F.t + dt / 0.65); const k = F.t; F.p.position.lerpVectors(F.from, F.to, k); F.p.position.y += Math.sin(Math.PI * k) * 2.2; F.p.rotation.y += dt * 14;
        if (k >= 1) { F.p.rotation.set(0, Math.random() * 3, 0); if (F.hit && !F.M.done) { F.M.done = true; F.M.ring.material.color.set('#3fd36b'); F.M.m.visible = false; addGold(5); tone(1040, 0.05, 0.2); toast('DELIVERED \u00b7 ' + F.M.name, 1.8);
            if (J.M.every(m => m.done)) { const sec = (performance.now() - J.t0) / 1000; if (sec < 90) addGold(10); J.time = sec; setTimeout(finishGame, 1100); } } else if (!F.hit) missOne('TOO FAR \u00b7 IT LANDED SHORT. GET UNDER 8 M', 2.2); } }
      for (const M of J.M) if (!M.done) { M.m.userData.tag.position.y = 2.9 + Math.sin(t * 3 + M.x) * 0.12; M.ring.scale.setScalar(1 + 0.08 * Math.sin(t * 4)); }
      const n = lastP && J.M.filter(m => !m.done).sort((a, b) => Math.hypot(lastP.x - a.x, lastP.z - a.z) - Math.hypot(lastP.x - b.x, lastP.z - b.z))[0];
      arrowTo(n ? V(n.x, n.y + 2.2, n.z) : null, n ? n.name + ' \u00b7 ' + Math.round(Math.hypot(lastP.x - n.x, lastP.z - n.z)) + ' M' : ''); },
    card() { const n = J.M.filter(m => m.done).length, sec = Math.floor(J.time || (performance.now() - J.t0) / 1000), nr = lastP && this.near(lastP), inR = nr && nr.d <= THROW;
      return { key: 'r' + n + '|' + sec + '|' + (nr ? (inR ? 1 : 2) : 0), right: Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'), stop: true, next: nr ? (inR ? (touch ? 'TALK' : 'E') + ' \u00b7 THROW NOW' : 'CLOSER \u00b7 UNDER 8 M') : 'FOLLOW THE YELLOW MARKERS',
        body: steps(J.M.map(m => [m.name, m.done])) + (nr ? '<div style="font-size:12px;font-weight:900;margin-top:6px">' + nr.M.name + ' \u00b7 ' + nr.d.toFixed(0) + ' M</div>' + meter(clamp(1 - nr.d / 12, 0, 1), inR ? '#3f9a5e' : RED, [1 - THROW / 12, 1]) : '') + tipH('ACE', 'Under 90 seconds and the bonus is yours.') }; } };
  // ================= PRIZES =================
  const VEST = { outfit: 'vest', torso: ['#e9e4d8', '#3d3b3a', '#201e1d'], name: 'PRESS VEST' };
  const vestOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === VEST.name); };
  function giveGift() { save.setStat('nwClears', save.stat('nwClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('nwVest', false)) { save.setStat('nwVest', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === VEST.name)) save.setStat('tailorOutfits', [...list, VEST]);
      save.setStat('nwPrevOutfit', save.data && save.data.outfit ? save.data.outfit : null); save.setOutfit(VEST); wear && wear(VEST); return 'vest'; }
    if (nd >= 2 && !save.stat('nwDaily', false)) { save.setStat('nwDaily', true); return 'daily'; }
    if (nd >= 3 && !save.stat('nwCamera', false)) { save.setStat('nwCamera', true); save.give('pressCamera'); return 'camera'; }
    if (nd >= GAMES.length && !save.stat('nwAll', false)) { save.setStat('nwAll', true); save.give('goldenPress'); save.addGold(60); return 'all'; } return null; }
  const GIFT = { vest: 'Your own PRESS VEST and hat. The Tailor keeps a copy.', daily: 'The paper stand outside gives you a free paper every day. Read the tip.', camera: 'Take this PRESS CAMERA. Use it from your bag. Best shots go on the corkboard.', all: 'Five for five. The GOLDEN PRESS, and 60 gold. Front page material.' };
  let wornH = null; function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.head) return; const on = vestOn();
    if (wornH && wornH.on === on && wornH.fox === fox && (!wornH.m || wornH.m.parent === P.head)) return; if (wornH && wornH.m && wornH.m.parent) wornH.m.parent.remove(wornH.m); wornH = { on, fox, m: null }; if (!on) return; const m = pressHat(); m.position.y = 0.26; P.head.add(m); wornH.m = m; }
  // PRESS CAMERA (item): render this frame, keep a small copy (last 6) for the corkboard + the layout desk photo
  const FLASH = document.createElement('div'); FLASH.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:45;transition:opacity .35s'; document.body.appendChild(FLASH);
  function snap() { if (!renderer) return false; try { renderer.render(scene, camera); const src = renderer.domElement, c = document.createElement('canvas'); c.width = 240; c.height = 160; const g = c.getContext('2d'), sw = src.width, sh = src.height, a = 1.5; let w = sw, h = sw / a; if (h > sh) { h = sh; w = sh * a; } g.drawImage(src, (sw - w) / 2, (sh - h) / 2, w, h, 0, 0, 240, 160);
      const url = c.toDataURL('image/jpeg', 0.72), L2 = photos(); L2.push(url); try { localStorage.setItem(PK, JSON.stringify(L2.slice(-6))); } catch (e) {} drawCork(); } catch (e) { console.warn('press camera', e); return false; }
    FLASH.style.transition = 'none'; FLASH.style.opacity = '0.9'; void FLASH.offsetWidth; FLASH.style.transition = 'opacity .4s'; FLASH.style.opacity = '0'; tone(2600, 0.05, 0.05, 'square'); tone(1300, 0.04, 0.12, 'square', 0.06); toast('PHOTO SAVED \u00b7 SEE IT ON THE MERU DAILY CORKBOARD', 2.6); return true; }
  function useItem(id) { if (id === 'pressCamera' && save.count('pressCamera')) { if (busy === 'job') return false; return snap(); } if (id === 'goldenPress' && save.count('goldenPress')) { toast('THE GOLDEN PRESS \u00b7 FIVE FOR FIVE AT THE MERU DAILY', 2.4); return true; } return false; }
  // DAILY PAPER popup (the stand outside): today's headline + a tip
  const PAPERV = document.createElement('div'); PAPERV.style.cssText = 'position:fixed;inset:0;z-index:38;display:none;align-items:flex-start;justify-content:center;padding:70px 12px 90px;box-sizing:border-box;background:rgba(32,30,29,0.55);font-family:Archivo,sans-serif;color:#201e1d';
  document.body.appendChild(PAPERV); for (const ev of ['pointerdown', 'pointerup', 'touchstart']) PAPERV.addEventListener(ev, e => e.stopPropagation(), { passive: true });
  function readPaper() { const d = today(); PAPERV.innerHTML = '<div style="width:min(440px,100%);max-height:100%;overflow:auto;background:#fffaf0;border:2px solid #201e1d;box-sizing:border-box"><div style="background:#201e1d;color:#f3f2f2;padding:10px 14px;font-weight:900;font-size:30px;letter-spacing:-0.02em">MERU DAILY</div><div style="height:6px;background:#ec3013"></div>'
      + '<div style="padding:12px 14px"><div style="font-weight:800;font-size:13px">DAY ' + d + ' \u00b7 ONE COIN</div><div style="font-weight:900;font-size:30px;line-height:1.05;margin-top:8px;text-wrap:balance">' + headline(d) + '</div>'
      + '<div style="margin-top:14px;border-top:2px solid #201e1d;padding-top:8px"><div style="font-weight:900;font-size:13px;color:#ec3013">TIP OF THE DAY</div><div style="font-weight:800;font-size:17px;line-height:1.3;margin-top:4px;text-wrap:pretty">' + tipOfDay(d) + '</div></div></div>'
      + '<button data-x style="display:block;width:100%;min-height:50px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 15px Archivo,sans-serif;text-align:left;padding:0 14px;cursor:pointer">FOLD IT UP</button></div>';
    PAPERV.style.display = 'flex'; PAPERV.querySelector('[data-x]').onclick = () => { PAPERV.style.display = 'none'; }; PAPERV.onclick = e => { if (e.target === PAPERV) PAPERV.style.display = 'none'; }; tone(500, 0.03, 0.2, 'triangle'); }
  addEventListener('keydown', e => { if (PAPERV.style.display !== 'none' && /Escape|KeyE|Space|Enter/.test(e.code)) { PAPERV.style.display = 'none'; e.stopPropagation(); } }, true);
  // ================= run a job =================
  const INTRO = { layout: 'Front page is a mess. Put each piece in its box. Big stuff goes big.', press: 'Run the press. Keep the speed in the yellow. Too fast and it jams.', cross: 'The back page needs a crossword. Pick the right word for each clue.', round: 'Papers for the Deco doors. Four of them. Throw from close, not from the street.' };
  const DONE = { layout: 'Clean page. The Editor will pretend he did it.', press: "Forty papers, no smudges. Smell that? That's news.", cross: 'Back page done. Somebody will finish it on the train.', round: 'All four doors. The Peppers even tipped. Barely.' };
  const nextJob = () => { const d = done(), n = GAMES.find(q => !d[q.k]); return n ? n.k : GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0].k; };
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; const n = save.stat('nwScoopN', 0), line = g === 'scoop' ? SCOOPS[n % SCOOPS.length].intro : INTRO[g]; sayTo(T_ACE, [aceLn(line)], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('nwVisits', save.stat('nwVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], cols: [], t: 0, P: lastP }; const D = GD[g]; busy = D.errand ? 'errand' : 'job'; ding();
    if (D.panel) { fade(() => D.begin()); return; } if (D.press3d) { fade(() => D.begin()); return; } D.begin(); }
  function finishGame() { if (!J || (busy !== 'job' && busy !== 'errand')) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold, S = J.S;
    const d = { ...done() }; d[g] = true; save.setStat('nwDone', d); const gift = giveGift(); const errand = GD[g].errand; busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none'; HINT.style.display = 'none'; drawHead();
    const say = () => { const L1 = [aceLn(g === 'scoop' ? 'Got it. Front page tomorrow: ' + S.head + '.' : DONE[g])]; if (stars === 3) L1[0].text += ' Textbook.'; if (gift) L1.push(aceLn(GIFT[gift])); K.finish(g, stars, gold, first); sayTo(T_ACE, L1, () => { if (busy === 'end') { busy = null; J = null; } }); };
    if (errand) fade(() => { cleanup(); goRoom(0, -3.4, Math.PI); snapK = true; setTimeout(say, 350); }); else { setTimeout(() => { cleanup(); goRoom(0, -3.4, Math.PI); snapK = true; endClear = 6; say(); }, 500); }
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 25000); }
  function cleanup() { if (J) { J.objs.forEach(o => o.parent && o.parent.remove(o)); J.objs = []; J.cols.forEach(c => { const i = cols.indexOf(c); if (i >= 0) cols.splice(i, 1); }); J.cols = []; } hidePanel(); hideCard(); ARW.style.display = 'none'; HINT.style.display = 'none'; inkGlow.visible = false; jamLamp.material.color.set('#5a1a12'); setStack(0.25); oper.position.set(OP0[0], 0, OP0[1]); oper.rotation.y = OP0[2]; }
  function stop() { const away = J && GD[J.g].errand; cleanup(); busy = null; J = null; ptr.down = false; if (away) fade(() => goRoom(0, 7.2, Math.PI)); }
  function quit() { if (busy === 'intro') { busy = null; return; } if (!J) return; stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
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
    camCur.pos.set(clamp(camCur.pos.x, OX - 9.5, OX + 9.5), clamp(camCur.pos.y, LY + 0.6, LY + RH - 0.4), clamp(camCur.pos.z, LZ - 9.5, LZ + 9.5)); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ================= hint hand (press) =================
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && GD[J.g].hint ? GD[J.g] : null, h = g && (performance.now() - lastIn > 3000 || (J.inkLow > 0 && J.inkLow < 5)) ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; HINT.lastChild.textContent = h[1]; };
  // ================= talk + prompt =================
  const inRoom = P => !!P && Math.abs(P.x - OX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const inLobby = P => !!P && Math.abs(P.x - LOX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const nearL = (p, x, z, r) => Math.hypot(p.x - x, p.z - z) < r;
  const ringAt = p => GAMES.find(q => nearL(p, RINGS[q.k][0], RINGS[q.k][1], 1.05));
  const nearAce = p => nearL(p, 0, -4.2, 1.9) || nearL(p, ace.position.x, ace.position.z, 1.8);
  const atStand = P => { if (!seller || !D0) return false; const [x, z] = OUTW(7.4, 5.0); return Math.hypot(P.x - x, P.z - z) < 1.9; };
  const dailyOk = () => save.stat('nwDaily', false) && save.stat('nwPaperDay', 0) !== today();
  function prompt(P) { if (busy === 'errand' && J) { if (J.g === 'scoop') { const w = GD.scoop.near(P); return w ? 'INTERVIEW \u00b7 ' + w.d[0].toUpperCase() : null; } const n = GD.round.near(P); return n ? (n.d <= THROW ? 'THROW PAPER \u00b7 ' : 'GET CLOSER \u00b7 ') + n.M.name + ' \u00b7 ' + n.d.toFixed(0) + ' M' : null; }
    if (busy) return null; if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; return nearL(p, LDOOR[0], LDOOR[1], 1.6) ? 'NEWSROOM \u00b7 COME IN' : null; }
    if (atStand(P)) return 'PAPER SELLER \u00b7 ' + (dailyOk() ? 'FREE PAPER' : "TODAY'S PAPER");
    if (!inRoom(P)) return null; const p = toL(P); if (nearL(p, NDOOR[0], NDOOR[1], 1.5)) return 'LOBBY \u00b7 MERU DAILY'; const r = ringAt(p); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearAce(p)) return 'TALK \u00b7 ACE REPORTER'; if (nearL(p, oper.position.x, oper.position.z, 1.8)) return 'TALK \u00b7 PRESS OPERATOR';
    if (nearL(p, 9.0, -1.6, 2.2)) return 'CORKBOARD \u00b7 YOUR PHOTOS'; return null; }
  const HELLO = ["Got a fact? I trade facts for facts.", "Deadline's at six. It's always six.", 'The press is warm, the coffee is cold. Perfect.'];
  const FIRST = 'Ace Reporter. Facts only. Want a job? Good. I have five, and one deadline.';
  let talked = save.stat('nwTalked', 0), opN = 0, sellN = 0;
  function aceMenu() { const first = !talked; talked++; save.setStat('nwTalked', talked);
    const ch = [{ text: CHOICE_WORK, pick: () => startGame(nextJob()) }, { text: 'PICK A JOB', pick: () => sayTo(T_ACE, [{ ...aceLn('Which one?'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'ANY NEWS?', pick: () => sayTo(T_ACE, [aceLn("Today's front page: " + headline() + '.')]) }, { text: 'WHO SENT THE BANDITS?', pick: () => sayTo(T_ACE, [aceLn('Follow the money. It goes in circles round the lake. That is a clue.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(T_ACE, [aceLn("Get out there. Facts don't find themselves.")]) }];
    sayTo(T_ACE, [{ ...aceLn(first ? FIRST : HELLO[(talked - 2) % HELLO.length]), choices: ch }]); }
  function sellerTalk() { const l = ln('Paper Seller', 'MERU DAILY'), LN = (CLUSTER_LINES.paperSeller || {}).say || ['Meru Daily! Read all about it!'];
    const free = dailyOk(), ch = [{ text: free ? 'FREE PAPER, PLEASE' : "TODAY'S PAPER \u00b7 1 G", pick: () => { if (free) { save.setStat('nwPaperDay', today()); readPaper(); return; } if (!save.spend(1)) { sayTo(T_SELL, [l('One coin, friend. Come back with one coin.')]); return; } coin(); readPaper(); } }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(T_SELL, [{ ...l(free ? 'For you? Free. Ace says you are one of us now.' : LN[sellN++ % LN.length]), choices: ch }]); }
  function talk(P) { lastP = P; if (busy === 'job') return true; if (busy === 'errand' && J) { if (J.g === 'scoop') { if (J.talking) return true; const w = GD.scoop.near(P); if (w) { GD.scoop.interview(w); return true; } return false; } return GD.round.throwAt(P); }
    if (busy) return false;
    if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; if (nearL(p, LDOOR[0], LDOOR[1], 1.6)) { fade(() => { goRoom(0, 7.2, Math.PI); }); K.chime(); return true; } return false; }
    if (atStand(P)) { sellerTalk(); return true; }
    if (!inRoom(P)) return false; const p = toL(P);
    if (nearL(p, NDOOR[0], NDOOR[1], 1.5)) { fade(() => { go(LOX + LDOOR[0], LY, LZ + LDOOR[1] + 1.2, 0); }); return true; }
    const r = ringAt(p); if (r) { startGame(r.k); return true; } if (K.atHiring(p)) { ding(); startGame(nextJob()); return true; }
    if (nearAce(p)) { tone(1320, 0.05, 0.5); aceMenu(); return true; }
    if (nearL(p, oper.position.x, oper.position.z, 1.8)) { const LN = (CLUSTER_LINES.paperPress || {}).say || ['Mind the press.']; sayTo(T_OP, [ln('Press Operator', 'MERU DAILY')(LN[opN++ % LN.length])]); return true; }
    if (nearL(p, 9.0, -1.6, 2.2)) { const n = photos().length; toast(n ? n + ' PHOTO' + (n > 1 ? 'S' : '') + ' ON THE BOARD \u00b7 THE NEWEST GOES ON THE FRONT PAGE' : save.count('pressCamera') ? 'NO PHOTOS YET \u00b7 USE THE PRESS CAMERA FROM YOUR BAG' : 'NO PHOTOS YET \u00b7 THE ACE REPORTER HAS A CAMERA FOR GOOD WORKERS', 2.8); return true; }
    return false; }
  // ================= per frame =================
  let dayCheck = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt; applyWear(fox);
    const inR = inRoom(P), inL = inLobby(P); G.visible = inR || (busy === 'job'); LG.visible = inL; if (D0) OG.visible = Math.hypot(P.x - D0.x, P.z - D0.z) < (touch ? 110 : 180);
    if ((dayCheck -= dt) <= 0) { dayCheck = 3; drawHead(); } if (standLamp) { const h = hour(), nt = h >= 19 || h < 6.5; standLamp.material.color.set(nt ? '#fff1c4' : '#6b5a3a'); }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if ((busy === 'job' || busy === 'errand') && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('news job: ' + (e && e.stack || e)); stop(); }
      if (J && D.card && J.talking) hideCard(); else if (J && D.card) { const c = D.card(); setCard(J.g + c.key + J.miss + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), c.right || (J.gold ? J.gold + ' G' : 'MERU DAILY')) + foot(c.next, c.stop) + '<div style="padding:4px 10px 8px">' + c.body + '</div>'); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && GD[J.g].panel && !fading) GD[J.g].draw();
    hintTick(t);
    if (G.visible) { const sp = J && J.g === 'press' && busy === 'job' ? J.sp : idleSp; rollA += dt * (0.6 + sp * 12); rollers.forEach((r, i) => { r.rotation.x = (i % 2 ? -rollA : rollA); }); feed.rotation.x = rollA * 0.35; webT.offset.y = (webT.offset.y + dt * (0.08 + sp * 1.2)) % 1;
      if (!(J && J.g === 'press')) { jamLamp.material.color.set('#3fd36b'); }
      for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
      kit.animFox(oper, dt, 0, false); if (!busy) { const p = toL(P), dd = Math.hypot(p.x - oper.position.x, p.z - oper.position.z), want = dd < 4 ? Math.atan2(p.x - oper.position.x, p.z - oper.position.z) : OP0[2]; let df = want - oper.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); oper.rotation.y += df * Math.min(1, dt * 3); } }
    if (seller && OG.visible && Math.hypot(P.x - D0.x, P.z - D0.z) < 50) kit.animFox(seller, dt, 0, false);
    K.tick(dt, toL(P), { inShop: inR, busy: !!busy, near: inR ? 0 : 99, talking: false, clear: endClear > 0 ? [0, -3.4, 2.6] : null }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? busy : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, room: NR, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading }), _spots: () => { const o = doorOut(); return { o, side: sidewalkSpots(o[0], o[1], 22, 80).length, ring: ringSpots(o[0], o[1], 22, 60).length, roads: (L.ROADS || []).length }; },
    spawn: { newsroom: [OX, LZ + 7.2, Math.PI, LY], daily: D0 ? [...OUTW(0, 11), D0.ry, 0] : null }, headline, readPaper, snap, finish: () => finishGame(),
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; ptr.t0 = performance.now(); press(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); }, release() { ptr.down = false; release(); }, scr: v => scrW(v), hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null),
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); }, ace, oper, seller,
    dispose() { card.remove(); HINT.remove(); PANEL.remove(); ARW.remove(); FLASH.remove(); PAPERV.remove(); K.dispose(); } };
  window.__news = API; return API;
}
