// Blind Canvas gallery: the cherry blossom garden's layout (shared by the scenery, which draws it, and the game, which
// makes it solid). A raised lawn terrace level with the welcome plaza, east of it where the lake used to be.
export const GARDEN = { x0: -12.4, x1: 92, z0: -58, z1: 58, y: 0, plaza: { x0: -13.2, x1: 7.3, z: 13.6 } };
export const RING = { x: 40, z: 0, r: 21 };   // the ring path: the name sign arches over its west end, the flags stand on it north and south
let cache = null;
export function planGarden() {
  if (cache) return cache;
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const ring = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; ring.push([RING.x + Math.cos(a) * RING.r, RING.z + Math.sin(a) * RING.r]); }
  const paths = [
    { w: 3.6, pts: [[7.3, 0], [RING.x - RING.r, 0]] },                                          // from the plaza, under the sign
    { w: 3.0, pts: ring },                                                                       // the ring
    { w: 2.6, pts: [[RING.x, RING.r], [32, 34], [18, 44], [2, 49], [-6, 50]] },                  // north walk
    { w: 2.6, pts: [[RING.x, -RING.r], [32, -34], [18, -44], [2, -49], [-6, -50]] },             // south walk
    { w: 2.8, pts: [[RING.x + RING.r, 0], [62, 3], [74, -2], [83, 0]] },                         // east walk to the overlook
  ];
  // the dry river of fallen petals: a soft curve running north–south through the garden, crossing the east walk
  const river = []; for (let i = 0; i <= 40; i++) { const t = i / 40, z = -56 + t * 112; river.push([66 + Math.sin(t * Math.PI * 2.2) * 7, z]); }
  const segDist = (px, pz, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L)); return Math.hypot(px - ax - dx * t, pz - az - dz * t); };
  const pathDist = (x, z) => { let d = 1e9; for (const p of paths) for (let i = 0; i < p.pts.length - 1; i++) d = Math.min(d, segDist(x, z, p.pts[i], p.pts[i + 1]) - p.w / 2); return d; };
  const riverDist = (x, z) => { let d = 1e9; for (let i = 0; i < river.length - 1; i++) d = Math.min(d, segDist(x, z, river[i], river[i + 1])); return d; };
  const inPlaza = (x, z) => x < 9 && Math.abs(z) < 15.5;
  // lanterns along the walks, benches round the ring facing the centre tree
  const lanterns = [], benches = [];
  for (const p of paths) { let acc = 6, side = 1; for (let i = 0; i < p.pts.length - 1; i++) { const [ax, az] = p.pts[i], [bx, bz] = p.pts[i + 1], L = Math.hypot(bx - ax, bz - az); for (; acc < L; acc += 11) { const t = acc / L, x = ax + (bx - ax) * t, z = az + (bz - az) * t, nx = -(bz - az) / L, nz = (bx - ax) / L, off = p.w / 2 + 1.1;
    const lx = x + nx * off * side, lz = z + nz * off * side; side = -side; if (!inPlaza(lx, lz) && Math.hypot(lx - 40, lz + 21) > 4 && Math.hypot(lx - 40, lz - 21) > 4 && !(Math.abs(lx - 21) < 2 && Math.abs(Math.abs(lz) - 7) < 2)) lanterns.push([lx, lz]); } acc -= L; } }
  for (const a of [0.55, 1.35, 2.35, 3.93, 4.71, 5.6]) { const r = RING.r - 2.6; benches.push([RING.x + Math.cos(a) * r, RING.z + Math.sin(a) * r, Math.atan2(-Math.cos(a), -Math.sin(a))]); }
  // the trees: a big old one in the middle of the ring, then many round the walks
  const trees = [[RING.x, RING.z, 19, true]];
  for (let tries = 0; trees.length < 78 && tries < 9000; tries++) {
    const x = -10 + rnd() * 100, z = -56 + rnd() * 112;
    if (inPlaza(x, z) || pathDist(x, z) < 2.6 || riverDist(x, z) < 3.2) continue;
    if (Math.hypot(x - RING.x, z - RING.z) < RING.r - 3.5) continue;                      // keep the court round the big tree open
    if (Math.abs(x - 21) < 3 && Math.abs(z) < 12) continue;                               // the sign
    if (trees.some(t => Math.hypot(t[0] - x, t[1] - z) < 6.2) || lanterns.some(l => Math.hypot(l[0] - x, l[1] - z) < 2.5) || benches.some(b => Math.hypot(b[0] - x, b[1] - z) < 3)) continue;
    trees.push([x, z, 8.5 + rnd() * 5.5, false]);
  }
  cache = { paths, river, lanterns, benches, trees, pathDist, riverDist };
  return cache;
}
