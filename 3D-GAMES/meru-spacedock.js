import * as THREE from './vendor/three/three.module.js';
import { rnd, rr, pick, clamp, smooth, lerp, damp, makeGradient, glowTexture, Ambience } from './village-game.js';
import { emblemTex, crestTex, FONT } from './engine/textures.js';
import { foxKit, PLAYER_MALE } from './fox-kit.js';
import { castKit, loadCastRigs } from './engine/cast.js';
import { save } from './engine/save.js';
import { ITEM_LABELS } from './worlds/meru-shops.js';
import { LAYOUT as L, SHIP, GANGWAY, STEP_FROM, GUARDS, DIALOGUE, LANDING_TALK, LANDING_TALK_WON, PROMPTS } from './worlds/meru-dock.js';

// MERU SPACE DOCK [meruSpacedock] — the game's opening. Your ship comes up out of the dark into her berth at the east end
// of the gantry, you step down, walk west past the two Dock Guards to the teleporter, and the transport drops you on
// The Bridge (Meru Bridge.dc.html). After the finale (flag finaleWon) you arrive on the pad instead and the berth asks BACK to SPACE.
const RECTS = () => [L.deck, L.spur, L.spurS, ...(St.arrived ? [GANGWAY] : [])].map(r => r.x0 != null ? r : r);
let St;
const inRect = (r, x, z) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;
function walkable(x, z, p = 0.38) { const R = RECTS(); return [[-p, -p], [p, -p], [-p, p], [p, p]].every(([a, b]) => R.some(r => inRect(r, x + a, z + b))); }
function nearestWalk(x, z, p = 0.5) { let best = null, bd = 1e9; for (const r of RECTS()) { const cx = clamp(x, r.x0 + p, r.x1 - p), cz = clamp(z, r.z0 + p, r.z1 - p), d = Math.hypot(cx - x, cz - z); if (d < bd) { bd = d; best = { x: cx, z: cz }; } } return best; }

export async function createDock({ container, options = {}, onState = () => {}, onNavigate = () => {} }) {
  const opts = { quality: 'high', outlines: true, followCam: true, ...options };
  const LOW = opts.quality === 'low', OL = v => LOW ? 0 : v;
  try { await document.fonts.load('900 40px Archivo'); } catch (e) {}
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, LOW ? 1 : 2)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = !LOW; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(58, W() / H(), 0.1, 3000);
  scene.background = new THREE.Color(0x04050b);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x0a0d14, side: THREE.BackSide }); outlineMat.visible = !!opts.outlines;
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = !LOW; m.receiveShadow = true; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const basic = (c, o = 1, add) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1 || !!add, opacity: o, depthWrite: !(o < 1 || add), blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide });
  const glowSprite = (x, y, z, color, size, op = 0.8, parent) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op })); s.position.set(x, y, z); s.scale.setScalar(size); (parent || scene).add(s); return s; };
  const flat = (geo, mat, x, y, z, parent) => { const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); (parent || scene).add(m); return m; };
  const { makeFox, animFox } = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const cast = castKit({ THREE, M, toon, makeFox }, await loadCastRigs());
  St = { t: 0, phase: 'start', pt: 0, arrived: false, yaw: Math.PI / 2 + 0.35, pitch: 0.38, dist: 8.5, prompt: null, dialog: null, toast: null, note: null, beam: null, muted: false, padLock: true, shipLock: false, landingDone: false, won: save.flag('finaleWon'), leaving: false, dragT: 0 };

  // ---------- light + space + Meru below ----------
  scene.add(new THREE.HemisphereLight(0xa8c8ec, 0x1a1f2a, 1.0));
  const key = new THREE.DirectionalLight(0xe6f0ff, 1.25); key.position.set(-30, 40, 20); key.castShadow = !LOW;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 140 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.04; scene.add(key, key.target);
  { const n = LOW ? 900 : 1800, sp = []; for (let i = 0; i < n; i++) { const u = rnd() * 6.283, v = Math.acos(rr(-0.35, 1)), r = 1800; sp.push(Math.sin(v) * Math.cos(u) * r, Math.cos(v) * r, Math.sin(v) * Math.sin(u) * r); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); var stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xe2e8f0, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false })); scene.add(stars); }
  const PR = 900, PC = new THREE.Vector3(-60, -PR - 70, -140);
  { const c = document.createElement('canvas'); c.width = 2048; c.height = 1024; const g = c.getContext('2d'); const e = document.createElement('canvas'); e.width = 2048; e.height = 1024; const ge = e.getContext('2d');
    g.fillStyle = '#3a4047'; g.fillRect(0, 0, 2048, 1024); ge.fillStyle = '#000'; ge.fillRect(0, 0, 2048, 1024);
    for (let i = 0; i < 46; i++) { g.fillStyle = pick(['rgba(18,21,25,0.55)', 'rgba(70,78,86,0.4)', 'rgba(28,32,37,0.5)']); g.beginPath(); g.ellipse(rnd() * 2048, rnd() * 1024, rr(60, 260), rr(30, 120), rnd() * 3, 0, 7); g.fill(); }
    for (let k = 0; k < 40; k++) { const cx = rnd() * 2048, cy = rr(80, 940), sp = rr(14, 60), n = 30 + (rnd() * 70 | 0); for (let i = 0; i < n; i++) { const a = rnd() * 6.283, d = Math.pow(rnd(), 1.7) * sp, gl = rr(0.45, 1); ge.fillStyle = `rgba(255,${190 + (gl * 30 | 0)},130,${0.4 + gl * 0.5})`; ge.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6, 1.5 + gl * 1.5, 1.5 + gl * 1.5); } }
    for (let i = 0; i < 600; i++) { ge.fillStyle = 'rgba(255,206,130,0.45)'; ge.fillRect(rnd() * 2048, rr(40, 980), 1.5, 1.5); }
    const map = new THREE.CanvasTexture(c), em = new THREE.CanvasTexture(e); map.colorSpace = em.colorSpace = THREE.SRGBColorSpace; map.anisotropy = em.anisotropy = 4;
    var planet = new THREE.Mesh(new THREE.SphereGeometry(PR, LOW ? 64 : 112, LOW ? 40 : 72), new THREE.MeshToonMaterial({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 1.1, gradientMap: grad })); planet.position.copy(PC); planet.rotation.set(0.4, 0, 0.2); scene.add(planet);
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(PR * 1.035, 96, 64), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
      vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vP = mv.xyz; gl_Position = projectionMatrix*mv; }',
      fragmentShader: 'varying vec3 vN; varying vec3 vP; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(-vP))); float a = pow(f, 5.0) * 1.3; gl_FragColor = vec4(0.49,0.83,0.99, a); }' }));
    atmo.position.copy(PC); scene.add(atmo); }

  // ---------- the gantry ----------
  const plateM = toon('#3d4654'), plate2 = toon('#4b5563'), trussM = toon('#1b2029'), railM = toon('#6b7686'), stripM = basic(0x7dd3fc), seamM = toon('#2a313c');
  const parts = [L.deck, L.spur, L.spurS];
  for (const r of parts) {
    const w = r.x1 - r.x0, d = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
    const p = M(BOX(w, 0.4, d), plateM, cx, -0.2, cz, null, 0); p.castShadow = false;
    M(BOX(w + 0.3, 0.6, d * 0.55), trussM, cx, -0.75, cz, null, 0).castShadow = false;
  }
  { const segs = []; for (let x = L.deck.x0 + 2; x < L.deck.x1; x += 4) segs.push([x, 0]); for (const r of [L.spur, L.spurS]) for (let z = r.z0 + 1.6; z < r.z1; z += 3) segs.push([0, z, 1]);
    const im = new THREE.InstancedMesh(BOX(0.08, 0.02, 1), seamM, segs.length), o = new THREE.Object3D();
    segs.forEach(([x, z, rot], i) => { o.position.set(x, 0.005, z); o.rotation.set(0, rot ? Math.PI / 2 : 0, 0); o.scale.set(1, 1, rot ? 3.3 : L.deck.z1 - L.deck.z0 - 0.3); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); scene.add(im); }
  // braces hanging under the walk
  { const n = Math.floor((L.deck.x1 - L.deck.x0) / 4.4), im = new THREE.InstancedMesh(BOX(0.35, 2.2, 0.35), trussM, n * 2), o = new THREE.Object3D(); let k = 0;
    for (let i = 0; i < n; i++) for (const s of [-1, 1]) { o.position.set(L.deck.x0 + 2.2 + i * 4.4, -1.6, s * 0.55); o.rotation.set(s * 0.5, 0, 0.35); o.updateMatrix(); im.setMatrixAt(k++, o.matrix); } scene.add(im);
    M(BOX(L.deck.x1 - L.deck.x0, 0.3, 0.3), trussM, (L.deck.x0 + L.deck.x1) / 2, -2.6, 0, null, 0); }
  // lit strips (down the long walk, broken where each spur opens; round the far end of each spur)
  const strip = (x0, x1, z0, z1) => { const m = new THREE.Mesh(BOX(Math.max(0.06, x1 - x0), 0.03, Math.max(0.06, z1 - z0)), stripM); m.position.set((x0 + x1) / 2, 0.012, (z0 + z1) / 2); scene.add(m); };
  const sp = L.spur, ss = L.spurS, E = 0.18;
  strip(L.deck.x0, sp.x0, L.deck.z0 + E, L.deck.z0 + E + 0.08); strip(sp.x1, L.deck.x1, L.deck.z0 + E, L.deck.z0 + E + 0.08);
  strip(L.deck.x0, ss.x0, L.deck.z1 - E - 0.08, L.deck.z1 - E); strip(ss.x1, L.deck.x1, L.deck.z1 - E - 0.08, L.deck.z1 - E);
  strip(sp.x0, sp.x1, sp.z0 + E, sp.z0 + E + 0.08); strip(ss.x0, ss.x1, ss.z1 - E - 0.08, ss.z1 - E);
  // rails round the outside of the whole shape, lamp posts along them so the walk always reads
  const RAILS = [[L.deck.x0, L.deck.z0, sp.x0, L.deck.z0], [sp.x1, L.deck.z0, L.deck.x1, L.deck.z0], [L.deck.x0, L.deck.z1, ss.x0, L.deck.z1], [ss.x1, L.deck.z1, L.deck.x1, L.deck.z1],
    [L.deck.x0, L.deck.z0, L.deck.x0, L.deck.z1], [L.deck.x1, L.deck.z0, L.deck.x1, GANGWAY.z0], [L.deck.x1, GANGWAY.z1, L.deck.x1, L.deck.z1],
    [sp.x0, L.deck.z0, sp.x0, sp.z0], [sp.x1, L.deck.z0, sp.x1, sp.z0], [sp.x0, sp.z0, sp.x1, sp.z0], [ss.x0, L.deck.z1, ss.x0, ss.z1], [ss.x1, L.deck.z1, ss.x1, ss.z1], [ss.x0, ss.z1, ss.x1, ss.z1]];
  const posts = [], lamps = [];
  for (const [x0, z0, x1, z1] of RAILS) { const len = Math.hypot(x1 - x0, z1 - z0); if (len < 0.05) continue; const r = M(BOX(len, 0.07, 0.07), railM, (x0 + x1) / 2, 1.02, (z0 + z1) / 2, null, 0); r.rotation.y = -Math.atan2(z1 - z0, x1 - x0); r.castShadow = false;
    const m2 = r.clone(); m2.position.y = 0.55; scene.add(m2);
    const n = Math.max(1, Math.round(len / 1.6)); for (let i = 0; i <= n; i++) posts.push([lerp(x0, x1, i / n), lerp(z0, z1, i / n)]); }
  { const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 1.05, 6), railM, posts.length), o = new THREE.Object3D(); posts.forEach(([x, z], i) => { o.position.set(x, 0.52, z); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); scene.add(im); }
  for (let x = L.deck.x0 + 3; x < L.deck.x1 - 1; x += 6) for (const z of [L.deck.z0, L.deck.z1]) { if (x > sp.x0 - 0.6 && x < sp.x1 + 0.6) continue; lamps.push([x, z]); }
  lamps.push([sp.x0, sp.z0], [sp.x1, sp.z0], [ss.x0, ss.z1], [ss.x1, ss.z1]);
  const lampGlows = [];
  { const post = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.09, 2.2, 8), toon('#3b4250'), lamps.length), head = new THREE.InstancedMesh(new THREE.BoxGeometry(0.26, 0.12, 0.26), basic(0xbfeaff), lamps.length), o = new THREE.Object3D();
    lamps.forEach(([x, z], i) => { o.position.set(x, 1.1, z); o.updateMatrix(); post.setMatrixAt(i, o.matrix); o.position.y = 2.25; o.updateMatrix(); head.setMatrixAt(i, o.matrix); lampGlows.push(glowSprite(x, 2.25, z, 0x7dd3fc, 1.9, 0.6)); }); scene.add(post, head); }
  // the berth: two clamps on the rail, and the gangway square
  { const bx = L.hatch.x + 1.1; for (const s of [-1, 1]) { const z = s > 0 ? L.deck.z1 + 0.15 : L.deck.z0 - 0.15; M(BOX(0.16, 2.6, 0.16), toon('#8794a6'), bx, 1.2, z, null, OL(0.02)); M(new THREE.SphereGeometry(0.17, 12, 8), toon('#8794a6'), bx, 2.55, z, null, 0); }
    const y = new THREE.Mesh(new THREE.RingGeometry(0.0, 1, 4, 1), basic(0xfacc15, 0.08)); y.rotation.set(-Math.PI / 2, 0, Math.PI / 4); y.scale.set(1.35, 1.35, 1); y.position.set(bx, 0.01, 0.2); scene.add(y);
    for (const [w, d, ox, oz] of [[1.9, 0.05, 0, -0.95], [1.9, 0.05, 0, 0.95], [0.05, 1.9, -0.95, 0], [0.05, 1.9, 0.95, 0]]) { const m = new THREE.Mesh(BOX(w, 0.02, d), basic(0xfacc15, 0.5)); m.position.set(bx + ox, 0.013, 0.2 + oz); scene.add(m); }
    for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(BOX(0.36, 0.02, 0.1), basic(0xfacc15, 0.45)); m.position.set(bx - 0.5 + i * 0.5, 0.014, 0.2); scene.add(m); } }

  // ---------- the teleporter pad (west end) ----------
  const PAD = L.pad;
  M(new THREE.CylinderGeometry(PAD.r, PAD.r + 0.1, 0.16, 48), toon('#101821'), PAD.x, 0.08, PAD.z, null, OL(0.03), PAD.r);
  const padRings = [1, 0.76, 0.52, 0.28].map((k, i) => flat(new THREE.RingGeometry(PAD.r * k - 0.07, PAD.r * k, 64), basic(0x7dd3fc, i ? 0.6 : 1), PAD.x, 0.17, PAD.z));
  const swell = [0, 1].map(() => flat(new THREE.RingGeometry(0.94, 1, 64), basic(0x7dd3fc, 0.5, true), PAD.x, 0.18, PAD.z));
  const padGlow = glowSprite(PAD.x, 0.5, PAD.z, 0x7dd3fc, PAD.r * 4, 0.45);
  const padCol = new THREE.Mesh(new THREE.CylinderGeometry(PAD.r * 0.9, PAD.r * 0.9, 5, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); padCol.position.set(PAD.x, 2.6, PAD.z); scene.add(padCol);
  function labelSprite(text, col = '#bae6fd', h = 0.7) { const c = document.createElement('canvas'), g = c.getContext('2d'); g.font = '800 64px ' + FONT; const w = Math.ceil(g.measureText(text).width) + 40; c.width = w; c.height = 96; g.font = '800 64px ' + FONT; g.fillStyle = '#04050b'; g.globalAlpha = 0.55; g.fillRect(0, 0, w, 96); g.globalAlpha = 1; g.fillStyle = col; g.textBaseline = 'middle'; g.fillText(text, 20, 50); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); s.scale.set(h * w / 96, h, 1); scene.add(s); return s; }
  labelSprite('TELEPORT to MERU').position.set(PAD.x, 3.3, PAD.z);

  // ---------- the ship ----------
  const ship = new THREE.Group(); scene.add(ship);
  const hullM = toon('#b8c2cf'), hullD = toon('#6b7686'), glassM = toon('#38bdf8', { emissive: new THREE.Color('#0e4a6e'), emissiveIntensity: 0.6 }), redM = toon('#ec3013');
  const HL = L.shipLen / 2;
  { const prof = [[0, HL], [1.1, HL - 1.2], [2.3, HL - 4], [3.1, HL - 8], [3.3, 0], [3.1, -HL + 6], [2.6, -HL + 2], [2.1, -HL + 0.4], [0, -HL]].reverse().map(([r, y]) => new THREE.Vector2(r, y));
    const g = new THREE.LatheGeometry(prof, 28); g.rotateX(-Math.PI / 2); const hull = M(g, hullM, 0, 0, 0, ship, OL(0.06), 3.3); hull.scale.set(1, 0.72, 1);
    const band = M(new THREE.CylinderGeometry(3.32, 3.32, 0.5, 28, 1, true), redM, 0, 0, -1.5, ship, 0); band.rotation.x = Math.PI / 2; band.scale.set(1, 1, 0.72);
    const can = M(new THREE.SphereGeometry(1.4, 20, 14), glassM, 0, 1.75, -HL + 6.2, ship, OL(0.04), 1.4); can.scale.set(1, 0.6, 2.2);
    for (const s of [-1, 1]) { const pts = [[2.6, 3], [11.5, 8.6], [11.8, 10.6], [2.6, 11.4]].map(([x, y]) => new THREE.Vector2(x * s, y)); if (s < 0) pts.reverse(); const wg = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 0.3, bevelEnabled: false }); wg.rotateX(Math.PI / 2); M(wg, hullM, 0, -0.05, 0, ship, OL(0.04));
      M(BOX(0.6, 0.12, 2.2), redM, s * 10.6, -0.5, 9.6, ship, 0);
      const crest = flat(new THREE.CircleGeometry(1.1, 32), new THREE.MeshToonMaterial({ map: emblemTex('8', { outer: '#c98a3c', ring: '#f0b866', bg: '#0c1038', stroke: '#7dd3fc' }), gradientMap: grad, transparent: true }), s * 6.6, -0.03, 8.4, ship); crest.rotation.z = s > 0 ? 0 : 0; }
    const fin = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(3.8, 0), new THREE.Vector2(4.4, 3.6), new THREE.Vector2(3.4, 3.6)]), { depth: 0.25, bevelEnabled: false }); fin.rotateY(-Math.PI / 2); M(fin, hullD, 0.12, 1.4, HL - 5.2, ship, OL(0.04));
    ship.userData.engines = [-1.5, 1.5].map(x => { const e = M(new THREE.CylinderGeometry(0.85, 1.0, 2.2, 16), hullD, x, -0.2, HL - 0.6, ship, OL(0.03), 1); e.rotation.x = Math.PI / 2; const glow = glowSprite(x, -0.2, HL + 0.7, 0x7dd3fc, 2.6, 0.9, ship); const flame = new THREE.Mesh(new THREE.ConeGeometry(0.75, 5, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x93deff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); flame.rotation.x = -Math.PI / 2; flame.position.set(x, -0.2, HL + 3); ship.add(flame); return { glow, flame }; });
    // the hatch on her west flank, open, and the gangway down to the deck
    M(BOX(0.2, 2.1, 1.6), toon('#111722'), -3.2, 1.0, LAYOUT_HATCH_Z(), ship, 0); }
  function LAYOUT_HATCH_Z() { return L.hatch.z - SHIP.z + 0.2; }
  const gang = new THREE.Group(); scene.add(gang);
  { const len = GANGWAY.x1 - GANGWAY.x0, cx = (GANGWAY.x0 + GANGWAY.x1) / 2, w = GANGWAY.z1 - GANGWAY.z0, cz = (GANGWAY.z0 + GANGWAY.z1) / 2;
    M(BOX(len, 0.16, w), plate2, cx, -0.08, cz, gang, OL(0.02));
    for (const z of [GANGWAY.z0, GANGWAY.z1]) { const m = new THREE.Mesh(BOX(len, 0.03, 0.08), basic(0xfacc15, 0.8)); m.position.set(cx, 0.015, z + (z === GANGWAY.z0 ? 0.08 : -0.08)); gang.add(m); M(BOX(len, 0.06, 0.06), railM, cx, 0.95, z, gang, 0); } }
  const BERTH = new THREE.Vector3(SHIP.x, SHIP.y, SHIP.z), APPROACH = new THREE.Vector3(SHIP.x + 4, -48, SHIP.z + 90);
  ship.position.copy(BERTH);
  const trail = Array.from({ length: LOW ? 24 : 48 }, () => ({ s: glowSprite(0, -999, 0, 0x93deff, 2, 0), life: 0, v: new THREE.Vector3() })); let trailI = 0;

  // ---------- people ----------
  const fox = cast.make('player'); fox.visible = false;
  const hope = cast.make('hope', { mood: 'warm' }), HBS = hope.scale.x; hope.visible = false;
  const noble = cast.make('noble'), NBS = noble.scale.x; noble.visible = false;
  const P = { x: L.hatch.x, z: L.hatch.z, y: 0, vx: 0, vz: 0, vy: 0, face: -Math.PI / 2, ground: true, stepT: 0 };
  const party = [{ key: 'hope', c: hope, s: HBS, side: 1, x: 0, z: 0, vx: 0, vz: 0, face: -Math.PI / 2, on: false }, { key: 'noble', c: noble, s: NBS, side: -1, x: 0, z: 0, vx: 0, vz: 0, face: -Math.PI / 2, on: false }];
  const guards = GUARDS.map(g => { const c = makeFox({ ...g, look: PLAYER_MALE }); c.position.set(g.x, 0, g.z); c.rotation.y = g.face; return { ...g, c, home: g.face }; });

  // the transport beam (one column per fox)
  const beamGeo = new THREE.CylinderGeometry(1.1, 1.1, 16, 28, 1, true);
  const cols = [0, 1, 2].map(() => { const m = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0x7fe3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); scene.add(m); return m; });

  // ---------- audio ----------
  const audio = new Ambience();
  const popups = [];
  function popup(x, y, z, text, color = '#7dd3fc') { const s = labelSprite(text, color, 0.8); s.position.set(x, y, z); popups.push({ s, t: 0 }); }
  function toast(t) { St.toast = { text: t, t: 0 }; }
  function note(title, sub) { St.note = { title, sub, t: 0 }; }
  function prompt(title, body, buttons) { St.prompt = { title, body, buttons: buttons.map(b => ({ label: b[0], act: b[1] })) }; input.jx = input.jy = 0; audio.tone(520, 0.18, 0.05, 'square'); }
  function say(npc, lines, then) {
    St.dialog = { npc, i: 0, then, lines: lines.map(l => l.who === 'player' ? { name: 'Ben', role: 'Fox', text: l.text, you: true } : { name: npc.name, role: npc.role, text: l.text }) };
    input.jx = input.jy = 0; P.vx = P.vz = 0; audio.blip();
  }

  // ---------- input ----------
  const keys = new Set(), input = { jx: 0, jy: 0, jump: false };
  const onKeyDown = e => {
    if (/INPUT|TEXTAREA/.test(e.target.tagName) || St.paused) return;
    if (St.prompt) { if (e.code === 'Enter' || e.code === 'KeyE') { e.preventDefault(); api.promptPick(0); } if (e.code === 'Escape') api.promptPick(St.prompt.buttons.length - 1); return; }
    if (St.dialog) { if (['Space', 'Enter', 'KeyE'].includes(e.code)) { e.preventDefault(); api.advance(); } return; }
    if (St.phase !== 'free') { if (['Space', 'Enter', 'KeyE', 'Escape'].includes(e.code)) { e.preventDefault(); api.skip(); } return; }
    keys.add(e.code);
    if (e.code === 'Space' || e.code === 'Digit3') { e.preventDefault(); input.jump = true; }
    if (e.code === 'KeyE' || e.code === 'Enter') api.talk();
    if (e.code === 'Digit1' || e.code === 'Digit2') api.action(+e.code.slice(5));
    if (/Arrow/.test(e.code)) e.preventDefault();
  };
  const onKeyUp = e => keys.delete(e.code), onBlur = () => keys.clear();
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
    if (St.prompt || St.paused) return;
    if (St.dialog) { api.advance(); return; }
    if (St.hudPad && e.pointerType === 'touch' && St.phase === 'free') return;
    if (St.phase !== 'free') { api.skip(); return; }
    el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top;
    const joy = e.pointerType === 'touch' && lx < r.width * 0.45 && ![...ptrs.values()].some(p => p.joy);
    const jc = joyCenter(), useC = joy && JOY.fixed && Math.hypot(lx - jc.x, ly - jc.y) < 170, ox = useC ? jc.x : lx, oy = useC ? jc.y : ly;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, ox, oy, joy });
    if (joy) { joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.left = ox + 'px'; joyBase.style.top = oy + 'px'; moveJoy(lx - ox, ly - oy, ox, oy); }
  });
  function moveJoy(dx, dy, ox, oy) { const l = Math.hypot(dx, dy); if (l > JR) { dx *= JR / l; dy *= JR / l; } input.jx = dx / JR; input.jy = -dy / JR; joyKnob.style.left = ox + dx + 'px'; joyKnob.style.top = oy + dy + 'px'; }
  el.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if (!p) return; if (p.joy) { const r = el.getBoundingClientRect(); moveJoy(e.clientX - r.left - p.ox, e.clientY - r.top - p.oy, p.ox, p.oy); } else { const k = e.pointerType === 'touch' ? 0.008 : 0.005; St.dragT = 1.4; St.yaw -= (e.clientX - p.x) * k; St.pitch = clamp(St.pitch + (e.clientY - p.y) * k * 0.8, 0.08, 1.1); } p.x = e.clientX; p.y = e.clientY; });
  const endPtr = e => { const p = ptrs.get(e.pointerId); ptrs.delete(e.pointerId); if (p && p.joy) { input.jx = input.jy = 0; resetJoy(); } };
  el.addEventListener('pointerup', endPtr); el.addEventListener('pointercancel', endPtr);
  el.addEventListener('wheel', e => { St.dist = clamp(St.dist + e.deltaY * 0.01, 4.5, 16); e.preventDefault(); }, { passive: false });
  el.addEventListener('contextmenu', e => e.preventDefault());
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); resetJoy(); }); ro.observe(container);

  // ---------- story ----------
  const nearGuard = () => { let best = null, bd = 2.8; for (const g of guards) { const d = Math.hypot(g.x - P.x, g.z - P.z); if (d < bd) { bd = d; best = g; } } return best; };
  function placeParty(at) { party.forEach((p, i) => { p.x = at.x + 0.9 + i * 0.4; p.z = at.z + (i ? -1.0 : 1.0); p.vx = p.vz = 0; p.face = P.face; p.c.position.set(p.x, 0, p.z); }); }
  function beginArrival() {
    audio.init(); audio.setMuted(St.muted);
    St.phase = 'flying'; St.pt = 0; St.arrived = false; ship.position.copy(APPROACH); ship.rotation.set(0.62, 0, 0);
    audio.tone(70, 3.2, 0.08, 'sawtooth', 1.6); audio.burst(3, 500, 0.08);
  }
  function finishArrival() {
    St.phase = 'free'; St.arrived = true; ship.position.copy(BERTH); ship.rotation.set(0, 0, 0);
    ship.userData.engines.forEach(e => { e.flame.material.opacity = 0; e.glow.material.opacity = 0.25; });
    P.x = L.hatch.x; P.z = L.hatch.z; P.face = -Math.PI / 2; fox.visible = true; St.yaw = Math.PI / 2 + 0.35;
    party.forEach((p, i) => { if (!p.on) { p.x = L.hatch.x + 1.6 + i * 1.2; p.z = L.hatch.z + (i ? -0.6 : 0.6); p.face = -Math.PI / 2; } p.on = true; p.c.visible = true; });
    save.setFlag('dockArrived');
  }
  function arriveOnPad() { // after the finale: the light puts you down on the teleporter
    audio.init(); audio.setMuted(St.muted);
    St.phase = 'free'; St.arrived = true; ship.position.copy(BERTH); P.x = PAD.x; P.z = PAD.z; P.face = Math.PI / 2; St.yaw = -Math.PI / 2 - 0.35; St.padLock = true; St.landingDone = false;
    fox.visible = true; placeParty({ x: PAD.x + 1.2, z: PAD.z }); party.forEach(p => { p.on = true; p.c.visible = true; });
    beginBeam(false, () => audio.tone(660, 0.5, 0.05, 'triangle', 1.5));
  }
  function beginBeam(out, done) { St.beam = { out, t: 0, life: 118 / 60, done }; audio.tone(out ? 660 : 330, 1.4, 0.05, 'sine', out ? 0.5 : 2); audio.burst(0.8, 3000, 0.08); }
  function teleport() {
    popup(P.x, 3.2, P.z, 'TELEPORTING'); audio.tone(880, 0.12, 0.05, 'triangle'); St.leaving = true;
    beginBeam(true, () => { save.where('meru', 'meruBridge'); onNavigate('Meru Bridge.dc.html'); });
  }
  function backToSpace() {
    popup(P.x, 3.2, P.z, 'BOARDING'); save.setFlag('flagshipBoarded'); note(...PROMPTS.aboard); St.leaving = true;
    beginBeam(true, () => { // nothing to hand off to yet: put him back on his feet
      St.leaving = false; St.shipLock = true; fox.visible = true; party.forEach(p => p.c.visible = true);
      beginBeam(false); note(...PROMPTS.notYet);
    });
  }
  function checkSpots() {
    if (St.prompt || St.dialog || St.beam || St.leaving) return;
    // the guards speak once you cross the junction
    if (!St.landingDone && P.x > L.landing.x0 && P.x < L.landing.x1) {
      const flag = St.won ? 'dockGuardsSpokeWon' : 'dockGuardsSpoke';
      St.landingDone = true;
      if (!save.flag(flag)) { save.setFlag(flag); const g = guards[0]; say(g, St.won ? LANDING_TALK_WON : LANDING_TALK); return; }
    }
    if (St.won) { const d = Math.hypot(P.x - (GANGWAY.x1 - 0.6), P.z - 0.2) < 1.6; if (St.shipLock) { if (!d) St.shipLock = false; } else if (d) { St.shipLock = true; prompt(PROMPTS.ship, '', [['YES', backToSpace], ['NO', null]]); return; } }
    const near = Math.hypot(P.x - PAD.x, P.z - PAD.z) < PAD.r * 0.72;
    if (St.padLock) { if (!near) St.padLock = false; return; }
    if (!near) return;
    St.padLock = true;
    if (St.won) { prompt(PROMPTS.padWon, '', [['OKAY', null]]); return; }
    prompt(PROMPTS.pad, '', [['YES', teleport], ['NO', null]]);
  }

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, hudKey = '', hudT = 0;
  const camPos = new THREE.Vector3(16, 6, 18), camLook = new THREE.Vector3(30, 0, 4), v3 = new THREE.Vector3();
  const ease = u => 1 - Math.pow(1 - clamp(u, 0, 1), 3);
  function updateParty(dt) {
    party.forEach((p, i) => {
      if (!p.on) return;
      const back = P.face, side = p.side;
      let gx = P.x - Math.sin(back) * 1.9 + Math.cos(back) * 0.95 * side, gz = P.z - Math.cos(back) * 1.9 - Math.sin(back) * 0.95 * side;
      if (!walkable(gx, gz, 0.45)) { const q = nearestWalk(gx, gz); gx = q.x; gz = q.z; }
      const dx = gx - p.x, dz = gz - p.z, d = Math.hypot(dx, dz), spd = d > 0.5 ? Math.min(6.2, d * 2.4) : 0;
      if (St.dialog) { p.vx = damp(p.vx, 0, 8, dt); p.vz = damp(p.vz, 0, 8, dt); } else { p.vx = damp(p.vx, d > 0.01 ? dx / d * spd : 0, 8, dt); p.vz = damp(p.vz, d > 0.01 ? dz / d * spd : 0, 8, dt); }
      const nx = p.x + p.vx * dt, nz = p.z + p.vz * dt;
      if (walkable(nx, nz, 0.3)) { p.x = nx; p.z = nz; } else if (walkable(nx, p.z, 0.3)) p.x = nx; else if (walkable(p.x, nz, 0.3)) p.z = nz;
      for (const o of [{ x: P.x, z: P.z, r: 0.95 }, ...guards.map(g => ({ x: g.x, z: g.z, r: 0.9 })), ...party.filter(q => q !== p && q.on).map(q => ({ x: q.x, z: q.z, r: 0.95 }))]) { const ex = p.x - o.x, ez = p.z - o.z, ed = Math.hypot(ex, ez); if (ed < o.r && ed > 1e-3) { p.x = o.x + ex / ed * o.r; p.z = o.z + ez / ed * o.r; } }
      const hs = Math.hypot(p.vx, p.vz), want = St.dialog ? Math.atan2(St.dialog.npc.x - p.x, St.dialog.npc.z - p.z) : hs > 0.4 ? Math.atan2(p.vx, p.vz) : p.face;
      let df = want - p.face; df = Math.atan2(Math.sin(df), Math.cos(df)); p.face += df * Math.min(1, dt * 7);
      p.c.position.set(p.x, 0, p.z); p.c.rotation.y = p.face; animFox(p.c, dt, hs);
    });
  }
  function update(dt) {
    const rdt = dt; St.t += dt; St.pt += dt;
    // the arrival (updateDockArrival): flying 3 s → settling 1.2 s (DOCKED) → stepping 1.1 s
    const engines = ship.userData.engines;
    if (St.phase === 'flying') {
      const u = St.pt / 3, k = ease(u), thrust = Math.max(0, 1 - k * 1.15);
      ship.position.lerpVectors(APPROACH, BERTH, k); ship.rotation.x = lerp(0.62, 0, smooth(0.2, 1, u));
      engines.forEach(e => { e.flame.material.opacity = 0.6 * thrust; e.flame.scale.set(1, 0.6 + thrust, 1); e.glow.material.opacity = 0.4 + 0.6 * thrust; e.glow.scale.setScalar(2.6 + thrust * 3); });
      if (thrust > 0.02) for (const e of engines) { ship.updateMatrixWorld(); e.glow.getWorldPosition(v3); const q = trail[trailI]; trailI = (trailI + 1) % trail.length; q.s.position.copy(v3); q.life = 1; q.v.set(rr(-1, 1), rr(-3, -1), rr(2, 5)); }
      if (u >= 1) { St.phase = 'settling'; St.pt = 0; popup(SHIP.x, 4.6, SHIP.z - 2, 'DOCKED'); audio.tone(660, 0.25, 0.05, 'triangle', 1.5); }
    } else if (St.phase === 'settling') {
      ship.position.copy(BERTH); ship.rotation.x = 0; engines.forEach(e => { e.flame.material.opacity = 0; e.glow.material.opacity = damp(e.glow.material.opacity, 0.25, 4, dt); });
      if (St.pt >= 1.2) { St.phase = 'stepping'; St.pt = 0; fox.visible = true; P.x = STEP_FROM.x; P.z = STEP_FROM.z; }
    } else if (St.phase === 'stepping') {
      const u = Math.min(1, St.pt / 1.1); P.x = lerp(STEP_FROM.x, L.hatch.x, ease(u)); P.z = L.hatch.z; P.face = -Math.PI / 2;
      fox.position.set(P.x, 0, P.z); fox.rotation.y = P.face; animFox(fox, dt, u < 1 ? 4 : 0);
      if (St.pt > 0.35 && !party[0].on) { party[0].on = true; hope.visible = true; party[0].x = STEP_FROM.x; party[0].z = STEP_FROM.z + 0.4; }
      if (St.pt > 0.75 && !party[1].on) { party[1].on = true; noble.visible = true; party[1].x = STEP_FROM.x; party[1].z = STEP_FROM.z - 0.4; }
      St.arrived = true; updateParty(dt);
      if (u >= 1) finishArrival();
    }
    for (const q of trail) { if (q.life <= 0) continue; q.life -= dt; q.s.position.addScaledVector(q.v, dt); q.s.material.opacity = Math.max(0, q.life) * 0.6; q.s.scale.setScalar(1.6 + (1 - q.life) * 3); if (q.life <= 0) q.s.material.opacity = 0; }

    // the beam
    const B = St.beam, who = [fox, ...party.map(p => p.c)], base = [1, HBS, NBS];
    if (B) {
      B.t += rdt; const k = Math.min(1, B.t / B.life), sc = B.out ? 1 - smooth(0.15, 0.65, k) : smooth(0.35, 0.85, k);
      who.forEach((c, i) => { const col = cols[i]; col.visible = c.visible; col.position.set(c.position.x, 8, c.position.z); col.material.opacity = Math.sin(k * Math.PI) * 0.75; col.scale.set(1 - k * 0.3, 1, 1 - k * 0.3); c.scale.set(base[i] * Math.max(0.001, sc), base[i] * Math.max(0.001, sc * (B.out ? 1 + k : 1)), base[i] * Math.max(0.001, sc)); });
      if (k >= 1) { St.beam = null; cols.forEach(c => c.material.opacity = 0); who.forEach((c, i) => { c.scale.setScalar(base[i]); if (B.out) c.visible = false; }); B.done && B.done(); }
    }

    // walking
    if (St.phase === 'free') {
      const can = !St.prompt && !St.dialog && !St.leaving && !(B && !B.out);
      let ix = 0, iy = 0;
      if (can) { ix = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + input.jx; iy = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) + input.jy; }
      const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
      const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw), rx = Math.cos(St.yaw), rz = -Math.sin(St.yaw);
      let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix; const ml = Math.hypot(mx, mz); if (ml > 0) { mx /= ml; mz /= ml; }
      const spd = 5.4 * Math.min(1, il);
      P.vx = damp(P.vx, mx * spd, 16, dt); P.vz = damp(P.vz, mz * spd, 16, dt);
      const nx = P.x + P.vx * dt, nz = P.z + P.vz * dt;
      if (walkable(nx, nz)) { P.x = nx; P.z = nz; } else if (walkable(nx, P.z)) P.x = nx; else if (walkable(P.x, nz)) P.z = nz;
      for (const g of guards) { const ex = P.x - g.x, ez = P.z - g.z, ed = Math.hypot(ex, ez); if (ed < 0.85 && ed > 1e-3) { P.x = g.x + ex / ed * 0.85; P.z = g.z + ez / ed * 0.85; } }
      const hs = Math.hypot(P.vx, P.vz);
      let want = hs > 0.4 ? Math.atan2(P.vx, P.vz) : P.face; if (St.dialog && !St.dialog.lines[St.dialog.i].you) want = Math.atan2(St.dialog.npc.x - P.x, St.dialog.npc.z - P.z);
      let df = want - P.face; df = Math.atan2(Math.sin(df), Math.cos(df)); P.face += df * Math.min(1, dt * 12);
      St.dragT -= dt;
      if (opts.followCam && hs > 0.6 && St.dragT <= 0) { let dy = (Math.atan2(P.vx, P.vz) + Math.PI) - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, dt * 1.4); }
      if (input.jump && P.ground && can) { P.vy = 7.5; P.ground = false; audio.tone(420, 0.12, 0.03, 'triangle', 1.6); } input.jump = false;
      P.vy -= 24 * dt; P.y += P.vy * dt; if (P.y <= 0) { P.y = 0; P.vy = 0; P.ground = true; }
      if (P.ground && hs > 1) { P.stepT -= dt * hs; if (P.stepT < 0) { P.stepT = 2.2; audio.tone(140 + rnd() * 30, 0.05, 0.03, 'square'); } }
      fox.position.set(P.x, P.y, P.z); fox.rotation.y = P.face; fox.userData.mood = St.won ? 'happy' : 'determined'; animFox(fox, dt, hs, !P.ground);
      updateParty(dt); checkSpots();
    }
    // talking mouth: the speaker's lines drive fox-kit's word-timed mouth (same as the Fox Workshop + Town Square)
    { const all = [fox, ...guards.map(g => g.c)]; if (St.dialog) { const d = St.dialog, ln = d.lines[d.i]; if (d.li !== d.i) { d.li = d.i; all.forEach(c => { c.userData.say = null; }); const spk = ln.you ? fox : d.npc && d.npc.c; if (spk) { spk.userData.say = { text: ln.text, t: 0 }; spk.userData.talkStyle = /!/.test(ln.text) ? { rate: 1.15, amp: 1.1, base: 0.3, gest: 1.2 } : /\?/.test(ln.text) ? { rate: 1, amp: 1, base: 0.25, gest: 1.1 } : { rate: 0.95, amp: 0.95, base: 0.22, gest: 0.9 }; } } } else if (St.saidLast) all.forEach(c => { c.userData.say = null; c.userData.talking = false; }); St.saidLast = !!St.dialog; }
    // guards: turn to whoever is close, then back to their post
    for (const g of guards) { const talking = St.dialog && St.dialog.npc === g, d = Math.hypot(P.x - g.x, P.z - g.z); const want = talking || (d < 4 && St.phase === 'free') ? Math.atan2(P.x - g.x, P.z - g.z) : g.home; let df = want - g.c.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); g.c.rotation.y += df * Math.min(1, dt * 5); g.c.userData.lineMood = talking && !St.dialog.lines[St.dialog.i].you ? (St.won ? 'happy' : 'stern') : null; animFox(g.c, dt, 0); }

    // pad + lamps
    const pulse = 0.55 + Math.sin(St.t * 2.4) * 0.3;
    padRings.forEach((r, i) => { if (i) r.material.opacity = pulse * (1 - i * 0.22); }); padGlow.material.opacity = 0.3 + pulse * 0.3;
    swell.forEach((r, i) => { const u = (St.t * 0.45 + i * 0.5) % 1; r.scale.setScalar(PAD.r * (1 + u * 1.9)); r.material.opacity = (1 - u) * 0.55; });
    lampGlows.forEach((s, i) => { s.material.opacity = 0.5 + 0.12 * Math.sin(St.t * 1.3 + i); });
    for (let i = popups.length - 1; i >= 0; i--) { const p = popups[i]; p.t += rdt; p.s.position.y += rdt * 0.8; p.s.material.opacity = 1 - smooth(1.0, 1.6, p.t); if (p.t > 1.6) { scene.remove(p.s); p.s.material.map.dispose(); popups.splice(i, 1); } }
    if (St.toast) { St.toast.t += rdt; if (St.toast.t > 2.2) St.toast = null; }
    if (St.note) { St.note.t += rdt; if (St.note.t > 4) St.note = null; }
    planet.rotation.y += rdt * 0.004;

    // camera
    const portrait = camera.aspect < 0.9, phone = Math.min(W(), H()) < 520;
    let tx = P.x, ty = 1.4, tz = P.z, dd = St.dist * (portrait ? 1.35 : phone ? 1.1 : 1), pitch = St.pitch, yaw = St.yaw, ck = 6;
    if (St.phase === 'start') { yaw = St.yaw + St.t * 0.05; tx = 6; tz = 0; ty = -2; dd = 46; pitch = 0.3; ck = 2; }
    else if (St.phase === 'flying' || (St.phase === 'settling' && St.pt < 0.6)) { camPos.lerp(v3.set(portrait ? 4 : 12, portrait ? 7 : 5, portrait ? 26 : 20), 1 - Math.exp(-rdt * 1.5)); camLook.lerp(v3.set(SHIP.x - (portrait ? 2 : 0), 0, SHIP.z + 1), 1 - Math.exp(-rdt * 3)); }
    else if (St.dialog) { const n = St.dialog.npc; tx = (P.x + n.x) / 2; tz = (P.z + n.z) / 2; ty = portrait ? 0.4 : 1.2; const a = Math.atan2(n.x - P.x, n.z - P.z); yaw = a + Math.PI / 2 + (Math.cos(St.yaw - a - Math.PI / 2) < 0 ? Math.PI : 0); dd = portrait ? 7.5 : 5.2; pitch = 0.22; ck = 4; }
    if (St.phase !== 'flying' && !(St.phase === 'settling' && St.pt < 0.6)) {
      if (St.dialog && Math.cos(yaw - St.yaw) < 0.99) St.yaw += Math.atan2(Math.sin(yaw - St.yaw), Math.cos(yaw - St.yaw)) * Math.min(1, rdt * 3);
      const yy = St.dialog ? St.yaw : yaw;
      v3.set(tx + Math.sin(yy) * Math.cos(pitch) * dd, ty + Math.sin(pitch) * dd + 0.4, tz + Math.cos(yy) * Math.cos(pitch) * dd);
      camPos.x = damp(camPos.x, v3.x, ck, rdt); camPos.y = damp(camPos.y, v3.y, ck, rdt); camPos.z = damp(camPos.z, v3.z, ck, rdt);
      camLook.x = damp(camLook.x, tx, ck + 2, rdt); camLook.y = damp(camLook.y, ty, ck + 2, rdt); camLook.z = damp(camLook.z, tz, ck + 2, rdt);
    }
    const wantFov = portrait ? 66 : 58; if (Math.abs(camera.fov - wantFov) > 0.05) { camera.fov = damp(camera.fov, wantFov, 5, rdt); camera.updateProjectionMatrix(); }
    camera.position.copy(camPos); camera.lookAt(camLook);
    stars.position.copy(camera.position);
    key.position.set(P.x - 30, 40, P.z + 20); key.target.position.set(P.x, 0, P.z);

    hudT -= rdt;
    if (hudT < 0) {
      hudT = 0.05;
      const ng = St.phase === 'free' && !St.dialog && !St.prompt ? nearGuard() : null, dl = St.dialog && St.dialog.lines[St.dialog.i];
      const items = Object.entries(save.data.items || {}).map(([id, n]) => ({ id, n, label: ITEM_LABELS[id] || id }));
      const hud = {
        phase: St.phase, playing: St.phase === 'free' && !St.leaving, won: St.won,
        quest: St.won ? { title: 'Escort', text: 'Board your flagship at the end of the gantry.' } : { title: 'Arrival', text: 'Walk west along the gantry to the teleporter.' },
        talk: ng ? ng.name : null,
        dialog: dl ? { name: dl.name, role: dl.role, text: dl.text, you: !!dl.you, i: St.dialog.i + 1, n: St.dialog.lines.length, step: St.dialog.i + 1, total: St.dialog.lines.length, required: !!St.dialog.then } : null,
        prompt: St.prompt ? { title: St.prompt.title, body: St.prompt.body, buttons: St.prompt.buttons.map(b => b.label) } : null,
        toast: St.toast ? St.toast.text : null, note: St.note ? { title: St.note.title, sub: St.note.sub } : null,
        items, muted: St.muted,
      };
      const k = JSON.stringify(hud); if (k !== hudKey) { hudKey = k; onState(hud); }
    }
  }
  function frame() { raf = requestAnimationFrame(frame); try { const fdt = Math.min(clock.getDelta(), 0.05); if (!St.paused) update(fdt); if (mini) drawMini(); } catch (e) { if (!frame.err) { frame.err = 1; window.__8G_ERR = String(e && e.stack || e); console.error('dock update failed:', e && e.stack || e); } } renderer.render(scene, camera); }

  let mini = null;
  function drawMini() { const c = mini; if (!c.isConnected) return; const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr); if (!w || !h) return; if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const x = c.getContext('2d'), k = Math.min(w, h) / 30, X = wx => w / 2 + (wx - P.x) * k, Y = wz => h / 2 + (wz - P.z) * k; x.fillStyle = '#04050b'; x.fillRect(0, 0, w, h);
    const box = (r, col) => { x.fillStyle = col; x.fillRect(X(Math.min(r.x0, r.x1)), Y(Math.min(r.z0, r.z1)), Math.abs(r.x1 - r.x0) * k, Math.abs(r.z1 - r.z0) * k); };
    [L.deck, L.landing, L.spur, L.spurS, GANGWAY].forEach(r => box(r, '#3d4654'));
    x.fillStyle = St.shipLock ? '#5a6270' : '#ec3013'; x.beginPath(); x.ellipse(X(SHIP.x), Y(SHIP.z), 2.6 * k, L.shipLen / 2 * k, 0, 0, Math.PI * 2); x.fill();
    x.strokeStyle = '#7fe3ff'; x.lineWidth = 2 * dpr; x.beginPath(); x.arc(X(L.pad.x), Y(L.pad.z), L.pad.r * k, 0, Math.PI * 2); x.stroke();
    for (const g of guards) { x.fillStyle = '#ffd23a'; x.beginPath(); x.arc(X(g.x), Y(g.z), 4 * dpr, 0, Math.PI * 2); x.fill(); }
    for (const p of party) if (p.on) { x.fillStyle = '#38bdf8'; x.beginPath(); x.arc(X(p.x), Y(p.z), 4 * dpr, 0, Math.PI * 2); x.fill(); }
    x.save(); x.translate(X(P.x), Y(P.z)); x.rotate(Math.PI - P.face); x.fillStyle = '#ffd23a'; x.strokeStyle = '#000'; x.lineWidth = 1.5 * dpr; const s = 9 * dpr; x.beginPath(); x.moveTo(0, -s); x.lineTo(s * 0.75, s * 0.8); x.lineTo(0, s * 0.4); x.lineTo(-s * 0.75, s * 0.8); x.closePath(); x.fill(); x.stroke(); x.restore(); }
  try { const c = JSON.parse(localStorage.getItem('meru.dockCam.v1') || 'null'); if (c && c.dist) { St.dist = clamp(c.dist, 4.5, 16); St.pitch = clamp(c.pitch, 0.08, 1.1); } } catch (e) {}
  const api = window.__8G_GAME = {
    // standard HUD contract (Game HUD.dc.html)
    setStick(x, y) { input.jx = x; input.jy = y; },
    setHudPad(on) { St.hudPad = !!on; if (on) { input.jx = input.jy = 0; JOY.fixed = false; joyBase.style.display = joyKnob.style.display = 'none'; } },
    setPaused(on) { St.paused = !!on; if (on) { input.jx = input.jy = 0; keys.clear(); } },
    nextLine() { api.advance(); },
    closeDialog() { const d = St.dialog; if (!d || d.then) return; St.dialog = null; },
    choose() {}, clearToast() { St.toast = null; }, closeWheel() {}, skipTime() {}, cycleWeather() {},
    melee() { api.action(1); }, range() { api.action(2); },
    eyeLook(dx, dy) { if (!St.eye0) St.eye0 = { yaw: St.yaw, pitch: St.pitch }; St.dragT = 99; St.yaw -= dx * 0.008; St.pitch = clamp(St.pitch + dy * 0.0064, 0.08, 1.1); },
    eyeRelease() { if (St.eye0) { St.yaw = St.eye0.yaw; St.pitch = St.eye0.pitch; St.eye0 = null; } St.dragT = 0; },
    togglePov() { return false; },
    lookBy(dx, dy) { St.dragT = 1.4; St.yaw -= dx * 0.006; St.pitch = clamp(St.pitch + dy * 0.0048, 0.08, 1.1); },
    zoomBy(f) { St.dist = clamp(St.dist * f, 4.5, 16); },
    getCam() { return { dist: St.dist, pitch: St.pitch }; },
    setCam(d, p, lock) { if (d != null) St.dist = clamp(d, 4.5, 16); if (p != null) St.pitch = clamp(p, 0.08, 1.1); if (lock) { St.dragT = 0; try { localStorage.setItem('meru.dockCam.v1', JSON.stringify({ dist: St.dist, pitch: St.pitch })); } catch (e) {} } },
    mapData() { return { p: [P.x, P.z, P.face], indoor: false, b: [['Teleporter', L.pad.x, L.pad.z], ['Flagship', SHIP.x, SHIP.z], ...guards.map(g => ['Dock Guard', g.x, g.z])], f: party.filter(p => p.on).map(p => [p.x, p.z]), e: [], q: St.won ? [SHIP.x, SHIP.z, 'Board ship'] : [L.pad.x, L.pad.z, 'Teleporter'] }; },
    setMinimap(c) { mini = c || null; },
    start() { if (St.phase !== 'start') return; if (St.won) arriveOnPad(); else beginArrival(); },
    skip() { if (St.phase === 'start') return; if (St.phase !== 'free') { trail.forEach(q => { q.life = 0; q.s.material.opacity = 0; }); finishArrival(); } },
    promptPick(i) { const p = St.prompt; if (!p) return; const b = p.buttons[i] || p.buttons[0]; St.prompt = null; audio.blip(); b && b.act && b.act(); },
    advance() { const d = St.dialog; if (!d) return; d.i++; audio.blip(); if (d.i >= d.lines.length) { St.dialog = null; d.then && d.then(); } },
    talk() { if (St.dialog) { api.advance(); return; } if (St.phase !== 'free' || St.prompt) return; const g = nearGuard(); if (g) say(g, DIALOGUE[g.key]); },
    action(n) { if (n === 1 || n === 2) toast('Weapons stay holstered on the dock.'); if (n === 3) input.jump = true; },
    jump() { input.jump = true; },
    useItem(id) { toast((ITEM_LABELS[id] || id) + ': nothing to use it on here.'); },
    toTown() { try { sessionStorage.setItem('meru.spawn', 'pad'); } catch (e) {} onNavigate('Meru Town Square.dc.html'); },
    toggleSound() { St.muted = !St.muted; audio.init(); audio.setMuted(St.muted); },
    setOptions(o) { if (o.outlines != null) outlineMat.visible = !!o.outlines; if (o.followCam != null) opts.followCam = !!o.followCam; },
    setJoy(b) { if (St.hudPad) b = false; if (JOY.fixed === !!b) return; JOY.fixed = !!b; resetJoy(); },
    _dbg() { return { St, P, scene, camera, step(n = 30, dt = 1 / 30) { for (let i = 0; i < n; i++) update(dt); renderer.render(scene, camera); }, warp(w) { const p = { pad: [PAD.x + 2.5, 0], landing: [L.landing.x1 + 0.5, 0], hatch: [L.hatch.x, L.hatch.z], guard: [0, -3.4] }[w]; if (p) { P.x = p[0]; P.z = p[1]; } }, won(b = true) { St.won = b; } }; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur); audio.dispose(); renderer.dispose(); el.remove(); joyBase.remove(); joyKnob.remove(); },
  };
  save.where('meru', 'meruSpacedock');
  frame();
  return api;
}
