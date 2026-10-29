// Blind Canvas gallery: the cherry blossom garden's layout (shared by the scenery, which draws it, and the game, which
// makes it solid). A raised lawn terrace level with the welcome plaza, east of it where the lake used to be.
export const GARDEN = { x0: -12.4, x1: 92, z0: -58, z1: 58, y: 0, plaza: { x0: -13.2, x1: 7.3, z: 13.6 } };
export const RING = { x: 40, z: 0, r: 21 };   // the ring path: the name sign arches over its west end, the flags stand just outside it, either side of the way to the museum
// the park campus (4 Oct): you start beside the big tree facing the museum; BLIND CAN CINEMA behind you (east), the WHY House on
// your left (north), the Academy of Music for the Blind on your right (south); two Hope pools either side of the walk to the museum
export const CAMPUS = {
  spawn: { x: 44.7, z: 0, face: -Math.PI / 2 },   // (28 Oct, Ben) on the start platform's red ring, centred under the BLIND CANVAS PROJECT logo, in line with the main walk, facing the eye
    // (22 Oct: back on the welcome plaza, the old start platform, facing the museum's eye)
  parkStop: { x: 37.5, z: 0, face: -Math.PI / 2 },   // where 'the park' takes you (27 Oct: up on the start platform, facing the eye)
  why: { x0: 31, x1: 49, z0: 25, z1: 41 },                  // the WHY House (door on its south face, towards the tree)
  amb: { x0: 30.6, x1: 49.4, z0: -57.4, z1: -23.6, O: [40, 0, -24] },   // the AMB building (a buildWing room; door on its north face)
  cinema: { x0: 74, x1: 92, z0: -11, z1: 11 },   // (Ben, 27 Oct: 2 m deeper for a bigger lobby)              // BLIND CAN CINEMA (door on its west face)
  amb2: { x0: 49.4, x1: 69.8, z0: -48.4, z1: -31.6 },           // the AMB's stage room (22 Oct), through a doorway in the main room's east wall
  pools: [{ x: 13.5, z: 4.75, yaw: 0 }, { x: 13.5, z: -4.75, yaw: Math.PI }],   // (where the two Hope pools stood when the garden was laid out: kept so its layout doesn't reshuffle)
  hope: [{ x: 13.5, z: 6.2, yaw: Math.PI / 2 }],   // (22 Oct) 'Hope Floating in Braille' now: one pool, north of the walk, turned to face the museum's eye
  flags: [[22.32, -17.68, 'bcp'], [22.32, 17.68, 'ora']],   // (11 Oct: just outside the ring path, not on it)
  oldFlags: [[25.15, -14.85], [25.15, 14.85]],   // (where they stood: the trees and lanterns were laid out round these; kept so that layout doesn't reshuffle)
};
const inRect = (x, z, r, m = 0) => x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m;
export const onCampus = (x, z, m = 0) => inRect(x, z, CAMPUS.why, m) || inRect(x, z, CAMPUS.amb, m) || inRect(x, z, { x0: CAMPUS.cinema.x0 - 3.2, x1: CAMPUS.cinema.x1, z0: CAMPUS.cinema.z0, z1: CAMPUS.cinema.z1 }, m)
  || CAMPUS.pools.some(p => Math.abs(x - p.x) < 4.2 + m && Math.abs(z - p.z) < 0.6 + 2.8 + m && Math.sign(z) === Math.sign(p.z));
export const inBuilding = (x, z, m = 0) => onCampus(x, z, m) || inRect(x, z, CAMPUS.amb2, m);   // (onCampus is the original set: the garden's layout was planned round it)
let cache = null;
const CHESS_TREE = [67.3, 36.2], G0 = GARDEN;
export function planGarden() {
  if (cache) return cache;
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const ring = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; ring.push([RING.x + Math.cos(a) * RING.r, RING.z + Math.sin(a) * RING.r]); }
  const paths = [
    { w: 3.6, pts: [[7.3, 0], [RING.x - RING.r, 0]] },                                          // from the plaza, under the sign, between the Hope pools
    { w: 3.0, pts: ring },                                                                       // the ring
    { w: 2.6, pts: [[29.5, 18.2], [25, 27], [18, 40], [8, 46], [-6, 50]] },                     // north walk (round the WHY House)
    { w: 2.6, pts: [[29.5, -18.2], [25, -27], [18, -40], [8, -46], [-6, -50]] },                // south walk (round the AMB building)
    { w: 3.6, pts: [[RING.x + RING.r, 0], [CAMPUS.cinema.x0, 0]] },                              // east walk to BLIND CAN CINEMA
    { w: 6.0, pts: [[RING.x, RING.r], [RING.x, CAMPUS.why.z0 + 0.2]] },                           // the WHY House's forecourt
    { w: 9.0, pts: [[RING.x, -RING.r], [RING.x, CAMPUS.amb.z1 - 0.2]] },                          // the AMB forecourt
    { w: 12.0, pts: [[CAMPUS.cinema.x0 - 3.6, 0], [CAMPUS.cinema.x0, 0]] },                      // the cinema's forecourt, under the marquee
  ];
  // the dry river of fallen petals: a soft curve running north–south through the garden, crossing the east walk
  const river = []; for (let i = 0; i <= 40; i++) { const t = i / 40, z = -56 + t * 112; river.push([60 + Math.sin(t * Math.PI * 2.2) * 6, z]); }
  const segDist = (px, pz, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L)); return Math.hypot(px - ax - dx * t, pz - az - dz * t); };
  const pathDist = (x, z) => { let d = 1e9; for (const p of paths) for (let i = 0; i < p.pts.length - 1; i++) d = Math.min(d, segDist(x, z, p.pts[i], p.pts[i + 1]) - p.w / 2); return d; };
  const riverDist = (x, z) => { let d = 1e9; for (let i = 0; i < river.length - 1; i++) d = Math.min(d, segDist(x, z, river[i], river[i + 1])); return d; };
  const inPlaza = (x, z) => x < 9 && Math.abs(z) < 15.5;
  // lanterns along the walks, benches round the ring facing the centre tree
  const lanterns = [], benches = [];
  for (const p of paths) { let acc = 6, side = 1; for (let i = 0; i < p.pts.length - 1; i++) { const [ax, az] = p.pts[i], [bx, bz] = p.pts[i + 1], L = Math.hypot(bx - ax, bz - az); for (; acc < L; acc += 11) { const t = acc / L, x = ax + (bx - ax) * t, z = az + (bz - az) * t, nx = -(bz - az) / L, nz = (bx - ax) / L, off = p.w / 2 + 1.1;
    const lx = x + nx * off * side, lz = z + nz * off * side; side = -side; if (!inPlaza(lx, lz) && !onCampus(lx, lz, 1.2) && !(lx > 64 && Math.abs(lz) < 9) && CAMPUS.oldFlags.every(f => Math.hypot(lx - f[0], lz - f[1]) > 4) && !(Math.abs(lx - 21) < 2 && Math.abs(Math.abs(lz) - 7) < 2)) lanterns.push([lx, lz]); } acc -= L; } }
  for (const a of [0.55, 1.35, 2.35, 3.93, 4.3, 5.6])   // (Ben, 28 Oct) 4.71 stood right on the line from the AMB door: moved west, off it
  { const r = RING.r - 2.6; benches.push([RING.x + Math.cos(a) * r, RING.z + Math.sin(a) * r, Math.atan2(-Math.cos(a), -Math.sin(a))]); }
  // the trees: a big old one in the middle of the ring, then many round the walks
  const trees = [[RING.x, RING.z, 19, true]];
  for (let tries = 0; trees.length < 78 && tries < 9000; tries++) {
    const x = -10 + rnd() * 100, z = -56 + rnd() * 112;
    if (inPlaza(x, z) || pathDist(x, z) < 2.6 || riverDist(x, z) < 3.2 || onCampus(x, z, 3.5) || CAMPUS.oldFlags.some(f => Math.hypot(x - f[0], z - f[1]) < 4)) continue;
    if (Math.hypot(x - RING.x, z - RING.z) < RING.r - 3.5) continue;                      // keep the court round the big tree open
    if (Math.abs(x - 21) < 3 && Math.abs(z) < 12) continue;                               // the sign
    if (trees.some(t => Math.hypot(t[0] - x, t[1] - z) < 6.2) || lanterns.some(l => Math.hypot(l[0] - x, l[1] - z) < 2.5) || benches.some(b => Math.hypot(b[0] - x, b[1] - z) < 3)) continue;
    trees.push([x, z, 8.5 + rnd() * 5.5, false]);
  }
  // (the stage room came later: clear what stands where it was built, without reshuffling the rest of the garden)
  const clearOf = (x, z, m) => !inRect(x, z, CAMPUS.amb2, m);
  for (const arr of [lanterns, trees]) for (let i = arr.length - 1; i >= 0; i--) if (!clearOf(arr[i][0], arr[i][1], arr === trees ? 3.5 : 1.2)) arr.splice(i, 1);
  // (27 Oct, park polish) fewer cherry trees: the big ring tree and the chess tree stay, then every other tree keeps 9.5 m clear of the kept ones
  { const keep = [trees[0]], chessT = trees.find(t => Math.hypot(t[0] - CHESS_TREE[0], t[1] - CHESS_TREE[1]) < 0.5); if (chessT) keep.push(chessT);
    for (const t of trees) if (!keep.includes(t) && keep.every(k => Math.hypot(k[0] - t[0], k[1] - t[1]) >= 9.5)) keep.push(t);
    trees.length = 0; trees.push(...keep); }
  // (27 Oct, Ben) a clear eyeline from the cinema to the museum's eye: the big ring tree goes (a low start platform stands there now),
  // and no tree stands in the long view down the main walk or in front of the cinema; a few cherry trees frame the cinema's sides instead
  { const view = (x, z) => (x > 5 && x < 76 && Math.abs(z) < 13) || (x > 58 && x < 76 && Math.abs(z) < 17);
    for (let i = trees.length - 1; i >= 0; i--) if (i === 0 || view(trees[i][0], trees[i][1])) trees.splice(i, 1);
    for (const [x, z, sc] of [[71.5, 15.5, 12], [71.5, -15.5, 12.5], [77.5, 15.2, 10.5], [77.5, -15.2, 11], [66.5, 19.5, 9.5], [66.5, -19.5, 10]]) {
      if (pathDist(x, z) < 1.4 || trees.some(t => Math.hypot(t[0] - x, t[1] - z) < 5)) continue; trees.push([x, z, sc, false]); } }
  // (27 Oct) light poles with BLIND CANVAS PROJECT banners along the walks (Meru's banner poles + a lamp on top): [x, z, ry]
  const poles = [];
  for (const p of paths) { if (p.w > 5) continue; let acc = 4, side = 1; for (let i = 0; i < p.pts.length - 1; i++) { const [ax, az] = p.pts[i], [bx, bz] = p.pts[i + 1], L = Math.hypot(bx - ax, bz - az); for (; acc < L; acc += 9) { const t = acc / L, x = ax + (bx - ax) * t, z = az + (bz - az) * t, nx = -(bz - az) / L, nz = (bx - ax) / L, off = p.w / 2 + 1.5;
    const lx = x + nx * off * side, lz = z + nz * off * side; side = -side;
    if (inPlaza(lx, lz) || onCampus(lx, lz, 1.5) || !clearOf(lx, lz, 1.5) || (lx > 64 && Math.abs(lz) < 9) || lx < G0.x0 + 2 || lx > G0.x1 - 2 || Math.abs(lz) > G0.z1 - 2) continue;
    if (CAMPUS.oldFlags.some(f => Math.hypot(lx - f[0], lz - f[1]) < 4) || CAMPUS.flags.some(f => Math.hypot(lx - f[0], lz - f[1]) < 4) || (Math.abs(lx - 21) < 3 && Math.abs(lz) < 12)) continue;
    if (Math.hypot(lx - CHESS_TREE[0], lz - CHESS_TREE[1] + 2) < 7 || trees.some(tr => Math.hypot(tr[0] - lx, tr[1] - lz) < 2.2) || lanterns.some(l => Math.hypot(l[0] - lx, l[1] - lz) < 2.2) || benches.some(b => Math.hypot(b[0] - lx, b[1] - lz) < 2.6) || poles.some(q => Math.hypot(q[0] - lx, q[1] - lz) < 7)) continue;
    poles.push([lx, lz, Math.atan2(bx - ax, bz - az)]); } acc -= L; } }
  // (27 Oct, Ben) the poles step out of the eyeline: none in the long view down the main walk; instead an avenue of them stands
  // well to each side (z ±10), and EVERY banner faces down the walk, so you read them looking at the eye or at the cinema
  for (let i = poles.length - 1; i >= 0; i--) { const [x, z] = poles[i]; if (x > 6 && x < 76 && Math.abs(z) < 9.5) poles.splice(i, 1); }
  for (const x of [11, 17, 26, 33, 47, 54, 64, 70]) for (const z of [-10, 10]) {
    if (pathDist(x, z) < 0.9 || trees.some(t => Math.hypot(t[0] - x, t[1] - z) < 2.2) || benches.some(b => Math.hypot(b[0] - x, b[1] - z) < 2.6) || poles.some(q => Math.hypot(q[0] - x, q[1] - z) < 5)) continue;
    poles.push([x, z, 0]); }
  for (const q of poles) q[2] = Math.PI / 2;
  // (27 Oct, Ben) the little grey stone lanterns REMOVED for a calmer park (still placed above so trees + poles keep their spots)
  // (s22, Ben) a straight walk from the start platform west to the main walkway (added last, so nothing already placed moves)
  paths.push({ w: 3.6, pts: [[RING.x - RING.r, 0], [RING.x - 6.0, 0]] });
  cache = { paths, river, lanterns: [], benches, trees, poles, pathDist, riverDist };
  return cache;
}
