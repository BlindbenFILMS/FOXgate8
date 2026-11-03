// MERU 2.0 — step 3: interiors, part 3. CRESTVIEW HOUSE + LAKESIDE TOWER apartments, rooms ×2 the old size (worlds/meru-apartments.js).
// Ground floor = LOBBY (realtor, sofas, elevator at the back). Floors 1 and 2 sit inside the tower at their real heights (the city
// cutaway hides the tower above you). Each floor: a hall from the elevator, rooms A B (one side), C D (other side), E across from the
// elevator at the end. Numbers = floor*100 + n (101..205). Floor 2's E is the PENTHOUSE: 10 CR a night, the bed = sleep to morning.
// step 10 ART PASS 6d: dressed with the shared room kit (worlds/meru2-roomkit.js, merged by material). CRESTVIEW = classic (checker marble,
// walnut, burgundy, brass, a fireplace, chandeliers); LAKESIDE = modern (terrazzo, light oak, grey, chrome, a gas fire, pendants).
// Every room: plank floor, walls with baseboards (+ wainscot at Crestview), a door frame, a picture window with curtains, bed + nightstands
// + lamps, TV unit (MERU NEWS 8), sofa, coffee table, rug, wardrobe, a table for two under a pendant, a plant. Logic + spots unchanged.
// Local frame: u = toward the door face, v across. Both buildings face E/W, so u runs along world x (floor planes rely on that).
import { makeRoomKit } from './meru2-roomkit.js';
import { makeNightLit } from './meru2-nightlit.js';
import { ROOF_Y } from './meru2-apts-roof.js';   // s86: the lift's ROOF stop (garden + laundry, worlds/meru2-apts-roof.js)
export const FY = [0, 7.2, 10.8];
const ROOMS = [{ id: 'A', n: 1, u: [-16, -6], v: [-13, -2], door: -11 }, { id: 'B', n: 2, u: [-6, 4], v: [-13, -2], door: -1 }, { id: 'C', n: 3, u: [-16, -6], v: [2, 13], door: -11 }, { id: 'E', n: 4, u: [4, 16], v: [-6, 6], end: true }, { id: 'D', n: 5, u: [-6, 4], v: [2, 13], door: -1 }];
const STYLE = {
  crest: { wall: '#e9dcc4', wains: '#cbb48f', rail: '#f3ece0', base: '#5a3d26', wood: '#6b4a32', dark: '#3d2a1c', sofa: '#7a2a3a', sofa2: '#8f3445', accent: '#c9a227', duvet: '#2e4a6b', throw: '#7a2a3a', head: '#7a2a3a',
    rug: '#7a2a3a', rugEdge: '#c9a227', metal: '#b08d3c', top: '#ece6d8', panel: '#5a3d26', shade: '#f3ead6', curtain: '#7a2a3a', curtain2: '#64222f', frame: '#f3ece0', frameArt: '#b08d3c', shaft: '#8a7a66', door: '#5a3d26',
    desk: '#5a3d26', deskPanel: '#6b4a32', run: '#7a2a3a', runEdge: '#c9a227', pot: '#8a5a46', name: 'CRESTVIEW HOUSE', plate: ['#b08d3c', '#201e1d'] },
  lake: { wall: '#eef1f3', wains: null, rail: null, base: '#8a949c', wood: '#c9a77c', dark: '#5c6670', sofa: '#5c6670', sofa2: '#6b7680', accent: '#ec3013', duvet: '#2e4a6b', throw: '#cfd3d6', head: '#c9a77c',
    rug: '#cfd3d6', rugEdge: '#8a949c', metal: '#c0c4cc', top: '#f3f2f2', panel: '#201e1d', shade: '#f3f2f2', curtain: '#cfd3d6', curtain2: '#b9bec2', frame: '#201e1d', frameArt: '#201e1d', shaft: '#5c6670', door: '#3d3b3a',
    desk: '#f3f2f2', deskPanel: '#e2e5e8', run: '#3d3b3a', runEdge: '#f3f2f2', pot: '#3d3b3a', name: 'LAKESIDE TOWER', plate: ['#201e1d', '#f3f2f2'] } };
export function buildApts({ THREE, scene, M, toon, kit, cols, L }) {
  const touch = matchMedia('(pointer: coarse)').matches, { CT, Bin, planks, slate, signTex, pendant, rnd } = makeRoomKit({ THREE, touch });
  const FACE = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }, blds = [], spots = [], PL = new THREE.PlaneGeometry(1, 1), far = touch ? 70 : 130;
  const basic = t => new THREE.MeshBasicMaterial({ map: t });
  const floorMat = (t, ru, rv, shiny) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(ru, rv); t.needsUpdate = true; const o = { map: t, polygonOffset: true, polygonOffsetFactor: -2 };
    return shiny ? new THREE.MeshPhongMaterial({ ...o, shininess: 60, specular: 0x333333 }) : new THREE.MeshLambertMaterial(o); };
  const tvTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 144; const g = c.getContext('2d'); g.fillStyle = '#1d2a33'; g.fillRect(0, 0, 256, 144); g.fillStyle = '#ec3013'; g.fillRect(0, 108, 256, 36); g.fillStyle = '#fff'; g.font = '900 26px Archivo, sans-serif'; g.fillText('MERU NEWS 8', 12, 134); g.fillStyle = '#ffd23a'; g.fillRect(12, 18, 90, 70); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; })();
  const tvM = new THREE.MeshBasicMaterial({ map: tvTex });
  const artM = new THREE.MeshLambertMaterial({ map: CT(192, 112, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 70, 64); g.fillStyle = '#2e4a6b'; g.fillRect(150, 70, 42, 42); g.fillStyle = '#ffd23a'; g.fillRect(118, 0, 32, 30);
    g.fillStyle = '#201e1d'; for (const x of [70, 118, 150]) g.fillRect(x - 2, 0, 4, h); for (const y of [30, 64]) g.fillRect(0, y - 2, w, 4); g.fillRect(150, 68, w, 4); }) });
  const checker = () => { const t = CT(256, 256, (g, w) => { const s = w / 2; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const dk = (i + j) % 2; g.fillStyle = dk ? '#2b2a2e' : '#ece6d8'; g.fillRect(i * s, j * s, s, s);
      g.strokeStyle = dk ? 'rgba(255,255,255,0.08)' : 'rgba(120,110,95,0.25)'; for (let v = 0; v < 4; v++) { g.lineWidth = 0.6 + rnd(); g.beginPath(); let x = i * s + rnd() * s, y = j * s; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (rnd() - 0.5) * 40; y += s / 6; g.lineTo(Math.max(i * s, Math.min(i * s + s, x)), y); } g.stroke(); } }
    g.fillStyle = '#a8987c'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, w); g.fillRect(s - 1, 0, 2, w); g.fillRect(0, s - 1, w, 2); }); t.center.set(0.5, 0.5); t.rotation = Math.PI / 4; return t; };
  const terrazzo = () => CT(256, 256, (g, w) => { g.fillStyle = '#d9d6d0'; g.fillRect(0, 0, w, w); const C = ['#8a949c', '#f3f2f2', '#5c6670', '#c9b8a0', '#a9a39a'];
    for (let i = 0; i < 1600; i++) { g.fillStyle = i % 97 === 0 ? '#ec3013' : C[i % 5]; const s = 1 + rnd() * 3.5; g.fillRect(rnd() * w, rnd() * w, s, s * (0.6 + rnd() * 0.8)); } g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 0, w, 1.5); g.fillRect(0, 0, 1.5, w); });
  const runner = (S, motif) => CT(256, 96, (g, w, h) => { g.fillStyle = S.run; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)'; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
    g.fillStyle = S.runEdge; g.fillRect(0, 4, w, 6); g.fillRect(0, h - 10, w, 6); g.fillRect(0, 15, w, 1.5); g.fillRect(0, h - 16.5, w, 1.5);
    if (motif) for (let x = 32; x < w; x += 64) { g.save(); g.translate(x, h / 2); g.rotate(Math.PI / 4); g.fillRect(-9, -9, 18, 18); g.fillStyle = S.run; g.fillRect(-5, -5, 10, 10); g.fillStyle = S.runEdge; g.restore(); } });
  const plateM = (txt, bg, fg) => basic(CT(128, 64, (q, w, h) => { q.fillStyle = bg; q.fillRect(0, 0, w, h); q.fillStyle = fg; q.font = '800 38px Archivo, Helvetica, sans-serif'; q.textBaseline = 'middle'; q.fillText(txt, 14, h / 2 + 2); }));

  for (const key of ['crest', 'lake']) { const b0 = L.BUILDINGS.find(q => q.key === key); if (!b0) continue;
    // s35: built in the ORIGINAL frame (b.orig) like every other interior, so worlds/meru2-relocate.js carries it to the moved shell (it was half-built in the new frame)
    const b = b0.orig ? { ...b0, f: b0.orig.f, door: b0.orig.door, face: b0.orig.face } : b0; const F = FACE[b.face], cx = (b.f[0] + b.f[1]) / 2, cz = (b.f[2] + b.f[3]) / 2, Rv = [-F[1], F[0]], ry = Math.atan2(F[0], F[1]);
    const S = STYLE[key], stone = key === 'crest', hu = (b.f[1] - b.f[0]) / 2, hv = (b.f[3] - b.f[2]) / 2;
    const W = (u, v) => [cx + u * F[0] + v * Rv[0], cz + u * F[1] + v * Rv[1]];
    const aabb = (u0, u1, v0, v1) => { const a = W(u0, v0), c = W(u1, v1); return [Math.min(a[0], c[0]), Math.max(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[1], c[1])]; };
    const face = (su, sv) => Math.atan2(su * F[0] + sv * Rv[0], su * F[1] + sv * Rv[1]);
    const put = (g, w, h, d, col, u, y, v, o = 0.015, rot = 0) => { const [x, z] = W(u, v), m = M(new THREE.BoxGeometry(w, h, d), typeof col === 'string' ? toon(col) : col, x, y, z, g, o); m.rotation.y = ry + rot; return m; };
    const col = (u0, u1, v0, v1, y) => cols.push({ f: aabb(u0, u1, v0, v1), y0: y - 0.5, y1: y + 3 });
    const colBox = (u, v, du, dv, y) => col(u - du / 2, u + du / 2, v - dv / 2, v + dv / 2, y);
    const pic = (G, mat, w, h, u, y, v, rot) => { const m = new THREE.Mesh(PL, mat); m.scale.set(w, h, 1); const [x, z] = W(u, v); m.position.set(x, y, z); m.rotation.y = rot; G.add(m); return m; };
    const floorAt = (G, mat, u0, u1, v0, v1, y) => { const [x, z] = W((u0 + u1) / 2, (v0 + v1) / 2), m = new THREE.Mesh(PL, mat); m.scale.set(Math.abs(u1 - u0), Math.abs(v1 - v0), 1); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); if (!touch) m.receiveShadow = true; G.add(m); return m; };
    const K = bn => ({ bn,
      bx: (k, c, du, h, dv, u, y, v) => { const [x, z] = W(u, v); bn.box(k, c, dv, h, du, x, y, z, ry); },
      cy: (k, c, r, h, u, y, v, n = 12, top = 1) => { const [x, z] = W(u, v); bn.cyl(k, c, r, h, x, y, z, n, 0, 0, top); },
      sp: (k, c, r, u, y, v, sy = 1, n = 8) => { const [x, z] = W(u, v); bn.sph(k, c, r, x, y, z, sy, n); },
      ring: (k, c, R, t, u, y, v) => { const [x, z] = W(u, v); bn.tor(k, c, R, t, x, y, z, Math.PI / 2); } });
    const fr = (q, u, v, fu, fv) => (k, c, dd, h, dl, od, yy, ol) => fu ? q.bx(k, c, dd, h, dl, u + od * fu, yy, v + ol) : q.bx(k, c, dl, h, dd, u + ol, yy, v + od * fv);
    // ---- furniture kit (local u/v, facing fu/fv) ----
    const lamp = (q, u, y, v, h = 0.55) => { q.cy('gls', S.metal, 0.1, 0.04, u, y + 0.02, v); q.cy('gls', S.metal, 0.02, h, u, y + h / 2, v, 6); q.cy('mat', S.shade, h > 1 ? 0.26 : 0.18, h > 1 ? 0.32 : 0.24, u, y + h + 0.08, v, 12, 0.7); q.sp('glo', '#fff1c8', 0.08, u, y + h, v, 1, 6); };
    const sofa = (q, u, y, v, fu, fv, len = 2.2) => { const f0 = fr(q, u, v, fu, fv), SK = 1.3, f = (m, c, d, hh, l, du, yy, dv) => f0(m, c, d, hh * SK, l, du, y + (yy - y) * SK, dv); /* s181 FOX SCALE: heights x1.3 */
      f('mat', S.dark, 0.9, 0.16, len, 0, y + 0.1, 0); f('mat', S.sofa, 0.86, 0.22, len - 0.32, 0.02, y + 0.29, 0);
      for (const o of [-1, 1]) f('mat', S.sofa2, 0.74, 0.12, (len - 0.42) / 2, 0.06, y + 0.46, o * (len - 0.36) / 4);
      f('mat', S.sofa, 0.22, 0.64, len, -0.34, y + 0.52, 0); for (const o of [-1, 1]) f('mat', S.sofa, 0.9, 0.5, 0.17, 0, y + 0.4, o * (len / 2 - 0.085));
      f('mat', S.accent, 0.12, 0.34, 0.36, -0.17, y + 0.7, len / 2 - 0.42); f('mat', S.sofa2, 0.12, 0.34, 0.36, -0.17, y + 0.7, -(len / 2 - 0.42)); };
    const bed = (q, uh, y, v, w) => { const Lb = 2.2, uf = uh - 0.14 - Lb, um = uf + Lb / 2;
      q.bx('mat', S.dark, Lb, 0.3, w + 0.1, um, y + 0.17, v); q.bx('mat', '#f6f4ef', Lb - 0.08, 0.22, w, um, y + 0.43, v);
      q.bx('mat', S.duvet, Lb * 0.68, 0.07, w + 0.06, uf + Lb * 0.34, y + 0.57, v); q.bx('mat', '#f6f4ef', 0.2, 0.075, w + 0.07, uf + Lb * 0.68 + 0.1, y + 0.57, v);
      q.bx('mat', S.throw, 0.5, 0.08, w + 0.1, uf + 0.35, y + 0.6, v);
      for (const s of [-1, 1]) q.bx('mat', '#fbfaf7', 0.42, 0.14, w / 2 - 0.12, uh - 0.42, y + 0.62, v + s * w / 4);
      q.bx('mat', S.head, 0.12, 1.25, w + 0.3, uh - 0.08, y + 0.63, v); q.bx('gls', S.dark, 0.16, 0.06, w + 0.34, uh - 0.08, y + 1.27, v);
      if (!stone) for (let i = 0; i < 7; i++) q.bx('mat', S.dark, 0.02, 1.1, 0.03, uh - 0.155, y + 0.66, v - (w + 0.3) / 2 + (i + 0.5) * (w + 0.3) / 7);
      for (const s of [-1, 1]) { const nv = v + s * (w / 2 + 0.45); q.bx('mat', S.wood, 0.45, 0.55, 0.5, uh - 0.3, y + 0.275, nv); q.bx('mat', S.dark, 0.01, 0.02, 0.4, uh - 0.525, y + 0.36, nv); lamp(q, uh - 0.3, y + 0.55, nv, 0.38); }
      col(uf - 0.05, uh, v - w / 2 - 0.72, v + w / 2 + 0.72, y); };
    const tvUnit = (G, q, u, y, v, fu, fv) => { const f = fr(q, u, v, fu, fv); f('mat', S.wood, 0.45, 0.46, 1.8, 0, y + 0.23, 0); for (const o of [-0.45, 0.45]) f('mat', S.dark, 0.01, 0.3, 0.8, 0.226, y + 0.24, o);
      f('gls', '#201e1d', 0.05, 0.8, 1.4, -0.13, y + 1.32, 0); pic(G, tvM, 1.32, 0.72, u - 0.1 * fu, y + 1.32, v - 0.1 * fv, face(fu, fv)); };
    const chair = (q, u, y, v, fu, fv) => { const f = fr(q, u, v, fu, fv); f('mat', S.wood, 0.42, 0.05, 0.42, 0, y + 0.46, 0); f('mat', S.wood, 0.05, 0.46, 0.4, -0.19, y + 0.71, 0);
      for (const a of [-0.17, 0.17]) for (const c of [-0.17, 0.17]) f('mat', S.dark, 0.04, 0.44, 0.04, a, y + 0.22, c); };
    const plant = (q, u, y, v, s = 1) => { q.cy('mat', S.pot, 0.28 * s, 0.5 * s, u, y + 0.25 * s, v, 12, 1.15); q.cy('mat', '#3d2a1c', 0.27 * s, 0.02, u, y + 0.5 * s, v, 12);
      for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, rr = (0.12 + (k % 3) * 0.08) * s; q.sp('mat', k % 2 ? '#3d6b4a' : '#4f8a5c', 0.24 * s, u + Math.cos(a) * rr, y + (0.75 + (k % 4) * 0.22) * s, v + Math.sin(a) * rr, 1.4, 6); } };
    const rug = (q, u, y, v, du, dv, edge = S.rugEdge, mid = S.rug) => { q.bx('mat', edge, du, 0.01, dv, u, y + 0.035, v); q.bx('mat', mid, du - 0.24, 0.012, dv - 0.24, u, y + 0.038, v); };
    const chand = (q, u, v, y, top, R = 1.0) => { q.bx('gls', S.metal, 0.03, top - y, 0.03, u, (top + y) / 2, v); q.sp('gls', S.metal, 0.18, u, y, v);
      for (const [rr, yy, n] of [[R, y - 0.2, 10], [R * 0.6, y + 0.15, 6]]) { q.ring('gls', S.metal, rr, 0.035, u, yy, v); for (let i = 0; i < n; i++) { const a = i / n * 6.283, pu = u + Math.cos(a) * rr, pv = v + Math.sin(a) * rr; q.cy('mat', '#f3efe2', 0.025, 0.12, pu, yy + 0.08, pv, 6); q.sp('glo', '#ffe2a8', 0.06, pu, yy + 0.2, pv, 1.3, 6); } } };
    const pend = (q, u, v, y, top) => { const [x, z] = W(u, v); pendant(q.bn, x, z, y, top, stone ? S.metal : '#201e1d'); };
    // ---- walls: plaster, baseboard, wainscot + chair rail (Crestview), a dark cap on the cut top ----
    const wall = (q, u0, u1, v0, v1, y, h0 = 0, h1 = 3.4, collide = true) => { const along = Math.abs(u1 - u0) > Math.abs(v1 - v0), len = Math.abs(along ? u1 - u0 : v1 - v0), um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
      const B_ = (k, c, t, hh, yy) => along ? q.bx(k, c, len, hh, t, um, yy, vm) : q.bx(k, c, t, hh, len, um, yy, vm);
      B_('mat', S.wall, 0.2, h1 - h0, y + (h0 + h1) / 2); B_('mat', '#3d3b3a', 0.21, 0.02, y + h1 + 0.01);
      if (h0 === 0) { B_('mat', S.base, 0.24, 0.14, y + 0.07); if (S.wains) { B_('mat', S.wains, 0.23, 0.95, y + 0.55); B_('gls', S.rail, 0.27, 0.06, y + 1.02); } }
      if (collide) cols.push({ f: aabb(u0, u1, v0, v1), y0: y - 0.5, y1: y + 3 }); };
    const doorway = (q, u, v, alongU, y) => { const B_ = (a, h, t, oa, yy) => alongU ? q.bx('gls', S.door, a, h, t, u + oa, yy, v) : q.bx('gls', S.door, t, h, a, u, yy, v + oa);
      for (const s of [-1, 1]) B_(0.12, 2.6, 0.3, s * 0.86, y + 1.3); B_(1.84, 0.12, 0.3, 0, y + 2.62);
      if (alongU) wall(q, u - 0.8, u + 0.8, v, v, y, 2.62, 3.4, false); else wall(q, u, u, v - 0.8, v + 0.8, y, 2.62, 3.4, false); };
    const glazed = (q, u0, u1, v0, v1, y) => { const along = Math.abs(u1 - u0) > Math.abs(v1 - v0), len = Math.abs(along ? u1 - u0 : v1 - v0), um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
      const B_ = (k, c, l, hh, t, oa, yy) => along ? q.bx(k, c, l, hh, t, um + oa, yy, vm) : q.bx(k, c, t, hh, l, um, yy, vm + oa);
      B_('mat', S.wall, len, 0.85, 0.24, 0, y + 0.425); B_('gls', S.top, len + 0.04, 0.05, 0.34, 0, y + 0.875); B_('glass', '#cfe9ff', len, 2.3, 0.04, 0, y + 2.05);
      B_('gls', S.frame, len, 0.1, 0.12, 0, y + 3.25); B_('gls', S.frame, len, 0.06, 0.1, 0, y + 0.93);
      const n = Math.max(2, Math.round(len / 2.4)); for (let i = 0; i <= n; i++) B_('gls', S.frame, 0.07, 2.3, 0.1, -len / 2 + i * len / n, y + 2.05);
      for (const s of [-1, 1]) for (let p = 0; p < 4; p++) B_('mat', p % 2 ? S.curtain : S.curtain2, 0.17, 3.0, 0.14 + (p % 2) * 0.04, s * (len / 2 - 0.15 - p * 0.15), y + 1.55);
      cols.push({ f: aabb(u0, u1, v0, v1), y0: y - 0.5, y1: y + 3 }); };
    const elevFront = (q, y, f) => { const u = -12.84, dc = stone ? '#c9a46a' : '#aab2ba';
      for (const s of [-1, 1]) { q.bx('gls', S.metal, 0.12, 2.8, 0.16, u, y + 1.4, s * 1.12); q.bx('gls', dc, 0.04, 2.6, 1.02, u + 0.02, y + 1.3, s * 0.52); }
      q.bx('gls', S.metal, 0.12, 0.18, 2.4, u, y + 2.86, 0); q.bx('mat', '#201e1d', 0.04, 0.22, 0.8, u + 0.02, y + 3.12, 0);
      for (let i = 0; i < 3; i++) q.sp(i === f ? 'glo' : 'mat', i === f ? '#ec3013' : '#5c6670', 0.045, u + 0.05, y + 3.12, -0.24 + i * 0.24, 1, 6);
      q.bx('gls', S.metal, 0.03, 0.34, 0.16, u + 0.02, y + 1.15, 1.42); q.sp('glo', '#fff1c8', 0.04, u + 0.04, y + 1.2, 1.42, 1, 6); };
    // ---- floor materials ----
    const lobbyM = floorMat(stone ? checker() : terrazzo(), 2 * hu / (stone ? 2.4 : 3), 2 * hv / (stone ? 2.4 : 3), true);
    const roomT = stone ? planks('#9a6b43', '#4a3020') : planks('#d2b48c', '#9c7c58'), roomM = floorMat(roomT, 3.5, 3.5), hallT = roomT.clone(), hallM = floorMat(hallT, 7, 1.4);
    const pentM = floorMat(stone ? planks('#4a2f1e', '#24160c') : slate(), 3.5, 3.5, true);
    const runT = runner(S, stone), runM = floorMat(runT, 17 / 2.5, 1), runT2 = runT.clone(), lobRunM = floorMat(runT2, (hu + 12.5) / 3, 1);
    const B = { key, b, W, aabb, cx, cz, floors: [], pent: null };
    // ================= LOBBY =================
    const lob = new THREE.Group(); scene.add(lob); B.lob = lob; B.shafts = []; const lb = Bin(), q0 = K(lb);
    B.shafts.push(put(lob, 3.2, 7.2, 3.2, S.shaft, -14.5, 3.6, 0)); cols.push({ f: aabb(-16.1, -12.9, -1.6, 1.6) });
    floorAt(lob, lobbyM, -hu + 0.4, hu - 0.4, -hv + 0.4, hv - 0.4, 0.05); floorAt(lob, lobRunM, -12.9, hu - 0.4, -1.5, 1.5, 0.065);
    elevFront(q0, 0, 0);
    // reception: a tall back panel with the building's sign + pigeon holes, the desk in front, the realtor between
    q0.bx('mat', S.panel, 0.3, 3.4, 6, 6, 1.7, -8); q0.bx('gls', S.metal, 0.34, 0.08, 6.04, 6, 3.42, -8);
    pic(lob, basic(signTex(S.name)), 4.4, 0.82, 6.16, 2.78, -8, face(1, 0));
    for (let i = 0; i < 10; i++) for (let j = 0; j < 3; j++) { q0.bx('mat', S.dark, 0.03, 0.2, 0.46, 6.16, 1.45 + j * 0.25, -10.34 + i * 0.52); if ((i * 7 + j * 3) % 4 === 0) q0.bx('mat', '#f3efe2', 0.02, 0.1, 0.3, 6.18, 1.42 + j * 0.25, -10.34 + i * 0.52); }
    q0.bx('mat', S.desk, 1.0, 1.05, 3.2, 8, 0.525, -8); q0.bx('mat', S.deskPanel, 0.02, 0.7, 2.9, 8.51, 0.55, -8); q0.bx('gls', S.top, 1.2, 0.07, 3.4, 8, 1.085, -8);
    if (!stone) q0.bx('mat', '#ec3013', 0.02, 0.08, 3.2, 8.52, 0.96, -8);
    q0.cy('gls', S.metal, 0.07, 0.06, 8.2, 1.15, -7.1, 10, 0.3); q0.bx('mat', '#2e4a6b', 0.3, 0.03, 0.42, 7.9, 1.135, -8.4); q0.bx('mat', '#f3efe2', 0.28, 0.01, 0.4, 7.9, 1.152, -8.4); lamp(q0, 7.75, 1.12, -9.3, 0.4);
    col(7.4, 8.6, -9.7, -6.3, 0); col(5.8, 6.2, -11, -5, 0);
    const realtor = kit.makeFox({ key: key === 'crest' ? 'aptRealCrest' : 'aptRealLake', torso: stone ? '#f5e6c8' : '#e0f2fe', outfit: 'suit' }); { const [x, z] = W(6.9, -8); realtor.position.set(x, 0, z); realtor.rotation.y = ry; scene.add(realtor); B.realtor = realtor; }
    // the sitting room: fire on the far wall, two sofas facing across a coffee table, a rug, floor lamps
    const su = 3, fw = hv - 0.4, F0 = fw - 0.9, sc = hv - 5.6;
    if (stone) { q0.bx('mat', S.wains, 3.4, 4.6, 0.9, su, 2.3, fw - 0.45); q0.bx('mat', S.top, 2.6, 1.5, 0.12, su, 0.75, F0 - 0.06); q0.bx('mat', '#201e1d', 1.4, 0.9, 0.02, su, 0.5, F0 - 0.13);
      q0.bx('glo', '#ff8a3a', 1.0, 0.1, 0.02, su, 0.14, F0 - 0.15); q0.bx('glo', '#ffd27a', 0.6, 0.22, 0.02, su, 0.28, F0 - 0.155); for (const o of [-0.25, 0.2]) q0.bx('mat', '#5a3d26', 0.6, 0.12, 0.02, su + o, 0.1, F0 - 0.16);
      q0.bx('gls', S.top, 3.0, 0.1, 0.4, su, 1.55, F0 - 0.2); q0.bx('mat', '#5c5650', 3.0, 0.06, 0.8, su, 0.03, F0 - 0.4);
      q0.bx('gls', S.metal, 1.6, 1.1, 0.05, su, 2.65, F0 - 0.03); q0.bx('gls', '#9fb3c0', 1.4, 0.9, 0.02, su, 2.65, F0 - 0.06);
      for (const o of [-1.2, 1.2]) { q0.cy('gls', S.metal, 0.05, 0.3, su + o, 1.75, F0 - 0.2, 8); q0.cy('mat', '#f3efe2', 0.025, 0.18, su + o, 1.99, F0 - 0.2, 6); q0.sp('glo', '#ffe2a8', 0.04, su + o, 2.11, F0 - 0.2, 1.4, 6); }
      col(su - 1.7, su + 1.7, F0 - 0.8, hv, 0); }
    else { q0.bx('mat', '#3d3b3a', 6, 4.2, 0.4, su, 2.1, fw - 0.2); q0.bx('gls', '#201e1d', 6, 0.36, 0.55, su, 0.18, fw - 0.67); q0.bx('mat', '#201e1d', 3.2, 0.5, 0.02, su, 0.9, fw - 0.41);
      q0.bx('glo', '#ff9a4a', 3.0, 0.1, 0.02, su, 0.74, fw - 0.42); q0.bx('glo', '#ffd27a', 2.6, 0.05, 0.02, su, 0.84, fw - 0.425); q0.bx('gls', '#c0c4cc', 3.24, 0.03, 0.04, su, 1.16, fw - 0.42);
      col(su - 3, su + 3, fw - 0.95, hv, 0); }
    sofa(q0, su - 2.6, 0, sc, 1, 0, 3); sofa(q0, su + 2.6, 0, sc, -1, 0, 3); colBox(su - 2.6, sc, 0.95, 3, 0); colBox(su + 2.6, sc, 0.95, 3, 0);
    q0.bx('mat', S.dark, 1.2, 0.38, 0.7, su, 0.19, sc); q0.bx('gls', S.top, 1.3, 0.05, 0.8, su, 0.4, sc); q0.bx('mat', '#2e4a6b', 0.3, 0.04, 0.22, su - 0.2, 0.44, sc + 0.1); colBox(su, sc, 1.3, 0.8, 0);
    rug(q0, su, 0, sc, 6.6, 4.6); for (const o of [-1, 1]) lamp(q0, su + o * 2.6, 0, sc + 1.95, 1.45);
    // mailboxes on the near wall, plants by the door and the lift, lights
    q0.bx('mat', S.dark, 8.2, 2.2, 0.3, -2, 1.75, -hv + 0.45); for (let i = 0; i < 12; i++) for (let j = 0; j < 5; j++) { const u = -5.75 + i * 0.68, y = 0.9 + j * 0.42; q0.bx('gls', S.metal, 0.62, 0.36, 0.04, u, y, -hv + 0.62); q0.bx('mat', '#201e1d', 0.3, 0.03, 0.01, u, y + 0.1, -hv + 0.645); }
    col(-6.2, 2.2, -hv + 0.2, -hv + 0.7, 0);
    for (const [u, v, s] of [[hu - 1.4, 3.2, 1.3], [hu - 1.4, -3.2, 1.3], [-11.6, 6.0, 1], [-11.6, -6.0, 1]]) { plant(q0, u, 0, v, s); colBox(u, v, 0.8 * s, 0.8 * s, 0); }
    if (stone) { chand(q0, 3, 0, 5.4, 7.2, 1.2); chand(q0, su, sc, 4.8, 7.2, 0.9); }
    else { for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283; pend(q0, su + Math.cos(a) * 1.5, sc + Math.sin(a) * 1.2, 4.3 + (k % 3) * 0.5, 7.2); } for (const v of [-9.2, -8, -6.8]) pend(q0, 8, v, 3.4, 7.2); pend(q0, 3, 0, 4.8, 7.2); }
    // ================= s35 LOBBY UPGRADE (Ben): a room, not a glass box =================
    // the shell (meru2-city.js STY lobby) keeps windows only on the front wall near the door; here: a ceiling with a cornice, an entry
    // vestibule + mat, a CONCIERGE podium with the doorman facing the door, a proper LIFT WALL (second lift door, lit floor numbers, mirror,
    // bench), then Crestview: grand piano, bookcase, portraits, coffered ceiling · Lakeside: aquarium wall, coffee bar, lounge chairs, slatted ceiling
    { const CY = 6.82, ceilC = stone ? '#efe6d4' : '#eceff1', corn = stone ? S.rail || '#f3ece0' : '#c0c4cc';
      q0.bx('mat', ceilC, 2 * hu - 0.6, 0.1, 2 * hv - 0.6, 0, CY + 0.05, 0);
      for (const s of [-1, 1]) { q0.bx('gls', corn, 2 * hu - 0.6, 0.28, 0.36, 0, CY - 0.12, s * (hv - 0.48)); q0.bx('gls', corn, 0.36, 0.28, 2 * hv - 0.6, s * (hu - 0.48), CY - 0.12, 0); }
      if (stone) { for (let u = -hu + 4; u < hu - 1; u += 4) q0.bx('mat', S.wood, 0.3, 0.26, 2 * hv - 1, u, CY - 0.1, 0); for (let v = -hv + 4; v < hv - 1; v += 4) q0.bx('mat', S.wood, 2 * hu - 1, 0.26, 0.3, 0, CY - 0.1, v); }
      else for (let v = -hv + 1.2; v < hv - 1; v += 0.42) q0.bx('mat', (Math.round(v * 10) % 3) ? '#c9a77c' : '#b8936a', 2 * hu - 2.4, 0.12, 0.2, -0.6, CY - 0.08, v);
      // vestibule at the door: glass side screens on brass / steel frames, a lintel, a big mat
      for (const s of [-1, 1]) { q0.bx('glass', '#cfe9ff', 3.4, 2.8, 0.05, hu - 2.1, 1.4, s * 2.7); q0.bx('gls', S.metal, 0.1, 2.9, 0.1, hu - 3.8, 1.45, s * 2.7); q0.bx('gls', S.metal, 3.4, 0.1, 0.1, hu - 2.1, 2.85, s * 2.7); col(hu - 3.85, hu - 0.3, s * 2.7 - 0.08, s * 2.7 + 0.08, 0); }
      q0.bx('gls', S.metal, 0.12, 0.14, 5.5, hu - 3.8, 2.92, 0); q0.bx('mat', '#201e1d', 3.2, 0.012, 4.8, hu - 2.1, 0.07, 0); q0.bx('mat', S.accent, 3.0, 0.014, 0.12, hu - 2.1, 0.075, 2.25); q0.bx('mat', S.accent, 3.0, 0.014, 0.12, hu - 2.1, 0.075, -2.25);
      // concierge podium facing the door + the doorman behind it
      { const cu = hu - 7.6, cv = 4.6; q0.bx('mat', S.desk, 0.8, 1.1, 2.2, cu, 0.55, cv); q0.bx('gls', S.top, 0.95, 0.06, 2.35, cu, 1.13, cv); q0.bx('mat', S.accent, 0.02, 0.1, 2.2, cu + 0.41, 0.9, cv);
        q0.bx('mat', '#201e1d', 0.04, 0.26, 0.4, cu - 0.2, 1.3, cv - 0.5); q0.bx('glo', '#9fd6ff', 0.01, 0.22, 0.36, cu - 0.18, 1.3, cv - 0.5); q0.cy('gls', S.metal, 0.12, 0.03, cu, 1.17, cv + 0.6, 12); q0.sp('gls', '#ffc64a', 0.07, cu, 1.24, cv + 0.6, 0.6, 8); lamp(q0, cu, 1.16, cv - 0.9, 0.4);
        col(cu - 0.45, cu + 0.5, cv - 1.15, cv + 1.15, 0);
        const dm = kit.makeFox({ key: 'aptDoorman' + key, torso: stone ? ['#7a2a3a', '#c9a227', '#3d1a22'] : ['#201e1d', '#c0c4cc', '#0f1012'], outfit: 'suit' }); const [x, z] = W(cu - 0.9, cv); dm.position.set(x, 0, z); dm.rotation.y = ry; scene.add(dm); B.doorman = dm; cols.push({ c: [x, z, 0.45], y1: 3 }); }
      // lift wall: panelled, the real lift at v 0, a second (closed) lift at v +3.6, a mirror + bench at v -3.6, floor numbers lit over both
      { const wu = -12.92; for (const [v0, v1] of [[1.3, 6.6], [-6.6, -1.3]]) { const vm = (v0 + v1) / 2, len = v1 - v0; q0.bx('mat', S.panel, 0.2, CY, len, wu, CY / 2, vm); q0.bx('gls', S.metal, 0.24, 0.08, len, wu, 3.3, vm); col(wu - 0.12, wu + 0.12, Math.min(v0, v1), Math.max(v0, v1), 0); }
        q0.bx('mat', S.panel, 0.2, CY - 3.0, 2.6, wu, (CY + 3.0) / 2, 0);
        { const v = 3.6, dc = stone ? '#c9a46a' : '#aab2ba'; for (const s of [-1, 1]) { q0.bx('gls', S.metal, 0.12, 2.8, 0.16, wu + 0.1, 1.4, v + s * 1.12); q0.bx('gls', dc, 0.04, 2.6, 1.02, wu + 0.12, 1.3, v + s * 0.52); } q0.bx('gls', S.metal, 0.12, 0.18, 2.4, wu + 0.1, 2.86, v); q0.bx('mat', '#201e1d', 0.02, 2.6, 0.02, wu + 0.14, 1.3, v); }
        for (const v of [0, 3.6]) { q0.bx('mat', '#201e1d', 0.05, 0.34, 1.0, wu + 0.12, 3.6, v); q0.bx('glo', '#ffb347', 0.01, 0.16, 0.24, wu + 0.15, 3.6, v - 0.2); q0.bx('glo', '#ffb347', 0.01, 0.06, 0.4, wu + 0.15, 3.6, v + 0.25); q0.bx('gls', S.metal, 0.04, 0.3, 0.14, wu + 0.13, 1.15, v + 1.42); q0.sp('glo', '#7cff9b', 0.045, wu + 0.16, 1.2, v + 1.42, 1, 6); }
        q0.bx('gls', S.metal, 0.06, 2.3, 1.7, wu + 0.12, 1.75, -3.6); q0.bx('glass', '#dfe9ee', 0.02, 2.1, 1.5, wu + 0.16, 1.75, -3.6);
        q0.bx('mat', S.wood, 0.5, 0.08, 2.0, wu + 0.6, 0.46, -3.6); for (const e of [-0.85, 0.85]) q0.bx('mat', S.dark, 0.45, 0.42, 0.08, wu + 0.6, 0.22, -3.6 + e); colBox(wu + 0.6, -3.6, 0.6, 2.1, 0); }
      if (stone) {
        // grand piano by the fire: case + curved tail, propped lid, three legs, a bench; a bookcase on the front wall; portraits on the mailbox wall
        { const pu = -5.2, pv = hv - 4.2; q0.bx('mat', '#14110f', 1.5, 0.36, 1.6, pu, 0.92, pv); q0.cy('mat', '#14110f', 0.8, 0.36, pu - 0.75, 0.92, pv + 0.1, 20); q0.bx('mat', '#f3efe2', 0.2, 0.04, 1.4, pu + 0.82, 1.0, pv); q0.bx('mat', '#14110f', 0.14, 0.04, 1.4, pu + 0.82, 1.03, pv);
          const lid = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 1.5), toon('#1d1916')); { const [x, z] = W(pu - 0.3, pv - 0.1); lid.position.set(x, 1.55, z); lid.rotation.y = ry; lid.rotateX(0); lid.rotateZ(0); lid.rotation.order = 'YXZ'; lid.rotation.x = 0.6 * (F[0] ? 0 : 1); lid.rotation.z = 0.6 * (F[0] ? -F[0] : 0); lob.add(lid); }
          for (const [du, dv] of [[0.6, -0.6], [0.6, 0.6], [-1.3, 0.1]]) q0.bx('mat', '#14110f', 0.14, 0.75, 0.14, pu + du, 0.37, pv + dv); q0.bx('mat', '#14110f', 0.4, 0.5, 0.9, pu + 1.35, 0.25, pv); col(pu - 1.6, pu + 1.6, pv - 0.9, pv + 0.95, 0); }
        { const bu = hu - 0.45, v0 = -16.5, v1 = -10.5, vm = (v0 + v1) / 2; q0.bx('mat', S.dark, 0.5, 4.2, v1 - v0, bu, 2.1, vm); const SP = ['#7a2a3a', '#2e4a6b', '#3f7a52', '#c9a227', '#5a3d26', '#f3efe2'];
          for (let r = 0; r < 6; r++) { const y = 0.3 + r * 0.66; q0.bx('mat', S.wood, 0.48, 0.05, v1 - v0 - 0.1, bu - 0.02, y, vm); for (let i = 0; i < 26; i++) { const hgt = 0.38 + ((i * 7 + r * 3) % 5) * 0.04; q0.bx('mat', SP[(i + r * 2) % 6], 0.28, hgt, 0.18, bu - 0.18, y + 0.03 + hgt / 2, v0 + 0.25 + i * 0.215); } }
          col(bu - 0.3, bu + 0.3, v0, v1, 0); lamp(q0, bu - 1.2, 0, v0 + 0.6, 1.45); }
        { const PT = CT(512, 256, (g, w, h) => { const C2 = [['#3d2a1c', '#c97a3a'], ['#2e4a6b', '#e0823a'], ['#3f2a1c', '#8a5a3a'], ['#2a3a2a', '#d8a070']]; for (let i = 0; i < 4; i++) { const x0 = i * 128; g.fillStyle = C2[i][0]; g.fillRect(x0, 0, 128, h); g.fillStyle = C2[i][1];
              g.beginPath(); g.ellipse(x0 + 64, 120, 34, 40, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(x0 + 36, 92); g.lineTo(x0 + 44, 52); g.lineTo(x0 + 58, 86); g.fill(); g.beginPath(); g.moveTo(x0 + 92, 92); g.lineTo(x0 + 84, 52); g.lineTo(x0 + 70, 86); g.fill();
              g.fillStyle = '#f3efe2'; g.beginPath(); g.ellipse(x0 + 64, 138, 16, 14, 0, 0, 7); g.fill(); g.fillStyle = '#201e1d'; g.fillRect(x0 + 50, 112, 7, 7); g.fillRect(x0 + 71, 112, 7, 7); g.fillStyle = C2[(i + 1) % 4][0]; g.fillRect(x0 + 18, 170, 92, 86); } });
          for (let i = 0; i < 4; i++) { const u = -10 + i * 4.2, m = new THREE.MeshBasicMaterial({ map: PT.clone() }); m.map.repeat.set(0.25, 1); m.map.offset.set(i * 0.25, 0); m.map.needsUpdate = true; q0.bx('gls', '#c9a227', 1.5, 1.9, 0.08, u, 4.4, -hv + 0.36); pic(lob, m, 1.3, 1.7, u, 4.4, -hv + 0.42, face(0, 1)); } } }
      else {
        // AQUARIUM wall on the front wall (left of the windows): back-lit blue tank with fish + coral + bubbles, a steel frame
        { const au = hu - 0.6, v0 = -17, v1 = -9.5, vm = (v0 + v1) / 2, AW = v1 - v0; const AQ = CT(1024, 384, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5fd0ff'); gr.addColorStop(1, '#0b4c7a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
              for (let i = 0; i < 9; i++) { const x = 40 + i * 115, hh = 60 + (i * 37) % 90; g.fillStyle = ['#ff7a59', '#f472b6', '#facc15', '#22c55e'][i % 4]; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + (k - 2) * 10, h - hh / 2 + k * 4, 6, hh / 2 - k * 6, (k - 2) * 0.2, 0, 7); g.fill(); } }
              g.fillStyle = '#e8d6a8'; g.fillRect(0, h - 22, w, 22); for (let i = 0; i < 16; i++) { const x = (i * 211) % w, y = 50 + (i * 97) % (h - 120), c = ['#ffb347', '#ffd23a', '#ff6b6b', '#7dd3fc', '#f3f2f2'][i % 5], s = 10 + (i % 3) * 6, dir = i % 2 ? 1 : -1;
                g.fillStyle = c; g.beginPath(); g.ellipse(x, y, s * 1.6, s, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - dir * s * 1.4, y); g.lineTo(x - dir * s * 2.6, y - s); g.lineTo(x - dir * s * 2.6, y + s); g.fill(); g.fillStyle = '#201e1d'; g.beginPath(); g.arc(x + dir * s * 0.9, y - 2, 2.5, 0, 7); g.fill(); }
              g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc((i * 131) % w, (i * 53) % (h - 40), 3 + i % 4, 0, 7); g.stroke(); } });
          q0.bx('gls', '#5c6670', 0.7, 3.6, AW + 0.3, au, 1.8, vm); pic(lob, new THREE.MeshBasicMaterial({ map: AQ }), AW, 2.9, au - 0.37, 2.05, vm, face(-1, 0)); q0.bx('gls', '#201e1d', 0.74, 0.5, AW + 0.32, au, 0.25, vm); q0.bx('gls', '#201e1d', 0.74, 0.18, AW + 0.32, au, 3.55, vm);
          col(au - 0.4, au + 0.4, v0, v1, 0);
          for (const v of [-15.2, -11.3]) { sofa(q0, hu - 4.6, 0, v, 1, 0, 1.3); colBox(hu - 4.6, v, 0.95, 1.3, 0); } q0.cy('mat', '#201e1d', 0.45, 0.42, hu - 4.6, 0.21, -13.25, 18); q0.cy('gls', S.top, 0.5, 0.04, hu - 4.6, 0.44, -13.25, 18); colBox(hu - 4.6, -13.25, 1, 1, 0); }
        // COFFEE BAR on the mailbox wall: counter, espresso machine, cups, three stools, a menu board
        { const cv = -hv + 1.1, u0 = 7, u1 = 13.5, um = (u0 + u1) / 2; q0.bx('mat', '#201e1d', u1 - u0, 1.05, 0.7, um, 0.525, cv); q0.bx('gls', '#f3f2f2', u1 - u0 + 0.1, 0.06, 0.8, um, 1.08, cv); q0.bx('mat', '#ec3013', u1 - u0, 0.08, 0.02, um, 0.95, cv + 0.36);
          q0.bx('gls', '#c0c4cc', 0.9, 0.55, 0.5, u0 + 1.2, 1.38, cv - 0.05); q0.bx('mat', '#201e1d', 0.7, 0.12, 0.3, u0 + 1.2, 1.2, cv + 0.12); for (const o of [-0.2, 0.2]) q0.cy('gls', '#9aa0a6', 0.03, 0.12, u0 + 1.2 + o, 1.25, cv + 0.18, 8);
          for (let i = 0; i < 6; i++) q0.cy('mat', '#f3f2f2', 0.05, 0.09, u0 + 2.4 + (i % 3) * 0.14, 1.16 + (i / 3 | 0) * 0.1, cv - 0.15, 10);
          for (let i = 0; i < 3; i++) { const u = u0 + 2.2 + i * 1.6; q0.cy('gls', '#9aa0a6', 0.04, 0.72, u, 0.36, cv + 1.0, 8); q0.cy('mat', '#ec3013', 0.24, 0.08, u, 0.76, cv + 1.0, 14); q0.cy('gls', '#9aa0a6', 0.2, 0.02, u, 0.01, cv + 1.0, 12); }
          pic(lob, basic(signTex('COFFEE')), 2.4, 0.5, um, 2.6, -hv + 0.62, face(0, 1)); col(u0, u1, -hv + 0.4, cv + 0.4, 0); }
        for (const [u, v, s] of [[hu - 1.3, -8.2, 1.5], [hu - 1.3, 8.4, 1.5], [-11.8, 7.4, 1.4], [-11.8, -7.4, 1.4], [0.5, -hv + 1.2, 1.2]]) { plant(q0, u, 0, v, s); colBox(u, v, 0.8 * s, 0.8 * s, 0); } }
      // Crestview: a CURVED STAIR (decor: the lift is how you go up) sweeping round the back-left corner up to a gallery landing at 5 m:
      // 16 stone treads on a quarter curve, red runner, brass balusters + handrail, the landing with its rail; one collider keeps you off it
      if (stone) { const N = 16, top = 5.0, rise = top / N;
        for (let i = 0; i < N; i++) { const t = (i + 0.5) / N, pu = -hu + 1.8 + 7.5 * Math.sin(t * Math.PI / 2), pv = hv - 7.6 + 6.0 * (1 - Math.cos(t * Math.PI / 2)), y = (i + 1) * rise;
          q0.bx('mat', S.top, 1.2, 0.16, 2.2, pu, y - 0.08, pv); q0.bx('mat', S.dark, 1.15, Math.max(0.02, y - 0.16), 2.1, pu, Math.max(0.01, (y - 0.16) / 2), pv); q0.bx('mat', S.run, 1.22, 0.02, 1.0, pu, y + 0.01, pv);
          if (i % 2 === 0) q0.bx('gls', S.metal, 0.05, 0.95, 0.05, pu, y + 0.47, pv - 1.05); q0.bx('gls', S.metal, 0.9, 0.06, 0.08, pu, y + 0.98, pv - 1.05); }
        q0.bx('mat', S.top, 3.6, 0.2, 3.4, -hu + 10.6, top - 0.1, hv - 1.9); q0.bx('mat', S.dark, 3.6, 0.5, 3.4, -hu + 10.6, top - 0.45, hv - 1.9);
        q0.bx('gls', S.metal, 3.6, 0.07, 0.08, -hu + 10.6, top + 1.0, hv - 3.6); q0.bx('gls', S.metal, 0.08, 0.07, 3.4, -hu + 12.4, top + 1.0, hv - 1.9);
        for (let k = 0; k < 9; k++) q0.bx('gls', S.metal, 0.05, 1.0, 0.05, -hu + 8.9 + k * 0.42, top + 0.5, hv - 3.6);
        col(-hu + 0.6, -hu + 12.5, hv - 8.8, hv - 0.4, 0); }
      // wall LINING (the shell's ground storey is a stone podium outside): plaster to the ceiling, Crestview wainscot + rail, Lakeside a dark base;
      // gaps for the front windows (|v| < 8) and the back door (door2, mapped into this old frame)
      { const R4 = ['N', 'E', 'S', 'W'], q = b0.orig ? ((R4.indexOf(b0.face) - R4.indexOf(b.face)) % 4 + 4) % 4 : 0, ncx = (b0.f[0] + b0.f[1]) / 2, ncz = (b0.f[2] + b0.f[3]) / 2;
        let bd2 = null; if (b0.door2) { let dx = b0.door2[0] - ncx, dz = b0.door2[1] - ncz; for (let i = 0; i < (4 - q) % 4; i++) { const t = dx; dx = -dz; dz = t; } const x = cx + dx, z = cz + dz; bd2 = [(x - cx) * F[0] + (z - cz) * F[1], (x - cx) * Rv[0] + (z - cz) * Rv[1]]; }
        const line = (fixU, at, a0, a1, gaps) => { let s = a0; for (const [g0, g1] of [...gaps, [a1, a1]].sort((p, r) => p[0] - r[0])) { const e = Math.min(g0, a1); if (e - s > 0.2) { const m = (s + e) / 2, L2 = e - s;
              if (fixU) { q0.bx('mat', S.wall, 0.06, CY, L2, at, CY / 2, m); if (S.wains) { q0.bx('mat', S.wains, 0.08, 1.0, L2, at, 0.55, m); q0.bx('gls', S.rail || S.top, 0.12, 0.06, L2, at, 1.08, m); } else q0.bx('mat', S.dark, 0.08, 0.3, L2, at, 0.15, m); }
              else { q0.bx('mat', S.wall, L2, CY, 0.06, m, CY / 2, at); if (S.wains) { q0.bx('mat', S.wains, L2, 1.0, 0.08, m, 0.55, at); q0.bx('gls', S.rail || S.top, L2, 0.06, 0.12, m, 1.08, at); } else q0.bx('mat', S.dark, L2, 0.3, 0.08, m, 0.15, at); } } s = Math.max(s, g1); } };
        const gU = (sgn) => bd2 && Math.abs(bd2[0] - sgn * hu) < 1 ? [[bd2[1] - 2.6, bd2[1] + 2.6]] : [], gV = (sgn) => bd2 && Math.abs(bd2[1] - sgn * hv) < 1 ? [[bd2[0] - 2.6, bd2[0] + 2.6]] : [];
        line(true, hu - 0.42, -hv + 0.4, hv - 0.4, [[-8, 8], ...gU(1)]); line(true, -hu + 0.42, -hv + 0.4, hv - 0.4, gU(-1));
        line(false, hv - 0.42, -hu + 0.4, hu - 0.4, gV(1)); line(false, -hv + 0.42, -hu + 0.4, hu - 0.4, gV(-1)); }
      // warm light pools (indoors: always on)
      { const NL = makeNightLit(THREE); for (const [u, v, r] of [[hu - 2.1, 0, 3.2], [hu - 7.6, 4.6, 2.4], [-12, 0, 3.4], [-12, 3.6, 2.2], [3, hv - 5.6, 4.2], [7.6, -8, 2.6], [3, 0, 4.0]]) { const [x, z] = W(u, v); NL.pool(x, 0.07, z, r, '#ffd9a0', 0.3); } NL.done(lob); NL.tick(10, true); } }
    lb.build(lob);
    { const [x, z] = W(-11.6, 0); spots.push({ key: 'elev:' + key + ':0', x, z, r: 1.8, prompt: 'ELEVATOR', y: [0, 3] }); }
    { const RY = ROOF_Y[key], HU = Math.round(hu * 0.42 * 10) / 10, [x, z] = W(-HU + 1.2, 0); if (RY) spots.push({ key: 'elev:' + key + ':3', x, z, r: 1.6, prompt: 'ELEVATOR', y: [RY - 0.5, RY + 2] }); B.roofHU = HU; }
    { const [x, z] = W(9.4, -8); spots.push({ key: 'pent:' + key, x, z, r: 2, prompt: 'PENTHOUSE \u00b7 10 CR A NIGHT', y: [0, 3] }); }
    // ================= FLOORS 1 + 2 =================
    for (const f of [1, 2]) { const y = FY[f], g = new THREE.Group(); g.visible = false; scene.add(g); B.floors[f] = g; const fb = Bin(), q = K(fb);
      M(new THREE.BoxGeometry(b.f[1] - b.f[0] - 0.8, 0.3, b.f[3] - b.f[2] - 0.8), toon('#9aa0a6'), cx, y - 0.15, cz, g, 0);
      B.shafts.push(put(g, 3.2, 3.4, 3.2, S.shaft, -14.5, y + 1.7, 0)); cols.push({ f: aabb(-16.1, -12.9, -1.6, 1.6), y0: y - 0.5, y1: y + 3 });
      elevFront(q, y, f);
      floorAt(g, hallM, -16, 4, -2, 2, y + 0.03); floorAt(g, runM, -12.9, 4, -1.25, 1.25, y + 0.045);
      for (const u of [-14, -8, -4, 2]) for (const s of [-1, 1]) { q.bx('gls', S.metal, 0.16, 0.3, 0.04, u, y + 2.1, s * 1.86); q.cy('mat', S.shade, 0.1, 0.18, u, y + 2.26, s * 1.74, 10, 0.75); q.sp('glo', '#fff1c8', 0.06, u, y + 2.2, s * 1.74, 1, 6); }
      for (const r of ROOMS) { const isP = f === 2 && r.id === 'E', no = f * 100 + r.n, [u0, u1] = r.u, [v0, v1] = r.v, cv = (v0 + v1) / 2;
        floorAt(g, isP ? pentM : roomM, u0 + 0.1, u1 - 0.1, v0 + 0.1, v1 - 0.1, y + 0.03);
        const lab = plateM(String(no), S.plate[0], isP ? '#ffc64a' : S.plate[1]);
        if (r.end) {
          wall(q, u0, u0, v0, -0.8, y); wall(q, u0, u0, 0.8, v1, y); doorway(q, u0, 0, false, y); wall(q, u0, u1, v0, v0, y); wall(q, u0, u1, v1, v1, y); glazed(q, u1, u1, v0 + 0.1, v1 - 0.1, y);
          const bw = isP ? 2.2 : 1.8; bed(q, u1 - 0.14, y, 0, bw);
          if (isP) { q.bx('mat', S.sofa, 0.45, 0.6, bw, u1 - 2.8, y + 0.3, 0); q.bx('mat', S.dark, 0.47, 0.06, bw + 0.02, u1 - 2.8, y + 0.03, 0); col(u1 - 3.05, u1 - 2.55, -bw / 2, bw / 2, y); rug(q, u1 - 2, y, 0, 4.2, 4.2, '#c9a227', stone ? '#7a2a3a' : '#2e4a6b'); }
          tvUnit(g, q, 8, y, v1 - 0.33, 0, -1); col(7.05, 8.95, v1 - 0.6, v1, y);
          sofa(q, 8, y, 2.4, 0, 1, 2.4); colBox(8, 2.4, 2.5, 0.95, y); lamp(q, 6.3, y, 2.4, 1.45);
          q.bx('mat', S.dark, 1.0, 0.36, 0.55, 8, y + 0.18, 3.95); q.bx('gls', S.top, 1.1, 0.04, 0.62, 8, y + 0.38, 3.95); colBox(8, 3.95, 1.1, 0.6, y); rug(q, 8, y, 3.9, 3.6, 3.4);
          q.bx('gls', S.top, 1.8, 0.05, 0.95, 8, y + 0.75, -3.8); for (const a of [-0.8, 0.8]) for (const c of [-0.38, 0.38]) q.bx('mat', S.dark, 0.06, 0.72, 0.06, 8 + a, y + 0.36, -3.8 + c);
          for (const a of [-0.45, 0.45]) { chair(q, 8 + a, y, -3.05, 0, -1); chair(q, 8 + a, y, -4.55, 0, 1); } colBox(8, -3.8, 2.0, 2.1, y);
          if (isP && stone) chand(q, 8, -3.8, y + 2.6, y + 3.4, 0.6); else pend(q, 8, -3.8, y + 1.75, y + 3.4);
          plant(q, u0 + 0.6, y, v1 - 0.6); colBox(u0 + 0.6, v1 - 0.6, 0.7, 0.7, y); plant(q, u1 - 0.6, y, v1 - 0.6); colBox(u1 - 0.6, v1 - 0.6, 0.7, 0.7, y);
          if (isP) { q.bx('mat', S.dark, 3.0, 1.05, 0.6, 13.5, y + 0.525, v0 + 0.45); q.bx('gls', S.top, 3.1, 0.05, 0.7, 13.5, y + 1.075, v0 + 0.45); q.bx('gls', S.dark, 3.0, 0.04, 0.25, 13.5, y + 1.7, v0 + 0.22);
            for (let i = 0; i < 10; i++) q.cy('gls', ['#2f6b45', '#7a2a3a', '#c9a227', '#cfe9ff'][i % 4], 0.05, 0.28, 12.2 + i * 0.29, y + 1.86, v0 + 0.22, 8);
            for (const u of [12.8, 14.2]) { q.cy('gls', S.metal, 0.04, 0.72, u, y + 0.36, v0 + 1.25, 6); q.cy('gls', S.metal, 0.2, 0.03, u, y + 0.02, v0 + 1.25, 12); q.cy('mat', S.sofa, 0.2, 0.08, u, y + 0.76, v0 + 1.25, 12); }
            col(12, 15, v0, v0 + 0.8, y); }
          else { plant(q, u1 - 0.6, y, v0 + 0.6); colBox(u1 - 0.6, v0 + 0.6, 0.7, 0.7, y); }
          pic(g, lab, 0.5, 0.26, u0 - 0.125, y + 1.62, 1.4, face(-1, 0)); q.bx('gls', S.metal, 0.02, 0.32, 0.56, u0 - 0.115, y + 1.62, 1.4);
          if (isP) { const [x, z] = W(u1 - 4.2, 0); spots.push({ key: 'sleep:' + key, x, z, r: 1.8, prompt: 'SLEEP TILL MORNING', y: [y - 0.5, y + 2] }); B.pent = { u: u0, y, blk: { f: aabb(u0 - 0.15, u0 + 0.15, -0.8, 0.8), y0: y - 0.5, y1: y + 3, on: true } }; cols.push(B.pent.blk);
            B.pentDoor = put(g, 1.6, 2.5, 0.08, S.door, u0, y + 1.25, 0); }
        } else {
          const s = v0 < 0 ? -1 : 1, vh = s < 0 ? v1 : v0, vf = s < 0 ? v0 : v1;
          wall(q, u0, r.door - 0.8, vh, vh, y); wall(q, r.door + 0.8, u1, vh, vh, y); doorway(q, r.door, vh, true, y); wall(q, u1, u1, v0, v1, y);
          glazed(q, u0 + 0.1, u1 - 0.1, vf, vf, y); if (u0 < -15) glazed(q, u0, u0, v0, v1, y);
          const tu = u0 + 2.1; tvUnit(g, q, tu, y, vh + s * 0.33, 0, s); col(tu - 0.95, tu + 0.95, vh, vh + s * 0.6, y);
          const sv = vh + s * 3.5; sofa(q, tu, y, sv, 0, -s, 2.2); colBox(tu, sv, 2.3, 0.95, y); lamp(q, tu + 1.55, y, sv, 1.45);
          q.bx('mat', S.dark, 1.0, 0.36, 0.55, tu, y + 0.18, vh + s * 2.2); q.bx('gls', S.top, 1.1, 0.04, 0.62, tu, y + 0.38, vh + s * 2.2); colBox(tu, vh + s * 2.2, 1.1, 0.6, y);
          rug(q, tu, y, vh + s * 2.4, 3.0, 3.2);
          const bv = cv + s * 1.7; bed(q, u1 - 0.14, y, bv, 1.8);
          q.bx('gls', S.frameArt, 0.04, 0.95, 1.6, u1 - 0.13, y + 2.2, bv); pic(g, artM, 1.5, 0.85, u1 - 0.155, y + 2.2, bv, face(-1, 0));
          const wu = u1 - 1.3; q.bx('mat', S.wood, 1.9, 2.2, 0.6, wu, y + 1.1, vh + s * 0.42); q.bx('mat', S.dark, 0.02, 2.0, 0.01, wu, y + 1.1, vh + s * 0.725);
          for (const o of [-0.08, 0.08]) q.bx('gls', S.metal, 0.03, 0.25, 0.03, wu + o, y + 1.15, vh + s * 0.74); col(wu - 0.95, wu + 0.95, vh, vh + s * 0.75, y);
          const du = u0 + 1.6, dv = vf - s * 1.7; q.cy('gls', S.top, 0.5, 0.04, du, y + 0.74, dv, 16); q.cy('mat', S.dark, 0.06, 0.7, du, y + 0.37, dv, 8); q.cy('mat', S.dark, 0.3, 0.04, du, y + 0.02, dv, 12);
          chair(q, du + 0.75, y, dv, -1, 0); chair(q, du - 0.75, y, dv, 1, 0); colBox(du, dv, 2.1, 1.1, y); pend(q, du, dv, y + 1.75, y + 3.4);
          plant(q, u1 - 0.55, y, vf - s * 0.6); colBox(u1 - 0.55, vf - s * 0.6, 0.7, 0.7, y);
          pic(g, lab, 0.5, 0.26, r.door + 1.25, y + 1.62, vh - s * 0.125, face(0, -s)); q.bx('gls', S.metal, 0.56, 0.32, 0.02, r.door + 1.25, y + 1.62, vh - s * 0.115);
        } }
      fb.build(g);
      { const [x, z] = W(-11.6, 0); spots.push({ key: 'elev:' + key + ':' + f, x, z, r: 1.8, prompt: 'ELEVATOR', y: [y - 0.5, y + 2] }); } }
    blds.push(B); }
  function groundAt(x, z, y) { for (const B of blds) { const f = B.b.f; if (x < f[0] || x > f[1] || z < f[2] || z > f[3] || y < 5) continue; const RY = ROOF_Y[B.key]; if (RY && y > RY - 2) return RY; return y > FY[2] - 1.2 ? FY[2] : FY[1]; } return null; }
  function floorOf(x, z, y) { for (const B of blds) { const f = B.b.f; if (x > f[0] && x < f[1] && z > f[2] && z < f[3]) return { B, f: ROOF_Y[B.key] && y > ROOF_Y[B.key] - 2 ? 3 : y > FY[2] - 1.2 ? 2 : y > FY[1] - 1.2 ? 1 : 0 }; } return null; }
  function tick(dt, p, rentedKey, cam) { const at = p ? floorOf(p.x, p.z, p.y) : null; for (const B of blds) { if (cam) { const sb = B.aabb(-16.6, -12.4, -2.1, 2.1); const inX = cam.x > sb[0] && cam.x < sb[1] && cam.z > sb[2] && cam.z < sb[3]; for (const m of B.shafts) m.visible = !inX; B.lob.visible = Math.hypot(cam.x - B.cx, cam.z - B.cz) < far; }
      for (const f of [1, 2]) B.floors[f].visible = !!at && at.B === B && at.f === f; if (B.pent) { B.pent.blk.on = rentedKey !== B.key; if (B.pentDoor) B.pentDoor.visible = B.pent.blk.on; } kit.animFox(B.realtor, dt, 0, false); if (B.doorman) kit.animFox(B.doorman, dt, 0, false); } return at; }
  const elevTo = (key, f) => { const B = blds.find(q => q.key === key); if (!B) return null; const roof = f === 3 && ROOF_Y[key], [x, z] = roof ? B.W(-B.roofHU + 2.2, 0) : B.W(-6, 0); return { x, z, y: roof ? ROOF_Y[key] : FY[f], yaw: Math.atan2(...(() => { const F = FACE[B.b.face]; return [F[0], F[1]]; })()) }; };
  return { tvTex, spots, groundAt, floorOf, tick, elevTo, FY, people: blds.map(B => ({ key: B.key === 'crest' ? 'aptRealCrest' : 'aptRealLake', obj: B.realtor, ry: B.realtor.rotation.y })) };
}
