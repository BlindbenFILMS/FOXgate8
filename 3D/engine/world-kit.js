// 8 GATES 3D — the shared WORLD KIT.
//
// One engine for every world after Meru. A world is DATA (worlds/data/<world>.json,
// made from the 2D game's own files by tools/gen_worlds.py) plus a style palette:
//
//   * ONE BIG EXTERIOR MAP: the 2D path screens are ZONES laid out side by side,
//     joined by lamp-lined roads where their exits meet. The top-left label
//     follows the player from zone to zone (bracket names kept).
//   * AREAS (interiors, caves, set pieces behind a door) are built far from the
//     map in the same scene and entered with the quick fade.
//   * Ground, paths, buildings, furniture and walls come from each map's 2D WALK
//     MASK, so every room is shaped exactly like its 2D original.
//   * People stand where the 2D game puts them and say their own lines (choices).
//   * Creatures roam the wilds; 1 MELEE / 2 RANGE fight them, but weapons stay
//     holstered in towns and inside.
//   * Important places play the ARRIVAL INTRO (camera fly-around + card) the
//     first time; shops, bars and small rooms never do (Ben, 1 Oct).
//
// Look and feel follow Design's Meru kit: toon shading, ink outlines, glow
// sprites, day/night, fox-kit foxes, Modernist HUD (drawn by the page).
import * as THREE from '../vendor/three/three.module.js';
import { rnd, rr, pick, clamp, smooth, lerp, damp, fbm, paletteAt, makeGradient, glowTexture, Ambience } from '../village-game.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../fox-kit.js';
import { canvasTex, crestTex, signTex, bannerTex, cobbleTex, emblemTex } from './textures.js';
import { save } from './save.js';
import { Conversation, treeFromLinear } from './story.js';
import { creatureKit, KINDS, classify } from './creatures.js';

const S = 80 / 2880;                         // metres per 2D map unit (Meru's scale)
const MEDIA_ROOT = '../';                    // the 3D folder sits inside the game's site folder
const AREA_X0 = 4200, AREA_STEP = 520;       // areas live far from the map

export async function createWorld({ container, world, options = {}, onState = () => {}, onNavigate = () => {}, onPlayGame = () => {} }) {
  const D = typeof world === 'string' ? await (await fetch(new URL('../worlds/data/' + world + '.json', import.meta.url))).json() : world;
  const ST = D.style || {}, W8 = D.world;
  const THEME_OF = z => /^kyoto/.test(z.key) ? 'kyoto' : '';
  const opts = { quality: 'high', timeScale: 2, startHour: ST.night ? 21 : 17.5, ...options };
  try { await document.fonts.load('900 40px Archivo'); } catch (e) {}

  // ---------------------------------------------------------------- renderer
  const Wd = () => container.clientWidth || 1, Ht = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: opts.quality !== 'low', powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, opts.quality === 'low' ? 1 : 2)); renderer.setSize(Wd(), Ht());
  renderer.shadowMap.enabled = opts.quality !== 'low'; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(55, Wd() / Ht(), 0.1, 1400);
  scene.fog = new THREE.FogExp2(0xcfe4f0, 0.006);
  const grad = makeGradient(), glowTex = glowTexture();
  const cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) {
    const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s);
    const o = new THREE.Mesh(g, outlineMat);
    if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01));
    mesh.add(o); return mesh;
  }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m;
  }
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const glowMats = [], glows = [];
  const glowing = (color, map, k = 1.6) => { const m = new THREE.MeshToonMaterial({ color: map ? 0xffffff : color, map, gradientMap: grad, emissive: new THREE.Color(map ? 0xffffff : color), emissiveMap: map || null, emissiveIntensity: 0 }); glowMats.push({ m, k }); return m; };
  // glows: static ones are one batched point cloud (one draw call); moving ones stay sprites
  const GB = { pos: [], col: [], size: [], dirty: false, pts: null, mat: null };
  function glowSprite(x, y, z, color, size, parent, dynamic) {
    if (dynamic) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 })); s.position.set(x, y, z); s.scale.setScalar(size); (parent || scene).add(s); glows.push(s); return s; }
    const v = new THREE.Vector3(x, y, z); if (parent) { parent.updateMatrixWorld(true); parent.localToWorld(v); }
    const c = new THREE.Color(color); GB.pos.push(v.x, v.y, v.z); GB.col.push(c.r, c.g, c.b); GB.size.push(size); GB.dirty = true; return null;
  }
  function flushGlows() {
    if (!GB.dirty) return; GB.dirty = false;
    if (!GB.mat) { GB.mat = new THREE.ShaderMaterial({ uniforms: { map: { value: glowTex }, uOp: { value: 0 }, uScale: { value: 400 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'attribute float size; attribute vec3 gcol; varying vec3 vC; uniform float uScale; void main(){ vC = gcol; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = clamp(size * uScale / max(-mv.z, 0.1), 0.0, 480.0); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform sampler2D map; uniform float uOp; varying vec3 vC; void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb, t.a * uOp); }' }); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(GB.pos, 3)); g.setAttribute('gcol', new THREE.Float32BufferAttribute(GB.col, 3)); g.setAttribute('size', new THREE.Float32BufferAttribute(GB.size, 1));
    if (GB.pts) { GB.pts.geometry.dispose(); GB.pts.geometry = g; } else { GB.pts = new THREE.Points(g, GB.mat); GB.pts.frustumCulled = false; scene.add(GB.pts); }
  }
  const lampM = glowing('#ffd38a', null, 2.2), windowM = glowing('#ffb85a', null, 1.5), accentGlow = glowing(ST.accent || '#ec3013', null, 1.2);
  const DARK = toon('#1b1830'), GOLD = toon(ST.trim || '#e0a84a'), WOOD = toon('#6b4a35');

  // ---------------------------------------------------------------- sky + light (Design's Meru sky)
  const hemi = new THREE.HemisphereLight(0xd6ecff, 0x6f9a52, 1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.5); sun.castShadow = renderer.shadowMap.enabled; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 260 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bottom: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, moonDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunVis: { value: 1 }, moonVis: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vDir; uniform vec3 top, hor, bottom, sunDir, moonDir, sunCol; uniform float sunVis, moonVis;
      void main(){ vec3 d = normalize(vDir); float y = d.y; vec3 col = mix(hor, top, pow(smoothstep(0.0, 1.0, max(y, 0.0)), 0.55)); col = mix(col, bottom, smoothstep(0.0, -0.2, y));
        float sd = max(dot(d, sunDir), 0.0); col += sunCol * (pow(sd, 48.0) * 0.55 + pow(sd, 6.0) * 0.22) * sunVis; col = mix(col, vec3(1.0, 0.97, 0.88), smoothstep(0.9990, 0.9994, sd) * sunVis);
        float md = max(dot(d, moonDir), 0.0); col = mix(col, vec3(0.93, 0.95, 1.0), smoothstep(0.9993, 0.9996, md) * moonVis); col += vec3(0.45, 0.55, 1.0) * pow(md, 120.0) * 0.35 * moonVis;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }` }));
  scene.add(sky);
  const sp = []; for (let i = 0; i < 900; i++) { const u = rnd() * 6.283, v = Math.acos(rr(0.05, 1)); sp.push(Math.sin(v) * Math.cos(u) * 550, Math.cos(v) * 550, Math.sin(v) * Math.sin(u) * 550); }
  const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const stars = new THREE.Points(starGeo, starMat); scene.add(stars);

  // ---------------------------------------------------------------- maps: walk masks
  const MAPS = D.maps;
  for (const k in MAPS) { const m = MAPS[k]; m.rows = m.walk; m.rows.sort((a, b) => a[0] - b[0]); }
  function walkLocal(m, x, y) {
    const R = m.rows; if (!R.length || x < 0 || y < 0 || x > m.w || y > m.h) return false;
    let lo = 0, hi = R.length - 1; if (y < R[0][0] - 12) return false;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (R[mid][0] <= y) lo = mid; else hi = mid - 1; }
    for (const [a, b] of R[lo][1]) if (x >= a && x <= b) return true; return false;
  }

  // ---------------------------------------------------------------- layout: zones on one map, areas far away
  const startM = MAPS[D.start];
  const OX = -(startM.at ? startM.at[0] + startM.w / 2 : startM.w / 2) * S, OZ = -(startM.at ? startM.at[1] + startM.h / 2 : startM.h / 2) * S;
  const zones = D.order.map(k => MAPS[k]).filter(Boolean);
  for (const z of zones) { z.bx = OX + z.at[0] * S; z.bz = OZ + z.at[1] * S; }
  const areas = Object.values(MAPS).filter(m => m.kind !== 'zone');
  areas.forEach((a, i) => { a.bx = AREA_X0 + (i % 6) * AREA_STEP; a.bz = AREA_X0 + Math.floor(i / 6) * AREA_STEP; });
  const toW = (m, x, y) => [m.bx + x * S, m.bz + y * S];
  const toL = (m, X, Z) => [(X - m.bx) / S, (Z - m.bz) / S];
  const zoneAt = (X, Z) => { for (const z of zones) { const [x, y] = toL(z, X, Z); if (x >= 0 && y >= 0 && x <= z.w && y <= z.h) return z; } return null; };
  const roads = (D.links || []).map(L => {
    const a = [OX + L.a[0] * S, OZ + L.a[1] * S], b = [OX + L.b[0] * S, OZ + L.b[1] * S];
    const w = clamp(Math.min(L.edge === 'N' || L.edge === 'S' ? L.wa : L.ha, 420) * S, 3.2, 7);
    return { a, b, w, label: L.label, from: L.from, to: L.to };
  });
  const segD = (px, pz, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz || 1; const t = clamp(((px - a[0]) * dx + (pz - a[1]) * dz) / l2, 0, 1); return Math.hypot(px - (a[0] + dx * t), pz - (a[1] + dz * t)); };
  const onRoad = (X, Z) => roads.some(r => segD(X, Z, r.a, r.b) < r.w / 2);

  // ---------------------------------------------------------------- shared materials and builders
  const texCache = {};
  function wallTex(kind, base) {
    const k = kind + base; if (texCache[k]) return texCache[k];
    const c0 = new THREE.Color(base), hex = (c, f) => '#' + c.clone().multiplyScalar(f).getHexString();
    const t = canvasTex(256, 256, (c) => {
      c.fillStyle = hex(c0, 1); c.fillRect(0, 0, 256, 256);
      if (kind === 'brick') { for (let r = 0; r < 8; r++) for (let q = -1; q < 5; q++) { const x = q * 64 + (r % 2) * 32, y = r * 32; c.fillStyle = hex(c0, 0.86 + ((r * 7 + q * 3) % 5) * 0.06); c.fillRect(x + 2, y + 2, 60, 28); } c.fillStyle = hex(c0, 0.62); for (let r = 0; r <= 8; r++) c.fillRect(0, r * 32 - 1, 256, 3); }
      if (kind === 'stone') { for (let r = 0; r < 5; r++) for (let q = -1; q < 4; q++) { const x = q * 86 + (r % 2) * 43, y = r * 52; c.fillStyle = hex(c0, 0.82 + ((r * 5 + q * 7) % 6) * 0.06); c.beginPath(); c.roundRect(x + 3, y + 3, 80, 46, 8); c.fill(); } }
      if (kind === 'plank') { for (let q = 0; q < 8; q++) { c.fillStyle = hex(c0, 0.86 + (q % 3) * 0.08); c.fillRect(q * 32 + 1, 0, 30, 256); c.fillStyle = hex(c0, 0.6); c.fillRect(q * 32, 0, 2, 256); } }
      if (kind === 'tile') { for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) { c.fillStyle = hex(c0, 0.88 + ((r + q) % 3) * 0.07); c.fillRect(q * 32 + 2, r * 32 + 2, 28, 28); } }
      if (kind === 'panel') { for (let q = 0; q < 4; q++) { c.fillStyle = hex(c0, 0.92); c.fillRect(q * 64 + 4, 4, 56, 248); c.strokeStyle = hex(c0, 1.35); c.lineWidth = 2; c.strokeRect(q * 64 + 10, 12, 44, 232); } }
    }); t.wrapS = t.wrapT = THREE.RepeatWrapping; texCache[k] = t; return t;
  }
  const texMat = (kind, base, rx, ry) => { const t = wallTex(kind, base).clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new THREE.MeshToonMaterial({ map: t, gradientMap: grad }); };
  // CUTAWAY: inside rooms, walls between the camera and the player fade away (Sims style), leaving a low stub
  const CUT = { uP: { value: new THREE.Vector3() }, uC: { value: new THREE.Vector3() }, uOn: { value: 0 } };
  const foxOutline = outlineMat; nearCut(outlineMat, 1.6);   // ink shells right at the lens are dropped
  function cutaway(mat) {
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, CUT);
      sh.vertexShader = 'varying vec3 vCutW;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n#ifdef USE_INSTANCING\nvCutW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;\n#else\nvCutW = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif');
      sh.fragmentShader = 'varying vec3 vCutW; uniform vec3 uP; uniform vec3 uC; uniform float uOn;\n' + sh.fragmentShader.replace('void main() {', 'void main() {\n if (uOn > 0.5 && vCutW.y > 0.45) { vec2 dc = uC.xz - uP.xz; float L = max(length(dc), 0.001); vec2 dr = dc / L; vec2 fp = vCutW.xz - uP.xz; float al = dot(fp, dr); float sd = abs(dot(fp, vec2(-dr.y, dr.x))); if (al > 0.7 && al < L + 3.0 && sd < 2.4 + al * 0.35) discard; }');
    };
    mat.customProgramCacheKey = () => 'cut' + mat.uuid.slice(0, 4);
    return mat;
  }
  // foliage right in front of the lens melts away instead of filling the screen
  function nearCut(mat, rad = 4.2) {
    mat.onBeforeCompile = sh => {
      sh.uniforms.uC = CUT.uC;
      sh.vertexShader = 'varying vec3 vCutW;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n#ifdef USE_INSTANCING\nvCutW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;\n#else\nvCutW = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif');
      sh.fragmentShader = 'varying vec3 vCutW; uniform vec3 uC;\n' + sh.fragmentShader.replace('void main() {', 'void main() {\n if (distance(vCutW, uC) < ' + rad.toFixed(2) + ') discard;');
    };
    mat.customProgramCacheKey = () => 'near' + rad + mat.uuid.slice(0, 4);
    return mat;
  }
  const WALLKIND = { gaya: 'stone', jidda: 'plank', kufa: 'stone', luxor: 'brick', nebo: 'plank', ur: 'brick', zion: 'plank', player: 'brick', earth: 'panel', station: 'panel' }[W8] || 'stone';
  function hipRoof(W, Dp, H, curve = 0) {   // a hip roof over a W x Dp rectangle, ridge along the long side; curve lifts the eaves
    const swap = Dp > W; if (swap) [W, Dp] = [Dp, W];
    const w = W / 2, d = Dp / 2, r = Math.max(0, w - d), e = curve;
    const A = [-w, e, -d], B = [w, e, -d], C = [w, e, d], Dd = [-w, e, d], R1 = [-r, H, 0], R2 = [r, H, 0];
    const tri = []; const q = (a, b, c) => tri.push(...a, ...b, ...c);
    q(Dd, C, R2); q(Dd, R2, R1); q(B, A, R1); q(B, R1, R2); q(A, Dd, R1); q(C, B, R2);
    // the underside, so it reads from below
    q(Dd, B, C); q(Dd, A, B);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(tri, 3)); g.computeVertexNormals(); if (swap) g.rotateY(Math.PI / 2); return g;
  }
  function prism(w, h, d) { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; }
  const bannerT = bannerTex(ST.crest || '8', ST.roof || '#1b2350', ST.trim || '#e6b45a', '#151b3d');
  const bannerM = new THREE.MeshToonMaterial({ map: bannerT, gradientMap: grad, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  let KBM = null; const kyoBannerM = () => KBM || (KBM = new THREE.MeshToonMaterial({ map: canvasTex(128, 256, c => { c.fillStyle = '#26305a'; c.fillRect(0, 0, 128, 256); c.fillStyle = '#f4f1ea'; c.fillRect(0, 0, 128, 14); c.drawImage(monTex().image, 14, 70, 100, 100); }), gradientMap: grad, side: THREE.DoubleSide }));
  const banner = (g, x, y, z) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.8), bannerM); p.position.set(x, y, z); p.castShadow = true; g.add(p); M(BOX(1.05, 0.08, 0.08), GOLD, x, y + 0.92, z, g, 0); };
  const colliders = [], camBlockers = [], KEEP_OUT = [];   // KEEP_OUT: set pieces clear the trees and rocks around them

  // coarse grid of a map's walk mask
  function grid(m, G) {
    const nx = Math.ceil(m.w / G), ny = Math.ceil(m.h / G), g = new Uint8Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) g[j * nx + i] = walkLocal(m, (i + 0.5) * G, (j + 0.5) * G) ? 1 : 0;
    return { nx, ny, g, G, at: (i, j) => (i < 0 || j < 0 || i >= nx || j >= ny) ? 0 : g[j * nx + i] };
  }
  // the ground texture: path where you can walk, wild where you cannot
  function groundTex(m, pathCol, wildCol, edgeCol) {
    const k = 512 / Math.max(m.w, m.h), cw = Math.max(8, Math.round(m.w * k)), ch = Math.max(8, Math.round(m.h * k));
    const t = canvasTex(cw, ch, (c) => {
      c.fillStyle = wildCol; c.fillRect(0, 0, cw, ch);
      for (let i = 0; i < 900; i++) { c.fillStyle = 'rgba(0,0,0,' + rr(0.02, 0.07) + ')'; c.beginPath(); c.arc(rr(0, cw), rr(0, ch), rr(1, 5), 0, 7); c.fill(); }
      c.fillStyle = edgeCol; for (const [y, segs] of m.rows) for (const [a, b] of segs) c.fillRect(a * k - 2, y * k - 2, (b - a) * k + 4, 8 * k + 4);
      c.fillStyle = pathCol; for (const [y, segs] of m.rows) for (const [a, b] of segs) c.fillRect(a * k, y * k, (b - a) * k, 8 * k + 1);
      for (let i = 0; i < 500; i++) { c.fillStyle = 'rgba(255,255,255,' + rr(0.02, 0.06) + ')'; c.fillRect(rr(0, cw), rr(0, ch), rr(1, 3), rr(1, 3)); }
    });
    t.magFilter = THREE.LinearFilter; return t;
  }

  // only the walkable part, for worlds where the rest is water
  function groundTexMask(m, pathCol) {
    const k = 512 / Math.max(m.w, m.h), cw = Math.max(8, Math.round(m.w * k)), ch = Math.max(8, Math.round(m.h * k));
    return canvasTex(cw, ch, (c) => { c.clearRect(0, 0, cw, ch); c.fillStyle = '#e8dcb0'; for (const [y, segs] of m.rows) for (const [a, b] of segs) c.fillRect(a * k - 3, y * k - 3, (b - a) * k + 6, 8 * k + 6); c.fillStyle = pathCol; for (const [y, segs] of m.rows) for (const [a, b] of segs) c.fillRect(a * k, y * k, (b - a) * k, 8 * k + 1); });
  }
  // ---------------------------------------------------------------- the land under everything: one valley per cluster, hills rising away from the paths
  const FARS = [];
  const clusters = {}; for (const z of zones) (clusters[z.cluster || 0] = clusters[z.cluster || 0] || []).push(z);
  const rectD = (x, z, zz) => { const dx = Math.max(zz.bx - x, 0, x - (zz.bx + zz.w * S)), dz = Math.max(zz.bz - z, 0, z - (zz.bz + zz.h * S)); return Math.hypot(dx, dz); };
  for (const [cid, czs] of Object.entries(clusters)) {
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (const z of czs) { x0 = Math.min(x0, z.bx); x1 = Math.max(x1, z.bx + z.w * S); z0 = Math.min(z0, z.bz); z1 = Math.max(z1, z.bz + z.h * S); }
    const pad = 160, w = x1 - x0 + pad * 2, d = z1 - z0 + pad * 2, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const segs = Math.min(200, Math.max(60, Math.round(Math.max(w, d) / 7)));
    const tg = new THREE.PlaneGeometry(w, d, segs, segs); tg.rotateX(-Math.PI / 2);
    const kyo = czs.some(z => THEME_OF(z) === 'kyoto'), desert = /kufa|luxor|ur|earth/.test(W8);
    const pos = tg.attributes.position, cols = new Float32Array(pos.count * 3), c1 = new THREE.Color(ST.wild || '#5f8048'), c2 = new THREE.Color(ST.ground || '#7d9a5e'), rock = new THREE.Color(desert ? '#b0805a' : '#8a8478'), snow = new THREE.Color('#f4f6fa'), tc = new THREE.Color();
    const myRoads = roads.filter(r => czs.some(z => z.key === r.from || z.key === r.to));
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + cx, z = pos.getZ(i) + cz;
      let dmin = 1e9; for (const zz of czs) dmin = Math.min(dmin, rectD(x, z, zz)); for (const r of myRoads) dmin = Math.min(dmin, Math.max(0, segD(x, z, r.a, r.b) - r.w));
      const n = fbm(x * 0.012, z * 0.012), hh = dmin <= 0 ? -0.12 : -0.12 + smooth(6, 70, dmin) * (10 + n * 34) * (W8 === 'jidda' ? 0.25 : 1) + Math.max(0, fbm(x * 0.05, z * 0.05) - 0.5) * 3 * smooth(2, 20, dmin);
      pos.setY(i, hh);
      tc.copy(c1).lerp(c2, smooth(0.3, 0.7, fbm(x * 0.05 + 5, z * 0.05))).lerp(rock, smooth(12, 26, hh)); if (!desert) tc.lerp(snow, smooth(30, 38, hh)); cols.set([tc.r, tc.g, tc.b], i * 3);
    }
    tg.setAttribute('color', new THREE.BufferAttribute(cols, 3)); tg.computeVertexNormals();
    const land = new THREE.Mesh(tg, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad })); land.position.set(cx, 0, cz); land.receiveShadow = true; scene.add(land);
    if (kyo) {   // a snow-capped peak on the skyline, the way Kyoto's prints have one
      const fuji = new THREE.Group(); fuji.position.set(cx + 60, -45, z0 - 330); scene.add(fuji); FARS.push(fuji);
      const body = new THREE.Mesh(new THREE.ConeGeometry(290, 190, 40, 1, true), new THREE.MeshToonMaterial({ color: '#5a6a8a', gradientMap: grad, fog: false })); body.position.y = 95; fuji.add(body);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(92, 60.3, 40, 1, true), new THREE.MeshToonMaterial({ color: '#f4f6fa', gradientMap: grad, fog: false })); cap.position.y = 160.2; fuji.add(cap);
    }
  }


  // ---------------------------------------------------------------- instanced trees, rocks, lamps
  const treeSpots = [], rockSpots = [], lampSpots = [], tuftSpots = [], cliffSpots = [], crystalSpots = [];
  const tuftMax = opts.quality === 'low' ? 1800 : 5000;
  const VEG = { gaya: { kind: 'pine', d: 0.5 }, jidda: { kind: 'palm', d: 0.1, water: true }, kufa: { kind: 'palm', d: 0.06, rock: 0.12 }, luxor: { kind: 'rock', d: 0.0, rock: 0.22 },
    nebo: { kind: 'broad', d: 0.62 }, ur: { kind: 'palm', d: 0.12, rock: 0.05 }, zion: { kind: 'pine', d: 0.18, rock: 0.14 }, player: { kind: 'pine', d: 0.42 },
    earth: { kind: 'cactus', d: 0.05, rock: 0.08 }, station: { kind: 'none', d: 0 } }[W8] || { kind: 'pine', d: 0.4 };
  const treeCols = (VEG.kind === 'palm' ? ['#3f9a4e', '#4fae58', '#2f8a46'] : VEG.kind === 'cactus' ? ['#4f8a45', '#5c9a4a'] : VEG.kind === 'broad' ? ['#3f8a46', '#2f7a3e', '#5a9a3a', '#7aa83a'] : ['#3f7a40', '#2f6a3a', '#4f8a45']).map(c => new THREE.Color(c));
  // instanced, split into 48 m chunks so the camera culls what it cannot see (and far chunks switch off)
  const CHUNKS = [];
  function instanced(geo, mat, list, outline, colsArr) {
    if (!list.length) return;
    const C = opts.quality === 'low' ? 72 : 56, bins = new Map();
    list.forEach((p, i) => { const k = Math.floor(p.x / C) + ',' + Math.floor(p.z / C); if (!bins.has(k)) bins.set(k, []); bins.get(k).push(i); });
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    for (const idx of bins.values()) {
      const im = new THREE.InstancedMesh(geo, mat, idx.length), om = outline ? new THREE.InstancedMesh(geo, outline.isMaterial ? outline : outlineMat, idx.length) : null;
      let cx = 0, cz = 0;
      idx.forEach((li, i) => { const p = list[li]; cx += p.x; cz += p.z; e.set(0, p.r || 0, 0); q.setFromEuler(e); m4.compose(v.set(p.x, p.y || 0, p.z), q, sc.set(p.s, p.sy || p.s, p.s)); im.setMatrixAt(i, m4); if (om) { m4.compose(v.set(p.x, p.y || 0, p.z), q, sc.set(p.s * 1.07, (p.sy || p.s) * 1.05, p.s * 1.07)); om.setMatrixAt(i, m4); } if (colsArr) im.setColorAt(i, colsArr[li % colsArr.length]); });
      im.computeBoundingSphere(); if (om) om.computeBoundingSphere();
      im.castShadow = true; im.receiveShadow = true; scene.add(im); if (om) scene.add(om);
      CHUNKS.push({ x: cx / idx.length, z: cz / idx.length, r: im.boundingSphere ? im.boundingSphere.radius : C, list: om ? [im, om] : [im] });
    }
  }
  const chunkFar = opts.quality === 'low' ? 95 : 170;
  function tickChunks() { for (const c of CHUNKS) { const vis = Math.hypot(c.x - camPos.x, c.z - camPos.z) - c.r < chunkFar; if (c.list[0].visible !== vis) c.list.forEach(m => m.visible = vis); } }



  // ---------------------------------------------------------------- GROUND: wild base, soft-edged paving on the walk mask
  const TOWNRE = /town|square|strip|promenade|bazaar|market|plaza|village|harbo|quarter|street|avenue|yard|courtyard|commons|circle|green/i;
  const shade = (hex, f) => '#' + new THREE.Color(hex).multiplyScalar(f).getHexString();
  const mixc = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
  const tiled = (tex, rx, ry) => { const t = tex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t; };
  const TEXC = {};
  function wildTex(base, cave) {
    const k = 'w' + base + cave; if (TEXC[k]) return TEXC[k];
    return TEXC[k] = canvasTex(256, 256, c => {
      c.fillStyle = base; c.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 70; i++) { c.fillStyle = shade(base, rr(0.86, 1.12)); c.globalAlpha = 0.5; c.beginPath(); c.ellipse(rr(0, 256), rr(0, 256), rr(10, 40), rr(6, 24), rr(0, 3), 0, 7); c.fill(); }
      c.globalAlpha = 1;
      for (let i = 0; i < 900; i++) { c.fillStyle = cave ? 'rgba(0,0,0,0.12)' : (Math.random() < 0.5 ? shade(base, 0.8) : shade(base, 1.18)); c.fillRect(rr(0, 256), rr(0, 256), rr(1, 2.5), rr(2, 5)); }
    });
  }
  function slabTex(base) {   // flagstones for towns and plazas
    const k = 's' + base; if (TEXC[k]) return TEXC[k];
    return TEXC[k] = canvasTex(256, 256, c => {
      c.fillStyle = shade(base, 0.72); c.fillRect(0, 0, 256, 256);
      let y = 0; let r = 0; while (y < 256) { const h = [48, 64, 56][r % 3]; let x = (r * 37) % 60 - 60; while (x < 256) { const w = [72, 56, 88, 64][(r + Math.floor(x)) & 3]; c.fillStyle = shade(base, 0.9 + ((r * 13 + Math.floor(x / 7)) % 5) * 0.045); c.beginPath(); c.roundRect(x + 2, y + 2, w - 4, h - 4, 5); c.fill(); c.fillStyle = 'rgba(255,255,255,0.07)'; c.fillRect(x + 4, y + 4, w - 8, 3); x += w; } y += h; r++; }
      for (let i = 0; i < 300; i++) { c.fillStyle = 'rgba(0,0,0,0.05)'; c.fillRect(rr(0, 256), rr(0, 256), 2, 2); }
    });
  }
  function asphaltTex() { const k = 'asph'; if (TEXC[k]) return TEXC[k]; return TEXC[k] = canvasTex(256, 256, c => { c.fillStyle = '#34343c'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 2600; i++) { c.fillStyle = Math.random() < 0.5 ? '#2a2a30' : '#45454e'; c.fillRect(rr(0, 256), rr(0, 256), rr(1, 2.5), rr(1, 2.5)); } for (let i = 0; i < 6; i++) { c.strokeStyle = 'rgba(20,20,24,0.5)'; c.lineWidth = rr(1, 3); c.beginPath(); let x = rr(0, 256), y = rr(0, 256); c.moveTo(x, y); for (let j = 0; j < 5; j++) { x += rr(-30, 30); y += rr(-30, 30); c.lineTo(x, y); } c.stroke(); } }); }
  function plankTex(base) {   // weathered deck boards
    const k = 'pl' + base; if (TEXC[k]) return TEXC[k];
    return TEXC[k] = canvasTex(256, 256, c => { c.fillStyle = shade(base, 0.55); c.fillRect(0, 0, 256, 256);
      for (let r = 0; r < 8; r++) { let x = -((r * 53) % 120); while (x < 256) { const w = [120, 96, 140][(r + Math.abs(x)) % 3]; c.fillStyle = shade(base, 0.86 + ((r * 7 + Math.abs(x)) % 5) * 0.05); c.fillRect(x + 1, r * 32 + 2, w - 2, 28); c.strokeStyle = shade(base, 0.7); c.lineWidth = 1; for (let g = 0; g < 3; g++) { c.beginPath(); c.moveTo(x + 6, r * 32 + 8 + g * 7); c.lineTo(x + w - 8, r * 32 + 9 + g * 7); c.stroke(); } c.fillStyle = shade(base, 0.45); c.fillRect(x + 5, r * 32 + 14, 3, 3); c.fillRect(x + w - 9, r * 32 + 14, 3, 3); x += w; } }
    }); }
  function dirtTex(base) {
    const k = 'd' + base; if (TEXC[k]) return TEXC[k];
    return TEXC[k] = canvasTex(256, 256, c => {
      c.fillStyle = base; c.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 50; i++) { c.fillStyle = shade(base, rr(0.9, 1.08)); c.beginPath(); c.ellipse(rr(0, 256), rr(0, 256), rr(14, 40), rr(8, 22), rr(0, 3), 0, 7); c.fill(); }
      for (let i = 0; i < 160; i++) { c.fillStyle = shade(base, rr(0.65, 1.25)); c.beginPath(); c.ellipse(rr(0, 256), rr(0, 256), rr(2, 5), rr(1.5, 4), rr(0, 3), 0, 7); c.fill(); }
    });
  }
  function maskTex(m, grow) {   // the walk shape, smoothed: draw small, scale up (works on every browser)
    const big = 768, k = big / Math.max(m.w, m.h), cw = Math.max(8, Math.round(m.w * k)), ch = Math.max(8, Math.round(m.h * k));
    const sk = 0.25, sc = document.createElement('canvas'); sc.width = Math.max(4, Math.round(cw * sk)); sc.height = Math.max(4, Math.round(ch * sk)); const sx = sc.getContext('2d');
    sx.fillStyle = '#000'; sx.fillRect(0, 0, sc.width, sc.height); sx.fillStyle = '#fff';
    const g = grow * k * sk; for (const [y, segs] of m.rows) for (const [a, b] of segs) sx.fillRect(a * k * sk - g, y * k * sk - g, (b - a) * k * sk + g * 2, 8 * k * sk + g * 2 + 0.5);
    return canvasTex(cw, ch, c => { c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(sc, 0, 0, cw, ch); });
  }
  function deckTex() { const k = 'deck'; if (TEXC[k]) return TEXC[k]; return TEXC[k] = canvasTex(256, 256, c => { c.fillStyle = '#4a5262'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#525a6c' : '#465061'; c.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); c.fillStyle = '#6a7488'; for (const [x, y] of [[6, 6], [56, 6], [6, 56], [56, 56]]) c.fillRect(i * 64 + x, j * 64 + y, 3, 3); } c.strokeStyle = 'rgba(95,225,255,0.25)'; c.lineWidth = 2; c.strokeRect(1, 1, 254, 254); }); }
  function groundLayers(z) {
    if (W8 === 'station') { const W = z.w * S, H = z.h * S, cx = z.bx + W / 2, cz = z.bz + H / 2;
      const base = new THREE.Mesh(new THREE.PlaneGeometry(W + 40, H + 40), toon('#151925')); base.rotation.x = -Math.PI / 2; base.position.set(cx, -0.02, cz); scene.add(base);
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshToonMaterial({ color: '#5fe1ff', gradientMap: grad, emissive: new THREE.Color('#5fe1ff'), emissiveIntensity: 0.8, alphaMap: maskTex(z, 10), alphaTest: 0.5 })); glow.rotation.x = -Math.PI / 2; glow.position.set(cx, 0.02, cz); scene.add(glow);
      const deck = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshToonMaterial({ map: tiled(deckTex(), W / 4, H / 4), gradientMap: grad, alphaMap: maskTex(z, 0), alphaTest: 0.5 })); deck.rotation.x = -Math.PI / 2; deck.position.set(cx, 0.04, cz); deck.receiveShadow = true; scene.add(deck);
      return; }
    const W = z.w * S, H = z.h * S, cx = z.bx + W / 2, cz = z.bz + H / 2;
    const flat = (mat, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat); m.rotation.x = -Math.PI / 2; m.position.set(cx, y, cz); m.receiveShadow = true; scene.add(m); return m; };
    const wildCol = z.cave ? '#2e2830' : z.snow ? '#e6edf4' : z.canopy ? '#2f6a3a' : z.terr === 'tree' ? '#4a3222' : (ST.ground || '#7d9a5e');
    if (!VEG.water) flat(new THREE.MeshToonMaterial({ map: tiled(wildTex(wildCol, z.cave), W / 9, H / 9), gradientMap: grad }), 0.0);
    const pathCol = z.cave ? '#7a6a5a' : z.snow ? '#c3ccd8' : (ST.path || '#cbb894');
    const pave = z.asphalt ? asphaltTex() : z.canopy || z.terr === 'tree' ? plankTex('#b08a5a') : z.cave ? dirtTex(pathCol) : VEG.water ? dirtTex('#ead9ab') : z.town || THEME_OF(z) === 'kyoto' ? slabTex(THEME_OF(z) === 'kyoto' ? '#cfc9bb' : pathCol) : dirtTex(pathCol);
    const rep2 = z.town ? 4.5 : 6;
    const wet = VEG.water || z.lakeZone;
    const curbCol = z.asphalt ? '#d8d4cc' : z.snow ? '#f6f9fc' : wet ? '#c9b07a' : z.town ? shade(pathCol, 0.55) : mixc(pathCol, wildCol, 0.5);
    flat(new THREE.MeshToonMaterial({ color: curbCol, gradientMap: grad, alphaMap: maskTex(z, z.town ? 14 : 22), alphaTest: 0.5, transparent: false }), wet ? 0.1 : 0.02);
    flat(new THREE.MeshToonMaterial({ map: tiled(pave, W / rep2, H / rep2), gradientMap: grad, alphaMap: maskTex(z, 0), alphaTest: 0.5 }), wet ? 0.12 : 0.04);
  }

  // ---------------------------------------------------------------- MARKET KIT (bazaar booths, rugs, garlands)
  const MKT = ['#c42d3c', '#2f5f9e', '#e8a33a', '#3f8a46', '#7a3f8a', '#d0603a'];
  function rugTex(c1, c2) { const k = 'rug' + c1 + c2; if (TEXC[k]) return TEXC[k]; return TEXC[k] = canvasTex(64, 128, c => { c.fillStyle = c1; c.fillRect(0, 0, 64, 128); c.strokeStyle = c2; c.lineWidth = 5; c.strokeRect(5, 5, 54, 118); c.fillStyle = c2; for (let y = 24; y < 110; y += 26) { c.beginPath(); c.moveTo(32, y - 10); c.lineTo(46, y); c.lineTo(32, y + 10); c.lineTo(18, y); c.closePath(); c.fill(); } c.fillStyle = '#f2e6c8'; for (let x = 4; x < 64; x += 6) { c.fillRect(x, 0, 2, 4); c.fillRect(x, 124, 2, 4); } }); }
  function marketBooth(g, w, d) {
    const c1 = pick(MKT), cream = toon('#f2e6c8'), cm = toon(c1), wood = WOOD, hb = 2.9, hf = 2.45;
    for (const sx of [-1, 1]) { M(BOX(0.16, hb, 0.16), wood, sx * (w / 2 - 0.1), hb / 2, -d / 2 + 0.1, g, 0.02); M(BOX(0.16, hf, 0.16), wood, sx * (w / 2 - 0.1), hf / 2, d / 2 - 0.1, g, 0.02); }
    const n = Math.max(4, Math.round(w / 0.6)), sw = (w + 0.4) / n, tilt = Math.atan2(hb - hf, d);
    for (let i = 0; i < n; i++) { const st = M(BOX(sw, 0.07, d + 0.7), i % 2 ? cream : cm, -(w + 0.4) / 2 + (i + 0.5) * sw, (hb + hf) / 2 + 0.08, 0.1, g, 0); st.rotation.x = tilt; }
    for (let i = 0; i < n; i++) M(new THREE.ConeGeometry(sw * 0.55, 0.36, 3), i % 2 ? cm : cream, -(w + 0.4) / 2 + (i + 0.5) * sw, hf - 0.12, d / 2 + 0.42, g, 0).rotation.set(Math.PI, Math.PI / 6, 0);
    M(BOX(w + 0.5, 0.1, 0.1), wood, 0, hf + 0.05, d / 2 + 0.42, g, 0);
    M(BOX(w - 0.3, 0.95, 0.75), wood, 0, 0.475, d / 2 - 0.55, g, 0.03); M(BOX(w - 0.2, 0.08, 0.9), toon('#8a6a46'), 0, 0.99, d / 2 - 0.55, g, 0);
    M(BOX(w - 0.5, 0.7, 0.04), cm, 0, 0.5, d / 2 - 0.15, g, 0); M(BOX(w - 0.5, 0.08, 0.05), cream, 0, 0.78, d / 2 - 0.13, g, 0);
    const kind = pick(['fruit', 'spice', 'pots', 'cloth', 'lamps']), cy = 1.03, cz = d / 2 - 0.55;
    for (let x = -w / 2 + 0.5; x < w / 2 - 0.3; x += 0.62) {
      if (kind === 'fruit') { const col = toon(pick(['#ff8a3a', '#9ad04a', '#ec3013', '#f2c14e', '#8a3f7a'])); M(new THREE.BoxGeometry(0.5, 0.14, 0.5), toon('#b08a5a'), x, cy + 0.07, cz, g, 0); for (const [a, b, h] of [[-0.11, -0.11, 0], [0.11, -0.11, 0], [-0.11, 0.11, 0], [0.11, 0.11, 0], [0, 0, 0.15]]) M(new THREE.SphereGeometry(0.11, 8, 6), col, x + a, cy + 0.24 + h, cz + b, g, 0); }
      else if (kind === 'spice') { M(new THREE.CylinderGeometry(0.24, 0.22, 0.16, 12), toon('#b08a5a'), x, cy + 0.08, cz, g, 0); M(new THREE.ConeGeometry(0.22, 0.26, 12), toon(pick(['#d0603a', '#e8a33a', '#c42d3c', '#9a7a2a', '#e8cf4a'])), x, cy + 0.29, cz, g, 0); }
      else if (kind === 'pots') { const pc = toon(pick(['#b5603a', '#c47a4a', '#8a4a2a', '#2f5f9e'])); M(new THREE.SphereGeometry(0.2, 10, 8), pc, x, cy + 0.2, cz, g, 0.015, 0.2).scale.y = 1.2; M(new THREE.CylinderGeometry(0.08, 0.11, 0.14, 10), pc, x, cy + 0.46, cz, g, 0); }
      else if (kind === 'cloth') { M(new THREE.BoxGeometry(0.5, 0.08 + Math.random() * 0.12, 0.45), toon(pick(MKT)), x, cy + 0.08, cz, g, 0); M(new THREE.BoxGeometry(0.46, 0.08, 0.42), toon(pick(MKT)), x, cy + 0.2, cz, g, 0); }
      else { M(new THREE.CylinderGeometry(0.06, 0.14, 0.18, 8), GOLD, x, cy + 0.09, cz, g, 0); M(new THREE.SphereGeometry(0.1, 8, 6), glowing('#ffcf6a', null, 1.4), x, cy + 0.26, cz, g, 0); }
    }
    for (let i = 0; i < Math.min(3, Math.floor(w / 1.6)); i++) { const rc = pick(MKT); let c2 = pick(MKT); if (c2 === rc) c2 = '#f2e6c8'; const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.0), new THREE.MeshToonMaterial({ map: rugTex(rc, c2), gradientMap: grad, side: THREE.DoubleSide })); rug.position.set(-w / 2 + 0.95 + i * 1.5, 1.45, -d / 2 + 0.22); g.add(rug); }
    M(BOX(w - 0.2, 0.08, 0.08), wood, 0, 2.5, -d / 2 + 0.2, g, 0);
    for (const sx of [-1, 1]) { M(new THREE.CylinderGeometry(0.32, 0.26, 0.55, 10), toon('#b08a5a'), sx * (w / 2 + 0.45), 0.28, d / 2 - 0.3, g, 0.02, 0.32); M(new THREE.SphereGeometry(0.28, 8, 6), toon(pick(['#ff8a3a', '#9ad04a', '#e8cf4a'])), sx * (w / 2 + 0.45), 0.55, d / 2 - 0.3, g, 0).scale.y = 0.45; }
    M(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4), DARK, w / 2 - 0.5, hf - 0.2, d / 2 + 0.3, g, 0); M(new THREE.SphereGeometry(0.16, 10, 8), glowing('#ffb04a', null, 1.8), w / 2 - 0.5, hf - 0.48, d / 2 + 0.3, g, 0); glowSprite(w / 2 - 0.5, hf - 0.48, d / 2 + 0.3, 0xffb050, 2.2, g);
    bake(g);
  }
  function laneGarlands(z, r, root) {   // strings of pennants and lanterns across the market lane
    if (!r) return; const [x0, y0, x1, y1] = r, along = (x1 - x0) >= (y1 - y0), L = (along ? x1 - x0 : y1 - y0) * S, wid = (along ? y1 - y0 : x1 - x0) * S + 4;
    const pen = [], lan = []; const flagGeo = new THREE.ConeGeometry(0.15, 0.36, 3);
    for (let t = 5; t < L - 3; t += 11) {
      const a = toW(z, along ? x0 + t / S : (x0 + x1) / 2 - wid / 2 / S, along ? (y0 + y1) / 2 - wid / 2 / S : y0 + t / S), b = toW(z, along ? x0 + t / S : (x0 + x1) / 2 + wid / 2 / S, along ? (y0 + y1) / 2 + wid / 2 / S : y0 + t / S);
      for (const e of [a, b]) { M(new THREE.CylinderGeometry(0.06, 0.08, 5.2, 6), WOOD, e[0], 2.6, e[1], root, 0.015, 0.08); M(new THREE.SphereGeometry(0.11, 8, 6), GOLD, e[0], 5.25, e[1], root, 0); }
      const N = Math.round(wid / 0.5); for (let k = 1; k < N; k++) { const u = k / N, x = a[0] + (b[0] - a[0]) * u, zz = a[1] + (b[1] - a[1]) * u, y = 5.0 - Math.sin(u * Math.PI) * 0.9; if (k % 5 === 0) lan.push([x, y - 0.3, zz]); else pen.push([x, y - 0.25, zz, k]); }
    }
    const cols = MKT.map(c => toon(c));
    for (const [x, y, zz, k] of pen) { const f = M(flagGeo, cols[k % cols.length], x, y, zz, root, 0); f.rotation.x = Math.PI; }
    for (const [x, y, zz] of lan) { M(new THREE.SphereGeometry(0.13, 10, 8), glowing('#ffcf6a', null, 1.6), x, y, zz, root, 0).scale.y = 1.35; glowSprite(x, y, zz, 0xffc060, 1.6); }
  }

  // ---------------------------------------------------------------- ZONE PROPS from the 2D map's own named spots
  const FIRES = [];
  function zoneProps(z) {
    const sp = z.spots || {}, root = new THREE.Group(); scene.add(root);
    const pts = (name) => { const v = sp[name]; return !v ? [] : v.pts ? v.pts : v.p ? [v.p] : []; };
    const at = (p, ry = 0) => { const [X, Z] = toW(z, p[0], p[1]); const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; root.add(g); return g; };
    const solid = (p, r) => { const [X, Z] = toW(z, p[0], p[1]); colliders.push({ c: [X, Z, r] }); };
    const faceIn = p => Math.atan2(z.w / 2 - p[0], z.h / 2 - p[1]);
    const padP = (sp.transportPad && sp.transportPad.p) || (z === MAPS[D.start] ? z.spawn : null);
    const kyo = THEME_OF(z) === 'kyoto';
    // lamps, torches, lanterns
    const L = [...pts('lamps'), ...pts('torches'), ...pts('lanterns')];
    if (L.length >= 3) { z.ownLamps = true; for (const p of L) { const [X, Z] = toW(z, p[0], p[1]); lampSpots.push({ x: X, z: Z, kyo }); } }
    // trees, palms, bushes, rocks
    for (const p of pts('trees')) { const [X, Z] = toW(z, p[0], p[1]); treeSpots.push({ x: X, z: Z, s: rr(0.95, 1.25), r: rr(0, 6), kind: kyo ? 'sakura' : VEG.kind === 'rock' || VEG.kind === 'none' ? 'broad' : VEG.kind }); }
    for (const p of pts('palms')) { const [X, Z] = toW(z, p[0], p[1]); treeSpots.push({ x: X, z: Z, s: rr(1.0, 1.25), r: rr(0, 6), kind: 'palm' }); }
    for (const p of pts('bushes')) { const g = at(p); M(new THREE.IcosahedronGeometry(0.8, 1), toon(pick(['#3f8a46', '#4f9a4a', '#5a9a3a'])), 0, 0.6, 0, g, 0.03, 0.8).scale.y = 0.75; solid(p, 0.7); }
    for (const p of pts('rocks')) { const [X, Z] = toW(z, p[0], p[1]); rockSpots.push({ x: X, z: Z, s: rr(0.6, 1.1), r: rr(0, 6) }); }
    // benches
    for (const n of ['benches', 'overlookBenches']) for (const p of pts(n)) { const g = at(p, faceIn(p)); M(BOX(2.2, 0.12, 0.6), WOOD, 0, 0.5, 0, g, 0.03); M(BOX(2.2, 0.5, 0.1), WOOD, 0, 0.8, -0.28, g, 0.03); for (const sx of [-1, 1]) M(BOX(0.12, 0.5, 0.5), DARK, sx * 0.95, 0.25, 0, g, 0); solid(p, 0.9); }
    for (const p of pts('planters')) { const g = at(p); planterAt(g, 0, 0, ST.accent || '#c42d3c'); solid(p, 0.6); }
    // braziers and fires (they flicker)
    for (const n of ['braziers', 'fires']) for (const p of pts(n)) { const g = at(p); M(new THREE.CylinderGeometry(0.35, 0.5, 0.9, 12), toon('#4a4560'), 0, 0.45, 0, g, 0.03, 0.5); M(new THREE.CylinderGeometry(0.75, 0.45, 0.4, 16), toon('#5c5675'), 0, 1.1, 0, g, 0.04, 0.75); const fl = M(new THREE.ConeGeometry(0.42, 1.0, 8), glowing('#ff9a3a', null, 2.4), 0, 1.75, 0, g, 0); fl.userData.keep = true; const fi = M(new THREE.ConeGeometry(0.22, 0.6, 8), glowing('#ffe28a', null, 2.4), 0, 1.6, 0, g, 0); fi.userData.keep = true; FIRES.push({ fl, fi, ph: rr(0, 9) }); glowSprite(0, 1.8, 0, 0xff9a40, 4.5, g); solid(p, 0.85); }
    // banners on poles
    for (const p of pts('banners')) { const g = at(p, faceIn(p)); M(new THREE.CylinderGeometry(0.1, 0.12, 4.6, 10), DARK, 0, 2.3, 0, g, 0.03, 0.12); M(new THREE.SphereGeometry(0.18, 10, 8), GOLD, 0, 4.7, 0, g, 0.02, 0.18); const b = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.6), kyo ? kyoBannerM() : bannerM); b.position.set(0, 3.4, 0.12); g.add(b); solid(p, 0.25); }
    // crates and cargo
    for (const n of ['crates', 'cargo']) for (const p of pts(n)) { const g = at(p, rr(0, 1)); for (const [x, y, zz, sz] of [[0, 0, 0, 1], [0.95, 0, 0.2, 0.85], [0.3, 1, 0.1, 0.8]]) { const c = M(BOX(sz, sz, sz), toon('#a8844f'), x, y + sz / 2, zz, g, 0.03); M(BOX(sz + 0.02, 0.1, sz + 0.02), toon('#6b4a35'), x, y + sz * 0.8, zz, g, 0); } solid(p, 1.0); }
    // market stalls with striped awnings
    // market stalls: a booth sized to the 2D stall's rectangle — striped tent roof, valance, counter of goods, rugs on the back rail
    const stallItems = n => { const v = sp[n]; if (!v) return []; if (v.items && v.items.length) return v.items.map(it => ({ p: [it.x, it.y], rect: it.rect })); return pts(n).map(p => ({ p })); };
    for (const n of ['stalls', 'souk', 'shops']) for (const it of stallItems(n)) { if (n === 'shops' && z.doors.length) continue; if (n === 'souk' && sp.stalls) continue;
      const p = it.p, ry = faceIn(p), side = Math.abs(Math.sin(ry)) > 0.7; let w = 3.4, d = 2.6;
      if (it.rect) { const rw = (it.rect[2] - it.rect[0]) * S, rh = (it.rect[3] - it.rect[1]) * S; w = clamp(side ? rh : rw, 3, 7.5); d = clamp(side ? rw : rh, 2.4, 4.2); }
      const g = at(p, Math.round(ry / (Math.PI / 2)) * (Math.PI / 2)); marketBooth(g, w, d); const [X, Z] = toW(z, p[0], p[1]); const hw = (side ? d : w) / 2, hd = (side ? w : d) / 2; colliders.push({ box: [X - hw, X + hw, Z - hd, Z + hd], h: 3 }); }
    if (sp.stalls && (sp.mainLane || sp.souk)) laneGarlands(z, (sp.mainLane || sp.souk).r, root);
    // fountains
    for (const p of pts('fountain')) { const g = at(p); M(new THREE.CylinderGeometry(2.6, 2.8, 0.7, 32), toon('#cfcbe0'), 0, 0.35, 0, g, 0.04, 2.8); const w = new THREE.Mesh(new THREE.CircleGeometry(2.3, 32), new THREE.MeshToonMaterial({ color: '#4fb7d8', gradientMap: grad })); w.rotation.x = -Math.PI / 2; w.position.y = 0.66; g.add(w); M(new THREE.CylinderGeometry(0.35, 0.5, 1.6, 12), toon('#cfcbe0'), 0, 1.3, 0, g, 0.03, 0.5); M(new THREE.CylinderGeometry(1.0, 0.6, 0.3, 20), toon('#cfcbe0'), 0, 2.1, 0, g, 0.03, 1.0); const jet = M(new THREE.ConeGeometry(0.25, 1.0, 10), glowing('#bff4ff', null, 0.9), 0, 2.7, 0, g, 0); jet.userData.keep = true; glowSprite(0, 2.4, 0, 0x8fe8ff, 3, g); solid(p, 2.8); }
    // crests set in the ground (the pad already has one)
    for (const n of ['crestMedallion', 'crest', 'platformCrest', 'bankCrest', 'crestJunction']) for (const p of pts(n)) { if (padP && Math.hypot(p[0] - padP[0], p[1] - padP[1]) < 300) continue; const g = at(p); M(new THREE.CylinderGeometry(2.0, 2.0, 0.12, 40), toon(ST.accent || '#c42d3c'), 0, 0.06, 0, g, 0); const top = new THREE.Mesh(new THREE.CircleGeometry(1.95, 40), new THREE.MeshToonMaterial({ map: CREST_EMB(), gradientMap: grad, emissive: 0xffffff, emissiveMap: CREST_EMB(), emissiveIntensity: 0 })); glowMats.push({ m: top.material, k: 0.3 }); top.rotation.x = -Math.PI / 2; top.position.y = 0.125; g.add(top); }
    // stage
    for (const p of pts('stage')) { const g = at(p, faceIn(p)); M(BOX(7, 0.8, 4), WOOD, 0, 0.4, 0, g, 0.04); M(BOX(7.2, 0.12, 4.2), GOLD, 0, 0.82, 0, g, 0.02); for (const sx of [-1, 1]) { M(BOX(0.25, 4.2, 0.25), DARK, sx * 3.4, 2.1, -1.8, g, 0.02); const b = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.2), kyo ? kyoBannerM() : bannerM); b.position.set(sx * 2.6, 2.6, -1.95); g.add(b); } M(BOX(7, 0.3, 0.3), DARK, 0, 4.2, -1.8, g, 0.02); for (let i = 0; i < 8; i++) M(new THREE.SphereGeometry(0.09, 6, 4), lampM, -3.2 + i * 0.92, 4.0, -1.7, g, 0); colliders.push({ c: [g.position.x, g.position.z, 2.4] }); }
    // notice boards and signs
    for (const n of ['noticeBoard', 'sign', 'tally']) for (const p of pts(n)) { const g = at(p, faceIn(p)); for (const sx of [-1, 1]) M(BOX(0.14, 2.2, 0.14), WOOD, sx * 0.8, 1.1, 0, g, 0.02); M(BOX(1.9, 1.2, 0.12), toon('#8a6a46'), 0, 1.6, 0, g, 0.03); for (let i = 0; i < 4; i++) M(BOX(0.42, 0.5, 0.02), toon(pick(['#f4ecd8', '#ffe9a8', '#ffffff'])), -0.6 + i * 0.4, 1.6 + (i % 2) * 0.1, 0.08, g, 0); M(new THREE.ConeGeometry(1.3, 0.5, 4), toon(ST.roof || '#5b4386'), 0, 2.45, 0, g, 0.02).rotation.y = Math.PI / 4; solid(p, 0.6); }
    // shrines, cairns, plinths
    for (const n of ['shrine', 'shrines', 'offeringBowls']) for (const p of pts(n)) { const g = at(p, faceIn(p)); stoneLantern(g, 0, 0); solid(p, 0.6); }
    for (const p of pts('cairns')) { const g = at(p); let y = 0; for (let k = 0; k < 4; k++) { const r = 0.5 - k * 0.1; M(new THREE.DodecahedronGeometry(r, 0), toon('#9a9488'), rr(-0.05, 0.05), y + r * 0.7, 0, g, 0.02, r).scale.y = 0.65; y += r * 1.1; } solid(p, 0.5); }
    for (const p of pts('plinths')) { const g = at(p, faceIn(p)); M(BOX(1.4, 1.2, 1.4), toon('#cfcbe0'), 0, 0.6, 0, g, 0.03); M(BOX(1.6, 0.15, 1.6), GOLD, 0, 1.25, 0, g, 0.02); M(new THREE.CapsuleGeometry(0.35, 0.8, 4, 8), toon('#b8b4c8'), 0, 2.1, 0, g, 0.03, 0.4); M(new THREE.SphereGeometry(0.32, 10, 8), toon('#b8b4c8'), 0, 2.9, 0, g, 0.03, 0.32); for (const sx of [-1, 1]) M(new THREE.ConeGeometry(0.12, 0.35, 4), toon('#b8b4c8'), sx * 0.18, 3.25, 0, g, 0.02); solid(p, 0.9); }
    // guard posts, booths, scoreboards
    for (const n of ['guardPosts', 'ticketBooth']) for (const p of pts(n)) { const g = at(p, faceIn(p)); M(BOX(1.6, 2.6, 1.6), toon(ST.wall || '#d8d0c0'), 0, 1.3, 0, g, 0.04); M(BOX(1.1, 0.8, 0.1), windowM, 0, 1.6, 0.81, g, 0); M(new THREE.ConeGeometry(1.4, 0.9, 4), toon(ST.roof || '#5b4386'), 0, 3.05, 0, g, 0.03).rotation.y = Math.PI / 4; solid(p, 1.0); }
    for (const p of pts('scoreboards')) { const g = at(p, faceIn(p)); for (const sx of [-1, 1]) M(BOX(0.25, 4, 0.25), DARK, sx * 2, 2, 0, g, 0.02); M(BOX(4.6, 2.0, 0.3), toon('#1b1830'), 0, 4, 0, g, 0.04); M(BOX(4.2, 1.6, 0.05), glowing('#ffd23a', null, 0.8), 0, 4, 0.17, g, 0); solid(p, 0.6); }
    bake(root);
  }
  let CREST_E = null; const CREST_EMB = () => CREST_E || (CREST_E = emblemTex(ST.crest || '8', { outer: ST.accent || '#c42d3c', ring: ST.trim || '#e6b45a', bg: '#151b3d', stroke: '#7dd3fc' }));
  function stoneLantern(g, x, zz) { const st = toon('#a8a49a'); M(BOX(0.7, 0.18, 0.7), st, x, 0.09, zz, g, 0.02); M(new THREE.CylinderGeometry(0.14, 0.18, 0.9, 8), st, x, 0.6, zz, g, 0.02, 0.18); M(BOX(0.6, 0.12, 0.6), st, x, 1.1, zz, g, 0.02); const lb = M(BOX(0.42, 0.42, 0.42), glowing('#ffd38a', null, 1.6), x, 1.37, zz, g, 0.02); M(new THREE.ConeGeometry(0.55, 0.38, 4), st, x, 1.78, zz, g, 0.02).rotation.y = Math.PI / 4; M(new THREE.SphereGeometry(0.08, 6, 4), st, x, 2.0, zz, g, 0); glowSprite(x, 1.37, zz, 0xffb060, 1.6, g); }

  // a doored building keeps a believable size; the rest of a big block becomes townhouses with alleys between
  function addBuilding(z, x0, x1, y0, y1, face, door, label, gr) {
    const MAXW = 17 / S, MAXD = 13 / S, ns = face === 'N' || face === 'S';
    let bx0 = x0, bx1 = x1, by0 = y0, by1 = y1;
    if (ns) { const w = Math.min(x1 - x0, MAXW), c = clamp(door[0], x0 + w / 2, x1 - w / 2); bx0 = c - w / 2; bx1 = c + w / 2; const d = Math.min(y1 - y0, MAXD); if (face === 'S') by0 = y1 - d; else by1 = y0 + d; }
    else { const w = Math.min(y1 - y0, MAXW), c = clamp(door[1], y0 + w / 2, y1 - w / 2); by0 = c - w / 2; by1 = c + w / 2; const d = Math.min(x1 - x0, MAXD); if (face === 'E') bx0 = x1 - d; else bx1 = x0 + d; }
    // two doors into one big block: keep both, trimmed apart
    for (const b of buildings) { if (b.z !== z || b.filler || !(b.x0 < bx1 && b.x1 > bx0 && b.y0 < by1 && b.y1 > by0)) continue;
      if (ns) { if (door[0] < (b.x0 + b.x1) / 2) bx1 = Math.min(bx1, b.x0 - 40); else bx0 = Math.max(bx0, b.x1 + 40); } else { if (door[1] < (b.y0 + b.y1) / 2) by1 = Math.min(by1, b.y0 - 40); else by0 = Math.max(by0, b.y1 + 40); } }
    if (bx1 - bx0 < 6 / S || by1 - by0 < 5 / S) { // not enough room: a smaller building on whichever side of the door is free ground
      const sz = 9 / S; let found = null;
      for (const f2 of [face, 'N', 'S', 'E', 'W']) for (const off of [40, 110, 180]) for (const sh of [0, -0.45, 0.45]) { let r; const q = sh * sz;
        if (found) break;
        if (f2 === 'S') r = [door[0] - sz / 2 + q, door[0] + sz / 2 + q, door[1] - off - sz, door[1] - off]; else if (f2 === 'N') r = [door[0] - sz / 2 + q, door[0] + sz / 2 + q, door[1] + off, door[1] + off + sz];
        else if (f2 === 'E') r = [door[0] - off - sz, door[0] - off, door[1] - sz / 2 + q, door[1] + sz / 2 + q]; else r = [door[0] + off, door[0] + off + sz, door[1] - sz / 2 + q, door[1] + sz / 2 + q];
        if (buildings.some(b => b.z === z && !b.filler && b.x0 < r[1] && b.x1 > r[0] && b.y0 < r[3] && b.y1 > r[2])) continue;
        let bl = 0, n = 0; for (let yy = r[2]; yy <= r[3]; yy += 40) for (let xx = r[0]; xx <= r[1]; xx += 40) { n++; if (!walkLocal(z, xx, yy)) bl++; }
        if (bl / n > 0.68) { found = [r, f2]; } }
      if (!found) {   // the 2D drew this building on open ground: use the named spot rectangle the door sits on, else a modest house behind the door
        const rects = []; for (const v of Object.values(z.spots || {})) { if (v && v.r) rects.push(v.r); if (v && v.items) for (const it of v.items) if (it.rect) rects.push(it.rect); }
        const near = (r) => door[0] >= r[0] - 160 && door[0] <= r[2] + 160 && door[1] >= r[1] - 160 && door[1] <= r[3] + 160 && (r[2] - r[0]) * S >= 5 && (r[3] - r[1]) * S >= 4 && (r[2] - r[0]) * S < 60;
        let rc = rects.filter(near).sort((a, b) => (a[2] - a[0]) * (a[3] - a[1]) - (b[2] - b[0]) * (b[3] - b[1]))[0];
        const sz2 = 10 / S, dp = 8 / S;
        if (!rc) rc = face === 'S' ? [door[0] - sz2 / 2, door[1] - dp, door[0] + sz2 / 2, door[1]] : face === 'N' ? [door[0] - sz2 / 2, door[1], door[0] + sz2 / 2, door[1] + dp] : face === 'E' ? [door[0] - dp, door[1] - sz2 / 2, door[0], door[1] + sz2 / 2] : [door[0], door[1] - sz2 / 2, door[0] + dp, door[1] + sz2 / 2];
        if (rects.includes(rc)) { const dN = Math.abs(door[1] - rc[1]), dS = Math.abs(door[1] - rc[3]), dW = Math.abs(door[0] - rc[0]), dE = Math.abs(door[0] - rc[2]), mn = Math.min(dN, dS, dW, dE); face = mn === dS ? 'S' : mn === dN ? 'N' : mn === dE ? 'E' : 'W'; door = face === 'S' ? [door[0], rc[3]] : face === 'N' ? [door[0], rc[1]] : face === 'E' ? [rc[2], door[1]] : [rc[0], door[1]]; }
        let [ax0, ay0, ax1, ay1] = rc; const fw = Math.min(ax1 - ax0, MAXW), fd = Math.min(ay1 - ay0, MAXD);
        if (face === 'N' || face === 'S') { const c = clamp(door[0], ax0 + fw / 2, ax1 - fw / 2); ax0 = c - fw / 2; ax1 = c + fw / 2; if (face === 'S') { ay1 = door[1]; ay0 = ay1 - fd; } else { ay0 = door[1]; ay1 = ay0 + fd; } }
        else { const c = clamp(door[1], ay0 + fd / 2, ay1 - fd / 2); ay0 = c - fd / 2; ay1 = c + fd / 2; const fw2 = Math.min(ax1 - ax0, MAXD); if (face === 'E') { ax1 = door[0]; ax0 = ax1 - fw2; } else { ax0 = door[0]; ax1 = ax0 + fw2; } }
        if (buildings.some(b => b.z === z && !b.filler && b.x0 < ax1 && b.x1 > ax0 && b.y0 < ay1 && b.y1 > ay0)) { (window.__BLDDBG = window.__BLDDBG || []).push([label, door, x0, x1, y0, y1, face]); return; }
        found = [[ax0, ax1, ay0, ay1], face]; z.openBuilt = true; }
      [bx0, bx1, by0, by1] = found[0]; face = found[1]; }
    buildings.push({ z, x0: bx0, x1: bx1, y0: by0, y1: by1, face, door, label });
    (z._blocks = z._blocks || []).push([x0, x1, y0, y1]);
  }
  function fillBlocks(z) {
    const LOT = 11 / S, GAP = 1.6 / S;
    for (const [x0, x1, y0, y1] of z._blocks || []) for (let y = y0; y + LOT * 0.6 <= y1; y += LOT + GAP) for (let x = x0; x + LOT * 0.6 <= x1; x += LOT + GAP) {
      const lx0 = x, lx1 = Math.min(x1, x + LOT), ly0 = y, ly1 = Math.min(y1, y + LOT);
      if (lx1 - lx0 < 5 / S || ly1 - ly0 < 5 / S) continue;
      if (buildings.some(b => b.z === z && b.x0 < lx1 + GAP && b.x1 > lx0 - GAP && b.y0 < ly1 + GAP && b.y1 > ly0 - GAP)) continue;
      let ok = true; for (let yy = ly0; yy <= ly1 && ok; yy += 30) for (let xx = lx0; xx <= lx1; xx += 30) if (walkLocal(z, xx, yy)) { ok = false; break; }
      if (!ok) continue;
      const cxm = (lx0 + lx1) / 2, cym = (ly0 + ly1) / 2; let fbest = 'S', fd = 1e9;
      for (const [f2, px, py] of [['S', cxm, ly1 + 80], ['N', cxm, ly0 - 80], ['E', lx1 + 80, cym], ['W', lx0 - 80, cym]]) { if (walkLocal(z, px, py)) { const dd = Math.hypot(px - z.w / 2, py - z.h / 2); if (dd < fd) { fd = dd; fbest = f2; } } }
      buildings.push({ z, x0: lx0, x1: lx1, y0: ly0, y1: ly1, face: fbest, door: null, label: '', filler: true });
    }
  }


  // ---------------------------------------------------------------- SET PIECES: each world's signature places, from the 2D spots
  const WATER = [];
  function waterMat(col, glow) { const m = new THREE.MeshToonMaterial({ color: col, gradientMap: grad, transparent: true, opacity: 0.9, emissive: new THREE.Color(glow ? col : '#000000'), emissiveIntensity: glow ? 0.5 : 0 }); return m; }
  function waterRect(z, r, col = '#3fa9c8', y = 0.09, glow = false) { const [x0, z0] = toW(z, r[0], r[1]), [x1, z1] = toW(z, r[2], r[3]); const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), waterMat(col, glow)); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); scene.add(m); WATER.push(m); { const W = Math.abs(x1 - x0), H = Math.abs(z1 - z0), st = Math.max(3, Math.min(W, H) / 2); for (let a = Math.min(x0, x1) + st / 2; a < Math.max(x0, x1); a += st) for (let b = Math.min(z0, z1) + st / 2; b < Math.max(z0, z1); b += st) KEEP_OUT.push([a, b, st * 0.75]); } return m; }
  function waterDisk(X, Z, r, col = '#3fa9c8', glow = false) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), waterMat(col, glow)); m.rotation.x = -Math.PI / 2; m.position.set(X, 0.09, Z); scene.add(m); WATER.push(m); const rim = new THREE.Mesh(new THREE.RingGeometry(r, r + 1.2, 48), toon('#d8c89a')); rim.rotation.x = -Math.PI / 2; rim.position.set(X, 0.07, Z); scene.add(rim); KEEP_OUT.push([X, Z, r + 0.5]); return m; }
  function bridgeRect(z, r, along) { const [x0, z0] = toW(z, r[0], r[1]), [x1, z1] = toW(z, r[2], r[3]); const g = new THREE.Group(); g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); scene.add(g); const w = x1 - x0, d = z1 - z0, ax = along ?? (w > d ? 'x' : 'z'); const L = ax === 'x' ? w : d, W = ax === 'x' ? d : w;
    const n = Math.floor(L / 0.7); for (let i = 0; i < n; i++) { const p = -L / 2 + (i + 0.5) * L / n; const pl = M(BOX(ax === 'x' ? 0.62 : W, 0.14, ax === 'x' ? W : 0.62), toon(i % 3 ? '#8a6a46' : '#7a5a3a'), ax === 'x' ? p : 0, 0.32, ax === 'x' ? 0 : p, g, 0.012); }
    for (const s2 of [-1, 1]) { M(BOX(ax === 'x' ? L : 0.14, 0.14, ax === 'x' ? 0.14 : L), toon('#5a3d2c'), ax === 'x' ? 0 : s2 * W / 2, 1.1, ax === 'x' ? s2 * W / 2 : 0, g, 0.01); for (let i = 0; i <= Math.floor(L / 2.4); i++) M(BOX(0.18, 1.1, 0.18), toon('#5a3d2c'), ax === 'x' ? -L / 2 + i * 2.4 : s2 * W / 2, 0.55, ax === 'x' ? s2 * W / 2 : -L / 2 + i * 2.4, g, 0); }
    bake(g); }
  function boatAt(X, Z, ry, scale = 1, pirate) { const g = new THREE.Group(); g.position.set(X, 0.05, Z); g.rotation.y = ry; g.scale.setScalar(scale); scene.add(g);
    M(hipRoof(2.4, 6.2, -0.9), toon(pirate ? '#3a2418' : '#a8844f'), 0, 0.9, 0, g, 0.04); M(BOX(2.2, 0.2, 5.6), toon(pirate ? '#5a3d2c' : '#c9a46a'), 0, 0.85, 0, g, 0.02);
    if (pirate) { M(BOX(2.4, 1.6, 1.8), toon('#3a2418'), 0, 1.6, -2.4, g, 0.03); M(new THREE.CylinderGeometry(0.12, 0.15, 7, 8), toon('#5a3d2c'), 0, 4.3, 0.4, g, 0.02); const sail = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.6), toon('#1d1a20', { side: THREE.DoubleSide })); sail.position.set(0, 4.9, 0.5); g.add(sail); const sk = new THREE.Mesh(new THREE.CircleGeometry(0.6, 16), toon('#f4f1ea', { side: THREE.DoubleSide })); sk.position.set(0, 5.1, 0.52); g.add(sk); for (const s2 of [-1, 1]) M(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 8), DARK, s2 * 1.2, 1.15, 0.6, g, 0).rotation.z = Math.PI / 2; }
    else { M(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 6), toon('#5a3d2c'), 0, 1.6, 0.6, g, 0); }
    bake(g); return g; }
  let CROWD_GEO = null;
  function crowdFoxes(parent, list) {   // instanced spectator foxes that bob and cheer (shared uniforms: CROWD)
    if (!list.length) return null; if (!CROWD) CROWD = { uT: { value: 0 }, uHype: { value: 0.3 } };
    if (!CROWD_GEO) CROWD_GEO = mergeGeos([[new THREE.CapsuleGeometry(0.2, 0.32, 3, 8), MX(0, 0.36, 0)], [new THREE.SphereGeometry(0.19, 8, 6), MX(0, 0.82, 0.02)], [new THREE.ConeGeometry(0.08, 0.18, 4), MX(-0.11, 1.02, 0, 1, 1, 1, 0, 0, 0.3)], [new THREE.ConeGeometry(0.08, 0.18, 4), MX(0.11, 1.02, 0, 1, 1, 1, 0, 0, -0.3)], [new THREE.SphereGeometry(0.09, 6, 5), MX(0, 0.76, 0.18, 1, 0.8, 1.3)]]);
    const mat = new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: grad }); const im = new THREE.InstancedMesh(CROWD_GEO, mat, list.length); const cols = ['#d8642a', '#c4521f', '#e9dcc4', '#8a8a94', '#e8873a', '#5a3d2c', '#f2c18a'].map(c => new THREE.Color(c));
    list.forEach((c, i) => { im.setMatrixAt(i, MX(c.x, c.y, c.z, 1, 1, 1, 0, c.ry || 0, 0)); im.setColorAt(i, cols[(i * 5 + (i >> 3)) % cols.length]); });
    const U = CROWD; mat.onBeforeCompile = sh => { Object.assign(sh.uniforms, U); sh.vertexShader = 'uniform float uT; uniform float uHype;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n float fid = float(gl_InstanceID); transformed.y += abs(sin(uT * (5.0 + mod(fid, 3.0)) + fid * 1.7)) * (0.06 + 0.22 * uHype * step(0.4, fract(fid * 0.37)));'); }; mat.customProgramCacheKey = () => 'crowd';
    parent.add(im); return im; }
  function bleachers(g, w, rows = 5, gap = 0) { for (let r = 0; r < rows; r++) { if (gap) { const hw = (w - gap) / 2; for (const sx of [-1, 1]) M(BOX(hw, 0.5, 0.9), toon(r % 2 ? '#8a94a8' : '#a8b2c4'), sx * (gap / 2 + hw / 2), 0.25 + r * 0.5, -r * 0.9, g, 0.02); } else M(BOX(w, 0.5, 0.9), toon(r % 2 ? '#8a94a8' : '#a8b2c4'), 0, 0.25 + r * 0.5, -r * 0.9, g, 0.02); }
    const crowd = []; for (let r = 0; r < rows; r++) for (let i = 0; i < Math.floor(w / 0.75); i++) { const x = -w / 2 + 0.4 + i * 0.75; if (gap && Math.abs(x) < gap / 2) continue; if ((i * 7 + r * 3) % 6) crowd.push({ x: x + rr(-0.08, 0.08), y: 0.5 + r * 0.5, z: -r * 0.9 + 0.1 }); } crowdFoxes(g, crowd); }
  function courtLines(c, W, H, lines) { c.strokeStyle = '#ffffff'; c.lineWidth = Math.max(2, W / 120); for (const [x0, y0, x1, y1] of lines) { c.beginPath(); c.moveTo(x0 * W, y0 * H); c.lineTo(x1 * W, y1 * H); c.stroke(); } }
  function flatRect(z, r, tex, y = 0.06) { const [x0, z0] = toW(z, r[0], r[1]), [x1, z1] = toW(z, r[2], r[3]); const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshToonMaterial({ map: tex, gradientMap: grad })); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m); return [(x0 + x1) / 2, (z0 + z1) / 2, x1 - x0, z1 - z0]; }
  // ---------------------------------------------------------------- LUXOR KIT: the red river, the zoo cages, the pit's stands
  function mergeGeos(parts) { const pos = [], nor = []; for (const [g0, m4] of parts) { const g = (g0.index ? g0.toNonIndexed() : g0.clone()).applyMatrix4(m4); pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return g; }
  const MX = (x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
  function ribbon(curve, n, w, y) { const pos = [], idx = []; const P = new THREE.Vector3(), T = new THREE.Vector3(); for (let i = 0; i <= n; i++) { const u = i / n; curve.getPointAt(u, P); curve.getTangentAt(u, T); const nx = -T.z, nz = T.x, L = Math.hypot(nx, nz) || 1, ww = w * (0.9 + 0.1 * Math.sin(u * 17)); pos.push(P.x + nx / L * ww / 2, y, P.z + nz / L * ww / 2, P.x - nx / L * ww / 2, y, P.z - nz / L * ww / 2); if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); if (g.attributes.normal.array[1] < 0) { idx.reverse(); g.setIndex(idx); g.computeVertexNormals(); } return g; }
  function riverThrough(z, mapPts, w, col, glow) {
    const curve = new THREE.CatmullRomCurve3(mapPts.map(q => { const [X, Z] = toW(z, q[0], q[1]); return new THREE.Vector3(X, 0, Z); }), false, 'centripetal');
    const n = Math.max(40, Math.round(curve.getLength() / 1.5));
    const bank = new THREE.Mesh(ribbon(curve, n, w + 3.2, 0.06), toon(shade(ST.ground || '#8a4a30', 0.62))); bank.receiveShadow = true; scene.add(bank);
    const wet = new THREE.Mesh(ribbon(curve, n, w + 1.2, 0.08), toon(shade(col, 0.55))); scene.add(wet);
    const water = new THREE.Mesh(ribbon(curve, n, w, 0.11), waterMat(col, glow)); scene.add(water); WATER.push(water);
    const P = new THREE.Vector3(); for (let i = 0; i <= n; i += 2) { curve.getPointAt(i / n, P); KEEP_OUT.push([P.x, P.z, w / 2 + 2.2]); if (i % 6 === 0 && Math.random() < 0.6) { const T = curve.getTangentAt(i / n), sd = Math.random() < 0.5 ? -1 : 1, nx = -T.z * sd, nz = T.x * sd; M(new THREE.DodecahedronGeometry(rr(0.4, 0.9), 0), toon(shade(ST.ground || '#8a4a30', 0.5)), P.x + nx * (w / 2 + 1), 0.15, P.z + nz * (w / 2 + 1), null, 0.03).scale.y = 0.55; } }
    return curve;
  }
  const ZOO = [];
  function zooAnimal(kind) {   // a stylised beast, ~1.2-2.2 m, built from a few shapes
    const g = new THREE.Group(), C = { LION: ['#d8a24a', '#9a5a22'], BEAR: ['#6a4a32', '#4a3222'], STAG: ['#a8744a', '#e9dcc4'], SERPENT: ['#3f8a46', '#e8cf4a'], WOLF: ['#8a8a94', '#5a5a64'], BOAR: ['#5a3d2c', '#e9e1d2'], RAM: ['#e9e1d2', '#8a7a5a'], CROC: ['#4a6a3a', '#c9c48a'], APE: ['#4a3a3a', '#8a6a5a'], PANTHER: ['#22202a', '#e8cf4a'] }[kind] || ['#8a6a46', '#5a3d2c'];
    const body = toon(C[0]), dark = toon(C[1]), eye = toon('#1b1830'), legs = [];
    if (kind === 'SERPENT') { for (let i = 0; i < 3; i++) M(new THREE.TorusGeometry(0.9 - i * 0.22, 0.22, 8, 22), body, 0, 0.22 + i * 0.36, 0, g, 0.03, 1).rotation.x = Math.PI / 2; const nk = M(new THREE.CylinderGeometry(0.17, 0.2, 1.2, 8), body, 0.2, 1.6, 0, g, 0.025, 0.2); nk.rotation.z = -0.25; const hd = M(new THREE.SphereGeometry(0.3, 10, 8), body, 0.36, 2.25, 0.05, g, 0.03, 0.3); hd.scale.set(1, 0.8, 1.4); for (const sx of [-1, 1]) M(new THREE.SphereGeometry(0.05, 6, 5), toon('#e8cf4a'), 0.36 + sx * 0.14, 2.32, 0.36, g, 0); for (let i = 0; i < 8; i++) M(new THREE.SphereGeometry(0.08, 6, 4), dark, Math.cos(i) * 0.8, 0.45, Math.sin(i) * 0.8, g, 0); g.userData.head = hd; g.userData.coil = true; return g; }
    const big = kind === 'BEAR' ? 1.35 : kind === 'LION' ? 1.15 : 1;
    const tor = M(new THREE.CapsuleGeometry(0.42 * big, 1.1 * big, 4, 10), body, 0, 1.0 * big, 0, g, 0.035, 0.42 * big); tor.rotation.x = Math.PI / 2;
    for (const [x, zz] of [[-0.3, 0.5], [0.3, 0.5], [-0.3, -0.5], [0.3, -0.5]]) { const L = new THREE.Group(); L.position.set(x * big, 0.85 * big, zz * big); g.add(L); M(new THREE.CapsuleGeometry(0.13 * big, 0.55 * big, 3, 8), kind === 'STAG' || kind === 'RAM' ? dark : body, 0, -0.42 * big, 0, L, 0.025); legs.push(L); }
    const head = new THREE.Group(); head.position.set(0, 1.35 * big, 0.95 * big); g.add(head);
    M(new THREE.SphereGeometry(0.36 * big, 12, 10), body, 0, 0, 0, head, 0.03, 0.36 * big); M(new THREE.SphereGeometry(0.2 * big, 10, 8), kind === 'LION' ? toon('#e9cf9a') : dark, 0, -0.08 * big, 0.3 * big, head, 0.02, 0.2 * big).scale.set(1, 0.8, 1.1);
    for (const sx of [-1, 1]) { M(new THREE.SphereGeometry(0.055 * big, 6, 5), eye, sx * 0.15 * big, 0.08 * big, 0.3 * big, head, 0); M(new THREE.ConeGeometry(0.11 * big, 0.22 * big, 6), body, sx * 0.22 * big, 0.3 * big, -0.02, head, 0.02); }
    if (kind === 'LION') { const mane = M(new THREE.TorusGeometry(0.36, 0.2, 8, 18), dark, 0, 0, -0.06, head, 0.03, 0.56); mane.scale.set(1.1, 1.1, 1.4); }
    if (kind === 'STAG') for (const sx of [-1, 1]) { const a = new THREE.Group(); a.position.set(sx * 0.14, 0.32, -0.05); a.rotation.z = -sx * 0.4; head.add(a); M(new THREE.CylinderGeometry(0.04, 0.06, 0.8, 5), dark, 0, 0.4, 0, a, 0.015); for (const [y, r] of [[0.35, 0.7], [0.6, -0.6]]) M(new THREE.CylinderGeometry(0.03, 0.04, 0.4, 5), dark, sx * 0.1, y, 0, a, 0.01).rotation.z = r * sx; }
    if (kind === 'BEAR') head.children[1].scale.set(1.1, 0.9, 1.3);
    const tail = M(new THREE.CylinderGeometry(0.05, 0.08, 0.8 * big, 6), body, 0, 1.1 * big, -0.95 * big, g, 0.02); tail.rotation.x = -0.9; if (kind === 'LION') M(new THREE.SphereGeometry(0.1, 8, 6), dark, 0, 1.4 * big, -1.25 * big, g, 0);
    g.userData.legs = legs; g.userData.head = head; g.userData.tail = tail; return g;
  }
  function zooCage(z, it) {
    const [x0, z0] = toW(z, it.rect[0], it.rect[1]), [x1, z1] = toW(z, it.rect[2], it.rect[3]); const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W = Math.min(10, Math.abs(x1 - x0) - 0.8), D = Math.min(8.5, Math.abs(z1 - z0) - 0.8), H = 4.2;
    const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = it.side === 'S' ? Math.PI : 0; scene.add(g);
    const stone = toon(shade(ST.trim || '#c9a46a', 0.75)), iron = toon('#2a2630'), straw = toon('#d8b86a');
    M(BOX(W + 0.8, 0.45, D + 0.8), stone, 0, 0.22, 0, g, 0.04); M(BOX(W, 0.06, D), straw, 0, 0.47, 0, g, 0);
    for (const [px, pz] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]]) M(BOX(0.36, H + 0.4, 0.36), stone, px, 0.45 + (H + 0.4) / 2, pz, g, 0.03);
    for (const [L, fx, fz, ax] of [[W, 0, D / 2, 'x'], [W, 0, -D / 2, 'x'], [D, W / 2, 0, 'z'], [D, -W / 2, 0, 'z']]) { const n = Math.floor(L / 0.42); for (let i = 1; i < n; i++) { const t = -L / 2 + i * L / n; M(new THREE.CylinderGeometry(0.045, 0.045, H, 5), iron, ax === 'x' ? t : fx, 0.45 + H / 2, ax === 'x' ? fz : t, g, 0); } for (const y of [0.9, H + 0.3]) M(BOX(ax === 'x' ? L : 0.12, 0.12, ax === 'x' ? 0.12 : L), iron, fx, y, fz, g, 0); }
    M(BOX(W + 0.9, 0.3, D + 0.9), stone, 0, H + 0.6, 0, g, 0.04); M(BOX(W * 0.55, 0.5, D * 0.5), toon(ST.roof || '#7a2a22'), 0, H + 0.95, 0, g, 0.03);
    M(new THREE.CylinderGeometry(0.5, 0.42, 0.3, 12), stone, W / 2 - 1.1, 0.6, -D / 2 + 1.0, g, 0.02, 0.5); M(new THREE.CircleGeometry(0.42, 12), toon('#5fa8c8'), W / 2 - 1.1, 0.76, -D / 2 + 1.0, g, 0).rotation.x = -Math.PI / 2;
    M(new THREE.DodecahedronGeometry(1.0, 0), toon(shade(ST.ground || '#8a4a30', 0.7)), -W / 2 + 1.4, 0.8, -D / 2 + 1.4, g, 0.03).scale.set(1.3, 0.7, 1);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.55), new THREE.MeshToonMaterial({ map: signTex(it.animal || 'EMPTY', null, ST.trim || '#d9a64a'), gradientMap: grad })); plate.position.set(0, 1.25, D / 2 + 0.2); g.add(plate); M(BOX(2.4, 0.7, 0.08), iron, 0, 1.25, D / 2 + 0.14, g, 0);
    bake(g); colliders.push({ box: [cx - W / 2 - 0.4, cx + W / 2 + 0.4, cz - D / 2 - 0.4, cz + D / 2 + 0.4], h: H + 1 }); KEEP_OUT.push([cx, cz, Math.max(W, D) / 2 + 1.5]);
    if (/LION|BEAR|STAG|SERPENT/.test(it.animal || '')) { const a = zooAnimal(it.animal); a.position.set(0, 0.5, 0); g.add(a); ZOO.push({ a, W: W / 2 - 1.6, D: D / 2 - 1.6, ph: Math.random() * 6, sp: it.animal === 'BEAR' ? 0.7 : 1.1 }); }
  }
  function tickZoo(t) { for (const Z of ZOO) { const a = Z.a, u = a.userData; if (u.coil) { u.head.position.y = 2.25 + Math.sin(t * 1.3 + Z.ph) * 0.12; u.head.rotation.y = Math.sin(t * 0.7 + Z.ph) * 0.8; continue; }
      const cyc = (t * Z.sp * 0.25 + Z.ph) % 4, walk = cyc < 1.6 || (cyc > 2 && cyc < 3.6), dir = cyc < 2 ? 1 : -1, k = cyc < 2 ? cyc / 1.6 : (cyc - 2) / 1.6;
      if (walk) { const e = clamp(k, 0, 1); a.position.x = (dir > 0 ? -1 + 2 * e : 1 - 2 * e) * Z.W; a.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2; u.legs.forEach((L, i) => L.rotation.x = Math.sin(t * 7 * Z.sp + (i % 2 ? 0 : Math.PI) + (i > 1 ? Math.PI : 0)) * 0.5); }
      else { a.rotation.y = damp(a.rotation.y, 0, 3, 0.016); u.legs.forEach(L => L.rotation.x *= 0.9); u.head.rotation.y = Math.sin(t * 1.2 + Z.ph) * 0.5; }
      u.tail.rotation.z = Math.sin(t * 3 + Z.ph) * 0.4; } }
  let CROWD = null;
  function pitStands(X, Z, r0, gapAng, gapW) {   // tiered stands all the way round, a gap where the road comes in; a cheering instanced crowd
    const tiers = 7, step = 1.15, rise = 0.62, t0 = gapAng + gapW / 2, tl = Math.PI * 2 - gapW, stoneA = toon(shade(ST.trim || '#c9a46a', 0.8)), stoneB = toon(shade(ST.trim || '#c9a46a', 0.68));
    const g = new THREE.Group(); g.position.set(X, 0, Z); scene.add(g);
    for (let i = 0; i < tiers; i++) { const r = r0 + i * step, h = (i + 1) * rise; const seat = new THREE.Mesh(new THREE.RingGeometry(r, r + step, 72, 1, t0, tl), i % 2 ? stoneA : stoneB); seat.rotation.x = -Math.PI / 2; seat.position.y = h; seat.material.side = THREE.DoubleSide; g.add(seat); const face = new THREE.Mesh(new THREE.CylinderGeometry(r, r, rise, 72, 1, true, t0 + Math.PI / 2, tl), stoneB); face.position.y = h - rise / 2; face.material.side = THREE.DoubleSide; g.add(face); }
    const rTop = r0 + tiers * step; const wall = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rTop, tiers * rise + 2.2, 72, 1, true, t0 + Math.PI / 2, tl), toon(shade(ST.trim || '#c9a46a', 0.55))); wall.position.y = (tiers * rise + 2.2) / 2; wall.material.side = THREE.DoubleSide; g.add(wall);
    const cap = new THREE.Mesh(new THREE.RingGeometry(rTop - 0.1, rTop + 0.6, 72, 1, t0, tl), toon(ST.roof || '#7a2a22')); cap.rotation.x = -Math.PI / 2; cap.position.y = tiers * rise + 2.2; cap.material.side = THREE.DoubleSide; g.add(cap);
    for (let i = 0; i < 16; i++) { const a = t0 + (i + 0.5) / 16 * tl; const px = Math.cos(a) * (rTop + 0.2), pz = -Math.sin(a) * (rTop + 0.2); M(new THREE.CylinderGeometry(0.08, 0.1, 5, 6), DARK, px, tiers * rise + 4.4, pz, g, 0.02, 0.1); const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.9), toon(i % 2 ? (ST.accent || '#c42d3c') : '#f2e6c8', { side: THREE.DoubleSide })); fl.position.set(px, tiers * rise + 5.6, pz); fl.rotation.y = -a; g.add(fl); }
    const spots = []; for (let i = 0; i < tiers; i++) { const r = r0 + i * step + step * 0.55, n = Math.floor(tl * r / 0.95); for (let k = 0; k < n; k++) if ((k * 7 + i * 3) % 9 > 1) { const a = t0 + (k + 0.5) / n * tl + rr(-0.01, 0.01); spots.push([Math.cos(a) * r, (i + 1) * rise, -Math.sin(a) * r, a]); } }
    crowdFoxes(g, spots.map(([x, y, zz, a]) => ({ x, y, z: zz, ry: Math.PI / 2 + a + Math.PI })));
    KEEP_OUT.push([X, Z, rTop + 1.5]);
    bake(g);
  }
  // ---------------------------------------------------------------- NEBO KIT: garden beds, the Wick Fort palisade, the tree climb, the deep woods, the tree top
  function gardenBed(z, r, i) {
    const [x0, z0] = toW(z, r[0], r[1]), [x1, z1] = toW(z, r[2], r[3]); const W = Math.abs(x1 - x0) - 0.4, D = Math.abs(z1 - z0) - 0.4; const g = new THREE.Group(); g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); scene.add(g);
    for (const [w, d, x, zz] of [[W, 0.2, 0, D / 2], [W, 0.2, 0, -D / 2], [0.2, D, W / 2, 0], [0.2, D, -W / 2, 0]]) M(BOX(w + 0.2, 0.5, d), WOOD, x, 0.25, zz, g, 0.025);
    M(BOX(W - 0.1, 0.12, D - 0.1), toon('#5a3d2c'), 0, 0.42, 0, g, 0);
    const crop = ['cabbage', 'corn', 'sunflower', 'pumpkin', 'carrot', 'corn', 'cabbage', 'sunflower'][i % 8], rows = Math.max(2, Math.floor(D / 1.1)), per = Math.max(3, Math.floor(W / 0.9));
    for (let a = 0; a < rows; a++) for (let b = 0; b < per; b++) { const x = -W / 2 + (b + 0.5) * W / per, zz = -D / 2 + (a + 0.5) * D / rows;
      if (crop === 'cabbage') { M(new THREE.IcosahedronGeometry(0.3, 1), toon(b % 2 ? '#7ab84a' : '#9ad05a'), x, 0.68, zz, g, 0.02, 0.3).scale.y = 0.75; }
      else if (crop === 'corn') { M(new THREE.CylinderGeometry(0.05, 0.07, 2.0, 5), toon('#7a9a3a'), x, 1.45, zz, g, 0); for (let l = 0; l < 3; l++) { const lf = M(new THREE.ConeGeometry(0.1, 0.9, 3), toon('#6a9a3a'), x + (l - 1) * 0.12, 1.1 + l * 0.35, zz, g, 0); lf.rotation.z = (l - 1) * 1.1 || 0.9; } M(new THREE.CapsuleGeometry(0.07, 0.22, 3, 6), toon('#e8cf4a'), x + 0.1, 1.8, zz, g, 0).rotation.z = -0.4; }
      else if (crop === 'sunflower') { if ((a + b) % 2) continue; M(new THREE.CylinderGeometry(0.04, 0.05, 2.2, 5), toon('#5a8a3a'), x, 1.55, zz, g, 0); const hd = M(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 14), toon('#ffcf3a'), x, 2.65, zz + 0.1, g, 0.015, 0.34); hd.rotation.x = 1.2; const c2 = M(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12), toon('#6a3a1a'), x, 2.67, zz + 0.14, g, 0); c2.rotation.x = 1.2; }
      else if (crop === 'pumpkin') { if ((a * 3 + b) % 3 === 2) continue; M(new THREE.SphereGeometry(0.34, 10, 8), toon(b % 2 ? '#ff8a3a' : '#e8732a'), x, 0.7, zz, g, 0.025, 0.34).scale.y = 0.72; M(new THREE.CylinderGeometry(0.04, 0.05, 0.16, 5), toon('#5a8a3a'), x, 0.98, zz, g, 0); }
      else { for (let k = 0; k < 2; k++) M(new THREE.ConeGeometry(0.12, 0.4, 4), toon('#5aa83a'), x + k * 0.25 - 0.12, 0.68, zz, g, 0); } }
    bake(g); colliders.push({ box: [g.position.x - W / 2 - 0.2, g.position.x + W / 2 + 0.2, g.position.z - D / 2 - 0.2, g.position.z + D / 2 + 0.2], h: 0.6 }); KEEP_OUT.push([g.position.x, g.position.z, Math.max(W, D) / 2 + 0.5]);
  }
  function scarecrow(X, Z, ry) { const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; scene.add(g); M(new THREE.CylinderGeometry(0.07, 0.08, 2.6, 6), WOOD, 0, 1.3, 0, g, 0.02); M(BOX(2.0, 0.12, 0.12), WOOD, 0, 1.9, 0, g, 0.02); M(BOX(0.8, 0.9, 0.35), toon('#3f6a9a'), 0, 1.75, 0, g, 0.03); for (const sx of [-1, 1]) M(BOX(0.5, 0.26, 0.3), toon('#3f6a9a'), sx * 0.6, 1.9, 0, g, 0.02); M(new THREE.SphereGeometry(0.3, 10, 8), toon('#e9d8a6'), 0, 2.45, 0, g, 0.025, 0.3); M(new THREE.ConeGeometry(0.55, 0.5, 10), toon('#c9a46a'), 0, 2.8, 0, g, 0.03, 0.55); M(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 14), toon('#c9a46a'), 0, 2.62, 0, g, 0); for (const sx of [-1, 1]) M(new THREE.SphereGeometry(0.04, 6, 4), DARK, sx * 0.1, 2.5, 0.27, g, 0); bake(g); }
  function palisade(z, r, gateX) {
    const [x0, z0] = toW(z, r[0], r[1]), [x1, z1] = toW(z, r[2], r[3]); const g = new THREE.Group(); scene.add(g); const [gx] = toW(z, gateX, r[3]); const log = toon('#7a5a3a'), log2 = toon('#6b4a35'), tipM = toon('#c9a46a');
    const side = (ax, az, bx, bz, gate) => { const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / 0.5); for (let i = 0; i <= n; i++) { const t = i / n, x = ax + (bx - ax) * t, zz = az + (bz - az) * t; if (gate && Math.abs(x - gate) < 4.2) continue; const h = 3.6 + ((i * 37) % 7) * 0.12; M(new THREE.CylinderGeometry(0.24, 0.27, h, 6), i % 2 ? log : log2, x, h / 2, zz, g, 0.02); M(new THREE.ConeGeometry(0.24, 0.5, 6), tipM, x, h + 0.25, zz, g, 0); }
      for (const y of [1.0, 2.8]) { if (gate) { for (const [a, b] of [[ax, gate - 4.2], [gate + 4.2, bx]]) { const l = Math.abs(b - a); if (l > 0.5) M(BOX(l, 0.18, 0.12), log2, (a + b) / 2, y, az + (az < (z0 + z1) / 2 ? 0.3 : -0.3), g, 0); } } else { const cx = (ax + bx) / 2, cz = (az + bz) / 2, along = Math.abs(bx - ax) > Math.abs(bz - az); M(BOX(along ? L : 0.12, 0.18, along ? 0.12 : L), log2, cx + (along ? 0 : (cx < (x0 + x1) / 2 ? 0.3 : -0.3)), y, cz + (along ? (cz < (z0 + z1) / 2 ? 0.3 : -0.3) : 0), g, 0); } }
      const T = 0.6; if (gate) { colliders.push({ box: [ax, gate - 4.2, az - T, az + T], h: 4 }); colliders.push({ box: [gate + 4.2, bx, az - T, az + T], h: 4 }); } else colliders.push({ box: [Math.min(ax, bx) - T, Math.max(ax, bx) + T, Math.min(az, bz) - T, Math.max(az, bz) + T], h: 4 }); };
    side(x0, z0, x1, z0); side(x0, z1, x1, z1, gx); side(x0, z0, x0, z1); side(x1, z0, x1, z1);
    for (const sx of [-1, 1]) { M(new THREE.CylinderGeometry(0.4, 0.45, 6.2, 8), log2, gx + sx * 4.3, 3.1, z1, g, 0.03); M(new THREE.ConeGeometry(0.42, 0.7, 8), tipM, gx + sx * 4.3, 6.55, z1, g, 0); }
    M(BOX(9.6, 0.5, 0.5), log2, gx, 5.4, z1, g, 0.03); const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.1), new THREE.MeshToonMaterial({ map: signTex(z.label.toUpperCase(), null, '#e8cf4a'), gradientMap: grad, side: THREE.DoubleSide })); sg.position.set(gx, 4.6, z1 + 0.3); g.add(sg);
    for (const sx of [-1, 1]) { const d = M(BOX(3.6, 3.4, 0.2), log, gx + sx * 4.0 + sx * 0.3, 1.8, z1 + 1.9, g, 0.02); d.rotation.y = sx * 1.2; }
    for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { const t = new THREE.Group(); t.position.set(cx, 0, cz); g.add(t); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) M(new THREE.CylinderGeometry(0.16, 0.2, 7, 6), log2, a * 1.3, 3.5, b * 1.3, t, 0.02); M(BOX(3.6, 0.25, 3.6), log, 0, 6.2, 0, t, 0.03); for (const [a, b, w, d] of [[0, 1.75, 3.6, 0.12], [0, -1.75, 3.6, 0.12], [1.75, 0, 0.12, 3.6], [-1.75, 0, 0.12, 3.6]]) M(BOX(w, 0.9, d), log2, a, 6.75, b, t, 0.01); M(new THREE.ConeGeometry(2.9, 1.8, 4), toon('#5a3d2c'), 0, 8.4, 0, t, 0.03).rotation.y = Math.PI / 4; for (const a of [-1, 1]) M(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 4), log2, a * 1.3, 7.4, 1.3, t, 0); const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), toon('#1b1830', { side: THREE.DoubleSide })); fl.position.set(0.55, 10.2, 0); t.add(fl); M(new THREE.CylinderGeometry(0.04, 0.04, 2, 4), DARK, 0, 9.6, 0, t, 0); colliders.push({ c: [cx, cz, 2] }); }
    bake(g); KEEP_OUT.push([(x0 + x1) / 2, (z0 + z1) / 2, Math.min(x1 - x0, z1 - z0) / 2]);
    // inside: bandit tents round the yard, a weapon rack, crates
    const tents = [[0.22, 0.25], [0.78, 0.25], [0.2, 0.62], [0.8, 0.6]]; for (const [u, v] of tents) { const mx = r[0] + (r[2] - r[0]) * u, my = r[1] + (r[3] - r[1]) * v; if (!walkLocal(z, mx, my)) continue; const [X, Z] = toW(z, mx, my); const t = new THREE.Group(); t.position.set(X, 0, Z); t.rotation.y = Math.atan2((x0 + x1) / 2 - X, (z0 + z1) / 2 - Z); scene.add(t); M(prism(3.4, 2.4, 3.8), toon(pick(['#8a6a46', '#6a5a46', '#9a7a5a'])), 0, 0, 0, t, 0.04).rotation.y = Math.PI / 2; M(BOX(1.1, 1.6, 0.05), toon('#2a2018'), 0, 0.8, 1.92, t, 0); M(new THREE.CylinderGeometry(0.05, 0.05, 2.8, 5), WOOD, 0, 1.4, 2.1, t, 0); bake(t); colliders.push({ c: [X, Z, 1.9] }); }
  }
  function climbDress(z) {
    const sp = z.spots || {}, pts = n => (sp[n] && sp[n].pts) || [];
    for (const p of pts('mushrooms')) { const [X, Z] = toW(z, p[0], p[1]); const g = new THREE.Group(); g.position.set(X, 0, Z); scene.add(g); for (let i = 0; i < 3; i++) { const h = 0.3 + i * 0.22, r = 0.42 - i * 0.1; M(new THREE.CylinderGeometry(0.06, 0.08, h, 6), toon('#e9dcc4'), i * 0.35 - 0.3, h / 2, i * 0.2, g, 0); const cap = M(new THREE.SphereGeometry(r, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(i % 2 ? '#d0603a' : '#e8873a'), i * 0.35 - 0.3, h, i * 0.2, g, 0.02, r); for (let d = 0; d < 3; d++) M(new THREE.SphereGeometry(0.05, 6, 4), toon('#f2e6c8'), i * 0.35 - 0.3 + Math.cos(d * 2) * r * 0.55, h + r * 0.75, i * 0.2 + Math.sin(d * 2) * r * 0.55, g, 0); } bake(g); }
    for (const p of pts('knots')) { const [X, Z] = toW(z, p[0], p[1]); M(new THREE.SphereGeometry(0.7, 10, 8), toon('#4a3222'), X, 0.4, Z, null, 0.03, 0.7).scale.set(1.3, 0.6, 1); M(new THREE.TorusGeometry(0.45, 0.12, 6, 14), toon('#3a2618'), X, 0.66, Z, null, 0).rotation.x = Math.PI / 2; }
    for (const p of pts('vines')) { const [X, Z] = toW(z, p[0], p[1]); const g = new THREE.Group(); g.position.set(X, 0, Z); scene.add(g); for (let k = 0; k < 3; k++) { const x = (k - 1) * 0.5, L = rr(4, 7); M(new THREE.CylinderGeometry(0.035, 0.035, L, 4), toon('#4f7a2e'), x, 8 - L / 2, 0, g, 0); for (let j = 0; j < L / 0.6; j++) M(new THREE.ConeGeometry(0.16, 0.34, 3), toon(j % 2 ? '#5a9a3a' : '#4f8a34'), x + (j % 2 ? 0.1 : -0.1), 8 - j * 0.6, 0, g, 0).rotation.z = j % 2 ? -1.2 : 1.2; } M(new THREE.IcosahedronGeometry(1.4, 1), toon('#3f8a46'), 0, 8.4, 0, g, 0.03, 1.4).scale.y = 0.6; bake(g); }
  }
  function deepWoodsDress(z) {
    const sp = z.spots || {}, pts = n => (sp[n] && sp[n].pts) || [], P = n => sp[n] && sp[n].p;
    const mc = ['#5fe1ff', '#b98aff', '#7affc8']; for (const [i, p] of pts('glowMushrooms').entries()) { const [X, Z] = toW(z, p[0], p[1]); const c = mc[i % 3]; for (let k = 0; k < 2; k++) { const x = X + k * 0.3, zz = Z + k * 0.2, h = 0.22 + k * 0.14; M(new THREE.CylinderGeometry(0.03, 0.04, h, 5), toon('#e9e1d2'), x, h / 2, zz, null, 0); M(new THREE.SphereGeometry(0.14 - k * 0.03, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), glowing(c, null, 1.8), x, h, zz, null, 0); } glowSprite(X, 0.35, Z, new THREE.Color(c).getHex(), 1.4); }
    if (sp.hollowLog && sp.hollowLog.r) { const r = sp.hollowLog.r, [x0, z0] = toW(z, r[0], r[1]), [x1, z1] = toW(z, r[2], r[3]); const L = Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0)), along = Math.abs(x1 - x0) > Math.abs(z1 - z0); const g = new THREE.Group(); g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); g.rotation.y = along ? Math.PI / 2 : 0; scene.add(g); const lg = M(new THREE.CylinderGeometry(1.5, 1.6, L, 14, 1, true), toon('#6b4a35', { side: THREE.DoubleSide }), 0, 1.45, 0, g, 0.04, 1.6); lg.rotation.x = Math.PI / 2; for (const e of [-1, 1]) { const ring = M(new THREE.TorusGeometry(1.5, 0.14, 6, 16), toon('#c9a46a'), 0, 1.45, e * L / 2, g, 0); } M(new THREE.SphereGeometry(0.5, 8, 6), toon('#4f8a34'), 0.6, 2.9, 0.4, g, 0).scale.y = 0.5; bake(g); }
    // (the tree house itself is built by the door system)
  }
  function gliderRack(z, r) { const [x0, z0] = toW(z, r[0], r[1]), [x1, z1] = toW(z, r[2], r[3]); const g = new THREE.Group(); g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); scene.add(g); const W = Math.abs(x1 - x0);
    for (const sx of [-1, 1]) M(BOX(0.16, 2.2, 0.16), WOOD, sx * (W / 2 - 0.4), 1.1, 0, g, 0.02); M(BOX(W - 0.6, 0.14, 0.14), WOOD, 0, 2.2, 0, g, 0.02);
    for (let k = 0; k < 2; k++) { const w = new THREE.Group(); w.position.set((k - 0.5) * W * 0.45, 2.35, 0); w.rotation.x = -0.25; g.add(w); const shp = new THREE.Shape(); shp.moveTo(0, 1.4); shp.lineTo(2.3, -0.7); shp.lineTo(0, -0.3); shp.lineTo(-2.3, -0.7); shp.closePath(); const wing = new THREE.Mesh(new THREE.ShapeGeometry(shp), toon(k ? (ST.accent || '#c42d3c') : '#f2e6c8', { side: THREE.DoubleSide })); wing.rotation.x = -Math.PI / 2; w.add(wing); M(BOX(0.06, 0.06, 2.0), DARK, 0, 0.02, 0.4, w, 0); M(BOX(3.6, 0.05, 0.05), DARK, 0, 0.02, 0.6, w, 0); }
    bake(g); }

  // ---------------------------------------------------------------- UR KIT: the hunters' pond, the beast-run pens
  function waterEllipse(X, Z, rx, rz, col) { const m = waterDisk(X, Z, rx, col); }
  function cabin(X, Z, W, D, ry, door = true) { const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; scene.add(g); const lg = toon('#7a5a3a'), lg2 = toon('#6b4a35');
    for (let y = 0; y < 2.8; y += 0.4) { M(new THREE.CylinderGeometry(0.2, 0.2, W, 7), (y / 0.4) % 2 ? lg : lg2, 0, y + 0.2, D / 2, g, 0.015).rotation.z = Math.PI / 2; M(new THREE.CylinderGeometry(0.2, 0.2, W, 7), (y / 0.4) % 2 ? lg2 : lg, 0, y + 0.2, -D / 2, g, 0.015).rotation.z = Math.PI / 2; M(new THREE.CylinderGeometry(0.2, 0.2, D, 7), lg, W / 2, y + 0.4, 0, g, 0.015).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.2, 0.2, D, 7), lg2, -W / 2, y + 0.4, 0, g, 0.015).rotation.x = Math.PI / 2; }
    M(BOX(W - 0.2, 2.8, D - 0.2), toon('#5a3d2c'), 0, 1.4, 0, g, 0); M(hipRoof(W + 1.2, D + 1.2, 1.9), toon('#4a5a3a'), 0, 2.9, 0, g, 0.04);
    if (door) M(BOX(1.1, 2.0, 0.08), toon('#2a2018'), 0, 1.0, D / 2 + 0.22, g, 0); for (const sx of [-1, 1]) { M(BOX(0.8, 0.7, 0.08), glowing('#ffcf6a', null, 1.2), sx * W * 0.3, 1.6, D / 2 + 0.22, g, 0); M(BOX(0.95, 0.1, 0.12), lg2, sx * W * 0.3, 1.22, D / 2 + 0.26, g, 0); }
    M(BOX(0.6, 1.6, 0.6), toon('#6a6460'), W / 2 - 0.8, 4.0, -0.4, g, 0.02); bake(g); colliders.push({ box: [X - W / 2 - 0.3, X + W / 2 + 0.3, Z - D / 2 - 0.3, Z + D / 2 + 0.3], h: 5 }); KEEP_OUT.push([X, Z, Math.max(W, D) / 2 + 1]); return g; }
  function dryingRack(X, Z, ry) { const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; scene.add(g); for (const sx of [-1, 1]) { const a = M(BOX(0.12, 2.4, 0.12), WOOD, sx * 1.3, 1.1, 0.4, g, 0.015); a.rotation.x = 0.3; const b = M(BOX(0.12, 2.4, 0.12), WOOD, sx * 1.3, 1.1, -0.4, g, 0.015); b.rotation.x = -0.3; } M(BOX(2.9, 0.1, 0.1), WOOD, 0, 2.2, 0, g, 0);
    for (let i = 0; i < 5; i++) { const x = -1.1 + i * 0.55; if (i % 2) { const f = M(new THREE.ConeGeometry(0.16, 0.7, 6), toon('#9ab0b8'), x, 1.75, 0, g, 0.01); f.rotation.z = Math.PI; } else M(BOX(0.42, 0.8, 0.04), toon(pick(['#8a6a46', '#a8844f', '#6a4a32'])), x, 1.75, 0, g, 0.01); } M(BOX(0.6, 0.5, 0.05), toon('#e9dcc4'), 0.9, 1.0, 0.45, g, 0); bake(g); }
  function beastPen(z, sp) { const r = sp.r, [x0, z0] = toW(z, r[0], r[1]), [x1, z1] = toW(z, r[2], r[3]); const X = (x0 + x1) / 2, Z = (z0 + z1) / 2, R = Math.min(Math.abs(x1 - x0), Math.abs(z1 - z0)) / 2 - 0.6; const g = new THREE.Group(); g.position.set(X, 0, Z); scene.add(g); const iron = toon('#5a4a42'), rust = toon('#8a4a2a'), stone = toon(shade(ST.trim || '#c9a46a', 0.7));
    const ring = new THREE.Mesh(new THREE.RingGeometry(R, R + 1.0, 48), stone); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06; g.add(ring); const sand = new THREE.Mesh(new THREE.CircleGeometry(R, 48), toon(shade(ST.path || '#cbb894', 0.92))); sand.rotation.x = -Math.PI / 2; sand.position.y = 0.05; g.add(sand);
    const n = 64; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if (Math.sin(a * 3 + 1) > 0.82) continue; const h = 2.6 - (i % 5 === 0 ? 1.2 : 0); const b = M(new THREE.CylinderGeometry(0.06, 0.06, h, 5), i % 3 ? iron : rust, Math.cos(a) * (R + 0.5), h / 2, Math.sin(a) * (R + 0.5), g, 0); b.rotation.z = (i % 7 === 0) ? 0.25 : 0; }
    for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + 0.4, cx = Math.cos(a) * (R - 3), cz = Math.sin(a) * (R - 3); const c = new THREE.Group(); c.position.set(cx, 0, cz); c.rotation.y = -a; g.add(c); for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) M(BOX(0.12, 2.2, 0.12), iron, px * 1.1, 1.1, pz * 1.1, c, 0.01); for (let i = -2; i <= 2; i++) { M(new THREE.CylinderGeometry(0.035, 0.035, 2.1, 4), rust, i * 0.42, 1.05, -1.1, c, 0); M(new THREE.CylinderGeometry(0.035, 0.035, 2.1, 4), rust, -1.1, 1.05, i * 0.42, c, 0); M(new THREE.CylinderGeometry(0.035, 0.035, 2.1, 4), rust, 1.1, 1.05, i * 0.42, c, 0); } M(BOX(2.4, 0.12, 2.4), iron, 0, 2.2, 0, c, 0.01); const dr = new THREE.Group(); dr.position.set(1.1, 0, 1.1); dr.rotation.y = 1.9 + k * 0.2; c.add(dr); for (let i = 0; i < 5; i++) M(new THREE.CylinderGeometry(0.035, 0.035, 2.0, 4), rust, -i * 0.44 - 0.1, 1.05, 0, dr, 0); M(BOX(2.1, 0.08, 0.08), rust, -1.0, 1.9, 0, dr, 0); M(BOX(2.1, 0.08, 0.08), rust, -1.0, 0.3, 0, dr, 0); M(new THREE.TorusGeometry(0.2, 0.04, 5, 10), rust, 0.3, 0.15, 0.5, c, 0).rotation.x = Math.PI / 2; }
    for (const q of sp.braziers || []) { const [a, b] = toW(z, q[0], q[1]); const bg = new THREE.Group(); bg.position.set(a - X, 0, b - Z); g.add(bg); M(new THREE.CylinderGeometry(0.4, 0.25, 1.2, 8), iron, 0, 0.6, 0, bg, 0.02, 0.4); M(new THREE.CylinderGeometry(0.6, 0.45, 0.3, 10), iron, 0, 1.3, 0, bg, 0.02, 0.6); M(new THREE.ConeGeometry(0.42, 0.9, 7), glowing('#ff9a3a', null, 2.2), 0, 1.75, 0, bg, 0); glowSprite(a, 1.9, b, 0xff9a40, 4.5); }
    for (let i = 0; i < 8; i++) { const a = rr(0, 6.28), d = rr(1, R - 2); M(new THREE.CylinderGeometry(0.06, 0.08, rr(0.5, 1.0), 5), toon('#e9e1d2'), Math.cos(a) * d, 0.1, Math.sin(a) * d, g, 0).rotation.z = Math.PI / 2 + rr(-0.4, 0.4); }
    bake(g); KEEP_OUT.push([X, Z, R + 1.5]); }

  // ---------------------------------------------------------------- HOME KIT: snow, snowmen, the chairlift, the bonfire, the frozen pond, the lake
  function snowman(X, Z, ry, s = 1) { const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; g.scale.setScalar(s); scene.add(g); const sn = toon('#f6f9fc');
    M(new THREE.SphereGeometry(0.62, 14, 10), sn, 0, 0.55, 0, g, 0.03, 0.62); M(new THREE.SphereGeometry(0.45, 14, 10), sn, 0, 1.4, 0, g, 0.03, 0.45); M(new THREE.SphereGeometry(0.32, 12, 10), sn, 0, 2.05, 0, g, 0.025, 0.32);
    M(new THREE.ConeGeometry(0.06, 0.34, 6), toon('#ff8a3a'), 0, 2.05, 0.42, g, 0).rotation.x = Math.PI / 2; for (const sx of [-1, 1]) M(new THREE.SphereGeometry(0.04, 6, 4), DARK, sx * 0.11, 2.15, 0.28, g, 0); for (let i = 0; i < 3; i++) M(new THREE.SphereGeometry(0.045, 6, 4), DARK, 0, 1.25 + i * 0.16, 0.43 - Math.abs(i - 1) * 0.02, g, 0);
    M(new THREE.TorusGeometry(0.3, 0.07, 6, 14), toon(pick([ST.accent || '#c42d3c', '#2f5f9e', '#3f8a46'])), 0, 1.78, 0, g, 0).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.2, 0.22, 0.32, 10), DARK, 0, 2.42, 0, g, 0.02); M(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 12), DARK, 0, 2.27, 0, g, 0);
    for (const sx of [-1, 1]) { const a = M(new THREE.CylinderGeometry(0.03, 0.04, 0.9, 4), WOOD, sx * 0.62, 1.55, 0, g, 0); a.rotation.z = sx * -1.0; } bake(g); colliders.push({ c: [X, Z, 0.7 * s] }); }
  const LIFTS = [];
  function chairlift(X0, Z0, X1, Z1) {   // towers, a cable loop and chairs that ride it
    const L = Math.hypot(X1 - X0, Z1 - Z0), ry = Math.atan2(X1 - X0, Z1 - Z0); const g = new THREE.Group(); g.position.set(X0, 0, Z0); g.rotation.y = ry; scene.add(g); const steel = toon('#5a6276'), H = 7.5;
    for (const zz of [0, L]) { M(BOX(4.4, 0.5, 3.4), toon('#8a6a46'), 0, 2.6, zz, g, 0.03); for (const [a, b] of [[-1.9, -1.4], [1.9, -1.4], [-1.9, 1.4], [1.9, 1.4]]) M(BOX(0.25, 2.6, 0.25), WOOD, a, 1.3, zz + b, g, 0.01); M(hipRoof(5.2, 4.2, 1.2), toon(ST.accent || '#c42d3c'), 0, 2.85, zz, g, 0.03); M(new THREE.CylinderGeometry(1.5, 1.5, 0.4, 20), steel, 0, H - 0.5, zz, g, 0.02, 1.5); M(BOX(0.4, H - 2.8, 0.4), steel, 0, (H + 2.8) / 2 - 0.4, zz, g, 0.02); }
    const nT = Math.max(1, Math.round(L / 14)); for (let i = 1; i < nT; i++) { const zz = i * L / nT; M(BOX(0.45, H, 0.45), steel, 0, H / 2, zz, g, 0.02); M(BOX(3.4, 0.25, 0.3), steel, 0, H, zz, g, 0.02); }
    for (const sx of [-1.5, 1.5]) M(new THREE.CylinderGeometry(0.03, 0.03, L, 4), DARK, sx, H - 0.1, L / 2, g, 0).rotation.x = Math.PI / 2;
    bake(g); KEEP_OUT.push([X0, Z0, 4]); KEEP_OUT.push([X1, Z1, 4]); colliders.push({ c: [X0, Z0, 2.4] }); colliders.push({ c: [X1, Z1, 2.4] });
    const chairs = []; const nC = Math.round(L / 6) * 2; for (let i = 0; i < nC; i++) { const c = new THREE.Group(); g.add(c); M(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 4), DARK, 0, -0.8, 0, c, 0); M(BOX(1.3, 0.1, 0.5), toon(i % 2 ? '#2f5f9e' : (ST.accent || '#c42d3c')), 0, -1.6, 0.1, c, 0.01); M(BOX(1.3, 0.6, 0.08), toon('#3a3a42'), 0, -1.35, -0.15, c, 0); chairs.push(c); }
    LIFTS.push({ chairs, L, H }); }
  function tickLifts(t) { for (const Lf of LIFTS) { const per = Lf.L * 2 + 2 * Math.PI * 1.5; Lf.chairs.forEach((c, i) => { let u = ((t * 1.6 + i * per / Lf.chairs.length) % per); if (u < Lf.L) c.position.set(1.5, Lf.H - 0.1, u); else if (u < Lf.L + Math.PI * 1.5) { const a = (u - Lf.L) / 1.5; c.position.set(Math.cos(a) * 1.5, Lf.H - 0.1, Lf.L + Math.sin(a) * 1.5); } else if (u < Lf.L * 2 + Math.PI * 1.5) c.position.set(-1.5, Lf.H - 0.1, Lf.L - (u - Lf.L - Math.PI * 1.5)); else { const a = (u - Lf.L * 2 - Math.PI * 1.5) / 1.5 + Math.PI; c.position.set(Math.cos(a) * 1.5, Lf.H - 0.1, -Math.sin(a - Math.PI) * 1.5); } c.rotation.z = Math.sin(t * 1.3 + i) * 0.04; }); } }
  function bonfire(X, Z) { const g = new THREE.Group(); g.position.set(X, 0, Z); scene.add(g); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; M(new THREE.DodecahedronGeometry(0.32, 0), toon('#6a6460'), Math.cos(a) * 1.3, 0.18, Math.sin(a) * 1.3, g, 0.02); } for (let i = 0; i < 6; i++) { const l = M(new THREE.CylinderGeometry(0.12, 0.14, 1.9, 6), WOOD, 0, 0.75, 0, g, 0.015); l.rotation.set(0.55, i / 6 * Math.PI * 2, 0, 'YXZ'); }
    const fl = M(new THREE.ConeGeometry(0.7, 1.9, 8), glowing('#ff9a3a', null, 2.6), 0, 1.3, 0, g, 0); const fl2 = M(new THREE.ConeGeometry(0.4, 1.3, 7), glowing('#ffe07a', null, 2.6), 0.1, 1.2, 0.1, g, 0); FIREFX.push(fl, fl2); glowSprite(X, 1.6, Z, 0xff9a40, 7);
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.4; const b = M(new THREE.CylinderGeometry(0.28, 0.28, 2.6, 8), toon('#8a6a46'), Math.cos(a) * 3.4, 0.28, Math.sin(a) * 3.4, g, 0.02, 0.28); b.rotation.set(0, -a, Math.PI / 2, 'YXZ'); } colliders.push({ c: [X, Z, 1.6] }); KEEP_OUT.push([X, Z, 5]); }
  const FIREFX = [];
  let SNOW = null;
  function snowfall() { const n = opts.quality === 'low' ? 700 : 1600, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(-30, 30); pos[i * 3 + 1] = rr(0, 22); pos[i * 3 + 2] = rr(-30, 30); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const m = new THREE.PointsMaterial({ color: 0xffffff, size: 0.16, transparent: true, opacity: 0.85, depthWrite: false }); SNOW = new THREE.Points(g, m); SNOW.frustumCulled = false; SNOW.visible = false; scene.add(SNOW); }
  function tickSnow(t, dt, on) { if (!SNOW) return; SNOW.visible = on; if (!on) return; const p = SNOW.geometry.attributes.position.array; for (let i = 0; i < p.length; i += 3) { p[i + 1] -= dt * (1.4 + (i % 7) * 0.12); p[i] += Math.sin(t * 0.8 + i) * dt * 0.3; if (p[i + 1] < 0) p[i + 1] += 22; } SNOW.geometry.attributes.position.needsUpdate = true; SNOW.position.set(Math.round(camPos.x / 60) * 60 * 0 + camPos.x, 0, camPos.z); }
  function snowFort(z, r, gx, gw) {   // packed-snow walls round the court, ice towers, a gate gap, the ice throne in the middle
    const [x0, z0] = toW(z, r[0], r[1]), [x1, z1] = toW(z, r[2], r[3]); const [gX] = toW(z, gx, r[3]); const half = gw * S / 2; const g = new THREE.Group(); scene.add(g); const sn = toon('#eef4fa'), sn2 = toon('#dde8f2'), ice = toon('#a8d8f0', { transparent: true, opacity: 0.85 });
    const wall = (ax, az, bx, bz) => { const L = Math.hypot(bx - ax, bz - az); if (L < 0.5) return; const cx = (ax + bx) / 2, cz = (az + bz) / 2, along = Math.abs(bx - ax) > Math.abs(bz - az); M(BOX(along ? L : 1.4, 2.6, along ? 1.4 : L), sn, cx, 1.3, cz, g, 0.04); const n = Math.floor(L / 1.1); for (let i = 0; i < n; i += 2) { const t = -L / 2 + (i + 0.5) * L / n; M(BOX(along ? 0.8 : 1.5, 0.7, along ? 1.5 : 0.8), sn2, along ? cx + t : cx, 2.95, along ? cz : cz + t, g, 0.02); } colliders.push({ box: [Math.min(ax, bx) - 0.7, Math.max(ax, bx) + 0.7, Math.min(az, bz) - 0.7, Math.max(az, bz) + 0.7], h: 3.2 }); };
    const o = 1.0; wall(x0 - o, z0 - o, x1 + o, z0 - o); wall(x0 - o, z0 - o, x0 - o, z1 + o); wall(x1 + o, z0 - o, x1 + o, z1 + o); wall(x0 - o, z1 + o, gX - half, z1 + o); wall(gX + half, z1 + o, x1 + o, z1 + o);
    for (const [cx, cz] of [[x0 - o, z0 - o], [x1 + o, z0 - o], [x0 - o, z1 + o], [x1 + o, z1 + o], [gX - half - 1, z1 + o], [gX + half + 1, z1 + o]]) { M(new THREE.CylinderGeometry(1.7, 1.9, 4.6, 14), sn, cx, 2.3, cz, g, 0.04, 1.9); M(new THREE.ConeGeometry(2.0, 2.4, 14), ice, cx, 5.8, cz, g, 0.03, 2.0); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; M(BOX(0.7, 0.6, 0.7), sn2, cx + Math.cos(a) * 1.5, 4.85, cz + Math.sin(a) * 1.5, g, 0); } colliders.push({ c: [cx, cz, 2] }); }
    const [tx, tz] = toW(z, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2); M(new THREE.CylinderGeometry(4.0, 4.4, 0.6, 24), sn2, tx, 0.3, tz, g, 0.03, 4.4); M(new THREE.CylinderGeometry(2.8, 3.1, 0.5, 20), ice, tx, 0.85, tz, g, 0.02, 3.1);
    M(BOX(1.8, 0.6, 1.4), ice, tx, 1.4, tz, g, 0.02); M(BOX(1.8, 2.6, 0.4), ice, tx, 2.4, tz - 0.6, g, 0.02); for (const sx of [-1, 1]) M(BOX(0.3, 1.0, 1.4), ice, tx + sx * 0.95, 1.9, tz, g, 0.02); for (let i = 0; i < 5; i++) M(new THREE.ConeGeometry(0.16, 0.9, 5), ice, tx - 0.8 + i * 0.4, 4.1 + (i % 2) * 0.3, tz - 0.6, g, 0);
    for (const sx of [-1, 1]) { M(new THREE.CylinderGeometry(0.06, 0.06, 4.5, 6), DARK, tx + sx * 3.2, 2.25, tz - 1.2, g, 0); const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.8), toon(ST.accent || '#c42d3c', { side: THREE.DoubleSide })); fl.position.set(tx + sx * 3.2 + 0.52, 3.6, tz - 1.2); g.add(fl); }
    bake(g); KEEP_OUT.push([tx, tz, 6]); for (let a = x0; a <= x1; a += 5) for (let b = z0; b <= z1; b += 5) KEEP_OUT.push([a, b, 3.5]); }
  function fillLake(z) { const W = z.w * S, H = z.h * S; const w = new THREE.Mesh(new THREE.PlaneGeometry(W + 2, H + 2), waterMat('#3f9ab8')); w.rotation.x = -Math.PI / 2; w.position.set(z.bx + W / 2, 0.07, z.bz + H / 2); scene.add(w); WATER.push(w); }

  // ---------------------------------------------------------------- EARTH KIT: the Starlite drive-in, Fremont's screen roof, the boneyard, the gas station, the hangars, raceway stands
  const SCREENS = [];
  function movieScreen(X, Z, W, H, ry) { const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; scene.add(g);
    for (const sx of [-1, 1]) for (const zz of [-0.6, 0.6]) M(BOX(0.4, H + 4, 0.4), toon('#5a5560'), sx * W * 0.42, (H + 4) / 2, zz - 1, g, 0.02);
    for (let y = 1; y < H + 4; y += 2.2) M(BOX(W * 0.9, 0.14, 0.14), toon('#5a5560'), 0, y, -1.6, g, 0);
    M(BOX(W + 1.2, H + 1.2, 0.5), toon('#2a2630'), 0, 4 + H / 2, -0.3, g, 0.04);
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex, fog: false })); scr.position.set(0, 4 + H / 2, 0); g.add(scr);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.5, 2.2), new THREE.MeshToonMaterial({ map: signTex('STARLITE', null, '#ff5ab8'), gradientMap: grad, emissive: new THREE.Color('#ffffff'), emissiveMap: signTex('STARLITE', null, '#ff5ab8'), emissiveIntensity: 0.9 })); sign.position.set(0, H + 6.2, -0.2); g.add(sign);
    SCREENS.push({ cv, tex, t: 0 }); bake(g); KEEP_OUT.push([X, Z, W / 2 + 2]); return g; }
  function drawMovie(sc, t) { const c = sc.cv.getContext('2d'), W = 256, H = 128; const sh = Math.floor(t / 4) % 4, u = (t % 4) / 4;
    const skies = [['#1a2a5a', '#ff8a5a'], ['#0a0a2a', '#3a2a7a'], ['#5fb8e8', '#e8f4ff'], ['#2a0a1a', '#ff3a6a']]; const [a, b] = skies[sh]; const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.fillStyle = '#ffe9a8'; c.beginPath(); c.arc(60 + u * 40, 40, 14, 0, 7); c.fill(); c.fillStyle = '#1b1830'; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 16) c.lineTo(x, 90 + Math.sin(x * 0.05 + sh) * 10); c.lineTo(W, H); c.fill();
    const fx = (sh % 2 ? W - u * W : u * W); c.fillStyle = '#e8732a'; c.beginPath(); c.ellipse(fx, 96, 10, 7, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(fx + (sh % 2 ? -9 : 9), 92); c.lineTo(fx + (sh % 2 ? -18 : 18), 80); c.lineTo(fx + (sh % 2 ? -6 : 6), 86); c.fill(); c.beginPath(); c.arc(fx + (sh % 2 ? -10 : 10), 88, 6, 0, 7); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(fx + (sh % 2 ? 10 : -10), 96); c.lineTo(fx + (sh % 2 ? 22 : -22), 92 + Math.sin(t * 9) * 3); c.lineTo(fx + (sh % 2 ? 12 : -12), 100); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 6; i++) c.fillRect(Math.random() * W, 0, 1, H); sc.tex.needsUpdate = true; }
  function oldCar(X, Z, ry) { const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; scene.add(g); const col = toon(pick(['#c42d3c', '#2f5f9e', '#5fb8a8', '#e8cf4a', '#f2e6c8', '#7a3f8a', '#3f8a46'])), chrome = toon('#cbd5e1'), k2 = toon('#1d1a20');
    M(BOX(1.9, 0.6, 4.4), col, 0, 0.62, 0, g, 0.03); M(BOX(1.6, 0.55, 2.0), col, 0, 1.18, -0.2, g, 0.025); M(BOX(1.5, 0.45, 0.05), toon('#5fa8c8'), 0, 1.18, 0.82, g, 0); M(BOX(1.95, 0.12, 0.2), chrome, 0, 0.45, 2.22, g, 0); M(BOX(1.95, 0.12, 0.2), chrome, 0, 0.45, -2.22, g, 0);
    for (const [x, zz] of [[-0.85, 1.4], [0.85, 1.4], [-0.85, -1.4], [0.85, -1.4]]) M(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 12), k2, x, 0.36, zz, g, 0).rotation.z = Math.PI / 2; for (const sx of [-0.6, 0.6]) { M(new THREE.SphereGeometry(0.13, 8, 6), glowing('#fff2c8', null, 1.4), sx, 0.7, 2.24, g, 0); M(BOX(0.25, 0.14, 0.05), glowing('#ff3a3a', null, 1.4), sx, 0.75, -2.24, g, 0); }
    for (const sx of [-1, 1]) { const f = M(BOX(0.05, 0.4, 0.9), col, sx * 0.9, 1.05, -2.0, g, 0); f.rotation.x = -0.4; } bake(g); colliders.push({ c: [X, Z, 1.6] }); }
  function speakerPost(X, Z) { M(new THREE.CylinderGeometry(0.05, 0.06, 1.3, 6), toon('#5a5560'), X, 0.65, Z, null, 0); M(BOX(0.3, 0.4, 0.18), toon('#3a3a42'), X, 1.35, Z, null, 0.01); M(BOX(0.12, 0.12, 0.02), glowing('#ffb04a', null, 1.2), X, 1.42, Z + 0.1, null, 0); }
  function gasStation(X, Z, ry) { const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; scene.add(g); const wh = toon('#f2f0ea'), rd = toon('#c42d3c');
    for (const [x, zz] of [[-4, -2.5], [4, -2.5], [-4, 2.5], [4, 2.5]]) M(BOX(0.4, 4.6, 0.4), wh, x, 2.3, zz, g, 0.02); M(BOX(11, 0.7, 7.5), wh, 0, 4.9, 0, g, 0.04); M(BOX(11.1, 0.3, 7.6), rd, 0, 4.55, 0, g, 0); for (let i = 0; i < 6; i++) M(BOX(1.2, 0.05, 0.6), glowing('#fff6d8', null, 2.0), -3.5 + (i % 3) * 3.5, 4.52, i < 3 ? -1.6 : 1.6, g, 0);
    for (const x of [-2.2, 2.2]) { M(BOX(1.6, 0.3, 1.0), toon('#8a8478'), x, 0.15, 0, g, 0.02); for (const sx of [-0.45, 0.45]) { M(BOX(0.6, 1.5, 0.45), rd, x + sx, 1.05, 0, g, 0.02); M(BOX(0.4, 0.3, 0.04), glowing('#9fffcf', null, 1.4), x + sx, 1.45, 0.24, g, 0); } }
    const pole = M(BOX(0.4, 9, 0.4), toon('#5a5560'), 7.5, 4.5, -3, g, 0.02); const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.4), new THREE.MeshToonMaterial({ map: signTex('GAS', null, '#ffd23a'), gradientMap: grad, emissive: new THREE.Color('#ffffff'), emissiveMap: signTex('GAS', null, '#ffd23a'), emissiveIntensity: 1.0, side: THREE.DoubleSide })); sg.position.set(7.5, 9.5, -3); g.add(sg);
    glowSprite(0, 4.2, 0, 0xfff6d8, 10, g); bake(g); colliders.push({ c: [X, Z, 1.2] }); KEEP_OUT.push([X, Z, 8]); }
  function hangar(X, Z, ry, W = 16, L = 22) { const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; scene.add(g); const sh = new THREE.Mesh(new THREE.CylinderGeometry(W / 2, W / 2, L, 24, 1, true, -Math.PI / 2, Math.PI), toon('#7a8290', { side: THREE.DoubleSide })); sh.rotation.set(-Math.PI / 2, 0, 0); g.add(sh);
    for (let i = 0; i <= 6; i++) { const r = M(new THREE.TorusGeometry(W / 2 + 0.05, 0.08, 4, 24, Math.PI), toon('#5a6270'), 0, 0, -L / 2 + i * L / 6, g, 0); } const back = new THREE.Mesh(new THREE.CircleGeometry(W / 2, 24, 0, Math.PI), toon('#6a7280', { side: THREE.DoubleSide })); back.position.z = -L / 2; g.add(back);
    const door = new THREE.Mesh(new THREE.CircleGeometry(W / 2, 24, 0, Math.PI), toon('#3a3a42', { side: THREE.DoubleSide })); door.position.z = L / 2; g.add(door); M(BOX(W * 0.5, W * 0.38, 0.1), toon('#1a1a20'), 0, W * 0.19, L / 2 + 0.05, g, 0); M(BOX(W * 0.6, 0.6, 0.1), glowing('#ffd23a', null, 1.4), 0, W * 0.42, L / 2 + 0.08, g, 0);
    bake(g); colliders.push({ box: [X - W / 2, X + W / 2, Z - L / 2, Z + L / 2], h: W / 2 + 1 }); KEEP_OUT.push([X, Z, Math.max(W, L) / 2 + 2]); }
  function tankerTruck(X, Z, ry) { const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; scene.add(g); M(BOX(2.4, 2.2, 2.6), toon('#c42d3c'), 0, 1.6, 4.2, g, 0.03); M(BOX(2.2, 0.8, 0.05), toon('#5fa8c8'), 0, 2.2, 5.52, g, 0); const tk = M(new THREE.CylinderGeometry(1.25, 1.25, 7.5, 18), toon('#cbd5e1'), 0, 1.95, -0.8, g, 0.03, 1.25); tk.rotation.x = Math.PI / 2; for (const zz of [-3.6, -2.4, 3.6]) for (const sx of [-1.1, 1.1]) M(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), toon('#1d1a20'), sx, 0.5, zz, g, 0).rotation.z = Math.PI / 2; bake(g); colliders.push({ c: [X, Z, 3.5] }); }
  function fremontCanopy(z) {   // the screen roof over the street: a long vault of LED panels that cycles colours
    const gr = z._gr || grid(z, 60); if (!gr) return; let best = null; for (let i = 0; i < gr.nx; i++) { let n = 0; for (let j = 0; j < gr.ny; j++) if (gr.g[j * gr.nx + i]) n++; if (!best || n > best.n) best = { i, n }; } if (!best) return;
    const xm = (best.i + 0.5) * 60; let y0 = 1e9, y1 = -1e9; for (let j = 0; j < gr.ny; j++) if (gr.g[j * gr.nx + best.i]) { y0 = Math.min(y0, j * 60); y1 = Math.max(y1, (j + 1) * 60); }
    const [X, Z0] = toW(z, xm, y0 + 200), [, Z1] = toW(z, xm, y1 - 200); const L = Math.abs(Z1 - Z0), W = 16; const g = new THREE.Group(); g.position.set(X, 0, (Z0 + Z1) / 2); scene.add(g);
    for (let k = 0; k <= Math.floor(L / 9); k++) { const zz = -L / 2 + k * L / Math.floor(L / 9); for (const sx of [-1, 1]) M(BOX(0.5, 9, 0.5), toon('#5a5560'), sx * W / 2, 4.5, zz, g, 0.02); const arch = M(new THREE.TorusGeometry(W / 2, 0.22, 5, 20, Math.PI), toon('#5a5560'), 0, 9, zz, g, 0); }
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const vault = new THREE.Mesh(new THREE.CylinderGeometry(W / 2, W / 2, L, 24, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, fog: false, transparent: true, opacity: 0.92 })); vault.rotation.set(-Math.PI / 2, 0, 0); vault.position.y = 9; g.add(vault);
    SCREENS.push({ cv, tex, t: 0, fremont: true }); bake(g); }
  function drawFremont(sc, t) { const c = sc.cv.getContext('2d'); for (let y = 0; y < 256; y += 8) for (let x = 0; x < 64; x += 8) { const h = (y * 1.4 + t * 120 + Math.sin(x * 0.2 + t) * 40) % 360; c.fillStyle = 'hsl(' + h + ',90%,' + (45 + 15 * Math.sin(x * 0.3 + y * 0.05 + t * 3)) + '%)'; c.fillRect(x, y, 7, 7); } sc.tex.needsUpdate = true; }
  function neonLetters(X, Z, txt, col, ry) { const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; scene.add(g); const sgT = signTex(txt, null, col); const pl = new THREE.Mesh(new THREE.PlaneGeometry(txt.length * 1.1 + 1, 2.0), new THREE.MeshToonMaterial({ map: sgT, gradientMap: grad, emissive: new THREE.Color('#ffffff'), emissiveMap: sgT, emissiveIntensity: 0.8, side: THREE.DoubleSide })); pl.position.y = 1.4; pl.rotation.x = -0.25; g.add(pl); M(BOX(txt.length * 1.1 + 1.2, 0.3, 0.4), toon('#3a3a42'), 0, 0.15, 0.2, g, 0.02); bake(g); }

  function setPieces(z) {
    const sp = z.spots || {}, P = n => sp[n] && (sp[n].p || (sp[n].pts && sp[n].pts[0])), R = n => sp[n] && sp[n].r, items = n => (sp[n] && sp[n].items) || [];
    const grp = (X, Z, ry = 0) => { const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; scene.add(g); return g; };
    const W2 = (p) => toW(z, p[0], p[1]);
    const k = z.key, [zcx, zcz] = center(z);
    // ---- water
    if (k === 'kufaOasis' && P('lakeCentre')) { const [X, Z] = W2(P('lakeCentre')); let r = 1e9; for (const q of sp.shoreWalk ? sp.shoreWalk.pts : []) { const [a, b] = W2(q); r = Math.min(r, Math.hypot(a - X, b - Z)); } waterDisk(X, Z, Math.max(8, r * 0.85), '#3fb7c8'); if (R('dock')) bridgeRect(z, R('dock')); if (P('skiff')) { const [a, b] = W2(P('skiff')); boatAt(a, b, 0.4, 0.8); } for (const q of (sp.reedClumps && sp.reedClumps.pts) || []) { const [a, b] = W2(q); for (let i = 0; i < 6; i++) M(new THREE.ConeGeometry(0.06, 1.4, 4), toon('#6a8a3a'), a + rr(-0.6, 0.6), 0.7, b + rr(-0.6, 0.6), null, 0); } for (const q of (sp.palmGroves && sp.palmGroves.pts) || []) { const [a, b] = W2(q); for (let i = 0; i < 3; i++) treeSpots.push({ x: a + rr(-2, 2), z: b + rr(-2, 2), s: rr(1, 1.3), r: rr(0, 6), kind: 'palm' }); } }
    if (k === 'urToxicLake') { waterRect(z, [0, 2270, z.w, z.h], '#4f9a2a', 0.09, true).material.emissiveIntensity = 0.35; for (const it of items('outfalls')) { const [a, b] = W2([it.x, it.y]); const g = grp(a, b); M(new THREE.CylinderGeometry(0.7, 0.7, 3, 14), toon('#6a6a72'), 0, 0.7, -1, g, 0.03, 0.7).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.55, 0.55, 0.2, 14), toon('#2a2a30'), 0, 0.7, 0.55, g, 0).rotation.x = Math.PI / 2; const sl = M(BOX(0.8, 0.05, 2.4), glowing('#9fff5a', null, 1.5), 0, 0.12, 1.6, g, 0); glowSprite(0, 0.6, 1.2, 0x9fff5a, 2.4, g); }
      for (const it of items('deadTrunks')) { const [a, b] = W2([it.x, it.y]); const g = grp(a, b, rr(0, 6)); M(new THREE.CylinderGeometry(0.18, 0.32, 3.4, 6), toon('#3a3430'), 0, 1.5, 0, g, 0.03); M(new THREE.CylinderGeometry(0.06, 0.1, 1.4, 5), toon('#3a3430'), 0.4, 2.6, 0, g, 0).rotation.z = -0.8; M(new THREE.CylinderGeometry(0.05, 0.08, 1.1, 5), toon('#3a3430'), -0.3, 2.2, 0.2, g, 0).rotation.z = 0.9; }
      for (let i = 0; i < 18; i++) { const [a, b] = W2([rr(100, z.w - 100), rr(2350, z.h - 60)]); glowSprite(a, 0.3, b, 0x9fff5a, rr(0.6, 1.4)); } }
    if (k === 'urCleanLake') { waterRect(z, [0, 1990, z.w, z.h], '#3fb7e8'); bridgeRect(z, [905, 1950, 1035, 2275], 'z'); for (let i = 0; i < 3; i++) boatAt(...toW(z, 1500 + i * 420, 2300 + (i % 2) * 160), 0.3 + i, 0.7); }
    const reaches = items('river').filter(it => it.rect);
    if (reaches.length >= 2) {   // a chain of straight reaches: one smooth river through their corners
      const hz = r => (r[2] - r[0]) >= (r[3] - r[1]), cx = r => (r[0] + r[2]) / 2, cy = r => (r[1] + r[3]) / 2; const pts2 = []; const R0 = reaches[0].rect, R1 = reaches[1].rect;
      const c01 = hz(R0) ? [cx(R1), cy(R0)] : [cx(R0), cy(R1)]; pts2.push(hz(R0) ? [Math.abs(R0[0] - c01[0]) > Math.abs(R0[2] - c01[0]) ? R0[0] - 60 : R0[2] + 60, cy(R0)] : [cx(R0), Math.abs(R0[1] - c01[1]) > Math.abs(R0[3] - c01[1]) ? R0[1] - 60 : R0[3] + 60]);
      let prev = pts2[0];
      for (let i = 0; i < reaches.length - 1; i++) { const A = reaches[i].rect, B = reaches[i + 1].rect, c = hz(A) ? [cx(B), cy(A)] : [cx(A), cy(B)]; const din = [Math.sign(c[0] - prev[0]), Math.sign(c[1] - prev[1])]; pts2.push([c[0] - din[0] * 150, c[1] - din[1] * 150]); const nx = i + 2 < reaches.length ? reaches[i + 2].rect : null; const nb = nx ? (hz(B) ? [cx(nx), cy(B)] : [cx(B), cy(nx)]) : (hz(B) ? [Math.abs(B[0] - c[0]) > Math.abs(B[2] - c[0]) ? B[0] : B[2], cy(B)] : [cx(B), Math.abs(B[1] - c[1]) > Math.abs(B[3] - c[1]) ? B[1] : B[3]]); const dout = [Math.sign(nb[0] - c[0]), Math.sign(nb[1] - c[1])]; pts2.push([c[0] + dout[0] * 150, c[1] + dout[1] * 150]); prev = c; }
      const L = reaches[reaches.length - 1].rect, last = pts2[pts2.length - 1]; pts2.push(hz(L) ? [Math.abs(L[0] - last[0]) > Math.abs(L[2] - last[0]) ? L[0] - 60 : L[2] + 60, cy(L)] : [cx(L), Math.abs(L[1] - last[1]) > Math.abs(L[3] - last[1]) ? L[1] - 60 : L[3] + 60]);
      const wd = Math.min(...reaches.map(it => Math.min(it.rect[2] - it.rect[0], it.rect[3] - it.rect[1]))) * S;
      riverThrough(z, pts2, wd + 0.6, W8 === 'zion' ? '#4a9ab8' : '#3fa9c8', false); z.ribbonRiver = true;
    } else for (const it of reaches) waterRect(z, it.rect, W8 === 'zion' ? '#4a9ab8' : '#3fa9c8', 0.09);
    if (R('river') && !items('river').length) waterRect(z, R('river'), '#3fa9c8', 0.09);
    if (!z.ribbonRiver) for (const it of items('shallows')) if (it.rect) waterRect(z, it.rect, '#8acbd8', 0.1);
    for (const it of items('bridges')) if (it.rect) bridgeRect(z, it.rect);
    if (k === 'luxorRedPlains' && items('bridges').length) { const bs = items('bridges').slice().sort((a, b) => a.y - b.y); const f = bs[0], l = bs[bs.length - 1]; const pts2 = [[f.x - (bs[1] ? bs[1].x - f.x : 0) * 0.9, -60], ...bs.map(b => [b.x, b.y]), [l.x + (bs.length > 1 ? l.x - bs[bs.length - 2].x : 0) * 0.9, z.h + 60]]; const bl = Math.min(...bs.map(b => (b.rect[2] - b.rect[0]) * S)); riverThrough(z, pts2, Math.max(6, bl - 2.4), '#c8482e', true); }
    for (const it of items('cages')) if (it.rect) zooCage(z, it);
    if (/Garden/.test(k)) { items('beds').forEach((it, i) => it.rect && gardenBed(z, it.rect, i)); const bs = items('beds'); if (bs.length > 1) { const [a, b] = W2([(bs[0].x + bs[2 % bs.length].x) / 2, (bs[0].y + bs[1].y) / 2]); scarecrow(a, b, 0.3); } }
    if (k === 'neboBanditFort' && R('fort')) { const c = P('clearing') || [(R('fort')[0] + R('fort')[2]) / 2, R('fort')[3]]; palisade(z, R('fort'), c[0]); const [a, b] = W2(c); z.stumps = [a, b, 30]; }
    if (z.terr === 'tree') climbDress(z);
    if (z.gloom) deepWoodsDress(z);
    if (k === 'urHuntersPond' && sp.pond) { const [a, b] = W2(sp.pond.p); const rx = (sp.pond.rx || 400) * S, ry2 = (sp.pond.ry || 300) * S; const w = waterDisk(a, b, rx * 0.95, '#3f9ab8'); WATER[WATER.length - 1].scale.set(1, ry2 / rx, 1); scene.children[scene.children.length - 1].scale.set(1, ry2 / rx, 1); for (let t = 0; t < 6.28; t += 0.35) KEEP_OUT.push([a + Math.cos(t) * rx * 0.6, b + Math.sin(t) * ry2 * 0.6, Math.min(rx, ry2) * 0.6]);
      if (R('dock')) bridgeRect(z, R('dock'), 'z'); if (R('hut')) { const r = R('hut'), [h0, k0] = toW(z, r[0], r[1]), [h1, k1] = toW(z, r[2], r[3]); cabin((h0 + h1) / 2, (k0 + k1) / 2, Math.abs(h1 - h0) - 1, Math.abs(k1 - k0) - 1, 0); }
      if (P('rowboat')) { const [c, d] = W2(P('rowboat')); boatAt(c, d, 0.8, 0.7); } for (const q of (sp.dryingRacks && sp.dryingRacks.pts) || []) { const [c, d] = W2(q); dryingRack(c, d, Math.PI / 2); } }
    if (/BeastRun/.test(k) && sp.arena && sp.arena.r) beastPen(z, sp.arena);
    if (k === 'earthStarlite' && R('screenRect')) { const r = R('screenRect'), [a0, b0] = toW(z, r[0], r[1]), [a1, b1] = toW(z, r[2], r[3]); const W = Math.abs(a1 - a0) * 0.9; movieScreen((a0 + a1) / 2, Math.min(b0, b1) + 1, W, W * 0.42, 0);
      let n = 0; for (let y = r[3] + 300; y < z.h - 200 && n < 60; y += 230) for (let x = r[0] - 100; x < r[2] + 100 && n < 60; x += 260) { if (!walkLocal(z, x, y)) continue; const [a, b] = W2([x, y]); if (Math.random() < 0.55) { oldCar(a, b, Math.PI + rr(-0.06, 0.06)); n++; } speakerPost(a + 1.6, b + 0.4); } }
    if (k === 'earthFremont') { fremontCanopy(z); if (P('boneyard')) { const [a, b] = W2(P('boneyard')); ['MOTEL', 'BINGO', 'GIFTS', 'OPEN', 'LIQUOR', 'DINER'].forEach((w, i) => neonLetters(a + (i % 3) * 7 - 7, b + Math.floor(i / 3) * 5 - 2, w, ['#ff5ab8', '#5fe1ff', '#ffd23a', '#9fff5a', '#ff8a3a', '#b98aff'][i], rr(-0.5, 0.5))); KEEP_OUT.push([a, b, 12]); } if (P('cowboy')) { const [a, b] = W2(P('cowboy')); const g = grp(a, b, 0); M(BOX(0.6, 12, 0.6), toon('#5a5560'), 0, 6, -0.5, g, 0.02); const cb = new THREE.Mesh(new THREE.PlaneGeometry(6, 9), new THREE.MeshBasicMaterial({ map: canvasTex(128, 192, c => { c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, 128, 192); c.lineWidth = 6; c.strokeStyle = '#ffd23a'; c.beginPath(); c.moveTo(24, 46); c.lineTo(104, 46); c.moveTo(40, 46); c.lineTo(46, 18); c.lineTo(82, 18); c.lineTo(88, 46); c.stroke(); c.strokeStyle = '#ff8a3a'; c.beginPath(); c.arc(64, 70, 20, 0, 7); c.stroke(); c.strokeStyle = '#5fe1ff'; c.beginPath(); c.moveTo(40, 96); c.lineTo(88, 96); c.lineTo(84, 150); c.lineTo(44, 150); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(88, 100); c.lineTo(116, 70); c.moveTo(40, 100); c.lineTo(20, 130); c.moveTo(52, 150); c.lineTo(50, 186); c.moveTo(76, 150); c.lineTo(78, 186); c.stroke(); }), transparent: true, fog: false, side: THREE.DoubleSide })); cb.position.set(0, 12.5, 0); g.add(cb); bake(g); } }
    if (k === 'earthMojave' && P('gas')) { const [a, b] = W2(P('gas')); gasStation(a, b, 0); }
    if (k === 'earthCompound') { for (const n of ['hangarW', 'hangarE']) if (P(n)) { const [a, b] = W2(P(n)); hangar(a, b - 4, 0); } if (P('tanker')) { const [a, b] = W2(P('tanker')); tankerTruck(a, b, 0.3); } }
    if (k === 'earthRaceway') { if (P('paddock')) { const [a, b] = W2(P('paddock')); const g = grp(a - 14, b, Math.PI / 2); bleachers(g, 40, 7); } if (P('grid')) { const [a, b] = W2(P('grid')); const g = grp(a, b); for (let i = 0; i < 12; i++) M(BOX(0.8, 0.02, 0.8), toon(i % 2 ? '#1b1830' : '#f2f0ea'), -4.4 + (i % 12) * 0.8, 0.15, 0, g, 0); for (const sx of [-1, 1]) M(BOX(0.4, 7, 0.4), toon('#5a5560'), sx * 7, 3.5, 0, g, 0.02); const ban = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.6), new THREE.MeshToonMaterial({ map: signTex('EIGHT MILE SPEEDWAY', null, '#ffd23a'), gradientMap: grad, emissive: new THREE.Color('#ffffff'), emissiveMap: signTex('EIGHT MILE SPEEDWAY', null, '#ffd23a'), emissiveIntensity: 0.9, side: THREE.DoubleSide })); ban.position.set(0, 6.6, 0); g.add(ban); bake(g); } }
    if (z.snow) { if (!SNOW) snowfall();
      if (P('liftStation')) { const [a, b] = W2(P('liftStation')); const top = Math.max(b - 18, z.bz + 8); chairlift(a, b + 20, a, top); }
      if (P('bonfire')) { const [a, b] = W2(P('bonfire')); bonfire(a, b); }
      if (P('pond') && W8 === 'player') { const [a, b] = W2(P('pond')); const ice = new THREE.Mesh(new THREE.CircleGeometry(7, 40), toon('#cfe8f6')); ice.rotation.x = -Math.PI / 2; ice.position.set(a, 0.08, b); scene.add(ice); KEEP_OUT.push([a, b, 8]); for (let i = 0; i < 3; i++) { const sk = M(new THREE.TorusGeometry(1.2 + i * 1.6, 0.03, 4, 30), toon('#ffffff'), a + i * 0.6, 0.1, b - i * 0.4, null, 0); sk.rotation.x = Math.PI / 2; } }
      if (R('nursery')) { const r = R('nursery'); for (let i = 0; i < 8; i++) { const [a, b] = W2([r[0] + (r[2] - r[0]) * (0.2 + (i % 2) * 0.55), r[1] + (r[3] - r[1]) * (0.1 + i * 0.11)]); M(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 5), toon(i % 2 ? '#c42d3c' : '#2f5f9e'), a, 0.8, b, null, 0); const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45), toon(i % 2 ? '#c42d3c' : '#2f5f9e', { side: THREE.DoubleSide })); fl.position.set(a + 0.3, 1.35, b); scene.add(fl); } }
      if (/Slopes/i.test(z.label)) { let n = 0; for (let tries = 0; tries < 400 && n < 12; tries++) { const x = rr(200, z.w - 200), y = rr(200, z.h - 200); if (walkLocal(z, x, y) || !(walkLocal(z, x + 160, y) || walkLocal(z, x - 160, y) || walkLocal(z, x, y + 160) || walkLocal(z, x, y - 160))) continue; const [a, b] = W2([x, y]); snowman(a, b, rr(0, 6), rr(0.85, 1.25)); KEEP_OUT.push([a, b, 1.5]); n++; }
        for (const it of items('runs')) if (it.rect) { const r = it.rect; for (let i = 0; i < 10; i++) { const [a, b] = W2([(r[0] + r[2]) / 2 + (i % 2 ? 1 : -1) * (r[2] - r[0]) * 0.18, r[1] + (r[3] - r[1]) * (i + 0.5) / 10]); M(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 5), toon(i % 2 ? '#c42d3c' : '#2f5f9e'), a, 0.75, b, null, 0); } } }
      if (R('court') && /Snow Fort/i.test(z.label)) { const gt = P('gate') || [(R('court')[0] + R('court')[2]) / 2, R('court')[3]]; snowFort(z, R('court'), gt[0], 520); }
      if (P('rental')) { const [a, b] = W2(P('rental')); const g = grp(a, b, 0); for (let i = 0; i < 6; i++) { const sk = M(BOX(0.12, 1.8, 0.04), toon(pick(['#c42d3c', '#2f5f9e', '#e8cf4a', '#3f8a46'])), -1.2 + i * 0.45, 0.9, -0.3, g, 0.01); sk.rotation.x = 0.18; } M(BOX(3.2, 0.12, 0.2), WOOD, 0, 1.5, -0.5, g, 0.01); bake(g); } }
    if (z.lakeZone) { fillLake(z); if (R('bridge')) bridgeRect(z, R('bridge'), 'z'); { const W = z.w * S, H = z.h * S; for (let a = z.bx + 3; a < z.bx + W; a += 6) for (let b = z.bz + 3; b < z.bz + H; b += 6) { const mx = (a - z.bx) / S, my = (b - z.bz) / S; if (!walkLocal(z, mx, my)) KEEP_OUT.push([a, b, 3.2]); } } if (P('pontoon')) { const [a, b] = W2(P('pontoon')); boatAt(a + 4, b + 3, 0.5, 0.8); } }
    if (W8 === 'player' && R('courtRect') && /Stadium/.test(k)) { const r = R('courtRect'), [x0, z0] = toW(z, r[0], r[1]), [x1, z1] = toW(z, r[2], r[3]); const g = grp(0, 0); const bw = toon('#f4f7fa'), bt = toon('#2f5f9e'); for (const [cx, cz, w, d] of [[(x0 + x1) / 2, z0 - 0.3, x1 - x0 + 0.6, 0.2], [(x0 + x1) / 2, z1 + 0.3, x1 - x0 + 0.6, 0.2], [x0 - 0.3, (z0 + z1) / 2, 0.2, z1 - z0], [x1 + 0.3, (z0 + z1) / 2, 0.2, z1 - z0]]) { M(BOX(w, 1.1, d), bw, cx, 0.55, cz, g, 0.02); M(BOX(w + 0.05, 0.14, d + 0.12), bt, cx, 1.15, cz, g, 0); }
      for (const [zz, sgn] of [[z0 + (z1 - z0) * 0.1, 1], [z1 - (z1 - z0) * 0.1, -1]]) { const gg = new THREE.Group(); gg.position.set((x0 + x1) / 2, 0, zz); gg.rotation.y = sgn > 0 ? 0 : Math.PI; g.add(gg); for (const sx of [-1, 1]) M(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), toon('#c42d3c'), sx * 0.9, 0.6, 0, gg, 0); M(new THREE.CylinderGeometry(0.06, 0.06, 1.9, 6), toon('#c42d3c'), 0, 1.2, 0, gg, 0).rotation.z = Math.PI / 2; const net = M(BOX(1.8, 1.1, 0.8), toon('#ffffff', { transparent: true, opacity: 0.45 }), 0, 0.6, -0.45, gg, 0); }
      bake(g); }
    if (z.canopy) for (const it of items('gliders')) if (it.rect) gliderRack(z, it.rect);
    if (k === 'luxorFightingPit' && P('pit')) { const [a, b] = W2(P('pit')); const road = sp.spawn ? W2(sp.spawn.p) : [a - 40, b]; pitStands(a, b, 23.2, Math.atan2(-(road[1] - b), road[0] - a), 0.34); }

    if (R('bridge') && /Mountain/.test(k)) bridgeRect(z, R('bridge'), 'z');
    for (const it of items('docks')) if (it.rect) bridgeRect(z, it.rect);
    if (k === 'jReachLanding' || k === 'jReachHideout') { const p = P('boatMooring') || P('spawn'); if (p) { const [a, b] = W2(p); boatAt(a + 9, b + 6, 1.2, 1.6, true); } }
    // ---- Zion: oil derrick, camp, monster arena
    if (R('oilField')) { const r = R('oilField'); const [a, b] = W2([(r[0] + r[2]) / 2, (r[1] + r[3]) / 2]); const g = grp(a, b); const st = toon('#5a5560');
      for (const [x, zz] of [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]]) { const leg = M(BOX(0.3, 18.5, 0.3), st, x * 0.55, 9, zz * 0.55, g, 0.015); leg.rotation.set(-zz * 0.06, 0, x * 0.06); }
      for (let i = 0; i < 7; i++) { const s2 = 2.6 - i * 0.3, y = 1 + i * 2.6; for (const a2 of [0, Math.PI / 2]) { const br = M(BOX(s2 * 2, 0.15, 0.15), st, 0, y, 0, g, 0); br.rotation.y = a2; br.position.set(Math.sin(a2) * 0 , y, 0); } M(BOX(s2 * 2, 0.15, 0.15), st, 0, y, s2, g, 0); M(BOX(s2 * 2, 0.15, 0.15), st, 0, y, -s2, g, 0); M(BOX(0.15, 0.15, s2 * 2), st, s2, y, 0, g, 0); M(BOX(0.15, 0.15, s2 * 2), st, -s2, y, 0, g, 0); }
      M(BOX(1.4, 0.6, 1.4), toon('#c42d3c'), 0, 18.6, 0, g, 0.02); const pj = grp(a + 8, b + 3, 0.6); M(BOX(1.2, 2.4, 0.6), toon('#3a3a42'), 0, 1.2, 0, pj, 0.02); const beam = M(BOX(5, 0.5, 0.4), toon('#e8cf4a'), 0, 2.7, 0, pj, 0.02); M(new THREE.CylinderGeometry(0.9, 0.9, 0.5, 4, 1, false), toon('#3a3a42'), 2.6, 2.2, 0, pj, 0.02).rotation.x = Math.PI / 2;
      waterDisk(a - 6, b + 6, 3, '#1a1418'); bake(g); KEEP_OUT.push([a, b, 10]); }
    if (R('camp')) { const r = R('camp'); for (let i = 0; i < 3; i++) { const [a, b] = W2([r[0] + (i + 0.5) * (r[2] - r[0]) / 3, (r[1] + r[3]) / 2]); const g = grp(a, b, rr(-0.3, 0.3)); M(prism(3.2, 2.4, 3.6), toon(['#e9e1d2', '#d8c8a8', '#c9b48a'][i]), 0, 0, 0, g, 0.04).rotation.y = Math.PI / 2; } const [a, b] = W2([(r[0] + r[2]) / 2, r[3] - 60]); const g = grp(a, b); for (let i = 0; i < 6; i++) M(new THREE.DodecahedronGeometry(0.3, 0), toon('#6a6460'), Math.cos(i) * 0.8, 0.15, Math.sin(i) * 0.8, g, 0); const fl = M(new THREE.ConeGeometry(0.4, 1.0, 8), glowing('#ff9a3a', null, 2.4), 0, 0.5, 0, g, 0); fl.userData.keep = true; const fi = M(new THREE.ConeGeometry(0.2, 0.6, 8), glowing('#ffe28a', null, 2.4), 0, 0.4, 0, g, 0); FIRES.push({ fl, fi, ph: 3 }); glowSprite(0, 0.8, 0, 0xff9a40, 4, g); }
    if (k === 'zionMonsterArena' && R('dirt')) { const r = R('dirt'); flatRect(z, r, tiled(dirtTex('#8a5a32'), 12, 12), 0.05);
      for (const it of items('ramps')) if (it.rect) { const [x0, z0] = toW(z, it.rect[0], it.rect[1]), [x1, z1] = toW(z, it.rect[2], it.rect[3]); const g = grp((x0 + x1) / 2, (z0 + z1) / 2); const rmp = M(prism(Math.min(x1 - x0, z1 - z0), 2.4, Math.max(x1 - x0, z1 - z0)), toon('#6a4a2a'), 0, 0, 0, g, 0.04); rmp.rotation.y = (x1 - x0) > (z1 - z0) ? Math.PI / 2 : 0; colliders.push({ c: [g.position.x, g.position.z, 2] }); }
      for (const it of items('crushedCars')) { const [a, b] = W2([it.x, it.y]); const g = grp(a, b, rr(-0.2, 0.2)); M(BOX(3.6, 0.7, 1.8), toon(pick(['#c42d3c', '#2f5f9e', '#3f8a46', '#e8cf4a'])), 0, 0.35, 0, g, 0.03).rotation.z = rr(-0.08, 0.08); M(BOX(1.8, 0.35, 1.6), toon('#5fa8c8'), 0.2, 0.85, 0, g, 0.02); }
      for (const it of items('trucks')) { const [a, b] = W2([it.x, it.y]); monsterTruck(grp(a, b, Math.PI / 2)); }
      for (const it of items('floodlights')) { const [a, b] = W2([it.x, it.y]); const g = grp(a, b); M(BOX(0.4, 14, 0.4), toon('#5a5560'), 0, 7, 0, g, 0.02); M(BOX(3, 1.6, 0.4), toon('#3a3a42'), 0, 14.4, 0, g, 0.02); for (let i = 0; i < 6; i++) M(BOX(0.4, 0.4, 0.1), glowing('#fff6d8', null, 2.2), -1.1 + (i % 3) * 1.1, 14.0 + (i > 2 ? 0.6 : 0), 0.24, g, 0); glowSprite(0, 14.3, 0.6, 0xfff6d8, 6, g); }
      const [cx1, cz1, w1, d1] = [zcx, zcz, z.w * S, z.h * S]; for (const [x, zz, ry, w] of [[cx1, cz1 - d1 / 2 + 2, 0, w1 * 0.8], [cx1, cz1 + d1 / 2 - 2, Math.PI, w1 * 0.8], [cx1 - w1 / 2 + 2, cz1, Math.PI / 2, d1 * 0.6]]) { const g = grp(x, zz, ry); const [spx, spz] = W2(z.spawn); const near = Math.hypot(spx - x, spz - zz) < w / 2 + 4 && Math.abs(Math.cos(ry) * (spz - zz) - Math.sin(ry) * (spx - x)) < 9; bleachers(g, w, 5, near ? 16 : 0); g.position.y = 0; }
      { const [x0, z0] = toW(z, r[0], r[1]), [x1, z1] = toW(z, r[2], r[3]); for (let a = Math.min(x0, x1); a <= Math.max(x0, x1); a += 4) for (let b = Math.min(z0, z1); b <= Math.max(z0, z1); b += 4) KEEP_OUT.push([a, b, 3]); } }
    // ---- stadiums
    if (R('courtRect') && k !== 'kyotoSumo') { const r = R('courtRect'), rink = W8 === 'player' && /Stadium/.test(k);
      const tex = canvasTex(256, 512, c => { c.fillStyle = rink ? '#e8f4fb' : '#3b6fb0'; c.fillRect(0, 0, 256, 512); if (rink) { c.strokeStyle = '#c42d3c'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 256); c.lineTo(256, 256); c.stroke(); c.strokeStyle = '#2f5f9e'; for (const y of [170, 342]) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); } c.beginPath(); c.arc(128, 256, 40, 0, 7); c.stroke(); } else { c.fillStyle = '#4a8a46'; c.fillRect(0, 0, 256, 18); c.fillRect(0, 494, 256, 18); courtLines(c, 256, 512, [[0.06, 0.04, 0.94, 0.04], [0.06, 0.96, 0.94, 0.96], [0.06, 0.04, 0.06, 0.96], [0.94, 0.04, 0.94, 0.96], [0.18, 0.04, 0.18, 0.96], [0.82, 0.04, 0.82, 0.96], [0.18, 0.27, 0.82, 0.27], [0.18, 0.73, 0.82, 0.73], [0.5, 0.27, 0.5, 0.73]]); } });
      const [cx1, cz1, w1, d1] = flatRect(z, r, tex, 0.06);
      if (!rink && R('netRect')) { const nr = R('netRect'); const [a, b] = W2([(nr[0] + nr[2]) / 2, (nr[1] + nr[3]) / 2]); const g = grp(a, b); const nw = (nr[2] - nr[0]) * S; M(BOX(nw, 0.9, 0.05), toon('#f2f0ea', { transparent: true, opacity: 0.75 }), 0, 0.5, 0, g, 0); M(BOX(nw, 0.08, 0.08), toon('#ffffff'), 0, 0.95, 0, g, 0); for (const s2 of [-1, 1]) M(new THREE.CylinderGeometry(0.05, 0.05, 1.05, 6), DARK, s2 * nw / 2, 0.52, 0, g, 0); }
      if (rink) { const g = grp(cx1, cz1); for (const [x, zz, w, d] of [[0, -d1 / 2, w1, 0.2], [0, d1 / 2, w1, 0.2], [-w1 / 2, 0, 0.2, d1], [w1 / 2, 0, 0.2, d1]]) M(BOX(w, 1.0, d), toon('#ffffff'), x, 0.5, zz, g, 0.02); bake(g); }
      if (P('umpire')) { const [a, b] = W2(P('umpire')); const g = grp(a, b, Math.PI / 2); M(BOX(0.8, 0.1, 0.8), toon('#2f6e4a'), 0, 2, 0, g, 0.02); for (const [x, zz] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) M(BOX(0.08, 2, 0.08), toon('#2f6e4a'), x, 1, zz, g, 0); M(BOX(0.8, 0.8, 0.1), toon('#2f6e4a'), 0, 2.4, -0.35, g, 0); }
      const A1 = R('apronRect') || r; const [ax0, az0] = toW(z, A1[0], A1[1]), [ax1, az1] = toW(z, A1[2], A1[3]);
      for (const [x, zz, ry, w] of [[ax0 - 1.5, (az0 + az1) / 2, -Math.PI / 2, az1 - az0], [ax1 + 1.5, (az0 + az1) / 2, Math.PI / 2, az1 - az0]]) { const g = grp(x, 0, 0); g.position.z = zz; g.rotation.y = ry; bleachers(g, w * 0.92, 6); }
      if (P('royalBox')) { const [a, b] = W2(P('royalBox')); const g = grp(a, b); M(BOX(8, 3, 3), toon(ST.roof || '#5b4386'), 0, 1.5, -1, g, 0.04); M(BOX(8.4, 0.3, 3.4), GOLD, 0, 3.1, -1, g, 0.02); const b2 = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.2), bannerM); b2.position.set(0, 2.0, 0.52); g.add(b2); } }
    if (k === 'kufaStadium' && R('pitch')) { const r = R('pitch'); const tex = canvasTex(512, 384, c => { for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#3f8a46' : '#4a9a50'; c.fillRect(i * 512 / 12, 0, 512 / 12 + 1, 384); } courtLines(c, 512, 384, [[0.02, 0.03, 0.98, 0.03], [0.02, 0.97, 0.98, 0.97], [0.02, 0.03, 0.02, 0.97], [0.98, 0.03, 0.98, 0.97], [0.5, 0.03, 0.5, 0.97], [0.02, 0.3, 0.14, 0.3], [0.14, 0.3, 0.14, 0.7], [0.02, 0.7, 0.14, 0.7], [0.98, 0.3, 0.86, 0.3], [0.86, 0.3, 0.86, 0.7], [0.98, 0.7, 0.86, 0.7]]); c.beginPath(); c.arc(256, 192, 44, 0, 7); c.stroke(); });
      const [cx1, cz1, w1, d1] = flatRect(z, r, tex, 0.06);
      for (const sx of [-1, 1]) { const g = grp(cx1 + sx * (w1 / 2 - 0.2), cz1, sx > 0 ? -Math.PI / 2 : Math.PI / 2); M(BOX(0.15, 2.4, 0.15), toon('#ffffff'), -3.6, 1.2, 0, g, 0); M(BOX(0.15, 2.4, 0.15), toon('#ffffff'), 3.6, 1.2, 0, g, 0); M(BOX(7.4, 0.15, 0.15), toon('#ffffff'), 0, 2.4, 0, g, 0); M(BOX(7.2, 2.3, 0.04), toon('#f2f0ea', { transparent: true, opacity: 0.4 }), 0, 1.2, -1.0, g, 0); }
      for (const [x, zz, ry, w] of [[cx1, cz1 - d1 / 2 - 2, 0, w1 * 0.9], [cx1, cz1 + d1 / 2 + 2, Math.PI, w1 * 0.9]]) { const g = grp(x, zz, ry); bleachers(g, w, 6); } }
    // ---- Luxor: volcano + bike track, the boxing ring
    if (P('volcano')) { const [a, b] = W2(P('volcano')); const g = grp(a, b); const rock = toon('#4a2a26');
      M(new THREE.CylinderGeometry(4, 14, 18, 18, 1, true), rock, 0, 9, 0, g, 0.06); const crater = M(new THREE.CircleGeometry(4, 18), glowing('#ff5a1a', null, 2.6), 0, 17.6, 0, g, 0); crater.rotation.x = -Math.PI / 2; crater.userData.keep = true; glowSprite(0, 19, 0, 0xff6a2a, 16, g);
      for (let i = 0; i < 4; i++) { const a2 = i * 1.7 + 0.3; const lv = M(BOX(0.9, 0.12, 12), glowing('#ff6a1a', null, 2.0), Math.cos(a2) * 8.5, 9, Math.sin(a2) * 8.5, g, 0); lv.rotation.set(0.95, -a2 + Math.PI / 2, 0); lv.userData.keep = true; }
      VOLC.push({ x: a, y: 19, z: b }); KEEP_OUT.push([a, b, 15]); colliders.push({ c: [a, b, 13] });
      const ring = new THREE.Mesh(new THREE.RingGeometry(19, 23, 64), new THREE.MeshToonMaterial({ map: tiled(dirtTex('#3a2a2a'), 8, 1), gradientMap: grad })); ring.rotation.x = -Math.PI / 2; ring.position.set(a, 0.07, b); scene.add(ring); const dash = new THREE.Mesh(new THREE.RingGeometry(20.9, 21.1, 64), toon('#f2f0ea')); dash.rotation.x = -Math.PI / 2; dash.position.set(a, 0.08, b); scene.add(dash); }
    for (const it of items('parkedBikes')) { const [a, b] = W2([it.x, it.y]); motorbike(grp(a, b, rr(0, 6))); }
    if (R('lavaBridge')) { const r = R('lavaBridge'); const lr = [r[0] - 160, r[1] + 40, r[2] + 160, r[3] - 40]; waterRect(z, lr, '#ff5a1a', 0.08, true); bridgeRect(z, r); }
    if (P('boxRing')) { const [a, b] = W2(P('boxRing')); const g = grp(a, b); M(BOX(7, 1.0, 7), toon('#2a2a3a'), 0, 0.5, 0, g, 0.04); M(BOX(6.6, 0.1, 6.6), toon('#d8d4e0'), 0, 1.02, 0, g, 0); for (const [x, zz, c] of [[3.2, 3.2, '#c42d3c'], [-3.2, 3.2, '#2f5f9e'], [3.2, -3.2, '#f2f0ea'], [-3.2, -3.2, '#f2f0ea']]) M(new THREE.CylinderGeometry(0.14, 0.14, 1.6, 8), toon(c), x, 1.8, zz, g, 0.02);
      for (let h = 0; h < 3; h++) for (const [x, zz, w, d] of [[0, 3.2, 6.4, 0.05], [0, -3.2, 6.4, 0.05], [3.2, 0, 0.05, 6.4], [-3.2, 0, 0.05, 6.4]]) M(BOX(w, 0.05, d), toon(['#c42d3c', '#f2f0ea', '#2f5f9e'][h]), x, 1.4 + h * 0.4, zz, g, 0);
      for (const s2 of [-1, 1]) { const sl = new THREE.SpotLight(0xfff1d0, 0, 26, 0.5, 0.5); sl.position.set(a + s2 * 6, 9, b); sl.target.position.set(a, 1, b); scene.add(sl, sl.target); } bake(g); colliders.push({ c: [a, b, 4.6] }); }
    // ---- Earth: the Strip's icons and the Ring
    if (k === 'earthStrip') {
      if (P('wheel')) { const [a, b] = W2(P('wheel')); const g = grp(a, b, Math.atan2(zcx - a, zcz - b) + Math.PI / 2); const R0 = 15; M(BOX(1.2, R0 + 2, 1.2), toon('#cbd5e1'), -2, (R0 + 2) / 2, 0, g, 0.03).rotation.z = 0.12; M(BOX(1.2, R0 + 2, 1.2), toon('#cbd5e1'), 2, (R0 + 2) / 2, 0, g, 0.03).rotation.z = -0.12;
        const wheel = new THREE.Group(); wheel.position.y = R0 + 2; g.add(wheel); M(new THREE.TorusGeometry(R0, 0.25, 8, 64), glowing('#ff3fa4', null, 1.8), 0, 0, 0, wheel, 0).rotation.y = Math.PI / 2; M(new THREE.TorusGeometry(R0 * 0.6, 0.15, 8, 48), glowing('#5fe1ff', null, 1.8), 0, 0, 0, wheel, 0).rotation.y = Math.PI / 2;
        for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2; const sp2 = M(BOX(0.12, R0, 0.12), toon('#cbd5e1'), 0, Math.cos(an) * R0 / 2, Math.sin(an) * R0 / 2, wheel, 0); sp2.rotation.x = an; const cab = M(BOX(1.6, 1.6, 1.6), toon(['#ffd23a', '#ff3fa4', '#5fe1ff', '#7dff9a'][i % 4]), 0, Math.cos(an) * R0, Math.sin(an) * R0, wheel, 0.03); cab.userData.cab = 1; } SPIN.push({ o: wheel, ax: 'x', v: 0.08 }); KEEP_OUT.push([a, b, 6]); colliders.push({ c: [a, b, 3] }); }
      if (P('pyramidLift')) { const [a, b] = W2(P('pyramidLift')); const dx = a - zcx, dz = b - zcz, L = Math.hypot(dx, dz) || 1; const g = grp(a + dx / L * 26, b + dz / L * 26, Math.atan2(-dx, -dz)); const py = M(new THREE.ConeGeometry(30, 34, 4), toon('#1d1a28'), 0, 17, 0, g, 0.06); py.rotation.y = Math.PI / 4; for (let i = 1; i < 5; i++) M(new THREE.TorusGeometry(30 * (1 - i / 5) * 1.414 / 1.414, 0.12, 4, 4), glowing('#ffd23a', null, 1.4), 0, 34 * i / 5, 0, g, 0).rotation.set(Math.PI / 2, 0, Math.PI / 4);
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.6, 300, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff6d8, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); beam.position.y = 34 + 150; g.add(beam); const t = signTex('THE PYRAMID', null, '#ffd23a'); M(BOX(10, 2.4, 0.3), [DARK, DARK, DARK, DARK, glowing(0, t, 1.8), DARK], 0, 4, 21.5, g, 0.03); KEEP_OUT.push([g.position.x, g.position.z, 30]); colliders.push({ c: [g.position.x, g.position.z, 22] }); }
      if (P('casinoLift')) { const [a, b] = W2(P('casinoLift')); const dx = a - zcx, dz = b - zcz, L = Math.hypot(dx, dz) || 1; const g = grp(a + dx / L * 18, b + dz / L * 18, Math.atan2(-dx, -dz)); M(BOX(16, 46, 12), texMat('panel', '#2a2f4a', 6, 16), 0, 23, 0, g, 0.06); for (let i = 0; i < 14; i++) M(BOX(15, 0.25, 0.1), glowing(i % 2 ? '#ffd23a' : '#ff3fa4', null, 1.6), 0, 3 + i * 3.1, 6.06, g, 0); M(BOX(17, 2.4, 13), glowing('#5fe1ff', null, 1.8), 0, 47, 0, g, 0.03); const t = signTex('CASINO', null, '#ff3fa4'); M(BOX(10, 2.5, 0.3), [DARK, DARK, DARK, DARK, glowing(0, t, 2.0), DARK], 0, 6, 6.3, g, 0.03); KEEP_OUT.push([g.position.x, g.position.z, 16]); colliders.push({ c: [g.position.x, g.position.z, 10] }); }
      if (P('welcome')) { const [a, b] = W2(P('welcome')); const g = grp(a, b, Math.atan2(zcx - a, zcz - b)); for (const s2 of [-1, 1]) M(BOX(0.4, 5, 0.4), toon('#cbd5e1'), s2 * 2.4, 2.5, 0, g, 0.02); const dia = M(new THREE.CylinderGeometry(3.4, 3.4, 0.4, 4), toon('#f2f0ea'), 0, 6.2, 0, g, 0.04); dia.rotation.set(Math.PI / 2, Math.PI / 4, 0); dia.scale.set(1.3, 1, 0.75); const t = signTex('WELCOME', null, '#c42d3c', '#c42d3c'); M(BOX(5.2, 1.3, 0.1), [DARK, DARK, DARK, DARK, glowing(0, t, 1.2), glowing(0, t, 1.2)], 0, 6.4, 0.25, g, 0); for (let i = 0; i < 18; i++) { const an = i / 18 * Math.PI * 2; M(new THREE.SphereGeometry(0.12, 6, 4), lampM, Math.cos(an) * 4.0, 6.2 + Math.sin(an) * 2.2, 0.22, g, 0); } const st2 = M(new THREE.OctahedronGeometry(0.6, 0), glowing('#c42d3c', null, 1.8), 0, 9.4, 0, g, 0.02); KEEP_OUT.push([a, b, 4]); }
    }
    if (k === 'earthGate' && P('ring')) { const [a, b] = W2(P('ring')); const g = grp(a, b); const R0 = 7; M(new THREE.TorusGeometry(R0, 1.1, 12, 64), toon('#5a5f72'), 0, R0 + 1.2, 0, g, 0.06, R0 + 1.1); for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; const c = M(BOX(1.2, 1.0, 1.6), glowing('#ff7a3a', null, 2.2), Math.cos(an) * R0, R0 + 1.2 + Math.sin(an) * R0, 0, g, 0.02); c.rotation.z = an; c.userData.keep = true; }
      const ev = new THREE.Mesh(new THREE.CircleGeometry(R0 - 0.9, 48), new THREE.MeshBasicMaterial({ color: 0x7fd8ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); ev.position.y = R0 + 1.2; g.add(ev); SPIN.push({ o: ev, ax: 'z', v: 0.6 }); M(BOX(R0 * 2.6, 1.2, 4), toon('#4a4f62'), 0, 0.6, 0, g, 0.04); glowSprite(0, R0 + 1.2, 0, 0x7fd8ff, 16, g); colliders.push({ c: [a, b, 2] }); KEEP_OUT.push([a, b, 10]); }
    // ---- Nebo: the giant tree; Ur: the stepped pyramid
    if (k === 'neboGiantTreePath' && R('climbEntrance')) { const r = R('climbEntrance'); const [a, b] = W2([(r[0] + r[2]) / 2, (r[1] + r[3]) / 2]); const dx = a - zcx, dz = b - zcz, L = Math.hypot(dx, dz) || 1; const tx = a + dx / L * 9, tz = b + dz / L * 9; const g = grp(tx, tz);
      M(new THREE.CylinderGeometry(4.5, 7, 60, 14), toon('#5a3d2c'), 0, 30, 0, g, 0.08); for (let i = 0; i < 6; i++) { const an = i / 6 * Math.PI * 2; const rt = M(new THREE.CylinderGeometry(0.8, 1.6, 9, 6), toon('#5a3d2c'), Math.cos(an) * 7, 1.5, Math.sin(an) * 7, g, 0.04); rt.rotation.set(Math.sin(an) * 1.1, 0, -Math.cos(an) * 1.1); }
      for (const [y, r2] of [[44, 18], [54, 15], [62, 11], [36, 13]]) { for (let i = 0; i < 5; i++) { const an = i / 5 * Math.PI * 2 + y; M(new THREE.IcosahedronGeometry(r2 * 0.55, 1), toon(['#3f8a46', '#4f9a4a', '#2f7a3e'][i % 3]), Math.cos(an) * r2 * 0.6, y, Math.sin(an) * r2 * 0.6, g, 0.06, r2 * 0.55); } }
      for (let i = 0; i < 10; i++) { const an = i * 1.3, y = 4 + i * 4.5; paperLanternWarm(g, Math.cos(an) * 5.3, y, Math.sin(an) * 5.3); } bake(g); KEEP_OUT.push([tx, tz, 12]); colliders.push({ c: [tx, tz, 6.5] }); }
    if (k === 'urPyramidPath' && P('pyramid.entrance')) { const [a, b] = W2(P('pyramid.entrance')); const dx = a - zcx, dz = b - zcz, L = Math.hypot(dx, dz) || 1; const ux = Math.abs(dx) > Math.abs(dz) ? Math.sign(dx) : 0, uz = ux ? 0 : Math.sign(dz) || -1; const steps = 6, base = 46, cx2 = a + ux * (base / 2 + 1), cz2 = b + uz * (base / 2 + 1); const g = grp(cx2, cz2, Math.atan2(-ux, -uz));
      for (let i = 0; i < steps; i++) { const w = base - i * 7, h = 4; M(BOX(w, h, w), texMat('stone', i % 2 ? '#c8a070' : '#b88a5a', w / 4, 1.2), 0, h / 2 + i * h, 0, g, 0.06); }
      M(BOX(8, steps * 4, base * 0.55), toon('#a8784a'), 0, steps * 2, base / 2 - base * 0.27, g, 0.03); for (let i = 0; i < steps * 6; i++) M(BOX(8.2, 0.12, 0.2), toon('#8a5a3a'), 0, i * 0.66, base / 2 - i * 0.66 * (base * 0.55) / (steps * 4), g, 0);
      M(BOX(9, 6, 9), texMat('brick', '#c8805a', 3, 2), 0, steps * 4 + 3, 0, g, 0.05); M(BOX(3, 4, 0.2), toon('#120c14'), 0, steps * 4 + 2, 4.6, g, 0); const fl = M(new THREE.ConeGeometry(0.8, 2.2, 8), glowing('#ff9a3a', null, 2.4), 0, steps * 4 + 7.4, 0, g, 0); FIRES.push({ fl, fi: fl, ph: 1 }); glowSprite(0, steps * 4 + 7.4, 0, 0xff9a40, 8, g);
      const dark = M(BOX(5, 5, 0.3), toon('#120c14'), 0, 2.5, base / 2 + 0.05, g, 0); bake(g); KEEP_OUT.push([cx2, cz2, base * 0.75]); colliders.push({ box: [cx2 - base / 2, cx2 + base / 2, cz2 - base / 2, cz2 + base / 2], h: 26 }); }
    // ---- Gaya: the crystal in the mountain cave
    if (/MountainCave|kyotoCave/.test(k) && P('crystal')) { const [a, b] = W2(P('crystal')); const g = grp(a, b); for (let i = 0; i < 7; i++) { const an = i / 7 * Math.PI * 2, r0 = i ? 1.8 : 0, h = i ? rr(2.5, 4) : 6.5; const c = M(new THREE.OctahedronGeometry(i ? 0.7 : 1.3, 0), glowing(W8 === 'player' ? '#9fffcf' : '#58d8ff', null, 2.2), Math.cos(an) * r0, h / 2 + 0.2, Math.sin(an) * r0, g, 0.03); c.scale.y = h / (i ? 1.4 : 2.6); c.rotation.z = i ? Math.cos(an) * 0.3 : 0; c.rotation.x = i ? Math.sin(an) * 0.3 : 0; c.userData.keep = true; } glowSprite(0, 3, 0, 0x58d8ff, 14, g); const L = new THREE.PointLight(0x58d8ff, 30, 30, 1.4); L.position.set(a, 4, b); scene.add(L); KEEP_OUT.push([a, b, 4]); colliders.push({ c: [a, b, 2.5] }); }
    if (/MountainCave|kyotoCave/.test(k) && P('lake')) { const [a, b] = W2(P('lake')); waterDisk(a, b, 9, '#2a7fb8'); }
  }
  const VOLC = [], SPIN = [];
  function paperLanternWarm(g, x, y, z) { M(new THREE.SphereGeometry(0.35, 10, 8), glowing('#ffb85a', null, 1.8), x, y, z, g, 0.01, 0.35); glowSprite(x, y, z, 0xffb060, 2.2, g); }
  function motorbike(g) { const k2 = toon('#1d1a20'), c = toon(pick(['#c42d3c', '#2f5f9e', '#e8cf4a', '#3f8a46'])); for (const zz of [-0.7, 0.7]) M(new THREE.TorusGeometry(0.34, 0.11, 8, 16), k2, 0, 0.42, zz, g, 0).rotation.y = Math.PI / 2; M(BOX(0.35, 0.4, 1.3), c, 0, 0.75, 0, g, 0.02); M(BOX(0.3, 0.12, 0.6), k2, 0, 1.0, -0.2, g, 0); M(BOX(0.7, 0.06, 0.06), toon('#cbd5e1'), 0, 1.15, 0.55, g, 0); bake(g); }
  function monsterTruck(g) { const k2 = toon('#1d1a20'), c = toon(pick(['#c42d3c', '#2f5f9e', '#e8cf4a', '#3f8a46', '#ff8a3a'])); for (const [x, zz] of [[-1.5, -1.9], [1.5, -1.9], [-1.5, 1.9], [1.5, 1.9]]) { M(new THREE.CylinderGeometry(1.15, 1.15, 0.9, 16), k2, x, 1.15, zz, g, 0.03, 1.15).rotation.z = Math.PI / 2; M(new THREE.CylinderGeometry(0.5, 0.5, 0.95, 10), toon('#cbd5e1'), x, 1.15, zz, g, 0).rotation.z = Math.PI / 2; } M(BOX(2.8, 0.9, 4.6), c, 0, 2.5, 0, g, 0.04); M(BOX(2.4, 0.9, 2.0), c, 0, 3.3, -0.3, g, 0.03); M(BOX(2.2, 0.6, 0.06), toon('#5fa8c8'), 0, 3.35, 0.72, g, 0); bake(g); }

  // ---------------------------------------------------------------- DEEP SPACE FOX: bulkheads, consoles, gardens, department doors
  function stationWalls(z, gr, G) {
    const N = gr.nx * gr.ny, outside = new Uint8Array(N), st = [];
    for (let i = 0; i < gr.nx; i++) st.push([i, 0], [i, gr.ny - 1]); for (let j = 0; j < gr.ny; j++) st.push([0, j], [gr.nx - 1, j]);
    while (st.length) { const [i, j] = st.pop(); if (i < 0 || j < 0 || i >= gr.nx || j >= gr.ny) continue; const k = j * gr.nx + i; if (outside[k] || gr.g[k]) continue; outside[k] = 1; st.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]); }
    const walls = [], beds = [];
    for (let j = 0; j < gr.ny; j++) for (let i = 0; i < gr.nx; i++) { const k = j * gr.nx + i; if (gr.g[k]) continue; let near = false; for (let dj = -1; dj <= 1 && !near; dj++) for (let di = -1; di <= 1; di++) if (gr.at(i + di, j + dj)) { near = true; break; } if (!near) continue; const [X, Z] = toW(z, (i + 0.5) * G, (j + 0.5) * G); (outside[k] ? walls : beds).push({ x: X, z: Z, s: 1 }); }
    const cs = G * S, H = 4.6;
    instanced(BOX(cs, H, cs), cutaway(texMat('panel', '#3a4152', 1, 2)), walls.map(p => ({ ...p, y: H / 2 })), false);
    instanced(BOX(cs * 1.02, 0.16, cs * 1.02), cutaway(glowing('#5fe1ff', null, 1.6)), walls.map(p => ({ ...p, y: H + 0.08 })), false);
    instanced(BOX(cs * 1.02, 0.1, cs * 1.02), cutaway(glowing('#ff3fa4', null, 1.2)), walls.filter((p, i) => i % 3 === 0).map(p => ({ ...p, y: 1.0 })), false);
    // garden beds: the enclosed islands become planters with glowing alien plants
    instanced(BOX(cs, 0.8, cs), toon('#2a3040'), beds.map(p => ({ ...p, y: 0.4 })), false);
    instanced(BOX(cs * 0.96, 0.08, cs * 0.96), toon('#3f6a4a'), beds.map(p => ({ ...p, y: 0.82 })), false);
    const plants = beds.filter((p, i) => i % 2 === 0); const pg = mergeGeo([{ geo: new THREE.ConeGeometry(0.25, 1.6, 5), pos: [0, 0.8, 0] }, { geo: new THREE.SphereGeometry(0.3, 8, 6), pos: [0, 1.7, 0] }, { geo: new THREE.ConeGeometry(0.18, 1.1, 5), pos: [0.4, 0.55, 0.1], rot: [0, 0, -0.4] }, { geo: new THREE.ConeGeometry(0.18, 1.0, 5), pos: [-0.35, 0.5, -0.1], rot: [0, 0, 0.4] }]);
    instanced(pg, toon('#ffffff'), plants.map((p, i) => ({ ...p, y: 0.85, r: i, s: 0.8 + (i % 3) * 0.25 })), true, ['#7dff9a', '#5fe1ff', '#c084fc', '#ff8fb0'].map(c => new THREE.Color(c)));
    plants.forEach((p, i) => { if (i % 4 === 0) glowSprite(p.x, 2.4, p.z, [0x7dff9a, 0x5fe1ff, 0xc084fc][i % 3], 1.8); });
    walls.forEach(p => colliders.push({ c: [p.x, p.z, cs * 0.55] })); beds.forEach(p => colliders.push({ c: [p.x, p.z, cs * 0.55] }));
    // light columns along the walk edges
    let n = 0; for (let j = 0; j < gr.ny; j += 3) for (let i = 0; i < gr.nx; i += 3) { if (!gr.at(i, j) || n > 90) continue; const edge = !gr.at(i + 2, j) || !gr.at(i - 2, j) || !gr.at(i, j + 2) || !gr.at(i, j - 2); if (!edge) continue; const [X, Z] = toW(z, (i + 0.5) * G, (j + 0.5) * G); STL.push({ x: X, z: Z, s: 1 }); n++; }
    // department doors
    for (const [name, v] of Object.entries(z.spots || {})) { if (!name.startsWith('door_') || !v.p) continue; const [X, Z] = toW(z, v.p[0], v.p[1]); const [cx0, cz0] = center(z); const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = Math.atan2(cx0 - X, cz0 - Z); scene.add(g);
      for (const s2 of [-1, 1]) M(BOX(0.6, 4.4, 0.8), toon('#5a6276'), s2 * 2.4, 2.2, 0, g, 0.03); M(BOX(5.4, 0.7, 0.8), toon('#5a6276'), 0, 4.7, 0, g, 0.03); M(BOX(4.2, 0.12, 0.2), glowing('#5fe1ff', null, 2), 0, 0.06, 0.3, g, 0);
      const lbl = name.replace('door_dsf', '').toUpperCase(); const t = signTex(lbl, null, '#5fe1ff'); M(BOX(4.4, 1.1, 0.12), [DARK, DARK, DARK, DARK, glowing(0, t, 1.6), glowing(0, t, 1.6)], 0, 5.6, 0, g, 0.02); bake(g); }
    // the hub: a hologram of the Nine over the pad
    const pad = z.spots && z.spots.transportPad && z.spots.transportPad.p; if (pad && z.key === 'dsfPromenade') { const [X, Z] = toW(z, pad[0], pad[1]); const holo = new THREE.Group(); holo.position.set(X, 9, Z); scene.add(holo); const hm = new THREE.MeshBasicMaterial({ color: 0x5fe1ff, transparent: true, opacity: 0.35, wireframe: true, blending: THREE.AdditiveBlending, depthWrite: false }); holo.add(new THREE.Mesh(new THREE.IcosahedronGeometry(3, 2), hm)); for (let i = 0; i < 9; i++) { const an = i / 9 * Math.PI * 2; const pl = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(i / 9, 0.7, 0.6), transparent: true, opacity: 0.85 })); pl.position.set(Math.cos(an) * 5.5, Math.sin(an * 2) * 0.6, Math.sin(an) * 5.5); holo.add(pl); } SPIN.push({ o: holo, ax: 'y', v: 0.15 }); glowSprite(X, 9, Z, 0x5fe1ff, 10); }
  }
  const STL = [];
  // ---------------------------------------------------------------- ZONES: ground, buildings, wilds, lamps
  const doorsOut = [];   // {X, Z, to, label, from}
  const exitsIn = [];    // inside areas: {X, Z, to, label, area}
  const buildings = [];
  const CAVE = /cave|deep|volcano|climb|gallery|shaft|drop|mine|cavern/i;
  for (const z of zones) {
    z.cave = CAVE.test(z.key + ' ' + z.label) && !/plain|path|road|field|wood|forest|climb|tree/i.test(z.key + ' ' + z.label);
    z.gloom = /deep ?woods|dark ?wood|thicket/i.test(z.key + ' ' + z.label);
    z.canopy = /TreeTop|Canopy|Crown/i.test(z.key);
    z.asphalt = W8 === 'earth' && /speedway|raceway|highway|mojave|wire/i.test(z.key + ' ' + z.label);
    z.snow = W8 === 'player' && /ski|slope|snow|mount|rink/i.test(z.label);
    z.lakeZone = /\blake\b/i.test(z.label) && !/path|road/i.test(z.label) && z.key === 'gayaCanyon';
    z.town = TOWNRE.test(z.key + ' ' + z.label) && !z.cave;
    z.terr = z.lakeZone ? null : z.cave ? 'cave' : /tree/i.test(z.key) && /climb/i.test(z.key + ' ' + z.label) ? 'tree' : /canyon|gorge|cliff|ravine|crag|chasm/i.test(z.key + ' ' + z.label) ? 'canyon' : /mountain|peak|summit|slope|ridge|switchback|climb|volcano/i.test(z.key + ' ' + z.label) ? 'mountain' : null;
    groundLayers(z);
    zoneProps(z);
    setPieces(z);
    const G = 60, gr = grid(z, G), used = new Uint8Array(gr.nx * gr.ny); z._gr = gr; z._used = used;
    // buildings: the blocked ground behind each door
    // exits that lead into a room or a set piece (castle gates, cave mouths) work like doors
    const extra = (z.exits || []).filter(e => MAPS[e.to] && MAPS[e.to].kind === 'area' && !z.doors.some(d => d.to === e.to))
      .map(e => ({ kind: 'gate', to: e.to, label: e.label, x: (e.rect[0] + e.rect[2]) / 2, y: (e.rect[1] + e.rect[3]) / 2, at: e.arriveAt }));
    // buildings the 2D map draws with their own footprints (and labels)
    for (const it of ((z.spots && z.spots.buildings && z.spots.buildings.items) || [])) {
      if (!it.rect) continue; const [x0, y0, x1, y1] = it.rect, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      let door = null, bd = 1e9; for (const d of z.doors) { if (d.kind === 'seam' || d.kind === 'pad') continue; const dd = Math.hypot(clamp(d.x, x0, x1) - d.x, clamp(d.y, y0, y1) - d.y); if (dd < 140 && dd < bd) { bd = dd; door = d; } }
      const px = door ? door.x : z.w / 2, py = door ? door.y : z.h / 2;
      const dl = Math.abs(px - x0), dr = Math.abs(px - x1), dt = Math.abs(py - y0), db = Math.abs(py - y1);
      let face; if (door) face = [[dl, 'W'], [dr, 'E'], [dt, 'N'], [db, 'S']].sort((a, b) => a[0] - b[0])[0][1]; else { const vx = z.w / 2 - mx, vy = z.h / 2 - my; face = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'E' : 'W') : (vy > 0 ? 'S' : 'N'); }
      buildings.push({ z, x0, x1, y0, y1, face, door: door ? [door.x, door.y] : null, label: it.label || (door && door.label) || '' });
      for (let j = Math.floor(y0 / G); j < Math.ceil(y1 / G); j++) for (let i = Math.floor(x0 / G); i < Math.ceil(x1 / G); i++) if (i >= 0 && j >= 0 && i < gr.nx && j < gr.ny) used[j * gr.nx + i] = 1;
    }
    for (const d of [...z.doors, ...extra]) {
      if (d.kind === 'pad') { const [X, Z] = toW(z, d.x, d.y); doorsOut.push({ X, Z, to: d.to, label: d.label, from: z.key, at: d.at, pad: true }); continue; }
      if (d.kind === 'seam' && (!MAPS[d.to] || MAPS[d.to].kind !== 'area')) continue;
      if (d.kind === 'seam' || d.kind === 'gate') { const [X, Z] = toW(z, d.x, d.y); doorsOut.push({ X, Z, to: d.to, label: d.label, from: z.key, at: d.at, gate: true }); continue; }
      const dx = d.x, dy = d.y, [X, Z] = toW(z, dx, dy);
      if (doorsOut.some(o => o.from === z.key && Math.abs(o.X - X) < 0.5 && Math.abs(o.Z - Z) < 0.5)) continue;   // one physical door, several names
      doorsOut.push({ X, Z, to: d.to, label: d.label, from: z.key, at: d.at });
      let best = null;
      for (const [vx, vy, f] of [[0, -1, 'N'], [0, 1, 'S'], [-1, 0, 'W'], [1, 0, 'E']]) for (let r = 1; r <= 5; r++) { const i = Math.floor(dx / G) + vx * r, j = Math.floor(dy / G) + vy * r; if (!gr.at(i, j)) { if (!best || r < best.r) best = { i, j, r, vx, vy }; break; } }
      if (!best) { addBuilding(z, dx, dx, dy, dy, 'S', [dx, dy], d.label, gr); continue; }
      const seen = new Set(), st = [[best.i, best.j]]; let bi0 = 1e9, bi1 = -1e9, bj0 = 1e9, bj1 = -1e9, n = 0;
      const ci = Math.floor(dx / G), cj = Math.floor(dy / G);
      while (st.length && n < 260) { const [i, j] = st.pop(); const k = j * gr.nx + i; if (seen.has(k) || gr.at(i, j) || i < 0 || j < 0 || i >= gr.nx || j >= gr.ny || Math.abs(i - ci) > 9 || Math.abs(j - cj) > 9) continue; seen.add(k); n++; bi0 = Math.min(bi0, i); bi1 = Math.max(bi1, i); bj0 = Math.min(bj0, j); bj1 = Math.max(bj1, j); st.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]); }
      if (n < 2) { addBuilding(z, dx, dx, dy, dy, best.vy === -1 ? 'S' : best.vy === 1 ? 'N' : best.vx === -1 ? 'E' : 'W', [dx, dy], d.label, gr); continue; }
      seen.forEach(k => used[k] = 1);
      const x0 = bi0 * G, x1 = (bi1 + 1) * G, y0 = bj0 * G, y1 = (bj1 + 1) * G;
      addBuilding(z, x0, x1, y0, y1, best.vy === -1 ? 'S' : best.vy === 1 ? 'N' : best.vx === -1 ? 'E' : 'W', [dx, dy], d.label, gr);
    }
    fillBlocks(z);
    if (W8 === 'station') { stationWalls(z, gr, G); continue; }
    // wild + trees on blocked ground, lamps along the path edges
    let lamps = 0;
    for (let j = 0; j < gr.ny; j++) for (let i = 0; i < gr.nx; i++) {
      const k = j * gr.nx + i, x = (i + 0.5) * G, y = (j + 0.5) * G, [X, Z] = toW(z, x, y);
      if (!gr.g[k] && !used[k]) {
        const nearPath = gr.at(i + 1, j) || gr.at(i - 1, j) || gr.at(i, j + 1) || gr.at(i, j - 1);
        const h = ((i * 73856093) ^ (j * 19349663)) >>> 0, hr = (h % 1000) / 1000;
        const th = THEME_OF(z), town = z.town, terr0 = z.terr, terr = terr0 === 'tree' ? 'canyon' : terr0;
        if (terr && !town && W8 !== 'station') {   // caves, canyons and mountains: rock walls along the path, not forest
          const near2 = nearPath || gr.at(i + 2, j) || gr.at(i - 2, j) || gr.at(i, j + 2) || gr.at(i, j - 2);
          const pc = terr === 'cave' ? (nearPath ? 0.9 : near2 ? 0.6 : 0.12) : terr === 'canyon' ? (nearPath ? 0.7 : near2 ? 0.36 : 0.06) : (nearPath ? 0.35 : near2 ? 0.25 : 0.08);
          if (hr < pc) { cliffSpots.push({ bark: terr0 === 'tree', col: terr0 === 'tree' ? (hr * 7 % 1 < 0.5 ? '#6b4a35' : '#5a3d2c') : z.snow ? (hr * 7 % 1 < 0.5 ? '#c4cfdc' : '#aebacb') : null, x: X + rr(-0.6, 0.6), z: Z + rr(-0.6, 0.6), s: rr(1.6, 2.6) * (nearPath ? 1 : 1.3), sy: terr === 'cave' ? rr(2.2, 4.2) : terr === 'canyon' ? rr(2.6, 5.2) : rr(1.2, 3.0), r: rr(0, 6) }); if (terr === 'cave' && hr < 0.06 && nearPath) crystalSpots.push({ x: X + rr(-0.4, 0.4), z: Z + rr(-0.4, 0.4), s: rr(0.6, 1.3), r: rr(0, 6) }); continue; }
          if (terr === 'cave') continue;
          if (terr === 'canyon' && hr > pc + 0.08) continue;
          if (terr === 'mountain' && hr < pc + 0.12) rockSpots.push({ x: X + rr(-0.5, 0.5), z: Z + rr(-0.5, 0.5), s: rr(0.6, 1.3), r: rr(0, 6) });
        }
        const dens = VEG.water ? (nearPath ? 0.22 : 0) : (th === 'kyoto' ? 0.32 : VEG.d) * (town ? (nearPath ? 0.35 : 0.5) : nearPath ? 0.6 : 0.42), rk2 = VEG.water || town ? (nearPath && !town ? 0.04 : 0) : (VEG.rock ?? 0.08);
        if (!town && !z.cave && W8 !== 'station' && !VEG.water && tuftSpots.length < tuftMax && (nearPath ? hr < 0.9 : hr < 0.35)) for (let q = 0; q < (nearPath ? 3 : 1); q++) tuftSpots.push({ x: X + rr(-1.2, 1.2), z: Z + rr(-1.2, 1.2), s: rr(0.7, 1.4), r: rr(0, 6), fl: rnd() < 0.18 });
        if (hr < dens + rk2) { if (W8 === 'station') continue; if (z.cave) { if (nearPath || hr < 0.25) rockSpots.push({ x: X + rr(-0.5, 0.5), z: Z + rr(-0.5, 0.5), s: rr(1.2, 2.4), sy: rr(1.5, 3.5), r: rr(0, 6) }); continue; } if (hr < rk2) rockSpots.push({ x: X + rr(-0.5, 0.5), z: Z + rr(-0.5, 0.5), s: rr(0.5, 1.1), r: rr(0, 6) }); else treeSpots.push({ x: X + rr(-0.6, 0.6), z: Z + rr(-0.6, 0.6), s: rr(0.8, 1.3), r: rr(0, 6), kind: th === 'kyoto' ? (hr < dens * 0.6 ? 'sakura' : 'pine') : VEG.kind === 'rock' ? 'cactus' : VEG.kind === 'none' ? null : (VEG.kind === 'pine' && hr < dens * 0.35 ? 'broad' : VEG.kind) }); }
      } else if (!z.ownLamps && gr.g[k] && (i + j) % 3 === 0 && lamps < (z.town ? 60 : 36)) {
        const edge = !gr.at(i + 1, j) || !gr.at(i - 1, j) || !gr.at(i, j + 1) || !gr.at(i, j - 1), gap = z.town ? 7.5 : 10.5;
        if (edge && !z.doors.some(d => Math.hypot(d.x - x, d.y - y) < 160) && !(z._lamps || []).some(q => Math.hypot(q.x - X, q.z - Z) < gap)) { const L = { x: X, z: Z }; lampSpots.push(L); (z._lamps = z._lamps || []).push(L); lamps++; }
      }
    }
  }
  // ---------------------------------------------------------------- KYOTO pieces
  const isKyo = k => /^kyoto/.test(k || '');
  const CASTLE_W = { gaya: 1, player: 1, nebo: 1, kufa: 1, ur: 1, luxor: 1, zion: 1, jidda: 1 };
  const VERM = toon('#c8322a'), INK = toon('#1d1a20');
  function torii(g, w, label, h = 5.2) {
    for (const s2 of [-1, 1]) { M(new THREE.CylinderGeometry(0.28, 0.34, h, 14), VERM, s2 * w / 2, h / 2, 0, g, 0.04, 0.34); M(new THREE.CylinderGeometry(0.42, 0.42, 0.5, 14), INK, s2 * w / 2, 0.25, 0, g, 0.03, 0.42); }
    M(BOX(w + 0.9, 0.32, 0.42), VERM, 0, h - 1.15, 0, g, 0.03);                       // nuki
    M(BOX(w + 2.0, 0.34, 0.5), VERM, 0, h + 0.05, 0, g, 0.03);                        // shimaki
    M(BOX(w + 2.6, 0.32, 0.62), INK, 0, h + 0.38, 0, g, 0.03);                        // kasagi
    for (const s2 of [-1, 1]) { const tip = M(BOX(1.0, 0.3, 0.62), INK, s2 * (w / 2 + 1.55), h + 0.5, 0, g, 0.02); tip.rotation.z = s2 * 0.22; }
    M(BOX(0.22, 1.0, 0.3), VERM, 0, h - 0.55, 0, g, 0);
    if (label) { const t = signTex(String(label).toUpperCase().slice(0, 14), null, '#e6b45a'); M(BOX(Math.min(w, 3.4), Math.min(w, 3.4) / 4.2, 0.14), [INK, INK, INK, INK, glowing(0, t, 1.3), glowing(0, t, 1.3)], 0, h - 0.55, 0, g, 0.02); }
  }
  function paperLantern(g, x, y, z, col = '#e8432f') { const m = M(new THREE.CylinderGeometry(0.28, 0.28, 0.55, 12), glowing(col, null, 1.5), x, y, z, g, 0.015, 0.3); m.scale.set(1, 1, 1); M(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 12), INK, x, y + 0.3, z, g, 0); M(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 12), INK, x, y - 0.3, z, g, 0); glowSprite(x, y, z, 0xff7a50, 1.6, g); }
  var MON = null; function monTex() { return MON || (MON = canvasTex(256, 256, c => { c.fillStyle = '#c8322a'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.fillStyle = '#e6b45a'; c.beginPath(); c.arc(128, 128, 104, 0, 7); c.fill(); c.fillStyle = '#1d1a20'; c.beginPath(); c.arc(128, 128, 96, 0, 7); c.fill(); c.fillStyle = '#ffd6e2';
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 - Math.PI / 2; c.save(); c.translate(128 + Math.cos(a) * 40, 128 + Math.sin(a) * 40); c.rotate(a + Math.PI / 2); c.beginPath(); c.moveTo(0, 34); c.bezierCurveTo(-34, 10, -26, -30, -6, -34); c.lineTo(0, -24); c.lineTo(6, -34); c.bezierCurveTo(26, -30, 34, 10, 0, 34); c.fill(); c.restore(); }
    c.fillStyle = '#e6b45a'; c.beginPath(); c.arc(128, 128, 16, 0, 7); c.fill(); })); }
  function pagoda(g, tiers = 5) {
    const st = toon('#a8a49a'); M(BOX(7.5, 1.0, 7.5), st, 0, 0.5, 0, g, 0.04); M(BOX(6.4, 0.4, 6.4), st, 0, 1.2, 0, g, 0.03);
    let y = 1.4;
    for (let t = 0; t < tiers; t++) { const w = 5.2 - t * 0.62, h = 2.3 - t * 0.12; M(BOX(w, h, w), toon('#f3eee2'), 0, y + h / 2, 0, g, 0.04); for (const s2 of [-1, 1]) for (const a of [0, 1]) M(BOX(a ? 0.16 : w + 0.04, h, a ? w + 0.04 : 0.16), VERM, a ? s2 * w / 2 : 0, y + h / 2, a ? 0 : s2 * w / 2, g, 0);
      M(BOX(w * 0.22, h * 0.6, 0.1), glowing('#ffcf8a', null, 1.2), 0, y + h * 0.45, w / 2 + 0.03, g, 0);
      const rw = w + 2.4; M(hipRoof(rw, rw, 1.4), toon('#3d4656'), 0, y + h - 0.1, 0, g, 0.05);
      for (const [x, z] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const e = M(new THREE.ConeGeometry(0.16, 0.8, 5), INK, x * rw * 0.5, y + h + 0.1, z * rw * 0.5, g, 0); e.rotation.set(z * 0.9, 0, -x * 0.9); paperLantern(g, x * rw * 0.46, y + h - 0.3, z * rw * 0.46, '#ffb85a'); }
      y += h + 1.0; }
    M(new THREE.CylinderGeometry(0.12, 0.16, 4.2, 8), toon('#d9a64a'), 0, y + 2.0, 0, g, 0.02, 0.16); for (let k = 0; k < 7; k++) M(new THREE.TorusGeometry(0.42 - k * 0.03, 0.06, 6, 16), toon('#d9a64a'), 0, y + 0.6 + k * 0.42, 0, g, 0).rotation.x = Math.PI / 2;
  }
  function castleKeep(g) {
    const st = toon('#7f7b74'), wh = toon('#f4f1ea'), rf = toon('#3a4252');
    const base = M(new THREE.CylinderGeometry(16, 22, 14, 4, 1), st, 0, 7, 0, g, 0.06); base.rotation.y = Math.PI / 4;
    let y = 14, w = 20;
    for (let t = 0; t < 4; t++) { const h = t === 0 ? 6 : 4.4; M(BOX(w, h, w * 0.8), wh, 0, y + h / 2, 0, g, 0.06); for (let i = 0; i < Math.floor(w / 3); i++) M(BOX(0.9, 1.2, 0.12), glowing('#ffcf8a', null, 1.1), -w / 2 + 1.8 + i * 3, y + h * 0.55, w * 0.4 + 0.07, g, 0.02);
      M(hipRoof(w + 4, w * 0.8 + 4, 3.4), rf, 0, y + h - 0.2, 0, g, 0.06);
      for (const s2 of [-1, 1]) { const gb = M(prism(w * 0.35, 2.4, 0.6), rf, s2 * w * 0.22, y + h + 0.6, w * 0.42, g, 0.03); gb.rotation.y = 0; M(prism(w * 0.3, 2.0, 0.5), wh, s2 * w * 0.22, y + h + 0.7, w * 0.44, g, 0); }
      y += h + 2.2; w *= 0.74; }
    for (const s2 of [-1, 1]) { const f = M(new THREE.ConeGeometry(0.5, 1.6, 6), GOLD, s2 * 2.2, y + 0.6, 0, g, 0.03); f.rotation.z = s2 * 0.6; }
  }
  for (const d of doorsOut) if (d.gate) {
    const g = new THREE.Group(); g.position.set(d.X, 0, d.Z); scene.add(g);
    if (!isKyo(d.from) && CASTLE_W[W8] && /throne|castle/i.test(d.to) && /castle/i.test(d.from)) { scene.remove(g); continue; }
    if (isKyo(d.from)) { const z0 = MAPS[d.from]; const [cx0, cz0] = center(z0); g.rotation.y = Math.atan2(cx0 - d.X, cz0 - d.Z); torii(g, 4.6, d.label); bake(g); continue; }
    for (const s2 of [-1, 1]) M(BOX(0.4, 4.2, 0.4), DARK, s2 * 2.2, 2.1, 0, g, 0.02);
    const tt = signTex(String(d.label || '').toUpperCase().slice(0, 16), null, ST.trim || '#d9a64a');
    M(BOX(5.2, 1.15, 0.2), [DARK, DARK, DARK, DARK, glowing(0, tt, 1.3), glowing(0, tt, 1.3)], 0, 4.3, 0, g, 0.03);
    M(new THREE.TorusGeometry(1.4, 0.08, 6, 32), accentGlow, 0, 0.08, 0, g, 0).rotation.x = Math.PI / 2;
  }
  // the transport pad: the world's crest set in the ground where you arrive
  { const emb = emblemTex(ST.crest || '8', { outer: ST.accent || '#c42d3c', ring: ST.trim || '#e6b45a', bg: '#151b3d', stroke: '#7dd3fc' });
    for (const z of zones) { const pad = z === MAPS[D.start] || z.spots && z.spots.transportPad; if (!pad) continue; const p = z.spots && z.spots.transportPad ? z.spots.transportPad.p : z.spawn; const [X, Z] = toW(z, p[0], p[1]);
      const g = new THREE.Group(); g.position.set(X, 0, Z); scene.add(g); M(new THREE.CylinderGeometry(2.6, 2.6, 0.14, 48), toon(ST.accent || '#c42d3c'), 0, 0.07, 0, g, 0);
      const e2 = isKyo(z.key) ? monTex() : emb; const top = new THREE.Mesh(new THREE.CircleGeometry(2.55, 48), new THREE.MeshToonMaterial({ map: e2, gradientMap: grad, emissive: 0xffffff, emissiveMap: e2, emissiveIntensity: 0 })); glowMats.push({ m: top.material, k: 0.35 }); top.rotation.x = -Math.PI / 2; top.position.y = 0.145; g.add(top); } }
  // roads between zones, lined with lamps
  for (const r of roads) {
    const dx = r.b[0] - r.a[0], dz = r.b[1] - r.a[1], L = Math.hypot(dx, dz); if (L < 0.5) continue;
    const m = new THREE.Mesh(BOX(r.w, 0.06, L + r.w), new THREE.MeshToonMaterial({ map: cobbleTex([r.w / 3, (L + r.w) / 3], [ST.path || '#9a9ec5', '#a8a08a', ST.path || '#8b8fb9', '#9a9078']), gradientMap: grad }));
    m.position.set((r.a[0] + r.b[0]) / 2, 0.04, (r.a[1] + r.b[1]) / 2); m.rotation.y = Math.atan2(dx, dz); m.receiveShadow = true; scene.add(m);
    const nx = -dz / L, nz = dx / L;
    const ky = isKyo(r.from) && isKyo(r.to);
    if (ky) m.material.map = cobbleTex([r.w / 3, (L + r.w) / 3], ['#cfc9bb', '#c2bcae', '#d8d2c4', '#bab4a6'], '#8a8478');
    for (let t = 6; t < L - 2; t += 10) for (const s of [-1, 1]) lampSpots.push({ x: r.a[0] + dx * t / L + nx * s * (r.w / 2 + 0.6), z: r.a[1] + dz * t / L + nz * s * (r.w / 2 + 0.6), kyo: ky });
    // a sign over the road, naming where it goes (a torii in Kyoto, three of them in a row)
    const g = new THREE.Group(); g.position.set(r.a[0] + dx * 0.5, 0, r.a[1] + dz * 0.5); g.rotation.y = Math.atan2(dx, dz); scene.add(g);
    if (ky) { for (let k = -1; k <= 1; k++) { const g2 = new THREE.Group(); g2.position.set(0, 0, k * Math.min(5, L / 4)); g.add(g2); torii(g2, r.w + 1.0, k === -1 ? r.label : null); } bake(g); continue; }
    if (L < 18) continue;   // short links: no gantry (it filled the arrival camera)
    const SD = SIGN_DARK || (SIGN_DARK = nearCut(DARK.clone(), 7));
    for (const s of [-1, 1]) M(BOX(0.25, 7.6, 0.25), SD, s * (r.w / 2 + 0.4), 3.8, 0, g, 0);
    const tt = signTex(String(r.label || '').toUpperCase(), null, ST.trim || '#d9a64a');
    const sw = Math.min(r.w + 1.2, 7), face = nearCut(glowing(0, tt, 1.3), 7);
    M(BOX(sw, sw / 4.5, 0.18), [SD, SD, SD, SD, face, face], 0, 7.2, 0, g, 0);   // no ink shell: a camera inside a back-face shell sees only ink
  }

  var SIGN_DARK = null;
  // ---------------------------------------------------------------- BUILDING KIT (Meru's dress pass, one architecture per world)
  // bake: merge every plain (untextured) mesh of a group by material, outlines too — a dressed building costs ~10 draw calls
  function bake(root) {
    root.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    const groups = new Map();
    root.traverse(o => {
      if (!o.isMesh || o.material === outlineMat || o.isInstancedMesh) return;
      if (Array.isArray(o.material) || o.material.map || o.material.alphaMap || o.material.transparent || o.userData.keep) return;
      const k = o.material.uuid; if (!groups.has(k)) groups.set(k, { mat: o.material, list: [] }); groups.get(k).list.push(o);
    });
    const m = new THREE.Matrix4();
    const mergeList = (list) => { const pos = [], nor = []; for (const o of list) { const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); m.multiplyMatrices(inv, o.matrixWorld); g.applyMatrix4(m); pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); } const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); out.computeBoundingSphere(); return out; };
    const outl = [], adds = [], gone = [];
    for (const { mat, list } of groups.values()) {
      if (list.length < 2) continue;
      for (const o of list) { for (const c of o.children) if (c.isMesh && c.material === outlineMat) outl.push(c); gone.push(o); }
      const mm = new THREE.Mesh(mergeList(list), mat); mm.castShadow = mm.receiveShadow = true; adds.push(mm);
    }
    if (outl.length) adds.push(new THREE.Mesh(mergeList(outl), outlineMat));
    for (const o of gone) { const kids = o.children.filter(c => !(c.isMesh && c.material === outlineMat)); for (const c of kids) { o.remove(c); root.attach(c); } o.parent && o.parent.remove(o); }
    adds.forEach(a => root.add(a));
  }
  const ARCH = {
    gaya:   { wall: 'stone', base: '#d6cde4', trim: '#e6b45a', stone: '#5c5675', roof: 'pitch', roofCol: '#5b4386', shutter: '#4b3a78', accent: '#58d8ff' },
    nebo:   { wall: 'plank', base: '#8a6a4a', trim: '#3a2a1e', stone: '#5a5048', roof: 'pitch', roofCol: '#3f6b4a', shutter: '#3f6b4a', accent: '#ffb85a', chimney: true },
    zion:   { wall: 'plank', base: '#c49a62', trim: '#5a3a22', stone: '#6a5a48', roof: 'false', roofCol: '#6a4630', shutter: '#8a3a2a', accent: '#e8cf4a', porch: true },
    player: { wall: 'brick', base: '#c99a76', trim: '#f2ece0', stone: '#6b6280', roof: 'pitch', roofCol: '#8a3a3a', shutter: '#2f5f9e', accent: '#ec3013', chimney: true },
    jidda:  { wall: 'plank', base: '#e9d8ae', trim: '#2f8a7a', stone: '#c9b48a', roof: 'thatch', roofCol: '#c9a24a', shutter: '#3fb7a0', accent: '#5ec97e', stilts: true },
    kufa:   { wall: 'stone', base: '#e3c79a', trim: '#b98a4a', stone: '#9a7a52', roof: 'flat', roofCol: '#c9a46a', shutter: '#2f6a8a', accent: '#d6a547', awning: ['#c42d3c', '#f2e6c8'], dome: true },
    ur:     { wall: 'brick', base: '#c8805a', trim: '#e6c07a', stone: '#7a4a32', roof: 'flat', roofCol: '#a8603e', shutter: '#3a6a5a', accent: '#e8963a', crenel: true, awning: ['#e8963a', '#f6e7c8'] },
    luxor:  { wall: 'brick', base: '#b0503e', trim: '#e6b45a', stone: '#5a2a22', roof: 'flat', roofCol: '#7a3428', shutter: '#2a2a3a', accent: '#e0574a', columns: true, crenel: true },
    earth:  { wall: 'panel', base: '#2a2f4a', trim: '#ffd23a', stone: '#22253a', roof: 'flat', roofCol: '#1b1e30', shutter: null, accent: '#ff3fa4', neon: true },
    station:{ wall: 'panel', base: '#5a6170', trim: '#9aa4b5', stone: '#3a404c', roof: 'flat', roofCol: '#3a404c', shutter: null, accent: '#5fe1ff' },
    kyoto:  { wall: 'plaster', base: '#f3eee2', trim: '#3a2a22', stone: '#8a8478', roof: 'pagoda', roofCol: '#3d4656', shutter: null, accent: '#c42d3c', timber: true },
  };
  const LOWQ = opts.quality === 'low';
  function plasterTex(base) { const k = 'p' + base; if (TEXC[k]) return TEXC[k]; const t = canvasTex(128, 128, c => { c.fillStyle = base; c.fillRect(0, 0, 128, 128); for (let i = 0; i < 300; i++) { c.fillStyle = 'rgba(0,0,0,' + rr(0.01, 0.04) + ')'; c.fillRect(rr(0, 128), rr(0, 128), rr(1, 4), rr(1, 3)); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return TEXC[k] = t; }
  function wallMat(A, rx, ry) { if (A.wall === 'plaster') { const t = tiled(plasterTex(A.base), rx, ry); return new THREE.MeshToonMaterial({ map: t, gradientMap: grad }); } return texMat(A.wall, A.base, rx, ry); }
  function sconce(g, x, y, z) { M(BOX(0.12, 0.12, 0.3), DARK, x, y, z + 0.12, g, 0.015); M(BOX(0.24, 0.3, 0.24), lampM, x, y - 0.08, z + 0.32, g, 0.02); M(new THREE.ConeGeometry(0.2, 0.16, 4), DARK, x, y + 0.12, z + 0.32, g, 0).rotation.y = Math.PI / 4; glowSprite(x, y - 0.08, z + 0.4, 0xffb060, 1.8, g); }
  function winAt(g, x, y, z, ry, trim, sh) { const wg = new THREE.Group(); wg.position.set(x, y, z); wg.rotation.y = ry; g.add(wg); M(BOX(1.0, 1.2, 0.12), trim, 0, 0, 0, wg, 0.02); const pane = M(BOX(0.8, 1.0, 0.1), windowM, 0, 0, 0.03, wg, 0); pane.userData.keep = true; M(BOX(0.06, 1.0, 0.13), trim, 0, 0, 0.04, wg, 0); M(BOX(0.8, 0.06, 0.13), trim, 0, 0.05, 0.04, wg, 0); M(BOX(1.2, 0.1, 0.25), trim, 0, -0.65, 0.08, wg, 0.012); if (sh) for (const s2 of [-1, 1]) M(BOX(0.42, 1.12, 0.06), sh, s2 * 0.74, 0, 0.05, wg, 0.012); }
  function planterAt(g, x, z, col) { M(BOX(0.8, 0.5, 0.8), toon('#4a4560'), x, 0.25, z, g, 0.02); M(BOX(0.9, 0.08, 0.9), toon(col), x, 0.52, z, g, 0.012); M(new THREE.IcosahedronGeometry(0.45, 1), toon('#3f8a46'), x, 0.9, z, g, 0.025, 0.45); for (let i = 0; i < 4; i++) M(new THREE.SphereGeometry(0.07, 6, 4), toon(['#ffd04a', '#ff8fb0', '#ffffff'][i % 3]), x + rr(-0.3, 0.3), 1.1 + rr(-0.1, 0.15), z + rr(-0.3, 0.3), g, 0); }
  const smokes = [];
  function pagodaRoof(g, w, d, y, col, tiers = 1) {
    const rm = toon(col), tr = toon('#2a2f3a');
    for (let t = 0; t < tiers; t++) { const s2 = 1 - t * 0.3, ww = (w + 2.2) * s2, dd = (d + 2.2) * s2, hy = y + t * 2.6;
      M(hipRoof(ww, dd, 2.0 + Math.min(ww, dd) * 0.08, 0), rm, 0, hy, 0, g, 0.05);
      M(BOX(ww + 0.1, 0.16, 0.2), tr, 0, hy, dd / 2, g, 0); M(BOX(ww + 0.1, 0.16, 0.2), tr, 0, hy, -dd / 2, g, 0); M(BOX(0.2, 0.16, dd + 0.1), tr, ww / 2, hy, 0, g, 0); M(BOX(0.2, 0.16, dd + 0.1), tr, -ww / 2, hy, 0, g, 0);
      for (const [x, z] of [[ww / 2, dd / 2], [-ww / 2, dd / 2], [ww / 2, -dd / 2], [-ww / 2, -dd / 2]]) { const tip = M(new THREE.ConeGeometry(0.16, 0.8, 5), tr, x, hy + 0.22, z, g, 0); tip.rotation.set(Math.sign(z) * 0.95, 0, -Math.sign(x) * 0.95); }
      if (t < tiers - 1) M(BOX(ww * 0.6, 2.2, dd * 0.6), toon('#f3eee2'), 0, hy + 1.6, 0, g, 0.04); }
    const ridgeY = y + (tiers - 1) * 2.6 + 2.0 + Math.min((w + 2.2) * (1 - (tiers - 1) * 0.3), (d + 2.2) * (1 - (tiers - 1) * 0.3)) * 0.08;
    for (const s2 of [-1, 1]) { const o = M(new THREE.ConeGeometry(0.22, 0.7, 6), GOLD, s2 * Math.max(0.6, Math.abs(w - d) / 2 * (1 - (tiers - 1) * 0.3)), ridgeY + 0.2, 0, g, 0.01); o.rotation.z = s2 * 0.5; }
  }

  function buildBuilding(b) {
    const z = b.z, A0 = ARCH[THEME_OF(z)] || ARCH[W8] || ARCH.gaya, hv = ((Math.round(b.x0) * 73856093) ^ (Math.round(b.y0) * 19349663)) >>> 0;
    const A = b.filler ? { ...A0, base: shade(A0.base, 0.86 + (hv % 5) * 0.06), roofCol: shade(A0.roofCol, 0.8 + (hv % 4) * 0.1), shutter: A0.shutter && (hv % 3 === 0 ? shade(A0.shutter, 1.3) : A0.shutter) } : A0;
    const w = (b.x1 - b.x0) * S, d = (b.y1 - b.y0) * S, [cx, cz] = toW(z, (b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2);
    const g = new THREE.Group(); g.position.set(cx, 0, cz); scene.add(g); camBlockers.push(g);
    const rot = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 }[b.face]; g.rotation.y = rot;
    const fw = (b.face === 'N' || b.face === 'S') ? w : d, fd = (b.face === 'N' || b.face === 'S') ? d : w, f = fd / 2;
    let doorX = 0; if (b.door) { const [dX, dZ] = toW(z, b.door[0], b.door[1]); const lp = new THREE.Vector3(dX - cx, 0, dZ - cz).applyAxisAngle(new THREE.Vector3(0, 1, 0), -rot); doorX = clamp(lp.x, -fw / 2 + 1.4, fw / 2 - 1.4); }
    const big = fw * fd > 140, h = b.filler ? clamp(4.0 + (hv % 4) * 1.3, 4.2, 8.5) : clamp(3.8 + Math.min(fw, fd) * 0.22, 4.2, A.roof === 'false' ? 6.2 : 8.5);
    const trim = toon(A.trim), stone = toon(A.stone), sh = A.shutter ? toon(A.shutter) : null, acc = A.accent;
    const lift = A.stilts ? 0.9 : 0;
    // body
    M(BOX(fw, h, fd), wallMat(A, Math.max(1, fw / 2.2), Math.max(1, h / 2.2)), 0, lift + h / 2, 0, g, 0.06);
    if (A.stilts) { for (const sx of [-1, 1]) for (const sz of [-1, 0, 1]) M(new THREE.CylinderGeometry(0.16, 0.18, lift + 0.2, 6), toon('#6b4a35'), sx * (fw / 2 - 0.3), lift / 2, sz * (fd / 2 - 0.3), g, 0.02); M(BOX(fw + 1.4, 0.16, fd + 1.4), toon('#a8844f'), 0, lift, 0, g, 0.03); }
    else M(BOX(fw + 0.5, 0.4, fd + 0.5), stone, 0, 0.2, 0, g, 0.03);
    if (A.timber) { const tb = toon(A.trim); for (let i = 0; i <= Math.max(2, Math.round(fw / 2.2)); i++) M(BOX(0.18, h, 0.1), tb, -fw / 2 + i * fw / Math.max(2, Math.round(fw / 2.2)), h / 2, f + 0.03, g, 0); M(BOX(fw, 0.18, 0.1), tb, 0, h * 0.5, f + 0.04, g, 0); M(BOX(fw, 0.18, 0.1), tb, 0, 0.5, f + 0.04, g, 0); }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { if (A.columns) M(new THREE.CylinderGeometry(0.32, 0.36, h, 12), trim, sx * (fw / 2 + 0.05), lift + h / 2, sz * (fd / 2 + 0.05), g, 0.03, 0.36); else M(BOX(0.4, h + 0.1, 0.4), trim, sx * (fw / 2 + 0.02), lift + (h + 0.1) / 2, sz * (fd / 2 + 0.02), g, 0.025); }
    if (A.columns) for (let i = 1; i < Math.floor(fw / 3); i++) M(new THREE.CylinderGeometry(0.28, 0.32, h * 0.92, 12), trim, -fw / 2 + i * fw / Math.floor(fw / 3), h * 0.46, f + 0.9, g, 0.03, 0.32);
    if (A.roof !== 'pagoda' && A.roof !== 'thatch') M(BOX(fw + 0.45, 0.22, fd + 0.45), trim, 0, lift + h - 0.11, 0, g, 0.02);
    if (h > 6.2 && A.roof !== 'pagoda') M(BOX(fw + 0.12, 0.16, fd + 0.12), trim, 0, lift + h * 0.5, 0, g, 0.012);
    // roof
    const roofT = texMat('shingle', A.roofCol, Math.max(1, fw / 3), 1.5);
    if (A.roof === 'pitch') { const rh = Math.min(3.4, fd * 0.45), roof = M(prism(fd + 1.2, rh, fw + 0.8), roofT, 0, lift + h, 0, g, 0); roof.rotation.y = Math.PI / 2; const ro = new THREE.Mesh(roof.geometry, outlineMat); ro.scale.set(1.02, 1.03, 1.01); roof.add(ro); M(BOX(fw + 1.0, 0.18, 0.3), trim, 0, lift + h + rh, 0, g, 0.015);
      if (A.chimney) { const ch = M(BOX(0.8, 2.4, 0.8), toon('#7a5446'), fw * 0.3, lift + h + 1.4, -fd * 0.15, g, 0.04); smokes.push({ x: cx, z: cz, g, y: lift + h + 2.7, lx: fw * 0.3, lz: -fd * 0.15 }); } }
    else if (A.roof === 'thatch') { M(hipRoof(fw + 1.8, fd + 1.8, 3.4), toon(A.roofCol), 0, lift + h - 0.2, 0, g, 0.05); }
    else if (A.roof === 'pagoda') pagodaRoof(g, fw, fd, h, A.roofCol, big ? 2 : 1);
    else if (A.roof === 'false') { M(BOX(fw + 0.3, 2.2, 0.35), wallMat(A, fw / 2.2, 1), 0, h + 1.1, f - 0.1, g, 0.04); M(BOX(fw + 0.6, 0.25, 0.5), trim, 0, h + 2.25, f - 0.1, g, 0.02); M(BOX(fw + 0.2, 0.3, fd), toon(A.roofCol), 0, h + 0.15, 0, g, 0.03); }
    else { M(BOX(fw - 0.2, 0.1, fd - 0.2), toon(A.roofCol), 0, lift + h + 0.05, 0, g, 0);
      if (A.crenel) for (let i = 0; i < Math.floor(fw / 1.1); i++) for (const sz of [-1, 1]) M(BOX(0.55, 0.55, 0.3), trim, -fw / 2 + 0.55 + i * 1.1, lift + h + 0.3, sz * (fd / 2 - 0.1), g, 0.012);
      else { for (const sz of [-1, 1]) M(BOX(fw + 0.3, 0.5, 0.25), trim, 0, lift + h + 0.25, sz * (fd / 2 + 0.05), g, 0.015); for (const sx of [-1, 1]) M(BOX(0.25, 0.5, fd + 0.3), trim, sx * (fw / 2 + 0.05), lift + h + 0.25, 0, g, 0.015); }
      if (A.dome && big) { M(new THREE.CylinderGeometry(Math.min(fw, fd) * 0.28, Math.min(fw, fd) * 0.28, 0.8, 24), trim, 0, lift + h + 0.4, -fd * 0.1, g, 0.03); M(new THREE.SphereGeometry(Math.min(fw, fd) * 0.27, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(acc), 0, lift + h + 0.8, -fd * 0.1, g, 0.04, Math.min(fw, fd) * 0.27); M(new THREE.ConeGeometry(0.12, 0.8, 6), GOLD, 0, lift + h + 0.8 + Math.min(fw, fd) * 0.27 + 0.3, -fd * 0.1, g, 0); }
      else if (!LOWQ) for (let i = 0; i < 2; i++) { const vx = (i - 0.5) * fw * 0.4, vz = -fd * 0.2; M(BOX(0.9, 0.5, 0.7), toon('#8a94a8'), vx, lift + h + 0.35, vz, g, 0.02); } }
    // front: door + frame + gem, step, sconces, windows, planters, awning, sign
    const fy = lift;
    if (A.timber) { const sj = glowing('#fff3dc', null, 0.6); M(BOX(2.0, 2.6, 0.12), sj, doorX, fy + 1.3, f + 0.06, g, 0.03); for (let i = 1; i < 4; i++) M(BOX(0.05, 2.6, 0.14), INK, doorX - 1 + i * 0.5, fy + 1.3, f + 0.08, g, 0); for (let i = 1; i < 5; i++) M(BOX(2.0, 0.05, 0.14), INK, doorX, fy + i * 0.52, f + 0.08, g, 0); }
    else M(BOX(2.0, 2.6, 0.2), WOOD, doorX, fy + 1.3, f + 0.06, g, 0.04);
    M(BOX(0.22, 2.8, 0.3), trim, doorX - 1.15, fy + 1.4, f + 0.08, g, 0.015); M(BOX(0.22, 2.8, 0.3), trim, doorX + 1.15, fy + 1.4, f + 0.08, g, 0.015); M(BOX(2.55, 0.3, 0.32), trim, doorX, fy + 2.85, f + 0.08, g, 0.015);
    M(new THREE.OctahedronGeometry(0.16, 0), glowing(acc, null, 1.2), doorX, fy + 2.85, f + 0.27, g, 0.01).scale.set(1, 1.2, 0.5);
    if (A.stilts) { for (let k = 0; k < 3; k++) M(BOX(1.6, 0.14, 0.45), toon('#a8844f'), doorX, lift - 0.25 - k * 0.3, f + 0.9 + k * 0.45, g, 0.012); }
    else { M(BOX(2.6, 0.14, 0.8), stone, doorX, 0.07, f + 0.55, g, 0.015); M(BOX(2.2, 0.14, 0.5), stone, doorX, 0.21, f + 0.4, g, 0.015); }
    sconce(g, doorX - 1.65, fy + 2.4, f + 0.02); sconce(g, doorX + 1.65, fy + 2.4, f + 0.02);
    const nwin = Math.max(0, Math.floor((fw - 4.2) / 2.4));
    for (let i = 0; i < nwin; i++) { const x = -fw / 2 + 1.4 + (i + 0.5) * (fw - 2.8) / nwin; if (Math.abs(x - doorX) < 2.0) continue; winAt(g, x, fy + 1.9, f + 0.06, 0, trim, sh); if (h > 6.2) winAt(g, x, fy + h * 0.72, f + 0.06, 0, trim, sh); }
    if (!LOWQ) { const ns = Math.max(1, Math.floor(fd / 3.2)); for (let i = 0; i < ns; i++) { const zz = -fd / 2 + (i + 0.5) * fd / ns; winAt(g, fw / 2 + 0.06, fy + h * 0.5, zz, Math.PI / 2, trim, sh); winAt(g, -fw / 2 - 0.06, fy + h * 0.5, zz, -Math.PI / 2, trim, sh); } }
    if (A.timber) [-fw / 2 + 0.9, fw / 2 - 0.9].filter(px => Math.abs(px - doorX) > 2.4).forEach(px => stoneLantern(g, px, f + 0.9));
    else if (!A.stilts) [-fw / 2 + 0.9, fw / 2 - 0.9].filter(px => Math.abs(px - doorX) > 2.4).forEach(px => planterAt(g, px, f + 0.9, acc));
    if (A.awning || A.porch) { const aw = Math.min(fw - 0.6, 5.5); const n = 8; for (let i = 0; i < n; i++) { const st = M(BOX(aw / n, 0.08, 1.7), toon(A.awning ? A.awning[i % 2] : A.roofCol), doorX - aw / 2 + (i + 0.5) * aw / n, fy + 3.3, f + 0.8, g, 0.012); st.rotation.x = 0.32; } if (A.porch) for (const sx of [-1, 1]) M(BOX(0.18, 3.3, 0.18), trim, doorX + sx * (aw / 2 - 0.1), fy + 1.65, f + 1.55, g, 0.015); }
    if (A.neon) { const nc = ['#ff3fa4', '#5fe1ff', '#ffd23a', '#7dff9a'][hv % 4]; M(BOX(fw + 0.1, 0.14, 0.1), glowing(nc, null, 2.2), 0, h - 0.4, f + 0.08, g, 0); M(BOX(fw + 0.1, 0.14, 0.1), glowing('#5fe1ff', null, 2.2), 0, 0.5, f + 0.08, g, 0);
      for (const sx of [-1, 1]) M(BOX(0.14, h, 0.1), glowing(nc, null, 2.2), sx * (fw / 2 + 0.05), h / 2, f + 0.08, g, 0);
      if (!LOWQ) { const bw = Math.min(fw * 0.8, 9); const t = signTex((b.label || ['SLOTS', 'BUFFET', 'SHOWS', 'LOUNGE', 'POKER'][hv % 5]).toUpperCase().slice(0, 12), null, nc); for (const sx of [-1, 1]) M(BOX(0.25, 2.4, 0.25), DARK, sx * bw * 0.4, h + 1.2, 0, g, 0.01); M(BOX(bw, bw / 4, 0.3), [DARK, DARK, DARK, DARK, glowing(0, t, 2.0), glowing(0, t, 2.0)], 0, h + 2.4 + bw / 8, 0, g, 0.03); } }
    if (A.timber) { for (const sx of [-1, 1]) paperLantern(g, doorX + sx * 1.6, fy + 2.9, f + 0.45); M(BOX(2.2, 0.9, 0.04), toon(A.accent), doorX, fy + 2.45, f + 0.2, g, 0); }
    else if (fw > 7 && !A.neon) { banner(g, -fw / 2 + 0.9, fy + 3.4, f + 0.12); banner(g, fw / 2 - 0.9, fy + 3.4, f + 0.12); }
    const label = String(b.label || '').toUpperCase();
    if (label) { const t = signTex(label.length > 14 ? label.slice(0, 14) : label, null, A.neon ? acc : (ST.trim || '#d9a64a')); const sw = clamp(fw * 0.5, 3, 6.5); const sy = Math.min(fy + h - 0.7, fy + 4.2); M(BOX(sw, sw / 4, 0.18), [DARK, DARK, DARK, DARK, glowing(0, t, 1.3), DARK], doorX * 0.4, A.roof === 'false' ? h + 1.1 : sy, f + (A.roof === 'false' ? 0.15 : 0.14), g, 0.03); }
    if (/church|chapel|cathedral|abbey/i.test(b.label || '') && !A.timber) {   // a steeple with the world's crystal on top
      const tw = Math.min(4.2, fw * 0.32), th = h + 7, tz = -fd / 2 + tw / 2 + 0.2;
      M(BOX(tw, th, tw), wallMat(A, 1.5, th / 2.2), 0, th / 2, tz, g, 0.05); M(BOX(tw + 0.3, 0.3, tw + 0.3), trim, 0, th, tz, g, 0.02);
      for (const s2 of [-1, 1]) { M(BOX(0.7, 1.6, 0.12), glowing(acc, null, 1.3), s2 * 0, th - 2.2, tz + s2 * (tw / 2 + 0.02), g, 0); }
      M(new THREE.ConeGeometry(tw * 0.78, 4.2, 4), toon(A.roofCol), 0, th + 2.1, tz, g, 0.05).rotation.y = Math.PI / 4;
      const cr = M(new THREE.OctahedronGeometry(0.7, 0), glowing(acc, null, 2.2), 0, th + 5.0, tz, g, 0.03); cr.scale.y = 1.6; cr.userData.keep = true; glowSprite(0, th + 5.0, tz, new THREE.Color(acc).getHex(), 6, g);
      // a rose window over the door
      const rw = new THREE.Mesh(new THREE.CircleGeometry(1.0, 24), glowing(acc, null, 1.4)); rw.position.set(doorX, h * 0.72, f + 0.07); g.add(rw); M(new THREE.TorusGeometry(1.0, 0.12, 6, 24), trim, doorX, h * 0.72, f + 0.08, g, 0);
    }
    colliders.push({ box: [cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2], h: lift + h + (/church|chapel|cathedral|abbey/i.test(b.label || '') ? 12 : 0) + (A.roof === 'pitch' || A.roof === 'thatch' ? 2.4 : A.roof === 'pagoda' ? 3 : 0.6) });
    bake(g);
  }
  for (const b of buildings) buildBuilding(b);
  // ---------------------------------------------------------------- CASTLES: a gatehouse at every castle gate, the keep behind it
  const CASTLE = {
    gaya:   { stone: '#cfc6de', dark: '#8a80a0', roof: '#5b4386', top: 'cone', crystal: '#58d8ff' },
    player: { stone: '#c9c4bc', dark: '#8a847c', roof: '#8a3a3a', top: 'cone' },
    nebo:   { stone: '#8a7a62', dark: '#5a4a38', roof: '#3f6b4a', top: 'cone', wood: true },
    kufa:   { stone: '#e3c79a', dark: '#b08a5a', roof: '#2f6a8a', top: 'dome' },
    ur:     { stone: '#c8805a', dark: '#8a4a32', roof: '#e8963a', top: 'flat' },
    luxor:  { stone: '#b0503e', dark: '#6a2a22', roof: '#e6b45a', top: 'flat' },
    zion:   { stone: '#a87a4a', dark: '#6a4a2a', roof: '#6a4630', top: 'fort' },
    jidda:  { stone: '#f2ecdc', dark: '#a8a090', roof: '#2f8a7a', top: 'cone' },
  };
  function tower(g, x, z, r, h, C, top) {
    const st = toon(C.stone), dk = toon(C.dark);
    if (top === 'fort') { M(new THREE.CylinderGeometry(r, r, h, 10), st, x, h / 2, z, g, 0.04, r); M(BOX(r * 2.4, 0.3, r * 2.4), dk, x, h + 1.4, z, g, 0.03); for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) M(BOX(0.25, 1.6, 0.25), dk, x + a * r, h + 0.6, z + b * r, g, 0); M(hipRoof(r * 2.6, r * 2.6, 1.6), toon(C.roof), x, h + 1.55, z, g, 0.03); return; }
    M(new THREE.CylinderGeometry(r, r * 1.08, h, 16), st, x, h / 2, z, g, 0.05, r * 1.08);
    M(new THREE.CylinderGeometry(r * 1.18, r * 1.18, 0.5, 16), dk, x, h, z, g, 0.03, r * 1.18);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; M(BOX(0.6, 0.7, 0.5), st, x + Math.cos(a) * r * 1.05, h + 0.6, z + Math.sin(a) * r * 1.05, g, 0.015).rotation.y = -a; }
    for (let k = 0; k < 3; k++) M(BOX(0.35, 0.9, 0.1), glowing('#ffcf8a', null, 1.2), x + Math.sin(k * 2.1) * (r + 0.02), h * (0.35 + k * 0.2), z + Math.cos(k * 2.1) * (r + 0.02), g, 0).rotation.y = k * 2.1;
    if (top === 'cone') { M(new THREE.ConeGeometry(r * 1.3, r * 2.6, 16), toon(C.roof), x, h + 0.25 + r * 1.3, z, g, 0.05, r * 1.3); const pole = M(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), DARK, x, h + r * 2.6 + 1.3, z, g, 0); const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), toon(ST.accent || '#c42d3c', { side: THREE.DoubleSide })); fl.position.set(x + 0.72, h + r * 2.6 + 2.0, z); g.add(fl); }
    else if (top === 'dome') { M(new THREE.SphereGeometry(r * 1.05, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(C.roof), x, h + 0.25, z, g, 0.04, r * 1.05); M(new THREE.ConeGeometry(0.3, 1.6, 8), GOLD, x, h + 0.25 + r * 1.05 + 0.6, z, g, 0.02); }
  }
  function castleWest(g, C) {
    const st = toon(C.stone), dk = toon(C.dark);
    if (C.top === 'fort') {   // a timber stockade fort
      for (let i = -14; i <= 14; i++) { if (Math.abs(i) < 2) continue; M(new THREE.CylinderGeometry(0.32, 0.36, 6 + (i % 2) * 0.4, 7), st, i * 0.7, 3.1, 0, g, 0.02, 0.36); M(new THREE.ConeGeometry(0.34, 0.7, 7), st, i * 0.7, 6.5 + (i % 2) * 0.4, 0, g, 0); }
      M(BOX(3.2, 0.5, 0.6), dk, 0, 5.6, 0, g, 0.03); const t = signTex('FORT', null, '#e8cf4a'); M(BOX(3.0, 0.8, 0.12), [dk, dk, dk, dk, glowing(0, t, 1.2), dk], 0, 6.4, 0.3, g, 0.02);
      for (const s2 of [-1, 1]) tower(g, s2 * 11, -1, 2.2, 8.5, C, 'fort');
      M(BOX(14, 7, 10), texMat('plank', C.stone, 6, 3), 0, 3.5, -12, g, 0.05); M(hipRoof(15, 11, 3), toon(C.roof), 0, 7, -12, g, 0.05); return;
    }
    // curtain wall + gatehouse
    for (const s2 of [-1, 1]) { M(BOX(18, 8, 2.4), texMat('stone', C.stone, 7, 3), s2 * 12.5, 4, -0.6, g, 0.05); for (let i = 0; i < 12; i++) M(BOX(0.9, 0.9, 2.6), st, s2 * (4.4 + i * 1.5), 8.45, -0.6, g, 0.015); }
    M(BOX(8, 11, 4.4), texMat('stone', C.stone, 3, 4), 0, 5.5, 0, g, 0.06);
    const arch = M(BOX(3.4, 4.6, 0.2), toon('#120c14'), 0, 2.3, 2.22, g, 0); M(new THREE.CylinderGeometry(1.7, 1.7, 0.2, 20, 1, false, 0, Math.PI), toon('#120c14'), 0, 4.6, 2.22, g, 0).rotation.set(Math.PI / 2, 0, Math.PI / 2);
    for (let i = -3; i <= 3; i++) M(BOX(0.08, 4.4, 0.08), toon('#5a5560'), i * 0.45, 2.6, 2.3, g, 0); for (let k = 0; k < 5; k++) M(BOX(3.2, 0.08, 0.08), toon('#5a5560'), 0, 0.8 + k * 0.85, 2.3, g, 0);
    for (let i = 0; i < 5; i++) M(BOX(1.0, 1.0, 4.6), st, -3.5 + i * 1.75, 11.5, 0, g, 0.015);
    const t = signTex(String(D.name).toUpperCase() + ' CASTLE', null, ST.trim || '#e6b45a'); M(BOX(5.6, 1.2, 0.16), [dk, dk, dk, dk, glowing(0, t, 1.3), dk], 0, 7.8, 2.3, g, 0.02);
    for (const s2 of [-1, 1]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.2), bannerM); b.position.set(s2 * 2.9, 6.8, 2.26); g.add(b); }
    for (const s2 of [-1, 1]) tower(g, s2 * 4.8, 0.6, 2.6, 13, C, C.top);
    for (const s2 of [-1, 1]) tower(g, s2 * 22, -0.6, 2.4, 11, C, C.top);
    // the keep
    M(BOX(14, 18, 12), texMat('stone', C.stone, 5, 7), 0, 9, -16, g, 0.06); for (let i = 0; i < 8; i++) for (const sz of [-1, 1]) M(BOX(1.0, 1.0, 1.0), st, -6.3 + i * 1.8, 18.5, -16 + sz * 5.6, g, 0.015);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) M(BOX(0.8, 1.3, 0.1), glowing('#ffcf8a', null, 1.2), -4.5 + i * 3, 5 + r * 4.5, -9.95, g, 0);
    for (const [x, z] of [[7, -10], [-7, -10], [7, -22], [-7, -22]]) tower(g, x, z, 2.0, 22, C, C.top);
    if (C.top === 'flat') { M(BOX(6, 4, 6), texMat('stone', C.stone, 2, 2), 0, 20, -16, g, 0.04); M(new THREE.CylinderGeometry(0.06, 0.06, 4, 6), DARK, 0, 24, -16, g, 0); const fl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.2), toon(ST.accent || '#c42d3c', { side: THREE.DoubleSide })); fl.position.set(1.1, 25.2, -16); g.add(fl); }
    if (C.crystal) { const cr = M(new THREE.OctahedronGeometry(1.4, 0), glowing(C.crystal, null, 2.4), 0, 24, -16, g, 0.04); cr.scale.y = 1.7; cr.userData.keep = true; glowSprite(0, 24, -16, 0x58d8ff, 12, g); }
  }
  for (const z of zones) {
    if (isKyo(z.key) || !CASTLE[W8]) continue;
    const gs = z.spots && z.spots.castleGate; if (!gs || !/castle/i.test(z.key)) continue;
    const [cx0, cz0] = center(z); const r = gs.r || [gs.p[0] - 100, gs.p[1] - 100, gs.p[0] + 100, gs.p[1] + 100];
    const [gx, gz] = toW(z, gs.p[0], gs.p[1]); let dx = gx - cx0, dz = gz - cz0; if (Math.abs(dx) > Math.abs(dz)) { dx = Math.sign(dx); dz = 0; } else { dz = Math.sign(dz); dx = 0; }
    const half = (Math.abs(dz) ? (r[3] - r[1]) : (r[2] - r[0])) * S / 2;
    const g = new THREE.Group(); g.position.set(gx + dx * (half + 2.4), 0, gz + dz * (half + 2.4)); g.rotation.y = Math.atan2(-dx, -dz); scene.add(g); camBlockers.push(g);
    castleWest(g, CASTLE[W8]); bake(g);
    const p0 = g.position; colliders.push({ box: [p0.x - (Math.abs(dz) ? 26 : 4), p0.x + (Math.abs(dz) ? 26 : 4), p0.z - (Math.abs(dx) ? 26 : 4), p0.z + (Math.abs(dx) ? 26 : 4)], h: 12 });
    z.castleBuilt = true; KEEP_OUT.push([p0.x, p0.z, 34]);
  }
  { const out = p => KEEP_OUT.some(([x, z, r]) => Math.hypot(p.x - x, p.z - z) < r); for (const L of [treeSpots, rockSpots, tuftSpots]) for (let i = L.length - 1; i >= 0; i--) if (out(L[i])) L.splice(i, 1); }
  // trees, rocks, lamp posts — the Meru look: trunks + layered canopies, all instanced
  function mergeGeo(parts) {
    const pos = [], nor = [], m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), nm = new THREE.Matrix3();
    for (const p of parts) { const g = p.geo.index ? p.geo.toNonIndexed() : p.geo.clone(); e.set(...(p.rot || [0, 0, 0])); q.setFromEuler(e); m4.compose(new THREE.Vector3(...(p.pos || [0, 0, 0])), q, new THREE.Vector3(...(p.scale || [1, 1, 1]))); g.applyMatrix4(m4); pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); }
    const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); out.computeBoundingSphere(); return out;
  }
  const TREE = {
    snowpine: () => TREE.pine(),
    puff: () => ({ trunk: null, top: mergeGeo([{ geo: new THREE.IcosahedronGeometry(1.9, 1), pos: [0, 0.9, 0] }, { geo: new THREE.IcosahedronGeometry(1.3, 1), pos: [1.5, 0.6, 0.6] }, { geo: new THREE.IcosahedronGeometry(1.2, 1), pos: [-1.2, 0.7, -0.8] }, { geo: new THREE.IcosahedronGeometry(1.0, 1), pos: [0.3, 2.1, -0.5] }]) }),
    stump: () => ({ trunk: mergeGeo([{ geo: new THREE.CylinderGeometry(0.42, 0.55, 0.6, 9), pos: [0, 0.3, 0] }, { geo: new THREE.CylinderGeometry(0.1, 0.16, 0.7, 5), pos: [0.5, 0.15, 0.1], rot: [0, 0, 1.3] }]), top: mergeGeo([{ geo: new THREE.CylinderGeometry(0.4, 0.4, 0.04, 9), pos: [0, 0.62, 0] }]), trunkCol: '#6b4a35' }),
    pine: () => ({ trunk: mergeGeo([{ geo: new THREE.CylinderGeometry(0.2, 0.3, 1.6, 7), pos: [0, 0.8, 0] }]), top: mergeGeo([{ geo: new THREE.ConeGeometry(1.6, 2.8, 7), pos: [0, 2.6, 0] }, { geo: new THREE.ConeGeometry(1.15, 2.3, 7), pos: [0, 4.1, 0] }, { geo: new THREE.ConeGeometry(0.7, 1.5, 7), pos: [0, 5.3, 0] }]), trunkCol: '#6b4a32' }),
    broad: () => ({ trunk: mergeGeo([{ geo: new THREE.CylinderGeometry(0.22, 0.34, 2.2, 7), pos: [0, 1.1, 0] }, { geo: new THREE.CylinderGeometry(0.08, 0.12, 1.2, 5), pos: [0.45, 2.1, 0], rot: [0, 0, -0.7] }]), top: mergeGeo([{ geo: new THREE.IcosahedronGeometry(1.55, 1), pos: [0, 3.2, 0] }, { geo: new THREE.IcosahedronGeometry(1.05, 1), pos: [1.0, 2.7, 0.4] }, { geo: new THREE.IcosahedronGeometry(0.95, 1), pos: [-0.8, 2.8, -0.6] }]), trunkCol: '#6b4a32' }),
    palm: () => { const seg = []; for (let k = 0; k < 6; k++) seg.push({ geo: new THREE.CylinderGeometry(0.17 - k * 0.012, 0.22 - k * 0.012, 0.85, 7), pos: [Math.pow(k / 6, 2) * 0.9, 0.42 + k * 0.78, 0], rot: [0, 0, -0.06 - k * 0.035] });
      const fr = []; for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; fr.push({ geo: new THREE.ConeGeometry(0.38, 2.6, 4), pos: [0.9 + Math.cos(a) * 1.05, 4.75, Math.sin(a) * 1.05], rot: [Math.sin(a) * 1.25, 0, -Math.cos(a) * 1.25], scale: [1, 1, 0.3] }); }
      fr.push({ geo: new THREE.IcosahedronGeometry(0.35, 0), pos: [0.9, 4.75, 0] });
      return { trunk: mergeGeo(seg), top: mergeGeo(fr), trunkCol: '#9a7650' }; },
    cactus: () => ({ trunk: null, top: mergeGeo([{ geo: new THREE.CapsuleGeometry(0.34, 2.6, 4, 8), pos: [0, 1.6, 0] }, { geo: new THREE.CapsuleGeometry(0.2, 0.8, 4, 8), pos: [0.55, 1.5, 0], rot: [0, 0, Math.PI / 2] }, { geo: new THREE.CapsuleGeometry(0.2, 0.9, 4, 8), pos: [0.85, 2.05, 0] }, { geo: new THREE.CapsuleGeometry(0.18, 0.6, 4, 8), pos: [-0.5, 1.9, 0], rot: [0, 0, Math.PI / 2] }, { geo: new THREE.CapsuleGeometry(0.18, 0.7, 4, 8), pos: [-0.75, 2.35, 0] }]), trunkCol: null }),
    sakura: () => ({ trunk: mergeGeo([{ geo: new THREE.CylinderGeometry(0.2, 0.32, 2.0, 7), pos: [0, 1.0, 0], rot: [0, 0, 0.12] }, { geo: new THREE.CylinderGeometry(0.1, 0.15, 1.6, 5), pos: [0.55, 2.2, 0], rot: [0, 0, -0.8] }, { geo: new THREE.CylinderGeometry(0.1, 0.14, 1.4, 5), pos: [-0.5, 2.2, 0.2], rot: [0.2, 0, 0.8] }]), top: mergeGeo([{ geo: new THREE.IcosahedronGeometry(1.25, 1), pos: [0.2, 3.1, 0], scale: [1.3, 0.8, 1.2] }, { geo: new THREE.IcosahedronGeometry(1.0, 1), pos: [1.3, 2.75, 0.2], scale: [1.2, 0.75, 1.1] }, { geo: new THREE.IcosahedronGeometry(0.95, 1), pos: [-1.1, 2.8, -0.3], scale: [1.2, 0.75, 1.1] }]), trunkCol: '#4a3530' }),
  };
  const FOLIAGE = { snowpine: ['#e4ecf3', '#d3dfe9', '#2f6a4a', '#eef3f8', '#c7d6e2'], puff: ['#3f8a46', '#4f9a4a', '#5a9a3a', '#2f7a3e', '#6aa848'], stump: ['#d8b88a', '#c9a46a', '#e0c49a'], pine: ['#2f6e4a', '#3a7f52', '#2a6444'], broad: ['#3f8a46', '#4f9a4a', '#5a9a3a', '#6aa848', '#2f7a3e'], palm: ['#3f9a4e', '#4fae58', '#5bb860'], cactus: ['#4f8a45', '#5c9a4a', '#4a7f42'], sakura: ['#f4b6c8', '#f7c9d6', '#eaa0b8', '#ffd6e2'] };
  for (const z of zones) { const inZ = p => p.x >= z.bx - 2 && p.x <= z.bx + z.w * S + 2 && p.z >= z.bz - 2 && p.z <= z.bz + z.h * S + 2;
    if (z.canopy) for (const p of treeSpots) if (inZ(p)) { p.kind = 'puff'; p.s *= 1.15; }
    if (z.snow) for (const p of treeSpots) if (inZ(p) && (!p.kind || p.kind === 'pine' || p.kind === 'broad')) p.kind = 'snowpine';
    if (z.stumps) for (const p of treeSpots) if (inZ(p) && Math.hypot(p.x - z.stumps[0], p.z - z.stumps[1]) < z.stumps[2]) p.kind = 'stump'; }
  const byKind = {}; for (const p of treeSpots) (byKind[p.kind || VEG.kind] = byKind[p.kind || VEG.kind] || []).push(p);
  for (const [kind, list] of Object.entries(byKind)) {
    const mk = TREE[kind] || TREE.pine; const T2 = mk(); const cols = FOLIAGE[kind] || FOLIAGE.pine;
    const tol = nearCut(outlineMat.clone());
    if (T2.trunk) instanced(T2.trunk, nearCut(new THREE.MeshToonMaterial({ color: T2.trunkCol, gradientMap: grad })), list, tol);
    instanced(T2.top, nearCut(new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: grad })), list, kind !== 'palm' ? tol : false, list.map((p, i) => new THREE.Color(cols[(i * 7 + 3) % cols.length])));
  }
  // grass tufts and flowers on the wild ground near the paths
  if (tuftSpots.length) {
    const tg = mergeGeo([{ geo: new THREE.ConeGeometry(0.07, 0.42, 3), pos: [0, 0.21, 0] }, { geo: new THREE.ConeGeometry(0.06, 0.34, 3), pos: [0.1, 0.17, 0.05], rot: [0, 0, -0.3] }, { geo: new THREE.ConeGeometry(0.06, 0.36, 3), pos: [-0.09, 0.18, -0.04], rot: [0.2, 0, 0.3] }]);
    const gc = [shade(ST.wild || '#5f8048', 1.0), shade(ST.wild || '#5f8048', 1.2), shade(ST.ground || '#7d9a5e', 0.85), '#6aa848'].map(c => new THREE.Color(c));
    const tl = tuftSpots.filter(t => !t.fl), fl = tuftSpots.filter(t => t.fl);
    { const im = new THREE.InstancedMesh(tg, toon('#ffffff'), tl.length), m4 = new THREE.Matrix4(); tl.forEach((p, i) => { m4.makeRotationY(p.r); m4.scale(new THREE.Vector3(p.s, p.s, p.s)); m4.setPosition(p.x, 0.02, p.z); im.setMatrixAt(i, m4); im.setColorAt(i, gc[i % gc.length]); }); scene.add(im); }
    if (fl.length) { const fc = ['#ffffff', '#ffd04a', '#ff8fb0', '#b9a0ff'].map(c => new THREE.Color(c)); const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.11, 0), toon('#ffffff'), fl.length), m4 = new THREE.Matrix4(); fl.forEach((p, i) => { m4.makeTranslation(p.x, 0.24, p.z); im.setMatrixAt(i, m4); im.setColorAt(i, fc[i % fc.length]); }); scene.add(im); }
  }
  if (VEG.water) {   // the lagoon: everything that is not path, pier or island is water
    for (const z of zones) { const w = new THREE.Mesh(new THREE.PlaneGeometry(z.w * S + 60, z.h * S + 60), new THREE.MeshToonMaterial({ color: ST.water || '#2bb6c8', gradientMap: grad, transparent: true, opacity: 0.88 })); w.rotation.x = -Math.PI / 2; w.position.set(z.bx + z.w * S / 2, 0.06, z.bz + z.h * S / 2); scene.add(w); z.waterMesh = w; }
  }
  { const cl = mergeGeo([{ geo: new THREE.DodecahedronGeometry(1, 0), pos: [0, 0.6, 0], scale: [1.1, 1.0, 1.0] }, { geo: new THREE.DodecahedronGeometry(0.8, 0), pos: [0.15, 1.5, 0.1], scale: [0.95, 0.9, 0.85] }, { geo: new THREE.DodecahedronGeometry(0.55, 0), pos: [-0.1, 2.2, -0.05], scale: [0.8, 0.9, 0.8] }]);
    const cliffCol = { luxor: '#7a3a2e', kufa: '#b88a5a', ur: '#a8704a', earth: '#b0643a', zion: '#9a7a5a', jidda: '#c9b48a' }[W8] || '#8a8478';
    const rockS = cliffSpots.filter(p => !p.bark), barkS = cliffSpots.filter(p => p.bark);
    instanced(cl, nearCut(new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: grad })), rockS.map(p => ({ ...p, y: 0 })), nearCut(outlineMat.clone()), rockS.map((p, i) => new THREE.Color(p.col || cliffCol).multiplyScalar(0.82 + (i % 5) * 0.06)));
    if (barkS.length) {   // the giant tree: bark ridges like buttress roots, leaf clouds on top
      const bk = mergeGeo([{ geo: new THREE.CylinderGeometry(0.62, 1.0, 3, 7), pos: [0, 1.5, 0] }, { geo: new THREE.CylinderGeometry(0.34, 0.6, 2.2, 6), pos: [0.55, 1.1, 0.3], rot: [0, 0, -0.12] }, { geo: new THREE.CylinderGeometry(0.3, 0.5, 2.6, 6), pos: [-0.5, 1.3, -0.25], rot: [0.1, 0, 0.1] }]);
      instanced(bk, nearCut(new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: grad })), barkS.map(p => ({ ...p, y: 0, sy: p.sy * 1.5 })), nearCut(outlineMat.clone()), barkS.map((p, i) => new THREE.Color(p.col).multiplyScalar(0.8 + (i % 5) * 0.07)));
      const tops = barkS.filter((p, i) => i % 3 === 0).map(p => ({ x: p.x + rr(-1, 1), z: p.z + rr(-1, 1), y: p.sy * 4.5 + rr(-0.5, 1), s: rr(1.4, 2.2), r: rr(0, 6) }));
      const lf = mergeGeo([{ geo: new THREE.IcosahedronGeometry(1.4, 1), pos: [0, 0, 0] }, { geo: new THREE.IcosahedronGeometry(1.0, 1), pos: [1.1, -0.3, 0.4] }, { geo: new THREE.IcosahedronGeometry(0.9, 1), pos: [-0.9, -0.2, -0.6] }]);
      instanced(lf, nearCut(new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: grad })), tops, nearCut(outlineMat.clone()), tops.map((p, i) => new THREE.Color(['#3f8a46', '#4f9a4a', '#2f7a3e', '#5a9a3a'][i % 4]))); }
    cliffSpots.forEach(p => colliders.push({ c: [p.x, p.z, 1.1 * p.s] }));
    const cg = mergeGeo([{ geo: new THREE.OctahedronGeometry(0.5, 0), pos: [0, 0.8, 0], scale: [0.6, 1.8, 0.6] }, { geo: new THREE.OctahedronGeometry(0.35, 0), pos: [0.4, 0.5, 0.1], scale: [0.6, 1.5, 0.6], rot: [0, 0, -0.4] }, { geo: new THREE.OctahedronGeometry(0.3, 0), pos: [-0.35, 0.45, -0.1], scale: [0.6, 1.4, 0.6], rot: [0, 0, 0.4] }]);
    const crc = W8 === 'luxor' ? '#ff7a3a' : W8 === 'player' ? '#9fffcf' : W8 === 'nebo' ? '#9fff5a' : '#58d8ff';
    instanced(cg, glowing(crc, null, 2.0), crystalSpots, false); crystalSpots.forEach((p, i) => { if (i % 2 === 0) glowSprite(p.x, 1.0, p.z, new THREE.Color(crc).getHex(), 3.2); }); }
  { const rk = mergeGeo([{ geo: new THREE.DodecahedronGeometry(0.7, 0), pos: [0, 0.3, 0], scale: [1, 0.7, 1] }, { geo: new THREE.DodecahedronGeometry(0.4, 0), pos: [0.75, 0.15, 0.2], scale: [1, 0.8, 1] }]);
    instanced(rk, toon(ST.rock || mixc(ST.ground || '#8a8478', '#7a7470', 0.6)), rockSpots.map(p => ({ ...p, y: 0 })), true); }
  { const pole = mergeGeo([{ geo: new THREE.CylinderGeometry(0.07, 0.11, 2.4, 8), pos: [0, 1.2, 0] }, { geo: new THREE.CylinderGeometry(0.2, 0.24, 0.16, 8), pos: [0, 0.08, 0] }, { geo: new THREE.ConeGeometry(0.3, 0.25, 4), pos: [0, 2.86, 0], rot: [0, Math.PI / 4, 0] }]);
    if (STL.length) { instanced(new THREE.CylinderGeometry(0.12, 0.18, 3.6, 8), toon('#5a6276'), STL.map(p => ({ ...p, y: 1.8 })), true); instanced(new THREE.CylinderGeometry(0.2, 0.2, 1.4, 10), glowing('#5fe1ff', null, 2.0), STL.map(p => ({ ...p, y: 3.1 })), false); STL.forEach(p => { glowSprite(p.x, 3.1, p.z, 0x5fe1ff, 2.2); colliders.push({ c: [p.x, p.z, 0.25] }); }); }
    const west = lampSpots.filter(p => !p.kyo), east = lampSpots.filter(p => p.kyo);
    instanced(pole, nearCut(new THREE.MeshToonMaterial({ color: '#1b1830', gradientMap: grad })), west.map(p => ({ ...p, y: 0, s: 1 })), nearCut(outlineMat.clone()));
    instanced(new THREE.BoxGeometry(0.32, 0.38, 0.32), nearCut(glowing('#ffd38a', null, 2.2)), west.map(p => ({ ...p, y: 2.55, s: 1 })), false);
    west.forEach(p => { glowSprite(p.x, 2.55, p.z, 0xffb060, 1.9); colliders.push({ c: [p.x, p.z, 0.22] }); });
    // Kyoto: stone lanterns (toro)
    const toro = mergeGeo([{ geo: BOX(0.7, 0.18, 0.7), pos: [0, 0.09, 0] }, { geo: new THREE.CylinderGeometry(0.14, 0.18, 0.9, 8), pos: [0, 0.6, 0] }, { geo: BOX(0.6, 0.12, 0.6), pos: [0, 1.1, 0] }, { geo: new THREE.ConeGeometry(0.55, 0.38, 4), pos: [0, 1.78, 0], rot: [0, Math.PI / 4, 0] }, { geo: new THREE.SphereGeometry(0.08, 6, 4), pos: [0, 2.0, 0] }]);
    instanced(toro, toon('#a8a49a'), east.map(p => ({ ...p, y: 0, s: 1.15 })), true);
    instanced(BOX(0.42, 0.42, 0.42), glowing('#ffd38a', null, 1.6), east.map(p => ({ ...p, y: 1.37 * 1.15, s: 1.15 })), false);
    east.forEach(p => { glowSprite(p.x, 1.6, p.z, 0xffb060, 1.8); colliders.push({ c: [p.x, p.z, 0.4] }); }); }
  treeSpots.forEach(p => colliders.push({ c: [p.x, p.z, 0.7 * p.s] }));



  // ---------------------------------------------------------------- LANDMARKS: hero set pieces placed into open ground
  function openSpot(z, prefer, minCells) {   // the blocked, unbuilt ground furthest from any path, nearest to 'prefer'
    const gr = z._gr, used = z._used; if (!gr) return null; const N = gr.nx * gr.ny, dist = new Int16Array(N).fill(-1), q = [];
    for (let k = 0; k < N; k++) if (gr.g[k] || used[k]) { dist[k] = 0; q.push(k); }
    for (let h = 0; h < q.length; h++) { const k = q[h], i = k % gr.nx, j = (k / gr.nx) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= gr.nx || jj >= gr.ny) continue; const kk = jj * gr.nx + ii; if (dist[kk] < 0) { dist[kk] = dist[k] + 1; q.push(kk); } } }
    let best = null, bs = -1e9; for (let k = 0; k < N; k++) { if (dist[k] < minCells) continue; const x = (k % gr.nx + 0.5) * gr.G, y = (((k / gr.nx) | 0) + 0.5) * gr.G; const sc = -Math.hypot(x - prefer[0], y - prefer[1]) + dist[k] * 40; if (sc > bs) { bs = sc; best = [x, y]; } }
    return best;
  }
  for (const z of zones) {
    if (z.key === 'kyotoTownSquare') { const p = openSpot(z, [z.w / 2, z.h / 2], 3); if (p) { const [X, Z] = toW(z, p[0], p[1]); const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = Math.atan2(-(X - center(z)[0]), -(Z - center(z)[1])); scene.add(g); pagoda(g, 5); bake(g); colliders.push({ c: [X, Z, 3.8] }); } }
    if (z.key === 'kyotoCastlePath') { const sp = z.spots && z.spots.castleGate && z.spots.castleGate.p; if (sp) { const [cx0, cz0] = center(z), [gx, gz] = toW(z, sp[0], sp[1]); let dx = gx - cx0, dz = gz - cz0; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; const g = new THREE.Group(); g.position.set(gx + dx * 46, -1, gz + dz * 46); g.rotation.y = Math.atan2(-dx, -dz); scene.add(g); castleKeep(g); bake(g); } }
    if (z.key === 'kyotoSumo') { const sp = z.spots && (z.spots.courtRect || z.spots.netCentre); if (sp && sp.p) { const [X, Z] = toW(z, sp.p[0], sp.p[1]); const g = new THREE.Group(); g.position.set(X, 0, Z); scene.add(g);
        M(BOX(7.6, 0.22, 7.6), toon('#c9a06a'), 0, 0.11, 0, g, 0.03); M(new THREE.TorusGeometry(2.3, 0.12, 6, 40), toon('#d9c08a'), 0, 0.25, 0, g, 0).rotation.x = Math.PI / 2;
        for (const s2 of [-1, 1]) M(BOX(0.9, 0.04, 0.12), toon('#f4f1ea'), s2 * 0.7, 0.24, 0, g, 0);
        for (const [x, zz, c] of [[3.6, 3.6, '#2f6e4a'], [-3.6, 3.6, '#c8322a'], [-3.6, -3.6, '#f4f1ea'], [3.6, -3.6, '#1d1a20']]) { M(new THREE.CylinderGeometry(0.12, 0.12, 6.6, 8), INK, x, 3.3, zz, g, 0.02); M(new THREE.SphereGeometry(0.35, 10, 8), toon(c), x, 5.6, zz, g, 0.02, 0.35); }
        M(hipRoof(10, 10, 2.4), toon('#3d4656'), 0, 6.85, 0, g, 0.05); M(BOX(9.2, 0.5, 9.2), INK, 0, 6.6, 0, g, 0.03); for (const s2 of [-1, 1]) for (const a of [0, 1]) M(BOX(a ? 0.1 : 9.0, 0.7, a ? 9.0 : 0.1), toon('#6b4f8f'), a ? s2 * 4.6 : 0, 6.1, a ? 0 : s2 * 4.6, g, 0);
        bake(g); } }
  }
  // falling cherry petals in Kyoto
  const PET = { n: 280, geo: new THREE.BufferGeometry(), seed: [] };
  { const arr = new Float32Array(PET.n * 3); for (let i = 0; i < PET.n; i++) PET.seed.push([rr(-22, 22), rr(0, 14), rr(-22, 22), rr(0, 9)]); PET.geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    PET.pts = new THREE.Points(PET.geo, new THREE.PointsMaterial({ color: 0xffc8d8, size: 0.16, transparent: true, opacity: 0.9, depthWrite: false })); PET.pts.frustumCulled = false; PET.pts.visible = false; scene.add(PET.pts); }
  function tickPetals(t) {
    const here = St.area ? null : St.zone; const on = !!here && isKyo(here) && !(MAPS[here] && MAPS[here].cave); PET.pts.visible = on; if (!on) return;
    const a = PET.geo.attributes.position.array; for (let i = 0; i < PET.n; i++) { const s0 = PET.seed[i]; const y = 14 - ((t * 0.9 + s0[3] * 1.6) % 14); a[i * 3] = Pl.x + s0[0] + Math.sin(t * 0.8 + s0[3]) * 1.2 + (14 - y) * 0.25; a[i * 3 + 1] = y; a[i * 3 + 2] = Pl.z + s0[2] + Math.cos(t * 0.6 + s0[3]) * 1.0; }
    PET.geo.attributes.position.needsUpdate = true;
  }
  // ---------------------------------------------------------------- AREAS: rooms from the walk mask
  const roomLights = [];
  const floorCol = { gaya: '#b89a72', jidda: '#c9b08a', kufa: '#c8a070', luxor: '#6a3a2c', nebo: '#8a6a4a', ur: '#b07a4a', zion: '#9a7a52', player: '#a08868', earth: '#5a2a3a', station: '#5a6170' }[W8] || '#a08868';
  const SEATY = /tavern|bar\b|inn\b|cafe|coffee|tea|noodle|diner|pizza|burger|sushi|smoothie|creamery|bakery|deli|canteen|mess|lounge|casino|saloon|pub|club/i;
  function buildArea(a) {
    if (a.built) return; a.built = true;
    if (a.kind === 'dock') return buildDock(a);
    const cave = /cave|deep|drop|gallery|shaft|hideout|cinder|volcano|climb|pyramid|hall|ring|tunnel|mine/i.test(a.key + ' ' + a.label) && !a.interior ? true : /cave|deep|drop|gallery|shaft|volcano|climb/i.test(a.key);
    const outdoorArea = !a.interior;
    const G = 50, gr = grid(a, G);
    // which blocked cells touch the outside (walls) and which are islands (furniture)
    const outside = new Uint8Array(gr.nx * gr.ny), st = [];
    for (let i = 0; i < gr.nx; i++) st.push([i, 0], [i, gr.ny - 1]); for (let j = 0; j < gr.ny; j++) st.push([0, j], [gr.nx - 1, j]);
    while (st.length) { const [i, j] = st.pop(); if (i < 0 || j < 0 || i >= gr.nx || j >= gr.ny) continue; const k = j * gr.nx + i; if (outside[k] || gr.g[k]) continue; outside[k] = 1; st.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]); }
    // islands: small ones are counters, big ones are seating areas (tables and stools on the floor)
    const comp = new Int32Array(gr.nx * gr.ny).fill(-1), csize = [];
    for (let k0 = 0; k0 < gr.nx * gr.ny; k0++) { if (gr.g[k0] || outside[k0] || comp[k0] >= 0) continue; const id = csize.length; let n = 0; const q = [k0]; comp[k0] = id; while (q.length) { const k = q.pop(); n++; const i = k % gr.nx, j = (k / gr.nx) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= gr.nx || jj >= gr.ny) continue; const kk = jj * gr.nx + ii; if (gr.g[kk] || outside[kk] || comp[kk] >= 0) continue; comp[kk] = id; q.push(kk); } } csize.push(n); }
    const walls = [], furn = [], seats = [];
    for (let j = 0; j < gr.ny; j++) for (let i = 0; i < gr.nx; i++) {
      const k = j * gr.nx + i; if (gr.g[k]) continue;
      const nearWalk = gr.at(i + 1, j) || gr.at(i - 1, j) || gr.at(i, j + 1) || gr.at(i, j - 1) || gr.at(i + 1, j + 1) || gr.at(i - 1, j - 1) || gr.at(i + 1, j - 1) || gr.at(i - 1, j + 1);
      if (!nearWalk && outside[k]) continue;
      const [X, Z] = toW(a, (i + 0.5) * G, (j + 0.5) * G);
      if (outside[k]) { if (a.vision && a.spots.stage && (j + 0.5) * G < a.spots.stage.p[1] + 420 && Math.abs((i + 0.5) * G - a.spots.stage.p[0]) < 520) continue; walls.push({ x: X, z: Z }); }
      else if (a.vision) continue;
      else if (csize[comp[k]] <= 8 || cave || outdoorArea) furn.push({ x: X, z: Z });
      else if (SEATY.test(a.key + ' ' + a.label) && i % 3 === 1 && j % 3 === 1) seats.push({ x: X, z: Z, r: (i * 7 + j) % 6 });
    }
    // the floor: islands that became seating are painted as floor
    const gt = canvasTex(Math.max(8, Math.round(a.w * 512 / Math.max(a.w, a.h))), Math.max(8, Math.round(a.h * 512 / Math.max(a.w, a.h))), (c) => {
      const k = 512 / Math.max(a.w, a.h); const fc = a.vision ? '#2a1a4a' : outdoorArea ? (ST.path || '#cbb894') : floorCol;
      c.fillStyle = outdoorArea ? (ST.ground || '#6a7a50') : '#1d1a26'; c.fillRect(0, 0, c.canvas.width, c.canvas.height);
      c.fillStyle = fc; for (const [y, segs] of a.rows) for (const [x0, x1] of segs) c.fillRect(Math.floor(x0 * k), Math.floor(y * k), Math.ceil((x1 - x0) * k) + 1, Math.ceil(8 * k) + 1);
      for (let j = 0; j < gr.ny; j++) for (let i = 0; i < gr.nx; i++) { const kk = j * gr.nx + i; if (!gr.g[kk] && !outside[kk] && csize[comp[kk]] > 8 && !cave && !outdoorArea) c.fillRect(i * G * k - 1, j * G * k - 1, G * k + 2, G * k + 2); }
      if (a.vision) {}
      else if (!outdoorArea && !cave) { c.fillStyle = 'rgba(0,0,0,0.07)'; for (let x = 0; x < c.canvas.width; x += 6) { c.fillRect(x, 0, 1, c.canvas.height); for (let y = ((x * 7) % 23); y < c.canvas.height; y += 23) c.fillRect(x, y, 6, 1); } }
      for (let i = 0; i < 600; i++) { c.fillStyle = 'rgba(0,0,0,' + rr(0.02, 0.06) + ')'; c.fillRect(rr(0, c.canvas.width), rr(0, c.canvas.height), rr(1, 4), rr(1, 4)); }
    });
    const gm = new THREE.Mesh(new THREE.PlaneGeometry(a.w * S, a.h * S), new THREE.MeshToonMaterial({ map: gt, gradientMap: grad }));
    gm.rotation.x = -Math.PI / 2; gm.position.set(a.bx + a.w * S / 2, 0.02, a.bz + a.h * S / 2); gm.receiveShadow = true; scene.add(gm);
    if (a.vision) {   // casino carpet, tiled small, cut to the room's shape
      const cp = canvasTex(128, 128, c => { c.fillStyle = '#2a1a4a'; c.fillRect(0, 0, 128, 128); const cols = ['#c42d3c', '#d9a64a', '#3fb7a0', '#ff3fa4']; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = cols[(i + j * 2) % 4]; c.save(); c.translate(16 + i * 32, 16 + j * 32); c.rotate(Math.PI / 4); c.fillRect(-5, -5, 10, 10); c.restore(); c.strokeStyle = '#4a2a7a'; c.lineWidth = 2; c.beginPath(); c.arc(16 + i * 32, 16 + j * 32, 12, 0, 7); c.stroke(); } });
      gm.material = new THREE.MeshToonMaterial({ map: tiled(cp, a.w * S / 2.4, a.h * S / 2.4), gradientMap: grad }); gm.position.y = 0.03;
    }
    if (seats.length) {
      instanced(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 16), WOOD, seats.map(p => ({ ...p, y: 0.82, s: 1 })), true);
      instanced(new THREE.CylinderGeometry(0.08, 0.14, 0.8, 8), DARK, seats.map(p => ({ ...p, y: 0.4, s: 1 })), false);
      const st2 = []; seats.forEach(p => { for (const a2 of [0, 2.1, 4.2]) st2.push({ x: p.x + Math.cos(a2 + p.r) * 0.85, z: p.z + Math.sin(a2 + p.r) * 0.85, s: 1 }); });
      instanced(new THREE.CylinderGeometry(0.22, 0.2, 0.5, 10), toon(ST.accent || '#c42d3c'), st2.map(p => ({ ...p, y: 0.25 })), true);
      seats.forEach((p, i) => { if (i % 3 === 0) { M(new THREE.CylinderGeometry(0.05, 0.06, 0.18, 8), lampM, p.x, 0.95, p.z, null, 0); glowSprite(p.x, 1.0, p.z, 0xffb060, 1.2); } });
    }
    const cs = G * S;
    const wallH = cave ? 3.0 : outdoorArea ? 1.4 : 3.2;
    let wallCol = a.vision ? '#2a2f5a' : cave ? '#4a4048' : outdoorArea ? (ST.wild || '#5f8048') : (ST.wall || '#d8d0c0');
    { const c = new THREE.Color(wallCol), l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; if (!cave && !a.vision && l < 0.35) wallCol = '#' + c.lerp(new THREE.Color('#b8b0c8'), 0.55).getHexString(); }
    instanced(BOX(cs, wallH, cs), cutaway(cave ? new THREE.MeshToonMaterial({ color: wallCol, gradientMap: grad }) : texMat(a.vision ? 'panel' : WALLKIND, wallCol, 1, 1)), walls.map(p => ({ ...p, y: wallH / 2, s: 1 })), false);
    // furniture islands: counters with a top, in the world's wood or stone
    instanced(BOX(cs * 0.94, 0.9, cs * 0.94), toon(cave ? '#3a3440' : '#6b4a35'), furn.map(p => ({ ...p, y: 0.45, s: 1 })), false);
    if (!cave) instanced(BOX(cs * 1.0, 0.1, cs * 1.0), toon(outdoorArea ? '#8a8478' : (ST.trim || '#c2963f')), furn.map(p => ({ ...p, y: 0.95, s: 1 })), false);
    if (!outdoorArea && !cave) {
      // a trim along the top of the walls, warm lamps on them, the world's banners, a rug in the middle
      instanced(BOX(cs * 1.02, 0.14, cs * 1.02), cutaway(new THREE.MeshToonMaterial({ color: ST.trim || '#e0a84a', gradientMap: grad })), walls.map(p => ({ ...p, y: wallH + 0.07, s: 1 })), false);
      dressRoom(a, gr, outside, G, wallH);
      const [rx, rz] = center(a), rw = Math.min(a.w * S * 0.35, 9), rd = Math.min(a.h * S * 0.35, 9);
      if (!a.vision && walkLocal(a, a.w / 2, a.h / 2)) { const rug = new THREE.Mesh(new THREE.PlaneGeometry(rw, rd), toon(ST.accent || '#ec3013')); rug.rotation.x = -Math.PI / 2; rug.position.set(rx, 0.04, rz); scene.add(rug); const rb = new THREE.Mesh(new THREE.PlaneGeometry(rw - 0.6, rd - 0.6), toon(ST.roof || '#1b2350')); rb.rotation.x = -Math.PI / 2; rb.position.set(rx, 0.05, rz); scene.add(rb); }
    }
    if (outdoorArea && !cave) { const tr = walls.filter((p, i) => i % 3 === 0); instanced(new THREE.ConeGeometry(1.2, 3.2, 7), toon('#ffffff'), tr.map(p => ({ ...p, y: 2.9, s: 1 })), true, treeCols); }
    if (a.vision) visionDress(a);
    if (a.kind === 'battle') battleDress(a);
    // the room's own named furniture
    if (!a.vision) for (const [name, sp] of Object.entries(a.spots || {})) prop(a, name, sp);
    placeGames(a);
    // its doors
    for (const d of a.doors) {
      const [X, Z] = toW(a, d.x, d.y);
      exitsIn.push({ X, Z, to: d.to, label: d.label, area: a.key, at: d.at, raw: d.kind === 'pad' });
      const g = new THREE.Group(); g.position.set(X, 0, Z); scene.add(g);
      M(new THREE.TorusGeometry(1.1, 0.08, 6, 32), accentGlow, 0, 0.08, 0, g, 0).rotation.x = Math.PI / 2;
      glowSprite(0, 0.6, 0, new THREE.Color(ST.accent || '#ec3013').getHex(), 3, g);
    }
    for (const e of a.exits || []) {
      if (a.doors.some(d => d.to === e.to)) continue;
      const [X, Z] = toW(a, (e.rect[0] + e.rect[2]) / 2, (e.rect[1] + e.rect[3]) / 2);
      exitsIn.push({ X, Z, to: e.to, label: e.label, area: a.key, at: e.arriveAt });
    }
    // light: one warm lamp in the middle, on only while you are here
    const L = new THREE.PointLight(cave ? 0xff8a50 : 0xffd6a0, 0, Math.max(a.w, a.h) * S * 0.9, 1.4); L.position.set(a.bx + a.w * S / 2, 7, a.bz + a.h * S / 2); scene.add(L); roomLights.push({ L, a: a.key, k: cave ? 40 : 60 });
  }


  // ---------------------------------------------------------------- ROOM DRESSING by what the room is
  const cutLamp = cutaway(glowing('#ffd38a', null, 2.2));
  const GLASS = ['#e8505b', '#4fa3e0', '#f2c14e', '#6cc46c', '#a46cd8'].map(c => glowing(c, null, 1.4));
  const ROOMS = [
    ['church', /church|temple|chapel|shrine|cathedral|monaster|sanctum|abbey/i],
    ['throne', /throne|palace|court|audience|great hall/i],
    ['barracks', /barracks|bunk|dorm|garrison/i],
    ['armory', /armou?ry|forge|smith|weapon/i],
    ['library', /library|college|archive|study|school|scroll|records/i],
    ['lab', /lab\b|lab |laborator|workshop|operations|core/i],
    ['shop', /shop|store|merchant|market|pawn|import|tailor|exchange|deli|bakery|creamery|showroom|comics|pizza|burger|sushi|noodle|smoothie|teahouse|coffee|cafe/i],
    ['bath', /bath|onsen|spring|spa\b|pool/i],
    ['home', /hut|house|apartment|quarters|cabin|lodge|farmhouse|berth|room|shed|home|clubhouse/i],
  ];
  function dressRoom(a, gr, outside, G, wallH) {
    const theme = (ROOMS.find(([, re]) => re.test(a.key + ' ' + a.label)) || ['hall'])[0];
    if (/tavern|casino|bar\b/i.test(a.key + ' ' + a.label)) return;   // taverns and casinos have their own furniture
    const avoid = [];
    for (const d of a.doors) avoid.push([d.x, d.y, 170]);
    for (const e of a.exits || []) avoid.push([(e.rect[0] + e.rect[2]) / 2, (e.rect[1] + e.rect[3]) / 2, 190]);
    avoid.push([a.entrance[0], a.entrance[1], 150], [a.spawn[0], a.spawn[1], 150]);
    for (const sp of Object.values(a.spots || {})) { if (sp.p) avoid.push([sp.p[0], sp.p[1], 90]); }
    const free = (x, y, r = 0) => !avoid.some(([ax, ay, ar]) => Math.hypot(ax - x, ay - y) < ar + r);
    const placed = [], spaced = (x, y, d) => { if (placed.some(([px, py]) => Math.hypot(px - x, py - y) < d)) return false; placed.push([x, y]); return true; };
    // wall faces: floor cells touching the outside, with the normal pointing into the room
    const faces = [];
    for (let j = 0; j < gr.ny; j++) for (let i = 0; i < gr.nx; i++) { if (!gr.at(i, j)) continue; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (j + dj) * gr.nx + (i + di); if (i + di < 0 || j + dj < 0 || i + di >= gr.nx || j + dj >= gr.ny || (!gr.at(i + di, j + dj) && outside[k])) { const lx = (i + 0.5) * G, ly = (j + 0.5) * G; faces.push({ lx, ly, wx: lx + di * G / 2, wy: ly + dj * G / 2, nx: -di, ny: -dj }); } } }
    // inner floor: at least 2 cells from any wall
    const inner = [];
    for (let j = 2; j < gr.ny - 2; j++) for (let i = 2; i < gr.nx - 2; i++) { let ok = true; for (let dj = -2; dj <= 2 && ok; dj++) for (let di = -2; di <= 2; di++) if (!gr.at(i + di, j + dj)) { ok = false; break; } if (ok) inner.push({ i, j, lx: (i + 0.5) * G, ly: (j + 0.5) * G }); }
    const grp = (lx, ly, rot) => { const [X, Z] = toW(a, lx, ly); const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = rot; scene.add(g); return g; };
    const onWall = (f, off = 0.32) => grp(f.wx + f.nx * off / S, f.wy + f.ny * off / S, Math.atan2(f.nx, f.ny));
    const block = (lx, ly, r) => { const [X, Z] = toW(a, lx, ly); colliders.push({ c: [X, Z, r] }); };
    // sconces on the walls everywhere (cut away with the wall)
    faces.forEach((f, n) => { if (!spaced(f.wx, f.wy, 330)) return; const g = onWall(f, 0.12); M(BOX(0.2, 0.34, 0.2), cutLamp, 0, 2.3, 0, g, 0.02); glowSprite(0, 2.35, 0.15, 0xffb060, 1.8, g); });
    placed.length = 0;
    // the axis of the room: from the entrance to the far end (or the throne/altar)
    const tgtSpot = Object.entries(a.spots || {}).find(([n]) => /altar|throne|crest|shrine|pulpit|plinth/i.test(n));
    const ent = a.entrance, far = tgtSpot ? (tgtSpot[1].p || tgtSpot[1].pts[0]) : [a.w - ent[0], a.h - ent[1]];
    let ax = far[0] - ent[0], ay = far[1] - ent[1]; const aL = Math.hypot(ax, ay) || 1; ax /= aL; ay /= aL;
    const along = (x, y) => (x - ent[0]) * ax + (y - ent[1]) * ay, lateral = (x, y) => -(x - ent[0]) * ay + (y - ent[1]) * ax;
    const faceTarget = Math.atan2(ax, ay);
    const wallItems = (every, fn) => faces.forEach(f => { if (!free(f.lx, f.ly, 20) || !spaced(f.wx, f.wy, every)) return; fn(onWall(f, 0.45), f); block(f.lx, f.ly, 0.55); });
    const innerItems = (every, fn, pred) => inner.forEach(c => { if ((pred && !pred(c)) || !free(c.lx, c.ly, 40) || !spaced(c.lx, c.ly, every)) return; fn(grp(c.lx, c.ly, faceTarget + Math.PI), c); block(c.lx, c.ly, 0.7); });
    const T = theme;
    if (T === 'church') {
      faces.forEach(f => { if (!spaced(f.wx + 9999, f.wy, 150)) return; const g = onWall(f, 0.06); const w = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.9), GLASS[Math.abs(Math.round(f.wx + f.wy)) % GLASS.length]); w.position.y = 1.9; g.add(w); M(BOX(1.1, 0.12, 0.12), GOLD, 0, 2.9, 0.02, g, 0); });
      // pews: rows across the room, an aisle down the middle
      for (const c of inner) { const al = along(c.lx, c.ly), lt = lateral(c.lx, c.ly); if (Math.abs(lt) < 75 || al < 160 || al > aL - 170 || Math.round(al / G) % 2 || !free(c.lx, c.ly, 0)) continue; const g = grp(c.lx, c.ly, faceTarget); M(BOX(1.42, 0.45, 0.5), WOOD, 0, 0.42, 0, g, 0.02); M(BOX(1.42, 0.7, 0.1), WOOD, 0, 0.75, -0.28, g, 0.02); block(c.lx, c.ly, 0.5); }
      for (const s2 of [-1, 1]) { const lx = far[0] - ax * 80 + -ay * s2 * 110, ly = far[1] - ay * 80 + ax * s2 * 110; if (walkLocal(a, lx, ly)) { const g = grp(lx, ly, 0); M(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 8), GOLD, 0, 0.7, 0, g, 0); for (let k = 0; k < 3; k++) { M(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6), toon('#f4ecd8'), (k - 1) * 0.18, 1.5, 0, g, 0); } glowSprite(0, 1.7, 0, 0xffc070, 1.6, g); } }
    } else if (T === 'throne') {
      const L2 = aL - 60, [mx, my] = [ent[0] + ax * L2 / 2, ent[1] + ay * L2 / 2], [X, Z] = toW(a, mx, my);
      const run = new THREE.Mesh(new THREE.PlaneGeometry(2.2, L2 * S), toon(ST.accent || '#b3202f')); run.rotation.x = -Math.PI / 2; run.rotation.z = -faceTarget; run.position.set(X, 0.05, Z); scene.add(run);
      const edge = new THREE.Mesh(new THREE.PlaneGeometry(2.6, L2 * S), GOLD); edge.rotation.x = -Math.PI / 2; edge.rotation.z = -faceTarget; edge.position.set(X, 0.045, Z); scene.add(edge);
      for (let t = 160; t < L2 - 80; t += 150) for (const s2 of [-1, 1]) { const lx = ent[0] + ax * t - ay * s2 * 140, ly = ent[1] + ay * t + ax * s2 * 140; if (!walkLocal(a, lx, ly)) continue; const g = grp(lx, ly, 0); M(new THREE.CylinderGeometry(0.45, 0.5, 4.6, 14), toon(ST.wall || '#e9e1d2'), 0, 2.3, 0, g, 0.04, 0.5); M(BOX(1.2, 0.3, 1.2), GOLD, 0, 4.6, 0, g, 0.03); M(BOX(1.2, 0.3, 1.2), GOLD, 0, 0.15, 0, g, 0.03); const b = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.6), bannerM); b.position.set(0, 3.0, 0.52 * Math.sign(-s2)); b.rotation.y = 0; g.rotation.y = faceTarget + (s2 > 0 ? Math.PI / 2 : -Math.PI / 2); b.position.set(0, 3.0, 0.52); g.add(b); block(lx, ly, 0.6); }
    } else if (T === 'armory') {
      wallItems(110, g => { M(BOX(1.6, 0.12, 0.3), WOOD, 0, 1.6, 0, g, 0.02); M(BOX(1.6, 0.12, 0.3), WOOD, 0, 0.5, 0, g, 0.02); for (let k = 0; k < 3; k++) { M(BOX(0.08, 1.5, 0.04), toon('#cfd6df'), -0.5 + k * 0.5, 1.15, 0.1, g, 0.01); M(BOX(0.3, 0.07, 0.07), GOLD, -0.5 + k * 0.5, 0.55, 0.1, g, 0); } });
      innerItems(170, g => { M(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), DARK, 0, 0.6, 0, g, 0); M(BOX(0.7, 0.8, 0.4), toon('#9aa4b5'), 0, 1.5, 0, g, 0.03); M(new THREE.SphereGeometry(0.25, 10, 8), toon('#9aa4b5'), 0, 2.15, 0, g, 0.03, 0.25); M(BOX(0.75, 0.75, 0.1), toon(ST.accent || '#c42d3c'), 0.5, 1.4, 0.2, g, 0.02).rotation.y = 0.6; });
    } else if (T === 'barracks') {
      wallItems(100, g => { for (const y of [0.35, 1.45]) { M(BOX(1.0, 0.25, 2.0), toon('#e9e1d2'), 0, y, 1.0 - 0.45, g, 0.02); M(BOX(1.0, 0.1, 0.5), toon(ST.accent || '#c42d3c'), 0, y + 0.16, 1.0 - 0.45 - 0.7, g, 0); } for (const sx of [-0.5, 0.5]) M(BOX(0.08, 1.8, 0.08), DARK, sx, 0.9, 1.5, g, 0); });
      innerItems(200, g => { M(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 6), WOOD, 0, 0.5, 0, g, 0); M(new THREE.CylinderGeometry(0.32, 0.3, 0.9, 10), toon('#c8a46a'), 0, 1.4, 0, g, 0.03, 0.32); M(new THREE.SphereGeometry(0.22, 10, 8), toon('#c8a46a'), 0, 2.05, 0, g, 0.03, 0.22); M(BOX(1.2, 0.12, 0.12), WOOD, 0, 1.6, 0, g, 0.01); });
    } else if (T === 'library') {
      wallItems(80, g => { M(BOX(1.4, 2.6, 0.45), WOOD, 0, 1.3, 0, g, 0.03); const cols = ['#b3202f', '#2f5f9e', '#3f8a46', '#d9a64a', '#6b4f8f']; for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) M(BOX(0.18, 0.42, 0.32), toon(cols[(r * 3 + k) % 5]), -0.5 + k * 0.2, 0.35 + r * 0.6, 0.06, g, 0); });
      innerItems(220, g => { M(BOX(2.0, 0.12, 1.1), WOOD, 0, 0.8, 0, g, 0.02); for (const sx of [-0.85, 0.85]) M(BOX(0.12, 0.8, 0.9), WOOD, sx, 0.4, 0, g, 0); M(new THREE.CylinderGeometry(0.06, 0.1, 0.4, 8), DARK, 0.6, 1.06, 0, g, 0); M(new THREE.SphereGeometry(0.12, 8, 6), lampM, 0.6, 1.3, 0, g, 0); glowSprite(0.6, 1.3, 0, 0xffc070, 1.4, g); M(BOX(0.5, 0.06, 0.35), toon('#f4ecd8'), -0.3, 0.88, 0, g, 0); });
    } else if (T === 'lab') {
      wallItems(110, g => { M(BOX(1.6, 0.9, 0.7), toon('#cfd6df'), 0, 0.45, 0.1, g, 0.02); for (let k = 0; k < 3; k++) { M(new THREE.CylinderGeometry(0.08, 0.12, 0.3, 8), glowing(['#5fe1ff', '#7dff9a', '#ff7ad9'][k], null, 1.8), -0.5 + k * 0.5, 1.05, 0.1, g, 0); } M(BOX(1.4, 0.9, 0.06), glowing('#1e8bc3', null, 0.8), 0, 1.9, -0.2, g, 0.02); });
      innerItems(240, g => { M(BOX(2.2, 0.9, 1.0), toon('#9aa4b5'), 0, 0.45, 0, g, 0.03); M(new THREE.SphereGeometry(0.3, 12, 10), glowing('#5fe1ff', null, 1.6), 0, 1.25, 0, g, 0.02, 0.3); glowSprite(0, 1.25, 0, 0x5fe1ff, 2.0, g); });
    } else if (T === 'shop') {
      wallItems(90, g => { M(BOX(1.4, 2.0, 0.5), WOOD, 0, 1.0, 0, g, 0.03); const cols = ['#e8505b', '#4fa3e0', '#f2c14e', '#6cc46c', '#ffffff']; for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { M(r % 2 ? new THREE.CylinderGeometry(0.11, 0.11, 0.3, 8) : BOX(0.22, 0.26, 0.22), toon(cols[(r + k * 2) % 5]), -0.45 + k * 0.3, 0.5 + r * 0.6, 0.08, g, 0); } });
      innerItems(240, g => { for (const [x, z, sz] of [[0, 0, 0.9], [0.8, 0.3, 0.7], [0.3, -0.7, 0.6]]) M(BOX(sz, sz, sz), toon(pick(['#c8a46a', '#a8843f', '#8a6a46'])), x, sz / 2, z, g, 0.03).rotation.y = rr(0, 1); });
    } else if (T === 'bath') {
      const [cx, cz] = center(a); if (walkLocal(a, a.w / 2, a.h / 2)) { const r = Math.min(a.w, a.h) * S * 0.18; M(new THREE.CylinderGeometry(r + 0.4, r + 0.4, 0.35, 32), toon('#e9e1d2'), cx, 0.17, cz, null, 0.03); const w = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshToonMaterial({ color: '#4fb7d8', gradientMap: grad, transparent: true, opacity: 0.88 })); w.rotation.x = -Math.PI / 2; w.position.set(cx, 0.36, cz); scene.add(w); for (let k = 0; k < 6; k++) glowSprite(cx + Math.cos(k) * r * 0.5, 1.2 + k * 0.2, cz + Math.sin(k) * r * 0.5, 0xffffff, 2.5); colliders.push({ c: [cx, cz, r] }); }
      wallItems(160, g => { M(BOX(1.6, 0.4, 0.5), WOOD, 0, 0.2, 0, g, 0.02); M(BOX(0.5, 0.5, 0.06), toon('#ffffff'), 0, 1.2, -0.2, g, 0); });
    } else if (T === 'home') {
      let bed = false, table = false;
      wallItems(130, g => { if (!bed) { bed = true; M(BOX(1.2, 0.5, 2.0), toon('#e9e1d2'), 0, 0.25, 0.9, g, 0.02); M(BOX(1.2, 0.12, 0.9), toon(ST.accent || '#c42d3c'), 0, 0.56, 1.3, g, 0); M(BOX(1.3, 1.0, 0.12), WOOD, 0, 0.5, -0.05, g, 0.02); return; } M(BOX(1.2, 1.6, 0.45), WOOD, 0, 0.8, 0, g, 0.03); for (let k = 0; k < 3; k++) M(new THREE.CylinderGeometry(0.1, 0.1, 0.25, 8), toon(pick(['#e8505b', '#4fa3e0', '#f2c14e'])), -0.3 + k * 0.3, 1.72, 0, g, 0); });
      innerItems(400, g => { if (table) return; table = true; M(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 16), WOOD, 0, 0.78, 0, g, 0.02); M(new THREE.CylinderGeometry(0.08, 0.14, 0.78, 8), DARK, 0, 0.39, 0, g, 0); for (const a2 of [0, Math.PI]) M(BOX(0.45, 0.45, 0.45), WOOD, Math.cos(a2) * 0.9, 0.22, Math.sin(a2) * 0.9, g, 0.02); });
    } else {
      // big halls: pillars in a grid and banners
      innerItems(260, g => { M(new THREE.CylinderGeometry(0.4, 0.45, 4.2, 12), toon(ST.wall || '#e9e1d2'), 0, 2.1, 0, g, 0.04, 0.45); M(BOX(1.0, 0.25, 1.0), GOLD, 0, 4.2, 0, g, 0.02); });
      wallItems(260, g => { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.6), bannerM); b.position.y = 2.2; g.add(b); });
    }
  }

  // ---------------------------------------------------------------- THE VEGAS VISION (Gaya's dream): neon, a stage, the games, a lit door
  const VISION = { motes: null, on: false };
  function visionDress(a) {
    const P = n => a.spots[n] && (a.spots[n].p || (a.spots[n].pts && a.spots[n].pts[0]));
    const at = (n, ry = 0) => { const p = P(n); if (!p) return null; const [X, Z] = toW(a, p[0], p[1]); const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; scene.add(g); return g; };
    const pink = glowing('#ff3fa4', null, 2.2), cyan = glowing('#5fe1ff', null, 2.2), gold = glowing('#ffd23a', null, 1.8), felt = toon('#1f6b3e'), navy = toon('#1b1e3a');
    // the stage: steps, footlights, a curtain, and the big sign
    { const g = at('stage'); if (g) { M(BOX(14, 1.1, 6), navy, 0, 0.55, 0, g, 0.04); M(BOX(14.4, 0.14, 6.4), GOLD, 0, 1.12, 0, g, 0.02); M(BOX(8, 0.4, 1.2), navy, 0, 0.2, 3.5, g, 0.02);
        for (let i = 0; i < 14; i++) { M(new THREE.SphereGeometry(0.12, 8, 6), gold, -6.5 + i, 1.25, 3.0, g, 0); }
        for (let i = 0; i < 9; i++) { const c = M(BOX(1.5, 6.5, 0.25), toon(i % 2 ? '#8a1230' : '#a8183c'), -6 + i * 1.5, 4.2, -2.8, g, 0.01); c.rotation.y = (i % 2 ? 0.12 : -0.12); }
        const t = signTex('LAS VEGAS', null, '#ff3fa4', '#ffe9f4'); M(BOX(10, 2.2, 0.3), [navy, navy, navy, navy, glowing(0, t, 2.0), navy], 0, 8.6, -2.6, g, 0.04);
        for (let i = 0; i < 26; i++) M(new THREE.SphereGeometry(0.1, 6, 4), i % 2 ? pink : gold, -5 + (i % 13) * 0.83, i < 13 ? 7.4 : 9.8, -2.4, g, 0);
        for (const sx of [-1, 1]) { const sp = new THREE.SpotLight(sx > 0 ? 0xff7ad9 : 0x7fe3ff, 0, 30, 0.35, 0.6); sp.position.set(sx * 6, 9, 6); sp.target.position.set(0, 1, 0); g.add(sp, sp.target); roomLights.push({ L: sp, a: a.key, k: 60 }); } } }
    // the microphone
    { const g = at('mic'); if (g) { M(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6), DARK, 0, 1.9, 0, g, 0); M(new THREE.SphereGeometry(0.09, 8, 6), toon('#cbd5e1'), 0, 2.75, 0, g, 0); } }
    // the bar along the north wall, bottles glowing
    { const r = a.spots.barBox && a.spots.barBox.r; if (r) { const [x0, z0] = toW(a, r[0], r[1]), [x1, z1] = toW(a, r[2], r[3]); const g = new THREE.Group(); g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); scene.add(g); const w = x1 - x0;
        M(BOX(w, 1.15, 1.1), toon('#2a1830'), 0, 0.58, 0, g, 0.04); M(BOX(w + 0.3, 0.12, 1.35), GOLD, 0, 1.2, 0, g, 0.02); M(BOX(w, 0.08, 0.1), pink, 0, 0.2, 0.58, g, 0);
        for (let i = 0; i < Math.floor(w / 1.4); i++) { M(new THREE.CylinderGeometry(0.26, 0.22, 0.12, 14), toon('#c42d3c'), -w / 2 + 0.8 + i * 1.4, 0.92, 1.1, g, 0.015); M(new THREE.CylinderGeometry(0.05, 0.07, 0.9, 8), DARK, -w / 2 + 0.8 + i * 1.4, 0.45, 1.1, g, 0); }
        for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i < Math.floor(w / 0.5); i++) { const col = ['#3f9a5e', '#ffd23a', '#5fe1ff', '#ff3fa4', '#ffffff'][(i + r2) % 5]; M(new THREE.CylinderGeometry(0.07, 0.09, 0.42, 8), glowing(col, null, 0.9), -w / 2 + 0.3 + i * 0.5, 1.5 + r2 * 0.6, -0.4, g, 0); }
        colliders.push({ box: [x0, x1, z0, z1] }); } }
    // the roulette wheel
    { const g = at('wheel'); if (g) { M(new THREE.CylinderGeometry(0.4, 0.5, 0.9, 12), DARK, 0, 0.45, 0, g, 0.02); const wh = M(new THREE.CylinderGeometry(1.4, 1.3, 0.25, 36), toon('#4a2a1a'), 0, 1.0, 0, g, 0.03, 1.4); const t = canvasTex(256, 256, c => { for (let i = 0; i < 37; i++) { c.fillStyle = i === 0 ? '#1f6b3e' : i % 2 ? '#b3202f' : '#111'; c.beginPath(); c.moveTo(128, 128); c.arc(128, 128, 126, i / 37 * 6.283, (i + 1) / 37 * 6.283); c.fill(); } c.fillStyle = '#d9a64a'; c.beginPath(); c.arc(128, 128, 60, 0, 7); c.fill(); }); const top = new THREE.Mesh(new THREE.CircleGeometry(1.2, 37), new THREE.MeshToonMaterial({ map: t, gradientMap: grad })); top.rotation.x = -Math.PI / 2; top.position.y = 1.13; g.add(top); VISION.wheel = top; M(new THREE.CylinderGeometry(3.0, 3.0, 0.1, 8), felt, 3.6, 0.85, 0, g, 0.02); colliders.push({ c: [g.position.x, g.position.z, 1.6] }); } }
    // card table and dice table
    for (const [n, w, d] of [['cards', 4.2, 2.4], ['dice', 5.4, 2.6]]) { const g = at(n); if (!g) continue; M(BOX(w, 0.9, d), toon('#3a2418'), 0, 0.45, 0, g, 0.03); M(BOX(w - 0.3, 0.06, d - 0.3), felt, 0, 0.92, 0, g, 0); M(BOX(w + 0.1, 0.12, d + 0.1), GOLD, 0, 0.88, 0, g, 0.01); const lamp = M(new THREE.ConeGeometry(0.9, 0.5, 16, 1, true), toon('#1f6b3e'), 0, 3.0, 0, g, 0.02); glowSprite(0, 2.8, 0, 0xffe1a0, 3, g); M(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 4), DARK, 0, 4.1, 0, g, 0); for (let i = 0; i < 6; i++) M(BOX(0.18, 0.02, 0.26), toon('#ffffff'), -w / 3 + i * 0.35, 0.96, 0.2 * (i % 2), g, 0); colliders.push({ c: [g.position.x, g.position.z, Math.max(w, d) / 2] }); }
    // the slot machines along the east wall
    { const r = a.spots.slotsBox && a.spots.slotsBox.r; if (r) { const [x0, z0] = toW(a, r[0], r[1]), [x1, z1] = toW(a, r[2], r[3]); const n = Math.floor((z1 - z0) / 1.4); for (let i = 0; i < n; i++) { const g = new THREE.Group(); g.position.set((x0 + x1) / 2, 0, z0 + 0.7 + i * 1.4); g.rotation.y = -Math.PI / 2; scene.add(g);
        M(BOX(1.1, 1.9, 0.8), toon(i % 2 ? '#3a1d6e' : '#1e3a6e'), 0, 0.95, 0, g, 0.03); M(BOX(0.8, 0.55, 0.06), glowing(i % 3 ? '#ffd23a' : '#5fe1ff', null, 1.6), 0, 1.35, 0.41, g, 0); M(BOX(1.15, 0.25, 0.85), i % 2 ? pink : cyan, 0, 2.0, 0, g, 0); M(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), toon('#cbd5e1'), 0.62, 1.4, 0.1, g, 0); M(new THREE.SphereGeometry(0.08, 8, 6), toon('#c42d3c'), 0.62, 1.68, 0.1, g, 0); }
        colliders.push({ box: [x0, x1, z0, z1] }); } }
    // the big screen
    { const g = at('screen'); if (g) { M(BOX(5, 2.8, 0.2), navy, 0, 3.5, 0, g, 0.03); M(BOX(4.6, 2.4, 0.05), glowing('#5fe1ff', null, 1.0), 0, 3.5, 0.12, g, 0); } }
    // the lit door: the way out
    { const g = at('door'); if (g) { M(BOX(2.4, 3.4, 0.3), glowing('#fff3dc', null, 2.4), 0, 1.7, -0.6, g, 0.03); M(BOX(2.9, 0.3, 0.4), GOLD, 0, 3.5, -0.6, g, 0.02); for (const sx of [-1, 1]) M(BOX(0.25, 3.5, 0.4), GOLD, sx * 1.35, 1.75, -0.6, g, 0.02); glowSprite(0, 1.7, 0, 0xfff3dc, 7, g); const L = new THREE.PointLight(0xfff1d0, 0, 14, 1.6); L.position.set(g.position.x, 2, g.position.z); scene.add(L); roomLights.push({ L, a: a.key, k: 30 }); } }
    // neon along the walls and the dream's motes
    const box = new THREE.Box3(); let n = 0; for (const [y, segs] of a.rows) for (const [x0, x1] of segs) { box.expandByPoint(new THREE.Vector3(...[a.bx + x0 * S, 0, a.bz + y * S])); box.expandByPoint(new THREE.Vector3(a.bx + x1 * S, 0, a.bz + y * S)); }
    const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2, W = box.max.x - box.min.x, Dd = box.max.z - box.min.z;
    for (const [x, z, w, d, m] of [[cx, box.min.z - 0.4, W, 0.1, pink], [cx, box.max.z + 0.4, W, 0.1, cyan], [box.min.x - 0.4, cz, 0.1, Dd, cyan], [box.max.x + 0.4, cz, 0.1, Dd, pink]]) { M(BOX(w, 0.12, d), m, x, 3.0, z, null, 0); M(BOX(w, 0.12, d), m, x, 0.3, z, null, 0); }
    const mg = new THREE.BufferGeometry(), arr = new Float32Array(160 * 3); for (let i = 0; i < 160; i++) arr.set([cx + rr(-W / 2, W / 2), rr(0.3, 6), cz + rr(-Dd / 2, Dd / 2)], i * 3); mg.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    VISION.motes = new THREE.Points(mg, new THREE.PointsMaterial({ color: 0xffe9f4, size: 0.12, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); VISION.motes.visible = false; scene.add(VISION.motes);
    const L = new THREE.PointLight(0xff7ad9, 0, 40, 1.2); L.position.set(cx, 8, cz); scene.add(L); roomLights.push({ L, a: a.key, k: 40 });
  }
  function tickVision(t) {
    const on = !!(St.area && MAPS[St.area].vision);
    if (on !== VISION.on) { VISION.on = on; renderer.domElement.style.transition = 'filter 1.2s'; if (VISION.motes) VISION.motes.visible = on; }
    if (on) { renderer.domElement.style.filter = 'saturate(1.35) hue-rotate(' + (Math.sin(t * 0.4) * 10).toFixed(1) + 'deg) contrast(1.05) blur(' + (0.25 + 0.25 * Math.sin(t * 0.9)).toFixed(2) + 'px)'; if (VISION.wheel) VISION.wheel.rotation.z = t * 1.6; if (VISION.motes) { VISION.motes.rotation.y = Math.sin(t * 0.1) * 0.05; VISION.motes.position.y = Math.sin(t * 0.5) * 0.3; } player.traverse(o => { if (o.isMesh && o.material && !o.userData.ghost) { o.userData.ghost = 1; } }); }
    else if (renderer.domElement.style.filter) renderer.domElement.style.filter = '';
  }


  // ---------------------------------------------------------------- QUESTS: conditions, actions, the log, triggers
  const L2 = v => v == null ? [] : Array.isArray(v) ? v : [v];
  function cond(r) {
    if (r == null) return true; if (r.__c !== undefined) return cond(r.__c);
    if (typeof r === 'string' || Array.isArray(r)) return save.test(r);
    if (typeof r === 'object') { if (r.has != null && !L2(r.has).every(f => save.flag(f))) return false; if (r.not != null && L2(r.not).some(f => save.flag(f))) return false; if (r.flag != null && !save.flag(r.flag)) return false; if (r.slain != null && !L2(r.slain).every(k => save.flag('slain.' + k))) return false; if (r.visited != null && !L2(r.visited).every(k => save.flag(seenKey(k)))) return false; return true; }
    return !!r;
  }
  function act(a) {
    if (typeof a === 'string') { save.setFlag(a); return; } if (!a || typeof a !== 'object') return;
    if (a.set != null) L2(a.set).forEach(f => save.setFlag(f)); if (a.clear != null) L2(a.clear).forEach(f => save.setFlag(f, false));
    if (a.xp) { save.addXp(a.xp); toast('+' + a.xp + ' XP'); } if (a.gold) { save.addGold(a.gold); toast((a.gold > 0 ? '+' : '') + a.gold + ' credits'); }
    if (a.note) { St.banner = { title: a.note[0], sub: '', t: 3.2 }; St.noteText = a.note[1] || ''; St.noteT = 5; audio.tone(660, 0.18, 0.05, 'triangle', 1.4); }
    if (a.call) { St.banner = { title: a.call, sub: '', t: 2.6 }; }
  }
  const QUESTS = D.quests || [];
  function questView(q) {
    if (q.mode === 'log') { let last = null; for (const st of q.steps) if (cond(st.if)) last = st; return last ? { title: q.title, text: last.text, done: !!last.done, started: true } : null; }
    if (q.start && !save.flag(q.start) && !q.steps.some(st => st.done && save.flag(st.done))) return null;
    let last = -1; q.steps.forEach((st, i) => { if (st.done && save.flag(st.done)) last = i; }); const nx = q.steps.slice(last + 1).find(st => !(st.done && save.flag(st.done)));
    return nx ? { title: q.title, text: nx.text, at: L2(nx.at)[0], done: false, started: last >= 0 || q.mode === 'guide' } : { title: q.title, text: q.allDone || 'Done.', done: true, started: true };
  }
  function activeQuest() { const vs = QUESTS.map(questView).filter(Boolean); return vs.find(v => v.started && !v.done && QUESTS.find(q => q.title === v.title).mode === 'log') || vs.find(v => !v.done) || null; }
  const TRIG = (D.triggers || []).map(t => ({ ...t, fired: false }));
  function tickTriggers() { const here = St.area || St.zone; for (const t of TRIG) { if (t.scene !== here || (t.fired && save.flag('trig.' + t.id))) continue; const m = MAPS[t.scene]; if (t.at) { const [X, Z] = toW(m, t.at[0], t.at[1]); if (Math.hypot(X - Pl.x, Z - Pl.z) > t.r * S) continue; } if (!cond(t.if)) continue; t.fired = true; save.setFlag('trig.' + t.id); t.do.forEach(act); } }
  // ---------------------------------------------------------------- BATTLES: hold the core through three waves
  const BAT = { on: false, key: null, wave: 0, hp: 0, max: 0, cx: 0, cz: 0, core: null, turrets: [], hitT: 0, done: false, t: 0 };
  function battleDress(a) {
    const C = a.core || { x: a.spawn[0], y: a.spawn[1], hp: 1600, r: 420 };
    const [cx, cz] = toW(a, C.x, C.y); a.coreW = [cx, cz];
    const g = new THREE.Group(); g.position.set(cx, 0, cz); scene.add(g);
    M(new THREE.CylinderGeometry(4.2, 5, 1.2, 8), toon('#3a404c'), 0, 0.6, 0, g, 0.05); M(new THREE.CylinderGeometry(3.2, 3.6, 0.6, 8), toon('#5a6276'), 0, 1.5, 0, g, 0.04);
    for (let i = 0; i < 4; i++) { const an = i / 4 * Math.PI * 2 + Math.PI / 4; const p = M(BOX(0.7, 4.4, 0.7), toon('#5a6276'), Math.cos(an) * 3.1, 3.2, Math.sin(an) * 3.1, g, 0.03); }
    const core = M(new THREE.OctahedronGeometry(1.6, 0), glowing('#5fe1ff', null, 2.4), 0, 4.4, 0, g, 0.04); core.scale.y = 1.5; core.userData.keep = true; glowSprite(0, 4.4, 0, 0x5fe1ff, 12, g, true);
    const shield = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 16), new THREE.MeshBasicMaterial({ color: 0x5fe1ff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false })); shield.position.y = 3; g.add(shield);
    colliders.push({ c: [cx, cz, 4.6] }); a.coreObj = { g, core, shield };
    for (const c of a.cover || []) { const [X, Z] = toW(a, c.x, c.y); const cg = new THREE.Group(); cg.position.set(X, 0, Z); cg.rotation.y = rr(0, 6); scene.add(cg); for (let k = 0; k < 5; k++) M(new THREE.CapsuleGeometry(0.42, 0.9, 3, 8), toon('#a8916a'), (k - 2) * 0.95, 0.45, 0, cg, 0.03, 0.42).rotation.z = Math.PI / 2; for (let k = 0; k < 4; k++) M(new THREE.CapsuleGeometry(0.42, 0.9, 3, 8), toon('#9a845e'), (k - 1.5) * 0.95, 1.2, 0, cg, 0.03, 0.42).rotation.z = Math.PI / 2; bake(cg); colliders.push({ c: [X, Z, 2.2] }); }
    a.turretObjs = (a.turrets || []).map(t => { const [X, Z] = toW(a, t.x, t.y); const tg = new THREE.Group(); tg.position.set(X, 0, Z); scene.add(tg); M(new THREE.CylinderGeometry(1.4, 1.8, 2.4, 10), toon('#3a3a42'), 0, 1.2, 0, tg, 0.04); const head = new THREE.Group(); head.position.y = 2.8; tg.add(head); M(new THREE.SphereGeometry(1.0, 14, 10), toon('#5a5560'), 0, 0, 0, head, 0.04, 1); M(new THREE.CylinderGeometry(0.2, 0.24, 2.2, 8), toon('#1b1830'), 0, 0.2, 1.1, head, 0.02).rotation.x = Math.PI / 2; M(new THREE.SphereGeometry(0.2, 8, 6), glowing('#ff3a2a', null, 2.4), 0, 0.3, 0.9, head, 0); colliders.push({ c: [X, Z, 1.8] }); return { tg, head, X, Z, hp: 260, hpMax: 260, cd: rr(1, 2), dead: false, name: 'Turret' }; });
  }
  function startBattle(a) {
    if (!a.coreW) return; Object.assign(BAT, { on: true, key: a.key, wave: 0, hp: (a.core && a.core.hp) || 1600, max: (a.core && a.core.hp) || 1600, cx: a.coreW[0], cz: a.coreW[1], done: false, t: 0, next: 2.5 });
    for (const f of FOES) if (f.map === a) { f.dormant = true; f.dead = 0; f.hpNow = f.hpMax; f.lx = f.hx; f.ly = f.hy; f.state = 'idle'; if (f.c) { f.c.visible = false; f.c.scale.setScalar(f.big ? 2.1 : 1); } }
    (a.turretObjs || []).forEach(t => { t.dead = false; t.hp = t.hpMax; t.tg.visible = true; });
    Pl.x = BAT.cx; Pl.z = BAT.cz + 8.5; Pl.face = Math.PI; St.yaw = 0;
  }
  function tickBattle(dt) {
    if (!BAT.on) return; const a = MAPS[BAT.key]; if (St.area !== BAT.key) { BAT.on = false; return; }
    BAT.t += dt; BAT.hitT = Math.max(0, BAT.hitT - dt); const co = a.coreObj; co.core.rotation.y += dt * 1.5; co.shield.material.opacity = 0.06 + BAT.hitT * 0.6; co.core.material.color.set(BAT.hitT > 0 ? '#ff5a3a' : '#5fe1ff');
    const live = FOES.filter(f => f.map === a && !f.dormant && !(f.dead > 0)).length;
    if (!BAT.done && live === 0) { BAT.next -= dt; if (BAT.next <= 0) { if (BAT.wave >= 3) { BAT.done = true; St.banner = { title: 'VICTORY', sub: a.label + ' · the core holds', t: 4 }; save.addGold && save.addGold(60); toast('+60 credits · the pad home is open'); audio.tone(660, 0.5, 0.06, 'triangle', 1.4); }
      else { BAT.wave++; BAT.next = 3; St.banner = { title: 'WAVE ' + BAT.wave, sub: 'Hold the core', t: 2.2 }; audio.tone(220, 0.4, 0.06, 'sawtooth', 1.2); FOES.filter(f => f.map === a && f.wave === BAT.wave).forEach(f => { f.dormant = false; f.dead = 0; f.hpNow = f.hpMax; f.state = 'chase'; }); } } }
    for (const t of a.turretObjs || []) { if (t.dead) continue; const dx = Pl.x - t.X, dz = Pl.z - t.Z, d = Math.hypot(dx, dz); t.head.rotation.y = Math.atan2(dx, dz); t.cd -= dt; if (d < 30 && t.cd <= 0 && !BAT.done) { t.cd = 1.6; const f = { kind: 'gunner', name: 'Turret', x: t.X, z: t.Z, face: Math.atan2(dx, dz), big: false, K: { dmg: 8 }, c: { userData: { P: { muzzle: [0, 2.6, 1.6] } } } }; enemyShot(f, f.face, 14); } }
    if (BAT.hp <= 0 && !BAT.lost) { BAT.lost = true; St.banner = { title: 'THE CORE FELL', sub: 'Back to the dock. Try again.', t: 3 }; setTimeout(() => { BAT.lost = false; startBattle(a); const dk = MAPS[W8 + 'Spacedock']; goTo(dk || MAPS[D.start], null, null); }, 2200); BAT.on = false; }
    St.boss = BAT.on ? { name: 'YOUR CORE · WAVE ' + Math.max(1, BAT.wave) + '/3', hp: Math.max(0, Math.round(BAT.hp / BAT.max * 100)) } : St.boss;
  }
  // ---------------------------------------------------------------- THE SPACE DOCK: a gantry in orbit above the planet
  const PLANET_COL = { gaya: '#a97bdd', jidda: '#3fb7a0', kufa: '#c9965a', luxor: '#d8574a', nebo: '#4f9ee0', ur: '#e08a3a', zion: '#e3c34a', player: '#cfe0f2' };
  const dockFx = [];
  function buildDock(a) {
    const steel = toon('#c9d1dc'), steelD = toon('#5b6577'), cyan = glowing('#5fe1ff', null, 2.0), red = glowing('#ff4a3a', null, 2.4);
    const plate = canvasTex(256, 256, c => { c.fillStyle = '#9aa5b5'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#6d7787'; c.lineWidth = 3; for (let i = 0; i <= 256; i += 64) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); } c.fillStyle = '#7c8696'; for (let i = 8; i < 256; i += 64) for (let j = 8; j < 256; j += 64) { c.fillRect(i, j, 5, 5); c.fillRect(i + 46, j, 5, 5); c.fillRect(i, j + 46, 5, 5); c.fillRect(i + 46, j + 46, 5, 5); } c.fillStyle = 'rgba(255,210,58,0.9)'; for (let i = 0; i < 256; i += 32) c.fillRect(i, 0, 16, 6); });
    for (const [x0, y0, x1, y1] of a.deck) {
      const w = (x1 - x0) * S + 1.2, d = (y1 - y0) * S + 1.2, [cx, cz] = toW(a, (x0 + x1) / 2, (y0 + y1) / 2);
      const t = plate.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 4, d / 4);
      M(BOX(w, 0.7, d), [steelD, steelD, new THREE.MeshToonMaterial({ map: t, gradientMap: grad }), steelD, steelD, steelD], cx, -0.33, cz, null, 0.05);
      // the structure under the deck
      for (let k = 0; k < 3; k++) M(BOX(w * 0.8 - k * 2, 1.2, d * 0.5), steelD, cx, -1.4 - k * 1.3, cz, null, 0.04);
    }
    // railings: posts on the deck edge, a glowing rail on top
    const G = 50, gr = grid(a, G), posts = [];
    for (let j = 0; j < gr.ny; j++) for (let i = 0; i < gr.nx; i++) { if (!gr.at(i, j)) continue; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!gr.at(i + di, j + dj)) { if (di === -1 && Math.abs((j + 0.5) * G - 540) < 130) continue; const [X, Z] = toW(a, (i + 0.5 + di * 0.5) * G, (j + 0.5 + dj * 0.5) * G); posts.push({ x: X, z: Z, s: 1, r: di ? Math.PI / 2 : 0 }); } }
    instanced(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6), steelD, posts.map(p => ({ ...p, y: 0.55 })), false);
    instanced(BOX(G * S + 0.05, 0.08, 0.1), cyan, posts.map(p => ({ ...p, y: 1.12 })), false);
    // the planet below: big, in the world's colour, with a halo
    const [mx, mz] = center(a), pc = new THREE.Color(PLANET_COL[W8] || ST.tint || '#88aacc');
    const planet = new THREE.Mesh(new THREE.SphereGeometry(330, 48, 32), new THREE.MeshToonMaterial({ color: pc, gradientMap: grad, emissive: pc.clone().multiplyScalar(0.25), fog: false }));
    planet.position.set(mx + 60, -400, mz + 220); scene.add(planet);
    const bands = new THREE.Mesh(new THREE.SphereGeometry(332, 48, 32), new THREE.MeshBasicMaterial({ map: canvasTex(256, 128, c => { for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,' + rr(0.05, 0.22) + ')'; c.beginPath(); c.ellipse(rr(0, 256), rr(10, 118), rr(20, 70), rr(2, 6), 0, 0, 7); c.fill(); } }), transparent: true, depthWrite: false, fog: false }));
    bands.position.copy(planet.position); scene.add(bands); dockFx.push({ spin: bands });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(352, 48, 32), new THREE.MeshBasicMaterial({ color: pc.clone().lerp(new THREE.Color('#ffffff'), 0.5), transparent: true, opacity: 0.22, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    halo.position.copy(planet.position); scene.add(halo);
    // your ship, berthed at the west end, nose to the gantry
    const sp = a.spots.ship.p, [sx, sz] = toW(a, sp[0], sp[1]), ship = new THREE.Group(); ship.position.set(sx - 1, 2.0, sz); scene.add(ship);
    const hull = toon('#eef2f7'), acc = toon(ST.accent || '#c42d3c');
    M(new THREE.CapsuleGeometry(1.25, 5.5, 6, 16), hull, 0, 0, 0, ship, 0.05, 1.25).rotation.z = Math.PI / 2;
    M(new THREE.SphereGeometry(0.95, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), glowing('#7fd8ff', null, 0.9), 2.2, 0.75, 0, ship, 0.04, 0.95);
    for (const s2 of [-1, 1]) { const wg = M(BOX(3.2, 0.18, 4.4), acc, -0.8, -0.2, s2 * 2.6, ship, 0.04); wg.rotation.y = s2 * 0.35; M(new THREE.CylinderGeometry(0.45, 0.55, 2.2, 12), steelD, -2.8, -0.2, s2 * 1.6, ship, 0.04).rotation.z = Math.PI / 2; const fl = glowSprite(-4.1, -0.2, s2 * 1.6, 0x5fe1ff, 2.4, ship, true); dockFx.push({ flame: fl }); }
    M(BOX(1.8, 1.6, 0.16), acc, -2.6, 1.2, 0, ship, 0.04);
    const em = emblemTex(ST.crest || '8', { outer: ST.accent || '#c42d3c', ring: ST.trim || '#e6b45a', bg: '#151b3d', stroke: '#7dd3fc' });
    for (const s2 of [-1, 1]) { const dc = new THREE.Mesh(new THREE.CircleGeometry(0.75, 24), new THREE.MeshToonMaterial({ map: em, gradientMap: grad, transparent: true })); dc.position.set(0.2, 0.2, s2 * 1.27); dc.rotation.y = s2 < 0 ? Math.PI : 0; ship.add(dc); }
    dockFx.push({ bob: ship, y: 2.0 });
    // boarding ramp + the orbit exit
    const op = a.orbit || [340, 540], [ox, oz] = toW(a, op[0], op[1]);
    { const [ex] = toW(a, 300, 540); M(BOX(3.2, 0.14, 2.2), steelD, ex - 1.5, 0.38, oz, null, 0.03).rotation.z = -0.25; }
    exitsIn.push({ X: ox, Z: oz, to: '__orbit', label: 'Board your ship: return to orbit', area: a.key, raw: true });
    { const g = new THREE.Group(); g.position.set(ox, 0, oz); scene.add(g); M(new THREE.TorusGeometry(1.0, 0.07, 6, 32), cyan, 0, 0.06, 0, g, 0).rotation.x = Math.PI / 2; }
    // the teleporter: the crest pad with a beam of light
    for (const d of a.doors) {
      const [X, Z] = toW(a, d.x, d.y);
      exitsIn.push({ X, Z, to: d.to, label: d.label, area: a.key, at: d.at, raw: true });
      const g = new THREE.Group(); g.position.set(X, 0, Z); scene.add(g);
      M(new THREE.CylinderGeometry(2.4, 2.6, 0.3, 40), steelD, 0, 0.15, 0, g, 0.03);
      const top = new THREE.Mesh(new THREE.CircleGeometry(2.2, 40), new THREE.MeshToonMaterial({ map: em, gradientMap: grad, emissive: 0xffffff, emissiveMap: em, emissiveIntensity: 0 })); glowMats.push({ m: top.material, k: 0.6 }); top.rotation.x = -Math.PI / 2; top.position.y = 0.31; g.add(top);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.1, 14, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x8fe8ff, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      beam.position.y = 7; g.add(beam); dockFx.push({ beam });
      for (let k = 0; k < 4; k++) { const ang = k * Math.PI / 2 + Math.PI / 4; M(BOX(0.35, 4.2, 0.35), steel, Math.cos(ang) * 3, 2.1, Math.sin(ang) * 3, g, 0.03); M(BOX(0.4, 0.3, 0.4), cyan, Math.cos(ang) * 3, 4.3, Math.sin(ang) * 3, g, 0); }
      for (let k = 0; k < 10; k++) { const sp2 = glowSprite(Math.cos(k) * 1.4, 0, Math.sin(k) * 1.4, 0xbff4ff, 0.6, g, true); dockFx.push({ mote: sp2, ph: k * 0.7 }); }
    }
    // pylons on the landing with blinking red lights, and the dock's sign
    for (const [x, y] of [[860, 216], [1300, 216], [860, 864], [1300, 864]]) { const [X, Z] = toW(a, x, y); M(BOX(0.8, 9, 0.8), steel, X, 4.5, Z, null, 0.04); M(BOX(1.4, 0.4, 1.4), steelD, X, 9.1, Z, null, 0.03); const l = M(new THREE.SphereGeometry(0.28, 10, 8), red, X, 9.5, Z, null, 0); dockFx.push({ blink: l, ph: x * 0.01 + y * 0.003 }); }
    { const [X, Z] = toW(a, 1080, 216), g = new THREE.Group(); g.position.set(X, 0, Z - 0.6); scene.add(g); const t = signTex(String(a.label).toUpperCase(), null, '#5fe1ff'); M(BOX(13, 2.2, 0.25), [steelD, steelD, steelD, steelD, glowing(0, t, 1.5), glowing(0, t, 1.5)], 0, 9.6, 0, g, 0.04); g.rotation.y = Math.PI; }
    // cargo crates on the landing
    for (const [x, y] of [[900, 260], [960, 250], [1260, 820], [1230, 830], [905, 820]]) { const [X, Z] = toW(a, x, y); M(BOX(1.2, 1.2, 1.2), toon(pick(['#d9a64a', '#5b6577', '#c42d3c'])), X, 0.6, Z, null, 0.04).rotation.y = rr(0, 1); }
    const L = new THREE.PointLight(0x9fdcff, 0, 70, 1.2); L.position.set(mx, 10, mz); scene.add(L); roomLights.push({ L, a: a.key, k: 30 });
  }
  let smokeInit = false; const SMK = [];
  function tickFx(t, dt) {
    for (const s2 of SPIN) s2.o.rotation[s2.ax] = t * s2.v;
    for (const s2 of SPIN) if (s2.ax === 'x') s2.o.children.forEach(c => { if (c.userData.cab) c.rotation.x = -t * s2.v; });
    for (const f of FIRES) { const k = 1 + Math.sin(t * 13 + f.ph) * 0.12 + Math.sin(t * 7.3 + f.ph * 2) * 0.08; f.fl.scale.set(1, k, 1); f.fi.scale.set(1, 2 - k, 1); }
    if (!smokeInit) { smokeInit = true; for (const c of smokes.slice(0, 24)) { const v = new THREE.Vector3(c.lx, c.y, c.lz); c.g.localToWorld(v); for (let k = 0; k < 4; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xd8d4dc, transparent: true, depthWrite: false, opacity: 0 })); scene.add(sp); SMK.push({ sp, x: v.x, y: v.y, z: v.z, t: k / 4 }); } } }
    for (const m of SMK) { m.t = (m.t + dt * 0.18) % 1; m.sp.position.set(m.x + m.t * 1.2, m.y + m.t * 4, m.z + Math.sin(m.t * 6) * 0.3); m.sp.scale.setScalar(0.8 + m.t * 2.4); m.sp.material.opacity = Math.sin(m.t * Math.PI) * 0.35; }
  }
  function tickDock(t) {
    for (const f of dockFx) {
      if (f.spin) f.spin.rotation.y = t * 0.01;
      if (f.flame) f.flame.scale.setScalar(2.2 + Math.sin(t * 20) * 0.3);
      if (f.bob) f.bob.position.y = f.y + Math.sin(t * 1.3) * 0.12;
      if (f.beam) f.beam.material.opacity = 0.13 + Math.sin(t * 3) * 0.05;
      if (f.mote) { const y = ((t * 1.6 + f.ph) % 7); f.mote.position.y = y; f.mote.material.opacity = 0.9 * (1 - y / 7); }
      if (f.blink) f.blink.visible = Math.sin(t * 3 + f.ph) > 0.2;
    }
  }
  const PROPS = [
    [/jukebox/i, (g) => { M(BOX(1.0, 1.8, 0.7), toon('#7a1d2a'), 0, 0.9, 0, g, 0.03); M(new THREE.CylinderGeometry(0.5, 0.5, 0.7, 20, 1, false, 0, Math.PI), glowing('#ffcf7a', null, 1.6), 0, 1.8, 0, g, 0.02).rotation.z = Math.PI / 2; }],
    [/dart/i, (g) => { M(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 24), toon('#1e293b'), 0, 1.7, 0, g, 0.02).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 20), toon('#c42d3c'), 0, 1.7, 0.02, g, 0).rotation.x = Math.PI / 2; }],
    [/bar$|counter|cashier|desk|reception|till/i, (g) => { M(BOX(3.2, 1.1, 0.8), WOOD, 0, 0.55, 0, g, 0.03); M(BOX(3.4, 0.1, 1.0), GOLD, 0, 1.12, 0, g, 0.02); }],
    [/altar|shrine|plinth|pedestal/i, (g) => { const st = toon(ST.wall || '#e9e1d2'); M(BOX(4.2, 0.3, 2.8), st, 0, 0.15, 0, g, 0.03); M(BOX(3.4, 0.3, 2.2), st, 0, 0.45, 0, g, 0.03); M(BOX(2.2, 1.0, 1.0), toon('#f4f1ea'), 0, 1.1, 0, g, 0.03); M(BOX(2.4, 0.1, 1.2), GOLD, 0, 1.62, 0, g, 0.02); M(BOX(2.3, 0.6, 0.04), toon(ST.accent || '#c42d3c'), 0, 1.25, 0.52, g, 0);
      for (const sx of [-0.8, 0.8]) { M(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 8), GOLD, sx, 1.92, 0, g, 0); M(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 6), toon('#f4ecd8'), sx, 2.25, 0, g, 0); glowSprite(sx, 2.42, 0, 0xffc070, 1.0, g); }
      const c = M(new THREE.OctahedronGeometry(0.42, 0), glowing(W8 === 'gaya' ? '#58d8ff' : ST.accent || '#58d8ff', null, 2.0), 0, 2.4, 0, g, 0.02); c.scale.y = 1.6; c.userData.keep = true; glowSprite(0, 2.4, 0, 0x8fd8ff, 3.4, g); }],
    [/crest/i, (g) => { M(new THREE.CylinderGeometry(1.6, 1.6, 0.1, 40), toon(ST.accent || '#c42d3c'), 0, 0.05, 0, g, 0); }],
    [/throne/i, (g) => { const st = toon(ST.wall || '#e9e1d2'), rc = toon(ST.roof || '#6b4f8f');
      for (let k = 0; k < 3; k++) M(BOX(6.4 - k * 1.3, 0.28, 5.0 - k * 1.0), k % 2 ? st : toon(ST.accent || '#c42d3c'), 0, 0.14 + k * 0.28, -0.4 - k * 0.3, g, 0.03);
      const y0 = 0.84; M(BOX(1.6, 0.55, 1.3), GOLD, 0, y0 + 0.28, -1.2, g, 0.03); M(BOX(1.4, 0.18, 1.1), rc, 0, y0 + 0.62, -1.15, g, 0.01); M(BOX(1.6, 2.8, 0.32), rc, 0, y0 + 1.7, -1.8, g, 0.04); M(BOX(1.8, 0.3, 0.42), GOLD, 0, y0 + 3.2, -1.8, g, 0.02);
      for (const sx of [-1, 1]) { M(BOX(0.2, 0.7, 1.2), GOLD, sx * 0.85, y0 + 0.75, -1.2, g, 0.02); M(new THREE.SphereGeometry(0.16, 10, 8), GOLD, sx * 0.85, y0 + 1.15, -0.65, g, 0.01); }
      const cr = M(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 20), GOLD, 0, y0 + 2.6, -1.62, g, 0); cr.rotation.x = Math.PI / 2; const em = new THREE.Mesh(new THREE.CircleGeometry(0.4, 20), new THREE.MeshBasicMaterial({ map: CREST_EMB() })); em.position.set(0, y0 + 2.6, -1.58); g.add(em);
      for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 3.0), bannerM); b.position.set(sx * 2.4, 2.4, -2.1); g.add(b); M(BOX(1.3, 0.1, 0.1), GOLD, sx * 2.4, 3.95, -2.1, g, 0);
        M(new THREE.CylinderGeometry(0.28, 0.4, 1.0, 10), toon('#3a3440'), sx * 3.0, 0.5, 0.8, g, 0.02); const fl = M(new THREE.ConeGeometry(0.3, 0.8, 8), glowing('#ff9a3a', null, 2.4), sx * 3.0, 1.35, 0.8, g, 0); fl.userData.keep = true; FIRES.push({ fl, fi: fl, ph: sx }); glowSprite(sx * 3.0, 1.4, 0.8, 0xff9a40, 3.2, g); } }],
    [/pew|bench/i, (g) => { M(BOX(2.6, 0.5, 0.6), WOOD, 0, 0.25, 0, g, 0.02); }],
    [/barrel|keg/i, (g) => { M(new THREE.CylinderGeometry(0.42, 0.38, 0.95, 14), toon('#7a5236'), 0, 0.48, 0, g, 0.03, 0.42); }],
    [/bed|bunk|futon/i, (g) => { M(BOX(1.1, 0.5, 2.0), toon('#e9e1d2'), 0, 0.25, 0, g, 0.02); M(BOX(1.1, 0.12, 0.6), toon(ST.accent || '#c42d3c'), 0, 0.56, -0.6, g, 0); }],
    [/shel|stack|rack|book|scroll|catalog/i, (g) => { M(BOX(2.2, 2.2, 0.5), WOOD, 0, 1.1, 0, g, 0.03); for (let k = 0; k < 3; k++) M(BOX(1.9, 0.08, 0.45), toon('#3a2618'), 0, 0.5 + k * 0.6, 0.03, g, 0); }],
    [/table|pool|ping|board|chart|map/i, (g) => { M(BOX(1.8, 0.12, 1.1), toon('#3f8a46'), 0, 0.8, 0, g, 0.02); M(BOX(0.12, 0.8, 0.12), DARK, 0, 0.4, 0, g, 0); }],
    [/lamp|torch|brazier|candle|lantern|sconce|fire/i, (g) => { M(new THREE.CylinderGeometry(0.25, 0.18, 0.9, 10), DARK, 0, 0.45, 0, g, 0.02); M(new THREE.ConeGeometry(0.22, 0.5, 8), lampM, 0, 1.1, 0, g, 0); glowSprite(0, 1.15, 0, 0xffa040, 2.6, g); }],
    [/pool$|pond|bath|plunge|spring/i, (g) => { const w = new THREE.Mesh(new THREE.CircleGeometry(2.2, 28), new THREE.MeshToonMaterial({ color: '#4fb7d8', gradientMap: grad, transparent: true, opacity: 0.85 })); w.rotation.x = -Math.PI / 2; w.position.y = 0.06; g.add(w); }],
    [/ring|mat|pad|stage|court|dohyo/i, (g) => { M(new THREE.TorusGeometry(2.0, 0.1, 6, 40), accentGlow, 0, 0.08, 0, g, 0).rotation.x = Math.PI / 2; }],
  ];
  function prop(a, name, sp) {
    const fn = PROPS.find(([re]) => re.test(name)); if (!fn) return;
    const pts = sp.pts ? sp.pts.slice(0, 12) : sp.p ? [sp.p] : [];
    const [eX, eZ] = toW(a, a.entrance[0], a.entrance[1]);
    for (const p of pts) { const [X, Z] = toW(a, p[0], p[1]); const g = new THREE.Group(); g.position.set(X, 0, Z); if (/throne|altar|shrine|pulpit/i.test(name)) g.rotation.y = Math.atan2(eX - X, eZ - Z); scene.add(g); fn[1](g); if (/throne|altar/i.test(name)) bake(g); }
  }

  // ---------------------------------------------------------------- minigames: the original games, in a panel
  const MG_TABLE = {
    jidda: [['jSmoothie', null, 'jidda/smoothie.html', 'Foxy Blends: smoothie shift'], ['jSurfContest', 'spawn', '../minigames3d/surf.html', 'Surf Contest'], ['jTown', 'docks', '../minigames3d/surf.html', 'Surf Contest']],
    zion: [['zionBakery', null, 'zion/bakery.html', 'Bakery shift'], ['zionMonsterArena', 'mound.standAt', '../minigames3d/trucks.html', 'Monster Crush'], ['zionGoldRiver', 'camp', '../minigames3d/gold.html', 'Gold Panning'], ['zionMonsterTruckPath', 'arenaGate', '../minigames3d/trucks.html', 'Monster Crush']],
    luxor: [['luxorTownSquare', 'shops.deli', 'luxor/deli.html', 'Foxy Deli']],
    ur: [['urTownSquare', 'doorsCoffeeArrive', 'ur/espresso.html', 'Espresso with Ku-bau']],
    earth: [['earthRaceway', 'grid', '../minigames3d/speedway.html', 'Eight Mile Speedway'], ['earthCasino', null, 'earth/blackjack.html', 'Blackjack'], ['earthCasino', null, 'earth/roulette.html', 'Roulette'], ['earthCasino', null, 'earth/craps.html', 'Craps'],
            ['earthPyramid', 'highTable', 'earth/blackjack.html', 'The high table'], ['earthPyramid', null, 'earth/roulette.html', 'Roulette'], ['earthPyramid', null, 'earth/craps.html', 'Craps']],
  }[W8] || [];
  { const F = { kufa: [['kufaOasis', 'dock']], ur: [['urHuntersPond', 'rowboat'], ['urCleanLake', 'house']], gaya: [['gayaMountainBase', 'bridge']], player: [['gayaCanyon', 'jetty']], jidda: [['jFarm', 'docks']] }[W8] || [];
    for (const [k, sp] of F) MG_TABLE.push([k, sp, '../minigames3d/fishing.html?w=' + W8, 'Fishing']); }
  if (W8 === 'nebo') MG_TABLE.push(['neboGiantTreeTop', 'gliders', '../minigames3d/glider.html', 'Nebo Glider'], ['neboGiantTreePath', 'gliders', '../minigames3d/glider.html', 'Nebo Glider']);
  if (W8 === 'gaya') MG_TABLE.push(['kyotoMountainPath', 'archeryStand', '../minigames3d/archery.html', 'Kyoto Archery'], ['gayaStadium', 'umpire', '../minigames3d/tennis.html', 'The Gaya Open'], ['gayaStadiumPath', 'gateRect', '../minigames3d/tennis.html', 'The Gaya Open'], ['earthCasino', 'wheel', 'earth/roulette.html', 'Roulette'], ['earthCasino', 'cards', 'earth/blackjack.html', 'Blackjack'], ['earthCasino', 'dice', 'earth/craps.html', 'Craps'], ['earthCasino', 'machines', 'meru/slot1.html', 'Slots']);
  // every tavern has darts and the jukebox (the shared Meru games, as in the 2D game)
  for (const m of Object.values(MAPS)) if (/tavern/i.test(m.key + ' ' + m.label) && m.kind !== 'zone') { MG_TABLE.push([m.key, 'dartboard', 'meru/darts.html', 'Darts']); MG_TABLE.push([m.key, 'jukebox', 'meru/jukebox.html', 'Jukebox']); }
  const GAMES = [];
  function placeGames(m) {
    if (m.gamesPlaced) return; m.gamesPlaced = true;
    let k = 0;
    for (const [key, spot, file, label] of MG_TABLE) {
      if (key !== m.key) continue;
      const sp = spot && m.spots && m.spots[spot]; let p = sp ? (sp.p || (sp.pts && sp.pts[0])) : null;
      if (!p) { const c = [m.w / 2, m.h / 2]; p = [c[0] + (k - 1) * 150, c[1] + 60]; }
      k++;
      const q = nearestWalk(m, p[0], p[1]); const [X, Z] = toW(m, q[0], q[1]);
      const g = new THREE.Group(); g.position.set(X, 0, Z); scene.add(g);
      M(new THREE.TorusGeometry(0.9, 0.07, 6, 32), glowing('#ffd23a', null, 1.8), 0, 0.08, 0, g, 0).rotation.x = Math.PI / 2;
      const t = signTex(label.toUpperCase().slice(0, 16), null, '#ffd23a'); M(BOX(2.6, 0.65, 0.1), [DARK, DARK, DARK, DARK, glowing(0, t, 1.4), glowing(0, t, 1.4)], 0, 2.4, 0, g, 0.02);
      GAMES.push({ X, Z, file, label, map: m.key });
    }
  }

  // ---------------------------------------------------------------- foxes
  const { makeFox, animFox, moodOf } = foxKit({ THREE, scene, toon, M, grad, outlineMat: foxOutline, crestTex, rr, pick, clamp, smooth, damp });
  const player = makeFox({ torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', mood: 'warm', look: PLAYER_MALE, outfit: 'armor', gear: 'both' });
  bakeLocal(player);
  const Pl = { x: 0, y: 0.06, z: 0, vx: 0, vz: 0, vy: 0, face: 0, ground: true, stepT: 0, hp: 100, hurtT: 0, swing: 0, cd: 0 };
  const CRESTS = new Set(['8', 'U', 'L', 'J', 'G', 'M']);
  const crestFor = c => { const l = String(c || ST.crest || '8').trim().charAt(0).toUpperCase(); return CRESTS.has(l) ? l : (CRESTS.has(ST.crest) ? ST.crest : '8'); };
  const OUTFITS = ['coat', 'vest', 'robe', 'dress', 'suit'];
  function outfitFor(n) { const r = (n.role || '') + ' ' + (n.name || ''); if (/guard|sentry|warden|captain|sergeant|soldier|knight|samurai|marshal|trooper|master of arms/i.test(r)) return 'armor'; if (/king|queen|emir|steward|elder|emperor|empress|ruler|mayor/i.test(r)) return 'royal'; if (/priest|monk|acolyte|novice|cleric|abbot|sister|brother|keeper of/i.test(r)) return 'robe'; if (/barkeep|cook|chef|keeper|trader|shop|clerk|baker/i.test(r)) return 'vest'; return OUTFITS[(n.name || 'x').length % OUTFITS.length]; }
  const NPCS = [];
  function nearestWalk(m, x, y) {
    if (walkLocal(m, x, y)) return [x, y];
    for (let r = 30; r < 900; r += 30) for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283, xx = x + Math.cos(a) * r, yy = y + Math.sin(a) * r; if (walkLocal(m, xx, yy)) return [xx, yy]; }
    return [m.spawn[0], m.spawn[1]];
  }
  for (const n of D.npcs) {
    const m = MAPS[n.scene]; if (!m || m.kind === 'battle') continue;
    let at = n.at;
    if (n.lane) { const L = n.lane; let hh = 0; for (const ch of n.name) hh = (hh * 31 + ch.charCodeAt(0)) >>> 0; const t = 0.08 + (hh % 1000) / 1000 * 0.3 + (hh % 2) * 0.54, a0 = L.a || 0, b0 = L.b || (L.axis === 'NS' ? m.h : m.w), v = a0 + (b0 - a0) * t; at = L.axis === 'NS' ? [L.lane, v] : [v, L.lane]; }
    if (!at) {   // no spot of their own: somewhere walkable in their place, the same every visit
      let hsh = 0; for (const ch of n.name + n.scene) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
      for (let k = 0; k < 40 && !at; k++) { hsh = (hsh * 1103515245 + 12345) >>> 0; const x = (hsh % 1000) / 1000 * m.w; hsh = (hsh * 1103515245 + 12345) >>> 0; const y = (hsh % 1000) / 1000 * m.h; if (walkLocal(m, x, y) && Math.hypot(x - m.spawn[0], y - m.spawn[1]) > 220) at = [x, y]; }
      if (!at) at = [m.spawn[0] + rr(-300, 300), m.spawn[1] + rr(-300, 300)];
    }
    at = nearestWalk(m, at[0], at[1]);
    const rec = { ...n, map: m, lx: at[0], ly: at[1], c: null, face: rr(0, 6), speedNow: 0, wait: rr(0, 3), dir: 1, lookV: new THREE.Vector3() };
    [rec.x, rec.z] = m.kind === 'zone' || m.built !== undefined ? [0, 0] : [0, 0];
    NPCS.push(rec);
  }
  function npcPos(n) { const [X, Z] = toW(n.map, n.lx, n.ly); n.x = X; n.z = Z; }
  // nobody stands on the arrival pad or inside someone else: a ring around the pad, then a gentle spread
  for (const m of Object.values(MAPS)) {
    const here = NPCS.filter(n => n.map === m && !n.lane); if (!here.length) continue;
    const pad = (m.spots && m.spots.transportPad && m.spots.transportPad.p) || m.spawn;
    let k = 0; for (const n of here) { if (Math.hypot(n.lx - pad[0], n.ly - pad[1]) < 200) { const a = 0.6 + k * 0.9, r = 230 + (k % 3) * 70; const q = nearestWalk(m, pad[0] + Math.cos(a) * r, pad[1] + Math.sin(a) * r); n.lx = q[0]; n.ly = q[1]; k++; } }
    for (let it = 0; it < 6; it++) for (let i = 0; i < here.length; i++) for (let j = i + 1; j < here.length; j++) { const A = here[i], B = here[j], dx = B.lx - A.lx, dy = B.ly - A.ly, d = Math.hypot(dx, dy); if (d < 70) { const push = (70 - d) / 2 + 1, ux = d > 0.01 ? dx / d : 1, uy = d > 0.01 ? dy / d : 0; if (walkLocal(m, A.lx - ux * push, A.ly - uy * push)) { A.lx -= ux * push; A.ly -= uy * push; } if (walkLocal(m, B.lx + ux * push, B.ly + uy * push)) { B.lx += ux * push; B.ly += uy * push; } } }
    for (const n of here) n.face = Math.atan2(pad[0] - n.lx, pad[1] - n.ly) + rr(-0.6, 0.6);
  }
  NPCS.forEach(npcPos);
  // bake a fox: inside each moving part, merge the still meshes by material (keeps every animated joint)
  function bakeLocal(root) {   // per animated joint: merge every still mesh beneath it (any depth) by material; outlines into one
    const P = root.userData.P || {}, keep = new Set([root]);
    for (const v of Object.values(P)) { if (Array.isArray(v)) v.forEach(x => x && x.isObject3D && keep.add(x)); else if (v && v.isObject3D) keep.add(v); }
    root.updateMatrixWorld(true);
    const EMPTY = new THREE.BufferGeometry(), inv = new THREE.Matrix4(), m = new THREE.Matrix4();
    const ok = o => o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && !Array.isArray(o.material) && !o.material.map && !o.material.transparent && !o.userData.keep && !keep.has(o);
    for (const A of keep) {
      inv.copy(A.matrixWorld).invert(); const groups = new Map(), outl = [];
      const visit = o => { for (const c of o.children) { if (keep.has(c)) continue; if (c.isMesh && (c.material === outlineMat || c.material === foxOutline)) { if (c.geometry !== EMPTY) outl.push(c); } else if (ok(c)) { const k = c.material.uuid; if (!groups.has(k)) groups.set(k, { mat: c.material, list: [] }); groups.get(k).list.push(c); } visit(c); } };
      visit(A);
      const merge = list => { const pos = [], nor = []; for (const c of list) { const g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone(); m.multiplyMatrices(inv, c.matrixWorld); g.applyMatrix4(m); pos.push(...g.attributes.position.array); if (g.attributes.normal) nor.push(...g.attributes.normal.array); } const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (nor.length === pos.length) out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); else out.computeVertexNormals(); out.computeBoundingSphere(); return out; };
      for (const { mat, list } of groups.values()) { if (list.length < 2) continue; const mm = new THREE.Mesh(merge(list), mat); mm.castShadow = true; A.add(mm); list.forEach(c => { c.geometry = EMPTY; c.castShadow = false; }); }
      const ol = outl.filter(c => c.parent && c.parent.geometry === EMPTY || true); if (ol.length > 1) { A.add(new THREE.Mesh(merge(ol), foxOutline)); ol.forEach(c => c.geometry = EMPTY); }
    }
    // drop the emptied meshes that carry nothing alive beneath them
    const dead = []; root.traverse(o => { if (o.isMesh && o.geometry === EMPTY && !o.children.some(c => !(c.isMesh && c.geometry === EMPTY))) dead.push(o); });
    for (const o of dead.reverse()) if (o.parent && !o.children.length) o.parent.remove(o);
    return root;
  }

  function ensureFox(n) {
    if (n.c) return n.c;
    const look = /she|her|woman|wife|sister|queen|empress|geisha|landlady|fisherwoman/i.test((n.bio || '') + ' ' + (n.role || '')) ? PLAYER_FEMALE : PLAYER_MALE;
    n.c = makeFox({ torso: n.colors || ['#f7f1e6', ST.accent || '#7a5236', '#3a2618'], crest: crestFor(n.crest), mood: 'warm', look, outfit: outfitFor(n), gear: 'none', crown: /king|queen|emperor|empress/i.test(n.role || '') });
    bakeLocal(n.c);
    return n.c;
  }

  zones.forEach(placeGames);
  // ---------------------------------------------------------------- creatures in the wilds
  const FOES = [];
  const CK = creatureKit({ THREE, M, toon, glowing, BOX, makeFox, animFox, bakeLocal, rr, pick, ST, scene });
  for (const f of D.foes || []) {
    const m = MAPS[f.scene]; if (!m) continue;
    if (m.key === D.start || /town|square|strip|promenade|bazaar/i.test(m.key + ' ' + m.label) || (m.interior && !/cave|hideout|vault|fort|pyramid|hall|gate|shaft|gallery|drop/i.test(m.key))) continue;   // creatures stay out of town
    let at = nearestWalk(m, f.at[0], f.at[1]); const kind = classify(f.name, f.ranged), K = KINDS[kind];
    if (m.kind !== 'battle') { const safe = [m.spawn, m.entrance, ...(m.exits || []).map(e => [(e.rect[0] + e.rect[2]) / 2, (e.rect[1] + e.rect[3]) / 2]), ...(m.doors || []).map(d => [d.x, d.y])].filter(Boolean); const R0 = f.big ? 900 : 480;
      const tooNear = (x, y) => safe.some(q => Math.hypot(q[0] - x, q[1] - y) < R0);
      if (tooNear(at[0], at[1])) { let best = null; for (let r = 200; r < 2400 && !best; r += 120) for (let k = 0; k < 16; k++) { const a2 = k / 16 * 6.283, x = at[0] + Math.cos(a2) * r, y = at[1] + Math.sin(a2) * r; if (x < 0 || y < 0 || x > m.w || y > m.h) continue; if (walkLocal(m, x, y) && !tooNear(x, y)) { best = [x, y]; break; } } if (best) at = best; } }
    const hp = Math.round((f.hp || 60) * K.hp * (f.big ? 3.5 : 1));
    const bat = m.kind === 'battle', wave = bat ? (FOES.filter(o => o.map === m).length % 3) + 1 : 0;
    FOES.push({ ...f, kind, K, map: m, bat, wave, dormant: bat, hx: at[0], hy: at[1], lx: at[0], ly: at[1], hpMax: hp, hpNow: hp, c: null, dead: 0, t: rr(0, 9), state: 'idle', st: 0, cd: rr(0.5, 1.5), vx: 0, vz: 0, face: rr(0, 6), speedNow: 0, hits: 0 });
  }
  function ensureFoe(f) { if (!f.c) f.c = CK.build(f); return f.c; }
  // ---- combat effects: sparks, damage numbers, coins, shots, telegraph rings, shockwaves
  const FX = { sparks: [], nums: [], coins: [], shots: [], waves: [] };
  const SPK_N = 260, spkGeo = new THREE.BufferGeometry(), spkArr = new Float32Array(SPK_N * 3), spkCol = new Float32Array(SPK_N * 3), spkV = Array.from({ length: SPK_N }, () => ({ v: new THREE.Vector3(), life: 0 }));
  spkGeo.setAttribute('position', new THREE.BufferAttribute(spkArr, 3)); spkGeo.setAttribute('color', new THREE.BufferAttribute(spkCol, 3));
  const spkPts = new THREE.Points(spkGeo, new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, map: glowTex })); spkPts.frustumCulled = false; scene.add(spkPts); let spkI = 0;
  for (let i = 0; i < SPK_N; i++) spkArr[i * 3 + 1] = -99;
  function burst(x, y, z, color, n = 14, sp = 6) { const c = new THREE.Color(color); for (let k = 0; k < n; k++) { const i = spkI = (spkI + 1) % SPK_N; spkV[i].life = rr(0.3, 0.7); spkV[i].v.set(rr(-1, 1), rr(0.2, 1.4), rr(-1, 1)).normalize().multiplyScalar(rr(0.4, 1) * sp); spkArr.set([x, y, z], i * 3); spkCol.set([c.r, c.g, c.b], i * 3); } spkGeo.attributes.color.needsUpdate = true; }
  const numCache = {};
  function numTex(txt, col) { const k = txt + col; if (numCache[k]) return numCache[k]; return numCache[k] = canvasTex(128, 64, c => { c.font = '900 44px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 8; c.strokeStyle = '#1b1830'; c.strokeText(txt, 64, 34); c.fillStyle = col; c.fillText(txt, 64, 34); }); }
  function dmgNum(x, y, z, txt, col = '#ffffff', big = false) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: numTex(String(txt), col), transparent: true, depthTest: false })); sp.position.set(x + rr(-0.3, 0.3), y, z + rr(-0.3, 0.3)); sp.scale.set(big ? 1.6 : 1.1, big ? 0.8 : 0.55, 1); sp.renderOrder = 10; scene.add(sp); FX.nums.push({ sp, t: 0.8 }); }
  const coinGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 12), coinMat = glowing('#ffd23a', null, 1.4);
  function dropCoins(x, z, n) { for (let i = 0; i < n; i++) { const m = new THREE.Mesh(coinGeo, coinMat); m.position.set(x, 1, z); scene.add(m); FX.coins.push({ m, v: new THREE.Vector3(rr(-3, 3), rr(4, 7), rr(-3, 3)), t: 0 }); } }
  const shotGeo = new THREE.SphereGeometry(0.22, 10, 8);
  function enemyShot(f, ang, speed = 11) { const col = f.kind === 'snowman' ? '#f4f8fc' : f.kind === 'gunner' ? '#ff5a3a' : /seed|cone|thorn|spore/i.test(f.name) ? '#9fff5a' : /ember|vent|slag/i.test(f.name) ? '#ff7a3a' : '#c084fc'; const m = new THREE.Mesh(shotGeo, glowing(col, null, 2.4)); const mz = f.c.userData.P.muzzle || [0, 1, 0.8]; const sc = f.big ? 2.1 : 1; m.position.set(f.x + Math.sin(f.face) * mz[2] * sc, (mz[1] || 1) * sc * 0.8 + (f.K.fly || 0), f.z + Math.cos(f.face) * mz[2] * sc); scene.add(m); glowSprite(0, 0, 0, new THREE.Color(col).getHex(), 1.6, m, true); FX.shots.push({ m, v: new THREE.Vector3(Math.sin(ang) * speed, 0, Math.cos(ang) * speed), t: 2.2, dmg: f.K.dmg * (f.big ? 1.5 : 1), col }); audio.tone(f.kind === 'gunner' ? 700 : 300, 0.08, 0.04, 'square', f.kind === 'gunner' ? 0.6 : 1.4); }
  const ringGeo = new THREE.RingGeometry(0.85, 1, 40);
  function teleRing(f) { if (!f.ring) { f.ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xff3a3a, transparent: true, opacity: 0.7, depthWrite: false })); f.ring.rotation.x = -Math.PI / 2; scene.add(f.ring); } return f.ring; }
  function shockwave(x, z, r, dmg, col = '#ffcf8a') { const m = new THREE.Mesh(new THREE.RingGeometry(0.6, 1, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.15, z); scene.add(m); FX.waves.push({ m, t: 0, r, dmg, x, z, hit: false }); St.shake = Math.max(St.shake || 0, 0.25); audio.burst(0.25, 120, 0.35); burst(x, 0.4, z, col, 18, 7); }
  let hpBarCache = {};
  function hpBar(f) { const pct = Math.max(0, Math.round(f.hpNow / f.hpMax * 20)); if (!f.bar) { f.bar = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false })); f.bar.renderOrder = 9; scene.add(f.bar); } if (f.barPct !== pct) { f.barPct = pct; const k = pct + (f.big ? 'b' : ''); f.bar.material.map = hpBarCache[k] || (hpBarCache[k] = canvasTex(64, 8, c => { c.fillStyle = '#1b1830'; c.fillRect(0, 0, 64, 8); c.fillStyle = f.big ? '#ffd23a' : '#ec3013'; c.fillRect(1, 1, 62 * pct / 20, 6); })); f.bar.material.needsUpdate = true; } f.bar.scale.set(f.big ? 2.6 : 1.4, f.big ? 0.32 : 0.18, 1); }

  // ---------------------------------------------------------------- state, input
  const audio = new Ambience();
  const St = { mode: 'attract', time: opts.startHour % 24, weather: 'clear', wRain: 0, wFog: 0, yaw: 0, pitch: 0.4, dist: 9.5, t: 0, dialog: null, near: null, spot: null, area: null, zone: null, intro: null, toast: null, muted: false, asked: {} };
  const pal = { top: new THREE.Color(), hor: new THREE.Color(), fog: new THREE.Color(), light: new THREE.Color(), hs: new THREE.Color(), hg: new THREE.Color() };
  const keys = new Set(), input = { jx: 0, jy: 0, jump: false };
  const camPos = new THREE.Vector3(30, 18, 30), camLook = new THREE.Vector3(), v3 = new THREE.Vector3(), grey = new THREE.Color();
  // start: the start zone's transport pad / spawn
  { const m = MAPS[D.start]; const [X, Z] = toW(m, m.spawn[0], m.spawn[1]); Pl.x = X; Pl.z = Z; }
  const fade = document.createElement('div'); fade.style.cssText = 'position:absolute;inset:0;background:#0b0a12;opacity:0;pointer-events:none;transition:opacity .28s ease;z-index:5'; container.appendChild(fade);
  const onKeyDown = e => {
    if (St.dialog && St.dialog.choices && /^Digit[1-9]$/.test(e.code)) { api.choose(+e.code.slice(5) - 1); return; }
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || St.playing) return;
    if (St.mode === 'intro' && (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE')) { api.continueIntro(); return; }
    if (St.mode !== 'play') return; keys.add(e.code);
    if (!St.dialog) { if (e.code === 'Digit1') api.melee(); else if (e.code === 'Digit2') api.range(); else if (e.code === 'Digit3' || e.code === 'Space') input.jump = true; else if (e.code === 'Digit4') api.item(); }
    if (e.code === 'KeyE' || e.code === 'Enter') api.talk();
  };
  const onKeyUp = e => keys.delete(e.code), onBlur = () => keys.clear();
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); window.addEventListener('blur', onBlur);
  const el = renderer.domElement, ptrs = new Map();
  const joyBase = document.createElement('div'), joyKnob = document.createElement('div');
  joyBase.style.cssText = 'position:absolute;width:112px;height:112px;border:2px solid #f3f2f2;background:rgba(32,30,29,.25);transform:translate(-50%,-50%);display:none;pointer-events:none;';
  joyKnob.style.cssText = 'position:absolute;width:44px;height:44px;background:#ec3013;transform:translate(-50%,-50%);display:none;pointer-events:none;';
  container.append(joyBase, joyKnob);
  el.addEventListener('pointerdown', e => {
    audio.init();
    if (St.mode !== 'play') return; el.setPointerCapture(e.pointerId); const r = el.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top;
    const joy = e.pointerType === 'touch' && lx < r.width * 0.45 && ![...ptrs.values()].some(p => p.joy);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, ox: lx, oy: ly, joy });
    if (joy) { joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.left = joyKnob.style.left = lx + 'px'; joyBase.style.top = joyKnob.style.top = ly + 'px'; }
  });
  el.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if (!p) return; if (p.joy) { const r = el.getBoundingClientRect(); let dx = e.clientX - r.left - p.ox, dy = e.clientY - r.top - p.oy; const l = Math.hypot(dx, dy); if (l > 50) { dx *= 50 / l; dy *= 50 / l; } input.jx = dx / 50; input.jy = -dy / 50; joyKnob.style.left = p.ox + dx + 'px'; joyKnob.style.top = p.oy + dy + 'px'; } else { const k = e.pointerType === 'touch' ? 0.008 : 0.005; St.dragT = 1.2; St.yaw -= (e.clientX - p.x) * k; St.pitch = clamp(St.pitch + (e.clientY - p.y) * k * 0.8, 0.05, 1.25); } p.x = e.clientX; p.y = e.clientY; });
  const endPtr = e => { const p = ptrs.get(e.pointerId); if (p && p.joy) { input.jx = input.jy = 0; joyBase.style.display = joyKnob.style.display = 'none'; } ptrs.delete(e.pointerId); };
  el.addEventListener('pointerup', endPtr); el.addEventListener('pointercancel', endPtr);
  el.addEventListener('wheel', e => { if (St.mode !== 'play') return; St.dist = clamp(St.dist + e.deltaY * 0.01, 4, 20); e.preventDefault(); }, { passive: false });
  el.addEventListener('contextmenu', e => e.preventDefault());
  const ro = new ResizeObserver(() => { renderer.setSize(Wd(), Ht()); camera.aspect = Wd() / Ht(); camera.updateProjectionMatrix(); }); ro.observe(container);

  // ---------------------------------------------------------------- walking
  const PR = 0.34;
  function walkable(X, Z) {
    if (St.area) { const a = MAPS[St.area]; const [x, y] = toL(a, X, Z); return walkLocal(a, x, y); }
    const z = zoneAt(X, Z); if (z) { const [x, y] = toL(z, X, Z); if (walkLocal(z, x, y)) return true; }
    return onRoad(X, Z);
  }
  const free = (x, z) => walkable(x, z) && walkable(x + PR, z) && walkable(x - PR, z) && walkable(x, z + PR) && walkable(x, z - PR);
  function pushProps(o, r) {
    if (St.area) return;
    for (const c of colliders) {
      if (c.c) { if (Math.abs(o.x - c.c[0]) > 3 || Math.abs(o.z - c.c[1]) > 3) continue; const dx = o.x - c.c[0], dz = o.z - c.c[1], d = Math.hypot(dx, dz), m = c.c[2] + r; if (d < m && d > 1e-5) { o.x = c.c[0] + dx / d * m; o.z = c.c[1] + dz / d * m; } }
      else if (c.box) { const [x0, x1, z0, z1] = c.box; const qx = clamp(o.x, x0, x1), qz = clamp(o.z, z0, z1), ex = o.x - qx, ez = o.z - qz, d = Math.hypot(ex, ez); if (d > 0 && d < r) { o.x = qx + ex / d * r; o.z = qz + ez / d * r; } }
    }
  }
  function moveWithWalls(o, nx, nz, r) {
    const ox = o.x, oz = o.z;
    if (free(nx, nz)) { o.x = nx; o.z = nz; } else if (free(nx, oz)) o.x = nx; else if (free(ox, nz)) o.z = nz;
    const bx = o.x, bz = o.z; pushProps(o, r); if (!free(o.x, o.z)) { o.x = bx; o.z = bz; }
  }

  // ---------------------------------------------------------------- places, intros, music
  const seenKey = k => W8 + '.seen.' + k;
  function center(m) { return [m.bx + m.w * S / 2, m.bz + m.h * S / 2]; }
  function worldName(m) { return W8 === 'gaya' && /^(kyoto|earth)/.test(m.key) ? (m.vision ? 'Earth · a dream' : 'Earth') : D.name; }
  function startIntro(m, first) {
    const [cx, cz] = center(m);
    St.intro = { key: m.key, label: m.label, world: worldName(m), text: m.intro || m.note || '', cx, cz, r: clamp(Math.max(m.w, m.h) * S * 0.55, 14, 70), t: 0, first: !!first };
    St.mode = 'intro'; St.dialog = null;
  }
  function enterPlace(m) {
    if (!m) return;
    save.where(W8, m.key);
    const first = !save.test(seenKey(m.key)); if (first) { save.setFlag(seenKey(m.key)); if (m.intro && St.mode === 'play') startIntro(m); }
    if (St.mode === 'play' && !(first && m.intro)) St.banner = { title: m.label, sub: worldName(m) + (first ? ' · new place' : ''), t: 2.6 };
    setMusic(m.music || (m.kind === 'zone' ? D.music && D.music.default : null) || (m.kind === 'zone' ? (MAPS[D.start].music) : null));
  }
  const tracks = {}; let curTrack = null;
  function setMusic(src) {
    if (src === curTrack) return; curTrack = src;
    for (const k in tracks) { const a = tracks[k]; if (k !== src) { a.want = 0; } }
    if (!src) return;
    let a = tracks[src]; if (!a) { a = tracks[src] = new Audio(MEDIA_ROOT + src); a.loop = true; a.volume = 0; a.lvl = 0; a.addEventListener('error', () => { a.bad = true; }); }
    a.want = 1; if (!St.muted && St.mode !== 'attract') a.play().catch(() => {});
  }
  function tickMusic(dt) {
    for (const k in tracks) { const a = tracks[k]; const goal = St.muted || St.playing ? 0 : (a.want || 0) * 0.45; a.lvl = damp(a.lvl, goal, 2.5, dt); try { a.volume = clamp(a.lvl, 0, 1); } catch (e) {} if (a.lvl < 0.01 && !a.want && !a.paused) a.pause(); }
  }
  function camBlockT(tx, ty, tz, px, py, pz) { let tmin = 1; const ox = tx, oz = tz, dx = px - ox, dz = pz - oz;
          for (const c of colliders) { if (!c.box || !c.h) continue; const [x0, x1, z0, z1] = c.box; if (Math.max(ox, px) < x0 - 0.6 || Math.min(ox, px) > x1 + 0.6 || Math.max(oz, pz) < z0 - 0.6 || Math.min(oz, pz) > z1 + 0.6) continue;
            let t0 = 0, t1 = 1; for (const [o, d0, lo, hi] of [[ox, dx, x0 - 0.5, x1 + 0.5], [oz, dz, z0 - 0.5, z1 + 0.5]]) { if (Math.abs(d0) < 1e-6) { if (o < lo || o > hi) { t0 = 2; break; } continue; } let a = (lo - o) / d0, b = (hi - o) / d0; if (a > b) [a, b] = [b, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, b); }
            if (t0 <= t1 && t0 < tmin && t0 > 0.02 && ty + (py - ty) * t0 < c.h) tmin = t0; }
          return tmin; }
  function clearYaw() {   // on arrival: turn the camera to the nearest heading whose view isn't buried in a wall
    const tx = Pl.x, ty = Pl.y + 1.5, tz = Pl.z, d = St.dist, p = St.pitch, y0 = St.yaw;
    for (const off of [0, 0.45, -0.45, 0.9, -0.9, 1.35, -1.35, 1.8, -1.8, 2.4, -2.4, Math.PI]) { const yw = y0 + off; if (camBlockT(tx, ty, tz, tx + Math.sin(yw) * Math.cos(p) * d, ty + Math.sin(p) * d, tz + Math.cos(yw) * Math.cos(p) * d) >= 1) { St.yaw = yw; return; } }
  }
  function goTo(m, at, face) {
    if (St.moving2) return; St.moving2 = true; fade.style.opacity = '1'; audio.tone(m.kind === 'zone' ? 440 : 330, 0.18, 0.04, 'triangle', 1);
    setTimeout(() => {
      if (m.kind !== 'zone') buildArea(m);
      St.area = m.kind === 'zone' ? null : m.key;
      const p = at || m.entrance || m.spawn; const [lx, ly] = nearestWalk(m, p[0], p[1]); [Pl.x, Pl.z] = toW(m, lx, ly);
      const [mcx, mcz] = center(m); Pl.vx = Pl.vz = 0; Pl.face = face ?? (Math.hypot(mcx - Pl.x, mcz - Pl.z) > 2 ? Math.atan2(mcx - Pl.x, mcz - Pl.z) : Pl.face); St.yaw = Pl.face + Math.PI; if (!m.interior) clearYaw(); St.dialog = null;
      camPos.set(Pl.x - Math.sin(Pl.face) * 6, 5, Pl.z - Math.cos(Pl.face) * 6); camLook.set(Pl.x, 1.5, Pl.z);
      roomLights.forEach(r => r.L.visible = r.a === St.area);
      St.zone = null; St.graceT = 4; enterPlace(m); if (m.kind === 'battle') startBattle(m);
      setTimeout(() => { fade.style.opacity = '0'; St.moving2 = false; }, 80);
    }, 300);
  }
  function arriveFrom(target, fromKey) {
    // the door in the target that leads back where we came from, else its entrance
    const m = MAPS[target]; if (!m) return;
    if (m.kind === 'zone') { const d = doorsOut.find(o => o.from === target && o.to === fromKey); if (d) { const [lx, ly] = toL(m, d.X, d.Z); goTo(m, [lx, ly], null); return; } }
    else { buildArea(m); const d = m.doors.find(o => o.to === fromKey); if (d) { goTo(m, [d.x, d.y], null); return; } }
    goTo(m, null, null);
  }

  // ---------------------------------------------------------------- combat (light): the wilds only
  const BOLTS = [];
  const boltMat = glowing('#7fe3ff', null, 2.4);
  function inTown() { if (St.area) { const a = MAPS[St.area]; if (a.kind === 'dock') return true; return a.interior && !/cave|deep|hideout|vault|hall|chamber|gate|fort|climb|shaft|gallery|drop|ring/i.test(a.key + a.label); } const z = St.zone && MAPS[St.zone]; return !!z && /town|square|strip|promenade|bazaar|castle/i.test(z.key + ' ' + z.label); }
  function hurtFoe(f, dmg, kx = 0, kz = 0, crit = false) {
    if (f.dead > 0 || !f.c) return;
    f.hpNow -= dmg; f.hits++; St.hitstop = Math.max(St.hitstop || 0, crit ? 0.09 : 0.05); St.shake = Math.max(St.shake || 0, crit ? 0.18 : 0.1);
    dmgNum(f.x, (f.big ? 4.2 : 2.3) + (f.K.fly || 0), f.z, dmg, crit ? '#ffd23a' : '#ffffff', crit); burst(f.x, 1.2 + (f.K.fly || 0), f.z, crit ? '#ffd23a' : '#ffffff', crit ? 18 : 10, 6);
    audio.tone(crit ? 180 : 230, 0.09, 0.06, 'square', 0.5);
    if (!f.big || f.hits % 3 === 0) { f.state = 'hurt'; f.st = 0; f.vx = kx * (f.big ? 3 : 8); f.vz = kz * (f.big ? 3 : 8); }
    if (f.hpNow <= 0) {
      f.dead = f.big ? 120 : 40; f.state = 'dying'; f.st = 0; burst(f.x, 1.2, f.z, ST.accent || '#ff8a3a', f.big ? 60 : 26, f.big ? 12 : 8); dropCoins(f.x, f.z, f.big ? 14 : 3); St.shake = f.big ? 0.6 : 0.2; St.hitstop = f.big ? 0.25 : 0.08;
      audio.burst(0.3, 90, 0.5); if (f.ring) f.ring.visible = false; if (f.bar) f.bar.visible = false;
      toast(f.big ? f.name.toUpperCase() + ' IS DOWN!' : f.name + ' down'); if (f.key) save.setFlag('slain.' + f.key); if (f.big) save.setFlag('slain.' + (f.name || '').replace(/\W/g, ''));
    }
  }
  function hurtPlayer(dmg, fx, fz) {
    if ((Pl.iframe || 0) > 0 || St.mode !== 'play' || Pl.hp <= 0) return;
    Pl.hp = Math.max(0, Pl.hp - Math.round(dmg)); Pl.hurtT = 5; Pl.iframe = 0.8; St.hurtFlash = 1; St.shake = Math.max(St.shake || 0, 0.3); St.hitstop = 0.06;
    const dx = Pl.x - fx, dz = Pl.z - fz, l = Math.hypot(dx, dz) || 1; Pl.vx += dx / l * 9; Pl.vz += dz / l * 9; burst(Pl.x, 1.2, Pl.z, '#ff4a3a', 12, 5); audio.burst(0.15, 260, 0.3);
    if (Pl.hp <= 0) { toast(BAT.on ? 'Down! Back at the core.' : 'Knocked down. Back to safety.'); setTimeout(() => { Pl.hp = 100; if (BAT.on) { Pl.x = BAT.cx + 7; Pl.z = BAT.cz + 7; return; } const m = St.area ? MAPS[St.area] : MAPS[St.zone || D.start]; goTo(m, null, 0); }, 700); }
  }
  function nearestFoe(r, cone) {
    let best = null, bd = r;
    for (const f of FOES) { if (f.dead || !f.c || !f.c.visible) continue; const dx = f.x - Pl.x, dz = f.z - Pl.z, d = Math.hypot(dx, dz); if (d > bd) continue; if (cone) { let a = Math.atan2(dx, dz) - Pl.face; a = Math.atan2(Math.sin(a), Math.cos(a)); if (Math.abs(a) > cone) continue; } bd = d; best = f; }
    return best;
  }


  // ---------------------------------------------------------------- loop
  const clock = new THREE.Clock(); let raf = 0, lastHud = '', hudT = 0;
  const sunDir = new THREE.Vector3(), moonDir = new THREE.Vector3(), lightDir = new THREE.Vector3();
  const NPC_MAX = opts.quality === 'low' ? 7 : 16, NPC_R = opts.quality === 'low' ? 30 : 40;
  const visibleNpcs = () => NPCS.filter(n => (St.area ? n.map.key === St.area : n.map.kind === 'zone') && Math.abs(n.x - Pl.x) < NPC_R && Math.abs(n.z - Pl.z) < NPC_R).sort((a, b) => Math.hypot(a.x - Pl.x, a.z - Pl.z) - Math.hypot(b.x - Pl.x, b.z - Pl.z)).slice(0, NPC_MAX);
  const nearest = () => { let best = null, bd = 3.0; for (const n of NPCS) { if (!n.c || !n.c.visible) continue; const d = Math.hypot(n.x - Pl.x, n.z - Pl.z); if (d < bd) { bd = d; best = n; } } return best; };
  const nearSpot = () => {
    const here = St.area || null; for (const gm of GAMES) if ((here ? gm.map === here : MAPS[gm.map].kind === 'zone') && Math.hypot(gm.X - Pl.x, gm.Z - Pl.z) < 1.6) return { kind: 'game', label: gm.label, file: gm.file };
    if (St.area) { for (const e of exitsIn) if (e.area === St.area && Math.hypot(e.X - Pl.x, e.Z - Pl.z) < 2.4) return { kind: 'exit', label: e.label, to: e.to, at: e.at, raw: e.raw }; return null; }
    for (const d of doorsOut) if (Math.hypot(d.X - Pl.x, d.Z - Pl.z) < 2.6) return { kind: 'door', label: d.label, to: d.to, at: d.at, raw: d.pad };
    return null;
  };
  function update(dt) {
    St.t += dt; St.time = (St.time + dt * opts.timeScale / 60) % 24;
    St.wRain = damp(St.wRain, St.weather === 'rain' ? 1 : 0, 0.8, dt); St.wFog = damp(St.wFog, St.weather === 'fog' ? 1 : 0, 0.8, dt);
    const h = St.time; paletteAt(h, pal);
    const sa = (h - 6) / 13 * Math.PI; sunDir.set(Math.cos(sa), Math.sin(sa) * 0.9, 0.38).normalize();
    const mh = ((h - 19 + 24) % 24) / 11 * Math.PI; moonDir.set(-Math.cos(mh), Math.sin(mh) * 0.85, -0.3).normalize();
    lightDir.copy(sunDir.y > -0.02 ? sunDir : moonDir); lightDir.y = Math.max(lightDir.y, 0.18); lightDir.normalize();
    const indoor = !!(St.area && MAPS[St.area].interior), caveHere = !!(St.area ? /cave|deep|drop|gallery|shaft|volcano|climb/i.test(St.area) : (St.zone && MAPS[St.zone].cave));
    const rk = St.wRain, fk = St.wFog;
    for (const k of ['top', 'hor', 'fog']) { const c = pal[k], l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; grey.setRGB(l, l, l * 1.06); c.lerp(grey, rk * 0.7); }
    const dockHere = !!(St.area && MAPS[St.area].kind === 'dock');
    const visionHere = !!(St.area && MAPS[St.area].vision);
    if (W8 === 'station' || dockHere) { pal.top.set('#05060c'); pal.hor.set('#141a2e'); pal.fog.set('#10131c'); pal.glow = 1; }
    skyU.top.value.copy(pal.top); skyU.hor.value.copy(pal.hor); skyU.bottom.value.copy(pal.fog); skyU.sunDir.value.copy(sunDir); skyU.moonDir.value.copy(moonDir); skyU.sunCol.value.copy(pal.light);
    skyU.sunVis.value = W8 === 'station' || dockHere ? 0 : smooth(-0.08, 0.05, sunDir.y) * (1 - 0.85 * Math.max(rk, fk)); skyU.moonVis.value = smooth(-0.05, 0.1, moonDir.y) * pal.glow;
    sky.visible = !indoor && !caveHere; stars.visible = !indoor && !caveHere; FARS.forEach(f => f.visible = !caveHere && !St.area);
    if (indoor) { pal.fog.set(visionHere ? '#1a0a24' : '#0b0a12'); scene.background = pal.fog; } else scene.background = null;
    if (caveHere) { pal.fog.set('#120e16'); scene.background = pal.fog; }
    scene.fog.color.copy(pal.fog); scene.fog.density = dockHere ? 0.0012 : indoor ? 0.012 : (caveHere ? 0.02 : 0.0055) + 0.026 * fk + 0.008 * rk;
    sun.color.copy(pal.light); sun.intensity = pal.li * (1 - 0.65 * rk - 0.45 * fk) * (St.area && MAPS[St.area].interior ? 0.55 : 1); if (indoor && visionHere) { hemi.color.set('#d8b8ff'); hemi.groundColor.set('#3a1a4a'); hemi.intensity = 1.25; } else if (indoor) { hemi.color.set('#fff1dc'); hemi.groundColor.set('#6a5a4a'); hemi.intensity = 2.1; } else { hemi.color.copy(pal.hs); hemi.groundColor.copy(pal.hg); hemi.intensity = pal.hi; }
    if (!St.area && St.zone && MAPS[St.zone].gloom) { pal.fog.lerp(grey.set('#1e2a22'), 0.55); scene.fog.color.copy(pal.fog); scene.fog.density += 0.012; sun.intensity *= 0.5; hemi.intensity *= 0.75; }
    if (W8 === 'earth' && !indoor && !caveHere && !dockHere) { const nt = 1 - smooth(-0.1, 0.25, sunDir.y); if (nt > 0) { hemi.color.lerp(grey.set('#9a8cff'), 0.5 * nt); hemi.groundColor.lerp(grey.set('#5a3a5a'), 0.5 * nt); hemi.intensity = Math.max(hemi.intensity, 1.35 * nt + hemi.intensity * (1 - nt)); } }
    if (caveHere) { hemi.color.set('#b8a8d8'); hemi.groundColor.set('#3a2a30'); hemi.intensity = 1.0; sun.intensity *= 0.35; }
    const glow = Math.max(pal.glow, rk * 0.45, fk * 0.3, St.area || caveHere ? 0.85 : 0) * 0.8 + 0.2;
    glowMats.forEach(g => g.m.emissiveIntensity = glow * g.k); glows.forEach(s => s.material.opacity = glow * 0.8); flushGlows(); if (GB.mat) { GB.mat.uniforms.uOp.value = glow * 0.8; GB.mat.uniforms.uScale.value = renderer.domElement.height / (2 * Math.tan(camera.fov * Math.PI / 360)); }
    starMat.opacity = dockHere ? 1 : smooth(0.5, 0.95, pal.glow) * (1 - Math.max(rk, fk));
    if (dockHere) { hemi.color.set('#cfe4ff'); hemi.groundColor.set('#40485a'); hemi.intensity = 1.6; sun.color.set('#fff4e0'); sun.intensity = 2.2; tickDock(St.t); }
    roomLights.forEach(r => { r.L.intensity = r.L.visible ? r.k * (0.9 + 0.1 * Math.sin(St.t * 9)) : 0; });

    if (St.mode === 'play') {
      let ix = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + input.jx;
      let iy = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) + input.jy;
      const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
      if (St.dialog) { ix = 0; iy = 0; }
      const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw), rx = Math.cos(St.yaw), rz = -Math.sin(St.yaw);
      const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || Math.hypot(input.jx, input.jy) > 0.92;
      const spd = (run ? 9 : 5) * Math.min(1, Math.hypot(ix, iy));
      let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix; const ml = Math.hypot(mx, mz); if (ml > 0) { mx /= ml; mz /= ml; }
      Pl.vx = damp(Pl.vx, mx * spd, 12, dt); Pl.vz = damp(Pl.vz, mz * spd, 12, dt);
      moveWithWalls(Pl, Pl.x + Pl.vx * dt, Pl.z + Pl.vz * dt, 0.42);
      const hs = Math.hypot(Pl.vx, Pl.vz); if (hs > 0.3) { let df = Math.atan2(Pl.vx, Pl.vz) - Pl.face; df = Math.atan2(Math.sin(df), Math.cos(df)); Pl.face += df * Math.min(1, dt * 12); }
      St.dragT = (St.dragT || 0) - dt;
      if (hs > 0.6 && St.dragT <= 0 && !St.dialog) { let dy = (Pl.face + Math.PI) - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, dt * 2.2 * Math.min(1, hs / 4)); }
      if (input.jump && Pl.ground) { Pl.vy = 8.4; Pl.ground = false; audio.tone(420, 0.12, 0.04, 'triangle', 1.8); } input.jump = false;
      Pl.vy -= 24 * dt; Pl.y += Pl.vy * dt; if (Pl.y <= 0.06) { Pl.y = 0.06; Pl.vy = 0; Pl.ground = true; }
      if (Pl.ground && hs > 1) { Pl.stepT -= dt * hs; if (Pl.stepT < 0) { Pl.stepT = 2.2; audio.step(); } }
      Pl.cd = Math.max(0, Pl.cd - dt); Pl.swing = Math.max(0, Pl.swing - dt); Pl.hurtT = Math.max(0, Pl.hurtT - dt);
      if (Pl.hurtT <= 0 && Pl.hp > 0) Pl.hp = Math.min(100, Pl.hp + dt * 6);
      player.position.set(Pl.x, Pl.y, Pl.z); player.rotation.y = Pl.face + (Pl.swing > 0 ? Math.sin(Pl.swing * 18) * 0.6 : 0); animFox(player, dt, hs, !Pl.ground);
      // which zone you are in
      St.graceT = Math.max(0, (St.graceT || 0) - dt);
      if (!St.area) { const z = zoneAt(Pl.x, Pl.z); if (z && z.key !== St.zone) { St.zone = z.key; enterPlace(z); } }
      else if (St.zone !== St.area) { St.zone = St.area; }
    } else { player.position.set(Pl.x, 0.06, Pl.z); player.rotation.y = Pl.face; animFox(player, dt, 0); }

    // people: built near you, idle or walking their lane
    const vis = new Set(visibleNpcs());
    for (const n of NPCS) {
      if (!vis.has(n)) { if (n.c) n.c.visible = false; continue; }
      const c = ensureFox(n); c.visible = true;
      const dpl = Math.hypot(Pl.x - n.x, Pl.z - n.z), engaged = St.mode === 'play' && ((St.dialog && St.dialog.npc === n) || dpl < 3.0);
      let spd = 0, tf = n.face;
      if (engaged) tf = Math.atan2(Pl.x - n.x, Pl.z - n.z);
      else if (n.lane) {
        const L = n.lane, a = L.a ?? 0, b = L.b ?? (L.axis === 'NS' ? n.map.h : n.map.w);
        if (n.wait > 0) n.wait -= dt;
        else { const tgt = n.dir > 0 ? b : a, cur = L.axis === 'NS' ? n.ly : n.lx, d = tgt - cur; if (Math.abs(d) < 20) { n.dir *= -1; n.wait = rr(1.5, 4); } else { spd = 1.6; const step = Math.sign(d) * Math.min(Math.abs(d), spd / S * dt); if (L.axis === 'NS') n.ly += step; else n.lx += step; tf = L.axis === 'NS' ? (d > 0 ? 0 : Math.PI) : (d > 0 ? Math.PI / 2 : -Math.PI / 2); npcPos(n); } }
      }
      let df = tf - n.face; df = Math.atan2(Math.sin(df), Math.cos(df)); n.face += df * Math.min(1, dt * 6);
      c.userData.lookAt = St.mode === 'play' && dpl < 7 ? n.lookV.set(Pl.x, Pl.y + 1.6, Pl.z) : null; n.speedNow = damp(n.speedNow, spd, 8, dt);
      c.position.set(n.x, 0.06, n.z); c.rotation.y = n.face; animFox(c, dt, n.speedNow);
    }
    // creatures: wander near home; in the wilds they fight — telegraph, strike, recover
    const fdt = dt * ((St.hitstop || 0) > 0 ? 0.08 : 1); St.boss = null;
    for (const f of FOES) {
      const here = St.area ? f.map.key === St.area : f.map.kind === 'zone';
      const [hx, hz] = toW(f.map, f.hx, f.hy);
      if (!here || Math.abs(hx - Pl.x) > 60 || Math.abs(hz - Pl.z) > 60) { if (f.c) { f.c.visible = false; if (f.ring) f.ring.visible = false; if (f.bar) f.bar.visible = false; } continue; }
      if (f.dormant) { if (f.c) f.c.visible = false; continue; }
      if (f.bat && f.dead > 0) { if (f.c && f.st < 0.5) { f.st += dt; f.c.scale.multiplyScalar(0.9); } else if (f.c) f.c.visible = false; continue; }
      if (f.dead > 0) { f.dead -= dt; if (f.c) { if (f.st < 0.5) { f.st += dt; f.c.scale.multiplyScalar(0.9); f.c.position.y += dt * 2; } else f.c.visible = false; } if (f.dead <= 0) { f.hpNow = f.hpMax; f.lx = f.hx; f.ly = f.hy; f.state = 'idle'; f.hits = 0; if (f.c) { f.c.scale.setScalar(f.big ? 2.1 : 1); } } continue; }
      const c = ensureFoe(f); c.visible = true; f.t += fdt; f.cd -= fdt; f.st += fdt;
      let [X, Z] = toW(f.map, f.lx, f.ly); f.x = X; f.z = Z;
      const dxp = Pl.x - X, dzp = Pl.z - Z, dp = Math.hypot(dxp, dzp), home = Math.hypot(X - hx, Z - hz), toP = Math.atan2(dxp, dzp);
      let engaged = St.mode === 'play' && !inTown() && Pl.hp > 0 && dp < (f.big ? 20 : 13) && home < 28 && (St.graceT || 0) <= 0;
      if (f.bat && BAT.on) { engaged = Pl.hp > 0; const cd2 = Math.hypot(BAT.cx - X, BAT.cz - Z); if (cd2 < dp - 4 && cd2 > f.K.reach + 2.5) { /* march on the core */ } if (cd2 < f.K.reach + 2.6 && f.cd <= 0) { f.cd = 1.4; BAT.hp -= f.K.dmg * (f.big ? 2 : 1); BAT.hitT = 0.3; burst(BAT.cx, 2, BAT.cz, '#ff5a3a', 8, 4); } }
      const K = f.K, ranged = K.attack === 'shoot'; let mvx = 0, mvz = 0, spd = 0, faceTo = null;
      if (f.state === 'idle') { const tx = hx + Math.cos(f.t * 0.3 + f.hx) * 4, tz = hz + Math.sin(f.t * 0.37 + f.hy) * 4, d = Math.hypot(tx - X, tz - Z); if (d > 0.8) { mvx = (tx - X) / d; mvz = (tz - Z) / d; spd = 1.2; } if (engaged) { f.state = 'chase'; f.st = 0; dmgNum(X, 2.6 + (K.fly || 0), Z, '!', '#ffd23a'); } }
      else if (f.state === 'chase') {
        if (!engaged) f.state = 'idle';
        else { faceTo = toP; const want = ranged ? K.keep : K.reach * 0.75;
          if (f.bat && BAT.on && dp > 14) { const ddx = BAT.cx - X, ddz = BAT.cz - Z, dl = Math.hypot(ddx, ddz) || 1; if (dl > K.reach + 2) { mvx = ddx / dl; mvz = ddz / dl; spd = K.speed * 0.8; faceTo = Math.atan2(ddx, ddz); } }
          if (spd > 0) {} else if (dp > want + 1) { mvx = dxp / dp; mvz = dzp / dp; spd = K.speed; } else if (ranged && dp < want - 2) { mvx = -dxp / dp; mvz = -dzp / dp; spd = K.speed * 0.8; } else { const sgn = Math.sin(f.t * 0.7 + f.hx) > 0 ? 1 : -1; mvx = Math.cos(toP) * sgn; mvz = -Math.sin(toP) * sgn; spd = K.speed * 0.45; }
          if (f.cd <= 0 && dp <= K.reach + (ranged ? 0 : 0.6)) { f.state = 'windup'; f.st = 0; f.aim = toP; } } }
      else if (f.state === 'windup') { faceTo = K.attack === 'charge' ? f.aim : (f.aim = toP); const w = K.wind * (f.big ? 1.25 : 1);
        const r = teleRing(f); r.visible = K.attack !== 'shoot'; const rad = K.attack === 'slam' ? (f.big ? 5 : 3.2) : K.attack === 'burst' ? 2.6 : K.reach * (f.big ? 1.6 : 1); r.position.set(X + (K.attack === 'charge' || K.attack === 'lunge' || K.attack === 'slash' || K.attack === 'dive' ? Math.sin(f.aim) * rad * 0.6 : 0), 0.12, Z + (K.attack === 'charge' || K.attack === 'lunge' || K.attack === 'slash' || K.attack === 'dive' ? Math.cos(f.aim) * rad * 0.6 : 0)); r.scale.setScalar(rad * Math.min(1, f.st / w)); r.material.opacity = 0.35 + 0.4 * Math.abs(Math.sin(f.t * 18));
        if (f.st >= w) { f.state = 'attack'; f.st = 0; r.visible = false; f.didHit = false;
          if (K.attack === 'shoot') { if (f.big) for (let k = -2; k <= 2; k++) enemyShot(f, f.aim + k * 0.22); else enemyShot(f, f.aim); }
          else if (K.attack === 'slam') shockwave(X + Math.sin(f.aim) * 1.2, Z + Math.cos(f.aim) * 1.2, f.big ? 5 : 3.2, K.dmg * (f.big ? 1.6 : 1));
          else { const v = K.attack === 'charge' ? 15 : K.attack === 'dive' ? 13 : 10; f.vx = Math.sin(f.aim) * v; f.vz = Math.cos(f.aim) * v; audio.tone(160, 0.12, 0.05, 'sawtooth', 0.8); } } }
      else if (f.state === 'attack') { faceTo = f.aim; const dur = K.attack === 'charge' ? 0.55 : K.attack === 'shoot' || K.attack === 'slam' ? 0.3 : 0.3;
        if (K.attack === 'burst' && f.st >= 0.25 && !f.didHit) { f.didHit = true; shockwave(X, Z, 2.6, K.dmg, '#ff9a3a'); f.hpNow = 0; hurtFoe(f, 1); continue; }
        if (!f.didHit && K.attack !== 'shoot' && K.attack !== 'slam' && dp < (f.big ? 2.8 : 1.5) + (K.attack === 'charge' ? 0.4 : 0)) { f.didHit = true; hurtPlayer(K.dmg * (f.big ? 1.6 : 1), X, Z); }
        if (f.st >= dur) { f.state = 'recover'; f.st = 0; f.cd = (f.big ? 0.9 : 1.3) + rr(0, 0.6); } }
      else if (f.state === 'recover') { faceTo = toP; if (f.st > 0.5) f.state = engaged ? 'chase' : 'idle'; }
      else if (f.state === 'hurt') { if (f.st > 0.28) f.state = engaged ? 'chase' : 'idle'; }
      // move: own steering + impulse velocity (lunges, knockback), staying on walkable ground
      f.vx = damp(f.vx, 0, f.state === 'attack' ? 2 : 7, fdt); f.vz = damp(f.vz, 0, f.state === 'attack' ? 2 : 7, fdt);
      const nx = X + (mvx * spd + f.vx) * fdt, nz = Z + (mvz * spd + f.vz) * fdt; f.speedNow = damp(f.speedNow, spd + Math.hypot(f.vx, f.vz), 8, fdt);
      if (walkable(nx, nz) || K.fly) { const [lx, ly] = toL(f.map, nx, nz); f.lx = lx; f.ly = ly; X = nx; Z = nz; f.x = X; f.z = Z; } else { f.vx *= -0.3; f.vz *= -0.3; }
      const tgt = faceTo ?? (spd > 0.2 ? Math.atan2(mvx, mvz) : f.face); let df = tgt - f.face; df = Math.atan2(Math.sin(df), Math.cos(df)); f.face += df * Math.min(1, fdt * (f.state === 'windup' ? 12 : 7));
      c.position.set(X, 0.04, Z); c.rotation.y = f.face; CK.animate(f, fdt);
      if (f.hpNow < f.hpMax) { hpBar(f); f.bar.visible = true; f.bar.position.set(X, (f.big ? 4.6 : 2.6) + (K.fly || 0), Z); } else if (f.bar) f.bar.visible = false;
      if (f.big && f.state !== 'idle') St.boss = { name: f.name, hp: Math.max(0, Math.round(f.hpNow / f.hpMax * 100)) };
    }
    // the player's bolts
    const TUR = BAT.on && MAPS[BAT.key].turretObjs ? MAPS[BAT.key].turretObjs.filter(t => !t.dead) : [];
    for (let i = BOLTS.length - 1; i >= 0; i--) { const b = BOLTS[i]; for (const t of TUR) if (Math.hypot(t.X - b.m.position.x, t.Z - b.m.position.z) < 1.9) { t.hp -= 22; b.t = 0; burst(t.X, 2.8, t.Z, '#ffcf8a', 10, 5); dmgNum(t.X, 4.5, t.Z, 22); if (t.hp <= 0) { t.dead = true; t.tg.visible = false; burst(t.X, 2, t.Z, '#ff8a3a', 40, 9); St.shake = 0.4; toast('Turret down'); } } }
    for (let i = BOLTS.length - 1; i >= 0; i--) { const b = BOLTS[i]; b.t -= dt; b.m.position.addScaledVector(b.v, dt);
      for (const f of FOES) { if (f.dead > 0 || !f.c || !f.c.visible) continue; if (Math.hypot(f.x - b.m.position.x, f.z - b.m.position.z) < (f.big ? 1.8 : 1.0) && Math.abs(b.m.position.y - 1.2 - (f.K.fly || 0)) < 2) { const crit = rnd() < 0.15; hurtFoe(f, crit ? 33 : 22, b.v.x / 30, b.v.z / 30, crit); b.t = 0; break; } }
      if (b.t <= 0) { scene.remove(b.m); BOLTS.splice(i, 1); } }
    // enemy shots
    for (let i = FX.shots.length - 1; i >= 0; i--) { const sh = FX.shots[i]; sh.t -= fdt; sh.m.position.addScaledVector(sh.v, fdt); if (Math.hypot(sh.m.position.x - Pl.x, sh.m.position.z - Pl.z) < 0.85 && Math.abs(sh.m.position.y - (Pl.y + 1)) < 1.3) { hurtPlayer(sh.dmg, sh.m.position.x - sh.v.x, sh.m.position.z - sh.v.z); sh.t = 0; burst(sh.m.position.x, sh.m.position.y, sh.m.position.z, sh.col, 10, 4); } if (sh.t <= 0) { scene.remove(sh.m); FX.shots.splice(i, 1); } }
    // shockwaves
    for (let i = FX.waves.length - 1; i >= 0; i--) { const w = FX.waves[i]; w.t += fdt; const r = w.r * Math.min(1, w.t / 0.3); w.m.scale.setScalar(r); w.m.material.opacity = 0.9 * (1 - w.t / 0.5); if (!w.hit && Math.hypot(Pl.x - w.x, Pl.z - w.z) < r + 0.4 && Pl.y < 0.8) { w.hit = true; hurtPlayer(w.dmg, w.x, w.z); } if (w.t > 0.5) { scene.remove(w.m); FX.waves.splice(i, 1); } }
    // sparks, numbers, coins
    { const a = spkArr; for (let i = 0; i < SPK_N; i++) { const s0 = spkV[i]; if (s0.life <= 0) continue; s0.life -= dt; s0.v.y -= 14 * dt; a[i * 3] += s0.v.x * dt; a[i * 3 + 1] += s0.v.y * dt; a[i * 3 + 2] += s0.v.z * dt; if (s0.life <= 0) a[i * 3 + 1] = -99; } spkGeo.attributes.position.needsUpdate = true; }
    for (let i = FX.nums.length - 1; i >= 0; i--) { const n = FX.nums[i]; n.t -= dt; n.sp.position.y += dt * 1.6; n.sp.material.opacity = Math.min(1, n.t * 3); if (n.t <= 0) { scene.remove(n.sp); FX.nums.splice(i, 1); } }
    for (let i = FX.coins.length - 1; i >= 0; i--) { const cn = FX.coins[i]; cn.t += dt; cn.m.rotation.x += dt * 8; if (cn.t < 0.6) { cn.v.y -= 20 * dt; cn.m.position.addScaledVector(cn.v, dt); if (cn.m.position.y < 0.2) { cn.m.position.y = 0.2; cn.v.y *= -0.4; } } else { const to = new THREE.Vector3(Pl.x, Pl.y + 1, Pl.z).sub(cn.m.position); const d = to.length(); cn.m.position.addScaledVector(to.normalize(), Math.min(d, dt * (8 + cn.t * 20))); if (d < 0.5) { scene.remove(cn.m); FX.coins.splice(i, 1); save.addGold && save.addGold(2); audio.tone(1200 + rr(0, 300), 0.05, 0.03, 'triangle', 1.6); } } }
    St.hitstop = Math.max(0, (St.hitstop || 0) - dt); St.hurtFlash = Math.max(0, (St.hurtFlash || 0) - dt * 2.5); Pl.iframe = Math.max(0, (Pl.iframe || 0) - dt);
    if (Pl.swingFx) { Pl.swingFx.t -= dt; Pl.swingFx.m.material.opacity = Math.max(0, Pl.swingFx.t * 4); Pl.swingFx.m.position.set(Pl.x, Pl.y + 1.0, Pl.z); if (Pl.swingFx.t <= 0) { scene.remove(Pl.swingFx.m); Pl.swingFx = null; } }

    const nr = St.mode === 'play' ? nearest() : null; St.near = St.dialog ? null : nr; St.spot = St.dialog || nr ? null : nearSpot();
    if (St.dialog) { const d = St.dialog; d.chars = Math.min(d.lines[d.i].text.length, d.chars + dt * 45); if (d.npc && Math.hypot(Pl.x - d.npc.x, Pl.z - d.npc.z) > 6) St.dialog = null; }
    if (St.dialog && St.dialog.npc && St.dialog.npc.c) { const d = St.dialog, ln = d.lines[d.i]; (ln.you ? player : d.npc.c).userData.talking = d.chars < ln.text.length; }

    // camera
    if (St.mode === 'play') {
      const tx = Pl.x, ty = Pl.y + 1.5, tz = Pl.z;
      let dist = St.dist, pitch = St.pitch; if (indoor) { dist = Math.min(dist + 1.5, 10.5); pitch = Math.max(pitch, 0.78); }
      v3.set(tx + Math.sin(St.yaw) * Math.cos(pitch) * dist, ty + Math.sin(pitch) * dist, tz + Math.cos(St.yaw) * Math.cos(pitch) * dist);
      if (St.dialog && St.dialog.npc) { const n = St.dialog.npc; v3.set((Pl.x + n.x) / 2 + Math.sin(St.yaw) * 4.2, 2.6, (Pl.z + n.z) / 2 + Math.cos(St.yaw) * 4.2); }
      if (v3.y < 0.8) v3.y = 0.8;
      // keep the camera out of buildings: first try lifting it over the roofs, then slide it in along the line to the player
      if (!St.area && !(St.dialog && St.dialog.npc)) {
        const camT = (px, py, pz) => camBlockT(tx, ty, tz, px, py, pz);
        let tmin = camT(v3.x, v3.y, v3.z);
        if (tmin < 1) { let best = null; for (let k = 1; k <= 4 && !best; k++) { const pp = Math.min(1.3, pitch + k * 0.22), dd = dist * (1 + k * 0.08); const px = tx + Math.sin(St.yaw) * Math.cos(pp) * dd, py = ty + Math.sin(pp) * dd, pz = tz + Math.cos(St.yaw) * Math.cos(pp) * dd; if (camT(px, py, pz) >= 1) best = [px, py, pz]; }
          if (best) { v3.set(...best); tmin = 1; } }
        if (tmin < 1) { const k = Math.max(0.22, tmin - 0.04); v3.set(tx + (v3.x - tx) * k, ty + (v3.y - ty) * k + (1 - k) * 1.2, tz + (v3.z - tz) * k); } }
      camPos.x = damp(camPos.x, v3.x, 8, dt); camPos.y = damp(camPos.y, v3.y, 8, dt); camPos.z = damp(camPos.z, v3.z, 8, dt);
      const lk = St.dialog && St.dialog.npc ? [(Pl.x + St.dialog.npc.x) / 2, 1.5, (Pl.z + St.dialog.npc.z) / 2] : [tx, ty, tz];
      camLook.x = damp(camLook.x, lk[0], 12, dt); camLook.y = damp(camLook.y, lk[1], 12, dt); camLook.z = damp(camLook.z, lk[2], 12, dt);
      if (St.snapCam) { St.snapCam = false; camPos.copy(v3); camLook.set(lk[0], lk[1], lk[2]); St.chunkT = 0; }
    } else if (St.mode === 'intro' && St.intro) {
      const I = St.intro; I.t += dt; const a = I.t * 0.12 + 0.6;
      camPos.set(I.cx + Math.cos(a) * I.r, I.r * 0.55 + 6, I.cz + Math.sin(a) * I.r); camLook.set(I.cx, 1.5, I.cz);
    } else { const m = MAPS[D.start], [cx, cz] = center(m), r = clamp(Math.max(m.w, m.h) * S * 0.6, 20, 60), a = St.t * 0.05 + 1.2; camPos.set(cx + Math.cos(a) * r, r * 0.5 + 8, cz + Math.sin(a) * r); camLook.set(cx, 2, cz); }
    if ((St.chunkT = (St.chunkT || 0) - dt) <= 0) { St.chunkT = 0.4; tickChunks(); }
    tickFx(St.t, dt); tickPetals(St.t); if (ZOO.length) tickZoo(St.t); if (LIFTS.length) tickLifts(St.t); if (SCREENS.length && (St.scrT = (St.scrT || 0) - dt) <= 0) { St.scrT = 0.12; for (const sc of SCREENS) sc.fremont ? drawFremont(sc, St.t) : drawMovie(sc, St.t); } if (SNOW) tickSnow(St.t, dt, !St.area && !!St.zone && !!MAPS[St.zone].snow); for (const f of FIREFX) f.scale.y = 1 + Math.sin(St.t * 11 + f.id) * 0.12; if (CROWD) { CROWD.uT.value = St.t; CROWD.uHype.value = damp(CROWD.uHype.value, St.battle || (St.foes && St.foes.length) ? 1 : 0.3, 1, dt); } tickVision(St.t); tickBattle(dt); if ((St.trigT = (St.trigT || 0) - dt) <= 0) { St.trigT = 0.5; tickTriggers(); } if (St.noteT > 0) St.noteT -= dt; if (St.banner) St.banner.t -= dt;
    CUT.uOn.value = (St.area && MAPS[St.area].kind !== 'dock') || (W8 === 'station' && !St.area) ? 1 : 0; CUT.uP.value.set(Pl.x, 0, Pl.z); CUT.uC.value.copy(camPos);
    if (St.debugCam) { camPos.set(...St.debugCam[0]); camLook.set(...St.debugCam[1]); }
    if ((St.shake || 0) > 0) { St.shake = Math.max(0, St.shake - dt * 1.8); const k = St.shake * St.shake * 0.9; camPos.x += rr(-k, k); camPos.y += rr(-k, k); }
    camera.position.copy(camPos); camera.lookAt(camLook); sky.position.copy(camera.position); stars.position.copy(camera.position);
    const sc = St.mode === 'play' ? player.position : camLook; sun.target.position.copy(sc); sun.position.copy(sc).addScaledVector(lightDir, 110);
    audio.update(dt, St.area && MAPS[St.area].interior ? { day: 0, night: 0, rain: 0, fog: 0, fountainDist: 999 } : { day: smooth(-0.05, 0.2, sunDir.y), night: pal.glow, rain: rk, fog: fk, fountainDist: 999 });
    tickMusic(dt);

    hudT -= dt;
    if (hudT < 0) {
      hudT = 0.05; const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
      const period = h < 5 ? 'Night' : h < 7 ? 'Dawn' : h < 11 ? 'Morning' : h < 14 ? 'Midday' : h < 17.5 ? 'Afternoon' : h < 19.3 ? 'Evening' : h < 20.6 ? 'Dusk' : 'Night';
      if (St.toast) { St.toast.t -= 0.05; if (St.toast.t <= 0) St.toast = null; }
      const here = St.area ? MAPS[St.area] : MAPS[St.zone || D.start];
      const zk = zones.map(z => z.key), ak = areas.filter(a => a.kind === 'area').map(a => a.key);
      const zs = zk.filter(k => save.test(seenKey(k))).length, as = ak.filter(k => save.test(seenKey(k))).length;
      const curC = here && here.kind === 'zone' ? (here.cluster || 0) : null;
      const nextZ = zones.filter(z => !save.test(seenKey(z.key))).sort((a, b) => ((a.cluster || 0) === curC ? 0 : 1) - ((b.cluster || 0) === curC ? 0 : 1) || Math.hypot(center(a)[0] - Pl.x, center(a)[1] - Pl.z) - Math.hypot(center(b)[0] - Pl.x, center(b)[1] - Pl.z))[0];
      // compass: heading of the camera, the next place to find, the doors around you
      const fwd = St.yaw + Math.PI, marks = [];
      const bearing = (X, Z) => { let a = Math.atan2(X - Pl.x, Z - Pl.z) - fwd; a = Math.atan2(Math.sin(a), Math.cos(a)); return Math.round(a * 100) / 100; };
      if (!St.area && nextZ && (nextZ.cluster || 0) === curC) { const [cx2, cz2] = center(nextZ); marks.push({ a: bearing(cx2, cz2), t: nextZ.label, k: 'quest', d: Math.round(Math.hypot(cx2 - Pl.x, cz2 - Pl.z)) }); }
      if (!St.area) doorsOut.filter(o => o.from === St.zone && Math.hypot(o.X - Pl.x, o.Z - Pl.z) < 70 && Math.hypot(o.X - Pl.x, o.Z - Pl.z) > 3).sort((a, b) => Math.hypot(a.X - Pl.x, a.Z - Pl.z) - Math.hypot(b.X - Pl.x, b.Z - Pl.z)).slice(0, 4).forEach(o => marks.push({ a: bearing(o.X, o.Z), t: o.label, k: o.pad ? 'pad' : 'door', d: Math.round(Math.hypot(o.X - Pl.x, o.Z - Pl.z)) }));
      else exitsIn.filter(e => e.area === St.area).slice(0, 3).forEach(e => marks.push({ a: bearing(e.X, e.Z), t: e.label, k: 'door', d: Math.round(Math.hypot(e.X - Pl.x, e.Z - Pl.z)) }));
      const hd = Math.round(((fwd % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) * 100) / 100;
      const d = St.dialog, ln = d && d.lines[d.i]; const AQ = (St.mode === 'play' || St.mode === 'intro') ? activeQuest() : null;
      if (AQ && AQ.at && MAPS[AQ.at] && !St.area && MAPS[AQ.at] !== here) { const tm = MAPS[AQ.at]; let tgt = tm.kind === 'zone' ? center(tm) : null; if (!tgt) { const dd = doorsOut.find(o => o.to === AQ.at); if (dd) tgt = [dd.X, dd.Z]; } if (tgt && (tm.kind !== 'zone' || (tm.cluster || 0) === curC)) marks.unshift({ a: bearing(tgt[0], tgt[1]), t: tm.label, k: 'quest', d: Math.round(Math.hypot(tgt[0] - Pl.x, tgt[1] - Pl.z)) }); }
      const hud = {
        mode: St.mode, world: here ? worldName(here) : D.name, place: here ? here.label : '', key: here ? here.key : '',
        clock: String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), period, weather: { clear: 'Clear', fog: 'Fog', rain: 'Rain' }[St.weather], muted: St.muted,
        quest: AQ ? { title: AQ.title, text: AQ.text } : { title: 'EXPLORE ' + D.name.toUpperCase(), text: nextZ ? 'Find ' + nextZ.label + ' · places ' + zs + '/' + zk.length + ' · rooms ' + as + '/' + ak.length : 'Every place found · rooms ' + as + '/' + ak.length },
        hp: Math.round(Pl.hp), gold: save.data.gold || 0, boss: St.boss, compass: St.mode === 'play' ? { h: hd, marks } : null, banner: St.banner && St.banner.t > 0 ? { title: St.banner.title, sub: St.banner.sub } : null, hurt: Math.round((St.hurtFlash || 0) * 10) / 10, combo: St.t - (Pl.lastSwing || -9) < 0.75 ? Pl.combo : 0,
        intro: St.mode === 'intro' && St.intro ? { label: St.intro.label, world: St.intro.world, text: St.intro.text, first: St.intro.first } : null,
        prompt: St.mode === 'play' && St.near ? 'Talk to ' + St.near.name : St.mode === 'play' && St.spot ? (St.spot.raw ? '' : St.spot.kind === 'game' ? 'Play ' : St.spot.kind === 'door' ? 'Enter ' : 'To ') + St.spot.label : null,
        toast: St.toast ? St.toast.text : null, note: St.noteT > 0 ? St.noteText : null, quests: St.wantQuests ? QUESTS.map(questView).filter(Boolean) : null,
        dialog: d ? { name: ln.name, role: ln.role, text: ln.text.slice(0, Math.floor(d.chars)), done: d.chars >= ln.text.length, you: ln.you, choices: d.choices ? d.choices.map(c => ({ text: c.text, asked: c.asked, bye: c.bye })) : null } : null,
      };
      const key = JSON.stringify(hud); if (key !== lastHud) { lastHud = key; onState(hud); }
    }
  }
  function frame() { raf = requestAnimationFrame(frame); try { update(Math.min(clock.getDelta(), 0.05)); } catch (e) { if (!frame.err) { frame.err = 1; console.error('world update failed: ' + (e && e.message) + ' @ ' + String(e && e.stack).split('\n').slice(0, 3).join(' | ')); } } renderer.render(scene, camera); }
  frame();

  // ---------------------------------------------------------------- talk
  function treeFor(n) {
    const base = treeFromLinear(n.lines || []);
    const root = base.nodes.root; const bye = root.choices.pop();
    if (n.greeting) root.lines.unshift({ who: 'npc', text: n.greeting });
    if (!root.lines.length && !(n.lines || []).length && n.bio) root.lines.push({ who: 'npc', text: n.bio });
    (n.topics || []).forEach((t, i) => { const id = 't' + i; base.nodes[id] = { lines: t.replies.map(r => ({ who: 'npc', text: r })), next: 'root' }; root.choices.push({ text: t.label, go: id, if: t.if != null ? { __c: t.if } : undefined, set: t.do || undefined, once: !!(t.do && t.do.some(a => a.set)) }); });
    if (n.stock && n.stock.length) { base.nodes.stock = { lines: [{ who: 'npc', text: n.stock.map(s => s.label + ' · ' + s.price + ' cr').join('   ') }], next: 'root' }; root.choices.push({ text: 'What do you sell?', go: 'stock' }); }
    root.choices.push(bye);
    return base;
  }
  const lineFor = (n, l) => l.who === 'player' ? { name: 'You', role: 'Fox', text: l.text, you: true } : { name: n.name, role: n.role, text: l.text };
  function convNext(d) { const o = d.conv.options(); if (o === 'lines') { d.lines = d.conv.lines().map(l => lineFor(d.npc, l)); d.i = 0; d.chars = 0; audio.blip(); return true; } if (o) { d.choices = o; d.chars = d.lines[d.i].text.length; audio.blip(); return true; } return false; }
  const toast = text => { St.toast = { text, t: 2.4 }; audio.blip(); };

  const api = window.__8G_GAME = {
    world: D,
    around() { const c = camera.position, out = []; const v = new THREE.Vector3(); scene.traverse(o => { if (!o.isMesh || !o.visible) return; const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); const bs = g.boundingSphere; o.updateMatrixWorld(); v.copy(bs.center).applyMatrix4(o.matrixWorld); const r = bs.radius * o.matrixWorld.getMaxScaleOnAxis(); const d = v.distanceTo(c); if (d < r) out.push({ r: +r.toFixed(1), d: +d.toFixed(1), geo: g.type, col: o.material.color && o.material.color.getHexString(), side: o.material.side, tr: o.material.transparent, op: o.material.opacity, pt: o.parent && o.parent.type, c: v.toArray().map(x => +x.toFixed(0)) }); }); return out.sort((a, b) => a.r - b.r).slice(0, 25); },
    glowsNear(r = 20) { const out = []; for (let i = 0; i < GB.pos.length; i += 3) { const d = Math.hypot(GB.pos[i] - Pl.x, GB.pos[i + 2] - Pl.z); if (d < r) out.push([+GB.pos[i].toFixed(1), +GB.pos[i + 1].toFixed(1), +GB.pos[i + 2].toFixed(1), GB.size[i / 3]]); } return out; },
    setTime(h) { St.time = h; return h; },
    probe() { const rc = new THREE.Raycaster(), o = camera.position.clone(), t = new THREE.Vector3(Pl.x, 1.2, Pl.z), d = t.clone().sub(o); rc.set(o, d.clone().normalize()); rc.far = d.length(); rc.camera = camera; const hits = rc.intersectObjects(scene.children, true).slice(0, 8); return { cam: o.toArray().map(v => +v.toFixed(1)), pl: [Pl.x, Pl.z].map(v => +v.toFixed(1)), hits: hits.map(h => ({ d: +h.distance.toFixed(1), type: h.object.type, geo: h.object.geometry && h.object.geometry.type, col: h.object.material && h.object.material.color && h.object.material.color.getHexString(), name: h.object.name, par: h.object.parent && h.object.parent.name, ud: Object.keys(h.object.userData || {}).join(','), ptype: h.object.parent && h.object.parent.type, pp: h.object.geometry.parameters, wp: h.object.getWorldPosition(new THREE.Vector3()).toArray().map(v => +v.toFixed(1)), pcol: h.object.parent && h.object.parent.material && h.object.parent.material.color && h.object.parent.material.color.getHexString() })) }; },
    start() { audio.init(); audio.setMuted(St.muted); St.mode = 'play'; camPos.set(Pl.x, 10, Pl.z + 14); St.zone = null; const z = MAPS[D.start], dk = MAPS[W8 + 'Spacedock']; if (dk && (options.fromOrbit || !save.test(seenKey(dk.key)))) { St.zone = z.key; goTo(dk, null, null); return; } save.setFlag(seenKey(z.key)); St.zone = z.key; setMusic(z.music || (D.music && D.music.default)); for (const k in tracks) if (tracks[k].want) tracks[k].play().catch(() => {}); },
    showIntro() { const m = MAPS[D.start]; startIntro(m, true); },
    continueIntro() { if (St.mode !== 'intro') return; St.intro = null; St.mode = 'play'; camPos.set(Pl.x - Math.sin(Pl.face) * 7, 6, Pl.z - Math.cos(Pl.face) * 7); for (const k in tracks) if (tracks[k].want) tracks[k].play().catch(() => {}); },
    talk() {
      if (St.mode === 'intro') { api.continueIntro(); return; }
      if (St.mode !== 'play') return; const d = St.dialog;
      if (d) { if (d.choices) return; const L = d.lines[d.i].text.length; if (d.chars < L) d.chars = L; else if (d.i < d.lines.length - 1) { d.i++; d.chars = 0; audio.blip(); } else if (d.conv && convNext(d)) {} else { St.dialog = null; } return; }
      const n = nearest();
      if (n) { if (n.c) n.c.userData.hop = 1; const asked = St.asked[n.key] || (St.asked[n.key] = new Set()); const conv = new Conversation(treeFor(n), { test: cond, set: act, asked }); const ls = conv.lines(); const dd = St.dialog = { npc: n, conv, lines: ls.length ? ls.map(l => lineFor(n, l)) : [{ name: n.name, role: n.role, text: '…' }], i: 0, chars: 0, choices: null }; if (!ls.length) convNext(dd); audio.blip(); return; }
      const s = nearSpot();
      if (s && s.kind === 'game') { St.playing = s.file; onPlayGame(s.file, s.label); audio.blip(); return; }
      if (s && s.to === '__orbit') { audio.tone(220, 0.6, 0.06, 'sawtooth', 1); fade.style.opacity = '1'; setTimeout(() => onNavigate('space.html?from=' + W8), 450); return; }
      if (s) { const from = St.area || St.zone; arriveFrom(s.to, from); }
    },
    choose(k) { const d = St.dialog; if (!d || !d.choices) return; const o = d.choices[k]; if (!o) return; const ls = d.conv.choose(o.i); d.choices = null; if (!ls) { St.dialog = null; audio.blip(); return; } d.lines = ls.map(l => lineFor(d.npc, l)); d.i = 0; d.chars = 0; audio.blip(); },
    jump() { input.jump = true; },
    gameClosed() { St.playing = null; for (const k in tracks) if (tracks[k].want && !St.muted) tracks[k].play().catch(() => {}); },
    melee() { if (St.mode !== 'play' || St.dialog || Pl.cd > 0) return; if (inTown()) { toast('Weapons stay holstered in town.'); return; }
      const now = St.t; Pl.combo = now - (Pl.lastSwing || -9) < 0.75 ? (Pl.combo % 3) + 1 : 1; Pl.lastSwing = now; const spin = Pl.combo === 3;
      Pl.cd = spin ? 0.5 : 0.28; Pl.swing = spin ? 0.45 : 0.3; const tf = nearestFoe(4, 1.6); if (tf) Pl.face = Math.atan2(tf.x - Pl.x, tf.z - Pl.z);
      Pl.vx += Math.sin(Pl.face) * 4; Pl.vz += Math.cos(Pl.face) * 4;
      audio.tone(spin ? 380 : 520 + Pl.combo * 60, 0.08, 0.05, 'sawtooth', 0.4);
      const arc = new THREE.Mesh(new THREE.RingGeometry(1.4, 2.6, 24, 1, spin ? 0 : -1.1, spin ? Math.PI * 2 : 2.2), new THREE.MeshBasicMaterial({ color: 0xbff4ff, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); arc.rotation.x = -Math.PI / 2; arc.rotation.z = Pl.face - Math.PI / 2; scene.add(arc); if (Pl.swingFx) scene.remove(Pl.swingFx.m); Pl.swingFx = { m: arc, t: 0.22 };
      const dmg = [0, 26, 30, 44][Pl.combo];
      if (BAT.on) for (const t of MAPS[BAT.key].turretObjs || []) { if (t.dead || Math.hypot(t.X - Pl.x, t.Z - Pl.z) > 3.8) continue; t.hp -= dmg; burst(t.X, 2.8, t.Z, '#ffcf8a', 12, 5); dmgNum(t.X, 4.5, t.Z, dmg); if (t.hp <= 0) { t.dead = true; t.tg.visible = false; burst(t.X, 2, t.Z, '#ff8a3a', 40, 9); St.shake = 0.4; toast('Turret down'); } }
      for (const f of FOES) { if (f.dead > 0 || !f.c || !f.c.visible) continue; const dx = f.x - Pl.x, dz = f.z - Pl.z, d = Math.hypot(dx, dz); if (d > (spin ? 3.4 : 2.9) + (f.big ? 1.2 : 0)) continue; let a = Math.atan2(dx, dz) - Pl.face; a = Math.atan2(Math.sin(a), Math.cos(a)); if (!spin && Math.abs(a) > 1.2) continue; const crit = rnd() < (spin ? 0.3 : 0.12); hurtFoe(f, Math.round(dmg * (crit ? 1.5 : 1)), dx / (d || 1), dz / (d || 1), crit); } },
    range() { if (St.mode !== 'play' || St.dialog || Pl.cd > 0) return; if (inTown()) { toast('Weapons stay holstered in town.'); return; } Pl.cd = 0.24; const f = nearestFoe(26, 0.8); const dir = new THREE.Vector3(Math.sin(Pl.face), 0, Math.cos(Pl.face)); if (f) { dir.set(f.x - Pl.x, 0, f.z - Pl.z).normalize(); Pl.face = Math.atan2(dir.x, dir.z); } const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.5, 4, 8), boltMat); m.rotation.x = Math.PI / 2; m.rotation.y = Pl.face; m.position.set(Pl.x + dir.x * 0.6, Pl.y + 1.2, Pl.z + dir.z * 0.6); scene.add(m); glowSprite(0, 0, 0, 0x7fe3ff, 1.4, m, true); BOLTS.push({ m, v: dir.multiplyScalar(34), t: 0.9 }); audio.tone(880, 0.06, 0.04, 'square', 0.5); },
    item() { if (St.mode === 'play') toast('Items: ' + (Object.keys(save.data.items || {}).length ? Object.entries(save.data.items).map(([k, n]) => k + ' ×' + n).join(', ') : 'none yet')); },
    cycleWeather() { St.weather = { clear: 'fog', fog: 'rain', rain: 'clear' }[St.weather]; },
    skipTime(hrs = 3) { St.time = (St.time + hrs) % 24; },
    toggleSound() { St.muted = !St.muted; audio.init(); audio.setMuted(St.muted); for (const k in tracks) { if (St.muted) tracks[k].pause(); else if (tracks[k].want) tracks[k].play().catch(() => {}); } },
    warp(key) { const m = MAPS[key]; if (!m) return Object.keys(MAPS); St.mode = 'play'; goTo(m, null, null); St.snapCam = true; return key; },
    games() { return GAMES.map(g => ({ map: g.map, label: g.label, file: g.file, X: g.X, Z: g.Z })); },
    teleport(X, Z) { Pl.x = X; Pl.z = Z; St.snapCam = true; },
    heavy() { const out = []; scene.traverse(o => { if (!o.isMesh) return; const g = o.geometry; const t = (g.index ? g.index.count : g.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1); out.push([Math.round(t), g.type, o.isInstancedMesh ? o.count : 1, o.material === outlineMat ? 'outline' : (o.material.type || '')]); }); out.sort((a, b) => b[0] - a[0]); return out.slice(0, 25); },
    topMeshes() { const r = {}; for (const c of scene.children) if (c.isMesh) { const k = c.geometry.type + ':' + (c.material.type || '') + ':' + (c.isInstancedMesh ? 'inst' : '') + (c.material === outlineMat ? 'ol' : ''); r[k] = (r[k] || 0) + 1; } return Object.entries(r).sort((a, b) => b[1] - a[1]).slice(0, 15); },
    foxMeshes() { const n = NPCS.find(n => n.c); if (!n) return null; let k = 0; n.c.traverse(o => { if (o.isMesh) k++; }); let b = 0; for (const x of buildings) {} let pm = 0; player.traverse(o => { if (o.isMesh) pm++; }); return { npc: k, player: pm }; },
    chunksNear(R = 40) { return CHUNKS.filter(c => Math.hypot(c.x - Pl.x, c.z - Pl.z) < R).map(c => ({ x: +c.x.toFixed(0), z: +c.z.toFixed(0), r: +c.r.toFixed(0), vis: c.list[0].visible, n: c.list[0].count, geo: c.list[0].geometry.type, col: c.list[0].material.color && c.list[0].material.color.getHexString(), camd: +Math.hypot(c.x - camera.position.x, c.z - camera.position.z).toFixed(0) })); },
    dbg(tick) { if (tick) tickChunks(); return { t: St.t, near: api.chunksNear(30).map(c => c.vis), chunkT: St.chunkT, err: frame.err, cam: camera.position.toArray(), mode: St.mode }; },
    chunkInfo() { let v = 0, m = 0; for (const c of CHUNKS) { m += c.list.length; if (c.list[0].visible) v += c.list.length; } return { chunks: CHUNKS.length, meshes: m, visible: v }; },
    census() { const r = {}; for (const c of scene.children) { let n = 0; c.traverse(o => { if (o.isMesh || o.isSprite) n++; }); const k = (c.isGroup ? 'group' : c.type) + (camBlockers.includes(c) ? ':bld' : '') + (c.userData.fox ? ':fox' : ''); r[k] = (r[k] || 0) + n; } return r; },
    blds(key) { return buildings.filter(b => !key || b.z.key === key).map(b => [b.label, Math.round(b.x0), Math.round(b.x1), Math.round(b.y0), Math.round(b.y1), b.face, !!b.filler]); },
    foeNear() { let b = null, bd = 1e9; for (const f of FOES) { if (f.dead > 0) continue; const here = St.area ? f.map.key === St.area : f.map.kind === 'zone'; if (!here) continue; const [X, Z] = toW(f.map, f.lx, f.ly); const d = Math.hypot(X - Pl.x, Z - Pl.z); if (d < bd) { bd = d; b = { x: X, z: Z, name: f.name, kind: f.kind, d, hp: f.hpNow, st: f.state, vis: !!(f.c && f.c.visible), fx: f.x, fz: f.z }; } } return b; },
    lineup(names) { const list = names || ['Crystal Crab', 'Dune Scarab', 'Crystal Golem', 'Grit Spitter', 'Sand Serpent', 'Corsair Captain', 'Corsair Gunner', 'Hornet', 'Ember', 'Flamingo', 'Icicle Snowman', 'Thornback', 'Tall One', 'The Painted Giant'];
      list.forEach((n, i) => { const kind = classify(n, /gunner|thrower|spitter/i.test(n)); const f = { name: n, kind, K: KINDS[kind], big: /^The /.test(n), ranged: /gunner|thrower|spitter|sentry/i.test(n), t: i, st: 0, state: 'idle', speedNow: 0 }; const c = CK.build(f); f.c = c; const a = Pl.face + (i - (list.length - 1) / 2) * 0.16; c.position.set(Pl.x + Math.sin(a) * 9, 0.04, Pl.z + Math.cos(a) * 9); c.rotation.y = Pl.face + Math.PI; CK.animate(f, 0.016); }); return list.length; },
    stats() { const i = renderer.info; let meshes = 0; scene.traverse(o => { if (o.isMesh) meshes++; }); return { calls: i.render.calls, tris: i.render.triangles, geos: i.memory.geometries, tex: i.memory.textures, meshes }; },
    drone(h = 60, back = 30, key) { const m = key ? MAPS[key] : (St.area ? MAPS[St.area] : MAPS[St.zone || D.start]); const [cx, cz] = center(m); St.debugCam = [[cx, h, cz + back], [cx, 0, cz]]; return [cx, cz]; },
    pose(cam, look) { St.debugCam = cam ? [cam, look] : null; },
    where(key) { const m = MAPS[key]; return m ? { bx: m.bx, bz: m.bz, w: m.w * S, h: m.h * S } : null; },
    questLog(on) { St.wantQuests = on; lastHud = ''; },
    view(yaw, pitch, dist) { St.snapCam = true; if (yaw != null) St.yaw = yaw; if (pitch != null) St.pitch = pitch; if (dist != null) St.dist = dist; return { yaw: St.yaw, pitch: St.pitch, dist: St.dist }; },
    places() { return { zones: zones.map(z => z.key), areas: areas.map(a => a.key), buildings: buildings.length, doors: doorsOut.length, trees: treeSpots.length }; },
    state() { return { x: Pl.x, z: Pl.z, zone: St.zone, area: St.area, mode: St.mode, hp: Pl.hp, npcs: NPCS.filter(n => n.c && n.c.visible).length, foes: FOES.filter(f => f.c && f.c.visible).length }; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur); for (const k in tracks) tracks[k].pause(); audio.dispose(); renderer.dispose(); el.remove(); joyBase.remove(); joyKnob.remove(); },
  };
  return api;
}
