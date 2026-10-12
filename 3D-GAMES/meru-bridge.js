import * as THREE from './vendor/three/three.module.js';
import { rnd, rr, pick, clamp, smooth, lerp, damp, makeGradient, glowTexture, dotTexture, Ambience } from './village-game.js';
import { emblemTex, crestTex, canvasTex, FONT } from './engine/textures.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE, HOPE_LOOK } from './fox-kit.js';
import { caneKit, loadCane } from './engine/cane.js';
import { chairKit, loadChair } from './engine/chair.js';
import { castKit, loadCastRigs } from './engine/cast.js';
import { save } from './engine/save.js';
import { ITEM_LABELS } from './worlds/meru-shops.js';

// THE BRIDGE [meruBridge] — the battle map the interrupted transport drops you on.
// Layout, gates, guards, screen, turret, cover and every prompt from surface_meru.html
// (GAYA.maps.meruBridge + GAYA.golems + updateBridgeMission / bridgeExitAsk / tickCore).
// 2D map units → metres: 60 units = 1 m, centred on the crest (2880, 2880).
const U = 60, BX = x => (x - 2880) / U, BZ = y => (y - 2880) / U, EDGE = 48;
const PLAT = [[820, 5400, 760], [1520, 4520, 620], [2880, 2880, 980], [4240, 1240, 620], [4940, 360, 760]].map(([x, y, r]) => ({ x: BX(x), z: BZ(y), r: r / U }));
const LINE = [[820, 5400], [1520, 4520], [2140, 3640], [2880, 2880], [3620, 2120], [4240, 1240], [4940, 360]].map(([x, y]) => ({ x: BX(x), z: BZ(y) }));
const HALF = 290 / U;
const LAMPS = [[1238, 5244], [878, 4958], [1476, 4945], [1116, 4658], [1919, 4353], [1543, 4088], [2130, 4054], [1754, 3789], [2556, 3542], [2227, 3221], [2808, 3284], [2478, 2963], [3296, 2782], [2967, 2461], [3548, 2524], [3218, 2203], [4019, 1953], [3643, 1688], [4230, 1654], [3854, 1389], [4658, 1084], [4298, 798], [4896, 785], [4536, 498]].map(([x, y]) => ({ x: BX(x), z: BZ(y) }));
const GATES = [{ x: 410, y: 5330, tpl: 'sentry', alt: 'charger', boss: 'wardenD' }, { x: 1230, y: 5330, tpl: 'charger', alt: 'sentry', boss: 'wardenB' }, { x: 4530, y: 430, tpl: 'charger', alt: 'sentry', boss: 'wardenB' }, { x: 5350, y: 430, tpl: 'sentry', alt: 'charger', boss: 'wardenD' }].map(g => ({ ...g, x: BX(g.x), z: BZ(g.y) }));
const COVERS = [[1190, 4260], [1190, 4780], [1850, 4260], [1850, 4780], [3910, 980], [3910, 1500], [4570, 980], [4570, 1500]].map(([x, y]) => ({ x: BX(x), z: BZ(y), r: 150 / U }));
const CORE_R = 420 / U, CORE_HP = 1600;
const TUR = { x: BX(2580), z: BZ(3180) };
const EXITS = [{ key: 'exitSouth', x: BX(820), z: 46.4 }, { key: 'exitNorth', x: BX(4940), z: -46.4 }];
const WAVES = 2, BONUS = 100;
// GAYA.golems, speeds/reaches converted to metres and seconds; damage to the fox scaled to his 100 HP (2D 168)
const SPEC = {
  sentry: { name: 'Sink Sentry', kind: 'drone', hp: 80, speed: 2.2, dmg: 5, coreDmg: 9, reach: 520 / U, windup: 34 / 60, cool: 96 / 60, size: 1.05, fly: 2.0 },
  wardenD: { name: 'Sink Warden', kind: 'drone', boss: true, hp: 340, speed: 1.9, dmg: 10, coreDmg: 17, reach: 760 / U, windup: 46 / 60, cool: 110 / 60, size: 1.7, fly: 3.2 },
  charger: { name: 'Sink Charger', kind: 'bot', hp: 110, speed: 3.3, dmg: 11, coreDmg: 18, reach: 124 / U, windup: 42 / 60, cool: 118 / 60, size: 1.05 },
  wardenB: { name: 'Sink Warden', kind: 'bot', boss: true, hp: 420, speed: 2.3, dmg: 18, coreDmg: 30, reach: 170 / U, windup: 54 / 60, cool: 140 / 60, size: 1.75 },
};
const DMG = { RAYGUN: 15, SWORD: 25 }, COST = { RAYGUN: 5 };
const segD = (px, pz, a, b) => { const dx = b.x - a.x, dz = b.z - a.z, L = dx * dx + dz * dz; const t = clamp(((px - a.x) * dx + (pz - a.z) * dz) / L, 0, 1); return { d: Math.hypot(px - a.x - dx * t, pz - a.z - dz * t), x: a.x + dx * t, z: a.z + dz * t }; };
function walkable(x, z, pad = 0.45) {
  if (Math.abs(x) > EDGE - pad || Math.abs(z) > EDGE - pad) return false;
  for (const p of PLAT) if (Math.hypot(x - p.x, z - p.z) < p.r - pad) return true;
  for (let i = 0; i < LINE.length - 1; i++) if (segD(x, z, LINE[i], LINE[i + 1]).d < HALF - pad) return true;
  return false;
}
function nearestOnLine(x, z) { let best = null; for (let i = 0; i < LINE.length - 1; i++) { const s = segD(x, z, LINE[i], LINE[i + 1]); if (!best || s.d < best.d) best = s; } return best; }
const inCircle = (x, z, m = 0) => PLAT.some(p => Math.hypot(x - p.x, z - p.z) < p.r + m);

export async function createBridge({ container, options = {}, onState = () => {}, onNavigate = () => {} }) {
  const opts = { quality: 'high', outlines: true, followCam: true, ...options };
  const LOW = opts.quality === 'low', OL = v => LOW ? 0 : v;
  try { await document.fonts.load('900 40px Archivo'); } catch (e) {}
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, LOW ? 1 : 2)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = !LOW; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(58, W() / H(), 0.1, 900);
  scene.background = new THREE.Color(0x03060a); scene.fog = new THREE.FogExp2(0x050b14, 0.0075);
  const grad = makeGradient(), glowTex = glowTexture(), dotTex = dotTexture();
  const cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x0a0d14, side: THREE.BackSide }); outlineMat.visible = !!opts.outlines;
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = !LOW; m.receiveShadow = true; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const { makeFox, animFox } = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const cast = castKit({ THREE, M, toon, makeFox }, await loadCastRigs());
  const glowSprite = (x, y, z, color, size, op = 0.8, parent) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op })); s.position.set(x, y, z); s.scale.setScalar(size); (parent || scene).add(s); return s; };
  const basic = (c, o = 1, add) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1 || !!add, opacity: o, depthWrite: !(o < 1 || add), blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide });
  const flat = (geo, mat, x, y, z, parent) => { const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); (parent || scene).add(m); return m; };

  // ---------- light + void ----------
  scene.add(new THREE.HemisphereLight(0x9cc4e8, 0x141a26, 1.05));
  const key = new THREE.DirectionalLight(0xd8ecff, 1.15); key.position.set(-20, 40, 15); key.castShadow = !LOW;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 120 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.04; scene.add(key, key.target);
  { const n = LOW ? 900 : 1800, sp = []; for (let i = 0; i < n; i++) { const u = rnd() * 6.283, v = Math.acos(rr(-1, 1)), r = 420; sp.push(Math.sin(v) * Math.cos(u) * r, Math.cos(v) * r, Math.sin(v) * Math.sin(u) * r); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); const st = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xdbeaff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })); scene.add(st); var stars = st; }
  for (let i = 0; i < 9; i++) { const s = glowSprite(rr(-90, 90), rr(-110, -50), rr(-90, 90), pick([0x173a5e, 0x1d2a55, 0x123447]), rr(110, 200), 0.32); s.material.fog = false; }

  // ---------- the deck (from the 2D art: five platforms on one span) ----------
  const deckM = toon('#3d4654'), innerM = toon('#4a5566'), underM = toon('#232a35'), keelM = toon('#2c3440'), edgeM = basic(0xbfe6ff), seamM = toon('#2f3744');
  const clipPts = (cx, cz, r, lim = EDGE, N = 80) => { const pts = []; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; pts.push(new THREE.Vector2(cx + Math.cos(a) * r, -clamp(cz + Math.sin(a) * r, -lim, lim))); } return pts; };
  const shapeGeo = (pts, hole) => { const sh = new THREE.Shape(pts); if (hole) sh.holes.push(new THREE.Path(hole)); const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); return g; };
  for (const p of PLAT) {
    const ex = new THREE.ExtrudeGeometry(new THREE.Shape(clipPts(p.x, p.z, p.r)), { depth: 1.2, bevelEnabled: false }); ex.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(ex, deckM); m.position.y = -1.2; m.receiveShadow = true; scene.add(m);
    const inner = new THREE.Mesh(shapeGeo(clipPts(p.x, p.z, p.r * 0.72)), innerM); inner.position.y = 0.012; inner.receiveShadow = true; scene.add(inner);
    const rim = new THREE.Mesh(shapeGeo(clipPts(p.x, p.z, p.r + 0.02), clipPts(p.x, p.z, p.r - 0.16, EDGE - 0.16)), edgeM); rim.position.y = 0.025; scene.add(rim);
    const lat = new THREE.Mesh(new THREE.LatheGeometry([[0, -12.5], [p.r * 0.18, -10], [p.r * 0.45, -6], [p.r * 0.8, -2.4], [p.r * 0.97, -1.2]].map(([r, y]) => new THREE.Vector2(r, y)), 40), underM); lat.position.set(p.x, 0, p.z); scene.add(lat);
    glowSprite(p.x, -12.5, p.z, 0x7fe3ff, 7, 0.75);
  }
  const seamPos = [];
  for (let i = 0; i < LINE.length - 1; i++) {
    const a = LINE[i], b = LINE[i + 1], dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz), ang = Math.atan2(dx, dz), nx = dz / L, nz = -dx / L;
    const sp = M(BOX(HALF * 2, 1.0, L), deckM, (a.x + b.x) / 2, -0.51, (a.z + b.z) / 2, null, 0); sp.rotation.y = ang; sp.castShadow = false;
    const kl = M(BOX(HALF, 1.6, L), keelM, (a.x + b.x) / 2, -1.6, (a.z + b.z) / 2, null, 0); kl.rotation.y = ang; kl.castShadow = false;
    for (const side of [-1, 1]) { let run = null; const N = 80; for (let k = 0; k <= N; k++) { const t = k / N, x = a.x + dx * t + nx * side * (HALF - 0.08), z = a.z + dz * t + nz * side * (HALF - 0.08), out = !inCircle(x, z, -0.05); if (out && !run) run = t; if ((!out || k === N) && run != null) { const t1 = t; if (t1 - run > 0.01) { const mx = a.x + dx * (run + t1) / 2 + nx * side * (HALF - 0.08), mz = a.z + dz * (run + t1) / 2 + nz * side * (HALF - 0.08), e = new THREE.Mesh(BOX(0.16, 0.05, L * (t1 - run)), edgeM); e.position.set(mx, 0, mz); e.rotation.y = ang; scene.add(e); } run = null; } } }
    for (let s = 1.3; s < L; s += 2.6) { const x = a.x + dx * s / L, z = a.z + dz * s / L; if (!inCircle(x, z, 0.4)) seamPos.push([x, z, ang]); }
  }
  for (const i of [2, 4]) { const j = M(new THREE.CylinderGeometry(HALF, HALF, 1.0, 32), deckM, LINE[i].x, -0.51, LINE[i].z, null, 0); j.castShadow = false; }
  { const im = new THREE.InstancedMesh(BOX(HALF * 2 - 0.7, 0.03, 0.12), seamM, seamPos.length), o = new THREE.Object3D(); seamPos.forEach(([x, z, a], i) => { o.position.set(x, 0.0, z); o.rotation.set(0, a, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.receiveShadow = true; scene.add(im); }
  // lamps line every span (anchors.lamps); cyan flame, like the 2D emitters
  const lampSprites = [];
  { const post = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.11, 2.4, 8), toon('#3d3d3d'), LAMPS.length), head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 12, 8), toon('#e8c06a', { emissive: new THREE.Color('#e8c06a'), emissiveIntensity: 0.6 }), LAMPS.length), o = new THREE.Object3D();
    LAMPS.forEach((l, i) => { o.position.set(l.x, 1.2, l.z); o.updateMatrix(); post.setMatrixAt(i, o.matrix); o.position.y = 2.52; o.updateMatrix(); head.setMatrixAt(i, o.matrix); lampSprites.push({ s: glowSprite(l.x, 2.55, l.z, 0x7fe3ff, 2.4, 0.7), ph: rnd() * 9, hz: 5 + (i % 3) }); });
    post.castShadow = !LOW; scene.add(post, head); }

  // ---------- the screen (core) at the crest ----------
  flat(new THREE.RingGeometry(10.2, 10.45, 96), basic(0x7cff9b, 0.3), 0, 0.03, 0);
  flat(new THREE.CircleGeometry(CORE_R, 72), toon('#0d1a24'), 0, 0.02, 0);
  const screenRing = flat(new THREE.RingGeometry(CORE_R - 0.12, CORE_R + 0.12, 96), basic(0x7cff9b), 0, 0.035, 0);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, t = new THREE.Mesh(BOX(0.16, 0.02, 2.5), basic(0x7cff9b, 0.4)); t.position.set(Math.sin(a) * 8.45, 0.03, Math.cos(a) * 8.45); t.rotation.y = a; scene.add(t); }
  const crest = flat(new THREE.CircleGeometry(1.7, 48), new THREE.MeshToonMaterial({ map: emblemTex('M', { outer: '#c98a3c', ring: '#f0b866', bg: '#0c1038', stroke: '#7dd3fc' }), gradientMap: grad, emissive: 0xffffff, emissiveIntensity: 0.15, transparent: true }), 0, 0.045, 0);
  const domeMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, uniforms: { uOp: { value: 1 }, uHit: { value: 0 }, uT: { value: 0 }, uCol: { value: new THREE.Color(0x7fe3ff) } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vY; void main(){ vec4 w = modelMatrix*vec4(position,1.); vN = normalize(mat3(modelMatrix)*normal); vV = normalize(cameraPosition - w.xyz); vY = position.y; gl_Position = projectionMatrix*viewMatrix*w; }',
    fragmentShader: 'uniform float uOp; uniform float uHit; uniform float uT; uniform vec3 uCol; varying vec3 vN; varying vec3 vV; varying float vY; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.4); float band = smoothstep(0.92, 1.0, sin(vY*3.0 - uT*2.0)) * 0.18; float a = (0.04 + f*0.55 + band + uHit*0.35) * uOp; gl_FragColor = vec4(mix(uCol, vec3(1.0,0.36,0.36), uHit), a); }' });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(CORE_R, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), domeMat); dome.renderOrder = 5; scene.add(dome);
  const coreLight = new THREE.PointLight(0x7cff9b, 22, 24, 2); coreLight.position.set(0, 3, 0); scene.add(coreLight);
  const gunG = new THREE.Group(); scene.add(gunG); M(new THREE.CylinderGeometry(0.9, 1.15, 0.7, 12), toon('#2c333b'), 0, 0.35, 0, gunG, OL(0.03), 1.15);
  const gunHead = new THREE.Group(); gunHead.position.y = 1.0; gunG.add(gunHead); M(BOX(1.0, 0.55, 1.0), toon('#59626d'), 0, 0, 0, gunHead, OL(0.03));
  for (const s of [-1, 1]) { const b = M(new THREE.CylinderGeometry(0.08, 0.1, 1.3, 8), toon('#2c333b'), s * 0.26, 0.05, 0.75, gunHead, 0); b.rotation.x = Math.PI / 2; }
  M(BOX(0.5, 0.08, 0.06), basic(0x7cff9b), 0, 0.18, 0.51, gunHead, 0); gunG.position.y = -1.6;

  // ---------- gates, cover, turret, exits ----------
  const gateDark = toon('#2a2230'), gateRed = () => new THREE.MeshToonMaterial({ color: '#ff5c5c', gradientMap: grad, emissive: new THREE.Color('#ff5c5c'), emissiveIntensity: 1.2 });
  function hpBar(w = 1.6) { const c = document.createElement('canvas'); c.width = 128; c.height = 16; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(w, w / 8, 1); s.renderOrder = 8; scene.add(s); const bar = { s, v: -1, set(fr, col = '#ec3013') { fr = clamp(fr, 0, 1); if (Math.abs(fr - bar.v) < 0.004) return; bar.v = fr; const g = c.getContext('2d'); g.fillStyle = '#201e1d'; g.fillRect(0, 0, 128, 16); g.fillStyle = '#f3f2f2'; g.fillRect(3, 3, 122, 10); g.fillStyle = col; g.fillRect(3, 3, 122 * fr, 10); t.needsUpdate = true; } }; bar.set(1); return bar; }
  const gates = GATES.map((d, i) => {
    const g = new THREE.Group(); g.position.set(d.x, 0, d.z); g.rotation.y = Math.atan2(-d.x, -d.z); scene.add(g);
    flat(new THREE.CircleGeometry(250 / U, 48), basic(0xff5c5c, 0.13), 0, 0.04, 0, g); flat(new THREE.RingGeometry(250 / U - 0.2, 250 / U, 64), basic(0xff5c5c, 0.7), 0, 0.045, 0, g);
    M(new THREE.CylinderGeometry(1.35, 1.6, 0.4, 6), gateDark, 0, 0.2, 0, g, OL(0.03), 1.6);
    for (const s of [-1, 1]) { M(BOX(0.45, 4.2, 0.5), gateDark, s * 1.55, 2.3, 0, g, OL(0.03)); M(BOX(0.12, 3.6, 0.52), gateRed(), s * 1.3, 2.3, 0, g, 0); }
    M(BOX(3.6, 0.5, 0.55), gateDark, 0, 4.45, 0, g, OL(0.03));
    const field = new THREE.Mesh(new THREE.PlaneGeometry(2.45, 3.7), basic(0xff3b30, 0.45, true)); field.position.y = 2.35; g.add(field);
    const glow = glowSprite(0, 2.3, 0, 0xff5c5c, 5, 0.6, g);
    const bar = hpBar(2.2);
    return { i, kind: 'gate', name: 'Gate', ...d, g, field, glow, bar, y: 0, hp: 90, max: 90, dead: false, hit: 0, next: 4, every: 4, born: 0 };
  });
  for (const c of COVERS) { M(new THREE.CylinderGeometry(c.r * 0.82, c.r * 0.9, 1.5, 8), toon('#596273'), c.x, 0.75, c.z, null, OL(0.04), c.r * 0.9); M(new THREE.CylinderGeometry(c.r * 0.84, c.r * 0.84, 0.14, 8), toon('#e8c06a'), c.x, 1.45, c.z, null, 0); }
  const TU = { ...TUR, ang: Math.PI, shield: 155, max: 155, dead: false, cool: 0, g: new THREE.Group(), head: new THREE.Group() };
  TU.g.position.set(TU.x, 0, TU.z); scene.add(TU.g); M(new THREE.CylinderGeometry(0.8, 1.0, 0.7, 12), toon('#4a5566'), 0, 0.35, 0, TU.g, OL(0.03), 1.0);
  flat(new THREE.RingGeometry(1.25, 1.4, 40), basic(0x7fe3ff, 0.7), 0, 0.04, 0, TU.g);
  TU.head.position.y = 1.15; TU.g.add(TU.head); M(BOX(1.1, 0.6, 1.0), toon('#6b7686'), 0, 0, 0, TU.head, OL(0.03)); M(BOX(0.9, 0.12, 0.5), toon('#2c333b'), 0, -0.1, -0.7, TU.head, OL(0.02));
  for (const s of [-1, 1]) { const b = M(new THREE.CylinderGeometry(0.09, 0.09, 1.4, 8), toon('#2c333b'), s * 0.25, 0.05, 0.9, TU.head, 0); b.rotation.x = Math.PI / 2; }
  const exitTex = canvasTex(256, 96, g => { g.fillStyle = '#0b1220'; g.fillRect(0, 0, 256, 96); g.strokeStyle = '#7fe3ff'; g.lineWidth = 8; g.strokeRect(6, 6, 244, 84); g.font = `900 56px ${FONT}`; g.fillStyle = '#e6f6ff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('EXIT', 128, 52); });
  for (const e of EXITS) { const g = new THREE.Group(); g.position.set(e.x, 0, e.z); scene.add(g); for (const s of [-1, 1]) M(BOX(0.5, 4.6, 0.5), toon('#3d4654'), s * 3.4, 2.3, 0, g, OL(0.03)); M(BOX(7.3, 0.5, 0.5), toon('#3d4654'), 0, 4.75, 0, g, OL(0.03));
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.9), new THREE.MeshBasicMaterial({ map: exitTex, side: THREE.DoubleSide })); sign.position.set(0, 4.75, 0.28 * Math.sign(-e.z)); sign.rotation.y = e.z > 0 ? Math.PI : 0; g.add(sign);
    const sign2 = sign.clone(); sign2.position.z *= -1; sign2.rotation.y += Math.PI; g.add(sign2);
    flat(new THREE.RingGeometry(2.6, 2.85, 48), basic(0x7fe3ff, 0.8), 0, 0.04, -Math.sign(e.z) * 1.6, g); glowSprite(0, 2.4, 0, 0x7fe3ff, 6, 0.35, g); }

  // ---------- fx ----------
  const sparkN = 320, sparkArr = new Float32Array(sparkN * 3), sparkV = Array.from({ length: sparkN }, () => ({ v: new THREE.Vector3(), life: 0 }));
  const sparkGeo = new THREE.BufferGeometry(); sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkArr, 3)); sparkArr.fill(-999);
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: 0xffd38a, map: dotTex, size: 0.16, transparent: true, depthWrite: false, alphaTest: 0.1, blending: THREE.AdditiveBlending })); sparks.frustumCulled = false; scene.add(sparks); let sparkI = 0;
  function burst(p, n = 16, speed = 6) { for (let k = 0; k < n; k++) { const s = sparkV[sparkI]; s.life = rr(0.25, 0.6); s.v.set(rr(-1, 1), rr(0.2, 1.4), rr(-1, 1)).normalize().multiplyScalar(rr(0.4, 1) * speed); sparkArr.set([p.x, p.y, p.z], sparkI * 3); sparkI = (sparkI + 1) % sparkN; } }
  const popups = [];
  function popup(p, text, color = '#ffffff') {
    const t = canvasTex(256, 96, (g) => { g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#0a0d14'; g.strokeText(text, 128, 50); g.fillStyle = color; g.fillText(text, 128, 50); });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.position.copy(p); s.scale.set(1.6, 0.6, 1); s.renderOrder = 10; scene.add(s); popups.push({ s, t: 0 });
  }
  const bolts = [], beams = [], rockets = [];
  const boltGeo = new THREE.CapsuleGeometry(0.06, 0.7, 3, 6); boltGeo.rotateX(Math.PI / 2);
  const boltMat = new THREE.MeshBasicMaterial({ color: 0x9ff3ff }), beamMat = new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const aimMat = new THREE.MeshBasicMaterial({ color: 0xff6b5a, transparent: true, opacity: 0.5, depthWrite: false });
  const rocketGeo = new THREE.BoxGeometry(0.16, 0.16, 0.6), rocketMat = new THREE.MeshBasicMaterial({ color: 0xffb35c });
  // the transport beam
  const beamCol = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 16, 28, 1, true), new THREE.MeshBasicMaterial({ color: 0x7fe3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); beamCol.position.y = 8; scene.add(beamCol);
  const moteArr = new Float32Array(26 * 3), moteGeo = new THREE.BufferGeometry(); moteGeo.setAttribute('position', new THREE.BufferAttribute(moteArr, 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: 0xcff6ff, map: dotTex, size: 0.32, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); motes.frustumCulled = false; scene.add(motes);
  const MOTES = Array.from({ length: 26 }, (_, i) => ({ a: i / 26 * Math.PI * 2, r: 0.22 + ((i * 37) % 100) / 140, sp: 0.55 + ((i * 53) % 100) / 190, ph: ((i * 71) % 100) / 100 }));

  const UPV = new THREE.Vector3(0, 1, 0);
  const debris = [], debGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
  function breakApart(f) { const n = f.boss ? 16 : 9, mats = [metal, metalD, metalK, toon('#c3cbd4')]; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(debGeo, pick(mats)); const sc = rr(0.6, 1.6) * f.s.size; m.scale.set(sc, sc * rr(0.5, 1.2), sc); m.position.set(f.x + rr(-0.4, 0.4), f.y + (f.kind === 'drone' ? 0 : rr(0.4, 1.8) * f.s.size), f.z + rr(-0.4, 0.4)); m.castShadow = !LOW; scene.add(m); debris.push({ m, v: new THREE.Vector3(rr(-1, 1) * 5, rr(3, 8), rr(-1, 1) * 5), r: new THREE.Vector3(rr(-9, 9), rr(-9, 9), rr(-9, 9)), t: 0 }); } puff(f.x, f.y + 0.8, f.z, f.boss ? 4 : 2.4); }
  function updateDebris(dt) { for (let i = debris.length - 1; i >= 0; i--) { const d = debris[i], p = d.m.position; d.t += dt; d.v.y -= 18 * dt; p.addScaledVector(d.v, dt); if (p.y < 0.1 && walkable(p.x, p.z, 0)) { p.y = 0.1; d.v.y *= -0.3; d.v.x *= 0.6; d.v.z *= 0.6; d.r.multiplyScalar(0.7); } d.m.rotation.x += d.r.x * dt; d.m.rotation.y += d.r.y * dt; d.m.rotation.z += d.r.z * dt; if (d.t > 2.2) d.m.scale.multiplyScalar(0.9); if (d.t > 2.8 || p.y < -30) { scene.remove(d.m); debris.splice(i, 1); } } }
  const smokeMat = new THREE.SpriteMaterial({ map: glowTex, color: 0x5b6472, transparent: true, depthWrite: false, opacity: 0 }), smokes = [];
  function puff(x, y, z, sz = 1.8) { if (smokes.length > 40) return; const sp = new THREE.Sprite(smokeMat.clone()); sp.position.set(x, y, z); sp.scale.setScalar(sz); scene.add(sp); smokes.push({ sp, t: 0, sz }); }
  function updateSmoke(dt) { for (let i = smokes.length - 1; i >= 0; i--) { const s = smokes[i]; s.t += dt; s.sp.position.y += dt * 1.1; s.sp.scale.setScalar(s.sz * (1 + s.t * 0.8)); s.sp.material.opacity = 0.5 * Math.min(1, s.t * 4) * (1 - s.t / 2.4); if (s.t > 2.4) { scene.remove(s.sp); smokes.splice(i, 1); } } }
  const skyGeo = new THREE.CylinderGeometry(0.45, 0.9, 70, 12, 1, true), skyBeams = [];
  function skyBeam(x, z) { const m = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.position.set(x, 35, z); scene.add(m); const ring = flat(new THREE.RingGeometry(0.6, 1.2, 32), basic(0xff5c5c, 0.9, true), x, 0.06, z); skyBeams.push({ m, ring, t: 0 }); burst(v3.set(x, 1, z), 16, 6); audio.tone(140, 0.3, 0.04, 'sawtooth', 3); }
  function updateSkyBeams(dt) { for (let i = skyBeams.length - 1; i >= 0; i--) { const b = skyBeams[i]; b.t += dt; const k = b.t / 0.75; b.m.material.opacity = 0.9 * (1 - k); b.m.scale.set(1 - k * 0.6, 1, 1 - k * 0.6); b.ring.scale.setScalar(1 + k * 3); b.ring.material.opacity = 0.9 * (1 - k); if (k >= 1) { scene.remove(b.m); scene.remove(b.ring); skyBeams.splice(i, 1); } } }
  const telMat = () => new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const discGeo = new THREE.CircleGeometry(1, 40), edgeGeo = new THREE.RingGeometry(0.93, 1, 48), stripGeo = new THREE.PlaneGeometry(1, 1); stripGeo.translate(0, 0.5, 0);
  function telOf(f) { if (f.tel) return f.tel; const disc = new THREE.Group(), fill = new THREE.Mesh(discGeo, telMat()), edge = new THREE.Mesh(edgeGeo, telMat()); fill.rotation.x = edge.rotation.x = -Math.PI / 2; edge.position.y = 0.005; disc.add(fill, edge); scene.add(disc); const strip = new THREE.Group(), sm = new THREE.Mesh(stripGeo, telMat()); sm.rotation.x = Math.PI / 2; strip.add(sm); scene.add(strip); disc.visible = strip.visible = false; f.tel = { disc, fill, edge, strip, sm }; return f.tel; }
  const hideTel = f => { if (f.tel) f.tel.disc.visible = f.tel.strip.visible = false; };
  const clearAim = f => { (f.aimLines || []).forEach(a => scene.remove(a)); (f.strips || []).forEach(g => scene.remove(g)); f.aimLines = f.strips = null; };
  const waveMat = new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), waves = [];
  function shockwave(x, z, dmg = 12, speed = 9, max = 13) { const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 64), waveMat.clone()); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.08, z); scene.add(m); const wall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.5, 64, 1, true), waveMat.clone()); wall.position.set(x, 0.25, z); scene.add(wall); waves.push({ m, wall, x, z, r: 0.5, speed, max, dmg, hit: false }); St.shake = Math.max(St.shake, 0.5); audio.burst(0.4, 300, 0.3); audio.tone(70, 0.5, 0.08, 'sine', 0.6); }
  function updateWaves(dt) { for (let i = waves.length - 1; i >= 0; i--) { const w = waves[i]; w.r += w.speed * dt; w.m.scale.setScalar(w.r); w.wall.scale.set(w.r, 1, w.r); const fade = 1 - w.r / w.max; w.m.material.opacity = 0.85 * fade; w.wall.material.opacity = 0.5 * fade; const px = P.inTurret ? TU.x : P.x, pz = P.inTurret ? TU.z : P.z, d = Math.hypot(px - w.x, pz - w.z);
      if (!w.hit && Math.abs(d - w.r) < 0.55) { if ((P.inTurret || P.y < 0.45) && P.dash <= 0) { w.hit = true; hurtPlayer(w.dmg, w); } else if (!w.cleared) { w.cleared = true; popup(v3.set(P.x, 2.6, P.z), 'CLEARED', '#ffd76a'); addSuper(6); } }
      if (w.r > w.max) { scene.remove(w.m); scene.remove(w.wall); waves.splice(i, 1); } } }
  const vign = document.createElement('div'); vign.style.cssText = 'position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 160px 40px rgba(236,48,19,0.9);opacity:0;'; container.append(vign);
  const FEEL = { RAYGUN: [0.02, 0.1, 0.03], SWORD: [0.07, 0.28, 0.12], SWORD3: [0.12, 0.5, 0.25], TURRET: [0.035, 0.3, 0.14], SHOE: [0.02, 0.08, 0.06], CANE: [0.06, 0.24, 0.1], BURST: [0.12, 0.6, 0.4], CORE: [0, 0, 0] };
  function feel(w) { if (w === 'SWORD' && P.combo === 3) w = 'SWORD3'; const f = FEEL[w] || FEEL.RAYGUN; St.hitStop = Math.max(St.hitStop, f[0]); St.kick = Math.min(1, (St.kick || 0) + f[1]); St.shake = Math.max(St.shake, f[2]); }
  const MUS = { next: 0, step: 0 };
  function musicTick() {
    const ctx = audio.ctx; if (!ctx || !audio.master) return;
    if (!MUS.gain) { MUS.gain = ctx.createGain(); MUS.gain.gain.value = 0; MUS.filt = ctx.createBiquadFilter(); MUS.filt.type = 'lowpass'; MUS.filt.frequency.value = 800; MUS.filt.Q.value = 4; MUS.filt.connect(MUS.gain); MUS.gain.connect(audio.master); MUS.next = ctx.currentTime + 0.1; }
    const playing = St.beamDone && !St.done && !St.defeated, low = playing && P.hp < 30, fight = WV.state === 'fight', now = ctx.currentTime;
    MUS.gain.gain.setTargetAtTime(St.muted || !playing ? 0 : fight ? 0.2 : 0.12, now, 0.5);
    MUS.filt.frequency.setTargetAtTime(low ? 380 : fight ? 1500 : 650, now, 0.4);
    if (MUS.next < now) MUS.next = now + 0.05;
    const spb = 60 / 112 / 2, bass = low ? [55, 55, 58.27, 55, 55, 55, 58.27, 51.91] : [55, 55, 65.41, 55, 49, 55, 82.41, 73.42];
    while (MUS.next < now + 0.2) { const t = MUS.next, st = MUS.step % 16;
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = bass[st % 8]; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + spb * 0.9); o.connect(g); g.connect(MUS.filt); o.start(t); o.stop(t + spb);
      const kick = (v) => { const k = ctx.createOscillator(), kg = ctx.createGain(); k.frequency.setValueAtTime(120, t); k.frequency.exponentialRampToValueAtTime(42, t + 0.18); kg.gain.setValueAtTime(v, t); kg.gain.exponentialRampToValueAtTime(0.001, t + 0.25); k.connect(kg); kg.connect(MUS.gain); k.start(t); k.stop(t + 0.3); };
      if (low ? (st % 8 === 0 || st % 8 === 1) : st % 4 === 0) kick(low ? 0.9 : 0.7);
      if (fight && !low && st % 2 === 1 && audio.noise) { const n = ctx.createBufferSource(); n.buffer = audio.noise; const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000; const ng = ctx.createGain(); ng.gain.setValueAtTime(0.12, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.05); n.connect(hp); hp.connect(ng); ng.connect(MUS.gain); n.start(t); n.stop(t + 0.06); }
      if (low && st === 8 && !St.muted) { const a = ctx.createOscillator(), ag = ctx.createGain(); a.type = 'square'; a.frequency.value = 880; ag.gain.setValueAtTime(0.05, t); ag.gain.exponentialRampToValueAtTime(0.001, t + 0.3); a.connect(ag); ag.connect(audio.master); a.start(t); a.stop(t + 0.32); }
      MUS.next += spb; MUS.step++; }
  }
  // ---------- the fox ----------
  const fox = cast.make('player');
  const FP = fox.userData.P, hand = FP.arms[1], gunArm = FP.arms[0], sword = FP.sword, gun = FP.gun;
  const muzzle = new THREE.Object3D(); muzzle.position.set(0, 0.16, 0.7); gun.add(muzzle);
  const flash = glowSprite(0, 0.16, 0.72, 0x9ff3ff, 0.9, 0, gun);
  const trailMat = new THREE.MeshBasicMaterial({ color: 0x9ff3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const trail = new THREE.Mesh(new THREE.RingGeometry(0.7, 2.1, 32, 1, -1.25, 2.5), trailMat); trail.rotation.x = -Math.PI / 2; trail.position.y = 1.0; fox.add(trail);
  const reticle = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.7, 32), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.85, depthTest: false, side: THREE.DoubleSide })); reticle.renderOrder = 9; scene.add(reticle);

  // ---------- machines (the arena's drone and robot, in the Sink's colours) ----------
  const metal = toon('#8b95a1'), metalD = toon('#59626d'), metalK = toon('#2c333b'), redEye = () => new THREE.MeshToonMaterial({ color: '#ff3b30', gradientMap: grad, emissive: new THREE.Color('#ff3b30'), emissiveIntensity: 1.6 });
  function hitable(g) { const mats = []; g.traverse(o => { if (o.isMesh && o.material !== outlineMat && o.material.emissive && !o.userData.keep) { o.material = o.material.clone(); mats.push(o.material); } }); return mats; }
  function makeDrone(s) {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const shell = s.boss ? toon('#4b5162') : metal;
    M(new THREE.CylinderGeometry(0.62, 0.72, 0.32, 20), shell, 0, 0, 0, body, OL(0.03), 0.72);
    M(new THREE.SphereGeometry(0.42, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), metalD, 0, 0.14, 0, body, OL(0.03), 0.42);
    M(new THREE.CylinderGeometry(0.5, 0.36, 0.22, 20), metalK, 0, -0.26, 0, body, OL(0.025), 0.5);
    const eye = M(new THREE.SphereGeometry(0.17, 14, 10), redEye(), 0, 0, 0.62, body, OL(0.02), 0.17); eye.userData.keep = true; eye.scale.z = 0.6;
    glowSprite(0, 0, 0.7, 0xff3b30, 0.9, 0.9, body);
    const rotors = [];
    for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + Math.PI / 4, x = Math.sin(a) * 0.82, z = Math.cos(a) * 0.82; M(BOX(0.42, 0.06, 0.08), metalK, Math.sin(a) * 0.62, 0.06, Math.cos(a) * 0.62, body, 0).rotation.y = a + Math.PI / 2; M(new THREE.TorusGeometry(0.26, 0.035, 6, 20), metalD, x, 0.08, z, body, 0).rotation.x = Math.PI / 2; const r = new THREE.Group(); r.position.set(x, 0.1, z); body.add(r); M(BOX(0.46, 0.015, 0.07), toon('#c3cbd4'), 0, 0, 0, r, 0); M(BOX(0.07, 0.015, 0.46), toon('#c3cbd4'), 0, 0, 0, r, 0); rotors.push(r); }
    if (s.boss) { const cr = M(new THREE.TorusGeometry(0.3, 0.06, 6, 6), redEye(), 0, 0.5, 0, body, 0); cr.rotation.x = Math.PI / 2; cr.userData.keep = true; }
    g.scale.setScalar(s.size); scene.add(g); return { g, body, rotors, mats: hitable(g) };
  }
  function makeRobot(s) {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const steel = toon(s.boss ? '#8790a8' : '#c3cbd4'), steelD = toon('#7d8792'), dark = toon('#3b434c');
    const legs = [-1, 1].map(sx => { const p = new THREE.Group(); p.position.set(sx * 0.2, 0.75, 0); body.add(p); M(BOX(0.2, 0.62, 0.24), steelD, 0, -0.32, 0, p, OL(0.025)); M(BOX(0.28, 0.14, 0.4), dark, 0, -0.68, 0.06, p, OL(0.02)); return p; });
    M(BOX(0.78, 0.7, 0.5), steel, 0, 1.16, 0, body, OL(0.035)); M(BOX(0.62, 0.22, 0.44), steelD, 0, 0.74, 0, body, OL(0.025));
    const core = M(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 16), new THREE.MeshToonMaterial({ color: '#ff5c5c', gradientMap: grad, emissive: new THREE.Color('#ff5c5c'), emissiveIntensity: 1.3 }), 0, 1.2, 0.26, body, 0); core.rotation.x = Math.PI / 2;
    const head = new THREE.Group(); head.position.y = 1.72; body.add(head);
    M(BOX(0.46, 0.36, 0.42), steel, 0, 0, 0, head, OL(0.03)); const visor = M(BOX(0.38, 0.1, 0.05), new THREE.MeshToonMaterial({ color: '#5fe3ff', gradientMap: grad, emissive: new THREE.Color('#5fe3ff'), emissiveIntensity: 1.6 }), 0, 0.02, 0.22, head, 0);
    const armL = new THREE.Group(); armL.position.set(-0.5, 1.4, 0); body.add(armL); M(BOX(0.18, 0.62, 0.2), steelD, 0, -0.28, 0, armL, OL(0.022));
    if (s.boss) { const sh = M(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 6), dark, 0, -0.42, 0.22, armL, OL(0.03), 0.5); sh.rotation.x = Math.PI / 2; const cr = M(new THREE.TorusGeometry(0.26, 0.05, 6, 6), redEye(), 0, 0.3, 0, head, 0); cr.rotation.x = Math.PI / 2; cr.userData.keep = true; }
    const armR = new THREE.Group(); armR.position.set(0.5, 1.4, 0); body.add(armR); M(BOX(0.18, 0.62, 0.2), steelD, 0, -0.28, 0, armR, OL(0.022));
    const rb = new THREE.Group(); rb.position.set(0, -0.6, 0.05); armR.add(rb); M(BOX(0.08, 0.22, 0.08), dark, 0, 0, 0, rb, 0); const rbl = M(BOX(0.08, 1.0, 0.03), new THREE.MeshToonMaterial({ color: '#ffd0cc', gradientMap: grad, emissive: new THREE.Color('#ff3b30'), emissiveIntensity: 0.4 }), 0, 0.6, 0, rb, 0); rb.rotation.x = Math.PI / 2;
    const warn = new THREE.Mesh(new THREE.RingGeometry(0.4, 2.0, 32, 1, -Math.PI / 2 - 0.95, 1.9), new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); warn.rotation.x = -Math.PI / 2; warn.position.y = 0.04; g.add(warn);
    g.scale.setScalar(s.size); scene.add(g); return { g, body, legs, head, armL, armR, warn, bladeMat: rbl.material, visorMat: visor.material, mats: hitable(g) };
  }

  // ---------- state ----------
  const isPhone = () => Math.min(W(), H()) < 520;
  const St = { t: 0, yaw: -0.63, pitch: 0.5, dist: 9.5, prompt: null, briefed: false, beam: null, beamDone: false, leaving: false, done: false, defeated: false, cleared: false, asked: false, exitAsked: false, shake: 0, hitStop: 0, slow: 0, muted: false, callout: null, note: null, toast: null, lock: null, soft: null, held: false, attackQueued: false };
  const P = { x: 0, z: 0, y: 0, vx: 0, vz: 0, vy: 0, face: 2.51, ground: true, hp: 100, en: 100, enT: 0, inv: 0, hurt: 0, weapon: 'RAYGUN', fireCd: 0, swing: 0, swingDur: 0.24, swingHit: new Set(), combo: 0, comboT: 0, dash: 0, dashCd: 0, dx: 0, dz: 0, stepT: 0, target: null, rapid: 0, triple: 0, inTurret: false, super: 0 };
  const core = { hp: CORE_HP, max: CORE_HP, up: true, dead: false, hit: 0, calm: 0, breach: 0, inside: 0, armed: false, gunUp: 0, gunA: Math.PI, gunCool: 0, inHere: false, mending: 0 };
  const WV = { wave: 0, state: 'off', timer: 0, made: 0, quota: 0, rush: 0 };
  let foes = [], pickups = [];
  const CAP = LOW ? 14 : 20;
  const audio = new Ambience();
  const sfxLaser = () => { audio.tone(1500, 0.14, 0.05, 'sawtooth', 0.35); audio.tone(900, 0.1, 0.03, 'square', 0.5); };
  const sfxSwing = () => audio.burst(0.12, 2600, 0.12), sfxHit = () => { audio.tone(220, 0.08, 0.07, 'square', 0.6); audio.burst(0.06, 1400, 0.12); };
  const sfxBoom = () => { audio.burst(0.5, 500, 0.3); audio.tone(90, 0.4, 0.08, 'sine', 0.5); }, sfxHurt = () => audio.tone(300, 0.18, 0.06, 'sawtooth', 0.5), sfxAlert = () => { audio.tone(520, 0.18, 0.05, 'square'); setTimeout(() => audio.tone(780, 0.22, 0.05, 'square'), 140); };
  function callOut(text, col = '#ffffff', life = 1.8) { St.callout = { text, col, t: 0, life }; }
  function note(title, sub) { St.note = { title, sub, t: 0 }; }
  function toast(t) { St.toast = { text: t, t: 0 }; }
  function prompt(title, body, buttons) { St.prompt = { title, body, buttons: buttons.map(b => Array.isArray(b) ? { label: b[0], act: b[1] } : { label: b }) }; St.held = false; St.mouseHeld = false; input.jx = input.jy = 0; sfxAlert(); }
  const alive = () => foes.filter(f => !f.dead);
  const liveGates = () => gates.filter(g => !g.dead), gatesLeft = () => liveGates().length;
  const tgtY = t => t.kind === 'drone' ? t.y : t.kind === 'gate' ? 2.2 : t.boss ? 2.2 : 1.2;
  const targets = () => [...alive(), ...liveGates()];

  function spawnFoe(key, x, z, o = {}) {
    const s = SPEC[key], drone = s.kind === 'drone', m = drone ? makeDrone(s) : makeRobot(s);
    const f = { key, s, kind: s.kind, boss: !!s.boss, name: s.name, m, x, z, y: drone ? s.fly : 0, hp: s.hp, max: s.hp, face: Math.atan2(-x, -z), mode: 'move', mt: 0, cd: rr(0.6, 1.6), flash: 0, kx: 0, kz: 0, walk: 0, dead: 0, stagger: 0, active: !!o.active, guard: !!o.guard, home: { x, z }, gate: o.gate ?? null, rad: (drone ? 0.8 : 0.55) * s.size, outside: Math.hypot(x, z) >= CORE_R, strafe: rnd() < 0.5 ? 1 : -1, from: new THREE.Vector3(), to: new THREE.Vector3() };
    if (f.boss) f.bar = hpBar(2.4);
    m.g.position.set(x, f.y, z); foes.push(f); return f;
  }
  function removeFoe(f) { scene.remove(f.m.g); clearAim(f); if (f.tel) { scene.remove(f.tel.disc); scene.remove(f.tel.strip); f.tel = null; } if (f.bar) { scene.remove(f.bar.s); f.bar = null; } }

  function resetAll() {
    foes.forEach(removeFoe); foes = []; pickups.forEach(p => scene.remove(p.m)); pickups = [];
    [...bolts, ...rockets, ...beams, ...debris].forEach(b => scene.remove(b.m)); bolts.length = rockets.length = beams.length = debris.length = 0;
    waves.forEach(w => { scene.remove(w.m); scene.remove(w.wall); }); waves.length = 0; smokes.forEach(s => scene.remove(s.sp)); smokes.length = 0;
    gates.forEach(g => { g.dead = false; g.hp = g.max; g.g.visible = true; g.bar.s.visible = true; g.bar.set(1); g.born = 0; spawnFoe(g.tpl, g.x + Math.sin(g.g.rotation.y) * 2.4, g.z + Math.cos(g.g.rotation.y) * 2.4, { guard: true, gate: g.i }); spawnFoe(g.boss, g.x - Math.sin(g.g.rotation.y) * 0.4 + rr(-1, 1), g.z - Math.cos(g.g.rotation.y) * 0.4, { guard: true, gate: g.i }); });
    Object.assign(core, { hp: CORE_HP, up: true, dead: false, hit: 0, calm: 0, breach: 0, inside: 0, armed: false, gunUp: 0, gunA: Math.PI, gunCool: 0, inHere: false });
    Object.assign(TU, { ang: Math.PI, shield: TU.max, dead: false, cool: 0 }); TU.g.visible = true; TU.g.rotation.z = 0;
    Object.assign(WV, { wave: 0, state: 'off', timer: 0, made: 0, quota: 0, rush: 0 });
    Object.assign(P, { x: 0, z: 0, y: 0, vx: 0, vz: 0, vy: 0, face: 2.51, hp: 100, en: 100, inv: 0, hurt: 0, dash: 0, swing: 0, rapid: 0, triple: 0, inTurret: false, super: 0 });
    Object.assign(St, { yaw: -0.63, beam: null, beamDone: false, leaving: false, done: false, defeated: false, cleared: false, asked: false, exitAsked: false, lock: null, callout: null, note: null, briefed: false });
    fox.visible = false; noble.visible = false; Object.assign(NOB, { x: 1.8, z: 1.4, face: 2.51, vx: 0, vz: 0, cd: 1, shoe: null }); shoeMesh.visible = false; noble.position.set(NOB.x, 0, NOB.z);
    hope.visible = false; Object.assign(HOP, { x: -0.13, z: 2.88, face: 2.51, vx: 0, vz: 0, cd: 1, spin: -1 }); hPulse.visible = hPulse2.visible = false; hope.position.set(HOP.x, 0, HOP.z);
  }

  // ---------- input ----------
  const keys = new Set(), input = { jx: 0, jy: 0, jump: false };
  const onKeyDown = e => {
    if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (St.prompt) { if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') { e.preventDefault(); api.promptPick(0); } return; }
    keys.add(e.code);
    if (e.code === 'Space') { e.preventDefault(); input.jump = true; }
    if (e.code === 'KeyE' || e.code === 'Enter') api.use();
    if (e.code === 'KeyF' || e.code === 'KeyJ') api.attack();
    if (e.code === 'Tab') { e.preventDefault(); api.cycleTarget(); } if (e.code === 'KeyC' || e.code === 'KeyT') api.toggleLock();
    if (e.code === 'KeyR' || e.code === 'KeyV') gateBurst(); if (e.code === 'KeyQ') api.select(P.weapon === 'SWORD' ? 'RAYGUN' : 'SWORD');
    if (e.code === 'Digit1') api.select('SWORD'); if (e.code === 'Digit2') api.select('RAYGUN'); if (e.code === 'Digit3') input.jump = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') api.dodge();
    if (/Arrow/.test(e.code)) e.preventDefault();
  };
  const onKeyUp = e => keys.delete(e.code), onBlur = () => { keys.clear(); St.held = false; St.mouseHeld = false; };
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); window.addEventListener('blur', onBlur);
  const el = renderer.domElement, ptrs = new Map();
  const joyBase = document.createElement('div'), joyKnob = document.createElement('div');
  joyBase.style.cssText = 'position:absolute;width:132px;height:132px;border:3px solid #f3f2f2;border-radius:50%;background:rgba(32,30,29,.35);transform:translate(-50%,-50%);display:none;pointer-events:none;box-sizing:border-box;';
  joyKnob.style.cssText = 'position:absolute;width:56px;height:56px;border:3px solid #201e1d;border-radius:50%;background:#ec3013;transform:translate(-50%,-50%);display:none;pointer-events:none;box-sizing:border-box;';
  const JOY = { fixed: false }, JR = 56;
  const joyCenter = () => { const land = W() > H(); return { x: (land ? 64 : 28) + 66, y: H() - (land ? 22 : 40) - 66 }; };
  function resetJoy() { if ([...ptrs.values()].some(p => p.joy)) return; if (!JOY.fixed) { joyBase.style.display = joyKnob.style.display = 'none'; return; } const c = joyCenter(); joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.left = joyKnob.style.left = c.x + 'px'; joyBase.style.top = joyKnob.style.top = c.y + 'px'; }
  container.append(joyBase, joyKnob);
  el.addEventListener('pointerdown', e => {
    if (St.prompt) return; el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top;
    const joy = e.pointerType === 'touch' && lx < r.width * 0.45 && ![...ptrs.values()].some(p => p.joy);
    const jc = joyCenter(), useC = joy && JOY.fixed && Math.hypot(lx - jc.x, ly - jc.y) < 170, ox = useC ? jc.x : lx, oy = useC ? jc.y : ly;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, ox, oy, joy, btn: e.button, t: performance.now() });
    if (joy) { let dx = lx - ox, dy = ly - oy; const l = Math.hypot(dx, dy); if (l > JR) { dx *= JR / l; dy *= JR / l; } input.jx = dx / JR; input.jy = -dy / JR; joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.left = ox + 'px'; joyBase.style.top = oy + 'px'; joyKnob.style.left = ox + dx + 'px'; joyKnob.style.top = oy + dy + 'px'; }
    if (e.pointerType === 'mouse' && e.button === 1) { e.preventDefault(); api.toggleLock(); }
    if (e.pointerType === 'mouse' && e.button === 0) { St.mouseHeld = true; api.attack(); }
  });
  el.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if (!p) return; if (p.joy) { const r = el.getBoundingClientRect(); let dx = e.clientX - r.left - p.ox, dy = e.clientY - r.top - p.oy; const l = Math.hypot(dx, dy); if (l > JR) { dx *= JR / l; dy *= JR / l; } input.jx = dx / JR; input.jy = -dy / JR; joyKnob.style.left = p.ox + dx + 'px'; joyKnob.style.top = p.oy + dy + 'px'; } else if (p.btn !== 0 || e.pointerType === 'touch') { const k = e.pointerType === 'touch' ? 0.008 : 0.005; St.dragT = 1.2; St.yaw -= (e.clientX - p.x) * k; St.pitch = clamp(St.pitch + (e.clientY - p.y) * k * 0.8, 0.08, 1.1); } p.x = e.clientX; p.y = e.clientY; });
  const endPtr = e => { const p = ptrs.get(e.pointerId); if (p && p.btn === 0 && e.pointerType === 'mouse') St.mouseHeld = false; if (p && p.joy) { input.jx = input.jy = 0; joyBase.style.display = joyKnob.style.display = 'none'; } if (p && e.pointerType === 'touch' && !p.joy && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) < 10 && performance.now() - p.t < 250) api.attack(); ptrs.delete(e.pointerId); if (p && p.joy) resetJoy(); };
  el.addEventListener('pointerup', endPtr); el.addEventListener('pointercancel', endPtr);
  el.addEventListener('wheel', e => { St.dist = clamp(St.dist + e.deltaY * 0.01, 5, 16); e.preventDefault(); }, { passive: false });
  el.addEventListener('contextmenu', e => e.preventDefault());
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); resetJoy(); }); ro.observe(container);

  // ---------- combat ----------
  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3(), v5 = new THREE.Vector3();
  function pickTarget(face = P.face, range = 22) {
    let best = null, bs = -1e9; const fx = Math.sin(face), fz = Math.cos(face);
    for (const f of targets()) { const dx = f.x - P.x, dz = f.z - P.z, d = Math.hypot(dx, dz); if (d > range) continue; const dot = (dx * fx + dz * fz) / (d || 1); const sc = dot * 2 - d * 0.12 - (f.kind === 'gate' ? 0.6 : 0); if (dot > 0.25 && sc > bs) { bs = sc; best = f; } }
    if (!best) for (const f of targets()) { const d = Math.hypot(f.x - P.x, f.z - P.z); if (d < 4 && -d > bs) { bs = -d; best = f; } }
    return best;
  }
  function addSuper(n) { const was = P.super < 100; P.super = Math.min(100, P.super + n); if (was && P.super >= 100) { popup(v3.set(P.x, 3.3, P.z), 'BURST READY', '#5fe3ff'); audio.tone(660, 0.3, 0.05, 'triangle', 2); } }
  function damageTarget(t, dmg, weapon) { if (t.kind === 'gate') { damageGate(t, dmg); feel(weapon); } else damageFoe(t, dmg, weapon); }
  function damageFoe(f, dmg, weapon) {
    if (f.dead) return;
    f.hp -= dmg; f.flash = 0.12; f.flinch = 0.2; f.active = true; sfxHit(); feel(weapon); burst(v3.set(f.x, f.y + (f.kind === 'drone' ? 0 : 1.2), f.z), 14, 6);
    popup(v3.set(f.x + rr(-0.3, 0.3), f.y + (f.kind === 'drone' ? 1.0 : f.boss ? 4.0 : 2.3), f.z), String(Math.round(dmg)), weapon === 'SWORD' ? '#9ff3ff' : weapon === 'BURST' ? '#ffd76a' : '#ffffff');
    if (weapon !== 'BURST' && weapon !== 'CORE' && weapon !== 'SHOE' && weapon !== 'CANE') addSuper(4);
    if (weapon === 'SHOE' || weapon === 'CANE') {} else if (f.kind === 'bot') { const dx = f.x - P.x, dz = f.z - P.z, d = Math.hypot(dx, dz) || 1, kb = f.boss ? 0.8 : 4; f.kx += dx / d * kb; f.kz += dz / d * kb; f.stagger = Math.max(f.stagger, f.boss ? 0.15 : 0.35); if (f.mode === 'windup' && !f.boss) { f.mode = 'recover'; f.mt = 0; } }
    else { const dx = f.x - P.x, dz = f.z - P.z, d = Math.hypot(dx, dz) || 1, kb = f.boss ? 0.8 : 3; f.kx += dx / d * kb; f.kz += dz / d * kb; }
    if (f.boss && !f.enraged && f.hp > 0 && f.hp <= f.max * 0.5) { f.enraged = true; f.wk = 0.8; popup(v3.set(f.x, f.y + (f.kind === 'drone' ? 1.6 : 4.4), f.z), 'ENRAGED', '#ff3b30'); callOut('SINK WARDEN ENRAGED', '#ff5c5c', 1.8); burst(v3.set(f.x, f.y + 1.5, f.z), 40, 10); glowSprite(0, f.kind === 'drone' ? 0 : 1.2, 0, 0xff3b30, 2.6, 0.7, f.m.g); audio.tone(110, 0.9, 0.08, 'sawtooth', 0.5); St.shake = Math.max(St.shake, 0.4); }
    if (f.hp <= 0) { f.dead = 1; sfxBoom(); breakApart(f); f.m.g.visible = false; hideTel(f); addSuper(10); dropPickup(f); burst(v3.set(f.x, f.y + (f.kind === 'drone' ? 0 : 1), f.z), 40, 9); St.shake = Math.max(St.shake, f.boss ? 0.5 : 0.3); clearAim(f); if (f.bar) { scene.remove(f.bar.s); f.bar = null; } if (f.boss) callOut('SINK WARDEN DOWN', '#ffd166', 1.6); }
  }
  function damageGate(g, dmg) {
    if (g.dead) return;
    const w = foes.find(o => !o.dead && o.boss && o.gate === g.i); if (w) { w.active = true; if (St.t - (g.called ?? -99) > 8 && fightOn()) { g.called = St.t; reinforce(g); } }
    g.hp -= Math.max(1, Math.round(dmg)); g.hit = 0.17; g.bar.set(g.hp / g.max);
    popup(v3.set(g.x, 4.0, g.z), '-' + Math.max(1, Math.round(dmg)), '#ffd166');
    if (g.hp > 0) { burst(v3.set(g.x, 2, g.z), 8, 4); St.shake = Math.max(St.shake, 0.1); sfxHit(); return; }
    g.hp = 0; g.dead = true; g.g.visible = false; g.bar.s.visible = false; burst(v3.set(g.x, 2, g.z), 60, 12); St.shake = 0.6; sfxBoom();
    popup(v3.set(g.x, 4.6, g.z), 'GATE DESTROYED', '#ff5c5c');
    if (St.lock === g) St.lock = null;
    const left = gatesLeft(); callOut(left ? (4 - left) + ' OF 4 GATES DESTROYED' : 'ALL GATES DESTROYED', left ? '#ffd166' : '#7cff9b', left ? 2.2 : 2.8);
  }
  function reinforce(g) { popup(v3.set(g.x, 5.6, g.z), 'REINFORCEMENTS', '#ff3b30'); audio.tone(200, 0.6, 0.05, 'sawtooth', 2);
    for (const key of [g.tpl, g.alt]) { if (alive().length >= CAP) break; const a = rnd() * 6.283; let sx = g.x + Math.sin(g.g.rotation.y) * 3.5 + Math.cos(a) * 1.5, sz = g.z + Math.cos(g.g.rotation.y) * 3.5 + Math.sin(a) * 1.5; if (!walkable(sx, sz, 0.8)) { const q = nearestOnLine(sx, sz); sx = q.x; sz = q.z; } const f = spawnFoe(key, sx, sz, { active: true }); f.cd = rr(1, 2); skyBeam(sx, sz); } }
  function hurtPlayer(dmg, from) {
    if (St.beam || St.leaving || St.defeated || P.inv > 0 || P.dash > 0) return;
    if (P.inTurret && !TU.dead) { TU.shield -= dmg; P.inv = 0.25; burst(v3.set(TU.x, 1.4, TU.z), 8, 4); if (TU.shield <= 0) { TU.dead = true; TU.shield = 0; burst(v3.set(TU.x, 1.2, TU.z), 40, 9); sfxBoom(); callOut('TURRET DOWN', '#ff5c5c'); exitTurret(); TU.g.rotation.z = 0.25; } return; }
    P.hp = Math.max(0, P.hp - dmg); P.inv = 0.6; P.hurt = 0.3; St.shake = Math.max(St.shake, 0.3); sfxHurt();
    const dx = P.x - from.x, dz = P.z - from.z, d = Math.hypot(dx, dz) || 1; P.vx += dx / d * 6; P.vz += dz / d * 6;
    popup(v3.set(P.x, 2.4, P.z), '-' + dmg, '#ff6b5a');
    if (P.hp <= 0) defeat();
  }
  function hurtCore(dmg, at) {
    if (core.dead || !core.up) return;
    core.hp -= Math.max(1, Math.round(dmg)); core.hit = 0.23; core.calm = 0;
    if (!core.armed) { core.armed = true; core.gunUp = 0; St.shake = Math.max(St.shake, 0.2); sfxAlert(); note('Auto-gun up', 'The screen took a hit. The bridge answers for itself.'); }
    if (at) burst(at, 6, 3);
    if (core.hp <= 0) { core.hp = 0; core.up = false; St.shake = 0.8; burst(v3.set(0, 2, 0), 60, 12); popup(v3.set(0, 5, 0), 'SCREEN DOWN', '#ff5c5c'); note('Screen down', 'They are coming inside. Ten seconds and it is theirs.'); sfxBoom(); }
  }
  function defeat() {
    St.defeated = true; P.hp = 0; exitTurret(); audio.tone(160, 0.8, 0.07, 'sawtooth', 0.4);
    setTimeout(() => {
      if (St.cleared) prompt('TRANSPORT COMPLETE', 'You went down hunting the bonus — but the ' + WAVES + ' waves were already broken, and the transport carried you through.', [['CONTINUE', () => leave(false)]]);
      else prompt('TRANSPORT FAILED', 'The gates overran the bridge before the ' + WAVES + ' waves were broken. The transport has to be attempted again.', [['TRY AGAIN', () => restart()]]);
    }, 900);
  }
  const orbGeo = new THREE.OctahedronGeometry(0.22, 0);
  const PK = { health: '#ec3013', energy: '#38bdf8', cell: '#38bdf8', burst: '#ffd76a', rapid: '#7cff9b', triple: '#c084fc' };
  function addPickup(kind, x, z, o = {}) { const col = PK[kind]; const m = new THREE.Mesh(orbGeo, new THREE.MeshToonMaterial({ color: col, gradientMap: grad, emissive: new THREE.Color(col), emissiveIntensity: 1.2 })); m.position.set(x, 1, z); if (kind === 'rapid' || kind === 'triple') m.scale.setScalar(1.5); scene.add(m); glowSprite(0, 0, 0, new THREE.Color(col).getHex(), 1.3, 0.8, m); pickups.push({ m, kind, t: 0, vy: o.vy ?? 5, x, z, life: o.life ?? 30, waveRapid: !!o.waveRapid }); }
  function dropPickup(f) { const r = rnd(); if (r > (f.boss ? 1 : 0.55)) return; addPickup(f.boss ? 'health' : r < 0.25 ? 'health' : r < 0.45 ? 'energy' : 'burst', f.x, f.z); }
  function updatePickups(dt) {
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i]; p.t += dt; p.vy -= 14 * dt; const y = Math.max(0.6 + Math.sin(p.t * 3) * 0.15, p.m.position.y + p.vy * dt); if (y <= 0.75) p.vy = 0;
      const dx = P.x - p.x, dz = P.z - p.z, d = Math.hypot(dx, dz);
      if (d < 3.2 && p.t > 0.4 && !P.inTurret) { p.x += dx / d * Math.min(d, 9 * dt); p.z += dz / d * Math.min(d, 9 * dt); }
      p.m.position.set(p.x, y, p.z); p.m.rotation.y += dt * 3;
      if (d < 0.9 && p.t > 0.4 && !P.inTurret && !St.beam) {
        if (p.kind === 'health') { P.hp = Math.min(100, P.hp + 20); popup(v3.set(P.x, 2.6, P.z), '+20 HP', '#ec3013'); }
        else if (p.kind === 'energy' || p.kind === 'cell') { P.en = 100; popup(v3.set(P.x, 2.6, P.z), 'ENERGY', '#38bdf8'); }
        else if (p.kind === 'rapid') { P.rapid = 8; P.weapon = 'RAYGUN'; popup(v3.set(P.x, 2.6, P.z), 'RAPID FIRE', '#7cff9b'); }
        else if (p.kind === 'triple') { P.triple = 14; P.weapon = 'RAYGUN'; popup(v3.set(P.x, 2.6, P.z), 'TRIPLE SHOT', '#c084fc'); }
        else { addSuper(25); popup(v3.set(P.x, 2.6, P.z), '+BURST', '#ffd76a'); }
        audio.tone(880, 0.15, 0.05, 'triangle', 1.5); scene.remove(p.m); pickups.splice(i, 1); continue;
      }
      if (p.t > p.life) { scene.remove(p.m); pickups.splice(i, 1); }
    }
  }
  const burstMat = new THREE.MeshBasicMaterial({ color: 0x5fe3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const burstRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.12, 8, 64), burstMat); burstRing.rotation.x = Math.PI / 2; scene.add(burstRing); let burstT = -1;
  function gateBurst() {
    if (P.super < 100 || !fightOn() || P.inTurret) return false;
    P.super = 0; burstT = 0; St.slow = 0.7; St.shake = 0.8; P.inv = 0.8;
    audio.tone(220, 0.8, 0.08, 'sawtooth', 4); audio.burst(0.6, 1600, 0.3); popup(v3.set(P.x, 3.4, P.z), '8-GATE BURST', '#5fe3ff');
    for (const f of targets()) { const d = Math.hypot(f.x - P.x, f.z - P.z); if (d < 9) { if (f.kind === 'bot') f.stagger = f.boss ? 1.6 : 1.4; damageTarget(f, f.kind === 'gate' ? 45 : f.boss ? 70 : 45, 'BURST'); } }
    burst(v3.set(P.x, 1, P.z), 60, 12); return true;
  }
  function fireBolt(dir, t) { const m = new THREE.Mesh(boltGeo, boltMat); m.position.copy(v3); scene.add(m); const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x5fe3ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); g.scale.setScalar(0.9); m.add(g); bolts.push({ m, v: dir.clone().multiplyScalar(60), life: 1.0, target: t }); }
  function fireRocket(from, dir, dmg, who, target) { const m = new THREE.Mesh(rocketGeo, rocketMat); m.position.copy(from); scene.add(m); const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff9a40, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); g.scale.setScalar(1.2); m.add(g); rockets.push({ m, v: dir.clone().multiplyScalar(who === 'core' ? 20 : 34), life: 1.4, dmg, who, target }); }
  function enterTurret() { if (TU.dead || P.inTurret) return; P.inTurret = true; P.vx = P.vz = 0; P.swing = 0; St.lock = null; note('Turret', 'Steer with the keys or a drag. GET OUT when you are done.'); audio.blip(); }
  function exitTurret() { if (!P.inTurret) return; P.inTurret = false; P.x = TU.x - Math.sin(TU.ang) * 2.2; P.z = TU.z - Math.cos(TU.ang) * 2.2; if (!walkable(P.x, P.z)) { P.x = TU.x + 1.8; P.z = TU.z - 1.8; } audio.blip(); }
  const nearTurret = () => !TU.dead && !P.inTurret && Math.hypot(P.x - TU.x, P.z - TU.z) < 2.8;
  const fightOn = () => St.beamDone && !St.prompt && !St.leaving && !St.defeated && !St.done;

  // a drone's shot: the screen takes it if it crosses the glass, cover stops it, then the fox
  function fireBeam(f, toV) {
    const from = f.from, to = v4.copy(toV); let tEnd = 1, hitDome = false;
    if (core.up && !core.dead && from.length() > CORE_R) { const d = v5.subVectors(to, from), a = d.dot(d), b = 2 * from.dot(d), c = from.dot(from) - CORE_R * CORE_R, disc = b * b - 4 * a * c; if (disc > 0) { const t = (-b - Math.sqrt(disc)) / (2 * a); if (t > 0 && t < 1) { tEnd = t; hitDome = true; } } }
    for (const c of COVERS) { const dx = to.x - from.x, dz = to.z - from.z, L = dx * dx + dz * dz; const t = clamp(((c.x - from.x) * dx + (c.z - from.z) * dz) / L, 0, 1); if (t < tEnd && Math.hypot(from.x + dx * t - c.x, from.z + dz * t - c.z) < c.r * 0.85 && from.y + (to.y - from.y) * t < 1.5) { tEnd = t; hitDome = false; } }
    const end = v5.lerpVectors(from, to, tEnd);
    if (!hitDome) { const tx = P.inTurret ? TU.x : P.x, ty = P.inTurret ? 1.3 : P.y + 1, tz = P.inTurret ? TU.z : P.z; const ab = v3.subVectors(end, from), t = clamp(((tx - from.x) * ab.x + (ty - from.y) * ab.y + (tz - from.z) * ab.z) / Math.max(ab.lengthSq(), 1e-4), 0, 1); if (Math.hypot(tx - from.x - ab.x * t, ty - from.y - ab.y * t, tz - from.z - ab.z * t) < (P.inTurret ? 1.2 : 0.75)) hurtPlayer(f.s.dmg, f); }
    else hurtCore(f.s.coreDmg, end.clone());
    const len = from.distanceTo(end), w = f.boss ? 0.16 : 0.09;
    const bm = new THREE.Mesh(new THREE.CylinderGeometry(w, w, len, 8, 1, true), beamMat.clone()); bm.position.copy(from).lerp(end, 0.5); bm.lookAt(end); bm.rotateX(Math.PI / 2); scene.add(bm); beams.push({ m: bm, life: 0.25 });
    burst(end, 6, 3); audio.tone(f.boss ? 480 : 700, 0.2, 0.05, 'sawtooth', 0.4);
  }
  function lineClear(x0, z0, x1, z1) { for (let i = 1; i <= 8; i++) { const t = i / 8, x = lerp(x0, x1, t), z = lerp(z0, z1, t); if (!walkable(x, z, 0.6) || COVERS.some(c => Math.hypot(x - c.x, z - c.z) < c.r)) return false; } return true; }
  function moveFoe(f, ddx, ddz) {
    const pad = f.kind === 'drone' ? 0.3 : f.rad * 0.7;
    let nx = f.x + ddx, nz = f.z + ddz;
    if (!walkable(nx, nz, pad)) { const q = nearestOnLine(f.x, f.z), cx = q.x - f.x, cz = q.z - f.z, cl = Math.hypot(cx, cz) || 1, st = Math.hypot(ddx, ddz); nx = f.x + ddx * 0.3 + cx / cl * st; nz = f.z + ddz * 0.3 + cz / cl * st;
      if (!walkable(nx, nz, pad)) { if (walkable(f.x + ddx, f.z, pad)) { nx = f.x + ddx; nz = f.z; } else if (walkable(f.x, f.z + ddz, pad)) { nx = f.x; nz = f.z + ddz; } else { nx = f.x; nz = f.z; } } }
    if (f.kind === 'bot') for (const c of COVERS) { const ex = nx - c.x, ez = nz - c.z, ed = Math.hypot(ex, ez), m = c.r * 0.9 + f.rad; if (ed < m && ed > 1e-3) { nx = c.x + ex / ed * m; nz = c.z + ez / ed * m; } }
    if (core.up && !core.dead && f.outside) { const d0 = Math.hypot(nx, nz), m = CORE_R + f.rad; if (d0 < m) { nx *= m / (d0 || 1); nz *= m / (d0 || 1); } }
    f.x = nx; f.z = nz; f.outside = Math.hypot(f.x, f.z) >= CORE_R;
  }

  function updateFoe(f, dt, on) {
    const m = f.m;
    if (f.dead) { f.dead += dt; m.g.position.y -= dt * (f.kind === 'drone' ? 5 : 0); m.g.rotation.z += dt * 4; m.g.scale.setScalar(Math.max(0.001, f.s.size * (1 - f.dead * 2.2))); if (f.dead > 0.5) m.g.visible = false; return; }
    f.flash = Math.max(0, f.flash - dt); f.flinch = Math.max(0, (f.flinch || 0) - dt); const fl = f.flash > 0 ? 1 : 0; m.mats.forEach(mt => mt.emissive.setRGB(fl, fl, fl));
    const dxp = P.x - f.x, dzp = P.z - f.z, dp = Math.hypot(dxp, dzp) || 1;
    if (on) {
      if (!f.active && (dp < (f.boss ? 24 : 20) || f.hp < f.max)) f.active = true;
      if (f.active && f.guard && Math.hypot(P.x - f.home.x, P.z - f.home.z) > 50 && f.hp >= f.max) f.active = false;
    }
    const pIn = Math.hypot(P.x, P.z) < CORE_R && !P.inTurret;
    const toDome = f.kind === 'bot' && f.active && core.up && !core.dead && f.outside && pIn;
    let tx = P.inTurret ? TU.x : P.x, tz = P.inTurret ? TU.z : P.z;
    if (!f.active) { tx = f.home.x; tz = f.home.z; }
    else if (toDome) { const a = Math.atan2(f.x, f.z), r = CORE_R + f.rad + 0.1; tx = Math.sin(a) * r; tz = Math.cos(a) * r; }
    f.mt += dt; if (on) f.cd -= dt;
    const dx = tx - f.x, dz = tz - f.z, d = Math.hypot(dx, dz) || 1;
    if (f.kind === 'drone') {
      let mx = 0, mz = 0, flyT = f.s.fly;
      if (!f.active) { if (d > 0.6) { mx = dx / d * 0.7; mz = dz / d * 0.7; } }
      else if (on) {
        f.jukeT = Math.max(0, (f.jukeT || 0) - dt);
        if (P.target === f && P.fireCd > 0.05 && !f.jukeT && rnd() < dt * 2.5) { f.jukeT = 0.4; f.strafe *= -1; }
        let cov = null; if (!f.boss && f.mode === 'move' && f.cd > 0.7) { let bd = 12; for (const c of COVERS) { const cd = Math.hypot(c.x - f.x, c.z - f.z); if (cd < bd) { bd = cd; cov = c; } } }
        if (cov) { const ax = cov.x - tx, az = cov.z - tz, al = Math.hypot(ax, az) || 1, hx = cov.x + ax / al * (cov.r + 1.0), hz = cov.z + az / al * (cov.r + 1.0), hd = Math.hypot(hx - f.x, hz - f.z); if (hd > 0.4) { mx = (hx - f.x) / hd * 1.3; mz = (hz - f.z) / hd * 1.3; } flyT = 0.95; }
        else { const want = f.s.reach * 0.7, k = d > want + 1 ? 1 : d < want - 1.5 ? -0.8 : 0, lat = 0.5 * (f.jukeT ? 3.2 : 1); mx = dx / d * k - dz / d * f.strafe * lat; mz = dz / d * k + dx / d * f.strafe * lat; if (rnd() < dt * 0.5) f.strafe *= -1; }
      }
      if (f.mode === 'aim') { mx *= 0.2; mz *= 0.2; }
      if (on || !f.active) moveFoe(f, mx * f.s.speed * dt + f.kx * dt, mz * f.s.speed * dt + f.kz * dt);
      f.kx = damp(f.kx, 0, 6, dt); f.kz = damp(f.kz, 0, 6, dt);
      for (const o of foes) { if (o === f || o.dead || o.kind !== 'drone') continue; const ex = f.x - o.x, ez = f.z - o.z, ed = Math.hypot(ex, ez), mm = f.rad + o.rad; if (ed < mm && ed > 1e-3) { f.x += ex / ed * (mm - ed) * 0.5; f.z += ez / ed * (mm - ed) * 0.5; } }
      f.flyY = damp(f.flyY ?? f.s.fly, flyT, 3, dt); f.y = f.flyY + Math.sin(St.t * 2 + f.home.x) * 0.2;
      const wantF = f.active ? Math.atan2(dxp, dzp) : Math.atan2(dx, dz); let df = wantF - f.face; df = Math.atan2(Math.sin(df), Math.cos(df)); f.face += df * Math.min(1, dt * 5);
      m.g.position.set(f.x, f.y, f.z); m.g.rotation.y = f.face; m.body.rotation.z = Math.sin(St.t * 3 + f.home.z) * 0.12; m.body.rotation.x = (f.mode === 'aim' ? -0.15 : 0) + f.flinch * 2.2;
      m.rotors.forEach(r => r.rotation.y += dt * 30);
      if (on && f.active) {
        if (f.mode === 'move' && f.cd <= 0 && dp < f.s.reach * 1.1 && f.y > f.s.fly * 0.75) {
          f.mode = 'aim'; f.mt = 0; f.from.set(f.x, f.y, f.z); const base = v4.set(tx, P.inTurret ? 1.3 : P.y + 1.0, tz).sub(f.from).multiplyScalar(1.35);
          f.tos = (f.boss && f.enraged ? [-0.3, 0, 0.3] : [0]).map(a => { const t = base.clone().applyAxisAngle(UPV, a).add(f.from); t.y = Math.max(0.05, t.y); return t; });
          const w = f.boss ? 0.05 : 0.03;
          f.aimLines = f.tos.map(to => { const len = f.from.distanceTo(to), al = new THREE.Mesh(new THREE.CylinderGeometry(w, w, len, 6, 1, true), aimMat.clone()); al.position.copy(f.from).lerp(to, 0.5); al.lookAt(to); al.rotateX(Math.PI / 2); scene.add(al); return al; });
          if (f.boss) f.strips = f.tos.map(to => { const g = new THREE.Group(), sm = new THREE.Mesh(stripGeo, telMat()); sm.rotation.x = Math.PI / 2; g.add(sm); g.position.set(f.x, 0.06, f.z); g.rotation.y = Math.atan2(to.x - f.x, to.z - f.z); g.scale.set(1.3, 1, Math.hypot(to.x - f.x, to.z - f.z)); scene.add(g); return g; });
          audio.tone(f.boss ? 380 : 520, 0.08, 0.025, 'square');
        } else if (f.mode === 'aim') {
          const k = f.mt / (f.s.windup * (f.wk || 1));
          (f.aimLines || []).forEach(al => al.material.opacity = 0.25 + k * 0.6); (f.strips || []).forEach(g => g.children[0].material.opacity = 0.15 + k * 0.45 * (0.8 + 0.2 * Math.sin(St.t * 30)));
          if (k >= 1) { const tos = f.tos; clearAim(f); tos.forEach(to => fireBeam(f, to)); f.mode = 'move'; f.mt = 0; f.cd = f.s.cool * rr(0.9, 1.25) * (f.enraged ? 0.7 : 1); }
        }
      } else if (f.aimLines) { clearAim(f); f.mode = 'move'; }
    } else {
      let sp = 0, mx = 0, mz = 0;
      if (f.stagger > 0) { f.stagger -= dt; }
      else if (f.mode === 'move') {
        if (!f.active) { if (d > 0.6) { mx = dx / d; mz = dz / d; sp = f.s.speed * 0.6; } }
        else if (on && !f.boss && !toDome && (f.dashCd = (f.dashCd ?? rr(1, 3)) - dt) <= 0 && d > 4 && d < 9 && lineClear(f.x, f.z, tx, tz)) { f.mode = 'dashAim'; f.mt = 0; f.dashA = Math.atan2(dx, dz); f.dashLen = Math.min(d + 3.5, 11); f.dashGone = 0; audio.tone(340, 0.5, 0.05, 'sawtooth', 2.6); }
        else if (on) { const reach = toDome ? 0.35 : f.s.reach; if (d > reach) { mx = dx / d; mz = dz / d; sp = f.s.speed * (f.enraged ? 1.3 : 1); } if (d < reach + 0.35 && f.cd <= 0) { f.mode = 'windup'; f.mt = 0; f.atDome = toDome; f.stomp = f.boss && f.enraged && !toDome && (f.atk = (f.atk || 0) + 1) % 2 === 0; audio.tone(f.stomp ? 120 : 260, 0.5, 0.05, f.stomp ? 'square' : 'sawtooth', 2.2); } }
      } else if (f.mode === 'windup') {
        if (f.boss) { const T = telOf(f), R0 = f.stomp ? 5.2 : f.s.reach + 1.0, k = smooth(0, f.s.windup * (f.wk || 1), f.mt), cx = f.stomp ? f.x : f.x + Math.sin(f.face) * f.s.reach * 0.55, cz = f.stomp ? f.z : f.z + Math.cos(f.face) * f.s.reach * 0.55; T.disc.visible = true; T.disc.position.set(cx, 0.05, cz); T.disc.scale.set(R0, 1, R0); T.fill.scale.setScalar(Math.max(0.01, k)); T.fill.material.opacity = 0.32; T.edge.material.opacity = 0.6 + 0.3 * Math.sin(St.t * 20); f.telC = [cx, cz, R0]; }
        if (!on) f.mt = Math.min(f.mt, f.s.windup * 0.5); else if (f.mt >= f.s.windup * (f.wk || 1)) { f.mode = 'swing'; f.mt = 0; f.hitDone = false; f.kx += Math.sin(f.face) * (f.boss ? 3 : 5); f.kz += Math.cos(f.face) * (f.boss ? 3 : 5); sfxSwing(); } }
      else if (f.mode === 'swing') { if (!f.hitDone && f.mt > 0.1) { f.hitDone = true; hideTel(f); if (f.atDome) hurtCore(f.s.coreDmg * (f.boss ? 1.6 : 1), v3.set(f.x - Math.sin(f.face) * -f.rad, 1.2, f.z + Math.cos(f.face) * f.rad)); else if (f.boss && f.telC) { const [cx, cz, R0] = f.telC; St.shake = Math.max(St.shake, 0.45); burst(v3.set(cx, 0.3, cz), 26, 7); if (f.stomp) shockwave(f.x, f.z); else if (Math.hypot(tx - cx, tz - cz) < R0 && (P.inTurret || P.y < 1.2)) hurtPlayer(f.s.dmg, f); } else { const ta = Math.atan2(tx - f.x, tz - f.z), a2 = Math.atan2(Math.sin(ta - f.face), Math.cos(ta - f.face)); if (Math.hypot(tx - f.x, tz - f.z) < f.s.reach + 0.7 && Math.abs(a2) < 1.2 && (P.inTurret || P.y < 1.2)) hurtPlayer(f.s.dmg, f); } } if (f.mt > 0.35) { f.mode = 'recover'; f.mt = 0; } }
      else if (f.mode === 'recover') { if (f.mt > 0.5) { f.mode = 'move'; f.mt = 0; f.cd = f.s.cool * (f.enraged ? 0.4 : 0.6); f.telC = null; f.stomp = false; } }
      else if (f.mode === 'dashAim') { const T = telOf(f); T.strip.visible = true; T.strip.position.set(f.x, 0.06, f.z); T.strip.rotation.y = f.dashA; T.strip.scale.set(1.5, 1, f.dashLen); T.sm.material.opacity = 0.2 + 0.5 * smooth(0, 0.65, f.mt) * (0.75 + 0.25 * Math.sin(St.t * 30)); if (on && f.mt > 0.65) { f.mode = 'dash'; f.mt = 0; f.hitDone = false; sfxSwing(); } }
      else if (f.mode === 'dash') { const st = 14 * dt, ox = f.x, oz = f.z; if (on) moveFoe(f, Math.sin(f.dashA) * st, Math.cos(f.dashA) * st); const moved = Math.hypot(f.x - ox, f.z - oz); f.dashGone += moved; f.walk += st * 3; if (rnd() < 0.6) burst(v3.set(f.x, 0.2, f.z), 1, 2); if (f.tel) f.tel.sm.material.opacity *= 0.9;
        if (!f.hitDone && Math.hypot(tx - f.x, tz - f.z) < 1.15 && (P.inTurret || P.y < 1)) { f.hitDone = true; hurtPlayer(Math.round(f.s.dmg * 1.3), f); }
        if (on && (f.dashGone >= f.dashLen - 0.05 || f.mt > 1.2 || moved < st * 0.3)) { f.mode = 'recover'; f.mt = -0.5; f.dashCd = rr(4, 6.5); hideTel(f); } }
      if (on || !f.active) moveFoe(f, mx * sp * dt + f.kx * dt, mz * sp * dt + f.kz * dt);
      f.kx = damp(f.kx, 0, 6, dt); f.kz = damp(f.kz, 0, 6, dt); f.walk += sp * dt * 2.2;
      for (const o of foes) { if (o === f || o.dead || o.kind !== 'bot') continue; const ex = f.x - o.x, ez = f.z - o.z, ed = Math.hypot(ex, ez), mm = f.rad + o.rad + 0.2; if (ed < mm && ed > 1e-3) { f.x += ex / ed * (mm - ed) * 0.5; f.z += ez / ed * (mm - ed) * 0.5; } }
      const wantF = f.mode === 'dash' || f.mode === 'dashAim' ? f.dashA : toDome ? Math.atan2(-f.x, -f.z) : f.active ? Math.atan2(tx - f.x, tz - f.z) : Math.atan2(dx, dz); let df = wantF - f.face; df = Math.atan2(Math.sin(df), Math.cos(df)); f.face += df * Math.min(1, dt * (f.mode === 'swing' ? 2 : 7));
      m.g.position.set(f.x, 0, f.z); m.g.rotation.y = f.face;
      const sw = Math.sin(f.walk) * 0.6; m.legs[0].rotation.x = sw; m.legs[1].rotation.x = -sw;
      m.armL.rotation.x = f.boss ? -1.2 : -0.3;
      const wind = f.mode === 'windup' ? smooth(0, f.s.windup, f.mt) : 0, sv = f.mode === 'swing' ? smooth(0, 0.2, f.mt) : 0;
      m.armR.rotation.x = f.mode === 'windup' ? -2.6 * wind : f.mode === 'swing' ? lerp(-2.6, -0.4, sv) : sp > 2.5 ? -0.9 + Math.sin(f.walk) * 0.4 : -0.4; m.armR.rotation.z = f.mode === 'swing' ? lerp(0, 1.1, sv) : 0;
      m.bladeMat.emissiveIntensity = f.mode === 'windup' ? 0.6 + wind * 2.4 * (0.7 + 0.3 * Math.sin(St.t * 40)) : 0.4;
      m.visorMat.color.set(f.mode === 'windup' || f.mode === 'swing' ? '#ff3b30' : f.active ? '#ffb35c' : '#5fe3ff'); m.visorMat.emissive.copy(m.visorMat.color);
      m.body.rotation.x = (f.stagger > 0 ? -0.3 : f.mode === 'dash' ? 0.45 : f.mode === 'dashAim' ? -0.15 : f.mode === 'recover' ? 0.18 : sp > 2.5 ? 0.22 : 0) - f.flinch * 1.6;
      m.warn.material.opacity = f.mode === 'windup' ? 0.2 + wind * 0.55 : f.mode === 'swing' ? 0.75 : 0;
    }
    if (f.bar) { const top = f.kind === 'drone' ? f.y + 1.3 : 3.9; f.bar.s.position.set(f.x, top, f.z); f.bar.s.visible = f.active && Math.hypot(f.x - camera.position.x, f.z - camera.position.z) < 40; f.bar.set(f.hp / f.max); }
  }

  // ---------- the screen, its gun, the breach clock (tickCore, in seconds) ----------
  function tickCore(dt, on) {
    core.hit = Math.max(0, core.hit - dt); core.calm += dt;
    domeMat.uniforms.uT.value = St.t; domeMat.uniforms.uHit.value = core.hit / 0.23;
    domeMat.uniforms.uOp.value = damp(domeMat.uniforms.uOp.value, core.up && !core.dead ? 0.55 + 0.45 * (core.hp / core.max) : 0, 6, dt); dome.visible = domeMat.uniforms.uOp.value > 0.01;
    screenRing.material.color.set(core.dead ? 0x5a5a5a : core.up ? 0x7cff9b : (Math.sin(St.t * 10) > 0 ? 0xff5c5c : 0x7cff9b));
    coreLight.color.set(core.up ? 0x7cff9b : 0xff5c5c); coreLight.intensity = core.dead ? 0 : 22;
    { const fr = core.hp / core.max;
      if (!core.dead && core.up && fr < 0.6 && rnd() < (0.6 - fr) * 14 * dt) { const a = rnd() * 6.283, e = rr(0.1, 1.2); burst(v3.set(Math.sin(a) * CORE_R * Math.cos(e), CORE_R * Math.sin(e), Math.cos(a) * CORE_R * Math.cos(e)), 8, 4); if (rnd() < 0.3) audio.tone(rr(1800, 2600), 0.04, 0.02, 'square'); }
      if ((core.dead || !core.up || fr < 0.35) && rnd() < (core.dead ? 6 : 3) * dt) { const a = rnd() * 6.283, r = rr(1.5, CORE_R + 2); puff(Math.sin(a) * r, 0.4, Math.cos(a) * r, rr(1.4, 2.6)); } }
    if (core.dead || !on) { gunG.position.y = damp(gunG.position.y, core.armed && !core.dead ? 0 : -1.6, 4, dt); return; }
    // gun
    if (core.armed) { core.gunUp = Math.min(1, core.gunUp + 1.68 * dt); gunG.position.y = lerp(-1.6, 0, smooth(0, 1, core.gunUp)); }
    if (core.armed && core.gunUp >= 1) {
      core.gunCool -= dt; let best = null, bd = CORE_R + 320 / U;
      for (const f of alive()) { const dd = Math.hypot(f.x, f.z); if (dd < bd) { bd = dd; best = f; } }
      if (best) { const want = Math.atan2(best.x, best.z); let da = want - core.gunA; da = Math.atan2(Math.sin(da), Math.cos(da)); core.gunA += clamp(da, -9.6 * dt, 9.6 * dt);
        if (core.gunCool <= 0 && Math.abs(da) < 0.35) { core.gunCool = 56 / 60; v3.set(Math.sin(core.gunA) * 1.6, 1.05, Math.cos(core.gunA) * 1.6); v4.set(best.x - v3.x, tgtY(best) - v3.y, best.z - v3.z).normalize(); fireRocket(v3, v4, 40, 'core', best); St.shake = Math.max(St.shake, 0.08); audio.tone(240, 0.12, 0.05, 'square', 0.5); } }
      gunHead.rotation.y = core.gunA;
    }
    // inside the wire
    let inside = 0; for (const f of alive()) if (Math.hypot(f.x, f.z) < CORE_R - Math.min(150 / U, CORE_R * 0.28)) inside++;
    core.inside = inside;
    if (inside > 0) { core.breach += dt; if (core.breach - dt <= 0) note('Breach', 'Something is inside the wire.'); if (core.breach >= 10) { core.dead = true; St.shake = 1; burst(v3.set(0, 2, 0), 80, 14); sfxBoom(); note('Base lost', 'They held the ground for ten seconds. It is theirs.'); WV.state = 'done'; return; } }
    else if (core.breach > 0) core.breach = Math.max(0, core.breach - 2 * dt);
    // the base mends the fox
    if (Math.hypot(P.x, P.z) < CORE_R && !P.inTurret && !St.defeated) {
      if (P.hp < 100) P.hp = Math.min(100, P.hp + 12.5 * dt); if (P.en < 100) P.en = Math.min(100, P.en + 20 * dt);
      if (!core.inHere) { core.inHere = true; callOut('RECHARGED', '#7cff9b', 1.5); }
    } else core.inHere = false;
    // and the screen comes back, with the compound clear
    if (core.calm > 2.5 && inside === 0 && core.hp < core.max) { core.hp = Math.min(core.max, core.hp + (core.up ? 30 : 54) * dt);
      if (!core.up && core.hp > core.max * 0.25) { core.up = true; popup(v3.set(0, 5, 0), 'SCREEN UP', '#7fe3ff'); note('Screen up', 'Back behind the glass.'); for (const f of foes) f.outside = Math.hypot(f.x, f.z) >= CORE_R; } }
  }

  // ---------- waves out of the gates (startWaves / beginWave / tickWaves) ----------
  function beginWave(n) {
    WV.wave = n; WV.state = 'fight'; WV.made = 0; const plates = gatesLeft();
    WV.quota = Math.max(1, Math.round(plates * 3 * 0.85));
    for (const g of liveGates()) { g.every = 4; g.next = (n === 1 ? 0.1 : 0.67) + rnd() * 0.83; }
    WV.rush = n === 1 ? 0.62 : 0;
    note('Wave ' + n, plates + (plates === 1 ? ' gate open.' : ' gates open.'));
    if (!core.dead) { pickups.filter(k => k.waveRapid).forEach(k => { scene.remove(k.m); pickups.splice(pickups.indexOf(k), 1); }); addPickup('rapid', 0, -260 / U, { life: 1e9, vy: 0, waveRapid: true }); }
    sfxAlert();
  }
  function tickWaves(dt) {
    if (WV.state === 'off' || WV.state === 'done') return;
    if (!gatesLeft()) { WV.state = 'done'; return; }
    if (WV.state === 'lull') { WV.timer -= dt; if (WV.timer <= 0) beginWave(WV.wave + 1); return; }
    for (const g of liveGates()) {
      if (WV.made >= WV.quota) break;
      g.next -= dt; if (g.next > 0) continue; g.next = g.every;
      if (alive().length >= CAP) continue;
      const use = g.born % 2 === 1 ? g.alt : g.tpl;
      if (Math.hypot(g.x - P.x, g.z - P.z) < 2.5) continue;
      for (let bn = 0; bn < 2 && WV.made < WV.quota; bn++) {
        let sx = g.x + rr(-1.2, 1.2), sz = g.z + rr(-1.2, 1.2);
        if (WV.rush) { const q = nearestOnLine(lerp(g.x, 0, WV.rush), lerp(g.z, 0, WV.rush)); sx = q.x + rr(-2, 2); sz = q.z + rr(-2, 2); }
        if (!walkable(sx, sz, 0.8)) { const q = nearestOnLine(sx, sz); sx = q.x; sz = q.z; }
        const f = spawnFoe(use, sx, sz, { active: true }); f.cd = rr(0.8, 1.6);
        g.born++; WV.made++; skyBeam(sx, sz); burst(v3.set(g.x, 2.4, g.z), 10, 5);
      }
    }
    if (WV.made >= WV.quota && alive().length <= 10) {
      WV.state = 'lull'; WV.timer = 2; WV.rush = 0; callOut('WAVE ' + WV.wave + ' BROKEN', '#7fe3ff', 1.6);
      addPickup('cell', P.x + 1.5, P.z - 0.7, { life: 30 });
      if (WV.wave % 3 === 0) addPickup('rapid', P.x - 1.5, P.z - 0.7, { life: 30 }); else if (WV.wave % 2 === 0) addPickup('triple', P.x - 1.5, P.z - 0.7, { life: 30 });
    }
  }

  // ---------- the mission (updateBridgeMission / bridgeExitAsk / leaveBridge) ----------
  const inExit = () => EXITS.some(e => Math.hypot(P.x - e.x, P.z - e.z) < 4.6);
  const gatesStanding = n => (n === 1 ? '1 gate is' : n + ' gates are');
  function exitAsk() {
    if (St.prompt || St.done || St.exitAsked) return; St.exitAsked = true;
    const left = gatesLeft();
    if (!left) { St.cleared = true; prompt('TRANSPORT TO MERU', 'All objectives complete. BONUS: ' + BONUS + ' CREDITS.', [['TRANSPORT NOW', () => leave(true)], ['STAY A MOMENT']]); return; }
    if (WV.wave < WAVES) { prompt('TRANSPORT LOCKED', 'Survive ' + WAVES + ' waves to TRANSPORT to MERU.', [['BACK TO THE DECK']]); return; }
    St.cleared = true; prompt('LEAVE BATTLE?', 'Objective 1 of 2 complete. ' + gatesStanding(left) + ' still standing — destroy them all for a ' + BONUS + ' CREDIT bonus.', [['TRANSPORT NOW', () => leave(false)], ['KEEP FIGHTING']]);
  }
  function updateMission() {
    if (St.done || St.prompt || !St.beamDone || St.defeated) return;
    if (St.exitAsked && !inExit()) St.exitAsked = false;
    if (!gatesLeft()) { St.cleared = true; prompt('ALL GATES DESTROYED', 'The network is down and the transport is clear. BONUS: ' + BONUS + ' CREDITS.', [['TRANSPORT NOW', () => leave(true)]]); return; }
    if (!St.asked && WV.wave >= WAVES && WV.state === 'lull') { St.asked = true; St.cleared = true; prompt('MISSION COMPLETE', WAVES + ' waves broken. The transport can complete. ' + gatesStanding(gatesLeft()) + ' still standing — destroy them all for a ' + BONUS + ' CREDIT bonus.', [['TRANSPORT NOW', () => leave(false)], ['KEEP FIGHTING']]); return; }
    if (inExit()) exitAsk();
  }
  function beginBeam(out, done) { St.beam = { out, t: 0, life: 118 / 60, x: P.x, z: P.z, done }; P.inv = Math.max(P.inv, St.beam.life + 0.33); audio.tone(out ? 660 : 330, 1.4, 0.05, 'sine', out ? 0.5 : 2); audio.burst(0.8, 3000, 0.08); }
  function leave(bonus) {
    St.done = true; St.leaving = true; exitTurret(); P.hp = 100; P.en = 100;
    foes.forEach(f => { clearAim(f); });
    beginBeam(true, () => {
      save.setFlag('bridgeDone'); if (bonus) { save.addGold(BONUS); save.setFlag('bridgeGates'); }
      save.where('meru', 'meruTown'); try { sessionStorage.setItem('meru.spawn', 'pad'); } catch (e) {}
      onNavigate('Meru Town Square.dc.html');
    });
  }
  function brief() { St.briefed = true; prompt('TRANSPORT INTERRUPTED', 'Survive ' + WAVES + ' waves of enemies to complete the TRANSPORT. DESTROY 4 enemy GATES for a BONUS.', [['HOLD THE BRIDGE', () => { audio.init(); audio.setMuted(St.muted); fox.visible = true; noble.visible = true; hope.visible = true; beginBeam(false, () => { St.beamDone = true; WV.state = 'lull'; WV.timer = 50 / 60 + 0.6; }); }]]); }
  function restart() { resetAll(); brief(); }

  // ---------- NOBLE, on the deck with you, and his SHOEMERANG (surface_meru.html shoemerang_attack) ----------
  // He lost both feet in the war; his drone boots are what he has instead. One comes off, goes OUT on a curve
  // for a full hit (laser +20%), comes BACK homing for 55%, then ORBITS his head for 4 s clipping anything close.
  // One at a time, alternating feet. Shorter reach than the laser (430 map units).
  const SH = { RANGE: 430 / U, OUT: 26 / 60, ARC: 46 / U, HOME_MAX: 21, HOME_ACC: 360, DRAG: 0.86, CATCH: 46 / U, GIVE_UP: 2.5, ORBIT: 4, ORBIT_W: 0.155 * 60, ORBIT_R: 62 / U, HIT_R: 58 / U, HIT_R_BACK: 76 / U, RET: 0.55, GUARD: 0.2, GUARD_R: 92 / U, GUARD_CD: 40 / 60, KNOCK: 1.2, KNOCK_BACK: 2.4, DMG: Math.round(DMG.RAYGUN * 1.2) };
  const NOB = { x: 1.8, z: 1.4, face: 2.51, vx: 0, vz: 0, cd: 1, throwT: 0, shoe: null, foot: -1, lastLabel: -9, look: new THREE.Vector3() };
  const noble = cast.make('noble');
  const NBS = noble.scale.x, NP = noble.userData.P; noble.visible = false;
  const nobleChair = noble.userData.rig;   // engine/cast.js (Noble Workshop)
  const nobBoots = nobleChair.boots;
  const sockMat = new THREE.MeshToonMaterial({ color: '#7dd3fc', gradientMap: grad, emissive: new THREE.Color('#7dd3fc'), emissiveIntensity: 1.4 });
  const nobSockets = NP.legs.map((p, i) => { const b = nobBoots[i]; const k = M(new THREE.CylinderGeometry(0.07, 0.09, 0.08, 12), sockMat, b ? b.position.x : 0, b ? b.position.y + 0.04 : -0.38, b ? b.position.z : 0, b ? b.parent : p, 0); k.visible = false; return k; });
  const beamCol2 = beamCol.clone(); scene.add(beamCol2);
  const shoeMesh = new THREE.Group(); scene.add(shoeMesh); shoeMesh.visible = false;
  { const body = new THREE.Group(); shoeMesh.add(body); shoeMesh.userData.body = body;
    M(new THREE.SphereGeometry(0.2, 16, 12), toon('#1e293b'), 0, 0, 0.05, body, 0.025, 0.2).scale.set(1, 0.62, 1.35);
    M(BOX(0.3, 0.06, 0.52), toon('#0f172a'), 0, -0.11, 0.05, body, 0.015);
    M(BOX(0.32, 0.04, 0.2), sockMat, 0, 0.02, -0.12, body, 0);
    for (const sx of [-1, 1]) { const r = M(new THREE.TorusGeometry(0.09, 0.02, 6, 16), toon('#94a3b8'), sx * 0.22, 0.02, 0.05, body, 0); r.rotation.y = Math.PI / 2; }
    glowSprite(0, 0, -0.2, 0x7dd3fc, 0.9, 0.8, body); shoeMesh.scale.setScalar(1.3); }
  const trailS = Array.from({ length: 16 }, () => ({ s: glowSprite(0, -99, 0, 0x7dd3fc, 0.5, 0), t: 1 })); let trailI = 0;
  function nobleLaunch(t) {
    const fl = NOB.shoe; if (fl && fl.phase !== 'orbit') return false;
    const foot = NOB.foot = -1, i = 0;   // always his right boot (legs[0]) noble.updateMatrixWorld(true); (nobBoots[i] || NP.legs[i]).getWorldPosition(v5);
    let dx = t.x - v5.x, dz = t.z - v5.z; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    NOB.shoe = { phase: 'out', t: 0, life: 0, foot, ox: v5.x, oy: v5.y, oz: v5.z, dx, dz, px: -dz * foot, pz: dx * foot, ty: tgtY(t), x: v5.x, y: v5.y, z: v5.z, vx: 0, vy: 0, vz: 0, hitOut: new Set(), hitBack: new Set(), guard: new Map(), ang: 0, orbitT: 0 };
    NOB.throwT = 0.25; audio.burst(0.12, 2600, 0.1); audio.tone(620, 0.12, 0.03, 'triangle', 1.6); return true;
  }
  function shoeStrike(fl, amount, set, knock, reach) {
    let n = 0;
    for (const f of targets()) {
      if (set.has(f)) continue; const h = Math.hypot(f.x - fl.x, f.z - fl.z), r = reach + (f.kind === 'gate' ? 1.2 : f.boss ? 0.6 : 0.3);
      if (h > r || Math.abs(tgtY(f) - fl.y) > (f.kind === 'gate' ? 3 : 1.6)) continue;
      set.add(f); damageTarget(f, amount, 'SHOE'); n++;
      if (f.kind !== 'gate' && !f.dead) { const vl = Math.hypot(fl.vx, fl.vz) || 1; f.kx += fl.vx / vl * knock * 2.2; f.kz += fl.vz / vl * knock * 2.2; if (f.kind === 'bot') f.stagger = Math.max(f.stagger, 0.25); }
    }
    return n;
  }
  // ---------- HOPE, with her long white cane (engine/cane.js; tuned in Cane Workshop.dc.html, presets/cane.json) ----------
  // She follows behind-right (Noble has behind-left), sweeps in step as she walks, and SHOCKS anything that
  // gets within cane reach (2D combat: meleeDamage 12, attackCooldownFrames 70). Enemies do not target her.
  const HOP = { x: -0.13, z: 2.88, face: 2.51, vx: 0, vz: 0, cd: 1, spin: -1, lastLabel: -9, caneHit: new Set(), pulseHit: new Set(), ox: 0, oz: 0 };
  // her SPIN: anything inside cane reach takes sword damage; the PULSE goes out twice as far for half
  const HSH = { CD: 1.5, PULSE_P: 0.58, PULSE_T: 0.32, DMG: DMG.SWORD, PULSE: DMG.SWORD / 2 };
  const hPulseMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const hPulse = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 64), hPulseMat); hPulse.rotation.x = -Math.PI / 2; hPulse.visible = false; scene.add(hPulse);
  const hPulse2 = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 64), hPulseMat); hPulse2.rotation.x = -Math.PI / 2; hPulse2.position.y = 0.9; hPulse2.visible = false; scene.add(hPulse2);
  const hope = cast.make('hope', { mood: 'determined' });
  const HBS = hope.scale.x; hope.visible = false;
  const hopeCane = hope.userData.rig;   // engine/cast.js (Cane Workshop)
  const beamCol3 = beamCol.clone(); scene.add(beamCol3); beamCol3.visible = false;
  function updateHope(dt, on) {
    if (!hope.visible) return;
    const acting = on && !St.beam;
    if (!St.leaving && !St.defeated && St.beamDone) {
      const fx = P.inTurret ? TU.x : P.x, fz = P.inTurret ? TU.z : P.z, back = P.inTurret ? TU.ang : P.face;
      let gx = fx - Math.sin(back) * 2.4 - Math.cos(back) * 1.6, gz = fz - Math.cos(back) * 2.4 + Math.sin(back) * 1.6;
      if (!walkable(gx, gz, 0.8)) { const q = nearestOnLine(gx, gz); gx = lerp(gx, q.x, 0.7); gz = lerp(gz, q.z, 0.7); }
      const dx = gx - HOP.x, dz = gz - HOP.z, d = Math.hypot(dx, dz);
      if (Math.hypot(fx - HOP.x, fz - HOP.z) > 22) { HOP.x = gx; HOP.z = gz; if (!walkable(HOP.x, HOP.z)) { HOP.x = fx; HOP.z = fz; } burst(v3.set(HOP.x, 1, HOP.z), 20, 5); }
      const sp = d > 0.6 ? Math.min(6.4, d * 2.2) : 0;
      HOP.vx = damp(HOP.vx, d > 0.01 ? dx / d * sp : 0, 8, dt); HOP.vz = damp(HOP.vz, d > 0.01 ? dz / d * sp : 0, 8, dt);
      const nx = HOP.x + HOP.vx * dt, nz = HOP.z + HOP.vz * dt;
      if (walkable(nx, nz, 0.55)) { HOP.x = nx; HOP.z = nz; } else if (walkable(nx, HOP.z, 0.55)) HOP.x = nx; else if (walkable(HOP.x, nz, 0.55)) HOP.z = nz;
      const obs = [...COVERS.map(c => ({ x: c.x, z: c.z, r: c.r * 0.9 + 0.6 })), { x: TU.x, z: TU.z, r: 1.6 }, ...liveGates().map(g => ({ x: g.x, z: g.z, r: 2.1 })), { x: NOB.x, z: NOB.z, r: 1.2 }]; if (!P.inTurret) obs.push({ x: P.x, z: P.z, r: 1.0 });
      for (const o of obs) { const ex = HOP.x - o.x, ez = HOP.z - o.z, ed = Math.hypot(ex, ez); if (ed < o.r && ed > 1e-3) { HOP.x = o.x + ex / ed * o.r; HOP.z = o.z + ez / ed * o.r; } }
    }
    const RW = hopeCane.reachU() * HBS, PW = RW * 2, edge = f => Math.hypot(f.x - HOP.x, f.z - HOP.z) - (f.kind === 'gate' ? 1.6 : f.boss ? 0.8 : 0.4);
    let tgt = null;
    if (acting) { let bd = PW; for (const f of targets()) { if (f.dead || (f.kind !== 'gate' && !f.active)) continue; const dd = edge(f); if (dd < bd) { bd = dd; tgt = f; } } }
    HOP.cd -= dt;
    if (tgt && HOP.cd <= 0 && hopeCane.swing()) { HOP.cd = HSH.CD; HOP.face = Math.atan2(tgt.x - HOP.x, tgt.z - HOP.z); HOP.spin = 0; HOP.ox = HOP.x; HOP.oz = HOP.z; HOP.caneHit.clear(); HOP.pulseHit.clear(); audio.burst(0.16, 1400, 0.07); audio.tone(300, 0.3, 0.04, 'sawtooth', 2.2); }
    if (HOP.spin >= 0) {
      HOP.spin += dt; const t = HOP.spin;
      if (hopeCane.inWindow() && acting) { let n = 0;
        for (const f of targets()) { if (f.dead || HOP.caneHit.has(f) || edge(f) > RW) continue; const da = Math.atan2(f.x - HOP.x, f.z - HOP.z) - HOP.face; if (Math.abs(Math.atan2(Math.sin(da), Math.cos(da))) > hopeCane.facingSector) continue; HOP.caneHit.add(f); damageTarget(f, HSH.DMG, 'CANE'); n++;
          if (f.kind !== 'gate' && !f.dead) { const dx = f.x - HOP.x, dz = f.z - HOP.z, d = Math.hypot(dx, dz) || 1, kb = f.boss ? 1 : 4.5; f.kx += dx / d * kb; f.kz += dz / d * kb; if (f.kind === 'bot') f.stagger = Math.max(f.stagger || 0, 0.35); } }
        if (n) { burst(v3.copy(hopeCane.tipW), 22, 6); audio.tone(880, 0.1, 0.05, 'square', 0.5); if (St.t - HOP.lastLabel > 2.5) { HOP.lastLabel = St.t; popup(v3.set(HOP.x, 2.6, HOP.z), 'CANE SWING', '#e0f2fe'); } } }
      const q = (t - hopeCane.SWD * HSH.PULSE_P) / HSH.PULSE_T;
      if (q > 0 && q < 1) { const r = Math.max(0.01, PW * q); hPulse.visible = hPulse2.visible = true; hPulse.position.set(HOP.ox, 0.08, HOP.oz); hPulse2.position.set(HOP.ox, 0.9, HOP.oz); hPulse.scale.setScalar(r); hPulse2.scale.setScalar(r * 0.98); hPulseMat.opacity = 0.85 * (1 - q);
        if (acting) for (const f of targets()) { if (f.dead || HOP.caneHit.has(f) || HOP.pulseHit.has(f)) continue; const d = Math.hypot(f.x - HOP.ox, f.z - HOP.oz) - (f.kind === 'gate' ? 1.6 : f.boss ? 0.8 : 0.4); if (d > r) continue;
          HOP.pulseHit.add(f); damageTarget(f, HSH.PULSE, 'CANE'); if (f.kind !== 'gate' && !f.dead) { const dx = f.x - HOP.ox, dz = f.z - HOP.oz, dd = Math.hypot(dx, dz) || 1, kb = f.boss ? 0.5 : 2.5; f.kx += dx / dd * kb; f.kz += dz / dd * kb; } } }
      else if (q >= 1) { hPulse.visible = hPulse2.visible = false; HOP.spin = -1; }
      if (q > 0 && q < 0.06) audio.burst(0.2, 3200, 0.06);
    }
    const hs = Math.hypot(HOP.vx, HOP.vz), want = tgt ? Math.atan2(tgt.x - HOP.x, tgt.z - HOP.z) : hs > 0.4 ? Math.atan2(HOP.vx, HOP.vz) : HOP.face;
    let df = want - HOP.face; df = Math.atan2(Math.sin(df), Math.cos(df)); if (!(hopeCane.swT >= 0)) HOP.face += df * Math.min(1, dt * 6);
    hope.position.set(HOP.x, 0, HOP.z); hope.rotation.y = HOP.face;
    animFox(hope, dt, hs);
  }
  function updateNoble(dt, on) {
    trailS.forEach(p => { if (p.t < 1) { p.t += dt * 3; p.s.material.opacity = 0.7 * Math.max(0, 1 - p.t); p.s.scale.setScalar(0.6 * (1 - p.t * 0.5)); } else p.s.material.opacity = 0; });
    if (!noble.visible) return;
    const acting = on && !St.beam;
    if (!St.leaving && !St.defeated && St.beamDone) {
      const fx = P.inTurret ? TU.x : P.x, fz = P.inTurret ? TU.z : P.z, back = P.inTurret ? TU.ang : P.face;
      let gx = fx - Math.sin(back) * 2.4 + Math.cos(back) * 1.6, gz = fz - Math.cos(back) * 2.4 - Math.sin(back) * 1.6;
      if (!walkable(gx, gz, 0.8)) { const q = nearestOnLine(gx, gz); gx = lerp(gx, q.x, 0.7); gz = lerp(gz, q.z, 0.7); }
      const dx = gx - NOB.x, dz = gz - NOB.z, d = Math.hypot(dx, dz);
      if (Math.hypot(fx - NOB.x, fz - NOB.z) > 22) { NOB.x = gx; NOB.z = gz; if (!walkable(NOB.x, NOB.z)) { NOB.x = fx; NOB.z = fz; } burst(v3.set(NOB.x, 1, NOB.z), 20, 5); }
      const sp = d > 0.6 ? Math.min(7.2, d * 2.4) : 0;
      NOB.vx = damp(NOB.vx, d > 0.01 ? dx / d * sp : 0, 8, dt); NOB.vz = damp(NOB.vz, d > 0.01 ? dz / d * sp : 0, 8, dt);
      const nx = NOB.x + NOB.vx * dt, nz = NOB.z + NOB.vz * dt;
      if (walkable(nx, nz, 0.55)) { NOB.x = nx; NOB.z = nz; } else if (walkable(nx, NOB.z, 0.55)) NOB.x = nx; else if (walkable(NOB.x, nz, 0.55)) NOB.z = nz;
      const obs = [...COVERS.map(c => ({ x: c.x, z: c.z, r: c.r * 0.9 + 0.6 })), { x: TU.x, z: TU.z, r: 1.6 }, ...liveGates().map(g => ({ x: g.x, z: g.z, r: 2.1 }))]; if (!P.inTurret) obs.push({ x: P.x, z: P.z, r: 1.0 });
      for (const o of obs) { const ex = NOB.x - o.x, ez = NOB.z - o.z, ed = Math.hypot(ex, ez); if (ed < o.r && ed > 1e-3) { NOB.x = o.x + ex / ed * o.r; NOB.z = o.z + ez / ed * o.r; } }
    }
    let tgt = null;
    if (acting) { let bd = 1e9; for (const f of targets()) { if (f.kind !== 'gate' && !f.active) continue; const dd = Math.hypot(f.x - NOB.x, f.z - NOB.z); if (dd > SH.RANGE + 0.5) continue; const sc = dd - (St.lock === f ? 3 : 0) + (f.kind === 'gate' ? 1 : 0); if (sc < bd) { bd = sc; tgt = f; } } }
    NOB.cd -= dt; NOB.throwT = Math.max(0, NOB.throwT - dt);
    if (tgt && NOB.cd <= 0 && nobleLaunch(tgt)) NOB.cd = rr(0.7, 1.0);
    const hs = Math.hypot(NOB.vx, NOB.vz), want = tgt ? Math.atan2(tgt.x - NOB.x, tgt.z - NOB.z) : hs > 0.4 ? Math.atan2(NOB.vx, NOB.vz) : NOB.face;
    let df = want - NOB.face; df = Math.atan2(Math.sin(df), Math.cos(df)); NOB.face += df * Math.min(1, dt * 8);
    noble.position.set(NOB.x, 0, NOB.z); noble.rotation.y = NOB.face; noble.userData.lookAt = tgt ? NOB.look.set(tgt.x, tgtY(tgt), tgt.z) : null;
    nobleChair.throwT = NOB.throwT; animFox(noble, dt, hs);
    const fl = NOB.shoe;
    nobBoots.forEach((b, i) => { const off = !!fl && (fl.foot > 0 ? 1 : 0) === i; if (b) b.visible = !off; nobSockets[i].visible = off; });
    if (!fl) { shoeMesh.visible = false; return; }
    shoeMesh.visible = true; fl.life += dt;
    const hx = NOB.x, hy = 1.95, hz = NOB.z;
    if (fl.phase === 'out') {
      fl.t = Math.min(1, fl.t + dt / SH.OUT);
      const fwd = SH.RANGE * Math.sin(fl.t * Math.PI / 2), sd = SH.ARC * Math.sin(fl.t * Math.PI);
      const nx = fl.ox + fl.dx * fwd + fl.px * sd, nz = fl.oz + fl.dz * fwd + fl.pz * sd, ny = lerp(fl.oy, fl.ty, Math.sin(fl.t * Math.PI / 2)) + 0.5 * Math.sin(fl.t * Math.PI);
      const idt = 1 / Math.max(dt, 1e-4); fl.vx = (nx - fl.x) * idt; fl.vy = (ny - fl.y) * idt; fl.vz = (nz - fl.z) * idt; fl.x = nx; fl.y = ny; fl.z = nz;
      if (shoeStrike(fl, SH.DMG, fl.hitOut, SH.KNOCK, SH.HIT_R) && St.t - NOB.lastLabel > 2.5) { NOB.lastLabel = St.t; popup(v3.set(fl.x, fl.y + 1.3, fl.z), 'SHOEMERANG', '#7dd3fc'); }
      if (fl.t >= 1) { fl.phase = 'back'; fl.vx = fl.vy = fl.vz = 0; }
    } else if (fl.phase === 'back') {
      const tx = hx - fl.x, ty = hy - fl.y, tz = hz - fl.z, tl = Math.hypot(tx, ty, tz) || 1, dr = Math.pow(SH.DRAG, dt * 60), a = SH.HOME_ACC * dt / tl;
      fl.vx = fl.vx * dr + tx * a; fl.vy = fl.vy * dr + ty * a; fl.vz = fl.vz * dr + tz * a;
      const sp = Math.hypot(fl.vx, fl.vy, fl.vz); if (sp > SH.HOME_MAX) { const k = SH.HOME_MAX / sp; fl.vx *= k; fl.vy *= k; fl.vz *= k; }
      fl.x += fl.vx * dt; fl.y += fl.vy * dt; fl.z += fl.vz * dt;
      shoeStrike(fl, Math.max(2, Math.round(SH.DMG * SH.RET)), fl.hitBack, SH.KNOCK_BACK, SH.HIT_R_BACK);
      if (tl < SH.CATCH + 0.3 || fl.life > SH.GIVE_UP) { fl.phase = 'orbit'; fl.orbitT = SH.ORBIT; fl.ang = Math.atan2(fl.x - hx, fl.z - hz); audio.tone(880, 0.08, 0.03, 'triangle'); }
    } else {
      fl.orbitT -= dt; fl.ang += SH.ORBIT_W * dt; fl.x = hx + Math.sin(fl.ang) * SH.ORBIT_R; fl.z = hz + Math.cos(fl.ang) * SH.ORBIT_R; fl.y = hy + Math.sin(fl.ang * 2) * 0.08;
      if (acting) for (const f of alive()) { if (!f.active || Math.hypot(f.x - hx, f.z - hz) > SH.GUARD_R + f.rad) continue; if (fl.life < (fl.guard.get(f) || 0)) continue; fl.guard.set(f, fl.life + SH.GUARD_CD); damageTarget(f, Math.max(2, Math.round(SH.DMG * SH.GUARD)), 'SHOE'); }
      if (fl.orbitT <= 0) { NOB.shoe = null; shoeMesh.visible = false; audio.tone(500, 0.06, 0.03, 'triangle'); return; }
    }
    shoeMesh.position.set(fl.x, fl.y, fl.z); const body = shoeMesh.userData.body;
    if (fl.phase === 'orbit') { body.rotation.set(0, 0, 0); shoeMesh.rotation.y = fl.ang + Math.PI / 2; } else { body.rotation.y += dt * 33; }
    if (fl.phase !== 'orbit' && rnd() < 0.85) { const p = trailS[trailI]; trailI = (trailI + 1) % trailS.length; p.s.position.set(fl.x, fl.y, fl.z); p.t = 0; }
  }

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, hudKey = '', hudT = 0;
  const camPos = new THREE.Vector3(0, 8, 8), camLook = new THREE.Vector3();
  function update(dt) {
    const rdt = dt; St.t += dt;
    if (St.hitStop > 0) { St.hitStop -= dt; dt *= 0.08; }
    if (St.slow > 0) { St.slow -= dt; dt *= 0.35; }
    const on = fightOn(), canAct = on && !St.beam;
    // the beam
    const B = St.beam;
    if (B) {
      B.t += rdt; const k = Math.min(1, B.t / B.life);
      beamCol.position.set(B.x, 8, B.z); beamCol.material.opacity = Math.sin(k * Math.PI) * 0.75; beamCol.scale.set(1 - k * 0.3, 1, 1 - k * 0.3);
      motes.material.opacity = Math.sin(k * Math.PI);
      MOTES.forEach((m, i) => { const a = m.a + B.t * 3 * m.sp, y = ((m.ph + B.t * m.sp) % 1) * 3.4; moteArr[i * 3] = B.x + Math.cos(a) * m.r * 1.6; moteArr[i * 3 + 1] = B.out ? 3.4 - y : y; moteArr[i * 3 + 2] = B.z + Math.sin(a) * m.r * 1.6; }); moteGeo.attributes.position.needsUpdate = true;
      const sc = B.out ? 1 - smooth(0.15, 0.65, k) : smooth(0.35, 0.85, k); fox.scale.set(Math.max(0.001, sc), Math.max(0.001, sc * (B.out ? 1 + k : 1)), Math.max(0.001, sc));
      noble.scale.set(NBS * Math.max(0.001, sc), NBS * Math.max(0.001, sc * (B.out ? 1 + k : 1)), NBS * Math.max(0.001, sc)); beamCol2.position.set(NOB.x, 8, NOB.z); beamCol2.scale.copy(beamCol.scale); beamCol2.visible = noble.visible;
      hope.scale.set(HBS * Math.max(0.001, sc), HBS * Math.max(0.001, sc * (B.out ? 1 + k : 1)), HBS * Math.max(0.001, sc)); beamCol3.position.set(HOP.x, 8, HOP.z); beamCol3.scale.copy(beamCol.scale); beamCol3.visible = hope.visible;
      if (k >= 1) { St.beam = null; beamCol.material.opacity = 0; motes.material.opacity = 0; fox.scale.setScalar(1); noble.scale.setScalar(NBS); hope.scale.setScalar(HBS); if (B.out) { fox.visible = false; noble.visible = false; hope.visible = false; } B.done && B.done(); }
    }
    // player
    if (!St.prompt && St.briefed && !St.defeated && !St.leaving && !(B && !B.out)) {
      let ix = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + input.jx;
      let iy = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) + input.jy;
      const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
      const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw), rx = Math.cos(St.yaw), rz = -Math.sin(St.yaw);
      let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix; const ml = Math.hypot(mx, mz); if (ml > 0) { mx /= ml; mz /= ml; }
      if (St.lock && (St.lock.dead || Math.hypot(St.lock.x - P.x, St.lock.z - P.z) > 32)) St.lock = null;
      if (P.inTurret) {
        if (il > 0.2) { const want = Math.atan2(mx, mz); let da = want - TU.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); TU.ang += clamp(da, -2.6 * dt, 2.6 * dt); }
        if (St.lock) { const want = Math.atan2(St.lock.x - TU.x, St.lock.z - TU.z); let da = want - TU.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); TU.ang += clamp(da, -3 * dt, 3 * dt); }
        TU.cool -= dt; if ((St.held || St.mouseHeld || keys.has('KeyF') || keys.has('KeyJ')) && canAct) api.attack();
        P.x = TU.x - Math.sin(TU.ang) * 0.95; P.z = TU.z - Math.cos(TU.ang) * 0.95; P.face = TU.ang; P.y = 0; P.vx = P.vz = 0;
        St.soft = canAct ? pickTarget(TU.ang, 28) : null; P.target = St.lock || St.soft;
        St.dragT = (St.dragT || 0) - dt; if (St.dragT <= 0) { let dy = (TU.ang + Math.PI) - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, dt * 3); }
        fox.position.set(P.x, 0.35, P.z); fox.rotation.y = P.face; animFox(fox, dt, 0); hand.rotation.set(-1.3, 0, 0.2); gunArm.rotation.set(-1.3, 0, -0.2);
      } else {
        const spd = (P.swing > 0 ? 3.2 : 6.4) * Math.min(1, il);
        if (P.lungeT > 0) { P.lungeT -= dt; P.vx = P.ldx * P.lsp; P.vz = P.ldz * P.lsp; }
        else if (P.dash > 0) { P.dash -= dt; P.vx = P.dx * 17; P.vz = P.dz * 17; if (rnd() < 0.6) burst(v3.set(P.x, 0.2, P.z), 1, 1.5); }
        else { P.vx = damp(P.vx, mx * spd, 18, dt); P.vz = damp(P.vz, mz * spd, 18, dt); }
        if (B) { P.vx = P.vz = 0; }
        const nx = P.x + P.vx * dt, nz = P.z + P.vz * dt;
        if (walkable(nx, nz)) { P.x = nx; P.z = nz; } else if (walkable(nx, P.z)) P.x = nx; else if (walkable(P.x, nz)) P.z = nz;
        for (const c of COVERS) { const ex = P.x - c.x, ez = P.z - c.z, ed = Math.hypot(ex, ez), m = c.r * 0.9 + 0.4; if (ed < m && ed > 1e-3) { P.x = c.x + ex / ed * m; P.z = c.z + ez / ed * m; } }
        for (const o of [{ x: TU.x, z: TU.z, r: 1.4 }, ...gates.filter(g => !g.dead).map(g => ({ x: g.x, z: g.z, r: 1.9 }))]) { const ex = P.x - o.x, ez = P.z - o.z, ed = Math.hypot(ex, ez); if (ed < o.r && ed > 1e-3) { P.x = o.x + ex / ed * o.r; P.z = o.z + ez / ed * o.r; } }
        for (const f of alive()) { if (f.kind !== 'bot') continue; const ex = P.x - f.x, ez = P.z - f.z, ed = Math.hypot(ex, ez), r0 = f.rad + 0.45; if (ed < r0 && ed > 1e-3) { P.x = f.x + ex / ed * r0; P.z = f.z + ez / ed * r0; } }
        const hs = Math.hypot(P.vx, P.vz);
        St.soft = canAct ? pickTarget() : null; P.target = St.lock || St.soft;
        let wantFace = hs > 0.4 ? Math.atan2(P.vx, P.vz) : P.face;
        if ((P.swing > 0 || P.fireCd > 0.1) && P.target) wantFace = Math.atan2(P.target.x - P.x, P.target.z - P.z);
        let df = wantFace - P.face; df = Math.atan2(Math.sin(df), Math.cos(df)); P.face += df * Math.min(1, dt * 14);
        St.dragT = (St.dragT || 0) - dt;
        if (St.lock && St.dragT <= 0) { const want = Math.atan2(P.x - St.lock.x, P.z - St.lock.z); let dy = want - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, dt * 2.4); }
        else if (opts.followCam && hs > 0.6 && St.dragT <= 0 && P.dash <= 0) { let dy = (Math.atan2(P.vx, P.vz) + Math.PI) - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, dt * 1.6); }
        if (input.jump && P.ground && !B) { P.vy = 8; P.ground = false; } input.jump = false;
        P.vy -= 24 * dt; P.y += P.vy * dt; if (P.y <= 0) { P.y = 0; P.vy = 0; P.ground = true; }
        if (P.ground && hs > 1 && P.dash <= 0) { P.stepT -= dt * hs; if (P.stepT < 0) { P.stepT = 2.2; audio.step(); } }
        if (St.attackQueued && P.swing <= 0) { St.attackQueued = false; api.attack(); }
        if (canAct && P.weapon === 'RAYGUN' && (St.held || St.mouseHeld || keys.has('KeyF') || keys.has('KeyJ'))) api.attack();
        if (P.swing > 0) {
          const dur = P.swingDur, prog = 1 - P.swing / dur; P.swing -= dt; const side = P.combo % 2 ? -1 : 1;
          P.pose = { prog, side, combo: P.combo };
          trail.rotation.z = P.combo === 3 ? -prog * Math.PI * 2 : side * lerp(1.0, -1.0, prog) + Math.PI; trailMat.opacity = Math.sin(prog * Math.PI) * (P.crit > 0 ? 0.9 : 0.6);
          if (prog > 0.15 && prog < 0.85) for (const f of targets()) {
            if (P.swingHit.has(f)) continue; const dx = f.x - P.x, dz = f.z - P.z, d = Math.hypot(dx, dz), reach = f.kind === 'gate' ? 3.9 : f.kind === 'drone' ? 2.4 + f.rad * 0.5 : f.boss ? 3.3 : 2.8;
            const a2 = Math.atan2(Math.sin(Math.atan2(dx, dz) - P.face), Math.cos(Math.atan2(dx, dz) - P.face));
            const yOk = f.kind === 'drone' ? (f.y < 2.4 || P.y > 0.6) : true;
            if (d < reach + 0.4 && Math.abs(a2) < (P.combo === 3 ? 3.2 : 1.5) && yOk) { P.swingHit.add(f); const crit = P.crit > 0; damageTarget(f, Math.round(DMG.SWORD * (P.combo === 3 ? 1.4 : 1) * (crit ? 1.6 : 1)), 'SWORD'); if (crit) { St.hitStop = 0.16; P.crit = 0; } }
          }
        } else { P.pose = null; trailMat.opacity = damp(trailMat.opacity, 0, 12, dt); hand.rotation.y = damp(hand.rotation.y, 0, 10, dt); FP.body.rotation.y = 0; }
        fox.position.set(P.x, P.y, P.z); fox.rotation.y = P.face;
        fox.userData.mood = P.hurt > 0 ? 'stern' : 'determined';
        animFox(fox, dt, P.dash > 0 ? 0 : hs, !P.ground);
        if (P.dash > 0) FP.body.rotation.x = (1 - P.dash / 0.24) * Math.PI * 2; else FP.body.rotation.x = damp(FP.body.rotation.x % (Math.PI * 2), 0, 14, dt);
        if (P.pose) {
          const { prog, combo } = P.pose, sp = smooth(0, 1, prog);
          if (combo === 1) { hand.rotation.set(prog < 0.3 ? lerp(-1.0, -3.0, prog / 0.3) : lerp(-3.0, -0.3, Math.pow((prog - 0.3) / 0.7, 0.7)), 0, 0.12); sword.rotation.set(Math.PI - 0.3, 0, 0); FP.body.rotation.x = prog < 0.3 ? -0.08 : 0.16 * Math.sin((prog - 0.3) / 0.7 * Math.PI); }
          else if (combo === 2) { hand.rotation.set(-1.45, 0, lerp(1.35, -1.25, sp)); sword.rotation.set(Math.PI - 0.15, 0, 0); FP.body.rotation.y = lerp(0.5, -0.55, sp); }
          else { hand.rotation.set(-1.5, 0, 0.9); sword.rotation.set(Math.PI - 0.2, 0, 0); FP.body.rotation.y = -sp * Math.PI * 2; FP.body.position.y += Math.sin(prog * Math.PI) * 0.25; }
        }
        if (P.weapon === 'RAYGUN' && (P.fireCd > 0 || P.target)) { gunArm.rotation.set(-1.48 - (P.recoil || 0) * 0.35, 0, -0.08); gun.rotation.set(1.43 - (P.recoil || 0) * 0.5, 0, 0); }
      }
      P.fireCd = Math.max(0, P.fireCd - dt); P.dashCd = Math.max(0, P.dashCd - dt); P.inv = Math.max(0, P.inv - dt); P.hurt = Math.max(0, P.hurt - dt); P.crit = Math.max(0, (P.crit || 0) - dt); P.rapid = Math.max(0, P.rapid - dt);
      P.enT -= dt; if (P.enT < 0) P.en = Math.min(100, P.en + dt * 22);
      P.comboT -= dt; if (P.comboT < 0) P.combo = 0;
      P.recoil = damp(P.recoil || 0, 0, 14, dt); if (P.crit > 0) FP.bladeMat.emissiveIntensity = 2.8;
      sword.scale.setScalar(P.weapon === 'SWORD' || P.pose ? 0.8 : 0.72);
      flash.material.opacity = damp(flash.material.opacity, 0, 18, dt);
      if (!B) fox.visible = !(P.inv > 0 && P.hurt > 0 && Math.floor(St.t * 20) % 2 === 0) || P.inTurret;
    } else if (St.defeated) { FP.body.rotation.x = damp(FP.body.rotation.x, -1.3, 6, dt); fox.position.y = damp(fox.position.y, 0.15, 6, dt); animFox(fox, dt, 0); }
    else { fox.position.set(P.x, P.y, P.z); fox.rotation.y = P.face; animFox(fox, dt, 0); }
    TU.head.rotation.y = TU.ang; TU.head.position.y = 1.15 - (TU.kick || 0) * 0.04; TU.kick = damp(TU.kick || 0, 0, 12, dt);
    reticle.visible = !!P.target && !St.prompt && (P.weapon === 'RAYGUN' || P.inTurret || !!St.lock); reticle.material.opacity = St.lock ? 0.95 : 0.35; reticle.material.color.set(St.lock ? 0xec3013 : 0xffffff);
    if (P.target) { const f = P.target; reticle.position.set(f.x, tgtY(f), f.z); reticle.lookAt(camera.position); reticle.scale.setScalar((f.kind === 'gate' ? 2.2 : f.boss ? 1.8 : 1) * (1 + Math.sin(St.t * 8) * 0.06)); }

    if (!St.prompt) {
      // bolts
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i]; b.life -= dt;
        if (b.target && !b.target.dead) { v4.set(b.target.x, tgtY(b.target), b.target.z).sub(b.m.position).normalize(); b.v.lerp(v4.multiplyScalar(60), Math.min(1, dt * 8)); }
        b.m.position.addScaledVector(b.v, dt); b.m.lookAt(v4.copy(b.m.position).add(b.v));
        let hit = null; const bp = b.m.position;
        for (const f of alive()) { v4.set(f.x, tgtY(f), f.z); if (v4.distanceTo(bp) < (f.kind === 'drone' ? 1.0 * f.s.size : f.boss ? 1.6 : 0.95)) { hit = f; break; } }
        if (!hit) for (const g of liveGates()) if (Math.hypot(bp.x - g.x, bp.z - g.z) < 1.6 && bp.y < 4.6) { hit = g; break; }
        const blocked = !hit && COVERS.some(c => bp.y < 1.5 && Math.hypot(bp.x - c.x, bp.z - c.z) < c.r * 0.85);
        if (hit) damageTarget(hit, DMG.RAYGUN, 'RAYGUN');
        if (hit || blocked || b.life < 0 || bp.y < -0.2) { if (!hit) burst(bp, 4, 2); scene.remove(b.m); bolts.splice(i, 1); }
      }
      for (let i = rockets.length - 1; i >= 0; i--) {
        const b = rockets[i]; b.life -= dt;
        if (b.target && !b.target.dead) { v4.set(b.target.x, tgtY(b.target), b.target.z).sub(b.m.position).normalize(); const sp = b.v.length(); b.v.lerp(v4.multiplyScalar(sp), Math.min(1, dt * 5)); }
        b.m.position.addScaledVector(b.v, dt); b.m.lookAt(v4.copy(b.m.position).add(b.v));
        let hit = null; const bp = b.m.position;
        for (const f of alive()) { v4.set(f.x, tgtY(f), f.z); if (v4.distanceTo(bp) < (f.boss ? 1.7 : 1.1)) { hit = f; break; } }
        if (!hit && b.who === 'turret') for (const g of liveGates()) if (Math.hypot(bp.x - g.x, bp.z - g.z) < 1.7 && bp.y < 4.6) { hit = g; break; }
        if (hit) { damageTarget(hit, b.dmg, b.who === 'core' ? 'CORE' : 'TURRET'); burst(bp, 18, 7); audio.burst(0.15, 700, 0.15); }
        if (hit || b.life < 0) { scene.remove(b.m); rockets.splice(i, 1); }
      }
      for (let i = beams.length - 1; i >= 0; i--) { const b = beams[i]; b.life -= dt; b.m.material.opacity = Math.max(0, b.life / 0.25) * 0.95; if (b.life <= 0) { scene.remove(b.m); beams.splice(i, 1); } }
      const fo = on && !St.beam;
      for (const f of foes) updateFoe(f, dt, fo || (on && !!St.beam && false));
      updateNoble(dt, on); updateHope(dt, on);
      for (let i = foes.length - 1; i >= 0; i--) if (foes[i].dead > 0.6) { removeFoe(foes[i]); foes.splice(i, 1); }
      for (const g of gates) { if (g.dead) continue; g.hit = Math.max(0, g.hit - dt); const sp = WV.state === 'fight' && g.next < 0.6; g.field.material.opacity = 0.35 + Math.sin(St.t * 6 + g.i) * 0.1 + (sp ? 0.4 : 0) + g.hit * 2; g.glow.material.opacity = 0.5 + (sp ? 0.4 : 0); g.bar.s.position.set(g.x, 5.4, g.z); g.bar.s.visible = Math.hypot(g.x - camera.position.x, g.z - camera.position.z) < 42; }
      tickCore(dt, on && !St.beam);
      if (on && !St.beam) tickWaves(dt);
      updatePickups(dt); updateWaves(dt);
      updateMission();
    }
    if (burstT >= 0) { burstT += dt; burstRing.position.set(P.x, 1.0, P.z); burstRing.scale.setScalar(0.5 + burstT * 22); burstMat.opacity = Math.max(0, 1 - burstT * 2.2); if (burstT > 0.5) { burstT = -1; burstMat.opacity = 0; } }
    updateDebris(dt); updateSmoke(rdt); updateSkyBeams(rdt);
    for (let i = 0; i < sparkN; i++) { const s = sparkV[i]; if (s.life <= 0) continue; s.life -= dt; s.v.y -= 14 * dt; sparkArr[i * 3] += s.v.x * dt; sparkArr[i * 3 + 1] += s.v.y * dt; sparkArr[i * 3 + 2] += s.v.z * dt; if (s.life <= 0) { s.life = 0; sparkArr[i * 3 + 1] = -999; } }
    sparkGeo.attributes.position.needsUpdate = true;
    for (let i = popups.length - 1; i >= 0; i--) { const p = popups[i]; p.t += rdt; p.s.position.y += rdt * 1.2; p.s.material.opacity = 1 - smooth(0.5, 0.9, p.t); if (p.t > 0.9) { scene.remove(p.s); p.s.material.map.dispose(); popups.splice(i, 1); } }
    lampSprites.forEach(l => { l.s.material.opacity = 0.55 + 0.25 * Math.abs(Math.sin(St.t * l.hz + l.ph)); });
    if (St.callout) { St.callout.t += rdt; if (St.callout.t > St.callout.life) St.callout = null; }
    if (St.note) { St.note.t += rdt; if (St.note.t > 3.6) St.note = null; }
    if (St.toast) { St.toast.t += rdt; if (St.toast.t > 2.2) St.toast = null; }

    // camera
    const portrait = camera.aspect < 0.9;
    const baseDist = St.dist * (portrait ? 1.3 : isPhone() ? 1.1 : 1) * (P.inTurret ? 1.15 : 1);
    let distK = 1, ty = 1.6, tx = P.x, tz = P.z, pitch = St.pitch;
    if (!St.briefed || (St.prompt && !St.beamDone)) { St.yaw += rdt * 0.08; distK = 0.5; ty = 0.6; pitch = 0.95; tx = 0; tz = 0; }
    else if (B && !B.out) { const k = Math.min(1, B.t / B.life); distK = lerp(0.42, 1, smooth(0.3, 1, k)); }
    else if (B && B.out) { distK = lerp(1, 0.55, smooth(0, 1, B.t / B.life)); }
    if (St.lock && !P.inTurret) { tx = lerp(P.x, St.lock.x, 0.3); tz = lerp(P.z, St.lock.z, 0.3); distK *= St.lock.boss || St.lock.kind === 'gate' ? 1.25 : 1.1; }
    const dd = baseDist * distK;
    v3.set(tx + Math.sin(St.yaw) * Math.cos(pitch) * dd, ty + Math.sin(pitch) * dd + 0.6, tz + Math.cos(St.yaw) * Math.cos(pitch) * dd);
    const ck = St.briefed ? 9 : 3;
    camPos.x = damp(camPos.x, v3.x, ck, rdt); camPos.y = damp(camPos.y, v3.y, ck, rdt); camPos.z = damp(camPos.z, v3.z, ck, rdt);
    camLook.x = damp(camLook.x, tx, ck + 2, rdt); camLook.y = damp(camLook.y, ty, ck + 2, rdt); camLook.z = damp(camLook.z, tz, ck + 2, rdt);
    const wantFov = portrait ? 66 : 58; if (Math.abs(camera.fov - wantFov) > 0.05) { camera.fov = damp(camera.fov, wantFov, 5, rdt); camera.updateProjectionMatrix(); }
    St.shake = Math.max(0, St.shake - rdt); const sh = St.prompt ? 0 : St.shake * 0.3;
    camera.position.set(camPos.x + rr(-sh, sh), camPos.y + rr(-sh, sh), camPos.z + rr(-sh, sh));
    if (Math.abs(St.kick || 0) > 0.001) { v4.subVectors(camLook, camera.position).normalize(); camera.position.addScaledVector(v4, clamp(St.kick, -0.4, 1) * 0.6); St.kick = damp(St.kick, 0, 9, rdt); }
    camera.lookAt(camLook);
    { const low = P.hp < 30 && St.beamDone && !St.done && !St.defeated; vign.style.opacity = low ? (0.45 + 0.45 * Math.abs(Math.sin(St.t * (P.hp < 15 ? 7 : 4.5)))).toFixed(2) : '0'; }
    musicTick();
    stars.position.copy(camera.position);
    key.position.set(P.x - 20, 40, P.z + 15); key.target.position.set(P.x, 0, P.z);

    hudT -= rdt;
    if (hudT < 0) {
      hudT = 0.05;
      let tgt = St.lock && !St.lock.dead ? St.lock : null;
      if (!tgt) { let bd = 26; for (const f of alive()) { if (!f.boss || !f.active) continue; const d = Math.hypot(f.x - P.x, f.z - P.z); if (d < bd) { bd = d; tgt = f; } } }
      const items = Object.entries(save.data.items || {}).map(([id, n]) => ({ id, n, label: ITEM_LABELS[id] || String(id).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase()) }));
      const hud = {
        briefed: St.briefed, playing: St.beamDone && !St.done && !St.defeated, beam: !!St.beam,
        wave: WV.wave, waves: WAVES, waveState: WV.state, lull: WV.state === 'lull' && St.beamDone ? Math.ceil(Math.max(0, WV.timer)) : 0,
        gatesLeft: gatesLeft(), gatesTotal: 4,
        core: { hp: Math.round(core.hp / core.max * 100), up: core.up, dead: core.dead, breach: Math.round(core.breach / 10 * 100), armed: core.armed },
        hp: Math.round(P.hp), en: Math.round(P.en), super: Math.round(P.super), superReady: P.super >= 100, weapon: P.weapon, locked: !!St.lock, rapid: P.rapid > 0, triple: P.triple,
        turret: { in: P.inTurret, near: nearTurret() && !!St.beamDone && !St.done, shield: Math.round(TU.shield / TU.max * 100), dead: TU.dead },
        target: tgt ? { name: tgt.name, hp: Math.max(0, Math.round(tgt.hp / tgt.max * 100)), boss: !!tgt.boss } : null,
        callout: St.callout ? { text: St.callout.text, col: St.callout.col } : null,
        note: St.note ? { title: St.note.title, sub: St.note.sub } : null,
        toast: St.toast ? St.toast.text : null,
        prompt: St.prompt ? { title: St.prompt.title, body: St.prompt.body, buttons: St.prompt.buttons.map(b => b.label) } : null,
        items, muted: St.muted,
      };
      const k = JSON.stringify(hud); if (k !== hudKey) { hudKey = k; onState(hud); }
    }
  }
  function frame() { raf = requestAnimationFrame(frame); try { update(Math.min(clock.getDelta(), 0.05)); } catch (e) { if (!frame.err) { frame.err = 1; window.__8G_ERR = String(e && e.stack || e); console.error('bridge update failed:', e && e.stack || e); } } renderer.render(scene, camera); }

  const api = window.__8G_GAME = {
    promptPick(i) { const p = St.prompt; if (!p) return; const b = p.buttons[i] || p.buttons[0]; St.prompt = null; audio.blip(); b && b.act && b.act(); },
    attack() {
      if (!fightOn() || St.beam) return;
      if (P.inTurret) {
        if (TU.cool > 0) return; TU.cool = 0.25; TU.kick = 1;
        const t = P.target; v3.set(TU.x + Math.sin(TU.ang) * 1.6, 1.25, TU.z + Math.cos(TU.ang) * 1.6);
        const dir = t ? v4.set(t.x - v3.x, tgtY(t) - v3.y, t.z - v3.z).normalize() : v4.set(Math.sin(TU.ang), 0, Math.cos(TU.ang));
        fireRocket(v3, dir, 34, 'turret', t); St.shake = Math.max(St.shake, 0.1); St.kick = (St.kick || 0) - 0.18; audio.tone(200, 0.14, 0.06, 'square', 0.5); return;
      }
      if (P.weapon === 'RAYGUN') {
        if (P.fireCd > 0) return; const rapid = P.rapid > 0; if (!rapid && P.en < COST.RAYGUN) { audio.tone(160, 0.1, 0.04, 'square'); return; }
        if (!rapid) { P.en -= COST.RAYGUN; P.enT = 0.4; } P.fireCd = rapid ? 0.08 : 0.15; const t = St.lock || pickTarget(); if (t) P.face = Math.atan2(t.x - P.x, t.z - P.z);
        fox.updateMatrixWorld(true); muzzle.getWorldPosition(v3);
        const dir = t ? v4.set(t.x, tgtY(t), t.z).sub(v3).normalize() : v4.set(Math.sin(P.face), 0.02, Math.cos(P.face));
        fireBolt(dir, t);
        if (P.triple > 0) { P.triple--; for (const s of [-0.18, 0.18]) { const d2 = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), s); fireBolt(d2, null); } }
        flash.material.opacity = 1; P.recoil = 1; St.kick = (St.kick || 0) - 0.05; sfxLaser();
      } else {
        if (P.swing > 0) { if (P.swing < P.swingDur * 0.65) St.attackQueued = true; return; }
        P.combo = P.comboT > 0 ? (P.combo % 3) + 1 : 1; P.comboT = 0.75; P.swingDur = P.combo === 3 ? 0.36 : 0.24; P.swing = P.swingDur; P.swingHit = new Set(); sfxSwing();
        const t = P.target || pickTarget(); if (t) { const d = Math.hypot(t.x - P.x, t.z - P.z); if (d < 6) { P.face = Math.atan2(t.x - P.x, t.z - P.z); const stop = t.kind === 'gate' ? 2.6 : 1.5; if (d > stop + 0.2) { P.ldx = Math.sin(P.face); P.ldz = Math.cos(P.face); P.lungeT = 0.12; P.lsp = Math.min(30, (d - stop) / 0.12); } } }
      }
    },
    hold(b) { St.held = !!b; },
    use() { if (!fightOn()) return; if (P.inTurret) exitTurret(); else if (nearTurret()) enterTurret(); },
    dodge() { if (!fightOn() || St.beam || P.inTurret || P.dashCd > 0 || P.dash > 0) return; let dx = P.vx, dz = P.vz; const l = Math.hypot(dx, dz); if (l < 0.5) { dx = Math.sin(P.face); dz = Math.cos(P.face); } else { dx /= l; dz /= l; } P.dx = dx; P.dz = dz; P.dash = 0.24; P.dashCd = 0.5; audio.burst(0.14, 1800, 0.1);
      let perfect = false; for (const f of alive()) { const d = Math.hypot(f.x - P.x, f.z - P.z); if (f.kind === 'bot' && ((f.mode === 'windup' && f.mt > f.s.windup * (f.wk || 1) - 0.35) || f.mode === 'swing') && d < (f.boss ? 6 : 3.6)) perfect = true; if ((f.mode === 'dashAim' && f.mt > 0.35 && d < 10) || (f.mode === 'dash' && d < 3.5)) perfect = true; if (f.kind === 'drone' && f.mode === 'aim' && f.mt > f.s.windup - 0.3) perfect = true; }
      if (waves.some(w => Math.abs(Math.hypot(P.x - w.x, P.z - w.z) - w.r) < 2)) perfect = true;
      if (perfect) { addSuper(15); St.slow = 0.5; P.crit = 2.2; P.en = 100; popup(v3.set(P.x, 2.6, P.z), 'PERFECT', '#5fe3ff'); audio.tone(900, 0.35, 0.05, 'sine', 2); } },
    cycleTarget() { const list = targets().filter(f => Math.hypot(f.x - P.x, f.z - P.z) < 30).sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z)); if (!list.length) { St.lock = null; return; } if (!St.lock) St.lock = pickTarget() || list[0]; else { const i = list.indexOf(St.lock); St.lock = list[(i + 1) % list.length]; } audio.tone(980, 0.06, 0.04, 'triangle'); },
    toggleLock() { if (St.lock) { St.lock = null; audio.tone(520, 0.06, 0.03, 'triangle'); } else api.cycleTarget(); },
    jump() { input.jump = true; },
    select(w) { if (P.inTurret) return; P.weapon = w; audio.blip(); },
    burst() { gateBurst(); },
    useItem(id) { const heal = { erToGo: 40, healingCharges: 40, splint: 60 }[id]; if (heal) { if (P.hp >= 100) { toast('You are already at full health.'); return; } save.take(id); P.hp = Math.min(100, P.hp + heal); toast((ITEM_LABELS[id] || id) + ': +' + heal + ' health'); audio.tone(660, 0.25, 0.05, 'sine', 1.5); return; }
      if (id === 'energyPod') { if (P.en >= 100) { toast('Your charge is already full.'); return; } save.take(id); P.en = 100; toast('Energy Cell: charge full'); return; }
      if (id === 'amber' || id === 'chocolates') { save.take(id); toast((ITEM_LABELS[id] || id) + ': delicious.'); return; }
      toast((ITEM_LABELS[id] || id) + ': nothing to use it on here.'); },
    toTown() { try { sessionStorage.setItem('meru.spawn', 'pad'); } catch (e) {} onNavigate('Meru Town Square.dc.html'); },
    toggleSound() { St.muted = !St.muted; audio.init(); audio.setMuted(St.muted); },
    setOptions(o) { if (o.outlines != null) outlineMat.visible = !!o.outlines; if (o.followCam != null) opts.followCam = !!o.followCam; },
    debug: { step(n = 30, dt = 1 / 30) { for (let i = 0; i < n; i++) update(dt); renderer.render(scene, camera); }, gates() { liveGates().forEach(g => damageGate(g, 999)); }, waves() { WV.wave = WAVES; WV.state = 'lull'; WV.timer = 1; }, heal() { P.hp = 100; }, dist(n) { St.dist = n; }, pitch(n) { St.pitch = n; }, screen(n = 400) { hurtCore(n); }, to(where) { const p = { south: [-30, 40], north: [30, -40], p2: PLAT[1], p4: PLAT[3], turret: [TU.x + 1.5, TU.z] }[where]; if (p) { P.x = p.x ?? p[0]; P.z = p.z ?? p[1]; } } },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur); audio.dispose(); renderer.dispose(); el.remove(); joyBase.remove(); joyKnob.remove(); vign.remove(); },
    setJoy(b) { if (JOY.fixed === !!b) return; JOY.fixed = !!b; resetJoy(); },
  };
  resetAll(); save.where('meru', 'meruBridge');
  frame(); setTimeout(brief, 400);
  return api;
}
