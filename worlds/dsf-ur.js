// UR STATION [dsfOutUr] (s492): Ur's own station, inside the two terraced rings. Built far away at (OX, 0, 0), only shown while
// you are aboard (Deep Space Fox.dc.html?at=ur, from the Space Map dock). A canyon cut through terracotta rock: THE CUT down the
// middle (striped canyon walls with carved ledges + cave windows, a clean blue stream with reeds and three brass footbridges,
// floating rocks, a long sky slot onto the stars, the U crest), and arched cave-mouth doors off it: TABLET HALL (NW, the archive),
// OPERATIONS · THE WATCHTOWER (N), SECURITY · THE REED CAGE (NE: a Fleet unit that carried the barrels back), THE WATER WORKS (SW,
// engineering: cistern + filter beds), BERTH FOUR (S, arrival + airlock) and THE KILN CAFE (SE). UR glows orange below.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const CLAY = '#c8643a', CLAY2 = '#9a4626', SANDS = '#e0a86a', BRASS = '#d9a441', REED = '#6f8f3a', WATER = '#3a9ad8', RUST = '#8a4a2a';
export const UR = { OX: 28000, hw: 30, hd: 22, h: 10, door: { x: 999, z: 999 }, enter: { x: 0, z: 15 } };
export const UR_ROOMS = [
  { k: 'cut', x0: -26, x1: 26, z0: -5, z1: 5, h: 9.2, name: 'THE CUT' },
  { k: 'tablet', x0: -24, x1: -10, z0: -19, z1: -5, h: 5.6, name: 'TABLET HALL', sub: 'THE ARCHIVE \u00b7 NABU' },
  { k: 'ops', x0: -7, x1: 7, z0: -19, z1: -5, h: 6.4, name: 'OPERATIONS', sub: 'THE WATCHTOWER \u00b7 WARDEN ENHEDU' },
  { k: 'sec', x0: 10, x1: 24, z0: -19, z1: -5, h: 5.6, name: 'SECURITY', sub: 'THE REED CAGE \u00b7 CONSTABLE MASHU' },
  { k: 'water', x0: -24, x1: -10, z0: 5, z1: 19, h: 5.6, name: 'THE WATER WORKS', sub: 'ENGINEERING \u00b7 ENGINEER ABI' },
  { k: 'berth', x0: -6, x1: 6, z0: 5, z1: 19, h: 5.6, name: 'BERTH FOUR', sub: 'CANYON DOCK \u00b7 DOCKMASTER ZAMI' },
  { k: 'cafe', x0: 10, x1: 24, z0: 5, z1: 19, h: 5.6, name: 'THE KILN CAFE', sub: 'COFFEE \u00b7 IDDA' }];
const DXS = [-17, 0, 17], DOORS = DXS.flatMap(x => [[x - 1.5, x + 1.5, -5.6, -4.4], [x - 1.5, x + 1.5, 4.4, 5.6]]);
const L1 = t => [{ who: 'npc', text: t }];
const T = (label, ...r) => ({ label, replies: r.map(text => ({ who: 'npc', text })) });
const F = (a, b, tip = '#fff7ed', paw) => ({ fur: { tailA: a, tailB: b, tailTip: tip, paw: paw || b }, faceCols: { furA: a, furB: b } });
// the people aboard (every box 20 words or less; names DRAFT for Ben)
export const UR_NPCS = [
  { key: 'urEnhedu', at: [-2.6, -13.6], look: [0, -12], outfit: 'robe', g: { name: 'WARDEN ENHEDU', title: 'Ur Station, The Watchtower', torso: ['#8a3a1e', '#5a2412', '#2a1008'], ...F('#d9743a', '#8a3a14'), greeting: 'The Watchtower sees every canyon pass. Mind the ledge, pilot.',
    lines: [{ who: 'player', text: 'Warden.' }, { who: 'npc', text: 'Ur Station. Clay walls, brass bridges, and a stream we keep clean. Very clean.' }],
    topics: [T('Why so clean?', 'Down on Ur, somebody poisoned a lake for four years. Up here, every drop goes through the Water Works.'),
      T('Any trouble out there?', 'Fleet haulers fly the canyon lanes with no names on them. One came aboard with barrels. Mashu has it.')] } },
  { key: 'urTira', at: [4.6, -17.4], look: [4.6, -19], outfit: 'suit', g: { name: 'ENSIGN TIRA', title: 'Ur Station, Lane Watch', torso: ['#3a3f4a', '#262a32', '#141619'], ...F('#e8843a', '#a24a16'),
    lines: L1('Floating rocks drift into lane two every shift. I chart them, they drift anyway. Rocks never listen.'),
    topics: [T('Where do the rocks come from?', 'Old Ur, they say. Pieces of the canyon that fell up when the gates opened.')] } },
  { key: 'urNabu', at: [-17, -14.4], look: [-17, -12], outfit: 'robe', g: { name: 'ARCHIVIST NABU', title: 'Tablet Hall, The Archive', torso: ['#e0c08a', '#b8945a', '#5a4220'], ...F('#d9a06a', '#8a5a2a'),
    lines: L1('Every tablet here is a promise somebody made. Read one. Mind the dust, it is older than you.'),
    topics: [T('What do the tablets say?', 'Trade, mostly. Water rights. And one about eight gates, and a fox who opened all of them.')] } },
  { key: 'urMashu', at: [21.6, -16.4], look: [17, -12], outfit: 'armor', g: { name: 'CONSTABLE MASHU', title: 'Security, The Reed Cage', torso: ['#5a3a2a', '#3a2418', '#1a100a'], ...F('#c8642a', '#7a3412'),
    lines: L1('Name, ship, cargo. Barrels get opened. Barrels always get opened, after what happened down there.'),
    topics: [T('Who is in the cage?', 'A Fleet unit. It was ordered to dump barrels in our stream. It carried them back up instead.', 'Then something in it started shouting. Not at us. At itself.')] } },
  { key: 'urAbi', at: [-13.2, 9.4], look: [-17, 12], outfit: 'vest', g: { name: 'ENGINEER ABI', title: 'The Water Works', torso: ['#2a5a7a', '#1a3a52', '#0a1a26'], ...F('#e0904a', '#9a4a1a'),
    lines: L1('Cistern, filter beds, reeds. The reeds do half my job. I just keep the pipes from arguing.'),
    topics: [T('How does it work?', 'Water runs through sand, then charcoal, then the reed beds. Comes out clean enough to drink.')] } },
  { key: 'urZami', at: [3.6, 10.6], look: [0, 12], outfit: 'coat', g: { name: 'DOCKMASTER ZAMI', title: 'Berth Four, Canyon Dock', torso: ['#6a4a22', '#4a3216', '#24180a'], ...F('#d9743a', '#8a3a14'),
    lines: L1('Your ship is clamped. Dust off your boots before the Cut. The stream is not a bath.') } },
  { key: 'urIdda', at: [17, 15.2], look: [17, 12], outfit: 'dress', g: { name: 'IDDA', title: 'The Kiln Cafe', torso: ['#7a2a1e', '#4a1a12', '#220a08'], ...F('#e0904a', '#9a4a1a'),
    lines: L1('Coffee roasted in the kiln, served in a clay cup. Keep the cup. Everyone does. I make more.') } },
  { key: 'urSin', at: [-8.4, 2.6], look: [-6, 0], outfit: 'vest', g: { name: 'OLD SIN-LEQI', title: 'Reed cutter', torso: ['#4a5a2a', '#2e3a1a', '#161c0c'], ...F('#c89a6a', '#8a6a3a'),
    lines: L1('I cut the reeds, they grow back. Twelve years. The stream has never once been green. Not up here.') } }];
// s492 the station console games, Ur versions (engines: dsf-docking / dsf-cargo-scan / dsf-conduit, opts.theme)
export const UR_GAMES = {
  dock: { at: { x: 0, z: -12.4 }, y: 1.5, theme: { title: 'DOCKING CONTROL', where: 'The Watchtower \u00b7 WARDEN ENHEDU', kicker: 'Ur Station \u00b7 Warden Enhedu', cardTitle: 'Docking Control',
    body: 'Drag each ship to the berth in its colour. A field of floating rocks drifts across the plot: route every ship round it.', holo: '#ffb070', holoRgb: '255,176,112', bg: 'rgba(22,10,6,0.88)',
    tags: { shuttle: 'SKIFF', freighter: 'BARGE', tug: 'REED BOAT' }, watchNames: ['Dawn lanes', 'Brass run', 'Tablet courier', 'Rockfall watch'], stat: 'urDock', pw: 5.2, maxD: 3.5, maxY: 5.6, standZ: 3.6,
    storm: { r: 13, speed: 5 }, hazardWord: 'ROCKED', hazardNote: ' flew into the floating rocks.' } },
  scan: { at: { x: 17, z: -12 }, y: 1.0, theme: { title: 'CARGO SCAN', where: 'The Reed Cage \u00b7 CONSTABLE MASHU', kicker: 'The Reed Cage \u00b7 Constable Mashu', cardTitle: 'Cargo Scan',
    body: 'Tap any crate with a shape not on the manifest, before the red line. Crates with the red FLEET mark: hold those too. Never destroy them.',
    names: { drum: 'BARREL', sack: 'REED BUNDLE', tin: 'BRASS TOKENS', ring: 'COLLAR', plate: 'CLAY TABLET', bulb: 'OIL LAMP', crystal: 'CRYSTAL', rod: 'SPEAR' }, dockNames: ['Berth Four', 'Canyon barge 3', 'Brass courier', 'Lab supply run'],
    fleet: 0.16, stat: 'urScan', scan: '#ffb070', scanRgb: '255,176,112', idleTitle: 'CARGO SCAN \u00b7 THE REED CAGE' } },
  cond: { at: { x: -17, z: 12, hw: 2.32, hd: 1.66 }, theme: { title: 'WATER WORKS', where: 'The Water Works \u00b7 ENGINEER ABI', kicker: 'The Water Works \u00b7 Engineer Abi', cardTitle: 'Water Works', deck: 'WATER WORKS', deckSub: 'FILTER LINES \u00b7 KEEP CLEAR', amber: '#5fb8ff',
    body: 'Tap a pipe to turn it. Join each line from its inlet on the left to its outlet on the right. The tanks fill while you work: finish before they spill.',
    lines: [{ key: 'clean', name: 'CLEAN WATER', dim: '#1e4a6a', ink: '#5fb8ff', spark: '#e0f4ff' }, { key: 'runoff', name: 'TO FILTER', dim: '#3a4a1a', ink: '#8fe34a', spark: '#eaffc0' }, { key: 'kiln', name: 'KILN HEAT', dim: '#6b3a1c', ink: '#ff8a2a', spark: '#ffe2a0' }],
    sysNames: ['Stream feed', 'Reed beds', 'Kiln Cafe boiler', 'Berth Four wash'], stat: 'urCond', heat: [2.0, 2.8, 3.4, 4.0] } } };

export function buildUrSt(K) {
  const { THREE, scene, glowSprite, rnd, rr, LOW } = K;
  const g = new THREE.Group(); g.position.set(UR.OX, 0, 0); g.visible = false; scene.add(g);
  const anims = [], blocks = [], circles = [], spots = [], hooks = {}; let holoRef = [], waterBoost = 0;
  const tex = (c, rx, ry) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); } return t; };
  const toon = (c, x) => K.toon(c, x), basic = (c, o, a) => K.basic(c, o, a);
  const Q = (geo, mat, x, y, z, p = g, cast = false) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast && !LOW; m.receiveShadow = true; p.add(m); return m; };
  const B = (w, h, d, mat, x, y, z, p, cast) => Q(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p, cast);
  const CY = (r1, r2, h, mat, x, y, z, seg = 16, p, cast) => Q(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, cast);
  const glow = (x, y, z, c, s, o = 0.6, p = g) => glowSprite(x, y, z, c, s, o, p);
  const plane = (w, h, mat, x, y, z, ry = 0, rx = 0, p = g) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; p.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry, p = g, bg = '#1e120c') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, Hh) => { c.fillStyle = bg; c.fillRect(0, 0, W, Hh); c.strokeStyle = fg; c.lineWidth = 12; c.strokeRect(6, 6, W - 12, Hh - 12); const n = lines.length, lh = Hh * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.66 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, Hh * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry, 0, p); };
  const clay = toon(CLAY), clay2 = toon(CLAY2), sands = toon(SANDS), brass = toon(BRASS), reed = toon(REED), rust = toon(RUST), dark = toon('#2a1a12');
  const glass = basic('#ffe0c0', 0.1);
  const brick = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#b8562e'; c.fillRect(0, 0, w, w); for (let y = 0; y < 8; y++) for (let x = 0; x < 5; x++) { c.fillStyle = ['#c8643a', '#b05028', '#d0703e', '#a84a24'][(x + y * 3) % 4]; c.fillRect(x * 52 + (y % 2) * 26 - 26, y * 32 + 2, 48, 28); } }), 3, 2);
  const tiles = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#d8945a'; c.fillRect(0, 0, w, w); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#c8804a' : '#e0a06a'; c.fillRect(x * 64 + 2, y * 64 + 2, 60, 60); } c.strokeStyle = 'rgba(90,40,20,0.5)'; c.lineWidth = 3; c.strokeRect(0, 0, w, w); }), 8, 8);
  const strata = tex(canvas(256, 512, (c, w, h) => { let y = 0; const cols = ['#c8643a', '#d9824a', '#b05028', '#e0a86a', '#9a4626', '#c87444']; let i = 0; while (y < h) { const bh = 18 + rnd() * 46; c.fillStyle = cols[i++ % cols.length]; c.fillRect(0, y, w, bh); c.fillStyle = 'rgba(0,0,0,0.12)'; for (let k = 0; k < 10; k++) c.fillRect(rnd() * w, y + rnd() * bh, 20 + rnd() * 40, 2); y += bh; } }), 6, 1);
  const floorM = toon('#ffffff', { map: tiles }), brickM = toon('#ffffff', { map: brick }), rockM = toon('#ffffff', { map: strata });

  // ---------- outside: stars, UR (terracotta, a blue lake + a green one) below to the north ----------
  { const st = tex(canvas(2048, 1024, (c, w, h) => { c.fillStyle = '#06040a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(255,${210 + (rnd() * 45 | 0)},${180 + (rnd() * 75 | 0)},${(0.25 + rnd() * 0.75).toFixed(2)})`; const s = rnd() < 0.06 ? 2.6 : 1.3; c.fillRect(rnd() * w, rnd() * h * 0.62, s, s); }
      const ng = c.createRadialGradient(w * 0.6, h * 0.25, 10, w * 0.6, h * 0.25, 420); ng.addColorStop(0, 'rgba(255,140,80,0.18)'); ng.addColorStop(1, 'rgba(255,140,80,0)'); c.fillStyle = ng; c.fillRect(0, 0, w, h); }));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.MeshBasicMaterial({ map: st, side: THREE.BackSide, toneMapped: false, depthWrite: false })));
    const pl = tex(canvas(1024, 512, (c, w, h) => { c.fillStyle = '#c8643a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = ['rgba(154,70,38,0.5)', 'rgba(224,168,106,0.45)', 'rgba(110,50,24,0.4)'][i % 3]; c.beginPath(); c.ellipse(rnd() * w, rnd() * h, 20 + rnd() * 60, 6 + rnd() * 16, rnd() * 3, 0, 7); c.fill(); }
      c.strokeStyle = 'rgba(70,30,14,0.55)'; c.lineWidth = 5; for (let k = 0; k < 7; k++) { c.beginPath(); let x = rnd() * w, y = rnd() * h; c.moveTo(x, y); for (let s = 0; s < 9; s++) { x += rr(10, 50); y += rr(-30, 30); c.lineTo(x, y); } c.stroke(); }
      c.fillStyle = '#3a9ad8'; c.beginPath(); c.ellipse(w * 0.42, h * 0.5, 40, 22, 0.3, 0, 7); c.fill(); c.fillStyle = '#7ac83a'; c.beginPath(); c.ellipse(w * 0.6, h * 0.58, 30, 16, -0.4, 0, 7); c.fill(); }));
    const planet = new THREE.Mesh(new THREE.SphereGeometry(520, 48, 32), new THREE.MeshBasicMaterial({ map: pl, toneMapped: false })); planet.position.set(0, -330, -760); g.add(planet); anims.push(dt => { planet.rotation.y += dt * 0.004; });
    const haze = new THREE.Mesh(new THREE.SphereGeometry(540, 48, 32), new THREE.MeshBasicMaterial({ color: '#ffb070', transparent: true, opacity: 0.16, side: THREE.BackSide, toneMapped: false, depthWrite: false })); haze.position.copy(planet.position); g.add(haze);
    const rocks = []; for (let i = 0; i < 14; i++) { const r = Q(new THREE.DodecahedronGeometry(rr(3, 9), 0), toon(i % 2 ? '#9a4626' : '#c8643a'), rr(-120, 120), rr(-30, 40), rr(-120, 120)); if (Math.abs(r.position.x) < 40 && Math.abs(r.position.z) < 30) r.position.x += 80; rocks.push([r, rnd() * 6]); }
    anims.push((dt, t) => rocks.forEach(([r, p]) => { r.rotation.y += dt * 0.05; r.position.y += Math.sin(t * 0.3 + p) * dt * 0.3; })); }

  // ---------- generic room ----------
  function room(R, fm, wm, cm, gaps = [], hole = null) { const { x0, x1, z0, z1, h } = R, w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (!hole) plane(w, d, fm, cx, 0.005, cz, 0, -Math.PI / 2); else { const [a, b, c2, d2] = hole; for (const [p, q, r2, s2] of [[x0, x1, z0, c2], [x0, x1, d2, z1], [x0, a, c2, d2], [b, x1, c2, d2]]) if (q - p > 0.01 && s2 - r2 > 0.01) plane(q - p, s2 - r2, fm, (p + q) / 2, 0.005, (r2 + s2) / 2, 0, -Math.PI / 2); }
    if (cm) B(w, 0.2, d, cm, cx, h + 0.1, cz);
    const side = (s, a0, a1, fixed) => { const gs = gaps.filter(q => q[0] === s).sort((p, q) => p[1] - q[1]); let a = a0; const put = (u0, u1, y0, y1) => { if (u1 - u0 < 0.05 || y1 - y0 < 0.05) return; const L = u1 - u0, m = (u0 + u1) / 2, hh = y1 - y0; if (s === 'n' || s === 's') B(L, hh, 0.3, wm, m, y0 + hh / 2, fixed); else B(0.3, hh, L, wm, fixed, y0 + hh / 2, m); };
      for (const [, b0, b1, gh = 3.2] of gs) { put(a, b0, 0, h); put(b0, b1, gh, h); a = b1; } put(a, a1, 0, h); };
    side('n', x0, x1, z0 - 0.15); side('s', x0, x1, z1 + 0.15); side('w', z0, z1, x0 - 0.15); side('e', z0, z1, x1 + 0.15); }
  // an arched cave mouth (rock arch + brass keystone) over a door in a N / S wall; big sign above, eye-level sign beside (on the side it faces)
  function mouth(x, z, face, big, sub, fg) { const ry = face > 0 ? 0 : Math.PI, oz = face * 0.2; const a = Q(new THREE.TorusGeometry(1.75, 0.38, 8, 20, Math.PI), rockM, x, 3.2, z + oz); a.rotation.y = ry; for (const s of [-1, 1]) B(0.7, 3.2, 0.7, rockM, x + s * 1.85, 1.6, z + oz);
    CY(0.18, 0.18, 0.3, brass, x, 5.0, z + oz * 1.6, 8).rotation.x = Math.PI / 2; sign([big, sub], 4.0, 0.95, fg, x, 6.0, z + oz * 1.4, ry); sign([big], 1.3, 0.5, fg, x + (face > 0 ? 2.8 : -2.8), 1.6, z + oz * 1.4, ry); }

  // ---------- THE CUT (the canyon concourse) ----------
  { const R = UR_ROOMS[0]; room(R, floorM, rockM, null, [['n', -18.5, -15.5], ['n', -1.5, 1.5], ['n', 15.5, 18.5], ['s', -18.5, -15.5], ['s', -1.5, 1.5], ['s', 15.5, 18.5]]);
    // the sky slot: ceiling on both sides, open (glass) in the middle onto the stars
    for (const s of [-1, 1]) B(52, 0.3, 3.0, dark, 0, R.h + 0.15, s * 3.5); plane(52, 4, glass, 0, R.h + 0.05, 0, 0, Math.PI / 2);
    for (let i = 0; i <= 13; i++) B(0.25, 0.25, 4.2, brass, -26 + i * 4, R.h - 0.1, 0);
    // carved ledges + glowing cave windows up the canyon walls
    for (const s of [-1, 1]) for (const [y, d] of [[4.4, 0.7], [7.0, 0.5]]) { if (y > 5) B(52, 0.28, d, clay2, 0, y, s * (5 - d / 2)); else { let a = -26; for (const dx of [...DXS, 28.6]) { const b = dx - 2.6; if (b - a > 0.2) B(b - a, 0.28, d, clay2, (a + b) / 2, y, s * (5 - d / 2)); a = dx + 2.6; } } for (let i = 0; i < 9; i++) { const x = -22 + i * 5.5 + (y > 5 ? 2.7 : 0); if (DXS.some(dx => Math.abs(x - dx) < 2.6) && y < 5) continue; plane(0.9, 1.2, basic('#ffcf7a', 0.85), x, y + 0.9, s * (5 - 0.02), s > 0 ? Math.PI : 0); glow(x, y + 0.9, s * 4.6, 0xffa050, 1.6, 0.4); } }
    // the stream + reeds + three brass footbridges
    const wm = new THREE.Mesh(new THREE.PlaneGeometry(50, 1.8, 50, 2), new THREE.MeshBasicMaterial({ color: WATER, transparent: true, opacity: 0.85, toneMapped: false })); wm.rotation.x = -Math.PI / 2; wm.position.set(0, -0.12, 0); g.add(wm);
    B(50, 0.3, 2.4, clay2, 0, -0.32, 0); for (const s of [-1, 1]) B(50, 0.18, 0.3, sands, 0, 0.02, s * 1.05);
    const ripples = []; for (let i = 0; i < (LOW ? 8 : 18); i++) { const rp = Q(new THREE.RingGeometry(0.1, 0.16, 16), basic('#e0f4ff', 0.5, true), rr(-24, 24), -0.1, rr(-0.6, 0.6)); rp.rotation.x = -Math.PI / 2; ripples.push([rp, rnd() * 3]); }
    anims.push((dt, t) => ripples.forEach(([rp, p]) => { const k = (t * 0.5 + p) % 1; rp.scale.setScalar(1 + k * 3); rp.material.opacity = 0.5 * (1 - k); rp.position.x += dt * (0.6 + waterBoost * 0.3); if (rp.position.x > 24) rp.position.x = -24; }));
    for (let x = -24; x <= 24; x += 1.6) { if (DXS.some(dx => Math.abs(x - dx) < 2)) continue; for (const s of [-1, 1]) if (rnd() < 0.7) { const n = 2 + (rnd() * 3 | 0); for (let k = 0; k < n; k++) { const rd = CY(0.025, 0.04, rr(0.8, 1.5), reed, x + rr(-0.4, 0.4), 0.5, s * rr(0.85, 1.15), 5); rd.rotation.z = rr(-0.15, 0.15); } } }
    let a0 = -26; for (const dx of [...DXS, 27.4]) { if (dx - 1.4 > a0) blocks.push([a0, dx - 1.4, -1.0, 1.0]); a0 = dx + 1.4; }
    for (const dx of DXS) { B(2.8, 0.22, 2.6, brass, dx, 0.12, 0); for (const s of [-1, 1]) { B(0.08, 0.9, 2.6, brass, dx + s * 1.35, 0.55, 0); for (const e of [-1, 1]) CY(0.07, 0.07, 1.0, brass, dx + s * 1.35, 0.5, e * 1.25, 6); } }
    // floating rocks with brass rings
    const fl = []; for (const [x, y, s] of [[-10, 6.2, 1.4], [9, 5.6, 1.1], [21, 6.6, 0.9]]) { const r = Q(new THREE.DodecahedronGeometry(s, 0), clay2, x, y, 0); const ring = Q(new THREE.TorusGeometry(s * 1.4, 0.06, 6, 28), brass, x, y, 0); ring.rotation.x = 1.2; fl.push([r, ring, y, rnd() * 6]); }
    anims.push((dt, t) => fl.forEach(([r, ring, y, p]) => { r.position.y = ring.position.y = y + Math.sin(t * 0.6 + p) * 0.25; r.rotation.y += dt * 0.2; ring.rotation.z += dt * 0.4; }));
    // brass lanterns lining the walk (path readability), the U crest, signs
    for (let x = -23; x <= 23; x += 5.75) for (const s of [-1, 1]) { if (DXS.some(dx => Math.abs(x - dx) < 2.4)) continue; CY(0.06, 0.08, 2.4, brass, x, 1.2, s * 4.3, 8); Q(new THREE.SphereGeometry(0.2, 10, 8), basic('#ffd28a'), x, 2.5, s * 4.3); glow(x, 2.5, s * 4.3, 0xffb060, 1.8, 0.6); circles.push([x, s * 4.3, 0.3]); }
    const crest = tex(canvas(512, 512, (c, w) => { c.clearRect(0, 0, w, w); c.strokeStyle = BRASS; c.lineWidth = 22; c.beginPath(); c.arc(256, 256, 220, 0, 7); c.stroke(); c.fillStyle = BRASS; c.font = `900 300px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('U', 256, 270); }));
    for (const x of [-8.5, 8.5]) plane(3.2, 3.2, new THREE.MeshBasicMaterial({ map: crest, transparent: true, toneMapped: false }), x, 0.02, 2.9, 0, -Math.PI / 2);
    sign(['UR STATION', 'THE CUT'], 5.4, 1.3, BRASS, -25.8, 5.6, 0, Math.PI / 2); sign(['UR STATION', 'THE CUT'], 5.4, 1.3, BRASS, 25.8, 5.6, 0, -Math.PI / 2);
    mouth(-17, -5, 1, 'TABLET HALL', 'THE ARCHIVE', '#ffd28a'); mouth(0, -5, 1, 'OPERATIONS', 'THE WATCHTOWER', '#ffb070'); mouth(17, -5, 1, 'SECURITY', 'THE REED CAGE', '#ff8a6a');
    mouth(-17, 5, -1, 'THE WATER WORKS', 'ENGINEERING', '#5fb8ff'); mouth(0, 5, -1, 'BERTH FOUR', 'AIRLOCK \u00b7 YOUR SHIP', '#ffd23a'); mouth(17, 5, -1, 'THE KILN CAFE', 'COFFEE IN CLAY CUPS', '#ff8a6a'); }

  // ---------- TABLET HALL (NW) ----------
  { const R = UR_ROOMS[1]; room(R, floorM, brickM, toon('#2a1a12'), [['s', -18.5, -15.5]]);
    const tabM = [toon('#b88a5a'), toon('#a0784a'), toon('#c89a6a')]; for (const x of [R.x0 + 0.5, R.x1 - 0.5]) { B(0.9, 4.2, 12, dark, x, 2.1, -12.2, g, true); blocks.push([x - 0.5, x + 0.5, -18.2, -6.2]); for (let r = 0; r < 5; r++) for (let k = 0; k < 14; k++) B(0.12, 0.42, 0.62, tabM[(r + k) % 3], x + (x < -17 ? 0.5 : -0.5), 0.5 + r * 0.8, -17.6 + k * 0.82); }
    B(1.6, 1.1, 0.9, toon('#6a4a2a'), -17, 0.55, -11.6, g, true); blocks.push([-17.8, -16.2, -12.05, -11.15]); const tb = B(0.7, 0.06, 0.5, tabM[2], -17, 1.15, -11.6); tb.rotation.x = -0.3;
    for (const x of [-21, -13]) { CY(0.1, 0.14, 2.2, brass, x, 1.1, -17.8, 8); glow(x, 2.3, -17.8, 0xffb060, 2.0, 0.6); }
    sign(['TABLET HALL', 'READ GENTLY \u00b7 OLDER THAN YOU'], 4.6, 1.1, '#ffd28a', -17, 4.2, R.z0 + 0.2, 0);
    spots.push({ key: 'urTablet', r: 1.1, x: -17, z: -10.2, run: X => { X.audio && X.audio.tone && X.audio.tone(262, 0.9, 0.03, 'triangle'); X.note('A CLAY TABLET', '\u201CEight gates, eight worlds. The one who opens them all must also close the wounds between.\u201D'); } }); }

  // ---------- OPERATIONS · THE WATCHTOWER (N) ----------
  { const R = UR_ROOMS[2]; room(R, floorM, toon('#6a3a22'), toon('#2a1a12'), [['s', -1.5, 1.5]]);
    plane(13, 3.4, glass, 0, 3.4, R.z0 + 0.02); for (let i = 0; i <= 6; i++) B(0.24, 3.4, 0.26, rust, -6.5 + i * 13 / 6, 3.4, R.z0 + 0.06);
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) B(0.2, R.h, 0.2, rust, s * 6.6, R.h / 2, -18.4 + i * 4.4);
    CY(1.8, 2.0, 1.0, rust, 0, 0.5, -12.4, 8, g, true); circles.push([0, -12.4, 2.3]);
    const holo = new THREE.Group(); holo.position.set(0, 1.4, -12.4); g.add(holo); { const pm = toon('#d9824a', { emissive: new THREE.Color('#ff8a3a'), emissiveIntensity: 0.25 }); Q(new THREE.SphereGeometry(0.7, 20, 14), pm, 0, 0.5, 0, holo); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; Q(new THREE.DodecahedronGeometry(0.1, 0), toon('#9a4626'), Math.cos(a) * 1.2, 0.5 + Math.sin(k) * 0.2, Math.sin(a) * 1.2, holo); } }
    const hg = glow(0, 1.9, -12.4, 0xffa060, 3, 0.35); holoRef = [holo, hg]; anims.push(dt => { holo.rotation.y += dt * 0.3; });
    spots.push({ key: 'urDockSpot', r: 1.1, x: 0, z: UR_GAMES.dock.at.z + UR_GAMES.dock.theme.standZ, run: X => X.prompt('DOCKING CONTROL', 'The Watchtower \u00b7 Warden Enhedu\u2019s board', [['TAKE THE WATCH', () => hooks.play && hooks.play('dock')], ['NOT NOW', null]]) });
    const scope = CY(0.14, 0.18, 2.0, brass, 4.6, 1.0, -18.0, 10); void scope; const eye = CY(0.12, 0.12, 0.8, brass, 4.6, 2.0, -17.7, 10); eye.rotation.x = 1.2; B(4.4, 1.0, 1.0, rust, -4.0, 0.5, -18.2, g, true); blocks.push([-6.2, -1.8, -18.8, -17.6]); plane(3.8, 0.6, basic('#ffb070', 0.85), -4.0, 1.15, -17.68, 0, -0.6);
    sign(['THE WATCHTOWER', 'CANYON LANES \u00b7 ROCKFALL ON LANE TWO'], 4.8, 1.1, '#ffb070', 0, 5.4, R.z0 + 0.25, 0); }

  // ---------- SECURITY · THE REED CAGE (NE) ----------
  { const R = UR_ROOMS[3]; room(R, floorM, brickM, toon('#2a1a12'), [['s', 15.5, 18.5]]);
    spots.push({ key: 'urScanSpot', r: 1.1, x: UR_GAMES.scan.at.x, z: UR_GAMES.scan.at.z + 6.4 * 0.7 / 2 + 1.0, run: X => X.prompt('CARGO SCAN', 'The Reed Cage \u00b7 Constable Mashu', [['WORK THE BELT', () => hooks.play && hooks.play('scan')], ['NOT NOW', null]]) });
    B(3.2, 1.1, 1.1, rust, 21.6, 0.55, -18.0, g, true); blocks.push([19.9, 23.3, -18.6, -17.4]); for (let i = 0; i < 3; i++) plane(1.1, 0.8, basic(['#ffb070', '#8fe34a', '#ec3013'][i], 0.8), 20.4 + i * 1.3, 2.4, R.z0 + 0.02);
    // the reed cage: a Fleet unit that carried the barrels back
    const CG = { x: 12.6, z: -16.6 }; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; CY(0.04, 0.05, 2.6, reed, CG.x + Math.cos(a) * 1.4, 1.3, CG.z + Math.sin(a) * 1.4, 5); } const lid = Q(new THREE.ConeGeometry(1.6, 0.8, 16), toon('#8a7a3a'), CG.x, 2.9, CG.z); void lid; circles.push([CG.x, CG.z, 1.7]);
    const bot = new THREE.Group(); bot.position.set(CG.x, 0, CG.z); g.add(bot); const bm = toon('#7a8088'), bd = toon('#2a2a2e'); B(0.8, 0.9, 0.6, bm, 0, 0.75, 0, bot); B(0.6, 0.5, 0.5, bm, 0, 1.45, 0, bot); for (const s of [-1, 1]) { B(0.16, 0.7, 0.16, bd, s * 0.25, 0.25, 0, bot); B(0.14, 0.6, 0.14, bm, s * 0.5, 0.9, 0.1, bot); }
    for (const s of [-1, 1]) { CY(0.22, 0.22, 0.5, toon('#5a6a3a'), 16.6 + s * 0.6, 0.25, -18.3, 12); } circles.push([16.6, -18.3, 1.1]); sign(['BARRELS', 'CARRIED BACK UP \u00b7 SEALED'], 1.6, 0.5, '#8fe34a', 16.6, 0.9, -17.7, 0);
    const eye = Q(new THREE.SphereGeometry(0.09, 10, 8), basic('#ec3013'), 0, 1.5, 0.26, bot); const eg = glow(0, 1.5, 0.32, 0xec3013, 0.6, 0.8, bot); bot.rotation.y = 0.6;
    anims.push((dt, t) => { const clean = Math.sin(t * 0.8) > 0.9; eye.material.color.set(clean ? '#5fe3ff' : '#ec3013'); eg.material.color.set(clean ? '#5fe3ff' : '#ec3013'); bot.position.x = CG.x + (clean ? 0 : Math.sin(t * 40) * 0.01); });
    sign(['THE REED CAGE', 'FLEET UNIT 9-REED \u00b7 BE KIND'], 2.6, 0.8, '#ff8a6a', CG.x, 3.7, CG.z + 1.6, 0);
    spots.push({ key: 'urCage', r: 1.2, x: CG.x + 2.5, z: CG.z + 0.4, run: X => { X.audio && X.audio.tone && X.audio.tone(180, 1.2, 0.03, 'triangle'); X.note('THE REED CAGE \u00b7 UNIT 9-REED', '\u201CDUMP THE\u2026 no. No. I carried them back. The water is not mine to poison. Help us.\u201D'); try { X.save.setFlag('urBotHeard'); } catch (e) {} } });
    sign(['THE REED CAGE', 'SECURITY \u00b7 UR STATION'], 4.6, 1.1, '#ff8a6a', 17, 4.4, R.z0 + 0.2, 0); }

  // ---------- THE WATER WORKS (SW, engineering) ----------
  { const R = UR_ROOMS[4], P0 = UR_GAMES.cond.at; room(R, floorM, toon('#6a4a3a'), toon('#22201e'), [['n', -18.5, -15.5]], [P0.x - P0.hw - 0.16, P0.x + P0.hw + 0.16, P0.z - P0.hd - 0.16, P0.z + P0.hd + 0.16]);
    CY(1.8, 2.0, 3.2, clay2, -21.6, 1.6, 7.6, 20, g, true); CY(1.85, 1.85, 0.2, brass, -21.6, 3.25, 7.6, 20); circles.push([-21.6, 7.6, 2.2]); const wl = Q(new THREE.CircleGeometry(1.7, 20), basic(WATER, 0.85), -21.6, 3.3, 7.6); wl.rotation.x = -Math.PI / 2;
    for (let i = 0; i < 3; i++) { const z = 15.4 + i * 1.2; B(5.6, 0.5, 1.0, toon(['#e0c08a', '#3a3030', '#6f8f3a'][i]), -20.4, 0.25, z); } blocks.push([-23.4, -17.4, 14.8, 18.4]); sign(['FILTER BEDS', 'SAND \u00b7 CHARCOAL \u00b7 REEDS'], 2.8, 0.7, '#5fb8ff', -20.4, 2.0, R.z1 - 0.2, Math.PI);
    for (let i = 0; i < 4; i++) B(8, 0.2, 0.2, brass, -16, 1.0 + i * 0.5, R.z1 - 0.4);
    const pumps = []; for (const x of [-13.4, -11.6]) { CY(0.4, 0.4, 1.2, brass, x, 0.6, 7.0, 12); const h2 = B(0.08, 0.9, 0.08, rust, x, 1.5, 7.0); pumps.push(h2); circles.push([x, 7.0, 0.6]); }
    const drops = []; for (let i = 0; i < (LOW ? 3 : 6); i++) { const d = Q(new THREE.SphereGeometry(0.05, 6, 4), basic('#bfe6ff'), -21.6 + rr(-1, 1), 3.4, 7.6 + rr(-1, 1)); drops.push([d, rnd()]); }
    anims.push((dt, t) => { waterBoost = Math.max(0, waterBoost - dt * 0.2); pumps.forEach((p, i) => { p.rotation.z = Math.sin(t * (1.6 + waterBoost) + i * 1.6) * 0.5; }); drops.forEach(([d, p]) => { const k = (t * 0.6 + p) % 1; d.position.y = 3.4 + Math.sin(k * Math.PI) * 0.4; }); });
    spots.push({ key: 'urCondSpot', r: 1.1, x: P0.x, z: P0.z + P0.hd + 0.9, run: X => X.prompt('WATER WORKS', 'The Water Works \u00b7 Engineer Abi', [['FIX THE LINES', () => hooks.play && hooks.play('cond')], ['NOT NOW', null]]) });
    sign(['THE WATER WORKS', 'EVERY DROP GOES THROUGH THE REEDS'], 4.6, 1.1, '#5fb8ff', -17, 4.4, R.z1 - 0.2, Math.PI); }

  // ---------- BERTH FOUR (S): arrival, the airlock ----------
  { const R = UR_ROOMS[5]; room(R, floorM, brickM, toon('#2a1a12'), [['n', -1.5, 1.5]]);
    Q(new THREE.TorusGeometry(1.5, 0.28, 10, 32), brass, 0, 1.8, R.z1 - 0.1); Q(new THREE.CircleGeometry(1.4, 32), toon('#3a2a22'), 0, 1.8, R.z1 - 0.06).rotation.y = Math.PI;
    const lamp = glow(1.9, 3.4, R.z1 - 0.3, 0xffb020, 1.4, 0.8); anims.push((dt, t) => { lamp.material.opacity = Math.floor(t * 2) % 2 ? 0.85 : 0.25; });
    sign(['AIRLOCK', 'YOUR SHIP IS DOCKED'], 2.6, 0.8, '#ffd23a', -3.4, 2.6, R.z1 - 0.2, Math.PI);
    B(2.4, 1.1, 1.0, rust, 3.8, 0.55, 12.4, g, true); blocks.push([2.5, 5.1, 11.8, 13.0]); sign(['DOCKMASTER'], 1.4, 0.45, '#ffd23a', 3.8, 1.5, 11.88, Math.PI);
    for (const [x, z] of [[-4.6, 8], [-4.6, 9.4], [-3.6, 8.6]]) { CY(0.35, 0.35, 0.9, toon('#8a6a3a'), x, 0.45, z, 12); circles.push([x, z, 0.5]); }
    spots.push({ key: 'urLock', r: 1.4, x: 0, z: 18.2, run: X => X.prompt('UR STATION \u00b7 BERTH FOUR', 'Your ship is clamped on the other side of the airlock.', [['BACK TO YOUR SHIP \u00b7 SPACE', () => { X.audio && X.audio.tone && X.audio.tone(90, 1.6, 0.05, 'sawtooth', 1.5); if (hooks.nav) hooks.nav('Space Map.dc.html?from=urSt'); }], ['STAY ABOARD', null]]) }); }

  // ---------- THE KILN CAFE (SE) ----------
  { const R = UR_ROOMS[6]; room(R, floorM, brickM, toon('#2a1a12'), [['n', 15.5, 18.5], ['s', 11, 23, 4.4]]);
    plane(12, 4.4, glass, 17, 2.2, R.z1 + 0.1, Math.PI); for (let i = 0; i <= 4; i++) B(0.2, 4.4, 0.2, rust, 11 + i * 3, 2.2, R.z1 + 0.1);
    const kiln = Q(new THREE.SphereGeometry(1.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), clay2, 21.6, 0, 8.0, g, true); void kiln; circles.push([21.6, 8.0, 1.6]); const mouthG = glow(21.6, 0.5, 9.3, 0xff7a2a, 1.6, 0.8); anims.push((dt, t) => { mouthG.material.opacity = 0.6 + 0.2 * Math.sin(t * 7); });
    B(5, 1.1, 1.0, toon('#6a3a22'), 17, 0.55, 13.4, g, true); B(5.2, 0.1, 1.2, sands, 17, 1.15, 13.4); blocks.push([14.4, 19.6, 12.8, 14.0]); for (let i = 0; i < 5; i++) CY(0.08, 0.06, 0.14, clay, 15.2 + i * 0.9, 1.27, 13.2, 8);
    for (const [x, z] of [[12.4, 9], [12.4, 16.6], [22.4, 16.6]]) { CY(0.55, 0.55, 0.06, toon('#6a3a22'), x, 0.75, z, 14); CY(0.07, 0.09, 0.75, dark, x, 0.37, z, 8); circles.push([x, z, 0.7]); }
    sign(['THE KILN CAFE', 'COFFEE IN CLAY CUPS \u00b7 KEEP THE CUP'], 4.6, 1.1, '#ff8a6a', 17, 4.4, R.z0 + 0.2, 0); }

  // ---------- walking, camera, labels ----------
  const inR = (R, x, z, m) => x > R.x0 + m && x < R.x1 - m && z > R.z0 + m && z < R.z1 - m;
  function walk(x, z) { for (const [cx, cz, cr] of circles) if (Math.hypot(x - cx, z - cz) < cr) return false;
    for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false;
    for (const R of UR_ROOMS) if (inR(R, x, z, 0.4)) return true; for (const [a, b, c, d] of DOORS) if (x > a && x < b && z > c && z < d) return true; return false; }
  let cur = UR_ROOMS[5];
  function tick(dt, t, px, pz) { const R = UR_ROOMS.find(q => inR(q, px, pz, 0.1)); if (R) cur = R; }
  function clampCam(v) { const R = cur; v.x = Math.min(R.x1 - 0.4, Math.max(R.x0 + 0.4, v.x)); v.z = Math.min(R.z1 - 0.4, Math.max(R.z0 + 0.4, v.z)); v.y = Math.min(v.y, R.h - 0.4); }
  function label(x, z) { const R = UR_ROOMS.find(q => inR(q, x, z, 0)); return 'Ur Station \u00b7 ' + (R ? R.name : 'The Cut').toLowerCase().replace(/(^|\s)\S/g, s => s.toUpperCase()); }
  return { g, anims, walk, clampCam, label, tick, spots, hooks, blocks, circles, setHolo(v) { for (const o of holoRef) o.visible = v; }, surge(t = 2.6) { waterBoost = Math.max(waterBoost, t); }, vent() { waterBoost = 3; } };
}
