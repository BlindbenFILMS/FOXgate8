// MERU 2.0 — s83 APARTMENTS PART A (Ben's answers s82): a caretaker per building + the first 4 jobs.
// CRESTVIEW HOUSE = HAZEL (old caretaker, cardigan) · LAKESIDE TOWER = JUNO (young super, hi-vis vest). One call per building (key 'crest' | 'lake').
// Built in the building's ORIGINAL frame (b.orig, same local u/v frame as worlds/meru2-apts.js: u = toward the front door, v across);
// meru2-walk.js adds API.group to the building's moved group (RL.MV), ticks it with the RL.P proxy, camFix inside RL.camWrap.
// Outside the front door (u hu..hu+6, inside the relocator's 8 m front margin): two LAWN beds (grass grows back over 1 GAME DAY, mowed stripes),
// the push mower, the FRONT STEPS, the BIN corral. Inside: the keeper beside the walkway, NOW HIRING, the BEST board, the lobby mailboxes.
// JOBS: MOW THE LAWN (walk: push the mower over the long grass, miss the flower bed) · SWEEP THE STEPS (drag the leaves off the steps, not into the lobby)
// · SORT THE BINS (drag each piece of rubbish into PAPER / GLASS / FOOD) · DELIVER THE MAIL (walk: 4 letters, lift up, E at the right flat door).
// Stars: 0 mistakes = 3, ≤ 2 = 2. Prizes, own flat, notice board, balcony tenants: worlds/meru2-apts-prize.js (s85 part C).
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { gamesB, aptJobsB } from './meru2-apts-jobs2.js';   // s84 part B: the other 9 jobs
import { aptPrizes } from './meru2-apts-prize.js';
import { aptRoof } from './meru2-apts-roof.js';   // s86 part C2: roof garden + laundry room   // s85 part C: prizes, own flat, notice board, balcony tenants
const FY = [0, 7.2, 10.8];
const ROOMS = [{ n: 1, u: [-16, -6], v: [-13, -2], door: -11 }, { n: 2, u: [-6, 4], v: [-13, -2], door: -1 }, { n: 3, u: [-16, -6], v: [2, 13], door: -11 }, { n: 4, u: [4, 16], v: [-6, 6], end: true }, { n: 5, u: [-6, 4], v: [2, 13], door: -1 }];
const CLK = { h: null, n: null, acc: 0 };   // one game clock in hours for both buildings (only the 'crest' instance advances it)
const KEEP = {
  crest: { name: 'Hazel', role: 'CARETAKER', color: '#7a2a3a', torso: ['#b06a7a', '#7a2a3a', '#3d1a22'], outfit: 'coat', look: { elder: 1, fur: '#c98a4a', furDark: '#8a5a2a', muzzle: '#f3e6d6' },
    hello: ["Hello, dear! I'm Hazel, Crestview's caretaker. Lawns, taps, tenants, the lot. Fancy some work?", 'Back again, dear? The kettle is on.', 'Oh good, a helper! What shall it be?', 'Crestview runs on helpers like you. Ready?'],
    open: ['Lovely work, dear!', 'Spotless! Just how I like it.', 'Crestview thanks you!', 'You are a treasure.'],
    tips: ['Mow in straight rows. The stripes look smart from the windows.', 'Mind my roses in the middle of the lawn!', 'Sweep the leaves away from the door, never into the lobby.', 'Paper blue, glass green, food brown. Easy as tea.', 'Flat numbers: floor first, then the door. 203 is floor 2.', 'The grass grows back in a day. Come mow again tomorrow.'] },
  lake: { name: 'Juno', role: 'SUPER', color: '#2e4a6b', torso: ['#ffd23a', '#ec3013', '#201e1d'], outfit: 'vest', look: {},
    hello: ["Hey! I'm Juno, Lakeside's super. Lawns, lifts, windows, tenants. Want a shift?", 'You again! Good. Plenty to do.', 'Perfect timing. Pick a job?', 'Lakeside never sleeps. Ready?'],
    open: ['Nice! Clean job.', 'Sharp work!', "That's how Lakeside rolls.", 'Top marks!'],
    tips: ['Straight rows with the mower. The tenants love the stripes.', 'Do not mow the flower bed. Go round it.', 'Push the leaves off the sides of the steps.', 'Blue bin paper, green bin glass, brown bin food.', 'Floor number first: 104 is floor 1, door 4.', 'The lawn grows back in one game day.'] } };
export function buildAptJobs({ THREE, scene, kit, cols, save, L, key, touch, sayTo, camera, hour, isMuted, world, heal, wear }) { const JW = jobWorker(THREE);
  const b0 = L.BUILDINGS.find(q => q.key === key); if (!b0) return null;
  const b = b0.orig ? { f: b0.orig.f, face: b0.orig.face } : b0, KP = KEEP[key];
  const FACE = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }, F = FACE[b.face], Rv = [-F[1], F[0]];
  const cx = (b.f[0] + b.f[1]) / 2, cz = (b.f[2] + b.f[3]) / 2, hu = (b.f[1] - b.f[0]) / 2, hv = (b.f[3] - b.f[2]) / 2;
  const W = (u, v) => [cx + u * F[0] + v * Rv[0], cz + u * F[1] + v * Rv[1]];
  const UV = (x, z) => { const dx = x - cx, dz = z - cz; return [dx * F[0] + dz * F[1], dx * Rv[0] + dz * Rv[1]]; };
  const YAW = (du, dv) => Math.atan2(du * F[0] + dv * Rv[0], du * F[1] + dv * Rv[1]), RY0 = YAW(1, 0);
  const G = new THREE.Group(); G.name = 'aptJobs:' + key; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), V3 = (u, y, v) => { const [x, z] = W(u, v); return V(x, y, z); };
  const clamp = (v, a, b2) => Math.max(a, Math.min(b2, v)), rnd = (a, b2) => a + Math.random() * (b2 - a), tmpC = new THREE.Color(), cc = new THREE.Color();
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const toW = v => { G.updateWorldMatrix(true, false); return G.localToWorld(v.clone()); };
  const GY = (() => { try { if (!world || !world.terrainAt) return 0; const [x, z] = W(hu + 3, 0), [wx, wz] = world.fwd ? world.fwd(x, z) : [x, z]; const h = world.terrainAt(wx, wz); return Number.isFinite(h) ? Math.max(0, Math.min(1.5, h)) : 0; } catch (e) { return 0; } })();
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    // bx: du along u, dv along v (local frame), centre (u, y, v)
    return { put, geo, n: () => pos.length, bx: (du, h, dv, hex, u, y, v, rot = 0) => { const [x, z] = W(u, v); put(new THREE.BoxGeometry(dv, h, du), x, y, z, hex, RY0 + rot); },
      cy: (r0, r1, h, hex, u, y, v, seg = 12) => { const [x, z] = W(u, v); put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex); },
      sp: (r, hex, u, y, v, sy = 1) => { const [x, z] = W(u, v); put(new THREE.SphereGeometry(r, 8, 6), x, y, z, hex, 0, 0, 0, 1, sy, 1); } }; };
  const S = mk();
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 12) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W2 - 24, fs); });
  const plane = (map, w, h, u, y, v, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map })); const [x, z] = W(u, v); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const ringC = (u, v, r) => { const [x, z] = W(u, v); cols.push({ c: [x, z, r] }); };
  const rectC = (u0, u1, v0, v1) => { const a = W(u0, v0), c = W(u1, v1); cols.push({ f: [Math.min(a[0], c[0]), Math.max(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[1], c[1])] }); };
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', STONE = '#cfc8bb', STONE2 = '#b9b1a3', BLUE = '#2f6fd6', GREEN = '#2f7a4a', BROWN = '#7a4a24';
  // ================= the clock (game hours, never runs backwards) =================
  if (CLK.n == null) CLK.n = save.stat('apClock', 0);
  const owner = key === 'crest';
  function clockTick() { const h = hour ? hour() : 12; if (CLK.h == null) { CLK.h = h; return; } let d = h - CLK.h; if (d < 0) d += 24; CLK.h = h; if (d > 0 && d < 20) { CLK.n += d; if ((CLK.acc += d) > 0.25) { CLK.acc = 0; save.setStat('apClock', Math.round(CLK.n * 100) / 100); } } }
  // ================= THE LAWN: two beds either side of the front walk, 0.5 m cells =================
  const CS = 0.5, BEDS = [{ u0: hu + 1.2, u1: hu + 5.2, v0: 7, v1: 15 }, { u0: hu + 1.2, u1: hu + 5.2, v0: -15, v1: -7 }].map(B => ({ ...B, fu: (B.u0 + B.u1) / 2, fv: (B.v0 + B.v1) / 2 }));
  const cells = []; BEDS.forEach((B, bi) => { for (let i = 0; i < Math.round((B.u1 - B.u0) / CS); i++) for (let j = 0; j < Math.round((B.v1 - B.v0) / CS); j++) { const u = B.u0 + (i + 0.5) * CS, v = B.v0 + (j + 0.5) * CS, [x, z] = W(u, v);
    cells.push({ u, v, x, z, bed: bi, fl: Math.hypot(u - B.fu, v - B.fv) < 0.62, t: -30, d: 1 }); } });
  { const ts = save.stat('apLawn_' + key, null), ds = save.stat('apLawnD_' + key, ''); if (Array.isArray(ts) && ts.length === cells.length) cells.forEach((c, i) => { c.t = +ts[i] || -30; c.d = ds[i] === '0' ? -1 : 1; }); else cells.forEach(c => { c.t = CLK.n - 30; }); }
  const saveLawn = () => { save.setStat('apLawn_' + key, cells.map(c => Math.round(c.t * 10) / 10)); save.setStat('apLawnD_' + key, cells.map(c => (c.d > 0 ? '1' : '0')).join('')); };
  const grow = c => clamp((CLK.n - c.t) / 24, 0, 1);
  const grass = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#ffffff' }), cells.length); grass.frustumCulled = false; G.add(grass);
  const BL = mk(); for (const [a, c2, r] of [[-0.13, 0.08, 0.2], [0.11, -0.1, -0.3], [0.03, 0.15, 0.1], [-0.05, -0.14, 0.4], [0.15, 0.12, -0.15]]) BL.put(new THREE.ConeGeometry(0.035, 1, 3), a, 0, c2, '#3d7a33', r, 0.12 * Math.sign(r), 0);
  const blades = new THREE.InstancedMesh(BL.geo(), new THREE.MeshLambertMaterial({ vertexColors: true }), cells.length); blades.frustumCulled = false; G.add(blades);
  const cA = new THREE.Color('#a6dc78'), cB = new THREE.Color('#7cbf58'), cLong = new THREE.Color('#3f7f36'), M4 = new THREE.Matrix4(), Q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, RY0, 0)), Qb = new THREE.Quaternion(), S3 = V(), P3 = V();
  let lawnDirty = true, lawnT = 0;
  function paintLawn() { cells.forEach((c, i) => { const g = grow(c), h = c.fl ? 0.02 : 0.035 + 0.13 * g; P3.set(c.x, GY + h / 2, c.z); S3.set(CS * 0.995, h, CS * 0.995); M4.compose(P3, Q0, S3); grass.setMatrixAt(i, M4);
      tmpC.copy(c.d > 0 ? cA : cB).lerp(cLong, Math.min(1, g * 1.5)); if (c.fl) tmpC.set('#5a3d26'); grass.setColorAt(i, tmpC);
      const bh = c.fl || g < 0.28 ? 0.0001 : 0.06 + 0.3 * g; P3.y = GY + h + bh / 2 - 0.01; S3.set(1, bh, 1); Qb.setFromEuler(new THREE.Euler(0, i * 2.4, 0)); M4.compose(P3, Qb, S3); blades.setMatrixAt(i, M4); });
    grass.instanceMatrix.needsUpdate = true; if (grass.instanceColor) grass.instanceColor.needsUpdate = true; blades.instanceMatrix.needsUpdate = true; lawnDirty = false; }
  paintLawn();
  // kerbs round each bed + the flower bed in the middle (roses at Crestview, tulips at Lakeside)
  const FLW = BEDS.map(B => { for (const s of [-1, 1]) { S.bx(B.u1 - B.u0 + 0.24, 0.12, 0.12, STONE2, B.fu, GY + 0.06, s < 0 ? B.v0 - 0.06 : B.v1 + 0.06); S.bx(0.12, 0.12, B.v1 - B.v0, STONE2, s < 0 ? B.u0 - 0.06 : B.u1 + 0.06, GY + 0.06, B.fv); }
    const g = new THREE.Group(); const [x, z] = W(B.fu, B.fv); g.position.set(x, GY, z); G.add(g); const pal = key === 'crest' ? ['#c0263a', '#e0445a', '#f3f2f2'] : ['#ffd23a', '#ec3013', '#f472b6'];
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 6, 22), LM(STONE2)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.05; g.add(ring);
    for (let k = 0; k < 11; k++) { const a = k / 11 * 6.283 + 0.3, r = k < 8 ? 0.4 : 0.14; const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 4), LM('#3d6b2a')); st.position.set(Math.cos(a) * r, 0.18, Math.sin(a) * r); g.add(st);
      const bl = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), LM(pal[k % 3])); bl.position.set(Math.cos(a) * r, 0.36, Math.sin(a) * r); bl.scale.y = 0.8; g.add(bl); const lf = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), LM('#4f8a3c')); lf.scale.set(1.3, 0.4, 0.7); lf.position.set(Math.cos(a) * r * 0.9, 0.12, Math.sin(a) * r * 0.9); g.add(lf); }
    return { g, flat: false }; });
  // ================= the push mower (parked by the north bed) =================
  const MW = new THREE.Group(); G.add(MW); let mowHandle;
  { const add = (geo, c, x, y, z, par = MW) => { const m = new THREE.Mesh(geo, LM(c)); m.position.set(x, y, z); par.add(m); return m; };
    add(new THREE.BoxGeometry(0.5, 0.12, 0.46), RED, 0, 0.16, 0); add(new THREE.BoxGeometry(0.52, 0.03, 0.48), INK, 0, 0.1, 0); add(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10), '#3d3b3a', 0, 0.27, 0.03);
    for (const [a, c2] of [[-0.25, 0.18], [0.25, 0.18], [-0.25, -0.18], [0.25, -0.18]]) { const w = add(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12), INK, a, 0.07, c2); w.rotation.z = Math.PI / 2; }
    add(new THREE.BoxGeometry(0.34, 0.22, 0.24), '#5c6670', 0, 0.24, -0.32);
    mowHandle = new THREE.Group(); mowHandle.position.set(0, 0.2, -0.2); mowHandle.rotation.x = -0.75; MW.add(mowHandle);
    for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.014, 0.014, 0.95, 6), '#9aa0a6', s * 0.2, 0.47, 0, mowHandle); { const bar = add(new THREE.CylinderGeometry(0.02, 0.02, 0.44, 6), INK, 0, 0.94, 0, mowHandle); bar.rotation.z = Math.PI / 2; } }
  const MOW0 = (() => { const [x, z] = W(hu + 1.6, 4.4); return { x, z, ry: YAW(0, 1) }; })(); const parkMower = () => { const rd = PZ && PZ.ride(); MW.visible = !rd; MW.position.set(MOW0.x, GY, MOW0.z); MW.rotation.y = MOW0.ry; if (PZ) { PZ.RM.visible = !!rd; PZ.RM.position.set(MOW0.x, GY, MOW0.z); PZ.RM.rotation.y = MOW0.ry; } }; let PZ = null; parkMower();
  // ================= FRONT STEPS (three shallow stone treads) + the BIN corral =================
  const PAD = { u0: hu + 0.12, u1: hu + 3.2, v0: -3, v1: 3 }, TREAD = u => (u < hu + 1.1 ? 0.1 : u < hu + 2.15 ? 0.065 : 0.03);
  for (const [a, c2, h] of [[hu + 0.12, hu + 1.1, 0.1], [hu + 1.1, hu + 2.15, 0.065], [hu + 2.15, hu + 3.2, 0.03]]) { S.bx(c2 - a, h, 6, STONE, (a + c2) / 2, GY + h / 2, 0); S.bx(0.06, 0.012, 6, STONE2, c2 - 0.03, GY + h + 0.004, 0); }
  for (const s of [-1, 1]) { S.bx(3.1, 0.5, 0.3, STONE2, hu + 1.66, GY + 0.25, s * 3.15); S.cy(0.24, 0.3, 0.42, '#8a5a46', hu + 2.9, GY + 0.71, s * 3.15, 12); S.sp(0.28, '#3d6b4a', hu + 2.9, GY + 1.05, s * 3.15, 0.9); } rectC(hu + 0.1, hu + 3.2, 3.0, 3.3); rectC(hu + 0.1, hu + 3.2, -3.3, -3.0);
  S.bx(0.9, 0.02, 1.6, '#3d3b3a', hu + 0.6, GY + 0.115, 0); S.bx(0.7, 0.022, 1.4, KP.color, hu + 0.6, GY + 0.118, 0);
  const BINS = [{ k: 'paper', n: 'PAPER', c: BLUE, v: 16.6 }, { k: 'glass', n: 'GLASS', c: GREEN, v: 17.8 }, { k: 'food', n: 'FOOD', c: BROWN, v: 19.0 }], BU = hu + 1.6, BIN_TOP = GY + 1.05;
  for (const B of BINS) { S.bx(0.8, 1.0, 0.9, B.c, BU, GY + 0.5, B.v); S.bx(0.84, 0.06, 0.94, INK, BU, GY + 1.02, B.v); S.bx(0.12, 0.04, 0.9, INK, BU - 0.42, GY + 1.08, B.v); S.bx(0.06, 0.5, 0.94, B.c, BU - 0.5, GY + 1.3, B.v, 0);
    for (const s of [-1, 1]) S.cy(0.06, 0.06, 0.05, INK, BU + 0.2, GY + 0.06, B.v + s * 0.36, 10); plane(label(B.n, WHITE, INK, 256, 72, 44), 0.66, 0.19, BU + 0.405, GY + 0.72, B.v, YAW(1, 0)); }
  rectC(BU - 0.5, BU + 0.4, 16.1, 19.5); S.bx(2.6, 0.04, 3.8, '#9a948a', BU + 0.6, GY + 0.02, 17.8);
  for (const [du, dv, s] of [[0, -0.25, 1], [0.15, 0.3, 0.85], [-0.12, 0.05, 0.75]]) S.sp(0.3 * s, '#201e1d', hu + 3.3 + du, GY + 0.25 * s, 17.8 + dv, 0.85);
  const HOLD = V3(hu + 2.8, GY + 1.25, 17.8);
  // job rings (floor paint): mail in the lobby by the mailboxes, the other three outside
  const RINGS = { lawn: [hu + 2.5, 4.4], steps: [hu + 4.0, -3.7], bins: [hu + 4.3, 16.3], mail: [-2, -hv + 1.8] }, RY = {}, FLR = {};
  for (const [g, [u, v]] of Object.entries(RINGS)) { const y = g === 'mail' ? 0.085 : GY + 0.05; S.cy(0.5, 0.5, 0.012, YEL, u, y, v, 22); S.cy(0.42, 0.42, 0.014, INK, u, y + 0.002, v, 22); }
  G.add(new THREE.Mesh(S.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  // ================= the keeper + shop kit (lobby) =================
  const KU = hu - 6, KV = -4.5, keeper = kit.makeFox({ key: 'apKeep' + key, torso: KP.torso, outfit: KP.outfit, mood: 'happy', look: KP.look });
  { const [x, z] = W(KU, KV); keeper.position.set(x, 0, z); keeper.rotation.y = RY0; G.add(keeper); ringC(KU, KV, 0.5); }
  const kT = { key: 'apKeep' + key, name: KP.name, role: KP.role, obj: keeper, ry: RY0, r: 6 };
  const ln = text => ({ who: 'apKeep' + key, role: KP.role, text });
  const GAMES = [{ k: 'lawn', name: 'Mow the Lawn', color: '#3f8a3a', walk: true, grp: 'out' }, { k: 'steps', name: 'Sweep the Steps', color: '#c9a227', grp: 'out' }, { k: 'bins', name: 'Sort the Bins', color: BLUE, grp: 'out' }, { k: 'mail', name: 'Deliver the Mail', color: RED, walk: true, grp: 'in' }, ...gamesB(key)];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), pre = key === 'crest' ? 'apC' : 'apL';
  const lob = (() => { const a = W(-hu, -hv), c = W(hu, hv); return { X0: Math.min(a[0], c[0]), X1: Math.max(a[0], c[0]), Z0: Math.min(a[1], c[1]), Z1: Math.max(a[1], c[1]) }; })();
  const at = (u, v, y, ry) => { const [x, z] = W(u, v); return { x, y, z, ry }; };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: pre, color: KP.color, boardTitle: KP.name + "'s best", toWorld: toW, room: lob, door: W(hu - 0.8, 0), keeper, keeperRy: RY0, games: GAMES,
    board: { ...at(hu - 0.5, 11, 3.5, YAW(-1, 0)), w: 1.3 }, hiring: { ...at(hu - 4.6, -3.6, 0, RY0) }, hiringLine: 'WALK UP \u00b7 START WORK',
    sun: [-4, 4].map(v => { const [x, z] = W(hu - 3, v); return { x, z, w: 2.6, d: 2.6 }; }), lamps: [[...W(3, 0)].flatMap((p, i) => (i ? [4.9, p] : [p]))].map(a => [a[0], a[1], a[2]]),
    browse: [[-2, -hv + 1.5, YAW(0, -1)], [-11, 1.6, YAW(-1, 0)], [hu - 5, 6.2, YAW(1, 0)], [2, 2, YAW(0, 1)]].map(([u, v, r]) => { const [x, z] = W(u, v); return [x, z, r]; }), slots: 2,
    clock: at(hu - 0.46, 14, 3.4, YAW(-1, 0)) });
  // ================= state, sound, UI (the Armory's card / pick / hint pattern) =================
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, thanks = null, lastP = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at0 = 0) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at0, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = bf; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), coin = (a = 0) => { tone(2400, 0.04, 0.15, 'triangle', a); tone(3200, 0.03, 0.12, 'triangle', a + 0.03); };
  const clunk = () => { tone(140, 0.08, 0.2, 'square'); noise(0.15, 0.03, 1500); }, swish = () => noise(0.18, 0.025, 2500), knock = () => { tone(180, 0.08, 0.08, 'square'); tone(180, 0.08, 0.08, 'square', 0.14); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + KP.color + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = (next, walk) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (walk ? 'RING \u00b7 STOP' : (touch ? '3' : 'SPACE') + ' \u00b7 STOP') + '</span></div>';
  const meter = (f, c) => '<div style="position:relative;height:14px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:0;top:0;bottom:0;width:' + (clamp(f, 0, 1) * 100).toFixed(1) + '%;background:' + c + '"></div></div>';
  const lst = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + items.map(([sw, t, r, ok]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (r ? ' \u00b7 ' + r : '') + '</span>').join('') + '</div>' : items.map(a => row(...a)).join('');
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>';
  const setCard = (k, html) => { if (k === cardKey) return; cardKey = k; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && J && !GN[J.g].walk;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(toW(v)).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = V(), inv = new THREE.Matrix4();
  const ray = () => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); G.updateWorldMatrix(true, false); inv.copy(G.matrixWorld).invert(); return rc.ray.clone().applyMatrix4(inv); };
  const hitY = y => (ray().intersectPlane(new THREE.Plane(V(0, 1, 0), -y), hitP) ? hitP.clone() : null);
  const FN = V(F[0], 0, F[1]), hitU = u => { const p0 = V3(u, 0, 0); return ray().intersectPlane(new THREE.Plane(FN, -FN.dot(p0)), hitP) ? hitP.clone() : null; };
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const Fq of J.flies.slice()) { Fq.t += dt / Fq.dur; const k = Math.min(1, Fq.t), e = k * k * (3 - 2 * k); Fq.obj.position.lerpVectors(Fq.from, Fq.to, e); Fq.obj.position.y += Math.sin(k * Math.PI) * Fq.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(Fq), 1); Fq.then && Fq.then(); } } }
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt + bg] || (tagTex[txt + bg] = CT(256, 72, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 16, H / 2 + 2, W2 - 32, 40); }));
  const tagSprite = (txt, bg = '#ffffff', fg = INK, s = 0.42) => { if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: false })); sp.scale.set(s, s * 0.28, 1); sp.renderOrder = 6; return sp; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (sub, after, t = 1.0) => { J.sub = sub; J.pause = t; J.after = after; };
  const arrowM = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: RED })); arrowM.rotation.x = Math.PI; arrowM.visible = false; arrowM.renderOrder = 5; G.add(arrowM);
  const beacon = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 24), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.8, depthWrite: false })); beacon.rotation.x = -Math.PI / 2; beacon.visible = false; G.add(beacon);
  const done = () => save.stat(pre + 'Done', null) || {};
  const floorOf = y => (y > FY[2] - 1.2 ? 2 : y > FY[1] - 1.2 ? 1 : 0);
  // ================= GAME 1: MOW THE LAWN (walk) =================
  const MR = 0.38;
  const G1 = { walk: true,
    can() { return cells.filter(c => !c.fl && grow(c) > 0.4).length >= 12; },
    begin() { J.need = new Set(); cells.forEach((c, i) => { if (!c.fl && grow(c) > 0.4) J.need.add(i); }); J.n0 = J.need.size; J.lp = null; J.clk = 0; toast(PZ.ride() ? 'RIDE OVER THE LONG GRASS \u00b7 MISS THE FLOWERS' : 'PUSH THE MOWER OVER THE LONG GRASS \u00b7 MISS THE FLOWERS', 2.8); tone(520, 0.04, 0.3, 'triangle'); },
    tick(dt) { const P = J.P; if (!P) return; const RD = PZ.ride(), MO = RD ? PZ.RM : MW, MRr = RD ? 0.72 : MR, fx = Math.sin(P.yaw), fz = Math.cos(P.yaw), off = RD ? 0.15 : 0.8, mx = P.x + fx * off, mz = P.z + fz * off; MO.position.set(RD ? P.x : mx, GY, RD ? P.z : mz); MO.rotation.y = P.yaw;
      const moved = J.lp ? Math.hypot(P.x - J.lp[0], P.z - J.lp[1]) : 0; J.lp = [P.x, P.z]; if (moved > 0.002) { J.clk -= dt; if (J.clk <= 0) { J.clk = 0.09; noise(0.06, 0.02, 4200); } }
      const dv = fx * Rv[0] + fz * Rv[1], dir = dv >= 0 ? 1 : -1;
      for (let i = 0; i < cells.length; i++) { const c = cells[i]; if (Math.abs(c.x - mx) > MRr + 0.25 || Math.abs(c.z - mz) > MRr + 0.25 || Math.hypot(c.x - mx, c.z - mz) > MRr) continue;
        if (c.fl) { const f = FLW[c.bed]; if (!f.flat) { f.flat = true; f.g.scale.y = 0.3; miss(KP.name.toUpperCase() + ': "OH! THE FLOWERS! GO ROUND THEM, PLEASE."', 2); } continue; }
        if (grow(c) > 0.02 || c.d !== dir) { c.t = CLK.n; c.d = dir; lawnDirty = true; } if (J.need.delete(i)) { if (J.need.size % 8 === 0) pop(); } }
      if (!J.need.size) { addGold(Math.round(J.n0 / 5)); ding(); saveLawn(); finishGame(); } },
    goal() { const MO = PZ.ride() ? PZ.RM : MW, mx = MO.position.x, mz = MO.position.z; let best = null, bd = 1e9; for (const i of J.need) { const c = cells[i], d = Math.hypot(c.x - mx, c.z - mz); if (d < bd) { bd = d; best = c; } } return best ? [best.x, best.z, GY] : null; },
    prompt(P) { return ringAt(P, 'lawn') ? 'STOP MOWING' : null; },
    talk(P) { if (ringAt(P, 'lawn')) { saveLawn(); stop(); toast('MOWER PARKED \u00b7 GOLD KEPT', 1.8); return true; } return false; },
    card() { const left = J.need.size; return ['PUSH OVER THE LONG GRASS', lab('LAWN ' + Math.round((1 - left / Math.max(1, J.n0)) * 100) + '%') + meter(1 - left / Math.max(1, J.n0), '#3f8a3a') + lst(FLW.map((f, i) => ['#c0263a', 'FLOWER BED ' + (i + 1), f.flat ? 'SQUASHED' : 'OK', !f.flat])), Math.round(left / 4) + '_' + FLW.map(f => +f.flat).join('')]; },
    end() { FLW.forEach(f => { f.flat = false; f.g.scale.y = 1; }); parkMower(); } };
  // ================= GAME 2: SWEEP THE STEPS (drag the leaves off the sides, never into the lobby) =================
  const leafT = ['#d9822b', '#c0502a', '#e6b13a', '#8a5a2a'].map(c => CT(64, 48, (g, w, h) => { g.fillStyle = c; g.beginPath(); g.moveTo(4, h / 2); g.quadraticCurveTo(w / 2, -6, w - 4, h / 2); g.quadraticCurveTo(w / 2, h + 6, 4, h / 2); g.fill(); g.strokeStyle = 'rgba(60,30,10,0.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(4, h / 2); g.lineTo(w - 6, h / 2); g.stroke(); }));
  const BROOM = new THREE.Group(); { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.3, 6), LM('#8a6440')); h.position.y = 0.65; BROOM.add(h); const br = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.12), LM('#e6c27a')); br.position.y = 0.05; BROOM.add(br); const bd = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.05, 0.1), LM(RED)); bd.position.y = 0.12; BROOM.add(bd); } BROOM.visible = false; G.add(BROOM);
  const padSpot = () => [rnd(hu + 0.8, hu + 2.9), rnd(-2.6, 2.6)];
  const G2 = {
    begin() { J.leaves = [...Array(14)].map((_, i) => { const m = own(new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.17), new THREE.MeshLambertMaterial({ map: leafT[i % 4], transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }))); m.rotation.x = -Math.PI / 2; m.rotation.order = 'YXZ';
        const L0 = { m, gone: false }; this.place(L0, ...padSpot()); return L0; }); J.sub = 'sweep'; BROOM.visible = true; const [x, z] = W(hu + 1.7, 0); BROOM.position.set(x, GY + 0.1, z); BROOM.rotation.y = RY0; toast('DRAG THE LEAVES OFF THE SIDES \u00b7 NOT INTO THE LOBBY', 2.8); },
    place(L0, u, v) { const [x, z] = W(u, v); L0.m.position.set(x, GY + TREAD(u) + 0.006, z); L0.m.rotation.y = Math.random() * 6.28; },
    press() { J.lp = hitY(GY + 0.08); },
    drag() { if (!ptr.down || J.sub !== 'sweep') return; const p = hitY(GY + 0.08); if (!p) return; BROOM.position.set(p.x, GY + 0.08, p.z); if (!J.lp) { J.lp = p; return; } const dx = p.x - J.lp.x, dz = p.z - J.lp.z, mv = Math.hypot(dx, dz); J.lp = p; if (mv < 0.004) return;
      BROOM.rotation.z = clamp(dx * 4, -0.5, 0.5); const R = touch ? 0.55 : 0.45; let any = false;
      for (const L0 of J.leaves) { if (L0.gone) continue; const m = L0.m; if (Math.hypot(m.position.x - p.x, m.position.z - p.z) > R) continue; any = true; m.position.x += dx * 1.2 + rnd(-0.01, 0.01); m.position.z += dz * 1.2 + rnd(-0.01, 0.01); m.rotation.y += mv * 3;
        let [u, v] = UV(m.position.x, m.position.z);
        if (u < hu + 0.5 && Math.abs(v) < 1.7) { miss(KP.name.toUpperCase() + ': "NOT INTO THE LOBBY! OUT TO THE SIDES."', 1.8); this.place(L0, ...padSpot()); continue; }
        if (u < hu + 0.14) u = hu + 0.14; if (u > PAD.u1 + 0.05 || Math.abs(v) > 3.0) { L0.gone = true; pop(); fly(m, V(m.position.x + (u > PAD.u1 ? F[0] : Rv[0] * Math.sign(v)) * 0.8, GY - 0.2, m.position.z + (u > PAD.u1 ? F[1] : Rv[1] * Math.sign(v)) * 0.8), 0.5, 0.25, () => { m.visible = false; }); continue; }
        const [x, z] = W(u, v); m.position.set(x, GY + TREAD(u) + 0.006, z); }
      if (any && (J.sw = (J.sw || 0) + mv) > 0.35) { J.sw = 0; swish(); }
      if (J.leaves.every(q => q.gone)) { addGold(18); ding(); J.sub = 'done'; NEXT('done', finishGame, 1.0); } },
    card() { const left = J.leaves.filter(q => !q.gone).length; return ['DRAG THE LEAVES OFF THE SIDES', lst([['#d9822b', 'LEAVES LEFT', String(left), !left], [RED, 'THE DOOR', 'KEEP CLEAR', false]]), 's' + left]; },
    hint() { const L0 = J.leaves.find(q => !q.gone); if (!L0) return null; const [, v] = UV(L0.m.position.x, L0.m.position.z); return [L0.m.position.clone(), v >= 0 ? 'DRAG THIS WAY \u2192 SIDE' : 'DRAG TO THE SIDE']; },
    shot() { return [V3(hu + 1.7, GY + 0.1, 0), 7.0, 3.6, 1.05, 3.2, RY0, 8.5]; },
    end() { BROOM.visible = false; } };
  // ================= GAME 3: SORT THE BINS (drag each piece into PAPER / GLASS / FOOD) =================
  const ITEMS = [{ n: 'NEWSPAPER', k: 'paper' }, { n: 'CARDBOARD BOX', k: 'paper' }, { n: 'BOTTLE', k: 'glass' }, { n: 'JAM JAR', k: 'glass' }, { n: 'APPLE CORE', k: 'food' }, { n: 'BANANA PEEL', k: 'food' }];
  function makeItem(n) { const g = new THREE.Group(), add = (geo, c, x, y, z, rz = 0) => { const m = new THREE.Mesh(geo, LM(c)); m.position.set(x, y, z); m.rotation.z = rz; g.add(m); return m; };
    if (n === 'NEWSPAPER') { add(new THREE.BoxGeometry(0.34, 0.24, 0.04), '#e8e4dc', 0, 0, 0); add(new THREE.BoxGeometry(0.28, 0.04, 0.042), '#5c6670', 0, 0.07, 0); add(new THREE.BoxGeometry(0.12, 0.08, 0.042), '#9aa0a6', -0.07, -0.04, 0); }
    else if (n === 'CARDBOARD BOX') { add(new THREE.BoxGeometry(0.28, 0.24, 0.24), '#b8864f', 0, 0, 0); add(new THREE.BoxGeometry(0.29, 0.04, 0.06), '#d9c08a', 0, 0.12, 0); }
    else if (n === 'BOTTLE') { add(new THREE.CylinderGeometry(0.055, 0.06, 0.22, 10), '#2f7a4a', 0, -0.03, 0); add(new THREE.CylinderGeometry(0.02, 0.04, 0.1, 8), '#2f7a4a', 0, 0.13, 0); add(new THREE.BoxGeometry(0.11, 0.07, 0.01), '#f3f2f2', 0, -0.03, 0.06); }
    else if (n === 'JAM JAR') { add(new THREE.CylinderGeometry(0.07, 0.07, 0.13, 12), '#bfe3f0', 0, 0, 0); add(new THREE.CylinderGeometry(0.072, 0.072, 0.03, 12), RED, 0, 0.08, 0); }
    else if (n === 'APPLE CORE') { add(new THREE.SphereGeometry(0.05, 8, 6), '#c0263a', 0, 0.06, 0); add(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8), '#f3e6c0', 0, 0, 0); add(new THREE.SphereGeometry(0.05, 8, 6), '#c0263a', 0, -0.06, 0); }
    else { for (const s of [-1, 0, 1]) add(new THREE.BoxGeometry(0.06, 0.18, 0.03), '#f2c94c', s * 0.05, -0.02, 0, s * 0.5); add(new THREE.BoxGeometry(0.04, 0.05, 0.04), '#5a3d26', 0, 0.08, 0); }
    g.rotation.y = RY0; return g; }
  const G3 = {
    begin() { const pool = shuffle([0, 1, 2, 3, 4, 5, ...shuffle([0, 1, 2, 3, 4, 5]).slice(0, 2)]); J.items = pool.map(i => ({ ...ITEMS[i], done: false })); J.i = 0; this.lift(); toast('DRAG EACH ONE INTO THE RIGHT BIN', 2.4); },
    lift() { const q = J.items[J.i]; if (!q) return; q.m = own(makeItem(q.n)); q.m.position.copy(V3(hu + 3.3, GY + 0.5, 17.8)); J.cur = q; fly(q.m, HOLD, 0.35, 0.2, null); },
    press() { if (J.cur && !J.flies.length) { J.held = true; this.drag(); } },
    drag() { if (!J.held || !J.cur) return; const p = hitU(hu + 2.4); if (!p) return; const [, v] = UV(p.x, p.z), [x, z] = W(hu + 2.4, clamp(v, 15.8, 20)); J.cur.m.position.set(x, clamp(p.y, GY + 0.4, GY + 2.2), z); },
    release() { if (!J.held || !J.cur) return; J.held = false; const q = J.cur, p = q.m.position, [, v] = UV(p.x, p.z), B = BINS.find(b2 => Math.abs(v - b2.v) < 0.6);
      if (!B || p.y > GY + 2.0) { fly(q.m, HOLD, 0.3, 0.05, null); return; }
      if (B.k !== q.k) { const R = BINS.find(b2 => b2.k === q.k); miss(KP.name.toUpperCase() + ': "' + q.n + ' GOES IN ' + R.n + '. THE ' + (R.c === BLUE ? 'BLUE' : R.c === GREEN ? 'GREEN' : 'BROWN') + ' BIN."', 2.2); fly(q.m, HOLD, 0.3, 0.05, null); return; }
      q.done = true; J.cur = null; J.i++; addGold(3); const top = V3(BU, BIN_TOP + 0.25, B.v); fly(q.m, top, 0.25, 0.1, () => { if (!J || J.g !== 'bins') return; q.m.visible = false; q.k === 'glass' ? tone(2600, 0.05, 0.3, 'triangle') : clunk(); if (J.i < J.items.length) this.lift(); });
      if (J.i >= J.items.length) { addGold(6); ding(); NEXT('done', finishGame, 1.2); } },
    card() { const q = J.cur; return [q ? 'DRAG THE ' + q.n + ' TO ITS BIN' : 'NICE', lab((J.i) + ' / ' + J.items.length + ' SORTED') + lst(BINS.map(B2 => [B2.c, B2.n, J.items.filter(x => x.done && x.k === B2.k).length + '', false])), J.i + '_' + J.miss]; },
    hint() { const q = J.cur; if (!q) return null; if (!J.held) return [q.m.position.clone(), 'DRAG']; const B = BINS.find(b2 => b2.k === q.k); return [V3(BU, BIN_TOP + 0.2, B.v), 'DROP IN ' + B.n]; },
    shot() { return [V3(hu + 2.3, GY + 0.95, 17.8), 4.6, 2.4, 0.32, 2.8, RY0, 7]; } };
  // ================= GAME 4: DELIVER THE MAIL (walk: 4 letters, take the lift, E at the right flat door) =================
  const NAMES = ['MRS PLUM', 'MR BRISK', 'THE VOLES', 'DR WREN', 'MISS DAISY', 'OLD TOM', 'THE OTTERS', 'MR FINCH', 'NELL', 'CAPT. GULL'];
  const DOORS = []; for (const f of [1, 2]) for (const r of ROOMS) { const no = f * 100 + r.n; let u, v; if (r.end) { u = r.u[0] - 1.0; v = 0; } else { const s = r.v[0] < 0 ? -1 : 1, vh = s < 0 ? r.v[1] : r.v[0]; u = r.door; v = vh - s * 0.9; } const [x, z] = W(u, v); DOORS.push({ no, f, x, z, y: FY[f] }); }
  const LIFT = f => { const [x, z] = W(-11.6, 0); return [x, z, FY[f]]; };
  const nearDoor = P => { const f = floorOf(P.y || 0); if (!f) return null; let best = null, bd = 1.35; for (const d of DOORS) { if (d.f !== f) continue; const dd = Math.hypot(P.x - d.x, P.z - d.z); if (dd < bd) { bd = dd; best = d; } } return best; };
  const G4 = { walk: true,
    begin() { J.list = shuffle(DOORS.slice()).slice(0, 4).sort((a, c) => a.no - c.no).map((d, i) => ({ d, who: NAMES[(Math.random() * NAMES.length | 0 + i * 3) % NAMES.length], got: false }));
      J.tags = J.list.map(q => { const t = own(tagSprite(String(q.d.no), YEL, INK, 0.5)); t.position.set(q.d.x, q.d.y + 2.0, q.d.z); t.visible = false; return t; }); toast('4 LETTERS \u00b7 TAKE THE LIFT UP \u00b7 E AT EACH DOOR', 2.8); pop(); },
    goal() { const P = J.P, f = floorOf(P.y || 0), rest = J.list.filter(q => !q.got); if (!rest.length) return null; const here = rest.filter(q => q.d.f === f);
      if (here.length) { let b2 = here[0].d, bd = 1e9; for (const q of here) { const d = Math.hypot(P.x - q.d.x, P.z - q.d.z); if (d < bd) { bd = d; b2 = q.d; } } return [b2.x, b2.z, b2.y]; } return LIFT(f); },
    prompt(P) { const d = nearDoor(P); if (!d) return null; const q = J.list.find(x => x.d === d && !x.got); return q ? 'DELIVER \u00b7 ' + d.no + ' \u00b7 ' + q.who : 'KNOCK \u00b7 ' + d.no; },
    talk(P) { const d = nearDoor(P); if (!d) return false; const q = J.list.find(x => x.d === d); knock();
      if (!q) { miss('"NO LETTER FOR ' + d.no + '!" CHECK THE CARD.', 1.8); return true; } if (q.got) { toast(d.no + ' \u00b7 ALREADY DELIVERED', 1.4); return true; }
      q.got = true; coin(); addGold(6); J.tags[J.list.indexOf(q)].visible = false; const left = J.list.filter(x => !x.got).length; toast(left ? q.who + ' SAYS THANKS \u00b7 ' + left + ' TO GO' : 'ALL DELIVERED!', 1.8); if (!left) { ding(); finishGame(); } return true; },
    tick() { const f = floorOf((J.P && J.P.y) || 0); J.list.forEach((q, i) => { J.tags[i].visible = !q.got && q.d.f === f; }); },
    card() { const f = floorOf((J.P && J.P.y) || 0), here = J.list.some(q => !q.got && q.d.f === f); return [here ? 'E AT THE DOOR' : 'TAKE THE LIFT \u00b7 FLOOR ' + (J.list.find(q => !q.got) || { d: { f: 1 } }).d.f, lst(J.list.map(q => [RED, q.d.no + ' ' + q.who, q.got ? '\u2713' : 'FL ' + q.d.f, q.got])), J.list.map(q => +q.got).join('') + f]; } };
  const GD = { lawn: G1, steps: G2, bins: G3, mail: G4 };
  const JX = new Proxy({}, { get: (_, k) => J && J[k], set: (_, k, v) => { if (J) J[k] = v; return true; } });
  const XB = aptJobsB({ THREE, G, key, KP, W, UV, V, V3, YAW, RY0, hu, hv, GY, FY, DOORS, LIFT, floorOf, mk, CT, fitTxt, LM, cols, kit, sayTo, camera, touch, ptr, RAD, own, fly, miss, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, nope, coin, clunk, swish, knock, lst, lab, meter, tagSprite, inBld: P => inBld(P), keeper, clamp, rnd, shuffle, J: JX });
  PZ = aptPrizes({ THREE, G, key, KP, W, UV, V3, YAW, RY0, hu, hv, GY, FY, CT, fitTxt, LM, kit, save, heal, wear, toast: (t, s) => toast(t, s), ding, coin, tone, done, GAMES, clk: () => CLK.n, inBld: P => inBld(P), BALS: XB.BALS, job: () => J, sayTo, kT, ln, hour, pre, rectC, touch }); parkMower();
  const RF = aptRoof({ THREE, G, key, W, UV, YAW, RY0, hu, hv, mk, CT, fitTxt, LM, kit, cols, hour, toast: (t, s) => toast(t, s), ding, tone, noise, touch });
  Object.assign(GD, XB.GD); Object.assign(RINGS, XB.RINGS); Object.assign(RY, XB.RY); Object.assign(FLR, XB.FL);
  { const LR = mk(), spotsL = [[-10.2, -4.6], [-10.2, -2.6], [-10.2, 2.6], [-10.2, 4.6]]; let i = 0;   // s86: lobby rings for the walk jobs (were keeper menu + NOW HIRING only)
    for (const k of ['bulbs', 'tour', 'noise', 'cat']) { if (!GD[k] || RINGS[k] || i >= spotsL.length) continue; const [u, v] = spotsL[i++]; RINGS[k] = [u, v]; RY[k] = 0; LR.cy(0.5, 0.5, 0.012, YEL, u, 0.085, v, 22); LR.cy(0.42, 0.42, 0.014, INK, u, 0.087, v, 22); }
    if (LR.n()) G.add(new THREE.Mesh(LR.geo(), new THREE.MeshLambertMaterial({ vertexColors: true }))); } const TIPS = [...KP.tips, ...XB.tips];
  // ================= run a game =================
  function startGame(g, P) { if (busy || !GD[g]) return; if (g === 'lawn' && !G1.can()) { toast('THE LAWN IS FRESH \u00b7 IT GROWS BACK IN A GAME DAY', 2.6); return; }
    J = { g, miss: 0, gold: 0, objs: [], flies: [], t: 0, sub: '', pause: 0, P }; busy = 'job'; const R = RINGS[g];
    if (P && !GD[g].walk && R) { const [x, z] = W(R[0], R[1]); Object.assign(P, { x, z, sp: 0 }); if (FLR[g]) { P.y = FY[FLR[g]]; P.vy = 0; } } GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(8); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat(pre + 'Done', d); save.setStat('apClears', save.stat('apClears', 0) + 1); K.finish(g, stars, gold, first); stop();
    const gf = PZ.gift(g); thanks = { g, gold, gf }; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 +' + gold + ' GOLD' + (gf ? ' \u00b7 PRIZE: ' + PZ.line(gf)[1] + ' \u00b7 SEE ' + KP.name.toUpperCase() : ''), gf ? 4 : 2.6); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) J.objs.forEach(o => o.parent && o.parent.remove(o)); busy = null; J = null; ptr.down = false; hideCard(); arrowM.visible = false; beacon.visible = false; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g], c = g.card && g.card(); if (!c) { hideCard(); return; }
    setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? J.gold + ' G' : KP.name.toUpperCase()) + foot(c[0], g.walk) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; if (J.flies.length) flyTick(dt); const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return; if (J.cur && J.g === 'bins' && !J.held && !J.flies.length) J.cur.m.rotation.y += dt * 1.2;
    const go = g.goal ? g.goal() : null; if (go) { arrowM.visible = true; beacon.visible = true; arrowM.position.set(go[0], go[2] + 1.9 + Math.sin(J.t * 4) * 0.15, go[1]); arrowM.rotation.y += dt * 2; beacon.position.set(go[0], go[2] + 0.1, go[1]); } else { arrowM.visible = false; beacon.visible = false; }
    drawCard(); }
  // ---------- camera (tap jobs) ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null, snapK = false; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt, fox) { PZ.camFix(cam, fox); const v = busy === 'job' && J && !GD[J.g].walk && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.08; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = snapK ? 1 : Math.min(1, dt * 3.2); snapK = false; camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    const [pu, pv] = UV(camCur.pos.x, camCur.pos.z), bx = v[7];
    if (bx) { const cu = clamp(pu, bx[0], bx[1]), cv = clamp(pv, bx[2], bx[3]); if (cu !== pu || cv !== pv) { const [x, z] = W(cu, cv); camCur.pos.x = x; camCur.pos.z = z; } camCur.pos.y = clamp(camCur.pos.y, bx[4], bx[5]); }
    else { if (pu < hu + 0.6) { const [x, z] = W(hu + 0.6, pv); camCur.pos.x = x; camCur.pos.z = z; } camCur.pos.y = Math.max(camCur.pos.y, GY + 0.6); } cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.830-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- places, talk + prompt ----------
  const inLobby = P => { const [u, v] = UV(P.x, P.z); return u > -hu && u < hu + 0.3 && v > -hv && v < hv && (P.y || 0) < 2.5; };
  const inBld = P => { const [u, v] = UV(P.x, P.z); return u > -hu && u < hu + 0.3 && v > -hv && v < hv; };
  const outFront = P => { const [u, v] = UV(P.x, P.z); return u >= hu - 0.5 && u < hu + 8.5 && v > -hv - 1 && v < hv + 1 && (P.y || 0) < GY + 3; };
  const ringAt = (P, only) => { for (const k of only ? [only] : Object.keys(RINGS)) { const [u, v] = RINGS[k], [x, z] = W(u, v), y = RY[k] != null ? RY[k] : k === 'mail' ? 0 : GY; if (Math.hypot(P.x - x, P.z - z) < 1.05 && Math.abs((P.y || 0) - y) < 1.5) return GN[k]; } return null; };
  const nearKeeper = P => Math.hypot(P.x - keeper.position.x, P.z - keeper.position.z) < 2.2 && (P.y || 0) < 2.5;
  function prompt(P) { if (J && GD[J.g].walk) { const gp = GD[J.g].prompt ? GD[J.g].prompt(P) : null; return gp || (nearKeeper(P) ? KP.name.toUpperCase() + ' \u00b7 STOP THE JOB' : null); } if (busy) return null; if (RF.onRoof(P)) return RF.prompt(P);
    if (!inBld(P) && !outFront(P)) return PZ.prompt(P); const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; { const pp = PZ.prompt(P); if (pp) return pp; } if (nearKeeper(P)) return 'TALK \u00b7 ' + KP.name.toUpperCase(); return null; }
  const nextJob = () => { const d = done(), ok = q => !!GD[q.k] && (q.k !== 'lawn' || G1.can()); return (GAMES.find(q => !d[q.k] && ok(q)) || GAMES.filter(ok).sort((a, c) => K.stars(a.k) - K.stars(c.k))[0] || GAMES[1]).k; };
  const SUBL = { out: 'Outside jobs. Which one?', in: 'Inside jobs. Pick one.', ten: 'The tenants need a hand. Who first?' };
  const sub = grp => sayTo(kT, [{ ...ln(SUBL[grp]), choices: [...GAMES.filter(q => q.grp === grp && GD[q.k]).map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => { if (!busy) startGame(q.k, lastP); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const menu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(), lastP); } }, { text: 'OUTSIDE JOBS', pick: () => sub('out') }, { text: 'INSIDE JOBS', pick: () => sub('in') }, { text: 'HELP A TENANT', pick: () => sub('ten') }, { text: 'YOUR FLAT + PERKS', pick: () => PZ.perks() },
      { text: 'A TIP, PLEASE', pick: () => sayTo(kT, [ln(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    let open = first ? KP.hello[0] : KP.hello[1 + (talked % 3)]; if (thanks) { open = KP.open[save.stat('apClears', 1) % 4] + ' ' + thanks.gold + ' gold for the ' + GN[thanks.g].name.toLowerCase().replace(/^the |^/, '') + '. More?'; if (thanks.g === 'lawn') open = KP.open[0] + ' The stripes look smart. ' + thanks.gold + ' gold. More?'; if (thanks.gf) open = PZ.line(thanks.gf)[0] + ' ' + thanks.gold + ' gold.'; thanks = null; }
    sayTo(kT, [{ ...ln(open), choices: ch }]); };
  function talk(P) { lastP = P; if (J && GD[J.g].walk) { if (GD[J.g].talk && GD[J.g].talk(P)) return true; if (nearKeeper(P)) { if (J.g === 'lawn') saveLawn(); stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 1.8); return true; } return false; }
    if (busy) return true; if (RF.onRoof(P)) return RF.talk(P); if (!inBld(P) && !outFront(P)) return PZ.talk(P); const r = ringAt(P); if (r) { startGame(r.k, P); return true; }
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (PZ.talk(P)) return true; if (!nearKeeper(P)) return false; tone(1320, 0.05, 0.6); menu(!talked++); return true; }
  function quit() { if (J && J.g === 'lawn') saveLawn(); stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  let outT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; if (owner) clockTick(); lastP = P; toastT -= dt;
    const [pu, pv] = UV(P.x, P.z), d = Math.hypot(pu - hu, pv); G.visible = d < (touch ? 70 : 130);
    if (busy === 'job' && J) { const zn = GD[J.g].zone || (J.g === 'mail' ? 'bld' : 'front'), ok = zn === 'bld' ? inBld(P) : zn === 'any' ? inBld(P) || outFront(P) : outFront(P) || inLobby(P); outT = ok ? 0 : outT + dt; if (outT > (GD[J.g].walk ? 2 : 0.3)) { if (J.g === 'lawn') saveLawn(); stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (busy === 'job' && J && !GD[J.g].walk && fox) JW(fox, J.g);
    XB.tick(dt, P); PZ.tick(dt, P, fox); RF.tick(dt, P, camera); if (!G.visible) return; if ((lawnT -= dt) <= 0 || lawnDirty) { lawnT = 2; paintLawn(); }
    if (busy === 'job' && J) jobTick(dt, P); hintTick(t);
    K.tick(dt, P, { inShop: inLobby(P), busy: !!busy, near: d, talking: false }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => (busy && J && GD[J.g].walk ? null : busy), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), keeper, GD, RINGS, W, UV, GY, cells, DOORS,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    snap() { snapK = true; }, _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) jobTick(dt, lastP); }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), clock: () => CLK.n,
    grow: () => { CLK.n += 24; lawnDirty = true; }, card, XB, PZ, RF, dispose() { card.remove(); HINT.remove(); K.dispose(); } };
  (window.__apts = window.__apts || {})[key] = API; return API;
}
