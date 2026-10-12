// MERU — two APARTMENT BUILDINGS on opposite sides of town: CRESTVIEW HOUSE (stone townhouse with flower boxes, north-west, off
// the Castle Path grass) and LAKESIDE TOWER (glass and steel, south-east, off the Arena Path's south side). Each: a lobby
// (doorman, realtor, elevator) and two floors of five rooms: two each side of the hall, one across from the elevator. The top
// floor's room across from the elevator is the PENTHOUSE, for rent at 10 CR a night (view over the town). Townspeople's rooms
// are furnished, numbered, open and empty for now. Every room has a TV running MERU NEWS 8 with the current events.
// Floors above you and the roof are hidden; camera-side walls drop away (camBlockers). The elevator rides for real.
// Local frame per building: x across, z front(+)/back(−), front = door + penthouse side. World: X = cx + s*lx, Z = cz + s*lz.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const FH = 3.6, W2 = 8, D2 = 7, WT = 0.3;
export const BUILDINGS = [
  { key: 'crest', name: 'CRESTVIEW HOUSE', style: 'stone', cx: -32, cz: -46, s: 1, pad: [-10, 10, -9, 11],
    doorman: { key: 'aptDoorCrest', name: 'Pell', role: 'Doorman · Crestview House', line: 'Evening. Crestview House. The elevator is at the back of the lobby.', torso: ['#7a1d2a', '#4a0f18', '#2a070d'] },
    realtor: { key: 'aptRealCrest', name: 'Miri', role: 'Realtor · Crestview House', line: "Crestview's penthouse looks right over the town. 10 CR a night.", torso: ['#f5e6c8', '#c0995c', '#6b4a2c'] } },
  { key: 'lake', name: 'LAKESIDE TOWER', style: 'glass', cx: 74, cz: 29, s: -1, pad: [-10, 10, -9, 13.5],
    doorman: { key: 'aptDoorLake', name: 'Otto', role: 'Doorman · Lakeside Tower', line: 'Lakeside Tower. Mind the glass, folks walk into it all day.', torso: ['#1e3a5f', '#0f2440', '#081426'] },
    realtor: { key: 'aptRealLake', name: 'Sable', role: 'Realtor · Lakeside Tower', line: "Lakeside's penthouse has the best view of Meru. 10 CR a night.", torso: ['#e0f2fe', '#38bdf8', '#0c4a6e'] } },
];
// rooms on floors 1 + 2 (local): A, B north of the hall either side of the elevator; C, E, D south; E is across from the elevator
const ROOMS = [
  { id: 'A', n: 1, x0: -7.85, x1: -1.45, z0: -7, z1: -1.5, door: [-5.4, -3.8], side: -1 },
  { id: 'B', n: 2, x0: 1.45, x1: 7.85, z0: -7, z1: -1.5, door: [3.8, 5.4], side: -1 },
  { id: 'C', n: 3, x0: -7.85, x1: -2.5, z0: 1.5, z1: 7, door: [-6.0, -4.4], side: 1 },
  { id: 'E', n: 4, x0: -2.5, x1: 2.5, z0: 1.5, z1: 7, door: [-0.8, 0.8], side: 1 },
  { id: 'D', n: 5, x0: 2.5, x1: 7.85, z0: 1.5, z1: 7, door: [4.4, 6.0], side: 1 },
];
const CAR = { x0: -1.05, x1: 1.05, z0: -3.95, z1: -1.75 };
export const roomNo = (f, r) => f * 100 + r.n;
export const isPenthouse = (f, r) => f === 2 && r.id === 'E';
export const toLocal = (b, X, Z) => [(X - b.cx) * b.s, (Z - b.cz) * b.s];
export const toWorld = (b, lx, lz) => [b.cx + b.s * lx, b.cz + b.s * lz];
const inR = (x, z, r) => x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3];
export function buildingAt(X, Z, m = 0) { for (const b of BUILDINGS) { const [lx, lz] = toLocal(b, X, Z); if (Math.abs(lx) < W2 + m && Math.abs(lz) < D2 + m) return b; } return null; }
export function flatMask(X, Z) { let k = 0; for (const b of BUILDINGS) { const [lx, lz] = toLocal(b, X, Z), p = b.pad, d = Math.hypot(Math.max(0, p[0] - lx, lx - p[1]), Math.max(0, p[2] - lz, lz - p[3])); k = Math.max(k, d <= 0 ? 1 : Math.max(0, 1 - d / 8)); } return k; }
export const noTree = (X, Z) => flatMask(X, Z) > 0.05;
// walk rects per level (local), already shrunk for the body
function levelRects(f, b, st) {
  const R = [], block = [];
  const carHere = st.car[b.key].floor === f && !st.car[b.key].moving && st.car[b.key].open;
  if (f === 0) { R.push([-7.45, 7.45, -0.9, 6.9], [-7.45, -1.9, -6.65, 6.9], [1.9, 7.45, -6.65, 6.9], [-1.5, 1.5, 6.0, 7.8]); block.push([-6.4, -2.6, -3.3, -1.7]); }
  else { R.push([-7.45, 7.45, -1.15, 1.15]); for (const r of ROOMS) { if (isPenthouse(f, r) && !st.rentOpen(b.key)) continue; R.push([r.x0 + 0.35, r.x1 - 0.35, r.z0 + 0.35, r.z1 - 0.35]); const zz = r.side < 0 ? [-2.3, -0.8] : [0.8, 2.3]; R.push([r.door[0] - 0.35, r.door[1] + 0.35, zz[0], zz[1]]); block.push(...furnBlocks(f, r)); } }
  if (carHere) R.push([CAR.x0, CAR.x1, CAR.z0, f === 0 ? -0.6 : -0.8]);
  return { R, block };
}
function furnBlocks(f, r) { const ph = isPenthouse(f, r), back = r.side < 0 ? r.z0 + WT : r.z1 - WT, tw = -r.side, bw = ph ? 2.1 : 1.8, bx = r.x0 + 1.2, cxr = (r.x0 + r.x1) / 2, tz = (r.z0 + r.z1) / 2 + tw * 0.2, zr = (p, q) => [Math.min(p, q), Math.max(p, q)];
  return [[bx - bw / 2 - 0.1, bx + bw / 2 + 0.1, ...zr(back, back + tw * 2.45)], [r.x1 - 0.75, r.x1, tz - 0.8, tz + 0.8], [cxr - 0.25, cxr + 0.65, tz - 0.95, tz + 0.95]]; }
// door assist: within 0.7 m of a doorway's line, steer the walker's sideways position onto the door centre
export function doorAssist(X, Z, st) {
  if (!st.apt || st.apt.floor < 1) return null; const b = BUILDINGS.find(q => q.key === st.apt.b); if (!b) return null; const [lx, lz] = toLocal(b, X, Z);
  for (const r of ROOMS) { const wz = r.side < 0 ? -1.5 : 1.5, c = (r.door[0] + r.door[1]) / 2; if (Math.abs(lz - wz) < 0.75 && Math.abs(lx - c) < 1.0) return toWorld(b, c, lz); }
  return null;
}
export function walk(X, Z, st) {
  for (const b of BUILDINGS) {
    const [lx, lz] = toLocal(b, X, Z), here = st.apt && st.apt.b === b.key, f = here ? st.apt.floor : 0;
    if (here && f > 0) { const { R, block } = levelRects(f, b, st); return R.some(r => inR(lx, lz, r)) && !block.some(r => inR(lx, lz, r)); }
    if (Math.abs(lx) < W2 + 0.15 && Math.abs(lz) < D2 + 0.15) { const { R, block } = levelRects(0, b, st); return R.some(r => inR(lx, lz, r)) && !block.some(r => inR(lx, lz, r)); }
    if (inR(lx, lz, b.pad)) return true;
  }
  return undefined;
}
// MERU NEWS 8: headlines from the story so far
export function headlines(flag, stat, clock, weather, period) {
  const L = [];
  if (flag('finaleBriefed') && !flag('finaleWon')) L.push('BREAKING: MACHINE FLEET OVER MERU. STAY INDOORS.');
  if (flag('finaleWon')) L.push('KING MIGHT ESCAPES THE MACHINE FLEET. DEFENSE BASE HOLDS.');
  L.push(flag('tournamentWon') ? 'NEW CHAMPION CROWNED AT MERU ARENA' : "ARENA TOURNAMENT: THE KING'S CHAMPION IS WANTED");
  if (flag('tournamentWon') && !flag('maxFreed')) L.push('PRINCE MAX STILL MISSING. SEARCH MOVES TO THE RUINS.');
  if (flag('maxFreed') && !flag('maxHome')) L.push('PRINCE MAX FOUND ALIVE IN THE RUINS CAVES');
  if (flag('maxHome')) L.push('PRINCE MAX HOME AT THE CASTLE. THE KING GIVES THANKS.');
  L.push((stat('seaMonsterKills') || 0) > 0 ? 'LAKE MONSTER NELLY DRIVEN OFF BY A LONE BOATER' : 'BOATERS WARNED: SOMETHING BIG MOVES IN THE LAKE');
  L.push('WEATHER: ' + String(weather).toUpperCase() + ' · ' + String(period).toUpperCase() + ' · ' + clock);
  return L;
}

export function buildApartments(K) {
  const { THREE, scene, M, BOX, toon, grad, glowing, glowTex, BK, camBlockers, DARK, LOW } = K;
  // ---- the shared TV picture (one canvas for every set) ----
  const tvCv = document.createElement('canvas'); tvCv.width = 256; tvCv.height = 160; const tv = tvCv.getContext('2d'); const tvT = new THREE.CanvasTexture(tvCv); tvT.colorSpace = THREE.SRGBColorSpace;
  const tvM = new THREE.MeshBasicMaterial({ map: tvT });
  let news = ['MERU NEWS 8'], ni = 0, nt = 0, tick = 0;
  function drawTV() { const x = tv; x.fillStyle = '#0b1a2e'; x.fillRect(0, 0, 256, 160); x.fillStyle = '#123a66'; x.fillRect(0, 0, 256, 112);
    // the anchor: a fox at a desk
    x.fillStyle = '#e8762a'; x.beginPath(); x.arc(70, 58, 22, 0, 7); x.fill(); x.beginPath(); x.moveTo(52, 44); x.lineTo(56, 22); x.lineTo(66, 38); x.fill(); x.beginPath(); x.moveTo(88, 44); x.lineTo(84, 22); x.lineTo(74, 38); x.fill();
    x.fillStyle = '#fff4e6'; x.beginPath(); x.ellipse(70, 66, 12, 9, 0, 0, 7); x.fill(); x.fillStyle = '#1e293b'; x.fillRect(61, 52, 5, 5); x.fillRect(74, 52, 5, 5);
    x.fillStyle = '#1e2a44'; x.fillRect(40, 80, 60, 32); x.fillStyle = '#c42d3c'; x.fillRect(30, 96, 90, 16);
    x.fillStyle = '#c42d3c'; x.fillRect(132, 14, 112, 22); x.fillStyle = '#fff'; x.font = '900 14px Archivo, Arial'; x.fillText('MERU NEWS 8', 140, 30);
    x.fillStyle = '#ffd23a'; x.font = '800 11px Archivo, Arial'; x.fillText('LIVE', 140, 54);
    const h = news[ni % news.length], words = h.split(' '); let line = '', y = 72; x.fillStyle = '#fff'; x.font = '800 12px Archivo, Arial';
    for (const w of words) { if (x.measureText(line + w).width > 108) { x.fillText(line, 140, y); y += 14; line = ''; } line += w + ' '; } x.fillText(line, 140, y);
    x.fillStyle = '#ffd23a'; x.fillRect(0, 112, 256, 20); x.fillStyle = '#111'; x.font = '900 12px Archivo, Arial'; x.fillText(h, 256 - (tick % 900), 127);
    x.fillStyle = '#0b1a2e'; x.fillRect(0, 132, 256, 28); x.fillStyle = '#9fb3c8'; x.font = '700 11px Archivo, Arial'; x.fillText(news[(ni + 1) % news.length].slice(0, 40), 8, 150); tvT.needsUpdate = true; }
  drawTV();
  const glassM = new THREE.MeshToonMaterial({ color: '#8fc3df', gradientMap: grad, emissive: new THREE.Color('#0d3550'), emissiveIntensity: 0.35, transparent: true, opacity: 0.55 });
  const winM = glowing('#ffe0a0', null, 0.35);
  const numTex = n => { const c = document.createElement('canvas'); c.width = 96; c.height = 48; const x = c.getContext('2d'); x.fillStyle = '#1a1a1e'; x.fillRect(0, 0, 96, 48); x.fillStyle = '#e0b43a'; x.font = '900 30px Archivo, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n), 48, 26); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const signTex = (txt, fg, bg) => { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 512, 96); x.fillStyle = fg; x.font = '900 46px Archivo, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 256, 52); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const out = [];
  for (const b of BUILDINGS) {
    const stone = b.style === 'stone';
    const G = new THREE.Group(); G.position.set(b.cx, 0, b.cz); G.rotation.y = b.s < 0 ? Math.PI : 0; scene.add(G);
    const wallM = stone ? BK.texMat('stone', '#d8ccb2', 4, 1.4) : toon('#dfe7ee'), trimM = stone ? toon('#a8584a') : toon('#cfd6dc'), innerM = toon(stone ? '#efe6d6' : '#eef2f5'), floorM = BK.texMat(stone ? 'plank' : 'tile', stone ? '#8a6440' : '#c9ced4', 4, 4), hallM = toon(stone ? '#7a2e3a' : '#33465c');
    const levels = [], doors = [], cars = {};
    for (let f = 0; f < 3; f++) {
      const L = new THREE.Group(); L.position.y = f * FH; G.add(L); camBlockers.push(L); const inner = new THREE.Group(); L.add(inner);
      const low = [], lint = [];   // partition walls that drop to waist height while you are on this floor (so you can see into the rooms)
      const SD = { F: new THREE.Group(), B: new THREE.Group(), L: new THREE.Group(), R: new THREE.Group() }; for (const k in SD) L.add(SD[k]);
      const sideOf = (x, z) => Math.abs(z) / D2 > Math.abs(x) / W2 ? (z > 0 ? 'F' : 'B') : (x > 0 ? 'R' : 'L');
      // floor slab (and the ceiling of the level below is just this slab's underside)
      M(BOX(W2 * 2, 0.2, D2 * 2), f ? toon(stone ? '#bfb39a' : '#d6dce2') : toon('#8d8a84'), 0, -0.1, 0, L, 0.02);
      M(BOX(W2 * 2 - 0.4, 0.02, D2 * 2 - 0.4), floorM, 0, 0.01, 0, inner, 0);
      // outer walls with windows (front: door on the ground floor)
      const wseg = (x0, x1, z0, z1) => M(BOX(Math.max(0.05, x1 - x0), FH, Math.max(0.05, z1 - z0)), wallM, (x0 + x1) / 2, FH / 2, (z0 + z1) / 2, SD[sideOf((x0 + x1) / 2, (z0 + z1) / 2)], 0.03);
      if (!stone) { // glass block: glass curtain walls on a steel frame, white floor bands
        for (const [x0, x1, z0, z1] of [[-W2, W2, D2 - WT, D2], [-W2, W2, -D2, -D2 + WT], [-W2, -W2 + WT, -D2, D2], [W2 - WT, W2, -D2, D2]]) { if (f === 0 && z0 > 0) { M(BOX(W2 - 1.6, FH, WT), glassM, -(W2 + 1.6) / 2, FH / 2, D2 - WT / 2, SD.F, 0); M(BOX(W2 - 1.6, FH, WT), glassM, (W2 + 1.6) / 2, FH / 2, D2 - WT / 2, SD.F, 0); continue; } M(BOX(x1 - x0, FH, z1 - z0), glassM, (x0 + x1) / 2, FH / 2, (z0 + z1) / 2, SD[sideOf((x0 + x1) / 2, (z0 + z1) / 2)], 0); }
        for (let i = -4; i <= 4; i++) for (const zz of [D2, -D2]) M(BOX(0.12, FH, 0.18), toon('#6b7785'), i * 2, FH / 2, zz - Math.sign(zz) * 0.08, SD[zz > 0 ? 'F' : 'B'], 0);
        for (let i = -3; i <= 3; i++) for (const xx of [W2, -W2]) M(BOX(0.18, FH, 0.12), toon('#6b7785'), xx - Math.sign(xx) * 0.08, FH / 2, i * 2, SD[xx > 0 ? 'R' : 'L'], 0);
        M(BOX(W2 * 2 + 0.3, 0.3, D2 * 2 + 0.3), trimM, 0, 0.05, 0, L, 0.02);
      } else {
        if (f === 0) { wseg(-W2, -1.6, D2 - WT, D2); wseg(1.6, W2, D2 - WT, D2); M(BOX(3.2, FH - 2.6, WT), wallM, 0, 2.6 + (FH - 2.6) / 2, D2 - WT / 2, SD.F, 0.02); }
        else wseg(-W2, W2, D2 - WT, D2);
        wseg(-W2, W2, -D2, -D2 + WT); wseg(-W2, -W2 + WT, -D2, D2); wseg(W2 - WT, W2, -D2, D2);
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) M(BOX(0.5, FH, 0.5), trimM, sx * (W2 - 0.2), FH / 2, sz * (D2 - 0.2), L, 0.02);
        M(BOX(W2 * 2 + 0.2, 0.22, D2 * 2 + 0.2), trimM, 0, FH - 0.05, 0, L, 0.02);
        // windows + flower boxes
        const win = (x, z, rx) => { const g = new THREE.Group(); g.position.set(x, 1.9, z); g.rotation.y = rx; SD[sideOf(x, z)].add(g); M(BOX(1.3, 1.5, 0.08), winM, 0, 0, 0, g, 0); M(BOX(1.5, 0.1, 0.12), toon('#ffffff'), 0, 0.8, 0.02, g, 0); M(BOX(1.5, 0.1, 0.12), toon('#ffffff'), 0, -0.8, 0.02, g, 0);
          if (f > 0) { M(BOX(1.4, 0.3, 0.35), toon('#7a4a2a'), 0, -1.0, 0.2, g, 0.01); for (let k = 0; k < 4; k++) { const fl = M(new THREE.SphereGeometry(0.14, 6, 5), toon(['#ec3013', '#ffd23a', '#f472b6', '#ec3013'][k]), -0.5 + k * 0.33, -0.78, 0.22, g, 0); fl.castShadow = false; } } };
        for (const x of (f === 0 ? [-5, 5] : [-5, 0, 5])) { win(x, D2 + 0.02, 0); win(x, -D2 - 0.02, Math.PI); }
        for (const z of [-4, 4]) { win(W2 + 0.02, z, Math.PI / 2); win(-W2 - 0.02, z, -Math.PI / 2); }
      }
      if (!stone) for (const x of (f === 0 ? [] : [-5, 0, 5])) M(BOX(1.6, 1.4, 0.05), winM, x, 1.9, D2 - WT - 0.03, inner, 0);
      // elevator shaft (walls + doors) on every level
      const shaftM = toon('#5b6470');
      M(BOX(0.12, FH, 2.9), shaftM, -1.45, FH / 2, -2.95, inner, 0.01); M(BOX(0.12, FH, 2.9), shaftM, 1.45, FH / 2, -2.95, inner, 0.01); M(BOX(2.9, FH, 0.12), shaftM, 0, FH / 2, -4.4, inner, 0.01);
      M(BOX(0.3, FH, 0.14), shaftM, -1.3, FH / 2, -1.5, inner, 0.01); M(BOX(0.3, FH, 0.14), shaftM, 1.3, FH / 2, -1.5, inner, 0.01); M(BOX(2.9, FH - 2.5, 0.14), shaftM, 0, 2.5 + (FH - 2.5) / 2, -1.5, inner, 0.01);
      const dl = M(BOX(1.1, 2.45, 0.06), toon('#c9ced4'), -0.55, 1.23, -1.42, inner, 0.01), dr = M(BOX(1.1, 2.45, 0.06), toon('#c9ced4'), 0.55, 1.23, -1.42, inner, 0.01);
      { const ind = M(BOX(0.5, 0.25, 0.04), glowing('#ffd23a', null, 1.2), 0, 2.85, -1.42, inner, 0); ind.castShadow = false; }
      doors.push({ f, dl, dr, open: 0 });
      if (f === 0) {
        // the LOBBY: reception desk (realtor), sofas, plants, mailboxes, a big rug, a chandelier, the building's sign over the desk
        M(BOX(3.8, 1.05, 1.2), toon(stone ? '#5a3d2b' : '#e5e7eb'), -4.5, 0.53, -2.5, inner, 0.02); M(BOX(4.0, 0.08, 1.4), toon(stone ? '#c0995c' : '#38bdf8'), -4.5, 1.08, -2.5, inner, 0.01);
        { const st = signTex(b.name, stone ? '#e0b43a' : '#0c4a6e', stone ? '#3a2618' : '#f1f5f9'); const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.8), new THREE.MeshBasicMaterial({ map: st })); sg.position.set(-4.5, 2.6, -6.82); inner.add(sg); }
        M(BOX(5.2, 0.02, 3.6), toon(stone ? '#7a1d2a' : '#1e3a5f'), 2.5, 0.03, 3.2, inner, 0);
        for (const [x, z, r] of [[4.5, 2.2, -Math.PI / 2], [1.2, 4.6, 0]]) { const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = r; inner.add(s); M(BOX(2.2, 0.45, 0.85), toon(stone ? '#6b3a2a' : '#94a3b8'), 0, 0.3, 0, s, 0.02); M(BOX(2.2, 0.6, 0.2), toon(stone ? '#5a2e22' : '#64748b'), 0, 0.75, -0.35, s, 0.02); }
        for (const [x, z] of [[-7.2, 6.3], [7.2, 6.3], [7.2, -6.3]]) { M(new THREE.CylinderGeometry(0.3, 0.25, 0.5, 10), toon('#c0995c'), x, 0.25, z, inner, 0.01, 0.3); M(new THREE.IcosahedronGeometry(0.55, 0), toon('#3f7d3f'), x, 1.0, z, inner, 0.02, 0.55); }
        M(BOX(0.3, 1.6, 2.6), toon('#b08d57'), 7.6, 1.2, -2.6, inner, 0.01); for (let i = 0; i < 12; i++) M(BOX(0.04, 0.3, 0.38), toon('#6b4a2c'), 7.44, 0.65 + (i % 4) * 0.4, -3.6 + Math.floor(i / 4) * 0.9, inner, 0);
        { const ch = M(new THREE.SphereGeometry(0.4, 12, 8), glowing('#fff1c0', null, 1.4), 1.5, FH - 0.6, 2.5, inner, 0); ch.castShadow = false; }
        // outside: the canopy over the door, the sign, steps
        M(BOX(4.2, 0.15, 1.6), trimM, 0, 2.85, D2 + 0.75, SD.F, 0.02); for (const sx of [-1.95, 1.95]) M(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 6), DARK, sx, 1.4, D2 + 1.45, SD.F, 0.01, 0.06);
        { const st = signTex(b.name, stone ? '#3a2618' : '#ffffff', stone ? '#e0b43a' : '#0c4a6e'); const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.56), new THREE.MeshBasicMaterial({ map: st })); sg.position.set(0, 3.25, D2 + 0.06); SD.F.add(sg); }
        M(BOX(4.0, 0.12, 1.2), toon('#9a9488'), 0, 0.06, D2 + 0.6, L, 0.01);
      } else {
        // hall + rooms
        M(BOX(W2 * 2 - 0.4, 0.03, 2.9), hallM, 0, 0.02, 0, inner, 0);
        const iw = (x0, x1, z) => { const m = M(BOX(x1 - x0, FH, 0.12), innerM, (x0 + x1) / 2, FH / 2, z, inner, 0.01); low.push(m); return m; };
        const north = [[-7.85, -5.4], [-3.8, -1.45], [1.45, 3.8], [5.4, 7.85]]; north.forEach(([a, c]) => iw(a, c, -1.5));
        const south = [[-7.85, -6.0], [-4.4, -0.8], [0.8, 4.4], [6.0, 7.85]]; south.forEach(([a, c]) => iw(a, c, 1.5));
        for (const [a, c] of [[-5.4, -3.8], [3.8, 5.4]]) lint.push(M(BOX(c - a, FH - 2.4, 0.12), innerM, (a + c) / 2, 2.4 + (FH - 2.4) / 2, -1.5, inner, 0));
        for (const [a, c] of [[-6.0, -4.4], [-0.8, 0.8], [4.4, 6.0]]) lint.push(M(BOX(c - a, FH - 2.4, 0.12), innerM, (a + c) / 2, 2.4 + (FH - 2.4) / 2, 1.5, inner, 0));
        for (const x of [-2.5, 2.5]) low.push(M(BOX(0.12, FH, 5.5), innerM, x, FH / 2, 4.25, inner, 0.01));
        for (const r of ROOMS) {
          const ph = isPenthouse(f, r), no = roomNo(f, r), dz = r.side < 0 ? -1.43 : 1.43, cxr = (r.x0 + r.x1) / 2, back = r.side < 0 ? r.z0 + WT : r.z1 - WT, toward = -r.side;
          { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshBasicMaterial({ map: numTex(ph ? 'PH' : no) })); pl.position.set(r.door[1] + 0.35, 1.7, r.side < 0 ? -1.43 : 1.43); pl.rotation.y = r.side < 0 ? 0 : Math.PI; inner.add(pl); }
          if (ph) { const d = M(BOX(1.6, 2.4, 0.08), toon(stone ? '#5a3d2b' : '#334155'), 0, 1.2, 1.5, inner, 0.01); doors.push({ f, ph: true, mesh: d }); }
          // furniture: bed in the back corner, a nightstand lamp, a rug, a sofa facing the TV, the TV on the side wall
          const R = new THREE.Group(); inner.add(R);
          const bw = ph ? 2.1 : 1.8, bx = r.x0 + 1.2, bz = back + toward * 1.2;
          M(BOX(bw, 0.5, 2.3), toon(ph ? '#f8fafc' : '#e5e0d4'), bx, 0.28, bz, R, 0.02); M(BOX(bw, 0.9, 0.15), toon(stone ? '#6b4a2c' : '#475569'), bx, 0.6, back + toward * 0.1, R, 0.01);
          M(BOX(bw - 0.1, 0.08, 1.2), toon(ph ? '#c42d3c' : ['#2563eb', '#16a34a', '#c42d3c', '#a855f7', '#e0a84a'][r.n - 1]), bx, 0.56, bz + toward * 0.45, R, 0);
          { const lp = M(new THREE.SphereGeometry(0.16, 8, 6), glowing('#ffe0a0', null, 1.2), bx + bw / 2 + 0.35, 0.9, back + toward * 0.35, R, 0); lp.castShadow = false; M(BOX(0.45, 0.55, 0.45), toon('#6b4a2c'), bx + bw / 2 + 0.35, 0.28, back + toward * 0.35, R, 0.01); }
          M(BOX(2.2, 0.02, 1.6), toon(['#fde68a', '#bbf7d0', '#fecaca', '#ddd6fe', '#bae6fd'][r.n - 1]), cxr + 0.6, 0.03, (r.z0 + r.z1) / 2, R, 0);
          const tx = r.x1 - 0.25, tz = (r.z0 + r.z1) / 2 + toward * 0.2;
          M(BOX(0.5, 0.55, 1.5), toon('#3a3f46'), r.x1 - 0.45, 0.28, tz, R, 0.01);
          { const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.88), tvM); scr.position.set(r.x1 - WT * 0 - 0.2, 1.25, tz); scr.rotation.y = -Math.PI / 2; R.add(scr); M(BOX(0.08, 0.98, 1.5), DARK, r.x1 - 0.14, 1.25, tz, R, 0); }
          { const s = new THREE.Group(); s.position.set(cxr + 0.2, 0, tz); s.rotation.y = Math.PI / 2; R.add(s); M(BOX(1.8, 0.42, 0.8), toon(stone ? '#7a5236' : '#64748b'), 0, 0.28, 0, s, 0.01); M(BOX(1.8, 0.5, 0.18), toon(stone ? '#6b4a2c' : '#475569'), 0, 0.65, -0.35, s, 0.01); }
          if (ph) { M(BOX(0.8, 0.9, 2.2), toon('#e5e7eb'), r.x0 + 0.6, 0.45, (r.z0 + r.z1) / 2 + 0.6, R, 0.01); M(new THREE.IcosahedronGeometry(0.5, 0), toon('#3f7d3f'), r.x1 - 0.6, 0.9, back + toward * 0.5, R, 0.02, 0.5); }
        }
      }
      levels.push({ L, inner, SD, low, lint });
    }
    // roof + the elevator car
    const roof = new THREE.Group(); roof.position.y = 3 * FH; G.add(roof);
    M(BOX(W2 * 2 + 0.4, 0.3, D2 * 2 + 0.4), stone ? toon('#8a5a46') : toon('#cfd6dc'), 0, 0.15, 0, roof, 0.03);
    for (const [x, z, w, d] of [[0, D2, W2 * 2 + 0.4, 0.25], [0, -D2, W2 * 2 + 0.4, 0.25], [W2, 0, 0.25, D2 * 2], [-W2, 0, 0.25, D2 * 2]]) M(BOX(w, 0.7, d), stone ? toon('#a8584a') : toon('#94a3b8'), x, 0.5, z, roof, 0.02);
    if (stone) { M(BOX(1.2, 2.0, 1.2), BK.texMat('brick', '#8a4a3a', 1, 2), -5, 1.2, -4, roof, 0.02); M(new THREE.CylinderGeometry(0.9, 0.9, 1.8, 12), toon('#7a6a5a'), 4.5, 1.2, -4, roof, 0.02, 0.9); }
    else { M(BOX(2.4, 1.0, 1.6), toon('#94a3b8'), -4, 0.8, -4, roof, 0.02); M(new THREE.CylinderGeometry(0.05, 0.07, 5, 6), DARK, 5, 2.8, -5, roof, 0.01, 0.07); const bl = M(new THREE.SphereGeometry(0.15, 8, 6), glowing('#ff3b3b', null, 2), 5, 5.3, -5, roof, 0); bl.castShadow = false; }
    const car = new THREE.Group(); G.add(car);
    M(BOX(2.3, 0.12, 2.5), toon('#9ca3af'), 0, 0.06, -2.85, car, 0.01); M(BOX(2.3, 0.1, 2.5), toon('#d1d5db'), 0, 2.55, -2.85, car, 0.01);
    for (const x of [-1.12, 1.12]) M(BOX(0.06, 2.5, 2.5), toon('#b0b7c0'), x, 1.28, -2.85, car, 0); M(BOX(2.3, 2.5, 0.06), toon('#b0b7c0'), 0, 1.28, -4.08, car, 0);
    { const lt = M(BOX(1.2, 0.04, 0.6), glowing('#fff6e0', null, 1.4), 0, 2.48, -2.85, car, 0); lt.castShadow = false; }
    cars[b.key] = car;
    out.push({ b, G, levels, roof, doors, car });
  }
  let t = 0;
  return {
    groups: out.map(o => o.G),
    setNews(list) { news = list && list.length ? list : news; },
    update(dt, Pl, st, camPos) {
      t += dt; nt -= dt; tick += dt * 60; if (nt <= 0) { nt = 0.2; if (Math.floor(t / 6) !== ni) ni = Math.floor(t / 6); drawTV(); }
      for (const o of out) {
        const b = o.b, here = st.apt && st.apt.b === b.key, f = here ? st.apt.floor : -1, cs = st.car[b.key], ride = st.ride && st.ride.b === b.key ? st.ride : null, d = Math.hypot(Pl.x - b.cx, Pl.z - b.cz);
        o.G.visible = d < 110;
        const topShown = here ? Math.max(f, ride ? Math.max(ride.from, ride.to) : f) : 99;
        const [qx, qz] = toLocal(b, camPos.x, camPos.z), fl = Math.max(0, f);
        o.levels.forEach((lv, i) => { lv.L.visible = i <= topShown; lv.inner.visible = here || d < 26; const cut = here && i === fl; lv.SD.F.visible = !(cut && qz > D2 - 1); lv.SD.B.visible = !(cut && qz < -D2 + 1); lv.SD.R.visible = !(cut && qx > W2 - 1); lv.SD.L.visible = !(cut && qx < -W2 + 1); const k = cut && i > 0 ? 0.36 : 1; for (const w of lv.low) { w.scale.y = k; w.position.y = FH / 2 * k; } for (const w of lv.lint) w.visible = !(cut && i > 0); });
        o.roof.visible = !here;
        o.car.position.y = cs.y; o.car.visible = here || d < 26;
        for (const dd of o.doors) { if (dd.ph) { dd.mesh.visible = !st.rentOpen(b.key); continue; } const want = cs.floor === dd.f && cs.open && !cs.moving ? 1 : 0; dd.open += (want - dd.open) * Math.min(1, dt * 6); dd.dl.position.x = -0.55 - dd.open * 0.95; dd.dr.position.x = 0.55 + dd.open * 0.95; }
      }
    },
  };
}
export const ROOM_LIST = ROOMS;
export const CAR_RECT = CAR;
