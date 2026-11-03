// MERU 2.0 — step 10 ART PASS 6d part 2: TOWN SQUARE STATION hall + CAR RENTAL, dressed with the shared room kit
// (worlds/meru2-roomkit.js, merged by material). Both sit inside the city shells (worlds/meru2-city.js does the walls + cutaway).
// Station: stone floor with a red inlay line between the two doors (x = 0 kept clear for the TRAIN RIDE demo), the ticket office
// (glass counter, TICKETS sign, the ticketClerk avatar), 3 ticket machines, a DEPARTURES board, a loop map, benches, columns, a clock,
// a newsstand. Car Rental: plank floor, the rental desk (same place + collider as before), the rentalClerk avatar, a key board, waiting chairs.
import { makeRoomKit } from './meru2-roomkit.js';
import { dressStation } from './meru2-stationdress.js?v=s728f';   // s728e station halls: vending, HELP, lost property, theme corner per station
export function buildHalls({ THREE, scene, kit, cols, L, touch }) {
  const { CT, Bin, flat, planks, signTex, pendant, rnd } = makeRoomKit({ THREE, touch });
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1], y1: 3.5 }), ring = (x, z, r) => cols.push({ c: [x, z, r], y1: 3.5 });
  const fox = (key, torso, outfit, x, z, ry) => { const f = kit.makeFox({ key, torso, outfit }); f.position.set(x, 0, z); f.rotation.y = ry; scene.add(f); ring(x, z, 0.45); return f; };
  const plane = (G, tex, w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const far = touch ? 55 : 95, npcs = [], desks = [];   // s35: desks = where E buys a ticket inside a hall (clerk counter + ticket machines); Town / Lake in their ORIGINAL frame (o: true)
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
  npcs.push(fox('ticketClerk', '#2e4a6b', 'vest', -10.2, 120.4, Math.PI / 2)); desks.push({ key: 'stationTown', x: -7.9, z: 120.4, o: true }, { key: 'stationTown', x: -14.5, z: 114.2, o: true });
  // ticket machines on the north wall (west of the door)
  for (const x of [-16.5, -14.5, -12.5]) { s.box('gls', '#ec3013', 1.2, 1.9, 0.6, x, 0.95, 112.75); s.box('mat', '#201e1d', 1.0, 0.65, 0.02, x, 1.45, 113.06); s.box('glo', '#ffd23a', 0.9, 0.12, 0.01, x, 1.68, 113.075); s.box('glo', '#9fd6ff', 0.6, 0.36, 0.01, x - 0.1, 1.38, 113.075);
    s.box('mat', '#3d3b3a', 0.5, 0.12, 0.1, x, 0.9, 113.1); s.box('gls', '#c0c4cc', 0.24, 0.24, 0.02, x + 0.32, 1.38, 113.07); } box(-17.2, -11.8, 112.4, 113.1);
  // newsstand in the south-west corner
  s.box('mat', '#2e4a6b', 3.2, 1.0, 1.4, -15, 0.5, 130.3); s.box('gls', '#f3f2f2', 3.3, 0.05, 1.5, -15, 1.03, 130.3); for (let i = 0; i < 9; i++) s.box('mat', ['#ec3013', '#ffd23a', '#f3efe2', '#9fd6ff'][i % 4], 0.3, 0.02, 0.4, -16.3 + i * 0.32, 1.07, 130.05, 0.1 * (i % 3 - 1));
  s.box('mat', '#201e1d', 3.2, 1.7, 0.1, -15, 1.9, 131.1); for (let j = 0; j < 3; j++) for (let i = 0; i < 8; i++) s.box('mat', ['#ec3013', '#2e4a6b', '#ffd23a', '#f3efe2'][(i + j) % 4], 0.3, 0.42, 0.03, -16.2 + i * 0.34, 1.35 + j * 0.5, 131.04);
  s.box('mat', '#ec3013', 3.4, 0.4, 1.7, -15, 3.0, 130.4); box(-16.6, -13.4, 129.5, 131.5);
  // DEPARTURES board on the east wall + the benches facing it
  // s35: each hall's DEPARTURES board lists the stops AFTER its own, in loop order (depFor(key)); dep = Town's
  const depFor = key => CT(512, 256, (g, w, h) => { g.fillStyle = '#14181c'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, 40); g.fillStyle = '#ffffff'; g.font = '900 26px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('DEPARTURES \u00b7 LOOP', 16, 21);
    const S0 = L.TRAIN.stops, k0 = Math.max(0, S0.indexOf(key)), st = S0.slice(k0 + 1).concat(S0.slice(0, k0)).map(k => (L.BUILDINGS.find(b => b.key === k) || { label: k }).label.toUpperCase().replace(' STATION', ''));
    st.forEach((n, i) => { const y = 62 + i * 38; g.fillStyle = '#ffb347'; g.font = '800 22px Archivo, sans-serif'; g.fillText(n, 16, y, 240); g.fillText('PLATFORM 1', 268, y, 118); g.fillStyle = i === 0 ? '#7cff9b' : '#ffb347'; g.fillText(i === 0 ? 'NEXT' : 'ON TIME', 400, y, 100); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, y + 18, w, 1); }); });
  const dep = depFor('stationTown');
  plane(SG, dep, 7.6, 3.8, 19.45, 3.4, 122, -Math.PI / 2); s.box('mat', '#201e1d', 0.12, 4.0, 7.8, 19.55, 3.4, 122);
  for (const x of [9.5, 13.5]) for (const z of [118.6, 125.4]) { s.box('mat', '#a77b4f', 0.7, 0.08, 3.2, x, 0.61, z); s.box('mat', '#a77b4f', 0.08, 0.6, 3.2, x - 0.35, 1.0, z); for (const e of [-1.4, 1.4]) s.box('mat', '#201e1d', 0.62, 0.6, 0.08, x, 0.3, z + e); box(x - 0.35, x + 0.3, z - 1.65, z + 1.65); }
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
  // s728n TOWN STATION EXTRAS (audit 48; same set as the 7 halls, placed by hand: doors x 0, ticket office W, benches + DEPARTURES E stay clear)
  { const VZ = 131.35; for (const [x, c] of [[6.4, '#ec3013'], [7.6, '#2e86b8']]) { s.box('gls', c, 1.1, 1.95, 0.8, x, 0.975, VZ); s.box('glass', '#cfe9ff', 0.8, 1.1, 0.02, x - 0.08, 1.15, VZ - 0.41);
      for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) s.box('mat', ['#ffd23a', '#f3f2f2', '#7dff6a', '#f97316'][(r + k) % 4], 0.14, 0.18, 0.1, x - 0.35 + k * 0.18, 0.75 + r * 0.26, VZ - 0.3); s.box('glo', '#ffffff', 0.9, 0.14, 0.01, x, 1.82, VZ - 0.41); s.box('mat', '#201e1d', 0.8, 0.18, 0.04, x - 0.08, 0.35, VZ - 0.41); } box(5.8, 8.2, 130.9, 131.8);
    for (const dx of [-1.05, 1.05]) s.box('mat', '#3d3b3a', 0.06, 1.8, 0.5, 12.1 + dx, 0.9, 131.5); for (const y of [0.3, 0.95, 1.6]) s.box('mat', '#5c6670', 2.1, 0.05, 0.5, 12.1, y, 131.5);
    [[-0.6, 0.55, '#7a5236', 0.5], [0.1, 0.5, '#ec3013', 0.4], [0.7, 0.48, '#2e4a6b', 0.36], [-0.5, 1.15, '#3f9a5e', 0.32], [0.4, 1.12, '#c9a227', 0.28], [-0.2, 1.75, '#f3f2f2', 0.24]].forEach(([dx, y, c, h]) => s.box('mat', c, 0.55, h, 0.36, 12.1 + dx, y - 0.02, 131.5)); box(11, 13.2, 131.2, 131.8);
    plane(SG, CT(256, 40, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23a'; g.font = '900 26px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('LOST PROPERTY', 10, h / 2 + 2); }), 1.6, 0.25, 12.1, 2.1, 131.7, Math.PI);
    s.box('gls', '#ec3013', 0.4, 1.7, 0.3, 4.2, 0.85, 112.55); s.box('glo', '#ffd23a', 0.16, 0.16, 0.02, 4.2, 1.3, 112.71); box(3.95, 4.45, 112.35, 112.75);
    plane(SG, CT(128, 40, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('HELP', 10, h / 2 + 2); }), 0.38, 0.12, 4.2, 1.58, 112.72, 0);
    s.box('gls', '#c0c4cc', 0.45, 0.9, 0.6, 19.5, 0.45, 114.4); s.box('gls', '#9aa0a6', 0.5, 0.08, 0.55, 19.47, 0.92, 114.4); s.cyl('gls', '#5c6670', 0.03, 0.12, 19.5, 1.0, 114.4, 8); box(19.2, 19.8, 114.05, 114.75);
    [['#2e86b8'], ['#3f9a5e'], ['#201e1d']].forEach(([c], i) => { s.cyl('mat', c, 0.27, 0.85, 19.45, 0.425, 129.2 + i * 0.65, 12, 0, 0, 0.92); s.cyl('mat', '#f3f2f2', 0.25, 0.04, 19.45, 0.87, 129.2 + i * 0.65, 12); }); box(19.1, 19.8, 128.9, 130.8);
    s.box('gls', '#9aa0a6', 1.0, 0.05, 0.6, 16.4, 0.3, 130.6, 0.3); s.box('gls', '#9aa0a6', 0.05, 0.9, 0.6, 15.92, 0.75, 130.45, 0.3); s.box('mat', '#7a5236', 0.7, 0.4, 0.45, 16.45, 0.53, 130.6, 0.3); s.box('mat', '#2e4a6b', 0.5, 0.3, 0.35, 16.45, 0.88, 130.6, 0.3); box(15.8, 17, 130.2, 131);
    for (const [x, z] of [[-2.6, 113.2], [2.6, 113.2], [-2.6, 130.8], [2.6, 130.8]]) { s.cyl('mat', '#3d3b3a', 0.32, 0.6, x, 0.3, z, 12); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283; s.sph('mat', k % 2 ? '#3d6b4a' : '#4f8a5c', 0.26, x + Math.cos(a) * 0.2, 0.85 + (k % 3) * 0.12, z + Math.sin(a) * 0.2, 1.3); } ring(x, z, 0.36); }
    for (let x = -8.4; x < -3.2; x += 0.5) s.box('mat', '#ffd23a', 0.42, 0.012, 0.3, x + 0.25, 0.07, 131.0); for (let x = 3.2; x < 18.6; x += 0.5) if (x < 5.4 || x > 13.6) s.box('mat', '#ffd23a', 0.42, 0.012, 0.3, x + 0.25, 0.07, 130.2);
    for (const [x, z] of [[-19.5, 131.5], [19.5, 112.5]]) { s.box('mat', '#f3f2f2', 0.2, 0.08, 0.2, x, 7.3, z); s.sph('gls', '#201e1d', 0.12, x, 7.22, z, 0.7); }
    plane(SG, CT(256, 360, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#f3f2f2'; g.fillRect(0, h - 90, w, 90); g.fillStyle = '#ec3013'; g.font = '900 28px Archivo, sans-serif'; g.textBaseline = 'top'; g.fillText('MERU TOWN SQUARE', 14, h - 82, w - 28); g.font = '800 18px Archivo, sans-serif'; g.fillText('THE HEART OF THE LOOP', 14, h - 40, w - 28); g.fillStyle = '#f3f2f2'; g.fillRect(w * 0.4, h * 0.18, 18, h * 0.42); g.beginPath(); g.arc(w * 0.4 + 9, h * 0.18, 34, 0, 7); g.fill(); }), 1.2, 1.7, -6.2, 1.9, 131.7, Math.PI); s.box('mat', '#201e1d', 1.3, 1.8, 0.04, -6.2, 1.9, 131.74); }
  try { npcs.push(fox('commuterB', '#2e86b8', 'coat', 15.6, 121.8, -Math.PI / 2)); } catch (e) {}

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
  for (const z of [29, 30.2, 31.4]) { r.box('mat', '#ec3013', 0.6, 0.1, 0.6, 118.75, 0.6, z); r.box('mat', '#ec3013', 0.08, 0.6, 0.6, 118.47, 0.95, z); r.box('gls', '#c0c4cc', 0.04, 0.55, 0.04, 118.75, 0.28, z); r.cyl('gls', '#c0c4cc', 0.2, 0.02, 118.75, 0.01, z, 12); }
  box(118.2, 119.1, 28.6, 31.8); r.cyl('gls', '#f3f2f2', 0.4, 0.04, 119.9, 0.5, 30.2, 16); r.cyl('mat', '#201e1d', 0.05, 0.48, 119.9, 0.25, 30.2, 8); ring(119.9, 30.2, 0.42);
  r.box('mat', '#201e1d', 0.6, 1.5, 0.3, 131.4, 0.75, 29); for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) r.box('mat', ['#ec3013', '#f3efe2', '#ffd23a'][(i + j) % 3], 0.02, 0.3, 0.16, 131.08, 0.5 + j * 0.4, 28.82 + i * 0.18); box(131.1, 131.7, 28.8, 29.2);
  for (let i = 0; i < 4; i++) { r.cyl('mat', '#201e1d', 0.36, 0.24, 131, 0.12 + i * 0.25, 33, 16); r.cyl('gls', '#9aa0a6', 0.2, 0.25, 131, 0.12 + i * 0.25, 33, 12); } ring(131, 33, 0.4);
  plant(r, 119.0, 27.0); plant(r, 131.0, 27.0);
  for (const x of [dx - 1.3, dx, dx + 1.3]) pendant(r, x, dz + 0.2, 3.3, 6.5, '#ec3013');
  r.build(RG);

  // =================== s35: LAKE STATION (ORIGINAL frame f -60..-30 × 180..198, door N (-45, 180), side door E (-30, 195) to the covered walk + lift;
  // worlds/meru2-relocate.js carries it to the moved shell). Same kit as Town: ticket office + clerk, 3 machines, DEPARTURES, loop map, benches, lights, plants.
  // Lanes kept clear: N door → x -47..-43, E door → z 193..197.
  if (L.BUILDINGS.some(b => b.key === 'stationLake')) {   // s40: Lake Station was dropped (big map step 2); kept for ?old layouts
  const LG = new THREE.Group(); scene.add(LG); const q = Bin(), lmark = new THREE.Object3D(); lmark.position.set(-45, 0, 189); LG.add(lmark);
  flat(LG, stoneT, 29.2, 17.2, -45, 0.06, 189, 2.4); q.box('mat', '#ec3013', 0.32, 0.01, 8.4, -45, 0.068, 184.4); q.box('mat', '#ec3013', 13.6, 0.01, 0.32, -37, 0.068, 195);   // stone floor + red inlay lines from both doors
  { const b0 = -59.6, b1 = -53, z0 = 183, z1 = 191, zc = (z0 + z1) / 2;
    q.box('mat', '#201e1d', 0.5, 1.1, z1 - z0, b1, 0.55, zc); q.box('gls', '#f3f2f2', 0.75, 0.06, z1 - z0 + 0.1, b1, 1.13, zc); q.box('mat', '#ec3013', 0.02, 0.12, z1 - z0, b1 + 0.26, 0.95, zc);
    q.box('glass', '#cfe9ff', 0.04, 1.5, z1 - z0, b1 - 0.1, 1.9, zc); for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 3) q.box('gls', '#201e1d', 0.1, 1.5, 0.1, b1 - 0.1, 1.9, z);
    q.box('mat', '#201e1d', 0.3, 0.9, z1 - z0 + 0.2, b1 - 0.1, 3.1, zc);
    for (const z of [z0, z1]) { q.box('mat', '#e6e3dc', b1 - b0, 3.55, 0.2, (b0 + b1) / 2, 1.775, z); q.box('mat', '#201e1d', b1 - b0, 0.14, 0.24, (b0 + b1) / 2, 0.07, z); }
    for (let i = 0; i < 2; i++) { const z = z0 + (i + 0.5) * (z1 - z0) / 2; q.box('gls', '#c0c4cc', 0.3, 0.02, 0.5, b1 + 0.1, 1.17, z); q.box('mat', '#5c6670', 0.7, 0.75, 1.6, b1 - 0.85, 0.375, z); q.box('mat', '#201e1d', 0.03, 0.3, 0.45, b1 - 1.1, 0.98, z - 0.3); q.box('glo', '#9fd6ff', 0.01, 0.26, 0.41, b1 - 1.08, 0.98, z - 0.3); }
    plane(LG, signTex('TICKETS'), 3.6, 0.68, b1 + 0.06, 3.1, zc, Math.PI / 2); box(b0, b1 + 0.4, z0 - 0.15, z1 + 0.15);
    desks.push({ key: 'stationLake', x: b1 + 1.1, z: zc - 1.6, o: true }, { key: 'stationLake', x: -55.5, z: 182.2, o: true });
    try { const cf = fox('ticketClerk', '#2e4a6b', 'vest', b1 - 1.2, zc - 1.6, Math.PI / 2); scene.remove(cf); LG.add(cf); npcs.push(cf); } catch (e) {} }
  for (const x of [-57.5, -55.5, -53.5]) { q.box('gls', '#ec3013', 1.2, 1.9, 0.6, x, 0.95, 180.75); q.box('mat', '#201e1d', 1.0, 0.65, 0.02, x, 1.45, 181.06); q.box('glo', '#ffd23a', 0.9, 0.12, 0.01, x, 1.68, 181.075); q.box('glo', '#9fd6ff', 0.6, 0.36, 0.01, x - 0.1, 1.38, 181.075); q.box('mat', '#3d3b3a', 0.5, 0.12, 0.1, x, 0.9, 181.1); } box(-58.2, -52.8, 180.4, 181.1);
  plane(LG, depFor('stationLake'), 7.6, 3.8, -45, 3.4, 197.55, Math.PI); q.box('mat', '#201e1d', 7.8, 4.0, 0.12, -45, 3.4, 197.65);
  plane(LG, map, 7, 3.5, -37, 2.9, 180.62, 0); q.box('mat', '#201e1d', 7.2, 3.7, 0.08, -37, 2.9, 180.55);
  for (const x of [-50.5, -39.5]) for (const z of [186, 190]) { q.box('mat', '#a77b4f', 3.2, 0.08, 0.7, x, 0.61, z); q.box('mat', '#a77b4f', 3.2, 0.6, 0.08, x, 1.0, z - 0.35); for (const e of [-1.4, 1.4]) q.box('mat', '#201e1d', 0.08, 0.6, 0.62, x + e, 0.3, z); box(x - 1.65, x + 1.65, z - 0.35, z + 0.3); }
  for (const x of [-52.6, -37.4]) { q.cyl('mat', '#2e4a6b', 0.26, 0.85, x, 0.425, 188, 10, 0, 0, 0.9); ring(x, 188, 0.3); }
  for (const z of [184, 192]) for (const x of [-52, -40]) { q.box('gls', '#201e1d', 6, 0.1, 0.3, x, 5.2, z); q.box('glo', '#f4f8ff', 5.8, 0.02, 0.22, x, 5.145, z); for (const e of [-2.6, 2.6]) q.box('mat', '#201e1d', 0.01, 2.6, 0.01, x + e, 6.5, z); }
  plant(q, -31.2, 181.2, 1.2); plant(q, -31.2, 190.4, 1.1); plant(q, -58.8, 196.8, 1.2);
  // s35n: LAKE character. Blue WAVE inlays along the north + south floor, a varnished ROWBOAT on trestles (oars, red stripe), red-and-white
  // LIFE RINGS on the ticket office ends, reed planters, hanging boards: LAKE STATION over the north door, PEARL FERRY · LIFT over the east lane
  for (const zw of [182.3, 196.6]) for (const [dz, c] of [[0, '#2e7fb8'], [0.5, '#5fb4e6']]) for (let i = 0; i < 96; i++) { const W2 = t => [-58.4 + t * 0.28, zw + dz + Math.sin(t * 0.45 + dz * 3) * 0.28], p = W2(i), r = W2(i + 1), dx = r[0] - p[0], dzz = r[1] - p[1]; q.box('mat', c, Math.hypot(dx, dzz) + 0.04, 0.012, 0.12, (p[0] + r[0]) / 2, 0.069 + dz * 0.002, (p[1] + r[1]) / 2, -Math.atan2(dzz, dx)); }
  { const bx = -33.6, bz = 187, wood = '#9a6a3c', dark = '#5a3d26';
    for (const e of [-1.2, 1.2]) { q.box('mat', dark, 1.4, 0.08, 0.12, bx, 0.62, bz + e); for (const sx of [-0.55, 0.55]) q.box('mat', dark, 0.08, 0.62, 0.08, bx + sx, 0.31, bz + e); }
    q.box('mat', wood, 0.5, 0.12, 3.4, bx, 0.74, bz); for (const sd of [-1, 1]) { q.box('mat', wood, 0.08, 0.42, 3.0, bx + sd * 0.48, 0.98, bz, 0, 0, -sd * 0.35); q.box('mat', '#ec3013', 0.09, 0.07, 3.0, bx + sd * 0.56, 1.12, bz, 0, 0, -sd * 0.35); }
    for (const e of [-1.75, 1.75]) q.box('mat', wood, 0.22, 0.46, 0.28, bx, 0.98, bz + e); for (const e of [-0.5, 0.6]) q.box('mat', '#c99a62', 1.0, 0.05, 0.28, bx, 1.04, bz + e);
    for (const sd of [-1, 1]) { q.box('mat', '#c99a62', 0.06, 0.05, 2.6, bx + sd * 0.25, 1.1, bz + 0.1, sd * 0.12); q.box('mat', '#c99a62', 0.16, 0.02, 0.5, bx + sd * 0.35, 1.1, bz + 1.35, sd * 0.12); }
    box(bx - 0.8, bx + 0.8, bz - 1.9, bz + 1.9); }
  for (const z of [182.88, 191.12]) { const fz = z < 187 ? -1 : 1; for (const x of [-57.6, -55]) { q.tor('gls', '#f3f2f2', 0.4, 0.28, x, 2.3, z + fz * 0.04, 0, 0); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; q.box('mat', '#ec3013', 0.2, 0.22, 0.22, x + Math.cos(a) * 0.4, 2.3 + Math.sin(a) * 0.4, z + fz * 0.05, 0, 0, a); } } }
  for (const [x, z] of [[-31.4, 185.8], [-58.8, 193.6]]) { q.box('mat', '#201e1d', 1.0, 0.55, 1.0, x, 0.275, z); for (let k = 0; k < 11; k++) { const a = k * 2.4, r = 0.12 + (k % 3) * 0.1; q.box('mat', k % 3 ? '#5f8f3e' : '#8fae4a', 0.05, 1.3 + (k % 4) * 0.3, 0.05, x + Math.cos(a) * r, 1.1 + (k % 4) * 0.15, z + Math.sin(a) * r, 0, Math.sin(a) * 0.15, Math.cos(a) * 0.15); } box(x - 0.5, x + 0.5, z - 0.5, z + 0.5); }
  for (const f of [0, Math.PI]) { plane(LG, signTex('LAKE STATION'), 5.2, 0.9, -45, 4.7, 183.2, f).translateZ(0.04); plane(LG, signTex('PEARL FERRY \u00b7 LIFT \u2192'), 4.6, 0.7, -35.5, 4.3, 195, -Math.PI / 2 + f).translateZ(0.04); }
  q.box('mat', '#201e1d', 5.3, 1.0, 0.06, -45, 4.7, 183.2); q.box('mat', '#201e1d', 0.06, 0.8, 4.7, -35.5, 4.3, 195); for (const e of [-2.2, 2.2]) { q.box('mat', '#201e1d', 0.02, 1.4, 0.02, -45 + e, 5.9, 183.2); q.box('mat', '#201e1d', 0.02, 1.6, 0.02, -35.5, 5.5, 195 + e); }
  q.build(LG); }
  // =================== s35: the OTHER STATIONS (Pearl, Arena, Castle, Ruins): one generic hall per shell, built in a local frame where the FRONT door
  // is on the local -z wall at x 0 (group turned by the door face). The fixed side door (L.BACK_DOORS, onto the lift) and both door lanes stay clear.
  const halls = [];
  for (const b of L.BUILDINGS) { if (!/^station/.test(b.key) || b.key === 'stationTown' || b.key === 'stationLake' || !b.f || !b.door) continue;
    const th = { N: 0, W: Math.PI / 2, S: Math.PI, E: -Math.PI / 2 }[b.face] || 0, cs = Math.cos(th), sn = Math.sin(th), cx = (b.f[0] + b.f[1]) / 2, cz = (b.f[2] + b.f[3]) / 2;
    const ns = b.face === 'N' || b.face === 'S', hw = (ns ? b.f[1] - b.f[0] : b.f[3] - b.f[2]) / 2, hd = (ns ? b.f[3] - b.f[2] : b.f[1] - b.f[0]) / 2;
    const toW = (lx, lz) => [cx + lx * cs + lz * sn, cz - lx * sn + lz * cs], toL = (x, z) => { const dx = x - cx, dz = z - cz; return [dx * cs - dz * sn, dx * sn + dz * cs]; };
    const G = new THREE.Group(); G.position.set(cx, 0, cz); G.rotation.y = th; scene.add(G); const q = Bin();
    const lbox = (x0, x1, z0, z1) => { const a = toW(x0, z0), c = toW(x1, z1); box(Math.min(a[0], c[0]), Math.max(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[1], c[1])); }, lring = (x, z, r) => { const w = toW(x, z); ring(w[0], w[1], r); };
    const sd = b.door2 ? toL(b.door2[0], b.door2[1]) : null, sw = !sd ? null : Math.abs(sd[1] - hd) < 0.6 ? 'back' : sd[0] < -hw + 0.6 ? 'left' : sd[0] > hw - 0.6 ? 'right' : null;
    const lanes = [[-2.7, 2.7, -hd, 1]]; if (sd) { const [x, z] = sd; lanes.push([Math.min(0, x) - 2.7, Math.max(0, x) + 2.7, Math.min(0, z) - 2.7, Math.max(0, z) + 2.7]); }
    const hitL = (x0, x1, z0, z1) => lanes.some(r => x0 < r[1] && x1 > r[0] && z0 < r[3] && z1 > r[2]), used = [];
    const free = (x0, x1, z0, z1) => !hitL(x0, x1, z0, z1) && !used.some(r => x0 < r[1] + 0.8 && x1 > r[0] - 0.8 && z0 < r[3] + 0.8 && z1 > r[2] - 0.8) && x0 > -hw + 0.3 && x1 < hw - 0.3 && z0 > -hd + 0.3 && z1 < hd - 0.3;
    flat(G, stoneT, hw * 2 - 0.8, hd * 2 - 0.8, 0, 0.06, 0, 2.4); q.box('mat', '#ec3013', 0.32, 0.01, hd - 0.4, 0, 0.068, -hd / 2 - 0.2);
    // ticket office on the side wall without a door (left first): glazed counter, TICKETS sign, the clerk
    const o = sw === 'left' ? 1 : -1, bd = Math.min(6.6, hw - 4.2), wx = o * (hw - 0.4), ix = o * (hw - 0.4 - bd), z0 = -hd + 3, z1 = Math.min(hd - 2, z0 + 8), zc = (z0 + z1) / 2, xm = (wx + ix) / 2;
    q.box('mat', '#201e1d', 0.5, 1.1, z1 - z0, ix, 0.55, zc); q.box('gls', '#f3f2f2', 0.75, 0.06, z1 - z0 + 0.1, ix, 1.13, zc); q.box('mat', '#ec3013', 0.02, 0.12, z1 - z0, ix - o * 0.26, 0.95, zc);
    q.box('glass', '#cfe9ff', 0.04, 1.5, z1 - z0, ix + o * 0.1, 1.9, zc); for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 3) q.box('gls', '#201e1d', 0.1, 1.5, 0.1, ix + o * 0.1, 1.9, z);
    q.box('mat', '#201e1d', 0.3, 0.9, z1 - z0 + 0.2, ix + o * 0.1, 3.1, zc);
    for (const z of [z0, z1]) { q.box('mat', '#e6e3dc', bd, 3.55, 0.2, xm, 1.775, z); q.box('mat', '#201e1d', bd, 0.14, 0.24, xm, 0.07, z); }
    for (let i = 0; i < 2; i++) { const z = z0 + (i + 0.5) * (z1 - z0) / 2; q.box('mat', '#5c6670', 0.7, 0.75, 1.6, ix + o * 0.85, 0.375, z); q.box('glo', '#9fd6ff', 0.01, 0.26, 0.41, ix + o * 1.08, 0.98, z - 0.3); }
    plane(G, signTex('TICKETS'), 3.6, 0.68, ix - o * 0.06, 3.1, zc, -o * Math.PI / 2); lbox(Math.min(wx, ix) - 0.2, Math.max(wx, ix) + 0.2, z0 - 0.15, z1 + 0.15); used.push([Math.min(wx, ix), Math.max(wx, ix), z0, z1]);
    { const w1 = toW(ix - o * 1.1, zc - 1.6), w2 = toW(o * (hw - 4.5), -hd + 2.2); desks.push({ key: b.key, x: w1[0], z: w1[1] }, { key: b.key, x: w2[0], z: w2[1] }); }
    try { const cf = fox('ticketClerk', '#2e4a6b', 'vest', 0, 0, 0); cols.pop(); scene.remove(cf); cf.position.set(ix + o * 1.2, 0, zc - 1.6); cf.rotation.y = -o * Math.PI / 2; G.add(cf); npcs.push(cf); lring(ix + o * 1.2, zc - 1.6, 0.45); } catch (e) {}
    // ticket machines on the front wall, office side (clear of the door)
    for (const k of [2.5, 4.5, 6.5]) { const x = o * (hw - k); if (Math.abs(x) < 3.4) continue; q.box('gls', '#ec3013', 1.2, 1.9, 0.6, x, 0.95, -hd + 0.75); q.box('mat', '#201e1d', 1.0, 0.65, 0.02, x, 1.45, -hd + 1.06); q.box('glo', '#ffd23a', 0.9, 0.12, 0.01, x, 1.68, -hd + 1.075); q.box('glo', '#9fd6ff', 0.6, 0.36, 0.01, x - 0.1, 1.38, -hd + 1.075); lbox(x - 0.6, x + 0.6, -hd + 0.4, -hd + 1.1); }
    // loop map on the front wall, the other side
    { const mw = Math.min(7, hw - 4), mx = -o * (3.4 + mw / 2); plane(G, map, mw, mw / 2, mx, 2.9, -hd + 0.62, 0); q.box('mat', '#201e1d', mw + 0.2, mw / 2 + 0.2, 0.08, mx, 2.9, -hd + 0.55); }
    // DEPARTURES: back wall unless the side door is there, else the free side wall
    { const opts = [[0, hd - 0.45, Math.PI, 'back'], [-o * (hw - 0.45), 0, o * Math.PI / 2, o > 0 ? 'left' : 'right']]; const pick = opts.find(p => p[3] !== sw || (sd && Math.hypot(sd[0] - p[0], sd[1] - p[1]) > 7)) || opts[1];
      if (pick[3] === sw && sd && pick[3] === 'back') pick[0] = sd[0] > 0 ? -Math.min(hw - 4.5, 7) : Math.min(hw - 4.5, 7);
      plane(G, depFor(b.key), 7.6, 3.8, pick[0], 3.4, pick[1], pick[2]); { const ns2 = Math.abs(Math.sin(pick[2])) < 0.5; used.push(ns2 ? [pick[0] - 4.2, pick[0] + 4.2, pick[1] - 1.4, pick[1] + 1.4] : [pick[0] - 1.4, pick[0] + 1.4, pick[1] - 4.2, pick[1] + 4.2]); } /* s728e keep the board's wall span clear of dress */ const bk = new THREE.Mesh(new THREE.BoxGeometry(7.8, 4.0, 0.12), new THREE.MeshToonMaterial({ color: '#201e1d' })); bk.position.set(pick[0], 3.4, pick[1]); bk.rotation.y = pick[2]; bk.translateZ(-0.1); G.add(bk); }
    // benches (up to 4) + bins, off the lanes
    let nb = 0; for (const z of [-1, 3, -5, 7, 11]) for (const x of [-5.5, 5.5, -9.5, 9.5]) { if (nb >= 4) break; if (!free(x - 1.8, x + 1.8, z - 0.5, z + 0.5)) continue; used.push([x - 1.8, x + 1.8, z - 0.5, z + 0.5]); nb++;
      q.box('mat', '#a77b4f', 3.2, 0.08, 0.7, x, 0.61, z); q.box('mat', '#a77b4f', 3.2, 0.6, 0.08, x, 1.0, z + 0.35); for (const e of [-1.4, 1.4]) q.box('mat', '#201e1d', 0.08, 0.6, 0.62, x + e, 0.3, z); lbox(x - 1.65, x + 1.65, z - 0.35, z + 0.35);
      if (nb % 2) { const bx = x + (x > 0 ? 2.3 : -2.3); if (free(bx - 0.3, bx + 0.3, z - 0.3, z + 0.3)) { q.cyl('mat', '#2e4a6b', 0.26, 0.85, bx, 0.425, z, 10, 0, 0, 0.9); lring(bx, z, 0.3); } } }
    // linear lights + plants in the free corners
    for (const z of [-hd / 2, hd / 2]) for (const x of [-hw / 2, hw / 2]) { q.box('gls', '#201e1d', Math.min(6, hw - 1), 0.1, 0.3, x, 5.2, z); q.box('glo', '#f4f8ff', Math.min(5.8, hw - 1.2), 0.02, 0.22, x, 5.145, z); }
    for (const [x, z] of [[hw - 1.2, -hd + 1.2], [-hw + 1.2, -hd + 1.2], [hw - 1.2, hd - 1.2], [-hw + 1.2, hd - 1.2]]) if (free(x - 0.5, x + 0.5, z - 0.5, z + 0.5)) { used.push([x - 0.5, x + 0.5, z - 0.5, z + 0.5]); plant(q, x, z, 1.1); cols.pop(); lring(x, z, 0.45); }
    try { dressStation({ THREE, q, G, b, hw, hd, free, used, lbox, lring, plane, CT, pendant, fox, npcs, cols }); } catch (e) { console.warn('station dress', b.key, e); }
    q.build(G); /* no visible toggle: the blockout prop cull (layers) handles distance; toggling visible left its layer stuck on 1 */ halls.push({ G, x: cx, z: cz, key: b.key, sideWall: sw, benches: nb }); }
  window.__m2halls = halls.map(q => ({ key: q.key, side: q.sideWall, benches: q.benches })); window.__m2hallG = halls;
  const wp = new THREE.Vector3(), smark = new THREE.Object3D(); smark.position.set(0, 0, 122); SG.add(smark);
  function tick(dt, cam) { if (cam) { smark.getWorldPosition(wp); SG.visible = Math.hypot(cam.x - wp.x, cam.z - wp.z) < far; RG.visible = Math.hypot(cam.x - dx, cam.z - 32) < far; } for (const f of npcs) kit.animFox(f, dt, 0, false); }
  return { tick, desks };
}
