// 8 GATES — JIDDA · SWIMSUIT trials [new: jidda swim] — pick a place from JIB's sheet, each its own short challenge.
// BUILT: CALM LAGOON [jSwimLagoon] (shallows + reef: pearls in clams, jellyfish) · THE BREAK [jSwimBreak] (buoy race through the sets, then BODY-SURF in)
// · SHIPWRECK DIVE [jSwimWreck] (breath puzzle: levers inside the hull, air pockets, rescue the pup, escape the shark).
// NEXT: UNDERWATER CAVE · LAZY RIVER · HARBOUR CANALS. Buttons (Game HUD vehicle="swim"): 1 GRAB · 2 KICK · 3 DIVE. Swimmer = engine/swim-kit.js.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, pick, clamp, damp, makeGradient, glowTexture, Ambience, smooth } from '../../village-game.js';
import { crestTex, canvasTex } from '../../meru-game.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../../fox-kit.js';
import { castKit } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { swimKit, SWIM } from '../../engine/swim-kit.js';

export const PLACES = [
  { id: 'lagoon', name: 'CALM LAGOON', room: 'jSwimLagoon', built: true, target: 150, goal: 'Ten pearls off the reef', line: 'Wade out of the shallows, dive to the clams on the reef and take the pearls while they are open. Jellyfish drift about: splash them off or swim round.' },
  { id: 'break', name: 'THE BREAK', room: 'jSwimBreak', built: true, target: 140, goal: 'Six buoys, then body-surf in', line: 'Swim the buoys in order out through the sets. Dive under the white. After buoy six, catch a wave and body-surf it to the sand.' },
  { id: 'wreck', name: 'SHIPWRECK DIVE', room: 'jSwimWreck', built: true, target: 180, goal: 'Rescue the pup from the wreck', line: 'A pup is stuck in the cabin of the old wreck. Pull the three levers inside to open the gate, breathe at the air pockets, bring her back to the boat. Mind the shark.' },
  { id: 'cave', name: 'UNDERWATER CAVE', room: 'jSwimCave', built: false, goal: 'Coming next' },
  { id: 'lazy', name: 'LAZY RIVER', room: 'jSwimLazy', built: false, goal: 'Coming next' },
  { id: 'canals', name: 'HARBOUR CANALS', room: 'jSwimCanals', built: false, goal: 'Coming next' }];
const sstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, k) => a + (b - a) * k;

export async function createSwimTrials({ container, onState = () => {} }) {
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CHh = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.5 : 2)); renderer.setSize(CW(), CHh());
  renderer.shadowMap.enabled = !touch; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xbfe6f2); scene.fog = new THREE.Fog(0xbfe6f2, 150, 650);
  const camera = new THREE.PerspectiveCamera(58, CW() / CHh(), 0.1, 2400);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  let WORLD = null;
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = !touch; m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || WORLD || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp }), cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }), SK = swimKit({ THREE, M, toon, kit });
  const audio = new Ambience();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x5f9fb4, 1.05));
  const sun = new THREE.DirectionalLight(0xfff2da, 2.0); sun.castShadow = !touch; if (!touch) { sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 80 }); sun.shadow.bias = -0.0005; } scene.add(sun, sun.target);
  const ink = toon('#201e1d'), white = toon('#f3f2f2'), red = toon('#ec3013'), wood = toon('#b58a5a'), yel = toon('#ffd23a'), brass = toon('#d9a64a');

  // ---------- FX + signs ----------
  const SPN = touch ? 60 : 110, sprays = []; let spI = 0;
  for (let i = 0; i < SPN; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0 })); m.visible = false; scene.add(m); sprays.push({ m, v: V3(), life: 0, max: 1, s: 1, g: 9 }); }
  function spray(p, n, spd, size = 1, life = 0.9, col = 0xffffff, g = 9) { for (let k = 0; k < n; k++) { const s = sprays[spI = (spI + 1) % SPN]; s.m.position.copy(p); s.m.position.x += rr(-0.4, 0.4); s.m.position.z += rr(-0.4, 0.4); s.v.set(rr(-1, 1) * spd * 0.5, rr(0.5, 1.2) * spd, rr(-1, 1) * spd * 0.5); s.life = s.max = life * rr(0.7, 1.2); s.s = size * rr(0.7, 1.3); s.g = g; s.m.material.color.setHex(col); s.m.visible = true; } }
  const bubbles = (p, n = 3) => spray(p, n, 0.6, 0.35, 1.2, 0xdff6ff, -2.5);
  function fxStep(dt) { for (const s of sprays) { if (s.life <= 0) continue; s.life -= dt; if (s.life <= 0) { s.m.visible = false; continue; } s.v.y -= s.g * dt; s.m.position.addScaledVector(s.v, dt); const u = 1 - s.life / s.max; s.m.material.opacity = 0.85 * (1 - u); s.m.scale.setScalar(s.s * (0.6 + u * (s.g < 0 ? 0.4 : 1.4))); } }
  const signTex = (txt, bg, fg) => canvasTex(256, 96, g => { g.fillStyle = bg; g.fillRect(0, 0, 256, 96); g.strokeStyle = '#201e1d'; g.lineWidth = 8; g.strokeRect(4, 4, 248, 88); g.fillStyle = fg; let fs = 52; g.font = '900 ' + fs + 'px Archivo, sans-serif'; const tw = g.measureText(txt).width; if (tw > 220) { fs = Math.floor(fs * 220 / tw); g.font = '900 ' + fs + 'px Archivo, sans-serif'; } g.textBaseline = 'middle'; g.fillText(txt, 18, 52); });
  const STX = {}; const stx = (t, bg = '#ffd23a', fg = '#201e1d') => STX[t + bg] || (STX[t + bg] = signTex(t, bg, fg));
  const bangTex = canvasTex(64, 64, g => { g.fillStyle = '#ec3013'; g.fillRect(4, 4, 56, 56); g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.strokeRect(6, 6, 52, 52); g.fillStyle = '#fff'; g.font = '900 46px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', 32, 35); });
  const signs = [];
  function spriteSign(x, y, z, a, b, blink, w = 3.4) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: a, transparent: true, depthWrite: false })); sp.scale.set(w, w * 0.375, 1); sp.position.set(x, y, z); WORLD.add(sp); const s = { sp, a, b, blink }; signs.push(s); return s; }
  function postSign(x, y, z, a, b, blink, w) { M(new THREE.CylinderGeometry(0.08, 0.08, 3, 6), ink, x, y + 1.5, z, null, 0); return spriteSign(x, y + 3.6, z, a, b, blink, w); }

  // ---------- pickups: the 8 TOKENS + coins ----------
  const tokTex = canvasTex(128, 128, g => { g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#a8792e'; g.stroke(); g.fillStyle = '#201e1d'; g.font = '900 78px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 64, 68); });
  const tokMat = new THREE.MeshToonMaterial({ map: tokTex, gradientMap: grad, emissive: new THREE.Color('#6a4500'), emissiveIntensity: 0.45 }), tokEdge = toon('#c8922e');
  const tokGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.18, 20), coinGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 14);
  const items = [];
  function addItem(kind, x, y, z) { const g = new THREE.Group(), c = new THREE.Mesh(kind === 'tok' ? tokGeo : coinGeo, [tokEdge, tokMat, tokMat]); c.rotation.x = Math.PI / 2; if (kind === 'tok') addOutline(c, 0.05); g.add(c); g.position.set(x, y, z); WORLD.add(g); items.push({ kind, g, x, y, z, on: true }); }

  // ---------- swimmer + host ----------
  const ben = SK.make(cast.make('player', { gear: 'none' })); scene.add(ben.root);
  const jib = kit.makeFox({ key: 'jib', torso: ['#fff4e2', '#38bdf8', '#1e6f9a'], outfit: 'vest', look: { ...PLAYER_MALE, fur: '#e8b277', furDark: '#8a5a2b', tailMid: '#f3e2c4', tailTip: '#ffffff', armorAccent: '#38bdf8' }, mood: 'neutral' }); jib.scale.setScalar(1.3); scene.add(jib);

  // ---------- STATE ----------
  const G = { phase: 'ready', board: true, place: 'lagoon', PL: null, t: 0, pts: 0, tok: 0, coins: 0, banner: '', bannerT: 0, radio: '', radioWho: 'JIB', radioT: 0, flash: null, flashT: 0, flashId: 0, done: null, count: 0, prompt: null, stings: 0, pen: 0 };
  const say = (s, t = 2.4) => { G.banner = s; G.bannerT = t; };
  const radio = (s, who = 'JIB', t = 6) => { G.radio = s; G.radioWho = who; G.radioT = t; };
  const flash = (txt, col = '#ffd23a') => { G.flash = { txt, col, id: ++G.flashId }; G.flashT = 1.6; };
  const award = (name, v, col) => { G.pts += v; flash(name + '  +' + v, col); audio.tone(880 + Math.min(900, v), 0.12, 0.04, 'triangle', 1.4); return v; };
  const placeDef = () => PLACES.find(p => p.id === G.place);

  // ---------- WATER (a grid that follows you, see-through) + far sea + seabed ----------
  let TT = 0;
  const chop = (x, z, t) => 0.1 * Math.sin(x * 0.21 + t * 1.3) + 0.07 * Math.sin(z * 0.27 - t * 1.1) + 0.04 * Math.sin((x + z) * 0.5 + t * 2.1);
  const bands = [];
  const bandH = (b, z) => { const d = z - b.z; if (b.kind === 'swell') return b.A * Math.exp(-((d / 4.4) ** 2)); return b.A * (0.75 * Math.exp(-((d / 2.2) ** 2)) + (d > 0 ? 0.3 * Math.exp(-((d / 7) ** 2)) : 0)); };
  const surfAt = (x, z) => { let y = chop(x, z, TT) * (G.PL ? G.PL.chopK : 1); for (const b of bands) { const d = z - b.z; if (d > -12 && d < 18) y += bandH(b, z); } return y; };
  const WX = touch ? 34 : 52, WZ = touch ? 48 : 72, wGeo = new THREE.PlaneGeometry(130, 180, WX, WZ); wGeo.rotateX(-Math.PI / 2); wGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(wGeo.attributes.position.count * 3), 3));
  const wBase = Float32Array.from(wGeo.attributes.position.array);
  const water = new THREE.Mesh(wGeo, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad, transparent: true, opacity: 0.62, depthWrite: false, side: THREE.DoubleSide })); water.frustumCulled = false; water.renderOrder = 2; scene.add(water);
  const farSea = new THREE.Mesh(new THREE.RingGeometry(64, 3000, 48, 1), toon('#0c6a93')); farSea.rotation.x = -Math.PI / 2; farSea.position.y = -0.12; scene.add(farSea);
  const wCol = { a: new THREE.Color('#2fb8c8'), deep: new THREE.Color('#0c6a93'), foam: new THREE.Color('#f4fbfb'), glow: new THREE.Color('#86e6df') }, tc = new THREE.Color();
  function waterStep() { const cx = Math.round(ben.x / 4) * 4, cz = Math.round((ben.z + 30) / 4) * 4, P = wGeo.attributes.position.array, C = wGeo.attributes.color.array, PL = G.PL;
    for (let i = 0; i < P.length; i += 3) { const x = wBase[i] + cx, z = wBase[i + 2] + cz; let y = chop(x, z, TT) * PL.chopK, sw = 0, fm = 0; for (const b of bands) { const d = z - b.z; if (d < -12 || d > 18) continue; const h = bandH(b, z); y += h; if (b.kind === 'swell') sw = Math.max(sw, h / 2.3); else fm = Math.max(fm, (d > -2.6 && d < 9 ? 1 - Math.max(0, d) / 9 : 0) * Math.min(1, b.A * 1.2)); }
      P[i] = x; P[i + 1] = y; P[i + 2] = z; const dep = PL.floor(x, z); tc.copy(wCol.a).lerp(wCol.deep, sstep(-1, -5, dep) * 0.6).lerp(wCol.glow, Math.min(1, sw)); if (fm > 0) tc.lerp(wCol.foam, Math.min(1, fm * (0.75 + 0.25 * Math.sin(x * 0.9 + z * 1.7 + TT * 3)))); if (dep > -0.15) tc.lerp(wCol.foam, 0.25); C[i] = tc.r; C[i + 1] = tc.g; C[i + 2] = tc.b; }
    wGeo.attributes.position.needsUpdate = true; wGeo.attributes.color.needsUpdate = true; farSea.position.x = cx; farSea.position.z = cz; }
  function seabed(PL, cx, cz, size = 320, look = {}) { const n = touch ? 70 : 100, g = new THREE.PlaneGeometry(size, size, n, n); g.rotateX(-Math.PI / 2); g.translate(cx, 0, cz); const p = g.attributes.position, col = new Float32Array(p.count * 3), sand = new THREE.Color(look.sand || '#ead7a4'), mid = new THREE.Color(look.mid || '#cdb889'), deep = new THREE.Color(look.deep || '#6f9e8e'), dry = new THREE.Color('#f0e0b0');
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = PL.floor(x, z); p.setY(i, y); tc.copy(y > 0 ? dry : sand).lerp(mid, sstep(-0.6, -1.8, y)).lerp(deep, sstep(-1.8, -4, y)); const n2 = 0.04 * Math.sin(x * 1.3) * Math.sin(z * 1.1); col[i * 3] = tc.r + n2; col[i * 3 + 1] = tc.g + n2; col[i * 3 + 2] = tc.b + n2; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad })); m.receiveShadow = !touch; WORLD.add(m); return m; }
  const palm = (x, z, y0, h = 9) => { const g = new THREE.Group(); g.position.set(x, y0, z); g.rotation.z = rr(-0.18, 0.18); WORLD.add(g); for (let k = 0; k < 5; k++) M(new THREE.CylinderGeometry(0.32 - k * 0.03, 0.36 - k * 0.03, h / 5, 7), toon('#8a6238'), Math.sin(k * 0.4) * 0.3, h / 10 + k * h / 5, 0, g, 0.03); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28, lf = M(new THREE.ConeGeometry(0.7, 5, 4), toon(k % 2 ? '#3f8f3a' : '#5ec97e'), Math.cos(a) * 2, h - 0.6, Math.sin(a) * 2, g, 0.03); lf.scale.set(1, 1, 0.35); lf.rotation.order = 'YXZ'; lf.rotation.set(0, -a, -1.5); } };
  // fish schools (instanced), for life under the surface
  function fishSchool(cx, cz, y, n = 18, col = '#ffd23a', r = 5) { const im = new THREE.InstancedMesh(new THREE.ConeGeometry(0.14, 0.5, 5), toon(col), n); im.frustumCulled = false; WORLD.add(im); const f = { im, cx, cz, y, n, r, ph: Array.from({ length: n }, () => [rr(0, 6.28), rr(0.6, 1), rr(-0.4, 0.4)]), scare: 0 }; fishes.push(f); return f; }
  const fishes = [], dm = new THREE.Object3D();
  function fishStep(dt) { for (const f of fishes) { f.scare = Math.max(0, f.scare - dt); const dd = Math.hypot(ben.x - f.cx, ben.z - f.cz); if (dd < 4) f.scare = 1.5; for (let i = 0; i < f.n; i++) { const [p0, k, yo] = f.ph[i], a = p0 + TT * 0.6 * (1 + f.scare), rr2 = f.r * k * (1 + f.scare * 0.8); dm.position.set(f.cx + Math.cos(a) * rr2, f.y + yo + Math.sin(TT * 2 + p0) * 0.1, f.cz + Math.sin(a) * rr2); dm.rotation.set(0, -a, Math.PI / 2); dm.updateMatrix(); f.im.setMatrixAt(i, dm.matrix); } f.im.instanceMatrix.needsUpdate = true; } }
  // jellyfish: drifting, sting on touch (breath), a splash sends them away
  const jellies = [];
  function addJelly(x, z, y = -0.75) { const g = new THREE.Group(); const bell = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8, 0, 6.3, 0, 1.6), new THREE.MeshToonMaterial({ color: '#f472b6', gradientMap: grad, transparent: true, opacity: 0.8 })); g.add(bell); for (let k = 0; k < 5; k++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 1.0, 4), toon('#f9b4d4')); t.position.set(Math.cos(k * 1.25) * 0.25, -0.5, Math.sin(k * 1.25) * 0.25); g.add(t); } g.position.set(x, y, z); WORLD.add(g); jellies.push({ g, x, z, y, hx: x, hz: z, ph: rr(0, 6), flee: 0 }); }
  function jellyStep(dt) { for (const j of jellies) { j.flee = Math.max(0, j.flee - dt); if (j.flee > 0) { j.x += j.fx * dt; j.z += j.fz * dt; } else { j.x = lerp(j.x, j.hx + Math.cos(TT * 0.3 + j.ph) * 3, dt * 0.4); j.z = lerp(j.z, j.hz + Math.sin(TT * 0.25 + j.ph) * 3, dt * 0.4); } const pu = Math.sin(TT * 2.4 + j.ph); j.g.position.set(j.x, j.y + pu * 0.12, j.z); j.g.scale.set(1 + pu * 0.08, 1 - pu * 0.1, 1 + pu * 0.08);
      if (G.phase === 'run' && Math.hypot(ben.x - j.x, (ben.y - j.y) * 1.4, ben.z - j.z) < 1.25 && SK.hurt(ben, 18)) { G.stings++; const dx = ben.x - j.x, dz = ben.z - j.z, d = Math.hypot(dx, dz) || 1; ben.vx += dx / d * 4; ben.vz += dz / d * 4; flash('STUNG · BREATH -18', '#f472b6'); audio.tone(1300, 0.3, 0.05, 'sawtooth', 0.4); } } }

  // ---------- PLACE 1: CALM LAGOON (shallows + reef) ----------
  function buildLagoon(PL) {
    scene.background.set('#c9ecf7'); scene.fog.color.set('#c9ecf7'); wCol.a.set('#38c8d0'); PL.chopK = 0.7;
    const heads = []; for (let i = 0; i < 16; i++) heads.push({ x: rr(-34, 34), z: rr(16, 82), r: rr(2.4, 4), h: rr(0.6, 0.95) });
    PL.floor = (x, z) => { if (z < -14) return -0.7 + (-14 - z) * 0.12; if (z < 8) return -0.7 - (z + 14) * 0.032; let y = -2.6 - sstep(80, 110, z) * 1.4; for (const c of heads) { const d2 = (x - c.x) ** 2 + (z - c.z) ** 2; if (d2 < c.r * c.r * 4) y += c.h * Math.exp(-d2 / (c.r * c.r)); } return lerp(-1.4, y, sstep(8, 14, z)); };
    seabed(PL, 0, 20);
    // coral on the heads + sea grass + the shallows rope
    const cc = ['#f472b6', '#ffd23a', '#ec3013', '#a78bfa', '#5ec97e', '#fb923c'];
    for (const c of heads) { for (let k = 0; k < (touch ? 3 : 5); k++) { const a = rr(0, 6.28), r = rr(0, c.r * 0.6), x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r, y = PL.floor(x, z), col = toon(pick(cc)); if (Math.random() < 0.5) M(new THREE.ConeGeometry(rr(0.2, 0.4), rr(0.6, 1.2), 6), col, x, y + 0.4, z, null, 0.03); else M(new THREE.SphereGeometry(rr(0.3, 0.55), 8, 6), col, x, y + 0.15, z, null, 0.03).scale.y = 0.6; } }
    for (let x = -30; x <= 30; x += 3) { const g = new THREE.Group(); M(new THREE.SphereGeometry(0.22, 8, 6), x % 2 ? red : white, 0, 0, 0, g, 0.02); g.position.set(x, 0, 7); WORLD.add(g); PL.bobs.push(g); }
    postSign(-33, PL.floor(-33, 4) + 0.2, 4, stx('SHALLOW · WADE', '#ffffff', '#201e1d'), stx('REEF · DIVE 3', '#38bdf8', '#201e1d'), () => ben.z > 2 && ben.z < 12);
    for (const [x, z] of [[-24, -26], [-10, -30], [14, -28], [30, -24], [-40, -22], [44, -30]]) palm(x, z, PL.floor(x, z), rr(8, 11));
    { const x = 6, z = -18, y0 = PL.floor(x, z); for (const [a, b] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) M(new THREE.BoxGeometry(0.15, 2.4, 0.15), white, x + a, y0 + 1.2, z + b, null, 0.02); M(new THREE.BoxGeometry(1.8, 0.2, 1.8), red, x, y0 + 2.4, z, null, 0.03); jib.position.set(x, y0 + 2.5, z); jib.rotation.y = 0; }
    for (const [x, z] of [[-14, -6], [-10, -9], [18, -4]]) { const g = new THREE.Group(); g.position.set(x, PL.floor(x, z), z); g.rotation.y = rr(0, 6); WORLD.add(g); const pk = toon('#f49ac1'); M(new THREE.SphereGeometry(0.5, 10, 8), pk, 0, 1.9, 0, g, 0.03).scale.set(1, 0.7, 1.4); M(new THREE.CylinderGeometry(0.07, 0.09, 1.2, 6), pk, 0, 2.6, 0.5, g, 0.02).rotation.x = 0.3; M(new THREE.SphereGeometry(0.17, 8, 6), pk, 0, 3.2, 0.7, g, 0.02); for (const s of [-0.12, 0.12]) M(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 4), toon('#e0648f'), s, 0.9, 0, g, 0); }
    // ten clams with pearls on the heads (open/close)
    PL.clams = heads.slice(0, 10).map((c, i) => { const y = PL.floor(c.x, c.z) + 0.12, g = new THREE.Group(); g.position.set(c.x, y, c.z); g.rotation.y = rr(0, 6); WORLD.add(g); const sh = toon('#c9b8e8'); M(new THREE.SphereGeometry(0.5, 12, 6, 0, 6.3, 0, 1.5), sh, 0, 0, 0, g, 0.03).scale.set(1, 0.35, 0.8); const lid = new THREE.Group(); lid.position.z = -0.35; g.add(lid); M(new THREE.SphereGeometry(0.5, 12, 6, 0, 6.3, 0, 1.5), sh, 0, 0, 0.35, lid, 0.03).scale.set(1, 0.35, 0.8); const pearl = M(new THREE.SphereGeometry(0.17, 10, 8), new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: grad, emissive: new THREE.Color('#9fd8f5'), emissiveIntensity: 0.6 }), 0, 0.12, 0, g, 0.015); const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xbfefff, transparent: true, depthWrite: false, opacity: 0.7 })); glow.scale.setScalar(1.6); glow.position.y = 0.2; g.add(glow); return { x: c.x, y, z: c.z, g, lid, pearl, glow, ph: i * 0.7, taken: false, open: false }; });
    PL.pearls = 0;
    for (let i = 0; i < 7; i++) addJelly(rr(-26, 26), rr(14, 76), rr(-0.9, -0.6));
    for (const [x, z, c] of [[-12, 30, '#ffd23a'], [14, 48, '#38bdf8'], [-4, 66, '#fb923c'], [20, 22, '#a78bfa']]) fishSchool(x, z, -1.6, touch ? 12 : 18, c);
    [[-8, -1.4, 22], [10, -0.6, 34], [-18, -1.5, 44], [4, -1.4, 58], [22, -0.6, 64], [-24, -1.5, 72], [0, -0.6, 0], [26, -1.3, 40]].forEach(([x, y, z]) => addItem('tok', x, y, z));
    for (const [x0, z0, y] of [[-6, -4, -0.3], [8, 18, -1.3], [-20, 36, -0.3], [12, 70, -1.3], [-2, 50, -0.3]]) for (let j = 0; j < 6; j++) addItem('coin', x0 + j * 1.3, y, z0 + Math.sin(j) * 1.2);
    PL.start = { x: 0, z: -12, yaw: 0 }; PL.travel = () => ({ x: 0, z: 1 });
    PL.next = () => { if (PL.pearls >= 10) return { x: 0, z: -12, y: 0, label: 'BEACH' }; let b = null, bd = 1e9; for (const c of PL.clams) if (!c.taken) { const d = Math.hypot(c.x - ben.x, c.z - ben.z); if (d < bd) { bd = d; b = c; } } return b ? { x: b.x, z: b.z, y: b.y, label: 'CLAM' } : null; };
    PL.update = dt => { for (const c of PL.clams) { if (c.taken) continue; const cy = (TT + c.ph) % 4.2; c.open = cy < 2.6; c.lid.rotation.x = damp(c.lid.rotation.x, c.open ? -1.0 : 0, 8, dt); c.glow.material.opacity = c.open ? 0.5 + 0.3 * Math.sin(TT * 6) : 0.15; } jellyStep(dt); };
    PL.interact = () => { let best = null, bd = 1.6; for (const c of PL.clams) { if (c.taken) continue; const d = Math.hypot(c.x - ben.x, c.y + 0.1 - ben.y, c.z - ben.z); if (d < bd) { bd = d; best = c; } } if (!best) return null; return best.open ? { label: 'GRAB THE PEARL', act() { best.taken = true; best.pearl.visible = false; best.glow.visible = false; PL.pearls++; award('PEARL ' + PL.pearls + ' / 10', 120, '#bfefff'); bubbles(V3(best.x, best.y + 0.4, best.z), 10); audio.tone(1600, 0.2, 0.05, 'triangle', 1.6); if (PL.pearls === 10) { say('ALL TEN · BACK TO THE BEACH', 2.6); radio('All ten. Swim back in to the sand and I will stop the clock.'); } } } : { label: 'WAIT · IT IS SHUT', act() { flash('WAIT FOR IT TO OPEN', '#ffffff'); } }; };
    PL.finished = () => PL.pearls >= 10 && ben.z < -10;
    PL.progress = () => 'PEARLS ' + PL.pearls + ' / 10'; PL.stat = () => [['Pearls', PL.pearls + ' / 10'], ['Stings', String(G.stings)]]; }

  // ---------- PLACE 2: THE BREAK (buoys through the sets, body-surf in) ----------
  function buildBreak(PL) {
    scene.background.set('#bfe6f2'); scene.fog.color.set('#bfe6f2'); wCol.a.set('#25afc4'); PL.chopK = 1;
    PL.floor = (x, z) => z < 0 ? 0.3 + (-z) * 0.06 : Math.max(-6, 0.3 - z * 0.09);
    seabed(PL, 0, 60, 340);
    for (const [x, z] of [[-24, -24], [-40, -20], [16, -22], [30, -26], [52, -18]]) palm(x, z, PL.floor(x, z), rr(8, 11));
    { const x = -10, z = -10, y0 = PL.floor(x, z); for (const [a, b] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) M(new THREE.BoxGeometry(0.15, 2.4, 0.15), white, x + a, y0 + 1.2, z + b, null, 0.02); M(new THREE.BoxGeometry(1.8, 0.2, 1.8), red, x, y0 + 2.4, z, null, 0.03); jib.position.set(x, y0 + 2.5, z); jib.rotation.y = 0.3; }
    for (const s of [-1, 1]) M(new THREE.CylinderGeometry(0.12, 0.12, 5, 6), ink, s * 6, PL.floor(0, -1) + 2.5, -1, null, 0);
    for (const ry of [0, Math.PI]) { const fin = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.4), new THREE.MeshBasicMaterial({ map: signTex('FINISH', '#ffffff', '#201e1d'), transparent: true })); fin.position.set(0, PL.floor(0, -1) + 5.2, -1); fin.rotation.y = ry; WORLD.add(fin); }
    const BP = [[-10, 28], [12, 52], [-12, 78], [10, 104], [0, 126], [16, 70]];
    PL.buoys = BP.map(([x, z], i) => { const g = new THREE.Group(); M(new THREE.SphereGeometry(0.8, 12, 10), i === 5 ? red : yel, 0, 0.25, 0, g, 0.04); M(new THREE.CylinderGeometry(0.07, 0.07, 2, 6), ink, 0, 1.2, 0, g, 0); g.position.set(x, 0, z); WORLD.add(g); PL.bobs.push(g); const sg = spriteSign(x, 3.4, z, stx('BUOY ' + (i + 1), '#ffffff', '#201e1d'), stx('BUOY ' + (i + 1), '#ffd23a', '#201e1d'), () => PL.n === i); sg.bob = g; return { x, z, g, sg }; });
    PL.n = 0; PL.rides = 0;
    for (const s of [-1, 1]) postSign(s * 26, 0, 86, stx('SET!', '#ffffff', '#ec3013'), stx('SET!', '#ec3013', '#ffffff'), () => bands.some(b => b.kind === 'swell' && b.z - b.brk < 22));
    PL.setT = 2; PL.setLeft = 3; PL.rideT = 0; PL.rideP = 0;
    [[-4, -1.2, 20], [6, -0.3, 40], [-14, -1.2, 62], [14, -0.3, 88], [-6, -1.2, 112], [8, -0.3, 120], [18, -1.2, 60], [-2, -0.3, 10]].forEach(([x, y, z]) => addItem('tok', x, y, z));
    for (const [x0, z0, y] of [[-2, 34, -0.3], [4, 66, -1.2], [-8, 96, -0.3], [6, 118, -1.2]]) for (let j = 0; j < 6; j++) addItem('coin', x0 + j * 1.3, y, z0 + j * 1.2);
    PL.start = { x: 0, z: 3, yaw: 0 };
    PL.travel = () => G.home ? { x: 0, z: -1 } : (() => { const b = PL.buoys[Math.min(5, PL.n)], dx = b.x - ben.x, dz = b.z - ben.z, d = Math.hypot(dx, dz) || 1; return { x: dx / d * 0.4, z: Math.sign(dz) || 1 }; })();
    PL.next = () => G.home ? { x: 0, z: 1, y: 0, label: 'BEACH' } : { x: PL.buoys[PL.n].x, z: PL.buoys[PL.n].z, y: 0, label: 'BUOY ' + (PL.n + 1) };
    PL.update = dt => {
      PL.setT -= dt; if (PL.setT <= 0) { if (PL.setLeft > 0) { bands.push({ z: 178, pz: 178, kind: 'swell', A: 0.8, brk: rr(80, 90) }); PL.setLeft--; PL.setT = PL.setLeft ? 4.4 : 4.4 + rr(6, 9); } else { PL.setLeft = 3; PL.setT = 0.01; } }
      for (const b of [...bands]) { b.pz = b.z; b.z -= 6.5 * dt; if (b.kind === 'swell') { b.A = 0.8 + 1.5 * sstep(178, b.brk + 4, b.z); if (b.z <= b.brk) { b.kind = 'foam'; b.A = 1.25; audio.burst(1.0, 500, 0.16); for (let k = 0; k < (touch ? 10 : 18); k++) spray(V3(rr(-40, 40), 1.2, b.z), 1, 4, 2, 0.9); if (G.phase === 'run' && Math.abs(ben.z - b.z) < 5) { if (ben.under) award('UNDER THE LIP', 100, '#7dd3fc'); else if (SK.hurt(ben, 25)) { ben.vz -= 8; flash('POUNDED · BREATH -25', '#ec3013'); } } } } else b.A = 1.25 * sstep(-2, 40, b.z) + 0.05;
        if (b.kind === 'foam' && Math.random() < (touch ? 0.6 : 1)) spray(V3(rr(-40, 40), 0.6, b.z + rr(-0.5, 1.5)), 1, 2.5, 1.6, 0.8);
        if (G.phase === 'run' && b.pz > ben.z && b.z <= ben.z && b.kind === 'foam' && b.A > 0.25 && !ben.wade) { if (G.home) { if (PL.rideT <= 0) { ben.vz -= 4; flash('KICK (2) AS IT REACHES YOU', '#ffffff'); } } else if (ben.under) award('DOVE UNDER IT', 40, '#7dd3fc'); else { ben.vz -= 9; ben.spin += rr(-4, 4); flash('WASHED BACK · DIVE (3)', '#ffffff'); spray(V3(ben.x, ben.y + 0.5, ben.z), 14, 4, 1.4, 0.8); if (!PL.tip) { PL.tip = true; radio('Tap 3 before the white reaches you. Go under and it rolls over the top.'); } } }
        if (b.z < -4) bands.splice(bands.indexOf(b), 1); }
      if (!G.home) { const b = PL.buoys[PL.n]; if (Math.hypot(ben.x - b.x, ben.z - b.z) < 2.8) { award('BUOY ' + (PL.n + 1) + ' / 6', 100, '#ffd23a'); spray(V3(b.x, 0.5, b.z), 10, 3, 1, 0.6, 0xffd23a); b.sg.sp.visible = false; PL.n++; if (PL.n >= 6) { G.home = true; PL.n = 5; say('BODY-SURF IN', 2.6); radio('Last buoy. Now face the beach, and as a wave reaches you, KICK. You will ride it in.'); } } }
      if (PL.rideT > 0) { PL.rideT -= dt; ben.vz = Math.min(ben.vz, -10); ben.diving = false; PL.rideP += dt * 55; if (Math.random() < 0.6) spray(V3(ben.x, ben.y + 0.3, ben.z - 0.6), 2, 3, 1.1, 0.6); if (PL.rideT <= 0 || ben.wade) { PL.rideT = 0; PL.rides++; award('BODY-SURF', Math.round(PL.rideP), '#7dd3fc'); PL.rideP = 0; ben.boost = 0; } } };
    PL.onKick = w => { if (!G.home || PL.rideT > 0 || ben.wade) return; const near = bands.find(b => b.z - ben.z > -1 && b.z - ben.z < 4.5 && (b.kind === 'foam' ? b.A > 0.3 : b.A > 1.2)); if (near && (w.z < -0.2 || Math.cos(ben.yaw) < -0.3)) { PL.rideT = 4.2; PL.rideP = 0; ben.boost = 4; say('BODY-SURFING', 1.4); spray(V3(ben.x, ben.y, ben.z), 12, 4, 1.4, 0.8); audio.burst(0.5, 900, 0.14); } };
    PL.finished = () => G.home && ben.z < 4;
    PL.progress = () => G.home ? 'BODY-SURF IN · RIDES ' + PL.rides : 'BUOY ' + (PL.n + 1) + ' / 6'; PL.stat = () => [['Buoys', '6 / 6'], ['Body-surf rides', String(PL.rides)]]; }

  // ---------- PLACE 3: SHIPWRECK DIVE (levers, air pockets, the pup, the shark) ----------
  function buildWreck(PL) {
    scene.background.set('#b9e0ea'); scene.fog.color.set('#b9e0ea'); wCol.a.set('#2aa3b8'); PL.chopK = 0.8;
    const W = { x0: -5, x1: 5, z0: 48, z1: 72 }, POCK = [{ x: 2.6, z: 53, r: 1.7 }, { x: -2.6, z: 60.5, r: 1.6 }], KELP = [{ x: -10, z: 30, r: 4.5 }, { x: 9, z: 18, r: 4 }, { x: -6, z: 10, r: 3.5 }];
    PL.floor = (x, z) => { if (z < -36) return -2.8 + (-36 - z) * 0.18; return -2.8 + 0.12 * Math.sin(x * 0.6) * Math.sin(z * 0.5); };
    seabed(PL, 0, 20, 320, { deep: '#7aa594' });
    for (const [x, z] of [[-24, -52], [-8, -56], [14, -54], [30, -50]]) palm(x, z, PL.floor(x, z), rr(8, 11));
    // JIB's boat at the start
    { const g = new THREE.Group(); g.position.set(3, 0, 0); WORLD.add(g); M(new THREE.BoxGeometry(3, 1.2, 7), white, 0, 0.1, 0, g, 0.05); M(new THREE.BoxGeometry(3.1, 0.25, 7.1), red, 0, 0.75, 0, g, 0.03); M(new THREE.BoxGeometry(2, 1.4, 2), toon('#38bdf8'), 0, 1.4, -1.5, g, 0.04); M(new THREE.ConeGeometry(1.5, 2.2, 4), white, 0, 0.1, 4.4, g, 0.04).rotation.x = Math.PI / 2; PL.bobs.push(g); PL.boat = g; jib.position.set(3, 0.75, 1.5); jib.rotation.y = 0; }
    // the hull: walls stick out of the water; a hole low on the port side (dive through), a gate before the cabin
    const hullM = toon('#5b4636'), hullD = toon('#3a2a1e');
    PL.walls = [];
    const wall = (x0, z0, x1, z1, yMin = -9, yMax = 2, mesh = true, th = 0.5) => { const w = { x0, z0, x1, z1, yMin, yMax, on: true }; PL.walls.push(w); if (mesh) { const L = Math.hypot(x1 - x0, z1 - z0), y0 = Math.max(yMin, -2.8), m = M(new THREE.BoxGeometry(th, yMax - y0 + 0.8, L), hullM, (x0 + x1) / 2, (y0 + yMax + 0.8) / 2 - 0.4, (z0 + z1) / 2, null, 0.04); m.rotation.y = Math.atan2(x1 - x0, z1 - z0); w.mesh = m; } return w; };
    wall(W.x0, W.z0, W.x0, 58); wall(W.x0, 58, W.x0, 62, -0.75); wall(W.x0, 62, W.x0, W.z1); wall(W.x1, W.z0, W.x1, W.z1); wall(W.x0, W.z0, W.x1, W.z0); wall(W.x0, W.z1, W.x1, W.z1);
    M(new THREE.ConeGeometry(5, 6, 4), hullM, 0, -0.6, W.z1 + 2.6, null, 0.05).rotation.set(Math.PI / 2, Math.PI / 4, 0);
    const holeRim = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.18, 6, 18), toon('#ffd23a')); holeRim.position.set(W.x0 - 0.3, -1.6, 60); holeRim.rotation.y = Math.PI / 2; WORLD.add(holeRim);
    postSign(W.x0 - 0.6, 0.8, 56.6, stx('HOLE · DIVE 3', '#ffd23a', '#201e1d'), stx('DIVE HERE', '#ec3013', '#ffffff'), () => !PL.inside && Math.hypot(ben.x - W.x0, ben.z - 60) < 14, 2.6);
    for (let z = W.z0 + 1.2; z < W.z1; z += 2.4) { if (POCK.some(p => Math.abs(p.z - z) < 1.6) || z > 66) continue; M(new THREE.BoxGeometry(10, 0.25, 0.9), hullD, 0, 0.7, z, null, 0.02); }
    PL.gate = wall(W.x0, 66, W.x1, 66); PL.gate.mesh.material = toon('#8d8478');
    PL.covered = (x, z) => x > W.x0 && x < W.x1 && z > W.z0 && z < 66 && !POCK.some(p => Math.hypot(x - p.x, z - p.z) < p.r);
    for (const p of POCK) { const rg = new THREE.Mesh(new THREE.RingGeometry(p.r - 0.3, p.r, 24), new THREE.MeshBasicMaterial({ color: 0xbfefff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })); rg.rotation.x = -Math.PI / 2; rg.position.set(p.x, 0.08, p.z); WORLD.add(rg); spriteSign(p.x, 2.2, p.z, stx('AIR', '#38bdf8', '#201e1d'), stx('BREATHE', '#ffffff', '#201e1d'), () => PL.inside && ben.breath < 50, 2.4); }
    PL.levers = [[W.x0 + 0.5, -1.6, 51, Math.PI / 2], [W.x1 - 0.5, -1.7, 58, -Math.PI / 2], [W.x0 + 0.5, -1.6, 64.4, Math.PI / 2]].map(([x, y, z, ry]) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; WORLD.add(g); M(new THREE.BoxGeometry(0.6, 0.6, 0.2), brass, 0, 0, -0.1, g, 0.02); const arm = new THREE.Group(); g.add(arm); M(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6), brass, 0, 0.35, 0, arm, 0.02); M(new THREE.SphereGeometry(0.12, 8, 6), red, 0, 0.72, 0, arm, 0.02); arm.rotation.x = 0.6; const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, opacity: 0.6 })); gl.scale.setScalar(1.6); g.add(gl); return { x, y, z, g, arm, gl, pulled: false }; });
    PL.pulled = 0;
    // the pup on a crate in the cabin (air there)
    M(new THREE.BoxGeometry(1.6, 3.2, 1.6), wood, 0, -1.3, 69.5, null, 0.04);
    const pup = kit.makeFox({ key: 'pup', torso: ['#fff4e2', '#f472b6', '#a8326a'], outfit: 'dress', look: { ...PLAYER_FEMALE, fur: '#f0a63c', furDark: '#c9741f', tailMid: '#ffd9a0', tailTip: '#ffffff' }, mood: 'surprised' }); pup.scale.setScalar(0.6); pup.position.set(0, 0.3, 69.5); WORLD.add(pup); PL.pup = pup; PL.hasPup = false;
    spriteSign(0, 2.6, 69.5, stx('HELP!', '#ffffff', '#ec3013'), stx('HELP!', '#ec3013', '#ffffff'), () => !PL.hasPup, 2.4);
    // kelp to hide in + the shark
    for (const k of KELP) { for (let i = 0; i < (touch ? 8 : 14); i++) { const a = rr(0, 6.28), r = rr(0, k.r), x = k.x + Math.cos(a) * r, z = k.z + Math.sin(a) * r, s = M(new THREE.CylinderGeometry(0.05, 0.12, 2.6, 4), toon(pick(['#3f8f3a', '#2f6f3a', '#5c9a43'])), x, -1.5, z, null, 0); s.userData.kelp = rr(0, 6); PL.kelpM.push(s); } spriteSign(k.x, 2.2, k.z, stx('KELP · HIDE', '#5ec97e', '#201e1d'), stx('HIDE HERE', '#ffffff', '#201e1d'), () => PL.hasPup && PL.shark.st !== 'idle', 2.6); }
    { const g = new THREE.Group(), gr = toon('#5f707c'); const bd = M(new THREE.CapsuleGeometry(0.8, 3.2, 6, 12), gr, 0, 0, 0, g, 0.05); bd.rotation.x = Math.PI / 2; M(new THREE.CapsuleGeometry(0.68, 2.6, 6, 12), white, 0, -0.25, 0.15, g, 0).rotation.x = Math.PI / 2; const fin = M(new THREE.ConeGeometry(0.7, 1.7, 4), gr, 0, 1.2, -0.2, g, 0.04); fin.scale.set(0.25, 1, 1); fin.rotation.x = -0.3; M(new THREE.ConeGeometry(0.7, 1.4, 4), gr, 0, 0.3, -2.7, g, 0.04).rotation.x = -Math.PI / 2 + 0.3; for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.11, 8, 6), ink, s * 0.5, 0.25, 1.8, g, 0); WORLD.add(g); const bang = new THREE.Sprite(new THREE.SpriteMaterial({ map: bangTex, transparent: true, depthWrite: false, depthTest: false })); bang.scale.set(0.9, 0.9, 1); bang.position.y = 2.6; bang.visible = false; g.add(bang); PL.shark = { g, bang, x: 14, z: 40, y: -1.1, a: 0, st: 'idle', t: 0, cd: 2, yaw: 0 }; }
    PL.ringMark = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.9, 24), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false })); PL.ringMark.rotation.x = -Math.PI / 2; PL.ringMark.visible = false; WORLD.add(PL.ringMark);
    PL.bites = 0; PL.blackouts = 0;
    [[-3, -1.5, 50], [3, -1.5, 63], [-10, -1.5, 30], [9, -1.3, 18], [-8, -0.3, 44], [12, -0.3, 60], [0, -0.3, 30], [-2, -1.5, 56]].forEach(([x, y, z]) => addItem('tok', x, y, z));
    for (const [x0, z0, y] of [[-2, 12, -0.3], [-14, 52, -1.3], [10, 40, -0.3], [-1, 50, -1.4]]) for (let j = 0; j < 6; j++) addItem('coin', x0 + j * 1.0, y, z0 + j * 0.6);
    for (const [x, z, c] of [[8, 46, '#ffd23a'], [-12, 22, '#38bdf8']]) fishSchool(x, z, -1.8, touch ? 12 : 16, c);
    for (let i = 0; i < 3; i++) addJelly(rr(-14, 14), rr(24, 42));
    PL.start = { x: -1, z: 3, yaw: 0 };
    PL.travel = () => { const n = PL.next(); if (!n) return { x: 0, z: 1 }; const dx = n.x - ben.x, dz = n.z - ben.z, d = Math.hypot(dx, dz) || 1; return d < 4 ? { x: Math.sin(ben.yaw), z: Math.cos(ben.yaw) } : { x: dx / d, z: dz / d }; };
    PL.next = () => { if (PL.hasPup) return PL.inside ? { x: W.x0 - 2, z: 60, y: 0, label: 'HOLE' } : { x: 3, z: 0, y: 0, label: 'BOAT' }; if (!PL.inside) return { x: W.x0 - 2, z: 60, y: 0, label: 'HOLE IN THE HULL' }; const l = PL.levers.find(q => !q.pulled); return l ? { x: l.x, z: l.z, y: l.y, label: 'LEVER' } : { x: 0, z: 69.5, y: 0, label: 'THE PUP' }; };
    PL.update = dt => { PL.inside = ben.x > W.x0 && ben.x < W.x1 && ben.z > W.z0 && ben.z < W.z1;
      if (PL.gate.mesh) { PL.gate.mesh.position.y = damp(PL.gate.mesh.position.y, PL.gate.on ? -1 : 2.6, 3, dt); }
      for (const l of PL.levers) { l.arm.rotation.x = damp(l.arm.rotation.x, l.pulled ? -0.9 : 0.6, 6, dt); l.gl.visible = !l.pulled; }
      for (const s of PL.kelpM) s.rotation.z = Math.sin(TT * 1.2 + s.userData.kelp) * 0.15;
      for (const p of POCK) if (Math.random() < 0.15) bubbles(V3(p.x + rr(-0.5, 0.5), -1.8, p.z + rr(-0.5, 0.5)), 1);
      if (!PL.hasPup) PL.pup.rotation.y = Math.sin(TT * 2) * 0.5; kit.animFox(PL.pup, dt, 0, false); if (!PL.hasPup && PL.pup.userData.P) PL.pup.userData.P.arms.forEach((a, i) => a.rotation.x = -2.6 + Math.sin(TT * 8 + i) * 0.4);
      jellyStep(dt);
      // blackout inside the hull
      if (PL.inside && ben.breath <= 0 && PL.covered(ben.x, ben.z)) { PL.blackouts++; G.pen += 10; ben.x = W.x0 - 3; ben.z = 60; ben.y = 0; ben.vx = ben.vz = 0; ben.diving = false; ben.breath = SWIM.BREATH; flash('BLACKED OUT · +10 S', '#ec3013'); radio('I pulled you out. Breathe at the AIR rings before you run dry.'); cam.cut = true; }
      // the shark: circles; hunts near you, harder when you carry the pup; kelp + diving = it loses you
      const S = PL.shark, dx = ben.x - S.x, dz = ben.z - S.z, d = Math.hypot(dx, dz) || 1, hidden = ben.under && KELP.some(k => Math.hypot(ben.x - k.x, ben.z - k.z) < k.r), inHull = PL.inside; S.t += dt; S.cd -= dt;
      const hunting = !hidden && !inHull && (PL.hasPup ? d < 40 : d < 9);
      if (S.st === 'idle') { S.a += dt * 0.5; const tx = hunting ? ben.x : 12 * Math.cos(S.a), tz = hunting ? ben.z : 38 + 14 * Math.sin(S.a), mx = tx - S.x, mz = tz - S.z, md = Math.hypot(mx, mz) || 1, sp = (hunting ? (PL.hasPup ? 5.4 : 4) : 3.2) * dt; S.x += mx / md * Math.min(md, sp); S.z += mz / md * Math.min(md, sp); S.yaw = Math.atan2(mx, mz); if (hunting && d < 7 && S.cd <= 0) { S.st = 'tell'; S.t = 0; S.tx = ben.x; S.tz = ben.z; } if (hidden && PL.hasPup && !PL.hidTip) { PL.hidTip = true; award('HID IN THE KELP', 60, '#5ec97e'); } }
      else if (S.st === 'tell') { S.bang.visible = true; S.yaw = Math.atan2(dx, dz); S.tx = lerp(S.tx, ben.x, dt * 2); S.tz = lerp(S.tz, ben.z, dt * 2); PL.ringMark.visible = true; PL.ringMark.position.set(S.tx, 0.1, S.tz); if (S.t > 0.85 || hidden || inHull) { S.bang.visible = false; PL.ringMark.visible = false; if (hidden || inHull) { S.st = 'idle'; S.cd = 2; } else { S.st = 'lunge'; S.t = 0; const lx = S.tx - S.x, lz = S.tz - S.z, ld = Math.hypot(lx, lz) || 1; S.lx = lx / ld; S.lz = lz / ld; S.res = false; } } }
      else if (S.st === 'lunge') { S.x += S.lx * 16 * dt; S.z += S.lz * 16 * dt; if (d < 2 && !S.res) { S.res = true; if (SK.hurt(ben, 30)) { PL.bites++; G.pen += 5; ben.vx += S.lx * 5; ben.vz += S.lz * 5; flash('SHARK BITE · BREATH -30 · +5 S', '#ec3013'); audio.tone(140, 0.5, 0.09, 'sawtooth', 0.5); } } if (S.t > 0.6) { S.st = 'idle'; S.cd = 2.4; } }
      if (Math.hypot(S.x - W.x0 + 0, 0) < 0) S.x = 0; if (S.x > W.x0 - 1.5 && S.x < W.x1 + 1.5 && S.z > W.z0 - 1.5 && S.z < W.z1 + 3) S.x = S.x < 0 ? W.x0 - 1.5 : W.x1 + 1.5;
      S.y = S.st === 'lunge' ? -0.5 : -1.1; S.g.position.set(S.x, S.y, S.z); S.g.rotation.y = S.yaw; if (Math.random() < 0.4) spray(V3(S.x, 0.1, S.z), 1, 1.2, 0.6, 0.4); };
    PL.interact = () => { for (const l of PL.levers) if (!l.pulled && Math.hypot(l.x - ben.x, l.y - ben.y, l.z - ben.z) < 1.9) return { label: 'PULL THE LEVER', act() { l.pulled = true; PL.pulled++; award('LEVER ' + PL.pulled + ' / 3', 120, '#d9a64a'); bubbles(V3(l.x, l.y, l.z), 12); audio.tone(300, 0.3, 0.07, 'square', 0.6); if (PL.pulled === 3) { PL.gate.on = false; say('THE GATE IS OPEN', 2.4); audio.burst(0.8, 300, 0.2); radio('That is the gate. She is in the cabin, up on the crate.'); } } };
      if (!PL.hasPup && Math.hypot(ben.x - 0, ben.z - 69.5) < 2.6 && !PL.gate.on) return { label: 'TAKE HER ON YOUR BACK', act() { PL.hasPup = true; ben.carry.add(PL.pup); PL.pup.position.set(0, ben.h * 0.1, -ben.h * 0.15); PL.pup.rotation.set(0, 0, 0); PL.pup.userData.mood = 'happy'; ben.carryOn = true; award('GOT HER', 200, '#5ec97e'); say('BACK TO THE BOAT', 2.6); radio('You have her! Out through the hole and back to the boat. The shark will come for you now. Kelp hides you if you dive in it.'); } };
      return null; };
    PL.finished = () => PL.hasPup && Math.hypot(ben.x - 3, ben.z - 0) < 5;
    PL.progress = () => PL.hasPup ? 'BACK TO THE BOAT' : !PL.gate.on ? 'FIND THE PUP' : 'LEVERS ' + PL.pulled + ' / 3'; PL.stat = () => [['Pup rescued', 'YES'], ['Shark bites · blackouts', PL.bites + ' · ' + PL.blackouts]]; }

  // ---------- lifecycle ----------
  function clearPlace() { if (WORLD) { scene.remove(WORLD); WORLD.traverse(o => { if (o.geometry && o.geometry !== tokGeo && o.geometry !== coinGeo) o.geometry.dispose(); }); } items.length = 0; signs.length = 0; bands.length = 0; jellies.length = 0; fishes.length = 0; ben.carryOn = false; if (ben.carry.children.length) ben.carry.clear(); WORLD = new THREE.Group(); scene.add(WORLD); }
  function buildPlace(id) { clearPlace(); const PL = { id, bobs: [], walls: [], kelpM: [], chopK: 1, covered: () => false, interact: () => null, onKick: () => {} }; G.PL = PL; G.place = id; if (id === 'lagoon') buildLagoon(PL); else if (id === 'break') buildBreak(PL); else buildWreck(PL); return PL; }
  function placeBen() { const s = G.PL.start; Object.assign(ben, { x: s.x, z: s.z, vx: 0, vz: 0, yaw: s.yaw, spin: 0, breath: SWIM.BREATH, diving: false, kickCd: 0, gasp: 0, inv: 0, boost: 0 }); ben.y = G.PL.floor(s.x, s.z) > -SWIM.SHALLOW ? Math.max(G.PL.floor(s.x, s.z), surfAt(s.x, s.z) - 0.1) : surfAt(s.x, s.z) - 0.1; cam.cut = true; }
  function rollOut(id) { audioOn(); const pd = PLACES.find(p => p.id === id && p.built) || PLACES[0]; buildPlace(pd.id); Object.assign(G, { board: false, done: null, phase: 'count', count: 3.2, t: 0, pts: 0, tok: 0, coins: 0, stings: 0, pen: 0, home: false, flash: null }); placeBen(); PAUSE = false;
    say(pd.name, 3); radio(pd.id === 'lagoon' ? 'Ten pearls on the reef. Clams open and shut, so wait for it. Tap 3 to go under, 1 to grab. Watch your BREATH bar.' : pd.id === 'break' ? 'Buoys one to six, in order. When the white comes at you, tap 3 to go under it. After six, body-surf in.' : 'A pup is stuck in the old wreck. Dive in through the hole on the left side, pull three levers, breathe at the AIR rings. Then the shark is your problem.', 'JIB', 8); emit(); }
  function finish() { const pd = placeDef(), t = G.t + G.pen, tb = Math.max(0, Math.round((pd.target - t) * 15)), total = Math.round(G.pts + tb);
    let nb = false, best = total; try { nb = save.best('jidda.swim.best.' + pd.id, total); best = save.stat('jidda.swim.best.' + pd.id, total); if (pd.id === 'wreck') save.setFlag('swimRescue'); save.addGold && save.addGold(Math.round(total / 100)); } catch (e) {}
    const grade = total >= 5000 ? 'S' : total >= 3800 ? 'A' : total >= 2600 ? 'B' : total >= 1600 ? 'C' : 'D';
    G.done = { id: pd.id, name: pd.name, time: t, pen: G.pen, target: pd.target, tok: G.tok, coins: G.coins, pts: Math.round(G.pts), tb, total, grade, newBest: nb, best, gold: Math.round(total / 100), stat: G.PL.stat() };
    G.phase = 'done'; audio.tone(660, 0.3, 0.06, 'triangle', 1.5); setTimeout(() => audio.tone(990, 0.4, 0.06, 'triangle', 1.2), 180);
    radio(pd.id === 'wreck' ? 'She is safe, and she will not stop talking about you.' : pd.id === 'break' ? 'Out through the sets and back in on a wave. That is how you swim the break.' : 'Ten pearls. You are a reef swimmer now.', 'JIB', 8); }

  // ---------- CAMERA ----------
  const VIEWS = ['BEHIND', 'HIGH', 'LOW'];
  const cam = { vi: 0, pos: V3(0, 10, -10), look: V3(0, 0, 10), cut: true, yawOff: 0, pitchOff: 0, drag: false, zoom: 1, dir: V3(0, 0, 1), tp: V3(), tl: V3() };
  function camStep(dt) { const port = CHh() > CW() * 1.05, Z = cam.zoom * (port ? 1.4 : 1), tp = cam.tp, tl = cam.tl, PL = G.PL;
    if (G.phase === 'ready') { const s = PL.start, a = TT * 0.08; tp.set(s.x + Math.cos(a) * 30, 14, s.z + 24 + Math.sin(a) * 30); tl.set(s.x, 0, s.z + 24); }
    else { const tv = PL.travel(), d = cam.dir; d.x = damp(d.x, tv.x, 2.2, dt); d.z = damp(d.z, tv.z, 2.2, dt); const dl = Math.hypot(d.x, d.z) || 1, fx = d.x / dl, fz = d.z / dl, inside = PL.id === 'wreck' && PL.inside, v = inside ? 'HIGH' : VIEWS[cam.vi];
      const dist = (v === 'HIGH' ? (inside ? 6 : 12) : v === 'LOW' ? 6 : 8.5) * Z, hgt = (v === 'HIGH' ? (inside ? 10 : 11) : v === 'LOW' ? 1.6 : 4) * Z, sy = Math.max(ben.y, ben.surfY - 0.2);
      tp.set(ben.x - fx * dist, sy + hgt, ben.z - fz * dist); tl.set(ben.x + fx * 5, ben.y + (ben.under ? 0 : 0.6), ben.z + fz * 5); }
    if (cam.yawOff || cam.pitchOff) { const dx = tp.x - tl.x, dz = tp.z - tl.z, r = Math.hypot(dx, dz), a = Math.atan2(dx, dz) + cam.yawOff; tp.x = tl.x + Math.sin(a) * r; tp.z = tl.z + Math.cos(a) * r; tp.y += cam.pitchOff * r; }
    if (!cam.drag) { cam.yawOff = damp(cam.yawOff, 0, 3, dt); cam.pitchOff = damp(cam.pitchOff, 0, 3, dt); }
    if (cam.cut) { cam.pos.copy(tp); cam.look.copy(tl); cam.cut = false; } else { cam.pos.lerp(tp, Math.min(1, dt * 4)); cam.look.lerp(tl, Math.min(1, dt * 6)); }
    cam.pos.y = Math.max(cam.pos.y, surfAt(cam.pos.x, cam.pos.z) + 0.9, PL.floor(cam.pos.x, cam.pos.z) + 1.2); camera.position.copy(cam.pos); camera.lookAt(cam.look); camera.fov = damp(camera.fov, port ? 64 : 58, 4, dt); camera.updateProjectionMatrix();
    sun.position.set(cam.look.x + 20, 40, cam.look.z - 30); sun.target.position.copy(cam.look); }
  const stickWorld = (sx, sy) => { const fx = cam.look.x - cam.pos.x, fz = cam.look.z - cam.pos.z, l = Math.hypot(fx, fz) || 1, ux = fx / l, uz = fz / l; return { x: ux * sy - uz * sx, z: uz * sy + ux * sx }; };

  // ---------- INPUT ----------
  const keys = new Set(), STK = { x: 0, y: 0 }; let PAUSE = false;
  const kx = () => (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0), ky = () => (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
  const onKD = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if (keys.has(e.code)) return; keys.add(e.code); if (e.code === 'Digit1' || e.code === 'KeyJ') press(1); if (e.code === 'Digit2' || e.code === 'KeyK') press(2); if (e.code === 'Space') { e.preventDefault(); press(3); } };
  const onKU = e => keys.delete(e.code); addEventListener('keydown', onKD); addEventListener('keyup', onKU);
  function press(n) { audioOn(); if (G.board || PAUSE || G.phase !== 'run') return; const w = stickWorld(STK.x + kx(), STK.y + ky()), PL = G.PL;
    if (n === 1) { const it = PL.interact(); if (it) it.act(); else { spray(V3(ben.x, ben.surfY + 0.3, ben.z), 12, 3, 1.1, 0.6); audio.burst(0.3, 1200, 0.12); let n2 = 0; for (const j of jellies) { const dx = j.x - ben.x, dz = j.z - ben.z, d = Math.hypot(dx, dz); if (d < 4) { j.flee = 2.5; j.fx = dx / (d || 1) * 4; j.fz = dz / (d || 1) * 4; n2++; } } if (n2) flash('SPLASH · JELLIES SHOOED', '#f472b6'); for (const f of fishes) if (Math.hypot(f.cx - ben.x, f.cz - ben.z) < 8) f.scare = 2; } }
    else if (n === 2) { if (SK.kick(ben, w.x, w.z)) { audio.burst(0.3, 1400, 0.1); spray(V3(ben.x, ben.surfY + 0.1, ben.z), 8, 2.5, 1, 0.5); PL.onKick(w); } }
    else { const r = SK.dive(ben, PL.covered(ben.x, ben.z)); if (r === 'shallow') flash('TOO SHALLOW TO DIVE', '#ffffff'); else if (r === 'covered') flash('ROOF ABOVE · FIND AN AIR RING', '#38bdf8'); else if (r === 'breath') flash('CATCH YOUR BREATH', '#ffffff'); else if (r === 'down') { bubbles(V3(ben.x, ben.y, ben.z), 8); audio.burst(0.4, 600, 0.12); } else { spray(V3(ben.x, ben.surfY, ben.z), 6, 2, 0.8, 0.5); audio.tone(520, 0.2, 0.04, 'triangle', 1.6); } } }
  function useItem(id) { if (G.phase !== 'run') return; if (id === 'energyPod' || id === 'amber') { try { save.take(id); } catch (e) {} ben.breath = SWIM.BREATH; ben.kickCd = 0; flash('BREATH FULL', '#38bdf8'); return; } flash('SAVE IT FOR THE BEACH', '#ffffff'); }

  // ---------- STEP ----------
  function wallsStep() { for (const w of G.PL.walls) { if (!w.on || ben.y < w.yMin || ben.y > w.yMax) continue; const ex = w.x1 - w.x0, ez = w.z1 - w.z0, L2 = ex * ex + ez * ez, u = clamp(((ben.x - w.x0) * ex + (ben.z - w.z0) * ez) / L2, 0, 1), px = w.x0 + ex * u, pz = w.z0 + ez * u, dx = ben.x - px, dz = ben.z - pz, d = Math.hypot(dx, dz), m = ben.h * 0.28 + 0.3; if (d < m) { const nx = d > 1e-4 ? dx / d : -ez / Math.sqrt(L2), nz = d > 1e-4 ? dz / d : ex / Math.sqrt(L2); ben.x = px + nx * m; ben.z = pz + nz * m; const vn = ben.vx * nx + ben.vz * nz; if (vn < 0) { ben.vx -= nx * vn; ben.vz -= nz * vn; } } } }
  function itemsStep(dt) { for (const it of items) { if (!it.on) continue; const y = it.y + Math.sin(TT * 3 + it.x) * 0.1; it.g.position.y = y; it.g.rotation.y += dt * (it.kind === 'tok' ? 3 : 5); if (Math.hypot(ben.x - it.x, ben.y - y, ben.z - it.z) < (it.kind === 'tok' ? 1.8 : 1.4)) { it.on = false; it.g.visible = false; if (it.kind === 'tok') { G.tok++; award('TOKEN ' + G.tok + ' / 8', 60, '#e6b45a'); spray(V3(it.x, y, it.z), 8, 3, 1, 0.6, 0xffd23a); if (G.tok === 8) setTimeout(() => award('ALL 8 TOKENS', 400, '#e6b45a'), 500); } else { G.coins++; G.pts += 25; audio.tone(1500 + (G.coins % 6) * 120, 0.08, 0.04, 'triangle', 1.3); if (G.coins % 6 === 0) flash('COIN SPREE +150', '#e6b45a'); } } } }
  function step(dt) { TT += dt; demoStep(dt); const PL = G.PL; if (!PL) return;
    PL.update(dt);
    for (const b of PL.bobs) { b.position.y = surfAt(b.position.x, b.position.z); b.rotation.z = Math.sin(TT * 1.7 + b.position.z) * 0.08; }
    for (const s of signs) { const on = s.blink(); s.sp.material.map = on && Math.sin(TT * 10) > 0 ? s.b : s.a; if (s.bob) s.sp.position.y = s.bob.position.y + 3.2; }
    if (G.phase === 'count') { G.count -= dt; if (G.count <= 0) { G.phase = 'run'; say('GO!', 1.2); audio.tone(990, 0.3, 0.08, 'square', 1.2); } else if (Math.ceil(G.count) !== Math.ceil(G.count + dt)) audio.tone(520, 0.15, 0.06, 'square', 1); }
    const live = G.phase === 'run'; if (live) G.t += dt;
    const sx = live ? STK.x + kx() : 0, sy = live ? STK.y + ky() : 0, w = stickWorld(sx, sy), m = Math.min(1, Math.hypot(w.x, w.z)), wl = Math.hypot(w.x, w.z) || 1;
    const wasUnder = ben.under, b0 = ben.breath;
    SK.step(ben, dt, { ax: w.x / wl * m, az: w.z / wl * m, surf: surfAt(ben.x, ben.z), floor: PL.floor(ben.x, ben.z), covered: PL.covered(ben.x, ben.z) });
    if (G.phase === 'count') { const s = PL.start; ben.x = s.x; ben.z = s.z; ben.vx = ben.vz = 0; }
    wallsStep(); ben.x = clamp(ben.x, -60, 60); ben.z = clamp(ben.z, PL.id === 'wreck' ? -30 : -24, 180);
    if (live && ben.outOfBreath && !G.oobT) { G.oobT = 2; flash('OUT OF BREATH', '#ec3013'); }
    G.oobT = Math.max(0, (G.oobT || 0) - dt);
    if (ben.under && Math.random() < 0.12) bubbles(V3(ben.x, ben.y + 0.3, ben.z), 1);
    if (wasUnder && !ben.under && live) { spray(V3(ben.x, ben.surfY, ben.z), 8, 2.2, 0.9, 0.5); if (b0 < 30) audio.tone(480, 0.3, 0.05, 'square', 1.8); }
    if (!ben.under && !ben.wade && ben.paddle > 0.3 && Math.random() < 0.3) spray(V3(ben.x + rr(-0.6, 0.6), ben.surfY + 0.1, ben.z), 1, 1.6, 0.6, 0.4);
    SK.pose(ben, dt, TT);
    if (live) { itemsStep(dt); const it = PL.interact(); G.prompt = it ? it.label : null; if (PL.finished()) finish(); } else G.prompt = null;
    fishStep(dt); waterStep(); kit.animFox(jib, dt, 0, false); fxStep(dt);
    G.bannerT = Math.max(0, G.bannerT - dt); if (G.bannerT <= 0) G.banner = ''; G.radioT = Math.max(0, G.radioT - dt); if (G.radioT <= 0) G.radio = ''; G.flashT = Math.max(0, G.flashT - dt); if (G.flashT <= 0) G.flash = null;
    camStep(dt); }
  let last = performance.now(), raf = 0, hudT = 0, miniC = null, miniT = 0;
  function frame(now) { raf = requestAnimationFrame(frame); const rdt = Math.min(0.05, (now - last) / 1000); last = now; if (!PAUSE) step(rdt); renderer.render(scene, camera); hudT -= rdt; if (hudT <= 0) { hudT = 0.1; emit(); } miniT -= rdt; if (miniT <= 0 && miniC) { miniT = 0.25; drawMini(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  let audioReady = false; function audioOn() { if (audioReady) return; audioReady = true; try { audio.init(); } catch (e) {} }

  // ---------- HUD ----------
  const _pv = V3();
  const fmtT = t => { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };
  function hud() { const pd = placeDef(), live = G.phase === 'run', PL = G.PL;
    let goal = null; if (live) { const n = PL.next(); if (n) { const dd = Math.hypot(ben.x - n.x, ben.z - n.z); if (dd > 6) { _pv.set(n.x, (n.y || 0) + 0.5, n.z).project(camera); goal = { nx: _pv.x, ny: _pv.y, behind: _pv.z > 1, label: n.label, dist: Math.round(dd) }; } } }
    const bests = PLACES.map(p => { try { return save.stat('jidda.swim.best.' + p.id, 0); } catch (e) { return 0; } });
    return { state: G.phase === 'ready' ? 'ready' : 'run', phase: G.phase, board: G.board, done: G.done, place: pd.id, placeName: pd.name, room: pd.room, target: pd.target, time: fmtT(G.t + G.pen), over: G.t + G.pen > pd.target,
      breath: Math.round(ben.breath), under: ben.under, wade: ben.wade, depth: Math.max(0, ben.surfY - ben.y).toFixed(1), covered: PL.covered(ben.x, ben.z), tok: G.tok, coins: G.coins, pts: Math.round(G.pts), progress: PL.progress(), prompt: G.prompt,
      banner: G.banner, radio: G.radio, radioWho: G.radioWho, flash: G.flash, count: G.phase === 'count' ? Math.ceil(G.count) : null, view: VIEWS[cam.vi], goal, bests, kick: ben.kickCd > 0 ? 1 - ben.kickCd / SWIM.KICK_CD : 1,
      quest: pd.goal + (live ? ' · ' + PL.progress() : '') }; }
  function emit() { onState({ course: hud() }); }
  function drawMini() { const c = miniC; if (!c.isConnected) { miniC = null; return; } const dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr); if (!w || !h || !G.PL) return; if (c.width !== w) c.width = w; if (c.height !== h) c.height = h;
    const x = c.getContext('2d'), k = Math.min(w, h) / 170, X = px => w / 2 - (px - ben.x) * k, Y = pz => h / 2 - (pz - ben.z) * k; x.fillStyle = '#2fb8c8'; x.fillRect(0, 0, w, h);
    for (let gx = -1; gx <= 1; gx += 0.04) for (let gz = -1; gz <= 1; gz += 0.04) { const wx = ben.x + gx * 85, wz = ben.z + gz * 85, f = G.PL.floor(wx, wz); if (f > -0.95) { x.fillStyle = f > 0 ? '#ead7a4' : '#7fd3dd'; x.fillRect(X(wx), Y(wz), 3.5 * k + 1, 3.5 * k + 1); } }
    const n = G.PL.next(); if (n) { x.strokeStyle = '#ffd23a'; x.lineWidth = 3 * dpr; x.beginPath(); x.arc(X(n.x), Y(n.z), 6 * dpr, 0, 7); x.stroke(); }
    for (const it of items) if (it.on && it.kind === 'tok') { x.fillStyle = '#e6b45a'; x.beginPath(); x.arc(X(it.x), Y(it.z), 3 * dpr, 0, 7); x.fill(); }
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(w / 2, h / 2, 5 * dpr, 0, 7); x.fill(); x.fillStyle = '#ec3013'; x.beginPath(); x.arc(w / 2, h / 2, 3 * dpr, 0, 7); x.fill(); }

  // ---------- JIB'S SWIM SHEET ----------
  function drawBoard(g, P) { const W0 = P ? 900 : 1600, H0 = P ? 1600 : 900;
    g.fillStyle = '#7a4f2a'; g.fillRect(0, 0, W0, H0); const x0 = 34, y0 = 34, w = W0 - 68, h = H0 - 98; g.fillStyle = '#1f2b27'; g.fillRect(x0, y0, w, h);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.beginPath(); g.ellipse(x0 + Math.random() * w, y0 + Math.random() * h, 60 + Math.random() * 200, 20 + Math.random() * 60, Math.random() * 3, 0, 7); g.fill(); }
    const CH = '#f2f1e8', YL = '#f5e08a', RD = '#ff9a8a', BLU = '#9fd8f5', HF = '"Caveat", "Segoe Print", "Bradley Hand", cursive';
    const txt = (s, x, y, size, col = CH, wt = 800, fam = 'Archivo, sans-serif') => { g.font = `${wt} ${size}px ${fam}`; g.fillStyle = col; g.globalAlpha = 0.92; g.fillText(s, x, y); g.globalAlpha = 0.28; g.fillText(s, x + 1.6, y - 1.2); g.globalAlpha = 1; };
    const fit = (s, size, maxW, wt = 800, fam = 'Archivo, sans-serif') => { g.font = `${wt} ${size}px ${fam}`; const tw = g.measureText(s).width; return tw > maxW ? Math.floor(size * maxW / tw) : size; };
    const L = 86; txt('SWIM TRIALS', L, 160, fit('SWIM TRIALS', 120, W0 - 2 * L, 900), CH, 900); const sub = "JIDDA  ·  JIB'S SURF SHOP  ·  PICK A PLACE"; txt(sub, L + 4, 214, fit(sub, 30, W0 - 2 * L), YL); g.strokeStyle = CH; g.lineWidth = 4; g.beginPath(); g.moveTo(L, 238); g.lineTo(W0 - L, 236); g.stroke();
    const rows = [['STICK', 'WASD', 'Swim (crawl on top, kick under)', CH], ['1', 'J', 'Grab: pearls, levers, a pup. Else splash', RD], ['2', 'K', 'Kick: burst · catch a wave to body-surf', BLU], ['3', 'SPACE', 'Dive just under · tap again to come up', YL]];
    const colW = P ? W0 - 2 * L : 760, ry0 = 320, rh = P ? 112 : 104;
    rows.forEach(([k, kb, d, col], i) => { const y = ry0 + i * rh, cx = L + 34, cy = y - 14; g.globalAlpha = 0.9; g.strokeStyle = col; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, 30, 0, 7); g.stroke(); g.globalAlpha = 1; g.font = `900 ${k.length > 1 ? 18 : 32}px Archivo, sans-serif`; g.textAlign = 'center'; g.fillStyle = CH; g.fillText(k, cx, cy + (k.length > 1 ? 7 : 11)); g.textAlign = 'left'; txt(kb, cx + 60, y - 24, 18, '#b9c4bf', 800); txt(d, cx + 60, y + 6, fit(d, 30, colW - 100, 700), CH, 700); });
    const sx = P ? L : 900, sy = P ? ry0 + 4 * rh + 40 : 300, sw = P ? W0 - 2 * L : W0 - 900 - L;
    txt('BREATH RUNS DOWN UNDER WATER', sx, sy, fit('BREATH RUNS DOWN UNDER WATER', 30, sw), BLU);
    PLACES.slice(0, 3).forEach((p, i) => { const y = sy + 70 + i * (P ? 110 : 100); txt(String(i + 1), sx, y + 10, 52, [BLU, YL, RD][i], 900); txt(p.name, sx + 56, y - 6, fit(p.name, 32, sw - 56, 900), CH, 900); txt(p.goal.toUpperCase(), sx + 56, y + 30, fit(p.goal.toUpperCase(), 30, sw - 56, 700, HF), YL, 700, HF); });
    { const s = 'Grab the 8 tokens · come up for air · beat the clock'; txt(s.toUpperCase(), L, H0 - 110, fit(s.toUpperCase(), 44, W0 - 2 * L, 700, HF), YL, 700, HF); }
    g.fillStyle = '#5e3c1f'; g.fillRect(0, H0 - 64, W0, 64); g.fillStyle = '#7a4f2a'; g.fillRect(0, H0 - 64, W0, 10); for (let k = 0; k < 4; k++) { g.fillStyle = ['#f2f1e8', '#f5e08a', '#ff9a8a', '#9fd8f5'][k]; g.fillRect(260 + k * 120, H0 - 48, 70, 16); }
    for (let i = 0; i < 4000; i++) { g.fillStyle = 'rgba(31,43,39,0.55)'; g.fillRect(x0 + Math.random() * w, y0 + Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
  const boardCv = document.createElement('canvas'); boardCv.width = 1600; boardCv.height = 900; const boardCvP = document.createElement('canvas'); boardCvP.width = 900; boardCvP.height = 1600;
  const paintBoards = () => { drawBoard(boardCv.getContext('2d')); drawBoard(boardCvP.getContext('2d'), true); course.boardURL = boardCv.toDataURL('image/jpeg', 0.9); course.boardURLP = boardCvP.toDataURL('image/jpeg', 0.9); emit(); };
  try { if (!document.getElementById('font-caveat')) { const lk = document.createElement('link'); lk.id = 'font-caveat'; lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap'; document.head.appendChild(lk); } } catch (e) {}

  // ---------- DEMO (autopilot + captions: WATCH THE DEMO on the sheet, or ?demo=1) ----------
  const DM = { on: false, i: 0, t: 0, cap: '', step: 0, n: 0 };
  const steer = (tx, tz, k = 1) => { const fx = cam.look.x - cam.pos.x, fz = cam.look.z - cam.pos.z, l = Math.hypot(fx, fz) || 1, ux = fx / l, uz = fz / l, dx = tx - ben.x, dz = tz - ben.z, d = Math.hypot(dx, dz); if (d < 0.6) { STK.x = STK.y = 0; return d; } const wx = dx / d * k, wz = dz / d * k; STK.y = wx * ux + wz * uz; STK.x = -wx * uz + wz * ux; return d; };
  const tp = (x, z) => { ben.x = x; ben.z = z; ben.vx = ben.vz = 0; cam.cut = true; };
  const go = id => { rollOut(id); G.count = 0.01; G.radio = ''; G.radioT = 0; };
  const diveNow = () => { if (!ben.diving) press(3); }, upNow = () => { if (ben.diving) press(3); };
  const DEMO = [
    { d: 3.5, cap: 'CALM LAGOON · WADE OUT OF THE SHALLOWS', on() { go('lagoon'); }, tick() { steer(0, 12); } },
    { d: 3.2, cap: '3 · DIVE JUST UNDER THE SURFACE', on() { const c = G.PL.clams[0]; tp(c.x, c.z - 4.5); diveNow(); }, tick() { const c = G.PL.clams[0]; steer(c.x, c.z - 0.6, 0.6); } },
    { d: 3.4, cap: '1 · GRAB THE PEARL WHILE THE CLAM IS OPEN', on() { DM.done = false; }, tick() { const c = G.PL.clams[0]; steer(c.x, c.z - 0.4, 0.4); ben.y = Math.min(ben.y, c.y + 0.5); if (!DM.done && c.open) { const it = G.PL.interact(); if (it && it.label === 'GRAB THE PEARL') { it.act(); DM.done = true; } } } },
    { d: 3.2, cap: '1 WITH NOTHING TO GRAB = SPLASH · JELLYFISH SWIM OFF', on() { upNow(); const j = jellies[0]; tp(j.x - 3.5, j.z - 3.5); DM.sp = false; }, tick() { const j = jellies[0]; steer(j.x - 2, j.z - 2, 0.5); if (!DM.sp && DM.t > 1.2) { DM.sp = true; press(1); } } },
    { d: 3.4, cap: 'GRAB THE 8 TOKENS · SOME ARE UNDER WATER', on() { const t = items.find(q => q.on && q.kind === 'tok' && q.y < -1); if (t) { DM.tk = t; tp(t.x, t.z - 5); diveNow(); } }, tick() { if (DM.tk) steer(DM.tk.x, DM.tk.z); } },
    { d: 2.6, cap: 'BREATH RUNS DOWN UNDER WATER · IT FILLS AGAIN AT THE TOP', on() { ben.breath = 35; }, tick(dt) { if (DM.t > 1) upNow(); steer(ben.x, ben.z + 3, 0.4); } },
    { d: 4.2, cap: 'THE BREAK · WHITE WATER COMING: 3 TO GO UNDER IT', on() { go('break'); tp(4, 66); bands.length = 0; G.PL.setT = 99; bands.push({ z: 74, pz: 74, kind: 'foam', A: 1.25, brk: 0 }); DM.dv = false; }, tick() { steer(4, 80, 0.5); const b = bands[0]; if (!DM.dv && b && b.z - ben.z < 2.6) { DM.dv = true; diveNow(); } if (DM.dv && b && b.z < ben.z - 3) upNow(); } },
    { d: 3.4, cap: 'SWIM THE SIX BUOYS IN ORDER', on() { upNow(); const b = G.PL.buoys[0]; tp(b.x + 6, b.z - 7); }, tick() { const b = G.PL.buoys[G.PL.n]; steer(b.x, b.z); } },
    { d: 5.2, cap: 'AFTER BUOY 6: KICK (2) AS A WAVE REACHES YOU · BODY-SURF IN', on() { G.home = true; G.PL.n = 5; G.PL.buoys.forEach(b => b.sg.sp.visible = false); tp(0, 46); bands.length = 0; bands.push({ z: 53, pz: 53, kind: 'foam', A: 1.25, brk: 0 }); DM.k = false; }, tick() { steer(0, 0); const b = bands[0]; if (!DM.k && b && b.z - ben.z < 3.5) { DM.k = true; ben.kickCd = 0; press(2); } } },
    { d: 4, cap: 'SHIPWRECK DIVE · DIVE THROUGH THE HOLE IN THE HULL', on() { go('wreck'); tp(-10, 60); G.PL.shark.x = 20; G.PL.shark.z = 20; DM.dv = false; }, tick() { steer(-1.5, 60.2); if (!DM.dv && DM.t > 0.6) { DM.dv = true; diveNow(); } } },
    { d: 3.4, cap: 'UNDER THE ROOF YOU CANNOT COME UP · BREATHE AT THE AIR RINGS', on() { }, tick() { const d = steer(-2.6, 60.5, 0.6); if (d < 1.2 && ben.diving) press(3); } },
    { d: 6, cap: '1 · PULL THE THREE LEVERS TO OPEN THE GATE', on() { DM.li = 0; DM.lt = 0; }, tick(dt) { const L = G.PL.levers[DM.li]; if (!L) return; DM.lt += dt; if (DM.lt < 0.05) { tp(L.x + (L.x < 0 ? 1.2 : -1.2), L.z); ben.y = L.y; ben.diving = true; } steer(L.x, L.z, 0.3); if (DM.lt > 0.9 && !L.pulled) { const it = G.PL.interact(); if (it) it.act(); else { L.pulled = true; G.PL.pulled++; if (G.PL.pulled === 3) G.PL.gate.on = false; } } if (DM.lt > 1.9) { DM.li++; DM.lt = 0; } } },
    { d: 3, cap: 'THE GATE OPENS · TAKE THE PUP ON YOUR BACK', on() { G.PL.gate.on = false; tp(0, 66.8); ben.diving = false; DM.got = false; }, tick() { steer(0, 69, 0.4); if (!DM.got && DM.t > 1) { const it = G.PL.interact(); if (it) { it.act(); DM.got = true; } } } },
    { d: 5, cap: 'THE SHARK HUNTS YOU NOW · DIVE INTO THE KELP TO HIDE', on() { if (!G.PL.hasPup) { const it = G.PL.interact(); it && it.act(); } tp(-6, 38); G.PL.shark.x = 4; G.PL.shark.z = 44; G.PL.shark.st = 'idle'; ben.breath = 100; DM.dv = false; }, tick() { steer(-10, 30); if (!DM.dv && DM.t > 1.2) { DM.dv = true; diveNow(); } ben.inv = 1; } },
    { d: 4.5, cap: 'BRING HER BACK TO THE BOAT', on() { upNow(); tp(-2, 10); G.PL.shark.x = 20; G.PL.shark.z = 40; }, tick() { ben.inv = 1; steer(3, 0); } },
    { d: 3.5, cap: 'PICK A PLACE ON JIB\'S SHEET · CAVE, LAZY RIVER AND CANALS COME NEXT', on() { if (G.phase !== 'done') finish(); }, tick() { STK.x = STK.y = 0; } }];
  function demoStep(dt) { if (!DM.on) return; const s = DEMO[DM.i]; DM.t += dt; if (s.tick) s.tick(dt); G.radio = ''; if (DM.t >= s.d) { DM.i++; DM.t = 0; if (DM.i >= DEMO.length) return demoStop(); const n = DEMO[DM.i]; DM.cap = n.cap; n.on && n.on(); } }
  function demoStart() { DM.on = true; DM.i = 0; DM.t = 0; DM.cap = DEMO[0].cap; G.board = false; PAUSE = false; DEMO[0].on(); emit(); }
  function demoStop() { DM.on = false; DM.cap = ''; STK.x = STK.y = 0; G.done = null; G.board = true; PAUSE = true; G.phase = 'ready'; buildPlace(G.place); placeBen(); emit(); }
  const _hud0 = hud; hud = () => Object.assign(_hud0(), { demo: DM.on ? { cap: DM.cap, n: DM.i + 1, of: DEMO.length } : null });

  // ---------- API ----------
  const course = { boardURL: '', boardURLP: '', hud, say, rollOut, useItem, demoStart, demoStop,
    openBoard() { G.board = true; PAUSE = true; if (G.phase === 'done') G.done = null; emit(); }, closeBoard() { G.board = false; PAUSE = false; emit(); }, preview(id) { if (G.phase === 'ready' && PLACES.find(p => p.id === id && p.built)) { buildPlace(id); placeBen(); emit(); } },
    _tp(x, z) { ben.x = x; ben.z = z; ben.vx = ben.vz = 0; cam.cut = true; }, _win() { finish(); }, _dbg: () => ({ phase: G.phase, place: G.place, x: ben.x, y: ben.y, z: ben.z, breath: ben.breath, under: ben.under, wade: ben.wade, prog: G.PL.progress() }) };
  const api = { course: () => course,
    start() { rollOut(G.place); }, talk() {}, choose() {}, closeDialog() {}, nextLine() {}, clearToast() {}, closeWheel() {}, skipTime() {}, cycleWeather() {}, useItem, setHudPad() {},
    toggleSound() { audio.setMuted(!audio.muted); return audio.muted; },
    melee() { press(1); }, range() { press(2); }, jump() { press(3); },
    setPaused(v) { PAUSE = !!v || G.board; }, setStick(x, y) { STK.x = x; STK.y = y; },
    eyeLook(dx, dy) { cam.drag = true; cam.yawOff -= dx * 0.006; cam.pitchOff = clamp(cam.pitchOff - dy * 0.004, -0.4, 0.9); }, eyeRelease() { cam.drag = false; }, togglePov() { cam.vi = (cam.vi + 1) % VIEWS.length; flash('VIEW · ' + VIEWS[cam.vi], '#ffffff'); return cam.vi !== 0; },
    lookBy(dx, dy) { api.eyeLook(dx, dy); }, zoomBy(k) { cam.zoom = clamp(cam.zoom * k, 0.6, 1.8); }, getCam() { return { dist: cam.zoom * 10, pitch: cam.pitchOff }; }, setCam(d, p) { if (d != null) cam.zoom = clamp(d / 10, 0.6, 1.8); if (p != null) cam.pitchOff = p; },
    mapData() { return { p: [ben.x, ben.z, ben.yaw], indoor: false, b: [], f: [], e: jellies.map(j => [j.x, j.z]), q: null }; }, setMinimap(c) { miniC = c || null; },
    reset() {}, _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); emit(); },
    destroy() { cancelAnimationFrame(raf); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('resize', onRs); ro.disconnect(); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  buildPlace('lagoon'); placeBen(); G.phase = 'ready';
  setTimeout(paintBoards, 30); setTimeout(paintBoards, 1400);
  raf = requestAnimationFrame(frame);
  return api;
}
