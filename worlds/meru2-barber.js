// MERU 2.0 — s46 TOWN 2 INTERIOR 4: BARBER SHOP [meruBarber] (f -54..-40 × -168..-152, door S (-47, -152)).
// SNIP (Ben's pick): calm, stylish barber, slick black quiff, striped apron, very cool lines.
// ONE VISIT, ALL STEPS (Ben): a Meru regular sits in the chair → 1 SHAVE (drag the brush over the stubble, then the razor over the foam)
// → 2 TRIM (drag the clippers along 3 yellow guide lines; the overgrown tufts fall) → 3 STYLE (pick the look they asked for, comb along
// the strokes, dab the gel) → the customer turns happy and pays. DRAG controls (phone first; mouse drag on desktop). GENTLE: no fail.
// Prizes (Ben): fur styles + moustache / beard looks + the striped APRON (worn anywhere in Meru 2, set at the STYLE MIRROR),
// GOLDEN COMB (item: +25 % gold at Snip's), HAIR TONIC (heal item).
// s65 INTERIOR POLISH 4: shopKit (Snip = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board; badge), NOW HIRING by the door,
// one-box menu with choices, one-box end line, yellow ring at the work chair, hint hand after 3 s, touch rings + radius ×1.3, portrait wide lens, camera kept in the room.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { applyD, lifeD } from '../engine/fox-poses.js?v=s648k';   // s630 life poses
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
export function buildBarber({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted }) { const JW = jobWorker(THREE);
  const X0 = -53.6, X1 = -40.4, Z0 = -167.6, Z1 = -152.4, CX = -47, CZ = -160;
  const G = new THREE.Group(); G.name = 'barberShop'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), { put, box, cyl, sph } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const ringC = (x, z, r) => cols.push({ c: [x, z, r] }), rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] });
  const INK = '#201e1d', NAVY = '#22324a', CHROME = '#c9ced3', LEATHER = '#b3202a', WOOD = '#6b4a2e', WOOD2 = '#4e3420', TILE = '#f3f2f2', TEAL = '#33b8c4';
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = '900 ' + fs + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 12, H / 2 + 2); });
  const plane = (map, w, h, x, y, z, ry = 0, opt = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, ...opt })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  // ---------- floor: black + white checker ----------
  { const t = CT(128, 128, (g) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#201e1d' : '#ecebe6'; g.fillRect(i * 32, j * 32, 32, 32); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 2, (Z1 - Z0) / 2); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f); }
  // ---------- walls: white tile wainscot, ink rail, navy upper wall, red / white / blue band ----------
  const wall = (len, x, z, ry, full = true) => { box(len, 1.2, 0.05, TILE, x, 0.6, z, ry); for (let u = -len / 2 + 0.3; u < len / 2; u += 0.3) box(0.012, 1.2, 0.06, '#cfcac3', x + Math.cos(ry) * u, 0.6, z - Math.sin(ry) * u, ry);
    for (const y of [0.3, 0.6, 0.9]) box(len, 0.012, 0.06, '#cfcac3', x, y, z, ry); box(len, 0.08, 0.1, INK, x, 1.22, z, ry); if (!full) return;
    box(len, 3.0, 0.05, NAVY, x, 2.75, z, ry); ['#ec3013', '#f3f2f2', '#2e86b8'].forEach((c, i) => box(len, 0.12, 0.07, c, x, 3.72 - i * 0.12, z, ry)); };
  wall(X1 - X0, CX, Z0 + 0.03, 0); wall(Z1 - Z0, X0 + 0.03, CZ, Math.PI / 2); wall(Z1 - Z0, X1 - 0.03, CZ, Math.PI / 2);
  for (const [a, b] of [[X0, -48.4], [-45.6, X1]]) wall(b - a, (a + b) / 2, Z1 - 0.03, 0, false);
  // ---------- back wall: long MIRROR over a black counter (jars, clippers, tonic bottles), shelf of bottles, towel steamer ----------
  const mirM = new THREE.MeshPhongMaterial({ color: 0xcfe0ea, shininess: 120, specular: 0xffffff });
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(11.2, 1.5), mirM); m.position.set(CX, 1.95, Z0 + 0.07); G.add(m); box(11.4, 0.08, 0.06, CHROME, CX, 2.74, Z0 + 0.07); box(11.4, 0.08, 0.06, CHROME, CX, 1.17, Z0 + 0.07); for (const x of [CX - 5.66, CX + 5.66, CX - 1.95, CX + 1.95]) box(0.07, 1.6, 0.06, CHROME, x, 1.95, Z0 + 0.08); }
  box(11.6, 0.9, 0.56, INK, CX, 0.45, Z0 + 0.33); box(11.8, 0.05, 0.64, TILE, CX, 0.925, Z0 + 0.35); for (let x = CX - 5.3; x < CX + 5.5; x += 1.2) box(0.3, 0.03, 0.03, CHROME, x, 0.75, Z0 + 0.62); rect(X0, X1, Z0, Z0 + 0.7);
  box(11.6, 0.05, 0.26, WOOD, CX, 2.95, Z0 + 0.16); for (let x = CX - 5.5, i = 0; x < CX + 5.6; x += 0.32, i++) { const c = ['#ffd23a', '#3f7a52', '#ec3013', '#2e86b8', '#f3f2f2', '#c9a14a'][i % 6], h = 0.18 + (i % 3) * 0.05; cyl(0.05, 0.06, h, c, x, 2.98 + h / 2, Z0 + 0.16, 8); cyl(0.022, 0.022, 0.05, INK, x, 3.0 + h, Z0 + 0.16, 6); }
  for (const x of [-51, -47, -43]) { cyl(0.08, 0.08, 0.26, TEAL, x - 0.55, 1.08, Z0 + 0.36, 12); for (let k = 0; k < 3; k++) box(0.012, 0.22, 0.05, INK, x - 0.6 + k * 0.05, 1.2, Z0 + 0.36); box(0.08, 0.06, 0.2, INK, x + 0.5, 0.98, Z0 + 0.38, 0.3); box(0.06, 0.02, 0.06, CHROME, x + 0.5, 1.0, Z0 + 0.27, 0.3);
    cyl(0.045, 0.045, 0.22, ['#ec3013', '#3f7a52', '#ffd23a'][(x + 51) / 4], x + 0.85, 1.06, Z0 + 0.36, 8); box(0.3, 0.02, 0.2, '#f7f1e6', x, 0.96, Z0 + 0.4); }
  box(0.6, 0.45, 0.45, CHROME, -52.8, 1.17, Z0 + 0.35); box(0.5, 0.06, 0.4, INK, -52.8, 1.42, Z0 + 0.35); for (let k = 0; k < 4; k++) cyl(0.04, 0.04, 0.4, '#f7f1e6', -52.95 + k * 0.1, 1.15, Z0 + 0.6, 8, 0, Math.PI / 2);
  // ---------- 2 BARBER CHAIRS facing the mirror (centre = the work chair, east = Snip's) + the STYLE MIRROR mat (west) ----------
  const CH = { x: -47, z: -163.7 }, SEAT = 0.67;
  const chair = (x, z) => { cyl(0.34, 0.38, 0.06, CHROME, x, 0.1, z, 18); cyl(0.08, 0.08, 0.42, CHROME, x, 0.34, z, 10); box(0.66, 0.04, 0.64, CHROME, x, 0.55, z); box(0.62, 0.14, 0.6, LEATHER, x, 0.61, z);
    box(0.62, 0.78, 0.12, LEATHER, x, 1.08, z + 0.33, 0, 0.12); box(0.66, 0.05, 0.14, CHROME, x, 0.69, z + 0.31); box(0.32, 0.16, 0.1, LEATHER, x, 1.6, z + 0.42, 0, 0.12); box(0.04, 0.2, 0.04, CHROME, x, 1.47, z + 0.41);
    for (const s of [-1, 1]) { box(0.1, 0.05, 0.52, LEATHER, x + s * 0.37, 0.87, z - 0.02); box(0.06, 0.03, 0.56, CHROME, x + s * 0.37, 0.84, z - 0.02); box(0.04, 0.2, 0.04, CHROME, x + s * 0.37, 0.74, z + 0.18); box(0.04, 0.2, 0.04, CHROME, x + s * 0.37, 0.74, z - 0.22); }
    box(0.5, 0.04, 0.22, CHROME, x, 0.26, z - 0.5); for (const s of [-1, 1]) box(0.03, 0.03, 0.4, CHROME, x + s * 0.2, 0.42, z - 0.33, 0, 0.7); box(0.12, 0.04, 0.2, INK, x + 0.3, 0.1, z + 0.3); ringC(x, z, 0.5); };
  chair(CH.x, CH.z); chair(-43, CH.z);
  const MIR = { x: -51, z: -163.5 }; cyl(0.75, 0.75, 0.02, '#7a2a3a', MIR.x, 0.08, MIR.z, 24); cyl(0.65, 0.65, 0.022, '#ec3013', MIR.x, 0.085, MIR.z, 24);
  plane(label('STYLE MIRROR', INK, '#ffd23a', 320, 64, 36), 1.4, 0.28, MIR.x, 2.55, Z0 + 0.09);
  // ---------- east: waiting BENCH (the queue), coat stand, plant ----------
  const BENCH = { x: X1 - 0.45, z0: -161.4, z1: -156.0, y: 0.66 };   // s181 FOX SCALE seat (was 0.52); the queue sits at BENCH.y - 0.5
  box(0.52, 0.08, BENCH.z1 - BENCH.z0, WOOD, BENCH.x, BENCH.y - 0.04, (BENCH.z0 + BENCH.z1) / 2); box(0.06, 0.66, BENCH.z1 - BENCH.z0, WOOD2, X1 - 0.12, 1.0, (BENCH.z0 + BENCH.z1) / 2); for (const z of [BENCH.z0 + 0.2, (BENCH.z0 + BENCH.z1) / 2, BENCH.z1 - 0.2]) box(0.4, 0.6, 0.06, WOOD2, BENCH.x, 0.32, z);
  rect(X1 - 0.75, X1, BENCH.z0, BENCH.z1); box(0.34, 0.4, 0.34, WOOD2, BENCH.x, 0.27, BENCH.z0 - 0.45); for (let k = 0; k < 3; k++) box(0.26, 0.02, 0.32, ['#ec3013', '#ffd23a', '#2e86b8'][k], BENCH.x, 0.48 + k * 0.025, BENCH.z0 - 0.45, k * 0.3);
  cyl(0.03, 0.03, 1.9, INK, X1 - 0.5, 1.02, -153.3, 8); cyl(0.25, 0.28, 0.04, INK, X1 - 0.5, 0.09, -153.3, 14); for (let k = 0; k < 4; k++) box(0.25, 0.03, 0.03, INK, X1 - 0.5 + Math.cos(k * 1.57) * 0.1, 1.85, -153.3 + Math.sin(k * 1.57) * 0.1, -k * 1.57); cyl(0.17, 0.2, 0.12, '#3d3b3a', X1 - 0.5, 1.96, -153.3, 12); cyl(0.26, 0.26, 0.02, '#3d3b3a', X1 - 0.5, 1.9, -153.3, 14); ringC(X1 - 0.5, -153.3, 0.3);
  cyl(0.22, 0.17, 0.4, '#b0573a', X1 - 0.5, 0.27, -166.6, 12); for (let k = 0; k < 7; k++) sph(0.2, '#3f7a52', X1 - 0.5 + Math.cos(k) * 0.14, 0.75 + (k % 3) * 0.18, -166.6 + Math.sin(k) * 0.14); ringC(X1 - 0.5, -166.6, 0.3);
  // ---------- west: shampoo SINK, STYLE BOARD (the 7 looks), barber pole ----------
  cyl(0.28, 0.2, 0.25, INK, X0 + 0.45, 0.95, -165.9, 16); cyl(0.07, 0.09, 0.8, INK, X0 + 0.45, 0.45, -165.9, 10); box(0.05, 0.3, 0.05, CHROME, X0 + 0.15, 1.2, -165.9); box(0.25, 0.04, 0.04, CHROME, X0 + 0.27, 1.34, -165.9); ringC(X0 + 0.45, -165.9, 0.35);
  const STYLES = [{ key: 'quiff', name: 'SLICK QUIFF', comb: 'up' }, { key: 'spikes', name: 'SPIKES', comb: 'up' }, { key: 'braids', name: 'BRAIDS', comb: 'down' }, { key: 'mohawk', name: 'MOHAWK', comb: 'up' },
    { key: 'mane', name: 'SHAGGY MANE', comb: 'down' }, { key: 'sidepart', name: 'NEAT SIDE PART', comb: 'side' }, { key: 'topknot', name: 'TOP KNOT', comb: 'up' }], SNAME = Object.fromEntries(STYLES.map(s => [s.key, s.name]));
  const BEARDS = [{ key: 'stache', name: 'HANDLEBAR MOUSTACHE' }, { key: 'goatee', name: 'GOATEE' }, { key: 'beard', name: 'FULL BEARD' }, { key: 'chops', name: 'MUTTON CHOPS' }], BNAME = Object.fromEntries(BEARDS.map(s => [s.key, s.name]));
  { const tex = CT(1024, 512, (g, W, H) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, W, H); g.fillStyle = '#ec3013'; g.fillRect(0, 0, W, 78); g.fillStyle = '#fff'; g.font = '900 52px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('THE LOOKS', 24, 42);
      g.strokeStyle = '#201e1d'; g.lineWidth = 4; g.strokeRect(2, 2, W - 4, H - 4);
      STYLES.forEach((s, i) => { const cw = W / 4, cx = (i % 4) * cw + cw / 2, cy = 78 + (i < 4 ? 0 : 1) * 217 + 96, r = 46; g.lineWidth = 3; g.strokeStyle = '#201e1d'; g.strokeRect((i % 4) * cw + 8, cy - 92, cw - 16, 206);
        g.fillStyle = '#ec3013'; const k = s.key;
        if (k === 'mane') { g.beginPath(); g.arc(cx, cy + 6, r + 26, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(cx - r * 0.95, cy - r * 0.2); g.lineTo(cx - r * 0.75, cy - r * 1.35); g.lineTo(cx - r * 0.2, cy - r * 0.8); g.fill(); g.beginPath(); g.moveTo(cx + r * 0.95, cy - r * 0.2); g.lineTo(cx + r * 0.75, cy - r * 1.35); g.lineTo(cx + r * 0.2, cy - r * 0.8); g.fill();
        g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ec3013';
        if (k === 'quiff') { g.beginPath(); g.ellipse(cx + 6, cy - r * 0.85, r * 0.75, r * 0.4, -0.25, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(cx + r * 0.55, cy - r * 0.95, r * 0.28, 0, Math.PI * 2); g.fill(); }
        if (k === 'spikes') for (let j = -2; j <= 2; j++) { g.beginPath(); g.moveTo(cx + j * 16 - 10, cy - r * 0.75); g.lineTo(cx + j * 18, cy - r * 1.6 + Math.abs(j) * 8); g.lineTo(cx + j * 16 + 10, cy - r * 0.75); g.fill(); }
        if (k === 'braids') { g.beginPath(); g.ellipse(cx, cy - r * 0.7, r * 0.85, r * 0.38, 0, 0, Math.PI * 2); g.fill(); for (const sd of [-1, 1]) for (let j = 0; j < 5; j++) { g.beginPath(); g.arc(cx + sd * r * 0.95, cy - r * 0.2 + j * 15, 8, 0, Math.PI * 2); g.fill(); } }
        if (k === 'mohawk') { g.fillRect(cx - 9, cy - r * 1.75, 18, r * 1.0); g.beginPath(); g.moveTo(cx - 9, cy - r * 1.75); g.lineTo(cx, cy - r * 2.05); g.lineTo(cx + 9, cy - r * 1.75); g.fill(); }
        if (k === 'sidepart') { g.beginPath(); g.ellipse(cx + 4, cy - r * 0.7, r * 0.92, r * 0.42, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#f3f2f2'; g.fillRect(cx - r * 0.35, cy - r * 1.05, 4, r * 0.4); }
        if (k === 'topknot') { g.beginPath(); g.ellipse(cx, cy - r * 0.72, r * 0.8, r * 0.34, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(cx, cy - r * 1.25, r * 0.36, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = '#201e1d'; g.font = '900 24px Archivo, sans-serif'; g.fillText(s.name, (i % 4) * cw + 20, cy + 92); });
      g.fillStyle = '#201e1d'; g.font = '800 22px Archivo, sans-serif'; g.fillText('ASK SNIP', 3 * (W / 4) + 20, 78 + 217 + 96); });
    plane(tex, 4.0, 2.0, X0 + 0.07, 2.15, -160.2, Math.PI / 2); box(0.04, 2.1, 4.1, INK, X0 + 0.055, 2.15, -160.2); }
  const poleTex = CT(64, 256, (g, w, h) => { const c = ['#ec3013', '#f3f2f2', '#2e86b8', '#f3f2f2']; for (let y = -h; y < h * 2; y += 32) { g.fillStyle = c[((y / 32) % 4 + 4) % 4]; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y - 40); g.lineTo(w, y - 8); g.lineTo(0, y + 32); g.fill(); } });
  poleTex.wrapS = poleTex.wrapT = THREE.RepeatWrapping;
  { const px = X0 + 0.32, pz = -153.2; cyl(0.2, 0.2, 0.14, '#c9a14a', px, 0.95, pz, 14); cyl(0.2, 0.2, 0.14, '#c9a14a', px, 2.85, pz, 14); sph(0.2, '#f3f2f2', px, 3.05, pz); box(0.3, 0.06, 0.06, '#c9a14a', px - 0.15, 1.9, pz);
    const pm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.76, 14, 1, true), new THREE.MeshBasicMaterial({ map: poleTex })); pm.position.set(px, 1.9, pz); G.add(pm); ringC(px, pz, 0.3); }
  // ---------- front east: the TILL counter + a record player ----------
  box(1.9, 1.0, 0.7, WOOD2, -42.2, 0.5, -154.5); box(2.0, 0.05, 0.8, INK, -42.2, 1.02, -154.5); for (const x of [-42.9, -42.2, -41.5]) box(0.04, 0.8, 0.03, CHROME, x, 0.5, -154.14); rect(-43.2, -41.2, -154.9, -154.1);
  box(0.45, 0.28, 0.38, '#c9a14a', -41.6, 1.18, -154.6); box(0.38, 0.1, 0.24, INK, -41.6, 1.36, -154.64, 0, -0.35); box(0.5, 0.12, 0.42, WOOD, -42.6, 1.1, -154.55); cyl(0.17, 0.17, 0.015, INK, -42.6, 1.17, -154.55, 18); cyl(0.04, 0.04, 0.018, '#ec3013', -42.6, 1.18, -154.55, 10);
  // ---------- hanging SNIP sign, pendants ----------
  { const sX = -47, sY = 3.5, sZ = -159.2; for (const x of [sX - 0.6, sX + 0.6]) cyl(0.008, 0.008, 0.9, '#3d3b3a', x, sY + 0.55, sZ, 3); const SG = label('SNIP · CUTS · SHAVES', INK, '#ffd23a', 640, 96, 54); const s1 = plane(SG, 2.8, 0.42, sX, sY, sZ + 0.01); const s2 = s1.clone(); s2.rotation.y = Math.PI; s2.position.z = sZ - 0.01; G.add(s2); }
  const bulbs = []; for (const [x, z] of [[-51, -162.6], [-47, -162.6], [-43, -162.6], [-42.2, -155.4], [-51.5, -157.5]]) { cyl(0.01, 0.01, 1.2, '#3d3b3a', x, 4.5, z, 3); put(new THREE.ConeGeometry(0.26, 0.26, 12, 1, true), x, 3.85, z, INK); bulbs.push([x, 3.74, z]); }
  G.add(new THREE.Mesh(R0.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  { const lm = new THREE.MeshBasicMaterial({ color: 0xffe2a8 }), im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 8, 5), lm, bulbs.length), M4 = new THREE.Matrix4(); bulbs.forEach((p, i) => { M4.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(i, M4); }); G.add(im); }
  const fans = [-50, -44].map(x => { const F = mk(); F.cyl(0.12, 0.12, 0.12, '#c9a14a', 0, 0, 0, 12); for (let k = 0; k < 4; k++) F.box(0.9, 0.02, 0.18, WOOD, Math.cos(k * Math.PI / 2) * 0.55, -0.02, Math.sin(k * Math.PI / 2) * 0.55, -k * Math.PI / 2);
    const f = new THREE.Mesh(F.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })); f.position.set(x, 3.95, -158.8); G.add(f); const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 5), new THREE.MeshLambertMaterial({ color: 0xc9a14a })); rod.position.set(x, 4.3, -158.8); G.add(rod); return f; });
  // ================= HAIR, BEARDS, APRON (shared by customers, Snip and the player) =================
  const matC = {}; const LMc = c => matC[c] || (matC[c] = new THREE.MeshLambertMaterial({ color: c }));
  const UP = V(0, 1, 0);
  const surf = (a, e, k = 1.04, L = {}) => V(Math.sin(a) * Math.cos(e) * 0.4 * (L.headWidth || 1) * k, Math.sin(e) * 0.4 * (L.headHeight || 0.96) * k, Math.cos(a) * Math.cos(e) * 0.4 * k);
  const coneOut = (grp, m, p, dir, r, h, seg = 6) => { const d = dir.clone().normalize(), o = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m); o.quaternion.setFromUnitVectors(UP, d); o.position.copy(p).addScaledVector(d, h * 0.38); grp.add(o); return o; };
  const ball = (grp, m, r, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); grp.add(o); return o; };
  function makeHair(style, hc, L = {}, mat) { const g = new THREE.Group(), m = mat || LMc(hc), hw = L.headWidth || 1, hh = L.headHeight || 0.96, top = 0.4 * hh;
    const cap = (k = 1.06, th = 0.42) => { const c = new THREE.Mesh(new THREE.SphereGeometry(0.4, 18, 8, 0, Math.PI * 2, 0, Math.PI * th), m); c.scale.set(hw * k, hh * k, k); c.rotation.x = -0.3; g.add(c); return c; };
    if (style === 'quiff') { cap(); ball(g, m, 0.16, 0, top + 0.03, 0.1, 1.5, 0.7, 1.6).rotation.x = -0.35; ball(g, m, 0.11, 0.03, top + 0.07, 0.27, 1.4, 0.85, 1.0); }
    else if (style === 'spikes') { cap(1.04); for (const [a, e] of [[0, 1.2], [-0.5, 1.0], [0.5, 1.0], [-0.95, 0.72], [0.95, 0.72], [0, 0.85], [-0.3, 1.45], [0.3, 1.45], [0, 1.75]]) coneOut(g, m, surf(a, e, 0.98, L), surf(a, e, 1, L), 0.075, 0.32); }
    else if (style === 'braids') { cap(1.07, 0.48); for (const s of [-1, 1]) { for (let i = 0; i < 7; i++) ball(g, m, 0.068 - i * 0.004, s * (0.34 * hw + (i % 2 ? 0.015 : -0.015)), 0.1 - i * 0.1, -0.08 - i * 0.012); ball(g, LMc('#ec3013'), 0.04, s * 0.34 * hw, 0.1 - 7 * 0.1 + 0.03, -0.17); } }
    else if (style === 'mohawk') { for (let t = 0.45, i = 0; t < 2.5; t += 0.29, i++) { const d = V(0, Math.sin(t), Math.cos(t)), o = coneOut(g, m, d.clone().multiplyScalar(0.39), d, 0.08, 0.4 - Math.abs(t - 1.3) * 0.1); o.scale.x = 0.42; } }
    else if (style === 'mane') { cap(1.08, 0.5); for (let a = -2.7; a <= 2.71; a += 0.38) { if (Math.abs(a) < 0.95) continue; for (const e of [0.0, 0.45]) coneOut(g, m, surf(a, e, 0.98, L), surf(a, e - 0.55, 1, L), 0.1, 0.34); }
      for (const [a, e] of [[0, 1.05], [-0.42, 0.95], [0.42, 0.95]]) coneOut(g, m, surf(a, e, 1.0, L), surf(a, e - 0.9, 1, L), 0.085, 0.24); }
    else if (style === 'sidepart') { cap(1.08, 0.44); const sw = ball(g, m, 0.2, 0.07, top + 0.0, 0.1, 1.35, 0.45, 1.2); sw.rotation.z = -0.3; const p = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.012, 0.34), LMc('#f3ead8')); p.position.set(-0.13, top + 0.045, 0.02); p.rotation.z = 0.32; g.add(p); }
    else if (style === 'topknot') { cap(1.05, 0.44); ball(g, m, 0.13, 0, top + 0.12, -0.04); const b = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.026, 6, 16), LMc('#ec3013')); b.position.set(0, top + 0.05, -0.04); b.rotation.x = Math.PI / 2; g.add(b); }
    return g; }
  function makeBeard(kind, hc, L = {}) { const g = new THREE.Group(), m = LMc(hc), tipZ = 0.3 + 0.25 * (L.snoutLength || 1) * 1.6, hw = L.headWidth || 1;
    if (kind === 'stache') { for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.14, 4, 8), m); c.position.set(s * 0.1, -0.11, tipZ - 0.03); c.rotation.z = s * 1.25; c.rotation.y = -s * 0.35; g.add(c); ball(g, m, 0.045, s * 0.2, -0.05, tipZ - 0.1); } }
    else if (kind === 'goatee') { const c = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.22, 8), m); c.position.set(0, -0.36, 0.3); c.rotation.x = Math.PI + 0.25; g.add(c); ball(g, m, 0.07, 0, -0.26, 0.32, 1, 0.8, 0.8); }
    else if (kind === 'beard') { for (let i = 0; i < 7; i++) { const t2 = (i - 3) / 3, c = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26 - Math.abs(t2) * 0.06, 6), m); c.position.set(t2 * 0.22 * hw, -0.34 + Math.abs(t2) * 0.06, 0.22 - Math.abs(t2) * 0.07); c.rotation.set(Math.PI + 0.3, 0, t2 * 0.35); g.add(c); }
      for (const s of [-1, 1]) ball(g, m, 0.13, s * 0.35 * hw, -0.08, 0.02, 0.5, 0.95, 1); }
    else if (kind === 'chops') { for (const s of [-1, 1]) ball(g, m, 0.13, s * 0.36 * hw, -0.07, 0.06, 0.5, 1.05, 0.85); }
    return g; }
  const apronTex = CT(64, 64, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#201e1d'; for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 3, h); });
  const apronM = new THREE.MeshLambertMaterial({ map: apronTex });
  function makeApron() { const g = new THREE.Group(); const f = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.66, 0.02), apronM); f.position.set(0, 0.98, 0.34); f.rotation.x = -0.08; g.add(f);
    const pk = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.022), LMc('#ec3013')); pk.position.set(0, 0.86, 0.36); pk.rotation.x = -0.08; g.add(pk);
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.016, 4, 20), LMc('#201e1d')); tie.position.set(0, 0.9, 0.03); tie.rotation.x = Math.PI / 2; tie.scale.set(1, 1.1, 1); g.add(tie);
    for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.015), LMc('#201e1d')); st.position.set(s * 0.13, 1.38, 0.24); st.rotation.set(-0.45, 0, s * 0.35); g.add(st); } return g; }
  // ---------- SNIP ----------
  const SNIP_LOOK = { fur: '#6b625b', furDark: '#3a3430', muzzle: '#ece5db', snout: '#ddd2c4', chin: '#f4efe8', fluff: '#f4efe8' };
  const snip = kit.makeFox({ key: 'snipBarber', torso: ['#f3f2f2', '#201e1d', '#111111'], outfit: 'vest', mood: 'neutral', eyes: ['#3f7a52', '#3f7a52'], look: SNIP_LOOK });
  snip.position.set(-44.9, 0, -162.5); snip.rotation.y = -Math.PI / 2; G.add(snip); ringC(-44.9, -162.5, 0.45);
  { const P = snip.userData && snip.userData.P, L = (snip.userData && snip.userData.face && snip.userData.face.L) || {}; if (P && P.head) P.head.add(makeHair('quiff', '#1e1c1b', L)); if (P && P.body) P.body.add(makeApron());
    const arm = P && P.arms && P.arms[1]; if (arm) { const sc = new THREE.Group(); for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.008), LMc('#c9ced3')); b.position.set(0, -0.36, 0.05); b.rotation.z = s * 0.25; sc.add(b); } arm.add(sc); } }
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'barber', color: '#22324a', boardTitle: "Snip's best",
    room: { X0, X1, Z0, Z1 }, door: [-47, -152.8], keeper: snip, keeperRy: -Math.PI / 2,
    games: [{ k: 'cut', name: 'Shave, trim, style', color: '#22324a' }],
    board: { x: X0 + 0.06, y: 2.35, z: -156.7, ry: Math.PI / 2, w: 1.3 }, hiring: { x: -50.6, z: -152.95, ry: Math.PI }, hiringLine: 'CUT SOME HAIR',
    sun: [{ x: -51, z: -153.6, w: 2.2, d: 1.4 }, { x: -47, z: -153.5, w: 1.6, d: 1.4 }],
    lamps: bulbs,
    browse: [[-52.4, -160.2, -Math.PI / 2], [-42.2, -155.5, 0], [-41.5, -154.0, Math.PI / 2]],
    looks: [['#2e86b8', '#22648a', '#16435c'], ['#e8d6b0', '#c9b48a', '#8a7450']], clock: { x: X1 - 0.08, y: 2.9, z: -158.7, ry: -Math.PI / 2 } });
  const workRing = new THREE.Mesh(new THREE.RingGeometry(0.93, 1.05, 32), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.85, depthWrite: false })); workRing.rotation.x = -Math.PI / 2; workRing.position.set(CH.x, 0.1, CH.z + 1.25); G.add(workRing);
  const snipT = { key: 'barberSnip', obj: snip, ry: 0, r: 2.4 }, endT = { key: 'barberEnd', obj: snip, ry: 0, r: 8 };
  const SN = 'snip', ROLE = 'THE BARBER', sn = text => ({ who: SN, role: ROLE, text });
  // ---------- customers (Meru regulars) ----------
  const CUST = [
    { name: 'KIA', forW: 'Item Shop', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], style: 'braids', hc: '#8a3a12', say: 'Braids, please. Two. Even. I count stock all day.' },
    { name: 'PELL', forW: 'Crestview doorman', torso: ['#1f2937', '#e6b45a', '#111827'], style: 'sidepart', hc: '#3a2a20', say: 'A neat side part. The residents notice a crooked part.' },
    { name: 'OTTO', forW: 'Lakeside doorman', torso: ['#2f5d2a', '#e6b45a', '#1a3318'], style: 'quiff', hc: '#6b2a0c', say: 'A slick quiff. Like yours, Snip. But less... you.' },
    { name: 'MARLA', forW: 'Arena market', torso: ['#f472b6', '#fce7f3', '#9d174d'], style: 'topknot', hc: '#9a3412', say: 'Up in a top knot. I sell fruit, not hair.' },
    { name: 'MICHAEL JAY', forW: 'Diner regular', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], style: 'spikes', hc: '#7c2d12', say: 'Spikes. Big ones. Sizzle said I would not dare.' },
    { name: 'THE FISHERMAN', forW: 'Lake jetty', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'], style: 'mane', hc: '#57534e', say: 'Leave it long and shaggy. The wind does the rest.' },
    { name: 'FLICK', forW: 'Skate Park', torso: ['#ffd23a', '#201e1d', '#a16207'], style: 'mohawk', hc: '#b91c1c', say: 'Mohawk. Tall. Helmet-does-not-fit tall.' }];
  const custCache = {};
  const custFox = i => { if (custCache[i]) return custCache[i]; const C = CUST[i], f = kit.makeFox({ key: 'barberCust' + i, torso: C.torso, outfit: 'vest', mood: 'neutral' }); f.visible = false; f.userData.sitY = 0; G.add(f); custCache[i] = f; return f; };
  const sitPose = f => { const P = f.userData.P; if (!P) return; if (P.fore) { applyD(THREE, f, lifeD('sit', performance.now() / 1000, { ph: 1 }), 0, 1); return; } if (P.legs) P.legs.forEach(l => { l.rotation.x = -1.45; }); if (!P.fore && P.hero && P.body) P.body.position.y = -P.hero.dL; if (P.arms) P.arms.forEach(a => { a.rotation.x = -0.75; a.rotation.z = 0; }); if (P.body) P.body.position.y = 0; };
  const capeTex = CT(64, 64, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a5654'; for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 2, h); });
  const cape = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.72, 1.1, 22, 1, true), new THREE.MeshLambertMaterial({ map: capeTex, side: THREE.DoubleSide })); cape.position.set(0, 0.92, 0.02);
  // ---------- state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, MI = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine') => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), buzz = () => tone(120 + Math.random() * 30, 0.025, 0.08, 'sawtooth'), swish = () => tone(1800 + Math.random() * 400, 0.015, 0.08, 'triangle');
  const rnd = n => Math.floor(Math.random() * n);
  // ---------- prizes ----------
  const arr = k => { const o = save.stat(k, null); return Array.isArray(o) ? o : []; };
  const look = () => save.stat('barberLook', null) || {};
  const giveGift = styleKey => { const n = save.stat('barberClears', 0); save.setStat('barberClears', n + 1); const st = arr('barberStyles'), bd = arr('barberBeards');
    const extras = [!save.count('goldenComb') && 'goldenComb', !save.stat('barberApron', false) && 'apron', ...BEARDS.map(b => !bd.includes(b.key) && 'beard:' + b.key)].filter(Boolean);
    const styleNew = !st.includes(styleKey), take = (n % 2 === 0 && styleNew) || !extras.length ? (styleNew ? 'style' : null) : extras[0];
    if (take === 'style') { save.setStat('barberStyles', [...st, styleKey]); return { kind: 'style', key: styleKey, label: SNAME[styleKey] + ' (FUR STYLE)' }; }
    if (take === 'goldenComb') { save.give('goldenComb'); return { kind: 'item', label: 'GOLDEN COMB' }; }
    if (take === 'apron') { save.setStat('barberApron', true); return { kind: 'apron', label: 'STRIPED APRON' }; }
    if (take && take.startsWith('beard:')) { const k = take.slice(6); save.setStat('barberBeards', [...bd, k]); return { kind: 'beard', key: k, label: BNAME[k] }; }
    save.give('hairTonic'); return { kind: 'tonic', label: 'HAIR TONIC' }; };
  // ---------- cards (Modernist: ground, 2px ink, red bar, flush left) — LEFT, same spot as the tailor ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  const pick = document.createElement('div'); pick.style.cssText = card.style.cssText.replace(/pointer-events:\s*none/, 'pointer-events:auto'); document.body.appendChild(card); document.body.appendChild(pick); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; for (const el of [card, pick]) { el.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; el.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; el.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; el.style.zoom = short ? '0.85' : mid ? '0.82' : ''; } pick.style.overflowY = 'auto'; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const who = C => innerWidth > 900 && innerHeight > 700 ? '<div style="font-weight:900;font-size:15px">' + C.name + '</div><div style="font-size:12px;color:#5a5654;margin-bottom:2px">' + C.forW + '</div><div style="font-size:13px;font-style:italic;margin-bottom:6px">"' + C.say + '"</div>' : '<div style="font-weight:900;font-size:14px;margin-bottom:4px">' + C.name + ' <span style="font-weight:700;font-size:12px;color:#5a5654">' + C.forW + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span></div>';
  const meter = (f, c) => '<div style="position:relative;height:12px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:0;top:0;bottom:0;width:' + (Math.max(0, Math.min(1, f)) * 100).toFixed(1) + '%;background:' + c + '"></div></div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const btnCss = (primary, on) => 'display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;min-height:48px;padding:0 12px;margin-top:6px;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left;cursor:pointer;background:' + (primary ? '#ec3013' : on ? '#201e1d' : '#f3f2f2') + ';color:' + (primary || on ? '#ffffff' : '#201e1d');
  const showPick = (title, right, sub, opts) => { pick.innerHTML = head(title, right) + '<div style="padding:8px 10px 10px">' + (sub ? '<div style="font-size:13px;font-weight:800">' + sub + '</div>' : '') + '</div>'; const body = pick.lastChild;
    opts.forEach(o => { if (o.sect) { const h = document.createElement('div'); h.style.cssText = 'font-weight:900;font-size:12px;color:#5a5654;margin-top:10px;border-top:2px solid #201e1d;padding-top:6px'; h.textContent = o.sect; body.appendChild(h); return; }
      const b = document.createElement('button'); b.type = 'button'; b.style.cssText = btnCss(o.primary, o.on); b.innerHTML = '<span style="flex:1;min-width:0;white-space:normal">' + o.label + '</span>';
      b.addEventListener('click', e => { e.stopPropagation(); o.go(); }); b.addEventListener('pointerdown', e => e.stopPropagation()); body.appendChild(b); }); pick.style.display = 'block'; };
  const hidePick = () => { pick.style.display = 'none'; pick.innerHTML = ''; };
  // ---------- DRAG input (phone + mouse): press on the game view (not HUD buttons or the pick card) and drag ----------
  const ptr = { down: false, x: 0, y: 0, id: null, t: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && (t.closest('button,a,input,[role="button"],[aria-label]') || pick.contains(t))) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (busy !== 'job' || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; ptr.t = performance.now(); e.stopPropagation(); drag(0); }, true);
  addEventListener('pointermove', e => { if (busy !== 'job' || !ptr.down || e.pointerId !== ptr.id) return; const now = performance.now(), dt = Math.min(0.1, (now - ptr.t) / 1000); ptr.t = now; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(dt); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scr = (obj, local) => { (local ? J.head.localToWorld(tmp.copy(local)) : obj.getWorldPosition(tmp)).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = (s) => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  // ---------- tools that follow the finger ----------
  const toolM = c => new THREE.MeshLambertMaterial({ color: c });
  const TOOLS = { brush: (() => { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.16, 10), toolM('#6b4a2e')); h.position.y = 0.12; g.add(h); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 12), toolM('#f3f2f2')); b.position.y = 0.0; g.add(b); return g; })(),
    razor: (() => { const g = new THREE.Group(); const bl = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.008), new THREE.MeshPhongMaterial({ color: 0xdfe3e6, shininess: 120 })); g.add(bl); const h = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.02), toolM('#201e1d')); h.position.set(0.08, -0.08, 0); h.rotation.z = 0.6; g.add(h); return g; })(),
    clippers: (() => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.05), toolM('#201e1d')); b.position.y = -0.08; g.add(b); const t = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 0.05), new THREE.MeshPhongMaterial({ color: 0xc9ced3, shininess: 90 })); t.position.y = 0.03; g.add(t); return g; })(),
    comb: (() => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.01), toolM('#201e1d')); g.add(b); for (let i = 0; i < 9; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.05, 0.008), toolM('#201e1d')); t.position.set(-0.09 + i * 0.0225, -0.035, 0); g.add(t); } return g; })(),
    gel: (() => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), new THREE.MeshPhongMaterial({ color: 0x38bdf8, shininess: 100, transparent: true, opacity: 0.85 })); g.add(b); return g; })() };
  Object.values(TOOLS).forEach(t => { t.visible = false; t.renderOrder = 5; G.add(t); });
  const camPos = V();
  function moveTool() { const kind = J && ({ foam: 'brush', razor: 'razor', trim: 'clippers', comb: 'comb', gel: 'gel' })[J.sub]; for (const [k, t] of Object.entries(TOOLS)) t.visible = ptr.down && k === kind; if (!kind) return;
    const t = TOOLS[kind], ndc = new THREE.Vector2(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1), rc = new THREE.Raycaster(); rc.setFromCamera(ndc, camera); camera.getWorldPosition(camPos);
    const d = camPos.distanceTo(J.head.getWorldPosition(tmp)) - 0.38; t.position.copy(rc.ray.origin).addScaledVector(rc.ray.direction, d); t.quaternion.copy(camera.quaternion); }
  // ---------- head overlays: dots, rings, stubble, foam, tufts ----------
  const dotM = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true }), dotCut = new THREE.MeshBasicMaterial({ color: 0xec3013, depthTest: false, transparent: true });
  const ringM = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true, side: THREE.DoubleSide }), dotGeo = new THREE.SphereGeometry(0.022, 8, 6), ringGeo = new THREE.RingGeometry(0.062, 0.08, 20);
  const stubM = new THREE.MeshLambertMaterial({ color: 0x4a3a30, transparent: true, opacity: 0.7, depthTest: false, polygonOffset: true, polygonOffsetFactor: -2 }), foamM = new THREE.MeshLambertMaterial({ color: 0xffffff }), stubGeo = new THREE.CircleGeometry(0.075, 14), foamGeo = new THREE.SphereGeometry(0.05, 10, 6);
  const faceOut = (o, p) => { o.quaternion.setFromUnitVectors(V(0, 0, 1), p.clone().normalize()); };
  const falling = [];
  const SHAVE = [[-1.05, -0.12], [1.05, -0.12], [-0.72, -0.34], [0.72, -0.34], [-0.38, -0.5], [0.38, -0.5], [0, -0.6], [-1.2, 0.12], [1.2, 0.12]];
  const TRIM_LINES = [{ name: 'LEFT SIDE', pts: [...Array(7)].map((_, i) => [-1.28, 1.05 - i * 0.16]) }, { name: 'RIGHT SIDE', pts: [...Array(7)].map((_, i) => [1.28, 1.05 - i * 0.16]) }, { name: 'TOP', pts: [...Array(8)].map((_, i) => [-1.0 + i * 0.2857, 0.98]) }];
  const COMB = { up: [-0.45, 0, 0.45].map(a => [...Array(6)].map((_, i) => [a, 0.4 + i * 0.19])), down: [[-1.2, 1.15, 0.1], [1.2, 1.15, 0.1], [0, 1.45, 0.6]].map(([a, e0, e1]) => [...Array(6)].map((_, i) => [a, e0 + (e1 - e0) * i / 5])), side: [0.75, 1.0, 1.25].map(e => [...Array(6)].map((_, i) => [-0.3 + i * 0.3, e])) };
  const GEL = [[-0.35, 1.05], [0.35, 1.05], [0, 1.35], [0, 0.8]];
  // ================= THE VISIT =================
  const STEPS = ['shave', 'trim', 'style'], STEP_NAME = { shave: 'SHAVE', trim: 'TRIM', style: 'STYLE', reveal: 'DONE' };
  const comb = () => save.count('goldenComb') > 0;
  const addGold = n => { n = Math.max(0, Math.round(n * (comb() ? 1.25 : 1))); J.gold += n; save.addGold(n); return n; };
  const queue = () => { const n = save.stat('barberVisits', 0); return [0, 1, 2].map(k => (n + k) % CUST.length); };
  function startVisit() { const n = save.stat('barberVisits', 0), ci = n % CUST.length, C = CUST[ci]; save.setStat('barberVisits', n + 1);
    const f = custFox(ci), U = f.userData, L = (U.face && U.face.L) || {}; f.position.set(CH.x, SEAT - 0.5, CH.z); f.rotation.y = Math.PI; f.visible = true; U.sit = true; f.userData.mood = 'neutral'; f.userData.base = 'neutral';
    cape.position.y = U.P.head.position.y - 0.72; (U.P.body || f).add(cape); const over = new THREE.Group(); U.P.head.add(over);
    J = { ci, C, f, L, head: U.P.head, over, step: 'shave', sub: 'foam', gold: 0, pause: 0, t: 0, hc: C.hc, perfect: 0 };
    J.spots = SHAVE.map(([a, e]) => { const p = surf(a, e, 1.1, L), s = new THREE.Mesh(stubGeo, stubM); s.position.copy(p); faceOut(s, p); s.renderOrder = 3; over.add(s); const r = new THREE.Mesh(ringGeo, ringM); r.position.copy(surf(a, e, 1.12, L)); faceOut(r, p); r.renderOrder = 4; if (touch) r.scale.setScalar(1.4); over.add(r);
      const fm = new THREE.Group(); fm.position.copy(surf(a, e, 1.06, L)); for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(foamGeo, foamM); b.position.set((k - 1) * 0.035, (k % 2) * 0.02, 0); b.scale.setScalar(0.8 + (k % 2) * 0.35); fm.add(b); } fm.visible = false; over.add(fm); return { p, s, r, fm, st: 0 }; });
    J.tufts = []; const allPts = TRIM_LINES.flatMap((ln, li) => ln.pts.map((q, pi) => ({ li, pi, a: q[0], e: q[1] }))), m = LMc(C.hc);
    for (let e = 0.1; e <= 1.31; e += 0.17) for (let a = -1.7; a <= 1.71; a += 0.26) { let best = null, bd = 0.42; for (const q of allPts) { const d = Math.hypot((a - q.a) * Math.cos(e), e - q.e); if (d < bd) { bd = d; best = q; } } if (!best || (Math.abs(a) < 0.95 && e < 0.72)) continue;
      const aa = a + (Math.random() - 0.5) * 0.12, o = coneOut(over, m, surf(aa, e, 0.97, L), surf(aa + (Math.random() - 0.5) * 0.5, e + (Math.random() - 0.3) * 0.3, 1, L), 0.075, 0.2 + Math.random() * 0.1); J.tufts.push({ o, li: best.li, pi: best.pi }); }
    busy = 'job'; if (lastP) Object.assign(lastP, { x: SPOT.work.x, z: SPOT.work.z, yaw: Math.PI, sp: 0 }); toast('STEP 1 OF 3 · SHAVE ' + C.name, 1.8); hideQueue(); }
  const nextStep = () => { clearDots(); const i = STEPS.indexOf(J.step); if (i < STEPS.length - 1) { J.step = STEPS[i + 1]; J.t = 0; toast('STEP ' + (i + 2) + ' OF 3 · ' + STEP_NAME[J.step], 1.8); ({ trim: beginTrim, style: beginStyle })[J.step](); } else beginReveal(); };
  // ---- paths (trim + comb): yellow dots to drag along ----
  function makePath(pts, k = 1.13) { clearDots(); J.path = { pts: pts.map(([a, e]) => { const p = surf(a, e, k, J.L), d = new THREE.Mesh(dotGeo, dotM); d.position.copy(p); d.renderOrder = 4; J.over.add(d); return { p, d, st: 0 }; }), i: 0, wob: 0, len: 0 }; }
  function clearDots() { if (J && J.path) { for (const q of J.path.pts) J.over.remove(q.d); J.path = null; } }
  function pathHit(dt) { const Pa = J.path; if (!Pa || Pa.i >= Pa.pts.length) return; const R = RAD(); let hit = -1;
    for (let j = Pa.i; j < Math.min(Pa.i + 3, Pa.pts.length); j++) if (dist(scr(null, Pa.pts[j].p)) < R * 1.1) hit = j;
    if (hit >= 0) { for (let j = Pa.i; j <= hit; j++) { Pa.pts[j].st = 1; Pa.pts[j].d.material = dotCut; onPathPoint(j); } Pa.i = hit + 1; }
    else if (ptr.down && dt > 0) { let md = 1e9; for (let j = Math.max(0, Pa.i - 1); j < Pa.pts.length; j++) md = Math.min(md, dist(scr(null, Pa.pts[j].p))); if (md > R * 2.4) Pa.wob += dt; } }
  // ---- spots (foam, razor, gel) ----
  function spotHit() { const R = RAD(); for (const s of J.spots) { const want = J.sub === 'razor' ? 1 : 0; if (s.st !== want) continue; if (dist(scr(null, s.p)) > R) continue;
      if (J.sub === 'foam') { s.st = 1; s.fm.visible = true; s.s.visible = false; s.r.visible = false; pop(); } else if (J.sub === 'razor') { s.st = 2; s.fm.visible = false; s.s.visible = false; swish(); } else if (J.sub === 'gel') { s.st = 1; s.r.visible = false; s.blob.visible = true; pop(); J.styleMat.shininess = Math.min(90, J.styleMat.shininess + 22); } } }
  // ---- 1 · SHAVE ----
  function shaveTick(dt) { const S = J.spots;
    if (J.sub === 'foam' && S.every(s => s.st >= 1)) { J.sub = 'razor'; J.rz = 16; J.foamG = addGold(S.length); toast('FOAM ON · NOW THE RAZOR', 1.4); S.forEach(s => { s.r.visible = true; }); }
    else if (J.sub === 'razor') { J.rz -= dt; const done = S.every(s => s.st >= 2);
      if (done || J.rz <= 0) { const n = S.filter(s => s.st >= 2).length, g2 = addGold(n * 3 + (done ? Math.min(8, Math.round(J.rz)) : 0)); if (n === S.length) J.perfect++; S.forEach(s => { s.r.visible = false; s.fm.visible = false; s.s.visible = s.st < 2; });
        n === S.length ? ding() : pop(); toast((n === S.length ? 'SNIP: "SMOOTH."' : 'SNIP: "' + (S.length - n) + ' PATCH' + (S.length - n > 1 ? 'ES' : '') + ' LEFT. THEY WILL GROW ON YOU."') + ' +' + g2, 1.8); J.sub = 'done'; J.pause = 1.4; } }
    drawShave(); }
  function drawShave() { const S = J.spots, f = S.filter(s => s.st >= 1).length, r = S.filter(s => s.st >= 2).length;
    setCard('sh' + J.sub + f + r + Math.ceil(J.rz || 0), head('STEP 1 OF 3', 'SHAVE') + foot(J.sub === 'foam' ? 'DRAG THE BRUSH OVER THE RINGS' : J.sub === 'razor' ? 'DRAG THE RAZOR OVER THE FOAM' : 'SHAVED') + '<div style="padding:8px 10px 10px">' + who(J.C)
      + row('#ffffff', 'FOAM', f + '/' + S.length, f === S.length) + row('#c9ced3', 'RAZOR', r + '/' + S.length, r === S.length) + (J.sub === 'razor' ? meter(J.rz / 16, '#201e1d') : '') + '</div>'); }
  // ---- 2 · TRIM ----
  function beginTrim() { J.tk = 0; J.tres = []; J.sub = 'trim'; makePath(TRIM_LINES[0].pts); }
  function onPathPoint(j) { if (J.step === 'trim') { buzz(); for (const t of J.tufts) if (!t.cut && t.li === J.tk && Math.abs(t.pi - j) <= 0) { t.cut = true; G.attach(t.o); falling.push({ o: t.o, vy: 0.4 + Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.6, vz: (Math.random() - 0.5) * 0.6 }); } }
    else if (J.step === 'style') { swish(); J.styleG.scale.setScalar(Math.min(1, J.styleG.scale.x + 0.15 / 6 * 1.0)); } }
  function trimTick() { const Pa = J.path; if (Pa && Pa.i >= Pa.pts.length && J.sub === 'trim') { const clean = Pa.wob < 0.35, g2 = addGold(8 + (clean ? 4 : 0)); J.tres[J.tk] = clean; pop(); toast(TRIM_LINES[J.tk].name + (clean ? ' · CLEAN LINE' : ' · A BIT WOBBLY') + ' +' + g2, 1.1); J.tk++;
      if (J.tk >= TRIM_LINES.length) { for (const t of J.tufts) if (!t.cut) { t.cut = true; G.attach(t.o); falling.push({ o: t.o, vy: 0.3, vx: 0, vz: 0 }); } if (J.tres.every(Boolean)) J.perfect++; ding(); J.sub = 'done'; J.pause = 1.3; toast(J.tres.every(Boolean) ? 'SNIP: "NOW THAT IS A LINE."' : 'SNIP: "HAIR FORGIVES. MOSTLY."', 1.6); clearDots(); }
      else makePath(TRIM_LINES[J.tk].pts); }
    drawTrim(); }
  function drawTrim() { const Pa = J.path, rows = TRIM_LINES.map((ln, i) => row(i === J.tk ? '#ffd23a' : '#cfcac3', ln.name, i < J.tk ? (J.tres[i] ? '\u2713' : '~') : i === J.tk && Pa ? Pa.i + '/' + Pa.pts.length : '\u2014', i < J.tk)).join('');
    setCard('tr' + J.tk + (Pa ? Pa.i : 'x') + J.sub, head('STEP 2 OF 3', 'TRIM') + foot(J.sub === 'done' ? 'TRIMMED' : 'DRAG ALONG THE YELLOW DOTS') + '<div style="padding:8px 10px 10px">' + who(J.C) + rows + '</div>'); }
  // ---- 3 · STYLE: pick the look → comb along 3 strokes → dab the gel ----
  function beginStyle() { J.sub = 'pick'; hideCard(); const wish = J.C.style, others = STYLES.filter(s => s.key !== wish).sort(() => Math.random() - 0.5).slice(0, 2), opts = [STYLES.find(s => s.key === wish), ...others].sort(() => Math.random() - 0.5);
    showPick('STEP 3 OF 3', 'STYLE', J.C.name + ': "' + J.C.say + '"<div style="font-weight:700;font-size:12px;color:#5a5654;margin-top:6px">PICK THE LOOK</div>', opts.map(s => ({ label: s.name, go: () => pickStyle(s.key) }))); }
  function pickStyle(k) { hidePick(); J.styleKey = k; const ok = k === J.C.style; const g2 = addGold(ok ? 10 : 4); ok ? ding() : pop(); toast(ok ? 'SNIP: "EXACTLY WHAT THEY ASKED FOR." +' + g2 : 'SNIP: "NOT WHAT THEY ASKED FOR. BOLD." +' + g2, 1.6);
    J.styleMat = new THREE.MeshPhongMaterial({ color: J.hc, shininess: 0, specular: 0x666666 }); J.styleG = makeHair(k, J.hc, J.L, J.styleMat); J.styleG.scale.setScalar(0.82); J.over.add(J.styleG);
    J.sub = 'comb'; J.ck = 0; J.strokes = COMB[(STYLES.find(s => s.key === k) || STYLES[0]).comb]; makePath(J.strokes[0], 1.18); }
  function styleTick() { if (J.sub === 'comb') { const Pa = J.path; if (Pa && Pa.i >= Pa.pts.length) { addGold(2); J.ck++; pop(); if (J.ck >= J.strokes.length) { clearDots(); J.sub = 'gel'; J.styleG.scale.setScalar(0.94);
          J.spots = GEL.map(([a, e]) => { const p = surf(a, e, 1.18, J.L), r = new THREE.Mesh(ringGeo, ringM); r.position.copy(p); faceOut(r, p); r.renderOrder = 4; if (touch) r.scale.setScalar(1.4); J.over.add(r); const blob = new THREE.Mesh(foamGeo, new THREE.MeshPhongMaterial({ color: 0x38bdf8, shininess: 100, transparent: true, opacity: 0.7 })); blob.position.copy(p); blob.scale.setScalar(0.7); blob.visible = false; J.over.add(blob); return { p, r, blob, st: 0 }; }); toast('COMBED · NOW THE GEL', 1.2); }
        else makePath(J.strokes[J.ck], 1.18); } }
    else if (J.sub === 'gel' && J.spots.every(s => s.st)) { addGold(J.spots.length * 2); J.styleG.scale.setScalar(1); J.spots.forEach(s => { s.blob.visible = false; }); J.perfect += J.styleKey === J.C.style ? 1 : 0; ding(); J.sub = 'done'; J.pause = 1.0; }
    if (J.sub !== 'pick') drawStyle(); }
  function drawStyle() { const g = J.sub === 'gel' ? J.spots.filter(s => s.st).length : 0;
    setCard('st' + J.sub + J.ck + (J.path ? J.path.i : '') + g, head('STEP 3 OF 3', 'STYLE') + foot(J.sub === 'comb' ? 'COMB ALONG THE DOTS' : J.sub === 'gel' ? 'DRAG THE GEL ONTO THE RINGS' : 'STYLED') + '<div style="padding:8px 10px 10px">' + who(J.C)
      + row('#ec3013', SNAME[J.styleKey] || '', J.styleKey === J.C.style ? '\u2713' : '~', J.styleKey === J.C.style) + row('#201e1d', 'COMB', Math.min(J.ck, 3) + '/3', J.ck >= 3) + row('#38bdf8', 'GEL', g + '/' + GEL.length, J.sub === 'done') + '</div>'); }
  // ---- the reveal: cape off, they light up, they pay ----
  function beginReveal() { J.step = 'reveal'; J.sub = 'reveal'; J.t = 0; if (cape.parent) cape.parent.remove(cape); const U = J.f.userData; U.mood = 'happy'; U.base = 'happy'; U.hop = 1; const g2 = addGold(10);
    tone(523, 0.05, 0.4); tone(659, 0.05, 0.5); tone(784, 0.05, 0.7);
    setCard('rv', head('ALL DONE', '+' + J.gold + ' GOLD') + '<div style="padding:8px 10px 10px">' + who(J.C) + row('#ec3013', SNAME[J.styleKey], J.styleKey === J.C.style ? '\u2713' : '~', J.styleKey === J.C.style) + '<div style="font-size:13px;font-style:italic;padding-top:6px">"' + ['I look like someone with a plan.', 'Do not tell anyone I cried.', 'Is that me? That is me!'][J.ci % 3] + '"</div></div>');
    toast(J.C.name + ' LOVES IT · +' + g2 + ' GOLD', 2.2); }
  function endVisit() { const C = J.C, gold = J.gold, sk = J.styleKey, J0perf = Math.min(3, J.perfect), perfect = J.perfect >= 3, gift = giveGift(sk); if (perfect && gift.kind !== 'tonic') save.give('hairTonic'); save.best('barberBest', gold); const f = J.f; stop(); f.visible = false;
    toast('VISIT DONE · +' + gold + ' GOLD · ' + gift.label + (perfect && gift.kind !== 'tonic' ? ' + HAIR TONIC' : ''), 3.5);
    const nm = C.name.toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase()), n = save.stat('barberClears', 1), op = nm + ' ' + ['walked out taller.', 'looks sharp.', 'has a new swagger.'][n % 3] + ' ';
    K.finish('cut', Math.max(1, J0perf), gold, !K.stars('cut'));
    sayTo(endT, [sn(op + (gift.kind === 'style' ? 'You earned the ' + SNAME[sk].toLowerCase() + '. Try it at the style mirror.'
      : gift.kind === 'beard' ? 'For you: a ' + gift.label.toLowerCase() + '. The style mirror puts it on.'
      : gift.kind === 'apron' ? 'Take my striped apron. The style mirror puts it on.'
      : gift.kind === 'item' ? 'My old Golden Comb is yours. Customers tip more.'
      : 'Have a Hair Tonic. Works on cuts of every kind.'))]); }
  function jobTick(dt) { J.t += dt; if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0) nextStep(); return; }
    if (J.step === 'shave') shaveTick(dt); else if (J.step === 'trim') trimTick(dt); else if (J.step === 'style') styleTick(dt); else if (J.step === 'reveal' && J.t > 3.2) endVisit(); }
  function drag(dt) { if (!J || J.pause > 0) return; moveTool(); const s = J.sub; if (s === 'foam' || s === 'razor' || s === 'gel') spotHit(); else if (s === 'trim' || s === 'comb') pathHit(dt); }
  function stop() { busy = null; HINT.style.display = 'none'; if (J) { if (J.over && J.over.parent) J.over.parent.remove(J.over); if (cape.parent) cape.parent.remove(cape); J.f.userData.sit = false; J.f.visible = false; J.f.userData.mood = J.f.userData.base = 'neutral'; } J = null; ptr.down = false; Object.values(TOOLS).forEach(t => { t.visible = false; }); hideCard(); hidePick(); }
  // ---------- the queue on the bench ----------
  const hideQueue = () => Object.values(custCache).forEach(f => { if (!J || f !== J.f) f.visible = false; });
  function showQueue() { const q = queue(); const want = busy === 'job' && J ? q.slice(0, 2) : q.slice(0, 2); want.forEach((ci, k) => { if (J && ci === J.ci) return; const f = custFox(ci); f.visible = true; f.userData.sit = true; f.position.set(BENCH.x, BENCH.y - 0.5, -160.4 + k * 2.6); f.rotation.y = -Math.PI / 2; }); }
  // ================= THE STYLE MIRROR (change your look) =================
  function startMirror(P) { busy = 'mirror'; Object.assign(P, { x: MIR.x, z: MIR.z, yaw: Math.PI, sp: 0 }); MI = { P }; mirrorPanel(); }
  function mirrorPanel() { const l = look(), st = arr('barberStyles'), bd = arr('barberBeards'), set = (k, v) => { save.setStat('barberLook', { ...look(), [k]: v }); tone(880, 0.04, 0.2, 'triangle'); mirrorPanel(); };
    showPick('STYLE MIRROR', 'SNIP', 'YOUR LOOK, ANYWHERE IN MERU', [{ sect: 'FUR' }, { label: 'MY OWN FUR' + (!l.hair ? ' · ON' : ''), on: !l.hair, go: () => set('hair', null) }, ...st.map(k => ({ label: SNAME[k] + (l.hair === k ? ' · ON' : ''), on: l.hair === k, go: () => set('hair', k) })),
      ...(bd.length ? [{ sect: 'FACE' }, { label: 'CLEAN SHAVEN' + (!l.beard ? ' · ON' : ''), on: !l.beard, go: () => set('beard', null) }, ...bd.map(k => ({ label: BNAME[k] + (l.beard === k ? ' · ON' : ''), on: l.beard === k, go: () => set('beard', k) }))] : []),
      ...(save.stat('barberApron', false) ? [{ sect: 'APRON' }, { label: l.apron ? 'STRIPED APRON · ON' : 'STRIPED APRON · OFF', on: !!l.apron, go: () => set('apron', !l.apron) }] : []),
      { label: 'DONE', primary: true, go: () => closeMirror() }]); }
  function closeMirror() { hidePick(); busy = null; MI = null; toast('LOOKING SHARP', 1.6); }
  // ---------- the player's look (fur style / beard / apron), re-attached after any outfit swap ----------
  let worn = null, lastP = null;
  function applyLook(fox) { if (!fox || !fox.userData || !fox.userData.P) return; const l = look(), key = (l.hair || '') + '|' + (l.beard || '') + '|' + (l.apron ? 1 : 0);
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox)) return; if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: [] };
    const P = fox.userData.P, L = (fox.userData.face && fox.userData.face.L) || {}, hc = '#' + new THREE.Color(L.furDark || '#c2410c').multiplyScalar(0.6).getHexString();
    if (l.hair && P.head) { const h = makeHair(l.hair, hc, L); P.head.add(h); worn.parts.push(h); } if (l.beard && P.head) { const b = makeBeard(l.beard, hc, L); P.head.add(b); worn.parts.push(b); } if (l.apron && P.body) { const a = makeApron(); P.body.add(a); worn.parts.push(a); }
    worn.parts.forEach(p => p.traverse(o => { o.renderOrder = 2; o.castShadow = true; })); }   // renderOrder 2 = drawn after the walk's x-ray pass (like the fox's own meshes)
  // ---------- camera: fixed close-up of the face in the chair (portrait: below the card; wide: right of it) ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false }, hp = V();
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT; else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt, fox) { let v = null;
    if (busy === 'job' && J) { J.head.getWorldPosition(hp); hp.y += 0.08; v = J.step === 'reveal' ? [hp.clone().setY(hp.y - 0.2), 2.2, 2.1, 0.16, 3.2, Math.PI, 3.6] : [hp.clone(), 1.8, 1.6, 0.14, 2.8, Math.PI, 3.6]; }
    else if (busy === 'mirror' && fox && fox.userData.P) { fox.userData.P.head.getWorldPosition(hp); v = [hp.clone().setY(hp.y - 0.1), 1.8, 1.9, 0.12, 2.8, Math.PI, 3.6]; }
    if (!v) { camCur.on = false; lensOff(cam); return; }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
    fitCam(v);
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.set(Math.max(X0 + 0.35, Math.min(X1 - 0.35, camCur.pos.x)), Math.min(3.6, camCur.pos.y), Math.max(Z0 + 0.35, Math.min(Z1 - 0.35, camCur.pos.z))); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- HINT HAND: no input for 3 s → a pointer shows the next spot to drag ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTarget = () => { if (busy !== 'job' || !J || J.pause > 0 || ptr.down) return null; const s = J.sub, W = p => J.head.localToWorld(p.clone());
    if (s === 'foam' || s === 'razor' || s === 'gel') { const want = s === 'razor' ? 1 : 0, q = (J.spots || []).find(x => x.st === want); return q ? [W(q.p), s === 'foam' ? 'DRAG THE BRUSH HERE' : s === 'razor' ? 'DRAG THE RAZOR HERE' : 'DAB THE GEL HERE'] : null; }
    if ((s === 'trim' || s === 'comb') && J.path) { const q = J.path.pts[J.path.i]; return q ? [W(q.p), s === 'trim' ? 'DRAG ALONG THE DOTS' : 'COMB ALONG THE DOTS'] : null; }
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; } const p = h[0].project(camera); if (p.z > 1) { HINT.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 - 0.3 && P.x < X1 + 0.3 && P.z > Z0 && P.z < Z1 + 0.3 && P.y < 2.5;
  const SPOT = { work: { x: CH.x, z: CH.z + 1.25, r: 1.05 }, mirror: { x: MIR.x, z: MIR.z + 0.2, r: 0.9 } };
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r;
  const hasLooks = () => arr('barberStyles').length || arr('barberBeards').length || save.stat('barberApron', false);
  function prompt(P) { if (busy || !inShop(P)) return null; if (at(P, SPOT.work)) return 'NEXT CUSTOMER · SHAVE, TRIM, STYLE';
    if (at(P, SPOT.mirror) && hasLooks()) return 'STYLE MIRROR · CHANGE YOUR LOOK'; if (K.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, snipT)) return 'TALK · SNIP'; return null; }
  // s65: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const HELLO = ['Snip. Mind the hair on the floor. Centre chair: shave, trim, style. Drag slow, follow the line.', 'Back again. The chair is warm.', 'Slow hands today. Fast is for the tavern.', 'Otto left half his quiff on my floor. Sit down.'];
  const TIPS = ['A good cut does not need explaining.', 'Noble asked for a mohawk. I said the chair already makes a statement.', 'Hope said surprise me. I did not. She tipped double.', 'Clippers hum. Razors whisper. Listen to both.'];
  const snipMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startVisit(); } }];
    if (hasLooks()) ch.push({ text: 'THE STYLE MIRROR', pick: () => { if (!busy && lastP) startMirror(lastP); } });
    ch.push({ text: "A BARBER'S TIP, PLEASE", pick: () => sayTo(snipT, [sn(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} });
    sayTo(snipT, [{ ...sn(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { lastP = P; if (busy) return true; if (!inShop(P)) return false;
    if (at(P, SPOT.work)) { startVisit(); return true; }
    if (at(P, SPOT.mirror) && hasLooks()) { startMirror(P); return true; }
    if (K.atHiring(P)) { ding(); startVisit(); return true; }
    if (!near(P, snipT)) return false;
    snipMenu(!talked++); return true; }
  function quit() { if (busy === 'mirror') { closeMirror(); return; } stop(); toast('CUSTOMER SENT HOME · GOLD KEPT', 2); }
  // ---------- per frame ----------
  function tick(dt, P, fox) { const t = performance.now() / 1000, d = Math.hypot(P.x - CX, P.z - CZ); G.visible = d < (touch ? 45 : 90); toastT -= dt; applyLook(fox); lastP = P;
    if (busy === 'job' && !inShop(P)) stop(); if (busy === 'job' && fox) JW(fox, 'barber');
    if (!G.visible) { HINT.style.display = 'none'; return; } poleTex.offset.y = (t * 0.35) % 1; fans.forEach((f, i) => { f.rotation.y += dt * (2.2 + i * 0.3); });
    if (busy === 'job' && J) jobTick(dt); if (!busy || busy === 'job') showQueue();
    for (let i = falling.length - 1; i >= 0; i--) { const q = falling[i]; q.vy -= 6 * dt; q.o.position.x += q.vx * dt; q.o.position.z += q.vz * dt; q.o.position.y += q.vy * dt; q.o.rotation.x += dt * 4; if (q.o.position.y < 0.1) { G.remove(q.o); falling.splice(i, 1); } }
    if (J && J.path) { const n = J.path.pts[J.path.i]; if (n) n.d.scale.setScalar(1.3 + Math.sin(t * 9) * 0.35); }
    workRing.visible = !busy; workRing.scale.setScalar(1 + Math.sin(t * 3) * 0.04); hintTick(t);
    K.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: d, talking: busy === 'job' });
    if (busy === 'job') { const lk = Math.atan2(CH.x - snip.position.x, CH.z - snip.position.z); snip.rotation.y += Math.atan2(Math.sin(lk - snip.rotation.y), Math.cos(lk - snip.rotation.y)) * Math.min(1, dt * 3); }
    for (const f of Object.values(custCache)) if (f.visible) { kit.animFox && kit.animFox(f, dt, 0); if (f.userData.sit) sitPose(f); } }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, startVisit, startMirror: P => startMirror(P || lastP), snip, camera, camT, save, makeHair, makeBeard,
    // test hooks: drive the drag from a script (screen coords) and jump between steps
    dragTo(x, y, dt = 0.05) { ptr.down = true; ptr.x = x; ptr.y = y; drag(dt); }, release() { ptr.down = false; moveTool && J && moveTool(); },
    targets() { if (!J) return []; if (J.sub === 'trim' || J.sub === 'comb') return J.path ? J.path.pts.map(q => scr(null, q.p)) : []; return (J.spots || []).map(s => scr(null, s.p)); },
    skipTo(s) { if (!J) startVisit(); J.pause = 0; clearDots(); if (s === 'reveal') { J.styleKey = J.styleKey || J.C.style; beginReveal(); return; } if (s === 'trim') { J.spots.forEach(q => { q.s.visible = false; q.r.visible = false; q.fm.visible = false; }); } J.step = STEPS[STEPS.indexOf(s) - 1]; nextStep(); },
    pickStyle: k => pickStyle(k), K, dispose() { card.remove(); pick.remove(); HINT.remove(); K.dispose(); } };
  window.__barber = API; return API;
}
