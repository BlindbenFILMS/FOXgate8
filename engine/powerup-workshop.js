// s208 Power Up Workshop scene: every power-up turning in a grid; the picked one sits big in front. Edits save to localStorage 'powerups.look' (engine/powerups.js).
import * as THREE from '../vendor/three/three.module.js';
import { makePowerup, POWERUPS, puSet, puReset } from './powerups.js?v=s209';
export async function startPowerupWorkshop(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); el.appendChild(renderer.domElement); renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x14161a); const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.1)); const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(3, 5, 4); scene.add(sun);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 40), new THREE.MeshPhongMaterial({ color: 0x23262b })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.6; scene.add(floor);
  const keys = Object.keys(POWERUPS); let sel = keys[0], grid = [], hero = null;
  const build = () => { for (const g of grid) scene.remove(g); grid = []; if (hero) scene.remove(hero);
    keys.forEach((k, i) => { const g = makePowerup(THREE, k); const c = i % 6, r = Math.floor(i / 6); g.position.set((c - 2.5) * 0.8, 1.15 - r * 0.85, -1.6); g.scale.multiplyScalar(0.7); g.rotation.x = 0.45; scene.add(g); grid.push(g); g.userData.k = k; });
    hero = makePowerup(THREE, sel); hero.position.set(0, 0.3, 0.3); hero.rotation.x = 0.35; hero.scale.multiplyScalar(1.25); scene.add(hero); };
  build();
  const resize = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; const port = w < h; cam.position.set(0, port ? 1.2 : 0.9, port ? 5.6 : 3.9); cam.lookAt(0, port ? 0.45 : 0.4, -0.4); cam.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  let raf = 0, last = performance.now(); const frame = t => { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - last) / 1000); last = t; for (const g of grid) { g.userData.pu.update(dt); const on = g.userData.k === sel; g.position.y += ((on ? 0.12 : 0) + (1.15 - Math.floor(keys.indexOf(g.userData.k) / 6) * 0.85) - g.position.y) * Math.min(1, dt * 8); } hero.userData.pu.update(dt); hero.position.y = 0.3 + Math.sin(t / 400) * 0.06; renderer.render(scene, cam); }; raf = requestAnimationFrame(frame);
  return { keys, info: POWERUPS, get sel() { return sel; }, pick(k) { sel = k; build(); }, look: k => ({ ...(hero && hero.userData.pu.kind === k ? hero.userData.pu.look : {}) }),
    set(k, part) { puSet(k, part); if (k === sel) hero.userData.pu.setLook(part); const g = grid.find(q => q.userData.k === k); if (g) { const s = part.size; g.userData.pu.setLook({ ...part, size: undefined }); if (s != null) g.scale.setScalar(0.7 * s); } if (part.size != null && k === sel) hero.scale.setScalar(1.25 * part.size); },
    reset() { puReset(); build(); }, destroy() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.innerHTML = ''; } };
}
