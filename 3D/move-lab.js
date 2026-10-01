import * as THREE from './vendor/three/three.module.js';
import { rr, pick, clamp, smooth, lerp, damp, makeGradient, glowTexture, dotTexture, Ambience } from './village-game.js';
import { crestTex, canvasTex, FONT } from './meru-game.js';
import { foxKit, loadLook, PLAYER_MALE } from './fox-kit.js';

export const TUNE_KEY = 'meru.combatTune.v1';
export const DEFAULT_TUNE = {
  walk: 6.4, run: 9.5, accel: 18, turn: 14, jump: 8, gravity: 24,
  dodgeDist: 4, dodgeDur: 0.24, dodgeCd: 0.5,
  swingTime: 0.28, windup: 0.18, reach: 2.6, arc: 1.5, lunge: 3, comboWindow: 0.75, finisher: 1.4, swordDmg: 25, hitStop: 0.08, trail: 1,
  fireRate: 6.5, boltSpeed: 60, homing: 8, energyCost: 5, energyRegen: 26, recoil: 1, laserDmg: 15,
  camDist: 8.2, camPitch: 0.42, camFollow: 9, shake: 0.3, fov: 58,
};
export function loadTune() { try { return { ...DEFAULT_TUNE, ...JSON.parse(localStorage.getItem(TUNE_KEY) || '{}') }; } catch (e) { return { ...DEFAULT_TUNE }; } }

export async function createLab({ container, onState = () => {} }) {
  const T = loadTune();
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#dcdad6'); scene.fog = new THREE.Fog(0xdcdad6, 30, 70);
  const camera = new THREE.PerspectiveCamera(T.fov, W() / H(), 0.1, 200);
  const grad = makeGradient(), glowTex = glowTexture(), dotTex = dotTexture(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const audio = new Ambience();

  // ---------- yard ----------
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa89f94, 1.0));
  const sun = new THREE.DirectionalLight(0xfff2e0, 2.3); sun.position.set(8, 16, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 60 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; scene.add(sun, sun.target);
  const floorT = canvasTex(1024, 1024, (g) => {
    g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, 1024, 1024);
    g.strokeStyle = 'rgba(32,30,29,0.16)'; g.lineWidth = 2; for (let i = 0; i <= 1024; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.moveTo(0, i); g.lineTo(1024, i); g.stroke(); }
    g.strokeStyle = 'rgba(32,30,29,0.5)'; g.lineWidth = 4; for (let i = 0; i <= 1024; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.moveTo(0, i); g.lineTo(1024, i); g.stroke(); }
    g.strokeStyle = '#ec3013'; g.lineWidth = 6; g.beginPath(); g.moveTo(512, 0); g.lineTo(512, 1024); g.moveTo(0, 512); g.lineTo(1024, 512); g.stroke();
    g.beginPath(); g.arc(512, 512, 128, 0, 7); g.stroke();
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(64, 64), new THREE.MeshToonMaterial({ map: floorT, gradientMap: grad })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  for (const [x, z, w, d] of [[0, -32, 64, 1], [0, 32, 64, 1], [-32, 0, 1, 64], [32, 0, 1, 64]]) M(new THREE.BoxGeometry(w, 1.2, d), toon('#201e1d'), x, 0.6, z, null, 0);

  // ---------- dummies ----------
  const targetT = canvasTex(256, 256, (g) => { const c = ['#ec3013', '#f3f2f2']; for (let i = 0; i < 5; i++) { g.fillStyle = c[i % 2]; g.beginPath(); g.arc(128, 128, 126 - i * 25, 0, 7); g.fill(); } });
  const dummies = [];
  function makeDummy(x, z, kind = 'post') {
    const root = new THREE.Group(); root.position.set(x, 0, z); scene.add(root);
    M(new THREE.CylinderGeometry(0.55, 0.65, 0.18, 20), toon('#38404f'), 0, 0.09, 0, root, 0.03, 0.65);
    const sway = new THREE.Group(); sway.position.y = 0.18; root.add(sway);
    M(new THREE.CylinderGeometry(0.07, 0.08, 0.9, 10), toon('#6b4a35'), 0, 0.45, 0, sway, 0.02, 0.08);
    const torso = M(new THREE.CylinderGeometry(0.38, 0.34, 0.85, 18), toon('#d9b26a'), 0, 1.15, 0, sway, 0.035, 0.38);
    for (const y of [0.9, 1.4]) M(new THREE.TorusGeometry(0.37, 0.03, 6, 22), toon('#8a6a3a'), 0, y, 0, sway, 0).rotation.x = Math.PI / 2;
    M(new THREE.BoxGeometry(1.1, 0.1, 0.1), toon('#6b4a35'), 0, 1.35, 0, sway, 0.02);
    const head = M(new THREE.SphereGeometry(0.28, 18, 12), toon('#e6c88a'), 0, 1.85, 0, sway, 0.03, 0.28);
    const tgt = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), new THREE.MeshToonMaterial({ map: targetT, gradientMap: grad })); tgt.position.set(0, 1.15, 0.385); sway.add(tgt);
    const mats = []; sway.traverse(o => { if (o.isMesh && o.material !== outlineMat) { o.material = o.material.clone(); if (!o.material.emissive) o.material.emissive = new THREE.Color(0); mats.push(o.material); } });
    const d = { root, sway, x, z, ax: 0, az: 0, vx: 0, vz: 0, flash: 0, hits: 0, mats, moving: kind === 'moving', t: rr(0, 6), home: [x, z] };
    dummies.push(d); return d;
  }
  makeDummy(0, -5); makeDummy(-4.5, -8); makeDummy(4.5, -8); makeDummy(0, -13); makeDummy(-9, -2); makeDummy(9, -2);
  const mover = makeDummy(0, -18, 'moving'); mover.root.visible = false;

  // ---------- fx ----------
  const sparkN = 300, sparkArr = new Float32Array(sparkN * 3).fill(-999), sparkV = Array.from({ length: sparkN }, () => ({ v: new THREE.Vector3(), life: 0 }));
  const sparkGeo = new THREE.BufferGeometry(); sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkArr, 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: 0xffb347, map: dotTex, size: 0.13, transparent: true, depthWrite: false, alphaTest: 0.1 })); sparks.frustumCulled = false; scene.add(sparks); let sparkI = 0;
  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3(), v5 = new THREE.Vector3();
  function burst(p, n = 14, speed = 6) { for (let k = 0; k < n; k++) { const s = sparkV[sparkI]; s.life = rr(0.25, 0.55); s.v.set(rr(-1, 1), rr(0.3, 1.4), rr(-1, 1)).normalize().multiplyScalar(rr(0.4, 1) * speed); sparkArr.set([p.x, p.y, p.z], sparkI * 3); sparkI = (sparkI + 1) % sparkN; } }
  const popups = [];
  function popup(p, text, color = '#201e1d') { const t = canvasTex(256, 96, (g) => { g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#f3f2f2'; g.strokeText(text, 128, 50); g.fillStyle = color; g.fillText(text, 128, 50); }); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.position.copy(p); s.scale.set(1.5, 0.56, 1); s.renderOrder = 10; scene.add(s); popups.push({ s, t: 0 }); }
  // sword trail ribbon
  const TR = 18, trailPos = new Float32Array(TR * 2 * 3), trailCol = new Float32Array(TR * 2 * 4), trailIdx = [];
  for (let i = 0; i < TR - 1; i++) { const a = i * 2; trailIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3)); trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 4)); trailGeo.setIndex(trailIdx);
  const trail = new THREE.Mesh(trailGeo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); trail.frustumCulled = false; scene.add(trail);
  const trailPts = []; // {base, tip, age}
  const bolts = [], boltGeo = new THREE.CapsuleGeometry(0.06, 0.8, 3, 6); boltGeo.rotateX(Math.PI / 2);
  const boltMat = new THREE.MeshBasicMaterial({ color: 0xb8f4ff });

  // ---------- fox ----------
  const fox = kit.makeFox({ torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', eyes: ['#f472b6', '#2dd4bf'], mood: 'determined', gear: 'both', look: PLAYER_MALE, outfit: 'armor' });
  const FP = fox.userData.P, swordArm = FP.arms[1], gunArm = FP.arms[0];
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x9ff3ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 })); flash.position.set(0, 0.16, 0.7); flash.scale.setScalar(0.9); FP.gun.add(flash);
  const reticle = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.64, 32), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.9, depthTest: false, side: THREE.DoubleSide })); reticle.renderOrder = 9; scene.add(reticle);

  const P = { x: 0, z: 4, y: 0, vx: 0, vz: 0, vy: 0, face: Math.PI, ground: true, en: 100, enT: 0, fireCd: 0, recoil: 0,
    swing: 0, swingDur: 0, wind: 0, combo: 0, comboT: 0, hitSet: new Set(), lungeT: 0, ldx: 0, ldz: 0, lsp: 0, dash: 0, dashCd: 0, dx: 0, dz: 0, stepT: 0, target: null, queued: false };
  const St = { yaw: 0, pitch: T.camPitch, t: 0, slow: 1, hitStop: 0, shake: 0, lockOn: true, moving: false, dmgLog: [], hits: 0, best: 0, lastCombo: 0 };
  const keys = new Set(), mouse = { l: false, r: false, mx: false, x: 0, y: 0 };

  // ---------- input ----------
  const onKeyDown = e => {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; keys.add(e.code); audio.init();
    if (e.code === 'Space') { e.preventDefault(); if (P.ground) { P.vy = T.jump; P.ground = false; audio.tone(420, 0.12, 0.04, 'triangle', 1.8); } }
    if (e.code === 'KeyJ' || e.code === 'KeyF') api.slash();
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyL') api.dodge();
    if (e.code === 'Tab') { e.preventDefault(); api.cycleTarget(); }
    if (e.code === 'KeyR') api.resetDummies();
    if (/Arrow/.test(e.code)) e.preventDefault();
  };
  const onKeyUp = e => keys.delete(e.code), onBlur = () => keys.clear();
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); window.addEventListener('blur', onBlur);
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { audio.init(); el.setPointerCapture(e.pointerId); mouse.x = e.clientX; mouse.y = e.clientY; if (e.button === 0) { mouse.l = true; api.slash(); } if (e.button === 2) mouse.r = true; if (e.button === 1) { mouse.mx = true; e.preventDefault(); } });
  el.addEventListener('pointermove', e => { if (mouse.mx) { St.yaw -= (e.clientX - mouse.x) * 0.006; St.pitch = clamp(St.pitch + (e.clientY - mouse.y) * 0.004, 0.05, 1.2); St.dragT = 1.5; } mouse.x = e.clientX; mouse.y = e.clientY; });
  el.addEventListener('pointerup', e => { if (e.button === 0) mouse.l = false; if (e.button === 2) mouse.r = false; if (e.button === 1) mouse.mx = false; });
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('wheel', e => { T.camDist = clamp(T.camDist + e.deltaY * 0.01, 3, 16); e.preventDefault(); }, { passive: false });
  const ro = new ResizeObserver(() => requestAnimationFrame(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); })); ro.observe(container);

  // ---------- combat ----------
  const aliveD = () => dummies.filter(d => d.root.visible);
  function pickTarget() {
    let best = null, bs = -1e9; const fx = Math.sin(P.face), fz = Math.cos(P.face);
    for (const d of aliveD()) { const dx = d.x - P.x, dz = d.z - P.z, dist = Math.hypot(dx, dz); if (dist > 22) continue; const dot = (dx * fx + dz * fz) / (dist || 1); const sc = dot * 2 - dist * 0.12; if (dot > 0.2 && sc > bs) { bs = sc; best = d; } }
    return best;
  }
  function hitDummy(d, dmg, from, kind, big) {
    const dx = d.x - from.x, dz = d.z - from.z, l = Math.hypot(dx, dz) || 1;
    d.vx += dx / l * (big ? 5 : 3); d.vz += dz / l * (big ? 5 : 3); d.flash = 0.1; d.hits++;
    burst(v3.set(d.x, 1.2, d.z), big ? 26 : 14, big ? 8 : 6);
    popup(v3.set(d.x + rr(-0.3, 0.3), 2.3 + rr(0, 0.3), d.z), String(dmg), kind === 'sword' ? '#0e7fb8' : '#201e1d');
    St.dmgLog.push([St.t, dmg]); St.hits++;
    audio.tone(kind === 'sword' ? 200 : 520, 0.08, 0.07, 'square', 0.6); audio.burst(0.06, kind === 'sword' ? 1200 : 2600, 0.12);
    St.shake = Math.max(St.shake, big ? T.shake * 1.4 : T.shake * 0.6);
  }
  const swordTip = new THREE.Vector3(), swordBase = new THREE.Vector3();
  function bladeWorld() { FP.sword.updateWorldMatrix(true, false); swordBase.set(0, 0.2, 0).applyMatrix4(FP.sword.matrixWorld); swordTip.set(0, 1.3, 0).applyMatrix4(FP.sword.matrixWorld); }

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, hudKey = '';
  const camPos = new THREE.Vector3(0, 6, 14), camLook = new THREE.Vector3();
  function update(rdt) {
    let dt = rdt * St.slow; St.t += dt;
    if (St.hitStop > 0) { St.hitStop -= rdt; dt *= 0.06; }
    // input
    let ix = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0), iy = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
    if (keys.has('ArrowLeft')) St.yaw += rdt * 2; if (keys.has('ArrowRight')) St.yaw -= rdt * 2;
    if (keys.has('ArrowUp')) St.pitch = clamp(St.pitch + rdt, 0.05, 1.2); if (keys.has('ArrowDown')) St.pitch = clamp(St.pitch - rdt, 0.05, 1.2);
    const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
    const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw), rx = Math.cos(St.yaw), rz = -Math.sin(St.yaw);
    let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix; const ml = Math.hypot(mx, mz); if (ml > 0) { mx /= ml; mz /= ml; }
    const run = keys.has('KeyE') || keys.has('ShiftRight');
    const spd = (run ? T.run : T.walk) * Math.min(1, il) * (P.swing > 0 ? 0.45 : 1);
    if (P.lungeT > 0) { P.lungeT -= dt; P.vx = P.ldx * P.lsp; P.vz = P.ldz * P.lsp; }
    else if (P.dash > 0) { P.dash -= dt; const ds = T.dodgeDist / T.dodgeDur; P.vx = P.dx * ds; P.vz = P.dz * ds; if (Math.random() < 0.5) burst(v3.set(P.x, 0.1, P.z), 1, 1.2); }
    else { P.vx = damp(P.vx, mx * spd, T.accel, dt); P.vz = damp(P.vz, mz * spd, T.accel, dt); }
    P.x = clamp(P.x + P.vx * dt, -30, 30); P.z = clamp(P.z + P.vz * dt, -30, 30);
    for (const d of aliveD()) { const dx = P.x - d.x, dz = P.z - d.z, dd = Math.hypot(dx, dz); if (dd < 0.95 && dd > 1e-4) { P.x = d.x + dx / dd * 0.95; P.z = d.z + dz / dd * 0.95; } }
    const hs = Math.hypot(P.vx, P.vz);
    if (St.lockOn) { if (!P.target || !P.target.root.visible || Math.hypot(P.target.x - P.x, P.target.z - P.z) > 24) P.target = pickTarget(); } else P.target = (mouse.r || P.swing > 0) ? pickTarget() : null;
    const aiming = mouse.r || keys.has('KeyK') || keys.has('KeyG');
    let want = hs > 0.4 ? Math.atan2(P.vx, P.vz) : P.face;
    if ((P.swing > 0 || aiming || P.fireCd > 0) && P.target) want = Math.atan2(P.target.x - P.x, P.target.z - P.z);
    let df = want - P.face; df = Math.atan2(Math.sin(df), Math.cos(df)); P.face += df * Math.min(1, dt * T.turn);
    if (St.lockOn && P.target && !(St.dragT > 0)) { const cy = Math.atan2(P.x - P.target.x, P.z - P.target.z); let dy = cy - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, rdt * 2.2); }
    else if (hs > 0.6 && !(St.dragT > 0)) { let dy = (Math.atan2(P.vx, P.vz) + Math.PI) - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, rdt * 1.4); }
    St.dragT = (St.dragT || 0) - rdt;
    P.vy -= T.gravity * dt; P.y += P.vy * dt; if (P.y <= 0) { if (!P.ground && P.vy < -6) audio.burst(0.08, 500, 0.15); P.y = 0; P.vy = 0; P.ground = true; }
    if (P.ground && hs > 1 && P.dash <= 0) { P.stepT -= dt * hs; if (P.stepT < 0) { P.stepT = 2.2; audio.step(); } }
    P.dashCd = Math.max(0, P.dashCd - dt); P.fireCd = Math.max(0, P.fireCd - dt); P.comboT -= dt; if (P.comboT < 0) P.combo = 0;
    P.enT -= dt; if (P.enT < 0) P.en = Math.min(100, P.en + T.energyRegen * dt);
    if (P.queued && P.swing <= 0) { P.queued = false; api.slash(); }
    if (aiming && P.fireCd <= 0) fire();
    // animate body
    fox.position.set(P.x, P.y, P.z); fox.rotation.y = P.face;
    fox.userData.mood = P.swing > 0 || aiming ? 'determined' : 'warm';
    kit.animFox(fox, dt, P.dash > 0 ? 0 : hs, !P.ground);
    FP.body.rotation.y = 0;
    if (P.dash > 0) FP.body.rotation.x = (1 - P.dash / T.dodgeDur) * Math.PI * 2;
    // sword swing pose (after animFox so it wins)
    if (P.swing > 0) {
      P.swing -= dt; const total = P.swingDur, tt = 1 - Math.max(0, P.swing) / total, wf = T.windup / (T.windup + T.swingTime);
      const w = tt < wf ? smooth(0, 1, tt / wf) : 1, s = tt < wf ? 0 : Math.pow(smooth(0, 1, (tt - wf) / (1 - wf)), 0.7);
      if (P.combo === 1) { swordArm.rotation.set(lerp(-1.2, -3.05, w) + (lerp(-3.05, -0.35, s) + 3.05) * (s > 0 ? 1 : 0), 0, 0.12); FP.sword.rotation.set(Math.PI - 0.3, 0, 0); FP.body.rotation.x = lerp(-0.08 * w, 0.18, s); }
      else if (P.combo === 2) { swordArm.rotation.set(-1.45, 0, s > 0 ? lerp(1.35, -1.25, s) : lerp(0.3, 1.35, w)); FP.sword.rotation.set(Math.PI - 0.15, 0, 0); FP.body.rotation.y = s > 0 ? lerp(0.5, -0.55, s) : lerp(0, 0.5, w); }
      else { swordArm.rotation.set(-1.5, 0, 0.9); FP.sword.rotation.set(Math.PI - 0.2, 0, 0); FP.body.rotation.y = s > 0 ? -s * Math.PI * 2 : w * 0.4; FP.body.position.y += Math.sin(s * Math.PI) * 0.25; }
      // hit window
      if (tt > wf + 0.05 && tt < 0.95) for (const d of aliveD()) {
        if (P.hitSet.has(d)) continue; const dx = d.x - P.x, dz = d.z - P.z, dist = Math.hypot(dx, dz);
        let a2 = Math.atan2(dx, dz) - P.face; a2 = Math.atan2(Math.sin(a2), Math.cos(a2));
        if (dist < T.reach + 0.5 && Math.abs(a2) < (P.combo === 3 ? 3.3 : T.arc)) { P.hitSet.add(d); const big = P.combo === 3; hitDummy(d, Math.round(T.swordDmg * (big ? T.finisher : 1)), P, 'sword', big); St.hitStop = T.hitStop * (big ? 1.6 : 1); }
      }
      if (P.swing <= 0) { St.lastCombo = P.combo; }
    }
    // gun pose
    if (aiming || P.fireCd > 0) { gunArm.rotation.x = -1.48 - P.recoil * 0.35; gunArm.rotation.z = -0.08; FP.gun.rotation.set(1.43 - P.recoil * 0.5, 0, 0); FP.gun.position.z = 0.1 - P.recoil * 0.06; }
    else FP.gun.position.z = 0.1;
    P.recoil = damp(P.recoil, 0, 14, dt); flash.material.opacity = damp(flash.material.opacity, 0, 22, dt);
    // trail
    bladeWorld();
    trailPts.unshift({ b: swordBase.clone(), t: swordTip.clone(), on: P.swing > 0 && T.trail > 0.5 }); if (trailPts.length > TR) trailPts.pop();
    for (let i = 0; i < TR; i++) { const p = trailPts[i] || trailPts[trailPts.length - 1]; const a = p && p.on ? (1 - i / TR) * 0.75 : 0; trailPos.set([p.b.x, p.b.y, p.b.z], i * 6); trailPos.set([p.t.x, p.t.y, p.t.z], i * 6 + 3); trailCol.set([0.35, 0.85, 1, a * 0.2], i * 8); trailCol.set([0.75, 0.97, 1, a], i * 8 + 4); }
    trailGeo.attributes.position.needsUpdate = true; trailGeo.attributes.color.needsUpdate = true;
    // bolts
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i]; b.life -= dt;
      if (b.target && b.target.root.visible && T.homing > 0) { v4.set(b.target.x, 1.2, b.target.z).sub(b.m.position).normalize().multiplyScalar(T.boltSpeed); b.v.lerp(v4, Math.min(1, dt * T.homing)); }
      b.m.position.addScaledVector(b.v, dt); b.m.lookAt(v5.copy(b.m.position).add(b.v));
      let hit = null; for (const d of aliveD()) { if (Math.hypot(b.m.position.x - d.x, b.m.position.z - d.z) < 0.55 && b.m.position.y > 0.4 && b.m.position.y < 2.2) { hit = d; break; } }
      if (hit) hitDummy(hit, T.laserDmg, P, 'laser', false);
      if (hit || b.life < 0) { if (!hit) burst(b.m.position, 4, 2); scene.remove(b.m); bolts.splice(i, 1); }
    }
    // dummies spring
    for (const d of dummies) {
      if (d.moving) { d.t += dt; d.x = Math.sin(d.t * 0.7) * 8; d.z = -16 + Math.cos(d.t * 0.45) * 3; d.root.position.set(d.x, 0, d.z); }
      d.vx += -d.ax * 60 * dt - d.vx * 6 * dt; d.vz += -d.az * 60 * dt - d.vz * 6 * dt; d.ax += d.vx * dt; d.az += d.vz * dt;
      d.sway.rotation.set(d.az * 0.6, 0, -d.ax * 0.6); d.flash = Math.max(0, d.flash - dt); d.mats.forEach(m => m.emissive.setScalar(d.flash > 0 ? 0.8 : 0));
    }
    // fx
    for (let i = 0; i < sparkN; i++) { const s = sparkV[i]; if (s.life <= 0) continue; s.life -= dt; s.v.y -= 14 * dt; sparkArr[i * 3] += s.v.x * dt; sparkArr[i * 3 + 1] += s.v.y * dt; sparkArr[i * 3 + 2] += s.v.z * dt; if (s.life <= 0 || sparkArr[i * 3 + 1] < 0) { s.life = 0; sparkArr[i * 3 + 1] = -999; } }
    sparkGeo.attributes.position.needsUpdate = true;
    for (let i = popups.length - 1; i >= 0; i--) { const p = popups[i]; p.t += dt; p.s.position.y += dt * 1.2; p.s.material.opacity = 1 - smooth(0.5, 0.9, p.t); if (p.t > 0.9) { scene.remove(p.s); p.s.material.map.dispose(); popups.splice(i, 1); } }
    reticle.visible = !!P.target; if (P.target) { reticle.position.set(P.target.x, 1.2, P.target.z); reticle.lookAt(camera.position); }
    // camera
    let tx = P.x, tz = P.z; if (P.target && St.lockOn) { tx = lerp(P.x, P.target.x, 0.25); tz = lerp(P.z, P.target.z, 0.25); }
    v3.set(tx + Math.sin(St.yaw) * Math.cos(St.pitch) * T.camDist, 1.6 + Math.sin(St.pitch) * T.camDist, tz + Math.cos(St.yaw) * Math.cos(St.pitch) * T.camDist);
    camPos.x = damp(camPos.x, v3.x, T.camFollow, rdt); camPos.y = damp(camPos.y, v3.y, T.camFollow, rdt); camPos.z = damp(camPos.z, v3.z, T.camFollow, rdt);
    camLook.x = damp(camLook.x, tx, T.camFollow + 3, rdt); camLook.y = damp(camLook.y, 1.5, T.camFollow + 3, rdt); camLook.z = damp(camLook.z, tz, T.camFollow + 3, rdt);
    St.shake = Math.max(0, St.shake - rdt * 1.5); const sh = St.shake;
    camera.position.set(camPos.x + rr(-sh, sh) * 0.3, camPos.y + rr(-sh, sh) * 0.3, camPos.z + rr(-sh, sh) * 0.3); camera.lookAt(camLook);
    if (camera.fov !== T.fov) { camera.fov = T.fov; camera.updateProjectionMatrix(); }
    sun.target.position.set(P.x, 0, P.z); sun.position.set(P.x + 8, 16, P.z + 10);
    // hud
    hudT -= rdt;
    if (hudT < 0) { hudT = 0.1; St.dmgLog = St.dmgLog.filter(([t]) => St.t - t < 5); const dps = St.dmgLog.reduce((a, [, d]) => a + d, 0) / 5; St.best = Math.max(St.best, dps);
      const hud = { en: Math.round(P.en), combo: P.combo, hits: St.hits, dps: Math.round(dps), best: Math.round(St.best), slow: St.slow < 1, lock: St.lockOn, moving: St.moving };
      const k = JSON.stringify(hud); if (k !== hudKey) { hudKey = k; onState(hud); } }
  }
  function fire() {
    if (P.en < T.energyCost) { if (P.fireCd <= 0) { audio.tone(160, 0.08, 0.04, 'square'); P.fireCd = 0.25; } return; }
    P.en -= T.energyCost; P.enT = 0.4; P.fireCd = 1 / T.fireRate; P.recoil = T.recoil; flash.material.opacity = 1;
    const t = P.target || pickTarget(); if (t) P.face = Math.atan2(t.x - P.x, t.z - P.z);
    fox.rotation.y = P.face; fox.updateMatrixWorld(true); v3.set(0, 0.16, 0.7); FP.gun.localToWorld(v3);
    const dir = t ? v4.set(t.x, 1.2, t.z).sub(v3).normalize() : v4.set(Math.sin(P.face), 0, Math.cos(P.face));
    const m = new THREE.Mesh(boltGeo, boltMat); m.position.copy(v3); scene.add(m);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x38bdf8, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); gl.scale.setScalar(0.9); m.add(gl);
    bolts.push({ m, v: dir.clone().multiplyScalar(T.boltSpeed), life: 1.4, target: t });
    audio.tone(1500, 0.12, 0.045, 'sawtooth', 0.35);
  }
  function frame() { raf = requestAnimationFrame(frame); update(Math.min(clock.getDelta(), 0.05)); renderer.render(scene, camera); }
  frame();

  const api = {
    setTune(t) { Object.assign(T, t); St.pitch = T.camPitch; },
    getTune: () => ({ ...T }),
    slash() {
      if (P.swing > 0) { if (P.swing < P.swingDur * 0.6) P.queued = true; return; }
      P.combo = P.comboT > 0 ? (P.combo % 3) + 1 : 1; P.comboT = T.comboWindow + T.swingTime + T.windup;
      P.swingDur = (T.windup + T.swingTime) * (P.combo === 3 ? 1.25 : 1); P.swing = P.swingDur; P.hitSet = new Set();
      audio.burst(0.14, 2600, 0.12);
      const t = P.target || pickTarget(); if (t) { const d = Math.hypot(t.x - P.x, t.z - P.z); if (d < T.lunge + T.reach) { P.face = Math.atan2(t.x - P.x, t.z - P.z); if (d > T.reach * 0.7) { P.ldx = Math.sin(P.face); P.ldz = Math.cos(P.face); P.lungeT = 0.12; P.lsp = Math.min(32, (d - T.reach * 0.65) / 0.12); } } }
    },
    dodge() { if (P.dashCd > 0 || P.dash > 0) return; let dx = P.vx, dz = P.vz; const l = Math.hypot(dx, dz); if (l < 0.5) { dx = -Math.sin(P.face); dz = -Math.cos(P.face); } else { dx /= l; dz /= l; } P.dx = dx; P.dz = dz; P.dash = T.dodgeDur; P.dashCd = T.dodgeCd + T.dodgeDur; audio.burst(0.14, 1800, 0.1); },
    cycleTarget() { const list = aliveD().sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z)); if (!list.length) return; const i = list.indexOf(P.target); P.target = list[(i + 1) % list.length]; },
    setSlow(v) { St.slow = v ? 0.25 : 1; },
    setLock(v) { St.lockOn = v; if (!v) P.target = null; },
    setMoving(v) { St.moving = v; mover.root.visible = v; if (!v && P.target === mover) P.target = null; },
    resetDummies() { dummies.forEach(d => { d.ax = d.az = d.vx = d.vz = 0; d.hits = 0; }); St.hits = 0; St.best = 0; St.dmgLog = []; },
    demo(kind) { if (kind === 'combo') { api.slash(); setTimeout(api.slash, (T.windup + T.swingTime) * 1000 / St.slow * 0.75); setTimeout(api.slash, (T.windup + T.swingTime) * 2000 / St.slow * 0.75); } else if (kind === 'slash') api.slash(); else if (kind === 'fire') { let n = 0; const iv = setInterval(() => { P.fireCd = 0; fire(); if (++n >= 5) clearInterval(iv); }, 1000 / T.fireRate / St.slow); } else if (kind === 'dodge') api.dodge(); else if (kind === 'jump' && P.ground) { P.vy = T.jump; P.ground = false; } },
    save(t) { localStorage.setItem(TUNE_KEY, JSON.stringify(t)); },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur); audio.dispose(); renderer.dispose(); el.remove(); },
  };
  return api;
}
