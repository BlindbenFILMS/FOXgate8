// MERU 2.0 — BACKROOMS 1: the TAVERN CELLAR. A trapdoor behind the east end of the bar opens onto a wooden stair down to a stone cellar
// under the tavern: giant tuns on cradles, a keg pyramid, wine racks, a copper brew kettle + mash tun, grain sacks, crates, brick arches,
// hanging lanterns, a chalk tally board (no text) and a mouse hole with a cheese wedge.
// No hole is cut in any floor: the cellar draws FIRST (renderOrder -2), then an invisible depth-only quad over the opening (renderOrder -1)
// stops every floor drawn after it from covering the stairwell. The room is a BackSide box, so the follow camera sees in through any wall.
// The player draws early too (walk sets renderOrder -2) so you stay visible on the stairs.
import { makeRoomKit } from './meru2-roomkit.js';

export const CELLAR = { x0: 30.3, x1: 51.7, z0: -99.7, z1: -86.3, y: -3.2, top: -0.15, stair: { x0: 41, x1: 46, z0: -99.3, z1: -97.1 } };

export function buildCellar({ THREE, scene, cols, touch }) {
  const C = CELLAR, S = C.stair, H = C.top - C.y, cx = (C.x0 + C.x1) / 2, cz = (C.z0 + C.z1) / 2, G = new THREE.Group(); scene.add(G);
  const K = makeRoomKit({ THREE, touch }), b = K.Bin();
  // shell: stone walls + vault (BackSide box), flagstone floor
  const stone = K.CT(256, 256, (g, w) => { g.fillStyle = '#6b6258'; g.fillRect(0, 0, w, w); for (let r = 0; r < 8; r++) { const o = r % 2 ? 0 : 32; for (let i = -1; i < 5; i++) { const k = 0.8 + Math.random() * 0.3; g.fillStyle = `rgb(${120 * k | 0},${110 * k | 0},${98 * k | 0})`; g.fillRect(i * 64 + o + 2, r * 32 + 2, 60, 28); } }
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(40,60,30,0.18)'; g.beginPath(); g.arc(Math.random() * w, w - Math.random() * 60, 4 + Math.random() * 10, 0, 7); g.fill(); } });
  stone.wrapS = stone.wrapT = THREE.RepeatWrapping; stone.repeat.set((C.x1 - C.x0) / 3, H / 3);
  const shell = new THREE.Mesh(new THREE.BoxGeometry(C.x1 - C.x0, H, C.z1 - C.z0), new THREE.MeshLambertMaterial({ map: stone, side: THREE.BackSide, color: 0xb8aca0 })); shell.position.set(cx, C.y + H / 2, cz); G.add(shell);
  const flag = K.CT(128, 128, (g, w) => { g.fillStyle = '#4a443e'; g.fillRect(0, 0, w, w); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const k = 0.85 + Math.random() * 0.25; g.fillStyle = `rgb(${110 * k | 0},${102 * k | 0},${92 * k | 0})`; g.fillRect(i * 64 + 3, j * 64 + 3, 58, 58); } });
  K.flat(G, flag, C.x1 - C.x0 - 0.1, C.z1 - C.z0 - 0.1, cx, C.y + 0.02, cz, 2);
  // brick arches across the cellar (vault ribs)
  for (const x of [35.5, 47.5]) { for (const z of [C.z0 + 0.35, C.z1 - 0.35]) b.box('mat', '#8a4a32', 0.7, H, 0.7, x, C.y + H / 2, z); b.box('mat', '#8a4a32', 0.7, 0.5, C.z1 - C.z0, x, C.top - 0.25, cz);
    for (let k = 0; k < 6; k++) { const a = (k + 0.5) / 6 * Math.PI, rz = (C.z1 - C.z0) / 2 - 0.35; b.box('mat', '#7a3e2a', 0.72, 0.3, 1.4, x, C.top - 0.55 - Math.sin(a) * 0.5 * (k === 0 || k === 5 ? 1 : 0.2), cz + Math.cos(a) * rz * 0.92, 0, a - Math.PI / 2); } }
  // wooden ceiling beams
  for (let z = C.z0 + 1.5; z < C.z1; z += 2.4) b.box('mat', '#4a3424', C.x1 - C.x0 - 0.2, 0.22, 0.26, cx, C.top - 0.11, z);
  // THE STAIR: 12 wooden steps east from the trapdoor, stone side walls, a hand rail
  { const n = 12, run = (S.x1 - S.x0) / n, rise = (0 - C.y) / n, w = S.z1 - S.z0, mz = (S.z0 + S.z1) / 2;
    for (let i = 0; i < n; i++) { const top = -rise * (i + 1) + rise * 0.5, x = S.x0 + run * (i + 0.5); b.box('mat', i % 2 ? '#7a5236' : '#83593b', run + 0.02, top - C.y, w, x, (top + C.y) / 2, mz); b.box('mat', '#5c3e28', 0.06, 0.04, w, x - run / 2 + 0.03, top + 0.01, mz); }
    for (const z of [S.z0 - 0.12, S.z1 + 0.12]) b.box('mat', '#5e564c', S.x1 - S.x0, -C.y + 0.02, 0.22, (S.x0 + S.x1) / 2, C.y / 2, z);
    for (let i = 0; i <= 4; i++) { const x = S.x0 + 0.3 + i * 1.1, y = -(x - S.x0) / (S.x1 - S.x0) * -C.y; b.box('mat', '#4a3424', 0.06, 0.9, 0.06, x, y + 0.45, S.z1 + 0.05); } b.box('mat', '#c9a227', S.x1 - S.x0, 0.05, 0.05, (S.x0 + S.x1) / 2, C.y / 2 + 0.9, S.z1 + 0.05, 0, 0, -Math.atan2(-C.y, S.x1 - S.x0));
    // trapdoor frame at floor level + the open leaf leaning on the north wall + a rail round the opening (tavern side)
    for (const z of [S.z0 - 0.08, S.z1 + 0.08]) b.box('mat', '#4a3424', S.x1 - S.x0 + 0.2, 0.06, 0.12, (S.x0 + S.x1) / 2, 0.06, z); b.box('mat', '#4a3424', 0.12, 0.06, w + 0.3, S.x1 + 0.05, 0.06, mz);
    b.box('mat', '#6e4a30', 2.2, 0.08, w, S.x0 + 1.2, 1.15, S.z0 - 0.25, 0, Math.PI / 2 - 0.12); for (const dx of [-0.6, 0.6]) b.box('mat', '#201e1d', 0.3, 0.04, 0.05, S.x0 + 1.2 + dx, 1.4, S.z0 - 0.18);
    for (let x = S.x0 + 0.4; x <= S.x1; x += 1.15) b.box('mat', '#4a3424', 0.07, 1.0, 0.07, x, 0.5, S.z1 + 0.1); b.box('mat', '#4a3424', S.x1 - S.x0 - 0.3, 0.07, 0.08, (S.x0 + S.x1) / 2 + 0.1, 1.0, S.z1 + 0.1);
    b.box('mat', '#4a3424', S.x1 - S.x0 - 0.3, 0.07, 0.08, (S.x0 + S.x1) / 2 + 0.1, 1.0, S.z0 - 0.1);
    for (const z of [S.z0 - 0.15, S.z1 + 0.15]) cols.push({ f: [S.x0 + 0.2, S.x1, z - 0.05, z + 0.05], y0: C.y - 1, y1: 0.6 }); }
  const Y = C.y;
  // two giant TUNS on cradles along the south wall, iron hoops, brass taps
  for (const x of [33.2, 39.8]) { const z = C.z1 - 1.9, r = 1.35, y = Y + r + 0.35; b.cyl('mat', '#7a5236', r, 2.6, x, y, z, 20, Math.PI / 2); b.cyl('mat', '#5c3e28', r - 0.12, 0.06, x, y, z - 1.31, 20, Math.PI / 2);
    for (const dz of [-1.15, -0.4, 0.4, 1.15]) b.tor('mat', '#2b2a2e', r + 0.02, 0.03, x, y, z + dz, 0, 0); for (const dz of [-0.9, 0.9]) b.box('mat', '#4a3424', 2.4, 0.5, 0.35, x, Y + 0.25, z + dz);
    b.cyl('gls', '#c9a227', 0.05, 0.3, x, y - 0.6, z - 1.45, 8, Math.PI / 2); b.box('gls', '#c9a227', 0.05, 0.16, 0.05, x, y - 0.72, z - 1.58); cols.push({ f: [x - 1.4, x + 1.4, z - 1.5, z + 1.4], y0: Y - 1, y1: -0.8 }); }
  // keg pyramid (west wall)
  { let k = 0; for (let row = 0; row < 3; row++) for (let i = 0; i < 4 - row; i++) { const z = -96 + i * 0.95 + row * 0.475, y = Y + 0.42 + row * 0.8; b.cyl('mat', k++ % 3 ? '#83593b' : '#6e4a30', 0.42, 0.85, 31.1, y, z, 14, 0, Math.PI / 2); for (const dx of [-0.3, 0.3]) b.tor('mat', '#2b2a2e', 0.43, 0.03, 31.1 + dx, y, z, 0, Math.PI / 2); }
    cols.push({ f: [C.x0, 31.7, -96.5, -92.6], y0: Y - 1, y1: -0.8 }); }
  // wine racks along the north wall (west of the stair): lattice + bottles
  { const x0 = 31, x1 = 40.2, z = C.z0 + 0.35; for (let x = x0; x <= x1; x += 0.46) b.box('mat', '#4a3424', 0.05, 2.2, 0.5, x, Y + 1.1, z); for (let r = 0; r < 6; r++) b.box('mat', '#4a3424', x1 - x0, 0.04, 0.5, (x0 + x1) / 2, Y + 0.2 + r * 0.38, z);
    for (let x = x0 + 0.23; x < x1; x += 0.46) for (let r = 0; r < 5; r++) for (const dx of [-0.1, 0.1]) if (Math.random() < 0.82) b.cyl('gls', Math.random() < 0.7 ? '#1f3a26' : '#4a1420', 0.045, 0.34, x + dx, Y + 0.33 + r * 0.38, z + 0.05, 6, Math.PI / 2);
    cols.push({ f: [x0, x1, C.z0, C.z0 + 0.7], y0: Y - 1, y1: -0.8 }); }
  // brewing corner (east): copper kettle with a dome + flue, mash tun, grain sacks, a hop sack, a paddle
  { const kx = 49.8, kz = -90.4; b.cyl('gls', '#b87333', 0.95, 1.4, kx, Y + 0.9, kz, 20); b.sph('gls', '#c98a4a', 0.95, kx, Y + 1.6, kz, 0.5, 14); b.cyl('gls', '#b87333', 0.12, 1.6, kx, Y + 2.45, kz, 10); b.cyl('gls', '#b87333', 0.1, 1.8, kx - 0.9, Y + 3.0, kz, 10, 0, Math.PI / 2);
    b.box('mat', '#5e564c', 2.2, 0.2, 2.2, kx, Y + 0.1, kz); b.box('glo', '#ff8a3a', 0.6, 0.14, 0.04, kx, Y + 0.3, kz + 1.1);
    b.cyl('mat', '#7a5236', 0.75, 1.0, 46.6, Y + 0.5, -88.6, 16); b.tor('mat', '#2b2a2e', 0.76, 0.03, 46.6, Y + 0.85, -88.6, Math.PI / 2); b.box('mat', '#a77b4f', 0.08, 1.4, 0.08, 46.8, Y + 1.3, -88.6, 0, 0, 0.4);
    for (let i = 0; i < 5; i++) b.sph('mat', i === 4 ? '#7aa865' : '#c9b48a', 0.36, 50.6 - (i % 3) * 0.55, Y + 0.3 + (i > 2 ? 0.45 : 0), -87.3 - (i % 2) * 0.3, 0.8, 8);
    cols.push({ f: [kx - 1.1, C.x1, kz - 1.1, kz + 1.1], y0: Y - 1, y1: -0.8 }); cols.push({ c: [46.6, -88.6, 0.8], y0: Y - 1, y1: -0.8 }); }
  // crates + a lantern table in the middle, the chalk tally board, the mouse hole
  for (let i = 0; i < 5; i++) b.box('mat', i % 2 ? '#9a7550' : '#8a6a46', 0.8, 0.6, 0.8, 43 + (i % 3) * 0.85, Y + 0.3 + (i > 2 ? 0.6 : 0), -93.2 + (i > 2 ? 0.1 : 0));
  cols.push({ f: [42.5, 45.5, -93.7, -92.7], y0: Y - 1, y1: -0.8 });
  b.box('mat', '#1c2a22', 1.4, 1.0, 0.05, C.x1 - 0.05, Y + 1.7, -94.4, Math.PI / 2); for (let r = 0; r < 4; r++) for (let t = 0; t < 4 + r; t++) b.box('mat', '#e8e4dc', 0.025, 0.14, 0.01, C.x1 - 0.09, Y + 2.0 - r * 0.2, -94.9 + t * 0.09, Math.PI / 2);
  b.box('mat', '#e8e4dc', 0.5, 0.008, 0.012, C.x1 - 0.09, Y + 1.98, -94.75, Math.PI / 2, 0, 0.5);
  { const mx = 38.3, mz = C.z1 - 0.06; b.ecyl('mat', '#100e0c', 0.12, 0.02, 0.16, mx, Y + 0.12, mz, 12); b.box('mat', '#100e0c', 0.24, 0.12, 0.02, mx, Y + 0.06, mz); b.box('mat', '#ffd23a', 0.1, 0.06, 0.08, mx + 0.32, Y + 0.05, mz - 0.12, 0.6); }
  // lanterns (hanging, unlit glow) + pools of warm light on the floor
  for (const [x, z] of [[34, -93], [40.5, -92.5], [47, -95.8], [45, -88]]) { b.box('mat', '#201e1d', 0.01, 0.7, 0.01, x, C.top - 0.35, z); b.box('mat', '#201e1d', 0.26, 0.34, 0.26, x, C.top - 0.86, z); b.box('glo', '#ffc864', 0.18, 0.24, 0.18, x, C.top - 0.86, z); }
  const pool = K.CT(64, 64, (g, w) => { const q = g.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, 'rgba(255,200,110,0.55)'); q.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = q; g.fillRect(0, 0, w, w); });
  const pm = new THREE.MeshBasicMaterial({ map: pool, transparent: true, depthWrite: false }); for (const [x, z] of [[34, -93], [40.5, -92.5], [47, -95.8], [45, -88]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), pm); p.rotation.x = -Math.PI / 2; p.position.set(x, Y + 0.04, z); G.add(p); }
  // the cellar's walls (below the tavern floor only)
  cols.push({ f: [C.x0 - 0.3, C.x0, C.z0, C.z1], y0: Y - 1, y1: -0.8 }, { f: [C.x1, C.x1 + 0.3, C.z0, C.z1], y0: Y - 1, y1: -0.8 }, { f: [C.x0, C.x1, C.z0 - 0.3, C.z0], y0: Y - 1, y1: -0.8 }, { f: [C.x0, C.x1, C.z1, C.z1 + 0.3], y0: Y - 1, y1: -0.8 });
  b.build(G);
  G.traverse(o => { if (o.isMesh) o.renderOrder = -2; });
  // the depth-only cap over the opening: everything drawn after it (floors, ground) cannot paint over the stairwell
  const cap = new THREE.Mesh(new THREE.PlaneGeometry(S.x1 - S.x0, S.z1 - S.z0), new THREE.MeshBasicMaterial({ colorWrite: false })); cap.rotation.x = -Math.PI / 2; cap.position.set((S.x0 + S.x1) / 2, 0.09, (S.z0 + S.z1) / 2); cap.renderOrder = -1; scene.add(cap);
  const inRect = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
  return {
    groundAt(x, z, y) { if (inRect(x, z, S) && y < 0.6) return Math.max(C.y, -(x - S.x0) / (S.x1 - S.x0) * -C.y); if (inRect(x, z, C) && y < -1) return C.y; return null; },
    inside: P => P.y < -0.5 && inRect(P.x, P.z, C),
    tick(cam) { const v = Math.hypot(cam.x - cx, cam.z - cz) < (touch ? 60 : 110); G.visible = v; cap.visible = v; },
  };
}
