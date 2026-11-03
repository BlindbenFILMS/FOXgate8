// s208 POWER-UPS (Ben): ONE look for every pickup in every battle map: a 3D icon that turns + pulses INSIDE a bright WHITE ring (like the shield cell),
// with a coloured halo. Tuned in "Power Up Workshop.dc.html" (colour · size · spin · pulse · ring) → localStorage 'powerups.look'.
//   import { makePowerup, POWERUPS } from '../engine/powerups.js'
//   const g = makePowerup(THREE, 'health'); scene.add(g); every frame: g.userData.pu.update(dt)
export const POWERUPS = {
  health: { name: 'HEALTH', tip: '+12 HP', col: '#ff2a2a' },
  energy: { name: 'ENERGY CELL', tip: 'LASER ENERGY FULL', col: '#2ee6ff' },
  shield: { name: 'SHIELD CELL', tip: 'SHIELD FULL', col: '#4fdff2' },
  triple: { name: 'TRIPLE LASER', tip: '3 SHOTS AT ONCE', col: '#7df9ff' },
  rapid: { name: 'RAPID FIRE', tip: 'NO RELOAD, FAST SHOTS', col: '#ff3df2' },   // a blaster firing a fast stream
  speed: { name: 'SPEED BOOTS', tip: 'RUN 50 % FASTER', col: '#ffd23a' },
  power: { name: 'POWER SWORD', tip: 'DOUBLE DAMAGE, BIGGER SWING', col: '#ff5a2a' },
  jump: { name: 'SUPER JUMP', tip: 'JUMP TWICE AS HIGH', col: '#7d8bff' },
  star: { name: 'INVINCIBLE', tip: 'NOTHING CAN HURT YOU', col: '#ffe14a' },
  dbl: { name: 'DOUBLE POINTS', tip: 'EVERY HIT ×2', col: '#ffd23a' },
  time: { name: '+10 SECONDS', tip: 'MORE TIME ON THE CLOCK', col: '#7cff9b' },
  bomb: { name: 'BOMB', tip: 'CLEARS THE SCREEN', col: '#ec3013' } };
const KEY = 'powerups.look', DEF = { size: 1, spin: 1, pulse: 1, ring: 1 };
export function puLook(k) { let o = {}; try { o = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {} return { ...DEF, col: POWERUPS[k] && POWERUPS[k].col, ...(o[k] || {}) }; }
export function puSet(k, part) { let o = {}; try { o = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {} o[k] = { ...(o[k] || {}), ...part }; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
export function puReset() { try { localStorage.removeItem(KEY); } catch (e) {} }
let glowTex = null;
const glow = THREE => { if (glowTex) return glowTex; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); glowTex = new THREE.CanvasTexture(c); return glowTex; };
function boltGeo(THREE) { const s = new THREE.Shape(); s.moveTo(0.03, 0.17); s.lineTo(-0.07, -0.01); s.lineTo(0, -0.01); s.lineTo(-0.04, -0.17); s.lineTo(0.08, 0.03); s.lineTo(0.01, 0.03); s.lineTo(0.05, 0.17); return new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }); }
function chevGeo(THREE, w = 0.2, h = 0.26, t = 0.07) { const s = new THREE.Shape(); s.moveTo(-w / 2, h / 2); s.lineTo(-w / 2 + t, h / 2); s.lineTo(w / 2, 0); s.lineTo(-w / 2 + t, -h / 2); s.lineTo(-w / 2, -h / 2); s.lineTo(w / 2 - t, 0); s.lineTo(-w / 2, h / 2); const g = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false }); g.translate(0, 0, -0.03); return g; }
// the icon for each kind, ~0.5 m tall, built from simple shapes (phone-light)
function icon(THREE, k, col, mats) {
  const g = new THREE.Group(), C = new THREE.Color(col);
  const glossy = (c = C, e = 0.5) => { const m = new THREE.MeshPhongMaterial({ color: c, emissive: c.clone().multiplyScalar(e), specular: 0xffffff, shininess: 110 }); mats.push(m); return m; };
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff }), ink = new THREE.MeshPhongMaterial({ color: 0x14202a, emissive: 0x041018, shininess: 80 });
  const add = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); g.add(o); return o; };
  if (k === 'health') { for (const [w, h] of [[0.42, 0.13], [0.13, 0.42]]) { add(new THREE.BoxGeometry(w + 0.05, h + 0.05, 0.08), white); add(new THREE.BoxGeometry(w, h, 0.12), glossy()); } }
  else if (k === 'energy') { add(new THREE.CylinderGeometry(0.11, 0.11, 0.32, 12), glossy(C, 0.9)); for (const y of [-0.2, 0.2]) add(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 12), ink, 0, y, 0);
    for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.03, 0.38, 0.03), ink, Math.cos(i * Math.PI / 2) * 0.14, 0, Math.sin(i * Math.PI / 2) * 0.14);
    const b = add(boltGeo(THREE), white, 0, 0, 0.115); const b2 = b.clone(); b2.rotation.y = Math.PI; b2.position.z = -0.115; g.add(b2); g.userData.zap = [b, b2]; }
  else if (k === 'shield') { const s = new THREE.Shape(); s.moveTo(0, 0.24); s.quadraticCurveTo(0.2, 0.22, 0.22, 0.12); s.lineTo(0.18, -0.08); s.quadraticCurveTo(0.1, -0.2, 0, -0.27); s.quadraticCurveTo(-0.1, -0.2, -0.18, -0.08); s.lineTo(-0.22, 0.12); s.quadraticCurveTo(-0.2, 0.22, 0, 0.24);
    const rim = add(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.02, bevelSegments: 1 }), ink, 0, 0, -0.035); const fm = glossy(C, 0.8); const f = add(new THREE.ShapeGeometry(s), fm, 0, 0, 0.04); f.scale.setScalar(0.82); const bk = f.clone(); bk.rotation.y = Math.PI; bk.position.z = -0.045; g.add(bk);
    const b = add(boltGeo(THREE), white, 0, 0, 0.05); b.scale.setScalar(0.9); const b2 = b.clone(); b2.rotation.y = Math.PI; b2.position.z = -0.06; g.add(b2); g.userData.zap = [b, b2]; }
  else if (k === 'triple') { const m = glossy(C, 0.9); for (const a of [-0.45, 0, 0.45]) { const c = add(new THREE.CapsuleGeometry(0.045, 0.3, 3, 8), m); c.position.set(Math.sin(a) * 0.12, Math.cos(a) * 0.12 - 0.05, 0); c.rotation.z = -a; const t = add(new THREE.SphereGeometry(0.06, 8, 6), white); t.position.set(Math.sin(a) * 0.32, Math.cos(a) * 0.32 - 0.05, 0); }
    add(new THREE.BoxGeometry(0.16, 0.08, 0.1), ink, 0, -0.2, 0); }
  else if (k === 'rapid') { // s208c a blaster pistol firing a stream of bolts out of the muzzle, with a flickering muzzle flash
    const m = glossy(C, 0.7), dark = ink; const gun = new THREE.Group(); gun.position.set(-0.12, -0.02, 0); g.add(gun);
    const gp = (geo, mt, x, y, z = 0) => { const o = new THREE.Mesh(geo, mt); o.position.set(x, y, z); gun.add(o); return o; };
    gp(new THREE.BoxGeometry(0.26, 0.09, 0.08), m, 0.02, 0.05); gp(new THREE.BoxGeometry(0.1, 0.05, 0.085), dark, 0.0, 0.11);   // body + top rail
    const brl = gp(new THREE.CylinderGeometry(0.028, 0.028, 0.14, 10), dark, 0.2, 0.06); brl.rotation.z = Math.PI / 2;           // barrel
    const grip = gp(new THREE.BoxGeometry(0.07, 0.15, 0.07), dark, -0.07, -0.06); grip.rotation.z = 0.28;                       // grip
    gp(new THREE.TorusGeometry(0.035, 0.01, 4, 10, Math.PI), dark, 0.0, -0.01).rotation.z = Math.PI;                              // trigger guard
    for (let i = 0; i < 3; i++) gp(new THREE.BoxGeometry(0.02, 0.03, 0.09), white, -0.06 + i * 0.04, 0.05);                       // glowing cells
    const flash = gp(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), 0.29, 0.06);
    const shots = []; for (let i = 0; i < 4; i++) { const sh = gp(new THREE.CapsuleGeometry(0.018, 0.07, 2, 6), new THREE.MeshBasicMaterial({ color: C.clone().lerp(new THREE.Color(1, 1, 1), 0.5), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), 0.3, 0.06); sh.rotation.z = Math.PI / 2; shots.push(sh); }
    g.userData.gun = { flash, shots }; }
  else if (k === 'speed') { const m = glossy(C, 0.6); const boot = new THREE.Shape(); boot.moveTo(-0.08, 0.2); boot.lineTo(0.04, 0.2); boot.lineTo(0.05, -0.04); boot.lineTo(0.2, -0.08); boot.lineTo(0.2, -0.17); boot.lineTo(-0.1, -0.17); boot.lineTo(-0.1, 0.2);
    add(new THREE.ExtrudeGeometry(boot, { depth: 0.1, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 1 }), m, 0, 0, -0.05); add(new THREE.BoxGeometry(0.32, 0.03, 0.12), ink, 0.05, -0.19, 0);
    for (let i = 0; i < 3; i++) add(new THREE.BoxGeometry(0.14 - i * 0.03, 0.025, 0.03), white, -0.22 - i * 0.02, 0.1 - i * 0.09, 0); const w = add(new THREE.ConeGeometry(0.06, 0.18, 3), white, -0.02, 0.24, 0); w.rotation.z = 1.1; }
  else if (k === 'power') { const bm = glossy(new THREE.Color(0xdff6ff), 0.3); const bl = add(new THREE.BoxGeometry(0.06, 0.36, 0.02), bm, 0, 0.08, 0); add(new THREE.ConeGeometry(0.043, 0.08, 4), bm, 0, 0.3, 0).rotation.y = Math.PI / 4;
    add(new THREE.BoxGeometry(0.22, 0.04, 0.06), glossy(C, 0.6), 0, -0.11, 0); add(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8), ink, 0, -0.19, 0); add(new THREE.SphereGeometry(0.04, 8, 6), glossy(C, 0.8), 0, -0.26, 0);
    const edge = add(new THREE.BoxGeometry(0.075, 0.38, 0.03), new THREE.MeshBasicMaterial({ color: C, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 0.09, 0); g.userData.edge = edge; }
  else if (k === 'jump') { // s209 a coiled spring with an up-arrow bouncing on top
    const m = glossy(C, 0.7); const pts = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 8; pts.push(new THREE.Vector3(Math.cos(a) * 0.1, -0.2 + i / 60 * 0.22, Math.sin(a) * 0.1)); }
    const coil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.018, 5, false), m); g.add(coil); add(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 16), ink, 0, -0.22, 0);
    const up = new THREE.Group(); const sh = new THREE.Shape(); sh.moveTo(0, 0.14); sh.lineTo(0.12, 0.02); sh.lineTo(0.05, 0.02); sh.lineTo(0.05, -0.08); sh.lineTo(-0.05, -0.08); sh.lineTo(-0.05, 0.02); sh.lineTo(-0.12, 0.02); sh.lineTo(0, 0.14);
    const ar = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false }), white); ar.position.z = -0.025; up.add(ar); up.position.y = 0.12; g.add(up); g.userData.spring = { coil, up }; }
  else if (k === 'star') { // a fat golden 5-point star with a white rim, sparkles orbiting it
    const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 0.1 : 0.25; i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    const st = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.025, bevelSegments: 2 }), glossy(C, 0.8)); st.position.z = -0.035; g.add(st);
    const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false }), white); rim.scale.setScalar(1.12); rim.position.z = -0.02; g.add(rim);
    const sp = []; for (let i = 0; i < 4; i++) { const o = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(THREE), color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); o.scale.setScalar(0.09); g.add(o); sp.push(o); } g.userData.sparkles = sp; }
  else if (k === 'dbl') { const m = glossy(C, 0.6); for (const [x, z] of [[-0.07, -0.03], [0.07, 0.03]]) { const c = add(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 20), m, x, 0, z); c.rotation.x = Math.PI / 2; const r = add(new THREE.TorusGeometry(0.13, 0.015, 6, 20), ink, x, 0, z + 0.03); }
    const x1 = add(new THREE.BoxGeometry(0.16, 0.035, 0.04), white, 0.07, 0, 0.07); x1.rotation.z = 0.78; const x2 = x1.clone(); x2.rotation.z = -0.78; g.add(x2); }
  else if (k === 'time') { const m = glossy(C, 0.6); add(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 24), m).rotation.x = Math.PI / 2; add(new THREE.CylinderGeometry(0.16, 0.16, 0.065, 24), new THREE.MeshPhongMaterial({ color: 0xf3f2f2 })).rotation.x = Math.PI / 2;
    const hh = add(new THREE.BoxGeometry(0.025, 0.1, 0.02), ink, 0, 0.04, 0.04), mh = add(new THREE.BoxGeometry(0.02, 0.14, 0.02), ink, 0, 0.06, 0.045); hh.geometry.translate(0, 0.0, 0); g.userData.hands = [hh, mh];
    add(new THREE.BoxGeometry(0.08, 0.05, 0.06), ink, 0, 0.23, 0); }
  else if (k === 'bomb') { add(new THREE.SphereGeometry(0.22, 18, 12), new THREE.MeshPhongMaterial({ color: 0x14161a, specular: 0x666666, shininess: 60 })); add(new THREE.CylinderGeometry(0.07, 0.08, 0.07, 12), ink, 0, 0.22, 0);
    const fz = add(new THREE.CylinderGeometry(0.012, 0.012, 0.13, 6), new THREE.MeshPhongMaterial({ color: 0xa77b4f }), 0.03, 0.3, 0); fz.rotation.z = -0.4; add(new THREE.TorusGeometry(0.225, 0.02, 6, 24), glossy(C, 0.8)).rotation.x = Math.PI / 2;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(THREE), color: 0xffd23a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); sp.position.set(0.07, 0.37, 0); sp.scale.setScalar(0.2); g.add(sp); g.userData.spark = sp; }
  return g;
}
export function makePowerup(THREE, k, o = {}) {
  const L = { ...puLook(k), ...(o.look || {}) }, col = new THREE.Color(L.col || '#ffffff'), root = new THREE.Group(), mats = [];
  const ic = icon(THREE, k, col, mats); root.add(ic);
  // the WHITE circle it spins inside (+ a thin coloured inner line) and a halo
  const ringM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }), ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.022, 6, 40), ringM); ring.rotation.x = Math.PI / 2; root.add(ring);
  const inM = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }), inner = new THREE.Mesh(new THREE.TorusGeometry(0.325, 0.01, 4, 40), inM); inner.rotation.x = Math.PI / 2; root.add(inner);
  ring.visible = inner.visible = L.ring !== 0;
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(THREE), color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(1.25); root.add(halo);
  root.scale.setScalar(L.size); let t = Math.random() * 6;
  root.userData.pu = { kind: k, look: L,
    update(dt) { t += dt; const pu = 0.5 + 0.5 * Math.sin(t * 5.5), P = L.pulse;
      ic.rotation.y += dt * 2.0 * L.spin; ring.rotation.z += dt * 1.2 * L.spin; inner.rotation.z -= dt * 2 * L.spin; ic.scale.setScalar(1 + 0.1 * pu * P);
      for (const m of mats) m.emissiveIntensity = 0.7 + 1.1 * pu * P; halo.material.opacity = 0.35 + 0.5 * pu * P; halo.scale.setScalar(1.05 + 0.35 * pu * P); ringM.opacity = 0.75 + 0.25 * pu;
      if (ic.userData.zap) { const z = Math.random() < 0.25 || pu > 0.55; for (const b of ic.userData.zap) b.visible = z; }
      if (ic.userData.spring) { const ph = (t * 1.6) % 1, b = Math.abs(Math.sin(ph * Math.PI)); ic.userData.spring.coil.scale.y = 0.6 + 0.55 * b; ic.userData.spring.up.position.y = -0.04 + 0.27 * b + 0.05; }
      if (ic.userData.sparkles) ic.userData.sparkles.forEach((o, i) => { const a = t * 2.4 + i * Math.PI / 2; o.position.set(Math.cos(a) * 0.3, Math.sin(a * 1.3) * 0.18, Math.sin(a) * 0.3); o.material.opacity = 0.5 + 0.5 * Math.sin(t * 9 + i); });
      if (ic.userData.gun) { const G = ic.userData.gun, ph = (t * 7 * L.spin) % 1; G.flash.material.opacity = ph < 0.35 ? 1 - ph / 0.35 : 0; G.flash.scale.setScalar(0.6 + (1 - ph) * 0.9); G.shots.forEach((sh, i) => { const u = (ph + i) / 4; sh.position.x = 0.3 + u * 0.5; sh.material.opacity = 1 - u; }); }
      if (ic.userData.chev) for (const c of ic.userData.chev) c.position.x = -0.13 + c.userData.i * 0.13 + ((t * 0.6 * L.spin + c.userData.i / 3) % 1) * 0.04;
      if (ic.userData.edge) ic.userData.edge.material.opacity = 0.25 + 0.5 * pu;
      if (ic.userData.hands) { ic.userData.hands[1].rotation.z = -t * 3; ic.userData.hands[0].rotation.z = -t * 0.4; }
      if (ic.userData.spark) ic.userData.spark.scale.setScalar(0.14 + 0.12 * Math.random()); },
    setLook(part) { Object.assign(L, part); if (part.col) { const c2 = new THREE.Color(part.col); halo.material.color.copy(c2); inM.color.copy(c2); for (const m of mats) { m.color.copy(c2); m.emissive.copy(c2).multiplyScalar(0.5); } } if (part.size != null) root.scale.setScalar(part.size); if (part.ring != null) ring.visible = inner.visible = !!part.ring; } };
  return root;
}
