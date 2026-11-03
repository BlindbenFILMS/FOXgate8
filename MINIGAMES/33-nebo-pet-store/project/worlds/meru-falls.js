// MERU — the Falls hill, at the Lake's north-west corner [meruLake zone]. The 2D map's little waterfall at the west end of the
// beach, lifted: a 6 m grassy hill that rises gently from the town and the south-gate road (walk up it anywhere on the north,
// west and lower east sides), with a sheer cliff only on the lake side, where the stream pours off it as a waterfall. A lantern
// path winds up to an overlook deck at the lip: the lake south and east, the falls beside you, the town to the north-east.
// Metres, town frame (x east, z south). Nothing here changes a room, NPC or minigame.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sm = (a, b, v) => { const k = clamp((v - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
export const HT = 6;
export const F = { x0: -38, x1: -9.6, z0: 25.5, z1: 44.0 };               // the hill's footprint
const EW = 0.5, RN = 11, RW = 9, RE = 8;                                    // cliff fall-off; slope runs north / west / east
export const STREAM = { x: -13.0, hw: 0.85, z0: 36.6, z1: F.z1 };          // on top, from a spring, south off the lip
export const BRIDGE = { z: 39.9, hw: 0.8 };
export const DECK = { x0: -11.75, x1: -8.85, z0: 41.0, z1: 44.75, y: HT + 0.06 };   // the SE corner: lake south + east, town north-east
export const FALL = { x: STREAM.x, top: HT - 0.2, lip: F.z1, w: 2.3 };
export const PATH_PTS = [[-7.5, 26.8], [-15, 27.6], [-22, 29.6], [-27.5, 33], [-25.5, 37], [-19.5, 39.3], [-13, 39.9], [-10.4, 41.4]];
const inF = (X, Z) => X >= F.x0 && X <= F.x1 && Z >= F.z0 && Z <= F.z1;
const inDeck = (X, Z) => X >= DECK.x0 && X <= DECK.x1 && Z >= DECK.z0 && Z <= DECK.z1;
const inBridge = (X, Z) => Math.abs(X - STREAM.x) < STREAM.hw + 0.5 && Math.abs(Z - BRIDGE.z) < BRIDGE.hw;
const eastK = Z => sm(32, 36.5, Z);                                          // north of z 32 the east side is a slope, south of 36.5 a cliff
const edgeK = (X, Z) => { const s = clamp((F.z1 - Z) / EW, 0, 1), e = 1 + (clamp((F.x1 - X) / EW, 0, 1) - 1) * eastK(Z); return Math.min(s, e); };
function hill(X, Z) {
  const dn = (Z - F.z0) / RN, dw = (X - F.x0) / RW, de = (F.x1 - X) / RE * (1 - eastK(Z)) + 9 * eastK(Z);
  const k = clamp(Math.min(dn, dw, de), 0, 1); return HT * (0.45 * k + 0.55 * k * k * (3 - 2 * k));
}
function core(X, Z) {
  const h = hill(X, Z), s = Math.abs(X - STREAM.x) / STREAM.hw;
  if (s < 1 && Z >= STREAM.z0 - 0.6) return h - 0.42 * (1 - s * s) * clamp((Z - STREAM.z0 + 0.6) / 0.6, 0, 1);
  return h;
}
// ground the mesh is drawn on (no deck); null when this point is not the hill's
export function terrain(X, Z, base) { if (!inF(X, Z)) return null; return base + core(X, Z) * edgeK(X, Z); }
export function standAt(X, Z, base) { if (inDeck(X, Z)) return DECK.y; if (inBridge(X, Z)) return HT + 0.16; return terrain(X, Z, base); }
export const inBluff = (X, Z) => inF(X, Z) || inDeck(X, Z);
export const nearBluff = (X, Z) => X > F.x0 - 1.5 && X < F.x1 + 1.5 && Z > F.z0 - 1.5 && Z < DECK.z1 + 1.5;
export function walkable(X, Z) { if (inDeck(X, Z) || inBridge(X, Z)) return true; if (Math.abs(X - STREAM.x) < STREAM.hw + 0.1 && Z > STREAM.z0 - 0.8) return false; return true; }
export const noTree = (X, Z) => X > F.x0 - 2.5 && X < F.x1 + 2.5 && Z > F.z0 - 2.5 && Z < F.z1 + 3;
export const sinkMesh = (X, Z) => inF(X, Z) && edgeK(X, Z) > 0.02 && core(X, Z) > 0.05;
const pathDist = (x, z) => { let best = 99; for (let i = 0; i < PATH_PTS.length - 1; i++) { const [ax, az] = PATH_PTS[i], [bx, bz] = PATH_PTS[i + 1], dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz, u = clamp(((x - ax) * dx + (z - az) * dz) / L, 0, 1); best = Math.min(best, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return best; };
const WATER_Y = -0.3;
function streakTex(THREE, base, n, light, dark) { const cv = document.createElement('canvas'); cv.width = 128; cv.height = 512; const x = cv.getContext('2d'); x.fillStyle = base; x.fillRect(0, 0, 128, 512);
  for (let i = 0; i < n; i++) { const px = Math.random() * 128, py = Math.random() * 512, h = 20 + Math.random() * 90, w = 1 + Math.random() * 4, dk = Math.random() < 0.3; const g = x.createLinearGradient(0, py, 0, py + h); const col = dk ? dark : light; g.addColorStop(0, col + '00'); g.addColorStop(0.5, col + (dk ? '88' : 'ee')); g.addColorStop(1, col + '00'); x.fillStyle = g; x.fillRect(px, py, w, h); if (py + h > 512) x.fillRect(px, py - 512, w, h); }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; }

export function buildFalls(K) {
  const { THREE, scene, M, BOX, toon, grad, glowing, glowTex, BK, colliders, camBlockers, flames, DARK, WOOD, heightAt, baseAt, LOW, parent } = K;
  const root = new THREE.Group(); root.name = 'meruFalls'; (parent || scene).add(root);
  // ---- the hill's own ground: grass, a dirt path, rock only where it is cliff ----
  const X0 = F.x0 - 1.6, X1 = F.x1 + 1.6, Z0 = F.z0 - 1.6, Z1 = F.z1 + 1.6, st = LOW ? 0.45 : 0.33;
  const nx = Math.round((X1 - X0) / st), nz = Math.round((Z1 - Z0) / st);
  const g = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
  const pos = g.attributes.position, cols = new Float32Array(pos.count * 3), c = new THREE.Color();
  const GR = new THREE.Color('#5c9a46'), GR2 = new THREE.Color('#4a8a40'), GRH = new THREE.Color('#78b052'), RK = new THREE.Color('#8f8676'), RK2 = new THREE.Color('#6f675c'), DIRT = new THREE.Color('#c8ae7c'), BED = new THREE.Color('#4f6670'), WET = new THREE.Color('#3f4b4f');
  const hAt = (x, z) => { const b = baseAt(x, z), t = terrain(x, z, b); return t == null ? b : t; };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = hAt(x, z); pos.setY(i, h + 0.02);
    const gx = (hAt(x + 0.25, z) - hAt(x - 0.25, z)) / 0.5, gz = (hAt(x, z + 0.25) - hAt(x, z - 0.25)) / 0.5, sl = Math.hypot(gx, gz);
    c.copy(GR).lerp(GR2, (Math.sin(x * 1.3) * Math.cos(z * 1.1) + 1) * 0.3).lerp(GRH, clamp(h / HT, 0, 1) * 0.35);
    const pd = pathDist(x, z); if (pd < 1.25) c.lerp(DIRT, clamp((1.25 - pd) / 0.35, 0, 1) * 0.9);
    if (Math.abs(x - STREAM.x) < STREAM.hw && z > STREAM.z0 - 0.4 && inF(x, z)) c.copy(BED);
    const rock = clamp((sl - 1.6) / 1.4, 0, 1);
    if (rock > 0) { c.lerp(RK.clone().lerp(RK2, (Math.sin(z * 2.7 + x + h * 3) + 1) * 0.5), rock); if (Math.abs(x - FALL.x) < FALL.w * 0.9 && z > F.z1 - 0.8) c.lerp(WET, 0.8); }
    cols.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); g.computeVertexNormals();
  const ground = new THREE.Mesh(g, new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: grad })); ground.receiveShadow = true; ground.castShadow = !LOW; scene.add(ground);
  { const pg = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, Math.round(nx / 3), Math.round(nz / 3)); pg.rotateX(-Math.PI / 2); pg.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2); const pp = pg.attributes.position; for (let i = 0; i < pp.count; i++) pp.setY(i, hAt(pp.getX(i), pp.getZ(i)) - 0.3); pg.computeBoundingSphere(); const proxy = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ visible: false })); scene.add(proxy); camBlockers.push(proxy); }
  // rocks: strata on the cliffs, boulders at their feet, stones along the stream banks, a mossy ring round the spring
  const rockM = toon('#857c6d'), rockD = toon('#6a6257'), moss = toon('#5f7f4a');
  const rocks = [[-11.6, 44.5, 0.8], [-14.6, 44.7, 0.9], [-15.8, 44.4, 0.6], [-17.8, 44.5, 0.8], [-20.6, 44.4, 0.7], [-24.0, 44.3, 0.6], [-9.3, 40.0, 0.7], [-9.1, 37.6, 0.6], [-13.9, 36.2, 0.7], [-12.1, 36.0, 0.55], [-13.0, 35.6, 0.5], [-14.2, 36.9, 0.4], [-11.8, 36.9, 0.4]];
  for (const [x, z, s] of rocks) { const m = M(new THREE.DodecahedronGeometry(s, 0), z < 38 ? moss : rockM, x, heightAt(x, z) + s * 0.25, z, root, 0.03, s); m.scale.y = 0.7; m.rotation.y = x * 3.1; }
  for (let z = STREAM.z0 + 0.8; z < F.z1 - 0.4; z += 0.9) { if (Math.abs(z - BRIDGE.z) < 1.2) continue; for (const sd of [-1, 1]) { const s = 0.16 + ((z * 7 + sd) % 1 + 1) % 1 * 0.14, x = STREAM.x + sd * (STREAM.hw + 0.05); const m = M(new THREE.DodecahedronGeometry(s, 0), rockD, x, HT - 0.05, z, root, 0.01, s); m.scale.y = 0.6; m.castShadow = false; } }
  for (let i = 0; i < 4; i++) { const z = 37 + i * 1.8; const m = M(BOX(0.25, 0.5 + (i % 3) * 0.3, 1.6), rockD, F.x1 + 0.02, 1.4 + (i % 4) * 1.1, z, root, 0); m.castShadow = false; }
  for (let i = 0; i < 12; i++) { const x = F.x0 + 14 + i * 1.15; if (Math.abs(x - STREAM.x) < 1.8) continue; const m = M(BOX(1.0, 0.45 + (i % 3) * 0.25, 0.25), rockD, x, 1.2 + (i % 4) * 1.15, F.z1 + 0.02, root, 0); m.castShadow = false; }
  // ---- the stream ----
  const streamT = streakTex(THREE, '#4f9bd6', 90, '#eaf7ff', '#2c6ea6'); streamT.repeat.set(1, 3);
  const sLen = F.z1 - STREAM.z0 + 0.1;
  const streamM = new THREE.MeshToonMaterial({ map: streamT, gradientMap: grad, emissive: new THREE.Color('#1c5a8c'), emissiveIntensity: 0.45, transparent: true, opacity: 0.93 });
  const sw = new THREE.Mesh(new THREE.PlaneGeometry(STREAM.hw * 1.95, sLen), streamM); sw.rotation.x = -Math.PI / 2; sw.position.set(STREAM.x, HT - 0.15, STREAM.z0 + sLen / 2); root.add(sw);
  { const pool = new THREE.Mesh(new THREE.CircleGeometry(1.05, 24), streamM); pool.rotation.x = -Math.PI / 2; pool.position.set(STREAM.x, HT - 0.14, STREAM.z0 + 0.15); root.add(pool); }
  // a plank footbridge where the path crosses
  { const bx = STREAM.x, bz = BRIDGE.z, T = HT + 0.16; M(BOX(STREAM.hw * 2 + 1.2, 0.12, BRIDGE.hw * 2), BK.texMat('plank', '#8a6440', 2, 1), bx, T - 0.06, bz, root, 0.02);
    for (const sz of [-1, 1]) { M(BOX(STREAM.hw * 2 + 1.2, 0.07, 0.07), toon('#5a3d2b'), bx, T + 0.6, bz + sz * (BRIDGE.hw - 0.05), root, 0.01); for (const sx of [-1, 1]) M(BOX(0.08, 0.66, 0.08), toon('#5a3d2b'), bx + sx * (STREAM.hw + 0.5), T + 0.3, bz + sz * (BRIDGE.hw - 0.05), root, 0.01); } }
  // ---- the falls: a bowed main sheet (bright at the lip, blue in the middle, white where it churns), a faster front veil,
  // thin side strands, a white curl at the lip; at the foot a plunge pool, expanding rings, spray and drifting mist ----
  const drop = FALL.top - WATER_Y;
  const fallT = streakTex(THREE, '#bfe2f8', 150, '#ffffff', '#6fb0de'); fallT.repeat.set(1.3, 1.4);
  const veilT = streakTex(THREE, '#ffffff', 120, '#ffffff', '#cfe8f8'); veilT.repeat.set(1.8, 1.0);
  const sheet = (map, w, push, op, segs) => { const sg = new THREE.PlaneGeometry(w, drop, segs, 24), sp = sg.attributes.position, vc = new Float32Array(sp.count * 3);
    for (let i = 0; i < sp.count; i++) { const v = (drop / 2 - sp.getY(i)) / drop, u = sp.getX(i) / w; sp.setY(i, FALL.top - v * drop); sp.setZ(i, FALL.lip + 0.08 + push * (Math.pow(v, 0.5) * 1.35 + Math.sin(u * 9) * 0.04)); sp.setX(i, sp.getX(i) * (1 + v * 0.3)); const wht = Math.max(1 - v * 4, sm(0.7, 1, v)); vc.set([0.72 + 0.28 * wht, 0.86 + 0.14 * wht, 1], i * 3); }
    sg.setAttribute('color', new THREE.BufferAttribute(vc, 3)); sg.computeVertexNormals();
    const m = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ map, vertexColors: true, transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false })); m.position.x = FALL.x; m.renderOrder = 2; root.add(m); return m; };
  sheet(fallT, FALL.w, 1, 0.97, 6); const veil = sheet(veilT, FALL.w * 1.08, 1.12, 0.45, 6);
  for (const sd of [-1, 1]) { const s = sheet(veilT, 0.35, 1.05, 0.5, 1); s.position.x = FALL.x + sd * (FALL.w * 0.62); }
  { const curl = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, FALL.w, 10, 1, false, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xf4fbff, transparent: true, opacity: 0.9 })); curl.rotation.z = Math.PI / 2; curl.position.set(FALL.x, FALL.top - 0.02, FALL.lip + 0.1); root.add(curl); }
  const poolT = streakTex(THREE, '#5cc0d8', 60, '#e8fbff', '#2f8fb0'); poolT.repeat.set(2, 2);
  { const pool = new THREE.Mesh(new THREE.CircleGeometry(3.2, 32), new THREE.MeshBasicMaterial({ map: poolT, transparent: true, opacity: 0.55, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(FALL.x, WATER_Y + 0.02, FALL.lip + 1.9); pool.scale.set(1.25, 0.8, 1); root.add(pool); root.userData.pool = pool; }
  const churn = new THREE.Mesh(new THREE.CircleGeometry(1.5, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, depthWrite: false })); churn.rotation.x = -Math.PI / 2; churn.scale.set(1.15, 0.7, 1); churn.position.set(FALL.x, WATER_Y + 0.05, FALL.lip + 1.5); root.add(churn);
  const foam = []; const foamM = glowing('#f2faff', null, 0.7);
  for (let i = 0; i < 9; i++) { const m = M(new THREE.SphereGeometry(0.3 + (i % 3) * 0.1, 8, 6), foamM, FALL.x + (i - 4) * 0.33, WATER_Y + 0.05, FALL.lip + 1.45 + Math.sin(i * 1.7) * 0.25, root, 0); m.castShadow = false; m.scale.y = 0.55; foam.push(m); }
  const rings = Array.from({ length: 3 }, (_, i) => { const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.08, 36), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.set(FALL.x, WATER_Y + 0.04, FALL.lip + 1.6); root.add(r); return { r, ph: i / 3 }; });
  for (const [x, z, s] of [[-15.8, 46.6, 0.6], [-10.6, 46.3, 0.5], [-14.4, 47.6, 0.4], [-11.8, 47.4, 0.35]]) { const m = M(new THREE.DodecahedronGeometry(s, 0), rockD, x, WATER_Y + s * 0.2, z, root, 0.02, s); m.scale.y = 0.55; }
  const NS = LOW ? 28 : 64, sprayG = new THREE.BufferGeometry(), sprayP = new Float32Array(NS * 3), sprayS = Array.from({ length: NS }, () => ({ ph: Math.random(), a: Math.random() * Math.PI * 2, v: 1.2 + Math.random() * 1.6 }));
  sprayG.setAttribute('position', new THREE.BufferAttribute(sprayP, 3));
  const spray = new THREE.Points(sprayG, new THREE.PointsMaterial({ color: 0xffffff, size: 0.14, transparent: true, opacity: 0.85, depthWrite: false })); spray.frustumCulled = false; root.add(spray);
  const mist = Array.from({ length: LOW ? 5 : 10 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xe6f6ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 })); root.add(s); return { s, ph: i / (LOW ? 5 : 10) }; });
  // a faint rainbow in the mist by day
  const bow = new THREE.Group(); bow.position.set(FALL.x + 0.4, WATER_Y, FALL.lip + 2.6); bow.rotation.y = 0.35; root.add(bow);
  ['#ff5a4a', '#ffa640', '#ffe45a', '#6ee06a', '#5aa8ff', '#9a6aff'].forEach((col, i) => { const a = new THREE.Mesh(new THREE.TorusGeometry(3.6 - i * 0.11, 0.06, 4, 40, Math.PI), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); bow.add(a); });
  // ---- the overlook deck at the lip, railed, a bench and a viewer ----
  { const cx = (DECK.x0 + DECK.x1) / 2, cz = (DECK.z0 + DECK.z1) / 2, w = DECK.x1 - DECK.x0, d = DECK.z1 - DECK.z0, T = DECK.y;
    M(BOX(w, 0.14, d), BK.texMat('plank', '#8a6440', 3, 2), cx, T - 0.07, cz, root, 0.02);
    for (const x of [DECK.x0 + 0.15, DECK.x1 - 0.15]) { M(new THREE.CylinderGeometry(0.11, 0.13, 3.2, 7), toon('#4a3424'), x, T - 1.7, DECK.z1 - 0.15, root, 0.01, 0.13); const br = M(BOX(0.1, 0.1, 1.9), toon('#4a3424'), x, T - 1.1, DECK.z1 - 0.95, root, 0); br.rotation.x = -0.65; }
    const railM = toon('#5a3d2b');
    const rail = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(x1 - x0, z1 - z0); for (const y of [0.55, 1.0]) { const r = M(BOX(0.08, 0.08, len), railM, (x0 + x1) / 2, T + y, (z0 + z1) / 2, root, 0.01); r.rotation.y = a; } for (let i = 0, n = Math.max(1, Math.round(len / 1.0)); i <= n; i++) M(BOX(0.1, 1.05, 0.1), railM, x0 + (x1 - x0) * i / n, T + 0.52, z0 + (z1 - z0) * i / n, root, 0.01); colliders.push({ box: [Math.min(x0, x1) - 0.08, Math.max(x0, x1) + 0.08, Math.min(z0, z1) - 0.08, Math.max(z0, z1) + 0.08] }); };
    rail(DECK.x0 + 0.05, DECK.z1 - 0.05, DECK.x1 - 0.05, DECK.z1 - 0.05); rail(DECK.x0 + 0.05, DECK.z0 + 1.4, DECK.x0 + 0.05, DECK.z1 - 0.05); rail(DECK.x1 - 0.05, DECK.z0 + 0.05, DECK.x1 - 0.05, DECK.z1 - 0.05);
    // the cliff lip either side of the deck gets a low rope rail too (so the edge always reads)
    rail(-24.5, F.z1 - 0.25, STREAM.x - STREAM.hw - 0.2, F.z1 - 0.25); rail(F.x1 - 0.25, DECK.z0 - 0.2, F.x1 - 0.25, 37.0);
    M(BOX(1.6, 0.1, 0.5), WOOD, cx, T + 0.45, DECK.z0 + 0.7, root, 0.02); M(BOX(1.6, 0.45, 0.08), WOOD, cx, T + 0.72, DECK.z0 + 0.46, root, 0.02);
    for (const x of [-0.7, 0.7]) M(BOX(0.1, 0.42, 0.42), DARK, cx + x, T + 0.21, DECK.z0 + 0.7, root, 0.01);
    colliders.push({ box: [cx - 0.85, cx + 0.85, DECK.z0 + 0.4, DECK.z0 + 0.95] });
    const vx = DECK.x1 - 0.5, vz = DECK.z1 - 0.5; M(new THREE.CylinderGeometry(0.06, 0.09, 1.1, 8), DARK, vx, T + 0.55, vz, root, 0.01, 0.09);
    const scope = M(new THREE.CylinderGeometry(0.11, 0.16, 0.6, 10), toon('#c0995c'), vx, T + 1.22, vz, root, 0.02, 0.16); scope.rotation.set(Math.PI / 2 - 0.25, 0, -0.7);
    colliders.push({ c: [vx, vz, 0.25] }); }
  // ---- lanterns line the winding path (path readability rule) ----
  const lantern = (x, z) => { const gg = new THREE.Group(); gg.position.set(x, heightAt(x, z), z); root.add(gg); BK.lantern(0, 0, gg, null, '#ffd38a'); colliders.push({ c: [x, z, 0.18] }); };
  { let acc = 2.5; for (let i = 0; i < PATH_PTS.length - 1; i++) { const [ax, az] = PATH_PTS[i], [bx, bz] = PATH_PTS[i + 1], L = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / L, dz = (bz - az) / L; for (; acc < L; acc += 5.5) { const x = ax + dx * acc + dz * 1.5, z = az + dz * acc - dx * 1.5; if (Math.abs(x - STREAM.x) < 1.8 || inDeck(x, z)) continue; lantern(x, z); } acc -= L; } }
  lantern(F.x1 - 0.5, DECK.z0 - 0.4);
  // pines on the hill so it has a skyline (kept off the path)
  for (const [x, z, s] of [[-30, 40, 1.2], [-26.5, 42.5, 1.0], [-34, 37, 1.1], [-33, 30, 0.9], [-18, 34, 0.9], [-21.5, 42.6, 0.85], [-35.5, 41.5, 1.0], [-30.5, 35.5, 0.8]]) { const y = heightAt(x, z), gg = new THREE.Group(); gg.position.set(x, y, z); gg.scale.setScalar(s); root.add(gg); M(new THREE.CylinderGeometry(0.2, 0.28, 1.6, 7), toon('#6a4a32'), 0, 0.8, 0, gg, 0.02, 0.28); M(new THREE.ConeGeometry(1.4, 2.6, 7), toon('#2f6e4a'), 0, 2.6, 0, gg, 0.04, 1.4); M(new THREE.ConeGeometry(1.0, 2.1, 7), toon('#3a7f52'), 0, 3.9, 0, gg, 0.04, 1.0); colliders.push({ c: [x, z, 0.4 * s] }); }
  let t = 0;
  return { root, ground, update(dt, sunY = 0.5) {
    t += dt; streamT.offset.y -= dt * 0.6; fallT.offset.y += dt * 1.5; veilT.offset.y += dt * 2.3; poolT.offset.x += dt * 0.04; poolT.offset.y -= dt * 0.05;
    foam.forEach((m, i) => { const k = 1 + Math.sin(t * 6 + i * 1.3) * 0.2; m.scale.set(k, 0.55 * k, k); });
    churn.material.opacity = 0.65 + Math.sin(t * 9) * 0.1;
    for (const R of rings) { const u = (t * 0.55 + R.ph) % 1; R.r.scale.setScalar(1 + u * 2.6); R.r.material.opacity = (1 - u) * 0.55; }
    for (let i = 0; i < NS; i++) { const p = sprayS[i], u = (t * 0.9 + p.ph) % 1, r = u * p.v; sprayP[i * 3] = FALL.x + Math.cos(p.a) * r * 1.2; sprayP[i * 3 + 1] = WATER_Y + 0.1 + Math.sin(u * Math.PI) * p.v * 0.9; sprayP[i * 3 + 2] = FALL.lip + 1.5 + Math.abs(Math.sin(p.a)) * r * 0.9; }
    sprayG.attributes.position.needsUpdate = true;
    mist.forEach(m => { const u = (t * 0.3 + m.ph) % 1; m.s.position.set(FALL.x + Math.sin(m.ph * 20) * 1.1, WATER_Y + 0.4 + u * 3.6, FALL.lip + 1.4 + u * 1.0); m.s.scale.setScalar(1.8 + u * 2.8); m.s.material.opacity = Math.sin(u * Math.PI) * 0.32; });
    const day = clamp((sunY - 0.12) * 3, 0, 1); bow.visible = day > 0.01; bow.children.forEach(a => { a.material.opacity = day * (0.13 + Math.sin(t * 0.4) * 0.03); });
  } };
}
