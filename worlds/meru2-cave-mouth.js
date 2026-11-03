// MERU 2.0 — s128 RUINS CAVE PASS (look only; Ben: no inside yet). Built inside rsLife (meru2-ruins-life.js), ticks with the bats.
// Always: 2 TORCHES inside the mouth (warm flicker + halo, bigger at night) · CRYSTAL clusters at the mouth foot (violet + teal, slow pulse,
// glow at night) · a DEEP GLOW in the mouth · DRIPS off the arch into 2 puddles (ripple + plink within 18 m) · COLD BREATH mist at night/dawn.
// Story: BANDIT CAMP before maxHome (tent, fire, KEEP OUT sign; lit fire + red banner + 2 BANDIT GUARDS who watch you until maxFreed) →
// DIG SITE after maxHome (rope line, DIG SITE sign, lamp line into the mouth, rails + mine cart, crates, timber shoring in the arch).
// Mouth face x -431.65, centre z 0, ground y 0 (as meru2-blockout.js). Hook: __ruinsJobs.LF.CM.
export function caveMouth(X) {
  const { THREE, scene, kit, CT, LM, softT, hour, touch, tone, save } = X;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const H = () => (hour ? hour() : 12), flag = k => { try { return !!save.flag(k); } catch (e) { return false; } };
  const XF = -431.65, CAVE = [-432, 0];
  const G = new THREE.Group(); G.name = 'ruinsCaveMouth'; scene.add(G);
  const add = (geo, mat, x, y, z, par = G) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); par.add(m); return m; };
  const box = (w, h, d, mat, x, y, z, par) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, par);
  const glowM = c => new THREE.SpriteMaterial({ map: softT, color: c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const sprite = (c, x, y, z, s, par = G) => { const sp = new THREE.Sprite(glowM(c)); sp.position.set(x, y, z); sp.scale.setScalar(s); par.add(sp); return sp; };
  const WOOD = LM('#7a5634'), WOODD = LM('#4a3220'), IRON = LM('#3a3634'), CLOTH = LM('#8a7356');
  const sign = (lines, bg, fg, w, h) => { const t = CT(256, Math.round(256 * h / w), (g, W, Hh) => { g.fillStyle = bg; g.fillRect(0, 0, W, Hh); g.fillStyle = fg; g.textBaseline = 'middle';
    const fs = Math.round(Hh / (lines.length + 0.9)); g.font = '900 ' + fs + 'px Archivo, sans-serif'; lines.forEach((s, i) => g.fillText(s, 14, Hh * (i + 1) / (lines.length + 1), W - 28)); });
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t })); };
  // ---------- TORCHES inside the mouth ----------
  const flameM = new THREE.MeshBasicMaterial({ color: '#ffb347' }), coreM = new THREE.MeshBasicMaterial({ color: '#fff1b8' });
  const TORCH = [-4.6, 4.6].map((z, i) => { box(0.1, 0.1, 0.5, IRON, XF + 0.25, 2.1, z - Math.sign(z) * 0.2); const st = add(new THREE.CylinderGeometry(0.06, 0.05, 0.7, 6), WOODD, XF + 0.25, 2.25, z - Math.sign(z) * 0.45);
    const fl = add(new THREE.ConeGeometry(0.16, 0.5, 7), flameM, XF + 0.25, 2.8, z - Math.sign(z) * 0.45), co = add(new THREE.ConeGeometry(0.07, 0.26, 6), coreM, XF + 0.25, 2.7, z - Math.sign(z) * 0.45);
    const halo = sprite('#ffa04a', XF + 0.3, 2.8, z - Math.sign(z) * 0.45, 2.2), pool = sprite('#ff9a3c', XF + 0.6, 0.15, z - Math.sign(z) * 0.6, 3.4); return { fl, co, halo, pool, ph: i * 2.1 }; });
  // ---------- CRYSTALS at the mouth foot ----------
  const CRY = [['#b98bff', XF + 0.35, -3.4], ['#6fe0d0', XF + 0.6, -5.2], ['#b98bff', XF + 0.4, 3.6], ['#6fe0d0', XF + 0.9, 5.6], ['#d7c2ff', XF + 0.2, -1.9]].map(([c, x, z], i) => {
    const base = new THREE.Color(c), m = new THREE.MeshBasicMaterial({ color: base.clone() }), n = 3 + (i % 3);
    for (let k = 0; k < n; k++) { const h = rnd(0.35, 1.0) * (k === 0 ? 1.4 : 1), s = add(new THREE.OctahedronGeometry(0.16, 0), m, x + rnd(-0.3, 0.3), h * 0.45, z + rnd(-0.35, 0.35)); s.scale.set(1, h * 3, 1); s.rotation.set(rnd(-0.4, 0.4), rnd(0, 3), rnd(-0.4, 0.4)); }
    return { m, base, glow: sprite(c, x + 0.2, 0.6, z, 2.2), ph: rnd(0, 6.3) }; });
  const deep = sprite('#8a6fd0', XF + 0.1, 1.8, 0, 7);
  // ---------- DRIPS + puddles ----------
  const pudM = new THREE.MeshBasicMaterial({ color: '#2a2a33', transparent: true, opacity: 0.7, depthWrite: false });
  const PUD = [[XF + 0.9, -1.6, 0.7], [XF + 1.3, 2.2, 0.55]].map(([x, z, r]) => { const p = add(new THREE.CircleGeometry(r, 16), pudM, x, 0.025, z); p.rotation.x = -Math.PI / 2; return { x, z, r }; });
  const dropM = new THREE.MeshBasicMaterial({ color: '#cfe6ff' }), ringM = () => new THREE.MeshBasicMaterial({ color: '#cfe6ff', transparent: true, opacity: 0, depthWrite: false });
  const DRIP = PUD.map((p, i) => { const d = add(new THREE.SphereGeometry(0.035, 5, 4), dropM, p.x, 5.6, p.z); d.scale.y = 1.8; d.visible = false; const ring = add(new THREE.RingGeometry(0.06, 0.09, 16), ringM(), p.x, 0.04, p.z); ring.rotation.x = -Math.PI / 2;
    return { ...p, d, ring, top: Math.sqrt(Math.max(1, 6.0 * 6.0 - p.z * p.z)) - 0.5, t: rnd(0.5, 3), vy: 0, rt: 0 }; });
  // ---------- COLD BREATH ----------
  const MIST = Array.from({ length: touch ? 4 : 7 }, () => { const s = sprite('#9fb2c8', XF, 0.6, 0, 2); return { s, t: rnd(0, 6), life: rnd(5, 8), z: rnd(-3.5, 3.5) }; });
  // ---------- BANDIT CAMP (until maxHome) ----------
  const CAMP = new THREE.Group(); G.add(CAMP); const LIVE = new THREE.Group(); CAMP.add(LIVE);
  { const tent = add(new THREE.ConeGeometry(2.2, 2.6, 4, 1, true), CLOTH, -423.5, 1.3, 11.5, CAMP); tent.rotation.y = Math.PI / 4; tent.material.side = THREE.DoubleSide;
    add(new THREE.CircleGeometry(0.9, 3), LM('#1e1814'), -421.95, 0.6, 11.5, CAMP).rotation.y = Math.PI / 2;
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; add(new THREE.DodecahedronGeometry(0.18, 0), LM('#6e6458'), -424.5 + Math.cos(a) * 0.6, 0.1, 5.8 + Math.sin(a) * 0.6, CAMP); }
    for (let i = 0; i < 3; i++) { const l = box(0.9, 0.1, 0.1, WOODD, -424.5, 0.08, 5.8, CAMP); l.rotation.y = i * 1.05; }
    add(new THREE.CylinderGeometry(0.22, 0.25, 0.45, 8), WOOD, -426.2, 0.22, 5.2, CAMP); add(new THREE.CylinderGeometry(0.22, 0.25, 0.45, 8), WOOD, -423.2, 0.22, 4.4, CAMP);
    box(0.08, 1.4, 0.08, WOODD, -427.2, 0.7, -3.4, CAMP); const ks = sign(['KEEP OUT', 'BANDITS ONLY'], '#3a2a1c', '#e8d3a8', 1.3, 0.62); ks.position.set(-427.15, 1.25, -3.4); ks.rotation.set(0, Math.PI / 2, 0.08); CAMP.add(ks);
    for (const s of [-1, 1]) { const pl = box(0.1, 0.12, 3.2, WOODD, XF + 1.6, 0.9 + s * 0.35, s * 1.9 + (s > 0 ? 3.6 : -3.6) * 0, CAMP); pl.rotation.x = s * 0.5; } }
  const fireM = new THREE.MeshBasicMaterial({ color: '#ff8a2a' }), FIRE = add(new THREE.ConeGeometry(0.3, 0.8, 7), fireM, -424.5, 0.45, 5.8, LIVE), fireHalo = sprite('#ff8a3c', -424.5, 0.8, 5.8, 3.2, LIVE);
  box(0.07, 3.6, 0.07, WOODD, -428.6, 1.8, -6.2, LIVE); const BAN = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), new THREE.MeshBasicMaterial({ color: '#a3201a', side: THREE.DoubleSide }));
  BAN.position.set(-428.6, 3.2, -5.65); LIVE.add(BAN); { const p = BAN.geometry.attributes.position; BAN.userData.x0 = Array.from({ length: p.count }, (_, i) => p.getZ(i)); }
  const GUARD = [[-428.2, -2.6], [-428.2, 2.6]].map(([x, z], i) => { const f = kit.makeFox({ key: 'caveBandit' + i, torso: ['#5a2a24', '#3a1a16', '#1a0c0a'], outfit: 'coat', mood: 'angry' }); f.position.set(x, 0, z); f.rotation.y = Math.PI / 2; LIVE.add(f); return { f, x, z, rest: Math.PI / 2 }; });
  // ---------- DIG SITE (after maxHome) ----------
  const DIG = new THREE.Group(); G.add(DIG);
  { for (const z of [-4.8, 4.8]) { box(0.3, 4.6, 0.3, WOOD, XF + 0.5, 2.3, z, DIG); } box(0.32, 0.32, 10.2, WOOD, XF + 0.5, 4.55, 0, DIG);
    for (const z of [2.1, 3.0]) box(7, 0.06, 0.08, IRON, XF + 3.1, 0.05, z, DIG); for (let i = 0; i < 9; i++) box(0.14, 0.05, 1.3, WOODD, XF + 0.2 + i * 0.75, 0.025, 2.55, DIG);
    const cart = new THREE.Group(); cart.position.set(XF + 4.2, 0, 2.55); DIG.add(cart); box(1.2, 0.6, 0.85, IRON, 0, 0.6, 0, cart); box(1.1, 0.12, 0.75, LM('#a08a62'), 0, 0.92, 0, cart);
    for (const sx of [-0.4, 0.4]) for (const sz of [-0.45, 0.45]) { const w = add(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 10), LM('#201e1d'), sx, 0.2, sz, cart); w.rotation.x = Math.PI / 2; }
    for (const [x, z, s] of [[-426.5, 6.5, 0.7], [-425.7, 6.9, 0.55], [-426.2, 7.6, 0.5]]) box(s, s, s, WOOD, x, s / 2, z, DIG);
    box(0.08, 1.5, 0.08, WOODD, -427.2, 0.75, -3.4, DIG); const ds = sign(['DIG SITE', 'RUINS CAVE \u00b7 MIND THE RAILS'], '#f3f2f2', '#201e1d', 1.5, 0.66); ds.position.set(-427.15, 1.3, -3.4); ds.rotation.y = Math.PI / 2; DIG.add(ds);
    const rope = LM('#c9a24a'); [[-427.5, -6.5], [-424.5, -6.5], [-424.5, -4.2]].forEach(([x, z]) => { box(0.07, 0.9, 0.07, WOODD, x, 0.45, z, DIG); }); box(3, 0.03, 0.03, rope, -426, 0.8, -6.5, DIG); box(0.03, 0.03, 2.3, rope, -424.5, 0.8, -5.35, DIG); }
  const BULB = []; { const bulbM = new THREE.MeshBasicMaterial({ color: '#ffe6a0' }); const pts = [[-426.4, -3.2], [-428.6, -3.2], [XF + 0.9, -3.0], [XF + 0.3, -1.4], [XF + 0.3, 1.4]];
    pts.forEach(([x, z], i) => { if (i < 2) box(0.07, 2.6, 0.07, WOODD, x, 1.3, z, DIG); const y = i < 2 ? 2.6 : 3.6 - Math.abs(z) * 0.2, b = add(new THREE.SphereGeometry(0.09, 6, 5), bulbM, x, y - 0.18, z, DIG); BULB.push({ b, h: sprite('#ffd27a', x, y - 0.18, z, 1.3, DIG), ph: i }); });
    for (let i = 0; i < pts.length - 1; i++) { const a = V(pts[i][0], i < 2 ? 2.6 : 3.6 - Math.abs(pts[i][1]) * 0.2, pts[i][1]), b = V(pts[i + 1][0], i + 1 < 2 ? 2.6 : 3.6 - Math.abs(pts[i + 1][1]) * 0.2, pts[i + 1][1]);
      const c = box(0.025, 0.025, a.distanceTo(b), LM('#201e1d'), (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, DIG); c.lookAt(b); } }
  // ---------- story state ----------
  let stT = 0, STATE = '';
  const story = () => { const s = flag('maxHome') ? 'dig' : flag('maxFreed') ? 'left' : 'camp'; if (s === STATE) return; STATE = s; CAMP.visible = s !== 'dig'; LIVE.visible = s === 'camp'; DIG.visible = s === 'dig'; };
  // ---------- per frame ----------
  function tick(dt, t, PW) { const d = Math.hypot(PW.x - CAVE[0], PW.z - CAVE[1]); G.visible = d < (touch ? 70 : 100); if (!G.visible) return;
    stT -= dt; if (stT <= 0) { stT = 2; story(); }
    const h = H(), nk = h >= 20 || h < 6 ? 1 : h >= 18 || h < 7 ? 0.6 : 0.25;
    for (const o of TORCH) { const f = 0.85 + Math.sin(t * 13 + o.ph) * 0.08 + Math.sin(t * 29 + o.ph * 3) * 0.06; o.fl.scale.set(1, f, 1); o.co.scale.set(1, f * 1.05, 1);
      o.halo.material.opacity = (0.35 + nk * 0.45) * f; o.halo.scale.setScalar(1.8 + nk * 1.4); o.pool.material.opacity = (0.08 + nk * 0.25) * f; }
    for (const c of CRY) { const p = 0.5 + 0.5 * Math.sin(t * 0.9 + c.ph); c.m.color.copy(c.base).multiplyScalar(0.7 + 0.45 * p); c.glow.material.opacity = (0.08 + nk * 0.35) * (0.6 + 0.4 * p); }
    deep.material.opacity = (0.05 + nk * 0.12) * (0.8 + 0.2 * Math.sin(t * 0.5));
    for (const q of DRIP) { if (!q.d.visible) { q.t -= dt; if (q.t <= 0) { q.d.visible = true; q.d.position.y = q.top; q.vy = 0; } }
      else { q.vy -= 9.8 * dt; q.d.position.y += q.vy * dt; if (q.d.position.y <= 0.05) { q.d.visible = false; q.t = rnd(1.6, 4.5); q.rt = 0.9; if (d < 18 && tone) try { tone(rnd(1400, 2100), 0.025 * (1 - d / 18), 0.12, 'sine'); } catch (e) {} } }
      if (q.rt > 0) { q.rt -= dt; const k = 1 - q.rt / 0.9; q.ring.scale.setScalar(1 + k * 5); q.ring.material.opacity = 0.6 * (1 - k); } }
    const mk = h >= 21 || h < 8 ? 1 : 0.15; for (const m of MIST) { m.t += dt; if (m.t > m.life) { m.t = 0; m.life = rnd(5, 8); m.z = rnd(-3.5, 3.5); } const k = m.t / m.life;
      m.s.position.set(XF + 0.3 + k * 6, 0.35 + k * 0.6, m.z + Math.sin(k * 3 + m.z) * 0.6); m.s.scale.setScalar(1.6 + k * 2.6); m.s.material.opacity = 0.16 * mk * Math.sin(k * Math.PI); }
    if (LIVE.visible) { const f = 0.85 + Math.sin(t * 11) * 0.1 + Math.sin(t * 23) * 0.07; FIRE.scale.set(1, f, 1); fireHalo.material.opacity = (0.3 + nk * 0.4) * f;
      { const p = BAN.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + 0.55; p.setZ(i, Math.sin(t * 3 + x * 4) * 0.08 * x); } p.needsUpdate = true; }
      for (const g of GUARD) { const dx = PW.x - g.x, dz = PW.z - g.z, near = Math.hypot(dx, dz) < 12, goal = near ? Math.atan2(dx, dz) : g.rest; let a = goal - g.f.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); g.f.rotation.y += a * Math.min(1, dt * 4);
        if (!touch || d < 40) try { kit.animFox(g.f, dt, 0, false); } catch (e) {} } }
    if (DIG.visible) for (const b of BULB) b.h.material.opacity = (0.2 + nk * 0.5) * (0.92 + 0.08 * Math.sin(t * 7 + b.ph)); }
  return { G, tick, TORCH, CRY, DRIP, GUARD, state: () => STATE, dispose() { scene.remove(G); } };
}
