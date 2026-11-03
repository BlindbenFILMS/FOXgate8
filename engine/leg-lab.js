// s662w LEG LAB (Ben: leg joint movement, "all of it"): the tall player on a test floor. Modes: IDLE · WALK · RUN · STANCE (sword out) · JUMP ·
// CROUCH · KNEEL · SIT · STAIRS (he walks up + down real steps; u.groundAt makes each foot plant on its own step). Drag to turn, scroll / pinch to zoom.
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js';
import { castKit, loadCastRigs } from './cast.js';
import { nobleShoes } from './noble-shoes.js?v=s667l';
export async function startLegLab(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#201e1d');
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.5); sun.position.set(-4, 8, 6); scene.add(sun);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: true });
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, await loadCastRigs().catch(() => ({})));
  // s665 PLAYER / HOPE (her cane rig runs inside animFox; it follows the legTick step phase)
  const FOX = { player: cast.make('player', { holster: true }), hope: cast.make('hope'), noble: cast.make('noble') }; scene.add(FOX.player, FOX.hope, FOX.noble); FOX.hope.visible = false; FOX.noble.visible = false;
  const NS = nobleShoes({ THREE, M, toon }).attach(FOX.noble); window.__nobleShoes = NS;   // s667 his shoe drones
  let who = 'player', fox = FOX.player, u = fox.userData;
  // floor + a 1 m grid; STAIRS: 6 steps up (0.18 m each, 0.5 m deep), a landing, 6 down, along +z
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: '#2e2a28' })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const grid = new THREE.GridHelper(40, 40, 0x4a4542, 0x3a3633); grid.position.y = 0.002; scene.add(grid);
  const SZ0 = 2, RISE = 0.18, RUN = 0.5, N = 6, LAND = 1.6, stairs = new THREE.Group(); scene.add(stairs); stairs.visible = false;
  const stepM = toon('#8a8380'), topM = toon('#b8b2ad');
  for (let i = 0; i < N; i++) { const h = (i + 1) * RISE; M(new THREE.BoxGeometry(2.4, h, RUN), i % 2 ? stepM : topM, 0, h / 2, SZ0 + i * RUN + RUN / 2, stairs, 0.01);
    M(new THREE.BoxGeometry(2.4, h, RUN), i % 2 ? stepM : topM, 0, h / 2, SZ0 + N * RUN + LAND + (N - 1 - i) * RUN + RUN / 2, stairs, 0.01); }
  M(new THREE.BoxGeometry(2.4, N * RISE, LAND), topM, 0, N * RISE / 2, SZ0 + N * RUN + LAND / 2, stairs, 0.01);
  const stairY = z => { if (z < SZ0) return 0; const a = z - SZ0; if (a < N * RUN) return (Math.floor(a / RUN) + 1) * RISE; const b = a - N * RUN; if (b < LAND) return N * RISE; const c = b - LAND; if (c < N * RUN) return (N - Math.floor(c / RUN)) * RISE; return 0; };
  const END = SZ0 + 2 * N * RUN + LAND + 1.5;
  let focusFn = null, lookY = null, mode = 'idle', yaw = 0.6, zoom = 1, drag = null, pinch = 0, raf = 0, last = performance.now(), z = 0, vy = 0, y = 0, air = false, jumpT = 0, crouchT = 0;
  const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size(); const ro = new ResizeObserver(size); ro.observe(el);
  el.addEventListener('pointerdown', e => { drag = e.clientX; }); el.addEventListener('wheel', e => { e.preventDefault(); zoom = Math.max(0.3, Math.min(2, zoom * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive: false });
  el.addEventListener('touchmove', e => { if (e.touches.length !== 2) return; const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (pinch) zoom = Math.max(0.3, Math.min(2, zoom * pinch / d)); pinch = d; }, { passive: true });
  el.addEventListener('touchend', () => { pinch = 0; });
  const pu = () => { drag = null; }, pm = e => { if (drag == null) return; yaw -= (e.clientX - drag) * 0.01; drag = e.clientX; }; addEventListener('pointerup', pu); addEventListener('pointermove', pm);
  function setWho(k) { if (!FOX[k] || k === who) return; if (who === 'noble' && NS) NS.reset();   /* s667b a drone in flight goes home when you switch fox */ const G0 = u.rig; if (G0 && G0.drawn && G0.draw) G0.draw(false, true); fox.visible = false; who = k; fox = FOX[k]; u = fox.userData; fox.visible = true; set(mode); }
  function set(m) { mode = m; u.legPose = m === 'crouch' || m === 'kneel' || m === 'sit' ? m : null; z = 0; y = 0; vy = 0; air = false;
    stairs.visible = m === 'stairs'; u.groundAt = m === 'stairs' ? (x, zz) => stairY(zz) : null;
    const G = u.rig; if (G && G.draw) { if (m === 'stance' && !G.drawn) G.draw(true, true); if (m !== 'stance' && G.drawn) G.draw(false, true); }
    if (m === 'jump') { jumpT = 0.25; crouchT = 0; } fox.position.set(0, 0, 0); fox.rotation.y = 0; }
  const D = { walk: 1.6, run: 6.2, stairs: 1.4 };
  function frame(t) { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - last) / 1000); last = t;
    let sp = D[mode] || 0; const G = u.rig; if (G && G.touch && mode === 'stance') G.touch();
    if (sp) { z += sp * dt; if (z > (mode === 'stairs' ? END : 7)) z = mode === 'stairs' ? 0 : -7; }
    if (mode === 'jump') { jumpT -= dt; if (!air && jumpT <= 0) { if (crouchT <= 0) { crouchT = 0.16; u.legPose = 'crouch'; } else { crouchT -= dt; if (crouchT <= 0.02) { u.legPose = null; air = true; vy = 7.5; } } }
      if (air) { vy -= 22 * dt; y += vy * dt; if (y <= 0) { y = 0; vy = 0; air = false; jumpT = 1.1; crouchT = 0; } } }
    const gy = mode === 'stairs' ? stairY(z) : 0; if (mode !== 'jump') y = damp(y, gy, 18, dt);
    if (mode === 'sit') y = 0.0;
    fox.position.set(0, y, z); kit.animFox(fox, dt, sp, air); if (who === 'noble' && NS) NS.tick(dt);
    const port = cam.aspect < 0.9, d = (port ? 7.2 : 5.6) * zoom, cy = y * 0.8 + (lookY ?? 1.4);
    if (focusFn) { const p = focusFn(); cam.position.set(p.x + Math.sin(yaw) * d, p.y + 0.15, p.z + Math.cos(yaw) * d); cam.lookAt(p); } else { cam.position.set(Math.sin(yaw) * d, cy + (mode === 'stairs' ? 1.6 : 0.5), z + Math.cos(yaw) * d); cam.lookAt(0, cy, z); }
    renderer.render(scene, cam); }
  raf = requestAnimationFrame(frame);
  return { throwShoe: (i = 0) => NS && NS.throw(i), set, setWho, get who() { return who; }, get mode() { return mode; }, turn(a) { yaw = a; }, zoom(v) { zoom = v; }, look(y) { lookY = y; }, focusHand(on, hi = 0) { focusFn = on ? () => { const H = fox.userData.P.hands[hi], p = new THREE.Vector3(), w = new THREE.Vector3(); for (const f of H.fingers) p.add((f.b || f.a).getWorldPosition(w)); return p.divideScalar(H.fingers.length || 1); } : null; }, get _fox() { return fox; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointerup', pu); removeEventListener('pointermove', pm); renderer.dispose(); } };
}
