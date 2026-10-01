import * as THREE from './vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from './village-game.js';
import { crestTex, emblemTex } from './meru-game.js';
import { foxKit, DEFAULT_LOOK, LOOK_KEY, loadLook, PLAYER_MALE, PLAYER_FEMALE, KING_MIGHT } from './fox-kit.js';

export const OUTFITS = {
  playerFemale: { label: 'PLAYER FEMALE', outfit: 'armor', look: 'female', torso: ["#ffffff","#e7edf4","#6b7d93"], crest: '8', bow: false, eyes: ["#f472b6","#2dd4bf"] },
  playerMale: { label: 'PLAYER MALE', outfit: 'armor', look: 'male', torso: ["#ffffff","#e7edf4","#6b7d93"], crest: '8', bow: false, eyes: ["#f472b6","#2dd4bf"] },
  player: { label: 'Your fox', outfit: 'armor', look: 'male', torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', bow: false, eyes: ['#f472b6', '#2dd4bf'] },
  hope: { label: 'Hope', outfit: 'dress', look: 'female', torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', glasses: true, eyes: ['#f472b6', '#2dd4bf'] },
  grand: { label: 'Grand', outfit: 'coat', look: 'male', torso: ['#a78bfa', '#5b21b6', '#2e1065'], crest: 'G', eyes: ['#a78bfa', '#a78bfa'] },
  ulric: { label: 'Ulric', outfit: 'robe', look: 'male', torso: ['#fdba74', '#b45309', '#7c2d12'], crest: 'U', eyes: ['#65a30d', '#65a30d'] },
  lucius: { label: 'Lucius', outfit: 'suit', look: 'male', torso: ['#fca5a5', '#991b1b', '#450a0a'], crest: 'L', eyes: ['#eab308', '#eab308'] },
  jamos: { label: 'Jamos', outfit: 'coat', look: 'male', torso: ['#93c5fd', '#1e3a8a', '#0f172a'], crest: 'J', eyes: ['#16a34a', '#16a34a'] },
  king: { label: 'King Might', outfit: 'armor', look: 'king', torso: ['#7a808c', '#474d59', '#23272f'], crest: 'M', crown: true, eyes: ['#e6b45a', '#e6b45a'] },
};
export { DEFAULT_LOOK, LOOK_KEY, loadLook };

export async function createWorkshop({ container, onPick = () => {} }) {
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;cursor:grab';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#eae9e9');
  const camera = new THREE.PerspectiveCamera(30, W() / H(), 0.05, 100);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b0a8, 1.1));
  const key = new THREE.DirectionalLight(0xfff4e6, 2.4); key.position.set(3, 6, 4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -2, right: 2, top: 3, bottom: -1, near: 1, far: 20 }); key.shadow.bias = -0.0005; scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd4ff, 0.8); rim.position.set(-4, 3, -3); scene.add(rim);
  const ped = M(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 64), toon('#f3f2f2'), 0, -0.06, 0, null, 0.02, 1.1);
  M(new THREE.CylinderGeometry(1.12, 1.12, 0.03, 64), toon('#ec3013'), 0, -0.005, 0, null, 0);
  const emb = emblemTex(); const disc = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40), new THREE.MeshToonMaterial({ map: emb, gradientMap: grad, transparent: true })); disc.rotation.x = -Math.PI / 2; disc.position.set(0, 0.002, 0.62); scene.add(disc);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 48), new THREE.ShadowMaterial({ opacity: 0.12 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.12; floor.receiveShadow = true; scene.add(floor);

  const St = { gear: 'both', look: loadLook(), outfit: 'playerMale', mood: 'neutral', talking: false, yaw: 0.35, pitch: 0.12, dist: 5.2, focus: 'full', spin: false, t: 0, dirty: true, peek: false };
  let fox = null;
  function rebuild() {
    if (fox) { scene.remove(fox); fox.traverse(o => { if (o.material && o.material.map && o.material.map.isCanvasTexture && o.material.transparent && o.material.alphaTest) { o.material.map.dispose(); } }); }
    kit.setLook(St.look); const o = OUTFITS[St.outfit];
    const base = o.look === 'female' ? PLAYER_FEMALE : o.look === 'king' ? KING_MIGHT : PLAYER_MALE; fox = kit.makeFox({ ...o, look: St.edited ? St.look : base, mood: St.mood, gear: o.outfit === 'armor' ? St.gear : 'none' }); fox.position.set(0, 0, 0); fox.userData.mood = St.mood; St.dirty = false;
  }
  const ptr = { down: false, x: 0, y: 0 };
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { ptr.down = true; ptr.x = e.clientX; ptr.y = e.clientY; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; });
  el.addEventListener('pointermove', e => { if (!ptr.down) return; St.yaw -= (e.clientX - ptr.x) * 0.008; St.pitch = clamp(St.pitch + (e.clientY - ptr.y) * 0.005, -0.3, 1.0); ptr.x = e.clientX; ptr.y = e.clientY; });
  const up = () => { ptr.down = false; el.style.cursor = 'grab'; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', e => { St.dist = clamp(St.dist + e.deltaY * 0.004, 1.4, 9); e.preventDefault(); }, { passive: false });
  const ro = new ResizeObserver(() => requestAnimationFrame(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); })); ro.observe(container);

  const clock = new THREE.Clock(); let raf = 0; const look = new THREE.Vector3(), camT = new THREE.Vector3(0, 1.0, 0); let camD = 5.2;
  function frame() {
    raf = requestAnimationFrame(frame); const dt = Math.min(clock.getDelta(), 0.05); St.t += dt;
    if (St.dirty) rebuild();
    if (St.spin && !ptr.down) St.yaw += dt * 0.5;
    const u = fox.userData; u.mood = St.mood; u.talking = St.talking;
    camera.position.set(Math.sin(St.yaw) * Math.cos(St.pitch) * camD, camT.y + Math.sin(St.pitch) * camD, Math.cos(St.yaw) * Math.cos(St.pitch) * camD);
    u.lookAt = St.peek ? look.copy(camera.position) : null;
    kit.animFox(fox, dt, 0);
    const headY = 1.62 * (St.look.bodyScale || 1);
    camT.y = damp(camT.y, St.focus === 'face' ? headY : 0.95, 6, dt); camD = damp(camD, St.focus === 'face' ? Math.min(St.dist, 2.1) : St.dist, 6, dt);
    camera.lookAt(0, camT.y, 0);
    renderer.render(scene, camera);
  }
  rebuild(); frame();
  return {
    setLook(l) { St.look = { ...DEFAULT_LOOK, ...l }; St.edited = true; St.dirty = true; },
    setOutfit(k) { St.outfit = k; St.edited = false; St.dirty = true; },
    setMood(m) { St.mood = m; },
    setGear(gr) { St.gear = gr; St.dirty = true; },
    setTalking(v) { St.talking = v; },
    setFocus(f) { St.focus = f; if (f === 'face') { St.dist = 2.1; St.pitch = 0.05; } else { St.dist = 5.2; St.pitch = 0.12; } },
    setSpin(v) { St.spin = v; }, setPeek(v) { St.peek = v; },
    view(name) { St.yaw = { front: 0, three: 0.6, side: Math.PI / 2, back: Math.PI }[name] ?? 0; },
    hop() { fox.userData.hop = 1; },
    save(l) { localStorage.setItem(LOOK_KEY, JSON.stringify(l)); },
    snapshot() { return renderer.domElement.toDataURL('image/png'); },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.remove(); },
  };
}
