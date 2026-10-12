// MERU 2.0 — step 3: interiors, part 2. BURGERS [meruBurgers] (diner + the Sizzle job), MERU LANES [meruBowling] (tenpin),
// ITEM SHOP [meruItemshop] (Kia), ARMORY [meruArmory] (Bram), FORTUNE TELLER [meruFortune] (Ora). Stock + prices come from worlds/meru-shops.js.
import { KEEPERS } from './meru-shops.js';
import { buildDiner } from '../minigames/meru/diner-room.js';
import { buildShopRooms } from './meru2-shoprooms.js';
import { buildLanes2 } from './meru2-funrooms.js';
import { makeRoomKit } from './meru2-roomkit.js';
export function buildRooms2({ THREE, scene, M, toon, kit, cols, grad }) {
  const B = (w, h, d, col, x, y, z, ry = 0, o = 0.02) => { const m = M(new THREE.BoxGeometry(w, h, d), typeof col === 'string' ? toon(col) : col, x, y, z, null, o); m.rotation.y = ry; return m; };
  const C = (r, h, col, x, y, z, o = 0.02, n = 20) => M(new THREE.CylinderGeometry(r, r, h, n), typeof col === 'string' ? toon(col) : col, x, y, z, null, o);
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] }), glow = c => new THREE.MeshBasicMaterial({ color: c });
  const fox = (key, opt, x, z, ry) => { const f = kit.makeFox({ key, ...opt }); f.position.set(x, 0, z); f.rotation.y = ry; scene.add(f); ring(x, z, 0.5); return f; };
  const spots = [], npcs = [];

  // ================= BURGERS (f 70..92 × 40..56, door W at z 48) =================
  // step 10: Sizzle's diner from the Burgers job (minigames/meru/diner-room.js buildDiner), turned so its customer side faces the west door.
  // Its own outer walls, front window and ceiling are hidden (the city shell has real windows); the back wall stays as the counter wall.
  { const CTX = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
    const K = buildDiner({ THREE, M, toon, canvasTex: CTX, scene, grad, origin: { x: 0, z: 0 } }), root = K.root;
    root.rotation.y = -Math.PI / 2; root.position.set(76, 0.012, 48);
    const hide = new Set(K.front); for (const c of root.children) { const p = c.geometry && c.geometry.parameters;
      if (c.geometry && c.geometry.type === 'PlaneGeometry' && p.height >= 4 && c.rotation.x === 0 && Math.abs(c.position.z + 5) > 0.01) hide.add(c);   // side + front walls
      if (c.geometry && c.geometry.type === 'PlaneGeometry' && p.height === 8) hide.add(c);                                          // kitchen floor behind the back wall
      if (c.geometry && c.geometry.type === 'BoxGeometry' && p.width === 12 && p.depth === 10) hide.add(c); }                         // ceiling
    for (const c of hide) c.visible = false;
    for (const c of root.children) if (c.geometry && c.geometry.type === 'PlaneGeometry' && Math.abs(c.position.z + 5) < 0.01 && c.material) c.material.side = THREE.DoubleSide;
    // colliders (world): kitchen block behind the front counter, booths, jukebox
    box(76.9, 81.3, 42, 54); box(71.4, 76, 42.7, 46.1); ring(73.4, 53.2, 0.6);
    npcs.push(fox('burgerCook', { torso: '#f3f2f2', outfit: 'vest' }, 79.4, 48, -Math.PI / 2), fox('michaelJay', { torso: '#2e4a6b', outfit: 'coat' }, 72.6, 47, Math.PI / 2));
    spots.push({ key: 'burgersJob', x: 75.6, z: 48, r: 1.8, prompt: 'PUT ME TO WORK \u00b7 BURGERS JOB', play: { label: 'BURGERS', url: 'Meru Burgers.dc.html?embed=1' } }); }

  // BURGERS BACK OF HOUSE (x 81.4..92 × 40..56, behind the diner's counter wall; seen through the shell's N + S windows): walk-in cooler, dry store racks,
  // produce crates, sacks, syrup boxes, staff lockers + desk + rota board, mop sink, bins, strip lights. Merged by material (4 draws), hides by distance.
  const boh = new THREE.Group(); scene.add(boh);
  { const touch = matchMedia('(pointer: coarse)').matches, K2 = makeRoomKit({ THREE, touch }), b = K2.Bin(), X0 = 81.45, X1 = 91.8, Z0 = 40.2, Z1 = 55.8;
    const conc = K2.CT(128, 128, (g, w) => { g.fillStyle = '#9a958d'; g.fillRect(0, 0, w, w); for (let i = 0; i < 300; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'; g.fillRect(Math.random() * w, Math.random() * w, 2 + Math.random() * 4, 2); } g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, w); });
    K2.flat(boh, conc, X1 - X0, Z1 - Z0, (X0 + X1) / 2, 0.016, (Z0 + Z1) / 2, 2);
    b.box('mat', '#ffd23a', 0.12, 0.012, Z1 - Z0 - 1, X0 + 1.6, 0.025, (Z0 + Z1) / 2);
    // walk-in cooler (NE corner): steel box, door with strip curtain + handle, condenser on top
    { const cx = 88.6, cz = 43.4, w = 5.6, d = 5.6, h = 3.0; b.box('gls', '#c9ced3', w, h, d, cx, h / 2, cz); for (let i = -2; i <= 2; i++) b.box('gls', '#b3b9bf', 0.04, h, d + 0.02, cx + i * 1.1, h / 2, cz);
      b.box('gls', '#dfe3e6', 1.2, 2.2, 0.08, cx - 1.2, 1.1, cz + d / 2 + 0.04); b.box('gls', '#7c8288', 0.1, 0.5, 0.08, cx - 0.7, 1.15, cz + d / 2 + 0.12); b.box('glo', '#7cff9b', 0.22, 0.1, 0.02, cx - 1.2, 2.4, cz + d / 2 + 0.06);
      b.box('mat', '#6b7278', 2.2, 0.7, 1.2, cx + 1, h + 0.35, cz - 1); b.cyl('mat', '#201e1d', 0.3, 0.06, cx + 1, h + 0.72, cz - 1, 12); box(cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2); }
    // dry store racks along the south wall: wire shelves with buns, boxes, cans
    for (const rx of [83.2, 86.6, 90]) { const rz = 54.9, rw = 3, rd = 0.8; for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.box('gls', '#9aa0a6', 0.05, 2.2, 0.05, rx + sx * rw / 2, 1.1, rz + sz * rd / 2);
      for (let s = 0; s < 4; s++) { const y = 0.25 + s * 0.6; b.box('gls', '#b3b9bf', rw, 0.03, rd, rx, y, rz);
        for (let i = 0; i < 5; i++) { const k = (rx * 7 + s * 3 + i) % 4 | 0, px = rx - rw / 2 + 0.35 + i * 0.58;
          if (k === 0) { b.box('mat', '#e6b45a', 0.48, 0.24, 0.6, px, y + 0.13, rz); b.box('mat', '#f3f2f2', 0.5, 0.02, 0.62, px, y + 0.26, rz); }
          else if (k === 1) b.box('mat', '#c9a874', 0.5, 0.4, 0.6, px, y + 0.21, rz);
          else if (k === 2) for (let c = 0; c < 3; c++) b.cyl('gls', c % 2 ? '#ec3013' : '#d9d6d0', 0.08, 0.2, px - 0.16 + c * 0.16, y + 0.11, rz, 10);
          else b.box('mat', '#ec3013', 0.46, 0.3, 0.5, px, y + 0.16, rz); } }
      box(rx - rw / 2, rx + rw / 2, rz - rd / 2, rz + rd / 2); }
    // produce crates + sacks by the cooler
    for (let i = 0; i < 6; i++) { const x = 83 + (i % 3) * 0.7, z = 41 + (i / 3 | 0) * 0.62, y = 0.17; b.box('mat', '#9a7550', 0.6, 0.34, 0.52, x, y, z); const col = ['#ef4444', '#84cc16', '#f59e0b'][i % 3]; for (let q = 0; q < 6; q++) b.sph('mat', col, 0.08, x - 0.18 + (q % 3) * 0.18, 0.36, z - 0.1 + (q / 3 | 0) * 0.2, 0.9, 6); }
    for (let i = 0; i < 4; i++) b.sph('mat', '#c9b48a', 0.34, 85.4 + (i % 2) * 0.6, 0.3 + (i > 1 ? 0.45 : 0), 41.2 + (i % 2) * 0.1, 0.75, 8);
    for (let i = 0; i < 6; i++) b.box('mat', '#2e4a6b', 0.5, 0.36, 0.4, 82.2 + (i % 2) * 0.52, 0.18 + (i / 2 | 0) * 0.37, 47.5);
    // staff corner (west half, middle): lockers, desk + chair + lamp, rota board, clock
    for (let i = 0; i < 5; i++) { b.box('gls', '#2e4a6b', 0.5, 1.9, 0.5, 82 + i * 0.52, 0.95, 51.3); b.box('mat', '#9aa0a6', 0.08, 0.04, 0.02, 82 + i * 0.52 + 0.14, 1.1, 51.04); for (let v = 0; v < 3; v++) b.box('mat', '#1c3550', 0.3, 0.02, 0.01, 82 + i * 0.52, 1.6 + v * 0.06, 51.04); }
    box(81.7, 84.6, 51, 51.6);
    b.box('mat', '#a77b4f', 1.6, 0.05, 0.8, 87.4, 0.76, 50.6); for (const [dx, dz] of [[-0.72, -0.34], [0.72, -0.34], [-0.72, 0.34], [0.72, 0.34]]) b.box('mat', '#201e1d', 0.05, 0.74, 0.05, 87.4 + dx, 0.37, 50.6 + dz);
    b.box('gls', '#201e1d', 0.5, 0.32, 0.03, 87.6, 0.98, 50.85); b.box('glo', '#9fd6ff', 0.44, 0.26, 0.01, 87.6, 0.98, 50.83); b.cyl('mat', '#201e1d', 0.08, 0.02, 86.9, 0.8, 50.8, 10); b.box('mat', '#201e1d', 0.02, 0.36, 0.02, 86.9, 0.97, 50.8); b.cyl('mat', '#ec3013', 0.12, 0.12, 86.9, 1.17, 50.7, 10, 0.5, 0, 0.4);
    b.box('mat', '#201e1d', 0.5, 0.06, 0.5, 87.4, 0.48, 49.9); b.box('mat', '#201e1d', 0.5, 0.5, 0.06, 87.4, 0.75, 49.66); b.cyl('mat', '#6b7278', 0.04, 0.45, 87.4, 0.22, 49.9, 6); box(86.5, 88.3, 50.1, 51.1);
    b.box('mat', '#f3f2f2', 1.6, 1.0, 0.04, 87.4, 1.9, 51.08); for (let rr = 0; rr < 6; rr++) b.box('mat', rr ? '#c9c4bd' : '#ec3013', 1.44, 0.03, 0.01, 87.4, 2.28 - rr * 0.13, 51.05);
    b.cyl('mat', '#f3f2f2', 0.2, 0.03, 89.6, 2.6, 51.06, 16, Math.PI / 2); b.box('mat', '#201e1d', 0.02, 0.14, 0.01, 89.6, 2.63, 51.04); b.box('mat', '#201e1d', 0.1, 0.02, 0.01, 89.64, 2.6, 51.04);
    b.box('mat', '#d9d6d0', 0.12, 2.9, 4.4, 89.5, 1.45, 53.2); // partition between staff corner + racks (stops at 2.9 m)
    // mop sink + cleaning cart + bins (east wall)
    b.box('gls', '#c9ced3', 0.9, 0.5, 0.7, 91.3, 0.25, 48.2); b.box('gls', '#7c8288', 0.04, 0.4, 0.04, 91.5, 0.8, 48.2); b.box('mat', '#ffd23a', 0.5, 0.6, 0.4, 90.5, 0.3, 49.2); b.cyl('mat', '#6b7278', 0.015, 1.4, 90.6, 0.9, 49.1, 6, 0.15);
    for (const z of [45.8, 46.6]) b.cyl('mat', '#3f6a2c', 0.32, 0.9, 91.3, 0.45, z, 12); box(90.2, 92, 45.4, 49.6);
    // strip lights at 3.4 m
    for (const z of [43, 48, 53]) { b.box('mat', '#201e1d', 2.4, 0.06, 0.18, 86.6, 3.43, z); b.box('glo', '#fff6dc', 2.3, 0.02, 0.12, 86.6, 3.39, z); for (const dx of [-1, 1]) b.box('mat', '#201e1d', 0.01, 3.6, 0.01, 86.6 + dx, 5.2, z); }
    b.build(boh); }

  // ================= MERU LANES: redesigned in step 10 art pass 6b, worlds/meru2-funrooms.js (Dash bowls lane one, worlds/meru-bowler.js) =================
  const lanes = buildLanes2({ THREE, scene, kit, cols, M, toon, touch: matchMedia('(pointer: coarse)').matches }); spots.push(...lanes.spots);

  // ================= ITEM SHOP · ARMORY · FORTUNE TELLER: step 10 art pass 6a, worlds/meru2-shoprooms.js =================
  const shops = buildShopRooms({ THREE, scene, kit, cols, KEEPERS, touch: matchMedia('(pointer: coarse)').matches }); spots.push(...shops.spots);

  function tick(dt, t, cam) { if (cam) boh.visible = Math.hypot(cam.x - 86, cam.z - 48) < (matchMedia('(pointer: coarse)').matches ? 60 : 120); for (const f of npcs) kit.animFox(f, dt, 0, false); for (const f of shops.npcs) kit.animFox(f, dt, 0, false); shops.tick(dt, t, cam); lanes.tick(dt, t, cam); }
  return { spots, tick, lanes };
}
