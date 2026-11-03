// MERU ARENA LOOK PASS (s128, BUILD_PLAN deluxe list item 8: crowd, banners, lights). Plugged into meru-arena.js (LK).
// CROWD: THE WAVE runs round the stands when no one is fighting (and on a win) · fans wave red / white / gold FLAGS · CAMERA FLASHES pop in the
// stands (more when the crowd cheers). BANNERS: pennant ropes swing between the four flood towers · the wall banners sway. LIGHTS: flood BEAMS
// from the towers onto the sand (flash when a round starts) · 2 SEARCHLIGHTS sweep the sky outside · WIN = confetti + fireworks over the ring.
export function arenaLook(X) {
  const { THREE, scene, glowTex, dotTex, crowd, RING, WALL, phone, banners } = X;
  const rr = (a, b) => a + Math.random() * (b - a), TAU = Math.PI * 2;
  const glow = (c, op) => new THREE.SpriteMaterial({ map: glowTex, color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });
  // ---------- THE WAVE ----------
  let waveA = 0, waveOn = 0, waveT = 4;
  const wave = a => { if (waveOn <= 0) return 0; let d = Math.atan2(Math.sin(a - waveA), Math.cos(a - waveA)); return Math.exp(-d * d / 0.06) * 0.55 * Math.min(1, waveOn); };
  // ---------- FLAGS in the crowd ----------
  const FANS = crowd.filter((c, i) => i % (phone ? 11 : 7) === 3);
  const flagG = new THREE.PlaneGeometry(0.5, 0.32); flagG.translate(0.25, 0, 0);
  const flags = new THREE.InstancedMesh(flagG, new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide }), FANS.length);
  const stickG = new THREE.CylinderGeometry(0.015, 0.015, 0.7, 4); const sticks = new THREE.InstancedMesh(stickG, new THREE.MeshBasicMaterial({ color: '#3a3020' }), FANS.length);
  const FC = ['#c42d3c', '#f2f0ea', '#e6b45a', '#c42d3c'].map(c => new THREE.Color(c)); FANS.forEach((c, i) => { c.fl = rr(0, 6.3); flags.setColorAt(i, FC[i % FC.length]); });
  scene.add(flags, sticks); const dm = new THREE.Object3D();
  function flagsAt(t, cheer) { FANS.forEach((c, i) => { const face = Math.atan2(-c.x, -c.z), lift = wave(c.a) + Math.max(0, Math.sin(t * (4 + cheer * 6) + c.ph)) * (0.04 + cheer * 0.28);
    dm.position.set(c.x, c.y + 1.25 + lift, c.z); dm.rotation.set(0, face + Math.PI / 2, 0); dm.scale.setScalar(1); dm.updateMatrix(); sticks.setMatrixAt(i, dm.matrix);
    dm.position.y = c.y + 1.48 + lift; dm.rotation.set(0, face + Math.PI / 2 + Math.sin(t * (3 + cheer * 5) + c.fl) * (0.4 + cheer * 0.5), Math.sin(t * 5 + c.fl) * 0.15); dm.updateMatrix(); flags.setMatrixAt(i, dm.matrix); });
    flags.instanceMatrix.needsUpdate = sticks.instanceMatrix.needsUpdate = true; }
  // ---------- CAMERA FLASHES ----------
  const FL = Array.from({ length: phone ? 6 : 12 }, () => { const s = new THREE.Sprite(glow('#ffffff', 0)); s.scale.setScalar(0.9); scene.add(s); return { s, t: 0 }; });
  let flashT = 0;
  // ---------- PENNANT ropes between the flood towers ----------
  const T = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz]) => new THREE.Vector3(sx * (WALL - 4), 13.4, sz * (WALL - 4)));
  const PN = []; const N = phone ? 10 : 16;
  for (let r = 0; r < 4; r++) { const a = T[r], b = T[(r + 1) % 4]; for (let k = 1; k < N; k++) { const u = k / N, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 2.6; PN.push({ p, yaw: Math.atan2(b.x - a.x, b.z - a.z), ph: rr(0, 6.3), c: k % 3 }); } }
  const pnG = new THREE.BufferGeometry(); pnG.setAttribute('position', new THREE.Float32BufferAttribute([-0.32, 0, 0, 0.32, 0, 0, 0, -0.75, 0], 3));
  const pen = new THREE.InstancedMesh(pnG, new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide }), PN.length); const PC = ['#c42d3c', '#f2f0ea', '#e6b45a'].map(c => new THREE.Color(c));
  PN.forEach((q, i) => pen.setColorAt(i, PC[q.c])); scene.add(pen);
  { const pts = []; for (let r = 0; r < 4; r++) { const a = T[r], b = T[(r + 1) % 4]; for (let k = 0; k < 24; k++) { for (const u of [k / 24, (k + 1) / 24]) { const p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 2.6; pts.push(p.x, p.y, p.z); } } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#14111f' }))); }
  const penAt = t => { PN.forEach((q, i) => { dm.position.copy(q.p); dm.rotation.set(Math.sin(t * 2.2 + q.ph) * 0.35, q.yaw, 0); dm.scale.setScalar(1); dm.updateMatrix(); pen.setMatrixAt(i, dm.matrix); }); pen.instanceMatrix.needsUpdate = true; };
  // wall banners sway
  const BAN = (banners || []).map(b => ({ b, ry: b.rotation.y, ph: rr(0, 6.3) }));
  // ---------- FLOOD BEAMS ----------
  const beamM = new THREE.MeshBasicMaterial({ color: '#ffe2a0', transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const BEAM = T.map(top => { const target = new THREE.Vector3(top.x * 0.12, 0, top.z * 0.12), len = top.distanceTo(target); const g = new THREE.ConeGeometry(4.2, len, 20, 1, true); g.translate(0, -len / 2, 0);
    const m = new THREE.Mesh(g, beamM); m.position.copy(top).setY(14); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), target.clone().sub(m.position).normalize()); scene.add(m); return m; });
  let flood = 0;
  // ---------- SEARCHLIGHTS ----------
  const srchM = new THREE.MeshBasicMaterial({ color: '#c8d4ff', transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const SR = [[-1, 1], [1, -1]].map(([sx, sz], i) => { const g = new THREE.CylinderGeometry(2.6, 0.5, 120, 14, 1, true); g.translate(0, 60, 0); const m = new THREE.Mesh(g, srchM); m.position.set(sx * (WALL + 10), 0, sz * (WALL + 10)); scene.add(m); return { m, ph: i * 2.4 }; });
  // ---------- WIN: confetti + fireworks ----------
  const CN = phone ? 260 : 600, cPos = new Float32Array(CN * 3).fill(-999), cCol = new Float32Array(CN * 3), cV = Array.from({ length: CN }, () => ({ v: new THREE.Vector3(), life: 0 }));
  const CF = ['#c42d3c', '#f2f0ea', '#e6b45a', '#38bdf8', '#4ade80'].map(c => new THREE.Color(c)); for (let i = 0; i < CN; i++) { const c = CF[i % CF.length]; cCol.set([c.r, c.g, c.b], i * 3); }
  const cGeo = new THREE.BufferGeometry(); cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3)); cGeo.setAttribute('color', new THREE.BufferAttribute(cCol, 3));
  scene.add(new THREE.Points(cGeo, new THREE.PointsMaterial({ size: 0.22, vertexColors: true, map: dotTex, transparent: true, alphaTest: 0.2, depthWrite: false })));
  const FN = phone ? 120 : 260, fPos = new Float32Array(FN * 3).fill(-999), fV = Array.from({ length: FN }, () => ({ v: new THREE.Vector3(), life: 0 }));
  const fGeo = new THREE.BufferGeometry(); fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3)); const fMat = new THREE.PointsMaterial({ color: '#ffd38a', size: 0.5, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  scene.add(new THREE.Points(fGeo, fMat));
  let partyT = 0, confT = 0, fwT = 0, fi = 0;
  const firework = () => { const c = new THREE.Vector3(rr(-RING, RING), rr(18, 28), rr(-RING, RING)), n = phone ? 30 : 52; fMat.color.set(['#ffd38a', '#ff7a6a', '#7ad8ff', '#b8ff9a'][Math.floor(Math.random() * 4)]);
    for (let k = 0; k < n; k++) { const i = fi++ % FN, d = new THREE.Vector3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize().multiplyScalar(rr(6, 9)); fPos.set([c.x, c.y, c.z], i * 3); fV[i].v.copy(d); fV[i].life = rr(1.1, 1.6); }
    if (X.boom) try { X.boom(); } catch (e) {} };
  // ---------- per frame ----------
  let fr = 0;
  function tick(dt, t, cheer, phase, fighting) { fr++;
    // the wave: idle stands start one every ~10-16 s; on a win it keeps going
    waveT -= dt; if (waveOn <= 0 && waveT <= 0 && (!fighting || partyT > 0)) { waveOn = 0.01; waveA = rr(0, TAU); }
    if (waveOn > 0) { waveOn = Math.min(1, waveOn + dt * 2); waveA += dt * 1.25; }
    if (waveOn > 0) { wave.trav = (wave.trav || 0) + dt * 1.25; if (wave.trav > TAU * (partyT > 0 ? 3 : 2)) { waveOn = 0; wave.trav = 0; waveT = rr(10, 16); } if (fighting && partyT <= 0 && wave.trav > TAU) { waveOn = 0; wave.trav = 0; waveT = rr(10, 16); } }
    if (fr % 2 === 0) { flagsAt(t, cheer); penAt(t); }
    for (const q of BAN) q.b.rotation.y = q.ry + Math.sin(t * 1.3 + q.ph) * 0.06;
    // flashes
    flashT -= dt * (0.6 + cheer * 4 + (partyT > 0 ? 4 : 0)); if (flashT <= 0) { flashT = rr(0.2, 0.6); const f = FL.find(o => o.t <= 0), c = crowd[Math.floor(Math.random() * crowd.length)]; if (f && c) { f.t = 0.12; f.s.position.set(c.x, c.y + 1.0, c.z); } }
    for (const f of FL) { if (f.t > 0) f.t -= dt; f.s.material.opacity = f.t > 0 ? f.t / 0.12 : 0; }
    // floods + searchlights
    flood = Math.max(0, flood - dt * 0.8); beamM.opacity = 0.05 + flood * 0.12 + (partyT > 0 ? 0.03 * (1 + Math.sin(t * 6)) : 0);
    for (const s of SR) { s.m.rotation.set(0.35 + Math.sin(t * 0.21 + s.ph) * 0.25, 0, Math.sin(t * 0.33 + s.ph) * 0.45); }
    srchM.opacity = fighting ? 0.03 : 0.06;
    // party
    if (partyT > 0) { partyT -= dt; confT -= dt; fwT -= dt;
      if (confT <= 0) { confT = 0.05; for (let k = 0; k < (phone ? 4 : 9); k++) { const i = Math.floor(Math.random() * CN); if (cV[i].life > 0) continue; cPos.set([rr(-RING, RING), rr(14, 20), rr(-RING, RING)], i * 3); cV[i].v.set(rr(-0.6, 0.6), rr(-2.4, -1.4), rr(-0.6, 0.6)); cV[i].life = 9; } }
      if (fwT <= 0) { fwT = rr(0.7, 1.4); firework(); } }
    let any = false; for (let i = 0; i < CN; i++) { const c = cV[i]; if (c.life <= 0) continue; any = true; c.life -= dt; cPos[i * 3] += (c.v.x + Math.sin(t * 3 + i) * 0.5) * dt; cPos[i * 3 + 1] += c.v.y * dt; cPos[i * 3 + 2] += c.v.z * dt; if (c.life <= 0 || cPos[i * 3 + 1] < 0.05) { c.life = 0; cPos[i * 3 + 1] = -999; } }
    if (any) cGeo.attributes.position.needsUpdate = true;
    let fa = false; for (let i = 0; i < FN; i++) { const f = fV[i]; if (f.life <= 0) continue; fa = true; f.life -= dt; f.v.multiplyScalar(1 - dt * 1.6); f.v.y -= 3 * dt; fPos[i * 3] += f.v.x * dt; fPos[i * 3 + 1] += f.v.y * dt; fPos[i * 3 + 2] += f.v.z * dt; if (f.life <= 0) fPos[i * 3 + 1] = -999; }
    if (fa || partyT > 0) { fGeo.attributes.position.needsUpdate = true; fMat.opacity = 1; } }
  return { wave, tick, roundStart() { flood = 1; }, win() { partyT = 14; flood = 1; waveOn = 0.01; waveA = 0; wave.trav = 0; }, FANS, BEAM, SR };
}
