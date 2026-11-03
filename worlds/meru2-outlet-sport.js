// MERU 2.0 — s151c OUTLETS STORE 1: SPORTING GOODS (unit 1, worlds/meru2-outlets.js runs the fight). Wrecked, dusty, half the tubes dead.
// Cover (all breakable): 2 BALL CAGES by the door (balls spill out), 3 TENTS pitched mid-floor (2 domes + an A-frame), the CANOE + KAYAK rack on the
// west wall, TREADMILLS + a WEIGHT BENCH on the east side. Decor: climbing wall, archery targets on the back wall (shoot them: BULLSEYE),
// a faded EVERYTHING MUST GO banner, shoe boxes everywhere. Lieutenant: THE COACH (hockey mask, whistle), key 1 of 4.
export function buildSport({ THREE, M, toon, scene, b, touch }) {
  const [x0, x1, z0, z1] = b.f, dir = b.face === 'N' ? 1 : -1, ZF = b.face === 'N' ? z0 : z1, cx = (x0 + x1) / 2, H = (b.sty && b.sty.h) || 7;
  const W = (a, d) => [cx + a, ZF + dir * d];   // a = metres across (west −, east +), d = metres in from the front wall
  const root = new THREE.Group(); root.name = 'outletSport'; scene.add(root);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const T = h => toon(h), MT = { ink: T('#201e1d'), steel: T('#8a9096'), dark: T('#3d3b3a'), orange: T('#e8742a'), green: T('#3f7a52'), blue: T('#2e5f8a'), red: T('#c8262c'), yellow: T('#ffd23a'), wood: T('#8b6a48'), cream: T('#e9e3d6'), box: T('#c9a06a'), rubber: T('#2a2a2c') };
  const ry0 = dir > 0 ? 0 : Math.PI;
  // floor: dusty linoleum with scuffs + grime
  { const t = CT(256, 256, (g, w, h) => { g.fillStyle = '#6f6a63'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'; g.fillRect(i * 32, j * 32, 32, 32); }
      for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.6 ? 'rgba(40,32,26,0.12)' : 'rgba(255,248,236,0.06)'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3); }
      for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(30,24,20,0.12)'; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 12 + Math.random() * 30, 6 + Math.random() * 16, Math.random() * 3, 0, 7); g.fill(); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); const fl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 - 0.8, z1 - z0 - 0.8), new THREE.MeshLambertMaterial({ map: t })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0.035, (z0 + z1) / 2); root.add(fl); }
  // flickering tubes (half dead) + their glow
  const glowT = CT(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const tubes = []; for (const [a, d, dead] of [[-5, 5, 0], [5, 5, 1], [-5, 12, 0], [5, 12, 0], [-5, 18, 1], [5, 18, 0]]) { const [x, z] = W(a, d), m = new THREE.MeshBasicMaterial({ color: dead ? 0x3a3a38 : 0xeef6ff }); const tb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.18), m); tb.position.set(x, H - 0.55, z); tb.rotation.y = ry0; root.add(tb);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xdff0ff, transparent: true, depthWrite: false, opacity: dead ? 0 : 0.55, blending: THREE.AdditiveBlending })); s.position.set(x, H - 0.7, z); s.scale.set(4, 1.6, 1); root.add(s);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), new THREE.MeshBasicMaterial({ map: glowT, color: 0xcfe2ff, transparent: true, depthWrite: false, opacity: dead ? 0 : 0.18, blending: THREE.AdditiveBlending })); pool.rotation.x = -Math.PI / 2; pool.position.set(x, 0.05, z); root.add(pool);
    tubes.push({ m, s, pool, dead, t: Math.random() * 5, k: 1 }); }
  // dust motes in the light
  const motes = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: (touch ? 40 : 90) * 3 }, (_, i) => i % 3 === 0 ? x0 + 1 + Math.random() * (x1 - x0 - 2) : i % 3 === 1 ? 0.5 + Math.random() * (H - 1.5) : Math.min(z0, z1) + 1 + Math.random() * (Math.abs(z1 - z0) - 2)), 3)), new THREE.PointsMaterial({ color: 0xfff2d8, size: 0.06, transparent: true, opacity: 0.55, depthWrite: false }));
  root.add(motes);
  // signs: faded banner on the back wall + the old header over the door (inside)
  const banner = (txt, sub, w, h, col, bg) => CT(512, Math.round(512 * h / w), (g, cw, ch) => { g.fillStyle = bg; g.fillRect(0, 0, cw, ch); g.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 40; i++) g.fillRect(Math.random() * cw, Math.random() * ch, 30, 2); g.fillStyle = col; g.font = '900 ' + Math.round(ch * 0.42) + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 18, ch * 0.4); if (sub) { g.font = '800 ' + Math.round(ch * 0.2) + 'px Archivo, sans-serif'; g.fillText(sub, 20, ch * 0.78); } });
  let backBan = null, banOld = null, banNew = null; { const [x, z] = W(0, Math.abs(z1 - z0) - 0.45); banOld = banner('EVERYTHING MUST GO', '70% OFF · ALL SALES FINAL', 8, 1.6, '#ffd23a', '#8a2a24'); const p = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.6), new THREE.MeshLambertMaterial({ map: banOld, transparent: true })); p.position.set(x, 4.8, z); p.rotation.set(0, ry0 + Math.PI, 0.04); root.add(p); backBan = p; }
  { const [x, z] = W(0, 0.4), p = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.1), new THREE.MeshLambertMaterial({ map: banner('SPORTING GOODS', 'GEAR UP · GET OUT THERE', 7, 1.1, '#f3f2f2', '#2e5f8a') })); p.position.set(x, 5.2, z); p.rotation.y = ry0; root.add(p); }
  // ---------- breakable cover ----------
  const bars = [], at = (a, d) => W(a, d);
  const mk = (kind, a, d, w, dd, hp, build, onBreak) => { const [x, z] = at(a, d), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry0; root.add(g); build(g); const B = { g, x, z, w, d: dd, ry: ry0, hp, kind, onBreak: () => onBreak(B) }; bars.push(B); return B; };
  // ball cages: wire frame + a load of balls; broken = the cage topples and the balls roll everywhere
  const balls = [], ballCols = ['#ec3013', '#ffd23a', '#2e86b8', '#f3f2f2', '#e8742a', '#3f9a5e'];
  const cage = (a, d) => mk('cage', a, d, 1.9, 1.3, 50, g => { const r = (x, y, z, sx, sy, sz) => M(new THREE.BoxGeometry(sx, sy, sz), MT.steel, x, y, z, g, 0); for (const sx of [-0.9, 0.9]) for (const sz of [-0.6, 0.6]) r(sx, 0.85, sz, 0.05, 1.7, 0.05); for (const y of [0.05, 1.7]) { r(0, y, -0.6, 1.85, 0.05, 0.05); r(0, y, 0.6, 1.85, 0.05, 0.05); r(-0.9, y, 0, 0.05, 0.05, 1.25); r(0.9, y, 0, 0.05, 0.05, 1.25); }
      const wire = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.65, 1.2), new THREE.MeshBasicMaterial({ color: 0x9aa0a6, wireframe: true, transparent: true, opacity: 0.35 })); wire.position.y = 0.85; g.add(wire);
      g.userData.balls = []; for (let i = 0; i < (touch ? 9 : 14); i++) { const bl = M(new THREE.SphereGeometry(0.2 + Math.random() * 0.08, 10, 8), T(ballCols[i % 6]), -0.6 + Math.random() * 1.2, 0.25 + (i % 3) * 0.38, -0.35 + Math.random() * 0.7, g, 0.01); g.userData.balls.push(bl); } },
    B => { B.g.rotation.z = 1.2; B.g.position.y = 0.4; for (const bl of B.g.userData.balls) { const w = new THREE.Vector3(); bl.getWorldPosition(w); B.g.remove(bl); bl.position.copy(w); root.add(bl); balls.push({ m: bl, v: new THREE.Vector3((Math.random() - 0.5) * 6, 2 + Math.random() * 3, (Math.random() - 0.5) * 6), r: bl.geometry.parameters.radius }); } });
  cage(-6.5, 3.5); cage(6.5, 3.5);
  // tents (dome + A-frame): broken = the tent collapses flat
  const dome = (a, d, mat) => mk('tent', a, d, 3.2, 3.2, 70, g => { const s = M(new THREE.SphereGeometry(1.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat, 0, 0, 0, g, 0.03); s.scale.y = 0.8; M(new THREE.CircleGeometry(0.55, 12, 0, Math.PI), MT.ink, 0, 0.02, 1.47, g, 0).rotation.x = 0;
      for (const k of [0, 1]) { const p = M(new THREE.TorusGeometry(1.6, 0.025, 4, 24, Math.PI), MT.dark, 0, 0, 0, g, 0); p.scale.y = 0.8; p.rotation.y = k * Math.PI / 2 + Math.PI / 4; } }, B => { B.g.scale.y = 0.18; B.g.rotation.z = 0.08; });
  const aframe = (a, d) => mk('tent', a, d, 2.4, 3, 70, g => { const pr = M(new THREE.CylinderGeometry(1.25, 1.25, 3, 3, 1), MT.blue, 0, 0.62, 0, g, 0.03); pr.rotation.x = Math.PI / 2; pr.rotation.y = Math.PI; pr.scale.set(1, 1, 1);
      M(new THREE.BoxGeometry(0.06, 1.9, 0.06), MT.dark, 0, 0.95, 1.52, g, 0); M(new THREE.BoxGeometry(0.06, 1.9, 0.06), MT.dark, 0, 0.95, -1.52, g, 0); }, B => { B.g.scale.y = 0.15; });
  dome(-6, 9.5, MT.orange); dome(6, 9.5, MT.green); aframe(0, 13);
  // canoe + kayak rack (west wall)
  mk('rack', -9.4, 15, 1.2, 6.4, 90, g => { for (const sz of [-2.6, 2.6]) { M(new THREE.BoxGeometry(0.12, 2.6, 0.12), MT.wood, 0, 1.3, sz, g, 0.01); for (const y of [0.9, 1.7, 2.4]) M(new THREE.BoxGeometry(1.0, 0.08, 0.12), MT.wood, 0, y, sz, g, 0); }
      for (const [y, c, l] of [[1.0, MT.red, 3.1], [1.8, MT.yellow, 2.8], [2.5, MT.green, 3.2]]) { const h = M(new THREE.SphereGeometry(0.5, 14, 8), c, 0, y + 0.15, 0, g, 0.02); h.scale.set(0.75, 0.42, l * 2); } }, B => { B.g.rotation.z = -0.5; B.g.position.y = 0.2; });
  // treadmills + weight bench (east)
  mk('gym', 7.6, 15.5, 2.8, 4.8, 100, g => { for (const dz of [-1.5, 1.5]) { M(new THREE.BoxGeometry(0.8, 0.25, 1.8), MT.rubber, -0.6, 0.15, dz, g, 0.015); for (const s of [-0.34, 0.34]) M(new THREE.BoxGeometry(0.06, 1.2, 0.06), MT.steel, -0.6 + s, 0.75, dz - 0.85, g, 0); M(new THREE.BoxGeometry(0.75, 0.3, 0.12), MT.dark, -0.6, 1.35, dz - 0.85, g, 0.01); }
      M(new THREE.BoxGeometry(0.4, 0.45, 1.3), MT.red, 0.9, 0.3, 0, g, 0.015); const bar = M(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6), MT.steel, 0.9, 1.1, 0, g, 0); bar.rotation.x = Math.PI / 2; for (const s of [-0.75, 0.75]) { const w = M(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 14), MT.ink, 0.9, 1.1, s, g, 0); w.rotation.x = Math.PI / 2; }
      for (const s of [-0.18, 0.18]) M(new THREE.BoxGeometry(0.05, 1.1, 0.05), MT.steel, 0.9, 0.55, s * 4, g, 0); }, B => { B.g.rotation.x = 0.35; B.g.position.y = -0.1; });
  // ---------- decor: climbing wall, archery targets, shoe boxes, a fallen shelf ----------
  { const [x, z] = W(10.7, 6.5), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry0 - Math.PI / 2; root.add(g); M(new THREE.BoxGeometry(5.4, 5.2, 0.2), MT.cream, 0, 2.6, 0, g, 0.02);
    for (let i = 0; i < (touch ? 22 : 38); i++) M(new THREE.SphereGeometry(0.11 + Math.random() * 0.07, 6, 4), T(ballCols[i % 6]), -2.4 + Math.random() * 4.8, 0.4 + Math.random() * 4.5, 0.13, g, 0); }
  const ringT = CT(128, 128, (g) => { const c = ['#f3f2f2', '#201e1d', '#2e86b8', '#ec3013', '#ffd23a']; for (let i = 0; i < 5; i++) { g.fillStyle = c[i]; g.beginPath(); g.arc(64, 64, 62 - i * 12, 0, 7); g.fill(); } });
  const targets = []; for (const a of [-6, -3]) { const [x, z] = W(a, Math.abs(z1 - z0) - 1.2), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry0 + Math.PI; root.add(g);
    for (const s of [-0.5, 0.5]) { const l = M(new THREE.BoxGeometry(0.08, 1.9, 0.08), MT.wood, s, 0.9, 0.25, g, 0); l.rotation.x = -0.15; }
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.7, 24), new THREE.MeshLambertMaterial({ map: ringT })); face.position.set(0, 1.5, 0.06); g.add(face); targets.push({ x, z, g, face, hit: 0 }); }
  const junk = []; for (let i = 0; i < (touch ? 10 : 18); i++) { const a = (Math.random() - 0.5) * 18, d = 2 + Math.random() * 17; if (Math.abs(a) < 2.2 && d < 9) continue; const [x, z] = W(a, d); const m = M(new THREE.BoxGeometry(0.42, 0.18, 0.26), Math.random() < 0.5 ? MT.box : MT.red, x, 0.09 + (Math.random() < 0.3 ? 0.18 : 0), z, root, 0.005); m.rotation.y = Math.random() * 3; junk.push(m); }
  let fallen = null; { const [x, z] = W(-4, 18.5); const sh = fallen = M(new THREE.BoxGeometry(4, 0.2, 1.2), MT.steel, x, 0.3, z, root, 0.015); sh.rotation.set(0.25, ry0 + 0.4, 0.15); }
  // ---------- spots ----------
  const posts = [[-6.5, 5.1], [6.5, 5.1], [-6, 11.6], [6, 11.6]].map(([a, d]) => W(a, d)), ltPost = W(0, 15.4);
  const inner = [x0 + 0.9, x1 - 0.9, Math.min(z0, z1) + 0.9, Math.max(z0, z1) - 0.9];
  // the Coach's look: red + white tracksuit, hockey mask, whistle
  const lt = { name: 'THE COACH', look: { outfit: 'vest', torso: ['#c8262c', '#f3f2f2', '#201e1d'], gear: 'laser' }, hp: 180,
    prop(P2) { if (!P2 || !P2.head) return; const m = new THREE.Group(); m.position.set(0, 0.02, 0.2); P2.head.add(m); M(new THREE.BoxGeometry(0.34, 0.38, 0.06), MT.cream, 0, 0, 0, m, 0.01); for (const [x, y] of [[-0.08, 0.06], [0.08, 0.06], [-0.05, -0.08], [0.05, -0.08], [0, -0.12]]) M(new THREE.BoxGeometry(0.05, 0.03, 0.02), MT.ink, x, y, 0.035, m, 0); M(new THREE.BoxGeometry(0.3, 0.04, 0.02), MT.red, 0, 0.13, 0.035, m, 0);
      if (P2.body) { const w = M(new THREE.CylinderGeometry(0.04, 0.04, 0.09, 8), MT.yellow, 0, 1.0, 0.26, P2.body, 0); w.rotation.x = Math.PI / 2; } } };
  const lines = ['WHO PITCHES A TENT INDOORS?!', 'HUSTLE, BOYS! HUSTLE!', 'THESE SNEAKERS ARE MINE!', 'I\'M ON MY BREAK!', 'GIVE ME FIFTY! LASERS!', 'NOBODY TOUCH THE KAYAKS!'];
  function reset() { for (const B of bars) { B.g.rotation.set(0, B.ry, 0); B.g.position.set(B.x, 0, B.z); B.g.scale.set(1, 1, 1); if (B.kind === 'cage') for (const bl of B.g.userData.balls) if (bl.parent !== B.g) { root.remove(bl); B.g.add(bl); bl.position.set(-0.6 + Math.random() * 1.2, 0.25 + Math.random() * 0.8, -0.35 + Math.random() * 0.7); } }
    balls.length = 0; for (const t of targets) t.hit = 0; }
  function tick(dt, P) { root.visible = Math.hypot(P.x - cx, P.z - (z0 + z1) / 2) < 70; if (!root.visible) return;
    for (const t of tubes) { if (t.dead) { t.t -= dt; if (t.t <= 0) { t.t = 2 + Math.random() * 6; t.k = 0.6; } t.k = Math.max(0, t.k - dt * 3); const on = t.k > 0 && Math.random() < 0.6; t.m.color.setHex(on ? 0xeef6ff : 0x3a3a38); t.s.material.opacity = on ? 0.45 : 0; t.pool.material.opacity = on ? 0.14 : 0; }
      else if (Math.random() < dt * 0.25) { t.m.color.setHex(0x5a5a58); t.s.material.opacity = 0.1; setTimeout(() => { t.m.color.setHex(0xeef6ff); t.s.material.opacity = 0.55; }, 70 + Math.random() * 120); } }
    const pa = motes.geometry.attributes.position; for (let i = 0; i < pa.count; i++) { let y = pa.getY(i) + dt * 0.05; if (y > H - 1) y = 0.5; pa.setY(i, y); } pa.needsUpdate = true;
    for (const q of balls) { if (!q.v) continue; q.v.y -= 14 * dt; q.m.position.addScaledVector(q.v, dt); if (q.m.position.y < q.r) { q.m.position.y = q.r; q.v.y *= -0.45; q.v.x *= 0.8; q.v.z *= 0.8; if (Math.abs(q.v.y) < 0.4 && Math.hypot(q.v.x, q.v.z) < 0.2) q.v = null; }
      if (q.v) { const p = q.m.position; if (p.x < inner[0] || p.x > inner[1]) q.v.x *= -0.6; if (p.z < inner[2] || p.z > inner[3]) q.v.z *= -0.6; p.x = Math.max(inner[0], Math.min(inner[1], p.x)); p.z = Math.max(inner[2], Math.min(inner[3], p.z)); } }
    for (const t of targets) if (t.hit > 0) { t.hit -= dt; t.g.rotation.z = Math.sin(t.hit * 30) * 0.05 * t.hit; } }
  const hitTargets = toast => targets.map(t => ({ x: t.x, z: t.z, r: 0.8, onHit: k => { if (k !== 'range') return; t.hit = 0.6; toast('BULLSEYE!', 1); } }));
  // s155 STORES OPEN (worlds/meru2-outlet-open.js): the fixed store = every tube on, the junk + fallen shelf gone, a GRAND REOPENING banner
  for (const t of tubes) t.dead0 = t.dead; let isOpen = false;
  function setOpen(on) { if (on === isOpen) return; isOpen = on; for (const t of tubes) { t.dead = on ? 0 : t.dead0; t.m.color.setHex(t.dead ? 0x3a3a38 : 0xeef6ff); t.s.material.opacity = t.dead ? 0 : 0.55; t.pool.material.opacity = t.dead ? 0 : 0.18; }
    for (const j of junk) j.visible = !on; if (fallen) fallen.visible = !on; if (backBan) { if (on && !banNew) banNew = banner('GRAND REOPENING', 'SKIP IS BACK · EVERY SHELF FULL', 8, 1.6, '#ffffff', '#2f7d5a'); backBan.material.map = on ? banNew : banOld; backBan.rotation.z = on ? 0 : 0.04; backBan.material.needsUpdate = true; } }
  return { key: 'sport', root, bars, posts, ltPost, inner, lt, lines, reset, tick, hitTargets, setOpen, W, ry0, dir, depth: Math.abs(z1 - z0), H };
}
