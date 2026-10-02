// 8 GATES 3D · Blind Canvas Project gallery
// The building, signs, artworks, videos and learning panels come from Ben's PlayCanvas project
// (exported to gallery/gallery.glb + gallery/gallery.json by tools in g3d_checks). You walk it as a fox.
import * as THREE from '../vendor/three/three.module.js';
import { GLTFLoader } from '../vendor/three/addons/GLTFLoader.js';
import { MeshBVH } from '../vendor/three/three-mesh-bvh.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../fox-kit.js';
import { crestTex } from './textures.js';
import { artAnimator } from './gallery-anim.js';
import { buildVisionSpots, visionOverlay } from './gallery-vision.js';
import { makeWood, woodify, isWhiteFloorMat, isPaletteMat, buildWing, buildDoor } from './gallery-wing.js';
import { carveWorld, carved, buildEntrance, buildRooms, canvasBox, cardTexture } from './gallery-remodel.js';

const BASE = 'gallery/';
const SPAWN = { x: 5.5, y: 0.5, z: 0, face: -Math.PI / 2 };

export async function createGallery({ container, onProgress = () => {}, onNear = () => {}, onZone = () => {} }) {
  const lowEnd = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const renderer = new THREE.WebGLRenderer({ antialias: !lowEnd || devicePixelRatio < 2, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowEnd ? 1.5 : 2));
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  renderer.setSize(W(), H());
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfd9ec);
  scene.fog = new THREE.Fog(0xbfd9ec, 120, 420);
  const camera = new THREE.PerspectiveCamera(60, W() / H(), 0.08, 900);
  scene.add(new THREE.HemisphereLight(0xf4f6ff, 0x6b5a48, 1.6));
  const sun = new THREE.DirectionalLight(0xfff3e0, 1.5); sun.position.set(-60, 120, 40); scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  // ---------------------------------------------------------------- the building
  const data = await (await fetch(BASE + 'gallery.json')).json();
  // all artwork/poster images ship as one pack file (one download, one file to commit); each becomes a blob URL
  let IMGURL = {}; const RES = u => (u && IMGURL[u]) || u;
  try {
    const [idx, buf] = await Promise.all([fetch(BASE + 'img.index.json').then(r => r.json()), fetch(BASE + 'img.pack').then(r => r.arrayBuffer())]);
    const url = IMGURL; for (const [k, [o, l]] of Object.entries(idx)) url[k] = URL.createObjectURL(new Blob([buf.slice(o, o + l)], { type: 'image/webp' }));
    const R = u => (u && url[u]) || u;
    data.signs.forEach(s => { if (s.img) { s.key = s.img; s.img = R(s.img); } }); data.vids.forEach(v => { v.poster = R(v.poster); });
    data.edu.forEach(e => (e.people || []).forEach(p => { p.img = R(p.img); }));
  } catch (e) { console.warn('image pack', e); }
  const gltf = await new Promise((res, rej) => new GLTFLoader().load(BASE + 'gallery.glb', res, e => e.total && onProgress(e.loaded / e.total), rej));
  const world = gltf.scene; scene.add(world); world.updateMatrixWorld(true);
  // remodel: cut out the old pieces we rebuild in the New Wing style, and drop their signs/art/screens
  const carveInfo = carveWorld(world);
  const ctrOf = c => c.reduce((a, v) => [a[0] + v[0] / 4, a[1] + v[1] / 4, a[2] + v[2] / 4], [0, 0, 0]);
  data.signs = data.signs.filter(sg => !carved(...ctrOf(sg.c)));
  data.arts = data.arts.filter(a => !carved(...(a.c ? ctrOf(a.c) : a.p)));
  data.vids = data.vids.filter(v => !carved(...v.p));
  const colGeos = [];
  const wood = makeWood();   // honey oak planks, drawn here (no file)
  world.traverse(o => {
    if (!o.isMesh) return;
    const old = o.material, mats = Array.isArray(old) ? old : [old];
    const conv = mats.map(m => {   // Lambert: cheap on phones, and no black metal without an env map
      const n = new THREE.MeshLambertMaterial({ color: m.color, map: m.map, emissive: m.emissive, emissiveMap: m.emissiveMap, emissiveIntensity: m.emissiveIntensity ?? 1, transparent: m.transparent, opacity: m.opacity, alphaTest: m.alphaTest, side: m.side, vertexColors: m.vertexColors });
      if (m.metalness > 0.5 && !m.map) n.color.multiplyScalar(0.85);
      if (isPaletteMat(n)) woodify(n, wood, 4, true);   // New Wing look: white floors become hardwood, grey walls go gallery white
      return n;
    });
    o.material = Array.isArray(old) ? conv : conv[0];
    o.matrixAutoUpdate = false;
    // walls/floors to collide with (skip see-through decals)
    const m0 = mats[0]; if (m0.transparent && m0.opacity < 0.2) return;
    if (o.isInstancedMesh) {
      for (let i = 0; i < o.count; i++) { const mi = new THREE.Matrix4(); o.getMatrixAt(i, mi); const g = o.geometry.clone(); g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(o.matrixWorld, mi)); colGeos.push(g); }
    } else { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); colGeos.push(g); }
  });
  // New Artists Wing: built from Ben's artist pages, entered through a doorway in the main hall (quick fade, like our interiors)
  // joined to the south end of the Wall of Why hallway (x -74..-66), running out over the lawn; walk straight in
  const WING_O = new THREE.Vector3(-69.9, -3.14, 22.0);
  const wing = data.wing ? buildWing({ scene, wing: data.wing, O: WING_O, rotY: Math.PI / 2, doorW: 8.4, wood, resolveImg: RES }) : null;
  const doors = [];
  if (wing) for (const m of wing.col) { const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld); colGeos.push(g); }
  const entrance = buildEntrance({ scene, wood });
  const rooms = buildRooms({ scene, data, wood, resolveImg: RES, buildWing });
  for (const m of [...entrance.col, ...rooms.col]) { const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld); colGeos.push(g); }
  // one position-only collision mesh with a BVH (fast rays on phones)
  let total = 0; for (const g of colGeos) total += (g.index ? g.index.count : g.attributes.position.count);
  const P = new Float32Array(total * 3); let k = 0;
  for (const g of colGeos) { const pa = g.attributes.position, ix = g.index; const n = ix ? ix.count : pa.count; for (let i = 0; i < n; i++) { const j = ix ? ix.getX(i) : i; P[k++] = pa.getX(j); P[k++] = pa.getY(j); P[k++] = pa.getZ(j); } g.dispose(); }
  const colGeo = new THREE.BufferGeometry(); colGeo.setAttribute('position', new THREE.BufferAttribute(P, 3));
  const bvh = new MeshBVH(colGeo);
  const ray = new THREE.Ray();
  const cast = (ox, oy, oz, dx, dy, dz, far) => { ray.origin.set(ox, oy, oz); ray.direction.set(dx, dy, dz); const h = bvh.raycastFirst(ray, THREE.DoubleSide, 0, far); return h && h.distance <= far ? h : null; };

  // ---------------------------------------------------------------- signs & artworks (PlayCanvas UI elements, rebuilt as planes, streamed in near you)
  const texLoader = new THREE.TextureLoader();
  const quad = c => { const g = new THREE.BufferGeometry(); const [a, b, cc, d] = c; g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...cc, ...a, ...cc, ...d], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2)); return g; };
  function wrapLines(ctx, text, maxW) {
    const out = [];
    for (const para of String(text).split('\n')) {
      const words = para.split(/\s+/); let line = '';
      for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
      out.push(line);
    }
    return out;
  }
  function textTexture(s) {
    const K = Math.min(1.6, 1024 / Math.max(s.w, s.h));
    const cv = document.createElement('canvas'); cv.width = Math.round(s.w * K); cv.height = Math.round(s.h * K);
    const ctx = cv.getContext('2d');
    ctx.font = `${s.b ? 700 : 400} ${s.fs * K}px Arimo, Archivo, Helvetica, Arial, sans-serif`;
    const lines = wrapLines(ctx, s.s, cv.width - 2);
    const lh = Math.max(s.lh, s.fs * 1.0) * K, th = lines.length * lh;
    const c = s.col; ctx.fillStyle = `rgb(${c[0] * 255 | 0},${c[1] * 255 | 0},${c[2] * 255 | 0})`;
    ctx.textBaseline = 'middle'; ctx.textAlign = s.al[0] < 0.34 ? 'left' : s.al[0] > 0.66 ? 'right' : 'center';
    const x = s.al[0] < 0.34 ? 1 : s.al[0] > 0.66 ? cv.width - 1 : cv.width / 2;
    const y0 = (cv.height - th) * (1 - s.al[1]) + lh / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, y0 + i * lh));
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  const signs = data.signs.map(s => {
    const c = s.c, ctr = new THREE.Vector3(); c.forEach(v => ctr.add(new THREE.Vector3(...v))); ctr.multiplyScalar(0.25);
    return { s, ctr, mesh: null };
  });
  // arts point at their image sign
  const arts = data.arts.map(a => {
    let ctr = new THREE.Vector3(...a.p), img = null;
    if (a.c) { ctr = new THREE.Vector3(); a.c.forEach(v => ctr.add(new THREE.Vector3(...v))); ctr.multiplyScalar(0.25); }
    let best = 1e9; for (const sg of signs) if (sg.s.img) { const d = sg.ctr.distanceTo(ctr); if (d < best) { best = d; img = sg.s.img; } }
    const n = a.c ? new THREE.Vector3().subVectors(new THREE.Vector3(...a.c[1]), new THREE.Vector3(...a.c[0])).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...a.c[3]), new THREE.Vector3(...a.c[0]))).normalize() : new THREE.Vector3();
    const { desc, imgDesc } = splitDesc(a.d);
    return { title: a.t, desc, imgDesc, img: best < 1.5 ? img : null, ctr, n };
  });
  if (wing) arts.push(...wing.arts);
  arts.push(...rooms.arts);
  function showSign(sg) {
    if (sg.mesh) return; const s = sg.s;
    if (s.k === 'c') { sg.mesh = canvasBox(s, texLoader); scene.add(sg.mesh); return; }
    if (s.k === 'l') { sg.mesh = new THREE.Mesh(quad(s.c), new THREE.MeshBasicMaterial({ map: cardTexture(s), polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })); sg.mesh.renderOrder = 2; scene.add(sg.mesh); return; }
    let mat;
    if (s.k === 't') mat = new THREE.MeshBasicMaterial({ map: textTexture(s), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, fog: true });
    else { mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(...s.col), transparent: true, opacity: s.op ?? 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }); if (s.img) texLoader.load(s.img, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; mat.map = t; mat.needsUpdate = true; if (!sg.mesh) t.dispose(); }); }
    sg.mesh = new THREE.Mesh(quad(s.c), mat); sg.mesh.renderOrder = s.k === 't' ? 3 : 2; scene.add(sg.mesh);
  }
  function hideSign(sg) { if (!sg.mesh) return; scene.remove(sg.mesh); sg.mesh.geometry.dispose(); for (const m of [].concat(sg.mesh.material)) { if (m.map) m.map.dispose(); if (m !== sideShared) m.dispose(); } sg.mesh = null; }
  const sideShared = null;
  const NEAR = lowEnd ? 34 : 50, FAR = NEAR + 18;

  // ---------------------------------------------------------------- video screens (zone video: play while you stand in the room)
  const vids = data.vids.map(v => {
    const posterMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    if (v.poster) texLoader.load(v.poster, t => { t.colorSpace = THREE.SRGBColorSpace; posterMat.map = t; posterMat.color.set(0xffffff); posterMat.needsUpdate = true; });
    const dark = new THREE.MeshBasicMaterial({ color: 0x151515 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.04, 1.01, 1.01), [posterMat, posterMat, dark, dark, dark, dark]);
    box.position.set(...v.p); box.quaternion.set(...v.q); box.scale.set(...v.s); scene.add(box);
    const zone = v.tmin ? new THREE.Box3(new THREE.Vector3(...v.tmin), new THREE.Vector3(...v.tmax)).expandByScalar(0.6) : null;
    return { ...v, box, posterMat, zone };
  });
  if (wing) vids.push(...wing.screens);
  vids.push(...rooms.screens);   // a two-sided interview screen in the middle of each bay of the New Artists Wing
  // living paintings: the animated version of an artwork fades in over the still while you stand in front of it
  const ANIMS = new Set(data.anims || []);
  const animOf = k => { const b = k && k.split('/').pop().replace(/\.\w+$/, ''); return b && ANIMS.has(b) ? BASE + 'anim/' + b + '.mp4' : null; };
  const animItems = [];
  for (const sg of signs) if (sg.s.k === 'c') { const u = animOf(sg.s.key || sg.s.img); if (u) { const c = sg.s.c; animItems.push({ mesh: () => sg.mesh, w: Math.hypot(c[1][0] - c[0][0], c[1][1] - c[0][1], c[1][2] - c[0][2]), h: Math.hypot(c[3][0] - c[0][0], c[3][1] - c[0][1], c[3][2] - c[0][2]), url: u }); } }
  for (const cv of [...(wing ? wing.canvases : []), ...rooms.canvases]) { const u = animOf(cv.key); if (u) animItems.push({ mesh: () => cv.mesh, w: cv.w, h: cv.h, url: u }); }
  const animator = artAnimator({ items: animItems, maxActive: lowEnd ? 1 : 2 });
  const localFail = new Set();
  const video = document.createElement('video'); video.crossOrigin = 'anonymous'; video.playsInline = true; video.setAttribute('playsinline', ''); video.loop = true; video.muted = true; video.preload = 'auto';
  const vidTex = new THREE.VideoTexture(video); vidTex.colorSpace = THREE.SRGBColorSpace;
  const vidMat = new THREE.MeshBasicMaterial({ map: vidTex });
  let hls = null, curUrl = null, soundOK = false, vidFail = new Set();
  async function playUrl(url) {
    if (url === curUrl) return; curUrl = url;
    for (const v of vids) for (const f of (v.faces || [0, 1])) v.box.material[f] = (url && v.u === url && !vidFail.has(url)) ? vidMat : v.posterMat;
    if (hls) { hls.destroy(); hls = null; }
    video.pause(); video.removeAttribute('src'); video.load();
    if (!url || vidFail.has(url)) return;
    const fail = () => { vidFail.add(url); if (curUrl === url) { curUrl = null; playUrl(url); } };
    // the gallery's own copy (in the site, 3D/gallery/video/) first; the original Vimeo stream if that fails
    const loc = (vids.find(v => v.u === url && v.local) || {}).local;
    if (loc && !localFail.has(url)) {
      video.onerror = () => { localFail.add(url); if (curUrl === url) { curUrl = null; if (/^https?:/.test(url)) playUrl(url); else fail(); } };
      video.src = loc; video.muted = !soundOK; video.play().catch(() => {}); return;
    }
    if (!/^https?:/.test(url)) return fail();
    try {
      if (video.canPlayType('application/vnd.apple.mpegurl')) video.src = url;
      else {
        if (!window.Hls) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'vendor/hls/hls.light.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
        if (!window.Hls.isSupported()) return fail();
        hls = new window.Hls({ capLevelToPlayerSize: true, maxBufferLength: 20 }); hls.on(window.Hls.Events.ERROR, (e, d) => { if (d.fatal) fail(); });
        hls.loadSource(url); hls.attachMedia(video);
      }
      video.onerror = fail;
      video.muted = !soundOK; await video.play().catch(() => {});
    } catch (e) { fail(); }
  }
  // Browsers only allow video WITH sound after the visitor has tapped once. The first tap (the Enter button, or any touch/key)
  // "blesses" our one shared video element by playing it with sound inside that tap; after that every zone autoplays with audio.
  const unlockSound = () => {
    if (soundOK) return; soundOK = true; video.muted = false;
    if (curUrl) { video.play().catch(() => {}); return; }
    const first = vids.find(v => v.local); if (!first) return;
    video.src = first.local; video.volume = 0;
    video.play().then(() => { if (!curUrl) { video.pause(); video.removeAttribute('src'); video.load(); } video.volume = 1; }).catch(() => { video.volume = 1; });
  };
  addEventListener('pointerdown', unlockSound, { once: false }); addEventListener('keydown', unlockSound);

  // ---------------------------------------------------------------- learning stations (tools, ally tips, spectrum, wall of why)
  const edu = data.edu.map(e => ({ ...e, pos: new THREE.Vector3(...e.p) }));

  // ---------------------------------------------------------------- the fox
  const grad = makeGradient();
  const cache = new Map();
  const toon = (c, extra) => { const key = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(key)) cache.set(key, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(key); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const { makeFox, animFox } = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const FOX_SCALE = 0.62;   // kit foxes are ~2.7 units; the gallery is in metres
  let player = null, look = 'male', extra = 'none';
  // the player's merch: Blind Canvas Project logo on the black tee, "Walk Through Fear" on the back of the hoodie
  const printTex = (w, h, draw) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; draw(c, w, h, () => { t.needsUpdate = true; }); return t; };
  // ---- the BCP tee: one artwork on the front (different per visitor), Ben's logo on the back
  const backLogo = printTex(640, 640, (c, w, h, up) => {
    const img = new Image(); img.onload = () => { c.clearRect(0, 0, w, h); const lw = 600, lh = lw * img.height / img.width; c.drawImage(img, (w - lw) / 2, (h - lh) / 2, lw, lh); up(); };
    img.src = RES('gallery/img/bcp_logo_white.webp');
  });
  const ART_KEYS = Object.keys(IMGURL).filter(k => /\/wix_/.test(k));
  const DEFAULT_ART = 'gallery/img/wix_walk_through_fear.webp';
  const artCache = new Map();
  const frontArt = key => {
    key = IMGURL[key] ? key : DEFAULT_ART;
    if (!artCache.has(key)) artCache.set(key, printTex(512, 512, (c, w, h, up) => { const img = new Image(); img.onload = () => { c.fillStyle = '#f3f2f2'; c.fillRect(0, 0, w, h); c.drawImage(img, 14, 14, w - 28, h - 28); up(); }; img.src = RES(key); }));
    return artCache.get(key);
  };
  // fur palettes: 0 is Ben's fox (the first visitor in a room); the rest are shades of orange, red and white
  const PALETTES = [
    {},
    { fur: '#e2552c', furDark: '#a8331a', snout: '#f39a6a', muzzle: '#f8a983', tailBase: '#a8331a', tailMid: '#e8693c', paw: '#e2552c' },
    { fur: '#c7302a', furDark: '#7f1a16', snout: '#e8826b', muzzle: '#f09a84', tailBase: '#7f1a16', tailMid: '#d54a3a', paw: '#c7302a' },
    { fur: '#f59a3a', furDark: '#c86a1c', snout: '#fbc07e', muzzle: '#ffcf98', tailBase: '#c86a1c', tailMid: '#f8b060', paw: '#f59a3a' },
    { fur: '#f1ede7', furDark: '#c9c2b8', snout: '#ffffff', muzzle: '#ffffff', chin: '#ffffff', tailBase: '#d8d1c7', tailMid: '#efe9e1', paw: '#e8e2da', earInner: '#e79aa8' },
    { fur: '#f3b27c', furDark: '#d0773e', snout: '#fbd2a8', muzzle: '#ffe0bf', tailBase: '#d0773e', tailMid: '#f6c393', paw: '#f3b27c' },
    { fur: '#a4221d', furDark: '#62110e', snout: '#d8705e', muzzle: '#e48a78', tailBase: '#62110e', tailMid: '#bf3a30', paw: '#a4221d' },
    { fur: '#f6f2ee', furDark: '#d0473a', snout: '#ffffff', muzzle: '#ffffff', chin: '#ffffff', tailBase: '#d0473a', tailMid: '#f2ddd6', paw: '#d0473a', earInner: '#e07a8a' },
    { fur: '#e8743a', furDark: '#b24e22', snout: '#f6b48a', muzzle: '#fbc6a0', tailBase: '#b24e22', tailMid: '#ef9156', paw: '#e8743a' },
  ];
  const randomStyle = () => ({ pal: 1 + Math.floor(Math.random() * (PALETTES.length - 1)), art: ART_KEYS.filter(k => k !== DEFAULT_ART)[Math.floor(Math.random() * Math.max(1, ART_KEYS.length - 1))] || DEFAULT_ART });
  let style = { pal: 0, art: DEFAULT_ART };
  // merge each fox's still parts per joint (about 57 draw calls down to ~15) so a room full of visitors stays light on phones
  function bakeLocal(root) {   // per animated joint: merge every still mesh beneath it (any depth) by material; outlines into one
    const P = root.userData.P || {}, keep = new Set([root]);
    for (const v of Object.values(P)) { if (Array.isArray(v)) v.forEach(x => x && x.isObject3D && keep.add(x)); else if (v && v.isObject3D) keep.add(v); }
    root.updateMatrixWorld(true);
    const EMPTY = new THREE.BufferGeometry(), inv = new THREE.Matrix4(), m = new THREE.Matrix4();
    const ok = o => o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && !Array.isArray(o.material) && !o.material.map && !o.material.transparent && !o.userData.keep && !keep.has(o);
    for (const A of keep) {
      inv.copy(A.matrixWorld).invert(); const groups = new Map(), outl = [];
      const visit = o => { for (const c of o.children) { if (keep.has(c)) continue; if (c.isMesh && (c.material === outlineMat || c.material === outlineMat)) { if (c.geometry !== EMPTY) outl.push(c); } else if (ok(c)) { const k = c.material.uuid; if (!groups.has(k)) groups.set(k, { mat: c.material, list: [] }); groups.get(k).list.push(c); } visit(c); } };
      visit(A);
      const merge = list => { const pos = [], nor = []; for (const c of list) { const g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone(); m.multiplyMatrices(inv, c.matrixWorld); g.applyMatrix4(m); pos.push(...g.attributes.position.array); if (g.attributes.normal) nor.push(...g.attributes.normal.array); } const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (nor.length === pos.length) out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); else out.computeVertexNormals(); out.computeBoundingSphere(); return out; };
      for (const { mat, list } of groups.values()) { if (list.length < 2) continue; const mm = new THREE.Mesh(merge(list), mat); mm.castShadow = true; A.add(mm); list.forEach(c => { c.geometry = EMPTY; c.castShadow = false; }); }
      const ol = outl.filter(c => c.parent && c.parent.geometry === EMPTY || true); if (ol.length > 1) { A.add(new THREE.Mesh(merge(ol), outlineMat)); ol.forEach(c => c.geometry = EMPTY); }
    }
    // drop the emptied meshes that carry nothing alive beneath them
    const dead = []; root.traverse(o => { if (o.isMesh && o.geometry === EMPTY && !o.children.some(c => !(c.isMesh && c.geometry === EMPTY))) dead.push(o); });
    for (const o of dead.reverse()) if (o.parent && !o.children.length) o.parent.remove(o);
    return root;
  }

  function makeVisitorFox(lk, ex, st = { pal: 0, art: DEFAULT_ART }) {   // every visitor wears the BCP tee
    const f = makeFox({ torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', mood: 'warm', look: { ...(lk === 'female' ? PLAYER_FEMALE : PLAYER_MALE), ...(PALETTES[st.pal | 0] || {}), tailSide: 1.15 },   // tail swept to the side so the back print shows
      outfit: 'tee', prints: { front: frontArt(st.art), frontW: 1.45, back: backLogo }, gear: 'none', cane: ex === 'cane', glasses: ex === 'glasses' || ex === 'cane', chair: ex === 'chair' });
    bakeLocal(f); f.scale.setScalar(FOX_SCALE); return f;
  }
  function buildPlayer() {
    const pos = player ? player.position.clone() : null;
    if (player) scene.remove(player);
    player = makeVisitorFox(look, extra, style); if (pos) player.position.copy(pos);
    scene.add(player);
  }
  // ---------------------------------------------------------------- other visitors (multiplayer)
  const remotes = new Map();
  const tagSprite = (text, bg = 'rgba(20,19,18,.88)', fg = '#ffffff', w = 512) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = 112; const c = cv.getContext('2d');
    c.font = '800 54px Archivo, Arial, sans-serif'; const tw = Math.min(w - 20, c.measureText(text).width + 48);
    c.fillStyle = bg; c.fillRect((w - tw) / 2, 8, tw, 96); c.fillStyle = '#ec3013'; c.fillRect((w - tw) / 2, 8, 8, 96);
    c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, w / 2 + 4, 58, w - 40);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: true, transparent: true })); sp.scale.set(1.6 * w / 512, 0.35, 1); sp.renderOrder = 5; return sp;
  };
  const bubbleTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.beginPath(); c.arc(64, 60, 52, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#141312'; c.lineWidth = 6; c.stroke(); c.font = '64px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('👋', 64, 64); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  function showWave(fox) {
    fox.userData.hop = 1;
    const b = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleTex, transparent: true })); b.scale.setScalar(0.55); b.userData.t = 2.4; b.userData.fox = fox; scene.add(b); waves.push(b);
  }
  const waves = [];
  function remoteUpsert(id, st, prof) {
    let r = remotes.get(id);
    if (!r) { r = { id, prof: { name: 'Visitor', look: 'male', extra: 'none' }, fox: null, tag: null, x: 0, y: 0, z: 0, face: 0, tx: 0, ty: 0, tz: 0, tface: 0, speed: 0, air: false, last: performance.now(), placed: false }; remotes.set(id, r); }
    if (prof) {
      const changed = !r.fox || prof.look !== r.prof.look || prof.extra !== r.prof.extra || prof.pal !== r.prof.pal || prof.art !== r.prof.art;
      const renamed = prof.name !== r.prof.name;
      r.prof = { ...r.prof, ...prof };
      if (changed) { if (r.fox) scene.remove(r.fox); r.fox = makeVisitorFox(r.prof.look, r.prof.extra, { pal: r.prof.pal | 0, art: r.prof.art }); r.fox.visible = r.placed; scene.add(r.fox); }
      if (renamed || !r.tag) { if (r.tag) { scene.remove(r.tag); r.tag.material.map.dispose(); } r.tag = tagSprite(r.prof.name || 'Visitor'); r.tag.visible = r.placed; scene.add(r.tag); }
    }
    if (st) {
      [r.tx, r.ty, r.tz, r.tface, r.speed] = st; r.air = !!st[5]; r.last = performance.now();
      if (!r.placed || Math.hypot(r.tx - r.x, r.tz - r.z) > 8 || Math.abs(r.ty - r.y) > 4) { r.x = r.tx; r.y = r.ty; r.z = r.tz; r.face = r.tface; }
      r.placed = true;
    }
    if (!r.fox) { r.fox = makeVisitorFox(r.prof.look, r.prof.extra, { pal: r.prof.pal | 0, art: r.prof.art }); scene.add(r.fox); }
    if (!r.tag) { r.tag = tagSprite(r.prof.name || 'Visitor'); scene.add(r.tag); }
    return r;
  }
  function remoteRemove(id) { const r = remotes.get(id); if (!r) return; if (r.fox) scene.remove(r.fox); if (r.tag) scene.remove(r.tag); remotes.delete(id); }
  function updateRemotes(dt) {
    const now = performance.now();
    for (const r of remotes.values()) {
      if (now - r.last > 25000) { remoteRemove(r.id); continue; }
      r.x = damp(r.x, r.tx, 10, dt); r.y = damp(r.y, r.ty, 12, dt); r.z = damp(r.z, r.tz, 10, dt);
      let d = r.tface - r.face; d = Math.atan2(Math.sin(d), Math.cos(d)); r.face += d * Math.min(1, dt * 10);
      const far = Math.hypot(r.x - Pl.x, r.z - Pl.z) > 70 || Math.abs(r.y - Pl.y) > 60;
      r.fox.visible = r.placed && !far; r.tag.visible = r.placed && !far;
      if (!r.fox.visible) continue;
      r.fox.position.set(r.x, r.y + (r.prof.extra === 'chair' ? 0 : 0.02), r.z); r.fox.rotation.y = r.face;
      if (r.fox.userData.hop > 0) r.fox.userData.hop = r.fox.userData.hop;
      animFox(r.fox, dt, (r.speed || 0) / FOX_SCALE * 0.6, r.air);
      r.tag.position.set(r.x, r.y + 2.15, r.z);
    }
    for (let i = waves.length - 1; i >= 0; i--) { const b = waves[i]; b.userData.t -= dt; const f = b.userData.fox; b.position.set(f.position.x, f.position.y + 2.6 + (2.4 - b.userData.t) * 0.15, f.position.z); b.material.opacity = Math.min(1, b.userData.t * 2); if (b.userData.t <= 0) { scene.remove(b); waves.splice(i, 1); } }
  }
  buildPlayer();

  const Pl = { x: SPAWN.x, y: SPAWN.y, z: SPAWN.z, vy: 0, face: SPAWN.face, ground: false, speed: 0 };
  const St = { yaw: SPAWN.face + Math.PI, pitch: 0.28, dist: 4.2, camDist: 4.2 };
  const input = { f: 0, b: 0, l: 0, r: 0, run: 0, jx: 0, jy: 0, jump: 0 };

  function groundAt(x, y, z) { const h = cast(x, y + 0.55, z, 0, -1, 0, 30); return h ? h.point.y : -1e9; }
  { const gy = groundAt(Pl.x, 1.5, Pl.z); if (gy > -100) Pl.y = gy; }

  const tmp = new THREE.Vector3();
  function move(dt) {
    // camera-relative input
    let ix = input.jx + (input.r - input.l), iz = input.jy + (input.f - input.b);
    const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
    const mag = Math.min(1, il);
    const run = input.run || mag > 0.92;
    const sp = (run ? 6.2 : 3.4) * mag * (extra === 'chair' ? 0.95 : 1);
    const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw);   // camera forward on the ground
    let dx = (fx * iz + -fz * ix) * sp * dt, dz = (fz * iz + fx * ix) * sp * dt;
    if (mag > 0.05) { const want = Math.atan2(dx, dz); let d = want - Pl.face; d = Math.atan2(Math.sin(d), Math.cos(d)); Pl.face += d * Math.min(1, dt * 12); }
    // walls: rays at knee, chest and head; slide along what we hit
    const R = 0.32;
    for (let pass = 0; pass < 2; pass++) {
      const len = Math.hypot(dx, dz); if (len < 1e-5) break;
      const ux = dx / len, uz = dz / len; let hit = null;
      for (const h of [0.5, 1.0, 1.55]) { const r = cast(Pl.x, Pl.y + h, Pl.z, ux, 0, uz, len + R); if (r && Math.abs(r.face.normal.y) < 0.55 && (!hit || r.distance < hit.distance)) hit = r; }
      if (!hit) break;
      const n = tmp.copy(hit.face.normal); n.y = 0; n.normalize(); if (n.x * ux + n.z * uz > 0) n.negate();
      const allowed = Math.max(0, hit.distance - R);
      const into = dx * n.x + dz * n.z;   // negative
      dx -= n.x * into; dz -= n.z * into;   // slide
      if (allowed > 0.001) { Pl.x += ux * Math.min(allowed, len) * 0.9; Pl.z += uz * Math.min(allowed, len) * 0.9; dx *= 0.1; dz *= 0.1; }
    }
    // also block the sideways slide if it walks into another wall
    { const len = Math.hypot(dx, dz); if (len > 1e-5) { let ok = true; for (const h of [0.5, 1.0, 1.55]) { const r = cast(Pl.x, Pl.y + h, Pl.z, dx / len, 0, dz / len, len + R); if (r && Math.abs(r.face.normal.y) < 0.55) ok = false; } if (ok) { Pl.x += dx; Pl.z += dz; } } }
    // ground: step up to 0.55 m, ramps, falls
    const gy = groundAt(Pl.x, Pl.y, Pl.z);
    if (input.jump && Pl.ground && extra !== 'chair') { Pl.vy = 6.2; Pl.ground = false; } input.jump = 0;
    if (Pl.ground && gy > Pl.y - 0.45 && Pl.vy <= 0) { Pl.y = damp(Pl.y, gy, 30, dt); Pl.vy = 0; }
    else { Pl.vy -= 22 * dt; Pl.y += Pl.vy * dt; Pl.ground = false; if (Pl.y <= gy) { Pl.y = gy; Pl.vy = 0; Pl.ground = true; } }
    if (Pl.y < -60) respawn();
    Pl.speed = Math.hypot(dx, dz) / Math.max(dt, 1e-4) + (mag > 0.05 ? sp * 0.3 : 0);
  }
  // ---------------------------------------------------------------- "See through their eyes": two floor spots in the main hall (between Ben's and April & Melissa's screens)
  const vSpots = buildVisionSpots({ scene, groundAt, spots: [{ x: -101.5, y: -3.3, z: -2.4, cond: 'rp', textYaw: Math.PI / 2 }, { x: -101.5, y: -3.3, z: 2.4, cond: 'cataracts', textYaw: Math.PI / 2 }] });
  const V = { spot: null, py: 0, pp: 0, pts: [], gi: 0, gt: 0, from: null };
  const vOverlay = visionOverlay({ container, onExit: () => exitVision(), onGuided: on => { if (on) { V.gt = 0; V.from = [St.yaw, St.pitch]; } } });
  const lookAngles = (from, to) => { const v = to.clone().sub(from).normalize(); return [Math.atan2(-v.x, -v.z), Math.asin(clamp(-v.y, -1, 1))]; };
  function enterVision(spot) {
    V.spot = spot; Pl.x = spot.x; Pl.z = spot.z; Pl.y = spot.y; Pl.vy = 0; Pl.speed = 0; for (const k in input) input[k] = 0;
    const eye = new THREE.Vector3(spot.x, spot.y + 1.55, spot.z);
    const screen = new THREE.Vector3(...((data.vids[3] && data.vids[3].p) || [-117.6, 0.16, -0.18]));
    [St.yaw, St.pitch] = lookAngles(eye, screen); Pl.face = St.yaw + Math.PI; V.py = St.yaw; V.pp = St.pitch;
    // guided look: the big screen, then the paintings you can actually see from here, in a sweep round the room
    const seen = [];
    for (const sg of signs) if (sg.s.k === 'c') { const d = sg.ctr.distanceTo(eye); if (d > 34) continue; const dir = sg.ctr.clone().sub(eye).normalize(); const h = cast(eye.x, eye.y, eye.z, dir.x, dir.y, dir.z, d); if (!h || h.distance > d - 0.6) seen.push(sg.ctr.clone()); }
    seen.sort((a, b) => Math.atan2(a.z - eye.z, -(a.x - eye.x)) - Math.atan2(b.z - eye.z, -(b.x - eye.x)));
    V.pts = [screen, ...seen.filter((_, i) => i % Math.max(1, Math.ceil(seen.length / 6)) === 0)].map(p => lookAngles(eye, p));
    V.gi = 0; V.gt = 0; V.from = [St.yaw, St.pitch];
    vOverlay.open(spot.cond); onNear(null); nearKey = 'vision-locked';
  }
  function exitVision() { if (!V.spot) return; const sp = V.spot; V.spot = null; vOverlay.close(); St.pitch = 0.28; St.camDist = 1.2; Pl.x = sp.x + 1.6; nearKey = null; }
  function updateVision(dt, now) {
    for (const sp of vSpots) sp.glow.material.opacity = 0.32 + Math.sin(now / 420 + sp.z) * 0.18;
    let yr = 0, pr = 0;
    if (V.spot) {
      Pl.x = V.spot.x; Pl.z = V.spot.z; Pl.y = V.spot.y; Pl.speed = 0;
      const ix = input.jx + (input.r - input.l), iy = input.jy + (input.f - input.b);
      if (Math.abs(ix) + Math.abs(iy) > 0.05 || now - St.lastLook < 200) { if (vOverlay.st.guided) vOverlay.setGuided(false); }
      St.yaw -= ix * 1.7 * dt; St.pitch -= iy * 1.1 * dt;
      if (vOverlay.st.guided && V.pts.length) {   // ease between points, dwell, move on
        const TR = 2.8, DW = 2.4; V.gt += dt; const to = V.pts[V.gi % V.pts.length];
        if (V.gt < TR) { const k = V.gt / TR, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; let dy = to[0] - V.from[0]; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw = V.from[0] + dy * e; St.pitch = V.from[1] + (to[1] - V.from[1]) * e; }
        else if (V.gt > TR + DW) { V.gt = 0; V.from = [St.yaw, St.pitch]; V.gi++; }
      }
      St.pitch = clamp(St.pitch, -0.65, 0.85);
      let dyw = St.yaw - V.py; dyw = Math.atan2(Math.sin(dyw), Math.cos(dyw)); yr = dyw / Math.max(dt, 1e-3); pr = (St.pitch - V.pp) / Math.max(dt, 1e-3); V.py = St.yaw; V.pp = St.pitch;
      // through the fox's own eyes
      const cp = Math.cos(St.pitch), dir = new THREE.Vector3(Math.sin(St.yaw) * cp, Math.sin(St.pitch), Math.cos(St.yaw) * cp);
      const eye = new THREE.Vector3(Pl.x, Pl.y + 1.55, Pl.z); camera.position.copy(eye); camera.lookAt(eye.clone().sub(dir)); player.visible = false; Pl.face = St.yaw + Math.PI;
    }
    vOverlay.update(dt, clamp(yr, -6, 6), clamp(pr, -6, 6));
  }
  function respawn() { if (V.spot) exitVision(); Pl.x = SPAWN.x; Pl.z = SPAWN.z; Pl.y = groundAt(SPAWN.x, 1.5, SPAWN.z); Pl.vy = 0; Pl.face = SPAWN.face; St.yaw = SPAWN.face + Math.PI; }

  const DBG = { freeCam: false };
  St.lastLook = 0;
  const camRay = new THREE.Vector3(), camSide = new THREE.Vector3(), camUp = new THREE.Vector3();
  function updateCamera(dt) {
    // follow: while walking, swing the camera round behind the fox (not when you just dragged to look, and not when walking toward the camera)
    const moving = Pl.speed > 0.6 && (Math.abs(input.jx) + Math.abs(input.jy) + input.f + input.b + input.l + input.r) > 0.1;
    if (moving && performance.now() - St.lastLook > 900) {
      const behind = Pl.face + Math.PI; let d = behind - St.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      const w = clamp((Math.cos(d) + 0.6) / 1.2, 0, 1);
      St.yaw += d * Math.min(1, dt * 2.4 * w);
    }
    const head = new THREE.Vector3(Pl.x, Pl.y + 1.35, Pl.z);
    const cp = Math.cos(St.pitch), dir = new THREE.Vector3(Math.sin(St.yaw) * cp, Math.sin(St.pitch), Math.cos(St.yaw) * cp);
    // walls never come between you and the fox: a small fan of rays (centre, left, right, up, down) and the camera sits in front of the nearest hit
    camSide.set(Math.cos(St.yaw), 0, -Math.sin(St.yaw)); camUp.crossVectors(dir, camSide).normalize();
    let near = St.dist;
    for (const [sx, sy] of [[0, 0], [0.35, 0], [-0.35, 0], [0, 0.28], [0, -0.22]]) {
      camRay.copy(dir).multiplyScalar(St.dist).addScaledVector(camSide, sx).addScaledVector(camUp, sy);
      const len = camRay.length(); camRay.divideScalar(len);
      const h = cast(head.x, head.y, head.z, camRay.x, camRay.y, camRay.z, len + 0.35);
      if (h) near = Math.min(near, (h.distance - 0.35) * (St.dist / len));
    }
    const want = Math.max(0.55, near);
    St.camDist = want < St.camDist ? want : damp(St.camDist, want, 3, dt);
    camera.position.copy(head).addScaledVector(dir, St.camDist);
    camera.lookAt(head);
    player.visible = St.camDist > 1.1;   // squeezed against a wall: go first-person rather than fill the screen with fox
  }

  // ---------------------------------------------------------------- input: keys, mouse drag, touch joystick (left) + drag look (right)
  const el = renderer.domElement;
  const keyMap = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r', ShiftLeft: 'run', ShiftRight: 'run' };
  const onKeyDown = e => { if (e.target.closest && e.target.closest('input,textarea')) return; const k = keyMap[e.code]; if (k) { input[k] = 1; e.preventDefault(); } if (e.code === 'Space') { input.jump = 1; e.preventDefault(); } };
  const onKeyUp = e => { const k = keyMap[e.code]; if (k) input[k] = 0; };
  addEventListener('keydown', onKeyDown); addEventListener('keyup', onKeyUp);
  addEventListener('blur', () => { for (const k in input) input[k] = 0; });
  // phones/tablets: the Meru joystick. Touch anywhere on the left side of the screen and it appears under your thumb; let go and it hides
  const touchUI = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
  const JR = 50;   // knob travel (same as Meru)
  const joyBase = document.createElement('div'), joyKnob = document.createElement('div');
  joyBase.style.cssText = 'position:absolute;width:112px;height:112px;border:2px solid #f3f2f2;background:rgba(32,30,29,.25);transform:translate(-50%,-50%);display:none;pointer-events:none;z-index:5;';
  joyKnob.style.cssText = 'position:absolute;width:44px;height:44px;background:#ec3013;transform:translate(-50%,-50%);display:none;pointer-events:none;z-index:5;';
  container.append(joyBase, joyKnob);
  const ptrs = new Map();
  el.addEventListener('pointerdown', e => {
    const r = el.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top;
    const joy = e.pointerType === 'touch' && lx < r.width * 0.45 && ![...ptrs.values()].some(p => p.joy);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, ox: lx, oy: ly, joy });
    if (joy) { joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.left = joyKnob.style.left = lx + 'px'; joyBase.style.top = joyKnob.style.top = ly + 'px'; }
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
  });
  el.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    if (p.joy) { const r = el.getBoundingClientRect(); let dx = e.clientX - r.left - p.ox, dy = e.clientY - r.top - p.oy; const l = Math.hypot(dx, dy); if (l > JR) { dx *= JR / l; dy *= JR / l; } input.jx = dx / JR; input.jy = -dy / JR; joyKnob.style.left = p.ox + dx + 'px'; joyKnob.style.top = p.oy + dy + 'px'; }
    else { St.lastLook = performance.now(); const k = e.pointerType === 'touch' ? 0.008 : 0.005; St.yaw -= (e.clientX - p.x) * k; St.pitch = clamp(St.pitch + (e.clientY - p.y) * k * 0.8, -0.35, 1.2); }
    p.x = e.clientX; p.y = e.clientY;
  });
  const endPtr = e => { const p = ptrs.get(e.pointerId); if (p && p.joy) { input.jx = input.jy = 0; joyBase.style.display = joyKnob.style.display = 'none'; } ptrs.delete(e.pointerId); };
  el.addEventListener('pointerup', endPtr); el.addEventListener('pointercancel', endPtr);
  el.addEventListener('wheel', e => { St.dist = clamp(St.dist + e.deltaY * 0.004, 1.6, 9); e.preventDefault(); }, { passive: false });

  // ---------------------------------------------------------------- loop
  let raf = 0, last = performance.now(), streamT = 0, nearKey = null, zoneT = 0;
  const fit = () => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.fov = camera.aspect < 1 ? 70 : 60; camera.updateProjectionMatrix(); St.dist = camera.aspect < 1 ? 5.2 : 4.2; };
  const ro = new ResizeObserver(fit); ro.observe(container); fit();
  function nearest() {
    const p = new THREE.Vector3(Pl.x, Pl.y + 1.2, Pl.z); let best = null, bd = 1e9;
    if (V.spot) return null;
    for (const sp of vSpots) if (Math.hypot(Pl.x - sp.x, Pl.z - sp.z) < sp.r + 0.15 && Math.abs(Pl.y - sp.y) < 1.2) return { kind: 'vision', item: sp, label: 'See through their eyes' };
    for (const a of arts) { const d = a.ctr.distanceTo(p); if (d < 4.2 && d < bd) { bd = d; best = { kind: 'art', item: a, label: 'VIEW · ' + (a.title || 'ARTWORK') }; } }
    for (const e of edu) { const d = e.pos.distanceTo(p); if (d < e.r + 1 && d < bd + 1.5) { bd = d; best = { kind: 'edu', item: e, label: (e.prompt || 'LEARN MORE').replace(/^Press E to /i, '') }; } }
    return best;
  }
  let doorT = 0;
  const fadeEl = document.createElement('div'); fadeEl.style.cssText = 'position:absolute;inset:0;background:#0b0a12;opacity:0;pointer-events:none;transition:opacity .28s;z-index:6'; container.appendChild(fadeEl);
  function travel(d) {
    if (d.wing && wing) wing.load();
    fadeEl.style.opacity = 1;
    setTimeout(() => { const t = d.to; Pl.x = t.x; Pl.z = t.z; Pl.y = t.y; Pl.vy = 0; Pl.face = t.face; St.yaw = t.face + Math.PI; St.camDist = 1; streamT = 0; onZone(d.wing ? 'New Artists Wing' : 'The Gallery'); setTimeout(() => fadeEl.style.opacity = 0, 120); }, 300);
  }
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!V.spot) move(dt);
    player.position.set(Pl.x, Pl.y + (extra === 'chair' ? 0 : 0.02), Pl.z); player.rotation.y = Pl.face;
    animFox(player, dt, Pl.speed / FOX_SCALE * 0.6, !Pl.ground);
    updateRemotes(dt);
    animator.update(dt, Pl.x, Pl.y, Pl.z);
    if (!DBG.freeCam && !V.spot) updateCamera(dt);
    updateVision(dt, now);
    doorT -= dt;
    for (const d of doors) {
      d.portal.material.opacity = 0.78 + Math.sin(now / 400) * 0.12;
      if (doorT > 0) continue;
      const lx = Pl.x - d.pos.x, lz = Pl.z - d.pos.z, along = lx * Math.cos(d.face) - lz * Math.sin(d.face), across = lx * Math.sin(d.face) + lz * Math.cos(d.face);
      if (Math.abs(along) < 1.5 && Math.abs(across) < 0.55 && Math.abs(Pl.y - d.pos.y) < 2) { doorT = 1.2; travel(d); }
    }
    streamT -= dt;
    if (streamT <= 0) {
      streamT = 0.4; const p = new THREE.Vector3(Pl.x, Pl.y, Pl.z);
      if (wing) { const inWing = wing.bounds.containsPoint(p); if (inWing !== St.inWing) { St.inWing = inWing; onZone(inWing ? 'New Artists Wing' : 'The Gallery'); } if (Math.hypot(Pl.x - WING_O.x, Pl.z - WING_O.z) < 45) wing.load(); }
      for (const r of rooms.list) if (Math.hypot(Pl.x - r.O.x, Pl.z - r.O.z) < 45) r.room.load();
      for (const sg of signs) { const d = sg.ctr.distanceTo(p); if (d < NEAR) showSign(sg); else if (d > FAR) hideSign(sg); }
      // which video zone are we in?
      let zUrl = null; const pp = new THREE.Vector3(Pl.x, Pl.y + 0.5, Pl.z);
      for (const v of vids) if (v.zone && v.zone.containsPoint(pp)) { zUrl = v.u; break; }
      playUrl(zUrl);
      if (zUrl) { let dmin = 1e9; for (const v of vids) if (v.u === zUrl) dmin = Math.min(dmin, (v.wp ||= v.box.getWorldPosition(new THREE.Vector3())).distanceTo(pp)); const vv = vids.find(v => v.u === zUrl); video.volume = clamp((vv.vol ?? 0.8) * (1 - dmin / (vv.dist || 20)), 0, 1); }
      if (!V.spot) { const n = nearest(); const key = n ? n.kind + n.label + (n.item && n.item.z) : null; if (key !== nearKey) { nearKey = key; onNear(n); } }
    }
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(tick);

  function splitDesc(d) {
    const s = String(d || '').replace(/\t+/g, ' ').trim();
    const m = s.match(/\/\s*IMAGE DESCRIPTION\s*[:\-]?\s*/i);
    if (!m) return { desc: s, imgDesc: '' };
    return { desc: s.slice(0, m.index).trim(), imgDesc: s.slice(m.index + m[0].length).trim() };
  }

  return {
    arts, edu,
    setLook(l, x) { look = l || look; extra = x || 'none'; buildPlayer(); },
    // multiplayer hooks (the page wires these to engine/gallery-net.js)
    localState: () => [+Pl.x.toFixed(2), +Pl.y.toFixed(2), +Pl.z.toFixed(2), +Pl.face.toFixed(2), +Math.min(9, Pl.speed).toFixed(1), Pl.ground ? 0 : 1],
    remote: { upsert: remoteUpsert, remove: remoteRemove, count: () => remotes.size, names: () => [...remotes.values()].map(r => r.prof.name), wave: id => { const r = remotes.get(id); if (r && r.fox) showWave(r.fox); } },
    wave() { showWave(player); },
    style: () => ({ ...style }),
    setStyle(st) { style = { pal: st.pal | 0, art: st.art || DEFAULT_ART }; buildPlayer(); },
    randomStyle,
    jump() { input.jump = 1; },
    setRun(v) { input.run = v ? 1 : 0; },
    respawn,
    vision: { enter: sp => enterVision(sp), exit: () => exitVision(), locked: () => !!V.spot, spots: vSpots, overlay: vOverlay },
    unlockAudio() { unlockSound(); },
    goWing() { const d = doors.find(x => x.wing); if (d) travel(d); },
    debug: { THREE, DBG, video, animator, Pl, St, input, scene, camera, renderer, vids, signs, teleport(x, y, z, face) { Pl.x = x; Pl.z = z; Pl.y = y ?? groundAt(x, 30, z); Pl.vy = 0; if (face != null) { Pl.face = face; St.yaw = face + Math.PI; } }, groundAt, cast, info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, tex: renderer.info.memory.textures, geo: renderer.info.memory.geometries }) },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', onKeyDown); removeEventListener('keyup', onKeyUp); if (hls) hls.destroy(); video.pause(); renderer.dispose(); el.remove(); joyBase.remove(); joyKnob.remove(); },
  };
}
