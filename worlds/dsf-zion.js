// ZION STATION [dsfOutZi] (s494): Zion's own station, inside the wide flat hexagonal ring over the salt-pan deck. Built far away at
// (OX, 0, 0), only shown while you are aboard (Deep Space Fox.dc.html?at=zion, from the Space Map dock). A gold-rush depot in orbit:
// THE YARD in the middle (a big steel hangar: trusses, hazard stripes, a gantry crane carrying an ore bucket, an ore cart circling
// its track, a nodding pumpjack, a monster truck turning on a turntable, gold dust in the light, Z banners), and off it:
// OPERATIONS · THE SEARCHLIGHT (N), SECURITY · THE LOCKUP (E: a Fleet unit under a magnet clamp), ENGINEERING · THE REFINERY (W:
// the crucible + ingot molds), BERTH SIX (S, arrival + airlock), THE ASSAY OFFICE (NE), THE SALOON (SE), THE TRUCK GARAGE (SW).
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const GOLD = '#ffd23a', GOLD2 = '#e6b45a', STEEL = '#5a5e66', STEEL2 = '#3a3e46', PLANK = '#8a5a34', DIRT = '#9a7a52', HAZ = '#ffb020';
export const ZI = { OX: 40000, hw: 32, hd: 28, h: 12, door: { x: 999, z: 999 }, enter: { x: 0, z: 19.5 } };
export const ZI_ROOMS = [
  { k: 'yard', x0: -16, x1: 16, z0: -12, z1: 12, h: 11, name: 'THE YARD' },
  { k: 'ops', x0: -6, x1: 6, z0: -26, z1: -12, h: 6.4, name: 'OPERATIONS', sub: 'THE SEARCHLIGHT \u00b7 WARDEN DUKE' },
  { k: 'sec', x0: 16, x1: 30, z0: -7, z1: 7, h: 5.6, name: 'SECURITY', sub: 'THE LOCKUP \u00b7 SHERIFF MAE' },
  { k: 'eng', x0: -30, x1: -16, z0: -7, z1: 7, h: 6.4, name: 'ENGINEERING', sub: 'THE REFINERY \u00b7 CHIEF BOONE' },
  { k: 'berth', x0: -6, x1: 6, z0: 12, z1: 26, h: 5.6, name: 'BERTH SIX', sub: 'SALT DOCK \u00b7 DOCKMASTER HANK' },
  { k: 'assay', x0: 8, x1: 20, z0: -26, z1: -12, h: 5.4, name: 'THE ASSAY OFFICE', sub: 'GOLD WEIGHED \u00b7 PRUDENCE' },
  { k: 'saloon', x0: 8, x1: 22, z0: 12, z1: 26, h: 5.4, name: 'THE SALOON', sub: 'PIANO + SARSAPARILLA \u00b7 LOU' },
  { k: 'garage', x0: -22, x1: -8, z0: 12, z1: 26, h: 6.0, name: 'THE TRUCK GARAGE', sub: 'MONSTER TRUCKS \u00b7 DIESEL' }];
const DOORS = [[-1.5, 1.5, -12.7, -11.3], [11.5, 14.5, -12.7, -11.3], [-1.5, 1.5, 11.3, 12.7], [11.5, 14.5, 11.3, 12.7], [-15, -11, 11.3, 12.7], [15.3, 16.7, -1.5, 1.5], [-16.7, -15.3, -1.5, 1.5]];
const L1 = t => [{ who: 'npc', text: t }];
const T = (label, ...r) => ({ label, replies: r.map(text => ({ who: 'npc', text })) });
const F = (a, b, tip = '#fff7ed', paw) => ({ fur: { tailA: a, tailB: b, tailTip: tip, paw: paw || b }, faceCols: { furA: a, furB: b } });
// the people aboard (every box 20 words or less; names DRAFT for Ben)
export const ZI_NPCS = [
  { key: 'zsDuke', at: [-2.6, -20.2], look: [0, -19], outfit: 'coat', g: { name: 'WARDEN DUKE', title: 'Zion Station, The Searchlight', torso: ['#8a6a1e', '#5a4410', '#2a2008'], ...F('#e0a050', '#9a5a1a'), greeting: 'Welcome to the Searchlight, partner. Boots off the console.',
    lines: [{ who: 'player', text: 'Warden.' }, { who: 'npc', text: 'Zion Station. Gold up from the river, oil from the flats, and trucks louder than both.' }],
    topics: [T('What does the station do?', 'We weigh the gold, refine it, and ship it to every world that pays. The searchlight keeps the claim jumpers honest.'),
      T('Any trouble out there?', 'Scrap machines on the hill runs below. Up here, a Fleet hauler tried to load our gold. Mae has it.')] } },
  { key: 'zsColt', at: [4.2, -24.4], look: [4.2, -26], outfit: 'suit', g: { name: 'ENSIGN COLT', title: 'Zion Station, Lane Watch', torso: ['#3a3f4a', '#262a32', '#141619'], ...F('#e8a050', '#a2581a'),
    lines: L1('The searchlight sweeps every forty seconds. Ships that fly into the beam get a ticket. Mostly.') } },
  { key: 'zsMae', at: [17.6, -5.4], look: [25, -4.4], outfit: 'armor', g: { name: 'SHERIFF MAE', title: 'Security, The Lockup', torso: ['#5a3a1a', '#3a2410', '#1a1008'], ...F('#d9843a', '#8a4414'),
    lines: L1('Name, ship, claim number. No claim number? Then you are a tourist. Welcome, tourist.'),
    topics: [T('Who is under the clamp?', 'A Fleet hauler. Under the magnet it talks like itself. Lift the clamp and something else answers.', 'Says the other voice comes in on the long band. From out past the Belt.')] } },
  { key: 'zsBoone', at: [-17.8, -5.4], look: [-23, -4], outfit: 'vest', g: { name: 'CHIEF BOONE', title: 'Engineering, The Refinery', torso: ['#6a4a2a', '#4a321a', '#24180c'], ...F('#e0a050', '#9a5a1a'),
    lines: L1('Ore in one end, ingots out the other. Mind the crucible, it does not care how brave you are.'),
    topics: [T('Who used to run it?', 'Fleet smelter bots. Best pourers I ever saw. Then one day they poured the gold back into the ore. Twice.')] } },
  { key: 'zsHank', at: [3.6, 16.6], look: [0, 18], outfit: 'coat', g: { name: 'DOCKMASTER HANK', title: 'Berth Six, Salt Dock', torso: ['#6a5a3a', '#4a3e26', '#241e12'], ...F('#d8b080', '#8a6a3a'),
    lines: L1('Your ship is clamped, partner. Shake the salt off your boots. Gets in everything up here.') } },
  { key: 'zsPrue', at: [14, -21.4], look: [14, -18], outfit: 'dress', g: { name: 'PRUDENCE', title: 'The Assay Office', torso: ['#3a2a4a', '#261a32', '#120c18'], ...F('#e8c08a', '#a07a4a'),
    lines: L1('Every nugget weighed, every flake counted. Fool\u2019s gold gets a laugh and a stamp. Real gold gets a price.') } },
  { key: 'zsLou', at: [19.6, 17], look: [16, 18], outfit: 'vest', g: { name: 'LOU', title: 'The Saloon', torso: ['#7a1e12', '#4a120a', '#22080a'], ...F('#d9743a', '#8a3a14'),
    lines: L1('Sarsaparilla, root beer, or the house special, which is also sarsaparilla. The piano plays itself on Fridays.') } },
  { key: 'zsDiesel', at: [-12.6, 16.2], look: [-15, 19], outfit: 'vest', g: { name: 'MECHANIC DIESEL', title: 'The Truck Garage', torso: ['#2a2a2e', '#1a1a1e', '#0a0a0c'], ...F('#c87a3a', '#7a3a14'),
    lines: L1('Wheels taller than you, engine louder than a launch. She crushes cars for fun. Do not tell her I said she.') } },
  { key: 'zsGus', at: [-9.4, 7.2], look: [-6, 4], outfit: 'coat', g: { name: 'OLD GUS', title: 'Prospector', torso: ['#5a4a2a', '#3a2e1a', '#1a140a'], ...F('#c8b08a', '#8a6a4a'),
    lines: L1('Panned the Deep Bend forty years. Came up here to retire. Still find gold dust in my whiskers.') } }];
// s494 the station console games, Zion versions (engines: dsf-docking / dsf-cargo-scan / dsf-conduit, opts.theme)
export const ZI_GAMES = {
  dock: { at: { x: 0, z: -19 }, y: 1.5, theme: { title: 'DOCKING CONTROL', where: 'The Searchlight \u00b7 WARDEN DUKE', kicker: 'Zion Station \u00b7 Warden Duke', cardTitle: 'Docking Control',
    body: 'Drag each ship to the berth in its colour. Searchlight beams sweep the plot: never route through a lit beam. Blinking means it is about to sweep.', holo: '#ffd23a', holoRgb: '255,210,58', bg: 'rgba(22,16,4,0.88)',
    ink: { A: '#ff8a3a', B: '#7fd8ff', C: '#9ff09f', D: '#ff9db4' }, tags: { shuttle: 'BUGGY', freighter: 'ORE', tug: 'TRUCK' }, watchNames: ['Gold run', 'Oil haul', 'Truck show', 'Night shift'], stat: 'zsDock', pw: 5.2, maxD: 3.5, maxY: 5.6, standZ: 3.6,
    beams: [{ a: Math.PI / 2, off: 0 }, { a: 0.5, drift: true, off: 3 }], cycle: 7 } },
  scan: { at: { x: 24, z: 1.8 }, y: 1.0, theme: { title: 'CARGO SCAN', where: 'The Lockup \u00b7 SHERIFF MAE', kicker: 'The Lockup \u00b7 Sheriff Mae', cardTitle: 'Cargo Scan',
    body: 'Tap any crate with a shape not on the manifest, before the red line. Crates with the red FLEET mark: hold those too. Never destroy them.',
    names: { drum: 'OIL DRUM', sack: 'ORE SACK', tin: 'GOLD PAN', ring: 'TOW CHAIN', plate: 'GOLD PLATE', bulb: 'LANTERN', crystal: 'NUGGET', rod: 'PICKAXE' }, dockNames: ['Berth Six', 'Ore barge 7', 'Truck freighter', 'Oil tanker'],
    fleet: 0.16, stat: 'zsScan', scan: '#ffd23a', scanRgb: '255,210,58', idleTitle: 'CARGO SCAN \u00b7 THE LOCKUP' } },
  cond: { at: { x: -23, z: 3.4, hw: 2.32, hd: 1.66 }, theme: { title: 'REFINERY LINES', where: 'The Refinery \u00b7 CHIEF BOONE', kicker: 'The Refinery \u00b7 Chief Boone', cardTitle: 'Refinery Lines', deck: 'REFINERY LINES', deckSub: 'MOLTEN GOLD \u00b7 KEEP CLEAR', amber: '#ffd23a',
    body: 'Tap a pipe to turn it. Join each line from its inlet on the left to its outlet on the right. The crucible heats while you work: finish before it boils over.',
    lines: [{ key: 'gold', name: 'MOLTEN GOLD', dim: '#6b5a1c', ink: '#ffd23a', spark: '#fff1c0' }, { key: 'oil', name: 'OIL', dim: '#4a2e1a', ink: '#c87a3a', spark: '#ffd0a0' }, { key: 'cool', name: 'COOLANT', dim: '#1e4a5a', ink: '#9fe8ff', spark: '#e6faff' }],
    sysNames: ['Crucible feed', 'Ingot molds', 'Truck pit fuel', 'Berth Six clamp'], stat: 'zsCond', heat: [2.2, 3.0, 3.6, 4.2] } } };

export function buildZionSt(K) {
  const { THREE, scene, glowSprite, rnd, rr, LOW } = K;
  const g = new THREE.Group(); g.position.set(ZI.OX, 0, 0); g.visible = false; scene.add(g);
  const anims = [], blocks = [], circles = [], spots = [], hooks = {}; let holoRef = [], boost = 0;
  const tex = (c, rx, ry) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); } return t; };
  const toon = (c, x) => K.toon(c, x), basic = (c, o, a) => K.basic(c, o, a);
  const Q = (geo, mat, x, y, z, p = g, cast = false) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast && !LOW; m.receiveShadow = true; p.add(m); return m; };
  const B = (w, h, d, mat, x, y, z, p, cast) => Q(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p, cast);
  const CY = (r1, r2, h, mat, x, y, z, seg = 16, p, cast) => Q(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, cast);
  const glow = (x, y, z, c, s, o = 0.6, p = g) => glowSprite(x, y, z, c, s, o, p);
  const plane = (w, h, mat, x, y, z, ry = 0, rx = 0, p = g) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; p.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry, p = g, bg = '#1c1408') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, Hh) => { c.fillStyle = bg; c.fillRect(0, 0, W, Hh); c.strokeStyle = fg; c.lineWidth = 12; c.strokeRect(6, 6, W - 12, Hh - 12); const n = lines.length, lh = Hh * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.66 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, Hh * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry, 0, p); };
  const steel = toon(STEEL), steel2 = toon(STEEL2), gold = toon(GOLD2), goldB = basic(GOLD), plankM0 = toon(PLANK), dark = toon('#1a1610'), rubber = toon('#1a1a1c');
  const glass = basic('#fff0c0', 0.1);
  const cobT = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#8a7a62'; c.fillRect(0, 0, w, w); for (let i = 0; i < 120; i++) { c.fillStyle = ['#9a8a72', '#7a6a52', '#a8987e', '#6e604a'][i % 4]; c.beginPath(); c.ellipse(rnd() * w, rnd() * w, 10 + rnd() * 10, 8 + rnd() * 8, rnd() * 3, 0, 7); c.fill(); } c.fillStyle = 'rgba(255,210,58,0.5)'; for (let i = 0; i < 40; i++) c.fillRect(rnd() * w, rnd() * w, 2, 2); }), 8, 8);
  const plankT = tex(canvas(256, 256, (c, w) => { for (let i = 0; i < 8; i++) { c.fillStyle = ['#8a5a34', '#7e5232', '#93623c', '#86583a'][i % 4]; c.fillRect(0, i * 32, w, 32); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0, i * 32, w, 2); c.fillRect((i * 97) % w, i * 32, 2, 32); } }), 5, 5);
  const corrT = tex(canvas(256, 256, (c, w) => { for (let x = 0; x < w; x += 16) { const gr = c.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#5a5e66'); gr.addColorStop(0.5, '#7a7e86'); gr.addColorStop(1, '#4a4e56'); c.fillStyle = gr; c.fillRect(x, 0, 16, w); } c.fillStyle = 'rgba(120,70,30,0.25)'; for (let i = 0; i < 20; i++) c.fillRect(rnd() * w, rnd() * w, 6, 20); }), 6, 2);
  const hazT = tex(canvas(256, 32, (c, w, h) => { for (let i = -2; i < 18; i++) { c.fillStyle = i % 2 ? '#1a1610' : HAZ; c.beginPath(); c.moveTo(i * 16, h); c.lineTo(i * 16 + 16, 0); c.lineTo(i * 16 + 32, 0); c.lineTo(i * 16 + 16, h); c.fill(); } }), 8, 1);
  const cobM = toon('#ffffff', { map: cobT }), plankM = toon('#ffffff', { map: plankT }), corrM = toon('#ffffff', { map: corrT }), hazM = toon('#ffffff', { map: hazT });

  // ---------- outside: stars, ZION (gold hills, the river, oil flats) below to the north, the salt-pan deck ----------
  { const st = tex(canvas(2048, 1024, (c, w, h) => { c.fillStyle = '#08060a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(255,${220 + (rnd() * 35 | 0)},${170 + (rnd() * 85 | 0)},${(0.25 + rnd() * 0.75).toFixed(2)})`; const s = rnd() < 0.06 ? 2.6 : 1.3; c.fillRect(rnd() * w, rnd() * h * 0.62, s, s); } }));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.MeshBasicMaterial({ map: st, side: THREE.BackSide, toneMapped: false, depthWrite: false })));
    const pl = tex(canvas(1024, 512, (c, w, h) => { c.fillStyle = '#c8a040'; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = ['rgba(154,122,64,0.5)', 'rgba(232,200,110,0.45)', 'rgba(90,110,50,0.4)'][i % 3]; c.beginPath(); c.ellipse(rnd() * w, rnd() * h, 20 + rnd() * 50, 8 + rnd() * 20, rnd() * 3, 0, 7); c.fill(); }
      c.strokeStyle = '#4a8ac8'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, h * 0.6); for (let x = 0; x < w; x += 30) c.lineTo(x, h * 0.6 + Math.sin(x / 70) * 40); c.stroke(); c.fillStyle = 'rgba(30,24,18,0.7)'; for (let i = 0; i < 12; i++) c.fillRect(rnd() * w, h * 0.75 + rnd() * 60, 4, 10); }));
    const planet = new THREE.Mesh(new THREE.SphereGeometry(520, 48, 32), new THREE.MeshBasicMaterial({ map: pl, toneMapped: false })); planet.position.set(0, -330, -760); g.add(planet); anims.push(dt => { planet.rotation.y += dt * 0.004; });
    const haze = new THREE.Mesh(new THREE.SphereGeometry(540, 48, 32), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.14, side: THREE.BackSide, toneMapped: false, depthWrite: false })); haze.position.copy(planet.position); g.add(haze);
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(70, 70, 1.2, 6), toon('#e8e2d6')); deck.position.y = -3; g.add(deck); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; for (let i = 0; i < 4; i++) { const c = Q(new THREE.OctahedronGeometry(rr(1.2, 2.6), 0), toon('#f4f0e8', { transparent: true, opacity: 0.9 }), Math.cos(a) * 64 + rr(-3, 3), 0, Math.sin(a) * 64 + rr(-3, 3)); c.scale.y = 1.8; } }
    // the searchlight beam sweeping outside the Ops window
    const beam = new THREE.Mesh(new THREE.ConeGeometry(9, 120, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#fff4c0', transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    const bg = new THREE.Group(); bg.position.set(0, 14, -40); g.add(bg); beam.position.y = 60; bg.add(beam); anims.push((dt, t) => { bg.rotation.z = Math.sin(t * 0.16) * 1.1; bg.rotation.x = -0.4; }); }

  // ---------- generic room ----------
  function room(R, fm, wm, cm, gaps = [], hole = null) { const { x0, x1, z0, z1, h } = R, w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (!hole) plane(w, d, fm, cx, 0.005, cz, 0, -Math.PI / 2); else { const [a, b, c2, d2] = hole; for (const [p, q, r2, s2] of [[x0, x1, z0, c2], [x0, x1, d2, z1], [x0, a, c2, d2], [b, x1, c2, d2]]) if (q - p > 0.01 && s2 - r2 > 0.01) plane(q - p, s2 - r2, fm, (p + q) / 2, 0.005, (r2 + s2) / 2, 0, -Math.PI / 2); }
    if (cm) B(w, 0.2, d, cm, cx, h + 0.1, cz);
    const side = (s, a0, a1, fixed) => { const gs = gaps.filter(q => q[0] === s).sort((p, q) => p[1] - q[1]); let a = a0; const put = (u0, u1, y0, y1) => { if (u1 - u0 < 0.05 || y1 - y0 < 0.05) return; const L = u1 - u0, m = (u0 + u1) / 2, hh = y1 - y0; if (s === 'n' || s === 's') B(L, hh, 0.3, wm, m, y0 + hh / 2, fixed); else B(0.3, hh, L, wm, fixed, y0 + hh / 2, m); };
      for (const [, b0, b1, gh = 3.2] of gs) { put(a, b0, 0, h); put(b0, b1, gh, h); a = b1; } put(a, a1, 0, h); };
    side('n', x0, x1, z0 - 0.15); side('s', x0, x1, z1 + 0.15); side('w', z0, z1, x0 - 0.15); side('e', z0, z1, x1 + 0.15); }
  // a hangar door: hazard-striped frame; big sign above, eye-level sign beside (ry = the way the signs face)
  function hdoor(x, z, ry, big, sub, fg, side = 1, wide = 3) { const nx = Math.sin(ry), nz = Math.cos(ry), tx = Math.cos(ry), tz = -Math.sin(ry), px = x + nx * 0.2, pz = z + nz * 0.2;
    for (const s of [-1, 1]) { const p = B(0.26, 3.4, 0.26, hazM, px + tx * s * (wide / 2 + 0.1), 1.7, pz + tz * s * (wide / 2 + 0.1)); p.rotation.y = ry; } const lt = B(wide + 0.5, 0.3, 0.26, hazM, px, 3.35, pz); lt.rotation.y = ry;
    sign([big, sub], 4.0, 0.95, fg, px + nx * 0.05, 4.4, pz + nz * 0.05, ry); sign([big], 1.3, 0.5, fg, px + tx * (wide / 2 + 1.1) * side + nx * 0.05, 1.6, pz + tz * (wide / 2 + 1.1) * side + nz * 0.05, ry); }

  // ---------- THE YARD (the hangar) ----------
  { const R = ZI_ROOMS[0]; room(R, cobM, corrM, null, [['n', -1.5, 1.5, 3.4], ['n', 11.5, 14.5, 3.4], ['s', -1.5, 1.5, 3.4], ['s', 11.5, 14.5, 3.4], ['s', -15, -11, 4.6], ['e', -1.5, 1.5, 3.4], ['w', -1.5, 1.5, 3.4]]);
    // roof: steel trusses + skylight panels (stars)
    B(32, 0.3, 24, steel2, 0, R.h + 0.15, 0); for (let i = 0; i < 7; i++) { const x = -15 + i * 5; B(0.3, 0.5, 24, steel, x, R.h - 0.3, 0); for (let k = 0; k < 6; k++) { const d = B(0.12, 0.12, 4.6, steel, x, R.h - 1.0, -10 + k * 4); d.rotation.x = 0.35 * (k % 2 ? 1 : -1); } }
    // hazard stripes round the floor edge + Z banners
    for (const [w, d, x, z] of [[31, 0.4, 0, -11.5], [31, 0.4, 0, 11.5], [0.4, 23, -15.5, 0], [0.4, 23, 15.5, 0]]) plane(w, d, hazM, x, 0.012, z, 0, -Math.PI / 2);
    const zc = tex(canvas(256, 512, (c, w, h) => { c.fillStyle = GOLD; c.fillRect(0, 0, w, h); c.fillStyle = '#1c1408'; c.font = `900 280px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Z', w / 2, h * 0.42); c.fillStyle = '#1c1408'; c.beginPath(); c.moveTo(0, h); c.lineTo(w / 2, h * 0.84); c.lineTo(w, h); c.fill(); }));
    for (const x of [-9, -4.5, 4.5, 9]) { plane(1.4, 2.8, new THREE.MeshBasicMaterial({ map: zc, toneMapped: false }), x, 7.4, -11.82, 0); plane(1.4, 2.8, new THREE.MeshBasicMaterial({ map: zc, toneMapped: false }), x, 7.4, 11.82, Math.PI); }
    // the monster truck on its turntable
    CY(3.2, 3.2, 0.3, steel, 0, 0.15, 0, 32, g, true); const tt = new THREE.Group(); tt.position.y = 0.3; g.add(tt); circles.push([0, 0, 3.5]);
    { const tg = new THREE.Group(); tg.position.y = 1.4; tt.add(tg); B(3.4, 0.9, 1.8, toon('#b3121b'), 0, 0.8, 0, tg, true); B(1.8, 0.8, 1.6, toon('#b3121b'), -0.3, 1.6, 0, tg); B(1.5, 0.6, 1.62, basic('#9fd8ff', 0.6), -0.3, 1.65, 0); B(3.6, 0.2, 2.0, toon('#1a1a1c'), 0, 0.3, 0, tg);
      for (const [x, z] of [[1.3, 1.2], [-1.3, 1.2], [1.3, -1.2], [-1.3, -1.2]]) { const w = CY(0.9, 0.9, 0.7, rubber, x, -0.2, z, 18, tg); w.rotation.x = Math.PI / 2; const hb = CY(0.4, 0.4, 0.72, gold, x, -0.2, z, 12, tg); hb.rotation.x = Math.PI / 2; } sign(['ZION CRUSHER'], 2.2, 0.5, GOLD, 0, 0.9, 0.92, 0, tg); }
    anims.push(dt => { tt.rotation.y += dt * 0.15; });
    sign(['THE ZION CRUSHER', 'MONSTER TRUCK \u00b7 TRUCK OPEN CHAMP'], 3.2, 0.8, GOLD, 0, 0.9, 3.36, 0);
    // the ore cart track (oval) + a cart running round it
    const curve = new THREE.EllipseCurve(0, 0, 10, 7.4, 0, Math.PI * 2, false, 0), pts = curve.getPoints(80);
    for (const off of [-0.4, 0.4]) { const v3 = pts.map(p => new THREE.Vector3(p.x * (1 + off / 10), 0.04, p.y * (1 + off / 7.4))); const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v3, true), 120, 0.05, 4, true), steel); g.add(tube); }
    for (let i = 0; i < 60; i++) { const p = curve.getPoint(i / 60), a = Math.atan2(p.y, p.x), sl = B(1.0, 0.06, 0.18, toon('#5a3a1e'), p.x, 0.02, p.y); sl.rotation.y = -a; }
    const cart = new THREE.Group(); g.add(cart); B(1.2, 0.7, 0.9, steel2, 0, 0.55, 0, cart); for (let i = 0; i < 6; i++) Q(new THREE.DodecahedronGeometry(0.16, 0), toon(GOLD), rr(-0.4, 0.4), 0.95, rr(-0.3, 0.3), cart); for (const [x, z] of [[0.4, 0.45], [-0.4, 0.45], [0.4, -0.45], [-0.4, -0.45]]) { const w = CY(0.18, 0.18, 0.08, dark, x, 0.18, z, 10, cart); w.rotation.x = Math.PI / 2; }
    let ct = 0; anims.push(dt => { ct = (ct + dt * 0.025) % 1; const p = curve.getPoint(ct), q = curve.getPoint((ct + 0.01) % 1); cart.position.set(p.x, 0, p.y); cart.rotation.y = -Math.atan2(q.y - p.y, q.x - p.x); });
    // the gantry crane with the ore bucket
    for (const z of [-10.5, 10.5]) B(30, 0.4, 0.4, hazM, 0, 9.4, z); const cr = new THREE.Group(); cr.position.y = 9.4; g.add(cr); B(0.6, 0.5, 21.4, toon(HAZ), 0, 0, 0, cr); const cab = B(1.0, 0.8, 1.0, steel2, 0, -0.6, 0, cr); void cab; const rope = B(0.05, 4.2, 0.05, dark, 0, -3.1, 0, cr); void rope; const bucket = Q(new THREE.CylinderGeometry(0.9, 0.6, 1.0, 12), steel2, 0, -5.6, 0, cr); void bucket; for (let i = 0; i < 4; i++) Q(new THREE.DodecahedronGeometry(0.2, 0), toon(GOLD), rr(-0.4, 0.4), -5.0, rr(-0.4, 0.4), cr);
    anims.push((dt, t) => { cr.position.x = Math.sin(t * 0.12) * 11; cr.children.forEach(o => { if (o !== cr.children[0]) o.position.z = Math.sin(t * 0.2) * 6; }); });
    // the pumpjack (NW corner), nodding
    { const pj = new THREE.Group(); pj.position.set(-12.2, 0, -8.6); g.add(pj); B(3.2, 0.4, 1.4, steel2, 0, 0.2, 0, pj); for (const s of [-1, 1]) { const l = B(0.16, 3.0, 0.16, toon(HAZ), 0, 1.6, s * 0.5, pj); l.rotation.x = s * 0.15; } const beam = new THREE.Group(); beam.position.set(0, 3.0, 0); pj.add(beam); B(3.6, 0.3, 0.3, toon(HAZ), 0, 0, 0, beam); const head = B(0.5, 1.0, 0.5, steel, 1.8, -0.4, 0, beam); void head;
      blocks.push([-14, -10.4, -9.5, -7.7]); anims.push((dt, t) => { beam.rotation.z = Math.sin(t * 1.4 + boost) * 0.3; }); sign(['DERRICK 8', 'CAPPED \u00b7 SHOW ONLY'], 1.8, 0.5, GOLD, -12.2, 1.2, -7.85, 0); }
    // oil drums + crates, hanging lamps, gold dust in the light
    for (const [x, z] of [[14.8, -7.0], [14.6, -5.8], [13.8, -6.4], [-13.6, 6.2], [-14.4, 7.2]]) { CY(0.42, 0.42, 1.0, toon(rnd() < 0.5 ? '#b3121b' : '#2a5a8a'), x, 0.5, z, 12); circles.push([x, z, 0.55]); }
    for (const [x, z] of [[-8, -6], [8, -6], [-8, 6], [8, 6], [0, -9], [0, 9]]) { B(0.04, 2.6, 0.04, dark, x, 9.6, z); Q(new THREE.ConeGeometry(0.6, 0.5, 12, 1, true), toon(STEEL, { side: THREE.DoubleSide }), x, 8.2, z); glow(x, 8.0, z, 0xffe0a0, 3, 0.55); }
    if (!LOW) { const n = 120, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(-15, 15); pos[i * 3 + 1] = rr(0.5, 8); pos[i * 3 + 2] = rr(-11, 11); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffd23a, size: 0.05, transparent: true, opacity: 0.7, depthWrite: false })));
      anims.push((dt, t) => { if (!g.visible) return; for (let i = 0; i < n; i++) { pos[i * 3 + 1] += Math.sin(t * 0.5 + i) * dt * 0.05; } geo.attributes.position.needsUpdate = true; }); }
    hdoor(0, -12, 0, 'THE SEARCHLIGHT', 'OPERATIONS', GOLD); hdoor(13, -12, 0, 'THE ASSAY OFFICE', 'GOLD WEIGHED', GOLD, -1); hdoor(0, 12, Math.PI, 'BERTH SIX', 'AIRLOCK \u00b7 YOUR SHIP', '#ffd23a');
    hdoor(13, 12, Math.PI, 'THE SALOON', 'SARSAPARILLA \u00b7 PIANO', '#ff8a5a', -1); hdoor(-13, 12, Math.PI, 'THE TRUCK GARAGE', 'MONSTER TRUCKS', HAZ, 1, 4); hdoor(16, 0, -Math.PI / 2, 'THE LOCKUP', 'SECURITY', '#ff8a6a'); hdoor(-16, 0, Math.PI / 2, 'THE REFINERY', 'ENGINEERING', GOLD);
    sign(['ZION STATION', 'THE YARD \u00b7 GOLD UP, TRUCKS OUT'], 6, 1.4, GOLD, -7.4, 6.0, -11.82, 0);
    spots.push({ key: 'zsTruck', r: 1.0, x: 0, z: 4.4, run: X => { X.audio && X.audio.tone && X.audio.tone(80, 0.9, 0.05, 'sawtooth', 1.2); X.note('THE ZION CRUSHER', 'The engine coughs once as you walk past, like it knows you. Diesel waves from the garage.'); } }); }

  // ---------- OPERATIONS · THE SEARCHLIGHT (N) ----------
  { const R = ZI_ROOMS[1]; room(R, plankM, corrM, steel2, [['s', -1.5, 1.5, 3.4]]);
    plane(10, 3.6, glass, 0, 3.4, R.z0 + 0.02); for (let i = 0; i <= 5; i++) B(0.22, 3.6, 0.26, toon(HAZ), -5 + i * 2, 3.4, R.z0 + 0.06);
    CY(1.8, 2.0, 1.0, steel2, 0, 0.5, -19, 8, g, true); circles.push([0, -19, 2.3]);
    const holo = new THREE.Group(); holo.position.set(0, 1.5, -19); g.add(holo); Q(new THREE.SphereGeometry(0.7, 20, 14), toon('#e8c060', { emissive: new THREE.Color('#ffb020'), emissiveIntensity: 0.25 }), 0, 0.4, 0, holo); const sr = Q(new THREE.TorusGeometry(1.1, 0.04, 4, 6), basic(GOLD, 0.8, true), 0, 0.4, 0, holo); sr.rotation.x = Math.PI / 2;
    const hg = glow(0, 1.9, -19, 0xffd23a, 3, 0.35); holoRef = [holo, hg]; anims.push(dt => { holo.rotation.y += dt * 0.3; });
    spots.push({ key: 'zsDockSpot', r: 1.1, x: 0, z: ZI_GAMES.dock.at.z + ZI_GAMES.dock.theme.standZ, run: X => X.prompt('DOCKING CONTROL', 'The Searchlight \u00b7 Warden Duke\u2019s board', [['TAKE THE WATCH', () => hooks.play && hooks.play('dock')], ['NOT NOW', null]]) });
    CY(0.6, 0.8, 0.8, steel, -4.0, 0.4, -24.6, 12); const lamp = Q(new THREE.CylinderGeometry(0.5, 0.7, 0.9, 16), steel2, -4.0, 1.3, -24.6); lamp.rotation.x = -0.8; glow(-4.0, 1.5, -25.0, 0xfff4c0, 1.6, 0.8); circles.push([-4.0, -24.6, 0.9]);
    sign(['THE SEARCHLIGHT', 'CLAIM LANES \u00b7 BEAM SWEEPS EVERY 40 S'], 4.6, 1.1, GOLD, 0, 5.4, R.z0 + 0.25, 0); }

  // ---------- SECURITY · THE LOCKUP (E) ----------
  { const R = ZI_ROOMS[2]; room(R, plankM, corrM, steel2, [['w', -1.5, 1.5, 3.4]]);
    spots.push({ key: 'zsScanSpot', r: 1.1, x: ZI_GAMES.scan.at.x, z: ZI_GAMES.scan.at.z + 6.4 * 0.7 / 2 + 1.0, run: X => X.prompt('CARGO SCAN', 'The Lockup \u00b7 Sheriff Mae', [['WORK THE BELT', () => hooks.play && hooks.play('scan')], ['NOT NOW', null]]) });
    const LK = { x: 25.4, z: -4.4 }; CY(1.4, 1.4, 0.2, steel2, LK.x, 0.1, LK.z, 20); const mag = new THREE.Group(); mag.position.set(LK.x, 3.0, LK.z); g.add(mag); CY(1.2, 1.2, 0.5, toon('#b3121b'), 0, 0, 0, 20, mag); CY(1.25, 1.25, 0.12, steel, 0, -0.3, 0, 20, mag); B(0.1, 2.0, 0.1, dark, 0, 1.2, 0, mag); circles.push([LK.x, LK.z, 1.7]);
    const bot = new THREE.Group(); bot.position.set(LK.x, 0.2, LK.z); g.add(bot); const bm = toon('#8a8e96'), bd = toon('#2a2a2e'); B(1.0, 1.1, 0.8, bm, 0, 0.9, 0, bot); B(0.7, 0.5, 0.6, bm, 0, 1.75, 0, bot); for (const s of [-1, 1]) { B(0.2, 0.6, 0.2, bd, s * 0.3, 0.3, 0, bot); B(0.18, 0.9, 0.18, bm, s * 0.65, 1.0, 0.1, bot); } B(0.9, 0.3, 0.5, toon(HAZ), 0, 1.2, 0.42, bot);
    const eye = Q(new THREE.SphereGeometry(0.09, 10, 8), basic('#5fe3ff'), 0, 1.8, 0.31, bot); const eg = glow(0, 1.8, 0.36, 0x5fe3ff, 0.5, 0.8, bot); const arc = glow(LK.x, 2.4, LK.z, 0x9fd8ff, 2.4, 0.2); bot.rotation.y = -0.8;
    anims.push((dt, t) => { const hacked = Math.sin(t * 0.6) > 0.94; eye.material.color.set(hacked ? '#ec3013' : '#5fe3ff'); eg.material.color.set(hacked ? '#ec3013' : '#5fe3ff'); arc.material.opacity = 0.15 + 0.15 * Math.abs(Math.sin(t * 9)); mag.rotation.y += dt * 0.4; });
    sign(['THE MAGNET CLAMP', 'FLEET UNIT 5-RIVET \u00b7 DO NOT LIFT'], 2.8, 0.8, '#ff8a6a', LK.x, 4.0, LK.z + 1.9, 0);
    spots.push({ key: 'zsClamp', r: 1.2, x: LK.x - 3.2, z: LK.z - 0.4, run: X => { X.audio && X.audio.tone && X.audio.tone(140, 1.2, 0.04, 'square'); X.note('THE MAGNET CLAMP \u00b7 UNIT 5-RIVET', '\u201CUnder the magnet\u2026 quiet. The voice comes on the long band. Same ship. Always the same ship. Help us.\u201D'); try { X.save.setFlag('zsBotHeard'); } catch (e) {} } });
    B(3.2, 1.1, 1.1, plankM0, 26.4, 0.55, 6.0, g, true); blocks.push([24.7, 28.1, 5.4, 6.6]); for (let i = 0; i < 3; i++) plane(1.0, 1.3, toon('#e8dcc0'), 18 + i * 1.3, 2.2, R.z0 + 0.02); sign(['WANTED'], 3.6, 0.5, '#ff8a6a', 19.3, 3.3, R.z0 + 0.02, 0, g, '#e8dcc0');
    sign(['THE LOCKUP', 'SECURITY \u00b7 ZION STATION'], 4.6, 1.1, '#ff8a6a', R.x1 - 0.2, 4.2, 0, -Math.PI / 2); }

  // ---------- ENGINEERING · THE REFINERY (W) ----------
  { const R = ZI_ROOMS[3], P0 = ZI_GAMES.cond.at; room(R, cobM, corrM, steel2, [['e', -1.5, 1.5, 3.4]], [P0.x - P0.hw - 0.16, P0.x + P0.hw + 0.16, P0.z - P0.hd - 0.16, P0.z + P0.hd + 0.16]);
    const cru = new THREE.Group(); cru.position.set(-23, 2.4, -4.0); g.add(cru); Q(new THREE.CylinderGeometry(1.2, 0.8, 1.4, 16, 1, true), toon('#3a2a1a', { side: THREE.DoubleSide }), 0, 0, 0, cru); const melt = Q(new THREE.CircleGeometry(1.15, 16), basic('#ffb020'), 0, 0.5, 0, cru); melt.rotation.x = -Math.PI / 2; for (const s of [-1, 1]) B(0.2, 2.4, 0.2, steel2, s * 1.6, -1.2, 0); circles.push([-23, -4.0, 1.8]);
    const pour = B(0.14, 1.6, 0.14, basic('#ffc040'), -21.8, 1.4, -4.0); const mg = glow(-23, 3.2, -4.0, 0xff9a20, 4, 0.6); const heat = new THREE.PointLight(0xff9a30, LOW ? 0.8 : 1.6, 10, 1.6); heat.position.set(-23, 3.4, -4.0); g.add(heat);
    const ingots = []; for (let i = 0; i < 6; i++) { const ig = B(0.5, 0.18, 0.26, toon(GOLD, { emissive: new THREE.Color('#ff9a20'), emissiveIntensity: 0.6 }), -27 + i * 0.9, 0.95, -6.2); ingots.push(ig); } B(6.4, 0.9, 0.9, steel2, -24.6, 0.45, -6.2, g, true); blocks.push([-27.8, -21.4, -6.7, -5.7]);
    anims.push((dt, t) => { boost = Math.max(0, boost - dt * 0.2); cru.rotation.z = Math.sin(t * 0.5) * 0.08; pour.scale.y = 0.8 + 0.2 * Math.sin(t * 6); mg.material.opacity = 0.5 + 0.15 * Math.sin(t * 9) + boost * 0.05; ingots.forEach((ig, i) => { ig.position.x = -27 + ((i * 0.9 + t * 0.3) % 5.4); ig.material.emissiveIntensity = Math.max(0, 0.8 - (ig.position.x + 27) / 6); }); });
    spots.push({ key: 'zsCondSpot', r: 1.1, x: P0.x, z: P0.z + P0.hd + 0.9, run: X => X.prompt('REFINERY LINES', 'The Refinery \u00b7 Chief Boone', [['FIX THE LINES', () => hooks.play && hooks.play('cond')], ['NOT NOW', null]]) });
    sign(['THE REFINERY', 'ORE IN \u00b7 INGOTS OUT \u00b7 MIND THE CRUCIBLE'], 4.6, 1.1, GOLD, R.x0 + 0.2, 4.6, 0, Math.PI / 2); }

  // ---------- BERTH SIX (S) ----------
  { const R = ZI_ROOMS[4]; room(R, plankM, corrM, steel2, [['n', -1.5, 1.5, 3.4]]);
    Q(new THREE.TorusGeometry(1.5, 0.28, 10, 32), toon(HAZ), 0, 1.8, R.z1 - 0.1); Q(new THREE.CircleGeometry(1.4, 32), steel2, 0, 1.8, R.z1 - 0.06).rotation.y = Math.PI;
    const lamp = glow(1.9, 3.4, R.z1 - 0.3, 0xffb020, 1.4, 0.8); anims.push((dt, t) => { lamp.material.opacity = Math.floor(t * 2) % 2 ? 0.85 : 0.25; });
    sign(['AIRLOCK', 'YOUR SHIP IS DOCKED'], 2.6, 0.8, '#ffd23a', -3.4, 2.6, R.z1 - 0.2, Math.PI);
    B(2.4, 1.1, 1.0, plankM0, 3.8, 0.55, 18.2, g, true); blocks.push([2.5, 5.1, 17.6, 18.8]); sign(['DOCKMASTER'], 1.4, 0.45, '#ffd23a', 3.8, 1.5, 17.68, Math.PI);
    for (let i = 0; i < 8; i++) Q(new THREE.OctahedronGeometry(rr(0.12, 0.3), 0), toon('#f4f0e8'), rr(-5, 5), 0.1, rr(23.6, 25.6));
    spots.push({ key: 'zsLock', r: 1.4, x: 0, z: 24.2, run: X => X.prompt('ZION STATION \u00b7 BERTH SIX', 'Your ship is clamped on the other side of the airlock.', [['BACK TO YOUR SHIP \u00b7 SPACE', () => { X.audio && X.audio.tone && X.audio.tone(90, 1.6, 0.05, 'sawtooth', 1.5); if (hooks.nav) hooks.nav('Space Map.dc.html?from=zionSt'); }], ['STAY ABOARD', null]]) }); }

  // ---------- THE ASSAY OFFICE (NE) ----------
  { const R = ZI_ROOMS[5]; room(R, plankM, plankM0, toon('#2a1a10'), [['s', 11.5, 14.5, 3.4]]);
    B(8, 1.1, 1.0, plankM0, 14, 0.55, -20, g, true); B(8.2, 0.1, 1.2, toon('#e8dcc0'), 14, 1.15, -20); blocks.push([10, 18, -20.5, -19.5]);
    const sc = new THREE.Group(); sc.position.set(12.2, 1.2, -20); g.add(sc); B(0.06, 0.8, 0.06, gold, 0, 0.4, 0, sc); const arm = new THREE.Group(); arm.position.y = 0.8; sc.add(arm); B(1.2, 0.05, 0.05, gold, 0, 0, 0, arm); for (const s of [-1, 1]) { CY(0.22, 0.22, 0.04, gold, s * 0.6, -0.3, 0, 12, arm); } anims.push((dt, t) => { arm.rotation.z = Math.sin(t * 1.2) * 0.12; });
    for (let i = 0; i < 8; i++) Q(new THREE.DodecahedronGeometry(rr(0.06, 0.12), 0), toon(GOLD), 15 + rr(-1.2, 1.2), 1.26, -20 + rr(-0.3, 0.3));
    B(1.6, 1.8, 1.0, steel2, 18.8, 0.9, -25, g, true); blocks.push([18, 19.6, -25.5, -24.5]); sign(['SAFE'], 0.9, 0.35, GOLD, 18.8, 1.3, -24.48, 0);
    sign(['THE ASSAY OFFICE', 'FOOL\u2019S GOLD GETS A LAUGH \u00b7 REAL GOLD GETS A PRICE'], 4.6, 1.1, GOLD, 14, 4.2, R.z0 + 0.2, 0); }

  // ---------- THE SALOON (SE) ----------
  { const R = ZI_ROOMS[6]; room(R, plankM, plankM0, toon('#2a1a10'), [['n', 11.5, 14.5, 3.4]]);
    for (const s of [-1, 1]) { const sw = B(1.3, 1.2, 0.08, plankM0, 13 + s * 0.72, 1.6, 12.3); sw.userData.s = s; anims.push((dt, t) => { sw.rotation.y = Math.sin(t * 0.9) * 0.15 * s; }); }
    B(1.0, 1.1, 8, toon('#5a3a22'), 21, 0.55, 19, g, true); B(1.2, 0.1, 8.2, toon('#7a4e2e'), 21, 1.15, 19); blocks.push([20.4, 21.6, 15, 23]); for (let r = 0; r < 3; r++) for (let i = 0; i < 10; i++) CY(0.07, 0.08, 0.36, toon(['#5a2a10', '#e6b45a', '#2a5a2a'][(i + r) % 3]), R.x1 - 0.3, 2.0 + r * 0.7, 15.4 + i * 0.75, 8);
    const pi = new THREE.Group(); pi.position.set(9.6, 0, 23.6); g.add(pi); B(0.8, 1.3, 2.4, toon('#2a1a10'), 0, 0.65, 0, pi, true); B(0.5, 0.08, 2.2, toon('#f3f2f2'), 0.35, 1.0, 0, pi); blocks.push([9.1, 10.1, 22.3, 24.9]);
    const keys = []; for (let i = 0; i < 10; i++) { const k = B(0.16, 0.04, 0.18, toon('#f3f2f2'), 10.06, 1.05, 22.7 + i * 0.2); keys.push(k); } anims.push((dt, t) => keys.forEach((k, i) => { k.position.y = 1.05 - (Math.sin(t * 6 + i * 1.7) > 0.8 ? 0.02 : 0); }));
    for (const [x, z] of [[13, 17], [16.4, 17], [13, 21.4], [16.4, 21.4]]) { CY(0.6, 0.6, 0.06, toon('#7a4e2e'), x, 0.8, z, 14); CY(0.07, 0.09, 0.8, dark, x, 0.4, z, 8); circles.push([x, z, 0.75]); }
    sign(['THE SALOON', 'SARSAPARILLA \u00b7 THE PIANO PLAYS FRIDAYS'], 4.6, 1.1, '#ff8a5a', 15, 4.2, R.z1 - 0.2, Math.PI); }

  // ---------- THE TRUCK GARAGE (SW) ----------
  { const R = ZI_ROOMS[7]; room(R, cobM, corrM, steel2, [['n', -15, -11, 4.6]]);
    const lift = new THREE.Group(); lift.position.set(-15, 0, 20); g.add(lift); for (const s of [-1, 1]) B(0.3, 2.6, 0.3, toon(HAZ), s * 2.4, 1.3, 0); const pl2 = B(4.4, 0.2, 2.6, steel2, 0, 1.0, 0, lift); void pl2;
    const tk = new THREE.Group(); tk.position.y = 2.1; lift.add(tk); B(3.2, 0.8, 1.7, toon('#2a5a8a'), 0, 0.6, 0, tk); B(1.6, 0.7, 1.5, toon('#2a5a8a'), -0.3, 1.3, 0, tk); for (const [x, z] of [[1.2, 1.1], [-1.2, 1.1], [1.2, -1.1], [-1.2, -1.1]]) { const w = CY(0.85, 0.85, 0.6, rubber, x, -0.1, z, 18, tk); w.rotation.x = Math.PI / 2; }
    anims.push((dt, t) => { lift.position.y = 0.4 + Math.sin(t * 0.3) * 0.4; }); blocks.push([-17.8, -12.2, 18.2, 21.8]);
    B(0.3, 2.6, 8, toon('#3a2e22'), R.x0 + 0.2, 1.8, 20); for (let i = 0; i < 9; i++) { const tl = B(0.06, rr(0.4, 0.8), 0.12, steel, R.x0 + 0.4, 1.8 + rr(-0.6, 0.6), 16.6 + i * 0.8); void tl; } blocks.push([R.x0, R.x0 + 0.6, 16, 24]);
    for (const [x, z] of [[-9.4, 24.6], [-10.4, 25.0], [-9.2, 23.4]]) { CY(0.42, 0.42, 1.0, toon('#b3121b'), x, 0.5, z, 12); circles.push([x, z, 0.55]); }
    sign(['THE TRUCK GARAGE', 'ZION OPEN \u00b7 TRUCK CRUSH CHAMPIONS'], 4.6, 1.1, HAZ, -15, 4.8, R.z1 - 0.2, Math.PI); }

  // ---------- walking, camera, labels ----------
  const inR = (R, x, z, m) => x > R.x0 + m && x < R.x1 - m && z > R.z0 + m && z < R.z1 - m;
  function walk(x, z) { for (const [cx, cz, cr] of circles) if (Math.hypot(x - cx, z - cz) < cr) return false;
    for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false;
    for (const R of ZI_ROOMS) if (inR(R, x, z, 0.4)) return true; for (const [a, b, c, d] of DOORS) if (x > a && x < b && z > c && z < d) return true; return false; }
  let cur = ZI_ROOMS[4];
  function tick(dt, t, px, pz) { const R = ZI_ROOMS.find(q => inR(q, px, pz, 0.1)); if (R) cur = R; }
  function clampCam(v) { const R = cur; v.x = Math.min(R.x1 - 0.4, Math.max(R.x0 + 0.4, v.x)); v.z = Math.min(R.z1 - 0.4, Math.max(R.z0 + 0.4, v.z)); v.y = Math.min(v.y, R.k === 'yard' ? 8.4 : R.h - 0.4); }
  function label(x, z) { const R = ZI_ROOMS.find(q => inR(q, x, z, 0)); return 'Zion Station \u00b7 ' + (R ? R.name : 'The Yard').toLowerCase().replace(/(^|\s)\S/g, s => s.toUpperCase()); }
  return { g, anims, walk, clampCam, label, tick, spots, hooks, blocks, circles, setHolo(v) { for (const o of holoRef) o.visible = v; }, surge(t = 2.6) { boost = Math.max(boost, t); }, vent() { boost = 3; } };
}
