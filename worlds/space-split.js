// 8 GATES · SPACE MAP · SPLITTING ASTEROIDS (s460, Ben: "asteroids that can be split, various types: some split into four, some two, some three").
// Fields of drifting asteroids sit in the open space BETWEEN the worlds (on the half-cell grid, so there are no empty pockets).
// s597j SIZES (Ben): BIG → 2 MEDIUM → 2 SMALL → 1 coin each; ANY size towed over a mine = 2 (tow 4 smalls = 8, blast them all = 4). Types are colour only now.
// Three types, told apart by colour:  ROCK (brown) → splits in 2 · ICE (pale blue) → splits in 3 · ORE (dark violet, red-veined) → splits in 4.
// Shoot a big one: it cracks into its pieces, which fly apart; shoot a piece and it bursts into dust + leaves a COIN (rock 2 · ice 3 · ore 5 coins).
// A missile shatters a big one outright (one bigger coin).
// Solid like the belt: you bounce off (the shield takes it while it is up), and pirates / creatures that ram one are hurt too.
// Phone-light: 2 instanced meshes, only fields within ~450 u are simulated, fields refill while you are away.
const TAU = Math.PI * 2;
export const SPLIT_TYPES = {
  2: { name: 'ROCK', col: '#8a6a4a', kid: '#a3835f', hp: 22 },
  3: { name: 'ICE', col: '#9fd8f0', kid: '#c4ebfa', hp: 26 },
  4: { name: 'ORE', col: '#5b4766', kid: '#7a6188', hp: 32, vein: '#ff4a3a' },
};
// s462 TRACTOR BEAM (Ben): pieces (middle-sized or smaller, never a big one) can be pulled in a tractor beam (slow down near one + TALK / E,
// up to 3 at once) and hauled to any MINE: delivered inside 32 u of the mine pays DOUBLE what shooting it to coins would (rock 4 · ice 6 · ore 10 G).
// s463 shared rock look (the belt rocks use it too)
function makeTools(THREE, SUB) {
  function lumpy(seed) { const g = new THREE.IcosahedronGeometry(1, SUB), P = g.attributes.position, v = new THREE.Vector3(), N = P.count, key = new Map(), uv = new Float32Array(N * 2);
    const cr = Array.from({ length: 4 }, (_, i) => { const a = seed * 7.1 + i * 2.3, b = seed * 3.7 + i * 1.9; return [new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.cos(b), Math.sin(a) * Math.sin(b)), 0.35 + (i % 2) * 0.15]; });
    for (let i = 0; i < N; i++) { v.fromBufferAttribute(P, i).normalize(); const n1 = Math.sin(v.x * 2.1 + seed) * Math.sin(v.y * 2.4 + seed * 1.7) * Math.sin(v.z * 1.9 + seed * 0.6), n2 = Math.sin(v.x * 5.3 + seed * 2) * Math.sin(v.y * 4.7) * Math.sin(v.z * 5.9 + seed);
      let d = 1 + n1 * 0.22 + n2 * 0.06; for (const [c, r] of cr) { const a = v.angleTo(c); if (a < r) d -= 0.1 * Math.cos(a / r * Math.PI / 2) ** 2; }
      uv[i * 2] = 0.5 + Math.atan2(v.z, v.x) / (2 * Math.PI); uv[i * 2 + 1] = 0.5 + Math.asin(Math.max(-1, Math.min(1, v.y))) / Math.PI; v.multiplyScalar(d); P.setXYZ(i, v.x, v.y, v.z); }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.computeVertexNormals();
    const nr = g.attributes.normal; for (let i = 0; i < N; i++) { const k = Math.round(P.getX(i) * 1e4) + ',' + Math.round(P.getY(i) * 1e4) + ',' + Math.round(P.getZ(i) * 1e4); const e = key.get(k) || [0, 0, 0, []]; e[0] += nr.getX(i); e[1] += nr.getY(i); e[2] += nr.getZ(i); e[3].push(i); key.set(k, e); }
    for (const e of key.values()) { const l = Math.hypot(e[0], e[1], e[2]) || 1; for (const i of e[3]) nr.setXYZ(i, e[0] / l, e[1] / l, e[2] / l); } return g; }
  const paint = (cracks) => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
    if (!cracks) { x.fillStyle = '#d8d8d8'; x.fillRect(0, 0, 256, 128); for (let i = 0; i < 900; i++) { const g2 = 150 + Math.random() * 105; x.fillStyle = 'rgb(' + g2 + ',' + g2 + ',' + g2 + ')'; x.fillRect(Math.random() * 256, Math.random() * 128, 2, 2); }
      for (let i = 0; i < 14; i++) { const cx = Math.random() * 256, cy = 20 + Math.random() * 88, r = 4 + Math.random() * 11; x.fillStyle = 'rgba(90,90,90,0.45)'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,255,255,0.5)'; x.lineWidth = 1.5; x.beginPath(); x.arc(cx - 1, cy - 1, r, 3.4, 5.6); x.stroke(); } }
    else { x.clearRect(0, 0, 256, 128); x.strokeStyle = '#ffffff'; x.lineCap = 'round'; for (let i = 0; i < 9; i++) { let px = Math.random() * 256, py = 20 + Math.random() * 88; x.lineWidth = 2 + Math.random() * 2; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (Math.random() - 0.5) * 40; py += (Math.random() - 0.5) * 22; x.lineTo(px, py); } x.stroke(); } }
    const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; };
  return { lumpy, paint };
}
export function rockLook(THREE, LOW) { const T = makeTools(THREE, LOW ? 2 : 3); return { geo: T.lumpy(6.2), map: T.paint(false) }; }
export function createSplit({ THREE, scene, St, WORLDS, CELL, burst, snd, hurt, combat, beasts, toast, LOW, shipR = () => 2.4, mines = () => [], save, V = 20 }) {
  const TOW_PAY = 2, TR_MAX = 1, tr = [];   /* s597j (Ben): BIG → 2 MEDIUM → 2 SMALL each; a SMALL blasts into 1 coin; ANY size towed over a mine = 2 */
  const SZ_NAME = ['SMALL', 'MEDIUM', 'BIG'];
  const beamM = new THREE.MeshBasicMaterial({ color: '#7fe8ff', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const beamG = new THREE.CylinderGeometry(0.12, 0.35, 1, 8, 1, true); beamG.translate(0, 0.5, 0); beamG.rotateX(Math.PI / 2);
  const beams = Array.from({ length: TR_MAX }, () => { const b = new THREE.Mesh(beamG, beamM); b.visible = false; scene.add(b); return b; });
  // s463 POLISH (Ben: "not so boxy + pointy"): 3 smooth LUMPY rock shapes (a subdivided sphere pushed in + out by layered noise, smooth
  // normals, a few craters), a painted surface (speckle + crater rings) so they read as stone, and ORE veins as glowing red CRACKS on the
  // surface instead of a wireframe cage
  const CAP = LOW ? 110 : 180, SUB = LOW ? 2 : 3;
  const { lumpy, paint } = makeTools(THREE, SUB);
  const GEOS = [lumpy(1.3), lumpy(4.7), lumpy(8.9)], mat = new THREE.MeshLambertMaterial({ color: '#ffffff', map: paint(false) });
  const meshes = GEOS.map(g => { const m = new THREE.InstancedMesh(g, mat, Math.ceil(CAP / 2)); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); return m; }), mesh = meshes[0];
  const vmat = new THREE.MeshBasicMaterial({ color: SPLIT_TYPES[4].vein, map: paint(true), transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const veins = new THREE.InstancedMesh(GEOS[0].clone().scale(1.015, 1.015, 1.015), vmat, Math.ceil(CAP / 3)); veins.instanceMatrix.setUsage(THREE.DynamicDrawUsage); veins.frustumCulled = false; scene.add(veins);
  const O = new THREE.Object3D(), C = new THREE.Color(), list = [], fields = [];
  // fields on the half-cell grid between the worlds (skip any too close to a world)
  for (let i = -3; i <= 2; i++) for (let j = -3; j <= 2; j++) { const x = (i + 0.5) * CELL, z = (j + 0.5) * CELL;
    if (WORLDS.some(w => Math.hypot(w.x - x, w.z - z) < CELL * 0.42)) continue; if (Math.hypot(x, z) > CELL * 3.2) continue; fields.push({ x, z, refill: 0 }); }
  const rnd = (a, b) => a + Math.random() * (b - a);
  function spawnBig(F) { if (list.length >= 420) return;   /* s461b: the world keeps every field full (data is cheap); CAP only limits what is DRAWN near you */ const a = Math.random() * TAU, r = rnd(6, 42), n = [2, 2, 3, 3, 4][Math.floor(Math.random() * 5)], T = SPLIT_TYPES[n];
    list.push({ F, n, sz: 2, big: true, x: F.x + Math.cos(a) * r, z: F.z + Math.sin(a) * r, y: rnd(-0.8, 0.8), vx: rnd(-1.2, 1.2), vz: rnd(-1.2, 1.2), s: rnd(2.6, 3.6), hp: T.hp, rx: rnd(0, TAU), ry: rnd(0, TAU), wr: rnd(-0.6, 0.6), wy: rnd(-0.5, 0.5), sq: [rnd(0.85, 1.15), rnd(0.8, 1.05), rnd(0.85, 1.15)], gi: Math.floor(Math.random() * 3), hitT: 0 }); }
  // s461 (Ben couldn't find them): + a NEAR field beside every world (just past its installs, on the side away from the galaxy centre, clear of
  // defended space so no fights), so there is always one within a short flight of wherever you are; all fields show on the minimap
  for (const w of WORLDS) { const L = Math.hypot(w.x, w.z), ax = L > 1 ? w.x / L : 0.7, az = L > 1 ? w.z / L : -0.7, d = CELL * 0.3; fields.push({ x: w.x + ax * d - az * d * 0.5, z: w.z + az * d + ax * d * 0.5, refill: 0, near: true }); }
  for (const F of fields) for (let q = 0; q < 5; q++) spawnBig(F);
  let told = false;
  function piece(F, n, sz, x, z, y, vx, vz, s0) { list.push({ F, n, sz, big: false, x, z, y, vx, vz, s: s0, hp: sz === 1 ? 10 : 6, rx: rnd(0, TAU), ry: rnd(0, TAU), wr: rnd(-2, 2), wy: rnd(-2, 2), sq: [rnd(0.85, 1.15), rnd(0.8, 1.05), rnd(0.85, 1.15)], gi: Math.floor(Math.random() * 3), hitT: 0, life: 120 }); }
  function split(r, sx, sz0, missile) { const T = SPLIT_TYPES[r.n], tier = r.sz ?? (r.big ? 2 : 0); list.splice(list.indexOf(r), 1);
    burst(r.x, r.z, T.col, tier === 2 ? 16 : tier ? 11 : 8, tier === 2 ? 1.5 : tier ? 1.15 : 0.9); if (r.n === 4) burst(r.x, r.z, T.vein, 8, 1.1); snd && snd('rockShot', { at: [r.x, r.z], v: tier === 2 ? 0.95 : tier ? 0.75 : 0.6, p: tier === 2 ? 0.8 : tier ? 1 : 1.25 });
    { const ti = tr.indexOf(r); if (ti >= 0) tr.splice(ti, 1); }
    if (tier === 0 || missile) { const c = tier === 2 ? 4 : tier === 1 ? 2 : 1; if (combat && combat.dropCoin) combat.dropCoin(r.x, r.z, c, true); return; }   /* small = 1 coin · a missile blasts it all the way at once (big 4 · medium 2) */
    const a0 = Math.atan2(r.z - sz0, r.x - sx) + Math.PI / 2; for (let k = 0; k < 2; k++) { const a = a0 + k * Math.PI + rnd(-0.25, 0.25), sp = rnd(2.2, 3.8), ks = r.s * 0.62; piece(r.F, r.n, tier - 1, r.x + Math.cos(a) * ks * 1.2, r.z + Math.sin(a) * ks * 1.2, r.y, r.vx + Math.cos(a) * sp, r.vz + Math.sin(a) * sp, ks); }
    if (!told) toast && toast('SPLIT! BIG → 2 MEDIUM → 2 SMALL. Blast a SMALL for 1 coin, or TOW any rock over a mine for 2.', 4); told = true; }
  const near = (x, z, R) => Math.abs(x - St.x) < R && Math.abs(z - St.z) < R;
  const API = {
    pieceNear() { if (tr.length >= TR_MAX || St.phase !== 'free' || St.tow || St.tractor || Math.hypot(St.vx, St.vz) > V * 0.6) return null; let best = null, bd = 32; /* s467: you shoot from ~20 u, so the beam reaches 32 u */ for (const r of list) { if (r.tr) continue; const d = Math.hypot(r.x - St.x, r.z - St.z); if (d < bd) { bd = d; best = r; } } return best; },
    // s597e (Ben: "like the original: tractor asteroids to the mine"): HOLD button 2 grabs the rock off your nose (the 2D towCandidate: cone, nearest), no need to slow down.
    // TEST MODE: big rocks too. It stays on the line after you let go (the 2D hard tow); fly within 32 u of any MINE = refined, DOUBLE coins. Hold 2 with nothing new in reach = let them go.
    grab(R = 55) { if (tr.length >= TR_MAX || St.phase !== 'free') return null; const fx = Math.sin(St.h), fz = -Math.cos(St.h); let best = null, bs = 1e9;
      for (const r of list) { if (r.tr) continue; const dx = r.x - St.x, dz = r.z - St.z, d = Math.hypot(dx, dz); if (d > R + r.s || d < 0.5) continue; const off = Math.acos(Math.max(-1, Math.min(1, (dx * fx + dz * fz) / d))), fat = Math.atan2(r.s, Math.max(4, d)); const sc = off > 0.75 + fat ? d * 3 : d; if (sc < bs) { bs = sc; best = r; } }
      if (!best) return null; best.tr = true; best.life = undefined; tr.push(best); snd && snd('towLatch', { v: 0.7 });
      toast && toast(SZ_NAME[best.sz ?? 0] + ' ROCK UNDER TOW. Fly OVER any MINE: +' + TOW_PAY + '. Press 2 to let go.', 3); return best; },
    releaseAll() { if (!tr.length) return false; for (const r of tr) { r.tr = false; r.life = 40; } tr.length = 0; toast && toast('Rocks released.', 2); snd && snd('boostEnd', { v: 0.35 }); return true; },
    prompt() { const p = API.pieceNear(); if (p) return 'Tractor the ' + SZ_NAME[p.sz ?? 0].toLowerCase() + ' ' + SPLIT_TYPES[p.n].name.toLowerCase() + (tr.length ? ' (' + (tr.length + 1) + '/' + TR_MAX + ')' : ''); if (tr.length && St.phase === 'free') return 'Release the rocks'; return null; },
    talk() { const p = API.pieceNear(); if (p) { p.tr = true; p.life = undefined; tr.push(p); snd && snd('towLatch', { v: 0.7 });
        toast && toast(SZ_NAME[p.sz ?? 0] + ' ROCK UNDER TOW. Fly OVER any MINE: +' + TOW_PAY + '.', 3.5); return true; }
      if (tr.length) { for (const r of tr) { r.tr = false; r.life = 40; } tr.length = 0; toast && toast('Rocks released.', 2); return true; } return false; },
    get towing() { return tr.length; },
    // s597j the mine-belt rocks break the same way: a BIG / MEDIUM belt rock drops its 2 pieces into this system
    spawnPieces(x, z, tier, cx, cz, vx = 0, vz = 0) { const F = { x: cx, z: cz }, s0 = tier === 1 ? rnd(1.6, 2.1) : rnd(1.0, 1.3); for (let k = 0; k < 2; k++) { const a = Math.random() * TAU, sp = rnd(1.6, 3); piece(F, 2, tier, x + Math.cos(a) * s0, z + Math.sin(a) * s0, 0, vx + Math.cos(a) * sp, vz + Math.sin(a) * sp, s0); } },
    hitShot(s) { const px = s.m.position.x, pz = s.m.position.z; for (const r of list) { if (Math.abs(r.x - px) > r.s + 2 || Math.abs(r.z - pz) > r.s + 2) continue;
        if (Math.hypot(r.x - px, r.z - pz) < r.s + (s.missile ? 1.4 : 0.6)) { r.hp -= s.missile ? 999 : (s.dmg || 10); r.hitT = 0.15;
          if (r.hp <= 0) split(r, px, pz, s.missile); else { burst(px, pz, SPLIT_TYPES[r.n].kid, 4, 0.6); snd && snd('rockShot', { at: [r.x, r.z], v: 0.35, p: 1.5 }); } return true; } } return false; },
    update(dt) { const t = St.t;
      for (const F of fields) { if (near(F.x, F.z, 450)) continue; if ((F.refill -= dt) > 0) continue; F.refill = 20; if (list.filter(r => r.F === F && r.big).length < 5) spawnBig(F); }
      const bodies = [{ me: true, o: St, r: shipR() }]; if (combat) for (const p of combat.list) bodies.push({ o: p, r: p.C.size * 0.32, ship: true }); if (beasts) for (const c of beasts.list) if (c.fam !== 'belt') bodies.push({ o: c, r: c.fam === 'vmoth' ? 4 : 5, beast: true });
      const cnt = [0, 0, 0]; let nv = 0;
      for (let i = list.length - 1; i >= 0; i--) { const r = list[i]; if (!near(r.x, r.z, 450)) continue;
        if (r.life !== undefined && (r.life -= dt) <= 0) { list.splice(i, 1); continue; }
        if (r.tr) { const idx = tr.indexOf(r), bk = 8 + idx * 5.5, bx = St.x - Math.sin(St.h) * bk + Math.cos(St.h) * (idx - 1) * 2.2, bz = St.z + Math.cos(St.h) * bk + Math.sin(St.h) * (idx - 1) * 2.2, kk = 1 - Math.exp(-dt * 3); r.vx = (bx - r.x) * 3; r.vz = (bz - r.z) * 3; r.x += (bx - r.x) * kk; r.z += (bz - r.z) * kk; }
        else { r.x += r.vx * dt; r.z += r.vz * dt; } const dr = 1 - Math.min(1, dt * (r.big ? 0.05 : 0.9)); r.vx *= dr; r.vz *= dr;
        const fx = r.x - r.F.x, fz = r.z - r.F.z, fd = Math.hypot(fx, fz); if (!r.tr && fd > 55) { r.vx -= fx / fd * dt * 1.5; r.vz -= fz / fd * dt * 1.5; }   // keep the field together
        r.rx += r.wr * dt; r.ry += r.wy * dt; if (r.hitT > 0) r.hitT -= dt;
        // collisions (ship, pirates, creatures)
        for (const B of bodies) { const o = B.o; if (r.tr && B.me) continue; if (B.me && St.phase !== 'free') continue; if ((o._splitCd || 0) > t) continue; const dx = o.x - r.x, dz = o.z - r.z, d = Math.hypot(dx, dz), R = r.s * 0.92 + B.r; if (d >= R) continue;
          const nx = dx / (d || 1), nz = dz / (d || 1); o.x = r.x + nx * (R + 0.2); o.z = r.z + nz * (R + 0.2); const vn = (o.vx || 0) * nx + (o.vz || 0) * nz; if (vn < 0) { o.vx -= vn * nx * 1.6; o.vz -= vn * nz * 1.6; }
          r.vx -= nx * 2; r.vz -= nz * 2; o._splitCd = t + 0.5; const dmg = r.big ? 8 : 4, hx = r.x + nx * r.s, hz = r.z + nz * r.s;
          if (B.me) hurt(dmg, hx, hz); else if (B.ship) combat.hit(o, dmg + 4); else beasts.hitShot({ m: { position: { x: o.x, z: o.z } }, dmg: dmg + 4, missile: false }); burst(hx, hz, SPLIT_TYPES[r.n].col, 6, 0.8); }
        const gi = r.n === 4 ? 0 : (r.gi || 0), M2 = meshes[gi]; if (cnt[gi] >= M2.count) continue; const fl = r.hitT > 0 ? 1.6 : 1, n = cnt[gi]++;
        O.position.set(r.x, r.y, r.z); O.rotation.set(r.rx, r.ry, 0); O.scale.set(r.s * r.sq[0], r.s * r.sq[1], r.s * r.sq[2]); O.updateMatrix(); M2.setMatrixAt(n, O.matrix);
        C.set(r.big ? SPLIT_TYPES[r.n].col : SPLIT_TYPES[r.n].kid).multiplyScalar(fl); M2.setColorAt(n, C);
        if (r.n === 4 && nv < veins.count) { veins.setMatrixAt(nv, O.matrix); nv++; } }
      meshes.forEach((M2, gi) => { for (let i = cnt[gi]; i < M2.count; i++) { O.scale.setScalar(0); O.updateMatrix(); M2.setMatrixAt(i, O.matrix); } M2.instanceMatrix.needsUpdate = true; if (M2.instanceColor) M2.instanceColor.needsUpdate = true; }); for (let i = nv; i < veins.count; i++) { O.scale.setScalar(0); O.updateMatrix(); veins.setMatrixAt(i, O.matrix); }
      // tractor beams + delivery at a mine
      beams.forEach((b, i) => { const r = tr[i]; b.visible = !!r; if (!r) return; b.position.set(St.x, 0.2, St.z); b.lookAt(r.x, r.y, r.z); b.scale.set(1, 1, Math.hypot(r.x - St.x, r.z - St.z)); }); beamM.opacity = 0.35 + 0.2 * Math.sin(t * 14);
      if (tr.length) { const M = mines().find(e => Math.hypot(e.x - St.x, e.z - St.z) < 10); if (M) { try { window.__8gMineDeliver && window.__8gMineDeliver(M.x, M.z); } catch (e) {}   /* s597g: you have to fly OVER the mine (10 u), pulse + chime */ let g = 0; for (const r of tr) { g += TOW_PAY; list.splice(list.indexOf(r), 1); burst(r.x, r.z, SPLIT_TYPES[r.n].col, 10, 1.2); } const n2 = tr.length; tr.length = 0;
          if (save) save.addGold(g); toast && toast('DELIVERED TO THE MINE · +' + g + ' GOLD', 3); } }
      veins.instanceMatrix.needsUpdate = true; vmat.opacity = 0.55 + 0.35 * Math.sin(t * 3); },
    mini(x, tx, tz, k) { x.lineWidth = 1.5; for (const F of fields) { const px = tx(F.x), pz = tz(F.z); x.strokeStyle = 'rgba(201,162,122,0.9)'; x.setLineDash([3, 3]); x.beginPath(); x.arc(px, pz, Math.max(4, 45 * k), 0, 7); x.stroke(); x.setLineDash([]); }
      x.fillStyle = '#c9a27a'; for (const r of list) { if (!r.big || !near(r.x, r.z, 450)) continue; x.beginPath(); x.arc(tx(r.x), tz(r.z), Math.max(1.5, r.s * k), 0, 7); x.fill(); } },
    addField(x, z, n = 5) { const F = { x, z, refill: 0 }; fields.push(F); for (let q = 0; q < n; q++) spawnBig(F); return F; },   // s598y arena ambush cover
    get list() { return list; }, fields,
  };
  return API;
}
