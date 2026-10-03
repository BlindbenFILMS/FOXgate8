// 8 GATES 3D · Blind Canvas Project gallery
// The building, signs, artworks, videos and learning panels come from Ben's PlayCanvas project
// (exported to gallery/gallery.glb + gallery/gallery.json by tools in g3d_checks). You walk it as a fox.
import * as THREE from '../vendor/three/three.module.js';
import { GLTFLoader } from '../vendor/three/addons/GLTFLoader.js';
import { MeshBVH } from '../vendor/three/three-mesh-bvh.js';
import { mergeGeometries } from '../vendor/three/addons/BufferGeometryUtils.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../fox-kit.js';
import { crestTex } from './textures.js';
import { buildGuides } from './gallery-guides.js';
import { buildWorld } from './gallery-world.js';
import { GARDEN, RING, planGarden } from './gallery-garden-plan.js';
import { makePlant, makeBench } from './gallery-props.js';
import { caneKit, loadCane, CANE_DEFAULTS } from './avatars/cane.js';
import { chairKit, loadChair, CHAIR_DEFAULTS } from './avatars/chair.js';
import { artAnimator } from './gallery-anim.js';
import { buildVisionSpots, visionOverlay } from './gallery-vision.js';
import { buildSimWalls } from './gallery-simwall.js';
import { makeWood, woodify, isWhiteFloorMat, isPaletteMat, buildWing, buildDoor } from './gallery-wing.js';
import { buildKiosks, carveWorld, carved, buildEntrance, buildRooms, canvasBox, cardTexture } from './gallery-remodel.js';

const BASE = 'gallery/';
const SPAWN = { x: 3.6, y: 0.5, z: 0, face: -Math.PI / 2 };

export async function createGallery({ container, onProgress = () => {}, onNear = () => {}, onZone = () => {}, onSplash = () => {} }) {
  const lowEnd = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const NOWORLD = new URLSearchParams(location.search).has('noworld');   // (testing) the museum without the lake, flags and city
  const renderer = new THREE.WebGLRenderer({ antialias: !lowEnd || devicePixelRatio < 2, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowEnd ? 1.5 : 2));
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  renderer.setSize(W(), H());
  const scene = new THREE.Scene();
  // draw-call saver: a mesh with a material array draws once per geometry group (a box = 6). Join neighbouring groups that use
  // the same material object, and point every face at the first copy, so a canvas or screen box draws 2-3 times, not 6.
  function compactGroups(mesh) {
    if (!mesh || !mesh.isMesh || !Array.isArray(mesh.material) || mesh.userData.compact) return;
    const g = mesh.geometry, mats = mesh.material; if (!g.groups || g.groups.length < 2) return;
    const first = mats.map((m, i) => mats.indexOf(m)), out = [];
    const sorted = g.groups.map(gr => ({ start: gr.start, count: gr.count, mi: first[gr.materialIndex] })).sort((a, b) => a.start - b.start);
    for (const gr of sorted) { const L = out[out.length - 1]; if (L && L.mi === gr.mi && L.start + L.count === gr.start) L.count += gr.count; else out.push({ ...gr }); }
    // a box's faces are px,nx,py,ny,pz,nz: same-material faces that aren't neighbours can be joined by reordering the index
    if (g.index && out.length > new Set(out.map(o => o.mi)).size) {
      const idx = g.index.array, order = [...new Set(sorted.map(o => o.mi))], parts = []; let start = 0; const ng = [];
      for (const mi of order) { let n = 0; for (const gr of sorted) if (gr.mi === mi) { parts.push(idx.slice(gr.start, gr.start + gr.count)); n += gr.count; } ng.push({ start, count: n, mi }); start += n; }
      const merged = new idx.constructor(idx.length); let o = 0; for (const p of parts) { merged.set(p, o); o += p.length; }
      g.setIndex(new THREE.BufferAttribute(merged, 1)); out.length = 0; out.push(...ng);
    }
    g.clearGroups(); for (const o of out) g.addGroup(o.start, o.count, o.mi); mesh.userData.compact = true;
  }
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
      n.name = m.name || '';   // kept so add-ons can find things (the park's tree cards)
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
  const wing = data.wing ? buildWing({ scene, wing: data.wing, O: WING_O, rotY: Math.PI / 2, doorW: 8.4, wood, resolveImg: RES, L: 124, spacious: true }) : null;
  const doors = [];
  if (wing) for (const m of wing.col) { const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld); colGeos.push(g); }
  const entrance = buildEntrance({ scene, wood });
  const glbRay = new THREE.Raycaster(), DOWN = new THREE.Vector3(0, -1, 0);
  const kiosks = buildKiosks({ scene, groundAt: (x, y, z) => { glbRay.set(new THREE.Vector3(x, y, z), DOWN); glbRay.far = 30; const h = glbRay.intersectObject(world, true)[0]; return h ? h.point.y : -1e9; } });
  const rooms = buildRooms({ scene, data, wood, resolveImg: RES, buildWing });
  // the Six Views severity lecterns: solid, so you walk round them
  const simCol = (data.simKiosks || []).map(k => { const m = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, 0.9)); m.position.set(k.p[0], k.p[1] + 0.8, k.p[2]); m.rotation.y = k.face || 0; m.updateMatrixWorld(true); return m; });
  // invisible edges: the plaza's open side above the lake (the other sides have railings)
  // the cherry blossom garden east of the plaza: a lawn terrace level with the plaza, walled by hedges (invisible walls behind them)
  const edgeCol = [];
  if (!NOWORLD) {
    const B = (w, h, d, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d)); m.position.set(x, y, z); m.rotation.y = ry; m.updateMatrixWorld(true); edgeCol.push(m); };
    const G = GARDEN, gw = G.x1 - G.x0, gd = G.z1 - G.z0, gx = (G.x0 + G.x1) / 2;
    B(gw, 0.6, gd, gx, G.y - 0.3, 0);                                                      // the lawn
    B(gw, 3, 0.4, gx, 1.5, G.z1); B(gw, 3, 0.4, gx, 1.5, G.z0); B(0.4, 3, gd, G.x1, 1.5, 0);   // hedges: north, south, east
    const sl = G.z1 - G.plaza.z; B(0.4, 3, sl, G.x0, 1.5, G.plaza.z + sl / 2); B(0.4, 3, sl, G.x0, 1.5, -G.plaza.z - sl / 2);   // west, beside the lake
    const plan = planGarden();
    for (const [x, z] of plan.lanterns) B(0.7, 1.6, 0.7, x, 0.8, z);
    for (const [x, z, ry] of plan.benches) B(2.5, 0.6, 0.7, x, 0.3, z, ry);
    B(1.6, 3, 1.6, RING.x, 1.5, RING.z);                                                    // the big tree's trunk
    for (const z of [-7.04, 7.04]) B(0.5, 4.4, 0.5, 21, 2.2, z);                           // the name sign's posts
    for (const z of [-21, 21]) B(2.6, 1, 2.6, 40, 0.5, z);                                 // flag bases
  }
  // furnishings: plants at the plaza corners and the main hall entrance, benches on the plaza looking out over the lake
  const propCol = [];
  const propsG = new THREE.Group(); scene.add(propsG);
  const place = (p, x, z, ry = 0) => { const y = (() => { glbRay.set(new THREE.Vector3(x, 4, z), DOWN); glbRay.far = 12; const h = glbRay.intersectObject(world, true)[0]; return h ? h.point.y : 0; })(); p.group.position.set(x, y, z); p.group.rotation.y = ry; propsG.add(p.group); const cb = new THREE.Mesh(new THREE.BoxGeometry(...p.size)); cb.position.set(x, y + p.size[1] / 2, z); cb.rotation.y = ry; cb.updateMatrixWorld(true); propCol.push(cb); };
  for (const [x, z] of [[6.4, 12.4], [6.4, -12.4], [-12.2, 12.4], [-12.2, -12.4], [-76.4, 11.4], [-76.4, -11.4]]) place(makePlant(2.3), x, z);
  for (const z of [7.6, -7.6]) place(makeBench(2.8), 5.6, z, Math.PI / 2);
  // glass in the building's tall wall openings: you see out to the trees and the city, and can't walk out
  const winCol = [];
  {
    const glassM = new THREE.MeshBasicMaterial({ color: 0xcfe3ec, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
    const sheenTex = (() => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const c = cv.getContext('2d'); const g = c.createLinearGradient(0, 0, 64, 256); g.addColorStop(0, 'rgba(255,255,255,0.0)'); g.addColorStop(0.42, 'rgba(255,255,255,0.0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(0.56, 'rgba(255,255,255,0.0)'); g.addColorStop(0.7, 'rgba(255,255,255,0.18)'); g.addColorStop(0.74, 'rgba(255,255,255,0.0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); return new THREE.CanvasTexture(cv); })();
    const sheenM = new THREE.MeshBasicMaterial({ map: sheenTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    const frameM = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
    for (const w of data.windows || []) {
      const [xa, xb] = w.x, [ya, yb] = w.y, cx = (xa + xb) / 2, cy = (ya + yb) / 2, W = xb - xa, H = yb - ya;
      const g = new THREE.Group(); g.position.set(cx, cy, w.z); scene.add(g);
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(W, H), glassM); pane.renderOrder = 4; g.add(pane);
      const sh = new THREE.Mesh(new THREE.PlaneGeometry(W, H), sheenM); sh.position.z = 0.01; sh.renderOrder = 4; g.add(sh);
      for (let k = 1; k < Math.max(2, Math.round(H / 3.2)); k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, 0.08), frameM); b.position.y = -H / 2 + k * H / Math.max(2, Math.round(H / 3.2)); g.add(b); }   // slim transoms
      const c = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.2)); c.position.set(cx, cy, w.z); c.updateMatrixWorld(true); winCol.push(c);
    }
  }
  for (const m of [...entrance.col, ...rooms.col, ...kiosks.col, ...simCol, ...edgeCol, ...propCol, ...winCol]) { const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld); colGeos.push(g); }
  // one position-only collision mesh with a BVH (fast rays on phones)
  let total = 0; for (const g of colGeos) total += (g.index ? g.index.count : g.attributes.position.count);
  const P = new Float32Array(total * 3); let k = 0;
  for (const g of colGeos) { const pa = g.attributes.position, ix = g.index; const n = ix ? ix.count : pa.count; for (let i = 0; i < n; i++) { const j = ix ? ix.getX(i) : i; P[k++] = pa.getX(j); P[k++] = pa.getY(j); P[k++] = pa.getZ(j); } g.dispose(); }
  const colGeo = new THREE.BufferGeometry(); colGeo.setAttribute('position', new THREE.BufferAttribute(P, 3));
  // draw-call saver: inside each built group (rooms, the wing, the walkway, kiosks), merge still meshes that share a material
  function mergeStatic(root) {
    root.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), buckets = new Map(), m4 = new THREE.Matrix4();
    root.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || Array.isArray(o.material) || o.children.length || !o.visible || o.userData.dyn) return;
      const ga = o.geometry; if (!ga || !ga.attributes.position) return;
      const keys = ['position', 'normal', 'uv'].filter(k => ga.attributes[k]).join(',');
      const key = o.material.uuid + '|' + keys + '|' + o.renderOrder;
      if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push(o);
    });
    let saved = 0;
    for (const list of buckets.values()) {
      if (list.length < 2) continue;
      const geos = list.map(o => { const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k); g.applyMatrix4(m4.multiplyMatrices(inv, o.matrixWorld)); return g; });
      const merged = mergeGeometries(geos, false); geos.forEach(g => g.dispose()); if (!merged) continue;
      const mm = new THREE.Mesh(merged, list[0].material); mm.renderOrder = list[0].renderOrder; mm.matrixAutoUpdate = false; root.add(mm); mm.updateMatrix();
      for (const o of list) o.parent && o.parent.remove(o); saved += list.length - 1;
    }
    return saved;
  }
  { let saved = 0; for (const g of [entrance.group, kiosks.group, propsG, wing && wing.group, ...rooms.list.map(r => r.room.group)]) if (g) saved += mergeStatic(g); console.log('[perf] merged', saved, 'static meshes'); }
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
  // titles on the building's beams: white text on an ink plate with room around it (they used to be white-on-white and touch the edges)
  function plateSign(s) {
    const c = s.c.map(v => new THREE.Vector3(...v)), u = c[1].clone().sub(c[0]), v = c[3].clone().sub(c[0]); const boxW = u.length(); u.normalize(); v.normalize();
    const n = new THREE.Vector3().crossVectors(u, v).normalize(), ctr = c[0].clone().add(c[1]).add(c[2]).add(c[3]).multiplyScalar(0.25);
    const K = 220, fsM = Math.min(0.34, (s.fs || 48) * 0.0068), F = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
    const mc = document.createElement('canvas').getContext('2d'); mc.font = `800 ${fsM * K}px ${F}`;
    const maxW = (boxW - 0.6) * K; let lines = [s.s.toUpperCase()];
    if (mc.measureText(lines[0]).width > maxW && lines[0].includes(': ')) lines = lines[0].split(/:\s+/).map((l, i, a) => i < a.length - 1 ? l + ':' : l);
    else if (mc.measureText(lines[0]).width > maxW) { const words = lines[0].split(/\s+/); lines = ['']; for (const w of words) { const t = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + w : w; if (mc.measureText(t).width > maxW && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t; } }
    const tw = Math.max(...lines.map(l => mc.measureText(l).width)) / K, padX = 0.32, padY = 0.2, lh = fsM * 1.12;
    const W = tw + padX * 2, H = lines.length * lh + padY * 2;
    const cv = document.createElement('canvas'); cv.width = Math.round(W * K); cv.height = Math.round(H * K); const x = cv.getContext('2d');
    x.fillStyle = '#1d1c1b'; x.fillRect(0, 0, cv.width, cv.height); x.fillStyle = '#ec3013'; x.fillRect(0, 0, cv.width, Math.round(0.035 * K));
    x.fillStyle = '#ffffff'; x.font = `800 ${fsM * K}px ${F}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    lines.forEach((l, i) => x.fillText(l, cv.width / 2, (padY + lh * (i + 0.5)) * K + 0.02 * K));
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: t }));
    m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, v, n)); m.position.copy(ctr).addScaledVector(n, 0.03); m.renderOrder = 2;
    return m;
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
    if (s.k === 'c') { sg.mesh = canvasBox(s, texLoader); compactGroups(sg.mesh); scene.add(sg.mesh); return; }
    if (s.k === 't' && s.plate) { sg.mesh = plateSign(s); scene.add(sg.mesh); return; }
    if (s.k === 'l') { sg.mesh = new THREE.Mesh(quad(s.c), new THREE.MeshBasicMaterial({ map: cardTexture(s), polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })); sg.mesh.renderOrder = 2; scene.add(sg.mesh); return; }
    let mat;
    if (s.k === 't') mat = new THREE.MeshBasicMaterial({ map: textTexture(s), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, fog: true });
    else { mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(...s.col), transparent: true, opacity: s.op ?? 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }); if (s.img) texLoader.load(s.img, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; mat.map = t; mat.needsUpdate = true; if (!sg.mesh) t.dispose(); }); }
    sg.mesh = new THREE.Mesh(quad(s.c), mat); sg.mesh.renderOrder = s.k === 't' ? 3 : 2; scene.add(sg.mesh);
  }
  function hideSign(sg) { if (!sg.mesh) return; scene.remove(sg.mesh); sg.mesh.geometry.dispose(); for (const m of [].concat(sg.mesh.material)) { if (m.map) m.map.dispose(); if (m !== sideShared) m.dispose(); } sg.mesh = null; }
  const sideShared = null;
  const NEAR = lowEnd ? 75 : 115, FAR = NEAR + 30;   // load art well before it can be seen, so walls never fill in as you watch

  // ---------------------------------------------------------------- video screens (zone video: play while you stand in the room)
  // "Six Views": the vision-simulator room's two big screens show one film through six eye conditions, live (severity set from a kiosk)
  const simWallVids = data.vids.filter(v => v.simwall);
  data.vids = data.vids.filter(v => !v.simwall);
  const simwalls = simWallVids.length ? buildSimWalls({ scene, walls: simWallVids, src: BASE + 'video/sim_hero.mp4', kiosk: data.simKiosk, kiosks: data.simKiosks, zone: data.simZone }) : null;
  const vids = data.vids.map(v => {
    const posterMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    if (v.poster) texLoader.load(v.poster, t => { t.colorSpace = THREE.SRGBColorSpace; posterMat.map = t; posterMat.color.set(0xffffff); posterMat.needsUpdate = true; });
    const dark = new THREE.MeshBasicMaterial({ color: 0x151515 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.01, 1.01), [posterMat, posterMat, dark, dark, dark, dark]);
    box.position.set(...v.p); box.quaternion.set(...v.q); box.scale.set(...v.s); scene.add(box);
    const zone = v.tmin ? new THREE.Box3(new THREE.Vector3(...v.tmin), new THREE.Vector3(...v.tmax)).expandByScalar(0.6) : null;
    if (zone) { zone.min.y -= 1; zone.max.y += 2.6; }   // tall enough that steps, platforms and jumps don't drop you out of the room (which flicked the screen back to its poster)
    return { ...v, box, posterMat, zone };
  });
  if (wing) vids.push(...wing.screens);
  vids.push(...rooms.screens);
  for (const v of vids) compactGroups(v.box);   // a screen box draws 2 times, not 6   // a two-sided interview screen in the middle of each bay of the New Artists Wing
  // living paintings: the animated version of an artwork fades in over the still while you stand in front of it
  const ANIMS = new Set(data.anims || []);
  const animOf = k => { const b = k && k.split('/').pop().replace(/\.\w+$/, ''); return b && ANIMS.has(b) ? BASE + 'anim/' + b + '.mp4' : null; };
  const animItems = [];
  for (const sg of signs) if (sg.s.k === 'c') { const u = animOf(sg.s.key || sg.s.img); if (u) { const c = sg.s.c; animItems.push({ mesh: () => sg.mesh, w: Math.hypot(c[1][0] - c[0][0], c[1][1] - c[0][1], c[1][2] - c[0][2]), h: Math.hypot(c[3][0] - c[0][0], c[3][1] - c[0][1], c[3][2] - c[0][2]), url: u }); } }
  for (const cv of [...(wing ? wing.canvases : []), ...rooms.canvases]) { const u = animOf(cv.key); if (u) animItems.push({ mesh: () => cv.mesh, w: cv.w, h: cv.h, url: u }); }
  // the world outside: the lake under the bridge, flags, cherry trees and the city
  let outdoors = { update() {} }; if (!NOWORLD) try { outdoors = buildWorld({ scene, camera, renderer, resolveImg: RES, lowEnd, groundAt: (x, y, z) => { const h = cast(x, y + 0.55, z, 0, -1, 0, 40); return h ? h.point.y : -1e9; } }); } catch (e) { console.warn("outdoors", e); }
  const guides = buildGuides({ scene, guides: data.guides, groundAt: (x, y, z) => { const h = cast(x, y + 0.55, z, 0, -1, 0, 30); return h ? h.point.y : -1e9; } });
  // gallery lighting: a soft warm pool on the wall round every painting, from a small spotlight above it (drawn, no real lights)
  const spotTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d');
    const g = c.createRadialGradient(128, 70, 10, 128, 120, 150); g.addColorStop(0, 'rgba(255,236,205,0.95)'); g.addColorStop(0.45, 'rgba(255,226,190,0.45)'); g.addColorStop(1, 'rgba(255,220,180,0)');
    c.fillStyle = g; c.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(cv); return t; })();
  const spotMat = new THREE.MeshBasicMaterial({ map: spotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.32, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const fixGeo = new THREE.CylinderGeometry(0.07, 0.11, 0.26, 10); fixGeo.rotateX(0.7); const fixMat = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
  const spotItems = [];
  for (const sg of signs) if (sg.s.k === 'c') { const c = sg.s.c; spotItems.push({ mesh: () => sg.mesh, w: Math.hypot(c[1][0] - c[0][0], c[1][1] - c[0][1], c[1][2] - c[0][2]), h: Math.hypot(c[3][0] - c[0][0], c[3][1] - c[0][1], c[3][2] - c[0][2]) }); }
  for (const cv of [...(wing ? wing.canvases : []), ...rooms.canvases]) spotItems.push({ mesh: () => cv.mesh, w: cv.w, h: cv.h });
  // all the pools and fixtures are two instanced meshes (2 draw calls in total), placed when each painting streams in
  const poolGeo = new THREE.PlaneGeometry(1, 1), poolIM = new THREE.InstancedMesh(poolGeo, spotMat, Math.max(1, spotItems.length)), fixIM = new THREE.InstancedMesh(fixGeo, fixMat, Math.max(1, spotItems.length));
  poolIM.renderOrder = 1; poolIM.frustumCulled = fixIM.frustumCulled = false; scene.add(poolIM, fixIM);
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0), lm4 = new THREE.Matrix4(), om4 = new THREE.Matrix4();
  for (let i = 0; i < spotItems.length; i++) { poolIM.setMatrixAt(i, ZERO); fixIM.setMatrixAt(i, ZERO); }
  const shownIn = m => { for (let o = m; o; o = o.parent) if (!o.visible) return false; return !!m.parent; };
  function lightArt() {
    let dirty = false;
    spotItems.forEach((it, i) => {
      const m = it.mesh(), on = !!(m && shownIn(m));
      if (on === !!it.lit && (!on || it.litMesh === m)) return;
      it.lit = on; it.litMesh = m; dirty = true;
      if (!on) { poolIM.setMatrixAt(i, ZERO); fixIM.setMatrixAt(i, ZERO); return; }
      m.updateWorldMatrix(true, false);
      lm4.compose(new THREE.Vector3(0, 0.35, -0.03), new THREE.Quaternion(), new THREE.Vector3(it.w + 2.2, it.h + 2.4, 1)); poolIM.setMatrixAt(i, om4.multiplyMatrices(m.matrixWorld, lm4));
      lm4.makeTranslation(0, it.h / 2 + 1.25, 0.45); fixIM.setMatrixAt(i, om4.multiplyMatrices(m.matrixWorld, lm4));
    });
    if (dirty) { poolIM.instanceMatrix.needsUpdate = fixIM.instanceMatrix.needsUpdate = true; }
  }
  const animator = artAnimator({ items: animItems, maxActive: lowEnd ? 2 : 3 });
  const localFail = new Set();
  const video = document.createElement('video'); video.crossOrigin = 'anonymous'; video.playsInline = true; video.setAttribute('playsinline', ''); video.loop = true; video.muted = true; video.preload = 'auto';
  const vidTex = new THREE.VideoTexture(video); vidTex.colorSpace = THREE.SRGBColorSpace;
  const vidMat = new THREE.MeshBasicMaterial({ map: vidTex });
  let hls = null, curUrl = null, soundOK = false, vidFail = new Set();
  let pendingSeek = null;   // a watch party asked for a time before the film had loaded
  video.addEventListener('loadedmetadata', () => { if (pendingSeek && pendingSeek.u === curUrl) { try { video.currentTime = pendingSeek.t % (video.duration || 1e9); } catch (e) {} } pendingSeek = null; });
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
  function bakeLocal(root, extraKeep) {   // per animated joint: merge every still mesh beneath it (any depth) by material; outlines into one
    const P = root.userData.P || {}, keep = new Set([root, ...(extraKeep || [])]);
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

  // the museum avatars: the suited fox with a long white cane, or in a wheelchair (tuned rigs from the 8 GATES workshops).
  // The suit is open over an art shirt: Walk Through Fear on the front, the BCP logo across the back (and on the chair's backrest).
  const AVB = new URL('./avatars/', import.meta.url).href;
  const [caneCfg, chairCfg] = await Promise.all([loadCane(AVB).catch(() => CANE_DEFAULTS), loadChair(AVB).catch(() => CHAIR_DEFAULTS)]);
  const CK = caneKit({ THREE, M, toon }), HK = chairKit({ THREE, M, toon });
  const SUIT_BACK_ART = 'gallery/img/wix_curating_hope.webp';   // the art across the suit's back (the chair keeps the BCP logo on its backrest)
  const SUIT = { torso: ['#2a2e34', '#1a1d22', '#0c0e10'], outfit: 'suit', glasses: 'sun', crest: 'none', eyes: ['#3a3a44', '#3a3a44'], mood: 'happy' };
  function makeSuitFox(ex, st) {
    const chair = ex === 'chair';
    const f = makeFox({ key: 'suit-' + ex, ...SUIT, chair, look: { ...PLAYER_MALE, ...(PALETTES[st.pal | 0] || {}), tailSide: chair ? 1.75 : 1.15, tailLift: chair ? 0.6 : PLAYER_MALE.tailLift }, prints: { front: frontArt(DEFAULT_ART), frontW: 1.2, back: frontArt(SUIT_BACK_ART) } });
    if (chair && f.userData.P && f.userData.P.tail) { const t = f.userData.P.tail; t.position.x = 0.48; t.position.z = 0.05; t.position.y += 0.06; }   // in the chair the tail comes out at his side, over the wheel, not through the backrest
    if (ex === 'chair') f.userData.rig = HK.attach(f, { ...chairCfg, backLogo });
    else if (ex === 'cane') f.userData.rig = CK.attach(f, caneCfg);
    // merge the still parts (about 90 draw calls -> ~30): run the rig for a few test frames, keep every part it moves
    // (and every group, since rigs pose groups) as its own joint, and bake the rest beneath them
    try {
      const keep = new Set(), snap = new Map();
      f.traverse(o => { if (!o.isMesh) keep.add(o); o.updateMatrix(); snap.set(o, o.matrix.clone()); });
      for (const [dt, sp] of [[0.12, 0], [0.16, 1.4], [0.21, 2.6], [0.11, 0.8], [0.27, 3.5], [0.4, 0]]) animFox(f, dt, sp, false);
      f.traverse(o => { o.updateMatrix(); if (!o.matrix.equals(snap.get(o))) keep.add(o); });
      bakeLocal(f, keep);
    } catch (e) { console.warn('suit bake skipped', e); }
    f.scale.setScalar(FOX_SCALE); return f;
  }
  function makeVisitorFox(lk, ex, st = { pal: 0, art: DEFAULT_ART }) {   // every visitor wears the BCP tee
    if (lk === 'suit') { try { return makeSuitFox(ex, st); } catch (e) { console.warn('suit avatar failed, using the BCP tee', e); } }
    const opts = { torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', mood: 'warm', look: { ...(lk === 'female' ? PLAYER_FEMALE : PLAYER_MALE), ...(PALETTES[st.pal | 0] || {}), tailSide: 1.15 },   // tail swept to the side so the back print shows
      outfit: 'tee', prints: { front: frontArt(st.art), frontW: 1.45, back: backLogo }, gear: 'none', cane: ex === 'cane', glasses: ex === 'glasses' || ex === 'cane', chair: ex === 'chair' };
    let f;
    try { f = makeFox(opts); if (!f.userData.P || !f.userData.P.arms) throw new Error('no tee outfit'); }
    catch (e) { console.warn('fox-kit has no BCP tee (an older fox-kit.js?), using a plain outfit', e); f = makeFox({ ...opts, outfit: 'vest', prints: null, look: { ...opts.look, tailSide: 0 } }); }   // never let the fox stop the gallery loading
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
  // if the phone's graphics reset (WebGL context lost), reload and put the visitor back where they were
  {
    try { const r = JSON.parse(sessionStorage.getItem('8gates.gallery.resume') || 'null'); sessionStorage.removeItem('8gates.gallery.resume');
      if (r && Date.now() - r.t < 120000) { Pl.x = r.p[0]; Pl.y = r.p[1]; Pl.z = r.p[2]; Pl.face = r.p[3]; St.yaw = r.p[3] + Math.PI; } } catch (e) {}
    renderer.domElement.addEventListener('webglcontextlost', e => {
      e.preventDefault();
      try { sessionStorage.setItem('8gates.gallery.resume', JSON.stringify({ t: Date.now(), p: [Pl.x, Pl.y + 0.3, Pl.z, Pl.face] })); } catch (err) {}
      const m = document.createElement('div'); m.style.cssText = 'position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:#0b0a12;color:#f3f2f2;font:800 18px Archivo,Arimo,sans-serif;text-align:center;padding:24px';
      m.textContent = 'The graphics needed a quick reset. Bringing you back to where you were…'; document.body.appendChild(m);
      setTimeout(() => location.reload(), 1200);
    }, false);
  }
  const input = { f: 0, b: 0, l: 0, r: 0, run: 0, jx: 0, jy: 0, jump: 0 };

  function groundAt(x, y, z) { const h = cast(x, y + 0.55, z, 0, -1, 0, 30); return h ? h.point.y : -1e9; }
  { const gy = groundAt(Pl.x, 1.5, Pl.z); if (gy > -100) Pl.y = gy; }

  const tmp = new THREE.Vector3();
  // ---------------------------------------------------------------- follow a friend (tours): walk the breadcrumb trail of their positions
  const F = { id: null, crumbs: [], best: 1e9, stuckT: 0, onEnd: null };
  const nearProviders = [], tickers = [];
  function placeNear(r, slot) {
    // behind them, or (slot n, when the host gathers everyone) round them in a ring; the first clear spot with floor wins
    const tries = slot == null ? [[r.tface + Math.PI, 1.6]] : [0, 1, 2, 3, 4, 5].map(k => [r.tface + 0.9 + (slot + k) * 2.39996, 2.2 + ((slot + k) % 3) * 0.7]);
    tries.push([r.tface + Math.PI, 1.2]);
    let bx = r.tx + 0.3, bz = r.tz + 0.3;
    for (const [a, rad] of tries) { const x = r.tx + Math.sin(a) * rad, z = r.tz + Math.cos(a) * rad; if (!cast(r.tx, r.ty + 0.9, r.tz, Math.sin(a), 0, Math.cos(a), rad + 0.4) && groundAt(x, r.ty + 1, z) > r.ty - 0.6) { bx = x; bz = z; break; } }
    Pl.x = bx; Pl.z = bz; Pl.y = r.ty + 0.05; Pl.vy = 0; Pl.face = slot == null ? r.tface : Math.atan2(r.tx - bx, r.tz - bz); St.yaw = Pl.face + Math.PI; St.camDist = 1; streamT = 0;
    fadeEl.style.opacity = 1; setTimeout(() => fadeEl.style.opacity = 0, 160);
  }
  function followStart(id, onEnd) { const r = remotes.get(id); if (!r || !r.placed) return false; if (F.id) followStop('switch'); F.id = id; F.crumbs = []; F.best = 1e9; F.stuckT = 0; F.onEnd = onEnd || null; if (Math.hypot(r.tx - Pl.x, r.tz - Pl.z) > 25 || Math.abs(r.ty - Pl.y) > 3) placeNear(r); return true; }
  function followStop(why) { if (!F.id) return; const cb = F.onEnd; F.id = null; F.crumbs = []; F.onEnd = null; if (cb) cb(why); }
  function followRecord() {
    const r = remotes.get(F.id); if (!r) { followStop('left'); return; }
    const L = F.crumbs[F.crumbs.length - 1];
    if (!L || Math.hypot(r.tx - L[0], r.tz - L[2]) > 0.7 || Math.abs(r.ty - L[1]) > 0.8) { if (L && Math.hypot(r.tx - L[0], r.tz - L[2]) > 10) F.crumbs = []; F.crumbs.push([r.tx, r.ty, r.tz]); if (F.crumbs.length > 400) F.crumbs.shift(); }
  }
  function followAuto(dt) {
    const r = remotes.get(F.id); if (!r) { followStop('left'); return null; }
    const dl = Math.hypot(r.tx - Pl.x, r.tz - Pl.z);
    if (dl > 30 || (dl > 4 && !F.crumbs.length)) { placeNear(r); F.crumbs = []; return null; }   // they went through a door, or we fell far behind
    if (dl < 2.2 && Math.abs(r.ty - Pl.y) < 1.5) { F.crumbs = []; F.best = 1e9; F.stuckT = 0; return null; }  // close enough: wait beside them
    while (F.crumbs.length && Math.hypot(F.crumbs[0][0] - Pl.x, F.crumbs[0][2] - Pl.z) < 0.6) { F.crumbs.shift(); F.best = 1e9; F.stuckT = 0; }
    const c = F.crumbs[0] || [r.tx, r.ty, r.tz], d = Math.hypot(c[0] - Pl.x, c[2] - Pl.z) || 1;
    if (d < F.best - 0.15) { F.best = d; F.stuckT = 0; }
    else if ((F.stuckT += dt) > 2) { Pl.x = c[0]; Pl.y = c[1] + 0.05; Pl.z = c[2]; Pl.vy = 0; F.crumbs.shift(); F.best = 1e9; F.stuckT = 0; return null; }   // stuck on something: hop to the trail
    return { ux: (c[0] - Pl.x) / d, uz: (c[2] - Pl.z) / d, run: dl > 5 };
  }

  function move(dt) {
    // camera-relative input
    let ix = input.jx + (input.r - input.l), iz = input.jy + (input.f - input.b);
    const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
    let mag = Math.min(1, il);
    let run = input.run || mag > 0.92;
    let sp = (run ? 6.2 : 3.4) * mag * (extra === 'chair' ? 0.95 : 1);
    const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw);   // camera forward on the ground
    let dx = (fx * iz + -fz * ix) * sp * dt, dz = (fz * iz + fx * ix) * sp * dt;
    // following a friend: walk their path behind them; moving yourself stops it
    if (F.id) {
      if (mag > 0.05) followStop('moved');
      else { const a = followAuto(dt); if (a) { mag = 1; run = a.run; sp = (run ? 6.2 : 3.4) * (extra === 'chair' ? 0.95 : 1); dx = a.ux * sp * dt; dz = a.uz * sp * dt; } }
    }
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
    // in the lake (jumped off a rail, or squeezed past one): no swimming, back to the plaza
    if (!NOWORLD && Pl.y < -2.6 && Pl.x > -43 && Pl.x < GARDEN.x0 + 0.5 && !(Math.abs(Pl.z) < 3.6 && Pl.x < -12)) { respawn(); onSplash(); }
    Pl.speed = Math.hypot(dx, dz) / Math.max(dt, 1e-4) + (mag > 0.05 ? sp * 0.3 : 0);
  }
  // ---------------------------------------------------------------- "See through their eyes": two floor spots in the main hall (between Ben's and April & Melissa's screens)
  const vSpots = buildVisionSpots({ scene, groundAt, spots: [
    { x: -97.8, y: -3.3, z: 0, cond: 'rp', textYaw: Math.PI / 2, look: [-117.6, 0.16, -0.18], signSide: 1 },             // main hall, centred, back by the big screen
    { x: -88.7, y: -3.3, z: 0, cond: 'cataracts', textYaw: Math.PI / 2, look: [-117.6, 0.16, -0.18], signSide: -1 },      // main hall, centred, toward the entrance
    { x: -2.5, y: 0.5, z: 0, cond: 'glaucoma', textYaw: Math.PI / 2, look: [-30, 2.5, 0], signSide: 1 },                 // welcome platform, looking down the walkway
    { x: -70.25, y: -2.5, z: -65.7, cond: 'amd', textYaw: Math.PI, look: [-70.25, 0.4, -73.7] },                        // AMB room, facing the film wall
    { x: -69.9, y: -2.5, z: 114, cond: 'floaters', textYaw: 0, look: [-69.9, 0.5, 146] },                                // New Artists Wing
    { x: -224, y: -2.5, z: 0, cond: 'cataracts', textYaw: Math.PI / 2, look: [-205, -1, 0] },                            // music room, back area
    { x: -258, y: -2.5, z: 2, cond: 'glaucoma', textYaw: 0, look: [-261.5, -1.0, 29.2] },                               // meditation area, facing Morten
  ] });
  if (vSpots.signGroup) mergeStatic(vSpots.signGroup);   // 8 pole signs: a handful of draws in all
  const V = { spot: null, py: 0, pp: 0, pts: [], gi: 0, gt: 0, from: null };
  const vOverlay = visionOverlay({ container, onExit: () => exitVision(), onGuided: on => { if (on) { V.gt = 0; V.from = [St.yaw, St.pitch]; } } });
  const lookAngles = (from, to) => { const v = to.clone().sub(from).normalize(); return [Math.atan2(-v.x, -v.z), Math.asin(clamp(-v.y, -1, 1))]; };
  function enterVision(spot) {
    V.spot = spot; joyBase.style.display = joyKnob.style.display = 'none'; Pl.x = spot.x; Pl.z = spot.z; Pl.y = spot.y; Pl.vy = 0; Pl.speed = 0; for (const k in input) input[k] = 0;
    const eye = new THREE.Vector3(spot.x, spot.y + 1.55, spot.z);
    const screen = new THREE.Vector3(...(spot.look || (data.vids[3] && data.vids[3].p) || [-117.6, 0.16, -0.18]));
    [St.yaw, St.pitch] = lookAngles(eye, screen); Pl.face = St.yaw + Math.PI; V.py = St.yaw; V.pp = St.pitch;
    // guided look: the big screen, then the paintings you can actually see from here, in a sweep round the room
    const seen = [];
    for (const sg of signs) if (sg.s.k === 'c') { const d = sg.ctr.distanceTo(eye); if (d > 34) continue; const dir = sg.ctr.clone().sub(eye).normalize(); const h = cast(eye.x, eye.y, eye.z, dir.x, dir.y, dir.z, d); if (!h || h.distance > d - 0.6) seen.push(sg.ctr.clone()); }
    seen.sort((a, b) => Math.atan2(a.z - eye.z, -(a.x - eye.x)) - Math.atan2(b.z - eye.z, -(b.x - eye.x)));
    V.pts = [screen, ...seen.filter((_, i) => i % Math.max(1, Math.ceil(seen.length / 6)) === 0)].map(p => lookAngles(eye, p));
    V.gi = 0; V.gt = 0; V.from = [St.yaw, St.pitch];
    vOverlay.open(spot.cond); onNear(null); nearKey = 'vision-locked';
  }
  function exitVision() { if (!V.spot) return; const sp = V.spot; V.spot = null; vOverlay.close(); joyRest(); St.pitch = 0.28; St.camDist = 1.2; Pl.x = sp.x + 1.6; nearKey = null; }
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

      // through the fox's own eyes
      const cp = Math.cos(St.pitch), dir = new THREE.Vector3(Math.sin(St.yaw) * cp, Math.sin(St.pitch), Math.cos(St.yaw) * cp);
      const eye = new THREE.Vector3(Pl.x, Pl.y + 1.55, Pl.z); camera.position.copy(eye); camera.lookAt(eye.clone().sub(dir)); player.visible = false; Pl.face = St.yaw + Math.PI;
    }
    { let dyw = St.yaw - V.py; dyw = Math.atan2(Math.sin(dyw), Math.cos(dyw)); yr = dyw / Math.max(dt, 1e-3); pr = (St.pitch - V.pp) / Math.max(dt, 1e-3); V.py = St.yaw; V.pp = St.pitch; }   // how fast the view turns (eyes lead, floaters lag)
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
  joyBase.style.cssText = 'position:absolute;width:112px;height:112px;border:2px solid #f3f2f2;background:rgba(32,30,29,.25);transform:translate(-50%,-50%);display:none;pointer-events:none;z-index:5;transition:opacity .2s;';
  joyKnob.style.cssText = 'position:absolute;width:44px;height:44px;background:#ec3013;transform:translate(-50%,-50%);display:none;pointer-events:none;z-index:5;transition:opacity .2s;';
  container.append(joyBase, joyKnob);
  // on touch screens the joystick rests, faint, at the bottom left so players can see it's there; touching anywhere on the left half moves it under the thumb
  const joyRest = () => {
    if (!touchUI) { joyBase.style.display = joyKnob.style.display = 'none'; return; }
    const r = el.getBoundingClientRect(), x = 26 + 56 + 'px', y = r.height - 56 - Math.max(30, r.height * 0.06) + 'px';
    joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.opacity = '0.55'; joyKnob.style.opacity = '0.7';
    joyBase.style.left = joyKnob.style.left = x; joyBase.style.top = joyKnob.style.top = y;
  };
  const ptrs = new Map();
  el.addEventListener('pointerdown', e => {
    const r = el.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top;
    const joy = !V.spot && e.pointerType !== 'mouse' && touchUI && lx < r.width * 0.45 && ![...ptrs.values()].some(p => p.joy);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, ox: lx, oy: ly, joy });
    if (joy) { joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.opacity = joyKnob.style.opacity = '1'; joyBase.style.left = joyKnob.style.left = lx + 'px'; joyBase.style.top = joyKnob.style.top = ly + 'px'; }
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
  });
  el.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    if (p.joy) { const r = el.getBoundingClientRect(); let dx = e.clientX - r.left - p.ox, dy = e.clientY - r.top - p.oy; const l = Math.hypot(dx, dy); if (l > JR) { dx *= JR / l; dy *= JR / l; } input.jx = dx / JR; input.jy = -dy / JR; joyKnob.style.left = p.ox + dx + 'px'; joyKnob.style.top = p.oy + dy + 'px'; }
    else { St.lastLook = performance.now(); const k = e.pointerType === 'touch' ? 0.008 : 0.005; St.yaw -= (e.clientX - p.x) * k; St.pitch = clamp(St.pitch + (e.clientY - p.y) * k * 0.8, -0.35, 1.2); }
    p.x = e.clientX; p.y = e.clientY;
  });
  const endPtr = e => { const p = ptrs.get(e.pointerId); if (p && p.joy) { input.jx = input.jy = 0; joyRest(); } ptrs.delete(e.pointerId); };
  el.addEventListener('pointerup', endPtr); el.addEventListener('pointercancel', endPtr);
  el.addEventListener('wheel', e => { St.dist = clamp(St.dist + e.deltaY * 0.004, 1.6, 9); e.preventDefault(); }, { passive: false });

  // ---------------------------------------------------------------- loop
  let firstStream = true; let raf = 0, last = performance.now(), streamT = 0, nearKey = null, zoneT = 0;
  const fit = () => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.fov = camera.aspect < 1 ? 70 : 60; camera.updateProjectionMatrix(); St.dist = camera.aspect < 1 ? 5.2 : 4.2; };
  const ro = new ResizeObserver(() => { fit(); if (![...ptrs.values()].some(p => p.joy)) joyRest(); }); ro.observe(container); fit(); joyRest();
  function nearest() {
    const p = new THREE.Vector3(Pl.x, Pl.y + 1.2, Pl.z); let best = null, bd = 1e9;
    if (V.spot) return null;
    if (simwalls && simwalls.kioskPositions.some(k => Math.hypot(Pl.x - k.x, Pl.z - k.z) < 2.6 && Math.abs(Pl.y - k.y) < 2)) return { kind: 'simctl', item: simwalls, label: 'Change the wall severity' };
    for (const sp of vSpots) if (Math.hypot(Pl.x - sp.x, Pl.z - sp.z) < sp.r + 0.15 && Math.abs(Pl.y - sp.y) < 1.2) return { kind: 'vision', item: sp, label: 'See through their eyes' };
    for (const sp of vSpots) if (sp.signPos && Math.hypot(Pl.x - sp.signPos.x, Pl.z - sp.signPos.z) < 1.6 && Math.abs(Pl.y - sp.y) < 1.2) return { kind: 'vision', item: sp, label: 'See through their eyes' };
    for (const f of nearProviders) { const n = f(Pl); if (n) return n; }   // add-ons: the guest book, visitors' notes
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
  const Q = { max: renderer.getPixelRatio(), pr: renderer.getPixelRatio(), t: 0, n: 0 };
  function tick(now) {
    raf = requestAnimationFrame(tick);
    const rawDt = (now - last) / 1000, dt = Math.min(0.05, rawDt); last = now;
    // adaptive resolution: if frames run slow for a few seconds, render fewer pixels (down to 1x); speed back up when smooth
    if (rawDt < 0.5) { Q.t += rawDt; Q.n++; if (Q.t > 2.5) { const ms = Q.t / Q.n * 1000; Q.t = Q.n = 0;
      if (ms > 30 && Q.pr > 1) { Q.pr = Math.max(1, Q.pr - 0.25); renderer.setPixelRatio(Q.pr); renderer.setSize(W(), H()); }
      else if (ms < 17 && Q.pr < Q.max) { Q.pr = Math.min(Q.max, Q.pr + 0.25); renderer.setPixelRatio(Q.pr); renderer.setSize(W(), H()); } } }
    if (!V.spot) move(dt);
    player.position.set(Pl.x, Pl.y + (extra === 'chair' ? 0 : 0.02), Pl.z); player.rotation.y = Pl.face;
    animFox(player, dt, Pl.speed / FOX_SCALE * 0.6, !Pl.ground);
    updateRemotes(dt);
    if (F.id) followRecord();
    for (const f of tickers) f(dt);
    animator.update(dt, Pl.x, Pl.y, Pl.z);
    if (simwalls) simwalls.update(dt, Pl.x, Pl.y, Pl.z);
    guides.update(dt, Pl.x, Pl.z);
    outdoors.update(dt);
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
      streamT = 0.25; const p = new THREE.Vector3(Pl.x, Pl.y, Pl.z);
      if (wing) { const inWing = wing.bounds.containsPoint(p); if (inWing !== St.inWing) { St.inWing = inWing; onZone(inWing ? 'New Artists Wing' : 'The Gallery'); } if (Math.hypot(Pl.x - WING_O.x, Pl.z - WING_O.z) < 110) wing.load(); }
      for (const r of rooms.list) if (Math.hypot(Pl.x - r.O.x, Pl.z - r.O.z) < 90) r.room.load();
      // rooms behind walls still draw (the camera doesn't know about walls): hide a room's whole group unless you're close to it
      { const pp2 = new THREE.Vector3(Pl.x, Pl.y + 1, Pl.z); for (const r of rooms.list) r.room.group.visible = r.room.bounds.distanceToPoint(pp2) < 50; if (wing) wing.group.visible = wing.bounds.distanceToPoint(pp2) < 50; }
      // nearest first, a few per tick (no hitch), far enough out that it all arrives before you can see it
      const want = []; for (const sg of signs) { const d = sg.ctr.distanceTo(p); if (d < NEAR) { if (!sg.mesh) want.push([d, sg]); else sg.mesh.visible = d < ((sg.s.k === 't' || sg.s.k === 'l') ? 38 : 70); } else if (d > FAR) hideSign(sg); }   // loaded far out (no pop-in of images), but only drawn when close enough to matter: labels 38 m, art 70 m
      want.sort((a, b) => a[0] - b[0]); for (const [, sg] of want.slice(0, firstStream ? 60 : 14)) showSign(sg); firstStream = false;
      lightArt();
      // which video zone are we in?
      let zUrl = null; const pp = new THREE.Vector3(Pl.x, Pl.y + 0.5, Pl.z);
      for (const v of vids) if ((v.zone && v.zone.containsPoint(pp)) || (v.zones && v.zones.some(z => z.containsPoint(pp)))) { zUrl = v.u; break; }
      playUrl(zUrl);
      if (zUrl) { let dmin = 1e9; for (const v of vids) if (v.u === zUrl) dmin = Math.min(dmin, (v.wp ||= v.box.getWorldPosition(new THREE.Vector3())).distanceTo(pp)); const vv = vids.find(v => v.u === zUrl); const zs = vv.zone ? vv.zone.getSize(new THREE.Vector3()) : null, reach = vv.reach || Math.max(vv.dist || 20, zs ? Math.hypot(zs.x, zs.z) * 1.1 : 0); video.volume = clamp((vv.vol ?? 0.8) * Math.max(vv.minVol ?? 0.45, 1 - dmin / reach), 0, 1); }   // never silent while you're in the zone
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
    arts, edu, notesConfig: data.notes || null,
    setLook(l, x) { look = l || look; extra = x || 'none'; buildPlayer(); },
    // multiplayer hooks (the page wires these to engine/gallery-net.js)
    localState: () => [+Pl.x.toFixed(2), +Pl.y.toFixed(2), +Pl.z.toFixed(2), +Pl.face.toFixed(2), +Math.min(9, Pl.speed).toFixed(1), Pl.ground ? 0 : 1],
    remote: { upsert: remoteUpsert, remove: remoteRemove, count: () => remotes.size, names: () => [...remotes.values()].map(r => r.prof.name), list: () => [...remotes.values()].map(r => ({ id: r.id, name: r.prof.name || 'Visitor', placed: r.placed, x: r.tx, y: r.ty, z: r.tz })), wave: id => { const r = remotes.get(id); if (r && r.fox) showWave(r.fox); } },
    wave() { showWave(player); },
    style: () => ({ ...style }),
    setStyle(st) { style = { pal: st.pal | 0, art: st.art || DEFAULT_ART }; buildPlayer(); },
    randomStyle,
    jump() { input.jump = 1; },
    setRun(v) { input.run = v ? 1 : 0; },
    respawn,
    setNight: v => outdoors.setNight && outdoors.setNight(v), isNight: () => !!(outdoors.isNight && outdoors.isNight()),
    simwall: () => simwalls,
    // visiting together: follow / go to a friend, and the zone film for watch parties
    follow: (id, onEnd) => followStart(id, onEnd), unfollow: () => followStop('stopped'), following: () => F.id,
    goTo(id, slot) { const r = remotes.get(id); if (!r || !r.placed) return false; if (V.spot) exitVision(); if (F.id) followStop('gathered'); placeNear(r, slot); return true; },
    film: {
      url: () => curUrl, time: () => video.currentTime || 0, ready: () => video.readyState >= 1, local: u => { const v = vids.find(v => v.u === u); return (v && v.local) || u; },
      seek(u, t) { if (u !== curUrl) return false; if (video.readyState >= 1) { try { video.currentTime = t % (video.duration || 1e9); } catch (e) {} } else pendingSeek = { u, t }; if (video.paused) video.play().catch(() => {}); return true; },
    },
    vision: { enter: sp => enterVision(sp), exit: () => exitVision(), locked: () => !!V.spot, spots: vSpots, overlay: vOverlay },
    unlockAudio() { unlockSound(); },
    goWing() { const d = doors.find(x => x.wing); if (d) travel(d); },
    // add-ons (notes, guest book): draw into the scene, add things you can walk up to, run each frame
    world: { THREE, scene, camera, groundAt: (x, y, z) => groundAt(x, y, z), pos: () => [Pl.x, Pl.y, Pl.z], addNear: f => nearProviders.push(f), onTick: f => tickers.push(f), refreshNear: () => { nearKey = null; } },
    debug: { nearest: () => nearest(), guides, THREE, DBG, video, animator, Pl, St, input, scene, camera, renderer, vids, signs, teleport(x, y, z, face) { Pl.x = x; Pl.z = z; Pl.y = y ?? groundAt(x, 30, z); Pl.vy = 0; if (face != null) { Pl.face = face; St.yaw = face + Math.PI; } }, groundAt, cast, info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, tex: renderer.info.memory.textures, geo: renderer.info.memory.geometries }) },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', onKeyDown); removeEventListener('keyup', onKeyUp); if (hls) hls.destroy(); video.pause(); renderer.dispose(); el.remove(); joyBase.remove(); joyKnob.remove(); },
  };
}
