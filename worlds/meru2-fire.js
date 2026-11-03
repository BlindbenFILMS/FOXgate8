// MERU 2.0 — s107 MERU FIRE STATION [meruFireStation] (Ben s104i + s107 picks). Shell = TOWN2 'fireStation' (worlds/meru2-layout.js, f -66..-38 × 190..210,
// truck bay E (-38, 194.5) with a RED ROLLER DOOR that opens on a call, people door E (-38, 200.5)). Script: MERU_FIRE_STATION.md (draft used as is; the dog is SPARKS).
// CHIEF EMBER = shopKit keeper at the front desk (idle, wave, look-at). AXLE (driver) by the truck, RUNG (ladder fox) by the ladder rack, SPRITZ (hose fox) by the hydrant
// outside, SPARKS the station dog asleep on the front step (wakes for the bell). Look: bunk floor + BRASS POLE, hose-drying tower, fire truck (lights flash on calls, glow at
// night), FIRE DOCK with the fire boat. 4 JOBS (Ben: start with 4 at full polish, GENTLE): BUILDING FIRE (market stall, hold + drag the hose, aim LOW), WINDOW RESCUE (Lake Row
// house: raise the ladder, lock it, steady the base while Rung climbs), CAT IN A TREE (tree by the gardens: ladder on the right mark, climb, hold out a paw), FIRE DRILL (slide the
// pole, your locker, boots → coat → helmet, on the truck). Calls = quick fade to the scene; the truck + crew + dog go too. Scenes stand in town for good (found on free grass).
// Prizes: 1st clear FIREFIGHTER COAT + HELMET (worn, Tailor wardrobe) · 2 jobs HYDRANT REFILL (one free Energy Fill Pod a day at the hydrant) · all 4 GOLDEN HELMET + 60 gold.
import { applyD, endPose, workD } from '../engine/fox-poses.js?v=s648k';   // s634 Rung climbs the ladder, Spritz works the hose
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { dueAt, rosterFoxes, dressFox } from './meru2-roster.js';
export function buildFireStation({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, terrainAt = () => 0, go, floraRemove }) {
  const X0 = -66, X1 = -38, Z0 = 190, Z1 = 210, CX = -52, CZ = 200;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
  const INK = '#201e1d', RED = '#c8262c', RED2 = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', STEEL = '#c9ced3', DARK = '#3d3b3a', WOOD = '#8a6440', BRASS = '#d4a640', CONC = '#a29d94';
  const G = new THREE.Group(); G.name = 'fireStation'; scene.add(G);
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c })), BMc = {}; const BM = c => BMc[c] || (BMc[c] = new THREE.MeshBasicMaterial({ color: c }));
  const VCM = new THREE.MeshLambertMaterial({ vertexColors: true });
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } g.dispose(); };
    return { put, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 10, rx = 0, rz = 0, ry = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, ry, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz),
      mesh(parent) { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); const m = new THREE.Mesh(g0, VCM); m.userData.noCull = true; parent.add(m); return m; } }; };
  const noCull = o => { o.traverse(q => { q.userData.noCull = true; }); return o; };
  const plate = (txt, w, h, bg, fg, bar) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); if (bar) { g.fillStyle = bar; g.fillRect(0, 0, Math.max(8, W * 0.03), H); } g.fillStyle = fg; g.textBaseline = 'middle'; let s = Math.round(H * 0.6); g.font = '900 ' + s + 'px Archivo, sans-serif'; while (g.measureText(txt).width > W * 0.86 && s > 10) { s -= 2; g.font = '900 ' + s + 'px Archivo, sans-serif'; } g.fillText(txt, bar ? W * 0.07 : W * 0.06, H / 2 + 2); });
  const planeT = (tex, w, h, x, y, z, ry, parent = G, both = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: both ? THREE.DoubleSide : THREE.FrontSide })); m.position.set(x, y, z); m.rotation.y = ry; m.userData.noCull = true; parent.add(m); return m; };
  const rect = (a, b, c, d) => { const o = { f: [a, b, c, d] }; cols.push(o); return o; }, circ = (x, z, r) => { const o = { c: [x, z, r] }; cols.push(o); return o; };
  // ================= STATION INTERIOR =================
  const R0 = mk(), { box, cyl, sph } = R0;
  box(X1 - X0 - 0.8, 0.1, Z1 - Z0 - 0.8, CONC, CX, 0.05, CZ);
  for (const [w, d, x, z] of [[9.2, 0.12, -45.8, 192.4], [9.2, 0.12, -45.8, 196.6], [0.12, 4.3, -50.4, 194.5]]) box(w, 0.012, d, YEL, x, 0.11, z);   // truck bay lines
  // bunk floor (mezzanine) along the west wall + railing (gap at the pole) + 3 bunks + stairs on the south wall
  box(7.6, 0.25, 19.2, WOOD, -61.8, 4.0, CZ); box(0.08, 0.08, 19.2, '#6e5236', -58.0, 4.12, CZ);
  for (const z of [191, 196.9, 203.5, 209.2]) { box(0.28, 4.0, 0.28, '#6e5236', -58.2, 2.0, z); circ(-58.2, z, 0.3); }
  for (const [z0, z1] of [[190.4, 195.2], [196.8, 209.6]]) { box(0.08, 0.08, z1 - z0, BRASS, -58.05, 5.05, (z0 + z1) / 2); for (let z = z0; z <= z1 + 0.01; z += 1.2) box(0.06, 0.92, 0.06, BRASS, -58.05, 4.6, z); }
  for (const z of [193, 199.6, 206]) { box(2.2, 0.45, 1.0, '#6e5236', -64.4, 4.35, z); box(2.0, 0.16, 0.9, RED, -64.4, 4.65, z); box(0.5, 0.14, 0.7, WHITE, -65.2, 4.78, z); }
  for (let i = 0; i < 8; i++) box(0.9, 0.5 * (i + 1), 1.8, '#7a5236', -50.9 - i * 0.92, 0.25 * (i + 1), 208.6); rect(-58.4, -50.4, 207.6, 209.6);
  // lockers (drill: 4 name plates, built as their own objects below) + bench; crew helmets on pegs
  box(5.0, 0.12, 0.45, WOOD, -54.8, 0.45, 191.75); for (const x of [-56.9, -52.7]) box(0.1, 0.45, 0.4, WOOD, x, 0.22, 191.75);
  [[RED2, -46.2], [YEL, -45.2], [WHITE, -44.2], [RED2, -43.2]].forEach(([c, x]) => { box(0.06, 0.06, 0.25, STEEL, x, 1.85, 190.5); sph(0.24, c, x, 1.88, 190.62, 1, 0.75, 1.1); });
  // front desk (Chief behind it, facing the people door), phone + papers; NOW HIRING / board / clock come from shopKit
  box(0.85, 1.05, 3.0, '#5a3a24', -47.2, 0.53, 200.5); box(1.0, 0.08, 3.2, INK, -47.2, 1.09, 200.5); box(0.25, 0.1, 0.18, RED2, -47.1, 1.18, 199.6); box(0.3, 0.02, 0.4, WHITE, -47.2, 1.14, 201.2); rect(-47.7, -46.7, 198.9, 202.1);
  // ladder rack (west wall, under the bunks) + the short ladder (cat job) on the south wall + hose reel by the door + kitchen corner
  for (const y of [1.0, 1.7, 2.4]) { box(0.06, 0.08, 7.6, '#d9d4cc', -65.5, y, 195.4); box(0.06, 0.08, 7.6, '#d9d4cc', -65.2, y, 195.4); for (let z = 191.8; z < 199.2; z += 0.6) box(0.36, 0.05, 0.05, '#d9d4cc', -65.35, y, z); }
  for (const z of [191.4, 199.4]) box(0.5, 0.06, 0.08, DARK, -65.35, 1.7, z);
  box(0.06, 3.6, 0.08, '#d9d4cc', -53.3, 1.85, 209.55); box(0.06, 3.6, 0.08, '#d9d4cc', -52.7, 1.85, 209.55); for (let y = 0.4; y < 3.6; y += 0.45) box(0.6, 0.05, 0.05, '#d9d4cc', -53, y, 209.55);
  cyl(0.5, 0.5, 0.25, YEL, -39.6, 0.62, 197.6, 14, Math.PI / 2); cyl(0.55, 0.55, 0.05, DARK, -39.6, 0.62, 197.45, 14, Math.PI / 2); cyl(0.55, 0.55, 0.05, DARK, -39.6, 0.62, 197.75, 14, Math.PI / 2); box(0.5, 0.06, 0.4, DARK, -39.6, 0.06, 197.6); circ(-39.6, 197.6, 0.6);
  box(2.2, 0.08, 1.1, WOOD, -62, 0.82, 205); for (const [x, z] of [[-62.9, 204.6], [-61.1, 204.6], [-62.9, 205.4], [-61.1, 205.4]]) box(0.08, 0.8, 0.08, '#6e5236', x, 0.4, z); circ(-62, 205, 1.3);
  for (const [x, z] of [[-63.6, 205], [-60.4, 205]]) cyl(0.25, 0.25, 0.5, RED, x, 0.25, z, 10); cyl(0.09, 0.09, 0.22, DARK, -62.3, 0.97, 205.1, 10); cyl(0.05, 0.05, 0.12, WHITE, -61.7, 0.92, 204.9, 8);
  box(0.8, 1.9, 0.75, STEEL, -65.2, 0.95, 208.9); rect(-65.6, -64.8, 208.5, 209.6);
  // pendant lamps
  for (const [x, z] of [[-52, 195], [-52, 203.6], [-44, 199.5]]) { box(0.03, 2.2, 0.03, INK, x, 7.4, z); cyl(0.12, 0.55, 0.38, '#2e4a6b', x, 6.2, z, 12); }
  R0.mesh(G);
  // brass pole + the bell (rings on every job)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 7.2, 10), LM(BRASS)); pole.position.set(-57.4, 3.6, 196); G.add(pole); circ(-57.4, 196, 0.12);
  { const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 18, 1, true), LM(YEL)); ring.position.set(-57.4, 4.13, 196); G.add(ring); }
  const bell = new THREE.Group(); bell.position.set(-58.45, 3.75, 201.5); G.add(bell); { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.3, 0.38, 14), LM(BRASS)); b.position.y = -0.22; bell.add(b); const k = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), LM(DARK)); k.position.y = -0.42; bell.add(k); }
  let bellT = 0;
  // ================= LOCKERS (drill) =================
  const LNAMES = ['AXLE', 'RUNG', 'SPRITZ', 'ROOKIE'], LX = [-56.6, -55.4, -54.2, -53.0], LZ = 190.62;
  const plateTex = Object.fromEntries(LNAMES.map(n => [n, plate(n, 256, 64, WHITE, INK, n === 'ROOKIE' ? RED2 : null)]));
  const lockers = LX.map((x, i) => { const g = new THREE.Group(); g.position.set(x, 0, LZ); G.add(g);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.1, 0.5), LM('#7a2a2a')); body.position.set(0, 1.05, 0); g.add(body);
    const inner = new THREE.Mesh(new THREE.BoxGeometry(0.96, 1.9, 0.02), LM('#2a1f1f')); inner.position.set(0, 1.05, 0.24); g.add(inner);
    const hinge = new THREE.Group(); hinge.position.set(0.52, 0, 0.26); g.add(hinge); const door = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.98, 0.04), LM('#b3262a')); door.position.set(-0.51, 1.05, 0); hinge.add(door);
    for (let k = 0; k < 3; k++) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.01), LM(INK)); v.position.set(-0.51, 1.75 - k * 0.07, 0.025); hinge.add(v); }
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.16), new THREE.MeshBasicMaterial({ map: plateTex[LNAMES[i]] })); pl.position.set(-0.51, 1.5, 0.025); hinge.add(pl);
    circ(x, LZ, 0.5); return { g, hinge, pl, name: LNAMES[i], open: 0, want: 0 }; });
  // gear inside the ROOKIE locker (moved to whichever locker is yours this run)
  const GEAR = new THREE.Group(); G.add(GEAR); GEAR.visible = false;
  const gearBoots = new THREE.Group(); for (const s of [-0.13, 0.13]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.34, 0.3), LM('#2b2b2b')); b.position.set(s, 0.17, 0); gearBoots.add(b); const t = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.04, 0.31), LM(YEL)); t.position.set(s, 0.3, 0); gearBoots.add(t); }
  const gearCoat = new THREE.Group(); { const c = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.8, 0.16), LM('#8a6a2a')); c.position.y = -0.4; gearCoat.add(c); for (const y of [-0.5, -0.7]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.05, 0.17), LM(YEL)); s.position.y = y; gearCoat.add(s); } }
  const helmetMesh = (c = RED2) => { const g = new THREE.Group(); const d = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), LM(c)); d.scale.set(1, 0.85, 1.1); g.add(d); const br = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.025, 18), LM(c)); br.scale.set(1, 1, 1.25); br.position.z = 0.05; g.add(br); const sh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.02), LM(BRASS)); sh.position.set(0, 0.12, 0.24); g.add(sh); return g; };
  const gearHelmet = helmetMesh(RED2);
  GEAR.add(gearBoots, gearCoat, gearHelmet);
  const gearPt = k => { const o = { boots: gearBoots, coat: gearCoat, helmet: gearHelmet }[k]; return o.getWorldPosition(V()).add(V(0, k === 'coat' ? -0.4 : k === 'boots' ? 0.18 : 0.1, 0)); };
  const placeGear = lk => { GEAR.position.set(lk.g.position.x, 0, LZ + 0.42); gearBoots.position.set(0, 0.51, 0.71); gearCoat.position.set(0, 1.62, 0); gearHelmet.position.set(0, 2.12, -0.3); gearHelmet.scale.setScalar(1); gearBoots.visible = gearCoat.visible = gearHelmet.visible = true; GEAR.visible = true; };
  // ================= ROLLER DOOR (truck bay) =================
  const rollTex = CT(128, 256, (g, W, H) => { g.fillStyle = '#b3262a'; g.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 16) { g.fillStyle = '#8f1d22'; g.fillRect(0, y, W, 3); g.fillStyle = '#d23a3f'; g.fillRect(0, y + 3, W, 2); } g.fillStyle = '#f3f2f2'; g.fillRect(8, H - 34, W - 16, 10); });
  const roll = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 4.0), [LM('#8f1d22'), new THREE.MeshLambertMaterial({ map: rollTex }), LM('#8f1d22'), LM('#8f1d22'), LM('#8f1d22'), LM('#8f1d22')]); roll.position.set(-38.2, 2.25, 194.5); G.add(roll);
  const drum = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 4.3), LM(DARK)); drum.position.set(-38.0, 4.75, 194.5); G.add(drum);
  const rollCol = rect(-38.4, -38.0, 192.5, 196.5); let rollK = 0, rollWant = 0;
  const setRoll = k => { const h = Math.max(0.05, 4.5 * (1 - k)); roll.scale.y = h; roll.position.y = 4.5 - h / 2; rollCol.f = k > 0.6 ? [9e3, 9e3, 9e3, 9e3] : [-38.4, -38.0, 192.5, 196.5]; };
  setRoll(0);
  // ================= TRUCK =================
  function makeTruck() { const g = new THREE.Group(), T = mk();
    T.box(8.2, 0.4, 2.2, '#2b2b2b', 0, 0.75, 0); T.box(6.0, 1.9, 2.4, RED, -1.1, 1.9, 0); T.box(2.2, 2.3, 2.4, RED, 3.1, 2.0, 0); T.box(8.3, 0.18, 2.42, WHITE, 0, 1.45, 0);
    for (const s of [-1, 1]) { for (const x of [-3.1, -1.1, 0.9]) T.box(1.7, 1.1, 0.04, STEEL, x, 2.05, s * 1.215); T.box(1.2, 0.8, 0.04, '#2b3a48', 3.4, 2.55, s * 1.215); }
    T.box(0.06, 0.9, 2.1, '#2b3a48', 4.21, 2.55, 0); T.box(0.25, 0.35, 2.5, STEEL, 4.3, 0.8, 0); T.box(0.05, 0.6, 1.4, DARK, 4.22, 1.3, 0); for (const s of [-0.85, 0.85]) T.box(0.06, 0.2, 0.3, '#fff6cc', 4.23, 1.35, s);
    for (const s of [-0.45, 0.45]) T.box(6.2, 0.12, 0.1, '#d9d4cc', -1.0, 3.0, s); for (let x = -3.9; x < 2; x += 0.42) T.box(0.06, 0.06, 0.9, '#d9d4cc', x, 3.0, 0);
    T.cyl(0.45, 0.45, 1.6, '#e8d27a', -4.15, 1.6, 0, 14, Math.PI / 2); T.cyl(0.5, 0.5, 0.06, DARK, -4.15, 1.6, 0.82, 14, Math.PI / 2); T.cyl(0.5, 0.5, 0.06, DARK, -4.15, 1.6, -0.82, 14, Math.PI / 2);
    for (const x of [-2.8, -1.6, 3.0]) for (const s of [-1.05, 1.05]) { T.cyl(0.52, 0.52, 0.4, '#1d1d1d', x, 0.52, s, 14, Math.PI / 2); T.cyl(0.24, 0.24, 0.42, '#9aa0a6', x, 0.52, s, 10, Math.PI / 2); }
    T.box(1.0, 0.12, 1.4, DARK, 3.3, 3.2, 0); T.mesh(g);
    const tx = plate('MERU FIRE \u00b7 ENGINE 8', 512, 96, RED, WHITE, YEL); for (const s of [-1, 1]) planeT(tx, 3.4, 0.64, -1.1, 2.55, s * 1.222, s > 0 ? 0 : Math.PI, g);
    const red = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.5), BM('#ff3b3b').clone()), blue = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.5), BM('#3b7bff').clone()); red.position.set(3.3, 3.36, -0.42); blue.position.set(3.3, 3.36, 0.42); g.add(red, blue);
    const gl = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([3.3, 3.4, -0.42, 3.3, 3.4, 0.42], 3)), new THREE.PointsMaterial({ size: 3.2, map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true }));
    gl.geometry.setAttribute('color', new THREE.Float32BufferAttribute([1, 0.2, 0.2, 0.2, 0.4, 1], 3)); gl.visible = false; gl.frustumCulled = false; g.add(gl);
    noCull(g); return { g, red, blue, gl, flash: false }; }
  const glowT = CT(32, 32, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, W, W); });
  const truck = makeTruck(); scene.add(truck.g);
  const truckCol = [circ(0, 0, 1.25), circ(0, 0, 1.25), circ(0, 0, 1.25)];
  const placeTruck = (x, z, ry) => { truck.g.position.set(x, terrainAt(x, z) || 0, z); truck.g.rotation.y = ry; [-2.8, 0, 2.8].forEach((o, i) => { truckCol[i].c = [x + Math.cos(ry) * o, z - Math.sin(ry) * o, 1.25]; }); };
  const truckHome = () => { placeTruck(-45.8, 194.5, 0); truck.g.position.y = 0; };
  truckHome();
  // ================= EXTERIOR: hose tower, hydrant, jetty sign, fire boat =================
  const EG = new THREE.Group(); EG.name = 'fireOutside'; scene.add(EG); const RX = mk();
  { const tx0 = -70.5, tx1 = -67.5, tz0 = 205, tz1 = 208, H = 15; for (const x of [tx0, tx1]) for (const z of [tz0, tz1]) RX.box(0.22, H, 0.22, RED, x, H / 2, z);
    for (let y = 1.5; y < H; y += 2.5) { RX.box(3.1, 0.12, 0.12, WHITE, (tx0 + tx1) / 2, y, tz0); RX.box(3.1, 0.12, 0.12, WHITE, (tx0 + tx1) / 2, y, tz1); RX.box(0.12, 0.12, 3.1, WHITE, tx0, y, (tz0 + tz1) / 2); RX.box(0.12, 0.12, 3.1, WHITE, tx1, y, (tz0 + tz1) / 2); }
    RX.box(3.8, 0.3, 3.8, DARK, (tx0 + tx1) / 2, H + 0.15, (tz0 + tz1) / 2); RX.box(3.2, 0.12, 0.2, DARK, (tx0 + tx1) / 2, H - 0.5, (tz0 + tz1) / 2);
    for (let i = 0; i < 5; i++) RX.box(0.14, 9 + (i % 2) * 2, 0.06, i % 2 ? '#e8d27a' : WHITE, tx0 + 0.6 + i * 0.45, H - 0.5 - (9 + (i % 2) * 2) / 2, (tz0 + tz1) / 2);
    rect(tx0 - 0.2, tx1 + 0.2, tz0 - 0.2, tz1 + 0.2);
    const tp = plate('MERU FIRE', 512, 96, RED, WHITE, YEL); planeT(tp, 2.8, 0.52, (tx0 + tx1) / 2, H - 1.6, tz1 + 0.13, 0, EG); planeT(tp, 2.8, 0.52, tx1 + 0.13, H - 1.6, (tz0 + tz1) / 2, Math.PI / 2, EG); }
  const HYD = [-35.2, 203.8]; RX.cyl(0.18, 0.2, 0.75, RED2, HYD[0], 0.38, HYD[1], 10); RX.sph(0.2, RED2, HYD[0], 0.78, HYD[1], 1, 0.7, 1); RX.cyl(0.08, 0.08, 0.5, STEEL, HYD[0], 0.5, HYD[1], 8, 0, Math.PI / 2); circ(HYD[0], HYD[1], 0.35);
  RX.put(new THREE.TorusGeometry(0.38, 0.09, 6, 16), -33.6, 0.09, 205.3, '#e8d27a', 0, Math.PI / 2); RX.put(new THREE.TorusGeometry(0.26, 0.09, 6, 14), -33.6, 0.24, 205.3, '#e8d27a', 0, Math.PI / 2);
  RX.box(0.12, 1.4, 0.12, DARK, -46.9, 0.7, 237.2); planeT(plate('FIRE DOCK \u00b7 KEEP CLEAR', 512, 96, RED, WHITE, YEL), 1.9, 0.36, -46.9, 1.5, 237.28, 0, EG, true);
  RX.mesh(EG);
  function makeBoat() { const g = new THREE.Group(), B = mk(); B.box(2.6, 0.8, 7.2, RED, 0, 0.2, -0.4); B.box(1.84, 0.8, 1.84, RED, 0, 0.2, 3.2, Math.PI / 4); B.box(2.5, 0.1, 7.0, WHITE, 0, 0.65, -0.4); B.box(2.62, 0.14, 7.25, WHITE, 0, 0.42, -0.4);
    B.box(1.8, 1.4, 2.6, WHITE, 0, 1.4, -1.3); B.box(1.82, 0.5, 2.2, '#2b3a48', 0, 1.65, -1.3); B.box(2.0, 0.12, 2.8, DARK, 0, 2.15, -1.3);
    B.cyl(0.14, 0.18, 0.7, STEEL, 0, 1.0, 2.2, 10); B.cyl(0.08, 0.1, 1.1, BRASS, 0, 1.45, 2.65, 10, Math.PI / 2 - 0.35); B.box(0.5, 0.18, 0.3, '#ff3b3b', -0.35, 2.3, -1.3); B.box(0.5, 0.18, 0.3, '#3b7bff', 0.35, 2.3, -1.3);
    for (const s of [-1, 1]) B.cyl(0.18, 0.18, 0.5, WHITE, s * 1.32, 0.5, 0.6, 10, Math.PI / 2);
    B.mesh(g); const t = plate('MERU FIRE BOAT', 512, 96, RED, WHITE, YEL); planeT(t, 2.2, 0.4, 0.92, 1.05, -1.3, Math.PI / 2, g); planeT(t, 2.2, 0.4, -0.92, 1.05, -1.3, -Math.PI / 2, g); return noCull(g); }
  const boat = makeBoat(); boat.position.set(-45.6, 0.05, 250); EG.add(boat);
  // ================= FOXES: Chief, Axle, Rung, Spritz + Sparks the dog =================
  const FIRE_T = ['#c42d3c', '#ffd23a', '#7f1d1d'];
  const crewFox = (key, hat, extra = {}) => { const f = kit.makeFox({ joints: true, key, torso: FIRE_T, outfit: 'coat', mood: 'happy', ...extra }); dressFox(THREE, f, ['fire', hat]); f.userData.noCull = true; return f; };
  const CHIEF0 = [-48.6, 200.5, Math.PI / 2], chief = crewFox('chiefEmber', WHITE, { mood: 'neutral' }); chief.position.set(CHIEF0[0], 0, CHIEF0[1]); chief.rotation.y = CHIEF0[2]; G.add(chief);
  const HOME = { axle: [-43.6, 191.7, Math.PI], rung: [-62.6, 196.6, -Math.PI / 2], spritz: [-33.9, 204.3, -Math.PI / 2] };
  const axle = crewFox('fireDriver', RED2), rung = crewFox('fireLadder', YEL), spritz = crewFox('fireHose', RED2, { look: { lashes: 1 } });
  const CREW = { axle, rung, spritz }; for (const k in CREW) { const [x, z, r] = HOME[k]; CREW[k].position.set(x, 0, z); CREW[k].rotation.y = r; scene.add(CREW[k]); CREW[k].userData.home = HOME[k]; }
  const crewHome = () => { for (const k in CREW) { const [x, z, r] = HOME[k]; CREW[k].position.set(x, 0, z); CREW[k].rotation.y = r; CREW[k].visible = true; } };
  const crewCol = { axle: circ(-43.6, 191.7, 0.4), rung: circ(-62.6, 196.6, 0.4), spritz: circ(-33.9, 204.3, 0.4) };
  function makeDog() { const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const W = LM('#f3f2f2'), K = LM('#201e1d');
    const tor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.8), W); tor.position.y = 0.0; body.add(tor);
    for (const [x, y, z, r] of [[0.12, 0.1, 0.1, 0.07], [-0.1, 0.12, -0.15, 0.06], [0.05, 0.16, -0.3, 0.05], [-0.15, 0.0, 0.25, 0.05]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 6, 4), K); s.position.set(x * 1.1, y, z); s.scale.set(1, 0.4, 1); body.add(s); }
    const head = new THREE.Group(); head.position.set(0, 0.2, 0.46); body.add(head); const hd = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.3), W); head.add(hd); const sn = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.13, 0.18), W); sn.position.set(0, -0.05, 0.2); head.add(sn); const no = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.04), K); no.position.set(0, -0.0, 0.3); head.add(no);
    const eyes = []; for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.02), K); e.position.set(s * 0.07, 0.05, 0.155); head.add(e); eyes.push(e); const ear = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.12), K); ear.position.set(s * 0.15, 0.02, -0.02); ear.rotation.z = s * 0.25; head.add(ear); }
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.08), LM(RED2)); col.position.set(0, 0.08, 0.36); body.add(col);
    const tail = new THREE.Group(); tail.position.set(0, 0.1, -0.4); body.add(tail); const tm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.3), W); tm.position.z = -0.14; tail.add(tm);
    const legs = []; for (const [x, z] of [[-0.12, 0.3], [0.12, 0.3], [-0.12, -0.3], [0.12, -0.3]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.09), W); l.position.set(x, -0.3, z); body.add(l); legs.push(l); }
    const zT = CT(64, 64, (g2, w) => { g2.font = '900 46px Archivo, sans-serif'; g2.fillStyle = '#ffffff'; g2.strokeStyle = '#201e1d'; g2.lineWidth = 6; g2.strokeText('z', 18, 46); g2.fillText('z', 18, 46); });
    const zs = [0, 1].map(i => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zT, transparent: true, depthWrite: false })); s.scale.setScalar(0.3); g.add(s); return s; });
    return { g, body, head, tail, legs, eyes, zs, st: 'sleep', t: 0 }; }
  const dog = makeDog(); dog.g.name = 'fireDog'; const DOG0 = [-36.7, 203.3, Math.PI / 2]; scene.add(dog.g); dog.g.position.set(DOG0[0], 0, DOG0[1]); dog.g.rotation.y = DOG0[2]; noCull(dog.g);
  const dogCol = circ(DOG0[0], DOG0[1], 0.45);
  try { (window.__m2pets = window.__m2pets || []).push({ obj: dog.g, name: 'SPARKS', kind: 'DOG', react() { dog.wagT = 3.5; if (dog.st === 'sleep') dog.st = 'sit'; } }); } catch (e) {}   // s642: PET SPARKS (the walk plays pet_pet; he wakes, sits up + wags)
  function dogPose(dt, t, walking) { const D = dog; D.t += dt; if (D.wagT > 0) { D.wagT -= dt; if (D.tail) D.tail.rotation.y = Math.sin(t * 22) * 0.6; if (D.head) D.head.rotation.z = Math.sin(t * 3) * 0.15; if (D.wagT <= 0 && !J && D.st === 'sit') D.st = 'sleep'; } if (D.st === 'sleep') { D.body.position.y = 0.17; D.legs.forEach((l, i) => { l.rotation.x = i < 2 ? -1.45 : 1.45; l.position.y = -0.1; }); D.head.rotation.x = 0.35; D.head.position.y = 0.06; D.tail.rotation.y = 0; D.eyes.forEach(e => { e.scale.y = 0.3; }); const br = 1 + Math.sin(t * 1.6) * 0.03; D.body.scale.set(br, br, 1);
      D.zs.forEach((s, i) => { const k = ((t * 0.35 + i * 0.5) % 1); s.visible = true; s.position.set(0.05 + k * 0.15, 0.5 + k * 0.6, 0.45); s.material.opacity = 1 - k; }); return; }
    D.zs.forEach(s => { s.visible = false; }); D.eyes.forEach(e => { e.scale.y = 1; }); D.body.scale.set(1, 1, 1); D.head.position.y = 0.2;
    if (D.st === 'sit') { D.body.position.y = 0.42; D.body.rotation.x = -0.35; D.legs.forEach((l, i) => { l.rotation.x = i < 2 ? 0.35 : -1.2; l.position.y = i < 2 ? -0.3 : -0.18; }); D.head.rotation.x = 0.3; D.tail.rotation.y = Math.sin(t * 9) * 0.6; return; }
    D.body.rotation.x = 0; D.body.position.y = 0.5 + (walking ? Math.abs(Math.sin(t * 12)) * 0.04 : 0); D.head.rotation.x = 0; D.legs.forEach((l, i) => { l.position.y = -0.3; l.rotation.x = walking ? Math.sin(t * 12 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.6 : 0; }); D.tail.rotation.y = Math.sin(t * (walking ? 14 : 8)) * 0.7; }
  const dogHome = () => { dog.st = 'sleep'; dog.g.position.set(DOG0[0], 0, DOG0[1]); dog.g.rotation.y = DOG0[2]; dogCol.c = [DOG0[0], DOG0[1], 0.45]; };
  // ================= shopKit (Chief = keeper) =================
  const GAMES = [{ k: 'fire', name: 'Building Fire', color: RED2 }, { k: 'ladder', name: 'Window Rescue', color: '#2e4a6b' }, { k: 'cat', name: 'Cat in a Tree', color: '#3f7a52' }, { k: 'drill', name: 'Fire Drill', color: '#c9a227' }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { fire: [-41.4, 197.4], ladder: [-61.0, 198.9], cat: [-53.0, 207.0], drill: [-56.2, 197.6] };
  const UNI = ['officerRusty', 'officerVixen', 'guardFlint', 'guardAsh', 'guardBrick'], foxOf = rosterFoxes({ THREE, kit, cap: 3 });
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'fs', color: RED2, boardTitle: "Chief Ember's board", room: { X0, X1, Z0, Z1 }, door: [-38.7, 200.5], keeper: chief, keeperRy: CHIEF0[2], games: GAMES,
    board: { x: -38.26, y: 2.7, z: 206.2, ry: -Math.PI / 2, w: 1.3 }, hiring: { x: -40.6, z: 203.5, ry: Math.PI }, hiringLine: 'VOLUNTEER FIREFIGHTERS \u00b7 ASK THE CHIEF',
    sun: [{ x: -39.8, z: 200.5, w: 2.4, d: 3.6 }, { x: -46, z: 208.4, w: 2.2, d: 1.6 }, { x: -55, z: 208.4, w: 2.2, d: 1.6 }], lamps: [[-52, 6.0, 195], [-52, 6.0, 203.6], [-44, 6.0, 199.5]],
    browse: [[-45.5, 197.6, Math.PI], [-40.2, 205.6, Math.PI / 2], [-44.4, 204.0, Math.PI * 0.75]], clock: { x: -38.25, y: 5.2, z: 200.5, ry: -Math.PI / 2 },
    visitors: h => dueAt('fireStation', h).filter(e => UNI.includes(e.r.key) || e.kind === 'browse'), visitorFox: r => foxOf(r, G), slots: 2,
    onVisit: e => { if (inShop(lastP || { x: 0, z: 0 })) toast(e.r.name.toUpperCase() + ' \u00b7 ' + e.why, 2.4); } });
  // floor rings
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringMeshes = {};
  for (const k in RINGS) { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(RINGS[k][0], 0.12, RINGS[k][1]); G.add(m); ringMeshes[k] = m; }
  // ================= SCENES (free grass in town, standing for good) =================
  const segD = (x, z, p) => { let d = 1e9; for (let k = 0; k < p.length - 1; k++) { const [ax, az] = p[k], [bx, bz] = p[k + 1], vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz || 1, u = clamp(((x - ax) * vx + (z - az) * vz) / l2, 0, 1); d = Math.min(d, Math.hypot(x - ax - vx * u, z - az - vz * u)); } return d; };
  const trainL = L.TRAIN ? [...L.TRAIN.line, L.TRAIN.line[0]] : [];
  const clearAt = (x, z, r) => { if (L.outOfMap && L.outOfMap(x, z, 20)) return false; if (L.lakeF && L.lakeF(x, z) < 1.15) return false; if (L.surfaceAt && L.surfaceAt(x, z) !== 'grass') return false;
    if (L.BUILDINGS.some(b => b.f && x > b.f[0] - r - 2 && x < b.f[1] + r + 2 && z > b.f[2] - r - 2 && z < b.f[3] + r + 2)) return false;
    if (L.SPEAKERS.some(s => Array.isArray(s.at) && Math.hypot(s.at[0] - x, s.at[1] - z) < r + 4)) return false;
    if ([...(L.PATHS || []), ...(L.LINKS || []), ...(L.TRAILS || [])].some(p => p.p && segD(x, z, p.p) < r + 3)) return false;
    if (L.ROADS.some(R => segD(x, z, R.p) < R.w / 2 + (L.SIDEWALK || 3.3) + r + 1)) return false; if (trainL.length && segD(x, z, trainL) < r + 7) return false;
    return !cols.some(c => c.y0 == null && (c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + r : c.f ? (c.f[1] - c.f[0] < 200 && x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r) : false)); };
  const find = (cx, cz, r, span) => { for (let d = 0; d <= span; d += 3) for (let a = 0; a < 6.28; a += d ? Math.min(0.6, 3 / d) : 7) { const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (clearAt(x, z, r)) return [x, z]; } return null; };
  const SC = {};
  const mkScene = (key, at, fb, r, ry) => { const p = find(at[0], at[1], r, 70) || find(at[0], at[1], r - 3, 110) || fb; const g = new THREE.Group(); g.name = 'fireScene:' + key; g.position.set(p[0], terrainAt(p[0], p[1]) || 0, p[1]); g.rotation.y = ry; scene.add(g); noCull(g); g.updateMatrixWorld(true);
    const W = (lx, ly, lz) => g.localToWorld(V(lx, ly, lz)); SC[key] = { g, x: p[0], z: p[1], y: g.position.y, ry, r, W, found: p !== fb }; return SC[key]; };
  const wc = (S, lx, lz, r) => { const w = S.W(lx, 0, lz); return circ(w.x, w.z, r); };
  // ---- 1 MARKET STALL (building fire) ----
  const sM = mkScene('market', [-100, 30], [-60, 176], 11, Math.PI);
  { const R = mk(); for (const [x, z] of [[-1.6, -2.1], [1.6, -2.1], [-1.6, -0.9], [1.6, -0.9]]) R.cyl(0.06, 0.06, 2.6, '#6e5236', x, 1.3, z, 8);
    R.box(3.4, 1.0, 1.2, '#9a7550', 0, 0.5, -1.5); R.box(3.6, 0.08, 1.4, '#7a5236', 0, 1.04, -1.5);
    [[-1.1, '#d94b2b'], [-0.35, '#e0a020'], [0.4, '#7aa33a'], [1.15, '#b03a6a']].forEach(([x, c]) => { R.box(0.6, 0.22, 0.5, '#b08a5e', x, 1.19, -1.45); for (let i = 0; i < 4; i++) R.sph(0.09, c, x - 0.15 + (i % 2) * 0.3, 1.36, -1.55 + (i >> 1) * 0.2); });
    for (const [x, y, z] of [[2.3, 0.25, -0.9], [2.3, 0.75, -0.9], [2.85, 0.25, -1.3]]) R.box(0.5, 0.5, 0.5, '#b08a5e', x, y, z);
    R.box(3.4, 1.9, 0.08, '#7a5236', 0, 1.55, -2.15); R.mesh(sM.g);
    const st = CT(128, 32, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f3f2f2' : RED2; g.fillRect(i * 16, 0, 16, h); } }); st.wrapS = THREE.RepeatWrapping;
    const aw = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.7), new THREE.MeshLambertMaterial({ map: st, side: THREE.DoubleSide })); aw.position.set(0, 2.62, -1.2); aw.rotation.x = -Math.PI / 2 + 0.38; sM.g.add(aw);
    planeT(plate('SPICES \u00b7 FRUIT', 256, 64, INK, YEL), 1.4, 0.35, 0, 0.62, -0.89, 0, sM.g);
    wc(sM, -0.8, -1.5, 1.0); wc(sM, 0.8, -1.5, 1.0); wc(sM, 2.5, -1.0, 0.55); }
  // ---- 2 LAKE ROW HOUSE (window rescue) ----
  const sH = mkScene('house', [120, 182], [30, 176], 11, 0);
  { const R = mk(); R.box(7, 10.5, 6, '#b5523b', 0, 5.25, -2); R.box(7.3, 0.4, 6.3, DARK, 0, 10.7, -2); R.box(0.8, 1.6, 0.8, '#8a3a2a', -2.2, 11.6, -3.2);
    for (let f = 0; f < 3; f++) for (const x of [-1.6, 1.6]) { if (f === 0 && x < 0) { R.box(1.2, 2.3, 0.1, '#2e4a6b', x, 1.15, 1.03); R.box(1.4, 0.12, 0.3, WHITE, x, 2.35, 1.1); continue; } const yc = 3.5 * f + 1.9, hot = f === 2 && x > 0;
      R.box(1.36, 1.56, 0.08, WHITE, x, yc, 1.02); R.box(1.2, 1.4, 0.1, hot ? '#e06a2a' : '#2b3a48', x, yc, 1.05); R.box(1.5, 0.12, 0.3, WHITE, x, yc - 0.8, 1.12); }
    R.box(1.9, 0.16, 0.7, '#9aa0a6', 1.6, 8.1, 1.35); for (const x of [0.75, 2.45]) R.box(0.05, 0.7, 0.05, DARK, x, 8.5, 1.66); R.box(1.75, 0.05, 0.05, DARK, 1.6, 8.85, 1.66);
    R.box(2.6, 0.12, 1.6, CONC, -1.6, 0.06, 1.8); R.mesh(sH.g); planeT(plate('LAKE ROW \u00b7 No. 3', 256, 64, WHITE, INK, RED2), 1.2, 0.3, -1.6, 2.75, 1.09, 0, sH.g);
    const a = sH.W(-3.5, 0, -5), b = sH.W(3.5, 0, 1); rect(Math.min(a.x, b.x), Math.max(a.x, b.x), Math.min(a.z, b.z), Math.max(a.z, b.z)); }
  const rescued = kit.makeFox({ key: 'fireRescueFox', torso: ['#e7d7b8', '#7aa33a', '#3f5a2a'], outfit: 'vest', mood: 'warm', look: { lashes: 1 } }); rescued.userData.noCull = true; sH.g.add(rescued); rescued.position.set(1.6, 8.18, 1.35); rescued.rotation.y = 0;
  // ---- 3 CAT TREE (by the gardens) ----
  const sT = mkScene('tree', [64, 118], [-20, 182], 9, 0);
  { const R = mk(); R.cyl(0.32, 0.46, 4.8, '#6e4a2a', 0, 2.4, 0, 10); R.put(new THREE.CylinderGeometry(0.1, 0.18, 2.9, 8), 1.35, 4.32, 0, '#6e4a2a', 0, 0, -Math.PI / 2 + 0.12);
    for (const [x, y, z, r, c] of [[0, 6.2, 0, 2.2, '#4d7a37'], [1.4, 6.1, 0.6, 1.2, '#5a8a40'], [-1.4, 5.6, -0.4, 1.5, '#41692f'], [0.4, 7.0, -0.7, 1.5, '#5a8a40'], [-0.6, 5.2, 1.2, 1.2, '#4d7a37']]) R.sph(r, c, x, y, z, 1, 0.85, 1);
    R.box(1.8, 0.08, 0.5, WOOD, -2.8, 0.5, 1.6); for (const x of [-3.5, -2.1]) R.box(0.08, 0.5, 0.45, DARK, x, 0.25, 1.6); R.mesh(sT.g); wc(sT, 0, 0, 0.6); wc(sT, -2.8, 1.6, 0.9); }
  function makeCat() { const g = new THREE.Group(), O = LM('#e08a3a'), D = LM('#a8561e'); const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.34), O); b.position.y = 0.12; g.add(b);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), O); h.position.set(0, 0.24, 0.2); g.add(h); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), D); e.position.set(s * 0.055, 0.34, 0.2); g.add(e); }
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.3), D); t.position.set(0, 0.24, -0.26); t.rotation.x = 0.8; g.add(t); for (const z of [-0.12, 0.12]) for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.04), O); l.position.set(s * 0.05, 0.04, z); g.add(l); } return noCull(g); }
  const cat = makeCat(); cat.scale.setScalar(1.7); sT.g.add(cat); const CAT0 = V(2.68, 4.42, 0); cat.position.copy(CAT0); cat.rotation.y = -Math.PI / 2;
  if (floraRemove) { const zones = [[X0 - 6, X1 + 12, Z0 - 6, Z1 + 4], [-72, -66, 203, 210]], nearS = (x, z) => Object.values(SC).some(S => Math.hypot(x - S.x, z - S.z) < S.r), pred = (x, z) => nearS(x, z) || zones.some(r => x > r[0] && x < r[1] && z > r[2] && z < r[3]);
    const again = () => { try { floraRemove(pred); } catch (e) {} }; again(); setTimeout(again, 2500); setTimeout(again, 9000); setTimeout(again, 25000); }
  // ================= UI: card, pick, toast, fade, sound =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, bellS = () => { for (let i = 0; i < 6; i++) tone(1320, 0.06, 0.25, 'triangle', i * 0.16); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + RED + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span></div>';
  const meter = (f, c, band, mid) => '<div style="position:relative;height:14px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px">' + (band ? '<div style="position:absolute;left:' + band[0] * 100 + '%;width:' + (band[1] - band[0]) * 100 + '%;top:0;bottom:0;background:#ffd23a"></div>' : '') + (mid ? '<div style="position:absolute;left:calc(' + (clamp(f, 0, 1) * 100).toFixed(1) + '% - 3px);top:-2px;bottom:-2px;width:6px;background:' + c + '"></div>' : '<div style="position:absolute;left:0;top:' + (band ? 4 : 0) + 'px;bottom:' + (band ? 4 : 0) + 'px;width:' + (clamp(f, 0, 1) * 100).toFixed(1) + '%;background:' + c + '"></div>') + '</div>';
  const steps = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">' + items.map(([t, ok]) => '<span style="padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;line-height:1.3;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffd23a' : '#201e1d') + '">' + (ok ? '\u2713 ' : '') + t + '</span>').join('') + '</div>' : items.map(([t, ok]) => '<div style="display:flex;gap:8px;align-items:center;padding:3px 0;border-top:1px solid #cfcac3;font-weight:800;font-size:13px"><span style="width:14px;height:14px;flex:none;border:2px solid #201e1d;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:#ffd23a;font-size:10px;line-height:10px;text-align:center">' + (ok ? '\u2713' : '') + '</span><span>' + t + '</span></div>').join('');
  const tipH = (who, t) => '<div style="margin-top:6px;font-size:12px;font-weight:800;line-height:1.3"><span style="color:' + RED + ';font-weight:900">' + who + ' \u00b7 </span>' + t + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  let veil = null, fading = false; const fade = fn => { if (fading) return; fading = true; if (!veil) { veil = document.createElement('div'); Object.assign(veil.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity .28s', zIndex: '40' }); document.body.appendChild(veil); }
    void veil.offsetWidth; veil.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { veil.style.opacity = '0'; fading = false; }, 160); } }, 300); };
  // ================= input =================
  let busy = null, J = null, lastP = null, snapK = false, endClear = 0;
  const ptr = { down: false, x: 0, y: 0, id: null, t0: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && J && !fading;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; ptr.t0 = performance.now(); e.stopPropagation(); press(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const pd = v => { const s = scrW(v); return s[2] > 1 ? 1e9 : Math.hypot(s[0] - ptr.x, s[1] - ptr.y); };
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const rayIn = obj => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); obj.updateWorldMatrix(true, false); return rc.ray.clone().applyMatrix4(new THREE.Matrix4().copy(obj.matrixWorld).invert()); };
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); coin(); return n; };
  const missOne = (msg, s = 1.8) => { J.miss++; nope(); toast(msg, s); };
  // ================= crew + truck + dog on a call =================
  const ln = (who, role) => text => ({ who, role, text });
  const T_CHIEF = { key: 'chiefEmber', name: 'Chief Ember', role: 'MERU FIRE', obj: chief, ry: CHIEF0[2], r: 6 }, chiefLn = ln('Chief Ember', 'MERU FIRE');
  const T_AXLE = { key: 'fireDriver', name: 'Axle', role: 'DRIVER \u00b7 FIRE BOAT', obj: axle, r: 3 }, T_RUNG = { key: 'fireLadder', name: 'Rung', role: 'LADDER FOX', obj: rung, r: 3 }, T_SPRITZ = { key: 'fireHose', name: 'Spritz', role: 'HOSE FOX', obj: spritz, r: 3 };
  const T_DOG = { key: 'fireDog', name: 'Sparks', role: 'STATION DOG', obj: dog.g, r: 3 }, T_RESC = { key: 'fireRescueFox', name: 'Rescued Fox', role: 'LAKE ROW', obj: rescued, r: 8 };
  const atScene = (S, f, lx, lz, lookX, lookZ) => { const w = S.W(lx, 0, lz), l = S.W(lookX, 0, lookZ); f.position.set(w.x, S.y, w.z); f.rotation.y = Math.atan2(l.x - w.x, l.z - w.z); f.visible = true; };
  function callOut(S, opt) { placeTruck(S.W(opt.truck[0], 0, opt.truck[1]).x, S.W(opt.truck[0], 0, opt.truck[1]).z, S.ry + (opt.truckR || 0)); truck.g.position.y = S.y; truck.flash = true;
    for (const k in CREW) { const c = opt.crew && opt.crew[k]; if (c) { atScene(S, CREW[k], ...c); crewCol[k].c = [9e3, 9e3, 0.1]; } else CREW[k].visible = false; }
    const d = S.W(opt.dog[0], 0, opt.dog[1]); dog.g.position.set(d.x, S.y, d.z); const dl = S.W(opt.dog[2], 0, opt.dog[3]); dog.g.rotation.y = Math.atan2(dl.x - d.x, dl.z - d.z); dog.st = 'sit'; dogCol.c = [9e3, 9e3, 0.1];
    const p = S.W(opt.me[0], 0, opt.me[1]), pl = S.W(opt.me[2], 0, opt.me[3]); go(p.x, S.y, p.z, Math.atan2(pl.x - p.x, pl.z - p.z)); snapK = true; }
  function backHome(P) { truckHome(); truck.flash = false; crewHome(); crewCol.axle.c = [-43.6, 191.7, 0.4]; crewCol.rung.c = [-62.6, 196.6, 0.4]; crewCol.spritz.c = [-33.9, 204.3, 0.4]; dogHome(); rollWant = 0; rollK = 1; setRoll(1);
    go(-45.3, 0, 200.5, -Math.PI / 2); snapK = true; endClear = 7; }
  // ================= JOBS =================
  const GD = {};
  // ---------- 1 BUILDING FIRE ----------
  const flameMats = [new THREE.MeshBasicMaterial({ color: '#ff5a1a', transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })];
  const makeFlame = () => { const g = new THREE.Group(), parts = []; for (const [r, h, m, x, z] of [[0.42, 1.3, 0, 0, 0], [0.3, 1.0, 0, 0.22, 0.1], [0.3, 0.95, 0, -0.2, -0.05], [0.2, 0.75, 1, 0, 0.06]]) { const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), flameMats[m]); c.position.set(x, h / 2, z); g.add(c); parts.push(c); } g.userData.parts = parts; return noCull(g); };
  const pts = (n, size, color, parent) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ size, color, map: glowT, transparent: true, depthWrite: false, opacity: 0.9 })); p.frustumCulled = false; p.userData.noCull = true; parent.add(p); return p; };
  GD.fire = { S: sM, opt: { truck: [-4.2, 6.8], truckR: 0, crew: { axle: [-4.6, 4.5, 0, -1.5], spritz: [-2.0, 4.0, 0, -1.5] }, dog: [1.6, 6.0, 0, 0], me: [0.4, 4.5, 0.4, -1.5] },
    begin() { const S = sM; J.F = [[-1.0, 2.38, -0.95, 1], [1.1, 2.38, -0.95, 0.9], [0.2, 1.08, -0.9, 0.8], [2.3, 1.0, -0.9, 0.85]].map(([x, y, z, hp]) => { const f = makeFlame(); f.position.set(x, y, z); S.g.add(f); J.objs.push(f); return { f, x, y, z, hp, hitT: 9, flareCd: 0, out: false }; });
      J.smoke = pts(60, 0.9, '#6f6a66', S.g); J.objs.push(J.smoke); J.smD = [...Array(60)].map((_, i) => [i % 4, Math.random(), rnd(-0.3, 0.3), rnd(-0.3, 0.3)]);
      J.water = pts(40, 0.22, '#9fd8ff', S.g); J.objs.push(J.water); J.water.visible = false; J.steam = []; J.aim = null; J.lowTip = 0;
      const hose = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 1), LM('#e8d27a')); const a = V(-2.2, 0.06, 5.5), b = V(0.4, 0.06, 4.4); hose.position.copy(a).add(b).multiplyScalar(0.5); hose.scale.z = a.distanceTo(b); hose.rotation.y = Math.atan2(b.x - a.x, b.z - a.z); S.g.add(hose); J.objs.push(hose); },
    press() { J.spray = true; }, release() { J.spray = false; },
    tick(dt, t) { const S = sM; let aim = null; if (J.spray && ptr.down) { const r = rayIn(S.g), hp = V(); if (r.intersectPlane(new THREE.Plane(V(0, 0, 1), 0.9), hp)) aim = hp; } J.aim = aim;
      const noz = V(0.62, 1.22, 4.05); J.water.visible = !!aim;
      if (aim) { const a = J.water.geometry.attributes.position.array, c = noz.clone().lerp(aim, 0.5); c.y += 0.8 + noz.distanceTo(aim) * 0.08; for (let i = 0; i < 40; i++) { const u = ((i / 40) + t * 1.6) % 1, q = 1 - u; a[i * 3] = q * q * noz.x + 2 * q * u * c.x + u * u * aim.x + rnd(-0.03, 0.03); a[i * 3 + 1] = q * q * noz.y + 2 * q * u * c.y + u * u * aim.y; a[i * 3 + 2] = q * q * noz.z + 2 * q * u * c.z + u * u * aim.z; } J.water.geometry.attributes.position.needsUpdate = true; }
      let left = 0;
      for (const F of J.F) { if (F.out) continue; left++; F.hitT += dt; F.flareCd -= dt;
        const top = F.y + 1.2 * F.hp, inX = aim && Math.abs(aim.x - F.x) < 0.75;
        if (inX && aim.y > F.y - 0.5 && aim.y < F.y + 0.55 + 0.35 * F.hp) { F.hp -= dt * 0.55; F.hitT = 0; if (Math.random() < dt * 8) J.steam.push({ x: F.x + rnd(-0.3, 0.3), y: F.y + 0.3, z: F.z + 0.2, t: 0 }); }
        else if (inX && aim.y >= F.y + 0.55 + 0.35 * F.hp && aim.y < top + 2.5) J.lowTip = 1.4;
        if (F.hitT > 2.5) F.hp = Math.min(1.32, F.hp + dt * 0.055);
        if (F.hp >= 1.3 && F.flareCd <= 0) { F.flareCd = 6; F.hp = 1.1; missOne('FLARE-UP! KEEP SWEEPING'); }
        if (F.hp <= 0) { F.out = true; F.f.visible = false; addGold(5); for (let i = 0; i < 10; i++) J.steam.push({ x: F.x + rnd(-0.4, 0.4), y: F.y + rnd(0, 0.5), z: F.z + 0.2, t: rnd(0, 0.3) }); continue; }
        const s = 0.35 + 0.75 * F.hp; F.f.scale.set(s, s * (1 + Math.sin(t * 13 + F.x * 3) * 0.12), s); F.f.userData.parts.forEach((p, i) => { p.rotation.y = t * (2 + i); p.scale.x = 1 + Math.sin(t * 17 + i) * 0.1; }); }
      J.lowTip -= dt;
      { const a = J.smoke.geometry.attributes.position.array, act = J.F.filter(F => !F.out); J.smD.forEach((d, i) => { d[1] += dt * 0.35; if (d[1] > 1) d[1] -= 1; const F = act[d[0] % Math.max(1, act.length)]; if (!F) { a[i * 3 + 1] = -99; return; } a[i * 3] = F.x + d[2] + d[1] * 0.6; a[i * 3 + 1] = F.y + 0.8 + d[1] * 4.5; a[i * 3 + 2] = F.z + d[3] - d[1] * 0.4; }); J.smoke.geometry.attributes.position.needsUpdate = true; J.smoke.material.opacity = 0.25 + 0.5 * act.length / 4; }
      if (!J.steamP) { J.steamP = pts(40, 0.6, '#ffffff', S.g); J.objs.push(J.steamP); } { const a = J.steamP.geometry.attributes.position.array; J.steam = J.steam.filter(s => (s.t += dt) < 1.2).slice(-40); for (let i = 0; i < 40; i++) { const s = J.steam[i]; a[i * 3] = s ? s.x : 0; a[i * 3 + 1] = s ? s.y + s.t * 1.6 : -99; a[i * 3 + 2] = s ? s.z : 0; } J.steamP.geometry.attributes.position.needsUpdate = true; }
      if (!left && !J.doneT) { J.doneT = 1.2; } if (J.doneT && (J.doneT -= dt) <= 0) finishGame(); },
    card() { const left = J.F.filter(F => !F.out).length; return { key: 'f' + left + (J.lowTip > 0), next: 'HOLD + DRAG \u00b7 AIM LOW', body: steps(J.F.map((F, i) => [['AWNING LEFT', 'AWNING RIGHT', 'COUNTER', 'CRATES'][i], F.out])) + (J.lowTip > 0 ? tipH('CHIEF', 'Aim at the BASE of a fire, never the smoke.') : tipH('SPRITZ', 'Sweep side to side! Not at me!')) }; },
    shot() { return [sM.W(0.4, 1.4, -0.7), 8, 5.5, 0.3, 9, sM.ry + 0.5, 16]; },
    hint() { const F = J.F.filter(F => !F.out).sort((a, b) => b.hp - a.hp)[0]; return F ? [sM.W(F.x, F.y + 0.25, F.z), 'HOLD HERE'] : null; } };
  // ---------- 2 WINDOW RESCUE ----------
  function makeExtLadder() { const g = new THREE.Group(), base = new THREE.Group(), fly = new THREE.Group(); g.add(base); base.add(fly); const M = LM('#d9d4cc');
    for (const s of [-0.3, 0.3]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.2, 0.08), M); r.position.set(s, 2.1, 0); base.add(r); const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 5.0, 0.07), LM('#bfb8ad')); r2.position.set(s * 0.82, 2.5, -0.08); fly.add(r2); }
    for (let y = 0.35; y < 4.2; y += 0.38) { const k = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.05), M); k.position.set(0, y, 0); base.add(k); } for (let y = 0.3; y < 5; y += 0.38) { const k = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.05), LM('#bfb8ad')); k.position.set(0, y, -0.08); fly.add(k); }
    const pins = [-0.38, 0.38].map(s => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.22, 10), BM(YEL).clone()); p.rotation.z = Math.PI / 2; p.position.set(s, 0.45, 0.02); base.add(p); return p; });
    return noCull(Object.assign(g, { base, fly, pins })); }
  const LBASE = [1.6, 2.5], LTOPZ = 1.45, BAND = [7.8, 8.7];
  GD.ladder = { S: sH, opt: { truck: [-4.6, 5.6], crew: { axle: [-6.5, 3.6, 1.6, 2.5], rung: [0.9, 2.9, 1.6, 2.5] }, dog: [-2.0, 3.2, 1.6, 1], me: [2.7, 3.15, 1.6, 2.5] },
    begin() { const L2 = makeExtLadder(); L2.position.set(LBASE[0], 0, LBASE[1]); sH.g.add(L2); J.objs.push(L2); J.L = L2; J.ext = 4.2; J.st = 'raise'; J.sway = 0; J.swT = 0; J.wob = 0; J.pins = [false, false]; J.climb = 0;
      J.smoke = pts(40, 1.0, '#6f6a66', sH.g); J.objs.push(J.smoke); J.smD = [...Array(40)].map(() => [Math.random(), rnd(-0.3, 0.3)]); rescued.position.set(1.6, 8.18, 1.35); rescued.rotation.y = 0; rescued.visible = true; },
    setL() { const e = J.ext, a = -Math.asin(clamp((LBASE[1] - LTOPZ) / e, 0, 0.9)); J.L.rotation.x = a + Math.sin(J.wob * 20) * J.wob * 0.03; J.L.rotation.z = J.st === 'steady' ? J.sway * 0.05 : 0; J.L.fly.position.y = e - 4.2 - 0.1; J.topH = e * Math.cos(a); },
    press() { if (J.st === 'lock') { const i = J.pins.findIndex((on, k) => !on && pd(J.L.pins[k].getWorldPosition(V())) < RAD() * 1.4); if (i >= 0) { J.pins[i] = true; J.L.pins[i].material.color.set('#3f9a5e'); addGold(3); tone(880, 0.06, 0.15, 'square'); if (J.pins.every(Boolean)) { J.st = 'steady'; J.stT = 0; J.lastMissT = -9; } } } },
    release() { if (J.st === 'raise') { if (J.topH >= BAND[0] && J.topH <= BAND[1]) { J.st = 'lock'; addGold(8); tone(1040, 0.06, 0.2); } } },
    tick(dt, t) { if (J.st === 'raise') { if (ptr.down) { J.ext = Math.min(9.4, J.ext + dt * 1.5); this.setL(); if (J.topH > 8.95) { missOne('TOO HIGH! SLOW DOWN'); J.ext = 5.2; ptr.down = false; J.wob = 1; } } }
      J.wob = Math.max(0, J.wob - dt * 1.5); this.setL();
      if (J.st === 'steady') { J.stT += dt; const wind = 0.42 + 0.3 * Math.sin(t * 0.8) + (Math.sin(t * 2.3) > 0.85 ? 0.5 : 0); J.sway = clamp(J.sway + (wind - (ptr.down ? 1.25 : 0)) * dt * 0.8, -1, 1);
        if (Math.abs(J.sway) > 0.8) { J.wob = 1; if (J.stT - J.lastMissT > 2.5) { J.lastMissT = J.stT; missOne('WOBBLE! STEADY THE BASE'); J.sway *= 0.4; } }
        const k = J.stT, up = clamp(k / 5, 0, 1), down = clamp((k - 7) / 5, 0, 1), y = (up - down) * (J.topH - 1.6), lz = LBASE[1] - (y / Math.max(1, J.topH)) * (LBASE[1] - LTOPZ);
        const rw = sH.W(LBASE[0], y, lz + 0.18); rung.position.set(rw.x, sH.y + y, rw.z); rung.rotation.y = sH.ry + Math.PI; if (rung.userData.P && rung.userData.P.fore) { const mv = (k < 5 || (k > 7 && k < 12)); applyD(THREE, rung, workD('ladder', 0, { k: mv ? (k * 1.4) % 1 : 0.25 }), k, 1); rung.userData._wk = 1; }
        if (k > 6 && k < 7) { rescued.position.set(1.6, 8.18 - (k - 6) * 0.5, 1.35 + (k - 6) * 0.4); }
        if (k >= 7) { rescued.position.set(LBASE[0] + 0.05, y + 0.25, lz + 0.42); rescued.rotation.y = Math.PI; }
        if (k >= 12) { rescued.position.set(0.6, 0, 3.6); rescued.rotation.y = Math.atan2(2.7 - 0.6, 3.15 - 3.6); const rw2 = sH.W(0.9, 0, 2.9); rung.position.set(rw2.x, sH.y, rw2.z); addGold(12); finishGame(); return; } }
      const a = J.smoke.geometry.attributes.position.array; J.smD.forEach((d, i) => { d[0] = (d[0] + dt * 0.3) % 1; a[i * 3] = 1.6 + d[1] + d[0] * 0.8; a[i * 3 + 1] = 9.0 + d[0] * 4; a[i * 3 + 2] = 1.2 - d[0] * 0.3; }); J.smoke.geometry.attributes.position.needsUpdate = true; },
    card() { if (J.st === 'raise') return { key: 'lr' + Math.round(J.topH * 10), next: 'HOLD \u00b7 LET GO IN THE YELLOW', body: '<div style="font-size:12px;font-weight:900;margin-top:6px">LADDER TOP \u00b7 ' + J.topH.toFixed(1) + ' M</div>' + meter(J.topH / 9.4, RED, [BAND[0] / 9.4, BAND[1] / 9.4]) + tipH('RUNG', 'Raise it slow. Lock it. THEN climb.') };
      if (J.st === 'lock') return { key: 'll' + J.pins.join(), next: 'TAP BOTH LOCKS', body: steps([['LEFT LOCK', J.pins[0]], ['RIGHT LOCK', J.pins[1]]]) + tipH('RUNG', 'Raise it slow. Lock it. THEN climb.') };
      return { key: 'ls' + Math.round(J.sway * 20) + (J.stT > 7), next: 'HOLD TO LEAN IN \u00b7 LET GO TO EASE', body: '<div style="font-size:12px;font-weight:900;margin-top:6px">' + (J.stT < 7 ? 'RUNG IS CLIMBING' : 'COMING DOWN WITH THE FOX') + '</div>' + meter((J.sway + 1) / 2, INK, [0.35, 0.65], true) + tipH('CHIEF', 'Rung, ladder. You, steady the base.') }; },
    shot() { return [sH.W(0.9, 5.4, 1.6), 7, 12.5, 0.16, 12, sH.ry + 0.55, 26]; },
    hint() { if (J.st === 'raise') return [sH.W(LBASE[0], Math.min(J.topH, 6), 2.0), 'HOLD \u00b7 LET GO IN THE YELLOW']; if (J.st === 'lock') { const i = J.pins.findIndex(p => !p); return i >= 0 ? [J.L.pins[i].getWorldPosition(V()), 'TAP THE LOCK'] : null; } return [sH.W(LBASE[0], 1.0, LBASE[1]), 'HOLD + LET GO']; } };
  // ---------- 3 CAT IN A TREE ----------
  const MARKS = [[2.0, 1.0], [-1.1, 1.0], [0.3, -1.5]];
  function makeShortLadder() { const g = new THREE.Group(), M = LM('#d9d4cc'); for (const s of [-0.26, 0.26]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.07, 4.4, 0.07), M); r.position.set(s, 2.2, 0); g.add(r); } const rungs = []; for (let i = 0; i < 10; i++) { const k = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 0.05), M.clone()); k.position.set(0, 0.4 + i * 0.42, 0); g.add(k); rungs.push(k); } g.userData.rungs = rungs; return noCull(g); }
  GD.cat = { S: sT, opt: { truck: [-4.5, 1.0], truckR: -Math.PI / 2, crew: { axle: [-3.0, -2.6, 0, 0], rung: [-1.2, 3.0, 1.0, 0] }, dog: [-1.8, 4.4, 0, 0], me: [3.4, 2.2, 2.0, 0.5] },
    begin() { J.st = 'place'; J.trust = 0; J.climb = 0; cat.position.copy(CAT0); cat.rotation.y = -Math.PI / 2; cat.visible = true;
      J.marks = MARKS.map(([x, z]) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.46, 24), BM(YEL).clone()); m.material.transparent = true; m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z); sT.g.add(m); J.objs.push(m); return m; });
      const l = makeShortLadder(); l.position.set(-4.5, 3.25, 1.5); l.rotation.set(Math.PI / 2, 0, 0); sT.g.add(l); J.objs.push(l); J.lad = l; },
    press() { if (J.st === 'place') { let bi = -1, bd = RAD() * 1.6; J.marks.forEach((m, i) => { const d = pd(sT.g.localToWorld(m.position.clone())); if (d < bd) { bd = d; bi = i; } }); if (bi < 0) return;
        if (bi !== 0) { missOne('NOT UNDER THE CAT'); tone(880, 0.04, 0.3, 'triangle'); J.marks[bi].visible = false; return; }
        J.st = 'fly'; addGold(6); J.marks.forEach(m => { m.visible = false; }); J.flyT = 0; return; }
      if (J.st === 'climb') { const r = J.lad.userData.rungs[J.climb + 1]; if (r && pd(r.getWorldPosition(V())) < RAD() * 1.8) { J.climb++; tone(660 + J.climb * 80, 0.05, 0.12, 'triangle'); addGold(1.5); if (J.climb >= 4) { J.st = 'paw'; J.stT = 0; } } return; }
      if (J.st === 'paw') { const cw = cat.getWorldPosition(V()); cw.y += 0.15; J.onCat = pd(cw) < RAD() * 1.1; } },
    release() { if (J.st === 'paw' && J.onCat && performance.now() - ptr.t0 < 350) { missOne("HISS! DON'T GRAB", 2); J.trust = Math.max(0, J.trust - 0.35); J.hiss = 0.6; } J.onCat = false; },
    tick(dt, t) { const lp = (k, a, b) => a + (b - a) * k;
      if (J.st === 'place') J.marks.forEach((m, i) => { m.scale.setScalar(1 + 0.12 * Math.sin(t * 5 + i)); });
      if (J.st === 'fly') { J.flyT += dt / 0.9; const k = Math.min(1, J.flyT), e = k * k * (3 - 2 * k); J.lad.position.set(lp(e, -4.5, 2.0), lp(e, 3.25, 0) + Math.sin(Math.PI * e) * 1.2, lp(e, 1.5, 1.0)); J.lad.rotation.set(lp(e, Math.PI / 2, -0.2), 0, 0); if (k >= 1) J.st = 'climb'; }
      if (J.st === 'climb' || J.st === 'paw' || J.st === 'down') J.lad.userData.rungs.forEach((r, i) => { r.material.color.set(J.st === 'climb' && i === J.climb + 1 && Math.sin(t * 8) > 0 ? YEL : '#d9d4cc'); });
      if (J.st === 'paw') { J.stT += dt; J.hiss = Math.max(0, (J.hiss || 0) - dt); if (ptr.down && !J.onCat) J.trust = Math.min(1, J.trust + dt / 4.5); else if (!ptr.down) J.trust = Math.max(0, J.trust - dt * 0.05);
        cat.position.set(CAT0.x - J.trust * 0.45 + (J.hiss > 0 ? 0.15 : 0), CAT0.y, CAT0.z); cat.rotation.z = J.hiss > 0 ? Math.sin(t * 40) * 0.1 : 0;
        if (J.trust >= 1) { J.st = 'down'; J.dnT = 0; addGold(14); tone(1320, 0.06, 0.5); } }
      if (J.st === 'down') { J.dnT += dt; const k = Math.min(1, J.dnT / 1.6); J.climb = 4 * (1 - k); if (k >= 1) { finishGame(); return; } } },
    fox(fox) { if (!['climb', 'paw', 'down'].includes(J.st)) return; const y = J.climb * 0.5, lz = 1.0 - (y / 4.3) * 0.88, w = sT.W(2.0, y, lz + 0.32); fox.position.set(w.x, sT.y + y, w.z); fox.rotation.y = sT.ry + Math.PI;
      if (J.st === 'down') { const h = sT.W(2.0, y + 1.0, lz + 0.62); cat.position.copy(sT.g.worldToLocal(h)); }
      const A = fox.userData && fox.userData.P && fox.userData.P.arms; if (A && J.st === 'paw' && ptr.down) { A[1].rotation.x = -2.2; } },
    card() { if (J.st === 'place' || J.st === 'fly') return { key: 'cp', next: 'TAP THE MARK UNDER THE CAT', body: tipH('CHIEF', 'Cat in a tree by the gardens. Bring the short ladder and some patience.') };
      if (J.st === 'climb') return { key: 'cc' + J.climb, next: 'TAP THE YELLOW RUNG', body: steps([1, 2, 3, 4].map(i => ['RUNG ' + i, J.climb >= i])) };
      return { key: 'ct' + Math.round(J.trust * 20) + (J.hiss > 0), next: 'HOLD \u00b7 DON\'T TAP THE CAT', body: '<div style="font-size:12px;font-weight:900;margin-top:6px">CAT TRUST</div>' + meter(J.trust, '#3f7a52') + tipH('RUNG', "Don't grab. Hold out a paw and wait.") }; },
    shot() { return J.st === 'place' || J.st === 'fly' ? [sT.W(1.1, 3.0, 0.3), 8, 8.5, 0.32, 10, sT.ry + 0.7, 16] : [sT.W(2.0, 3.6, 0.4), 4.0, 3.8, 0.3, 5.5, sT.ry + 1.1, 10]; },
    hint() { if (J.st === 'place') return [sT.W(2.0, 0.06, 1.0), 'TAP UNDER THE CAT']; if (J.st === 'climb') { const r = J.lad.userData.rungs[J.climb + 1]; return r ? [r.getWorldPosition(V()), 'TAP THE RUNG'] : null; } if (J.st === 'paw') return [sT.W(1.6, 3.6, 0.6), 'HOLD HERE \u00b7 WAIT']; return null; } };
  // ---------- 4 FIRE DRILL ----------
  GD.drill = { station: true,
    begin() { J.st = 'slide'; J.t0 = performance.now(); J.slideT = -1; const names = [...LNAMES].sort(() => Math.random() - 0.5); lockers.forEach((lk, i) => { lk.name = names[i]; lk.pl.material.map = plateTex[names[i]]; lk.pl.material.needsUpdate = true; lk.want = 0; lk.hinge.rotation.y = 0; }); J.mine = lockers.find(l => l.name === 'ROOKIE');
      J.got = { boots: false, coat: false, helmet: false }; GEAR.visible = false; J.walk = null; go(-57.4, 0, 196.9, Math.PI); snapK = true; dog.st = 'stand'; J.dogGo = 0; },
    press() { if (J.st === 'slide') { if (J.slideT < 0) { J.slideT = 0; tone(520, 0.05, 0.8, 'sawtooth'); } return; }
      if (J.st === 'locker') { let best = null, bd = RAD() * 1.5; for (const lk of lockers) { const d = pd(lk.g.localToWorld(V(0, 1.3, 0.3))); if (d < bd) { bd = d; best = lk; } } if (!best) return;
        if (best !== J.mine) { missOne("THAT'S " + best.name + "'S LOCKER"); return; } best.want = 1; addGold(6); placeGear(best); J.st = 'gear'; return; }
      if (J.st === 'gear') { const order = ['boots', 'coat', 'helmet'], obj = { boots: gearBoots, coat: gearCoat, helmet: gearHelmet }; let hit = null, bd = RAD() * 1.8;
        for (const k of order) if (!J.got[k] && obj[k].visible) { const d = pd(gearPt(k)); if (d < bd) { bd = d; hit = k; } } if (!hit) return;
        const need = order.find(k => !J.got[k]); if (hit !== need) { missOne(need.toUpperCase() + ' FIRST'); return; } J.got[hit] = true; obj[hit].visible = false; addGold(4); tone(780 + order.indexOf(hit) * 160, 0.05, 0.15, 'triangle');
        if (hit === 'helmet') { tempHelmet(true); J.st = 'truck'; } return; }
      if (J.st === 'truck') { if (pd(V(-42.6, 1.4, 193.2)) < RAD() * 2) { addGold(8); J.st = 'go'; J.goT = 0; J.time = (performance.now() - J.t0) / 1000; if (J.time < 30) addGold(10); rollWant = 1; truck.flash = true; tone(440, 0.08, 0.6, 'square'); tone(554, 0.08, 0.6, 'square', 0.6); } } },
    tick(dt, t) { if (J.st === 'slide' && J.slideT >= 0) { J.slideT += dt; if (J.slideT >= 1.0) { J.st = 'walk'; J.walk = { t: 0, from: [-57.4, 196.9], to: [-51.7, 192.0] }; } }
      if (J.st === 'walk') { J.walk.t += dt / 0.7; const k = Math.min(1, J.walk.t); if (J.P) Object.assign(J.P, { x: J.walk.from[0] + (J.walk.to[0] - J.walk.from[0]) * k, z: J.walk.from[1] + (J.walk.to[1] - J.walk.from[1]) * k, yaw: k < 1 ? Math.atan2(J.walk.to[0] - J.walk.from[0], J.walk.to[1] - J.walk.from[1]) : -Math.PI * 0.6, sp: 0 }); if (k >= 1) J.st = 'locker'; }
      lockers.forEach(lk => { lk.hinge.rotation.y += ((lk.want ? 1.5 : 0) - lk.hinge.rotation.y) * Math.min(1, dt * 6); });
      if (J.st === 'go') { J.goT += dt; if (J.goT > 2.6) { finishGame(); return; } }
      J.dogGo = Math.min(1, J.dogGo + dt / 2.5); { const a = [DOG0[0], DOG0[1]], b = [-41.2, 199.2], k = J.dogGo; dog.g.position.set(a[0] + (b[0] - a[0]) * k, 0, a[1] + (b[1] - a[1]) * k); dog.g.rotation.y = k < 1 ? Math.atan2(b[0] - a[0], b[1] - a[1]) : -Math.PI / 2; if (k >= 1) dog.st = 'sit'; } },
    fox(fox) { if (J.st === 'slide') { const k = J.slideT < 0 ? 0 : Math.min(1, J.slideT), y = 4.13 * (1 - k * k); fox.position.set(J.slideT < 0 ? -57.95 : -57.62, y, 196); fox.rotation.y = Math.PI / 2; if (J.slideT < 0) fox.position.y = 4.13; }
      if (J.st === 'go') fox.visible = false; },
    card() { const sec = Math.floor((J.st === 'go' ? J.time : (performance.now() - J.t0) / 1000)), clk = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
      const next = { slide: 'TAP TO SLIDE THE POLE', walk: 'TO YOUR LOCKER', locker: 'TAP YOUR LOCKER \u00b7 ROOKIE', gear: 'BOOTS \u00b7 COAT \u00b7 HELMET', truck: 'TAP THE TRUCK DOOR', go: 'ON THE TRUCK!' }[J.st];
      return { key: 'd' + J.st + clk + JSON.stringify(J.got), next, right: clk, body: steps([['SLIDE THE POLE', J.st !== 'slide'], ['YOUR LOCKER', ['gear', 'truck', 'go'].includes(J.st)], ['BOOTS', J.got.boots], ['COAT', J.got.coat], ['HELMET', J.got.helmet], ['ON THE TRUCK', J.st === 'go']]) + tipH('RUNG', 'Boots FIRST! Always boots first!') }; },
    shot() { if (J.st === 'slide' || J.st === 'walk') return [V(-57.4, 3.2, 196.3), 3.6, 6.6, 0.12, 5.6, Math.PI / 2 + 0.25, 10]; if (J.st === 'locker' || J.st === 'gear') return [V(-54.6, 1.3, 191.0), 5.4, 2.6, 0.32, 5.2, -0.35, 8]; return [V(-45.2, 1.6, 194.6), 9, 4, 0.22, 7, 0.55, 12]; },
    hint() { if (J.st === 'slide') return [V(-57.4, 3.6, 196), 'TAP TO SLIDE']; if (J.st === 'locker') return [J.mine.g.localToWorld(V(0, 1.3, 0.3)), 'YOUR LOCKER'];
      if (J.st === 'gear') { const k = ['boots', 'coat', 'helmet'].find(q => !J.got[q]), o = k; return o ? [gearPt(k), 'TAP THE ' + k.toUpperCase()] : null; } if (J.st === 'truck') return [V(-42.6, 1.4, 193.2), 'TAP THE DOOR']; return null; } };
  let tHelm = null; function tempHelmet(on) { if (tHelm && tHelm.parent) tHelm.parent.remove(tHelm); tHelm = null; if (!on || !lastFox) return; const P = lastFox.userData && lastFox.userData.P; if (!P || !P.head) return; tHelm = helmetMesh(RED2); tHelm.position.y = 0.26; P.head.add(tHelm); }
  // ================= prizes =================
  const COAT = { outfit: 'coat', torso: FIRE_T.slice(), name: 'FIREFIGHTER COAT' };
  const coatOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === COAT.name); };
  const done = () => save.stat('fsDone', null) || {};
  function giveGift() { save.setStat('fsClears', save.stat('fsClears', 0) + 1); const d = done(), nd = GAMES.filter(q => d[q.k]).length;
    if (!save.stat('fsCoat', false)) { save.setStat('fsCoat', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === COAT.name)) save.setStat('tailorOutfits', [...list, COAT]);
      save.setStat('fsPrevOutfit', save.data && save.data.outfit ? save.data.outfit : null); save.setOutfit(COAT); wear && wear(COAT); return 'coat'; }
    if (nd >= 2 && !save.stat('fsHydrant', false)) { save.setStat('fsHydrant', true); return 'hydrant'; }
    if (nd >= GAMES.length && !save.stat('fsAll', false)) { save.setStat('fsAll', true); save.give('goldenHelmet'); save.addGold(60); return 'all'; } return null; }
  const GIFT = { coat: 'Your own coat and helmet. The Tailor keeps them too.', hydrant: 'The hydrant out front is yours now. One free Energy Fill Pod a day.', all: 'Every job done. The GOLDEN HELMET, and 60 gold. Put it on your shelf.' };
  let wornH = null; function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.head) return; const on = coatOn() && !(busy === 'job' && J && J.g === 'drill');
    if (wornH && wornH.on === on && wornH.fox === fox && (!wornH.m || wornH.m.parent === P.head)) return; if (wornH && wornH.m && wornH.m.parent) wornH.m.parent.remove(wornH.m); wornH = { on, fox, m: null }; if (!on) return; const m = helmetMesh(RED2); m.position.y = 0.26; P.head.add(m); wornH.m = m; }
  // ================= run a job =================
  const INTRO = { fire: [T_CHIEF, 'Smoke over the market. Grab the hose. Aim LOW, at the flames.'], ladder: [T_CHIEF, 'Fox stuck on the third floor. Rung, ladder. You steady the base.'], cat: [T_CHIEF, 'Cat in a tree by the gardens. Bring the short ladder and some patience.'], drill: [T_CHIEF, "Bell drill. Boots, coat, helmet, on the truck. I am counting."] };
  const DONE = { fire: [T_CHIEF, 'Out, and nobody hurt. Good.'], ladder: [T_RESC, "Thank you. I am never cooking toast again."], cat: [T_CHIEF, "The cat is fine. The cat is always fine."], drill: [T_CHIEF, 'Under a minute. Do it again tomorrow.'] };
  const nextJob = () => { const d = done(); const n = GAMES.find(q => !d[q.k]); return n ? n.k : GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0].k; };
  let introT = 0; function startGame(g, P) { if (busy) return; const [T, line] = INTRO[g]; busy = 'intro'; introT = 0; sayTo(T, [{ who: T.name, role: T.role, text: line }], () => begin(g, P)); }
  function begin(g, P) { if (busy !== 'intro') return; save.setStat('fsVisits', save.stat('fsVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], t: 0, pause: 0, P }; busy = 'job'; bellT = 2.2; bellS(); ding();
    if (dog.st === 'sleep') toast('WOOF! SPARKS IS UP, AND OUT OF THE DOOR BEFORE ANYONE.', 3);
    const D = GD[g]; if (D.station) { fade(() => { D.begin(); }); return; } rollWant = 1; fade(() => { callOut(D.S, D.opt); D.begin(); }); }
  function finishGame() { if (!J || busy !== 'job') return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat('fsDone', d); const gift = giveGift(); K.finish(g, stars, gold, first); hideCard(); busy = 'end'; J.retT = 18; const D = GD[g], P0 = J.P;
    const say = () => { const [T, line] = DONE[g]; const L1 = [{ who: T.name, role: T.role, text: line }]; if (stars === 3 && g !== 'drill' && T === T_CHIEF) L1[0].text += ' That was textbook.'; if (gift) L1.push({ who: 'Chief Ember', role: 'MERU FIRE', text: GIFT[gift] });
      if (Math.random() < 0.34) { gloveT = 60; setTimeout(() => toast('SPARKS DROPS A SOGGY GLOVE AT YOUR FEET', 3.2), 400); }
      sayTo(T.key === 'fireRescueFox' ? T_RESC : T_CHIEF, L1, () => { if (busy === 'end') wrapUp(P0); }); };
    setTimeout(() => { if (D.station) { cleanup(); go(-45.3, 0, 200.5, -Math.PI / 2); snapK = true; endClear = 7; say(); return; }
      if (DONE[g][0] === T_RESC) { if (J) J.endShot = [sH.W(1.4, 1.3, 3.4), 4.5, 3, 0.2, 6.5, sH.ry + 0.35, 11]; say(); return; } fade(() => { cleanup(); backHome(P0); say(); }); }, 1500); }
  function wrapUp(P) { if (J && !GD[J.g].station && DONE[J.g][0] === T_RESC) { fade(() => { cleanup(); backHome(P); busy = null; J = null; }); return; } cleanup(); busy = null; J = null; }
  function cleanup() { if (J) { J.objs.forEach(o => o.parent && o.parent.remove(o)); J.objs = []; } GEAR.visible = false; lockers.forEach(l => { l.want = 0; }); tempHelmet(false); hideCard(); HINT.style.display = 'none'; rescued.position.set(1.6, 8.18, 1.35); rescued.rotation.y = 0; cat.position.copy(CAT0); cat.rotation.set(0, -Math.PI / 2, 0); if (dog.st !== 'sleep' && GD[J ? J.g : 'drill'].station) dogHome(); truck.flash = false; rollWant = 0; }
  function stop() { const away = J && !GD[J.g].station, P0 = J && J.P; cleanup(); busy = null; J = null; ptr.down = false; if (away) fade(() => backHome(P0)); else { dogHome(); crewHome(); } }
  function quit() { if (busy === 'intro') { busy = null; return; } stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  // ================= camera (job shots) =================
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99, offK = 1]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * offK * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !fading && GD[J.g].shot ? GD[J.g].shot() : busy === 'end' && J && J.endShot && !fading ? J.endShot : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.08; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on || snapK) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(snapK ? camT.pos : cam.position); } snapK = false; const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    if (GD[J.g].station) camCur.pos.set(clamp(camCur.pos.x, X0 + 0.6, X1 - 0.6), clamp(camCur.pos.y, 0.6, 7.6), clamp(camCur.pos.z, Z0 + 0.6, Z1 - 0.6)); else { const S = GD[J.g].S; camCur.pos.y = Math.max(camCur.pos.y, S.y + 0.8); }
    cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ================= hint hand =================
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; HINT.lastChild.textContent = h[1]; };
  // ================= talk + prompt =================
  const inShop = P => P.x > X0 && P.x < X1 && P.z > Z0 && P.z < Z1 && (P.y || 0) < 3.5;
  const near = (P, x, z, r) => Math.hypot(P.x - x, P.z - z) < r;
  const ringAt = P => GAMES.find(q => near(P, RINGS[q.k][0], RINGS[q.k][1], 1.05));
  const nearChief = P => near(P, -46.2, 200.5, 1.9) || near(P, chief.position.x, chief.position.z, 1.8);
  const today = () => save.stat('meru2Day', 1), hydOk = () => save.stat('fsHydrant', false) && save.stat('fsPodDay', 0) !== today();
  const CREW_SPOT = [['axle', T_AXLE, 1.8], ['rung', T_RUNG, 1.8], ['spritz', T_SPRITZ, 1.8]];
  function prompt(P) { if (busy) return null; if (Math.hypot(P.x - CX, P.z - CZ) > 30) return null; const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; if (nearChief(P)) return 'TALK \u00b7 CHIEF EMBER';
    if (save.stat('fsHydrant', false) && near(P, HYD[0], HYD[1], 1.6)) return hydOk() ? 'HYDRANT \u00b7 FREE ENERGY FILL POD' : 'HYDRANT \u00b7 COME BACK TOMORROW';
    for (const [k, T, rr] of CREW_SPOT) if (near(P, CREW[k].position.x, CREW[k].position.z, rr)) return 'TALK \u00b7 ' + T.name.toUpperCase();
    if (near(P, dog.g.position.x, dog.g.position.z, 1.7)) return 'SPARKS \u00b7 STATION DOG'; return null; }
  const HELLO = ["Back again. The bell's been quiet. Let's keep it that way.", 'Boots by the door. Then we talk.', 'Good timing. Something always starts burning when I sit down.'];
  const FIRST = "Mind the hoses. Spritz leaves them everywhere. I'm Chief Ember. You here to HELP, or to look at the truck?";
  const TIPS = ['Aim at the BASE of a fire, never the smoke.', 'On a ladder, three paws on the rungs. Always three.', "A hydrant you never checked is a hydrant that won't work.", 'Count your crew in, and count them out again.', 'A cat comes down when it wants to. Help it want to.'];
  const PLACE = ['Meru Fire Station. Four foxes, one truck, one boat, one dog who sleeps through everything but the bell.', 'We sit by the LAKE on purpose. Half of town is wood. All of the lake is water.'];
  let talked = save.stat('fsTalked', 0), tipN = 0;
  function chiefMenu(P) { const first = !talked; talked++; save.setStat('fsTalked', talked);
    const ch = [{ text: CHOICE_WORK, pick: () => startGame(nextJob(), P) }, { text: 'PICK A JOB', pick: () => sayTo(T_CHIEF, [{ ...chiefLn('Which call?'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k, P) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'WHAT IS THIS PLACE?', pick: () => sayTo(T_CHIEF, PLACE.map(chiefLn)) }, { text: 'A TIP, PLEASE', pick: () => sayTo(T_CHIEF, [chiefLn(TIPS[tipN++ % TIPS.length])]) },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(T_CHIEF, [chiefLn('Stay clear of the smoke. And of Spritz.')]) }];
    sayTo(T_CHIEF, [{ ...chiefLn(first ? FIRST : HELLO[(talked - 2) % HELLO.length]), choices: ch }]); }
  const CREW_LINES = { axle: { hello: "You want to ride along? Hold on to something. I don't really do slow.", ask: [['DO YOU DRIVE THE BOAT TOO?', 'Truck on land, boat on water. Same rule for both: get there FIRST.'], ['THE SIREN?', "The siren is my favourite part. The Chief says it's not supposed to be."]] },
    rung: { hello: "Up there I'm fine. Forty feet, wind, smoke, no problem.", ask: [['AND DOWN HERE?', 'Down here people TALK to me. Much worse. Pass me that rope.']] },
    spritz: { hello: "Oh! Sorry. Did I get you? I get everyone. It's a gift.", ask: [['ANY HOSE RULES?', "Hose rule one: point it AWAY from your friends. I'm still working on rule one."]] } };
  function crewTalk(k, T) { const C = CREW_LINES[k], l = ln(T.name, T.role); sayTo(T, [{ ...l(C.hello), choices: [...C.ask.map(([q, a]) => ({ text: q, pick: () => sayTo(T, [l(a)]) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  let dogN = 0, gloveT = 0;
  function talk(P) { lastP = P; if (busy === 'job') return true; if (busy) return false; if (Math.hypot(P.x - CX, P.z - CZ) > 30) return false;
    const r = ringAt(P); if (r) { startGame(r.k, P); return true; } if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; }
    if (nearChief(P)) { tone(1320, 0.05, 0.6); chiefMenu(P); return true; }
    if (save.stat('fsHydrant', false) && near(P, HYD[0], HYD[1], 1.6)) { if (hydOk()) { save.setStat('fsPodDay', today()); save.give('energyPod'); coin(); toast('+1 ENERGY FILL POD \u00b7 FROM THE HYDRANT', 2.6); } else toast('ONE A DAY \u00b7 COME BACK TOMORROW', 2); return true; }
    for (const [k, T] of CREW_SPOT) if (near(P, CREW[k].position.x, CREW[k].position.z, 1.8)) { crewTalk(k, T); return true; }
    if (near(P, dog.g.position.x, dog.g.position.z, 1.7)) { const l = ln('Sparks', 'STATION DOG'); sayTo(T_DOG, [l(gloveT > 0 ? 'Sparks drops a soggy glove at your feet. It might be a present.' : 'Sparks snores. One ear twitches.')]); return true; }
    return false; }
  // ================= per frame =================
  let lastFox = null, boatT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000, dS = Math.hypot(P.x - CX, P.z - CZ), farK = touch ? 90 : 160; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt; gloveT -= dt;
    const onCall = J && !GD[J.g].station && busy !== 'intro'; G.visible = dS < farK || !!onCall; EG.visible = dS < farK + 40;
    for (const k in SC) { const S = SC[k]; S.g.visible = Math.hypot(P.x - S.x, P.z - S.z) < (touch ? 100 : 170); }
    truck.g.visible = G.visible || !!onCall; applyWear(fox);
    // s634: during the BUILDING FIRE call Spritz works the hose (braced, sweeping low); the crew drop their work poses after a call
    if (spritz.userData.P && spritz.userData.P.fore) { if (J && J.g === 'fire' && busy === 'job') { applyD(THREE, spritz, workD('hose', t, { aim: Math.sin(t * 0.8) }), t, 1); spritz.userData._wk = 1; } else if (spritz.userData._wk) { spritz.userData._wk = 0; endPose(spritz); } }
    if (rung.userData._wk && !(J && busy === 'job')) { rung.userData._wk = 0; endPose(rung); }
    if (J && J.retT != null && busy === 'end' && (J.retT -= dt) <= 0) wrapUp(J.P);
    if (busy === 'intro' && (introT += dt) > 25) busy = null;   // the intro box was closed without starting
    if (busy === 'job' && J && !fading) { J.t += dt; J.P = P; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('fire job: ' + (e && e.stack || e)); stop(); } if (J && D.fox && fox) D.fox(fox); if (J) { const c = D.card(); setCard(J.g + c.key + J.miss + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), c.right || (J.gold ? J.gold + ' G' : 'MERU FIRE')) + foot(c.next) + '<div style="padding:4px 10px 8px">' + c.body + '</div>'); } }
    hintTick(t);
    // look: rings, bell, roller door, truck lights, boat bob, dog, crew idle
    for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
    if (bellT > 0) { bellT -= dt; bell.rotation.z = Math.sin(t * 18) * 0.45 * Math.min(1, bellT); } else bell.rotation.z *= 0.9;
    rollK += (rollWant - rollK) * Math.min(1, dt * 1.6); if (Math.abs(rollWant - rollK) < 0.002) rollK = rollWant; setRoll(rollK);
    { const on = truck.flash, ph = Math.floor(t * 6) % 2, night = (() => { const h = hour(); return h >= 19.5 || h < 6.5; })(); truck.red.material.color.set(on && ph ? '#ff3b3b' : '#7a1d1d'); truck.blue.material.color.set(on && !ph ? '#3b7bff' : '#1d2f6b'); truck.gl.visible = on && night; if (truck.gl.visible) { const c = truck.gl.geometry.attributes.color.array; c[0] = ph ? 1 : 0.15; c[1] = ph ? 0.2 : 0.05; c[2] = ph ? 0.2 : 0.05; c[3] = ph ? 0.05 : 0.2; c[4] = ph ? 0.1 : 0.4; c[5] = ph ? 0.2 : 1; truck.gl.geometry.attributes.color.needsUpdate = true; } }
    if (EG.visible) { boatT += dt; boat.position.y = 0.05 + Math.sin(boatT * 1.3) * 0.06; boat.rotation.z = Math.sin(boatT * 0.9) * 0.025; boat.rotation.x = Math.sin(boatT * 1.1) * 0.015; }
    const near2 = dS < 60 || onCall; if (near2) { dogPose(dt, t, J && J.g === 'drill' && J.dogGo < 1); for (const k in CREW) if (CREW[k].visible) kit.animFox(CREW[k], dt, 0, false); if (rescued.visible && SC.house.g.visible) kit.animFox(rescued, dt, 0, false); }
    if (!busy && near2) { for (const k in CREW) { const f = CREW[k], [hx, hz, hr] = HOME[k], dd = Math.hypot(P.x - f.position.x, P.z - f.position.z); const want = dd < 4 ? Math.atan2(P.x - f.position.x, P.z - f.position.z) : hr; let df = want - f.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); f.rotation.y += df * Math.min(1, dt * 3); } }
    K.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: Math.hypot(P.x - (-42), P.z - 200.5), talking: false, clear: endClear > 0 ? [-45.5, 200.5, 3.0] : null }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => (busy === 'job' ? busy : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), useItem: () => false, job: () => J, scenes: SC, GD, RINGS, start: (g, P) => startGame(g, P || lastP),
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; ptr.t0 = performance.now(); press(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; ptr.t0 = performance.now(); press(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; }, release() { ptr.down = false; release(); },
    scr: v => scrW(v), hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), finish: () => finishGame(), _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) tick(dt, lastP, lastFox); }, truck, dog, crew: CREW, chief,
    dispose() { card.remove(); HINT.remove(); K.dispose(); } };
  window.__fire = API; return API;
}
