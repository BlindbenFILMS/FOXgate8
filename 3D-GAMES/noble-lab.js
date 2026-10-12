import * as THREE from './vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from './village-game.js';
import { crestTex } from './engine/textures.js';
import { foxKit, PLAYER_MALE } from './fox-kit.js';
import { chairKit, CHAIR_DEFAULTS } from './engine/chair.js';
import { castKit } from './engine/cast.js';
import { nobleWeaponKit, NOBLE_MELEE, NOBLE_RANGED, NOBLE_HOLDS } from './engine/noble-weapons.js';

// NOBLE WORKSHOP: Noble rolls a straight floor in his chair; the wheels leave two tracks.
export async function createNobleLab({ container, cfg, onState = () => {} }) {
  const touch = matchMedia('(pointer: coarse)').matches;
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.5 : 2)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = !touch; renderer.autoClear = false;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf3f2f2);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x201e1d, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const { makeFox, animFox } = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const CK = chairKit({ THREE, M, toon });
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b4b0, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(-4, 9, 5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); scene.add(sun, sun.target);
  const LEN = 24;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, LEN * 2 + 8), new THREE.MeshLambertMaterial({ color: 0xe6e4e3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(LEN * 2 + 8, (LEN * 2 + 8) * 4, 0xcfcac7, 0xd9d6d4); grid.position.y = 0.002; scene.add(grid);
  const noble = castKit({ THREE, M, toon, makeFox }, { chair: cfg || CHAIR_DEFAULTS }).make('noble');
  scene.add(noble);
  const rig = noble.userData.rig, bs = noble.scale.x, FH = 2.3 * bs;
  noble.rotation.order = 'YXZ'; const NK = nobleWeaponKit({ THREE, M, toon }), NW = NK.attach(noble);
  const WP = { shoeKind: 'shoe', hover: 0, rockets: [], hornT: 0, last: '' };
  const miniGeo = new THREE.CapsuleGeometry(0.05, 0.3, 3, 6); miniGeo.rotateX(Math.PI / 2); const miniMat = new THREE.MeshBasicMaterial({ color: 0x6b7a3a });
  // tyre tracks
  const tracks = [0, 1].map(() => { const n = 500, arr = new Float32Array(n * 3), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr, 3)); g.setDrawRange(0, 0); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x201e1d })); l.frustumCulled = false; scene.add(l); return { n, arr, g, i: 0 }; });
  const clearTracks = () => tracks.forEach(t => { t.i = 0; t.g.setDrawRange(0, 0); });
  const persp = new THREE.PerspectiveCamera(42, 1, 0.05, 100), ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.05, 100);
  const V = { wide: true, view: 'three', yaw: 0.85, pitch: 0.42, dist: FH * 5.2, rolling: true, slow: false, paused: false, z: -LEN + 2, focus: false };
  const ptrs = new Map(); const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); });
  el.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (V.pd) V.dist = clamp(V.dist * V.pd / d, FH * 0.6, FH * 9); V.pd = d; return; }
    if (V.view === 'three') { V.yaw -= dx * 0.008; V.pitch = clamp(V.pitch + dy * 0.006, 0.02, 1.45); } });
  const endP = e => { ptrs.delete(e.pointerId); V.pd = 0; }; el.addEventListener('pointerup', endP); el.addEventListener('pointercancel', endP);
  el.addEventListener('wheel', e => { V.dist = clamp(V.dist + e.deltaY * 0.004, FH * 0.6, FH * 9); e.preventDefault(); }, { passive: false });
  function frameOrtho(cam, w, h, view, z) {
    const wide = V.wide, asp = w / h, fh = view === 'top' ? (wide ? SH.RANGE * 2.3 : FH * 1.3) : FH * 1.2, fw = view === 'side' ? (wide ? SH.RANGE * 1.4 : FH * 1.5) : (wide ? SH.RANGE * 2.3 : FH * 1.1), hh = Math.max(fh, fw / asp) / 2, hw = hh * asp;
    cam.left = -hw; cam.right = hw; cam.top = hh; cam.bottom = -hh; cam.updateProjectionMatrix();
    if (view === 'top') { const cz = z + (wide ? SH.RANGE * 0.3 : 0.1); cam.position.set(0, 20, cz); cam.up.set(0, 0, 1); cam.lookAt(0, 0, cz); }
    else if (view === 'side') { const cz = z + (wide ? SH.RANGE * 0.4 : 0); cam.position.set(-20, FH * 0.48, cz); cam.up.set(0, 1, 0); cam.lookAt(0, FH * 0.48, cz); }
    else { cam.position.set(0, FH * 0.48, z + 20); cam.up.set(0, 1, 0); cam.lookAt(0, FH * 0.48, z); }
  }
  // ---------- SHOEMERANG test (same numbers as meru-bridge.js: OUT on a curve, BACK homing, ORBIT his head) ----------
  const U = 60, SH = { RANGE: 430 / U, OUT: 26 / 60, ARC: 46 / U, HOME_MAX: 21, HOME_ACC: 360, DRAG: 0.86, CATCH: 46 / U, GIVE_UP: 2.5, ORBIT: 4, ORBIT_W: 0.155 * 60, ORBIT_R: 62 / U, HIT_R: 58 / U, HIT_R_BACK: 76 / U, GUARD: 0.2, GUARD_R: 92 / U, GUARD_CD: 40 / 60, DMG: 18, RET: 0.55 };
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const glowSprite = (color, size, op, parent) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op })); s.scale.setScalar(size); (parent || scene).add(s); return s; };
  const sockMat = new THREE.MeshToonMaterial({ color: '#7dd3fc', gradientMap: grad, emissive: new THREE.Color('#7dd3fc'), emissiveIntensity: 1.4 });
  const boots = rig.boots, sockets = boots.map(b => { const k = M(new THREE.CylinderGeometry(0.07, 0.09, 0.08, 12), sockMat, b.position.x, b.position.y + 0.04, b.position.z, b.parent, 0); k.visible = false; return k; });
  const shoeMeshes = {}; for (const k of Object.keys(NOBLE_RANGED)) { const m = NK.makeShoe(k); m.visible = false; scene.add(m); shoeMeshes[k] = m; } let shoeMesh = shoeMeshes.shoe;
  const trailS = Array.from({ length: 16 }, () => ({ s: glowSprite(0x7dd3fc, 0.5, 0), t: 1 })); let trailI = 0;
  // target post: rides along beside him at the test distance
  const dummy = new THREE.Group(); scene.add(dummy); const dMat = toon('#ec3013'), dHit = toon('#ffffff');
  const dBody = M(new THREE.CylinderGeometry(0.28, 0.34, 1.5, 16), dMat, 0, 0.95, 0, dummy, 0.03, 0.34); M(new THREE.SphereGeometry(0.26, 14, 10), dMat, 0, 1.9, 0, dummy, 0.03, 0.26); M(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8), toon('#201e1d'), 0, 0.12, 0, dummy, 0.01);
  const rangeRing = new THREE.Mesh(new THREE.RingGeometry(0.985, 1, 96), new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.9, depthWrite: false })); rangeRing.rotation.x = -Math.PI / 2; rangeRing.position.y = 0.012; rangeRing.scale.setScalar(SH.RANGE); scene.add(rangeRing);
  const T = { dist: 5, side: 0.6, auto: true, cd: 0.6, foot: -1, shoe: null, flash: 0, log: [], total: 0, last: '' };
  const tPos = () => new THREE.Vector3(Math.sin(T.side) * T.dist, 1.2, V.z + Math.cos(T.side) * T.dist);
  function launch() {
    if (T.shoe && T.shoe.phase !== 'orbit') return false;
    if (T.shoe) { shoeMesh.visible = false; T.shoe = null; } shoeMesh = shoeMeshes[WP.shoeKind] || shoeMeshes.shoe; const KR = NOBLE_RANGED[WP.shoeKind] || NOBLE_RANGED.shoe;
    const foot = T.foot = -1, i = 0, o = new THREE.Vector3(); noble.updateMatrixWorld(true); boots[i].getWorldPosition(o);
    const t = tPos(); let dx = t.x - o.x, dz = t.z - o.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
    T.shoe = { phase: 'out', t: 0, life: 0, foot, ox: o.x, oy: o.y, oz: o.z, dx, dz, px: -dz * foot, pz: dx * foot, ty: 1.2, x: o.x, y: o.y, z: o.z, vx: 0, vy: 0, vz: 0, hitOut: false, hitBack: false, guardAt: 0, ang: 0, orbitT: 0, KR, kind: WP.shoeKind };
    throwT = 0.25; return true;
  }
  function hit(n, label) { T.flash = 0.15; T.total += n; T.last = label + ' ' + n; T.log.push(label); if (T.log.length > 6) T.log.shift(); }
  function updateShoe(dt) {
    trailS.forEach(p => { if (p.t < 1) { p.t += dt * 3; p.s.material.opacity = 0.7 * Math.max(0, 1 - p.t); p.s.scale.setScalar(0.6 * (1 - p.t * 0.5)); } else p.s.material.opacity = 0; });
    const tp = tPos(); dummy.position.set(tp.x, 0, tp.z); rangeRing.position.set(0, 0.012, V.z); T.flash = Math.max(0, T.flash - dt); dBody.material = T.flash > 0 ? dHit : dMat;
    T.cd -= dt; if (T.auto && T.cd <= 0 && T.dist <= SH.RANGE + 0.5 && launch()) T.cd = 0.85;
    const fl = T.shoe;
    boots.forEach((b, i) => { const off = !!fl && (fl.foot > 0 ? 1 : 0) === i; b.visible = !off; sockets[i].visible = off; });
    if (!fl) { shoeMesh.visible = false; return; }
    shoeMesh.visible = true; fl.life += dt;
    const hx = 0, hy = 1.95, hz = V.z, near = (r, extra = 0.4) => Math.hypot(fl.x - tp.x, fl.z - tp.z) < r + extra && Math.abs(fl.y - 1.2) < 1.6;
    if (fl.phase === 'out') {
      fl.t = Math.min(1, fl.t + dt / fl.KR.out);
      const fwd = (fl.kind === 'homing' ? Math.min(fl.KR.range, T.dist + 0.6) : SH.RANGE) * Math.sin(fl.t * Math.PI / 2), sd = SH.ARC * Math.sin(fl.t * Math.PI);
      const nx = fl.ox + fl.dx * fwd + fl.px * sd, nz = fl.oz + fl.dz * fwd + fl.pz * sd, ny = fl.oy + (fl.ty - fl.oy) * Math.sin(fl.t * Math.PI / 2) + 0.5 * Math.sin(fl.t * Math.PI);
      const idt = 1 / Math.max(dt, 1e-4); fl.vx = (nx - fl.x) * idt; fl.vy = (ny - fl.y) * idt; fl.vz = (nz - fl.z) * idt; fl.x = nx; fl.y = ny; fl.z = nz;
      if (fl.kind === 'homing') { const k = Math.min(1, fl.t * 1.6); fl.x += (tp.x - fl.x) * k * 0.5; fl.z += (tp.z - fl.z) * k * 0.5; }
      if (!fl.hitOut && near(fl.KR.hitR)) { fl.hitOut = true; hit(Math.round(SH.DMG * fl.KR.dmg / 1.2), 'OUT'); if (fl.kind === 'homing') fl.t = 1; }
      if (fl.t >= 1) { fl.phase = 'back'; fl.vx = fl.vy = fl.vz = 0; }
    } else if (fl.phase === 'back') {
      const tx = hx - fl.x, ty = hy - fl.y, tz = hz - fl.z, tl = Math.hypot(tx, ty, tz) || 1, dr = Math.pow(SH.DRAG, dt * 60), a = SH.HOME_ACC * dt / tl;
      fl.vx = fl.vx * dr + tx * a; fl.vy = fl.vy * dr + ty * a; fl.vz = fl.vz * dr + tz * a;
      const sp = Math.hypot(fl.vx, fl.vy, fl.vz); if (sp > SH.HOME_MAX) { const k = SH.HOME_MAX / sp; fl.vx *= k; fl.vy *= k; fl.vz *= k; }
      fl.x += fl.vx * dt; fl.y += fl.vy * dt; fl.z += fl.vz * dt;
      if (!fl.hitBack && near(SH.HIT_R_BACK)) { fl.hitBack = true; hit(Math.round(SH.DMG * fl.KR.dmg / 1.2 * SH.RET), 'BACK'); }
      if (tl < SH.CATCH + 0.3 || fl.life > SH.GIVE_UP) { fl.phase = 'orbit'; fl.orbitT = SH.ORBIT; fl.ang = Math.atan2(fl.x - hx, fl.z - hz); }
    } else {
      fl.orbitT -= dt; fl.ang += SH.ORBIT_W * dt; fl.x = hx + Math.sin(fl.ang) * SH.ORBIT_R; fl.z = hz + Math.cos(fl.ang) * SH.ORBIT_R; fl.y = hy + Math.sin(fl.ang * 2) * 0.08;
      if (Math.hypot(tp.x - hx, tp.z - hz) < SH.GUARD_R + 0.4 && fl.life >= fl.guardAt) { fl.guardAt = fl.life + SH.GUARD_CD; hit(Math.max(2, Math.round(SH.DMG * SH.GUARD)), 'ORBIT'); }
      if (fl.orbitT <= 0) { T.shoe = null; shoeMesh.visible = false; return; }
    }
    shoeMesh.position.set(fl.x, fl.y, fl.z); const body = shoeMesh.userData.body;
    if (fl.phase === 'orbit') { body.rotation.set(0, 0, 0); shoeMesh.rotation.y = fl.ang + Math.PI / 2; } else body.rotation.y += dt * 33 * (fl.kind === 'boot' ? 0.6 : 1);
    if (fl.phase !== 'orbit' && Math.random() < 0.85) { const p = trailS[trailI]; trailI = (trailI + 1) % trailS.length; p.s.position.set(fl.x, fl.y, fl.z); p.t = 0; }
  }
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, hudKey = '', throwT = 0;
  const stars = NK.makeStars(0.36); stars.position.y = 2.25; dummy.add(stars);
  function weapon(k) {
    WP.last = k;
    if (NOBLE_RANGED[k]) { WP.shoeKind = k; T.auto = false; if (T.shoe) { shoeMesh.visible = false; T.shoe = null; } launch(); return; }
    if (k === 'hover') { WP.hover = NOBLE_HOLDS.hover.max; return; }
    if (k === 'rockets') { NW.play('rockets', NOBLE_HOLDS.rockets.dur); WP.rockets.push({ t: 0.28, i: 0 }, { t: 0.44, i: 1 }); return; }
    const d = (NOBLE_MELEE[k] || NOBLE_HOLDS[k] || {}).dur || 0.5; NW.play(k, d, { radius: k === 'spin' ? NOBLE_HOLDS.spin.radius : 3 });
    if (k === 'horn' && T.dist < 3.5) WP.hornT = 2;
  }
  const mini = [];
  function updateWeapons(dt) {
    for (let i = WP.rockets.length - 1; i >= 0; i--) { const q = WP.rockets[i]; q.t -= dt; if (q.t <= 0) { const o = NW.muzzleWorld(q.i, new THREE.Vector3()); const m = new THREE.Mesh(miniGeo, miniMat); m.position.copy(o); scene.add(m); glowSprite(0xffb347, 0.7, 0.9, m); mini.push({ m, v: new THREE.Vector3((q.i ? 0.3 : -0.3), 0.5, 1).normalize().multiplyScalar(8), life: 2 }); WP.rockets.splice(i, 1); } }
    const tp = tPos(); for (let i = mini.length - 1; i >= 0; i--) { const r = mini[i]; r.life -= dt; const want = tp.clone().sub(r.m.position).normalize().multiplyScalar(14); r.v.lerp(want, Math.min(1, dt * 5)); r.m.position.addScaledVector(r.v, dt); r.m.lookAt(r.m.position.clone().add(r.v));
      if (r.m.position.distanceTo(tp) < 0.5 || r.life < 0) { if (r.life >= 0) hit(Math.round(SH.DMG * 1.25), 'ROCKET'); scene.remove(r.m); mini.splice(i, 1); } }
    WP.hover = Math.max(0, WP.hover - dt); NW.hover(WP.hover > 0); WP.hornT = Math.max(0, WP.hornT - dt); stars.visible = WP.hornT > 0; if (stars.visible) stars.userData.tick(dt);
  }
  const wp = new THREE.Vector3();
  function update(rdt) {
    let dt = Math.min(rdt, 0.05) * (V.slow ? 0.25 : 1); if (V.paused) dt = 0;
    const c = rig.cfg, spW = V.rolling ? c.speed * 100 * rig.k * bs : 0;
    V.z += spW * dt; if (V.z > LEN - 2) { V.z = -LEN + 2; clearTracks(); }
    noble.position.set(0, 0, V.z);
    if (dt > 0) { throwT = Math.max(0, throwT - dt); rig.throwT = throwT; animFox(noble, dt, spW); updateShoe(dt); updateWeapons(dt); const pose = NW.update(dt, spW); WP.lift = (WP.lift || 0) + ((WP.hover > 0 ? 0.35 : 0) - (WP.lift || 0)) * Math.min(1, dt * 4); noble.position.y = pose.lift + WP.lift; noble.rotation.set(pose.tilt, pose.yaw, 0); }
    if (spW > 0 && dt > 0) { const G = rig.geo; [-1, 1].forEach((s, i) => { const t = tracks[i]; wp.set(s * G.wx * bs, 0.01, V.z + G.wz * bs); const j = Math.min(t.i, t.n - 1); if (t.i >= t.n) t.arr.copyWithin(0, 3); t.arr.set([wp.x, wp.y, wp.z], j * 3); t.i = Math.min(t.i + 1, t.n); t.g.attributes.position.needsUpdate = true; t.g.setDrawRange(0, t.i); }); }
    sun.position.set(-4, 9, V.z + 5); sun.target.position.set(0, 0, V.z);
    hudT -= rdt; if (hudT < 0) { hudT = 0.2; const info = { ...rig.info, shoe: T.shoe ? T.shoe.phase : 'ready', weapon: WP.last, shoeKind: WP.shoeKind, total: T.total, last: T.last, auto: T.auto, dist: T.dist, rangeM: +SH.RANGE.toFixed(1) }; const k = JSON.stringify(info); if (k !== hudKey) { hudKey = k; onState(info); } }
  }
  function render() {
    const w = W(), h = H(); renderer.setViewport(0, 0, w, h); renderer.clear(); let cam;
    if (V.view === 'three') { const t = V.focus ? new THREE.Vector3(0, FH * 0.55, V.z) : new THREE.Vector3(0, FH * 0.42, V.z + (V.wide ? SH.RANGE * 0.35 : 0)); persp.aspect = w / h; persp.fov = w < h ? 58 : 42; persp.updateProjectionMatrix(); persp.position.set(t.x + Math.sin(V.yaw) * Math.cos(V.pitch) * V.dist, t.y + Math.sin(V.pitch) * V.dist, t.z + Math.cos(V.yaw) * Math.cos(V.pitch) * V.dist); persp.lookAt(t); cam = persp; }
    else { frameOrtho(ortho, w, h, V.view, V.z); cam = ortho; }
    renderer.render(scene, cam);
  }
  function loop() { raf = requestAnimationFrame(loop); update(clock.getDelta()); render(); }
  loop();
  const ro = new ResizeObserver(() => renderer.setSize(W(), H())); ro.observe(container);
  return {
    set(c) { rig.set(c); }, weapon, setView(v) { V.view = v; }, toggle(k) { V[k] = !V[k]; return V[k]; }, cam(o) { Object.assign(V, o); },
    state: () => ({ view: V.view, rolling: V.rolling, slow: V.slow, paused: V.paused, wide: V.wide, auto: T.auto }), clear: clearTracks, throwArm() { launch(); }, shoe(o) { Object.assign(T, o); if (o.reset) { T.total = 0; T.last = ''; T.log = []; } }, toggleWide() { V.wide = !V.wide; V.dist = V.wide ? FH * 5.2 : FH * 2.4; return V.wide; },
    step(n = 30, dt = 1 / 30) { const p = V.paused; V.paused = false; for (let i = 0; i < n; i++) update(dt); V.paused = p; render(); },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.remove(); },
  };
}
