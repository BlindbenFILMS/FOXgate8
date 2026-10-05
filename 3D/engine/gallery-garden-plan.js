// Blind Canvas gallery: the cherry blossom garden's layout (shared by the scenery, which draws it, and the game, which
// makes it solid). A raised lawn terrace level with the welcome plaza, east of it where the lake used to be.
export const GARDEN = { x0: -12.4, x1: 92, z0: -58, z1: 58, y: 0, plaza: { x0: -13.2, x1: 7.3, z: 13.6 } };
export const RING = { x: 40, z: 0, r: 21 };   // the ring path: the name sign arches over its west end, the flags stand on it either side of the way to the museum
// the park campus (4 Oct): you start beside the big tree facing the museum; BLIND CAN CINEMA behind you (east), the WHY House on
// your left (north), the Academy of Music for the Blind on your right (south); two Hope pools either side of the walk to the museum
export const CAMPUS = {
  spawn: { x: 33.5, z: 0, face: -Math.PI / 2 },
  why: { x0: 31, x1: 49, z0: 25, z1: 41 },                  // the WHY House (door on its south face, towards the tree)
  amb: { x0: 30.6, x1: 49.4, z0: -57.4, z1: -23.6, O: [40, 0, -24] },   // the AMB building (a buildWing room; door on its north face)
  cinema: { x0: 74, x1: 90, z0: -11, z1: 11 },              // BLIND CAN CINEMA (door on its west face)
  pools: [{ x: 13.5, z: 4.75, yaw: 0 }, { x: 13.5, z: -4.75, yaw: Math.PI }],   // 'Hope Floating in Braille', either side of the walk
  flags: [[25.15, -14.85, 'bcp'], [25.15, 14.85, 'ora']],
};
const inRect = (x, z, r, m = 0) => x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m;
export const onCampus = (x, z, m = 0) => inRect(x, z, CAMPUS.why, m) || inRect(x, z, CAMPUS.amb, m) || inRect(x, z, { x0: CAMPUS.cinema.x0 - 3.2, x1: CAMPUS.cinema.x1, z0: CAMPUS.cinema.z0, z1: CAMPUS.cinema.z1 }, m)
  || CAMPUS.pools.some(p => Math.abs(x - p.x) < 4.2 + m && Math.abs(z - p.z) < 0.6 + 2.8 + m && Math.sign(z) === Math.sign(p.z));
let cache = null;
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
    const lx = x + nx * off * side, lz = z + nz * off * side; side = -side; if (!inPlaza(lx, lz) && !onCampus(lx, lz, 1.2) && !(lx > 64 && Math.abs(lz) < 9) && CAMPUS.flags.every(f => Math.hypot(lx - f[0], lz - f[1]) > 4) && !(Math.abs(lx - 21) < 2 && Math.abs(Math.abs(lz) - 7) < 2)) lanterns.push([lx, lz]); } acc -= L; } }
  for (const a of [0.55, 1.35, 2.35, 3.93, 4.71, 5.6]) { const r = RING.r - 2.6; benches.push([RING.x + Math.cos(a) * r, RING.z + Math.sin(a) * r, Math.atan2(-Math.cos(a), -Math.sin(a))]); }
  // the trees: a big old one in the middle of the ring, then many round the walks
  const trees = [[RING.x, RING.z, 19, true]];
  for (let tries = 0; trees.length < 78 && tries < 9000; tries++) {
    const x = -10 + rnd() * 100, z = -56 + rnd() * 112;
    if (inPlaza(x, z) || pathDist(x, z) < 2.6 || riverDist(x, z) < 3.2 || onCampus(x, z, 3.5) || CAMPUS.flags.some(f => Math.hypot(x - f[0], z - f[1]) < 4)) continue;
    if (Math.hypot(x - RING.x, z - RING.z) < RING.r - 3.5) continue;                      // keep the court round the big tree open
    if (Math.abs(x - 21) < 3 && Math.abs(z) < 12) continue;                               // the sign
    if (trees.some(t => Math.hypot(t[0] - x, t[1] - z) < 6.2) || lanterns.some(l => Math.hypot(l[0] - x, l[1] - z) < 2.5) || benches.some(b => Math.hypot(b[0] - x, b[1] - z) < 3)) continue;
    trees.push([x, z, 8.5 + rnd() * 5.5, false]);
  }
  cache = { paths, river, lanterns, benches, trees, pathDist, riverDist };
  return cache;
}
