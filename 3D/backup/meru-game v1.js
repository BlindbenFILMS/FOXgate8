import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { rnd, rr, pick, clamp, smooth, lerp, damp, vnoise, fbm, paletteAt, makeGradient, glowTexture, dotTexture, Ambience } from './village-game.js';

// ---------- the map, in the 2D art's own pixels (2880 x 1620) ----------
const MW = 80, S = MW / 2880, MH = 1620 * S;            // 80 m x 45 m
const AX = a => (a - 1440) * S, AZ = a => (a - 810) * S;
const SRC_Y = 1620 / 2880;                               // walk rows + patrols are in a 2880-square space
const toArt = (X, Z) => [X / S + 1440, Z / S + 810];

const BUILDINGS = [
  { key: 'casino', label: 'Casino', x0: 370, x1: 910, y0: 180, y1: 640, face: 'S', door: 725 },
  { key: 'tavern', label: 'Tavern', x0: 1990, x1: 2520, y0: 180, y1: 640, face: 'S', door: 2150 },
  { key: 'itemshop', label: 'Item Shop', x0: 560, x1: 940, y0: 1190, y1: 1520, face: 'N', door: 761 },
  { key: 'bowling', label: 'Meru Lanes', x0: 1620, x1: 1950, y0: 1200, y1: 1500, face: 'N', door: 1786 },
  { key: 'armory', label: 'Armory', x0: 2100, x1: 2560, y0: 1190, y1: 1500, face: 'N', door: 2188 },
  { key: 'fortune', label: 'Fortune Teller', cx: 1120, cy: 1360, r: 140, face: 'N', door: 1121 },
];
const EXITS = [
  { label: 'Castle Path', ax: 1440, ay: 40 }, { label: 'South Gate', ax: 1440, ay: 1580 },
  { label: 'Ruins Path', ax: 40, ay: 810 }, { label: 'Arena Path', ax: 2840, ay: 810 },
];
const FOXES = [
  { key: 'hope', name: 'Hope', role: 'Best friend', torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', glasses: true, cane: true, path: [[1480, 2560], [1480, 390]], speed: 1.5 },
  { key: 'noble', name: 'Noble', role: 'The protector', torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', chair: true, path: [[1400, 390], [1400, 2560]], speed: 1.1 },
  { key: 'ulric', name: 'Ulric', role: 'Ur\'s advisor', torso: ['#fdba74', '#ea580c', '#9a3412'], crest: 'U', path: [[400, 1516], [2600, 1516]], speed: 1.0 },
  { key: 'grand', name: 'Grand', role: 'Gaya\'s commander', torso: ['#a78bfa', '#7c3aed', '#4c1d95'], crest: 'G', path: [[300, 1308], [2500, 1308]], speed: 1.4 },
  { key: 'james', name: 'Jamos', role: 'Jidda\'s general', torso: ['#60a5fa', '#1e3a8a', '#172554'], crest: 'J', path: [[350, 1724], [2550, 1724]], speed: 1.2 },
  { key: 'lucius', name: 'Lucius', role: 'Luxor\'s second', torso: ['#f87171', '#b91c1c', '#7f1d1d'], crest: 'L', stand: [1036, 1140] },
  { key: 'jon', name: 'Job', role: 'Jidda', torso: ['#60a5fa', '#1e3a8a', '#172554'], crest: 'J', stand: [2572, 1412] },
];
const DIALOGUE = {
  hope: [{who:'player',text:'Are you enjoying the gala at all, Hope?'}, {who:'npc',text:'Enjoying it? I am sweating through my dress uniform! Look at the security. Fighter-class ships blot out the Sphere.'},{who:'npc',text:'Keep your eyes open.'}, {who:'player',text:'Have you heard the rumors about a Casino on Meru?'}, {who:'npc',text:'Shh! Lower your voice! The cargo crews whisper about it, yes. Fortunes won and lost below, while the King toasts.'},{who:'npc',text:'Do not go looking tonight.'}],
  noble: [{who:'player',text:'How does the perimeter look, Noble?'}, {who:'npc',text:'Tense, Ruler. Luxor\u0027s guards track us with heavy scanners. My shielding arrays will absorb any kinetic fire.'},{who:'npc',text:'Stay behind me.'}, {who:'player',text:'Do you see any signs of royal GODrock weapons on the guards?'}, {who:'npc',text:'Affirmative. Their sidearms carry refined GODrock gems. The energy signatures are astronomical. Do not provoke them.'}],
  lucius: [{who:'player',text:'Is Luxor preparing for an invasion?'}, {who:'npc',text:'Invasion is a crude word, young Steward. We prefer strategic realignment.'},{who:'npc',text:'Leave your borders unguarded and our Gunners move in.'}, {who:'player',text:'Why does Luxor follow Meru so closely?'}, {who:'npc',text:'King Might woke the eight gates we travel by. He holds the secrets of life and technology.'},{who:'npc',text:'Aligning with Meru is not submission. It is sense.'}],
  ulric: [{who:'player',text:'Is it true that Ur is running rogue border raids?'}, {who:'npc',text:'A logical commander tests his neighbours. Weak borders invite the strike. That is your failing, not our malice.'},{who:'npc',text:'Keep your fleet sharp, young Steward.'}, {who:'player',text:'Do you believe Zion caused your planet\'s disaster on purpose?'}, {who:'npc',text:'The data points at their research facility. Sabotage or incompetence. The graves are the same size. They pay either way.'}],
  grand: [{who:'player',text:'What did you think of the Player\'s father, Grand?'}, {who:'npc',text:'He was a good man, and a brilliant Steward. Far too trusting. This galaxy eats fair-minded foxes alive.'},{who:'npc',text:'Do not make his mistakes, child.'}, {who:'player',text:'Do you think King Might can keep the peace much longer?'}, {who:'npc',text:'Might is a brilliant old fool, rotting from the inside. He built a beautiful cage, that Sphere of his.'},{who:'npc',text:'Cages shatter when the beast inside outgrows them. Watch your back.'}],
  james: [{who:'player',text:'How do you coordinate defense with Nebo, General Jamos?'}, {who:'npc',text:'Nash and I hold a strict cross-border defence pact. We stay out of the centre hub politics.'},{who:'npc',text:'Our joint Stations wall off the bottom of the map.'}, {who:'player',text:'Are you related to King Might\'s bloodline?'}, {who:'npc',text:'No. I am Jest\u0027s half-brother, outside the royal line. I do not care about GODrock or titles.'},{who:'npc',text:'I care about the soldiers under my command.'}],
  jon: [{who:'player',text:'You seem very dedicated to your people, Job.'}, {who:'npc',text:'Family and our citizens are everything to me. If Meru or Luxor burn the galaxy... I will fly our Colony Ship into the dark.'},{who:'npc',text:'Or die making sure our people get out.'}, {who:'player',text:'Do you hope to find the mythical 10th Gate?'}, {who:'npc',text:'It is my dream! If Earth exists, and our spirits can dance there... away from all this warfare...'},{who:'npc',text:'...then finding it is the highest calling there is.'}],
};

// paved / built areas in art px — kept clear of trees
const PAVED = [[330, 2550, 430, 1190], [430, 2550, 1190, 1470], [1290, 1590, -3000, 430], [1290, 1590, 1190, 5000], [-5000, 330, 660, 960], [2550, 8000, 660, 960]];
function inPaved(ax, ay, m = 0) {
  for (const [x0, x1, y0, y1] of PAVED) if (ax > x0 - m && ax < x1 + m && ay > y0 - m && ay < y1 + m) return true;
  for (const b of BUILDINGS) { if (b.r) { if (Math.hypot(ax - b.cx, ay - b.cy) < b.r + m) return true; } else if (ax > b.x0 - m && ax < b.x1 + m && ay > b.y0 - m && ay < b.y1 + m) return true; }
  return false;
}
const outsideDist = (X, Z) => Math.hypot(Math.max(0, Math.abs(X) - MW / 2), Math.max(0, Math.abs(Z) - MH / 2));
function heightAt(X, Z) {
  const d = outsideDist(X, Z); if (d <= 0) return 0;
  let h = smooth(1, 26, d) * (2 + 14 * fbm(X * 0.03 + 4, Z * 0.03 + 9)) + smooth(30, 90, d) * 22 * fbm(X * 0.015 + 2, Z * 0.015);
  return h * smooth(4.6, 11, Math.min(Math.abs(X), Math.abs(Z)));
}

// ---------- canvas textures ----------
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
const FONT = '"Archivo", "Arial Black", Arial, sans-serif';
function emblemTex() {
  return canvasTex(256, 256, (g) => {
    const c = 128; const ring = (r, col) => { g.fillStyle = col; g.beginPath(); g.arc(c, c, r, 0, 7); g.fill(); };
    ring(126, '#c42d3c'); ring(100, '#e6b45a'); ring(92, '#151b3d');
    g.fillStyle = '#ffffff'; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; g.beginPath(); g.arc(c + Math.cos(a) * 113, c + Math.sin(a) * 113, 4, 0, 7); g.fill(); }
    g.font = `900 120px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 8; g.strokeStyle = '#7dd3fc'; g.strokeText('M', c, c + 8); g.fillText('M', c, c + 8);
  });
}
function crestTex(letter, ring, bg = '#070a13', fg = '#ffffff') {
  return canvasTex(128, 128, (g) => {
    g.fillStyle = ring; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = bg; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill();
    g.fillStyle = fg; g.font = `900 70px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(letter, 64, 68);
  });
}
function signTex(text, glyph, accent = '#d9a64a', glow = '#f6e7c8') {
  return canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = '#141a33'; g.fillRect(0, 0, w, h); g.strokeStyle = accent; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = glow; g.font = `900 ${text.length > 8 ? 52 : 66}px ${FONT}`; g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillText(text, 34, h / 2 + 3);
    const tw = g.measureText(text).width; if (glyph) glyph(g, 34 + tw + 24, h / 2, accent);
  });
}
function bannerTex() {
  return canvasTex(128, 256, (g) => {
    g.fillStyle = '#1b2350'; g.beginPath(); g.moveTo(8, 0); g.lineTo(120, 0); g.lineTo(120, 220); g.lineTo(64, 252); g.lineTo(8, 220); g.closePath(); g.fill();
    g.strokeStyle = '#e6b45a'; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(64, 120, 40, 0, 7); g.fill(); g.fillStyle = '#151b3d'; g.beginPath(); g.arc(64, 120, 32, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.font = `900 40px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', 64, 123);
  });
}
const cobbleTex = r => canvasTex(256, 256, (g) => {
  g.fillStyle = '#5c608c'; g.fillRect(0, 0, 256, 256);
  const cols = ['#878bb6', '#9296bd', '#8b8fb9', '#9a9ec5', '#7f84ad'];
  for (let row = 0; row < 8; row++) for (let k = -1; k < 5; k++) { const x = k * 64 + (row % 2 ? 32 : 0) + 3, y = row * 32 + 3; g.fillStyle = cols[(row * 7 + k * 3 + 10) % cols.length]; g.beginPath(); g.roundRect(x, y, 58, 26, 9); g.fill(); }
}, r);
const plazaTex = r => canvasTex(256, 256, (g) => {
  g.fillStyle = '#cfcbe0'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#c1bcd6'; g.fillRect(128, 0, 128, 128); g.fillRect(0, 128, 128, 128);
  g.strokeStyle = 'rgba(80,76,120,0.18)'; g.lineWidth = 2; for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
}, r);
const asphaltTex = r => canvasTex(128, 128, (g) => {
  g.fillStyle = '#4b4f6e'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 260; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'; g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2); }
}, r);

// ---------- main ----------
export async function createGame({ container, minimap, options = {}, onState = () => {} }) {
  const opts = { timeScale: 2, startHour: 19.5, outlines: true, quality: 'high', followCam: true, ...options };
  const WALK = await (await fetch(new URL('./meru-town-walk.json', import.meta.url))).json();
  const mapImg = new Image(); mapImg.src = new URL('./meru-town-map.png', import.meta.url).href;
  try { await document.fonts.load(`900 40px Archivo`); } catch (e) {}

  function walkableAt(X, Z) {
    const [ax, ay] = toArt(X, Z), sy = ay / SRC_Y;
    if (ax < 0 || ax > 2879 || sy < 0 || sy > 2879) return false;
    let lo = 0, hi = WALK.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (WALK[m].y <= sy) lo = m; else hi = m - 1; }
    for (const [a, b] of WALK[lo].s) if (ax >= a && ax <= b) return true; return false;
  }

  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, opts.quality === 'low' ? 1 : 2)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = opts.quality !== 'low'; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 1200);
  scene.fog = new THREE.FogExp2(0xcfe4f0, 0.006);
  const grad = makeGradient(), glowTex = glowTexture(), dotTex = dotTexture();
  const cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide }); outlineMat.visible = !!opts.outlines;
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
  const glowMats = []; // {mat, k}
  const glowing = (color, map, k = 1.6) => { const m = new THREE.MeshToonMaterial({ color: map ? 0xffffff : color, map, gradientMap: grad, emissive: new THREE.Color(map ? 0xffffff : color), emissiveMap: map || null, emissiveIntensity: 0 }); glowMats.push({ m, k }); return m; };
  const flames = [], glows = [], pointLights = [];
  function glowSprite(x, y, z, color, size, parent) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 })); s.position.set(x, y, z); s.scale.setScalar(size); (parent || scene).add(s); glows.push(s); return s; }

  // lights + sky
  const hemi = new THREE.HemisphereLight(0xd6ecff, 0x6f9a52, 1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 260 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bottom: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, moonDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunVis: { value: 1 }, moonVis: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vDir; uniform vec3 top, hor, bottom, sunDir, moonDir, sunCol; uniform float sunVis, moonVis;
      void main(){ vec3 d = normalize(vDir); float y = d.y; vec3 col = mix(hor, top, pow(smoothstep(0.0, 1.0, max(y, 0.0)), 0.55)); col = mix(col, bottom, smoothstep(0.0, -0.2, y));
        float sd = max(dot(d, sunDir), 0.0); col += sunCol * (pow(sd, 48.0) * 0.55 + pow(sd, 6.0) * 0.22) * sunVis; col = mix(col, vec3(1.0, 0.97, 0.88), smoothstep(0.9990, 0.9994, sd) * sunVis);
        float md = max(dot(d, moonDir), 0.0); col = mix(col, vec3(0.93, 0.95, 1.0), smoothstep(0.9993, 0.9996, md) * moonVis); col += vec3(0.45, 0.55, 1.0) * pow(md, 120.0) * 0.35 * moonVis;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }` }));
  scene.add(sky);
  const sp = []; for (let i = 0; i < 1000; i++) { const u = rnd() * 6.283, v = Math.acos(rr(0.05, 1)); sp.push(Math.sin(v) * Math.cos(u) * 450, Math.cos(v) * 450, Math.sin(v) * Math.sin(u) * 450); }
  const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const stars = new THREE.Points(starGeo, starMat); scene.add(stars);

  // terrain
  const tg = new THREE.PlaneGeometry(340, 280, 220, 180); tg.rotateX(-Math.PI / 2);
  const pos = tg.attributes.position, cols = new Float32Array(pos.count * 3), tc = new THREE.Color();
  const G1 = new THREE.Color('#6aa64e'), G2 = new THREE.Color('#4f8d45'), G3 = new THREE.Color('#3b7343'), RK = new THREE.Color('#a9a390');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = heightAt(x, z); pos.setY(i, h);
    tc.copy(G1).lerp(G2, smooth(0.35, 0.65, fbm(x * 0.07 + 9, z * 0.07))).lerp(G3, smooth(4, 14, h)).lerp(RK, smooth(18, 30, h));
    cols.set([tc.r, tc.g, tc.b], i * 3);
  }
  tg.setAttribute('color', new THREE.BufferAttribute(cols, 3)); tg.computeVertexNormals();
  const terrain = new THREE.Mesh(tg, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad })); terrain.receiveShadow = terrain.castShadow = true; scene.add(terrain);

  // paving
  const slab = (x0, x1, y0, y1, mat, top, rep) => { const w = (x1 - x0) * S, d = (y1 - y0) * S; const m = new THREE.Mesh(BOX(w, top, d), mat); m.position.set(AX((x0 + x1) / 2), top / 2, AZ((y0 + y1) / 2)); m.receiveShadow = true; scene.add(m); return m; };
  const plazaM = new THREE.MeshToonMaterial({ map: plazaTex([1, 1]), gradientMap: grad });
  plazaM.map.repeat.set(2220 / 360, 760 / 360); slab(330, 2550, 430, 1190, plazaM, 0.06);
  const plazaM2 = plazaM.clone(); plazaM2.map = plazaM.map.clone(); plazaM2.map.repeat.set(2120 / 360, 280 / 360); plazaM2.map.needsUpdate = true; slab(430, 2550, 1190, 1470, plazaM2, 0.06);
  const asph = (x0, x1, y0, y1) => { const m = new THREE.MeshToonMaterial({ map: asphaltTex([(x1 - x0) / 240, (y1 - y0) / 240]), gradientMap: grad }); return slab(x0, x1, y0, y1, m, 0.09); };
  asph(364, 2516, 750, 870); asph(1380, 1500, 460, 1160);
  const cob = (x0, x1, y0, y1) => { const m = new THREE.MeshToonMaterial({ map: cobbleTex([(x1 - x0) / 150, (y1 - y0) / 150]), gradientMap: grad }); return slab(x0, x1, y0, y1, m, 0.07); };
  cob(1290, 1590, -1100, 430); cob(1290, 1590, 1190, 2720); cob(-1100, 330, 660, 960); cob(2550, 3980, 660, 960);
  const laneMark = toon('#e7e3f2');
  for (const [ax, ay] of [[436, 810], [1060, 810], [1820, 810], [2440, 810], [1440, 540], [1440, 1100]]) { const d = new THREE.Mesh(BOX(0.5, 0.02, 0.5), laneMark); d.rotation.y = Math.PI / 4; d.position.set(AX(ax), 0.1, AZ(ay)); scene.add(d); }
  const emb = emblemTex();
  const medallion = (ax, ay, r) => { const g = new THREE.Group(); g.position.set(AX(ax), 0, AZ(ay)); scene.add(g); M(new THREE.CylinderGeometry(r, r, 0.14, 48), toon('#c42d3c'), 0, 0.07, 0, g, 0); const top = new THREE.Mesh(new THREE.CircleGeometry(r * 0.98, 48), new THREE.MeshToonMaterial({ map: emb, gradientMap: grad, emissive: 0xffffff, emissiveMap: emb, emissiveIntensity: 0 })); glowMats.push({ m: top.material, k: 0.35 }); top.rotation.x = -Math.PI / 2; top.position.y = 0.145; top.receiveShadow = true; g.add(top); };
  medallion(1440, 810, 110 * S); medallion(1440, 214, 76 * S); medallion(1440, 1400, 76 * S); medallion(164, 810, 76 * S); medallion(2716, 810, 76 * S);

  // ---------- buildings ----------
  const colliders = [], camBlockers = [], camRay = new THREE.Raycaster(), camDir = new THREE.Vector3(), camFrom = new THREE.Vector3();
  const NAVY = '#1f2650', GOLD = toon('#e0a84a'), DARK = toon('#1b1830'), WOOD = toon('#6b4a35'), STEEL = toon('#8a94a8'), WHITE = toon('#f2f0ea');
  const bannerT = bannerTex(), bannerM = new THREE.MeshToonMaterial({ map: bannerT, gradientMap: grad, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  const banner = (g, x, y, z) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.8), bannerM); p.position.set(x, y, z); p.castShadow = true; g.add(p); M(BOX(1.05, 0.08, 0.08), GOLD, x, y + 0.92, z, g, 0); };
  const sign = (g, text, glyph, w, y, z, accent) => { const t = signTex(text, glyph, accent); const m = M(BOX(w, w / 4, 0.18), [DARK, DARK, DARK, DARK, glowing(0, t, 1.3), DARK], 0, y, z, g, 0.04); return m; };
  const windowM = glowing('#ffb85a', null, 1.5), lampM = glowing('#ffd38a', null, 2.2), crystalM = glowing('#58d8ff', null, 1.8), neonM = glowing('#9fe6ff', null, 1.4);
  const bulbs = (g, w, h, y, z) => { const n = Math.floor(w / 0.32); for (let i = 0; i <= n; i++) for (const yy of [y - h / 2 - 0.12, y + h / 2 + 0.12]) M(new THREE.SphereGeometry(0.07, 6, 4), lampM, -w / 2 + i * w / n, yy, z, g, 0); };
  function prism(w, h, d) { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; }
  function place(b) {
    const g = new THREE.Group(); const cx = b.r ? b.cx : (b.x0 + b.x1) / 2, cy = b.r ? b.cy : (b.y0 + b.y1) / 2;
    g.position.set(AX(cx), 0, AZ(cy)); if (b.face === 'N') g.rotation.y = Math.PI; scene.add(g); camBlockers.push(g);
    const w = b.r ? 0 : (b.x1 - b.x0) * S, d = b.r ? 0 : (b.y1 - b.y0) * S;
    const dx = (b.door - cx) * S * (b.face === 'S' ? 1 : -1);
    if (!b.r) colliders.push({ box: [AX(b.x0), AX(b.x1), AZ(b.y0), AZ(b.y1)] });
    return { g, w, d, dx, f: d / 2 };
  }
  // casino
  { const { g, w, d, dx, f } = place(BUILDINGS[0]); const h = 6.5;
    M(BOX(w, h, d), toon(NAVY), 0, h / 2, 0, g, 0.06);
    for (const [x, z, ww, dd] of [[0, d / 2, w + 0.3, 0.3], [0, -d / 2, w + 0.3, 0.3], [w / 2, 0, 0.3, d], [-w / 2, 0, 0.3, d]]) M(BOX(ww, 0.6, dd), GOLD, x, h + 0.3, z, g, 0.03);
    M(BOX(w - 1, 0.1, d - 1), toon('#2a3266'), 0, h + 0.05, 0, g, 0); M(BOX(0.12, 0.12, d - 1.2), GOLD, 0, h + 0.12, 0, g, 0); M(BOX(w - 1.2, 0.12, 0.12), GOLD, 0, h + 0.12, -d * 0.1, g, 0);
    const dia = M(new THREE.OctahedronGeometry(1.1, 0), glowing('#f0a830', null, 1.2), -w * 0.33, h + 1.6, -d * 0.25, g, 0.05); dia.scale.set(1, 1.2, 0.35); dia.userData.spin = 1; flames.push({ spin: dia });
    sign(g, 'CASINO', (c, x, y, a) => { c.fillStyle = '#f6e7c8'; c.beginPath(); c.roundRect(x, y - 24, 48, 48, 8); c.fill(); c.fillStyle = '#141a33'; [[14, 14], [34, 34], [24, 24]].forEach(([u, v]) => { c.beginPath(); c.arc(x + u, y - 24 + v, 5, 0, 7); c.fill(); }); c.fillStyle = a; c.beginPath(); c.arc(x + 80, y, 16, 0, 7); c.fill(); }, 6, 3.5, f + 0.12);
    bulbs(g, 6, 1.5, 3.5, f + 0.24);
    M(BOX(2.6, 2.4, 0.2), glowing('#ffcf7a', null, 1.1), dx, 1.2, f + 0.05, g, 0.04); M(BOX(0.12, 2.4, 0.26), GOLD, dx, 1.2, f + 0.08, g, 0);
    M(BOX(3.2, 0.04, 1.6), toon('#c0283a'), dx, 0.09, f + 1.0, g, 0);
    banner(g, -w / 2 + 1.2, 3.6, f + 0.06); banner(g, -w / 2 + 2.4, 3.6, f + 0.06);
    for (const sx of [-1, 1]) { M(BOX(0.9, 0.6, 0.9), toon('#3a2e40'), dx + sx * 2.2, 0.3, f + 0.6, g, 0.03); M(new THREE.IcosahedronGeometry(0.5, 1), toon('#3f8a46'), dx + sx * 2.2, 0.95, f + 0.6, g, 0.03, 0.5); }
  }
  // tavern
  { const { g, w, d, dx, f } = place(BUILDINGS[1]); const h = 4.6;
    M(BOX(w, h, d), toon('#5a3d2c'), 0, h / 2, 0, g, 0.06);
    for (let i = 0; i <= 6; i++) M(BOX(0.22, h, 0.22), toon('#2e2018'), -w / 2 + i * w / 6, h / 2, f + 0.02, g, 0);
    M(BOX(w + 0.2, 0.25, 0.3), toon('#2e2018'), 0, h * 0.62, f + 0.05, g, 0);
    const roof = M(prism(d + 1.2, 3.2, w + 0.8), toon('#3b2a3a'), 0, h, 0, g, 0); roof.rotation.y = Math.PI / 2;
    const ro = new THREE.Mesh(roof.geometry, outlineMat); ro.scale.set(1.02, 1.03, 1.01); roof.add(ro);
    const ch = M(BOX(0.9, 2.2, 0.9), toon('#7a5446'), w * 0.3, h + 2.0, -d * 0.15, g, 0.04); flames.push({ smokeFrom: ch });
    sign(g, 'TAVERN', (c, x, y, a) => { c.fillStyle = '#f6e7c8'; c.fillRect(x, y - 22, 34, 44); c.strokeStyle = '#f6e7c8'; c.lineWidth = 7; c.beginPath(); c.arc(x + 38, y, 12, -1.3, 1.3); c.stroke(); c.fillStyle = '#ffffff'; c.fillRect(x - 2, y - 30, 38, 10); }, 4.4, h * 0.62 + 1.0, f + 0.2);
    M(BOX(2.0, 2.5, 0.2), WOOD, dx, 1.25, f + 0.05, g, 0.04);
    for (const sx of [-1, 1]) { M(BOX(1.1, 1.0, 0.1), windowM, dx + sx * 3.2, 2.0, f + 0.06, g, 0.03); M(BOX(0.25, 0.35, 0.25), lampM, dx + sx * 1.5, 2.9, f + 0.3, g, 0.03); glowSprite(dx + sx * 1.5, 2.9, f + 0.4, 0xffb060, 2.2, g); }
    banner(g, -w / 2 + 0.8, 3.0, f + 0.14); banner(g, w / 2 - 0.8, 3.0, f + 0.14);
    for (const [x, z] of [[w / 2 - 2.6, f + 0.9], [w / 2 - 1.6, f + 1.4], [w / 2 - 3.4, f + 1.6]]) { M(new THREE.CylinderGeometry(0.42, 0.38, 0.95, 14), toon('#7a5236'), x, 0.48, z, g, 0.03, 0.42); M(new THREE.TorusGeometry(0.42, 0.03, 4, 16), DARK, x, 0.7, z, g, 0).rotation.x = Math.PI / 2; colliders.push({ c: [g.position.x + x, g.position.z + z, 0.5] }); }
  }
  // item shop
  { const { g, w, d, dx, f } = place(BUILDINGS[2]); const h = 4.2;
    M(BOX(w, h, d), toon('#1d3b3a'), 0, h / 2, 0, g, 0.06);
    M(BOX(w + 0.3, 0.35, d + 0.3), toon('#14302e'), 0, h + 0.17, 0, g, 0.04);
    for (let i = 0; i < 9; i++) { const s = M(BOX(w / 9, 0.08, 1.8), toon(i % 2 ? '#f2f0ea' : '#3f9a5e'), -w / 2 + (i + 0.5) * w / 9, h - 0.6, f + 0.8, g, 0.02); s.rotation.x = 0.35; }
    sign(g, 'SHOP', (c, x, y) => { c.fillStyle = '#7ef0b0'; c.beginPath(); c.moveTo(x + 10, y - 26); c.lineTo(x + 22, y - 26); c.lineTo(x + 22, y - 8); c.lineTo(x + 34, y + 22); c.lineTo(x - 2, y + 22); c.lineTo(x + 10, y - 8); c.closePath(); c.fill(); }, 3.6, h - 1.5, f + 0.12, '#4ade80');
    M(BOX(1.8, 2.3, 0.2), toon('#2d5a50'), dx, 1.15, f + 0.05, g, 0.04);
    for (const sx of [-1, 1]) { M(BOX(1.2, 1.2, 0.2), toon('#2a2438'), sx * (w / 2 - 0.9), h + 0.9, f - 0.3, g, 0.04); for (let k = 0; k < 4; k++) M(new THREE.SphereGeometry(0.16, 8, 6), toon(pick(['#ff8a3a', '#9ad04a', '#ec3013'])), sx * (w / 2 - 0.9) + (k % 2 - 0.5) * 0.4, h + 0.9 + (k > 1 ? 0.22 : -0.18), f - 0.18, g, 0); banner(g, sx * (w / 2 - 0.7), 2.3, f + 0.06); M(BOX(0.9, 0.9, 0.08), windowM, sx * 1.6, 1.7, f + 0.05, g, 0.03); }
  }
  // fortune teller (round tent)
  { const b = BUILDINGS[5], { g, dx } = place(b), r = b.r * S, h = 3.6;
    const starsT = canvasTex(512, 128, (c) => { c.fillStyle = '#2a2458'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#e8e2ff'; for (let i = 0; i < 60; i++) { c.beginPath(); c.arc(rr(0, 512), rr(0, 128), rr(1, 3), 0, 7); c.fill(); } c.fillStyle = '#f0c96a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(40 + i * 85, 64, 12, 0.6, 5.7); c.fill(); } });
    M(new THREE.CylinderGeometry(r, r, h, 40), new THREE.MeshToonMaterial({ map: starsT, gradientMap: grad }), 0, h / 2, 0, g, 0.06, r);
    M(new THREE.ConeGeometry(r + 0.5, 3.2, 40), toon('#3d2f7a'), 0, h + 1.6, 0, g, 0.06, r + 0.5);
    M(new THREE.TorusGeometry(r + 0.25, 0.1, 6, 40), GOLD, 0, h + 0.05, 0, g, 0).rotation.x = Math.PI / 2;
    const orb = M(new THREE.SphereGeometry(0.55, 24, 16), crystalM, 0, h + 3.55, 0, g, 0.04, 0.55); glowSprite(0, h + 3.55, 0, 0x7fd8ff, 4, g); flames.push({ bob: orb, y: h + 3.55 });
    const t = signTex('FORTUNE TELLER', null, '#c084fc');
    M(BOX(3.6, 0.8, 0.14), [DARK, DARK, DARK, DARK, glowing(0, t, 1.3), DARK], dx, h + 0.55, r + 0.2, g, 0.03);
    M(BOX(1.4, 2.3, 0.3), toon('#160f2e'), dx, 1.15, r - 0.05, g, 0.03);
    colliders.push({ c: [AX(b.cx), AZ(b.cy), r + 0.1] });
  }
  // bowling
  { const { g, w, d, dx, f } = place(BUILDINGS[3]); const h = 4.8;
    M(BOX(w, h, d), toon('#22284a'), 0, h / 2, 0, g, 0.06);
    M(BOX(w + 0.3, 0.4, d + 0.3), toon('#161b36'), 0, h + 0.2, 0, g, 0.04);
    sign(g, 'BOWLING', (c, x, y) => { c.fillStyle = '#f6e7c8'; c.beginPath(); c.ellipse(x + 16, y - 14, 9, 12, 0, 0, 7); c.ellipse(x + 16, y + 12, 14, 16, 0, 0, 7); c.fill(); c.fillStyle = '#ec3013'; c.fillRect(x + 6, y - 3, 20, 5); }, 4.2, h - 0.8, f + 0.12, '#c0995c');
    for (const sx of [-1, 1]) { M(BOX(2.2, 2.6, 0.12), neonM, sx * 1.6, 1.6, f + 0.04, g, 0.04); M(BOX(2.3, 0.1, 0.16), toon('#ec3013'), sx * 1.6, 0.3, f + 0.08, g, 0); }
    M(BOX(1.4, 2.3, 0.2), toon('#3a4170'), dx, 1.15, f + 0.03, g, 0.03);
    const pts = [[0, 0], [0.55, 0], [0.75, 0.7], [0.62, 1.5], [0.32, 2.1], [0.3, 2.5], [0.45, 2.95], [0.32, 3.35], [0, 3.45]].map(([x, y]) => new THREE.Vector2(x, y));
    const pin = M(new THREE.LatheGeometry(pts, 24), WHITE, -w * 0.25, h + 0.4, -d * 0.1, g, 0.05, 0.75);
    M(new THREE.CylinderGeometry(0.33, 0.33, 0.14, 24), toon('#ec3013'), 0, 2.25, 0, pin, 0); M(new THREE.CylinderGeometry(0.32, 0.31, 0.1, 24), toon('#ec3013'), 0, 2.48, 0, pin, 0);
  }
  // armory
  { const { g, w, d, dx, f } = place(BUILDINGS[4]); const h = 4.4;
    M(BOX(w, h, d), toon('#38404f'), 0, h / 2, 0, g, 0.06);
    for (const sx of [-1, 1]) { const x1 = M(BOX(0.2, Math.hypot(w / 2.4, h * 0.8), 0.12), toon('#5a4030'), sx * w / 4, h / 2, f + 0.04, g, 0); x1.rotation.z = Math.atan2(h * 0.8, w / 2.4); const x2 = M(BOX(0.2, Math.hypot(w / 2.4, h * 0.8), 0.12), toon('#5a4030'), sx * w / 4, h / 2, f + 0.05, g, 0); x2.rotation.z = -Math.atan2(h * 0.8, w / 2.4); }
    const roof = M(prism(d + 1, 2.4, w + 0.6), toon('#6f7a8c'), 0, h, 0, g, 0); roof.rotation.y = Math.PI / 2; const ro = new THREE.Mesh(roof.geometry, outlineMat); ro.scale.set(1.02, 1.03, 1.01); roof.add(ro);
    sign(g, 'ARMORY', (c, x, y, a) => { c.strokeStyle = '#f6e7c8'; c.lineWidth = 7; c.beginPath(); c.moveTo(x, y - 24); c.lineTo(x + 46, y + 24); c.moveTo(x + 46, y - 24); c.lineTo(x, y + 24); c.stroke(); }, 4.2, h - 1.1, f + 0.16, '#94a3b8');
    M(BOX(1.8, 2.4, 0.2), toon('#2a2230'), dx, 1.2, f + 0.05, g, 0.04);
    const sh = M(new THREE.CylinderGeometry(0.9, 0.9, 0.16, 28), STEEL, -w * 0.32, 2.6, f + 0.12, g, 0.04, 0.9); sh.rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16), GOLD, 0, 0.05, 0, sh, 0);
    banner(g, w * 0.08, 2.4, f + 0.14); banner(g, w * 0.24, 2.4, f + 0.14);
    M(BOX(1.2, 0.4, 0.5), toon('#2f3340'), dx - 2.4, 0.55, f + 1.0, g, 0.03); M(BOX(0.6, 0.35, 0.4), toon('#2f3340'), dx - 2.4, 0.18, f + 1.0, g, 0.03);
    colliders.push({ c: [g.position.x - (dx - 2.4), g.position.z - (f + 1.0), 0.8] });
  }

  // props
  for (const [ax, ay] of [[1080, 560], [1800, 560], [1080, 1060], [1800, 1060]]) {
    const x = AX(ax), z = AZ(ay); const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    M(new THREE.CylinderGeometry(0.35, 0.5, 0.9, 12), toon('#4a4560'), 0, 0.45, 0, g, 0.03, 0.5);
    M(new THREE.CylinderGeometry(0.75, 0.45, 0.4, 16), toon('#5c5675'), 0, 1.1, 0, g, 0.04, 0.75);
    const fl = M(new THREE.ConeGeometry(0.42, 1.0, 8), glowing('#ff9a3a', null, 2.4), 0, 1.75, 0, g, 0); fl.castShadow = false;
    const fi = M(new THREE.ConeGeometry(0.22, 0.6, 8), glowing('#ffe28a', null, 2.4), 0, 1.6, 0, g, 0); fi.castShadow = false;
    flames.push({ fl, fi, ph: rnd() * 10 }); glowSprite(0, 1.8, 0, 0xff9a40, 4.5, g);
    const L = new THREE.PointLight(0xff9a50, 0, 14, 2); L.position.set(x, 2.2, z); scene.add(L); pointLights.push({ L, k: 16 });
    colliders.push({ c: [x, z, 0.85] });
  }
  for (const [ax, ay] of [[1270, 436], [1610, 436], [330, 640], [330, 976], [2550, 640], [2550, 976], [1270, 1180], [1610, 1180]]) {
    const x = AX(ax), z = AZ(ay); M(BOX(0.4, 0.5, 0.4), toon('#3a3a58'), x, 0.25, z, null, 0.03);
    const c = M(new THREE.OctahedronGeometry(0.28, 0), crystalM, x, 0.95, z, null, 0.03, 0.28); c.scale.y = 1.5; flames.push({ spin: c }); glowSprite(x, 0.95, z, 0x58d8ff, 2.2);
    colliders.push({ c: [x, z, 0.35] });
  }
  for (const [ax, ay] of [[1190, 994], [1690, 994]]) { const x = AX(ax), z = AZ(ay); M(BOX(2.2, 0.12, 0.6), WOOD, x, 0.5, z, null, 0.03); M(BOX(2.2, 0.5, 0.1), WOOD, x, 0.8, z + 0.28, null, 0.03); for (const sx of [-1, 1]) M(BOX(0.12, 0.5, 0.5), DARK, x + sx * 0.95, 0.25, z, null, 0); colliders.push({ box: [x - 1.1, x + 1.1, z - 0.35, z + 0.4] }); }
  const torchSpots = [[300, 420], [90, 630], [230, 990], [300, 1200], [2580, 420], [2790, 630], [2650, 990], [2580, 1200], [1260, 140], [1616, 300], [1260, 1480], [1616, 1330], [960, 1250]];
  for (const [ax, ay] of torchSpots) { const x = AX(ax), z = AZ(ay); M(new THREE.CylinderGeometry(0.07, 0.1, 2.2, 8), DARK, x, 1.1, z, null, 0.03, 0.1); M(BOX(0.34, 0.4, 0.34), lampM, x, 2.4, z, null, 0.03); M(new THREE.ConeGeometry(0.3, 0.25, 4), DARK, x, 2.72, z, null, 0).rotation.y = Math.PI / 4; glowSprite(x, 2.4, z, 0xffb060, 2.6); colliders.push({ c: [x, z, 0.25] }); }
  // north gate: banner poles + string lights
  const gp = [[1240, 250], [1640, 250]].map(([ax, ay]) => { const x = AX(ax), z = AZ(ay); M(new THREE.CylinderGeometry(0.1, 0.12, 4.6, 10), DARK, x, 2.3, z, null, 0.03, 0.12); M(new THREE.SphereGeometry(0.18, 10, 8), GOLD, x, 4.7, z, null, 0.02, 0.18); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.6), bannerM); p.position.set(x, 3.4, z + 0.12); scene.add(p); colliders.push({ c: [x, z, 0.25] }); return new THREE.Vector3(x, 4.5, z); });
  for (let i = 0; i <= 20; i++) { const t = i / 20, p = gp[0].clone().lerp(gp[1], t); p.y -= Math.sin(t * Math.PI) * 1.0; const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), lampM); b.position.copy(p); scene.add(b); if (i % 4 === 2) glowSprite(p.x, p.y, p.z, 0xffc070, 1.2); }
  // road-end gate signs
  for (const e of EXITS) {
    const outward = e.ay < 100 ? [0, -1] : e.ay > 1500 ? [0, 1] : e.ax < 100 ? [-1, 0] : [1, 0];
    const x = AX(e.ax) + outward[0] * 3, z = AZ(e.ay) + outward[1] * 3; const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(-outward[0], -outward[1]); scene.add(g); camBlockers.push(g);
    for (const sx of [-1, 1]) M(BOX(0.4, 4.2, 0.4), toon('#3a3a58'), sx * 4.6, 2.1, 0, g, 0.04);
    M(BOX(9.8, 0.5, 0.5), toon('#3a3a58'), 0, 4.3, 0, g, 0.04);
    const t = signTex(e.label.toUpperCase(), null, '#e6b45a'); M(BOX(4.4, 1.1, 0.16), [DARK, DARK, DARK, DARK, glowing(0, t, 1.2), DARK], 0, 3.4, 0.18, g, 0.03);
  }

  // trees
  const rounds = [], roundCols = [], pines = [], trunks = [];
  const greens = ['#4f9a44', '#5aa84a', '#3f8a46', '#6db54c', '#478f3f'].map(c => new THREE.Color(c)), blossom = ['#ffb7cf', '#f7a6c4'].map(c => new THREE.Color(c));
  for (let i = 0; i < 4000 && trunks.length < 360; i++) {
    const X = rr(-150, 150), Z = rr(-125, 125); const [ax, ay] = toArt(X, Z);
    if (inPaved(ax, ay, 110)) continue;
    const d = outsideDist(X, Z), inside = d === 0;
    if (inside && rnd() > 0.35) continue;
    if (!inside && Math.min(Math.abs(X), Math.abs(Z)) < 7) continue;
    if (!inside && rnd() > 0.25 + smooth(0, 25, d) * 0.75) continue;
    if (torchSpots.some(([tx, ty]) => Math.hypot(tx - ax, ty - ay) < 90)) continue;
    const y = heightAt(X, Z), s = rr(0.8, 1.35);
    if (!inside && (y > 6 || d > 45) && rnd() < 0.7) pines.push({ X, y, Z, s });
    else { rounds.push({ X, y: y + 2.6 * s, Z, s, sy: s * rr(0.9, 1.2) }); roundCols.push(inside && rnd() < 0.3 ? pick(blossom) : pick(greens)); }
    trunks.push({ X, y: y + 0.9 * s, Z, s }); if (inside) colliders.push({ c: [X, Z, 0.45 * s] });
  }
  const dummy = new THREE.Object3D();
  function instanced(geo, mat, list, oGeo, colsArr) {
    const im = new THREE.InstancedMesh(geo, mat, list.length); im.castShadow = im.receiveShadow = true;
    list.forEach((t, i) => { dummy.position.set(t.X, t.y, t.Z); dummy.rotation.set(0, i * 2.4, 0); dummy.scale.set(t.s, t.sy ?? t.s, t.s); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); if (colsArr) im.setColorAt(i, colsArr[i]); });
    scene.add(im); if (oGeo) { const om = new THREE.InstancedMesh(oGeo, outlineMat, list.length); for (let i = 0; i < list.length; i++) { im.getMatrixAt(i, dummy.matrix); om.setMatrixAt(i, dummy.matrix); } scene.add(om); } return im;
  }
  instanced(new THREE.CylinderGeometry(0.22, 0.32, 1.8, 7), toon('#7a5236'), trunks, new THREE.CylinderGeometry(0.27, 0.37, 1.85, 7));
  instanced(new THREE.IcosahedronGeometry(1.6, 1), toon('#ffffff'), rounds, new THREE.IcosahedronGeometry(1.68, 1), roundCols);
  const pA = new THREE.ConeGeometry(1.6, 2.8, 7); pA.translate(0, 2.6, 0); const pB = new THREE.ConeGeometry(1.15, 2.3, 7); pB.translate(0, 4.1, 0);
  const pAO = new THREE.ConeGeometry(1.68, 2.9, 7); pAO.translate(0, 2.58, 0); const pBO = new THREE.ConeGeometry(1.22, 2.4, 7); pBO.translate(0, 4.08, 0);
  instanced(pA, toon('#2f6e4a'), pines, pAO); instanced(pB, toon('#3a7f52'), pines, pBO);
  const tufts = [], tuftCols = [], tg2 = new THREE.ConeGeometry(0.08, 0.4, 3); tg2.translate(0, 0.2, 0);
  for (let i = 0; i < 12000 && tufts.length < 3500; i++) { const X = rr(-110, 110), Z = rr(-90, 90), [ax, ay] = toArt(X, Z); if (inPaved(ax, ay, 20)) continue; const y = heightAt(X, Z); if (y > 14) continue; tufts.push({ X, y, Z, s: rr(0.7, 1.4) }); tuftCols.push(pick(['#4a8a3a', '#6aa848', '#7fbf50', '#3f7a3a']).length ? new THREE.Color(pick(['#4a8a3a', '#6aa848', '#7fbf50', '#3f7a3a'])) : null); }
  instanced(tg2, toon('#ffffff'), tufts, null, tuftCols).castShadow = false;
  const flowers = [], flCols = [], FC = ['#ffffff', '#ffd04a', '#ff8fb0', '#b9a0ff'].map(c => new THREE.Color(c));
  for (let i = 0; i < 8000 && flowers.length < 1400; i++) { const X = rr(-90, 90), Z = rr(-70, 70), [ax, ay] = toArt(X, Z); if (inPaved(ax, ay, 30)) continue; const y = heightAt(X, Z); if (y > 10) continue; flowers.push({ X, y: y + 0.22, Z, s: rr(0.7, 1.2) }); flCols.push(pick(FC)); }
  instanced(new THREE.IcosahedronGeometry(0.1, 0), toon('#ffffff'), flowers, null, flCols).castShadow = false;

  // clouds, fireflies, rain, smoke
  const clouds = [], cloudMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad, emissive: new THREE.Color(0x8a8f9a), emissiveIntensity: 0.6 });
  for (let i = 0; i < 16; i++) { const g = new THREE.Group(), n = 4 + Math.floor(rnd() * 4); for (let k = 0; k < n; k++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(3, 6), 1), cloudMat); m.position.set(k * 4 - n * 2, rr(-1, 1.5), rr(-2, 2)); m.scale.y = 0.7; g.add(m); } g.position.set(rr(-260, 260), rr(55, 85), rr(-260, 260)); g.userData.v = rr(1.5, 3.5); scene.add(g); clouds.push(g); }
  const ffN = 140, ffGeo = new THREE.BufferGeometry(), ffBase = [];
  for (let i = 0; i < ffN; i++) { const X = rr(-60, 60), Z = rr(-45, 45); ffBase.push([X, heightAt(X, Z) + rr(0.5, 2.5), Z, rr(0, 10)]); }
  ffGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(ffN * 3), 3));
  const ffMat = new THREE.PointsMaterial({ color: 0xfff08a, map: glowTex, size: 0.6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.Points(ffGeo, ffMat));
  const rainN = 1600, rainArr = new Float32Array(rainN * 6), rainGeo = new THREE.BufferGeometry();
  for (let i = 0; i < rainN; i++) { const x = rr(-40, 40), y = rr(0, 40), z = rr(-40, 40); rainArr.set([x, y, z, x - 0.15, y - 0.9, z], i * 6); }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainArr, 3));
  const rainMat = new THREE.LineBasicMaterial({ color: 0xc6d3e0, transparent: true, opacity: 0 }); const rain = new THREE.LineSegments(rainGeo, rainMat); rain.frustumCulled = false; scene.add(rain);
  const smoke = []; flames.filter(f => f.smokeFrom).forEach(f => { for (let k = 0; k < 6; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); smoke.push({ s, ch: f.smokeFrom, t: k / 6 }); } });
  const embers = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xffb060, map: dotTex, size: 0.08, transparent: true, depthWrite: false, alphaTest: 0.1, blending: THREE.AdditiveBlending }));
  const embArr = new Float32Array(4 * 30 * 3), embSeed = Array.from({ length: 120 }, () => [rr(0, 1), rr(-0.3, 0.3), rr(-0.3, 0.3)]);
  embers.geometry.setAttribute('position', new THREE.BufferAttribute(embArr, 3)); scene.add(embers);
  const brazierPos = [[1080, 560], [1800, 560], [1080, 1060], [1800, 1060]].map(([a, b]) => [AX(a), AZ(b)]);

  // ---------- foxes ----------
  const crestTexes = { '8': crestTex('8', '#38bdf8'), U: crestTex('U', '#eab308'), L: crestTex('L', '#eab308'), J: crestTex('J', '#1e3a8a', '#ffffff', '#1e3a8a'), G: crestTex('G', '#38bdf8') };
  function makeFox({ torso, crest, bow, glasses, cane, chair, eyeL = '#f472b6', eyeR = '#2dd4bf' }) {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const P = { body };
    const fur = toon('#f07a2a'), muz = toon('#fdba74'), white = toon('#ffffff'), ink = toon('#1e293b'), leg = toon('#e2e8f0');
    const lift = chair ? 0.28 : 0;
    P.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.15, 0.56 + lift, 0); body.add(p); M(new THREE.CapsuleGeometry(0.1, 0.3, 4, 8), leg, 0, -0.25, 0, p, 0.03); M(new THREE.SphereGeometry(0.13, 10, 8), toon('#0f172a'), 0, -0.48, 0.04, p, 0.02, 0.13).scale.set(1, 0.6, 1.3); if (chair) p.rotation.x = -1.45; return p; });
    M(new THREE.CylinderGeometry(0.36, 0.27, 0.62, 18), toon(torso[1]), 0, 0.9 + lift, 0, body, 0.035);
    M(new THREE.ConeGeometry(0.27, 0.22, 18), toon(torso[2]), 0, 0.5 + lift, 0, body, 0.03).rotation.x = Math.PI;
    M(new THREE.CylinderGeometry(0.3, 0.36, 0.1, 18), toon(torso[0]), 0, 1.22 + lift, 0, body, 0.025);
    for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.15, 12, 8), white, s * 0.34, 1.17 + lift, 0, body, 0.025, 0.15).scale.set(1.1, 0.6, 1);
    const cr = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), new THREE.MeshToonMaterial({ map: crestTexes[crest], gradientMap: grad })); cr.position.set(0, 0.98 + lift, 0.335); cr.rotation.x = -0.12; body.add(cr);
    P.arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.42, 1.12 + lift, 0); body.add(p); M(new THREE.CapsuleGeometry(0.08, 0.3, 4, 8), toon(torso[1]), 0, -0.2, 0, p, 0.025); M(new THREE.SphereGeometry(0.09, 8, 6), toon('#ea580c'), 0, -0.42, 0, p, 0.02, 0.09); return p; });
    const head = new THREE.Group(); head.position.y = 1.62 + lift; body.add(head); P.head = head;
    M(new THREE.SphereGeometry(0.4, 24, 18), fur, 0, 0, 0, head, 0.04, 0.4).scale.set(1.12, 0.95, 1);
    M(new THREE.SphereGeometry(0.27, 18, 12), muz, 0.04, -0.08, 0.2, head, 0).scale.set(1.0, 0.85, 0.9);
    M(new THREE.SphereGeometry(0.15, 14, 10), white, 0, -0.24, 0.26, head, 0).scale.set(1.25, 0.6, 0.85);
    M(new THREE.SphereGeometry(0.055, 10, 8), toon('#000000'), 0, -0.1, 0.45, head, 0);
    for (const s of [-1, 1]) { const t = M(new THREE.ConeGeometry(0.09, 0.26, 5), white, s * 0.44, -0.08, 0.05, head, 0.02); t.rotation.z = s * (Math.PI / 2 + 0.35); }
    P.ears = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.24, 0.3, -0.02); e.rotation.z = -s * 0.32; head.add(e); M(new THREE.ConeGeometry(0.15, 0.42, 4), ink, 0, 0.18, 0, e, 0.025).rotation.y = Math.PI / 4; M(new THREE.ConeGeometry(0.08, 0.27, 4), toon('#9d174d'), 0, 0.15, 0.06, e, 0).rotation.y = Math.PI / 4; M(new THREE.ConeGeometry(0.05, 0.2, 4), white, s * 0.07, 0.12, 0.05, e, 0); return e; });
    const sclera = new THREE.MeshBasicMaterial({ color: 0xffffff }), pupil = new THREE.MeshBasicMaterial({ color: 0x000000 }), lid = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    P.eyes = [[-1, eyeL], [1, eyeR]].map(([s, c]) => { const e = new THREE.Group(); e.position.set(s * 0.15, 0.03, 0.36); e.rotation.y = s * 0.3; head.add(e); const sc = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), sclera); sc.scale.set(0.085, 0.06, 0.03); e.add(sc); const ir = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: c })); ir.scale.set(0.042, 0.048, 0.02); ir.position.z = 0.016; e.add(ir); const pu = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), pupil); pu.scale.set(0.012, 0.034, 0.01); pu.position.z = 0.03; e.add(pu); const hl = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), sclera); hl.position.set(-0.012, 0.016, 0.036); e.add(hl); const br = new THREE.Mesh(BOX(0.13, 0.022, 0.02), lid); br.position.set(0, 0.07, 0.02); br.rotation.z = -s * 0.12; e.add(br); return e; });
    const blush = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.4 }); for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), blush); b.scale.set(0.06, 0.03, 0.02); b.position.set(s * 0.23, -0.1, 0.31); head.add(b); }
    if (bow) { for (const s of [-1, 1]) M(new THREE.SphereGeometry(1, 12, 8), white, s * 0.12, 0.34, 0.14, head, 0.015).scale.set(0.12, 0.08, 0.05); M(BOX(0.08, 0.07, 0.06), toon('#1e293b'), 0, 0.34, 0.16, head, 0.01); }
    if (glasses) { const lens = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.55 }); for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 6, 20), toon('#334155')); r.position.set(s * 0.15, 0.03, 0.41); head.add(r); const l = new THREE.Mesh(new THREE.CircleGeometry(0.095, 20), lens); l.position.set(s * 0.15, 0.03, 0.415); head.add(l); } M(BOX(0.1, 0.02, 0.02), toon('#334155'), 0, 0.05, 0.42, head, 0); }
    if (cane) { const c = M(new THREE.CylinderGeometry(0.018, 0.018, 1.25, 6), white, 0, -0.95, 0.22, P.arms[1], 0.012); c.rotation.x = 0.35; M(new THREE.SphereGeometry(0.035, 6, 4), toon('#dc2626'), 0, -0.62, 0, c, 0); }
    const tail = new THREE.Group(); tail.position.set(0, 0.62 + lift, -0.26); body.add(tail); P.tail = tail;
    [[0, 0, 0, 0.14, '#ea580c'], [0, 0.12, -0.2, 0.19, '#f07a2a'], [0, 0.3, -0.36, 0.21, '#fb923c'], [0, 0.52, -0.42, 0.18, '#fdba74']].forEach(([x, y, z, r, c]) => M(new THREE.SphereGeometry(r, 14, 10), toon(c), x, y, z, tail, 0.025, r));
    M(new THREE.ConeGeometry(0.15, 0.32, 10), white, 0, 0.74, -0.42, tail, 0.02);
    if (chair) {
      const ch = new THREE.Group(); g.add(ch); P.wheels = [];
      M(BOX(0.7, 0.08, 0.6), toon('#334155'), 0, 0.6, 0, ch, 0.025); M(BOX(0.7, 0.75, 0.08), toon('#334155'), 0, 1.0, -0.3, ch, 0.025);
      for (const s of [-1, 1]) { const w = M(new THREE.TorusGeometry(0.42, 0.045, 8, 28), toon('#0f172a'), s * 0.43, 0.45, -0.05, ch, 0.015); w.rotation.y = Math.PI / 2; M(new THREE.TorusGeometry(0.36, 0.015, 4, 20), toon('#cbd5e1'), 0, 0, 0, w, 0); P.wheels.push(w); M(new THREE.SphereGeometry(0.08, 8, 6), toon('#0f172a'), s * 0.3, 0.08, 0.32, ch, 0.01, 0.08); }
      M(BOX(0.5, 0.05, 0.25), toon('#334155'), 0, 0.12, 0.4, ch, 0.015);
    }
    g.traverse(o => { if (o.isMesh && o.material !== outlineMat) o.castShadow = true; });
    g.userData = { P, phase: 0, amt: 0, blink: rr(1, 4), chair: !!chair }; scene.add(g); return g;
  }
  function animFox(c, dt, speed, air = false) {
    const u = c.userData, P = u.P, mv = speed > 0.2; u.phase += dt * (mv ? 3 + speed * 1.4 : 1.4); u.amt = damp(u.amt, mv ? Math.min(1, speed / 4) : 0, 10, dt);
    const sw = Math.sin(u.phase) * 0.9 * u.amt;
    if (!u.chair) { P.legs[0].rotation.x = air ? -0.6 : sw; P.legs[1].rotation.x = air ? 0.4 : -sw; P.arms[0].rotation.x = air ? -2.3 : -sw * 0.8; P.arms[1].rotation.x = air ? -2.3 : sw * 0.8; P.body.position.y = Math.abs(Math.sin(u.phase)) * 0.06 * u.amt; }
    else { P.wheels.forEach(w => w.rotation.x += speed * dt / 0.42); P.arms.forEach(a => a.rotation.x = -0.5 + Math.sin(u.phase) * 0.4 * u.amt); }
    P.arms[0].rotation.z = -0.12; P.arms[1].rotation.z = 0.12;
    P.tail.rotation.y = Math.sin(u.phase * (mv ? 1 : 0.6)) * 0.35; P.tail.rotation.x = -0.25 + Math.sin(u.phase * 0.5) * 0.08;
    P.head.rotation.z = Math.sin(u.phase * 0.35) * 0.04;
    u.blink -= dt; const closed = u.blink < 0.12 && u.blink > 0; if (u.blink < 0) u.blink = rr(2, 5);
    P.eyes.forEach(e => e.scale.y = closed ? 0.12 : 1);
    const flick = (u.phase % 9) < 0.25; P.ears[1].rotation.x = flick ? -0.3 : 0;
  }

  const player = makeFox({ torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', bow: true });
  const Pl = { x: AX(1440), z: AZ(1010), y: 0, vy: 0, vx: 0, vz: 0, face: Math.PI, ground: true, stepT: 0 };
  const npcs = FOXES.map(f => {
    const c = makeFox(f); const n = { ...f, c, speedNow: 0, wait: rr(0, 2), seg: 0, dir: 1 };
    if (f.stand) { n.x = AX(f.stand[0]); n.z = AZ(f.stand[1] * SRC_Y); n.face = n.x > 0 ? -Math.PI / 2 : Math.PI / 2; }
    else { n.pts = f.path.map(([sx, sy]) => [AX(sx), AZ(sy * SRC_Y)]); n.x = n.pts[0][0]; n.z = n.pts[0][1]; n.face = 0; n.seg = 1; }
    return n;
  });
  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), new THREE.MeshBasicMaterial({ color: 0xec3013 })); marker.scale.y = 1.6; scene.add(marker);
  const doors = BUILDINGS.map(b => { const out = b.face === 'S' ? 1 : -1; const edge = b.r ? b.cy - out * b.r : (b.face === 'S' ? b.y1 : b.y0); return { label: b.label, x: AX(b.door), z: AZ(edge) + out * 1.4 }; });

  // ---------- state, input ----------
  const St = { time: ((opts.startHour % 24) + 24) % 24, weather: 'clear', wRain: 0, wFog: 0, mode: 'attract', yaw: 0, pitch: 0.38, dist: 8.5, dialog: null, near: null, muted: false, t: 0 };
  const audio = new Ambience();
  const pal = { top: new THREE.Color(), hor: new THREE.Color(), fog: new THREE.Color(), light: new THREE.Color(), hs: new THREE.Color(), hg: new THREE.Color() };
  const keys = new Set(), input = { jx: 0, jy: 0, jump: false };
  const camPos = new THREE.Vector3(30, 18, 30), camLook = new THREE.Vector3(), grey = new THREE.Color(), fogWhite = new THREE.Color();
  const onKeyDown = e => { if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || St.mode !== 'play') return; keys.add(e.code); if (e.code === 'Space') { input.jump = true; e.preventDefault(); } if (e.code === 'KeyE' || e.code === 'Enter') api.talk(); if (e.code === 'Escape') St.dialog = null; if (/Arrow/.test(e.code)) e.preventDefault(); };
  const onKeyUp = e => keys.delete(e.code), onBlur = () => keys.clear();
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); window.addEventListener('blur', onBlur);
  const el = renderer.domElement, ptrs = new Map();
  const joyBase = document.createElement('div'), joyKnob = document.createElement('div');
  joyBase.style.cssText = 'position:absolute;width:112px;height:112px;border:2px solid #f3f2f2;background:rgba(32,30,29,.25);transform:translate(-50%,-50%);display:none;pointer-events:none;';
  joyKnob.style.cssText = 'position:absolute;width:44px;height:44px;background:#ec3013;transform:translate(-50%,-50%);display:none;pointer-events:none;';
  container.append(joyBase, joyKnob);
  el.addEventListener('pointerdown', e => { if (St.mode !== 'play') return; el.setPointerCapture(e.pointerId); const r = el.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top; const joy = e.pointerType === 'touch' && lx < r.width * 0.45 && ![...ptrs.values()].some(p => p.joy); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, ox: lx, oy: ly, joy }); if (joy) { joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.left = joyKnob.style.left = lx + 'px'; joyBase.style.top = joyKnob.style.top = ly + 'px'; } });
  el.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if (!p) return; if (p.joy) { const r = el.getBoundingClientRect(); let dx = e.clientX - r.left - p.ox, dy = e.clientY - r.top - p.oy; const l = Math.hypot(dx, dy); if (l > 50) { dx *= 50 / l; dy *= 50 / l; } input.jx = dx / 50; input.jy = -dy / 50; joyKnob.style.left = p.ox + dx + 'px'; joyKnob.style.top = p.oy + dy + 'px'; } else { const k = e.pointerType === 'touch' ? 0.008 : 0.005; St.dragT = 1.2; St.yaw -= (e.clientX - p.x) * k; St.pitch = clamp(St.pitch + (e.clientY - p.y) * k * 0.8, -0.05, 1.25); } p.x = e.clientX; p.y = e.clientY; });
  const endPtr = e => { const p = ptrs.get(e.pointerId); if (p && p.joy) { input.jx = input.jy = 0; joyBase.style.display = joyKnob.style.display = 'none'; } ptrs.delete(e.pointerId); };
  el.addEventListener('pointerup', endPtr); el.addEventListener('pointercancel', endPtr);
  el.addEventListener('wheel', e => { if (St.mode !== 'play') return; St.dist = clamp(St.dist + e.deltaY * 0.01, 4, 18); e.preventDefault(); }, { passive: false });
  el.addEventListener('contextmenu', e => e.preventDefault());
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); }); ro.observe(container);

  // collisions: the 2D game's own walk map, then props
  const PR = 0.34;
  const free = (x, z) => walkableAt(x, z) && walkableAt(x + PR, z) && walkableAt(x - PR, z) && walkableAt(x, z + PR) && walkableAt(x, z - PR);
  function pushProps(o, r) {
    for (const c of colliders) {
      if (c.c) { const [cx, cz, cr] = c.c, dx = o.x - cx, dz = o.z - cz, d = Math.hypot(dx, dz), m = cr + r; if (d < m && d > 1e-5) { o.x = cx + dx / d * m; o.z = cz + dz / d * m; } }
      else if (c.box) { const [x0, x1, z0, z1] = c.box; const qx = clamp(o.x, x0, x1), qz = clamp(o.z, z0, z1), ex = o.x - qx, ez = o.z - qz, d = Math.hypot(ex, ez); if (d > 0 && d < r) { o.x = qx + ex / d * r; o.z = qz + ez / d * r; } }
    }
  }
  function moveWithWalls(o, nx, nz, r) {
    const ox = o.x, oz = o.z;
    if (free(nx, nz)) { o.x = nx; o.z = nz; } else if (free(nx, oz)) o.x = nx; else if (free(ox, nz)) o.z = nz;
    const bx = o.x, bz = o.z; pushProps(o, r); if (!free(o.x, o.z)) { o.x = bx; o.z = bz; }
  }

  // minimap
  let mapCanvas = null, mapCtx = null;
  const css = (v, f) => (getComputedStyle(document.documentElement).getPropertyValue(v) || '').trim() || f;
  function drawMap() {
    if (!mapCtx) return; const cw = mapCanvas.width, ch = mapCanvas.height, half = 16, ppm = 1440 / MW;
    const [ax, ay] = toArt(Pl.x, Pl.z); mapCtx.fillStyle = '#1d2a22'; mapCtx.fillRect(0, 0, cw, ch);
    if (mapImg.complete && mapImg.naturalWidth) mapCtx.drawImage(mapImg, ax / 2 - half * ppm, ay / 2 - half * ppm, half * 2 * ppm, half * 2 * ppm, 0, 0, cw, ch);
    const sc = cw / (half * 2), toM = (x, z) => [cw / 2 + (x - Pl.x) * sc, ch / 2 + (z - Pl.z) * sc], dpr = devicePixelRatio, bg = css('--color-bg', '#f3f2f2'), ink = css('--color-text', '#201e1d'), acc = css('--color-accent', '#ec3013');
    for (const n of npcs) { const [x, y] = toM(n.x, n.z); mapCtx.fillStyle = ink; mapCtx.strokeStyle = bg; mapCtx.lineWidth = 2 * dpr; mapCtx.beginPath(); mapCtx.arc(x, y, 4 * dpr, 0, 7); mapCtx.fill(); mapCtx.stroke(); }
    mapCtx.save(); mapCtx.translate(cw / 2, ch / 2); mapCtx.rotate(-Pl.face); const s = 7 * dpr; mapCtx.fillStyle = acc; mapCtx.strokeStyle = bg; mapCtx.lineWidth = 2 * dpr; mapCtx.beginPath(); mapCtx.moveTo(0, s * 1.3); mapCtx.lineTo(s * 0.9, -s); mapCtx.lineTo(-s * 0.9, -s); mapCtx.closePath(); mapCtx.fill(); mapCtx.stroke(); mapCtx.restore();
  }

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, lastHud = '', hudT = 0;
  const sunDir = new THREE.Vector3(), moonDir = new THREE.Vector3(), lightDir = new THREE.Vector3(), v3 = new THREE.Vector3();
  const nearest = () => { let best = null, bd = 3.2; for (const n of npcs) { const d = Math.hypot(n.x - Pl.x, n.z - Pl.z); if (d < bd) { bd = d; best = n; } } return best; };
  const nearSpot = () => { for (const d of doors) if (Math.hypot(d.x - Pl.x, d.z - Pl.z) < 2.4) return { kind: 'door', label: d.label }; for (const e of EXITS) if (Math.hypot(AX(e.ax) - Pl.x, AZ(e.ay) - Pl.z) < 3.5) return { kind: 'exit', label: e.label }; return null; };

  function update(dt) {
    St.t += dt; St.time = (St.time + dt * opts.timeScale / 60) % 24;
    St.wRain = damp(St.wRain, St.weather === 'rain' ? 1 : 0, 0.8, dt); St.wFog = damp(St.wFog, St.weather === 'fog' ? 1 : 0, 0.8, dt);
    const h = St.time; paletteAt(h, pal);
    const sa = (h - 6) / 13 * Math.PI; sunDir.set(Math.cos(sa), Math.sin(sa) * 0.9, 0.38).normalize();
    const mh = ((h - 19 + 24) % 24) / 11 * Math.PI; moonDir.set(-Math.cos(mh), Math.sin(mh) * 0.85, -0.3).normalize();
    lightDir.copy(sunDir.y > -0.02 ? sunDir : moonDir); lightDir.y = Math.max(lightDir.y, 0.18); lightDir.normalize();
    const rk = St.wRain, fk = St.wFog;
    for (const k of ['top', 'hor', 'fog']) { const c = pal[k], l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; grey.setRGB(l, l, l * 1.06); c.lerp(grey, rk * 0.7); }
    pal.hor.lerp(pal.fog, fk * 0.8); pal.top.lerp(pal.fog, fk * 0.6); fogWhite.set('#dfe3e6').multiplyScalar(0.25 + 0.75 * (1 - pal.glow)); pal.fog.lerp(fogWhite, fk * 0.35);
    skyU.top.value.copy(pal.top); skyU.hor.value.copy(pal.hor); skyU.bottom.value.copy(pal.fog); skyU.sunDir.value.copy(sunDir); skyU.moonDir.value.copy(moonDir); skyU.sunCol.value.copy(pal.light);
    skyU.sunVis.value = smooth(-0.08, 0.05, sunDir.y) * (1 - 0.85 * Math.max(rk, fk)); skyU.moonVis.value = smooth(-0.05, 0.1, moonDir.y) * pal.glow * (1 - 0.85 * Math.max(rk, fk));
    scene.fog.color.copy(pal.fog); scene.fog.density = 0.006 + 0.026 * fk + 0.008 * rk;
    sun.color.copy(pal.light); sun.intensity = pal.li * (1 - 0.65 * rk - 0.45 * fk); hemi.color.copy(pal.hs); hemi.groundColor.copy(pal.hg); hemi.intensity = pal.hi * (1 + 0.15 * rk);
    const glow = Math.max(pal.glow, rk * 0.45, fk * 0.3) * 0.8 + 0.2;
    glowMats.forEach(g => g.m.emissiveIntensity = glow * g.k); glows.forEach(s => s.material.opacity = glow * 0.8);
    pointLights.forEach(p => p.L.intensity = glow * p.k * (0.85 + 0.15 * Math.sin(St.t * 13 + p.k)));
    starMat.opacity = smooth(0.5, 0.95, pal.glow) * (1 - Math.max(rk, fk)); ffMat.opacity = smooth(0.6, 1, pal.glow) * (1 - rk) * (0.7 + 0.3 * Math.sin(St.t * 3)); rainMat.opacity = rk * 0.55;
    cloudMat.color.setRGB(1, 1, 1).lerp(pal.hor, 0.35).lerp(grey, rk * 0.6); cloudMat.emissive.copy(pal.hs).multiplyScalar(0.5);

    if (St.mode === 'play') {
      let ix = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + input.jx;
      let iy = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) + input.jy;
      const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
      const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw), rx = Math.cos(St.yaw), rz = -Math.sin(St.yaw);
      const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || Math.hypot(input.jx, input.jy) > 0.92;
      const spd = (run ? 8.5 : 4.8) * Math.min(1, Math.hypot(ix, iy));
      let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix; const ml = Math.hypot(mx, mz); if (ml > 0) { mx /= ml; mz /= ml; }
      Pl.vx = damp(Pl.vx, mx * spd, 12, dt); Pl.vz = damp(Pl.vz, mz * spd, 12, dt);
      moveWithWalls(Pl, Pl.x + Pl.vx * dt, Pl.z + Pl.vz * dt, 0.42);
      for (const n of npcs) { const dx = Pl.x - n.x, dz = Pl.z - n.z, d = Math.hypot(dx, dz), m = n.chair ? 1.0 : 0.8; if (d < m && d > 1e-3) moveWithWalls(Pl, n.x + dx / d * m, n.z + dz / d * m, 0.42); }
      const hs = Math.hypot(Pl.vx, Pl.vz); if (hs > 0.3) { let df = Math.atan2(Pl.vx, Pl.vz) - Pl.face; df = Math.atan2(Math.sin(df), Math.cos(df)); Pl.face += df * Math.min(1, dt * 12); }
      St.dragT = (St.dragT || 0) - dt;
      if (opts.followCam && hs > 0.6 && St.dragT <= 0 && !St.dialog) { let dy = (Pl.face + Math.PI) - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, dt * 2.2 * Math.min(1, hs / 4)); }
      const gy = Math.max(0.06, heightAt(Pl.x, Pl.z));
      if (input.jump && Pl.ground) { Pl.vy = 8.4; Pl.ground = false; audio.tone(420, 0.12, 0.04, 'triangle', 1.8); } input.jump = false;
      Pl.vy -= 24 * dt; Pl.y += Pl.vy * dt; if (Pl.y <= gy) { if (!Pl.ground && Pl.vy < -6) audio.burst(0.1, 500, 0.18); Pl.y = gy; Pl.vy = 0; Pl.ground = true; } else if (Pl.y - gy > 0.15) Pl.ground = false;
      if (Pl.ground && hs > 1) { Pl.stepT -= dt * hs; if (Pl.stepT < 0) { Pl.stepT = 2.2; audio.step(); } }
      player.position.set(Pl.x, Pl.y, Pl.z); player.rotation.y = Pl.face; animFox(player, dt, hs, !Pl.ground);
    } else { player.position.set(Pl.x, 0.06, Pl.z); player.rotation.y = Pl.face; animFox(player, dt, 0); }

    const nr = nearest(); St.near = St.dialog ? null : nr; St.spot = St.dialog || nr ? null : nearSpot();
    for (const n of npcs) {
      const dpl = Math.hypot(Pl.x - n.x, Pl.z - n.z), engaged = St.mode === 'play' && ((St.dialog && St.dialog.npc === n) || dpl < 3.2);
      let spd = 0, tf = n.face;
      if (engaged) tf = Math.atan2(Pl.x - n.x, Pl.z - n.z);
      else if (n.pts) {
        const [tx, tz] = n.pts[n.seg], dx = tx - n.x, dz = tz - n.z, d = Math.hypot(dx, dz);
        if (d < 0.2) { n.wait -= dt; if (n.wait < 0) { n.seg = n.seg === 1 ? 0 : 1; n.wait = rr(1.5, 4); } }
        else { spd = n.speed * 1.1; n.x += dx / d * Math.min(d, spd * dt); n.z += dz / d * Math.min(d, spd * dt); tf = Math.atan2(dx, dz); }
      }
      let df = tf - n.face; df = Math.atan2(Math.sin(df), Math.cos(df)); n.face += df * Math.min(1, dt * 6);
      n.speedNow = damp(n.speedNow, spd, 8, dt); n.c.position.set(n.x, 0.06, n.z); n.c.rotation.y = n.face; animFox(n.c, dt, n.speedNow);
    }
    const mk = St.mode === 'play' ? (St.dialog ? St.dialog.npc : St.near) : null;
    marker.visible = !!mk; if (mk) { marker.position.set(mk.x, 2.45 + (mk.chair ? 0.28 : 0) + Math.sin(St.t * 4) * 0.08, mk.z); marker.rotation.y += dt * 2.5; }
    if (St.dialog) { const d = St.dialog; d.chars = Math.min(d.lines[d.i].text.length, d.chars + dt * 45); if (d.npc && Math.hypot(Pl.x - d.npc.x, Pl.z - d.npc.z) > 6) St.dialog = null; if (!d.npc && d.at && Math.hypot(Pl.x - d.at[0], Pl.z - d.at[1]) > 5) St.dialog = null; }

    // world animation
    for (const f of flames) {
      if (f.fl) { const k = 1 + Math.sin(St.t * 11 + f.ph) * 0.12 + Math.sin(St.t * 23 + f.ph) * 0.06; f.fl.scale.set(1, k, 1); f.fi.scale.set(1, 2 - k, 1); f.fl.rotation.y += dt * 2; }
      if (f.spin) f.spin.rotation.y += dt * 0.9;
      if (f.bob) f.bob.position.y = f.y + Math.sin(St.t * 1.6) * 0.12;
    }
    for (let i = 0; i < 120; i++) { const s = embSeed[i], b = brazierPos[i % 4], t = (St.t * 0.35 + s[0]) % 1; embArr.set([b[0] + s[1] + Math.sin(t * 9 + i) * 0.15, 1.8 + t * 2.4, b[1] + s[2]], i * 3); }
    embers.geometry.attributes.position.needsUpdate = true; embers.material.opacity = 0.9 * (1 - rk);
    clouds.forEach(c => { c.position.x += c.userData.v * dt; if (c.position.x > 280) c.position.x = -280; });
    const fpos = ffGeo.attributes.position; ffBase.forEach(([x, y, z, ph], i) => fpos.setXYZ(i, x + Math.sin(St.t * 0.5 + ph) * 1.5, y + Math.sin(St.t * 0.9 + ph * 2) * 0.5, z + Math.cos(St.t * 0.4 + ph) * 1.5)); fpos.needsUpdate = true;
    if (rk > 0.01) { rain.position.set(camera.position.x, camera.position.y - 20, camera.position.z); for (let i = 0; i < rainN; i++) { const o = i * 6; let y = rainArr[o + 1] - dt * 32; if (y < 0) y += 40; rainArr[o + 1] = y; rainArr[o + 4] = y - 0.9; } rainGeo.attributes.position.needsUpdate = true; }
    smoke.forEach(p => { p.t = (p.t + dt * 0.12) % 1; p.ch.getWorldPosition(v3); p.s.position.set(v3.x + Math.sin(p.t * 6) * 0.6 * p.t, v3.y + 1.2 + p.t * 5, v3.z + p.t * 1.5); p.s.scale.setScalar(0.9 + p.t * 2.8); p.s.material.opacity = Math.sin(p.t * Math.PI) * 0.4 * (1 - rk * 0.6); p.s.material.color.copy(pal.hor).lerp(fogWhite.set('#ffffff'), 0.6); });

    if (St.mode === 'play') {
      const tx = Pl.x, ty = Pl.y + 1.5, tz = Pl.z;
      v3.set(tx + Math.sin(St.yaw) * Math.cos(St.pitch) * St.dist, ty + Math.sin(St.pitch) * St.dist, tz + Math.cos(St.yaw) * Math.cos(St.pitch) * St.dist);
      const gh = heightAt(v3.x, v3.z) + 0.6; if (v3.y < gh) v3.y = gh;
      camFrom.set(tx, ty, tz); camDir.subVectors(v3, camFrom); const want = camDir.length(); camDir.normalize();
      camRay.set(camFrom, camDir); camRay.camera = camera; camRay.far = want + 0.4;
      const hit = camRay.intersectObjects(camBlockers, true).find(i => i.object.material !== outlineMat && !i.object.isSprite);
      const allowed = hit ? Math.max(1.2, hit.distance - 0.45) : want;
      St.camD = allowed < (St.camD ?? want) ? allowed : damp(St.camD ?? want, allowed, 3, dt);
      v3.copy(camFrom).addScaledVector(camDir, St.camD);
      const kc = hit ? 30 : 10;
      camPos.x = damp(camPos.x, v3.x, kc, dt); camPos.y = damp(camPos.y, v3.y, kc, dt); camPos.z = damp(camPos.z, v3.z, kc, dt);
      camLook.x = damp(camLook.x, tx, 14, dt); camLook.y = damp(camLook.y, ty, 14, dt); camLook.z = damp(camLook.z, tz, 14, dt);
    } else { const a = St.t * 0.045 + 1.2; camPos.set(Math.cos(a) * 40, 20 + Math.sin(St.t * 0.1) * 2, Math.sin(a) * 34); camLook.set(0, 2, 0); }
    camera.position.copy(camPos); camera.lookAt(camLook); sky.position.copy(camera.position); stars.position.copy(camera.position);
    const sc = St.mode === 'play' ? player.position : camLook; sun.target.position.copy(sc); sun.position.copy(sc).addScaledVector(lightDir, 110);
    audio.update(dt, { day: smooth(-0.05, 0.2, sunDir.y), night: pal.glow, rain: rk, fog: fk, fountainDist: 999 });
    drawMap();

    hudT -= dt;
    if (hudT < 0) {
      hudT = 0.05; const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
      const period = h < 5 ? 'Night' : h < 7 ? 'Dawn' : h < 11 ? 'Morning' : h < 14 ? 'Midday' : h < 17.5 ? 'Afternoon' : h < 19.3 ? 'Evening' : h < 20.6 ? 'Dusk' : 'Night';
      const d = St.dialog, ln = d && d.lines[d.i];
      const hud = { clock: String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), period, weather: { clear: 'Clear', fog: 'Fog', rain: 'Rain' }[St.weather], muted: St.muted,
        prompt: St.mode === 'play' && St.near ? 'Talk to ' + St.near.name : St.mode === 'play' && St.spot ? (St.spot.kind === 'door' ? 'Enter the ' : 'Take the ') + St.spot.label : null,
        dialog: d ? { name: ln.name, role: ln.role, text: ln.text.slice(0, Math.floor(d.chars)), step: d.i + 1, total: d.lines.length, done: d.chars >= ln.text.length, you: ln.you } : null };
      const key = JSON.stringify(hud); if (key !== lastHud) { lastHud = key; onState(hud); }
    }
  }
  function frame() { raf = requestAnimationFrame(frame); update(Math.min(clock.getDelta(), 0.05)); renderer.render(scene, camera); }
  frame();

  const api = {
    start() { St.mode = 'play'; audio.init(); audio.setMuted(St.muted); camPos.set(Pl.x, 10, Pl.z + 14); },
    talk() {
      if (St.mode !== 'play') return; const d = St.dialog;
      if (d) { const L = d.lines[d.i].text.length; if (d.chars < L) d.chars = L; else if (d.i < d.lines.length - 1) { d.i++; d.chars = 0; audio.blip(); } else St.dialog = null; return; }
      const n = nearest();
      if (n) { St.dialog = { npc: n, lines: (DIALOGUE[n.key] || []).map(l => l.who === 'player' ? { name: 'You', role: 'Fox', text: l.text, you: true } : { name: n.name, role: n.role, text: l.text }), i: 0, chars: 0 }; audio.blip(); return; }
      const s = nearSpot();
      if (s) { St.dialog = { npc: null, at: [Pl.x, Pl.z], lines: [{ name: s.label, role: s.kind === 'door' ? 'Interior' : 'Exit', text: s.kind === 'door' ? `The ${s.label} interior hasn't been built in 3D yet. Only the square is so far.` : `The road to ${s.label} hasn't been built in 3D yet.` }], i: 0, chars: 0 }; audio.blip(); }
    },
    jump() { input.jump = true; },
    cycleWeather() { St.weather = { clear: 'fog', fog: 'rain', rain: 'clear' }[St.weather]; },
    skipTime(hrs = 3) { St.time = (St.time + hrs) % 24; },
    toggleSound() { St.muted = !St.muted; audio.init(); audio.setMuted(St.muted); },
    setMinimap(c) { mapCanvas = c; if (!c) { mapCtx = null; return; } const r = c.getBoundingClientRect(); c.width = Math.round((r.width || 168) * devicePixelRatio); c.height = Math.round((r.height || 168) * devicePixelRatio); mapCtx = c.getContext('2d'); },
    setOptions(o) {
      if (o.timeScale != null) opts.timeScale = o.timeScale; if (o.followCam != null) opts.followCam = !!o.followCam; if (o.outlines != null) outlineMat.visible = !!o.outlines;
      if (o.startHour != null && o.startHour !== opts.startHour) { opts.startHour = o.startHour; St.time = o.startHour % 24; }
      if (o.quality && o.quality !== opts.quality) { opts.quality = o.quality; renderer.setPixelRatio(Math.min(devicePixelRatio, o.quality === 'low' ? 1 : 2)); renderer.shadowMap.enabled = o.quality !== 'low'; scene.traverse(m => { if (m.material) [].concat(m.material).forEach(x => x.needsUpdate = true); }); }
    },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur); audio.dispose(); renderer.dispose(); el.remove(); joyBase.remove(); joyKnob.remove(); },
  };
  if (minimap) api.setMinimap(minimap);
  return api;
}
