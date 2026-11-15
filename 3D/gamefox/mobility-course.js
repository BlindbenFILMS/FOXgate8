// THE MOBILITY COURSE ROOM · v2 (13 Nov 2026): rebuilt from the three Ora sources Ben gave: the Endpoints & Technologies page, the Retina & Macular Diseases page
//   and the Posterior Segment fact sheet (PDF, pages 4 + 5: the text and the photos). The real course is the Ora-VNC™ mobility course. Ledger of every fact: MOBILITY_COURSE_FACTS.md.
// WHAT THE SOURCES GIVE (built here): a DARK floor · a path of WHITE foam floor tiles that lock together (jigsaw edges) · CUBES built from the same tiles in red, yellow, green + blue,
//   standing on the tiles, beside them, some turned at an angle · a flat coloured tile lying in the path · standardized light levels (no numbers given) · every session recorded and scored by
//   certified, masked graders at an independent reading center (no scoring rule given) · several versions of each course, so nobody learns one by heart ·
//   no single course fits every kind of sight loss: central (LHON), light perception (LCA), peripheral (RP), from mild field narrowing with sharp central sight down to light perception only · each can be made easier or harder.
// STAND-INS (the sources are silent; say so wherever a visitor reads one): the room 10 × 6 × 2.7 m · the tile + cube edge 0.6 m · the 7 light steps (shown in proportion: a screen cannot be set to a measured lux) ·
//   the ceiling light grid + four cameras · the PASS rule · the four LAYOUTS in SETUPS (ours: Ora does not publish its layouts).
//   const course = setupMobilityCourse({ THREE, scene, at: { x, z }, face, setup: 'weave', level: 1, route: 1, lux: 400, rule: { faults: 3, seconds: 180 }, onEvent });
//   every frame, AFTER you moved the walker:  course.step(dt, walker.position, walker.rotation.y)   → it keeps the walker out of the cubes + walls, runs the trial clock, counts faults, records the walk
//   The trial starts on the START pad and ends on the END pad. A FAULT = touching a cube (once per touch) or stepping off the tiles (once per time). A dead end's tiles are tiles: walking in costs time only.
//   course.set({ setup, level, route }) · setSetup('weave' | 'forks' | 'slalom' | 'lit') · setLevel(1..3) · setRoute(1..12) · setLux(1 | 4 | 10 | 50 | 125 | 250 | 400) · restart() = the same layout, a new trial · reset() = rebuild
//   course.brightness() 0..1 = what to multiply YOUR lights by while a visitor is inside (THE LIT PATH: the room stays dark and the light steps set how brightly the path glows)
//   course.state() → { running, done, seconds, bumps, off } · course.result() → { seconds, bumps, off, faults, pass, setup, level, route, lux, record: [[t, x, z, ry]], marks: [{ t, x, z, kind }] } after the END pad
//   course.info() → { setup, level, route, lane, len, turns, cubes, deadEnds, glow } · course.cams · course.center · course.startPos / endPos (world) · course.points → [name, place, line] × 7 for the EXPLAIN view
//   SEEING THE PATH (14 Nov, Ben: "super hard to see the path"): the tiles are slabs 2.5 cm thick with plain foam edges, their tops lifted off the floor + lit a little by themselves in proportion to the light step, the floor picture is filtered for a low camera.
//   course.tileTop (0.025) · course.heightAt(x, z) → the floor height under a walker (tileTop on a tile, 0 off) · course.tiles → the world centre of every tile (Vector3)
//   planCourse(setup, level, n) → the layout alone (no three.js): tiles, cubes, flats, pts. Every layout is CHECKED as it is made: a cube that would close the way from START to END is not placed.
export const LUX = [1, 4, 10, 50, 125, 250, 400];
export const SIGHTS = [['clear', 'CLEAR SIGHT'], ['field', 'NARROWED FIELD, SHARP CENTRE'], ['rp', 'TUNNEL VISION (RP)'], ['lhon', 'CENTRAL DARK SPOT (LHON)'], ['lca', 'HEAVY BLUR (LCA)'], ['lp', 'LIGHT PERCEPTION ONLY'], ['cataracts', 'CATARACTS'], ['glaucoma', 'GLAUCOMA'], ['floaters', 'FLOATERS']];
export const ROUTES = 12, LEVELS = 3, TILE = 0.6, GRID = { ni: 15, nj: 9, tile: TILE, room: [10, 6] }, FOAM = ['#f2cf1c', '#2fa24a', '#1c82d6', '#dc2a22'];
// OUR four layouts: each presses on the part of sight that one kind of loss takes away. vision = the loss · sight = the matching SIGHTS key · lane = tiles wide · levels = easier → harder.
export const SETUPS = [
  { key: 'weave', name: 'THE WEAVE', vision: 'NARROWED FIELD', sight: 'field', lane: 1, who: 'Mild loss of side vision with sharp central sight: the mildest level the fact sheet names.', how: 'A narrow path with many quick turns. Cubes stand close on both sides and just past the corners.',
    levels: [{ stations: 4, corner: 3, side: 5, flats: 1, tilt: 0.3, gaps: [0.08, 0.16] }, { stations: 5, corner: 4, side: 7, flats: 2, tilt: 0.4, gaps: [0.02, 0.08, 0.16] }, { stations: 7, corner: 5, side: 9, flats: 2, tilt: 0.5, gaps: [0.02, 0.02, 0.08] }] },
  { key: 'forks', name: 'THE FORKS', vision: 'TUNNEL VISION', sight: 'rp', lane: 1, who: 'Peripheral vision loss, as in retinitis pigmentosa.', how: 'The path runs on to a cube and stops. The way forward branches off to the side.',
    levels: [{ stations: 3, spurs: 3, spurLen: [2], side: 2, tilt: 0.2, gaps: [0.16] }, { stations: 4, spurs: 5, spurLen: [1, 2], corner: 1, side: 3, flats: 1, tilt: 0.3, gaps: [0.08, 0.16] }, { stations: 5, spurs: 8, spurLen: [1, 1, 2], corner: 2, side: 4, flats: 1, tilt: 0.4, gaps: [0.02, 0.08] }] },
  { key: 'slalom', name: 'THE SLALOM', vision: 'CENTRAL LOSS', sight: 'lhon', lane: 2, who: 'Central vision loss, as in Leber hereditary optic neuropathy.', how: 'A wide path with long straights. Cubes stand in the path itself, straight ahead.',
    levels: [{ stations: 2, inLane: 3, corner: 1, side: 1, tilt: 0.2, gaps: [0.16] }, { stations: 3, inLane: 5, corner: 1, side: 2, flats: 1, tilt: 0.3, gaps: [0.08] }, { stations: 4, inLane: 7, corner: 2, side: 2, flats: 2, tilt: 0.4, gaps: [0.02, 0.08] }] },
  { key: 'lit', name: 'THE LIT PATH', vision: 'LIGHT ONLY', sight: 'lp', lane: 2, glow: true, who: 'Light perception only: the most severe level the fact sheet names.', how: 'A dark room. The path itself is lit. A cube shows as a dark gap in the light.',
    levels: [{ stations: 1 }, { stations: 2, inLane: 2 }, { stations: 3, inLane: 4 }] }
];
const NI = GRID.ni, NJ = GRID.nj, T = TILE, HC = T / 2, HW = 5, HD = 3, WR = 0.22, TT = 0.025;   // TT = how thick the foam tiles are (a stand-in)
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let x = Math.imul(s ^ s >>> 15, 1 | s); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
const tU = i => (i - (NI - 1) / 2) * T, tV = j => (j - (NJ - 1) / 2) * T, tI = u => Math.floor(u / T + NI / 2), tJ = v => Math.floor(v / T + NJ / 2);   // tile centre ↔ tile index
// THE CHECK: can a walker 0.08 m fatter than ours get from A to B, staying 0.08 m inside the tiles? (a 5 cm grid over the room; add(cube) keeps the cube only if the answer stays yes)
function checker(white, A, B) {
  const h = 0.05, nx = 200, nz = 120, N = nx * nz, ok = new Uint8Array(N), blk = new Uint8Array(N), seen = new Uint8Array(N), q = new Int32Array(N), m = 0.08, cl = WR + 0.08;
  const isW = (u, v) => { const i = tI(u), j = tJ(v); return i >= 0 && j >= 0 && i < NI && j < NJ && white[j * NI + i] > 0; };
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) { const u = -HW + (x + 0.5) * h, v = -HD + (z + 0.5) * h; if (isW(u - m, v - m) && isW(u + m, v - m) && isW(u - m, v + m) && isW(u + m, v + m)) ok[z * nx + x] = 1; }
  const cell = p => Math.max(0, Math.min(nz - 1, Math.floor((p[1] + HD) / h))) * nx + Math.max(0, Math.min(nx - 1, Math.floor((p[0] + HW) / h)));
  const near = c => { const out = [], R = HC * 1.4143 + cl, cs = Math.cos(c.ry), sn = Math.sin(c.ry), x0 = Math.max(0, Math.floor((c.u - R + HW) / h)), x1 = Math.min(nx - 1, Math.ceil((c.u + R + HW) / h)), z0 = Math.max(0, Math.floor((c.v - R + HD) / h)), z1 = Math.min(nz - 1, Math.ceil((c.v + R + HD) / h));
    for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) { const dx = -HW + (x + 0.5) * h - c.u, dz = -HD + (z + 0.5) * h - c.v, lx = Math.abs(dx * cs - dz * sn) - HC, lz = Math.abs(dx * sn + dz * cs) - HC; if (Math.hypot(Math.max(lx, 0), Math.max(lz, 0)) < cl) out.push(z * nx + x); } return out; };
  const reach = () => { seen.fill(0); const s = cell(A), e = cell(B); if (!ok[s] || blk[s] || !ok[e] || blk[e]) return false; let hd = 0, tl = 0; q[tl++] = s; seen[s] = 1;
    while (hd < tl) { const c = q[hd++]; if (c === e) return true; const x = c % nx; for (let d = 0; d < 4; d++) { const t = d === 0 ? (x < nx - 1 ? c + 1 : -1) : d === 1 ? (x > 0 ? c - 1 : -1) : d === 2 ? c + nx : c - nx; if (t < 0 || t >= N || seen[t] || !ok[t] || blk[t]) continue; seen[t] = 1; q[tl++] = t; } } return false; };
  return { reach, add: c => { const cells = near(c); for (const i of cells) blk[i]++; if (reach()) return true; for (const i of cells) blk[i]--; return false; } };
}
// ONE LAYOUT (no three.js): a path that crosses the room on the tile grid with two turns at each of its "stations", then dead ends, cubes + flat tiles by the setup's level. The same (setup, level, n) always gives the same layout.
export function planCourse(setup = 'weave', level = 1, n = 1) {
  const si = Math.max(0, SETUPS.findIndex(s => s.key === setup)), S = SETUPS[si], lv = Math.max(1, Math.min(LEVELS, level | 0)), P = S.levels[lv - 1], W = S.lane;
  const rnd = rng(7919 * n + 13 + 104729 * si + 1299709 * lv), flip = n % 2 === 0 ? -1 : 1, pick = a => a[Math.floor(rnd() * a.length)], mix = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // the path's own lattice: tile centres for a one-tile lane, tile corners for a two-tile lane
  const i0 = W - 1, i1 = NI - 1, j0 = W - 1, j1 = NJ - 1, gap = W + 1, o = (W - 1) / 2, LU = i => (i - (NI - 1) / 2 - o) * T * flip, LV = j => (j - (NJ - 1) / 2 - o) * T;
  const span = i1 - i0 - 2, k = Math.max(1, Math.min(P.stations, Math.floor(span / gap) + 1)), slack = span - (k - 1) * gap;
  const cols = Array.from({ length: k }, () => Math.floor(rnd() * (slack + 1))).sort((a, b) => a - b).map((x, m) => i0 + 1 + m * gap + x), rows = [j0 + Math.floor(rnd() * (j1 - j0 + 1))];
  for (let m = 0; m < k; m++) { const opts = []; for (let q = j0; q <= j1; q++) if (Math.abs(q - rows[m]) >= gap) opts.push(q); rows.push(pick(opts)); }
  const V = [[i0, rows[0]]]; for (let m = 0; m < k; m++) V.push([cols[m], rows[m]], [cols[m], rows[m + 1]]); V.push([i1, rows[k]]);   // START, two turns a station, END
  const lat = []; for (let s = 0; s < V.length - 1; s++) { const [a, b] = V[s], [c, d] = V[s + 1], di = Math.sign(c - a), dj = Math.sign(d - b), l = Math.abs(c - a) + Math.abs(d - b); for (let q = s ? 1 : 0; q <= l; q++) lat.push({ i: a + di * q, j: b + dj * q, di, dj, vert: q === 0 || q === l }); }
  const pts = V.map(([i, j]) => [LU(i), LV(j)]), segs = []; let len = 0; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, l, at: len, du: (b[0] - a[0]) / l, dv: (b[1] - a[1]) / l }); len += l; }
  const white = new Uint8Array(NI * NJ), offs = W === 1 ? [0] : [-HC, HC];   // 1 = a path tile · 2 = a dead-end tile
  for (const p of lat) for (const a of offs) for (const b of offs) { const i = tI(LU(p.i) + a), j = tJ(LV(p.j) + b); if (i >= 0 && j >= 0 && i < NI && j < NJ) white[j * NI + i] = 1; }
  const A = pts[0], B = pts[pts.length - 1], far = (u, v, d) => Math.hypot(u - A[0], v - A[1]) >= d && Math.hypot(u - B[0], v - B[1]) >= d, spurs = [], spurAt = new Set();
  if (P.spurs && W === 1) { const cand = [];   // DEAD ENDS: the tiles run straight on past a turn for one or two tiles, to a cube
    for (let m = 0; m < k; m++) { const mh = Math.min(2, m + 1 < k ? cols[m + 1] - cols[m] - 2 : 2, i1 - cols[m]), dj = Math.sign(rows[m + 1] - rows[m]), mv = Math.min(2, dj > 0 ? j1 - rows[m + 1] : rows[m + 1] - j0);
      if (mh >= 1) cand.push({ i: cols[m], j: rows[m], di: 1, dj: 0, max: mh, at: 1 + 2 * m }); if (mv >= 1) cand.push({ i: cols[m], j: rows[m + 1], di: 0, dj, max: mv, at: 2 + 2 * m }); }
    for (const c of mix(cand)) { if (spurs.length >= P.spurs) break; const L = Math.min(c.max, pick(P.spurLen)), u = LU(c.i + c.di * L), v = LV(c.j + c.dj * L); if (!far(u, v, 1.1)) continue;
      for (let q = 1; q <= L; q++) white[tJ(LV(c.j + c.dj * q)) * NI + tI(LU(c.i + c.di * q))] = 2; spurs.push({ u, v }); spurAt.add(c.at); } }
  const chk = checker(white, A, B), cubes = [], ext = ry => HC * (Math.abs(Math.cos(ry)) + Math.abs(Math.sin(ry))), tilt = () => rnd() < (P.tilt || 0) ? (rnd() - 0.5) * 1.2 : 0, gapOf = () => pick(P.gaps || [0.1]); let ci = Math.floor(rnd() * 4);
  const put = (u, v, ry, kind) => { const e = ext(ry); if (Math.abs(u) > HW - e - 0.06 || Math.abs(v) > HD - e - 0.06 || !far(u, v, 1.1) || cubes.some(c => Math.hypot(c.u - u, c.v - v) < 0.9)) return false;
    const c = { u, v, ry, kind, col: ci % 4 }; if (!chk.add(c)) return false; cubes.push(c); ci++; return true; };
  for (const s of spurs) if (!put(s.u, s.v, rnd() < 0.5 ? 0 : (rnd() - 0.5) * 0.5, 'spur')) put(s.u, s.v, 0, 'spur');   // the cube that closes each dead end
  { const tv = []; for (let s = 1; s < V.length - 1; s++) if (!spurAt.has(s)) tv.push(s); let need = P.corner || 0;   // cubes just outside the turns
    for (const s of mix(tv)) { if (!need) break; const s1 = segs[s - 1], s2 = segs[s], ry = tilt(), d = W * HC + ext(ry) + gapOf(); if (put(pts[s][0] + (s1.du - s2.du) * d, pts[s][1] + (s1.dv - s2.dv) * d, ry, 'corner')) need--; } }
  if (P.inLane) { const xs = []; for (const x of mix(lat.map((p, x) => x).filter(x => !lat[x].vert))) { if (xs.length >= P.inLane) break; if (xs.every(y => Math.abs(y - x) >= 3)) xs.push(x); }   // cubes IN a two-tile lane, on alternate halves
    let sd = rnd() < 0.5 ? 1 : -1; for (const x of xs.sort((a, b) => a - b)) { const p = lat[x], u = LU(p.i), v = LV(p.j), du = p.di * flip, dv = p.dj, ry = rnd() < (P.tilt || 0) ? (rnd() - 0.5) * 0.6 : 0;
      if (put(u - dv * sd * HC, v + du * sd * HC, ry, 'in')) sd = -sd; else put(u + dv * sd * HC, v - du * sd * HC, ry, 'in'); } }
  { let need = P.side || 0; const sc = []; for (const p of lat) if (!p.vert) sc.push([p, -1], [p, 1]);   // cubes beside the lane
    for (const [p, sd] of mix(sc)) { if (!need) break; const ry = tilt(), d = W * HC + ext(ry) + gapOf(), du = p.di * flip, dv = p.dj; if (put(LU(p.i) - dv * sd * d, LV(p.j) + du * sd * d, ry, 'side')) need--; } }
  const flats = []; for (const p of mix(lat.filter(p => !p.vert))) { if (flats.length >= (P.flats || 0)) break; const u = LU(p.i) + (W === 2 ? pick(offs) : 0), v = LV(p.j) + (W === 2 ? pick(offs) : 0), i = tI(u), j = tJ(v);   // a flat coloured tile in the path
    if (!far(u, v, 1.3) || flats.some(f => Math.abs(f.i - i) + Math.abs(f.j - j) < 3)) continue; flats.push({ i, j, col: Math.floor(rnd() * 4) }); }
  const along = d => { const s = segs.find(x => d <= x.at + x.l) || segs[segs.length - 1], q = Math.min(s.l, Math.max(0, d - s.at)); return { u: s.a[0] + s.du * q, v: s.a[1] + s.dv * q }; };
  return { setup: S.key, level: lv, n, W, glow: !!S.glow, pts, segs, len, turns: V.length - 2, tiles: white, flats, cubes, deadEnds: spurs.length, along, ok: chk.reach() };
}
export function setupMobilityCourse({ THREE, scene, at = { x: 0, z: 0 }, y = 0, face = 0, setup = 'weave', level = 1, route = 1, lux = 400, rule = { faults: 3, seconds: 180 }, onEvent = () => {} }) {
  const CH = 2.7, G0 = new THREE.Group(); G0.position.set(at.x, y, at.z);   /* (gallery chat, 13 Nov) y = the floor height */ G0.rotation.y = face; scene.add(G0); G0.updateMatrixWorld(true);
  const cs = Math.cos(face), sn = Math.sin(face), toLocal = (x, z) => { const dx = x - at.x, dz = z - at.z; return [dx * cs - dz * sn, dx * sn + dz * cs]; }, toWorld = (u, v) => [at.x + u * cs + v * sn, at.z - u * sn + v * cs];
  const matte = c => new THREE.MeshLambertMaterial({ color: c }), add = (m, x, y, z, p = G0) => { m.position.set(x, y, z); p.add(m); return m; };
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }, tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  // ---- the room (a stand-in size): one-sided, so a camera outside looks straight in · plain pale walls, as in the photos ----
  { const ce = add(new THREE.Mesh(new THREE.PlaneGeometry(10, 6), matte('#d6d4cf')), 0, CH, 0); ce.rotation.x = Math.PI / 2; const wallM = matte('#dedbd4');
    for (const [w, x, z, ry] of [[10, 0, -HD, 0], [10, 0, HD, Math.PI], [6, -HW, 0, Math.PI / 2], [6, HW, 0, -Math.PI / 2]]) add(new THREE.Mesh(new THREE.PlaneGeometry(w, CH), wallM), x, CH / 2, z).rotation.y = ry; }
  const panelM = new THREE.MeshBasicMaterial({ color: '#ffffff' }); for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), panelM), -4 + i * 2, CH - 0.01, -2 + j * 2).rotation.x = Math.PI / 2;   // an even ceiling light grid (a stand-in)
  const grey = matte('#8b8a86'), black = matte('#1e1d1c'); G0.updateMatrixWorld(true);
  const cams = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => { const g = new THREE.Group(); add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.26), black), 0, 0, 0, g); add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 10), grey), 0, 0, 0.17, g).rotation.x = Math.PI / 2; add(g, a * (HW - 0.3), CH - 0.25, b * (HD - 0.3)); g.lookAt(G0.localToWorld(new THREE.Vector3(0, 0.6, 0))); return g; });
  // ---- THE LOOK, from the fact sheet's photos: the dark floor + the white foam tiles are ONE canvas (redrawn per layout); a second, half-size canvas says where the floor glows (THE LIT PATH) ----
  const FS = 160, fc = canvas(10 * FS, 6 * FS), gc = canvas(5 * FS, 3 * FS), floorT = tex(fc), glowT = tex(gc); floorT.anisotropy = 16;   // sharp when the floor is seen edge-on (three.js caps it at what the device can do)
  const floorM = new THREE.MeshLambertMaterial({ map: floorT, emissiveMap: glowT, emissive: 0x000000 });
  add(new THREE.Mesh(new THREE.PlaneGeometry(10, 6), floorM), 0, 0, 0).rotation.x = -Math.PI / 2;
  function drawFloor(R) {
    const g = fc.getContext('2d'), g2 = gc.getContext('2d'), s = T * FS, p = s / 12, d = 0.035 * FS, rn = rng(4271), X = i => (tU(i) - HC + HW) * FS, Y = j => (tV(j) - HC + HD) * FS;
    const wt = (i, j) => i >= 0 && j >= 0 && i < NI && j < NJ && R.tiles[j * NI + i] > 0, col = new Map(R.flats.map(f => [f.j * NI + f.i, FOAM[f.col]]));
    g.fillStyle = '#161514'; g.fillRect(0, 0, fc.width, fc.height); for (let k = 0; k < 6000; k++) { g.fillStyle = k & 1 ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.3)'; g.fillRect(rn() * fc.width, rn() * fc.height, 2, 2); }   // a dark, low carpet
    g2.fillStyle = '#000'; g2.fillRect(0, 0, gc.width, gc.height); g2.fillStyle = '#fff';
    for (let j = 0; j < NJ; j++) for (let i = 0; i < NI; i++) { if (!wt(i, j)) continue; const x = X(i), y = Y(j); g.fillStyle = g2.fillStyle = col.get(j * NI + i) || '#f4f2ec'; g.fillRect(x, y, s, s); g2.fillRect(x / 2 + 1, y / 2 + 1, s / 2 - 2, s / 2 - 2);
      for (let q = 0; q < 6; q++) { const a = (2 * q + 0.5) * p;   // the jigsaw teeth along every outer edge of the path
        if (!wt(i, j - 1)) g.fillRect(x + a, y - d, p, d + 1); if (!wt(i, j + 1)) g.fillRect(x + a, y + s - 1, p, d + 1); if (!wt(i - 1, j)) g.fillRect(x - d, y + a, d + 1, p); if (!wt(i + 1, j)) g.fillRect(x + s - 1, y + a, d + 1, p); } }
    g.strokeStyle = 'rgba(40,38,36,.5)'; g.lineWidth = 1.6; g.lineJoin = 'miter';   // the seam between two tiles: the same teeth, locked together
    const seam = (x, y, ax, ay) => { g.beginPath(); for (let q = 0; q < 12; q++) { const w = q % 2 ? 2.4 : -2.4, x0 = x + ax * p * q - ay * w, y0 = y + ay * p * q + ax * w; if (q) g.lineTo(x0, y0); else g.moveTo(x0, y0); g.lineTo(x0 + ax * p, y0 + ay * p); } g.stroke(); };
    for (let j = 0; j < NJ; j++) for (let i = 0; i < NI; i++) if (wt(i, j)) { if (wt(i + 1, j)) seam(X(i) + s, Y(j), 0, 1); if (wt(i, j + 1)) seam(X(i), Y(j) + s, 1, 0); }
    floorT.needsUpdate = true; glowT.needsUpdate = true; }
  const foamTex = (col, seed) => { const c = canvas(256, 256), g = c.getContext('2d'), rn = rng(seed), n = 12, w = 256 / n; g.fillStyle = col; g.fillRect(0, 0, 256, 256);   // one face of a cube: a foam tile, its teeth locked into the next face
    for (let k = 0; k < 1800; k++) { g.fillStyle = k & 1 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.07)'; g.fillRect(rn() * 256, rn() * 256, 2, 2); }
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 3; g.lineJoin = 'miter';
    for (let e = 0; e < 4; e++) { g.save(); g.translate(128, 128); g.rotate(e * Math.PI / 2); g.translate(-128, -128); g.beginPath(); for (let q = 0; q < n; q++) { const y = q % 2 ? 22 : 8; if (q) g.lineTo(q * w, y); else g.moveTo(0, y); g.lineTo((q + 1) * w, y); } g.stroke(); g.restore(); }
    return tex(c); };
  const cubeM = FOAM.map((col, i) => new THREE.MeshLambertMaterial({ map: foamTex(col, 311 + i * 97) })), cubeGeo = new THREE.BoxGeometry(T, T, T);
  const padT = txt => { const c = canvas(256, 256), g = c.getContext('2d'); g.fillStyle = '#141312'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#f0ede6'; g.font = '800 ' + (txt.length > 3 ? 70 : 100) + 'px Archivo, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 128, 132); const t = tex(c); return new THREE.MeshLambertMaterial({ map: t, emissiveMap: t, emissive: 0x000000 }); };
  // THE TILES ARE SLABS: their tops are the floor canvas's own picture, lifted TT; their outer edges are plain foam. The path keeps a crisp edge however low the camera is.
  const edgeM = new THREE.MeshLambertMaterial({ vertexColors: true });
  function slabs(R) {
    const top = [], uv = [], nr = [], sp = [], sn = [], sc = [], c = new THREE.Color(), has = (i, j) => i >= 0 && j >= 0 && i < NI && j < NJ && R.tiles[j * NI + i] > 0, col = new Map(R.flats.map(f => [f.j * NI + f.i, FOAM[f.col]]));
    const P = (u, v) => { top.push(u, TT, v); uv.push((u + HW) / 10, (HD - v) / 6); nr.push(0, 1, 0); };
    const side = (ax, az, bx, bz) => { const nx = -(bz - az) / T, nz = (bx - ax) / T; for (const [x, y, z] of [[ax, 0, az], [bx, 0, bz], [bx, TT, bz], [ax, 0, az], [bx, TT, bz], [ax, TT, az]]) { sp.push(x, y, z); sn.push(nx, 0, nz); sc.push(c.r, c.g, c.b); } };   // A → B with the outside on the right
    for (let j = 0; j < NJ; j++) for (let i = 0; i < NI; i++) { if (!has(i, j)) continue; const u0 = tU(i) - HC, u1 = u0 + T, v0 = tV(j) - HC, v1 = v0 + T; c.set(col.get(j * NI + i) || '#e9e7e1');
      P(u0, v0); P(u0, v1); P(u1, v1); P(u0, v0); P(u1, v1); P(u1, v0);
      if (!has(i, j - 1)) side(u1, v0, u0, v0); if (!has(i, j + 1)) side(u0, v1, u1, v1); if (!has(i - 1, j)) side(u0, v0, u0, v1); if (!has(i + 1, j)) side(u1, v1, u1, v0); }
    const geo = o => { const g = new THREE.BufferGeometry(); for (const k in o) g.setAttribute(k, new THREE.Float32BufferAttribute(o[k], k === 'uv' ? 2 : 3)); return g; };
    RG.add(new THREE.Mesh(geo({ position: top, normal: nr, uv }), floorM)); RG.add(new THREE.Mesh(geo({ position: sp, normal: sn, color: sc }), edgeM)); }
  const padS = padT('START'), padE = padT('END'), CUR = { setup, level, route: ((route - 1) % ROUTES + ROUTES) % ROUTES + 1 };
  let RG = null, R = null, Tr = null, L = lux;
  const curve = () => 0.06 + 0.94 * Math.pow(Math.log10(L) / Math.log10(400), 1.3), brightness = () => R.glow ? 0.05 : curve();
  // off THE LIT PATH the tiles still give back a little more light than the matte floor: white foam reads as white
  const shade = () => { const g = R.glow ? 0.14 + 0.86 * curve() : 0.3 * curve(); panelM.color.setScalar(R.glow ? 0.03 : 0.25 + 0.75 * curve()); floorM.emissive.setScalar(g); padS.emissive.setScalar(g * 0.9); padE.emissive.setScalar(g * 0.9); };
  const restart = () => { for (const c of R.cubes) c.hit = false; Tr = { running: false, done: false, t: 0, bumps: 0, off: 0, out: false, rec: [], marks: [], recT: 0 }; };
  function build() {
    if (RG) { RG.traverse(o => { if (o.geometry && o.geometry !== cubeGeo) o.geometry.dispose(); }); G0.remove(RG); } RG = new THREE.Group(); G0.add(RG);
    R = planCourse(CUR.setup, CUR.level, CUR.route); CUR.setup = R.setup; CUR.level = R.level; drawFloor(R); slabs(R);
    for (const c of R.cubes) { c.cs = Math.cos(c.ry); c.sn = Math.sin(c.ry); add(new THREE.Mesh(cubeGeo, cubeM[c.col]), c.u, HC, c.v, RG).rotation.y = c.ry; }
    const ps = R.W === 1 ? 0.5 : 0.95, last = R.pts.length - 1;
    for (const [p, m, s] of [[R.pts[0], padS, R.segs[0]], [R.pts[last], padE, R.segs[last - 1]]]) { const q = add(new THREE.Mesh(new THREE.PlaneGeometry(ps, ps), m), p[0], TT + 0.004, p[1], RG); q.rotation.order = 'YXZ'; q.rotation.set(-Math.PI / 2, Math.atan2(s.du, s.dv), Math.PI); }   // each word reads upright to a walker going the path's way
    shade(); restart(); }
  build();
  const wt = (a, b) => a >= 0 && b >= 0 && a < NI && b < NJ && R.tiles[b * NI + a] > 0;
  const tileDist = (u, v) => { const i = tI(u), j = tJ(v); if (wt(i, j)) return 0; let best = 9; for (let b = j - 1; b <= j + 1; b++) for (let a = i - 1; a <= i + 1; a++) if (wt(a, b)) best = Math.min(best, Math.hypot(Math.max(Math.abs(u - tU(a)) - HC, 0), Math.max(Math.abs(v - tV(b)) - HC, 0))); return best; };
  const result = () => Tr.done ? { seconds: +Tr.t.toFixed(1), bumps: Tr.bumps, off: Tr.off, faults: Tr.bumps + Tr.off, pass: Tr.bumps + Tr.off <= rule.faults && Tr.t <= rule.seconds, setup: R.setup, level: R.level, route: R.n, lux: L, record: Tr.rec, marks: Tr.marks } : null;
  function step(dt, pos, ry = 0) {
    let [u, v] = toLocal(pos.x, pos.z);
    for (const c of R.cubes) { const dx = u - c.u, dz = v - c.v; let lx = dx * c.cs - dz * c.sn, lz = dx * c.sn + dz * c.cs; const ex = lx - Math.max(-HC, Math.min(HC, lx)), ez = lz - Math.max(-HC, Math.min(HC, lz)), d = Math.hypot(ex, ez);   // the walker (a 0.22 m circle) against a turned square
      if (d < WR) { if (d > 1e-5) { lx += ex / d * (WR - d); lz += ez / d * (WR - d); } else if (Math.abs(lx) > Math.abs(lz)) lx = (lx < 0 ? -1 : 1) * (HC + WR); else lz = (lz < 0 ? -1 : 1) * (HC + WR);
        u = c.u + lx * c.cs + lz * c.sn; v = c.v - lx * c.sn + lz * c.cs;
        if (!c.hit) { c.hit = true; if (Tr.running) { Tr.bumps++; const w = toWorld(u, v); Tr.marks.push({ t: Tr.t, x: w[0], z: w[1], kind: 'bump' }); onEvent({ type: 'bump', kind: c.kind }); } } }
      else if (c.hit && d > WR + 0.25) c.hit = false; }   // one fault per touch
    u = Math.max(-HW + 0.25, Math.min(HW - 0.25, u)); v = Math.max(-HD + 0.25, Math.min(HD - 0.25, v)); const w = toWorld(u, v); pos.x = w[0]; pos.z = w[1];
    const a = R.pts[0], b = R.pts[R.pts.length - 1];
    if (!Tr.running && !Tr.done && Math.hypot(u - a[0], v - a[1]) < 0.45) { Tr.running = true; Tr.t = 0; onEvent({ type: 'start' }); }
    if (Tr.running) { Tr.t += dt; Tr.recT -= dt; if (Tr.recT <= 0) { Tr.recT = 0.1; Tr.rec.push([+Tr.t.toFixed(2), +w[0].toFixed(2), +w[1].toFixed(2), +ry.toFixed(2)]); }
      const dd = tileDist(u, v); if (dd > 0.05 && !Tr.out) { Tr.out = true; Tr.off++; Tr.marks.push({ t: Tr.t, x: w[0], z: w[1], kind: 'off' }); onEvent({ type: 'off' }); } else if (dd === 0) Tr.out = false;
      if (Math.hypot(u - b[0], v - b[1]) < 0.45) { Tr.running = false; Tr.done = true; onEvent({ type: 'finish', result: result() }); } }
  }
  const W3 = (u, y, v) => { const w = toWorld(u, v); return new THREE.Vector3(w[0], y, w[1]); }, set = o => { if (o.setup) CUR.setup = o.setup; if (o.level) CUR.level = o.level; if (o.route) CUR.route = ((o.route - 1) % ROUTES + ROUTES) % ROUTES + 1; build(); };
  return { group: G0, step, result, brightness, restart, reset: build, set, setSetup: k => set({ setup: k }), setLevel: n => set({ level: n }), setRoute: n => set({ route: n }), setLux: l => { L = l; shade(); }, lux: () => L, route: () => R.n, setup: () => R.setup, level: () => R.level, rule, tileTop: TT, heightAt: (x, z) => { const [u, v] = toLocal(x, z); return tileDist(u, v) === 0 ? TT : 0; },
    get tiles() { if (!R.world) { R.world = []; for (let j = 0; j < NJ; j++) for (let i = 0; i < NI; i++) if (R.tiles[j * NI + i] > 0) R.world.push(W3(tU(i), TT, tV(j))); } return R.world; },
    state: () => ({ running: Tr.running, done: Tr.done, seconds: Tr.t, bumps: Tr.bumps, off: Tr.off }), info: () => ({ setup: R.setup, level: R.level, route: R.n, lane: R.W * T, len: R.len, turns: R.turns, cubes: R.cubes.length, deadEnds: R.deadEnds, glow: R.glow }),
    cams: cams.map(c => c.getWorldPosition(new THREE.Vector3())), center: W3(0, 0, 0), size: { w: 10, d: 6, h: CH },
    get startPos() { return W3(R.pts[0][0], 0, R.pts[0][1]); }, get endPos() { const p = R.pts[R.pts.length - 1]; return W3(p[0], 0, p[1]); },
    get points() { const mid = R.along(R.len / 2), by = k => R.cubes.find(c => c.kind === k), side = by('side') || by('corner'), on = by('spur') || by('in'), fl = R.flats[0]; let dk = 0; while (dk < NI * NJ - 1 && R.tiles[dk]) dk++;
      return [['START PAD', this.startPos, 'The timed walk begins here.'], ['END PAD', this.endPos, 'The walk ends here and the clock stops.'],
        ['THE PATH', W3(mid.u, 0.05, mid.v), R.glow ? 'In this layout the room is dark and the path itself is lit, two tiles wide. Stepping off it is a fault here.' : 'White foam tiles that lock together, ' + (R.W === 1 ? 'one tile' : 'two tiles') + ' wide, on a dark floor. Stepping off the tiles is a fault here.'],
        side ? ['A CUBE BESIDE THE PATH', W3(side.u, T, side.v), 'Cubes built from the same foam tiles, in red, yellow, green and blue. Touching one is a fault here. Their size, 0.6 m, is a stand-in.'] : ['THE ROOM', W3(0, 1.4, -HD + 0.05), 'Plain walls and a dark floor. The room size, 10 × 6 m, is a stand-in: the sources give none.'],
        on ? ['A CUBE ON THE TILES', W3(on.u, T, on.v), on.kind === 'spur' ? 'This cube closes a dead end. The way forward turns off before it.' : 'This cube stands in the path. Walk round it and stay on the tiles.'] : fl ? ['A FLAT COLOURED TILE', W3(tU(fl.i), 0.05, tV(fl.j)), 'One photo shows a coloured tile lying flat in the path. The sources do not say what it is for. Here you may walk on it.'] : ['THE DARK FLOOR', W3(tU(dk % NI), 0.05, tV(Math.floor(dk / NI))), 'Off the tiles the floor is dark. Stepping onto it is a fault here.'],
        ['CEILING LIGHT', W3(0, CH, 0), R.glow ? 'The ceiling lights are off in this layout. The seven steps set how brightly the path glows: a stand-in.' : 'Even light from above. The sources say the light levels are standardized and give no numbers. The seven steps here are a stand-in.'],
        ['CAMERA', cams[0].getWorldPosition(new THREE.Vector3()), 'Every walk is recorded. On the real course the film is scored by masked graders at an independent reading center.']]; },
    dispose: () => scene.remove(G0) };
}
