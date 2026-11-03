// 8 GATES — the DEEP DIVE seabed as a pure function (no three.js), shared by minigames/jidda/deep-dive.js and
// worlds/meru2-layout.js (s184 PEARL VALLEY: the Meru dive map sits in a crater on Pearl Island; Meru walks its beach + swims its surface).
// Engine units: x across, z = away from the boat / raft (deeper), y = 0 at the water surface.
const ss = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const lerp = (a, b, k) => a + (b - a) * k;
export function diveFloor(x, z) { const shelf = -9 - 2 * Math.sin(x * 0.12) * Math.sin(z * 0.1), slope = -26 - 3 * Math.sin(x * 0.09 + z * 0.05), abyss = -54 - 4 * Math.sin(x * 0.07) - 6 * ss(25, 55, Math.abs(x)) * -1; let y = lerp(shelf, slope, ss(30, 60, z)); y = lerp(y, abyss, ss(100, 125, z)); y += 10 * ss(28, 60, Math.abs(x)) * ss(90, 120, z); return y; }
// PEARL VALLEY walls: the seabed climbs to T (just under the crater rim) at |x| 46, z 188 (Nelly's den end) and up a beach at the raft end (z -30).
export const POND_WALL = { T: 4.2, x0: 40, x1: 46, ze0: 180, ze1: 188, zb0: -2, zb1: -30, ez0: 79 };
export function diveFloorWorld(x, z, W = POND_WALL) { const y = diveFloor(x, z), k = Math.max(ss(W.x0, W.x1, Math.abs(x)), ss(W.ze0, W.ze1, z), ss(W.zb0, W.zb1, z)); return y + (W.T - y) * k; }
