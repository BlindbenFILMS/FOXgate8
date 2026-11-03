// s186 Fighter Gear Lab: the walk-around player with the Fox Fighters sheath + holster; try draw / strike / shoot.
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js';
import { castKit, loadCastRigs } from './cast.js?v=s339c';
import { SFX, SFX_EVENTS } from './fighter-sfx.js?v=s695c';
import { fighterSuper } from './fighter-super.js?v=s342n';
import { foxShield } from './fox-shield.js?v=s205f';
import { battleMusic } from './battle-music.js?v=s267';
import { superFx, SUPER_FX } from './super-fx.js?v=s341';
export async function startGearLab(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(Math.min(2, devicePixelRatio)); el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#000000');   /* s222 Ben: black stage */
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(4, 8, 5); scene.add(sun);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 40), new THREE.MeshBasicMaterial({ color: '#1a1918' })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: true });
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, await loadCastRigs().catch(() => ({})));
  const fox = cast.make('player', { holster: true }); scene.add(fox); const G = fox.userData.rig;
  const SHD = foxShield({ THREE }, fox, { idleVis: 1 });
  const SFXV = superFx({ THREE, scene, make: k => cast.make(k) });   // s339 graphics for supers 04-15
  const fire = mv => { if (!G) return; if (mv.key === 'beam') { const f = G.superMove('beam'); const to = f.clone(); to.x += Math.sin(fox.rotation.y) * 18; to.z += Math.cos(fox.rotation.y) * 18; G.beamFx(f, to); } else if (mv.key === 'whirl') G.superMove('whirl'); else SFXV.play(mv.key, fox, G); };
  const SUP = fighterSuper({ practice: true, onFire: fire }), held = new Set(); const kd = e => held.add(e.code), ku = e => held.delete(e.code); addEventListener('keydown', kd); addEventListener('keyup', ku);
  let yaw = Math.PI * 0.85, walk = false, slow = 1, frozen = false, raf = 0, last = performance.now(), drag = null;
  const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size(); const ro = new ResizeObserver(size); ro.observe(el);
  el.addEventListener('pointerdown', e => { drag = e.clientX; }); addEventListener('pointerup', () => { drag = null; }); addEventListener('pointermove', e => { if (drag == null) return; yaw -= (e.clientX - drag) * 0.01; drag = e.clientX; });
  const place = () => { const port = cam.aspect < 1, d = port ? 7.2 : 4.8; cam.position.set(Math.sin(yaw) * d, 1.9, Math.cos(yaw) * d); cam.lookAt(0, 1.2, 0); };
  function frame(t) { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - last) / 1000); last = t; place();
    SUP.update(dt); if (!frozen) { SHD.update(dt * slow * SUP.timeScale()); SFXV.tick(dt * slow * SUP.timeScale()); } if (SUP.frozen) SUP.stick((held.has('KeyD') ? 1 : 0) - (held.has('KeyA') ? 1 : 0), (held.has('KeyW') ? 1 : 0) - (held.has('KeyS') ? 1 : 0));
    if (!frozen) kit.animFox(fox, dt * slow * SUP.timeScale(), walk ? 2.2 : 0, false); renderer.render(scene, cam); }
  // test hook: freeze the clock and step it by hand (deterministic poses for screenshots)
  const step = sec => { frozen = true; for (let i = 0; i < Math.round(sec * 60); i++) { kit.animFox(fox, 1 / 60, walk ? 2.2 : 0, false); SHD.update(1 / 60); SFXV.tick(1 / 60); } place(); renderer.render(scene, cam); };
  raf = requestAnimationFrame(frame);
  return { draw: () => G && G.toggle(), strike: () => G && G.strike(), charge: () => G && G.charge(), fists: () => G && G.setFists(!G.fists), release: () => G && G.release(), shoot: () => { if (!G) return; const f = G.shoot(); G.bolt && G.bolt(f, null, false); }, walk: () => (walk = !walk), view: k => { yaw = { back: Math.PI, side: Math.PI / 2, front: 0, three: Math.PI * 0.27 }[k] ?? yaw; }, sfx: SFX, sfxEvents: SFX_EVENTS, music: battleMusic(), shield: SHD, hurtMe: () => { const a = yaw + (Math.random() - 0.5) * 1.2; G && G.hurt(Math.sin(a) * 5, Math.cos(a) * 5, 1); }, hitShield: (dmg = 12) => { const a = yaw + (Math.random() - 0.5) * 2.2; fox.updateMatrixWorld(true); return SHD.absorb(dmg, Math.sin(a) * 5, Math.cos(a) * 5, 0.6 + Math.random() * 1.6); }, superTap: () => SUP.tap(), superFx: k => SFXV.play(k, fox, G), superFxList: SUPER_FX, superFrozen: () => false, superPick: () => SUP.openGrid(), superReset: () => SUP.resetCooldown(), superStick: (x, y) => SUP.stick(x, y),
    superBtn: n => { const mv = SUP.btn(n); if (!mv || !G) return null; if (mv.key === 'beam') { const f = G.superMove('beam'); const to = f.clone(); to.x += Math.sin(fox.rotation.y) * 18; to.z += Math.cos(fox.rotation.y) * 18; G.beamFx(f, to); } else G.superMove(mv.key); return mv.name; },
    superDemo: k => { if (!G) return; if (k === 'beam') { const f = G.superMove('beam'); const to = f.clone(); to.x += Math.sin(fox.rotation.y) * 18; to.z += Math.cos(fox.rotation.y) * 18; G.beamFx(f, to); } else G.superMove(k); }, state: () => ({ drawn: !!(G && G.drawn), fists: !!(G && G.fists), walk, slow }), slow: () => (slow = slow < 1 ? 1 : 0.25), step, run: () => { frozen = false; }, destroy() { battleMusic().stop(0.1); SUP.destroy(); removeEventListener('keydown', kd); removeEventListener('keyup', ku); cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); } };
}
