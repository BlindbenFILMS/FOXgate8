// MERU 2.0 — BACKROOMS 2-4 (Ben: "all three, with detail"), all on worlds/meru2-under.js. No text anywhere (shapes, colours, dots only).
//  BANK VAULT CORRIDOR — under the bank (stair behind the teller counter, west of the vault): strongroom of deposit drawers, the cash cage
//    with loaded carts, a security gate (open), the bullion store under the vault (pallets of ingots), the cash lift, a guard post with CCTV.
//  POLICE EVIDENCE ROOM — under the police (stair behind the front desk): evidence aisles, the check-in hatch, the impound cage of Meru things
//    (skateboard, speedboat propeller, a slot machine, a length of tank tread, a jar of pearls, a bike), the detective pinboard with red string, a lab bench.
//  CASINO COUNT ROOM — under the casino (stair behind the cashier cage): counting tables + note counters, chip trays, a coin sorter, cash carts,
//    shrink-wrapped pallets, the big round safe, the CCTV wall, the manager's desk.
import { makeUnder } from './meru2-under.js';

export function buildBackrooms({ THREE, scene, cols, touch, kit, PLAYER_MALE }) {
  const ctx = { THREE, scene, cols, touch }, list = [];
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const rnd = (() => { let s = 777; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const concrete = (base = '#8e8a84', band) => CT(256, 256, (g, w) => { g.fillStyle = base; g.fillRect(0, 0, w, w); for (let i = 0; i < 500; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'; g.fillRect(rnd() * w, rnd() * w, 2 + rnd() * 5, 1 + rnd() * 2); }
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, w); if (band) { g.fillStyle = band; g.fillRect(0, w * 0.72, w, w * 0.28); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, w * 0.72, w, 3); } });
  const tiles = (a, bb, line) => CT(128, 128, (g, w) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? a : bb; g.fillRect(i * 32, j * 32, 32, 32); } g.strokeStyle = line; g.lineWidth = 1; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, w); g.stroke(); g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); } });
  const strip = (b, x, z, top, len = 2.4, along = 'x') => { const w = along === 'x' ? [len, 0.08, 0.3] : [0.3, 0.08, len]; b.box('gls', '#c0c4cc', ...w, x, top - 0.1, z); b.box('glo', '#f4f8ff', w[0] * 0.95, 0.02, w[2] * 0.8, x, top - 0.15, z); };
  const GOLD = '#c9a227', BR = '#b08d3c', STEEL = '#9aa0a6', DSTEEL = '#5c6670';

  // =================== BANK VAULT CORRIDOR (under x 64..106 × -124.4..-113) ===================
  list.push(makeUnder(ctx, { rect: { x0: 64, x1: 106, z0: -124.4, z1: -113 }, y: -3.6, stair: { x0: 70, x1: 75, z0: -122, z1: -119.8, dir: 1 }, wall: concrete('#a8a49c', '#2e4a6b'), floor: tiles('#9a958d', '#8e8a84', 'rgba(0,0,0,0.15)'), floorRep: 3 },
    (b, { Y, TOP, solid, round }) => {
      // STRONGROOM (west): walls of brass deposit drawers both long sides, a centre viewing table with a velvet tray
      for (const z of [-124.1, -113.3]) for (let x = 64.4; x < 69.6; x += 0.62) for (let r = 0; r < 7; r++) { const y = Y + 0.3 + r * 0.42; b.box('gls', (Math.round(x * 3) + r) % 2 ? BR : '#a07d30', 0.58, 0.38, 0.3, x, y, z); b.box('mat', '#201e1d', 0.12, 0.04, 0.02, x, y, z + (z > -118 ? -0.16 : 0.16)); b.cyl('gls', '#e8e4dc', 0.025, 0.02, x + 0.18, y + 0.08, z + (z > -118 ? -0.16 : 0.16), 6, Math.PI / 2); }
      solid(64, 69.8, -124.4, -123.8); solid(64, 69.8, -113.6, -113);
      b.box('mat', '#5a3d26', 2.4, 0.86, 1.0, 66.6, Y + 0.43, -118.6); b.box('mat', '#7a2a3a', 1.4, 0.03, 0.7, 66.6, Y + 0.875, -118.6); b.box('gls', BR, 0.9, 0.24, 0.5, 66.6, Y + 1.0, -118.6); solid(65.3, 67.9, -119.2, -118);
      // the SECURITY GATE (open): steel frame + a bar gate swung against the wall, warning stripe on the floor, red beacon
      { const x = 76.5; b.box('gls', DSTEEL, 0.3, -Y, 0.3, x, Y / 2, -124.2); b.box('gls', DSTEEL, 0.3, -Y, 0.3, x, Y / 2, -113.2); b.box('gls', DSTEEL, 0.3, 0.3, 11.4, x, TOP - 0.15, -118.7);
        for (let i = 0; i < 12; i++) b.cyl('gls', STEEL, 0.03, 2.8, x + 0.3 + i * 0.32, Y + 1.5, -113.5, 8); for (const y of [0.2, 1.5, 2.8]) b.box('gls', STEEL, 3.9, 0.08, 0.08, x + 2.1, Y + y, -113.5);
        for (let k = 0; k < 14; k++) b.box('mat', k % 2 ? '#201e1d' : '#ffd23a', 0.3, 0.012, 0.8, x, Y + 0.03, -124 + k * 0.8); b.cyl('glo', '#ff3030', 0.12, 0.16, x + 0.3, TOP - 0.5, -124, 10); round(x, -124.2, 0.3); round(x, -113.2, 0.3); solid(x + 0.2, x + 4.1, -113.6, -113.4); }
      // the CASH CAGE (middle): wire-mesh walls, a mesh door (open), loaded cash carts, a counting desk with a note counter
      { const x0 = 79, x1 = 88, z0 = -123.8, z1 = -117.6; for (let x = x0; x <= x1 + 0.01; x += 0.5) b.box('gls', STEEL, 0.03, 2.8, 0.03, x, Y + 1.4, z1); for (let y = 0.1; y <= 2.81; y += 0.35) b.box('gls', STEEL, x1 - x0, 0.02, 0.02, (x0 + x1) / 2, Y + y, z1);
        for (const x of [x0, x1]) { for (let z = z0; z <= z1; z += 0.5) b.box('gls', STEEL, 0.03, 2.8, 0.03, x, Y + 1.4, z); for (let y = 0.1; y <= 2.81; y += 0.35) b.box('gls', STEEL, 0.02, 0.02, z1 - z0, x, Y + y, (z0 + z1) / 2); }
        solid(x0, 82.5, z1 - 0.1, z1 + 0.1); solid(84.2, x1, z1 - 0.1, z1 + 0.1); solid(x0 - 0.1, x0 + 0.1, z0, z1); solid(x1 - 0.1, x1 + 0.1, z0, z1);
        for (const [cx, cz] of [[80.5, -122.6], [82.4, -122.6], [86.4, -122.4]]) { b.box('gls', DSTEEL, 1.4, 0.05, 0.8, cx, Y + 0.3, cz); b.box('gls', DSTEEL, 1.4, 0.05, 0.8, cx, Y + 0.9, cz); for (const [dx, dz] of [[-0.65, -0.35], [0.65, -0.35], [-0.65, 0.35], [0.65, 0.35]]) { b.box('gls', STEEL, 0.04, 1.2, 0.04, cx + dx, Y + 0.6, cz + dz); b.cyl('mat', '#201e1d', 0.06, 0.04, cx + dx, Y + 0.06, cz + dz, 8, Math.PI / 2); }
          for (const yy of [0.33, 0.93]) for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) b.box('mat', (i + j) % 3 ? '#4f7a4a' : '#5f8f58', 0.2, 0.14, 0.22, cx - 0.5 + i * 0.2, Y + yy + 0.07 + (j > 1 ? 0.14 : 0), cz - 0.25 + (j % 2) * 0.25); solid(cx - 0.75, cx + 0.75, cz - 0.45, cz + 0.45); }
        b.box('mat', '#5a3d26', 2, 0.8, 0.8, 85, Y + 0.4, -119); b.box('gls', '#3f4854', 0.5, 0.35, 0.4, 85.3, Y + 0.98, -119); b.box('glo', '#7cff9b', 0.2, 0.06, 0.01, 85.3, Y + 1.08, -118.79); for (let i = 0; i < 4; i++) b.box('mat', '#5f8f58', 0.2, 0.06 + i * 0.03, 0.1, 84.3 + i * 0.22, Y + 0.83 + i * 0.015, -119); solid(84, 86, -119.4, -118.6);
        strip(b, 83.5, -120.7, TOP); }
      // BULLION STORE (east, under the vault): pallets of gold ingots in stepped stacks, a drum of gold coins, the CASH LIFT
      for (const [px, pz] of [[92, -122.6], [95.2, -122.6], [98.4, -122.6], [92, -115.2], [95.2, -115.2]]) { b.box('mat', '#9a7550', 2.4, 0.15, 1.6, px, Y + 0.075, pz); for (let l = 0; l < 4; l++) for (let i = 0; i < 6 - l; i++) for (let j = 0; j < 3; j++) b.box('gls', '#e0b23a', 0.32, 0.1, 0.16, px - 0.9 + i * 0.36 + l * 0.18, Y + 0.2 + l * 0.11, pz - 0.4 + j * 0.4); solid(px - 1.2, px + 1.2, pz - 0.8, pz + 0.8); }
      b.cyl('gls', DSTEEL, 0.5, 0.9, 101.5, Y + 0.45, -116, 14); for (let i = 0; i < 18; i++) b.cyl('gls', '#e0b23a', 0.06, 0.02, 101.25 + (i % 5) * 0.12, Y + 0.92 + (i / 5 | 0) * 0.02, -116.2 + ((i * 3) % 4) * 0.12, 10); round(101.5, -116, 0.55);
      { const lx = 103.6, lz = -121.4; for (const [dx, dz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) b.box('gls', '#ffd23a', 0.16, -Y, 0.16, lx + dx, Y / 2, lz + dz); b.box('gls', DSTEEL, 2.6, 0.12, 2.6, lx, Y + 0.06, lz); b.box('gls', '#ffd23a', 2.8, 0.14, 2.8, lx, TOP - 0.2, lz);
        for (let k = 0; k < 8; k++) b.box('mat', k % 2 ? '#201e1d' : '#ffd23a', 0.35, 0.012, 2.6, lx - 1.2 + k * 0.35, Y + 0.13, lz + 1.6); b.box('gls', STEEL, 1.1, 0.9, 0.7, lx, Y + 0.6, lz); b.box('mat', '#4f7a4a', 1, 0.3, 0.6, lx, Y + 1.2, lz); b.box('gls', DSTEEL, 0.15, 0.3, 0.15, lx + 1.25, Y + 1.3, lz + 1.4); b.box('glo', '#7cff9b', 0.05, 0.05, 0.02, lx + 1.25, Y + 1.38, lz + 1.48); solid(lx - 1.4, lx + 1.4, lz - 1.4, lz + 1.4); }
      // GUARD POST (by the stair foot): desk, chair, a bank of 6 CCTV screens, a key safe, a coffee mug
      { const gx = 78, gz = -114.4; b.box('mat', '#3f4854', 2.2, 0.76, 0.8, gx, Y + 0.38, gz); b.box('mat', '#201e1d', 2.24, 0.04, 0.84, gx, Y + 0.78, gz);
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { b.box('mat', '#201e1d', 0.62, 0.42, 0.06, gx - 0.66 + i * 0.66, Y + 1.25 + j * 0.46, gz + 0.32); b.box('glo', ['#9fd6ff', '#b8f0c8', '#d6e4ee'][(i + j) % 3], 0.56, 0.36, 0.01, gx - 0.66 + i * 0.66, Y + 1.25 + j * 0.46, gz + 0.28); }
        b.box('mat', '#201e1d', 0.55, 0.08, 0.55, gx, Y + 0.5, gz - 0.8); b.box('mat', '#201e1d', 0.55, 0.6, 0.06, gx, Y + 0.82, gz - 1.06); b.cyl('mat', '#ec3013', 0.05, 0.1, gx + 0.7, Y + 0.85, gz - 0.1, 10); solid(gx - 1.1, gx + 1.1, gz - 0.4, gz + 0.4); }
      // ceiling: pipes + a cable tray the whole length, strip lights
      for (const [z, r, c] of [[-123.6, 0.12, '#7c8794'], [-123.2, 0.08, '#c94c3a'], [-113.8, 0.1, '#7c8794']]) b.cyl('gls', c, r, 41.8, 85, TOP - 0.35, z, 10, 0, Math.PI / 2);
      b.box('gls', STEEL, 41.8, 0.05, 0.5, 85, TOP - 0.55, -118.6); for (const x of [67, 72, 92, 97, 102]) strip(b, x, -118.6, TOP);
    }));

  // =================== POLICE EVIDENCE ROOM (under x -100..-70 × -112..-91.5) ===================
  list.push(makeUnder(ctx, { rect: { x0: -100, x1: -70, z0: -112, z1: -91.5 }, y: -3.4, stair: { x0: -87.6, x1: -82.6, z0: -94.5, z1: -92.3, dir: 1 }, wall: concrete('#b9b4ac', '#5c6670'), floor: tiles('#8e939a', '#9aa0a6', 'rgba(0,0,0,0.18)'), floorRep: 3 },
    (b, { Y, TOP, solid, round }) => {
      // CHECK-IN hatch at the stair foot: a counter + a grille window in a partition, an intake tray, a ledger
      { const z = -96.2; b.box('mat', '#d8d2c8', 10, -Y + TOP, 0.2, -76, (Y + TOP) / 2, z); b.box('mat', '#2e4a6b', 10, 1.0, 0.24, -76, Y + 0.5, z);
        b.box('gls', DSTEEL, 2.2, 0.08, 0.7, -78, Y + 1.05, z); for (let x = -79; x <= -77.01; x += 0.2) b.box('gls', STEEL, 0.02, 1.1, 0.02, x, Y + 1.65, z); b.box('gls', DSTEEL, 2.2, 0.08, 0.1, -78, Y + 2.25, z);
        b.box('mat', '#c9a874', 0.5, 0.12, 0.35, -78.4, Y + 1.15, z - 0.2); b.box('mat', '#201e1d', 0.4, 0.04, 0.3, -77.5, Y + 1.11, z - 0.2); solid(-81, -71, z - 0.15, z + 0.15); }
      // EVIDENCE AISLES: 4 double-sided steel racks of numbered boxes (dots only), bags, a ladder
      for (let a = 0; a < 4; a++) { const x = -97.5 + a * 3.3, z0 = -110.8, z1 = -99.2; for (const z of [z0, (z0 + z1) / 2, z1]) for (const s of [-0.45, 0.45]) b.box('gls', DSTEEL, 0.05, 2.7, 0.05, x + s, Y + 1.35, z);
        for (let s = 0; s < 5; s++) { const y = Y + 0.2 + s * 0.6; b.box('gls', STEEL, 0.95, 0.03, z1 - z0, x, y, (z0 + z1) / 2);
          for (let k = 0; k < 18; k++) { const z = z0 + 0.35 + k * 0.63, kind = (a * 7 + s * 3 + k) % 6; if (kind === 5) continue; if (kind === 4) { b.box('glass', '#e8f4ff', 0.4, 0.3, 0.35, x + 0.2, y + 0.16, z); b.box('mat', '#ec3013', 0.4, 0.02, 0.36, x + 0.2, y + 0.3, z); }
            else { b.box('mat', kind % 2 ? '#c9a874' : '#b8956a', 0.8, 0.4, 0.5, x, y + 0.21, z); b.box('mat', '#f3f2f2', 0.01, 0.12, 0.2, x - 0.405, y + 0.24, z); b.box('mat', '#201e1d', 0.012, 0.03, 0.12, x - 0.41, y + 0.26, z); } } }
        solid(x - 0.5, x + 0.5, z0, z1); }
      { const x = -84.6, z = -100; b.box('gls', '#ffd23a', 0.06, 2.4, 0.06, x - 0.25, Y + 1.2, z); b.box('gls', '#ffd23a', 0.06, 2.4, 0.06, x + 0.25, Y + 1.2, z); for (let k = 0; k < 6; k++) b.box('gls', '#ffd23a', 0.5, 0.04, 0.06, x, Y + 0.3 + k * 0.38, z); }
      // the IMPOUND CAGE (east): mesh walls + the confiscated Meru things
      { const x0 = -80, x1 = -70.3, z0 = -111.7, z1 = -103; for (let x = x0; x <= x1; x += 0.5) b.box('gls', STEEL, 0.03, 2.8, 0.03, x, Y + 1.4, z1); for (let y = 0.1; y <= 2.81; y += 0.35) b.box('gls', STEEL, x1 - x0, 0.02, 0.02, (x0 + x1) / 2, Y + y, z1);
        for (let z = z0; z <= z1; z += 0.5) b.box('gls', STEEL, 0.03, 2.8, 0.03, x0, Y + 1.4, z); for (let y = 0.1; y <= 2.81; y += 0.35) b.box('gls', STEEL, 0.02, 0.02, z1 - z0, x0, Y + y, (z0 + z1) / 2);
        solid(x0, x1, z1 - 0.1, z1 + 0.1); solid(x0 - 0.1, x0 + 0.1, z0, z1);
        // skateboard leaning on the wall
        b.box('mat', '#ec3013', 0.22, 0.8, 0.03, -71, Y + 0.5, -104, 0, 0, 0.25); for (const dy of [-0.26, 0.26]) for (const dx of [-0.08, 0.08]) b.cyl('mat', '#f3f2f2', 0.03, 0.03, -71 + dx + dy * 0.25, Y + 0.5 + dy, -104 + 0.04, 8, Math.PI / 2);
        // speedboat propeller on a crate
        b.box('mat', '#9a7550', 0.9, 0.7, 0.9, -73, Y + 0.35, -105); b.cyl('gls', '#c0c4cc', 0.08, 0.2, -73, Y + 0.85, -105, 10); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; b.box('gls', '#c9a227', 0.08, 0.32, 0.03, -73 + Math.cos(a) * 0.2, Y + 0.85 + Math.sin(a) * 0.2, -105, 0, 0, a); }
        // a seized slot machine
        b.box('mat', '#201e1d', 0.7, 1.6, 0.6, -78.8, Y + 0.8, -110.9); b.box('glo', '#ff3fb4', 0.5, 0.3, 0.01, -78.8, Y + 1.25, -110.59); b.box('gls', GOLD, 0.72, 0.1, 0.62, -78.8, Y + 1.62, -110.9); b.cyl('gls', '#ec3013', 0.04, 0.4, -78.4, Y + 1.2, -110.6, 6, 0, 0.4);
        // a length of tank tread
        for (let k = 0; k < 9; k++) b.box('gls', '#3f4854', 0.3, 0.08, 0.7, -76.4 + k * 0.32, Y + 0.05 + (k > 6 ? (k - 6) * 0.12 : 0), -110.6); for (let k = 0; k < 9; k++) b.box('gls', '#6b737b', 0.1, 0.1, 0.72, -76.4 + k * 0.32, Y + 0.1, -110.6);
        // a jar of pearls on a shelf, a bike, a crate of bottles
        b.box('gls', STEEL, 2, 0.04, 0.5, -71.5, Y + 1.2, -111.4); b.cyl('glass', '#e8f4ff', 0.18, 0.4, -71.8, Y + 1.42, -111.4, 14); for (let k = 0; k < 14; k++) b.sph('glo', '#f6f2ea', 0.045, -71.8 + Math.cos(k) * 0.1, Y + 1.28 + (k % 4) * 0.07, -111.4 + Math.sin(k * 2) * 0.1, 1, 6);
        for (const dx of [-0.55, 0.55]) b.tor('mat', '#201e1d', 0.34, 0.06, -75 + dx, Y + 0.36, -106.4, 0, 0); b.box('gls', '#2e86b8', 1.1, 0.05, 0.05, -75, Y + 0.6, -106.4, 0, 0, 0.1); b.box('gls', '#2e86b8', 0.05, 0.5, 0.05, -74.8, Y + 0.55, -106.4); b.box('mat', '#201e1d', 0.25, 0.06, 0.12, -74.9, Y + 0.84, -106.4);
        b.box('mat', '#9a7550', 0.8, 0.4, 0.6, -71.5, Y + 0.2, -108); for (let k = 0; k < 6; k++) b.cyl('gls', '#1f3a26', 0.05, 0.3, -71.75 + (k % 3) * 0.25, Y + 0.5, -108.15 + (k / 3 | 0) * 0.3, 6);
        solid(-73.5, -72.5, -105.5, -104.5); solid(-79.2, -78.4, -111.3, -110.5); solid(-72.3, -71.1, -108.3, -107.7); }
      // the DETECTIVE PINBOARD (west wall): cork, photos + notes, pins, red string between them
      { const x = -99.88, zc = -96, y0 = Y + 1.0; b.box('mat', '#a8784a', 0.04, 1.6, 3.6, x, y0 + 0.8, zc); b.box('mat', '#5a3d26', 0.06, 1.7, 3.7, x - 0.02, y0 + 0.8, zc);
        const pins = []; for (let k = 0; k < 9; k++) { const z = zc - 1.5 + (k * 0.37) % 3, y = y0 + 0.25 + ((k * 0.53) % 1.2); pins.push([y, z]); b.box('mat', k % 3 ? '#f3efe2' : '#d6e4ee', 0.01, 0.3, 0.24, x + 0.03, y - 0.12, z); if (k % 3 === 0) b.box('mat', '#5c6670', 0.012, 0.16, 0.16, x + 0.04, y - 0.1, z); b.sph('mat', '#ec3013', 0.025, x + 0.06, y, z); }
        for (const [i, j] of [[0, 3], [3, 5], [5, 1], [1, 7], [2, 6], [6, 4], [4, 8], [0, 8]]) { const [ya, za] = pins[i], [yb, zb] = pins[j], L = Math.hypot(yb - ya, zb - za); b.box('mat', '#c42d3c', 0.008, 0.012, L, x + 0.065, (ya + yb) / 2, (za + zb) / 2, 0, -Math.atan2(yb - ya, zb - za)); } }
      // LAB BENCH: microscope, lamp, sample racks, a fingerprint card + brush
      { const x = -97, z = -92.4; b.box('mat', '#f3f2f2', 3.2, 0.9, 0.8, x, Y + 0.45, z); b.box('mat', '#201e1d', 3.24, 0.05, 0.84, x, Y + 0.92, z);
        b.box('mat', '#201e1d', 0.25, 0.04, 0.3, x - 0.9, Y + 0.96, z); b.cyl('mat', '#f3f2f2', 0.04, 0.4, x - 0.9, Y + 1.15, z - 0.08, 8, 0.4); b.cyl('mat', '#201e1d', 0.05, 0.12, x - 0.9, Y + 1.38, z - 0.02, 8, 0.4); b.box('mat', '#3f4854', 0.16, 0.03, 0.16, x - 0.9, Y + 1.06, z + 0.04);
        for (let k = 0; k < 6; k++) b.cyl('glass', ['#9fd6ff', '#f472b6', '#7cff9b'][k % 3], 0.02, 0.14, x + 0.2 + k * 0.08, Y + 1.02, z - 0.1, 8); b.box('gls', STEEL, 0.55, 0.03, 0.12, x + 0.4, Y + 0.96, z - 0.1);
        b.box('mat', '#f3efe2', 0.2, 0.004, 0.28, x + 1.1, Y + 0.95, z); for (let k = 0; k < 5; k++) b.cyl('mat', '#201e1d', 0.02, 0.003, x + 1.03 + (k % 3) * 0.07, Y + 0.955, z - 0.06 + (k / 3 | 0) * 0.1, 8);
        b.cyl('mat', '#201e1d', 0.04, 0.5, x + 1.4, Y + 1.2, z + 0.25, 6); b.cyl('mat', '#2e4a6b', 0.14, 0.16, x + 1.32, Y + 1.45, z + 0.15, 10, 0.6); solid(x - 1.6, x + 1.6, z - 0.4, z + 0.4); }
      // a gun + sword safe, file boxes, a floor drain
      b.box('gls', '#3f4854', 1.0, 1.9, 0.6, -99.6, Y + 0.95, -101.6, Math.PI / 2); b.cyl('gls', '#c0c4cc', 0.12, 0.05, -99.28, Y + 1.1, -101.6, 14, 0, Math.PI / 2); solid(-100, -99.3, -102.1, -101.1);
      for (let k = 0; k < 6; k++) b.box('mat', '#c9a874', 0.5, 0.3, 0.4, -88.5 + (k % 3) * 0.52, Y + 0.15 + (k / 3 | 0) * 0.31, -97.5); solid(-88.8, -86.9, -97.8, -97.2);
      b.cyl('mat', '#3f4854', 0.25, 0.01, -90, Y + 0.03, -103, 16); for (const x of [-96, -89, -82]) for (const z of [-94, -101, -108]) strip(b, x, z, TOP, 2.4, 'z');
    }));

  // =================== CASINO COUNT ROOM (under x -149..-126 × 14..31.5) ===================
  list.push(makeUnder(ctx, { rect: { x0: -149, x1: -126, z0: 14, z1: 31.5 }, y: -3.4, stair: { x0: -142.5, x1: -137.5, z0: 28.4, z1: 30.6, dir: -1 }, stepCol: ['#7a2a3a', '#6a2432'], shaftCol: '#3d2a1c',
      wall: CT(128, 128, (g, w) => { g.fillStyle = '#4a2a34'; g.fillRect(0, 0, w, w); g.strokeStyle = 'rgba(201,162,39,0.35)'; g.lineWidth = 2; for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, w); g.stroke(); } g.fillStyle = '#2a1820'; g.fillRect(0, w * 0.75, w, w * 0.25); g.fillStyle = '#c9a227'; g.fillRect(0, w * 0.75, w, 2); }), wallRep: 2.5,
      floor: CT(128, 128, (g, w) => { g.fillStyle = '#5a1e2a'; g.fillRect(0, 0, w, w); g.fillStyle = 'rgba(201,162,39,0.35)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.moveTo(i * 32 + 16, j * 32 + 6); g.lineTo(i * 32 + 26, j * 32 + 16); g.lineTo(i * 32 + 16, j * 32 + 26); g.lineTo(i * 32 + 6, j * 32 + 16); g.closePath(); g.fill(); } }), floorRep: 2 },
    (b, { Y, TOP, solid, round }) => {
      // two COUNTING TABLES: green felt, note counters with glowing displays, bill stacks, chip trays, chairs
      for (const z of [18.5, 23.5]) { const x = -137, L = 8; b.box('mat', '#3d2a1c', L, 0.82, 1.4, x, Y + 0.41, z); b.box('mat', '#1f6b45', L - 0.1, 0.03, 1.3, x, Y + 0.835, z); b.box('gls', GOLD, L + 0.04, 0.03, 1.44, x, Y + 0.83, z);
        for (let i = 0; i < 3; i++) { const mx = x - 2.8 + i * 2.8; b.box('gls', '#d9dde2', 0.5, 0.3, 0.45, mx, Y + 1.0, z - 0.2); b.box('gls', '#3f4854', 0.42, 0.06, 0.3, mx, Y + 1.18, z - 0.2); b.box('glo', '#7cff9b', 0.22, 0.06, 0.01, mx, Y + 1.05, z + 0.03); b.box('mat', '#4f7a4a', 0.3, 0.06, 0.15, mx, Y + 1.2, z - 0.25);
          for (let k = 0; k < 5; k++) b.box('mat', k % 2 ? '#4f7a4a' : '#5f8f58', 0.3, 0.05 + k * 0.03, 0.15, mx + 0.5, Y + 0.87 + k * 0.016, z - 0.35 + k * 0.17); b.box('mat', '#f3efe2', 0.3, 0.01, 0.03, mx + 0.5, Y + 0.95, z - 0.35); }
        for (let i = 0; i < 2; i++) { const tx = x + 1.4 + i * 1.6; b.box('mat', '#201e1d', 1.2, 0.06, 0.5, tx, Y + 0.87, z + 0.35); for (let k = 0; k < 10; k++) b.cyl('gls', ['#ec3013', '#2e4a6b', '#f3f2f2', '#22c55e', '#201e1d'][k % 5], 0.04, 0.1 + (k % 3) * 0.04, tx - 0.5 + k * 0.11, Y + 0.95, z + 0.35, 10); }
        for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const cxx = x - 3 + i * 2; b.box('mat', '#201e1d', 0.5, 0.08, 0.5, cxx, Y + 0.5, z + s * 1.1); b.box('mat', '#7a2a3a', 0.5, 0.6, 0.06, cxx, Y + 0.82, z + s * 1.35); }
        for (const dx of [-3, 3]) b.box('mat', '#201e1d', 0.02, 0.8, 0.02, x + dx, TOP - 0.45, z); b.box('gls', '#201e1d', L - 1, 0.12, 0.5, x, TOP - 0.85, z); b.box('glo', '#fff1c8', L - 1.1, 0.02, 0.4, x, TOP - 0.92, z); solid(x - L / 2, x + L / 2, z - 0.7, z + 0.7); }
      // COIN SORTER: hopper, chute, three bins of coins
      { const x = -146.6, z = 17.4; b.box('gls', '#c0c4cc', 1.2, 1.2, 0.9, x, Y + 0.6, z); b.cyl('gls', '#c0c4cc', 0.6, 0.6, x, Y + 1.5, z, 4, 0, 0, 0.4); b.box('gls', '#9aa0a6', 0.25, 0.08, 0.9, x + 0.7, Y + 0.9, z, 0, 0, -0.5);
        for (let i = 0; i < 3; i++) { b.box('gls', DSTEEL, 0.45, 0.35, 0.45, x + 1.4, Y + 0.18, z - 0.5 + i * 0.5); for (let k = 0; k < 6; k++) b.cyl('gls', i === 0 ? '#e0b23a' : '#c0c4cc', 0.05, 0.02, x + 1.3 + (k % 3) * 0.1, Y + 0.37, z - 0.55 + i * 0.5 + (k / 3 | 0) * 0.1, 8); }
        b.box('glo', '#ff3030', 0.05, 0.05, 0.02, x + 0.3, Y + 1.1, z + 0.46); solid(x - 0.6, x + 1.7, z - 0.8, z + 0.8); }
      // CASH CARTS + shrink-wrapped pallets of notes
      for (const [cx, cz] of [[-130, 16], [-128.2, 16]]) { b.box('gls', '#c0c4cc', 1.2, 1.0, 0.7, cx, Y + 0.6, cz); b.box('gls', '#9aa0a6', 1.24, 0.04, 0.74, cx, Y + 1.12, cz); for (const [dx, dz] of [[-0.5, -0.28], [0.5, -0.28], [-0.5, 0.28], [0.5, 0.28]]) b.cyl('mat', '#201e1d', 0.07, 0.05, cx + dx, Y + 0.07, cz + dz, 8, Math.PI / 2); solid(cx - 0.65, cx + 0.65, cz - 0.4, cz + 0.4); }
      for (const [px, pz] of [[-129.4, 27.5], [-129.4, 22.5]]) { b.box('mat', '#9a7550', 1.6, 0.15, 1.2, px, Y + 0.075, pz); for (let l = 0; l < 4; l++) for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) b.box('mat', (i + j + l) % 2 ? '#4f7a4a' : '#5f8f58', 0.36, 0.2, 0.36, px - 0.57 + i * 0.38, Y + 0.25 + l * 0.21, pz - 0.38 + j * 0.38);
        b.box('glass', '#e8f4ff', 1.6, 0.9, 1.2, px, Y + 0.6, pz); solid(px - 0.8, px + 0.8, pz - 0.6, pz + 0.6); }
      // the big ROUND SAFE door in the north wall: frame, wheel, bolts
      { const x = -137, z = 14.12, y = Y + 1.5; b.box('gls', '#3f4854', 3, 2.9, 0.2, x, Y + 1.45, z); b.cyl('gls', '#8e939a', 1.2, 0.3, x, y, z + 0.2, 32, Math.PI / 2); b.cyl('gls', '#6b737b', 1.0, 0.06, x, y, z + 0.37, 32, Math.PI / 2);
        for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; b.cyl('gls', '#c0c4cc', 0.07, 0.14, x + Math.cos(a) * 1.05, y + Math.sin(a) * 1.05, z + 0.4, 10, Math.PI / 2); b.box('gls', GOLD, 0.05, 0.6, 0.05, x + Math.cos(a) * 0.3, y + Math.sin(a) * 0.3, z + 0.46, 0, 0, a); }
        b.cyl('gls', GOLD, 0.15, 0.1, x, y, z + 0.46, 14, Math.PI / 2); b.tor('gls', GOLD, 0.6, 0.05, x, y, z + 0.46, 0, 0); solid(x - 1.5, x + 1.5, 14, 14.6); }
      // the CCTV WALL (east wall) + operator desk
      { const x = -126.12; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const z = 18 + i * 0.9, y = Y + 1.2 + j * 0.6; b.box('mat', '#201e1d', 0.06, 0.55, 0.85, x, y, z); b.box('glo', ['#9fd6ff', '#b8f0c8', '#d6e4ee', '#ffd9a8'][(i + j) % 4], 0.01, 0.47, 0.76, x - 0.04, y, z); }
        b.box('mat', '#201e1d', 0.9, 0.76, 3.6, -127, Y + 0.38, 19.35); b.box('mat', '#3d2a1c', 0.94, 0.04, 3.64, -127, Y + 0.78, 19.35); for (let k = 0; k < 2; k++) b.box('mat', '#3f4854', 0.3, 0.03, 0.5, -127.1, Y + 0.81, 18.6 + k * 1.4);
        b.box('mat', '#201e1d', 0.55, 0.08, 0.55, -128, Y + 0.5, 19.3); b.box('mat', '#7a2a3a', 0.06, 0.65, 0.55, -128.28, Y + 0.85, 19.3); solid(-127.5, -126, 17.5, 21.2); }
      // MANAGER'S DESK (west): walnut desk, banker's lamp, a red velvet chair, a ledger, a cigar box, a rope across
      { const x = -146.4, z = 25.4; b.box('mat', '#5a3d26', 1.0, 0.8, 2.4, x, Y + 0.4, z); b.box('mat', '#3d2a1c', 1.04, 0.05, 2.44, x, Y + 0.82, z); b.box('mat', '#1f6b45', 0.7, 0.01, 1.2, x, Y + 0.85, z);
        b.box('gls', GOLD, 0.04, 0.3, 0.04, x, Y + 1.0, z - 0.8); b.ecyl('gls', '#1f6b45', 0.1, 0.25, 0.12, x, Y + 1.17, z - 0.8, 14); b.box('glo', '#fff1c8', 0.09, 0.01, 0.4, x, Y + 1.1, z - 0.8);
        b.box('mat', '#7a2a3a', 0.3, 0.04, 0.4, x + 0.1, Y + 0.87, z + 0.3); b.box('mat', '#5a3d26', 0.2, 0.08, 0.3, x - 0.2, Y + 0.89, z + 0.8);
        b.box('mat', '#7a2a3a', 0.7, 0.12, 0.7, x - 1.0, Y + 0.5, z); b.box('mat', '#7a2a3a', 0.12, 1.0, 0.7, x - 1.36, Y + 1.0, z); b.box('gls', GOLD, 0.04, 0.5, 0.04, x - 1.0, Y + 0.22, z); solid(x - 0.5, x + 0.5, z - 1.2, z + 1.2); }
      for (const [x, z] of [[-133, 26.5], [-135, 26.5]]) { b.cyl('gls', GOLD, 0.18, 0.04, x, Y + 0.02, z, 12); b.cyl('gls', GOLD, 0.03, 0.9, x, Y + 0.47, z, 8); b.sph('gls', GOLD, 0.05, x, Y + 0.93, z); round(x, z, 0.2); }
      for (let s = 0; s < 8; s++) { const u = (s + 0.5) / 8; b.box('mat', '#7a2a3a', 0.27, 0.05, 0.05, -135 + u * 2, Y + 0.86 - Math.sin(u * Math.PI) * 0.14, 26.5); }
      for (const [x, z] of [[-143, 20], [-131, 20], [-137, 27]]) { b.box('gls', GOLD, 0.03, 0.4, 0.03, x, TOP - 0.2, z); b.sph('glo', '#ffe2a8', 0.16, x, TOP - 0.5, z, 1, 8); b.tor('gls', GOLD, 0.22, 0.05, x, TOP - 0.5, z, Math.PI / 2); }
    }));
  // THE STAFF (new avatars, no lines yet: section 6 of MERU_2_PLAN.md). They idle and turn to face you when you come close.
  const staff = [];
  const hire = (key, opt, x, y, z, ry) => { if (!kit) return; const f = kit.makeFox({ key, look: { ...PLAYER_MALE, ...(opt.look || {}) }, torso: opt.torso, outfit: opt.outfit, crest: '', gear: 'none' }); f.position.set(x, y, z); f.rotation.y = ry; scene.add(f);
    f.traverse(o => { if (o.isMesh) o.renderOrder = -2; }); cols.push({ c: [x, z, 0.45], y0: y - 1, y1: y + 2 }); staff.push({ f, x, y, z, ry, yaw: ry }); };
  hire('vaultGuard', { torso: ['#2e4a6b', '#c9a227', '#16263c'], outfit: 'armor', look: { fur: '#c97a3a' } }, 79.8, -3.6, -116.2, -Math.PI / 2);
  hire('evidenceClerk', { torso: ['#8e939a', '#f3f2f2', '#3f4854'], outfit: 'coat', look: { fur: '#d8a070', furDark: '#8a5a3a' } }, -78, -3.4, -97.0, 0);
  hire('countManager', { torso: ['#7a2a3a', '#c9a227', '#3d1a22'], outfit: 'suit', look: { fur: '#a8a29a', furDark: '#6a6560' } }, -144.8, -3.4, 23.6, Math.PI / 2);
  return { tick(cam, dt, t, P) { for (const u of list) u.tick(cam, dt, t);
      for (const s of staff) { s.f.visible = Math.hypot(cam.x - s.x, cam.z - s.z) < (touch ? 60 : 110); if (!s.f.visible) continue; const near = P && Math.abs(P.y - s.y) < 1.5 && Math.hypot(P.x - s.x, P.z - s.z) < 6;
        const want = near ? Math.atan2(P.x - s.x, P.z - s.z) : s.ry, d = Math.atan2(Math.sin(want - s.yaw), Math.cos(want - s.yaw)); s.yaw += d * Math.min(1, dt * 4); s.f.rotation.y = s.yaw; kit.animFox(s.f, dt, 0, false); } }, groundAt(x, z, y) { for (const u of list) { const h = u.groundAt(x, z, y); if (h != null) return h; } return null; } };
}
