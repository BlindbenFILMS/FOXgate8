// MERU 2.0 — BATTLE GATES (s150p, Ben): glowing old-stone gate rings on the edges of town. Each AREA has 2 gates and a fenced box of open
// ground per gate: what comes out roams ONLY inside its box (may chase you onto a path briefly, then goes home). Max alive per area (cap,
// shared by its gates, +2 at night); a new one steps out 10 s after a kill (6 s at night). Beat a wave (cap kills in the area) → the gates
// glow gold: hit one (melee next to it) to SEAL it for the day: + gold + XP. Easy fights (low hp + damage).
// Edit: Gate Workshop.dc.html (localStorage meru2.gates.v1) or DEFAULT_GATES below. kind: creature | bandit | robot | mix (creature + bandit).
// s172 (Ben: "remove any previously placed gates, begin placement from scratch"): no default gates. The old 4 (ruinsN1/N2 mix, park1/2 robot)
// are in backup/curbs/meru2-gates.pre-fresh.js. Gates now come only from the Gate Workshop save.
// s172 (Ben): WEST SIDE WILDS — creatures from Tony's Park entrance, round the desert + Ruins Hills, up through the farms + the Castle Path to
// Castle Ridge, + a few on Pearl Island. East side = later. Boxes sit beside the paths: foes WANDER off the path (band 9 m) but CHASE onto it
// once engaged, and spot you (aggro 9 m) even when you are on the path.
export const DEFAULT_GATES = [   // s172: Ben's resized boxes (Gate Workshop)
  { id: 'tonysW', area: 'tonys', kind: 'creature', x: -346, z: -46, w: 131, d: 78 },
  { id: 'tonysN', area: 'tonys', kind: 'creature', x: -230, z: -211, w: 173, d: 57 },
  { id: 'desertN', area: 'desert', kind: 'creature', x: -510, z: -27, w: 147, d: 86 },
  { id: 'desertS', area: 'desert', kind: 'creature', x: -428, z: 52, w: 192, d: 86 },
  { id: 'ruinsHills', area: 'hills', kind: 'creature', x: -370, z: -130, w: 179, d: 106 },
  { id: 'farmWest', area: 'farms', kind: 'creature', x: -57, z: -200, w: 101, d: 110 },
  { id: 'farmPasture', area: 'farms', kind: 'creature', x: -77, z: -305, w: 132, d: 68 },
  { id: 'castlePath', area: 'farms', kind: 'creature', x: -42, z: -360, w: 61, d: 53 },
  { id: 'ridgeSouth', area: 'castle', kind: 'creature', x: -196, z: -304, w: 125, d: 86 },
  { id: 'ridgeEast', area: 'castle', kind: 'creature', x: -164, z: -406, w: 84, d: 70 },
  { id: 'ridgeWest', area: 'castle', kind: 'creature', x: -339, z: -343, w: 131, d: 86 },
  { id: 'pearlNorth', area: 'pearl', kind: 'creature', x: 0, z: 345, w: 68, d: 38 },
  { id: 'pearlSW', area: 'pearl', kind: 'creature', x: -28, z: 412, w: 47, d: 48 },
  { id: 'pearlSE', area: 'pearl', kind: 'creature', x: 32, z: 408, w: 61, d: 45 },
];
export const DEFAULT_AREAS = { tonys: { label: "TONY'S PARK WILDS", cap: 4 }, desert: { label: 'DESERT WILDS', cap: 4 }, hills: { label: 'RUINS HILLS', cap: 3 }, farms: { label: 'FARM FIELDS', cap: 5 }, castle: { label: 'CASTLE RIDGE', cap: 4 }, pearl: { label: 'PEARL ISLAND', cap: 3 }, park: { label: 'HILL PARK', cap: 4 } };
export const GATES_KEY = 'meru2.gates.v1';
export function loadGates() { try { const j = JSON.parse(localStorage.getItem(GATES_KEY) || 'null'); if (j && Array.isArray(j.gates)) return { gates: j.gates, areas: { ...DEFAULT_AREAS, ...(j.areas || {}) } }; } catch (e) {} return { gates: DEFAULT_GATES.map(g => ({ ...g })), areas: { ...DEFAULT_AREAS } }; }

export function buildGates({ THREE, scene, M, toon, kit, CB, CV, HZ, move, save, night = () => false, L = null, cols = [], offPath = () => true }) {
  const { gates: GD, areas: AR } = loadGates(), Y = (x, z) => (HZ && HZ.terrainAt ? HZ.terrainAt(x, z) : 0);
  const day = () => { const d = new Date(); return d.getFullYear() * 1000 + Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); };
  const sealedKey = id => 'gateSeal_' + id, isSealed = id => { try { return save.stat(sealedKey(id), 0) === day(); } catch (e) { return false; } };
  // toast (Modernist strip, top centre)
  const tst = document.createElement('div'); tst.style.cssText = 'position:fixed;left:50%;top:96px;transform:translateX(-50%);z-index:40;background:#201e1d;color:#f3f2f2;border:2px solid #ffd23a;font:800 14px Archivo,sans-serif;letter-spacing:.06em;padding:8px 14px;display:none;pointer-events:none;white-space:nowrap'; document.body.appendChild(tst); let tstT = 0;
  const toast = (t, s = 2.4) => { tst.textContent = t; tst.style.display = 'block'; tstT = s; };
  const stone = toon('#7d7468'), stoneD = toon('#4f4840'), rune = c => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
  const G = GD.map(g => { const root = new THREE.Group(), y = Y(g.x, g.z); root.position.set(g.x, y, g.z); scene.add(root);
    const ring = new THREE.Group(); ring.position.y = 1.7; root.add(ring); M(new THREE.TorusGeometry(1.45, 0.28, 10, 28), stone, 0, 0, 0, ring, 0.03);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; M(new THREE.BoxGeometry(0.3, 0.3, 0.62), stoneD, Math.cos(a) * 1.45, Math.sin(a) * 1.45, 0, ring, 0.02).rotation.z = a; }
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1.2, 32), new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })); ring.add(disc);
    const swirl = new THREE.Mesh(new THREE.RingGeometry(0.2, 1.15, 32, 1, 0, Math.PI * 1.3), new THREE.MeshBasicMaterial({ color: 0xe9d5ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })); swirl.position.z = 0.01; ring.add(swirl);
    for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.5, 1.6, 0.6), stone, s * 1.3, 0.8, 0, root, 0.03);
    M(new THREE.CylinderGeometry(1.9, 2.1, 0.2, 20), stoneD, 0, 0.1, 0, root, 0.02);
    // the box's 4 corner rune stones (the patrol fence, readable from afar)
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const px = g.x + sx * g.w / 2, pz = g.z + sz * g.d / 2, st = new THREE.Group(); st.position.set(px, Y(px, pz), pz); scene.add(st); M(new THREE.BoxGeometry(0.35, 1.1, 0.35), stone, 0, 0.55, 0, st, 0.02); M(new THREE.BoxGeometry(0.37, 0.12, 0.37), rune(0x8b5cf6), 0, 0.85, 0, st, 0); }
    // s172 POLISH: a faint LIGHT COLUMN over each gate, readable from afar (purple = open, gold = ready to seal, off = sealed)
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.4, 26, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false, fog: false }));
    beam.position.y = 14; beam.userData.isSign = true; beam.userData.noSign = false; root.add(beam);
    return { g, root, ring, disc, swirl, beam, kills: 0, cd: 2 + Math.random() * 3, foes: [], sealed: isSealed(g.id) }; });
  // ---- enemies ----
  const EASY = { creature: { hp: 30, dmg: 5, speed: 3.2, cd: 1.7, wind: 0.55 }, bandit: { hp: 45, dmg: 6, speed: 3.0, cd: 1.8, wind: 0.6 }, robot: { hp: 50, dmg: 5, speed: 2.4, cd: 2.4, wind: 0.8, ranged: true } };
  const greyM = toon('#8a8f97'), darkM = toon('#2a2d33'), eyeM = rune(0xff3a20);
  function makeRobot() { const c = new THREE.Group(); scene.add(c); const body = new THREE.Group(); body.position.y = 0.55; c.add(body); M(new THREE.BoxGeometry(0.62, 0.5, 0.5), greyM, 0, 0.25, 0, body, 0.025); M(new THREE.BoxGeometry(0.46, 0.32, 0.4), greyM, 0, 0.68, 0, body, 0.02); M(new THREE.BoxGeometry(0.3, 0.07, 0.02), eyeM, 0, 0.7, 0.205, body, 0); M(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 6), darkM, 0.12, 0.96, 0, body, 0);
    const legs = [-1, 1].map(s => { const l = new THREE.Group(); l.position.set(s * 0.18, 0.55, 0); c.add(l); M(new THREE.BoxGeometry(0.14, 0.5, 0.16), darkM, 0, -0.27, 0, l, 0.015); return l; });
    let t = Math.random() * 9; return { c, opts: EASY.robot, anim: (dt, spd) => { t += dt; const k = Math.min(1, spd / 2); legs[0].rotation.x = Math.sin(t * 9) * 0.5 * k; legs[1].rotation.x = -Math.sin(t * 9) * 0.5 * k; body.position.y = 0.55 + Math.abs(Math.sin(t * 9)) * 0.04 * k; } }; }
  function makeBandit(i) { const f = kit.makeFox({ key: 'gateBandit' + i, name: 'Bandit', outfit: 'vest', torso: ['#2b2b30', '#171719', '#08080a'], crest: '', gear: 'sword', mood: 'stern' }); scene.add(f); return { c: f, opts: EASY.bandit, anim: (dt, spd) => kit.animFox(f, dt, spd) }; }
  // s172 POLISH: each wild area has its own critters (desert SCORPIONS, farm CROWS, Pearl Island CRABS; bats + rats elsewhere)
  const KINDS = { desert: ['scorpion', 'scorpion', 'rat'], farms: ['crow', 'rat', 'crow'], pearl: ['crab', 'crab', 'bat'], castle: ['bat', 'rat', 'bat'] };
  const cm = {}, cmat = (k, hex, o) => cm[k] || (cm[k] = toon(hex, o));
  function critter(kind) { const c = new THREE.Group(); scene.add(c); c.userData = {}; const eye = cmat('eye', '#ff4d4d', { emissive: new THREE.Color('#ff2a2a'), emissiveIntensity: 1.2 });
    if (kind === 'scorpion') { const B = cmat('scB', '#b07a3c'), D = cmat('scD', '#6e4a22'); M(new THREE.SphereGeometry(0.3, 10, 7), B, 0, 0.2, 0, c, 0.02).scale.set(0.9, 0.45, 1.3);
      for (const s of [-1, 1]) { const arm = M(new THREE.BoxGeometry(0.08, 0.08, 0.36), D, s * 0.22, 0.2, 0.42, c, 0.01); arm.rotation.y = -s * 0.4; M(new THREE.BoxGeometry(0.16, 0.08, 0.14), B, s * 0.3, 0.2, 0.62, c, 0.01); for (let k = 0; k < 3; k++) M(new THREE.BoxGeometry(0.34, 0.04, 0.04), D, s * 0.3, 0.1, -0.12 + k * 0.16, c, 0); M(new THREE.SphereGeometry(0.035, 6, 4), eye, s * 0.07, 0.3, 0.36, c, 0); }
      const tail = new THREE.Group(); tail.position.set(0, 0.24, -0.34); c.add(tail); for (let k = 0; k < 4; k++) M(new THREE.SphereGeometry(0.09 - k * 0.01, 7, 5), B, 0, 0.12 + k * 0.14, -0.08 + k * 0.05, tail, 0.01); M(new THREE.ConeGeometry(0.05, 0.16, 6), D, 0, 0.66, 0.16, tail, 0).rotation.x = 1.9;
      return { c, opts: { hp: 26, dmg: 7, speed: 3.0, cd: 1.5, wind: 0.5, critter: true, reach: 1.4 }, anim: (t, spd) => { tail.rotation.x = Math.sin(t * (spd ? 8 : 2)) * 0.25; } }; }
    if (kind === 'crab') { const B = cmat('crB', '#e0552f'), D = cmat('crD', '#a8341c'); M(new THREE.SphereGeometry(0.3, 10, 7), B, 0, 0.22, 0, c, 0.02).scale.set(1.35, 0.5, 1);
      const claws = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(s * 0.36, 0.24, 0.22); c.add(w); M(new THREE.SphereGeometry(0.12, 8, 6), D, s * 0.08, 0, 0.08, w, 0.01).scale.set(1, 0.7, 1.3); return w; });
      for (const s of [-1, 1]) { for (let k = 0; k < 3; k++) { const l = M(new THREE.BoxGeometry(0.3, 0.04, 0.04), D, s * 0.42, 0.12, -0.14 + k * 0.12, c, 0); l.rotation.z = s * 0.5; } M(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 4), D, s * 0.08, 0.38, 0.18, c, 0); M(new THREE.SphereGeometry(0.035, 6, 4), cmat('ink', '#201e1d'), s * 0.08, 0.46, 0.18, c, 0); }
      return { c, opts: { hp: 20, dmg: 6, speed: 2.8, cd: 1.4, wind: 0.45, critter: true, reach: 1.3, side: true }, anim: (t, spd) => { claws.forEach((w, i) => { w.rotation.x = Math.sin(t * (spd ? 10 : 3) + i) * 0.35; }); } }; }
    if (kind === 'crow') { const B = cmat('cwB', '#1f1d22'), Y = cmat('cwY', '#e3a72a'); M(new THREE.SphereGeometry(0.2, 9, 7), B, 0, 0, 0, c, 0.02).scale.set(0.9, 0.85, 1.4); M(new THREE.SphereGeometry(0.13, 8, 6), B, 0, 0.1, 0.26, c, 0.02); M(new THREE.ConeGeometry(0.05, 0.16, 5), Y, 0, 0.08, 0.42, c, 0).rotation.x = Math.PI / 2;
      for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.03, 6, 4), eye, s * 0.07, 0.15, 0.36, c, 0); M(new THREE.BoxGeometry(0.2, 0.03, 0.26), B, 0, 0.02, -0.34, c, 0);
      const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.x = s * 0.14; c.add(w); const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.3), B); m.position.x = s * 0.3; w.add(m); return [w, s]; });
      return { c, opts: { hp: 16, dmg: 5, speed: 4.0, cd: 1.2, wind: 0.32, fly: 1.6, critter: true, reach: 1.4 }, anim: t => wings.forEach(([w, s]) => { w.rotation.z = s * Math.sin(t * 14) * 0.6; }) }; }
    return null; }
  function makeCreature(area) { const list = KINDS[area] || ['bat', 'rat'], kind = list[Math.floor(Math.random() * list.length)]; const m = critter(kind) || CV.makeCritter({ THREE, scene, M, toon }, { kind: kind === 'bat' ? 'bat' : 'rat' }); let t = Math.random() * 9; return { c: m.c, opts: { ...m.opts, ...EASY.creature, fly: m.opts.fly, hp: m.opts.hp || EASY.creature.hp }, anim: (dt, spd) => { t += dt; m.anim(t, spd); }, fly: m.opts.fly || 0 }; }
  let ni = 0;
  function spawn(q) { const kind = q.g.kind === 'mix' ? (Math.random() < 0.35 ? 'bandit' : 'creature') : q.g.kind, mk = kind === 'robot' ? makeRobot() : kind === 'bandit' ? makeBandit(ni) : makeCreature(q.g.area);
    const sp = spawnPt(q), n = { key: 'gate' + (ni++), x: sp[0], z: sp[1], face: 0, c: mk.c, speedNow: 0, home: [q.g.x, q.g.z] }, f = CB.add(n, { ...mk.opts, aggro: SIGHT }); f.solo = true;
    n.gateMove = (nx, nz) => { const ch = f.hostile, ok = (x, z) => okG(q, x, z, ch); if (ok(nx, nz)) { n.x = nx; n.z = nz; } else if (ok(nx, n.z)) n.x = nx; else if (ok(n.x, nz)) n.z = nz; };
    f.anim = (dt, spd) => { mk.anim(dt, spd); n.c.position.y = Y(n.x, n.z) + (mk.fly || 0) + (n.c.userData.P ? 0 : 0); };
    n.c.position.set(n.x, Y(n.x, n.z) + (mk.fly || 0), n.z); const e = { n, f, kind, wt: 0, tx: n.x, tz: n.z, downT: 0, pathT: 0 }; q.foes.push(e);
    for (let k = 0; k < 8; k++) burst(q); return e; }
  // spawn flash
  const sparks = []; const sparkM = new THREE.MeshBasicMaterial({ color: 0xc4b5fd, transparent: true, depthWrite: false, toneMapped: false });
  function burst(q) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), sparkM.clone()); m.position.set(q.g.x + (Math.random() - 0.5) * 2, q.root.position.y + 1.7 + (Math.random() - 0.5) * 2, q.g.z); scene.add(m); sparks.push({ m, v: new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 3, (Math.random() - 0.5) * 3), t: 0.8 }); }
  // s172: own movement (the Ruins wilds' move only works inside its own area): wander = in the box + off the path; chase = onto the path, up to LEASH past the box
  const SIGHT = 9, LEASH = 30, blockedG = (q, x, z) => { for (const c of q.cols) { if (c.on === false) continue; if (c.c) { if (Math.hypot(x - c.c[0], z - c.c[1]) < c.c[2] + 0.35) return true; } else { const f = c.f; if (x > f[0] - 0.35 && x < f[1] + 0.35 && z > f[2] - 0.35 && z < f[3] + 0.35) return true; } } return false; };
  const wet = (x, z) => !!(L && L.lakeF && L.lakeF(x, z) < 1 && Y(x, z) < 0.15);
  // s172 NO-GO (Ben: keep the bigger boxes, the game keeps them out): Tony's Park, the train line (+5 m), past the map edge (-4 m),
  // 6 m round every building / farm barn, and the town (inside the ring road + its sidewalks). Applies to wandering AND chasing.
  const segD = (x, z, p) => { let m = 1e9; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); m = Math.min(m, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return m; };
  const TL = L && L.TRAIN && L.TRAIN.line ? [...L.TRAIN.line, L.TRAIN.line[0]] : null, PK = L && L.SKATEW && L.SKATEW.park, RING = [-170, 170, -150, 160];
  const BLD = L ? (L.BUILDINGS || []).filter(b => b.f && b.kind !== 'farm' && !b.selfBuilt && b.f[1] - b.f[0] < 120) : [];
  const BLDn = q => { const m = Math.max(q.g.w, q.g.d) / 2 + LEASH + 10; return BLD.filter(b => b.f[1] > q.g.x - m && b.f[0] < q.g.x + m && b.f[3] > q.g.z - m && b.f[2] < q.g.z + m); };
  const noGo = (q, x, z) => { if (L && L.outOfMap && L.outOfMap(x, z, 4)) return true; if (L && L.craterSD && L.craterSD(x, z) < 3) return true;   /* s184: never into the Pearl Valley crater */ if (PK && x > PK[0] - 3 && x < PK[1] + 3 && z > PK[2] - 3 && z < PK[3] + 3) return true;
    if (x > RING[0] && x < RING[1] && z > RING[2] && z < RING[3]) return true; if (q.trainNear && segD(x, z, TL) < 5) return true;
    for (const b of q.blds) if (x > b.f[0] - 6 && x < b.f[1] + 6 && z > b.f[2] - 6 && z < b.f[3] + 6) return true; return false; };
  const spawnPt = q => { if (okG(q, q.g.x, q.g.z + 1.6, true)) return [q.g.x, q.g.z + 1.6]; for (let r = 3; r < 30; r += 3) for (let a = 0; a < 6.28; a += 0.5) { const x = q.g.x + Math.cos(a) * r, z = q.g.z + Math.sin(a) * r; if (okG(q, x, z, false)) return [x, z]; } return [q.g.x, q.g.z + 1.6]; };
  const okG = (q, x, z, chase) => inBox(q, x, z, chase ? LEASH : 2) && !wet(x, z) && !noGo(q, x, z) && !blockedG(q, x, z) && (chase || offPath(x, z));
  for (const q of G) { const m = Math.max(q.g.w, q.g.d) / 2 + LEASH + 4; q.blds = BLDn(q); q.trainNear = !!TL && segD(q.g.x, q.g.z, TL) < m + 6; q.cols = cols.filter(c => c.y0 == null && (c.c ? Math.abs(c.c[0] - q.g.x) < m && Math.abs(c.c[1] - q.g.z) < m : c.f && c.f[1] - c.f[0] < 200 && c.f[1] > q.g.x - m && c.f[0] < q.g.x + m && c.f[3] > q.g.z - m && c.f[2] < q.g.z + m)); }
  const inBox = (q, x, z, pad = 0) => Math.abs(x - q.g.x) <= q.g.w / 2 + pad && Math.abs(z - q.g.z) <= q.g.d / 2 + pad;
  const areaOf = a => G.filter(q => q.g.area === a);
  const AREA_IN = {}, AREA_T = {};
  function tick(dt, P, onPath, active) {
    if (tstT > 0 && (tstT -= dt) <= 0) tst.style.display = 'none';
    const nt = night(), t = performance.now() / 1000;
    for (const area of Object.keys(AR)) { const qs = areaOf(area); if (!qs.length) continue; const cap = (AR[area].cap || 4) + (nt ? 2 : 0), alive = qs.reduce((s, q) => s + q.foes.filter(e => !e.f.down).length, 0), live = qs.filter(q => !q.sealed);
      const near = qs.some(q => Math.hypot(P.x - q.g.x, P.z - q.g.z) < 110);
      if (near && alive < cap && live.length) { const q = live[Math.floor(t * 7) % live.length]; q.cd -= dt; if (q.cd <= 0) { q.cd = nt ? 6 : 10; const reuse = q.foes.find(e => e.f.down && e.downT > 1.5); if (reuse) { Object.assign(reuse.f, { down: false, hp: reuse.f.max, hostile: false, state: 'idle', t: 0 }); { const sp = spawnPt(q); reuse.n.x = sp[0]; reuse.n.z = sp[1]; } reuse.n.c.visible = true; reuse.n.c.rotation.x = 0; reuse.downT = 0; for (let k = 0; k < 8; k++) burst(q); } else spawn(q); } }
      const kills = qs.reduce((s, q) => s + q.kills, 0), ready = kills >= (AR[area].cap || 4);
      const wasReady = qs.some(q => q.ready); for (const q of qs) { q.ready = ready && !q.sealed; } if (!wasReady && qs.some(q => q.ready)) toast('THE GATES GLOW GOLD \u00b7 STRIKE ONE TO SEAL IT', 3.2);
      const inA = qs.some(q => inBox(q, P.x, P.z, 0)); if (inA && !AREA_IN[area] && (t - (AREA_T[area] || -1e9)) > 90) { AREA_T[area] = t; toast(((AR[area] && AR[area].label) || 'WILDS') + (live.length ? ' \u00b7 WATCH YOUR STEP' : ' \u00b7 QUIET TODAY'), 2.4); } AREA_IN[area] = inA; }
    for (const q of G) { q.swirl.rotation.z = t * (q.sealed ? 0 : 1.6); q.disc.material.color.setHex(q.sealed ? 0x3a3530 : q.ready ? 0xffd23a : 0x8b5cf6); q.disc.material.opacity = q.sealed ? 0.25 : 0.45 + 0.15 * Math.sin(t * 3); q.swirl.visible = !q.sealed; q.beam.visible = !q.sealed; q.beam.material.color.setHex(q.ready ? 0xffd23a : 0x8b5cf6); q.beam.material.opacity = (q.ready ? 0.3 : 0.13) * (nt ? 1.6 : 1) + 0.03 * Math.sin(t * 2 + q.g.x);
      for (const e of q.foes) { const { n, f } = e;
        if (f.down) { if (!e.counted) { e.counted = true; q.kills++; const a = q.g.area, need = (AR[a] && AR[a].cap) || 4, got = areaOf(a).reduce((s, x) => s + x.kills, 0); if (got < need) toast(((AR[a] && AR[a].label) || 'WILDS') + ' \u00b7 ' + got + ' / ' + need + ' DOWN', 1.6); } e.downT += dt; if (e.downT > 1.4) n.c.visible = false; continue; } e.counted = false;
        if (f.hostile) { if (!active || !inBox(q, n.x, n.z, LEASH - 1) || Math.hypot(P.x - n.x, P.z - n.z) > 28) { f.hostile = false; f.state = 'idle'; f.t = 0; } }   // s172: engaged = follows you onto the path
        else { e.wt -= dt; if (e.wt <= 0 || Math.hypot(e.tx - n.x, e.tz - n.z) < 0.8) { e.wt = 3 + Math.random() * 4; for (let k = 0; k < 8; k++) { const tx = q.g.x + (Math.random() - 0.5) * q.g.w * 0.9, tz = q.g.z + (Math.random() - 0.5) * q.g.d * 0.9; if (okG(q, tx, tz, false) || k === 7) { e.tx = tx; e.tz = tz; if (okG(q, tx, tz, false)) break; } } }
          const dx = e.tx - n.x, dz = e.tz - n.z, d = Math.hypot(dx, dz); if (d > 0.5) { const s = Math.min(d, f.speed * 0.35 * dt); n.gateMove(n.x + dx / d * s, n.z + dz / d * s); n.face = Math.atan2(dx, dz); }
          if (!inBox(q, n.x, n.z, 2)) { const hx = n.x + (q.g.x - n.x) * Math.min(1, dt * 0.6), hz = n.z + (q.g.z - n.z) * Math.min(1, dt * 0.6); if (!wet(hx, hz) && !noGo(q, hx, hz)) { n.x = hx; n.z = hz; } } /* walk home after a chase */ } } }
    for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.t -= dt; s.v.y -= 4 * dt; s.m.position.addScaledVector(s.v, dt); s.m.material.opacity = Math.max(0, s.t); if (s.t <= 0) { scene.remove(s.m); sparks.splice(i, 1); } } }
  // melee next to a ready gate seals it (reward); hit targets for CB.attack
  const hits = () => G.filter(q => q.ready).map(q => ({ x: q.g.x, z: q.g.z, r: 2.6, onHit: () => seal(q) }));
  function seal(q) { if (q.sealed || !q.ready) return; q.sealed = true; q.ready = false; try { save.setStat(sealedKey(q.g.id), day()); save.addGold(20); save.addXp && save.addXp(30); } catch (e) {} for (let k = 0; k < 24; k++) burst(q); toast('GATE SEALED FOR TODAY \u00b7 +20 GOLD \u00b7 +30 XP', 3);
    for (const e of q.foes) if (!e.f.down) { e.f.down = true; e.downT = 0.5; } const qs = areaOf(q.g.area); if (qs.every(x => x.sealed)) toast((AR[q.g.area].label || 'AREA') + ' IS QUIET UNTIL TOMORROW', 3.2); }
  function prompt(P) { const q = G.find(q => q.ready && Math.hypot(P.x - q.g.x, P.z - q.g.z) < 3); return q ? 'STRIKE THE GATE \u00b7 SEAL IT' : null; }
  window.__gates = { G, AR, seal, spawn };
  return { tick, hits, prompt, gates: G };
}
