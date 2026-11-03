// s609 JOINTED FOX: the cast player is now built with ELBOWS + KNEES (fox-kit jointLimbs). This page drives the NEW player and an OLD copy
// (joints: false) side by side with the same input, so you can see the difference; the pose buttons play engine/fox-poses.js on both.
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js';
import { castKit, loadCastRigs } from './cast.js?v=s339c';
import { applyPose, FOX_POSES } from './fox-poses.js?v=s645';
export async function startMirror(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#201e1d');
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(4, 8, 5); scene.add(sun);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ color: '#2a2725' })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const gridH = new THREE.GridHelper(60, 30, 0x4a4542, 0x3a3634); gridH.position.y = 0.003; scene.add(gridH);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: true });
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, await loadCastRigs().catch(() => ({})));
  const NEW = cast.make('player', { holster: true }), OLD = cast.make('player', { holster: true, joints: false }); scene.add(NEW, OLD);
  const FOXES = [OLD, NEW], GAP = 1.7;
  const st = { x: 0, z: 0, y: 0, vy: 0, face: 0.2, sp: 0, mx: 0, mz: 0, camYaw: 0.2 }, keys = new Set();
  const all = fn => FOXES.forEach(f => f.userData.rig && fn(f.userData.rig));
  const kd = e => { if (e.repeat) return; keys.add(e.code); if (e.code === 'Space') { api.jump(); e.preventDefault(); } if (e.code === 'Digit1') api.meleeDown(); if (e.code === 'Digit2') api.shoot(); };
  const ku = e => { keys.delete(e.code); if (e.code === 'Digit1') api.meleeUp(); };
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size(); const ro = new ResizeObserver(size); ro.observe(el);
  let drag = null; el.addEventListener('pointerdown', e => { if (e.target === renderer.domElement) drag = e.clientX; }); const pu = () => { drag = null; }, pm = e => { if (drag == null) return; st.camYaw -= (e.clientX - drag) * 0.008; drag = e.clientX; };
  addEventListener('pointerup', pu); addEventListener('pointermove', pm);
  let raf = 0, last = performance.now(), mDown = 0, mHeld = false, mode = 'mirror', mt = 0, pk = 0;
  function frame(t) { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - last) / 1000); last = t; mt += dt;
    if (mDown && !mHeld && t - mDown > 300) { mHeld = true; all(G => G.toggle()); }
    if (mode === 'walk') { st.mx = 0; st.mz = -0.45; st.camYaw += dt * 0.3; } else if (mode !== 'mirror') { st.mx = 0; st.mz = 0; }
    let ix = st.mx + ((keys.has('KeyD') || keys.has('ArrowRight')) ? 1 : 0) - ((keys.has('KeyA') || keys.has('ArrowLeft')) ? 1 : 0), iz = st.mz + ((keys.has('KeyS') || keys.has('ArrowDown')) ? 1 : 0) - ((keys.has('KeyW') || keys.has('ArrowUp')) ? 1 : 0);
    const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
    const cy = st.camYaw, wx = ix * Math.cos(cy) + iz * Math.sin(cy), wz = -ix * Math.sin(cy) + iz * Math.cos(cy), sp = Math.min(1, il) * 5.5;
    if (sp > 0.1) { st.x = clamp(st.x + wx * sp * dt, -26, 26); st.z = clamp(st.z + wz * sp * dt, -26, 26); let d = Math.atan2(wx, wz) - st.face; d = Math.atan2(Math.sin(d), Math.cos(d)); st.face += d * Math.min(1, dt * 12); }
    st.sp += (sp - st.sp) * Math.min(1, dt * 10);
    st.vy -= 24 * dt; st.y += st.vy * dt; if (st.y <= 0) { st.y = 0; st.vy = 0; }
    const rx = Math.cos(st.face), rz = -Math.sin(st.face), posing = FOX_POSES[mode]; pk += ((posing ? 1 : 0) - pk) * Math.min(1, dt * 8);
    FOXES.forEach((f, i) => { const s = i ? 1 : -1; f.position.set(st.x + rx * GAP * 0.5 * s, st.y, st.z + rz * GAP * 0.5 * s); f.rotation.y = st.face;
      kit.animFox(f, dt, st.sp > 0.3 ? st.sp : 0, st.y > 0.05); if (pk > 0.01 && f === NEW) applyPose(THREE, f, posing ? mode : api._lastPose, mt, pk); });
    const port = cam.aspect < 1, d = (port ? 10.5 : 7.2) * (1 - pk * 0.32), tx = st.x + (NEW.position.x - st.x) * pk * 0.6, tz = st.z + (NEW.position.z - st.z) * pk * 0.6;
    cam.position.set(tx + Math.sin(cy) * d, 2.5 - pk * 0.9, tz + Math.cos(cy) * d); cam.lookAt(tx, 1.1, tz); renderer.render(scene, cam); }
  raf = requestAnimationFrame(frame);
  const api = { _lastPose: null,
    play(k) { if (FOX_POSES[k]) api._lastPose = k; mode = k === 'walk' || FOX_POSES[k] ? k : 'mirror'; mt = 0; if (FOX_POSES[k]) { st.camYaw = k === 'kneel' || k === 'bow' || k === 'point' || k === 'punch' ? 1.35 : 0.2; st.face = 0.2; } return mode; },
    stick(x, z) { st.mx = x; st.mz = z; },
    meleeDown() { if (mDown) return; mDown = performance.now(); mHeld = false; },
    meleeUp() { if (!mDown) return; if (!mHeld) all(G => G.strike()); mDown = 0; mHeld = false; },
    shoot() { all(G => { const f = G.shoot(); if (f && G.bolt) G.bolt(f, null, false); }); },
    jump() { if (st.y <= 0.001) st.vy = 8; },
    fox: NEW,
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('pointerup', pu); removeEventListener('pointermove', pm); renderer.dispose(); el.innerHTML = ''; },
  };
  return api;
}
