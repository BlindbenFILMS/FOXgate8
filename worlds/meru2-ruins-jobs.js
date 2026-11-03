// MERU 2.0 — s123 RUINS MUSEUM DELUXE PART A (Ben's answers s123). The museum shell was an empty city box; it is now TWICE the size:
// THE HALL (f -395..-365 × -70..-45, door S at (-380, -45)) + a new DIG ROOM to the west (x -415..-395) through an ARCH in the partition
// (x -395, z -58.6..-56.2). The dig room's west wall is the hill itself (rock face + timber shoring) with the DIG PIT in front of it.
// TWO keepers: the OLD SAGE (2D look + 2D lines verbatim, his standing relic offer) at his desk under THE EIGHT GATES relief + SANDY,
// his young digger apprentice, in the dig room. Part A jobs: GLUE THE BROKEN POT (Sage: tap a shard, tap the gap with its mark)
// · POLISH THE DISPLAY CASES (Sage: drag the cloth over the paw prints) · BRUSH OFF A FIND (Sandy: drag the brush over the dirt).
// s124 PART B (worlds/meru2-ruins-jobs2.js): SORT BY AGE · REAL OR FAKE? · THE MOSAIC · NIGHT WATCH (walk) · CATALOGUE · DIG A SQUARE · THE RUBBING.
// s125 PART C (worlds/meru2-ruins-prize.js): COLLECTION WALL · daily WANTED (pays double) · DONORS plaque · explorer hat / outfit / tools / own case / golden trowel.
// Built in the ORIGINAL frame; meru2-walk.js adds API.group to RL.MV 'museum' if the town layout moved it. Stats prefix mrs.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { PLAYER_MALE } from '../fox-kit.js?v=s673';
import { rsJobsB } from './meru2-ruins-jobs2.js';
import { rsPrizes } from './meru2-ruins-prize.js';
import { rsLife } from './meru2-ruins-life.js';   // s127 look + life   // part C: collection wall, WANTED, donors, prizes   // part B: sort, appraise, mosaic, night watch, catalogue, dig, rubbing
const SAGE_LOOK = { ...PLAYER_MALE, elder: 1, muzzle: '#f1e3cf', chin: '#f4f1ec', fluff: '#f4f4f6', tailTip: '#ffffff' };
// the 2D relic list (worlds/meru-caves.js RELICS, verbatim)
const RELICS = { shardpin: { name: 'Shard Pin', value: 45, remark: 'A cloak pin. I have not seen one in years.' }, gatecoin: { name: 'Gate Coin of Old Meru', value: 120, remark: 'Eight dots. Struck while all eight gates still answered.' } };
const SG = { name: 'Old Sage', role: 'RUINS MUSEUM', color: '#8a6d3b', torso: ['#8a6d3b', '#5e4a28', '#3a2c17'],
  hello: ['Back, child? The stones remember you.', 'Mind the dust. It is older than the King.', 'Every visit, the hill gives up a little more.'],
  tips: ['Glue the big shards first. The pot tells you where.', 'Polish in circles. Glass hates a straight line.', 'Patience is a tool. The best one I own.'] };
const SD = { name: 'Sandy', role: 'DIGGER', torso: ['#c9a46a', '#7a5a36', '#3d2a1c'],
  hello: ['Hi! Sandy. I dig, the Sage looks wise. Fair split.', 'Back for the dig room? Grab a brush.', 'Found a button today. Probably old. Probably.'],
  tips: ['Brush away from the find. Never into it.', 'Soft strokes. Dirt comes off, history stays on.', 'If it shines, call the Sage. If it bites, call me.'] };
export function buildRuinsJobs({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted, wear, ground }) { const JW = jobWorker(THREE);
  const mutedQ = () => { try { return !!(isMuted && isMuted()); } catch (e) { return true; } };
  const HALL = { X0: -395, X1: -365, Z0: -70, Z1: -45 }, DIG = { X0: -415, X1: -395, Z0: -70, Z1: -45 }, DOOR = [-380, -45], ARCH = { x: -395, z0: -58.6, z1: -56.2 };
  const G = new THREE.Group(); G.name = 'ruinsJobs'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const toW = v => { G.updateWorldMatrix(true, false); return G.localToWorld(v.clone()); };
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const colF = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), colC = (x, z, r) => cols.push({ c: [x, z, r] });
  const plane = (tex, w, h, x, y, z, ry = 0, par = G, tr = true) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: tr })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 10) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 512, h = 96, fs = 54) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 18, H / 2 + 2, W - 36, fs); });
  const plaque = (t1, t2) => CT(512, 160, (g, W, H) => { g.fillStyle = '#2b2219'; g.fillRect(0, 0, W, H); g.strokeStyle = '#d7ad52'; g.lineWidth = 6; g.strokeRect(8, 8, W - 16, H - 16); g.fillStyle = '#e6d3a8'; g.textBaseline = 'middle'; fitTxt(g, t1, 26, H * 0.38, W - 52, 46); g.fillStyle = '#b89a66'; fitTxt(g, t2, 26, H * 0.72, W - 52, 26, 800); });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#d7ad52', SAND = '#cdb488', SANDD = '#a88b5e', STONE = '#bfb3a0', STONED = '#8f8574', WOOD = '#7a5a36', WOODD = '#4e3922', CLAY = '#b5603a', ROCK = '#8a7a66';
  // ---------- merged static geometry (one mesh for the whole dressing: phone budget) ----------
  const MG = (() => { const pos = [], nor = [], col = [], cc = new THREE.Color();
    const putM = (geo, m4, hex) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(m4); const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const put = (geo, hex, x, y, z, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => putM(geo, new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)), hex);
    return { put, b: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), hex, x, y, z, ry, rx, rz),
      c: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), hex, x, y, z, 0, rx, rz),
      s: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 10, 7), hex, x, y, z, 0, 0, 0, sx, sy, sz),
      d: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1, ry = 0) => put(new THREE.DodecahedronGeometry(r, 0), hex, x, y, z, ry, ry * 0.7, 0, sx, sy, sz),
      done() { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); const m = new THREE.Mesh(g0, new THREE.MeshLambertMaterial({ vertexColors: true })); G.add(m); return m; } }; })();
  // ================= floors =================
  const tileT = CT(256, 256, (g, w) => { g.fillStyle = '#c9b48e'; g.fillRect(0, 0, w, w); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const s = 0.86 + Math.random() * 0.14; g.fillStyle = 'rgb(' + (201 * s | 0) + ',' + (180 * s | 0) + ',' + (142 * s | 0) + ')'; g.fillRect(x * 64 + 2, y * 64 + 2, 60, 60); } g.strokeStyle = 'rgba(80,60,40,0.35)'; g.lineWidth = 1.5; for (let k = 0; k < 6; k++) { g.beginPath(); let x = Math.random() * w, y = Math.random() * w; g.moveTo(x, y); for (let j = 0; j < 3; j++) { x += rnd(-20, 20); y += rnd(-20, 20); g.lineTo(x, y); } g.stroke(); } });
  tileT.wrapS = tileT.wrapT = THREE.RepeatWrapping; tileT.repeat.set(10, 8);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(29.6, 24.6), new THREE.MeshLambertMaterial({ map: tileT, polygonOffset: true, polygonOffsetFactor: -1 })); f.rotation.x = -Math.PI / 2; f.position.set(-380, 0.05, -57.5); G.add(f); }
  const dirtT = CT(256, 256, (g, w) => { g.fillStyle = '#a88b5e'; g.fillRect(0, 0, w, w); for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(90,66,40,0.35)' : 'rgba(214,190,140,0.35)'; g.fillRect(Math.random() * w, Math.random() * w, 2 + Math.random() * 3, 2 + Math.random() * 3); } }); dirtT.wrapS = dirtT.wrapT = THREE.RepeatWrapping; dirtT.repeat.set(5, 6);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(19.6, 24.6), new THREE.MeshLambertMaterial({ map: dirtT, polygonOffset: true, polygonOffsetFactor: -1 })); f.rotation.x = -Math.PI / 2; f.position.set(-405, 0.05, -57.5); G.add(f); }
  // a worn runner down the walkway, door → Sage's desk (open walkway rule)
  MG.b(3.2, 0.02, 15.4, '#7a2f22', -380, 0.07, -53.9); MG.b(2.8, 0.022, 15.0, '#9a3d2a', -380, 0.075, -53.9);
  // ================= the partition + arch into the DIG ROOM =================
  const WH = 9.8; for (const [z0, z1] of [[-70, ARCH.z0], [ARCH.z1, -45]]) { MG.b(0.4, WH, z1 - z0, STONE, ARCH.x, WH / 2, (z0 + z1) / 2); colF(ARCH.x - 0.2, ARCH.x + 0.2, z0, z1); }
  { const w = ARCH.z1 - ARCH.z0, cz = (ARCH.z0 + ARCH.z1) / 2; MG.b(0.4, WH - 3.1, w, STONE, ARCH.x, 3.1 + (WH - 3.1) / 2, cz); for (const s of [-1, 1]) MG.b(0.6, 3.1, 0.3, STONED, ARCH.x, 1.55, cz + s * (w / 2 + 0.15)); MG.b(0.6, 0.4, w + 0.9, STONED, ARCH.x, 3.1, cz);
    plane(label('THE DIG ROOM', '#2b2219', GOLD, 512, 80, 42), 1.6, 0.25, ARCH.x + 0.21, 3.6, cz, Math.PI / 2); plane(label('BACK TO THE HALL', '#2b2219', GOLD, 512, 80, 40), 1.6, 0.25, ARCH.x - 0.21, 3.6, cz, -Math.PI / 2); }
  // ================= THE HALL =================
  // 4 sandstone columns + wall pilasters
  for (const [x, z] of [[-385.5, -50], [-374.5, -50], [-385.5, -59.5], [-374.5, -59.5]]) { MG.b(1.1, 0.4, 1.1, STONED, x, 0.2, z); MG.c(0.38, 0.42, 6.6, STONE, x, 3.7, z, 14); MG.b(1.0, 0.4, 1.0, STONED, x, 7.2, z); colC(x, z, 0.6); }
  for (const z of [-48, -54, -60, -66]) for (const x of [HALL.X0 + 0.3, HALL.X1 - 0.3]) if (!(x < -390 && z === -60)) MG.b(0.4, 7.6, 0.6, STONED, x, 3.8, z);
  // THE EIGHT GATES relief on the north wall behind the Sage
  const relT = CT(1024, 512, (g, W, H) => { g.fillStyle = '#b8a989'; g.fillRect(0, 0, W, H); for (let i = 0; i < 1400; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(80,66,46,0.18)' : 'rgba(255,245,220,0.18)'; g.fillRect(Math.random() * W, Math.random() * H, 3, 3); }
    g.strokeStyle = '#6e5f45'; g.lineWidth = 10; g.strokeRect(18, 18, W - 36, H - 36); const cx = W / 2, cy = H / 2 + 20;
    g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, 170, 0, 7); g.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 - Math.PI / 2, x = cx + Math.cos(a) * 170, y = cy + Math.sin(a) * 170; g.fillStyle = '#9c8c6c'; g.beginPath(); g.arc(x, y, 40, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#5e5039'; g.font = '900 40px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), x, y + 2); }
    g.fillStyle = '#d7ad52'; g.beginPath(); g.arc(cx, cy, 52, 0, 7); g.fill(); g.strokeStyle = '#5e5039'; g.stroke(); g.fillStyle = '#5e5039'; g.font = '900 30px Archivo, sans-serif'; g.fillText('MERU', cx, cy + 2);
    g.textAlign = 'left'; g.fillStyle = '#4e4230'; g.font = '900 44px Archivo, sans-serif'; g.fillText('THE EIGHT GATES', 46, 62);
    g.strokeStyle = 'rgba(60,48,32,0.75)'; g.lineWidth = 3; g.beginPath(); g.moveTo(W - 120, 30); g.lineTo(W - 170, 140); g.lineTo(W - 150, 230); g.lineTo(W - 220, 380); g.stroke(); });
  plane(relT, 9, 4.5, -380, 3.7, -69.62, 0, G, false); MG.b(9.4, 4.9, 0.12, STONED, -380, 3.7, -69.72);
  // the Sage's desk (end of the walkway, facing the door): ledger, magnifier, oil lamp
  MG.b(4.2, 0.92, 1.0, WOOD, -380, 0.46, -62.4); MG.b(4.4, 0.06, 1.15, WOODD, -380, 0.95, -62.4); MG.b(4.2, 0.6, 0.04, WOODD, -380, 0.5, -61.88);
  MG.b(0.6, 0.06, 0.42, '#efe2c4', -380.6, 1.01, -62.35); MG.b(0.02, 0.07, 0.42, '#7a2f22', -380.6, 1.02, -62.35); MG.c(0.06, 0.06, 0.012, '#9fd6ff', -379.4, 1.0, -62.3, 14); MG.b(0.18, 0.02, 0.025, WOODD, -379.25, 0.99, -62.2, 0.6);
  MG.c(0.09, 0.12, 0.08, CLAY, -381.7, 1.02, -62.5, 10); colF(-382.2, -377.8, -62.95, -61.85);
  // THE NINTH KEY (the far plinth, on your left) + the CRACKED GATE SIGIL (2D lines)
  const PL = [{ x: -390.5, z: -66.5 }, { x: -369.5, z: -66.5 }];
  for (const p of PL) { MG.b(1.0, 1.1, 1.0, STONED, p.x, 0.55, p.z); MG.b(1.15, 0.1, 1.15, STONE, p.x, 1.15, p.z); MG.b(1.15, 0.1, 1.15, STONE, p.x, 0.05, p.z); colF(p.x - 0.6, p.x + 0.6, p.z - 0.6, p.z + 0.6); }
  const KEY = new THREE.Group(); KEY.position.set(PL[0].x, 1.55, PL[0].z); G.add(KEY); { const gm = new THREE.MeshPhongMaterial({ color: GOLD, emissive: 0x3a2a08, shininess: 90 });
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 8, 18), gm); bow.position.y = 0.16; KEY.add(bow); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.3, 8), gm); KEY.add(sh);
    for (const [y, w] of [[-0.11, 0.07], [-0.06, 0.05]]) { const t = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, 0.02), gm); t.position.set(w / 2, y, 0); KEY.add(t); } const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.025), new THREE.MeshBasicMaterial({ color: '#9fd6ff' })); gem.position.y = 0.16; KEY.add(gem); }
  { const sig = new THREE.Group(); sig.position.set(PL[1].x, 1.48, PL[1].z); G.add(sig); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.07, 24), LM(STONE)); st.rotation.x = Math.PI / 2; sig.add(st); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const d = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), LM(i === 3 ? INK : '#6e5f45')); d.position.set(Math.cos(a) * 0.18, Math.sin(a) * 0.18, 0.04); sig.add(d); } const cr = box(sig, 0.012, 0.42, 0.075, INK, 0.03, 0, 0); cr.rotation.z = 0.35; sig.rotation.y = -0.4; }
  const domeM = new THREE.MeshPhongMaterial({ color: 0xdfefff, transparent: true, opacity: 0.22, shininess: 120, depthWrite: false });
  for (const p of PL) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.7, 20, 1, true), domeM); d.position.set(p.x, 1.55, p.z); d.renderOrder = 3; G.add(d); const t = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), domeM); t.rotation.x = -Math.PI / 2; t.position.set(p.x, 1.9, p.z); G.add(t); }
  plane(plaque('THE NINTH KEY', 'THERE WERE ONLY EVER EIGHT GATES \u00b7 NOT FOR SALE'), 0.9, 0.28, PL[0].x, 0.75, PL[0].z + 0.51, 0); plane(plaque('CRACKED GATE SIGIL', 'WORTH TWENTY GOLD \u00b7 THE SAGE KEEPS IT'), 0.9, 0.28, PL[1].x, 0.75, PL[1].z + 0.51, 0);
  // the big stone fox head, half dug out (centre right) + rubble
  { const x = -372.5, z = -62.2; MG.b(2.2, 0.5, 2.0, STONED, x, 0.25, z); MG.s(0.85, STONE, x, 1.35, z, 1, 0.9, 1); MG.b(0.6, 0.45, 0.8, STONE, x, 1.15, z + 0.75); MG.s(0.11, INK, x, 1.25, z + 1.17);
    for (const s of [-1, 1]) { MG.put(new THREE.ConeGeometry(0.3, 0.75, 4), STONE, x + s * 0.5, 2.2, z - 0.1, 0.78, 0, s * 0.25); MG.b(0.18, 0.08, 0.06, STONED, x + s * 0.32, 1.55, z + 0.8); }
    for (let k = 0; k < 8; k++) MG.d(rnd(0.1, 0.26), STONED, x + rnd(-1.4, 1.4), 0.12, z + rnd(-1.2, 1.3), 1, 0.7, 1, k); colF(x - 1.15, x + 1.15, z - 1.05, z + 1.05);
    plane(plaque('THE GATEKEEPER', 'STONE HEAD \u00b7 FOUND UNDER THIS FLOOR'), 0.9, 0.28, x, 0.3, z + 1.02, 0); }
  // display cases: 3 on the east wall (POLISH job), 2 on the west wall
  const CASES = [{ x: -366.0, z: -50, f: -1 }, { x: -366.0, z: -54, f: -1 }, { x: -366.0, z: -58, f: -1 }, { x: -394.0, z: -49.5, f: 1 }, { x: -394.0, z: -53.5, f: 1 }];
  const glassM = new THREE.MeshPhongMaterial({ color: 0xdfefff, transparent: true, opacity: 0.18, shininess: 120, depthWrite: false });
  const CASE_TXT = [['CLAY JARS', 'FIRST DIG \u00b7 THE HILL'], ['THE OLD COINS', 'STRUCK IN OLD MERU'], ['A GUARD\u2019S HELM', 'BRONZE \u00b7 DENTED'], ['THE MASKS', 'FESTIVAL OF GATES'], ['CLOAK PINS', 'SHARD WORK']];
  CASES.forEach((c, i) => { MG.b(0.72, 0.9, 1.25, WOODD, c.x, 0.45, c.z); MG.b(0.78, 0.05, 1.32, WOOD, c.x, 0.92, c.z); MG.b(0.78, 0.05, 1.32, WOOD, c.x, 1.74, c.z); for (const sz of [-1, 1]) for (const sx of [-1, 1]) MG.b(0.04, 0.82, 0.04, WOOD, c.x + sx * 0.36, 1.33, c.z + sz * 0.63);
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 1.22), glassM); g.position.set(c.x, 1.33, c.z); g.renderOrder = 3; G.add(g); colF(c.x - 0.4, c.x + 0.4, c.z - 0.66, c.z + 0.66);
    const y0 = 1.0, ox = c.x;
    if (i === 0) { for (let k = 0; k < 3; k++) { MG.c(0.08, 0.06, 0.2, CLAY, ox, y0 + 0.1, c.z - 0.35 + k * 0.35, 10); MG.c(0.04, 0.07, 0.06, CLAY, ox, y0 + 0.23, c.z - 0.35 + k * 0.35, 10); } }
    else if (i === 1) { for (let k = 0; k < 5; k++) MG.c(0.06, 0.06, 0.015, GOLD, ox, y0 + 0.01, c.z - 0.4 + k * 0.2, 14); }
    else if (i === 2) { MG.s(0.17, '#a0703a', ox, y0 + 0.14, c.z, 1, 0.9, 1); MG.b(0.36, 0.05, 0.05, '#a0703a', ox, y0 + 0.06, c.z); MG.b(0.04, 0.16, 0.36, RED, ox, y0 + 0.36, c.z); }
    else if (i === 3) { for (const k of [-1, 1]) { MG.s(0.13, k > 0 ? '#e9e1cf' : '#c9743a', ox, y0 + 0.22, c.z + k * 0.28, 0.5, 1, 1); MG.put(new THREE.ConeGeometry(0.05, 0.12, 4), k > 0 ? '#e9e1cf' : '#c9743a', ox, y0 + 0.38, c.z + k * 0.28 - 0.07); MG.put(new THREE.ConeGeometry(0.05, 0.12, 4), k > 0 ? '#e9e1cf' : '#c9743a', ox, y0 + 0.38, c.z + k * 0.28 + 0.07); } }
    else { for (let k = 0; k < 4; k++) MG.put(new THREE.OctahedronGeometry(0.04), ['#9fd6ff', GOLD, '#c4b5fd', RED][k], ox, y0 + 0.05, c.z - 0.33 + k * 0.22); }
    plane(plaque(CASE_TXT[i][0], CASE_TXT[i][1]), 0.8, 0.25, c.x + c.f * 0.37, 0.62, c.z, c.f > 0 ? Math.PI / 2 : -Math.PI / 2); });
  // the RESTORATION TABLE (GLUE THE POT job), west of the walkway
  const RT = { x: -387.5, z: -55.3, y: 0.94 }; MG.b(3.0, 0.06, 1.2, WOOD, RT.x, 0.9, RT.z); for (const sx of [-1.4, 1.4]) for (const sz of [-0.5, 0.5]) MG.b(0.08, 0.88, 0.08, WOODD, RT.x + sx, 0.44, RT.z + sz);
  MG.b(1.4, 0.012, 0.9, '#e7dcc4', RT.x, 0.935, RT.z); MG.c(0.04, 0.04, 0.1, '#e9e1cf', RT.x + 1.15, 0.99, RT.z - 0.35, 8); MG.b(0.3, 0.02, 0.2, WOODD, RT.x - 1.1, 0.94, RT.z - 0.3); colF(RT.x - 1.55, RT.x + 1.55, RT.z - 0.65, RT.z + 0.65);
  plane(label('RESTORATION', '#2b2219', GOLD, 512, 80, 42), 1.2, 0.19, RT.x, 0.75, RT.z + 0.61, 0);
  // banners + torches (sconces) along both long walls
  const BAN = CT(128, 384, (g, W, H) => { g.fillStyle = '#7a2f22'; g.fillRect(0, 0, W, H); g.fillStyle = GOLD; g.fillRect(0, 0, W, 10); g.beginPath(); g.moveTo(0, H); g.lineTo(W / 2, H - 40); g.lineTo(W, H); g.lineTo(W, H - 60); g.lineTo(0, H - 60); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 6; g.beginPath(); g.arc(W / 2, 150, 40, 0, 7); g.stroke(); g.fillStyle = GOLD; g.font = '900 40px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', W / 2, 152); });
  for (const [x, z, ry] of [[HALL.X1 - 0.08, -62, -Math.PI / 2], [HALL.X0 + 0.22, -63.5, Math.PI / 2]]) plane(BAN, 1.2, 3.6, x, 5.0, z, ry, G, false);
  const flameM = () => new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
  const TORCH = [[HALL.X1 - 0.3, -52, -1], [HALL.X1 - 0.3, -56, -1], [HALL.X1 - 0.3, -64, -1], [HALL.X0 + 0.5, -51.5, 1], [HALL.X0 + 0.5, -62, 1], [-383, -69.4, 0], [-377, -69.4, 0], [DIG.X0 + 1.2, -50, 1], [DIG.X0 + 1.2, -66, 1], [-398, -69.4, 0]].map(([x, z, s], i) => {
    const dx = s === 0 ? 0 : s * 0.25, dz = s === 0 ? 0.25 : 0; MG.b(s === 0 ? 0.12 : 0.08, 0.3, s === 0 ? 0.08 : 0.12, INK, x, 2.6, z); MG.c(0.05, 0.03, 0.34, WOODD, x + dx, 2.75, z + dz, 6, s === 0 ? -0.5 : 0, s * 0.5); MG.c(0.08, 0.05, 0.1, INK, x + dx * 1.4, 2.95, z + dz * 1.4, 8);
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 8), flameM()); fl.position.set(x + dx * 1.4, 3.12, z + dz * 1.4); G.add(fl); return { fl, i }; });
  // ================= THE DIG ROOM =================
  // the hill: a rock face + timber shoring along the west wall
  for (let k = 0; k < 46; k++) { const z = rnd(-69.5, -45.6), y = rnd(0, 8.5); MG.d(rnd(0.6, 1.4), k % 3 ? ROCK : '#7a6b58', DIG.X0 + rnd(0.2, 0.9), y, z, 1, rnd(0.7, 1.2), rnd(0.8, 1.3), k); }
  for (const z of [-48, -54, -62, -68]) { MG.b(0.3, 4.2, 0.3, WOOD, DIG.X0 + 1.5, 2.1, z); MG.b(1.0, 0.3, 0.3, WOOD, DIG.X0 + 1.1, 4.1, z); } MG.b(0.3, 0.3, 21, WOODD, DIG.X0 + 1.5, 4.3, -57.5); colF(DIG.X0, DIG.X0 + 1.7, DIG.Z0, DIG.Z1);
  // the DIG PIT: timber frame, sand, a string grid of 1 m squares (part B: dig a square)
  const PIT = { x0: -411.5, x1: -403.5, z0: -66.5, z1: -60.5 }; { const cx = (PIT.x0 + PIT.x1) / 2, cz = (PIT.z0 + PIT.z1) / 2, w = PIT.x1 - PIT.x0, d = PIT.z1 - PIT.z0;
    for (const [x, z, sx, sz] of [[cx, PIT.z0, w + 0.3, 0.15], [cx, PIT.z1, w + 0.3, 0.15], [PIT.x0, cz, 0.15, d], [PIT.x1, cz, 0.15, d]]) MG.b(sx, 0.4, sz, WOOD, x, 0.2, z); MG.b(w - 0.1, 0.3, d - 0.1, SAND, cx, 0.15, cz);
    for (let k = 1; k < w; k++) MG.b(0.012, 0.012, d, WHITE, PIT.x0 + k, 0.36, cz); for (let k = 1; k < d; k++) MG.b(w, 0.012, 0.012, WHITE, cx, 0.36, PIT.z0 + k);
    for (let i = 0; i <= w; i += 2) for (const z of [PIT.z0, PIT.z1]) MG.b(0.05, 0.5, 0.05, WOODD, PIT.x0 + i, 0.4, z); colF(PIT.x0 - 0.1, PIT.x1 + 0.1, PIT.z0 - 0.1, PIT.z1 + 0.1);
    for (let k = 0; k < 6; k++) MG.d(rnd(0.05, 0.12), STONED, rnd(PIT.x0 + 0.4, PIT.x1 - 0.4), 0.33, rnd(PIT.z0 + 0.4, PIT.z1 - 0.4), 1, 0.6, 1, k);
    plane(label('DIG PIT \u00b7 GRID A-H \u00b7 1-6', '#2b2219', GOLD, 512, 80, 34), 1.6, 0.25, cx, 0.55, PIT.z1 + 0.09, 0); }
  // the sieve on trestles, buckets, a wheelbarrow, spoil heap
  MG.b(1.4, 0.06, 0.9, WOOD, -401.2, 0.95, -64); MG.b(1.3, 0.02, 0.8, '#6e6e6e', -401.2, 0.98, -64); for (const sx of [-0.6, 0.6]) MG.b(0.06, 0.92, 0.9, WOODD, -401.2 + sx, 0.46, -64); colF(-402, -400.4, -64.5, -63.5);
  for (const [x, z] of [[-399.8, -62.7], [-400.4, -62.2]]) { MG.c(0.16, 0.13, 0.3, '#3d6b8a', x, 0.15, z, 10); MG.c(0.15, 0.15, 0.02, SAND, x, 0.29, z, 10); }
  MG.b(0.7, 0.3, 1.1, '#3f6a3a', -408.5, 0.55, -50.4); MG.c(0.18, 0.18, 0.08, INK, -408.5, 0.2, -49.7, 12, 0, Math.PI / 2); for (const s of [-1, 1]) MG.b(0.05, 0.05, 0.9, WOODD, -408.5 + s * 0.25, 0.55, -51.3); colF(-408.9, -408.1, -51.8, -49.6);
  MG.d(1.1, SANDD, -412.2, 0.3, -52.5, 1.3, 0.45, 1.2, 2); colC(-412.2, -52.5, 1.3);
  // the FINDS TABLE (BRUSH job) + shelves of labelled crates
  const FT = { x: -404, z: -51.5, y: 0.94 }; MG.b(3.0, 0.06, 1.2, WOOD, FT.x, 0.9, FT.z); for (const sx of [-1.4, 1.4]) for (const sz of [-0.5, 0.5]) MG.b(0.08, 0.88, 0.08, WOODD, FT.x + sx, 0.44, FT.z + sz);
  MG.b(1.2, 0.012, 0.8, '#3a3a44', FT.x, 0.935, FT.z); for (let k = 0; k < 4; k++) MG.b(0.22, 0.06, 0.16, '#e7dcc4', FT.x + 1.0, 0.96, FT.z - 0.4 + k * 0.24); colF(FT.x - 1.55, FT.x + 1.55, FT.z - 0.65, FT.z + 0.65);
  plane(label('FINDS \u00b7 BRUSH, DO NOT SCRUB', '#2b2219', GOLD, 512, 80, 34), 1.4, 0.22, FT.x, 0.75, FT.z + 0.61, 0);
  for (const z0 of [-69.4]) for (let i = 0; i < 2; i++) { const x = -400 + i * 2.4; MG.b(2.2, 2.6, 0.5, WOODD, x, 1.3, z0 + 0.25); for (const y of [0.5, 1.3, 2.1]) { MG.b(2.1, 0.04, 0.46, WOOD, x, y - 0.25, z0 + 0.27); for (let k = 0; k < 4; k++) MG.b(0.42, 0.34, 0.38, k % 2 ? '#a88b5e' : '#8a6d4a', x - 0.75 + k * 0.5, y - 0.06, z0 + 0.27); } colF(x - 1.1, x + 1.1, z0, z0 + 0.55); }
  const siteT = CT(512, 384, (g, W, H) => { g.fillStyle = '#e7dcc4'; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(6, 6, W - 12, H - 12); g.fillStyle = INK; g.font = '900 34px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('SITE PLAN \u00b7 THE HILL', 24, 36);
    g.lineWidth = 2; g.strokeStyle = '#7a5a36'; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(W / 2, H / 2 + 30, 30 + i * 18, 0, 7); g.stroke(); } g.fillStyle = RED; for (const [x, y] of [[180, 200], [300, 260], [350, 170], [230, 290]]) g.fillRect(x - 6, y - 6, 12, 12); g.fillStyle = INK; g.font = '800 18px Archivo, sans-serif'; g.fillText('\u25a0 = FINDS', 24, H - 24); });
  plane(siteT, 1.8, 1.35, -404, 2.2, -69.6, 0, G, false);
  // hanging work lamps
  const LAMPS = [[-405, 3.6, -51.5], [-407.5, 3.8, -63.5], [-400.5, 3.6, -64]]; for (const [x, y, z] of LAMPS) { MG.b(0.012, 9.6 - y, 0.012, INK, x, (9.6 + y) / 2, z); MG.c(0.06, 0.22, 0.18, '#3a3a3a', x, y, z, 10); }
  MG.done();
  // ================= the keepers =================
  let oldSage = null; scene.traverse(o => { if (!oldSage && o.userData && o.userData.foxKey === 'sage') oldSage = o; });
  const sage = kit.makeFox({ key: 'mrsSage', torso: SG.torso, outfit: 'robe', mood: 'warm', crest: 'M', look: SAGE_LOOK });
  const SAG = { x: -380, z: -63.6, ry: 0 }; sage.position.set(SAG.x, 0, SAG.z); G.add(sage); colC(SAG.x, SAG.z, 0.4);
  const sandy = kit.makeFox({ key: 'mrsSandy', torso: SD.torso, outfit: 'vest', mood: 'happy', female: true, look: { fur: '#d9874a', furDark: '#a65e2c' } }); sandy.scale.setScalar(0.86);
  const SAN = { x: -401.6, z: -57.6, ry: Math.PI / 2 }; sandy.position.set(SAN.x, 0, SAN.z); sandy.rotation.y = SAN.ry; G.add(sandy); colC(SAN.x, SAN.z, 0.35);
  { const P0 = sandy.userData && sandy.userData.P; if (P0 && P0.head) { const hat = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), LM(YEL)); hat.position.y = 0.16; P0.head.add(hat); const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.02, 16), LM(YEL)); brim.position.y = 0.16; P0.head.add(brim); const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 10), new THREE.MeshBasicMaterial({ color: '#fff6c0' })); lamp.rotation.x = Math.PI / 2; lamp.position.set(0, 0.24, 0.17); P0.head.add(lamp); } }
  const kT = { key: 'mrsSage', name: SG.name, role: SG.role, obj: sage, ry: SAG.ry, r: 6 }, sT = { key: 'mrsSandy', name: SD.name, role: SD.role, obj: sandy, ry: SAN.ry, r: 6 };
  const ln = text => ({ who: 'mrsSage', role: SG.role, text }), lnS = text => ({ who: 'mrsSandy', role: SD.role, text }), me = text => ({ who: 'player', text });
  // ================= rings + shop kit =================
  const RINGS = { pot: [RT.x, -53.75], cases: [-368.7, -54], brush: [FT.x, -49.95], sort: [-371.5, -55.6], appraise: [-378.75, -60.85], mosaic: [-390.5, -59.65], catalogue: [-398.8, -67.0], dig: [-407.5, -59.55], rub: [-411.5, -48.3] };
  for (const k in RINGS) { const [x, z] = RINGS[k]; const r1 = cyl(G, 0.5, 0.5, 0.012, YEL, x, 0.09, z, 22), r2 = cyl(G, 0.42, 0.42, 0.014, INK, x, 0.092, z, 22); r1.renderOrder = r2.renderOrder = 2; }
  const GAMES = [{ k: 'pot', name: 'Glue the Broken Pot', color: '#c2410c', grp: 'sage' }, { k: 'cases', name: 'Polish the Display Cases', color: '#38bdf8', grp: 'sage' }, { k: 'brush', name: 'Brush Off a Find', color: '#e6b45a', grp: 'sandy' },
    { k: 'sort', name: 'Sort Relics by Age', color: '#8a6d3b', grp: 'sage' }, { k: 'appraise', name: 'Real or Fake?', color: '#c8262c', grp: 'sage' }, { k: 'mosaic', name: 'Restore the Mosaic', color: '#2e4a6b', grp: 'sage' }, { k: 'watch', name: 'Night Watch', color: '#26306b', grp: 'sage', walk: true },
    { k: 'catalogue', name: 'Catalogue the Finds', color: '#3f6a3a', grp: 'sandy' }, { k: 'dig', name: 'Dig a Square', color: '#a88b5e', grp: 'sandy' }, { k: 'rub', name: 'Rub a Carving', color: '#5e5039', grp: 'sandy' }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), pre = 'mrs';
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted: mutedQ, prefix: pre, color: SG.color, boardTitle: "The Sage's best", toWorld: toW, room: { X0: DIG.X0, X1: HALL.X1, Z0: HALL.Z0, Z1: HALL.Z1 }, door: [DOOR[0], DOOR[1] - 0.5], keeper: sage, keeperRy: SAG.ry, games: GAMES,
    board: { x: -372.5, y: 2.6, z: -45.42, ry: Math.PI, w: 1.2 }, hiring: { x: -383.6, y: 0, z: -47.3, ry: 0 }, hiringLine: 'THE MUSEUM NEEDS PAWS',
    sun: [{ x: -380, z: -47.6, w: 3.2, d: 2.2 }, { x: -404, z: -55, w: 3.0, d: 2.4 }], lamps: [...TORCH.map(t => [t.fl.position.x, t.fl.position.y, t.fl.position.z]), ...LAMPS.map(([x, y, z]) => [x, y - 0.15, z])],
    browse: [[-391.9, -51.5, -Math.PI / 2], [-368.3, -50, Math.PI / 2], [-390.5, -64.9, Math.PI], [-372.5, -60.2, Math.PI]], slots: 2, clock: { x: -388.5, y: 3.2, z: -45.42, ry: Math.PI } });
  // ================= state, sound, card UI (same card as every shop) =================
  let toastTxt = '', toastT = 0, talked = 0, talkedS = 0, busy = null, J = null, thanks = null, lastP = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at0 = 0) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at0, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = bf; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1175, 0.07, 0.9); tone(1568, 0.04, 0.9); }, nope = () => tone(196, 0.05, 0.25, 'square'), chimes = () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.03, 0.5, 'triangle', i * 0.07)), clack = () => { tone(520, 0.05, 0.08, 'square'); noise(0.06, 0.02, 1500); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + SG.color + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span></div>';
  const gauge = v => '<div style="position:relative;height:16px;border:2px solid #201e1d;background:#ffffff;margin-top:6px"><div style="position:absolute;top:0;bottom:0;left:0;width:' + Math.max(0, Math.min(100, v * 100)).toFixed(1) + '%;background:#3fd36a"></div></div>';
  const setCard = (k, html) => { if (k === cardKey) return; cardKey = k; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && !!J && !GN[J.g].walk;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), TAPR = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(toW(v)).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearest = (list, posOf, r) => { let best = -1, bd = r; list.forEach((it, i) => { const d = dist(scrW(posOf(it))); if (d < bd) { bd = d; best = i; } }); return best; };
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), inv = new THREE.Matrix4();
  const ray = () => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); G.updateWorldMatrix(true, false); inv.copy(G.matrixWorld).invert(); return rc.ray.clone().applyMatrix4(inv); };
  const hitY = y => { const r = ray(); if (Math.abs(r.direction.y) < 1e-4) return null; const t = (y - r.origin.y) / r.direction.y; return t > 0 ? r.origin.clone().addScaledVector(r.direction, t) : null; };
  const hitX = x => { const r = ray(); if (Math.abs(r.direction.x) < 1e-4) return null; const t = (x - r.origin.x) / r.direction.x; return t > 0 ? r.origin.clone().addScaledVector(r.direction, t) : null; };
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (after, t = 1.0) => { J.pause = t; J.after = after; };
  const done = () => save.stat(pre + 'Done', null) || {};
  const softT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 2, 32, 32, 31); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.6, 'rgba(255,255,255,0.8)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const PUFF = []; const puff = (p, col = '#d9c39a', n = 3, sz = 0.07) => { for (let k = 0; k < n; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: softT, color: col, transparent: true, depthWrite: false })); sp.scale.setScalar(sz); sp.position.copy(p); G.add(sp); PUFF.push({ sp, v: V(rnd(-0.3, 0.3), rnd(0.15, 0.5), rnd(-0.3, 0.3)), t: 0.7, s: sz }); } };
  // ================= JOB 1: GLUE THE BROKEN POT (Sage) — tap a shard, then tap the gap with the same mark =================
  const MARKS = [['tri', '#ffd23a'], ['circ', '#7dd3fc'], ['sq', '#86efac'], ['cross', '#f9a8d4'], ['dia', '#fdba74'], ['star', '#c4b5fd']];
  const drawMark = (g, k, cx, cy, s, col) => { g.strokeStyle = col; g.fillStyle = col; g.lineWidth = s * 0.22; g.beginPath();
    if (k === 'tri') { g.moveTo(cx, cy - s); g.lineTo(cx + s * 0.9, cy + s * 0.7); g.lineTo(cx - s * 0.9, cy + s * 0.7); g.closePath(); g.stroke(); }
    else if (k === 'circ') { g.arc(cx, cy, s * 0.8, 0, 7); g.stroke(); } else if (k === 'sq') { g.strokeRect(cx - s * 0.7, cy - s * 0.7, s * 1.4, s * 1.4); }
    else if (k === 'cross') { g.moveTo(cx - s * 0.75, cy - s * 0.75); g.lineTo(cx + s * 0.75, cy + s * 0.75); g.moveTo(cx + s * 0.75, cy - s * 0.75); g.lineTo(cx - s * 0.75, cy + s * 0.75); g.stroke(); }
    else if (k === 'dia') { g.moveTo(cx, cy - s); g.lineTo(cx + s * 0.75, cy); g.lineTo(cx, cy + s); g.lineTo(cx - s * 0.75, cy); g.closePath(); g.stroke(); }
    else { for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? s * 0.42 : s; i ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.fill(); } };
  const jag = (g, W, fill) => { g.fillStyle = fill; g.beginPath(); const n = 9; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = W * (0.36 + Math.random() * 0.12); i ? g.lineTo(W / 2 + Math.cos(a) * r, W / 2 + Math.sin(a) * r) : g.moveTo(W / 2 + Math.cos(a) * r, W / 2 + Math.sin(a) * r); } g.closePath(); g.fill(); };
  const gapTex = (k, col) => CT(128, 128, (g, W) => { jag(g, W, '#2a1a12'); drawMark(g, k, W / 2, W / 2, 20, col); });
  const shardTex = (k, col) => CT(128, 128, (g, W) => { jag(g, W, '#b5603a'); g.strokeStyle = '#7a3a22'; g.lineWidth = 4; g.beginPath(); g.moveTo(10, W * 0.62); g.lineTo(W - 10, W * 0.58); g.stroke(); drawMark(g, k, W / 2, W / 2, 20, col); });
  const POT = V(RT.x, RT.y, RT.z - 0.15), PROF = [[0, 0], [0.12, 0], [0.18, 0.07], [0.225, 0.18], [0.215, 0.3], [0.15, 0.4], [0.12, 0.45], [0.14, 0.5]];
  const potR = h => { for (let i = 1; i < PROF.length; i++) if (h <= PROF[i][1]) { const [r0, h0] = PROF[i - 1], [r1, h1] = PROF[i]; return r0 + (r1 - r0) * (h - h0) / (h1 - h0 || 1); } return 0.14; };
  const potM = new THREE.MeshLambertMaterial({ color: CLAY });
  const G1 = {
    begin() { Object.assign(J, { N: 3, n: 0, sel: -1 }); toast('TAP A SHARD, THEN THE GAP WITH ITS MARK', 2.6); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } if (J.pot) J.pot.parent && J.pot.parent.remove(J.pot); J.t0 = J.t; J.over = false; J.sel = -1;
      const pg = own(new THREE.Group()); pg.position.copy(POT); J.pot = pg; const body = new THREE.Mesh(new THREE.LatheGeometry(PROF.map(([r, h]) => new THREE.Vector2(r, h)), 22), potM); pg.add(body);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.222, 0.012, 6, 28), LM('#5e2a18')); band.rotation.x = Math.PI / 2; band.position.y = 0.24; pg.add(band);
      const n = 3 + J.n, ks = MARKS.slice().sort(() => Math.random() - 0.5).slice(0, n); J.gaps = []; J.sh = [];
      const slots = [[-0.75, 0.13], [-0.25, 0.31], [0.3, 0.12], [0.7, 0.3], [0.05, 0.22], [-0.6, 0.34]].slice(0, n);
      ks.forEach(([k, col], i) => { const [a, h] = slots[i], r = potR(h) + 0.006, s = 0.11; const gm = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: gapTex(k, col), transparent: true, alphaTest: 0.3 }));
        gm.position.set(Math.sin(a) * r, h, Math.cos(a) * r); gm.lookAt(V(Math.sin(a) * 2, h, Math.cos(a) * 2)); gm.renderOrder = 4; pg.add(gm); J.gaps.push({ k, m: gm, full: false });
        const sm = own(new THREE.Mesh(new THREE.PlaneGeometry(s * 1.15, s * 1.15), new THREE.MeshBasicMaterial({ map: shardTex(k, col), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide })));
        sm.rotation.set(-1.05, 0, rnd(-0.5, 0.5)); sm.renderOrder = 4; J.sh.push({ k, m: sm, home: null, fly: null, gi: -1, placed: false }); });
      const order = J.sh.slice().sort(() => Math.random() - 0.5); order.forEach((s, i) => { s.home = V(RT.x - 0.5 + i * (1.0 / Math.max(1, n - 1)), RT.y + 0.012, RT.z + 0.32); s.m.position.copy(s.home); }); },
    press() { const i = nearest(J.sh, s => s.m.position, TAPR() * 1.1); const s = i >= 0 ? J.sh[i] : null;
      if (s && !s.placed && !s.fly) { if (J.sel >= 0) J.sh[J.sel].m.position.copy(J.sh[J.sel].home); J.sel = i; s.m.position.y = s.home.y + 0.06; clack(); return; }
      if (J.sel < 0) return; const gi = nearest(J.gaps, g => toPot(g.m.position), TAPR() * 1.15); if (gi < 0) return; const gp = J.gaps[gi], sh = J.sh[J.sel]; if (gp.full) return;
      if (gp.k === sh.k) { gp.full = true; sh.placed = true; sh.gi = gi; sh.fly = { t: 0, from: sh.m.position.clone(), q0: sh.m.quaternion.clone() }; J.sel = -1; tone(660 + gi * 90, 0.05, 0.3, 'triangle'); addGold(2); }
      else { miss('WRONG GAP \u00b7 LOOK AT THE MARK', 1.6); sh.m.position.copy(sh.home); J.sel = -1; } },
    tick(dt) { for (const s of J.sh) if (s.fly) { s.fly.t = Math.min(1, s.fly.t + dt * 2.6); const gm = J.gaps[s.gi].m, wp = toPot(gm.position), q = new THREE.Quaternion(); gm.getWorldQuaternion(q); const gq = new THREE.Quaternion().copy(G.getWorldQuaternion(new THREE.Quaternion())).invert().multiply(q);
        const e = s.fly.t * s.fly.t * (3 - 2 * s.fly.t); s.m.position.lerpVectors(s.fly.from, wp, e); s.m.position.y += Math.sin(e * Math.PI) * 0.12; s.m.quaternion.slerpQuaternions(s.fly.q0, gq, e);
        if (s.fly.t >= 1) { s.fly = null; gm.visible = false; s.m.position.copy(wp).add(V(gm.position.x, 0, gm.position.z).normalize().multiplyScalar(0.003)); clack(); puff(wp, '#e9e1cf', 2, 0.05); } }
      if (J.pot) J.pot.rotation.y = Math.sin(J.t * 0.6) * 0.06;
      if (!J.over && J.sh.length && J.sh.every(s => s.placed && !s.fly)) { J.over = true; chimes(); addGold(J.t - J.t0 < 15 ? 4 : 3); toast(J.n + 1 < J.N ? 'WHOLE AGAIN \u00b7 NEARLY' : 'THREE POTS, MENDED', 1.4); J.n++; NEXT(() => G1.next(), 1.4); }
      if (!J.over && J.t - J.t0 > 35) { J.over = true; miss('OUT OF TIME \u00b7 THE SAGE FINISHES IT'); J.n++; NEXT(() => G1.next(), 1.2); } },
    hint() { if (J.sel >= 0) { const g = J.gaps.find(q => !q.full && q.k === J.sh[J.sel].k); return g ? [toPot(g.m.position), 'GAP'] : null; } const s = J.sh.find(q => !q.placed); return s ? [s.m.position, 'SHARD'] : null; },
    card() { const left = J.sh ? J.sh.filter(s => !s.placed).length : 0; return ['POT ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, '<div style="font-size:13px;font-weight:800">' + (J.sel >= 0 ? 'NOW TAP ITS GAP' : 'SHARDS LEFT \u00b7 ' + left) + '</div>' + gauge(1 - Math.max(0, J.t - J.t0) / 35), J.n + '_' + left + '_' + J.sel]; },
    shot() { return [V(RT.x, RT.y + 0.22, RT.z + 0.05), 1.25, 0.7, 0.42, 1.0, 0, 2.0]; },
    end() {} };
  const toPot = p => (J && J.pot ? J.pot.localToWorld(p.clone()).applyMatrix4(new THREE.Matrix4().copy(G.matrixWorld).invert()) : p);
  // ================= JOB 2: POLISH THE DISPLAY CASES (Sage) — drag the cloth over the paw prints on the glass =================
  const pawT = CT(128, 128, g => { g.fillStyle = 'rgba(90,80,70,0.85)'; g.beginPath(); g.ellipse(64, 80, 26, 22, 0, 0, 7); g.fill(); for (const [x, y] of [[30, 44], [52, 30], [76, 30], [98, 44]]) { g.beginPath(); g.ellipse(x, y, 10, 13, 0, 0, 7); g.fill(); } });
  const CLOTH = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshLambertMaterial({ color: '#c9a46a', side: THREE.DoubleSide })); CLOTH.visible = false; CLOTH.renderOrder = 7; G.add(CLOTH);
  const GLX = CASES[0].x - 0.36;
  const G2 = {
    begin() { Object.assign(J, { N: 3, n: 0, sm: [] }); toast('RUB THE PAW PRINTS OFF THE GLASS', 2.4); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } J.sm.forEach(s => s.m.parent && s.m.parent.remove(s.m)); J.sm = []; J.t0 = J.t; J.over = false; const c = CASES[J.n], n = 5 + J.n;
      for (let i = 0; i < n; i++) { let y, z; for (let k = 0; k < 30; k++) { y = rnd(1.02, 1.64); z = c.z + rnd(-0.5, 0.5); if (J.sm.every(s => Math.hypot(s.m.position.y - y, s.m.position.z - z) > 0.17)) break; }
        const m = own(new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.12), new THREE.MeshBasicMaterial({ map: pawT, transparent: true, opacity: 0.8, depthWrite: false }))); m.position.set(GLX - 0.006, y, z); m.rotation.set(0, -Math.PI / 2, rnd(-0.6, 0.6)); m.renderOrder = 6; J.sm.push({ m, dirt: 1 }); } },
    press() { CLOTH.visible = true; },
    drag() { if (!ptr.down) return; const p = hitX(GLX - 0.02); if (p) { CLOTH.position.copy(p); CLOTH.rotation.set(0, -Math.PI / 2, J.t * 3); CLOTH.visible = true; }
      const R = TAPR() * 0.9; for (const s of J.sm) { if (s.dirt <= 0) continue; if (dist(scrW(s.m.position)) < R) { s.dirt -= 0.12; s.m.material.opacity = Math.max(0, s.dirt) * 0.8; if (Math.random() < 0.3) noise(0.05, 0.01, 6000); if (s.dirt <= 0) { s.m.visible = false; addGold(1); tone(880 + J.sm.indexOf(s) * 60, 0.03, 0.2); } } }
      if (J.sm.length && J.sm.every(s => s.dirt <= 0) && !J.over) { J.over = true; chimes(); addGold(J.t - J.t0 < 10 ? 4 : 3); toast(J.n + 1 < J.N ? 'CLEAR AS AIR' : 'THE CASES GLEAM', 1.4); J.n++; NEXT(() => G2.next(), 1.2); } },
    release() { CLOTH.visible = false; },
    tick() { if (!J.over && J.t - J.t0 > 22) { J.over = true; miss('TOO SLOW \u00b7 THE SAGE TUTS AND WIPES IT'); J.n++; NEXT(() => G2.next(), 1.2); } },
    hint() { const s = J.sm.find(q => q.dirt > 0); return s ? [s.m.position, 'RUB'] : null; },
    card() { const left = J.sm.filter(s => s.dirt > 0).length; return ['CASE ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, '<div style="font-size:13px;font-weight:800">PAW PRINTS LEFT \u00b7 ' + left + '</div>' + gauge(1 - Math.max(0, J.t - J.t0) / 22), J.n + '_' + left]; },
    shot() { const c = CASES[Math.min(J.n, 2)]; return [V(c.x, 1.33, c.z), 1.5, 0.95, 0.1, 1.2, -Math.PI / 2, 2.3]; },
    end() { CLOTH.visible = false; } };
  // ================= JOB 3: BRUSH OFF A FIND (Sandy) — drag the brush over the clods of dirt =================
  const FIND = V(FT.x, FT.y, FT.z), BRUSH = new THREE.Group(); { const h = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.2), LM(WOOD)); h.position.z = 0.1; BRUSH.add(h); const b = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.05), LM('#e8d9b0')); b.position.set(0, -0.015, -0.01); BRUSH.add(b); } BRUSH.visible = false; G.add(BRUSH);
  const FINDS = [['A CLAY OIL LAMP', g => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 8), LM(CLAY)); b.scale.set(1, 0.45, 0.8); b.position.y = 0.05; g.add(b); const s = box(g, 0.05, 0.03, 0.12, CLAY, 0, 0.05, 0.12); s.rotation.x = 0.1; const h = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12, Math.PI), LM(CLAY)); h.position.set(0, 0.08, -0.1); g.add(h); }],
    ['A GATE COIN', g => { cyl(g, 0.1, 0.1, 0.02, GOLD, 0, 0.012, 0, 20); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, d = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 4), LM('#8a6a22')); d.position.set(Math.cos(a) * 0.065, 0.024, Math.sin(a) * 0.065); g.add(d); } }],
    ['A STONE FOX', g => { box(g, 0.1, 0.09, 0.16, STONE, 0, 0.05, 0); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), LM(STONE)); hd.position.set(0, 0.13, 0.08); g.add(hd); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 4), LM(STONE)); e.position.set(s * 0.03, 0.19, 0.07); g.add(e); } const t = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 6), LM(STONE)); t.rotation.x = -1.2; t.position.set(0, 0.06, -0.13); g.add(t); }]];
  const clodG = new THREE.DodecahedronGeometry(0.034, 0), clodM = LM('#7a5a36'), clodM2 = LM('#9a7a4e');
  const G3 = {
    begin() { Object.assign(J, { N: 3, n: 0, cl: [] }); toast('BRUSH THE DIRT OFF \u00b7 SOFT STROKES', 2.4); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } if (J.find) J.find.parent && J.find.parent.remove(J.find); J.cl.forEach(c => c.m.parent && c.m.parent.remove(c.m)); J.cl = []; J.t0 = J.t; J.over = false;
      const g = own(new THREE.Group()); g.position.copy(FIND); FINDS[J.n][1](g); J.find = g; const n = 8 + J.n * 2;
      for (let i = 0; i < n; i++) { let d; for (let k = 0; k < 30; k++) { d = V(rnd(-1, 1), rnd(0.15, 1), rnd(-0.6, 1)).normalize(); if (J.cl.every(c => c.d.distanceTo(d) > 0.5)) break; }
        const m = own(new THREE.Mesh(clodG, i % 2 ? clodM : clodM2)); m.position.copy(FIND).add(V(d.x * 0.11, 0.04 + d.y * 0.08, d.z * 0.11)); m.rotation.set(rnd(0, 3), rnd(0, 3), 0); m.scale.setScalar(rnd(1.0, 1.5)); J.cl.push({ m, d, dirt: 1, s0: m.scale.x }); } },
    press() { BRUSH.visible = true; },
    drag() { if (!ptr.down) return; const p = hitY(FIND.y + 0.1); if (p) { BRUSH.position.copy(p); BRUSH.rotation.set(0, Math.sin(J.t * 18) * 0.5, 0); BRUSH.visible = true; }
      const R = TAPR() * 0.9; for (const c of J.cl) { if (c.dirt <= 0) continue; if (dist(scrW(c.m.position)) < R) { c.dirt -= 0.1; c.m.scale.setScalar(c.s0 * Math.max(0.05, c.dirt)); if (Math.random() < 0.35) { noise(0.06, 0.012, 2500); puff(c.m.position, '#c9b48a', 1, 0.05); } if (c.dirt <= 0) { c.m.visible = false; addGold(1); } } }
      if (J.cl.length && J.cl.every(c => c.dirt <= 0) && !J.over) { J.over = true; chimes(); addGold(J.t - J.t0 < 12 ? 4 : 3); toast(FINDS[J.n][0] + '!', 1.6); J.n++; NEXT(() => G3.next(), 1.6); } },
    release() { BRUSH.visible = false; },
    tick() { if (J.find) J.find.rotation.y += 0.002; if (!J.over && J.t - J.t0 > 25) { J.over = true; miss('TOO SLOW \u00b7 SANDY BRUSHES THE REST'); J.n++; NEXT(() => G3.next(), 1.2); } },
    hint() { const c = J.cl.find(q => q.dirt > 0); return c ? [c.m.position, 'BRUSH'] : null; },
    card() { const left = J.cl.filter(c => c.dirt > 0).length; return ['FIND ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, '<div style="font-size:13px;font-weight:800">DIRT LEFT \u00b7 ' + left + '</div>' + gauge(1 - Math.max(0, J.t - J.t0) / 25), J.n + '_' + left]; },
    shot() { return [V(FT.x, FT.y + 0.06, FT.z), 0.75, 0.5, 0.62, 0.8, 0, 1.6]; },
    end() { BRUSH.visible = false; } };
  const GD = { pot: G1, cases: G2, brush: G3 };
  const JX = new Proxy({}, { get: (_, k) => J && J[k], set: (_, k, v) => { if (J) J[k] = v; return true; } });
  const XB = rsJobsB({ THREE, G, V, LM, CT, box, cyl, colF, colC, plane, label, plaque, JX, own, miss, addGold, NEXT, toast, finishGame, tone, noise, chimes, clack, puff, TAPR, scrW, dist, nearest, ptr, ray, hitY, hitX, rnd, gauge, kit, PIT, drawMark,
    C: { INK, RED, YEL, WHITE, GOLD, STONE, STONED, WOOD, WOODD, CLAY, SAND } });
  Object.assign(GD, XB.GD); SG.tips.push(XB.tips[0], XB.tips[1]); SD.tips.push(XB.tips[2], XB.tips[3]);
  const PZ = rsPrizes({ THREE, G, LM, CT, box, cyl, plane, colF, colC, fitTxt, save, wear, hour, RELICS, FINDS, pre, GOLD, INK, YEL, WOOD, WOODD });
  let LF = null; try { LF = rsLife({ THREE, G, scene, save, kit, CT, LM, softT, hour, touch, mutedQ, ground, TORCH, LAMPS, sandy, inRoom: P => inRoom(P), tone, noise, toast, RINGS, YEL, INK }); } catch (e) { console.warn('ruins life: ' + (e && e.stack || e)); }
  const arrowM = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: RED })); arrowM.rotation.x = Math.PI; arrowM.visible = false; arrowM.renderOrder = 5; G.add(arrowM);
  const beacon = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 24), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.8, depthWrite: false })); beacon.rotation.x = -Math.PI / 2; beacon.visible = false; G.add(beacon);
  // ================= run a game =================
  const KEEP = g => (GN[g] && GN[g].grp === 'sandy' ? SD.name : SG.name).toUpperCase();
  function startGame(g, P) { if (busy || !GD[g]) return; J = { g, miss: 0, gold: 0, objs: [], t: 0, pause: 0, P }; busy = 'job'; const R = RINGS[g]; if (P && R && !GN[g].walk) Object.assign(P, { x: R[0], z: R[1], sp: 0 }); GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(8); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat(pre + 'Done', d); save.setStat(pre + 'Clears', save.stat(pre + 'Clears', 0) + 1);
    K.finish(g, stars, gold, first); stop(); const pz = PZ.gift(); thanks = { g, gold, by: GN[g].grp, pz }; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 +' + gold + ' GOLD' + (pz.length ? ' \u00b7 PRIZE: ' + PZ.label(pz) : ''), pz.length ? 3.4 : 2.6); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) J.objs.forEach(o => o.parent && o.parent.remove(o)); busy = null; J = null; ptr.down = false; hideCard(); arrowM.visible = beacon.visible = false; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g], c = g.card && g.card(); if (!c) { hideCard(); return; } setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? J.gold + ' G' : KEEP(J.g)) + foot(c[0]) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0) J.pause = 0; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return;
    const go = g.goal ? g.goal() : null; if (go) { arrowM.visible = beacon.visible = true; arrowM.position.set(go[0], go[2] + 1.9 + Math.sin(J.t * 4) * 0.15, go[1]); arrowM.rotation.y += dt * 2; beacon.position.set(go[0], 0.1 + go[2], go[1]); } else arrowM.visible = beacon.visible = false;
    drawCard(); }
  // ---------- camera: job shots, clamped inside the room the shot is in ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !GN[J.g].walk && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    const RB = camT.look.x < ARCH.x ? DIG : HALL; camCur.pos.x = clamp(camCur.pos.x, RB.X0 + 1.9, RB.X1 - 0.4); camCur.pos.z = clamp(camCur.pos.z, RB.Z0 + 0.4, RB.Z1 - 0.4); camCur.pos.y = clamp(camCur.pos.y, 0.6, 6); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.830-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- the Sage's standing relic offer (2D, verbatim) ----------
  const sellable = () => ((save.data && save.data.relics) || []).filter(id => RELICS[id]);
  function sell() { const L = sellable(); if (!L.length) { sayTo(kT, [ln('Your pack is empty, child.'), ln('Go and look. The ruins below are full of it.')]); return; }
    let total = 0; const lines = [ln('Let me see it, then.')], sold = { ...(save.stat(pre + 'Sold', null) || {}) };
    for (const id of L) { const r = RELICS[id]; if (!save.dropRelic(id)) continue; const pr = PZ.price(id); total += pr.v; sold[id] = (sold[id] || 0) + 1; lines.push(ln(r.name.toUpperCase() + '. ' + r.remark), ln(pr.dbl ? 'And it is WANTED today. ' + pr.v + ' gold. Double, as promised.' : pr.v + ' gold. Its full worth, as promised.')); }
    if (total) { save.addGold(total); save.setStat(pre + 'Sold', sold); chimes(); const dz = PZ.afterSell(); lines.push(ln('It goes on the COLLECTION WALL. With your name under it.')); if (dz) lines.push(ln(PZ.line([dz]))); toast('SOLD TO THE SAGE \u00b7 +' + total + ' GOLD' + (dz ? ' \u00b7 PRIZE: ' + PZ.label([dz]) : ''), 2.6); } sayTo(kT, lines); }
  // ---------- places, talk + prompt ----------
  const inRoom = P => P.x > DIG.X0 && P.x < HALL.X1 && P.z > HALL.Z0 && P.z < HALL.Z1 && Math.abs(P.y || 0) < 4;
  const ringAt = P => { for (const k in RINGS) { const [x, z] = RINGS[k]; if (Math.hypot(P.x - x, P.z - z) < 1.05) return GN[k]; } return null; };
  const nearSage = P => Math.hypot(P.x - SAG.x, P.z - SAG.z) < 3.6 && P.x > ARCH.x, nearSandy = P => Math.hypot(P.x - SAN.x, P.z - SAN.z) < 2.8 && P.x < ARCH.x;
  function prompt(P) { if (J && GN[J.g].walk) { const gp = GD[J.g].prompt ? GD[J.g].prompt(P) : null; return gp || (nearSage(P) ? 'THE SAGE · STOP THE JOB' : null); } if (busy || !inRoom(P)) return null; const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; if (PZ.nearWanted(P)) return 'READ \u00b7 WANTED TODAY'; if (nearSandy(P)) return 'TALK \u00b7 ' + SD.name.toUpperCase(); if (nearSage(P)) return 'TALK \u00b7 THE ' + SG.name.toUpperCase(); return null; }
  const nextJob = grp => { const d = done(), L = GAMES.filter(q => GD[q.k] && (!grp || q.grp === grp)); return (L.find(q => !d[q.k]) || L.slice().sort((a, c) => K.stars(a.k) - K.stars(c.k))[0]).k; };
  const sub = (T, lnF, grp, line) => sayTo(T, [{ ...lnF(line), choices: [...GAMES.filter(q => q.grp === grp).map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => { if (!busy) startGame(q.k, lastP); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const sageMenu = open => { const n = sellable().length; return { ...ln(open), choices: [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(), lastP); } }, { text: 'MUSEUM JOBS', pick: () => sub(kT, ln, 'sage', 'Careful paws, old things. Choose.') },
    { text: n ? 'I HAVE SOMETHING FOR YOU. (' + n + ')' : 'I HAVE SOMETHING FOR YOU.', pick: () => sell() },
    { text: 'WHICH PIECE IS THE PRIZE?', pick: () => sayTo(kT, [ln('THE NINTH KEY. The far plinth, on your left. There were only ever EIGHT gates. And yet.'), ln('Every scholar who explains it argues with the last. I would not sell it for a kingdom.'), ln('The CRACKED GATE SIGIL I keep too. Worth twenty gold. Do not ask me to be consistent.')]) },
    { text: 'WHAT SHOULD I LOOK FOR?', pick: () => sayTo(kT, [ln('Anything old that someone bothered to make BEAUTIFUL. A pin. A coin. A carving.'), ln('The bandits below have been pocketing things for years. They do not know what they hold. You will.')]) },
    { text: 'A TIP, PLEASE', pick: () => sayTo(kT, [ln(SG.tips[talked % SG.tips.length])]) }, { text: 'YOUR PRIZES', pick: () => PZ.menu(sayTo, kT, ln, CHOICE_BYE) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }; };
  const menuSage = () => { talked++;
    if (!save.stat(pre + 'Met', 0)) { save.setStat(pre + 'Met', 1); sayTo(kT, [ln('Welcome to the RUINS MUSEUM. Every piece came out of the hill beneath you.'), me('You dug all this up yourself?'), ln('Some. Travellers with more luck than sense brought the rest. Which brings me to my standing offer.'), sageMenu('Find a RELIC anywhere in Meru. Bring it here. I pay its FULL worth. No shopkeeper\u2019s half.')]); return; }
    let open = SG.hello[talked % SG.hello.length]; if (thanks && thanks.by === 'sage') { open = thanks.pz && thanks.pz.length ? PZ.line(thanks.pz) : 'Gently done. ' + thanks.gold + ' gold, and the stones thank you.'; thanks = null; } sayTo(kT, [sageMenu(open)]); };
  const menuSandy = () => { let open = SD.hello[talkedS++ ? 1 + (talkedS % 2) : 0]; if (thanks && thanks.by === 'sandy') { open = thanks.pz && thanks.pz.length ? PZ.line(thanks.pz) : 'Look at it shine! ' + thanks.gold + ' gold. The Sage will pretend he did it.'; thanks = null; }
    sayTo(sT, [{ ...lnS(open), choices: [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob('sandy'), lastP); } }, { text: 'DIG ROOM JOBS', pick: () => sub(sT, lnS, 'sandy', 'Dig room jobs. Pick one.') },
      { text: 'WHAT ARE YOU DIGGING?', pick: () => sayTo(sT, [lnS('The hill. The whole museum sits on a dig.'), lnS('That wall is the hill itself. We dig one square at a time.')]) },
      { text: 'A TIP, PLEASE', pick: () => sayTo(sT, [lnS(SD.tips[talkedS % SD.tips.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); };
  function talk(P) { lastP = P; if (J && GN[J.g].walk) { if (GD[J.g].talk && GD[J.g].talk(P)) return true; if (nearSage(P)) { quit(); return true; } return false; } if (busy || !inRoom(P)) return false; const r = ringAt(P); if (r) { startGame(r.k, P); return true; }
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (PZ.nearWanted(P)) { sayTo(kT, PZ.wantedLines(ln)); return true; } if (nearSandy(P)) { tone(880, 0.04, 0.2, 'triangle'); menuSandy(); return true; } if (nearSage(P)) { ding(); menuSage(); return true; } return false; }
  function quit() { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  let outT = 0;
  const face = (f, home, P, near, dt) => { if (near && !busy) { const a = Math.atan2(P.x - f.position.x, P.z - f.position.z); let d = a - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * 3); } else { let d = home - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * 2); } };
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; toastT -= dt; const near = Math.hypot(P.x + 390, P.z + 57.5); G.visible = near < (touch ? 70 : 120);
    if (oldSage) { oldSage.visible = false; if (oldSage.position.y > -40) oldSage.position.set(-380, -50, -300); }
    if (busy === 'job' && J) { outT = inRoom(P) ? 0 : outT + dt; if (outT > (GN[J.g].walk ? 2 : 0.3)) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (busy === 'job' && J && !GN[J.g].walk && fox) JW(fox, J.g); PZ.applyWear(fox); let sLook = null; if (LF) try { sLook = LF.tick(dt, t, P, inRoom(P), busy === 'job' && J ? J.g : null); } catch (e) { console.warn(e); LF = null; } if (!G.visible) return; PZ.tick(dt);
    for (let i = PUFF.length - 1; i >= 0; i--) { const s = PUFF[i]; s.t -= dt; s.sp.position.addScaledVector(s.v, dt); s.sp.scale.setScalar(s.s * (1 + (0.7 - s.t))); s.sp.material.opacity = Math.max(0, s.t / 0.7) * 0.8; if (s.t <= 0) { s.sp.parent && s.sp.parent.remove(s.sp); s.sp.material.dispose(); PUFF.splice(i, 1); } }
    if (busy === 'job' && J) jobTick(dt, P); hintTick(t);
    const here = inRoom(P); kit.animFox(sandy, dt, 0, false); if (sLook && !busy && !(here && nearSandy(P))) face(sandy, SAN.ry, sLook, true, dt); else face(sandy, SAN.ry, P, here && nearSandy(P), dt);
    for (const tr of TORCH) tr.fl.scale.set(1, 0.85 + Math.sin(t * 13 + tr.i * 1.7) * 0.12 + Math.sin(t * 7.3 + tr.i) * 0.08, 1);
    KEY.rotation.y += dt * 0.5; KEY.position.y = 1.55 + Math.sin(t * 1.3) * 0.02;
    K.tick(dt, P, { inShop: here, busy: !!busy, near, talking: false }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => (busy && J && GN[J.g].walk ? null : busy), XB, active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), sage, sandy, GD, RINGS, inRoom, sell, K, PZ, get LF() { return LF; },
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) jobTick(dt, lastP); }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), dispose() { card.remove(); HINT.remove(); K.dispose && K.dispose(); LF && LF.dispose(); } };
  window.__ruinsJobs = API; return API;
}
