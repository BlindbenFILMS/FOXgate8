// NEBO STATION [dsfOutNe] (s495): Nebo's own station, the ring inside the shimmering water torus. Built far away at (OX, 0, 0), only
// shown while you are aboard (Deep Space Fox.dc.html?at=nebo, from the Space Map dock). A station grown round a tree: THE GREAT TREE
// atrium in the middle (a giant trunk with roots, a canopy of leaves + hanging lanterns + glowworms, a ring stream round the trunk with
// four plank bridges, mossy stone, mushrooms), and six ROUND TIMBER LODGES off it by short woven-wood halls: OPERATIONS · THE LIGHTHOUSE
// (N), SECURITY · THE WILLOW NET (NE: a Fleet unit caught in a willow net among glowing mushrooms), ENGINEERING · THE WATERWHEEL (SE),
// BERTH SEVEN (S, arrival + airlock), THE HONEY HALL (SW), THE GLIDER LOFT (NW). Nebo glows green below.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const MOSS = '#4a7a3a', LEAF = '#3f8a3a', LEAF2 = '#2e6a2a', BARK = '#6a4a2e', BARK2 = '#4a3220', HONEY = '#e6b45a', GLOWG = '#9ff09f', WATER = '#5fb8e8';
export const NE = { OX: 46000, hw: 33, hd: 33, h: 16, door: { x: 999, z: 999 }, enter: { x: 0, z: 21.5 } };
const POL = (r, deg) => [Math.sin(deg * Math.PI / 180) * r, -Math.cos(deg * Math.PI / 180) * r];
// round rooms (atrium + lodges) and the woven halls between them (capsules)
export const NE_ROOMS = [
  { k: 'tree', x: 0, z: 0, r: 13, h: 15, name: 'THE GREAT TREE' },
  { k: 'ops', a: 0, d: 23, r: 6.5, h: 6.2, name: 'OPERATIONS', sub: 'THE LIGHTHOUSE \u00b7 WARDEN ELM' },
  { k: 'sec', a: 60, d: 24.5, r: 7.5, h: 5.6, name: 'SECURITY', sub: 'THE WILLOW NET \u00b7 RANGER THORNE' },
  { k: 'eng', a: 120, d: 23, r: 6.5, h: 6.2, name: 'ENGINEERING', sub: 'THE WATERWHEEL \u00b7 CHIEF HAZEL' },
  { k: 'berth', a: 180, d: 23, r: 6.5, h: 5.6, name: 'BERTH SEVEN', sub: 'TREE DOCK \u00b7 DOCKMASTER WILLOW' },
  { k: 'honey', a: 240, d: 23, r: 6.5, h: 5.4, name: 'THE HONEY HALL', sub: 'HONEY + MUSHROOMS \u00b7 CLOVER' },
  { k: 'glider', a: 300, d: 23, r: 6.5, h: 6.6, name: 'THE GLIDER LOFT', sub: 'SAILS + WIND \u00b7 PILOT SWIFT' }].map(R => R.a == null ? R : (() => { const [x, z] = POL(R.d, R.a); return { ...R, x, z }; })());
const HALLS = NE_ROOMS.slice(1).map(R => { const [ax, az] = POL(12.6, R.a), [bx, bz] = POL(R.d - R.r + 0.4, R.a); return { a: [ax, az], b: [bx, bz], w: 1.5, deg: R.a }; });
const L1 = t => [{ who: 'npc', text: t }];
const T = (label, ...r) => ({ label, replies: r.map(text => ({ who: 'npc', text })) });
const F = (a, b, tip = '#fff7ed', paw) => ({ fur: { tailA: a, tailB: b, tailTip: tip, paw: paw || b }, faceCols: { furA: a, furB: b } });
const RM = k => NE_ROOMS.find(r => r.k === k), REL = (k, dx, dz) => { const R = RM(k); return [R.x + dx, R.z + dz]; };
// the people aboard (every box 20 words or less; names DRAFT for Ben)
export const NE_NPCS = [
  { key: 'nsElm', at: REL('ops', -2.6, -1.4), look: REL('ops', 0, 0), outfit: 'coat', g: { name: 'WARDEN ELM', title: 'Nebo Station, The Lighthouse', torso: ['#2f5d3a', '#1e3e26', '#0e1e12'], ...F('#c8843a', '#7a4a1a'), greeting: 'Welcome to the Lighthouse, pilot. Mind the moss, it is older than the station.',
    lines: [{ who: 'player', text: 'Warden.' }, { who: 'npc', text: 'Nebo Station. We grew it round a tree, and the tree is still growing. Slowly.' }],
    topics: [T('What does the station do?', 'The lighthouse guides ships through the water ring. We trade honey, timber, and the best mushrooms in the system.'),
      T('Any trouble out there?', 'The Kindling sell stolen logs off the lanes. And a Fleet unit flew into Thorne\u2019s willow net.')] } },
  { key: 'nsSorrel', at: REL('ops', 3.4, -3.6), look: REL('ops', 3.4, -6), outfit: 'suit', g: { name: 'ENSIGN SORREL', title: 'Nebo Station, Lane Watch', torso: ['#3a3f4a', '#262a32', '#141619'], ...F('#d8944a', '#8a5a1a'),
    lines: L1('Fog rolls off the water ring every evening. The lighthouse cuts through it. Mostly. I help.') } },
  { key: 'nsThorne', at: REL('sec', -1.5, 5.2), look: REL('sec', 0, 0), outfit: 'armor', g: { name: 'RANGER THORNE', title: 'Security, The Willow Net', torso: ['#3a4a2a', '#263218', '#12180c'], ...F('#b8743a', '#6a3a14'),
    lines: L1('Bark mail, bow, and a very patient net. Name and business, traveller. Then mind the mushrooms.'),
    topics: [T('Who is in the net?', 'A Fleet unit. In the mushroom-dark it calms down. Says it can see the ship that talks to it.')] } },
  { key: 'nsHazel', at: REL('eng', 3.8, 1.8), look: REL('eng', 0, 0), outfit: 'vest', g: { name: 'CHIEF HAZEL', title: 'Engineering, The Waterwheel', torso: ['#5a4a2a', '#3a2e1a', '#1a140a'], ...F('#c8843a', '#7a4a1a'),
    lines: L1('The water ring turns the wheel, the wheel lights the lanterns. Simple. The trick is keeping it simple.'),
    topics: [T('Why are lanterns going dead below?', 'Somebody is pulling power off Nebo\u2019s lines. Same pull up here, every night, toward the Belt.')] } },
  { key: 'nsWillow', at: REL('berth', 3.4, -1.6), look: REL('berth', 0, 0), outfit: 'coat', g: { name: 'DOCKMASTER WILLOW', title: 'Berth Seven, Tree Dock', torso: ['#4a6a3a', '#2e4a26', '#162612'], ...F('#d8b080', '#8a6a3a'),
    lines: L1('Your ship is tied up to a root, pilot. Do not laugh, it holds better than any clamp.') } },
  { key: 'nsClover', at: REL('honey', 0, -3.6), look: REL('honey', 0, 0), outfit: 'dress', g: { name: 'CLOVER', title: 'The Honey Hall', torso: ['#e6b45a', '#a87a2a', '#4a3410'], ...F('#e8b070', '#9a6a2a'),
    lines: L1('Wildflower honey, pine honey, glowcap mushrooms. The glowcaps light your way home. Do not eat those ones.') } },
  { key: 'nsSwift', at: REL('glider', 2.6, -2.6), look: REL('glider', -2, -4), outfit: 'vest', g: { name: 'PILOT SWIFT', title: 'The Glider Loft', torso: ['#2a5a8a', '#1a3a5a', '#0a1a2a'], ...F('#c8843a', '#7a4a1a'),
    lines: L1('Sails of woven leaf, frames of willow. Off the launch rail, round the water ring, and back. Best view anywhere.') } },
  { key: 'nsOakley', at: [4.4, 6.6], look: [0, 0], outfit: 'robe', g: { name: 'ELDER OAKLEY', title: 'Keeper of the Great Tree', torso: ['#5a3a22', '#3a2414', '#1a100a'], ...F('#e8e0d4', '#a89a84'),
    lines: L1('Put your paw on the bark. Feel that? It hums. Every tree on Nebo hums the same song.'),
    topics: [T('What is the song?', 'Grow, rest, grow. Lately a second note under it, cold and wrong. The canyon foxes heard it too.')] } }];
// s495 the station console games, Nebo versions (engines: dsf-docking / dsf-cargo-scan / dsf-conduit, opts.theme)
export const NE_GAMES = {
  dock: { at: { x: RM('ops').x, z: RM('ops').z }, y: 1.5, theme: { title: 'DOCKING CONTROL', where: 'The Lighthouse \u00b7 WARDEN ELM', kicker: 'Nebo Station \u00b7 Warden Elm', cardTitle: 'Docking Control',
    body: 'Drag each ship to the berth in its colour. A fog bank rolls off the water ring across the plot: route every ship round it.', holo: '#9ff09f', holoRgb: '159,240,159', bg: 'rgba(6,16,8,0.88)',
    tags: { shuttle: 'GLIDER', freighter: 'TIMBER', tug: 'HONEY' }, watchNames: ['Dew lanes', 'Timber run', 'Honey barge', 'Fog watch'], stat: 'nsDock', pw: 5.2, maxD: 3.5, maxY: 5.4, standZ: 3.6,
    storm: { r: 14, speed: 5 }, hazardWord: 'FOGGED', hazardNote: ' flew into the fog bank.' } },
  scan: { at: { x: RM('sec').x + 0.6, z: RM('sec').z + 0.6 }, y: 1.0, theme: { title: 'CARGO SCAN', where: 'The Willow Net \u00b7 RANGER THORNE', kicker: 'The Willow Net \u00b7 Ranger Thorne', cardTitle: 'Cargo Scan',
    body: 'Tap any crate with a shape not on the manifest, before the red line. Crates with the red FLEET mark: hold those too. Never destroy them.',
    names: { drum: 'HONEY POT', sack: 'MUSHROOMS', tin: 'LAMP OIL', ring: 'ROPE COIL', plate: 'BARK MAIL', bulb: 'LANTERN', crystal: 'AMBER', rod: 'LOGS' }, dockNames: ['Berth Seven', 'Timber barge 2', 'Honey run', 'Glider post'],
    fleet: 0.16, stat: 'nsScan', scan: '#9ff09f', scanRgb: '159,240,159', idleTitle: 'CARGO SCAN \u00b7 THE WILLOW NET' } },
  cond: { at: { x: RM('eng').x - 0.6, z: RM('eng').z - 1.4, hw: 2.32, hd: 1.66 }, theme: { title: 'WATERWHEEL LINES', where: 'The Waterwheel \u00b7 CHIEF HAZEL', kicker: 'The Waterwheel \u00b7 Chief Hazel', cardTitle: 'Waterwheel Lines', deck: 'WATERWHEEL LINES', deckSub: 'RING WATER \u00b7 KEEP CLEAR', amber: '#9ff09f',
    body: 'Tap a pipe to turn it. Join each line from its inlet on the left to its outlet on the right. The wheel spins faster while you work: finish before it jumps its axle.',
    lines: [{ key: 'water', name: 'RING WATER', dim: '#1e4a6a', ink: '#5fb8e8', spark: '#e0f4ff' }, { key: 'sap', name: 'TREE SAP', dim: '#6b5a2c', ink: '#e6b45a', spark: '#fff1c0' }, { key: 'glow', name: 'LANTERN GLOW', dim: '#2a4a2a', ink: '#9ff09f', spark: '#eaffea' }],
    sysNames: ['Canopy lanterns', 'The lighthouse', 'Honey Hall stoves', 'Berth Seven root'], stat: 'nsCond', heat: [2.0, 2.8, 3.4, 4.0] } } };

export function buildNeboSt(K) {
  const { THREE, scene, glowSprite, rnd, rr, LOW } = K;
  const g = new THREE.Group(); g.position.set(NE.OX, 0, 0); g.visible = false; scene.add(g);
  const anims = [], blocks = [], circles = [], spots = [], hooks = {}; let holoRef = [], boost = 0;
  const tex = (c, rx, ry) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); } return t; };
  const toon = (c, x) => K.toon(c, x), basic = (c, o, a) => K.basic(c, o, a);
  const Q = (geo, mat, x, y, z, p = g, cast = false) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast && !LOW; m.receiveShadow = true; p.add(m); return m; };
  const B = (w, h, d, mat, x, y, z, p, cast) => Q(new THREE.BoxGeometry(w, h, d), mat, x, y, z, p, cast);
  const CY = (r1, r2, h, mat, x, y, z, seg = 16, p, cast) => Q(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, cast);
  const glow = (x, y, z, c, s, o = 0.6, p = g) => glowSprite(x, y, z, c, s, o, p);
  const plane = (w, h, mat, x, y, z, ry = 0, rx = 0, p = g) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; p.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry, p = g, bg = '#0e1a0c') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, Hh) => { c.fillStyle = bg; c.fillRect(0, 0, W, Hh); c.strokeStyle = fg; c.lineWidth = 12; c.strokeRect(6, 6, W - 12, Hh - 12); const n = lines.length, lh = Hh * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.66 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, Hh * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry, 0, p); };
  const bark = toon(BARK), bark2 = toon(BARK2), moss = toon(MOSS), leaf = toon(LEAF), leaf2 = toon(LEAF2), honey = toon(HONEY), dark = toon('#141a10');
  const glowM = basic(GLOWG, 0.95, true);
  const mossT = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#5a6a4a'; c.fillRect(0, 0, w, w); for (let i = 0; i < 90; i++) { c.fillStyle = ['#6a7a5a', '#4e5e40', '#7a8a62'][i % 3]; c.beginPath(); c.ellipse(rnd() * w, rnd() * w, 12 + rnd() * 16, 10 + rnd() * 12, rnd() * 3, 0, 7); c.fill(); } c.fillStyle = 'rgba(80,140,60,0.5)'; for (let i = 0; i < 300; i++) c.fillRect(rnd() * w, rnd() * w, 3, 3); }), 6, 6);
  const wovenT = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#7a5a36'; c.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 16) for (let x = 0; x < w; x += 32) { c.fillStyle = ((x + y) / 16) % 2 ? '#8a6a42' : '#6a4a2a'; c.fillRect(x + ((y / 16) % 2) * 16, y, 28, 12); } }), 4, 2);
  const plankT = tex(canvas(256, 256, (c, w) => { for (let i = 0; i < 8; i++) { c.fillStyle = ['#8a6a42', '#7e5e3a', '#93704a', '#866440'][i % 4]; c.fillRect(0, i * 32, w, 32); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0, i * 32, w, 2); } }), 3, 3);
  const mossM = toon('#ffffff', { map: mossT }), wovenM = toon('#ffffff', { map: wovenT, side: THREE.DoubleSide }), plankM = toon('#ffffff', { map: plankT });

  // ---------- outside: stars, the water torus, the lighthouse beam, NEBO (forest green, lakes) below ----------
  { const st = tex(canvas(2048, 1024, (c, w, h) => { c.fillStyle = '#04080a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(${210 + (rnd() * 45 | 0)},255,${210 + (rnd() * 45 | 0)},${(0.25 + rnd() * 0.75).toFixed(2)})`; const s = rnd() < 0.06 ? 2.6 : 1.3; c.fillRect(rnd() * w, rnd() * h * 0.62, s, s); } }));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), new THREE.MeshBasicMaterial({ map: st, side: THREE.BackSide, toneMapped: false, depthWrite: false })));
    const pl = tex(canvas(1024, 512, (c, w, h) => { c.fillStyle = '#2e6a2a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { c.fillStyle = ['rgba(63,138,58,0.6)', 'rgba(30,70,24,0.6)', 'rgba(110,160,70,0.4)'][i % 3]; c.beginPath(); c.arc(rnd() * w, rnd() * h, 6 + rnd() * 16, 0, 7); c.fill(); } c.fillStyle = 'rgba(95,184,232,0.85)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(rnd() * w, rnd() * h, 14 + rnd() * 30, 8 + rnd() * 14, rnd() * 3, 0, 7); c.fill(); } }));
    const planet = new THREE.Mesh(new THREE.SphereGeometry(520, 48, 32), new THREE.MeshBasicMaterial({ map: pl, toneMapped: false })); planet.position.set(0, -620, 0); g.add(planet); anims.push(dt => { planet.rotation.y += dt * 0.004; });
    const haze = new THREE.Mesh(new THREE.SphereGeometry(540, 48, 32), new THREE.MeshBasicMaterial({ color: '#9ff09f', transparent: true, opacity: 0.14, side: THREE.BackSide, toneMapped: false, depthWrite: false })); haze.position.copy(planet.position); g.add(haze);
    const tor = new THREE.Mesh(new THREE.TorusGeometry(48, 6, 16, 64), new THREE.MeshBasicMaterial({ color: WATER, transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false })); tor.rotation.x = Math.PI / 2; tor.position.y = 2; g.add(tor); anims.push((dt, t) => { tor.material.opacity = 0.18 + 0.06 * Math.sin(t * 0.8); tor.rotation.z += dt * 0.01; });
    const lb = new THREE.Group(); const [lx, lz] = POL(34, 0); lb.position.set(lx, 6, lz); g.add(lb); CY(0.8, 1.2, 10, toon('#f3efe4'), 0, -2, 0, 12, lb); const beam = new THREE.Mesh(new THREE.ConeGeometry(4, 60, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#fff4c0', transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    beam.rotation.z = Math.PI / 2; beam.position.x = 30; const arm = new THREE.Group(); arm.position.y = 3.4; lb.add(arm); arm.add(beam); glow(0, 3.4, 0, 0xfff4c0, 5, 0.8, lb); anims.push(dt => { arm.rotation.y += dt * 0.5; }); }

  // ---------- helpers: round walls with door gaps, circular floors / ceilings ----------
  function ringWall(cx, cz, r, h, gapDegs, mat, gapW = 1.6) { const ga = Math.asin(Math.min(0.95, gapW / r)), gs = gapDegs.map(d => { const [dx, dz] = POL(1, d); return Math.atan2(dx, dz); }).sort((a, b) => a - b);
    const segs = []; if (!gs.length) segs.push([0, Math.PI * 2]); else gs.forEach((a, i) => { const b = i + 1 < gs.length ? gs[i + 1] : gs[0] + Math.PI * 2; segs.push([a + ga, b - a - 2 * ga]); });
    for (const [s, l] of segs) if (l > 0.01) Q(new THREE.CylinderGeometry(r, r, h, Math.max(8, Math.ceil(48 * l / (Math.PI * 2))), 1, true, s, l), mat, cx, h / 2, cz);
    for (const a of gs) Q(new THREE.CylinderGeometry(r, r, h - 3.2, 4, 1, true, a - ga, 2 * ga), mat, cx, 3.2 + (h - 3.2) / 2, cz); }
  function disk(cx, cz, r, y, mat, up = true) { const m = Q(new THREE.CircleGeometry(r, 48), mat, cx, y, cz); m.rotation.x = up ? -Math.PI / 2 : Math.PI / 2; return m; }
  function lodge(R, floorM, wallM, roofC, extraGaps = []) { disk(R.x, R.z, R.r, 0.006, floorM); ringWall(R.x, R.z, R.r, R.h, [R.a + 180, ...extraGaps], wallM); const rf = Q(new THREE.ConeGeometry(R.r + 0.4, 2.2, 24, 1, true), toon(roofC, { side: THREE.DoubleSide }), R.x, R.h + 1.1, R.z); void rf; disk(R.x, R.z, R.r, R.h, dark, false);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; B(0.2, 0.2, R.r - 0.4, bark2, R.x + Math.sin(a) * R.r / 2, R.h - 0.2, R.z + Math.cos(a) * R.r / 2).rotation.y = a; } }
  // the sign pair at a lodge door, on the atrium side (facing the tree) and inside the lodge
  function doorSigns(R, big, sub, fg) { const [ox, oz] = POL(13.0, R.a), ry = -R.a * Math.PI / 180; const tx = Math.cos(ry), tz = -Math.sin(ry); const nx = Math.sin(ry), nz = Math.cos(ry);
    sign([big, sub], 4.0, 0.95, fg, ox + nx * 0.3, 4.4, oz + nz * 0.3, ry); sign([big], 1.3, 0.5, fg, ox + tx * 2.6 + nx * 0.3, 1.6, oz + tz * 2.6 + nz * 0.3, ry);
    const [ix, iz] = POL(R.d - R.r + 0.6, R.a); sign(['TO THE GREAT TREE'], 2.2, 0.6, '#ffd23a', ix + tx * 2.4, 3.3, iz + tz * 2.4, ry + Math.PI); }

  // ---------- THE GREAT TREE (the atrium) ----------
  { const R = NE_ROOMS[0]; disk(0, 0, R.r, 0.005, mossM); ringWall(0, 0, R.r, R.h, NE_ROOMS.slice(1).map(q => q.a), wovenM);
    disk(0, 0, R.r, R.h, toon('#0e1a0c', { side: THREE.DoubleSide }), false);
    // the trunk, roots, canopy
    CY(3.0, 3.8, R.h, bark, 0, R.h / 2, 0, 18, g, true); circles.push([0, 0, 4.1]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, rt = CY(0.35, 0.7, 4.2, bark2, Math.sin(a) * 4.2, 0.25, Math.cos(a) * 4.2, 8); rt.rotation.set(Math.cos(a) * 1.3, 0, -Math.sin(a) * 1.3); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, br = CY(0.4, 0.7, 9, bark, Math.sin(a) * 4.5, 11.5, Math.cos(a) * 4.5, 8); br.rotation.set(Math.cos(a) * 1.0, 0, -Math.sin(a) * 1.0); }
    const crown = []; for (let i = 0; i < (LOW ? 16 : 30); i++) { const a = rnd() * Math.PI * 2, d = rr(3, 12), l = Q(new THREE.IcosahedronGeometry(rr(1.6, 2.8), 0), rnd() < 0.5 ? leaf : leaf2, Math.sin(a) * d, rr(12, 14.6), Math.cos(a) * d); crown.push([l, rnd() * 6]); }
    anims.push((dt, t) => crown.forEach(([l, p]) => { l.rotation.y = Math.sin(t * 0.2 + p) * 0.1; }));
    // hanging lanterns (path readability) + glowworms
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.26, d = 9.6, x = Math.sin(a) * d, z = Math.cos(a) * d; B(0.03, 6, 0.03, dark, x, 9, z); Q(new THREE.SphereGeometry(0.22, 10, 8), basic('#ffe0a0'), x, 5.8, z); glow(x, 5.8, z, 0xffcf7a, 2.2, 0.6); }
    if (!LOW) { const n = 140, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, d = rr(4.5, 12.5); pos[i * 3] = Math.sin(a) * d; pos[i * 3 + 1] = rr(2, 13); pos[i * 3 + 2] = Math.cos(a) * d; } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const pm = new THREE.PointsMaterial({ color: 0x9ff09f, size: 0.09, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }); g.add(new THREE.Points(geo, pm));
      anims.push((dt, t) => { if (!g.visible) return; pm.opacity = 0.6 + 0.3 * Math.sin(t * 1.3); for (let i = 0; i < n; i++) { pos[i * 3 + 1] += Math.sin(t * 0.7 + i) * dt * 0.08; } geo.attributes.position.needsUpdate = true; }); }
    // the ring stream round the trunk (r 5.2..6.4) + four plank bridges (N, E, S, W)
    const ringW = Q(new THREE.RingGeometry(5.2, 6.4, 48), basic(WATER, 0.85), 0, -0.08, 0); ringW.rotation.x = -Math.PI / 2; const ripples = [];
    for (let i = 0; i < (LOW ? 6 : 14); i++) { const a = rnd() * Math.PI * 2, rp = Q(new THREE.RingGeometry(0.08, 0.13, 12), basic('#e0f4ff', 0.5, true), Math.sin(a) * 5.8, -0.06, Math.cos(a) * 5.8); rp.rotation.x = -Math.PI / 2; ripples.push([rp, a, rnd()]); }
    anims.push((dt, t) => ripples.forEach(r => { r[1] += dt * 0.12; const k = (t * 0.5 + r[2]) % 1; r[0].position.set(Math.sin(r[1]) * 5.8, -0.06, Math.cos(r[1]) * 5.8); r[0].scale.setScalar(1 + k * 3); r[0].material.opacity = 0.5 * (1 - k); }));
    for (const deg of [0, 90, 180, 270]) { const [x, z] = POL(5.8, deg), bd = B(2.2, 0.2, 2.0, plankM, x, 0.1, z); bd.rotation.y = -deg * Math.PI / 180; }
    for (let k = 0; k < 4; k++) { const a0 = k * 90 + 14, a1 = k * 90 + 76; for (let d = a0; d <= a1; d += 6) { const [x, z] = POL(5.8, d); circles.push([x, z, 0.75]); } }
    // mushrooms + root seats
    for (let i = 0; i < 16; i++) { const a = rnd() * Math.PI * 2, d = rr(7, 12), x = Math.sin(a) * d, z = Math.cos(a) * d; if (HALLS.some(H => Math.abs(((Math.atan2(x, -z) * 180 / Math.PI - H.deg + 540) % 360) - 180) < 12)) continue; CY(0.06, 0.08, 0.3, toon('#f3efe4'), x, 0.15, z, 6); const cap = Q(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), rnd() < 0.5 ? glowM : toon('#b3121b'), x, 0.3, z); void cap; }
    sign(['NEBO STATION', 'THE GREAT TREE \u00b7 PUT A PAW ON THE BARK'], 4.6, 1.1, GLOWG, 0, 2.6, 4.0, 0);
    spots.push({ key: 'nsTree', r: 1.0, x: 0, z: 4.6, run: X => { X.audio && X.audio.tone && X.audio.tone(196, 1.6, 0.03, 'sine', 0.6); X.note('THE GREAT TREE', 'The bark hums under your paw: grow, rest, grow. And under it, faint, a cold note that does not belong.'); } }); }

  // ---------- the woven halls between the tree and the lodges ----------
  for (const H of HALLS) { const [ax, az] = H.a, [bx, bz] = H.b, L = Math.hypot(bx - ax, bz - az), mx = (ax + bx) / 2, mz = (az + bz) / 2, ry = Math.atan2(bx - ax, bz - az);
    const fl = plane(3.0, L + 0.6, plankM, mx, 0.008, mz, 0, -Math.PI / 2); fl.rotation.order = 'YXZ'; fl.rotation.set(-Math.PI / 2, ry, 0);
    for (const s of [-1, 1]) { const w = B(0.25, 3.4, L, wovenM, mx + Math.cos(ry) * s * 1.6, 1.7, mz - Math.sin(ry) * s * 1.6); w.rotation.y = ry; } const c = B(3.4, 0.2, L, bark2, mx, 3.5, mz); c.rotation.y = ry; glow(mx, 3.0, mz, 0xffcf7a, 1.6, 0.6); }

  // ---------- OPERATIONS · THE LIGHTHOUSE (N) ----------
  { const R = RM('ops'); lodge(R, plankM, wovenM, '#2e6a2a');
    CY(1.8, 2.0, 1.0, bark2, R.x, 0.5, R.z, 12, g, true); circles.push([R.x, R.z, 2.3]);
    const holo = new THREE.Group(); holo.position.set(R.x, 1.5, R.z); g.add(holo); Q(new THREE.SphereGeometry(0.7, 20, 14), toon('#3f8a3a', { emissive: new THREE.Color('#2e6a2a'), emissiveIntensity: 0.3 }), 0, 0.4, 0, holo); const tr = Q(new THREE.TorusGeometry(1.1, 0.12, 8, 32), basic(WATER, 0.7, true), 0, 0.4, 0, holo); tr.rotation.x = Math.PI / 2;
    const hg = glow(R.x, 1.9, R.z, 0x9ff09f, 3, 0.35); holoRef = [holo, hg]; anims.push(dt => { holo.rotation.y += dt * 0.3; });
    spots.push({ key: 'nsDockSpot', r: 1.1, x: R.x, z: R.z + NE_GAMES.dock.theme.standZ, run: X => X.prompt('DOCKING CONTROL', 'The Lighthouse \u00b7 Warden Elm\u2019s board', [['TAKE THE WATCH', () => hooks.play && hooks.play('dock')], ['NOT NOW', null]]) });
    sign(['THE LIGHTHOUSE', 'WATER RING LANES \u00b7 FOG AT DUSK'], 4.2, 1.0, GLOWG, R.x, 5.0, R.z - R.r + 0.7, 0); doorSigns(R, 'THE LIGHTHOUSE', 'OPERATIONS', GLOWG); }

  // ---------- SECURITY · THE WILLOW NET (NE) ----------
  { const R = RM('sec'); lodge(R, mossM, wovenM, '#3a4a2a');
    spots.push({ key: 'nsScanSpot', r: 1.1, x: NE_GAMES.scan.at.x, z: NE_GAMES.scan.at.z + 6.4 * 0.7 / 2 + 1.0, run: X => X.prompt('CARGO SCAN', 'The Willow Net \u00b7 Ranger Thorne', [['WORK THE BELT', () => hooks.play && hooks.play('scan')], ['NOT NOW', null]]) });
    const NT = { x: R.x - 1.6, z: R.z - 5.2 }; const net = Q(new THREE.SphereGeometry(1.3, 12, 8), toon('#8a7a4a', { wireframe: true }), NT.x, 1.4, NT.z); void net; circles.push([NT.x, NT.z, 1.4]); B(0.06, 3, 0.06, bark2, NT.x, 4.0, NT.z);
    const bot = new THREE.Group(); bot.position.set(NT.x, 0.6, NT.z); g.add(bot); const bm = toon('#7a8a7a'); B(0.7, 0.7, 0.5, bm, 0, 0.6, 0, bot); Q(new THREE.SphereGeometry(0.3, 12, 8), bm, 0, 1.2, 0, bot);
    const eye = Q(new THREE.SphereGeometry(0.08, 10, 8), basic('#5fe3ff'), 0, 1.25, 0.27, bot); const eg = glow(0, 1.25, 0.32, 0x5fe3ff, 0.5, 0.8, bot); bot.rotation.y = 0.5;
    anims.push((dt, t) => { const hacked = Math.sin(t * 0.7) > 0.94; eye.material.color.set(hacked ? '#ec3013' : '#5fe3ff'); eg.material.color.set(hacked ? '#ec3013' : '#5fe3ff'); bot.rotation.z = Math.sin(t * 0.9) * 0.08; });
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, x = NT.x + Math.cos(a) * 1.9, z = NT.z + Math.sin(a) * 1.9; CY(0.05, 0.07, 0.3, toon('#f3efe4'), x, 0.15, z, 6); Q(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), glowM, x, 0.3, z); } glow(NT.x, 0.6, NT.z, 0x9ff09f, 3.4, 0.35);
    sign(['THE WILLOW NET', 'FLEET UNIT 4-MOSS \u00b7 KEEP IT DARK'], 2.8, 0.8, GLOWG, NT.x, 3.4, NT.z + 1.6, 0);
    spots.push({ key: 'nsNet', r: 1.2, x: NT.x + 2.8, z: NT.z + 0.6, run: X => { X.audio && X.audio.tone && X.audio.tone(330, 1.4, 0.03, 'sine', 0.6); X.note('THE WILLOW NET \u00b7 UNIT 4-MOSS', '\u201CIn the dark I see its lights. A ship with no name, behind the dead moon, past the Belt. Help us.\u201D'); try { X.save.setFlag('nsBotHeard'); } catch (e) {} } });
    doorSigns(R, 'THE WILLOW NET', 'SECURITY', '#ff8a6a'); }

  // ---------- ENGINEERING · THE WATERWHEEL (SE) ----------
  { const R = RM('eng'), P0 = NE_GAMES.cond.at; disk(R.x, R.z, R.r, 0.004, dark); { const hole = [P0.x - P0.hw - 0.16, P0.x + P0.hw + 0.16, P0.z - P0.hd - 0.16, P0.z + P0.hd + 0.16];
      for (const [p, q, r2, s2] of [[R.x - R.r, R.x + R.r, R.z - R.r, hole[2]], [R.x - R.r, R.x + R.r, hole[3], R.z + R.r], [R.x - R.r, hole[0], hole[2], hole[3]], [hole[1], R.x + R.r, hole[2], hole[3]]]) plane(q - p, s2 - r2, plankM, (p + q) / 2, 0.008, (r2 + s2) / 2, 0, -Math.PI / 2); }
    ringWall(R.x, R.z, R.r, R.h, [R.a + 180], wovenM); Q(new THREE.ConeGeometry(R.r + 0.4, 2.2, 24, 1, true), toon('#2e6a2a', { side: THREE.DoubleSide }), R.x, R.h + 1.1, R.z); disk(R.x, R.z, R.r, R.h, dark, false);
    const wheel = new THREE.Group(); wheel.position.set(R.x + 2.2, 2.4, R.z + 3.4); g.add(wheel); for (let i = 0; i < 2; i++) { const ri = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.12, 6, 24), bark); ri.position.x = i ? 0.5 : -0.5; ri.rotation.y = Math.PI / 2; wheel.add(ri); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, p = B(1.1, 0.5, 0.1, plankM, 0, Math.sin(a) * 1.9, Math.cos(a) * 1.9, wheel); p.rotation.x = -a; } const ax = CY(0.12, 0.12, 1.6, bark2, 0, 0, 0, 8, wheel); ax.rotation.z = Math.PI / 2;
    const trough = B(1.4, 0.4, 2.0, bark2, R.x + 2.2, 0.2, R.z + 3.4); void trough; const fallW = B(0.9, 2.2, 0.1, basic(WATER, 0.7), R.x + 2.2, 3.6, R.z + 1.5); blocks.push([R.x + 1.4, R.x + 3.0, R.z + 1.4, R.z + 5.4]);
    anims.push((dt, t) => { boost = Math.max(0, boost - dt * 0.2); wheel.rotation.x -= dt * (0.6 + boost * 0.8); fallW.material.opacity = 0.6 + 0.1 * Math.sin(t * 9); });
    spots.push({ key: 'nsCondSpot', r: 1.1, x: P0.x, z: P0.z + P0.hd + 0.9, run: X => X.prompt('WATERWHEEL LINES', 'The Waterwheel \u00b7 Chief Hazel', [['FIX THE LINES', () => hooks.play && hooks.play('cond')], ['NOT NOW', null]]) });
    doorSigns(R, 'THE WATERWHEEL', 'ENGINEERING', '#5fb8e8'); }

  // ---------- BERTH SEVEN (S) ----------
  { const R = RM('berth'); lodge(R, plankM, wovenM, '#2e6a2a');
    Q(new THREE.TorusGeometry(1.5, 0.28, 10, 32), bark, R.x, 1.8, R.z + R.r - 0.5); Q(new THREE.CircleGeometry(1.4, 32), toon('#2a3a2a'), R.x, 1.8, R.z + R.r - 0.45).rotation.y = Math.PI;
    const lamp = glow(R.x + 1.9, 3.4, R.z + R.r - 0.7, 0xffb020, 1.4, 0.8); anims.push((dt, t) => { lamp.material.opacity = Math.floor(t * 2) % 2 ? 0.85 : 0.25; });
    sign(['AIRLOCK', 'YOUR SHIP IS TIED TO A ROOT'], 2.6, 0.8, '#ffd23a', R.x - 3.0, 2.6, R.z + R.r - 0.9, Math.PI);
    for (let i = 0; i < 3; i++) { const rt = CY(0.3, 0.5, 4, bark2, R.x - 4 + i * 0.7, 0.3, R.z + 2 + i * 0.4, 8); rt.rotation.z = 1.3; }
    spots.push({ key: 'nsLock', r: 1.4, x: R.x, z: R.z + R.r - 1.6, run: X => X.prompt('NEBO STATION \u00b7 BERTH SEVEN', 'Your ship is tied up on the other side of the airlock.', [['BACK TO YOUR SHIP \u00b7 SPACE', () => { X.audio && X.audio.tone && X.audio.tone(90, 1.6, 0.05, 'sawtooth', 1.5); if (hooks.nav) hooks.nav('Space Map.dc.html?from=neboSt'); }], ['STAY ABOARD', null]]) });
    doorSigns(R, 'BERTH SEVEN', 'AIRLOCK \u00b7 YOUR SHIP', '#ffd23a'); }

  // ---------- THE HONEY HALL (SW) ----------
  { const R = RM('honey'); lodge(R, plankM, wovenM, '#a87a2a');
    B(5, 1.0, 1.0, bark, R.x, 0.5, R.z - 2.4, g, true); blocks.push([R.x - 2.5, R.x + 2.5, R.z - 2.9, R.z - 1.9]); for (let i = 0; i < 7; i++) { CY(0.2, 0.24, 0.4, honey, R.x - 2.1 + i * 0.7, 1.2, R.z - 2.4, 10); }
    for (let i = 0; i < 3; i++) { const sk = new THREE.Group(); sk.position.set(R.x - 3 + i * 3, 4.2, R.z + 1.5); g.add(sk); B(0.02, 1.2, 0.02, dark, 0, 0.6, 0, sk); for (let k = 0; k < 4; k++) { const hc = Q(new THREE.SphereGeometry(0.45 - k * 0.07, 10, 8), honey, 0, -k * 0.35, 0, sk); hc.scale.y = 0.7; } }
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, x = R.x + Math.sin(a) * (R.r - 0.8), z = R.z + Math.cos(a) * (R.r - 0.8); if (Math.hypot(x - RM('honey').x - Math.sin((R.a + 180) * Math.PI / 180) * R.r, z - R.z + Math.cos((R.a + 180) * Math.PI / 180) * R.r) < 2.5) continue; Q(new THREE.SphereGeometry(0.22, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), i % 2 ? glowM : toon('#b3121b'), x, 0.25, z); }
    sign(['THE HONEY HALL', 'WILDFLOWER \u00b7 PINE \u00b7 GLOWCAPS'], 4.2, 1.0, HONEY, R.x, 3.4, R.z - 2.9, 0); doorSigns(R, 'THE HONEY HALL', 'HONEY + MUSHROOMS', HONEY); }

  // ---------- THE GLIDER LOFT (NW) ----------
  { const R = RM('glider'); lodge(R, plankM, wovenM, '#2a5a8a');
    const sails = []; for (let i = 0; i < 3; i++) { const sg = new THREE.Group(); sg.position.set(R.x - 1.8 + i * 1.8, 4.2 + (i % 2) * 0.4, R.z - 1 + i * 1.4); g.add(sg); const s = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.1, 3), toon(['#3f8a3a', '#e6b45a', '#2a5a8a'][i])); s.rotation.x = Math.PI / 2; s.scale.set(1, 1, 0.5); sg.add(s); B(0.05, 0.05, 2.8, bark2, 0, 0, 0, sg); sails.push([sg, rnd() * 6]); }
    anims.push((dt, t) => sails.forEach(([s, p]) => { s.rotation.z = Math.sin(t * 0.7 + p) * 0.08; s.position.y += Math.sin(t * 0.9 + p) * dt * 0.05; }));
    B(0.3, 0.15, 6, bark2, R.x - 3.6, 0.9, R.z, g, true); B(0.6, 0.9, 0.3, bark2, R.x - 3.6, 0.45, R.z + 2.8); blocks.push([R.x - 4.0, R.x - 3.2, R.z - 3, R.z + 3]); sign(['LAUNCH RAIL'], 1.6, 0.45, '#5fb8e8', R.x - 3.2, 1.6, R.z, Math.PI / 2);
    sign(['THE GLIDER LOFT', 'OFF THE RAIL \u00b7 ROUND THE WATER RING'], 4.2, 1.0, '#5fb8e8', R.x - R.r + 0.7, 5.3, R.z, Math.PI / 2); doorSigns(R, 'THE GLIDER LOFT', 'SAILS + WIND', '#5fb8e8'); }

  // ---------- walking, camera, labels ----------
  const segD = (x, z, H) => { const [ax, az] = H.a, [bx, bz] = H.b, dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l)); return Math.hypot(ax + t * dx - x, az + t * dz - z); };
  const inC = (R, x, z, m) => Math.hypot(x - R.x, z - R.z) < R.r - m;
  function walk(x, z) { for (const [cx, cz, cr] of circles) if (Math.hypot(x - cx, z - cz) < cr) return false;
    for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false;
    for (const R of NE_ROOMS) if (inC(R, x, z, 0.5)) return true; for (const H of HALLS) if (segD(x, z, H) < H.w - 0.1) return true; return false; }
  let cur = RM('berth');
  function tick(dt, t, px, pz) { const R = NE_ROOMS.find(q => inC(q, px, pz, 0.2)); if (R) cur = R; }
  function clampCam(v) { const R = cur, dx = v.x - R.x, dz = v.z - R.z, d = Math.hypot(dx, dz), m = R.r - 0.6; if (d > m) { v.x = R.x + dx * m / d; v.z = R.z + dz * m / d; }
    if (R.k === 'tree') { const d2 = Math.hypot(v.x, v.z); if (d2 < 4.4) { v.x *= 4.4 / Math.max(0.01, d2); v.z *= 4.4 / Math.max(0.01, d2); } v.y = Math.min(v.y, 10.6); } else v.y = Math.min(v.y, R.h - 0.4); }
  function label(x, z) { const R = NE_ROOMS.find(q => inC(q, x, z, 0)); return 'Nebo Station \u00b7 ' + (R ? R.name : 'The Woven Hall').toLowerCase().replace(/(^|\s)\S/g, s => s.toUpperCase()); }
  return { g, anims, walk, clampCam, label, tick, spots, hooks, blocks, circles, setHolo(v) { for (const o of holoRef) o.visible = v; }, surge(t = 2.6) { boost = Math.max(boost, t); }, vent() { boost = 3; } };
}
