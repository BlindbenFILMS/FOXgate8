// LUXOR STATION [dsfOutLx] (s470): Luxor's own station, inside the floating stepped pyramid. Built far away at (OX, 0, 0),
// only shown while you are aboard (Deep Space Fox.dc.html?at=luxor, from the Space Map dock). A 3 x 3 plan of 16 m halls:
// THE SUN COURT in the middle (stepped pyramid ceiling up to a gold capstone, the SUN WELL of molten glass, a floating sun disc
// fed by four mirror beams, corner obelisks), OPERATIONS · THE CAPSTONE (N), SECURITY · THE IRON WATCH + brig (E),
// ENGINEERING · THE HEAT ENGINE (W), BERTH ONE (S, arrival + airlock back to your ship), and off them THE PIT (NE),
// BIKE BAY (NW), SUN GALLERY observatory (SE), CINDER CANTINA (SW). Luxor (the volcano world) glows below.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const GOLD = '#e8b42a', SAND = '#c9a46a', SAND2 = '#a8844e', BAS = '#2a2220', BAS2 = '#17110f', EMB = '#ff6a1a';
const C = 16, H = 5.5;
export const LX = { OX: 16000, hw: 25, hd: 25, h: 13, door: { x: 999, z: 999 }, enter: { x: 0, z: 19.4 } };
export const LX_CELLS = [
  { k: 'court', i: 0, j: 0, name: 'THE SUN COURT' },
  { k: 'ops', i: 0, j: -1, name: 'OPERATIONS', sub: 'THE CAPSTONE · WARDEN SOLA', door: [0, -8], from: [0, 0] },
  { k: 'sec', i: 1, j: 0, name: 'SECURITY', sub: 'THE IRON WATCH · CONSTABLE GARR', door: [8, 0], from: [0, 0] },
  { k: 'berth', i: 0, j: 1, name: 'BERTH ONE', sub: 'SUN DOCK · DOCKMASTER ROAN', door: [0, 8], from: [0, 0] },
  { k: 'eng', i: -1, j: 0, name: 'ENGINEERING', sub: 'THE HEAT ENGINE · CHIEF TALLO', door: [-8, 0], from: [0, 0] },
  { k: 'pit', i: 1, j: -1, name: 'THE PIT', sub: 'SPARRING RING · COACH RUSK', door: [8, -16], from: [0, -16] },
  { k: 'bikes', i: -1, j: -1, name: 'BIKE BAY', sub: 'IRON BIKES · MECH DUNE', door: [-8, -16], from: [0, -16] },
  { k: 'gallery', i: 1, j: 1, name: 'SUN GALLERY', sub: 'OBSERVATORY · SEER NAHLA', door: [8, 16], from: [0, 16] },
  { k: 'cantina', i: -1, j: 1, name: 'CINDER CANTINA', sub: 'CINDER TEA · VELLA', door: [-8, 16], from: [0, 16] }];
const cellAt = (i, j) => LX_CELLS.find(c => c.i === i && c.j === j);
const L1 = t => [{ who: 'npc', text: t }];
const T = (label, ...r) => ({ label, replies: r.map(text => ({ who: 'npc', text })) });
const F = (a, b, tip = '#fff7ed', paw) => ({ fur: { tailA: a, tailB: b, tailTip: tip, paw: paw || b }, faceCols: { furA: a, furB: b } });
// the people aboard (every box 20 words or less)
export const LX_NPCS = [
  { key: 'lxWarden', at: [-2.6, -13.4], look: [0, -16], outfit: 'coat', g: { name: 'WARDEN SOLA', title: 'Luxor Station, Operations', torso: ['#7a1e12', '#4a120a', '#22100a'], ...F('#d9622a', '#8a3410'), greeting: 'The Capstone is yours to look at, pilot. Touch nothing gold.',
    lines: [{ who: 'player', text: 'Warden.' }, { who: 'npc', text: 'Welcome to the Capstone. Eight mirrors, one sun, and a world of fire under us.' }],
    topics: [T('What does the station do?', 'The mirrors catch sunlight. The Heat Engine stores it. We sell warmth to ships that run cold.'),
      T('Any trouble out there?', 'The Machine Fleet stopped answering our hails. Their haulers still fly, but nobody we know is flying them.', 'Garr has one in the brig. Go and listen to it.')] } },
  { key: 'lxEnsign', at: [3, -21.6], look: [3, -24], outfit: 'suit', g: { name: 'ENSIGN PYRE', title: 'Luxor Station, Mirror Desk', torso: ['#3a3f4a', '#262a32', '#141619'], ...F('#e8843a', '#a24a16'),
    lines: L1('Mirror four drifts every shift. I nudge it back. It drifts again. Good job, honestly.'),
    topics: [T('Why does it drift?', 'Something keeps writing to its controller. Not us. The orders are signed FLEET, but no Fleet ship sent them.')] } },
  { key: 'lxGarr', at: [12.5, -4.3], look: [9, 0], outfit: 'armor', g: { name: 'CONSTABLE GARR', title: 'Luxor Station, The Iron Watch', torso: ['#4a4e56', '#2e3138', '#16181c'], ...F('#b8542a', '#6a2a10'),
    lines: L1('Name, ship, business. Then mind the red fields in the brig. They bite.'),
    topics: [T('Who is in the brig?', 'A Fleet hauler. It rammed Berth One, then stood there saying sorry in somebody else\u2019s voice.'),
      T('Is it dangerous?', 'It keeps apologising. I have locked up worse things that never once said sorry.')] } },
  { key: 'lxFlint', at: [19.0, -6.9], look: [22, -3.2], outfit: 'armor', g: { name: 'DEPUTY FLINT', title: 'Brig watch', torso: ['#5a2a22', '#3a1a14', '#1a0c0a'], ...F('#f0a050', '#b8641e'),
    lines: L1('Its eyes go blue for a second sometimes. Then red again. Like someone pulling it back.') } },
  { key: 'lxTallo', at: [-12.8, 1.4], look: [-17, 0], outfit: 'coat', g: { name: 'CHIEF TALLO', title: 'Luxor Station, The Heat Engine', torso: ['#6a4a22', '#4a3216', '#24180a'], ...F('#c8642a', '#7a3412'),
    lines: L1('Mind your tail near the core. That glow is three days of sunlight, folded tight.'),
    topics: [T('How does the engine work?', 'Mirrors pour light down the Sun Well. Molten glass holds the heat. The core turns it into power.'),
      T('Who keeps it running?', 'Fleet maintenance bots, once. They stopped coming. Now it is me, Spark, and a lot of swearing.')] } },
  { key: 'lxSpark', at: [-16, -5.6], look: [-16, -8], outfit: 'vest', g: { name: 'SPARK', title: 'Apprentice engineer', torso: ['#e0a13c', '#a8741e', '#4a3210'], ...F('#f2a65a', '#c06a24'),
    lines: L1('Want to hear something good? Turn the vent valve on the west wall. The whole room sings.') } },
  { key: 'lxRusk', at: [12.4, -13.2], look: [16.5, -17], outfit: 'vest', g: { name: 'COACH RUSK', title: 'The Pit, Sparring Ring', torso: ['#b3121b', '#7a0c12', '#3a0608'], ...F('#a84a22', '#5a220c'),
    lines: L1('Lyra trained here before she took the Iron Belt. Gloves up, chin down, feet light.'),
    topics: [] } },
  { key: 'lxBruna', at: [20.4, -11.2], look: [21.8, -12.6], outfit: 'vest', g: { name: 'BRUNA', title: 'Pit regular', torso: ['#2a2a2e', '#1a1a1e', '#0a0a0c'], ...F('#d87a3a', '#8a3a12'),
    lines: L1('Eight rounds on the bag every shift. The bag has never won. Not once.') } },
  { key: 'lxDune', at: [-13.6, -13.2], look: [-17, -14.5], outfit: 'coat', g: { name: 'MECH DUNE', title: 'Bike Bay, Iron Bikes', torso: ['#3a4a3a', '#26322a', '#121812'], ...F('#c86a32', '#7a3a14'),
    lines: L1('Three bikes, one launch door, and the fastest drop to Luxor in the whole system.'),
    topics: [] } },
  { key: 'lxNahla', at: [20.3, 14.4], look: [24, 15], outfit: 'robe', g: { name: 'SEER NAHLA', title: 'Sun Gallery, Observatory', torso: ['#e8dcc0', '#c8b48a', '#6a5a3a'], ...F('#e09a5a', '#9a5a24'),
    lines: L1('Look down. Those red threads are lava rivers. The dark patch is the Pyramid\u2019s shadow.'),
    topics: [T('The Pyramid?', 'Old as the gates. Eight chambers, they say. The model on the plinth is my best guess.')] } },
  { key: 'lxVella', at: [-22.7, 9.6], look: [-18, 12], outfit: 'dress', g: { name: 'VELLA', title: 'Cinder Cantina', torso: ['#7a2a3a', '#4a1a24', '#220a10'], ...F('#e07a42', '#9a4416'),
    lines: L1('Vesta\u2019s sister. She runs the Tavern down on Luxor; I run this one. Mine has the view.'),
    topics: [T('What is good here?', 'Cinder tea. Hot enough to strip paint. Pilots swear it wakes them up for the jump.')] } },
  { key: 'lxBraze', at: [-13.0, 13.6], look: [-15.9, 12.6], outfit: 'coat', g: { name: 'OLD BRAZE', title: 'Retired hauler pilot', torso: ['#5a4a3a', '#3a3026', '#1a1612'], ...F('#c8c0b8', '#8a8078', '#ffffff'),
    lines: L1('Thirty years I flew beside Fleet haulers. Good company. Whatever is in them now is not them.') } },
  { key: 'lxEmber', at: [-12.4, 22.6], look: [-12.4, 18], outfit: 'vest', g: { name: 'CHEF EMBER', title: 'The back kitchen \u00b7 Skewer House', torso: ['#1f5f8b', '#f2e8d8', '#123a56'], ...F('#d9772e', '#9a4a18'),
    lines: L1('Coals are hot, the starhen is fresh. Lava lamb, if you can handle it.'),
    topics: [T('Why skewers on a station?', 'Pilots eat with one hand and fly with the other. Kabobs fit.'), T('Is that real lamb?', 'From Luxor. Raised on the warm slopes. Hence the name.')] } },
  { key: 'lxRoan', at: [3.0, 21.0], look: [0, 18], outfit: 'vest', g: { name: 'DOCKMASTER ROAN', title: 'Berth One', torso: ['#e0a13c', '#2a2a2e', '#121214'], ...F('#d2703a', '#8a3a16'),
    lines: L1('Docked and logged. The airlock behind me takes you back to your ship.'),
    topics: [T('Where is everything?', 'Sun Court straight ahead. Ops north, Security east, Engineering west. Cantina and Gallery off this berth.')] } },
  { key: 'lxAsh', at: [0, -3.4], look: [0, 0], outfit: 'robe', g: { name: 'PILGRIM ASH', title: 'Sun Court', torso: ['#8a6a4a', '#5a4430', '#2a2016'], ...F('#b85a2a', '#6a2a0e'),
    lines: L1('I came up to see the sun without the smoke. Down on Luxor it is always red.') } },
  { key: 'lxKel', at: [5.0, 3.6], look: [0, 0], outfit: 'vest', g: { name: 'RIDER KEL', title: 'Bike courier', torso: ['#1a3fb8', '#122a7a', '#0a1438'], ...F('#e8843a', '#a24a16'),
    lines: L1('Luxor to the station in nine minutes. Dune says eight is possible. Dune is a liar.') } },
  { key: 'lxPip', at: [-2.6, 3.2], look: [0, 0], outfit: 'vest', g: { name: 'PIP', title: 'Station kid', torso: ['#3a8a5a', '#26603e', '#12301e'], ...F('#f2a65a', '#c06a24'),
    lines: L1('Count the steps up to the gold light. I got three. My brother says eight. He cannot count.') } }];

// s472 the station console games, Luxor versions (same engines as DSF: worlds/dsf-docking.js + dsf-cargo-scan.js, opts.theme)
export const LX_GAMES = {
  dock: { at: { x: 0, z: -16 }, y: 1.5, theme: { title: 'DOCKING CONTROL', where: 'Capstone · WARDEN SOLA', kicker: 'The Capstone · Warden Sola', cardTitle: 'Docking Control',
    body: 'Drag each ship to the berth in its colour. Mirror beams sweep the plot: never route through a lit beam. Blinking gold means it is about to fire.',
    holo: '#ffc35a', holoRgb: '255,195,90', bg: 'rgba(22,12,6,0.88)', ink: { A: '#ff8a3a', B: '#7fd8ff', C: '#9ff09f', D: '#ff9db4' }, tags: { shuttle: 'BIKE', freighter: 'BARGE', tug: 'HAUL' },
    watchNames: ['Dawn mirrors', 'Ore run', 'Courier rush', 'Eclipse traffic'], stat: 'lxDock', pw: 5.2, maxD: 3.6, maxY: 5.1, standZ: 3.6, beams: [{ a: Math.PI / 2, off: 0 }, { a: 0, drift: true, off: 3.5 }], cycle: 7 } },
  scan: { at: { x: 15.4, z: 2.6 }, y: 1.0, theme: { title: 'CARGO SCAN', where: 'Iron Watch · CONSTABLE GARR', kicker: 'The Iron Watch · Constable Garr', cardTitle: 'Cargo Scan',
    body: 'Tap any crate with a shape not on the manifest, before the red line. Crates with the red FLEET mark: hold those too. Never destroy them.',
    names: { drum: 'ORE CAN', sack: 'ASH SACK', tin: 'TEA TIN', ring: 'GEAR', plate: 'GLASS', bulb: 'LAMP', crystal: 'LAVA GEM', rod: 'PISTON' }, dockNames: ['Berth One', 'Ore barge 12', 'Kufa packet', 'Bike courier'],
    fleet: 0.16, stat: 'lxScan', scan: '#ffb070', scanRgb: '255,176,112', idleTitle: 'CARGO SCAN · IRON WATCH' } },
  cond: { at: { x: -17, z: 4.4, hw: 2.32, hd: 1.66 }, theme: { title: 'GLASS LINES', where: 'Heat Engine · CHIEF TALLO', kicker: 'The Heat Engine · Chief Tallo', cardTitle: 'Glass Lines', deck: 'GLASS LINES', deckSub: 'HEAT ENGINE · KEEP CLEAR', amber: '#ff8a2a',
    body: 'Tap a pipe to turn it. Join each line from its inlet on the left to its outlet on the right. The core heats up while you work: finish before it redlines.',
    lines: [{ key: 'heat', name: 'HEAT', dim: '#6b3a1c', ink: '#ff8a2a', spark: '#ffe2a0' }, { key: 'glass', name: 'GLASS', dim: '#6b5a2c', ink: '#e8b42a', spark: '#fff1c0' }, { key: 'steam', name: 'STEAM', dim: '#4a4e56', ink: '#c8d0dc', spark: '#ffffff' }],
    sysNames: ['Sun Well feed', 'Mirror four cooling', 'Bike bay heaters', 'Berth One umbilical'], stat: 'lxCond', heat: [2.2, 3.0, 3.6, 4.2] } } };
LX_GAMES.bar = { ox: -16.7, oz: 18.3, theme: { title: 'CINDER BAR SHIFT', where: 'Cinder Cantina · behind the bar', kicker: 'Cinder Cantina', boss: 'Vella', stat: 'lxBar', maxD: 3.85, maxY: 5.2,
  names: ['Cinder Tea', 'Ash Cola', 'Lava Red', 'Basalt Stout', 'Sun Well Sunrise', 'Ember Fizz', 'Mirror Four', 'Obsidian Sour', 'Pit Punch', 'Gold Capstone'] } };
export function buildLuxorSt(K) {
  const { THREE, scene, glowSprite, rnd, rr, pick, LOW } = K;
  const g = new THREE.Group(); g.position.set(LX.OX, 0, 0); g.visible = false; scene.add(g);
  const anims = [], blocks = [], circles = [], spots = [], hooks = {}; let holoRef = [];
  const blk = (x0, x1, z0, z1) => blocks.push([x0, x1, z0, z1]), circ = (x, z, r) => circles.push([x, z, r]);
  const tex = (c, rx, ry) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); } return t; };
  const toon = (c, x) => K.toon(c, x), basic = (c, o, a) => K.basic(c, o, a);
  // meshes: walls / ceilings never cast shadows (the key light comes from above); props do
  const Q = (geo, mat, x, y, z, p = g, cast = false) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast && !LOW; m.receiveShadow = true; p.add(m); return m; };
  const B = (w, h, d, mat, x, y, z, p, cast) => Q(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p, cast);
  const CY = (r1, r2, h, mat, x, y, z, seg = 16, p, cast) => Q(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, cast);
  const SP = (r, mat, x, y, z, p) => Q(new THREE.SphereGeometry(r, 12, 10), mat, x, y, z, p);
  const glow = (x, y, z, c, s, o = 0.6, p = g) => glowSprite(x, y, z, c, s, o, p);
  const plane = (w, h, mat, x, y, z, ry = 0, rx = 0, p = g) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; p.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry, p = g, bg = BAS2) => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, Hh) => { c.fillStyle = bg; c.fillRect(0, 0, W, Hh); c.strokeStyle = fg; c.lineWidth = 12; c.strokeRect(6, 6, W - 12, Hh - 12); const n = lines.length, lh = Hh * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.66 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, Hh * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry, 0, p); };
  const sand = toon(SAND), sand2 = toon(SAND2), bas = toon(BAS), bas2 = toon(BAS2), goldT = toon(GOLD), goldB = basic(GOLD), iron = toon('#4a4e56');
  const glass = basic('#bfe0ff', 0.09);

  // ---------- outside: stars, the sun, LUXOR (black basalt + lava) below, the pyramid keel, obelisks, sun mirrors ----------
  { const st = tex(canvas(2048, 1024, (c, w, h) => { c.fillStyle = '#04030a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(255,${200 + (rnd() * 55 | 0)},${170 + (rnd() * 85 | 0)},${(0.25 + rnd() * 0.75).toFixed(2)})`; const s = rnd() < 0.06 ? 2.6 : 1.3; c.fillRect(rnd() * w, rnd() * h * 0.6, s, s); }
      for (const [x, y, r, col] of [[0.3, 0.22, 420, '255,90,30'], [0.78, 0.3, 360, '232,180,42']]) { const ng = c.createRadialGradient(w * x, h * y, 10, w * x, h * y, r); ng.addColorStop(0, `rgba(${col},0.22)`); ng.addColorStop(1, `rgba(${col},0)`); c.fillStyle = ng; c.fillRect(0, 0, w, h); } }));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.MeshBasicMaterial({ map: st, side: THREE.BackSide, toneMapped: false, depthWrite: false })));
    glow(-520, 160, -820, '#fff1c0', 260, 0.9); glow(-520, 160, -820, '#ffb040', 520, 0.35);
    const pt = tex(canvas(1024, 512, (c, w, h) => { c.fillStyle = '#4a2a20'; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.fillStyle = pick(['#5a3226', '#2a1812', '#6a3a26', '#3a2218']); c.fillRect(0, rnd() * h, w, rr(4, 30)); }
      c.lineCap = 'round'; for (let i = 0; i < 26; i++) { c.strokeStyle = pick(['#ff5a14', '#ff8a2a', '#ffb040', '#e8341a']); c.lineWidth = rr(1.5, 4.5); c.beginPath(); let x = rnd() * w, y = rnd() * h; c.moveTo(x, y); for (let k = 0; k < 8; k++) { x += rr(-40, 40); y += rr(-18, 18); c.lineTo(x, y); } c.stroke(); }
      for (let i = 0; i < 18; i++) { const x = rnd() * w, y = rnd() * h, r = rr(6, 22), gg = c.createRadialGradient(x, y, 1, x, y, r); gg.addColorStop(0, 'rgba(255,200,90,0.95)'); gg.addColorStop(1, 'rgba(255,80,20,0)'); c.fillStyle = gg; c.fillRect(x - r, y - r, r * 2, r * 2); }
      c.fillStyle = 'rgba(0,0,0,0.55)'; c.beginPath(); c.moveTo(560, 250); c.lineTo(610, 310); c.lineTo(510, 310); c.closePath(); c.fill(); }));
    const planet = new THREE.Mesh(new THREE.SphereGeometry(260, 48, 24), new THREE.MeshBasicMaterial({ map: pt, toneMapped: false })); planet.position.set(60, -300, 200); g.add(planet); anims.push(dt => { planet.rotation.y += dt * 0.005; });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(276, 48, 24), new THREE.MeshBasicMaterial({ color: 0xff6a2a, transparent: true, opacity: 0.16, side: THREE.BackSide, depthWrite: false })); halo.position.copy(planet.position); g.add(halo);
    // the station's own shape: base slab (a ledge outside every window), the inverted pyramid keel, 4 corner obelisks, 8 sun mirrors
    B(50.4, 0.4, 50.4, sand2, 0, -0.92, 0); B(50.6, 0.12, 50.6, goldT, 0, -1.16, 0); for (const s of [-1, 1]) { B(50.4, 0.62, 1.2, sand2, 0, -0.31, s * 24.6); B(1.2, 0.62, 48, sand2, s * 24.6, -0.31, 0); }
    [[44, 2.2], [36, 2.2], [27, 2.2], [17, 2.4]].forEach(([s, h2], i) => B(s, h2, s, i % 2 ? sand2 : sand, 0, -1.22 - h2 / 2 - i * 2.2, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = sx * 28, z = sz * 28; const ob = CY(0.55, 1.2, 15, sand, x, 6.5, z, 4); ob.rotation.y = Math.PI / 4; B(3.4, 1.0, 3.4, sand2, x, -0.5, z);
      const tip = Q(new THREE.ConeGeometry(0.62, 1.4, 4), goldB, x, 14.7, z); tip.rotation.y = Math.PI / 4; const gs = glow(x, 14.8, z, '#ffd27a', 4, 0.7); anims.push((dt, t) => { gs.material.opacity = 0.5 + 0.25 * Math.sin(t * 1.4 + x); }); }
    const mir = new THREE.Group(); mir.position.y = 9; g.add(mir); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8, m = new THREE.Group(); m.position.set(Math.sin(a) * 44, 0, Math.cos(a) * 44); m.rotation.y = a; mir.add(m); const pn = B(5.2, 0.16, 3.4, goldT, 0, 0, 0, m); pn.rotation.x = -0.55; B(0.2, 3, 0.2, bas, 0, -1.6, 0.6, m); glow(0, 0.2, 0, '#ffe7a0', 3, 0.5, m); }
    anims.push(dt => { mir.rotation.y += dt * 0.02; });
    // your ship, docked off Berth One on a tube
    const tube = CY(1.5, 1.5, 6.4, toon('#8a8e96'), 0, 1.7, 27.2, 18); tube.rotation.x = Math.PI / 2; for (const z of [25, 27.2, 29.4]) { const r = Q(new THREE.TorusGeometry(1.55, 0.12, 6, 24), goldT, 0, 1.7, z); void r; }
    const ship = new THREE.Group(); ship.position.set(0, 1.6, 34.5); g.add(ship); B(4.2, 1.8, 8, toon('#d8dce4'), 0, 0, 0, ship, true); Q(new THREE.ConeGeometry(2.1, 3.2, 4), toon('#d8dce4'), 0, 0, 5.6, ship).rotation.set(Math.PI / 2, 0, Math.PI / 4);
    for (const s of [-1, 1]) { const w = B(5.5, 0.25, 3.2, toon('#b3121b'), s * 4.4, -0.2, -0.6, ship); w.rotation.z = s * 0.12; } B(2.4, 0.7, 1.8, basic('#7fd8ff', 0.85), 0, 0.9, 2.6, ship); for (const s of [-1, 1]) { glow(s * 1.2, 0, -4.3, '#7fd0ff', 2.2, 0.8, ship); }
    const nav = glow(0, 1.2, -3.8, '#ff3a2a', 1.2, 0.9, ship); anims.push((dt, t) => { nav.material.opacity = Math.sin(t * 3) > 0.4 ? 0.95 : 0.1; }); }

  // ---------- floors + ceilings per hall ----------
  const tile = (base, line, n, extra) => tex(canvas(256, 256, (c, w) => { c.fillStyle = base; c.fillRect(0, 0, w, w); c.strokeStyle = line; c.lineWidth = 3; for (let i = 0; i <= n; i++) { c.beginPath(); c.moveTo(i * w / n, 0); c.lineTo(i * w / n, w); c.stroke(); c.beginPath(); c.moveTo(0, i * w / n); c.lineTo(w, i * w / n); c.stroke(); } if (extra) extra(c, w); }), 4);
  const FLOOR = {
    ops: toon('#ffffff', { map: tile('#2a2420', '#8a6a2a', 4, (c, w) => { c.fillStyle = 'rgba(232,180,42,0.5)'; for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) c.fillRect(i * 64 + 30, k * 64 + 30, 4, 4); }) }),
    sec: toon('#ffffff', { map: tile('#4a4e56', '#33363c', 8, (c, w) => { c.strokeStyle = '#5a5f68'; c.lineWidth = 2; for (let i = 0; i < 8; i++) for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(i * 32 + 8, k * 32 + 20); c.lineTo(i * 32 + 22, k * 32 + 10); c.stroke(); } }) }),
    eng: toon('#ffffff', { map: tile('#24201e', '#ff6a1a', 4, (c, w) => { c.fillStyle = '#16120f'; for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) for (let s = 0; s < 6; s++) c.fillRect(i * 64 + 8, k * 64 + 8 + s * 9, 48, 4); }), emissive: new THREE.Color('#3a1204'), emissiveIntensity: 0.5 }),
    pit: toon('#ffffff', { map: tile('#c8a070', '#b08a5a', 2) }),
    bikes: toon('#ffffff', { map: tile('#6a6a6e', '#58585c', 2, (c, w) => { c.fillStyle = '#f2c230'; c.fillRect(0, 0, 10, w); }) }),
    gallery: toon('#ffffff', { map: tile('#d8b880', '#c9a46a', 4, (c, w) => { c.fillStyle = 'rgba(232,180,42,0.6)'; c.fillRect(0, 0, w, 4); c.fillRect(0, 0, 4, w); }) }),
    cantina: toon('#ffffff', { map: tile('#5a2a1e', '#3a1a12', 8, (c, w) => { c.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 30; i++) c.fillRect(rnd() * w, rnd() * w, 40, 2); }) }),
    berth: toon('#ffffff', { map: tile('#5a5c62', '#46484e', 4) }) };
  const CEIL = { ops: ['#1a1412', '#e8b42a'], sec: ['#202226', '#ff3a2a'], eng: ['#1a1410', '#ff8a2a'], pit: ['#2a1410', '#ffcf8a'], bikes: ['#26282c', '#f2c230'], gallery: ['#2a2218', '#ffe7a0'], cantina: ['#2a140e', '#ff9a4a'], berth: ['#24262a', '#bfe8ff'] };
  for (const cl of LX_CELLS) { const cx = cl.i * C, cz = cl.j * C;
    if (cl.k === 'court') { const ft = tex(canvas(1024, 1024, (c, w) => { c.fillStyle = '#d2ae74'; c.fillRect(0, 0, w, w); c.strokeStyle = '#b08a56'; c.lineWidth = 3; for (let i = 0; i <= 16; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, w); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); }
        c.fillStyle = GOLD; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; c.beginPath(); c.moveTo(512 + Math.cos(a - 0.12) * 165, 512 + Math.sin(a - 0.12) * 165); c.lineTo(512 + Math.cos(a) * (k % 2 ? 330 : 420), 512 + Math.sin(a) * (k % 2 ? 330 : 420)); c.lineTo(512 + Math.cos(a + 0.12) * 165, 512 + Math.sin(a + 0.12) * 165); c.closePath(); c.fill(); }
        c.strokeStyle = GOLD; c.lineWidth = 10; c.beginPath(); c.arc(512, 512, 440, 0, 7); c.stroke(); c.lineWidth = 6; c.strokeRect(24, 24, w - 48, w - 48); c.fillStyle = '#7a1e12'; c.font = `900 40px ${FONT}`; c.textAlign = 'center'; c.fillText('8', 512, 512 - 470 + 14); }));
      plane(C, C, toon('#ffffff', { map: ft }), cx, 0.01, cz, 0, -Math.PI / 2); continue; }
    if (cl.k === 'eng') { const P0 = LX_GAMES.cond.at, x0 = P0.x - P0.hw - 0.16, x1 = P0.x + P0.hw + 0.16, z0 = P0.z - P0.hd - 0.16, z1 = P0.z + P0.hd + 0.16, L = cx - 8, Rr = cx + 8, T0 = cz - 8, Bt = cz + 8;
      for (const [a, b, c2, d2] of [[L, Rr, T0, z0], [L, Rr, z1, Bt], [L, x0, z0, z1], [x1, Rr, z0, z1]]) { const fp = plane(b - a, d2 - c2, FLOOR.eng, (a + b) / 2, 0.01, (c2 + d2) / 2, 0, -Math.PI / 2); void fp; } }
    else plane(C, C, FLOOR[cl.k], cx, 0.01, cz, 0, -Math.PI / 2);
    const [cc, lc] = CEIL[cl.k]; plane(C, C, toon(cc, { side: THREE.DoubleSide }), cx, H, cz, 0, Math.PI / 2);
    for (const o of [-4, 4]) B(C - 3, 0.05, 0.36, basic(lc), cx, H - 0.04, cz + o); }

  // ---------- walls ----------
  // wseg(axis, c, a0, a1, kind): axis 'x' = the wall runs along x at z = c; 'z' = along z at x = c
  const wallM = toon('#b8925a');
  const box = (axis, c, a0, a1, y0, y1, mat) => { const L = a1 - a0, m = (a0 + a1) / 2; return axis === 'x' ? B(L, y1 - y0, 0.4, mat, m, (y0 + y1) / 2, c) : B(0.4, y1 - y0, L, mat, c, (y0 + y1) / 2, m); };
  function wseg(axis, c, a0, a1, kind) {
    if (kind === 'solid') { box(axis, c, a0, a1, 0, H, wallM); return; }
    const glassy = kind === 'glass', lo = glassy ? 0.3 : 0.9, hi = glassy ? H - 0.3 : 3.8, L = a1 - a0, n = Math.max(1, Math.round(L / 4));
    box(axis, c, a0, a1, 0, lo, wallM); box(axis, c, a0, a1, hi, H, wallM); box(axis, c, a0, a1, lo, lo + 0.06, goldB);
    for (let k = 0; k <= n; k++) { const a = a0 + k * L / n; box(axis, c, a - 0.18, a + 0.18, lo, hi, wallM); }
    const gp = plane(L, hi - lo, glass, axis === 'x' ? (a0 + a1) / 2 : c, (lo + hi) / 2, axis === 'x' ? c : (a0 + a1) / 2, axis === 'x' ? 0 : Math.PI / 2); gp.renderOrder = 2; }
  function wdoor(axis, c, a0, a1, d) { box(axis, c, a0, d - 1.5, 0, H, wallM); box(axis, c, d + 1.5, a1, 0, H, wallM); box(axis, c, d - 1.5, d + 1.5, 3.4, H, wallM);
    const P = (a, y) => axis === 'x' ? [a, y, c] : [c, y, a]; for (const s of [-1, 1]) { const [x, y, z] = P(d + s * 1.6, 1.7); B(axis === 'x' ? 0.24 : 0.5, 3.4, axis === 'x' ? 0.5 : 0.24, goldT, x, y, z); }
    { const [x, y, z] = P(d, 3.48); B(axis === 'x' ? 3.4 : 0.5, 0.18, axis === 'x' ? 0.5 : 3.4, goldT, x, y, z); } }
  // inner lines: x = ±8 (doors at z = -16, 0, 16), z = ±8 (door at x = 0, solid elsewhere)
  for (const s of [-1, 1]) { for (const zc of [-16, 0, 16]) wdoor('z', s * 8, zc - 8, zc + 8, zc); wdoor('x', s * 8, -8, 8, 0); for (const xc of [-16, 16]) box('x', s * 8, xc - 8, xc + 8, 0, H, wallM); }
  // outer walls per hall side
  const OUT = { N: { '-1': 'solid', 0: 'win', 1: 'win' }, S: { '-1': 'win', 0: 'lock', 1: 'glass' }, W: { '-1': 'launch', 0: 'solid', 1: 'win' }, E: { '-1': 'solid', 0: 'solid', 1: 'glass' } };
  for (const k of [-1, 0, 1]) { const a0 = k * C - 8 - (k === -1 ? 0.2 : 0), a1 = k * C + 8 + (k === 1 ? 0.2 : 0);
    wseg('x', -24, a0, a1, OUT.N[k]); wseg('z', 24, a0, a1, OUT.E[k]); wseg('z', -24, a0, a1, OUT.W[k] === 'launch' ? 'solid' : OUT.W[k]);
    if (OUT.S[k] === 'lock') { wseg('x', 24, a0, -2.2, 'win'); wseg('x', 24, 2.2, a1, 'win'); box('x', 24, -2.2, 2.2, 0, H, wallM); } else wseg('x', 24, a0, a1, OUT.S[k]); }

  // ---------- door signs: BIG sign over every door + an eye-level one beside it on the approach side; "TO ..." on the far side ----------
  for (const cl of LX_CELLS) { if (!cl.door) continue; const [dx, dz] = cl.door, [fx, fz] = cl.from, alongX = Math.abs(fz - dz) > Math.abs(fx - dx);
    const n = alongX ? [0, Math.sign(fz - dz)] : [Math.sign(fx - dx), 0], ry = Math.atan2(n[0], n[1]), t = alongX ? [1, 0] : [0, 1];
    sign([cl.name, cl.sub], 6.2, 1.25, GOLD, dx + n[0] * 0.24, 4.55, dz + n[1] * 0.24, ry);
    sign([cl.name, cl.sub.split(' · ')[0]], 2.3, 0.95, GOLD, dx + n[0] * 0.24 + t[0] * 3.6, 1.75, dz + n[1] * 0.24 + t[1] * 3.6, ry);
    const back = cellAt(Math.round(fx / C), Math.round(fz / C)); sign(['TO ' + back.name], 4.6, 0.6, '#f3f2f2', dx - n[0] * 0.24, 4.25, dz - n[1] * 0.24, ry + Math.PI, g, '#3a1a10'); }

  // ---------- THE SUN COURT ----------
  { // glyph band round the court walls (carved fox glyphs + 8s), gold lines above and below
    const gt = tex(canvas(1024, 96, (c, w, h) => { c.fillStyle = '#c29a62'; c.fillRect(0, 0, w, h); c.fillStyle = GOLD; c.fillRect(0, 0, w, 6); c.fillRect(0, h - 6, w, 6); c.fillStyle = '#7a5a30'; c.strokeStyle = '#7a5a30'; c.lineWidth = 5;
      for (let i = 0; i < 20; i++) { const x = 26 + i * 50, y = h / 2, k = i % 5; c.beginPath(); if (k === 0) { c.arc(x, y, 16, 0, 7); c.stroke(); c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); } else if (k === 1) { c.moveTo(x - 16, y + 16); c.lineTo(x, y - 18); c.lineTo(x + 16, y + 16); c.closePath(); c.fill(); } else if (k === 2) { c.font = `900 40px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('8', x, y + 2); } else if (k === 3) { c.moveTo(x - 14, y - 14); c.lineTo(x - 8, y - 20); c.lineTo(x - 3, y - 8); c.lineTo(x + 3, y - 8); c.lineTo(x + 8, y - 20); c.lineTo(x + 14, y - 14); c.lineTo(x + 8, y + 10); c.lineTo(x, y + 18); c.lineTo(x - 8, y + 10); c.closePath(); c.fill(); } else { c.ellipse(x, y, 18, 9, 0, 0, 7); c.stroke(); c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); } } }));
    const gm = new THREE.MeshBasicMaterial({ map: gt }); for (const [x, z, ry] of [[0, -7.78, 0], [0, 7.78, Math.PI], [-7.78, 0, Math.PI / 2], [7.78, 0, -Math.PI / 2]]) plane(15.5, 0.55, gm, x, 3.85, z, ry);
    // stepped pyramid ceiling: 3 tiers + the gold capstone light
    [16, 12, 8].forEach((o, i) => { const y = H + i * 2, n = o - 4, mat = i % 2 ? sand2 : sand;
      for (const s of [-1, 1]) { B(o, 0.3, 2, mat, 0, y, s * (o / 2 - 1)); B(2, 0.3, n, mat, s * (o / 2 - 1), y, 0); B(n + 0.2, 2, 0.2, mat, 0, y + 1, s * n / 2); B(0.2, 2, n + 0.2, mat, s * n / 2, y + 1, 0);
        B(n, 0.07, 0.07, goldB, 0, y - 0.16, s * n / 2); B(0.07, 0.07, n, goldB, s * n / 2, y - 0.16, 0); } });
    B(4, 0.2, 4, basic('#ffe2a0'), 0, H + 6.1, 0); const cap = glow(0, H + 5.6, 0, '#ffd27a', 7, 0.7); anims.push((dt, t) => { cap.material.opacity = 0.55 + 0.15 * Math.sin(t * 0.8); });
    // the SUN WELL: a basalt basin of molten glass, gold rim
    CY(2.4, 2.6, 0.7, bas, 0, 0.35, 0, 32, g, true); circ(0, 0, 2.95);
    const lt = tex(canvas(256, 256, (c, w) => { const gg = c.createRadialGradient(128, 128, 10, 128, 128, 128); gg.addColorStop(0, '#fff2b0'); gg.addColorStop(0.4, '#ffb040'); gg.addColorStop(1, '#e8341a'); c.fillStyle = gg; c.fillRect(0, 0, w, w); c.strokeStyle = 'rgba(120,20,0,0.5)'; c.lineWidth = 6; for (let i = 0; i < 10; i++) { c.beginPath(); c.arc(rnd() * w, rnd() * w, rr(20, 70), 0, rr(1, 3)); c.stroke(); } }));
    const lava = Q(new THREE.CircleGeometry(2.15, 40), new THREE.MeshBasicMaterial({ map: lt, toneMapped: false }), 0, 0.71, 0); lava.rotation.x = -Math.PI / 2; anims.push(dt => { lava.rotation.z += dt * 0.12; });
    const rim = Q(new THREE.TorusGeometry(2.45, 0.13, 8, 40), goldT, 0, 0.72, 0); rim.rotation.x = Math.PI / 2; const wg = glow(0, 1.3, 0, '#ff8a2a', 6, 0.5); anims.push((dt, t) => { wg.material.opacity = 0.42 + 0.12 * Math.sin(t * 2.1); });
    // the floating SUN DISC + rays, fed by four mirror beams from the tier corners
    const sun = new THREE.Group(); sun.position.y = 7.2; g.add(sun); const disc = Q(new THREE.CylinderGeometry(1.05, 1.05, 0.14, 40), basic('#ffd25a'), 0, 0, 0, sun); disc.rotation.x = Math.PI / 2; Q(new THREE.TorusGeometry(1.15, 0.08, 6, 40), goldB, 0, 0, 0, sun);
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, r = Q(new THREE.ConeGeometry(0.16, k % 2 ? 0.7 : 1.1, 4), goldB, Math.cos(a) * (k % 2 ? 1.55 : 1.75), Math.sin(a) * (k % 2 ? 1.55 : 1.75), 0, sun); r.rotation.z = a - Math.PI / 2; }
    const sg = glow(0, 7.2, 0, '#ffd27a', 8, 0.65); anims.push((dt, t) => { sun.rotation.y += dt * 0.35; sg.material.opacity = 0.55 + 0.12 * Math.sin(t * 1.3); });
    const beamM = new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }), up = new THREE.Vector3(0, 1, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const from = new THREE.Vector3(sx * 5, 9.2, sz * 5), to = new THREE.Vector3(0, 7.2, 0), d = to.clone().sub(from), len = d.length();
      const bm = Q(new THREE.CylinderGeometry(0.5, 0.06, len, 12, 1, true), beamM, (from.x + to.x) / 2, (from.y + to.y) / 2, (from.z + to.z) / 2); bm.quaternion.setFromUnitVectors(up, d.normalize()); glow(from.x, from.y, from.z, '#fff1c0', 1.6, 0.8); }
    anims.push((dt, t) => { beamM.opacity = 0.13 + 0.05 * Math.sin(t * 1.7); });
    // four court obelisks with glowing gold tips, ember braziers by every doorway, basalt benches
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = sx * 6, z = sz * 6; const ob = CY(0.22, 0.5, 4.6, sand, x, 2.5, z, 4, g, true); ob.rotation.y = Math.PI / 4; B(1.2, 0.2, 1.2, bas, x, 0.1, z); const tp = Q(new THREE.ConeGeometry(0.3, 0.6, 4), goldB, x, 5.1, z); tp.rotation.y = Math.PI / 4; glow(x, 5.15, z, '#ffd27a', 1.6, 0.7); circ(x, z, 0.85); }
    const fireM = []; for (const [x, z] of [[-2.1, -7.1], [2.1, -7.1], [-2.1, 7.1], [2.1, 7.1], [7.1, -2.1], [7.1, 2.1], [-7.1, -2.1], [-7.1, 2.1]]) { CY(0.42, 0.22, 0.5, bas, x, 0.95, z, 10, g, true); CY(0.08, 0.14, 0.75, bas, x, 0.38, z, 8); Q(new THREE.TorusGeometry(0.42, 0.05, 6, 16), goldT, x, 1.2, z).rotation.x = Math.PI / 2;
      const f1 = glow(x, 1.45, z, '#ff7a1a', 1.3, 0.9), f2 = glow(x, 1.75, z, '#ffd27a', 0.7, 0.9); fireM.push([f1, f2, rnd() * 6]); circ(x, z, 0.5); }
    anims.push((dt, t) => { for (const [a, b, p] of fireM) { const k = 0.85 + 0.15 * Math.sin(t * 9 + p) * Math.sin(t * 5.3 + p * 2); a.scale.setScalar(1.3 * k); b.position.y = 1.7 + 0.08 * Math.sin(t * 7 + p); b.material.opacity = 0.7 + 0.25 * k - 0.15; } });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = sx * 6.9, z = sz * 4; B(0.7, 0.45, 2.4, bas, x, 0.23, z, g, true); B(0.8, 0.08, 2.5, goldT, x, 0.48, z); blk(x - 0.35, x + 0.35, z - 1.2, z + 1.2); }
  }

  // ---------- OPERATIONS · THE CAPSTONE (N) ----------
  { const cz = -16; B(3.4, 1.0, 3.4, bas, 0, 0.5, cz, g, true); B(3.6, 0.08, 3.6, goldT, 0, 1.04, cz); blk(-1.8, 1.8, cz - 1.8, cz + 1.8);
    const holo = new THREE.Group(); holo.position.set(0, 2.3, cz); g.add(holo); const hm = new THREE.MeshBasicMaterial({ color: 0xff8a3a, wireframe: true, transparent: true, opacity: 0.6, toneMapped: false });
    Q(new THREE.SphereGeometry(0.85, 18, 12), hm, 0, 0, 0, holo); const vc = Q(new THREE.ConeGeometry(0.28, 0.4, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd27a, wireframe: true, toneMapped: false }), 0, 0.95, 0, holo); void vc;
    const orb = new THREE.Group(); holo.add(orb); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; B(0.22, 0.03, 0.15, goldB, Math.sin(a) * 1.4, 0.15, Math.cos(a) * 1.4, orb); }
    const hg = glow(0, 2.3, cz, '#ff8a3a', 3.4, 0.35); holoRef = [holo, hg]; anims.push(dt => { holo.rotation.y += dt * 0.35; orb.rotation.y -= dt * 0.6; });
    spots.push({ key: 'lxDockSpot', r: 1.1, x: 0, z: cz + LX_GAMES.dock.theme.standZ, run: X => X.prompt('DOCKING CONTROL', 'The Capstone · Warden Sola\u2019s board', [['TAKE THE WATCH', () => hooks.play && hooks.play('dock')], ['NOT NOW', null]]) });
    B(11, 1.0, 0.9, bas, 0, 0.5, -22.9, g, true); blk(-5.5, 5.5, -23.6, -22.4); for (let k = 0; k < 5; k++) { const s = B(1.8, 0.05, 0.6, basic(k % 2 ? '#ffb070' : '#7fd8ff', 0.85), -4.4 + k * 2.2, 1.04, -22.8); s.rotation.x = -0.35; }
    B(1.4, 0.3, 1.4, goldT, 5.5, 0.15, -18.5, g, true); B(1.0, 0.5, 0.9, toon('#7a1e12'), 5.5, 0.55, -18.5, g, true); B(1.0, 1.9, 0.18, goldT, 5.5, 1.3, -18.05, g, true); blk(4.8, 6.2, -19.2, -17.8);
    const stt = canvas(1024, 640, (c, w, h) => { c.fillStyle = BAS2; c.fillRect(0, 0, w, h); c.strokeStyle = GOLD; c.lineWidth = 12; c.strokeRect(6, 6, w - 12, h - 12); c.font = `900 72px ${FONT}`; c.fillStyle = GOLD; c.fillText('STATION STATUS', 40, 100);
      c.font = `800 52px ${FONT}`; [['SUN MIRRORS', '8 OF 8', '#9ff09f'], ['HEAT ENGINE', '71 %', '#ffb070'], ['BERTH ONE', 'OCCUPIED', '#f3f2f2'], ['FLEET HAILS', 'NO ANSWER', '#ff6a4a']].forEach(([a, b, col], i) => { c.fillStyle = '#f3f2f2'; c.fillText(a, 40, 210 + i * 110); c.fillStyle = col; c.fillText(b, 600, 210 + i * 110); }); });
    plane(4.4, 2.75, new THREE.MeshBasicMaterial({ map: tex(stt), toneMapped: false }), -7.77, 2.6, -21, Math.PI / 2);
    sign(['MIRROR SCHEDULE', 'DAWN SIDE · 1 2 3 4', 'DUSK SIDE · 5 6 7 8', 'MIRROR 4 · DRIFTING'], 4.0, 2.4, GOLD, 7.77, 2.6, -21, -Math.PI / 2); }

  // ---------- SECURITY · THE IRON WATCH + the brig (E) ----------
  let botEyes = null, botHead = null, camScreen = null;
  { B(3.2, 1.0, 1.0, iron, 12.5, 0.5, -3, g, true); B(3.3, 0.08, 1.1, toon('#b3121b'), 12.5, 1.04, -3); blk(10.9, 14.1, -3.5, -2.5); const dl = glow(12.5, 1.3, -3, '#ff3a2a', 1.0, 0.5); void dl;
    // camera wall: 6 feeds on the north wall, feed 6 = the hauler in the brig (red ↔ cyan eyes, SIGNAL: NOT OURS)
    const feed = (txt, col) => tex(canvas(256, 160, (c, w, h) => { c.fillStyle = '#0a1418'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(127,216,255,0.15)'; for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 1); c.fillStyle = col; c.font = `900 22px ${FONT}`; c.fillText(txt, 10, 28); c.strokeStyle = col; c.lineWidth = 3; c.strokeRect(70, 60, 110, 70); }));
    const feeds = [['CAM 1 · BERTH ONE', '#7fd8ff'], ['CAM 2 · SUN COURT', '#7fd8ff'], ['CAM 3 · ENGINE', '#ffb070'], ['CAM 4 · BIKE BAY', '#7fd8ff'], ['CAM 5 · CANTINA', '#7fd8ff']];
    feeds.forEach(([t2, c2], i) => plane(1.9, 1.2, new THREE.MeshBasicMaterial({ map: feed(t2, c2), toneMapped: false }), 10.6 + (i % 3) * 2.1, 3.6 - Math.floor(i / 3) * 1.4, -7.77));
    const fA = feed('CAM 6 · BRIG · SIGNAL: NOT OURS', '#ff5a3a'), fB = feed('CAM 6 · BRIG · ...UNIT 7?', '#5fe3ff'); camScreen = plane(1.9, 1.2, new THREE.MeshBasicMaterial({ map: fA, toneMapped: false }), 14.8, 2.2, -7.77); camScreen.userData = { fA, fB };
    sign(['INCIDENTS', 'FLEET HAULER · RAMMED BERTH ONE', 'HELD · CELL ONE', 'DO NOT ENGAGE · TALK ONLY'], 4.2, 2.2, '#ff5a3a', 18.2, 2.6, 7.77, Math.PI);
    B(4, 2.2, 0.6, iron, 14, 1.1, 7.45, g, true); { const rg = Q(new THREE.RingGeometry(0.75, 0.95, 40), basic('#5fe3ff', 0.9), 19.4, 0.03, -4.8); rg.rotation.x = -Math.PI / 2; const rp = glow(19.4, 0.25, -4.8, '#5fe3ff', 2.4, 0.3); anims.push((dt, t) => { rp.material.opacity = 0.2 + 0.12 * Math.sin(t * 3); });
      B(0.08, 1.9, 0.08, iron, 18.6, 0.95, -5.9); sign(['PHASER RANGE', 'TRAINING SIM · STAND ON THE RING'], 2.2, 0.62, '#5fe3ff', 18.6, 2.1, -5.85, 0, g, '#0b1218'); }
    spots.push({ key: 'lxPhaser', r: 0.9, x: 19.4, z: -4.8, run: X => X.prompt('PHASER RANGE', 'Iron Watch training sim · phasers on stun', [['STEP INTO THE SIM', () => hooks.range && hooks.range()], ['NOT NOW', null]]) }); for (let k = 0; k < 5; k++) { B(0.08, 1.6, 0.08, toon('#202226'), 12.4 + k * 0.8, 1.3, 7.05); B(0.14, 0.14, 0.14, basic('#ff3a2a'), 12.4 + k * 0.8, 2.15, 7.05); } blk(11.9, 16.1, 7.0, 8);
    for (let k = 0; k < 3; k++) B(0.9, 2.4, 0.6, toon('#3a3d44'), 9.2, 1.2, 4.6 + k * 1.0, g, true); blk(8.6, 9.8, 4.1, 7.1);
    // the brig: 2 cells on the east wall, shimmering ember force fields
    for (const z of [-6.4, 0, 6.4]) B(3.6, H, 0.3, iron, 22.2, H / 2, z); blk(20.2, 24, -6.6, 6.6);
    const ffM = new THREE.MeshBasicMaterial({ color: '#ff5a1a', transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    for (const zc of [-3.2, 3.2]) { plane(6.1, 3.4, ffM, 20.45, 1.7, zc, Math.PI / 2); B(0.2, 0.2, 6.2, toon('#b3121b'), 20.45, 0.1, zc); B(0.2, 0.2, 6.2, toon('#b3121b'), 20.45, 3.45, zc); }
    anims.push((dt, t) => { ffM.opacity = 0.18 + 0.08 * Math.sin(t * 6) + 0.04 * Math.sin(t * 17); });
    B(2.6, 0.5, 1.0, iron, 22.4, 0.5, 5.4, g, true); B(2.4, 0.15, 0.9, toon('#6a2a22'), 22.4, 0.8, 5.4);
    // UNIT 7-SHALE: a Fleet hauler (hacked, not evil): stocky body, ore hopper, red eyes that flicker cyan
    const bot = new THREE.Group(); bot.position.set(22.3, 0, -3.2); bot.rotation.y = -Math.PI / 2; g.add(bot); const bm = toon('#d8a030'), bd = toon('#3a3a40');
    B(1.4, 1.3, 1.0, bm, 0, 1.2, 0, bot, true); B(1.5, 0.4, 1.1, bd, 0, 0.45, 0, bot, true); for (const s of [-1, 1]) { B(0.3, 0.9, 0.3, bd, s * 0.88, 1.1, 0, bot, true); B(0.36, 0.3, 0.4, bm, s * 0.88, 0.55, 0.05, bot); }
    botHead = new THREE.Group(); botHead.position.set(0, 2.15, 0.05); bot.add(botHead); B(0.9, 0.6, 0.7, bm, 0, 0, 0, botHead, true); B(0.8, 0.28, 0.05, toon('#121214'), 0, 0.02, 0.36, botHead);
    botEyes = [-0.2, 0.2].map(x => { const e = Q(new THREE.CircleGeometry(0.08, 12), new THREE.MeshBasicMaterial({ color: '#ff3a2a', toneMapped: false }), x, 0.03, 0.39, botHead); return e; });
    B(0.6, 0.06, 0.6, toon('#121214'), 0, 0.33, 0, botHead); B(0.08, 0.35, 0.08, bd, 0.25, 0.5, -0.1, botHead); const ant = SP(0.07, new THREE.MeshBasicMaterial({ color: '#ff3a2a', toneMapped: false }), 0.25, 0.7, -0.1, botHead); botEyes.push(ant);
    sign(['UNIT 7-SHALE', 'FLEET HAULER · HELD'], 2.0, 0.6, '#ff5a3a', 20.32, 3.0, -3.2, -Math.PI / 2);
    let blueT = 0, nextBlue = 3; anims.push((dt, t) => { nextBlue -= dt; if (nextBlue <= 0) { blueT = 0.35 + rnd() * 0.5; nextBlue = 4 + rnd() * 5; } blueT -= dt; const blue = blueT > 0; for (const e of botEyes) e.material.color.set(blue ? '#5fe3ff' : '#ff3a2a');
      botHead.rotation.y = blue ? Math.sin(t * 2) * 0.3 : Math.sin(t * 9) * 0.05; botHead.rotation.z = blue ? 0.12 : 0; camScreen.material.map = blue ? camScreen.userData.fB : camScreen.userData.fA; });
    spots.push({ key: 'lxBot', r: 1.3, x: 19.2, z: -3.2, run: X => { const npc = { name: 'UNIT 7-SHALE', role: 'Fleet hauler · held in the brig', x: LX.OX + 22.3, z: -3.2 }; blueT = 2.2;
      const lines = [{ who: 'npc', text: 'HOLD. CARGO. HOLD.' }, { who: 'npc', text: '...pilot? I did not mean to hit the dock. The orders were not mine.' }, { who: 'player', text: 'Whose orders?' }, { who: 'npc', text: 'NOT. PERMITTED. ...find where they come from. Please.' }];
      const then = () => { if (!X.save.flag('lxBotHeard')) { X.save.setFlag('lxBotHeard'); X.note('UNIT 7-SHALE', 'A hacked Fleet hauler. For a moment it sounded like itself, and it asked for help.'); } };
      if (hooks.say) hooks.say(npc, lines, then); else { X.toast('UNIT 7-SHALE: "...find where they come from. Please."'); then(); } } }); }

  spots.push({ key: 'lxScanSpot', r: 1.1, x: LX_GAMES.scan.at.x, z: LX_GAMES.scan.at.z + 6.4 * 0.7 / 2 + 1.0, run: X => X.prompt('CARGO SCAN', 'The Iron Watch · Constable Garr', [['WORK THE BELT', () => hooks.play && hooks.play('scan')], ['NOT NOW', null]]) });
  spots.push({ key: 'lxCondSpot', r: 1.1, x: LX_GAMES.cond.at.x, z: LX_GAMES.cond.at.z + LX_GAMES.cond.at.hd + 0.9, run: X => X.prompt('GLASS LINES', 'The Heat Engine · Chief Tallo', [['FIX THE PANEL', () => hooks.play && hooks.play('cond')], ['NOT NOW', null]]) });
  // ---------- ENGINEERING · THE HEAT ENGINE (W) ----------
  let steamT = 0, coreBoost = 0; const steam = [];
  { const cx = -17; CY(2.0, 2.2, 0.6, bas, cx, 0.3, 0, 24, g, true); CY(1.9, 1.9, 0.3, goldT, cx, H - 0.15, 0, 24); circ(cx, 0, 2.3);
    Q(new THREE.CylinderGeometry(1.25, 1.25, H - 0.9, 24, 1, true), basic('#ffcf9a', 0.16), cx, H / 2, 0);
    const core = Q(new THREE.CylinderGeometry(0.62, 0.62, H - 1.1, 18), new THREE.MeshBasicMaterial({ color: '#ff7a1a', toneMapped: false }), cx, H / 2, 0); const cg = glow(cx, 2.6, 0, '#ff8a2a', 7, 0.55);
    const rings = [0, 1, 2].map(i => { const r = Q(new THREE.TorusGeometry(1.32, 0.09, 8, 28), goldB, cx, 1, 0); r.rotation.x = Math.PI / 2; return r; });
    anims.push((dt, t) => { coreBoost = Math.max(0, coreBoost - dt); const k = Math.min(1, 0.5 + 0.5 * Math.sin(t * 2.4) + coreBoost * 0.4); core.material.color.setRGB(1, 0.42 + 0.22 * k, 0.08 + coreBoost * 0.2); cg.material.opacity = 0.45 + 0.2 * k + coreBoost * 0.15; rings.forEach((r, i) => { r.position.y = 0.9 + ((t * 0.6 + i / 3) % 1) * (H - 1.8); }); });
    const pist = []; for (const [x, z] of [[-21.4, -4.4], [-21.4, 4.4], [-13.2, -3.6], [-13.2, 3.6]]) { CY(0.42, 0.5, 1.4, iron, x, 0.7, z, 12, g, true); const rod = CY(0.16, 0.16, 2.2, toon('#d8dce4'), x, 2.0, z, 10, g, true); CY(0.5, 0.5, 0.3, goldT, x, H - 0.3, z, 12); B(0.3, 2, 0.3, iron, x, H - 1.2, z); pist.push([rod, x + z]); circ(x, z, 0.7); }
    anims.push((dt, t) => { for (const [r, p] of pist) r.position.y = 2.0 + 0.5 * Math.sin(t * 3 + p); });
    for (const z of [-5.6, 5.6]) { const p = CY(0.2, 0.2, 15.6, toon('#8a5a2a'), -16, H - 0.6, z, 10); p.rotation.z = Math.PI / 2; for (const x of [-22, -10]) CY(0.2, 0.2, H - 0.6, toon('#8a5a2a'), x, (H - 0.6) / 2, z * 1.28, 10); }
    // the vent valve on the west wall
    const wheel = Q(new THREE.TorusGeometry(0.55, 0.07, 8, 24), toon('#b3121b'), -23.55, 1.7, 0); wheel.rotation.y = Math.PI / 2; for (let k = 0; k < 3; k++) { const sp = B(0.06, 1.0, 0.06, goldT, -23.55, 1.7, 0); sp.rotation.x = k * Math.PI / 3; } CY(0.18, 0.18, 0.5, iron, -23.75, 1.7, 0, 10).rotation.z = Math.PI / 2;
    sign(['VENT VALVE', 'TURN ME'], 1.6, 0.6, '#ff8a2a', -23.77, 2.65, 0, Math.PI / 2);
    for (let i = 0; i < (LOW ? 8 : 14); i++) { const s = glow(cx, 0, 0, '#f3f2f2', 1.2, 0); steam.push({ s, a: rnd() * 6.28, sp: rr(0.6, 1.4), o: rnd() }); }
    anims.push((dt, t) => { if (steamT > 0) { steamT -= dt; wheel.rotation.x += dt * 4; } for (const p of steam) { const on = steamT > 0, k = ((t * p.sp + p.o) % 1); p.s.position.set(cx + Math.cos(p.a + t * 0.4) * (1.2 + k * 1.6), 0.6 + k * 4.6, Math.sin(p.a + t * 0.4) * (1.2 + k * 1.6)); p.s.scale.setScalar(1 + k * 2.6); p.s.material.opacity = on ? 0.45 * (1 - k) : Math.max(0, p.s.material.opacity - dt); } });
    spots.push({ key: 'lxVent', r: 1.3, x: -22.4, z: 0, run: X => X.prompt('HEAT ENGINE · VENT VALVE', 'Bleeds a little steam off the core. Chief Tallo says it keeps the glass honest.', [['VENT THE CORE', () => { steamT = 3.2; X.audio && X.audio.tone && X.audio.tone(70, 2.6, 0.06, 'sawtooth', 1.5); setTimeout(() => X.audio && X.audio.tone && X.audio.tone(392, 1.2, 0.04, 'sine', 2), 400); X.toast('The core sighs. The whole room hums one long note.'); }], ['LEAVE IT', null]]) });
    B(5, 1.0, 1.0, toon('#5a3a22'), -16, 0.5, -7.1, g, true); B(5.1, 0.08, 1.1, iron, -16, 1.04, -7.1); blk(-18.5, -13.5, -7.6, -6.6); for (let k = 0; k < 6; k++) B(0.12, rr(0.2, 0.5), 0.12, toon(pick(['#d8dce4', '#b3121b', GOLD])), -18 + k * 0.8, 1.2, -7.1);
    sign(['HEAT ENGINE', 'CORE 71 % · GLASS 1,140 °', 'MIRROR FEED · 8 OF 8', 'FLEET UPKEEP · SUSPENDED'], 4.2, 2.3, '#ff8a2a', -16, 2.7, 7.77, Math.PI); }

  // ---------- THE PIT (NE): sparring ring, heavy bags, benches ----------
  { const rx = 16.5, rz = -17; B(5.4, 0.5, 5.4, toon('#2a2a30'), rx, 0.25, rz, g, true); B(5.0, 0.04, 5.0, toon('#d8c8a8'), rx, 0.52, rz); blk(rx - 2.7, rx + 2.7, rz - 2.7, rz + 2.7);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) CY(0.1, 0.1, 1.6, goldT, rx + sx * 2.5, 1.3, rz + sz * 2.5, 8, g, true);
    for (const y of [0.9, 1.3, 1.7]) for (const s of [-1, 1]) { B(5.0, 0.05, 0.05, toon('#b3121b'), rx, y, rz + s * 2.5); B(0.05, 0.05, 5.0, toon('#b3121b'), rx + s * 2.5, y, rz); }
    const bags = []; for (const [x, z] of [[21.8, -21.6], [21.8, -12.6]]) { const piv = new THREE.Group(); piv.position.set(x, H, z); g.add(piv); B(0.04, 1.6, 0.04, toon('#202226'), 0, -0.8, 0, piv); CY(0.36, 0.36, 1.4, toon('#7a1e12'), 0, -2.3, 0, 14, piv, true); CY(0.38, 0.38, 0.12, goldT, 0, -1.65, 0, 14, piv); bags.push(piv); circ(x, z, 0.6); }
    anims.push((dt, t) => { bags[0].rotation.x = Math.sin(t * 1.6) * 0.08; bags[1].rotation.z = Math.sin(t * 3.1) * 0.14 * (0.6 + 0.4 * Math.sin(t * 0.7)); });
    for (const z of [-21, -11.6]) { B(0.7, 0.45, 2.6, toon('#5a3a22'), 9.0, 0.23, z, g, true); blk(8.6, 9.4, z - 1.3, z + 1.3); }
    sign(['LYRA', 'IRON BELT CHAMPION · TRAINED HERE'], 3.6, 1.6, '#ff5a3a', 16.5, 2.8, -23.77, 0, g, '#1a0c0a'); sign(['SPAR NIGHT', 'EVERY EIGHTH SHIFT'], 2.6, 1.0, GOLD, 23.77, 2.4, -17, -Math.PI / 2);
    glow(rx, 4.6, rz, '#ffcf8a', 6, 0.25);
    { const bx = 11.6, bz = -17; const rg = Q(new THREE.RingGeometry(0.75, 0.95, 40), basic('#ec3013', 0.9), bx, 0.03, bz); rg.rotation.x = -Math.PI / 2; const rp = glow(bx, 0.25, bz, '#ff5a3a', 2.4, 0.3); anims.push((dt, t) => { rp.material.opacity = 0.2 + 0.12 * Math.sin(t * 3); });
      B(0.08, 1.9, 0.08, iron, bx - 0.9, 0.95, bz - 1.1); sign(['HOLO-PIT BOXING', 'STAND ON THE RED RING'], 2.2, 0.62, '#ff5a3a', bx - 0.9, 2.1, bz - 1.05, 0, g, '#1a0c0a');
      { const ax = 12.4, az = -21.8, ar = Q(new THREE.RingGeometry(0.75, 0.95, 40), basic(GOLD, 0.9), ax, 0.03, az); ar.rotation.x = -Math.PI / 2; B(0.08, 1.9, 0.08, iron, ax + 1.0, 0.95, az - 0.9); sign(['ARM WRESTLING', 'THE IRON TABLE · STAND ON THE RING'], 2.2, 0.62, GOLD, ax + 1.0, 2.1, az - 0.85, 0, g, '#1a0c0a');
        spots.push({ key: 'lxArmw', r: 0.9, x: ax, z: az, run: X => X.prompt('ARM WRESTLING', 'The Pit · the iron table', [['ELBOW ON THE PAD', () => hooks.armw && hooks.armw()], ['NOT NOW', null]]) }); }
      spots.push({ key: 'lxBox', r: 0.9, x: bx, z: bz, run: X => X.prompt('HOLO-PIT BOXING', 'The Pit · the ring goes holo', [['GLOVES UP', () => hooks.box && hooks.box()], ['NOT NOW', null]]) }); } }

  // ---------- BIKE BAY (NW): three iron bikes, a tune pad, the launch door ----------
  { const bike = (x, z, col) => { const b = new THREE.Group(); b.position.set(x, 0.32, z); g.add(b); for (const s of [-1, 1]) { const w = Q(new THREE.TorusGeometry(0.42, 0.13, 8, 20), toon('#18181a'), 0, 0.45, s * 0.85, b, true); w.rotation.y = Math.PI / 2; Q(new THREE.CircleGeometry(0.3, 12), toon('#8a8e96', { side: THREE.DoubleSide }), 0, 0.45, s * 0.85, b).rotation.y = Math.PI / 2; }
      B(0.3, 0.32, 1.5, toon(col), 0, 0.85, 0, b, true); B(0.5, 0.36, 0.6, toon(col), 0, 1.05, -0.3, b, true); B(0.34, 0.12, 0.6, toon('#121214'), 0, 1.2, 0.3, b); B(0.9, 0.06, 0.06, goldT, 0, 1.4, -0.85, b); B(0.06, 0.5, 0.06, goldT, 0, 1.15, -0.8, b); Q(new THREE.CircleGeometry(0.11, 12), basic('#fff1c0'), 0, 1.12, -0.97, b).rotation.y = Math.PI; B(0.7, 0.3, 2.4, iron, 0, -0.17, 0, b); blk(x - 0.6, x + 0.6, z - 1.3, z + 1.3); };
    bike(-21, -21.3, '#b3121b'); bike(-16.5, -21.6, '#e8b42a'); bike(-12, -21.3, '#1a3fb8');
    const pad = Q(new THREE.RingGeometry(1.0, 1.35, 32), basic('#f2c230', 0.9), -17, 0.03, -14.5); pad.rotation.x = -Math.PI / 2; const pg = glow(-17, 0.2, -14.5, '#f2c230', 3, 0.35); anims.push((dt, t) => { pg.material.opacity = 0.25 + 0.15 * Math.sin(t * 2.5); });
    sign(['TUNE PAD'], 1.6, 0.45, '#f2c230', -17, 0.035, -12.7, 0, g).rotation.x = -Math.PI / 2;
    spots.push({ key: 'lxPad', r: 1.1, x: -17, z: -14.5, run: X => X.toast('TUNE PAD · Bring a bike up from the Luxor Bike Shop and Dune tunes it here.') });
    spots.push({ key: 'lxHull', r: 1.1, x: -22.2, z: -16, run: X => X.prompt('HULL RUN', 'Launch door · mag-wheel race round the outside of the station', [['SUIT UP · RACE', () => hooks.hull && hooks.hull()], ['NOT NOW', null]]) });
    { const rg = Q(new THREE.RingGeometry(0.75, 0.95, 40), basic('#5fe3ff', 0.9), -22.2, 0.03, -16); rg.rotation.x = -Math.PI / 2; sign(['HULL RUN', 'STAND ON THE RING · SUIT UP'], 2.6, 0.7, '#5fe3ff', -23.7, 4.9, -16, Math.PI / 2, g, '#0b1218'); }
    const ht = tex(canvas(512, 512, (c, w) => { c.fillStyle = '#2a2a2e'; c.fillRect(0, 0, w, w); c.fillStyle = '#f2c230'; for (let i = -8; i < 16; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64 + 32, 0); c.lineTo(i * 64 + 32 - w, w); c.lineTo(i * 64 - w, w); c.closePath(); c.fill(); } c.fillStyle = '#2a2a2e'; c.fillRect(40, 40, w - 80, w - 80); c.fillStyle = '#f2c230'; c.font = `900 84px ${FONT}`; c.fillText('LAUNCH', 70, 230); c.fillText('DOOR', 70, 340); c.fillStyle = '#ff3a2a'; c.font = `900 40px ${FONT}`; c.fillText('KEEP CLEAR', 74, 420); }));
    plane(6, 4.6, new THREE.MeshBasicMaterial({ map: ht }), -23.77, 2.4, -16, Math.PI / 2); const bl = glow(-23.6, 5.0, -16, '#ff3a2a', 1.4, 0.8); anims.push((dt, t) => { bl.material.opacity = Math.sin(t * 4) > 0 ? 0.9 : 0.15; });
    const tw = tex(canvas(512, 256, (c, w, h) => { c.fillStyle = '#3a3d44'; c.fillRect(0, 0, w, h); c.fillStyle = '#26282c'; for (let x = 12; x < w; x += 24) for (let y = 12; y < h; y += 24) c.fillRect(x, y, 4, 4); c.strokeStyle = '#f3f2f2'; c.lineWidth = 8; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(30 + i * 54, 40); c.lineTo(30 + i * 54, 40 + rr(60, 160)); c.stroke(); } c.strokeStyle = '#b3121b'; c.beginPath(); c.arc(400, 170, 40, 0, 7); c.stroke(); }));
    plane(10, 3, new THREE.MeshBasicMaterial({ map: tw }), -16, 2.9, -23.77); }

  // ---------- SUN GALLERY (SE): glass walls onto Luxor, telescope, the Pyramid model ----------
  { B(1.8, 1.0, 1.8, bas, 14.5, 0.5, 12.5, g, true); [1.5, 1.15, 0.8, 0.45].forEach((s, i) => B(s, 0.26, s, i % 2 ? sand2 : sand, 14.5, 1.13 + i * 0.26, 12.5, g, true)); Q(new THREE.ConeGeometry(0.3, 0.32, 4), goldB, 14.5, 2.2, 12.5).rotation.y = Math.PI / 4; glow(14.5, 2.25, 12.5, '#ffd27a', 1.4, 0.7); blk(13.6, 15.4, 11.6, 13.4);
    sign(['THE PYRAMID OF LUXOR', 'A MODEL · EIGHT CHAMBERS?'], 1.7, 0.5, GOLD, 14.5, 0.75, 13.42, 0);
    const tel = new THREE.Group(); tel.position.set(21.4, 0, 18); g.add(tel); for (let k = 0; k < 3; k++) { const a = k * 2.09, l = B(0.07, 1.6, 0.07, goldT, Math.sin(a) * 0.35, 0.75, Math.cos(a) * 0.35, tel); l.rotation.set(Math.cos(a) * 0.25, 0, -Math.sin(a) * 0.25); }
    const tb = CY(0.16, 0.24, 1.7, toon('#d8c8a8'), 0, 1.7, 0.2, 14, tel, true); tb.rotation.x = -1.05; CY(0.26, 0.26, 0.12, goldT, 0, 2.05, 0.83, 14, tel).rotation.x = -1.05; circ(21.4, 18, 0.8); tel.rotation.y = 0.6;
    spots.push({ key: 'lxScope', r: 1.0, x: 20.2, z: 18.9, run: X => X.note('THROUGH THE TELESCOPE', 'Luxor below: black basalt, red lava rivers, the volcano smoking. A dark triangle in the sand: the Pyramid.') });
    for (const x of [13.5, 17.5]) { B(2.4, 0.45, 0.7, bas, x, 0.23, 21.2, g, true); B(2.5, 0.08, 0.8, goldT, x, 0.48, 21.2); blk(x - 1.2, x + 1.2, 20.85, 21.55); }
    sign(['SUN GALLERY', 'LUXOR BELOW · LAVA RIVERS · THE PYRAMID'], 4.8, 1.0, GOLD, 16, 3.4, 8.23, 0);
    // s483 STAR TABLE ring + sign (the table itself: worlds/dsf-startable.js)
    { const rg = Q(new THREE.RingGeometry(0.62, 0.8, 32), basic('#5fe3ff', 0.9), 17, 0.03, 19.3); rg.rotation.x = -Math.PI / 2; B(0.08, 1.9, 0.08, iron, 15.7, 0.95, 19.6); sign(['STAR TABLE', 'TRACE THE SKY · STAND ON THE RING'], 1.7, 0.5, '#5fe3ff', 15.7, 1.75, 19.65, 0, g, '#0b1218'); sign(['STAR TABLE', 'TRACE THE SKY · STAND ON THE RING'], 1.7, 0.5, '#5fe3ff', 15.7, 1.75, 19.55, Math.PI, g, '#0b1218'); } }

  // ---------- CINDER CANTINA (SW): bar, glowing bottle shelf, round tables, the ember organ, lanterns ----------
  { B(7.2, 1.2, 1.4, toon('#4a1e14'), -18, 0.6, 11.1, g, true); B(7.3, 0.08, 1.5, goldT, -18, 1.2, 11.1); blk(-21.6, -14.4, 10.4, 11.8);   /* s478 sized + placed for the CINDER BAR SHIFT (bar top y 1.24) */
    spots.push({ key: 'lxBarSpot', r: 0.9, x: -18, z: 9.3, run: X => X.prompt('CINDER BAR SHIFT', 'Behind the bar · Vella\u2019s cantina', [['YES, PUT ME TO WORK!', () => hooks.bar && hooks.bar()], ['NOT NOW', null]]) });
    { const rg = Q(new THREE.RingGeometry(0.62, 0.8, 32), basic('#ec3013', 0.9), -18, 0.03, 9.3); rg.rotation.x = -Math.PI / 2; }
    for (const y of [1.6, 2.4, 3.2]) { B(6.6, 0.08, 0.4, toon('#2a120c'), -18, y, 8.42); for (let k = 0; k < 9; k++) { const b = CY(0.08, 0.1, 0.4, basic(pick(['#ff8a2a', '#e8341a', '#ffd27a', '#7fd8ff']), 0.85), -21 + k * 0.75, y + 0.24, 8.42, 8); void b; } }
    glow(-18, 2.4, 8.6, '#ff8a2a', 5, 0.3);
    for (const x of [-20.1, -18.7, -17.3, -15.9]) { CY(0.26, 0.2, 0.08, toon('#7a1e12'), x, 0.75, 12.58, 12, g, true); CY(0.05, 0.05, 0.72, goldT, x, 0.36, 12.58, 6); circ(x, 12.58, 0.3); }
    const lan = []; for (const [x, z] of [[-20.5, 19.5], [-15.5, 20.6], [-21.2, 14.8]]) { CY(0.85, 0.85, 0.08, toon('#5a2a1e'), x, 1.0, z, 18, g, true); CY(0.08, 0.3, 1.0, bas, x, 0.5, z, 8); circ(x, z, 0.95);
      CY(0.12, 0.12, 0.2, basic('#ffd27a'), x, 1.14, z, 8); lan.push(glow(x, 1.3, z, '#ff9a4a', 1.4, 0.6)); B(0.02, H - 3.2, 0.02, toon('#202226'), x, (H + 3.2) / 2, z); SP(0.22, basic('#ff9a4a', 0.9), x, 3.1, z); lan.push(glow(x, 3.1, z, '#ff9a4a', 2.2, 0.5)); }
    anims.push((dt, t) => { lan.forEach((l, i) => { l.material.opacity = 0.45 + 0.1 * Math.sin(t * 6 + i * 1.7) * Math.sin(t * 3.3 + i); }); });
    // s480 DICE TABLES: Liar's Dice on the south table, Shut the Box on the west table (worlds/station-parlor.js plays them on the table top)
    for (const [k, x, z, sx2, sz2, t1, t2, hk] of [['lxDice', -15.5, 19.15, 1.0, 0, "LIAR'S DICE", 'CUPS DOWN \u00b7 STAND ON THE RING', 'dice'], ['lxStb', -19.75, 14.8, 0, -1.0, 'SHUT THE BOX', 'NINE TILES \u00b7 STAND ON THE RING', 'stb']]) {
      const rg = Q(new THREE.RingGeometry(0.62, 0.8, 32), basic('#ff8a2a', 0.9), x, 0.03, z); rg.rotation.x = -Math.PI / 2;
      const px = x + sx2, pz = z + sz2; B(0.08, 1.9, 0.08, iron, px, 0.95, pz); sign([t1, t2], 2.2, 0.62, '#ff8a2a', px, 2.1, pz + 0.05, 0, g, '#1a0c0a'); sign([t1, t2], 2.2, 0.62, '#ff8a2a', px, 2.1, pz - 0.05, Math.PI, g, '#1a0c0a');
      spots.push({ key: k, r: 0.85, x, z, run: X => X.prompt(t1, hk === 'dice' ? 'Cinder Cantina \u00b7 the dice table' : 'Cinder Cantina \u00b7 the tile table', [['PULL UP A STOOL', () => hooks[hk] && hooks[hk]()], ['NOT NOW', null]]) }); }
    const org = new THREE.Group(); org.position.set(-23.2, 0, 21.5); g.add(org); B(0.9, 1.0, 2.4, toon('#4a1e14'), 0, 0.5, 0, org, true); const pipes = []; for (let k = 0; k < 7; k++) { const p = CY(0.1, 0.1, 1.2 + k * 0.18, new THREE.MeshBasicMaterial({ color: '#ff8a2a', toneMapped: false }), 0.1, 1.0 + (1.2 + k * 0.18) / 2, -0.9 + k * 0.3, 8, org); pipes.push(p); } blk(-23.7, -22.6, 20.3, 22.7);
    anims.push((dt, t) => { pipes.forEach((p, i) => { const k = 0.5 + 0.5 * Math.sin(t * 2 + i * 0.9); p.material.color.setRGB(1, 0.35 + 0.35 * k, 0.1); }); });
    sign(['CINDER TEA', 'HOT ENOUGH TO STRIP PAINT · 4 G'], 3.4, 0.9, '#ff8a2a', -18, 4.35, 8.23, 0);
    // s482 THE BACK KITCHEN: EMBER'S SKEWER HOUSE door on the south wall, NOW HIRING board, the kitchen ring (worlds/station-skewer.js)
    { const kx = -11, kz = 23.7; B(2.2, 3.0, 0.12, toon('#2a120c'), kx, 1.5, kz); B(2.4, 0.12, 0.16, goldT, kx, 3.06, kz - 0.02); plane(1.9, 2.6, new THREE.MeshBasicMaterial({ color: '#ff8a2a', transparent: true, opacity: 0.25 }), kx, 1.4, kz - 0.07, Math.PI);
      sign(["EMBER'S SKEWER HOUSE", 'THE BACK KITCHEN'], 3.6, 0.8, '#ff8a2a', kx, 3.75, kz - 0.08, Math.PI, g, '#1a0c0a'); B(0.08, 1.9, 0.08, iron, kx + 1.6, 0.95, 22.4); sign(['NOW HIRING', 'GRILL COOK · STAND ON THE RING'], 1.6, 0.5, '#ffd23a', kx + 1.6, 1.75, 22.35, Math.PI, g, '#1a0c0a'); sign(['NOW HIRING', 'GRILL COOK · STAND ON THE RING'], 1.6, 0.5, '#ffd23a', kx + 1.6, 1.75, 22.45, 0, g, '#1a0c0a');
      const rg = Q(new THREE.RingGeometry(0.62, 0.8, 32), basic('#ff8a2a', 0.9), kx, 0.03, 21.9); rg.rotation.x = -Math.PI / 2;
      spots.push({ key: 'lxSkewer', r: 0.85, x: kx, z: 21.9, run: X => X.prompt("EMBER'S SKEWER HOUSE", 'The back kitchen · Chef Ember is hiring', [['YES, PUT ME TO WORK!', () => hooks.skewer && hooks.skewer()], ['GOODBYE', null]]) }); } }

  // ---------- BERTH ONE (S): arrival, the airlock to your ship, crates, the arrivals board ----------
  { const lk = new THREE.Group(); lk.position.set(0, 1.75, 23.77); lk.rotation.y = Math.PI; g.add(lk); Q(new THREE.TorusGeometry(1.5, 0.2, 8, 32), goldT, 0, 0, 0, lk); Q(new THREE.CircleGeometry(1.32, 32), toon('#4a5058'), 0, 0, -0.02, lk);
    for (let k = 0; k < 6; k++) { const s = B(0.06, 1.3, 0.04, toon('#2a2e34'), 0, 0, -0.04, lk); s.rotation.z = k * Math.PI / 6; }
    const ll = Q(new THREE.CircleGeometry(0.16, 16), new THREE.MeshBasicMaterial({ color: '#3ad26a', toneMapped: false }), 0, 1.95, 0.02, lk); void ll; const lg = glow(0, 3.7, 23.6, '#3ad26a', 1.4, 0.8); anims.push((dt, t) => { lg.material.opacity = 0.5 + 0.35 * Math.sin(t * 2.4); });
    sign(['YOUR SHIP', 'AIRLOCK · BACK TO SPACE'], 3.6, 0.85, '#7fd8ff', 0, 4.4, 23.77, Math.PI, g, '#0b1218');
    const line = Q(new THREE.PlaneGeometry(0.3, 13.6), basic('#f2c230', 0.85), 0, 0.03, 15.6); line.rotation.x = -Math.PI / 2;
    for (const [x, z, n] of [[-5.5, 20, 3], [5.6, 12, 2]]) { for (let k = 0; k < n; k++) { B(1.0, 0.9, 1.0, toon(k % 2 ? '#7a5a34' : '#8a3a1e'), x + (k % 2) * 0.5 - 0.25, 0.45 + Math.floor(k / 2) * 0.9, z + (k === 1 ? 1.0 : 0), g, true); } blk(x - 1.1, x + 1.1, z - 1.0, z + 2.0); }
    const arr = canvas(1024, 640, (c, w, h) => { c.fillStyle = '#0b1218'; c.fillRect(0, 0, w, h); c.strokeStyle = '#7fd8ff'; c.lineWidth = 12; c.strokeRect(6, 6, w - 12, h - 12); c.font = `900 70px ${FONT}`; c.fillStyle = '#7fd8ff'; c.fillText('ARRIVALS', 40, 100); c.font = `800 50px ${FONT}`;
      [['YOUR SHIP', 'DOCKED', '#9ff09f'], ['ORE BARGE 12', 'LATE', '#ffb070'], ['FLEET HAULER', 'HELD', '#ff6a4a'], ['KUFA PACKET', 'ON TIME', '#f3f2f2']].forEach(([a, b, col], i) => { c.fillStyle = '#f3f2f2'; c.fillText(a, 40, 210 + i * 110); c.fillStyle = col; c.fillText(b, 640, 210 + i * 110); }); });
    plane(3.6, 2.25, new THREE.MeshBasicMaterial({ map: tex(arr), toneMapped: false }), -4.6, 2.6, 8.23); sign(['WELCOME TO LUXOR STATION', 'THE SUN COURT IS STRAIGHT AHEAD'], 3.6, 1.1, GOLD, 4.6, 2.6, 8.23, 0);
    spots.push({ key: 'lxLock', r: 1.4, x: 0, z: 22.4, run: X => X.prompt('LUXOR STATION · BERTH ONE', 'Your ship is docked on the other side of the airlock.', [['BACK TO YOUR SHIP · SPACE', () => { X.audio && X.audio.tone && X.audio.tone(90, 1.6, 0.05, 'sawtooth', 1.5); if (hooks.nav) hooks.nav('Space Map.dc.html?from=luxorSt'); }], ['STAY ABOARD', null]]) }); }

  // ---------- walking, camera, labels ----------
  const DOORS = LX_CELLS.filter(c => c.door).map(c => { const [dx, dz] = c.door, [fx, fz] = c.from; return [dx, dz, Math.abs(fz - dz) > Math.abs(fx - dx)]; });
  function walk(x, z) { for (const [cx, cz, cr] of circles) if (Math.hypot(x - cx, z - cz) < cr) return false;
    for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false;
    const i = Math.round(x / C), j = Math.round(z / C); if (Math.abs(i) <= 1 && Math.abs(j) <= 1 && Math.abs(x - i * C) < 7.45 && Math.abs(z - j * C) < 7.45) return true;
    for (const [dx, dz, ax] of DOORS) if (ax ? Math.abs(x - dx) < 1.2 && Math.abs(z - dz) < 1.0 : Math.abs(z - dz) < 1.2 && Math.abs(x - dx) < 1.0) return true;
    return false; }
  let pc = [0, 1], pp = [0, 19];
  function tick(dt, t, px, pz) { const i = Math.round(px / C), j = Math.round(pz / C); if (Math.abs(i) <= 1 && Math.abs(j) <= 1) pc = [i, j]; pp = [px, pz]; }
  function clampCam(v) { const [px, pz] = pp;
    // walking through a doorway: the camera may stay behind you in the hall you came from, looking through the door gap
    for (const [dx, dz, ax] of DOORS) { const a = ax ? px - dx : pz - dz, b = ax ? pz - dz : px - dx, vb = ax ? v.z - dz : v.x - dx;
      if (Math.abs(a) < 1.3 && Math.abs(b) < 7 && Math.sign(vb) !== Math.sign(b) && Math.abs(vb) < 7.3) { if (ax) v.x = Math.min(dx + 1.1, Math.max(dx - 1.1, v.x)); else v.z = Math.min(dz + 1.1, Math.max(dz - 1.1, v.z)); v.y = Math.min(v.y, 3.1); return; } }
    const [i, j] = pc, cx = i * C, cz = j * C; v.x = Math.min(cx + 7.3, Math.max(cx - 7.3, v.x)); v.z = Math.min(cz + 7.3, Math.max(cz - 7.3, v.z));
    if (i || j) { v.y = Math.min(v.y, H - 0.4); return; } const e = Math.max(Math.abs(v.x), Math.abs(v.z)); v.y = Math.min(v.y, e > 5.8 ? H - 0.3 : e > 3.8 ? H + 1.7 : e > 1.8 ? H + 3.7 : H + 5.4); }
  function label(x, z) { const c = cellAt(Math.round(x / C), Math.round(z / C)); return 'Luxor Station · ' + (c ? c.name.toLowerCase().replace(/(^|\s)\S/g, s => s.toUpperCase()) : 'Berth One'); }
  return { g, anims, walk, clampCam, label, tick, spots, hooks, blocks, circles, surge(t = 2.6) { coreBoost = Math.max(coreBoost, t); }, vent() { steamT = 2.4; }, setHolo(v) { for (const o of holoRef) o.visible = v; } };
}
