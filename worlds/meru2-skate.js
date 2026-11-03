// MERU 2.0 — s50 TOWN 2 INTERIOR 8: RAIL'S SKATE SHOP [meruSkate] (f -208..-192 × 61..77, door N (-200, 61)).
// RAIL (Ben's pick): lanky young fox, beanie, scuffed knees, says "sick" a lot.
// ONE ORDER, ALL STEPS IN A ROW (Ben, all 5): 1 BUILD: tap the deck, grip, trucks + wheels the customer asked for · 2 GRIP: drag the tape tail to nose,
// then trim round the edge · 3 WHEELS: spin the shop wheels off (drag round), tap the new ones on · 4 MINI RAMP: tap at the bottom to pump, tap in the air for a trick (3) ·
// 5 TRICK TEST: watch the customer's combo on the practice rail, then copy it (buttons). GENTLE: no fail.
// Prizes (Ben, all 6): YOUR OWN SKATEBOARD (item ownBoard: ride anywhere, via yards.summon) · SKATE OUTFIT (hoodie + beanie) · CUSTOM DECK ART (pick 1 of 4)
// · KNEE PADS (a bail keeps most of your speed) · STICKER PACK (+25 % gold here) · SPEED WHEELS (board ×1.25).
// s69 INTERIOR POLISH 8: shopKit (Rail = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board ORDER; badge), NOW HIRING by the door,
// ONE-box menu with choices, 1-box end line, hint hand, touch radius 44 + bigger dots, portrait lens + room-clamped cameras, hoodie rack moved off the door → bench walkway.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { applyD, skateD, applyPose, endPose, FOX_ANIMS } from '../engine/fox-poses.js?v=s648k';   // s620: jointed skaters on the mini ramp + the practice rail, Rail + the customer react
export function buildSkateShop({ THREE, scene, kit, cols, save, touch, sayTo, camera, yards, hour = () => 12, isMuted = () => false }) {
  const X0 = -207.6, X1 = -192.4, Z0 = 61.4, Z1 = 76.6, CX = -200, CZ = 69;
  const G = new THREE.Group(); G.name = 'skateShop'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), { put, box, cyl, sph } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] }), ringC = (x, z, r) => cols.push({ c: [x, z, r] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', BLUE = '#2f6fd6', GREEN = '#3f9a5e', STEEL = '#c9ced3', DARK = '#3d3b3a', CONC = '#b9b6b0';
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 12) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W - 24, fs); });
  const plane = (map, w, h, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  // s620 JOINTED SKATE: ride(f, o) = skateD stance on the shop board (fox origin = deck top, travel = the fox's -x), play(f, name) = a lab animation
  const jointed = f => !!(f && f.userData.P && f.userData.P.fore), PS = new Map();
  const ride = (f, o, fakie, t, mod) => { if (!jointed(f)) return false; const D = skateD(o); if (fakie) { D.head[1] = -D.head[1]; D.look = -D.look; } if (mod) mod(D); applyD(THREE, f, D, t, 1); f.userData._sk = 1; PS.delete(f); return true; };
  const play = (f, name, dt) => { if (!jointed(f) || !FOX_ANIMS[name]) return; let q = PS.get(f); if (!q) PS.set(f, q = { a: null, t: 0 }); if (q.a !== name) { q.a = name; q.t = 0; } q.t += dt; applyPose(THREE, f, name, q.t, Math.min(1, q.t * 3)); f.userData._sk = 1; };
  const unride = f => { if (f && f.userData._sk) { endPose(f); f.userData._sk = 0; PS.delete(f); } };
  const skO = (m, k, act) => !act || !m ? {} : m === 'ollie' ? { air: Math.sin(k * Math.PI) * 0.6 } : m === 'kickflip' ? { air: Math.sin(k * Math.PI) * 0.6, flip: k > 0.15 && k < 0.65 ? (k - 0.15) / 0.5 : 0, mood: 'excited' } : m === 'grind' ? { grind: true } : { manual: true };
  const DECK_TOP = 0.011, react = (who, name, t = 1.5) => { if (J) J[who] = { name, t }; };
  // ---------- floor: polished concrete with paint flecks ----------
  { const t = CT(256, 256, (g, W, H) => { g.fillStyle = '#a9a69f'; g.fillRect(0, 0, W, H); for (let i = 0; i < 70; i++) { g.fillStyle = ['rgba(236,48,19,0.5)', 'rgba(255,210,58,0.55)', 'rgba(47,111,214,0.45)', 'rgba(32,30,29,0.25)'][i % 4]; g.beginPath(); g.arc((i * 73) % W, (i * 41) % H, 1 + (i % 3), 0, 7); g.fill(); } g.fillStyle = 'rgba(60,55,50,0.3)'; g.fillRect(0, 127, W, 2); g.fillRect(127, 0, 2, H); });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 3, (Z1 - Z0) / 3); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f); }
  const wall = (len, x, z, ry, c = '#2a2826') => { box(len, 0.3, 0.06, INK, x, 0.15, z, ry); box(len, 4.4, 0.05, c, x, 2.5, z, ry); box(len, 0.12, 0.08, YEL, x, 1.2, z, ry); };
  wall(X1 - X0, CX, Z1 - 0.03, 0); wall(Z1 - Z0, X0 + 0.03, CZ, Math.PI / 2); wall(Z1 - Z0, X1 - 0.03, CZ, Math.PI / 2, '#3a3836');
  for (const [a, b] of [[X0, -201.4], [-198.6, X1]]) wall(b - a, (a + b) / 2, Z0 + 0.03, 0);
  box(2.4, 0.02, 1.6, RED, -200, 0.08, 62.3);
  // mural on the south wall above the ramp
  { const t = CT(1024, 256, (g, W, H) => { g.fillStyle = '#2a2826'; g.fillRect(0, 0, W, H); const cs = [RED, YEL, BLUE, '#ffffff']; for (let i = 0; i < 9; i++) { g.fillStyle = cs[i % 4]; g.beginPath(); g.moveTo(i * 120, H); g.lineTo(i * 120 + 70, 30 + (i % 3) * 30); g.lineTo(i * 120 + 160, H); g.fill(); }
      g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.font = '900 120px Archivo, sans-serif'; g.fillText('SICK.', 40, 110); g.fillStyle = YEL; g.font = '900 54px Archivo, sans-serif'; g.fillText("RAIL'S SKATE SHOP · MERU", 380, 120); });
    plane(t, 9.6, 2.4, -200, 3.3, Z1 - 0.07, Math.PI); }
  // ================= MINI RAMP (south): quarter pipes at each end, flat bottom =================
  const RMP = { cx: -200, z: 74.6, F: 2.6, R: 1.6, w: 3.0 };
  { const s = RMP, z0 = s.z - s.w / 2, segs = 10; box(2 * s.F, 0.08, s.w, '#c9a77a', s.cx, 0.11, s.z);
    for (const sd of [-1, 1]) { for (let i = 0; i < segs; i++) { const a0 = i / segs * Math.PI / 2, a1 = (i + 1) / segs * Math.PI / 2, am = (a0 + a1) / 2, x = s.cx + sd * (s.F + s.R * Math.sin(am)), y = s.R * (1 - Math.cos(am)) + 0.07, len = s.R * (a1 - a0) + 0.02; box(len, 0.06, s.w, '#c9a77a', x, y + 0.04, s.z, 0, 0, sd * am); }
      const ex = s.cx + sd * (s.F + s.R); box(0.9, 0.08, s.w, '#c9a77a', ex + sd * 0.45, s.R + 0.11, s.z); cyl(0.04, 0.04, s.w, STEEL, ex, s.R + 0.13, s.z, 10, Math.PI / 2);
      box(0.08, s.R + 0.1, s.w, INK, ex + sd * 0.9, (s.R + 0.1) / 2, s.z); for (const zz of [z0, z0 + s.w]) box(s.R + 0.9, s.R + 0.1, 0.05, '#7a5638', ex - sd * 0.4 + sd * 0.45, (s.R + 0.1) / 2, zz); }
    for (const zz of [z0, z0 + s.w]) box(2 * s.F, 0.14, 0.05, '#7a5638', s.cx, 0.08, zz); rect(s.cx - s.F - s.R - 1.0, s.cx + s.F + s.R + 1.0, z0 - 0.1, z0 + s.w + 0.1); }
  // ================= PRACTICE RAIL (west, along z) =================
  const RAIL = { x: -205.6, z0: 65.6, z1: 71.6, y: 0.42 };
  box(1.4, 0.02, 7.6, '#3a3836', RAIL.x, 0.08, (RAIL.z0 + RAIL.z1) / 2); for (const z of [RAIL.z0 + 0.3, RAIL.z1 - 0.3]) box(0.06, RAIL.y, 0.06, INK, RAIL.x, RAIL.y / 2, z);
  cyl(0.035, 0.035, RAIL.z1 - RAIL.z0, YEL, RAIL.x, RAIL.y, (RAIL.z0 + RAIL.z1) / 2, 10, Math.PI / 2); rect(RAIL.x - 0.15, RAIL.x + 0.15, RAIL.z0, RAIL.z1);
  // ================= WORKBENCH + PARTS WALL (east) =================
  const BENCH = V(-193.75, 0.94, 66.2);
  box(1.0, 0.86, 5.2, '#7a5638', -193.0, 0.43, 66.2); box(1.04, 0.05, 5.24, '#c9a77a', -193.0, 0.885, 66.2); rect(-193.55, X1, 63.55, 68.85);
  box(0.06, 1.8, 5.2, '#9a7a52', X1 - 0.08, 2.0, 66.2);   // pegboard
  for (let i = 0; i < 12; i++) for (let j = 0; j < 5; j++) sph(0.012, INK, X1 - 0.12, 1.25 + j * 0.34, 63.8 + i * 0.42);
  const DECKC = { red: { name: 'RED', c: RED }, blue: { name: 'BLUE', c: BLUE }, yellow: { name: 'YELLOW', c: YEL }, green: { name: 'GREEN', c: GREEN } };
  const GRIPC = { black: { name: 'BLACK', c: '#1a1918' }, grey: { name: 'GREY', c: '#8a8780' }, red: { name: 'RED', c: '#b8240e' } };
  const TRUCKC = { silver: { name: 'SILVER', c: STEEL }, gold: { name: 'GOLD', c: '#e6b45a' }, black: { name: 'BLACK', c: DARK } };
  const WHEELC = { white: { name: 'WHITE', c: '#f4f1ec' }, yellow: { name: 'YELLOW', c: YEL }, red: { name: 'RED', c: RED }, blue: { name: 'BLUE', c: '#38bdf8' } };
  const CATS = [{ k: 'deck', name: 'DECK', set: DECKC }, { k: 'grip', name: 'GRIP', set: GRIPC }, { k: 'trucks', name: 'TRUCKS', set: TRUCKC }, { k: 'wheels', name: 'WHEELS', set: WHEELC }];
  // parts: decks hang on the pegboard, grip rolls on the shelf, trucks + wheel trays on the bench back
  const PARTS = { deck: [], grip: [], trucks: [], wheels: [] };
  Object.keys(DECKC).forEach((k, i) => { const z = 63.95 + i * 0.62, p = V(X1 - 0.16, 2.15, z); box(0.03, 0.9, 0.24, DECKC[k].c, p.x, p.y, z); cyl(0.12, 0.12, 0.03, DECKC[k].c, p.x, p.y + 0.45, z, 12, 0, Math.PI / 2); cyl(0.12, 0.12, 0.03, DECKC[k].c, p.x, p.y - 0.45, z, 12, 0, Math.PI / 2); box(0.032, 0.2, 0.2, '#ffffff', p.x - 0.005, p.y, z); PARTS.deck.push({ k, p }); });
  box(0.3, 0.04, 2.2, DARK, X1 - 0.24, 1.48, 67.7);
  Object.keys(GRIPC).forEach((k, i) => { const z = 66.95 + i * 0.6, p = V(X1 - 0.26, 1.62, z); cyl(0.11, 0.11, 0.22, GRIPC[k].c, p.x, p.y, z, 14, Math.PI / 2); cyl(0.04, 0.04, 0.23, '#c9a77a', p.x, p.y, z, 8, Math.PI / 2); PARTS.grip.push({ k, p }); });
  Object.keys(TRUCKC).forEach((k, i) => { const z = 63.95 + i * 0.5, p = V(-192.75, 0.98, z); box(0.36, 0.05, 0.4, INK, p.x, 0.935, z); for (const s of [-1, 1]) { box(0.06, 0.05, 0.2, TRUCKC[k].c, p.x + s * 0.08, 0.99, z); cyl(0.012, 0.012, 0.26, STEEL, p.x + s * 0.08, 0.99, z, 6, Math.PI / 2); } PARTS.trucks.push({ k, p }); });
  Object.keys(WHEELC).forEach((k, i) => { const z = 66.3 + i * 0.6, p = V(-192.75, 0.98, z); box(0.36, 0.05, 0.46, INK, p.x, 0.935, z); for (let j = 0; j < 4; j++) cyl(0.04, 0.04, 0.035, WHEELC[k].c, p.x - 0.08 + (j % 2) * 0.16, 0.98, z - 0.1 + Math.floor(j / 2) * 0.2, 12, Math.PI / 2); PARTS.wheels.push({ k, p }); });
  plane(label('DECKS', INK, YEL, 256, 64, 40), 0.7, 0.18, X1 - 0.12, 2.82, 64.9, -Math.PI / 2); plane(label('GRIP', INK, YEL, 256, 64, 40), 0.6, 0.15, X1 - 0.12, 1.95, 67.55, -Math.PI / 2);
  plane(label('TRUCKS', '#ffffff', INK, 256, 64, 40), 0.5, 0.12, -192.98, 0.96, 64.45, -Math.PI / 2).rotation.x = 0;
  // ---------- front of house: counter, deck wall, hoodie rack, shoe wall, gear hook, sign ----------
  box(3.4, 1.0, 0.8, INK, -204.3, 0.5, 63.4); box(3.44, 0.05, 0.84, YEL, -204.3, 1.02, 63.4); box(0.35, 0.22, 0.3, DARK, -203.2, 1.15, 63.3); rect(-206.05, -202.55, 62.95, 63.85);
  for (let i = 0; i < 9; i++) { const z = 63.0 + i * 0.36 + (i > 4 ? 4.6 : 0); if (z > 72.6) break; const c = [RED, BLUE, YEL, GREEN, '#ffffff', '#7c4dc4', '#e07a24', RED, BLUE][i]; box(0.03, 0.82, 0.22, c, X0 + 0.1, 2.2, z); }
  { const rx = -195.4, rz = 64.2; box(1.6, 0.04, 0.04, STEEL, rx, 1.55, rz); for (const s of [-1, 1]) box(0.04, 1.55, 0.04, STEEL, rx + s * 0.78, 0.78, rz); for (let i = 0; i < 6; i++) box(0.04, 0.62, 0.42, [RED, INK, YEL, BLUE, '#ffffff', GREEN][i], rx - 0.62 + i * 0.25, 1.2, rz); ringC(rx, rz, 0.6); ringC(rx - 0.6, rz, 0.4); ringC(rx + 0.6, rz, 0.4); }
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) box(0.28, 0.13, 0.18, [RED, '#ffffff', INK, YEL][(i + j) % 4], -205.9 + i * 0.32, 1.45 + j * 0.3, Z0 + 0.15);
  box(1.4, 0.04, 0.24, DARK, -205.4, 1.37, Z0 + 0.15); box(1.4, 0.04, 0.24, DARK, -205.4, 1.67, Z0 + 0.15); box(1.4, 0.04, 0.24, DARK, -205.4, 1.97, Z0 + 0.15);
  const HOOK = { x: -193.4, z: 71.0, r: 0.85 }; box(0.06, 1.2, 1.1, '#7a5638', X1 - 0.08, 1.7, HOOK.z); for (let i = 0; i < 3; i++) cyl(0.02, 0.02, 0.14, INK, X1 - 0.16, 2.1, HOOK.z - 0.35 + i * 0.35, 6, 0, Math.PI / 2);
  plane(label('GEAR HOOK', INK, YEL, 320, 64, 36), 0.9, 0.18, X1 - 0.12, 2.45, HOOK.z, -Math.PI / 2); cyl(0.5, 0.5, 0.012, YEL, HOOK.x - 0.2, 0.075, HOOK.z, 22); cyl(0.42, 0.42, 0.014, INK, HOOK.x - 0.2, 0.077, HOOK.z, 22);
  { const T = label("RAIL'S SKATE SHOP", YEL, INK, 768, 96, 60); const s1 = plane(T, 3.0, 0.38, -200, 3.6, 63.8); const s2 = s1.clone(); s2.rotation.y = Math.PI; s2.position.z = 63.79; G.add(s2); for (const x of [-201.4, -198.6]) box(0.01, 0.9, 0.01, DARK, x, 4.25, 63.8); }
  const SPOT = { work: { x: -194.9, z: 69.6, r: 1.0 }, hook: { x: HOOK.x - 0.2, z: HOOK.z, r: 0.85 } };
  cyl(0.5, 0.5, 0.012, YEL, SPOT.work.x, 0.075, SPOT.work.z, 22); cyl(0.42, 0.42, 0.014, INK, SPOT.work.x, 0.077, SPOT.work.z, 22);
  G.add(new THREE.Mesh(R0.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  { const M4 = new THREE.Matrix4(), lm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.25, 0.06, 2.6), new THREE.MeshBasicMaterial({ color: 0xf6f8ff }), 6); [[-204, 65], [-200, 65], [-196, 65], [-204, 72], [-200, 72], [-196, 72]].forEach((p, i) => { M4.makeTranslation(p[0], 4.4, p[1]); lm.setMatrixAt(i, M4); }); G.add(lm); }
  // ================= THE SHOP BOARD (live: deck, grip sheet, trucks, wheels) =================
  const DL = 0.82, DW = 0.24;
  function makeBoard(o = {}) { const g = new THREE.Group(), deckM = new THREE.MeshLambertMaterial({ color: o.deck ? DECKC[o.deck].c : '#d9b26a' }); g.add(new THREE.Group()); const deck = new THREE.Group(); g.add(deck);
    const add = (geo, m, x, y, z, par = deck) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); par.add(me); return me; };
    add(new THREE.BoxGeometry(DW, 0.022, DL - DW), deckM, 0, 0, 0); for (const s of [-1, 1]) { const c = add(new THREE.CylinderGeometry(DW / 2, DW / 2, 0.022, 16, 1, false, 0, Math.PI), deckM, 0, 0.01, s * (DL - DW) / 2); c.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; c.rotation.x = -s * 0.25; }
    const gripM = new THREE.MeshLambertMaterial({ color: o.grip ? GRIPC[o.grip].c : '#1a1918' }), grip = add(new THREE.BoxGeometry(DW - 0.012, 0.004, 1), gripM, 0, 0.013, 0); grip.visible = false;
    const trucks = [], wheels = [], axles = [];
    const B = { g, deck, deckM, gripM, grip, trucks, wheels, axles,
      setGrip(f, over = 1) { grip.visible = f > 0.01; grip.scale.set(over, 1, Math.max(0.001, (DL - 0.06) * f)); grip.position.z = (DL - 0.06) / 2 - (DL - 0.06) * f / 2; },
      addTrucks(k) { const m = LM(TRUCKC[k].c); for (const s of [-1, 1]) { const t = new THREE.Group(); t.position.set(0, -0.03, s * 0.27); deck.add(t); add(new THREE.BoxGeometry(0.06, 0.03, 0.08), m, 0, 0, 0, t); add(new THREE.BoxGeometry(0.2, 0.03, 0.035), m, 0, -0.03, 0, t); const ax = add(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), LM(STEEL), 0, -0.04, 0, t); ax.rotation.z = Math.PI / 2; trucks.push(t); for (const w of [-1, 1]) axles.push({ t, x: w * 0.135, s }); } },
      addWheel(i, k) { const a = axles[i], m = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 14), LM(WHEELC[k].c)); m.rotation.z = Math.PI / 2; m.position.set(a.x, -0.04, 0); a.t.add(m); wheels[i] = m; return m; } };
    if (o.gripOn) B.setGrip(1); if (o.trucks) { B.addTrucks(o.trucks); if (o.wheels) for (let i = 0; i < 4; i++) B.addWheel(i, o.wheels); } return B; }
  // ================= WEARABLES: hoodie + beanie, knee pads =================
  const hoodTex = CT(64, 96, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = YEL; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('8', 24, 40); g.fillStyle = '#2f2d2b'; g.fillRect(8, 62, 48, 18); g.fillStyle = YEL; g.fillRect(0, h - 6, w, 6); });
  function makeHoodie() { const g = new THREE.Group(); const f = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.02), new THREE.MeshLambertMaterial({ map: hoodTex })); f.position.set(0, 0.98, 0.362); f.rotation.x = -0.06; g.add(f);
    for (const s of [-1, 1]) { const sd = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.56, 0.5), LM(INK)); sd.position.set(s * 0.33, 0.98, 0.07); g.add(sd); } const bk = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.02), LM(INK)); bk.position.set(0, 0.99, -0.22); g.add(bk);
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), LM(INK)); hood.position.set(0, 1.28, -0.24); hood.rotation.x = -1.2; g.add(hood);
    for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 5), LM('#ffffff')); st.position.set(s * 0.07, 1.12, 0.375); g.add(st); } g.traverse(o => { o.renderOrder = 2; }); return g; }
  function makeBeanie(c = YEL) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), LM(c)); b.position.set(0, 0.16, -0.02); b.scale.set(1, 0.78, 1); g.add(b);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.305, 0.305, 0.09, 18, 1, true), LM(c === YEL ? '#e0b22a' : '#1a1918')); cuff.position.set(0, 0.18, -0.02); g.add(cuff); const pom = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), LM('#ffffff')); pom.position.set(0, 0.42, -0.02); g.add(pom); g.traverse(o => { o.renderOrder = 2; }); return g; }
  function makePad() { const g = new THREE.Group(); const p = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.13, 0.07), LM(INK)); p.position.set(0, -0.22, 0.1); g.add(p); const s = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 4, 14), LM(RED)); s.position.set(0, -0.22, 0.02); s.rotation.x = Math.PI / 2; g.add(s); g.traverse(o => { o.renderOrder = 2; }); return g; }
  // ---------- RAIL ----------
  const RL_LOOK = { fur: '#e8873a', furDark: '#a8561f', muzzle: '#fff4e8', snout: '#fbe9d6', chin: '#ffffff', fluff: '#ffffff', leg: '#3a3836', boot: '#f3f2f2' };
  const rail = kit.makeFox({ key: 'railSkate', torso: ['#2f6fd6', '#f3f2f2', '#1d3f7a'], outfit: 'vest', mood: 'happy', eyes: ['#2a5a3a', '#2a5a3a'], look: RL_LOOK }); rail.scale.multiply(V(0.9, 1.12, 0.9));
  { const P = rail.userData && rail.userData.P; if (P && P.head) P.head.add(makeBeanie(RED)); if (P && P.legs) P.legs.forEach(l => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.02), LM('#f4d7b4')); b.position.set(0.02, -0.22, 0.1); b.rotation.z = 0.5; b.renderOrder = 2; l.add(b); }); }
  const GS = { idle: [-204.3, 62.6, 0], build: [-193.6, 62.3, Math.PI * 0.95], ramp: [-193.3, 76.0, -Math.PI * 0.56], rail: [-204.2, 64.6, -Math.PI * 0.2] };
  G.add(rail); const rlCol = { c: [0, 0, 0.5] }; cols.push(rlCol);
  const placeRail = k => { const s = GS[k]; rail.position.set(s[0], 0, s[1]); rail.userData.face0 = s[2]; rlCol.c[0] = s[0]; rlCol.c[1] = s[1]; }; placeRail('idle');
  const rlT = { key: 'railSkate', obj: rail, ry: 0, r: 2.4 }, endT = { key: 'skateEnd', obj: rail, ry: 0, r: 8 };
  const LAMPS = [[-204, 65], [-200, 65], [-196, 65], [-204, 72], [-200, 72], [-196, 72]];
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'skate', color: RED, boardTitle: "Rail's best",
    room: { X0, X1, Z0, Z1 }, door: [-200, 61.2], keeper: rail, keeperRy: 0,
    games: [{ k: 'order', name: 'Order', color: RED }], board: { x: -195.0, y: 2.6, z: Z0 + 0.06, ry: 0, w: 1.3 }, hiring: { x: -197.2, z: 62.0, ry: 0 }, hiringLine: 'BUILD · GRIP · RAMP',
    sun: [{ x: -200, z: 62.4, w: 1.8, d: 1.8 }], lamps: LAMPS.map(p => [p[0], 4.3, p[1]]),
    browse: [[-206.6, 64.6, -Math.PI / 2], [-195.4, 63.4, 0], [-198.5, 72.4, 0], [-203.2, 72.4, 0]],
    looks: [['#7c4dc4', '#ede4fb', '#3d2563'], ['#3f9a5e', '#e2f4e8', '#1e5230']], clock: { x: X0 + 0.08, y: 3.1, z: 67.6, ry: Math.PI / 2 } });
  const ln = text => ({ who: 'rail', role: 'RAIL', text });
  const CUST = [
    { name: 'FLICK', forW: 'Skate Park', torso: ['#ffd23a', '#201e1d', '#a16207'], say: 'New setup. Make it fast. Make it loud.' },
    { name: 'TONY', forW: 'Skate Park', torso: ['#ec3013', '#201e1d', '#f3f2f2'], say: 'My students keep snapping decks. Build me a strong one.' },
    { name: 'KIA', forW: 'Item Shop', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], say: 'My first board. Please do not let me fall.' },
    { name: 'MICHAEL JAY', forW: 'Diner regular', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], say: 'I skate to the diner now. Sizzle says it is a phase.' },
    { name: 'MARLA', forW: 'Arena market', torso: ['#f472b6', '#fce7f3', '#9d174d'], say: 'For my nephew. He wants the loudest one you have.' }];
  const custCache = {}; const custFox = i => { if (custCache[i]) return custCache[i]; const C = CUST[i], f = kit.makeFox({ key: 'skCust' + i, torso: C.torso, outfit: 'vest', mood: 'neutral', joints: true }); f.visible = false; G.add(f); custCache[i] = f; return f; };
  // ---------- state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), clack = () => { tone(240, 0.07, 0.08, 'square'); tone(120, 0.06, 0.12, 'triangle'); };
  const rip = () => tone(900 + Math.random() * 600, 0.02, 0.05, 'sawtooth'), ratchet = () => tone(1400, 0.02, 0.03, 'square'), grind = () => tone(180, 0.03, 0.3, 'sawtooth');
  // ---------- prizes + what you wear ----------
  const ART = { gates: { name: '8 GATES', c: RED }, flames: { name: 'FLAMES', c: '#e07a24' }, checker: { name: 'CHECKER', c: INK }, fox: { name: 'FOX', c: '#f2741f' } };
  const artTex = {}; const artFor = k => artTex[k] || (artTex[k] = CT(128, 320, (g, W, H) => {
    if (k === 'gates') { g.fillStyle = RED; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; g.font = '900 170px Archivo, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText('8', W / 2, H / 2 + 8); g.fillStyle = INK; g.fillRect(0, 0, W, 14); g.fillRect(0, H - 14, W, 14); }
    else if (k === 'flames') { g.fillStyle = INK; g.fillRect(0, 0, W, H); for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? YEL : RED; g.beginPath(); g.moveTo(i * 20 - 10, H); g.quadraticCurveTo(i * 20 + 30, H * 0.55, i * 20 + 4, H * (0.15 + (i % 3) * 0.1)); g.quadraticCurveTo(i * 20 + 40, H * 0.6, i * 20 + 30, H); g.fill(); } }
    else if (k === 'checker') { for (let i = 0; i < 4; i++) for (let j = 0; j < 10; j++) { g.fillStyle = (i + j) % 2 ? INK : '#ffffff'; g.fillRect(i * 32, j * 32, 32, 32); } }
    else { g.fillStyle = '#f2741f'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(20, 110); g.lineTo(64, 230); g.lineTo(108, 110); g.closePath(); g.fill(); g.fillStyle = INK; for (const x of [20, 108]) { g.beginPath(); g.moveTo(x, 110); g.lineTo(x + (x < 64 ? 10 : -10), 60); g.lineTo(x + (x < 64 ? 34 : -34), 110); g.fill(); } g.beginPath(); g.arc(64, 226, 8, 0, 7); g.fill(); } }));
  const stickerOwned = () => save.count('stickerPack') > 0;
  const own = () => ({ board: save.count('ownBoard') > 0, outfit: !!save.stat('skOutfit', false), art: save.stat('skArt', null), pads: !!save.stat('skPads', false), wheels: !!save.stat('skWheels', false) });
  const wearNow = () => { const o = own(), w = save.stat('skWear', null) || {}; return { outfit: o.outfit && !!w.outfit, pads: o.pads && !!w.pads }; };
  const setWear = (k, v) => { const w = { ...(save.stat('skWear', null) || {}) }; w[k] = v; save.setStat('skWear', w); };
  function giveGift() { save.setStat('skClears', save.stat('skClears', 0) + 1); const o = own();
    if (!o.board) { save.give('ownBoard'); return { kind: 'board', label: 'YOUR OWN SKATEBOARD' }; }
    if (!o.outfit) { save.setStat('skOutfit', true); setWear('outfit', true); return { kind: 'outfit', label: 'SKATE OUTFIT' }; }
    if (!o.art) { save.setStat('skArt', 'gates'); return { kind: 'art', label: 'CUSTOM DECK ART' }; }
    if (!o.pads) { save.setStat('skPads', true); setWear('pads', true); return { kind: 'pads', label: 'KNEE PADS' }; }
    if (!stickerOwned()) { save.give('stickerPack'); return { kind: 'sticker', label: 'STICKER PACK' }; }
    if (!o.wheels) { save.setStat('skWheels', true); return { kind: 'wheels', label: 'SPEED WHEELS' }; }
    const g2 = Math.round(20 * (stickerOwned() ? 1.25 : 1)); save.addGold(g2); return { kind: 'gold', label: 'BONUS +' + g2 + ' GOLD' }; }
  // the real Meru 2 board (meru2-yards): art plate underneath, speed wheels, pads
  let artPlate = null, wheelTint = false;
  function applyBoard() { if (!yards) return; const o = own(); if (yards.mods) { yards.mods.wheelK = o.wheels ? 1.25 : 1; yards.mods.pads = wearNow().pads; }
    const BV = yards.boardObj && yards.boardObj.userData.V; if (!BV) return;
    if (o.art && BV.deck) { if (!artPlate) { artPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.95), new THREE.MeshLambertMaterial({ map: artFor(o.art), side: THREE.DoubleSide })); artPlate.rotation.x = Math.PI / 2; artPlate.position.y = -0.025; BV.deck.add(artPlate); }
      if (artPlate.userData.k !== o.art) { artPlate.material.map = artFor(o.art); artPlate.material.needsUpdate = true; artPlate.userData.k = o.art; } }
    if (o.wheels && !wheelTint && BV.wheels) { wheelTint = true; BV.wheels.forEach(w => w.traverse(m => { if (m.isMesh && m.material && m.material.color) { m.material = m.material.clone(); m.material.color.set(YEL); } })); } }
  // ---------- cards (Modernist: ground, 2px ink, red bar, flush left) — LEFT, same spot as the other shops ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  const pick = document.createElement('div'); pick.style.cssText = card.style.cssText.replace(/pointer-events:\s*none/, 'pointer-events:auto'); document.body.appendChild(card); document.body.appendChild(pick); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; for (const el of [card, pick]) { el.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; el.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; el.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; el.style.zoom = short ? '0.85' : mid ? '0.82' : ''; } pick.style.overflowY = 'auto'; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const who = C => innerWidth > 900 && innerHeight > 700 ? '<div style="font-weight:900;font-size:15px">' + C.name + '</div><div style="font-size:12px;color:#5a5654;margin-bottom:2px">' + C.forW + '</div><div style="font-size:13px;font-style:italic;margin-bottom:6px">"' + C.say + '"</div>' : '<div style="font-weight:900;font-size:14px;margin-bottom:4px">' + C.name + ' <span style="font-weight:700;font-size:12px;color:#5a5654">' + C.forW + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span></div>';
  const meter = (f, c) => '<div style="position:relative;height:12px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:0;top:0;bottom:0;width:' + (Math.max(0, Math.min(1, f)) * 100).toFixed(1) + '%;background:' + c + '"></div></div>';
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const btnCss = (primary, on, sw) => 'display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;min-height:48px;padding:0 12px;margin-top:6px;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left;cursor:pointer;background:' + (primary ? '#ec3013' : on ? '#201e1d' : '#f3f2f2') + ';color:' + (primary || on ? '#ffffff' : '#201e1d');
  const showPick = (title, right, sub, opts) => { pick.innerHTML = head(title, right) + '<div style="padding:8px 10px 10px">' + (sub ? '<div style="font-size:13px;font-weight:800">' + sub + '</div>' : '') + '</div>'; const body = pick.lastChild;
    opts.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = btnCss(o.primary, o.on); b.innerHTML = (o.sw ? '<span style="width:16px;height:16px;flex:none;border:2px solid #201e1d;background:' + o.sw + '"></span>' : '') + '<span style="flex:1;min-width:0;white-space:normal">' + o.label + '</span>';
      b.addEventListener('click', e => { e.stopPropagation(); o.go(); }); b.addEventListener('pointerdown', e => e.stopPropagation()); body.appendChild(b); }); pick.style.display = 'block'; };
  const hidePick = () => { pick.style.display = 'none'; pick.innerHTML = ''; };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && (t.closest('button,a,input,[role="button"],[aria-label]') || pick.contains(t))) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (busy !== 'job' || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(0); }, true);
  addEventListener('pointermove', e => { if (busy !== 'job' || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(0.016); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearestOf = (list, posOf, k = 1.6) => { let best = null, bd = RAD() * k; for (const o of list) { const d = dist(scrW(posOf(o))); if (d < bd) { bd = d; best = o; } } return best; };
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of J.flies.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(F), 1); F.then && F.then(); } } }
  const keep = o => { J.objs.push(o); G.add(o); return o; };
  // dots to drag along (grip lay, grip trim, wheel spin)
  const dotM = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true }), dotDone = new THREE.MeshBasicMaterial({ color: 0xec3013, depthTest: false, transparent: true }), dotGeo = new THREE.SphereGeometry(touch ? 0.017 : 0.012, 8, 6);
  function makePath(pts) { clearDots(); J.path = { pts: pts.map(p => { const d = new THREE.Mesh(dotGeo, dotM); d.position.copy(p); d.renderOrder = 4; keep(d); return { p, d }; }), i: 0, wob: 0 }; }
  function clearDots() { if (J && J.path) { for (const q of J.path.pts) G.remove(q.d); J.path = null; } }
  function pathHit(dt) { const Pa = J.path; if (!Pa || Pa.i >= Pa.pts.length) return; const R = RAD(); let hit = -1;
    for (let j = Pa.i; j < Math.min(Pa.i + 3, Pa.pts.length); j++) if (dist(scrW(Pa.pts[j].p)) < R * 1.1) hit = j;
    if (hit >= 0) { for (let j = Pa.i; j <= hit; j++) { Pa.pts[j].d.material = dotDone; onPathPoint(j); } Pa.i = hit + 1; }
    else if (ptr.down && dt > 0) { let md = 1e9; for (let j = Math.max(0, Pa.i - 1); j < Pa.pts.length; j++) md = Math.min(md, dist(scrW(Pa.pts[j].p))); if (md > R * 2.6) Pa.wob += dt; } }
  function onPathPoint(j) { if (J.sub === 'lay') { rip(); J.board.setGrip((j + 1) / J.path.pts.length, 1.18); } else if (J.sub === 'trim') { rip(); if (j % 3 === 0) shaving(); } else if (J.sub === 'spin') { ratchet(); const w = J.board.wheels[J.wi]; if (w) w.rotation.x += 1.1; } }
  const shavM = LM('#1a1918'); function shaving() { const s = keep(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.004, 0.08), shavM)); s.position.copy(BENCH).add(V((Math.random() - 0.5) * 0.3, 0.02, (Math.random() - 0.5) * 0.7)); J.shav = J.shav || []; J.shav.push({ s, vy: 0.6, vx: (Math.random() - 0.5) * 0.8 }); }
  // ================= THE ORDER =================
  const addGold = n => { n = Math.max(0, Math.round(n * (stickerOwned() ? 1.25 : 1))); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  const rk = o => { const k = Object.keys(o); return k[Math.floor(Math.random() * k.length)]; };
  function startOrder() { const n = save.stat('skVisits', 0), ci = n % CUST.length, C = CUST[ci]; save.setStat('skVisits', n + 1);
    const order = { deck: rk(DECKC), grip: rk(GRIPC), trucks: rk(TRUCKC), wheels: rk(WHEELC) };
    J = { ci, C, order, step: 1, sub: 'build', ci2: 0, gold: 0, pause: 0, t: 0, st: 0, perfect: 0, wrong: 0, objs: [], flies: [] };
    J.board = makeBoard({}); J.board.g.position.copy(BENCH); J.board.deck.visible = false; keep(J.board.g);
    const f = custFox(ci); f.visible = true; f.position.set(-199.6, 0.02, 68.6); f.rotation.y = Math.PI / 2; f.userData.mood = f.userData.base = 'neutral'; J.cust = f;
    placeRail('build'); busy = 'job'; clack(); toast('STEP 1 OF 5 · BUILD THE BOARD THEY ASKED FOR', 2); }
  // ---- 1 BUILD: tap deck, grip, trucks, wheels ----
  function buildPress() { const cat = CATS[J.ci2]; if (!cat || J.flies.length) return; const p = nearestOf(PARTS[cat.k], q => q.p, 1.8); if (!p) return;
    if (p.k !== J.order[cat.k]) { J.wrong++; nope(); toast('RAIL: "NAH, THEY SAID ' + cat.set[J.order[cat.k]].name + ' ' + cat.name + '."', 1.6); return; }
    pop(); const k = p.k; let tok;
    if (cat.k === 'deck') { tok = makeBoard({ deck: k }); tok.g.position.copy(p.p); tok.g.rotation.set(0, 0, Math.PI / 2); keep(tok.g); fly(tok.g, BENCH, 0.5, 0.3, () => { G.remove(tok.g); J.board.deckM.color.set(DECKC[k].c); J.board.deck.visible = true; clack(); }); const r = tok.g.rotation; J.flies[J.flies.length - 1].spin = r; }
    else { const m = cat.k === 'grip' ? new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 12), LM(GRIPC[k].c)) : cat.k === 'trucks' ? new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.1), LM(TRUCKC[k].c)) : new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12), LM(WHEELC[k].c));
      m.position.copy(p.p); keep(m); const to = BENCH.clone().add(V(0.12, 0.04, cat.k === 'grip' ? -0.62 : cat.k === 'trucks' ? 0.62 : 0.8)); fly(m, to, 0.5, 0.25, () => { tone(880, 0.03, 0.1, 'triangle'); }); J['tok_' + cat.k] = m; if (cat.k === 'grip') J.board.gripM.color.set(GRIPC[k].c); }
    J.ci2++; if (J.ci2 >= CATS.length) { const clean = !J.wrong, g2 = addGold(14 - 2 * J.wrong); if (clean) J.perfect++; ding(); toast((clean ? 'RAIL: "SICK. FIRST TRY."' : 'RAIL: "GOT IT ALL. SICK."') + ' +' + g2, 1.6); NEXT('built', beginGrip, 1.3); } }
  // ---- 2 GRIP: lay tail to nose, then trim the edge ----
  function beginGrip() { J.step = 2; J.st = 0; J.sub = 'lay'; J.wobT = 0; if (J.tok_grip) J.tok_grip.visible = false; J.board.g.updateMatrixWorld(true); const pts = []; for (let i = 0; i < 8; i++) pts.push(J.board.g.localToWorld(V(0, 0.03, DL / 2 - 0.06 - i * (DL - 0.12) / 7))); makePath(pts); toast('STEP 2 OF 5 · DRAG THE GRIP DOWN THE BOARD', 1.8); }
  function gripTick() { const Pa = J.path; if (!Pa || Pa.i < Pa.pts.length) return; J.wobT += Pa.wob;
    if (J.sub === 'lay') { J.board.setGrip(1, 1.18); J.sub = 'trim'; const pts = [], n = 16; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, x = Math.sin(a) * (DW / 2 + 0.02), z = Math.cos(a) * (DL / 2); pts.push(J.board.g.localToWorld(V(x * (Math.abs(Math.cos(a)) > 0.9 ? 0.6 : 1), 0.03, z))); } makePath(pts); toast('NOW TRIM ROUND THE EDGE', 1.4); return; }
    clearDots(); J.board.setGrip(1, 1); const clean = J.wobT < 0.6, g2 = addGold(12 + (clean ? 4 : 0)); if (clean) J.perfect++; ding(); toast((clean ? 'RAIL: "NO BUBBLES. SICK."' : 'RAIL: "LOOKS RAD ANYWAY."') + ' +' + g2, 1.6); NEXT('gripped', beginWheels, 1.2); }
  // ---- 3 WHEELS: flip, trucks on with shop wheels, spin each off, tap the new ones on ----
  function beginWheels() { J.step = 3; J.st = 0; J.sub = 'flip'; clack(); if (J.tok_trucks) J.tok_trucks.visible = false; J.board.addTrucks(J.order.trucks); for (let i = 0; i < 4; i++) J.board.addWheel(i, 'white'); J.flipT = 0; }
  function flipTick(dt) { J.flipT += dt / 0.6; const k = Math.min(1, J.flipT); J.board.g.rotation.z = Math.PI * k; J.board.g.position.y = BENCH.y + Math.sin(k * Math.PI) * 0.25 + 0.06 * k; if (k >= 1) { J.sub = 'spin'; J.wi = 0; J.board.g.updateMatrixWorld(true); spinAt(); toast('STEP 3 OF 5 · SPIN THE OLD WHEELS OFF (DRAG ROUND)', 1.8); } }
  const wheelW = i => { const w = J.board.wheels[i]; J.board.g.updateMatrixWorld(true); return w.getWorldPosition(V()); };
  function spinAt() { const c = wheelW(J.wi), pts = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI * 2; pts.push(c.clone().add(V(0.02, Math.sin(a) * 0.09, Math.cos(a) * 0.09)).add(V(0, 0.04, 0))); } makePath(pts); }
  function spinTick() { const Pa = J.path; if (!Pa || Pa.i < Pa.pts.length) return; J.wobT = (J.wobT || 0) + Pa.wob; const w = J.board.wheels[J.wi], p = wheelW(J.wi); w.parent.remove(w); w.position.copy(p); keep(w); fly(w, V(-192.75, 0.98, 66.3 - 0.4), 0.5, 0.25, () => { w.visible = false; }); pop(); J.wi++;
    if (J.wi < 4) { spinAt(); return; } clearDots(); J.sub = 'fit'; J.fitted = 0; J.fitWrong = 0; if (J.tok_wheels) J.tok_wheels.visible = false; toast('TAP EACH AXLE TO PUT THE NEW WHEELS ON', 1.6); }
  const axleW = a => { J.board.g.updateMatrixWorld(true); return a.t.localToWorld(V(a.x, -0.04, 0)); };
  function fitPress() { const left = J.board.axles.map((a, i) => ({ a, i })).filter(q => !J.board.wheels[q.i] || !J.board.wheels[q.i].parent || J.board.wheels[q.i].parent === G); const q = nearestOf(left, o => axleW(o.a), 2.2); if (!q) return;
    const w = J.board.addWheel(q.i, J.order.wheels); w.scale.setScalar(0.01); J.grow = J.grow || []; J.grow.push(w); clack(); J.fitted++;
    if (J.fitted >= 4) { const clean = (J.wobT || 0) < 0.6, g2 = addGold(14 + (clean ? 2 : 0)); if (clean) J.perfect++; ding(); toast('RAIL: "' + WHEELC[J.order.wheels].name + ' WHEELS. ROLLS LIKE BUTTER. SICK." +' + g2, 1.6); NEXT('wheeled', beginRamp, 1.3); } }
  // ---- 4 MINI RAMP: pump at the bottom, trick in the air ----
  const TRK = ['KICKFLIP', 'HEELFLIP', '360 FLIP'];
  function beginRamp() { J.step = 4; J.st = 0; J.sub = 'ramp'; J.board.g.rotation.z = 0; J.ramp = { ph: 0, A: 0.25, tricks: 0, air: 0, trick: null, flip: 0, bail: 0, last: 0 }; J.board.g.position.set(RMP.cx, 0.15, RMP.z); J.board.g.rotation.set(0, Math.PI / 2, 0); placeRail('ramp'); J.cust.position.set(-206.4, 0.02, 72.2); J.cust.rotation.y = Math.PI / 2;
    toast('STEP 4 OF 5 · TAP AT THE BOTTOM TO PUMP', 2); }
  function rampPos(u, A) { const s = RMP, arc = s.R * Math.PI / 2, d = u * (s.F + Math.min(1, A) * arc), ad = Math.abs(d), sd = Math.sign(d) || 1; if (ad <= s.F) return { x: s.cx + d, y: 0.15, a: 0 }; const a = Math.min(Math.PI / 2, (ad - s.F) / s.R); return { x: s.cx + sd * (s.F + s.R * Math.sin(a)), y: 0.15 + s.R * (1 - Math.cos(a)), a: sd * a }; }
  function rampTick(dt, fox) { const R = J.ramp; R.ph += dt * Math.PI * 2 / 2.8; const u = Math.sin(R.ph), top = Math.abs(u) > 0.88; const p = rampPos(u, R.A);
    if (R.A >= 1 && top) { R.air = Math.min(1, (Math.abs(u) - 0.88) / 0.12); p.y += 1.0 * Math.sqrt(R.air); p.a = 0; } else { if (R.air > 0 && R.trick) { R.trick = null; R.flip = 0; } R.air = 0; }
    if (R.trick) { R.flip += dt * 7; } const b = J.board.g, tuck = jointed(fox) ? R.air * 0.6 : 0; b.position.set(p.x, p.y + 0.22 * tuck, RMP.z); b.rotation.set(0, Math.PI / 2, 0); b.rotateX(-p.a); J.board.deck.rotation.z = R.flip;
    R.dir = Math.cos(R.ph) > 0 ? 1 : -1;
    if (jointed(fox)) { fox.visible = true; fox.position.set(p.x, p.y + DECK_TOP, RMP.z); fox.rotation.set(0, Math.PI, -p.a); const bottom = R.air > 0 ? 0 : Math.max(0, 1 - Math.abs(u) / 0.4);   // front foot toward +x, fakie on the way back
      ride(fox, { air: tuck, flip: R.trick ? Math.min(1, R.flip / 3.5) : 0, mood: R.trick || R.A >= 1 ? 'excited' : 'determined' }, R.dir < 0, J.t, D => { D.drop += 0.07 * bottom * Math.min(1, R.A + 0.3); D.lean += 0.06 * bottom; }); }
    else if (fox) { fox.visible = true; fox.position.set(p.x, p.y + 0.06, RMP.z); fox.rotation.set(0, R.dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0); fox.rotation.z = R.dir * p.a * 0.7; if (R.air > 0) fox.position.y += 0.1 * R.air; }
    R.A = Math.max(0.25, R.A - dt * (R.A >= 1 ? 0.004 : 0.02)); if (Math.random() < 0.1 && R.air === 0) tone(90 + Math.abs(u) * 60, 0.02, 0.08, 'triangle'); }
  function rampPress() { const R = J.ramp, u = Math.sin(R.ph); if (R.air > 0 && R.A >= 1) { if (R.trick) return; const late = R.air > 0.75 && Math.abs(Math.cos(R.ph)) > 0.01 && Math.sign(Math.cos(R.ph)) !== Math.sign(u);
      if (late) { R.A = 0.6; nope(); react('railFx', 'shrug', 1.6); toast('RAIL: "LATE, BRO. PUMP IT BACK UP."', 1.3); return; }
      R.trick = TRK[R.tricks % TRK.length]; R.flip = 0; R.tricks++; clack(); react('railFx', 'cheer', 1.6); react('custFx', 'cheer', 1.4); const g2 = addGold(6); toast(R.trick + '! +' + g2, 1.0); tone(1200, 0.04, 0.2, 'triangle');
      if (R.tricks >= 3) { if (!J.rampMiss) J.perfect++; ding(); NEXT('ramped', beginTest, 1.6); toast('RAIL: "THREE IN A ROW. THAT IS SO SICK."', 1.6); } return; }
    if (Math.abs(u) < 0.35) { R.A = Math.min(1.05, R.A + 0.2); tone(300 + R.A * 400, 0.04, 0.12, 'triangle'); if (R.A >= 1) toast('UP AT THE COPING · TAP IN THE AIR', 1.2); } else { J.rampMiss = (J.rampMiss || 0) + 1; tone(200, 0.02, 0.06, 'square'); } }
  // ---- 5 TRICK TEST on the rail: watch, then copy ----
  const MOVES = { ollie: { name: 'OLLIE', c: YEL }, grind: { name: 'GRIND', c: STEEL }, kickflip: { name: 'KICKFLIP', c: RED }, manual: { name: 'MANUAL', c: BLUE } }, MK = Object.keys(MOVES);
  function beginTest() { J.step = 5; J.st = 0; J.sub = 'demo'; placeRail('rail'); J.board.g.rotation.set(0, 0, 0); J.board.deck.rotation.z = 0; const combo = []; while (combo.length < 3) { const m = MK[Math.floor(Math.random() * MK.length)]; if (combo[combo.length - 1] !== m) combo.push(m); } J.combo = combo; J.ci3 = 0; J.testWrong = 0;
    J.cust.position.set(RAIL.x + 0.5, 0.02, RAIL.z0 - 0.6); J.cust.rotation.y = 0; J.demoT = 0; J.cb = makeBoard({ deck: J.order.deck, grip: J.order.grip, gripOn: true, trucks: J.order.trucks, wheels: J.order.wheels }); keep(J.cb.g);
    J.board.g.position.set(RAIL.x + 0.5, 0.15, RAIL.z0 - 0.8); toast('STEP 5 OF 5 · WATCH ' + J.C.name + "'S COMBO", 2); }
  const moveY = (m, k) => m === 'ollie' || m === 'kickflip' ? Math.sin(k * Math.PI) * 0.5 : m === 'grind' ? RAIL.y : m === 'manual' ? 0 : 0;
  function demoTick(dt) { J.demoT += dt; const T = J.demoT, seg = 1.4, i = Math.floor(T / seg), k = (T % seg) / seg, f = J.cust, b = J.cb.g;
    const z = RAIL.z0 - 0.6 + Math.min(1, T / (seg * 3)) * (RAIL.z1 - RAIL.z0 + 0.6), m = J.combo[Math.min(2, i)], onRail = m === 'grind';
    const x = onRail ? RAIL.x : RAIL.x + 0.5, y = (onRail ? RAIL.y : 0) + (m === 'grind' ? 0 : moveY(m, k)); const jo = jointed(f), o = skO(m, k, i < 3), tk = jo ? (o.air || 0) : 0; if (jo) { f.position.set(x, y + 0.15 + DECK_TOP, z); f.rotation.set(0, Math.PI / 2, 0); } else { f.position.set(x, y + 0.2, z); f.rotation.set(0, 0, 0); } b.position.set(x, y + 0.15 + 0.22 * tk, z); b.rotation.set(m === 'manual' ? -0.35 : 0, onRail ? Math.PI / 2 * 0.15 : 0, m === 'kickflip' ? k * Math.PI * 2 : 0); kit.animFox && kit.animFox(f, dt, 0); if (jo) ride(f, o, false, J.t);
    if (i !== J.lastI) { J.lastI = i; if (i < 3) { m === 'grind' ? grind() : clack(); toast(J.C.name + ' · ' + MOVES[m].name, 1.0); } }
    if (T > seg * 3 + 0.6) { unride(f); f.position.set(RAIL.x + 2.2, 0.02, RAIL.z0 - 0.4); f.rotation.y = -Math.PI * 0.75; b.position.set(RAIL.x + 2.6, 0.15, RAIL.z0 - 0.7); J.sub = 'copy'; J.copyT = 0; J.moveK = 1; askMove(); } }
  function askMove() { hideCard(); const opts = MK.map(m => ({ label: MOVES[m].name, sw: MOVES[m].c, go: () => copyMove(m) })); showPick('MOVE ' + (J.ci3 + 1) + ' OF 3', 'COPY ' + J.C.name, 'What came ' + ['first', 'next', 'last'][J.ci3] + '?', opts); }
  function copyMove(m) { if (J.pause > 0 || J.sub !== 'copy' || J.moveK < 1) return; const want = J.combo[J.ci3];
    if (m !== want) { J.testWrong++; nope(); react('railFx', 'no', 1.4); toast('RAIL: "IT WAS ' + MOVES[want].name + ', BRO."', 1.4); m = want; }
    if (m === want && !J.railFx) react('railFx', 'nod', 1.2); J.cur = m; J.moveK = 0; m === 'grind' ? grind() : clack(); const g2 = addGold(5); toast(MOVES[m].name + ' +' + g2, 0.9); }
  function copyTick(dt, fox) { const b = J.board.g, seg = (RAIL.z1 - RAIL.z0 + 0.6) / 3, z = RAIL.z0 - 0.6 + (J.ci3 + Math.min(1, J.moveK)) * seg;
    if (J.moveK < 1) { J.moveK = Math.min(1, J.moveK + dt / 1.2); if (J.moveK >= 1) { J.ci3++; if (J.ci3 >= 3) { hidePick(); const clean = !J.testWrong; if (clean) J.perfect++; ding(); toast((clean ? 'RAIL: "PERFECT COPY. YOU ARE SICK."' : 'RAIL: "LANDED IT. SICK."'), 1.6); NEXT('tested', beginPay, 1.4); } else askMove(); } }
    const m = J.cur, k = J.moveK, onRail = m === 'grind' && k < 1, x = onRail ? RAIL.x : RAIL.x + 0.5, y = (onRail ? RAIL.y : 0) + (m && k < 1 && m !== 'grind' ? moveY(m, k) : 0);
    const o = skO(m, k, k < 1), tk = jointed(fox) ? (o.air || 0) : 0; b.position.set(x, y + 0.15 + 0.22 * tk, z); b.rotation.set(m === 'manual' && k < 1 ? -0.35 : 0, 0, m === 'kickflip' && k < 1 ? k * Math.PI * 2 : 0);
    if (jointed(fox)) { fox.visible = true; fox.position.set(x, y + 0.15 + DECK_TOP, z); fox.rotation.set(0, Math.PI / 2, 0); ride(fox, o, false, J.t); } else if (fox) { fox.visible = true; fox.position.set(x, y + 0.2, z); fox.rotation.set(0, 0, 0); } }
  function beginPay() { J.sub = 'pay'; J.t = 0; const C = J.C, f = J.cust; f.userData.mood = f.userData.base = 'happy'; if (!jointed(f)) f.userData.hop = 1; f.position.set(RAIL.x + 1.4, 0.02, RAIL.z1 + 0.3); f.rotation.y = -Math.PI * 0.6; J.cb.g.visible = false;
    const g2 = addGold(20); tone(523, 0.05, 0.4); tone(659, 0.05, 0.5); tone(784, 0.05, 0.7); const O = J.order;
    setCard('pay', head('BOARD DONE', '+' + J.gold + ' GOLD') + '<div style="padding:8px 10px 10px">' + who(C) + row(DECKC[O.deck].c, DECKC[O.deck].name + ' DECK', '\u2713', true) + row(GRIPC[O.grip].c, GRIPC[O.grip].name + ' GRIP', '\u2713', true) + row(TRUCKC[O.trucks].c, TRUCKC[O.trucks].name + ' TRUCKS', '\u2713', true) + row(WHEELC[O.wheels].c, WHEELC[O.wheels].name + ' WHEELS', '\u2713', true)
      + '<div style="font-size:13px;font-style:italic;padding-top:6px">"' + ['It is perfect. I am never walking again.', 'Rail, your helper is legit.', 'Sick! Wait, am I allowed to say sick?'][J.ci % 3] + '"</div></div>'); toast(C.name + ' PAYS · +' + g2 + ' GOLD', 2.2); }
  function endOrder() { const C = J.C, gold = J.gold, pf = J.perfect, perfect = pf >= 4, gift = giveGift(), first = !K.stars('order'); save.best('skBest', gold); stop();
    K.finish('order', pf >= 4 ? 3 : pf >= 2 ? 2 : 1, gold, first);
    const nm = C.name.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    const OPEN = [nm + ' rolled out stoked. ' + gold + ' gold, bro.', 'Sick order. ' + gold + ' gold.', gold + ' gold. ' + nm + ' is stoked.', 'Board done, customer happy. ' + gold + ' gold.'][save.stat('skClears', 1) % 4];
    const GIFT = { board: 'Your own board! Tap it in ITEMS anywhere in town.', outfit: 'Hoodie and beanie! The gear hook takes them off.', art: 'Custom deck art. Pick one.', pads: 'Knee pads. Bail and keep your speed.',
      sticker: 'Sticker pack: a quarter more gold here.', wheels: 'Speed wheels. A quarter quicker.', gold: 'You own every prize. Bonus gold.' }[gift.kind];
    toast('ORDER DONE · +' + gold + ' GOLD · ' + gift.label, 3.5);
    sayTo(endT, [ln(OPEN + ' ' + GIFT + (perfect ? ' Zero mistakes. Sick!' : ''))]);
    if (gift.kind === 'art') setTimeout(() => artPick(), 600); }
  function artPick() { busy = 'art'; const cur = own().art; showPick('DECK ART', 'YOUR BOARD', 'Pick a design for under your deck.', [...Object.keys(ART).map(k => ({ label: ART[k].name + (cur === k ? ' · ON' : ''), sw: ART[k].c, on: cur === k, go: () => { save.setStat('skArt', k); tone(880, 0.04, 0.2, 'triangle'); artPick(); } })), { label: 'DONE', primary: true, go: () => { hidePick(); busy = null; toast('DECK ART · ' + ART[own().art].name, 1.6); } }]); }
  function jobTick(dt, fox) { J.t += dt; J.st += dt; if (J.flies.length) flyTick(dt);
    if (J.path) J.path.pts.forEach((q, j) => { q.d.scale.setScalar(j === J.path.i ? 1.3 + 0.3 * Math.sin(J.t * 9) : 1); });   // s69: the next dot pulses
    if (J.grow) for (const w of J.grow.slice()) { const s = Math.min(1, w.scale.x + dt * 5); w.scale.setScalar(s); if (s >= 1) J.grow.splice(J.grow.indexOf(w), 1); }
    if (J.shav) for (const q of J.shav.slice()) { q.vy -= dt * 3; q.s.position.y += q.vy * dt; q.s.position.x += q.vx * dt; if (q.s.position.y < 0.08) { q.s.position.y = 0.08; J.shav.splice(J.shav.indexOf(q), 1); } }
    if (J.cust && J.sub !== 'demo') { kit.animFox && kit.animFox(J.cust, dt, 0); const s0 = J.sub; play(J.cust, J.custFx ? J.custFx.name : s0 === 'pay' ? 'cheer' : s0 === 'ramp' || s0 === 'ramped' ? 'clap' : 'lane_watch', dt); }
    for (const w of ['railFx', 'custFx']) if (J[w] && (J[w].t -= dt) <= 0) J[w] = null; J.fox = fox;
    if (J.sub === 'ramp' || J.sub === 'ramped') rampTick(dt, fox); else if (J.sub === 'copy' || J.sub === 'tested') copyTick(dt, fox); else if (fox) { unride(fox); fox.visible = false; }
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } drawCard(); return; }
    const s = J.sub; if (s === 'lay' || s === 'trim') gripTick(); else if (s === 'flip') flipTick(dt); else if (s === 'spin') spinTick(); else if (s === 'demo') demoTick(dt);
    else if (s === 'pay' && J.t > 3.2) { endOrder(); return; } if (J) drawCard(); }
  function press() { if (!J || J.pause > 0) return; const s = J.sub; if (s === 'build') buildPress(); else if (s === 'fit') fitPress(); else if (s === 'ramp') rampPress(); }
  function drag(dt) { if (!J || J.pause > 0) return; const s = J.sub; if (s === 'lay' || s === 'trim' || s === 'spin') pathHit(dt); }
  // ---- the order card ----
  const STEP_N = ['BUILD', 'GRIP', 'WHEELS', 'RAMP', 'RAIL'];
  const strip = n => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + STEP_N.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 2px;font-size:10px;font-weight:900;border:2px solid #201e1d;overflow:hidden;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  function drawCard() { if (!J || J.sub === 'pay' || J.sub === 'copy' || J.sub === 'tested') return; const s = J.sub, O = J.order; let next = 'SICK', det = '', key = s + J.step;
    if (s === 'build') { key += J.ci2 + '_' + J.wrong; const cat = CATS[J.ci2]; next = cat ? 'TAP THE ' + cat.set[O[cat.k]].name + ' ' + cat.name : 'NICE'; det = CATS.map((c, i) => row(c.set[O[c.k]].c, c.set[O[c.k]].name + ' ' + c.name, i < J.ci2 ? '\u2713' : i === J.ci2 ? 'NOW' : '\u2014', i < J.ci2)).join(''); }
    else if (s === 'lay' || s === 'trim') { const i = J.path ? J.path.i : 0; key += i; next = s === 'lay' ? 'DRAG ALONG THE DOTS, TAIL TO NOSE' : 'DRAG ROUND THE EDGE TO TRIM'; det = row(GRIPC[O.grip].c, 'LAY THE GRIP', s === 'trim' ? '\u2713' : i + '/8', s === 'trim') + row(GRIPC[O.grip].c, 'TRIM THE EDGE', s === 'trim' ? i + '/16' : '\u2014', false); }
    else if (s === 'flip' || s === 'spin' || s === 'fit') { const i = J.path ? J.path.i : 0; key += (J.wi || 0) + '_' + i + '_' + (J.fitted || 0); next = s === 'fit' ? 'TAP AN EMPTY AXLE' : 'DRAG ROUND THE WHEEL TO SPIN IT OFF'; det = row('#f4f1ec', 'SHOP WHEELS OFF', Math.min(4, J.wi || 0) + '/4', (J.wi || 0) >= 4) + row(WHEELC[O.wheels].c, WHEELC[O.wheels].name + ' WHEELS ON', (J.fitted || 0) + '/4', (J.fitted || 0) >= 4); }
    else if (s === 'ramp') { const R = J.ramp; key += Math.round(R.A * 20) + '_' + R.tricks + (R.air > 0 ? 'a' : ''); next = R.A >= 1 ? 'TAP IN THE AIR FOR A TRICK' : 'TAP AS YOU ROLL THROUGH THE BOTTOM'; det = lab('PUMP') + meter(R.A, YEL) + row(RED, 'TRICKS', R.tricks + '/3', R.tricks >= 3); }
    else if (s === 'demo') { const i = Math.min(2, Math.floor(J.demoT / 1.4)); key += i; next = 'WATCH CLOSELY'; det = J.combo.map((m, j) => row(j <= i ? MOVES[m].c : '#cfcac3', j <= i ? MOVES[m].name : '?', j + 1 + '', false)).join(''); }
    else return;
    setCard(key, head('STEP ' + J.step + ' OF 5', STEP_N[J.step - 1] + (J.gold ? ' · ' + J.gold + ' G' : '')) + foot(next) + '<div style="padding:8px 10px 10px">' + who(J.C) + (innerHeight >= 720 ? strip(J.step) : '') + det + '</div>'); }
  function stop() { busy = null; if (J) { unride(J.fox); unride(J.cust); clearDots(); J.objs.forEach(o => o.parent && o.parent.remove(o)); if (J.cust) { J.cust.visible = false; J.cust.userData.mood = J.cust.userData.base = 'neutral'; } } J = null; ptr.down = false; hideCard(); hidePick(); placeRail('idle'); }
  // ================= GEAR HOOK =================
  function startHook(P) { busy = 'hook'; Object.assign(P, { x: SPOT.hook.x, z: SPOT.hook.z, yaw: -Math.PI / 2, sp: 0 }); hookPanel(); }
  function hookPanel() { const o = own(), w = wearNow(), tg = k => { setWear(k, !w[k]); tone(880, 0.04, 0.2, 'triangle'); hookPanel(); };
    showPick('GEAR HOOK', 'RAIL', 'WHAT YOU WEAR IN MERU', [...(o.outfit ? [{ label: 'HOODIE + BEANIE · ' + (w.outfit ? 'ON' : 'OFF'), on: w.outfit, go: () => tg('outfit') }] : []), ...(o.pads ? [{ label: 'KNEE PADS · ' + (w.pads ? 'ON' : 'OFF'), on: w.pads, go: () => tg('pads') }] : []),
      ...(o.art ? [{ label: 'DECK ART · ' + ART[o.art].name, go: () => { hidePick(); artPick(); } }] : []), { label: 'DONE', primary: true, go: () => { hidePick(); busy = null; toast('LOOKING SICK', 1.4); } }]); }
  let worn = null;
  function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P) return; const w = wearNow(), key = (w.outfit ? 1 : 0) + '|' + (w.pads ? 1 : 0);
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox)) return;
    if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: [] }; const P = U.P;
    if (w.outfit && P.body) { const h = makeHoodie(); P.body.add(h); worn.parts.push(h); } if (w.outfit && P.head) { const b = makeBeanie(YEL); P.head.add(b); worn.parts.push(b); }
    if (w.pads && P.legs) P.legs.forEach(l => { const p = makePad(); l.add(p); worn.parts.push(p); }); }
  // your own board from the ITEMS (calls the park board to your feet)
  function useItem(id, P) { if (id !== 'ownBoard' || !save.count('ownBoard') || !yards || !yards.summon) return false; if (P.car || P.boat || P.ab || P.swim || P.skate || P.tank || busy) { toast('NOT HERE', 1.2); return true; }
    yards.summon(P); clack(); toast('YOUR BOARD · 3 OLLIE · 2 TRICK · E STEP OFF', 2.6); return true; }
  // ---------- camera ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false }, hp = V();
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  function shot(fox) { if ((busy === 'hook' || busy === 'art') && fox) { fox.getWorldPosition(hp); return [hp.clone().setY(0.9), 1.4, 2.4, 0.15, 3.6, -Math.PI / 2, 4.4]; } if (busy !== 'job' || !J) return null; const s = J.sub;
    if (s === 'build' || s === 'built') return [V(-193.4, 1.5, 66.2), 5.2, 2.4, 0.2, 3.2, -Math.PI / 2, 8];
    if (s === 'lay' || s === 'trim' || s === 'gripped' || s === 'flip' || s === 'spin' || s === 'fit' || s === 'wheeled') return [BENCH.clone().add(V(0, 0.05, 0)), 0.55, 1.0, 1.2, 1.1, -Math.PI / 2, 1.8];
    if (s === 'ramp' || s === 'ramped') return [V(RMP.cx, 1.2, RMP.z), 12, 3.4, 0.2, 7, Math.PI, 16];
    if (s === 'demo' || s === 'copy' || s === 'tested') return [V(RAIL.x, 0.7, (RAIL.z0 + RAIL.z1) / 2), 7.0, 1.8, 0.22, 4.5, Math.PI / 2, 11];
    return [V(RAIL.x + 1, 1.0, RAIL.z1), 3, 2, 0.2, 3.5, Math.PI / 2, 6]; }
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt, fox) { const v = shot(fox); if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.08; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
    fitCam(v);
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.set(Math.max(X0 + 0.35, Math.min(X1 - 0.35, camCur.pos.x)), Math.min(4.0, camCur.pos.y), Math.max(Z0 + 0.35, Math.min(Z1 - 0.35, camCur.pos.z))); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- HINT HAND: no input for 3 s → a pointer shows the next spot ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTarget = () => { if (busy !== 'job' || !J || J.pause > 0 || ptr.down || J.flies.length) return null; const s = J.sub;
    if (s === 'build') { const cat = CATS[J.ci2]; if (!cat) return null; const p = PARTS[cat.k].find(q => q.k === J.order[cat.k]); return [p.p, 'TAP THE ' + cat.set[J.order[cat.k]].name + ' ' + cat.name]; }
    if ((s === 'lay' || s === 'trim' || s === 'spin') && J.path && J.path.i < J.path.pts.length) return [J.path.pts[J.path.i].p, s === 'lay' ? 'DRAG ALONG THE DOTS' : s === 'trim' ? 'DRAG ROUND THE EDGE' : 'DRAG ROUND THE WHEEL'];
    if (s === 'fit') { const i = J.board.axles.findIndex((a, k) => !J.board.wheels[k] || !J.board.wheels[k].parent || J.board.wheels[k].parent === G); return i >= 0 ? [axleW(J.board.axles[i]), 'TAP THE AXLE'] : null; }
    if (s === 'ramp') { const R = J.ramp, bp = J.board.g.position.clone(); if (R.A < 1) return Math.abs(Math.sin(R.ph)) < 0.35 ? [bp, 'TAP NOW · PUMP'] : null; return R.air > 0.15 && !R.trick ? [bp, 'TAP NOW · TRICK'] : null; }
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; } const p = h[0].clone().project(camera); if (p.z > 1) { HINT.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 && P.x < X1 && P.z > Z0 - 0.3 && P.z < Z1 + 0.3 && (P.y || 0) < 2.5;
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r;
  const hasWear = () => { const o = own(); return o.outfit || o.pads || o.art; };
  function prompt(P) { if (busy || !inShop(P) || P.skate) return null; if (at(P, SPOT.work)) return 'NEXT ORDER · BUILD, GRIP, WHEELS, RAMP, RAIL'; if (at(P, SPOT.hook) && hasWear()) return 'GEAR HOOK · WHAT YOU WEAR'; if (K.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, rlT)) return 'TALK · RAIL'; return null; }
  // s69: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const HELLO = ["Yo! Rail's Skate Shop. Decks, grip, wheels, the works. Wanna build a board with me?", 'Back again, bro? The yellow mark by the bench is free.', 'Got a customer waiting. Wanna build one? Sick.', "Ramp's waxed, rail's greased. Sick day to work."];
  const TIPS = ['Grip tape is like a sticker you stand on. Sick, right?', 'These knees? Eleven-stair set at the park. I landed it. Eventually.', 'Tony at the park taught me everything. Then I taught him the heelflip.',
    'Big Tall next door climbs walls. I ride them. Basically the same.', 'Pump at the bottom of the ramp, not the top. Trust me, bro.'];
  let lastP = null; const goWork = P => { if (P) Object.assign(P, { x: SPOT.work.x, z: SPOT.work.z, sp: 0 }); startOrder(); };
  const railMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) goWork(lastP); } },
      ...(hasWear() ? [{ text: 'THE GEAR HOOK', pick: () => { if (!busy && lastP) startHook(lastP); } }] : []),
      { text: 'A SKATE TIP, PLEASE', pick: () => sayTo(rlT, [ln(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(rlT, [{ ...ln(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { lastP = P; if (busy) return true; if (!inShop(P) || P.skate) return false;
    if (at(P, SPOT.work)) { startOrder(); return true; }
    if (at(P, SPOT.hook) && hasWear()) { startHook(P); return true; }
    if (K.atHiring(P)) { ding(); goWork(P); return true; }
    if (!near(P, rlT)) return false; clack(); railMenu(!talked++); return true; }
  function quit() { if (busy === 'hook' || busy === 'art') { hidePick(); busy = null; return; } stop(); toast('ORDER CANCELLED · GOLD KEPT', 2); }
  function tick(dt, P, fox) { const t = performance.now() / 1000, d = Math.hypot(P.x - CX, P.z - CZ); G.visible = d < (touch ? 45 : 90); toastT -= dt; applyWear(fox); applyBoard();
    if (busy === 'job' && !inShop(P)) stop();
    if (!G.visible) return; lastP = P; if (busy === 'job' && J) jobTick(dt, fox); hintTick(t);
    if (busy === 'job') { const f0 = rail.userData.face0 ?? 0; rail.rotation.y += Math.atan2(Math.sin(f0 - rail.rotation.y), Math.cos(f0 - rail.rotation.y)) * Math.min(1, dt * 3); }
    K.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: d, talking: busy === 'job' });
    if (busy === 'job' && J) { const s0 = J.sub; play(rail, J.railFx ? J.railFx.name : s0 === 'pay' ? 'cheer' : s0 === 'ramp' || s0 === 'ramped' ? 'clap' : s0 === 'demo' || s0 === 'copy' || s0 === 'tested' ? 'lane_watch' : 'think', dt); } else unride(rail); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, startOrder, rail, camera, save, useItem,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(0); ptr.down = false; }, dragTo(x, y, dt = 0.05) { ptr.down = true; ptr.x = x; ptr.y = y; drag(dt); }, release() { ptr.down = false; }, copy: m => copyMove(m),
    targets() { if (!J) return []; if (J.path) return J.path.pts.slice(J.path.i).map(q => scrW(q.p)); if (J.sub === 'build') { const cat = CATS[J.ci2]; return cat ? [scrW(PARTS[cat.k].find(q => q.k === J.order[cat.k]).p)] : []; }
      if (J.sub === 'fit') return J.board.axles.filter((a, i) => !J.board.wheels[i] || J.board.wheels[i].parent === G || !J.board.wheels[i].parent).map(a => scrW(axleW(a))); return []; },
    skipTo(s) { if (!J) startOrder(); J.pause = 0; J.after = null; J.flies.length = 0; clearDots(); J.board.deckM.color.set(DECKC[J.order.deck].c); J.board.deck.visible = true; J.board.gripM.color.set(GRIPC[J.order.grip].c); J.ci2 = 4;
      if (s === 'grip') beginGrip(); else { J.board.setGrip(1); beginWheels(); J.board.g.rotation.z = Math.PI; J.board.g.position.y = BENCH.y + 0.06; J.sub = 'spin'; J.wi = 0; spinAt();
        if (s === 'ramp' || s === 'rail') { clearDots(); J.board.wheels.forEach((w, i) => { w.parent && w.parent.remove(w); J.board.addWheel(i, J.order.wheels); }); beginRamp(); if (s === 'rail') beginTest(); } } },
    hiring: K, dispose() { card.remove(); pick.remove(); HINT.remove(); K.dispose(); } };
  window.__skate = API; return API;
}
