// MERU 2.0 — layout data (step 1 draft). Metres, town frame: x east, z south, origin = Fountain Plaza centre. Map ±450.
// Every rule in SOUND_LAYOUT_RULES.md is checked by checkLayout() and shown on Meru 2 Layout.dc.html.
// Speaker keys are the existing pinned cast keys (worlds/meru*.js). Positions marked draft:true wait for Ben's dialogue notes.
export const MAP = { half: 540, half0: 450, cluster: 495, bay: [-121, 371, 400, 941], range: [20, 330, -1290, -500], skate: [-283, -191, -178, -42] };   // s151: skate = TONY'S PARK in town, north of the Ruins Path (s104f had it west of the map) (SKATEW below)   // s104e: range = the TANK RANGE arm north of the Barracks (RANGE below)   // s103: bay = the Speedboat Bay arm's walkable rim past the south edge (BAY.r + BAY.walk)   // s39 (Ben): +10 % free space (was 450); s40 step 2: 540 so the train runs OUTSIDE every cluster (clusters still clamp to ±495)
import { diveFloorWorld, POND_WALL } from '../minigames/jidda/deep-floor.js';
export const SIDEWALK = 5;   // s727b (Ben: wider sidewalks, 3 m clear lane): 3.3 → 5 m each side of every road; nothing green or wooden stands on it. SETBACK + the Garden Bridge keep the old 3.3 (SIDEWALK0)
export const SIDEWALK0 = 3.3;

// zones: music + label areas. depth = the size along the main path through them (checked ≥ 30 m). busy = trim music for voices.
export const ZONES = [
  { key: 'meruTown', label: 'Fountain Plaza', r: [-45, 45, -40, 40], music: 'town', depth: 80 },
  { key: 'meruMarket', label: 'Market Plaza', r: [-150, -45, -40, 40], music: 'market', depth: 105, busy: true },
  { key: 'meruLanesCourt', label: 'Lanes Court', r: [45, 150, -40, 40], music: 'court', depth: 105 },
  { key: 'meruCivic', label: 'Civic Row', r: [-120, 120, -130, -40], music: 'civic', depth: 90 },
  { key: 'meruSouth', label: 'South Gardens', r: [-120, 120, 40, 140], music: 'gardens', depth: 100 },
  { key: 'meruCastlePath', label: 'Castle Path', r: [-30, 30, -330, -130], music: 'castlepath', depth: 200 },
  { key: 'meruOrchard', label: 'Russet Orchard', r: [-82, -12, -262, -196], music: 'castlepath', depth: 200 },   // s168 farm 1
  { key: 'meruCornFarm', label: 'Cobb Farm', r: [12, 54, -272, -204], music: 'castlepath', depth: 200 },   // s169 farm 2 (corn maze + carrots)
  { key: 'meruPasture', label: 'Woolly Acres', r: [-76, -12, -330, -268], music: 'castlepath', depth: 200 },   // s170 farm 3 (sheep + cows, open pasture)
  { key: 'meruBarracks', label: 'Barracks', r: [-100, 260, -450, -330], music: 'barracks', depth: 120 },
  { key: 'meruArenaPath', label: 'Arena Path', r: [150, 360, -30, 30], music: 'arenapath', depth: 210 },
  { key: 'meruArena', label: 'Meru Arena', r: [360, 450, -60, 60], music: 'arena', depth: 90 },
  { key: 'meruRuinsPath', label: 'Ruins Path', r: [-400, -240, -40, 40], music: 'ruinspath', depth: 160 },
  { key: 'meruRuins', label: 'The Ruins', r: [-450, -400, -80, 80], music: 'ruins', depth: 50 },
  { key: 'meruAviary', label: 'Bird Aviary', r: [190, 264, 84, 144], music: 'gardens', depth: 68 },
  { key: 'meruLakePath', label: 'Lake Path', r: [-30, 30, 140, 215], music: 'lakepath', depth: 75 },
  { key: 'meruLake', label: 'The Lake', r: [-350, 340, 215, 490], music: 'lake', depth: 235 },
  { key: 'pearlIsland', label: 'Pearl Island', c: [206, 356, 54], music: 'island', depth: 140 },
  { key: 'meruSpeedboatBay', label: 'Speedboat Bay', r: [-121, 371, 490, 941], music: 'lake', depth: 425 },
  { key: 'tonysPark', room: 'skatePark', label: "Tony's Park", r: [-283, -191, -178, -42], music: 'skate', depth: 90 },   // s151: the full Skate Park game park in town, north of the Ruins Path (SKATEW below); replaced the small yard
  { key: 'meruTankRange', label: 'Tank Range', r: [20, 330, -1290, -545], music: 'barracks', depth: 600 },   // s104e: the range arm north of the Barracks (RANGE below)   // s103: the bay arm south of Pearl Island (BAY below)
  // step 3 part 4: elevated areas (HILLS below)
  { key: 'meruFalls', label: 'Meru Falls', c: [-385, 320, 70], music: 'falls', depth: 70 },
  { key: 'meruRidge', label: 'Castle Ridge', r: [-300, -100, -450, -372], music: 'ridge', depth: 80 },
  { key: 'meruCastle', label: 'Meru Castle', r: [-286, -222, -449, -411], music: 'castle', depth: 60 },   // s38: the walled castle on the ridge top (worlds/meru2-castle.js)
  { key: 'meruRuinsHills', label: 'Ruins Hills', r: [-450, -290, -175, -85], music: 'ruinspath', depth: 90 },
  { key: 'meruRuinsHillsS', label: 'Ruins Hills', r: [-450, -290, 85, 170], music: 'ruinspath', depth: 85 },
  { key: 'meruHillPark', label: 'Hill Park', c: [240, -180, 62], music: 'park', depth: 60 },
  { key: 'meruFireStation', label: 'Fire Station', r: [-74, -30, 184, 236], music: 'lakepath', depth: 44 },   // s107: the station, its apron, hose tower + the fire dock path (worlds/meru2-fire.js)
];
// ground. Later entries win. Default outdoors = grass.
export const SURFACES = [
  { s: 'stone', r: [-45, 45, -40, 40] }, { s: 'grass', r: [-12, 12, -12, 12] },           // fountain lawn in the middle of the plaza
  { s: 'stone', r: [-150, -45, -15, 15] }, { s: 'stone', r: [45, 150, -15, 15] },          // plaza-to-plaza promenades; the rest of those plazas is grass + trees
  { s: 'stone', r: [-120, 120, -75, -45] },                                                // Civic Row pavement
  { s: 'stone', r: [-6, 6, -330, -130] }, { s: 'stone', r: [-60, 60, -400, -330] },        // castle road + parade ground
  { s: 'grit', r: [-100, 260, -450, -400] },                                               // barracks yard, tank range ground
  { s: 'stone', r: [160, 200, -20, 20] }, { s: 'stone', r: [240, 280, -20, 20] }, { s: 'stone', r: [320, 360, -20, 20] }, // arena path clearings (grass between)
  { s: 'grit', r: [200, 240, -5, 5] }, { s: 'grit', r: [280, 320, -5, 5] },
  { s: 'stone', r: [360, 386, -16, 16] }, { s: 'stone', c: [406, 0, 31.5] },   // the Arena forecourt + the colosseum footprint (worlds/meru2-arena.js)                     // step 4: gravel road between the arena clearings
  { s: 'stone', r: [360, 450, -60, 60] },
  { s: 'desert', c: [-441, 0, 104], k: (x, z) => desertK(x, z) > 0.5 },                     // s41 (Ben): DESERT 90 m round the Ruins Cave (noisy edge, see DESERT below)
  { s: 'grit', r: [-400, -240, -6, 6] }, { s: 'stone', r: [-450, -400, -80, 80] },         // ruins road climbs on grit to old stone
  { s: 'stone', r: [-283, -191, -178, -42] },                                                // skate concrete (stone surface)
  { s: 'sand', r: [-345, 335, 200, 240] }, { s: 'sand', c: [206, 356, 54] }, { s: 'grass', c: [206, 356, 36] }, // lake shore, island beach ring, island hills (s39: the island circles move with Pearl Island, end of file)
  { s: 'wood', r: [-2.5, 2.5, 214, 238] },                                                 // step 4: Lake Path boardwalk over the shore sand
];
export const WATER = [{ e: [-5, 362, 340, 122] }];                                         // the swimmable lake (ellipse cx, cz, rx, rz). s39: bigger, south + wider (was 0, 345, 320, 105)
export const ISLAND = { c: [206, 356, 48], hills: [206, 356, 34], pond: { x: 206, z: 356, r: 9, depth: 30 } };   // SHORE v2: smaller (was 70) so open water rings it
// SHORE v2 (Ben: "more water round Pearl Island, randomise every shore, polish the beaches"): noisy shorelines from a few fixed sines (same every load).
const sn = (t, S) => S.reduce((a, [k, ph, w]) => a + w * Math.sin(k * t + ph), 0), sm = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
const LAKE_N = [[2, 0.7, 0.32], [3, 2.1, 0.26], [4, 5.6, 0.18], [5, 4.0, 0.2], [7, 1.3, 0.14], [11, 5.2, 0.08], [17, 3.3, 0.04]], ISLE_N = [[2, 1.9, 0.3], [3, 0.4, 0.3], [5, 2.8, 0.22], [8, 4.4, 0.12], [13, 1.1, 0.06]];
// lake: radius multiplier by angle t (normalised ellipse coords, t = atan2(dz / rz, dx / rx)); the town (north) shore with the jetties + boathouses only wiggles ±3 m
export function lakeM(t) { const s = Math.sin(t), c = Math.cos(t), q = sm(0.15, 0.55, -s) * (1 - sm(0.62, 0.85, Math.abs(c))), A = (0.24 * (1 - q) + 0.03 * q) * (1 - 0.55 * sm(0.8, 0.97, -c)) * (1 - 0.8 * sm(0.5, 0.85, c)); return 1 + A * sn(t, LAKE_N); }   // s39: the east (LAKESIDE district) shore is calm too
export const ISLES = [];   // s39: dry islands inside the lake ({ a, b, core, r, h }, stadium shapes; the Garden District island is added at the end of the file)
const isleD = (x, z, I) => { const dx = I.b[0] - I.a[0], dz = I.b[1] - I.a[1], L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - I.a[0]) * dx + (z - I.a[1]) * dz) / L2)); return Math.hypot(x - I.a[0] - dx * u, z - I.a[1] - dz * u); };
export const onIsle = (x, z, m = 0) => ISLES.some(I => isleD(x, z, I) < I.core + m);
export function mainLakeF(x, z) { const [cx, cz, rx, rz] = WATER[0].e, dx = (x - cx) / rx, dz = (z - cz) / rz; return Math.hypot(dx, dz) / lakeM(Math.atan2(dz, dx)); }   // the old ellipse lake only
// s103: the SPEEDBOAT BAY ARM (Ben s102: grow the lake for the FULL course, 440 x 460 m). A rounded-rect bay dug south of Pearl Island; its north
// side opens into the lake (x -85..240), so the free speedboat drives straight in. r = water [x0, x1, z0, z1], rc = corner radius, beach = sand band,
// walk = how far past the waterline you can walk (then low wild hills, scenery only). course = where the Speedboat Bay course frame sits (course + origin).
// s104e: the TANK RANGE ARM (Ben s102 option B: the Meru spot matches the game's own course). The full v2 course (fence 272 x 710 m) dug NORTH of the map
// behind the Barracks, turned round (yaw PI: the course's +z runs north = world -z). world = origin + R(yaw) * course. Course start (0, -103) → world (175, -560),
// just past the train's north leg (z -515); the Meru Tank Range hangar (f 150..200 × -440..-405) starts it. Ground + props come from the course itself.
export const RANGE = { key: 'meruTankRange', label: 'Tank Range', r: [25, 325, -1290, -540], course: { origin: [175, -663], yaw: Math.PI } };
// s151 (Ben s150 end): TONY'S PARK MOVED INTO TOWN (replaces the small skate yard). Course park 88 x 132 m north of the Ruins Path, turned VERTICAL
// (yaw PI: course +z runs north = world -z). world = origin + R(yaw) * course → walls x -281..-193, z -44 (south) .. -176 (north); course start (0, -52) = world (-237, -54).
// ENTERED FROM THE SOUTH: a gap in the south wall (open, x -245..-229) + a paved walk off the Ruins Path; no door. gate = SKATE SCHOOL + CONTEST spot, free = FREE SKATE spot (both by the gap).
// park = the walls (Meru colliders), Tony (the coach, talkable) stands where the game's Tony stands; the course is prebuilt with the map, so the game starts in place.
export const SKATEW = { key: 'skatePark', label: "Tony's Park", course: { origin: [-237, -106], yaw: Math.PI }, gate: [-231, -40], free: [-243, -40], park: [-281, -193, -176, -44], open: [-245, -229] };
export const BAY = { key: 'meruSpeedboatBay', label: 'Speedboat Bay', r: [-95, 345, 455, 915], rc: 60, beach: 22, walk: 26, course: { origin: [125, 515], yaw: 0 } };
export function baySDr(x, z, ext = 0) { const [x0, x1, z0r, z1] = BAY.r, z0 = z0r - ext, rc = BAY.rc, qx = Math.abs(x - (x0 + x1) / 2) - ((x1 - x0) / 2 - rc), qz = Math.abs(z - (z0 + z1) / 2) - ((z1 - z0) / 2 - rc); return Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - rc; }
export const bayNoise = (x, z) => sm(BAY.r[2] + BAY.rc, BAY.r[2] + BAY.rc + 60, z) * (4 * Math.sin(x * 0.031 + 1) + 3 * Math.sin(z * 0.043 + 2) + 2 * Math.sin((x + z) * 0.07));   // calm on the open north side
export const baySD = (x, z) => baySDr(x, z) - bayNoise(x, z);   // signed metres to the bay shore (- = in the bay water)
// a point on the bay shore, u 0..1 round the perimeter: [x, z, nx, nz] (n = unit normal into the water)
export function bayEdge(u) { const [x0, x1, z0, z1] = BAY.r, rc = BAY.rc, w = x1 - x0 - 2 * rc, h = z1 - z0 - 2 * rc, q = Math.PI / 2 * rc, P = 2 * (w + h) + 4 * q; let s = ((u % 1) + 1) % 1 * P, x, z, nx, nz;
  const seg = [[w, (t) => [x0 + rc + t, z0, 0, 1]], [q, (t) => { const a = -Math.PI / 2 + t / rc; return [x1 - rc + Math.cos(a) * rc, z0 + rc + Math.sin(a) * rc, -Math.cos(a), -Math.sin(a)]; }], [h, (t) => [x1, z0 + rc + t, -1, 0]], [q, (t) => { const a = t / rc; return [x1 - rc + Math.cos(a) * rc, z1 - rc + Math.sin(a) * rc, -Math.cos(a), -Math.sin(a)]; }],
    [w, (t) => [x1 - rc - t, z1, 0, -1]], [q, (t) => { const a = Math.PI / 2 + t / rc; return [x0 + rc + Math.cos(a) * rc, z1 - rc + Math.sin(a) * rc, -Math.cos(a), -Math.sin(a)]; }], [h, (t) => [x0, z1 - rc - t, 1, 0]], [q, (t) => { const a = Math.PI + t / rc; return [x0 + rc + Math.cos(a) * rc, z0 + rc + Math.sin(a) * rc, -Math.cos(a), -Math.sin(a)]; }]];
  for (const [len, f] of seg) { if (s <= len) { [x, z, nx, nz] = f(s); break; } s -= len; } if (x == null) [x, z, nx, nz] = seg[0][1](0);
  const n = bayNoise(x, z); return [x - nx * n, z - nz * n, nx, nz]; }
export function lakeF(x, z) { const f = Math.min(mainLakeF(x, z), 1 + baySD(x, z) / 220); return f < 1.2 && ISLES.length && onIsle(x, z) ? 1.2 : f; }   // < 1 = in the lake or the bay (an island's flat top counts as dry land)
export const inLake = (x, z) => lakeF(x, z) < 1;
export const lakeShoreD = (x, z) => Math.max((1 - mainLakeF(x, z)) * Math.min(WATER[0].e[2], WATER[0].e[3]), -baySD(x, z));   // ≈ metres to the shore (+ in the water)
// s103: the map is ±MAP.half square PLUS the bay's walkable rim (MAP.bay); outOfMap(x, z, m) = true past both, m metres in from the edge
export function outOfMap(x, z, m = 0) { const H = MAP.half - m; if (Math.abs(x) <= H && Math.abs(z) <= H) return false; const g = MAP.range; if (g && x > g[0] + m && x < g[1] - m && z > g[2] + m && z < g[3] - m) return false; const k = MAP.skate; if (k && x > k[0] + m && x < k[1] - m && z > k[2] + m && z < k[3] - m) return false; const b = MAP.bay; return !(b && x > b[0] + m && x < b[1] - m && z > b[2] + m && z < b[3] - m); }
export function lakeEdge(t) { const [cx, cz, rx, rz] = WATER[0].e, m = lakeM(t); return [cx + Math.cos(t) * rx * m, cz + Math.sin(t) * rz * m]; }
// island: beyond r 30 from the pond the profile is stretched by islandM(t) (0.75..1.25); calm on the east (jetty) side
export function islandM(t) { const e = 1 - sm(0.2, 0.5, Math.abs(Math.atan2(Math.sin(t), Math.cos(t)))); return 1 + (ISLAND.kx ? 0.12 : 0.26) * (1 - e) * sn(t, ISLE_N); }
// s184 PEARL VALLEY: ISLAND.kx / kz = a wider, rounder-square island (|x/kx|^3 + |z/kz|^3) so the dive crater's corners sit inside the rim
export function islandR(x, z) { const dx = x - ISLAND.pond.x, dz = z - ISLAND.pond.z; let r; if (ISLAND.kx) { const ax = Math.abs(dx) / ISLAND.kx, az = Math.abs(dz) / ISLAND.kz; r = Math.cbrt(ax * ax * ax + az * az * az); } else r = Math.hypot(dx, dz) / (ISLAND.k || 1); return r <= 30 ? r : 30 + (r - 30) / islandM(Math.atan2(dz, dx)); }   // s39: radii are in ISLAND units
export function islandPt(t, rEff) { const r = rEff <= 30 ? rEff : 30 + (rEff - 30) * islandM(t); let m; if (ISLAND.kx) { const c = Math.abs(Math.cos(t)) / ISLAND.kx, s = Math.abs(Math.sin(t)) / ISLAND.kz; m = r / Math.cbrt(c * c * c + s * s * s); } else m = r * (ISLAND.k || 1); return [ISLAND.pond.x + Math.cos(t) * m, ISLAND.pond.z + Math.sin(t) * m]; }
// THE CRATER (ISLAND.crater, set below): a rounded rect in world metres (c, A along x, B along z, rc). craterE / craterW = world <-> dive-engine
// coords (engine +z = deeper = world -x, engine x = world z, scale S, engine z ez0 at the centre). Engine y 0 = the lake surface at world Hs.
export function craterSD(x, z) { const C = ISLAND.crater; if (!C) return 1e9; const qx = Math.abs(x - C.c[0]) - (C.A - C.rc), qz = Math.abs(z - C.c[1]) - (C.B - C.rc); return Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - C.rc; }
export const craterE = (x, z) => { const C = ISLAND.crater; return [(z - C.c[1]) / C.S, C.ez0 - (x - C.c[0]) / C.S]; };
export const craterW = (xe, ze) => { const C = ISLAND.crater; return [C.c[0] - C.S * (ze - C.ez0), C.c[1] + C.S * xe]; };
export const craterFloorW = (x, z) => { const C = ISLAND.crater, [xe, ze] = craterE(x, z); return C.Hs + C.S * diveFloorWorld(xe, ze); };
// walk ground inside the crater: the dry beach (engine floor above the surface) or the lake (swim at Hs); null outside
export function islandWalk(x, z) { const C = ISLAND.crater; if (!C || craterSD(x, z) >= 0) return null; const f = craterFloorW(x, z); return f > C.Hs + 0.05 ? { h: f, water: false } : { h: C.Hs, water: true, deep: true }; }
// island lathe profile [radius from the pond centre, height]; step 3 part 4 made the hills taller (peak 19 m)
ISLAND.prof = [[0, -22], [ISLAND.pond.r * 0.9, -22], [ISLAND.pond.r, 0.6], [ISLAND.pond.r + 3, 3.5], [16, 10], [23, 17], [29, 14], [34, 5], [38, 1.6], [42, 0.9], [45.5, 0.45], [ISLAND.c[2], 0.12], [ISLAND.c[2] + 2, -0.35], [ISLAND.c[2] + 6, -2]];
export const islandAt = (x, z) => { const h = islandH(islandR(x, z)), C = ISLAND.crater; if (!C) return h; const d = craterSD(x, z); if (d < 0) return -40; const top = 1 - sm(33.5, 35.5, islandR(x, z)); return h + top * (0.7 * Math.sin(x * 0.07) * Math.sin(z * 0.09) + 0.6) * Math.min(1, d / 6) + (x < C.c[0] + C.A - 3 ? 0.5 * Math.max(0, 1 - d / 3) : 0); };   // s184: the crater is a hole (the dive engine's seabed fills it); a low lip round the rim (none on the beach end), gentle swells on the top
export function islandH(r) { const p = ISLAND.prof; for (let i = 1; i < p.length; i++) if (r <= p[i][0]) { const [r0, y0] = p[i - 1], [r1, y1] = p[i]; return y0 + (y1 - y0) * (r - r0) / Math.max(1e-3, r1 - r0); } return -2; }

// ---------- step 3 part 4: elevated areas + lighthouses (built by worlds/meru2-heights.js) ----------
// mound: c centre, ridge: a → b axis. r = foot radius, core = flat top radius, h = height. cliff = sheer drop east of x over w m.
export const HILLS = [
  { key: 'falls', label: 'Falls hill', c: [-385, 320], r: 70, core: 26, h: 22, cliff: { x: -347, w: 3 }, falls: { z: 320 }, note: 'old Meru Falls: stream off the lake-side cliff, overlook deck beside it' },
  { key: 'ridge', label: 'Castle Ridge', a: [-290, -430], b: [-130, -430], r: 55, core: 18, h: 26, lookout: [-205, -432], note: 's38: core 10 -> 18 = a flat crest z -448..-412 for MERU CASTLE' },
  { key: 'ruinsN', label: 'Ruins Hills north', a: [-405, -130], b: [-330, -115], r: 45, core: 8, h: 16, wild: true },
  { key: 'ruinsS', label: 'Ruins Hills south', a: [-405, 125], b: [-330, 110], r: 45, core: 8, h: 13, wild: true },
  { key: 'park', label: 'Hill Park', c: [240, -180], r: 62, core: 18, h: 18, plaza: 14, note: 'skyline view west over the city' },
];
// lantern-lined trails up (path readability rule); ruins hills have none on purpose (wild, creatures up there)
export const TRAILS = [
  { key: 'fallsTrail', p: [[-318, 266], [-360, 262], [-395, 270], [-406, 292], [-392, 305], [-356, 306]] },
  { key: 'ridgeTrail', road: true, w: 7, p: [[-62, -372], [-110, -385], [-150, -400], [-180, -418], [-205, -423], [-218, -426], [-224, -429.5]] },   // s38 (Ben): the Castle Road, a 5 m stone road + lanterns both sides, lookout to the castle gate
  { key: 'parkTrail', p: [[172, -44], [190, -85], [205, -120], [222, -150], [232, -166]] },
];
// climbable lighthouses: spiral stair round the outside to the lamp gallery. a0 = the stair foot's direction from the centre.
export const LIGHTHOUSES = [
  { key: 'lhFerry', label: 'Ferry Lighthouse', at: [155, 293], base: 1.2, a0: -Math.PI / 2, pier: { r: [153, 157, 224, 288], y: 0.9 }, note: 'end of the Pearl Ferry Dock pier' },
  { key: 'lhPearl', label: 'Pearl Lighthouse', at: islandPt(0.686, 41), a0: Math.atan2(-42, -50), island: true, note: 'Pearl Island south-east beach' },
];

// buildings: footprint, door (world point on the wall) + face, room table (centre, w, d, floor, kind), reverb wish.
export const BUILDINGS = [
  { key: 'tavern', label: 'Tavern', f: [12, 52, -100, -60], door: [32, -60], face: 'S', solid: ['E'], room: { w: 24, d: 20, floor: 'wood' }, note: 'moved east of the Castle Path in step 2 so the path runs straight north' },
  { key: 'casino', label: 'Casino', f: [-150, -105, -32, 32], door: [-105, 0], face: 'E', room: { w: 30, d: 24, floor: 'rug' }, busy: true },
  { key: 'bowling', label: 'Meru Lanes', f: [105, 150, -38, 10], door: [105, -14], face: 'W', room: { w: 28, d: 30, floor: 'wood' } },
  { key: 'itemshop', label: 'Item Shop', f: [-56, -11, 60, 108], door: [-28, 60], face: 'N', room: { w: 43, d: 46, floor: 'stone' }, note: 'Ben (s33): the size of the Bank turned 90°, 45 x 48 (4 m clear of the Crestview door) (was -38..-18 x 60..76): Kia at the front + the MERU MARKET grocery behind (worlds/meru2-grocery.js)' },
  { key: 'armory', label: 'Armory', f: [18, 38, 60, 76], door: [28, 60], face: 'N', room: { w: 12, d: 10, floor: 'wood' } },
  { key: 'fortune', label: 'Fortune Teller', f: [-86, -74, -72, -48], door: [-80, -48], face: 'S', room: { w: 10, d: 22, floor: 'rug' }, note: 's121 (Ben): twice the size: front parlour z -60..-48 + back reading room z -72..-60 (worlds/meru2-fortune-jobs.js)' },
  { key: 'burgers', hiring: { game: 'meruBurgers', url: 'Meru Burgers.dc.html?embed=1' }, label: 'Burgers', f: [70, 114, 32, 64], door: [70, 48], face: 'W', room: { w: 40, d: 28, floor: 'wood' }, note: 'Ben (s33): twice the size (was 70..92 x 40..56); diner by the door, new dining hall behind, back of house at the east end' },
  { key: 'police', label: 'Police', f: [-110, -62, -125, -80], door: [-86, -80], face: 'S', room: { w: 12, d: 12, floor: 'stone' }, rooms: [{ key: 'jail', w: 20, d: 20, floor: 'stone', at: [-86, -110] }] },
  { key: 'bank', label: 'Bank', f: [62, 110, -125, -80], door: [86, -80], face: 'S', room: { w: 22, d: 20, floor: 'stone' }, reverb: 'marble hall, a little tail' },
  { key: 'carRental', label: 'Car Rental', f: [118, 132, 26, 38], door: [125, 26], face: 'N', room: { w: 10, d: 8, floor: 'wood' }, lot: { r: [134, 156, 22, 44], bays: 6, note: 'rental lot: the rented car waits here and is returned here' } },
  { key: 'carRental2', label: 'Car Rental', f: [-86, -72, -128, -116], door: [-79, -128], face: 'N', room: { w: 10, d: 8, floor: 'wood' }, lot: { r: [-108, -90, -130, -112], bays: 5, note: 'second rental lot (Ben, s34): between Crestview and the Tavern, by the ring road' }, note: 'Ben (s34): a second Car Rental between Crestview Tower and the Tavern, facing north onto the ring road; same desk + car as the first' },
  { key: 'crest', label: 'Crestview House', f: [-96, -60, 70, 110], door: [-60, 90], face: 'E', room: { w: 24, d: 24, floor: 'wood' } },
  { key: 'lake', label: 'Lakeside Tower', f: [100, 140, 100, 140], door: [100, 120], face: 'W', room: { w: 24, d: 24, floor: 'wood' }, note: 'step 2b: moved inside the ring road (South Gardens) so the train strip z 160-180 is clear' },
  { key: 'stationTown', label: 'Town Square Station', f: [-20, 20, 112, 132], door: [0, 112], face: 'N', door2: [0, 132], face2: 'S', room: { w: 40, d: 20, floor: 'stone' }, reverb: 'station hall', note: 'through-hall: the Lake Path walks in the north door and out the south door' },
  { key: 'barracks', own: true, label: 'Barracks', f: [-40, 40, -440, -400], door: [0, -400], face: 'S', room: { w: 30, d: 24, floor: 'stone' }, reverb: 'drill hall' },
  { key: 'tankWorks', hiring: { game: 'treadTankWorks', url: 'minigames/34-treads-tank-works/project/Main.dc.html?embed=1' }, label: "Tread's Tank Works", f: [70, 120, -430, -390], door: [70, -410], face: 'W', room: { w: 26, d: 22, floor: 'stone' } },
  { key: 'tankRange', hiring: { game: 'meruTankRange', url: 'Tank Range.dc.html?embed=1' }, label: 'Tank Range hangar', f: [150, 200, -440, -405], door: [175, -405], face: 'S', room: { w: 24, d: 20, floor: 'stone' } },
  { key: 'defense', label: 'Planet Defense Base', f: [225, 255, -445, -415], door: [225, -430], face: 'W', room: { w: 22, d: 14, floor: 'stone' }, note: 'bunker rebuilt 22 x 14 for the 12 m rule; on a 16 m plateau; road gate opens after the Tank Range' },
  { key: 'castle', own: true, open: true, fixed: true, noFrame: true, y: 26, label: 'Meru Castle', f: [-284, -224, -447, -413], door: [-224, -430], face: 'E', room: { w: 20, d: 40, floor: 'stone' }, reverb: 'throne hall', note: 's38: walled castle on Castle Ridge (worlds/meru2-castle.js). Gate E onto the Castle Road; the KEEP door (quick fade) opens the Throne Room + Library, Council Room, Treasury. Not movable.' },
  { key: 'pearlSail', hiring: { game: 'pearlSailTower', url: 'Pearl Sail Tower.dc.html?embed=1', play: true }, label: 'Pearl Sail', f: [381, 385, 222.6, 223.4], door: [383, 222.6], face: 'N', room: null, open: true, note: 's35: battle map door on the sail belly (Pearl Quarter); opens the side-on tower climb' },
  { key: 'museum', label: 'Ruins Museum', f: [-415, -365, -70, -45], door: [-380, -45], face: 'S', room: { w: 48, d: 23, floor: 'stone' }, reverb: 'old stone hall', note: 's123 (Ben): twice the size: the hall x -395..-365 + the DIG ROOM x -415..-395 (worlds/meru2-ruins-jobs.js)' },
  { key: 'permit', label: 'Permit Office', f: [-262, -248, -38, -26], door: [-255, -26], face: 'S', room: { w: 12, d: 10, floor: 'wood' } },
  { key: 'cave', label: 'Ruins Cave', f: [-450, -432, -12, 12], door: [-432, 0], face: 'E', room: { w: 34, d: 80, floor: 'grit' }, reverb: 'cave, long tail', note: 'cave mouth in a rock face with broken columns and arches around it' },
  { key: 'blindSchool', hiring: { game: 'meruBlindSchool', url: 'minigames/02-meru-school-for-the-blind/project/Main.dc.html?embed=1', note: 'repo copy (self-contained, own HUD); Hope teaches the class inside the lakeside school' }, label: 'School for the Blind', f: [-250, -190, 170, 205], door: [-220, 205], face: 'S', room: { w: 40, d: 30, floor: 'wood' } },
  { key: 'boatworks', hiring: { game: 'jonBoatworks', url: 'Jon Boatworks.dc.html?embed=1' }, label: "Jon's Boatworks", f: [-130, -95, 205, 230], door: [-112, 205], face: 'N', room: { w: 24, d: 20, floor: 'wood' } },
  { key: 'boathouse', hiring: { game: 'meruSpeedboatBay', url: 'Speedboat Bay.dc.html?embed=1' }, label: 'Speedboat Bay boathouse', f: [60, 90, 205, 228], door: [75, 205], face: 'N', room: { w: 22, d: 20, floor: 'wood' } },
  { key: 'aviary', label: 'Bird Aviary', f: [196, 264, 84, 144], door: [196, 114], face: 'W', room: null, open: true, own: true, noFrame: true, note: 's41e (Ben): walk-in flight house by the lake (worlds/meru2-aviary.js); was his workshop building 10' },
  { key: 'tonysPark', label: "Tony's Park", f: [-281, -193, -176, -44], door: [-237, -44], face: 'S', room: null, open: true, own: true, noFrame: true, fixed: true, note: 's151: the walled skate course (SKATEW, built by skate-park.js), walk-in gap in the south wall; shown on the Town Layout Workshop, not draggable' },
  { key: 'ferryDock', label: 'Pearl Ferry Dock', f: [140, 170, 205, 225], door: [155, 205], face: 'N', room: null },
  // s40 (big map step 2): one station per cluster + Castle; 30 x 20, long side along the track, track-side wall 16 m from the track centre (back door onto the lift), front door on the far wall
  { key: 'stationLakeside', label: 'Lakeside Station', noSky: true, f: [380, 410, 296, 316], door: [395, 316], face: 'S', room: { w: 30, d: 20, floor: 'stone' } },
  { key: 'stationArena', label: 'Arena Station', f: [479, 499, -15, 15], door: [479, 0], face: 'W', room: { w: 30, d: 20, floor: 'stone' }, note: 's40: on the east leg (x 515), outside the arena' },
  { key: 'stationSpire', label: 'Spire Station', f: [479, 499, -336, -306], door: [479, -321], face: 'W', room: { w: 30, d: 20, floor: 'stone' }, note: 's40: north end of the Spire cluster' },
  { key: 'stationCastleRd', label: 'Castle Station', f: [-60, -30, -499, -479], door: [-45, -479], face: 'S', room: { w: 30, d: 20, floor: 'stone' }, note: 's40: north leg; walk south past the Barracks to the Castle Road foot' },
  { key: 'stationDeco', label: 'Deco Station', f: [-499, -479, -172, -142], door: [-479, -157], face: 'E', room: { w: 30, d: 20, floor: 'stone' }, note: 's40: south end of the Deco cluster' },
  { key: 'stationRuins', label: 'Ruins Station', f: [-499, -479, 40, 70], door: [-479, 55], face: 'E', room: { w: 30, d: 20, floor: 'stone' }, note: 's40: west leg, behind the Ruins Cave (was Skate / Ruins Station at x -215)' },
  { key: 'stationGarden', label: 'Garden Island Station', f: [-190, -160, 346, 366], door: [-175, 366], face: 'S', room: { w: 30, d: 20, floor: 'stone' }, note: 's40: north edge of the Garden island, east of the (-200, 382) tower' },
];
// s41f (Ben): building NAMES typed in the Town Layout Workshop ('meru2.townLayout' .names = { key: label }) win over the labels here
(() => { try { const s = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem('meru2.townLayout')) || 'null'); const N = (s && s.names) || {}; for (const b of BUILDINGS) if (N[b.key] && N[b.key].trim()) b.label = N[b.key].trim(); } catch (e) {} })();
// s41e: the BIRD AVIARY (BUILDINGS 'aviary'): wall 9 m, vault rise 8 m, west gate z range, vestibule depth, pond [x, z, r], loop path radii
export const AVIARY = { wall: 9, rise: 8, gate: [110, 118], vest: 6, pond: [232, 112, 6], loop: [20, 16] };
export const PROMOTED = ['extramv4iwyil'];   // workshop extras that became real buildings (skipped in the game + the workshop)
// ---------- s42 (Ben): TOWN 2 = his 27 workshop squares made into real buildings (pass 1: names, natural sizes, placement, doors) ----------
// Sized + placed by Claude (Ben gave full creative lead): each faces its street (3 m clear of the sidewalk); corner buildings get a SECOND
// ENTRANCE (door2) on the other street / path. kind = what it is (exteriors = pass 2, interiors + a minigame each later). key = Ben's
// workshop key (PROMOTED, so the old square is skipped). sty = worlds/meru2-city.js style. lot / canopy / course / green = outdoor extras for pass 2.
export const TOWN2 = [
  // north row, on the ring road (z -140), facing S
  { key: 'extramv4ird5f', label: 'Barber Shop', kind: 'barber', f: [-54, -40, -168, -152], door: [-47, -152], face: 'S', ownFront: true, sty: { s: 'brick', base: '#8a4a3a', h: 9, awn: '#ec3013' } },
  { key: 'extramv4inbym', label: 'Tailor Shop', kind: 'tailor', f: [-34, -16, -170, -152], door: [-25, -152], face: 'S', door2: [-16, -161], face2: 'E', ownFront: true, sty: { s: 'stone', base: '#b7a58a', h: 10, awn: '#2e4a6b' }, note: 'side door on the Castle Path' },
  { key: 'extramv4iruy4', label: "Foxes' Chocolates", kind: 'chocolate', f: [10, 30, -168, -152], door: [20, -152], face: 'S', door2: [10, -160], face2: 'W', ownFront: true, sty: { s: 'brick', base: '#6b3f2a', h: 9, awn: '#f2c4a8' }, note: 'side door on the Castle Path' },
  { key: 'extramv4is68x', label: 'Fox Feet Shoes', kind: 'shoes', f: [33, 47, -166, -152], door: [40, -152], face: 'S', door2: [47, -159], face2: 'E', ownFront: true, sty: { s: 'glass', base: '#2e4a6b', gl: ['#b9d4e6', '#3b5d78'], h: 6.5, finC: '#201e1d' }, note: 'corner: side door on the Barracks Road' },
  { key: 'extramv4l8oxs', label: 'Meru Hospital', kind: 'hospital', f: [72, 106, -180, -152], door: [89, -152], face: 'S', door2: [72, -170], face2: 'W', ownFront: true, keepProps: true, sty: { s: 'panel', base: '#e8e4dc', h: 14, bar: true }, note: 'ambulance bay on the Barracks Road' },
  { key: 'extramv4lbt6h', label: 'Meru Motel', kind: 'motel', f: [112, 146, -188, -172], door: [129, -172], face: 'S', door2: [146, -180], face2: 'E', lot: { r: [112, 146, -169, -152], bays: 10 }, ownFront: true, sty: { s: 'panel', base: '#c9b48a', h: 7, awn: '#ec3013' }, note: 'parking lot in front, side door on the ring road' },
  // west, on the ring road (x -160), facing E
  { key: 'extramv4it4hx', label: 'Pie Shop', kind: 'pie', f: [-188, -172, -130, -114], door: [-172, -122], face: 'E', ownFront: true, sty: { s: 'brick', base: '#b0623f', h: 6, roof: 'none', awn: '#ffd23a' } },
  { key: 'extramv4itjlg', label: 'Minimart', kind: 'minimart', f: [-188, -172, -104, -80],   /* s727h: west wall -190 → -188 (in line with the Pie Shop): 4.3 m walk to Tony's Park fence, was 2.3 */ door: [-172, -92], face: 'E', ownFront: true, sty: { s: 'panel', base: '#3f7a52', h: 7, awn: '#ec3013' } },
  // the skate road (z 50, now runs on to x -232): a row on its south side, facing N across to the Skate Park
  { key: 'extramv4iuriu', label: 'Kind Chiropractor', kind: 'chiro', f: [-188, -172, 61, 77], door: [-180, 61], face: 'N', door2: [-172, 69], face2: 'E', ownFront: true, sty: { s: 'panel', base: '#ecebe6', h: 7, awn: '#3f9a5e' }, note: 'corner: side door on the ring road' },
  { key: 'extramv4itw99', label: 'Skate Shop', kind: 'skate', f: [-208, -192, 61, 77], door: [-200, 61], face: 'N', ownFront: true, sty: { s: 'panel', base: '#201e1d', h: 7, awn: '#ffd23a' } },
  { key: 'extramv4iv2va', label: "Big Tall's Rock Wall", kind: 'climb', f: [-238, -214, 61, 85], door: [-226, 61], face: 'N', ownFront: true, sty: { s: 'panel', base: '#7a8a96', h: 18 }, note: 'climbing gym, at the end of the skate road' },
  // s727 (Ben: sidewalk too tight for the player + props): the whole hardware complex (store, garden centre, lumber yard) moved 2.5 m north (z -2.5): 6.5 m from the road like its row
  // s167 (Ben): MERU HARDWARE moved to the main ring road (old Chocolates + Shoes spot; they moved west on the same row); lumber yard behind on the west (x 14..24), garden centre behind on the east. Was: s161 (Ben): MERU HARDWARE on the free ground where the small skate yard stood (north side of the skate road, across from the Skate Shop); interior + 7 departments in worlds/meru2-hardware.js
  { key: 'hardware', label: 'Meru Hardware', kind: 'hardware', f: [12, 48, -178.5, -152.5], door: [30, -152.5], face: 'S', doorsX: [[[45.4, -178.5], 'N'], [[22.7, -178.5], 'N']], ownFront: true, sty: { s: 'brick', base: '#b5482e', h: 8, awn: '#ffd23a' },   /* s163: GARDEN door (E) + LUMBER YARD side gate (W) */ note: 'the repair crew = the department heads (worlds/meru2-outlet-crew.js)' },
  // s168 (Ben): the 3 CASTLE PATH FARMS. 1 = RUSSET ORCHARD (apples): selfBuilt = no city shell; the red barn, orchard, fence, hay, scarecrows, windmill + Rusty are worlds/meru2-farm-apple.js (lot x -82..-12 × z -262..-196)
  { key: 'extramvedpjst', label: 'Russet Orchard', kind: 'farm', f: [-41, -21, -228, -208], door: [-21, -218], face: 'E', selfBuilt: true, note: 'farm 1 of 3 · apples · Rusty Russet' },
  // s169: farm 2 = COBB FARM (corn maze + carrots), east of the Castle Path across from the orchard; everything in worlds/meru2-farm-corn.js (lot x 12..54 × z -272..-204)
  { key: 'farmCobb', label: 'Cobb Farm', kind: 'farm', f: [30, 50, -222, -206], door: [30, -214], face: 'W', selfBuilt: true, note: 'farm 2 of 3 · corn maze + carrots · Maizy Cobb' },
  // s170: farm 3 = WOOLLY ACRES (sheep + cows, open pasture), west of the Castle Path north of the orchard; everything in worlds/meru2-farm-sheep.js (lot x -76..-12 × z -330..-268)
  { key: 'farmWoolly', label: 'Woolly Acres', kind: 'farm', f: [-48, -30, -327, -313], door: [-30, -320], face: 'E', selfBuilt: true, note: 'farm 3 of 3 · sheep + cows · Gus Woolly' },
  // south-west corner inside the ring
  { key: 'extramv4koqiu', label: 'Hobby Shop', kind: 'hobby', f: [-148, -132, 118, 134], door: [-148, 126], face: 'W', door2: [-140, 134], face2: 'S', ownFront: true, sty: { s: 'brick', base: '#9b4b37', h: 6, awn: '#2e86b8' }, note: 'corner: doors on both ring roads' },
  // the lake beach by the Lake Path
  { key: 'extramv4ldbfh', label: 'Bait Shop', kind: 'bait', f: [-27, -15, 204, 214], door: [-15, 209], face: 'E', door2: [-21, 214], face2: 'S', ownFront: true, sty: { s: 'panel', base: '#8b6a48', h: 5, roof: 'none', awn: '#2e86b8' }, note: 'beach shack: front on the Lake Path, back to the water' },
  // s107 (Ben s104i: by the lake, with a fire boat): MERU FIRE STATION. Truck bay (red roller door) + people door both on the east wall toward the Lake Path,
  // bunk floor (mezzanine) with the brass pole inside, hose tower outside the SW corner, fire boat at the FIRE DOCK (LAKE.jetties fireJetty). Interior + jobs: worlds/meru2-fire.js
  { key: 'fireStation', label: 'Meru Fire Station', kind: 'fire', room: 'meruFireStation', f: [-66, -38, 190, 210], door: [-38, 194.5], face: 'E', door2: [-38, 200.5], face2: 'E', ownFront: true, sty: { s: 'brick', base: '#a8322a', h: 9, awn: '#ffd23a' }, note: 'truck bay N of the people door; the train curves past the NW corner' },
  // east, on the ring road (x 160), facing W
  { key: 'extramv4lcdtp', label: 'Flower Shop', kind: 'flowers', f: [172, 184, -46, -34], door: [172, -40], face: 'W', ownFront: true, sty: { s: 'brick', base: '#d8a0a8', h: 5, awn: '#3f9a5e' } },
  { key: 'extramv4lc8mr', label: 'Meru History Museum', kind: 'museum', f: [172, 192, -136, -100], door: [172, -118], face: 'W', door2: [192, -112], face2: 'E', ownFront: true, sty: { s: 'stone', base: '#ece6d8', h: 12 }, note: 'back door onto the Hill Park trail' },
  { key: 'extramv4kojov', label: 'Nature Office', kind: 'nature', f: [172, 186, 62, 80], door: [172, 71], face: 'W', door2: [179, 62], face2: 'N', ownFront: true, sty: { s: 'stone', base: '#7a6a4f', h: 6, roof: 'hip', roofC: '#3f6a3a', awn: '#3f9a5e' }, note: 'park rangers, next to the Aviary; corner: side door on the Arena Road' },
  // the Arena Road (z 50), south side, facing N
  { key: 'extramv4lce16', label: 'Meru Country Club', kind: 'club', f: [288, 326, 62, 82], door: [307, 62], face: 'N', door2: [307, 82], face2: 'S', ownFront: true, keepProps: true, sty: { s: 'stone', base: '#f3f2f2', h: 9, roof: 'hip', roofC: '#2e4a6b', awn: '#2e4a6b' }, green: [288, 326, 86, 128] },
  { key: 'extramv4lzy2z', label: 'Minigolf', kind: 'minigolf', f: [332, 344, 62, 72], door: [338, 62], face: 'N', door2: [344, 67], face2: 'E', ownFront: true, keepProps: true, sty: { s: 'panel', base: '#3f9a5e', h: 5, awn: '#ffd23a' }, course: [330, 350, 76, 128], note: 'ticket hut; the course behind it' },
  { key: 'extramv4m49pk', label: 'Gas Station', kind: 'gas', f: [378, 392, 68, 80], door: [378, 74], face: 'W', door2: [385, 68], face2: 'N', canopy: [364, 376, 62, 84], ownFront: true, keepProps: true, sty: { s: 'glass', base: '#56636e', h: 5, awn: '#ec3013' }, note: 'corner of the Arena Road + the Lakeside road' },
  // the Barracks Road (x 60, then z -310)
  { key: 'extramv4m7nsl', label: 'Barracks Minimart', kind: 'minimart', f: [30, 48, -303, -279], door: [48, -291], face: 'E', ownFront: true, sty: { s: 'panel', base: '#4f5d2f', h: 7, awn: '#ffd23a' }, note: 's79: Sgt. Biscuit (worlds/meru2-bmart.js = Penny\'s shifted by (220, -199))' },
  { key: 'extramv4m5l8c', label: 'Barracks Gas', kind: 'gas', f: [78, 92, -292, -280], door: [78, -286], face: 'W', door2: [85, -292], face2: 'N', canopy: [64, 76, -298, -276], canopyC: '#4f5d2f', ownFront: true, keepProps: true, sty: { s: 'glass', base: '#56636e', h: 5, awn: '#4f5d2f' }, note: 's79: Dot Diesel (worlds/meru2-bgas.js = Bolt\'s shifted by (-300, -360))' },
  { key: 'extramv4m7583', label: 'Meru Post Office', kind: 'post', f: [52, 76, -344, -322], door: [64, -322], face: 'S', ownFront: true, sty: { s: 'brick', base: '#9b4b37', h: 8, awn: '#ffd23a' }, note: 'Ben left it unnamed; Claude made it the post office' },
  // MERU OUTLETS (closed, bandits): five units along the Barracks Road. s151 (Ben): units 2 + 4 cross to the NORTH side (facing S), 1 / 3 / 5 stay south (facing N),
  // staggered so walking past is a battle on both sides (worlds/meru2-outlets.js: ambush, cover, Magpie on unit 3's roof)
  ...[0, 1, 2, 3, 4].map(i => ({ key: ['extramv4m90mv', 'extramv4m8ssh', 'extramv4m7g3b', 'extramv4m9n2p', 'extramv4m9870'][i], label: 'Meru Outlets ' + (i + 1) + ' (closed)', kind: 'outlet', unit: i, bandits: true,
    f: i % 2 ? [172 + i * 24, 194 + i * 24, -348, -326] : [172 + i * 24, 194 + i * 24, -294, -272], door: i % 2 ? [183 + i * 24, -326] : [183 + i * 24, -294], face: i % 2 ? 'S' : 'N', ownFront: true, keepProps: true, sty: { s: 'panel', base: ['#8a8178', '#7a7068', '#8f877c', '#7a7068', '#8a8178'][i], h: 7, awn: '#5a5654' } })),
];
for (const T of TOWN2) { T.extra = false; T.town2 = true; T.room = null; T.noSky = true; BUILDINGS.push(T); PROMOTED.push(T.key); }
// s181 (Ben: "interiors missing"): an OLD workshop layout saved in this browser moved the shells away from their (baked) interiors. The game now uses the BAKED layout
// (TOWN_MOVES); ?mylayout=1 = use the workshop's saved layout + extra buildings (to preview a new layout before Claude bakes it).
const MY_LAYOUT = typeof location !== 'undefined' && /[?&]mylayout=1/.test(location.search);
// s41d (Ben): EXTRA BUILDINGS added in the Town Layout Workshop ('meru2.townLayout' .extra: { key, label, f, door, face }). Plain square shells
// with a front door (no interior yet), styled by worlds/meru2-city.js; they collide like any building. ?extra=0 hides them.
(() => { try { if (!MY_LAYOUT || (typeof location !== 'undefined' && /[?&]extra=0/.test(location.search))) return; const s = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem('meru2.townLayout')) || 'null');
  for (const e of (s && s.extra) || []) if (e && e.key && Array.isArray(e.f) && !PROMOTED.includes(e.key) && !BUILDINGS.some(b => b.key === e.key)) BUILDINGS.push({ key: e.key, label: e.label || 'Building', f: e.f.slice(), door: (e.door || [(e.f[0] + e.f[1]) / 2, e.f[3]]).slice(), face: e.face || 'S', room: null, extra: true, noSky: true }); } catch (er) {} })();
// the train loop + its 6 stops (station keys above); cars only on ROADS, never on the foot paths.
export const TRAIN = { stops: ['stationTown', 'stationLakeside', 'stationArena', 'stationSpire', 'stationCastleRd', 'stationDeco', 'stationRuins', 'stationGarden'],
  // stop c = platform centre on the line, lift = where the street lift sits along the platform (m). Platforms are 64 m, on the station side.
  stopAt: { stationTown: { c: [58, 150], lift: -26 }, stationLakeside: { c: [395, 280], lift: 0 }, stationArena: { c: [515, 0], lift: 0 }, stationSpire: { c: [515, -321], lift: 0 }, stationCastleRd: { c: [-45, -515], lift: 0 },
    stationDeco: { c: [-515, -157], lift: 0 }, stationRuins: { c: [-515, 55], lift: 0 }, stationGarden: { c: [-175, 330], lift: 0 } },
  prices: { day: 10, week: 50, month: 150, draft: true }, days: { day: 1, week: 7, month: 30 },
  // s40 big-map loop (clockwise, chamfered corners): Town → Lakeside run z 280 → EAST LEG x 515 (outside Lakeside, Arena, Spire) → NORTH LEG z -515
  // (north of the Barracks + Castle Ridge) → WEST LEG x -515 (outside Deco, behind the Ruins Cave) → z 212 north of Falls hill → LAKE CROSSING z 330
  // (Garden island) → x -86 north over the lake (between the Boatworks + Pearl Island) → Town. Track over water = bridge (pillars stand in the lake). Corners are filleted (keys r) and legs resampled, see expandLine().
  // keys: [x, z, r] — r = corner radius (fillet); expandLine() turns them into the sampled line below (legs every ~12 m so the curve never overshoots)
  keys: [[26, 150], [90, 150], [125, 160], [163, 168], [250, 168, 40], [330, 280, 40], [515, 280, 45], [515, -515, 45], [-515, -515, 45], [-515, 212, 45], [-325, 212, 35], [-262, 330, 35],
    [-110, 330, 18], [-86, 300, 18], [-86, 232], [-78, 190], [-58, 170], [-13, 168]], line: [] };
// s40: fillet each keyed corner (quadratic curve from T1 through the corner to T2) and resample long legs, so CatmullRom follows the drawn shape
export function expandLine(K) { const n = K.length, out = [], P = i => K[(i + n) % n], cut = [];
  for (let i = 0; i < n; i++) { const [x, z, r] = P(i); if (!r) { cut.push(null); continue; } const a = P(i - 1), b = P(i + 1), la = Math.hypot(a[0] - x, a[1] - z), lb = Math.hypot(b[0] - x, b[1] - z),
      u1 = [(a[0] - x) / la, (a[1] - z) / la], u2 = [(b[0] - x) / lb, (b[1] - z) / lb], th = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]))), t = Math.min(r / Math.tan(th / 2), la * 0.45, lb * 0.45);
    cut.push({ t1: [x + u1[0] * t, z + u1[1] * t], t2: [x + u2[0] * t, z + u2[1] * t], c: [x, z], n: Math.max(3, Math.ceil(t / 6)) }); }
  const ends = i => cut[i] ? [cut[i].t1, cut[i].t2] : [[P(i)[0], P(i)[1]], [P(i)[0], P(i)[1]]];
  for (let i = 0; i < n; i++) { const C = cut[i]; if (C) for (let k = 0; k <= C.n; k++) { const u = k / C.n, w0 = (1 - u) * (1 - u), w1 = 2 * u * (1 - u), w2 = u * u; out.push([w0 * C.t1[0] + w1 * C.c[0] + w2 * C.t2[0], w0 * C.t1[1] + w1 * C.c[1] + w2 * C.t2[1]]); } else out.push(ends(i)[0]);
    const A = ends(i)[1], B = ends((i + 1) % n)[0], d = Math.hypot(B[0] - A[0], B[1] - A[1]); if (d > 30 && (cut[i] || cut[(i + 1) % n])) { const m = Math.ceil(d / 12); for (let k = 1; k < m; k++) out.push([A[0] + (B[0] - A[0]) * k / m, A[1] + (B[1] - A[1]) * k / m]); } }
  return out.map(([x, z]) => [+x.toFixed(1), +z.toFixed(1)]); }
TRAIN.line = expandLine(TRAIN.keys);
// s38: MERU CASTLE on Castle Ridge. r = outer walls, y = the crest, gate = E wall opening, keep = the hall block, keepDoor on its E face.
// The keep's rooms are a quick-fade interior under the crest (IN: centre + floor y), built by worlds/meru2-castle.js.
export const CASTLE = { r: [-284, -224, -447, -413], y: 26, gate: [-224, -430], keep: [-280, -254, -443, -417], keepDoor: [-254, -430], IN: { x: -255, z: -420, y: -60 } };
export const TAXI = { base: 2, perM: 1 / 80, draft: true };
// step 5: THE LAKE (built by worlds/meru2-lake.js). Jetties = wooden decks on piles (y = deck height), railed except the land end;
// gaps = open rail (walk off / climb out). The speedboat (engine/vehicle-fun.js model) replaces the old rowboat. Ben (step 5): FREE,
// a FREE RENTAL TODAY! sign on the jetty, no talking needed: walk up and drive. gate = the Speedboat Bay course start (drive through + E).
export const LAKE = {
  jetties: [
    { key: 'bayJetty', label: 'Speedboat Bay jetty', r: [72, 78, 232, 262],   /* s727g: foot 2 m further out → 4 m walk behind the boathouse */ y: 0.9, open: ['N', 'S'], gaps: [{ side: 'E', at: 252, w: 7 }, { side: 'W', at: 246 }] },
    { key: 'bayEnd', r: [62, 78, 262, 268], y: 0.9, gaps: [{ side: 'N', at: 75, w: 6, join: true }, { side: 'S', at: 66 }, { side: 'E', at: 265 }] },
    // s171 (Ben: "a tiny walkway, hard to find to get off the dock"): the jetty now lands on the BOATWORKS LANDING, a wide deck behind the shed that
    // opens WEST (steps down to the sand) and EAST (onto the slipway side); a lit plank walk (CLEAR_WALKS boatworksWest) runs on up the shed's west side to its front.
    { key: 'worksJetty', label: "Boatworks jetty", r: [-127, -121, 240.4, 264], y: 0.9, open: ['N'], gaps: [{ side: 'E', at: 256 }, { side: 'S', at: -124 }] },
    { key: 'worksLanding', r: [-139, -117, 234.4, 240.4], y: 0.9, open: ['W'], steps: 'W', gaps: [{ side: 'S', at: -124, w: 6, join: true }, { side: 'E', at: 237.4, w: 4.4, join: true }] },   // s727f (Ben: too close to the shed): landing + jetty foot 2.4 m further out → a 4 m walk behind the shed (was 1.6 m)
    // step 6: the Pearl Island ferry jetty (east beach); the ferry moors on its south side
    { key: 'islandJetty', label: 'Pearl Island jetty', r: [249, 272, 348, 352], y: 1.2, open: ['W'], gaps: [{ side: 'S', at: 266, w: 9 }, { side: 'N', at: 257 }] },
    // s39 (Ben): the FOUNTAIN PIER, straight on from the north-south walkway (Lake Path boardwalk, x 0) into the lake, a T head at the end. The speedboat moors here.
    { key: 'fountainPier', label: 'Fountain Pier', r: [-2.5, 2.5, 236, 296], y: 0.9, open: ['N', 'S'], gaps: [] },
    // s52: REEL'S JETTY, straight on from the Bait Shop's back porch + boardwalk (worlds/meru2-bait.js). Free dock fishing at the end (yellow ring).
    { key: 'baitJetty', label: "Reel's jetty", r: [-23, -19, 236, 258], y: 0.9, open: ['N'], gaps: [{ side: 'E', at: 252 }] },
    { key: 'fireJetty', label: 'Fire Dock', r: [-52, -48, 236, 258], y: 0.9, open: ['N'], gaps: [{ side: 'E', at: 250, w: 6 }] },   // s107: the fire boat moors on its east side
    { key: 'fountainPierT', r: [-9, 9, 296, 302], y: 0.9, gaps: [{ side: 'N', at: 0, w: 5, join: true }, { side: 'E', at: 299 }, { side: 'W', at: 299 }] },
  ],
  // step 6: THE FERRY. Free (DRAFT). Shuttles Pearl Ferry Dock pier (east side) ↔ Pearl Island jetty on a loop round the north of the island.
  ferry: { path: [[161.5, 256], [161.5, 266], [175, 272], [230, 272], [278, 292], [294, 325], [292, 345], [277, 356.4], [266, 356.4]], dwell: 20, speed: 7, accel: 1.4, draft: true,
    stops: [{ key: 'dock', label: 'Pearl Ferry Dock', off: [156.2, 256, 0.9, -Math.PI / 2] }, { key: 'island', label: 'Pearl Island', off: [266, 350.4, 1.2, Math.PI] }] },
  // step 6: Pearl Island. The deep pond dive = Meru Pearl Dive.dc.html (the Jidda Deep Dive engine, theme 'meru'). Trail = lanterns from the jetty up to the pond.
  island: { raft: true /* s183: Marlo's raft (worlds/meru2-pearlraft.js) replaces the shore diver + the pond DIVE spots */, dive: { label: 'THE DEEP POND', url: 'Meru Pearl Dive.dc.html?embed=1' }, trail: [[251, 350], [242, 352], [232, 356], [222, 360], [216, 364]], shack: islandPt(-2.85, 39), palms: 30 },
  boat: { moor: [12.2, 299, 0], signAt: [8.2, 297.4], free: true, sign: 'FREE RENTAL TODAY!', note: 's39: moored at the Fountain Pier T head (was the Speedboat Bay jetty 80.8, 252; a second boat back there comes with the roads step)' },
  boat2: { moor: [80.8, 252, 0], signAt: [77.4, 247.4], note: 's41 (big map step 3): the second speedboat, back at the Speedboat Bay jetty. One drives at a time: boarding this one swaps it with the other.' },
  gate: { at: [75, 300], w: 14, label: 'SPEEDBOAT BAY', url: 'Speedboat Bay.dc.html?embed=1' },
  speed: { max: 18, rev: 5, nitro: 28, nitroT: 2.5, nitroCd: 8, draft: true },
  swim: { speed: 2.2, kick: 4.4, kickT: 1.1, kickCd: 1.8, breath: 6, diveY: 2.6 },
};
export const CAR_RENTAL = { day: 25, draft: true };
// step 7: SKATE PARK + TANK WORKS on the map (built by worlds/meru2-yards.js). Skate park = open-air concrete inside a fence west of the
// ring road (the Ruins Path runs through it, z -7..7). Heights are walkable + rideable: bowl, half-pipe, funbox, ledges, rails, stair set.
// The board (engine/vehicle-kit.js 'skate') is free from Tony's rack; ride it anywhere on land. Tank: Tread's Tank Works has a tank on
// stands; the range tank waits outside the Tank Range hangar. DRAFT rule (Ben to confirm): pass the Tank Range (flag meruTankRange or a
// saved range best) = you can drive it and the Planet Defense gate opens. The tank stays inside leash (the Barracks yard + base road).
export const YARDS = {
  skate: { course: true, rect: [-283, -191, -178, -42], rack: [-217, -48], board: { max: 12, push: 7 } },   // s151: the small yard is gone; Tony's Park (SKATEW) is the park. rack = Tony's board rack inside the gap
  tank: { works: { at: [101, -410], yaw: -Math.PI / 2 }, ride: { at: [160, -396], yaw: Math.PI / 2, max: 9, turbo: 16, turboT: 2, turboCd: 6, leash: [-100, 266, -450, -322] },
    gate: { x: 212, z: [-433, -427], fence: [212, 268, -450, -398] }, passKey: 'meru.tankRange.best.v1', flag: 'meruTankRange', draft: true,
    field: { line: 132, z: [-386, -344], targets: [[186, -380], [192, -370], [186, -360], [194, -352], [189, -346]], berm: [200, 206, -390, -340] } },
};
export const ROADS = [
  { w: 12, p: [[-160, -140], [160, -140], [160, 150], [-160, 150], [-160, -140]] },          // city ring road
  { w: 10, p: [[60, -140], [60, -310], [300, -310]] }, { w: 10, p: [[160, 50], [380, 50]] },  // to the barracks, to the arena
  { w: 10, p: [[-160, 50], [-200, 50]] }, { w: 10, p: [[100, 150], [100, 200]] },              // to the skate park, to the lake
];
// SKYLINE DISTRICTS (art pass, Ben: "make ALL the background buildings reachable by road or path, add an entrance, polish round each"):
// paved plazas round the towers (painted by the blockout, dressed by worlds/meru2-districts.js) + an access road (spine) into each, added to ROADS.
// Names DRAFT. Far East backdrop (past the map edge) removed: nothing out there could be reached.
export const SKYLINE = {
  plazas: [{ key: 'spire', r: [282, 400, -285, -82] }, { key: 'deco', r: [-242, -78, -300, -158] }, { key: 'pearl', r: [310, 446, 195, 300] }, { key: 'pearl', r: [380, 446, 300, 368] }, { key: 'garden', r: [-388, -262, 192, 266] }],
  spines: { spire: [[300, -310], [356, -310], [356, -112]], deco: [[-130, -140], [-130, -290]], pearl: [[360, 50], [360, 200]], garden: [[-160, 150], [-262, 150], [-262, 230]] },
  features: [{ kind: 'pool', at: [317, -128], w: 18, d: 7 }, { kind: 'obelisk', at: [-130, -298] }, { kind: 'pearl', at: [338, 268] }, { kind: 'lawn', at: [-325, 252], r: 7 }],
};
ROADS.push(...Object.values(SKYLINE.spines).map(p => ({ w: 10, p, sky: true })));
export const PATHS = [  // foot paths (walk routes); checked for surface changes
  { key: 'toArena', label: 'Square → Arena', p: [[0, 0], [150, 0], [360, 0], [400, 0]] },
  { key: 'toRuins', label: 'Square → Ruins', p: [[0, 0], [-150, 0], [-240, 0], [-432, 0]] },
  { key: 'toLake', label: 'Square → Lake', p: [[0, 0], [0, 140], [0, 230]] },
  { key: 'toCastle', label: 'Square → Castle', p: [[0, 0], [0, -130], [0, -400]] },
];

// speakers. tier 1 = talker, 2 = greeter, 3 = crowd (no voice, not checked). at = world point (outdoors) or { room, x, z } room-local.
export const SPEAKERS = [
  // town outdoors
  { key: 'monk', tier: 1, at: [0, 22], note: 'street preacher, south lip of the fountain' },
  { key: 'deliveryBun', tier: 1, at: [60, 70], draft: true }, { key: 'darterFlick', tier: 1, at: [-60, 25], draft: true },
  { key: 'aptDoorCrest', tier: 2, at: [-56, 96] }, { key: 'aptDoorLake', tier: 2, at: [96, 126] },
  { key: 'ulric', tier: 1, at: [-110, -20], draft: true }, { key: 'grand', tier: 1, at: [-70, -28], draft: true },
  // castle path + barracks
  { key: 'castleGuard1', tier: 2, at: [-251.5, -433.5], note: 's38: at the castle KEEP door' }, { key: 'castleGuard2', tier: 2, at: [-219.5, -434.5], note: 's38: outside the castle gate' },
  { key: 'zadie', tier: 1, at: [-14, -230], draft: true }, { key: 'nash', tier: 1, at: [14, -180], draft: true },
  { key: 'defGuard1', tier: 2, at: [218, -425] }, { key: 'defGuard2', tier: 2, at: [218, -441] },
  // arena path: three clearings, 40 m quiet road between
  { key: 'james', tier: 1, at: [170, -10], draft: true }, { key: 'lucius', tier: 1, at: [190, 12], draft: true },
  { key: 'arenaStall2', tier: 2, at: [270, 12], draft: true, newAvatar: true },
  { key: 'arenaStall3', tier: 2, at: [318, -10], draft: true, newAvatar: true },
  { key: 'arenaGate', tier: 2, at: [354, 12], draft: true, newAvatar: true },
  // step 4: the old Arena Path crowd (worlds/meru-arenapath.js), stall rows at z -24 / +26, mid-road at -10 / +12 (all ≥ 16 m)
  { key: 'torv', tier: 1, at: [210, -10] }, { key: 'odo', tier: 1, at: [290, -10], note: 'bookmaker, odds board' }, { key: 'tam', tier: 1, at: [230, 12] }, { key: 'rosk', tier: 1, at: [310, 12], note: 'juggler' },
  { key: 'marla', tier: 1, at: [180, -24], note: 'ribbon stall' }, { key: 'pell', tier: 1, at: [220, -24], note: 'pie stall' }, { key: 'sela', tier: 1, at: [240, -24], note: 'flower stall' }, { key: 'wren', tier: 1, at: [300, -24] },
  { key: 'ivy', tier: 1, at: [200, 26], note: 'fruit stall' }, { key: 'hetty', tier: 1, at: [240, 26], note: 'fish stall' }, { key: 'arenaGuard2', tier: 2, at: [280, 26] },
  { key: 'arenaRoadGuard1', tier: 2, at: [340, -24] }, { key: 'arenaRoadGuard2', tier: 2, at: [340, 26] }, { key: 'arenaGuard1', tier: 2, at: [356, -12] }, { key: 'vance', tier: 1, at: [372, 0], note: 'Arena Official, inside the arena gate' },
  // ruins
  { key: 'spade', tier: 1, at: [-255, -18] }, { key: 'ruinsGuard', tier: 2, at: [-320, 6] }, { key: 'sage', tier: 1, at: [-380, -36] },
  // skate park
  { key: 'tony', tier: 1, at: [-229.4, -63], note: 's151: Tony\'s Park coach (where the game\'s Tony stands, course (-7.6, -43))' },
  // lake + island
  { key: 'fisherwoman', tier: 1, at: [-20, 236], own: 'jetty' }, { key: 'fisherman', tier: 1, at: [96, 232], own: 'jetty', note: 'boat hire → speedboat · s92: both built + talkable in worlds/meru2-jetty-jobs.js' },
  { key: 'ferryCaptain', tier: 1, at: [160, 230], newAvatar: true }, { key: 'pearlLocal1', tier: 1, at: islandPt(Math.atan2(-26, -56), 37), newAvatar: true },
  { key: 'pearlLocal2', tier: 2, at: islandPt(Math.atan2(-56, 34), 37), newAvatar: true }, { key: 'pearlDiver', tier: 1, at: [214, 366], newAvatar: true, note: 'pond edge, starts the dive' },
  // interiors
  { key: 'noble', tier: 1, at: { room: 'tavern', x: -6, z: 4 }, note: 'starts here, joins later' }, { key: 'docBraun', tier: 1, at: { room: 'tavern', x: 7, z: -5 } },
  { key: 'hope', tier: 1, at: { room: 'blindSchool', x: 0, z: -6 }, note: 'teaching a class' },
  { key: 'jon', tier: 1, at: { room: 'boatworks', x: 4.5, z: -3.5 }, note: "Ben (step 5): Jon works in his Boatworks, by the boat on the cradle" },
  // step 5: Hope's pupils, names + looks from the school game (minigames/meru/blind-school.js KIDS). Crowd tier until their lines are voiced.
  { key: 'juno', tier: 3, at: { room: 'blindSchool', x: -9, z: 0.4 }, note: 'JUNO · braille speed champ' }, { key: 'pip', tier: 3, at: { room: 'blindSchool', x: -4.5, z: 0.4 }, note: 'PIP · low vision, big print' },
  { key: 'tobi', tier: 3, at: { room: 'blindSchool', x: 0, z: 0.4 }, note: 'TOBI · goalball captain' }, { key: 'mae', tier: 3, at: { room: 'blindSchool', x: 4.5, z: 0.4 }, note: 'MAE · plays piano by ear' }, { key: 'rio', tier: 3, at: { room: 'blindSchool', x: 9, z: 0.4 }, note: 'RIO · sculptor' },
  { key: 'casinoPoker1', tier: 2, at: { room: 'casino', x: -9.5, z: -23.6 }, newAvatar: true }, { key: 'casinoPoker2', tier: 2, at: { room: 'casino', x: 5.5, z: -24.6 }, newAvatar: true },
  { key: 'casinoWheel', tier: 2, at: { room: 'casino', x: 6.5, z: 26 }, newAvatar: true }, { key: 'casinoCashier', tier: 2, at: { room: 'casino', x: -12.5, z: 23.6 }, newAvatar: true },
  { key: 'lanesKeeper', tier: 1, at: { room: 'bowling', x: 0, z: 14 } }, { key: 'lanesRegular', tier: 1, at: { room: 'bowling', x: -9, z: -2 } }, { key: 'lanesRecord', tier: 1, at: { room: 'bowling', x: 9, z: -2 } }, { key: 'lanesRival', tier: 1, at: { room: 'bowling', x: 19.5, z: 8 } }, { key: 'bowlerDash', tier: 1, at: { room: 'bowling', x: -17.5, z: -17 } },
  { key: 'kia', tier: 1, at: { room: 'itemshop', x: 0, z: -3 } }, { key: 'bram', tier: 1, at: { room: 'armory', x: 0, z: -3 } }, { key: 'ora', tier: 1, at: { room: 'fortune', x: 0, z: -2 } },
  { key: 'burgerCook', tier: 1, at: { room: 'burgers', x: -5, z: -4 } }, { key: 'michaelJay', tier: 1, at: { room: 'burgers', x: 7, z: 3 } },
  { key: 'policeDesk', tier: 1, at: { room: 'police', x: 0, z: -3 }, newAvatar: true }, { key: 'jailGuard', tier: 2, at: { room: 'jail', x: 0, z: 6 }, newAvatar: true },
  { key: 'bankTeller', tier: 1, at: { room: 'bank', x: -5, z: -6 }, newAvatar: true }, { key: 'bankVault', tier: 2, at: { room: 'bank', x: 7, z: 4 }, newAvatar: true },
  { key: 'rentalClerk', tier: 1, at: { room: 'carRental', x: 0, z: -2 }, newAvatar: true }, { key: 'rentalClerk2', tier: 1, at: { room: 'carRental2', x: 0, z: 2 }, newAvatar: true },
  { key: 'ticketClerk', tier: 1, at: { room: 'stationTown', x: -10, z: 0 }, newAvatar: true }, { key: 'trainConductor', tier: 1, at: { room: 'train', x: 0, z: 0 }, newAvatar: true },
  { key: 'aptRealCrest', tier: 1, at: { room: 'crest', x: 0, z: -6 } }, { key: 'aptRealLake', tier: 1, at: { room: 'lake', x: 0, z: -6 } },
  { key: 'barracksGuardCaptain', tier: 1, at: { room: 'barracks', x: -8, z: 0 } }, { key: 'barracksMasterOfArms', tier: 1, at: { room: 'barracks', x: 8, z: 6 } },
  { key: 'tread', tier: 1, at: { room: 'tankWorks', x: 0, z: -6 }, note: 'Sgt. Tread: Tank Works + Tank Range' },
  { key: 'rangeGuard', tier: 2, at: [182, -399], newAvatar: true, note: 's104g: at the Tank Range hangar door' },
  { key: 'defTech1', tier: 1, at: { room: 'defense', x: -7, z: -3 } }, { key: 'defTech2', tier: 2, at: { room: 'defense', x: 7, z: 3 } },
  { key: 'mike', tier: 1, at: { room: 'castle', x: 0, z: -16 }, note: 's38: King Might on the dais of the castle Throne Room (was the Barracks stand-in)' },
];

// ---------- the checklist ----------
const inR = (r, x, z) => x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3];
const inC = (c, x, z) => Math.hypot(x - c[0], z - c[1]) <= c[2];
export function surfaceAt(x, z) { let s = 'grass'; for (const S of SURFACES) if (S.k ? S.k(x, z) : S.r ? inR(S.r, x, z) : inC(S.c, x, z)) s = S.s; return s; }
export function checkLayout() {
  const out = [], R = (id, ok, txt, items = []) => out.push({ id, ok, txt, items });
  const outdoor = SPEAKERS.filter(s => s.tier < 3 && Array.isArray(s.at)), indoor = SPEAKERS.filter(s => s.tier < 3 && !Array.isArray(s.at));
  const near = [];
  for (let i = 0; i < outdoor.length; i++) for (let j = i + 1; j < outdoor.length; j++) { const a = outdoor[i], b = outdoor[j], d = Math.hypot(a.at[0] - b.at[0], a.at[1] - b.at[1]); if (d < 16) near.push(a.key + ' ↔ ' + b.key + ' ' + d.toFixed(1) + ' m'); }
  for (let i = 0; i < indoor.length; i++) for (let j = i + 1; j < indoor.length; j++) { const a = indoor[i], b = indoor[j]; if (a.at.room !== b.at.room) continue; const d = Math.hypot(a.at.x - b.at.x, a.at.z - b.at.z); if (d < 12) near.push(a.key + ' ↔ ' + b.key + ' ' + d.toFixed(1) + ' m (' + a.at.room + ')'); }
  R('spacing', !near.length, 'Speaking foxes ≥ 16 m apart outdoors, ≥ 12 m indoors', near);
  const doors = BUILDINGS.filter(b => b.door), dc = [];
  for (let i = 0; i < doors.length; i++) for (let j = i + 1; j < doors.length; j++) { const a = doors[i], b = doors[j]; if (a.face !== b.face) continue; const d = Math.hypot(a.door[0] - b.door[0], a.door[1] - b.door[1]); if (d < 22) dc.push(a.label + ' ↔ ' + b.label + ' ' + d.toFixed(1) + ' m'); }
  R('doors', !dc.length, 'Doors on the same face ≥ 22 m apart', dc);
  const rs = []; for (const b of BUILDINGS) for (const r of [b.room, ...(b.rooms || [])].filter(Boolean)) { const m = Math.max(r.w, r.d); if (m > 12 && m < 20 && !b.size) rs.push((r.key || b.key) + ' ' + r.w + ' × ' + r.d); }
  R('rooms', !rs.length, 'Every room ≤ 12 m or ≥ 20 m across', rs);
  const zs = ZONES.filter(z => z.depth < 30).map(z => z.label + ' ' + z.depth + ' m'); R('zones', !zs.length, 'Every zone ≥ 30 m deep along the path', zs);
  const pc = PATHS.map(P => { let n = 0, last = null, seq = []; for (let k = 0; k < P.p.length - 1; k++) { const [x0, z0] = P.p[k], [x1, z1] = P.p[k + 1], L = Math.hypot(x1 - x0, z1 - z0); for (let t = 0; t <= L; t += 2) { const s = surfaceAt(x0 + (x1 - x0) * t / L, z0 + (z1 - z0) * t / L); if (s !== last) { if (last) n++; last = s; seq.push(s); } } } return { P, n, seq }; });
  R('surfaces', pc.every(p => p.n >= 3), 'At least 3 surface changes on every main route', pc.map(p => p.P.label + ': ' + p.n + ' (' + p.seq.join(' → ') + ')'));
  const nk = SPEAKERS.filter(s => s.tier < 3 && !s.key).length; R('keys', !nk, 'Every speaking fox has a key and a tier', nk ? [nk + ' missing'] : []);
  R('busy', true, 'Busy voice zones flagged for music trim', ZONES.filter(z => z.busy).map(z => z.label).concat(BUILDINGS.filter(b => b.busy).map(b => b.label + ' (room)')));
  R('hiring', true, 'NOW HIRING signs (hotspot opens the job)', BUILDINGS.filter(b => b.hiring).map(b => b.label + ' → ' + b.hiring.game));
  R('reverb', true, 'Rooms that want reverb, named up front', BUILDINGS.filter(b => b.reverb).map(b => b.label + ': ' + b.reverb));
  return out;
}
export const NEW_AVATARS = SPEAKERS.filter(s => s.newAvatar);
// step 4: the Ruins Path wilds. Meru's own creatures (cave bats + rats, worlds/meru-caves.js makeCritter) live OFF the path:
// they never come within `band` m of a foot path, stay within `leash` m of home, give up when you stay on the path, respawn after `respawn` s.
// worlds/meru2-paths.js adds the 8 Ruins Hills spots (heights.wild) to these.
export const WILD = { key: 'ruinsWild', area: [-405, -245, -175, 175], band: 9, leash: 26, respawn: 40, spots: [
  { kind: 'rat', x: -290, z: 24 }, { kind: 'rat', x: -300, z: -30 }, { kind: 'rat', x: -335, z: 34 }, { kind: 'rat', x: -350, z: -24 }, { kind: 'rat', x: -372, z: 40 }, { kind: 'rat', x: -395, z: 22 },
  { kind: 'rat', x: -302, z: -60 }, { kind: 'rat', x: -345, z: 62 }, { kind: 'bat', x: -310, z: -22 }, { kind: 'bat', x: -365, z: 20 }, { kind: 'bat', x: -300, z: 40 }, { kind: 'bat', x: -385, z: -14 }] };

// ---------- s33: BEN'S TOWN LAYOUT (Town Layout Workshop, 'meru2.townLayout'; this copy is the default) ----------
// Both walking paths clear (Ruins <-> Arena along z 0, Castle <-> Lake along x 0, 12 m), only the fountain in them. Applied here at load:
// each moved building keeps b.orig { f, door, face }; MOVES = the quarter-turn + shift from the old place to the new (worlds/meru2-relocate.js
// carries the interiors). The workshop's live copy in localStorage wins, so a change there shows in the game on the next load.
export const TOWN_MOVES = {"width":16,"b":{"stationTown":{"f":[12,52,116,136],"door":[32,116],"face":"N"},"lake":{"f":[61,101,80,120],"door":[81,80],"face":"N"},"crest":{"f":[-149,-113,-131,-91],"door":[-113,-111],"face":"E"},"bank":{"f":[-63,-15,97,142],"door":[-39,97],"face":"N"},"casino":{"f":[14.5,78.5,-127.5,-82.5],"door":[46.5,-82.5],"face":"S"},"tavern":{"f":[-58,-18,-122,-82],"door":[-38,-82],"face":"S"},"carRental":{"f":[84,98,-87,-75],"door":[91,-75],"face":"S"},"burgers":{"f":[103,147,19,51],"door":[103,35],"face":"W"},"bowling":{"f":[102,147,-67,-19],"door":[102,-43],"face":"W"},"police":{"f":[-143.5,-98.5,-66.5,-18.5],"door":[-98.5,-42.5],"face":"E"},"armory":{"f":[-117,-101,67,87],"door":[-101,77],"face":"E"},"fortune":{"f":[-96,-84,97,121],"door":[-90,97],"face":"N"},"itemshop":{"f":[-146,-98,18.5,63.5],"door":[-98,41],"face":"E"},"extramv4iruy4":{"f":[-111,-91,-167,-151],"door":[-101,-151],"face":"S"},"extramv4is68x":{"f":[-153,-139,-167,-153],"door":[-146,-153],"face":"S"}}};
// s34: FIXED BACK DOORS (Ben): placed by hand in each building's ORIGINAL frame (before TOWN_MOVES), so a moved building carries its
// back door with it. These win over the auto planner (worlds/meru2-roadside.js planBackDoors only fills buildings not listed here).
export const BACK_DOORS = {
  armory: { door: [28, 76], face: 'S', note: 's78: back wall centre behind Bram (crossed halberds moved to the east wall) → the TEST RANGE yard (worlds/meru2-armory-jobs.js)' },
  bowling: { door: [150, 3.2], face: 'E', note: 'east wall where the old blank arcade row stood, 4.5 m clear of the Claw Crane' },
  itemshop: { door: [-41, 108], face: 'S', note: 'grocery back wall (now the west wall, road side), in the gap between the 1st + 2nd freezer islands; the cooler wall splits round it (meru2-grocery.js GROCERY.backX)' },
  casino: { door: [-150, 26], face: 'W', note: 'old west wall (now the north wall, road side) between the slot bank (z 16.5) and the corner plant (z 30.7), by the cashier + bar; the casino wainscot opens there (buildCasino backDoor)' },
  burgers: { door: [114, 48], face: 'E', note: 'east wall straight across from the front door (z 48): front door → hall lane → staff door (z 46..50) → back of house → out' },
  bank: { door: [65.5, -125], face: 'N', note: 's35 (Ben): the SIDEWALK LOBBY: back wall (now the south wall on the ring-road sidewalk), west end; glass vestibule + red runner past the lockers into the hall (meru2-civic.js)' },
  // s40: stations on the big-map loop: the track-side wall, at the lift (stopAt lift 0)
  stationLakeside: { door: [395, 296], face: 'N' }, stationArena: { door: [499, 0], face: 'E' }, stationSpire: { door: [499, -321], face: 'E' }, stationCastleRd: { door: [-45, -499], face: 'N' },
  stationDeco: { door: [-499, -157], face: 'W' }, stationRuins: { door: [-499, 55], face: 'W' }, stationGarden: { door: [-175, 346], face: 'N' },
  tavern: { door: [49.4, -100], face: 'N', clear: [47, 52, -100, -95], note: 'north wall, darts end of the room, just east of the cellar trapdoor (x 41..46); barrels + any table in the way move (meru-tavern.js clear); opens onto the outdoor deck (worlds/meru2-tavdeck.js)' },
};
(() => { if (typeof location !== 'undefined' && /[?&]backdoors=0/.test(location.search)) return;
  for (const b of BUILDINGS) { const p = BACK_DOORS[b.key]; if (!p || b.door2) continue; b.door2 = p.door.slice(); b.face2 = p.face; b.backDoor = true; b.fixedBack = true; } })();
// lot r for building b (wanted spot first, then the opposite side, the other two sides, then a 14 m lot), clear of other buildings + 3 m and the sidewalk.
// Also used by the Town Layout Workshop while you drag, so the plan shows the lot where the game will put it.
export function fitLot(b, want, all) { const ov = (a, c) => a[0] < c[1] && a[1] > c[0] && a[2] < c[3] && a[3] > c[2], RING = [-151, 151, -131, 141];
  const r = want, w = r[1] - r[0], d = r[3] - r[2], [x0, x1, z0, z1] = b.f, G = 2, cz = (r[2] + r[3]) / 2, cx = (r[0] + r[1]) / 2, n = 14;
  const cands = [r, [x0 - G - w, x0 - G, cz - d / 2, cz + d / 2], [x1 + G, x1 + G + w, cz - d / 2, cz + d / 2], [cx - w / 2, cx + w / 2, z0 - G - d, z0 - G], [cx - w / 2, cx + w / 2, z1 + G, z1 + G + d],
    [x0 - G - n, x0 - G, cz - d / 2, cz + d / 2], [x1 + G, x1 + G + n, cz - d / 2, cz + d / 2], [cx - w / 2, cx + w / 2, z1 + G, z1 + G + n], [cx - w / 2, cx + w / 2, z0 - G - n, z0 - G]];
  const ok = c => c[0] > RING[0] && c[1] < RING[1] && c[2] > RING[2] && c[3] < RING[3] && !ov(c, [x0 - 1, x1 + 1, z0 - 1, z1 + 1]) && !all.some(o => o.key !== b.key && o.f && Math.abs((o.f[0] + o.f[1]) / 2) < 200 && ov(c, [o.f[0] - 3, o.f[1] + 3, o.f[2] - 3, o.f[3] + 3]));
  return (cands.find(ok) || r).slice(); }
// the lot moved with a building (same turn + shift as the shell), from its original spot
export function movedLot(b, f, face) { if (!b.lot) return null; const o = b.orig || b, r = b.lot.r0 || b.lot.r, R = ['N', 'E', 'S', 'W'], q = ((R.indexOf(face) - R.indexOf(o.face)) % 4 + 4) % 4;
  const ocx = (o.f[0] + o.f[1]) / 2, ocz = (o.f[2] + o.f[3]) / 2, ncx = (f[0] + f[1]) / 2, ncz = (f[2] + f[3]) / 2;
  const mv = ([x, z]) => { let dx = x - ocx, dz = z - ocz; for (let i = 0; i < q; i++) { const t = dx; dx = -dz; dz = t; } return [ncx + dx, ncz + dz]; };
  const p = mv([r[0], r[2]]), s = mv([r[1], r[3]]); return [Math.min(p[0], s[0]), Math.max(p[0], s[0]), Math.min(p[1], s[1]), Math.max(p[1], s[1])]; }
export const LOTS = { carRental2: [-108, -90, -130, -112] };   // fixed lots for buildings that have not been moved
export const MOVES = [];
(() => { let T = TOWN_MOVES; try { const s = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem('meru2.townLayout')) || 'null'); if (s && s.b && MY_LAYOUT) T = s; } catch (e) {}
  if (typeof location !== 'undefined' && /[?&]townmove=0/.test(location.search)) return;
  const R = ['N', 'E', 'S', 'W'];
  for (const b of BUILDINGS) { const o = T.b[b.key]; if (!o || !b.f) continue;
    const q = ((R.indexOf(o.face) - R.indexOf(b.face)) % 4 + 4) % 4, bw = b.f[1] - b.f[0], bd = b.f[3] - b.f[2], ew = q % 2 ? bd : bw, ed = q % 2 ? bw : bd;
    let ncx = (o.f[0] + o.f[1]) / 2, ncz = (o.f[2] + o.f[3]) / 2;
    const ocx = (b.f[0] + b.f[1]) / 2, ocz = (b.f[2] + b.f[3]) / 2;
    const rot = (dx, dz) => { for (let i = 0; i < q; i++) { const t = dx; dx = -dz; dz = t; } return [dx, dz]; };
    // s121: a building that grew since the layout was saved (Fortune Teller x2): keep its DOOR where the saved layout put it, grow away from it
    if (o.door && (Math.abs((o.f[1] - o.f[0]) - ew) > 0.01 || Math.abs((o.f[3] - o.f[2]) - ed) > 0.01)) { const [ra, rb] = rot(ocx - b.door[0], ocz - b.door[1]); ncx = o.door[0] + ra; ncz = o.door[1] + rb; }
    const f = [ncx - ew / 2, ncx + ew / 2, ncz - ed / 2, ncz + ed / 2]; if (Math.abs(ncx - ocx) < 0.01 && Math.abs(ncz - ocz) < 0.01 && !q) continue;
    const mv = (p) => { const [a, c] = rot(p[0] - ocx, p[1] - ocz); return [ncx + a, ncz + c]; };
    b.orig = { f: b.f.slice(), door: b.door.slice(), face: b.face, door2: b.door2 ? b.door2.slice() : null, face2: b.face2 };
    MOVES.push({ key: b.key, q, o: [ocx, ocz], n: [ncx, ncz], fo: b.f.slice(), fn: f, face0: b.face });
    b.f = f; b.door = mv(b.door); b.face = o.face; if (b.door2) { b.door2 = mv(b.door2); b.face2 = R[(R.indexOf(b.face2) + q) % 4]; }
    if (b.lot && b.lot.r) { const p = mv([b.lot.r[0], b.lot.r[2]]), q = mv([b.lot.r[1], b.lot.r[3]]); b.lot.r0 = b.lot.r.slice(); b.lot.r = [Math.min(p[0], q[0]), Math.max(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[1], q[1])]; } }
  // s34 (Ben): rental LOTS move WITH their building (same side, same turn: the first one had stayed at its old spot, in front of Burgers).
  // If that spot hits another building (+3 m) or the ring-road sidewalk, the lot tries the opposite side, then the two other sides.
  for (const b of BUILDINGS) if (b.lot && b.lot.r && b.orig) b.lot.r = fitLot(b, b.lot.r, BUILDINGS);
  for (const b of BUILDINGS) { const r = LOTS[b.key]; if (r && b.lot && !b.orig) b.lot.r = r.slice(); }
})();
// s33: BACK DOORS on the road side, planned by worlds/meru2-roadside.js planBackDoors for this exact layout (saved with it), opened as door2
export let LAYOUT_SIG = '';
(() => { try { let T = TOWN_MOVES; const s = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem('meru2.townLayout')) || 'null'); if (s && s.b && MY_LAYOUT) T = s; LAYOUT_SIG = JSON.stringify(T.b) + JSON.stringify(BACK_DOORS);
  if (typeof location !== 'undefined' && /[?&]backdoors=0/.test(location.search)) return;
  const bd = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem('meru2.backDoors')) || 'null'); if (!bd || bd.sig !== LAYOUT_SIG) return;
  for (const b of BUILDINGS) { const p = bd.doors[b.key]; if (!p || p.none || b.door2) continue; b.door2 = p.door.slice(); b.face2 = p.face; b.backDoor = true; } } catch (e) {} })();

// ---------- s38b: SKYLINE MOVES (Ben: drag the building CLUSTERS in the Town Layout Workshop) ----------
// Saved with the town layout ('meru2.townLayout' .sky = { spire: [dx, dz], deco, pearl, garden }). A moved district takes its plazas, towers
// (meru2-blockout.js shifts them through skyShift), features, the buildings + speakers standing on its plazas, and its access road
// (every spine point except the first, which stays on the road it branches from).
export const SKYLINE_ORIG = JSON.parse(JSON.stringify(SKYLINE));
export const skyKeyAt = (x, z, m = 2) => { const P = SKYLINE_ORIG.plazas.find(p => x > p.r[0] - m && x < p.r[1] + m && z > p.r[2] - m && z < p.r[3] + m); return P ? P.key : null; };
export let SKY_MOVES = {};
export const skyShift = (x, z, sky = SKY_MOVES) => { const k = skyKeyAt(x, z), d = k && sky[k]; return d ? [x + d[0], z + d[1]] : [x, z]; };
// s39: a moved district always fits the map (5 m in from the edge): its move is cut back on whichever side runs over
export function skyClamp(sky) { const out = {}, E = (MAP.cluster || MAP.half) - 5; for (const k in sky) { let [dx, dz] = sky[k]; for (const p of SKYLINE_ORIG.plazas) { if (p.key !== k) continue; const r = p.r;
      if (r[1] + dx > E) dx = E - r[1]; if (r[0] + dx < -E) dx = -E - r[0]; if (r[3] + dz > E) dz = E - r[3]; if (r[2] + dz < -E) dz = -E - r[2]; } out[k] = [Math.round(dx), Math.round(dz)]; } return out; }
export const SKY_BEN = { garden: [104, 167], pearl: [21, 122], deco: [-248, -22], spire: [90, -9] };   // s39: Ben's s38b cluster moves, cut back to the bigger map (deco 22 m north off the Ruins Hills, pearl 10 m east onto the lake shore)
(() => { if (!TOWN_MOVES.sky) TOWN_MOVES.sky = SKY_BEN; })();
export function skySpines(sky = SKY_MOVES) { const out = {}; for (const k in SKYLINE_ORIG.spines) { const d = sky[k] || [0, 0]; out[k] = SKYLINE_ORIG.spines[k].map((q, i) => i ? [q[0] + d[0], q[1] + d[1]] : q.slice()); } return out; }
(() => { let T = TOWN_MOVES; try { const s = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem('meru2.townLayout')) || 'null'); if (s && s.b && MY_LAYOUT) T = s; } catch (e) {}
  if (typeof location !== 'undefined' && /[?&]skymove=0/.test(location.search)) return;
  SKY_MOVES = skyClamp((T && T.sky) || TOWN_MOVES.sky || {}); if (!Object.keys(SKY_MOVES).length) return; const O = SKYLINE_ORIG, D = k => SKY_MOVES[k] || [0, 0];
  SKYLINE.plazas.forEach((p, i) => { const o = O.plazas[i], d = D(o.key); p.r = [o.r[0] + d[0], o.r[1] + d[0], o.r[2] + d[1], o.r[3] + d[1]]; });
  const sp = skySpines(); for (const k in sp) sp[k].forEach((q, i) => { SKYLINE.spines[k][i][0] = q[0]; SKYLINE.spines[k][i][1] = q[1]; });   // in place: ROADS holds the same arrays
  SKYLINE.features.forEach((f, i) => { f.at = skyShift(O.features[i].at[0], O.features[i].at[1]); });
  for (const b of BUILDINGS) { if (!b.f || b.orig || b.noSky) continue; const k = skyKeyAt((b.f[0] + b.f[1]) / 2, (b.f[2] + b.f[3]) / 2, 0); if (!k || !SKY_MOVES[k]) continue; const d = D(k);
    b.skyFrom = { key: k, f: b.f.slice(), door: b.door && b.door.slice() }; b.f = [b.f[0] + d[0], b.f[1] + d[0], b.f[2] + d[1], b.f[3] + d[1]]; if (b.door) b.door = [b.door[0] + d[0], b.door[1] + d[1]]; }
  for (const s of SPEAKERS) if (Array.isArray(s.at)) s.at = skyShift(s.at[0], s.at[1]); })();

// ---------- s39 (Ben): PEARL ISLAND on the fountain line + 25 % bigger, the GARDEN DISTRICT island ----------
// Pearl Island: centre on x 0 (in line with the Fountain Pier), as far south as the lake allows with open water still past its south beach.
// ISLAND keeps its numbers in island units; k = 1.25 scales them to metres (islandR / islandPt). Every Pearl Island point in this file moves with T().
(() => { if (typeof location !== 'undefined' && /[?&]oldisland=1/.test(location.search)) return;
  // s184 PEARL VALLEY (?novalley=1 = off): the island grows 2.0 x east-west, 1.45 x north-south (was 1.25 both) round the dive crater
  const VALLEY = !(typeof location !== 'undefined' && /[?&]novalley=1/.test(location.search));
  const O = [ISLAND.pond.x, ISLAND.pond.z], k = 1.25, kx = VALLEY ? 2.0 : k, kz = VALLEY ? 1.45 : k, south = lakeEdge(Math.PI / 2)[1], NZ = Math.round(south - (30 + 24 * 1.26) * kz - 12), N = [0, NZ];
  const T = ([x, z]) => [+(N[0] + (x - O[0]) * kx).toFixed(2), +(N[1] + (z - O[1]) * kz).toFixed(2)], TX = x => +(N[0] + (x - O[0]) * kx).toFixed(2);
  ISLAND.k = kz; if (VALLEY) { ISLAND.kx = kx; ISLAND.kz = kz; } ISLAND.c[0] = ISLAND.hills[0] = ISLAND.pond.x = N[0]; ISLAND.c[1] = ISLAND.hills[1] = ISLAND.pond.z = N[1]; ISLAND.moved = { from: O, to: N, k, kx, kz };
  for (const Z of ZONES) if (Z.key === 'pearlIsland') Z.c = [N[0], N[1], Z.c[2] * kx];
  for (const S of SURFACES) if (S.c && S.c[0] === O[0] && S.c[1] === O[1]) S.c = [N[0], N[1], S.c[2] * kx];
  const J = LAKE.jetties.find(q => q.key === 'islandJetty'); if (J) { const a = T([J.r[0], J.r[2]]), b = T([J.r[1], J.r[3]]); J.r = [a[0], b[0], a[1], b[1]]; for (const g of J.gaps) g.at = g.side === 'N' || g.side === 'S' ? TX(g.at) : T([0, g.at])[1]; }
  const F = LAKE.ferry; F.path = [F.path[0], F.path[1], [140, 285], ...F.path.slice(4).map(T)]; for (const s of F.stops) if (s.key === 'island') { const p = T([s.off[0], s.off[1]]); s.off = [p[0], p[1], s.off[2], s.off[3]]; }
  const RP = p => p.map(([x, z]) => [+(N[0] + x).toFixed(2), +(N[1] + z).toFixed(2)]);
  if (VALLEY) { // the crater profile: flat top (with swells) at Hr, a steep green slope, the old beach band
    ISLAND.prof = [[0, 10], [35.5, 10], [38.5, 7], [40.8, 3], [42.5, 1.0], [45.5, 0.45], [ISLAND.c[2], 0.12], [ISLAND.c[2] + 2, -0.35], [ISLAND.c[2] + 6, -2]]; ISLAND.pond.r = 0;
    ISLAND.crater = { c: N, S: 0.6, ez0: POND_WALL.ez0, Hs: 7, Hr: 10, A: 64.6, B: 26.8, rc: 8, yaw: -Math.PI / 2, origin: [N[0] + 0.6 * POND_WALL.ez0, N[1]], raft: [N[0] + 0.6 * POND_WALL.ez0, N[1]], beach: [N[0] + 61.5, N[1]] };
    // two lantern paths (Ben): the island jetty up the east slope + down the beach to Marlo's jetty; the pearl shack up the west slope + along the north rim
    LAKE.island.trail = RP([[86, -8.7], [78, -7], [70, -4], [66.5, -1.5], [61.5, 0]]);
    LAKE.island.trail2 = RP([[-81, -25], [-74, -28], [-66, -31.5], [-50, -33], [-20, -33.5], [10, -33.5], [40, -33], [58, -31], [68, -22], [69, -12], [67, -3], [66.5, -1.5]]);
  } else LAKE.island.trail = LAKE.island.trail.map(T);
  LAKE.island.shack = islandPt(-2.85, VALLEY ? 43 : 39);
  for (const H of LIGHTHOUSES) if (H.island) H.at = islandPt(0.686, VALLEY ? 45.5 : 41);
  const SP = { pearlLocal1: () => islandPt(Math.atan2(-26, -56), VALLEY ? 44.5 : 37), pearlLocal2: () => islandPt(Math.atan2(-56, 34), VALLEY ? 44.5 : 37) };
  for (const s of SPEAKERS) { if (SP[s.key]) s.at = SP[s.key](); else if (s.key === 'pearlDiver') s.at = VALLEY ? ISLAND.crater.raft.slice() : T(s.at); } })();
// Garden District island: the moved district plaza, if it stands in the lake, becomes a flat island (stadium shape, paved top 0.5 m up,
// a sand beach all round) built by worlds/meru2-heights.js as a hill with isle: true. The road + train bridges come with the roads / train steps.
(() => { const P = SKYLINE.plazas.find(p => p.key === 'garden'); if (!P) return; const r = P.r, cx = (r[0] + r[1]) / 2, cz = (r[2] + r[3]) / 2; if (lakeF(cx, cz) >= 1 && !(WATER[0] && Math.hypot((cx - WATER[0].e[0]) / WATER[0].e[2], (cz - WATER[0].e[1]) / WATER[0].e[3]) < 1)) return;
  const hw = (r[1] - r[0]) / 2, hd = (r[3] - r[2]) / 2, along = hw >= hd, core = Math.min(hw, hd) + 3, run = Math.abs(hw - hd);
  const I = { key: 'gardenIsle', label: 'Garden Island', a: along ? [cx - run, cz] : [cx, cz - run], b: along ? [cx + run, cz] : [cx, cz + run], core, r: core + 16, h: 0.5, isle: true, plaza: null, note: 's39: Garden District island' };
  ISLES.push(I); HILLS.push(I); })();


// ---------- s41 (Ben, big map step 3): SQUARE ROADS · GARDEN BRIDGE · STATION LINKS · GARDEN JETTY + 3-STOP FERRY · DESERT ----------
// Roads: straight lines + right angles only, every new one joined to the main road. The cluster access roads (SKYLINE.spines, moved by
// SKY_MOVES) are re-drawn as L shapes in place (ROADS + the districts hold the same arrays). BRIDGES run along z (x = centre line):
// deck y = y0 → y1 plus an arch (sin) so boats pass under the middle span; built + walked by worlds/meru2-roads3.js (through heights).
// LINKS = paved foot walks from the stations the roads don't reach (painted by the blockout, lanterns from roads3).
export const DESERT = { c: [-441, 0], r: 90, note: 's41 (Ben): desert 90 m round the Ruins Cave; dressed by worlds/meru2-roads3.js' };
export function desertK(x, z) { const D = DESERT, dx = x - D.c[0], dz = z - D.c[1], d = Math.hypot(dx, dz); if (d > D.r + 14) return 0; const t = Math.atan2(dz, dx), R = D.r + 6 * Math.sin(3 * t + 1) + 4 * Math.sin(7 * t + 2) + 2 * Math.sin(13 * t + 0.5); return sm(R + 3, R - 9, d); }
export const BRIDGES = [], LINKS = [];
LINKS.push({ key: 'tonysLink', label: "Tony's Park walk", p: [[-237, -6], [-237, -44]], w: 6 });   // s151: off the Ruins Path straight into the park's south gap
// the four cluster access roads as straight lines + right angles, for any cluster moves (sky = { key: [dx, dz] })
export function squareSpines(sky = SKY_MOVES) { const sp = skySpines(sky), R = k => { const o = SKYLINE_ORIG.plazas.find(p => p.key === k), d = sky[k] || [0, 0]; return o && [o.r[0] + d[0], o.r[1] + d[0], o.r[2] + d[1], o.r[3] + d[1]]; }, out = {};
  const LS = (BUILDINGS.find(b => b.key === 'stationLakeside') || {}).door, W = WATER[0].e;
  for (const k in sp) { const p = sp[k], p0 = p[0], pl = p[p.length - 1], r = R(k); out[k] = [p0, [pl[0], p0[1]], pl];
    if (k === 'deco' && r) { const cz = (r[2] + r[3]) / 2; out[k] = [p0, [p0[0], cz], [r[1] - 52, cz]]; }   // ends 9 m short of the Gatekeeper
    if (k === 'pearl' && LS) out[k] = [p0, [p0[0], LS[1] + 10], [LS[0] + 15, LS[1] + 10]];   // past Lakeside Station's front door
    if (k === 'garden' && r) { const cx = (r[0] + r[1]) / 2, cz = (r[2] + r[3]) / 2, wet = Math.hypot((cx - W[0]) / W[2], (cz - W[1]) / W[3]) < 1;
      out[k] = wet ? [p0, [p0[0], 240], [cx, 240], [cx, r[2] + 41]] : [p0, [p0[0], pl[1]], pl]; } }   // island: along the shore, the bridge, the lawn between the twins
  return out; }
export function bridgeAt(x, z, m = 0) { for (const B of BRIDGES) { const off = x - B.x; if (Math.abs(off) > B.w / 2 + m || z < B.z0 - m || z > B.z1 + m) continue; const u = Math.max(0, Math.min(1, (z - B.z0) / (B.z1 - B.z0))); return { B, u, off, y: B.y0 + (B.y1 - B.y0) * u + B.arch * Math.sin(Math.PI * u) }; } return null; }
(() => { if (typeof location !== 'undefined' && /[?&]step3=0/.test(location.search)) return;
  const SP = SKYLINE.spines, PZ = k => SKYLINE.plazas.find(p => p.key === k), set = (a, pts) => { a.length = 0; pts.forEach(q => a.push(q)); }, door = k => (BUILDINGS.find(b => b.key === k) || {}).door;
  const G = ISLES.find(I => I.key === 'gardenIsle'), Pg = PZ('garden'), Pd = PZ('deco'), gx = Pg ? (Pg.r[0] + Pg.r[1]) / 2 : 0;
  // cluster roads as L shapes (squareSpines; the Town Layout Workshop draws the same)
  { const Q = squareSpines(); for (const k in Q) if (SP[k]) set(SP[k], Q[k]); }
  // station roads: Arena (the arena road runs on to the station's front door), Spire (a branch off the spire road)
  { const R = ROADS.find(r => r.p[0][0] === 160 && r.p[0][1] === 50), d = door('stationArena'); if (R && d) R.p.splice(1, R.p.length - 1, [d[0] - 13, 50], [d[0] - 13, d[1]]); }
  { const d = door('stationSpire'), c = SP.spire[1]; if (d) ROADS.push({ w: 10, p: [[c[0], c[1]], [c[0], d[1]], [d[0] - 7, d[1]]], station: true }); }
  // Garden island: a paved apron under Garden Island Station (it stood half in the water), the road bridge, the island jetty
  if (G) { const S = BUILDINGS.find(b => b.key === 'stationGarden');
    if (S && !onIsle((S.f[0] + S.f[1]) / 2, S.f[2] + 1)) { const cz = (S.f[2] + S.f[3]) / 2, I = { key: 'gardenIsleN', label: 'Garden Island', a: [S.f[0] - 6, cz], b: [S.f[1] + 2, cz], core: (S.f[3] - S.f[2]) / 2 + 2, h: G.h, isle: true, plaza: null, note: 's41: paved apron under Garden Island Station' }; I.r = I.core + 14; ISLES.push(I); HILLS.push(I); }
    let z = 240; while (z < 500 && !inLake(gx, z)) z++; const z0 = z - 5; while (z < 520 && !onIsle(gx, z)) z++;
    const B = { key: 'gardenBridge', label: 'Garden Bridge', x: gx, z0, z1: z, end: Pg.r[2] + 41, road: 10, w: 10 + 2 * SIDEWALK0, y0: 0.05, y1: G.h, arch: 3.0, piers: [], note: 's41: road bridge from the north shore; the arched middle span clears 2.6 m+ for boats' };
    for (let q = z0 + 16; q < B.z1 - 4; q += 16) { const b = (BRIDGES.push(B), bridgeAt(gx, q)); BRIDGES.length = 0; if (b.y > 0.9 && inLake(gx, q)) for (const s of [-1, 1]) B.piers.push([gx + s * (B.w / 2 - 1.4), q]); }
    BRIDGES.push(B); LAKE.extraBlocks = (LAKE.extraBlocks || []).concat(B.piers.map(([x, q]) => [x, q, 1.1]));
    const jx0 = G.b[0] + G.core + 1, jx1 = jx0 + 28, jz = G.b[1];
    LAKE.jetties.push({ key: 'gardenJetty', label: 'Garden Island jetty', r: [jx0, jx1, jz - 3, jz + 2], y: 0.9, open: ['W'], gaps: [{ side: 'S', at: jx1 - 5, w: 9 }, { side: 'N', at: jx1 - 12 }] });
    // THE FERRY, 3 stops: Pearl Ferry Dock → Pearl Island → Garden Island and back. It backs out of the Pearl Island slip (stop.back m), loops round the
    // jetty end, runs north of Pearl Island (between the island and the Fountain Pier) and west to the Garden jetty.
    const F = LAKE.ferry; if (ISLAND.moved && F.stops.length === 2) { const pe = F.path[F.path.length - 1], pi = F.path.length - 1, mz = jz + 2 + 4.4;
      F.path.push([pe[0] + 17, pe[1]], [pe[0] + 23, pe[1] - 6.5], [pe[0] + 17, pe[1] - 18.5], [pe[0], pe[1] - 28.5], [55, 335], [25, 313], [-20, 312], [-55, 328], [-80, 362], [-100, 392], [jx1 + 14, mz], [jx1 - 5, mz]);
      F.stops[0].i = 0; Object.assign(F.stops[1], { i: pi, back: 17 }); F.stops.push({ key: 'garden', label: 'Garden Island', i: F.path.length - 1, off: [jx1 - 5, jz, 0.9, Math.PI] }); } }
  // foot LINKS from the stations no road reaches (Castle, Deco, Ruins)
  { const dC = door('stationCastleRd'), dD = door('stationDeco'), dR = door('stationRuins');
    if (dC) LINKS.push({ key: 'castleLink', label: 'Castle Station walk', p: [dC, [dC[0], dC[1] + 11], [dC[0] - 9, dC[1] + 11], [dC[0] - 9, -372]] }, { key: 'castleFoot', label: 'Castle Road foot', p: [[-62, -372], [-2, -372]] });
    if (dD && Pd) LINKS.push({ key: 'decoLink', label: 'Deco Station walk', p: [dD, [dD[0] + 24, dD[1]], [dD[0] + 24, Pd.r[3] - 2]] });
    LINKS.push({ key: 'aviaryLink', label: 'Aviary walk', p: [[170, 114], [190, 114]] });
    if (dR) LINKS.push({ key: 'ruinsLink', label: 'Ruins Station walk', p: [dR, [-405, dR[1]], [-405, 2]] });
    for (const l of LINKS) l.w = l.w || 4; }
})();
// s42: the skate road runs on west so Big Tall's Rock Wall closes its end (TOWN2)
{ const R = ROADS.find(r => r.p.length === 2 && r.p[0][0] === -160 && r.p[0][1] === 50 && r.p[1][0] === -200); if (R) R.p[1] = [-232, 50]; }   // the skate road runs on west so the Rock Wall closes its end

// s42 (Town 2 pass 3): DOOR WALKS. Every Town 2 door (front + side) gets a paved walk straight out to the nearest sidewalk or foot path
// when that is more than 3.2 m away (the 3 m forecourts already meet the sidewalk); the Motel side door turns down to the ring road.
// Gas forecourts + the Outlets frontage are paved (SURFACES stone) so you can walk / drive straight in.
(() => { if (typeof location !== 'undefined' && /[?&]step3=0/.test(location.search)) return;
  const FACE = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }, seg = (x, z, p) => { let m = 1e9; for (let i = 0; i < p.length - 1; i++) { const [a, b] = p[i], [c, d] = p[i + 1], dx = c - a, dz = d - b, l = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - a) * dx + (z - b) * dz) / l)); m = Math.min(m, Math.hypot(x - a - dx * u, z - b - dz * u)); } return m; };
  const roadE = (x, z) => Math.min(...ROADS.map(r => seg(x, z, r.p) - r.w / 2)), pathD = (x, z) => Math.min(...[...PATHS, ...LINKS, ...TRAILS].map(P => seg(x, z, P.p)));
  for (const T of (TOWN2 || []).filter(T => !T.selfBuilt)) for (const [d, f, tag] of [[T.door, T.face, 'front'], ...(T.door2 ? [[T.door2, T.face2, 'side']] : [])]) { const n = FACE[f]; let end = null;
    for (let t = 0; t < 40; t += 0.5) { const x = d[0] + n[0] * t, z = d[1] + n[1] * t; if (roadE(x, z) < SIDEWALK - 0.2 || pathD(x, z) < 1.6) { end = t; break; } }
    if (end != null && end > 3.2) LINKS.push({ key: T.key + '-' + tag, label: T.label + ' walk', w: 3, town2: true, p: [d, [d[0] + n[0] * (end + 0.6), d[1] + n[1] * (end + 0.6)]] }); }
  const mo = TOWN2.find(T => T.kind === 'motel'); if (mo && mo.door2) LINKS.push({ key: mo.key + '-side', label: 'Meru Motel side walk', w: 3, town2: true, p: [mo.door2, [mo.door2[0] + 7, mo.door2[1]], [mo.door2[0] + 7, -146]] });
  const ins = SURFACES.findIndex(S2 => S2.s === 'sand' && S2.r); const add = r => SURFACES.splice(ins < 0 ? SURFACES.length : ins, 0, { s: 'stone', r, town2: true });
  for (const T of TOWN2) { if (T.canopy) { const c = T.canopy, f = T.f; add([Math.min(c[0], f[0]) - 2, Math.max(c[1], f[1]) + 2, Math.min(c[2], f[2]) - 2, Math.max(c[3], f[3]) + 2]); }
    if (T.kind === 'outlet' && T.unit === 0) add([168, 294, -305, -294]); if (T.kind === 'outlet' && T.unit === 1) add([192, 270, -326, -315]);   // s151: the north frontage (units 2 + 4)
    if (T.kind === 'fire') add([-38, -27, 191.6, 197.4]); }   // s107: concrete apron in front of the fire station truck bay
})();

// ---------- s105 (Ben s104h): CLUSTER BUILDINGS · first pass (roster: MERU_CLUSTER_ROSTER.md) ----------
// 24 buildings, 6 per cluster: HQ · battle · news outlet · specialty · apartments · relic store. at = the tower centre in ORIGINAL plaza
// coordinates (skyShift moves it with its cluster), face = the side the front door is on. own = a low building of its own (no tower).
// worlds/meru2-districts.js puts each tower's glass door mid-face on 'face'; worlds/meru2-clusters.js adds signs, lobbies, keepers, battle looks.
// PEARL_MOVE: s105 moved the Pearl Sail battle to Garden Island. s132 (Ben): MOVE IT BACK to the Lakeside sail tower (its old door, north face).
// Off by default now (?pearlmove=1 = the island again). With it off: Salt HQ uses the sail's SOUTH face, the island tower = a Pearl Sail island office (Coral).
export const PEARL_MOVE = typeof location !== 'undefined' && /[?&]pearlmove=1/.test(location.search);
export const CLUSTER_NAMES = { garden: 'GARDEN ISLAND', pearl: 'LAKESIDE', spire: 'SPIRE', deco: 'DECO' };
export const CLUSTER_BUILDINGS = [
  // GARDEN ISLAND · VAX (fancy, in the lake)
  { key: 'vaxHQ', room: 'meruVaxHQ', cl: 'garden', title: 'VAX', kick: 'VAX BRAND HQ', kind: 'hq', at: [-304, 215], face: 'S', keeper: ['vaxReception', 'Glossa', 'VAX front desk'] },
  { key: 'pearlOffices', room: 'meruPearlSail', cl: 'garden', title: 'PEARL SAIL', kick: 'OFFICES', kind: 'battle', battle: 'pearl', at: [-346, 215], face: 'S', talker: ['psManager', 'Coral', 'Pearl Sail office manager'] },
  { key: 'tvStation', room: 'meruTVStation', cl: 'garden', title: 'MERU TV', kick: 'TV STATION', kind: 'news', at: [-284, 252], face: 'W', keeper: ['tvManager', 'Station Manager', 'Meru TV front desk'] },
  { key: 'gallery', room: 'meruGallery', cl: 'garden', title: 'ART GALLERY', kick: 'GALLERY + STUDIOS', kind: 'gallery', at: [-372, 250], face: 'E', keeper: ['galleryOwner', 'Gallery Owner', 'Art Gallery'] },
  { key: 'gardenApts', room: 'meruGardenApts', cl: 'garden', title: 'GARDEN APARTMENTS', kick: 'A PEPPER PROPERTY', kind: 'apt', at: [-272, 216], face: 'S', keeper: ['gaptManager', 'Building Manager', 'Garden Apartments'] },
  { key: 'relicGarden', room: 'meruRelicGarden', cl: 'garden', title: 'RELICS', kick: 'GARDEN ISLAND RELIC STORE', kind: 'relic', at: [-348, 256], face: 'E', keeper: ['relicGarden', 'Relic Dealer', 'Garden Island relics'] },
  // LAKESIDE · SALT (east shore)
  { key: 'saltHQ', room: 'meruSaltHQ', cl: 'pearl', title: 'SALT', kick: 'SALT FAMILY HQ', kind: 'hq', at: [383, 243], face: 'N', keeper: ['saltDesk', 'Brine', 'Salt HQ front desk'] },
  { key: 'saltBuilding', room: 'meruSaltBuilding', cl: 'pearl', title: 'SALT BUILDING', kick: 'SALT FAMILY', kind: 'battle', battle: 'salt', at: [432, 302], face: 'W', talker: ['saltCousin', 'Salt Cousin', 'Salt family'] },
  { key: 'tabloid', room: 'meruTabloid', cl: 'pearl', title: 'MERU BUZZ', kick: 'TABLOID WEBSITE', kind: 'news', at: [330, 214], face: 'E', keeper: ['tabEditor', 'Editor-in-Chief', 'Meru Buzz'] },
  { key: 'lakesideApts', room: 'meruLakesideApts', cl: 'pearl', title: 'LAKESIDE APARTMENTS', kick: 'LAKESIDE', kind: 'apt', at: [430, 214], face: 'W', keeper: ['laptManager', 'Building Manager', 'Lakeside Apartments'] },
  { key: 'relicLakeside', room: 'meruRelicLakeside', cl: 'pearl', title: 'RELICS', kick: 'LAKESIDE RELIC STORE', kind: 'relic', at: [420, 350], face: 'W', keeper: ['relicLakeside', 'Relic Dealer', 'Lakeside relics'] },
  { key: 'townDump', room: 'meruTownDump', cl: 'pearl', title: 'TOWN DUMP', kick: 'WASTE SERVICES · SALT', kind: 'dump', at: [398, 322], face: 'W', own: { w: 20, d: 16, h: 2.4 }, keeper: ['dumpForeman', 'Dump Foreman', 'Town Dump'] },
  // SPIRE · MACHINE FLEET (north-east)
  { key: 'mfHQ', room: 'meruMachineFleetHQ', cl: 'spire', title: 'MACHINE FLEET', kick: 'MACHINE FLEET HQ', kind: 'hq', at: [335, -205], face: 'E', keeper: ['mfDesk', 'Front Desk', 'Machine Fleet HQ'] },
  { key: 'mfFactory', room: 'meruRobotFactory', cl: 'spire', title: 'ROBOT FACTORY', kick: 'MACHINE FLEET', kind: 'battle', battle: 'factory', at: [374, -252], face: 'W', talker: ['mfForeman', 'Factory Foreman', 'Robot Factory'] },
  { key: 'radio', room: 'meruRadio', cl: 'spire', title: 'MERU RADIO', kick: 'RADIO STATION', kind: 'news', at: [338, -96], face: 'E', keeper: ['radioManager', 'Station Manager', 'Meru Radio'] },
  { key: 'offices', room: 'meruOffices', cl: 'spire', title: 'OFFICES', kick: 'LAWYER · ACCOUNTANT · DENTIST', kind: 'office', at: [304, -148], face: 'E', keeper: ['officeLobby', 'Lobby Desk', 'Spire Offices'] },
  { key: 'spireApts', room: 'meruSpireApts', cl: 'spire', title: 'SPIRE APARTMENTS', kick: 'SPIRE', kind: 'apt', at: [375, -148], face: 'W', keeper: ['saptManager', 'Building Manager', 'Spire Apartments'] },
  { key: 'relicSpire', room: 'meruRelicSpire', cl: 'spire', title: 'RELICS', kick: 'SPIRE RELIC STORE', kind: 'relic', at: [298, -258], face: 'E', keeper: ['relicSpire', 'Relic Dealer', 'Spire relics'] },
  // DECO · PEPPER (north-west)
  { key: 'pepperHQ', room: 'meruPepperHQ', cl: 'deco', title: 'PEPPER', kick: 'PEPPER FAMILY HQ', kind: 'hq', at: [-160, -235], face: 'E', keeper: ['pepperDesk', 'Front Desk', 'Pepper HQ'] },
  { key: 'pepperBuilding', room: 'meruPepperBuilding', cl: 'deco', title: 'PEPPER BUILDING', kick: 'PEPPER FAMILY', kind: 'battle', battle: 'pepper', at: [-216, -276], face: 'E', talker: ['pepperCousin', 'Pepper Cousin', 'Pepper family'] },
  { key: 'newspaper', room: 'meruNewspaper', cl: 'deco', title: 'MERU DAILY', kick: 'NEWSPAPER', kind: 'news', at: [-216, -182], face: 'E', keeper: ['paperEditor', 'Editor', 'Meru Daily'] },
  { key: 'decoApts', room: 'meruDecoApts', cl: 'deco', title: 'DECO APARTMENTS', kick: 'A PEPPER PROPERTY', kind: 'apt', at: [-100, -186], face: 'W', keeper: ['daptManager', 'Building Manager', 'Deco Apartments'] },
  { key: 'relicDeco', room: 'meruRelicDeco', cl: 'deco', title: 'RELICS', kick: 'DECO RELIC STORE', kind: 'relic', at: [-104, -272], face: 'W', keeper: ['relicDeco', 'Relic Dealer', 'Deco relics'] },
  { key: 'woodshop', room: 'meruWoodshop', cl: 'deco', title: 'WOODSHOP', kick: 'MASTER CARPENTER', kind: 'wood', at: [-172, -172], face: 'S', own: { w: 14, d: 10, h: 4.6 }, keeper: ['woodMaster', 'Master Carpenter', 'Woodshop'] },
];
(() => { if (PEARL_MOVE) return; const s = CLUSTER_BUILDINGS.find(q => q.key === 'saltHQ'), p = CLUSTER_BUILDINGS.find(q => q.key === 'pearlOffices'); if (s) s.face = 'S';
  if (p) { Object.assign(p, { kind: 'office', kick: 'ISLAND OFFICE', keeper: ['psIsland', 'Coral', 'Pearl Sail island office'], lobbyAt: 44 }); delete p.battle; delete p.talker; } })();   // s132
// the cluster building whose tower stands at world (x, z) (towers are skyShifted), or null
export const clusterAt = (x, z) => CLUSTER_BUILDINGS.find(c => !c.own && (([a, b]) => Math.hypot(a - x, b - z) < 2.5)(skyShift(c.at[0], c.at[1]))) || null;
// PEARL_MOVE: the Pearl Sail battle door (NOW HIRING card 'BATTLE') follows the pearlOffices tower (twin A, 22 m with its podium, door mid south face)
(() => { if (!PEARL_MOVE) return; const b = BUILDINGS.find(q => q.key === 'pearlSail'), c = CLUSTER_BUILDINGS.find(q => q.key === 'pearlOffices'); if (!b || !c) return;
  const [x, z] = skyShift(c.at[0], c.at[1] + 11); b.f = [x - 2, x + 2, z - 0.8, z]; b.door = [x, z]; b.face = 'S'; b.noFrame = true; b.movedFrom = 'Lakeside sail (s105 PEARL_MOVE)'; })();

// s171 CLEAR WALKS (Ben): rects kept free of flora + small props after the build (worlds/meru2-walk.js), each with a lit plank walk (worlds/meru2-lake.js)
export const CLEAR_WALKS = [{ key: 'boatworksWest', r: [-138, -132, 203, 234.4], lamps: 'W' }, { key: 'boatworksBack', r: [-139, -95, 230.2, 234.2] }, { key: 'boathouseBack', r: [60, 90, 228.2, 231.8] }];
// s171 SETBACK (Ben: "move every building back off the sidewalks, a little front grass area to the door, PLENTY of space on ALL sidewalks"):
// any town building whose wall comes within SIDEWALK + front m of a road edge is pushed straight back from that road, the same way a Town Layout
// Workshop move works (b.orig + a MOVES entry, so worlds/meru2-relocate.js carries the interior; an already-moved building just moves further).
// Only buildings the relocator is known to carry: already moved ones + RELOC_OK. Skipped (own builders at fixed coords): stations, farms, hardware.
// ?setback=0 = off. SETBACK.moved lists what moved / why not (window.__m2setback in the walk).
export const SETBACK = { front: 2.5, moved: [] };
(() => { if (typeof location !== 'undefined' && /[?&]setback=0/.test(location.search)) return;
  const RELOC_OK = ['bank', 'crest', 'lake', 'police', 'tavern', 'casino', 'bowling', 'burgers', 'fortune', 'armory', 'itemshop', 'carRental', 'carRental2'];
  const SKIP = /^(station|farm|hardware$)/, FR = SETBACK.front, SWK = SIDEWALK0;   // s727b: the setback still measures from the old 3.3 m line (no big buildings shoved again)
  const segD = (x, z, p) => { let m = 1e9; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); m = Math.min(m, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return m; };
  const roadD = (x, z) => Math.min(...ROADS.map(r => segD(x, z, r.p) - r.w / 2));
  const near = f => { let m = 1e9, at = null; for (let t = 0; t <= 1.0001; t += 0.025) for (const [x, z] of [[f[0] + (f[1] - f[0]) * t, f[2]], [f[0] + (f[1] - f[0]) * t, f[3]], [f[0], f[2] + (f[3] - f[2]) * t], [f[1], f[2] + (f[3] - f[2]) * t]]) { const d = roadD(x, z); if (d < m) { m = d; at = [x, z]; } } return { m, at }; };
  const ov = (p, q) => p[0] < q[1] && p[1] > q[0] && p[2] < q[3] && p[3] > q[2], grow = (f, g) => [f[0] - g, f[1] + g, f[2] - g, f[3] + g];
  for (const b of BUILDINGS) { if (!b.f || SKIP.test(b.key) || b.kind === 'farm' || b.selfBuilt || b.own || b.open || b.noFrame || b.f[1] - b.f[0] > 90 || b.f[3] - b.f[2] > 90) continue;
    const { m, at } = near(b.f), need = SWK + FR - m; if (need <= 0.05) continue;
    const mv0 = MOVES.find(q => q.key === b.key); if (!mv0 && !RELOC_OK.includes(b.key) && !b.skyFrom) { SETBACK.moved.push({ key: b.key, label: b.label, gap: +(m - SWK).toFixed(2), skipped: 'not relocatable' }); continue; }
    const e = 0.5, gx = roadD(at[0] + e, at[1]) - roadD(at[0] - e, at[1]), gz = roadD(at[0], at[1] + e) - roadD(at[0], at[1] - e), dir = Math.abs(gx) >= Math.abs(gz) ? [Math.sign(gx) || 1, 0] : [0, Math.sign(gz) || 1];
    let ok = null; for (let k = need; k >= Math.min(need, 0.75); k -= 0.25) { const dx = dir[0] * k, dz = dir[1] * k, f = [b.f[0] + dx, b.f[1] + dx, b.f[2] + dz, b.f[3] + dz];
      if (near(f).m < m + k * 0.5) continue;   // another road on the far side: no room
      if (BUILDINGS.some(o => o !== b && o.f && ov(grow(f, 0), grow(o.f, 2)) && !ov(b.f, grow(o.f, 2)))) continue;
      ok = [dx, dz, f]; break; }
    if (!ok) { SETBACK.moved.push({ key: b.key, label: b.label, gap: +(m - SWK).toFixed(2), skipped: 'no room' }); continue; }
    const [dx, dz, f] = ok, sh = p => p && [p[0] + dx, p[1] + dz];
    if (mv0) { mv0.n = sh(mv0.n); mv0.fn = f; }
    else if (!b.skyFrom) { b.orig = { f: b.f.slice(), door: b.door.slice(), face: b.face, door2: b.door2 ? b.door2.slice() : null, face2: b.face2 }; const c = [(b.f[0] + b.f[1]) / 2, (b.f[2] + b.f[3]) / 2]; MOVES.push({ key: b.key, q: 0, o: c, n: sh(c), fo: b.f.slice(), fn: f, face0: b.face }); }
    b.f = f; b.door = sh(b.door); if (b.door2) b.door2 = sh(b.door2); if (b.lot && b.lot.r) b.lot.r = [b.lot.r[0] + dx, b.lot.r[1] + dx, b.lot.r[2] + dz, b.lot.r[3] + dz];
    SETBACK.moved.push({ key: b.key, label: b.label, gap: +(m - SWK).toFixed(2), by: [+dx.toFixed(2), +dz.toFixed(2)] }); } })();
