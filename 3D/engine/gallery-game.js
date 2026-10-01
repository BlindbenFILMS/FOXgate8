// 8 GATES 3D · Blind Canvas Project gallery
// The building, signs, artworks, videos and learning panels come from Ben's PlayCanvas project
// (exported to gallery/gallery.glb + gallery/gallery.json by tools in g3d_checks). You walk it as a fox.
import * as THREE from '../vendor/three/three.module.js';
import { GLTFLoader } from '../vendor/three/addons/GLTFLoader.js';
import { MeshBVH } from '../vendor/three/three-mesh-bvh.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../fox-kit.js';
import { crestTex } from './textures.js';
import { makeWood, woodify, isWhiteFloorMat, buildWing, buildDoor } from './gallery-wing.js';

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
    data.signs.forEach(s => { if (s.img) s.img = R(s.img); }); data.vids.forEach(v => { v.poster = R(v.poster); });
    data.edu.forEach(e => (e.people || []).forEach(p => { p.img = R(p.img); }));
  } catch (e) { console.warn('image pack', e); }
  const gltf = await new Promise((res, rej) => new GLTFLoader().load(BASE + 'gallery.glb', res, e => e.total && onProgress(e.loaded / e.total), rej));
  const world = gltf.scene; scene.add(world); world.updateMatrixWorld(true);
  const colGeos = [];
  const wood = makeWood();   // honey oak planks, drawn here (no file)
  world.traverse(o => {
    if (!o.isMesh) return;
    const old = o.material, mats = Array.isArray(old) ? old : [old];
    const conv = mats.map(m => {   // Lambert: cheap on phones, and no black metal without an env map
      const n = new THREE.MeshLambertMaterial({ color: m.color, map: m.map, emissive: m.emissive, emissiveMap: m.emissiveMap, emissiveIntensity: m.emissiveIntensity ?? 1, transparent: m.transparent, opacity: m.opacity, alphaTest: m.alphaTest, side: m.side, vertexColors: m.vertexColors });
      if (m.metalness > 0.5 && !m.map) n.color.multiplyScalar(0.85);
      if (isWhiteFloorMat(n)) woodify(n, wood);   // the white floors become hardwood (walls keep their colour)
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
  const WING_O = new THREE.Vector3(-100, -150, 0);
  const wing = data.wing ? buildWing({ scene, wing: data.wing, O: WING_O, wood, resolveImg: RES }) : null;
  const doors = [];
  if (wing) {
    for (const m of wing.col) { const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld); colGeos.push(g); }
    doors.push({ ...buildDoor({ scene, pos: new THREE.Vector3(-96, -3.35, 12), face: Math.PI / 2, title: 'NEW ARTISTS WING', sub: data.wing.artists.map(a => a.name).join(' · ') }), to: { x: WING_O.x - 4.5, y: WING_O.y, z: WING_O.z, face: -Math.PI / 2 }, wing: true });
    doors.push({ ...buildDoor({ scene, pos: new THREE.Vector3(WING_O.x - 0.9, WING_O.y, WING_O.z), face: Math.PI / 2, title: '← BACK TO THE GALLERY', sub: 'The main hall of the Blind Canvas Project' }), to: { x: -92, y: -3.35, z: 12, face: Math.PI / 2 }, wing: false });
  }
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
  function showSign(sg) {
    if (sg.mesh) return; const s = sg.s;
    let mat;
    if (s.k === 't') mat = new THREE.MeshBasicMaterial({ map: textTexture(s), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, fog: true });
    else { mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(...s.col), transparent: true, opacity: s.op ?? 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }); if (s.img) texLoader.load(s.img, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; mat.map = t; mat.needsUpdate = true; if (!sg.mesh) t.dispose(); }); }
    sg.mesh = new THREE.Mesh(quad(s.c), mat); sg.mesh.renderOrder = s.k === 't' ? 3 : 2; scene.add(sg.mesh);
  }
  function hideSign(sg) { if (!sg.mesh) return; scene.remove(sg.mesh); sg.mesh.geometry.dispose(); if (sg.mesh.material.map) sg.mesh.material.map.dispose(); sg.mesh.material.dispose(); sg.mesh = null; }
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
  const video = document.createElement('video'); video.crossOrigin = 'anonymous'; video.playsInline = true; video.setAttribute('playsinline', ''); video.loop = true; video.muted = true; video.preload = 'auto';
  const vidTex = new THREE.VideoTexture(video); vidTex.colorSpace = THREE.SRGBColorSpace;
  const vidMat = new THREE.MeshBasicMaterial({ map: vidTex });
  let hls = null, curUrl = null, soundOK = false, vidFail = new Set();
  async function playUrl(url) {
    if (url === curUrl) return; curUrl = url;
    for (const v of vids) v.box.material[0] = v.box.material[1] = (url && v.u === url && !vidFail.has(url)) ? vidMat : v.posterMat;
    if (hls) { hls.destroy(); hls = null; }
    video.pause(); video.removeAttribute('src'); video.load();
    if (!url || vidFail.has(url)) return;
    const fail = () => { vidFail.add(url); if (curUrl === url) { curUrl = null; playUrl(url); } };
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
  const unlockSound = () => { if (soundOK) return; soundOK = true; video.muted = false; if (curUrl) video.play().catch(() => {}); };
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
  function buildPlayer() {
    const pos = player ? player.position.clone() : null;
    if (player) { scene.remove(player); player.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
    player = makeFox({ torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', mood: 'warm', look: look === 'female' ? PLAYER_FEMALE : PLAYER_MALE, outfit: look === 'female' ? 'dress' : 'coat', gear: 'none', cane: extra === 'cane', glasses: extra === 'glasses' || extra === 'cane', chair: extra === 'chair' });
    player.scale.setScalar(FOX_SCALE); if (pos) player.position.copy(pos);
    scene.add(player);
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
    if (Pl.y < (Pl.y < -100 ? WING_O.y - 30 : -60)) respawn();
    Pl.speed = Math.hypot(dx, dz) / Math.max(dt, 1e-4) + (mag > 0.05 ? sp * 0.3 : 0);
  }
  function respawn() { Pl.x = SPAWN.x; Pl.z = SPAWN.z; Pl.y = groundAt(SPAWN.x, 1.5, SPAWN.z); Pl.vy = 0; Pl.face = SPAWN.face; St.yaw = SPAWN.face + Math.PI; }

  const DBG = { freeCam: false };
  function updateCamera(dt) {
    const head = new THREE.Vector3(Pl.x, Pl.y + 1.35, Pl.z);
    const cp = Math.cos(St.pitch), dir = new THREE.Vector3(Math.sin(St.yaw) * cp, Math.sin(St.pitch), Math.cos(St.yaw) * cp);
    const h = cast(head.x, head.y, head.z, dir.x, dir.y, dir.z, St.dist + 0.3);
    const want = h ? Math.max(0.6, h.distance - 0.3) : St.dist;
    St.camDist = want < St.camDist ? want : damp(St.camDist, want, 4, dt);
    camera.position.copy(head).addScaledVector(dir, St.camDist);
    camera.lookAt(head);
    player.visible = St.camDist > 0.75;
  }

  // ---------------------------------------------------------------- input: keys, mouse drag, touch joystick (left) + drag look (right)
  const el = renderer.domElement;
  const keyMap = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r', ShiftLeft: 'run', ShiftRight: 'run' };
  const onKeyDown = e => { if (e.target.closest && e.target.closest('input,textarea')) return; const k = keyMap[e.code]; if (k) { input[k] = 1; e.preventDefault(); } if (e.code === 'Space') { input.jump = 1; e.preventDefault(); } };
  const onKeyUp = e => { const k = keyMap[e.code]; if (k) input[k] = 0; };
  addEventListener('keydown', onKeyDown); addEventListener('keyup', onKeyUp);
  addEventListener('blur', () => { for (const k in input) input[k] = 0; });
  const joyBase = document.createElement('div'), joyKnob = document.createElement('div');
  joyBase.style.cssText = 'position:absolute;width:112px;height:112px;border:2px solid #f3f2f2;background:rgba(32,30,29,.25);transform:translate(-50%,-50%);display:none;pointer-events:none;z-index:5';
  joyKnob.style.cssText = 'position:absolute;width:44px;height:44px;background:#ec3013;transform:translate(-50%,-50%);display:none;pointer-events:none;z-index:5';
  container.append(joyBase, joyKnob);
  const ptrs = new Map();
  el.addEventListener('pointerdown', e => {
    const r = el.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top;
    const joy = e.pointerType === 'touch' && lx < r.width * 0.45 && ![...ptrs.values()].some(p => p.joy);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, ox: lx, oy: ly, joy });
    if (joy) { joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.left = joyKnob.style.left = lx + 'px'; joyBase.style.top = joyKnob.style.top = ly + 'px'; }
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    if (p.joy) { const r = el.getBoundingClientRect(); let dx = e.clientX - r.left - p.ox, dy = e.clientY - r.top - p.oy; const l = Math.hypot(dx, dy); if (l > 50) { dx *= 50 / l; dy *= 50 / l; } input.jx = dx / 50; input.jy = -dy / 50; joyKnob.style.left = p.ox + dx + 'px'; joyKnob.style.top = p.oy + dy + 'px'; }
    else { const k = e.pointerType === 'touch' ? 0.008 : 0.005; St.yaw -= (e.clientX - p.x) * k; St.pitch = clamp(St.pitch + (e.clientY - p.y) * k * 0.8, -0.35, 1.2); }
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
    move(dt);
    player.position.set(Pl.x, Pl.y + (extra === 'chair' ? 0 : 0.02), Pl.z); player.rotation.y = Pl.face;
    animFox(player, dt, Pl.speed / FOX_SCALE * 0.6, !Pl.ground);
    if (!DBG.freeCam) updateCamera(dt);
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
      if (wing && Pl.y < -100) wing.load();
      for (const sg of signs) { const d = sg.ctr.distanceTo(p); if (d < NEAR) showSign(sg); else if (d > FAR) hideSign(sg); }
      // which video zone are we in?
      let zUrl = null; const pp = new THREE.Vector3(Pl.x, Pl.y + 0.5, Pl.z);
      for (const v of vids) if (v.zone && v.zone.containsPoint(pp)) { zUrl = v.u; break; }
      playUrl(zUrl);
      if (zUrl) { let dmin = 1e9; for (const v of vids) if (v.u === zUrl) dmin = Math.min(dmin, v.box.position.distanceTo(pp)); const vv = vids.find(v => v.u === zUrl); video.volume = clamp((vv.vol ?? 0.8) * (1 - dmin / (vv.dist || 20)), 0, 1); }
      const n = nearest(); const key = n ? n.kind + n.label : null; if (key !== nearKey) { nearKey = key; onNear(n); }
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
    jump() { input.jump = 1; },
    setRun(v) { input.run = v ? 1 : 0; },
    respawn,
    goWing() { const d = doors.find(x => x.wing); if (d) travel(d); },
    debug: { THREE, DBG, Pl, St, input, scene, camera, renderer, vids, signs, teleport(x, y, z, face) { Pl.x = x; Pl.z = z; Pl.y = y ?? groundAt(x, 30, z); Pl.vy = 0; if (face != null) { Pl.face = face; St.yaw = face + Math.PI; } }, groundAt, cast, info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, tex: renderer.info.memory.textures, geo: renderer.info.memory.geometries }) },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', onKeyDown); removeEventListener('keyup', onKeyUp); if (hls) hls.destroy(); video.pause(); renderer.dispose(); el.remove(); joyBase.remove(); joyKnob.remove(); },
  };
}
