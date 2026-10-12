// MERU 2.0 — step 1c: walk the blockout. The player (engine/cast.js) on the 900 m ground with the standard Game HUD contract.
// Walk 4 m/s (the speed Ben's sound notes are measured at), jump, swim in the lake + the pond, island hills, building collision,
// zone label + music key per zone (crossfade comes with the audio pass), a footstep sound per surface, the ONE-greeting-at-a-time
// voice trigger test (7 m outdoors) so spacing can be heard/seen, and the NOW HIRING hotspot that opens the job full-screen.
import { foxKit } from '../fox-kit.js';
import { SWIM } from '../engine/swim-kit.js';
import { castKit, loadCastRigs } from '../engine/cast.js';
import { crestTex } from '../engine/textures.js';
import { rr, pick, clamp, smooth, damp } from '../village-game.js';
import { save } from '../engine/save.js';
import { buildCivic } from './meru2-civic.js';
import { lawKit } from './meru2-law.js';
import { buildRooms } from './meru2-rooms.js';
import { buildRooms2 } from './meru2-rooms2.js';
import { buildApts } from './meru2-apts.js';
import { buildHalls } from './meru2-halls.js';
import { buildBarracks } from './meru2-barracks.js';
import { DIALOGUE as BAR_TALK, PEOPLE as BAR_PEOPLE } from './meru-interiors.js';
import { BUILDINGS as OLD_APTS } from './meru-apartments.js';
import { buildPathLife } from './meru2-paths.js';
import { buildWalkers } from './meru2-walkers.js';
import { buildLake } from './meru2-lake.js';
import { buildYards } from './meru2-yards.js';
import { audioKit } from './meru2-audio.js';
import { STOCK, ITEM_LABELS, buy } from './meru-shops.js';
import { buildRescue } from './meru2-rescue.js';
import { buildCellar } from './meru2-cellar.js';
import { buildBackrooms } from './meru2-backrooms.js';
const DEFEAT = { carried: 0.5 };   // Ben: losing keeps BANKED gold (stat meru2Bank); you drop this share of the gold you carry (DRAFT 50 %)
import { buildBowling } from './meru2-bowling.js';
import { PLAYER_MALE } from '../fox-kit.js';

export async function createWalk(B, { onState = () => {}, onHire = () => {}, onTicket = () => {}, onRental = () => {}, onCivic = () => {}, onPick = () => {} } = {}) {
  const { THREE, scene, camera, toon, grad, L, I } = B.K, V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(m, t = 0.04, radius) { const g = m.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); m.add(o); return m; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, await loadCastRigs().catch(() => ({})));
  const fox = cast.make('player'); fox.visible = false; scene.add(fox);

  // ---------- world queries ----------
  const inR = (r, x, z) => x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3];
  const W = L.WATER[0].e, inLake = L.inLake;
  const islandH = L.islandH, HZ = B.heights;   // HZ = hills, trails, decks, lighthouses (worlds/meru2-heights.js)
  const islandAt = (x, z) => { const r = L.islandR(x, z); return r > I.pond.r && r < I.c[2] + 6 ? Math.max(0, islandH(r)) : 0; };
  const T = B.train;
  let cellar = null, backrooms = null;
  function ground(x, z, y = P.y) { const ce = (cellar && cellar.groundAt(x, z, y)) ?? (backrooms && backrooms.groundAt(x, z, y)); if (ce != null) return { h: ce, water: false }; const t = T.groundAt(x, z, y); if (t != null) return { h: t, water: false }; const lj = lake && lake.groundAt(x, z, y); if (lj != null) return { h: lj, water: false }; const yg = yards && yards.groundAt(x, z); if (yg != null && yg > 0.001) return { h: yg, water: false }; const ap = apts && apts.groundAt(x, z, y); if (ap != null) return { h: ap, water: false }; const hz = HZ.groundAt(x, z, y); if (hz != null) return { h: hz, water: false }; const r = L.islandR(x, z); if (r < I.c[2] + 6) { if (r < I.pond.r) return { h: 0.4, water: true, deep: true }; const h = islandH(r); if (h > 0.2) return { h, water: false }; } if (inLake(x, z)) return { h: 0.08, water: true }; return { h: 0, water: false }; }
  const city = B.city, cols = [...L.BUILDINGS.filter(b => b.f && b.key !== 'ferryDock' && !b.open && !b.own && !city.keys.has(b.key)).map(b => ({ f: b.f })), ...city.colliders, ...T.colliders, ...HZ.colliders, ...((B.paths && B.paths.colliders) || []), ...((B.districts && B.districts.colliders) || []), ...((B.breeze && B.breeze.colliders) || [])];
  // ---------- rental car: standard vehicle controls (stick y = throttle, stick x = steer) · 1 HORN · 2 LIGHTS · 3 BRAKE (hold) ----------
  const segD = (x, z, p) => { let m = 1e9; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)); m = Math.min(m, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return m; };
  const roadD = (x, z) => Math.min(...L.ROADS.map(r => segD(x, z, r.p) - r.w / 2));
  const RB = L.BUILDINGS.find(b => b.key === 'carRental'), LOT = RB.lot.r, RENT = L.CAR_RENTAL, desk = { x: (RB.f[0] + RB.f[1]) / 2, z: RB.f[3] - 2.6 };
  cols.push({ f: [desk.x - 2, desk.x + 2, desk.z - 0.45, desk.z + 0.45] });
  const car = new THREE.Group(), wheels = [], pools = []; scene.add(car); car.visible = false;
  { const red = toon('#ec3013'), white = toon('#f3f2f2'), ink = toon('#201e1d'), gl = new THREE.MeshPhongMaterial({ color: 0x1d2a33, shininess: 90, specular: 0x88aacc }), hl = new THREE.MeshBasicMaterial({ color: 0xfff3c0 }), tl = new THREE.MeshBasicMaterial({ color: 0xff3a20 });
    M(new THREE.BoxGeometry(1.9, 0.62, 4.3), red, 0, 0.66, 0, car, 0.03); M(new THREE.BoxGeometry(1.93, 0.12, 4.33), white, 0, 0.8, 0, car, 0);
    M(new THREE.BoxGeometry(1.72, 0.58, 2.3), gl, 0, 1.26, -0.2, car, 0.02); M(new THREE.BoxGeometry(1.76, 0.08, 2.0), red, 0, 1.58, -0.25, car, 0.01);
    for (const sx of [-0.6, 0.6]) { M(new THREE.BoxGeometry(0.45, 0.16, 0.05), hl, sx, 0.78, 2.16, car, 0); M(new THREE.BoxGeometry(0.45, 0.16, 0.05), tl, sx, 0.78, -2.16, car, 0); }
    for (const [x, z] of [[-0.92, 1.4], [0.92, 1.4], [-0.92, -1.4], [0.92, -1.4]]) { const g = new THREE.Group(); g.position.set(x, 0.36, z); car.add(g); const t = M(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 16), ink, 0, 0, 0, g, 0.02, 0.36); t.rotation.z = Math.PI / 2; wheels.push({ g, t, front: z > 0 }); }
    const pt = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const q = c.getContext('2d'), r = q.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,240,200,0.8)'); r.addColorStop(1, 'rgba(255,240,200,0)'); q.fillStyle = r; q.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
    for (const sx of [-0.7, 0.7]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(3, 9).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: pt, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); p.position.set(sx, 0.05, 6.5); car.add(p); pools.push(p); } }
  const day = () => save.stat('meru2Day', 1), rentOk = () => { const r = save.stat('meru2Rental', null); return !!r && r.until >= day(); };
  const BAY = { x: LOT[0] + (LOT[1] - LOT[0]) * 0.5 / 6, z: LOT[2] + 4, yaw: Math.PI }, SPEC = { max: 16, rev: 5, accel: 8, turn: 2.0 };
  const CAR = { x: BAY.x, z: BAY.z, yaw: BAY.yaw, speed: 0, steer: 0, lights: false, brake: false, onPath: false, spin: 0 };
  { const p = save.stat('meru2RentalCar', null); if (rentOk() && p) Object.assign(CAR, { x: p.x, z: p.z, yaw: p.yaw }); }
  const inLot = () => CAR.x > LOT[0] && CAR.x < LOT[1] && CAR.z > LOT[2] && CAR.z < LOT[3];
  function placeCar() { car.position.set(CAR.x, 0, CAR.z); car.rotation.y = CAR.yaw; car.visible = rentOk(); for (const w of wheels) { w.t.rotation.x = CAR.spin; if (w.front) w.g.rotation.y = -CAR.steer * 0.45; } for (const p of pools) p.visible = CAR.lights; }
  placeCar();
  function driveMove(dt, ix, iy) { const C = CAR, thr = clamp(iy, -1, 1), str = clamp(ix, -1, 1);
    if (C.brake) C.speed = damp(C.speed, 0, 5, dt); else if (thr > 0.05) C.speed += SPEC.accel * thr * dt * (C.speed < 0 ? 2.2 : 1); else if (thr < -0.05) C.speed += SPEC.accel * thr * dt * (C.speed > 0 ? 2.2 : 0.7); else C.speed = damp(C.speed, 0, 1.2, dt);
    C.speed = clamp(C.speed, -SPEC.rev, SPEC.max); C.steer = damp(C.steer, str, 8, dt);
    const sp = Math.abs(C.speed), dir = C.speed >= -0.1 ? 1 : -1, turnK = clamp(sp / 5, 0, 1) * (1 - clamp((sp - SPEC.max * 0.7) / SPEC.max, 0, 0.45));
    C.yaw -= C.steer * SPEC.turn * turnK * dir * dt * (C.brake ? 1.4 : 1);
    const nx = C.x + Math.sin(C.yaw) * C.speed * dt, nz = C.z + Math.cos(C.yaw) * C.speed * dt, Hm = L.MAP.half - 3;
    let hit = Math.abs(nx) > Hm || Math.abs(nz) > Hm || ground(nx, nz, 0).water || HZ.carBlock(nx, nz) || L.BUILDINGS.some(b => nx > b.f[0] - 1.2 && nx < b.f[1] + 1.2 && nz > b.f[2] - 1.2 && nz < b.f[3] + 1.2 && !(b.lot && false));
    if (!hit) for (const c of cols) { if (c.on === false) continue; if (c.c) { if (Math.hypot(nx - c.c[0], nz - c.c[1]) < c.c[2] + 1.3) { hit = true; break; } } else { const f = c.f; if (nx > f[0] - 1.2 && nx < f[1] + 1.2 && nz > f[2] - 1.2 && nz < f[3] + 1.2) { hit = true; break; } } }
    if (hit) C.speed *= -0.25; else { C.x = nx; C.z = nz; }
    P.x = C.x; P.z = C.z; P.y = 0; P.yaw = C.yaw; P.sp = sp; P.ground = true; P.swim = false; P.vy = 0;
    const onPath = sp > 1 && L.PATHS.some(q => segD(C.x, C.z, q.p) < 3) && roadD(C.x, C.z) > 0.5;
    if (onPath && !C.onPath) { save.setStat('meru2PathDrive', save.stat('meru2PathDrive') + 1); law.addFine('path'); toast = 'ON A FOOT PATH · FINE ' + law.owed() + ' GOLD OWED'; toastT = 3; } C.onPath = onPath;
    C.spin += C.speed * dt / 0.36; placeCar(); }
  function horn() { const c = audio(); if (!c || muted) return; for (const f of [392, 494]) { const o = c.createOscillator(), g = c.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 0.02); g.gain.setValueAtTime(0.05, c.currentTime + 0.35); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.45); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.5); } }
  const nearCar = () => !P.car && !P.ab && car.visible && P.y < 1 && Math.hypot(P.x - CAR.x, P.z - CAR.z) < 3.2;
  const nearDesk = () => !P.car && P.y < 1 && Math.hypot(P.x - desk.x, P.z - (desk.z - 1.3)) < 2.2;
  function getIn() { P.car = true; CAR.speed = 0; CAM.yaw = CAR.yaw + Math.PI; lastEmit = 0; }
  function getOut() { if (Math.abs(CAR.speed) > 2) return; P.car = false; CAR.speed = 0; CAR.brake = false; const lx = -2.0; P.x = CAR.x + lx * Math.cos(CAR.yaw); P.z = CAR.z - lx * Math.sin(CAR.yaw); P.yaw = CAR.yaw;
    if (inLot()) { save.setStat('meru2Rental', null); save.setStat('meru2RentalCar', null); Object.assign(CAR, BAY, { lights: false }); toast = 'CAR RETURNED'; toastT = 2.5; } else save.setStat('meru2RentalCar', { x: CAR.x, z: CAR.z, yaw: CAR.yaw }); placeCar(); lastEmit = 0; }
  const law = lawKit(save), halls = buildHalls({ THREE, scene, kit, cols, L, touch: matchMedia('(pointer: coarse)').matches }), barracks = (B.ownBlocks && B.ownBlocks.barracks && (B.ownBlocks.barracks.visible = false), buildBarracks({ THREE, scene, kit, cols, L, touch: matchMedia('(pointer: coarse)').matches })), civic = buildCivic({ THREE, scene, M, toon, kit, cols }), rooms = buildRooms({ THREE, scene, M, toon, kit, cast, cols, grad, save, audio: () => muted ? null : audio(), touch: matchMedia('(pointer: coarse)').matches }), rooms2 = buildRooms2({ THREE, scene, M, toon, kit, cols, grad }), apts = buildApts({ THREE, scene, M, toon, kit, cols, L }),
    lake = buildLake({ THREE, scene, M, toon, grad, kit, cast, cols, L, save, touch: matchMedia('(pointer: coarse)').matches, water: B.water, terrainAt: (x, z) => HZ.terrainAt(x, z), audio: () => muted ? null : audio() }),   // step 5: the lake
    allSpots = [...civic.spots, ...rooms.spots, ...rooms2.spots, ...apts.spots, ...lake.spots];
  const yards = buildYards({ THREE, scene, M, toon, grad, kit, cols, L, save, touch: matchMedia('(pointer: coarse)').matches, audio: () => muted ? null : audio() });   // step 7: skate park + tank works
  allSpots.push(...yards.spots);
  const bowl = buildBowling({ THREE, scene, lanes: rooms2.lanes, save, audio: () => muted ? null : audio(), touch: matchMedia('(pointer: coarse)').matches }); allSpots.push(bowl.spot);   // 3D tenpin on lane 4
  // ROOM TALK (6d follow-up): people inside rooms with lines that already exist in the old Meru files. No new text.
  const TALK = {}; for (const p of BAR_PEOPLE) if (BAR_TALK[p.key]) TALK[p.key] = { name: p.name, role: p.role, lines: BAR_TALK[p.key] };
  for (const o of OLD_APTS) { const r = o.realtor; if (r && r.line) TALK[r.key] = { name: r.name, role: r.role, lines: [{ who: 'npc', text: r.line }] }; }
  const talkers = [...(barracks.people || []), ...(apts.people || [])].filter(t => TALK[t.key]); let dlg = null, talkNear = null;
  const dlgHud = () => { if (!dlg) return null; const T0 = TALK[dlg.t.key], ln = T0.lines[dlg.i], me = ln.who === 'player'; return { name: me ? 'YOU' : ln.who === 'npc' ? T0.name : String(ln.who).toUpperCase(), role: me ? '' : T0.role, text: ln.text, step: dlg.i + 1, total: T0.lines.length }; };
  const dlgNext = () => { if (!dlg) return; dlg.i++; if (dlg.i >= TALK[dlg.t.key].lines.length) { dlg.t.obj.rotation.y = dlg.t.ry; dlg = null; } lastEmit = 0; emit(); };
  const vBlock = (nx, nz, r) => { const Hm = L.MAP.half - 3; if (Math.abs(nx) > Hm || Math.abs(nz) > Hm) return true; if (L.BUILDINGS.some(b => !b.open && b.key !== 'ferryDock' && !city.keys.has(b.key) && nx > b.f[0] - r && nx < b.f[1] + r && nz > b.f[2] - r && nz < b.f[3] + r)) return true;
    for (const c of cols) { if (c.on === false) continue; if (c.c) { if (Math.hypot(nx - c.c[0], nz - c.c[1]) < c.c[2] + r) return true; } else { const f = c.f; if (nx > f[0] - r && nx < f[1] + r && nz > f[2] - r && nz < f[3] + r) return true; } } return false; };
  const LS = L.LAKE.swim, LW = L.WATER[0].e;
  // swimming (session: swim pass): speeds from engine/swim-kit.js, a WADING strip at the lake edge (walk, knee-to-chest deep), the crawl / underwater pose
  const SW = { speed: 3.4, under: 3.0, kick: 6.5, wade: SWIM.WADE, depth: SWIM.DEPTH + 0.15, wadeW: 2.6 };
  const shoreD = L.lakeShoreD;
  const swimRing = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.82, 28), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide })); swimRing.rotation.x = -Math.PI / 2; swimRing.visible = false; scene.add(swimRing);
  let posed = false, posed0 = [], sph = 0;   // sword + laser are put away while swimming
  function swimPose(dt) { const Pf = fox.userData.P;
    const gear = Pf ? [Pf.sword, Pf.gun].filter(Boolean) : [];
    if (!P.swim || P.boat || P.ferry || P.ab || !Pf || !fox.visible) { if (posed) { fox.rotation.x = 0; fox.rotation.z = 0; posed = false; gear.forEach((g, i) => { g.visible = posed0[i] !== false; }); } swimRing.visible = false; return; }
    if (!posed) { posed0 = gear.map(g => g.visible); gear.forEach(g => { g.visible = false; }); } posed = true; fox.rotation.order = 'YXZ'; const under = P.dive > 0, mv = Math.min(1, P.sp / 2.5); sph += dt * (mv > 0.1 ? (under ? 5 : 7) * (0.6 + mv * 0.4) : 1.6);
    fox.rotation.x = Math.PI / 2 * 0.94 + (under && P.y > 0.08 - SW.depth + 0.2 ? 0.3 : 0); fox.rotation.z = Math.sin(sph * 0.5) * (under ? 0.05 : 0.18);
    fox.position.set(P.x - Math.sin(P.yaw) * 0.75, P.y, P.z - Math.cos(P.yaw) * 0.75);
    if (Pf.body) Pf.body.rotation.set(0, 0, 0);
    if (under) { const u = Math.sin(sph); Pf.arms.forEach((a, i) => { a.rotation.x = -2.8 + Math.max(0, u) * 1.6; a.rotation.z = (i ? 1 : -1) * (0.2 + Math.max(0, -u) * 1.2); }); Pf.legs.forEach((l, i) => { l.rotation.x = Math.sin(sph * 2 + i * Math.PI) * 0.25; l.rotation.z = (i ? 1 : -1) * (0.1 + Math.max(0, u) * 0.3); }); }
    else { Pf.arms.forEach((a, i) => { a.rotation.x = -((sph + i * Math.PI) % (Math.PI * 2)); a.rotation.z = (i ? 1 : -1) * 0.15; }); Pf.legs.forEach((l, i) => { l.rotation.x = Math.sin(sph * 2.4 + i * Math.PI) * 0.35 * (0.4 + mv * 0.6); l.rotation.z = 0; }); }
    swimRing.visible = !under; swimRing.position.set(P.x, (ground(P.x, P.z).h || 0.08) + 0.03, P.z); swimRing.scale.setScalar(1 + 0.15 * Math.sin(sph * 0.6) + mv * 0.2); swimRing.material.opacity = 0.25 + mv * 0.25; }
  cellar = buildCellar({ THREE, scene, cols, touch: matchMedia('(pointer: coarse)').matches });   // backrooms: the tavern cellar
  backrooms = buildBackrooms({ THREE, scene, cols, kit, PLAYER_MALE, touch: matchMedia('(pointer: coarse)').matches });   // bank vault corridor, police evidence room, casino count room
  fox.traverse(o => { o.renderOrder = -2; });
  const rescue = buildRescue({ THREE, scene, kit, lake, L, ground, shoreD, save });   // lake rescue: carry anyone who needs help in the water
  const life = await buildPathLife({ THREE, scene, M, toon, kit, cols, L, HZ, audio: () => muted ? null : audio() });   // step 4: path people + Ruins wilds
  const walkers = buildWalkers({ THREE, scene, kit, L, cols, touch: matchMedia('(pointer: coarse)').matches, PLAYER_FEMALE: (await import('../fox-kit.js')).PLAYER_FEMALE });   // exterior polish: a few background walkers in Town Square
  if (B.spk) B.spk.children.forEach(c => { if (life.keys.has(c.userData.key) || rooms.keys.has(c.userData.key) || lake.keys.has(c.userData.key) || yards.keys.has(c.userData.key)) c.visible = false; });
  const pentKey = () => { const r = save.stat('meru2Pent', null); return r && r.day >= save.stat('meru2Day', 1) ? r.key : null; };
  const LOBBY = { x: -86, z: -85, yaw: Math.PI };
  let escaping = false, jailSave = 0;
  function toCell() { yards.off(P); if (P.boat) { lake.park(); P.boat = false; } P.ferry = false; lake.ferry.rider = false; Object.assign(P, { x: civic.CELL_IN.x, z: civic.CELL_IN.z, y: 0, vy: 0, yaw: 0, ab: null, car: false }); T.setView(null); civic.lockCell(); escaping = false; CAM.yaw = Math.PI; }
  function freeAt(msg) { Object.assign(P, { x: LOBBY.x, z: LOBBY.z, y: 0, vy: 0, yaw: LOBBY.yaw }); civic.lockCell(); escaping = false; toast = msg; toastT = 3; lastEmit = 0; }
  const zoneAt = (x, z) => { let best = null; for (const Z of L.ZONES) if (Z.r ? inR(Z.r, x, z) : Math.hypot(x - Z.c[0], z - Z.c[1]) <= Z.c[2]) best = Z; return best; };
  const indoorTalkers = new Set(L.SPEAKERS.filter(s => !Array.isArray(s.at)).map(s => s.key));
  const voices = L.SPEAKERS.filter(s => Array.isArray(s.at) && s.tier < 3 && !indoorTalkers.has(s.key));
  const hires = L.BUILDINGS.filter(b => b.hiring && b.door).map(b => { const F = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[b.face], ang = Math.atan2(F[0], F[1]), off = [Math.cos(ang) * 4.2 + F[0] * 1.4, -Math.sin(ang) * 4.2 + F[1] * 1.4]; return { b, x: b.door[0] + off[0], z: b.door[1] + off[1] }; });

  // ---------- footsteps (synth per surface, until Ben's sound pass replaces them) ----------
  const HARD_MUTE = true;   // Ben: all sound OFF until he asks for it back (set false to restore)
  let ac = null; const audio = () => { if (HARD_MUTE) return null; if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (ac && ac.state === 'suspended') ac.resume(); return ac; };
  let muted = HARD_MUTE; const STEP = { stone: [2400, 0.05, 0.10], wood: [700, 0.07, 0.12], rug: [400, 0.12, 0.05], sand: [5200, 0.09, 0.06], grit: [1800, 0.06, 0.13], grass: [3200, 0.08, 0.05], water: [900, 0.18, 0.09] };
  function step(s) { const c = audio(); if (!c || muted) return; const [f, d, v] = STEP[s] || STEP.grass, n = c.createBufferSource(), b = c.createBuffer(1, c.sampleRate * d, c.sampleRate), a = b.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / a.length) ** 2; n.buffer = b; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * (0.9 + Math.random() * 0.2); bp.Q.value = s === 'sand' || s === 'grass' ? 0.6 : 1.4; const g = c.createGain(); g.gain.value = v; n.connect(bp); bp.connect(g); g.connect(c.destination); n.start();
    if (s === 'grit') { const n2 = c.createBufferSource(); n2.buffer = b; n2.connect(bp); n2.start(c.currentTime + 0.035); } if (s === 'wood') { const o = c.createOscillator(), og = c.createGain(); o.frequency.value = 120; og.gain.setValueAtTime(0.06, c.currentTime); og.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.09); o.connect(og); og.connect(c.destination); o.start(); o.stop(c.currentTime + 0.1); } }
  function chime() { const c = audio(); if (!c || muted) return; [988, 1319].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, c.currentTime + i * 0.12); g.gain.exponentialRampToValueAtTime(0.08, c.currentTime + i * 0.12 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + i * 0.12 + 0.6); o.connect(g); g.connect(c.destination); o.start(c.currentTime + i * 0.12); o.stop(c.currentTime + i * 0.12 + 0.7); }); }

  const sound = audioKit({ L, getCtx: () => (ac ? audio() : null), muted: () => muted });   // step 8: spatial audio (music, room beds + door leak, voices, recorded loops)
  let ai = { music: '', room: '', voice: null, leak: '' };

  // ---------- state + input ----------
  const P = { x: 0, z: 30, y: 0, vy: 0, yaw: Math.PI, ground: true, sp: 0, swim: false, stepPh: 0 };
  const CAM = { yaw: Math.PI, pitch: 0.32, dist: 9, drag: 0, sy: 0, sp: 0 }, stick = { x: 0, y: 0 }, keys = new Set();
  let on = false, paused = false, night = false, zone = null, surface = 'stone', voice = null, voiceT = 0, hire = null, toast = '', toastT = 0;
  const kd = e => { if (!on || /INPUT|TEXTAREA/.test(e.target.tagName)) return; keys.add(e.code); if (e.code === 'Space') { e.preventDefault(); api.jump(); } if (e.code === 'KeyE') api.talk(); }, ku = e => { keys.delete(e.code); if (on && e.code === 'Space') api.jumpUp(); };
  addEventListener('keydown', kd); addEventListener('keyup', ku);

  function walkMove(dt, im, mx, mz) {
    P.kick = Math.max(0, (P.kick || 0) - dt); P.kickCd = Math.max(0, (P.kickCd || 0) - dt); if (!P.swim) P.dive = 0;
    // breath (engine/swim-kit.js SWIM numbers): drains only once you are really under, refills fast at the surface; empty = forced up + a gasp
    P.breath = P.breath ?? SWIM.BREATH; P.gasp = Math.max(0, (P.gasp || 0) - dt); const under = P.swim && P.dive > 0 && P.y < 0.08 - 0.55;
    P.breath = clamp(P.breath + (under ? -SWIM.DRAIN : SWIM.REFILL) * dt, 0, SWIM.BREATH);
    if (P.dive > 0 && P.breath <= 0) { P.dive = 0; P.gasp = 1.4; toast = 'OUT OF BREATH \u00b7 BACK UP'; toastT = 2; lake.splash(0.06); }
    const spd = (P.swim ? (P.kick > 0 ? SW.kick : P.dive > 0 ? SW.under : SW.speed) * (P.gasp > 0 ? 0.5 : 1) * (rescue.carrying() ? 0.7 : 1) : P.wade ? SW.wade : 4) * (P.swim && P.kick > 0 ? Math.max(im, 0.8) : im); P.sp = damp(P.sp, spd, P.swim ? 3 : 10, dt);
    if (im > 0.05) P.yaw += Math.atan2(Math.sin(Math.atan2(mx, mz) - P.yaw), Math.cos(Math.atan2(mx, mz) - P.yaw)) * Math.min(1, dt * 10);
    let nx = P.x + Math.sin(P.yaw) * P.sp * dt, nz = P.z + Math.cos(P.yaw) * P.sp * dt;
    for (const c of cols) { if (c.on === false || (c.y1 != null && P.y > c.y1) || (c.y0 != null && P.y < c.y0) || (c.y0 == null && P.y < -2.4)) continue; if (c.c) { const ex = nx - c.c[0], ez = nz - c.c[1], r = c.c[2] + 0.4; if (Math.abs(ex) < r && Math.abs(ez) < r) { const dd = Math.hypot(ex, ez); if (dd < r && dd > 1e-4) { nx = c.c[0] + ex / dd * r; nz = c.c[1] + ez / dd * r; } } continue; } const f = c.f; if (nx > f[0] - 0.5 && nx < f[1] + 0.5 && nz > f[2] - 0.5 && nz < f[3] + 0.5) { const dl = nx - (f[0] - 0.5), dr = f[1] + 0.5 - nx, dtp = nz - (f[2] - 0.5), db = f[3] + 0.5 - nz, m = Math.min(dl, dr, dtp, db); if (m === dl) nx = f[0] - 0.5; else if (m === dr) nx = f[1] + 0.5; else if (m === dtp) nz = f[2] - 0.5; else nz = f[3] + 0.5; } }
    const H = L.MAP.half - 2; nx = clamp(nx, -H, H); nz = clamp(nz, -H, H);
    const tc = T.walkClamp(P.x, P.z, nx, nz, P.y); nx = tc.x; nz = tc.z; if (tc.board) { board(tc.board); return; }
    { const hc = HZ.clamp(P.x, P.z, nx, nz, P.y, Math.sin(P.yaw) * P.sp * dt, Math.cos(P.yaw) * P.sp * dt); nx = hc.x; nz = hc.z; if (hc.yaw != null && P.sp > 0.3) P.yaw += Math.atan2(Math.sin(hc.yaw - P.yaw), Math.cos(hc.yaw - P.yaw)) * Math.min(1, dt * 12); }
    const g1 = ground(nx, nz); if (!g1.water && g1.h - P.y > 1.2 && P.ground) { nx = P.x; nz = P.z; } P.x = nx; P.z = nz;
    const vyIn = P.vy, gh = ground(P.x, P.z), sd = gh.water && !gh.deep ? shoreD(P.x, P.z) : 99; P.wade = gh.water && sd < SW.wadeW; P.swim = gh.water && !P.wade && P.y <= gh.h + 0.3;
    // swim pass 2: splash when you drop in / dive / come up, drips for a few seconds after you climb out
    { const wet = P.swim || P.wade, dv = P.dive > 0; if (wet && !P.wasWet && vyIn < -3) { lake.fx(P.x, gh.h + 0.1, P.z, 26, 4.2, 2); lake.splash(0.1); } else if (P.swim && !P.wasSwim) lake.fx(P.x, gh.h + 0.1, P.z, 8, 2, 1.2);
      if (P.swim && dv !== !!P.wasDive) lake.fx(P.x, gh.h + 0.1, P.z, dv ? 12 : 10, dv ? 2.6 : 3, 1.2); if (!wet && P.wasWet) P.drip = 2.5;
      P.wasWet = wet; P.wasSwim = P.swim; P.wasDive = P.swim && dv; P.drip = Math.max(0, (P.drip || 0) - dt); if (P.drip > 0 && Math.random() < dt * 14 * P.drip / 2.5) lake.fx(P.x + (Math.random() - 0.5) * 0.5, P.y + 0.4 + Math.random() * 0.6, P.z + (Math.random() - 0.5) * 0.5, 1, 0, 0.15, false); }
    if (P.swim) { P.y = damp(P.y, gh.h - (P.dive > 0 ? SW.depth : 0.2 - lake.waveAt(P.x, P.z)), P.dive > 0 ? 2.5 : 10, dt); P.vy = 0; P.ground = true; }
    else if (P.wade && P.ground && P.vy <= 0) { P.y = damp(P.y, gh.h - Math.min(0.75, sd * 0.32), 8, dt); P.vy = 0; } else { P.vy -= 22 * dt; P.y += P.vy * dt; if (P.y <= gh.h) { if (!P.ground && P.vy < -6) step(surface); P.y = gh.h; P.vy = 0; P.ground = true; } else P.ground = P.y - gh.h < 0.05; }
  }
  function boatTalk() {
    if (P.ferry) { if (lake.ferry.phase === 'dwell') { const st = lake.ferryOff(P); P.ferry = false; toast = st.label.toUpperCase(); toastT = 2.5; lastEmit = 0; } return true; }
    if (!P.boat && !P.car && !P.ab) { const st = lake.nearFerry(P); if (st) { lake.ferryBoard(); P.ferry = true; P.dive = 0; CAM.yaw = lake.ferry.yaw + Math.PI; toast = 'ALL ABOARD \u00b7 FREE FERRY'; toastT = 2.5; lastEmit = 0; return true; } }
    if (P.boat) { if (lake.nearGate()) { paused = true; onHire({ label: lake.gate.label, hiring: { url: lake.gate.url }, play: true }); return true; } const r = lake.exit(P); if (r) { P.boat = false; P.swim = r === 'water'; toast = r === 'water' ? 'IN THE WATER' : 'SPEEDBOAT MOORED'; toastT = 2; lastEmit = 0; } return true; }
    if (P.car || P.ab) return false;
    const cl = lake.nearClimb(P); if (cl) { Object.assign(P, { x: cl.x, z: cl.z, y: cl.y, vy: 0, yaw: cl.yaw, swim: false, dive: 0 }); lake.splash(0.06); lastEmit = 0; return true; }
    if (lake.nearBoat(P)) { P.boat = true; P.dive = 0; P.swim = false; lake.enter(); CAM.yaw = lake.boat.yaw + Math.PI; lastEmit = 0; return true; }
    return false; }
  const ticketOk = () => { const t = save.stat('meru2Ticket', null); return !!t && t.until >= save.stat('meru2Day', 1); };
  const visit = st => { if (st && !save.flag('meru2Stop_' + st.key)) save.setFlag('meru2Stop_' + st.key); };
  function board(b) { P.ab = b; P.sp = 0; if (ride) { toast = 'ALL ABOARD'; toastT = 2.5; return; } if (!ticketOk()) { save.setStat('meru2FareDodge', save.stat('meru2FareDodge') + 1); law.addFine('fare'); toast = 'NO TICKET · FINE ' + law.owed() + ' GOLD OWED · PAY AT THE POLICE'; toastT = 3.5; } }
  T.onArrive = st => { if (P.ab) { visit(st); toast = st.label.toUpperCase(); toastT = 3; } if (ride && ride.step === 'ride') { if (ride.left && st.key === RIDE_KEY) rideEnd(); else { const i = T.stops.indexOf(st), nx = T.stops[(i + 1) % T.stops.length]; ride.next = nx.label; } } };
  // ---------- TRAIN RIDE DEMO (Ben): autopilot from inside Town Square Station: out the door, the ticket machine, the lift,
  // the platform, the train pulls in, step aboard, walk to a window seat on the town side, sit, ride the whole loop back ----------
  let ride = null; const RIDE_KEY = 'stationTown';
  function steer(tx, tz, spd = 1) { const dx = tx - P.x, dz = tz - P.z, d = Math.hypot(dx, dz) || 1, ux = dx / d, uz = dz / d, fx = Math.sin(CAM.yaw + Math.PI), fz = Math.cos(CAM.yaw + Math.PI), rx = -fz, rz = fx;
    stick.y = (ux * fx + uz * fz) * spd; stick.x = -(ux * rx + uz * rz) * spd; return d; }
  function rideStart() { if (law.jail()) return false; yards.off(P); if (P.boat) { lake.park(); P.boat = false; } P.car = false; P.ferry = false; lake.ferry.rider = false; P.ab = null; T.setView(null);
    const st = T.stops.find(s => s.key === RIDE_KEY), W = (a, ls) => T.toW(RIDE_KEY, st.liftA + a, ls), mach = W(3.3, 11.5), up = W(0, 12.8), pad = W(0, 9.4);
    ride = { st, W, step: 'walk', t: 0, wait: 0, stuck: 0, last: null, left: false, next: '', path: [
      { x: 0, z: 128, msg: 'TOWN SQUARE STATION' }, { x: 0, z: 135.5 }, { x: up.x - 3, z: 135.8 }, { x: mach.x, z: mach.z, wait: 1.8, msg: 'TICKET MACHINE · A DAY TICKET', face: W(3.3, 9.6) },
      { x: up.x, z: up.z, msg: 'THE LIFT' }, { x: pad.x, z: pad.z, r: 0.3, lift: true }] };
    Object.assign(P, { x: 0, z: 121, y: 0, vy: 0, yaw: 0, sp: 0, swim: false, dive: 0 }); CAM.yaw = Math.PI; CAM.pitch = 0.3; CAM.dist = 7.5; CAM.drag = 0; T.dwell = null; T.hold = false;
    toast = 'TRAIN RIDE · DEMO'; toastT = 2.5; paused = false; lastEmit = 0; return true; }
  function rideEnd(msg) { if (!ride) return; ride = null; stick.x = stick.y = 0; T.dwell = null; T.hold = false; toast = msg || 'BACK AT TOWN SQUARE STATION · END OF THE RIDE'; toastT = 4; lastEmit = 0; }
  function rideStep(dt) { const R = ride; R.t += dt; stick.x = stick.y = 0;
    if (P.ab && R.step !== 'aisle' && R.step !== 'ride') { const k = P.ab.car, row = P.ab.z > 0 ? 2.2 : -2.6, a = T.toWorldCar(k, 1, row), b = T.toWorldCar(k, -1, row); R.row = row; R.sd = Math.hypot(a.x, a.z) < Math.hypot(b.x, b.z) ? 1 : -1; R.step = 'aisle'; R.t = 0; R.stuck = 0; return; }
    if (R.step === 'walk' || R.step === 'plat') { const q = R.path[0]; if (!q) return;
      if (R.wait > 0) { R.wait -= dt; if (q.face) P.yaw += Math.atan2(Math.sin(Math.atan2(q.face.x - P.x, q.face.z - P.z) - P.yaw), Math.cos(Math.atan2(q.face.x - P.x, q.face.z - P.z) - P.yaw)) * Math.min(1, dt * 6); if (R.wait <= 0) R.path.shift(); return; }
      if (q.msg && !q.said) { q.said = true; toast = q.msg; toastT = 2.5; }
      const dd = Math.hypot(q.x - P.x, q.z - P.z);
      if (dd > (q.r || 0.6)) { steer(q.x, q.z, dd < 1.5 ? 0.55 : 1); R.stuck += dt; if (!R.last || Math.hypot(P.x - R.last.x, P.z - R.last.z) > 0.25) { R.last = { x: P.x, z: P.z }; R.stuck = 0; } if (R.stuck > 1.4 && !q.noNudge) { const k = Math.min(0.7, dd); P.x += (q.x - P.x) / dd * k; P.z += (q.z - P.z) / dd * k; R.stuck = 0; } return; }
      if (q.wait) { R.wait = q.wait; q.wait = 0; return; }
      if (q.lift) { R.step = 'lift'; R.t = 0; T.summon(RIDE_KEY, 150); toast = 'UP TO THE PLATFORM'; toastT = 2.5; R.path.shift(); return; }
      R.path.shift(); if (!R.path.length && R.step === 'plat') { R.step = 'waitTrain'; toast = 'THE TRAIN IS COMING IN'; toastT = 3; } return; }
    if (R.step === 'lift') { if (P.y > T.PLAT_Y - 0.1) { R.step = 'plat'; R.path = [{ x: R.W(0, 6.4).x, z: R.W(0, 6.4).z }, { x: R.W(-2, 4.2).x, z: R.W(-2, 4.2).z }]; } return; }
    if (R.step === 'waitTrain') { const dk = T.docked(); T.hold = true; if (dk && dk.key === RIDE_KEY) { const st = R.st, ds = []; for (let k = 0; k < 4; k++) for (const dz of [-4, 4]) ds.push({ k, a: T.carA(RIDE_KEY, k) + dz * (T.K || 1) });
        const fx = P.x, fz = P.z; let best = ds[0], bd = 1e9; for (const o of ds) { const w2 = T.toW(RIDE_KEY, o.a, 3); const dd = Math.hypot(w2.x - fx, w2.z - fz); if (dd < bd) { bd = dd; best = o; } }
        const a1 = T.toW(RIDE_KEY, best.a, 3.0), a2 = T.toW(RIDE_KEY, best.a, 0.4); R.step = 'plat'; R.path = [{ x: a1.x, z: a1.z, msg: 'DOORS OPEN' }, { x: a2.x, z: a2.z, r: 0.05, noNudge: true }]; } return; }
    if (R.step === 'aisle') { const k = P.ab.car, tw = T.toWorldCar(k, 0, R.row), dd = Math.hypot(P.ab.z - R.row, P.ab.x); if (Math.abs(P.ab.z - R.row) < 0.3 && Math.abs(P.ab.x) < 0.65) { api.sit({ x: R.sd * 1.0, z: R.row }); R.step = 'ride'; R.t = 0; T.hold = false; T.dwell = 9; toast = 'A WINDOW SEAT · THE WHOLE TOWN'; toastT = 3; return; }
      steer(tw.x, tw.z, dd < 1 ? 0.5 : 0.8); R.stuck += dt; if (R.stuck > 6) { P.ab.x = 0; P.ab.z = R.row; R.stuck = 0; } return; }
    if (R.step === 'ride') { if (T.phase() === 'run') R.left = true; CAM.sy = Math.sin(R.t * 0.12) * 0.32; CAM.sp = -0.05 + Math.sin(R.t * 0.07) * 0.05; if (R.next && T.phase() === 'run' && !R.saidNext) { R.saidNext = R.next; toast = 'NEXT STOP · ' + R.next.toUpperCase(); toastT = 3; } if (T.phase() !== 'run') R.saidNext = null; } }
  let civicSpot = null, prompt = null, seatNear = null, machine = null, trainTxt = '';
  function frame(dt, now) {
    if (paused) dt = 0;
    if (ride && dt > 0) rideStep(dt);
    let ix = stick.x + (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0), iy = stick.y + (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
    const im = Math.min(1, Math.hypot(ix, iy)); const fx = Math.sin(CAM.yaw + Math.PI), fz = Math.cos(CAM.yaw + Math.PI), rx = -fz, rz = fx;
    let mx = (fx * iy - rx * ix), mz = (fz * iy - rz * ix); const ml = Math.hypot(mx, mz) || 1; mx /= ml; mz /= ml;
    if (P.ferry) { lake.ferryRide(P); if (lake.ferry.arrived) { lake.ferry.arrived = null; const st = lake.ferryOff(P); P.ferry = false; toast = st.label.toUpperCase(); toastT = 3; lastEmit = 0; } }
    else if (P.boat) lake.drive(dt, ix, iy, P);
    else if (P.skate) { if (yards.skate(dt, ix, iy, P, ground, vBlock) === 'water') yards.off(P); }
    else if (P.tank) yards.tankDrive(dt, ix, iy, P, vBlock);
    else if (P.car) driveMove(dt, ix, iy);
    else if (P.ab) {
      const F = T.carF[P.ab.car], cy = Math.cos(F.yaw), sy = Math.sin(F.yaw);
      if (P.ab.sit) { P.sp = 0; if (im > 0.4) api.stand(); }
      else { const lmx = mx * cy - mz * sy, lmz = mx * sy + mz * cy; P.sp = damp(P.sp, 3 * im, 10, dt);
        if (im > 0.05) { const ty = Math.atan2(lmx, lmz); P.ab.yaw += Math.atan2(Math.sin(ty - P.ab.yaw), Math.cos(ty - P.ab.yaw)) * Math.min(1, dt * 10); }
        const r = T.moveInCar(P.ab, P.ab.x + Math.sin(P.ab.yaw) * P.sp * dt, P.ab.z + Math.cos(P.ab.yaw) * P.sp * dt);
        if (r.exit) { const yw = T.carF[P.ab.car].yaw + P.ab.yaw; P.ab = null; P.x = r.exit.x; P.z = r.exit.z; P.y = T.PLAT_Y; P.yaw = yw; T.setView(null); } }
      if (P.ab) { const w = T.toWorldCar(P.ab.car, P.ab.x, P.ab.z); P.x = w.x; P.z = w.z; P.y = w.y - (P.ab.sit ? 0.3 : 0); P.yaw = T.carF[P.ab.car].yaw + P.ab.yaw; P.vy = 0; P.ground = true; P.swim = false; }
    } else if (!bowl.drive(dt, P, fox, stick)) walkMove(dt, im, mx, mz);
    fox.visible = !(P.ab && P.ab.sit) && !P.car && !P.tank; fox.position.set(P.x, P.y + (P.skate ? yards.skateLift() : 0), P.z); fox.rotation.y = P.yaw + (P.skate ? Math.PI / 2 * 0.85 : 0); kit.animFox(fox, dt, P.boat || P.ferry || P.skate ? 0 : P.swim ? P.sp * 0.6 : P.wade ? P.sp * 0.7 : P.sp, !P.ground && !P.wade); swimPose(dt);
    bowl.pose(fox);
    walkers.tick(dt, P, false);
    { const r = life.tick(dt, now / 1000, P, fox, on && !P.car && !P.boat && !P.ferry && !P.ab && !P.skate && !P.tank && !city.inside && !law.jail()); if (r.playerDown) { const s = life.safePoint(P.x, P.z); Object.assign(P, { x: s[0], z: s[1], vy: 0 }); P.y = ground(P.x, P.z, 0).h; const lost = Math.floor((save.data.gold || 0) * DEFEAT.carried); if (lost > 0) save.addGold(-lost); toast = 'KNOCKED OUT · BACK ON THE PATH' + (lost > 0 ? ' · DROPPED ' + lost + ' GOLD' : '') + ((save.stat('meru2Bank', 0) || 0) > 0 ? ' · BANK GOLD IS SAFE' : ''); toastT = 4; lastEmit = 0; } }
    cellar.tick(camera.position); backrooms.tick(camera.position, dt, now / 1000, P);
    rescue.tick(dt, P, on && !P.ab && !city.inside && !law.jail());
    // footsteps by surface
    const inside = city.inside, gh = ground(P.x, P.z); surface = P.ab ? 'rug' : inside ? (inside.room ? inside.room.floor : 'stone') : lake.surfaceAt(P.x, P.z, P.y) || HZ.surfaceAt(P.x, P.z, P.y) || (gh.water ? 'water' : gh.h > 0.5 ? 'grass' : L.surfaceAt(P.x, P.z)); if (P.ground && P.sp > 0.5 && !P.car && !P.boat && !P.ferry && !P.skate && !P.tank) { P.stepPh += dt * P.sp / 0.75; if (P.stepPh >= 1) { P.stepPh -= 1; step(surface); } } else P.stepPh = 0.6;
    // zone + voice trigger test (one greeting at a time) + NOW HIRING hotspot
    const z2 = zoneAt(P.x, P.z); if (z2 !== zone) { zone = z2; toast = z2 ? z2.label.toUpperCase() + ' · music: ' + z2.music : ''; toastT = 2.5; }
    ai = sound.tick(dt, { x: P.x, y: P.y, z: P.z, camYaw: CAM.yaw, zone, inside: city.inside ? city.inside.key : null, aboard: !!P.ab, night: B.time ? B.time() > 0.45 : false }); voice = ai.voice;
    hire = hires.find(h => Math.hypot(P.x - h.x, P.z - h.z) < 2.8) || null;
    for (const h of hires) if (city.keys.has(h.b.key)) continue; else if (!h.near && Math.hypot(P.x - h.b.door[0], P.z - h.b.door[1]) < 2.5) { h.near = true; chime(); } else if (h.near && Math.hypot(P.x - h.b.door[0], P.z - h.b.door[1]) > 4) h.near = false;
    rooms.tick(dt, now / 1000, P, fox, camera.position); rooms2.tick(dt, now / 1000, camera.position); apts.tick(dt, P, pentKey(), camera.position); halls.tick(dt, camera.position); barracks.tick(dt, P, camera.position); lake.tick(dt, now / 1000, P, night); yards.tick(dt, now / 1000, P, night);
    { const J = law.jail(), r = civic.tick(dt, P, escaping && !!J);
      if (J && !escaping) { J.left -= dt; jailSave += dt; if (jailSave > 2) { jailSave = 0; save.setStat('meru2Jail', { ...J }); } if (J.left <= 0) { law.release(); freeAt('TIME SERVED · YOU ARE FREE'); } else if (!civic.inJail(P)) toCell(); P.jailLeft = J.left; }
      if (r === 'caught') { J.left += 30; save.setStat('meru2Jail', { ...J }); toCell(); toast = 'CAUGHT · +30 S'; toastT = 3; }
      if (r === 'free') { law.release(); law.addFine('escape'); escaping = false; toast = 'YOU GOT OUT · ESCAPE FINE ADDED'; toastT = 3.5; } }
    civicSpot = !P.ab && !P.car && !P.boat && !P.ferry && !P.skate && !P.tank && !law.jail() ? allSpots.find(q => Math.hypot(P.x - q.x, P.z - q.z) < q.r && (q.y ? P.y >= q.y[0] && P.y <= q.y[1] : P.y < 1)) || null : null;
    talkNear = null; if (!P.ab && !P.car && !P.boat && !P.ferry && !P.tank) { let bd = 9; for (const t of talkers) { const o = t.obj.position, d = Math.hypot(P.x - o.x, P.z - o.z); if (d < (t.r || 2.6) && d < bd && Math.abs(P.y - o.y) < 2) { bd = d; talkNear = t; } } }
    if (dlg) { const o = dlg.t.obj.position; if (Math.hypot(P.x - o.x, P.z - o.z) > (dlg.t.r || 2.6) + 2) { dlg.t.obj.rotation.y = dlg.t.ry; dlg = null; lastEmit = 0; } else { const ty = Math.atan2(P.x - o.x, P.z - o.z), r = dlg.t.obj.rotation; r.y += Math.atan2(Math.sin(ty - r.y), Math.cos(ty - r.y)) * Math.min(1, dt * 6); } }
    seatNear = P.ab && !P.ab.sit ? T.nearSeat(P.ab) : null; machine = !P.ab ? T.nearMachine(P.x, P.z, P.y) : null;
    if (!P.ferry && lake.ferry.arrived) lake.ferry.arrived = null;
    const fNear = !P.ferry && !P.boat && !P.car && !P.ab ? lake.nearFerry(P) : null, fP = P.ferry ? (lake.ferry.phase === 'dwell' ? 'GET OFF THE FERRY' : null) : fNear ? 'BOARD THE FERRY \u00b7 TO ' + lake.ferryStatus().next.toUpperCase() : null;
    const bP = fP ? fP : P.boat ? (lake.nearGate() ? 'START \u00b7 ' + lake.gate.label : Math.abs(lake.boat.speed) < 3 ? 'GET OUT' : null) : !P.car && !P.ab ? (lake.nearClimb(P) ? 'CLIMB OUT' : lake.nearBoat(P) ? (P.swim ? 'CLIMB ABOARD' : 'DRIVE THE SPEEDBOAT \u00b7 FREE') : null) : null;
    const yP = !P.car && !P.boat && !P.ferry && !P.ab && !law.jail() ? yards.prompt(P) : null;
    prompt = dlg ? null : bowl.active() ? bowl.prompt() : rescue.canGrab(P) ? 'GRAB \u00b7 HELP THEM' : talkNear && !civicSpot ? 'TALK \u00b7 ' + TALK[talkNear.key].name.toUpperCase() : law.jail() && !escaping ? (civic.nearCellDoor(P) ? 'PICK THE LOCK' : null) : civicSpot ? civicSpot.prompt : yP ? yP : bP ? bP : P.car ? (Math.abs(CAR.speed) < 2 ? (inLot() ? 'GET OUT · RETURN THE CAR' : 'GET OUT') : null) : P.ab && P.ab.sit ? 'STAND UP' : seatNear ? 'SIT DOWN' : machine ? 'TRAIN TICKETS · FAST TRAVEL' : nearCar() ? 'DRIVE' : nearDesk() ? 'CAR RENTAL' : null;
    { const plat = P.ab ? null : T.onPlatform(P.x, P.z, P.y); if (plat) visit(plat); if (P.ferry || fNear || (!P.ab && !plat && !machine && Math.hypot(P.x - 160, P.z - 240) < 26)) { const q = lake.ferryStatus(); trainTxt = q.at ? 'FERRY AT ' + q.at.toUpperCase() + ' \u00b7 LEAVES IN ' + q.leaves + ' S \u00b7 NEXT ' + q.next.toUpperCase() : 'FERRY TO ' + q.to.toUpperCase() + ' \u00b7 ' + q.eta + ' S'; } else if (P.ab || plat || machine) { const q = T.status(); trainTxt = q.phase === 'dwell' ? 'TRAIN AT ' + q.at.label.toUpperCase() + ' · LEAVES IN ' + q.t + ' S · NEXT ' + q.next.label.toUpperCase() : 'NEXT STOP ' + q.next.label.toUpperCase() + ' · ' + q.t + ' S'; } else trainTxt = ''; }
    // camera: stable follow distance (sound note 4), behind the player, eases back after a drag
    CAM.drag -= dt; if (CAM.drag <= 0 && P.sp > 0.6) CAM.yaw += Math.atan2(Math.sin(P.yaw + Math.PI - CAM.yaw), Math.cos(P.yaw + Math.PI - CAM.yaw)) * Math.min(1, dt * (P.car || P.boat || P.ferry || P.tank || P.skate ? 3 : 1.6));
    { const ch = !P.car && !P.boat && !P.ab && !P.tank && !P.skate ? HZ.camAt(P) : null; if (ch) CAM.yaw += Math.atan2(Math.sin(ch.yaw - CAM.yaw), Math.cos(ch.yaw - CAM.yaw)) * Math.min(1, dt * 5); }   // lighthouse stair: camera outside the tower
    if (P.car || P.tank) { const d = P.tank ? 11 : 8.5, pt = P.tank ? 0.42 : 0.3, c2 = Math.cos(pt); camera.position.set(P.x + Math.sin(CAM.yaw) * c2 * d, 1.2 + Math.sin(pt) * d, P.z + Math.cos(CAM.yaw) * c2 * d); camera.lookAt(P.x, 1.2, P.z); }
    else if (P.boat || P.ferry) { const d = P.ferry ? Math.max(12, CAM.dist + 3) : Math.max(9, CAM.dist + 1), pt = Math.max(0.24, Math.min(CAM.pitch, 0.6)), c2 = Math.cos(pt); camera.position.set(P.x + Math.sin(CAM.yaw) * c2 * d, 1.4 + Math.sin(pt) * d, P.z + Math.cos(CAM.yaw) * c2 * d); camera.lookAt(P.x, 1.4, P.z); }
    else if (P.ab && P.ab.sit) { const k = P.ab.car, sd = Math.sign(P.ab.x) || 1, ang = Math.atan2(sd * 9, 4) + CAM.sy, h = T.toWorldCar(k, P.ab.x * (ride ? 0.8 : 0.35), P.ab.z + (ride ? 0.2 : 0.45)), lk = T.toWorldCar(k, P.ab.x + Math.sin(ang) * 9, P.ab.z + Math.cos(ang) * 9); camera.position.set(h.x, T.PLAT_Y + (ride ? 1.62 : 1.5) * (T.K || 1), h.z); camera.lookAt(lk.x, T.PLAT_Y + (0.9 + CAM.sp * 6) * (T.K || 1), lk.z); T.setView({ sit: true, camSide: 0 }); }
    else { const high = !P.ab && P.y > 6 && !HZ.onTerrain(P.x, P.z, P.y) && !(islandAt(P.x, P.z) > 0.5 && Math.abs(islandAt(P.x, P.z) - P.y) < 0.6), dist = P.ab ? Math.min(CAM.dist, 4.2) : high ? Math.min(CAM.dist, 6) : city.inside ? Math.min(CAM.dist, P.y > 5 ? 4.5 : 6.5) : CAM.dist, cp = Math.cos(high ? Math.min(CAM.pitch, 0.22) : CAM.pitch), tgt = V3(P.x, P.y + 1.4, P.z); camera.position.set(P.x + Math.sin(CAM.yaw) * cp * dist, P.y + 1.4 + Math.sin(high ? Math.min(CAM.pitch, 0.22) : CAM.pitch) * dist, P.z + Math.cos(CAM.yaw) * cp * dist); camera.lookAt(tgt);
      { const th = Math.max(HZ.terrainAt(camera.position.x, camera.position.z), islandAt(camera.position.x, camera.position.z)) + 1.2; if (camera.position.y < th) { camera.position.y = th; camera.lookAt(tgt); } }
      if (P.ab) { const F = T.carF[P.ab.car], lx = (camera.position.x - F.x) * Math.cos(F.yaw) - (camera.position.z - F.z) * Math.sin(F.yaw); T.setView({ sit: false, camSide: Math.abs(lx) > 1.3 * (T.K || 1) ? Math.sign(lx) : 0 }); } }
    rooms.camFix(camera, P, dt); bowl.camFix(camera, P, dt);   // tavern darts: over-the-shoulder view of the board
    toastT -= dt; if (toastT <= 0) toast = '';
    emit(); }
  let lastEmit = 0; function emit() { const n = performance.now(); if (n - lastEmit < 120) return; lastEmit = n; onState(api.hud()); }

  const api = {
    enter(n) { on = true; yards.off(P); P.boat = false; P.ferry = false; lake.ferry.rider = false; night = !!n; if (law.jail()) toCell(); fox.visible = true; audio(); city.player = P; T.player = P; HZ.player = P; city.onChime = chime; B.setDriver(frame); emit(); }, exit() { on = false; yards.off(P); sound.stopAll(); if (P.boat) { lake.park(); P.boat = false; } fox.visible = false; city.player = null; T.player = null; HZ.player = null; P.ab = null; T.setView(null); B.setDriver(null); keys.clear(); stick.x = stick.y = 0; },
    hud: () => ({ dialog: dlgHud(), ride: !!ride, place: city.inside ? city.inside.label + ' · inside' : (zone ? zone.label : 'Meru') + (zone ? ' [' + zone.key + ']' : ''), night, music: ai.music || (zone ? zone.music : ''), audioRoom: ai.room, leak: ai.leak, surface, swim: P.swim, breath: P.swim ? Math.round(P.breath / SWIM.BREATH * 100) : null, toast: toast || bowl.toast() || rescue.toast() || rooms.toast() || yards.toast(), voice: voice || null, prompt, jail: law.jail() ? { left: Math.max(0, Math.ceil(law.jail().left)), escaping, bail: law.jail().bail } : null, owed: law.owed(), train: trainTxt, vehicle: P.skate ? 'skate' : P.tank ? 'tank' : P.boat ? 'speedboat' : P.car ? 'car' : P.swim ? 'swim' : '', rented: rentOk(), aboard: !!P.ab, sitting: !!(P.ab && P.ab.sit), outdoors: !P.ab && !P.car && !P.boat && !P.ferry && !P.skate && !P.tank && (P.y < 1 || HZ.outdoor(P.x, P.z, P.y) || (islandAt(P.x, P.z) > 0.5 && Math.abs(islandAt(P.x, P.z) - P.y) < 0.6)) && !city.inside, hire: hire ? { label: hire.b.label, game: hire.b.hiring.game, url: hire.b.hiring.url } : null, pos: [Math.round(P.x), Math.round(P.z)], hp: life.hp(), hpMax: life.max(), foes: life.foes() }),
    // Game HUD contract
    bowlOn() { return bowl.active(); },
    bowlGo() { if (law.jail()) return false; P.car = false; P.boat = false; P.ab = null; P.x = bowl.spot.x; P.z = bowl.spot.z; P.y = 0; P.vy = 0; P.ground = true; P.swim = false; bowl.begin(P); lastEmit = 0; return true; },
    start() {}, setStick(x, y) { stick.x = x; stick.y = y; }, jump() { if (bowl.active()) { bowl.quit(); lastEmit = 0; return; } if (P.ferry) return; if (yards.btn.three(P)) { lastEmit = 0; return; } if (P.boat) { lake.nitro(); return; } if (P.car) { CAR.brake = true; return; } if (P.ab) return; if (P.swim) { if (P.dive > 0) P.dive = 0; else if (rescue.carrying()) { toast = 'NO DIVING WHILE YOU CARRY SOMEONE'; toastT = 1.5; } else if (P.breath < 15) { toast = 'CATCH YOUR BREATH FIRST'; toastT = 1.5; } else { P.dive = 1; lake.splash(0.05); } lastEmit = 0; return; } if (P.ground) { P.vy = 7.5; P.ground = false; P.y += 0.05; } }, jumpUp() { CAR.brake = false; },
    talk() { if (bowl.active()) { bowl.press(); lastEmit = 0; return; } if (dlg) { dlgNext(); return; } if (talkNear && !civicSpot) { dlg = { t: talkNear, i: 0 }; lastEmit = 0; emit(); return; } const J = law.jail(); if (J && !escaping) { if (civic.nearCellDoor(P)) { paused = true; onPick(); } return; } if ((P.skate || P.tank) && yards.talk(P)) { lastEmit = 0; return; } if (boatTalk()) return; if (!P.car && !P.ab && !civicSpot && yards.talk(P)) { lastEmit = 0; return; } if (civicSpot && civicSpot.key.startsWith('elev:')) { paused = true; onCivic(civicSpot.key); return; }
      if (civicSpot && civicSpot.key.startsWith('pent:')) { const k = civicSpot.key.slice(5); if (pentKey() === k) { toast = 'THE PENTHOUSE IS YOURS TONIGHT · FLOOR 2'; toastT = 3; } else if (save.spend(10)) { save.setStat('meru2Pent', { key: k, day: save.stat('meru2Day', 1) }); toast = 'PENTHOUSE RENTED · ROOM 204 · FLOOR 2'; toastT = 3.5; } else { toast = 'NOT ENOUGH CR'; toastT = 2; } lastEmit = 0; return; }
      if (civicSpot && civicSpot.key.startsWith('sleep:')) { night = false; B.setNight(false); const d = law.nextDay(); save.setStat('meru2Pent', { key: civicSpot.key.slice(6), day: d }); toast = 'GOOD MORNING · DAY ' + d; toastT = 3; lastEmit = 0; return; }
      if (civicSpot && civicSpot.use) { civicSpot.use(P); lastEmit = 0; return; }
      if (civicSpot) { paused = true; if (civicSpot.play) onHire({ label: civicSpot.play.label, hiring: { url: civicSpot.play.url }, play: true }); else onCivic(civicSpot.key); return; } if (P.car) { getOut(); return; } if (P.ab) { if (P.ab.sit) api.stand(); else if (seatNear) api.sit(seatNear); return; } if (machine) { onTicket(machine.st); return; } if (nearCar()) { getIn(); return; } if (nearDesk()) { onRental(); return; } if (hire) { paused = true; onHire(hire.b); } },
    sit(q) { if (!P.ab) return; P.ab.sit = q; P.ab.x = q.x; P.ab.z = q.z; P.ab.yaw = 0; CAM.sy = 0; CAM.sp = 0; lastEmit = 0; emit(); }, stand() { if (!P.ab || !P.ab.sit) return; P.ab.x = Math.sign(P.ab.x) * 0.45; P.ab.sit = null; T.setView(null); lastEmit = 0; emit(); },
    travel(key, mode) { const q = T.placeAt(key, mode); if (!q || P.car || P.ferry || law.jail()) return false; yards.off(P); if (P.boat) { lake.park(); P.boat = false; } P.ab = null; T.setView(null); P.x = q.x; P.z = q.z; P.y = q.y; P.vy = 0; P.yaw = q.yaw; CAM.yaw = q.yaw + Math.PI; if (mode === 'train') visit(T.stops.find(s => s.key === key)); paused = false; lastEmit = 0; emit(); return true; },
    pos: () => ({ x: P.x, z: P.z, y: P.y }), law,
    tp(x, z, y = 0, yaw) { yards.off(P); if (P.boat) lake.park(); lake.ferry.rider = false; Object.assign(P, { x, z, ab: null, car: false, boat: false, ferry: false, vy: 0 }); P.y = ground(x, z, y).h; if (yaw != null) { P.yaw = yaw; CAM.yaw = yaw + Math.PI; } lastEmit = 0; },   // test hook
    elevator(key, f) { const q = apts.elevTo(key, f); if (!q) return; Object.assign(P, { x: q.x, z: q.z, y: q.y, vy: 0, yaw: q.yaw }); CAM.yaw = q.yaw + Math.PI; paused = false; lastEmit = 0; }, shop: { STOCK, ITEM_LABELS, buy: (k, key) => buy(save, k, key) },
    arrest(kind) { law.jailUp(kind); toCell(); toast = 'ARRESTED · ' + kind.toUpperCase(); toastT = 3; lastEmit = 0; emit(); },
    pickDone(ok) { paused = false; if (ok) { civic.unlock(); escaping = true; toast = 'THE CELL IS OPEN · SNEAK PAST THE GUARD'; toastT = 4; } lastEmit = 0; },
    bailOut() { if (!law.bail()) return false; freeAt('BAIL PAID · YOU ARE FREE'); paused = false; return true; }, ticketOk: () => ticketOk(), melee() { if (bowl.active()) return; if (P.ferry) return; if (yards.btn.one(P)) return; if (P.boat) { lake.horn(); return; } if (P.swim && !P.ab) { if (rescue.grab(P)) { lastEmit = 0; return; } if (!boatTalk()) lake.splash(0.1); return; } if (P.car) { horn(); return; } if (hire) { paused = true; onHire(hire.b); return; } if (!P.ab && !law.jail()) life.attack('melee', P, fox); }, meleeUp() {}, range() { if (bowl.active()) return; if (P.ferry) return; if (yards.btn.two(P)) return; if (P.boat) { lake.powerTurn(); return; } if (P.swim && !P.ab) { if (!P.kickCd) { P.kick = LS.kickT; P.kickCd = SWIM.KICK_CD; P.sp = Math.max(P.sp, SW.kick); lake.splash(0.08); } return; } if (P.car) { CAR.lights = !CAR.lights; placeCar(); return; } if (!P.ab && !law.jail()) life.attack('range', P, fox); }, rangeUp() {},
    rent() { if (rentOk() || !save.spend(RENT.day)) return false; save.setStat('meru2Rental', { until: day() }); save.setStat('meru2RentalCar', null); Object.assign(CAR, BAY, { speed: 0 }); placeCar(); return true; },
    lookBy(dx, dy = 0) { if (P.ab && P.ab.sit) { CAM.sy = clamp(CAM.sy - dx * 0.006, -1.2, 1.2); CAM.sp = clamp(CAM.sp + dy * 0.003, -0.5, 0.5); return; } CAM.yaw -= dx * 0.008; CAM.pitch = clamp(CAM.pitch + dy * 0.004, 0.08, 1.2); CAM.drag = 1.5; }, eyeLook(dx, dy) { api.lookBy(dx, dy); }, eyeRelease() {}, zoomBy(f) { CAM.dist = clamp(CAM.dist * f, 5, 16); },
    getCam: () => ({ dist: CAM.dist, pitch: CAM.pitch }), setCam(c) { if (c && c.dist) CAM.dist = clamp(c.dist, 5, 16); }, togglePov() {},
    mapData: () => ({ p: [P.x, P.z, P.yaw], indoor: false, b: L.BUILDINGS.map(b => [b.label, (b.f[0] + b.f[1]) / 2, (b.f[2] + b.f[3]) / 2]), f: [], e: [], q: rescue.marker() }),
    setMinimap() {}, setPaused(v) { paused = !!v; }, setHudPad() {}, toggleSound() { if (HARD_MUTE) return true; muted = !muted; return muted; }, cycleWeather() {}, skipTime() { night = !night; B.setNight(night); if (!night) { const d = law.nextDay(); toast = 'DAY ' + d; toastT = 2.5; } lastEmit = 0; emit(); }, clearToast() { toast = ''; },
    ambient(dt) { const t = performance.now() / 1000; rooms.tick(dt, t, P, fox, camera.position); rooms2.tick(dt, t, camera.position); },   // tour: keep the interiors alive (Dash, keepers, wheel) while the fly camera visits
    rideStart, rideStop() { rideEnd('RIDE STOPPED'); }, riding: () => !!ride,
    useItem() {}, closeWheel() {}, choose() {}, closeDialog() { if (dlg) { dlg.t.obj.rotation.y = dlg.t.ry; dlg = null; lastEmit = 0; emit(); } }, nextLine() { dlgNext(); },
    destroy() { removeEventListener('keydown', kd); removeEventListener('keyup', ku); scene.remove(fox); },
  };
  window.__meru2Walk = api; api._life = life; api._lake = lake; api._yards = yards; api.sound = sound; api.say = (k, u) => sound.say(k, u); api._frame = frame;   // test hook (tp, pos, life.debug)
  return api;
}
