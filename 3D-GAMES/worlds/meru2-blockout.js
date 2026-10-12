// MERU 2.0 — step 1b BLOCKOUT. Builds the whole 900 m map in 3D straight from worlds/meru2-layout.js:
// painted ground (surfaces, roads, train line), the lake + Pearl Island (hills, valley, deep pond), every building as a block with
// a gold-framed door + NOW HIRING sign, the train track + stations, a skyline of glass towers, lamps along the foot paths, speakers
// with their 7 m voice triggers, zone labels. Orbit camera (drag / pinch / wheel), fly-to zones, day / night. Phone budget: one ground
// texture, instanced lamps + towers, ~200 draw calls.
import * as THREE from '../vendor/three/three.module.js';
import * as L from './meru2-layout.js';
import { buildCity } from './meru2-city.js';
import { buildTrain } from './meru2-train.js';
import { buildHeights } from './meru2-heights.js';
import { buildPaths } from './meru2-paths.js';
import { buildSigns } from './meru2-signs.js';
import { buildNature } from './meru2-nature.js';
import { buildDistricts } from './meru2-districts.js';
import { buildBreeze } from './meru2-breeze.js';
import { buildMist } from './meru2-mist.js';
import { buildTownGround, paintTownPaving } from './meru2-ground.js';
import { buildMarket } from './meru2-market.js';
import { buildGardens } from './meru2-gardens.js';
import { buildParade, paintParade } from './meru2-parade.js';
import { buildArenaRoad } from './meru2-arenaroad.js';

export async function createBlockout({ container, onState = () => {} }) {
  const touch = matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(touch ? 1.5 : 2, devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !touch; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement); Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block', touchAction: 'none' });
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, 1, 4000);
  const hemi = new THREE.HemisphereLight(0xdfeeff, 0x6f7a5a, 1.1), sun = new THREE.DirectionalLight(0xfff1dc, 2.2);
  sun.position.set(-300, 420, 200); sun.castShadow = !touch; Object.assign(sun.shadow.camera, { left: -500, right: 500, top: 500, bottom: -500, far: 1400 }); sun.shadow.mapSize.set(2048, 2048); scene.add(hemi, sun);
  const grad = (() => { const d = new Uint8Array([80, 170, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.needsUpdate = true; return t; })();
  const toon = (c, o = {}) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...o });
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const H = L.MAP.half, SZ = H * 2;
  try { if (document.fonts) await document.fonts.load('900 52px Archivo'); } catch (e) {}

  // ---------- ground: one painted texture ----------
  const SC = { stone: '#cfcac3', grass: '#6e9c4a', grit: '#c9b48a', sand: '#ead9a6', wood: '#b08b5e', rug: '#8f6aa8' };
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
    for (const S of L.SURFACES) { g.fillStyle = SC[S.s]; if (S.s === 'sand' && S.r) { beach(g, k, X, Z); continue; } if (S.r) g.fillRect(X(S.r[0]), Z(S.r[2]), (S.r[1] - S.r[0]) * k, (S.r[3] - S.r[2]) * k); else { g.beginPath(); g.arc(X(S.c[0]), Z(S.c[1]), S.c[2] * k, 0, 7); g.fill(); }
      if (S.s === 'grass') { if (S.r) mow(S.r[0], S.r[1], S.r[2], S.r[3]); else mow(S.c[0] - S.c[2], S.c[0] + S.c[2], S.c[1] - S.c[2], S.c[1] + S.c[2], () => g.arc(X(S.c[0]), Z(S.c[1]), S.c[2] * k, 0, 7)); } }
    for (const P of L.SKYLINE.plazas) { const r = P.r; for (let x = r[0]; x < r[1]; x += 2) for (let z = r[2]; z < r[3]; z += 2) if (L.lakeF(x + 1, z + 1) > 1.14) { g.fillStyle = (Math.floor(x / 6) + Math.floor(z / 6)) % 2 ? '#cfcac3' : '#c8c2b9'; g.fillRect(X(x), Z(z), 2 * k + 0.5, 2 * k + 0.5); } }
    paintTownPaving(g, k, X, Z, L); paintParade(g, k, X, Z);   // exterior polish: border courses, fountain rings
    g.strokeStyle = 'rgba(0,0,0,0.08)'; g.lineWidth = 1; for (let x = -45; x <= 45; x += 3) { g.beginPath(); g.moveTo(X(x), Z(-40)); g.lineTo(X(x), Z(40)); g.stroke(); }   // plaza paving joints
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const r of L.ROADS) { const line = (col, wd, dash) => { g.strokeStyle = col; g.lineWidth = wd * k; g.setLineDash(dash || []); g.beginPath(); r.p.forEach(([x, z], i) => i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))); g.stroke(); g.setLineDash([]); };
      line('#e8e4dc', r.w + 3); line('#3d3b3a', r.w); line('#f5d35a', 0.35, [3 * k, 3 * k]); }
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
  const isl = new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), touch ? 96 : 160), new THREE.MeshToonMaterial({ gradientMap: grad, vertexColors: true, side: THREE.DoubleSide }));
  { const pos = isl.geometry.attributes.position, col = []; const c = new THREE.Color(); for (let i = 0; i < pos.count; i++) { const y = pos.getY(i), r = Math.hypot(pos.getX(i), pos.getZ(i)); c.set(r > I.hills[2] + 2 ? (y < 0.2 ? '#bfa877' : y < 0.6 ? '#dcc796' : SC.sand) : y > 9 ? '#7fa865' : y > 1 ? '#93ba73' : y < -2 ? '#5e6b5a' : '#a9c48a'); col.push(c.r, c.g, c.b); } isl.geometry.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), r = Math.hypot(x, z); if (r > 30) { const m = 30 + (r - 30) * L.islandM(Math.atan2(z, x)); pos.setX(i, x / r * m); pos.setZ(i, z / r * m); } } isl.geometry.computeVertexNormals(); }
  isl.position.set(I.pond.x, 0, I.pond.z); isl.castShadow = isl.receiveShadow = true; scene.add(isl);
  const pond = new THREE.Mesh(new THREE.CircleGeometry(I.pond.r, 40), new THREE.MeshPhongMaterial({ color: 0x15507d, shininess: 120, transparent: true, opacity: 0.92 })); pond.rotation.x = -Math.PI / 2; pond.position.set(I.pond.x, 0.4, I.pond.z); scene.add(pond);

  // ---------- step 2: the Town Square city centre (real shells, sliding doors, cutaway, plaza, cars) ----------
  const train = buildTrain({ THREE, scene, toon, grad, CT, L, touch });
  const city = buildCity({ THREE, scene, camera, toon, grad, CT, L, touch, avoid: (x, z, m) => train.keepOut(x, z, m) });
  const signs = buildSigns({ THREE, scene, CT, L, city, touch });   // art pass: a signature animated sign per building
  const heights = buildHeights({ THREE, scene, toon, grad, CT, L, touch });
  const nature = buildNature({ THREE, scene, L, groundCanvas: groundTex.image, heightAt: (x, z) => heights.terrainAt(x, z), touch });   // grass blades in the wind, clouds, birds   // step 3 part 4: hills, trails, decks, lighthouses
  const paths = buildPaths({ THREE, scene, toon, CT, L, touch, avoid: (x, z, m) => train.keepOut(x, z, m) || city.covers(x, z) });   // step 4: the four paths
  // ---------- buildings ----------
  const HGT = { tavern: 9, casino: 14, bowling: 10, itemshop: 6, armory: 6, fortune: 5, burgers: 6, police: 12, bank: 16, carRental: 5, crest: 34, lake: 46, barracks: 14, tankWorks: 12, tankRange: 10, defense: 6, museum: 10, permit: 5, cave: 18, blindSchool: 10, boatworks: 8, boathouse: 7, ferryDock: 3, skateGate: 4 };
  const COL = { tavern: '#b8936a', casino: '#3a2f4a', bowling: '#c94c3a', police: '#2e4a6b', bank: '#e9e3d6', crest: '#a9bccb', lake: '#8fb8cf', barracks: '#9b8f7d', tankWorks: '#6c7166', tankRange: '#7a7a63', defense: '#5f6b5a', museum: '#c9bba0', cave: '#6e6458', blindSchool: '#e8d9b8', boatworks: '#8b6a48', boathouse: '#7d5e43' };
  const gold = new THREE.MeshBasicMaterial({ color: 0xffc64a }), glass = new THREE.MeshPhongMaterial({ color: 0x9fd6ff, transparent: true, opacity: 0.45, shininess: 100 });
  const hireTex = CT(256, 96, (g, w, h) => { g.fillStyle = '#16a34a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = '900 38px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('NOW', 18, 30); g.fillText('HIRING', 18, 70); g.fillStyle = '#ffd23a'; g.fillRect(w - 50, 22, 30, 52); g.fillStyle = '#16a34a'; g.beginPath(); g.moveTo(w - 42, 32); g.lineTo(w - 26, 48); g.lineTo(w - 42, 64); g.fill(); });
  const hireMat = new THREE.MeshBasicMaterial({ map: hireTex }), FACE = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  const label = (txt, col = '#201e1d', bg = '#ffffff', s = 1) => { const t = CT(512, 96, (g, w, h) => { g.font = '900 52px Archivo, sans-serif'; const tw = Math.min(w - 20, g.measureText(txt).width + 32); g.fillStyle = bg; g.fillRect(0, 10, tw, 76); g.fillStyle = col; g.fillRect(0, 10, 10, 76); g.fillStyle = bg === '#ffffff' ? '#201e1d' : '#ffffff'; g.textBaseline = 'middle'; g.fillText(txt, 22, 50, tw - 30); });
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); sp.scale.set(26 * s, 4.9 * s, 1); sp.center.set(0, 0.5); sp.renderOrder = 10; return sp; };
  const labels = new THREE.Group(), doorsG = new THREE.Group(), hires = [], ownBlocks = {}; scene.add(labels, doorsG);
  for (const b of L.BUILDINGS) { const [x0, x1, z0, z1] = b.f, w = x1 - x0, d = z1 - z0, cb = city.keys.has(b.key), h = cb ? city.heightOf(b.key) : HGT[b.key] || (b.key.startsWith('station') ? 8 : 7), st = b.key.startsWith('station');
    if (!cb && !b.open) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(st ? '#d9d4cc' : COL[b.key] || '#d6cfc4')); m.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; scene.add(m); if (b.own) ownBlocks[b.key] = m;   // own-shell buildings (barracks): the walk module hides this and builds the real one
    if (st) { const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 4, 0.8, d + 4), toon('#ec3013')); roof.position.set(m.position.x, h + 0.4, m.position.z); scene.add(roof); }
    if (b.door && b.key !== 'cave') { const [fx, fz] = FACE[b.face], dw = 4, dh = 4.5, g = new THREE.Group(); g.position.set(b.door[0] + fx * 0.15, 0, b.door[1] + fz * 0.15); g.rotation.y = Math.atan2(fx, fz); doorsG.add(g);
      for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.45, dh + 0.45, 0.4), gold); p.position.set(sx * (dw / 2 + 0.22), (dh + 0.45) / 2, 0); g.add(p); }
      const top = new THREE.Mesh(new THREE.BoxGeometry(dw + 0.9, 0.45, 0.4), gold); top.position.y = dh + 0.22; g.add(top);
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(dw, dh), glass); gl.position.set(0, dh / 2, 0.05); g.add(gl);
      if (b.hiring) { const s = new THREE.Group(); s.position.set(dw / 2 + 2.2, 0, 1.2); g.add(s); const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 0.15), toon('#201e1d')); post.position.y = 0.8; s.add(post); const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.82), hireMat); pl.position.y = 2.0; s.add(pl); const back = pl.clone(); back.rotation.y = Math.PI; s.add(back); hires.push({ b, s }); } } }
    const lb = label(b.label.toUpperCase(), st ? '#ec3013' : '#201e1d', '#ffffff', 0.55); lb.position.set(x0, h + 6, (z0 + z1) / 2); labels.add(lb); }
  // the cave mouth: rock face + broken columns
  { const c = L.BUILDINGS.find(b => b.key === 'cave'); if (c) { const [x0, x1, z0, z1] = c.f; const rock = toon('#6e6458'); for (let i = 0; i < 9; i++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(6 + Math.random() * 6), rock); r.position.set(x0 - 6 + Math.random() * 10, 4 + Math.random() * 8, z0 - 18 + i * 6); r.castShadow = true; scene.add(r); }
    const mouth = new THREE.Mesh(new THREE.CircleGeometry(6, 24, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x0b0a0a })); mouth.position.set(x1 + 0.2, 0, (z0 + z1) / 2); mouth.rotation.y = Math.PI / 2; scene.add(mouth);
    for (let i = 0; i < 8; i++) { const hgt = 2 + Math.random() * 6, col = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, hgt, 10), toon('#cfc2a4')); col.position.set(x1 + 6 + (i % 4) * 5, hgt / 2, z0 - 8 + Math.floor(i / 4) * 40 + Math.random() * 4); col.rotation.z = (Math.random() - 0.5) * 0.15; col.castShadow = true; scene.add(col); } } }

  // ---------- skyline towers (instanced, outside the ring road) ----------
  // step 9: glass towers get a world-space window grid (mullions by day, random lit windows at night) in the shader: no textures, 1 draw call
  const TWU = { uNight: { value: 0 }, uLit: { value: 0.45 } }, beaconPts = [];
  // SKYLINE v2 (Ben: "the empty skyrises block the train view"): the 120 random towers are gone. Now ~30 towers in 5 named DISTRICTS, each with its own
  // facade style (aSty in the window shader) and a LANDMARK: SPIRE DISTRICT (NE, twisting Meru Spire) · DECO QUARTER (NW, stepped gold-crowned Gatekeeper)
  // · PEARL QUARTER (SE lakeside, the Pearl Sail) · GARDEN TWINS (SW by the falls, skybridge + roof gardens) · FAR EAST (backdrop past the map edge).
  // Wide gaps between districts = view corridors; nothing tall within ~70 m of the train line.
  { const towersG = new THREE.Group(); scene.add(towersG); var towers = towersG;
    const geo = new THREE.BoxGeometry(1, 1, 1), mat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 80, specular: 0xffffff, emissive: 0x000000 }); towers.material = mat;
    mat.onBeforeCompile = sh => { Object.assign(sh.uniforms, TWU);
      sh.vertexShader = 'attribute float aSty; varying float vSty; varying vec3 vTW; varying vec3 vTN;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vec4 tw = vec4(transformed, 1.0); vec3 tn = normal;\n #ifdef USE_INSTANCING\n tw = instanceMatrix * tw; tn = mat3(instanceMatrix) * tn;\n #endif\n vTW = (modelMatrix * tw).xyz; vTN = normalize(mat3(modelMatrix) * tn); vSty = aSty;');
      sh.fragmentShader = 'uniform float uNight; uniform float uLit; varying float vSty; varying vec3 vTW; varying vec3 vTN;\n' + sh.fragmentShader
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
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n float tLit = step(1.0 - uLit * (0.55 + tRow * 0.9), tH);\n vec3 tCol = mix(vec3(1.0, 0.8, 0.48), vec3(0.72, 0.86, 1.0), step(0.72, fract(tH * 7.31)));\n totalEmissiveRadiance += tCol * tWin * tLit * uNight * (0.75 + 0.5 * fract(tH * 3.7)) + vec3(1.0, 0.82, 0.55) * tLob * uNight * 0.55 * step(0.6, tf.y);'); };
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
    for (const [x, z, w, d, h] of [[-372, 250, 14, 14, 40], [-284, 252, 14, 16, 48]]) { tower(x, z, w, d, h, GT, 3); for (let k = 0; k < 3; k++) LEAF.push([x + (R() - 0.5) * 9, h + 2, z + (R() - 0.5) * 9, 1.6 + R()]); }
    // (Far East backdrop removed: past the map edge, nothing there could be reached)
    // build: towers (1 instanced draw, colour + style per box), gold trims (unlit gold, reads at night), spires, rooftop plant, masts, roof trees
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
      { x: 335, z: -205, w: 27, d: 27, h: 200, lm: true }, { x: 383, z: 243, w: 50, d: 38, h: 150, lm: true, face: 'N' }];
    ib(geo, toon('#cfcac3'), FEET); ib(geo, new THREE.MeshPhongMaterial({ color: 0x2b3440, shininess: 90, specular: 0x9fb6c8 }), POD);
    ib(geo, toon('#5d636b'), PB); ib(new THREE.CylinderGeometry(0.5, 1, 1, 6), toon('#8a9099'), MS);
    ib(new THREE.IcosahedronGeometry(1, 0), toon('#5f8f45'), LEAF.map(a => [a[0], a[1], a[2], a[3], a[3] * 0.9, a[3]]));
    towers.userData.stats = { boxes: BX.length, districts: 5 }; }
  const breeze = buildBreeze({ THREE, scene, L, city, touch });   // banners, windsocks, kites, sailboats, washing line
  const market = buildMarket({ THREE, scene, L, city, toon, CT, touch });   // exterior polish round 2: market stalls + Lanes Court tables
  const gardens = buildGardens({ THREE, scene, L, city, toon, touch });   // exterior polish round 3: South Gardens pond + bandstand, Civic Row trees
  const parade = buildParade({ THREE, scene, L, city, toon, CT, touch });   // exterior polish round 4: the parade ground
  const arenaRoad = buildArenaRoad({ THREE, scene, L, city, toon, touch });   // exterior polish round 4b: Arena Path fences, hay, wildflowers
  const townGround = buildTownGround({ THREE, scene, L, toon, touch, city });   // exterior polish: raised kerbs at paving / lawn edges
  const mist = buildMist({ THREE, scene, L, terrainAt: heights.terrainAt, touch });   // exterior polish: fog + mist banks
  const districts = buildDistricts({ THREE, scene, L, bases: towers.userData.bases, touch, terrainAt: heights.terrainAt });   // every skyline tower reachable: plazas, entrances, dressing
  nature.bakeGrass([...city.colliders, ...city.props, ...train.colliders, ...heights.colliders, ...((paths && paths.colliders) || []), ...districts.colliders, ...breeze.colliders]);   // grass v2: never through props
  // ---------- the train (step 2b): worlds/meru2-train.js ----------

  // ---------- lamps along the foot paths (instanced) ----------
  const lampPts = []; for (const P of L.PATHS) for (let k = 0; k < P.p.length - 1; k++) { const [x0, z0] = P.p[k], [x1, z1] = P.p[k + 1], len = Math.hypot(x1 - x0, z1 - z0), nx = -(z1 - z0) / len, nz = (x1 - x0) / len; for (let t = 6; t < len; t += 12) { const x = x0 + (x1 - x0) * t / len, z = z0 + (z1 - z0) * t / len; for (const q of [[x + nx * 4, z + nz * 4], [x - nx * 4, z - nz * 4]]) if (!city.covers(q[0], q[1]) && !paths.covers(q[0], q[1]) && !train.keepOut(q[0], q[1], 0) && !L.BUILDINGS.some(b => q[0] > b.f[0] - 1 && q[0] < b.f[1] + 1 && q[1] > b.f[2] - 1 && q[1] < b.f[3] + 1)) lampPts.push(q); } }
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
  for (const z of L.ZONES) { const [cx, cz] = z.r ? [(z.r[0] + z.r[1]) / 2, (z.r[2] + z.r[3]) / 2] : [z.c[0], z.c[1]]; const lb = label(z.label.toUpperCase(), z.busy ? '#ec3013' : '#ffd23a', '#201e1d', 1); lb.center.set(0.5, 0.5); lb.position.set(cx, 30, cz); zoneLabels.add(lb); }

  // ---------- sky, day / night ----------
  // step 9 pass 4: one sky canvas redrawn from a DAY -> DUSK -> NIGHT blend (t 0..1); setNight(on) eases through dusk in ~4 s
  const skyC = document.createElement('canvas'); skyC.width = 8; skyC.height = 256; const skyTex = new THREE.CanvasTexture(skyC); skyTex.colorSpace = THREE.SRGBColorSpace;
  const KF = [
    { sky: ['#1f6fd1', '#5fa6ea', '#cfe6fb'], fog: '#b9d8f3', hi: 1.1, hc: '#dfeeff', hg: '#6f7a5a', si: 2.2, sc: '#fff1dc', sp: [-300, 420, 200], gr: '#ffffff', out: '#5f8c3e', wat: '#4aa3d8' },
    { sky: ['#34407e', '#e9876a', '#ffc27a'], fog: '#d49a86', hi: 0.75, hc: '#ffcaa8', hg: '#4a3a40', si: 1.5, sc: '#ff9a55', sp: [-520, 110, 320], gr: '#f4d2c2', out: '#56704a', wat: '#5f7fb0' },
    { sky: ['#0b1230', '#26305e', '#5a4a6e'], fog: '#26305e', hi: 0.42, hc: '#7083c8', hg: '#1f2236', si: 0.25, sc: '#9fb4ff', sp: [300, 420, -200], gr: '#8a90aa', out: '#4a5a5a', wat: '#1d3f66' }];
  const cA = new THREE.Color(), cB = new THREE.Color(), lerpC = (a, b, u, out) => out.set(a).lerp(cB.set(b), u), mix = (a, b, u) => a + (b - a) * u;
  const TOD = { t: 0, goal: 0, lights: null };
  scene.fog = new THREE.Fog(0xb9d8f3, 500, 1700);
  // step 9 night sky: stars + moon (no fog), red aviation beacons on the tall towers (blink in tick)
  const nightSky = new THREE.Group(); nightSky.visible = false; scene.add(nightSky);
  { const P = []; for (let i = 0; i < (touch ? 500 : 900); i++) { const a = Math.random() * Math.PI * 2, e = 0.12 + Math.pow(Math.random(), 0.7) * 1.4, R = 2600; P.push(Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R); }
    const dot = CT(32, 32, (g, w) => { const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(220,230,255,0.6)'); r.addColorStop(1, 'rgba(220,230,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
    nightSky.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(P, 3)), new THREE.PointsMaterial({ map: dot, size: 3, sizeAttenuation: false, transparent: true, depthWrite: false, fog: false, color: 0xdfe6ff })));
    const moonT = CT(128, 128, (g, w) => { const r = g.createRadialGradient(64, 64, 20, 64, 64, 64); r.addColorStop(0, 'rgba(255,248,226,1)'); r.addColorStop(0.36, 'rgba(255,248,226,1)'); r.addColorStop(0.42, 'rgba(200,210,255,0.35)'); r.addColorStop(1, 'rgba(160,180,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); g.fillStyle = 'rgba(190,180,160,0.35)'; for (const [x, y, s] of [[52, 54, 7], [72, 70, 5], [60, 78, 4], [76, 50, 3]]) { g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); } });
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonT, fog: false, depthWrite: false, transparent: true })); moon.scale.set(380, 380, 1); moon.position.set(-1200, 1100, 1300); nightSky.add(moon); }
  const beacon = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(beaconPts, 3)), new THREE.PointsMaterial({ map: glowTex, color: 0xff3a2a, size: 5, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); beacon.visible = false; scene.add(beacon);
  function applyTime(t) { const k = t < 0.5 ? 0 : 1, u = t < 0.5 ? t * 2 : (t - 0.5) * 2, A = KF[k], B = KF[k + 1];
    const g = skyC.getContext('2d'), r = g.createLinearGradient(0, 0, 0, 256); [0, 0.72, 1].forEach((p, i) => r.addColorStop(p, '#' + lerpC(A.sky[i], B.sky[i], u, cA).getHexString())); g.fillStyle = r; g.fillRect(0, 0, 8, 256); skyTex.needsUpdate = true; scene.background = skyTex;
    lerpC(A.fog, B.fog, u, scene.fog.color); scene.fog.near = t < 0.5 ? mix(500, 260, t * 2) : mix(260, 320, (t - 0.5) * 2); scene.fog.far = t < 0.5 ? mix(1700, 1100, t * 2) : mix(1100, 1250, (t - 0.5) * 2); mist.setTime(t); hemi.intensity = mix(A.hi, B.hi, u); lerpC(A.hc, B.hc, u, hemi.color); lerpC(A.hg, B.hg, u, hemi.groundColor);
    sun.intensity = mix(A.si, B.si, u); lerpC(A.sc, B.sc, u, sun.color); sun.position.set(mix(A.sp[0], B.sp[0], u), mix(A.sp[1], B.sp[1], u), mix(A.sp[2], B.sp[2], u));
    lerpC(A.gr, B.gr, u, ground.material.color); lerpC(A.out, B.out, u, outer.material.color); lerpC(A.wat, B.wat, u, water.material.color);
    const n = Math.max(0, Math.min(1, (t - 0.3) / 0.6)); TWU.uNight.value = n * n * (3 - 2 * n); towers.material.emissive.setRGB(0.14 * n, 0.2 * n, 0.29 * n);
    nature.setNight(Math.max(0, Math.min(1, (t - 0.3) / 0.6))); nightSky.visible = t > 0.55; nightSky.children.forEach(c => { c.material.opacity = Math.min(1, (t - 0.55) / 0.35); });
    const lit = t > 0.4; if (lit !== TOD.lights) { TOD.lights = lit; beacon.visible = lampPool.visible = glows.visible = lit; city.setNight(lit); signs.setNight(lit); districts.setNight(lit); train.setNight(lit); heights.setNight(lit); paths.setNight(lit); townGround.setNight(lit); market.setNight(lit); gold.color.set(lit ? 0xffd86b : 0xffc64a); } }
  function setNight(on, instant) { TOD.goal = on ? 1 : 0; if (instant) { TOD.t = TOD.goal; applyTime(TOD.t); } }
  function setTime(t) { TOD.goal = TOD.t = Math.max(0, Math.min(1, t)); applyTime(TOD.t); }
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
  function frame(now) { if (dead) return; raf = requestAnimationFrame(frame); const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
    if (C.goal) { const k = 1 - Math.exp(-dt * 3); for (const f of ['tx', 'tz', 'dist', 'pitch']) C[f] += (C.goal[f] - C[f]) * k; }
    if (TOD.t !== TOD.goal) { TOD.t = TOD.goal > TOD.t ? Math.min(TOD.goal, TOD.t + dt / 4) : Math.max(TOD.goal, TOD.t - dt / 4); applyTime(TOD.t); }
    train.tick(dt, now); if (beacon.visible) beacon.material.opacity = (now % 1600) < 500 ? 1 : 0.15;
    if (driver) { try { driver(dt, now); } catch (e) { if (!driverErr) console.warn('walk frame: ' + (e && e.stack || e)); driverErr = e; } } else { const cp = Math.cos(C.pitch), sp = Math.sin(C.pitch); camera.position.set(C.tx + Math.sin(C.yaw) * cp * C.dist, sp * C.dist + 4, C.tz + Math.cos(C.yaw) * cp * C.dist); camera.lookAt(C.tx, 0, C.tz); }
    city.tick(dt, now); signs.tick(dt, now, camera.position); nature.tick(dt, now, camera.position); districts.tick(dt, now, camera.position); breeze.tick(dt, now, camera.position); mist.tick(dt, now); market.tick(camera.position); gardens.tick(camera.position); parade.tick(dt, camera.position); arenaRoad.tick(camera.position); heights.tick(dt); paths.tick(dt);
    for (const h of hires) h.s.rotation.y = Math.sin(now / 900) * 0.05;
    zoneLabels.children.forEach(s => s.scale.set(C.dist * 0.042 * 3, C.dist * 0.042 * 0.57, 1));
    labels.visible = driver ? false : C.dist < 420; zoneLabels.visible = !driver && zoneLabels.userData.on !== false;
    renderer.render(scene, camera); }
  raf = requestAnimationFrame(frame);
  onState({ ready: true, counts: { buildings: L.BUILDINGS.length, speakers: L.SPEAKERS.length, lamps: lampPts.length + city.stats.lamps, hiring: L.BUILDINGS.filter(b => b.hiring).length, doors: city.stats.doors, trees: city.stats.trees, cars: city.stats.cars } });
  const API = window.__meru2 = { flyTo, pan, setNight, setTime, time: () => TOD.t, water, show(what, on) { if (what === 'labels') zoneLabels.userData.on = on; ({ rings, labels: zoneLabels, speakers: spk, towers, doors: doorsG })[what].visible = on; },
    K: { THREE, scene, camera, renderer, toon, grad, CT, L, el, I }, city, signs, nature, districts, breeze, mist, market, gardens, parade, train, heights, paths, spk, ownBlocks, setDriver(fn) { driver = fn; }, orbit: C,
    zones: L.ZONES.map(z => ({ key: z.key, label: z.label })), destroy() { dead = true; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.remove(); } };   // window.__meru2 = test hook
  return API;
}
