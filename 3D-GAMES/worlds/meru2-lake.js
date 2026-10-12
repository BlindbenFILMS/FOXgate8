// MERU 2.0 — step 5: THE LAKE [meruLake]. Built by the walk (worlds/meru2-walk.js). Data: LAKE in worlds/meru2-layout.js.
// JETTIES (wood decks on piles, rails, lanterns, ladder gaps) · THE SPEEDBOAT (engine/vehicle-fun.js model, replaces the old rowboat;
// rented once for 1 gold = the old boat-hire rule; drive anywhere on the lake, HORN · POWER TURN · NITRO, wake, engine sound,
// left where you get out, saved) · the SPEEDBOAT BAY start gate (drive through + E = the course full-screen) · SWIM helpers
// (climb points, wake rings) · the rippling lake surface · interiors: JON'S BOATWORKS [jonBoatworks], SPEEDBOAT BAY boathouse
// [meruSpeedboatBay], SCHOOL FOR THE BLIND [meruBlindSchool] with HOPE teaching her class.
import { funKit } from '../engine/vehicle-fun.js';
import { PLAYER_MALE } from '../fox-kit.js';
import { buildSchool, SPOTS } from '../minigames/meru/blind-school.js';
import { canvasTex } from '../engine/textures.js';
import { buildYard, DY, RAISE } from '../minigames/boatyard/yard-room.js';
import { buildBoathouse } from '../minigames/meru/bay-boathouse.js';
import { plantTrees } from './meru2-flora.js';
import { makeRoomKit } from './meru2-roomkit.js';
export function buildLake({ THREE, scene, M, toon, grad, kit, cast, cols, L, save, touch, water, terrainAt = () => 0, audio = () => null }) {
  const LK = L.LAKE, W = L.WATER[0].e, I = L.ISLAND, V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const tc = c => typeof c === 'string' ? toon(c) : c, glowM = c => new THREE.MeshBasicMaterial({ color: c });
  const B = (w, h, d, col, x, y, z, ry = 0, o = 0.02, par) => { const m = M(new THREE.BoxGeometry(w, h, d), tc(col), x, y, z, par, o); m.rotation.y = ry; return m; };
  const C = (r, h, col, x, y, z, o = 0.02, par, n = 14) => M(new THREE.CylinderGeometry(r, r, h, n), tc(col), x, y, z, par, o);
  const box = (x0, x1, z0, z1, y1) => cols.push(y1 != null ? { f: [x0, x1, z0, z1], y1 } : { f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const spots = [], npcs = [], rooms = [], lamps = [], climbs = [];
  const inLake = L.inLake;
  const islandLand = (x, z) => { const r = L.islandR(x, z); return r < I.c[2] + 6 && L.islandH(r) > 0.1; };
  const glowTex = CT(64, 64, (g, w, h) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });

  // ---------- the lake surface: a slow ripple map on the blockout water ----------
  let rip = null;
  if (water) { rip = CT(256, 256, (g, w, h) => { g.fillStyle = '#e4f1fa'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { const x = Math.random() * w, y = Math.random() * h, l = 8 + Math.random() * 26; g.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.9)' : 'rgba(150,190,220,0.55)'; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke(); } });
    rip.wrapS = rip.wrapT = THREE.RepeatWrapping; rip.repeat.set(70, 24); water.material.map = rip; water.material.needsUpdate = true; }
  // swim pass: the swim-trials water look, phone-cheap: a turquoise SHALLOWS band (the wading strip) + a breathing white FOAM line on the shore
  let WU0;
  // SHORE v2: strips that follow the noisy shorelines (lake + Pearl Island): turquoise SHALLOWS, dark WET SAND on the beach, and an animated FOAM WASH
  // that runs up the sand and slides back (one shader, lacy foam behind the front). Built from edge(t) → waterline point + unit normal toward the water.
  const shore = [], SU = { uT: WU0 = { value: 0 } };
  { const NS = touch ? 220 : 420, lakeEdge = t => { const [x, z] = L.lakeEdge(t), dx = x - W[0], dz = z - W[1], l = Math.hypot(dx, dz) || 1; return [x, z, -dx / l, -dz / l, 0]; };
    const isleWL = 48 + 2 * (0.04 / 0.47), isleEdge = t => { const r = 30 + (isleWL - 30) * L.islandM(t), x = I.pond.x + Math.cos(t) * r, z = I.pond.z + Math.sin(t) * r; return [x, z, Math.cos(t), Math.sin(t), 1]; };
    const strip = (edge, d0, d1, mat, y0, ro) => { const pos = [], uv = [], idx = []; let acc = 0, prev = null;
      for (let i = 0; i <= NS; i++) { const t = -Math.PI + i / NS * Math.PI * 2, [x, z, nx, nz, isl] = edge(t); if (prev) acc += Math.hypot(x - prev[0], z - prev[1]); prev = [x, z];
        for (const [d, v] of [[d0, 0], [d1, 1]]) { const px = x + nx * d, pz = z + nz * d, y = isl ? Math.max(0.08, L.islandAt(px, pz)) + y0 : y0; pos.push(px, y, pz); uv.push(acc / 10, v); } }
      for (let i = 0; i < NS; i++) { const p = i * 2; idx.push(p, p + 2, p + 1, p + 1, p + 2, p + 3); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
      const m = new THREE.Mesh(g, mat); m.renderOrder = ro; m.frustumCulled = false; scene.add(m); shore.push(m); return m; };
    const SV = 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }';
    const shal = new THREE.ShaderMaterial({ uniforms: SU, transparent: true, depthWrite: false, side: THREE.DoubleSide, vertexShader: SV,
      fragmentShader: 'uniform float uT; varying vec2 vU; void main(){ float a = smoothstep(0., 0.5, vU.y) * 0.42 + 0.06 * sin(vU.x * 3. + uT * 0.7) * vU.y; gl_FragColor = vec4(mix(vec3(0.28, 0.72, 0.8), vec3(0.62, 0.9, 0.88), vU.y), a); }' });
    const wet = new THREE.ShaderMaterial({ uniforms: SU, transparent: true, depthWrite: false, side: THREE.DoubleSide, vertexShader: SV,
      fragmentShader: 'uniform float uT; varying vec2 vU; void main(){ float wv = 0.5 + 0.5 * sin(uT * 0.8 + sin(vU.x * 0.7) * 1.2 + vU.x * 0.15); float a = pow(1. - vU.y, 1.6) * (0.3 + 0.12 * wv); gl_FragColor = vec4(0.42, 0.34, 0.2, a); }' });
    const foam = new THREE.ShaderMaterial({ uniforms: SU, transparent: true, depthWrite: false, side: THREE.DoubleSide, vertexShader: SV,
      fragmentShader: 'uniform float uT; varying vec2 vU; float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }' +
        ' void main(){ float x = vU.x, y = vU.y, f = 0.42 + 0.26 * sin(uT * 0.8 + sin(x * 0.7) * 1.2 + x * 0.15) + 0.06 * sin(x * 2.3 - uT * 1.7);' +
        ' float front = smoothstep(f - 0.1, f, y) * (1. - smoothstep(f, f + 0.05, y));' +
        ' float lace = smoothstep(f - 0.5, f - 0.05, y) * step(y, f) * smoothstep(0.35, 0.75, h(floor(vec2(x * 9., y * 14. + uT * 0.6))) * (0.6 + 0.4 * sin(x * 11. + uT * 2.)));' +
        ' float line = (1. - smoothstep(0.0, 0.06, abs(y - 0.3 - 0.04 * sin(x * 1.3 + uT)))) * 0.16;' +
        ' gl_FragColor = vec4(vec3(1.), clamp(front * 0.9 + lace * 0.55 + line, 0., 0.95)); }' });
    for (const [edge, isl] of [[lakeEdge, 0], [isleEdge, 1]]) { strip(edge, 0.2, -4.5, wet, isl ? 0.035 : 0.03, 1); strip(edge, 3.2, -1.6, foam, isl ? 0.12 : 0.11, 2); } }
  // swim pass 2: the lake mesh itself = a polar grid with DEPTH COLOURS (turquoise shallows at the shore + round Pearl Island → deep blue in the middle)
  // and slow WAVES in the vertex shader; normals tilt with the waves so the sun glints move. Waves fade to 0 at the shore + island (foam bands, jetties stay put).
  const WU = WU0;
  if (water) { const [cx, cz, rx, rz] = W, RS = [0, .15, .3, .45, .58, .68, .76, .82, .87, .91, .94, .96, .975, .988, 1], NA = touch ? 96 : 144, pos = [], col = [], amp = [], idx = [], ic = I.c[2];
    for (const r of RS) for (let a = 0; a <= NA; a++) { const t = a / NA * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), lm = L.lakeM(Math.atan2(-s, c)), wx = cx + c * r * lm * rx, wz = cz - s * r * lm * rz, shoreM = (1 - r) * lm * Math.hypot(rx * c, rz * s) * 0.7, di = Math.max(0, L.islandR(wx, wz) - ic);
      const sh = Math.max(clamp(1 - shoreM / 16, 0, 1), clamp(1 - di / 14, 0, 1)) ** 1.5, dp = clamp((Math.min(shoreM, di) - 22) / 80, 0, 1);
      pos.push(c * r * lm, s * r * lm, 0); col.push(1 + 0.35 * sh - 0.45 * dp, 1 + 0.6 * sh - 0.3 * dp, 1 + 0.2 * sh - 0.1 * dp); amp.push(clamp(shoreM / 22, 0, 1) * clamp(di / 18, 0, 1)); }
    for (let i = 0; i < RS.length - 1; i++) for (let a = 0; a < NA; a++) { const p = i * (NA + 1) + a, q = p + NA + 1; idx.push(p, q, p + 1, p + 1, q, q + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('wamp', new THREE.Float32BufferAttribute(amp, 1));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(pos.filter((_, i) => i % 3 < 2).map(v => v * 0.5 + 0.5), 2)); g.setIndex(idx); g.computeVertexNormals();
    water.geometry.dispose(); water.geometry = g; const wm = water.material; wm.vertexColors = true;
    wm.onBeforeCompile = sh => { sh.uniforms.uT = WU; sh.vertexShader = 'attribute float wamp;\nuniform float uT;\n' + sh.vertexShader
      .replace('#include beginnormal_vertex', `#include beginnormal_vertex
        vec4 wq = modelMatrix * vec4(position, 1.0); float p1 = wq.x * 0.09 + uT * 1.2, p2 = wq.z * 0.13 - uT * 0.95 + wq.x * 0.04, p3 = wq.x * 0.55 + wq.z * 0.31 + uT * 2.1;
        float gx = wamp * (0.0063 * cos(p1) + 0.002 * cos(p2) + 0.02 * cos(p3)) * 6.0, gz = wamp * (0.0065 * cos(p2) + 0.012 * cos(p3)) * 6.0;
        objectNormal = normalize(vec3(-gx * ${rx.toFixed(1)}, gz * ${rz.toFixed(1)}, 1.0));`)
      .replace('#include begin_vertex', '#include begin_vertex\n transformed.z += wamp * (0.07 * sin(p1) + 0.05 * sin(p2));'); };
    wm.customProgramCacheKey = () => 'meru2lake'; wm.needsUpdate = true; }
  // swimmer bob: the same two swells as the vertex shader, on the CPU (metres, 0 at the shore + round the island)
  const waveAt = (x, z) => { if (!water) return 0; const [cx, cz, rx, rz] = W, dx = (x - cx) / rx, dz = (z - cz) / rz, r = L.lakeF(x, z); if (r >= 1) return 0;
    const c = r ? dx / r : 1, s = r ? dz / r : 0, shoreM = (1 - r) * Math.hypot(rx * c, rz * s) * 0.7, di = Math.max(0, L.islandR(x, z) - I.c[2]), t = WU.value;
    return clamp(shoreM / 22, 0, 1) * clamp(di / 18, 0, 1) * (0.07 * Math.sin(x * 0.09 + t * 1.2) + 0.05 * Math.sin(z * 0.13 - t * 0.95 + x * 0.04)); };
  // splash + drip spray: one Points pool for the swimmer (jump in, dive, surface, climb out drips) + the speedboat's bow spray
  const SPN = touch ? 64 : 128, spP = new Float32Array(SPN * 3).fill(-999), spV = new Float32Array(SPN * 3), spL = new Float32Array(SPN), spG = new THREE.BufferGeometry(); spG.setAttribute('position', new THREE.BufferAttribute(spP, 3));
  const sprayPts = new THREE.Points(spG, new THREE.PointsMaterial({ color: 0xf2fbff, size: 0.14, transparent: true, opacity: 0.9, depthWrite: false })); sprayPts.frustumCulled = false; scene.add(sprayPts); let spI = 0, spOn = 0;
  function fx(x, y, z, n = 12, up = 3, out = 1.6, ringOn = true) { for (let i = 0; i < n; i++) { spI = (spI + 1) % SPN; const k = spI * 3, a = Math.random() * 6.283, s = out * (0.3 + Math.random() * 0.7); spP[k] = x + Math.cos(a) * 0.15; spP[k + 1] = y; spP[k + 2] = z + Math.sin(a) * 0.15; spV[k] = Math.cos(a) * s; spV[k + 1] = up * (0.5 + Math.random() * 0.7); spV[k + 2] = Math.sin(a) * s; spL[spI] = 1.4; } spOn = 1.5; if (ringOn && n > 4) wake(x, z, 0.4, 1.6 + n * 0.08, 1.1, 0.75); }

  // ---------- jetties: plank decks on piles, rails with gaps, lanterns ----------
  const plank = CT(256, 64, (g, w, h) => { g.fillStyle = '#a07a52'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#94704a' : '#a8825a'; g.fillRect(0, i * 8, w, 7); g.fillStyle = '#5c4430'; g.fillRect(0, i * 8 + 7, w, 1); } });
  plank.wrapS = plank.wrapT = THREE.RepeatWrapping;
  const pileP = [], railM = toon('#5c4430'), lampHead = new THREE.MeshBasicMaterial({ color: 0x8a7a5a });
  for (const J of LK.jetties) { const [x0, x1, z0, z1] = J.r, w = x1 - x0, d = z1 - z0, y = J.y;
    const mat = new THREE.MeshToonMaterial({ gradientMap: grad, map: plank.clone() }); mat.map.needsUpdate = true; mat.map.repeat.set(1, d / 2);
    M(new THREE.BoxGeometry(w, 0.25, d), mat, (x0 + x1) / 2, y - 0.125, (z0 + z1) / 2, null, 0.02);
    for (let x = x0 + 0.3; x <= x1 - 0.2; x += 4) for (const z of [z0 + 0.3, z1 - 0.3]) pileP.push([x, z]);
    for (let z = z0 + 0.3; z <= z1 - 0.2; z += 4) for (const x of [x0 + 0.3, x1 - 0.3]) pileP.push([x, z]);
    const sides = { N: [x0, x1, z0, 'x'], S: [x0, x1, z1, 'x'], W: [z0, z1, x0, 'z'], E: [z0, z1, x1, 'z'] };
    for (const sd of Object.keys(sides)) { if ((J.open || []).includes(sd)) continue; const [a0, a1, c, ax] = sides[sd], gs = (J.gaps || []).filter(q => q.side === sd).map(q => ({ ...q, w: q.w || 2.4 })).sort((p, q) => p.at - q.at);
      const segs = []; let a = a0; for (const q of gs) { segs.push([a, q.at - q.w / 2]); a = q.at + q.w / 2; } segs.push([a, a1]);
      for (const [s0, s1] of segs) { const len = s1 - s0; if (len < 0.3) continue; const m = (s0 + s1) / 2;
        if (ax === 'x') { B(len, 0.1, 0.1, railM, m, y + 1.0, c, 0, 0.01); box(s0, s1, c - 0.2, c + 0.2); for (let s = s0; s <= s1 + 0.01; s += 2) C(0.05, 1.0, railM, Math.min(s, s1), y + 0.5, c, 0, null, 6); }
        else { B(0.1, 0.1, len, railM, c, y + 1.0, m, 0, 0.01); box(c - 0.2, c + 0.2, s0, s1); for (let s = s0; s <= s1 + 0.01; s += 2) C(0.05, 1.0, railM, c, y + 0.5, Math.min(s, s1), 0, null, 6); } }
      for (const q of gs) { if (q.join) continue; const g0 = q.at - q.w / 2, g1 = q.at + q.w / 2, inward = sd === 'N' ? 1 : sd === 'S' ? -1 : sd === 'W' ? 1 : -1;
        if (ax === 'x') { box(g0, g1, c - 0.2, c + 0.2, 0.2); climbs.push({ x: q.at, z: c + inward * 0.9, y, edge: [q.at, c], yaw: inward > 0 ? 0 : Math.PI }); for (let k = 0; k < 4; k++) B(0.6, 0.06, 0.08, railM, q.at, y - 0.35 - k * 0.32, c - inward * 0.08, 0, 0); }
        else { box(c - 0.2, c + 0.2, g0, g1, 0.2); climbs.push({ x: c + inward * 0.9, z: q.at, y, edge: [c, q.at], yaw: inward > 0 ? Math.PI / 2 : -Math.PI / 2 }); for (let k = 0; k < 4; k++) B(0.08, 0.06, 0.6, railM, c - inward * 0.08, y - 0.35 - k * 0.32, q.at, 0, 0); } } }
    // lantern posts every 8 m on the long sides
    const long = d >= w; for (let s = (long ? z0 : x0) + 3; s < (long ? z1 : x1) - 1; s += 8) { const lx = long ? x0 + 0.45 : s, lz = long ? s : z1 - 0.45; C(0.07, 2.4, '#201e1d', lx, y + 1.2, lz, 0.01, null, 6); const h = B(0.3, 0.36, 0.3, lampHead, lx, y + 2.5, lz, 0, 0.01); lamps.push({ h, x: lx, y: y + 2.5, z: lz }); } }
  { const pm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.18, 4, 7), toon('#5c4430'), pileP.length), M4 = new THREE.Matrix4(); pileP.forEach(([x, z], i) => { M4.makeTranslation(x, -1.4, z); pm.setMatrixAt(i, M4); }); scene.add(pm); }
  const glowS = lamps.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffc67a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(2.6); s.position.set(l.x, l.y, l.z); s.visible = false; scene.add(s); return s; });
  let yard = null, bay = null, bayDecks = []; const inR = (r, x, z) => x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3];
  const onDeck = (x, z) => LK.jetties.find(J => inR(J.r, x, z)) || (yard && yard.decks.some(r => inR(r, x, z)) || bayDecks.some(r => inR(r, x, z)) ? { y: 0.4 } : null);
  function groundAt(x, z, y) { const J = onDeck(x, z); return J && y > -0.35 ? J.y : null; }
  function surfaceAt(x, z, y) { const J = onDeck(x, z); return J && y > 0.5 ? 'wood' : null; }

  // ---------- the slipway at Jon's Boatworks (concrete ramp into the water) ----------
  { const bw = L.BUILDINGS.find(b => b.key === 'boatworks'), cx = (bw.f[0] + bw.f[1]) / 2; const r = B(8, 0.3, 18, '#9aa0a6', cx, -0.2, bw.f[3] + 9, 0, 0.01); r.rotation.x = 0.06; B(8.4, 5, 0.12, '#3d4a57', cx, 2.6, bw.f[3] + 0.08, 0, 0.01); for (let k = 0; k < 9; k++) B(8.2, 0.06, 0.14, '#2a3440', cx, 0.4 + k * 0.55, bw.f[3] + 0.16, 0, 0); }

  // ---------- the speedboat ----------
  const fk = funKit({ THREE, M, toon, grad, glowTex, scene });
  const mkBoat = s => { const r = fk.make('boat'), V = r.userData.V; r.scale.setScalar(s); if (V.tubeGlow) V.tubeGlow.forEach(g => g.scale.setScalar(0.01)); scene.add(r); return r; };
  const boat = mkBoat(1.3), BV = boat.userData.V, S = LK.speed;
  const BT = { x: LK.boat.moor[0], z: LK.boat.moor[1], yaw: LK.boat.moor[2], speed: 0, steer: 0, vx: 0, vz: 0, nitro: 0, ncd: 0, spin: 0, spinDir: 1, pl: 0, kick: 0, on: false, thr: 0 };
  { const p = save.stat('meru2Boat', null); if (p && inLake(p.x, p.z)) Object.assign(BT, { x: p.x, z: p.z, yaw: p.yaw }); }
  const bodyC = [{ c: [0, 0, 1.25], on: true }, { c: [0, 0, 1.25], on: true }]; cols.push(...bodyC);   // the hull blocks walkers + swimmers while moored
  const placeBody = () => { const hx = Math.sin(BT.yaw), hz = Math.cos(BT.yaw); bodyC[0].c[0] = BT.x + hx * 1.4; bodyC[0].c[1] = BT.z + hz * 1.4; bodyC[1].c[0] = BT.x - hx * 1.4; bodyC[1].c[1] = BT.z - hz * 1.4; for (const b of bodyC) b.on = !BT.on; };
  { const t = CT(512, 160, (g, w, h) => { g.fillStyle = '#ffd23a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 18, h); g.fillStyle = '#201e1d'; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'top'; g.fillText('SPEEDBOAT', 40, 22); g.font = '900 52px Archivo, sans-serif'; g.fillText(LK.boat.sign, 40, 62, w - 60); });
    const [mx, mz] = LK.boat.moor, sx = 77.4, sz = mz - 4.6, gp = new THREE.Group(); gp.position.set(sx, 0.9, sz); gp.rotation.y = Math.PI / 2; scene.add(gp); for (const s of [-0.9, 0.9]) C(0.06, 2.2, '#201e1d', s, 1.1, 0, 0.01, gp, 6);
    const pm = new THREE.MeshBasicMaterial({ map: t }); for (const ry of [0, Math.PI]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.69), pm); p.position.set(0, 1.9, ry ? -0.02 : 0.02); p.rotation.y = ry; gp.add(p); } ring(sx, sz, 0.3); }
  const buoys = []; { const G = LK.gate, [gx, gz] = G.at, ban = CT(512, 96, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#201e1d'; g.fillRect(0, 0, 14, h); g.fillStyle = '#ffffff'; g.font = '900 52px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(G.label + ' \u00b7 START', 30, h / 2 + 3, w - 44); });
    for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(gx + s * G.w / 2, 0, gz); scene.add(g); for (let k = 0; k < 3; k++) C(0.9 - k * 0.12, 0.6, k % 2 ? '#f3f2f2' : '#ec3013', 0, 0.1 + k * 0.6, 0, 0.02, g, 16); C(0.08, 5, '#201e1d', 0, 3.6, 0, 0.01, g, 6); buoys.push({ g, x: gx + s * G.w / 2, z: gz, ph: Math.random() * 6 }); }
    const bm = new THREE.Mesh(new THREE.PlaneGeometry(G.w, 1.6), new THREE.MeshBasicMaterial({ map: ban, side: THREE.DoubleSide })); bm.position.set(gx, 5.4, gz); scene.add(bm); }
  const PIER = (L.LIGHTHOUSES || []).filter(q => q.pier).map(q => q.pier.r), LH = (L.LIGHTHOUSES || []).map(q => q.at);
  function waterOK(x, z) { if (!inLake(x, z) || islandLand(x, z) || terrainAt(x, z) > 0.3) return false;
    for (const J of LK.jetties) { const r = J.r; if (x > r[0] - 0.5 && x < r[1] + 0.5 && z > r[2] - 0.5 && z < r[3] + 0.5) return false; }
    for (const r of PIER) if (x > r[0] - 0.6 && x < r[1] + 0.6 && z > r[2] - 0.6 && z < r[3] + 0.6) return false;
    for (const [lx, lz] of LH) if (Math.hypot(x - lx, z - lz) < 5) return false;
    for (const b of buoys) if (Math.hypot(x - b.x, z - b.z) < 1.2) return false; for (const q of (LK.extraBlocks || [])) if (Math.hypot(x - q[0], z - q[1]) < q[2]) return false; if (ferryBlock(x, z)) return false; return true; }
  const PROBE = [[0, 3.0], [0, -2.9], [1.15, 0], [-1.15, 0], [0.85, 2], [-0.85, 2]];
  const okAt = (x, z, yaw) => { const c = Math.cos(yaw), s = Math.sin(yaw); return PROBE.every(([lx, lz]) => waterOK(x + lx * c + lz * s, z - lx * s + lz * c)); };

  // engine + horn (synth until Ben's sound pass)
  let eng = null;
  function engOn() { const c = audio(); if (!c || eng) return; const o1 = c.createOscillator(), o2 = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain(); o1.type = 'sawtooth'; o2.type = 'square'; o2.detune.value = 12; lp.type = 'lowpass'; lp.frequency.value = 520; g.gain.value = 0; o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(c.destination); o1.start(); o2.start(); eng = { c, o1, o2, lp, g }; }
  function engOff() { if (!eng) return; const e = eng; eng = null; e.g.gain.setTargetAtTime(0, e.c.currentTime, 0.08); setTimeout(() => { try { e.o1.stop(); e.o2.stop(); } catch (er) {} }, 400); }
  function tone(f, d, v, type = 'sine') { const c = audio(); if (!c) return; const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d + 0.05); }
  const horn = () => { tone(196, 0.7, 0.07, 'sawtooth'); tone(247, 0.7, 0.05, 'sawtooth'); };
  function splash(v = 0.12) { const c = audio(); if (!c) return; const n = c.createBufferSource(), b = c.createBuffer(1, c.sampleRate * 0.35, c.sampleRate), a = b.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / a.length) ** 2; n.buffer = b; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400; const g = c.createGain(); g.gain.value = v; n.connect(f); f.connect(g); g.connect(c.destination); n.start(); }

  // ---------- wake rings (boat + swimmer) ----------
  const ringTex = CT(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 20, 64, 64, 62); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(0.7, 'rgba(255,255,255,0.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  const wakes = []; for (let i = 0, N = touch ? 24 : 40; i < N; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, depthWrite: false, opacity: 0 })); m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); wakes.push({ m, t: 1, life: 1, s0: 1, s1: 2, op: 0.5 }); }
  let wi = 0; function wake(x, z, s0, s1, life, op) { const w = wakes[wi = (wi + 1) % wakes.length]; Object.assign(w, { t: 0, life, s0, s1, op }); w.m.position.set(x, 0.11, z); w.m.visible = true; }

  // ---------- interiors ----------
  const room = key => { const b = L.BUILDINGS.find(q => q.key === key), g = new THREE.Group(); scene.add(g); rooms.push({ g, cx: (b.f[0] + b.f[1]) / 2, cz: (b.f[2] + b.f[3]) / 2 }); return { b, g }; };
  const fox = (key, opt, x, z, ry, par, s = 1) => { const f = kit.makeFox({ key, ...opt }); f.position.set(x, 0, z); f.rotation.y = ry; f.scale.multiplyScalar(s); (par || scene).add(f); ring(x, z, 0.45); npcs.push(f); return f; };
  const board = (w, h, draw) => new THREE.MeshBasicMaterial({ map: CT(Math.round(w * 64), Math.round(h * 64), draw) });

  // JON'S BOATWORKS (f -130..-95 × 205..230, door N at x -112): Jon's floating workshop + a speedboat up on the lift, workbench, props on the wall
  { const { b, g } = room('boatworks');
    // Jon's real floating workshop from the Boatworks job (minigames/boatyard/yard-room.js), turned so the lift slip runs south onto the slipway
    const Y = buildYard({ THREE, M, toon, canvasTex: CT, scene: g, grad, origin: { x: -112.5, z: 222 }, rotY: -Math.PI / 2, mounted: true }); yard = Y;
    for (const c of Y.cols) box(c[0], c[1], c[2], c[3]); for (const sx of [-3.1, 3.1]) for (const sz of [-1.95, 1.95]) { const p = Y.world(sx, sz); ring(p.x, p.z, 0.25); }
    { const c = Y.world(1.65, 0), hull = mkBoat(1.0); scene.remove(hull); hull.position.set(c.x, RAISE + 0.55, c.z); g.add(hull);
      for (const s of Y.slings) { const by = RAISE + 0.45; s.bot.position.y = by; s.cabs.forEach((cb, k) => { cb.position.set(s.x, (4.3 + by) / 2, k ? 0.95 : -0.95); cb.scale.y = 4.3 - by; }); s.bot.scale.z = 2.1; } }
    B(1.4, 1.0, 12, '#6b4a32', -128.6, 0.5, 214, 0, 0.02, g); B(1.6, 0.1, 12.2, '#3d2a1c', -128.6, 1.05, 214, 0, 0, g); box(-129.6, -127.8, 208, 220); B(0.3, 0.3, 0.5, '#4a4745', -128.4, 1.25, 210, 0, 0.01, g);
    const peg = board(4, 2, (q, w, h) => { q.fillStyle = '#c9b48a'; q.fillRect(0, 0, w, h); q.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 8; x < w; x += 12) for (let y = 8; y < h; y += 12) q.fillRect(x, y, 2, 2); q.fillStyle = '#201e1d'; for (let i = 0; i < 9; i++) { const x = 16 + i * 27; q.fillRect(x, 20 + (i % 3) * 8, 6, 60 + (i % 2) * 20); q.fillRect(x - 6, 20 + (i % 3) * 8, 18, 10); } });
    for (const z of [210, 214.5, 219]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), peg); p.position.set(-129.55, 2.6, z); p.rotation.y = Math.PI / 2; g.add(p); }
    for (const z of [211, 216, 225]) { const pg = new THREE.Group(); pg.position.set(-95.6, 2.8, z); g.add(pg); C(0.12, 0.3, '#cbd5e1', 0, 0, 0, 0.005, pg, 10).rotation.z = Math.PI / 2; for (let k = 0; k < 3; k++) { const bl = B(0.04, 0.7, 0.3, '#cbd5e1', 0, 0, 0, 0, 0.005, pg); bl.rotation.x = k * Math.PI * 2 / 3; bl.position.set(0, Math.cos(k * 2.094) * 0.35, Math.sin(k * 2.094) * 0.35); } }
    B(4, 0.6, 1.2, '#a07a52', -99, 0.3, 226.5, 0, 0.01, g); B(4, 0.3, 1.2, '#94704a', -99, 0.75, 226.5, 0.05, 0.01, g); box(-101, -97, 225.8, 227.2);
    for (const [x, z, c] of [[-104, 227.6, '#ec3013'], [-103.4, 227.6, '#f3f2f2'], [-102.8, 227.6, '#2e4a6b']]) C(0.22, 0.4, c, x, 0.2, z, 0.01, g, 10);
    const jon = fox('jon', { look: { ...PLAYER_MALE, fur: '#a8a29a', furDark: '#6a6560' }, torso: ['#1f3a5f', '#f2c94c', '#16263c'], outfit: 'coat', crest: '', gear: 'none', mood: 'happy' }, -114.8, 219.7, 0, g); jon.position.copy(Y.world(-2.3, 2.3)); jon.position.y = DY; jon.rotation.y = Math.PI;
    const tk = Y.world(-6.0, 0.9); spots.push({ key: 'boatworksJob', x: tk.x, z: tk.z, r: 2.2, prompt: 'PUT ME TO WORK \u00b7 BOATWORKS JOB', play: { label: b.label.toUpperCase(), url: b.hiring.url } }); }

  // SPEEDBOAT BAY boathouse [meruSpeedboatBay] (f 60..90 × 205..228, door N at x 75): the game's own boathouse slip + docks + chalk blackboard
  // (minigames/meru/bay-boathouse.js, mounted: low docks either side of a wet slip running to the south wall, name plate over the slip end), life jackets
  { const { b, g } = room('boathouse');
    const H = buildBoathouse({ THREE, M, toon, glowTex, grad, scene: g, origin: { x: 75, z: 270 }, mounted: true, boardAt: { x: -11.5, y: 0, z: -48.5, yaw: Math.PI / 2 } }); bay = H;
    bayDecks = [-1, 1].map(sx => [75 + sx * 5.8 - 1.2, 75 + sx * 5.8 + 1.2, 270 + H.DZ0, 270 + H.BH.z1]);
    box(70.4, 79.6, 270 + H.DZ0, 228.5); box(62.9, 64.1, 218, 225); ring(63.5, 221.5, 0.4);
    const boat = mkBoat(1.15); scene.remove(boat); boat.position.set(75, 0.35, 219.5); boat.rotation.y = 0; g.add(boat);
    for (let k = 0; k < 6; k++) { B(0.5, 0.7, 0.18, '#f97316', 89.3, 1.7, 209 + k * 1.4, 0, 0.01, g); B(0.52, 0.08, 0.2, '#201e1d', 89.3, 1.5, 209 + k * 1.4, 0, 0, g); } B(0.1, 0.1, 9, '#201e1d', 89.45, 2.15, 212.5, 0, 0, g);
    for (const [x, z] of [[86, 225.6], [86.7, 225.6], [87.4, 225.6]]) { B(0.45, 0.6, 0.3, '#ec3013', x, 0.3, z, 0, 0.01, g); } box(85.5, 88, 225.2, 226);
    B(3, 0.45, 0.8, '#a07a52', 64, 0.25, 208, 0, 0.01, g); box(62.5, 65.5, 207.5, 208.5);
    spots.push({ key: 'bayCourse', x: 66, z: 221.5, r: 2.4, prompt: 'PLAY \u00b7 SPEEDBOAT BAY', play: { label: 'SPEEDBOAT BAY', url: b.hiring.url } }); }

  // SCHOOL FOR THE BLIND (f -250..-190 × 170..205, door S at x -220). step 10: the school from Hope's Class (minigames/meru/blind-school.js buildSchool):
  // lobby, hall, classroom, art room, gym, music room, library. Its front wall is the city shell's (real windows); its grass + front trees are hidden.
  { const { b, g } = room('blindSchool'), OX = -220, OZ = 195;
    const K = buildSchool({ THREE, M, toon, canvasTex, scene, grad, addOutline: m => m, origin: new THREE.Vector3(OX, 0, OZ) }); g.add(K.root); K.root.position.set(OX, 0.01, OZ);
    for (const w of K.walls) if (Math.abs(w.a[1] - 10) < 0.01 && Math.abs(w.b[1] - 10) < 0.01) w.g.visible = false;
    for (const c of K.root.children) { const p = c.geometry && c.geometry.parameters; if (!p) continue; if (c.geometry.type === 'PlaneGeometry' && p.width === 40 && p.height === 30) c.visible = false; if (c.position.z > 11) c.visible = false; }
    // GARDEN DOOR (Ben): an opening in the north outer wall from the ART ROOM (between the two easels) into the sensory courtyard. The old one-piece
    // north wall is hidden and rebuilt as left + right + lintel with a trim frame; its collider is split the same way. The art banner shrinks to fit above it.
    const GD = { x: 0.5, w: 1.7, h: 2.2 }, nw = K.walls.find(w => Math.abs(w.a[1] + 10) < 0.01 && Math.abs(w.b[1] + 10) < 0.01 && Math.abs(w.a[0] - w.b[0]) > 20);
    if (nw) { let wm = null; nw.g.traverse(c => { if (!wm && c.isMesh && c.geometry.parameters && c.geometry.parameters.height > 2.5) wm = c.material; }); nw.g.visible = false;
      const g0 = GD.x - GD.w / 2, g1 = GD.x + GD.w / 2, seg = (a0, a1, y0, y1) => { const m = new THREE.Mesh(new THREE.BoxGeometry(a1 - a0, y1 - y0, 0.22), wm || toon('#efe3cf')); m.position.set((a0 + a1) / 2, (y0 + y1) / 2, -10); K.root.add(m); };
      seg(-13, g0, 0, 3.1); seg(g1, 13, 0, 3.1); seg(g0, g1, GD.h, 3.1);
      const trim = toon('#6b4f3a'); for (const x of [g0, g1]) { const j = new THREE.Mesh(new THREE.BoxGeometry(0.1, GD.h, 0.3), trim); j.position.set(x, GD.h / 2, -10); K.root.add(j); } { const t = new THREE.Mesh(new THREE.BoxGeometry(GD.w + 0.2, 0.12, 0.3), trim); t.position.set(GD.x, GD.h + 0.06, -10); K.root.add(t); }
      for (const s of [-1, 1]) { const lf = new THREE.Mesh(new THREE.BoxGeometry(0.06, GD.h - 0.05, GD.w / 2), new THREE.MeshPhongMaterial({ color: 0xbfe3f2, transparent: true, opacity: 0.4, depthWrite: false })); lf.position.set(GD.x + s * (GD.w / 2 + 0.05), GD.h / 2, -10 - GD.w / 4 - 0.12); K.root.add(lf); }
      { const mat = new THREE.Mesh(new THREE.BoxGeometry(GD.w, 0.02, 1.0), toon('#3a3836')); mat.position.set(GD.x, 0.012, -9.4); K.root.add(mat); }
      K.root.traverse(c => { if (c.isMesh && c.geometry.type === 'PlaneGeometry' && c.geometry.parameters.width === 5.6 && Math.abs(c.position.z + 9.86) < 0.01) { c.scale.setScalar(0.62); c.position.y = 2.62; } }); }
    for (const q of K.boxes) { if (!(q.z0 < 9.7)) continue; if (nw && q.z1 < -9.7 && q.x1 - q.x0 > 20) { box(OX + q.x0, OX + GD.x - GD.w / 2, OZ + q.z0, OZ + q.z1); box(OX + GD.x + GD.w / 2, OX + q.x1, OZ + q.z0, OZ + q.z1); continue; } box(OX + q.x0, OX + q.x1, OZ + q.z0, OZ + q.z1); }
    const [hx, hz] = SPOTS.hopeFront, hope = cast.make('hope'); hope.position.set(OX + hx, 0, OZ + hz); hope.rotation.y = 0; g.add(hope); ring(OX + hx, OZ + hz, 0.6); npcs.push(hope);
    const KIDS = [['juno', ['#f472b6', '#fce7f3', '#9d174d'], '#e9772c'], ['pip', ['#38bdf8', '#e0f2fe', '#0369a1'], '#f08a3c'], ['tobi', ['#22c55e', '#dcfce7', '#14532d'], '#d86a26'], ['mae', ['#a78bfa', '#ede9fe', '#4c1d95'], '#ef7b30'], ['rio', ['#f59e0b', '#fef3c7', '#92400e'], '#e36f22']];
    KIDS.forEach(([kk, torso, fur], i) => { const [dx, dz] = SPOTS.kidDesks[i]; fox(kk, { look: { ...PLAYER_MALE, fur }, torso, outfit: 'tee', crest: '', gear: 'none', mood: 'happy' }, OX + dx, OZ + dz + 0.8, Math.PI, g, 0.74); });
    const [bx, bz] = SPOTS.benDesk; spots.push({ key: 'hopesClass', x: OX + bx, z: OZ + bz, r: 2.0, prompt: "PLAY \u00b7 HOPE'S CLASS", play: { label: "HOPE'S CLASS", url: b.hiring.url } }); }

  // SCHOOL WINGS (the shell is 60 × 35, the school 26 × 20): the space round it is dressed as part of the school, seen through the shell's E + W windows.
  // NORTH = SENSORY COURTYARD (tactile guide path, water rill you can hear, herb planters, wind chimes, benches) · WEST = CANE + GUIDE-DOG ROOM
  // (cane racks, fitting post, workbench, dog beds, bowls, harness hooks) · EAST = READING NOOK + TOUCH MODEL OF MERU (the real map, in blocks). No text anywhere: braille dots only.
  { const sch = rooms[rooms.length - 1].g, K2 = makeRoomKit({ THREE, touch }), b = K2.Bin(), XW = -249.6, XE = -190.4, ZN = 170.4, ZS = 204.6, SX0 = -233.2, SX1 = -206.8, SZ0 = 184.8;
    const pav = K2.CT(128, 128, (g, w) => { g.fillStyle = '#cfc9c0'; g.fillRect(0, 0, w, w); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const k = 0.9 + Math.random() * 0.12; g.fillStyle = `rgb(${207 * k | 0},${201 * k | 0},${192 * k | 0})`; g.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); } });
    K2.flat(sch, pav, XE - XW, SZ0 - ZN, (XW + XE) / 2, 0.02, (ZN + SZ0) / 2, 2);
    const oak = K2.planks('#b48a5a', '#6b4a2c'); K2.flat(sch, oak, SX0 - XW, ZS - SZ0, (XW + SX0) / 2, 0.02, (SZ0 + ZS) / 2, 4); K2.flat(sch, oak.clone(), XE - SX1, ZS - SZ0, (SX1 + XE) / 2, 0.02, (SZ0 + ZS) / 2, 4);
    // --- NORTH: sensory courtyard ---
    { const zp = 179.2; b.box('mat', '#ffd23a', XE - XW - 2, 0.02, 0.6, (XW + XE) / 2, 0.035, zp); if (!touch) for (let x = XW + 1.3; x < XE - 1.2; x += 0.3) for (const dz of [-0.18, 0, 0.18]) b.cyl('mat', '#f0c23a', 0.05, 0.03, x, 0.055, zp + dz, 6);
      b.box('mat', '#ffd23a', 0.6, 0.02, SZ0 - zp - 0.3, -219.5, 0.035, (SZ0 + zp) / 2 + 0.15); if (!touch) for (let z = zp + 0.5; z < SZ0 - 0.2; z += 0.3) for (const dx of [-0.18, 0, 0.18]) b.cyl('mat', '#f0c23a', 0.05, 0.03, -219.5 + dx, 0.055, z, 6);
      for (const zt of [ZN + 0.8, SZ0 - 0.8]) for (let x = XW + 1; x < XE - 1; x += 0.6) for (const dx of [0, 0.3]) b.box('mat', '#e8ddc8', 0.04, 0.02, 0.5, x + dx, 0.035, zt);
      const r0 = -242, r1 = -198, zr = 173.6; b.box('mat', '#8a8580', r1 - r0, 0.32, 0.25, (r0 + r1) / 2, 0.16, zr - 0.6); b.box('mat', '#8a8580', r1 - r0, 0.32, 0.25, (r0 + r1) / 2, 0.16, zr + 0.6); b.box('gls', '#2e86b8', r1 - r0, 0.04, 0.95, (r0 + r1) / 2, 0.24, zr);
      for (let x = r0 + 2; x < r1; x += 2.7) b.sph('mat', '#a9a39a', 0.2, x, 0.27, zr + Math.sin(x) * 0.2, 0.5, 6); box(r0, r1, zr - 0.75, zr + 0.75); lamps.push && 0;
      for (let i = 0; i < 6; i++) { const x = -244 + i * 9.6, z = 182.4; b.box('mat', '#8a6a46', 3, 0.7, 1.2, x, 0.35, z); b.box('mat', '#5c4430', 3.1, 0.06, 1.3, x, 0.71, z);
        for (let q = 0; q < 8; q++) { const hx = x - 1.2 + (q % 4) * 0.8, hz = z - 0.3 + (q / 4 | 0) * 0.6, kind = (i + q) % 3; b.sph('mat', kind === 1 ? '#5f8f4a' : '#7aa865', 0.24, hx, 0.82, hz, 0.7, 6); if (kind === 0) for (let f = 0; f < 4; f++) b.sph('glo', '#a78bfa', 0.05, hx - 0.1 + f * 0.07, 1.0 + (f % 2) * 0.06, hz, 1.6, 4); }
        box(x - 1.5, x + 1.5, z - 0.6, z + 0.6); }
      for (const x of [-236, -220, -204]) { b.box('mat', '#5c4430', 0.12, 2.6, 0.12, x, 1.3, 176.6); b.box('mat', '#5c4430', 0.9, 0.08, 0.08, x, 2.6, 176.6); b.cyl('mat', '#a77b4f', 0.14, 0.04, x, 2.35, 176.6, 10);
        for (let t = 0; t < 6; t++) { const a = t / 6 * Math.PI * 2; b.cyl('gls', '#c9ced3', 0.025, 0.4 + t * 0.06, x + Math.cos(a) * 0.12, 2.05 - t * 0.03, 176.6 + Math.sin(a) * 0.12, 6); } ring(x, 176.6, 0.2); }
      for (const x of [-228, -212]) { b.box('mat', '#a77b4f', 1.8, 0.08, 0.5, x, 0.46, 176.4); b.box('mat', '#201e1d', 0.08, 0.42, 0.42, x - 0.7, 0.21, 176.4); b.box('mat', '#201e1d', 0.08, 0.42, 0.42, x + 0.7, 0.21, 176.4); box(x - 0.9, x + 0.9, 176.1, 176.7); }
      for (const x of [-247, -193]) { b.cyl('mat', '#8a6a46', 0.5, 0.7, x, 0.35, 172.4, 12); b.cyl('mat', '#6b4a2c', 0.08, 2.2, x, 1.6, 172.4, 6); b.sph('mat', '#4f8a3e', 1.1, x, 3.1, 172.4, 1.1, 8); ring(x, 172.4, 0.55); }
      for (const z of [173, 178, 183]) K2.pendant(b, -220, z, 3.6, 7, '#f3f2f2'); }
    // --- WEST: cane + guide-dog room ---
    { const xw = XW + 0.25; for (let i = 0; i < 3; i++) { const z = 188 + i * 2.6; b.box('mat', '#5c4430', 0.08, 0.12, 2.2, xw, 1.75, z); b.box('mat', '#5c4430', 0.08, 0.12, 2.2, xw, 0.35, z);
        for (let c = 0; c < 9; c++) { const cz = z - 0.95 + c * 0.24, h = 1.1 + (c % 3) * 0.12; b.cyl('gls', '#f3f2f2', 0.014, h, xw + 0.14, 0.25 + h / 2, cz, 6, 0, 0.08); b.cyl('gls', '#ec3013', 0.016, 0.22, xw + 0.15, 0.25 + h * 0.72, cz, 6); b.sph('mat', '#201e1d', 0.03, xw + 0.13, 0.25, cz); b.cyl('mat', '#201e1d', 0.02, 0.18, xw + 0.15, 0.3 + h - 0.09, cz, 6); } }
      box(XW, XW + 0.5, 186.6, 195.6);
      { const x = -246.4, z = 199; b.box('mat', '#d9d6d0', 0.14, 2.1, 0.14, x, 1.05, z); for (let k = 0; k < 10; k++) b.box('mat', k % 5 ? '#201e1d' : '#ec3013', k % 5 ? 0.18 : 0.26, 0.012, 0.16, x, 0.9 + k * 0.1, z); b.cyl('mat', '#201e1d', 0.3, 0.04, x, 0.02, z, 14); ring(x, z, 0.32); }
      { const x = -240, z = 202.6; b.box('mat', '#a77b4f', 3, 0.08, 1, x, 0.92, z); for (const [dx, dz] of [[-1.4, -0.4], [1.4, -0.4], [-1.4, 0.4], [1.4, 0.4]]) b.box('mat', '#5c4430', 0.08, 0.9, 0.08, x + dx, 0.45, z + dz);
        b.box('mat', '#6b7278', 0.24, 0.18, 0.3, x - 1.1, 1.05, z); b.box('mat', '#6b7278', 0.08, 0.06, 0.4, x - 1.1, 1.18, z); for (let c = 0; c < 4; c++) b.cyl('gls', '#f3f2f2', 0.014, 1.2, x - 0.4 + c * 0.05, 0.98, z - 0.2 + c * 0.1, 6, 0, Math.PI / 2);
        b.box('mat', '#ec3013', 0.4, 0.2, 0.3, x + 0.9, 1.06, z + 0.1); for (let t = 0; t < 5; t++) b.sph('mat', '#201e1d', 0.035, x + 0.75 + t * 0.07, 1.18, z + 0.1);
        b.box('mat', '#c9b48a', 2.8, 1.1, 0.04, x, 1.9, ZS - 0.1); for (let t = 0; t < 7; t++) b.box('mat', '#6b7278', 0.04, 0.3 + (t % 3) * 0.08, 0.03, x - 1.2 + t * 0.4, 1.9, ZS - 0.14); box(x - 1.5, x + 1.5, z - 0.5, z + 0.5); }
      for (let i = 0; i < 3; i++) { const x = -243 + i * 2.6, z = 187; b.ecyl('mat', ['#2e4a6b', '#ec3013', '#3f9a5e'][i], 0.85, 0.6, 0.14, x, 0.08, z); b.etor('mat', '#d9d6d0', 0.82, 0.58, 0.12, x, 0.16, z);
        b.cyl('gls', '#9aa0a6', 0.16, 0.08, x + 0.9, 0.04, z + 0.6, 12); b.cyl('glo', '#5fd0d8', 0.13, 0.01, x + 0.9, 0.085, z + 0.6, 12); }
      for (let i = 0; i < 4; i++) { const z = 189 + i * 1.1, x = -233.6; b.box('mat', '#9aa0a6', 0.1, 0.04, 0.04, x, 1.6, z); b.etor('mat', i % 2 ? '#ec3013' : '#201e1d', 0.18, 0.24, 0.03, x - 0.08, 1.38, z); b.box('mat', '#c9a874', 0.03, 0.5, 0.06, x - 0.1, 1.2, z + 0.12); }
      for (const z of [190, 198]) K2.pendant(b, -241.5, z, 2.9, 7); }
    // --- EAST: reading nook + touch model of Meru ---
    { const xe = XE - 0.3; for (let i = 0; i < 4; i++) { const z = 187 + i * 2.2; b.box('mat', '#a77b4f', 0.45, 1.2, 2, xe, 0.6, z); for (let s = 0; s < 3; s++) for (let k = 0; k < 9; k++) b.box('mat', ['#ec3013', '#2e4a6b', '#3f9a5e', '#ffd23a', '#f3f2f2'][(i + s + k) % 5], 0.32, 0.3, 0.12 + (k % 3) * 0.04, xe - 0.04, 0.22 + s * 0.38, z - 0.85 + k * 0.21); }
      box(xe - 0.25, XE, 185.8, 195.2);
      for (let i = 0; i < 4; i++) b.sph('mat', ['#ec3013', '#ffd23a', '#2e4a6b', '#3f9a5e'][i], 0.55, -197 + (i % 2) * 1.6, 0.32, 188 + (i / 2 | 0) * 2.2, 0.6, 10);
      b.ecyl('mat', '#e6b45a', 2.6, 2.2, 0.02, -196.2, 0.03, 189.1, 24);
      { const tx = -200, tz = 199.8, sc = 0.0062; b.box('mat', '#5c4430', 6.2, 0.08, 6.2, tx, 0.86, tz); for (const [dx, dz] of [[-2.9, -2.9], [2.9, -2.9], [-2.9, 2.9], [2.9, 2.9]]) b.box('mat', '#201e1d', 0.12, 0.84, 0.12, tx + dx, 0.42, tz + dz);
        b.box('mat', '#e8ddc8', 5.8, 0.03, 5.8, tx, 0.915, tz); const LWm = L.WATER[0].e; b.ecyl('gls', '#2e86b8', LWm[2] * sc, LWm[3] * sc, 0.03, tx + LWm[0] * sc, 0.93, tz + LWm[1] * sc, 24);
        for (const r of L.ROADS) for (let i = 0; i < r.p.length - 1; i++) { const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1], len = Math.hypot(bx - ax, bz - az) * sc; b.box('mat', '#6b7278', len, 0.02, r.w * sc + 0.02, tx + (ax + bx) / 2 * sc, 0.94, tz + (az + bz) / 2 * sc, -Math.atan2(bz - az, bx - ax)); }
        for (const q of L.BUILDINGS) { if (!q.f) continue; const [a0, a1, c0, c1] = q.f, hh = 0.03 + Math.min(0.2, Math.max(a1 - a0, c1 - c0) * 0.002); b.box('mat', q.key === 'blindSchool' ? '#ec3013' : '#f3f2f2', (a1 - a0) * sc, hh, (c1 - c0) * sc, tx + (a0 + a1) / 2 * sc, 0.93 + hh / 2, tz + (c0 + c1) / 2 * sc); }
        b.cyl('mat', '#3f9a5e', I.c[2] * sc, 0.06, tx + I.pond.x * sc, 0.96, tz + I.pond.z * sc, 16); box(tx - 3.1, tx + 3.1, tz - 3.1, tz + 3.1);
        for (const [dx, dz] of [[-3.8, 0], [3.8, 0], [0, -3.8]]) { b.box('mat', '#2e4a6b', 0.45, 0.06, 0.45, tx + dx, 0.48, tz + dz); b.cyl('mat', '#201e1d', 0.04, 0.45, tx + dx, 0.23, tz + dz, 6); } }
      b.box('mat', '#f3f2f2', 0.04, 1.6, 3.2, xe + 0.26, 1.8, 196); for (let k = 0; k < 7; k++) { const z = 194.8 + k * 0.4; if (k % 3 === 0) b.sph('mat', '#ec3013', 0.14, xe + 0.2, 1.4 + (k % 2) * 0.6, z, 0.5); else if (k % 3 === 1) b.box('mat', '#2e4a6b', 0.08, 0.3, 0.3, xe + 0.2, 2.1, z); else b.cyl('mat', '#ffd23a', 0.12, 0.08, xe + 0.2, 1.8, z, 10, 0, Math.PI / 2); }
      for (const z of [189, 199]) K2.pendant(b, -199, z, 2.9, 7, '#ec3013'); }
    b.build(sch); }

  // ---------- PEARL ISLAND (step 6): the pearl diver at the deep pond, two locals, the ferry captain, palms, a pearl shack, the lantern trail ----------
  const IS = LK.island, isH = (x, z) => { const r = L.islandR(x, z); return r > I.pond.r && r < I.c[2] + 6 ? Math.max(0, L.islandH(r)) : 0; }, keys = new Set(), outs = [];
  const standFox = (key, opt, x, z, ry) => { const f = kit.makeFox({ key, ...opt }); f.position.set(x, isH(x, z), z); f.rotation.y = ry; scene.add(f); ring(x, z, 0.5); outs.push({ f, x, z, yaw0: ry, yaw: ry }); keys.add(key); return f; };
  for (const s of L.SPEAKERS) { if (!Array.isArray(s.at)) continue; const [x, z] = s.at, look = { pearlDiver: [{ torso: ['#f3f2f2', '#2e4a6b', '#16263c'], outfit: 'vest', look: { ...PLAYER_MALE, fur: '#c9b48a', furDark: '#7a5c38' } }, Math.atan2(I.pond.x - x, I.pond.z - z)],
      pearlLocal1: [{ torso: ['#ffd23a', '#e6b45a', '#7a5c38'], outfit: 'vest', look: { ...PLAYER_MALE, fur: '#e9772c' } }, -Math.PI / 2], pearlLocal2: [{ torso: ['#7cff9b', '#3f8f3a', '#1e4a2a'], outfit: 'robe', look: { ...PLAYER_MALE, fur: '#d86a26' } }, Math.PI],
      ferryCaptain: [{ torso: ['#f3f2f2', '#2e4a6b', '#16263c'], outfit: 'coat', look: { ...PLAYER_MALE, fur: '#a8a29a', furDark: '#6a6560' } }, Math.PI] }[s.key]; if (look) standFox(s.key, look[0], x, z, look[1]); }
  { const d = L.SPEAKERS.find(s => s.key === 'pearlDiver'); if (d) { const [x, z] = d.at, y = isH(x, z); spots.push({ key: 'pondDive', x, z: z - 0.1, r: 2.6, y: [y - 1, y + 2], prompt: 'DIVE \u00b7 ' + IS.dive.label, play: { label: IS.dive.label, url: IS.dive.url } });
      const sg = CT(256, 96, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 10, h); g.fillStyle = '#ffffff'; g.font = '900 34px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(IS.dive.label, 22, 34, w - 30); g.fillStyle = '#ffd23a'; g.font = '800 20px Archivo, sans-serif'; g.fillText('HULL PEARLS', 22, 70); });
      const sx = x - 2.4, sz = z - 1.2, sy = isH(sx, sz); C(0.07, 2, '#201e1d', sx, sy + 1, sz, 0.01, null, 6); const pl = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.75), new THREE.MeshBasicMaterial({ map: sg, side: THREE.DoubleSide })); pl.position.set(sx, sy + 2.1, sz); pl.rotation.y = Math.atan2(I.pond.x - sx, I.pond.z - sz) + Math.PI; scene.add(pl); ring(sx, sz, 0.25);
      // a little diving board over the pond by the diver
      const a = Math.atan2(I.pond.x - x, I.pond.z - z), bx = x + Math.sin(a) * 2.2, bz = z + Math.cos(a) * 2.2, by = isH(x, z); const bd = B(0.9, 0.12, 3.2, '#a07a52', bx, by + 0.4, bz, a, 0.01); C(0.1, 0.8, '#5c4430', x + Math.sin(a) * 0.9, by, z + Math.cos(a) * 0.9, 0.01, null, 6); } }
  spots.push({ key: 'pondSwim', x: I.pond.x, z: I.pond.z, r: I.pond.r - 0.5, y: [-4, 0.9], prompt: 'DIVE \u00b7 ' + IS.dive.label, play: { label: IS.dive.label, url: IS.dive.url } });
  // reeds round the pond, palms on the beach ring, a pearl shack, lanterns up the trail
  { const reedM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03, 0.05, 1.6, 4), toon('#5c9a43'), touch ? 40 : 80), M4 = new THREE.Matrix4(), Q4 = new THREE.Quaternion(), E4 = new THREE.Euler(); for (let i = 0; i < reedM.count; i++) { const a = Math.random() * 6.28, r = I.pond.r + 0.3 + Math.random() * 1.6, x = I.pond.x + Math.cos(a) * r, z = I.pond.z + Math.sin(a) * r; E4.set((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3); M4.compose(V3(x, isH(x, z) + 0.6, z), Q4.setFromEuler(E4), V3(1, 0.6 + Math.random() * 0.8, 1)); reedM.setMatrixAt(i, M4); } scene.add(reedM); }
  // art pass 5 extra: real PALMS from the flora kit (curved ringed trunk, drooping fronds, nuts; 1 instanced draw, wind sway)
  { const N = touch ? Math.round(IS.palms / 2) : IS.palms, list = []; let n = 0;
    for (let k = 0; k < 400 && n < N; k++) { const a = Math.random() * 6.28, [x, z] = L.islandPt(a, 33 + Math.random() * 11); if (onDeck(x, z) || LK.jetties.some(J => x > J.r[0] - 4 && x < J.r[1] + 4 && z > J.r[2] - 4 && z < J.r[3] + 4) || L.SPEAKERS.some(s => Array.isArray(s.at) && Math.hypot(s.at[0] - x, s.at[1] - z) < 4) || Math.hypot(x - IS.shack[0], z - IS.shack[1]) < 6 || (L.LIGHTHOUSES || []).some(q => Math.hypot(q.at[0] - x, q.at[1] - z) < 8)) continue; list.push([x, isH(x, z) - 0.15, z, 0.85 + Math.random() * 0.35, 'palm']); ring(x, z, 0.4); n++; }
    scene.add(plantTrees(list, { shadow: !touch }).group); }
  { const [hx, hz] = IS.shack, hy = isH(hx, hz); B(4.2, 2.6, 3.6, '#a07a52', hx, hy + 1.3, hz, 0, 0.02); const rf = M(new THREE.ConeGeometry(3.6, 1.8, 4), toon('#c9b48a'), hx, hy + 3.5, hz, null, 0.02); rf.rotation.y = Math.PI / 4; B(1.2, 1.9, 0.1, '#3d2a1c', hx + 2.12, hy + 0.95, hz, Math.PI / 2, 0); box(hx - 2.1, hx + 2.1, hz - 1.8, hz + 1.8);
    for (let k = 0; k < 3; k++) C(0.32, 0.3, '#f3f2f2', hx + 2.6, hy + 0.15 + k * 0.3, hz + 1.6 - k * 0.1, 0.01, null, 10); }
  { const P2 = IS.trail; for (let k = 0; k < P2.length - 1; k++) { const [ax, az] = P2[k], [bx, bz] = P2[k + 1], len = Math.hypot(bx - ax, bz - az); for (let t = 0; t < len; t += 7) { const u = t / len, nx = -(bz - az) / len, nz = (bx - ax) / len, s = (k + Math.round(t / 7)) % 2 ? 1 : -1, x = ax + (bx - ax) * u + nx * 1.8 * s, z = az + (bz - az) * u + nz * 1.8 * s, y = isH(x, z); C(0.07, 2.2, '#201e1d', x, y + 1.1, z, 0.01, null, 6); const h = B(0.3, 0.36, 0.3, lampHead, x, y + 2.3, z, 0, 0.01); lamps.push({ h, x, y: y + 2.3, z }); ring(x, z, 0.2); } } }
  for (const l of lamps.slice(glowS.length)) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffc67a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(2.6); s.position.set(l.x, l.y, l.z); s.visible = false; scene.add(s); glowS.push(s); }

  // ---------- THE FERRY (step 6): Pearl Ferry Dock pier ↔ Pearl Island jetty, on a schedule, free (DRAFT) ----------
  const FE = LK.ferry, FP = FE.path, cum = [0]; for (let i = 1; i < FP.length; i++) cum.push(cum[i - 1] + Math.hypot(FP[i][0] - FP[i - 1][0], FP[i][1] - FP[i - 1][1])); const FLEN = cum[cum.length - 1];
  const ptAt = s => { s = clamp(s, 0, FLEN); let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const u = (s - cum[i - 1]) / Math.max(1e-3, cum[i] - cum[i - 1]), [ax, az] = FP[i - 1], [bx, bz] = FP[i]; return { x: ax + (bx - ax) * u, z: az + (bz - az) * u, yaw: Math.atan2(bx - ax, bz - az) }; };
  const ferry = new THREE.Group(); scene.add(ferry);
  { const hull = B(4.4, 1.5, 11, '#f3f2f2', 0, 0.35, 0, 0, 0.03, ferry); B(4.46, 0.3, 11.06, '#ec3013', 0, 0.75, 0, 0, 0, ferry); const bow = M(new THREE.CylinderGeometry(2.2, 2.2, 1.5, 3, 1, false, -Math.PI / 6, Math.PI / 3 * 2), toon('#f3f2f2'), 0, 0.35, 5.5, ferry, 0.03); bow.scale.z = 0.9;
    B(4.2, 0.1, 10.8, '#a07a52', 0, 1.12, 0, 0, 0, ferry); B(3.4, 2.2, 3, '#2e4a6b', 0, 2.25, 2.8, 0, 0.02, ferry); B(3.6, 0.2, 3.4, '#f3f2f2', 0, 3.45, 2.8, 0, 0.01, ferry); B(3.0, 0.9, 0.06, new THREE.MeshPhongMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.6, shininess: 100 }), 0, 2.6, 4.32, 0, 0, ferry);
    for (const s of [-1, 1]) { B(0.08, 0.08, 10.4, '#201e1d', s * 2.1, 2.1, 0, 0, 0, ferry); for (let z = -5; z <= 5; z += 1.3) C(0.035, 1.0, '#201e1d', s * 2.1, 1.6, z, 0, ferry, 5); B(0.6, 0.45, 4, '#a07a52', s * 1.5, 1.4, -2.2, 0, 0.01, ferry); }
    const sg = CT(512, 96, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = '900 60px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('PEARL FERRY', 24, h / 2 + 3, w - 40); }); for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.56), new THREE.MeshBasicMaterial({ map: sg })); p.position.set(s * 1.72, 3.0, 2.8); p.rotation.y = s * Math.PI / 2; ferry.add(p); }
    const crew = kit.makeFox({ key: 'ferryCrew', torso: ['#f3f2f2', '#2e4a6b', '#16263c'], outfit: 'vest', look: { ...PLAYER_MALE, fur: '#d86a26' } }); crew.position.set(0, 1.15, 3.2); ferry.add(crew); npcs.push(crew); }
  const FS = { s: 0, dir: 1, phase: 'dwell', t: FE.dwell * 0.5, x: FP[0][0], z: FP[0][1], yaw: 0, v: 0, at: 0, rider: false };
  ferry.position.set(FS.x, -0.25, FS.z);
  const ferryStop = () => FS.phase === 'dwell' ? FE.stops[FS.at] : null;
  function ferryStep(dt, t) { if (FS.phase === 'dwell') { FS.t -= dt; FS.v = 0; if (FS.t <= 0) { FS.phase = 'run'; FS.dir = FS.at === 0 ? 1 : -1; tone(150, 0.9, 0.06, 'sawtooth'); tone(190, 0.9, 0.04, 'sawtooth'); } }
    else { const left = FS.dir > 0 ? FLEN - FS.s : FS.s, done = FLEN - left, vmax = Math.min(FE.speed, Math.sqrt(2 * FE.accel * Math.max(0, left)) + 0.3, Math.sqrt(2 * FE.accel * done) + 0.6); FS.v = damp(FS.v, vmax, 2, dt); FS.s += FS.dir * FS.v * dt;
      if ((FS.dir > 0 && FS.s >= FLEN) || (FS.dir < 0 && FS.s <= 0)) { FS.s = FS.dir > 0 ? FLEN : 0; FS.phase = 'dwell'; FS.t = FE.dwell; FS.at = FS.dir > 0 ? 1 : 0; FS.arrived = FE.stops[FS.at]; } }
    const p = ptAt(FS.s); FS.x = p.x; FS.z = p.z; if (FS.phase === 'run') { const ty = p.yaw + (FS.dir < 0 ? Math.PI : 0); FS.yaw += Math.atan2(Math.sin(ty - FS.yaw), Math.cos(ty - FS.yaw)) * Math.min(1, dt * 1.2); }
    ferry.position.set(FS.x, -0.25 + Math.sin(t * 1.3) * 0.06, FS.z); ferry.rotation.set(Math.sin(t * 0.9) * 0.012, FS.yaw, Math.sin(t * 1.1) * 0.02);
    if (FS.v > 1.5 && Math.random() < dt * 14) wake(FS.x - Math.sin(FS.yaw) * 6, FS.z - Math.cos(FS.yaw) * 6, 2, 5, 2, 0.4); }
  const ferryBlock = (x, z) => Math.hypot(x - FS.x, z - FS.z) < 7.5;
  function nearFerry(P) { const st = ferryStop(); if (!st || FS.rider) return null; return Math.hypot(P.x - st.off[0], P.z - st.off[1]) < 4.5 && Math.abs(P.y - st.off[2]) < 1.2 ? st : null; }
  function ferryBoard() { FS.rider = true; }
  function ferryRide(P) { ferry.updateMatrixWorld(true); const p = ferry.localToWorld(V3(1.5, 1.6, -2.2)); P.x = p.x; P.z = p.z; P.y = p.y - 0.3; P.yaw = FS.yaw + Math.PI / 2; P.sp = 0; P.ground = true; P.swim = false; P.vy = 0; }
  function ferryOff(P) { const st = ferryStop() || FE.stops[FS.at]; FS.rider = false; Object.assign(P, { x: st.off[0], z: st.off[1], y: st.off[2], yaw: st.off[3], vy: 0 }); return st; }
  const ferryStatus = () => FS.phase === 'dwell' ? { at: FE.stops[FS.at].label, leaves: Math.ceil(FS.t), next: FE.stops[1 - FS.at].label } : { to: FE.stops[FS.dir > 0 ? 1 : 0].label, eta: Math.ceil((FS.dir > 0 ? FLEN - FS.s : FS.s) / Math.max(2, FS.v)) };

  // ---------- per-frame ----------
  let wakeT = 0, night = null, cullT = 0;
  function tick(dt, t, P, isNight) {
    if (rip) { rip.offset.x = (t * 0.004) % 1; rip.offset.y = (t * 0.0025) % 1; } WU.value = t;
    if (spOn > 0) { spOn -= dt; for (let i = 0; i < SPN; i++) { if (spL[i] <= 0) continue; const k = i * 3; spL[i] -= dt; spV[k + 1] -= 14 * dt; spP[k] += spV[k] * dt; spP[k + 1] += spV[k + 1] * dt; spP[k + 2] += spV[k + 2] * dt; if (spL[i] <= 0 || spP[k + 1] < -0.3) { spL[i] = 0; spP[k + 1] = -999; } } spG.attributes.position.needsUpdate = true; }
    if (isNight !== night) { night = isNight; lampHead.color.set(night ? 0xffd28a : 0x8a7a5a); for (const s of glowS) s.visible = night; }
    cullT -= dt; if (cullT <= 0) { cullT = 0.5; for (const r of rooms) r.g.visible = Math.hypot(P.x - r.cx, P.z - r.cz) < 70; }
    for (const f of npcs) if (f.parent && f.parent.visible !== false) kit.animFox(f, dt, 0, false);
    ferryStep(dt, t); for (const o of outs) { const d = Math.hypot(P.x - o.x, P.z - o.z); o.f.visible = d < (touch ? 60 : 95); if (!o.f.visible) continue; const want = d < 6 ? Math.atan2(P.x - o.x, P.z - o.z) : o.yaw0; o.yaw += Math.atan2(Math.sin(want - o.yaw), Math.cos(want - o.yaw)) * Math.min(1, dt * 4); o.f.rotation.y = o.yaw; kit.animFox(o.f, dt, 0, false); }
    for (const b of buoys) { b.g.position.y = Math.sin(t * 1.6 + b.ph) * 0.12; b.g.rotation.z = Math.sin(t * 1.1 + b.ph) * 0.05; }
    // boat at rest bobs, slows down
    if (!BT.on) { BT.speed = damp(BT.speed, 0, 1.2, dt); BT.vx = damp(BT.vx, 0, 1.2, dt); BT.vz = damp(BT.vz, 0, 1.2, dt); BT.steer = damp(BT.steer, 0, 3, dt); const nx = BT.x + BT.vx * dt, nz = BT.z + BT.vz * dt; if (okAt(nx, nz, BT.yaw)) { BT.x = nx; BT.z = nz; } }
    placeBody(); BT.pl = damp(BT.pl, clamp((Math.abs(BT.speed) - 4) / 10, 0, 1), 3, dt); BT.kick = damp(BT.kick, 0, 5, dt);
    boat.position.set(BT.x, 0.08 + Math.sin(t * 1.7 + BT.x * 0.1) * 0.05 * (1 - BT.pl), BT.z); boat.rotation.y = BT.yaw;
    BV.spin.rotation.x = -(BT.pl * 0.09 + (BT.nitro > 0 ? 0.06 : 0)) + BT.kick * 0.05 + Math.sin(t * 1.3) * 0.015; BV.spin.rotation.z = -BT.steer * 0.12 * BT.pl + Math.sin(t * 1.1 + 1) * 0.02; BV.spin.position.y = -0.2 + BT.pl * 0.14;
    if (BV.prop) BV.prop.rotation.z += (2 + Math.abs(BT.speed) * 2.6) * dt * (BT.on ? 1 : 0); if (BV.trim) BV.trim.rotation.x = -BT.pl * 0.14; if (BV.wheel) BV.wheel.rotation.z = BT.steer * 1.8; if (BV.flag) BV.flag.rotation.y = Math.sin(t * (6 + Math.abs(BT.speed) * 0.4)) * 0.22 * (0.4 + BT.pl);
    wakeT -= dt; const sp = Math.abs(BT.speed);
    if (sp > 2 && wakeT <= 0) { wakeT = BT.nitro > 0 ? 0.035 : 0.06; const hx = Math.sin(BT.yaw), hz = Math.cos(BT.yaw); if (sp > 8) fx(BT.x - hx * 3.2, 0.25, BT.z - hz * 3.2, BT.nitro > 0 ? 4 : 2, 2.2 + sp * 0.08, 1.4, false); wake(BT.x - hx * 3.4, BT.z - hz * 3.4, 1.4, 3 + sp * 0.22, 1.8, 0.55 * Math.min(1, sp / 8)); }
    else if (P.swim && wakeT <= 0) { wakeT = P.sp > 0.5 ? 0.45 : 1.3; wake(P.x, P.z, 0.6, 2.2, 1.4, P.dive > 0 ? 0.15 : 0.45); }
    for (const w of wakes) { if (!w.m.visible) continue; w.t += dt; const k = w.t / w.life; if (k >= 1) { w.m.visible = false; continue; } const s = w.s0 + (w.s1 - w.s0) * Math.sqrt(k); w.m.scale.set(s, s, 1); w.m.material.opacity = w.op * (1 - k); }
    if (eng) { const e = eng; e.o1.frequency.setTargetAtTime(48 + sp * 5 + (BT.nitro > 0 ? 25 : 0), e.c.currentTime, 0.08); e.o2.frequency.setTargetAtTime(48 + sp * 5 + (BT.nitro > 0 ? 25 : 0), e.c.currentTime, 0.08); e.lp.frequency.setTargetAtTime(380 + sp * 40, e.c.currentTime, 0.1); e.g.gain.setTargetAtTime(0.025 + Math.abs(BT.thr) * 0.03 + (BT.nitro > 0 ? 0.02 : 0), e.c.currentTime, 0.1); }
  }

  // ---------- driving (called by the walk while you are at the wheel) ----------
  function drive(dt, ix, iy, P) {
    const thr = clamp(iy, -1, 1), str = clamp(ix, -1, 1), cap = BT.speed > S.max ? Math.max(S.max, BT.speed - dt * 6) : S.max; BT.thr = thr; BT.steer = damp(BT.steer, str, 6, dt); BT.ncd -= dt;
    if (BT.nitro > 0) { BT.nitro -= dt; BT.speed = damp(BT.speed, S.nitro, 2.5, dt); }
    else if (thr > 0.05) BT.speed += 8 * thr * dt * (BT.speed < 0 ? 2 : 1);
    else if (thr < -0.05) BT.speed += (BT.speed > 0 ? 12 : 4) * thr * dt;
    else BT.speed = damp(BT.speed, 0, 0.5, dt);
    BT.speed = clamp(BT.speed, -S.rev, BT.nitro > 0 ? S.nitro : cap);
    if (BT.spin > 0) { BT.spin -= dt; BT.yaw += BT.spinDir * Math.PI / 0.6 * dt; if (Math.random() < 0.5) wake(BT.x + (Math.random() - 0.5) * 3, BT.z + (Math.random() - 0.5) * 3, 1, 4, 1.2, 0.5); }
    else { const k = clamp(Math.abs(BT.speed) / 5, 0, 1) * (1 - 0.35 * clamp((Math.abs(BT.speed) - 12) / 16, 0, 1)); BT.yaw -= BT.steer * 1.7 * k * (BT.speed < -0.2 ? -1 : 1) * dt; }
    const hx = Math.sin(BT.yaw), hz = Math.cos(BT.yaw), gk = Math.min(1, dt * (BT.spin > 0 ? 0.8 : 2.4)); BT.vx += (hx * BT.speed - BT.vx) * gk; BT.vz += (hz * BT.speed - BT.vz) * gk;
    const nx = BT.x + BT.vx * dt, nz = BT.z + BT.vz * dt;
    if (okAt(nx, nz, BT.yaw)) { BT.x = nx; BT.z = nz; } else { if (Math.hypot(BT.vx, BT.vz) > 3) { tone(90, 0.25, 0.12, 'triangle'); splash(0.1); } BT.speed *= -0.3; BT.vx *= -0.3; BT.vz *= -0.3; BT.nitro = 0; BT.kick = 1; }
    boat.position.x = BT.x; boat.position.z = BT.z; boat.rotation.y = BT.yaw; boat.updateMatrixWorld(true);
    const p = BV.spin.localToWorld(V3(0, 0.3, -0.62)); P.x = p.x; P.z = p.z; P.y = p.y; P.yaw = BT.yaw; P.sp = Math.abs(BT.speed); P.ground = true; P.swim = false; P.vy = 0;
  }
  function nitro() { if (BT.ncd > 0 || BT.nitro > 0) return false; BT.nitro = S.nitroT; BT.ncd = S.nitroCd; BT.kick = 1; tone(140, 0.5, 0.06, 'sawtooth'); return true; }
  function powerTurn() { if (BT.spin > 0) return; BT.spin = 0.6; BT.spinDir = BT.steer > 0.15 ? -1 : 1; BT.speed *= 0.55; splash(0.14); }
  function enter() { BT.on = true; BT.spin = 0; engOn(); splash(0.06); }
  function exit(P) { if (Math.abs(BT.speed) > 3) return false; BT.on = false; BT.thr = 0; engOff(); save.setStat('meru2Boat', { x: BT.x, z: BT.z, yaw: BT.yaw });
    let best = null, bd = 7; for (const q of climbs) { const d = Math.hypot(q.edge[0] - BT.x, q.edge[1] - BT.z); if (d < bd) { bd = d; best = q; } }
    if (best) { Object.assign(P, { x: best.x, z: best.z, y: best.y, yaw: best.yaw, vy: 0 }); return 'deck'; }
    for (let r = 2.5; r < 8; r += 1) for (let a = 0; a < 6.28; a += 0.4) { const x = BT.x + Math.cos(a) * r, z = BT.z + Math.sin(a) * r; if (!inLake(x, z) || islandLand(x, z) || terrainAt(x, z) > 0.3) { if (onDeck(x, z)) continue; Object.assign(P, { x, z, y: islandLand(x, z) ? L.islandH(Math.hypot(x - I.pond.x, z - I.pond.z)) : terrainAt(x, z), vy: 0 }); return 'land'; } }
    const sx = BT.x + Math.cos(BT.yaw) * 2.2, sz = BT.z - Math.sin(BT.yaw) * 2.2; Object.assign(P, { x: sx, z: sz, y: -0.5, vy: 0 }); splash(0.12); return 'water'; }
  const nearBoat = P => !BT.on && Math.hypot(P.x - BT.x, P.z - BT.z) < (P.swim ? 3.8 : 5.4);
  const nearClimb = P => P.swim ? climbs.find(q => Math.hypot(P.x - q.edge[0], P.z - q.edge[1]) < 2.2) || null : null;
  const nearGate = () => { if (!BT.on) return false; const [gx, gz] = LK.gate.at; return Math.abs(BT.x - gx) < LK.gate.w / 2 + 2 && Math.abs(BT.z - gz) < 7; };

  function park() { if (!BT.on) return; BT.on = false; BT.thr = 0; engOff(); save.setStat('meru2Boat', { x: BT.x, z: BT.z, yaw: BT.yaw }); }
  return { spots, tick, groundAt, surfaceAt, drive, nitro, powerTurn, horn, enter, exit, park, nearBoat, nearClimb, nearGate, splash, fx, waterOK, waveAt,
    keys, nearFerry, ferryBoard, ferryRide, ferryOff, ferryStatus, ferry: FS,
    boat: BT, gate: LK.gate, stats: { climbs: climbs.length, lamps: lamps.length, piles: pileP.length } };
}
