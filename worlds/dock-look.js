// 8 GATES — MERU SPACE DOCK [meruSpacedock] LOOK PASS (s129). Built + ticked inside meru-spacedock.js (LK). Decoration only.
// TRAFFIC: escort ships cross the sky in two lanes, some drop toward Meru ("eleven ships since dawn") · NAV LIGHTS blink on every deck end + spur end (red north, green south)
// SERVICE DRONES hover round the flagship and weld (sparks) · SPACE DUST drifts past the gantry · a SHOOTING STAR now and then
// BIRTHDAY FIREWORKS pop on Meru's surface below (King Might's birthday; off after the finale).
export function dockLook(X) {
  const { THREE, scene, glowTex, toon, L, SHIP, PC, PR, LOW, won } = X;
  const rr = (a, b) => a + Math.random() * (b - a), tmp = new THREE.Vector3();
  const glow = (col, op = 0.8) => new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, opacity: op, blending: THREE.AdditiveBlending });
  const SPR = (mat, x, y, z, s, parent) => { const sp = new THREE.Sprite(mat); sp.position.set(x, y, z); sp.scale.set(s, s, 1); (parent || scene).add(sp); return sp; };
  let T = 0;

  // ---------- NAV LIGHTS ----------
  const D = L.deck, navs = [];
  for (const [x, z, red] of [[D.x0, D.z0, 1], [D.x0, D.z1, 0], [D.x1, D.z0, 1], [D.x1, D.z1, 0], [L.spur.x0, L.spur.z0, 1], [L.spur.x1, L.spur.z0, 1], [L.spurS.x0, L.spurS.z1, 0], [L.spurS.x1, L.spurS.z1, 0]]) {
    const col = red ? 0xff3b1f : 0x22e07a; const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: col })); b.position.set(x, 1.12, z); scene.add(b);
    navs.push({ s: SPR(glow(col, 0), x, 1.12, z, 1.3), ph: red ? 0 : 0.5 }); }

  // ---------- TRAFFIC ----------
  const hullM = toon('#9aa6b6'), darkM = toon('#4b5563'), ships = [];
  function mkShip(sc, stripe) { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 3.2, 3, 8), hullM); h.rotation.x = Math.PI / 2; h.scale.y = 0.7; g.add(h);
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.2), darkM); w.position.set(s * 1.2, 0, 0.6); g.add(w); }
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.5, 1.4), toon(stripe)); st.position.set(0, 0.5, 0.9); g.add(st);
    const eng = SPR(glow(0x93deff, 0.9), 0, 0, 2.6, 2.4, g), nav = SPR(glow(0xff3b1f, 0), 0, 0.55, -1.6, 1.4, g); g.scale.setScalar(sc); scene.add(g); return { g, eng, nav }; }
  const LANES = [{ y: 26, z: -110, dir: 1, x0: -260, x1: 260 }, { y: 18, z: 95, dir: -1, x0: -240, x1: 240 }];
  const NS = LOW ? 3 : 6, stripes = ['#ec3013', '#e6b45a', '#38bdf8', '#f3f2f2', '#a78bfa', '#22c55e'];
  function launch(o, first) { const ln = LANES[Math.floor(Math.random() * 2)]; o.ln = ln; o.drop = Math.random() < 0.35; o.v = rr(14, 26) * ln.dir; o.x = first ? rr(ln.x0, ln.x1) : (ln.dir > 0 ? ln.x0 : ln.x1); o.y = ln.y + rr(-6, 10); o.z = ln.z + rr(-30, 30); o.vy = o.drop ? -rr(2, 4) : 0; o.ph = rr(0, 6); }
  for (let i = 0; i < NS; i++) { const o = mkShip(rr(0.9, 1.6), stripes[i % stripes.length]); launch(o, true); ships.push(o); }

  // ---------- SERVICE DRONES + WELD SPARKS ----------
  const HL = L.shipLen / 2, drones = [], sparks = [];
  for (let i = 0; i < 2; i++) { const g = new THREE.Group(); scene.add(g); const b = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), toon('#e5e7eb')); g.add(b); const r = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 6, 16), darkM); r.rotation.x = Math.PI / 2; g.add(r);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd23a })); eye.position.set(0, 0, 0.27); g.add(eye); const lt = SPR(glow(0xffd23a, 0.5), 0, 0, 0.3, 0.8, g);
    drones.push({ g, lt, side: i ? 1 : -1, z0: i ? -HL * 0.45 : HL * 0.35, ph: rr(0, 6), weld: rr(1, 3), wt: 0 }); }
  const sparkM = glow(0xfff1b8, 1);
  function spark(p) { const s = new THREE.Sprite(sparkM.clone()); s.position.copy(p); s.scale.setScalar(0.18); scene.add(s); sparks.push({ s, v: new THREE.Vector3(rr(-2, 2), rr(-1.5, 2), rr(-2, 2)), t: rr(0.3, 0.7) }); }

  // ---------- SPACE DUST ----------
  const DN = LOW ? 120 : 260, dPos = new Float32Array(DN * 3), BX = [D.x0 - 8, SHIP.x + 10], BY = [-6, 10], BZ = [-16, 16];
  for (let i = 0; i < DN; i++) dPos.set([rr(BX[0], BX[1]), rr(BY[0], BY[1]), rr(BZ[0], BZ[1])], i * 3);
  const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ map: glowTex, color: 0x9fc6ff, size: 0.14, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); dust.frustumCulled = false; scene.add(dust);

  // ---------- SHOOTING STAR ----------
  const star = SPR(glow(0xdfefff, 0), 0, 0, 0, 1); star.scale.set(14, 0.5, 1); let stT = rr(4, 9), stL = 0; const stV = new THREE.Vector3();

  // ---------- BIRTHDAY FIREWORKS on Meru ----------
  const fw = [], FWC = [0xec3013, 0xffd23a, 0xf3f2f2, 0x7dd3fc, 0xf472b6]; let fwT = 1;
  function firework() { const a = rr(0, 6.283), r = rr(0.08, 0.32), dir = tmp.set(Math.sin(r) * Math.cos(a) + 0.06, Math.cos(r), Math.sin(r) * Math.sin(a) + 0.12).normalize(); const p = dir.clone().multiplyScalar(PR * 1.004).add(PC);
    const col = FWC[Math.floor(Math.random() * FWC.length)], s = SPR(glow(col, 1), p.x, p.y, p.z, 1); fw.push({ s, t: 0, max: rr(10, 22) }); }

  function tick(dt) { T += dt; const t = T;
    for (const n of navs) { const u = (t * 0.7 + n.ph) % 1; n.s.material.opacity = u < 0.08 || (u > 0.16 && u < 0.24) ? 1 : 0; }
    for (const o of ships) { o.x += o.v * dt; o.y += o.vy * dt; o.g.position.set(o.x, o.y + Math.sin(t * 0.8 + o.ph) * 0.4, o.z); o.g.rotation.set(o.drop ? 0.25 : 0, o.v > 0 ? Math.PI / 2 : -Math.PI / 2, Math.sin(t * 0.6 + o.ph) * 0.06);
      o.eng.material.opacity = 0.7 + 0.3 * Math.sin(t * 20 + o.ph); o.nav.material.opacity = (t + o.ph) % 1.2 < 0.12 ? 1 : 0;
      if ((o.v > 0 && o.x > o.ln.x1) || (o.v < 0 && o.x < o.ln.x0) || o.y < -70) launch(o, false); }
    for (const d of drones) { const ang = t * 0.25 + d.ph, x = SHIP.x + d.side * (4.4 + Math.sin(t * 0.7 + d.ph) * 0.4), y = 1.4 + Math.sin(ang * 2) * 1.1, z = SHIP.z + d.z0 + Math.sin(ang) * HL * 0.35;
      d.g.position.set(x, y + Math.sin(t * 2.2 + d.ph) * 0.12, z); d.g.rotation.y = d.side > 0 ? -Math.PI / 2 : Math.PI / 2; d.weld -= dt;
      if (d.weld <= 0) { d.wt = rr(0.8, 1.6); d.weld = rr(2.5, 5); } if (d.wt > 0) { d.wt -= dt; d.lt.material.color.setHex(0xfff1b8); d.lt.material.opacity = Math.random() < 0.6 ? 1 : 0.3; d.lt.scale.setScalar(rr(0.8, 1.6)); if (Math.random() < (LOW ? 0.25 : 0.5)) { d.lt.getWorldPosition(tmp); spark(tmp); } } else { d.lt.material.color.setHex(0xffd23a); d.lt.material.opacity = 0.5; d.lt.scale.setScalar(0.8); } }
    for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.t -= dt; s.s.position.addScaledVector(s.v, dt); s.s.material.opacity = Math.max(0, s.t * 2); if (s.t <= 0) { scene.remove(s.s); s.s.material.dispose(); sparks.splice(i, 1); } }
    { const p = dGeo.attributes.position.array; for (let i = 0; i < DN; i++) { let x = p[i * 3] + dt * 0.35, y = p[i * 3 + 1] + Math.sin(t * 0.3 + i) * dt * 0.05; if (x > BX[1]) x = BX[0]; p[i * 3] = x; p[i * 3 + 1] = y; } dGeo.attributes.position.needsUpdate = true; }
    stT -= dt; if (stT <= 0 && stL <= 0) { stL = 0.9; stT = rr(7, 14); star.position.set(rr(-200, 200), rr(120, 260), rr(-500, -300)); stV.set(rr(180, 260) * (Math.random() < 0.5 ? -1 : 1), -rr(60, 110), 0); star.material.rotation = Math.atan2(stV.y, stV.x); }
    if (stL > 0) { stL -= dt; star.position.addScaledVector(stV, dt); star.material.opacity = Math.sin(Math.max(0, stL) / 0.9 * Math.PI) * 0.9; } else star.material.opacity = 0;
    if (!won()) { fwT -= dt; if (fwT <= 0) { fwT = rr(0.6, LOW ? 2.4 : 1.6); firework(); if (Math.random() < 0.3) firework(); } }
    for (let i = fw.length - 1; i >= 0; i--) { const f = fw[i]; f.t += dt; const u = f.t / 1.4; f.s.scale.setScalar(f.max * Math.min(1, u * 3)); f.s.material.opacity = Math.max(0, 1 - u) * (u < 0.1 ? 1 : 0.85); if (u >= 1) { scene.remove(f.s); f.s.material.dispose(); fw.splice(i, 1); } } }
  return { tick, firework, get ships() { return ships; } };
}
