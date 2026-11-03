// GAYA STATION [dsfOutGa] (s493): Gaya's own station, inside the two stacked rings with the hanging gardens. Built far away at
// (OX, 0, 0), only shown while you are aboard (Deep Space Fox.dc.html?at=gaya, from the Space Map dock). A temple cloister in orbit:
// THE CLOISTER in the middle (a garden open to the stars, white columns with gold caps, a roofed walk with hanging gardens on its
// edge, lilac banners, lantern-lined paths, and THE FIRST FLAME on its pedestal at the centre; the upper ring floats overhead),
// and off it: OPERATIONS · THE BELL TOWER (N), SECURITY · THE CRYSTAL WARD (E: a Fleet unit held in a ring of humming crystals),
// ENGINEERING · THE RESONANCE CORE (W), BERTH FIVE (S, arrival + airlock), THE CANDLE WORKS (NW), THE TEA HOUSE (SE, Kyoto red
// lacquer), THE BATH HOUSE (SW, steam + incense). Gaya glows violet below.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const LILAC = '#b98ad8', VIOLET = '#6a3a9a', GOLD = '#e6b45a', STONEW = '#ece6dc', CRYS = '#9fe8ff', LACQ = '#b3121b';
export const GA = { OX: 34000, hw: 31, hd: 30, h: 12, door: { x: 999, z: 999 }, enter: { x: 0, z: 20.5 } };
export const GA_ROOMS = [
  { k: 'cloister', x0: -13, x1: 13, z0: -13, z1: 13, h: 11.5, name: 'THE CLOISTER' },
  { k: 'ops', x0: -6, x1: 6, z0: -27, z1: -13, h: 8.6, name: 'OPERATIONS', sub: 'THE BELL TOWER \u00b7 WARDEN HEATHER' },
  { k: 'sec', x0: 13, x1: 29, z0: -8, z1: 8, h: 5.6, name: 'SECURITY', sub: 'THE CRYSTAL WARD \u00b7 BROTHER SLATE' },
  { k: 'eng', x0: -29, x1: -13, z0: -8, z1: 8, h: 6.4, name: 'ENGINEERING', sub: 'THE RESONANCE CORE \u00b7 CHIEF THISTLE' },
  { k: 'berth', x0: -6, x1: 6, z0: 13, z1: 27, h: 5.6, name: 'BERTH FIVE', sub: 'GARDEN DOCK \u00b7 DOCKMASTER SAGE' },
  { k: 'candle', x0: -22, x1: -8, z0: -27, z1: -13, h: 5.6, name: 'THE CANDLE WORKS', sub: 'DIPPING VATS \u00b7 CHANDLER WICK' },
  { k: 'tea', x0: 8, x1: 22, z0: 13, z1: 27, h: 5.2, name: 'THE TEA HOUSE', sub: 'KYOTO TEA \u00b7 KEEPER TOMOE' },
  { k: 'bath', x0: -22, x1: -8, z0: 13, z1: 27, h: 5.6, name: 'THE BATH HOUSE', sub: 'STEAM + INCENSE \u00b7 LAVENDER' }];
const DOORS = [[-1.5, 1.5, -13.7, -12.3], [-1.5, 1.5, 12.3, 13.7], [12.3, 13.7, -1.5, 1.5], [-13.7, -12.3, -1.5, 1.5], [-11.5, -8.5, -13.7, -12.3], [8.5, 11.5, 12.3, 13.7], [-11.5, -8.5, 12.3, 13.7]];
const L1 = t => [{ who: 'npc', text: t }];
const T = (label, ...r) => ({ label, replies: r.map(text => ({ who: 'npc', text })) });
const F = (a, b, tip = '#ffffff', paw) => ({ fur: { tailA: a, tailB: b, tailTip: tip, paw: paw || b }, faceCols: { furA: a, furB: b } });
// the people aboard (every box 20 words or less; names DRAFT for Ben)
export const GA_NPCS = [
  { key: 'gsHeather', at: [-2.6, -20.2], look: [0, -19], outfit: 'robe', g: { name: 'WARDEN HEATHER', title: 'Gaya Station, The Bell Tower', torso: ['#6a3a9a', '#4a2470', '#22103a'], ...F('#e8dcef', '#a88ac0'), greeting: 'Welcome to the Bell Tower, pilot. We ring it for every ship that comes home.',
    lines: [{ who: 'player', text: 'Warden.' }, { who: 'npc', text: 'Gaya Station. A garden, a flame, and a bell. The church built it to watch the crystal lanes.' }],
    topics: [T('What do you watch for?', 'Crystal haulers from the gorge. And lately, Fleet ships that ring no bell and answer no hail.'),
      T('Any trouble out there?', 'One Fleet unit came aboard and stood by the Flame for an hour. Brother Slate keeps it now.')] } },
  { key: 'gsRue', at: [4.2, -24.4], look: [4.2, -27], outfit: 'suit', g: { name: 'ENSIGN RUE', title: 'Gaya Station, Lane Watch', torso: ['#3a3f4a', '#262a32', '#141619'], ...F('#d8c8e8', '#9a7ab8'),
    lines: L1('Incense from the bath house drifts onto my scopes every evening. The whole plot smells of lavender.') } },
  { key: 'gsViola', at: [2.6, 3.2], look: [0, 0], outfit: 'robe', g: { name: 'SISTER VIOLA', title: 'Keeper of the First Flame', torso: ['#f3efe4', '#d8d0c0', '#8a7a5a'], ...F('#efe6f4', '#b8a0cc'),
    lines: L1('We dreamt of you for nine nights, little one. The Flame leaned toward you when you walked in.'),
    topics: [T('The First Flame?', 'Lit when the first gate opened. A spark of it burns in every temple on every world.', 'This one came up the tether in a glass lamp. It has never gone out.')] } },
  { key: 'gsSlate', at: [16.2, -6.0], look: [21, -5], outfit: 'armor', g: { name: 'BROTHER SLATE', title: 'Security, The Crystal Ward', torso: ['#4a4e5a', '#2e323c', '#16181e'], ...F('#d8dce4', '#8a90a0'),
    lines: L1('Quiet in the Ward. The crystals are singing, and the one inside is listening.'),
    topics: [T('Who is in the ward?', 'A Fleet unit. Inside the crystal ring, the hum drowns the other voice. Then it talks like itself.')] } },
  { key: 'gsThistle', at: [-16.4, -5.6], look: [-21, -4], outfit: 'vest', g: { name: 'CHIEF THISTLE', title: 'Engineering, The Resonance Core', torso: ['#3a4a6a', '#26324a', '#121826'], ...F('#e0d8ea', '#9a8ab4'),
    lines: L1('One crystal from the gorge, tuned to one note. It powers the lights, the bell, and the garden lamps.'),
    topics: [T('How do you tune it?', 'Tuning forks, patience, and never humming along. Brother Slate hums along. I have asked him not to.')] } },
  { key: 'gsSage', at: [3.6, 16.6], look: [0, 18], outfit: 'coat', g: { name: 'DOCKMASTER SAGE', title: 'Berth Five, Garden Dock', torso: ['#4a6a3a', '#2e4a26', '#162612'], ...F('#e8e0d4', '#a89a84'),
    lines: L1('Your ship is clamped. Wipe your paws, the garden gets cross about mud. Truly. It grows thorns.') } },
  { key: 'gsWick', at: [-15, -16.4], look: [-15, -20], outfit: 'vest', g: { name: 'CHANDLER WICK', title: 'The Candle Works', torso: ['#8a5a3a', '#5a3a22', '#2a1a10'], ...F('#f0e2c8', '#c0a07a'),
    lines: L1('Dip, cool, dip again. Forty dips for a temple candle. Every temple on every world burns mine.') } },
  { key: 'gsTomoe', at: [15, 23.4], look: [15, 20], outfit: 'dress', g: { name: 'KEEPER TOMOE', title: 'The Tea House', torso: ['#b3121b', '#7a0c12', '#3a0608'], ...F('#f2e6da', '#c09a7a'),
    lines: L1('Kyoto tea, brewed slowly. Kneel, breathe, wait for the steam to stop dancing. Then drink.') } },
  { key: 'gsLavender', at: [-12.2, 16.4], look: [-15, 20], outfit: 'robe', g: { name: 'LAVENDER', title: 'Keeper of the Bath House', torso: ['#b98ad8', '#8a5aa8', '#4a2a5a'], ...F('#f4ecf8', '#c8b0dc'),
    lines: L1('The water comes up hot from Gaya\u2019s springs. Sit. The incense does the rest.') } }];
// s493 the station console games, Gaya versions (engines: dsf-docking / dsf-cargo-scan / dsf-conduit, opts.theme)
export const GA_GAMES = {
  dock: { at: { x: 0, z: -19 }, y: 1.5, theme: { title: 'DOCKING CONTROL', where: 'The Bell Tower \u00b7 WARDEN HEATHER', kicker: 'Gaya Station \u00b7 Warden Heather', cardTitle: 'Docking Control',
    body: 'Drag each ship to the berth in its colour. A cloud of temple incense drifts across the plot: route every ship round it.', holo: '#c8a0ff', holoRgb: '200,160,255', bg: 'rgba(16,8,24,0.88)',
    tags: { shuttle: 'PILGRIM', freighter: 'CRYSTAL', tug: 'CANDLE' }, watchNames: ['Morning bell', 'Crystal haul', 'Pilgrim run', 'Evening bell'], stat: 'gsDock', pw: 5.2, maxD: 3.5, maxY: 5.6, standZ: 3.6,
    storm: { r: 14, speed: 5 }, hazardWord: 'SMOKED', hazardNote: ' flew into the incense.' } },
  scan: { at: { x: 21, z: 2.6 }, y: 1.0, theme: { title: 'CARGO SCAN', where: 'The Crystal Ward \u00b7 BROTHER SLATE', kicker: 'The Crystal Ward \u00b7 Brother Slate', cardTitle: 'Cargo Scan',
    body: 'Tap any crate with a shape not on the manifest, before the red line. Crates with the red FLEET mark: hold those too. Never destroy them.',
    names: { drum: 'INCENSE JAR', sack: 'ROBES', tin: 'TEA TIN', ring: 'PRAYER BELL', plate: 'MIRROR', bulb: 'LANTERN', crystal: 'GORGE CRYSTAL', rod: 'CANDLES' }, dockNames: ['Berth Five', 'Crystal hauler 4', 'Pilgrim ferry', 'Kyoto packet'],
    fleet: 0.16, stat: 'gsScan', scan: '#c8a0ff', scanRgb: '200,160,255', idleTitle: 'CARGO SCAN \u00b7 THE CRYSTAL WARD' } },
  cond: { at: { x: -21, z: 3.6, hw: 2.32, hd: 1.66 }, theme: { title: 'RESONANCE LINES', where: 'The Resonance Core \u00b7 CHIEF THISTLE', kicker: 'The Resonance Core \u00b7 Chief Thistle', cardTitle: 'Resonance Lines', deck: 'RESONANCE LINES', deckSub: 'TUNED CRYSTAL \u00b7 DO NOT HUM', amber: '#c8a0ff',
    body: 'Tap a pipe to turn it. Join each line from its inlet on the left to its outlet on the right. The core rings louder while you work: finish before it shatters.',
    lines: [{ key: 'light', name: 'CRYSTAL LIGHT', dim: '#1e4a6a', ink: '#9fe8ff', spark: '#e6faff' }, { key: 'steam', name: 'SPRING STEAM', dim: '#4a4e56', ink: '#e8eef4', spark: '#ffffff' }, { key: 'incense', name: 'INCENSE', dim: '#3a2a52', ink: '#c8a0ff', spark: '#f0e6ff' }],
    sysNames: ['Garden lamps', 'The bell', 'Bath house springs', 'Berth Five clamp'], stat: 'gsCond', heat: [2.0, 2.8, 3.4, 4.0] } } };

export function buildGayaSt(K) {
  const { THREE, scene, glowSprite, rnd, rr, LOW } = K;
  const g = new THREE.Group(); g.position.set(GA.OX, 0, 0); g.visible = false; scene.add(g);
  const anims = [], blocks = [], circles = [], spots = [], hooks = {}; let holoRef = [], boost = 0;
  const tex = (c, rx, ry) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); } return t; };
  const toon = (c, x) => K.toon(c, x), basic = (c, o, a) => K.basic(c, o, a);
  const Q = (geo, mat, x, y, z, p = g, cast = false) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast && !LOW; m.receiveShadow = true; p.add(m); return m; };
  const B = (w, h, d, mat, x, y, z, p, cast) => Q(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p, cast);
  const CY = (r1, r2, h, mat, x, y, z, seg = 16, p, cast) => Q(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, cast);
  const glow = (x, y, z, c, s, o = 0.6, p = g) => glowSprite(x, y, z, c, s, o, p);
  const plane = (w, h, mat, x, y, z, ry = 0, rx = 0, p = g) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; p.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry, p = g, bg = '#1a1024') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, Hh) => { c.fillStyle = bg; c.fillRect(0, 0, W, Hh); c.strokeStyle = fg; c.lineWidth = 12; c.strokeRect(6, 6, W - 12, Hh - 12); const n = lines.length, lh = Hh * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.66 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, Hh * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry, 0, p); };
  const stoneW = toon(STONEW), gold = toon(GOLD), violet = toon(VIOLET), lilac = toon(LILAC), dark = toon('#22182c'), leaf = toon('#3f7a3a'), leaf2 = toon('#2e5d2a');
  const glass = basic('#e6d8ff', 0.1), crysM = toon(CRYS, { emissive: new THREE.Color('#5fb8ff'), emissiveIntensity: 0.5, transparent: true, opacity: 0.85 });
  const flagT = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#e8e2d6'; c.fillRect(0, 0, w, w); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#ddd6c8' : '#f0eadf'; c.fillRect(x * 64 + 2, y * 64 + 2, 60, 60); } c.strokeStyle = 'rgba(230,180,90,0.5)'; c.lineWidth = 3; c.strokeRect(1, 1, w - 2, w - 2); }), 8, 8);
  const lawnT = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#4a8a3e'; c.fillRect(0, 0, w, w); for (let i = 0; i < 900; i++) { c.fillStyle = ['#3e7a34', '#58984a', '#447e3a'][i % 3]; c.fillRect(rnd() * w, rnd() * w, 2, 5); } }), 6, 6);
  const tatT = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#c8b880'; c.fillRect(0, 0, w, w); for (let i = 0; i < w; i += 4) { c.fillStyle = i % 8 ? 'rgba(120,100,50,0.15)' : 'rgba(120,100,50,0.3)'; c.fillRect(0, i, w, 2); } c.fillStyle = '#2a4a2a'; c.fillRect(0, 0, w, 8); c.fillRect(0, w - 8, w, 8); }), 4, 4);
  const floorM = toon('#ffffff', { map: flagT }), lawnM = toon('#ffffff', { map: lawnT }), tatM = toon('#ffffff', { map: tatT }), wallM = toon('#e0d8ca'), wallV = toon('#4a2e64');

  // ---------- outside: stars, the upper ring overhead, GAYA (violet mountains, blue crystal) below ----------
  { const st = tex(canvas(2048, 1024, (c, w, h) => { c.fillStyle = '#07040c'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { c.fillStyle = `rgba(${230 + (rnd() * 25 | 0)},${210 + (rnd() * 45 | 0)},255,${(0.25 + rnd() * 0.75).toFixed(2)})`; const s = rnd() < 0.06 ? 2.6 : 1.3; c.fillRect(rnd() * w, rnd() * h * 0.62, s, s); }
      for (const [x, y, r, col] of [[0.3, 0.2, 420, '185,138,216'], [0.75, 0.32, 360, '120,180,255']]) { const ng = c.createRadialGradient(w * x, h * y, 10, w * x, h * y, r); ng.addColorStop(0, `rgba(${col},0.2)`); ng.addColorStop(1, `rgba(${col},0)`); c.fillStyle = ng; c.fillRect(0, 0, w, h); } }));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.MeshBasicMaterial({ map: st, side: THREE.BackSide, toneMapped: false, depthWrite: false })));
    const pl = tex(canvas(1024, 512, (c, w, h) => { c.fillStyle = '#7a5a9a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { const x = rnd() * w, y = rnd() * h, s = 10 + rnd() * 36; c.fillStyle = ['rgba(232,220,239,0.6)', 'rgba(74,46,100,0.5)', 'rgba(185,138,216,0.5)'][i % 3]; c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * 0.8, y + s * 0.5); c.lineTo(x - s * 0.8, y + s * 0.5); c.fill(); }
      c.fillStyle = 'rgba(159,232,255,0.8)'; for (let i = 0; i < 40; i++) c.fillRect(rnd() * w, rnd() * h, 3, 6); c.fillStyle = 'rgba(230,180,90,0.7)'; for (let i = 0; i < 20; i++) { c.beginPath(); c.arc(rnd() * w, rnd() * h, 2, 0, 7); c.fill(); } }));
    const planet = new THREE.Mesh(new THREE.SphereGeometry(520, 48, 32), new THREE.MeshBasicMaterial({ map: pl, toneMapped: false })); planet.position.set(0, -620, 0); g.add(planet); anims.push(dt => { planet.rotation.y += dt * 0.004; });
    const haze = new THREE.Mesh(new THREE.SphereGeometry(540, 48, 32), new THREE.MeshBasicMaterial({ color: '#c8a0ff', transparent: true, opacity: 0.16, side: THREE.BackSide, toneMapped: false, depthWrite: false })); haze.position.copy(planet.position); g.add(haze);
    // the upper stacked ring floating above the open garden, its hanging gardens trailing down
    const up = new THREE.Group(); up.position.y = 46; g.add(up); const ur = new THREE.Mesh(new THREE.TorusGeometry(34, 2.6, 8, 48), toon('#e0d8ca')); ur.rotation.x = Math.PI / 2; up.add(ur);
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; const v = Q(new THREE.ConeGeometry(1.0, 7, 6), leaf, Math.cos(a) * 34, -5, Math.sin(a) * 34, up); v.rotation.x = Math.PI; } for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; glow(Math.cos(a) * 34, -1, Math.sin(a) * 34, 0xffcf7a, 4, 0.6, up); }
    anims.push(dt => { up.rotation.y += dt * 0.02; }); }

  // ---------- generic room ----------
  function room(R, fm, wm, cm, gaps = [], hole = null) { const { x0, x1, z0, z1, h } = R, w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (!hole) plane(w, d, fm, cx, 0.005, cz, 0, -Math.PI / 2); else { const [a, b, c2, d2] = hole; for (const [p, q, r2, s2] of [[x0, x1, z0, c2], [x0, x1, d2, z1], [x0, a, c2, d2], [b, x1, c2, d2]]) if (q - p > 0.01 && s2 - r2 > 0.01) plane(q - p, s2 - r2, fm, (p + q) / 2, 0.005, (r2 + s2) / 2, 0, -Math.PI / 2); }
    if (cm) B(w, 0.2, d, cm, cx, h + 0.1, cz);
    const side = (s, a0, a1, fixed) => { const gs = gaps.filter(q => q[0] === s).sort((p, q) => p[1] - q[1]); let a = a0; const put = (u0, u1, y0, y1) => { if (u1 - u0 < 0.05 || y1 - y0 < 0.05) return; const L = u1 - u0, m = (u0 + u1) / 2, hh = y1 - y0; if (s === 'n' || s === 's') B(L, hh, 0.3, wm, m, y0 + hh / 2, fixed); else B(0.3, hh, L, wm, fixed, y0 + hh / 2, m); };
      for (const [, b0, b1, gh = 3.2] of gs) { put(a, b0, 0, h); put(b0, b1, gh, h); a = b1; } put(a, a1, 0, h); };
    side('n', x0, x1, z0 - 0.15); side('s', x0, x1, z1 + 0.15); side('w', z0, z1, x0 - 0.15); side('e', z0, z1, x1 + 0.15); }
  // a temple door: gold frame + lilac curtain swags; big sign above, eye-level sign beside (ry = the way the sign faces)
  function tdoor(x, z, ry, big, sub, fg, side = 1) { const nx = Math.sin(ry), nz = Math.cos(ry), tx = Math.cos(ry), tz = -Math.sin(ry), px = x + nx * 0.2, pz = z + nz * 0.2;
    for (const s of [-1, 1]) B(0.22, 3.3, 0.22, gold, px + tx * s * 1.55, 1.65, pz + tz * s * 1.55); const lt = B(3.4, 0.24, 0.24, gold, px, 3.3, pz); lt.rotation.y = ry;
    sign([big, sub], 4.0, 0.95, fg, px + nx * 0.05, 4.3, pz + nz * 0.05, ry); sign([big], 1.3, 0.5, fg, px + tx * 2.5 * side + nx * 0.05, 1.6, pz + tz * 2.5 * side + nz * 0.05, ry); }

  // ---------- THE CLOISTER (centre): garden open to the stars, colonnade walk, THE FIRST FLAME ----------
  { const R = GA_ROOMS[0]; room(R, lawnM, wallM, null, [['n', -1.5, 1.5, 3.4], ['n', -11.5, -8.5, 3.4], ['s', -1.5, 1.5, 3.4], ['s', 8.5, 11.5, 3.4], ['s', -11.5, -8.5, 3.4], ['e', -1.5, 1.5, 3.4], ['w', -1.5, 1.5, 3.4]]);
    // the walk under the roof (flagstones) round the garden + the four paths in to the Flame
    for (const [w, d, x, z] of [[26, 3, 0, -11.5], [26, 3, 0, 11.5], [3, 20, -11.5, 0], [3, 20, 11.5, 0], [2.4, 20, 0, 0], [20, 2.4, 0, 0]]) plane(w, d, floorM, x, 0.012, z, 0, -Math.PI / 2);
    for (const [w, d, x, z] of [[26, 3, 0, -11.5], [26, 3, 0, 11.5], [3, 20, -11.5, 0], [3, 20, 11.5, 0]]) B(w, 0.3, d, toon('#3a2a4a'), x, 4.65, z);
    for (const [w, d, x, z] of [[26.4, 0.3, 0, -10.0], [26.4, 0.3, 0, 10.0], [0.3, 20, -10.0, 0], [0.3, 20, 10.0, 0]]) B(w, 0.4, d, gold, x, 4.95, z);
    // columns with gold caps + lilac banners; hanging gardens off the roof edge
    for (let i = -2; i <= 2; i++) for (const [x, z] of [[i * 5, -10], [i * 5, 10], [-10, i * 5], [10, i * 5]]) { if (i === 0) continue; CY(0.32, 0.36, 4.5, stoneW, x, 2.25, z, 12); CY(0.48, 0.4, 0.3, gold, x, 4.4, z, 12); circles.push([x, z, 0.5]);
      if ((i + 2) % 2 === 0) { const bn = plane(0.9, 2.4, basic(LILAC, 0.95), x * 0.97, 3.0, z * 0.97, Math.atan2(-x, -z)); bn.material.side = THREE.DoubleSide; } }
    const vines = []; for (let k = 0; k < 40; k++) { const t = k / 40 * 4, s = Math.floor(t), f = t - s, x = s === 0 ? -10 + f * 20 : s === 1 ? 10 : s === 2 ? 10 - f * 20 : -10, z = s === 0 ? -10 : s === 1 ? -10 + f * 20 : s === 2 ? 10 : 10 - f * 20;
      const v = Q(new THREE.ConeGeometry(0.28, rr(1.0, 2.2), 5), rnd() < 0.5 ? leaf : leaf2, x, 4.0, z); v.rotation.x = Math.PI; vines.push([v, rnd() * 6]); if (rnd() < 0.4) Q(new THREE.SphereGeometry(0.1, 6, 4), basic(rnd() < 0.5 ? LILAC : '#ffffff'), x, 3.4, z); }
    anims.push((dt, t) => vines.forEach(([v, p]) => { v.rotation.z = Math.sin(t * 0.6 + p) * 0.06; }));
    // flower beds in the four garden squares (step round them; the lawn is yours)
    for (const [x, z] of [[-5.5, -5.5], [5.5, -5.5], [-5.5, 5.5], [5.5, 5.5]]) { B(4.2, 0.3, 4.2, toon('#6a4a2a'), x, 0.15, z); for (let i = 0; i < 18; i++) Q(new THREE.SphereGeometry(rr(0.14, 0.24), 6, 4), basic([LILAC, '#e6d0f4', '#ffffff', '#8a5ab8'][i % 4]), x + rr(-1.8, 1.8), 0.42, z + rr(-1.8, 1.8)); blocks.push([x - 2.1, x + 2.1, z - 2.1, z + 2.1]); }
    // lanterns along the paths
    for (const v of [-7.4, -3.4, 3.4, 7.4]) for (const [x, z] of [[v, 1.6], [v, -1.6], [1.6, v], [-1.6, v]]) { CY(0.05, 0.06, 1.3, gold, x, 0.65, z, 6); Q(new THREE.SphereGeometry(0.16, 8, 6), basic('#ffe0a0'), x, 1.35, z); glow(x, 1.35, z, 0xffcf7a, 1.2, 0.55); circles.push([x, z, 0.22]); }
    // THE FIRST FLAME
    CY(1.3, 1.6, 0.5, stoneW, 0, 0.25, 0, 20, g, true); CY(0.5, 0.7, 1.2, stoneW, 0, 1.1, 0, 16, g, true); CY(0.8, 0.5, 0.3, gold, 0, 1.85, 0, 16); circles.push([0, 0, 1.9]);
    const fl = []; for (let i = 0; i < 5; i++) { const f = Q(new THREE.ConeGeometry(0.22 - i * 0.02, 0.9 - i * 0.08, 7), basic(i % 2 ? '#ffd23a' : '#ff8a2a', 0.92, true), rr(-0.12, 0.12), 2.4, rr(-0.12, 0.12)); fl.push([f, rnd() * 6]); }
    const fg = glow(0, 2.5, 0, 0xffb040, 4, 0.75); const flame = new THREE.PointLight(0xffb060, LOW ? 1.0 : 1.8, 14, 1.6); flame.position.set(0, 2.8, 0); g.add(flame);
    anims.push((dt, t) => { fl.forEach(([f, p]) => { f.scale.y = 0.85 + 0.3 * Math.sin(t * 8 + p); f.position.y = 2.2 + f.scale.y * 0.3; }); fg.material.opacity = 0.65 + 0.1 * Math.sin(t * 11); flame.intensity = (LOW ? 1.0 : 1.8) * (0.92 + 0.08 * Math.sin(t * 15)); });
    sign(['THE FIRST FLAME', 'LIT WHEN THE FIRST GATE OPENED'], 2.6, 0.7, GOLD, 0, 0.8, 1.62, 0);
    spots.push({ key: 'gsFlame', r: 0.9, x: 0, z: 2.6, run: X => { X.audio && X.audio.tone && X.audio.tone(392, 1.4, 0.03, 'sine', 0.5); X.note('THE FIRST FLAME', 'The flame leans toward you, just a little. Somewhere, a bell answers.'); } });
    tdoor(0, -13, 0, 'THE BELL TOWER', 'OPERATIONS', LILAC); tdoor(-10, -13, 0, 'THE CANDLE WORKS', 'DIPPING VATS', GOLD, -1); tdoor(0, 13, Math.PI, 'BERTH FIVE', 'AIRLOCK \u00b7 YOUR SHIP', '#ffd23a');
    tdoor(10, 13, Math.PI, 'THE TEA HOUSE', 'KYOTO TEA', '#ff6a5a', -1); tdoor(-10, 13, Math.PI, 'THE BATH HOUSE', 'STEAM + INCENSE', LILAC); tdoor(13, 0, -Math.PI / 2, 'THE CRYSTAL WARD', 'SECURITY', CRYS); tdoor(-13, 0, Math.PI / 2, 'THE RESONANCE CORE', 'ENGINEERING', CRYS);
    sign(['GAYA STATION', 'THE CLOISTER \u00b7 WALK GENTLY'], 5.4, 1.3, GOLD, 6.5, 7.2, -12.8, 0); }

  // ---------- OPERATIONS · THE BELL TOWER (N) ----------
  { const R = GA_ROOMS[1]; room(R, floorM, wallV, toon('#22182c'), [['s', -1.5, 1.5, 3.4]]);
    plane(10, 3.6, glass, 0, 3.4, R.z0 + 0.02); for (let i = 0; i <= 5; i++) B(0.22, 3.6, 0.26, gold, -5 + i * 2, 3.4, R.z0 + 0.06);
    const bell = new THREE.Group(); bell.position.set(0, 7.6, -20); g.add(bell); Q(new THREE.CylinderGeometry(0.5, 1.2, 1.6, 20, 1, true), toon('#b8862a', { side: THREE.DoubleSide }), 0, -0.8, 0, bell); Q(new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#b8862a'), 0, 0, 0, bell); Q(new THREE.SphereGeometry(0.18, 8, 6), toon('#6a4a1a'), 0, -1.5, 0, bell); B(4, 0.3, 0.3, toon('#3a2414'), 0, 0.45, 0, bell);
    anims.push((dt, t) => { bell.rotation.z = Math.sin(t * 0.8) * 0.04 + boost * 0.02 * Math.sin(t * 6); });
    CY(1.8, 2.0, 1.0, violet, 0, 0.5, -19, 8, g, true); circles.push([0, -19, 2.3]);
    const holo = new THREE.Group(); holo.position.set(0, 1.5, -19); g.add(holo); Q(new THREE.SphereGeometry(0.7, 20, 14), toon('#b98ad8', { emissive: new THREE.Color('#6a3a9a'), emissiveIntensity: 0.3 }), 0, 0.4, 0, holo); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; Q(new THREE.OctahedronGeometry(0.12, 0), crysM, Math.cos(a) * 1.1, 0.4, Math.sin(a) * 1.1, holo); }
    const hg = glow(0, 1.9, -19, 0xc8a0ff, 3, 0.35); holoRef = [holo, hg]; anims.push(dt => { holo.rotation.y += dt * 0.3; });
    spots.push({ key: 'gsDockSpot', r: 1.1, x: 0, z: GA_GAMES.dock.at.z + GA_GAMES.dock.theme.standZ, run: X => X.prompt('DOCKING CONTROL', 'The Bell Tower \u00b7 Warden Heather\u2019s board', [['TAKE THE WATCH', () => hooks.play && hooks.play('dock')], ['NOT NOW', null]]) });
    B(4.2, 1.0, 1.0, dark, -3.6, 0.5, -25.6, g, true); blocks.push([-5.7, -1.5, -26.2, -25.0]); plane(3.6, 0.6, basic('#c8a0ff', 0.85), -3.6, 1.15, -25.08, 0, -0.6);
    sign(['THE BELL TOWER', 'CRYSTAL LANES \u00b7 ALL BELLS RUNG'], 4.6, 1.1, LILAC, 0, 5.6, R.z0 + 0.25, 0); }

  // ---------- SECURITY · THE CRYSTAL WARD (E) ----------
  { const R = GA_ROOMS[2]; room(R, floorM, wallV, toon('#22182c'), [['w', -1.5, 1.5, 3.4]]);
    spots.push({ key: 'gsScanSpot', r: 1.1, x: GA_GAMES.scan.at.x, z: GA_GAMES.scan.at.z + 6.4 * 0.7 / 2 + 1.0, run: X => X.prompt('CARGO SCAN', 'The Crystal Ward \u00b7 Brother Slate', [['WORK THE BELT', () => hooks.play && hooks.play('scan')], ['NOT NOW', null]]) });
    const WD = { x: 22, z: -4.8 }; const crys = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, c = Q(new THREE.OctahedronGeometry(0.42, 0), crysM, WD.x + Math.cos(a) * 1.9, 1.0, WD.z + Math.sin(a) * 1.9); c.scale.y = 2.2; crys.push(c); CY(0.3, 0.36, 0.3, gold, WD.x + Math.cos(a) * 1.9, 0.15, WD.z + Math.sin(a) * 1.9, 8); } circles.push([WD.x, WD.z, 2.3]);
    const hum = glow(WD.x, 1.2, WD.z, 0x9fe8ff, 4.2, 0.3); anims.push((dt, t) => { crys.forEach((c, i) => { c.rotation.y += dt * 0.4; c.position.y = 1.0 + Math.sin(t * 2 + i) * 0.06; }); hum.material.opacity = 0.25 + 0.1 * Math.sin(t * 3); });
    const bot = new THREE.Group(); bot.position.set(WD.x, 0, WD.z); g.add(bot); const bm = toon('#c8ccd2'), bd = toon('#2a2a2e'); B(0.7, 1.0, 0.5, bm, 0, 0.9, 0, bot); Q(new THREE.SphereGeometry(0.32, 12, 8), bm, 0, 1.65, 0, bot); for (const s of [-1, 1]) B(0.14, 0.5, 0.14, bd, s * 0.2, 0.25, 0, bot);
    const eye = Q(new THREE.SphereGeometry(0.08, 10, 8), basic('#5fe3ff'), 0, 1.7, 0.29, bot); const eg = glow(0, 1.7, 0.34, 0x5fe3ff, 0.5, 0.8, bot); bot.rotation.y = -0.9;
    anims.push((dt, t) => { const hacked = Math.sin(t * 0.7) > 0.93; eye.material.color.set(hacked ? '#ec3013' : '#5fe3ff'); eg.material.color.set(hacked ? '#ec3013' : '#5fe3ff'); });
    sign(['THE CRYSTAL WARD', 'FLEET UNIT 2-CHIME \u00b7 LET IT LISTEN'], 2.8, 0.8, CRYS, WD.x, 3.4, WD.z + 2.4, 0);
    spots.push({ key: 'gsWard', r: 1.2, x: WD.x - 3.0, z: WD.z + 0.6, run: X => { X.audio && X.audio.tone && X.audio.tone(523, 1.6, 0.03, 'sine', 0.5); X.note('THE CRYSTAL WARD \u00b7 UNIT 2-CHIME', '\u201CThe singing\u2026 I can hear myself. They put a voice in us. Not ours. Help us find it.\u201D'); try { X.save.setFlag('gsBotHeard'); } catch (e) {} } });
    B(3.2, 1.1, 1.1, dark, 26.6, 0.55, 6.8, g, true); blocks.push([24.9, 28.3, 6.2, 7.4]); sign(['THE CRYSTAL WARD', 'SECURITY \u00b7 GAYA STATION'], 4.6, 1.1, CRYS, R.x1 - 0.2, 4.2, 0, -Math.PI / 2); }

  // ---------- ENGINEERING · THE RESONANCE CORE (W) ----------
  { const R = GA_ROOMS[3], P0 = GA_GAMES.cond.at; room(R, floorM, wallV, toon('#1a1424'), [['e', -1.5, 1.5, 3.4]], [P0.x - P0.hw - 0.16, P0.x + P0.hw + 0.16, P0.z - P0.hd - 0.16, P0.z + P0.hd + 0.16]);
    CY(1.3, 1.5, 0.6, gold, -21, 0.3, -4.2, 12, g, true); const core = Q(new THREE.OctahedronGeometry(0.9, 0), crysM, -21, 2.2, -4.2); core.scale.y = 1.8; circles.push([-21, -4.2, 1.9]);
    const cg = new THREE.Group(); cg.position.set(-21, 2.2, -4.2); g.add(cg); for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.5 + i * 0.25, 0.04, 6, 40), gold); r.rotation.set(Math.PI / 2 + i * 0.5, i, 0); cg.add(r); }
    const cgl = glow(-21, 2.2, -4.2, 0x9fe8ff, 5, 0.45); anims.push((dt, t) => { boost = Math.max(0, boost - dt * 0.2); core.rotation.y += dt * (0.5 + boost); cg.rotation.y += dt * 0.3; cg.rotation.x = Math.sin(t * 0.4) * 0.3; cgl.material.opacity = 0.4 + 0.1 * Math.sin(t * (3 + boost * 3)); });
    for (const [x, z] of [[-27.4, -6.4], [-27.4, -2], [-14.6, -6.4]]) { CY(0.04, 0.04, 1.6, gold, x, 0.8, z, 6); B(0.3, 0.6, 0.06, gold, x, 1.8, z); }
    spots.push({ key: 'gsCondSpot', r: 1.1, x: P0.x, z: P0.z + P0.hd + 0.9, run: X => X.prompt('RESONANCE LINES', 'The Resonance Core \u00b7 Chief Thistle', [['FIX THE LINES', () => hooks.play && hooks.play('cond')], ['NOT NOW', null]]) });
    sign(['THE RESONANCE CORE', 'ONE CRYSTAL \u00b7 ONE NOTE \u00b7 DO NOT HUM'], 4.6, 1.1, CRYS, R.x0 + 0.2, 4.6, 0, Math.PI / 2); }

  // ---------- BERTH FIVE (S): arrival, the airlock ----------
  { const R = GA_ROOMS[4]; room(R, floorM, wallM, toon('#2a2034'), [['n', -1.5, 1.5, 3.4]]);
    Q(new THREE.TorusGeometry(1.5, 0.28, 10, 32), gold, 0, 1.8, R.z1 - 0.1); Q(new THREE.CircleGeometry(1.4, 32), toon('#3a2a4a'), 0, 1.8, R.z1 - 0.06).rotation.y = Math.PI;
    const lamp = glow(1.9, 3.4, R.z1 - 0.3, 0xffb020, 1.4, 0.8); anims.push((dt, t) => { lamp.material.opacity = Math.floor(t * 2) % 2 ? 0.85 : 0.25; });
    sign(['AIRLOCK', 'YOUR SHIP IS DOCKED'], 2.6, 0.8, '#ffd23a', -3.4, 2.6, R.z1 - 0.2, Math.PI);
    B(2.4, 1.1, 1.0, violet, 3.8, 0.55, 18.2, g, true); blocks.push([2.5, 5.1, 17.6, 18.8]); sign(['DOCKMASTER'], 1.4, 0.45, '#ffd23a', 3.8, 1.5, 17.68, Math.PI);
    for (const [x, z] of [[-4.6, 15], [-4.6, 17.6]]) { CY(0.5, 0.4, 0.8, toon('#8a6a3a'), x, 0.4, z, 10); Q(new THREE.SphereGeometry(0.7, 10, 8), leaf, x, 1.3, z); circles.push([x, z, 0.7]); }
    spots.push({ key: 'gsLock', r: 1.4, x: 0, z: 25.2, run: X => X.prompt('GAYA STATION \u00b7 BERTH FIVE', 'Your ship is clamped on the other side of the airlock.', [['BACK TO YOUR SHIP \u00b7 SPACE', () => { X.audio && X.audio.tone && X.audio.tone(90, 1.6, 0.05, 'sawtooth', 1.5); if (hooks.nav) hooks.nav('Space Map.dc.html?from=gayaSt'); }], ['STAY ABOARD', null]]) }); }

  // ---------- THE CANDLE WORKS (NW) ----------
  { const R = GA_ROOMS[5]; room(R, floorM, toon('#6a4a3a'), toon('#22182c'), [['s', -11.5, -8.5, 3.4]]);
    for (const x of [-19, -15]) { CY(0.9, 0.9, 1.0, toon('#5a5a62'), x, 0.5, -22.4, 16, g, true); const wax = Q(new THREE.CircleGeometry(0.85, 16), basic('#f6ecd8'), x, 1.01, -22.4); wax.rotation.x = -Math.PI / 2; circles.push([x, -22.4, 1.1]); }
    const rack = new THREE.Group(); rack.position.set(-17, 2.4, -22.4); g.add(rack); B(5.4, 0.1, 0.1, toon('#3a2414'), 0, 0, 0, rack); for (let i = 0; i < 12; i++) CY(0.05, 0.05, rr(0.5, 0.9), toon('#f6ecd8'), -2.5 + i * 0.45, -0.45, 0, 6, rack); anims.push((dt, t) => { rack.position.y = 2.4 + Math.sin(t * 0.5) * 0.25; });
    for (let r = 0; r < 4; r++) for (let i = 0; i < 16; i++) { CY(0.06, 0.06, 0.4, toon(['#f6ecd8', LILAC, GOLD][(r + i) % 3]), -21.4 + i * 0.36, 0.7 + r * 0.7, -26.4, 6); } B(6, 3.0, 0.4, toon('#3a2414'), -18.7, 1.8, -26.6); blocks.push([-21.8, -15.6, -26.9, -26.0]);
    for (let i = 0; i < 6; i++) { const x = -13 + (i % 3) * 1.4, z = -24 + Math.floor(i / 3) * 1.4; CY(0.1, 0.1, 0.6, toon('#f6ecd8'), x, 1.4, z, 8); B(1.2, 1.1, 0.5, toon('#5a3a22'), x, 0.55, z); glow(x, 1.85, z, 0xffcf7a, 0.6, 0.8); } blocks.push([-13.7, -9.5, -24.4, -22.4]);
    sign(['THE CANDLE WORKS', 'EVERY TEMPLE BURNS OUR CANDLES'], 4.6, 1.1, GOLD, -15, 4.4, R.z0 + 0.6, 0); }

  // ---------- THE TEA HOUSE (SE): Kyoto red lacquer, tatami, paper lanterns ----------
  { const R = GA_ROOMS[6]; room(R, tatM, toon(LACQ), toon('#2a1410'), [['n', 8.5, 11.5, 3.4]]);
    for (let i = 0; i < 4; i++) { const x = 10 + i * 3.6; B(0.3, 5.2, 0.3, toon('#7a0c12'), x, 2.6, R.z1 - 0.5); } B(14, 0.3, 0.3, toon('#7a0c12'), 15, 4.4, R.z1 - 0.5); plane(13, 3.4, basic('#f6ecd8', 0.92), 15, 2.4, R.z1 - 0.38, Math.PI);
    for (const [x, z] of [[13, 18], [17.6, 18], [13, 22.4], [17.6, 22.4]]) { B(1.4, 0.35, 0.9, toon('#3a1a10'), x, 0.18, z); for (const s of [-1, 1]) B(0.6, 0.06, 0.6, toon('#b3121b'), x, 0.03, z + s * 0.8); CY(0.07, 0.06, 0.1, toon('#e6dcc8'), x, 0.42, z, 8); blocks.push([x - 0.75, x + 0.75, z - 0.5, z + 0.5]); }
    const lan = []; for (let i = 0; i < 5; i++) { const x = 10 + i * 2.8, l = Q(new THREE.SphereGeometry(0.32, 12, 8), basic('#ff8a5a', 0.95), x, 4.2, 16 + (i % 2) * 4); l.scale.y = 1.3; lan.push([l, rnd() * 6]); glow(x, 4.2, 16 + (i % 2) * 4, 0xff8a5a, 1.6, 0.5); }
    anims.push((dt, t) => lan.forEach(([l, p]) => { l.rotation.z = Math.sin(t * 0.8 + p) * 0.08; }));
    const tg = new THREE.Group(); tg.position.set(20.4, 0, 15); g.add(tg); for (const s of [-1, 1]) B(0.2, 2.6, 0.2, toon(LACQ), s * 0.9, 1.3, 0, tg); B(2.6, 0.2, 0.3, toon(LACQ), 0, 2.6, 0, tg); B(2.2, 0.14, 0.2, toon(LACQ), 0, 2.2, 0, tg); blocks.push([19.4, 21.4, 14.8, 15.2]);
    sign(['THE TEA HOUSE', 'KYOTO TEA \u00b7 KNEEL AND BREATHE'], 4.6, 1.1, '#ff6a5a', 15, 4.4, R.z0 + 0.2, 0, g, '#2a0a08'); }

  // ---------- THE BATH HOUSE (SW): the hot spring pool, steam, incense ----------
  const steam = []; { const R = GA_ROOMS[7]; room(R, floorM, wallM, toon('#2a2034'), [['n', -11.5, -8.5, 3.4]]);
    B(9, 0.4, 6, stoneW, -15.5, 0.2, 21.4); const pool = Q(new THREE.PlaneGeometry(8.2, 5.2), basic('#7fc8e8', 0.8), -15.5, 0.42, 21.4); pool.rotation.x = -Math.PI / 2; blocks.push([-20, -11, 18.4, 24.4]);
    for (let i = 0; i < (LOW ? 5 : 12); i++) { const s = glow(-15.5 + rr(-3.6, 3.6), 0.8, 21.4 + rr(-2.2, 2.2), 0xffffff, 1.4, 0.3); steam.push([s, rnd() * 3, s.position.x, s.position.z]); }
    anims.push((dt, t) => steam.forEach(([s, p, x, z]) => { const k = (t * 0.25 + p) % 1; s.position.set(x + Math.sin(t + p) * 0.3, 0.6 + k * 2.6, z); s.material.opacity = 0.32 * (1 - k); s.scale.setScalar(1.2 + k * 2); }));
    for (const x of [-20.6, -10.4]) { CY(0.12, 0.16, 0.9, gold, x, 0.45, 15.2, 8); const sm = glow(x, 1.2, 15.2, 0xc8a0ff, 1.2, 0.5); anims.push((dt, t) => { sm.position.y = 1.1 + ((t * 0.3) % 1) * 1.2; sm.material.opacity = 0.5 * (1 - ((t * 0.3) % 1)); }); circles.push([x, 15.2, 0.4]); }
    for (const z of [17.2, 25.6]) B(6, 0.45, 0.6, toon('#6a4a3a'), -15.5, 0.22, z); blocks.push([-18.5, -12.5, 25.3, 25.9]);
    sign(['THE BATH HOUSE', 'SPRING WATER \u00b7 INCENSE \u00b7 QUIET'], 4.6, 1.1, LILAC, -15, 4.4, R.z1 - 0.2, Math.PI);
    spots.push({ key: 'gsBath', r: 1.0, x: -15.5, z: 17.0, run: X => { X.audio && X.audio.tone && X.audio.tone(294, 1.2, 0.03, 'sine', 0.5); X.note('THE BATH HOUSE', 'Warm steam, lavender smoke. For a moment you dream of a moonlit wood full of foxes.'); } }); }

  // ---------- walking, camera, labels ----------
  const inR = (R, x, z, m) => x > R.x0 + m && x < R.x1 - m && z > R.z0 + m && z < R.z1 - m;
  function walk(x, z) { for (const [cx, cz, cr] of circles) if (Math.hypot(x - cx, z - cz) < cr) return false;
    for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false;
    for (const R of GA_ROOMS) if (inR(R, x, z, 0.4)) return true; for (const [a, b, c, d] of DOORS) if (x > a && x < b && z > c && z < d) return true; return false; }
  let cur = GA_ROOMS[4];
  function tick(dt, t, px, pz) { const R = GA_ROOMS.find(q => inR(q, px, pz, 0.1)); if (R) cur = R; }
  // in the cloister the camera may rise into the open garden, but stays under the walk's roof when it is over the walk
  function clampCam(v) { const R = cur; v.x = Math.min(R.x1 - 0.4, Math.max(R.x0 + 0.4, v.x)); v.z = Math.min(R.z1 - 0.4, Math.max(R.z0 + 0.4, v.z));
    if (R.k === 'cloister' && (Math.abs(v.x) > 9.6 || Math.abs(v.z) > 9.6)) v.y = Math.min(v.y, 4.2); else v.y = Math.min(v.y, R.h - 0.4); }
  function label(x, z) { const R = GA_ROOMS.find(q => inR(q, x, z, 0)); return 'Gaya Station \u00b7 ' + (R ? R.name : 'The Cloister').toLowerCase().replace(/(^|\s)\S/g, s => s.toUpperCase()); }
  return { g, anims, walk, clampCam, label, tick, spots, hooks, blocks, circles, setHolo(v) { for (const o of holoRef) o.visible = v; }, surge(t = 2.6) { boost = Math.max(boost, t); }, vent() { boost = 3; } };
}
