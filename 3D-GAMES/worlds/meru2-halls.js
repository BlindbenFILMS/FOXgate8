// MERU 2.0 — step 10 ART PASS 6d part 2: TOWN SQUARE STATION hall + CAR RENTAL, dressed with the shared room kit
// (worlds/meru2-roomkit.js, merged by material). Both sit inside the city shells (worlds/meru2-city.js does the walls + cutaway).
// Station: stone floor with a red inlay line between the two doors (x = 0 kept clear for the TRAIN RIDE demo), the ticket office
// (glass counter, TICKETS sign, the ticketClerk avatar), 3 ticket machines, a DEPARTURES board, a loop map, benches, columns, a clock,
// a newsstand. Car Rental: plank floor, the rental desk (same place + collider as before), the rentalClerk avatar, a key board, waiting chairs.
import { makeRoomKit } from './meru2-roomkit.js';
export function buildHalls({ THREE, scene, kit, cols, L, touch }) {
  const { CT, Bin, flat, planks, signTex, pendant, rnd } = makeRoomKit({ THREE, touch });
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1], y1: 3.5 }), ring = (x, z, r) => cols.push({ c: [x, z, r], y1: 3.5 });
  const fox = (key, torso, outfit, x, z, ry) => { const f = kit.makeFox({ key, torso, outfit }); f.position.set(x, 0, z); f.rotation.y = ry; scene.add(f); ring(x, z, 0.45); return f; };
  const plane = (G, tex, w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const far = touch ? 55 : 95, npcs = [];
  const plant = (b, x, z, s = 1) => { b.cyl('mat', '#3d3b3a', 0.3 * s, 0.6 * s, x, 0.3 * s, z, 12, 0, 0, 1.1); for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, r = (0.12 + (k % 3) * 0.09) * s; b.sph('mat', k % 2 ? '#3d6b4a' : '#4f8a5c', 0.26 * s, x + Math.cos(a) * r, (0.85 + (k % 4) * 0.24) * s, z + Math.sin(a) * r, 1.4, 6); } ring(x, z, 0.4 * s); };

  // =================== TOWN SQUARE STATION (f -20..20 × 112..132, doors N + S at x 0) ===================
  const SG = new THREE.Group(); scene.add(SG); const s = Bin();
  const stoneT = CT(256, 256, (g, w) => { g.fillStyle = '#9a958d'; g.fillRect(0, 0, w, w); const t = w / 2; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const k = 0.93 + rnd() * 0.1; g.fillStyle = `rgb(${214 * k | 0},${209 * k | 0},${200 * k | 0})`; g.fillRect(i * t + 1.5, j * t + 1.5, t - 3, t - 3);
      for (let q = 0; q < 220; q++) { g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)'; g.fillRect(i * t + rnd() * t, j * t + rnd() * t, 2, 2); } } });
  flat(SG, stoneT, 39.2, 19.2, 0, 0.06, 122, 2.4);
  s.box('mat', '#ec3013', 0.32, 0.01, 19.2, 0, 0.068, 122); for (const x of [-2.3, 2.3]) s.box('mat', '#d9b23e', 0.4, 0.012, 19.2, x, 0.068, 122);
  // ticket office: a glazed booth on the west side, the clerk behind the counter
  const bx0 = -19.6, bx1 = -9, bz0 = 117, bz1 = 127;
  s.box('mat', '#201e1d', 0.5, 1.1, bz1 - bz0, bx1, 0.55, (bz0 + bz1) / 2); s.box('gls', '#f3f2f2', 0.75, 0.06, bz1 - bz0 + 0.1, bx1, 1.13, (bz0 + bz1) / 2); s.box('mat', '#ec3013', 0.02, 0.12, bz1 - bz0, bx1 + 0.26, 0.95, (bz0 + bz1) / 2);
  s.box('glass', '#cfe9ff', 0.04, 1.5, bz1 - bz0, bx1 - 0.1, 1.9, (bz0 + bz1) / 2); for (let z = bz0; z <= bz1 + 0.01; z += (bz1 - bz0) / 3) s.box('gls', '#201e1d', 0.1, 1.5, 0.1, bx1 - 0.1, 1.9, z);
  s.box('mat', '#201e1d', 0.3, 0.9, bz1 - bz0 + 0.2, bx1 - 0.1, 3.1, (bz0 + bz1) / 2);
  for (const z of [bz0, bz1]) { s.box('mat', '#e6e3dc', bx1 - bx0, 3.55, 0.2, (bx0 + bx1) / 2, 1.775, z); s.box('mat', '#201e1d', bx1 - bx0, 0.14, 0.24, (bx0 + bx1) / 2, 0.07, z); }
  for (let i = 0; i < 3; i++) { const z = bz0 + (i + 0.5) * (bz1 - bz0) / 3; s.box('gls', '#c0c4cc', 0.3, 0.02, 0.5, bx1 + 0.1, 1.17, z); s.cyl('gls', '#c0c4cc', 0.12, 0.02, bx1 - 0.08, 1.55, z, 14, 0, Math.PI / 2);
    s.box('mat', '#5c6670', 0.7, 0.75, 1.6, bx1 - 0.85, 0.375, z); s.box('mat', '#3d3b3a', 0.74, 0.04, 1.64, bx1 - 0.85, 0.77, z); s.box('mat', '#201e1d', 0.03, 0.3, 0.45, bx1 - 1.1, 0.98, z - 0.3); s.box('glo', '#9fd6ff', 0.01, 0.26, 0.41, bx1 - 1.08, 0.98, z - 0.3); }
  for (let j = 0; j < 4; j++) { s.box('gls', '#7c8794', 0.4, 0.03, 6, -19.2, 0.6 + j * 0.55, 122); for (let i = 0; i < 12; i++) s.box('mat', ['#2e4a6b', '#ec3013', '#f3efe2', '#5c6670'][(i + j) % 4], 0.3, 0.3 + (i % 3) * 0.06, 0.32, -19.2, 0.78 + j * 0.55, 119.4 + i * 0.44); }
  plane(SG, signTex('TICKETS'), 3.6, 0.68, bx1 + 0.06, 3.1, 122, Math.PI / 2);
  box(bx0, bx1 + 0.4, bz0 - 0.15, bz1 + 0.15);
  npcs.push(fox('ticketClerk', '#2e4a6b', 'vest', -10.2, 120.4, Math.PI / 2));
  // ticket machines on the north wall (west of the door)
  for (const x of [-16.5, -14.5, -12.5]) { s.box('gls', '#ec3013', 1.2, 1.9, 0.6, x, 0.95, 112.75); s.box('mat', '#201e1d', 1.0, 0.65, 0.02, x, 1.45, 113.06); s.box('glo', '#ffd23a', 0.9, 0.12, 0.01, x, 1.68, 113.075); s.box('glo', '#9fd6ff', 0.6, 0.36, 0.01, x - 0.1, 1.38, 113.075);
    s.box('mat', '#3d3b3a', 0.5, 0.12, 0.1, x, 0.9, 113.1); s.box('gls', '#c0c4cc', 0.24, 0.24, 0.02, x + 0.32, 1.38, 113.07); } box(-17.2, -11.8, 112.4, 113.1);
  // newsstand in the south-west corner
  s.box('mat', '#2e4a6b', 3.2, 1.0, 1.4, -15, 0.5, 130.3); s.box('gls', '#f3f2f2', 3.3, 0.05, 1.5, -15, 1.03, 130.3); for (let i = 0; i < 9; i++) s.box('mat', ['#ec3013', '#ffd23a', '#f3efe2', '#9fd6ff'][i % 4], 0.3, 0.02, 0.4, -16.3 + i * 0.32, 1.07, 130.05, 0.1 * (i % 3 - 1));
  s.box('mat', '#201e1d', 3.2, 1.7, 0.1, -15, 1.9, 131.1); for (let j = 0; j < 3; j++) for (let i = 0; i < 8; i++) s.box('mat', ['#ec3013', '#2e4a6b', '#ffd23a', '#f3efe2'][(i + j) % 4], 0.3, 0.42, 0.03, -16.2 + i * 0.34, 1.35 + j * 0.5, 131.04);
  s.box('mat', '#ec3013', 3.4, 0.4, 1.7, -15, 3.0, 130.4); box(-16.6, -13.4, 129.5, 131.5);
  // DEPARTURES board on the east wall + the benches facing it
  const dep = CT(512, 256, (g, w, h) => { g.fillStyle = '#14181c'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, 40); g.fillStyle = '#ffffff'; g.font = '900 26px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('DEPARTURES \u00b7 LOOP', 16, 21);
    const st = L.TRAIN.stops.map(k => (L.BUILDINGS.find(b => b.key === k) || { label: k }).label.toUpperCase().replace(' STATION', '')).slice(1);
    st.forEach((n, i) => { const y = 62 + i * 38; g.fillStyle = '#ffb347'; g.font = '800 22px Archivo, sans-serif'; g.fillText(n, 16, y); g.fillText('PLATFORM 1', 300, y); g.fillStyle = i === 0 ? '#7cff9b' : '#ffb347'; g.fillText(i === 0 ? 'NEXT' : 'ON TIME', 430, y); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, y + 18, w, 1); }); });
  plane(SG, dep, 7.6, 3.8, 19.45, 3.4, 122, -Math.PI / 2); s.box('mat', '#201e1d', 0.12, 4.0, 7.8, 19.55, 3.4, 122);
  for (const x of [9.5, 13.5]) for (const z of [118.6, 125.4]) { s.box('mat', '#a77b4f', 0.55, 0.08, 3.2, x, 0.46, z); s.box('mat', '#a77b4f', 0.08, 0.5, 3.2, x - 0.27, 0.78, z); for (const e of [-1.4, 1.4]) s.box('mat', '#201e1d', 0.5, 0.44, 0.08, x, 0.22, z + e); box(x - 0.35, x + 0.3, z - 1.65, z + 1.65); }
  for (const z of [116.6, 127.4]) { s.cyl('mat', '#2e4a6b', 0.26, 0.85, 16.5, 0.425, z, 10, 0, 0, 0.9); ring(16.5, z, 0.3); }
  // the loop map on the north wall (east of the door)
  const map = CT(512, 256, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, 34); g.fillStyle = '#ffffff'; g.font = '900 22px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU METRO \u00b7 THE LOOP', 14, 18);
    const P = L.TRAIN.line, xs = P.map(p => p[0]), zs = P.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs), sc = Math.min((w - 60) / (x1 - x0), (h - 70) / (z1 - z0)), X = x => 30 + (x - x0) * sc, Y = z => 50 + (z - z0) * sc;
    g.strokeStyle = '#ec3013'; g.lineWidth = 7; g.lineJoin = 'round'; g.beginPath(); P.forEach((p, i) => i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))); g.closePath(); g.stroke();
    g.font = '800 13px Archivo, sans-serif'; for (const k of L.TRAIN.stops) { const c = L.TRAIN.stopAt[k].c, b = L.BUILDINGS.find(q => q.key === k); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(X(c[0]), Y(c[1]), 7, 0, 7); g.fill(); g.lineWidth = 3; g.strokeStyle = '#201e1d'; g.stroke(); g.fillStyle = '#201e1d'; g.fillText(b.label.toUpperCase().replace(' STATION', ''), X(c[0]) + 10, Y(c[1]) - 10); } });
  plane(SG, map, 7, 3.5, 11, 2.9, 112.62, 0); s.box('mat', '#201e1d', 7.2, 3.7, 0.08, 11, 2.9, 112.55);
  // four columns, a hanging clock over the concourse, linear lights, plants
  for (const x of [-5.5, 5.5]) for (const z of [116.5, 127.5]) { s.box('mat', '#e6e3dc', 0.7, 7.6, 0.7, x, 3.8, z); s.box('mat', '#201e1d', 0.74, 0.3, 0.74, x, 0.15, z); s.box('mat', '#ec3013', 0.72, 0.1, 0.72, x, 2.4, z); box(x - 0.4, x + 0.4, z - 0.4, z + 0.4); }
  s.box('mat', '#201e1d', 0.03, 1.6, 0.03, 0, 5.6, 122); for (const sd of [-1, 1]) { s.cyl('mat', '#f3f2f2', 0.45, 0.05, 0, 4.4, 122 + sd * 0.06, 24, Math.PI / 2); s.tor('gls', '#201e1d', 0.45, 0.07, 0, 4.4, 122 + sd * 0.07, 0, 0); s.box('mat', '#201e1d', 0.03, 0.32, 0.01, 0, 4.5, 122 + sd * 0.09); s.box('mat', '#201e1d', 0.22, 0.03, 0.01, 0.08, 4.4, 122 + sd * 0.09, 0, 0, 0.4); }
  s.box('gls', '#201e1d', 0.3, 0.3, 0.3, 0, 4.85, 122);
  for (const z of [115, 122, 129]) for (const x of [-12, 0, 12]) { if (x === 0 && z === 122) continue; s.box('gls', '#201e1d', 6, 0.1, 0.3, x, 5.2, z); s.box('glo', '#f4f8ff', 5.8, 0.02, 0.22, x, 5.145, z); for (const e of [-2.6, 2.6]) s.box('mat', '#201e1d', 0.01, 2.6, 0.01, x + e, 6.5, z); }
  plant(s, 18.9, 113.2, 1.2); plant(s, 18.9, 130.8, 1.2); plant(s, -6.6, 113.2); plant(s, 6.6, 130.8);
  s.build(SG);

  // =================== CAR RENTAL (f 118..132 × 26..38, door N at 125) ===================
  const RG = new THREE.Group(); scene.add(RG); const r = Bin(), RB = L.BUILDINGS.find(b => b.key === 'carRental'), dx = (RB.f[0] + RB.f[1]) / 2, dz = RB.f[3] - 2.6;
  flat(RG, planks('#b08b5e', '#6b4a32'), 13.2, 11.2, dx, 0.06, 32, 2.6);
  r.box('mat', '#201e1d', 4, 1.1, 0.9, dx, 0.55, dz); r.box('gls', '#f3f2f2', 4.1, 0.06, 1.0, dx, 1.13, dz); r.box('mat', '#ec3013', 3.9, 0.5, 0.02, dx, 0.6, dz - 0.46); r.box('mat', '#f3f2f2', 3.9, 0.04, 0.025, dx, 0.88, dz - 0.465);
  r.box('mat', '#201e1d', 0.5, 0.32, 0.04, dx - 1.0, 1.4, dz + 0.2); r.box('glo', '#9fd6ff', 0.46, 0.28, 0.01, dx - 1.0, 1.4, dz + 0.175); r.box('mat', '#201e1d', 0.06, 0.2, 0.06, dx - 1.0, 1.22, dz + 0.25);
  r.box('gls', '#c0c4cc', 0.5, 0.04, 0.3, dx + 0.9, 1.18, dz - 0.1); for (let i = 0; i < 3; i++) { r.tor('gls', '#c0c4cc', 0.04, 0.2, dx + 0.75 + i * 0.15, 1.21, dz - 0.12, Math.PI / 2, 0); r.box('mat', ['#ec3013', '#ffd23a', '#2e4a6b'][i], 0.06, 0.02, 0.1, dx + 0.75 + i * 0.15, 1.22, dz - 0.02); }
  r.box('mat', '#2e4a6b', 0.4, 0.3, 0.12, dx + 1.6, 1.3, dz - 0.25); for (let i = 0; i < 3; i++) r.box('mat', ['#f3efe2', '#ffd23a', '#f3efe2'][i], 0.1, 0.22, 0.02, dx + 1.48 + i * 0.12, 1.42, dz - 0.32);
  npcs.push(fox('rentalClerk', '#ec3013', 'vest', dx, dz + 1.2, Math.PI)); cols.pop();
  // back wall: key board + sign; customer side: chairs, low table, brochure rack, plants, a tyre stack
  r.box('mat', '#5a3d26', 3.4, 1.4, 0.06, dx, 1.8, 37.55); for (let j = 0; j < 3; j++) for (let i = 0; i < 8; i++) { const x = dx - 1.4 + i * 0.4, y = 2.25 - j * 0.42; r.box('gls', '#c0c4cc', 0.03, 0.03, 0.08, x, y, 37.5); r.box('mat', ['#ec3013', '#ffd23a', '#2e4a6b', '#f3efe2'][(i + j) % 4], 0.1, 0.14, 0.01, x, y - 0.12, 37.48); }
  plane(RG, signTex('CAR RENTAL'), 3.6, 0.68, dx, 3.2, 37.5, Math.PI);
  for (const z of [29, 30.2, 31.4]) { r.box('mat', '#ec3013', 0.55, 0.1, 0.55, 118.75, 0.45, z); r.box('mat', '#ec3013', 0.08, 0.5, 0.55, 118.5, 0.75, z); r.box('gls', '#c0c4cc', 0.04, 0.4, 0.04, 118.75, 0.2, z); r.cyl('gls', '#c0c4cc', 0.2, 0.02, 118.75, 0.01, z, 12); }
  box(118.2, 119.1, 28.6, 31.8); r.cyl('gls', '#f3f2f2', 0.4, 0.04, 119.9, 0.5, 30.2, 16); r.cyl('mat', '#201e1d', 0.05, 0.48, 119.9, 0.25, 30.2, 8); ring(119.9, 30.2, 0.42);
  r.box('mat', '#201e1d', 0.6, 1.5, 0.3, 131.4, 0.75, 29); for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) r.box('mat', ['#ec3013', '#f3efe2', '#ffd23a'][(i + j) % 3], 0.02, 0.3, 0.16, 131.08, 0.5 + j * 0.4, 28.82 + i * 0.18); box(131.1, 131.7, 28.8, 29.2);
  for (let i = 0; i < 4; i++) { r.cyl('mat', '#201e1d', 0.36, 0.24, 131, 0.12 + i * 0.25, 33, 16); r.cyl('gls', '#9aa0a6', 0.2, 0.25, 131, 0.12 + i * 0.25, 33, 12); } ring(131, 33, 0.4);
  plant(r, 119.0, 27.0); plant(r, 131.0, 27.0);
  for (const x of [dx - 1.3, dx, dx + 1.3]) pendant(r, x, dz + 0.2, 3.3, 6.5, '#ec3013');
  r.build(RG);

  function tick(dt, cam) { if (cam) { SG.visible = Math.hypot(cam.x, cam.z - 122) < far; RG.visible = Math.hypot(cam.x - dx, cam.z - 32) < far; } for (const f of npcs) kit.animFox(f, dt, 0, false); }
  return { tick };
}
