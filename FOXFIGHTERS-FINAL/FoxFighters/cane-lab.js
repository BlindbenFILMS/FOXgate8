import * as THREE from './vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from './village-game.js';
import { crestTex } from './engine/textures.js';
import { foxKit, PLAYER_FEMALE, HOPE_LOOK } from './fox-kit.js';
import { caneKit, CANE_DEFAULTS } from './engine/cane.js';
import { castKit } from './engine/cast.js';

// CANE WORKSHOP: Hope walks a straight floor with her cane; footprints (ink) and tap marks (red) stay on the floor.
export async function createCaneLab({ container, cfg, onState = () => {} }) {
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
  const CK = caneKit({ THREE, M, toon });

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b4b0, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(-4, 9, 5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); scene.add(sun, sun.target);
  // floor: ground tone + a 10 cm-ish grid in ink
  const LEN = 24;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, LEN * 2 + 8), new THREE.MeshLambertMaterial({ color: 0xe6e4e3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(LEN * 2 + 8, (LEN * 2 + 8) * 4, 0xcfcac7, 0xd9d6d4); grid.position.y = 0.002; scene.add(grid);
  const lineMat = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, depthWrite: false });
  const strip = (w, l, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l), mat); m.rotation.x = -Math.PI / 2; scene.add(m); return m; };
  const centre = strip(0.012, LEN * 2, lineMat(0x201e1d, 0.5)); centre.position.y = 0.004;

  const hope = castKit({ THREE, M, toon, makeFox }, { cane: cfg || CANE_DEFAULTS }).make('hope');
  hope.userData.lookAt = null; scene.add(hope);
  const rig = hope.userData.rig;
  const bs = hope.scale.x, FH = rig.dims().sternumU * bs * 1.95;
  // guides that ride along with her: shoulder lines (ink), arc edges (red)
  const guides = new THREE.Group(); scene.add(guides);
  const gStrip = (mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 3.2), mat); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.006, 1.2); guides.add(m); return m; };
  const shL = gStrip(lineMat(0x201e1d)), shR = gStrip(lineMat(0x201e1d)), arL = gStrip(lineMat(0xec3013)), arR = gStrip(lineMat(0xec3013));
  // swing test: reach rings on the floor (ink = cane, red = pulse) + the pulse itself
  const ringGeo = new THREE.RingGeometry(0.985, 1, 96), caneRing = new THREE.Mesh(ringGeo, lineMat(0x201e1d, 0.9)), pulseRing = new THREE.Mesh(ringGeo, lineMat(0xec3013, 0.9));
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }), pulse = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 64), pulseMat);
  [caneRing, pulseRing, pulse].forEach(m => { m.rotation.x = -Math.PI / 2; m.position.y = 0.012; m.visible = false; scene.add(m); });
  const SW = { t: -1, show: 0 };
  // marks
  const footGeo = new THREE.CircleGeometry(0.07, 18), tapGeo = new THREE.RingGeometry(0.03, 0.06, 20), tapDot = new THREE.CircleGeometry(0.03, 14);
  const fMat = { L: lineMat(0x201e1d, 0.85), R: lineMat(0x6f6a67, 0.85) }, tMat = lineMat(0xec3013);
  const marks = []; const MAXM = 70;
  function mark(geo, mat, p, sx = 1, sz = 1) { const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(p.x, 0.008 + marks.length * 0.00002, p.z); m.scale.set(sx, sz, 1); scene.add(m); marks.push(m); if (marks.length > MAXM) { const o = marks.shift(); scene.remove(o); } }
  const trailN = 600, trailArr = new Float32Array(trailN * 3).fill(0), trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute('position', new THREE.BufferAttribute(trailArr, 3)); trailGeo.setDrawRange(0, 0);
  const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0xec3013 })); trail.frustumCulled = false; scene.add(trail); let trailI = 0;
  const St = { taps: { L: 0, R: 0 }, steps: { L: 0, R: 0 }, lastFoot: '', lastTap: '', inStep: 0, total: 0 };
  rig.onStep = (s, p) => { mark(footGeo, fMat[s], p, 0.75, 1.5); St.steps[s]++; St.lastFoot = s; };
  rig.onTap = (s, p) => { mark(tapGeo, tMat, p); mark(tapDot, tMat, p); St.taps[s]++; St.total++; if ((St.lastFoot === 'L' && s === 'R') || (St.lastFoot === 'R' && s === 'L')) St.inStep++; St.lastTap = s; };
  function clearMarks() { marks.forEach(m => scene.remove(m)); marks.length = 0; trailI = 0; trailGeo.setDrawRange(0, 0); Object.assign(St, { taps: { L: 0, R: 0 }, steps: { L: 0, R: 0 }, inStep: 0, total: 0 }); }

  // cameras
  const persp = new THREE.PerspectiveCamera(42, 1, 0.05, 100), ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.05, 100), inset = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.05, 100);
  const V = { view: 'three', yaw: 0.85, pitch: 0.28, dist: 0, walking: true, slow: false, paused: false, inset: true, z: -LEN + 2 };
  V.dist = FH * 2.6; const ptrs = new Map(); const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); });
  el.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (V.pd) V.dist = clamp(V.dist * V.pd / d, FH * 0.8, FH * 6); V.pd = d; return; }
    if (V.view === 'three') { V.yaw -= dx * 0.008; V.pitch = clamp(V.pitch + dy * 0.006, 0.02, 1.45); } });
  const endP = e => { ptrs.delete(e.pointerId); V.pd = 0; }; el.addEventListener('pointerup', endP); el.addEventListener('pointercancel', endP);
  el.addEventListener('wheel', e => { V.dist = clamp(V.dist + e.deltaY * 0.004, FH * 0.8, FH * 6); e.preventDefault(); }, { passive: false });
  function frameOrtho(cam, w, h, view, z) {
    const asp = w / h, fh = view === 'top' ? FH * 1.9 : view === 'side' ? FH * 1.25 : FH * 1.15, fw = view === 'side' ? FH * 1.9 : FH * 1.1;
    const hh = Math.max(fh, fw / asp) / 2, hw = hh * asp;
    cam.left = -hw; cam.right = hw; cam.top = hh; cam.bottom = -hh; cam.updateProjectionMatrix();
    if (view === 'top') { cam.position.set(0, 20, z + FH * 0.6); cam.up.set(0, 0, 1); cam.lookAt(0, 0, z + FH * 0.6); }          // she walks up the screen
    else if (view === 'side') { cam.position.set(-20, FH * 0.5, z + FH * 0.35); cam.up.set(0, 1, 0); cam.lookAt(0, FH * 0.5, z + FH * 0.35); }  // from her right
    else { cam.position.set(0, FH * 0.5, z + 20); cam.up.set(0, 1, 0); cam.lookAt(0, FH * 0.5, z); }                             // facing her
  }
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, hudKey = '';
  function update(rdt) {
    let dt = Math.min(rdt, 0.05) * (V.slow ? 0.25 : 1); if (V.paused) dt = 0;
    const c = rig.cfg, spW = V.walking ? c.speed * 100 * rig.k * bs : 0;
    V.z += spW * dt; if (V.z > LEN - 2) { V.z = -LEN + 2; clearMarks(); }
    hope.position.set(0, 0, V.z); hope.rotation.y = 0;
    if (dt > 0) { hope.userData.rig = null; animFox(hope, dt, spW > 0 ? Math.max(0.3, spW) : 0); hope.userData.rig = rig; rig.update(dt, spW); }
    const d = rig.dims(); const sx = d.side;
    shL.position.x = -d.shoulderHalfU * bs; shR.position.x = d.shoulderHalfU * bs; arL.position.x = -d.halfW * bs; arR.position.x = d.halfW * bs; guides.position.z = V.z;
    if (c.technique === 'constant' && V.walking && dt > 0) { const p = rig.tipW; if (p.y < 0.03) { const i = trailI % trailN; trailArr[i * 3] = p.x; trailArr[i * 3 + 1] = 0.01; trailArr[i * 3 + 2] = p.z; trailI++; if (trailI >= trailN) { trailArr.copyWithin(0, 3); trailI = trailN - 1; } trailGeo.attributes.position.needsUpdate = true; trailGeo.setDrawRange(0, Math.min(trailI, trailN)); } }
    const RW = rig.reachU() * bs; SW.show = Math.max(0, SW.show - dt);
    caneRing.visible = pulseRing.visible = SW.show > 0 || V.view === 'top' && !V.walking; caneRing.scale.setScalar(RW); pulseRing.scale.setScalar(RW * 2); caneRing.position.z = pulseRing.position.z = pulse.position.z = V.z;
    if (SW.t >= 0) { SW.t += dt; const q = (SW.t - rig.SWD * 0.58) / 0.32; pulse.visible = q > 0 && q < 1; if (pulse.visible) { pulse.scale.setScalar(Math.max(0.01, RW * 2 * q)); pulseMat.opacity = 0.75 * (1 - q); } if (q >= 1) SW.t = -1; } else pulse.visible = false;
    sun.position.set(-4, 9, V.z + 5); sun.target.position.set(0, 0, V.z);
    hudT -= rdt; if (hudT < 0) { hudT = 0.2; const info = { ...rig.info, steps: St.steps, taps: St.taps, inStep: St.total ? Math.round(St.inStep / St.total * 100) : 100 }; const k = JSON.stringify(info); if (k !== hudKey) { hudKey = k; onState(info); } }
  }
  function render() {
    const w = W(), h = H(); renderer.setViewport(0, 0, w, h); renderer.setScissorTest(false); renderer.clear();
    let cam;
    if (V.view === 'three') { const t = V.focus ? new THREE.Vector3(0, FH * 0.8, V.z + 0.1) : new THREE.Vector3(0, FH * 0.42, V.z + FH * 0.25); persp.aspect = w / h; persp.fov = w < h ? 58 : 42; persp.updateProjectionMatrix(); persp.position.set(t.x + Math.sin(V.yaw) * Math.cos(V.pitch) * V.dist, t.y + Math.sin(V.pitch) * V.dist, t.z + Math.cos(V.yaw) * Math.cos(V.pitch) * V.dist); persp.lookAt(t); cam = persp; }
    else { frameOrtho(ortho, w, h, V.view, V.z); cam = ortho; }
    renderer.render(scene, cam);
    if (V.inset && V.view !== 'top') {
      const s = Math.round(Math.min(w, h) * (w < 560 ? 0.36 : 0.3)), x = w - s - 12, y = h - s - 12;
      renderer.setScissorTest(true); renderer.setViewport(x - 2, y - 2, s + 4, s + 4); renderer.setScissor(x - 2, y - 2, s + 4, s + 4); renderer.setClearColor(0x201e1d); renderer.clear();
      renderer.setViewport(x, y, s, s); renderer.setScissor(x, y, s, s); renderer.setClearColor(0xf3f2f2); renderer.clear(); frameOrtho(inset, s, s, 'top', V.z); renderer.render(scene, inset); renderer.setScissorTest(false);
    }
  }
  function loop() { raf = requestAnimationFrame(loop); update(clock.getDelta()); render(); }
  loop();
  const ro = new ResizeObserver(() => renderer.setSize(W(), H())); ro.observe(container);
  return {
    set(c) { rig.set(c); if (c.technique) { trailI = 0; trailGeo.setDrawRange(0, 0); } },
    setView(v) { V.view = v; }, toggle(k) { V[k] = !V[k]; return V[k]; }, state: () => ({ view: V.view, walking: V.walking, slow: V.slow, paused: V.paused, inset: V.inset }),
    clear: clearMarks, swing() { if (rig.swing()) { SW.t = 0; SW.show = 3; } }, cam(o) { Object.assign(V, o); }, step(n = 30, dt = 1 / 30) { const p = V.paused; V.paused = false; for (let i = 0; i < n; i++) update(dt); V.paused = p; render(); },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.remove(); },
  };
}
