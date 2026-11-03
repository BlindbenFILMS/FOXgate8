// MERU 2.0 — s55 TOWN 2 INTERIOR 13: MERU POST OFFICE [meruPost] (f 52..76 × -344..-322, door S (64, -322); clock tower over the door).
// STAMPS (Ben's pick): fussy old postmaster, peaked cap, round glasses, a pocket watch, never late.
// ONE SHIFT, ALL STEPS (Ben): 1 CATCH parcels tipping off the van into the cart · 2 SORT letters from the tube chute into district slots ·
// 3 STAMP envelopes on the sorting belt when the ring goes green · 4 WRAP a customer's gift (paper, tape, string, bow) · 5 WEIGH + PRICE 3 parcels ·
// 6 SIGN FOR IT (trace the customer's signature) · 7 LOST LETTER (read the smudged address, tap the right building on the district map).
// GAME 2 · MAIL ROUTE (Ben's idea): 5 letters to 5 town doors in order + back, against Stamps' clock. GENTLE: no fail.
// Prizes in turn: POSTAL CAP + SATCHEL (worn) → STAMP BOOK (a stamp per world; Meru first) → bonus gold. PO BOX 12 opens after the first shift
// (postcards with gold after every route). Room: brass PO boxes, pneumatic tubes, sorting machine, stamp case, district map, parcel mountain,
// queue rope, CLOCK TOWER STAIR (gallery over the door + LOOK OUT from the clock face).
// s72 INTERIOR POLISH 13: shopKit (Stamps = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; BEST board SHIFT + ROUTE; badge), NOW HIRING by the door,
// ONE-box menu with choices, 1-box lines, hint hand, touch radius 44, portrait lens, cameras clamped inside the room.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildPostOffice({ THREE, scene, kit, cols, save, touch, sayTo, camera, L, hour = () => 12, isMuted = () => false }) {
  const X0 = 52.4, X1 = 75.6, Z0 = -343.6, Z1 = -322.4, CX = 64, CZ = -333;
  const G = new THREE.Group(); G.name = 'postOffice'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), RG = mk(), RT = mk(), { box, cyl, sph } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { c, fn }; return t; };
  const redraw = (t, fn) => { const c = t.userData.c; fn(c.getContext('2d'), c.width, c.height); t.needsUpdate = true; };
  const rect = (a, b, c2, d, y0, y1) => { const o = { f: [a, b, c2, d] }; if (y0 != null) o.y0 = y0; if (y1 != null) o.y1 = y1; cols.push(o); return o; };
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', NAVY = '#2e4a6b', BLUE = '#2e86b8', GREEN = '#3f9a5e', BRASS = '#c9a24a', CREAM = '#efe6d2', WOOD = '#8a6440', KRAFT = '#b98a55', DARK = '#3d3b3a', STEEL = '#b8bec4', PINK = '#f472b6', GOLD = '#e6b45a';
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 12) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W - 24, fs); });
  const plane = (map, w, h, x, y, z, ry = 0, par = G, rx = 0, tr = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: tr, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0, 'YXZ'); par.add(m); return m; };
  const plane2 = (map, w, h, x, y, z, ry = 0, par = G) => { const m = new THREE.MeshBasicMaterial({ map }); for (const k of [0, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.rotation.y = ry + k * Math.PI; p.position.set(x + Math.sin(ry) * (k ? -0.006 : 0.006), y, z + Math.cos(ry) * (k ? -0.006 : 0.006)); par.add(p); } };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const mm = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; };
  const Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d), Cy = (a, b, h, s = 14) => new THREE.CylinderGeometry(a, b, h, s), Sp = (r, a = 12, b = 8) => new THREE.SphereGeometry(r, a, b);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  // ---------- floor (cream + navy tiles) + walls (navy wainscot, yellow rail, cream plaster) ----------
  { const t = CT(256, 256, (g, W, H) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#e8dfcc' : '#d8ceb8'; g.fillRect(i * 32, j * 32, 32, 32); } g.strokeStyle = 'rgba(46,74,107,0.35)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, H); g.stroke(); g.beginPath(); g.moveTo(0, i * 32); g.lineTo(W, i * 32); g.stroke(); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 2.4, (Z1 - Z0) / 2.4); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, (Z0 + Z1) / 2); G.add(f); }
  const wall = (len, x, z, ry) => { box(len, 0.3, 0.06, INK, x, 0.15, z, ry); box(len, 1.2, 0.05, NAVY, x, 0.9, z, ry); box(len, 0.1, 0.08, YEL, x, 1.55, z, ry); box(len, 6.0, 0.05, CREAM, x, 4.6, z, ry); };
  for (const [a, b] of [[X0, 62.6], [65.4, X1]]) wall(b - a, (a + b) / 2, Z1 - 0.03, 0);
  wall(X1 - X0, CX, Z0 + 0.03, 0); wall(Z1 - Z0, X0 + 0.03, (Z0 + Z1) / 2, Math.PI / 2); wall(Z1 - Z0, X1 - 0.03, (Z0 + Z1) / 2, Math.PI / 2);
  box(2.4, 0.02, 1.2, RED, 64, 0.08, -323.1);
  // ================= COUNTER (lobby | staff) + queue rope =================
  const TOP = 1.06;
  box(15.5, 1.0, 1.0, WOOD, 63.25, 0.5, -332); box(15.7, 0.06, 1.12, '#5a3e28', 63.25, 1.03, -332); box(15.5, 0.12, 0.04, BRASS, 63.25, 0.9, -331.49); box(15.5, 0.3, 0.03, NAVY, 63.25, 0.2, -331.49); rect(55.5, 71, -332.5, -331.5);
  plane(label('LETTERS · PARCELS · STAMPS', NAVY, YEL, 1024, 64, 40), 6.0, 0.38, 63.25, 0.6, -331.47, 0);
  box(0.5, 0.35, 0.4, DARK, 57.2, TOP + 0.17, -332.1); box(0.42, 0.04, 0.3, YEL, 57.2, TOP + 0.36, -332.15, 0, -0.3); box(0.3, 0.02, 0.2, '#fbf8f0', 59.4, TOP + 0.01, -331.9);   // till + forms
  for (const x of [66.4, 69.2]) for (const z of [-330.2, -328.4, -326.6]) { cyl(0.04, 0.04, 0.95, BRASS, x, 0.48, z, 8); cyl(0.16, 0.18, 0.05, BRASS, x, 0.03, z, 12); sph(0.06, BRASS, x, 0.98, z); }
  for (const x of [66.4, 69.2]) { box(0.035, 0.035, 3.6, RED, x, 0.86, -328.4); rect(x - 0.05, x + 0.05, -330.2, -326.6); }
  { const T = label('PLEASE QUEUE HERE', INK, YEL, 512, 64, 40); plane2(T, 1.6, 0.2, 67.8, 1.25, -326.6, 0); for (const x of [66.4, 69.2]) box(0.02, 0.4, 0.02, DARK, x, 1.05, -326.6); }
  // ================= PARTITION (staff | back room), opening x 68..75.6 =================
  box(15.6, 4.8, 0.2, CREAM, 60.2, 2.4, -337.5); box(15.64, 1.5, 0.24, NAVY, 60.2, 0.75, -337.5); box(15.64, 0.08, 0.28, YEL, 60.2, 1.52, -337.5); box(15.7, 0.15, 0.3, NAVY, 60.2, 4.85, -337.5); rect(X0, 68, -337.62, -337.38);
  box(0.25, 4.9, 0.3, NAVY, 68.0, 2.45, -337.5);
  // ================= SORT: chute desk + 4 district slots on the partition =================
  const DIST = [{ k: 'town', n: 'TOWN SQUARE', c: RED }, { k: 'lake', n: 'LAKESIDE', c: BLUE }, { k: 'castle', n: 'CASTLE', c: INK }, { k: 'arena', n: 'ARENA', c: GREEN }];
  box(5.2, 1.0, 1.0, WOOD, 55.6, 0.5, -336.8); box(5.3, 0.05, 1.1, '#5a3e28', 55.6, 1.02, -336.8); rect(53, 58.2, -337.4, -336.3);
  const SLOTS = DIST.map((d, i) => { const x = 53.65 + i * 1.3; box(1.1, 0.8, 0.12, d.c, x, 1.8, -337.32); box(0.9, 0.6, 0.06, DARK, x, 1.8, -337.24); box(1.1, 0.06, 0.3, d.c, x, 1.43, -337.22);
    plane(label(d.n, d.c, '#ffffff', 256, 64, 34), 1.1, 0.27, x, 2.42, -337.37, 0); return { ...d, i, p: V(x, 1.8, -337.2) }; });
  box(0.7, 0.05, 0.5, STEEL, 55.6, 1.15, -336.7, 0, -0.5); box(0.25, 1.3, 0.25, STEEL, 55.6, 1.95, -337.1, 0, 0.35);   // reading stand + chute
  // ================= SORTING MACHINE (stamp step): belt west, stamp head at x 63 =================
  const BY = 0.95, BZ = -335.4, HX = 63;
  box(8.6, 0.88, 0.95, STEEL, 63.1, 0.44, BZ); box(8.7, 0.06, 1.05, DARK, 63.1, 0.9, BZ); rect(58.0, 68.1, -335.95, -334.85);
  const beltTex = CT(64, 64, (g, W, H) => { g.fillStyle = '#3a3a3a'; g.fillRect(0, 0, W, H); g.fillStyle = '#2a2a2a'; for (let i = 0; i < 4; i++) g.fillRect(i * 16, 0, 6, H); }); beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping; beltTex.repeat.set(16, 1);
  { const b = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 0.82), new THREE.MeshLambertMaterial({ map: beltTex })); b.rotation.x = -Math.PI / 2; b.position.set(63.1, BY - 0.02, BZ); G.add(b); }
  box(1.0, 1.7, 1.2, RED, 67.6, 0.85, BZ); box(0.8, 0.4, 0.05, DARK, 67.08, 1.15, BZ, Math.PI / 2); plane(label('SORTER 8', INK, YEL, 256, 64, 40), 0.8, 0.2, 67.6, 1.5, BZ + 0.61, 0);
  box(0.9, 0.6, 1.1, NAVY, 58.3, 0.3, BZ); plane(label('DONE', NAVY, '#ffffff', 128, 64, 34), 0.6, 0.25, 58.3, 0.4, BZ + 0.56, 0);
  box(0.18, 2.0, 0.18, STEEL, HX, 1.0, -336.1); box(0.14, 0.14, 0.8, STEEL, HX, 1.95, -335.75);
  const head = new THREE.Group(); head.position.set(HX, 1.6, BZ); head.add(mm(Cy(0.04, 0.04, 0.5, 8), LM(STEEL), 0, 0.25, 0), mm(Bx(0.26, 0.16, 0.2), LM(RED), 0, 0, 0), mm(Bx(0.2, 0.03, 0.14), LM(INK), 0, -0.09, 0)); G.add(head);
  const sRing = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.2, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, depthWrite: false })); sRing.rotation.x = -Math.PI / 2; sRing.position.set(HX, BY + 0.01, BZ); sRing.visible = false; G.add(sRing);
  // ================= DISTRICT MAP (partition, over the belt) =================
  const MAPC = V(63.1, 3.35, -337.37), MW = 3.4, MH = 2.6;
  const HINT = { shoes: 'THE GIANT SNEAKER ON A POLE', pie: 'A BIG PIE BY THE DOOR', motel: 'THE VACANCY SIGN', hospital: 'THE RED CROSS', bait: 'DOWN BY THE LAKE · WORMS', hobby: 'KITES + ROCKETS', climb: 'THE TALL WALL WITH HOLDS', minigolf: 'THE LITTLE WINDMILL', flowers: 'THE GLASS GREENHOUSE PORCH', museum: 'THE GOLD DOME', barber: 'THE STRIPED POLE', tailor: 'THE GIANT NEEDLE', club: 'THE WHITE COLUMNS', chocolates: 'THE GIANT CHOCOLATE BAR', nature: 'THE LOG CABIN', skate: 'THE QUARTER-PIPE ON THE ROOF', chiro: 'THE WHITE CLINIC' };
  const POxz = [64, -319.4];
  const PINS = (() => { const all = (L && L.BUILDINGS || []).filter(b => b.town2 && HINT[b.kind] && b.door && !/closed/i.test(b.label || '')); const seen = new Set(), out = [];
    for (const b of all) { if (seen.has(b.kind)) continue; const [x, z] = b.door; if (Math.hypot(x - POxz[0], z - POxz[1]) < 70) continue; if (out.some(p => Math.hypot(p.x - x, p.z - z) < 105)) continue; seen.add(b.kind); out.push({ key: b.key, kind: b.kind, label: (b.label || '').replace(/^Meru /, '').replace(/^Kind /, '').toUpperCase(), x, z }); if (out.length >= 7) break; } return out; })();
  const MP = (() => { const xs = PINS.map(p => p.x).concat(POxz[0]), zs = PINS.map(p => p.z).concat(POxz[1]); const bx0 = Math.min(...xs) - 50, bx1 = Math.max(...xs) + 50, bz0 = Math.min(...zs) - 40, bz1 = Math.max(...zs) + 40; return { bx0, bx1, bz0, bz1 }; })();
  const toMap = (x, z, W, H) => { const mw = W - 60, mh = H - 100, s = Math.min(mw / (MP.bx1 - MP.bx0), mh / (MP.bz1 - MP.bz0)), ox = 30 + (mw - (MP.bx1 - MP.bx0) * s) / 2, oy = 76 + (mh - (MP.bz1 - MP.bz0) * s) / 2; return [ox + (x - MP.bx0) * s, oy + (z - MP.bz0) * s, s, ox, oy]; };
  let mapState = { found: -1, hint: -1, blink: 0 };
  const drawMap = (g, W, H) => { g.fillStyle = '#f3ecd9'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(46,74,107,0.12)'; g.lineWidth = 1; for (let x = 0; x < W; x += 32) { g.beginPath(); g.moveTo(x, 64); g.lineTo(x, H); g.stroke(); } for (let y = 64; y < H; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const w = L && L.WATER && (L.WATER[0] || L.WATER); if (w && w.e) { const [ex, ez, rx, rz] = w.e, a = toMap(ex, ez, W, H); g.fillStyle = '#9cc7e0'; g.beginPath(); g.ellipse(a[0], a[1], rx * a[2], rz * a[2], 0, 0, Math.PI * 2); g.fill(); }
    if (L && L.BAY && L.BAY.r) { const [x0, x1, z0, z1] = L.BAY.r, p = toMap(x0, z0, W, H), q = toMap(x1, z1, W, H), r = L.BAY.rc * p[2]; g.fillStyle = '#9cc7e0'; g.beginPath(); if (g.roundRect) g.roundRect(p[0], p[1], q[0] - p[0], q[1] - p[1], r); else g.rect(p[0], p[1], q[0] - p[0], q[1] - p[1]); g.fill(); g.fillRect(p[0] + r, p[1] - 40 * p[2], q[0] - p[0] - 2 * r, 40 * p[2] + r); }   // s104: the Speedboat Bay arm (open to the lake on its north side)
    g.fillStyle = INK; g.fillRect(0, 0, W, 60); g.fillStyle = YEL; g.textBaseline = 'middle'; fitTxt(g, 'MERU · DISTRICT MAP', 18, 32, W - 200, 34); g.fillStyle = '#ffffff'; g.font = '900 26px Archivo, sans-serif'; g.fillText('N ↑', W - 80, 32);
    g.lineWidth = 6; g.strokeStyle = INK; g.strokeRect(3, 3, W - 6, H - 6);
    { const [px, py] = toMap(POxz[0], POxz[1], W, H); g.fillStyle = NAVY; g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 20, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r); } g.closePath(); g.fill(); g.font = '900 18px Archivo, sans-serif'; g.fillText('POST OFFICE', px + 24, py + 2); }
    const placed = [[...toMap(POxz[0], POxz[1], W, H)].slice(0, 2).map((v, i) => i ? v - 20 : v - 20).concat([160, 40])]; g.font = '900 20px Archivo, sans-serif';
    PINS.forEach((p, i) => { const [px, py] = toMap(p.x, p.z, W, H); placed.push([px - 17, py - 17, 34, 34]); });
    const hit = (r) => placed.some(q => r[0] < q[0] + q[2] && r[0] + r[2] > q[0] && r[1] < q[1] + q[3] && r[1] + r[3] > q[1]) || r[0] < 8 || r[0] + r[2] > W - 8 || r[1] < 66 || r[1] + r[3] > H - 8;
    PINS.forEach((p, i) => { const [px, py] = toMap(p.x, p.z, W, H), on = i === mapState.found, hl = i === mapState.hint && mapState.blink % 2 === 0; g.fillStyle = on ? GREEN : hl ? YEL : RED; g.beginPath(); g.arc(px, py, 15, 0, Math.PI * 2); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
      const tw = g.measureText(p.label).width + 8, opts = [[px + 20, py - 14], [px - 20 - tw, py - 14], [px - tw / 2, py - 46], [px - tw / 2, py + 18], [px + 20, py - 40], [px - 20 - tw, py + 12], [px + 20, py + 12], [px - 20 - tw, py - 40]]; let o = opts.find(([x, y]) => !hit([x, y, tw, 28])) || opts[0]; placed.push([o[0], o[1], tw, 28]);
      g.fillStyle = 'rgba(255,255,255,0.92)'; g.fillRect(o[0], o[1], tw, 28); g.fillStyle = INK; g.fillText(p.label, o[0] + 4, o[1] + 15); }); };
  const mapTex = CT(768, 588, drawMap); plane(mapTex, MW, MH, MAPC.x, MAPC.y, MAPC.z, 0); box(MW + 0.14, MH + 0.14, 0.04, INK, MAPC.x, MAPC.y, MAPC.z - 0.03);
  const pinW = i => { const [px, py] = toMap(PINS[i].x, PINS[i].z, 768, 588); return V(MAPC.x + (px / 768 - 0.5) * MW, MAPC.y + (0.5 - py / 588) * MH, MAPC.z + 0.02); };
  // ================= PO BOXES (west wall) — yours is box 12 =================
  const POB = { z0: -331, z1: -323.4, y0: 0.35, y1: 2.75 }, BOXN = 12, bc = (BOXN - 1) % 10, br = Math.floor((BOXN - 1) / 10);
  const poTex = CT(1024, 324, (g, W, H) => { const cw = W / 10, ch = H / 6; for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) { const x = c * cw, y = r * ch, n = r * 10 + c + 1; g.fillStyle = '#7a5f2a'; g.fillRect(x, y, cw, ch); g.fillStyle = n === BOXN ? '#e6c46a' : '#c9a24a'; g.fillRect(x + 3, y + 3, cw - 6, ch - 6);
    g.fillStyle = n === BOXN ? RED : INK; g.fillRect(x + 8, y + 8, 40, 22); g.fillStyle = '#ffffff'; g.font = '900 16px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(String(n), x + 12, y + 20); g.fillStyle = INK; g.beginPath(); g.arc(x + cw - 18, y + ch / 2, 5, 0, Math.PI * 2); g.fill(); } });
  plane(poTex, POB.z1 - POB.z0, POB.y1 - POB.y0, X0 + 0.07, (POB.y0 + POB.y1) / 2, (POB.z0 + POB.z1) / 2, Math.PI / 2); box(0.08, POB.y1 - POB.y0 + 0.12, POB.z1 - POB.z0 + 0.12, '#5a4520', X0 + 0.04, (POB.y0 + POB.y1) / 2, (POB.z0 + POB.z1) / 2);
  plane(label('PO BOXES', NAVY, YEL, 256, 64, 40), 1.4, 0.34, X0 + 0.08, POB.y1 + 0.32, (POB.z0 + POB.z1) / 2, Math.PI / 2);
  const cellW = (POB.z1 - POB.z0) / 10, cellH = (POB.y1 - POB.y0) / 6, myZ = POB.z1 - (bc + 0.5) * cellW, myY = POB.y1 - (br + 0.5) * cellH;
  const myDoor = new THREE.Group(); myDoor.position.set(X0 + 0.1, myY, myZ + cellW / 2 - 0.04); { const d = mm(Bx(0.03, cellH - 0.06, cellW - 0.08), LM('#e6c46a'), 0, 0, -(cellW - 0.08) / 2); myDoor.add(d); const n = plane(label(String(BOXN), RED, '#ffffff', 64, 32, 24), 0.16, 0.08, 0.02, 0.06, -cellW / 2 + 0.16, Math.PI / 2, myDoor); n.renderOrder = 1; } G.add(myDoor);
  const boxMail = mm(Bx(0.02, 0.18, 0.28), LM('#fbf8f0'), X0 + 0.09, myY - 0.05, myZ); boxMail.visible = false; G.add(boxMail);
  box(0.1, 0.02, cellW - 0.06, DARK, X0 + 0.06, myY, myZ);
  // ================= STAMP COLLECTION CASE (lobby) =================
  const stampsTex = CT(512, 192, (g, W, H) => { g.fillStyle = '#2b3a44'; g.fillRect(0, 0, W, H); const C = [RED, BLUE, GREEN, YEL, PINK, NAVY, '#a85a22', '#7c3aed']; const T = ['MERU', 'LAKE', 'CASTLE', '8', 'FOX', 'ARENA', '1901', 'PEARL'];
    for (let i = 0; i < 12; i++) { const x = 18 + (i % 6) * 82, y = 16 + Math.floor(i / 6) * 88; g.fillStyle = '#ffffff'; g.fillRect(x, y, 66, 74); g.fillStyle = C[i % 8]; g.fillRect(x + 6, y + 6, 54, 50); g.fillStyle = '#ffffff'; g.font = '900 13px Archivo, sans-serif'; g.fillText(T[(i * 3) % 8], x + 10, y + 34); g.fillStyle = INK; g.font = '900 11px Archivo, sans-serif'; g.fillText((i + 1) * 5 + 'c', x + 8, y + 69);
      g.fillStyle = '#2b3a44'; for (let k = 0; k < 7; k++) { g.beginPath(); g.arc(x + 4 + k * 10, y, 3, 0, Math.PI * 2); g.arc(x + 4 + k * 10, y + 74, 3, 0, Math.PI * 2); g.fill(); } } });
  box(2.8, 0.85, 1.0, WOOD, 57.6, 0.425, -326.9); plane(stampsTex, 2.6, 0.9, 57.6, 0.88, -326.9, 0, G, -Math.PI / 2 + 0.12); rect(56.2, 59, -327.4, -326.4);
  { const gl = mm(Bx(2.8, 0.32, 1.0), new THREE.MeshLambertMaterial({ color: 0xcfe8f0, transparent: true, opacity: 0.25, depthWrite: false }), 57.6, 1.02, -326.9); G.add(gl); }
  plane(label('MERU STAMPS · SINCE 1901', NAVY, YEL, 512, 64, 36), 2.2, 0.28, 57.6, 0.55, -326.38, 0);
  // ================= MAIL ROUTE board + POST GEAR peg (front wall, west of the door) =================
  const ROUTE_SPOT = { x: 59.6, z: -323.6, r: 0.95 }, PEG = { x: 56.4, z: -323.6, r: 0.9 };
  const routeTex = CT(512, 384, (g, W, H) => { g.fillStyle = NAVY; g.fillRect(0, 0, W, H); g.fillStyle = YEL; g.fillRect(0, 0, W, 70); g.fillStyle = INK; g.textBaseline = 'middle'; fitTxt(g, 'MAIL ROUTE', 20, 38, W - 40, 50);
    g.fillStyle = '#ffffff'; g.font = '900 30px Archivo, sans-serif'; g.fillText('5 LETTERS · 5 DOORS', 20, 120); g.fillText('IN ORDER, THEN BACK', 20, 165); g.fillStyle = YEL; g.fillText("BEAT STAMPS' CLOCK", 20, 215);
    g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.setLineDash([12, 10]); g.beginPath(); g.moveTo(40, 320); g.lineTo(150, 280); g.lineTo(260, 330); g.lineTo(370, 270); g.lineTo(470, 310); g.stroke(); g.setLineDash([]);
    [[40, 320], [150, 280], [260, 330], [370, 270], [470, 310]].forEach(([x, y], i) => { g.fillStyle = RED; g.beginPath(); g.arc(x, y, 16, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffffff'; g.font = '900 18px Archivo, sans-serif'; g.fillText(String(i + 1), x - 5, y + 1); }); });
  plane(routeTex, 1.6, 1.2, ROUTE_SPOT.x, 1.9, Z1 + 0.07, Math.PI); box(1.7, 1.3, 0.04, INK, ROUTE_SPOT.x, 1.9, Z1 + 0.03);
  for (const s of [ROUTE_SPOT, PEG]) { cyl(0.5, 0.5, 0.012, YEL, s.x, 0.075, s.z, 22); cyl(0.42, 0.42, 0.014, INK, s.x, 0.077, s.z, 22); }
  box(0.6, 0.06, 0.12, WOOD, PEG.x, 1.75, Z1 + 0.08); for (const dx of [-0.18, 0.18]) cyl(0.025, 0.025, 0.14, BRASS, PEG.x + dx, 1.72, Z1 + 0.15, 6, Math.PI / 2);
  plane(label('POST GEAR', INK, YEL, 256, 64, 40), 0.7, 0.18, PEG.x, 2.0, Z1 + 0.07, Math.PI);
  // ================= BACK ROOM: van at the roller door + parcel mountain =================
  { box(5.2, 3.6, 0.1, '#9aa1a8', 71.4, 1.8, Z0 + 0.1); for (let i = 0; i < 18; i++) box(5.2, 0.03, 0.12, '#7b8289', 71.4, 0.15 + i * 0.2, Z0 + 0.12); box(5.6, 0.25, 0.3, NAVY, 71.4, 3.75, Z0 + 0.15);
    const VX = 71.4, VZ0 = -343.3, VZ1 = -338.9, VC = (VZ0 + VZ1) / 2;
    box(2.2, 1.7, 4.4, '#f7f5f0', VX, 1.3, VC); box(2.22, 0.3, 4.42, RED, VX, 0.85, VC); box(2.1, 0.1, 4.3, '#dcdad5', VX, 2.2, VC); box(2.0, 1.45, 0.03, DARK, VX, 1.32, VZ1 + 0.01);
    for (const [x, z] of [[VX - 1.02, VZ0 + 0.8], [VX + 1.02, VZ0 + 0.8], [VX - 1.02, VZ1 - 0.8], [VX + 1.02, VZ1 - 0.8]]) cyl(0.38, 0.38, 0.26, INK, x, 0.38, z, 14, 0, Math.PI / 2);
    for (const s of [-1, 1]) box(1.0, 1.5, 0.05, '#f7f5f0', VX + s * 1.55, 1.3, VZ1 + 0.45, s * 1.35);
    const vt = label('MERU POST', RED, '#ffffff', 512, 96, 64); plane(vt, 2.6, 0.48, VX + 1.115, 1.55, VC, Math.PI / 2); plane(vt, 2.6, 0.48, VX - 1.115, 1.55, VC, -Math.PI / 2);
    for (let i = 0; i < 6; i++) box(0.5, 0.32, 0.4, KRAFT, VX - 0.6 + (i % 3) * 0.6, 1.2 + Math.floor(i / 3) * 0.34, VZ1 + 0.5 - 0.8);
    rect(70.2, 72.6, -343.5, -338.8); }
  const decor = [];
  { let k = 0; for (let lay = 0; lay < 7; lay++) { const n = 9 - lay; for (let i = 0; i < n; i++) for (let j = 0; j < Math.max(1, 6 - lay); j++) { const sz = 0.6 + ((k * 37) % 5) * 0.08, x = 53.2 + lay * 0.35 + i * 1.3 + ((k * 13) % 7) * 0.05, z = -343.1 + lay * 0.25 + j * 0.78, y = lay * 0.62 + sz * 0.4;
    if (x > 66.6 || z > -338.3) { k++; continue; } decor.push([x, y + 0.07, z, sz * 1.1, sz * 0.75, sz * 0.9, ['#b98a55', '#c99a62', '#a87a46', '#d4a96e', '#b07f4c'][k % 5], (k * 0.37) % 0.4]); k++; } } }
  rect(52.4, 67, -343.6, -338.2);
  plane(label('PARCELS · PLEASE DO NOT CLIMB', INK, YEL, 768, 64, 40), 3.2, 0.28, 60.0, 4.3, -337.62, Math.PI);
  // ================= PNEUMATIC TUBES (ceiling) + capsules =================
  const TUBES = [
    [V(54.2, 6.4, -342.5), V(54.2, 6.4, -336.9), V(55.6, 6.4, -336.9), V(55.6, 2.75, -336.9)],
    [V(58.0, 6.7, -343.2), V(58.0, 6.7, -334.0), V(55.9, 6.7, -334.0), V(55.9, 1.75, -332.3)],
    [V(53.0, 6.2, -330.0), V(75.0, 6.2, -330.0)],
    [V(66.0, 6.9, -342.8), V(66.0, 6.9, -326.6), V(73.0, 6.9, -326.6), V(73.0, 6.9, -323.0)]];
  for (const T of TUBES) { for (let i = 0; i < T.length - 1; i++) { const a = T[i], b = T[i + 1], m = a.clone().add(b).multiplyScalar(0.5), len = a.distanceTo(b), g = new THREE.CylinderGeometry(0.1, 0.1, len, 10), dy = Math.abs(b.y - a.y), dx = Math.abs(b.x - a.x);
    if (dy > 0.01 && dx < 0.01 && Math.abs(b.z - a.z) < 0.01) RT.put(g, m.x, m.y, m.z, '#cfe8f0'); else if (dy > 0.01) { const ln = Math.hypot(b.x - a.x, b.z - a.z); RT.put(g, m.x, m.y, m.z, '#cfe8f0', Math.atan2(b.x - a.x, b.z - a.z), Math.atan2(ln, b.y - a.y)); } else if (dx > 0.01) RT.put(g, m.x, m.y, m.z, '#cfe8f0', 0, 0, Math.PI / 2); else RT.put(g, m.x, m.y, m.z, '#cfe8f0', 0, Math.PI / 2, 0); }
    for (const p of T) sph(0.14, BRASS, p.x, p.y, p.z); }
  box(0.4, 0.3, 0.3, BRASS, 55.9, 1.6, -332.3); box(0.3, 0.05, 0.25, INK, 55.9, 1.45, -332.15);
  const tubeLen = T => { let s = 0; for (let i = 0; i < T.length - 1; i++) s += T[i].distanceTo(T[i + 1]); return s; };
  const tubeAt = (T, s, out) => { for (let i = 0; i < T.length - 1; i++) { const d = T[i].distanceTo(T[i + 1]); if (s <= d) return out.lerpVectors(T[i], T[i + 1], s / d); s -= d; } return out.copy(T[T.length - 1]); };
  const capM = new THREE.MeshLambertMaterial({ color: BRASS }); const CAPS = TUBES.map((T, i) => { const m = mm(Cy(0.075, 0.075, 0.22, 10), capM); G.add(m); return { T, m, s: i * 2.5, len: tubeLen(T), dir: 1, wait: 0, run: null }; });
  // ================= CLOCK TOWER: stair (east wall) + gallery over the door + clockwork + LOOK OUT =================
  const ST = { x0: 73.8, x1: 75.6, z0: -331.2, z1: -325.6, top: 4.6 }, GAL = { x0: 59.5, x1: 75.6, z0: -325.6, z1: -322.4 };
  for (let i = 0; i < 14; i++) { const h = (i + 1) * ST.top / 14, z = ST.z0 + i * 0.4 + 0.2; box(ST.x1 - ST.x0, h, 0.4, i % 2 ? WOOD : '#7d5a39', (ST.x0 + ST.x1) / 2, h / 2, z); box(ST.x1 - ST.x0, 0.03, 0.06, BRASS, (ST.x0 + ST.x1) / 2, h + 0.01, z + 0.18); }
  for (let i = 0; i <= 6; i++) { const z = ST.z0 + 0.4 + i * 0.85, h = clamp((z - ST.z0) / (ST.z1 - ST.z0), 0, 1) * ST.top; cyl(0.03, 0.03, 1.0, BRASS, ST.x0 + 0.05, h + 0.5, z, 6); }
  { const a = V(ST.x0 + 0.05, 1.3, ST.z0 + 0.4), b = V(ST.x0 + 0.05, ST.top + 1.0, ST.z1), m = a.clone().add(b).multiplyScalar(0.5), len = a.distanceTo(b); R0.put(new THREE.CylinderGeometry(0.035, 0.035, len, 6), m.x, m.y, m.z, BRASS, 0, Math.atan2(b.z - a.z, b.y - a.y)); }
  rect(ST.x0 - 0.35, ST.x0 - 0.25, ST.z0, ST.z1, 1.0);
  const GG = new THREE.Group(); GG.name = 'postGallery'; G.add(GG);
  RG.box(GAL.x1 - GAL.x0, 0.22, GAL.z1 - GAL.z0, '#7d5a39', (GAL.x0 + GAL.x1) / 2, ST.top - 0.11, (GAL.z0 + GAL.z1) / 2); RG.box(GAL.x1 - GAL.x0, 0.12, 0.08, NAVY, (GAL.x0 + GAL.x1) / 2, ST.top - 0.3, GAL.z0);
  for (let x = GAL.x0; x <= ST.x0 - 0.3; x += 0.9) RG.box(0.05, 1.0, 0.05, BRASS, x, ST.top + 0.5, GAL.z0 + 0.04); RG.box(ST.x0 - 0.3 - GAL.x0, 0.06, 0.08, BRASS, (GAL.x0 + ST.x0 - 0.3) / 2, ST.top + 1.0, GAL.z0 + 0.04);
  for (let z = GAL.z0; z <= GAL.z1; z += 0.8) RG.box(0.05, 1.0, 0.05, BRASS, GAL.x0, ST.top + 0.5, z); RG.box(0.08, 0.06, GAL.z1 - GAL.z0, BRASS, GAL.x0, ST.top + 1.0, (GAL.z0 + GAL.z1) / 2);
  rect(GAL.x0, ST.x0 - 0.4, GAL.z0 - 0.14, GAL.z0 - 0.06, 3.3); rect(GAL.x0 - 0.1, GAL.x0, GAL.z0, GAL.z1, 3.3);
  const LOOK = { x: 64, z: -323.5, r: 0.95, y: ST.top }; RG.cyl(0.5, 0.5, 0.012, YEL, LOOK.x, ST.top + 0.012, LOOK.z, 22); RG.cyl(0.42, 0.42, 0.014, INK, LOOK.x, ST.top + 0.014, LOOK.z, 22);
  RG.cyl(1.55, 1.55, 0.06, CREAM, 64, 6.35, Z1 + 0.06, 28, Math.PI / 2); RG.cyl(1.62, 1.62, 0.04, INK, 64, 6.35, Z1 + 0.04, 28, Math.PI / 2);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; RG.box(0.06, i % 3 ? 0.14 : 0.26, 0.02, INK, 64 + Math.sin(a) * 1.3, 6.35 + Math.cos(a) * 1.3, Z1 + 0.1, 0, 0, a); }
  const signG = label('THE CLOCK · LOOK OUT', NAVY, YEL, 512, 64, 36); plane2(signG, 1.6, 0.2, 64, ST.top + 1.25, GAL.z0 + 0.02, 0, GG);
  const hands = new THREE.Group(); hands.position.set(64, 6.35, Z1 + 0.12); const hH = mm(Bx(0.08, 0.75, 0.02), LM(INK), 0, 0.33, 0), mH = mm(Bx(0.05, 1.15, 0.02), LM(INK), 0, 0.53, 0); const hP = new THREE.Group(), mP = new THREE.Group(); hP.add(hH); mP.add(mH); hands.add(hP, mP, mm(Sp(0.08), LM(BRASS))); GG.add(hands);
  const gearM = new THREE.MeshLambertMaterial({ color: BRASS }), gearD = new THREE.MeshLambertMaterial({ color: '#8f7330' });
  const mkGear = (r, teeth) => { const g = new THREE.Group(); const disc = mm(Cy(r, r, 0.06, 24), gearM); disc.rotation.x = Math.PI / 2; g.add(disc); for (let i = 0; i < teeth; i++) { const a = i / teeth * Math.PI * 2, t = mm(Bx(0.09, 0.12, 0.06), gearD, Math.cos(a) * (r + 0.04), Math.sin(a) * (r + 0.04), 0); t.rotation.z = a; g.add(t); } g.add(mm(Cy(0.07, 0.07, 0.1, 8), gearD, 0, 0, 0, Math.PI / 2)); return g; };
  const GEARS = [[61.4, 6.6, 0.55, 14, 0.5], [62.35, 5.7, 0.38, 10, -0.72], [66.6, 6.5, 0.62, 16, -0.42], [65.75, 5.6, 0.32, 9, 0.8]].map(([x, y, r, n, w]) => { const g = mkGear(r, n); g.position.set(x, y, Z1 + 0.12); GG.add(g); return { g, w }; });
  const pend = new THREE.Group(); pend.position.set(64, 4.95, Z1 + 0.16); GG.add(pend);
  const lampM = new THREE.MeshBasicMaterial({ color: 0xfff1c9 }); for (const [x, z] of [[58, -328.5], [64, -328.5], [70, -328.5], [58, -334.5], [64, -334.5], [70, -340.5], [58, -340.5]]) { box(0.02, 1.0, 0.02, DARK, x, 7.1, z); G.add(mm(Cy(0.28, 0.4, 0.3, 14), lampM, x, 6.45, z)); }
  { const T = label('MERU POST OFFICE', NAVY, YEL, 768, 96, 60); plane2(T, 3.2, 0.4, 64, 3.7, -328.0, 0); for (const x of [62.6, 65.4]) box(0.02, 3.6, 0.02, DARK, x, 5.7, -328.0); }
  { const T = label('STAMPS · POSTMASTER', INK, '#ffffff', 512, 64, 36); plane(T, 1.6, 0.2, 60.4, TOP + 0.13, -331.92, 0); box(1.64, 0.24, 0.06, BRASS, 60.4, TOP + 0.13, -331.97); }
  G.add(new THREE.Mesh(R0.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  GG.add(new THREE.Mesh(RG.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  G.add(new THREE.Mesh(RT.geo(), new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.32, depthWrite: false })));
  { const M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial(), decor.length); decor.forEach((d, i) => { q.setFromEuler(new THREE.Euler(0, d[7], 0)); M4.compose(V(d[0], d[1], d[2]), q, V(d[3], d[4], d[5])); im.setMatrixAt(i, M4); im.setColorAt(i, cc.set(d[6])); }); G.add(im); }
  // pendulum (a real rod + bob)
  pend.clear(); pend.add(mm(Bx(0.04, 0.9, 0.02), LM(BRASS), 0, -0.45, 0), mm(Cy(0.16, 0.16, 0.05, 16), LM(BRASS), 0, -0.95, 0, Math.PI / 2));
  const SPOT = { start: { x: 63.0, z: -333.8, r: 1.05 }, route: ROUTE_SPOT, peg: PEG, pobox: { x: 53.7, z: myZ, r: 0.95 }, look: LOOK };
  cyl(0.5, 0.5, 0.012, YEL, SPOT.start.x, 0.075, SPOT.start.z, 22); cyl(0.42, 0.42, 0.014, INK, SPOT.start.x, 0.077, SPOT.start.z, 22);
  const boxRing = new THREE.Group(); boxRing.add(mm(Cy(0.5, 0.5, 0.012, 22), LM(YEL)), mm(Cy(0.42, 0.42, 0.014, 22), LM(INK), 0, 0.002, 0)); boxRing.position.set(SPOT.pobox.x, 0.075, SPOT.pobox.z); G.add(boxRing);
  // ================= STAMPS =================
  const ST_LOOK = { elder: 1, fur: '#a7adb3', furDark: '#70767c', muzzle: '#f6f1ea', snout: '#ece4da', chin: '#ffffff', fluff: '#ffffff' };
  const stamps = kit.makeFox({ key: 'stampsPost', torso: [NAVY, GOLD, INK], outfit: 'coat', mood: 'neutral', eyes: ['#3a2a18', '#3a2a18'], look: ST_LOOK }); stamps.scale.multiply(V(0.95, 1.0, 0.95));
  function makeCap(band = GOLD) { const g = new THREE.Group(); g.add(mm(Cy(0.27, 0.25, 0.17, 18), LM(NAVY), 0, 0.27, 0), mm(Cy(0.3, 0.3, 0.035, 18), LM(NAVY), 0, 0.37, 0), mm(Cy(0.258, 0.258, 0.05, 18), LM(band), 0, 0.22, 0), mm(Bx(0.36, 0.025, 0.2), LM(INK), 0, 0.19, 0.3, 0.25), mm(Bx(0.08, 0.08, 0.02), LM(RED), 0, 0.3, 0.27)); return g; }
  { const P = stamps.userData && stamps.userData.P; if (P && P.head) { const c = makeCap(); P.head.add(c); const gm = LM(DARK); for (const s of [-1, 1]) { const r = mm(new THREE.TorusGeometry(0.07, 0.01, 6, 18), gm, s * 0.12, 0.05, 0.36); P.head.add(r); } P.head.children.forEach(o => o.traverse(q => { q.renderOrder = 2; })); }
    if (P && P.arms && P.arms[1]) { const w = new THREE.Group(); w.add(mm(Cy(0.07, 0.07, 0.025, 16), LM(GOLD), 0, 0, 0, Math.PI / 2), mm(Cy(0.055, 0.055, 0.028, 16), LM('#fbf8f0'), 0, 0, 0.002, Math.PI / 2)); w.position.set(0, -0.44, 0.08); w.traverse(o => { o.renderOrder = 2; }); P.arms[1].add(w); } if (P && P.sword) P.sword.visible = false; }
  G.add(stamps); const stCol = { c: [0, 0, 0.45] }; cols.push(stCol);
  const SS = { idle: [60.4, -333.6, 0], catch: [67.0, -336.0, 2.14], sort: [58.6, -335.9, -1.8], stamp: [69.4, -334.3, -Math.PI * 0.6], counter: [62.4, -333.3, 0], lost: [60.0, -336.4, Math.PI] };
  const placeS = k => { const s = SS[k]; stamps.position.set(s[0], 0, s[1]); stamps.userData.face0 = s[2]; stamps.rotation.y = s[2]; stCol.c[0] = s[0]; stCol.c[1] = s[1]; }; placeS('idle');
  const stT = { key: 'stampsPost', obj: stamps, ry: 0, r: 3.0 }, endT = { key: 'postEnd', obj: stamps, ry: 0, r: 9 };
  const ln = text => ({ who: 'stamps', role: 'STAMPS · POSTMASTER', text });
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'post', color: NAVY, boardTitle: "Stamps' best",
    room: { X0, X1, Z0, Z1 }, door: [64, -322.6], keeper: stamps, keeperRy: 0,
    games: [{ k: 'shift', name: 'Shift', color: NAVY }, { k: 'route', name: 'Mail route', color: RED }], board: { x: 70.2, y: 2.5, z: Z1 - 0.09, ry: Math.PI, w: 1.3 },
    hiring: { x: 66.8, z: -323.0, ry: Math.PI }, hiringLine: '7 JOBS · ONE SHIFT', sun: [{ x: 64, z: -324.0, w: 2.4, d: 2.8 }],
    lamps: [[58, 6.2, -328.5], [64, 6.2, -328.5], [70, 6.2, -328.5], [58, 6.2, -334.5], [64, 6.2, -334.5], [70, 6.2, -340.5], [58, 6.2, -340.5]],
    browse: [[57.6, -325.8, Math.PI], [53.7, -325.2, -Math.PI / 2], [59.6, -324.6, 0], [67.8, -326.0, Math.PI], [61.6, -330.9, Math.PI]] });
  const CUST = [
    { name: 'KIA', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], gift: 'a scarf for my sister at Lakeside', sig: 2.2 },
    { name: 'OTTO', torso: ['#2f5d2a', '#e6b45a', '#1a3318'], gift: 'a jar of honey for my aunt', sig: 3.1 },
    { name: 'MARLA', torso: ['#f472b6', '#fce7f3', '#9d174d'], gift: 'lemonade recipes for the Arena stall', sig: 1.7 },
    { name: 'PELL', torso: ['#1f2937', '#e6b45a', '#111827'], gift: 'a birthday cake tin. Empty. It is a long story.', sig: 2.6 },
    { name: 'FLICK', torso: ['#ffd23a', '#201e1d', '#a16207'], gift: 'stickers. Lots of stickers.', sig: 3.6 },
    { name: 'THE FISHERMAN', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'], gift: 'a lucky float for my cousin', sig: 1.9 },
    { name: 'MICHAEL JAY', torso: ['#7c3aed', '#ede9fe', '#4c1d95'], gift: 'a mixtape. Hand-labelled.', sig: 2.9 }];
  const custCache = {}; const custFox = i => { if (custCache[i]) return custCache[i]; const C = CUST[i], f = kit.makeFox({ key: 'postCust' + i, torso: C.torso, outfit: 'vest', mood: 'happy' }); f.visible = false; G.add(f); custCache[i] = f; return f; };
  const turnTo = (o, a, dt) => { o.rotation.y += Math.atan2(Math.sin(a - o.rotation.y), Math.cos(a - o.rotation.y)) * Math.min(1, dt * 6); };
  // ---------- state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, R = null, lastP = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0, f2) => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len); gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.9); tone(2093, 0.04, 0.9); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), thump = () => { tone(110, 0.09, 0.18, 'square'); tone(70, 0.06, 0.25, 'sine'); }, whoosh = () => tone(900, 0.04, 0.5, 'sawtooth', 0, 200), bump = () => tone(150, 0.06, 0.15, 'triangle');
  // ---------- prizes + what you wear ----------
  const own = () => ({ cap: !!save.stat('poCap', false), book: save.count('stampBook') > 0 });
  const wearNow = () => { const o = own(), w = save.stat('poWear', null) || {}; return { cap: o.cap && w.cap !== false, bag: (o.cap && w.bag !== false) || !!R }; };
  const setWear = (k, v) => { const w = { ...(save.stat('poWear', null) || {}) }; w[k] = v; save.setStat('poWear', w); };
  const boxState = () => save.stat('poBox', null) || { open: false, mail: 0 };
  const setBox = b => save.setStat('poBox', b);
  function giveGift() { save.setStat('poClears', save.stat('poClears', 0) + 1); const o = own();
    if (!boxState().open) setBox({ open: true, mail: 1 });
    if (!o.cap) { save.setStat('poCap', true); setWear('cap', true); setWear('bag', true); return { kind: 'cap', label: 'POSTAL CAP + SATCHEL' }; }
    if (!o.book) { save.give('stampBook'); const S = new Set(save.stat('stamps', null) || []); S.add('meru'); save.setStat('stamps', [...S]); return { kind: 'book', label: 'STAMP BOOK + THE MERU STAMP' }; }
    save.addGold(20); return { kind: 'gold', label: 'BONUS +20 GOLD' }; }
  function makeBag() { const g = new THREE.Group(); g.add(mm(Bx(0.13, 0.32, 0.4), LM('#7a4a26'), 0.38, 0.78, 0.04), mm(Bx(0.135, 0.12, 0.41), LM(RED), 0.38, 0.9, 0.04), mm(Bx(0.02, 0.06, 0.12), LM(GOLD), 0.45, 0.86, 0.04));
    const s1 = mm(Bx(0.05, 0.95, 0.02), LM('#5a361b'), 0.0, 1.05, 0.37); s1.rotation.z = 0.68; const s2 = s1.clone(); s2.position.z = -0.22; g.add(s1, s2); return g; }
  let worn = null;
  function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P) return; const w = wearNow(), key = (w.cap ? 1 : 0) + '|' + (w.bag ? 1 : 0);
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (!(worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox))) { if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: [] }; const P = U.P;
      if (w.cap && P.head) { const c = makeCap(RED); P.head.add(c); worn.parts.push(c); }
      if (w.bag && P.body) { const b = makeBag(); P.body.add(b); worn.parts.push(b); }
      worn.parts.forEach(p => p.traverse(o => { o.renderOrder = 2; })); } }
  const pegCap = makeCap(RED); pegCap.position.set(PEG.x - 0.18, 1.48, Z1 + 0.25); G.add(pegCap); const pegBag = makeBag(); pegBag.position.set(PEG.x - 0.25, 0.75, Z1 + 0.18); pegBag.rotation.y = Math.PI / 2; G.add(pegBag);
  // ---------- card (Modernist) — LEFT, same spot as the other shops ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head2 = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const foot = (next, stop = true) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span>' + (stop ? '<span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span>' : '') + '</div>';
  const bar = (k, c = '#ffd23a') => '<div style="height:12px;border:2px solid #201e1d;margin:4px 0;background:#fff;position:relative"><div style="position:absolute;left:0;top:0;bottom:0;width:' + Math.round(clamp(k, 0, 1) * 100) + '%;background:' + c + '"></div></div>';
  const big = (txt, bg, fg = '#fff') => '<div style="background:' + bg + ';color:' + fg + ';font-weight:900;font-size:20px;padding:8px 10px;margin:2px 0 6px;border:2px solid #201e1d">' + txt + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null, lx: 0, ly: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label],[data-post-book]')) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (!busy || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = ptr.lx = e.clientX; ptr.y = ptr.ly = e.clientY; e.stopPropagation(); if (busy === 'job') press(); }, true);
  addEventListener('pointermove', e => { if (!busy || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); if (busy === 'job') drag(); else if (busy === 'look') { LK.yaw -= (ptr.x - ptr.lx) * 0.005; LK.pitch = clamp(LK.pitch + (ptr.y - ptr.ly) * 0.004, -0.9, 0.5); } ptr.lx = ptr.x; ptr.ly = ptr.y; }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; if (busy === 'job') release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearestOf = (list, posOf, k = 1.6) => { let best = null, bd = RAD() * k; for (const o of list) { const d = dist(scrW(posOf(o))); if (d < bd) { bd = d; best = o; } } return best; };
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of J.flies.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(F), 1); F.then && F.then(); } } }
  const dotM = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true }), dotN = new THREE.MeshBasicMaterial({ color: 0xec3013, depthTest: false }), DOTS = []; for (let i = 0; i < 16; i++) { const d = mm(Sp(0.018, 8, 6), dotM); d.renderOrder = 5; d.visible = false; G.add(d); DOTS.push(d); }
  const hideDots = () => DOTS.forEach(d => { d.visible = false; });
  // path tracer: drag through the dots in order (wrap + sign)
  function setPath(pts, onStep, onDone, size = 1) { if (touch) size *= 1.4; J.path = { pts, i: 0, onStep, onDone, off: 0, offT: 0, size }; DOTS.forEach((d, i) => { d.visible = i < pts.length; if (i < pts.length) { d.position.copy(pts[i]); d.scale.setScalar(size); d.material = dotM; } }); }
  function pathDrag() { const Pp = J.path; if (!Pp || Pp.i >= Pp.pts.length) return; const s = scrW(Pp.pts[Pp.i]); if (dist(s) < RAD() * 1.15) { DOTS[Pp.i].visible = false; Pp.i++; tone(800 + Pp.i * 40, 0.03, 0.08, 'triangle'); Pp.onStep && Pp.onStep(Pp.i); if (Pp.i >= Pp.pts.length) { const d = Pp.onDone; J.path = null; hideDots(); d && d(); } return; }
    if (Pp.i > 0) { const a = scrW(Pp.pts[Pp.i - 1]), ax = s[0] - a[0], ay = s[1] - a[1], L2 = ax * ax + ay * ay || 1, t = clamp(((ptr.x - a[0]) * ax + (ptr.y - a[1]) * ay) / L2, 0, 1), dd = Math.hypot(a[0] + ax * t - ptr.x, a[1] + ay * t - ptr.y); if (dd > RAD() * 2.6 && J.t > Pp.offT) { Pp.off++; J.offAll = (J.offAll || 0) + 1; Pp.offT = J.t + 0.5; toast('WOBBLY · BACK ON THE DOTS', 0.9); } } }
  // ================= SHIFT PROPS =================
  function makeParcel(s = 1) { const g = new THREE.Group(); g.add(mm(Bx(0.46 * s, 0.3 * s, 0.36 * s), LM(KRAFT)), mm(Bx(0.47 * s, 0.006, 0.07 * s), LM('#d9c7a0'), 0, 0.152 * s, 0), mm(Bx(0.16 * s, 0.004, 0.1 * s), LM('#ffffff'), 0.1 * s, 0.155 * s, 0.08 * s)); return g; }
  const PARC = []; for (let i = 0; i < 8; i++) { const p = makeParcel(0.9 + (i % 3) * 0.08); p.visible = false; G.add(p); PARC.push(p); }
  const cart = new THREE.Group(); { cart.add(mm(Bx(1.3, 0.08, 0.9), LM(STEEL), 0, 0.3, 0)); for (const [x, z] of [[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]]) cart.add(mm(Cy(0.08, 0.08, 0.05, 10), LM(INK), x, 0.1, z, 0, 0, Math.PI / 2), mm(Bx(0.03, 0.2, 0.03), LM(STEEL), x, 0.2, z));
    for (const s of [-1, 1]) { cart.add(mm(Bx(1.3, 0.04, 0.03), LM(STEEL), 0, 0.95, s * 0.44), mm(Bx(0.03, 0.04, 0.9), LM(STEEL), s * 0.64, 0.95, 0)); for (let i = 0; i < 6; i++) cart.add(mm(Bx(0.02, 0.62, 0.02), LM(STEEL), -0.62 + i * 0.25, 0.63, s * 0.44)); }
    cart.add(mm(Bx(1.0, 0.05, 0.05), LM(RED), 0, 1.15, 0.5)); } cart.position.set(71.2, 0, -336.9); G.add(cart);
  const LANES = [69.5, 71.3, 73.1], LZ = -336.9;
  const shadow = mm(new THREE.RingGeometry(0.3, 0.42, 24), new THREE.MeshBasicMaterial({ color: 0xffd23a, side: THREE.DoubleSide, depthWrite: false }), 0, 0.09, LZ, -Math.PI / 2); shadow.visible = false; G.add(shadow);
  const sack = new THREE.Group(); sack.add(mm(Cy(0.36, 0.42, 0.8, 12), LM('#7a6a4a'), 0, 0.4, 0), mm(Cy(0.2, 0.36, 0.12, 12), LM('#6a5a3a'), 0, 0.86, 0)); sack.position.set(65.0, 0, -333.7); G.add(sack); { const t = plane(label('OUT', NAVY, '#ffffff', 128, 64, 36), 0.4, 0.2, 0, 0.5, 0.43, 0, sack); }
  const trolley = new THREE.Group(); trolley.add(mm(Bx(0.9, 0.06, 0.6), LM(STEEL), 0, 0.25, 0)); for (const x of [-0.4, 0.4]) trolley.add(mm(Bx(0.03, 1.0, 0.03), LM(STEEL), x, 0.6, -0.28)); trolley.position.set(70.0, 0, -333.6); G.add(trolley);
  const envTex = DIST.map(d => CT(256, 176, (g, W, H) => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, W, H); g.fillStyle = d.c; g.fillRect(0, 0, 36, H); g.fillStyle = INK; g.textBaseline = 'middle'; fitTxt(g, d.n, 50, 70, 190, 34); g.fillStyle = '#9a948c'; for (let i = 0; i < 3; i++) g.fillRect(50, 104 + i * 18, 150 - i * 30, 6); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(2, 2, W - 4, H - 4); }));
  const letter = mm(new THREE.PlaneGeometry(0.5, 0.34), new THREE.MeshBasicMaterial({ map: envTex[0], side: THREE.DoubleSide })); letter.visible = false; G.add(letter);
  const stTex = CT(256, 170, (g, W, H) => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, W, H); g.fillStyle = RED; g.fillRect(W - 60, 10, 48, 56); g.fillStyle = '#ffffff'; g.fillRect(W - 54, 16, 36, 30); g.fillStyle = '#9a948c'; for (let i = 0; i < 3; i++) g.fillRect(30, 90 + i * 20, 160 - i * 30, 7); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(2, 2, W - 4, H - 4); });
  const pmTex = CT(128, 128, (g, W, H) => { g.clearRect(0, 0, W, H); g.strokeStyle = '#1f2a6b'; g.lineWidth = 7; g.beginPath(); g.arc(46, 64, 36, 0, Math.PI * 2); g.stroke(); g.font = '900 18px Archivo, sans-serif'; g.fillStyle = '#1f2a6b'; g.fillText('MERU', 24, 70); g.lineWidth = 5; for (let i = 0; i < 3; i++) { g.beginPath(); for (let x = 84; x < 128; x += 4) g.lineTo(x, 46 + i * 18 + Math.sin(x * 0.3) * 5); g.stroke(); } });
  const ENVS = []; for (let i = 0; i < 8; i++) { const g = new THREE.Group(); const b = mm(new THREE.PlaneGeometry(0.52, 0.35), new THREE.MeshBasicMaterial({ map: stTex }), 0, 0, 0, -Math.PI / 2); const pm = mm(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: pmTex, transparent: true, depthWrite: false }), 0.1, 0.004, -0.04, -Math.PI / 2); pm.visible = false; g.add(b, pm); g.visible = false; G.add(g); ENVS.push({ g, pm }); }
  const gift = new THREE.Group(); const giftBox = mm(Bx(0.5, 0.32, 0.4), LM(PINK), 0, 0.16, 0); gift.add(giftBox); const tape = mm(Bx(1, 0.006, 0.07), LM('#e9dcc0'), 0, 0.325, 0); const str1 = mm(Bx(0.014, 0.008, 1), LM('#f3f2f2'), 0, 0.33, 0), str2 = mm(Bx(1, 0.008, 0.014), LM('#f3f2f2'), 0, 0.332, 0);
  const bow = new THREE.Group(); for (const s of [-1, 1]) { const t = mm(new THREE.TorusGeometry(0.05, 0.016, 6, 14), LM(RED), s * 0.05, 0.36, 0, 0, 0, s * 0.5); bow.add(t); } bow.add(mm(Sp(0.025), LM(RED), 0, 0.34, 0)); const addrL = plane(label('TO: LAKESIDE', '#ffffff', INK, 256, 96, 34), 0.2, 0.08, -0.12, 0.326, 0.1, Math.PI, gift, -Math.PI / 2);
  gift.add(tape, str1, str2, bow); gift.visible = false; G.add(gift); const GIFT0 = V(66.4, TOP, -332.0);
  const SCALE = V(68.3, TOP, -331.95); box(0.5, 0.12, 0.45, '#9aa1a8', SCALE.x, TOP + 0.06, SCALE.z); box(0.46, 0.03, 0.42, STEEL, SCALE.x, TOP + 0.135, SCALE.z); box(0.36, 0.42, 0.12, '#9aa1a8', 68.8, TOP + 0.21, -332.15);
  let dialA = 0; const dialTex = CT(192, 192, (g, W, H) => { g.fillStyle = '#9aa1a8'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(96, 104, 82, 0, Math.PI * 2); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); g.fillStyle = INK; g.font = '900 18px Archivo, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center';
    for (let k = 0; k <= 8; k++) { const a = -Math.PI * 0.75 + k / 8 * Math.PI * 1.5; g.fillRect(96 + Math.sin(a) * 66 - 2, 104 - Math.cos(a) * 66 - 2, 4, 4); g.fillText(String(k), 96 + Math.sin(a) * 52, 104 - Math.cos(a) * 52); } g.fillText('KG', 96, 140);
    const a = -Math.PI * 0.75 + clamp(dialA, 0, 8.4) / 8 * Math.PI * 1.5; g.strokeStyle = RED; g.lineWidth = 5; g.beginPath(); g.moveTo(96, 104); g.lineTo(96 + Math.sin(a) * 70, 104 - Math.cos(a) * 70); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(96, 104, 7, 0, Math.PI * 2); g.fill(); g.textAlign = 'left'; });
  plane(dialTex, 0.34, 0.34, 68.8, TOP + 0.24, -332.22, Math.PI);
  const PRICES = [{ v: 2, max: 1, c: '#f7f5f0' }, { v: 4, max: 3, c: YEL }, { v: 6, max: 5, c: '#9cc7e0' }, { v: 9, max: 99, c: PINK }];
  const TILES = PRICES.map((p, i) => { const x = 70.6 - i * 0.45, g = new THREE.Group(); g.position.set(x, TOP, -332.0); g.add(mm(Bx(0.38, 0.03, 0.3), LM(p.c), 0, 0.015, 0)); plane(label(p.v + ' G', p.c, INK, 128, 96, 60), 0.32, 0.24, 0, 0.032, 0, Math.PI, g, -Math.PI / 2); G.add(g); return { ...p, g, p: V(x, TOP + 0.03, -332.0) }; });
  const flyStamp = mm(Bx(0.1, 0.01, 0.12), LM(RED)); flyStamp.visible = false; G.add(flyStamp);
  const PAD = { x: 64.6, z: -332.0, w: 0.62, h: 0.4 };
  let padInk = [], padPts = [], padName = '';
  const padTex = CT(512, 330, (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = NAVY; g.fillRect(0, 0, W, 44); g.fillStyle = '#ffffff'; g.font = '900 24px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('REGISTERED MAIL · SIGN HERE', 14, 23);
    g.strokeStyle = '#c9c3b8'; g.lineWidth = 3; g.beginPath(); g.moveTo(30, 262); g.lineTo(W - 30, 262); g.stroke(); g.fillStyle = INK; g.font = '900 22px Archivo, sans-serif'; g.fillText('X  ' + padName, 30, 296);
    g.strokeStyle = 'rgba(32,30,29,0.18)'; g.lineWidth = 3; g.setLineDash([6, 8]); g.beginPath(); padPts.forEach(([u, v], i) => i ? g.lineTo(u * W, v * H) : g.moveTo(u * W, v * H)); g.stroke(); g.setLineDash([]);
    g.strokeStyle = '#1f2a6b'; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); padInk.forEach(([u, v], i) => i ? g.lineTo(u * W, v * H) : g.moveTo(u * W, v * H)); g.stroke(); });
  const pad = plane(padTex, PAD.w, PAD.h, PAD.x, TOP + 0.012, PAD.z, Math.PI, G, -Math.PI / 2); pad.visible = false;
  const padW = (u, v) => V(PAD.x - (u - 0.5) * PAD.w, TOP + 0.02, PAD.z + (0.5 - v) * PAD.h);
  const heldLetter = mm(new THREE.PlaneGeometry(0.34, 0.24), new THREE.MeshBasicMaterial({ map: stTex, side: THREE.DoubleSide })); heldLetter.visible = false; G.add(heldLetter);
  // ================= THE SHIFT =================
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  const STEP_N = ['CATCH', 'SORT', 'STAMP', 'WRAP', 'WEIGH', 'SIGN', 'LOST'];
  function startShift() { const n = save.stat('poVisits', 0); save.setStat('poVisits', n + 1);
    J = { step: 1, sub: 'intro', gold: 0, pause: 0, t: 0, flies: [], clean: 0, ci: n % CUST.length, n: 0, got: 0, drop: 0, lane: 1, fl: [], spawnT: 1.4, cartX: LANES[1] };
    PARC.forEach(p => { p.visible = false; if (p.parent !== G) G.add(p); }); cart.position.set(LANES[1], 0, LZ); placeS('catch'); busy = 'job'; pop();
    sayTo(stT, [ln('Seven fifty-nine. Early is the only kind of on time. Tap left, middle or right to catch.')], null, true);
    J.step = 1; NEXT('intro', () => { J.sub = 'catch'; toast('STEP 1 OF 7 · CATCH THE PARCELS', 2); }, 2.4); }
  // ---- 1 CATCH ----
  function catchTick(dt) { cart.position.x += (LANES[J.lane] - cart.position.x) * Math.min(1, dt * 14);
    if (J.n < 8) { J.spawnT -= dt; if (J.spawnT <= 0) { const lane = J.n === 0 ? 1 : (J.lastLane + 1 + Math.floor(Math.random() * 2)) % 3; J.lastLane = lane; const p = PARC[J.n]; p.visible = true; p.position.set(71.4 + rnd(-0.3, 0.3), 1.25, -339.0); p.rotation.set(0, rnd(-0.4, 0.4), 0); J.fl.push({ p, lane, t: 0, dur: 1.15 - J.n * 0.03 }); J.n++; J.spawnT = 1.55 - J.n * 0.05; bump(); } }
    for (const F of J.fl.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), tx = LANES[F.lane]; F.p.position.set(71.4 + (tx - 71.4) * k, 1.25 + (0.62 - 1.25) * k + Math.sin(k * Math.PI) * 1.1, -339.0 + (LZ + 339.0) * k); F.p.rotation.x += dt * 3;
      if (k >= 1) { J.fl.splice(J.fl.indexOf(F), 1); if (Math.abs(cart.position.x - tx) < 0.5) { const s = J.got++; cart.add(F.p); F.p.position.set(-0.3 + (s % 2) * 0.6, 0.5 + Math.floor(s / 4) * 0.32, (Math.floor(s / 2) % 2 ? 0.2 : -0.2)); F.p.rotation.set(0, 0, 0); addGold(3); pop(); }
        else { J.drop++; F.p.position.set(tx + rnd(-0.3, 0.3), 0.2, LZ + rnd(-0.2, 0.3)); F.p.rotation.set(0, rnd(0, 3), 0.3); thump(); toast(J.drop === 1 ? 'STAMPS: "THE FLOOR, ' + "BEN. THE FLOOR." + '"' : 'BUMP · ' + J.drop + ' DROPPED', 1.1); } } }
    const next = J.fl[0]; shadow.visible = !!next; if (next) { shadow.position.x = LANES[next.lane]; shadow.material.color.set(Math.abs(cart.position.x - LANES[next.lane]) < 0.5 ? 0x3fd36a : 0xffd23a); }
    if (J.n >= 8 && !J.fl.length) { shadow.visible = false; if (!J.drop) J.clean++; J.sub = 'catchDone'; sayTo(stT, [ln(J.drop ? J.got + ' of 8. I will pick up the rest. Now the letters, from the tube.' : 'Eight of eight. Intact. Lovely. Now the letters, from the tube.')]);
      NEXT('catchDone', beginSort, 1.8); } }
  function catchPress() { let b = 0, bd = 1e9; LANES.forEach((x, i) => { const d = Math.abs(scrW(V(x, 0.6, LZ))[0] - ptr.x); if (d < bd) { bd = d; b = i; } }); J.lane = b; tone(500 + b * 120, 0.03, 0.06, 'square'); }
  // ---- 2 SORT ----
  function beginSort() { PARC.forEach(p => { p.visible = false; }); J.step = 2; J.sub = 'sort'; J.li = 0; J.wrong = 0; J.ok = 0; J.ready = false; J.order = [0, 1, 2, 3, 0, 1, 2, 3].sort(() => Math.random() - 0.5); placeS('sort'); toast('STEP 2 OF 7 · SORT THE LETTERS', 2); spawnLetter(); }
  function spawnLetter() { const d = J.order[J.li]; letter.material.map = envTex[d]; letter.material.needsUpdate = true; J.ready = false; const C = CAPS[0]; C.s = 0; C.dir = 1; C.wait = 0; C.run = () => { whoosh(); letter.visible = true; letter.position.set(55.6, 2.6, -336.95); letter.rotation.set(-0.5, 0, 0); fly(letter, V(55.6, 1.3, -336.6), 0.35, 0, () => { J.ready = true; }); }; }
  function sortPress() { if (!J.ready) return; const s = nearestOf(SLOTS, q => q.p, 2.6); if (!s) return; const d = J.order[J.li], ok = s.i === d; J.ready = false;
    if (ok) { J.ok++; addGold(3); ding(); } else { J.wrong++; nope(); toast('STAMPS: "THAT IS ' + SLOTS[d].n + '. COLOUR AND NAME MATCH."', 1.8); }
    fly(letter, SLOTS[d].p.clone().add(V(0, 0, 0.05)), 0.35, 0.15, () => { letter.visible = false; J.li++; if (J.li < 8) spawnLetter(); else { if (!J.wrong) J.clean++; sayTo(stT, [ln((J.wrong ? 'Sorted. Mostly. I fixed ' + J.wrong + '.' : 'Every letter in its hole.') + ' Now the sorter. Tap when the ring goes green.')]); NEXT('sortDone', beginStamp, 1.6); } }); }
  // ---- 3 STAMP ----
  function beginStamp() { J.step = 3; J.sub = 'stamp'; J.sc = 0; J.sm = 0; J.sx = 0; J.hd = 0; placeS('stamp'); ENVS.forEach((E, i) => { E.x = 67.4 + i * 1.45; E.res = null; E.pm.visible = false; E.g.visible = false; E.g.position.set(E.x, BY + 0.005, BZ); }); sRing.visible = true; toast('STEP 3 OF 7 · STAMP · TAP WHEN THE RING IS GREEN', 2.2); }
  function stampTick(dt) { let near = 1e9, all = true; for (const E of ENVS) { if (E.x == null) continue; E.x -= dt * 0.72; E.g.position.x = E.x; E.g.visible = E.x < 67.1 && E.x > 58.9; if (E.x > 58.9) all = false; const dx = E.x - HX; if (!E.res && Math.abs(dx) < Math.abs(near)) near = dx; if (!E.res && E.x < HX - 0.45) { E.res = 'missed'; J.sx++; E.pm.visible = true; E.pm.material.opacity = 0.35; } }
    const g = Math.abs(near) < 0.13; sRing.material.color.set(g ? 0x3fd36a : 0xffffff); sRing.scale.setScalar(1 + Math.min(1.5, Math.abs(near) * 2.5));
    if (J.hd > 0) { J.hd = Math.max(0, J.hd - dt); head.position.y = 1.6 - Math.sin(J.hd / 0.22 * Math.PI) * 0.6; }
    if (all) { sRing.visible = false; if (J.sc >= 7) J.clean++; J.sub = 'stampDone'; sayTo(stT, [ln(J.sc + ' clean' + (J.sm ? ', ' + J.sm + ' smudged' : '') + '. ' + (J.sc >= 7 ? 'Crisp.' : 'Acceptable. Just.') + ' A customer. Counter, please. Smile. Not too much.')]); NEXT('stampDone', beginWrap, 1.6); } }
  function stampPress() { if (J.hd > 0) return; J.hd = 0.22; thump(); let best = null, bd = 1e9; for (const E of ENVS) { if (E.res || E.x == null) continue; const d = Math.abs(E.x - HX); if (d < bd) { bd = d; best = E; } }
    if (!best || bd > 0.32) return; best.res = bd < 0.13 ? 'clean' : 'smudge'; best.pm.visible = true; best.pm.material.opacity = best.res === 'clean' ? 1 : 0.45; best.pm.position.x = best.res === 'clean' ? 0.1 : 0.14; if (best.res === 'clean') { J.sc++; addGold(3); ding(); } else { J.sm++; addGold(1); toast('SMUDGED · WAIT FOR GREEN', 0.9); } }
  // ---- 4 WRAP (a customer walks in) ----
  function custWalk(f, path, then) { J.cw = { f, path, i: 0, then }; }
  function custTick(dt) { const W = J.cw; if (!W) return; const p = W.path[W.i], f = W.f, dx = p[0] - f.position.x, dz = p[1] - f.position.z, d = Math.hypot(dx, dz);
    if (d < 0.08) { W.i++; if (W.i >= W.path.length) { J.cw = null; kit.animFox && kit.animFox(f, dt, 0); W.then && W.then(); return; } } else { const s = Math.min(d, dt * 2.4); f.position.x += dx / d * s; f.position.z += dz / d * s; turnTo(f, Math.atan2(dx, dz), dt); } kit.animFox && kit.animFox(f, dt, 2.4); }
  function beginWrap() { J.step = 4; J.sub = 'custIn'; placeS('counter'); const f = custFox(J.ci); J.cf = f; f.visible = true; f.position.set(64, 0, -323.4); f.rotation.y = Math.PI; J.offAll = 0;
    custWalk(f, [[67.8, -325.4], [67.8, -330.75]], () => { f.rotation.y = Math.PI; gift.visible = true; gift.position.copy(GIFT0); giftBox.material = LM(PINK); tape.visible = str1.visible = str2.visible = bow.visible = addrL.visible = false; J.sub = 'wrapPaper';
      const C = CUST[J.ci]; sayTo({ key: 'postCust', obj: f, ry: Math.PI, r: 9 }, [{ who: C.name, role: 'CUSTOMER', text: 'Morning, Stamps. I have ' + C.gift + '. Can you wrap it?' }]); toast('STEP 4 OF 7 · WRAP · TAP THE BOX', 2); }); }
  const gP = (x, z) => V(GIFT0.x + x, GIFT0.y + 0.34, GIFT0.z + z);
  function wrapPress() { if (J.sub === 'wrapPaper') { giftBox.material = LM(KRAFT); addrL.visible = true; tone(300, 0.05, 0.25, 'sawtooth', 0, 600); J.sub = 'wrapTape'; const pts = [0, 1, 2, 3, 4, 5].map(i => gP(0.22 - i * 0.088, 0)); tape.visible = true; tape.scale.x = 0.001;
      setPath(pts, i => { tape.scale.x = Math.max(0.001, (i - 1) / 5 * 0.48); tape.position.x = 0.24 - tape.scale.x / 2; }, () => { J.sub = 'wrapStr1'; str1.visible = true; str1.scale.z = 0.001; const p2 = [0, 1, 2, 3, 4].map(i => gP(0, 0.18 - i * 0.09));
        setPath(p2, i => { str1.scale.z = Math.max(0.001, (i - 1) / 4 * 0.4); str1.position.z = 0.2 - str1.scale.z / 2; }, () => { J.sub = 'wrapStr2'; str2.visible = true; str2.scale.x = 0.001; const p3 = [0, 1, 2, 3, 4].map(i => gP(0.23 - i * 0.115, 0.02));
          setPath(p3, i => { str2.scale.x = Math.max(0.001, (i - 1) / 4 * 0.5); str2.position.x = 0.25 - str2.scale.x / 2; }, () => { J.sub = 'wrapBow'; toast('TAP FOR THE BOW', 1.4); }); }); }); return; }
    if (J.sub === 'wrapBow') { bow.visible = true; ding(); J.wob = J.offAll || 0; addGold(Math.max(4, 12 - J.wob * 2)); if (!J.wob) J.clean++; J.sub = 'wrapDone'; sayTo(stT, [ln((J.wob ? 'A little wobbly. It is the thought that counts.' : 'Square corners. Tight string. Beautiful.') + ' Onto the scale, then the right stamp.')]); NEXT('wrapDone', beginWeigh, 1.4); } }
  // ---- 5 WEIGH + PRICE ----
  function beginWeigh() { J.step = 5; J.wi = 0; J.wwrong = 0; const bands = [0.6 + Math.random() * 0.35, 1.3 + Math.random() * 1.5, 3.3 + Math.random() * 1.5, 5.4 + Math.random() * 2.2].sort(() => Math.random() - 0.5); J.wts = bands.slice(0, 3).map(w => Math.round(w * 10) / 10); toast('STEP 5 OF 7 · WEIGH + PRICE', 2); nextWeigh(); }
  function nextWeigh() { J.sub = 'weighOn'; J.wset = false; dialA = 0; redraw(dialTex, dialTex.userData.fn); const obj = J.wi === 0 ? gift : PARC[J.wi]; if (J.wi > 0) { obj.visible = true; if (obj.parent !== G) G.add(obj); obj.position.set(70.0, 0.4, -333.6); obj.rotation.set(0, 0, 0); } J.wobj = obj;
    fly(obj, V(SCALE.x, TOP + 0.15 + (J.wi === 0 ? 0 : 0.15), SCALE.z), 0.6, 0.35, () => { J.sub = 'weigh'; J.wt0 = J.t; tone(400, 0.04, 0.2, 'triangle'); }); }
  function weighTick() { if (J.sub !== 'weigh' && J.sub !== 'price') return; const t = J.t - J.wt0, w = J.wts[J.wi]; dialA = t > 1.6 ? w : w * (1 - Math.exp(-3 * t) * Math.cos(9 * t)); redraw(dialTex, dialTex.userData.fn); if (J.sub === 'weigh' && t > 1.6) { J.sub = 'price'; J.wset = true; } }
  function pricePress() { if (J.sub !== 'price') return; const tl = nearestOf(TILES, q => q.p, 1.4); if (!tl) return; const w = J.wts[J.wi], right = PRICES.find(p => w <= p.max), ok = tl.v === right.v;
    if (ok) { addGold(5); ding(); } else { J.wwrong++; nope(); toast('STAMPS: "' + w.toFixed(1) + ' KG IS ' + right.v + ' G. UP TO ' + (right.max < 99 ? right.max + ' KG' : 'ANY') + '."', 2.2); }
    J.sub = 'priced'; flyStamp.visible = true; flyStamp.material = LM(right.c); flyStamp.position.copy(TILES[PRICES.indexOf(right)].p); fly(flyStamp, J.wobj.position.clone().add(V(0.08, J.wi === 0 ? 0.34 : 0.16, 0.06)), 0.4, 0.2, () => { flyStamp.visible = false; thump();
      fly(J.wobj, V(sack.position.x, 0.95, sack.position.z), 0.6, 0.4, () => { J.wobj.visible = false; dialA = 0; redraw(dialTex, dialTex.userData.fn); J.wi++; if (J.wi < 3) nextWeigh(); else { if (!J.wwrong) J.clean++; sayTo(stT, [ln((J.wwrong ? 'Mostly right. The price list is on the card.' : 'Three for three. A postal brain.') + ' Registered mail next. Trace ' + cap(CUST[J.ci].name) + "'s signature.")]); NEXT('weighDone', beginSign, 1.6); } }); }); }
  // ---- 6 SIGN ----
  function beginSign() { J.step = 6; J.sub = 'sign'; const C = CUST[J.ci]; padName = C.name; padInk = []; const k = C.sig, ph = J.ci * 1.3; padPts = []; for (let i = 0; i < 14; i++) { const u = 0.1 + i / 13 * 0.8; padPts.push([u, 0.54 - 0.17 * Math.sin(u * Math.PI * k + ph) - 0.07 * Math.sin(u * Math.PI * 3.7 + ph * 2)]); }
    redraw(padTex, padTex.userData.fn); pad.visible = true; J.offAll = 0; toast('STEP 6 OF 7 · SIGN FOR IT · DRAG THROUGH THE DOTS', 2.4);
    setPath(padPts.map(([u, v]) => padW(u, v)), i => { padInk = padPts.slice(0, i); redraw(padTex, padTex.userData.fn); }, () => { const off = J.offAll || 0; addGold(Math.max(4, 10 - off * 2)); if (off <= 1) J.clean++; ding(); J.sub = 'signDone';
      const f = J.cf, C2 = CUST[J.ci]; sayTo({ key: 'postCust', obj: f, ry: Math.PI, r: 9 }, [{ who: C2.name, role: 'CUSTOMER', text: 'That is exactly how I sign it. Spooky. Thanks!' }]);
      custWalk(f, [[67.8, -325.4], [64, -323.2]], () => { f.visible = false; }); NEXT('signDone', beginLost, 1.8); }, 0.55); }
  // ---- 7 LOST LETTER ----
  const smudge = (s, seed) => s.split('').map((c, i) => (c === ' ' || i === 0 || s[i - 1] === ' ' || ((i * 7 + seed * 3) % 5) > 1) ? c : '_').join('');
  function beginLost() { pad.visible = false; J.step = 7; J.sub = 'lost'; J.tries = 0; if (!PINS.length) { finishShift(); return; } J.pin = (save.stat('poVisits', 1) * 3) % PINS.length; J.smudge = smudge(PINS[J.pin].label, J.ci + 1); mapState = { found: -1, hint: -1, blink: 0 }; redraw(mapTex, drawMap); placeS('lost');
    heldLetter.visible = true; toast('STEP 7 OF 7 · THE LOST LETTER · TAP THE RIGHT PIN', 2.4); sayTo(stT, [ln('A lost letter. Rain got it. Read what is left and the clue, then tap that pin.')]); }
  function lostPress() { if (J.sub !== 'lost') return; const i = nearestOf(PINS.map((p, k) => k), k => pinW(k), 1.5); if (i == null) return; const P0 = PINS[J.pin];
    if (i === J.pin) { mapState.found = i; mapState.hint = -1; redraw(mapTex, drawMap); ding(); addGold(J.tries ? 8 : 15); if (!J.tries) J.clean++; J.sub = 'lostDone'; heldLetter.visible = false; sayTo(stT, [ln('The ' + cap(P0.label) + '. Of course it was. It goes out on the next round.')]); NEXT('lostDone', finishShift, 1.6); }
    else { J.tries++; nope(); toast('STAMPS: "THAT IS THE ' + PINS[i].label + '. LOOK FOR ' + HINT[P0.kind] + '."', 2.4); if (J.tries >= 3) { mapState.hint = J.pin; } } }
  const cap = t => t.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  // ---- PAY + PRIZE ----
  function finishShift() { J.sub = 'pay'; placeS('idle'); const b = save.stat('poBest', 0); if (J.gold > b) save.setStat('poBest', J.gold); if (J.clean >= 5) { addGold(15); toast('CLEAN SHIFT · +15 GOLD', 2); }
    const gift2 = giveGift(), tot = J.gold, first = !K.stars('shift'), stars = J.clean >= 6 ? 3 : J.clean >= 4 ? 2 : 1, op = ['Eight fifty-nine. One minute early.', 'Done. Not one second late.', 'Punctual to the tick.', 'Splendid. Right on time.'][save.stat('poClears', 1) % 4];
    sayTo(endT, [ln(op + ' ' + tot + ' gold. ' + (gift2.kind === 'cap' ? 'A postal cap, a satchel, and PO Box 12 is yours.' : gift2.kind === 'book' ? 'A stamp book, Meru first. Open it in ITEMS.' : 'Twenty extra, for punctuality.'))], null, true);
    K.finish('shift', stars, tot, first);
    NEXT('pay', () => { stop(); }, 1.2); }
  // ---- input dispatch ----
  function press() { if (!J || J.pause > 0) return; const s = J.sub; if (s === 'catch') catchPress(); else if (s === 'sort') sortPress(); else if (s === 'stamp') stampPress(); else if (s === 'wrapPaper' || s === 'wrapBow') wrapPress(); else if (s === 'price') pricePress(); else if (s === 'lost') lostPress(); else if (J.path) pathDrag(); }
  function drag() { if (!J || !J.path) return; pathDrag(); }
  function release() {}
  // ---- the shift card ----
  const strip = n => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + STEP_N.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 1px;font-size:9px;font-weight:900;border:2px solid #201e1d;overflow:hidden;text-align:left;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  function drawCard() { if (!J) return; const s = J.sub, tall = innerHeight >= 720; let next = '', det = '', key = s + J.step + '_' + J.gold, hd = 'STEP ' + J.step + ' OF 7 · ' + STEP_N[J.step - 1], hr = J.gold ? J.gold + ' G' : '';
    if (s === 'intro') { next = 'LISTEN TO STAMPS'; det = row(RED, 'THE VAN IS IN', '', false); }
    else if (J.step === 1) { key += J.got + '_' + J.drop + '_' + J.n; next = 'TAP LEFT · MIDDLE · RIGHT'; det = row(KRAFT, 'CAUGHT', J.got + '/8', J.got > 0) + row('#cfcac3', 'DROPPED', String(J.drop), false) + '<div style="font-size:12px;font-weight:800;padding-top:6px">GREEN RING = THE CART IS UNDER IT</div>'; }
    else if (J.step === 2) { const d = DIST[J.order[J.li] ?? 0]; key += J.li + '_' + J.wrong + (J.ready ? 'r' : ''); next = J.ready ? 'TAP THE ' + d.n + ' SLOT' : 'LETTER COMING\u2026';
      det = (J.ready ? big('TO: ' + d.n, d.c) : '') + row(GREEN, 'SORTED', J.ok + '/8', J.ok > 0) + row('#cfcac3', 'FIXED BY STAMPS', String(J.wrong), false); }
    else if (J.step === 3) { key += J.sc + '_' + J.sm + '_' + J.sx; next = 'TAP WHEN THE RING IS GREEN'; det = row(GREEN, 'CLEAN', J.sc + '/8', J.sc > 0) + row('#9a948c', 'SMUDGED', String(J.sm), false) + row('#cfcac3', 'MISSED', String(J.sx), false); }
    else if (J.step === 4) { const pi = J.path ? J.path.i : 0; key += pi; const st = Math.max(0, ['wrapPaper', 'wrapTape', 'wrapStr1', 'wrapStr2', 'wrapBow', 'wrapDone'].indexOf(s)), DONE = [0, 1, 3, 4], NOW = [[0], [1], [2, 3], [4]]; next = s === 'custIn' ? 'A CUSTOMER IS COMING' : s === 'wrapPaper' ? 'TAP THE BOX FOR PAPER' : s === 'wrapTape' ? 'DRAG THE TAPE ALONG THE DOTS' : s.startsWith('wrapStr') ? 'DRAG THE STRING ALONG THE DOTS' : s === 'wrapBow' ? 'TAP FOR THE BOW' : 'WRAPPED';
      det = ['PAPER', 'TAPE', 'STRING', 'BOW'].map((n, i) => row(i === 0 ? KRAFT : i === 1 ? '#e9dcc0' : i === 2 ? '#ffffff' : RED, n, st > DONE[i] ? '\u2713' : NOW[i].includes(st) ? 'NOW' : '\u2014', st > DONE[i])).join(''); }
    else if (J.step === 5) { const w = J.wts ? J.wts[J.wi] : 0; key += J.wi + (J.wset ? 's' : '') + J.wwrong; next = J.sub === 'price' ? 'TAP THE RIGHT STAMP' : 'WEIGHING\u2026';
      det = big(J.wset ? (w || 0).toFixed(1) + ' KG' : '\u2026 KG', INK, YEL) + '<div style="font-size:11px;font-weight:900">PARCEL ' + Math.min(3, J.wi + 1) + ' OF 3 · PRICE LIST</div>' + PRICES.map(p => row(p.c, p.max < 99 ? 'UP TO ' + p.max + ' KG' : 'OVER 5 KG', p.v + ' G', false)).join(''); }
    else if (J.step === 6) { const pi = J.path ? J.path.i : 14; key += pi; next = 'DRAG THROUGH THE DOTS'; det = row(NAVY, 'SIGNATURE · ' + CUST[J.ci].name, pi + '/14', pi >= 14) + bar(pi / 14); }
    else if (J.step === 7) { key += J.tries + '_' + J.sub; next = J.sub === 'lost' ? 'TAP THE RIGHT PIN ON THE MAP' : 'FOUND IT';
      det = '<div style="font-size:11px;font-weight:900">WHAT IS LEFT OF THE ADDRESS</div>' + big(J.smudge || '', '#fbf8f0', INK) + '<div style="font-size:11px;font-weight:900">CLUE</div><div style="font-weight:900;font-size:14px;padding:2px 0 4px">' + (PINS[J.pin] ? HINT[PINS[J.pin].kind] : '') + '</div>' + (J.tries >= 3 ? row(YEL, 'THE YELLOW PIN BLINKS', '', false) : ''); }
    if (s === 'pay') { key = 'pay' + J.gold; hd = 'SHIFT DONE'; next = 'ALL DONE'; det = row(GOLD, 'GOLD', J.gold + ' G', true) + row(GREEN, 'CLEAN STEPS', J.clean + '/7', J.clean >= 5); }
    setCard(key, head2(hd, hr) + foot(next) + '<div style="padding:8px 10px 10px">' + (tall ? strip(J.step) : '') + det + '</div>'); }
  function stop() { busy = null; LK.on = false; if (J) { sRing.visible = false; shadow.visible = false; ENVS.forEach(E => { E.g.visible = false; E.x = null; }); PARC.forEach(p => { p.visible = false; if (p.parent !== G) G.add(p); }); letter.visible = false; gift.visible = false; pad.visible = false; heldLetter.visible = false; flyStamp.visible = false; if (J.cf) J.cf.visible = false; } J = null; ptr.down = false; hideDots(); hideCard(); placeS('idle'); cart.position.set(LANES[1], 0, LZ); dialA = 0; redraw(dialTex, dialTex.userData.fn); if (mapState.found >= 0 || mapState.hint >= 0) { mapState = { found: -1, hint: -1, blink: 0 }; redraw(mapTex, drawMap); } }
  // ================= MAIL ROUTE (game 2) =================
  const FN = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  const POOL = (L && L.BUILDINGS || []).filter(b => b.door && b.label && !/^(station|extramv4m90mv|extramv4m8ssh|extramv4m7g3b|extramv4m9n2p|extramv4m9870)/.test(b.key) && !/station|outlet|closed|castle|pearl sail|aviary|post office/i.test(b.label) && b.key !== 'castle')
    .map(b => { const n = FN[b.face] || [0, 1]; return { key: b.key, label: b.label.replace(/^Meru /, ''), x: b.door[0] + n[0] * 2.6, z: b.door[1] + n[1] * 2.6 }; }).filter(d => { const r = Math.hypot(d.x - POxz[0], d.z - POxz[1]); return r > 30 && r < 340; });
  const WHO = ['NURSE POPPY', 'MR. TUCK', 'OLD WREN', 'MISS JUNE', 'DR. FENN', 'THE NIGHT CLERK', 'CAPTAIN TOR', 'BRAM', 'LITTLE PIP', 'MRS. HOLLOW'];
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 26, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide })); beacon.visible = false; scene.add(beacon);
  const bRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.2, 32), new THREE.MeshBasicMaterial({ color: 0xffd23a, side: THREE.DoubleSide })); bRing.rotation.x = -Math.PI / 2; bRing.visible = false; scene.add(bRing);
  const arrG = new THREE.ConeGeometry(0.2, 0.55, 4); arrG.rotateX(Math.PI / 2); const arrow = new THREE.Mesh(arrG, new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false })); arrow.renderOrder = 6; arrow.scale.setScalar(1.6); arrow.visible = false; scene.add(arrow);
  const mbox = new THREE.Group(); mbox.add(mm(Cy(0.05, 0.05, 1.0, 8), LM(INK), 0, 0.5, 0), mm(Bx(0.42, 0.34, 0.6), LM(RED), 0, 1.15, 0), mm(Cy(0.21, 0.21, 0.6, 14, 1, false, 0, Math.PI), LM(RED), 0, 1.32, 0, Math.PI / 2, 0, Math.PI / 2), mm(Bx(0.06, 0.18, 0.04), LM(YEL), 0.24, 1.38, 0.25)); mbox.visible = false; scene.add(mbox);
  const mailFly = mm(new THREE.PlaneGeometry(0.34, 0.24), new THREE.MeshBasicMaterial({ map: stTex, side: THREE.DoubleSide })); mailFly.visible = false; scene.add(mailFly); let mfT = -1, mfA = V(), mfB = V();
  function startRoute() { if (busy || R) return false; if (POOL.length < 5) { toast('NO DOORS ON THE ROUTE TODAY', 2); return false; }
    const used = new Set(), stops = []; let cx = POxz[0], cz = POxz[1], len = 0; const n0 = save.stat('poRoutes', 0);
    for (let k = 0; k < 5; k++) { const c = POOL.filter(d => !used.has(d.key)).sort((a, b) => Math.hypot(a.x - cx, a.z - cz) - Math.hypot(b.x - cx, b.z - cz)).slice(0, 3); const d = c[(n0 + k) % c.length] || c[0]; used.add(d.key); len += Math.hypot(d.x - cx, d.z - cz); cx = d.x; cz = d.z; stops.push({ ...d, who: WHO[(n0 * 3 + k * 7) % WHO.length] }); }
    len += Math.hypot(POxz[0] - cx, POxz[1] - cz); R = { stops, i: 0, t: 0, par: Math.round(len / 8 + 15), gold: 0, home: false }; showStop(); pop();
    sayTo(stT, [ln('Five letters, in order, then back to me. My clock says ' + R.par + ' seconds. Follow the arrow.')]); return true; }
  function showStop() { const s = R.i < R.stops.length ? R.stops[R.i] : { x: POxz[0], z: POxz[1] }; beacon.position.set(s.x, 13, s.z); bRing.position.set(s.x, 0.12, s.z); beacon.visible = bRing.visible = arrow.visible = true; beacon.material.color.set(R.i < R.stops.length ? 0xec3013 : 0x3f9a5e);
    if (R.i < R.stops.length) { mbox.visible = true; mbox.position.set(s.x + 1.5, 0, s.z); } else mbox.visible = false; }
  function deliverStop(P) { const s = R.stops[R.i], g = 10 + (R.t < R.par * (R.i + 1) / 6 ? 4 : 0); save.addGold(g); R.gold += g; mfA.set(P.x, (P.y || 0) + 1.3, P.z); mfB.set(mbox.position.x, 1.35, mbox.position.z); mfT = 0; mailFly.visible = true; tone(523, 0.05, 0.3); tone(784, 0.05, 0.5, 'sine', 0.08);
    toast(s.who + ' AT THE ' + s.label.toUpperCase() + ': "POST! THANK YOU!" · +' + g + ' GOLD', 2.6); R.i++; showStop(); }
  function finishRoute() { const ok = R.t <= R.par, bonus = ok ? 30 : 10; save.addGold(bonus); R.gold += bonus; save.setStat('poRoutes', save.stat('poRoutes', 0) + 1); const best = save.stat('poRouteBest', 0); const tt = Math.round(R.t); if (!best || tt < best) save.setStat('poRouteBest', tt);
    const b = boxState(); if (b.open) setBox({ open: true, mail: Math.min(3, (b.mail || 0) + 1) }); beacon.visible = bRing.visible = arrow.visible = false; mbox.visible = false; ding();
    sayTo(endT, [ln((ok ? tt + ' seconds, ' + (R.par - tt) + ' to spare. I am moved.' : tt + ' seconds, ' + (tt - R.par) + ' late. The letters forgive you.') + ' ' + R.gold + ' gold.' + (b.open ? ' Check your PO box.' : ''))]); { const first = !K.stars('route'); K.finish('route', ok ? (tt <= R.par * 0.85 ? 3 : 2) : 1, R.gold, first); } toast((ok ? 'ON TIME · +30' : 'LATE · +10') + ' · ROUTE ' + R.gold + ' GOLD', 3); R = null; hideCard(); }
  function cancelRoute() { R = null; beacon.visible = bRing.visible = arrow.visible = false; mbox.visible = false; hideCard(); toast('MAIL ROUTE CANCELLED · GOLD KEPT', 2); }
  const mmss = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
  function routeTick(dt, P, fox) { if (mfT >= 0) { mfT += dt / 0.5; const k = Math.min(1, mfT); mailFly.position.lerpVectors(mfA, mfB, k); mailFly.position.y += Math.sin(k * Math.PI) * 0.8; mailFly.rotation.y += dt * 8; if (k >= 1) { mfT = -1; mailFly.visible = false; } }
    if (!R) return; R.t += dt; const home = R.i >= R.stops.length, s = home ? { x: POxz[0], z: POxz[1], label: 'Post Office' } : R.stops[R.i], dx = s.x - P.x, dz = s.z - P.z, d = Math.hypot(dx, dz);
    arrow.position.set(P.x, (P.y || 0) + 2.55, P.z); arrow.rotation.y = Math.atan2(dx, dz); arrow.visible = d > 4 && !(fox && !fox.visible); bRing.scale.setScalar(1 + 0.08 * Math.sin(performance.now() / 200));
    if (d < 2.4 && (P.y || 0) < 3) { if (home) { finishRoute(); return; } deliverStop(P); return; }
    if (!busy) { const late = R.t > R.par; setCard('rt' + R.i + '_' + Math.round(d / 5) + '_' + Math.floor(R.t), head2('MAIL ROUTE', mmss(R.t) + ' / ' + mmss(R.par)) + '<div style="padding:8px 10px 10px">' + R.stops.map((q, i) => row(i < R.i ? GREEN : i === R.i ? RED : '#f3f2f2', (i + 1) + ' · ' + q.label.toUpperCase(), i < R.i ? '\u2713' : i === R.i ? Math.round(d) + ' M' : '', i < R.i)).join('') + row(home ? RED : '#f3f2f2', 'BACK TO STAMPS', home ? Math.round(d) + ' M' : '', false) + bar(R.t / R.par, late ? RED : YEL) + '<div style="font-size:12px;font-weight:900">' + (late ? 'LATE · KEEP GOING' : "ON STAMPS' CLOCK") + '</div></div>' + foot('FOLLOW THE ARROW', false)); } }
  // ================= PO BOX + STAMP BOOK =================
  const CARDS = ['A POSTCARD FROM JIDDA: "THE SURF IS HUGE. WISH YOU WERE HERE."', 'A POSTCARD FROM LUXOR: "THE VOLCANO SAYS HI."', 'A NOTE FROM NEBO: "THE GLIDERS ARE OUT. COME FLY."', 'A POSTCARD FROM ZION: "MONSTER TRUCKS. NEED I SAY MORE?"', 'A LETTER FROM GAYA: "TENNIS OPEN SOON. BRING A RACKET."', 'A POSTCARD FROM UR: "THE ESPRESSO HERE IS SERIOUS."', 'A NOTE FROM KUFA: "QUIET HERE. TOO QUIET."', 'A POSTCARD FROM EARTH: "THE SPEEDWAY IS LOUD. I LOVE IT."'];
  let boxOpenT = 0;
  function openBox() { const b = boxState(); if (!b.open) { nope(); toast('PO BOX 12 · LOCKED · WORK A SHIFT FIRST', 2); return; } boxOpenT = 3.5; tone(700, 0.04, 0.1, 'square');
    if (b.mail > 0) { const n = save.stat('poCards', 0), g = 12; save.addGold(g); save.setStat('poCards', n + 1); setBox({ open: true, mail: b.mail - 1 }); boxMail.visible = true; ding(); toast(CARDS[n % CARDS.length] + ' · +' + g + ' GOLD', 3.6); }
    else toast('PO BOX 12 · EMPTY · RUN A MAIL ROUTE', 2); }
  const WORLDS = [['meru', 'MERU', RED], ['gaya', 'GAYA', GREEN], ['jidda', 'JIDDA', BLUE], ['kufa', 'KUFA', '#a85a22'], ['luxor', 'LUXOR', '#e05a2a'], ['nebo', 'NEBO', '#7c3aed'], ['ur', 'UR', '#a16207'], ['zion', 'ZION', '#5a5654'], ['home', 'HOME', NAVY], ['earth', 'EARTH', '#0e7fb8'], ['station', 'DEEP SPACE FOX', INK]];
  let bookEl = null;
  function closeBook() { if (bookEl) { bookEl.remove(); bookEl = null; } }
  function openBook() { closeBook(); const have = new Set(save.stat('stamps', null) || []); const el = document.createElement('div'); el.setAttribute('data-post-book', '1'); el.style.cssText = 'position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(32,30,29,0.55);font-family:Archivo,sans-serif;pointer-events:auto';
    el.innerHTML = '<div style="background:#f3f2f2;border:2px solid #201e1d;width:min(92vw,520px);max-height:88vh;overflow:auto;box-sizing:border-box"><div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:8px 12px;font-weight:900;font-size:15px;gap:10px"><span style="white-space:nowrap">STAMP BOOK · ' + have.size + ' / ' + WORLDS.length + '</span><button data-close style="min-width:44px;min-height:44px;background:#201e1d;color:#ffd23a;border:0;font:900 14px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">CLOSE</button></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;padding:12px">' + WORLDS.map(([k, n, c]) => have.has(k) ? '<div style="border:2px solid #201e1d;background:#fff;padding:6px;min-height:96px"><div style="background:' + c + ';color:#fff;font-weight:900;font-size:13px;padding:6px;min-height:58px;outline:2px dashed #fff;outline-offset:-6px">' + n + '<div style="font-size:26px;line-height:1.1">8</div></div><div style="font-size:11px;font-weight:900;padding-top:4px">COLLECTED</div></div>'
        : '<div style="border:2px dashed #9a948c;padding:6px;min-height:96px;color:#6a645c"><div style="font-weight:900;font-size:13px">' + n + '</div><div style="font-size:11px;font-weight:800;padding-top:44px">NOT YET</div></div>').join('') + '</div><div style="padding:0 12px 12px;font-size:13px;font-weight:800">Each world\'s post office has its own stamp. Meru is the first.</div></div>';
    el.addEventListener('pointerdown', e => e.stopPropagation()); el.querySelector('[data-close]').addEventListener('click', closeBook); el.addEventListener('click', e => { if (e.target === el) closeBook(); }); document.body.appendChild(el); bookEl = el; }
  addEventListener('keydown', e => { if (bookEl && e.key === 'Escape') closeBook(); });
  function useItem(id) { if (id !== 'stampBook') return false; if (!save.count('stampBook')) return false; openBook(); return true; }
  // ---------- camera ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false }, LK = { on: false, yaw: 0, pitch: -0.12 };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  function shot() { if (busy !== 'job' || !J) return null; const s = J.sub, st = J.step;
    if (s === 'intro' || st === 1) return [V(71.3, 0.8, -338.0), 5.6, 3.2, 0.5, 4, 0, 8.5];
    if (st === 2) return [V(55.6, 1.6, -337.0), 5.4, 2.0, 0.28, 2.8, 0, 6];
    if (st === 3) return [V(63.1, 1.0, BZ), 7.4, 2.0, 0.62, 3, 0, 8];
    if (st === 4 && s === 'custIn') return [V(66.6, 1.2, -329.5), 4.2, 4.0, 0.35, 3.2, Math.PI, 7];
    if (st === 4) return [V(GIFT0.x, 1.25, GIFT0.z), 1.25, 0.9, 1.0, 1.0, Math.PI, 2.6];
    if (st === 5) return [V(69.2, 1.2, -332.0), 3.3, 1.4, 0.6, 1.9, Math.PI, 4.4];
    if (st === 6) return [V(PAD.x, 1.07, PAD.z), 0.9, 0.62, 1.2, 0.8, Math.PI, 2.0];
    if (st === 7 && s !== 'pay') return [V(MAPC.x, MAPC.y - 0.3, MAPC.z), MW + 0.4, MH + 1.0, 0.06, 3, 0, 7.5];
    return [V(64.5, 1.3, -331.5), 4.6, 2.6, 0.3, 3, Math.PI, 7]; }
  const LKP = V(64, 10.3, -320.4);
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } }; function camFix(cam, dt, fox) { if (fox) { applyWear(fox); if (busy && fox) fox.visible = false; }
    if (busy === 'look') { lensOff(cam); if (near0 == null) { near0 = cam.near; cam.near = 0.1; cam.updateProjectionMatrix(); } cam.position.copy(LKP); cam.lookAt(LKP.x + Math.sin(LK.yaw) * Math.cos(LK.pitch), LKP.y + Math.sin(LK.pitch), LKP.z + Math.cos(LK.yaw) * Math.cos(LK.pitch)); camCur.on = false; return; }
    const v = shot(); if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); } if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
    fitCam(v); camT.pos.x = clamp(camT.pos.x, X0 + 0.35, X1 - 0.35); camT.pos.z = clamp(camT.pos.z, Z0 + 0.35, Z1 - 0.35); camT.pos.y = Math.min(camT.pos.y, 6.0);
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  function lookOut() { busy = 'look'; LK.on = true; LK.yaw = 0; LK.pitch = -0.12; pop(); toast(touch ? 'THE CLOCK TOWER · DRAG TO LOOK · 3 TO STEP BACK' : 'THE CLOCK TOWER · DRAG TO LOOK · E OR SPACE TO STEP BACK', 3.5);
    setCard('look', head2('THE CLOCK TOWER', 'MERU') + '<div style="padding:8px 10px 10px;font-weight:800;font-size:14px">The view from behind the clock face, ten metres up.</div>' + foot('DRAG TO LOOK AROUND')); }
  // ---------- HINT HAND: no input for 3 s → a pointer shows the next spot ----------
  const HAND = document.createElement('div'); HAND.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HAND.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HAND); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTarget = () => { if (busy !== 'job' || !J || J.pause > 0 || ptr.down || J.flies.length) return null; const s = J.sub;
    if (s === 'catch') { const F = J.fl[0]; return F && Math.abs(cart.position.x - LANES[F.lane]) > 0.5 ? [V(LANES[F.lane], 0.6, LZ), 'TAP THIS LANE'] : null; }
    if (s === 'sort' && J.ready) { const d = SLOTS[J.order[J.li]]; return [d.p.clone(), 'TAP ' + d.n]; }
    if (s === 'stamp') return [V(HX, BY, BZ), 'TAP WHEN GREEN'];
    if (s === 'wrapPaper') return [gP(0, 0), 'TAP THE BOX']; if (s === 'wrapBow') return [gP(0, 0), 'TAP FOR THE BOW'];
    if (J.path && J.path.i < J.path.pts.length) return [J.path.pts[J.path.i].clone(), J.step === 6 ? 'DRAG THROUGH THE DOTS' : 'DRAG ALONG THE DOTS'];
    if (s === 'price') { const w = J.wts[J.wi], r = PRICES.find(p => w <= p.max); return [TILES[PRICES.indexOf(r)].p.clone(), w.toFixed(1) + ' KG · TAP ' + r.v + ' G']; }
    if (s === 'lost') return J.tries >= 2 ? [pinW(J.pin), 'THIS PIN'] : [V(MAPC.x, MAPC.y, MAPC.z + 0.02), 'READ THE CLUE · TAP A PIN'];
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HAND.style.display !== 'none') HAND.style.display = 'none'; return; } const p = h[0].clone().project(camera); if (p.z > 1) { HAND.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HAND.style.display = 'block'; HAND.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HAND.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 && P.x < X1 && P.z > Z0 - 0.3 && P.z < Z1 + 0.3 && (P.y || 0) < 6.5;
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r && (s.y == null ? (P.y || 0) < 2 : Math.abs((P.y || 0) - s.y) < 1.2), near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r && (P.y || 0) < 2;
  function prompt(P) { if (busy || !inShop(P) || P.skate) return null; if (at(P, SPOT.look)) return 'LOOK OUT · THE CLOCK TOWER'; if (at(P, SPOT.start)) return R ? 'FINISH THE MAIL ROUTE FIRST' : 'WORK A SHIFT · HELP STAMPS'; if (at(P, SPOT.route)) return R ? 'CANCEL THE MAIL ROUTE' : 'MAIL ROUTE · 5 LETTERS · BEAT THE CLOCK';
    if (own().cap && at(P, SPOT.peg)) return 'POST GEAR · CAP + SATCHEL ' + (wearNow().cap ? 'OFF' : 'ON'); if (K.atHiring(P)) return R ? 'FINISH THE MAIL ROUTE FIRST' : 'NOW HIRING · START WORK'; if (at(P, SPOT.pobox)) { const b = boxState(); return !b.open ? 'PO BOX 12 · LOCKED' : b.mail > 0 ? 'OPEN PO BOX 12 · MAIL!' : 'OPEN PO BOX 12'; } if (near(P, stT)) return 'TALK · STAMPS'; return null; }
  // s72: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const HELLO = ['Stamps. Postmaster. Forty-one years, not one minute late. A shift is seven jobs. I time them all.', 'On time again. I noticed. What will it be?', 'Good morning. Or afternoon. The clock decides, not me.', 'The tubes are whooshing nicely today. Work, route, or advice?'];
  const TIPS = ["The clock over the door is four seconds fast. I set my watch by it anyway. Out of respect.","PO Box 12 has been empty for nine years. Until you.","Never late. Not once. Not even the day of the big storm.","The tubes go whoosh. Every time. I never get tired of it.","The stamp case is not for sale. Do not ask. People ask.","You may climb the clock stair. Do not touch the pendulum.","Up to one kilo, two gold. Up to three, four. Up to five, six. Over that, nine.","Run a mail route, then check PO Box 12. Postcards come with gold."];
  const goWork = P => { if (P) Object.assign(P, { x: SPOT.start.x, z: SPOT.start.z, sp: 0 }); startShift(); };
  const togglePeg = () => { const on = !wearNow().cap; setWear('cap', on); setWear('bag', on); pop(); toast(on ? 'CAP + SATCHEL ON' : 'CAP + SATCHEL OFF', 1.4); };
  const stMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy && !R) goWork(lastP); } }, { text: 'THE MAIL ROUTE', pick: () => { if (!busy && !R) startRoute(); } }, ...(own().cap ? [{ text: 'MY POST GEAR', pick: () => { if (!busy) togglePeg(); } }] : []),
      { text: "A POSTMASTER'S TIP, PLEASE", pick: () => sayTo(stT, [ln(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(stT, [{ ...ln(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { if (busy === 'look') { stop(); toast('BACK FROM THE CLOCK', 1.2); return true; } if (busy) return true; if (!inShop(P) || P.skate) return false;
    if (at(P, SPOT.look)) { lookOut(); return true; }
    if (at(P, SPOT.start)) { if (R) { toast('FINISH THE MAIL ROUTE FIRST', 1.6); return true; } startShift(); return true; }
    if (at(P, SPOT.route)) { if (R) cancelRoute(); else startRoute(); return true; }
    if (own().cap && at(P, SPOT.peg)) { togglePeg(); return true; }
    if (at(P, SPOT.pobox)) { openBox(); return true; }
    if (K.atHiring(P)) { if (R) { toast('FINISH THE MAIL ROUTE FIRST', 1.6); return true; } ding(); goWork(P); return true; }
    if (!near(P, stT)) return false; pop(); if (R) { sayTo(stT, [ln('You are on the route. The clock is running. Why are you talking to me?')]); return true; } stMenu(!talked++); return true; }
  function quit() { if (busy === 'look') { stop(); return; } stop(); toast('SHIFT ENDED · GOLD KEPT', 2); }
  function groundAt(x, z, y) { if (x > ST.x0 && x < ST.x1 + 0.3 && z > ST.z0 && z < ST.z1) return clamp((z - ST.z0) / (ST.z1 - ST.z0), 0, 1) * ST.top; if (x > GAL.x0 && x < GAL.x1 + 0.3 && z > GAL.z0 && z < GAL.z1 + 0.3 && y > 3.2) return ST.top; return null; }
  // ---------- tick ----------
  function tick(dt, P, fox) { lastP = P; const t = performance.now() / 1000, dH = Math.hypot(P.x - CX, P.z - CZ); G.visible = dH < (touch ? 45 : 90); toastT -= dt; routeTick(dt, P, fox); if (!R && !busy && cardKey.startsWith('rt')) hideCard();
    if (busy === 'job' && J && !inShop(P)) stop();
    if (busy === 'job' && J) { J.t += dt; if (J.flies.length) flyTick(dt); custTick(dt);
      if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } }
      else { if (J.sub === 'catch') catchTick(dt); if (J.sub === 'stamp') stampTick(dt); weighTick(); }
      if (J.path) { const pi = J.path.i; DOTS.forEach((d, i) => { if (!d.visible) return; const on = i === pi; d.material = on ? dotN : dotM; d.scale.setScalar(J.path.size * (on ? 1.5 + 0.25 * Math.sin(t * 8) : 1)); }); }
      if (J.step === 7 && J.sub === 'lost' && mapState.hint >= 0) { const b = Math.floor(t * 3); if (b !== mapState.blink) { mapState.blink = b; redraw(mapTex, drawMap); } }
      if (heldLetter.visible) { const P2 = stamps.userData.P, hp = V(); (P2 && P2.arms && P2.arms[1] ? P2.arms[1] : stamps).getWorldPosition(hp); heldLetter.position.copy(hp).add(V(0, -0.15, 0.1)); heldLetter.rotation.set(0, stamps.rotation.y, 0); }
      drawCard(); }
    hintTick(t); if (!G.visible) return;
    beltTex.offset.x = (beltTex.offset.x + (busy === 'job' && J && J.step === 3 ? dt * 0.72 / 8.6 * 16 : dt * 0.05)) % 1;
    for (const C of CAPS) { if (C.wait > 0) { C.wait -= dt; C.m.visible = false; continue; } C.m.visible = true; C.s += dt * 7 * C.dir; if (C.s >= C.len) { C.s = C.len; if (C.run) { const r = C.run; C.run = null; r(); } C.dir = -1; C.wait = 0.6; } else if (C.s <= 0) { C.s = 0; C.dir = 1; C.wait = 1.5 + (C === CAPS[0] ? 0 : Math.random() * 2); }
      tubeAt(C.T, C.s, C.m.position); const a = tubeAt(C.T, Math.min(C.len, C.s + 0.05), V()); const d = a.sub(C.m.position); if (d.lengthSq() > 1e-6) C.m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); }
    const hr = hour ? hour() : 12; hP.rotation.z = (hr % 12) / 12 * Math.PI * 2; mP.rotation.z = (hr % 1) * Math.PI * 2; GEARS.forEach(g => { g.g.rotation.z += dt * g.w; }); pend.rotation.z = Math.sin(t * 2.2) * 0.22;
    { const cp = camera.position; GG.visible = !((P.y || 0) < 3.0 && cp.y > ST.top - 0.4 && cp.z > GAL.z0 - 0.8) || busy === 'look'; }
    if (boxOpenT > 0) { boxOpenT -= dt; myDoor.rotation.y = -Math.min(1, boxOpenT * 3, (3.5 - boxOpenT) * 4) * 1.6; if (boxOpenT <= 0) { myDoor.rotation.y = 0; boxMail.visible = false; } }
    boxRing.visible = true; pegCap.visible = pegBag.visible = own().cap && !wearNow().cap;
    { const work = busy === 'job'; K.tick(dt, P, { inShop: inShop(P), busy: work || busy === 'look', near: dH, talking: work });   // s72: shop kit runs Stamps' idle / wave / look-at
      if (work) turnTo(stamps, stamps.userData.face0 ?? 0, dt * 0.5); } }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, route: () => R, startShift, startRoute, lookOut, openBook, closeBook, useItem, groundAt, stamps, camera, save, PINS, POOL,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); ptr.down = false; }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); }, dragTo(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; },
    targets() { if (!J) return []; const s = J.sub; if (s === 'catch') { const F = J.fl[0]; return F ? [scrW(V(LANES[F.lane], 0.6, LZ))] : []; } if (s === 'sort') return [scrW(SLOTS[J.order[J.li]].p)]; if (s === 'stamp' || s === 'wrapPaper' || s === 'wrapBow') return [[innerWidth / 2, innerHeight / 2]];
      if (J.path) return J.path.pts.slice(J.path.i).map(p => scrW(p)); if (s === 'price') { const w = J.wts[J.wi], r = PRICES.find(p => w <= p.max); return [scrW(TILES[PRICES.indexOf(r)].p)]; } if (s === 'lost') return [scrW(pinW(J.pin))]; return []; },
    stampReady: () => !!J && J.sub === 'stamp' && ENVS.some(E => !E.res && E.x != null && Math.abs(E.x - HX) < 0.1),
    skipTo(s) { if (!J) startShift(); J.pause = 0; J.after = null; J.flies.length = 0; J.fl.length = 0; PARC.forEach(p => { p.visible = false; if (p.parent !== G) G.add(p); }); shadow.visible = false;
      if (s === 'sort') beginSort(); else if (s === 'stamp') beginStamp(); else if (s === 'wrap') beginWrap(); else if (s === 'weigh') { gift.visible = true; gift.position.copy(GIFT0); J.cf = custFox(J.ci); J.cf.visible = true; J.cf.position.set(67.8, 0, -330.75); J.cf.rotation.y = Math.PI; beginWeigh(); } else if (s === 'sign') { J.cf = custFox(J.ci); J.cf.visible = true; J.cf.position.set(67.8, 0, -330.75); beginSign(); } else if (s === 'lost') beginLost(); },
    hiring: K, dispose() { card.remove(); closeBook(); HAND.remove(); K.dispose(); } };
  window.__post = API; return API;
}
