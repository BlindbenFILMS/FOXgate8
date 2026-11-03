// MERU 2.0 — s125 PERMIT OFFICE DELUXE PART A1 (Ben's answers s123). The Permit Office [meruPermitOffice] was an empty city shell
// (f -262..-248 × -38..-26, door S at (-255, -26)); it is now Spade's office: the COUNTER across the room (way round its east end, as the 2D),
// the PIGEONHOLES on the back wall under PERMITS, the MAIL TABLE on the west wall, a map chest, map tubes, kettle, bench, coat stand.
// SPADE (2D look) behind the counter; his 2D permit talk (meru-ruins.js DYN.spade, verbatim) is THE DIG PERMIT in his menu.
// A1 jobs: STAMP THE PERMITS · FILE THE PAPERS · SORT THE MAIL · SPOT THE FORGED PERMIT (tap, fixed camera) · FIND THE LOST MAP (walk + E, hot / cold).
// A2 (s126, worlds/meru2-permit-jobs2.js): FIELD JOBS outdoors: survey a plot (stakes + string) · read the theodolite · deliver a permit to the desert dig team.
// Built in the ORIGINAL frame; meru2-walk.js adds API.group to RL.MV 'permit' if the town layout moved it. Stats prefix mpo.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { pmJobsA2 } from './meru2-permit-jobs2.js';
import { pmDig } from './meru2-permit-dig.js';   // s126 part B: the DIG PERMIT (four desert sites, 7-day permit, renewals, the 2D DUNEGLASS DIG)
const SP = { name: 'Spade', role: 'PERMIT OFFICE', color: '#6b552f', torso: ['#d9c39a', '#a98a5c', '#6b552f'],
  hello: ['Spade. Permits, stamps, and sand in everything.', 'Back again? The forms never stop.', 'Mind the ink. It does not come out of fur.'],
  tips: ['Read the colour first. The words can wait.', 'File by the FIRST letter of the surname.', 'A real permit: eight-point gold seal, red ink, my name.', 'Smudged address? Return to sender.', 'Lost things hide near where they were last used.'] };
export function buildPermitJobs({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted, ground, openPanel }) { const JW = jobWorker(THREE);
  const mutedQ = () => { try { return !!(isMuted && isMuted()); } catch (e) { return true; } };
  const OFF = { X0: -261.8, X1: -248.2, Z0: -37.8, Z1: -26.2 }, DOOR = [-255, -26];
  const ROOT = new THREE.Group(); ROOT.name = 'permitRoot'; scene.add(ROOT); const G = new THREE.Group(); G.name = 'permitJobs'; ROOT.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.random() * a.length | 0];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const toW = v => { G.updateWorldMatrix(true, false); return G.localToWorld(v.clone()); };
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const colF = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), colC = (x, z, r) => cols.push({ c: [x, z, r] });
  const plane = (tex, w, h, x, y, z, ry = 0, par = G, tr = true) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: tr })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const flat = (tex, w, d, x, y, z, par = G) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 3; par.add(m); return m; };
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 10) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 512, h = 96, fs = 54) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 18, H / 2 + 2, W - 36, fs); });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#d7ad52', PAPER = '#efe6cf', WOOD = '#8a6440', WOODD = '#4a3520', WOODL = '#b08a5a';
  // ---------- merged static geometry (one mesh: phone budget) ----------
  const MG = (() => { const pos = [], nor = [], col = [], cc = new THREE.Color();
    const put = (geo, hex, x, y, z, ry = 0, rx = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(1, 1, 1))); const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    return { put, b: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), hex, x, y, z, ry, rx, rz), c: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), hex, x, y, z, 0, rx, rz),
      done() { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); const m = new THREE.Mesh(g0, new THREE.MeshLambertMaterial({ vertexColors: true })); G.add(m); return m; } }; })();
  // ================= floor + rug =================
  const plankT = CT(256, 256, (g, w) => { for (let i = 0; i < 8; i++) { const s = 0.85 + Math.random() * 0.15; g.fillStyle = 'rgb(' + (176 * s | 0) + ',' + (132 * s | 0) + ',' + (88 * s | 0) + ')'; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(60,40,20,0.5)'; g.fillRect(0, i * 32, w, 2); g.fillRect(((i * 97) % 200) + 20, i * 32, 2, 32); } });
  plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping; plankT.repeat.set(5, 4);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(13.6, 11.6), new THREE.MeshLambertMaterial({ map: plankT, polygonOffset: true, polygonOffsetFactor: -1 })); f.rotation.x = -Math.PI / 2; f.position.set(-255, 0.05, -32); G.add(f); }
  const RUG = { x: -255, z: -28.4 }; MG.b(2.4, 0.02, 1.6, '#7a2f22', RUG.x, 0.065, RUG.z); MG.b(2.1, 0.022, 1.3, '#c42d3c', RUG.x, 0.07, RUG.z);
  // ================= the COUNTER (x -260.5..-251.5, way round the east end) =================
  const CN = { x0: -260.5, x1: -251.5, z: -33.0, y: 1.065 }; { const cx = (CN.x0 + CN.x1) / 2, w = CN.x1 - CN.x0;
    MG.b(w, 1.0, 0.8, WOOD, cx, 0.5, CN.z); MG.b(w + 0.2, 0.06, 0.95, WOODD, cx, 1.03, CN.z); MG.b(w, 0.12, 0.04, WOODD, cx, 0.08, CN.z + 0.41); for (let i = 0; i < 6; i++) MG.b(0.05, 0.86, 0.03, WOODD, CN.x0 + 0.3 + i * (w - 0.6) / 5, 0.52, CN.z + 0.41);
    MG.b(w - 0.2, 0.012, 0.8, '#e7dcc2', cx, 1.066, CN.z); colF(CN.x0 - 0.1, CN.x1 + 0.1, CN.z - 0.48, CN.z + 0.48);
    plane(label('PERMITS \u00b7 STAMPED WHILE YOU WAIT', WOODD, '#f0d5a6', 1024, 96, 48), 2.8, 0.26, cx, 0.62, CN.z + 0.43, 0, G, false); }
  // ================= back wall: PIGEONHOLES (A-L) under PERMITS, kettle, map chest, plant =================
  const PH = { x0: -260.8, x1: -258.6, z: -37.55, cols: 4, rows: 3, w: 0.55, h: 0.42, y0: 0.94 }; const phC = (i, j) => V(PH.x0 + (i + 0.5) * PH.w, PH.y0 + (PH.rows - j - 0.5) * PH.h, PH.z);
  { const cx = (PH.x0 + PH.x1) / 2, H = PH.rows * PH.h; MG.b(2.3, 0.94, 0.45, WOODD, cx, 0.47, -37.57); MG.b(2.3, H + 0.08, 0.04, '#2b1f14', cx, PH.y0 + H / 2, -37.78);
    for (let i = 0; i <= PH.cols; i++) MG.b(0.04, H + 0.08, 0.45, WOOD, PH.x0 + i * PH.w, PH.y0 + H / 2, -37.57); for (let j = 0; j <= PH.rows; j++) MG.b(2.24, 0.04, 0.45, WOOD, cx, PH.y0 + j * PH.h, -37.57);
    for (let i = 0; i < PH.cols; i++) for (let j = 0; j < PH.rows; j++) { const p = phC(i, j); for (let k = 0; k < 1 + ((i + j) % 3); k++) MG.b(0.42, 0.02, 0.3, PAPER, p.x, p.y - PH.h / 2 + 0.03 + k * 0.025, -37.6); } colF(PH.x0 - 0.1, PH.x1 + 0.1, -37.8, -37.3); }
  const PHL = 'ABCDEFGHIJKL'.split(''); PHL.forEach((L, n) => { const i = n % PH.cols, j = n / PH.cols | 0, p = phC(i, j); plane(label(L, YEL, INK, 64, 48, 40), 0.13, 0.1, p.x - 0.18, p.y - PH.h / 2 + 0.07, -37.33, 0, G, false); });
  plane(label('PERMITS', WOODD, '#f0d5a6', 512, 112, 82), 2.4, 0.52, -255, 2.75, -37.76, 0, G, false);
  const KT = { x: -257.2, z: -37.45 }; MG.b(0.8, 0.9, 0.55, WOOD, KT.x, 0.45, KT.z); MG.c(0.11, 0.13, 0.22, '#3a4a5a', KT.x - 0.15, 1.01, KT.z, 12); MG.b(0.14, 0.03, 0.03, '#3a4a5a', KT.x - 0.01, 1.05, KT.z); for (const dx of [0.12, 0.27]) MG.c(0.045, 0.04, 0.1, WHITE, KT.x + dx, 0.95, KT.z + 0.05, 10); colF(KT.x - 0.42, KT.x + 0.42, -37.8, KT.z + 0.3);
  const MC = { x: -252.4, z: -37.4 }; MG.b(1.4, 1.0, 0.8, WOODD, MC.x, 0.5, MC.z); for (let k = 0; k < 4; k++) { MG.b(1.3, 0.2, 0.02, WOOD, MC.x, 0.14 + k * 0.23, MC.z + 0.41); MG.b(0.2, 0.03, 0.03, GOLD, MC.x, 0.17 + k * 0.23, MC.z + 0.43); } colF(MC.x - 0.72, MC.x + 0.72, -37.8, MC.z + 0.42);
  plane(label('MAPS', WOODD, '#f0d5a6', 256, 80, 54), 0.5, 0.16, MC.x, 1.12, MC.z + 0.38, 0, G, false);
  const PT = { x: -249.1, z: -37.1 }; MG.c(0.28, 0.22, 0.5, '#b5603a', PT.x, 0.25, PT.z, 12); colC(PT.x, PT.z, 0.38);
  const leafG = new THREE.Group(); leafG.position.set(PT.x, 0.5, PT.z); G.add(leafG); for (let k = 0; k < 7; k++) { const l = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.7, 5), LM(k % 2 ? '#3f6a3a' : '#5a8a46')); l.position.set(Math.sin(k * 0.9) * 0.08, 0.3, Math.cos(k * 0.9) * 0.08); l.rotation.set(Math.cos(k * 0.9) * 0.4, 0, -Math.sin(k * 0.9) * 0.4); leafG.add(l); }
  // map tubes (NW corner), Spade's stool + waste bin behind the counter
  const TB = { x: -261.2, z: -36.9 }; MG.c(0.32, 0.28, 0.75, WOODD, TB.x, 0.38, TB.z, 12); for (let k = 0; k < 6; k++) MG.c(0.045, 0.045, 0.9, k % 2 ? PAPER : '#d9c39a', TB.x + Math.cos(k) * 0.15, 0.8, TB.z + Math.sin(k) * 0.15, 8, Math.sin(k) * 0.15, Math.cos(k) * 0.15); colC(TB.x, TB.z, 0.4);
  MG.c(0.2, 0.2, 0.05, WOODD, -255, 0.7, -35.2, 12); MG.c(0.03, 0.03, 0.68, INK, -255, 0.34, -35.2, 6);
  const WBN = { x: -253.6, z: -33.85 }; MG.c(0.17, 0.14, 0.4, '#5c6670', WBN.x, 0.2, WBN.z, 12);
  // east wall: bench + coat stand + a framed site plan
  MG.b(0.5, 0.06, 2.0, WOODL, -248.6, 0.45, -29.5); for (const z of [-30.35, -28.65]) MG.b(0.44, 0.42, 0.06, WOODD, -248.6, 0.21, z); MG.b(0.06, 0.5, 2.0, WOODL, -248.32, 0.75, -29.5); colF(-248.9, -248.2, -30.55, -28.45);
  const CS = { x: -249.1, z: -27.0 }; MG.c(0.03, 0.03, 1.8, WOODD, CS.x, 0.9, CS.z, 6); MG.c(0.22, 0.25, 0.04, WOODD, CS.x, 0.02, CS.z, 12); for (let k = 0; k < 4; k++) MG.b(0.18, 0.025, 0.025, WOODD, CS.x + Math.cos(k * 1.57) * 0.08, 1.72, CS.z + Math.sin(k * 1.57) * 0.08, -k * 1.57);
  MG.b(0.42, 0.75, 0.16, '#3f6a3a', CS.x + 0.06, 1.3, CS.z + 0.12); colC(CS.x, CS.z, 0.3);
  plane(CT(512, 384, (g, W, H) => { g.fillStyle = '#e7dcc4'; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, H - 10); g.fillStyle = INK; g.font = '900 32px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('THE FOUR SITES', 24, 36); g.lineWidth = 3; g.strokeStyle = WOOD; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(W / 2, H / 2 + 30, 30 + i * 22, 0, 7); g.stroke(); } g.fillStyle = RED; for (const [x, y, t] of [[150, 170, 'COLONNADE'], [330, 150, 'THE PIT'], [380, 290, 'OLD WELL'], [170, 300, 'SPIRE']]) { g.fillRect(x - 7, y - 7, 14, 14); g.fillStyle = INK; g.font = '800 18px Archivo, sans-serif'; g.fillText(t, x + 12, y); g.fillStyle = RED; } }), 1.4, 1.05, -248.24, 1.8, -34.2, -Math.PI / 2, G, false);
  // the MAIL TABLE on the west wall: 5 bins (CASTLE · TOWN · RUINS · LAKE · RETURN)
  const MT = { x: -261.4, z0: -31.6, z1: -27.4 }; MG.b(0.8, 0.06, MT.z1 - MT.z0, WOODL, MT.x, 0.88, (MT.z0 + MT.z1) / 2); for (const z of [MT.z0 + 0.1, MT.z1 - 0.1]) for (const dx of [-0.32, 0.32]) MG.b(0.05, 0.86, 0.05, WOODD, MT.x + dx, 0.43, z); colF(-261.8, -260.95, MT.z0, MT.z1);
  const BINS = [['CASTLE', '#7c3aed'], ['TOWN', '#c2410c'], ['RUINS', '#a88b5e'], ['LAKE', '#2f6fd6'], ['RETURN', '#c8262c']].map(([n, c], i) => { const z = MT.z0 + 0.42 + i * 0.84; MG.b(0.6, 0.04, 0.66, c, MT.x, 0.93, z); for (const dz of [-0.32, 0.32]) MG.b(0.6, 0.3, 0.03, c, MT.x, 1.06, z + dz); MG.b(0.03, 0.3, 0.66, c, MT.x - 0.29, 1.06, z); MG.b(0.03, 0.22, 0.66, c, MT.x + 0.29, 1.02, z);
    plane(label(n, c, '#ffffff', 256, 72, 44), 0.58, 0.16, MT.x + 0.31, 1.02, z, Math.PI / 2, G, false); return { n, c, p: V(MT.x, 1.05, z) }; });
  plane(label('MAIL \u00b7 SORT BY PLACE', WOODD, '#f0d5a6', 512, 80, 42), 1.6, 0.25, -261.76, 1.85, -29.5, Math.PI / 2, G, false);
  // hanging lamps over the counter
  const LAMPS = [[-257.6, 2.55, -32.6], [-252.9, 2.55, -32.6]]; for (const [x, y, z] of LAMPS) { MG.b(0.012, 1.2, 0.012, INK, x, y + 0.6, z); MG.c(0.07, 0.24, 0.18, '#2e4a3a', x, y, z, 10); }
  MG.done();
  // ================= SPADE =================
  let oldSpade = null; scene.traverse(o => { if (!oldSpade && o.userData && o.userData.foxKey === 'spade') oldSpade = o; });
  const spade = kit.makeFox({ key: 'mpoSpade', torso: SP.torso, outfit: 'vest', mood: 'warm', crest: 'M' }); const SPD = { x: -255, z: -34.25, ry: 0 }; spade.position.set(SPD.x, 0, SPD.z); G.add(spade); colC(SPD.x, SPD.z, 0.4);
  { const P0 = spade.userData && spade.userData.P; if (P0 && P0.head) { const vz = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16, 1, false, -1.2, 2.4), new THREE.MeshLambertMaterial({ color: '#2e7d4f', transparent: true, opacity: 0.85 })); vz.position.set(0, 0.17, 0.06); P0.head.add(vz); const band = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.015, 6, 18), LM('#2e7d4f')); band.rotation.x = Math.PI / 2; band.position.y = 0.17; P0.head.add(band); const pen = cyl(P0.head, 0.008, 0.008, 0.16, YEL, 0.17, 0.08, 0, 6); pen.rotation.x = Math.PI / 2; } }
  const kT = { key: 'mpoSpade', name: SP.name, role: SP.role, obj: spade, ry: SPD.ry, r: 6 };
  const ln = text => ({ who: 'npc', text }), me = text => ({ who: 'player', text }), mx = text => ({ who: 'max', text });
  // ================= rings + shop kit =================
  const RINGS = { stamp: [-257.6, -31.75], forged: [-252.9, -31.75], file: [-259.7, -36.35], mail: [-260.25, -29.6], map: [-250.7, -31.4] };
  for (const k in RINGS) { const [x, z] = RINGS[k]; const r1 = cyl(G, 0.5, 0.5, 0.012, YEL, x, 0.09, z, 22), r2 = cyl(G, 0.42, 0.42, 0.014, INK, x, 0.092, z, 22); r1.renderOrder = r2.renderOrder = 2; }
  const GAMES = [{ k: 'stamp', name: 'Stamp the Permits', color: '#c8262c' }, { k: 'file', name: 'File the Papers', color: '#8a6440' }, { k: 'mail', name: 'Sort the Mail', color: '#2f6fd6' }, { k: 'forged', name: 'Spot the Forged Permit', color: '#201e1d' }, { k: 'map', name: 'Find the Lost Map', color: '#3f6a3a', walk: true },
    { k: 'survey', name: 'Survey a Plot', color: '#a88b5e', out: true, field: true }, { k: 'theo', name: 'Read the Theodolite', color: '#2f6fd6', out: true, field: true }, { k: 'deliver', name: 'Deliver a Permit', color: '#c8262c', walk: true, out: true, field: true }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), pre = 'mpo';
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted: mutedQ, prefix: pre, color: SP.color, boardTitle: "Spade's best", toWorld: toW, room: OFF, door: [DOOR[0], DOOR[1] - 0.5], keeper: spade, keeperRy: SPD.ry, games: GAMES,
    board: { x: -259.4, y: 2.1, z: -26.42, ry: Math.PI, w: 1.1 }, hiring: { x: -252.7, y: 0, z: -27.3, ry: 0 }, hiringLine: 'PAPERWORK PAWS WANTED',
    sun: [{ x: -255, z: -27.6, w: 2.4, d: 1.8 }, { x: -250, z: -29.5, w: 2.0, d: 1.6 }], lamps: LAMPS.map(([x, y, z]) => [x, y - 0.12, z]),
    browse: [[-249.1, -29.9, -Math.PI / 2], [-257.2, -36.7, Math.PI], [-249.3, -34.2, Math.PI / 2]], slots: 2, clock: { x: -252.4, y: 2.25, z: -37.74, ry: 0 } });
  // ================= state, sound, card UI =================
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, thanks = null, lastP = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at0 = 0) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at0, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = bf; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1175, 0.07, 0.9); tone(1568, 0.04, 0.9); }, nope = () => tone(196, 0.05, 0.25, 'square'), chimes = () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.03, 0.5, 'triangle', i * 0.07)), thump = () => { tone(110, 0.09, 0.14, 'square'); noise(0.08, 0.03, 900); }, swish = () => noise(0.18, 0.025, 3500);
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + SP.color + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span></div>';
  const gauge = v => '<div style="position:relative;height:16px;border:2px solid #201e1d;background:#ffffff;margin-top:6px"><div style="position:absolute;top:0;bottom:0;left:0;width:' + Math.max(0, Math.min(100, v * 100)).toFixed(1) + '%;background:#3fd36a"></div></div>';
  const big = t => '<div style="font-size:18px;font-weight:900;line-height:1.15">' + t + '</div>', small = t => '<div style="font-size:12px;font-weight:800;margin-top:4px">' + t + '</div>';
  const setCard = (k, html) => { if (k === cardKey) return; cardKey = k; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && !!J && !GN[J.g].walk;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), TAPR = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(toW(v)).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearest = (list, posOf, r) => { let best = -1, bd = r; list.forEach((it, i) => { const d = dist(scrW(posOf(it))); if (d < bd) { bd = d; best = i; } }); return best; };
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (after, t = 1.0) => { J.pause = t; J.after = after; };
  const done = () => save.stat(pre + 'Done', null) || {};
  // flying paper / stamps: { m, from, to, t, k, q0, q1, end }
  const FLY = []; const fly = (m, to, k = 2.4, end, arc = 0.15) => FLY.push({ m, from: m.position.clone(), to: to.clone(), t: 0, k, end, arc });
  const flyTick = dt => { for (let i = FLY.length - 1; i >= 0; i--) { const f = FLY[i]; f.t = Math.min(1, f.t + dt * f.k); const e = f.t * f.t * (3 - 2 * f.t); f.m.position.lerpVectors(f.from, f.to, e); f.m.position.y += Math.sin(e * Math.PI) * f.arc; if (f.t >= 1) { FLY.splice(i, 1); f.end && f.end(); } } };
  // ---------- paper textures ----------
  const TYPES = [{ k: 'DIG', n: 'DIG SITE', c: '#c8262c' }, { k: 'CAMP', n: 'CAMPING', c: '#2e7d32' }, { k: 'SURVEY', n: 'SURVEY', c: '#2f6fd6' }, { k: 'WATER', n: 'WELL WATER', c: '#0e7490' }];
  const icon = (g, k, x, y, s, col) => { g.fillStyle = col; g.strokeStyle = col; g.lineWidth = s * 0.16; g.beginPath();
    if (k === 'DIG') { g.moveTo(x - s, y + s); g.lineTo(x + s * 0.4, y - s * 0.4); g.stroke(); g.beginPath(); g.moveTo(x + s * 0.1, y - s); g.lineTo(x + s, y - s * 0.1); g.lineTo(x + s * 0.4, y - s * 0.4); g.closePath(); g.fill(); }
    else if (k === 'CAMP') { g.moveTo(x, y - s); g.lineTo(x + s, y + s); g.lineTo(x - s, y + s); g.closePath(); g.fill(); g.fillStyle = PAPER; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 0.3, y + s); g.lineTo(x - s * 0.3, y + s); g.closePath(); g.fill(); }
    else if (k === 'SURVEY') { g.fillRect(x - s * 0.7, y - s, s * 0.14, s * 2); g.beginPath(); g.moveTo(x - s * 0.56, y - s); g.lineTo(x + s, y - s * 0.6); g.lineTo(x - s * 0.56, y - s * 0.2); g.closePath(); g.fill(); }
    else { g.moveTo(x, y - s); g.quadraticCurveTo(x + s, y + s * 0.2, x, y + s); g.quadraticCurveTo(x - s, y + s * 0.2, x, y - s); g.fill(); } };
  const NAMES = ['ASHBY', 'BURROW', 'COPSE', 'DUNE', 'EMBER', 'FERN', 'GORSE', 'HEATH', 'IVY', 'JUNIPER', 'KESTREL', 'LARCH'], INIT = 'ABCDEFGHJKMPRT';
  const fname = () => NAMES[Math.random() * NAMES.length | 0] + ', ' + pick(INIT.split('')) + '.';
  const sealP = (g, x, y, r, n, col) => { g.fillStyle = col; g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, q = i % 2 ? r * 0.62 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); g.strokeStyle = '#8a6a22'; g.lineWidth = 3; g.stroke(); };
  const sig = (g, x, y, txt, col) => { g.fillStyle = col; g.font = 'italic 800 40px Georgia, serif'; g.textBaseline = 'middle'; g.fillText(txt, x, y); g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 6, y + 22); g.quadraticCurveTo(x + 60, y + 34, x + 150, y + 16); g.stroke(); };
  const permitT = (o) => CT(512, 368, (g, W, H) => { g.fillStyle = PAPER; g.fillRect(0, 0, W, H); g.strokeStyle = '#b8a27a'; g.lineWidth = 6; g.strokeRect(8, 8, W - 16, H - 16); g.textBaseline = 'middle';
    g.fillStyle = INK; fitTxt(g, o.title || 'MERU \u00b7 PERMIT', 28, 44, 330, 34); g.fillStyle = '#6b552f'; fitTxt(g, 'NAME \u00b7 ' + o.name, 28, 90, 456, 28, 800);
    if (o.type) { g.fillStyle = o.type.c; g.fillRect(28, 124, W - 56, 110); icon(g, o.type.k, 92, 179, 36, '#ffffff'); g.fillStyle = '#ffffff'; fitTxt(g, o.type.n, 150, 181, W - 200, 62); }
    else { g.fillStyle = '#6b552f'; fitTxt(g, 'SITE \u00b7 ' + (o.site || 'THE COLONNADE'), 28, 140, 456, 28, 800); fitTxt(g, o.date ? 'VALID \u00b7 ' + o.date : 'VALID \u00b7 ', 28, 182, 456, 28, 800); }
    if (o.seal) sealP(g, 92, H - 82, 46, o.seal, GOLD); if (o.sig) sig(g, 280, H - 92, o.sig, o.ink || '#b4232a'); });
  // ================= JOB 1: STAMP THE PERMITS — tap the stamp with the permit's colour =================
  const ST = { x: -257.6, z: -32.92, y: CN.y + 0.004 };
  const stampTex = t => CT(128, 64, (g, W, H) => { g.fillStyle = t.c; g.fillRect(0, 0, W, H); icon(g, t.k, 22, 32, 14, '#ffffff'); g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; fitTxt(g, t.k, 42, 34, 80, 30); });
  const mkStamp = (c, faceT) => { const g = new THREE.Group(); const b = box(g, 0.22, 0.08, 0.15, c, 0, 0.04, 0); cyl(g, 0.025, 0.03, 0.12, WOODD, 0, 0.14, 0, 8); const k = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), LM(WOODD)); k.position.y = 0.23; g.add(k);
    if (faceT) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.11), new THREE.MeshBasicMaterial({ map: faceT })); f.position.set(0, 0.06, 0.077); f.renderOrder = 3; g.add(f); b.position.y = 0.04; } return g; };
  const STAMPS = TYPES.map((t, i) => { const g = mkStamp(t.c, stampTex(t)); g.position.set(ST.x - 0.81 + i * 0.54, CN.y, CN.z - 0.27); G.add(g); return { t, g, home: g.position.clone() }; });
  const inkT = (t, word) => CT(256, 128, (g, W, H) => { g.translate(W / 2, H / 2); g.rotate(rnd(-0.25, 0.25)); g.strokeStyle = t; g.lineWidth = 8; g.strokeRect(-110, -44, 220, 88); g.fillStyle = t; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 44px Archivo, sans-serif'; g.fillText(word, 0, 2); });
  const G1 = {
    begin() { Object.assign(J, { N: 8, n: 0 }); toast('TAP THE STAMP THAT MATCHES THE PERMIT', 2.6); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } J.t0 = J.t; J.over = false; J.lim = Math.max(4.5, 7.5 - J.n * 0.4); J.type = pick(TYPES); J.who = fname();
      const d = own(flat(permitT({ name: J.who, type: J.type }), 0.6, 0.43, ST.x, ST.y, ST.z + 0.7)); J.doc = d; fly(d, V(ST.x, ST.y, ST.z), 3, null, 0.03); swish(); },
    press() { if (J.over || FLY.length) return; const i = nearest(STAMPS, s => s.g.position.clone().add(V(0, 0.1, 0)), TAPR() * 1.2); if (i < 0) return; const s = STAMPS[i];
      if (s.t !== J.type) { miss('WRONG STAMP \u00b7 MATCH THE COLOUR', 1.4); s.g.rotation.z = 0.25; setTimeout(() => { s.g.rotation.z = 0; }, 180); return; }
      J.over = true; fly(s.g, V(ST.x, CN.y + 0.18, ST.z), 4, () => { thump(); const ink = own(flat(inkT(s.t.c, 'APPROVED'), 0.32, 0.16, ST.x + 0.08, ST.y + 0.003, ST.z + 0.08)); ink.renderOrder = 4; fly(s.g, s.home, 3, null, 0.12);
        addGold(J.t - J.t0 < 2.5 ? 3 : 2); NEXT(() => { fly(J.doc, V(ST.x - 1.6, ST.y + 0.02, ST.z), 2.5, null, 0.05); fly(ink, V(ST.x - 1.52, ST.y + 0.023, ST.z + 0.08), 2.5, null, 0.05); J.n++; NEXT(() => G1.next(), 0.45); }, 0.45); }, 0.1); },
    tick() { if (!J.over && J.t - J.t0 > J.lim) { J.over = true; miss('TOO SLOW \u00b7 THE QUEUE GROANS'); fly(J.doc, V(ST.x - 1.6, ST.y + 0.02, ST.z), 2.5); J.n++; NEXT(() => G1.next(), 0.9); } },
    hint() { const s = STAMPS.find(q => q.t === J.type); return s && !J.over ? [s.g.position.clone().add(V(0, 0.1, 0)), 'STAMP'] : null; },
    card() { return ['PERMIT ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, small('APPLICANT \u00b7 ' + (J.who || '')) + gauge(1 - Math.max(0, J.t - J.t0) / (J.lim || 7)), J.n + '_' + (J.over ? 1 : 0)]; },
    shot() { return [V(ST.x, CN.y + 0.08, ST.z - 0.08), 1.6, 0.85, 0.85, 1.0, 0, 2.6]; },
    end() { STAMPS.forEach(s => { s.g.position.copy(s.home); s.g.rotation.z = 0; }); } };
  // ================= JOB 2: FILE THE PAPERS — tap the pigeonhole with the surname's first letter =================
  const PHS = PHL.map((L, n) => ({ L, p: phC(n % PH.cols, n / PH.cols | 0) }));
  const G2 = {
    begin() { Object.assign(J, { N: 8, n: 0 }); toast('TAP THE HOLE WITH THE FIRST LETTER OF THE SURNAME', 2.8); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } J.t0 = J.t; J.over = false; J.who = fname(); J.L = J.who[0];
      const t = CT(256, 160, (g, W, H) => { g.fillStyle = PAPER; g.fillRect(0, 0, W, H); g.strokeStyle = '#b8a27a'; g.lineWidth = 5; g.strokeRect(4, 4, W - 8, H - 8); g.textBaseline = 'middle'; g.fillStyle = '#6b552f'; fitTxt(g, 'FILE UNDER', 18, 34, 220, 22, 800); g.fillStyle = INK; fitTxt(g, J.who, 18, 96, 220, 40); });
      const d = own(new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.3), new THREE.MeshBasicMaterial({ map: t }))); d.position.set(-259.7, 0.6, -36.9); d.renderOrder = 4; J.doc = d; fly(d, V(-259.7, 0.78, -37.1), 3, null, 0.05); swish(); },
    press() { if (J.over || FLY.length) return; const i = nearest(PHS, h => h.p, TAPR() * 1.15); if (i < 0) return; const h = PHS[i];
      if (h.L !== J.L) { miss('NOT THAT ONE \u00b7 ' + J.who.split(',')[0] + ' STARTS WITH ' + J.L, 1.6); return; }
      J.over = true; fly(J.doc, V(h.p.x, h.p.y - 0.08, PH.z - 0.05), 2.6, () => { J.doc.visible = false; tone(660 + i * 30, 0.05, 0.25, 'triangle'); }, 0.2); J.doc.rotation.x = -0.6; addGold(J.t - J.t0 < 3.5 ? 3 : 2); J.n++; NEXT(() => G2.next(), 0.8); },
    tick() { if (!J.over && J.t - J.t0 > 9) { J.over = true; miss('TOO SLOW \u00b7 THE PILE GROWS'); J.doc.visible = false; J.n++; NEXT(() => G2.next(), 0.9); } },
    hint() { const h = PHS.find(q => q.L === J.L); return h && !J.over ? [h.p, h.L] : null; },
    card() { return ['PAPER ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, big(J.who || '') + small('FIRST LETTER OF THE SURNAME') + gauge(1 - Math.max(0, J.t - J.t0) / 9), J.n + '_' + (J.over ? 1 : 0)]; },
    shot() { return [V((PH.x0 + PH.x1) / 2, 1.5, PH.z), 2.5, 1.6, 0.14, 1.6, 0, 3.6]; },
    end() {} };
  // ================= JOB 3: SORT THE MAIL — tap the bin for the letter's place (smudged = RETURN) =================
  const ADDR = { CASTLE: ['KING MIGHT \u00b7 THE THRONE ROOM', 'THE CAPTAIN \u00b7 THE BARRACKS', 'THE COOK \u00b7 CASTLE KITCHEN'], TOWN: ['STAMPS \u00b7 MERU POST OFFICE', 'SIZZLE \u00b7 MERU BURGERS', 'THE TAILOR \u00b7 TOWN SQUARE'],
    RUINS: ['THE OLD SAGE \u00b7 RUINS MUSEUM', 'SANDY \u00b7 THE DIG ROOM', 'SNAG \u00b7 THE RUINS ROAD'], LAKE: ['THE FISHERMAN \u00b7 THE JETTY', 'THE BOATHOUSE \u00b7 LAKE MERU', 'THE BAIT SHOP \u00b7 THE BEACH'], RETURN: ['NO SUCH FOX \u00b7 NOWHERE ROAD', 'ADDRESS SMUDGED', 'NO NAME \u00b7 NO STREET'] };
  const LT = { x: -260.88, y: 1.36, z: -29.6 };
  const G3 = {
    begin() { Object.assign(J, { N: 12, n: 0 }); toast('TAP THE BIN FOR EACH LETTER \u00b7 SMUDGED = RETURN', 2.8); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } J.t0 = J.t; J.over = false; J.lim = J.n < 6 ? 6 : 4.5; const b = Math.random() < 0.18 ? 4 : Math.random() * 4 | 0; J.bin = b; J.addr = pick(ADDR[BINS[b].n]);
      const ret = b === 4, t = CT(384, 240, (g, W, H) => { g.fillStyle = '#f6efe0'; g.fillRect(0, 0, W, H); g.strokeStyle = '#c9b48e'; g.lineWidth = 4; g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = '#c8262c'; g.fillRect(W - 76, 16, 56, 64); g.fillStyle = '#ffffff'; g.fillRect(W - 68, 24, 40, 48);
        const [who, where] = J.addr.split(' \u00b7 '); g.fillStyle = INK; g.textBaseline = 'middle'; fitTxt(g, who, 28, 120, W - 56, 34); if (where) { g.fillStyle = '#6b552f'; fitTxt(g, where, 28, 170, W - 56, 30, 800); }
        if (ret) { g.fillStyle = 'rgba(60,70,110,0.55)'; for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(rnd(60, W - 60), rnd(100, 190), rnd(30, 70), rnd(12, 26), rnd(0, 3), 0, 7); g.fill(); } } });
      const d = own(new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.39), new THREE.MeshBasicMaterial({ map: t }))); d.rotation.y = Math.PI / 2; d.position.set(LT.x + 0.4, LT.y + 0.3, LT.z); d.renderOrder = 4; J.doc = d; fly(d, V(LT.x, LT.y, LT.z), 3.2, null, 0.02); swish(); },
    press() { if (J.over || FLY.length) return; const i = nearest(BINS, b => b.p, TAPR() * 1.2); if (i < 0) return;
      if (i !== J.bin) { miss(J.bin === 4 ? 'SMUDGED \u00b7 RETURN TO SENDER' : 'WRONG BIN \u00b7 THAT ONE IS ' + BINS[J.bin].n, 1.5); return; }
      J.over = true; fly(J.doc, BINS[i].p.clone().add(V(0, 0.05, 0)), 3, () => { J.doc.visible = false; tone(520 + i * 80, 0.05, 0.2, 'triangle'); }, 0.2); addGold(J.t - J.t0 < 2.5 ? 2 : 1); J.n++; NEXT(() => G3.next(), 0.55); },
    tick() { if (!J.over && J.t - J.t0 > J.lim) { J.over = true; miss('TOO SLOW \u00b7 THE BAG OVERFLOWS'); J.doc.visible = false; J.n++; NEXT(() => G3.next(), 0.8); } },
    hint() { return !J.over ? [BINS[J.bin].p, BINS[J.bin].n] : null; },
    card() { return ['LETTER ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, big(J.addr || '') + gauge(1 - Math.max(0, J.t - J.t0) / (J.lim || 6)), J.n + '_' + (J.over ? 1 : 0)]; },
    shot() { return [V(MT.x + 0.1, 1.15, (MT.z0 + MT.z1) / 2), 4.4, 1.2, 0.42, 1.6, Math.PI / 2, 5.2]; },
    end() {} };
  // ================= JOB 4: SPOT THE FORGED PERMIT — APPROVE or FORGED (8-point seal, red ink, signed Spade, spelt right) =================
  const FG = { x: -252.9, z: -32.92, y: CN.y + 0.004 };
  const bigStamp = (word, c) => { const t = label(word, c, '#ffffff', 256, 80, 44); const g = mkStamp(c, t); g.scale.setScalar(1.25); return g; };
  const FST = [{ k: 'ok', g: bigStamp('APPROVE', '#2e7d32') }, { k: 'fake', g: bigStamp('FORGED', '#c8262c') }]; FST.forEach((s, i) => { s.g.position.set(FG.x + (i ? 0.62 : -0.62), CN.y, FG.z - 0.05); G.add(s.g); s.home = s.g.position.clone(); });
  { const ref = permitT({ name: 'A REAL ONE', seal: 8, sig: 'Spade', date: 'THIS YEAR' }); const st = new THREE.Group(); st.position.set(FG.x, CN.y, CN.z - 0.38); G.add(st); box(st, 0.5, 0.36, 0.02, WOODD, 0, 0.2, 0).rotation.x = -0.25; const m = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.32), new THREE.MeshBasicMaterial({ map: ref })); m.position.set(0, 0.2, 0.015); m.rotation.x = -0.25; st.add(m); plane(label('A REAL ONE', INK, YEL, 256, 48, 30), 0.3, 0.06, FG.x, CN.y + 0.43, CN.z - 0.33, 0, G, false); }
  const FAULTS = [['seal', 'SEVEN-POINT SEAL'], ['ink', 'BLUE INK'], ['sig', 'SIGNED "SPUD"'], ['spell', 'SPELT "PERMITT"'], ['date', 'NO DATE']];
  const G4 = {
    begin() { const fakes = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3); Object.assign(J, { N: 6, n: 0, fakes }); toast('CHECK IT AGAINST THE REAL ONE \u00b7 APPROVE OR FORGED', 3); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } J.t0 = J.t; J.over = false; const fake = J.fakes.includes(J.n); J.fake = fake; J.why = fake ? pick(FAULTS) : null; const f = J.why ? J.why[0] : '';
      const d = own(flat(permitT({ name: fname(), site: pick(['THE COLONNADE', 'THE PIT', 'THE OLD WELL', 'THE SPIRE']), title: f === 'spell' ? 'MERU \u00b7 PERMITT' : 'MERU \u00b7 PERMIT', seal: f === 'seal' ? 7 : 8, sig: f === 'sig' ? 'Spud' : 'Spade', ink: f === 'ink' ? '#2f4fb4' : '#b4232a', date: f === 'date' ? '' : 'THIS YEAR' }), 0.6, 0.43, FG.x, FG.y, FG.z + 0.7)); J.doc = d; fly(d, V(FG.x, FG.y, FG.z), 3, null, 0.03); swish(); },
    press() { if (J.over || FLY.length) return; const i = nearest(FST, s => s.g.position.clone().add(V(0, 0.12, 0)), TAPR() * 1.3); if (i < 0) return; const s = FST[i], sayFake = s.k === 'fake';
      J.over = true; fly(s.g, V(FG.x, CN.y + 0.2, FG.z), 4, () => { thump(); const ink = own(flat(inkT(sayFake ? '#c8262c' : '#2e7d32', sayFake ? 'FORGED' : 'APPROVED'), 0.34, 0.17, FG.x + 0.06, FG.y + 0.003, FG.z + 0.06)); fly(s.g, s.home, 3, null, 0.12);
        if (sayFake === J.fake) { addGold(3); toast(J.fake ? 'CAUGHT \u00b7 ' + J.why[1] : 'A REAL ONE \u00b7 APPROVED', 1.4); chimes(); } else miss(J.fake ? 'IT WAS FORGED \u00b7 ' + J.why[1] : 'IT WAS REAL \u00b7 CHECK AGAIN', 2.0);
        NEXT(() => { fly(J.doc, V(FG.x + 1.4, FG.y + 0.02, FG.z), 2.5, null, 0.05); fly(ink, V(FG.x + 1.46, FG.y + 0.023, FG.z + 0.06), 2.5, null, 0.05); J.n++; NEXT(() => G4.next(), 0.45); }, 1.1); }, 0.1); },
    tick() { if (!J.over && J.t - J.t0 > 14) { J.over = true; miss('TOO SLOW \u00b7 SPADE CHECKS IT'); fly(J.doc, V(FG.x + 1.4, FG.y + 0.02, FG.z), 2.5); J.n++; NEXT(() => G4.next(), 0.9); } },
    hint() { return !J.over ? [FST[J.fake ? 1 : 0].g.position.clone().add(V(0, 0.12, 0)), J.fake ? 'FORGED' : 'APPROVE'] : null; },
    card() { return ['PERMIT ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, small('REAL: 8-POINT GOLD SEAL \u00b7 RED INK \u00b7 SIGNED SPADE \u00b7 A DATE') + gauge(1 - Math.max(0, J.t - J.t0) / 14), J.n + '_' + (J.over ? 1 : 0)]; },
    shot() { return [V(FG.x, CN.y + 0.1, FG.z - 0.12), 1.9, 0.95, 0.85, 1.1, 0, 2.8]; },
    end() { FST.forEach(s => s.g.position.copy(s.home)); } };
  // ================= JOB 5: FIND THE LOST MAP (walk) — search the spots with E: COLD / WARM / HOT =================
  const SPOTS = [{ n: 'THE MAP CHEST', at: [MC.x, -36.55], o: [MC.x, 1.1, MC.z] }, { n: 'THE WASTE BIN', at: [WBN.x, -34.55], o: [WBN.x, 0.5, WBN.z] }, { n: 'THE COAT STAND', at: [CS.x - 0.4, -27.6], o: [CS.x, 1.9, CS.z] },
    { n: 'UNDER THE BENCH', at: [-249.4, -29.5], o: [-248.6, 0.7, -29.5] }, { n: 'THE PLANT POT', at: [PT.x - 0.4, -36.3], o: [PT.x, 1.3, PT.z] }, { n: 'THE MAP TUBES', at: [TB.x + 0.7, -36.4], o: [TB.x, 1.3, TB.z] },
    { n: 'BY THE KETTLE', at: [KT.x, -36.65], o: [KT.x, 1.25, KT.z] }, { n: 'UNDER THE RUG', at: [RUG.x + 1.5, RUG.z], o: [RUG.x, 0.4, RUG.z] }];
  const qT = (t, bg, fg) => CT(256, 96, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = '900 56px Archivo, sans-serif'; g.fillText(t, W / 2, H / 2 + 3); });
  const QM = { '?': qT('?', INK, YEL), COLD: qT('COLD', '#2f6fd6', '#ffffff'), WARM: qT('WARM', '#e6a020', INK), HOT: qT('HOT', '#c8262c', '#ffffff') };
  const MARK = SPOTS.map(s => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: QM['?'], depthTest: false, transparent: true })); sp.scale.set(0.5, 0.19, 1); sp.position.set(s.o[0], s.o[1] + 0.35, s.o[2]); sp.visible = false; sp.renderOrder = 9; G.add(sp); return sp; });
  const MAPR = new THREE.Group(); { cyl(MAPR, 0.06, 0.06, 0.6, '#e7dcc4', 0, 0, 0, 10).rotation.z = Math.PI / 2; cyl(MAPR, 0.065, 0.065, 0.05, RED, 0, 0, 0, 10).rotation.z = Math.PI / 2; } MAPR.visible = false; G.add(MAPR);
  const nearSpot = P => { let b = -1, bd = 1.25; SPOTS.forEach((s, i) => { const d = Math.hypot(P.x - s.at[0], P.z - s.at[1]); if (d < bd) { bd = d; b = i; } }); return b; };
  const G5 = {
    begin() { Object.assign(J, { N: 3, n: 0 }); toast('SPADE LOST A MAP \u00b7 SEARCH THE ? SPOTS WITH E', 3); this.next(); },
    next() { if (J.n >= J.N) { MARK.forEach(m => { m.visible = false; }); finishGame(); return; } J.t0 = J.t; J.over = false; J.tries = 0; J.hid = Math.random() * SPOTS.length | 0; J.seen = {}; MARK.forEach(m => { m.material.map = QM['?']; m.visible = true; }); },
    prompt(P) { if (J.over || J.pause > 0) return null; const i = nearSpot(P); if (i < 0 || J.seen[i]) return null; return 'SEARCH \u00b7 ' + SPOTS[i].n; },
    talk(P) { if (J.over || J.pause > 0) return false; const i = nearSpot(P); if (i < 0 || J.seen[i]) return false; J.seen[i] = 1; J.tries++; noise(0.25, 0.03, 1800); const s = SPOTS[i];
      if (i === J.hid) { J.over = true; MARK.forEach(m => { m.visible = false; }); MAPR.visible = true; MAPR.position.set(s.o[0], s.o[1], s.o[2]); chimes(); addGold(J.tries <= 3 ? 5 : 3); toast('FOUND IT! \u00b7 ' + s.n, 1.8); J.n++; NEXT(() => { MAPR.visible = false; G5.next(); }, 1.8); return true; }
      const d = Math.hypot(s.o[0] - SPOTS[J.hid].o[0], s.o[2] - SPOTS[J.hid].o[2]), w = d < 4.2 ? 'HOT' : d < 7.5 ? 'WARM' : 'COLD'; MARK[i].material.map = QM[w]; MARK[i].material.needsUpdate = true;
      if (J.tries > 3) miss(w + ' \u00b7 SPADE TAPS HIS FOOT', 1.6); else { toast(w + ' \u00b7 NOT IN ' + s.n, 1.6); tone(w === 'HOT' ? 880 : w === 'WARM' ? 660 : 440, 0.04, 0.25, 'triangle'); } return true; },
    tick(dt) { if (MAPR.visible) { MAPR.rotation.y += dt * 3; MAPR.position.y += dt * 0.4; } if (!J.over && J.t - J.t0 > 45) { J.over = true; miss('TIME \u00b7 SPADE FINDS IT ' + SPOTS[J.hid].n, 2.2); J.n++; NEXT(() => G5.next(), 1.6); } },
    goal() { if (J.over || J.t - J.t0 < 25) return null; const s = SPOTS[J.hid]; return [s.at[0], s.at[1], 0]; },
    card() { return ['MAP ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, small('WALK TO A ? AND PRESS ' + (touch ? 'TALK' : 'E') + ' \u00b7 HOT = CLOSE') + small('SEARCHES \u00b7 ' + (J.tries || 0) + ' (3 FREE)') + gauge(1 - Math.max(0, J.t - J.t0) / 45), J.n + '_' + J.tries + '_' + (J.over ? 1 : 0) + '_' + Math.floor((J.t - J.t0) / 3)]; },
    end() { MARK.forEach(m => { m.visible = false; }); MAPR.visible = false; } };
  const GD = { stamp: G1, file: G2, mail: G3, forged: G4, map: G5 };
  const JX = new Proxy({}, { get: (_, k) => J && J[k], set: (_, k, v) => { if (J) J[k] = v; return true; } });
  const XA = pmJobsA2({ THREE, G, ROOT, V, LM, CT, box, cyl, colC, plane, flat, label, J: JX, own, miss, addGold, NEXT, toast, finishGame, tone, noise, chimes, thump, ding, TAPR, scrW, nearest, fly, FLY, kit, sayTo, save, touch, toW, ground, small, big, gauge, pick, clamp, active: () => (J ? J.g : null), C: { INK, RED, YEL, WHITE, PAPER, WOOD, WOODD, WOODL } });
  Object.assign(GD, XA.GD); Object.assign(RINGS, XA.RINGS); for (const tp of XA.tips) if (!SP.tips.includes(tp)) SP.tips.push(tp);
  const DG = pmDig({ THREE, ROOT, V, LM, CT, box, cyl, colC, plane, label, save, touch, toW, ground, hour, toast, tone, noise, chimes, clamp, pick, allDone: () => GAMES.every(q => done()[q.k]) });
  const arrowM = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: RED })); arrowM.rotation.x = Math.PI; arrowM.visible = false; arrowM.renderOrder = 5; ROOT.add(arrowM);
  // ================= run a game =================
  function startGame(g, P) { if (busy || !GD[g]) return; FLY.length = 0; J = { g, miss: 0, gold: 0, objs: [], t: 0, pause: 0, P }; busy = 'job'; const R = RINGS[g]; if (P && R && !GN[g].walk) Object.assign(P, { x: R[0], z: R[1], sp: 0 }); GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(8); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat(pre + 'Done', d); save.setStat(pre + 'Clears', save.stat(pre + 'Clears', 0) + 1);
    K.finish(g, stars, gold, first); stop(); thanks = { g, gold }; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 +' + gold + ' GOLD', 2.6); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) J.objs.forEach(o => o.parent && o.parent.remove(o)); FLY.length = 0; busy = null; J = null; ptr.down = false; hideCard(); arrowM.visible = false; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drawCard() { if (!J) return; const g = GD[J.g], c = g.card && g.card(); if (!c) { hideCard(); return; } setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold) + '_' + Math.floor(J.t * 4), head(GN[J.g].name.toUpperCase(), J.gold ? J.gold + ' G' : 'SPADE') + foot(c[0]) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; const g = GD[J.g]; flyTick(dt);
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0) J.pause = 0; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return;
    const go = g.goal ? g.goal() : null; if (go) { arrowM.visible = true; arrowM.scale.setScalar(go[3] || 1); arrowM.position.set(go[0], (go[2] || 0) + (go[3] ? 2.7 : 1.9) + Math.sin(J.t * 4) * 0.15, go[1]); arrowM.rotation.y += dt * 2; } else arrowM.visible = false;
    drawCard(); }
  // ---------- camera: job shots, clamped inside the office ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !GN[J.g].walk && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; }
    if (v.pos) { if (near0 == null) near0 = cam.near; cam.near = 0.06; if (fovP == null) fovP = cam.fov; cam.fov = v.fov; cam.updateProjectionMatrix(); cam.position.copy(v.pos); cam.lookAt(v.look); camCur.on = false; return; }
    if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    if (!GN[J.g].out) { camCur.pos.x = clamp(camCur.pos.x, OFF.X0 + 0.4, OFF.X1 - 0.4); camCur.pos.z = clamp(camCur.pos.z, OFF.Z0 + 0.4, OFF.Z1 - 0.4); camCur.pos.y = clamp(camCur.pos.y, 0.6, 3.6); } cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.830-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- THE DIG PERMIT (2D, meru-ruins.js DYN.spade verbatim; the desert digging itself is part B) ----------
  const flag = k => { try { return !!save.flag(k); } catch (e) { return false; } };
  const digPrompt = () => sayTo(kT, [{ ...ln('Ready to dig?'), choices: [{ text: 'YES \u2014 TAKE ME OUT THERE.', pick: () => sayTo(kT, [ln('Then go. Scan before you dig \u2014 the sand keeps its own counsel.')], () => { if (openPanel) setTimeout(() => openPanel('DUNEGLASS DIG', 'minigames/meru/duneglass.html'), 80); }) },
    { text: 'NO \u2014 NOT JUST NOW.', pick: () => sayTo(kT, [ln('Suit yourself. The sand will keep, and so will I.')]) }] }]);
  const take = reply => () => { try { save.setFlag('digPermit'); } catch (e) {} DG.stamped(); ding(); toast('DIG PERMIT \u00b7 STAMPED \u00b7 7 DAYS \u00b7 FOUR SITES IN THE DESERT', 3); sayTo(kT, [ln(reply)], () => setTimeout(digPrompt, 80)); };
  const end = (lines, choices) => { const L = lines.slice(), last = L.pop(); return [...L, { ...last, choices: [...choices, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]; };
  function permitTalk() {
    if (!flag('tournamentWon')) return sayTo(kT, [ln('Permit? Not today, friend. Field\u0027s shut.'), me('Shut? There\u0027s nobody out here.'), ln('That is why. They are all at the ARENA. King Might is hosting his own birthday tournament.'), me('Every digger went to watch?'), ln('Every fox worth the name. I would be there too. Come back when the competition is done.'), ln('Then I will stamp you one.')]);
    if (!flag('maxHome') && !flag('maxFollowing')) return sayTo(kT, [ln('Permit? Not today, friend. Whole field\u0027s shut.'), me('Shut? There\u0027s nobody out here.'), ln('That is the trouble. A lad went missing in these dunes. King Might\u0027s own son. Max. They say he went down the old stair.'), ln('He never came back up. Nobody digs while a fox is lost. Find him. Get him home to his father.'), ln('Then come back and I will stamp you one.')]);
    if (flag('maxFollowing') && !flag('digPermit')) return sayTo(kT, end([ln('Well now. That is the King\u0027s son at your shoulder.'), mx('It is. And this fox pulled me out.'), ln('Out of where, Prince?'), mx('A cage. Down the old stair. Bandits.'), ln('Then the field is open again because of you. Take a permit. Not a coin.')],
      [{ text: 'TAKE THE PERMIT.', pick: take('Stamped. Four sites out there. Get him home first, mind.') }, { text: 'LATER \u2014 MAX COMES FIRST.', pick: () => sayTo(kT, [ln('Good fox. It will keep.')]) }]));
    if (flag('digPermit') && !DG.valid()) return sayTo(kT, end([ln('That permit ran out. ' + (DG.freeRenew() ? 'Renewals are free for you now.' : 'Fifteen gold renews it.'))], [{ text: DG.freeRenew() ? 'RENEW IT \u00b7 FREE' : 'RENEW IT \u00b7 ' + DG.RENEW + ' GOLD', pick: () => { const r = DG.renew(); sayTo(kT, [ln(r.line)], r.ok ? () => setTimeout(digPrompt, 80) : null); } }]));
    if (flag('digPermit')) return sayTo(kT, end([ln('Permit\u0027s still good. Sites are yours whenever you want them.'), ln(DG.status())], [{ text: 'STAMP ME OUT TO THE FIELD.', pick: () => sayTo(kT, [ln('Mind the storms. And the company.')], () => setTimeout(digPrompt, 80)) }, { text: 'JUST PASSING.', pick: () => sayTo(kT, [ln('Suit yourself. I\u0027m not going anywhere.')]) }]));
    return sayTo(kT, end([ln('Well now. Word came up the road ahead of you. You pulled the King\u0027s son out of that hole.'), ln('And walked him all the way to the castle.'), me('So what does a permit cost me?'), ln('Cost you? Not a coin. The field is open again because of you. Take it. And take a shovel while you are here.')],
      [{ text: 'TAKE THE PERMIT.', pick: take('Stamped. Four sites out there. The Colonnade is the gentlest place to start.') }, { text: 'I\u0027LL COME BACK FOR IT.', pick: () => sayTo(kT, [ln('It\u0027ll keep. So will the sand.')]) }])); }
  // ---------- places, talk + prompt ----------
  const inRoom = P => P.x > OFF.X0 - 0.2 && P.x < OFF.X1 + 0.2 && P.z > OFF.Z0 - 0.2 && P.z < OFF.Z1 && Math.abs(P.y || 0) < 3;
  const ringAt = P => { for (const k in RINGS) { const [x, z] = RINGS[k]; if (Math.hypot(P.x - x, P.z - z) < 1.0) return GN[k]; } return null; };
  const nearSpade = P => Math.hypot(P.x - SPD.x, P.z - SPD.z) < 3.0;
  function prompt(P) { if (J && GN[J.g].walk) { const gp = GD[J.g].prompt ? GD[J.g].prompt(P) : null; return gp || (nearSpade(P) ? 'SPADE \u00b7 STOP THE JOB' : null); } if (busy) return null; const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (!inRoom(P)) return XA.prompt(P) || DG.prompt(P);
    if (K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; if (nearSpade(P)) return 'TALK \u00b7 ' + SP.name.toUpperCase(); return null; }
  const nextJob = () => { const d = done(), L = GAMES.filter(q => GD[q.k]); return (L.find(q => !d[q.k]) || L.slice().sort((a, c) => K.stars(a.k) - K.stars(c.k))[0]).k; };
  const sub = field => sayTo(kT, [{ ...ln(field ? 'Field jobs. Hat on. Sand in the boots, guaranteed.' : 'Office jobs. Pick one. Paws clean.'), choices: [...GAMES.filter(q => !!q.field === !!field).map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => { if (!busy) startGame(q.k, lastP); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const menu = () => { talked++; let open = SP.hello[talked % SP.hello.length];
    if (!save.stat(pre + 'Met', 0)) { save.setStat(pre + 'Met', 1); open = 'Spade. I stamp the permits for the dig sites. Need work? I have plenty.'; }
    if (thanks) { open = 'Tidy work. ' + thanks.gold + ' gold. The forms thank you.'; thanks = null; }
    sayTo(kT, [{ ...ln(open), choices: [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(), lastP); } }, { text: 'OFFICE JOBS', pick: () => sub(false) }, { text: 'FIELD JOBS', pick: () => sub(true) }, { text: 'THE DIG PERMIT', pick: permitTalk },
      { text: 'A TIP, PLEASE', pick: () => sayTo(kT, [ln(SP.tips[talked % SP.tips.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); };
  function talk(P) { lastP = P; if (J && GN[J.g].walk) { if (GD[J.g].talk && GD[J.g].talk(P)) return true; if (nearSpade(P)) { quit(); return true; } return false; } if (busy) return false; const r = ringAt(P); if (r) { startGame(r.k, P); return true; } if (!inRoom(P)) return XA.talk(P) || DG.talk(P);
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (nearSpade(P)) { ding(); menu(); return true; } return false; }
  function quit() { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  let outT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; toastT -= dt; const near = Math.hypot(P.x + 255, P.z + 32); G.visible = near < (touch ? 60 : 100);
    if (oldSpade) { oldSpade.visible = false; if (oldSpade.position.y > -40) oldSpade.position.set(-255, -50, -300); }
    if (busy === 'job' && J) { outT = (GN[J.g].out ? XA.inArea(P) : inRoom(P)) ? 0 : outT + dt; if (outT > (GN[J.g].walk ? 2 : 0.3)) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (busy === 'job' && J && !GN[J.g].walk && fox) JW(fox, J.g); XA.tick(dt, t, P); DG.tick(dt, P);
    if (busy === 'job' && J) jobTick(dt, P); if (!G.visible) return; hintTick(t);
    leafG.rotation.y = Math.sin(t * 0.7) * 0.05;
    K.tick(dt, P, { inShop: inRoom(P), busy: !!busy, near, talking: false }); }
  const API = { group: ROOT, XA, DG, prompt, talk, tick, camFix, quit, busy: () => (busy && J && GN[J.g].walk ? null : busy), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), spade, GD, RINGS, SPOTS, inRoom, K, permitTalk,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); ptr.down = false; }, _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) jobTick(dt, lastP); }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), dispose() { card.remove(); HINT.remove(); XA.dispose(); K.dispose && K.dispose(); } };
  window.__permitJobs = API; return API;
}
