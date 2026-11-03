// 8 GATES — MERU · TANK RANGE LOOK PASS (s129). Built + ticked inside tank-range.js (LK). Decoration only: nothing here changes the course rules.
// One steady WEST WIND drives it all: Meru flags + windsocks stream east, tumbleweeds roll east, dust devils drift.
// Ground: TREAD MARKS behind the tank, SCORCH marks under course blasts. Pit: tower BEACONS spin red during the waves, crows circle above.
// Events: a wave cleared = yellow smoke flares on the pit pillars; SGT. TREAD beaten / course done = red + white + yellow flares round the duel ring.
export function tankLook(X, o) {
  const { THREE, scene, M, toon, rr } = X, { PC, DA, towers, touch, st, solid, IWm, trackW } = o;
  const ink = toon('#201e1d'), tmp = new THREE.Vector3();
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const glow = (col, op = 0.8) => new THREE.SpriteMaterial({ map: X.glowTex, color: col, transparent: true, depthWrite: false, opacity: op, blending: THREE.AdditiveBlending });
  let gust = 1, fr = 0;

  // ---------- MERU FLAGS (navy, gold M) ----------
  const flagT = CT(256, 160, (g, w, h) => { g.fillStyle = '#1e3a6e'; g.fillRect(0, 0, w, h); g.fillStyle = '#e6b45a'; g.fillRect(0, 0, w, 12); g.fillRect(0, h - 12, w, 12); g.font = '900 112px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', w / 2, h / 2 + 6); });
  const flagM = new THREE.MeshToonMaterial({ map: flagT, gradientMap: X.grad, side: THREE.DoubleSide }), flags = [];
  function flag(x, y0, z, h) { const g = new THREE.Group(); g.position.set(x, y0, z); scene.add(g);
    M(new THREE.CylinderGeometry(0.08, 0.1, h, 6), ink, 0, h / 2, 0, g, 0); M(new THREE.SphereGeometry(0.17, 8, 6), toon('#e6b45a'), 0, h + 0.12, 0, g, 0);
    const geo = new THREE.PlaneGeometry(2.6, 1.6, 12, 1); geo.translate(1.3, 0, 0); const m = new THREE.Mesh(geo, flagM); m.position.set(0.08, h - 0.85, 0); g.add(m);
    flags.push({ geo, base: Float32Array.from(geo.attributes.position.array), ph: rr(0, 6) }); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) flag(PC.x + sx * 12, 4.5, PC.z + sz * (PC.r + 1), 4.2);
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + 0.55 + i / 5 * (Math.PI * 2 - 1.1), r = DA.r + 4; flag(DA.x + Math.cos(a) * r, 0, DA.z + Math.sin(a) * r, 7); }
  if (!IWm) for (const sx of [-1, 1]) { flag(sx * 20, 0, -97, 7); solid(sx * 20, -97, 0.4, 7); }

  // ---------- WINDSOCKS (orange / white) ----------
  const sockT = CT(256, 32, (g, w, h) => { for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#f3f2f2' : '#ff7a1a'; g.fillRect(i * w / 5, 0, w / 5, h); } });
  const sockGeo = new THREE.CylinderGeometry(0.42, 0.16, 2.6, 12, 1, true); sockGeo.rotateZ(-Math.PI / 2); sockGeo.translate(1.3, 0, 0);
  const sockM = new THREE.MeshToonMaterial({ map: sockT, gradientMap: X.grad, side: THREE.DoubleSide }), socks = [];
  for (const [x, z] of [[-46, -30], [46, 40], [-46, 120], [46, 200], [-30, 466], [30, 476]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    M(new THREE.CylinderGeometry(0.09, 0.12, 6, 6), ink, 0, 3, 0, g, 0); M(new THREE.TorusGeometry(0.42, 0.05, 6, 14), ink, 0, 6, 0, g, 0).rotation.y = Math.PI / 2;
    const pv = new THREE.Group(); pv.position.y = 6; g.add(pv); pv.add(new THREE.Mesh(sockGeo, sockM)); socks.push({ pv, ph: rr(0, 6) }); solid(x, z, 0.4, 6); }

  // ---------- TOWER BEACONS (pit): red + spinning in the fights, slow amber blink otherwise ----------
  const beamGeo = new THREE.PlaneGeometry(7, 1.4); beamGeo.translate(3.5, 0, 0);
  const beacons = towers.map(([x, z]) => { const g = new THREE.Group(); g.position.set(x, 5.2, z); scene.add(g);
    M(new THREE.CylinderGeometry(0.12, 0.12, 1.1, 6), ink, 0, 0.55, 0, g, 0); const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.5, 12), new THREE.MeshBasicMaterial({ color: 0x6b2a20 })); cap.position.y = 1.35; g.add(cap);
    const gl = new THREE.Sprite(glow(0xff3b1f, 0)); gl.position.y = 1.35; gl.scale.set(3.4, 3.4, 1); g.add(gl);
    const sp = new THREE.Group(); sp.position.y = 1.35; g.add(sp); const bm = new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    for (const a of [0, Math.PI]) { const p = new THREE.Mesh(beamGeo, bm); p.rotation.y = a; sp.add(p); }
    return { cap, gl, sp, bm }; });

  // ---------- TREAD MARKS behind the tank ----------
  const TN = touch ? 90 : 180, trG = new THREE.PlaneGeometry(0.75, 1.25); trG.rotateX(-Math.PI / 2);
  const trM = new THREE.InstancedMesh(trG, new THREE.MeshBasicMaterial({ color: 0x3b2c1c, transparent: true, opacity: 0.3, depthWrite: false }), TN); trM.frustumCulled = false; trM.renderOrder = 1; scene.add(trM);
  const trA = new Float32Array(TN).fill(-1e9), trP = new Float32Array(TN * 3), o3 = new THREE.Object3D(); let trI = 0, trD = 0, lx = null, lz = null, trU = 0, T = 0;
  o3.scale.setScalar(0); o3.updateMatrix(); for (let i = 0; i < TN; i++) trM.setMatrixAt(i, o3.matrix);
  function trSet(i) { const age = T - trA[i], k = age > 22 ? 0 : age > 16 ? 1 - (age - 16) / 6 : 1; o3.position.set(trP[i * 3], 0.04, trP[i * 3 + 1]); o3.rotation.set(0, trP[i * 3 + 2], 0); o3.scale.set(k, 1, k || 0.0001); o3.updateMatrix(); trM.setMatrixAt(i, o3.matrix); }
  function treads() { const C = X.C; if (lx === null) { lx = C.x; lz = C.z; } const d = Math.hypot(C.x - lx, C.z - lz); lx = C.x; lz = C.z; if (!C.ground || d > 6) return; trD += d; if (trD < 1.2) return; trD = 0;
    const w = trackW(), px = Math.cos(C.yaw) * w, pz = -Math.sin(C.yaw) * w; for (const s of [-1, 1]) { const i = trI; trI = (trI + 1) % TN; trA[i] = T; trP.set([C.x + px * s, C.z + pz * s, C.yaw], i * 3); trSet(i); } trM.instanceMatrix.needsUpdate = true; }

  // ---------- SCORCH marks under course blasts (robots, lamps, barrels, SGT. TREAD's shells) ----------
  const SN = 24, scT = CT(128, 128, (g, w) => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 62); r.addColorStop(0, 'rgba(20,16,12,0.85)'); r.addColorStop(0.6, 'rgba(30,24,18,0.45)'); r.addColorStop(1, 'rgba(30,24,18,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const scG = new THREE.PlaneGeometry(1, 1); scG.rotateX(-Math.PI / 2); const scM = new THREE.InstancedMesh(scG, new THREE.MeshBasicMaterial({ map: scT, transparent: true, depthWrite: false }), SN); scM.frustumCulled = false; scM.renderOrder = 1; scene.add(scM);
  o3.scale.setScalar(0); o3.rotation.set(0, 0, 0); o3.updateMatrix(); for (let i = 0; i < SN; i++) scM.setMatrixAt(i, o3.matrix); let scI = 0;
  const boom0 = X.boom; X.boom = (p, r, col) => { boom0(p, r, col); if (p.y < 3.5) { o3.position.set(p.x, 0.045, p.z); o3.rotation.set(0, rr(0, 6), 0); o3.scale.setScalar(Math.min(9, r * 1.4 + 1.5)); o3.updateMatrix(); scM.setMatrixAt(scI, o3.matrix); scI = (scI + 1) % SN; scM.instanceMatrix.needsUpdate = true; } };

  // ---------- TUMBLEWEEDS + DUST DEVILS in the wild ----------
  const twM = toon('#a8865a'), weeds = [];
  for (let i = 0; i < (touch ? 2 : 4); i++) { const m = M(new THREE.IcosahedronGeometry(0.8, 1), twM, 0, 0.8, 0, null, 0.02); m.castShadow = false; const w = { m, x: rr(-130, 130), z: rr(-60, 600), v: rr(4, 7), ph: rr(0, 6) }; weeds.push(w); }
  const devils = []; for (let i = 0; i < (touch ? 1 : 2); i++) devils.push({ x: (i ? 1 : -1) * rr(60, 110), z: rr(0, 500), a: 0, y: 0, e: 0, vx: 0, vz: 0, t: rr(0, 10) });

  // ---------- CROWS circling over the pit ----------
  const wingG = new THREE.BufferGeometry(); wingG.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, -0.25, 0, 0, 0.25, 1.1, 0, 0.05]), 3)); wingG.computeVertexNormals();
  const crowM = new THREE.MeshBasicMaterial({ color: 0x201e1d, side: THREE.DoubleSide }), crows = [];
  for (let i = 0; i < (touch ? 3 : 5); i++) { const g = new THREE.Group(); scene.add(g); const b = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.8), crowM); g.add(b); const wl = new THREE.Mesh(wingG, crowM), wr = new THREE.Mesh(wingG, crowM); wr.scale.x = -1; g.add(wl, wr); crows.push({ g, wl, wr, r: rr(24, 46), y: rr(26, 36), a: rr(0, 6), s: rr(0.18, 0.3) * (i % 2 ? 1 : -1), ph: rr(0, 6) }); }

  // ---------- SMOKE FLARES on events ----------
  const flares = []; let pw = 0, pd = '', pdone = false;
  const flare = (x, y, z, col, t = 5) => flares.push({ x, y, z, col, t, e: 0 });
  const pitFlares = () => { for (const sx of [-1, 1]) for (const sz of [-1, 1]) flare(PC.x + sx * 12, 4.8, PC.z + sz * (PC.r + 1), 0xffd23a); };
  const ringFlares = () => { const C = [0xec3013, 0xf3f2f2, 0xffd23a]; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + 0.55 + i / 5 * (Math.PI * 2 - 1.1), r = DA.r + 4; flare(DA.x + Math.cos(a) * r, 0.6, DA.z + Math.sin(a) * r, C[i % 3], 7); } };

  function tick(dt) { T += dt; fr++; const t = T, s = st();
    gust = 0.75 + 0.25 * Math.sin(t * 0.37) * Math.sin(t * 0.13 + 1) + 0.1 * Math.sin(t * 1.7);
    if (!touch || fr % 2 === 0) for (const f of flags) { const p = f.geo.attributes.position.array, b = f.base; for (let i = 0; i < p.length; i += 3) { const x = b[i], k = x / 2.6; p[i + 2] = Math.sin(x * 1.7 - t * (5 + gust * 3) + f.ph) * 0.24 * k * gust + Math.sin(t * 1.3 + f.ph) * 0.06 * k; p[i + 1] = b[i + 1] - k * k * 0.35 * (1.2 - gust); } f.geo.attributes.position.needsUpdate = true; }
    for (const k of socks) { k.pv.rotation.y = Math.sin(t * 0.9 + k.ph) * 0.22 * (1.3 - gust); k.pv.rotation.z = -(1 - gust) * 0.9 - 0.08 + Math.sin(t * 7 + k.ph) * 0.03; }
    const fight = s.wave > 0 || s.duel === 'go' || s.duel === 'count';
    for (const B of beacons) { if (fight) { B.sp.rotation.y += dt * 5; const f = 0.5 + 0.5 * Math.abs(Math.sin(B.sp.rotation.y)); B.bm.opacity = 0.28; B.gl.material.opacity = 0.4 + 0.6 * f; B.gl.material.color.setHex(0xff3b1f); B.cap.material.color.setHex(0xff3b1f); }
      else { const on = (t % 1.6) < 0.25; B.bm.opacity = 0; B.gl.material.opacity = on ? 0.7 : 0; B.gl.material.color.setHex(0xffb347); B.cap.material.color.setHex(on ? 0xffb347 : 0x6b2a20); } }
    if (s.run) treads(); trU -= dt; if (trU <= 0) { trU = 1; let ch = false; for (let i = 0; i < TN; i++) { const a = T - trA[i]; if (a > 16 && a < 24) { trSet(i); ch = true; } } if (ch) trM.instanceMatrix.needsUpdate = true; }
    for (const w of weeds) { w.x += w.v * gust * dt; w.m.position.set(w.x, 0.8 + Math.abs(Math.sin(t * 2.6 + w.ph)) * 0.5 * gust, w.z + Math.sin(t * 0.7 + w.ph) * 2); w.m.rotation.z -= w.v * gust * dt / 0.8; if (w.x > 134) { w.x = -134; w.z = rr(-60, 600); w.v = rr(4, 7); } }
    for (const d of devils) { d.t += dt; d.vx = 2.5 * gust + Math.sin(d.t * 0.4) * 2; d.vz = Math.cos(d.t * 0.31) * 3; d.x += d.vx * dt; d.z += d.vz * dt; if (d.x > 125) d.x = -125; if (Math.abs(d.x) < 45) d.x += Math.sign(d.x || 1) * 90; d.z = Math.min(590, Math.max(-60, d.z));
      d.e -= dt; if (d.e <= 0) { d.e = touch ? 0.12 : 0.07; d.a += 1.4; d.y = (d.y + 0.7) % 7; const r = 0.6 + d.y * 0.35; X.puff(tmp.set(d.x + Math.cos(d.a) * r, d.y + 0.3, d.z + Math.sin(d.a) * r), 0xc9a97a, 1, 0.8, 1.2 + d.y * 0.25, 1.1); } }
    for (const c of crows) { c.a += c.s * dt; const x = PC.x + Math.cos(c.a) * c.r, z = PC.z + Math.sin(c.a) * c.r; c.g.position.set(x, c.y + Math.sin(t * 0.6 + c.ph) * 1.5, z); c.g.rotation.y = Math.atan2(-Math.sin(c.a) * c.s, Math.cos(c.a) * c.s); c.g.rotation.z = -Math.sign(c.s) * 0.25; const fl = Math.sin(t * 7 + c.ph) > 0.2 ? Math.sin(t * 14 + c.ph) * 0.6 : 0.1; c.wl.rotation.z = fl; c.wr.rotation.z = -fl; }
    if (s.wave > pw && pw > 0) pitFlares(); if (s.duel === 'wait' && pd !== 'wait' && pw === 4) pitFlares(); if (s.duel === 'beaten' && pd !== 'beaten') ringFlares(); if (s.done && !pdone && s.duel !== 'beaten') ringFlares(); pw = s.wave; pd = s.duel; pdone = s.done;
    for (let i = flares.length - 1; i >= 0; i--) { const f = flares[i]; f.t -= dt; f.e -= dt; if (f.e <= 0) { f.e = touch ? 0.14 : 0.08; X.puff(tmp.set(f.x + rr(-0.2, 0.2), f.y, f.z + rr(-0.2, 0.2)), f.col, 1, 1.4, 1.8, 2.2); } if (f.t <= 0) flares.splice(i, 1); } }
  return { tick, flare, pitFlares, ringFlares, get gust() { return gust; } };
}
