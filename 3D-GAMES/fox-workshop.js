import * as THREE from './vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from './village-game.js';
import { crestTex, emblemTex } from './meru-game.js';
import { foxKit, DEFAULT_LOOK, LOOK_KEY, loadLook, PLAYER_MALE, PLAYER_FEMALE, KING_MIGHT, HOPE_LOOK } from './fox-kit.js';

export const OUTFITS = {
  playerFemale: { label: 'PLAYER FEMALE', outfit: 'armor', look: 'female', torso: ["#ffffff","#e7edf4","#6b7d93"], crest: '8', bow: false, eyes: ['#38bdf8', '#38bdf8'] },
  playerMale: { label: 'PLAYER MALE', outfit: 'armor', look: 'male', torso: ["#ffffff","#e7edf4","#6b7d93"], crest: '8', bow: false, eyes: ['#38bdf8', '#38bdf8'] },
  player: { label: 'Your fox', outfit: 'armor', look: 'male', torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', bow: false, eyes: ['#38bdf8', '#38bdf8'] },
  noble: { label: 'Noble', outfit: 'armor', look: 'male', torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', legColor: '#38bdf8', eyes: ['#dc2626', '#dc2626'] },
  hope: { label: 'Hope', outfit: 'armor', look: 'hope', torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', bow: true, glasses: 'sun', legColor: '#38bdf8', eyes: ['#f472b6', '#2dd4bf'] },
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
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#cfe0e6');
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
  // KYOTO DOJO backdrop (same set as the Human Workshop): plank floor, shoji wall, posts, beams and the tiled roof
  { const CT = (w2, h2, fn) => { const c = document.createElement('canvas'); c.width = w2; c.height = h2; fn(c.getContext('2d'), w2, h2); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }, DOJO = new THREE.Group(); DOJO.position.set(-2, -0.12, 0.6); scene.add(DOJO);
  const plankT = CT(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#c9a06a', '#bf955f', '#d2aa74', '#b88d58'][i % 4]; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(60,36,18,0.35)'; g.fillRect(0, i * 32, w, 2); g.fillRect((i * 97) % w, i * 32, 2, 32); } }); plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping; plankT.repeat.set(3, 3);
  const shojiT = CT(256, 256, (g, w, h) => { g.fillStyle = '#f6f1e6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5a3a22'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); g.lineWidth = 3; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); } for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, i * h / 6); g.lineTo(w, i * h / 6); g.stroke(); } }); shojiT.wrapS = THREE.RepeatWrapping; shojiT.repeat.set(6, 1);
  const ink = toon('#201e1d'), wood = toon('#5a3a22'), roofM = toon('#3a3836');
  const fl = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 7), new THREE.MeshToonMaterial({ map: plankT, gradientMap: grad })); fl.position.set(2, -0.15, -0.5); fl.receiveShadow = true; DOJO.add(fl);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 3), new THREE.MeshToonMaterial({ map: shojiT, gradientMap: grad })); wall.position.set(2, 1.5, -3.9); DOJO.add(wall);
    for (const x of [-4, 0, 4, 8]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.6, 0.22), wood); p.position.set(x, 1.8, -3.9); DOJO.add(p); if (x === -4 || x === 8) { const p2 = p.clone(); p2.position.z = 2.9; DOJO.add(p2); } }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.3, 0.3), wood); beam.position.set(2, 3.5, 2.9); DOJO.add(beam); const beam2 = beam.clone(); beam2.position.z = -3.9; DOJO.add(beam2);
    for (const s of [0, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(13, 0.18, 4.4), roofM); r.position.set(2, 4.1 - s * 0.0, s ? 1.8 : -2.4); r.rotation.x = s ? 0.32 : -0.32; DOJO.add(r); }
  }
  const ped = M(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 64), toon('#f3f2f2'), 0, -0.06, 0, null, 0.02, 1.1);
  M(new THREE.CylinderGeometry(1.12, 1.12, 0.03, 64), toon('#1d4ed8'), 0, -0.005, 0, null, 0);
  const emb = emblemTex(); const disc = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40), new THREE.MeshToonMaterial({ map: emb, gradientMap: grad, transparent: true })); disc.rotation.x = -Math.PI / 2; disc.position.set(0, 0.002, 0.62); scene.add(disc);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 48), new THREE.ShadowMaterial({ opacity: 0.12 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.12; floor.receiveShadow = true; scene.add(floor);

  const St = { gear: 'both', look: loadLook(), outfit: 'playerMale', mood: 'neutral', talking: false, yaw: 0.35, pitch: 0.12, dist: 5.2, focus: 'full', spin: false, t: 0, dirty: true, peek: false };
  let fox = null;
  function rebuild() {
    if (fox) { scene.remove(fox); fox.traverse(o => { if (o.material && o.material.map && o.material.map.isCanvasTexture && o.material.transparent && o.material.alphaTest) { o.material.map.dispose(); } }); }
    kit.setLook(St.look); const o = OUTFITS[St.outfit];
    const base = o.look === 'female' ? PLAYER_FEMALE : o.look === 'hope' ? HOPE_LOOK : o.look === 'king' ? KING_MIGHT : PLAYER_MALE; fox = kit.makeFox({ ...o, look: St.edited ? St.look : base, mood: St.mood, gear: o.outfit === 'armor' ? St.gear : 'none' }); fox.position.set(0, 0, 0); fox.userData.mood = St.mood; St.dirty = false;
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
    const u = fox.userData; u.mood = St.mood; u.talkStyle = St.talkStyle; if (!u.say) u.talking = St.talking; else if (!u.talking && !u.say) St.talking = false;
    camera.position.set(Math.sin(St.yaw) * Math.cos(St.pitch) * camD, camT.y + Math.sin(St.pitch) * camD, Math.cos(St.yaw) * Math.cos(St.pitch) * camD);
    u.lookAt = St.peek ? look.copy(camera.position) : null;
    kit.animFox(fox, dt, 0);
    const headY = 1.62 * (St.look.bodyScale || 1);
    camT.y = damp(camT.y, St.focus === 'face' ? headY * 1.12 : 0.95, 6, dt); camD = damp(camD, St.focus === 'face' ? Math.min(St.dist, 2.6) : St.dist, 6, dt);
    camera.lookAt(0, camT.y, 0);
    renderer.render(scene, camera);
  }
  rebuild(); frame();
  return {
    setLook(l) { St.look = { ...DEFAULT_LOOK, ...l }; St.edited = true; St.dirty = true; },
    setOutfit(k) { St.outfit = k; St.edited = false; St.dirty = true; },
    setMood(m) { St.mood = m; },
    setGear(gr) { St.gear = gr; St.dirty = true; },
    setTalking(v) { St.talking = v; if (!v && fox) fox.userData.say = null; },
    setTalkStyle(ts) { St.talkStyle = ts; }, say(text) { St.talking = true; if (fox) fox.userData.say = { text, t: 0, shown: 0 }; }, speech() { const sy = fox && fox.userData.say; return sy ? { text: sy.text, shown: sy.shown || 0 } : null; },
    setFocus(f) { St.focus = f; if (f === 'face') { St.dist = 2.1; St.pitch = 0.05; } else { St.dist = 5.2; St.pitch = 0.12; } },
    setSpin(v) { St.spin = v; }, setPeek(v) { St.peek = v; },
    view(name) { St.yaw = { front: 0, three: 0.6, side: Math.PI / 2, back: Math.PI }[name] ?? 0; },
    hop() { fox.userData.hop = 1; },
    save(l) { localStorage.setItem(LOOK_KEY, JSON.stringify(l)); },
    snapshot() { return renderer.domElement.toDataURL('image/png'); },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.remove(); },
  };
}
