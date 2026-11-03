// DEEP SPACE FOX · the look of the MAIN RING (s349): architecture, shopfronts, kiosks, the hub + lift, the windows and space outside.
// Frame: metres, x east, z south, θ in degrees clockwise from north. pol(r, θ) → [x, z].
import { FONT } from '../engine/textures.js';
export const D = Math.PI / 180;
const lerp = (a, b, t) => a + (b - a) * t;
export const pol = (r, th) => [r * Math.sin(th * D), -r * Math.cos(th * D)];
export const angOf = (x, z) => ((Math.atan2(x, -z) / D) % 360 + 360) % 360;
export const adiff = (a, b) => { let d = (a - b) % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
export const R = { drop: 51, wall: 100, bal0: 92, bal1: 104, yb: 7, yc: 15, hub: 20, core: 5, kiosk: 66, lamp: 77, upHub: 12 };
export const SPOKES = [0, 90, 180, 270], BRIDGES = [45, 135, 225, 315], BAYS = [67.5, 202.5, 315];
export const STAIRS = [{ th0: 72.6, th1: 81.4 }, { th0: 207.6, th1: 216.4 }].map(s => { const a = pol(89.5, s.th0), b = pol(89.5, s.th1), L = Math.hypot(b[0] - a[0], b[1] - a[1]); return { ...s, a, ux: (b[0] - a[0]) / L, uz: (b[1] - a[1]) / L, L }; });
export const SHOPS = [
  { key: 'dsfQuirks', name: "QUIRK'S BAR", roof: "QUIRK'S", door: "QUIRK'S BAR · DABA · DRINKS", th: 0, w: 30, trim: '#e0a13c', wall: '#4a3218', style: 'quirks', open: true, room: 'bar' },
  { key: 'dsfHolosuites', name: 'HOLOSUITES', roof: 'HOLOSUITES', door: 'HOLOSUITES · BOOK A PROGRAM', th: 22.5, w: 20, trim: '#ff9a3a', wall: '#1e1a26', style: 'holo' },
  { key: 'dsfTailor', name: "GAROK'S", roof: "GAROK'S", door: "GAROK'S · TAILOR · FOXY TAILORS", th: 45, w: 18, trim: '#b98ad8', wall: '#2e2238', style: 'tailor' },
  { key: 'dsfInfirmary', name: 'INFIRMARY', roof: 'INFIRMARY', door: 'INFIRMARY · SICKBAY · BONE SET', th: 90, w: 28, trim: '#5fe3ff', wall: '#c9d4da', style: 'infirm' },
  { key: 'dsfBank', name: 'LATINUM VAULT', roof: 'LATINUM VAULT', door: 'BANK · LATINUM VAULT', th: 112.5, w: 16, trim: '#f2c94c', wall: '#1c1c1e', style: 'bank' },
  { key: 'dsfTemple', name: 'TEMPLE OF GAYA', roof: 'TEMPLE OF GAYA', door: 'TEMPLE OF GAYA · SHRINE', th: 135, w: 24, trim: '#f2d98b', wall: '#3a2a18', style: 'temple' },
  { key: 'dsfPost', name: 'MERU EMBASSY', roof: 'MERU EMBASSY', door: 'GALACTIC POST · MERU EMBASSY', th: 157.5, w: 16, trim: '#7fb8de', wall: '#2a3440', style: 'post' },
  { key: 'dsfCargo', name: 'CARGO BAY FOUR', roof: 'CARGO BAY FOUR', door: 'CARGO BAY 4 · SHUTTLE HIRE', th: 180, w: 32, trim: '#e8c45a', wall: '#33302a', style: 'cargo', dw: 10, dh: 6, open: true, room: 'cargo' },
  { key: 'dsfEngineering', name: 'ENGINEERING', roof: 'ENGINEERING', door: 'ENGINEERING · MAIN CORE · DAMAGE CONTROL', th: 225, w: 26, trim: '#8fe38f', wall: '#1e2a20', style: 'eng' },
  { key: 'dsfArmory', name: 'ARMORY', roof: 'ARMORY', door: 'ARMORY · GEAR', th: 247.5, w: 14, trim: '#ff8a6a', wall: '#2a2828', style: 'armory' },
  { key: 'dsfSecurity', name: 'SECURITY', roof: 'SECURITY', door: 'SECURITY · BRIG', th: 270, w: 26, trim: '#ff8a6a', wall: '#3a1e1a', style: 'security' },
  { key: 'dsfBarracks', name: 'MILITIA', roof: 'MILITIA', door: 'MILITIA BUNKROOM · BARRACKS', th: 292.5, w: 18, trim: '#ffb36a', wall: '#2a2e34', style: 'barracks' },
  { key: 'dsfShip', name: 'AIRLOCK 3 · VOLE', roof: 'AIRLOCK 3 · VOLE', door: 'AIRLOCK · RUNABOUT VOLE', th: 304, w: 14, trim: '#c9b07a', wall: '#3a3e44', style: 'airlock' },
  { key: 'dsfHydro', name: 'HYDROPONICS', roof: 'HYDROPONICS', door: 'HYDROPONICS BAY · FARM', th: 337.5, w: 24, trim: '#9ff09f', wall: '#1a2a1e', style: 'hydro' },
].map(s => ({ ...s, df: Math.sqrt(99.4 * 99.4 - (s.w / 2) * (s.w / 2)), half: Math.asin((s.w / 2) / 99.4) / D }));
export const KIOSKS = [
  { key: 'dsfPavs', name: "PAV'S HONEYROOT", roof: "PAV'S", door: "PAV'S HONEYROOT · HOT FOOD", th: 45, w: 12, d: 8, front: 1.4, trim: '#e0a13c', style: 'pavs' },
  { key: 'dsfNews', name: 'STATION 8 NEWS', roof: 'STATION 8 NEWS', door: 'NEWS · ON AIR', th: 135, w: 10, d: 8, front: 0.4, trim: '#ff5a3a', style: 'news' },
  { key: 'dsfVorKiosk', name: "VOR'S EXCHANGE", roof: "VOR'S", door: "VOR'S EXCHANGE · ITEMS", th: 225, w: 10, d: 10, front: 0.4, trim: '#e8c45a', style: 'vor' },
  { key: 'dsfSparkBolt', name: 'SPARK & BOLT', roof: 'SPARK & BOLT', door: 'SPECIAL WEAPONS', th: 262, w: 9, d: 7, front: 0.4, trim: '#ff4a3a', style: 'spark' },
  { key: 'dsfCurios', name: 'GAYAN CURIOS', roof: 'GAYAN CURIOS', door: 'RELICS · CURIOS', th: 315, w: 9, d: 7, front: 0.4, trim: '#f2d98b', style: 'curios' },
];
export const SPOTS = { lookout: { th: 22.5, r: 99, y: 7 }, embed: { th: 112.5, r: 99, y: 7 }, kneel: { th: 135, r: 99, y: 7 }, pad: { th: 0, r: 13 } };

export function canvas(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
export function buildStation(K) {
  const { THREE, scene, M, BOX, toon, basic, glowSprite, rnd, rr, pick, LOW } = K;
  const anims = [], obs = [], tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const shade = (h, k) => '#' + new THREE.Color(h).multiplyScalar(k).getHexString();
  const B = (w, h, d, mat, x, y, z, p, ol = 0) => { const m = M(BOX(w, h, d), mat, x, y, z, p, ol); m.castShadow = false; return m; };
  const C = (r1, r2, h, mat, x, y, z, p, seg = 16) => { const m = M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0); m.castShadow = false; return m; };
  const flat = (geo, mat, x, y, z, p) => { const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); (p || scene).add(m); return m; };
  function signTex(lines, { fg = '#f3f2f2', bg = '#0e0d0c', bord = null, w = 1024, h = 256, sub = null } = {}) {
    lines = [].concat(lines);
    return tex(canvas(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); if (bord) { const lw = Math.max(6, h * 0.05); g.strokeStyle = bord; g.lineWidth = lw; g.strokeRect(lw / 2, lw / 2, w - lw, h - lw); }
      const n = lines.length, lh = h * 0.8 / n; lines.forEach((t, i) => { let fs = lh * (i ? 0.7 : 0.86); g.font = `900 ${fs}px ${FONT}`; const tw = g.measureText(t).width, mw = w * 0.9; if (tw > mw) { fs *= mw / tw; g.font = `900 ${fs}px ${FONT}`; } g.fillStyle = i && sub ? sub : fg; g.textBaseline = 'middle'; g.fillText(t, w * 0.05, h * 0.1 + lh * (i + 0.5)); }); }));
  }
  const signPlane = (lines, w, h, o, p, x, y, z) => { const ch = Math.max(128, Math.round(1024 * h / w)); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex(lines, { ...o, w: 1024, h: ch }), toneMapped: false })); m.position.set(x, y, z); (p || scene).add(m); return m; };
  const toWorld = (g, lx, lz) => { g.updateMatrixWorld(true); const v = new THREE.Vector3(lx, 0, lz); g.localToWorld(v); return v; };
  const ob = (g, lx, lz, r) => { const v = toWorld(g, lx, lz); obs.push({ x: v.x, z: v.z, r }); };
  // tiny emissive texture makers
  const deckTex = (base, seam, n = 4, warm = 0) => tex(canvas(256, 256, (g, w) => { g.fillStyle = base; g.fillRect(0, 0, w, w); const s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = `rgba(${warm ? '255,200,140' : '200,220,255'},${(rnd() * 0.05).toFixed(3)})`; g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); g.fillStyle = seam; for (const [a, b] of [[6, 6], [s - 8, 6], [6, s - 8], [s - 8, s - 8]]) g.fillRect(i * s + a, j * s + b, 2, 2); }
    g.strokeStyle = seam; g.lineWidth = 2; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, w); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); } }));
  const ringFloor = (r0, r1, y, map, rep, col = '#ffffff') => { const g = new THREE.RingGeometry(r0, r1, 160, 2); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(rep, rep); const m = flat(g, toon(col, { map }), 0, y, 0); m.receiveShadow = true; return m; };
  const ringStrip = (r, w, y, col, op = 1) => flat(new THREE.RingGeometry(r - w / 2, r + w / 2, 180, 1), basic(col, op, true), 0, y, 0);
  const wallArc = (r, y0, y1, a, b, mat) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, y1 - y0, Math.max(8, Math.round((b - a) / 1.5)), 1, true, Math.PI - b * D, (b - a) * D), mat); m.position.y = (y0 + y1) / 2; scene.add(m); return m; };
  // instanced helpers
  const inst = (geo, mat, list) => { const im = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)), o = new THREE.Object3D(); list.forEach(([x, y, z, ry = 0, sx = 1, sy = 1, sz = 1], i) => { o.position.set(x, y, z); o.rotation.set(0, ry, 0); o.scale.set(sx, sy, sz); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.count = list.length; scene.add(im); return im; };
  const railMat = toon('#8a8478'), postMat = toon('#3a3632');
  function ringRail(r, y, step, skip, h = 1.05) { const posts = [], bars = []; const chord = 2 * r * Math.sin(step * D / 2);
    for (let th = 0; th < 360; th += step) { const a = th, b = th + step, m = th + step / 2; if (skip(a) || skip(b)) continue; const [x, z] = pol(r, a); posts.push([x, y + h / 2, z]); const [mx, mz] = pol(r * Math.cos(step * D / 2), m); bars.push([mx, y + h, mz, -m * D]); bars.push([mx, y + h * 0.5, mz, -m * D]); }
    inst(new THREE.CylinderGeometry(0.045, 0.045, h, 6), postMat, posts); inst(BOX(chord, 0.07, 0.07), railMat, bars); }

  // ---------- floors ----------
  const PLATE = toon('#ffffff'); void PLATE;
  ringFloor(R.drop, R.lamp, 0, deckTex('#45423e', '#2c2a27', 4), 42, '#a8a196');
  ringFloor(R.lamp, R.bal0, 0.004, deckTex('#5c4e3e', '#3a3026', 3, 1), 40, '#d2b48c');
  ringFloor(R.bal0, R.wall + 0.5, 0.002, deckTex('#3a3734', '#23211f', 4), 46, '#9a948a');
  ringFloor(R.core, R.hub, 0, deckTex('#3c4048', '#262a30', 4), 10, '#b8c0cc');
  ringStrip(R.drop + 1.2, 0.18, 0.02, '#ffb454', 0.9); ringStrip(R.lamp - 0.9, 0.16, 0.02, '#ffb454', 0.85); ringStrip(R.bal0 - 0.5, 0.16, 0.02, '#ffb454', 0.85); ringStrip(R.hub - 0.8, 0.14, 0.02, '#7fe3ff', 0.9);
  // the DROP round the hub: a lit well to the lower levels
  { const dm = toon('#1c1e22', { side: THREE.DoubleSide }); wallArc(R.drop, -46, 0, 0, 360, dm); wallArc(R.hub, -46, 0, 0, 360, dm);
    for (const y of [-7, -16, -27, -38]) for (const r of [R.drop - 0.15, R.hub + 0.15]) { const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.12, 6, 120), basic(y > -20 ? '#ffb454' : '#7fe3ff', 0.85, true)); t.rotation.x = Math.PI / 2; t.position.y = y; scene.add(t); }
    const wins = []; for (const y of [-4, -11, -21, -32]) for (let th = 0; th < 360; th += LOW ? 6 : 3) { const [x, z] = pol(R.drop - 0.12, th + y); wins.push([x, y, z, -(th + y) * D]); } inst(BOX(1.1, 0.5, 0.05), basic('#ffd9a0', 0.85), wins);
    const bot = flat(new THREE.CircleGeometry(R.drop, 64), new THREE.MeshBasicMaterial({ map: tex(canvas(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 10, w / 2, w / 2, w / 2); gr.addColorStop(0, '#5a3a1a'); gr.addColorStop(0.5, '#221812'); gr.addColorStop(1, '#0a0908'); g.fillStyle = gr; g.fillRect(0, 0, w, w); })) }), 0, -46, 0); void bot; }
  // catwalks over the drop (2D gates dsfSpoke0 / 90 / 180 / 270)
  for (const a of SPOKES) { const r0 = R.hub - 1, r1 = R.drop + 1, L = r1 - r0, [x, z] = pol((r0 + r1) / 2, a), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = -a * D; scene.add(g);
    B(6, 0.3, L, toon('#4a4e56'), 0, -0.15, 0, g); B(0.2, 0.02, L, basic('#ffb454', 0.9, true), 0, 0.01, 0, g);
    for (const s of [-1, 1]) { B(0.08, 0.08, L, railMat, s * 2.9, 1.05, 0, g); B(0.08, 0.08, L, railMat, s * 2.9, 0.55, 0, g); for (let i = 0; i <= 8; i++) C(0.045, 0.045, 1.05, postMat, s * 2.9, 0.52, -L / 2 + i * L / 8, g, 6); B(0.3, 0.6, L, toon('#2a2d33'), s * 2.9, -0.5, 0, g); }
    for (const s of [-1, 1]) { C(0.06, 0.08, 2.4, toon('#3b4250'), s * 2.9, 1.2, -L / 4, g, 8); B(0.3, 0.12, 0.3, basic('#ffd9a0'), s * 2.9, 2.45, -L / 4, g); const v = toWorld(g, s * 2.9, -L / 4); glowSprite(v.x, 2.45, v.z, 0xffc070, 2, 0.5); } }
  ringRail(R.drop + 0.25, 0, 2.5, th => SPOKES.some(a => Math.abs(adiff(th, a)) < 3.6));
  ringRail(R.hub - 0.25, 0, 6, th => SPOKES.some(a => Math.abs(adiff(th, a)) < 9));

  // ---------- the outer wall, window bays, the balcony, the ceiling ----------
  const wallM = toon('#3a3530', { side: THREE.DoubleSide }), bandM = toon('#2b2724', { side: THREE.DoubleSide });
  const bayOpen = BAYS.map(b => [b - 4.6, b + 4.6]);
  { let prev = bayOpen[bayOpen.length - 1][1] - 360; for (const [a, b] of bayOpen) { wallArc(R.wall, 0, R.yb, prev, a, wallM); prev = b; } }
  for (const b of BAYS) { const g = new THREE.Group(), [x, z] = pol(R.wall - 0.15, b); g.position.set(x, 0, z); g.rotation.y = -b * D; scene.add(g); const w = 2 * R.wall * Math.sin(4.6 * D);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, 6.2), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide })); glass.position.set(0, 3.4, 0); g.add(glass);
    for (let i = 0; i <= 4; i++) B(0.22, 6.6, 0.3, toon('#24221f'), -w / 2 + i * w / 4, 3.3, 0, g); for (const y of [0.25, 3.4, 6.55]) B(w, 0.25, 0.3, toon('#24221f'), 0, y, 0, g);
    B(w * 0.86, 0.08, 0.08, railMat, 0, 1.05, 1.4, g); for (let i = 0; i <= 6; i++) C(0.045, 0.045, 1.05, postMat, -w * 0.43 + i * w * 0.86 / 6, 0.52, 1.4, g, 6);
    B(4.4, 0.5, 1.1, toon('#5a4a38'), 0, 0.45, 4.2, g); ob(g, 0, 4.2, 2.1);
    signPlane(['UPPER PYLON ' + ['ONE', 'TWO', 'THREE'][BAYS.indexOf(b)], 'DOCKING RING VIEW'], 6, 1.1, { fg: '#ffd9a0', bg: '#0e0d0c', sub: '#f3f2f2' }, g, 0, 6.0, 0.3); }
  // balcony slab, fascia, rail; upper back wall with the window band all the way round
  { const top = flat(new THREE.RingGeometry(R.bal0, R.bal1, 180, 1), toon('#5c4e3e', { map: (() => { const m = deckTex('#5c4e3e', '#3a3026', 3, 1); m.wrapS = m.wrapT = THREE.RepeatWrapping; m.repeat.set(60, 60); return m; })() }), 0, R.yb, 0); top.receiveShadow = true;
    const und = flat(new THREE.RingGeometry(R.bal0, R.wall, 180, 1), toon('#26221f', { side: THREE.DoubleSide }), 0, R.yb - 0.45, 0); void und;
    wallArc(R.bal0, R.yb - 0.45, R.yb, 0, 360, toon('#1f1c1a', { side: THREE.DoubleSide }));
    { const t = new THREE.Mesh(new THREE.TorusGeometry(R.bal0 - 0.04, 0.06, 6, 200), basic('#ffb454', 0.95, true)); t.rotation.x = Math.PI / 2; t.position.y = R.yb - 0.3; scene.add(t); }
    ringRail(R.bal0 + 0.25, R.yb, 1.5, th => STAIRS.some(s => adiff(th, s.th1) > -0.8 && adiff(th, s.th1) < 2.8) || BRIDGES.some(a => Math.abs(adiff(th, a)) < 1.6));
    wallArc(R.bal1, R.yb, R.yb + 1, 0, 360, bandM); wallArc(R.bal1, R.yc - 1, R.yc, 0, 360, bandM);
    const gl = new THREE.Mesh(new THREE.CylinderGeometry(R.bal1, R.bal1, R.yc - R.yb - 2, 120, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide })); gl.position.y = (R.yb + 1 + R.yc - 1) / 2; scene.add(gl);
    const mull = []; for (let th = 0; th < 360; th += 4) { const [x, z] = pol(R.bal1 - 0.1, th); mull.push([x, (R.yb + R.yc) / 2, z, -th * D]); } inst(BOX(0.3, R.yc - R.yb, 0.3), toon('#24221f'), mull);
    const sc = []; for (let th = 2; th < 360; th += 8) { const [x, z] = pol(R.bal1 - 0.35, th); sc.push([x, R.yb + 1.3, z, -th * D]); } inst(BOX(0.8, 0.18, 0.2), basic('#ffd9a0'), sc);
    // columns under the balcony edge, between the doors
    for (let k = 0; k < 16; k++) { const th = 11.25 + k * 22.5, [x, z] = pol(R.bal0 + 0.2, th); C(0.42, 0.5, R.yb - 0.45, toon('#4a423a'), x, (R.yb - 0.45) / 2, z, null, 12); C(0.56, 0.56, 0.3, toon('#2a2622'), x, 0.15, z, null, 12); const s = new THREE.Mesh(BOX(0.12, 2.4, 0.04), basic('#ffb454', 0.9, true)); s.position.set(x, 3.2, z); s.rotation.y = -th * D; scene.add(s); obs.push({ x, z, r: 0.75 }); } }
  // ceiling
  { const cm = toon('#25262a', { side: THREE.DoubleSide }); const c = flat(new THREE.RingGeometry(R.core, R.bal1, 160, 1), cm, 0, R.yc, 0); void c;
    for (const r of [32, 58, 84]) { const t = flat(new THREE.RingGeometry(r - 0.35, r + 0.35, 180, 1), basic('#ffe0b0', 0.9), 0, R.yc - 0.05, 0); void t; }
    const beams = []; for (let th = 0; th < 360; th += 15) { const [x, z] = pol((R.core + R.bal1) / 2, th); beams.push([x, R.yc - 0.5, z, -th * D]); } inst(BOX(0.7, 0.9, R.bal1 - R.core), toon('#1c1d20'), beams); }
  // light poles lining the promenade lane
  { const L = [], hd = []; const lampGlow = []; let i = 0;
    for (let th = 3.75; th < 360; th += 7.5) { const [x, z] = pol(R.lamp, th); L.push([x, 1.5, z]); hd.push([x, 3.05, z, -th * D]); obs.push({ x, z, r: 0.35 }); if (!LOW || i % 2 === 0) lampGlow.push(glowSprite(x, 3.05, z, 0xffc070, 2.6, 0.55)); i++; }
    inst(new THREE.CylinderGeometry(0.07, 0.11, 3, 8), toon('#3b3630'), L); inst(BOX(0.9, 0.16, 0.34), basic('#ffd9a0'), hd);
    anims.push((dt, t) => lampGlow.forEach((s, k) => { s.material.opacity = 0.48 + 0.08 * Math.sin(t * 1.3 + k); })); }

  // ---------- shopfronts ----------
  const STY = {};
  const glowM = (c, o = 1) => basic(c, o);
  STY.quirks = (g, s) => { const W = s.w; for (const sx of [-1, 1]) { const ww = W / 2 - 3.4; B(ww, 4.8, 0.08, glowM('#ffb454', 0.92), sx * (1.9 + ww / 2), 3.0, 0.08, g); for (let i = 0; i <= 4; i++) B(0.14, 4.9, 0.2, toon('#2a1a0c'), sx * (1.9 + i * ww / 4), 3.0, 0.14, g); B(ww, 0.2, 0.2, toon('#2a1a0c'), sx * (1.9 + ww / 2), 3.3, 0.14, g);
      for (let i = 0; i < 4; i++) { const x = sx * (2.8 + i * ww / 4.3); C(0.32, 0.32, 0.12, toon('#1a0f06'), x, 1.0, 0.3, g, 10); C(0.05, 0.05, 0.9, toon('#1a0f06'), x, 0.5, 0.3, g, 6); } }
    const wt = tex(canvas(512, 512, (c, w) => { const n = 16; for (let i = 0; i < n; i++) { c.beginPath(); c.moveTo(w / 2, w / 2); c.arc(w / 2, w / 2, w / 2 - 6, i / n * 6.283, (i + 1) / n * 6.283); c.closePath(); c.fillStyle = i % 2 ? '#b3121b' : '#151210'; if (i % 4 === 0) c.fillStyle = '#e0a13c'; c.fill(); } c.lineWidth = 10; c.strokeStyle = '#f7d67a'; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 8, 0, 6.283); c.stroke(); c.fillStyle = '#f7d67a'; c.beginPath(); c.arc(w / 2, w / 2, 46, 0, 6.283); c.fill(); }));
    const wheel = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48), new THREE.MeshBasicMaterial({ map: wt })); wheel.position.set(0, 4.85, 0.3); g.add(wheel); const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.1, 8, 48), toon('#f7d67a', { emissive: new THREE.Color('#7a5010'), emissiveIntensity: 0.6 })); ring.position.copy(wheel.position); g.add(ring);
    anims.push(dt => { wheel.rotation.z -= dt * 0.9; }); glowSprite(0, 4.85, 0.6, 0xffb454, 6, 0.4, g);
    const spill = flat(new THREE.PlaneGeometry(W * 0.75, 7), new THREE.MeshBasicMaterial({ map: tex(canvas(128, 128, (c, w) => { const gr = c.createRadialGradient(w / 2, 0, 4, w / 2, 0, w); gr.addColorStop(0, 'rgba(255,180,84,0.55)'); gr.addColorStop(1, 'rgba(255,180,84,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); })), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 0.03, 3.6, g); void spill; };
  STY.holo = (g, s) => { const W = s.w; const ht = tex(canvas(512, 256, (c, w, h) => { c.fillStyle = '#0c0a10'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ff9a3a'; c.lineWidth = 2; const r = 18; for (let y = 0, row = 0; y < h + r; y += r * 1.5, row++) for (let x = (row % 2) * r * 0.87; x < w + r; x += r * 1.74) { c.globalAlpha = 0.25 + rnd() * 0.6; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283 + Math.PI / 6; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.stroke(); } }));
    ht.wrapS = THREE.RepeatWrapping; const hp = new THREE.Mesh(new THREE.PlaneGeometry(W - 1.4, 6.0), new THREE.MeshBasicMaterial({ map: ht, toneMapped: false })); hp.position.set(0, 3.2, 0.05); g.add(hp); anims.push(dt => { ht.offset.x += dt * 0.02; });
    const pr = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.14, 8, 40), basic('#ff9a3a')); pr.position.set(0, 1.95, 0.22); g.add(pr);
    const lt = B(0.9, 0.3, 0.2, glowM('#ec3013'), 0, 4.35, 0.2, g); void lt; const gs = glowSprite(0, 4.35, 0.4, 0xff3a1a, 1.6, 0.7, g); anims.push((dt, t) => { gs.material.opacity = 0.5 + 0.3 * Math.sin(t * 3); });
    signPlane('BOOKED', 1.6, 0.36, { fg: '#ec3013', bg: '#0c0a10' }, g, 0, 4.85, 0.21); };
  STY.tailor = (g, s) => { const W = s.w, ww = W / 2 - 2.6; B(ww, 4.2, 0.08, glowM('#d9b8f0', 0.55), -(1.9 + ww / 2), 2.6, 0.08, g); B(ww + 0.4, 0.3, 0.4, toon(s.trim), -(1.9 + ww / 2), 4.85, 0.2, g);
    for (let i = 0; i < 3; i++) { const x = -(2.6 + i * ww / 3.2), suit = toon(['#3a2a5a', '#5a2a3a', '#2a3a5a'][i]); M(new THREE.CapsuleGeometry(0.32, 0.9, 4, 10), suit, x, 1.5, 0.5, g, 0.02); M(new THREE.SphereGeometry(0.26, 12, 8), toon('#d8c8b0'), x, 2.35, 0.5, g, 0.02); for (const e of [-1, 1]) { const ear = M(new THREE.ConeGeometry(0.09, 0.22, 6), toon('#d8c8b0'), x + e * 0.14, 2.6, 0.5, g, 0); ear.rotation.z = -e * 0.3; } C(0.05, 0.05, 0.9, toon('#8a7a68'), x, 0.45, 0.5, g, 6); }
    const nd = C(0.05, 0.02, 2.0, toon('#e6c27a', { emissive: new THREE.Color('#6a4a10'), emissiveIntensity: 0.5 }), W / 2 - 2.2, 4.4, 0.5, g, 6); nd.rotation.z = 0.7; const th = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 24), basic(s.trim)); th.position.set(W / 2 - 2.2, 4.1, 0.5); g.add(th);
    B(4.6, 0.5, 0.3, toon('#7a3a9a'), 0, 3.95, 0.25, g); for (const sx of [-1, 1]) B(0.4, 1.6, 0.25, toon('#6a2a8a'), sx * 2.1, 3.0, 0.3, g); };
  STY.infirm = (g, s) => { const W = s.w; for (const y of [0.35, 5.9]) B(W - 1.2, 0.16, 0.1, glowM('#5fe3ff'), 0, y, 0.08, g);
    const cx = W / 2 - 4; B(2.6, 0.75, 0.2, glowM('#5fe3ff'), cx, 3.8, 0.2, g); B(0.75, 2.6, 0.2, glowM('#5fe3ff'), cx, 3.8, 0.2, g); glowSprite(cx, 3.8, 0.5, 0x5fe3ff, 5, 0.45, g);
    B(3.2, 3.6, 0.08, basic('#5fe3ff', 0.28), 0, 1.8, 0.16, g); B(0.06, 3.6, 0.1, glowM('#bff4ff'), 0, 1.8, 0.2, g);
    const ww = W / 2 - 4; B(ww, 3.0, 0.08, glowM('#d8f6ff', 0.6), -(2.6 + ww / 2), 2.4, 0.08, g); B(ww * 0.6, 0.6, 0.3, toon('#2a3a40'), -(2.6 + ww / 2), 1.3, 0.2, g); B(ww * 0.2, 0.25, 0.3, toon('#e8f0f4'), -(2.6 + ww * 0.75), 1.65, 0.22, g);
    B(1.3, 1.0, 0.8, toon('#eef4f6'), 1.6 + 3, 0.6, 1.6, g, 0.03); B(0.5, 0.18, 0.05, glowM('#5fe3ff'), 1.6 + 3, 0.85, 2.01, g); ob(g, 4.6, 1.6, 0.9); };
  STY.bank = (g, s) => { const W = s.w; const vd = new THREE.Group(); vd.position.set(0, 2.0, 0.35); g.add(vd); const v = M(new THREE.CylinderGeometry(1.9, 1.9, 0.5, 40), toon('#8a919a'), 0, 0, 0, vd, 0); v.rotation.x = Math.PI / 2; const hub = M(new THREE.CylinderGeometry(0.4, 0.4, 0.7, 16), toon('#c8ccd2'), 0, 0, 0, vd, 0); hub.rotation.x = Math.PI / 2;
    for (let k = 0; k < 3; k++) { const sp = B(3.0, 0.16, 0.16, toon('#c8ccd2'), 0, 0, 0.32, vd); sp.rotation.z = k * Math.PI / 3; } const vr = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.12, 8, 40), basic(s.trim)); vr.position.z = 0.28; vd.add(vr); anims.push(dt => { vd.rotation.z += dt * 0.15; });
    B(2.4, 1.6, 0.3, toon('#0a0a0b'), W / 2 - 2.4, 1.8, 0.1, g); for (let i = 0; i < 6; i++) B(0.5, 0.18, 0.25, toon('#f2c94c', { emissive: new THREE.Color('#8a6a10'), emissiveIntensity: 0.6 }), W / 2 - 3.2 + (i % 3) * 0.6, 1.2 + Math.floor(i / 3) * 0.2, 0.25, g); glowSprite(W / 2 - 2.4, 1.6, 0.5, 0xf2c94c, 2.2, 0.4, g);
    const tk = tex(canvas(1024, 64, (c, w, h) => { c.fillStyle = '#0a0a0b'; c.fillRect(0, 0, w, h); c.font = `800 40px ${FONT}`; c.fillStyle = '#f2c94c'; c.textBaseline = 'middle'; c.fillText('LATINUM 1.00 ▲   MERU GOLD 0.94 ▼   GAYA CREDIT 1.12 ▲   KUFA SALT 0.08 ▲   ', 10, h / 2); })); tk.wrapS = THREE.RepeatWrapping;
    const tp = new THREE.Mesh(new THREE.PlaneGeometry(W - 1.6, 0.42), new THREE.MeshBasicMaterial({ map: tk, toneMapped: false })); tp.position.set(0, 5.0, 0.1); g.add(tp); anims.push(dt => { tk.offset.x += dt * 0.05; }); };
  STY.temple = (g, s) => { const W = s.w, gold = toon('#e6c27a', { emissive: new THREE.Color('#6a4a10'), emissiveIntensity: 0.5 });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.32, 10, 40, Math.PI), gold); arch.position.set(0, 3.7, 0.35); g.add(arch); for (const sx of [-1, 1]) { C(0.34, 0.4, 3.7, gold, sx * 2.6, 1.85, 0.35, g, 12); B(0.8, 6.4, 0.5, gold, sx * (W / 2 - 1.0), 3.2, 0.25, g); }
    B(3.2, 3.6, 0.06, basic('#ffcf7a', 0.65), 0, 1.8, 0.14, g); glowSprite(0, 2.0, 0.8, 0xffb454, 6, 0.4, g);
    const flames = []; for (const sx of [-1, 1]) { const x0 = sx * 4.3; B(4.0, 4.0, 0.3, toon('#1a120a'), x0 + sx * 1.6, 2.6, 0.1, g); for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) { const x = x0 + sx * (k * 0.75), y = 1.2 + r * 1.2; C(0.06, 0.06, 0.28, toon('#f8f0e0'), x, y, 0.35, g, 6); flames.push(glowSprite(x, y + 0.24, 0.4, 0xffb030, 0.38, 0.9, g)); } }
    anims.push((dt, t) => flames.forEach((f, i) => { const k = 0.75 + 0.25 * Math.sin(t * 9 + i * 2.1) * Math.sin(t * 5.3 + i); f.material.opacity = k; f.scale.setScalar(0.32 + 0.1 * k); }));
    const gong = M(new THREE.CylinderGeometry(0.8, 0.8, 0.08, 32), toon('#b8862a', { emissive: new THREE.Color('#5a3a10'), emissiveIntensity: 0.4 }), W / 2 - 3.0, 2.4, 0.9, g, 0); gong.rotation.x = Math.PI / 2; for (const sx of [-1, 1]) C(0.06, 0.06, 3.4, toon('#3a2a18'), W / 2 - 3.0 + sx * 0.95, 1.7, 0.9, g, 6); B(2.0, 0.1, 0.1, toon('#3a2a18'), W / 2 - 3.0, 3.4, 0.9, g); ob(g, W / 2 - 3.0, 0.9, 1.0); };
  STY.post = (g, s) => { const W = s.w; const em = new THREE.Mesh(new THREE.CircleGeometry(0.95, 40), new THREE.MeshBasicMaterial({ map: tex(canvas(256, 256, (c, w) => { c.fillStyle = '#c8a050'; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 2, 0, 6.283); c.fill(); c.fillStyle = '#1a2430'; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 20, 0, 6.283); c.fill(); c.fillStyle = '#e6c27a'; c.font = `900 64px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MERU', w / 2, w / 2); })) })); em.position.set(0, 4.75, 0.2); g.add(em);
    const lk = tex(canvas(512, 512, (c, w) => { c.fillStyle = '#10161e'; c.fillRect(0, 0, w, w); for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) { c.fillStyle = rnd() < 0.7 ? '#bfe0ff' : '#4a6a8a'; c.fillRect(12 + i * 125, 12 + j * 100, 110, 86); c.fillStyle = '#10161e'; c.font = `800 30px ${FONT}`; c.fillText(String(100 + i * 5 + j), 24 + i * 125, 52 + j * 100); } }));
    const lp = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 5), new THREE.MeshBasicMaterial({ map: lk, toneMapped: false })); lp.position.set(W / 2 - 3.2, 3.0, 0.08); g.add(lp);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 6.4, 16, 1, true), basic('#bfe0ff', 0.25)); tube.position.set(-(W / 2 - 2.0), 3.3, 0.6); g.add(tube); const cap = M(new THREE.CapsuleGeometry(0.18, 0.4, 4, 8), toon('#e6c27a'), -(W / 2 - 2.0), 0.6, 0.6, g, 0); anims.push((dt, t) => { cap.position.y = 0.4 + ((t * 1.6) % 6.2); }); };
  STY.cargo = (g, s) => { const W = s.w; const st = tex(canvas(512, 128, (c, w, h) => { c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8c45a'; for (let x = -h; x < w + h; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 32, 0); c.lineTo(x + 32 + h, h); c.lineTo(x + h, h); c.closePath(); c.fill(); } }));
    st.wrapS = THREE.RepeatWrapping; st.repeat.set(2, 1); B(10.4, 0.06, 0.06, toon('#000'), 0, 0, 0, g); const bd = new THREE.Mesh(BOX(10.2, 1.4, 0.3), new THREE.MeshToonMaterial({ map: st })); bd.position.set(0, 5.4, 0.3); g.add(bd);
    B(9.6, 3.6, 0.05, basic('#3a2e1a', 1), 0, 2.2, 0.08, g); for (let i = 0; i < 4; i++) B(1.4, 1.2 + (i % 2) * 0.6, 0.4, toon('#1a140c'), -3.5 + i * 2.2, 0.8, 0.12, g);
    B(14, 0.45, 0.45, toon('#e8c45a'), 0, 6.35, 2.6, g); for (const sx of [-1, 1]) B(0.4, 0.4, 2.6, toon('#e8c45a'), sx * 6.8, 6.35, 1.3, g); C(0.03, 0.03, 2.4, toon('#111'), 2.2, 5.1, 2.6, g, 4); B(0.6, 0.35, 0.3, toon('#c03a1a'), 2.2, 3.8, 2.6, g);
    const crates = [[-8.5, 1.2, 1.6], [-10.2, 1.4, 1.2], [-9.2, 2.6, 1.0], [8.4, 1.3, 1.5], [10.4, 2.2, 1.2]]; crates.forEach(([x, z, sz], i) => { B(sz, sz, sz, toon(['#7a5a2a', '#5a6a3a', '#8a4a2a', '#4a5a6a', '#7a6a3a'][i]), x, sz / 2, z, g, 0.02); ob(g, x, z, sz * 0.75); }); B(1.0, 1.0, 1.0, toon('#6a4a2a'), -9.2, 2.2, 1.0, g);
    B(1.4, 1.1, 2.2, toon('#e8c45a'), 12.5, 0.75, 3.2, g, 0.03); B(0.12, 2.4, 0.12, toon('#222'), 12.1, 1.5, 2.0, g); B(0.12, 2.4, 0.12, toon('#222'), 12.9, 1.5, 2.0, g); B(1.2, 0.08, 1.0, toon('#333'), 12.5, 0.3, 1.5, g); ob(g, 12.5, 2.8, 1.6);
    const bc = glowSprite(W / 2 - 1.2, 6.2, 0.7, 0xff2a10, 2.4, 0.8, g); C(0.2, 0.25, 0.35, basic('#ff3a1a'), W / 2 - 1.2, 6.1, 0.5, g, 10); anims.push((dt, t) => { bc.material.opacity = 0.3 + 0.6 * Math.max(0, Math.sin(t * 4)); }); };
  STY.eng = (g, s) => { const W = s.w; for (const y of [1.0, 5.8]) B(W - 1.0, 0.4, 0.4, toon('#141c16'), 0, y, 0.2, g);
    for (const x of [-W / 2 + 1.6, -W / 2 + 2.4, -3.0, 3.0, W / 2 - 2.4, W / 2 - 1.6]) C(0.14, 0.14, 6.4, basic('#5fe35f', 0.9), x, 3.3, 0.45, g, 8);
    const core = new THREE.Mesh(new THREE.CircleGeometry(1.6, 40), basic('#8fe38f')); core.position.set(-(W / 4 + 0.8), 3.4, 0.14); g.add(core); const fr = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.2, 8, 40), toon('#3a443c')); fr.position.copy(core.position); g.add(fr); const cg = glowSprite(core.position.x, 3.4, 0.6, 0x5fe35f, 6, 0.5, g);
    anims.push((dt, t) => { const k = 0.6 + 0.4 * Math.sin(t * 2.2); core.material.color.setRGB(0.35 + 0.3 * k, 0.75 + 0.2 * k, 0.35 + 0.3 * k); cg.material.opacity = 0.3 + 0.35 * k; });
    for (let i = 0; i < 3; i++) { const x = W / 4 + 0.4 + i * 1.1; M(new THREE.CapsuleGeometry(0.3, 0.8, 4, 8), toon('#e8742a'), x, 1.4, 0.6, g, 0.02); M(new THREE.SphereGeometry(0.3, 12, 8), toon('#bfe0ff', { transparent: true, opacity: 0.8 }), x, 2.2, 0.6, g, 0); } ob(g, W / 4 + 1.5, 0.6, 1.6);
    const al = glowSprite(0, 4.4, 0.4, 0xff2a10, 1.8, 0.7, g); B(0.7, 0.3, 0.2, basic('#ff3a1a'), 0, 4.4, 0.2, g); anims.push((dt, t) => { al.material.opacity = 0.4 + 0.4 * Math.max(0, Math.sin(t * 2.5)); }); };
  STY.armory = (g, s) => { const W = s.w; const sh = tex(canvas(64, 256, (c, w, h) => { for (let y = 0; y < h; y += 16) { c.fillStyle = '#5a5c60'; c.fillRect(0, y, w, 12); c.fillStyle = '#2a2b2e'; c.fillRect(0, y + 12, w, 4); } })); const sp = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 3.5), new THREE.MeshToonMaterial({ map: sh })); sp.position.set(0, 1.8, 0.14); g.add(sp);
    B(3.4, 2.2, 0.08, basic('#ff8a6a', 0.28), W / 2 - 2.6, 2.4, 0.08, g); for (let i = 0; i < 5; i++) { const r = B(0.12, 1.5, 0.12, toon('#1a1a1a'), W / 2 - 3.9 + i * 0.65, 2.4, 0.16, g); r.rotation.z = 0.12; }
    C(0.06, 0.06, 1.0, toon('#555'), -(W / 2 - 2.4), 0.5, 1.1, g, 6); const bp = M(new THREE.SphereGeometry(0.5, 14, 10), toon('#e8edf4'), -(W / 2 - 2.4), 1.35, 1.1, g, 0.03); bp.scale.set(1, 1.2, 0.6); ob(g, -(W / 2 - 2.4), 1.1, 0.7);
    const hz = tex(canvas(256, 32, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8c45a'; for (let x = -h; x < w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 16, 0); c.lineTo(x + 16 + h, h); c.lineTo(x + h, h); c.fill(); } })); hz.wrapS = THREE.RepeatWrapping; hz.repeat.set(3, 1); flat(new THREE.PlaneGeometry(W - 1.2, 0.5), new THREE.MeshBasicMaterial({ map: hz }), 0, 0.02, 0.6, g); };
  STY.security = (g, s) => { const W = s.w; for (const sx of [-1, 1]) { const p = B(2.2, 6.4, 0.5, toon(shade(s.wall, 0.7)), sx * (W / 2 - 1.4), 3.2, 0.4, g); p.rotation.z = sx * 0.08; }
    const ww = W / 2 - 4.2; B(ww, 2.6, 0.08, glowM('#ffd0c0', 0.5), W / 4 + 0.6, 2.4, 0.08, g); B(ww, 2.6, 0.08, glowM('#6ac8ff', 0.55), -(W / 4 + 0.6), 2.4, 0.08, g); for (let i = 0; i < 7; i++) B(0.05, 2.5, 0.1, glowM('#bfe8ff'), -(W / 4 + 0.6) - ww / 2 + 0.3 + i * (ww - 0.6) / 6, 2.4, 0.14, g);
    C(0.22, 0.17, 0.4, toon('#8a8f96'), W / 4 + 0.6, 1.3, 0.25, g, 10);
    const scr = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) scr.push(B(1.0, 0.6, 0.06, basic('#9fd8ff', 0.8), -1.2 + i * 1.2, 4.3 + j * 0.7, 0.14, g)); anims.push((dt, t) => scr.forEach((m, i) => { m.material.opacity = 0.55 + 0.35 * Math.abs(Math.sin(t * (1.1 + i * 0.37) + i)); })); };
  STY.barracks = (g, s) => { const W = s.w; for (let i = 0; i < 6; i++) { const x = -W / 2 + 2 + i * (W - 4) / 5; const p = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), glowM('#ffd9a0', 0.9)); p.position.set(x, 4.7, 0.08); g.add(p); const f = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.08, 6, 20), toon('#1a1c20')); f.position.set(x, 4.7, 0.1); g.add(f); }
    signPlane(['DUTY ROSTER', 'A · WARF', 'B · KAL', 'C · RYNN'], 1.6, 1.6, { fg: '#ffb36a', bg: '#141618', sub: '#f3f2f2' }, g, -(1.6 + 1.6), 1.6, 0.08);
    for (let i = 0; i < 2; i++) B(0.9, 2.0, 0.6, toon('#4a5260'), 3.4 + i * 1.0, 1.0, 0.4, g, 0.02); ob(g, 3.9, 0.4, 1.2);
    const bn = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 3.0), new THREE.MeshBasicMaterial({ map: tex(canvas(128, 256, (c, w, h) => { c.fillStyle = '#b3121b'; c.fillRect(0, 0, w, h); c.fillStyle = '#f3f2f2'; c.font = `900 120px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('8', w / 2, h / 2); })), side: THREE.DoubleSide })); bn.position.set(-(W / 2 - 1.4), 4.2, 0.25); g.add(bn); };
  STY.hydro = (g, s) => { const W = s.w, ww = W / 2 - 2.2; for (const sx of [-1, 1]) { const cx = sx * (1.9 + ww / 2); B(ww, 5.8, 0.06, basic('#e0a8ff', 0.22), cx, 3.1, 0.55, g);
      const L = []; for (let r = 0; r < 5; r++) for (let k = 0; k < Math.floor(ww / 0.7); k++) L.push([k, r]); L.forEach(([k, r]) => B(0.5, 0.36, 0.2, toon(pick(['#4ac24a', '#6ae06a', '#2a9a3a', '#8af08a']), { emissive: new THREE.Color('#1a5a1a'), emissiveIntensity: 0.6 }), cx - ww / 2 + 0.45 + k * 0.7, 0.9 + r * 1.1, 0.28, g));
      for (let r = 0; r < 5; r++) B(ww, 0.06, 0.3, glowM('#ff8ae0', 0.9), cx, 1.2 + r * 1.1, 0.3, g); for (let i = 0; i <= 3; i++) B(0.12, 5.9, 0.12, toon('#1a2a1e'), cx - ww / 2 + i * ww / 3, 3.1, 0.6, g); }
    for (let i = 0; i < 12; i++) { const a = i / 11 * Math.PI; M(new THREE.SphereGeometry(rr(0.18, 0.32), 8, 6), toon(pick(['#3aa23a', '#5ac25a', '#2a8a2a'])), Math.cos(a) * 1.9, 3.7 + Math.sin(a) * 0.4 - (i % 3) * 0.25, 0.35, g, 0); }
    flat(new THREE.PlaneGeometry(W - 1.4, 0.3), basic('#5fe3ff', 0.7, true), 0, 0.03, 0.9, g); glowSprite(-(1.9 + ww / 2), 3, 1, 0xff8ae0, 5, 0.25, g); glowSprite(1.9 + ww / 2, 3, 1, 0xff8ae0, 5, 0.25, g); };
  STY.airlock = (g, s, dw, dh) => { const W = s.w, yel = toon('#e8c45a'); const cy = dh / 2 + 0.1; const ring = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.22, 8, 40), yel); ring.position.set(0, cy, 0.3); g.add(ring);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, t = B(0.38, 0.38, 0.2, yel, Math.cos(a) * 2.55, cy + Math.sin(a) * 2.55, 0.3, g); t.rotation.z = a; } anims.push(dt => { ring.rotation.z += dt * 0.2; });
    const al = glowSprite(0, cy + 3.0, 0.5, 0xffb454, 2.0, 0.7, g); C(0.22, 0.26, 0.35, basic('#ffb454'), 0, cy + 3.0, 0.4, g, 10); anims.push((dt, t) => { al.material.opacity = 0.35 + 0.45 * Math.max(0, Math.sin(t * 3)); });
    const vt = tex(canvas(512, 256, (c, w, h) => { c.fillStyle = '#02030a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${(0.3 + rnd() * 0.7).toFixed(2)})`; c.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); } c.fillStyle = '#c8ccd2'; c.beginPath(); c.moveTo(0, 90); c.lineTo(330, 90); c.lineTo(470, 150); c.lineTo(330, 200); c.lineTo(0, 200); c.closePath(); c.fill(); c.fillStyle = '#7fd8ff'; c.fillRect(250, 104, 90, 26); c.fillStyle = '#b3121b'; c.fillRect(0, 160, 330, 10); c.fillStyle = '#5a6068'; c.fillRect(0, 205, 260, 26); c.fillStyle = '#5fb8ff'; c.fillRect(0, 212, 240, 10); c.font = `900 26px ${FONT}`; c.fillStyle = '#b3121b'; c.fillText('NCC-72451', 30, 150); }));
    const ww = W / 2 - 3.6; const wp = new THREE.Mesh(new THREE.PlaneGeometry(ww, 2.4), new THREE.MeshBasicMaterial({ map: vt, toneMapped: false })); wp.position.set(-(3.0 + ww / 2), 2.6, 0.08); g.add(wp); B(ww + 0.3, 0.2, 0.2, toon('#24282e'), -(3.0 + ww / 2), 3.9, 0.12, g); B(ww + 0.3, 0.2, 0.2, toon('#24282e'), -(3.0 + ww / 2), 1.3, 0.12, g); };
  const shopG = {};
  for (const s of SHOPS) { const g = new THREE.Group(), [x, z] = pol(s.df, s.th); g.position.set(x, 0, z); g.rotation.y = -s.th * D; scene.add(g); shopG[s.key] = g; const W = s.w, H = R.yb - 0.45, dw = s.dw || 3.2, dh = s.dh || 3.6;
    B(W, H, 0.8, toon(s.wall), 0, H / 2, -0.4, g); for (const sx of [-1, 1]) B(0.7, H, 1.0, toon(shade(s.wall, 0.65)), sx * (W / 2 - 0.35), H / 2, 0.1, g);
    B(W - 1.4, 0.12, 0.08, basic(s.trim, 0.95), 0, H - 0.35, 0.06, g);
    B(dw, dh, 0.12, toon('#141518'), 0, dh / 2, 0.06, g); B(dw + 0.5, 0.18, 0.16, basic(s.trim), 0, dh + 0.09, 0.1, g); for (const sx of [-1, 1]) B(0.18, dh, 0.16, basic(s.trim), sx * (dw / 2 + 0.16), dh / 2, 0.1, g);
    const lines = s.door.split(' · '), dsh = 0.36 * lines.length + 0.3; signPlane(lines, 2.8, dsh, { fg: s.trim, bg: '#0e0d0c', sub: '#f3f2f2', bord: s.trim }, g, dw / 2 + 1.9, 1.75, 0.09);
    (STY[s.style] || (() => {}))(g, s, dw, dh);
    // the BIG sign hangs from the balcony edge, facing the promenade
    const [sx, sz] = pol(R.bal0 - 0.35, s.th), sg = new THREE.Group(); sg.position.set(sx, 0, sz); sg.rotation.y = -s.th * D; scene.add(sg); const sw = Math.min(s.w * 0.8, 15);
    B(sw + 0.4, 1.9, 0.2, toon('#0e0d0c'), 0, 5.7, -0.12, sg); signPlane(s.roof, sw, 1.5, { fg: s.trim, bg: '#0e0d0c' }, sg, 0, 5.7, 0.0); B(sw + 0.4, 0.08, 0.1, basic(s.trim), 0, 4.72, 0.0, sg); for (const e of [-1, 1]) C(0.03, 0.03, 0.6, postMat, e * sw / 2, 6.75, -0.1, sg, 4); }

  // ---------- kiosks (inner side, open to the promenade) ----------
  const KS = {};
  KS.pavs = (g, k) => { const cu = toon('#b8742a', { emissive: new THREE.Color('#4a2a08'), emissiveIntensity: 0.4 }); B(k.w - 1, 1.1, k.d - 1, toon('#3a2614'), 0, 0.55, 0, g, 0.03); B(k.w - 0.6, 0.12, k.d - 0.6, cu, 0, 1.16, 0, g); B(k.w - 1, 0.08, 0.05, basic('#ffb454'), 0, 0.12, k.d / 2 - 0.48, g);
    const steam = []; for (let i = 0; i < 3; i++) { const x = -2.5 + i * 2.5; C(0.5, 0.42, 0.7, toon('#5a5a5a'), x, 1.55, -0.6, g, 14); C(0.46, 0.46, 0.04, basic('#ffb454', 0.8), x, 1.92, -0.6, g, 14); for (let j = 0; j < (LOW ? 2 : 4); j++) steam.push({ s: glowSprite(x, 2, -0.6, 0xffffff, 0.6, 0.25, g), x, o: j / 4 }); }
    anims.push((dt, t) => steam.forEach(q => { const u = (t * 0.35 + q.o) % 1; q.s.position.set(q.x + Math.sin(t + q.o * 9) * 0.15, 2 + u * 2.2, -0.6); q.s.material.opacity = 0.28 * (1 - u); q.s.scale.setScalar(0.5 + u * 1.2); }));
    for (let i = 0; i < 4; i++) { const x = -3.6 + i * 2.4; C(0.3, 0.3, 0.1, toon('#c0281a'), x, 0.8, k.d / 2 + 0.7, g, 12); C(0.05, 0.05, 0.75, toon('#222'), x, 0.38, k.d / 2 + 0.7, g, 6); }
    for (const sx of [-1, 1]) C(0.08, 0.08, 3.4, toon('#3a2614'), sx * (k.w / 2 - 0.8), 1.7, -k.d / 2 + 0.6, g, 6); B(k.w - 1, 0.18, 0.18, toon('#3a2614'), 0, 3.4, -k.d / 2 + 0.6, g);
    for (let i = 0; i < 5; i++) { const r = M(new THREE.CapsuleGeometry(0.08, 0.5, 3, 6), toon('#d89a4a'), -1.6 + i * 0.8, 2.8, -k.d / 2 + 0.6, g, 0); r.rotation.z = 0.2 * (i % 2 ? 1 : -1); } return 3.6; };
  KS.news = (g, k) => { B(k.w, 3.0, k.d, toon('#16161c'), 0, 1.5, 0, g, 0.03); const nt = tex(canvas(1024, 128, (c, w, h) => { c.fillStyle = '#0a0a12'; c.fillRect(0, 0, w, h); c.font = `800 54px ${FONT}`; c.fillStyle = '#f3f2f2'; c.textBaseline = 'middle'; c.fillText('FREIGHTER IN LIGHT, OUT HEAVY  ·  GATE ACTIVITY UP  ·  MACHINE FLEET SIGHTED NEAR PYLON 3  ·  ', 10, h / 2); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 10); })); nt.wrapS = THREE.RepeatWrapping;
    for (let f = 0; f < 4; f++) { const a = f * Math.PI / 2, wf = f % 2 ? k.d : k.w; const p = new THREE.Mesh(new THREE.PlaneGeometry(wf - 0.4, 1.0), new THREE.MeshBasicMaterial({ map: nt, toneMapped: false })); p.position.set(Math.sin(a) * (f % 2 ? k.w : k.d) / 2 * 1.002, 2.2, Math.cos(a) * (f % 2 ? k.w : k.d) / 2 * 1.002); p.rotation.y = a; g.add(p); }
    anims.push(dt => { nt.offset.x += dt * 0.06; }); const sc = new THREE.Mesh(new THREE.PlaneGeometry(k.w - 2.4, 1.0), basic('#5f9fff', 0.85)); sc.position.set(0, 1.0, k.d / 2 + 0.01); g.add(sc); anims.push((dt, t) => { sc.material.opacity = 0.7 + 0.2 * Math.sin(t * 5.1) * Math.sin(t * 2.3); });
    C(0.08, 0.08, 4.2, toon('#333'), k.w / 2 - 0.4, 2.1, k.d / 2 - 0.4, g, 6); B(0.9, 0.4, 0.4, basic('#ec3013'), k.w / 2 - 0.4, 4.3, k.d / 2 - 0.4, g); const oa = glowSprite(k.w / 2 - 0.4, 4.3, k.d / 2 - 0.4, 0xff2010, 2, 0.8, g); anims.push((dt, t) => { oa.material.opacity = 0.5 + 0.3 * Math.sin(t * 2); });
    C(0.05, 0.08, 2.6, toon('#555'), -k.w / 2 + 0.6, 4.3, -k.d / 2 + 0.6, g, 6); const tip = glowSprite(-k.w / 2 + 0.6, 5.6, -k.d / 2 + 0.6, 0xff3a1a, 0.8, 0.8, g); anims.push((dt, t) => { tip.material.opacity = (t % 1.4) < 0.15 ? 1 : 0.15; }); return 3.0; };
  KS.vor = (g, k) => { const r = k.w / 2 - 0.7; C(r, r, 2.4, toon('#5a4020'), 0, 1.2, 0, g, 24); const aw = tex(canvas(512, 64, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#e8c45a' : '#b3121b'; c.fillRect(i * w / 16, 0, w / 16, h); } }));
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r + 1.2, 1.4, 24, 1, true), new THREE.MeshToonMaterial({ map: aw, side: THREE.DoubleSide })); cone.position.y = 3.3; g.add(cone); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; C(0.06, 0.06, 2.6, toon('#3a2a14'), Math.cos(a) * (r + 0.9), 1.3, Math.sin(a) * (r + 0.9), g, 6); }
    for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283; B(0.35, 0.4, 0.3, toon(pick(['#5fe3ff', '#ff8a6a', '#8fe38f', '#f2c94c', '#b98ad8'])), Math.cos(a) * (r + 0.1), 1.6 + (i % 3) * 0.45, Math.sin(a) * (r + 0.1), g); }
    const lan = []; for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + 0.4; lan.push(glowSprite(Math.cos(a) * (r + 1.0), 2.5, Math.sin(a) * (r + 1.0), 0xffc070, 1.2, 0.8, g)); } anims.push((dt, t) => lan.forEach((l, i) => { l.material.opacity = 0.65 + 0.2 * Math.sin(t * 3 + i); }));
    signPlane(['TODAY', 'PODS 30 · PILLS 25', 'HONEYROOT 4'], 1.8, 1.3, { fg: '#e8c45a', bg: '#1a120a', sub: '#f3f2f2' }, g, 0, 1.2, r + 0.02); return 4.0; };
  KS.spark = (g, k) => { B(k.w, 3.0, k.d, toon('#121012'), 0, 1.5, 0, g, 0.03); for (let i = 0; i < 5; i++) B(k.w - 0.6, 0.06, 0.04, basic('#ff3a1a'), 0, 0.5 + i * 0.55, k.d / 2 + 0.02, g);
    B(k.w - 2, 1.0, 1.0, basic('#ffd0c8', 0.18), 0, 1.4, k.d / 2 + 0.5, g); for (let i = 0; i < 4; i++) { const b = B(0.08, 0.9, 0.06, toon('#c8ccd2'), -1.5 + i, 1.4, k.d / 2 + 0.5, g); b.rotation.z = 0.5; }
    const tg = new THREE.Group(); tg.position.set(0, 4.1, 0); g.add(tg); for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.3 + i * 0.3, 0.04, 6, 32), basic('#ff3a1a', 0.8, true)); tg.add(t); } anims.push((dt, t) => { tg.rotation.y += dt * 1.2; tg.position.y = 4.1 + Math.sin(t * 1.5) * 0.1; }); return 3.0; };
  KS.curios = (g, k) => { B(k.w, 2.4, k.d, toon('#3a2414'), 0, 1.2, 0, g, 0.03); for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(0.14, 2.5, 0.14, toon('#c8a050'), sx * k.w / 2, 1.25, sz * k.d / 2, g);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 12, 0, 6.283, 0, Math.PI / 2), basic('#cfe8ff', 0.2)); dome.position.y = 2.4; g.add(dome); const orb = M(new THREE.SphereGeometry(0.35, 16, 12), toon('#ffd27a', { emissive: new THREE.Color('#ffb040'), emissiveIntensity: 1.2 }), 0, 2.9, 0, g, 0); const og = glowSprite(0, 2.9, 0, 0xffc060, 2.4, 0.6, g);
    anims.push((dt, t) => { orb.position.y = 2.9 + Math.sin(t * 1.4) * 0.08; og.material.opacity = 0.45 + 0.2 * Math.sin(t * 2); });
    const mp = tex(canvas(256, 192, (c, w, h) => { c.fillStyle = '#d8c49a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#6a4a2a'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(rnd() * w, rnd() * h, 6 + rnd() * 30, 0, 6.283); c.stroke(); } c.fillStyle = '#6a4a2a'; for (let i = 0; i < 40; i++) c.fillRect(rnd() * w, rnd() * h, 3, 3); }));
    for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), new THREE.MeshToonMaterial({ map: mp })); m.position.set(sx * (k.w / 2 + 0.01), 1.4, 0); m.rotation.y = sx * Math.PI / 2; g.add(m); } return 3.6; };
  const kioskG = {};
  for (const k of KIOSKS) { const g = new THREE.Group(), [x, z] = pol(R.kiosk, k.th); g.position.set(x, 0, z); g.rotation.y = Math.PI - k.th * D; scene.add(g); kioskG[k.key] = g;
    const top = (KS[k.style] || (() => 3))(g, k); const sw = Math.min(k.w - 0.4, 8.5);
    for (const f of [1, -1]) { const p = signPlane(k.roof, sw, 1.1, { fg: k.trim, bg: '#0e0d0c', bord: k.trim }, g, 0, top + 1.0, f * 0.06); if (f < 0) p.rotation.y = Math.PI; } B(sw + 0.2, 1.3, 0.1, toon('#0e0d0c'), 0, top + 1.0, 0, g); for (const e of [-1, 1]) C(0.05, 0.05, 1.0, postMat, e * sw / 2.4, top + 0.1, 0, g, 4);
    const ls = k.door.split(' · '); signPlane(ls, 2.2, 0.34 * ls.length + 0.26, { fg: k.trim, bg: '#0e0d0c', sub: '#f3f2f2', bord: k.trim }, g, k.w / 2 - 1.3, 1.7, k.d / 2 + 0.05); }

  // ---------- the hub: transport pad + the glass lift ----------
  const [px, pz] = pol(SPOTS.pad.r, SPOTS.pad.th), PAD = { x: px, z: pz, r: 2.3 };
  M(new THREE.CylinderGeometry(PAD.r, PAD.r + 0.12, 0.16, 48), toon('#101821'), px, 0.08, pz, null, 0);
  const padRings = [1, 0.76, 0.52, 0.28].map((k, i) => flat(new THREE.RingGeometry(PAD.r * k - 0.07, PAD.r * k, 64), basic('#7dd3fc', i ? 0.6 : 1), px, 0.17, pz));
  const padGlow = glowSprite(px, 0.5, pz, 0x7dd3fc, PAD.r * 4, 0.45); anims.push((dt, t) => { const p = 0.55 + Math.sin(t * 2.4) * 0.3; padRings.forEach((r, i) => { if (i) r.material.opacity = p * (1 - i * 0.22); }); padGlow.material.opacity = 0.3 + p * 0.3; });
  signPlane(['TRANSPORTER'], 3.2, 0.6, { fg: '#7dd3fc', bg: '#0b1218' }, null, px, 2.9, pz - PAD.r - 0.1).rotation.y = 0;
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(R.core, R.core, 90, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0x7fe3ff, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide })); tube.position.y = -1; scene.add(tube);
  for (let i = 0; i < 8; i++) { const [x, z] = pol(R.core + 0.05, i * 45 + 22.5); C(0.1, 0.1, 90, toon('#2a3038'), x, -1, z, null, 6); }
  const liftRings = []; for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(R.core + 0.06, 0.07, 6, 48), basic('#7fe3ff', 0.8, true)); t.rotation.x = Math.PI / 2; scene.add(t); liftRings.push(t); }
  anims.push((dt, t) => liftRings.forEach((r, i) => { r.position.y = -40 + ((t * 3 + i * 14) % 84); }));
  for (const [y, name] of [[-14, 'LIVING QUARTERS A'], [-28, 'LIVING QUARTERS B'], [R.yb + 0.02, 'BALCONY'], [0.02, 'MAIN RING'], [28, 'OPERATIONS']]) { const t = new THREE.Mesh(new THREE.TorusGeometry(R.core + 0.1, 0.16, 6, 48), basic('#bff4ff', 0.9)); t.rotation.x = Math.PI / 2; t.position.y = y; scene.add(t);
    if (y < 0 || y > 20) for (let f = 0; f < 4; f++) { const [x, z] = pol(R.core + 0.25, f * 90 + 45), p = signPlane(name, 4.2, 0.6, { fg: '#bff4ff', bg: '#0b1218' }, null, x, y + 0.7, z); p.rotation.y = -(f * 90 + 45) * D + Math.PI; } }
  // the lift doors (one set per stop, on the south face of the tube) + the car
  const doors = []; for (const y of [0, R.yb, 28]) { const g = new THREE.Group(), [x, z] = pol(R.core + 0.12, 180); g.position.set(x, y, z); g.rotation.y = -180 * D + Math.PI; scene.add(g);
    const L = B(1.4, 3.1, 0.12, toon('#3a4452'), -0.7, 1.55, 0, g), Rr = B(1.4, 3.1, 0.12, toon('#3a4452'), 0.7, 1.55, 0, g); B(3.2, 0.16, 0.2, basic('#7fe3ff'), 0, 3.2, 0.04, g); for (const sx of [-1, 1]) B(0.14, 3.2, 0.2, basic('#7fe3ff'), sx * 1.5, 1.6, 0.04, g);
    signPlane(['LIFT', 'OPS · BALCONY · QUARTERS'], 2.6, 0.9, { fg: '#7fe3ff', bg: '#0b1218', sub: '#f3f2f2', bord: '#7fe3ff' }, g, 2.9, 1.75, 0.06); doors.push({ y, L, R: Rr, open: 0, want: 0 }); }
  const car = new THREE.Group(); scene.add(car); C(R.core - 0.4, R.core - 0.4, 0.3, toon('#2a3038'), 0, -0.15, 0, car, 32); { const t = new THREE.Mesh(new THREE.TorusGeometry(R.core - 0.4, 0.06, 6, 48), basic('#7fe3ff')); t.rotation.x = Math.PI / 2; t.position.y = 0.02; car.add(t); const rr2 = new THREE.Mesh(new THREE.TorusGeometry(R.core - 0.5, 0.05, 6, 48), railMat); rr2.rotation.x = Math.PI / 2; rr2.position.y = 1.05; car.add(rr2); C(0.6, 0.6, 1.1, toon('#3a4452'), 0, 0.55, -2.6, car, 16); }
  // the upper hub ring + four skybridges out to the balcony (y = R.yb)
  { flat(new THREE.RingGeometry(R.core, R.upHub, 64, 1), toon('#4a4e56', { side: THREE.DoubleSide }), 0, R.yb, 0); ringRail(R.upHub - 0.2, R.yb, 6, th => BRIDGES.some(a => Math.abs(adiff(th, a)) < 11));
    for (const a of BRIDGES) { const r0 = R.upHub - 0.6, r1 = R.bal0 + 0.6, L = r1 - r0, [x, z] = pol((r0 + r1) / 2, a), g = new THREE.Group(); g.position.set(x, R.yb, z); g.rotation.y = -a * D; scene.add(g);
      B(4, 0.4, L, toon('#4a4e56'), 0, -0.2, 0, g); B(0.16, 0.02, L, basic('#ffb454', 0.9, true), 0, 0.01, 0, g); B(3.6, 0.05, L, basic('#ffb454', 0.5, true), 0, -0.43, 0, g);
      for (const s of [-1, 1]) { B(0.08, 0.08, L, railMat, s * 1.9, 1.05, 0, g); B(0.08, 0.08, L, railMat, s * 1.9, 0.55, 0, g); B(0.2, 0.5, L, toon('#2a2d33'), s * 1.9, -0.45, 0, g); }
      const P2 = []; for (let i = 0; i <= 20; i++) for (const s of [-1, 1]) P2.push(toWorld(g, s * 1.9, -L / 2 + i * L / 20)); inst(new THREE.CylinderGeometry(0.04, 0.04, 1.05, 6), postMat, P2.map(v => [v.x, R.yb + 0.52, v.z]));
      for (let i = 1; i < 5; i++) { const v = toWorld(g, 1.9, -L / 2 + i * L / 5); C(0.05, 0.07, 2.2, toon('#3b4250'), v.x, R.yb + 1.1, v.z, null, 6); glowSprite(v.x, R.yb + 2.25, v.z, 0xffc070, 1.6, 0.5); } } }
  // stairs up to the balcony
  for (const s of STAIRS) { const steps = 18, g = new THREE.Group(); g.position.set(s.a[0], 0, s.a[1]); g.rotation.y = Math.atan2(s.ux, s.uz); scene.add(g);
    for (let i = 0; i < steps; i++) { const u = (i + 0.5) * s.L / steps, y = R.yb * (i + 1) / steps; B(3.2, 0.22, s.L / steps + 0.02, toon('#5c4e3e'), 0, y - 0.11, u, g); B(3.2, 0.03, 0.06, basic('#ffb454', 0.8, true), 0, y + 0.01, u + s.L / steps / 2 - 0.05, g); }
    const stringer = new THREE.Mesh(BOX(0.3, 0.4, s.L * 1.07), toon('#2a2622')); for (const sx of [-1.65, 1.65]) { const m = stringer.clone(); m.position.set(sx, R.yb / 2, s.L / 2); m.rotation.x = -Math.atan2(R.yb, s.L); g.add(m); const rl = new THREE.Mesh(BOX(0.07, 0.07, s.L * 1.07), railMat); rl.position.set(sx, R.yb / 2 + 1.0, s.L / 2); rl.rotation.x = m.rotation.x; g.add(rl); }
    const [lx, lz] = pol(90.2, s.th1 + 1.0); const land = new THREE.Mesh(BOX(5.2, 0.4, 6.5), toon('#5c4e3e')); land.position.set(lx, R.yb - 0.2, lz); land.rotation.y = -(s.th1 + 1) * D; scene.add(land);
    signPlane(['STAIRS', 'UP TO THE BALCONY'], 2.6, 0.8, { fg: '#ffb454', bg: '#0e0d0c', sub: '#f3f2f2', bord: '#ffb454' }, g, -1.9, 1.7, 0.4).rotation.y = Math.PI / 2 * 0; }
  // balcony spots: the LOOKOUT, THE EMBED screens, the shrine alcove (KNEEL)
  { const sp = (o) => { const [x, z] = pol(o.r, o.th), g = new THREE.Group(); g.position.set(x, o.y, z); g.rotation.y = -o.th * D; scene.add(g); return g; };
    const lk = sp(SPOTS.lookout); B(5.0, 0.45, 1.0, toon('#5a4a38'), -3, 0.45, 2.4, lk); B(5.0, 0.45, 1.0, toon('#5a4a38'), 3, 0.45, 2.4, lk); C(0.08, 0.12, 1.3, toon('#c8a050'), 0, 0.65, 3.6, lk, 8); const sc = C(0.14, 0.2, 1.2, toon('#c8a050'), 0, 1.4, 3.3, lk, 10); sc.rotation.x = 1.1; signPlane(['LOOKOUT', 'MERU · PYLONS · THE GATE'], 3.2, 0.9, { fg: '#ffd9a0', bg: '#0e0d0c', sub: '#f3f2f2' }, lk, 0, 2.2, 4.6).rotation.y = Math.PI;
    const em = sp(SPOTS.embed); for (let i = 0; i < 8; i++) { const x = -7 + i * 2; B(1.6, 2.2, 1.0, toon('#1a1a22'), x, 1.1, 4.4, em, 0.02); const s = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), basic(['#ec3013', '#5fe3ff', '#8fe38f', '#f2c94c', '#b98ad8', '#ff8a6a', '#7fb8de', '#ffb454'][i], 0.9)); s.position.set(x, 1.6, 3.88); s.rotation.y = Math.PI; em.add(s); anims.push((dt, t) => { s.material.opacity = 0.65 + 0.3 * Math.abs(Math.sin(t * 1.7 + i)); }); }
    signPlane(['THE EMBED', '8 GAMES · OPEN AFTER THE MAP'], 6, 1.1, { fg: '#ffb454', bg: '#0e0d0c', sub: '#f3f2f2' }, em, 0, 3.2, 3.9).rotation.y = Math.PI;
    const kn = sp(SPOTS.kneel); B(1.4, 0.18, 0.9, toon('#7a2a2a'), 0, 0.09, 1.8, kn); const kf = []; for (let i = 0; i < 9; i++) { const x = -2 + i * 0.5; C(0.06, 0.06, 0.3, toon('#f8f0e0'), x, 1.05, 4.2, kn, 6); kf.push(glowSprite(x, 1.3, 4.2, 0xffb030, 0.36, 0.9, kn)); } B(5, 1.0, 0.5, toon('#3a2a18'), 0, 0.5, 4.3, kn); anims.push((dt, t) => kf.forEach((f, i) => { f.material.opacity = 0.7 + 0.3 * Math.sin(t * 8 + i * 1.9); }));
    signPlane(['SHRINE ALCOVE', 'KNEEL HERE'], 3, 0.8, { fg: '#f2d98b', bg: '#0e0d0c', sub: '#f3f2f2' }, kn, 0, 2.3, 4.5).rotation.y = Math.PI; }

  // ---------- outside: docking ring, bridges, the three pylons, the hull ----------
  const hullM = toon('#7a7f88'), hullD = toon('#4a4f58');
  { const dr = new THREE.Mesh(new THREE.TorusGeometry(150, 4.5, 12, 160), hullM); dr.rotation.x = Math.PI / 2; scene.add(dr); const dl = new THREE.Mesh(new THREE.TorusGeometry(150, 0.4, 6, 200), basic('#ffd9a0', 0.9)); dl.rotation.x = Math.PI / 2; dl.position.y = 2.2; scene.add(dl);
    for (const b of BAYS) { const [x, z] = pol(127, b), br = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 46, 16), hullD); br.position.set(x, 3, z); br.rotation.set(Math.PI / 2, 0, 0); const gq = new THREE.Group(); gq.position.set(x, 3, z); gq.rotation.y = -b * D; gq.add(br); br.position.set(0, 0, 0); scene.add(gq); }
    const tips = []; for (const b of BAYS) for (const s of [1, -1]) { const pts = [[150, 3], [168, 10], [186, 30], [192, 52], [184, 72], [174, 80]].map(([r, y]) => { const [x, z] = pol(r, b); return new THREE.Vector3(x, s * y, z); }); const tg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 3.2, 10, false); const m = new THREE.Mesh(tg, hullM); scene.add(m); const tp = pts[pts.length - 1]; tips.push(glowSprite(tp.x, tp.y, tp.z, 0xff3a1a, 9, 0.9)); for (const q of pts.slice(1, 5)) glowSprite(q.x, q.y, q.z, 0xffd9a0, 3, 0.5); }
    anims.push((dt, t) => tips.forEach((s, i) => { s.material.opacity = ((t + i * 0.3) % 2) < 0.25 ? 1 : 0.15; }));
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(R.wall + 4, 26, 60, 64, 1, true), toon('#5a5f68', { side: THREE.DoubleSide })); cone.position.y = -30.5; scene.add(cone);
    const lw = []; for (const y of [-8, -18, -30]) for (let th = 0; th < 360; th += 3) { const r = lerp(R.wall + 4, 26, (-y) / 60) + 0.3, [x, z] = pol(r, th); lw.push([x, y, z, -th * D]); } inst(BOX(1.2, 0.5, 0.1), basic('#ffd9a0', 0.8), lw);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(30, R.bal1 + 1, 13, 64, 1, true), toon('#5a5f68', { side: THREE.DoubleSide })); top.position.y = R.yc + 6.5; scene.add(top); }
  return { anims, obs, PAD, doors, car, shopG, kioskG, signPlane, signTex, tex, canvas };
}

// SPACE (rotates slowly: the station turns): Meru below, the sun, nebula, stars, the gate.
export function buildSpace(K) {
  const { THREE, scene, glowTexture, rnd, rr, pick, LOW } = K;
  const SP = new THREE.Group(); scene.add(SP);
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const mk = (w, h, f) => tex(canvas(w, h, f));
  const meru = mk(2048, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1d4a7a'); gr.addColorStop(0.5, '#2c6ea8'); gr.addColorStop(1, '#1d4a7a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 16; k++) { const cx = rnd() * w, cy = rr(160, 860), sp = rr(80, 240); for (let i = 0; i < 70; i++) { const a = rnd() * 6.283, d = Math.pow(rnd(), 0.8) * sp; g.fillStyle = pick(['#3f7d3a', '#4f8f3e', '#6a9a4a', '#8a7a4a', '#a8935a', '#2f6a32']); g.globalAlpha = 0.85; g.beginPath(); g.ellipse((cx + Math.cos(a) * d * 1.6 + w) % w, cy + Math.sin(a) * d * 0.7, rr(14, 60), rr(10, 36), rnd() * 3, 0, 7); g.fill(); } }
    g.globalAlpha = 1; for (const [y0, y1] of [[0, 70], [h - 70, h]]) { const gg = g.createLinearGradient(0, y0, 0, y1); gg.addColorStop(y0 ? 0 : 1, 'rgba(240,248,255,0)'); gg.addColorStop(y0 ? 1 : 0, 'rgba(240,248,255,0.95)'); g.fillStyle = gg; g.fillRect(0, y0, w, y1 - y0); } });
  const clouds = mk(2048, 1024, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 520; i++) { g.fillStyle = `rgba(255,255,255,${rr(0.12, 0.45).toFixed(2)})`; g.beginPath(); g.ellipse(rnd() * w, rr(40, h - 40), rr(30, 160), rr(6, 26), rr(-0.2, 0.2), 0, 7); g.fill(); } });
  const sunDir = { value: new THREE.Vector3(0.5, 0.35, -0.8).normalize() };
  const planetMat = (map, alpha) => new THREE.ShaderMaterial({ transparent: !!alpha, depthWrite: !alpha, uniforms: { map: { value: map }, sunDir },
    vertexShader: 'varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `uniform sampler2D map; uniform vec3 sunDir; varying vec2 vUv; varying vec3 vN; void main(){ vec4 c = texture2D(map, vUv); float l = max(dot(normalize(vN), sunDir), 0.0); float k = 0.07 + 1.1 * smoothstep(-0.05, 0.6, l);
      ${alpha ? 'gl_FragColor = vec4(c.rgb * k, c.a * (0.2 + 0.8 * smoothstep(-0.1, 0.4, l)));' : 'gl_FragColor = vec4(c.rgb * k, 1.0);'}
      #include <colorspace_fragment>
    }` });
  const PR = 800, PC = new THREE.Vector3(1150, -720, 0);
  const planet = new THREE.Mesh(new THREE.SphereGeometry(PR, LOW ? 64 : 112, LOW ? 40 : 72), planetMat(meru)); planet.position.copy(PC); SP.add(planet);
  const cl = new THREE.Mesh(new THREE.SphereGeometry(PR * 1.012, LOW ? 48 : 96, LOW ? 32 : 60), planetMat(clouds, true)); cl.position.copy(PC); SP.add(cl);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(PR * 1.05, 80, 48), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vP = mv.xyz; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vP; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(-vP))); float a = pow(f, 4.0) * 1.2; gl_FragColor = vec4(0.45,0.78,1.0, a); }' })); atmo.position.copy(PC); SP.add(atmo);
  const glowT = glowTexture(), spr = (col, size, op, pos) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: col, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op })); s.scale.setScalar(size); s.position.copy(pos); SP.add(s); return s; };
  const sunLocal = new THREE.Vector3(0.5, 0.35, -0.8).normalize(); spr(0xfff2d8, 260, 1, sunLocal.clone().multiplyScalar(1900)); spr(0xffd9a0, 700, 0.35, sunLocal.clone().multiplyScalar(1900));
  const neb = mk(512, 512, (g, w) => { for (let i = 0; i < 60; i++) { const x = w / 2 + rr(-150, 150), y = w / 2 + rr(-150, 150), r = rr(40, 160), gr = g.createRadialGradient(x, y, 0, x, y, r); const c = pick(['120,60,170', '70,40,140', '40,120,160', '170,60,120']); gr.addColorStop(0, `rgba(${c},0.18)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(0, 0, w, w); } });
  for (const [d, s] of [[new THREE.Vector3(-0.7, 0.45, 0.55), 1500], [new THREE.Vector3(-0.2, 0.7, -0.68), 1100], [new THREE.Vector3(0.1, 0.15, 0.98), 900]]) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: neb, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 })); m.scale.setScalar(s); m.position.copy(d.normalize().multiplyScalar(1950)); SP.add(m); }
  const stars = (() => { const n = LOW ? 1200 : 2600, p = [], c = []; for (let i = 0; i < n; i++) { const u = rnd() * 6.283, v = Math.acos(rr(-1, 1)), r = 2100; p.push(Math.sin(v) * Math.cos(u) * r, Math.cos(v) * r, Math.sin(v) * Math.sin(u) * r); const k = rr(0.6, 1); c.push(k, k * rr(0.85, 1), k * rr(0.8, 1)); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ size: 1.7, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, fog: false })); })(); SP.add(stars);
  // THE GATE: a swirl that opens now and then
  const sw = mk(512, 512, (g, w) => { const c = w / 2; for (let i = 0; i < 900; i++) { const t = i / 900, a = t * 26, r = t * c * 0.95; g.fillStyle = `rgba(${180 + 75 * (1 - t) | 0},${210 + 45 * (1 - t) | 0},255,${(0.5 * (1 - t) + 0.05).toFixed(2)})`; g.beginPath(); g.arc(c + Math.cos(a) * r, c + Math.sin(a) * r, 3 + 18 * (1 - t), 0, 6.283); g.fill(); } });
  const gatePos = new THREE.Vector3(-0.75, 0.2, -0.62).normalize().multiplyScalar(1500);
  const gate = new THREE.Sprite(new THREE.SpriteMaterial({ map: sw, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); gate.position.copy(gatePos); gate.scale.setScalar(1); SP.add(gate);
  const gateBloom = spr(0xbfe0ff, 1, 0, gatePos);
  const G = { t: 0, open: 0, next: 40, state: 'shut' };
  function openGate() { if (G.state === 'shut') { G.state = 'opening'; G.t = 0; } }
  function tick(dt, t, camPos) {
    SP.rotation.y += dt * 0.012; stars.position.copy(camPos).sub(SP.position); // stars stay at infinity
    sunDir.value.copy(sunLocal).applyQuaternion(SP.quaternion); cl.rotation.y += dt * 0.004; planet.rotation.y += dt * 0.0015;
    G.next -= dt; if (G.state === 'shut' && G.next <= 0) openGate();
    if (G.state !== 'shut') { G.t += dt; const T = 11, u = G.t / T; const k = u < 0.18 ? smooth(0, 0.18, u) : u > 0.8 ? 1 - smooth(0.8, 1, u) : 1; gate.scale.setScalar(20 + k * 520); gate.material.opacity = k * 0.95; gate.material.rotation = -G.t * 0.6; gateBloom.scale.setScalar(60 + k * 900); gateBloom.material.opacity = k * 0.35 + (u < 0.2 ? Math.sin(u / 0.2 * Math.PI) * 0.5 : 0);
      if (u >= 1) { G.state = 'shut'; G.next = 70 + Math.random() * 40; gate.material.opacity = 0; gateBloom.material.opacity = 0; } }
  }
  function smooth(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  return { SP, tick, openGate, gateState: () => G.state, sunDir };
}

// TRAFFIC: ships come in to the pylons and leave again (station frame).
export function buildTraffic(K) {
  const { THREE, scene, toon, glowSprite, rr, LOW } = K;
  const ships = [], cols = ['#c8ccd2', '#b88a4a', '#8a9aaa'];
  const mkShip = (i) => { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CapsuleGeometry(3.2, 18, 6, 12), toon(cols[i % 3])); h.rotation.x = Math.PI / 2; g.add(h); for (const s of [-1, 1]) { const n = new THREE.Mesh(new THREE.CapsuleGeometry(1.2, 9, 4, 8), toon('#5a5f68')); n.rotation.x = Math.PI / 2; n.position.set(s * 5.5, 1, 3); g.add(n); const p = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 3), toon('#5a5f68')); p.position.set(s * 3, 0.6, 3); g.add(p); }
    const eg = glowSprite(0, 0, 12, 0x7fd8ff, 7, 0.9, g); const bl = glowSprite(0, 3.4, -6, 0xff3a1a, 2.4, 0.9, g); g.scale.setScalar(i === 0 ? 1.6 : 1); scene.add(g); return { g, eg, bl }; };
  const docks = [[67.5, 1], [202.5, -1], [315, 1]].map(([b, s]) => { const D2 = Math.PI / 180; return new THREE.Vector3(Math.sin(b * D2) * 214, s * 46, -Math.cos(b * D2) * 214); });
  for (let i = 0; i < (LOW ? 2 : 3); i++) { const s = mkShip(i); s.dock = docks[i]; s.ph = 'wait'; s.t = i * 18; s.from = new THREE.Vector3(); s.to = new THREE.Vector3(); ships.push(s); s.g.visible = false; }
  const far = (d, k) => d.clone().setY(0).normalize().multiplyScalar(1100).add(new THREE.Vector3(rr(-300, 300), d.y * k + rr(-120, 160), rr(-300, 300)));
  const tmp = new THREE.Vector3();
  function tick(dt, t) {
    for (const s of ships) { s.t -= dt;
      if (s.ph === 'wait' && s.t <= 0) { s.ph = 'in'; s.T = 22; s.u = 0; s.from.copy(far(s.dock, 3)); s.to.copy(s.dock); s.g.visible = true; }
      else if (s.ph === 'in' || s.ph === 'out') { s.u += dt / s.T; const k = s.ph === 'in' ? 1 - Math.pow(1 - Math.min(1, s.u), 3) : Math.pow(Math.min(1, s.u), 2.2); s.g.position.lerpVectors(s.from, s.to, k); tmp.copy(s.to).sub(s.from); s.g.lookAt(tmp.add(s.g.position)); s.g.rotateY(Math.PI); s.eg.material.opacity = s.ph === 'in' ? 0.9 * (1 - k) + 0.2 : 0.4 + 0.5 * k;
        if (s.u >= 1) { if (s.ph === 'in') { s.ph = 'docked'; s.t = rr(25, 45); } else { s.ph = 'wait'; s.t = rr(12, 30); s.g.visible = false; } } }
      else if (s.ph === 'docked' && s.t <= 0) { s.ph = 'out'; s.T = 18; s.u = 0; s.from.copy(s.g.position); s.to.copy(far(s.dock, -2)); }
      s.bl.material.opacity = (t * 1.3 + ships.indexOf(s)) % 1.5 < 0.2 ? 1 : 0.1; }
  }
  return { tick };
}
