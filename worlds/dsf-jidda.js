// JIDDA STATION [dsfOutJi] (s496): Jidda's own station, the leafy ring with the surfboard spokes and the tiki-hut pods. Built far away
// at (OX, 0, 0), only shown while you are aboard (Deep Space Fox.dc.html?at=jidda, from the Space Map dock). An indoor LAGOON under a
// glass dome: turquoise water is the floor, timber PIERS are the roads, little boats bob at their moorings. In the middle THE CREST
// ISLAND (sand, a palm, tiki torches, the fire pit, the crest mooring), and six round TIKI HUTS on their own decks round it:
// OPERATIONS · THE CROW'S NEST (N), SECURITY · THE NET HUT (NE: a Fleet unit wrapped in fishing nets, soaked), ENGINEERING · THE TIDE
// PUMPS (SE: they keep the lagoon from draining away), BERTH EIGHT (S, arrival + airlock), THE SURF SHACK (SW), THE LONG BOARD (NW,
// shuffleboard lounge). Jidda's lagoons glow turquoise below.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const SEA = '#2ab8c8', SEA2 = '#1a8aa8', SAND = '#f0dca8', THATCH = '#c8a050', TIMBER = '#9a7048', TIMBER2 = '#6a4a2e', CYAN = '#5fe3ff';
export const JI = { OX: 52000, hw: 33, hd: 33, h: 14, door: { x: 999, z: 999 }, enter: { x: 0, z: 20.6 } };
const POL = (r, deg) => [Math.sin(deg * Math.PI / 180) * r, -Math.cos(deg * Math.PI / 180) * r];
export const JI_ROOMS = [
  { k: 'island', x: 0, z: 0, r: 8, h: 13, name: 'THE CREST ISLAND' },
  { k: 'ops', a: 0, d: 22, r: 6.2, h: 5.6, name: 'OPERATIONS', sub: 'THE CROW\u2019S NEST \u00b7 WARDEN MARLIN' },
  { k: 'sec', a: 60, d: 23.5, r: 7.5, h: 5.4, name: 'SECURITY', sub: 'THE NET HUT \u00b7 BOSUN KAI' },
  { k: 'eng', a: 120, d: 22, r: 6.2, h: 5.8, name: 'ENGINEERING', sub: 'THE TIDE PUMPS \u00b7 CHIEF CORAL' },
  { k: 'berth', a: 180, d: 22, r: 6.2, h: 5.4, name: 'BERTH EIGHT', sub: 'LAGOON DOCK \u00b7 DOCKMASTER REEF' },
  { k: 'surf', a: 240, d: 22, r: 6.2, h: 5.4, name: 'THE SURF SHACK', sub: 'BOARDS + WAX \u00b7 SANDY' },
  { k: 'long', a: 300, d: 22, r: 6.2, h: 5.4, name: 'THE LONG BOARD', sub: 'SHUFFLEBOARD \u00b7 OLD JETTY' }].map(R => R.a == null ? R : (() => { const [x, z] = POL(R.d, R.a); return { ...R, x, z }; })());
const PIERS = JI_ROOMS.slice(1).map(R => { const [ax, az] = POL(7.6, R.a), [bx, bz] = POL(R.d - R.r + 0.4, R.a); return { a: [ax, az], b: [bx, bz], w: 1.45, deg: R.a }; })
  .concat([{ a: POL(14.5, 0), b: POL(14.5, 60), w: 1.2 }, { a: POL(14.5, 120), b: POL(14.5, 180), w: 1.2 }, { a: POL(14.5, 240), b: POL(14.5, 300), w: 1.2 }].map(p => ({ ...p, ring: true })));
const L1 = t => [{ who: 'npc', text: t }];
const T = (label, ...r) => ({ label, replies: r.map(text => ({ who: 'npc', text })) });
const F = (a, b, tip = '#fff7ed', paw) => ({ fur: { tailA: a, tailB: b, tailTip: tip, paw: paw || b }, faceCols: { furA: a, furB: b } });
const RM = k => JI_ROOMS.find(r => r.k === k), REL = (k, dx, dz) => { const R = RM(k); return [R.x + dx, R.z + dz]; };
// the people aboard (every box 20 words or less; names DRAFT for Ben)
export const JI_NPCS = [
  { key: 'jsMarlin', at: REL('ops', -2.6, -1.4), look: REL('ops', 0, 0), outfit: 'coat', g: { name: 'WARDEN MARLIN', title: 'Jidda Station, The Crow\u2019s Nest', torso: ['#1a6a8a', '#124a62', '#0a2432'], ...F('#e0904a', '#9a4a1a'), greeting: 'Welcome aboard, sailor. Mind the piers, the lagoon is deeper than it looks.',
    lines: [{ who: 'player', text: 'Warden.' }, { who: 'npc', text: 'Jidda Station. A lagoon in a bottle, a palm on an island, and the finest crow\u2019s nest in orbit.' }],
    topics: [T('Why a lagoon up here?', 'Jidda folk get nervous away from water. So we brought some. The tide pumps keep it from leaving.'),
      T('Any trouble out there?', 'Squalls on the lanes, corsairs off the Reach, and a Fleet unit Kai fished out of the lagoon.')] } },
  { key: 'jsNell', at: REL('ops', 3.2, -3.4), look: REL('ops', 3.2, -6), outfit: 'suit', g: { name: 'ENSIGN NELL', title: 'Jidda Station, Lane Watch', torso: ['#3a3f4a', '#262a32', '#141619'], ...F('#e8a060', '#a2581a'),
    lines: L1('Squall on lane three. Ships come in soaked and cross. I hand out towels. It helps, honestly.') } },
  { key: 'jsKai', at: REL('sec', -1.5, 5.2), look: REL('sec', 0, 0), outfit: 'armor', g: { name: 'BOSUN KAI', title: 'Security, The Net Hut', torso: ['#2a4a5a', '#1a323e', '#0a181e'], ...F('#d9843a', '#8a4414'),
    lines: L1('Name, ship, cargo. Corsairs say fisherman. Fishermen say corsair. I believe nobody and check everybody.'),
    topics: [T('What is in the nets?', 'A Fleet unit. Fell in the lagoon. Wet, it talks like itself. Says there is someone aboard that ship.')] } },
  { key: 'jsCoral', at: REL('eng', 3.8, 1.8), look: REL('eng', 0, 0), outfit: 'vest', g: { name: 'CHIEF CORAL', title: 'Engineering, The Tide Pumps', torso: ['#b3502a', '#7a3418', '#3a180a'], ...F('#e0a060', '#9a5a2a'),
    lines: L1('Water keeps trying to drain out of the lagoon. Down on Jidda too. The pumps push it back. Every hour.'),
    topics: [T('Where does it drain to?', 'Down there, something under the Corsair Reach. Up here, toward the Belt. Water does not usually pick a direction.')] } },
  { key: 'jsReef', at: REL('berth', 3.4, -1.6), look: REL('berth', 0, 0), outfit: 'coat', g: { name: 'DOCKMASTER REEF', title: 'Berth Eight, Lagoon Dock', torso: ['#4a6a7a', '#2e4a56', '#16262c'], ...F('#d8b080', '#8a6a3a'),
    lines: L1('Your ship is moored, sailor. Wipe the salt off your boots. Or do not, everyone else is salty too.') } },
  { key: 'jsSandy', at: REL('surf', 0, -3.6), look: REL('surf', 0, 0), outfit: 'vest', g: { name: 'SANDY', title: 'The Surf Shack', torso: ['#ffd23a', '#c8a020', '#5a4810'], ...F('#f0c080', '#b07a3a'),
    lines: L1('Boards, wax, and the only wave machine in orbit. It makes one wave. It is a very good wave.') } },
  { key: 'jsJetty', at: REL('long', 2.4, -2.8), look: REL('long', -1, 0), outfit: 'coat', g: { name: 'OLD JETTY', title: 'The Long Board', torso: ['#5a4a3a', '#3a2e22', '#1a140e'], ...F('#d8c8a8', '#9a8a6a'),
    lines: L1('Slide the puck, stop it on the stripe. Simple game. Forty years and I still lose to my nephew.') } },
  { key: 'jsLani', at: [3.6, 3.4], look: [0, 0], outfit: 'dress', g: { name: 'LANI', title: 'Keeper of the Crest Island', torso: ['#2ab8c8', '#1a8aa8', '#0a4a5a'], ...F('#f2d8b8', '#c09a7a'),
    lines: L1('Sit by the fire, sailor. The palm was a coconut once, carried up in a fisher\u2019s pocket.'),
    topics: [T('What do the fishers say?', 'Nets come up empty near the Belt. And the water hums there, low. Like a song you almost know.')] } }];
// s496 the station console games, Jidda versions (engines: dsf-docking / dsf-cargo-scan / dsf-conduit, opts.theme)
export const JI_GAMES = {
  dock: { at: { x: RM('ops').x, z: RM('ops').z }, y: 1.5, theme: { title: 'DOCKING CONTROL', where: 'The Crow\u2019s Nest \u00b7 WARDEN MARLIN', kicker: 'Jidda Station \u00b7 Warden Marlin', cardTitle: 'Docking Control',
    body: 'Drag each ship to the berth in its colour. A squall drifts across the plot: route every ship round the rain.', holo: '#5fe3ff', holoRgb: '95,227,255', bg: 'rgba(4,16,22,0.88)',
    tags: { shuttle: 'SKIFF', freighter: 'TRAWLER', tug: 'SURFER' }, watchNames: ['Morning tide', 'Fish run', 'Surf season', 'Squall watch'], stat: 'jsDock', pw: 5.2, maxD: 3.5, maxY: 5.0, standZ: 3.6,
    storm: { r: 14, speed: 6 }, hazardWord: 'SOAKED', hazardNote: ' flew into the squall.' } },
  scan: { at: { x: RM('sec').x + 0.6, z: RM('sec').z + 0.6 }, y: 1.0, theme: { title: 'CARGO SCAN', where: 'The Net Hut \u00b7 BOSUN KAI', kicker: 'The Net Hut \u00b7 Bosun Kai', cardTitle: 'Cargo Scan',
    body: 'Tap any crate with a shape not on the manifest, before the red line. Crates with the red FLEET mark: hold those too. Never destroy them.',
    names: { drum: 'WATER CASK', sack: 'NETS', tin: 'SURF WAX', ring: 'ANCHOR CHAIN', plate: 'SURFBOARD', bulb: 'LANTERN', crystal: 'PEARL', rod: 'OARS' }, dockNames: ['Berth Eight', 'Trawler 5', 'Island ferry', 'Reach runner'],
    fleet: 0.16, stat: 'jsScan', scan: '#5fe3ff', scanRgb: '95,227,255', idleTitle: 'CARGO SCAN \u00b7 THE NET HUT' } },
  cond: { at: { x: RM('eng').x - 0.6, z: RM('eng').z - 1.4, hw: 2.32, hd: 1.66 }, theme: { title: 'TIDE PUMP LINES', where: 'The Tide Pumps \u00b7 CHIEF CORAL', kicker: 'The Tide Pumps \u00b7 Chief Coral', cardTitle: 'Tide Pump Lines', deck: 'TIDE PUMP LINES', deckSub: 'LAGOON WATER \u00b7 KEEP CLEAR', amber: '#5fe3ff',
    body: 'Tap a pipe to turn it. Join each line from its inlet on the left to its outlet on the right. The lagoon drains while you work: finish before it runs dry.',
    lines: [{ key: 'sea', name: 'SEA WATER', dim: '#1a4a5a', ink: '#2ab8c8', spark: '#e0faff' }, { key: 'fresh', name: 'FRESH WATER', dim: '#1e4a6a', ink: '#9fe8ff', spark: '#ffffff' }, { key: 'air', name: 'PUMP AIR', dim: '#5a4a2a', ink: '#ffd23a', spark: '#fff1c0' }],
    sysNames: ['Lagoon level', 'Island spring', 'Surf machine', 'Berth Eight mooring'], stat: 'jsCond', heat: [2.0, 2.8, 3.4, 4.0] } } };

export function buildJiddaSt(K) {
  const { THREE, scene, glowSprite, rnd, rr, LOW } = K;
  const g = new THREE.Group(); g.position.set(JI.OX, 0, 0); g.visible = false; scene.add(g);
  const anims = [], blocks = [], circles = [], spots = [], hooks = {}; let holoRef = [], boost = 0;
  const tex = (c, rx, ry) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); } return t; };
  const toon = (c, x) => K.toon(c, x), basic = (c, o, a) => K.basic(c, o, a);
  const Q = (geo, mat, x, y, z, p = g, cast = false) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast && !LOW; m.receiveShadow = true; p.add(m); return m; };
  const B = (w, h, d, mat, x, y, z, p, cast) => Q(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p, cast);
  const CY = (r1, r2, h, mat, x, y, z, seg = 16, p, cast) => Q(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, cast);
  const glow = (x, y, z, c, s, o = 0.6, p = g) => glowSprite(x, y, z, c, s, o, p);
  const plane = (w, h, mat, x, y, z, ry = 0, rx = 0, p = g) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; p.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry, p = g, bg = '#08161c') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, Hh) => { c.fillStyle = bg; c.fillRect(0, 0, W, Hh); c.strokeStyle = fg; c.lineWidth = 12; c.strokeRect(6, 6, W - 12, Hh - 12); const n = lines.length, lh = Hh * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.66 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, Hh * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry, 0, p); };
  const timber = toon(TIMBER), bark2 = toon(TIMBER2), sand = toon(SAND), thatch = toon(THATCH), dark = toon('#0a1418'), leaf = toon('#3f9a4a'), leaf2 = toon('#2e7a3a');
  const plankT = tex(canvas(256, 256, (c, w) => { for (let i = 0; i < 8; i++) { c.fillStyle = ['#a8784a', '#9a7048', '#b08050', '#946a42'][i % 4]; c.fillRect(0, i * 32, w, 32); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0, i * 32, w, 2); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(0, i * 32 + 6, w, 2); } }), 3, 3);
  const bambooT = tex(canvas(256, 256, (c, w) => { for (let x = 0; x < w; x += 16) { const gr = c.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#8a7a3a'); gr.addColorStop(0.5, '#c8b060'); gr.addColorStop(1, '#7a6a2a'); c.fillStyle = gr; c.fillRect(x, 0, 16, w); for (let y = 20; y < w; y += 52) { c.fillStyle = 'rgba(60,40,10,0.6)'; c.fillRect(x, y + (x % 32), 16, 3); } } }), 8, 2);
  const plankM = toon('#ffffff', { map: plankT }), bambooM = toon('#ffffff', { map: bambooT, side: THREE.DoubleSide });

  // ---------- the lagoon hall: water floor, glass dome, the sky outside ----------
  { const st = tex(canvas(2048, 1024, (c, w, h) => { c.fillStyle = '#030a10'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(${200 + (rnd() * 55 | 0)},255,255,${(0.25 + rnd() * 0.75).toFixed(2)})`; const s = rnd() < 0.06 ? 2.6 : 1.3; c.fillRect(rnd() * w, rnd() * h * 0.62, s, s); } }));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.MeshBasicMaterial({ map: st, side: THREE.BackSide, toneMapped: false, depthWrite: false })));
    const pl = tex(canvas(1024, 512, (c, w, h) => { c.fillStyle = '#1a6a9a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { const x = rnd() * w, y = rnd() * h, r = 8 + rnd() * 26; c.fillStyle = '#5fe3ff'; c.beginPath(); c.arc(x, y, r * 1.6, 0, 7); c.fill(); c.fillStyle = SAND; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle = '#3f9a4a'; c.beginPath(); c.arc(x, y, r * 0.6, 0, 7); c.fill(); } }));
    const planet = new THREE.Mesh(new THREE.SphereGeometry(520, 48, 32), new THREE.MeshBasicMaterial({ map: pl, toneMapped: false })); planet.position.set(0, -330, -760); g.add(planet); anims.push(dt => { planet.rotation.y += dt * 0.004; });
    const water = new THREE.Mesh(new THREE.CircleGeometry(31, 64), new THREE.MeshBasicMaterial({ color: SEA, transparent: true, opacity: 0.92, toneMapped: false })); water.rotation.x = -Math.PI / 2; water.position.y = -0.35; g.add(water);
    const bed = new THREE.Mesh(new THREE.CircleGeometry(31, 48), toon('#e0c890')); bed.rotation.x = -Math.PI / 2; bed.position.y = -1.6; g.add(bed);
    for (let i = 0; i < 30; i++) { const a = rnd() * Math.PI * 2, d = rr(9, 30), c = Q(new THREE.DodecahedronGeometry(rr(0.3, 0.8), 0), toon(['#ff8a6a', '#ffb0c8', '#f3efe4', '#c86a3a'][i % 4]), Math.sin(a) * d, -1.4, Math.cos(a) * d); void c; }
    const ripples = []; for (let i = 0; i < (LOW ? 10 : 26); i++) { const a = rnd() * Math.PI * 2, d = rr(9, 29), rp = Q(new THREE.RingGeometry(0.12, 0.2, 16), basic('#e0faff', 0.5, true), Math.sin(a) * d, -0.32, Math.cos(a) * d); rp.rotation.x = -Math.PI / 2; ripples.push([rp, rnd() * 3]); }
    anims.push((dt, t) => { water.material.color.setHSL(0.52, 0.65, 0.45 + 0.03 * Math.sin(t * 0.6)); ripples.forEach(([rp, p]) => { const k = (t * 0.4 + p) % 1; rp.scale.setScalar(1 + k * 4); rp.material.opacity = 0.45 * (1 - k); }); });
    // the hall wall: a low timber rail at the edge + the glass dome on ribs
    Q(new THREE.CylinderGeometry(31.4, 31.4, 1.6, 64, 1, true), toon(TIMBER2, { side: THREE.DoubleSide }), 0, 0.4, 0);
    const dome = Q(new THREE.SphereGeometry(31.6, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), basic('#cff4ff', 0.08), 0, 1.0, 0); dome.scale.y = 0.42; for (let i = 0; i < 12; i++) { const rib = Q(new THREE.TorusGeometry(31.6, 0.12, 4, 40, Math.PI), toon(TIMBER), 0, 1.0, 0); rib.rotation.set(0, i * Math.PI / 12, 0); rib.scale.set(1, 0.42, 1); }
    // little boats at their moorings
    const boats = []; for (let i = 0; i < 6; i++) { const a = (i * 60 + 30) * Math.PI / 180, d = 12.5 + (i % 2) * 5, bt = new THREE.Group(); bt.position.set(Math.sin(a) * d, -0.3, -Math.cos(a) * d); bt.rotation.y = -a + Math.PI / 2; g.add(bt); B(2.4, 0.4, 0.9, toon(['#ec3013', '#ffd23a', '#2563eb', '#f3efe4', '#22c55e', '#ff8a6a'][i]), 0, 0.15, 0, bt); B(2.0, 0.08, 0.7, timber, 0, 0.36, 0, bt); boats.push([bt, rnd() * 6]); }
    anims.push((dt, t) => boats.forEach(([b, p]) => { b.position.y = -0.3 + Math.sin(t * 1.1 + p) * 0.06; b.rotation.z = Math.sin(t * 0.9 + p) * 0.05; })); }

  // ---------- helpers: round walls with door gaps, circular floors / ceilings ----------
  function ringWall(cx, cz, r, h, gapDegs, mat, gapW = 1.6) { const ga = Math.asin(Math.min(0.95, gapW / r)), gs = gapDegs.map(d => { const [dx, dz] = POL(1, d); return Math.atan2(dx, dz); }).sort((a, b) => a - b);
    const segs = []; if (!gs.length) segs.push([0, Math.PI * 2]); else gs.forEach((a, i) => { const b = i + 1 < gs.length ? gs[i + 1] : gs[0] + Math.PI * 2; segs.push([a + ga, b - a - 2 * ga]); });
    for (const [s, l] of segs) if (l > 0.01) Q(new THREE.CylinderGeometry(r, r, h, Math.max(8, Math.ceil(48 * l / (Math.PI * 2))), 1, true, s, l), mat, cx, h / 2, cz);
    for (const a of gs) Q(new THREE.CylinderGeometry(r, r, h - 3.2, 4, 1, true, a - ga, 2 * ga), mat, cx, 3.2 + (h - 3.2) / 2, cz); }
  function disk(cx, cz, r, y, mat, up = true) { const m = Q(new THREE.CircleGeometry(r, 48), mat, cx, y, cz); m.rotation.x = up ? -Math.PI / 2 : Math.PI / 2; return m; }
  function lodge(R, floorM, wallM, roofC, extraGaps = []) { disk(R.x, R.z, R.r, 0.006, floorM); ringWall(R.x, R.z, R.r, R.h, [R.a + 180, ...extraGaps], wallM); const rf = Q(new THREE.ConeGeometry(R.r + 0.4, 2.2, 24, 1, true), toon(roofC, { side: THREE.DoubleSide }), R.x, R.h + 1.1, R.z); void rf; disk(R.x, R.z, R.r, R.h, dark, false);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; B(0.2, 0.2, R.r - 0.4, bark2, R.x + Math.sin(a) * R.r / 2, R.h - 0.2, R.z + Math.cos(a) * R.r / 2).rotation.y = a; } }
  function hut(R) { disk(R.x, R.z, R.r + 0.6, 0.0, plankM); CY(R.r + 0.6, R.r + 0.6, 0.6, bark2, R.x, -0.3, R.z, 40); ringWall(R.x, R.z, R.r, R.h, [R.a + 180], bambooM); Q(new THREE.ConeGeometry(R.r + 1.2, 3.4, 24, 1, true), toon(THATCH, { side: THREE.DoubleSide }), R.x, R.h + 1.5, R.z); disk(R.x, R.z, R.r, R.h, dark, false);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; B(0.18, 0.18, R.r - 0.4, bark2, R.x + Math.sin(a) * R.r / 2, R.h - 0.2, R.z + Math.cos(a) * R.r / 2).rotation.y = a; }
    const [dx, dz] = POL(R.r, R.a + 180); for (const s of [-1, 1]) { const tx = dz / R.r, tz = -dx / R.r; CY(0.08, 0.1, 2.0, bark2, R.x + dx * 1.05 + tx * s * 2.0, 1.0, R.z + dz * 1.05 + tz * s * 2.0, 6); glow(R.x + dx * 1.05 + tx * s * 2.0, 2.1, R.z + dz * 1.05 + tz * s * 2.0, 0xffa040, 1.2, 0.8); } }
  function doorSigns(R, big, sub, fg) { const [ox, oz] = POL(R.d - R.r - 0.5, R.a), ry = -R.a * Math.PI / 180; const tx = Math.cos(ry), tz = -Math.sin(ry), nx = Math.sin(ry), nz = Math.cos(ry);
    sign([big, sub], 4.0, 0.95, fg, ox + nx * 0.1, 4.4, oz + nz * 0.1, ry); sign([big], 1.3, 0.5, fg, ox + tx * 2.6 + nx * 0.1, 1.6, oz + tz * 2.6 + nz * 0.1, ry);
    const [ix, iz] = POL(R.d - R.r + 0.6, R.a); sign(['TO THE CREST ISLAND'], 2.2, 0.6, '#ffd23a', ix + tx * 2.4, 3.3, iz + tz * 2.4, ry + Math.PI); }

  // ---------- the piers ----------
  for (const H of PIERS) { const [ax, az] = H.a, [bx, bz] = H.b, L = Math.hypot(bx - ax, bz - az), mx = (ax + bx) / 2, mz = (az + bz) / 2, ry = Math.atan2(bx - ax, bz - az), w = H.w * 2;
    const fl = plane(w, L + 0.4, plankM, mx, 0.02, mz, 0, -Math.PI / 2); fl.rotation.order = 'YXZ'; fl.rotation.set(-Math.PI / 2, ry, 0);
    for (let i = 0; i <= Math.floor(L / 3); i++) { const f = i / Math.max(1, Math.floor(L / 3)), px = ax + (bx - ax) * f, pz = az + (bz - az) * f; for (const s of [-1, 1]) { const qx = px + Math.cos(ry) * s * (w / 2), qz = pz - Math.sin(ry) * s * (w / 2); CY(0.1, 0.1, 2.4, bark2, qx, -0.4, qz, 6);
        if (i % 2 === 0 && !H.ring) { CY(0.05, 0.05, 1.4, bark2, qx, 1.1, qz, 6); glow(qx, 1.9, qz, 0xffb060, 1.2, 0.7); } } }
    for (const s of [-1, 1]) { const rl = B(0.08, 0.08, L, bark2, mx + Math.cos(ry) * s * (w / 2), 0.9, mz - Math.sin(ry) * s * (w / 2)); rl.rotation.y = ry; } }

  // ---------- THE CREST ISLAND ----------
  { const R = RM('island'); disk(0, 0, R.r, 0.01, sand); CY(R.r, R.r + 0.6, 0.8, sand, 0, -0.38, 0, 40); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + 0.11; if ([0, 60, 120, 180, 240, 300].some(d => Math.abs(((a * 180 / Math.PI - d + 540) % 360) - 180) < 12)) continue; Q(new THREE.DodecahedronGeometry(rr(0.4, 0.7), 0), toon('#8a8f96'), Math.sin(a) * (R.r - 0.2), 0.1, -Math.cos(a) * (R.r - 0.2)); }
    // the palm
    const palm = new THREE.Group(); palm.position.set(-3.0, 0, -2.0); g.add(palm); for (let i = 0; i < 8; i++) { const sg = CY(0.32 - i * 0.02, 0.36 - i * 0.02, 1.0, toon('#8a6a3a'), Math.sin(i * 0.25) * 0.4, 0.5 + i * 0.98, 0, 8, palm); sg.rotation.z = -0.06 * i; } circles.push([-3.0, -2.0, 0.6]);
    const fronds = new THREE.Group(); fronds.position.set(1.6, 8.0, 0); palm.add(fronds); for (let i = 0; i < 8; i++) { const fr = new THREE.Mesh(new THREE.ConeGeometry(0.5, 4.2, 4), i % 2 ? leaf : leaf2); fr.rotation.set(0, i / 8 * Math.PI * 2, 0); fr.rotateZ(1.9); fr.position.set(Math.cos(i / 8 * Math.PI * 2) * 1.6, -0.4, Math.sin(i / 8 * Math.PI * 2) * 1.6); fronds.add(fr); } for (let i = 0; i < 3; i++) Q(new THREE.SphereGeometry(0.22, 8, 6), toon('#5a3a1e'), 1.6 + rr(-0.3, 0.3), 7.6, rr(-0.3, 0.3), palm);
    anims.push((dt, t) => { fronds.rotation.y = Math.sin(t * 0.4) * 0.06; fronds.rotation.z = Math.sin(t * 0.7) * 0.04; });
    // the fire pit + tiki torches + the crest mooring post
    CY(1.0, 1.1, 0.35, toon('#5a5e66'), 1.8, 0.18, 1.6, 14); circles.push([1.8, 1.6, 1.3]); const flames = []; for (let i = 0; i < 5; i++) { const f = Q(new THREE.ConeGeometry(0.2, 0.7, 6), basic(i % 2 ? '#ffd23a' : '#ff6a1a', 0.9, true), 1.8 + rr(-0.3, 0.3), 0.6, 1.6 + rr(-0.3, 0.3)); flames.push([f, rnd() * 6]); }
    const fire = new THREE.PointLight(0xff9a40, LOW ? 1.0 : 1.8, 12, 1.6); fire.position.set(1.8, 1.4, 1.6); g.add(fire); anims.push((dt, t) => { flames.forEach(([f, p]) => { f.scale.y = 0.8 + 0.35 * Math.sin(t * 9 + p); }); fire.intensity = (LOW ? 1.0 : 1.8) * (0.9 + 0.1 * Math.sin(t * 17)); });
    for (const d of [30, 150, 210, 330]) { const [x, z] = POL(6.6, d); CY(0.07, 0.09, 2.4, toon('#6a4a2e'), x, 1.2, z, 6); Q(new THREE.CylinderGeometry(0.16, 0.1, 0.35, 8), thatch, x, 2.5, z); glow(x, 2.8, z, 0xffa040, 1.6, 0.8); circles.push([x, z, 0.3]); }
    CY(0.35, 0.35, 1.4, toon(TIMBER), 3.4, 0.7, -3.6, 10); Q(new THREE.TorusGeometry(0.45, 0.08, 6, 16), toon(CYAN), 3.4, 1.5, -3.6).rotation.y = 0.6; circles.push([3.4, -3.6, 0.5]);
    sign(['JIDDA STATION', 'THE CREST ISLAND \u00b7 MIND THE PIERS'], 4.6, 1.1, CYAN, 3.4, 2.6, -3.18, 0);
    const hm = Q(new THREE.CylinderGeometry(1.2, 1.2, 2.6, 12, 1, true, 0, Math.PI * 0.4), toon('#ff8a6a', { side: THREE.DoubleSide }), -3.0, 1.6, -0.5); hm.rotation.z = Math.PI / 2;
    spots.push({ key: 'jsFire', r: 0.9, x: 1.8, z: 3.4, run: X => { X.audio && X.audio.tone && X.audio.tone(262, 1.2, 0.03, 'sine', 0.6); X.note('THE CREST ISLAND', 'Warm sand, a crackling fire, waves lapping the piers. For a moment you forget you are in orbit.'); } }); }

  // ---------- OPERATIONS · THE CROW'S NEST (N) ----------
  { const R = RM('ops'); hut(R); CY(1.8, 2.0, 1.0, bark2, R.x, 0.5, R.z, 12, g, true); circles.push([R.x, R.z, 2.3]);
    const holo = new THREE.Group(); holo.position.set(R.x, 1.5, R.z); g.add(holo); Q(new THREE.SphereGeometry(0.7, 20, 14), toon('#1a6a9a', { emissive: new THREE.Color('#2ab8c8'), emissiveIntensity: 0.3 }), 0, 0.4, 0, holo); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; Q(new THREE.SphereGeometry(0.1, 6, 4), toon(SAND), Math.cos(a) * 0.72, 0.4 + Math.sin(k) * 0.3, Math.sin(a) * 0.72, holo); }
    const hg = glow(R.x, 1.9, R.z, 0x5fe3ff, 3, 0.35); holoRef = [holo, hg]; anims.push(dt => { holo.rotation.y += dt * 0.3; });
    spots.push({ key: 'jsDockSpot', r: 1.1, x: R.x, z: R.z + JI_GAMES.dock.theme.standZ, run: X => X.prompt('DOCKING CONTROL', 'The Crow\u2019s Nest \u00b7 Warden Marlin\u2019s board', [['TAKE THE WATCH', () => hooks.play && hooks.play('dock')], ['NOT NOW', null]]) });
    const mast = CY(0.2, 0.26, 12, toon(TIMBER2), R.x + 4.2, 6.0, R.z - 4.2, 8); void mast; CY(1.0, 0.8, 0.8, toon(TIMBER), R.x + 4.2, 11.6, R.z - 4.2, 12); glow(R.x + 4.2, 12.2, R.z - 4.2, 0xfff4c0, 2.4, 0.8);
    sign(['THE CROW\u2019S NEST', 'LAGOON LANES \u00b7 SQUALL ON LANE THREE'], 4.2, 1.0, CYAN, R.x, 4.2, R.z - R.r + 0.7, 0); doorSigns(R, 'THE CROW\u2019S NEST', 'OPERATIONS', CYAN); }

  // ---------- SECURITY · THE NET HUT (NE) ----------
  { const R = RM('sec'); hut(R);
    spots.push({ key: 'jsScanSpot', r: 1.1, x: JI_GAMES.scan.at.x, z: JI_GAMES.scan.at.z + 6.4 * 0.7 / 2 + 1.0, run: X => X.prompt('CARGO SCAN', 'The Net Hut \u00b7 Bosun Kai', [['WORK THE BELT', () => hooks.play && hooks.play('scan')], ['NOT NOW', null]]) });
    const NT = { x: R.x - 1.6, z: R.z - 5.2 }; const tub = CY(1.3, 1.3, 0.6, toon(TIMBER2), NT.x, 0.3, NT.z, 16); void tub; const tw = Q(new THREE.CircleGeometry(1.2, 16), basic(SEA, 0.85), NT.x, 0.61, NT.z); tw.rotation.x = -Math.PI / 2; circles.push([NT.x, NT.z, 1.45]);
    const net = Q(new THREE.SphereGeometry(0.9, 10, 8), toon('#c8b890', { wireframe: true }), NT.x, 1.3, NT.z); void net;
    const bot = new THREE.Group(); bot.position.set(NT.x, 0.6, NT.z); g.add(bot); const bm = toon('#7a8a96'); B(0.6, 0.6, 0.45, bm, 0, 0.6, 0, bot); Q(new THREE.SphereGeometry(0.26, 12, 8), bm, 0, 1.1, 0, bot);
    const eye = Q(new THREE.SphereGeometry(0.07, 10, 8), basic('#5fe3ff'), 0, 1.15, 0.24, bot); const eg = glow(0, 1.15, 0.28, 0x5fe3ff, 0.5, 0.8, bot); bot.rotation.y = 0.5;
    const drips = []; for (let i = 0; i < 4; i++) { const d = Q(new THREE.SphereGeometry(0.04, 6, 4), basic('#bfe6ff'), NT.x + rr(-0.3, 0.3), 1.0, NT.z + rr(-0.2, 0.2)); drips.push([d, rnd()]); }
    anims.push((dt, t) => { const hacked = Math.sin(t * 0.7) > 0.94; eye.material.color.set(hacked ? '#ec3013' : '#5fe3ff'); eg.material.color.set(hacked ? '#ec3013' : '#5fe3ff'); drips.forEach(([d, p]) => { const k = (t * 0.8 + p) % 1; d.position.y = 1.0 - k * 0.4; }); });
    sign(['THE NET HUT', 'FLEET UNIT 6-TIDE \u00b7 KEEP IT WET'], 2.8, 0.8, CYAN, NT.x, 3.2, NT.z + 1.6, 0);
    spots.push({ key: 'jsNet', r: 1.2, x: NT.x + 2.8, z: NT.z + 0.6, run: X => { X.audio && X.audio.tone && X.audio.tone(294, 1.4, 0.03, 'sine', 0.6); X.note('THE NET HUT \u00b7 UNIT 6-TIDE', '\u201CWet, the voice slips. There is someone on that ship. Not one of us. They hum while they give orders. Help us.\u201D'); try { X.save.setFlag('jsBotHeard'); } catch (e) {} } });
    doorSigns(R, 'THE NET HUT', 'SECURITY', '#ff8a6a'); }

  // ---------- ENGINEERING · THE TIDE PUMPS (SE) ----------
  { const R = RM('eng'), P0 = JI_GAMES.cond.at; CY(R.r + 0.6, R.r + 0.6, 0.6, bark2, R.x, -0.3, R.z, 40); { const hole = [P0.x - P0.hw - 0.16, P0.x + P0.hw + 0.16, P0.z - P0.hd - 0.16, P0.z + P0.hd + 0.16];
      for (const [p, q, r2, s2] of [[R.x - R.r, R.x + R.r, R.z - R.r, hole[2]], [R.x - R.r, R.x + R.r, hole[3], R.z + R.r], [R.x - R.r, hole[0], hole[2], hole[3]], [hole[1], R.x + R.r, hole[2], hole[3]]]) plane(q - p, s2 - r2, plankM, (p + q) / 2, 0.02, (r2 + s2) / 2, 0, -Math.PI / 2); }
    ringWall(R.x, R.z, R.r, R.h, [R.a + 180], bambooM); Q(new THREE.ConeGeometry(R.r + 1.2, 3.4, 24, 1, true), toon(THATCH, { side: THREE.DoubleSide }), R.x, R.h + 1.5, R.z); disk(R.x, R.z, R.r, R.h, dark, false);
    const pumps = []; for (let i = 0; i < 2; i++) { const px = R.x + 2.6, pz = R.z + 1.6 + i * 1.9; CY(0.5, 0.55, 1.4, toon('#5a5e66'), px, 0.7, pz, 12); const arm = B(0.12, 0.12, 1.6, toon(CYAN), px, 1.6, pz); pumps.push(arm); circles.push([px, pz, 0.7]); }
    const tank = CY(1.0, 1.0, 2.6, basic('#9fe8ff', 0.45), R.x - 3.4, 1.3, R.z + 2.6, 16); void tank; const lvl = CY(0.95, 0.95, 1.0, basic(SEA, 0.8), R.x - 3.4, 0.5, R.z + 2.6, 16); circles.push([R.x - 3.4, R.z + 2.6, 1.2]);
    anims.push((dt, t) => { boost = Math.max(0, boost - dt * 0.2); pumps.forEach((p, i) => { p.rotation.x = Math.sin(t * (1.8 + boost) + i * 1.6) * 0.5; }); const k = 0.6 + 0.35 * Math.sin(t * 0.3); lvl.scale.y = k * 2.2; lvl.position.y = k * 1.1; });
    spots.push({ key: 'jsCondSpot', r: 1.1, x: P0.x, z: P0.z + P0.hd + 0.9, run: X => X.prompt('TIDE PUMP LINES', 'The Tide Pumps \u00b7 Chief Coral', [['FIX THE LINES', () => hooks.play && hooks.play('cond')], ['NOT NOW', null]]) });
    doorSigns(R, 'THE TIDE PUMPS', 'ENGINEERING', SEA); }

  // ---------- BERTH EIGHT (S) ----------
  { const R = RM('berth'); hut(R);
    Q(new THREE.TorusGeometry(1.5, 0.28, 10, 32), toon(CYAN), R.x, 1.8, R.z + R.r - 0.5); Q(new THREE.CircleGeometry(1.4, 32), toon('#1a3a4a'), R.x, 1.8, R.z + R.r - 0.45).rotation.y = Math.PI;
    const lamp = glow(R.x + 1.9, 3.4, R.z + R.r - 0.7, 0xffb020, 1.4, 0.8); anims.push((dt, t) => { lamp.material.opacity = Math.floor(t * 2) % 2 ? 0.85 : 0.25; });
    sign(['AIRLOCK', 'YOUR SHIP IS MOORED'], 2.6, 0.8, '#ffd23a', R.x - 3.0, 2.6, R.z + R.r - 0.9, Math.PI);
    for (let i = 0; i < 3; i++) { const cl = Q(new THREE.TorusGeometry(0.4, 0.12, 6, 16), toon('#c8b890'), R.x - 3.6 + i * 0.3, 0.12, R.z - 1 + i * 0.5); cl.rotation.x = Math.PI / 2; }
    spots.push({ key: 'jsLock', r: 1.4, x: R.x, z: R.z + R.r - 1.6, run: X => X.prompt('JIDDA STATION \u00b7 BERTH EIGHT', 'Your ship is moored on the other side of the airlock.', [['BACK TO YOUR SHIP \u00b7 SPACE', () => { X.audio && X.audio.tone && X.audio.tone(90, 1.6, 0.05, 'sawtooth', 1.5); if (hooks.nav) hooks.nav('Space Map.dc.html?from=jiddaSt'); }], ['STAY ABOARD', null]]) });
    doorSigns(R, 'BERTH EIGHT', 'AIRLOCK \u00b7 YOUR SHIP', '#ffd23a'); }

  // ---------- THE SURF SHACK (SW) ----------
  { const R = RM('surf'); hut(R);
    B(4.6, 1.0, 1.0, toon(TIMBER), R.x, 0.5, R.z - 2.4, g, true); blocks.push([R.x - 2.3, R.x + 2.3, R.z - 2.9, R.z - 1.9]); for (let i = 0; i < 5; i++) CY(0.15, 0.15, 0.12, toon(['#ffd23a', '#ff8a6a', CYAN, '#f3efe4', '#22c55e'][i]), R.x - 1.6 + i * 0.8, 1.06, R.z - 2.4, 10);
    for (let i = 0; i < 6; i++) { const a = (i / 6 - 0.5) * 1.6 + Math.PI / 2, bd = Q(new THREE.CapsuleGeometry(0.28, 2.0, 4, 8), toon(['#ec3013', '#ffd23a', '#2563eb', '#f3efe4', '#22c55e', '#ff8a6a'][i]), R.x + Math.cos(a) * (R.r - 0.5), 1.4, R.z + Math.sin(a) * (R.r - 0.5)); bd.scale.z = 0.25; bd.rotation.y = -a; }
    const wave = new THREE.Group(); wave.position.set(R.x - 2.4, 0, R.z + 2.0); g.add(wave); const wm = Q(new THREE.CylinderGeometry(1.4, 1.4, 2.4, 16, 1, true, 0, Math.PI), basic(SEA, 0.8), 0, 1.0, 0, wave); wm.rotation.z = Math.PI / 2; void wm; blocks.push([R.x - 3.8, R.x - 1.0, R.z + 0.8, R.z + 3.2]); anims.push((dt, t) => { wave.scale.y = 0.8 + 0.25 * Math.sin(t * 1.4); }); sign(['THE WAVE MACHINE', 'ONE WAVE \u00b7 A VERY GOOD WAVE'], 2.6, 0.7, CYAN, R.x - 2.4, 3.0, R.z + 0.6, Math.PI);
    sign(['THE SURF SHACK', 'BOARDS \u00b7 WAX \u00b7 ONE GOOD WAVE'], 4.2, 1.0, '#ffd23a', R.x, 3.4, R.z - 2.95, 0); doorSigns(R, 'THE SURF SHACK', 'BOARDS + WAX', '#ffd23a'); }

  // ---------- THE LONG BOARD (NW, shuffleboard) ----------
  { const R = RM('long'); hut(R);
    const ct = new THREE.Group(); ct.position.set(R.x - 1.0, 0, R.z); g.add(ct); B(1.2, 0.5, 8.4, toon('#e8dcc0'), 0, 0.25, 0, ct, true); B(1.3, 0.04, 8.5, toon(TIMBER2), 0, 0.02, 0); for (const z of [-3.6, -3.0, 3.0, 3.6]) B(1.2, 0.01, 0.06, toon('#ec3013'), 0, 0.51, z, ct); blocks.push([R.x - 1.7, R.x - 0.3, R.z - 4.3, R.z + 4.3]);
    const puck = CY(0.12, 0.12, 0.05, toon('#2563eb'), 0, 0.53, 0, 12, ct); anims.push((dt, t) => { const k = (t * 0.18) % 1; puck.position.z = 3.4 - Math.min(1, k * 1.4) * 6.6; });
    sign(['THE LONG BOARD', 'SLIDE IT \u00b7 STOP IT ON THE STRIPE'], 4.2, 1.0, '#ff8a6a', R.x + R.r - 0.7, 3.4, R.z, -Math.PI / 2); doorSigns(R, 'THE LONG BOARD', 'SHUFFLEBOARD', '#ff8a6a'); }

  // ---------- walking, camera, labels ----------
  const segD = (x, z, H) => { const [ax, az] = H.a, [bx, bz] = H.b, dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l)); return Math.hypot(ax + t * dx - x, az + t * dz - z); };
  const inC = (R, x, z, m) => Math.hypot(x - R.x, z - R.z) < R.r - m;
  function walk(x, z) { for (const [cx, cz, cr] of circles) if (Math.hypot(x - cx, z - cz) < cr) return false;
    for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false;
    for (const R of JI_ROOMS) if (inC(R, x, z, 0.5)) return true; for (const H of PIERS) if (segD(x, z, H) < H.w - 0.1) return true; return false; }
  const HALL = { k: 'lagoon', x: 0, z: 0, r: 30.4, h: 12 }; let cur = RM('berth');
  function tick(dt, t, px, pz) { const R = JI_ROOMS.slice(1).find(q => inC(q, px, pz, 0.2)); cur = R || HALL; }
  // in the lagoon hall the camera roams the dome but never enters a hut; in a hut it stays inside
  function clampCam(v) { const R = cur, dx = v.x - R.x, dz = v.z - R.z, d = Math.hypot(dx, dz), m = R.r - 0.6; if (d > m) { v.x = R.x + dx * m / d; v.z = R.z + dz * m / d; }
    if (R === HALL) { for (const q of JI_ROOMS.slice(1)) { const ex = v.x - q.x, ez = v.z - q.z, e = Math.hypot(ex, ez); if (e < q.r + 0.8) { v.x = q.x + ex * (q.r + 0.8) / Math.max(0.01, e); v.z = q.z + ez * (q.r + 0.8) / Math.max(0.01, e); } } v.y = Math.min(v.y, 11); } else v.y = Math.min(v.y, R.h - 0.4); }
  function label(x, z) { const R = JI_ROOMS.find(q => inC(q, x, z, 0)); return 'Jidda Station \u00b7 ' + (R ? R.name : 'The Piers').toLowerCase().replace(/(^|\s)\S/g, s => s.toUpperCase()); }
  return { g, anims, walk, clampCam, label, tick, spots, hooks, blocks, circles, setHolo(v) { for (const o of holoRef) o.visible = v; }, surge(t = 2.6) { boost = Math.max(boost, t); }, vent() { boost = 3; } };
}
