// LIVING QUARTERS A [dsfQuartersA] + B [dsfQuartersB] (s350): two decks inside the hub column under the Main Ring (lift stops y -14 / -28).
// A round corridor round the lift core, 8 slots of 45°: the lift LOBBY at 180° (deck directory + a big viewport), cabins in the rest
// (Quarters B keeps slot 0 as THE LOUNGE with Old Pav's games table). Every cabin: big sign over the door + eye-level door sign + a
// status lamp (green = open to you, amber = someone in, red = nobody in). Cabins from the 2D (worlds/dsf-2d-summary.json "cabins").
import { FONT } from '../engine/textures.js';
import { canvas, pol, angOf, adiff, D } from './dsf-look.js?v=350e';
export const QU = { rc: 9.2, ro: 19.6, h: 4.6, core: 5, decks: [{ key: 'A', id: 'dsfQuartersA', label: 'LIVING QUARTERS A', y: -14, col: '#ffb454' }, { key: 'B', id: 'dsfQuartersB', label: 'LIVING QUARTERS B', y: -28, col: '#7fe3ff' }] };
const SLOT_A = { dsfCabinYou: 225, dsfCabKorra: 270, dsfCabDacks: 315, dsfCabObrain: 0, dsfCabBashad: 45, dsfCabWarf: 90, dsfCabJack: 135 };
const SLOT_B = { dsfCabVor: 225, dsfCabPells: 270, dsfCabSeth: 315, dsfCabGrell: 45, dsfCabNag: 90, dsfCabPav: 135 };
const LOOK = { dsfCabinYou: ['#b3121b', '#3a3026'], dsfCabKorra: ['#7a1a1a', '#4a2a22'], dsfCabDacks: ['#3a5a8a', '#2a3448'], dsfCabObrain: ['#5a6a3a', '#3a3a30'], dsfCabBashad: ['#e8eef2', '#2a4a50'], dsfCabWarf: [null, '#3a2418'], dsfCabJack: ['#8a6a3a', '#3a3026'],
  dsfCabVor: ['#6a3a6a', '#3a2a3a'], dsfCabPells: ['#c87a3a', '#4a3a2a'], dsfCabSeth: ['#d8a040', '#4a3418'], dsfCabGrell: ['#5a5a5a', '#2e2e2e'], dsfCabNag: ['#c8a050', '#3a3020'], dsfCabPav: ['#4a6a4a', '#3a3426'] };
export const MY_INSIDE = 'Your bunk, your locker, and space out the viewport. Rest at the bunk.';
export function buildQuarters(K, ST, cabins2d) {
  const { THREE, scene, M, BOX, toon, basic, rnd, rr, pick, LOW } = K;
  const anims = [], tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const sign = (lines, w, h, fg, x, y, z, ry, p, bg = '#0b1218') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; };
  // the viewport picture: deep space, stars and the curve of Meru (shared, scrolls slowly as the station turns)
  const viewTex = tex(canvas(1024, 384, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#02030a'); gr.addColorStop(1, '#0a1430'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 420; i++) { c.fillStyle = `rgba(255,255,255,${(0.3 + rnd() * 0.7).toFixed(2)})`; const s = rnd() < 0.08 ? 2.4 : 1.2; c.fillRect(rnd() * w, rnd() * h, s, s); }
    const ng = c.createRadialGradient(w * 0.7, h * 0.3, 10, w * 0.7, h * 0.3, 220); ng.addColorStop(0, 'rgba(180,90,200,0.35)'); ng.addColorStop(1, 'rgba(180,90,200,0)'); c.fillStyle = ng; c.fillRect(0, 0, w, h);
    const pg = c.createRadialGradient(w * 0.35, h * 2.1, h * 1.2, w * 0.35, h * 2.1, h * 1.75); pg.addColorStop(0, '#2f7a6a'); pg.addColorStop(0.86, '#4aa0c8'); pg.addColorStop(0.95, 'rgba(160,220,255,0.8)'); pg.addColorStop(1, 'rgba(160,220,255,0)'); c.fillStyle = pg; c.fillRect(0, 0, w, h); }));
  viewTex.wrapS = THREE.RepeatWrapping; anims.push(dt => { viewTex.offset.x = (viewTex.offset.x + dt * 0.004) % 1; });
  const viewMat = new THREE.MeshBasicMaterial({ map: viewTex, toneMapped: false });
  const flatRing = (r0, r1, a0, len, mat, y, p) => { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, Math.max(6, Math.round(len / 4)), 1, (90 - a0 - len) * D, len * D), mat); m.rotation.x = -Math.PI / 2; m.position.y = y; p.add(m); return m; };
  const wall = (r, y0, y1, a, b, mat, p) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, y1 - y0, Math.max(8, Math.round((b - a) / 2)), 1, true, Math.PI - b * D, (b - a) * D), mat); m.position.y = (y0 + y1) / 2; p.add(m); return m; };
  const hw = u => u * Math.tan(22.5 * D) - 0.25;
  const wallMat = toon('#3a3d44', { side: THREE.DoubleSide }), trimMat = toon('#24262b'), ceilMat = toon('#1d2026', { side: THREE.DoubleSide });
  const byKey = {}; for (const c of cabins2d) byKey[c.key] = c;
  const decks = [], cabs = [];
  for (const dk of QU.decks) {
    const g = new THREE.Group(); g.position.y = dk.y; g.visible = false; scene.add(g); dk.g = g; dk.circles = []; dk.slots = []; decks.push(dk);
    const SL = dk.key === 'A' ? SLOT_A : SLOT_B;
    // floors: corridor carpet + cyan/amber inlay, ceiling, outer wall, the lift core
    const carpet = tex(canvas(256, 256, (c, w) => { c.fillStyle = dk.key === 'A' ? '#3a2e28' : '#26323a'; c.fillRect(0, 0, w, w); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 2; for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(i * 16, 0); c.lineTo(i * 16, w); c.stroke(); } })); carpet.wrapS = carpet.wrapT = THREE.RepeatWrapping; carpet.repeat.set(4, 4);
    flatRing(QU.core, QU.rc, 0, 360, toon('#ffffff', { map: carpet }), 0, g); flatRing(7.1, 7.3, 0, 360, basic(dk.col, 0.9), 0.01, g);
    { const c = new THREE.Mesh(new THREE.RingGeometry(QU.core, QU.ro + 0.1, 64, 1), ceilMat); c.rotation.x = Math.PI / 2; c.position.y = QU.h; g.add(c); }
    wall(QU.ro, 0, QU.h, 0, 360, wallMat, g); wall(QU.core, 0, QU.h, 0, 360, toon('#2a3038', { side: THREE.DoubleSide }), g);
    { const lp = []; for (let th = 11.25; th < 360; th += 22.5) { const [x, z] = pol(7.2, th), m = M(BOX(1.2, 0.08, 0.4), basic('#ffe2b0'), x, QU.h - 0.06, z, g, 0); m.rotation.y = -th * D; } void lp; }
    for (let k = 0; k < 8; k++) { const a = k * 45 + 22.5, [x, z] = pol((QU.rc + QU.ro) / 2, a), m = M(BOX(0.28, QU.h, QU.ro - QU.rc), wallMat, x, QU.h / 2, z, g, 0); m.rotation.y = -a * D; }
    // lift doors for this stop
    { const lg = new THREE.Group(), [x, z] = pol(QU.core + 0.12, 180); lg.position.set(x, 0, z); g.add(lg);
      const L = M(BOX(1.4, 3.1, 0.12), toon('#3a4452'), -0.7, 1.55, 0, lg, 0), Rr = M(BOX(1.4, 3.1, 0.12), toon('#3a4452'), 0.7, 1.55, 0, lg, 0); M(BOX(3.2, 0.16, 0.2), basic('#7fe3ff'), 0, 3.2, 0.04, lg, 0); for (const sx of [-1, 1]) M(BOX(0.14, 3.2, 0.2), basic('#7fe3ff'), sx * 1.5, 1.6, 0.04, lg, 0);
      sign(['LIFT', 'OPS · RING · QUARTERS'], 2.6, 0.9, '#7fe3ff', 2.9, 1.75, 0.08, 0, lg); ST.doors.push({ y: dk.y, L, R: Rr, open: 0, want: 0 }); }
    for (let k = 0; k < 8; k++) {
      const th = k * 45, key = Object.keys(SL).find(q => SL[q] === th), c2 = key && byKey[key], type = c2 ? 'cabin' : th === 180 ? 'lobby' : 'lounge';
      const cg = new THREE.Group(); cg.rotation.y = -th * D; g.add(cg);
      const at = (u, v) => [u * Math.sin(th * D) + v * Math.cos(th * D), -u * Math.cos(th * D) + v * Math.sin(th * D)];
      const B = (w, h, d, mat, u, y, v, p = cg) => M(BOX(w, h, d), mat, v, y, -u, p, 0);
      const C = (r1, r2, h, mat, u, y, v, seg = 12, p = cg) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, v, y, -u, p, 0);
      const hit = (u, v, r) => { const [x, z] = at(u, v); dk.circles.push([x, z, r]); };
      const side = (u, s) => { const sg = new THREE.Group(); sg.position.set(s * (hw(u) - 0.5), 0, -u); sg.rotation.y = -s * 22.5 * D; cg.add(sg); hit(u, s * (hw(u) - 0.5), 0.85); return sg; };
      const slot = { th, type, key: key || null }; dk.slots.push(slot);
      const L = c2 ? LOOK[key] || ['#6a5a4a', '#3a3026'] : ['#6a5a4a', dk.key === 'A' ? '#3a3026' : '#2a343a'];
      flatRing(QU.rc, QU.ro, th - 22.5, 45, toon(L[1]), 0.002, g);
      // the viewport on the outer wall
      { const vw = type === 'cabin' ? 5.4 : 8; const vp = new THREE.Mesh(new THREE.PlaneGeometry(vw, 2.2), viewMat); vp.position.set(0, 2.3, -(QU.ro - 0.12)); cg.add(vp);
        B(vw + 0.3, 0.2, 0.2, trimMat, QU.ro - 0.15, 3.45, 0); B(vw + 0.3, 0.2, 0.2, trimMat, QU.ro - 0.15, 1.15, 0); for (const s of [-1, 1]) B(0.2, 2.5, 0.2, trimMat, QU.ro - 0.15, 2.3, s * (vw / 2 + 0.05)); B(vw, 0.05, 0.05, basic(dk.col, 0.8), QU.ro - 0.25, 1.1, 0); }
      if (type === 'cabin') {
        const cab = { ...c2, deck: dk, th, slot, unlocked: false, door: null, inside: c2.mine ? MY_INSIDE : c2.inside };
        // corridor wall with the doorway, lintel, sliding door, signs + status lamp
        const ga = 0.95 / QU.rc / D; wall(QU.rc, 0, QU.h, th - 22.5, th - ga, wallMat, g); wall(QU.rc, 0, QU.h, th + ga, th + 22.5, wallMat, g); wall(QU.rc, 3.2, QU.h, th - ga, th + ga, wallMat, g);
        const dg = new THREE.Group(); dg.position.set(0, 0, -QU.rc); cg.add(dg);
        const dL = M(BOX(0.95, 3.1, 0.1), toon('#4a5260'), -0.48, 1.55, 0, dg, 0), dR = M(BOX(0.95, 3.1, 0.1), toon('#4a5260'), 0.48, 1.55, 0, dg, 0);
        M(BOX(2.2, 0.14, 0.18), basic(dk.col), 0, 3.2, 0.06, dg, 0); for (const s of [-1, 1]) M(BOX(0.12, 3.2, 0.18), basic(dk.col), s * 1.02, 1.6, 0.06, dg, 0);
        sign([c2.num + '  ' + c2.who], 3.6, 0.8, dk.col, 0, 3.85, 0.1, 0, dg); sign([c2.num, c2.who], 1.2, 0.8, dk.col, 1.75, 1.7, 0.1, 0, dg);
        const lampM = new THREE.MeshBasicMaterial({ color: 0xd23a2a, toneMapped: false }); M(BOX(0.22, 0.22, 0.06), lampM, -1.4, 1.7, 0.1, dg, 0);
        cab.door = { L: dL, R: dR, open: 0, want: 0 }; cab.lamp = lampM; cab.doorAt = at(QU.rc - 0.6, 0);
        // bunk + desk + terminal against the outer wall, a ceiling light, a rug
        const bu = QU.ro - 0.8; B(2.5, 0.5, 1.2, toon('#2a2c31'), bu, 0.25, -4.3); if (L[0]) B(2.3, 0.14, 1.1, toon(L[0]), bu, 0.56, -4.2); B(0.6, 0.16, 0.9, toon('#e8e4dc'), bu, 0.6, -5.2); hit(bu, -4.3, 1.45);
        B(2.0, 0.08, 0.9, toon('#4a4038'), bu - 0.05, 0.9, 4.2); for (const s of [-1, 1]) B(0.08, 0.9, 0.8, toon('#2a2c31'), bu - 0.05, 0.45, 4.2 + s * 0.9); const scr = B(0.9, 0.55, 0.05, basic('#9fd8ff', 0.85), bu + 0.25, 1.3, 4.2); scr.rotation.x = 0.15; C(0.32, 0.32, 0.08, toon('#1a1d22'), bu - 1.0, 0.5, 4.2); hit(bu, 4.2, 1.3);
        B(1.4, 0.06, 1.4, basic('#ffe2b0'), 14.2, QU.h - 0.05, 0); { const rug = new THREE.Mesh(new THREE.CircleGeometry(1.5, 24), toon(L[0] || '#5a3a2a')); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.01, -14); cg.add(rug); }
        // the 2D "inside" line made real
        const shelf = (u, s, cols) => { const sg = side(u, s); M(BOX(0.45, 2.6, 2.2), toon('#3a2a1a'), 0, 1.3, 0, sg, 0); if (cols) for (let i = 0; i < 4; i++) for (let j = 0; j < (LOW ? 3 : 6); j++) M(BOX(0.3, 0.42, 0.24), toon(pick(cols)), -s * 0.05, 0.4 + i * 0.6, -0.85 + j * 0.34, sg, 0); return sg; };
        const candles = (u, v) => { B(1.0, 0.8, 0.6, toon('#4a2a1a'), u, 0.4, v); for (let i = 0; i < 3; i++) { C(0.05, 0.05, 0.25, toon('#f3efe4'), u, 0.93, v - 0.3 + i * 0.3, 8); const f = M(new THREE.SphereGeometry(0.06, 8, 6), basic('#ffcf7a'), v - 0.3 + i * 0.3, 1.12, -u, cg, 0); anims.push((dt, t) => { f.scale.y = 1 + Math.sin(t * 9 + i * 2 + th) * 0.25; }); } hit(u, v, 0.8); };
        const crate = (u, v, s = 0.8, col = '#7a5a34') => { B(s, s, s, toon(col), u, s / 2, v); B(s + 0.02, 0.08, s + 0.02, toon('#3a2a14'), u, s * 0.8, v); };
        const tray = (u, v, glow) => { B(1.8, 0.7, 0.7, toon('#3a4048'), u, 0.35, v); for (let i = 0; i < 5; i++) C(0.12, 0.08, 0.3, toon(pick(['#4f8a3a', '#6aa04a', '#3a6a2a'])), u, 0.85, v - 0.7 + i * 0.35, 6); if (glow) B(1.8, 0.06, 0.5, basic('#c890ff', 0.9), u, 1.9, v); hit(u, v, 1.0); };
        const line = (u0, v0, u1, v1, cols) => { const [x0, z0] = [v0, -u0], [x1, z1] = [v1, -u1], len = Math.hypot(x1 - x0, z1 - z0), m = M(BOX(len, 0.03, 0.03), toon('#d8d0c0'), (x0 + x1) / 2, 2.4, (z0 + z1) / 2, cg, 0); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
          cols.forEach((col, i) => { const f = (i + 1) / (cols.length + 1), cl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), toon(col, { side: THREE.DoubleSide })); cl.position.set(x0 + (x1 - x0) * f, 2.05, z0 + (z1 - z0) * f); cl.rotation.y = m.rotation.y; cg.add(cl); anims.push((dt, t) => { cl.rotation.x = Math.sin(t * 1.3 + i) * 0.06; }); }); };
        const board = (u, v) => { B(1.3, 0.6, 1.3, toon('#4a3a2a'), u, 0.3, v); const bt = tex(canvas(128, 128, (c, w) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#e8dcc0' : '#3a2a1a'; c.fillRect(i * 16, j * 16, 16, 16); } })); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: bt })); p.rotation.x = -Math.PI / 2; p.position.set(v, 0.61, -u); cg.add(p); for (let i = 0; i < 6; i++) C(0.05, 0.05, 0.06, toon(i % 2 ? '#b3121b' : '#f3f2f2'), u - 0.3 + rnd() * 0.6, 0.65, v - 0.3 + rnd() * 0.6, 8); hit(u, v, 1.0); };
        const papers = (u, v, n) => { for (let i = 0; i < n; i++) { const h = rr(0.3, 1.1); B(0.5, h, 0.4, toon(pick(['#efe6d2', '#e2d6bc', '#d8c8a8'])), u + rr(-0.6, 0.6), h / 2, v + rr(-0.6, 0.6)); } hit(u, v, 1.0); };
        const P = { dsfCabinYou: () => { const sg = side(12, 1); M(BOX(0.7, 2.4, 1.4), toon('#4a5566'), 0, 1.2, 0, sg, 0); M(BOX(0.05, 2.2, 0.04), toon('#2a3038'), -0.36, 1.2, 0, sg, 0); sign(['8'], 0.5, 0.5, '#ec3013', -0.37, 1.9, 0.35, -Math.PI / 2, sg); crate(12.5, -3.2, 0.7, '#5a4a3a'); hit(12.5, -3.2, 0.7); },
          dsfCabKorra: () => { candles(12, -(hw(12) - 0.6)); shelf(13, 1, ['#7a1a1a', '#3a3026', '#c8a050', '#1a2a3a']); },
          dsfCabDacks: () => { shelf(11.5, 1, ['#3a5a8a', '#8a3a2a', '#d8c8a0', '#2a4a2a']); shelf(15, 1, ['#3a5a8a', '#5a3a6a', '#d8c8a0']); const lu = C(0.35, 0.42, 0.12, toon('#a8743a'), 12.5, 1.0, -3.4, 14); lu.rotation.x = Math.PI / 2; B(0.1, 1.0, 0.08, toon('#5a3a1a'), 12.5, 1.6, -3.4); C(0.03, 0.05, 0.9, toon('#2a2c31'), 12.6, 0.45, -3.4, 6); hit(12.5, -3.4, 0.6); },
          dsfCabObrain: () => { const sg = side(12, -1); M(BOX(1.0, 0.9, 2.6), toon('#5a4a3a'), 0, 0.45, 0, sg, 0); for (let i = 0; i < 5; i++) M(BOX(0.2, 0.12, 0.3), toon(pick(['#8a8f98', '#c8a050', '#b3121b'])), rr(-0.3, 0.3), 0.96, rr(-1, 1), sg, 0); const rk = side(13, 1); M(BOX(0.1, 1.6, 2.2), toon('#2a2c31'), 0, 1.8, 0, rk, 0); for (let i = 0; i < 6; i++) M(BOX(0.12, 0.6, 0.08), toon('#a8b0ba'), -0.1, 1.8, -0.9 + i * 0.36, rk, 0);
            const thing = new THREE.Group(); thing.position.set(0, 1.0, -13.4); cg.add(thing); M(BOX(0.8, 0.8, 0.8), toon('#4a5260'), 0, 0, 0, thing, 0); const tor = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.06, 6, 24), basic('#7fe3ff', 0.85)); thing.add(tor); C(0.15, 0.25, 1.0, toon('#2a2c31'), 13.4, 0.25, 0); anims.push((dt, t) => { tor.rotation.x = t * 0.8; tor.rotation.y = t * 0.5; }); hit(13.4, 0, 0.9); },
          dsfCabBashad: () => { tray(12.2, -(hw(12.2) - 0.7), true); shelf(13, 1, ['#e8eef2', '#7fb8de', '#2a4a50', '#d8c8a0']); },
          dsfCabWarf: () => { const bag = C(0.38, 0.38, 1.5, toon('#7a2418'), 13.2, 1.9, -2.4, 12); B(0.04, 0.9, 0.04, toon('#2a2c31'), 13.2, 3.1, -2.4); anims.push((dt, t) => { bag.rotation.z = Math.sin(t * 1.7) * 0.05; }); hit(13.2, -2.4, 0.6); const rk = side(12.5, 1); M(BOX(0.1, 1.8, 2.4), toon('#3a2418'), 0, 1.7, 0, rk, 0); for (let i = 0; i < 5; i++) M(BOX(0.06, 1.4, 0.1), toon('#c8ccd2'), -0.1, 1.7, -0.9 + i * 0.45, rk, 0); },
          dsfCabJack: () => { for (const [u, v, y] of [[12, -3.4, 0], [12, -2.5, 0], [12, -2.95, 0.8], [13.2, 3.0, 0], [13.2, 2.1, 0], [13.2, 2.55, 0.8]]) { B(0.8, 0.8, 0.8, toon('#7a5a34'), u, y + 0.4, v); B(0.82, 0.08, 0.82, toon('#3a2a14'), u, y + 0.65, v); } hit(12, -2.95, 1.1); hit(13.2, 2.55, 1.1); const lg = B(0.7, 0.04, 0.5, toon('#efe6d2'), QU.ro - 0.95, 0.96, 3.8); lg.rotation.y = 0.2; },
          dsfCabVor: () => { crate(12, -3.2); crate(12.8, -2.2, 0.7, '#6a3a6a'); hit(12.4, -2.7, 1.0); tray(13, hw(13) - 0.9, false); },
          dsfCabPells: () => { B(1.8, 0.35, 0.9, toon('#4a3a2a'), QU.ro - 0.9, 0.35, -1.6); B(1.6, 0.1, 0.8, toon('#f0d070'), QU.ro - 0.9, 0.56, -1.6); hit(QU.ro - 0.9, -1.6, 1.0); line(11, -(hw(11) - 0.3), 15, -(hw(15) - 0.3), ['#c87a3a', '#f3f2f2', '#3a5a8a', '#e0b0c0']); board(13.5, 1.5); },
          dsfCabSeth: () => { candles(12, -(hw(12) - 0.6)); line(11.5, hw(11.5) - 0.3, 15.5, hw(15.5) - 0.3, ['#d8a040', '#f3f2f2', '#8a4a2a']); tray(13.6, 1.2, false); },
          dsfCabGrell: () => { const sg = side(12.5, -1); M(BOX(1.0, 0.9, 2.8), toon('#4a4a4a'), 0, 0.45, 0, sg, 0); for (let i = 0; i < (LOW ? 5 : 10); i++) { const m = M(i % 2 ? new THREE.CylinderGeometry(0.1, 0.14, 0.3, 8) : BOX(0.24, 0.18, 0.3), toon(pick(['#8a8f98', '#6a5a4a', '#a87a3a', '#4a5260'])), rr(-0.3, 0.3), 1.05, -1.2 + i * (2.4 / (LOW ? 5 : 10)), sg, 0); m.rotation.y = rnd() * 3; } },
          dsfCabNag: () => { const s1 = shelf(12, 1, ['#c8a050', '#b3121b', '#3a5a8a', '#5a6a3a']); for (let i = 0; i < 4; i++) M(BOX(0.02, 0.12, 0.2), basic('#f3f2f2'), -0.26, 0.2 + i * 0.6, 0.6, s1, 0); shelf(15, 1, ['#c8a050', '#8a4a2a']); B(0.9, 0.5, 0.6, toon('#8a6a2a'), QU.ro - 0.8, 0.25, -2.4); B(0.2, 0.2, 0.04, toon('#2a2c31'), QU.ro - 1.12, 0.3, -2.4); hit(QU.ro - 0.8, -2.4, 0.7); },
          dsfCabPav: () => { candles(12, -(hw(12) - 0.6)); board(13.4, 1.4); papers(12.4, hw(12.4) - 1.0, LOW ? 5 : 10); } };
        (P[key] || (() => {}))();
        cabs.push(cab); slot.cab = cab;
      } else {
        // the lobby (lift side) or the lounge: open to the corridor
        sign([dk.label, type === 'lobby' ? 'DECK ' + (dk.key === 'A' ? 'THREE · CREW' : 'FOUR · RESIDENTS') : 'THE LOUNGE'], 4.6, 1.0, dk.col, 0, 3.9, -QU.rc + 0.1, 0, cg);
        B(9.2 * Math.tan(22.5 * D) * 2, 0.5, 0.3, trimMat, QU.rc, QU.h - 0.25, 0);
        if (type === 'lobby') { const list = cabins2d.filter(c => c.deck === dk.key).map(c => c.num + '  ' + c.who); sign([dk.label, ...list], 3.4, 0.45 * (list.length + 1), dk.col, 0, 0.6 + 0.45 * (list.length + 1) / 2 + 0.3, -12.6, 0, cg); B(3.6, 0.6, 0.3, trimMat, 12.75, 0.3, 0); hit(12.75, -1.0, 0.8); hit(12.75, 1.0, 0.8); hit(12.75, 0, 0.8);
          for (const s of [-1, 1]) { B(2.6, 0.45, 0.8, toon('#4a4038'), QU.ro - 1.6, 0.25, s * 3.0); hit(QU.ro - 1.6, s * 3.0, 1.3); } C(0.4, 0.3, 0.6, toon('#3a3026'), 16, 0.3, -(hw(16) - 0.7)); C(0.05, 0.6, 1.1, toon('#4f8a3a'), 16, 1.15, -(hw(16) - 0.7), 6); hit(16, -(hw(16) - 0.7), 0.6); }
        else { B(1.8, 0.75, 1.8, toon('#4a3a2a'), 13.4, 0.38, 0); hit(13.4, 0, 1.4); const bt = tex(canvas(128, 128, (c, w) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#e8dcc0' : '#3a2a1a'; c.fillRect(i * 16, j * 16, 16, 16); } })); const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ map: bt })); p.rotation.x = -Math.PI / 2; p.position.set(0, 0.77, -13.4); cg.add(p);
          for (const v of [-1.6, 1.6]) { C(0.35, 0.35, 0.5, toon('#2a2c31'), 13.4, 0.25, v, 12); hit(13.4, v, 0.5); } for (const s of [-1, 1]) { B(2.6, 0.45, 0.8, toon('#4a4038'), QU.ro - 1.6, 0.25, s * 3.0); hit(QU.ro - 1.6, s * 3.0, 1.3); } }
      }
    }
  }
  const deckAt = y => decks.find(d => Math.abs(y - d.y) < 1.2) || null;
  const slotOf = (dk, x, z) => { const th = angOf(x, z), k = Math.round(th / 45) % 8; return dk.slots[k]; };
  function walk(dk, x, z) { const r = Math.hypot(x, z); if (r < QU.core + 0.75 || r > QU.ro - 0.5) return false; for (const [cx, cz, cr] of dk.circles) if (Math.hypot(x - cx, z - cz) < cr) return false;
    if (r <= QU.rc - 0.35) return true; const s = slotOf(dk, x, z), d = Math.abs(adiff(angOf(x, z), s.th)), lat = r * Math.sin(d * D), toWall = r * Math.sin((22.5 - d) * D);
    if (toWall < 0.45) return false; if (s.type !== 'cabin') return true; const c = s.cab; if (!c.unlocked) return false;
    if (r < QU.rc + 0.4) return lat < 0.62 && c.door.open > 0.5; return true; }
  function cabinAt(x, z, y) { const dk = deckAt(y); if (!dk || Math.hypot(x, z) < QU.rc + 0.4) return null; const s = slotOf(dk, x, z); return s.cab || null; }
  function tick(dt, P, lift) { for (const dk of decks) dk.g.visible = lift ? dk.y > Math.min(lift.y0, lift.y1) - 6 && dk.y < Math.max(lift.y0, lift.y1) + 6 : Math.abs(P.gy - dk.y) < 3;
    const here = cabinAt(P.x, P.z, P.gy);
    for (const c of cabs) { if (!c.deck.g.visible) continue; const near = Math.hypot(P.x - c.doorAt[0], P.z - c.doorAt[1]) < 3.4 && Math.abs(P.gy - c.deck.y) < 1; c.door.want = c.unlocked && (near || here === c) ? 1 : 0;
      c.door.open += (c.door.want - c.door.open) * Math.min(1, dt * 6); c.door.L.position.x = -0.48 - c.door.open * 0.9; c.door.R.position.x = 0.48 + c.door.open * 0.9;
      c.lamp.color.set(c.unlocked ? 0x3ad26a : c.home ? 0xffb454 : 0xd23a2a); } }
  function clampCam(v3, P) { const dk = deckAt(P.gy); if (!dk) return; v3.y = Math.min(Math.max(v3.y, dk.y + 0.7), dk.y + QU.h - 0.5); const pr = Math.hypot(P.x, P.z);
    let r = Math.hypot(v3.x, v3.z), th = angOf(v3.x, v3.z);
    if (pr > QU.rc + 0.3) { const s = slotOf(dk, P.x, P.z); r = Math.min(Math.max(r, QU.rc + 0.4), QU.ro - 0.5); let d = adiff(th, s.th); const lim = 22.5 - (0.45 / r) / D; if (Math.abs(d) > lim) d = Math.sign(d) * lim; th = s.th + d; }
    else r = Math.min(Math.max(r, QU.core + 0.6), QU.rc - 0.35);
    const [x, z] = pol(r, th); v3.x = x; v3.z = z; }
  const bunkOf = c => { const u = QU.ro - 2.2, v = -4.3; return [u * Math.sin(c.th * D) + v * Math.cos(c.th * D), -u * Math.cos(c.th * D) + v * Math.sin(c.th * D)]; };
  return { decks, cabs, anims, walk, deckAt, cabinAt, tick, clampCam, bunkOf, slotOf };
}
