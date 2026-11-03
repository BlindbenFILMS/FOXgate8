// MERU 2.0 — step 1b BLOCKOUT. Builds the whole 900 m map in 3D straight from worlds/meru2-layout.js:
// painted ground (surfaces, roads, train line), the lake + Pearl Island (hills, valley, deep pond), every building as a block with
// a gold-framed door + NOW HIRING sign, the train track + stations, a skyline of glass towers, lamps along the foot paths, speakers
// with their 7 m voice triggers, zone labels. Orbit camera (drag / pinch / wheel), fly-to zones, day / night. Phone budget: one ground
// texture, instanced lamps + towers, ~200 draw calls.
import { keepClear, keepClearRects } from './meru2-townnet.js';
import * as THREE from '../vendor/three/three.module.js';
import * as L from './meru2-layout.js';
import { buildCity } from './meru2-city.js?v=s727c';
import { buildTrain } from './meru2-train.js?v=s713';
import { buildHeights } from './meru2-heights.js?v=s727';
import { paintDesert, paintLinks } from './meru2-roads3.js';
import { buildPaths } from './meru2-paths.js';
import { buildSigns } from './meru2-signs.js';
import { buildNature } from './meru2-nature.js?v=s731e';
import { rangerGrassOff } from './meru2-ranger.js';
import { buildDistricts } from './meru2-districts.js?v=s727d';
import { buildBreeze } from './meru2-breeze.js';
import { buildMist } from './meru2-mist.js';
import { buildTownGround, paintTownPaving } from './meru2-ground.js';
import { buildMarket } from './meru2-market.js';
import { buildGardens } from './meru2-gardens.js';
import { buildParade, paintParade } from './meru2-parade.js';
import { buildArenaRoad } from './meru2-arenaroad.js';
import { buildArena } from './meru2-arena.js';
import { buildAviary } from './meru2-aviary.js';
import { buildTown2 } from './meru2-town2.js';
import { buildLakeShore } from './meru2-lakeshore.js';
import { buildPlazaDress } from './meru2-plazadress.js';
import { buildHillsDress } from './meru2-hillsdress.js';
import { buildTrainSide } from './meru2-trainside.js';
const __TM = (n, f) => (...a) => { const t = performance.now(), done = () => { try { const ms = Math.round(performance.now() - t); (window.__loadTimes = window.__loadTimes || []).push([n, ms]); if (ms >= 40 && /[?&]loadlog=1/.test(location.search)) console.log('[load] ' + n + ' ' + ms + ' ms @' + Math.round(performance.now())); } catch (e) {} }; const r = f(...a); if (r && typeof r.then === 'function') return r.then(v => { done(); return v; }); done(); return r; };   // s651 LOAD STOPWATCH: window.__loadTimes = [[step, ms]] · window.__loadReport()

export async function createBlockout({ container, onState = () => {} }) {
  // PERF (Ben: "choppy, load things only in range"): every fox rig (NPCs, crowds, walkers, bowlers, game players) is ~150 meshes and
  // ~100 were drawn from anywhere (13k+ draw calls). FOX CULL, run last before each render: rescans for fox rigs every 4 s, hides any
  // farther than R from the camera, restores only the ones it hid (each system's own show / hide still works). Walk: phone 40 m,
  // desktop 65 m; overview: 110 m. userData.noCull opts out (the player).
  const FC = { list: [], hid: new Set(), scanT: -1e9, v: null };
  // PROP CULL (Ben: "optimise draw calls, especially phones"): every self-contained group under ~40 m across (booths, houses, path
  // props, rooms, statues…) is skipped by the camera when it is farther than R (phone 110 m, desktop 190 m; overview 2x). It uses
  // camera LAYERS, not .visible, so no system's own show / hide (night lights, interiors) is ever overridden. Big spread-out groups
  // (the city, terrain, water, skyline) are split one or two levels down; anything still huge is left alone (it is already merged).
  const PC = { list: [], scanT: -1e9, t: 0, box: null, sph: null };
  // STATIC BATCH (Ben: merge the festival booths + path props): ~4 s into the walk, every plain mesh under the festival, the four
  // paths and the hills is sampled twice 5 s apart; the ones that never moved, are visible, use one plain material and no custom
  // shader are merged into ONE mesh per material per 50 m cell (moving rides, night-only lights, foxes, instanced things are left
  // alone). The cells are small enough for the prop cull to skip far ones.
  const SB = { phase: 0, t: 0, cands: null };
  function batchTick(now) { if (SB.phase === 2 || !foxCullWalk()) return; if (!SB.t) SB.t = now; const roots = ['meru2Festival', 'meru2Paths', 'meru2Heights'].map(n => foxCullScene.getObjectByName(n)).filter(Boolean);
    if (SB.phase === 0 && !roots.some(r => r.name === 'meru2Festival') && !window.__m2LateDone && now - SB.t < 90000) return;   // s729 the festival is built in the walk's late build now: batch it too, so wait for it (max 90 s)
    if (SB.phase === 0 && now - SB.t > 4000) { SB.phase = 1; SB.t = now; SB.cands = []; for (const r of roots) r.traverse(o => { if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || Array.isArray(o.material) || o.morphTargetInfluences) return;
        const m = o.material; if (!m || m.transparent || Object.prototype.hasOwnProperty.call(m, 'onBeforeCompile') || m.isShaderMaterial) return; for (let p = o; p && p !== r; p = p.parent) { if (!p.visible || (p.userData && p.userData.P)) return; }   // the root itself may be distance-hidden: that is fine
        o.updateWorldMatrix(true, false); let an = o.parent; while (an && an.isMesh) an = an.parent; SB.cands.push({ o, r, an, m: o.matrixWorld.clone(), rel: an.matrixWorld.clone().invert().multiply(o.matrixWorld) }); }); return; }
    if (SB.phase !== 1 || now - SB.t < 5000) return; SB.phase = 2;
    const groups = new Map(), V3 = foxCullCam.position.constructor;
    const local = new Map(), BAKED = new Map(), moved = [], byO = new Map(), relNow = c => { c.an.updateWorldMatrix(true, false); return c.an.matrixWorld.clone().invert().multiply(c.o.matrixWorld); }, same = (a, b) => { for (let i = 0; i < 16; i++) if (Math.abs(a.elements[i] - b.elements[i]) > 1e-5) return false; return true; };   // s32: meshes that ride a moving group (carousel horses, rides) merge per group + material in the group's space
    for (const c of SB.cands) byO.set(c.o, c);
    const qm = new Map(), q0 = c => { if (qm.has(c.o)) return qm.get(c.o); const o = c.o, m = o.material; let r = o.visible && c.an !== c.r && (m.side === 1 || (m.isMeshToonMaterial && !m.map)) && same(relNow(c), c.rel); if (r) for (const ch of o.children) { const cc = byO.get(ch); if (!cc || !q0(cc)) { r = false; break; } } qm.set(o, r); return r; },
      q = c => { let top = c.o; while (top.parent && top.parent.isMesh) top = top.parent; const tc = byO.get(top); if (!tc || !q0(tc)) return false; for (let p = c.an; p && p !== c.r; p = p.parent) if (!p.visible) return false; return true; };   // a mesh + its ink shells merge together or not at all
    for (const c of SB.cands) { const o = c.o; if (!o.parent) continue; o.updateWorldMatrix(true, false); if (!o.matrixWorld.equals(c.m)) { moved.push(c); continue; } let ok = true; for (let p = o; p && p !== c.r; p = p.parent) if (!p.visible) { ok = false; break; } if (!ok) continue;
      const e = o.matrixWorld.elements; let key = o.material.uuid + '|' + Math.floor(e[12] / 40) + ',' + Math.floor(e[14] / 40) + '|' + (o.castShadow ? 1 : 0);
      key += '|' + c.r.name; if (!groups.has(key)) groups.set(key, { root: c.r, mat: o.material, cast: o.castShadow, rec: o.receiveShadow, list: [] }); groups.get(key).list.push(o); }
    const holder = new foxCullScene.userData.GR(); holder.name = 'staticBatch';
    let merged = 0, made = 0;
    for (const G of groups.values()) { if (G.list.length < 2) continue; const needUV = !!(G.mat.map || G.mat.alphaMap), needCol = !!G.mat.vertexColors; let n = 0; const geos = [];
      for (const o of G.list) { const g0 = o.geometry; if (!g0.attributes.position || (needUV && !g0.attributes.uv) || (needCol && !g0.attributes.color)) continue; const g = (g0.index ? g0.toNonIndexed() : g0.clone()).applyMatrix4(o.matrixWorld); if (!g.attributes.normal) g.computeVertexNormals(); geos.push([o, g]); n += g.attributes.position.count; }
      if (geos.length < 2) continue; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = needUV ? new Float32Array(n * 2) : null, col = needCol ? new Float32Array(n * 3) : null; let k = 0;
      for (const [, g] of geos) { pos.set(g.attributes.position.array, k * 3); nor.set(g.attributes.normal.array, k * 3); if (uv) uv.set(g.attributes.uv.array, k * 2); if (col) col.set(g.attributes.color.array.length === g.attributes.position.count * 3 ? g.attributes.color.array : new Float32Array(g.attributes.position.count * 3).fill(1), k * 3); k += g.attributes.position.count; g.dispose(); }
      const BG = foxCullScene.userData.BG; const bg = new BG(); bg.setAttribute('position', new foxCullScene.userData.BA(pos, 3)); bg.setAttribute('normal', new foxCullScene.userData.BA(nor, 3)); if (uv) bg.setAttribute('uv', new foxCullScene.userData.BA(uv, 2)); if (col) bg.setAttribute('color', new foxCullScene.userData.BA(col, 3));
      const mesh = new foxCullScene.userData.ME(bg, G.mat); mesh.castShadow = G.cast; mesh.receiveShadow = G.rec; mesh.name = 'sbCell'; mesh.matrixAutoUpdate = false; const inv = G.root.matrixWorld.clone().invert(); mesh.matrix.copy(inv); mesh.matrixWorldNeedsUpdate = true; G.root.add(mesh); made++;
      for (const [o] of geos) { o.parent.remove(o); merged++; } }
    for (const c of moved) { if (!q(c)) continue; const o = c.o, m = o.material, bake = m.isMeshToonMaterial && !m.vertexColors && !m.transparent && (!m.emissive || m.emissive.getHex() === 0), sig = bake ? 'tb|' + m.side + '|' + (m.gradientMap ? m.gradientMap.uuid : '') + '|' + m.opacity : m.uuid, lk = c.an.uuid + '|' + sig + '|' + (o.castShadow ? 1 : 0);   // plain toon colours bake into vertex colours: one draw per moving group
      if (bake && !BAKED.has(sig)) { const U = foxCullScene.userData, bm = m.clone(); bm.color.set(0xffffff); bm.vertexColors = true; BAKED.set(sig, bm); }
      if (!local.has(lk)) local.set(lk, { par: c.an, mat: bake ? BAKED.get(sig) : m, bake, cast: o.castShadow, rec: o.receiveShadow, list: [] }); const L0 = local.get(lk); L0.list.push(o); o.userData.sbRel = c.rel; }
    for (const G of local.values()) { if (G.list.length < 2 && !G.list[0].children.length && G.list[0].parent === G.par) continue; const needCol = !!G.mat.vertexColors && !G.bake; let n = 0; const geos = [];
      for (const o of G.list) { const g0 = o.geometry; if (!g0.attributes.position || (needCol && !g0.attributes.color)) continue; const g = (g0.index ? g0.toNonIndexed() : g0.clone()).applyMatrix4(o.userData.sbRel); if (!g.attributes.normal) g.computeVertexNormals(); geos.push([o, g]); n += g.attributes.position.count; }
      if (!geos.length) continue; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let col = needCol ? new Float32Array(n * 3) : null, k = 0;
      for (const [, g] of geos) { pos.set(g.attributes.position.array, k * 3); nor.set(g.attributes.normal.array, k * 3); if (col) col.set(g.attributes.color.array.length === g.attributes.position.count * 3 ? g.attributes.color.array : new Float32Array(g.attributes.position.count * 3).fill(1), k * 3); k += g.attributes.position.count; g.dispose(); }
      if (G.bake) { const cl = new Float32Array(n * 3); let kk = 0; for (const [o, g] of geos) { const C = o.material.color, cnt = o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count; for (let i = 0; i < cnt; i++, kk++) cl.set([C.r, C.g, C.b], kk * 3); } col = cl; }
      const U = foxCullScene.userData, bg = new U.BG(); bg.setAttribute('position', new U.BA(pos, 3)); bg.setAttribute('normal', new U.BA(nor, 3)); if (col) bg.setAttribute('color', new U.BA(col, 3));
      const mesh = new U.ME(bg, G.mat); mesh.castShadow = G.cast; mesh.receiveShadow = G.rec; mesh.name = 'sbLocal'; G.par.add(mesh); made++;
      for (const [o] of geos) { if (o.parent) o.parent.remove(o); merged++; } }
    PC.scanT = -1e9; SB.stats = { merged, made }; window.__m2batch = SB.stats; }
  function propScan() { const THREE_ = foxCullCam.position.constructor, box = PC.box, sph = PC.sph, out = [];
    const visit = (o, depth) => { if (!o.visible || o.isLight || o.isCamera || o.userData.noCull || o.userData.P) return;
      if (!o.userData.pcR) { box.setFromObject(o); if (box.isEmpty()) return; box.getBoundingSphere(sph); o.userData.pcR = sph.radius; o.updateWorldMatrix(true, false); o.userData.pcL = o.worldToLocal(sph.center.clone()); }   // centre kept in LOCAL space, so moving things (train, cars, boats) are tested where they are now
      if (o.userData.pcR < 22 || (o.name === 'sbCell' && o.userData.pcR < 70)) { out.push(o); return; }   /* merged static cells are culled as one piece */ if (depth < 3) for (const c of o.children) visit(c, depth + 1); };
    for (const it of PC.list || []) if (it.far) for (const q of it.all) q.layers.set(0);   // s35: never leave a stale 'far' layer on things that drop out of the list (hidden during the scan): empty station halls, invisible lobby walls
    for (const c of foxCullScene.children) visit(c, 0); PC.list = out.map(o => { const all = []; o.traverse(q => all.push(q)); const sg = all.filter(isSignMesh); return { o, all, rest: sg.length ? all.filter(q => !sg.includes(q)) : all, sg, far: false, farS: false }; }); window.__m2signs = () => ({ signs: PC.list.reduce((n, it) => n + it.sg.length, 0), drawn: PC.list.reduce((n, it) => n + (it.farS ? 0 : it.sg.length), 0), items: PC.list.length, far: PC.list.filter(it => it.far).length }); }
  // s171 SIGNS FROM AFAR (Ben: "signs + the text on them are top priority, the ARENA sign readable from across the street"): any upright canvas-textured
  // plane 1.4..18 m (shop signs, name boards, banners, neon) stays drawn out to SIGN_R (phone 320 m + 2 m min size, desktop 620 m; in-map only) while the rest of its group is culled,
  // and its texture gets mipmaps + anisotropy so the letters stay sharp at a distance. userData.noSign opts out, userData.isSign = true forces it.
  function isSignMesh(q) { const u = q.userData; if (u.isSign !== undefined) return u.isSign; let r = false;
    try { const m = q.material, map = m && !Array.isArray(m) && m.map, img = map && map.image; if (q.isMesh && !q.isInstancedMesh && !u.noSign && img && (map.isCanvasTexture || (typeof HTMLCanvasElement !== 'undefined' && img instanceof HTMLCanvasElement)) && q.geometry && q.geometry.type === 'PlaneGeometry') {
      const p = q.geometry.parameters, e = (q.updateWorldMatrix(true, false), q.matrixWorld.elements), sx = Math.hypot(e[0], e[1], e[2]), sy = Math.hypot(e[4], e[5], e[6]), w = p.width * sx, h = p.height * sy, ny = Math.abs(e[9]) / (Math.hypot(e[8], e[9], e[10]) || 1);
      if (ny < 0.5 && Math.max(w, h) >= (matchMedia('(pointer: coarse)').matches ? 2 : 1.4) && !(L.outOfMap && L.outOfMap(e[12], e[14], 0)) && Math.max(w, h) <= 18 && w * h <= 70 && e[13] > -3 && e[13] < 60) { r = true; if (map.anisotropy < 8) { map.anisotropy = 8; map.needsUpdate = true; } } } } catch (er) { r = false; }
    u.isSign = r; return r; }
  function propCull(now) { const cp = foxCullCam.position; if (!PC.ready) return; if (now - PC.scanT > 6000 || window.__m2rescan) { window.__m2rescan = false; PC.scanT = now; propScan(); }   // s104f: __m2rescan = a world-mode game cleared cached centres if (now - PC.t < 250) return; PC.t = now;
    const R = (foxCullWalk() ? 1 : 2) * (matchMedia('(pointer: coarse)').matches ? 110 : 190), R2 = R * R;
    const wc = PC.wc || (PC.wc = cp.clone());
    const SR = (matchMedia('(pointer: coarse)').matches ? 320 : 620) * (foxCullWalk() ? 1 : 1.6), SR2 = SR * SR;
    for (const it of PC.list) { if (!it.o.userData.pcL) continue; const c = it.o.localToWorld(wc.copy(it.o.userData.pcL)), d2 = (c.x - cp.x) ** 2 + (c.z - cp.z) ** 2, far = d2 > R2 + it.o.userData.pcR * it.o.userData.pcR, farS = d2 > SR2;
      if (far !== it.far) { it.far = far; for (const q of it.rest) q.layers.set(far ? 1 : 0); } if (it.sg.length && farS !== it.farS) { it.farS = farS; for (const q of it.sg) q.layers.set(farS ? 1 : 0); } } }
  let foxCullScene = null, foxCullCam = null, foxCullWalk = () => false;
  function foxCull(now) { const scene = foxCullScene, cp = foxCullCam.position; if (!scene) return;
    if (now - FC.scanT > 4000) { FC.scanT = now; FC.list = []; scene.traverse(o => { const u = o.userData; if (u && u.P && u.phase !== undefined && !u.noCull) { FC.list.push(o); if (!u.inkList) { u.inkList = []; o.traverse(q => { if (q.isMesh && q.material && q.material.side === 1) u.inkList.push(q); }); u.inkOn = true; } } }); }
    const ph = matchMedia('(pointer: coarse)').matches, INK2 = (ph ? 14 : 24) ** 2;   // FOX INK LOD: past this the outline shells (about a third of a fox's meshes) are skipped
    const R = foxCullWalk() ? (matchMedia('(pointer: coarse)').matches ? 40 : 65) : 110, R2 = R * R, wp = FC.v || (FC.v = new foxCullCam.position.constructor());
    for (const o of FC.list) { o.getWorldPosition(wp); const far = (wp.x - cp.x) ** 2 + (wp.z - cp.z) ** 2 > R2;
      if (far) { if (o.visible) { o.visible = false; FC.hid.add(o); } } else { if (FC.hid.has(o)) { o.visible = true; FC.hid.delete(o); } const ink = (wp.x - cp.x) ** 2 + (wp.z - cp.z) ** 2 < INK2, u = o.userData; if (u.inkList && ink !== u.inkOn) { u.inkOn = ink; for (const q of u.inkList) q.layers.set(ink ? 0 : 1); } } } }
  const touch = matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(touch ? 1.25 : 2, devicePixelRatio || 1));   // phones 1.25 (was 1.5): ~30 % fewer pixels, barely visible renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !touch; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement); Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block', touchAction: 'none' });
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, 1, 4000);
  foxCullScene = scene; foxCullCam = camera; foxCullWalk = () => !!driver; PC.box = new THREE.Box3(); PC.sph = new THREE.Sphere(); PC.ready = true; scene.userData.BG = THREE.BufferGeometry; scene.userData.BA = THREE.BufferAttribute; scene.userData.ME = THREE.Mesh; scene.userData.GR = THREE.Group;
  const hemi = new THREE.HemisphereLight(0xdfeeff, 0x6f7a5a, 1.1), sun = new THREE.DirectionalLight(0xfff1dc, 2.2);
  // s663 INDOOR LIGHTING (Ben: "work on indoor lighting in Meru"): when the player is inside a building (city.insideBox) the sky light drops + warms,
  // the sun becomes soft window light, and a warm ROOM LAMP under the ceiling lights the middle while the corners fall darker. Night = lamps warmer
  // + brighter. Two lights live in the scene from the start (intensity 0 outside) so nothing recompiles when you walk in. Tune: localStorage meru.indoor.v1
  const IND = { k: 0, box: null, base: null, cfg: { sky: 0.85, skyNight: 0.7, sunIn: 0.32, lamp: 2.2, lampNight: 3.6, fill: 0.7 } };   // s720 (Ben: interiors too dark): brighter ambient + lamps
  try { Object.assign(IND.cfg, JSON.parse(localStorage.getItem('meru.indoor.v2') || '{}')); } catch (e) {}   // v2: the old v1 tune was for the dark set
  // s720 per-room brightness (×): big / showy rooms brighter, cosy ones stay warm + lower. Keys = building keys.
  const ROOM_LIT = { bowling: 1.45, casino: 1.15, arcade: 1.1, museum: 1.25, gallery: 1.3, hospital: 1.35, bank: 1.2, mart: 1.25, bmart: 1.25, barracks: 1.1, tavern: 1.14, fortune: 0.8, itemshop: 1.3, armory: 1.05, police: 1.15, permit: 1.15, crest: 1.1, lake: 1.1, defense: 0.95, cave: 0.55,
    stationTown: 1.3, stationLakeside: 1.3, stationArena: 1.3, stationSpire: 1.3, stationCastleRd: 1.3, stationDeco: 1.3, stationRuins: 1.3, stationGarden: 1.3 };
  ROOM_LIT.casino = 0.9; ROOM_LIT.museum = 0.85;   // s722: dim + rich: their accent spots carry the room
  // s722 LIGHT PLANS (Ben: every building lit, but each its own way; light as art): per building, optional
  //   lamps: [[x, z], ...] world spots for the house lamps (keeps them off a feature that has its own light, e.g. the tavern pool table)
  //   spots: [{ x, y, z, tx, ty, tz, c, i, a }] accent SPOTLIGHTS (from x,y,z aimed at tx,ty,tz; colour, intensity, cone angle). A pool of 4 spots
  //   lives in the scene at 0 outdoors (no shader recompile on entry) and is handed to whichever building you are in.
  const LIGHT_PLAN = {
    tavern: { lamps: [[18, -86], [43, -71], [24, -64]], dist: 13,   // house lamps over the west tables, the east lounge + the front; the POOL TABLE (28, -79) keeps its own green lamp in the dark
      spots: [{ x: 47.2, y: 6.2, z: -87.5, tx: 51.4, ty: 2.0, tz: -87.5, c: 0xfff0d0, i: 5.5, a: 0.42 },    // DARTS: boards 1 + 2 (z -89, -86)
              { x: 47.2, y: 6.2, z: -81.5, tx: 51.4, ty: 2.0, tz: -81.5, c: 0xfff0d0, i: 5.5, a: 0.42 },    // DARTS: boards 3 + 4 (z -83, -80)
              { x: 24, y: 6.6, z: -93.2, tx: 24, ty: 1.0, tz: -96.5, c: 0xffc878, i: 4.2, a: 0.5 },         // OVER THE BAR: warm amber on the counter + bottle shelves, west half
              { x: 36, y: 6.6, z: -93.2, tx: 36, ty: 1.0, tz: -96.5, c: 0xffc878, i: 4.2, a: 0.5 }] },      // east half
  };
  // s722 the rest (Ben said yes to the list). Rooms without a known layout aim their spot at the PLACE OF ACTION: the s63 interior rule puts it
  // straight in from the door, near the far wall, so far(q, ...) = that point. col = house-lamp colour (day), fillCol = the low fill.
  const FAR = (q, k = 0.22) => { const b = L.BUILDINGS.find(o => o.key === q.key) || {}, d = b.door || [(q.x0 + q.x1) / 2, q.z1], f = b.face || 'S';
    const fx = f === 'E' ? q.x0 + (q.x1 - q.x0) * k : f === 'W' ? q.x1 - (q.x1 - q.x0) * k : d[0], fz = f === 'S' ? q.z0 + (q.z1 - q.z0) * k : f === 'N' ? q.z1 - (q.z1 - q.z0) * k : d[1];
    const ix = f === 'E' ? 1 : f === 'W' ? -1 : 0, iz = f === 'S' ? 1 : f === 'N' ? -1 : 0; return { x: fx, z: fz, ix, iz }; };   // ix/iz = toward the door
  const AIM = (q, p, c, i, a = 0.5, side = 0) => { const y = Math.min(q.h - 0.6, 6.2); return { x: p.x + p.ix * 3 + p.iz * side, y, z: p.z + p.iz * 3 - p.ix * side, tx: p.x + p.iz * side, ty: 1.0, tz: p.z - p.ix * side, c, i, a }; };
  Object.assign(LIGHT_PLAN, {
    casino: { col: 0xffc890, spots: [   // gold spots on the games; the slots glow on their own
      { x: -143.5, y: 6.4, z: 0, tx: -147.3, ty: 2.2, tz: 0, c: 0xffd890, i: 6, a: 0.42 },          // PRIZE WHEEL
      { x: -137, y: 6.4, z: -17.5, tx: -137, ty: 1.0, tz: -21, c: 0xffd890, i: 5, a: 0.45 },       // STUD poker
      { x: -117, y: 6.4, z: -18.5, tx: -117, ty: 1.0, tz: -22, c: 0xffd890, i: 5, a: 0.62 },       // HOLD'EM + ROULETTE
      { x: -118, y: 6.4, z: 20.5, tx: -118, ty: 1.0, tz: 24, c: 0xffd890, i: 5, a: 0.5 }] },       // CRAPS
    bowling: { spots: [-30, -20, -10, 0].map(z => ({ x: 138.5, y: 5.8, z, tx: 142.6, ty: 0.5, tz: z, c: 0xffffff, i: 5, a: 0.55 })) },   // the PIN ENDS
    itemshop: { even: 1, spots: q => [AIM(q, FAR(q), 0xfff2dc, 5, 0.55, -3), AIM(q, FAR(q), 0xfff2dc, 5, 0.55, 3)] },   // store-bright + the counter
    armory: { col: 0xdfe8f2, fillCol: 0xb8c8dc, spots: q => [AIM(q, FAR(q, 0.12), 0xe6f0ff, 5, 0.6, -2.5), AIM(q, FAR(q, 0.12), 0xe6f0ff, 5, 0.6, 2.5)] },   // cool steel on the racks
    fortune: { col: 0xc4b5fd, fillCol: 0x7c3aed, spots: [{ x: -80, y: 4.2, z: -52.5, tx: -80, ty: 1.0, tz: -55, c: 0xd8ccff, i: 4.5, a: 0.3 }] },   // one narrow beam on the crystal ball
    bank: { col: 0xfff6ea, spots: q => [AIM(q, FAR(q), 0xffd8a0, 4.5, 0.5, -5), AIM(q, FAR(q), 0xffd8a0, 4.5, 0.5, 0), AIM(q, FAR(q), 0xffd8a0, 4.5, 0.5, 5)] },   // warm on the teller counter
    police: { even: 1, col: 0xf4f8ff }, permit: { even: 1, col: 0xf4f8ff },   // plain office light
    museum: { col: 0xffe8c8, spots: [-392, -384, -376, -368].map(x => ({ x, y: 6.2, z: -60, tx: x, ty: 1.4, tz: -64, c: 0xfff0dc, i: 5.5, a: 0.4 })) },   // a spot per exhibit, dim hall
    cave: { col: 0xff9a50, fillCol: 0xff8a3a },   // torch pools only, low house
    defense: { col: 0xdfeaff, fillCol: 0x9fc0ff, spots: q => [AIM(q, FAR(q, 0.15), 0xff4a3a, 4, 0.5, -3), AIM(q, FAR(q, 0.15), 0xff4a3a, 4, 0.5, 3)] },   // red on the consoles
    crest: { col: 0xffd8a8 }, lake: { col: 0xffd8a8 },   // warm lobbies
    // s728q LIGHTING PASS for the rooms furnished in s728 (Ben): cool hangar light, a white spot on each place of action
    tankRange: { col: 0xeef2ff, fillCol: 0xa8b4c8, spots: [{ x: 175, y: 7.4, z: -425, tx: 175, ty: 0.8, tz: -429.5, c: 0xffffff, i: 6, a: 0.5 },   // BAY 1 training tank
      { x: 182, y: 6.0, z: -410.5, tx: 182, ty: 1.0, tz: -413.8, c: 0xffe2b0, i: 4.5, a: 0.38 },   // Riff's sign-in desk
      { x: 175, y: 6.0, z: -407.5, tx: 175, ty: 0.2, tz: -411, c: 0xfff2dc, i: 4, a: 0.35 }] },   // the PLAY spot
    carRental2: { col: 0xfff2e0, spots: q => [{ x: q.x1 - 3, y: Math.min(q.h - 0.6, 5.2), z: q.z0 + 6.6, tx: q.x1 - 3, ty: 0.6, tz: q.z0 + 4.4, c: 0xffffff, i: 6, a: 0.5 },   // showroom car on the turntable
      AIM(q, FAR(q, 0.14), 0xffd8a0, 4.5, 0.45, 0)] },   // the rental desk
    barracks: { col: 0xffe2b8, fillCol: 0xc8a070, spots: [{ x: 0, y: 6.2, z: -431.5, tx: 0, ty: 1.4, tz: -437, c: 0xffd890, i: 5.5, a: 0.42 },   // the dais + throne
      { x: 24, y: 6.4, z: -419, tx: 24, ty: 0.1, tz: -422, c: 0xfff0d0, i: 5, a: 0.62 },   // the sparring circle
      { x: 34, y: 5.8, z: -430, tx: 38.4, ty: 1.4, tz: -430, c: 0xfff0d0, i: 4, a: 0.5 }] },   // archery butts
  });
  for (const k of Object.keys(ROOM_LIT)) if (/^station/.test(k)) LIGHT_PLAN[k] = { even: 1, col: 0xf2f6ff };   // bright platform strips
  LIGHT_PLAN.stationTown = { even: 1, col: 0xf2f6ff, spots: [{ x: 15.5, y: 6.4, z: 122, tx: 19.4, ty: 3.2, tz: 122, c: 0xffffff, i: 5, a: 0.45 },   // s728q DEPARTURES board
    { x: -5.5, y: 6.4, z: 122, tx: -9.4, ty: 1.2, tz: 122, c: 0xffe2b0, i: 4.5, a: 0.5 }] };   // the ticket office counter
  ROOM_LIT.tankRange = ROOM_LIT.tankRange || 1.15; ROOM_LIT.carRental2 = ROOM_LIT.carRental2 || 1.15;
  // s724 LIGHTING WORKSHOP tunes (Lighting Workshop.dc.html): per room { lit, lampX, fillX, col, fillCol, even, spots: [...] } in localStorage meru.lightTune.v1, laid over the plan above
  const LT_KEY = 'meru.lightTune.v1', LT = (() => { try { return JSON.parse(localStorage.getItem(LT_KEY) || '{}') || {}; } catch (e) { return {}; } })(), LT_BASE = {};
  const ltApply = k => { if (!(k in LT_BASE)) LT_BASE[k] = { lit: ROOM_LIT[k], plan: LIGHT_PLAN[k] }; const B = LT_BASE[k], t = LT[k];
    if (!t) { if (B.lit == null) delete ROOM_LIT[k]; else ROOM_LIT[k] = B.lit; if (B.plan) LIGHT_PLAN[k] = B.plan; else delete LIGHT_PLAN[k]; return; }
    const { lit, ...rest } = t; if (lit != null) ROOM_LIT[k] = lit; else if (B.lit != null) ROOM_LIT[k] = B.lit; LIGHT_PLAN[k] = Object.assign({}, B.plan || {}, rest); };
  for (const k of Object.keys(LT)) ltApply(k);
  // s722c FAKE SPOTS (phone budget: real SpotLights cost every pixel of the whole map even at 0, and froze the test preview): each spot = an additive
  // light POOL on its target surface (floor or wall, faced back at the source) + a faint BEAM cone. Plain meshes, hidden outdoors (no recompile).
  const poolT = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), q = g.createRadialGradient(64, 64, 2, 64, 64, 64); q.addColorStop(0, 'rgba(255,255,255,0.95)'); q.addColorStop(0.45, 'rgba(255,255,255,0.5)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 128, 128); const tx = new THREE.CanvasTexture(c); return tx; })();
  const SPOTS = Array.from({ length: 4 }, () => { const pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: poolT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 1, 1, 20, 1, true).translate(0, -0.5, 0), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, side: THREE.DoubleSide, toneMapped: false }));
    pool.visible = beam.visible = false; pool.renderOrder = beam.renderOrder = 3; scene.add(pool, beam); return { pool, beam, userData: {}, set intensity(v) { const on = v > 0.001; pool.visible = beam.visible = on; pool.material.opacity = Math.min(0.85, v * 0.09); beam.material.opacity = Math.min(0.09, v * 0.012); } }; });
  const _s = new THREE.Vector3(), _t = new THREE.Vector3(), _n = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
  function placeSpot(S, p) { _s.set(p.x, p.y, p.z); _t.set(p.tx, p.ty, p.tz); const dist = _s.distanceTo(_t), rad = Math.tan(p.a || 0.45) * dist;
    const wall = p.ty > 1.4; if (wall) _n.copy(_s).sub(_t).setY(0).normalize(); else _n.set(0, 1, 0);
    S.pool.position.copy(_t).addScaledVector(_n, 0.04); if (!wall) S.pool.position.y = 0.05; S.pool.scale.setScalar(rad * 2.2); S.pool.lookAt(_t.clone().addScaledVector(_n, 1)); if (!wall) S.pool.position.y = 0.06;
    S.pool.material.color.set(p.c || 0xffffff); S.beam.material.color.set(p.c || 0xffffff);
    S.beam.position.copy(_s); S.beam.scale.set(rad, dist, rad); S.beam.quaternion.setFromUnitVectors(_up, _n.copy(_s).sub(_t).normalize()); }
  let spotKey = null;
  const roomLamp = new THREE.PointLight(0xffd6a0, 0, 14, 1.3), roomFill = new THREE.PointLight(0xcfe2ff, 0, 10, 1.6); roomLamp.castShadow = roomFill.castShadow = false; scene.add(roomLamp, roomFill);
  // s720 CEILING GRID: 2 extra lamps always in the scene (intensity 0 outdoors, so no shader recompile when you walk in); big rooms (> 14 m) spread 3 lamps along their long side
  const roomLamps = [roomLamp, new THREE.PointLight(0xffd6a0, 0, 14, 1.3), new THREE.PointLight(0xffd6a0, 0, 14, 1.3)]; roomLamps[1].castShadow = roomLamps[2].castShadow = false; scene.add(roomLamps[1], roomLamps[2]);
  sun.position.set(-300, 420, 200); sun.castShadow = !touch; Object.assign(sun.shadow.camera, { left: -500, right: 500, top: 500, bottom: -500, far: 1400 }); sun.shadow.mapSize.set(2048, 2048); scene.add(hemi, sun);
  const grad = (() => { const d = new Uint8Array([80, 170, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.needsUpdate = true; return t; })();
  const toon = (c, o = {}) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...o });
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const H = L.MAP.half, SZ = H * 2;
  try { if (document.fonts) await document.fonts.load('900 52px Archivo'); } catch (e) {}

  // ---------- ground: one painted texture ----------
  const SC = { stone: '#cfcac3', grass: '#6e9c4a', grit: '#c9b48a', sand: '#ead9a6', desert: '#dfc08a', wood: '#b08b5e', rug: '#8f6aa8' };
  // SHORE v2: the lake outline from L.lakeEdge (noisy), the BEACH = a sand band that follows it (width varies, wider on the town side), dune ripples,
  // shells + pebbles near the water, a dark wet-sand band at the waterline
  const lakePath = (g, X, Z, off) => { const [cx, cz] = L.WATER[0].e; g.beginPath(); for (let i = 0; i <= 360; i++) { const t = -Math.PI + i / 360 * Math.PI * 2, [x, z] = L.lakeEdge(t), dx = x - cx, dz = z - cz, l = Math.hypot(dx, dz) || 1, o = typeof off === 'function' ? off(t) : off; const px = X(x + dx / l * o), pz = Z(z + dz / l * o); i ? g.lineTo(px, pz) : g.moveTo(px, pz); } g.closePath(); };
  function beach(g, k, X, Z) { const wide = t => 19 + 6 * Math.sin(3 * t + 1) + 4 * Math.sin(7 * t + 2) + 13 * Math.max(0, -Math.sin(t)) ** 2;
    lakePath(g, X, Z, wide); g.fillStyle = SC.sand; g.fill(); g.save(); lakePath(g, X, Z, wide); g.clip();
    lakePath(g, X, Z, t => wide(t) * 0.55); g.fillStyle = 'rgba(255,248,225,0.35)'; g.fill();   // dry pale sand up top
    for (let i = 0; i < 9000; i++) { const t = Math.random() * Math.PI * 2 - Math.PI, [x, z] = L.lakeEdge(t), [cx, cz] = L.WATER[0].e, l = Math.hypot(x - cx, z - cz), o = Math.random() * wide(t); const px = X(x + (x - cx) / l * o), pz = Z(z + (z - cz) / l * o);
      if (i < 5000) { g.fillStyle = Math.random() < 0.5 ? 'rgba(160,130,80,0.18)' : 'rgba(255,255,240,0.3)'; g.fillRect(px, pz, 1.5, 1.5); }
      else if (i < 7600) { g.strokeStyle = 'rgba(170,140,90,0.16)'; g.lineWidth = 1; const a = Math.atan2(z - cz, x - cx) + Math.PI / 2; g.beginPath(); g.moveTo(px - Math.cos(a) * 1.4 * k, pz - Math.sin(a) * 1.4 * k); g.quadraticCurveTo(px, pz - 0.4 * k, px + Math.cos(a) * 1.4 * k, pz + Math.sin(a) * 1.4 * k); g.stroke(); }
      else if (o < 7) { g.fillStyle = ['#f6efe2', '#e9d7c0', '#9a948c', '#c9c3b8', '#f1c9b7'][i % 5]; g.beginPath(); g.arc(px, pz, (0.12 + Math.random() * 0.16) * k, 0, 7); g.fill(); } }
    g.restore(); for (const [o, a] of [[4.5, 0.12], [2.6, 0.16], [1.1, 0.22]]) { lakePath(g, X, Z, o); g.fillStyle = 'rgba(120,96,56,' + a + ')'; g.fill(); } }
  const groundTex = CT(touch ? 2048 : 4096, touch ? 2048 : 4096, (g, w) => { const k = w / SZ, X = x => (x + H) * k, Z = z => (z + H) * k;
    g.fillStyle = SC.grass; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 4000; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(60,100,40,0.10)' : 'rgba(255,255,220,0.08)'; g.beginPath(); g.arc(Math.random() * w, Math.random() * w, 2 + Math.random() * 10, 0, 7); g.fill(); }
    // art pass: MOWING STRIPES on the town lawns (inside the ring road + the island hills): 5 m light/dark bands, roads + paving paint over them
    const mow = (x0, x1, z0, z1, clip) => { g.save(); if (clip) { g.beginPath(); clip(); g.clip(); } for (let x = x0, i = 0; x < x1; x += 5, i++) { g.fillStyle = i % 2 ? 'rgba(40,80,20,0.07)' : 'rgba(255,255,225,0.11)'; g.fillRect(X(x), Z(z0), 5 * k, (z1 - z0) * k); } g.restore(); };
    mow(-154, 154, -134, 144);
    for (const S of L.SURFACES) { if (S.s === 'desert') { paintDesert(g, k, X, Z, L); continue; } g.fillStyle = SC[S.s]; if (S.s === 'sand' && S.r) { beach(g, k, X, Z); continue; } if (S.r) g.fillRect(X(S.r[0]), Z(S.r[2]), (S.r[1] - S.r[0]) * k, (S.r[3] - S.r[2]) * k); else { g.beginPath(); g.arc(X(S.c[0]), Z(S.c[1]), S.c[2] * k, 0, 7); g.fill(); }
      if (S.s === 'grass') { if (S.r) mow(S.r[0], S.r[1], S.r[2], S.r[3]); else mow(S.c[0] - S.c[2], S.c[0] + S.c[2], S.c[1] - S.c[2], S.c[1] + S.c[2], () => g.arc(X(S.c[0]), Z(S.c[1]), S.c[2] * k, 0, 7)); } }
    for (const P of L.SKYLINE.plazas) { const r = P.r; for (let x = r[0]; x < r[1]; x += 2) for (let z = r[2]; z < r[3]; z += 2) if (L.lakeF(x + 1, z + 1) > 1.14) { g.fillStyle = (Math.floor(x / 6) + Math.floor(z / 6)) % 2 ? '#cfcac3' : '#c8c2b9'; g.fillRect(X(x), Z(z), 2 * k + 0.5, 2 * k + 0.5); } }
    paintTownPaving(g, k, X, Z, L); paintParade(g, k, X, Z);   // exterior polish: border courses, fountain rings
    g.strokeStyle = 'rgba(0,0,0,0.08)'; g.lineWidth = 1; for (let x = -45; x <= 45; x += 3) { g.beginPath(); g.moveTo(X(x), Z(-40)); g.lineTo(X(x), Z(40)); g.stroke(); }   // plaza paving joints
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const r of L.ROADS) { const line = (col, wd, dash) => { g.strokeStyle = col; g.lineWidth = wd * k; g.setLineDash(dash || []); g.beginPath(); r.p.forEach(([x, z], i) => i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))); g.stroke(); g.setLineDash([]); };
      line('#bdb7ae', r.w + 2 * L.SIDEWALK + 0.4); line('#e8e4dc', r.w + 2 * L.SIDEWALK);   /* s727b: SIDEWALK each side (5 m) */ line('#3d3b3a', r.w); /* Ben: sidewalks 3 m a side; s34 +10 % = 3.3 m */ line('#f5d35a', 0.35, [3 * k, 3 * k]); }
    paintLinks(g, k, X, Z, L);   // s41: station walks
    for (const P of L.PATHS) { g.strokeStyle = 'rgba(120,96,70,0.35)'; g.lineWidth = 4 * k; g.beginPath(); P.p.forEach(([x, z], i) => i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))); g.stroke(); }
    for (const b of L.BUILDINGS) if (b.lot) { const r = b.lot.r; g.fillStyle = '#4a4745'; g.fillRect(X(r[0]), Z(r[2]), (r[1] - r[0]) * k, (r[3] - r[2]) * k); g.strokeStyle = '#f3f2f2'; g.lineWidth = 0.25 * k; for (let i = 1; i < b.lot.bays; i++) { const x = r[0] + (r[1] - r[0]) * i / b.lot.bays; g.beginPath(); g.moveTo(X(x), Z(r[2] + 1)); g.lineTo(X(x), Z(r[2] + 7)); g.stroke(); } }
    lakePath(g, X, Z, 0); g.fillStyle = '#3c87b8'; g.fill(); });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(SZ, SZ), new THREE.MeshToonMaterial({ map: groundTex, gradientMap: grad })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // art polish: a world-scale DETAIL texture over the painted ground (1 tex, 0 draws): paving slabs on stone, blades on grass, grain on roads; picked by the ground colour, fades out by 140 m
  { const dc = document.createElement('canvas'); dc.width = dc.height = 512; const g = dc.getContext('2d'), P = 64, R = Math.random, img = g.createImageData(512, 512), d = img.data;
    const slab = new Float32Array(512 * 512), grass = new Float32Array(512 * 512).fill(0.6), road = new Float32Array(512 * 512);
    for (let row = 0; row < 16; row++) for (let col = -1; col < 9; col++) { const tone = 0.52 + R() * 0.16, x0 = Math.round((col + (row % 2) * 0.5) * P), y0 = row * 32; for (let y = y0; y < y0 + 32; y++) for (let x = x0; x < x0 + P; x++) { const xx = (x + 512) % 512, edge = y - y0 < 2 || x - x0 < 2; slab[y * 512 + xx] = edge ? 0.3 : tone + (R() - 0.5) * 0.05; } }
    for (let k = 0; k < 9000; k++) { const x = R() * 512, y = R() * 512, l = 3 + R() * 7, a = -Math.PI / 2 + (R() - 0.5) * 0.9, v = R() < 0.55 ? 0.42 : 0.78; for (let t = 0; t < l; t++) { const px = (Math.round(x + Math.cos(a) * t) + 512) % 512, py = (Math.round(y + Math.sin(a) * t) + 512) % 512; grass[py * 512 + px] = v; } }
    for (let p = 0; p < 512 * 512; p++) road[p] = 0.58 + (R() - 0.5) * 0.12;
    for (let k = 0; k < 14; k++) { let x = R() * 512, y = R() * 512, a = R() * 6.3; for (let t = 0; t < 60; t++) { a += (R() - 0.5) * 0.6; x += Math.cos(a); y += Math.sin(a); const px = (Math.round(x) + 512) % 512, py = (Math.round(y) + 512) % 512; road[py * 512 + px] = 0.4; } }
    for (let p = 0; p < 512 * 512; p++) { const px = p % 512, py = p / 512 | 0, rp = 0.5 + 0.5 * Math.sin(py * 0.22 + Math.sin(px * 0.031) * 3.2 + Math.sin(px * 0.009 + py * 0.004) * 4) * (0.8 + 0.2 * Math.sin(px * 0.05)); d[p * 4] = slab[p] * 255; d[p * 4 + 1] = grass[p] * 255; d[p * 4 + 2] = road[p] * 255; d[p * 4 + 3] = 205 + 50 * (rp * 0.75 + R() * 0.25); } g.putImageData(img, 0, 0);
    const det = new THREE.CanvasTexture(dc); det.wrapS = det.wrapT = THREE.RepeatWrapping; det.anisotropy = 4;
    ground.material.onBeforeCompile = sh => { sh.uniforms.uDet = { value: det }; sh.uniforms.uRep = { value: SZ / 8 };
      sh.fragmentShader = 'uniform sampler2D uDet; uniform float uRep;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n' +
        ' { vec3 c = sampledDiffuseColor.rgb, dt = texture2D(uDet, vMapUv * uRep).rgb; float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b)), sat = (mx - mn) / max(mx, 0.001);' +
        ' float gr = smoothstep(0.015, 0.06, c.g - max(c.r, c.b)), pv = (1. - gr) * smoothstep(0.3, 0.45, mx) * (1. - smoothstep(0.12, 0.22, sat)), rd = (1. - gr) * (1. - smoothstep(0.06, 0.14, mx)) * (1. - smoothstep(0.15, 0.3, sat));' +
        ' float fd = 1. - smoothstep(30., 140., length(vViewPosition)); float sd = (1. - gr) * step(c.b, c.g) * step(c.g, c.r) * smoothstep(0.16, 0.22, sat) * (1. - smoothstep(0.42, 0.5, sat)) * smoothstep(0.55, 0.65, mx); vec4 dt4 = texture2D(uDet, vMapUv * uRep * 0.5); float m = mix(1., 0.62 + dt.r * 0.72, pv) * mix(1., 0.7 + dt.g * 0.5, gr) * mix(1., 0.62 + dt.b * 0.66, rd) * mix(1., 0.62 + (dt4.a - 0.8) * 2.2, sd); diffuseColor.rgb *= mix(1., m, fd); }'); }; }
  const outer = new THREE.Mesh(new THREE.PlaneGeometry(SZ * 5, SZ * 5), toon('#5f8c3e')); outer.rotation.x = -Math.PI / 2; outer.position.y = -0.2; scene.add(outer);

  // ---------- lake water + Pearl Island ----------
  const wat = L.WATER[0].e, water = new THREE.Mesh(new THREE.CircleGeometry(1, 256), new THREE.MeshPhongMaterial({ color: 0x4aa3d8, transparent: true, opacity: 0.82, shininess: 90, specular: 0xffffff }));
  { const P = water.geometry.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), m = L.lakeM(Math.atan2(-y, x)); P.setXY(i, x * m, y * m); } water.geometry.computeBoundingSphere(); }
  water.scale.set(wat[2], wat[3], 1); water.rotation.x = -Math.PI / 2; water.position.set(wat[0], 0.08, wat[1]); scene.add(water);
  const I = L.ISLAND, prof = I.prof;
  // s184 PEARL VALLEY: the island is a height grid from L.islandAt (rim, swells, slope, beach); the crater is a hole the dive engine's seabed fills
  if (I.crater) { const cs = touch ? 2.0 : 1.4, X0 = I.pond.x - 112, X1 = I.pond.x + 112, Z0 = I.pond.z - 82, Z1 = I.pond.z + 82, g = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, Math.round((X1 - X0) / cs), Math.round((Z1 - Z0) / cs));
    g.rotateX(-Math.PI / 2); g.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
    const P = g.attributes.position, col = [], c = new THREE.Color(), TR = [L.LAKE.island.trail, L.LAKE.island.trail2].filter(Boolean);
    const segD = (x, z, p) => { let m = 1e9; for (let k = 0; k < p.length - 1; k++) { const [ax, az] = p[k], [bx, bz] = p[k + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); m = Math.min(m, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return m; };
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), r = L.islandR(x, z), d = L.craterSD(x, z), y = r > I.c[2] + 6 ? -2.5 : L.islandAt(x, z); P.setY(i, y);
      c.set(d < 0 ? '#3c4a3e' : d < 2.2 && x < I.crater.c[0] + I.crater.A - 4 ? '#8a8478' : r > 42.8 ? (y < 0.2 ? '#bfa877' : y < 0.6 ? '#dcc796' : SC.sand) : y > 8 ? '#7fa865' : y > 1.5 ? '#93ba73' : '#a9c48a');
      if (d >= 0 && TR.some(p => segD(x, z, p) < 1.3)) c.set('#c9b48a'); col.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    const isl = new THREE.Mesh(g, new THREE.MeshToonMaterial({ gradientMap: grad, vertexColors: true })); isl.name = 'pearlIsland'; isl.castShadow = !touch; isl.receiveShadow = true; scene.add(isl);
  } else {
  const isl = new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), touch ? 96 : 160), new THREE.MeshToonMaterial({ gradientMap: grad, vertexColors: true, side: THREE.DoubleSide }));
  { const pos = isl.geometry.attributes.position, col = []; const c = new THREE.Color(); for (let i = 0; i < pos.count; i++) { const y = pos.getY(i), r = Math.hypot(pos.getX(i), pos.getZ(i)); c.set(r > I.hills[2] + 2 ? (y < 0.2 ? '#bfa877' : y < 0.6 ? '#dcc796' : SC.sand) : y > 9 ? '#7fa865' : y > 1 ? '#93ba73' : y < -2 ? '#5e6b5a' : '#a9c48a'); col.push(c.r, c.g, c.b); } isl.geometry.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), r = Math.hypot(x, z); if (r > 30) { const m = 30 + (r - 30) * L.islandM(Math.atan2(z, x)); pos.setX(i, x / r * m); pos.setZ(i, z / r * m); } } isl.geometry.computeVertexNormals(); }
  isl.position.set(I.pond.x, 0, I.pond.z); isl.scale.set(I.k || 1, 1, I.k || 1); isl.castShadow = isl.receiveShadow = true; scene.add(isl);
  const pond = new THREE.Mesh(new THREE.CircleGeometry(I.pond.r * (I.k || 1), 40), new THREE.MeshPhongMaterial({ color: 0x15507d, shininess: 120, transparent: true, opacity: 0.92 })); pond.rotation.x = -Math.PI / 2; pond.position.set(I.pond.x, 0.4, I.pond.z); scene.add(pond); }

  // ---------- step 2: the Town Square city centre (real shells, sliding doors, cutaway, plaza, cars) ----------
  const train = __TM('buildTrain', buildTrain)({ THREE, scene, toon, grad, CT, L, touch });
  const KC = /[?&]oldpaths=1/.test(location.search) ? () => false : keepClear(L);   // s34: nothing is placed on Ben's fountain-area paths (+ 1 m)
  const city = __TM('buildCity', buildCity)({ THREE, scene, camera, toon, grad, CT, L, touch, avoid: (x, z, m) => train.keepOut(x, z, m) || KC(x, z, m || 0) });
  const signs = __TM('buildSigns', buildSigns)({ THREE, scene, CT, L, city, touch });   // art pass: a signature animated sign per building
  const heights = __TM('buildHeights', buildHeights)({ THREE, scene, toon, grad, CT, L, touch });
  // s725b GOLD DOOR everywhere (Ben): buildings with their own shells (not meru2-city) get the same gold frame, inside + outside of each door
  { const parts = [], FC = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }, DW = 4, DH = 4.5;
    const box = (w, h, d, x, y, z, ry) => { const g = new THREE.BoxGeometry(w, h, d); g.rotateY(ry); g.translate(x, y, z); parts.push(g); };
    for (const b of L.BUILDINGS) { if (!b.door || city.keys.has(b.key) || b.open || b.room === null || b.selfBuilt || b.key === 'cave') continue;
      for (const [p, f] of [[b.door, b.face], ...(b.door2 ? [[b.door2, b.face2]] : []), ...(b.doorsX || [])]) { const F = FC[f]; if (!F || !p) continue; const ry = Math.atan2(F[0], F[1]), cs = Math.cos(ry), sn = Math.sin(ry);
        let y0 = 0; try { y0 = b.y || heights.terrainAt(p[0], p[1]) || 0; } catch (e) {}
        for (const lz of [0.25, -0.65]) { const W = (lx, z) => [p[0] + lx * cs + z * sn, p[1] - lx * sn + z * cs];
          for (const sx of [-1, 1]) { const [x, z] = W(sx * (DW / 2 + 0.22), lz); box(0.45, DH + 0.45, 0.3, x, y0 + (DH + 0.45) / 2, z, ry); }
          const [x, z] = W(0, lz); box(DW + 0.9, 0.45, 0.3, x, y0 + DH + 0.22, z, ry); } } }
    if (parts.length) { const ps = [], ns = []; for (const g of parts) { const n = g.toNonIndexed(); ps.push(...n.attributes.position.array); ns.push(...n.attributes.normal.array); }
      const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); G.setAttribute('normal', new THREE.Float32BufferAttribute(ns, 3));
      scene.add(new THREE.Mesh(G, new THREE.MeshBasicMaterial({ color: 0xffc64a }))); } }
  const nature = __TM('buildNature', buildNature)({ THREE, scene, L, groundCanvas: groundTex.image, heightAt: (x, z) => heights.terrainAt(x, z), touch });   // grass blades in the wind, clouds, birds   // step 3 part 4: hills, trails, decks, lighthouses
  const paths = __TM('buildPaths', buildPaths)({ THREE, scene, toon, CT, L, touch, avoid: (x, z, m) => train.keepOut(x, z, m) || city.covers(x, z) || KC(x, z, m || 0) });   // step 4: the four paths
  // ---------- buildings ----------
  const HGT = { tavern: 9, casino: 14, bowling: 10, itemshop: 6, armory: 6, fortune: 5, burgers: 6, police: 12, bank: 16, carRental: 5, carRental2: 5, crest: 34, lake: 46, barracks: 14, tankWorks: 12, tankRange: 10, defense: 6, museum: 10, permit: 5, cave: 18, blindSchool: 10, boatworks: 8, boathouse: 7, ferryDock: 3, skateGate: 4 };
  const COL = { tavern: '#b8936a', casino: '#3a2f4a', bowling: '#c94c3a', police: '#2e4a6b', bank: '#e9e3d6', crest: '#a9bccb', lake: '#8fb8cf', barracks: '#9b8f7d', tankWorks: '#6c7166', tankRange: '#7a7a63', defense: '#5f6b5a', museum: '#c9bba0', cave: '#6e6458', blindSchool: '#e8d9b8', boatworks: '#8b6a48', boathouse: '#7d5e43' };
  const gold = new THREE.MeshBasicMaterial({ color: 0xffc64a }), glass = new THREE.MeshPhongMaterial({ color: 0x9fd6ff, transparent: true, opacity: 0.45, shininess: 100 });
  const hireTex = CT(256, 96, (g, w, h) => { g.fillStyle = '#16a34a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = '900 38px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('NOW', 18, 30); g.fillText('HIRING', 18, 70); g.fillStyle = '#ffd23a'; g.fillRect(w - 50, 22, 30, 52); g.fillStyle = '#16a34a'; g.beginPath(); g.moveTo(w - 42, 32); g.lineTo(w - 26, 48); g.lineTo(w - 42, 64); g.fill(); });
  const hireMat = new THREE.MeshBasicMaterial({ map: hireTex }), FACE = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  const label = (txt, col = '#201e1d', bg = '#ffffff', s = 1) => { const t = CT(512, 96, (g, w, h) => { g.font = '900 52px Archivo, sans-serif'; const tw = Math.min(w - 20, g.measureText(txt).width + 32); g.fillStyle = bg; g.fillRect(0, 10, tw, 76); g.fillStyle = col; g.fillRect(0, 10, 10, 76); g.fillStyle = bg === '#ffffff' ? '#201e1d' : '#ffffff'; g.textBaseline = 'middle'; g.fillText(txt, 22, 50, tw - 30); });
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); sp.scale.set(26 * s, 4.9 * s, 1); sp.center.set(0, 0.5); sp.renderOrder = 10; return sp; };
  const labels = new THREE.Group(), doorsG = new THREE.Group(), hires = [], ownBlocks = {}; scene.add(labels, doorsG);
  for (const b of L.BUILDINGS) { const [x0, x1, z0, z1] = b.f, w = x1 - x0, d = z1 - z0, cb = city.keys.has(b.key), h = cb ? city.heightOf(b.key) : HGT[b.key] || (b.key.startsWith('station') ? 8 : 7), st = b.key.startsWith('station');
    if (!cb && !b.open && !b.selfBuilt) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(st ? '#d9d4cc' : COL[b.key] || '#d6cfc4')); m.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; scene.add(m); if (b.own) ownBlocks[b.key] = m;   // own-shell buildings (barracks): the walk module hides this and builds the real one
    if (st) { const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 4, 0.8, d + 4), toon('#ec3013')); roof.position.set(m.position.x, h + 0.4, m.position.z); scene.add(roof); }
    if (b.door && b.key !== 'cave' && !b.noFrame) { const [fx, fz] = FACE[b.face], dw = 4, dh = 4.5, g = new THREE.Group(); g.position.set(b.door[0] + fx * 0.15, 0, b.door[1] + fz * 0.15); g.rotation.y = Math.atan2(fx, fz); doorsG.add(g);
      for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.45, dh + 0.45, 0.4), gold); p.position.set(sx * (dw / 2 + 0.22), (dh + 0.45) / 2, 0); g.add(p); }
      const top = new THREE.Mesh(new THREE.BoxGeometry(dw + 0.9, 0.45, 0.4), gold); top.position.y = dh + 0.22; g.add(top);
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(dw, dh), glass); gl.position.set(0, dh / 2, 0.05); g.add(gl);
      if (b.hiring && !b.hiring.play) { const s = new THREE.Group(); s.position.set(dw / 2 + 2.2, 0, 1.2); g.add(s); const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 0.15), toon('#201e1d')); post.position.y = 0.8; s.add(post); const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.82), hireMat); pl.position.y = 2.0; s.add(pl); const back = pl.clone(); back.rotation.y = Math.PI; s.add(back); hires.push({ b, s }); } } }
    if (!b.noFrame) { const lb = label(b.label.toUpperCase(), st ? '#ec3013' : '#201e1d', '#ffffff', 0.55); lb.position.set(x0, h + 6, (z0 + z1) / 2); labels.add(lb); } }
  // the cave mouth: rock face + broken columns
  { const c = L.BUILDINGS.find(b => b.key === 'cave'); if (c) { const [x0, x1, z0, z1] = c.f; const rock = toon('#6e6458'); for (let i = 0; i < 9; i++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(6 + Math.random() * 6), rock); r.position.set(x0 - 6 + Math.random() * 10, 4 + Math.random() * 8, z0 - 18 + i * 6); r.castShadow = true; scene.add(r); }
    const mouth = new THREE.Mesh(new THREE.CircleGeometry(6, 24, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x0b0a0a })); mouth.position.set(x1 + 0.2, 0, (z0 + z1) / 2); mouth.rotation.y = Math.PI / 2; scene.add(mouth);
    // exterior polish round 5: the CAVE PORTAL — a carved stone arch of voussoirs + keystone with a violet rune, a depth fade inside the
    // mouth (no flat black disc look), moss on the rocks, hanging vines, rubble at the foot, two violet braziers (lit at night)
    { const zc = (z0 + z1) / 2, xf = x1 + 0.35, stoneA = toon('#9a8f7e'), stoneB = toon('#8a7f6f'), moss = toon('#4f7a35'), vine = toon('#3d6b2c'), ink = toon('#201e1d');
      for (let i = 0; i < 13; i++) { const a = Math.PI * i / 12, r = 6.6, v = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.25, i === 6 ? 1.6 : 1.3), i % 2 ? stoneB : stoneA); v.position.set(xf + 0.3, Math.sin(a) * r, zc + Math.cos(a) * r); v.rotation.x = -a + Math.PI / 2; v.castShadow = !touch; scene.add(v); }
      for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 1.6), stoneB); p.position.set(xf + 0.4, 0.8, zc + s * 6.9); scene.add(p); }
      { const rc = CT(128, 128, (g, w) => { g.fillStyle = '#9a8f7e'; g.fillRect(0, 0, w, w); g.strokeStyle = '#b98bff'; g.lineWidth = 9; g.beginPath(); g.moveTo(30, 100); g.lineTo(64, 24); g.lineTo(98, 100); g.moveTo(42, 72); g.lineTo(86, 72); g.stroke(); });
        const rune = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: rc, color: 0xcfc6ff })); rune.position.set(xf + 1.12, 6.6, zc); rune.rotation.y = Math.PI / 2; scene.add(rune); var caveRune = rune; }
      { const dc = CT(16, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(11,10,10,1)'); gr.addColorStop(1, 'rgba(11,10,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
        for (let k = 1; k <= 3; k++) { const d = new THREE.Mesh(new THREE.CircleGeometry(6 - k * 0.3, 24, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x15120f, transparent: true, opacity: 0.5 })); d.position.set(xf + 0.06 + k * 0.02, 0.01, zc); d.rotation.y = Math.PI / 2; scene.add(d); } }
      for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 + Math.random() * 1.6, 0), moss); m.scale.set(1, 0.35, 1); m.position.set(x0 - 2 + Math.random() * 8, 9 + Math.random() * 8, z0 - 14 + Math.random() * 48); scene.add(m); }
      for (let i = 0; i < 11; i++) { const len = 1.5 + Math.random() * 3.5, a = Math.PI * (0.15 + 0.7 * i / 10), r = 7.2, v = new THREE.Mesh(new THREE.BoxGeometry(0.08, len, 0.18), vine); v.position.set(xf + 0.9, Math.sin(a) * r - len / 2, zc + Math.cos(a) * r); scene.add(v);
        const tip = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), moss); tip.position.set(xf + 0.9, Math.sin(a) * r - len, zc + Math.cos(a) * r); scene.add(tip); }
      for (let i = 0; i < 10; i++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.55, 0), i % 2 ? stoneA : stoneB); const s = Math.random() < 0.5 ? -1 : 1; r.position.set(xf + 1 + Math.random() * 3, 0.15, zc + s * (6 + Math.random() * 3)); r.rotation.set(Math.random() * 3, Math.random() * 3, 0); scene.add(r); }
      var caveFire = []; for (const s of [-1, 1]) { const x = xf + 2.4, z = zc + s * 8.4; const pl = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.8), stoneB); pl.position.set(x, 0.55, z); scene.add(pl); const bw = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 0.35, 10), ink); bw.position.set(x, 1.27, z); scene.add(bw);
        const fl = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.75, 7), new THREE.MeshBasicMaterial({ color: 0x8a6fd0 })); fl.position.set(x, 1.8, z); scene.add(fl); caveFire.push(fl); city.colliders.push({ c: [x, z, 0.5] }); } }
    for (let i = 0; i < 8; i++) { const hgt = 2 + Math.random() * 6, col = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, hgt, 10), toon('#cfc2a4')); col.position.set(x1 + 6 + (i % 4) * 5, hgt / 2, z0 - 8 + Math.floor(i / 4) * 40 + Math.random() * 4); col.rotation.z = (Math.random() - 0.5) * 0.15; col.castShadow = true; scene.add(col); } } }

  // ---------- skyline towers (instanced, outside the ring road) ----------
  // step 9: glass towers get a world-space window grid (mullions by day, random lit windows at night) in the shader: no textures, 1 draw call
  const TWU = { uNight: { value: 0 }, uLit: { value: 0.45 }, uWT: { value: 0 } }, beaconPts = [];
  // SKYLINE v2 (Ben: "the empty skyrises block the train view"): the 120 random towers are gone. Now ~30 towers in 5 named DISTRICTS, each with its own
  // facade style (aSty in the window shader) and a LANDMARK: SPIRE DISTRICT (NE, twisting Meru Spire) · DECO QUARTER (NW, stepped gold-crowned Gatekeeper)
  // · PEARL QUARTER (SE lakeside, the Pearl Sail) · GARDEN TWINS (SW by the falls, skybridge + roof gardens) · FAR EAST (backdrop past the map edge).
  // Wide gaps between districts = view corridors; nothing tall within ~70 m of the train line.
  { const towersG = new THREE.Group(); scene.add(towersG); var towers = towersG;
    const geo = new THREE.BoxGeometry(1, 1, 1), mat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 80, specular: 0xffffff, emissive: 0x000000 }); towers.material = mat;
    mat.onBeforeCompile = sh => { Object.assign(sh.uniforms, TWU);
      sh.vertexShader = 'attribute float aSty; varying float vSty; varying vec3 vTW; varying vec3 vTN;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vec4 tw = vec4(transformed, 1.0); vec3 tn = normal;\n #ifdef USE_INSTANCING\n tw = instanceMatrix * tw; tn = mat3(instanceMatrix) * tn;\n #endif\n vTW = (modelMatrix * tw).xyz; vTN = normalize(mat3(modelMatrix) * tn); vSty = aSty;');
      sh.fragmentShader = 'uniform float uNight; uniform float uLit; uniform float uWT; varying float vSty; varying vec3 vTW; varying vec3 vTN;\n' + sh.fragmentShader
        .replace('#include <color_fragment>', '#include <color_fragment>\n' +
        ' float tSide = 1.0 - step(0.6, abs(vTN.y)); vec2 tt = normalize(vec2(-vTN.z, vTN.x) + 1e-5); float tu = dot(vTW.xz, tt); float tFace = floor(atan(vTN.z, vTN.x) * 1.27 + 0.5);\n' +
        ' int S = int(vSty + 0.5); vec2 cs = S == 1 ? vec2(2.4, 3.8) : S == 4 ? vec2(1.6, 3.6) : vec2(3.2, 3.6);\n' +
        ' vec2 tc = vec2(tu, vTW.y) / cs; vec2 tf = fract(tc); vec2 tcell = floor(tc); float above = step(4.5, vTW.y); float tWin = 0.0; vec3 base = diffuseColor.rgb;\n' +
        ' if (S == 1) { float pier = step(fract(tc.x / 3.0), 0.34); float gold = step(fract(vTW.y / 34.2), 0.06) * above;\n' +
        '   tWin = step(0.3, tf.x) * step(tf.x, 0.7) * step(0.12, tf.y) * step(tf.y, 0.88) * (1.0 - gold) * (1.0 - pier * 0.6);\n' +
        '   base *= mix(1.0, 1.08, pier * tSide); base = mix(base, vec3(0.86, 0.66, 0.3), gold * tSide); diffuseColor.rgb = mix(base, vec3(0.2, 0.22, 0.26), tWin * tSide * above); }\n' +
        ' else if (S == 2) { tWin = step(0.4, tf.y) * step(tf.y, 0.86) * step(0.03, tf.x); diffuseColor.rgb = mix(base, vec3(0.32, 0.46, 0.58), tWin * tSide * above); }\n' +
        ' else if (S == 3) { float slab = step(tf.y, 0.1); float plant = step(0.1, tf.y) * step(tf.y, 0.4) * step(0.3, fract(sin(dot(tcell, vec2(3.1, 7.7))) * 473.1));\n' +
        '   tWin = step(0.42, tf.y) * step(tf.y, 0.96) * step(0.05, tf.x) * step(tf.x, 0.95); base = mix(base, vec3(0.95), slab * tSide * above); base = mix(base, vec3(0.36, 0.66, 0.26), plant * tSide * above);\n' +
        '   diffuseColor.rgb = mix(base, vec3(0.5, 0.64, 0.68), tWin * tSide * above); }\n' +
        ' else if (S == 4) { float red = step(fract(vTW.y / 43.2), 0.03) * above; tWin = step(0.08, tf.x) * step(tf.x, 0.92) * step(0.1, tf.y) * step(tf.y, 0.94) * (1.0 - red);\n' +
        '   base = mix(base * 1.25, base * 0.72, tWin * tSide * above); diffuseColor.rgb = mix(base, vec3(0.93, 0.19, 0.07), red * tSide); }\n' +
        ' else { float tBand = step(fract(vTW.y / 21.6), 0.13); float tFin = step(fract(tc.x / 4.0), 0.06); tWin = step(0.16, tf.x) * step(tf.x, 0.84) * step(0.2, tf.y) * step(tf.y, 0.8) * (1.0 - tBand) * (1.0 - tFin);\n' +
        '   diffuseColor.rgb *= mix(1.0, mix(0.62, 1.0, tWin * above), tSide); diffuseColor.rgb *= mix(1.0, mix(1.0, 1.18, tBand) * mix(1.0, 0.8, tFin), tSide); }\n' +
        ' tWin *= tSide * above; float tLob = step(vTW.y, 4.5) * tSide; diffuseColor.rgb *= mix(1.0, 0.4, tLob);\n' +
        ' float tH = fract(sin(dot(vec3(tcell, tFace), vec3(12.9898, 78.233, 37.719))) * 43758.5453);\n' +
        ' float tRow = fract(sin(dot(vec2(tcell.y, tFace + floor(vTW.x * 0.02 + vTW.z * 0.013)), vec2(7.13, 3.71))) * 9137.31);')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n float tEp = floor(uWT / (45.0 + 60.0 * tH) + tH * 9.0), tH2 = fract(sin(dot(vec3(tcell, tFace + tEp * 0.61), vec3(39.35, 11.13, 5.71))) * 24634.63);\n float tOff = step(tRow, 0.16), tFull = step(0.86, tRow);\n float tLit = max(step(1.0 - uLit * (0.4 + tRow * 0.9), tH2), tFull * step(0.12, tH2)) * (1.0 - tOff);\n float tc0 = fract(tH * 7.31); vec3 tCol = tc0 < 0.5 ? vec3(1.0, 0.74, 0.42) : tc0 < 0.76 ? vec3(1.0, 0.9, 0.72) : tc0 < 0.94 ? vec3(0.7, 0.84, 1.0) : vec3(1.0, 0.52, 0.32);\n tCol = mix(tCol, vec3(0.86, 0.94, 1.0), tFull * 0.6); float tTv = step(0.965, fract(tH * 13.7)); tCol = mix(tCol, vec3(0.45, 0.6, 1.0) * (0.55 + 0.45 * sin(uWT * 6.0 + tH * 40.0) * sin(uWT * 2.3 + tH * 9.0)), tTv);\n diffuseColor.rgb *= 1.0 - 0.45 * uNight * tWin * (1.0 - tLit);\n totalEmissiveRadiance += tCol * tWin * tLit * uNight * (0.35 + 0.75 * fract(tH * 3.7)) * (0.8 + 0.3 * fract(tc.y)) + vec3(1.0, 0.82, 0.55) * tLob * uNight * 0.55 * step(0.6, tf.y);'); };
    const M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), p = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0), R = Math.random;
    const BX = [], GOLD = [], CONE = [], PB = [], MS = [], LEAF = [];
    const add = (x, y0, z, w, h, d, c, sty, ry = 0) => BX.push([x, y0 + h / 2, z, w, h, d, ry, c, sty]);
    const roof = (x, top, z, w, d, mast) => { PB.push([x + (R() - 0.5) * w * 0.3, top + 1.6, z + (R() - 0.5) * d * 0.3, w * 0.42, 3.2, d * 0.38]); PB.push([x, top + 0.45, z, w + 0.5, 0.9, d + 0.5]);
      if (mast) { const mh = 8 + R() * 10; MS.push([x, top + 3.2 + mh / 2, z, 0.5, mh, 0.5]); beaconPts.push(x, top + 3.2 + mh + 0.5, z); } };
    // a plain district tower with 0-2 setbacks
    const tower = (x, z, w, d, h, cols, sty) => { const c = cols[(R() * cols.length) | 0]; add(x, 0, z, w, h, d, c, sty); let top = h, cw = w, cd = d; const st = h > 95 ? 2 : h > 55 ? 1 : 0;
      for (let k = 0; k < st; k++) { cw *= 0.74; cd *= 0.74; const ch = 7.2 + (k ? 3.6 : 7.2); add(x, top, z, cw, ch, cd, c, sty); top += ch; } roof(x, top, z, cw, cd, h > 75); };
    // A · SPIRE DISTRICT (NE): dark finance glass, red floor lines; the MERU SPIRE twists a quarter turn as it climbs, needle on top
    const SP = ['#5d6f82', '#506275', '#6a7d90'];
    { const x = 335, z = -205; for (let k = 0; k < 42; k++) { const t = k / 41, w = 27 - 9 * t; add(x, k * 3.6, z, w, 3.62, w, '#5a6c80', 4, k * 0.055); }
      for (let k = 0; k < 4; k++) add(x, 151.2 + k * 3.6, z, 16 - k * 3, 3.62, 16 - k * 3, '#c8ccd2', 0, 1.6 + k * 0.1);
      CONE.push([x, 165.6, z, 1.4, 34, 1.4, '#d8dde3']); beaconPts.push(x, 200.5, z); }
    for (const [x, z, w, d, h] of [[298, -258, 18, 18, 70], [374, -252, 16, 22, 96], [304, -148, 20, 16, 58], [375, -148, 18, 18, 80], [338, -96, 14, 14, 42]]) tower(x, z, w, d, h, SP, 4);
    // B · DECO QUARTER (NW): sandstone, tall slot windows between piers, gold bands; the GATEKEEPER steps back four times to a gold crown + spire
    const DC = ['#d8c3a0', '#cdb48c', '#e2d2b4'];
    { const x = -160, z = -235; let y = 0; for (const [w, h] of [[34, 60], [27, 30], [20, 26], [13, 16]]) { add(x, y, z, w, h, w, '#dcc6a2', 1); y += h; GOLD.push([x, y + 0.4, z, w + 0.8, 0.8, w + 0.8]); }
      for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4; GOLD.push([x + Math.cos(an) * 5.6, y - 6, z + Math.sin(an) * 5.6, 0.6, 12, 2.4, an]); }
      CONE.push([x, y, z, 3.2, 30, 3.2, '#c9a24a']); beaconPts.push(x, y + 31, z); }
    for (const [x, z, w, d, h] of [[-216, -276, 20, 20, 64], [-104, -272, 18, 24, 52], [-216, -182, 22, 16, 46], [-100, -186, 16, 16, 72]]) { tower(x, z, w, d, h, DC, 1); GOLD.push([x, h + 0.4, z, w + 0.6, 0.6, d + 0.6]); }
    // C · PEARL QUARTER (SE lakeside): white, ribbon windows; the PEARL SAIL is a crescent that tapers and leans toward the lake
    const PW = ['#f1efe9', '#e7e4dc', '#f6f3ec'];
    { // PEARL SAIL: a mast on the west edge + a curved sail belly that swells toward the lake and closes to a point at the top
      const N = 16, sh = new THREE.Shape(); for (let i = 0; i <= N; i++) { const x = i / N; sh[i ? 'lineTo' : 'moveTo'](x, 0.55 * Math.sin(Math.PI * x)); } for (let i = N - 1; i > 0; i--) { const x = i / N; sh.lineTo(x, 0.12 * Math.sin(Math.PI * x)); }
      const H2 = 150, W = 50, g = new THREE.ExtrudeGeometry(sh, { depth: 1, steps: 30, bevelEnabled: false, curveSegments: 1 }); g.rotateX(-Math.PI / 2);
      const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const t = Math.max(0, Math.min(1, P.getY(i))), w = W * Math.pow(Math.max(0, Math.sin(Math.PI * (0.12 + 0.88 * t))), 0.75), th = (0.45 + 0.55 * (1 - t)) / 0.43;
        P.setX(i, P.getX(i) * w); P.setZ(i, P.getZ(i) * 30 * th); P.setY(i, t * H2); }
      const g2 = g.index ? g.toNonIndexed() : g; g2.computeVertexNormals(); g2.setAttribute('aSty', new THREE.Float32BufferAttribute(new Float32Array(g2.attributes.position.count).fill(2), 1));
      const sx = 358, sz = 262, sail = new THREE.Mesh(g2, mat); sail.position.set(sx, 0, sz); sail.castShadow = true; towers.add(sail);
      add(sx - 1.5, 0, sz - 0.5, 4, H2 + 22, 4, '#f6f3ec', 0); for (let k = 1; k <= 3; k++) { const y = H2 * k / 4.2; GOLD.push([sx + 2, y, sz + 3, 1.2, 1.2, 14, 0]); }
      GOLD.push([sx - 1.5, H2 + 22.4, sz - 0.5, 4.6, 0.8, 4.6]); CONE.push([sx - 1.5, H2 + 22.8, sz - 0.5, 0.8, 18, 0.8, '#f3f2f2']); beaconPts.push(sx - 1.5, H2 + 41.5, sz - 0.5);
      add(sx + 14, 0, sz + 26, 34, 7, 12, '#f1efe9', 2); }
    for (const [x, z, w, d, h] of [[430, 214, 16, 16, 62], [432, 302, 18, 14, 48], [420, 350, 16, 20, 36], [330, 214, 14, 14, 52]]) tower(x, z, w, d, h, PW, 2);
    // D · GARDEN TWINS (SW by the falls): balconies with planting, a glass SKYBRIDGE at 78 m, trees on both roofs
    const GT = ['#e1e6df', '#d6ddd5'];
    { for (const [x, h] of [[-346, 112], [-304, 100]]) { add(-0 + x, 0, 215, 18, h, 18, '#e4e8e2', 3); PB.push([x, h + 0.6, 215, 18.6, 1.2, 18.6]); for (let k = 0; k < 7; k++) LEAF.push([x + (R() - 0.5) * 12, h + 3 + R() * 2, 215 + (R() - 0.5) * 12, 3 + R() * 1.6]); }
      add(-325, 76, 215, 26, 6, 8, '#8fb3cc', 0); GOLD.push([-325, 82.3, 215, 26.4, 0.6, 8.4]); }
    for (const [x, z, w, d, h] of [[-372, 250, 14, 14, 40], [-284, 252, 14, 16, 48], [-272, 216, 10, 12, 50], [-348, 256, 10, 10, 30]])   /* s105: +2 Garden towers (Garden Apartments, Garden relic store) */ { tower(x, z, w, d, h, GT, 3); for (let k = 0; k < 3; k++) LEAF.push([x + (R() - 0.5) * 9, h + 2, z + (R() - 0.5) * 9, 1.6 + R()]); }
    // (Far East backdrop removed: past the map edge, nothing there could be reached)
    // build: towers (1 instanced draw, colour + style per box), gold trims (unlit gold, reads at night), spires, rooftop plant, masts, roof trees
    // s38b: moved districts (Town Layout Workshop clusters): every box, trim, spire, roof part, mast, roof tree, beacon + the sail shift with their plaza
    if (L.skyShift && Object.keys(L.SKY_MOVES || {}).length) { const sh = a => { const [x, z] = L.skyShift(a[0], a[2]); a[0] = x; a[2] = z; }; [BX, GOLD, CONE, PB, MS, LEAF].forEach(Ls => Ls.forEach(sh));
      for (let i = 0; i < beaconPts.length; i += 3) { const [x, z] = L.skyShift(beaconPts[i], beaconPts[i + 2]); beaconPts[i] = x; beaconPts[i + 2] = z; }
      towers.children.forEach(m => { if (m.isMesh && !m.isInstancedMesh) { const [x, z] = L.skyShift(m.position.x, m.position.z); m.position.x = x; m.position.z = z; } }); }
    const inst = new THREE.InstancedMesh(geo.clone(), mat, BX.length), sty = new Float32Array(BX.length), cc = new THREE.Color();
    BX.forEach((t, i) => { M4.compose(p.set(t[0], t[1], t[2]), q.setFromAxisAngle(Y, t[6]), sv.set(t[3], t[4], t[5])); inst.setMatrixAt(i, M4); inst.setColorAt(i, cc.set(t[7])); sty[i] = t[8]; });
    inst.geometry.setAttribute('aSty', new THREE.InstancedBufferAttribute(sty, 1)); inst.castShadow = true; towers.add(inst);
    const ib = (g, m, Ls, col) => { const im = new THREE.InstancedMesh(g, m, Math.max(1, Ls.length)); im.count = Ls.length; Ls.forEach((a, i) => { M4.compose(p.set(a[0], a[1], a[2]), q.setFromAxisAngle(Y, a[6] || 0), sv.set(a[3], a[4], a[5])); im.setMatrixAt(i, M4); if (col) im.setColorAt(i, cc.set(a[6])); }); im.castShadow = !touch; towers.add(im); return im; };
    ib(geo, new THREE.MeshBasicMaterial({ color: 0xd7ad52 }), GOLD.map(a => [a[0], a[1], a[2], a[3], a[4], a[5], a[6] || 0]));
    const coneG = new THREE.CylinderGeometry(0, 1, 1, 8); coneG.translate(0, 0.5, 0);
    { const im = new THREE.InstancedMesh(coneG, new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 120, specular: 0xffffff }), CONE.length); CONE.forEach((a, i) => { M4.compose(p.set(a[0], a[1], a[2]), q.identity(), sv.set(a[3], a[4], a[5])); im.setMatrixAt(i, M4); im.setColorAt(i, cc.set(a[6])); }); towers.add(im); }
    // tower feet: a paved plaza slab + kerb under every tower base, and a dark glass lobby podium on the big ones (1 + 1 draws)
    const FEET = [], POD = []; for (const t of BX) if (Math.abs(t[1] - t[4] / 2) < 0.01 && t[4] > 30) { FEET.push([t[0], 0.03, t[2], t[3] + 3, 0.06, t[5] + 3, t[6]]); if (t[3] > 15) POD.push([t[0], 2.6, t[2], t[3] + 4, 5.2, t[5] + 4, t[6]]); }
    towers.userData.bases = [...BX.filter(t => Math.abs(t[1] - t[4] / 2) < 0.01 && t[4] > 5).map(t => { const pod = t[3] > 15 && t[4] > 30 ? 4 : 0; return { x: t[0], z: t[2], w: t[3] + pod, d: t[5] + pod, h: t[4], lm: t[3] >= 30 }; }),
      { x: 335, z: -205, w: 27, d: 27, h: 200, lm: true }, { x: 383, z: 243, w: 50, d: 38, h: 150, lm: true, face: 'N' }].map((b, i, a) => { if (i < a.length - 2 || !L.skyShift) return b; const [x, z] = L.skyShift(b.x, b.z); return { ...b, x, z }; });
    for (const c of (L.CLUSTER_BUILDINGS || [])) if (c.own) { const [x, z] = L.skyShift ? L.skyShift(c.at[0], c.at[1]) : c.at; towers.userData.bases.push({ x, z, w: c.own.w + 1, d: c.own.d + 1, h: 4, own: c.key }); }   // s105: the Woodshop + Town Dump footprints (collider + dressing keep-out; h 4 = no glass entrance)
    ib(geo, toon('#cfcac3'), FEET); ib(geo, new THREE.MeshPhongMaterial({ color: 0x2b3440, shininess: 90, specular: 0x9fb6c8 }), POD);
    ib(geo, toon('#5d636b'), PB); ib(new THREE.CylinderGeometry(0.5, 1, 1, 6), toon('#8a9099'), MS);
    ib(new THREE.IcosahedronGeometry(1, 0), toon('#5f8f45'), LEAF.map(a => [a[0], a[1], a[2], a[3], a[3] * 0.9, a[3]]));
    towers.userData.stats = { boxes: BX.length, districts: 5 }; }
  const KCR = /[?&]oldpaths=1/.test(location.search) ? [] : keepClearRects(L); if (city.colliders) city.colliders.push(...KCR);   // s34: decoration keeps off Ben's paths
  const breeze = __TM('buildBreeze', buildBreeze)({ THREE, scene, L, city, touch });   // banners, windsocks, kites, sailboats, washing line
  const market = __TM('buildMarket', buildMarket)({ THREE, scene, L, city, toon, CT, touch });   // exterior polish round 2: market stalls + Lanes Court tables
  const gardens = __TM('buildGardens', buildGardens)({ THREE, scene, L, city, toon, touch });   // exterior polish round 3: South Gardens pond + bandstand, Civic Row trees
  const parade = __TM('buildParade', buildParade)({ THREE, scene, L, city, toon, CT, touch });   // exterior polish round 4: the parade ground
  const arenaRoad = __TM('buildArenaRoad', buildArenaRoad)({ THREE, scene, L, city, toon, touch });
  if (city.colliders) for (let i = city.colliders.length - 1; i >= 0; i--) if (city.colliders[i]._kc) city.colliders.splice(i, 1);
  const arena = __TM('buildArena', buildArena)({ THREE, scene, L, city, toon, CT, touch });   // the Meru Arena colosseum + forecourt (see-through arches, crowd, royal box)   // exterior polish round 4b: Arena Path fences, hay, wildflowers
  const town2 = __TM('buildTown2', buildTown2)({ THREE, scene, L, city, touch });   // s42: Town 2 exteriors (signs, side-door turn signs, props per building)
  const aviary = __TM('buildAviary', buildAviary)({ THREE, scene, L, city, toon, CT, touch });   // s41e: the walk-in Bird Aviary by the lake
  const lakeShore = __TM('buildLakeShore', buildLakeShore)({ THREE, scene, L, city, toon, touch });   // exterior polish round 6: Lake Path edging, viewing deck, beach set, lifeguard tower, swim floats
  const townGround = __TM('buildTownGround', buildTownGround)({ THREE, scene, L, toon, touch, city });   // exterior polish: raised kerbs at paving / lawn edges
  const mist = __TM('buildMist', buildMist)({ THREE, scene, L, terrainAt: heights.terrainAt, touch });   // exterior polish: fog + mist banks
  const districts = __TM('buildDistricts', buildDistricts)({ THREE, scene, L, bases: towers.userData.bases, touch, terrainAt: heights.terrainAt });   // every skyline tower reachable: plazas, entrances, dressing
  const plazaDress = __TM('buildPlazaDress', buildPlazaDress)({ THREE, scene, L, bases: towers.userData.bases, districts, touch, terrainAt: heights.terrainAt });   // exterior polish round 9: kiosks, planters, bikes, totems on the skyline plazas
  const hillsDress = __TM('buildHillsDress', buildHillsDress)({ THREE, scene, L, heights, touch });
  const trainSide = __TM('buildTrainSide', buildTrainSide)({ THREE, scene, L, train, touch });   // exterior polish round 11: pillar footings + bands, guideway light line, station aprons, metro totems, platform boards, night pools   // exterior polish round 10: trail posts + steps + benches, falls spray / veil / rocks / reeds, lookout + park dressing
  const __bakeG = () => { const __g0 = performance.now(); nature.bakeGrass([...city.colliders, ...city.props, ...train.colliders, ...heights.colliders, ...((paths && paths.colliders) || []), ...districts.colliders, ...breeze.colliders, ...trainSide.grassOff, ...rangerGrassOff(), ...(L.BUILDINGS || []).filter(b => b.kind === 'club' && b.f).map(b => ({ f: [b.f[0] - 24, b.f[1] + 2, b.f[2] - 6, (b.green ? b.green[3] : b.f[3]) + 1] }))]);   // s60: no meadow grass on the club grounds + valet lot · grass v2: never through props
  (window.__loadTimes = window.__loadTimes || []).push(['bakeGrass', Math.round(performance.now() - __g0)]); /[?&]loadlog=1/.test(location.search) && console.log('[load] bakeGrass ' + Math.round(performance.now() - __g0) + ' ms'); };
  { let done = false; const go = () => { if (done) return; done = true; window.__m2bakeGrass = null; __bakeG(); }; if (/[?&]grassnow=1/.test(location.search)) go(); else { window.__m2bakeGrass = go; setTimeout(go, 45000); } }   // s731 LOAD TIME: the meadow grass (~1.3 s) is baked right after GO TO MERU (meru2-walk __late calls window.__m2bakeGrass; 45 s fallback for pages without the walk); ?grassnow=1 = old way
  // ---------- the train (step 2b): worlds/meru2-train.js ----------

  // ---------- lamps along the foot paths (instanced) ----------
  const lampPts = []; for (const P of L.PATHS) for (let k = 0; k < P.p.length - 1; k++) { const [x0, z0] = P.p[k], [x1, z1] = P.p[k + 1], len = Math.hypot(x1 - x0, z1 - z0), nx = -(z1 - z0) / len, nz = (x1 - x0) / len; for (let t = 6; t < len; t += 12) { const x = x0 + (x1 - x0) * t / len, z = z0 + (z1 - z0) * t / len; for (const q of [[x + nx * 4, z + nz * 4], [x - nx * 4, z - nz * 4]]) if (!city.covers(q[0], q[1]) && !paths.covers(q[0], q[1]) && !arena.covers(q[0], q[1]) && !train.keepOut(q[0], q[1], 0) && !L.BUILDINGS.some(b => q[0] > b.f[0] - 1 && q[0] < b.f[1] + 1 && q[1] > b.f[2] - 1 && q[1] < b.f[3] + 1)) lampPts.push(q); } }
  const lampPost = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 5, 6), toon('#201e1d'), lampPts.length), lampHead = new THREE.InstancedMesh(new THREE.SphereGeometry(0.45, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c4 }), lampPts.length);
  { const M4 = new THREE.Matrix4(); lampPts.forEach(([x, z], i) => { M4.makeTranslation(x, 2.5, z); lampPost.setMatrixAt(i, M4); M4.makeTranslation(x, 5.1, z); lampHead.setMatrixAt(i, M4); }); scene.add(lampPost, lampHead); }
  const glowTex = CT(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,230,170,1)'); r.addColorStop(1, 'rgba(255,230,170,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const poolTex = CT(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,214,150,0.5)'); r.addColorStop(0.5, 'rgba(255,214,150,0.18)'); r.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const lampPool = new THREE.InstancedMesh(new THREE.PlaneGeometry(9, 9).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), lampPts.length);
  { const M4 = new THREE.Matrix4(); lampPts.forEach(([x, z], i) => { M4.makeTranslation(x, 0.07, z); lampPool.setMatrixAt(i, M4); }); lampPool.visible = false; scene.add(lampPool); }
  const glows = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lampPts.flatMap(([x, z]) => [x, 5.1, z]), 3)), new THREE.PointsMaterial({ map: glowTex, size: 5, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); glows.visible = false; scene.add(glows);

  // ---------- speakers + 7 m voice triggers ----------
  const spk = new THREE.Group(), rings = new THREE.Group(); scene.add(spk, rings);
  for (const s of L.SPEAKERS) { if (!Array.isArray(s.at) || s.tier > 2) continue; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 10), toon(s.newAvatar ? '#ffffff' : s.tier === 1 ? '#ec3013' : '#201e1d')); c.position.set(s.at[0], 1, s.at[1]); c.userData.key = s.key; spk.add(c);
    const r = new THREE.Mesh(new THREE.RingGeometry(6.8, 7, 48), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.6, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.set(s.at[0], 0.15, s.at[1]); rings.add(r); }

  // ---------- zone labels ----------
  const zoneLabels = new THREE.Group(); scene.add(zoneLabels);
  for (const z of L.ZONES) { const [cx, cz] = z.r ? [(z.r[0] + z.r[1]) / 2, (z.r[2] + z.r[3]) / 2] : [z.c[0], z.c[1]]; const lb = label(z.label.toUpperCase(), z.busy ? '#ec3013' : '#ffd23a', '#201e1d', 1); lb.center.set(0.5, 0.5); lb.position.set(cx, 30 + (z.key === 'meruCastle' ? 18 : 0), cz); zoneLabels.add(lb); }

  // ---------- sky, day / night ----------
  // step 9 pass 4: one sky canvas redrawn from a DAY -> DUSK -> NIGHT blend (t 0..1); setNight(on) eases through dusk in ~4 s
  const skyC = document.createElement('canvas'); skyC.width = 8; skyC.height = 256; const skyTex = new THREE.CanvasTexture(skyC); skyTex.colorSpace = THREE.SRGBColorSpace;
  // TOD polish: keyframes at t 0 DAY (warm, not washed) · 0.25 GOLDEN · 0.5 DUSK · 1 NIGHT (moonlit, readable). Hours map to t via HT; sun moves east -> west by hour
  const KT = [0, 0.25, 0.5, 1], KF = [
    { sky: ['#1d63c4', '#5a9be0', '#d8e6f2'], fog: '#b4cfe8', fn: 760, ff: 2100, hi: 0.72, hc: '#cfe0f5', hg: '#7a6a4c', si: 2.45, sc: '#ffe6c2', gr: '#f4ede2', out: '#5d8a38', wat: '#3f9ad2' },
    { sky: ['#3a62b4', '#f0ae78', '#ffd9a0'], fog: '#d9bf9e', fn: 700, ff: 2000, hi: 0.78, hc: '#ffe2c4', hg: '#6a5844', si: 2.25, sc: '#ffc88c', gr: '#f8ebdc', out: '#6a903e', wat: '#4f98cc' },
    { sky: ['#33407e', '#e5866c', '#ffc07c'], fog: '#b98478', fn: 560, ff: 1700, hi: 0.72, hc: '#ffc8ac', hg: '#4c3c46', si: 1.35, sc: '#ff8f5c', gr: '#f0d0c4', out: '#56704a', wat: '#5a7cb0' },
    { sky: ['#0f1a3c', '#2e3d74', '#56609a'], fog: '#2c3a6a', fn: 340, ff: 1400, hi: 0.88, hc: '#90a6ea', hg: '#2c3150', si: 0.7, sc: '#bccbff', gr: '#a6adc8', out: '#55686c', wat: '#26527e' }];
  const HT = [1, 1, 1, 1, 1, 0.75, 0.5, 0.25, 0.14, 0.05, 0, 0, 0, 0, 0, 0.05, 0.14, 0.25, 0.34, 0.5, 0.75, 1, 1, 1];
  const MOON = [300, 420, -200];
  const sunAt = h => { const a = Math.max(0.06, Math.min(Math.PI - 0.06, (Math.max(6, Math.min(19, h)) - 6) / 13 * Math.PI)); return [Math.cos(a) * 560, 170 + Math.sin(a) * 400, 260 - Math.sin(a) * 60]; };
  const cA = new THREE.Color(), cB = new THREE.Color(), lerpC = (a, b, u, out) => out.set(a).lerp(cB.set(b), u), mix = (a, b, u) => a + (b - a) * u;
  const TOD = { t: 0, goal: 0, h: 16, sp: sunAt(16), lights: null };
  scene.fog = new THREE.Fog(0xb9d8f3, 500, 1700);
  // step 9 night sky: stars + moon (no fog), red aviation beacons on the tall towers (blink in tick)
  const nightSky = new THREE.Group(); nightSky.visible = false; scene.add(nightSky);
  { const P = []; for (let i = 0; i < (touch ? 500 : 900); i++) { const a = Math.random() * Math.PI * 2, e = 0.12 + Math.pow(Math.random(), 0.7) * 1.4, R = 2600; P.push(Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R); }
    const dot = CT(32, 32, (g, w) => { const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(220,230,255,0.6)'); r.addColorStop(1, 'rgba(220,230,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
    nightSky.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(P, 3)), new THREE.PointsMaterial({ map: dot, size: 3, sizeAttenuation: false, transparent: true, depthWrite: false, fog: false, color: 0xdfe6ff })));
    const moonT = CT(128, 128, (g, w) => { const r = g.createRadialGradient(64, 64, 20, 64, 64, 64); r.addColorStop(0, 'rgba(255,248,226,1)'); r.addColorStop(0.36, 'rgba(255,248,226,1)'); r.addColorStop(0.42, 'rgba(200,210,255,0.35)'); r.addColorStop(1, 'rgba(160,180,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); g.fillStyle = 'rgba(190,180,160,0.35)'; for (const [x, y, s] of [[52, 54, 7], [72, 70, 5], [60, 78, 4], [76, 50, 3]]) { g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); } });
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonT, fog: false, depthWrite: false, transparent: true })); moon.scale.set(380, 380, 1); moon.position.set(-1200, 1100, 1300); nightSky.add(moon); }
  const beacon = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(beaconPts, 3)), new THREE.PointsMaterial({ map: glowTex, color: 0xff3a2a, size: 5, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); beacon.visible = false; scene.add(beacon);
  function applyTime(t) { let k = 0; while (k < KT.length - 2 && t > KT[k + 1]) k++; const u = Math.max(0, Math.min(1, (t - KT[k]) / (KT[k + 1] - KT[k]))), A = KF[k], B = KF[k + 1];
    const g = skyC.getContext('2d'), r = g.createLinearGradient(0, 0, 0, 256); [0, 0.72, 1].forEach((p, i) => r.addColorStop(p, '#' + lerpC(A.sky[i], B.sky[i], u, cA).getHexString())); g.fillStyle = r; g.fillRect(0, 0, 8, 256); skyTex.needsUpdate = true; scene.background = skyTex;
    lerpC(A.fog, B.fog, u, scene.fog.color); scene.fog.near = mix(A.fn, B.fn, u); scene.fog.far = mix(A.ff, B.ff, u); mist.setTime(t); hemi.intensity = mix(A.hi, B.hi, u); lerpC(A.hc, B.hc, u, hemi.color); lerpC(A.hg, B.hg, u, hemi.groundColor);
    sun.intensity = mix(A.si, B.si, u); lerpC(A.sc, B.sc, u, sun.color);
    IND.base = { hi: hemi.intensity, hc: hemi.color.clone(), hg: hemi.groundColor.clone(), si: sun.intensity, sc: sun.color.clone() };
    lerpC(A.gr, B.gr, u, ground.material.color); lerpC(A.out, B.out, u, outer.material.color); lerpC(A.wat, B.wat, u, water.material.color);
    const n = Math.max(0, Math.min(1, (t - 0.3) / 0.6)); TWU.uNight.value = n * n * (3 - 2 * n); towers.material.emissive.setRGB(0.03 * n, 0.045 * n, 0.08 * n);
    nature.setNight(Math.max(0, Math.min(1, (t - 0.3) / 0.6))); nightSky.visible = t > 0.55; nightSky.children.forEach(c => { c.material.opacity = Math.min(1, (t - 0.55) / 0.35); });
    const lit = t > 0.4; if (lit !== TOD.lights) { TOD.lights = lit; beacon.visible = lampPool.visible = glows.visible = lit; city.setNight(lit); signs.setNight(lit); districts.setNight(lit); train.setNight(lit); heights.setNight(lit); trainSide.setNight(lit); paths.setNight(lit); arena.setNight(lit); townGround.setNight(lit); market.setNight(lit); lakeShore.setNight(lit); if (typeof caveFire !== 'undefined' && caveFire) for (const f of caveFire) f.material.color.set(lit ? 0xd9b8ff : 0x8a6fd0); gold.color.set(lit ? 0xffd86b : 0xffc64a); } }
  const IN_HC = new THREE.Color('#ffe6cc'), IN_HCN = new THREE.Color('#ffcf98'), IN_HG = new THREE.Color('#4a3a30'), IN_SC = new THREE.Color('#fff0d8');
  function indoorTick(dt, now) { const bx = city.insideBox, C = IND.cfg; IND.k += ((bx ? 1 : 0) - IND.k) * Math.min(1, dt * 3.5); if (bx) IND.box = bx;
    const k = IND.k < 0.002 ? 0 : IND.k, B0 = IND.base; if (!B0) return;
    if (!k && IND.was === 0) return; IND.was = k;
    const n = Math.max(0, Math.min(1, (TOD.t - 0.3) / 0.6));
    const RL = (IND.box && ROOM_LIT[IND.box.key]) || 1; hemi.intensity = mix(B0.hi, mix(C.sky, C.skyNight, n) * RL, k); hemi.color.copy(B0.hc).lerp(cA.copy(IN_HC).lerp(IN_HCN, n), k); hemi.groundColor.copy(B0.hg).lerp(IN_HG, k);
    sun.intensity = mix(B0.si, B0.si * C.sunIn, k); sun.color.copy(B0.sc).lerp(IN_SC, k * 0.5);
    const q = IND.box; if (q) { const w = q.x1 - q.x0, d = q.z1 - q.z0, cy = Math.min(q.h - 0.5, 3.4), big = Math.max(w, d);
      const many = big > 14, cx = (q.x0 + q.x1) / 2, cz = (q.z0 + q.z1) / 2, alongX = w >= d, Lk = k * mix(C.lamp, C.lampNight, n) * RL * ((LIGHT_PLAN[q.key] || 0).lampX || 1) * (1 + 0.015 * Math.sin(now / 130));
      const PL = LIGHT_PLAN[q.key], LC = PL && PL.col != null ? cA.set(PL.col) : null; if (PL && PL.lamps) { roomLamps.forEach((L, i) => { const p = PL.lamps[i]; if (!p) { L.intensity = 0; return; } L.position.set(p[0], cy, p[1]); L.distance = PL.dist || 12; L.color.setRGB(1, mix(0.88, 0.78, n), mix(0.7, 0.52, n)); L.intensity = Lk; }); } else
      roomLamps.forEach((L, i) => { const off = many ? (i - 1) * big / 3 : 0; if (!many && i) { L.intensity = 0; return; } L.position.set(cx + (alongX ? off : 0), cy, cz + (alongX ? 0 : off)); L.distance = many ? big * 0.45 + 6 : big * 0.85 + 5; if (LC) { L.color.copy(LC); L.color.g *= mix(1, 0.9, n); L.color.b *= mix(1, 0.75, n); } else L.color.setRGB(1, mix(0.9, 0.8, n), mix(0.76, 0.56, n)); L.intensity = many ? Lk * 0.8 : Lk; });
      if (PL && PL.even && !many) roomLamps.forEach((L, i) => { const off = (i - 1) * big / 3; L.position.set(cx + (alongX ? off : 0), cy, cz + (alongX ? 0 : off)); L.distance = big * 0.6 + 5; L.intensity = Lk * 0.75; if (LC) L.color.copy(LC); });   // s722 even = 3 lamps even in a small room
      roomFill.position.set((q.x0 + q.x1) / 2, 1.4, q.z0 + d * 0.12); roomFill.distance = big * 0.7 + 3; roomFill.color.set(PL && PL.fillCol != null ? PL.fillCol : n > 0.5 ? 0xffd8a8 : 0xcfe2ff); roomFill.intensity = k * C.fill * mix(1, 0.6, n) * ((PL && PL.fillX) || 1);
      if (spotKey !== q.key) { spotKey = q.key; const SL = PL && PL.spots ? (typeof PL.spots === 'function' ? PL.spots(q) : PL.spots) : null; SPOTS.forEach((s, i) => { const p = SL && SL[i]; s.userData.p = p || null; if (p) placeSpot(s, p); else s.intensity = 0; }); }
      SPOTS.forEach(s => { const p = s.userData.p; s.intensity = p ? k * p.i * mix(1, 1.15, n) : 0; }); }
    if (!k) { roomLamps.forEach(L => { L.intensity = 0; }); SPOTS.forEach(s => { s.intensity = 0; }); spotKey = null; roomFill.intensity = 0; hemi.intensity = B0.hi; hemi.color.copy(B0.hc); hemi.groundColor.copy(B0.hg); sun.intensity = B0.si; sun.color.copy(B0.sc); } }
  function sunGoal() { const d = sunAt(TOD.h), m = Math.max(0, Math.min(1, (TOD.goal - 0.5) / 0.5)); TOD.sp = d.map((v, i) => mix(v, MOON[i], m)); }
  function setHour(h, instant) { TOD.h = ((Math.round(h) % 24) + 24) % 24; TOD.goal = HT[TOD.h]; sunGoal(); if (instant) { TOD.t = TOD.goal; sun.position.set(...TOD.sp); applyTime(TOD.t); } return TOD.h; }
  function setNight(on, instant) { setHour(on ? 22 : 16, instant); }
  function setTime(t) { TOD.goal = TOD.t = Math.max(0, Math.min(1, t)); sunGoal(); sun.position.set(...TOD.sp); applyTime(TOD.t); }
  setNight(false, true);

  // ---------- camera: orbit (drag), pinch / wheel zoom, fly to ----------
  const C = { tx: 0, tz: 40, yaw: -0.6, pitch: 0.95, dist: 620, goal: null };
  const el = renderer.domElement, ptr = new Map(); let pd = 0;
  el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); ptr.set(e.pointerId, [e.clientX, e.clientY, e.button]); C.goal = null; });
  el.addEventListener('pointermove', e => { const p = ptr.get(e.pointerId); if (!p) return; const dx = e.clientX - p[0], dy = e.clientY - p[1]; p[0] = e.clientX; p[1] = e.clientY;
    if (ptr.size === 2) { const [a, b] = [...ptr.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pd) C.dist = THREE.MathUtils.clamp(C.dist * pd / d, 40, 1100); pd = d; return; }
    if (p[2] === 2 || e.shiftKey) { const s = C.dist / 700; C.tx -= (Math.cos(C.yaw) * dx + Math.sin(C.yaw) * dy) * s; C.tz -= (-Math.sin(C.yaw) * dx + Math.cos(C.yaw) * dy) * s; }
    else { C.yaw -= dx * 0.006; C.pitch = THREE.MathUtils.clamp(C.pitch + dy * 0.004, 0.18, 1.45); } });
  const up = e => { ptr.delete(e.pointerId); if (ptr.size < 2) pd = 0; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('wheel', e => { e.preventDefault(); C.dist = THREE.MathUtils.clamp(C.dist * (1 + Math.sign(e.deltaY) * 0.1), 40, 1100); C.goal = null; }, { passive: false });
  function flyTo(key) { if (key === 'all') { C.goal = { tx: 0, tz: 40, dist: 620, pitch: 0.95 }; return; } const z = L.ZONES.find(q => q.key === key); if (!z) return; const [cx, cz, s] = z.r ? [(z.r[0] + z.r[1]) / 2, (z.r[2] + z.r[3]) / 2, Math.max(z.r[1] - z.r[0], z.r[3] - z.r[2])] : [z.c[0], z.c[1], z.c[2] * 2]; C.goal = { tx: cx, tz: cz, dist: THREE.MathUtils.clamp(s * 1.25, 70, 700), pitch: 0.75 }; }
  function pan(dx, dz) { C.goal = null; C.tx += dx; C.tz += dz; }

  // ---------- loop ----------
  let raf = 0, last = performance.now(), dead = false, driver = null, driverErr = null;
  function size() { const w = container.clientWidth, h = container.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? Math.min(70, Math.max(50, 2 * Math.atan(Math.tan(17 * Math.PI / 180) / camera.aspect) * 180 / Math.PI)) : 50; camera.updateProjectionMatrix(); }   // pass 7: portrait phones keep at least a 34° horizontal view
  const ro = new ResizeObserver(size); ro.observe(container); size();
  // window.__m2sleep: a minigame panel is open, so the town stops drawing (one 3D scene at a time on phones)
  function frame(now) { if (dead) return; raf = requestAnimationFrame(frame); const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now; if (window.__m2sleep || window.__m2loading) return;
    if (C.goal) { const k = 1 - Math.exp(-dt * 3); for (const f of ['tx', 'tz', 'dist', 'pitch']) C[f] += (C.goal[f] - C[f]) * k; }
    if (TOD.t !== TOD.goal) { TOD.t = TOD.goal > TOD.t ? Math.min(TOD.goal, TOD.t + dt / 4) : Math.max(TOD.goal, TOD.t - dt / 4); applyTime(TOD.t); }
    { const p = sun.position, k = 1 - Math.exp(-dt * 0.9), q = TOD.sp; if (Math.abs(p.x - q[0]) + Math.abs(p.y - q[1]) + Math.abs(p.z - q[2]) > 0.5) p.set(mix(p.x, q[0], k), mix(p.y, q[1], k), mix(p.z, q[2], k)); }
    indoorTick(dt, now); TWU.uWT.value = (now / 1000) % 10000; train.tick(dt, now); if (beacon.visible) beacon.material.opacity = (now % 1600) < 500 ? 1 : 0.15;
    if (driver) { try { driver(dt, now); } catch (e) { if (!driverErr) console.warn('walk frame: ' + (e && e.stack || e)); driverErr = e; try { window.__driverErr = String(e && e.stack || e).slice(0, 2000); } catch (e2) {} } } else { const cp = Math.cos(C.pitch), sp = Math.sin(C.pitch); camera.position.set(C.tx + Math.sin(C.yaw) * cp * C.dist, sp * C.dist + 4, C.tz + Math.cos(C.yaw) * cp * C.dist); camera.lookAt(C.tx, 0, C.tz); }
    aviary.tick(dt, now, camera.position); city.tick(dt, now); signs.tick(dt, now, camera.position); nature.tick(dt, now, camera.position); districts.tick(dt, now, camera.position); plazaDress.tick(dt, camera.position); hillsDress.tick(dt, camera.position); breeze.tick(dt, now, camera.position); mist.tick(dt, now); market.tick(camera.position); gardens.tick(camera.position); parade.tick(dt, camera.position); arenaRoad.tick(camera.position); arena.tick(dt, now, camera.position); lakeShore.tick(camera.position, now); town2.tick(dt, now); if (typeof caveFire !== 'undefined' && caveFire) for (const [i, f] of caveFire.entries()) { const k = 1 + Math.sin(now / 90 + i * 2) * 0.12; f.scale.set(1 / k, k, 1 / k); } heights.tick(dt); paths.tick(dt);
    for (const h of hires) h.s.rotation.y = Math.sin(now / 900) * 0.05;
    zoneLabels.children.forEach(s => s.scale.set(C.dist * 0.042 * 3, C.dist * 0.042 * 0.57, 1));
    labels.visible = driver ? false : C.dist < 420; zoneLabels.visible = !driver && zoneLabels.userData.on !== false;
    if (window.__m2camHook) try { window.__m2camHook(camera); } catch (e) {} foxCull(now); batchTick(now); propCull(now); renderer.render(scene, camera); }   // s104e: the hook runs BEFORE the culls, so they measure from the game camera (not the paused walker's)   // s104: a world-mode minigame (Speedboat Bay) drives the camera
  raf = requestAnimationFrame(frame);
  onState({ ready: true, counts: { buildings: L.BUILDINGS.length, speakers: L.SPEAKERS.length, lamps: lampPts.length + city.stats.lamps, hiring: L.BUILDINGS.filter(b => b.hiring).length, doors: city.stats.doors, trees: city.stats.trees, cars: city.stats.cars } });
  const API = window.__meru2 = { _pump(n = 1, ms = 33) { for (let i = 0; i < n; i++) { cancelAnimationFrame(raf); const t = performance.now() + i * ms; last = t - ms; frame(t); } }, flyTo, pan, setNight, setTime, setHour, addHour: (n = 1) => setHour(TOD.h + n), hour: () => TOD.h, indoor: { get k() { return IND.k; }, cfg: IND.cfg, set(o) { Object.assign(IND.cfg, o); try { localStorage.setItem('meru.indoor.v2', JSON.stringify(IND.cfg)); } catch (e) {} }, roomLit: ROOM_LIT, lightPlan: LIGHT_PLAN },
    light: { tune: LT, get key() { return city.insideBox ? city.insideBox.key : null; }, box: () => city.insideBox || null, lit: k => ROOM_LIT[k] || 1,
      plan(k) { const P = LIGHT_PLAN[k] || {}, q = city.insideBox && city.insideBox.key === k ? city.insideBox : null, sp = typeof P.spots === 'function' ? (q ? P.spots(q) : []) : (P.spots || []);
        return { lit: ROOM_LIT[k] || 1, lampX: P.lampX || 1, fillX: P.fillX || 1, col: P.col != null ? P.col : null, fillCol: P.fillCol != null ? P.fillCol : null, even: !!P.even, lamps: P.lamps || null, spots: sp.map(s => ({ ...s })), tuned: !!LT[k] }; },
      set(k, patch) { LT[k] = Object.assign(LT[k] || {}, patch); for (const f of Object.keys(LT[k])) if (LT[k][f] == null) delete LT[k][f]; ltApply(k); spotKey = null; try { localStorage.setItem(LT_KEY, JSON.stringify(LT)); } catch (e) {} },
      reset(k) { delete LT[k]; ltApply(k); spotKey = null; try { localStorage.setItem(LT_KEY, JSON.stringify(LT)); } catch (e) {} },
      all: () => JSON.parse(JSON.stringify(LT)) }, isNight: () => TOD.goal > 0.4, time: () => TOD.t, water, show(what, on) { if (what === 'labels') zoneLabels.userData.on = on; ({ rings, labels: zoneLabels, speakers: spk, towers, doors: doorsG })[what].visible = on; },
    K: { THREE, scene, camera, renderer, toon, grad, CT, L, el, I }, city, signs, nature, districts, breeze, mist, market, gardens, parade, train, heights, paths, arena, spk, rings, ownBlocks, setDriver(fn) { driver = fn; }, orbit: C,
    zones: L.ZONES.map(z => ({ key: z.key, label: z.label })), destroy() { dead = true; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.remove(); } };   // window.__meru2 = test hook
  return API;
}
