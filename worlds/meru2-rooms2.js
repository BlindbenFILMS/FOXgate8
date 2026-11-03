// MERU 2.0 — step 3: interiors, part 2. BURGERS [meruBurgers] (diner + the Sizzle job), MERU LANES [meruBowling] (tenpin),
// ITEM SHOP [meruItemshop] (Kia), ARMORY [meruArmory] (Bram), FORTUNE TELLER [meruFortune] (Ora). Stock + prices come from worlds/meru-shops.js.
import { KEEPERS } from './meru-shops.js';
import { buildDiner } from '../minigames/meru/diner-room.js';
import { buildShopRooms } from './meru2-shoprooms.js';
import { buildLanes2 } from './meru2-funrooms.js';
import { makeRoomKit } from './meru2-roomkit.js';
import { buildGrocery } from './meru2-grocery.js';
export function buildRooms2({ THREE, scene, M, toon, kit, cols, grad }) {
  const B = (w, h, d, col, x, y, z, ry = 0, o = 0.02) => { const m = M(new THREE.BoxGeometry(w, h, d), typeof col === 'string' ? toon(col) : col, x, y, z, null, o); m.rotation.y = ry; return m; };
  const C = (r, h, col, x, y, z, o = 0.02, n = 20) => M(new THREE.CylinderGeometry(r, r, h, n), typeof col === 'string' ? toon(col) : col, x, y, z, null, o);
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] }), glow = c => new THREE.MeshBasicMaterial({ color: c });
  const fox = (key, opt, x, z, ry) => { const f = kit.makeFox({ key, ...opt }); f.position.set(x, 0, z); f.rotation.y = ry; scene.add(f); ring(x, z, 0.5); return f; };
  const spots = [], npcs = [];

  // ================= BURGERS (f 70..114 × 32..64 since s33: twice the size, door W at z 48) =================
  // step 10: Sizzle's diner from the Burgers job (minigames/meru/diner-room.js buildDiner), turned so its customer side faces the west door.
  // Its own outer walls, front window and ceiling are hidden (the city shell has real windows); the back wall stays as the counter wall.
  { const CTX = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
    const K = buildDiner({ THREE, M, toon, canvasTex: CTX, scene, grad, origin: { x: 0, z: 0 } }), root = K.root;
    // s34 (Ben): the diner's counter is against the SOUTH wall now (customers face north), centred in the hall, so the front door (W, z 48) and the
    // back door (E, z 48, through the staff door) are joined by a clear lane z 45..51 and the counter is reached straight from it
    const DCX = 86.7, DCZ = 59; root.rotation.y = Math.PI; root.position.set(DCX, 0.064, DCZ); root.updateMatrixWorld(true); K.rootM0 = root.matrixWorld.clone(); K.kids0 = root.children.slice();   /* s102: the town move re-parents these children into the moved Burgers group; the burger shift finds the diner's real frame from them */
    const hide = new Set(K.front); for (const c of root.children) { const p = c.geometry && c.geometry.parameters;
      if (c.geometry && c.geometry.type === 'PlaneGeometry' && p.height >= 4 && c.rotation.x === 0 && Math.abs(c.position.z + 5) > 0.01) hide.add(c);   // side + front walls
      if (c.geometry && c.geometry.type === 'PlaneGeometry' && p.height === 8) hide.add(c);                                          // kitchen floor behind the back wall
      if (c.geometry && c.geometry.type === 'BoxGeometry' && p.width === 12 && p.depth === 10) hide.add(c); }                         // ceiling
    for (const c of hide) c.visible = false;
    for (const c of root.children) if (c.geometry && c.geometry.type === 'PlaneGeometry' && Math.abs(c.position.z + 5) < 0.01 && c.material) c.material.side = THREE.DoubleSide;
    // colliders (world): kitchen block behind the front counter, booths, jukebox
    box(DCX - 6, DCX + 6, DCZ + 0.9, DCZ + 5.3); box(DCX + 1.9, DCX + 5.3, DCZ - 4.6, DCZ); ring(DCX - 5.2, DCZ - 2.6, 0.6);
    npcs.push(fox('burgerCook', { torso: '#f3f2f2', outfit: 'vest' }, DCX, DCZ + 3.4, Math.PI), fox('michaelJay', { torso: '#2e4a6b', outfit: 'coat' }, DCX - 3.2, DCZ - 3.4, 0));
    spots.push({ key: 'burgersJob', x: DCX, z: DCZ - 0.4, r: 1.8, prompt: 'PUT ME TO WORK \u00b7 BURGERS JOB', play: { label: 'BURGERS', url: 'Meru Burgers.dc.html?embed=1' }, burger: { K } }); }   /* s102: the shift plays in this diner (walk burgStart) */

  // BURGERS BACK OF HOUSE (x 81.4..92 × 40..56, behind the diner's counter wall; seen through the shell's N + S windows): walk-in cooler, dry store racks,
  // produce crates, sacks, syrup boxes, staff lockers + desk + rota board, mop sink, bins, strip lights. Merged by material (4 draws), hides by distance.
  const boh = new THREE.Group(); scene.add(boh); const BOH_DX = 22, bohCol0 = cols.length;   // s33: the back of house moved to the east end of the doubled shop
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
    for (let i = 0; i < 6; i++) b.box('mat', '#2e4a6b', 0.5, 0.36, 0.4, 82.2 + (i % 2) * 0.52, 0.18 + (i / 2 | 0) * 0.37, 43.4);
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
    { const MZ = 4.6;   // s34: moved south off the back-door lane
    b.box('gls', '#c9ced3', 0.9, 0.5, 0.7, 91.3, 0.25, 48.2 + MZ); b.box('gls', '#7c8288', 0.04, 0.4, 0.04, 91.5, 0.8, 48.2 + MZ); b.box('mat', '#ffd23a', 0.5, 0.6, 0.4, 90.5, 0.3, 49.2 + MZ); b.cyl('mat', '#6b7278', 0.015, 1.4, 90.6, 0.9, 49.1 + MZ, 6, 0.15);
    for (const z of [45.8, 46.6]) b.cyl('mat', '#3f6a2c', 0.32, 0.9, 91.3, 0.45, z + MZ, 12); box(90.2, 92, 45.4 + MZ, 49.6 + MZ); }
    // strip lights at 3.4 m
    for (const z of [43, 48, 53]) { b.box('mat', '#201e1d', 2.4, 0.06, 0.18, 86.6, 3.43, z); b.box('glo', '#fff6dc', 2.3, 0.02, 0.12, 86.6, 3.39, z); for (const dx of [-1, 1]) b.box('mat', '#201e1d', 0.01, 3.6, 0.01, 86.6 + dx, 5.2, z); }
    b.build(boh); }
  boh.position.x = BOH_DX; for (let i = bohCol0; i < cols.length; i++) { const c = cols[i]; if (c.f) { c.f[0] += BOH_DX; c.f[1] += BOH_DX; } else if (c.c) c.c[0] += BOH_DX; }
  // s33 DINING HALL (x 70..103.4 × 32..64 round the diner): checker floor, red booths along the north + south walls, round tables with stools in the middle,
  // pendant lamps, a staff wall with a door to the back of house, a BURGERS neon on the hall wall. Merged by material.
  { const touch = matchMedia('(pointer: coarse)').matches, K3 = makeRoomKit({ THREE, touch }), b = K3.Bin(), hall = new THREE.Group(); scene.add(hall);
    const chk = K3.CT(64, 64, (g, w) => { g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, w, w); g.fillStyle = '#1b1b22'; g.fillRect(0, 0, w / 2, w / 2); g.fillRect(w / 2, w / 2, w / 2, w / 2); });
    { const fm = K3.flat(hall, chk, 21.4, 31.6, 92.65, 0.052, 48, 1.2); const ms = fm && fm.isMesh ? [fm] : hall.children.slice(-1); for (const m of ms) if (m.material) { m.material.polygonOffset = true; m.material.polygonOffsetFactor = -1; m.material.polygonOffsetUnits = -1; } }   // hall floor east of the diner (x 81.95..103.35), above the shell floor
    { const fm2 = K3.flat(hall, Object.assign(chk.clone(), { needsUpdate: true }), 11.9, 31.6, 76, 0.05, 48, 1.2); const m2 = fm2 && fm2.isMesh ? fm2 : hall.children[hall.children.length - 1]; if (m2 && m2.material) { m2.material.polygonOffset = true; m2.material.polygonOffsetFactor = -1; } }   // round the diner (x 70..81.95), under the diner's own floor
    const RED = '#c42d3c', CHROME = '#cbd5e1', CREAM = '#f2ead8';
    // booths: two benches facing over a table, against the north (z 32.5) and south (z 63.5) walls
    for (const wz of [32.6, 63.4]) { const s = wz < 48 ? 1 : -1; for (let x = 73; x <= 100; x += 4.5) { if (wz > 48 && x > 80 && x < 93.4) continue;   // s34: the diner stands against the south wall here
      const tz = wz + s * 1.0; b.box('mat', '#f3f2f2', 1.2, 0.06, 1.3, x, 0.76, tz); b.box('gls', CHROME, 1.24, 0.04, 1.34, x, 0.73, tz); b.cyl('gls', CHROME, 0.06, 0.72, x, 0.36, tz, 8);
      for (const dx of [-1, 1]) { const bx = x + dx * 1.15; b.box('mat', RED, 0.6, 0.45, 1.3, bx, 0.25, tz); b.box('mat', RED, 0.18, 0.8, 1.3, bx + dx * 0.25, 0.85, tz); b.box('gls', CHROME, 0.62, 0.04, 1.32, bx, 0.49, tz); }
      b.box('mat', '#201e1d', 0.03, 1.4, 0.03, x, 3.5, tz); b.cyl('mat', RED, 0.24, 0.22, x, 2.75, tz, 12); b.cyl('glo', '#fff2cc', 0.2, 0.02, x, 2.63, tz, 12);
      box(x - 1.6, x + 1.6, Math.min(wz, tz + s * 0.7), Math.max(wz, tz + s * 0.7)); } }
    // round tables + 4 stools in the hall (behind the diner kitchen)
    // s34: evenly spread, none on the door-to-door lane (z 45..51) or in front of the counter: 2 rows of 5 in the north half,
    // 2 x 2 each side of the diner in the south half
    const TABLES = [...[75, 80.5, 86, 91.5, 97].flatMap(x => [[x, 38.4], [x, 42.8]]), ...[[74.5, 54.6], [78.5, 54.6], [74.5, 58.6], [78.5, 58.6], [96.3, 54.6], [100.3, 54.6], [96.3, 58.6], [100.3, 58.6]]];
    for (const [x, z] of TABLES) { b.cyl('mat', CREAM, 0.6, 0.05, x, 0.78, z, 18); b.cyl('gls', CHROME, 0.05, 0.75, x, 0.38, z, 8); b.cyl('gls', CHROME, 0.32, 0.03, x, 0.02, z, 14);
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.6, sx = x + Math.sin(a) * 0.95, sz = z + Math.cos(a) * 0.95; b.cyl('mat', RED, 0.22, 0.08, sx, 0.52, sz, 12); b.cyl('gls', CHROME, 0.035, 0.5, sx, 0.25, sz, 6); }
      b.cyl('mat', '#ffd23a', 0.06, 0.12, x + 0.2, 0.87, z, 8); b.cyl('mat', RED, 0.05, 0.16, x - 0.15, 0.89, z + 0.1, 8);
      b.box('mat', '#201e1d', 0.03, 1.6, 0.03, x, 3.6, z); b.cyl('mat', '#201e1d', 0.3, 0.25, x, 2.7, z, 12); b.cyl('glo', '#fff2cc', 0.26, 0.02, x, 2.57, z, 12); ring(x, z, 1.3); }
    // staff wall between the hall and the back of house (door gap z 46..50) + STAFF ONLY plate
    for (const [z0, z1] of [[32.2, 46], [50, 63.8]]) { b.box('mat', CREAM, 0.2, 4.2, z1 - z0, 103.35, 2.1, (z0 + z1) / 2); b.box('mat', RED, 0.24, 1.0, z1 - z0, 103.35, 0.5, (z0 + z1) / 2); box(103.2, 103.5, z0, z1); }
    b.box('mat', CREAM, 0.2, 1.4, 4, 103.35, 3.5, 48); b.box('mat', '#201e1d', 0.04, 0.3, 1.4, 103.22, 2.8, 48);
    // chrome rail + red base round the hall walls
    for (const z of [32.25, 63.75]) b.box('gls', CHROME, 33, 0.06, 0.06, 86.7, 1.2, z);
    b.build(hall);
    { const c = document.createElement('canvas'); c.width = 1024; c.height = 228; const g = c.getContext('2d'); g.fillStyle = '#16161c'; g.fillRect(0, 0, 1024, 228); g.font = '900 150px Archivo, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff4fd8'; g.shadowBlur = 24; g.fillStyle = '#ff9bf0'; g.fillText('BURGERS', 512, 120);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.2), new THREE.MeshBasicMaterial({ map: t })); m.position.set(103.2, 3.3, 41); m.rotation.y = -Math.PI / 2; hall.add(m); }
    boh.userData.hall = hall; }

  // ================= MERU LANES: redesigned in step 10 art pass 6b, worlds/meru2-funrooms.js (Dash bowls lane one, worlds/meru-bowler.js) =================
  const lanes = buildLanes2({ THREE, scene, kit, cols, M, toon, grad, touch: matchMedia('(pointer: coarse)').matches }); spots.push(...lanes.spots);

  // ================= ITEM SHOP · ARMORY · FORTUNE TELLER: step 10 art pass 6a, worlds/meru2-shoprooms.js =================
  const shops = buildShopRooms({ THREE, scene, kit, cols, KEEPERS, touch: matchMedia('(pointer: coarse)').matches }); spots.push(...shops.spots);
  // s33: the Item Shop is three times bigger: the MERU MARKET grocery round + behind Kia (worlds/meru2-grocery.js)
  const grocery = buildGrocery({ THREE, scene, M, toon, grad, cols, touch: matchMedia('(pointer: coarse)').matches }); spots.push(...grocery.spots);

  function tick(dt, t, cam) { grocery.tick(dt, t, cam); if (cam) { const v = Math.hypot(cam.x - 92, cam.z - 48) < (matchMedia('(pointer: coarse)').matches ? 60 : 120); boh.visible = v; if (boh.userData.hall) boh.userData.hall.visible = v; } for (const f of npcs) kit.animFox(f, dt, 0, false); for (const f of shops.npcs) kit.animFox(f, dt, 0, false); shops.tick(dt, t, cam); lanes.tick(dt, t, cam); }
  return { spots, tick, lanes };
}
