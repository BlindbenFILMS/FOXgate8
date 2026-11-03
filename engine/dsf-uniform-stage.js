// DSF Uniform Workshop stage (s608): one fox in a uniform, or the whole 2D crew lined up.
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js';
import { castKit, loadCastRigs, CAST } from './cast.js?v=s339c';
import { uniformOutfit, dressUniform, CREW } from './dsf-uniforms.js';
export async function startUniformStage(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#201e1d');
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(4, 8, 5); scene.add(sun);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: true });
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, await loadCastRigs().catch(() => ({})));
  const WK = { THREE, M, toon };
  const plinth = () => { const g = new THREE.Group(); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 40), new THREE.MeshBasicMaterial({ color: '#2e2a28' })); p.position.y = -0.04; g.add(p);
    const r = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.66, 48), new THREE.MeshBasicMaterial({ color: '#ec3013', side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.y = 0.004; g.add(r); scene.add(g); return g; };
  let foxes = [], bases = [], yaw = 0.3, spin = 0, spinOn = false, drag = null, dragV = 0, raf = 0, last = performance.now(), lineup = false, H = 2;
  const clear = () => { foxes.forEach(f => scene.remove(f)); bases.forEach(b => scene.remove(b)); foxes = []; bases = []; };
  function one(who, U, w, x) { const o = uniformOutfit(U, w), base = CAST[who] ? who : 'player', look = CAST[base].look;
    const legC = w.kit === 'duty' ? U.duty.bodyLo : w.kit === 'constable' ? U.constable.lo : (w.cols || U[w.kit].cols)[2];
    const f = cast.make(base, { ...o, gear: 'none', legColor: legC, ...(w.fur ? { look: { ...look, fur: w.fur } } : {}) }); f.position.x = x; scene.add(f); dressUniform(WK, f, U, w); foxes.push(f);
    const bb = new THREE.Box3().setFromObject(f), sz = new THREE.Vector3(); bb.getSize(sz); H = Math.max(2, sz.y);
    const b = plinth(); b.position.x = x; bases.push(b); return f; }
  const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size(); const ro = new ResizeObserver(size); ro.observe(el);
  el.addEventListener('pointerdown', e => { drag = e.clientX; dragV = 0; });
  const up = () => { if (drag != null) spin = clamp(dragV * 0.6, -3, 3); drag = null; }, mv = e => { if (drag == null) return; const dx = e.clientX - drag; yaw += dx * 0.012; dragV = dx * 0.012 * 60; drag = e.clientX; };
  addEventListener('pointerup', up); addEventListener('pointermove', mv);
  function frame(t) { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (drag == null) { spin += ((spinOn ? 0.35 : 0) - spin) * Math.min(1, dt * 2); yaw += spin * dt; }
    for (const f of foxes) { f.rotation.y = yaw; kit.animFox(f, dt, 0, false); }
    const th = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)), wNeed = lineup ? foxes.length * 1.25 + 0.4 : 1.8, d = Math.max(H * 1.18 / (2 * th), wNeed / (2 * th * cam.aspect));
    cam.position.set(0, H * 0.56, d); cam.lookAt(0, H * 0.5, 0); renderer.render(scene, cam); }
  raf = requestAnimationFrame(frame);
  return {
    show(who, U, w) { clear(); lineup = false; H = 2; one(who, U, w, 0); },
    lineup(U) { clear(); lineup = true; H = 2; const n = CREW.length; CREW.forEach((c, i) => one('player', U, c, (i - (n - 1) / 2) * 1.25)); },
    view(k) { yaw = { front: 0, side: Math.PI / 2, back: Math.PI }[k] ?? yaw; spin = 0; }, spin(on) { spinOn = !!on; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('pointerup', up); removeEventListener('pointermove', mv); renderer.dispose(); el.innerHTML = ''; },
  };
}
