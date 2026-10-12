// MERU 2.0 — layout data (step 1 draft). Metres, town frame: x east, z south, origin = Fountain Plaza centre. Map ±450.
// Every rule in SOUND_LAYOUT_RULES.md is checked by checkLayout() and shown on Meru 2 Layout.dc.html.
// Speaker keys are the existing pinned cast keys (worlds/meru*.js). Positions marked draft:true wait for Ben's dialogue notes.
export const MAP = { half: 450 };

// zones: music + label areas. depth = the size along the main path through them (checked ≥ 30 m). busy = trim music for voices.
export const ZONES = [
  { key: 'meruTown', label: 'Fountain Plaza', r: [-45, 45, -40, 40], music: 'town', depth: 80 },
  { key: 'meruMarket', label: 'Market Plaza', r: [-150, -45, -40, 40], music: 'market', depth: 105, busy: true },
  { key: 'meruLanesCourt', label: 'Lanes Court', r: [45, 150, -40, 40], music: 'court', depth: 105 },
  { key: 'meruCivic', label: 'Civic Row', r: [-120, 120, -130, -40], music: 'civic', depth: 90 },
  { key: 'meruSouth', label: 'South Gardens', r: [-120, 120, 40, 140], music: 'gardens', depth: 100 },
  { key: 'meruCastlePath', label: 'Castle Path', r: [-30, 30, -330, -130], music: 'castlepath', depth: 200 },
  { key: 'meruBarracks', label: 'Barracks', r: [-100, 260, -450, -330], music: 'barracks', depth: 120 },
  { key: 'meruArenaPath', label: 'Arena Path', r: [150, 360, -30, 30], music: 'arenapath', depth: 210 },
  { key: 'meruArena', label: 'Meru Arena', r: [360, 450, -60, 60], music: 'arena', depth: 90 },
  { key: 'skatePark', label: 'Skate Park', r: [-240, -150, -50, 50], music: 'skate', depth: 90 },
  { key: 'meruRuinsPath', label: 'Ruins Path', r: [-400, -240, -40, 40], music: 'ruinspath', depth: 160 },
  { key: 'meruRuins', label: 'The Ruins', r: [-450, -400, -80, 80], music: 'ruins', depth: 50 },
  { key: 'meruLakePath', label: 'Lake Path', r: [-30, 30, 140, 215], music: 'lakepath', depth: 75 },
  { key: 'meruLake', label: 'The Lake', r: [-320, 320, 215, 450], music: 'lake', depth: 235 },
  { key: 'pearlIsland', label: 'Pearl Island', c: [206, 356, 54], music: 'island', depth: 140 },
  // step 3 part 4: elevated areas (HILLS below)
  { key: 'meruFalls', label: 'Meru Falls', c: [-385, 320, 70], music: 'falls', depth: 70 },
  { key: 'meruRidge', label: 'Castle Ridge', r: [-300, -100, -450, -372], music: 'ridge', depth: 80 },
  { key: 'meruRuinsHills', label: 'Ruins Hills', r: [-450, -290, -175, -85], music: 'ruinspath', depth: 90 },
  { key: 'meruRuinsHillsS', label: 'Ruins Hills', r: [-450, -290, 85, 170], music: 'ruinspath', depth: 85 },
  { key: 'meruHillPark', label: 'Hill Park', c: [240, -180, 62], music: 'park', depth: 60 },
];
// ground. Later entries win. Default outdoors = grass.
export const SURFACES = [
  { s: 'stone', r: [-45, 45, -40, 40] }, { s: 'grass', r: [-12, 12, -12, 12] },           // fountain lawn in the middle of the plaza
  { s: 'stone', r: [-150, -45, -15, 15] }, { s: 'stone', r: [45, 150, -15, 15] },          // plaza-to-plaza promenades; the rest of those plazas is grass + trees
  { s: 'stone', r: [-120, 120, -75, -45] },                                                // Civic Row pavement
  { s: 'stone', r: [-6, 6, -330, -130] }, { s: 'stone', r: [-60, 60, -400, -330] },        // castle road + parade ground
  { s: 'grit', r: [-100, 260, -450, -400] },                                               // barracks yard, tank range ground
  { s: 'stone', r: [160, 200, -20, 20] }, { s: 'stone', r: [240, 280, -20, 20] }, { s: 'stone', r: [320, 360, -20, 20] }, // arena path clearings (grass between)
  { s: 'grit', r: [200, 240, -5, 5] }, { s: 'grit', r: [280, 320, -5, 5] },                     // step 4: gravel road between the arena clearings
  { s: 'stone', r: [360, 450, -60, 60] },
  { s: 'grit', r: [-400, -240, -6, 6] }, { s: 'stone', r: [-450, -400, -80, 80] },         // ruins road climbs on grit to old stone
  { s: 'stone', r: [-240, -150, -50, 50] },                                                // skate concrete (stone surface)
  { s: 'sand', r: [-320, 320, 200, 240] }, { s: 'sand', c: [206, 356, 54] }, { s: 'grass', c: [206, 356, 36] }, // lake shore, island beach ring, island hills
  { s: 'wood', r: [-2.5, 2.5, 214, 238] },                                                 // step 4: Lake Path boardwalk over the shore sand
];
export const WATER = [{ e: [0, 345, 320, 105] }];                                          // the swimmable lake (ellipse cx, cz, rx, rz)
export const ISLAND = { c: [206, 356, 48], hills: [206, 356, 34], pond: { x: 206, z: 356, r: 9, depth: 30 } };   // SHORE v2: smaller (was 70) so open water rings it
// SHORE v2 (Ben: "more water round Pearl Island, randomise every shore, polish the beaches"): noisy shorelines from a few fixed sines (same every load).
const sn = (t, S) => S.reduce((a, [k, ph, w]) => a + w * Math.sin(k * t + ph), 0), sm = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
const LAKE_N = [[2, 0.7, 0.32], [3, 2.1, 0.26], [4, 5.6, 0.18], [5, 4.0, 0.2], [7, 1.3, 0.14], [11, 5.2, 0.08], [17, 3.3, 0.04]], ISLE_N = [[2, 1.9, 0.3], [3, 0.4, 0.3], [5, 2.8, 0.22], [8, 4.4, 0.12], [13, 1.1, 0.06]];
// lake: radius multiplier by angle t (normalised ellipse coords, t = atan2(dz / rz, dx / rx)); the town (north) shore with the jetties + boathouses only wiggles ±3 m
export function lakeM(t) { const s = Math.sin(t), c = Math.cos(t), q = sm(0.15, 0.55, -s) * (1 - sm(0.62, 0.85, Math.abs(c))), A = (0.24 * (1 - q) + 0.03 * q) * (1 - 0.55 * sm(0.8, 0.97, -c)); return 1 + A * sn(t, LAKE_N); }
export function lakeF(x, z) { const [cx, cz, rx, rz] = WATER[0].e, dx = (x - cx) / rx, dz = (z - cz) / rz; return Math.hypot(dx, dz) / lakeM(Math.atan2(dz, dx)); }   // < 1 = in the lake
export const inLake = (x, z) => lakeF(x, z) < 1;
export const lakeShoreD = (x, z) => (1 - lakeF(x, z)) * Math.min(WATER[0].e[2], WATER[0].e[3]);   // ≈ metres to the shore (+ in the water)
export function lakeEdge(t) { const [cx, cz, rx, rz] = WATER[0].e, m = lakeM(t); return [cx + Math.cos(t) * rx * m, cz + Math.sin(t) * rz * m]; }
// island: beyond r 30 from the pond the profile is stretched by islandM(t) (0.75..1.25); calm on the east (jetty) side
export function islandM(t) { const e = 1 - sm(0.2, 0.5, Math.abs(Math.atan2(Math.sin(t), Math.cos(t)))); return 1 + 0.26 * (1 - e) * sn(t, ISLE_N); }
export function islandR(x, z) { const dx = x - ISLAND.pond.x, dz = z - ISLAND.pond.z, r = Math.hypot(dx, dz); return r <= 30 ? r : 30 + (r - 30) / islandM(Math.atan2(dz, dx)); }
export function islandPt(t, rEff) { const r = rEff <= 30 ? rEff : 30 + (rEff - 30) * islandM(t); return [ISLAND.pond.x + Math.cos(t) * r, ISLAND.pond.z + Math.sin(t) * r]; }
// island lathe profile [radius from the pond centre, height]; step 3 part 4 made the hills taller (peak 19 m)
ISLAND.prof = [[0, -22], [ISLAND.pond.r * 0.9, -22], [ISLAND.pond.r, 0.6], [ISLAND.pond.r + 3, 3.5], [16, 10], [23, 17], [29, 14], [34, 5], [38, 1.6], [42, 0.9], [45.5, 0.45], [ISLAND.c[2], 0.12], [ISLAND.c[2] + 2, -0.35], [ISLAND.c[2] + 6, -2]];
export const islandAt = (x, z) => islandH(islandR(x, z));
export function islandH(r) { const p = ISLAND.prof; for (let i = 1; i < p.length; i++) if (r <= p[i][0]) { const [r0, y0] = p[i - 1], [r1, y1] = p[i]; return y0 + (y1 - y0) * (r - r0) / Math.max(1e-3, r1 - r0); } return -2; }

// ---------- step 3 part 4: elevated areas + lighthouses (built by worlds/meru2-heights.js) ----------
// mound: c centre, ridge: a → b axis. r = foot radius, core = flat top radius, h = height. cliff = sheer drop east of x over w m.
export const HILLS = [
  { key: 'falls', label: 'Falls hill', c: [-385, 320], r: 70, core: 26, h: 22, cliff: { x: -347, w: 3 }, falls: { z: 320 }, note: 'old Meru Falls: stream off the lake-side cliff, overlook deck beside it' },
  { key: 'ridge', label: 'Castle Ridge', a: [-290, -430], b: [-130, -430], r: 55, core: 10, h: 26, lookout: [-205, -432] },
  { key: 'ruinsN', label: 'Ruins Hills north', a: [-405, -130], b: [-330, -115], r: 45, core: 8, h: 16, wild: true },
  { key: 'ruinsS', label: 'Ruins Hills south', a: [-405, 125], b: [-330, 110], r: 45, core: 8, h: 13, wild: true },
  { key: 'park', label: 'Hill Park', c: [240, -180], r: 62, core: 18, h: 18, plaza: 14, note: 'skyline view west over the city' },
];
// lantern-lined trails up (path readability rule); ruins hills have none on purpose (wild, creatures up there)
export const TRAILS = [
  { key: 'fallsTrail', p: [[-318, 266], [-360, 262], [-395, 270], [-406, 292], [-392, 305], [-356, 306]] },
  { key: 'ridgeTrail', p: [[-62, -372], [-110, -385], [-150, -400], [-180, -418], [-205, -426]] },
  { key: 'parkTrail', p: [[172, -44], [190, -85], [205, -120], [222, -150], [232, -166]] },
];
// climbable lighthouses: spiral stair round the outside to the lamp gallery. a0 = the stair foot's direction from the centre.
export const LIGHTHOUSES = [
  { key: 'lhFerry', label: 'Ferry Lighthouse', at: [155, 293], base: 1.2, a0: -Math.PI / 2, pier: { r: [153, 157, 224, 288], y: 0.9 }, note: 'end of the Pearl Ferry Dock pier' },
  { key: 'lhPearl', label: 'Pearl Lighthouse', at: islandPt(0.686, 41), a0: Math.atan2(-42, -50), island: true, note: 'Pearl Island south-east beach' },
];

// buildings: footprint, door (world point on the wall) + face, room table (centre, w, d, floor, kind), reverb wish.
export const BUILDINGS = [
  { key: 'tavern', label: 'Tavern', f: [12, 52, -100, -60], door: [32, -60], face: 'S', room: { w: 24, d: 20, floor: 'wood' }, note: 'moved east of the Castle Path in step 2 so the path runs straight north' },
  { key: 'casino', label: 'Casino', f: [-150, -105, -32, 32], door: [-105, 0], face: 'E', room: { w: 30, d: 24, floor: 'rug' }, busy: true },
  { key: 'bowling', label: 'Meru Lanes', f: [105, 150, -38, 10], door: [105, -14], face: 'W', room: { w: 28, d: 30, floor: 'wood' } },
  { key: 'itemshop', label: 'Item Shop', f: [-38, -18, 60, 76], door: [-28, 60], face: 'N', room: { w: 12, d: 10, floor: 'wood' } },
  { key: 'armory', label: 'Armory', f: [18, 38, 60, 76], door: [28, 60], face: 'N', room: { w: 12, d: 10, floor: 'wood' } },
  { key: 'fortune', label: 'Fortune Teller', f: [-86, -74, -60, -48], door: [-80, -48], face: 'S', room: { w: 10, d: 10, floor: 'rug' } },
  { key: 'burgers', hiring: { game: 'meruBurgers', url: 'Meru Burgers.dc.html?embed=1' }, label: 'Burgers', f: [70, 92, 40, 56], door: [70, 48], face: 'W', room: { w: 20, d: 14, floor: 'wood' } },
  { key: 'police', label: 'Police', f: [-110, -62, -125, -80], door: [-86, -80], face: 'S', room: { w: 12, d: 12, floor: 'stone' }, rooms: [{ key: 'jail', w: 20, d: 20, floor: 'stone', at: [-86, -110] }] },
  { key: 'bank', label: 'Bank', f: [62, 110, -125, -80], door: [86, -80], face: 'S', room: { w: 22, d: 20, floor: 'stone' }, reverb: 'marble hall, a little tail' },
  { key: 'carRental', label: 'Car Rental', f: [118, 132, 26, 38], door: [125, 26], face: 'N', room: { w: 10, d: 8, floor: 'wood' }, lot: { r: [134, 156, 22, 44], bays: 6, note: 'rental lot: the rented car waits here and is returned here' } },
  { key: 'crest', label: 'Crestview House', f: [-96, -60, 70, 110], door: [-60, 90], face: 'E', room: { w: 24, d: 24, floor: 'wood' } },
  { key: 'lake', label: 'Lakeside Tower', f: [100, 140, 100, 140], door: [100, 120], face: 'W', room: { w: 24, d: 24, floor: 'wood' }, note: 'step 2b: moved inside the ring road (South Gardens) so the train strip z 160-180 is clear' },
  { key: 'stationTown', label: 'Town Square Station', f: [-20, 20, 112, 132], door: [0, 112], face: 'N', door2: [0, 132], face2: 'S', room: { w: 40, d: 20, floor: 'stone' }, reverb: 'station hall', note: 'through-hall: the Lake Path walks in the north door and out the south door' },
  { key: 'barracks', own: true, label: 'Barracks', f: [-40, 40, -440, -400], door: [0, -400], face: 'S', room: { w: 30, d: 24, floor: 'stone' }, reverb: 'drill hall' },
  { key: 'tankWorks', hiring: { game: 'treadTankWorks', url: 'minigames/34-treads-tank-works/project/Main.dc.html?embed=1' }, label: "Tread's Tank Works", f: [70, 120, -430, -390], door: [70, -410], face: 'W', room: { w: 26, d: 22, floor: 'stone' } },
  { key: 'tankRange', hiring: { game: 'meruTankRange', url: 'Tank Range.dc.html?embed=1' }, label: 'Tank Range hangar', f: [150, 200, -440, -405], door: [175, -405], face: 'S', room: { w: 24, d: 20, floor: 'stone' } },
  { key: 'defense', label: 'Planet Defense Base', f: [225, 255, -445, -415], door: [225, -430], face: 'W', room: { w: 22, d: 14, floor: 'stone' }, note: 'bunker rebuilt 22 x 14 for the 12 m rule; on a 16 m plateau; road gate opens after the Tank Range' },
  { key: 'stationCastle', label: 'Castle Station', f: [-75, -45, -320, -300], door: [-45, -310], face: 'E', room: { w: 30, d: 20, floor: 'stone' } },
  { key: 'skateGate', hiring: { game: 'skatePark', url: 'Skate Park.dc.html?embed=1' }, label: 'Skate Park', f: [-171, -169, -7, 7], door: [-170, 0], face: 'E', room: null, open: true, note: 'open-air park, Tony inside' },
  { key: 'stationRuins', label: 'Skate / Ruins Station', f: [-230, -200, 60, 80], door: [-215, 60], face: 'N', room: { w: 30, d: 20, floor: 'stone' } },
  { key: 'museum', label: 'Ruins Museum', f: [-395, -365, -70, -45], door: [-380, -45], face: 'S', room: { w: 20, d: 20, floor: 'stone' }, reverb: 'old stone hall' },
  { key: 'permit', label: 'Permit Office', f: [-262, -248, -38, -26], door: [-255, -26], face: 'S', room: { w: 12, d: 10, floor: 'wood' } },
  { key: 'cave', label: 'Ruins Cave', f: [-450, -432, -12, 12], door: [-432, 0], face: 'E', room: { w: 34, d: 80, floor: 'grit' }, reverb: 'cave, long tail', note: 'cave mouth in a rock face with broken columns and arches around it' },
  { key: 'blindSchool', hiring: { game: 'meruBlindSchool', url: 'minigames/02-meru-school-for-the-blind/project/Main.dc.html?embed=1', note: 'repo copy (self-contained, own HUD); Hope teaches the class inside the lakeside school' }, label: 'School for the Blind', f: [-250, -190, 170, 205], door: [-220, 205], face: 'S', room: { w: 40, d: 30, floor: 'wood' } },
  { key: 'boatworks', hiring: { game: 'jonBoatworks', url: 'Jon Boatworks.dc.html?embed=1' }, label: "Jon's Boatworks", f: [-130, -95, 205, 230], door: [-112, 205], face: 'N', room: { w: 24, d: 20, floor: 'wood' } },
  { key: 'boathouse', hiring: { game: 'meruSpeedboatBay', url: 'Speedboat Bay.dc.html?embed=1' }, label: 'Speedboat Bay boathouse', f: [60, 90, 205, 228], door: [75, 205], face: 'N', room: { w: 22, d: 20, floor: 'wood' } },
  { key: 'stationLake', label: 'Lake Station', f: [-60, -30, 180, 198], door: [-45, 180], face: 'N', room: { w: 30, d: 20, floor: 'stone' } },
  { key: 'ferryDock', label: 'Pearl Ferry Dock', f: [140, 170, 205, 225], door: [155, 205], face: 'N', room: null },
  { key: 'stationPearl', label: 'Pearl Dock Station', f: [180, 210, 180, 198], door: [180, 189], face: 'W', room: { w: 30, d: 20, floor: 'stone' } },
  { key: 'stationArena', label: 'Arena Station', f: [380, 410, 70, 90], door: [395, 70], face: 'N', room: { w: 30, d: 20, floor: 'stone' } },
];
// the train loop + its 6 stops (station keys above); cars only on ROADS, never on the foot paths.
export const TRAIN = { stops: ['stationTown', 'stationPearl', 'stationArena', 'stationCastle', 'stationRuins', 'stationLake'],
  // stop c = platform centre on the line, lift = where the street lift sits along the platform (m). Platforms are 64 m, on the station side.
  stopAt: { stationTown: { c: [58, 150], lift: -26 }, stationPearl: { c: [195, 168], lift: 0 }, stationArena: { c: [395, 103], lift: 0 }, stationCastle: { c: [-60, -332], lift: 0 }, stationRuins: { c: [-215, 96], lift: 10 }, stationLake: { c: [-45, 168], lift: 13 } },
  prices: { day: 10, week: 50, month: 150, draft: true }, days: { day: 1, week: 7, month: 30 },
  // step 2b loop (clockwise): straight runs through every platform; Town sits over the ring road's centre median
  line: [[26, 150], [90, 150], [125, 160], [163, 168], [227, 168], [300, 118], [363, 103], [427, 103], [443, 80], [444, 40], [444, -290], [420, -332], [300, -332], [-28, -332], [-92, -332], [-240, -332], [-272, -305], [-275, 60], [-262, 92], [-247, 96], [-183, 96], [-140, 120], [-105, 162], [-77, 168], [-13, 168]] };
export const TAXI = { base: 2, perM: 1 / 80, draft: true };
// step 5: THE LAKE (built by worlds/meru2-lake.js). Jetties = wooden decks on piles (y = deck height), railed except the land end;
// gaps = open rail (walk off / climb out). The speedboat (engine/vehicle-fun.js model) replaces the old rowboat. Ben (step 5): FREE,
// a FREE RENTAL TODAY! sign on the jetty, no talking needed: walk up and drive. gate = the Speedboat Bay course start (drive through + E).
export const LAKE = {
  jetties: [
    { key: 'bayJetty', label: 'Speedboat Bay jetty', r: [72, 78, 230, 262], y: 0.9, open: ['N', 'S'], gaps: [{ side: 'E', at: 252, w: 7 }, { side: 'W', at: 246 }] },
    { key: 'bayEnd', r: [62, 78, 262, 268], y: 0.9, gaps: [{ side: 'N', at: 75, w: 6, join: true }, { side: 'S', at: 66 }, { side: 'E', at: 265 }] },
    { key: 'worksJetty', label: "Boatworks jetty", r: [-127, -121, 232, 264], y: 0.9, open: ['N'], gaps: [{ side: 'E', at: 256 }, { side: 'S', at: -124 }] },
    // step 6: the Pearl Island ferry jetty (east beach); the ferry moors on its south side
    { key: 'islandJetty', label: 'Pearl Island jetty', r: [249, 272, 348, 352], y: 1.2, open: ['W'], gaps: [{ side: 'S', at: 266, w: 9 }, { side: 'N', at: 257 }] },
  ],
  // step 6: THE FERRY. Free (DRAFT). Shuttles Pearl Ferry Dock pier (east side) ↔ Pearl Island jetty on a loop round the north of the island.
  ferry: { path: [[161.5, 256], [161.5, 266], [175, 272], [230, 272], [278, 292], [294, 325], [292, 345], [277, 356.4], [266, 356.4]], dwell: 20, speed: 7, accel: 1.4, draft: true,
    stops: [{ key: 'dock', label: 'Pearl Ferry Dock', off: [156.2, 256, 0.9, -Math.PI / 2] }, { key: 'island', label: 'Pearl Island', off: [266, 350.4, 1.2, Math.PI] }] },
  // step 6: Pearl Island. The deep pond dive = Meru Pearl Dive.dc.html (the Jidda Deep Dive engine, theme 'meru'). Trail = lanterns from the jetty up to the pond.
  island: { dive: { label: 'THE DEEP POND', url: 'Meru Pearl Dive.dc.html?embed=1' }, trail: [[251, 350], [242, 352], [232, 356], [222, 360], [216, 364]], shack: islandPt(-2.85, 39), palms: 30 },
  boat: { moor: [80.8, 252, 0], free: true, sign: 'FREE RENTAL TODAY!' },
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
  skate: { rect: [-240, -170, -50, 44], openE: [-7, 7], openW: [-7, 7], openS: [-224, -196],
    bowl: { cx: -218, cz: -27, r0: 4.5, R: 4.2, H: 2.2, deck: 2.5, ramp: 6.3 },
    pipe: { x0: -232, x1: -196, cz: 26, flat: 3, R: 4.2, H: 2.2, deck: 2.5 },
    fun: { cx: -184, cz: -30, hw: 5, hd: 4, h: 1 },
    ledges: [[-186, -176, -16, -14.6, 0.5], [-200, -190, -46, -44.6, 0.5]], pad: [-186, -174, 8, 11, 0.3],
    rails: [[-205, -40, -190, -40, 0.55], [-186, 16, -174, 16, 0.55]],
    stairs: { x0: -192, x1: -174, z0: 25.2, run: 1.2, steps: 4, rise: 0.3, z1: 42 },
    rack: [-196, -16], masts: [[-236, -46], [-174, -46], [-236, 40], [-174, 40]], board: { max: 12, push: 7 } },
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
  { key: 'castleGuard1', tier: 2, at: [-8, -330] }, { key: 'castleGuard2', tier: 2, at: [12, -342] },
  { key: 'zadie', tier: 1, at: [-14, -230], draft: true }, { key: 'nash', tier: 1, at: [14, -180], draft: true },
  { key: 'defGuard1', tier: 2, at: [218, -425] }, { key: 'defGuard2', tier: 2, at: [218, -441] },
  // arena path: three clearings, 40 m quiet road between
  { key: 'james', tier: 1, at: [170, -10], draft: true }, { key: 'lucius', tier: 1, at: [190, 12], draft: true },
  { key: 'arenaStall2', tier: 2, at: [270, 12], draft: true, newAvatar: true },
  { key: 'arenaStall3', tier: 2, at: [330, -10], draft: true, newAvatar: true },
  { key: 'arenaGate', tier: 2, at: [354, 12], draft: true, newAvatar: true },
  // step 4: the old Arena Path crowd (worlds/meru-arenapath.js), stall rows at z -24 / +26, mid-road at -10 / +12 (all ≥ 16 m)
  { key: 'torv', tier: 1, at: [210, -10] }, { key: 'odo', tier: 1, at: [290, -10], note: 'bookmaker, odds board' }, { key: 'tam', tier: 1, at: [230, 12] }, { key: 'rosk', tier: 1, at: [310, 12], note: 'juggler' },
  { key: 'marla', tier: 1, at: [180, -24], note: 'ribbon stall' }, { key: 'pell', tier: 1, at: [220, -24], note: 'pie stall' }, { key: 'sela', tier: 1, at: [260, -24], note: 'flower stall' }, { key: 'wren', tier: 1, at: [300, -24] },
  { key: 'ivy', tier: 1, at: [200, 26], note: 'fruit stall' }, { key: 'hetty', tier: 1, at: [240, 26], note: 'fish stall' }, { key: 'arenaGuard2', tier: 2, at: [280, 26] },
  { key: 'arenaRoadGuard1', tier: 2, at: [340, -24] }, { key: 'arenaRoadGuard2', tier: 2, at: [340, 26] }, { key: 'arenaGuard1', tier: 2, at: [356, -12] }, { key: 'vance', tier: 1, at: [372, 0], note: 'Arena Official, inside the arena gate' },
  // ruins
  { key: 'spade', tier: 1, at: [-255, -18] }, { key: 'ruinsGuard', tier: 2, at: [-320, 6] }, { key: 'sage', tier: 1, at: [-380, -36] },
  // skate park
  { key: 'tony', tier: 1, at: [-190, -20], note: 'Skate Park coach' },
  // lake + island
  { key: 'fisherwoman', tier: 1, at: [-20, 236] }, { key: 'fisherman', tier: 1, at: [96, 232], note: 'boat hire → speedboat' },
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
  { key: 'rentalClerk', tier: 1, at: { room: 'carRental', x: 0, z: -2 }, newAvatar: true },
  { key: 'ticketClerk', tier: 1, at: { room: 'stationTown', x: -10, z: 0 }, newAvatar: true }, { key: 'trainConductor', tier: 1, at: { room: 'train', x: 0, z: 0 }, newAvatar: true },
  { key: 'aptRealCrest', tier: 1, at: { room: 'crest', x: 0, z: -6 } }, { key: 'aptRealLake', tier: 1, at: { room: 'lake', x: 0, z: -6 } },
  { key: 'barracksGuardCaptain', tier: 1, at: { room: 'barracks', x: -8, z: 0 } }, { key: 'barracksMasterOfArms', tier: 1, at: { room: 'barracks', x: 8, z: 6 } },
  { key: 'tread', tier: 1, at: { room: 'tankWorks', x: 0, z: -6 }, note: 'Sgt. Tread: Tank Works + Tank Range' },
  { key: 'defTech1', tier: 1, at: { room: 'defense', x: -7, z: -3 } }, { key: 'defTech2', tier: 2, at: { room: 'defense', x: 7, z: 3 } },
  { key: 'mike', tier: 1, at: { room: 'barracks', x: 0, z: -10 }, note: 'King Might, throne scene' },
];

// ---------- the checklist ----------
const inR = (r, x, z) => x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3];
const inC = (c, x, z) => Math.hypot(x - c[0], z - c[1]) <= c[2];
export function surfaceAt(x, z) { let s = 'grass'; for (const S of SURFACES) if (S.r ? inR(S.r, x, z) : inC(S.c, x, z)) s = S.s; return s; }
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
  { kind: 'rat', x: -290, z: -60 }, { kind: 'rat', x: -345, z: 62 }, { kind: 'bat', x: -310, z: -22 }, { kind: 'bat', x: -365, z: 20 }, { kind: 'bat', x: -300, z: 40 }, { kind: 'bat', x: -385, z: -14 }] };
