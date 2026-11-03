// Gem Workshop stage (s608): a gem lying in the world (grass patch, a little glow), before the player picks it up.
import * as THREE from '../vendor/three/three.module.js';
import { makeGradient } from '../village-game.js';
import { makeGem, tickGem } from './gems.js';
export function startGemStage(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#201e1d');
  const cam = new THREE.PerspectiveCamera(34, 1, 0.05, 50); cam.position.set(0, 1.0, 2.6); cam.lookAt(0, 0.35, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6b6460, 1.5)); const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(2, 5, 3); scene.add(sun);
  const grad = makeGradient(), cache = new Map(), toon = (c, x) => { const k = c + (x ? JSON.stringify(x) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...x })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  const M = (geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) { const o = new THREE.Mesh(geo, outlineMat); o.scale.setScalar(1 + outline * 2.5); m.add(o); } (parent || scene).add(m); return m; };
  // a small patch of ground with grass tufts and two pebbles: how a gem looks off the path
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.15, 0.12, 40), toon('#4d7a3a')); ground.position.y = -0.06; scene.add(ground);
  for (let i = 0; i < 26; i++) { const a = i * 2.39, r = 0.35 + (i % 7) * 0.1, t = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14 + (i % 3) * 0.05, 4), toon(i % 2 ? '#6b9a45' : '#5a8a3a')); t.position.set(Math.cos(a) * r, 0.06, Math.sin(a) * r); t.rotation.z = (i % 5 - 2) * 0.12; scene.add(t); }
  M(new THREE.DodecahedronGeometry(0.07, 0), toon('#8a8380'), -0.42, 0.03, 0.22); M(new THREE.DodecahedronGeometry(0.05, 0), toon('#a39c97'), 0.38, 0.02, -0.18);
  let gem = null, raf = 0, last = performance.now();
  const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.position.z = cam.aspect < 1 ? 3.6 : 2.6; cam.updateProjectionMatrix(); };
  size(); const ro = new ResizeObserver(size); ro.observe(el);
  function frame(t) { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - last) / 1000); last = t; if (gem) tickGem(gem, dt); renderer.render(scene, cam); }
  raf = requestAnimationFrame(frame);
  return {
    show(g) { if (gem) scene.remove(gem); gem = g ? makeGem({ THREE, toon, M }, g, g.kind === 'world' ? 0.8 : 0.75) : null; if (gem) { gem.position.y = 0.42; scene.add(gem); } },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.innerHTML = ''; },
  };
}
