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
  const tvTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 144; const g = c.getContext('2d'); g.fillStyle = '#1d2a33'; g.fillRect(0, 0, 256, 144); g.fillStyle = '#ec3013'; g.fillRect(0, 108, 256, 36); g.fillStyle = '#fff'; g.font = '900 26px Archivo, sans-serif'; g.fillText('MERU NEWS 8', 12, 134); g.fillStyle = '#ffd23a'; g.fillRect(12, 18, 90, 70); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
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

  for (const key of ['crest', 'lake']) { const b = L.BUILDINGS.find(q => q.key === key); if (!b) continue; const F = FACE[b.face], cx = (b.f[0] + b.f[1]) / 2, cz = (b.f[2] + b.f[3]) / 2, Rv = [-F[1], F[0]], ry = Math.atan2(F[0], F[1]);
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
    const sofa = (q, u, y, v, fu, fv, len = 2.2) => { const f = fr(q, u, v, fu, fv);
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
    for (const [u, v, s] of [[hu - 1.4, 3.2, 1.3], [hu - 1.4, -3.2, 1.3], [-11.6, 2.7, 1], [-11.6, -2.7, 1]]) { plant(q0, u, 0, v, s); colBox(u, v, 0.8 * s, 0.8 * s, 0); }
    if (stone) { chand(q0, 3, 0, 5.4, 7.2, 1.2); chand(q0, su, sc, 4.8, 7.2, 0.9); }
    else { for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283; pend(q0, su + Math.cos(a) * 1.5, sc + Math.sin(a) * 1.2, 4.3 + (k % 3) * 0.5, 7.2); } for (const v of [-9.2, -8, -6.8]) pend(q0, 8, v, 3.4, 7.2); pend(q0, 3, 0, 4.8, 7.2); }
    lb.build(lob);
    { const [x, z] = W(-11.6, 0); spots.push({ key: 'elev:' + key + ':0', x, z, r: 1.8, prompt: 'ELEVATOR', y: [0, 3] }); }
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
          if (isP) { q.bx('mat', S.sofa, 0.45, 0.42, bw, u1 - 2.8, y + 0.21, 0); q.bx('mat', S.dark, 0.47, 0.06, bw + 0.02, u1 - 2.8, y + 0.03, 0); col(u1 - 3.05, u1 - 2.55, -bw / 2, bw / 2, y); rug(q, u1 - 2, y, 0, 4.2, 4.2, '#c9a227', stone ? '#7a2a3a' : '#2e4a6b'); }
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
  function groundAt(x, z, y) { for (const B of blds) { const f = B.b.f; if (x < f[0] || x > f[1] || z < f[2] || z > f[3] || y < 5) continue; return y > FY[2] - 1.2 ? FY[2] : FY[1]; } return null; }
  function floorOf(x, z, y) { for (const B of blds) { const f = B.b.f; if (x > f[0] && x < f[1] && z > f[2] && z < f[3]) return { B, f: y > FY[2] - 1.2 ? 2 : y > FY[1] - 1.2 ? 1 : 0 }; } return null; }
  function tick(dt, p, rentedKey, cam) { const at = p ? floorOf(p.x, p.z, p.y) : null; for (const B of blds) { if (cam) { const sb = B.aabb(-16.6, -12.4, -2.1, 2.1); const inX = cam.x > sb[0] && cam.x < sb[1] && cam.z > sb[2] && cam.z < sb[3]; for (const m of B.shafts) m.visible = !inX; B.lob.visible = Math.hypot(cam.x - B.cx, cam.z - B.cz) < far; }
      for (const f of [1, 2]) B.floors[f].visible = !!at && at.B === B && at.f === f; if (B.pent) { B.pent.blk.on = rentedKey !== B.key; if (B.pentDoor) B.pentDoor.visible = B.pent.blk.on; } kit.animFox(B.realtor, dt, 0, false); } return at; }
  const elevTo = (key, f) => { const B = blds.find(q => q.key === key); if (!B) return null; const [x, z] = B.W(-6, 0); return { x, z, y: FY[f], yaw: Math.atan2(...(() => { const F = FACE[B.b.face]; return [F[0], F[1]]; })()) }; };
  return { spots, groundAt, floorOf, tick, elevTo, FY, people: blds.map(B => ({ key: B.key === 'crest' ? 'aptRealCrest' : 'aptRealLake', obj: B.realtor, ry: B.realtor.rotation.y })) };
}
