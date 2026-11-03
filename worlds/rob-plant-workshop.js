// s331 PLANT CAM WORKSHOP scene: the Pearl Sail doors, the kiosk, Rob, the door-buster charge and his close-up paws, played on the same
// timeline as the game (worlds/meru2-rob.js 'toDoor' + 'plant'). Cameras come from worlds/rob-plant-cam.js. Two views:
// SHOT = what the game camera sees (wide 16:9 or phone 9:19.5 frame) · FREE = orbit around the set with the selected shot's camera drawn in.
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js';
import { plantShot, PLANT_T, CHARGE_AT } from './rob-plant-cam.js?v=10';

export async function createPlantWorkshop({ container }) {
  const touch = matchMedia('(pointer: coarse)').matches, W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.5 : 2)); renderer.setSize(W(), H()); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = !touch; renderer.setScissorTest(true);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#b9c3cc'); scene.fog = new THREE.Fog(0xb9c3cc, 30, 70);
  scene.add(new THREE.HemisphereLight(0xf2f6ff, 0x5a5650, 1.3)); const sun = new THREE.DirectionalLight(0xfff4e0, 1.5); sun.position.set(-8, 14, -10); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); scene.add(sun);
  const grad = makeGradient(), cache = new Map(), toonM = c => { if (!cache.has(c)) cache.set(c, new THREE.MeshToonMaterial({ color: c, gradientMap: grad })); return cache.get(c); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function M(geo, mat, x = 0, y = 0, z = 0, parent) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = !touch; m.receiveShadow = true; (parent || scene).add(m); return m; }
  const box = (p, w, h, d, m, x, y, z) => M(new THREE.BoxGeometry(w, h, d), m, x, y, z, p), basic = c => new THREE.MeshBasicMaterial({ color: c }), V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), PI = Math.PI;
  // world = the door frame: x = sd (sideways), z = -o (out from the doors is -z, as in the game), y = h
  const at = (o, sd, h = 0) => V(sd, h, -o);
  { const g = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), toonM('#9aa09a')); g.rotation.x = -PI / 2; g.receiveShadow = true; scene.add(g);
    const pav = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), toonM('#cfc8bb')); pav.rotation.x = -PI / 2; pav.position.set(0, 0.01, -4.5); pav.receiveShadow = true; scene.add(pav);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(80, 10), toonM('#3d4046')); road.rotation.x = -PI / 2; road.position.set(0, 0.012, -14); scene.add(road);
    box(scene, 22, 9, 1.2, toonM('#e9e6df'), 0, 4.5, 0.6); box(scene, 22, 0.5, 1.3, toonM('#ec3013'), 0, 8.0, 0.55); box(scene, 3.4, 3.5, 0.3, toonM('#26292d'), 0, 1.75, -0.02); }
  { const pod = M(new THREE.CylinderGeometry(4.2, 4.2, 5.8, 40), toonM('#d7ad52'), 0, 2.9, 4.55); const rim = M(new THREE.TorusGeometry(4.2, 0.06, 6, 48), toonM('#ffd23a'), 0, 0.05, 4.55); rim.rotation.x = PI / 2; }   // s336 the Pearl Sail's round entrance pod (game: x 402.1-405.9, front 0.55 m behind the doors)
  const doorG = new THREE.Group(); scene.add(doorG); doorG.rotation.y = PI;   // door-local +z = out, like the game
  for (const sd of [-1, 1]) { const g = new THREE.Group(); doorG.add(g); g.position.set(sd * 0.68, 1.5, 0.14); box(g, 1.32, 3.0, 0.14, toonM('#59606a'), 0, 0, 0); box(g, 1.2, 0.08, 0.16, basic(0xec3013), 0, 1.3, 0.01); box(g, 0.08, 0.5, 0.18, toonM('#c7ccd3'), -sd * 0.5, 0, 0); }
  // the kiosk
  { const k = new THREE.Group(); scene.add(k); k.position.copy(at(1.0, 3.4)); k.rotation.y = PI; const dk = toonM('#26292d');
    box(k, 0.16, 1.2, 0.16, dk, 0, 0.6, 0); box(k, 1.08, 0.86, 0.5, dk, 0, 1.6, 0); const cv = document.createElement('canvas'); cv.width = 256; cv.height = 184; const g = cv.getContext('2d'), w = 256, h = 184;   // s332 the BUILDING CLOSED notice (same card as the game)
    g.fillStyle = '#10161c'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, 34); g.fillStyle = '#fff'; g.font = '900 19px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MACHINE FLEET HQ', 12, 18);
    g.font = '900 30px Archivo, sans-serif'; g.fillText('BUILDING', 12, 72); g.fillText('CLOSED', 12, 104); g.fillStyle = '#ffd23a'; g.font = '800 15px Archivo, sans-serif'; g.fillText('SYSTEMS MALFUNCTION', 12, 140); g.fillStyle = '#9aa0a6'; g.fillText('UNTIL FURTHER NOTICE', 12, 162);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const sc = M(new THREE.PlaneGeometry(0.9, 0.64), new THREE.MeshBasicMaterial({ map: tx }), 0, 1.6, 0.256, k); sc.castShadow = false; }
  // the charge (same build as the game)
  const charge = new THREE.Group(); scene.add(charge);
  box(charge, 0.56, 0.36, 0.12, toonM('#2a2d33'), 0, 0, 0); for (const x of [-0.19, 0.19]) box(charge, 0.14, 0.3, 0.1, toonM('#c9b27a'), x, 0, 0.1); for (const [x, c] of [[-0.06, '#ec3013'], [0.06, '#3a7bd5']]) box(charge, 0.015, 0.34, 0.015, toonM(c), x, 0, 0.16);
  const cBtn = box(charge, 0.09, 0.05, 0.09, basic(0xd81e1e), 0, -0.13, 0.12);
  const tmrC = document.createElement('canvas'); tmrC.width = 96; tmrC.height = 48; const tmrT = new THREE.CanvasTexture(tmrC); tmrT.colorSpace = THREE.SRGBColorSpace; let tmrV = -9;
  function drawTimer(v) { if (v === tmrV) return; tmrV = v; const g = tmrC.getContext('2d'); g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, 96, 48); if (v >= 0) { g.fillStyle = '#ff2a1a'; g.font = '900 34px Archivo, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('0:' + String(v).padStart(2, '0'), 48, 26); } else if (v === -1) { g.fillStyle = '#ff2a1a'; g.font = '900 21px Archivo, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ARM? Y/N', 48, 26); }   /* s333 (Ben) */ tmrT.needsUpdate = true; }
  M(new THREE.PlaneGeometry(0.22, 0.11), new THREE.MeshBasicMaterial({ map: tmrT }), 0, 0.07, 0.171, charge); drawTimer(-1);
  // Rob
  const kit = foxKit({ THREE, scene, toon: toonM, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const GUARD = { outfit: 'armor', torso: ['#5a5f67', '#44484f', '#26292d'], crest: 'M', eyes: ['#3a2a1a', '#3a2a1a'], look: { armorAccent: '#e6b45a' } };
  const rob = kit.makeFox({ key: 'robMorris', name: 'Rob', ...GUARD, mood: 'determined' }); if (!rob.parent) scene.add(rob); rob.traverse(o => { if (o.isMesh) o.castShadow = !touch; });
  // the close-up paws
  const HANDS = [0, 1].map(i => { const g = new THREE.Group(); doorG.add(g); g.visible = false; const sl = toonM('#44484f'), fur = toonM('#d9772b');
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.6, 10).rotateX(PI / 2).translate(0, 0, 0.36), sl)); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 10).rotateX(PI / 2).translate(0, 0, 0.08), toonM('#e6b45a')));
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), fur); paw.scale.set(1, 0.8, 1.15); g.add(paw); if (i) g.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.07, 3, 6).rotateX(PI / 2).translate(0, -0.01, -0.09), fur)); return g; });
  const shoulderW = V(), handL = V();
  function handAt(i, x, y, z) { const g = HANDS[i]; g.visible = true; g.position.set(x, y, z); handL.set(i ? 0.6 : -0.6, 1.05, 1.6); doorG.localToWorld(shoulderW.copy(handL)); g.lookAt(shoulderW); }
  function handW() { const A = rob.userData.P, arm = A && A.arms && A.arms[1]; if (!arm) return V(rob.position.x, 1.0, rob.position.z); rob.updateMatrixWorld(true); return arm.localToWorld(V(0, -0.5, 0.12)); }
  const KIO = at(1.5, 2.15), SPOT = at(0.85, -0.95), WALK_T = Math.max(1.6, KIO.distanceTo(SPOT) / 1.2);   // workshop walk is slowed down so the WALK shot can be judged
  const doorAt = V(0, 1.3, 0.27);
  const lerp = (a, b, k) => a + (b - a) * k, sm = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x)), angD = (a, b) => { let d = a - b; while (d > PI) d -= 2 * PI; while (d < -PI) d += 2 * PI; return d; };
  // pose the whole set at timeline time T (T < 0 = walking, -WALK_T..0; 0..PLANT_T = the plant)
  function pose(T, dt) { const A = rob.userData.P; for (const h of HANDS) h.visible = false; rob.visible = true;
    if (A && A.arms) for (const a of A.arms) { a.rotation.x = 0; a.rotation.z = 0; }
    if (T < 0) { const k = 1 + T / WALK_T; rob.position.copy(KIO).lerp(SPOT, k); rob.rotation.y = Math.atan2(SPOT.x - KIO.x, SPOT.z - KIO.z); kit.animFox(rob, dt, 1.2, false);
      if (charge.parent !== scene) scene.add(charge); charge.position.copy(handW()); charge.rotation.set(0, rob.rotation.y + PI, 0); cBtn.scale.y = 1; drawTimer(-1); return; }
    rob.position.copy(SPOT); rob.rotation.y = 0; kit.animFox(rob, dt, 0, false); const T0 = T;
    if (T0 < 2.4 && A && A.arms) { const up = sm(T0 / 0.8); A.arms[1].rotation.x = -1.5 * up; A.arms[1].rotation.z = 0.05; A.arms[0].rotation.x = -1.3 * sm((T0 - 0.6) / 0.6) * (1 - sm((T0 - 2.0) / 0.4)); }
    if (T0 < 1.7) { if (charge.parent !== scene) scene.add(charge); const hp = handW(), tw = doorG.localToWorld(doorAt.clone()), k = sm((T0 - 0.7) / 1.0); charge.position.copy(hp.lerp(tw, k)); charge.rotation.set(0, PI, 0); }
    else { if (charge.parent !== doorG) doorG.add(charge); charge.position.copy(doorAt); charge.rotation.set(0, 0, 0); }
    if (T0 < 2.45) { const cl = doorG.worldToLocal(charge.getWorldPosition(V())); handAt(0, cl.x - 0.34, cl.y - 0.02, cl.z + 0.04); handAt(1, cl.x + 0.34, cl.y - 0.02, cl.z + 0.04); }   // s337 two paws carry + press the charge on (the body is hidden in the close-up)
    if (T0 >= 2.4) { const mv = sm((T0 - 2.4) / 0.6), pk = T0 > 3.0 && T0 < 3.4 ? Math.sin((T0 - 3.0) / 0.4 * PI) : 0, rr2 = sm((T0 - 3.7) / 0.6);
      if (rr2 < 1) handAt(1, lerp(0.42, 0.0, mv) + 0.45 * rr2, lerp(1.0, 1.17, mv) - 0.3 * rr2, lerp(0.9, 0.45, mv) - 0.08 * pk + 0.9 * rr2); }
    cBtn.scale.y = T0 > 3.15 && T0 < 3.5 ? 0.4 : 1; cBtn.material.color.setHex(T0 > 3.15 && T0 < 3.9 ? 0xff6a5a : 0xd81e1e); drawTimer(T0 > 3.3 ? Math.max(0, 10 - Math.floor(T0 - 3.3)) : -1); }
  const res = (v, s) => (v === 'charge' ? CHARGE_AT : [-rob.position.z, rob.position.x, s.lookH ?? 1.15]);
  // cameras
  const shotCam = new THREE.PerspectiveCamera(50, 16 / 9, 0.05, 200), freeCam = new THREE.PerspectiveCamera(50, 1, 0.05, 200);
  const helper = new THREE.CameraHelper(new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1.2)); scene.add(helper); helper.visible = false;
  const lookDot = M(new THREE.SphereGeometry(0.06, 10, 8), basic(0xffd23a)); lookDot.castShadow = false; lookDot.visible = false;
  const lineG = new THREE.BufferGeometry().setFromPoints([V(), V()]), line = new THREE.Line(lineG, new THREE.LineBasicMaterial({ color: 0xffd23a })); scene.add(line); line.visible = false;
  const ORB = { yaw: -0.9, pitch: 0.35, dist: 9, tgt: V(0.8, 1.2, -1.6) };
  const S = { cfg: null, T: -0.5, play: true, view: 'shot', frame: 'wide', sel: 0, end: 'from', onT: null, last: performance.now(), dead: false, raf: 0 };
  function placeShot(sh) { const p = at(sh.p[0], sh.p[1], sh.p[2]), l = at(sh.l[0], sh.l[1], sh.l[2]); shotCam.position.copy(p); shotCam.lookAt(l); shotCam.fov = sh.fov; shotCam.updateProjectionMatrix(); return [p, l]; }
  function frame(now) { if (S.dead) return; S.raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (now - S.last) / 1000); S.last = now; if (!S.cfg) return;
    if (S.play) { S.T += dt; if (S.T > PLANT_T + 0.6) S.T = -WALK_T; } pose(Math.min(S.T, PLANT_T), dt); if (S.onT) S.onT(S.T);
    const port = S.frame === 'phone', ph = S.T < 0 ? 'toDoor' : 'plant', tt = S.T < 0 ? S.T + WALK_T : Math.min(S.T, PLANT_T);
    const sh = plantShot(S.cfg, ph, tt, port, res); let pl = null; if (sh) { pl = placeShot(sh); if (sh.hideRob && S.view === 'shot') rob.visible = false; }
    const w = W(), h = H(); renderer.setSize(w, h, false);
    if (S.view === 'shot') { const ar = port ? 9 / 19.5 : 16 / 9; let vw = w, vh = w / ar; if (vh > h) { vh = h; vw = h * ar; } const x = (w - vw) / 2, y = (h - vh) / 2;
      renderer.setScissor(0, 0, w, h); renderer.setViewport(0, 0, w, h); renderer.setClearColor(0x0b0a0a); renderer.clear(); shotCam.aspect = ar; shotCam.updateProjectionMatrix();
      helper.visible = lookDot.visible = line.visible = false; renderer.setScissor(x, y, vw, vh); renderer.setViewport(x, y, vw, vh); renderer.render(scene, shotCam); return; }
    // FREE: orbit + the selected shot's camera (at the FROM or TO end you are editing)
    const s = S.cfg.shots[S.sel]; if (s) { const e = s[S.end] || s.from, L = Array.isArray(e.l) ? e.l : res(e.l, s), d = placeShot({ p: e.p, l: L, fov: s.fov || 50 });
      helper.camera.position.copy(d[0]); helper.camera.quaternion.copy(shotCam.quaternion); helper.camera.fov = s.fov || 50; helper.camera.aspect = port ? 9 / 19.5 : 16 / 9; helper.camera.updateProjectionMatrix(); helper.camera.updateMatrixWorld(true); helper.update(); helper.visible = true;
      lookDot.position.copy(d[1]); lookDot.visible = true; lineG.setFromPoints([d[0], d[1]]); line.visible = true; }
    freeCam.aspect = w / h; freeCam.updateProjectionMatrix(); const cp = Math.cos(ORB.pitch); freeCam.position.set(ORB.tgt.x + Math.sin(ORB.yaw) * cp * ORB.dist, ORB.tgt.y + Math.sin(ORB.pitch) * ORB.dist, ORB.tgt.z - Math.cos(ORB.yaw) * cp * ORB.dist); freeCam.lookAt(ORB.tgt);
    renderer.setScissor(0, 0, w, h); renderer.setViewport(0, 0, w, h); renderer.render(scene, freeCam); }
  S.raf = requestAnimationFrame(frame);
  // orbit: drag = turn, two fingers / wheel = zoom, shift-drag or right-drag = pan
  const el = renderer.domElement, ptrs = new Map(); let pinch0 = 0, dist0 = 0;
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY, e.button === 2 || e.shiftKey]); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); dist0 = ORB.dist; } });
  el.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if (!p || S.view !== 'free') return; const dx = e.clientX - p[0], dy = e.clientY - p[1]; p[0] = e.clientX; p[1] = e.clientY;
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; ORB.dist = clamp(dist0 * pinch0 / Math.max(20, Math.hypot(a[0] - b[0], a[1] - b[1])), 1.5, 30); return; }
    if (p[2]) { const r = V(Math.cos(ORB.yaw), 0, Math.sin(ORB.yaw)); ORB.tgt.addScaledVector(r, -dx * 0.006 * ORB.dist / 6); ORB.tgt.y = clamp(ORB.tgt.y + dy * 0.006 * ORB.dist / 6, 0, 6); return; }
    ORB.yaw += dx * 0.008; ORB.pitch = clamp(ORB.pitch + dy * 0.006, -0.2, 1.4); });
  const up = e => ptrs.delete(e.pointerId); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', e => { e.preventDefault(); ORB.dist = clamp(ORB.dist * (1 + Math.sign(e.deltaY) * 0.1), 1.5, 30); }, { passive: false });
  const toDoorFrame = v => [+(-v.z).toFixed(2), +v.x.toFixed(2), +v.y.toFixed(2)];
  return {
    WALK_T, set(cfg) { S.cfg = cfg; }, setT(t) { S.T = t; }, getT: () => S.T, setPlay(b) { S.play = b; }, setView(v) { S.view = v; }, setFrame(f) { S.frame = f; }, select(i, end) { S.sel = i; S.end = end; }, onTime(fn) { S.onT = fn; },
    // the free camera's position + the point it orbits, in door-frame numbers (SET FROM VIEW)
    fromView() { return { p: toDoorFrame(freeCam.position), l: toDoorFrame(ORB.tgt) }; },
    focus(cfgEnd) { if (!cfgEnd) return; const L = Array.isArray(cfgEnd.l) ? cfgEnd.l : res(cfgEnd.l, {}); ORB.tgt.copy(at(L[0], L[1], L[2])); const p = at(cfgEnd.p[0], cfgEnd.p[1], cfgEnd.p[2]), d = p.clone().sub(ORB.tgt); ORB.dist = clamp(d.length(), 1.5, 30); ORB.pitch = clamp(Math.asin(d.y / Math.max(0.01, d.length())), -0.2, 1.4); ORB.yaw = Math.atan2(d.x, -d.z); },
    destroy() { S.dead = true; cancelAnimationFrame(S.raf); renderer.dispose(); el.remove(); } };
}
