/* 8 GATES 3D: BASKETBALL. Full court, 2 v 2, toon foxes.
   Standalone: own renderer. World mode: opts.world = { renderer, camera, parent } (see README). */
import * as THREE from '../../vendor/three/three.module.js';
import {
  COURT as C, DIFF, HUMAN_SKILL, BASE_SPEED, SPRINT_MUL, rnd, clamp, dist2, attackX,
  shotPoints, sweetZone, timingGrade, makeChance, rewards, fmtClock, aiThink, CAPTIONS,
} from './basketball-rules.js';
import { createAudio } from './basketball-audio.js';

export const GAME = { key: 'basketballCourt', name: 'BASKETBALL', maxPlayers: 4 };
const KEY = GAME.key;
const INK = 0x1a1626;
const METER_T = 0.75;
const RED = '#ec3013', YEL = '#ffd23a';
const TEAMSTYLE = {
  home: { name: 'FOXES', jersey: 0xec3013, shorts: 0xf4f1ea, shoes: 0x1c1b1a, css: RED },
  easy: { jersey: 0xffd23a, shorts: 0x2b2826, shoes: 0xf4f1ea, css: YEL },
  medium: { jersey: 0x2f6bff, shorts: 0x2f6bff, shoes: 0xf4f1ea, css: '#5b8cff' },
  hard: { jersey: 0x7a3cff, shorts: 0x1c1b1a, shoes: 0x39e5ff, css: '#a07bff' },
};
const FUR = 0xe8772e, CREAM = 0xfff1dc, DARK = 0x2e2220;

/* ---------------------------------------------------------------- toon kit */
let GRAD = null;
function gradMap() {
  if (GRAD) return GRAD;
  GRAD = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  GRAD.minFilter = GRAD.magFilter = THREE.NearestFilter; GRAD.generateMipmaps = false; GRAD.needsUpdate = true;
  return GRAD;
}
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const angLerp = (a, b, k) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * k; };

function makeKit() {
  const mats = [], geos = [], texs = [];
  const toon = (o = {}) => { const m = new THREE.MeshToonMaterial({ gradientMap: gradMap(), ...o }); mats.push(m); return m; };
  const outlines = {};
  const outlineMat = (t) => {
    if (outlines[t]) return outlines[t];
    const m = new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Color(INK) }, t: { value: t } },
      vertexShader: 'uniform float t; void main(){ vec3 p = position + normalize(normal) * t; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
      fragmentShader: 'uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }',
      side: THREE.BackSide,
    });
    mats.push(m); outlines[t] = m; return m;
  };
  const vmat = toon({ vertexColors: true });
  const E = new THREE.Euler(), Q = new THREE.Quaternion(), M = new THREE.Matrix4();
  function part(geo, color, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1 } = {}) {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    geo.dispose();
    E.set(rx, ry, rz); Q.setFromEuler(E);
    M.compose(new THREE.Vector3(x, y, z), Q, new THREE.Vector3(sx, sy, sz));
    g.applyMatrix4(M);
    const n = g.attributes.position.count, c = new THREE.Color(color), a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    return g;
  }
  function merge(parts) {
    let n = 0; for (const p of parts) n += p.attributes.position.count;
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
    let o = 0;
    for (const p of parts) {
      pos.set(p.attributes.position.array, o * 3); nor.set(p.attributes.normal.array, o * 3); col.set(p.attributes.color.array, o * 3);
      o += p.attributes.position.count; p.dispose();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeBoundingSphere(); geos.push(g); return g;
  }
  function mesh(geo, mat = vmat, outline = 0.035) {
    const m = new THREE.Mesh(geo, mat);
    if (outline) { const o = new THREE.Mesh(geo, outlineMat(outline)); o.raycast = () => {}; m.add(o); }
    return m;
  }
  function dispose() { mats.forEach((m) => m.dispose()); geos.forEach((g) => g.dispose()); texs.forEach((t) => t.dispose()); }
  return { toon, outlineMat, part, merge, mesh, vmat, geos, mats, texs, dispose };
}

/* ---------------------------------------------------------------- placeholder fox (same joints as the world kit) */
function buildFox(K, o) {
  const { part, merge, mesh } = K;
  const jersey = o.torso[0], shorts = o.torso[1], shoes = o.torso[2];
  const root = new THREE.Group();
  const body = new THREE.Group(); body.position.y = 1.1; root.add(body);
  const torso = [
    part(new THREE.CapsuleGeometry(0.42, 0.5, 4, 12), jersey, { y: 0.55, sz: 0.8 }),
    part(new THREE.CylinderGeometry(0.45, 0.43, 0.32, 14), shorts, { y: 0.12, sz: 0.82 }),
    part(new THREE.CylinderGeometry(0.3, 0.36, 0.1, 12), shorts, { y: 0.98, sz: 0.85 }),
    part(new THREE.CapsuleGeometry(0.17, 0.6, 3, 8), FUR, { y: 0.04, z: -0.72, rx: -2.0 }),
    part(new THREE.SphereGeometry(0.19, 10, 8), CREAM, { y: -0.18, z: -1.2 }),
  ];
  if (o.cane) {
    torso.push(part(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), 0xf4f1ea, { x: 0.1, y: 0.6, z: -0.42, rz: 0.55 }));
    torso.push(part(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 6), 0xec3013, { x: -0.25, y: 0.07, z: -0.42, rz: 0.55 }));
  }
  const tm = mesh(merge(torso)); body.add(tm);
  const head = new THREE.Group(); head.position.y = 1.0; body.add(head);
  const eye = o.redEyes ? 0xff2030 : 0x15121a;
  const hp = [
    part(new THREE.SphereGeometry(0.38, 16, 12), FUR, { y: 0.32, sy: 0.95 }),
    part(new THREE.SphereGeometry(0.24, 12, 10), CREAM, { y: 0.2, z: 0.2, sx: 1.15, sy: 0.8 }),
    part(new THREE.ConeGeometry(0.15, 0.36, 10), CREAM, { y: 0.22, z: 0.5, rx: Math.PI / 2 }),
    part(new THREE.SphereGeometry(0.065, 8, 6), 0x15121a, { y: 0.23, z: 0.68 }),
    part(new THREE.ConeGeometry(0.15, 0.36, 8), FUR, { x: 0.22, y: 0.68, z: -0.02, rz: -0.32 }),
    part(new THREE.ConeGeometry(0.15, 0.36, 8), FUR, { x: -0.22, y: 0.68, z: -0.02, rz: 0.32 }),
    part(new THREE.ConeGeometry(0.08, 0.2, 6), DARK, { x: 0.215, y: 0.66, z: 0.05, rz: -0.32 }),
    part(new THREE.ConeGeometry(0.08, 0.2, 6), DARK, { x: -0.215, y: 0.66, z: 0.05, rz: 0.32 }),
  ];
  if (o.shades) hp.push(part(new THREE.BoxGeometry(0.5, 0.11, 0.08), 0x101014, { y: 0.42, z: 0.33 }));
  else hp.push(part(new THREE.SphereGeometry(0.06, 8, 6), eye, { x: 0.14, y: 0.42, z: 0.32 }), part(new THREE.SphereGeometry(0.06, 8, 6), eye, { x: -0.14, y: 0.42, z: 0.32 }));
  head.add(mesh(merge(hp)));
  const arms = [], legs = [];
  for (const s of [1, -1]) {
    const a = new THREE.Group(); a.position.set(0.53 * s, 0.86, 0); body.add(a);
    a.add(mesh(merge([
      part(new THREE.CapsuleGeometry(0.11, 0.5, 3, 8), FUR, { y: -0.34 }),
      part(new THREE.SphereGeometry(0.14, 8, 6), DARK, { y: -0.7 }),
    ]), K.vmat, 0.03));
    arms.push(a);
    const l = new THREE.Group(); l.position.set(0.2 * s, 1.1, 0); root.add(l);
    l.add(mesh(merge([
      part(new THREE.CapsuleGeometry(0.15, 0.6, 3, 8), DARK, { y: -0.5 }),
      part(new THREE.CylinderGeometry(0.2, 0.18, 0.36, 10), shorts, { y: -0.14 }),
      part(new THREE.BoxGeometry(0.26, 0.17, 0.42), shoes, { y: -1.02, z: 0.07 }),
    ]), K.vmat, 0.03));
    legs.push(l);
  }
  root.userData.P = { body, head, arms, legs };
  return root;
}

function buildChair(K) {
  const { part, merge, mesh } = K;
  const g = merge([
    part(new THREE.BoxGeometry(1.0, 0.14, 0.9), 0x2b2d42, { y: 0.98 }),
    part(new THREE.BoxGeometry(1.0, 0.85, 0.12), 0x2b2d42, { y: 1.45, z: -0.46 }),
    part(new THREE.TorusGeometry(0.55, 0.07, 8, 24), 0x39e5ff, { x: 0.62, y: 0.62, z: -0.05, ry: Math.PI / 2 }),
    part(new THREE.TorusGeometry(0.55, 0.07, 8, 24), 0x39e5ff, { x: -0.62, y: 0.62, z: -0.05, ry: Math.PI / 2 }),
    part(new THREE.CylinderGeometry(0.62, 0.5, 0.14, 18), 0x1c1b1a, { y: 0.24 }),
    part(new THREE.TorusGeometry(0.56, 0.05, 6, 24), 0x39e5ff, { y: 0.17, rx: Math.PI / 2 }),
    part(new THREE.BoxGeometry(0.7, 0.08, 0.3), 0x2b2d42, { y: 0.42, z: 0.62 }),
    part(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6), 0x2b2d42, { y: 0.7, z: 0.5, rx: 0.4 }),
  ]);
  return mesh(g, K.vmat, 0.03);
}

/* ---------------------------------------------------------------- textures */
function courtTexture(W) {
  const U = 38, V = 22, s = W / U, H = Math.round(V * s);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const X = (x) => (x + U / 2) * s, Y = (z) => (z + V / 2) * s;
  g.fillStyle = '#161514'; g.fillRect(0, 0, W, H);
  const x0 = X(-C.HX), y0 = Y(-C.HZ), cw = 2 * C.HX * s, ch = 2 * C.HZ * s;
  for (let z = -C.HZ; z < C.HZ; z += 0.46) {
    let x = -C.HX - rnd(0, 4);
    while (x < C.HX) {
      const L = rnd(3, 6.5);
      g.fillStyle = `hsl(${31 + rnd(-2, 2)}, ${52 + rnd(-4, 4)}%, ${61 + rnd(-4, 3)}%)`;
      const a = Math.max(x, -C.HX), b = Math.min(x + L, C.HX);
      g.fillRect(X(a), Y(z), (b - a) * s, 0.46 * s + 1);
      g.fillStyle = 'rgba(90,55,25,0.35)'; g.fillRect(X(b) - 1, Y(z), 1.5, 0.46 * s);
      x += L;
    }
    g.fillStyle = 'rgba(90,55,25,0.25)'; g.fillRect(x0, Y(z), cw, 1.2);
  }
  /* paint */
  g.fillStyle = RED;
  for (const k of [1, -1]) { const a = Math.min(k * C.HX, k * C.FT_X), b = Math.max(k * C.HX, k * C.FT_X); g.fillRect(X(a), Y(-C.KEY_HW), (b - a) * s, 2 * C.KEY_HW * s); }
  g.fillStyle = YEL; g.beginPath(); g.arc(X(0), Y(0), C.CIRCLE_R * s, 0, Math.PI * 2); g.fill();
  /* lines */
  g.strokeStyle = '#ffffff'; g.lineWidth = 0.1 * s;
  g.strokeRect(x0, y0, cw, ch);
  g.beginPath(); g.moveTo(X(0), y0); g.lineTo(X(0), y0 + ch); g.stroke();
  g.beginPath(); g.arc(X(0), Y(0), C.CIRCLE_R * s, 0, Math.PI * 2); g.stroke();
  const asn = Math.asin(C.CORNER_Z / C.THREE_R), cx = Math.sqrt(C.THREE_R ** 2 - C.CORNER_Z ** 2);
  for (const k of [1, -1]) {
    const a = Math.min(k * C.HX, k * C.FT_X);
    g.strokeRect(X(a), Y(-C.KEY_HW), (C.HX - C.FT_X) * s, 2 * C.KEY_HW * s);
    g.beginPath(); g.arc(X(k * C.FT_X), Y(0), C.CIRCLE_R * s, k > 0 ? Math.PI / 2 : -Math.PI / 2, k > 0 ? Math.PI * 1.5 : Math.PI / 2); g.stroke();
    g.setLineDash([0.3 * s, 0.3 * s]);
    g.beginPath(); g.arc(X(k * C.FT_X), Y(0), C.CIRCLE_R * s, k > 0 ? -Math.PI / 2 : Math.PI / 2, k > 0 ? Math.PI / 2 : Math.PI * 1.5); g.stroke();
    g.setLineDash([]);
    for (const zz of [1, -1]) { g.beginPath(); g.moveTo(X(k * C.HX), Y(zz * C.CORNER_Z)); g.lineTo(X(k * (C.HOOP_X - cx)), Y(zz * C.CORNER_Z)); g.stroke(); }
    g.beginPath();
    if (k > 0) g.arc(X(C.HOOP_X), Y(0), C.THREE_R * s, Math.PI - asn, Math.PI + asn); else g.arc(X(-C.HOOP_X), Y(0), C.THREE_R * s, -asn, asn);
    g.stroke();
    g.beginPath(); g.arc(X(k * C.HOOP_X), Y(0), 1.25 * s, k > 0 ? Math.PI / 2 : -Math.PI / 2, k > 0 ? Math.PI * 1.5 : Math.PI / 2); g.stroke();
  }
  g.fillStyle = '#141312'; g.font = `900 ${1.5 * s}px Archivo, "Arial Black", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('8G', X(0), Y(0.06));
  g.fillStyle = '#ffffff'; g.font = `800 ${0.85 * s}px Archivo, "Arial Black", sans-serif`;
  g.fillText('8 GATES  BASKETBALL', X(0), Y(C.HZ + 0.75));
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function ballTexture() {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128;
  const g = cv.getContext('2d');
  g.fillStyle = '#e2661c'; g.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'; g.fillRect(Math.random() * 256, Math.random() * 128, 2, 2); }
  g.strokeStyle = '#1a1626'; g.lineWidth = 3.5;
  g.beginPath(); g.moveTo(0, 64); g.lineTo(256, 64); g.stroke();
  for (const x of [64, 192]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 128); g.stroke(); }
  for (const k of [0, 128]) { g.beginPath(); for (let y = 0; y <= 128; y += 4) { const x = k + 64 + Math.sin((y / 128) * Math.PI) * 40 * (k ? -1 : 1); y ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function bannerTexture(text, w = 1024, h = 128, bg = '#0b0b0a', fg = '#ffffff', accent = RED) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = accent; g.fillRect(0, h - 10, w, 10);
  g.fillStyle = fg; g.font = `900 ${h * 0.5}px Archivo, "Arial Black", sans-serif`; g.textBaseline = 'middle';
  let x = 20; while (x < w) { g.fillText(text, x, h * 0.47); x += g.measureText(text).width + 60; }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ================================================================ the game */
export async function createBasketball({ container, onState = () => {}, opts = {} } = {}) {
  const world = opts.world || null;
  const kit = opts.kit || null;
  const save = opts.save || null;
  const touch = (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;

  /* ---------- storage */
  const store = {
    get(k, d) {
      try {
        if (save && save.stat) { const v = save.stat(KEY + '.' + k, d); return v == null ? d : v; }
        const v = localStorage.getItem(KEY + '.' + k); return v == null ? d : JSON.parse(v);
      } catch (e) { return d; }
    },
    set(k, v) { try { if (save && save.setStat) save.setStat(KEY + '.' + k, v); else localStorage.setItem(KEY + '.' + k, JSON.stringify(v)); } catch (e) { /* */ } },
    gold(n) { try { if (save && save.addGold) save.addGold(n); else this.set('gold', (this.get('gold', 0) || 0) + n); } catch (e) { /* */ } },
  };
  const settings = {
    mode: 'cpu',
    diff: DIFF[store.get('diff', 'easy')] ? store.get('diff', 'easy') : 'easy',
    len: [2, 3, 5].includes(store.get('len', 3)) ? store.get('len', 3) : 3,
    sound: store.get('sound', true) !== false,
    music: world ? false : store.get('music', true) !== false,
  };
  if (opts.mode) settings.mode = opts.mode;
  if (opts.diff && DIFF[opts.diff]) settings.diff = opts.diff;

  const audio = createAudio({ sound: settings.sound, music: settings.music });

  /* ---------- renderer / scene */
  let renderer;
  if (world) renderer = world.renderer;
  else {
    renderer = new THREE.WebGLRenderer({ antialias: !(touch && devicePixelRatio > 1.5), powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x121110, 1);
    const el = renderer.domElement;
    el.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
    container.appendChild(el);
  }
  const K = makeKit();
  const scene = world ? new THREE.Group() : new THREE.Scene();
  const env = world ? new THREE.Scene() : scene; /* lights + room: throw-away in world mode */
  if (world) world.parent.add(scene);

  /* lights / room */
  env.add(new THREE.HemisphereLight(0xfff6ea, 0x40384a, 1.5));
  const sun = new THREE.DirectionalLight(0xffffff, 1.9); sun.position.set(6, 22, 14); env.add(sun);

  /* court: the playable object (always in the group) */
  const floorTex = courtTexture(touch ? 1536 : 2048); K.texs.push(floorTex);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(38, 22), K.toon({ map: floorTex }));
  floor.rotation.x = -Math.PI / 2; K.geos.push(floor.geometry); scene.add(floor);
  const nets = [];
  let crowdMesh = null, cheer = 0;
  for (const s of [1, -1]) buildHoop(s);
  if (!world) {
    scene.background = new THREE.Color(0x121110);
    scene.fog = new THREE.Fog(0x121110, 60, 140);
    buildArena();
  }

  /* ball */
  const ballTex = ballTexture(); K.texs.push(ballTex);
  const ballGeo = new THREE.SphereGeometry(C.BALL_R, 22, 16); K.geos.push(ballGeo);
  const ballMesh = K.mesh(ballGeo, K.toon({ map: ballTex }), 0.025); scene.add(ballMesh);
  const shadowGeo = new THREE.CircleGeometry(1, 20); K.geos.push(shadowGeo);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }); K.mats.push(shadowMat);
  const mkShadow = (r) => { const m = new THREE.Mesh(shadowGeo, shadowMat); m.rotation.x = -Math.PI / 2; m.scale.setScalar(r); m.position.y = 0.025; m.renderOrder = 1; scene.add(m); return m; };
  const ballShadow = mkShadow(0.22);

  /* markers for human players */
  const markers = {};
  for (const [who, col] of [['p1', 0xffd23a], ['p2', 0xffffff]]) {
    const g = new THREE.Group();
    const ringG = new THREE.RingGeometry(0.75, 0.95, 32); K.geos.push(ringG);
    const ringM = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, depthWrite: false }); K.mats.push(ringM);
    const ring = new THREE.Mesh(ringG, ringM); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.04; ring.renderOrder = 2;
    const coneG = new THREE.ConeGeometry(0.22, 0.4, 3); K.geos.push(coneG);
    const cone = K.mesh(coneG, K.toon({ color: col }), 0.03); cone.rotation.x = Math.PI; cone.position.y = 3.5;
    g.add(ring, cone); g.visible = false; scene.add(g); markers[who] = { g, cone };
  }

  /* shot meter (3D billboard, works in world mode too) */
  const meter = new THREE.Group(); meter.visible = false; scene.add(meter);
  const mm = (w, h, color, oy = 0) => {
    const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, oy, 0); K.geos.push(geo);
    const mat = new THREE.MeshBasicMaterial({ color, depthTest: false, depthWrite: false, transparent: true }); K.mats.push(mat);
    const m = new THREE.Mesh(geo, mat); m.renderOrder = 999; meter.add(m); return m;
  };
  const mBg = mm(0.42, 1.72, 0x0b0b0a); mBg.position.y = 0.75;
  const mTrack = mm(0.26, 1.5, 0x3a3836, 0.75); mTrack.renderOrder = 1000;
  const mZone = mm(0.26, 1, 0xffd23a, 0.5); mZone.renderOrder = 1001;
  const mFill = mm(0.14, 1, 0xffffff, 0.5); mFill.renderOrder = 1002;

  /* cameras */
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
  const wcam = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
  const scratch = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
  const cam = { T: new THREE.Vector3(0, 1, 0), d: 34, yaw: 0, gT: new THREE.Vector3(0, 1, 0), gd: 34, gyaw: 0, pitch: 0.62 };
  let safe = { top: 0, bottom: 0, left: 0, right: 0 };
  let W = 1, H = 1;

  /* ---------- state */
  let players = [];
  const ball = { x: 0, y: 2, z: 0, vx: 0, vy: 0, vz: 0, owner: null, mode: 'loose', to: null, tx: 0, tz: 0, age: 0, lastTouch: 0, lastShot: null, touchedRim: false, scored: false, icpt: new Set(), blocked: new Set(), dribSign: 1, hx: 0 };
  let match = null;
  let paused = false, left = false;
  let result = null;
  const inp = { p1: mkInput(), p2: mkInput() };
  function mkInput() { return { sx: 0, sy: 0, keys: new Set(), a: false, b: false, c: false, d: false, ev: [], last: 0, keyT: 0 }; }
  let sawKeyUp = false;
  let caption = null, captionT = 0, seenCap = {};
  let raf = 0, last = performance.now(), hudT = 0, hudDirty = true, time = 0;
  let destroyed = false;

  /* ---------- arena (standalone only) */
  function buildArena() {
    const { part, merge, mesh } = K;
    const base = new THREE.Mesh(new THREE.PlaneGeometry(140, 100), K.toon({ color: 0x1a1918 }));
    base.rotation.x = -Math.PI / 2; base.position.y = -0.02; K.geos.push(base.geometry); env.add(base);
    const steps = [];
    for (let i = 0; i < 6; i++) steps.push(part(new THREE.BoxGeometry(48, 0.7 * (i + 1), 1.5), i % 2 ? 0x2a2827 : 0x34312f, { y: 0.35 * (i + 1), z: -(C.HZ + 3.2 + i * 1.5) }));
    for (const s of [1, -1]) for (let i = 0; i < 3; i++) steps.push(part(new THREE.BoxGeometry(1.5, 0.6 * (i + 1), 22), i % 2 ? 0x2a2827 : 0x34312f, { x: s * (C.HX + 7 + i * 1.5), y: 0.3 * (i + 1) }));
    env.add(mesh(merge(steps), K.vmat, 0));
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(140, 30), K.toon({ color: 0x191817 })); wall.position.set(0, 15, -(C.HZ + 13)); K.geos.push(wall.geometry); env.add(wall);
    const t1 = bannerTexture('8 GATES BASKETBALL'); K.texs.push(t1);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(46, 1.1), new THREE.MeshBasicMaterial({ map: t1 })); K.mats.push(board.material); K.geos.push(board.geometry);
    board.position.set(0, 0.6, -(C.HZ + 2.35)); env.add(board);
    const t2 = bannerTexture('FREQUENCY JOY  ORA FAMILY', 1024, 128, '#ec3013', '#0b0b0a', '#ffd23a'); K.texs.push(t2);
    const ban = new THREE.Mesh(new THREE.PlaneGeometry(40, 5), new THREE.MeshBasicMaterial({ map: t2 })); K.mats.push(ban.material); K.geos.push(ban.geometry);
    ban.position.set(0, 13, -(C.HZ + 12.9)); env.add(ban);
    /* crowd foxes: one instanced mesh */
    const cg = merge([
      part(new THREE.CapsuleGeometry(0.32, 0.35, 3, 8), 0xffffff, { y: 0.5 }),
      part(new THREE.SphereGeometry(0.27, 10, 8), 0xffffff, { y: 1.15 }),
      part(new THREE.ConeGeometry(0.1, 0.24, 5), 0xffffff, { x: 0.15, y: 1.42, rz: -0.3 }),
      part(new THREE.ConeGeometry(0.1, 0.24, 5), 0xffffff, { x: -0.15, y: 1.42, rz: 0.3 }),
    ]);
    const cols = [0xe8772e, 0xec3013, 0xffd23a, 0xf4f1ea, 0x5b8cff, 0xd9a25e, 0x8a5a3c, 0xffffff];
    const seats = [];
    for (let r = 0; r < 6; r++) for (let x = -22; x <= 22; x += 1.15) if (Math.random() < 0.82) seats.push([x + rnd(-0.2, 0.2), 0.7 * (r + 1), -(C.HZ + 3.2 + r * 1.5)]);
    for (const s of [1, -1]) for (let r = 0; r < 3; r++) for (let z = -10; z <= 10; z += 1.2) if (Math.random() < 0.7) seats.push([s * (C.HX + 7 + r * 1.5), 0.6 * (r + 1), z + rnd(-0.2, 0.2)]);
    const crowd = new THREE.InstancedMesh(cg, K.toon({ vertexColors: true }), seats.length);
    const m4 = new THREE.Matrix4(), col = new THREE.Color();
    seats.forEach((p, i) => { m4.makeTranslation(p[0], p[1], p[2]); crowd.setMatrixAt(i, m4); crowd.setColorAt(i, col.setHex(cols[(Math.random() * cols.length) | 0])); });
    crowd.userData.seats = seats; crowd.userData.ph = seats.map(() => Math.random() * 6.28);
    env.add(crowd); crowdMesh = crowd;
  }
  function buildHoop(s) {
    const { part, merge, mesh } = K;
    const px = s * (C.HX + 1.9), bx = s * (C.BOARD_X + 0.05);
    const parts = [
      part(new THREE.BoxGeometry(1.3, 1.2, 1.6), 0x1c1b1a, { x: s * (C.HX + 2.3), y: 0.6 }),
      part(new THREE.CylinderGeometry(0.16, 0.2, 5.2, 10), 0x2b2826, { x: px, y: 2.6 }),
      part(new THREE.BoxGeometry(Math.abs(px - bx), 0.22, 0.22), 0x2b2826, { x: (px + bx) / 2, y: 4.95 }),
      part(new THREE.BoxGeometry(0.08, C.BOARD_Y1 - C.BOARD_Y0, C.BOARD_HW * 2), 0xf4f1ea, { x: bx, y: (C.BOARD_Y0 + C.BOARD_Y1) / 2 }),
      part(new THREE.BoxGeometry(0.04, 0.07, 0.8), 0xec3013, { x: bx - s * 0.05, y: C.RIM_Y + 0.06 }),
      part(new THREE.BoxGeometry(0.04, 0.07, 0.8), 0xec3013, { x: bx - s * 0.05, y: C.RIM_Y + 0.62 }),
      part(new THREE.BoxGeometry(0.04, 0.6, 0.07), 0xec3013, { x: bx - s * 0.05, y: C.RIM_Y + 0.34, z: 0.38 }),
      part(new THREE.BoxGeometry(0.04, 0.6, 0.07), 0xec3013, { x: bx - s * 0.05, y: C.RIM_Y + 0.34, z: -0.38 }),
      part(new THREE.TorusGeometry(C.RIM_R, C.RIM_T, 8, 28), 0xec3013, { x: s * C.HOOP_X, y: C.RIM_Y, rx: Math.PI / 2 }),
      part(new THREE.BoxGeometry(0.22, 0.05, 0.12), 0xec3013, { x: s * (C.HOOP_X + C.RIM_R + 0.1), y: C.RIM_Y }),
    ];
    scene.add(mesh(merge(parts), K.vmat, 0.025));
    /* net: line segments */
    const rings = [[0, C.RIM_R], [-0.28, 0.34], [-0.55, 0.28], [-0.78, 0.23]], N = 12, pts = [];
    for (let r = 0; r < rings.length - 1; r++) for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 0.5) / N) * Math.PI * 2, a2 = ((i + 1) / N) * Math.PI * 2;
      const [y0, r0] = rings[r], [y1, r1] = rings[r + 1];
      pts.push(Math.cos(a0) * r0, y0, Math.sin(a0) * r0, Math.cos(a1) * r1, y1, Math.sin(a1) * r1);
      pts.push(Math.cos(a2) * r0, y0, Math.sin(a2) * r0, Math.cos(a1) * r1, y1, Math.sin(a1) * r1);
    }
    const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); K.geos.push(ng);
    const nm = new THREE.LineBasicMaterial({ color: 0xffffff }); K.mats.push(nm);
    const net = new THREE.LineSegments(ng, nm); net.position.set(s * C.HOOP_X, C.RIM_Y, 0); scene.add(net);
    nets.push({ net, s, k: 0 });
  }

  /* ---------- fox adapter */
  function makeFox(o) {
    let g;
    if (kit && kit.makeFox) { g = kit.makeFox({ ...o, torso: o.torso, outfit: o.outfit || 'tee', mood: o.mood || 'happy' }); g.userData.kit = true; }   /* 8 GATES: the world's kit also gets who / team / slot / cast so it can dress the real cast */
    else g = buildFox(K, o);
    if (o.chair) { const ch = buildChair(K); g.add(ch); g.userData.chair = ch; }
    g.userData.ph = 0;
    return g;
  }
  function animFox(p, dt) {
    const g = p.mesh, P = g.userData.P, sp = Math.hypot(p.vx, p.vz);
    if (!P) return;
    const ud = g.userData;
    if (ud.kit && kit.animFox) kit.animFox(g, dt, p.chair ? 0 : sp);
    ud.ph += dt * (3 + sp * 1.6);
    const sw = Math.sin(ud.ph) * Math.min(1, sp / 5);
    if (!ud.kit) {
      P.legs[0].rotation.x = sw * 0.75; P.legs[1].rotation.x = -sw * 0.75;
      P.body.position.y = 1.1 + Math.abs(Math.cos(ud.ph)) * 0.05 * Math.min(1, sp / 3);
    }
    if (p.chair) { P.legs[0].rotation.x = P.legs[1].rotation.x = -1.45; P.body.position.y = 1.08; }
    const A = P.arms;
    const set = (i, x, z) => { if (A[i]) { A[i].rotation.x += (x - A[i].rotation.x) * Math.min(1, dt * 16); A[i].rotation.z += (z - A[i].rotation.z) * Math.min(1, dt * 16); } };
    let lean = Math.min(0.25, sp * 0.03);
    const holder = ball.owner;
    const defending = holder && holder.team !== p.team;
    if (p.state === 'shoot' || p.state === 'dunk' || (p.state === 'air' && p.st < 0.25)) { set(0, -2.9, 0.15); set(1, -2.9, -0.15); lean = -0.05; }
    else if (p.state === 'jump') { set(0, -2.8, 0.3); set(1, -2.8, -0.3); }
    else if (p.reachT > 0) { set(0, -1.4, 0.1); set(1, -1.6, -0.1); lean = 0.35; }
    else if (p.celebrate > 0) { const w = Math.sin(time * 14) * 0.3; set(0, -2.7 + w, 0.5); set(1, -2.7 - w, -0.5); }
    else if (p.hasBall && match && (match.phase === 'inbound' || ball.mode !== 'held')) { set(0, -1.1, -0.2); set(1, -1.1, 0.2); }
    else if (p.hasBall) { set(0, -0.5, 0.25); set(1, -0.45 - Math.max(0, Math.sin(p.drib || 0)) * 0.4, -0.15); }
    else if (defending) { set(0, -0.5, 1.15); set(1, -0.5, -1.15); lean = 0.22; }
    else if (p.chair) { set(0, -0.3 + sw * 0.5, 0.3); set(1, -0.3 + sw * 0.5, -0.3); }
    else { set(0, -sw * 0.8, 0.08); set(1, sw * 0.8, -0.08); }
    P.body.rotation.x += (lean - P.body.rotation.x) * Math.min(1, dt * 8);
    if (P.head) P.head.rotation.x = -lean * 0.6;
  }

  /* ---------- teams */
  function buildTeams() {
    for (const p of players) {
      scene.remove(p.mesh); scene.remove(p.shadow);
      if (!p.mesh.userData.kit) p.mesh.traverse((o) => { if (o.isMesh && o.geometry && !o.material.isShaderMaterial) o.geometry.dispose(); });
    }
    players = [];
    const mode = settings.mode, D = DIFF[settings.diff];
    const away = mode === 'local' ? DIFF.easy : D;
    const aSt = TEAMSTYLE[away.key];
    const hSt = TEAMSTYLE.home;
    const roster = [
      { team: 0, slot: 0, name: mode === 'demo' ? 'RUSTY' : mode === 'local' ? 'P1' : 'YOU', sk: mode === 'demo' ? DIFF.medium : HUMAN_SKILL, style: hSt },
      { team: 0, slot: 1, name: 'KIT', sk: DIFF.medium, style: hSt },
      { team: 1, slot: 0, name: mode === 'local' ? 'P2' : away.who, sk: mode === 'local' ? HUMAN_SKILL : away, style: aSt, cast: mode === 'local' ? null : away.key },
      { team: 1, slot: 1, name: mode === 'local' ? 'MOSS' : away.mate, sk: { ...away, shoot: away.shoot * 0.95 }, style: aSt },
    ];
    roster.forEach((r, i) => {
      const cast = r.cast;
      const mesh = makeFox({ who: r.name, team: r.team, slot: r.slot, cast, torso: [r.style.jersey, r.style.shorts, r.style.shoes], shades: cast === 'medium', cane: cast === 'medium', redEyes: cast === 'hard', chair: cast === 'hard', outfit: 'tee' });
      scene.add(mesh);
      const p = {
        id: i, team: r.team, slot: r.slot, name: r.name, sk: r.sk, mesh, shadow: mkShadow(0.75), chair: cast === 'hard',
        x: 0, z: 0, vx: 0, vz: 0, y: 0, vy: 0, face: 0, state: 'run', st: 0, hasBall: false, stam: 1, ai: {}, human: null,
        noGrab: 0, stealCd: 0, reachT: 0, celebrate: 0, jumped: false, tipper: false, shot: null, drib: 0, hang: 0, wantsBall: false,
      };
      players.push(p);
    });
    if (mode === 'cpu') players[0].human = 'p1';
    if (mode === 'local') { players[0].human = 'p1'; players[2].human = 'p2'; }
  }
  const humanOf = (who) => players.find((p) => p.human === who);
  const teamName = (t) => (t === 0 ? (settings.mode === 'local' ? 'P1' : 'FOXES') : settings.mode === 'local' ? 'P2' : DIFF[settings.diff].who);
  const teamCss = (t) => (t === 0 ? TEAMSTYLE.home.css : TEAMSTYLE[settings.mode === 'local' ? 'easy' : settings.diff].css);

  /* ---------- match flow */
  function newMatch() {
    buildTeams();
    match = { phase: 'tip', t: 0, clock: settings.len * 60, shotClock: C.SHOT_CLOCK, score: [0, 0], poss: null, possId: 0, msg: null, msgT: 0, msgId: 0, timer: 0, ot: false, buzzer: false, next: null, tipped: false };
    result = null; paused = false; left = false;
    caption = null; seenCap = {};
    setupTip();
    snapCam();
    hudDirty = true;
  }
  function say(text, sub = '', dur = 1.4) { match.msg = { text, sub }; match.msgT = dur; match.msgId++; hudDirty = true; }
  function cap(key) {
    if (settings.mode !== 'demo' && !(key === 'tip' && !seenCap.any)) return;
    if (seenCap[key]) return; seenCap[key] = true; seenCap.any = true;
    caption = CAPTIONS[key]; captionT = 4; hudDirty = true;
  }
  function resetBall() { Object.assign(ball, { dunk: false, owner: null, mode: 'loose', to: null, age: 0, lastShot: null, touchedRim: false, scored: false, vx: 0, vy: 0, vz: 0 }); ball.icpt.clear(); ball.blocked.clear(); }
  function clearPlayers() {
    for (const p of players) { p.hasBall = false; p.state = 'run'; p.st = 0; p.y = 0; p.vy = 0; p.vx = 0; p.vz = 0; p.shot = null; p.jumped = false; p.tipper = false; p.celebrate = 0; p.reachT = 0; p.hang = 0; p.ai = {}; p.noGrab = 0; }
  }
  function setupTip() {
    clearPlayers(); resetBall();
    const pos = [[-0.65, 0], [-5.5, 3.2], [0.65, 0], [5.5, -3.2]];
    players.forEach((p, i) => { p.x = pos[i][0]; p.z = pos[i][1]; p.face = p.team === 0 ? Math.PI / 2 : -Math.PI / 2; p.tipper = p.slot === 0; });
    Object.assign(ball, { x: 0, y: 2.4, z: 0 });
    ball.mode = 'tipwait'; match.phase = 'tip'; match.timer = 1.1;
    say('TIP-OFF', settings.mode === 'demo' ? '' : 'JUMP AT THE TOP', 1.6);
    cap('tip');
    sfxWhistle();
  }
  function sfxWhistle() { audio.sfx('whistle', 0.35); }

  function setupInbound(team, x, z) {
    clearPlayers(); resetBall();
    let ix, iz;
    if (Math.abs(z) > C.HZ - 1.5 && Math.abs(x) < C.HX - 1) { iz = Math.sign(z || 1) * (C.HZ + 0.7); ix = clamp(x, -C.HX + 2, C.HX - 2); }
    else { ix = Math.sign(x || 1) * (C.HX + 0.7); iz = clamp(z, -C.HZ + 2.5, C.HZ - 2.5); if (Math.abs(iz) < 2.4) iz = 2.4 * (Math.sign(iz) || 1); }
    const mine = players.filter((p) => p.team === team), foes = players.filter((p) => p.team !== team);
    const inb = mine[0].human ? mine[0] : mine[1].human ? mine[1] : mine[0];
    const rec = mine.find((p) => p !== inb);
    inb.x = ix; inb.z = iz;
    if (Math.abs(ix) > C.HX) { rec.x = Math.sign(ix) * (C.HX - 4.5); rec.z = -Math.sign(iz) * 2.6; }
    else { rec.x = clamp(ix + attackX(team) * 0.15, -C.HX + 3, C.HX - 3); rec.z = Math.sign(iz) * (C.HZ - 4.2); }
    const dx = -attackX(team) * -1; /* defenders' own hoop is where this team attacks */
    const guardRec = foes.find((f) => f.slot === rec.slot) || foes[0];
    const guardInb = foes.find((f) => f !== guardRec);
    guardRec.x = rec.x + Math.sign(dx - rec.x) * 1.4; guardRec.z = rec.z * 0.85;
    guardInb.x = clamp(ix, -C.HX + 1.2, C.HX - 1.2) + (Math.abs(ix) > C.HX ? -Math.sign(ix) * 1.6 : 0); guardInb.z = clamp(iz, -C.HZ + 1.4, C.HZ - 1.4);
    for (const p of players) p.face = Math.atan2(rec.x - p.x, rec.z - p.z);
    inb.face = Math.atan2(rec.x - inb.x, rec.z - inb.z);
    give(inb, true);
    match.phase = 'inbound'; match.timer = 0; match.inbounder = inb;
    hudDirty = true;
  }

  function give(p, inbound = false) {
    const prevTeam = match.poss;
    for (const q of players) q.hasBall = false;
    ball.owner = p; p.hasBall = true; ball.mode = 'held'; ball.to = null; ball.lastTouch = p.team;
    ball.icpt.clear(); ball.blocked.clear();
    if (prevTeam !== p.team || ball.lastShot) { match.shotClock = C.SHOT_CLOCK; }
    if (prevTeam !== p.team) { match.possId++; }
    match.poss = p.team;
    ball.lastShot = null; ball.touchedRim = false; ball.scored = false;
    p.ai.hold = 0; p.wantsBall = false;
    if (!inbound && p.state !== 'shoot') p.state = p.y > 0 ? 'air' : 'run';
    /* control follows the ball inside a human team */
    const mate = players.find((q) => q.team === p.team && q !== p);
    if (mate && mate.human && !p.human) { p.human = mate.human; mate.human = null; }
    hudDirty = true;
  }

  /* ---------- actions */
  function hoopDist(p) { return dist2(p.x, p.z, attackX(p.team), 0); }
  function nearestFoeDist(p) { let d = 99; for (const q of players) if (q.team !== p.team) d = Math.min(d, dist2(p.x, p.z, q.x, q.z)); return d; }
  function startShot(p, wantDunk = false) {
    if (!p.hasBall || p.state === 'shoot' || p.state === 'dunk' || match.phase === 'inbound') return;
    if (!['play', 'ot'].includes(match.phase) || p.y > 0.05) return;
    const d = hoopDist(p), hx = attackX(p.team);
    const z = sweetZone(d);
    p.st = 0; p.state = 'shoot';
    if (d < 3.4 && wantDunk && !p.chair && p.y === 0) { p.state = 'dunk'; p.shot = { kind: 'dunk', hx }; p.vy = 9.6; p.jumped = true; audio.sfx('jump'); cap('dunk'); return; }
    if (d < 2.6) { p.shot = { kind: 'lay', d, zone: z, hx }; p.vy = p.chair ? 4.6 : 7.4; p.jumped = true; audio.sfx('jump'); return; }
    const aiAt = p.human ? 99 : clamp(z.c + gauss() * p.sk.meterErr, 0.25, 1.02) * METER_T;
    p.shot = { kind: 'jump', d, zone: z, hx, meter: 0, aiAt, jumped: false };
    cap('shoot');
  }
  function releaseShot(p, late = false) {
    const S = p.shot; if (!S || !p.hasBall) return;
    const d = hoopDist(p);
    let grade = 'auto';
    if (S.kind === 'jump') grade = late ? 'bad' : timingGrade(clamp(S.meter, 0, 1.2), S.zone);
    const contest = nearestFoeDist(p);
    const chance = makeChance({ d, grade, contest, skill: p.sk.shoot });
    const made = Math.random() < chance;
    const pts = shotPoints(p.x, p.z, S.hx);
    launch(p, made, grade, S.hx);
    ball.lastShot = { team: p.team, pts, shooter: p };
    if (pts === 3) cap('three');
    if (S.kind === 'jump' && (p.human || settings.mode === 'demo')) {
      const label = { perfect: 'PERFECT', good: 'GOOD', ok: 'EARLY', bad: 'LATE' }[grade];
      let lab = label;
      if (grade === 'ok' && S.meter > S.zone.c) lab = 'LATE';
      if (p.human) { say(lab, '', 0.8); if (grade === 'perfect') audio.sfx('perfect'); }
    }
    p.state = p.y > 0 ? 'air' : 'run'; p.st = 0; p.shot = null; p.noGrab = 0.5;
  }
  function launch(p, made, grade, hx) {
    const s = Math.sign(hx);
    const sx = ball.x, sy = ball.y, sz = ball.z;
    let tx = hx, tz = 0, ty = C.RIM_Y;
    if (made) { tx += rnd(-0.07, 0.07); tz += rnd(-0.07, 0.07); }
    else if (grade === 'bad' && Math.random() < 0.6) {
      const a = Math.atan2(sz - 0, sx - hx) + rnd(-0.5, 0.5), r = rnd(0.8, 1.3); tx = hx + Math.cos(a) * r; tz = Math.sin(a) * r; ty = C.RIM_Y - 0.3;
    } else {
      const a = rnd(0, Math.PI * 2), r = rnd(0.38, 0.55); tx = hx + Math.cos(a) * r; tz = Math.sin(a) * r;
      if (Math.abs(tx - hx) < 0.15 && Math.random() < 0.5) tx = hx + s * 0.45;
    }
    const d = Math.hypot(tx - sx, tz - sz);
    const apex = Math.max(sy, C.RIM_Y) + 1.25 + d * 0.085;
    const vy = Math.sqrt(2 * C.G * (apex - sy));
    const tUp = vy / C.G, tDn = Math.sqrt(2 * Math.max(0.05, apex - ty) / C.G), T = tUp + tDn;
    ball.owner = null; p.hasBall = false;
    Object.assign(ball, { mode: 'shot', vx: (tx - sx) / T, vy, vz: (tz - sz) / T, age: 0, hx, touchedRim: false, scored: false, made, dunk: false, lastTouch: p.team });
    ball.blocked.clear();
    audio.sfx('pass', 0.5);
    hudDirty = true;
  }
  function slam(p) {
    const S = p.shot, hx = S.hx, s = Math.sign(hx);
    const contest = nearestFoeDist(p);
    const made = Math.random() < makeChance({ d: 1, grade: 'perfect', contest, skill: 1.05 });
    p.hasBall = false; ball.owner = null;
    if (made) Object.assign(ball, { x: hx - s * 0.05, y: C.RIM_Y + 0.35, z: 0, vx: 0, vy: -7, vz: 0 });
    else Object.assign(ball, { x: hx - s * 0.38, y: C.RIM_Y + 0.25, z: rnd(-0.2, 0.2), vx: -s * 2, vy: 3.5, vz: rnd(-1.5, 1.5) });
    Object.assign(ball, { mode: 'shot', age: 0.5, hx, made, dunk: made, touchedRim: false, scored: false, lastTouch: p.team });
    ball.lastShot = { team: p.team, pts: 2, shooter: p, dunk: made };
    p.hang = made ? 0.32 : 0; p.state = 'air'; p.shot = null; p.noGrab = 0.5;
    if (made) { audio.sfx('rim'); nets.forEach((n) => { if (n.s === s) n.k = 1.3; }); }
  }
  function passTo(p, q) {
    if (!p.hasBall || !q || p.state === 'shoot' || p.state === 'dunk') return;
    const d = dist2(p.x, p.z, q.x, q.z);
    const T = 0.22 + d / 18;
    const tx = clamp(q.x + q.vx * T * 0.6, -C.HX + 0.5, C.HX - 0.5), tz = clamp(q.z + q.vz * T * 0.6, -C.HZ + 0.5, C.HZ - 0.5);
    const sy = ball.y = Math.max(ball.y, 1.6);
    const vy = (1.9 - sy) / T + 0.5 * C.G * T;
    p.hasBall = false; ball.owner = null;
    Object.assign(ball, { mode: 'pass', to: q, tx, tz, vx: (tx - ball.x) / T, vy, vz: (tz - ball.z) / T, age: 0, lastTouch: p.team });
    ball.icpt.clear();
    p.noGrab = 0.35;
    audio.sfx('pass');
    if (match.phase === 'inbound') { match.phase = match.ot ? 'ot' : 'play'; hudDirty = true; }
    cap('pass');
  }
  function steal(p) {
    if (p.stealCd > 0 || p.state === 'shoot') return;
    p.stealCd = 0.75; p.reachT = 0.28;
    const h = ball.owner;
    if (!h || h.team === p.team || match.phase === 'inbound') return;
    const d = dist2(p.x, p.z, h.x, h.z);
    if (d > 1.9) return;
    let ch = p.sk.steal * clamp((2.0 - d) / 1.0, 0.2, 1);
    if (h.state === 'shoot' || h.state === 'dunk') ch *= 0.25;
    if (h.human) ch *= 0.8;
    if (Math.random() < ch) {
      h.hasBall = false; ball.owner = null; h.noGrab = 0.6;
      const ax = p.x - h.x, az = p.z - h.z, L = Math.hypot(ax, az) || 1;
      Object.assign(ball, { mode: 'loose', vx: (ax / L) * 3.5 + rnd(-1, 1), vy: 2.5, vz: (az / L) * 3.5 + rnd(-1, 1), y: 1.0, lastTouch: h.team });
      if (h.state === 'shoot') { h.state = 'run'; h.shot = null; }
      say('STEAL', p.name, 1.1); audio.sfx('steal'); cap('steal');
      cheer = Math.max(cheer, 0.6);
    }
  }
  function jump(p) {
    if (p.y > 0.01 || p.state === 'shoot' || p.state === 'dunk' || p.hasBall) return;
    p.vy = p.chair ? 4.8 : 7.6; p.state = 'jump'; p.jumped = true; audio.sfx('jump');
  }
  function switchMan(who) {
    const p = humanOf(who); if (!p || p.hasBall) return;
    const mate = players.find((q) => q.team === p.team && q !== p);
    if (!mate || mate.human) return;
    mate.human = who; p.human = null; audio.sfx('click');
  }

  /* ---------- input */
  function act(who, name, down) {
    if (paused || left || !match) return;
    audio.resume();
    const I = inp[who];
    I.last = time;
    if (name === 'a') { I.a = down; I.ev.push(down ? 'aDown' : 'aUp'); }
    else if (name === 'b') { I.b = down; if (down) I.ev.push('bDown'); }
    else if (name === 'c') I.c = down;
    else if (name === 'd') { I.d = down; if (down) I.ev.push('dDown'); }
  }
  function processHuman(p, who, dt) {
    const I = inp[who];
    const evs = I.ev.splice(0);
    for (const e of evs) {
      if (e === 'aDown') {
        if (match.phase === 'tip') { if (p.tipper) jump(p); }
        else if (p.hasBall) startShot(p, I.c);
        else jump(p);
      } else if (e === 'aUp') {
        if (p.state === 'shoot' && p.shot && p.shot.kind === 'jump') releaseShot(p);
      } else if (e === 'bDown') {
        const mate = players.find((q) => q.team === p.team && q !== p);
        if (p.hasBall) passTo(p, mate);
        else if (ball.owner && ball.owner.team !== p.team) steal(p);
        else if (ball.mode === 'pass' && ball.to && ball.to.team !== p.team) { p.reachT = 0.28; p.icptBoost = 0.35; }
        else if (ball.owner === mate) mate.wantsBall = true;
      } else if (e === 'dDown') switchMan(who);
    }
    /* move */
    let ix = I.sx, iy = I.sy;
    const k = I.keys;
    const kx = (k.has('right') ? 1 : 0) - (k.has('left') ? 1 : 0), ky = (k.has('up') ? 1 : 0) - (k.has('down') ? 1 : 0);
    if (kx || ky) { const L = Math.hypot(kx, ky); ix = kx / L; iy = ky / L; }
    const f = { x: Math.sin(cam.yaw), z: -Math.cos(cam.yaw) }, r = { x: -f.z, z: f.x };
    const mx = r.x * ix + f.x * iy, mz = r.z * ix + f.z * iy;
    return { mx, mz, sprint: I.c };
  }

  const KEYMAP_ONE = { KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', Space: 'a', KeyJ: 'a', KeyK: 'b', ShiftLeft: 'c', ShiftRight: 'c', KeyL: 'c', KeyQ: 'd', KeyI: 'd' };
  const KEYMAP_P1 = { KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right', KeyF: 'a', KeyG: 'b', ShiftLeft: 'c', KeyQ: 'd' };
  const KEYMAP_P2 = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyK: 'a', KeyL: 'b', ShiftRight: 'c', KeyO: 'd', Enter: 'a', Slash: 'b' };
  function key(e) {
    if (!e || destroyed) return false;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return false;
    const down = e.type !== 'keyup';
    if (!down) sawKeyUp = true;
    if (down && (e.code === 'Escape' || e.code === 'KeyP')) { paused = !paused; hudDirty = true; return true; }
    const maps = settings.mode === 'local' ? [['p1', KEYMAP_P1], ['p2', KEYMAP_P2]] : [['p1', KEYMAP_ONE]];
    for (const [who, map] of maps) {
      const a = map[e.code]; if (!a) continue;
      const I = inp[who];
      I.keyT = time;
      if (['up', 'down', 'left', 'right'].includes(a)) { if (down) I.keys.add(a); else I.keys.delete(a); I.last = time; audio.resume(); }
      else if (!(down && e.repeat)) {
        if (!down && !I[a]) continue;
        if (down && I[a] && sawKeyUp) continue;
        /* no keyup from the host: a second press of SHOOT releases the shot */
        if (down && a === 'a' && !sawKeyUp && I.a) { act(who, 'a', false); continue; }
        act(who, a, down);
      }
      if (e.preventDefault && !world) e.preventDefault();
      return true;
    }
    return false;
  }
  function onKey(e) { key(e); }
  function stick(who, x, y) { const I = inp[who] || inp.p1; I.sx = clamp(x, -1, 1); I.sy = clamp(y, -1, 1); if (x || y) { I.last = time; audio.resume(); } }

  /* pointer: tap a teammate to pass to them; also unlocks audio */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  function onPointer(e) {
    if (e.target !== renderer.domElement) return;
    if (world) { e.preventDefault(); e.stopImmediatePropagation(); }
    audio.resume();
    if (!match || paused) return;
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    camera.updateMatrixWorld();
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(plane, hit)) return;
    const p = humanOf('p1'); if (!p) return;
    inp.p1.last = time;
    const mate = players.find((q) => q.team === p.team && q !== p);
    if (p.hasBall && mate && dist2(hit.x, hit.z, mate.x, mate.z) < 2.2) passTo(p, mate);
  }
  if (world) window.addEventListener('pointerdown', onPointer, true);
  else {
    renderer.domElement.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
  }
  const unlock = () => audio.resume();
  if (!world) window.addEventListener('pointerdown', unlock, { once: true });

  /* ---------- sizing */
  function measure() {
    const el = world ? world.renderer.domElement : container;
    W = Math.max(1, el.clientWidth || 1); H = Math.max(1, el.clientHeight || 1);
  }
  let ro = null;
  if (!world) {
    const fit = () => { measure(); renderer.setSize(W, H, false); };
    ro = new ResizeObserver(fit); ro.observe(container); fit();
  } else measure();

  /* ---------- simulation */
  function stepPlayers(dt) {
    const W_ = { players, ball, match, dt };
    for (const p of players) {
      p.noGrab = Math.max(0, p.noGrab - dt); p.stealCd = Math.max(0, p.stealCd - dt); p.reachT = Math.max(0, p.reachT - dt);
      p.celebrate = Math.max(0, p.celebrate - dt); p.icptBoost = Math.max(0, (p.icptBoost || 0) - dt);
      let mx = 0, mz = 0, sprint = false;
      const frozen = match.phase === 'over' || match.phase === 'score' || match.phase === 'dead' || (match.phase === 'inbound' && p === match.inbounder) || match.phase === 'tip';
      if (p.human && !['over'].includes(match.phase)) {
        const r = processHuman(p, p.human, dt); mx = r.mx; mz = r.mz; sprint = r.sprint;
        if (frozen) { mx = mz = 0; }
      } else if (!frozen || match.phase === 'tip' || match.phase === 'inbound') {
        const o = aiThink(p, W_);
        if (!frozen) {
          const dx = o.tx - p.x, dz = o.tz - p.z, L = Math.hypot(dx, dz);
          if (L > 0.25) { const m = Math.min(1, L / 1.4); mx = (dx / L) * m; mz = (dz / L) * m; }
          sprint = o.sprint;
        }
        if (o.act === 'shoot') startShot(p, Math.random() < (p.chair ? 0 : 0.22));
        else if (o.act === 'pass') passTo(p, players.find((q) => q.team === p.team && q !== p));
        else if (o.act === 'steal') steal(p);
        else if (o.act === 'jump') jump(p);
      }
      /* shooting / dunking */
      if (p.state === 'shoot' && p.shot) {
        p.st += dt;
        const S = p.shot;
        if (S.kind === 'jump') {
          if (!S.jumped && p.st > 0.12) { p.vy = p.chair ? 4.6 : 8; S.jumped = true; p.jumped = true; }
          S.meter = p.st / METER_T;
          if (!p.human && p.st >= S.aiAt) releaseShot(p);
          else if (S.meter >= 1.08) releaseShot(p, true);
          mx *= 0.1; mz *= 0.1;
        } else if (S.kind === 'lay') {
          const hx = S.hx; const dx = hx - Math.sign(hx) * 0.8 - p.x, dz = -p.z, L = Math.hypot(dx, dz) || 1;
          mx = dx / L * 0.8; mz = dz / L * 0.8;
          if (p.st >= 0.32) releaseShot(p);
        }
      } else if (p.state === 'dunk' && p.shot) {
        p.st += dt;
        const hx = p.shot.hx; const tx = hx - Math.sign(hx) * 0.55, dx = tx - p.x, dz = -p.z, L = Math.hypot(dx, dz) || 1;
        p.vx = (dx / Math.max(0.15, 0.36 - p.st)) * 0.9; p.vz = (dz / Math.max(0.15, 0.36 - p.st)) * 0.9;
        mx = mz = 0;
        if (p.st >= 0.36) slam(p);
      }
      /* movement */
      const inAir = p.y > 0.01;
      const base = BASE_SPEED * p.sk.speed * (sprint && p.stam > 0.05 ? SPRINT_MUL : 1) * (p.hasBall ? 0.93 : 1);
      if (sprint && (mx || mz)) p.stam = Math.max(0, p.stam - dt * 0.32); else p.stam = Math.min(1, p.stam + dt * 0.2);
      if (p.state !== 'dunk') {
        const kAcc = inAir ? 1.5 : 9;
        p.vx += (mx * base - p.vx) * Math.min(1, dt * kAcc);
        p.vz += (mz * base - p.vz) * Math.min(1, dt * kAcc);
      }
      p.x += p.vx * dt; p.z += p.vz * dt;
      /* vertical */
      if (p.hang > 0) { p.hang -= dt; p.vy = 0; }
      else if (p.y > 0 || p.vy > 0) {
        p.vy -= C.PG * dt; p.y += p.vy * dt;
        if (p.y <= 0) { p.y = 0; p.vy = 0; p.jumped = false; if (p.state === 'jump' || p.state === 'air') p.state = 'run'; if (p.state === 'dunk') { p.state = 'run'; p.shot = null; } audio.sfx('squeak'); }
      }
      /* bounds */
      if (!(match.phase === 'inbound' && p === match.inbounder)) {
        p.x = clamp(p.x, -C.HX + 0.2, C.HX - 0.2); p.z = clamp(p.z, -C.HZ + 0.2, C.HZ - 0.2);
      }
    }
    /* separation */
    for (let i = 0; i < players.length; i++) for (let j = i + 1; j < players.length; j++) {
      const a = players[i], b = players[j];
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), m = a.chair || b.chair ? 1.25 : 0.95;
      if (d < m && d > 1e-4) { const push = (m - d) / 2, nx = dx / d, nz = dz / d; a.x -= nx * push; a.z -= nz * push; b.x += nx * push; b.z += nz * push; }
    }
  }

  function heldBallPos(p, dt) {
    const f = { x: Math.sin(p.face), z: Math.cos(p.face) }, r = { x: -f.z, z: f.x };
    if (p.state === 'shoot' || p.state === 'dunk') {
      const rise = Math.min(1, p.st / 0.25);
      ball.x = p.x + f.x * 0.3; ball.z = p.z + f.z * 0.3; ball.y = p.y + (p.chair ? -0.2 : 0) + 2.35 + rise * 0.75;
    } else if (match.phase === 'inbound' || p.y > 0.01 || match.phase === 'score' || match.phase === 'over' || match.phase === 'dead') {
      ball.x = p.x + f.x * 0.62; ball.z = p.z + f.z * 0.62; ball.y = p.y + (p.chair ? 1.55 : 1.75);
    } else {
      const sp = Math.hypot(p.vx, p.vz);
      const prev = Math.sin(p.drib);
      p.drib += dt * (7 + sp * 0.9);
      const s = Math.sin(p.drib);
      if (prev < 0 && s >= 0) audio.sfx('dribble', 0.5 + Math.min(0.5, sp / 12));
      const off = p.chair ? 0.75 : 0.5;
      ball.x = p.x + f.x * (0.55 + sp * 0.03) - r.x * off; ball.z = p.z + f.z * (0.55 + sp * 0.03) - r.z * off;
      ball.y = C.BALL_R + Math.abs(s) * (p.chair ? 0.8 : 1.15);
    }
    ball.vx = p.vx; ball.vz = p.vz; ball.vy = 0;
  }

  function stepBall(dt) {
    if (ball.mode === 'held' && ball.owner) { heldBallPos(ball.owner, dt); return; }
    if (ball.mode === 'tipwait' || ball.mode === 'tipball') return;
    ball.age += dt;
    const n = 4, h = dt / n;
    for (let i = 0; i < n; i++) {
      const py = ball.y;
      ball.vy -= C.G * h;
      ball.x += ball.vx * h; ball.y += ball.vy * h; ball.z += ball.vz * h;
      if (ball.y < C.BALL_R) {
        ball.y = C.BALL_R;
        if (ball.vy < -1) audio.sfx('bounce', Math.min(1, -ball.vy / 8));
        ball.vy = -ball.vy * 0.7; if (ball.vy < 0.5) ball.vy = 0;
        ball.vx *= 0.9; ball.vz *= 0.9;
        if (ball.mode === 'shot' || ball.mode === 'pass') toLoose();
      }
      if (ball.y <= C.BALL_R + 0.01) { ball.vx *= 1 - 1.4 * h; ball.vz *= 1 - 1.4 * h; }
      for (const s of [1, -1]) { rim(s * C.HOOP_X); board(s); }
      for (const s of [1, -1]) {
        const hx = s * C.HOOP_X;
        if (!ball.scored && py > C.RIM_Y && ball.y <= C.RIM_Y && ball.vy < 0 && Math.hypot(ball.x - hx, ball.z) < C.RIM_R - 0.05 && ball.mode !== 'held') scored(hx);
      }
      /* arena walls keep the ball close */
      const LX = C.HX + 5, LZ = C.HZ + 4;
      if (Math.abs(ball.x) > LX) { ball.x = Math.sign(ball.x) * LX; ball.vx *= -0.4; }
      if (Math.abs(ball.z) > LZ) { ball.z = Math.sign(ball.z) * LZ; ball.vz *= -0.4; }
    }
    if (ball.mode === 'shot' && ball.vy < 0 && ball.y < C.RIM_Y - 1.0) toLoose();
  }
  function toLoose() { if (ball.mode === 'shot' || ball.mode === 'pass') { if (ball.mode === 'shot' && !ball.scored) cap('rebound'); ball.mode = ball.scored ? 'dead' : 'loose'; ball.to = null; } }
  function rim(hx) {
    let dx = ball.x - hx, dz = ball.z; let hd = Math.hypot(dx, dz);
    if (hd > C.RIM_R + 0.6 || Math.abs(ball.y - C.RIM_Y) > 0.6) return;
    if (hd < 1e-4) { dx = 1; dz = 0; hd = 1; }
    const qx = hx + (dx / hd) * C.RIM_R, qz = (dz / hd) * C.RIM_R, qy = C.RIM_Y;
    let nx = ball.x - qx, ny = ball.y - qy, nz = ball.z - qz; const dd = Math.hypot(nx, ny, nz), m = C.BALL_R + C.RIM_T;
    if (dd >= m || dd < 1e-5) return;
    nx /= dd; ny /= dd; nz /= dd;
    ball.x = qx + nx * m; ball.y = qy + ny * m; ball.z = qz + nz * m;
    const vn = ball.vx * nx + ball.vy * ny + ball.vz * nz;
    if (vn < 0) {
      ball.vx -= 1.55 * vn * nx; ball.vy -= 1.55 * vn * ny; ball.vz -= 1.55 * vn * nz;
      ball.vx *= 0.9; ball.vz *= 0.9;
      if (vn < -1) { audio.sfx('rim'); nets.forEach((nn) => { if (nn.s === Math.sign(hx)) nn.k = Math.max(nn.k, 0.4); }); }
      ball.touchedRim = true;
      if (ball.mode === 'shot') ball.age = Math.max(ball.age, 0.6);
    }
  }
  function board(s) {
    const bx = s * C.BOARD_X;
    if (Math.abs(ball.z) > C.BOARD_HW + C.BALL_R * 0.5 || ball.y < C.BOARD_Y0 - C.BALL_R || ball.y > C.BOARD_Y1 + C.BALL_R) return;
    const front = bx - s * C.BALL_R;
    if (s > 0 ? ball.x > front && ball.x < bx + 0.3 : ball.x < front && ball.x > bx - 0.3) {
      ball.x = front;
      if (s * ball.vx > 0) { if (Math.abs(ball.vx) > 1) audio.sfx('board'); ball.vx = -ball.vx * 0.55; ball.touchedRim = true; }
    }
  }
  function scored(hx) {
    ball.scored = true;
    const team = hx > 0 ? 0 : 1;
    const ls = ball.lastShot;
    const pts = ls && ls.team === team ? ls.pts : 2;
    match.score[team] += pts;
    const s = Math.sign(hx);
    nets.forEach((n) => { if (n.s === s) n.k = 1.3; });
    if (!ball.touchedRim) audio.sfx('swish');
    audio.sfx(pts === 3 ? 'score3' : 'score2');
    const homeView = settings.mode !== 'local' ? team === 0 : true;
    audio.sfx(homeView || settings.mode === 'demo' ? 'cheer' : 'groan', pts === 3 ? 1 : 0.7);
    cheer = homeView ? 1 : 0.3;
    const shooter = ls && ls.shooter;
    const label = ls && ls.dunk ? 'SLAM DUNK' : pts === 3 ? '+3' : '+2';
    say(label, shooter && shooter.team === team ? shooter.name : teamName(team), 1.6);
    for (const p of players) if (p.team === team) p.celebrate = 1.4;
    if (match.phase === 'play' || match.phase === 'ot' || match.phase === 'inbound') {
      match.phase = 'score'; match.timer = 1.5; match.next = { team: 1 - team, x: hx + s * 2, z: 2.6 };
      if (match.ot) match.timer = 1.4;
    }
    ball.mode = 'dead';
    hudDirty = true;
  }

  function pickups() {
    if (ball.mode === 'held' || ball.mode === 'dead' || ball.mode === 'tipwait' || ball.mode === 'shot') return;
    if (!['play', 'ot', 'inbound'].includes(match.phase)) return;
    let best = null, bd = 9;
    for (const p of players) {
      if (p.noGrab > 0 || p.state === 'shoot' || p.state === 'dunk') continue;
      const d = dist2(p.x, p.z, ball.x, ball.z);
      const reach = p.y + (p.y > 0.05 ? 3.6 : p.chair ? 2.3 : 2.5);
      if (ball.mode === 'pass') {
        if (p === ball.to && d < 1.25 && ball.y < reach + 0.3) { best = p; bd = d; break; }
        if (p.team !== ball.lastTouch && d < 1.0 && ball.y < reach && !ball.icpt.has(p)) {
          ball.icpt.add(p);
          const ch = p.sk.steal * 0.5 + (p.icptBoost > 0 ? 0.3 : 0);
          if (Math.random() < ch) { best = p; bd = d; say('PICKED OFF', p.name, 1.1); audio.sfx('steal'); break; }
        }
        continue;
      }
      if (d < 0.95 && ball.y < reach && d < bd) { best = p; bd = d; }
    }
    if (best) { give(best); audio.sfx('catch'); }
  }

  function blocks() {
    if (ball.mode !== 'shot' || ball.age > 0.42 || ball.dunk) return;
    for (const q of players) {
      if (q.team === ball.lastTouch || q.y < 0.25 || ball.blocked.has(q)) continue;
      const d = dist2(q.x, q.z, ball.x, ball.z);
      if (d < 1.4 && ball.y < q.y + (q.chair ? 3.0 : 3.5)) {
        ball.blocked.add(q);
        const ch = q.human ? 0.72 : q.sk.block * 1.3;
        if (Math.random() < ch) {
          const ls = ball.lastShot && ball.lastShot.shooter;
          const ax = (ls ? ls.x : ball.x) - q.x, az = (ls ? ls.z : ball.z) - q.z, L = Math.hypot(ax, az) || 1;
          Object.assign(ball, { mode: 'loose', vx: (ax / L) * 5 + rnd(-2, 2), vy: 2.5, vz: (az / L) * 5 + rnd(-2, 2), lastTouch: q.team });
          ball.lastShot = null;
          say('BLOCKED', q.name, 1.1); audio.sfx('block'); cap('block'); cheer = Math.max(cheer, 0.8);
          return;
        }
      }
    }
  }

  function stepMatch(dt) {
    match.t += dt;
    if (match.msgT > 0) { match.msgT -= dt; if (match.msgT <= 0) { match.msg = null; hudDirty = true; } }
    if (captionT > 0) { captionT -= dt; if (captionT <= 0) { caption = null; hudDirty = true; } }
    const ph = match.phase;
    if (ph === 'tip') {
      match.timer -= dt;
      if (ball.mode === 'tipwait' && match.timer <= 0) { ball.mode = 'tipball'; ball.vy = 8.6; ball.vx = ball.vz = 0; }
      if (ball.mode === 'tipball') {
        ball.vy -= C.G * dt; ball.y += ball.vy * dt;
        let tapper = null;
        for (const p of players) if (p.tipper && p.y > 0.05 && p.y + 3.45 >= ball.y && dist2(p.x, p.z, ball.x, ball.z) < 1.2) { if (!tapper || p.y > tapper.y) tapper = p; }
        if (!tapper && ball.y < 2.4 && ball.vy < 0) tapper = players.filter((p) => p.tipper)[Math.random() < 0.5 ? 0 : 1];
        if (tapper) {
          const mate = players.find((q) => q.team === tapper.team && q !== tapper);
          const ax = mate.x - ball.x, az = mate.z - ball.z, L = Math.hypot(ax, az) || 1;
          Object.assign(ball, { mode: 'loose', vx: (ax / L) * 5.5, vy: 2.5, vz: (az / L) * 5.5, lastTouch: tapper.team });
          match.phase = 'play'; tapper.reachT = 0.3; audio.sfx('catch');
          for (const p of players) p.tipper = false;
          cap('move');
          hudDirty = true;
        }
      }
      return;
    }
    if (ph === 'score' || ph === 'dead') {
      match.timer -= dt;
      if (match.timer <= 0) {
        if (match.ot && ph === 'score') return finish();
        if (match.clock <= 0 && !match.ot) return endRegulation();
        const n = match.next; setupInbound(n.team, n.x, n.z);
      }
      return;
    }
    if (ph === 'over') {
      match.timer -= dt;
      if (settings.mode === 'demo' && match.timer <= 0) newMatch();
      return;
    }
    if (ph === 'inbound') {
      match.timer += dt;
      const inb = match.inbounder;
      if (inb && inb.human && match.timer > 3.2 && inb.hasBall) passTo(inb, players.find((q) => q.team === inb.team && q !== inb));
      return;
    }
    /* live play */
    const live = ball.mode !== 'dead';
    if (!match.ot && live && match.clock > 0) {
      match.clock -= dt;
      if (match.clock <= 0) { match.clock = 0; audio.sfx('buzzer'); match.buzzer = true; hudDirty = true; }
    }
    if (match.buzzer && !match.ot) {
      if (ball.mode !== 'shot') return endRegulation();
      return;
    }
    const someone = ball.owner || ball.mode === 'pass';
    if (someone && match.poss != null && ball.mode !== 'shot') {
      const before = match.shotClock;
      match.shotClock -= dt;
      if (before > 5 && match.shotClock <= 5) cap('clock');
      if (match.shotClock <= 0) {
        audio.sfx('whistle', 0.6); say('SHOT CLOCK', 'TURNOVER', 1.3);
        const t = 1 - match.poss;
        const h = ball.owner;
        match.phase = 'dead'; match.timer = 1.0;
        match.next = { team: t, x: h ? h.x : ball.x, z: (h ? Math.sign(h.z) || 1 : 1) * C.HZ };
        if (h) { h.hasBall = false; ball.owner = null; ball.mode = 'loose'; }
        return;
      }
    }
    /* out of bounds */
    if ((ball.mode === 'loose' || ball.mode === 'pass') && ball.y < 0.6 && (Math.abs(ball.x) > C.HX || Math.abs(ball.z) > C.HZ)) {
      audio.sfx('whistle', 0.5); say('OUT', teamName(1 - ball.lastTouch) + ' BALL', 1.2);
      match.phase = 'dead'; match.timer = 1.0;
      match.next = { team: 1 - ball.lastTouch, x: ball.x, z: ball.z };
      ball.mode = 'dead';
      hudDirty = true;
    }
  }
  function endRegulation() {
    match.buzzer = false;
    if (match.score[0] === match.score[1]) {
      match.ot = true;
      say('GOLDEN BASKET', 'NEXT SCORE WINS', 2.2);
      const t = Math.random() < 0.5 ? 0 : 1;
      match.phase = 'dead'; match.timer = 1.6; match.next = { team: t, x: 0, z: C.HZ };
      hudDirty = true;
      return;
    }
    finish();
  }
  function finish() {
    match.phase = 'over'; match.timer = 5; ball.mode = 'dead';
    const [h, a] = match.score;
    const mode = settings.mode;
    for (const p of players) { p.celebrate = 0; p.vx = p.vz = 0; }
    const winner = h > a ? 0 : 1;
    for (const p of players) if (p.team === winner) p.celebrate = 99;
    let r = { mode, score: [h, a], teams: [teamName(0), teamName(1)], winner, title: '', gold: 0, xp: 0, stars: 0, best: 0, newBest: false };
    if (mode === 'cpu') {
      const rw = rewards(settings.diff, h, a);
      const best = store.get('best', 0) || 0;
      const nb = h > best; if (nb) store.set('best', h);
      if (rw.won) { store.set('wins', (store.get('wins', 0) || 0) + 1); const bs = store.get('stars.' + settings.diff, 0) || 0; if (rw.stars > bs) store.set('stars.' + settings.diff, rw.stars); }
      store.gold(rw.gold);
      store.set('xp', (store.get('xp', 0) || 0) + rw.xp);
      Object.assign(r, rw, { best: Math.max(best, h), newBest: nb, title: rw.won ? 'YOU WIN' : 'YOU LOSE' });
      audio.sfx(rw.won ? 'win' : 'lose');
    } else if (mode === 'local') { r.title = (winner === 0 ? 'P1' : 'P2') + ' WINS'; audio.sfx('win'); }
    else { r.title = teamName(winner) + ' WIN'; }
    result = r;
    say('FINAL', h + ' - ' + a, 2);
    audio.sfx('buzzer');
    hudDirty = true;
  }

  /* ---------- camera */
  const v3 = new THREE.Vector3(), pts = [];
  for (let i = 0; i < 16; i++) pts.push(new THREE.Vector3());
  function gatherPoints() {
    let n = 0;
    const add = (x, y, z) => { pts[n++].set(x, y, z); };
    for (const p of players) { add(p.x, 0, p.z); add(p.x, 2.9 + p.y, p.z); }
    add(ball.x, Math.max(ball.y, 0), ball.z);
    const poss = match ? match.poss : null;
    if (match && match.phase !== 'tip' && poss != null) { const hx = attackX(poss); if (Math.abs(ball.x - hx) < 20) { add(hx + Math.sign(hx) * 0.8, C.RIM_Y + 1.2, 0); add(hx, 0, 0); } }
    add(ball.x - 3, 0, ball.z); add(ball.x + 3, 0, ball.z);
    return n;
  }
  function camDir(yaw, pitch, out) { return out.set(Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)); }
  const D = new THREE.Vector3(), R3 = new THREE.Vector3(), U3 = new THREE.Vector3();
  function solveGoal(iters) {
    const n = gatherPoints();
    let sl = safe.left, sr = safe.right, st = safe.top, sb = safe.bottom;
    if (W - sl - sr < W * 0.35) { sl = sr = 0; }
    if (H - st - sb < H * 0.3) { sb = 0; }
    const fw = Math.max(40, W - sl - sr), fh = Math.max(40, H - st - sb);
    const portrait = fw / fh < 0.9;
    const fovBase = world ? world.camera.fov : portrait ? 56 : 40;
    camera.fov = fovBase; scratch.fov = fovBase; scratch.aspect = W / H; scratch.updateProjectionMatrix();
    if (portrait && settings.mode !== 'local' && match && match.poss != null) cam.gyaw = match.poss === 0 ? Math.PI / 2 : -Math.PI / 2;
    else if (!portrait || settings.mode === 'local') cam.gyaw = 0;
    cam.pitch = portrait ? 0.7 : 0.6;
    camDir(cam.gyaw, cam.pitch, D);
    if (cam.gT.lengthSq() === 0) cam.gT.set(0, 1, 0);
    for (let k = 0; k < iters; k++) {
      scratch.position.copy(cam.gT).addScaledVector(D, -cam.gd);
      scratch.lookAt(cam.gT); scratch.updateMatrixWorld();
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (let i = 0; i < n; i++) {
        v3.copy(pts[i]).project(scratch);
        if (v3.z > 1) { x0 = -1e9; break; }
        const sx = (v3.x + 1) / 2 * W, sy = (1 - v3.y) / 2 * H;
        x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
      }
      if (x0 < -1e8) { cam.gd *= 1.3; continue; }
      const s = Math.max((x1 - x0) / (fw * 0.84), (y1 - y0) / (fh * 0.84));
      const ex = (sl + fw / 2) - (x0 + x1) / 2, ey = (st + fh / 2) - (y0 + y1) / 2;
      const wpp = 2 * cam.gd * Math.tan((fovBase * Math.PI) / 360) / H;
      R3.setFromMatrixColumn(scratch.matrixWorld, 0); U3.setFromMatrixColumn(scratch.matrixWorld, 1);
      cam.gT.addScaledVector(R3, -ex * wpp * 0.9).addScaledVector(U3, ey * wpp * 0.9);
      cam.gd = clamp(cam.gd * Math.pow(clamp(s, 0.6, 1.6), 0.85), portrait ? 14 : 12, 95);
    }
    cam.gT.y = clamp(cam.gT.y, -4, 8);
  }
  function applyCam(k) {
    cam.T.lerp(cam.gT, k); cam.d += (cam.gd - cam.d) * k; cam.yaw = angLerp(cam.yaw, cam.gyaw, Math.min(1, k * 0.8));
    camDir(cam.yaw, cam.pitch, D);
    camera.position.copy(cam.T).addScaledVector(D, -cam.d);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    camera.lookAt(cam.T); camera.updateMatrixWorld();
    if (world) {
      scene.updateWorldMatrix(true, false);
      wcam.position.copy(camera.position); scene.localToWorld(wcam.position);
      const q = new THREE.Quaternion(); scene.getWorldQuaternion(q); wcam.quaternion.copy(q).multiply(camera.quaternion);
      wcam.fov = camera.fov; wcam.aspect = camera.aspect; wcam.updateProjectionMatrix(); wcam.updateMatrixWorld();
    }
  }
  function snapCam() { measure(); solveGoal(40); cam.yaw = cam.gyaw; applyCam(1); }

  /* ---------- visuals */
  function syncVisuals(dt) {
    for (const p of players) {
      let want = p.face;
      const holder = ball.owner;
      if (p.state === 'shoot' || p.state === 'dunk') want = Math.atan2(attackX(p.team) - p.x, -p.z);
      else if (match.phase === 'inbound' && p === match.inbounder) { /* keep */ }
      else if (holder && holder.team !== p.team && match.phase !== 'over') want = Math.atan2(holder.x - p.x, holder.z - p.z);
      else if (!holder && ball.mode !== 'dead' && match.phase === 'play' && Math.hypot(p.vx, p.vz) < 1) want = Math.atan2(ball.x - p.x, ball.z - p.z);
      else if (Math.hypot(p.vx, p.vz) > 0.6) want = Math.atan2(p.vx, p.vz);
      p.face = angLerp(p.face, want, Math.min(1, dt * 10));
      const hover = p.chair ? 0.06 + Math.sin(time * 3 + p.id) * 0.04 : 0;
      p.mesh.position.set(p.x, p.y + hover, p.z); p.mesh.rotation.y = p.face;
      animFox(p, dt);
      p.shadow.position.set(p.x, 0.025, p.z); p.shadow.scale.setScalar(0.75 / (1 + p.y * 0.25));
    }
    ballMesh.position.set(ball.x, ball.y, ball.z);
    const bs = Math.hypot(ball.vx, ball.vz);
    if (bs > 0.1) { ballMesh.rotation.x += ball.vz * dt / C.BALL_R * 0.5; ballMesh.rotation.z -= ball.vx * dt / C.BALL_R * 0.5; }
    ballShadow.position.set(ball.x, 0.026, ball.z); ballShadow.scale.setScalar(0.22 / (1 + ball.y * 0.12));
    for (const n of nets) { n.k = Math.max(0, n.k - dt * 2.4); n.net.scale.set(1 - n.k * 0.15, 1 + n.k * 0.35 * Math.sin(time * 30), 1 - n.k * 0.15); }
    for (const who of ['p1', 'p2']) {
      const p = humanOf(who), mk = markers[who];
      mk.g.visible = !!p && match.phase !== 'over';
      if (p) { mk.g.position.set(p.x, 0, p.z); mk.cone.position.y = 3.35 + p.y + Math.sin(time * 5) * 0.08 + (p.chair ? -0.2 : 0); }
    }
    /* meter */
    const sh = players.find((p) => p.state === 'shoot' && p.shot && p.shot.kind === 'jump' && (p.human || settings.mode === 'demo'));
    meter.visible = !!sh;
    if (sh) {
      const S = sh.shot, m = clamp(S.meter, 0, 1);
      R3.setFromMatrixColumn(camera.matrixWorld, 0);
      v3.set(sh.x, sh.y + 1.5, sh.z).project(camera);
      const sc = clamp(cam.d / 16, 1.1, 3);
      const side = v3.x > 0.45 ? -1 : 1;
      meter.position.set(sh.x, sh.y + 1.0, sh.z).addScaledVector(R3, side * (0.9 + 0.35 * sc));
      meter.quaternion.copy(camera.quaternion);
      meter.scale.setScalar(sc);
      mZone.position.y = 0.0 + S.zone.a * 1.5; mZone.scale.y = (S.zone.b - S.zone.a) * 1.5;
      mFill.scale.y = Math.max(0.001, m * 1.5);
      const inZ = S.meter >= S.zone.a && S.meter <= S.zone.b;
      mFill.material.color.setHex(inZ ? 0xffffff : S.meter > S.zone.b ? 0xec3013 : 0xf4f1ea);
    }
    /* crowd */
    cheer = Math.max(0, cheer - dt * 0.35);
    audio.crowd(cheer);
    if (crowdMesh) {
      const seats = crowdMesh.userData.seats, ph = crowdMesh.userData.ph, m4 = new THREE.Matrix4();
      for (let i = 0; i < seats.length; i++) { const s = seats[i]; m4.makeTranslation(s[0], s[1] + Math.max(0, Math.sin(time * (4 + cheer * 6) + ph[i])) * (0.04 + cheer * 0.35), s[2]); crowdMesh.setMatrixAt(i, m4); }
      crowdMesh.instanceMatrix.needsUpdate = true;
    }
  }

  /* ---------- HUD */
  function labelsFor(p) {
    const holder = ball.owner;
    const def = holder && holder.team !== p.team;
    return {
      a: match.phase === 'tip' ? 'JUMP' : p.hasBall ? 'SHOOT' : def ? 'BLOCK' : 'JUMP',
      b: p.hasBall ? 'PASS' : def ? 'STEAL' : 'PASS',
      c: 'SPRINT',
      d: p.hasBall ? null : 'SWITCH',
    };
  }
  function hintFor(who) {
    const p = humanOf(who); if (!p) return null;
    const ph = match.phase;
    if (!['tip', 'play', 'ot', 'inbound'].includes(ph) || paused) return null;
    if (time - inp[who].last < 3) return null;
    if (ph === 'tip') return p.tipper ? { target: 'a', text: 'Tap JUMP when the ball reaches the top.' } : null;
    if (ph === 'inbound' && p.hasBall) return { target: 'b', text: 'Tap PASS to throw the ball in.' };
    if (p.hasBall) {
      const d = hoopDist(p);
      if (d > 9.5) return { target: 'stick', text: 'Drag to run at the far hoop.' };
      return { target: 'a', text: 'Hold SHOOT, let go on the yellow band.' };
    }
    if (ball.owner && ball.owner.team !== p.team) return { target: 'b', text: 'Get close to the dribbler and tap STEAL.' };
    return { target: 'stick', text: 'Run to the loose ball to grab it.' };
  }
  function buildHud() {
    const humans = [];
    for (const who of ['p1', 'p2']) {
      const p = humanOf(who);
      if (p) humans.push({ who, team: p.team, name: p.name, ...labelsFor(p), stam: Math.round(p.stam * 100) / 100, hasBall: p.hasBall, hint: hintFor(who) });
    }
    const D_ = DIFF[settings.diff];
    return {
      game: KEY, world: !!world, touch,
      phase: match ? match.phase : 'none', paused, left,
      mode: settings.mode, diff: settings.diff, opponent: D_.who, opponentTitle: D_.title,
      len: settings.len, sound: audio.sound, music: audio.music,
      score: match ? match.score.slice() : [0, 0],
      teams: [{ name: teamName(0), color: teamCss(0) }, { name: teamName(1), color: teamCss(1) }],
      clock: match ? (match.ot ? 'OT' : fmtClock(match.clock)) : '',
      shotClock: match ? Math.max(0, Math.ceil(match.shotClock)) : 14,
      shotLow: match ? match.shotClock <= 5 && (match.phase === 'play' || match.phase === 'ot') : false,
      poss: match ? match.poss : null,
      ot: match ? match.ot : false,
      msg: match && match.msg ? { ...match.msg, id: match.msgId } : null,
      caption,
      humans,
      result,
      best: store.get('best', 0) || 0,
      stars: { easy: store.get('stars.easy', 0) || 0, medium: store.get('stars.medium', 0) || 0, hard: store.get('stars.hard', 0) || 0 },
    };
  }
  let lastHud = null;
  function emit() { lastHud = buildHud(); try { onState(lastHud); } catch (e) { console.error(e); } }

  /* ---------- loop */
  function frame(now) {
    if (destroyed) return;
    raf = requestAnimationFrame(frame);
    let dt = (now - last) / 1000; last = now;
    if (!(dt > 0)) dt = 0.016; dt = Math.min(dt, 0.05);
    measure();
    /* keys without keyup from the host expire */
    if (!sawKeyUp) for (const who of ['p1', 'p2']) { const I = inp[who]; if (I.keys.size && time - I.keyT > 0.6) I.keys.clear(); if (I.c && time - I.keyT > 0.6 && !touch) I.c = false; }
    if (match && !paused && !left) {
      time += dt;
      const sub = dt > 0.025 ? 2 : 1, h = dt / sub;
      for (let i = 0; i < sub; i++) { stepPlayers(h); stepBall(h); blocks(); pickups(); stepMatch(h); }
    } else time += 0;
    if (match) syncVisuals(paused ? 0 : dt);
    solveGoal(5);
    applyCam(1 - Math.exp(-dt * 3.2));
    if (!world) renderer.render(scene, camera);
    hudT += dt;
    if (hudDirty || hudT > 0.1) { hudT = 0; hudDirty = false; emit(); }
  }

  newMatch();
  raf = requestAnimationFrame(frame);

  /* ---------- API */
  const api = {
    hud() { return lastHud || buildHud(); },
    setSafe(s = {}) { safe = { top: +s.top || 0, bottom: +s.bottom || 0, left: +s.left || 0, right: +s.right || 0 }; },
    start(mode = 'cpu') { if (!['cpu', 'local', 'demo'].includes(mode)) mode = 'cpu'; settings.mode = mode; newMatch(); },
    restart() { newMatch(); },
    key,
    get camera() { return world ? wcam : camera; },
    snapCam,
    stick,
    btn(who, name, down) { act(who || 'p1', name, !!down); },
    pause(b) { paused = b == null ? !paused : !!b; for (const I of Object.values(inp)) { I.a = I.b = I.c = I.d = false; I.sx = I.sy = 0; I.keys.clear(); I.ev.length = 0; } hudDirty = true; },
    leave() { left = true; paused = true; hudDirty = true; },
    back() { left = false; paused = false; hudDirty = true; },
    setDiff(k) { if (!DIFF[k]) return; settings.diff = k; store.set('diff', k); if (settings.mode !== 'local') newMatch(); },
    setLength(m) { if (![2, 3, 5].includes(+m)) return; settings.len = +m; store.set('len', +m); newMatch(); },
    setSound(b) { audio.setSound(b); store.set('sound', !!b); hudDirty = true; },
    setMusic(b) { audio.resume(); audio.setMusic(b); if (!world) store.set('music', !!b); hudDirty = true; },
    unlockAudio() { audio.resume(); },
    destroy() {
      if (destroyed) return; destroyed = true;
      cancelAnimationFrame(raf);
      if (world) window.removeEventListener('pointerdown', onPointer, true);
      else {
        renderer.domElement.removeEventListener('pointerdown', onPointer);
        window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey);
        window.removeEventListener('pointerdown', unlock);
      }
      if (ro) ro.disconnect();
      audio.close();
      if (world) world.parent.remove(scene);
      K.dispose();
      if (!world) { renderer.dispose(); renderer.domElement.remove(); }
    },
    /* test hooks */
    _debug: () => ({ players, ball, match, cam, settings }),
    _sim(sec, step = 1 / 60) { for (let t = 0; t < sec; t += step) { time += step; stepPlayers(step); stepBall(step); blocks(); pickups(); stepMatch(step); if (match.phase === 'over' && settings.mode !== 'demo') break; } emit(); return lastHud; },
  };
  emit();
  try { if (/[?&]debug\b/.test(location.search)) window.__bbApi = api; } catch (e) { /* */ }
  return api;
}
export const create = createBasketball;
