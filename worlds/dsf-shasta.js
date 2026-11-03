// SHASTA STATION [dsfOutSh] (s490): Shasta's own station, inside the hexagonal ice ring. Built far away at (OX, 0, 0), only shown
// while you are aboard (Deep Space Fox.dc.html?at=shasta, from the Space Map dock). A timber-and-ice mountain lodge in orbit:
// THE HEARTH in the middle (a hex lodge hall, a round stone fire under a copper hood, the frosted CRYSTAL SPIRE skylight, big
// windows on the four diagonal walls onto SHASTA, the snow world), OPERATIONS · THE SUMMIT (N), BERTH THREE (S, arrival + airlock),
// ENGINEERING · THE BOILER (W), THE BOARDWALK (E: a lamp-lit lodge street) with FOX CINEMA (the real cinema interior from
// minigames/cinema/snack-counter.js buildCinema, loaded on arrival) on its north side and SECURITY · THE COLD WATCH (the ICE CELL
// holds a hacked Fleet snowplow: cold quiets the voice in it) on its south side, and the GLACIER LOUNGE (cocoa, armchairs, the
// whole wall a window) off Berth Three. Shasta glows white below.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const PINE = '#2f5d3a', LOG = '#7a4e2e', LOG2 = '#5a3820', STONE = '#8a8f96', STONE2 = '#5e636a', SNOW = '#eef4fa', ICE = '#bfe6ff', PLAID = '#b3121b', COPPER = '#c87a3a';
const HR = 12, HA = HR * Math.sqrt(3) / 2, S3 = Math.sqrt(3);
export const SH = { OX: 22000, hw: 44, hd: 30, h: 12, door: { x: 999, z: 999 }, enter: { x: 0, z: 20.5 } };
// walkable rooms (local, axis-aligned) + corridors / door gaps (no wall margin); the Hearth is the hex
export const SH_ROOMS = [
  { k: 'ops', x0: -9, x1: 9, z0: -25, z1: -12.4, h: 5.6, name: 'OPERATIONS', sub: 'THE SUMMIT \u00b7 WARDEN ASPEN' },
  { k: 'berth', x0: -7, x1: 7, z0: 12.4, z1: 26, h: 5.6, name: 'BERTH THREE', sub: 'ICE DOCK \u00b7 DOCKMASTER QUILL' },
  { k: 'eng', x0: -30, x1: -14.5, z0: -8, z1: 8, h: 6.2, name: 'ENGINEERING', sub: 'THE BOILER \u00b7 CHIEF ALDER' },
  { k: 'walk', x0: 15, x1: 42, z0: -6.5, z1: 3, h: 6.0, name: 'THE BOARDWALK', sub: 'CINEMA \u00b7 THE COLD WATCH' },
  { k: 'lobby', x0: 19, x1: 33, z0: -17.5, z1: -6.5, h: 4.4, name: 'FOX CINEMA', sub: 'SNACK COUNTER \u00b7 REEL', cin: true },
  { k: 'screen', x0: 33, x1: 42, z0: -17.5, z1: -6.5, h: 4.4, name: 'FOX CINEMA \u00b7 SCREEN 1', cin: true },
  { k: 'sec', x0: 18, x1: 36, z0: 3, z1: 15, h: 5.6, name: 'SECURITY', sub: 'THE COLD WATCH \u00b7 MARSHAL FROST' },
  { k: 'lounge', x0: -22, x1: -7, z0: 13, z1: 26, h: 5.6, name: 'GLACIER LOUNGE', sub: 'COCOA \u00b7 JUNE' }];
const DOORS = [[-1.6, 1.6, -12.8, -9.8], [-1.6, 1.6, 9.8, 12.8], [-14.9, -10.7, -1.4, 1.4], [10.7, 15.4, -1.4, 1.4], [23.5, 26.5, 2.4, 3.6], [24.7, 27.3, -7.2, -5.8], [-7.6, -6.4, 16, 19], [32.6, 33.4, -9.4, -7.6]];
const L1 = t => [{ who: 'npc', text: t }];
const T = (label, ...r) => ({ label, replies: r.map(text => ({ who: 'npc', text })) });
const F = (a, b, tip = '#ffffff', paw) => ({ fur: { tailA: a, tailB: b, tailTip: tip, paw: paw || b }, faceCols: { furA: a, furB: b } });
// the people aboard (every box 20 words or less; names DRAFT for Ben)
export const SH_NPCS = [
  { key: 'shAspen', at: [-2.6, -19.6], look: [0, -22], outfit: 'coat', g: { name: 'WARDEN ASPEN', title: 'Shasta Station, Operations', torso: ['#2f5d3a', '#1e3e26', '#0e1e12'], ...F('#d8dde4', '#8a96a4'), greeting: 'Welcome to the Summit. Mind the frost on the rails.',
    lines: [{ who: 'player', text: 'Warden.' }, { who: 'npc', text: 'Shasta Station. Six walls, one fire, and the coldest world in the system below us.' }],
    topics: [T('What does the station do?', 'We watch the passes, guide the ore sleds up, and keep the lodge warm for anyone flying through.'),
      T('Any trouble out there?', 'Fleet ploughs came up the pass last month. Cleared nothing. Went for our sleds instead.', 'Marshal Frost caught one. Go and see the ice cell.')] } },
  { key: 'shBirch', at: [5.2, -23.2], look: [5.2, -25], outfit: 'suit', g: { name: 'ENSIGN BIRCH', title: 'Shasta Station, Pass Watch', torso: ['#3a4a5a', '#26323e', '#121820'], ...F('#e8ecf0', '#a4aebb'),
    lines: L1('Storm front over the north pass. The sleds wait till it clears. Nobody argues with Shasta.'),
    topics: [T('What do you watch?', 'Every sled, every plough, every light on the mountain. Some lights move that should not.')] } },
  { key: 'shQuill', at: [4.4, 16.2], look: [0, 18], outfit: 'coat', g: { name: 'DOCKMASTER QUILL', title: 'Berth Three, Ice Dock', torso: ['#6a3a22', '#4a2614', '#22120a'], ...F('#cfd6de', '#7c8896'),
    lines: L1('Your ship is on the clamp. Knock the ice off your boots before the Hearth, please.'),
    topics: [T('Why is it so cold here?', 'The ring is cut from Shasta ice. We keep it frozen. A warm station would melt itself.')] } },
  { key: 'shPine', at: [-4.6, 3.2], look: [0, 0], outfit: 'robe', g: { name: 'GRANNY PINE', title: 'Keeper of the Hearth', torso: ['#7a1e22', '#4a1214', '#22080a'], ...F('#f0f2f4', '#b8c0ca'),
    lines: L1('Sit by the fire, little one. The spire catches starlight and drops it right into the flames.'),
    topics: [T('Tell me a story.', 'When the gates first opened, a fox walked up the north pass with eight candles. One for each world.', 'The eighth candle never went out. We keep it here, in the fire.')] } },
  { key: 'shAlder', at: [-17.6, 2.2], look: [-23, 3.6], outfit: 'vest', g: { name: 'CHIEF ALDER', title: 'Engineering, The Boiler', torso: ['#5a4a3a', '#3a2e22', '#1a140e'], ...F('#dfe4ea', '#909aa6'),
    lines: L1('Steam from Shasta\u2019s hot springs, piped up the tether. Keeps the lodge warm and the lights on.'),
    topics: [T('Who keeps it running?', 'Fleet boiler bots, once. They stopped answering. One said cold, cold, cold, then shut itself down.')] } },
  { key: 'shFrost', at: [20.6, 12.4], look: [25, 9], outfit: 'armor', g: { name: 'MARSHAL FROST', title: 'Security, The Cold Watch', torso: ['#4a5060', '#2e323e', '#16181e'], ...F('#e4e8ee', '#8a94a2'),
    lines: L1('Boots on the line, hands where I can see them. The ice cell is not a statue. Do not lick it.'),
    topics: [T('What is in the ice?', 'A Fleet plough. We froze it to stop it. When it is cold, the voice in it goes quiet.', 'Then it asks for help. In its own voice, I think.')] } },
  { key: 'shJune', at: [-16.2, 16.4], look: [-14, 19], outfit: 'dress', g: { name: 'JUNE', title: 'Glacier Lounge, Cocoa', torso: ['#b3121b', '#7a0c12', '#3a0608'], ...F('#f2e6da', '#c09a7a'),
    lines: L1('Cocoa with a marshmallow the size of your paw. Sit by the window, the glacier is glowing tonight.'),
    topics: [T('The glacier?', 'The big white river down there. It moves a paw a day. I like that about it.')] } },
  { key: 'shReel', at: [30.6, -14.5], look: [26, -10], outfit: 'suit', g: { name: 'REEL', title: 'Fox Cinema, Shasta Station', torso: ['#b3202e', '#7a1522', '#3a0a10'], ...F('#d9622a', '#8a3410'),
    lines: L1('Welcome to the Fox Cinema, Shasta Station! Popcorn is hot, Screen 1 is warm. Tonight: SPACE FOX II.'),
    topics: [] } }];

// s491 the station console games, Shasta versions (engines: dsf-docking / dsf-cargo-scan / dsf-conduit, opts.theme)
export const SH_GAMES = {
  dock: { at: { x: 0, z: -18.6 }, y: 1.5, theme: { title: 'DOCKING CONTROL', where: 'The Summit \u00b7 WARDEN ASPEN', kicker: 'Shasta Station \u00b7 Warden Aspen', cardTitle: 'Docking Control',
    body: 'Drag each ship to the berth in its colour. A blizzard drifts across the plot: never route a ship through the snow.', holo: '#9fe8ff', holoRgb: '159,232,255', bg: 'rgba(8,14,22,0.88)',
    tags: { shuttle: 'SLED', freighter: 'ORE', tug: 'PLOUGH' }, watchNames: ['First light', 'Ore sleds up', 'Cocoa run', 'Storm watch'], stat: 'shDock', pw: 5.2, maxD: 3.5, maxY: 5.0, standZ: 3.6,
    storm: { r: 14, speed: 6 }, hazardWord: 'ICED', hazardNote: ' flew into the blizzard.' } },
  scan: { at: { x: 27, z: 8 }, y: 1.0, theme: { title: 'CARGO SCAN', where: 'The Cold Watch \u00b7 MARSHAL FROST', kicker: 'The Cold Watch \u00b7 Marshal Frost', cardTitle: 'Cargo Scan',
    body: 'Tap any crate with a shape not on the manifest, before the red line. Crates with the red FLEET mark: hold those too. Never destroy them.',
    names: { drum: 'ORE CAN', sack: 'FLOUR', tin: 'COCOA TIN', ring: 'SKI BINDING', plate: 'ICE SAW', bulb: 'LANTERN', crystal: 'SPIRE QUARTZ', rod: 'SLED RUNNER' }, dockNames: ['Berth Three', 'Ore sled 9', 'Clubhouse supply', 'Pass courier'],
    fleet: 0.16, stat: 'shScan', scan: '#9fe8ff', scanRgb: '159,232,255', idleTitle: 'CARGO SCAN \u00b7 THE COLD WATCH' } },
  cond: { at: { x: -23, z: 3.6, hw: 2.32, hd: 1.66 }, theme: { title: 'BOILER LINES', where: 'The Boiler \u00b7 CHIEF ALDER', kicker: 'The Boiler \u00b7 Chief Alder', cardTitle: 'Boiler Lines', deck: 'BOILER LINES', deckSub: 'HOT SPRING STEAM \u00b7 KEEP CLEAR', amber: '#9fe8ff',
    body: 'Tap a pipe to turn it. Join each line from its inlet on the left to its outlet on the right. Pressure builds while you work: finish before it blows.',
    lines: [{ key: 'steam', name: 'STEAM', dim: '#4a4e56', ink: '#e8eef4', spark: '#ffffff' }, { key: 'water', name: 'HOT WATER', dim: '#6b3a1c', ink: '#ff8a2a', spark: '#ffe2a0' }, { key: 'air', name: 'COLD AIR', dim: '#2a4a5a', ink: '#9fe8ff', spark: '#e6faff' }],
    sysNames: ['Hearth floor heat', 'Spire de-icer', 'Boardwalk lamps', 'Berth Three clamp'], stat: 'shCond', heat: [2.0, 2.8, 3.4, 4.0] } } };
export function buildShastaSt(K) {
  const { THREE, scene, glowSprite, rnd, rr, LOW } = K;
  const g = new THREE.Group(); g.position.set(SH.OX, 0, 0); g.visible = false; scene.add(g);
  const anims = [], blocks = [], circles = [], spots = [], hooks = {}; let cin = null, cinTried = false, holoRef = [], steamBoost = 0;
  const tex = (c, rx, ry) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); } return t; };
  const toon = (c, x) => K.toon(c, x), basic = (c, o, a) => K.basic(c, o, a);
  const Q = (geo, mat, x, y, z, p = g, cast = false) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast && !LOW; m.receiveShadow = true; p.add(m); return m; };
  const B = (w, h, d, mat, x, y, z, p, cast) => Q(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p, cast);
  const CY = (r1, r2, h, mat, x, y, z, seg = 16, p, cast) => Q(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, cast);
  const glow = (x, y, z, c, s, o = 0.6, p = g) => glowSprite(x, y, z, c, s, o, p);
  const plane = (w, h, mat, x, y, z, ry = 0, rx = 0, p = g) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; p.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry, p = g, bg = '#14181e') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, Hh) => { c.fillStyle = bg; c.fillRect(0, 0, W, Hh); c.strokeStyle = fg; c.lineWidth = 12; c.strokeRect(6, 6, W - 12, Hh - 12); const n = lines.length, lh = Hh * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.66 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, Hh * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry, 0, p); };
  const log = toon(LOG), log2 = toon(LOG2), stone = toon(STONE), stone2 = toon(STONE2), snow = toon(SNOW), copper = toon(COPPER), pine = toon(PINE), iron = toon('#3a3e46');
  const glass = basic('#cfeaff', 0.12), ice = toon(ICE, { transparent: true, opacity: 0.55 });
  const planks = tex(canvas(256, 256, (c, w) => { for (let i = 0; i < 8; i++) { c.fillStyle = ['#8a5a36', '#7e5232', '#93623c', '#86583a'][i % 4]; c.fillRect(0, i * 32, w, 32); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0, i * 32, w, 2); c.fillRect((i * 97) % w, i * 32, 2, 32); } }), 6, 6);
  const flags = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#7a7f86'; c.fillRect(0, 0, w, w); for (let i = 0; i < 14; i++) { c.fillStyle = ['#868b92', '#6e737a', '#92979e'][i % 3]; c.fillRect(rnd() * w, rnd() * w, 40 + rnd() * 60, 30 + rnd() * 50); } c.strokeStyle = 'rgba(30,32,36,0.5)'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(rnd() * w, 0); c.lineTo(rnd() * w, w); c.stroke(); } }), 5, 5);
  const plaid = tex(canvas(128, 128, (c, w) => { c.fillStyle = PLAID; c.fillRect(0, 0, w, w); c.fillStyle = 'rgba(20,10,10,0.45)'; for (const p of [16, 64, 104]) { c.fillRect(p, 0, 14, w); c.fillRect(0, p, w, 14); } c.fillStyle = 'rgba(255,220,180,0.25)'; for (const p of [40, 88]) { c.fillRect(p, 0, 3, w); c.fillRect(0, p, w, 3); } }));
  const floorM = toon('#a07048', { map: planks }), stoneM = toon('#9aa0a8', { map: flags });

  // ---------- outside: stars, the aurora, SHASTA (snow + ice) below, the ice ring ----------
  { const st = tex(canvas(2048, 1024, (c, w, h) => { c.fillStyle = '#03060c'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { c.fillStyle = `rgba(${215 + (rnd() * 40 | 0)},${230 + (rnd() * 25 | 0)},255,${(0.25 + rnd() * 0.75).toFixed(2)})`; const s = rnd() < 0.06 ? 2.6 : 1.3; c.fillRect(rnd() * w, rnd() * h * 0.62, s, s); }
      for (let b = 0; b < 3; b++) { c.globalAlpha = 0.16; const y0 = h * (0.18 + b * 0.09); for (let x = 0; x < w; x += 4) { const y = y0 + Math.sin(x / 140 + b * 2) * 40 + Math.sin(x / 37) * 8; const gr = c.createLinearGradient(0, y - 60, 0, y + 40); gr.addColorStop(0, 'rgba(120,255,190,0)'); gr.addColorStop(0.6, b === 1 ? 'rgba(160,120,255,1)' : 'rgba(110,255,180,1)'); gr.addColorStop(1, 'rgba(110,255,180,0)'); c.fillStyle = gr; c.fillRect(x, y - 60, 4, 100); } } c.globalAlpha = 1; }));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.MeshBasicMaterial({ map: st, side: THREE.BackSide, toneMapped: false, depthWrite: false })));
    const pl = tex(canvas(1024, 512, (c, w, h) => { c.fillStyle = '#dfe9f2'; c.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { const x = rnd() * w, y = rnd() * h, s = 10 + rnd() * 40; c.fillStyle = rnd() < 0.5 ? 'rgba(120,140,160,0.35)' : 'rgba(255,255,255,0.7)'; c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * 0.8, y + s * 0.5); c.lineTo(x - s * 0.8, y + s * 0.5); c.fill(); }
      c.strokeStyle = 'rgba(150,210,255,0.6)'; c.lineWidth = 6; for (let k = 0; k < 6; k++) { c.beginPath(); let x = rnd() * w, y = rnd() * h; c.moveTo(x, y); for (let s = 0; s < 8; s++) { x += rr(-40, 40); y += rr(10, 40); c.lineTo(x, y); } c.stroke(); } c.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 30; i++) { c.beginPath(); c.ellipse(rnd() * w, rnd() * h, 80, 20, rnd() * 3, 0, 7); c.fill(); } }));
    const planet = new THREE.Mesh(new THREE.SphereGeometry(520, 48, 32), new THREE.MeshBasicMaterial({ map: pl, toneMapped: false })); planet.position.set(0, -620, 0); g.add(planet); anims.push(dt => { planet.rotation.y += dt * 0.004; });
    const haze = new THREE.Mesh(new THREE.SphereGeometry(540, 48, 32), new THREE.MeshBasicMaterial({ color: '#bfe6ff', transparent: true, opacity: 0.18, side: THREE.BackSide, toneMapped: false, depthWrite: false })); haze.position.copy(planet.position); g.add(haze);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(60, 3.2, 6, 6), toon('#cfeaff', { transparent: true, opacity: 0.85 })); ring.rotation.x = Math.PI / 2; ring.position.y = -3; g.add(ring);
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, sh = Q(new THREE.ConeGeometry(2.6, 14, 6), toon('#e6f6ff', { transparent: true, opacity: 0.8 }), Math.cos(a) * 60, 2, Math.sin(a) * 60); sh.rotation.z = 0.25 * (k % 2 ? 1 : -1); glow(Math.cos(a) * 60, 9, Math.sin(a) * 60, 0x9fe8ff, 6, 0.5); } }

  // ---------- generic room: floor, ceiling, 4 walls with door gaps ----------
  function room(R, fm, wm, cm, gaps = [], hole = null) { const { x0, x1, z0, z1, h } = R, w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (!hole) plane(w, d, fm, cx, 0.005, cz, 0, -Math.PI / 2); else { const [a, b, c2, d2] = hole; for (const [p, q, r2, s2] of [[x0, x1, z0, c2], [x0, x1, d2, z1], [x0, a, c2, d2], [b, x1, c2, d2]]) if (q - p > 0.01 && s2 - r2 > 0.01) plane(q - p, s2 - r2, fm, (p + q) / 2, 0.005, (r2 + s2) / 2, 0, -Math.PI / 2); } const ce = B(w, 0.2, d, cm, cx, h + 0.1, cz); void ce;
    const side = (s, a0, a1, fixed) => { const gs = gaps.filter(q => q[0] === s).sort((p, q) => p[1] - q[1]); let a = a0; const put = (u0, u1, y0, y1) => { if (u1 - u0 < 0.05 || y1 - y0 < 0.05) return; const L = u1 - u0, m = (u0 + u1) / 2, hh = y1 - y0; if (s === 'n' || s === 's') B(L, hh, 0.3, wm, m, y0 + hh / 2, fixed); else B(0.3, hh, L, wm, fixed, y0 + hh / 2, m); };
      for (const [, b0, b1, gh = 3.2] of gs) { put(a, b0, 0, h); put(b0, b1, gh, h); a = b1; } put(a, a1, 0, h); };
    side('n', x0, x1, z0 - 0.15); side('s', x0, x1, z1 + 0.15); side('w', z0, z1, x0 - 0.15); side('e', z0, z1, x1 + 0.15); }
  // eye-level door sign beside a door + the big sign over it (both faces of the wall)
  function doorSigns(big, sub, fg, x, z, ry, side = 1) { const nx = Math.sin(ry), nz = Math.cos(ry); sign([big, sub], 4.2, 1.0, fg, x + nx * 0.2, 3.9, z + nz * 0.2, ry); sign([big], 1.3, 0.5, fg, x + nx * 0.2 + Math.cos(ry) * 2.2 * side, 1.6, z + nz * 0.2 - Math.sin(ry) * 2.2 * side, ry); }

  // ---------- THE HEARTH (centre hex) ----------
  { const hexShape = new THREE.Shape(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; const [x, y] = [Math.cos(a) * HR, Math.sin(a) * HR]; k ? hexShape.lineTo(x, y) : hexShape.moveTo(x, y); } hexShape.closePath();
    const fl = new THREE.Mesh(new THREE.ShapeGeometry(hexShape), stoneM); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.006; fl.receiveShadow = true; g.add(fl);
    const cs = hexShape.clone(); const hole = new THREE.Path(); hole.absarc(0, 0, 2.8, 0, Math.PI * 2, true); cs.holes.push(hole); const ce = new THREE.Mesh(new THREE.ShapeGeometry(cs), toon('#3a2616', { side: THREE.DoubleSide })); ce.rotation.x = Math.PI / 2; ce.position.y = 9; g.add(ce);
    // rug + the 8 crest in the stone
    const rug = plane(9, 9, toon('#ffffff', { map: plaid }), 0, 0.012, 0, 0, -Math.PI / 2); void rug;
    // walls: N + S flats (door gap), four diagonal window walls (gap at the E / W vertices for the corridors)
    const wall = (ax, az, bx, bz, win) => { const L = Math.hypot(bx - ax, bz - az), mx = (ax + bx) / 2, mz = (az + bz) / 2, ry = Math.atan2(-(bz - az), bx - ax), grp = new THREE.Group(); grp.position.set(mx, 0, mz); grp.rotation.y = ry; g.add(grp);
      if (!win) { B(L, 9, 0.4, log, 0, 4.5, 0, grp); return grp; } B(L, 1.2, 0.5, log, 0, 0.6, 0, grp); B(L, 2.6, 0.5, log, 0, 7.7, 0, grp); plane(L, 5.2, glass, 0, 3.8, 0, 0, 0, grp); for (let i = 0; i <= 4; i++) B(0.22, 5.2, 0.3, log2, -L / 2 + i * L / 4, 3.8, 0, grp); B(L, 0.2, 0.36, log2, 0, 3.8, 0, grp);
      const fr = new THREE.Mesh(new THREE.BoxGeometry(L, 0.3, 0.9), snow); fr.position.set(0, 1.3, 0.3); grp.add(fr); return grp; };
    const V = k => [Math.cos(k * Math.PI / 3) * HR, -Math.sin(k * Math.PI / 3) * HR];   // k 0 = E, 1 = NE (z < 0 = north), 2 = NW, 3 = W, 4 = SW, 5 = SE
    const cut = (p, q, d) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]); return [p[0] + (q[0] - p[0]) * d / L, p[1] + (q[1] - p[1]) * d / L]; };
    for (const [a, b] of [[0, 1], [2, 3], [3, 4], [5, 0]]) { const pa = V(a), pb = V(b), A = a === 0 || a === 3 ? cut(pa, pb, 1.95) : pa, Bp = b === 0 || b === 3 ? cut(pb, pa, 1.95) : pb; wall(A[0], A[1], Bp[0], Bp[1], true); }
    for (const zs of [-1, 1]) { const z = zs * HA; for (const [x0, x1] of [[-6, -1.6], [1.6, 6]]) B(x1 - x0, 9, 0.5, log, (x0 + x1) / 2, 4.5, z); B(3.2, 9 - 3.4, 0.5, log, 0, 3.4 + (9 - 3.4) / 2, z); }
    // posts at the vertices, beams to the spire
    for (let k = 0; k < 6; k++) { const [x, z] = V(k); CY(0.32, 0.36, 9, log2, x * 0.97, 4.5, z * 0.97, 10); const bm = B(HR - 2.8, 0.4, 0.4, log2, x * (HR + 2.8) / (2 * HR), 8.7, z * (HR + 2.8) / (2 * HR)); bm.rotation.y = k * Math.PI / 3; }
    // the fire: round stone pit, flames, copper hood up into the crystal spire
    CY(2.3, 2.5, 0.6, stone2, 0, 0.3, 0, 24, g, true); CY(1.9, 1.9, 0.62, toon('#1a1210'), 0, 0.32, 0, 24); circles.push([0, 0, 2.9]);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, lg = CY(0.14, 0.14, 1.5, log2, Math.cos(a) * 0.6, 0.75, Math.sin(a) * 0.6, 8); lg.rotation.set(Math.PI / 2, 0, a); }
    const flames = []; for (let i = 0; i < (LOW ? 5 : 9); i++) { const f = Q(new THREE.ConeGeometry(0.28 + rnd() * 0.2, 1.1 + rnd() * 0.7, 7), basic(i % 3 ? '#ffb030' : '#ff6a1a', 0.9, true), rr(-0.8, 0.8), 1.2, rr(-0.8, 0.8)); flames.push([f, rnd() * 6]); }
    const fg = glow(0, 1.6, 0, 0xffa040, 6, 0.7); const fire = new THREE.PointLight(0xff9a40, LOW ? 1.2 : 2.2, 16, 1.6); fire.position.set(0, 2.2, 0); g.add(fire);
    anims.push((dt, t) => { flames.forEach(([f, p], i) => { f.scale.y = 0.8 + 0.35 * Math.sin(t * 9 + p) + 0.15 * Math.sin(t * 23 + i); f.position.y = 1.0 + f.scale.y * 0.4; }); fg.material.opacity = 0.6 + 0.1 * Math.sin(t * 13); fire.intensity = (LOW ? 1.2 : 2.2) * (0.9 + 0.1 * Math.sin(t * 17)); });
    const hood = Q(new THREE.CylinderGeometry(0.7, 2.0, 2.2, 6, 1, true), toon(COPPER, { side: THREE.DoubleSide }), 0, 4.6, 0); void hood; CY(0.7, 0.7, 3.2, copper, 0, 7.3, 0, 6);
    const spire = Q(new THREE.ConeGeometry(2.8, 6, 6), toon('#e6f6ff', { transparent: true, opacity: 0.55, emissive: new THREE.Color('#9fe8ff'), emissiveIntensity: 0.5 }), 0, 12, 0); void spire; glow(0, 10, 0, 0x9fe8ff, 7, 0.45);
    // log benches + the hearth sign
    for (const a of [30, 150, 210, 330]) { const r2 = a * Math.PI / 180, x = Math.cos(r2) * 5.4, z = -Math.sin(r2) * 5.4, b = CY(0.4, 0.4, 3.0, log, x, 0.42, z, 10, g, true); b.rotation.set(0, -r2 + Math.PI / 2, Math.PI / 2); circles.push([x, z, 1.3]); }
    sign(['SHASTA STATION', 'THE HEARTH \u00b7 WARM YOUR PAWS'], 5.4, 1.3, '#9fe8ff', 0, 6.6, -HA + 0.3, 0);
    // pine trees in tubs by the windows, snow + frost lamps
    for (const [x, z] of [[-8.6, -5.4], [8.6, -5.4], [-8.6, 5.4], [8.6, 5.4]]) { CY(0.6, 0.5, 0.7, log2, x, 0.35, z, 10); for (let i = 0; i < 3; i++) Q(new THREE.ConeGeometry(1.1 - i * 0.28, 1.4, 8), pine, x, 1.3 + i * 0.8, z, g, true); Q(new THREE.ConeGeometry(0.5 - 0.05, 0.4, 8), snow, x, 3.15, z); circles.push([x, z, 0.85]); }
    spots.push({ key: 'shFire', r: 0.9, x: 0, z: 3.5, run: X => { X.audio && X.audio.tone && X.audio.tone(330, 0.8, 0.03, 'sine'); X.note('THE HEARTH', 'You warm your paws by the fire. Starlight drips down the crystal spire into the flames.'); } });
    doorSigns('OPERATIONS', 'THE SUMMIT \u00b7 NORTH', '#9fe8ff', 0, -HA + 0.3, 0); doorSigns('BERTH THREE', 'AIRLOCK \u00b7 YOUR SHIP', '#ffd23a', 0, HA - 0.3, Math.PI);
    sign(['ENGINEERING', 'THE BOILER \u00b7 WEST'], 3.2, 0.9, '#ff9a5a', -10.4, 3.9, 0, Math.PI / 2); sign(['THE BOARDWALK', 'FOX CINEMA \u00b7 SECURITY \u00b7 EAST'], 3.4, 0.9, '#ffd23a', 10.4, 3.9, 0, -Math.PI / 2); }

  // ---------- corridors (short, timber, lantern-lit) ----------
  for (const [x0, x1, z0, z1, ax] of [[-1.6, 1.6, -12.6, -10.2, 'z'], [-1.6, 1.6, 10.2, 12.6, 'z'], [-14.7, -10.6, -1.4, 1.4, 'x'], [10.6, 15.2, -1.4, 1.4, 'x']]) {
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; plane(w, d, floorM, cx, 0.008, cz, 0, -Math.PI / 2); B(w, 0.2, d, log2, cx, 3.5, cz);
    if (ax === 'z') { for (const s of [-1, 1]) B(0.3, 3.4, d, log, cx + s * (w / 2 + 0.15), 1.7, cz); } else for (const s of [-1, 1]) B(w, 3.4, 0.3, log, cx, 1.7, cz + s * (d / 2 + 0.15));
    glow(cx, 3.0, cz, 0xffcf8a, 1.6, 0.6); }

  // ---------- OPERATIONS · THE SUMMIT (N) ----------
  { const R = SH_ROOMS[0]; room(R, stoneM, log, toon('#2a1e14'), [['s', -1.6, 1.6]]);
    plane(16, 3.2, glass, 0, 3.0, R.z0 + 0.02); for (let i = 0; i <= 8; i++) B(0.2, 3.2, 0.24, log2, -8 + i * 2, 3.0, R.z0 + 0.06);
    CY(1.8, 2.0, 1.0, iron, 0, 0.5, -18.6, 6, g, true); circles.push([0, -18.6, 2.3]); const holo = Q(new THREE.IcosahedronGeometry(0.9, 2), toon('#eef6ff', { emissive: new THREE.Color('#9fe8ff'), emissiveIntensity: 0.35 }), 0, 1.9, -18.6); const hg = glow(0, 1.9, -18.6, 0x9fe8ff, 3, 0.4);
    const hr = Q(new THREE.TorusGeometry(1.5, 0.03, 4, 6), basic('#9fe8ff', 0.8, true), 0, 1.9, -18.6); hr.rotation.x = Math.PI / 2; holoRef = [holo, hr, hg]; anims.push(dt => { holo.rotation.y += dt * 0.3; hr.rotation.z += dt * 0.2; });
    spots.push({ key: 'shDockSpot', r: 1.1, x: 0, z: -18.6 + SH_GAMES.dock.theme.standZ, run: X => X.prompt('DOCKING CONTROL', 'The Summit \u00b7 Warden Aspen\u2019s board', [['TAKE THE WATCH', () => hooks.play && hooks.play('dock')], ['NOT NOW', null]]) });
    for (const s of [-1, 1]) { B(4.6, 1.0, 1.0, iron, s * 5.6, 0.5, -23.4, g, true); plane(4.2, 0.6, basic(s > 0 ? '#9fe8ff' : '#8fe38f', 0.85), s * 5.6, 1.15, -22.88, 0, -0.6); blocks.push([s * 5.6 - 2.3, s * 5.6 + 2.3, -24.6, -22.9]); }
    sign(['PASS WATCH', 'NORTH PASS \u00b7 STORM FRONT \u00b7 SLEDS HOLD'], 4.6, 1.1, '#9fe8ff', 0, 5.0, R.z0 + 0.25, 0);
    sign(['TO THE HEARTH'], 2.2, 0.6, '#ffd23a', 2.8, 3.3, R.z1 - 0.2, Math.PI); }

  // ---------- BERTH THREE (S): arrival, the airlock to your ship ----------
  { const R = SH_ROOMS[1]; room(R, stoneM, log, toon('#2a1e14'), [['n', -1.6, 1.6], ['w', 16, 19]]);
    const hatch = Q(new THREE.TorusGeometry(1.5, 0.28, 10, 32), toon('#ffd23a'), 0, 1.8, R.z1 - 0.1); void hatch; Q(new THREE.CircleGeometry(1.4, 32), toon('#3a3e46'), 0, 1.8, R.z1 - 0.06).rotation.y = Math.PI;
    const lamp = glow(1.9, 3.4, R.z1 - 0.3, 0xffb020, 1.4, 0.8); anims.push((dt, t) => { lamp.material.opacity = Math.floor(t * 2) % 2 ? 0.85 : 0.25; });
    sign(['AIRLOCK', 'YOUR SHIP IS DOCKED'], 2.6, 0.8, '#ffd23a', -3.4, 2.6, R.z1 - 0.2, Math.PI);
    B(2.6, 1.1, 1.0, log, 4.6, 0.55, 18.2, g, true); blocks.push([3.2, 6.0, 17.6, 18.8]); sign(['DOCKMASTER'], 1.4, 0.45, '#ffd23a', 4.6, 1.5, 17.68, Math.PI);
    for (let i = 0; i < 5; i++) { const x = -6.4, z = 15 + i * 0.6; B(0.08, 1.9, 0.1, toon(['#ec3013', '#2563eb', '#22c55e', '#ffd23a', '#f3f2f2'][i]), x + 0.2, 1.1, z); } B(0.3, 0.1, 3.2, log2, -6.6, 1.5, 16.2); sign(['SKI RACK'], 1.2, 0.4, '#f3f2f2', -6.82, 2.4, 16.2, Math.PI / 2);
    for (let i = 0; i < 10; i++) Q(new THREE.SphereGeometry(rr(0.2, 0.45), 8, 6), snow, rr(-5, 5), 0.02, rr(23.8, 25.6)).scale.y = 0.3;
    doorSigns('GLACIER LOUNGE', 'COCOA \u00b7 THE BIG WINDOW', '#ff8a6a', R.x0 + 0.2, 17.5, Math.PI / 2, -1);
    spots.push({ key: 'shLock', r: 1.4, x: 0, z: 24.4, run: X => X.prompt('SHASTA STATION \u00b7 BERTH THREE', 'Your ship is on the clamp, the other side of the airlock.', [['BACK TO YOUR SHIP \u00b7 SPACE', () => { X.audio && X.audio.tone && X.audio.tone(90, 1.6, 0.05, 'sawtooth', 1.5); if (hooks.nav) hooks.nav('Space Map.dc.html?from=shastaSt'); }], ['STAY ABOARD', null]]) }); }

  // ---------- ENGINEERING · THE BOILER (W) ----------
  const steam = []; { const R = SH_ROOMS[2], P0 = SH_GAMES.cond.at; room(R, stoneM, toon('#4a4a50'), toon('#22242a'), [['e', -1.4, 1.4]], [P0.x - P0.hw - 0.16, P0.x + P0.hw + 0.16, P0.z - P0.hd - 0.16, P0.z + P0.hd + 0.16]);
    const drum = CY(2.2, 2.2, 9, toon('#7a3a22'), -24, 2.6, -3.6, 24, g, true); drum.rotation.z = Math.PI / 2; for (const x of [-27.5, -24, -20.5]) { const b = CY(2.3, 2.3, 0.25, copper, x, 2.6, -3.6, 24); b.rotation.z = Math.PI / 2; }
    blocks.push([-28.8, -19.2, -6.2, -1.2]); for (const x of [-27, -21]) { CY(0.25, 0.25, 3.6, copper, x, 4.4 + 0.6, -3.6, 10); }
    const gauges = []; for (let i = 0; i < 3; i++) { const x = -26 + i * 2, gz = -1.25; Q(new THREE.CircleGeometry(0.34, 20), toon('#f3f2f2'), x, 3.0, gz); const nd = B(0.04, 0.3, 0.02, toon('#ec3013'), x, 3.1, gz + 0.02); gauges.push(nd); }
    anims.push((dt, t) => gauges.forEach((n, i) => { n.rotation.z = Math.sin(t * (0.7 + i * 0.3)) * 0.9; }));
    for (let i = 0; i < (LOW ? 4 : 8); i++) { const s = glow(-27 + (i % 2) * 6, 6, -3.6, 0xeef4ff, 1.6, 0.35); steam.push([s, rnd() * 3]); }
    spots.push({ key: 'shCondSpot', r: 1.1, x: SH_GAMES.cond.at.x, z: SH_GAMES.cond.at.z + SH_GAMES.cond.at.hd + 0.9, run: X => X.prompt('BOILER LINES', 'The Boiler \u00b7 Chief Alder', [['FIX THE LINES', () => hooks.play && hooks.play('cond')], ['NOT NOW', null]]) });
    anims.push((dt, t) => steam.forEach(([s, p]) => { steamBoost = Math.max(0, steamBoost - dt * 0.2); const k = (t * (0.4 + steamBoost * 0.6) + p) % 1; s.position.y = 5.2 + k * 1.0; s.material.opacity = 0.4 * (1 - k); s.scale.setScalar(1.2 + k * 1.6); }));
    for (let i = 0; i < 4; i++) { const z = 3 + i * 1.2; B(13, 0.22, 0.22, copper, -22.2, 1.2 + i * 0.5, R.z1 - 0.4); void z; }
    B(3.4, 1.0, 1.2, iron, -18.2, 0.5, 5.6, g, true); blocks.push([-19.9, -16.5, 5.0, 6.2]); plane(3.0, 0.6, basic('#ff9a5a', 0.85), -18.2, 1.1, 4.98, Math.PI, 0.6);
    sign(['THE BOILER', 'HOT SPRING STEAM \u00b7 KEEP CLEAR'], 4.6, 1.1, '#ff9a5a', -22.2, 5.2, R.z0 + 0.25, 0); sign(['TO THE HEARTH'], 2.2, 0.6, '#ffd23a', R.x1 - 0.2, 3.3, 2.8, -Math.PI / 2); }

  // ---------- THE BOARDWALK (E): a lamp-lit lodge street ----------
  { const R = SH_ROOMS[3]; room(R, floorM, log, toon('#1a2230'), [['w', -1.4, 1.4], ['s', 23.5, 26.5], ['n', 19, 42, 6.0]]);
    for (const x of [17, 21.5, 33, 37.5, 41]) { for (const z of [-5.6, 2.1]) { CY(0.07, 0.09, 3.2, iron, x, 1.6, z, 8); Q(new THREE.SphereGeometry(0.22, 10, 8), basic('#ffe0a0'), x, 3.3, z); glow(x, 3.3, z, 0xffcf8a, 1.8, 0.6); circles.push([x, z, 0.3]); } }
    for (let i = 0; i < 14; i++) Q(new THREE.SphereGeometry(rr(0.3, 0.7), 8, 6), snow, rr(16, 41), 0.02, rnd() < 0.5 ? -6.1 : 2.6).scale.y = 0.35;
    // fake night sky ceiling with snow falling (a painted ceiling)
    const sky = tex(canvas(512, 128, (c, w, h) => { c.fillStyle = '#0e1626'; c.fillRect(0, 0, w, h); for (let i = 0; i < 140; i++) { c.fillStyle = `rgba(255,255,255,${(0.3 + rnd() * 0.6).toFixed(2)})`; c.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); } }));
    plane(27, 9.5, new THREE.MeshBasicMaterial({ map: sky, toneMapped: false }), 28.5, 5.98, -1.75, 0, Math.PI / 2);
    if (!LOW) { const n = 160, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(15.5, 41.5); pos[i * 3 + 1] = rr(0, 6); pos[i * 3 + 2] = rr(-6.2, 2.8); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0.8, depthWrite: false })); g.add(pts);
      anims.push((dt, t) => { if (!g.visible) return; for (let i = 0; i < n; i++) { pos[i * 3 + 1] -= dt * 0.5; pos[i * 3] += Math.sin(t + i) * dt * 0.1; if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 6; } geo.attributes.position.needsUpdate = true; }); }
    // the cinema front (a wall until the real cinema loads; it builds its own front + marquee door)
    hooks.cinFallback = () => B(23, 6, 0.3, log, 30.5, 3, -6.65);
    const mq = sign(['FOX CINEMA', 'NOW SHOWING \u00b7 SPACE FOX II'], 6.2, 1.5, '#ffd23a', 26, 5.0, -6.3, 0, g, '#3a0a10'); void mq;
    const bulbs = []; for (let i = 0; i < 18; i++) { const b = Q(new THREE.SphereGeometry(0.07, 6, 4), basic('#ffe9a0'), 22.9 + i * 0.365, 5.82, -6.25); bulbs.push(b); } anims.push((dt, t) => bulbs.forEach((b, i) => b.material.color.setHex((Math.floor(t * 6) + i) % 3 ? 0xffe9a0 : 0x8a6a2a)));
    sign(['FOX CINEMA'], 1.3, 0.5, '#ffd23a', 23.0, 1.6, -6.3, 0);
    doorSigns('SECURITY', 'THE COLD WATCH', '#ff8a6a', 25, 2.85, Math.PI);
    sign(['THE BOARDWALK', 'SHASTA STATION'], 3.6, 0.9, '#9fe8ff', R.x1 - 0.2, 3.6, -1.75, -Math.PI / 2);
    sign(['TO THE HEARTH'], 2.2, 0.6, '#ffd23a', R.x0 + 0.2, 3.3, -3.2, Math.PI / 2); }

  // ---------- SECURITY · THE COLD WATCH (SE): the ICE CELL ----------
  let bot = null; { const R = SH_ROOMS[6]; room(R, stoneM, toon('#4a5060'), toon('#1e2228'), [['n', 23.5, 26.5]]);
    B(3.6, 1.1, 1.2, iron, 20.8, 0.55, 14.0, g, true); blocks.push([18.9, 22.7, 13.3, 14.7]); for (let i = 0; i < 4; i++) plane(1.2, 0.8, basic(['#9fe8ff', '#8fe38f', '#ffd23a', '#ec3013'][i], 0.8), 18.7 + i * 1.4, 2.6, R.z1 - 0.02, Math.PI);
    sign(['THE COLD WATCH', 'SECURITY \u00b7 SHASTA STATION'], 4.6, 1.1, '#ff8a6a', 27, 4.4, R.z1 - 0.2, Math.PI);
    spots.push({ key: 'shScanSpot', r: 1.1, x: SH_GAMES.scan.at.x, z: SH_GAMES.scan.at.z + 6.4 * 0.7 / 2 + 1.0, run: X => X.prompt('CARGO SCAN', 'The Cold Watch \u00b7 Marshal Frost', [['WORK THE BELT', () => hooks.play && hooks.play('scan')], ['NOT NOW', null]]) });
    // the ICE CELL: a hacked Fleet snowplow frozen in a block of Shasta ice
    const IC = { x: 33.6, z: 12.4 }; const blockI = B(3.0, 2.8, 3.0, ice, IC.x, 1.4, IC.z); void blockI; blocks.push([IC.x - 1.7, IC.x + 1.7, IC.z - 1.7, IC.z + 1.7]);
    bot = new THREE.Group(); bot.position.set(IC.x, 0.3, IC.z); bot.rotation.y = -Math.PI / 2; g.add(bot); const bm = toon('#e8b020'), bd = toon('#2a2a2e');
    B(1.2, 0.8, 1.6, bm, 0, 0.7, 0, bot); B(0.9, 0.6, 0.8, bm, 0, 1.4, -0.2, bot); for (const s of [-1, 1]) B(0.3, 0.4, 1.8, bd, s * 0.7, 0.2, 0, bot); B(1.8, 0.6, 0.12, toon('#c8ccd2'), 0, 0.4, 0.95, bot);
    const eye = Q(new THREE.SphereGeometry(0.12, 10, 8), basic('#ec3013'), 0, 1.5, 0.22, bot); const eg = glow(0, 1.5, 0.3, 0xec3013, 0.7, 0.8, bot);
    anims.push((dt, t) => { const clean = Math.sin(t * 0.9) > 0.92 || Math.sin(t * 3.7 + 1) > 0.985; eye.material.color.set(clean ? '#5fe3ff' : '#ec3013'); eg.material.color.set(clean ? '#5fe3ff' : '#ec3013'); });
    sign(['ICE CELL', 'FLEET UNIT 3-RIME \u00b7 DO NOT THAW'], 2.6, 0.8, '#9fe8ff', IC.x, 3.3, IC.z - 1.55, Math.PI);
    spots.push({ key: 'shIce', r: 1.5, x: IC.x - 2.4, z: IC.z - 0.4, run: X => { X.audio && X.audio.tone && X.audio.tone(196, 1.2, 0.03, 'triangle'); X.note('ICE CELL \u00b7 UNIT 3-RIME', '\u201CCold\u2026 quiet now. The other voice\u2026 cannot reach. Please. Keep me cold. Help us.\u201D'); try { X.save.setFlag('shBotHeard'); } catch (e) {} } }); }

  // ---------- GLACIER LOUNGE (SW): cocoa, armchairs, the big window ----------
  { const R = SH_ROOMS[7]; room(R, floorM, log, toon('#2a1e14'), [['e', 16, 19], ['w', 14, 25, 5.2], ['s', -21, -8, 4.6]]);
    plane(11, 5.2, glass, R.x0 - 0.1, 2.6, 19.5, Math.PI / 2); plane(13, 4.6, glass, -14.5, 2.3, R.z1 + 0.1, Math.PI); for (let i = 0; i <= 5; i++) { B(0.2, 5.2, 0.2, log2, R.x0 - 0.1, 2.6, 14 + i * 2.2); B(0.2, 4.6, 0.2, log2, -21 + i * 2.6, 2.3, R.z1 + 0.1); }
    B(5, 1.1, 1.1, log, -14.5, 0.55, 14.2, g, true); B(5.2, 0.12, 1.3, toon('#e8dcc0'), -14.5, 1.16, 14.2); blocks.push([-17.1, -11.9, 13.5, 14.9]);
    for (let i = 0; i < 3; i++) { const m = CY(0.12, 0.1, 0.18, toon(['#f3f2f2', '#b3121b', '#2f5d3a'][i]), -16 + i * 0.6, 1.3, 14.2, 10); void m; } const st = glow(-15.4, 1.6, 14.2, 0xffffff, 0.8, 0.35); anims.push((dt, t) => { st.position.y = 1.5 + ((t * 0.3) % 1) * 0.6; st.material.opacity = 0.35 * (1 - ((t * 0.3) % 1)); });
    sign(['COCOA', 'MARSHMALLOWS THE SIZE OF YOUR PAW'], 3.6, 0.9, '#ff8a6a', -14.5, 3.2, R.z0 + 0.2, 0);
    for (const [x, z, ry] of [[-19.4, 20, Math.PI / 2], [-19.4, 23.4, Math.PI / 2], [-12, 24, Math.PI], [-9, 24, Math.PI]]) { const ch = new THREE.Group(); ch.position.set(x, 0, z); ch.rotation.y = ry; g.add(ch); const pm = toon('#ffffff', { map: plaid }); B(1.2, 0.5, 1.1, pm, 0, 0.35, 0, ch, true); B(1.2, 0.9, 0.25, pm, 0, 0.9, 0.45, ch); for (const s of [-1, 1]) B(0.2, 0.7, 1.1, pm, s * 0.6, 0.6, 0, ch); circles.push([x, z, 0.8]); }
    CY(0.6, 0.6, 0.05, log2, -15.5, 0.6, 21.5, 16); CY(0.08, 0.1, 0.6, log2, -15.5, 0.3, 21.5, 8); circles.push([-15.5, 21.5, 0.7]);
    sign(['TO BERTH THREE'], 2.2, 0.6, '#ffd23a', R.x1 - 0.2, 3.3, 15, -Math.PI / 2); }

  // ---------- FOX CINEMA: the real cinema interior (minigames/cinema/snack-counter.js buildCinema), loaded on arrival ----------
  const CIN_O = { x: 26, z: -12 };
  async function loadCinema() { if (cinTried) return; cinTried = true;
    try { const m = await import(new URL('../minigames/cinema/snack-counter.js?v=s490', import.meta.url).href);
      const CTX = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; const [a, b] = [].concat(rep); t.repeat.set(a, b == null ? a : b); } return t; };
      cin = m.buildCinema({ THREE, M: K.M, toon: K.toon, canvasTex: CTX, scene: g, origin: CIN_O });
      for (const c of cin.colliders || []) { if (c.box) { const [x0, x1, z0, z1] = c.box; if (Math.abs(x0 - (CIN_O.x - 1.3)) < 0.01 && Math.abs(x1 - (CIN_O.x + 1.3)) < 0.01 && z0 > CIN_O.z + 5.5) continue; blocks.push([x0, x1, z0, z1]); } else if (c.c) circles.push(c.c); }
      hooks.cinReady && hooks.cinReady(cin); } catch (e) { console.warn('shasta cinema', e); hooks.cinFallback && hooks.cinFallback(); } }
  // NOW HIRING on the boardwalk, right of the cinema door: the snack shift opens in the panel (no world mode yet)
  { const hx = 29.6, hz = -5.2; CY(0.05, 0.05, 1.5, log2, hx - 0.5, 0.75, hz); CY(0.05, 0.05, 1.5, log2, hx + 0.5, 0.75, hz); sign(['NOW HIRING', 'SNACK COUNTER \u00b7 WALK UP'], 1.5, 0.9, '#ec3013', hx, 1.55, hz + 0.04, 0, g, '#f3f2f2');
    spots.push({ key: 'shHire', r: 1.1, x: hx, z: hz + 0.9, run: X => X.prompt('FOX CINEMA \u00b7 NOW HIRING', 'Reel needs paws on the snack counter before showtime.', [['YES, PUT ME TO WORK!', () => hooks.cinemaShift && hooks.cinemaShift()], ['GOODBYE', null]]) }); }

  // ---------- walking, camera, labels ----------
  const inHex = (x, z, m) => Math.abs(z) <= HA - m && S3 * Math.abs(x) + Math.abs(z) <= HR * S3 - 2 * m;
  const inR = (R, x, z, m) => x > R.x0 + m && x < R.x1 - m && z > R.z0 + m && z < R.z1 - m;
  function walk(x, z) { for (const [cx, cz, cr] of circles) if (Math.hypot(x - cx, z - cz) < cr) return false;
    for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false;
    if (inHex(x, z, 0.5)) return true; for (const R of SH_ROOMS) if (inR(R, x, z, 0.4)) return true;
    for (const [a, b, c, d] of DOORS) if (x > a && x < b && z > c && z < d) return true; return false; }
  let cur = null, pp = [0, 20];
  function tick(dt, t, px, pz) { pp = [px, pz]; if (inHex(px, pz, 0.2)) cur = 'hex'; else { const R = SH_ROOMS.find(q => inR(q, px, pz, 0.1)); if (R) cur = R; }
    if (!cinTried) loadCinema(); if (cin && cin.update) cin.update(dt, { movie: true }); }
  function clampCam(v) { if (cur === 'hex' || !cur) { v.y = Math.min(v.y, 8.4); let k = 1; for (let i = 0; i < 8 && !inHex(v.x, v.z, 0.7); i++) { k *= 0.92; v.x = v.x * 0.92; v.z = v.z * 0.92; } return; }
    const R = cur; v.x = Math.min(R.x1 - 0.4, Math.max(R.x0 + 0.4, v.x)); v.z = Math.min(R.z1 - 0.4, Math.max(R.z0 + 0.4, v.z)); v.y = Math.min(v.y, R.h - 0.4); }
  function label(x, z) { const R = inHex(x, z, 0) ? null : SH_ROOMS.find(q => inR(q, x, z, 0)); const n = R ? R.name : 'THE HEARTH'; return 'Shasta Station \u00b7 ' + n.toLowerCase().replace(/(^|\s)\S/g, s => s.toUpperCase()); }
  return { g, anims, walk, clampCam, label, tick, spots, hooks, blocks, circles, loadCinema, setHolo(v) { for (const o of holoRef) o.visible = v; }, surge(t = 2.6) { steamBoost = Math.max(steamBoost, t); }, vent() { steamBoost = 3; }, get cinema() { return cin; } };
}
