// MERU 2.0 — s728e STATION DRESS: the 7 generic station halls (meru2-halls.js, s35) were 38-41 detail / 100 m² (s728d audit). One pass for all,
// merged into the hall's own Bin (no extra draws): vending machines, water fountain, luggage trolley, HELP point, lost property shelf,
// recycling bins, a yellow tactile strip along the walls, CCTV domes, a wall clock, a MERU travel poster, pendant lights, 1 waiting passenger,
// and ONE theme corner per station so no two look alike (Arena fight wall, Spire model, Deco sunburst, Ruins column + relic, Castle banners
// + armour stand, Garden planters + fountain, Lakeside life rings + fish tank). Everything placed with the hall's free() test (door lanes,
// ticket office, benches stay clear) and gets a collider.
const THEME = {
  stationArena: { c: '#ec3013', c2: '#ffd23a', poster: ['ARENA NIGHTS', 'FIGHT FOR THE 8 GATES'], kind: 'arena' },
  stationSpire: { c: '#2e4a6b', c2: '#9fd6ff', poster: ['THE SPIRE', 'TALLEST IN MERU'], kind: 'spire' },
  stationDeco: { c: '#201e1d', c2: '#c9a227', poster: ['DECO QUARTER', 'DINE · DANCE · DREAM'], kind: 'deco' },
  stationRuins: { c: '#8a7a62', c2: '#e9e3d6', poster: ['THE OLD RUINS', 'MUSEUM OPEN DAILY'], kind: 'ruins' },
  stationCastleRd: { c: '#1f3a6b', c2: '#c9a227', poster: ['KING MIGHT\u2019S CASTLE', 'GUARDS ON DUTY'], kind: 'castle' },
  stationGarden: { c: '#3f7d4a', c2: '#f3c1d0', poster: ['GARDEN ISLAND', 'BLOOMS ALL YEAR'], kind: 'garden' },
  stationLakeside: { c: '#2e86b8', c2: '#f3f2f2', poster: ['MERU LAKE', 'FERRY · FISHING · SUN'], kind: 'lake' } };
export function dressStation({ THREE, q, G, b, hw, hd, free, used, lbox, lring, plane, CT, pendant, fox, npcs, cols }) {
  const T = THEME[b.key] || THEME.stationArena;
  // ---- placement: walk the 4 walls in 1 m steps; ry = facing into the room; w = along the wall, d = depth
  const walls = [['back', (u) => [u, hd - 0.3], Math.PI, hw], ['left', (u) => [-hw + 0.3, u], Math.PI / 2, hd], ['right', (u) => [hw - 0.3, u], -Math.PI / 2, hd], ['front', (u) => [u, -hd + 0.3], 0, hw]];
  const R = (x, z, ry) => (dx, dz) => [x + dx * Math.cos(ry) + dz * Math.sin(ry), z - dx * Math.sin(ry) + dz * Math.cos(ry)];
  function spot(w, d, prefer = ['back', 'left', 'right', 'front'], from = 0) {
    for (const wn of prefer) { const [, at, ry, half] = walls.find(W => W[0] === wn); for (let k = 0; k < half * 2; k++) { const u = (k % 2 ? -1 : 1) * Math.ceil(k / 2) + from; if (Math.abs(u) > half - w / 2 - 0.4) continue;
        const [wx, wz] = at(u), f = R(wx, wz, ry), [cx, cz] = f(0, d / 2), sx = wn === 'left' || wn === 'right' ? d : w, sz = wn === 'left' || wn === 'right' ? w : d;
        if (free(cx - sx / 2, cx + sx / 2, cz - sz / 2, cz + sz / 2)) { used.push([cx - sx / 2, cx + sx / 2, cz - sz / 2, cz + sz / 2]); lbox(cx - sx / 2, cx + sx / 2, cz - sz / 2, cz + sz / 2); return { x: wx, z: wz, ry, f, wall: wn }; } } }
    return null; }
  const bx = (S, k, col, w, h, d, dx, y, dz, rx = 0, rz = 0) => { const [x, z] = S.f(dx, dz); q.box(k, col, w, h, d, x, y, z, S.ry, rx, rz); };
  const cy = (S, k, col, r, h, dx, y, dz, n = 10, top = 1) => { const [x, z] = S.f(dx, dz); q.cyl(k, col, r, h, x, y, z, n, 0, 0, top); };
  const sp = (S, k, col, r, dx, y, dz, sy = 1) => { const [x, z] = S.f(dx, dz); q.sph(k, col, r, x, y, z, sy); };
  const wallTex = (S, tex, w, h, y, dz = 0.02) => { const [x, z] = S.f(0, dz); plane(G, tex, w, h, x, y, z, S.ry); };
  const poster = (t1, t2, bg, fg) => CT(256, 360, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.fillRect(0, h - 90, w, 90); g.fillStyle = bg; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'top'; g.fillText(t1, 14, h - 82, w - 28); g.font = '800 18px Archivo, sans-serif'; g.fillText(t2, 14, h - 40, w - 28);
    g.fillStyle = fg; g.beginPath(); g.arc(w * 0.62, h * 0.32, 58, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,0.28)'; g.beginPath(); g.moveTo(0, h - 90); g.lineTo(w * 0.35, h * 0.45); g.lineTo(w * 0.6, h * 0.6); g.lineTo(w, h * 0.38); g.lineTo(w, h - 90); g.fill(); });
  // ---- VENDING: snacks + drinks side by side
  { const S = spot(2.4, 0.9, ['back', 'right', 'left']); if (S) for (const [dx, c, lab] of [[-0.6, '#ec3013', 'SNACKS'], [0.6, '#2e86b8', 'DRINKS']]) { bx(S, 'gls', c, 1.1, 1.95, 0.8, dx, 0.975, 0.4); bx(S, 'glass', '#cfe9ff', 0.8, 1.1, 0.02, dx - 0.08, 1.15, 0.81);
      for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) bx(S, 'mat', ['#ffd23a', '#f3f2f2', '#7dff6a', '#f97316'][(r + k) % 4], 0.14, 0.18, 0.1, dx - 0.35 + k * 0.18, 0.75 + r * 0.26, 0.7);
      bx(S, 'glo', '#ffffff', 0.9, 0.14, 0.01, dx, 1.82, 0.81); bx(S, 'mat', '#201e1d', 0.18, 0.5, 0.02, dx + 0.42, 1.2, 0.81); bx(S, 'mat', '#201e1d', 0.8, 0.18, 0.04, dx - 0.08, 0.35, 0.81);
      wallTex(S, CT(256, 48, (g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = '900 34px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(lab, 12, h / 2 + 2); }), 0.9, 0.17, 1.82, 0.822 + (dx > 0 ? 0.001 : 0)); } }
  // ---- WATER FOUNTAIN + recycling trio
  { const S = spot(0.8, 0.6, ['left', 'right', 'back']); if (S) { bx(S, 'gls', '#c0c4cc', 0.6, 0.9, 0.45, 0, 0.45, 0.25); bx(S, 'gls', '#9aa0a6', 0.55, 0.08, 0.5, 0, 0.92, 0.27); cy(S, 'gls', '#5c6670', 0.03, 0.12, 0, 1.0, 0.25, 8); bx(S, 'mat', '#2e86b8', 0.3, 0.3, 0.02, 0, 1.4, 0.01); } }
  { const S = spot(2.0, 0.6, ['back', 'left', 'right', 'front'], 4); if (S) [['#2e86b8', 'PAPER'], ['#3f9a5e', 'CANS'], ['#201e1d', 'TRASH']].forEach(([c], i) => { cy(S, 'mat', c, 0.27, 0.85, -0.65 + i * 0.65, 0.425, 0.3, 12, 0.92); cy(S, 'mat', '#f3f2f2', 0.25, 0.04, -0.65 + i * 0.65, 0.87, 0.3, 12); }); }
  // ---- HELP point pillar (red, lit button) + LOST PROPERTY shelf with cases
  { const S = spot(0.6, 0.6, ['front', 'left', 'right']); if (S) { bx(S, 'gls', '#ec3013', 0.4, 1.7, 0.3, 0, 0.85, 0.2); bx(S, 'glo', '#ffd23a', 0.16, 0.16, 0.02, 0, 1.3, 0.36); bx(S, 'mat', '#201e1d', 0.3, 0.2, 0.02, 0, 1.0, 0.36);
      wallTex(S, CT(128, 40, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('HELP', 10, h / 2 + 2); }), 0.38, 0.12, 1.58, 0.36); } }
  { const S = spot(2.2, 0.6, ['right', 'left', 'back'], -3); if (S) { for (const dx of [-1.05, 1.05]) bx(S, 'mat', '#3d3b3a', 0.06, 1.8, 0.5, dx, 0.9, 0.28); for (const y of [0.3, 0.95, 1.6]) bx(S, 'mat', '#5c6670', 2.1, 0.05, 0.5, 0, y, 0.28);
      [[-0.6, 0.55, '#7a5236', 0.5], [0.1, 0.5, '#ec3013', 0.4], [0.7, 0.48, '#2e4a6b', 0.36], [-0.5, 1.15, '#3f9a5e', 0.32], [0.4, 1.12, '#c9a227', 0.28], [-0.2, 1.75, '#f3f2f2', 0.24]].forEach(([dx, y, c, h]) => { bx(S, 'mat', c, 0.55, h, 0.36, dx, y - 0.02, 0.28); bx(S, 'mat', '#201e1d', 0.16, 0.04, 0.04, dx, y + h / 2, 0.28); });
      wallTex(S, CT(256, 40, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23a'; g.font = '900 26px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('LOST PROPERTY', 10, h / 2 + 2); }), 1.6, 0.25, 2.1, 0.02); } }
  // ---- LUGGAGE TROLLEY (free-standing, off the lanes)
  for (const [x, z] of [[-hw + 3.5, hd - 3.5], [hw - 3.5, hd - 3.5], [-hw + 3.5, 0], [hw - 3.5, 0]]) { if (!free(x - 0.6, x + 0.6, z - 0.4, z + 0.4)) continue; used.push([x - 0.6, x + 0.6, z - 0.4, z + 0.4]); lbox(x - 0.55, x + 0.55, z - 0.35, z + 0.35);
    const S = { f: R(x, z, 0.3), ry: 0.3 }; bx(S, 'gls', '#9aa0a6', 1.0, 0.05, 0.6, 0, 0.3, 0); bx(S, 'gls', '#9aa0a6', 0.05, 0.9, 0.6, -0.5, 0.75, 0); bx(S, 'gls', '#201e1d', 0.05, 0.05, 0.6, -0.55, 1.2, 0);
    for (const [dx, dz] of [[-0.4, -0.25], [-0.4, 0.25], [0.4, -0.25], [0.4, 0.25]]) sp(S, 'mat', '#201e1d', 0.09, dx, 0.1, dz);
    bx(S, 'mat', '#7a5236', 0.7, 0.4, 0.45, 0.05, 0.53, 0); bx(S, 'mat', '#2e4a6b', 0.5, 0.3, 0.35, 0.05, 0.88, 0); break; }
  // ---- yellow TACTILE STRIP 0.6 m inside the walls (skips the door lanes), CCTV domes, pendant lights over the centre
  for (const [x0, x1, z] of [[-hw + 0.8, -3, -hd + 1.6], [3, hw - 0.8, -hd + 1.6], [-hw + 0.8, hw - 0.8, hd - 0.9]]) for (let x = x0; x < x1; x += 0.5) if (z > 0 || free(x, x + 0.5, z - 0.15, z + 0.15) || !used.some(r => x + 0.5 > r[0] && x < r[1] && z > r[2] - 0.9 && z < r[3] + 0.9)) q.box('mat', '#ffd23a', 0.42, 0.012, 0.3, x + 0.25, 0.07, z);
  for (const [x, z] of [[-hw + 0.5, -hd + 0.5], [hw - 0.5, hd - 0.5]]) { q.box('mat', '#f3f2f2', 0.2, 0.08, 0.2, x, 5.4, z); q.sph('gls', '#201e1d', 0.12, x, 5.32, z, 0.7); }
  for (const x of [-4, 0, 4]) pendant(q, x, 2, 4.2, 5.6, T.c);
  // ---- wall CLOCK + travel POSTER (theme) on the back wall where free of the departures board
  { const S = spot(1.4, 0.1, ['back', 'left', 'right'], -(hw - 3)); if (S) { wallTex(S, CT(128, 128, (g, w) => { g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#201e1d'; g.stroke(); g.fillStyle = '#201e1d'; for (let i = 0; i < 12; i++) { const a = i / 6 * Math.PI; g.fillRect(64 + Math.sin(a) * 48 - 2, 64 - Math.cos(a) * 48 - 4, 4, 8); } g.fillRect(62, 26, 4, 40); g.save(); g.translate(64, 64); g.rotate(2.1); g.fillRect(-2, -30, 4, 30); g.restore(); g.fillStyle = '#ec3013'; g.beginPath(); g.arc(64, 64, 5, 0, 7); g.fill(); }), 1.0, 1.0, 3.6, 0.03);
      wallTex(S, poster(T.poster[0], T.poster[1], T.c, T.c2), 1.2, 1.7, 1.75, 0.03); } }
  // ---- THEME CORNER
  const S = spot(3.0, 1.4, ['back', 'right', 'left'], hw - 4.5);
  if (S) { const k = T.kind;
    if (k === 'arena') { for (const dx of [-1.1, 1.1]) { bx(S, 'mat', '#201e1d', 0.06, 2.6, 0.06, dx, 1.3, 0.25); bx(S, 'mat', T.c, 0.7, 1.3, 0.02, dx, 2.0, 0.3); bx(S, 'mat', T.c2, 0.7, 0.1, 0.03, dx, 1.4, 0.3); }
      bx(S, 'gls', '#5c4430', 1.2, 1.1, 0.6, 0, 0.55, 0.5); bx(S, 'glass', '#cfe9ff', 1.2, 0.7, 0.6, 0, 1.45, 0.5); cy(S, 'gls', T.c2, 0.14, 0.32, -0.25, 1.28, 0.5, 10, 0.6); cy(S, 'gls', T.c2, 0.1, 0.24, 0.25, 1.24, 0.5, 10, 0.6); sp(S, 'gls', T.c2, 0.12, -0.25, 1.5, 0.5, 0.6);
      for (const s of [-1, 1]) bx(S, 'gls', '#c0c4cc', 0.05, 1.3, 0.02, s * 0.25, 2.5, 0.04, 0, s * 0.7); }
    else if (k === 'spire') { bx(S, 'mat', '#201e1d', 1.4, 0.9, 1.0, 0, 0.45, 0.6); for (let i = 0; i < 5; i++) cy(S, 'gls', i % 2 ? T.c2 : T.c, 0.42 - i * 0.07, 0.4, 0, 1.1 + i * 0.4, 0.6, 8, 0.85); cy(S, 'gls', '#c0c4cc', 0.05, 0.8, 0, 3.3, 0.6, 6, 0.2); sp(S, 'glo', '#ec3013', 0.07, 0, 3.72, 0.6); bx(S, 'glass', '#cfe9ff', 1.2, 2.8, 0.9, 0, 2.3, 0.6); }
    else if (k === 'deco') { for (let i = 0; i < 11; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI; bx(S, 'gls', T.c2, 0.08, 1.4, 0.02, Math.sin(a) * 0.75, 1.6 + Math.cos(a) * 0.75 + 0.3, 0.03, 0, -a); } cy(S, 'gls', T.c2, 0.4, 0.02, 0, 1.9, 0.04, 16); bx(S, 'mat', T.c, 3.0, 0.9, 0.6, 0, 0.45, 0.4); bx(S, 'gls', T.c2, 3.04, 0.06, 0.64, 0, 0.92, 0.4);
      for (const dx of [-1.1, 0, 1.1]) { cy(S, 'gls', T.c2, 0.08, 0.3, dx, 1.1, 0.4, 8, 0.5); sp(S, 'glo', '#fff1c8', 0.12, dx, 1.32, 0.4); } }
    else if (k === 'ruins') { cy(S, 'mat', '#cfc6b4', 0.4, 1.8, -0.8, 0.9, 0.6, 12); for (let i = 0; i < 12; i++) bx(S, 'mat', '#b8ad97', 0.06, 1.8, 0.06, -0.8 + Math.sin(i / 12 * 6.283) * 0.4, 0.9, 0.6 + Math.cos(i / 12 * 6.283) * 0.4); bx(S, 'mat', '#cfc6b4', 0.9, 0.2, 0.9, -0.8, 1.9, 0.6, 0.2, 0.08);
      bx(S, 'mat', '#8a7a62', 0.7, 1.0, 0.7, 0.9, 0.5, 0.6); bx(S, 'glass', '#cfe9ff', 0.6, 0.6, 0.6, 0.9, 1.3, 0.6); sp(S, 'gls', '#c9a227', 0.14, 0.9, 1.2, 0.6, 1.4); bx(S, 'mat', '#b8ad97', 0.8, 0.35, 0.5, 0.2, 0.17, 1.0, 0, 0.3); }
    else if (k === 'castle') { for (const dx of [-1.1, 1.1]) { bx(S, 'mat', T.c, 0.8, 2.2, 0.02, dx, 2.6, 0.04); bx(S, 'mat', T.c2, 0.8, 0.12, 0.03, dx, 3.6, 0.05); bx(S, 'mat', T.c2, 0.3, 0.3, 0.03, dx, 2.7, 0.05, 0, 0.785); cy(S, 'gls', T.c2, 0.03, 1.0, dx, 3.75, 0.08, 6); }
      bx(S, 'mat', '#3d3b3a', 0.8, 0.12, 0.8, 0, 0.06, 0.6); cy(S, 'gls', '#9aa0a6', 0.08, 0.9, -0.12, 0.55, 0.6, 8); cy(S, 'gls', '#9aa0a6', 0.08, 0.9, 0.12, 0.55, 0.6, 8); bx(S, 'gls', '#9aa0a6', 0.55, 0.7, 0.32, 0, 1.35, 0.6); bx(S, 'gls', T.c, 0.5, 0.25, 0.33, 0, 1.15, 0.6); sp(S, 'gls', '#9aa0a6', 0.2, 0, 1.92, 0.6, 1.1); bx(S, 'mat', '#ec3013', 0.04, 0.22, 0.2, 0, 2.15, 0.6);
      for (const s of [-1, 1]) cy(S, 'gls', '#9aa0a6', 0.06, 0.6, s * 0.36, 1.3, 0.6, 6); }
    else if (k === 'garden') { for (const dx of [-1.0, 1.0]) { bx(S, 'mat', '#7a5236', 0.9, 0.5, 0.6, dx, 0.25, 0.4); for (let i = 0; i < 7; i++) { sp(S, 'mat', '#3f7d4a', 0.18, dx - 0.3 + (i % 4) * 0.2, 0.62, 0.3 + (i % 2) * 0.2); sp(S, 'mat', ['#f3c1d0', '#ffd23a', '#ec3013', '#f3f2f2'][i % 4], 0.07, dx - 0.3 + (i % 4) * 0.2, 0.78, 0.3 + (i % 2) * 0.2); } }
      for (let i = 0; i < 6; i++) bx(S, 'mat', '#f3f2f2', 0.04, 2.2, 0.04, -1.25 + i * 0.5, 1.6, 0.05); for (let j = 0; j < 4; j++) bx(S, 'mat', '#f3f2f2', 2.6, 0.04, 0.04, 0, 0.9 + j * 0.5, 0.06); for (let i = 0; i < 10; i++) sp(S, 'mat', '#4f8a5c', 0.14, -1.2 + (i * 0.27) % 2.5, 1.0 + (i * 0.37) % 1.6, 0.09);
      cy(S, 'mat', '#cfc6b4', 0.4, 0.4, 0, 0.2, 0.85, 14); cy(S, 'gls', '#7dd3fc', 0.34, 0.02, 0, 0.4, 0.85, 14); cy(S, 'mat', '#cfc6b4', 0.06, 0.4, 0, 0.6, 0.85, 8); }
    else { for (const dx of [-1.0, 1.0]) { q.tor('gls', '#f3f2f2', 0.3, 0.3, ...S.f(dx, 0.08).flatMap((v, i) => i ? [2.6, v] : [v]), 0, S.ry); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.785; bx(S, 'mat', '#ec3013', 0.12, 0.12, 0.13, dx + Math.cos(a) * 0.3, 2.6 + Math.sin(a) * 0.3, 0.08, 0, a); } }
      bx(S, 'mat', '#201e1d', 1.6, 0.8, 0.6, 0, 0.4, 0.5); bx(S, 'glass', '#7dd3fc', 1.6, 0.9, 0.6, 0, 1.25, 0.5); bx(S, 'mat', '#c9b27a', 1.55, 0.08, 0.55, 0, 0.84, 0.5);
      [[-0.4, 1.2, '#f97316'], [0.2, 1.4, '#ffd23a'], [0.5, 1.1, '#f97316'], [-0.1, 1.0, '#9fd6ff']].forEach(([dx, y, c]) => { bx(S, 'glo', c, 0.16, 0.08, 0.03, dx, y, 0.5); bx(S, 'glo', c, 0.05, 0.08, 0.02, dx - 0.1, y, 0.5); });
      for (let i = 0; i < 4; i++) bx(S, 'mat', '#3f7d4a', 0.03, 0.3 + i * 0.06, 0.03, -0.6 + i * 0.12, 1.0, 0.55); } }
  // ---- ONE WAITING PASSENGER by the departures side (shops' keepers have shopKit; here a plain idle fox)
  for (const [x, z] of [[-3.6, hd - 3.2], [3.6, hd - 3.2], [-3.6, 2], [3.6, 2]]) { if (!free(x - 0.4, x + 0.4, z - 0.4, z + 0.4)) continue; used.push([x - 0.4, x + 0.4, z - 0.4, z + 0.4]);
    try { const pk = ['commuterA', 'commuterB', 'commuterC'][(b.key.length) % 3], cf = fox(pk, T.c, 'coat', 0, 0, 0); cols.pop(); cf.parent && cf.parent.remove(cf); cf.position.set(x, 0, z); cf.rotation.y = x > 0 ? -0.6 : 0.6; G.add(cf); npcs.push(cf); lring(x, z, 0.4); } catch (e) {} break; }
}
