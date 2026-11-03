// MERU 2.0 — s81 POLICE DEPARTMENT DELUXE POLISH + JOBS (Ben's picks): the Meru Police [meruPolice] gets the interior rules, 12 jobs and a deluxe look.
// Built in the police station's ORIGINAL frame (worlds/meru2-layout.js police f -110..-62 × -125..-80, door S (-86, -80); lobby z -80..-95, jail hall
// z -95..-116, cells z -116..-124.6; the evidence room under it at y -3.4, worlds/meru2-backrooms.js, now 11 m longer for the CCTV ROOM + DISPATCH).
// meru2-walk.js adds API.group + API.k9group to the station's moved group (RL.MV 'police') and runs it with the RL.P(mP) proxy like the bank.
// KEEPERS: CHIEF BARKLEY (stern by-the-book, secretly kind; new) = shopKit keeper + menu · SGT. KNOX (the jail guard from worlds/meru2-civic.js, his
// patrol + view cone keep working; he stops to talk) runs the jail jobs · OLD JACK (reformed outlaw, cell 2) gives tips + stories.
// JOBS (gentle, stars by mistakes 0 = 3, ≤ 2 = 2): FRONT DESK (change for a fine + stamp PAID) · MUGSHOT (flash when centred, front + side, read the
// height) · FINGERPRINTS (downstairs lab: ink + roll 5 fingers, match or not) · WANTED POSTERS (pin each face to its name: Rook, Vix, Snag, Cutter, Rell)
// · EVIDENCE (downstairs: tag the bag with its case, shelve it in its aisle) · CCTV ROOM (worlds/meru2-police-cctv.js: 4 live screens, tap the fox who
// pockets something; REWIND the tape; an officer leads him off) · DISPATCH (wall map of the real town: send the nearest free car to each call) ·
// FEED THE PRISONERS (walk: the right tray to each cell before they get hungry) · SKETCH ARTIST (build the face from the witness, feature by feature) ·
// PARKING TICKETS (outside: ticket the cars in the red bays) · K-9 TRAINING (Duke on a lead to the K-9 course in the town park: sit, stay + come,
// sniff the crates, jump) · NIGHT WATCH (walk: Knox lends you the torch cone, a prisoner creeps for the door, light him up to catch him).
// PRIZES: 1st clear MERU POLICE UNIFORM + cap (worn + Tailor wardrobe) · 2 jobs POLICE WHISTLE · 3 jobs DEPUTY BADGE (fines halved, worlds/meru2-law.js) ·
// 5 jobs Knox's cone smaller (the escape gets easier) · 8 jobs FREE BAIL once a day · all 12 GOLDEN BADGE (Home shelf) + 80 gold.
// LOOK: wanted board, coffee pot steaming + donut box on the desk, 2 ceiling fans, red/blue light bar over the door at night, radio chatter + blinking
// dispatch panel, height chart + mugshot camera corner, a grumpy fox on the holding bench by day, rain on the windows at night, trophy case.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { dueAt, rosterFoxes, ROSTER, dressFox } from './meru2-roster.js';
import * as LAY from './meru2-layout.js';
import { keepClear } from './meru2-townnet.js';
const { BUILDINGS } = LAY;
import { floraRemove } from './meru2-flora.js';
import { makeCCTV } from './meru2-police-cctv.js';
export function buildPoliceJobs({ THREE, scene, kit, cols, save, law, touch, sayTo, camera, wear, hour, isMuted, refs, renderer, world }) {
  const X0 = -110, X1 = -62, Z0 = -125, Z1 = -80, Y = -3.4, TOPD = -0.15;
  const G = new THREE.Group(); G.name = 'policeJobs'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color(), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }, pickR = a => a[Math.random() * a.length | 0];
  const toW = v => { G.updateWorldMatrix(true, false); return G.localToWorld(v.clone()); };
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 10, 8), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const S = mk(), SD = mk(), GLO = mk();   // S = upstairs + outside, SD = the vault corridor (renderOrder -2 like the backrooms)
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const redrawT = (t, fn) => { const c = t.userData.c; fn(c.getContext('2d'), c.width, c.height); t.needsUpdate = true; };
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 10) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const plane = (map, w, h, x, y, z, ry = 0, par = G, extra = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, ...extra })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const flatP = (map, w, h, x, y, z, ry = 0, extra = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, ...extra })); m.position.set(x, y, z); m.rotation.set(-Math.PI / 2, ry, 0, 'YXZ'); G.add(m); return m; };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const ringC = (x, z, r, y0, y1) => cols.push(y0 == null ? { c: [x, z, r] } : { c: [x, z, r], y0, y1 }), rect = (a, b, c2, d, y0, y1) => cols.push(y0 == null ? { f: [a, b, c2, d] } : { f: [a, b, c2, d], y0, y1 });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GREEN = '#2f7a4a', BLUE = '#2f6fd6', GOLD = '#c9a227', BR = '#b08d3c', STEEL = '#9aa0a6', DSTEEL = '#5c6670', WOOD = '#5a3d26', MARBLE = '#ece6d8', BARG = '#e0b23a';
  const glowT = CT(32, 32, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, W, W); });
  const pts = (list, size, color, op, add = true) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(list.flat()), 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ map: glowT, size, color, transparent: true, opacity: op, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending })); p.frustumCulled = false; G.add(p); return p; };
  const hour0 = () => (hour ? hour() : 12), isNight = () => { const h = hour0(); return h >= 20 || h < 6; };
  const NAVY = '#24344d', NAVYD = '#16263c', ORANGE = '#e8762a', CREAM = '#f6efd8';
  const PR = refs || null;
  const K9G = new THREE.Group(); K9G.name = 'policeK9'; scene.add(K9G);
  // ================= the deluxe look =================
  // --- coffee pot (steaming) + a donut box on the front desk ---
  S.box(0.3, 0.36, 0.26, INK, -89.9, 1.36, -89.8); S.box(0.26, 0.04, 0.2, '#3f4854', -89.9, 1.2, -89.72); S.cyl(0.08, 0.07, 0.15, '#3a2214', -89.9, 1.28, -89.66, 12); S.box(0.06, 0.02, 0.06, RED, -89.8, 1.46, -89.67);
  for (let k = 0; k < 3; k++) { S.cyl(0.045, 0.04, 0.09, k === 1 ? WHITE : NAVY, -89.45 + k * 0.12, 1.225, -89.5, 10); }
  S.box(0.44, 0.06, 0.3, '#f6c9d6', -88.8, 1.21, -89.62); S.box(0.44, 0.3, 0.02, '#f6c9d6', -88.8, 1.36, -89.77, 0, -0.35);
  for (let k = 0; k < 6; k++) S.put(new THREE.TorusGeometry(0.045, 0.022, 6, 12), -88.94 + (k % 3) * 0.14, 1.26, -89.68 + (k / 3 | 0) * 0.12, ['#f0a8c0', '#8a5a3a', '#ffd23a', '#f3f2f2', '#c2456a', '#8a5a3a'][k], 0, Math.PI / 2);
  const steam = pts([...Array(9)].map(() => [-89.9, 1.4, -89.66]), 0.09, '#ffffff', 0.35, false); const stD = [...Array(9)].map((_, i) => ({ t: i / 9, a: rnd(0, 6) }));
  // --- 2 ceiling fans over the lobby ---
  const FANS = [[-99, -88], [-73, -88]].map(([x, z]) => { S.cyl(0.03, 0.03, 0.5, INK, x, 3.62, z, 6); S.cyl(0.14, 0.12, 0.14, '#5a3d26', x, 3.32, z, 12); const g = new THREE.Group(); g.position.set(x, 3.26, z); G.add(g);
    for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.18), LM('#5a3d26')); b.position.set(Math.cos(i * Math.PI / 2) * 0.55, 0, Math.sin(i * Math.PI / 2) * 0.55); b.rotation.y = -i * Math.PI / 2; b.rotation.x = 0.12; g.add(b); } return g; });
  // --- red / blue light bar over the front door (outside), flashing at night ---
  S.box(1.6, 0.16, 0.24, INK, -86, 4.45, -79.66); const LBR = new THREE.MeshBasicMaterial({ color: '#ff2a1a' }), LBB = new THREE.MeshBasicMaterial({ color: '#2a6bff' });
  const lbR = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.2), LBR), lbB = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.2), LBB); lbR.position.set(-86.38, 4.6, -79.64); lbB.position.set(-85.62, 4.6, -79.64); G.add(lbR); G.add(lbB);
  const lbGlowR = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#ff3020', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })), lbGlowB = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#3070ff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  lbGlowR.scale.set(3.2, 3.2, 1); lbGlowB.scale.set(3.2, 3.2, 1); lbGlowR.position.set(-86.4, 4.6, -79.3); lbGlowB.position.set(-85.6, 4.6, -79.3); G.add(lbGlowR); G.add(lbGlowB);
  // --- rain on the front windows at night ---
  const rainT = CT(128, 256, (g, W, H) => { g.clearRect(0, 0, W, H); for (let i = 0; i < 70; i++) { const x = rnd(0, W), y = rnd(0, H), l = rnd(10, 34); g.strokeStyle = 'rgba(200,220,255,' + rnd(0.25, 0.6).toFixed(2) + ')'; g.lineWidth = rnd(1, 2.2); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1, y + l); g.stroke(); g.fillStyle = 'rgba(220,235,255,0.5)'; g.beginPath(); g.arc(x + 1, y + l, 1.6, 0, 7); g.fill(); } });
  rainT.wrapS = rainT.wrapT = THREE.RepeatWrapping; const rainM = new THREE.MeshBasicMaterial({ map: rainT, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  for (const x of [-101.8, -95.2, -76.8, -70.2]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), rainM); m.position.set(x, 1.95, -80.36); m.rotation.y = Math.PI; G.add(m); }
  // --- trophy case (town awards) on the east wall ---
  { const x = -62.95, z = -87.5; S.box(0.56, 0.5, 2.7, WOOD, x, 0.25, z); S.box(0.56, 0.08, 2.7, WOOD, x, 2.3, z); for (const e of [-1.32, 1.32]) S.box(0.56, 2.1, 0.06, WOOD, x, 1.25, z + e);
    for (const y of [0.95, 1.55]) S.box(0.5, 0.03, 2.6, '#cfe9ff', x, y, z);
    const cup = (cx, cy, cz, c, s = 1) => { S.cyl(0.06 * s, 0.08 * s, 0.05 * s, INK, cx, cy + 0.025 * s, cz, 10); S.cyl(0.02 * s, 0.02 * s, 0.12 * s, c, cx, cy + 0.11 * s, cz, 8); S.cyl(0.11 * s, 0.05 * s, 0.16 * s, c, cx, cy + 0.25 * s, cz, 12); for (const e of [-1, 1]) S.put(new THREE.TorusGeometry(0.045 * s, 0.01 * s, 5, 10), cx, cy + 0.27 * s, cz + e * 0.12 * s, c); };
    cup(x, 0.5, z - 0.8, GOLD, 1.3); cup(x, 0.5, z, '#c9ced3', 1.6); cup(x, 0.5, z + 0.8, GOLD, 1.1); cup(x, 0.98, z - 0.6, '#b87333'); cup(x, 0.98, z + 0.6, GOLD); cup(x, 1.58, z - 0.9, '#c9ced3', 0.9);
    for (const dz of [0, 0.5]) { S.box(0.04, 0.3, 0.4, WOOD, x - 0.2, 1.75, z + 0.3 + dz - 0.2, 0, 0, 0); S.box(0.01, 0.2, 0.3, GOLD, x - 0.23, 1.75, z + 0.3 + dz - 0.2); }
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.8), new THREE.MeshPhongMaterial({ color: 0xcfe9ff, transparent: true, opacity: 0.22, shininess: 120, depthWrite: false })); gl.position.set(x - 0.29, 1.4, z); gl.rotation.y = -Math.PI / 2; G.add(gl);
    rect(x - 0.3, -62.4, z - 1.4, z + 1.4); }
  // --- MUGSHOT corner (lobby, west wall): height chart, footprints, a camera on a tripod, a flash umbrella ---
  S.box(0.05, 3.6, 6.4, '#d8d2c8', -109.84, 1.8, -87); S.box(0.06, 1.1, 6.4, NAVY, -109.82, 0.55, -87);
  const chartT = CT(256, 320, (g, W, H) => { g.fillStyle = '#e9e6df'; g.fillRect(0, 0, W, H); g.fillStyle = NAVY; g.fillRect(0, 0, W, 26); g.fillStyle = '#ffffff'; g.font = '900 16px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU POLICE', 10, 14);
    for (let k = 0; k <= 22; k++) { const hy = 2.4 - k * 0.1, y = 26 + (k / 22) * (H - 26); const major = k % 2 === 0; g.fillStyle = INK; g.fillRect(0, y - (major ? 1.5 : 0.75), major ? W : W * 0.35, major ? 3 : 1.5); if (major && hy >= 0.4) { g.font = '900 15px Archivo, sans-serif'; g.fillText(hy.toFixed(1), W - 40, y - 9); } }
    g.fillStyle = 'rgba(236,48,19,0.18)'; g.fillRect(W / 2 - 20, 26, 40, H - 26); });
  plane(chartT, 1.6, 2.0, -109.74, 1.4, -87, Math.PI / 2);   // spans y 0.4 .. 2.4 (top label strip ~2.24..2.4)
  for (const s of [-1, 1]) S.box(0.22, 0.004, 0.1, '#ffd23a', -108.8, 0.06, -87 + s * 0.12);
  { const tx = -105.6, tz = -88.4; for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; S.box(0.03, 1.3, 0.03, INK, tx + Math.cos(a) * 0.22, 0.62, tz + Math.sin(a) * 0.22, 0, Math.cos(a) * 0.17, -Math.sin(a) * 0.17); } S.box(0.26, 0.2, 0.18, INK, tx, 1.32, tz); S.cyl(0.06, 0.06, 0.14, '#3f4854', tx - 0.18, 1.32, tz + 0.05, 10, 0, Math.PI / 2); ringC(tx, tz, 0.3); }
  { const ux = -106.4, uz = -85.2; S.box(0.03, 1.8, 0.03, INK, ux, 0.9, uz); S.put(new THREE.ConeGeometry(0.45, 0.4, 10, 1, true), ux - 0.12, 1.85, uz, WHITE, 0, 0, Math.PI / 2 + 0.3); ringC(ux, uz, 0.25); }
  const flashL = new THREE.PointLight(0xffffff, 0, 6); flashL.position.set(-106.2, 1.8, -86.2); G.add(flashL);
  // --- WANTED BOARD (lobby side of the jail wall): cork, 5 frames + name tags, a lower ledge where new posters wait ---
  S.box(5.6, 2.8, 0.06, '#a8784a', -100, 1.9, -94.82); S.box(5.7, 2.9, 0.04, WOOD, -100, 1.9, -94.86); S.box(5.6, 0.06, 0.16, WOOD, -100, 0.88, -94.74);
  plane(CT(256, 48, (g, W, H) => { g.fillStyle = RED; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; g.font = '900 32px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('WANTED', 12, H / 2 + 2); }), 1.4, 0.26, -101.9, 3.12, -94.78, 0);
  const VILL = [{ k: 'rook', n: 'ROOK', clue: 'EYE PATCH \u00b7 SCAR', f: { ears: 'POINTY', eyes: 'PATCH', mouth: 'FROWN', extra: 'SCAR', fur: '#6b625b' } },
    { k: 'vix', n: 'VIX', clue: 'HOOD \u00b7 SHARP EYES', f: { ears: 'POINTY', eyes: 'SHARP', mouth: 'GRIN', extra: 'HOOD', fur: '#c2502a' } },
    { k: 'snag', n: 'SNAG', clue: 'TORN EAR \u00b7 GAP TOOTH', f: { ears: 'TORN', eyes: 'BIG', mouth: 'GAP TOOTH', extra: 'NONE', fur: '#8a5a3a' } },
    { k: 'cutter', n: 'CUTTER', clue: 'RED BANDANA', f: { ears: 'ROUND', eyes: 'SHARP', mouth: 'FROWN', extra: 'BANDANA', fur: '#c9a874' } },
    { k: 'rell', n: 'RELL', clue: 'GOGGLES \u00b7 BIG EYES', f: { ears: 'ROUND', eyes: 'BIG', mouth: 'GRIN', extra: 'GOGGLES', fur: '#3d3b3a' } }];
  // one face drawer for posters + the sketch pad (pencil = graphite, no colour)
  function drawFace(g, f, cx, cy, s, pencil) { const ink = pencil ? '#3a3a3a' : INK, fur = pencil ? '#d8d4cc' : f.fur || '#c97a3a', lw = pencil ? 2.5 : 4; g.lineWidth = lw; g.strokeStyle = ink; g.lineJoin = 'round';
    const ear = (sx) => { g.beginPath(); if (f.ears === 'ROUND') { g.arc(cx + sx * 0.62 * s, cy - 0.62 * s, 0.26 * s, 0, 7); } else { g.moveTo(cx + sx * 0.3 * s, cy - 0.6 * s); g.lineTo(cx + sx * 0.78 * s, cy - 1.25 * s); g.lineTo(cx + sx * 0.82 * s, cy - 0.35 * s); g.closePath(); } g.fillStyle = fur; g.fill(); g.stroke();
      if (f.ears === 'TORN' && sx > 0) { g.fillStyle = pencil ? '#f3efe6' : CREAM; g.beginPath(); g.arc(cx + 0.74 * s, cy - 1.0 * s, 0.13 * s, 0, 7); g.fill(); } };
    if (f.extra !== 'HOOD') { ear(-1); ear(1); }
    if (f.extra === 'HOOD') { g.fillStyle = pencil ? '#9a968e' : '#3a2f4a'; g.beginPath(); g.ellipse(cx, cy - 0.05 * s, 1.0 * s, 1.08 * s, 0, Math.PI, 0); g.lineTo(cx + 1.0 * s, cy + 0.5 * s); g.lineTo(cx - 1.0 * s, cy + 0.5 * s); g.closePath(); g.fill(); g.stroke(); }
    g.fillStyle = fur; g.beginPath(); g.moveTo(cx - 0.78 * s, cy - 0.35 * s); g.quadraticCurveTo(cx - 0.8 * s, cy + 0.5 * s, cx, cy + 0.95 * s); g.quadraticCurveTo(cx + 0.8 * s, cy + 0.5 * s, cx + 0.78 * s, cy - 0.35 * s); g.quadraticCurveTo(cx, cy - 0.85 * s, cx - 0.78 * s, cy - 0.35 * s); g.fill(); g.stroke();
    g.fillStyle = pencil ? '#f3efe6' : '#f6ead8'; g.beginPath(); g.moveTo(cx - 0.42 * s, cy + 0.18 * s); g.quadraticCurveTo(cx, cy + 0.08 * s, cx + 0.42 * s, cy + 0.18 * s); g.quadraticCurveTo(cx + 0.2 * s, cy + 0.85 * s, cx, cy + 0.92 * s); g.quadraticCurveTo(cx - 0.2 * s, cy + 0.85 * s, cx - 0.42 * s, cy + 0.18 * s); g.fill(); g.stroke();
    g.fillStyle = ink; g.beginPath(); g.ellipse(cx, cy + 0.52 * s, 0.1 * s, 0.07 * s, 0, 0, 7); g.fill();
    const eye = sx => { const ex = cx + sx * 0.34 * s, ey = cy - 0.08 * s; if (f.eyes === 'PATCH' && sx < 0) { g.fillStyle = ink; g.beginPath(); g.ellipse(ex, ey, 0.19 * s, 0.15 * s, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(cx - 0.75 * s, cy - 0.45 * s); g.lineTo(cx + 0.7 * s, cy - 0.32 * s); g.stroke(); return; }
      if (f.eyes === 'BIG') { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ex, ey, 0.15 * s, 0, 7); g.fill(); g.stroke(); g.fillStyle = ink; g.beginPath(); g.arc(ex, ey + 0.02 * s, 0.07 * s, 0, 7); g.fill(); }
      else { g.fillStyle = ink; g.beginPath(); g.moveTo(ex - 0.15 * s, ey + (f.eyes === 'SHARP' ? -0.03 * sx * 0 : 0)); g.quadraticCurveTo(ex, ey - 0.09 * s, ex + 0.15 * s, ey); g.quadraticCurveTo(ex, ey + 0.06 * s, ex - 0.15 * s, ey); g.fill(); g.beginPath(); g.moveTo(ex - 0.17 * s * sx, ey - 0.2 * s); g.lineTo(ex + 0.15 * s * sx, ey - 0.12 * s); g.stroke(); } };
    eye(-1); eye(1);
    g.beginPath(); const my = cy + 0.7 * s; if (f.mouth === 'GRIN') { g.moveTo(cx - 0.25 * s, my - 0.04 * s); g.quadraticCurveTo(cx, my + 0.14 * s, cx + 0.25 * s, my - 0.04 * s); } else if (f.mouth === 'FROWN') { g.moveTo(cx - 0.2 * s, my + 0.06 * s); g.quadraticCurveTo(cx, my - 0.06 * s, cx + 0.2 * s, my + 0.06 * s); } else { g.moveTo(cx - 0.22 * s, my); g.lineTo(cx + 0.22 * s, my); } g.stroke();
    if (f.mouth === 'GAP TOOTH') { g.fillStyle = '#ffffff'; g.fillRect(cx - 0.12 * s, my, 0.08 * s, 0.09 * s); g.fillRect(cx + 0.04 * s, my, 0.08 * s, 0.09 * s); g.strokeRect(cx - 0.12 * s, my, 0.08 * s, 0.09 * s); g.strokeRect(cx + 0.04 * s, my, 0.08 * s, 0.09 * s); }
    if (f.extra === 'SCAR') { g.strokeStyle = pencil ? '#3a3a3a' : '#a02020'; g.beginPath(); g.moveTo(cx + 0.28 * s, cy + 0.12 * s); g.lineTo(cx + 0.58 * s, cy + 0.48 * s); g.stroke(); for (let k = 0; k < 3; k++) { const t = 0.25 + k * 0.25, x = cx + (0.28 + 0.3 * t) * s, y = cy + (0.12 + 0.36 * t) * s; g.beginPath(); g.moveTo(x - 0.06 * s, y + 0.04 * s); g.lineTo(x + 0.06 * s, y - 0.04 * s); g.stroke(); } g.strokeStyle = ink; }
    if (f.extra === 'BANDANA') { g.fillStyle = pencil ? '#8a867e' : '#c42d3c'; g.beginPath(); g.moveTo(cx - 0.8 * s, cy - 0.32 * s); g.quadraticCurveTo(cx, cy - 0.95 * s, cx + 0.8 * s, cy - 0.32 * s); g.lineTo(cx + 0.7 * s, cy - 0.2 * s); g.quadraticCurveTo(cx, cy - 0.6 * s, cx - 0.7 * s, cy - 0.2 * s); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(cx + 0.72 * s, cy - 0.3 * s); g.lineTo(cx + 1.0 * s, cy - 0.1 * s); g.lineTo(cx + 0.92 * s, cy - 0.42 * s); g.closePath(); g.fill(); g.stroke(); }
    if (f.extra === 'GOGGLES') { g.fillStyle = pencil ? '#b8b4ac' : '#7fb6e0'; for (const sx of [-1, 1]) { g.beginPath(); g.arc(cx + sx * 0.3 * s, cy - 0.5 * s, 0.16 * s, 0, 7); g.fill(); g.stroke(); } g.beginPath(); g.moveTo(cx - 0.78 * s, cy - 0.45 * s); g.lineTo(cx - 0.46 * s, cy - 0.5 * s); g.moveTo(cx - 0.14 * s, cy - 0.5 * s); g.lineTo(cx + 0.14 * s, cy - 0.5 * s); g.moveTo(cx + 0.46 * s, cy - 0.5 * s); g.lineTo(cx + 0.78 * s, cy - 0.45 * s); g.stroke(); } }
  const posterT = v => CT(160, 200, (g, W, H) => { g.fillStyle = CREAM; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6); g.fillStyle = RED; g.fillRect(6, 6, W - 12, 28); g.fillStyle = '#ffffff'; g.font = '900 22px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('WANTED', 14, 21);
    drawFace(g, v.f, W / 2, 104, 44, false); g.fillStyle = INK; g.font = '900 14px Archivo, sans-serif'; g.fillText('REWARD 50 G', 14, H - 18); });
  const POST = VILL.map(v => ({ ...v, tex: posterT(v) }));
  const FR = POST.map((v, i) => ({ i, x: -102.2 + i * 1.1, y: 2.45, k: null }));
  for (const f of FR) { S.box(0.8, 0.98, 0.03, INK, f.x, f.y, -94.77); S.box(0.72, 0.9, 0.035, '#c9a874', f.x, f.y, -94.765); }
  const tagT = FR.map(() => CT(256, 64, () => {})), drawTags = () => FR.forEach((f, i) => redrawT(tagT[i], (g, W, H) => { const v = POST.find(q => q.k === f.k); g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6); g.fillStyle = INK; g.textBaseline = 'middle'; fitTxt(g, v ? v.n : '', 12, 22, W - 24, 26); g.fillStyle = RED; fitTxt(g, v ? v.clue : '', 12, 46, W - 24, 18, 800); }));
  FR.forEach((f, i) => plane(tagT[i], 0.86, 0.22, f.x, 1.78, -94.76, 0));
  const posterM = POST.map(v => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.82), new THREE.MeshBasicMaterial({ map: v.tex })); G.add(m); return { v, m, on: null }; });
  const pinP = (p, f) => { p.on = f; p.m.position.set(f.x, f.y, -94.74); p.m.rotation.set(0, 0, rnd(-0.04, 0.04)); };
  const frameOrder = () => FR.forEach((f, i) => { f.k = POST[i].k; });
  { frameOrder(); posterM.forEach((p, i) => pinP(p, FR[i])); drawTags(); }
  // ================= JOB STATIONS =================
  const RINGS = { desk: [-83.6, -91.1], mugshot: [-104.3, -87.0], wanted: [-100, -93.2], sketch: [-71, -90.3], feed: [-64.4, -99.5], watch: [-86, -97.4], finger: [-97, -93.7], evidence: [-78, -95.3], cctv: [-92, -118.3], dispatch: [-77, -118.3], parking: [-91.6, -77.3], k9: [-81.4, -77.3] };
  const DOWN = { finger: 1, evidence: 1, cctv: 1, dispatch: 1 }, OUT = { parking: 1, k9: 1 };
  for (const [k, [x, z]] of Object.entries(RINGS)) { const y = DOWN[k] ? Y + 0.085 : OUT[k] ? 0.17 : 0.085, B = DOWN[k] ? SD : S; B.cyl(0.5, 0.5, 0.012, YEL, x, y, z, 22); B.cyl(0.42, 0.42, 0.014, INK, x, y + 0.002, z, 22); }
  // front desk: the cash drawer behind the glass (1 · 5 · 10), a receipt + the PAID stamp
  const DRW = [1, 5, 10].map((v, i) => ({ v, p: V(-84.1 + i * 0.5, 1.22, -89.78) }));
  S.box(1.5, 0.05, 0.36, WOOD, -83.6, 1.2, -89.78); for (let i = 0; i < 2; i++) S.box(0.02, 0.05, 0.34, INK, -83.85 + i * 0.5, 1.24, -89.78);
  const COINC = { 1: '#b87333', 5: '#c9ced3', 10: BARG }, coinR = { 1: 0.045, 5: 0.055, 10: 0.065 };
  DRW.forEach(d => { for (let k = 0; k < 4; k++) S.cyl(coinR[d.v], coinR[d.v], 0.012, COINC[d.v], d.p.x - 0.07 + (k % 2) * 0.14, 1.23 + (k / 2 | 0) * 0.013, d.p.z, 12); });
  DRW.forEach(d => { const t = CT(96, 48, (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6); g.fillStyle = INK; g.font = '900 28px Archivo, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(d.v + ' G', W / 2, H / 2 + 2); }); const m = plane(t, 0.2, 0.1, d.p.x, 1.28, d.p.z - 0.2, Math.PI); m.rotation.x = -0.6; });
  S.box(0.12, 0.1, 0.1, '#5a3d26', -85.0, 1.24, -89.75); S.box(0.1, 0.02, 0.08, RED, -85.0, 1.19, -89.75);
  const RECP = V(-84.7, 1.195, -89.55);
  // holding cells between cell 1 + cell 2 (x -94..-78): bars, a dividing wall, bunks, meal slots
  for (let x = -93.75; x <= -78.2; x += 0.5) S.cyl(0.04, 0.04, 3.4, DSTEEL, x, 1.7, -116, 8);
  for (const y of [0.1, 1.2, 3.4]) S.box(16, 0.12, 0.12, DSTEEL, -86, y, -116); for (const cx of [-90, -82]) { S.box(0.16, 0.24, 0.14, '#3f4854', cx + 0.7, 1.2, -116); S.box(0.5, 0.06, 0.18, STEEL, cx, 1.05, -116); S.box(1.7, 0.1, 0.12, DSTEEL, cx, 2.3, -116); for (const s of [-0.85, 0.85]) S.box(0.1, 3.4, 0.14, DSTEEL, cx + s, 1.7, -116); }
  S.box(0.3, 3.5, 8.6, '#b9b4ac', -86, 1.75, -120.3); S.box(0.32, 0.9, 8.6, '#9a958d', -86, 0.45, -120.3); rect(-94, -78, -116.12, -115.88); rect(-86.15, -85.85, -124.6, -116);
  for (const cx of [-90, -82]) { S.box(2.8, 0.1, 1.1, '#7c8794', cx - 1.2, 0.5, -123.6); S.box(2.7, 0.16, 1.0, '#e6e1d3', cx - 1.2, 0.63, -123.6); S.box(0.5, 0.12, 0.7, WHITE, cx - 2.2, 0.76, -123.6); S.box(1.2, 0.05, 1.02, '#e8762a', cx - 0.7, 0.73, -123.6); rect(cx - 2.6, cx + 0.2, -124.2, -123.0); }
  // feed: the kitchen hatch on the east wall (4 trays wait on the shelf)
  S.box(0.12, 1.3, 1.8, DSTEEL, -62.5, 1.4, -99.5); S.box(0.04, 1.0, 1.5, '#1a1c1e', -62.43, 1.45, -99.5); S.box(0.6, 0.05, 1.7, STEEL, -62.75, 0.98, -99.5);
  plane(CT(256, 48, (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = '#ffd23a'; g.font = '900 28px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('KITCHEN \u00b7 MEALS', 12, H / 2 + 2); }), 1.4, 0.26, -62.6, 2.3, -99.5, -Math.PI / 2);
  const MEALS = [{ k: 'SOUP', c: '#e0a030' }, { k: 'STEW', c: '#8a4a2a' }, { k: 'PORRIDGE', c: '#efe3c4' }, { k: 'SANDWICH', c: '#d8b070' }];
  const trayMesh = meal => { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.3), LM(STEEL)); g.add(b); const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.07, 12), LM(WHITE)); bowl.position.set(-0.08, 0.05, 0); g.add(bowl);
    const f = new THREE.Mesh(meal.k === 'SANDWICH' ? new THREE.BoxGeometry(0.16, 0.05, 0.12) : new THREE.CylinderGeometry(0.085, 0.085, 0.01, 12), LM(meal.c)); f.position.set(meal.k === 'SANDWICH' ? 0.1 : -0.08, meal.k === 'SANDWICH' ? 0.045 : 0.085, 0); g.add(f); const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.08, 8), LM(NAVY)); cup.position.set(0.14, 0.055, 0.08); g.add(cup); return g; };
  const hatchTrays = MEALS.map((m, i) => { const t = trayMesh(m); t.position.set(-62.8, 1.02, -100.2 + i * 0.46); t.rotation.y = Math.PI / 2; G.add(t); return t; });
  // CCTV ROOM (downstairs, west of the new divider): 4 big screens on the south wall, the desk, a server rack, little static monitors
  const SCX = [-96.95, -93.65, -90.35, -87.05], SCY = Y + 1.85, SCZ = -122.84, SCW = 3.0, SCH = 1.875;
  SD.box(14.4, 0.012, 7, '#1d2433', -92, Y + 0.03, -118.4); for (const x of SCX) SD.box(SCW + 0.14, SCH + 0.14, 0.08, INK, x, SCY, -122.92);
  SD.box(13.2, 0.1, 0.2, '#3f4854', -92, SCY + SCH / 2 + 0.22, -122.86);
  SD.box(8.4, 0.78, 0.8, '#3f4854', -92, Y + 0.39, -119.5); SD.box(8.44, 0.04, 0.84, INK, -92, Y + 0.8, -119.5); SD.box(0.9, 0.03, 0.3, INK, -92, Y + 0.83, -119.3); SD.cyl(0.06, 0.08, 0.06, INK, -91.2, Y + 0.85, -119.4, 10); SD.cyl(0.02, 0.02, 0.18, '#3f4854', -91.2, Y + 0.95, -119.4, 6); SD.sph(0.035, RED, -91.2, Y + 1.05, -119.4);
  SD.cyl(0.05, 0.045, 0.1, WHITE, -93.4, Y + 0.87, -119.3, 10); rect(-96.2, -87.8, -119.92, -119.08, Y - 1, -0.8);
  for (const x of [-95.4, -88.6]) { SD.box(0.62, 0.42, 0.06, INK, x, Y + 1.1, -119.75); SD.box(0.06, 0.24, 0.06, INK, x, Y + 0.92, -119.75); }
  const staticT = CT(64, 40, (g, W, H) => { for (let i = 0; i < W; i += 2) for (let j = 0; j < H; j += 2) { const v = Math.random() * 200 | 0; g.fillStyle = 'rgb(' + v + ',' + v + ',' + (v + 20) + ')'; g.fillRect(i, j, 2, 2); } });
  for (const x of [-95.4, -88.6]) plane(staticT, 0.56, 0.36, x, Y + 1.1, -119.71, 0);
  SD.box(1.0, 2.6, 0.8, INK, -99.3, Y + 1.3, -114.4); for (let k = 0; k < 8; k++) SD.box(0.9, 0.06, 0.02, '#3f4854', -99.3, Y + 0.5 + k * 0.28, -113.99); rect(-99.8, -98.8, -114.8, -114.0, Y - 1, -0.8);
  const rackLED = pts([...Array(16)].map((_, k) => [-99.6 + (k % 4) * 0.12, Y + 0.56 + (k / 4 | 0) * 0.56, -113.96]), 0.07, '#7cff9b', 1); rackLED.renderOrder = -2;
  { const ch = (x, z) => { SD.box(0.5, 0.08, 0.5, INK, x, Y + 0.5, z); SD.box(0.5, 0.6, 0.06, INK, x, Y + 0.85, z + 0.25); SD.cyl(0.03, 0.03, 0.45, '#3f4854', x, Y + 0.24, z, 6); }; ch(-94.6, -117.9); }
  // DISPATCH (east of the divider): the wall map of the real town, the console (radio, headset, blinking lights)
  const MAPX = -77, MAPY = Y + 1.85, MAPZ = -122.84, MAPW = 5.6, MAPH = 2.8;
  SD.box(MAPW + 0.2, MAPH + 0.2, 0.08, INK, MAPX, MAPY, -122.92); SD.box(6.4, 0.78, 0.8, '#3f4854', MAPX, Y + 0.39, -119.5); SD.box(6.44, 0.04, 0.84, INK, MAPX, Y + 0.8, -119.5); rect(MAPX - 3.2, MAPX + 3.2, -119.92, -119.08, Y - 1, -0.8);
  SD.box(0.5, 0.22, 0.32, '#3f4854', MAPX - 1.6, Y + 0.93, -119.6); SD.cyl(0.03, 0.03, 0.3, INK, MAPX - 1.25, Y + 0.97, -119.5, 6); SD.sph(0.05, INK, MAPX - 1.25, Y + 1.14, -119.5); SD.put(new THREE.TorusGeometry(0.1, 0.02, 6, 14, Math.PI), MAPX + 1.3, Y + 0.92, -119.5, INK);
  SD.box(1.6, 0.5, 0.08, INK, MAPX + 0.4, Y + 1.1, -119.85);
  const dispLED = pts([...Array(18)].map((_, k) => [MAPX - 0.3 + (k % 9) * 0.165, Y + 1.0 + (k / 9 | 0) * 0.2, -119.8]), 0.08, '#ffd23a', 1); dispLED.renderOrder = -2;
  // the new rooms' ceiling lights (same strip lights as the evidence room)
  for (const [x, z] of [[-96, -115.5], [-89, -115.5], [-96, -120.5], [-89, -120.5], [-80, -115.5], [-74, -115.5], [-80, -120.5], [-74, -120.5]]) { SD.box(2.4, 0.08, 0.34, '#c0c4cc', x, TOPD - 0.06, z); GLO.box(2.3, 0.02, 0.26, '#f4f8ff', x, TOPD - 0.105, z); }
  // s150o WAY UP (Ben: "super hard to find my way back upstairs"): a lit EXIT · STAIRS UP sign over the stair foot, a beam of light on the stair,
  // and a trail of glowing yellow chevrons on the basement floor from every room (lab, evidence aisles, CCTV + dispatch) to the stair
  { const upT = CT(512, 160, (g, w, h) => { g.fillStyle = '#1f8a4c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#ffffff'; g.font = '900 64px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('\u2191 STAIRS UP', 34, 62); g.font = '800 30px Archivo, sans-serif'; g.fillText('EXIT \u00b7 FRONT DESK', 38, 122); });
    const upM = new THREE.MeshBasicMaterial({ map: upT, side: THREE.DoubleSide, toneMapped: false }); for (const [x, z, ry] of [[-85.1, -95.05, 0], [-85.1, -95.05, Math.PI]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.69), upM); m.position.set(x, Y + 2.35, z); m.rotation.y = ry; m.renderOrder = -2; G.add(m); }
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 3.2, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide })); beam.position.set(-85.1, Y + 1.6, -93.4); beam.renderOrder = -1; G.add(beam);
    const chevT = CT(128, 128, (g, w, h) => { g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(64, 14); g.lineTo(116, 70); g.lineTo(90, 70); g.lineTo(64, 42); g.lineTo(38, 70); g.lineTo(12, 70); g.closePath(); g.fill(); g.beginPath(); g.moveTo(64, 58); g.lineTo(116, 114); g.lineTo(90, 114); g.lineTo(64, 86); g.lineTo(38, 114); g.lineTo(12, 114); g.closePath(); g.fill(); });
    const chevM = new THREE.MeshBasicMaterial({ map: chevT, transparent: true, depthWrite: false, toneMapped: false }), chevs = [];
    const trail = pts => { for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.floor(L / 1.6)), yaw = Math.atan2(x1 - x0, z1 - z0);
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), chevM.clone()); m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2, yaw + Math.PI, 0); m.position.set(x0 + (x1 - x0) * u, Y + 0.035, z0 + (z1 - z0) * u); m.renderOrder = -1; G.add(m); chevs.push({ m, d: chevs.length }); } } };
    trail([[-85.1, -121.5], [-85.1, -95.6]]); trail([[-97.5, -95.6], [-86.2, -95.6]]); trail([[-72.5, -118.5], [-84.0, -118.5], [-84.0, -96.2]]); trail([[-96, -118.5], [-86.2, -118.5]]);
    G.userData.upChev = chevs; }
  // fingerprint card on the lab bench (5 boxes) + an ink pad
  const fpT = CT(512, 340, () => {}); const fpCard = flatP(fpT, 0.62, 0.42, -97.25, Y + 0.957, -92.45, Math.PI); fpCard.renderOrder = -2;
  SD.box(0.2, 0.03, 0.14, INK, -96.62, Y + 0.965, -92.68); SD.box(0.17, 0.006, 0.11, '#1a1c3a', -96.62, Y + 0.982, -92.68);
  const FPBOX = [0, 1, 2, 3, 4].map(i => { const cxp = 16 + i * 98 + 45, cyp = 215, u = cxp / 512, v = cyp / 340; return { i, cx: cxp, cy: cyp, p: V(-97.25 + 0.31 - u * 0.62, Y + 0.96, -92.45 + 0.21 - v * 0.42) }; });
  const INKP = V(-96.62, Y + 0.99, -92.68);
  // the sketch artist's table (lobby east): table, a sketch pad, a pencil pot, two chairs
  S.box(1.6, 0.06, 0.9, WOOD, -71, 0.76, -91.85); for (const [dx, dz] of [[-0.72, -0.38], [0.72, -0.38], [-0.72, 0.38], [0.72, 0.38]]) S.box(0.06, 0.74, 0.06, INK, -71 + dx, 0.37, -91.85 + dz); rect(-71.8, -70.2, -92.3, -91.4);
  S.cyl(0.05, 0.05, 0.12, NAVY, -70.4, 0.85, -91.6, 10); for (let k = 0; k < 3; k++) S.cyl(0.008, 0.008, 0.2, ['#ffd23a', RED, INK][k], -70.42 + k * 0.02, 0.98, -91.6, 5);
  for (const z of [-93.15]) { S.box(0.5, 0.06, 0.5, NAVY, -71, 0.46, z); S.box(0.5, 0.55, 0.06, NAVY, -71, 0.75, z - 0.25); }
  const padT = CT(256, 320, () => {}); flatP(padT, 0.5, 0.62, -71, 0.795, -91.85, 0);
  // parking: 8 bays along the front (4 each side of the door), 4 painted red
  const BAYS = [-107, -103.2, -99.4, -95.6, -76.4, -72.6, -68.8, -65].map((x, i) => ({ i, x, z: -77.2, red: [1, 3, 4, 7].includes(i) }));
  for (const b of BAYS) { for (const s of [-1.8, 1.8]) S.box(0.1, 0.012, 4.8, b.red ? RED : WHITE, b.x + s, 0.165, b.z); S.box(3.7, 0.012, 0.1, b.red ? RED : WHITE, b.x, 0.165, b.z + 2.4);
    if (b.red) for (let k = 0; k < 5; k++) S.box(0.12, 0.012, 1.6, RED, b.x - 1.2 + k * 0.6, 0.166, b.z + 0.4, 0.7); }
  { const hx = -105.1, hz = -79.4; S.cyl(0.14, 0.16, 0.6, RED, hx, 0.3, hz, 10); S.sph(0.15, RED, hx, 0.62, hz); S.cyl(0.05, 0.05, 0.36, '#c42d3c', hx, 0.4, hz, 6, 0, Math.PI / 2); ringC(hx, hz, 0.25); }
  // Duke's kennel (east of the door) + a K-9 sign
  { const kx = -78.6, kz = -79.0; S.box(1.1, 0.7, 0.9, NAVY, kx, 0.5, kz); S.put(new THREE.ConeGeometry(0.85, 0.5, 4), kx, 1.1, kz, '#16263c', Math.PI / 4); S.box(0.5, 0.5, 0.02, INK, kx, 0.45, kz + 0.46); rect(kx - 0.6, kx + 0.6, kz - 0.5, kz + 0.5);
    S.cyl(0.14, 0.12, 0.06, DSTEEL, kx + 0.9, 0.2, kz + 0.2, 12); }
  // ---------- merge ----------
  G.add(new THREE.Mesh(S.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  { const m = new THREE.Mesh(SD.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })); m.renderOrder = -2; G.add(m); }
  { const m = new THREE.Mesh(GLO.geo(), new THREE.MeshBasicMaterial({ vertexColors: true })); m.renderOrder = -2; G.add(m); }
  // CCTV screens (live render targets when you are in the room) + an overlay per screen (label, REC, clock, motion border)
  const standbyT = CT(128, 80, (g, W, H) => { g.fillStyle = '#0d1420'; g.fillRect(0, 0, W, H); g.fillStyle = '#2f6fd6'; g.font = '900 12px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('NO SIGNAL', 10, H / 2); });
  const SCR = SCX.map((x, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(SCW, SCH), new THREE.MeshBasicMaterial({ map: standbyT })); m.position.set(x, SCY, SCZ); m.renderOrder = -2; G.add(m);
    const ot = CT(320, 200, () => {}), o = new THREE.Mesh(new THREE.PlaneGeometry(SCW, SCH), new THREE.MeshBasicMaterial({ map: ot, transparent: true, depthWrite: false })); o.position.set(x, SCY, SCZ + 0.012); o.renderOrder = -2; G.add(o); return { i, m, ot, alert: 0 }; });
  const drawOverlay = (s, t, live) => redrawT(s.ot, (g, W, H) => { g.clearRect(0, 0, W, H); if (live) { g.fillStyle = 'rgba(0,0,0,0.06)'; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 2); }
    g.fillStyle = 'rgba(13,15,12,0.75)'; g.fillRect(8, 8, 150, 24); g.fillStyle = '#ffffff'; g.font = '900 15px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('CAM ' + (s.i + 1) + ' \u00b7 ' + (cctvNames[s.i] || ''), 14, 21);
    if (live) { if ((t * 2 | 0) % 2) { g.fillStyle = '#ff3a2a'; g.beginPath(); g.arc(W - 46, 20, 7, 0, 7); g.fill(); } g.fillStyle = '#ffffff'; g.font = '900 13px Archivo, sans-serif'; g.fillText('REC', W - 34, 21);
      const h = hour0(), hh = Math.floor(h), mm = Math.floor((h - hh) * 60); g.fillStyle = 'rgba(13,15,12,0.75)'; g.fillRect(W - 96, H - 30, 88, 22); g.fillStyle = '#ffffff'; g.fillText(String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + ':' + String(Math.floor(t) % 60).padStart(2, '0'), W - 90, H - 19); }
    if (s.alert > 0) { g.strokeStyle = (t * 4 | 0) % 2 ? '#ffd23a' : '#ec3013'; g.lineWidth = 12; g.strokeRect(6, 6, W - 12, H - 12); g.fillStyle = '#ffd23a'; g.fillRect(8, H - 34, 130, 26); g.fillStyle = INK; g.font = '900 15px Archivo, sans-serif'; g.fillText('MOTION!', 16, H - 21); }
    if (s.rew) { g.fillStyle = 'rgba(236,48,19,0.85)'; g.fillRect(W / 2 - 70, H / 2 - 18, 140, 36); g.fillStyle = '#ffffff'; g.font = '900 18px Archivo, sans-serif'; g.fillText(s.rew, W / 2 - 60, H / 2 + 1); } });
  const cctvNames = ['MARKET', 'BANK QUEUE', 'FOUNTAIN', 'MINIMART']; SCR.forEach(s => drawOverlay(s, 0, false));
  // the DISPATCH map: the real town, drawn from worlds/meru2-layout.js (moved buildings in their new places)
  const mapT = CT(1024, 512, () => {}); { const m = plane(mapT, MAPW, MAPH, MAPX, MAPY, MAPZ, 0); m.renderOrder = -2; }
  const TOWN = BUILDINGS.filter(b => b.f && b.label && Math.abs((b.f[0] + b.f[1]) / 2) < 330 && Math.abs((b.f[2] + b.f[3]) / 2) < 330);
  const MB = (() => { let a = 1e9, b = -1e9, c = 1e9, d = -1e9; for (const t of TOWN) { a = Math.min(a, t.f[0]); b = Math.max(b, t.f[1]); c = Math.min(c, t.f[2]); d = Math.max(d, t.f[3]); } const pad = 20; return [a - pad, b + pad, c - pad, d + pad]; })();
  const toMap = (x, z) => { const sx = (MB[1] - MB[0]) / 1024, sz = (MB[3] - MB[2]) / 512, s = Math.max(sx, sz), ox = (1024 - (MB[1] - MB[0]) / s) / 2, oz = (512 - (MB[3] - MB[2]) / s) / 2; return [ox + (x - MB[0]) / s, oz + (z - MB[2]) / s]; };
  function drawMap(J) { redrawT(mapT, (g, W, H) => { g.fillStyle = '#e9e6df'; g.fillRect(0, 0, W, H); g.strokeStyle = '#cfcac3'; g.lineWidth = 1; for (let x = 0; x < W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      for (const b of TOWN) { const [a, c] = toMap(b.f[0], b.f[2]), [bb, d] = toMap(b.f[1], b.f[3]); g.fillStyle = b.key === 'police' ? NAVY : '#b9b4ac'; g.fillRect(a, c, bb - a, d - c); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(a, c, bb - a, d - c); }
      g.fillStyle = INK; g.font = '900 13px Archivo, sans-serif'; g.textBaseline = 'middle'; for (const b of TOWN) { if ((b.f[1] - b.f[0]) * (b.f[3] - b.f[2]) < 1400) continue; const [x, y] = toMap((b.f[0] + b.f[1]) / 2, (b.f[2] + b.f[3]) / 2); g.fillStyle = b.key === 'police' ? '#ffd23a' : INK; g.fillText(b.label.toUpperCase().slice(0, 14), x - 34, y); }
      g.fillStyle = NAVY; g.fillRect(0, 0, W, 34); g.fillStyle = '#ffffff'; g.font = '900 20px Archivo, sans-serif'; g.fillText('MERU POLICE \u00b7 DISPATCH', 12, 18);
      if (!J) return; const t = performance.now() / 1000;
      for (const c of J.calls) { if (c.st === 'wait') continue; const [x, y] = toMap(c.x, c.z); const live = c.st === 'live', ok = c.st === 'done'; if (live && (t * 3 | 0) % 2) { g.strokeStyle = RED; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 26, 0, 7); g.stroke(); }
        g.fillStyle = ok ? GREEN : live ? RED : '#ffd23a'; g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.fillStyle = '#ffffff'; g.font = '900 15px Archivo, sans-serif'; g.fillText(ok ? '\u2713' : '!', x - 4, y + 1); }
      for (const c of J.cars) { const [x, y] = toMap(c.x, c.z); if (c.route) { const [tx, ty] = toMap(c.route.to[0], c.route.to[1]); g.strokeStyle = NAVY; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(x, y); g.lineTo(tx, ty); g.stroke(); g.setLineDash([]); }
        g.fillStyle = c.busy > 0 || c.route ? '#5c6670' : NAVY; g.fillRect(x - 20, y - 14, 40, 28); g.strokeStyle = '#ffd23a'; g.lineWidth = 3; g.strokeRect(x - 20, y - 14, 40, 28); g.fillStyle = '#ffffff'; g.font = '900 16px Archivo, sans-serif'; g.fillText('C' + c.n, x - 11, y + 1); } }); }
  drawMap(null);
  // ================= keepers =================
  const chief = kit.makeFox({ key: 'policeChief', torso: [NAVY, GOLD, NAVYD], outfit: 'coat', mood: 'stern', look: { elder: 1, fur: '#9a8a7a', furDark: '#5a4e44', muzzle: '#efe8de' } });
  dressFox(THREE, chief, ['police', NAVYD]); chief.scale.setScalar(1.05);
  const CH0 = [-80.6, -87.4, -0.5]; chief.position.set(CH0[0], 0, CH0[1]); chief.rotation.y = CH0[2]; G.add(chief); ringC(CH0[0], CH0[1], 0.5);
  const knox = PR && PR.guard; if (knox && !knox.name) knox.name = 'policeKnox';
  const mkPris = (key, x, z, ry, look) => { const f = kit.makeFox({ key, torso: [ORANGE, '#c45a1a', '#7a3a10'], outfit: 'suit', mood: look.mood || 'neutral', look: look.look || {} }); f.position.set(x, 0, z); f.rotation.y = ry; G.add(f); return f; };
  const jack = mkPris('oldJack', -73.4, -117.3, 0, { mood: 'warm', look: { elder: 1, fur: '#a8a29a', furDark: '#6a6560', muzzle: '#f2ece2' } });
  const mutt = mkPris('prisonerMutt', -90.4, -118.2, 0.2, { mood: 'sad', look: { fur: '#8a5a3a', furDark: '#5a3a24' } }), scraps = mkPris('prisonerScraps', -81.6, -119.0, -0.3, { mood: 'smug', look: { fur: '#c9a874', furDark: '#8a6a44' } });
  const PRIS = [{ k: 'jack', n: 'OLD JACK', f: jack, home: [-73.4, -117.3, 0], slot: [-73, -115.3] }, { k: 'mutt', n: 'MUTT', f: mutt, home: [-90.4, -118.2, 0.2], slot: [-90, -115.3] }, { k: 'scraps', n: 'SCRAPS', f: scraps, home: [-81.6, -119.0, -0.3], slot: [-82, -115.3] }];
  const grumble = kit.makeFox({ key: 'benchGrumble', torso: ['#7a5a3a', '#5a3d26', '#3d2a1c'], outfit: 'vest', mood: 'sad', look: { fur: '#b07a4a', furDark: '#7a4a2a' } }); grumble.position.set(-108.75, 0.02, -104.6); grumble.rotation.y = Math.PI / 2; G.add(grumble);
  const seat = f => { const P = f.userData && f.userData.P; if (P && P.legs) P.legs.forEach(l => { l.rotation.x = -1.45; }); };
  const kwT = { key: 'policeChief', name: 'Chief Barkley', role: 'MERU POLICE', obj: chief, ry: CH0[2], r: 3 }, kwE = { key: 'policeChiefEnd', name: 'Chief Barkley', role: 'MERU POLICE', obj: chief, ry: CH0[2], r: 7 };
  const knT = { key: 'policeKnox', name: 'Sgt. Knox', role: 'THE CELLS', obj: knox || chief, ry: 0, r: 3.2 }, knE = { key: 'policeKnoxEnd', name: 'Sgt. Knox', role: 'THE CELLS', obj: knox || chief, ry: 0, r: 8 };
  const jkT = { key: 'policeJack', name: 'Old Jack', role: 'CELL 2', obj: jack, ry: 0, r: 3.2 };
  const lnC = text => ({ who: 'chief barkley', role: 'MERU POLICE', text }), lnK = text => ({ who: 'sgt. knox', role: 'THE CELLS', text }), lnJ = text => ({ who: 'old jack', role: 'CELL 2', text });
  const GAMES = [{ k: 'desk', name: 'Front Desk', color: NAVY, gold: 22 }, { k: 'mugshot', name: 'Mugshot', color: '#5c6670', gold: 22 }, { k: 'finger', name: 'Fingerprints', color: '#1a1c3a', gold: 22, down: 1 },
    { k: 'wanted', name: 'Wanted Posters', color: RED, gold: 20 }, { k: 'evidence', name: 'Evidence Room', color: '#9a7550', gold: 24, down: 1, walk: true }, { k: 'cctv', name: 'CCTV Room', color: '#2f6fd6', gold: 30, down: 1 },
    { k: 'dispatch', name: 'Dispatch', color: '#ffd23a', gold: 26, down: 1 }, { k: 'feed', name: 'Feed the Prisoners', color: ORANGE, gold: 22, walk: true, jail: 1 }, { k: 'sketch', name: 'Sketch Artist', color: '#3a3a3a', gold: 22 },
    { k: 'parking', name: 'Parking Tickets', color: '#c42d3c', gold: 20, walk: true }, { k: 'k9', name: 'K-9 Training', color: '#b07a3a', gold: 28, walk: true }, { k: 'watch', name: 'Night Watch', color: '#3f4854', gold: 26, walk: true, jail: 1 }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const rFox = rosterFoxes({ THREE, kit, cap: 4 }), cFox = rosterFoxes({ THREE, kit, cap: 3 }); let endClear = 0, custN = 0, lastCus = null;
  const pickCus = () => { const pool = ROSTER.filter(r => r !== lastCus && r.work !== 'Police'); const r = pool[(custN++ * 7 + (Math.random() * 5 | 0)) % pool.length]; lastCus = r; return r; };
  const putCus = (x, y, z, ry) => { const r = pickCus(), f = cFox(r, G); f.visible = true; f.scale.setScalar(1); f.position.set(x, y, z); f.rotation.y = ry; f.traverse(o => { o.renderOrder = y < -1 ? -2 : 0; }); J.cf = f; J.C = { name: r.name.toUpperCase(), r }; return r; };
  const visitors = h => (h >= 7 && h < 21 ? dueAt('police', h) : []);
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'pd', color: NAVY, boardTitle: "Chief Barkley's best", toWorld: toW,
    room: { X0: -109.6, X1: -62.4, Z0: -94.6, Z1: -80.4 }, door: [-86, -80.8], keeper: chief, keeperRy: CH0[2], games: GAMES, board: { x: -80.4, y: 3.3, z: -80.34, ry: Math.PI, w: 1.15 }, clock: { x: -91.6, y: 3.4, z: -80.34, ry: Math.PI }, hiring: { x: -89.6, z: -81.7, ry: Math.PI / 2 }, hiringLine: 'WALK UP \u00b7 START WORK',
    sun: [{ x: -86, z: -81.8, w: 3.6, d: 2.4 }, { x: -101.8, z: -81.8, w: 3.6, d: 2.2 }, { x: -95.2, z: -81.8, w: 3.6, d: 2.2 }, { x: -76.8, z: -81.8, w: 3.6, d: 2.2 }, { x: -70.2, z: -81.8, w: 3.6, d: 2.2 }],
    lamps: [[-102, 3.8, -84.5], [-86, 3.8, -84.5], [-70, 3.8, -84.5], [-102, 3.8, -91.5], [-70, 3.8, -91.5], [-89.9, 1.5, -89.7]],
    browse: [[-81.2, -93.4, Math.PI], [-64.4, -87.5, Math.PI / 2], [-97.4, -92.4, Math.PI], [-107.8, -91.0, -Math.PI / 2], [-88.2, -87.9, Math.PI], [-96.6, -86.2, 0]], slots: 2, visitors, visitorFox: r => rFox(r, G),
    onVisit: (e, inside) => { if (inside && !busy) toast(e.r.name.toUpperCase() + ' \u00b7 ' + e.r.role.toUpperCase() + ' \u00b7 ' + (e.kind === 'through' ? 'CHECKING IN' : 'REPORTING SOMETHING, ' + e.why), 2.4); } });
  let toastTxt = '', toastT = 0, talkedF = 0, talkedT = 0, busy = null, J = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = b; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), coin = (at = 0) => { tone(2400, 0.04, 0.15, 'triangle', at); tone(3200, 0.03, 0.12, 'triangle', at + 0.03); };
  const click = () => tone(2600, 0.04, 0.05, 'square'), clunk = () => { tone(110, 0.1, 0.35, 'square'); noise(0.25, 0.05, 400); }, swish = () => noise(0.2, 0.025, 2000), stampS = () => { tone(140, 0.09, 0.15, 'square'); noise(0.08, 0.04, 1200); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  const pick = document.createElement('div'); pick.style.cssText = card.style.cssText.replace(/pointer-events:\s*none/, 'pointer-events:auto'); document.body.appendChild(card); document.body.appendChild(pick); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; for (const el of [card, pick]) { el.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; el.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; el.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; el.style.zoom = short ? '0.85' : mid ? '0.82' : ''; } pick.style.overflowY = 'auto'; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + NAVY + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = (next, walk) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (walk ? 'CHIEF / KNOX \u00b7 STOP' : (touch ? '3' : 'SPACE') + ' \u00b7 STOP') + '</span></div>';
  const lst = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + items.map(([sw, t, r, ok]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (r ? ' \u00b7 ' + r : '') + '</span>').join('') + '</div>' : items.map(a => row(...a)).join('');
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>', big = (t, c = '#201e1d') => '<div style="font-size:30px;font-weight:900;line-height:1.1;color:' + c + '">' + t + '</div>';
  const quote = t => '<div style="font-size:14px;font-weight:800;line-height:1.35;border-left:0;padding:2px 0 6px">\u201c' + t + '\u201d</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const btnCss = (primary, on) => 'display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;min-height:48px;padding:0 12px;margin-top:6px;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left;cursor:pointer;background:' + (primary ? '#ec3013' : on ? '#201e1d' : '#f3f2f2') + ';color:' + (primary || on ? '#ffffff' : '#201e1d');
  let pickKey = ''; const showPick = (key, title, right, html, opts, grid) => { if (key === pickKey) return; pickKey = key; pick.innerHTML = head(title, right) + '<div style="padding:8px 10px 10px">' + (html || '') + '</div>'; const body = pick.lastChild;
    const wrap = document.createElement('div'); wrap.style.cssText = grid ? 'display:grid;grid-template-columns:repeat(' + grid + ',minmax(0,1fr));gap:6px' : ''; body.appendChild(wrap);
    opts.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = btnCss(o.primary, o.on) + (grid ? ';margin-top:0' : '') + (o.span && grid ? ';grid-column:1 / -1' : ''); b.innerHTML = '<span style="flex:1;min-width:0;white-space:normal">' + o.label + '</span>';
      b.addEventListener('click', e => { e.stopPropagation(); o.go(); }); b.addEventListener('pointerdown', e => e.stopPropagation()); wrap.appendChild(b); }); pick.style.display = 'block'; };
  const hidePick = () => { pick.style.display = 'none'; pick.innerHTML = ''; pickKey = ''; };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && (t.closest('button,a,input,[role="button"],[aria-label]') || pick.contains(t))) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && J && !GN[J.g].walk;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(toW(v)).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = V(), inv = new THREE.Matrix4();
  const ray = () => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); G.updateWorldMatrix(true, false); inv.copy(G.matrixWorld).invert(); return rc.ray.clone().applyMatrix4(inv); };
  const hitZ = z => ray().intersectPlane(new THREE.Plane(V(0, 0, 1), -z), hitP) ? hitP.clone() : null;
  const hitY = y => ray().intersectPlane(new THREE.Plane(V(0, 1, 0), -y), hitP) ? hitP.clone() : null;
  const wpos = o => { o.updateWorldMatrix(true, false); const w = o.getWorldPosition(V()); G.updateWorldMatrix(true, false); return G.worldToLocal(w); };
  const nearestOf = (list, posOf, k = 1.6) => { let best = null, bd = RAD() * k; for (const o of list) { const d = dist(scrW(posOf(o))); if (d < bd) { bd = d; best = o; } } return best; };
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of J.flies.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(F), 1); F.then && F.then(); } } }
  const own = o => { J.objs.push(o); G.add(o); if (J && J.down) o.traverse(q => { q.renderOrder = -2; }); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt + bg] || (tagTex[txt + bg] = CT(256, 72, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 16, H / 2 + 2, W - 32, 40); }));
  const tagSprite = (txt, bg = '#ffffff', fg = INK, s = 0.42) => { if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: false })); sp.scale.set(s, s * 0.28, 1); sp.renderOrder = 6; return sp; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (sub, after, t = 1.0) => { J.sub = sub; J.pause = t; J.after = after; };
  const arrowM = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: RED, depthTest: false })); arrowM.rotation.x = Math.PI; arrowM.visible = false; arrowM.renderOrder = 7; G.add(arrowM);
  const beacon = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 24), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.8, depthWrite: false })); beacon.rotation.x = -Math.PI / 2; beacon.visible = false; G.add(beacon);
  const sparkle = pts([...Array(10)].map(() => [0, -60, 0]), 0.12, '#fff3b0', 1); let sparkT = 0, sparkAt = V();
  const shine = at => { sparkT = 0.9; sparkAt.copy(at); };
  const clink = () => { tone(2900, 0.04, 0.3, 'triangle'); tone(4100, 0.02, 0.4, 'triangle'); }, beep = () => tone(1800, 0.05, 0.12, 'square');
  const meter = (f, c) => '<div style="position:relative;height:14px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:0;top:0;bottom:0;width:' + (clamp(f, 0, 1) * 100).toFixed(1) + '%;background:' + c + '"></div></div>';
  const RADIO = () => { noise(0.18, 0.03, 1800); tone(1400, 0.03, 0.08, 'square', 0.2); };
  const shutter = () => { noise(0.06, 0.06, 3000); tone(3600, 0.03, 0.05, 'square'); }, pin = () => tone(1900, 0.05, 0.09, 'triangle'), bark = () => { tone(420, 0.09, 0.12, 'sawtooth'); tone(300, 0.07, 0.16, 'sawtooth', 0.06); };
  const FLASH = document.createElement('div'); FLASH.style.cssText = 'position:fixed;inset:0;background:#ffffff;opacity:0;pointer-events:none;z-index:28;transition:opacity 0.35s'; document.body.appendChild(FLASH);
  const flash = () => { FLASH.style.transition = 'none'; FLASH.style.opacity = '0.9'; setTimeout(() => { FLASH.style.transition = 'opacity 0.45s'; FLASH.style.opacity = '0'; }, 40); flashL.intensity = 9; shutter(); };
  // ================= prizes =================
  const UNI = { outfit: 'suit', torso: [NAVY, '#1a2a3e', '#0f1a28'], name: 'MERU POLICE UNIFORM' };
  const uniOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === UNI.name); };
  const done = () => save.stat('pdDone', null) || {};
  function giveGift() { const n = save.stat('pdClears', 0) + 1; save.setStat('pdClears', n); const d = done(), nd = GAMES.filter(q => d[q.k]).length;
    if (!save.stat('pdUni', false)) { save.setStat('pdUni', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === UNI.name)) save.setStat('tailorOutfits', [...list, UNI]);
      save.setStat('pdPrevOutfit', save.data && save.data.outfit ? save.data.outfit : null); save.setOutfit(UNI); wear && wear(UNI); return 'uni'; }
    if (nd >= 2 && !save.stat('pdWhistle', false)) { save.setStat('pdWhistle', true); save.give('policeWhistle'); return 'whistle'; }
    if (nd >= 3 && !save.stat('pdDeputy', false)) { save.setStat('pdDeputy', true); return 'deputy'; }
    if (nd >= 5 && !save.stat('pdCone', false)) { save.setStat('pdCone', true); return 'cone'; }
    if (nd >= 8 && !save.stat('pdBail', false)) { save.setStat('pdBail', true); return 'bail'; }
    if (nd >= GAMES.length && !save.stat('pdAll', false)) { save.setStat('pdAll', true); save.give('goldenBadge'); save.addGold(80); return 'all'; }
    if (n % 3 === 0) { save.addGold(15); return 'gold'; } return null; }
  let worn = null; function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.head) return; const on = uniOn();
    if (worn && worn.on === on && worn.fox === fox && (!worn.m || worn.m.parent === P.head)) return; if (worn && worn.m && worn.m.parent) worn.m.parent.remove(worn.m); worn = { on, fox, m: null }; if (!on) return;
    const before = new Set(P.head.children); dressFox(THREE, fox, ['police', NAVYD]); worn.m = P.head.children.find(c => !before.has(c)) || null; if (worn.m) worn.m.traverse(o => { o.renderOrder = 2; }); }
  // ================= GAME 1: FRONT DESK (a fine is paid: count out the change, stamp the receipt PAID) =================
  const DCUS = V(-83.6, 0, -88.0), DTRAY = V(-83.6, 1.21, -89.32);
  const FINES = [['RIDING WITHOUT A TICKET', 20, 50], ['DRIVING ON A FOOT PATH', 15, 20], ['A SHOP THEFT', 40, 50], ['AN ESCAPE', 30, 50], ['DRIVING ON A FOOT PATH', 15, 50]];
  const coinMesh = v => { const m = new THREE.Mesh(new THREE.CylinderGeometry(coinR[v], coinR[v], 0.014, 16), new THREE.MeshPhongMaterial({ color: COINC[v], shininess: 80, specular: 0x886622 })); m.userData.v = v; return m; };
  const noteMesh = v => { const g = new THREE.Group(), t = CT(128, 64, (q, W, H) => { q.fillStyle = v === 20 ? '#c42d3c' : '#7c4dc4'; q.fillRect(0, 0, W, H); q.strokeStyle = '#f3f2f2'; q.lineWidth = 4; q.strokeRect(5, 5, W - 10, H - 10); q.fillStyle = '#ffffff'; q.font = '900 30px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillText(v + ' G', 14, H / 2 + 2); }), m = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; g.add(m); return g; };
  const stampDecal = CT(128, 64, (g, W, H) => { g.clearRect(0, 0, W, H); g.strokeStyle = RED; g.lineWidth = 6; g.strokeRect(6, 6, W - 12, H - 12); g.fillStyle = RED; g.font = '900 34px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('PAID', 22, H / 2 + 2); });
  const receiptT = CT(96, 128, (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = NAVY; g.fillRect(0, 0, W, 18); g.fillStyle = '#cfcac3'; for (let i = 0; i < 6; i++) g.fillRect(8, 28 + i * 14, W - 16 - (i % 3) * 12, 4); });
  const T1 = {
    begin() { J.round = 0; J.list = shuffle(FINES.slice()).slice(0, 3); this.cus(); },
    cus() { const [why, fine, paid] = J.list[J.round]; J.fine = fine; J.paid = paid; J.want = paid - fine; J.sum = 0; J.tray = []; putCus(DCUS.x, 0, DCUS.z, Math.PI);
      const n = own(noteMesh(paid)); n.position.set(DTRAY.x + 0.25, DTRAY.y, DTRAY.z - 0.05); J.note = n; J.rc = own(flatP(receiptT, 0.16, 0.22, RECP.x, RECP.y, RECP.z, Math.PI)); J.rc.rotation.z = 0.1; J.st = null;
      J.sub = 'give'; toast(J.C.name + ': "A FINE FOR ' + why + '. ' + fine + ' G. HERE\'S ' + paid + '."', 2.8); },
    press() { if (J.flies.length) return;
      if (J.sub === 'give') { const d = nearestOf(DRW, q => q.p, 1.4); if (!d) return; const m = own(coinMesh(d.v)); m.position.copy(d.p); const n = J.tray.length; J.tray.push(m); J.sum += d.v; coin();
        fly(m, V(DTRAY.x - 0.2 + (n % 5) * 0.1, DTRAY.y + (n / 5 | 0) * 0.015, DTRAY.z), 0.28, 0.12, null);
        if (J.sum > J.want) { miss('CHIEF: "TOO MUCH CHANGE. ' + J.want + ' G. AGAIN, BY THE BOOK."', 2.2); const t = J.tray; J.tray = []; J.sum = 0; NEXT('give', () => t.forEach(o => { o.visible = false; }), 0.6); }
        else if (J.sum === J.want) { ding(); addGold(6); NEXT('stamp', () => toast('NOW STAMP THE RECEIPT PAID', 1.6), 0.4); } return; }
      if (J.sub === 'stamp') { if (dist(scrW(RECP)) > RAD() * 2) return; stampS(); const s = own(flatP(stampDecal, 0.13, 0.065, RECP.x, RECP.y + 0.004, RECP.z, Math.PI)); s.rotation.z = -0.2; addGold(2); NEXT('hand', () => this.hand(), 0.5); } },
    hand() { const to = V(DCUS.x, 1.3, DCUS.z + 0.2); J.tray.forEach(m => fly(m, to, 0.4, 0.2, () => { m.visible = false; })); fly(J.rc, to, 0.45, 0.2, () => { J.rc.visible = false; }); fly(J.note, V(DRW[2].p.x, 1.24, DRW[2].p.z), 0.4, 0.1, () => { J.note.visible = false; });
      toast(J.C.name + ': ' + pickR(['"FAIR ENOUGH. I\'LL BEHAVE."', '"THANK YOU, OFFICER."', '"LESSON LEARNED."']), 1.8); NEXT('next', () => { if (J.cf) J.cf.visible = false; if (++J.round < 3) this.cus(); else finishGame(); }, 1.3); },
    card() { const hd = lab('CUSTOMER ' + (J.round + 1) + ' / 3 \u00b7 ' + (J.C ? J.C.name : ''));
      if (J.sub === 'give') return ['CHANGE: ' + J.paid + ' \u2212 ' + J.fine + ' = ' + J.want + ' G', big(J.sum + ' / ' + J.want + ' G', J.sum === J.want ? GREEN : INK) + lab('TAP THE DRAWER: 1 \u00b7 5 \u00b7 10') + hd, 'g' + J.sum];
      if (J.sub === 'stamp') return ['TAP THE RECEIPT \u00b7 STAMP IT PAID', hd, 's'];
      return ['NEXT CUSTOMER', hd, 'x' + J.sub + J.round]; },
    hint() { if (J.sub === 'give') { const rem = J.want - J.sum, d = DRW.slice().reverse().find(q => q.v <= rem); return d ? [d.p, 'TAP ' + d.v + ' G'] : null; } if (J.sub === 'stamp') return [RECP, 'TAP']; return null; },
    shot() { return [V(-83.6, 1.4, -89.3), 2.4, 2.4, 0.6, 2.2, Math.PI, 4.6, 0.5]; } };
  // ================= GAME 2: MUGSHOT (flash when they stand centred, front then side; read the height off the chart) =================
  const MUG = V(-109.0, 0, -87);
  const T2 = {
    begin() { J.round = 0; this.cus(); },
    cus() { putCus(MUG.x, 0, MUG.z, Math.PI / 2); const s = rnd(0.9, 1.12); J.cf.scale.setScalar(s); G.updateMatrixWorld(true); J.cf.updateMatrixWorld(true); const hd = J.cf.userData.P && J.cf.userData.P.head, hp = hd ? G.worldToLocal(hd.getWorldPosition(V())) : V(0, 1.4 * s, 0); J.h = Math.round((hp.y + 0.42 * s) * 20) / 20;
      const nb = own(plane(CT(128, 64, (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; g.font = '900 18px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU PD', 12, 18); g.font = '900 26px Archivo, sans-serif'; g.fillText(String(400 + (Math.random() * 600 | 0)), 12, 46); }), 0.34, 0.17, MUG.x + 0.36, 1.05 * s, MUG.z, Math.PI / 2)); J.nb = nb;
      J.sub = 'front'; J.ph = rnd(0, 6); J.shots = 0; toast(J.C.name + ': "DO I HAVE TO SMILE?"', 2); },
    off() { return Math.sin(J.t * 1.5 + J.ph) * 0.5 + Math.sin(J.t * 3.7 + J.ph) * 0.1; },
    tick() { if (!J.cf) return; const side = J.sub === 'side', o = (J.sub === 'front' || side) ? this.off() : 0; J.cf.position.z = MUG.z + o; J.cf.rotation.y += ((side ? 0 : Math.PI / 2) - J.cf.rotation.y) * 0.15; if (J.nb) { J.nb.position.z = J.cf.position.z; J.nb.visible = !side; } J.cf.userData.walk = Math.abs(o) > 0.05; },
    press() { if (J.sub !== 'front' && J.sub !== 'side') return; const o = this.off(); flash(); if (Math.abs(o) < 0.17) { addGold(4); ding(); if (J.sub === 'front') { NEXT('side', () => toast('NOW THE SIDE \u00b7 WAIT FOR THE CENTRE LINE', 1.6), 0.7); } else NEXT('height', () => {}, 0.6); }
      else miss('BLURRY! ' + (o < 0 ? 'TOO FAR LEFT.' : 'TOO FAR RIGHT.') + ' WAIT FOR THE RED LINE.', 1.6); },
    choose(h) { if (Math.abs(h - J.h) > 0.01) { miss('CHIEF: "LOOK AGAIN. READ THE LINE AT THE VERY TOP."', 2); return; } ding(); addGold(5); hidePick(); NEXT('next', () => { if (J.cf) J.cf.visible = false; if (++J.round < 3) this.cus(); else finishGame(); }, 0.9); },
    ui() { if (J.sub !== 'height') return false; const key = 'mh' + J.round + '_' + J.miss; if (pickKey === key) return true; const a = J.h, opts = shuffle([a, Math.round((a + 0.15) * 100) / 100, Math.round((a - 0.15) * 100) / 100]);
      showPick(key, 'HOW TALL?', J.C.name, lab('READ THE CHART AT THE VERY TOP (EARS TOO)'), opts.map(h => ({ label: h.toFixed(2) + ' M', go: () => this.choose(h) })), 3); return true; },
    card() { const hd = lab('SUSPECT ' + (J.round + 1) + ' / 3 \u00b7 ' + (J.C ? J.C.name : '')); if (J.sub === 'front' || J.sub === 'side') return ['TAP WHEN THEY STAND ON THE RED LINE', big(J.sub === 'front' ? 'FRONT' : 'SIDE') + hd, J.sub]; return ['NEXT SUSPECT', hd, 'n' + J.sub]; },
    hint() { return (J.sub === 'front' || J.sub === 'side') && Math.abs(this.off()) < 0.15 ? [V(MUG.x, 1.3, MUG.z), 'TAP NOW'] : null; },
    shot() { return [V(-109.3, 1.3, -87), 2.4, 2.4, 0.06, 2.2, Math.PI / 2, 5.4, 0.4]; },
    end() { if (J.cf) J.cf.scale.setScalar(1); } };
  // ================= GAME 3: FINGERPRINTS (downstairs lab bench: ink + roll 5 fingers, then MATCH or NO MATCH with the scene print) =================
  const printCanvas = (kind, seed, W = 90, H = 110) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.fillStyle = CREAM; g.fillRect(0, 0, W, H); g.save(); g.beginPath(); g.ellipse(W / 2, H / 2, W * 0.4, H * 0.42, 0, 0, 7); g.clip();
    g.strokeStyle = '#1a1c3a'; g.lineWidth = 2.4; const cx = W / 2 + Math.sin(seed) * 6, cy = H / 2 + Math.cos(seed * 1.3) * 6;
    if (kind === 'WHORL') for (let r = 4; r < 70; r += 6) { g.beginPath(); g.ellipse(cx, cy, r, r * 1.2, seed * 0.2, 0, 7); g.stroke(); }
    else if (kind === 'LOOP') for (let r = 4; r < 80; r += 6) { g.beginPath(); g.moveTo(cx - r, H + 10); g.lineTo(cx - r, cy); g.arc(cx, cy, r, Math.PI, 0); g.lineTo(cx + r, H + 10 - r * 0.6); g.stroke(); }
    else for (let k = -10; k < 16; k++) { g.beginPath(); g.moveTo(-10, cy + k * 7 + 18); g.quadraticCurveTo(cx, cy + k * 7 - 26 + Math.sin(seed + k) * 3, W + 10, cy + k * 7 + 18); g.stroke(); }
    g.restore(); return c; };
  const KINDS = ['WHORL', 'LOOP', 'ARCH'];
  function drawCardFP() { redrawT(fpT, (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = NAVY; g.fillRect(0, 0, W, 44); g.fillStyle = '#ffffff'; g.font = '900 24px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU PD \u00b7 PRINT CARD', 14, 23);
    g.fillStyle = INK; g.font = '800 18px Archivo, sans-serif'; g.fillText(J && J.C ? J.C.name : '', 14, 70);
    for (const b of FPBOX) { g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(b.cx - 45, b.cy - 70, 90, 140); g.font = '800 13px Archivo, sans-serif'; g.fillStyle = INK; g.fillText(['THUMB', 'INDEX', 'MIDDLE', 'RING', 'LITTLE'][b.i], b.cx - 40, b.cy + 84);
      if (J && J.rolled && J.rolled[b.i]) g.drawImage(printCanvas(J.kind, J.seed + b.i * 0.7, 86, 136), b.cx - 43, b.cy - 68); else if (J && J.fi === b.i && J.inked) { g.strokeStyle = '#ffd23a'; g.lineWidth = 6; g.strokeRect(b.cx - 48, b.cy - 73, 96, 146); } } }); }
  const T3 = { down: true,
    begin() { J.round = 0; J.matchSet = shuffle([true, false]); this.cus(); },
    cus() { putCus(-95.2, Y, -92.0, -Math.PI / 2); J.kind = pickR(KINDS); J.seed = rnd(0, 6); J.rolled = [0, 0, 0, 0, 0]; J.fi = 0; J.inked = false; J.sub = 'ink'; J.match = J.matchSet[J.round]; drawCardFP(); toast(J.C.name + ': "MY PAWS ARE CLEAN. MOSTLY."', 2); },
    press() { if (J.sub !== 'ink') return; if (!J.inked) { if (dist(scrW(INKP)) < RAD() * 1.8) { J.inked = true; pop(); drawCardFP(); } else miss('INK FIRST \u00b7 TAP THE INK PAD', 1.4); return; }
      const b = nearestOf(FPBOX, q => q.p, 1.7); if (!b) return; if (b.i !== J.fi) { miss('IN ORDER: ' + ['THUMB', 'INDEX', 'MIDDLE', 'RING', 'LITTLE'][J.fi] + ' NEXT', 1.4); return; } J.roll = { x0: ptr.x, y0: ptr.y, b }; },
    drag() { if (!J.roll) return; if (Math.hypot(ptr.x - J.roll.x0, ptr.y - (J.roll.y0 ?? ptr.y)) > (touch ? 20 : 30)) { J.rolled[J.fi] = 1; J.roll = null; J.inked = false; swish(); addGold(1); if (++J.fi >= 5) NEXT('match', () => {}, 0.5); drawCardFP(); } },
    release() { if (J.roll) { J.roll = null; toast('ROLL IT \u00b7 PRESS + DRAG SIDEWAYS', 1.4); } },
    choose(yes) { if (yes !== J.match) { miss(J.match ? 'LOOK AGAIN: SAME PATTERN, SAME SWIRL.' : 'LOOK AGAIN: A ' + J.kind + ' IS NOT A ' + J.scene + '.', 2.2); return; } ding(); addGold(6); hidePick(); toast(J.match ? 'A MATCH! CHIEF: "WRITE IT UP."' : 'NO MATCH. ' + J.C.name + ' IS IN THE CLEAR.', 2);
      NEXT('next', () => { if (J.cf) J.cf.visible = false; if (++J.round < 2) this.cus(); else finishGame(); }, 1.2); },
    ui() { if (J.sub !== 'match') return false; const key = 'fm' + J.round + '_' + J.miss; if (pickKey === key) return true; if (!J.scene) J.scene = J.kind;
      J.scene = J.match ? J.kind : pickR(KINDS.filter(k => k !== J.kind)); const a = printCanvas(J.scene, J.seed + 0.7, 90, 110).toDataURL(), b = printCanvas(J.kind, J.seed + 0.7, 90, 110).toDataURL();
      showPick(key, 'MATCH?', J.C.name, '<div style="display:flex;gap:8px;margin:4px 0 2px"><div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:900">AT THE SCENE</div><img src="' + a + '" style="width:100%;border:2px solid #201e1d;display:block"></div><div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:900">INDEX FINGER</div><img src="' + b + '" style="width:100%;border:2px solid #201e1d;display:block"></div></div>',
        [{ label: 'A MATCH', go: () => this.choose(true) }, { label: 'NO MATCH', go: () => this.choose(false) }], 2); return true; },
    card() { const hd = lab('SUSPECT ' + (J.round + 1) + ' / 2 \u00b7 ' + (J.C ? J.C.name : '')); if (J.sub === 'ink') return [J.inked ? 'ROLL THE ' + ['THUMB', 'INDEX', 'MIDDLE', 'RING', 'LITTLE'][J.fi] + ' \u00b7 DRAG SIDEWAYS' : 'TAP THE INK PAD', big(J.fi + ' / 5') + hd, 'i' + J.fi + J.inked]; return ['NEXT', hd, 'n' + J.sub]; },
    hint() { if (J.sub !== 'ink') return null; return J.inked ? [FPBOX[J.fi].p, touch ? 'PRESS + DRAG' : 'DRAG \u2194'] : [INKP, 'TAP']; },
    shot() { return [V(-96.95, Y + 0.96, -92.5), 1.1, 0.75, 1.0, 1.1, Math.PI, 2.6, 0.35]; } };
  // ================= GAME 4: WANTED POSTERS (tap a poster on the ledge, then the frame with its name + clue) =================
  const T4 = {
    begin() { const ks = shuffle(POST.map(p => p.k)); FR.forEach((f, i) => { f.k = ks[i]; }); drawTags(); const lo = shuffle([0, 1, 2, 3, 4]);
      posterM.forEach((p, i) => { p.on = null; p.m.position.set(-102.2 + lo[i] * 1.1, 1.3, -94.7); p.m.rotation.set(-0.12, 0, rnd(-0.08, 0.08)); }); J.sel = null; J.sub = 'pin'; toast('CHIEF: "NEW POSTERS. MATCH EACH FACE TO ITS NAME."', 2.4); },
    press() { if (J.flies.length) return; const free = posterM.filter(p => !p.on), p = nearestOf(free, q => q.m.position, 1.8);
      if (p) { if (J.sel) J.sel.m.position.y = 1.3; J.sel = p; p.m.position.y = 1.42; pop(); return; }
      if (!J.sel) return; const f = nearestOf(FR.filter(q => !posterM.some(p2 => p2.on === q)), q => V(q.x, q.y, -94.7), 2.2); if (!f) return; const s = J.sel;
      if (f.k !== s.v.k) { const v = POST.find(q => q.k === f.k); miss('NOT ' + v.n + '. LOOK FOR: ' + v.clue + '.', 2); s.m.position.y = 1.3; J.sel = null; return; }
      J.sel = null; s.on = f; s.m.rotation.set(0, 0, 0); fly(s.m, V(f.x, f.y, -94.74), 0.35, 0.1, () => { pin(); pinP(s, f); }); addGold(3); if (posterM.every(q => q.on)) NEXT('done', () => finishGame(), 0.9); },
    card() { const left = posterM.filter(p => !p.on).length; return [J.sel ? 'NOW TAP ITS NAME ON THE BOARD' : 'TAP A POSTER ON THE LEDGE', big((5 - left) + ' / 5') + lab('NAMES + CLUES ARE UNDER EACH FRAME'), 'w' + left + (J.sel ? J.sel.v.k : '')]; },
    hint() { if (!J.sel) { const p = posterM.find(q => !q.on); return p ? [p.m.position.clone(), 'TAP'] : null; } const f = FR.find(q => q.k === J.sel.v.k); return f ? [V(f.x, f.y, -94.7), 'HERE'] : null; },
    shot() { return [V(-100, 1.85, -94.8), 5.0, 2.4, 0.1, 2.4, 0, 6.5, 0.4]; },
    end() { posterM.forEach(p => { if (!p.on) { const f = FR.find(q => q.k === p.v.k); pinP(p, f); } }); } };
  // ================= GAME 5: EVIDENCE ROOM (walk: take a bag from the hatch, tag its case, shelve it in its aisle) =================
  const AISLE = ['A', 'B', 'C', 'D'].map((n, a) => ({ n, x: -97.5 + a * 3.3 })), SECT = [-101.6, -105.0, -108.4];
  const SPOTS = []; AISLE.forEach(A => SECT.forEach((z, s) => SPOTS.push({ a: A, s, x: A.x + 1.15, z, n: A.n + '-' + (s + 1) })));
  const ITEMS = ['A RUSTY KEY', 'A FOX MASK', 'A BENT CROWBAR', 'A PEARL NECKLACE', 'A SLINGSHOT', 'A MUDDY BOOT', 'A BAG OF MARBLES', 'A FAKE MOUSTACHE'];
  const bagMesh = () => { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.2), new THREE.MeshPhongMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0.75 })); g.add(b); const s = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.21), LM(RED)); s.position.y = 0.17; g.add(s); g.traverse(o => { o.renderOrder = -2; }); return g; };
  const T5 = { walk: true,
    begin() { J.bags = shuffle(ITEMS.slice()).slice(0, 4).map(n => ({ n, cs: 10 + (Math.random() * 80 | 0), spot: pickR(SPOTS) })); J.bi = 0; J.sub = 'take'; J.carry = null; toast('THE CLERK HAS 4 BAGS AT THE HATCH \u00b7 TAG + SHELVE THEM', 2.6); },
    cur() { return J.bags[J.bi]; },
    goal() { if (J.sub === 'take' || J.sub === 'tag') return [-78, -95.4, Y]; const s = this.cur().spot; return [s.x, s.z, Y]; },
    near(P) { return SPOTS.find(s => Math.hypot(P.x - s.x, P.z - s.z) < 1.0); },
    prompt(P) { if ((P.y || 0) > -2) return null; if (J.sub === 'take' && Math.hypot(P.x + 78, P.z + 95.4) < 1.5) return 'TAKE A BAG \u00b7 ' + (J.bi + 1) + ' / 4'; if (J.sub === 'shelve') { const s = this.near(P); if (s) return 'SHELVE \u00b7 AISLE ' + s.n; } return null; },
    talk(P) { if (J.sub === 'take' && this.prompt(P)) { J.sub = 'tag'; pop(); return true; }
      if (J.sub === 'shelve') { const s = this.near(P); if (!s) return false; const b = this.cur(); if (s !== b.spot) { miss('WRONG SHELF. THIS ONE IS ' + s.n + '. TAG SAYS ' + b.spot.n + '.', 2); return true; }
        if (J.carry) { J.carry.position.set(s.a.x + 0.25, Y + 0.2 + (s.s + 1) * 0.6 + 0.2, s.z); J.carry = null; } clink(); addGold(4); toast(b.n + ' \u00b7 CASE ' + b.cs + ' \u00b7 SHELVED', 1.6); if (++J.bi >= J.bags.length) finishGame(); else J.sub = 'take'; return true; } return false; },
    choose(cs) { const b = this.cur(); if (cs !== b.cs) { miss('CLERK: "THAT CASE IS SOMETHING ELSE. CHECK THE LEDGER."', 2); return; } hidePick(); ding(); addGold(2); J.carry = own(bagMesh()); J.sub = 'shelve'; toast('CASE ' + b.cs + ' \u00b7 SHELVE IT IN AISLE ' + b.spot.n, 2.2); },
    ui() { if (J.sub !== 'tag') return false; const key = 'ev' + J.bi + '_' + J.miss; if (pickKey === key) return true; const b = this.cur();
      if (!b.led) { const others = shuffle(ITEMS.filter(n => n !== b.n)).slice(0, 2).map(n => ({ n, cs: 10 + (Math.random() * 80 | 0) })); b.led = shuffle([{ n: b.n, cs: b.cs }, ...others.filter(o => o.cs !== b.cs)]); }
      showPick(key, 'TAG THE BAG', 'BAG ' + (J.bi + 1) + ' / 4', lab('IN THE BAG: ' + b.n) + lab('THE LEDGER:') + b.led.map(l => row('#9a7550', 'CASE ' + l.cs, l.n, false)).join(''), b.led.map(l => ({ label: 'CASE ' + l.cs, go: () => this.choose(l.cs) })), 3); return true; },
    tick(dt) { if (J.carry && J.P) { const P = J.P; J.carry.position.set(P.x + Math.sin(P.yaw) * 0.45, (P.y || 0) + 0.95, P.z + Math.cos(P.yaw) * 0.45); } },
    card() { const b = this.cur(); return [J.sub === 'shelve' ? 'SHELVE IN AISLE ' + b.spot.n : 'TAKE THE NEXT BAG AT THE HATCH', lst(J.bags.map((q, i) => ['#9a7550', q.n, i < J.bi ? '\u2713' : i === J.bi && J.sub === 'shelve' ? q.spot.n : '', i < J.bi])), J.bi + J.sub]; } };
  // ================= GAME 6: CCTV ROOM (worlds/meru2-police-cctv.js) =================
  let CC = null, ccLive = false; const ccMake = () => { if (!CC && renderer) CC = makeCCTV({ THREE, kit, renderer, touch, roster: ROSTER }); return CC; };
  const scrHit = () => { ray(); const h = rc.intersectObjects(SCR.map(s => s.m), false)[0]; if (!h || !h.uv) return null; return { i: SCR.findIndex(s => s.m === h.object), u: h.uv.x, v: h.uv.y }; };
  const T6 = { down: true,
    begin() { if (!ccMake()) { toast('THE CCTV IS DOWN TODAY', 2); NEXT('x', () => stop(), 0.1); return; } if (!ccLive) { CC.start(); ccLive = true; } J.round = 0; J.zoom = (camera.aspect || 1) < 1 ? 0 : -1; J.rewUsed = 0; this.next(); toast('CHIEF: "WATCH THE SCREENS. SOMEONE WILL POCKET SOMETHING."', 2.6); },
    next() { const r = CC.round((k, i) => this.ev(k, i)); J.cam = r.cam; J.st = 'watch'; J.can = false; J.rewUsed = 0; SCR.forEach(s => { s.alert = 0; s.rew = ''; }); },
    ev(k, i) { if (!J || J.g !== 'cctv') return;
      if (k === 'took') { setTimeout(() => { if (J && J.g === 'cctv' && J.st === 'watch') { SCR[i].alert = 7; tone(880, 0.05, 0.25, 'square'); toast('MOTION ON CAM ' + (i + 1) + ' \u00b7 WHO TOOK SOMETHING?', 2.2); } }, 900); }
      if (k === 'away' && J.st === 'watch') { J.st = 'lost'; J.can = true; SCR[i].alert = 0; SCR[i].rew = 'LOST HIM'; nope(); toast('HE SLIPPED OUT OF SHOT \u00b7 REWIND THE TAPE', 2.4); }
      if (k === 'tapeEnd' && J.st === 'tape') { J.st = 'lost'; J.can = true; SCR[i].rew = 'LOST HIM'; miss('MISSED HIM ON THE TAPE. REWIND AGAIN.', 2); }
      if (k === 'led') { SCR[i].rew = ''; if (++J.round >= 4) NEXT('done', () => finishGame(), 0.8); else NEXT('watch', () => this.next(), 1.2); } },
    rewind() { if (!J.can || !CC.rewind()) return; J.can = false; J.st = 'tape'; J.rewUsed++; SCR[J.cam].rew = '\u25c0\u25c0 REWIND'; J.zoom = J.zoom >= 0 ? J.cam : J.zoom; tone(600, 0.04, 0.5, 'sawtooth'); setTimeout(() => { if (J && J.g === 'cctv' && J.st === 'tape') SCR[J.cam].rew = '\u25b6 0.6\u00d7'; }, 900); },
    press() { const h = scrHit(); if (!h) return; if (J.zoom < 0 && touch) { J.zoom = h.i; pop(); return; }
      if (J.st !== 'watch' && J.st !== 'tape') return; const r = CC.judge(h.i, h.u, h.v);
      if (r.k === 'thief') { ding(); coin(); addGold(J.rewUsed ? 8 : 14); J.st = 'caught'; SCR[h.i].alert = 0; SCR[h.i].rew = 'CAUGHT'; const s = CC.state(); toast('GOT HIM! ' + r.who.toUpperCase() + ' POCKETED ' + s.item + ' \u00b7 OFFICER ON THE WAY', 2.6); return; }
      if (r.k === 'wrong') { miss('NOT ' + r.who.toUpperCase() + '. ' + (r.decoy ? 'THEY PUT IT BACK.' : 'JUST BROWSING.'), 1.8); return; }
      if (r.k === 'early') { toast('WAIT\u2026 HE HAS NOT TAKEN ANYTHING. YET.', 1.6); return; }
      if (J.zoom < 0) { J.zoom = h.i; pop(); } },
    tick(dt) { CC.zoom(J.zoom); },
    ui() { const st = CC.state(), key = 'cc' + J.round + J.st + J.zoom + J.can + J.miss + (st ? st.ph : '') + SCR.map(s => s.alert > 0 ? 1 : 0).join(''); if (pickKey === key) return true;
      const al = SCR.findIndex(s => s.alert > 0), msg = J.st === 'lost' ? 'HE GOT AWAY \u00b7 REWIND THE TAPE' : J.st === 'tape' ? 'WATCH THE TAPE \u00b7 TAP HIM WHEN HE POCKETS IT' : J.st === 'caught' ? 'OFFICER ON THE WAY\u2026' : al >= 0 ? 'MOTION ON CAM ' + (al + 1) : 'WATCH FOR A FOX WHO POCKETS SOMETHING';
      const opts = [0, 1, 2, 3].map(i => ({ label: String(i + 1), on: J.zoom === i, primary: SCR[i].alert > 0 && J.zoom !== i, go: () => { J.zoom = i; pickKey = ''; } }));
      opts.push({ label: 'ALL', on: J.zoom < 0, go: () => { J.zoom = -1; pickKey = ''; } }); if (J.can) opts.unshift({ label: '\u25c0\u25c0 REWIND THE TAPE', primary: true, span: true, go: () => { this.rewind(); pickKey = ''; } });
      showPick(key, 'CCTV \u00b7 ROUND ' + Math.min(4, J.round + 1) + ' / 4', J.gold ? J.gold + ' G' : 'LIVE', lab(msg) + (innerHeight < 500 ? '' : lab(touch ? 'TAP A SCREEN TO ZOOM \u00b7 TAP THE FOX' : 'CLICK THE FOX ON THE SCREEN') + lab('CAMERAS')), opts, 5); return true; },
    hint() { if (J.st !== 'watch' && J.st !== 'tape') return null; const st = CC.state(); if (!st || !(st.ph === 'pocket' || st.ph === 'run' || J.st === 'tape')) return null; const t = CC.thiefUV(); if (!t || (J.zoom >= 0 && J.zoom !== t[0])) return null;
      return [V(SCX[t[0]] - SCW / 2 + t[1] * SCW, SCY - SCH / 2 + t[2] * SCH, SCZ), 'HIM?']; },
    shot() { return J.zoom >= 0 ? [V(SCX[J.zoom], SCY, SCZ), 3.3, 2.1, 0.04, 1.6, 0, 9.5, 0.3] : [V(-92, SCY, SCZ), 13.2, 2.4, 0.08, 3, 0, 9.8, 0.3]; },
    end() { if (CC) CC.zoom(-1); SCR.forEach(s => { s.alert = 0; s.rew = ''; }); if (CC && ccLive) CC.start(); } };
  // ================= GAME 7: DISPATCH (wall map of the real town: send the nearest FREE car to each call) =================
  const CALLS = [[/bank/i, 'AN ALARM BELL AT THE BANK'], [/tavern/i, 'A NOISY SING-SONG AT THE TAVERN'], [/casino/i, 'A SORE LOSER AT THE CASINO'], [/pie/i, 'A PIE WENT MISSING AT THE PIE SHOP'], [/mart|market|grocer/i, 'A SHOPLIFTER AT THE ' ],
    [/gas/i, 'A STUCK PUMP AT THE GAS STATION'], [/museum/i, 'SOMEONE TOUCHED A PAINTING AT THE MUSEUM'], [/hospital/i, 'A CAR IN THE AMBULANCE BAY'], [/skate/i, 'SKATERS ON THE STAIRS AT THE SKATE PARK'], [/station/i, 'A LOST SUITCASE AT THE STATION'], [/motel/i, 'A LOUD SNORER AT THE MOTEL'], [/club/i, 'A DANCE-OFF GOT OUT OF HAND AT THE CLUB']];
  const callText = b => { for (const [re, t] of CALLS) if (re.test(b.label)) return t.endsWith(' ') ? t + b.label.toUpperCase() : t; return 'A SUSPICIOUS FOX BY THE ' + b.label.toUpperCase(); };
  const mapLocal = (u, v) => V(MAPX - MAPW / 2 + u / 1024 * MAPW, MAPY + MAPH / 2 - v / 512 * MAPH, MAPZ);
  const T7 = { down: true,
    begin() { const pool = shuffle(TOWN.filter(b => b.door && b.key !== 'police')); const ctr = q => [q.door[0], q.door[1]];
      J.cars = [0, 1, 2].map(n => { const b = pool[n + 6] || pool[n]; const [x, z] = ctr(b); return { n: n + 1, x, z, busy: 0, route: null }; });
      J.calls = pool.slice(0, 6).map(b => { const [x, z] = ctr(b); return { b, x, z, st: 'wait', t: callText(b) }; }); J.ci = 0; J.next = 1.0; J.active = null; drawMap(J); toast('DISPATCH: CALLS COME IN ON THE RADIO \u00b7 SEND THE NEAREST FREE CAR', 2.6); },
    tick(dt) { J.next -= dt; if (!J.active && J.ci < J.calls.length && J.next <= 0) { J.active = J.calls[J.ci++]; J.active.st = 'live'; RADIO(); toast('RADIO: "' + J.active.t + '."', 2.6); }
      for (const c of J.cars) { if (c.route) { const R = c.route; R.k = Math.min(1, R.k + dt / R.dur); c.x = R.from[0] + (R.to[0] - R.from[0]) * R.k; c.z = R.from[1] + (R.to[1] - R.from[1]) * R.k; if (R.k >= 1) { R.call.st = 'done'; c.route = null; c.busy = 3; pin(); } } else if (c.busy > 0) c.busy -= dt; }
      if (J.ci >= J.calls.length && !J.active && J.calls.every(c => c.st === 'done') && !J.end) { J.end = 1; NEXT('done', () => finishGame(), 1.0); }
      J.mt = (J.mt || 0) - dt; if (J.mt <= 0) { J.mt = 0.25; drawMap(J); } },
    free() { return J.cars.filter(c => !c.route && c.busy <= 0); },
    best() { const a = J.active; if (!a) return null; let b = null, bd = 1e9; for (const c of this.free()) { const d = Math.hypot(c.x - a.x, c.z - a.z); if (d < bd) { bd = d; b = c; } } return b; },
    press() { const p = hitZ(MAPZ); if (!p) return; const u = (p.x - (MAPX - MAPW / 2)) / MAPW * 1024, v = (MAPY + MAPH / 2 - p.y) / MAPH * 512; let car = null, bd = RAD() * 1.5; for (const c of J.cars) { const [x, y] = toMap(c.x, c.z), d = dist(scrW(mapLocal(x, y))); if (d < bd) { bd = d; car = c; } } if (!car) { let bm = touch ? 90 : 60; for (const c of J.cars) { const [x, y] = toMap(c.x, c.z), d = Math.hypot(x - u, y - v); if (d < bm) { bm = d; car = c; } } } if (!car) return;
      if (!J.active) { toast('NO CALL RIGHT NOW \u00b7 WAIT FOR THE RADIO', 1.4); return; } if (car.route || car.busy > 0) { toast('CAR ' + car.n + ' IS BUSY', 1.4); return; }
      const best = this.best(); if (best && best !== car && Math.hypot(car.x - J.active.x, car.z - J.active.z) > Math.hypot(best.x - J.active.x, best.z - J.active.z) * 1.15) miss('CAR ' + best.n + ' WAS CLOSER. CAR ' + car.n + ' IS ON ITS WAY ANYWAY.', 2); else { addGold(4); ding(); }
      const d = Math.hypot(car.x - J.active.x, car.z - J.active.z); car.route = { from: [car.x, car.z], to: [J.active.x, J.active.z], k: 0, dur: 1.2 + d / 140, call: J.active }; J.active.st = 'go'; RADIO(); toast('CAR ' + car.n + ': "ON OUR WAY."', 1.4); J.active = null; J.next = rnd(1.2, 2.4); drawMap(J); },
    card() { const n = J.calls.filter(c => c.st === 'done').length; return [J.active ? 'SEND THE NEAREST FREE CAR \u00b7 TAP IT' : 'WAIT FOR THE NEXT CALL', (J.active ? quote(J.active.t) : '') + big(n + ' / 6') + lab('GREY CAR = BUSY'), 'd' + n + (J.active ? J.ci : 'x')]; },
    hint() { const b = this.best(); if (!b) return null; const [u, v] = toMap(b.x, b.z); return [mapLocal(u, v), 'CAR ' + b.n]; },
    shot() { return [V(MAPX, MAPY, MAPZ), 6.0, 3.0, 0.1, 2.5, 0, 9.8, 0.3]; },
    end() { drawMap(null); } };
  // ================= GAME 8: FEED THE PRISONERS (walk: the hatch → the right tray to each cell slot before they get hungry) =================
  const T8 = { walk: true,
    begin() { const ms = shuffle(MEALS.slice()); J.who = PRIS.map((p, i) => ({ p, meal: ms[i], fed: false, pat: 75 })); if (grumbleOn()) J.who.push({ p: { k: 'grumble', n: 'GRUMBLE', f: grumble, slot: [-107.9, -104.6] }, meal: ms[3], fed: false, pat: 75 });
      J.carry = null; J.sub = 'hatch'; if (PR) PR.hold = { x: -66.2, z: -97.6, yaw: -Math.PI / 2 }; toast('SGT. KNOX: "DINNER TIME. TRAYS AT THE HATCH. MIND THE ORDERS."', 2.6); },
    left() { return J.who.filter(w => !w.fed); },
    goal() { if (!J.carry) return [-64.0, -99.5, 0]; const w = J.who.find(q => !q.fed && q.meal === J.carry.meal) || this.left()[0]; return [w.p.slot[0], w.p.slot[1], 0]; },
    nearW(P) { return J.who.find(w => !w.fed && Math.hypot(P.x - w.p.slot[0], P.z - w.p.slot[1]) < 1.3); },
    prompt(P) { if (!J.carry && Math.hypot(P.x + 64.0, P.z + 99.5) < 1.6) return 'TAKE A TRAY'; const w = J.carry && this.nearW(P); return w ? 'SERVE ' + J.carry.meal.k + ' \u00b7 ' + w.p.n : null; },
    talk(P) { if (!J.carry && Math.hypot(P.x + 64.0, P.z + 99.5) < 1.6) { J.sub = 'pick'; pop(); return true; } const w = J.carry && this.nearW(P); if (!w) return false;
      if (w.meal !== J.carry.meal) { miss(w.p.n + ': "I ORDERED ' + w.meal.k + '!"', 1.8); return true; } w.fed = true; J.carry.m.parent && J.carry.m.parent.remove(J.carry.m); J.carry = null; clink(); addGold(4 + (w.pat > 30 ? 2 : 0));
      toast(w.p.n + ': ' + pickR(['"NOW THAT\'S SERVICE."', '"BETTER THAN MY MUM\'S."', '"BLESS YOU, KID."', '"HMPH. THANKS."']), 1.6); if (!this.left().length) finishGame(); return true; },
    choose(m) { hidePick(); const t = trayMesh(m); own(t); J.carry = { meal: m, m: t }; J.sub = 'walk'; pop(); },
    ui() { if (J.sub !== 'pick') return false; const key = 'fd' + J.who.filter(w => w.fed).length + '_' + J.miss; if (pickKey === key) return true;
      showPick(key, 'WHICH TRAY?', 'KITCHEN', J.who.filter(w => !w.fed).map(w => row(w.meal.c, w.p.n, w.meal.k, false)).join(''), MEALS.map(m => ({ label: m.k, go: () => this.choose(m) })), 2); return true; },
    tick(dt) { for (const w of J.who) if (!w.fed) { const was = w.pat; w.pat -= dt; if (was > 0 && w.pat <= 0) { miss(w.p.n + ' IS STARVING! HURRY!', 1.8); w.pat = 25; } }
      if (J.carry && J.P) { const P = J.P; J.carry.m.position.set(P.x + Math.sin(P.yaw) * 0.42, (P.y || 0) + 1.0, P.z + Math.cos(P.yaw) * 0.42); J.carry.m.rotation.y = P.yaw; }
      for (const w of J.who) if (!w.fed && w.p.f && w.p.k !== 'grumble') { const f = w.p.f; f.position.x += (w.p.slot[0] - f.position.x) * Math.min(1, dt * 0.8); f.position.z += (w.p.slot[1] - 1.4 - f.position.z) * Math.min(1, dt * 0.8); f.rotation.y = 0; } },
    card() { return [J.carry ? 'CARRYING ' + J.carry.meal.k + ' \u00b7 FIND WHO ORDERED IT' : 'TAKE A TRAY AT THE KITCHEN HATCH', lst(J.who.map(w => [w.meal.c, w.p.n + ' \u00b7 ' + w.meal.k, w.fed ? '\u2713' : Math.max(0, Math.ceil(w.pat)) + ' S', w.fed])), J.who.filter(w => w.fed).length + (J.carry ? J.carry.meal.k : '') + Math.floor(J.t / 5)]; },
    end() { if (J.carry && J.carry.m.parent) J.carry.m.parent.remove(J.carry.m); if (PR) PR.hold = null; PRIS.forEach(p => { p.f.position.set(p.home[0], 0, p.home[1]); p.f.rotation.y = p.home[2]; }); } };
  // ================= GAME 9: SKETCH ARTIST (the witness describes the face, you pick each feature; the pad draws it) =================
  const FEAT = { ears: ['POINTY', 'ROUND', 'TORN'], eyes: ['SHARP', 'BIG', 'PATCH'], mouth: ['GRIN', 'FROWN', 'GAP TOOTH'], extra: ['SCAR', 'HOOD', 'BANDANA', 'GOGGLES', 'NONE'] };
  const CLUE = { POINTY: 'HIS EARS WERE TALL AND POINTY.', ROUND: 'SHORT ROUND EARS. LIKE A BEAR CUB.', TORN: 'ONE EAR HAD A BITE OUT OF IT.', SHARP: 'NARROW EYES. MEAN LOOKING.', BIG: 'BIG WIDE EYES, LIKE SAUCERS.', PATCH: 'HE WORE AN EYE PATCH!',
    GRIN: 'A BIG CHEEKY GRIN.', FROWN: 'A GRUMPY FROWN.', 'GAP TOOTH': 'A GAP WHERE A TOOTH SHOULD BE.', SCAR: 'A SCAR ACROSS HIS CHEEK.', HOOD: 'HE HAD A DARK HOOD UP.', BANDANA: 'A RED BANDANA ON HIS HEAD.', GOGGLES: 'GOGGLES UP ON HIS FOREHEAD.', NONE: 'NOTHING ELSE. JUST A PLAIN FACE.' };
  const FK = ['ears', 'eyes', 'mouth', 'extra'], FKN = { ears: 'EARS', eyes: 'EYES', mouth: 'MOUTH', extra: 'ANYTHING ELSE' };
  const drawPad = f => redrawT(padT, (g, W, H) => { g.fillStyle = '#f3efe6'; g.fillRect(0, 0, W, H); g.strokeStyle = '#cfcac3'; g.lineWidth = 1; for (let y = 30; y < H; y += 22) { g.beginPath(); g.moveTo(10, y); g.lineTo(W - 10, y); g.stroke(); } g.fillStyle = NAVY; g.fillRect(0, 0, W, 22); g.fillStyle = '#ffffff'; g.font = '900 13px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU PD \u00b7 SKETCH', 8, 12);
    if (f) drawFace(g, { ears: f.ears || 'ROUND', eyes: f.eyes || 'BIG', mouth: f.mouth || 'FLAT', extra: f.extra || 'NONE' }, W / 2, H / 2 + 20, 70, true); });
  drawPad(null);
  const T9 = {
    begin() { J.round = 0; J.vs = shuffle(VILL.slice()).slice(0, 3); this.cus(); },
    cus() { putCus(-71, 0, -93.2, 0); J.v = J.vs[J.round]; J.fi = 0; J.face = {}; drawPad(J.face); J.sub = 'pick'; },
    choose(val) { const k = FK[J.fi]; J.face[k] = val; drawPad(J.face); swish(); if (val !== J.v.f[k]) { miss(J.C.name + ': "NO, NO. ' + CLUE[J.v.f[k]] + '"', 2.4); return; }
      addGold(2); if (++J.fi >= FK.length) { hidePick(); ding(); addGold(3); toast(J.C.name + ': "THAT\'S HIM!" \u00b7 IT LOOKS LIKE ' + J.v.n + ' FROM THE WANTED BOARD', 2.6); NEXT('next', () => { if (J.cf) J.cf.visible = false; if (++J.round < 3) this.cus(); else finishGame(); }, 1.8); } },
    ui() { if (J.sub !== 'pick' || J.fi >= FK.length) return false; const k = FK[J.fi], key = 'sk' + J.round + '_' + J.fi + '_' + J.miss; if (pickKey === key) return true;
      showPick(key, FKN[k] + '?', 'WITNESS ' + (J.round + 1) + ' / 3', quote(CLUE[J.v.f[k]]) + lab(J.C ? J.C.name : ''), FEAT[k].map(v => ({ label: v, on: J.face[k] === v, go: () => this.choose(v) })), FEAT[k].length > 3 ? 3 : FEAT[k].length); return true; },
    card() { return ['NEXT WITNESS', lab('WITNESS ' + (J.round + 1) + ' / 3'), 'n' + J.round]; },
    shot() { return [V(-71, 1.15, -92.55), 1.9, 2.0, 0.5, 1.8, 0, 4.0, 0.5]; },
    end() { drawPad(null); } };
  // ================= GAME 10: PARKING TICKETS (outside: ticket every car in a red bay; the white bays are fine) =================
  const CARC = ['#2f6fd6', '#c42d3c', '#ffd23a', '#2f7a4a', '#f3f2f2', '#7c4dc4'];
  const carMesh = c => { const g = new THREE.Group(), B2 = (w, h, d, col, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), LM(col)); m.position.set(x, y, z); g.add(m); return m; };
    B2(1.7, 0.6, 3.8, c, 0, 0.6, 0); B2(1.5, 0.5, 2.0, c, 0, 1.15, -0.2); B2(1.42, 0.42, 0.04, '#9fd6ff', 0, 1.15, 0.81); B2(1.42, 0.42, 0.04, '#9fd6ff', 0, 1.15, -1.21);
    for (const [x, z] of [[-0.82, 1.2], [0.82, 1.2], [-0.82, -1.2], [0.82, -1.2]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 14), LM(INK)); w.rotation.z = Math.PI / 2; w.position.set(x, 0.32, z); g.add(w); }
    B2(0.3, 0.12, 0.04, '#fff1c8', -0.55, 0.65, 1.91); B2(0.3, 0.12, 0.04, '#fff1c8', 0.55, 0.65, 1.91); return g; };
  const ticketT = CT(64, 96, (g, W, H) => { g.fillStyle = '#ffd23a'; g.fillRect(0, 0, W, H); g.fillStyle = INK; g.fillRect(0, 0, W, 18); g.fillStyle = '#ffd23a'; g.font = '900 12px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('FINE', 8, 10); g.fillStyle = INK; for (let i = 0; i < 4; i++) g.fillRect(6, 28 + i * 14, W - 12 - (i % 2) * 14, 4); });
  const PCOL = BAYS.map(b => { const c = { f: [b.x - 0.95, b.x + 0.95, b.z - 2.0, b.z + 2.0], on: false }; cols.push(c); return c; });
  const T10 = { walk: true,
    begin() { const red = BAYS.filter(b => b.red), ok = shuffle(BAYS.filter(b => !b.red)).slice(0, 3); J.cars = shuffle([...red, ...ok]).map((b, i) => { const m = own(carMesh(CARC[i % CARC.length])); m.position.set(b.x, 0.12, b.z); m.rotation.y = Math.PI + rnd(-0.04, 0.04); PCOL[b.i].on = true; return { b, m, done: false }; });
      toast('CHIEF: "RED BAYS ARE NO PARKING. TICKET THOSE, LEAVE THE REST."', 2.6); },
    left() { return J.cars.filter(c => c.b.red && !c.done); },
    goal() { const l = this.left(); if (!l.length) return [-86, -78.5, 0]; const P = J.P; let b = l[0], bd = 1e9; for (const c of l) { const d = Math.hypot(P.x - c.b.x, P.z - (c.b.z + 2.6)); if (d < bd) { bd = d; b = c; } } return [b.b.x, b.b.z + 2.7, 0]; },
    near(P) { return J.cars.find(c => !c.done && Math.abs(P.x - c.b.x) < 1.8 && P.z > c.b.z + 1.6 && P.z < c.b.z + 4.2); },
    prompt(P) { const c = this.near(P); return c ? 'WRITE A TICKET' : null; },
    talk(P) { const c = this.near(P); if (!c) return false; if (!c.b.red) { miss('THAT ONE IS PARKED FINE. WHITE BAY.', 1.6); c.done = true; return true; } c.done = true; const t = own(plane(ticketT, 0.22, 0.32, c.b.x - 0.3, 1.2, c.b.z + 0.84, 0)); t.rotation.x = -0.5; stampS(); addGold(5); toast('TICKET! ' + this.left().length + ' MORE IN RED BAYS', 1.4); if (!this.left().length) NEXT('done', () => finishGame(), 0.8); return true; },
    card() { const n = J.cars.filter(c => c.b.red && c.done).length; return ['WALK UP TO A CAR IN A RED BAY + E', big(n + ' / 4') + lab('WHITE BAY = FINE \u00b7 RED BAY = TICKET'), 'p' + n]; },
    end() { PCOL.forEach(c => { c.on = false; }); } };
  // ================= GAME 11: K-9 TRAINING (Duke on the lead to the K-9 course in the town park: SIT · STAY + COME · SNIFF · JUMP) =================
  const duke = new THREE.Group(); K9G.add(duke); const DK = {};
  { const tan = LM('#b07a3a'), blk = LM('#2a2420'), cream = LM('#e6c89a'); const add = (geo, mat, x, y, z, par = duke) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); par.add(m); return m; };
    DK.body = new THREE.Group(); duke.add(DK.body); add(new THREE.BoxGeometry(0.34, 0.32, 0.86), tan, 0, 0.55, 0, DK.body); add(new THREE.BoxGeometry(0.36, 0.14, 0.7), blk, 0, 0.72, -0.04, DK.body); add(new THREE.BoxGeometry(0.37, 0.2, 0.34), LM(NAVY), 0, 0.64, 0.02, DK.body); add(new THREE.BoxGeometry(0.1, 0.08, 0.02), LM(GOLD), 0.19, 0.66, 0.02, DK.body);
    DK.head = new THREE.Group(); DK.head.position.set(0, 0.78, 0.46); DK.body.add(DK.head); add(new THREE.BoxGeometry(0.26, 0.24, 0.28), tan, 0, 0.04, 0.04, DK.head); add(new THREE.BoxGeometry(0.16, 0.13, 0.2), cream, 0, -0.02, 0.24, DK.head); add(new THREE.BoxGeometry(0.07, 0.05, 0.04), blk, 0, 0.03, 0.35, DK.head);
    for (const s of [-1, 1]) { const e = add(new THREE.ConeGeometry(0.06, 0.18, 4), blk, s * 0.09, 0.22, -0.02, DK.head); e.rotation.z = -s * 0.2; add(new THREE.SphereGeometry(0.025, 6, 5), LM(INK), s * 0.07, 0.08, 0.17, DK.head); }
    add(new THREE.TorusGeometry(0.12, 0.025, 6, 14), LM(RED), 0, -0.1, 0, DK.head).rotation.x = Math.PI / 2;
    DK.tail = new THREE.Group(); DK.tail.position.set(0, 0.66, -0.43); DK.body.add(DK.tail); add(new THREE.CylinderGeometry(0.03, 0.05, 0.4, 6), tan, 0, 0.12, -0.12, DK.tail).rotation.x = -0.9;
    DK.legs = [[-0.11, 0.3], [0.11, 0.3], [-0.11, -0.3], [0.11, -0.3]].map(([x, z]) => { const g = new THREE.Group(); g.position.set(x, 0.44, z); DK.body.add(g); add(new THREE.BoxGeometry(0.08, 0.44, 0.08), tan, 0, -0.22, 0, g); add(new THREE.BoxGeometry(0.09, 0.06, 0.12), blk, 0, -0.42, 0.02, g); return g; }); }
  const KEN = [-79.9, -78.0, Math.PI]; const D = { x: KEN[0], z: KEN[1], y: 0, yaw: KEN[2], sp: 0, ph: 0, sit: 0, jump: -1, wag: 0, mode: 'home' }; duke.position.set(D.x, D.y, D.z);
  const leash = new THREE.Group(); leash.visible = false; K9G.add(leash); const LSEG = []; { const lg = new THREE.CylinderGeometry(touch ? 0.026 : 0.02, touch ? 0.026 : 0.02, 1, 5).translate(0, 0.5, 0); for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(lg, LM(RED)); leash.add(m); LSEG.push(m); } }
  const LUP = V(0, 1, 0), lA = V(), lB = V(), lP = V(), lQ = V(), lD = V();
  const leashTo = (ax, ay, az, b) => { lA.set(ax, ay, az); lB.copy(b); const L = lA.distanceTo(lB), sag = Math.max(0.05, 1.9 - L) * 0.32; for (let i = 0; i < 8; i++) { const t0 = i / 8, t1 = (i + 1) / 8; lP.lerpVectors(lA, lB, t0); lP.y -= sag * 4 * t0 * (1 - t0); lQ.lerpVectors(lA, lB, t1); lQ.y -= sag * 4 * t1 * (1 - t1); const m = LSEG[i]; m.position.copy(lP); lD.subVectors(lQ, lP); const n = lD.length(); m.scale.set(1, Math.max(0.001, n), 1); if (n > 1e-4) m.quaternion.setFromUnitVectors(LUP, lD.multiplyScalar(1 / n)); } };
  // the course in the town park: found once the town has finished building (a flat, clear 22 × 14 m spot, nearest the station)
  let KC = null; const K9 = { ok: false, w: null, o: null, ax: null, at: [], flora: 0 };
  const k9W = (u, v) => [K9.w[0] + u, K9.w[1] + v], k9O = (u, v) => { const [x, z] = k9W(u, v); return world ? world.inv(x, z) : [x, z]; };
  function k9Find() { if (K9.ok || !world) return; const home = world.fwd(-86, -76), hw = 12, hd = 8, h0 = x => (world.terrainAt ? world.terrainAt(x[0], x[1]) : 0);
    const clear = (cx, cz, strict) => { for (const c of cols) { if (c.on === false) continue; if (c.y0 != null && c.y0 < -1.5) continue; if (c.f) { if (c.f[1] > cx - hw && c.f[0] < cx + hw && c.f[3] > cz - hd && c.f[2] < cz + hd) return false; } else if (c.c) { if (Math.abs(c.c[0] - cx) < hw + c.c[2] && Math.abs(c.c[1] - cz) < hd + c.c[2]) return false; } }
      if (!KC) { try { KC = keepClear(LAY); } catch (e) { KC = () => false; } } if (strict) for (let u = -hw; u <= hw; u += 2.5) for (let v = -hd; v <= hd; v += 2.5) { if (KC(cx + u, cz + v, 0.6)) return false; const sf = LAY.surfaceAt ? LAY.surfaceAt(cx + u, cz + v) : 'grass'; if (sf !== 'grass') return false; }
      const h = h0([cx, cz]); if (h == null || h < -0.2 || h > 2.5) return false; for (const [dx, dz] of [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd], [0, 0]]) { const q = h0([cx + dx, cz + dz]); if (q == null || Math.abs(q - h) > 0.45) return false; } return true; };
    const cands = []; for (let x = -112; x <= 112; x += 6) for (let z = 46; z <= 134; z += 6) cands.push([x, z]); cands.sort((a, b) => Math.hypot(a[0] - home[0], a[1] - home[1]) - Math.hypot(b[0] - home[0], b[1] - home[1]));
    // s81: Ben's pick = the big lawn of the South Gardens east of the station (paths all round it, no path through it); its trees go (colliders + flora)
    const PICK = [-57, 49]; let w = null; { const [cx, cz] = PICK; for (let i = cols.length - 1; i >= 0; i--) { const c = cols[i]; if (c.c && c.c[2] < 1.6 && Math.abs(c.c[0] - cx) < hw + 1 && Math.abs(c.c[1] - cz) < hd + 1 && c.y0 == null) cols.splice(i, 1); } if (clear(cx, cz, true) || clear(cx, cz, false)) w = PICK; }
    if (!w) w = cands.find(([x, z]) => clear(x, z, true)) || cands.find(([x, z]) => clear(x, z, false)); if (!w) return; K9.w = w; K9.h = h0(w) || 0; K9.ok = true; buildCourse(); }
  function buildCourse() { const B = mk(), h = K9.h, put = (u, v) => k9O(u, v), a0 = put(0, 0), a1 = put(1, 0), yaw = Math.atan2(a1[0] - a0[0], a1[1] - a0[1]) - Math.PI / 2; K9.yaw = yaw;
    const at = (u, v, fn) => { const [x, z] = put(u, v); fn(x, z); };
    at(0, 0, (x, z) => B.put(new THREE.PlaneGeometry(24, 15).rotateX(-Math.PI / 2), x, h + 0.03, z, '#8fb06a', yaw));
    for (let i = -6; i <= 6; i++) for (const v of [-7.5, 7.5]) at(i * 2, v, (x, z) => { B.box(0.1, 0.9, 0.1, WHITE, x, h + 0.45, z); });
    for (const v of [-7.5, 7.5]) at(0, v, (x, z) => { B.box(24, 0.06, 0.06, WHITE, x, h + 0.75, z, yaw); B.box(24, 0.06, 0.06, WHITE, x, h + 0.35, z, yaw); });
    K9.st = { sit: [-8, 0], flag: [-1, 0], crates: [[4, -3], [4, 0], [4, 3]], hurdle: [9, 0], sign: [-11, -6] };
    at(...K9.st.sit, (x, z) => { B.cyl(0.9, 0.9, 0.02, YEL, x, h + 0.05, z, 24); B.cyl(0.78, 0.78, 0.022, '#8fb06a', x, h + 0.052, z, 24); });
    at(...K9.st.flag, (x, z) => { B.cyl(0.04, 0.04, 2.0, INK, x, h + 1.0, z, 6); B.box(0.6, 0.4, 0.02, RED, x + 0.3, h + 1.8, z, yaw); });
    K9.st.crates.forEach(([u, v]) => at(u, v, (x, z) => { B.box(0.7, 0.55, 0.7, '#9a7550', x, h + 0.28, z, yaw); B.box(0.72, 0.04, 0.72, '#5a3d26', x, h + 0.57, z, yaw); K9.at.push(world ? (() => { const [wx, wz] = k9W(u, v); const c = { c: [wx, wz, 0.45] }; cols.push(c); return c; })() : null); }));
    at(...K9.st.hurdle, (x, z) => { for (const s of [-1.1, 1.1]) { const [px, pz] = put(K9.st.hurdle[0], s); B.box(0.1, 0.9, 0.1, RED, px, h + 0.45, pz); if (world) { const [wx, wz] = k9W(K9.st.hurdle[0], s); cols.push({ c: [wx, wz, 0.12] }); } } B.box(0.06, 0.06, 2.2, WHITE, x, h + 0.55, z, yaw); B.box(0.06, 0.06, 2.2, RED, x, h + 0.35, z, yaw); });
    at(...K9.st.sign, (x, z) => { B.box(0.08, 1.6, 0.08, INK, x - 0.7, h + 0.8, z); B.box(0.08, 1.6, 0.08, INK, x + 0.7, h + 0.8, z); });
    K9G.add(new THREE.Mesh(B.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
    { const [x, z] = put(...K9.st.sign); const t = CT(256, 96, (g, W, H) => { g.fillStyle = NAVY; g.fillRect(0, 0, W, H); g.fillStyle = '#ffd23a'; g.font = '900 34px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('K-9 PARK', 14, 34); g.fillStyle = '#ffffff'; g.font = '900 20px Archivo, sans-serif'; g.fillText('MERU POLICE \u00b7 DUKE', 14, 72); }); const m = plane(t, 1.6, 0.6, x, h + 1.45, z, yaw + Math.PI, K9G, { side: THREE.DoubleSide }); }
    const bone = new THREE.Group(); { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 6), LM(WHITE)); b.rotation.z = Math.PI / 2; bone.add(b); for (const s of [-1, 1]) for (const t2 of [-1, 1]) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), LM(WHITE)); k.position.set(s * 0.11, t2 * 0.03, 0); bone.add(k); } } bone.visible = false; K9G.add(bone); K9.bone = bone;
    floraK9(); }
  const floraK9 = () => { if (!K9.ok) return; const [cx, cz] = K9.w; K9.fl = (K9.fl || 0) + floraRemove((x, z) => Math.abs(x - cx) < 14 && Math.abs(z - cz) < 10, { trees: true }); };
  const kO = (u, v) => { const [x, z] = k9O(u, v); return [x, z]; };
  const T11 = { walk: true,
    begin() { if (!K9.ok) k9Find(); if (!K9.ok) { toast('THE K-9 PARK IS SHUT TODAY', 2); NEXT('x', () => stop(), 0.1); return; } D.mode = 'lead'; leash.visible = true; J.step = 0; J.trail = []; J.box = Math.random() * 3 | 0; J.sn = [0, 0, 0]; bark(); toast('DUKE IS ON THE LEAD \u00b7 WALK HIM TO THE K-9 PARK', 2.6); },
    goal() { const h = K9.h || 0; const s = K9.st; const g = [kO(-12, 0), kO(...s.sit), kO(...s.flag), kO(2, 0), kO(4, -1.5), kO(s.hurdle[0] - 2.2, 0)][Math.min(J.step, 5)]; if (J.step === 4) { const i = J.sn.findIndex(x => !x); const c = s.crates[i < 0 ? J.box : i]; const p = kO(c[0], c[1] + 1.1); return [p[0], p[1], h]; } return [g[0], g[1], h]; },
    near(P, u, v, r = 1.4) { const [x, z] = kO(u, v); return Math.hypot(P.x - x, P.z - z) < r; },
    prompt(P) { const s = K9.st; if (J.step === 1 && this.near(P, ...s.sit)) return 'SIT, DUKE!'; if (J.step === 2 && this.near(P, ...s.flag, 1.6)) return 'HERE, DUKE!'; if (J.step === 4) { const i = s.crates.findIndex(c => this.near(P, c[0], c[1] + 1.1, 1.2)); if (i >= 0) return J.sn[i] === 2 ? 'OPEN THE CRATE' : 'SNIFF, DUKE!'; } if (J.step === 5 && this.near(P, s.hurdle[0] - 2.2, 0, 1.8)) return 'OVER, DUKE!'; return null; },
    talk(P) { const s = K9.st;
      if (J.step === 1 && this.near(P, ...s.sit)) { if ((P.sp || 0) > 0.4) { miss('STAND STILL FIRST, OR DUKE WON\'T SIT.', 1.6); return true; } D.mode = 'sit'; bark(); addGold(4); J.step = 2; toast('GOOD BOY! NOW WALK TO THE RED FLAG \u00b7 DUKE STAYS', 2.2); return true; }
      if (J.step === 2 && this.near(P, ...s.flag, 1.6)) { D.mode = 'come'; bark(); addGold(5); J.step = 3; toast('HERE HE COMES! WALK HIM TO THE CRATES', 2); return true; }
      if (J.step === 4) { const i = s.crates.findIndex(c => this.near(P, c[0], c[1] + 1.1, 1.2)); if (i < 0) return false;
        if (J.sn[i] === 2) { K9.bone.visible = true; const [x, z] = kO(s.crates[i][0], s.crates[i][1]); K9.bone.position.set(x, (K9.h || 0) + 0.7, z); ding(); addGold(6); J.step = 5; toast('A BONE \u2026 AND STOLEN PEARLS! NOW THE HURDLE', 2.2); return true; }
        if (J.sn[i] === 1) { miss('DUKE ALREADY SNIFFED THAT ONE. NOTHING THERE.', 1.6); return true; }
        J.sn[i] = i === J.box ? 2 : 1; J.sniff = { i, t: 0 }; if (i === J.box) { bark(); setTimeout(bark, 260); toast('WOOF! DUKE FOUND SOMETHING \u00b7 E TO OPEN IT', 2); } else toast('SNIFF\u2026 NOTHING HERE', 1.4); return true; }
      if (J.step === 5 && this.near(P, s.hurdle[0] - 2.2, 0, 1.8)) { D.jump = 0; bark(); addGold(6); NEXT('done', () => { K9.bone.visible = false; finishGame(); }, 1.4); return true; } return false; },
    tick(dt) { const P = J.P; if (!P) return; if (J.step === 0 && K9.ok && this.near(P, -12, 0, 6)) { J.step = 1; pop(); toast('IN THE PARK \u00b7 STAND IN THE YELLOW RING + E: SIT', 2.2); }
      if (J.step === 3 && D.mode === 'come' && Math.hypot(D.x - P.x, D.z - P.z) < 2) { D.mode = 'lead'; J.trail = [[D.x, D.y, D.z]]; J.step = 4; toast('GOOD BOY! NOW E AT EACH CRATE: SNIFF', 1.8); } },
    card() { const L = ['WALK DUKE TO THE K-9 PARK', 'SIT \u00b7 STAND IN THE RING + E', 'STAY \u00b7 WALK TO THE RED FLAG + E', 'COME \u00b7 DUKE RUNS TO YOU', 'SNIFF \u00b7 E AT EACH CRATE', 'JUMP \u00b7 RUN AT THE HURDLE + E'];
      return [L[Math.min(J.step, 5)], lst(L.map((t, i) => ['#b07a3a', t, i < J.step ? '\u2713' : '', i < J.step])), 'k' + J.step + J.sn.join('')]; },
    end() { D.mode = 'home'; leash.visible = false; if (K9.bone) K9.bone.visible = false; } };
  // ================= GAME 12: NIGHT WATCH (walk: Knox lends you the torch; a prisoner creeps for the door; light him up to catch him) =================
  const torchM = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.28, depthWrite: false }); const torch = new THREE.Mesh(new THREE.CircleGeometry(6, 24, -0.6, 1.2).rotateX(-Math.PI / 2), torchM); torch.position.y = 0.08; torch.visible = false; G.add(torch);
  const ROUTES = [[[-92, -114.6], [-107.4, -111], [-107.4, -97.6], [-88.8, -96.4], [-86, -95.4]], [[-80, -114.6], [-64.8, -111], [-64.8, -97.6], [-83.2, -96.4], [-86, -95.4]], [[-90, -113.5], [-96, -106], [-90, -99], [-86, -95.4]], [[-82, -113.5], [-76, -106], [-82, -99], [-86, -95.4]]];
  const T12 = { walk: true,
    begin() { J.caught = 0; J.seen = 0; torch.visible = true; if (PR) PR.hold = { x: -86, z: -96.3, yaw: Math.PI }; J.sub = 'wait'; J.wait = 2.5; toast('SGT. KNOX: "TAKE THE TORCH. SOMEONE ALWAYS TRIES IT. LIGHT THEM UP."', 2.8); },
    spawn() { const who = pickR([PRIS[1], PRIS[2]]), route = pickR(ROUTES.filter(r => (who === PRIS[1]) === (r[0][0] < -86))); J.sk = { p: who, route, i: 0, x: route[0][0], z: route[0][1], frz: 0 }; who.f.position.set(J.sk.x, 0, J.sk.z); J.sub = 'creep'; tone(240, 0.04, 0.2, 'triangle'); toast('A CLINK\u2026 SOMEONE IS OUT OF A CELL!', 1.8); },
    lit(P, x, z) { const dx = x - P.x, dz = z - P.z, d = Math.hypot(dx, dz), a = Math.atan2(dx, dz), da = Math.atan2(Math.sin(a - P.yaw), Math.cos(a - P.yaw)); return d < 6 && Math.abs(da) < 0.6; },
    tick(dt) { const P = J.P; if (!P) return; torch.position.set(P.x, 0.08, P.z); torch.rotation.y = P.yaw - Math.PI / 2;
      if (J.sub === 'wait') { J.wait -= dt; if (J.wait <= 0) this.spawn(); return; } if (J.sub !== 'creep') return; const S2 = J.sk, f = S2.p.f;
      if (this.lit(P, S2.x, S2.z)) { S2.frz = 0.5; J.seen += dt; f.rotation.y += dt * 6; if (J.seen > 0.7) { J.seen = 0; J.caught++; ding(); addGold(6); toast('GOTCHA! BACK IN YOUR CELL, ' + S2.p.n + '.', 1.6); f.position.set(S2.p.home[0], 0, S2.p.home[1]); f.rotation.y = S2.p.home[2]; J.sub = 'wait'; J.wait = rnd(2.5, 4); if (J.caught >= 3) NEXT('done', () => finishGame(), 0.8); } return; }
      J.seen = Math.max(0, J.seen - dt * 0.5); if (S2.frz > 0) { S2.frz -= dt; return; } const w = S2.route[S2.i], dx = w[0] - S2.x, dz = w[1] - S2.z, d = Math.hypot(dx, dz), sp = 0.85;
      if (d < 0.1) { if (++S2.i >= S2.route.length) { miss(S2.p.n + ' REACHED THE DOOR! KNOX GRABS HIM.', 1.8); f.position.set(S2.p.home[0], 0, S2.p.home[1]); f.rotation.y = S2.p.home[2]; J.sub = 'wait'; J.wait = 3; } return; }
      S2.x += dx / d * Math.min(d, sp * dt); S2.z += dz / d * Math.min(d, sp * dt); f.position.set(S2.x, 0, S2.z); f.rotation.y = Math.atan2(dx, dz); kit.animFox(f, dt, sp, false); },
    card() { return [J.sub === 'creep' ? 'FIND HIM \u00b7 POINT THE TORCH AT HIM' : 'LISTEN\u2026 WATCH THE CELLS', big(J.caught + ' / 3') + lab('HE FREEZES IN THE LIGHT \u00b7 HOLD IT ON HIM'), 'w' + J.caught + J.sub]; },
    end() { torch.visible = false; if (PR) PR.hold = null; for (const p of PRIS) { p.f.position.set(p.home[0], 0, p.home[1]); p.f.rotation.y = p.home[2]; } } };
  const GD = { desk: T1, mugshot: T2, finger: T3, wanted: T4, evidence: T5, cctv: T6, dispatch: T7, feed: T8, sketch: T9, parking: T10, k9: T11, watch: T12 };
  const grumbleOn = () => { const h = hour0(); return h >= 7 && h < 19; };
  // ================= run a game =================
  let lastP = null, outT = 0, lastFox = null;
  function startGame(g, P) { if (busy || (law && law.jail())) return; save.setStat('pdVisits', save.stat('pdVisits', 0) + 1); const q = GN[g];
    J = { g, C: null, miss: 0, gold: 0, objs: [], flies: [], att: [], t: 0, sub: '', pause: 0, P, down: !!q.down }; busy = 'job';
    if (P && RINGS[g] && !q.walk) { Object.assign(P, { x: RINGS[g][0], z: RINGS[g][1], sp: 0 }); if (q.down && (P.y || 0) > -2) Object.assign(P, { y: Y, vy: 0 }); else if (!q.down && (P.y || 0) < -2) Object.assign(P, { y: 0, vy: 0 }); }
    if (PR && PR.deskFox) PR.deskFox.visible = g !== 'desk'; GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; const g = J.g, q = GN[g], stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat('pdDone', d); save.setStat('pdN_' + g, save.stat('pdN_' + g, 0) + 1); const gift = giveGift(); K.finish(g, stars, gold, first); const P0 = J.P, walk = q.walk, dn = !!q.down, jail = !!q.jail; stop(); endClear = 7;
    if (P0 && !walk) { if (dn) Object.assign(P0, { x: g === 'finger' ? -95.6 : g === 'cctv' ? -92 : -77, z: g === 'finger' ? -95.2 : -116.6, sp: 0, yaw: Math.PI }); else Object.assign(P0, { x: RINGS[g][0], z: RINGS[g][1] + (g === 'desk' ? 0 : 1.2), sp: 0 }); }
    const k = save.stat('pdClears', 1) % 4;
    const OPEN = jail ? ['Tidy. The cells approve.', 'Good shift.', 'Quiet block. Nice.', 'Knox says thanks. He means it.'][k] : ['By the book. Well done.', 'Hm. Good work, rookie.', 'Tidy work. Don\'t let it go to your head.', 'Not bad. I might smile later.'][k];
    const GIFT = { uni: ' Your police uniform and cap. The Tailor keeps them too.', whistle: ' A police whistle. Duke comes running.', deputy: ' Deputy badge: your fines are halved.', cone: ' Knox will watch you less closely now.', bail: ' Free bail, once a day.', all: ' All twelve! The Golden Badge, plus 80 gold.', gold: ' 15 gold bonus.' }[gift] || '';
    sayTo(jail && knox ? knE : kwE, [(jail && knox ? lnK : lnC)(OPEN + ' ' + gold + ' gold.' + GIFT)]); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) { J.objs.forEach(o => o.parent && o.parent.remove(o)); J.att.forEach(o => o.parent && o.parent.remove(o)); if (J.cf) J.cf.visible = false; }
    if (PR && PR.deskFox) PR.deskFox.visible = true; busy = null; J = null; ptr.down = false; hideCard(); hidePick(); arrowM.visible = false; beacon.visible = false; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g]; if (g.ui && g.ui()) { hideCard(); return; } hidePick(); const c = g.card && g.card(); if (!c) { hideCard(); return; }
    setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? J.gold + ' G' : J.C ? 'FOR ' + J.C.name : 'MERU POLICE') + foot(c[0], g.walk) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; if (J.flies.length) flyTick(dt); const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return;
    const go = g.goal ? g.goal() : null; if (go) { const y0 = go[2] || 0; arrowM.visible = true; beacon.visible = true; arrowM.position.set(go[0], y0 + 1.9 + Math.sin(J.t * 4) * 0.15, go[1]); arrowM.rotation.y += dt * 2; beacon.position.set(go[0], y0 + 0.09, go[1]); [arrowM, beacon].forEach(o => { o.renderOrder = y0 < -1 ? -2 : 7; }); } else { arrowM.visible = false; beacon.visible = false; }
    drawCard(); }
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99, offK = 1]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * offK * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null, snapK = false; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !GD[J.g].walk && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = snapK ? 1 : Math.min(1, dt * 3.2); snapK = false; camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    const g = J.g, p = camCur.pos; if (DOWN[g]) { if (g === 'cctv') p.set(clamp(p.x, -99.6, -84.4), clamp(p.y, Y + 0.4, -0.45), clamp(p.z, -122.6, -112.3)); else if (g === 'dispatch') p.set(clamp(p.x, -83.6, -70.4), clamp(p.y, Y + 0.4, -0.45), clamp(p.z, -122.6, -112.3)); else p.set(clamp(p.x, -99.7, -70.3), clamp(p.y, Y + 0.35, -0.45), clamp(p.z, -111.7, -91.8)); }
    else p.set(clamp(p.x, -109.6, -62.4), clamp(p.y, 0.6, 3.5), clamp(p.z, -124.4, -80.6));
    cam.position.copy(p); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inPol = P => P.x > X0 && P.x < X1 && P.z > Z0 && P.z < Z1 - 0.2 && (P.y || 0) > -5 && (P.y || 0) < 3;
  const atFront = P => P.x > X0 && P.x < X1 && P.z > -80.2 && P.z < -70 && (P.y || 0) < 2 && (P.y || 0) > -1;
  const upL = P => (P.y || 0) > -1.5, downL = P => (P.y || 0) < -2;
  const ringAt = P => GAMES.find(q => Math.hypot(P.x - RINGS[q.k][0], P.z - RINGS[q.k][1]) < 1.05 && (DOWN[q.k] ? downL(P) : upL(P)));
  const nearChief = P => upL(P) && Math.hypot(P.x - chief.position.x, P.z - chief.position.z) < 2.3;
  const nearKnox = P => !!knox && upL(P) && P.z < -95 && Math.hypot(P.x - knox.position.x, P.z - knox.position.z) < 2.4;
  const nearJack = P => upL(P) && P.z > -116 && P.z < -113 && Math.hypot(P.x - jack.position.x, P.z - (-115.4)) < 2.2;
  function prompt(P) { if (law && law.jail()) return null; const iB = inPol(P), iO = atFront(P);
    if (J && GD[J.g].walk) { const gp = GD[J.g].prompt ? GD[J.g].prompt(P) : null; return gp || (nearChief(P) ? 'CHIEF BARKLEY \u00b7 STOP THE JOB' : nearKnox(P) ? 'SGT. KNOX \u00b7 STOP THE JOB' : null); } if (busy) return null; if (!iB && !iO) return null;
    const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (iB && upL(P) && K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; if (nearChief(P)) return 'TALK \u00b7 CHIEF BARKLEY'; if (nearKnox(P)) return 'TALK \u00b7 SGT. KNOX'; if (nearJack(P)) return 'TALK \u00b7 OLD JACK'; return null; }
  const HELLO = ['Chief Barkley. Twelve jobs here, all done by the book. You want work?', 'Back again. Good. The book says work first, talk later.', 'Rookie. This town does not keep itself safe. Ready?', 'Clean boots, sharp eyes. Let\'s see some work.'];
  const RULES = ['Rule one: be kind first. Rule two: write it down.', 'A good officer listens twice and speaks once.', 'Never run in the station. Unless Duke has your sandwich.', 'Every fine paid fixes a lamp somewhere in town.', 'The CCTV room sees everything. Mostly pigeons.', 'Duke outranks you. He has more medals.', 'Sgt. Knox runs the cells. Ask him for jail work.', 'Old Jack in cell two was trouble once. Now he gives advice.'];
  const K_HELLO = ['Sgt. Knox. I keep the cells. Jail work, if you want it.', 'Back on the block? Keys are on the board.', 'Quiet night so far. Want to keep it that way?'];
  const K_STORY = ['Mutt tried to dig out with a spoon. One week, one inch.', 'Old Jack escaped three times in one day, once. Now he makes the tea.', 'I count the bars every morning. Always forty.', 'Scraps sings at night. Badly. Earplugs are in the locker.'];
  const J_TIPS = ['Guards turn round at the ends of the hall. Move then.', 'Want gold? The bank pays steady. Crime never did.', 'Creep along the walls. The middle of the hall is bright.', 'Bail is cheaper than pride, kid.', 'Give Duke a biscuit and he is your friend for life.'];
  const J_STORY = ['I robbed the Meru train once. Got off at the wrong stop. The police stop.', 'Rook and me ran together, years back. He kept the gold. I kept the scar.', 'I stole the king\'s hat once. Gave it back. It didn\'t fit.', 'Barkley arrested me twice. Then he taught me to read. Good fox.'];
  const nextJob = jailSide => { const d = done(), list = GAMES.filter(q => !!q.jail === jailSide); return (list.find(q => !d[q.k]) || list.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  const chiefMenu = first => { const go = k => () => { if (!busy) startGame(k, lastP); };
    const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(false), lastP); } }, { text: 'THE FRONT DESK', pick: go('desk') }, { text: 'THE CCTV ROOM (DOWNSTAIRS)', pick: () => sayTo(kwT, [lnC('Down the stairs behind the desk, through the evidence room. The ring by the screens.')]) }, { text: 'K-9 TRAINING WITH DUKE', pick: go('k9') },
      { text: 'A RULE OF THE BOOK, PLEASE', pick: () => sayTo(kwT, [lnC(RULES[talkedF % RULES.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(kwT, [{ ...lnC(first ? HELLO[0] : HELLO[1 + (talkedF % 3)]), choices: ch }]); };
  const knoxMenu = first => { const go = k => () => { if (!busy) startGame(k, lastP); };
    const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(true), lastP); } }, { text: 'FEED THE PRISONERS', pick: go('feed') }, { text: 'NIGHT WATCH', pick: go('watch') },
      { text: 'A JAIL STORY, PLEASE', pick: () => sayTo(knT, [lnK(K_STORY[talkedT % K_STORY.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(knT, [{ ...lnK(first ? K_HELLO[0] : K_HELLO[1 + (talkedT % 2)]), choices: ch }]); };
  let talkedJ = 0; const jackMenu = () => { const ch = [{ text: 'A TIP, PLEASE', pick: () => sayTo(jkT, [lnJ(J_TIPS[talkedJ % J_TIPS.length])]) }, { text: 'A STORY FROM THE OLD DAYS', pick: () => sayTo(jkT, [lnJ(J_STORY[talkedJ % J_STORY.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(jkT, [{ ...lnJ(talkedJ++ ? 'Back again, kid? Pull up a bar.' : 'Old Jack. Retired outlaw. Want a tip, kid? Free, for once.'), choices: ch }]); };
  let knoxHold = 0;
  function talk(P) { lastP = P; if (law && law.jail()) return false; if (J && GD[J.g].walk) { if (GD[J.g].talk && GD[J.g].talk(P)) return true; if (nearChief(P) || nearKnox(P)) { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 1.8); return true; } return false; }
    if (busy) return true; if (!inPol(P) && !atFront(P)) return false; const r = ringAt(P); if (r) { startGame(r.k, P); return true; }
    if (inPol(P) && upL(P) && K.atHiring(P)) { ding(); startGame(nextJob(false), P); return true; }
    if (nearChief(P)) { tone(1320, 0.05, 0.6); chiefMenu(!talkedF++); return true; }
    if (nearKnox(P)) { tone(880, 0.05, 0.6); knoxHold = 6; if (PR) PR.hold = { x: PR.G.x, z: PR.G.z, yaw: Math.atan2(P.x - PR.G.x, P.z - PR.G.z) }; knT.ry = PR ? PR.hold.yaw : 0; knoxMenu(!talkedT++); return true; }
    if (nearJack(P)) { tone(660, 0.05, 0.5); jackMenu(); return true; } return false; }
  function quit() { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  // ---------- the look, every frame ----------
  let ovT = 0, chatT = 3, deskChat = 8, lastJobG = null;
  function lookTick(dt, t, P) { const h = hour0(), night = isNight();
    FANS.forEach((f, i) => { f.rotation.y += dt * (2.2 + i * 0.3); });
    { const a = steam.geometry.attributes.position.array; stD.forEach((s, i) => { s.t = (s.t + dt * 0.35) % 1; a[i * 3] = -89.9 + Math.sin(s.a + s.t * 5) * 0.04 * s.t; a[i * 3 + 1] = 1.42 + s.t * 0.42; a[i * 3 + 2] = -89.66 + Math.cos(s.a) * 0.03; }); steam.geometry.attributes.position.needsUpdate = true; steam.material.opacity = 0.35; }
    { const on = night, ph = (t * 2.2 | 0) % 2; LBR.color.set(on && ph ? '#ff2a1a' : '#5a1810'); LBB.color.set(on && !ph ? '#2a6bff' : '#10204a'); lbGlowR.visible = on && !!ph; lbGlowB.visible = on && !ph; }
    rainM.opacity += ((night ? 0.75 : 0) - rainM.opacity) * Math.min(1, dt * 0.8); rainT.offset.y = (rainT.offset.y - dt * 0.6) % 1;
    flashL.intensity = Math.max(0, flashL.intensity - dt * 30);
    { const on = grumbleOn() && !(J && J.g === 'feed' && false); grumble.visible = on; if (on) seat(grumble); }
    const ccRoom = downL(P) && P.x < -84 && P.z < -112 && P.z > -123 && P.x > -100, ccJob = J && J.g === 'cctv';
    if ((ccRoom || ccJob) && ccMake()) { if (!ccLive) { CC.start(); ccLive = true; } CC.tick(dt); } else if (ccLive && CC) { CC.stop(); ccLive = false; }
    SCR.forEach(s => { const map = ccLive && CC ? (CC.zoomed() === s.i ? CC.big : CC.tex[s.i]) : standbyT; if (s.m.material.map !== map) { s.m.material.map = map; s.m.material.needsUpdate = true; } if (s.alert > 0) s.alert -= dt; });
    if ((ovT -= dt) <= 0) { ovT = 0.5; if (ccLive || ccRoom) SCR.forEach(s => drawOverlay(s, t, ccLive)); if (Math.random() < 0.3) redrawT(staticT, (g, W, H) => { for (let i = 0; i < W; i += 2) for (let j = 0; j < H; j += 2) { const v = Math.random() * 200 | 0; g.fillStyle = 'rgb(' + v + ',' + v + ',' + (v + 20) + ')'; g.fillRect(i, j, 2, 2); } }); }
    { const c = rackLED.material; c.opacity = 0.5 + 0.5 * Math.abs(Math.sin(t * 7)); dispLED.material.opacity = 0.4 + 0.6 * ((t * 3 | 0) % 2); dispLED.material.color.set((t * 1.5 | 0) % 3 === 0 ? '#ec3013' : '#ffd23a'); }
    const dispRoom = downL(P) && P.x > -84 && P.x < -70 && P.z < -112; if (dispRoom && (chatT -= dt) <= 0) { chatT = rnd(3.5, 8); RADIO(); }
    if (inPol(P) && upL(P) && P.z > -95 && (deskChat -= dt) <= 0) { deskChat = rnd(14, 26); noise(0.25, 0.012, 2400); }
    if (PR) PR.coneK = save.stat('pdCone', false) ? 0.65 : 1;
    if (knoxHold > 0 && !(J && (J.g === 'feed' || J.g === 'watch'))) { knoxHold -= dt; if (knoxHold <= 0 || !nearKnox(P)) { if (knoxHold <= 0 && PR) PR.hold = null; } }
    // Duke: home by the kennel, or on the lead (follows your trail), sits, comes, jumps the hurdle
    { const P2 = P, py = P2.y || 0; let tx = KEN[0], tz = KEN[1], ty = 0, sp = 0;
      if (D.mode === 'lead' && J && J.trail) { const L0 = J.trail[J.trail.length - 1]; if (!L0 || Math.hypot(P2.x - L0[0], P2.z - L0[2]) > 0.15) { J.trail.push([P2.x, py, P2.z]); if (J.trail.length > 80) J.trail.shift(); }
        let need = 1.5, px = P2.x, pz = P2.z, at = J.trail[0]; for (let i = J.trail.length - 1; i >= 0; i--) { const q = J.trail[i], d = Math.hypot(q[0] - px, q[2] - pz); if (d >= need) { at = q; break; } need -= d; px = q[0]; pz = q[2]; } tx = at[0]; tz = at[2]; ty = at[1]; }
      else if (D.mode === 'come') { tx = P2.x + Math.sin(P2.yaw) * 1.2; tz = P2.z + Math.cos(P2.yaw) * 1.2; ty = py; }
      else if (D.mode === 'sit') { tx = D.x; tz = D.z; ty = D.y; }
      const dx = tx - D.x, dz = tz - D.z, d = Math.hypot(dx, dz), k = D.mode === 'come' ? 5 : 8; if (d > 0.05) { const v = Math.min(d, (D.mode === 'come' ? 6 : Math.max(1.5, d * 3)) * dt); D.x += dx / d * v; D.z += dz / d * v; sp = v / Math.max(dt, 1e-3); if (d > 0.3) { const yw = Math.atan2(dx, dz); D.yaw += Math.atan2(Math.sin(yw - D.yaw), Math.cos(yw - D.yaw)) * Math.min(1, dt * k); } }
      if (D.mode === 'home' && d < 0.3) { const yw = Math.atan2(P2.x - D.x, P2.z - D.z), near = Math.hypot(P2.x - D.x, P2.z - D.z) < 5; D.yaw += Math.atan2(Math.sin((near ? yw : KEN[2]) - D.yaw), Math.cos((near ? yw : KEN[2]) - D.yaw)) * Math.min(1, dt * 3); }
      D.y += (ty - D.y) * Math.min(1, dt * 8); let jy = 0; if (D.jump >= 0) { D.jump += dt / 0.8; jy = Math.sin(Math.min(1, D.jump) * Math.PI) * 0.9; if (D.jump >= 1) D.jump = -1; }
      D.ph += dt * (sp > 0.3 ? 9 + sp : 0); D.sit += (((D.mode === 'sit' || (D.mode === 'home' && sp < 0.3)) ? 1 : 0) - D.sit) * Math.min(1, dt * 6);
      duke.position.set(D.x, D.y + jy, D.z); duke.rotation.y = D.yaw; DK.body.rotation.x = -D.sit * 0.45; DK.body.position.y = -D.sit * 0.12; DK.head.rotation.x = D.sit * 0.45;
      DK.legs.forEach((l, i) => { l.rotation.x = sp > 0.3 ? Math.sin(D.ph + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.6 : i > 1 ? D.sit * 1.0 : D.sit * 0.45; });
      D.wag += dt * (D.mode === 'come' || (J && J.sniff) ? 22 : 8); DK.tail.rotation.y = Math.sin(D.wag) * 0.5;
      if (J && J.sniff) { J.sniff.t += dt; DK.head.rotation.x = 0.5; if (J.sniff.t > 1.2) J.sniff = null; }
      if (leash.visible) { const hp = DK.head.getWorldPosition(V()); K9G.updateWorldMatrix(true, false); K9G.worldToLocal(hp); hp.y -= 0.12; leashTo(P2.x + Math.sin(P2.yaw + 0.9) * 0.34, py + 0.92, P2.z + Math.cos(P2.yaw + 0.9) * 0.34, hp); } }
  }
  // ---------- per frame ----------
  let k9T = 0;
  const chevPulse = t => { const C = G.userData.upChev; if (!C) return; for (const c of C) c.m.material.opacity = 0.45 + 0.55 * Math.max(0, Math.sin(t * 4 - c.d * 0.5)); };
  function tick(dt, P, fox) { chevPulse(performance.now() / 1000); const t = performance.now() / 1000, d = Math.hypot(P.x + 86, P.z + 102); G.visible = d < (touch ? 75 : 140) || !!(J && J.g === 'k9'); toastT -= dt; applyWear(fox); lastP = P; lastFox = fox;
    if (!K9.ok) { k9T += dt; if (k9T > 4) { k9T = -20; k9Find(); } } else if (K9.flora < 4 && (k9T += dt) > 8) { k9T = 0; floraK9(); K9.flora++; }
    K9G.visible = d < (touch ? 90 : 150) || !!(J && J.g === 'k9') || (K9.ok && Math.hypot(P.x - kO(0, 0)[0], P.z - kO(0, 0)[1]) < (touch ? 80 : 140));
    if (busy === 'job' && J) { const g = J.g, ok = g === 'k9' ? true : OUT[g] ? atFront(P) || inPol(P) : inPol(P); outT = ok ? 0 : outT + dt; if (outT > (GD[g].walk ? 2 : 0.3)) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); }
      if (J && g === 'k9' && K9.ok && Math.hypot(P.x - kO(0, 0)[0], P.z - kO(0, 0)[1]) > 220) { stop(); toast('TOO FAR FROM THE PARK \u00b7 DUKE WENT HOME', 2); } }
    if (busy === 'job' && J && !GD[J.g].walk && fox) fox.visible = false;
    if (!G.visible && !K9G.visible) return; if (busy === 'job' && J) jobTick(dt, P); hintTick(t); lookTick(dt, t, P);
    if (busy === 'job' && J && !GD[J.g].walk) chief.rotation.y += Math.atan2(Math.sin(CH0[2] - chief.rotation.y), Math.cos(CH0[2] - chief.rotation.y)) * Math.min(1, dt * 3);
    { const nj = upL(P) && P.z < -112 && Math.hypot(P.x - jack.position.x, P.z - jack.position.z) < 6; const a = nj ? Math.atan2(P.x - jack.position.x, P.z - jack.position.z) : Math.sin(t * 0.4) * 0.3; jack.rotation.y += Math.atan2(Math.sin(a - jack.rotation.y), Math.cos(a - jack.rotation.y)) * Math.min(1, dt * 3); }
    for (const f of [jack, mutt, scraps]) if (!(J && J.g === 'watch' && J.sk && J.sk.p.f === f && J.sub === 'creep')) kit.animFox(f, dt, 0, false);
    endClear -= dt; K.tick(dt, P, { inShop: inPol(P) && upL(P) && P.z > -95, busy: !!busy, near: Math.hypot(P.x + 86, P.z + 88), talking: false, clear: endClear > 0 ? [-86, -87.5, 3.0] : null }); }
  const API = { group: G, k9group: K9G, prompt, talk, tick, camFix, quit, busy: () => (busy && J && GD[J.g].walk ? null : busy), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), chief, GD, RINGS, toW, K9, D, cc: () => CC, P: () => lastP,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    snap() { snapK = true; }, _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) { if (busy === 'job' && J && lastP) jobTick(dt, lastP); if (lastP) lookTick(dt, performance.now() / 1000, lastP); } }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), pick, card, k9Find,
    dispose() { card.remove(); pick.remove(); HINT.remove(); FLASH.remove(); K.dispose(); if (CC) CC.dispose(); } };
  window.__police = API; return API;
}
