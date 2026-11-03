// SALT BUILDING [meruSaltBuilding] · BATTLE (Ben s130): the Lakeside Salt family building, taken over by bandits. Runs on the Pearl Sail 3D floor
// engine (worlds/pearl-floor3d.js, mode 'salt'): same fox, combat, rail camera, red runner, stair door, props, hazards, power-ups.
// Ben's picks: 3 floors + the roof · 1 SMUGGLER WAREHOUSE (dock) → 2 COUNTING ROOM + VAULT → 3 CARD ROOM + BACK OFFICE → ROOF HELIPAD boss.
// Bandits: BRAWLER (crawler brain, gloves) · THROWER (crawler cannon brain: aim line, bottle) · CHARGER (rushes from far) · SHIELD (guard brain,
// door shield, hit from behind / after a bash) · PICKPOCKET (steals gold + runs; catch him = gold back + bonus) · LOOKOUT (whistles up 2 brawlers).
// Spawners = BANDIT CAMPS (tent, campfire, flag; the engine's gates). Boss BARNACLE in a stolen FORKLIFT (rush lane, fork slam = jump,
// crate lobs, calls the crew); knock him out of it → he climbs out (big, no weapons, big paws) → the DUEL (Kyoto duel engine, ?salt=1).
import { PLAYER_MALE } from '../fox-kit.js';
import { coverAI } from '../engine/cover-ai.js';   // s131: bandits fight from cover (shared with Pepper)

export const BARNACLE = { key: 'barnacle', name: 'BARNACLE', torso: ['#3a1a1a', '#2a1010', '#120808'], crest: '', outfit: 'vest', gear: 'none', eyes: ['#ffd23a', '#ffd23a'], mood: 'stern',
  look: { ...PLAYER_MALE, fur: '#7a6a5a', furDark: '#4a3f36', tailBase: '#4a3f36', tailMid: '#7a6a5a', tailTip: '#e9e6e0' } };
const WH = 3.2;
const WALLS4 = () => [[-24.3, -24, -18, 18, WH, 'wall'], [-24, 24, -18.3, -18, WH, 'wall'], [-24, 24, 18, 18.3, WH, 'wall'], [-27, -24.3, -21, 21, 8, 'void'], [24.3, 27, -21, 21, 8, 'void'], [-27, 27, -21, -18.3, 8, 'void'], [-27, 27, 18.3, 21, 8, 'void']];

export const SALT_FLOORS = [
  // 1 · SMUGGLER WAREHOUSE: crate rows, the DOCK DOOR open onto the lake (east), bandit camps in the bays
  (() => { const W = WALLS4().concat([[24, 24.3, -18, -4, WH, 'wall'], [24, 24.3, 6, 18, WH, 'wall'], [24.3, 24.6, -4, 6, 8, 'void'], [23.5, 24, -4, 6, 1.0, 'edge'],
      [-13, -6, 5.8, 7.2, 2.6, 'crate'], [-4.6, 3, 5.8, 7.2, 2.6, 'crate'], [4.4, 11, 5.8, 7.2, 2.6, 'crate'], [12.4, 21, 5.8, 7.2, 2.6, 'crate'],
      [-21, -14, -5.8, -4.4, 2.6, 'crate'], [-12.6, -5, -5.8, -4.4, 2.6, 'crate'], [-3.6, 4, -5.8, -4.4, 2.6, 'crate'], [5.4, 13, -5.8, -4.4, 2.6, 'crate'],
      [-8, -6.6, 14.5, 15.9, 1.1, 'crate'], [8, 9.4, 15, 16.4, 1.1, 'crate'], [-2, -0.6, -15.6, -14.2, 1.1, 'crate'], [10, 11.4, -16, -14.6, 1.1, 'crate'], [19.6, 21, -15, -13.6, 1.1, 'crate'],
      [19.5, 22, -9, -7.4, 2.2, 'fork']]);
    return { name: 'SMUGGLER WAREHOUSE', art: 'warehouse', wallCol: 0xa0614a, floorCol: '#8f8b84', tip: 'BANDITS IN THE WAREHOUSE · BREAK THE CAMPS', walls: W,
      route: [[19, 12], [-17, 12], [-17, 1], [17, 1], [17, -11], [-22.4, -11]], exit: [-23.8, -11],
      foes: [['crawler', [12, 12], [4, 12], 'gloves'], ['crawler', [-6, 12], [-12, 12], 'gloves'], ['crawler', [2, 15], [-4, 15], 'cannon'], ['guard', [-17, 8], [-17, 4], 'sword'], ['lookout', [-20.5, 9.5]],
        ['crawler', [-10, 1], [0, 1], 'gloves'], ['crawler', [6, 1], [12, 1], 'charge'], ['pickpocket', [3, 3], [-3, 3]], ['crawler', [14.5, -2], [14.5, -2], 'cannon'], ['crawler', [20, -9.5], [20, -2], 'gloves'],
        ['guard', [8, -11], [0, -11], 'sword'], ['crawler', [-8, -11], [-14, -11], 'gloves'], ['crawler', [-6, -15], [-12, -15], 'cannon'], ['crawler', [-20, -14], [-20, -8], 'charge']],
      gates: [[0, 16.2, [[0, 12]]], [-21.5, 6.5, [[-17, 6.5]]], [21.2, -3, [[17, -3]]]],
      loot: [[22, 16, 'chip'], [-22, 16, 'pearl'], [22, -16, 'chip'], [-10, -16, 'pearl']], powers: [[-22.5, -1.5, 'speed'], [-3, 16.5, 'shield'], [22, 9.5, 'triple'], [3, -16.5, 'power']],
      hazards: [[-4, 12, 'spill', 2.6, 2.2, 0], [9, 1, 'spill', 2.4, 2, 0], [-17, -2, 'steam', 1.6, 1.6, 0.5], [4, -11, 'steam', 1.6, 1.6, 1.2]] }; })(),
  // 2 · COUNTING ROOM + VAULT: cashier cages, counting tables, the open VAULT in the north-west corner
  (() => { const W = WALLS4().concat([[24, 24.3, -18, 18, WH, 'wall'],
      [-13, -3, -7.6, -6.4, 1.05, 'counter'], [-13, -3, -7.06, -6.94, WH, 'gwall'], [-1.6, 8.4, -7.6, -6.4, 1.05, 'counter'], [-1.6, 8.4, -7.06, -6.94, WH, 'gwall'], [9.8, 21, -7.6, -6.4, WH, 'wall'],
      [-21, -12, 4.4, 5.6, WH, 'wall'], [-10.6, -1, 4.94, 5.06, WH, 'gwall'], [0.4, 14, 4.4, 5.6, WH, 'wall'],
      [-14, -13.6, 13, 18, WH, 'wall'], [-24, -20.6, 13, 13.4, WH, 'wall'], [-17.4, -14, 13, 13.4, WH, 'wall'],
      [-8, -4, -16.8, -15.2, 0.85, 'table'], [2, 6, -16.8, -15.2, 0.85, 'table'], [12, 16, -16.8, -15.2, 0.85, 'table'], [0, 4, 14.5, 16.5, 0.85, 'table'], [8, 12, 14.5, 16.5, 0.85, 'table'],
      [-10, -8, 1.6, 3.2, 0.85, 'table'], [5, 7, 7.6, 9.4, 0.85, 'table']]);
    return { name: 'COUNTING ROOM', art: 'counting', wallCol: 0xe2d6bf, floorCol: '#6b2a2e', tip: 'THE COUNTING ROOM · THE VAULT DOOR IS OPEN', walls: W,
      route: [[18, -13], [-17, -13], [-17, -1], [17, -1], [17, 11], [-22.4, 11]], exit: [-23.8, 11],
      foes: [['crawler', [10, -13], [2, -13], 'gloves'], ['guard', [-6, -13], [-12, -13], 'sword'], ['crawler', [-14, -16], [-20, -16], 'cannon'], ['lookout', [-21, -3]], ['crawler', [-17, -9.5], [-17, -4], 'charge'],
        ['crawler', [-8, -1], [2, -1], 'gloves'], ['pickpocket', [6, 2], [0, 2]], ['crawler', [10, -4], [4, -4], 'cannon'], ['guard', [14, -1], [14, -1], 'sword'], ['crawler', [20, 2], [20, 8], 'gloves'],
        ['crawler', [8, 11], [0, 11], 'gloves'], ['crawler', [-6, 15], [-6, 15], 'cannon'], ['guard', [-10, 11], [-14, 11], 'sword'], ['crawler', [-4, 8], [-10, 8], 'charge']],
      gates: [[-1, -16.2, [[-1, -13]]], [-21.5, -7, [[-17, -7]]], [21.5, 5, [[17, 5]]]],
      loot: [[-22, 16.4, 'chip'], [-19, 16.4, 'chip'], [-16, 16.4, 'pearl'], [22, -16.5, 'chip']], powers: [[-15.6, 15.2, 'triple'], [22, 16, 'shield'], [-22, -16, 'speed'], [21.5, -3.5, 'power']],
      hazards: [[4, -13, 'shock', 2.8, 2.6, 0], [-10, -1, 'spill', 2.4, 2, 0], [17, 7, 'shock', 2.6, 2.4, 1.4], [2, 11, 'spill', 2.4, 2, 0]] }; })(),
  // 3 · CARD ROOM + BACK OFFICE: green felt tables + chandeliers (west), Old Salt's back office with the lake window (east); the stair door is east
  (() => { const W = WALLS4().concat([[24, 24.3, -18, 18, WH, 'glass'],
      [-13.6, -12.4, -8, 18, WH, 'wall'], [-0.6, 0.6, -18, 8, WH, 'wall'], [12.4, 13.6, -8, 18, WH, 'wall'],
      [-23.5, -20, 16.6, 17.6, 1.0, 'counter'], [21.4, 23.6, -5, -2, 0.8, 'desk'], [21, 23.8, -17.6, -16.6, 2.2, 'wall'], [22.6, 23.6, 12, 13.4, 1.4, 'wall']]);
    for (const [x, z] of [[-22.5, 1], [-22.5, 9], [-10.8, -4], [-10.8, 5], [-3.2, -5], [-3.2, 4], [3.2, 7], [10.8, -4], [10.8, 4]]) W.push([x - 0.85, x + 0.85, z - 0.85, z + 0.85, 0.8, 'felt']);
    return { name: 'CARD ROOM · BACK OFFICE', art: 'cardroom', wallCol: 0x6a3a2e, floorCol: '#5a1d26', tip: 'THE CARD ROOM · THEN THE BACK OFFICE · THEN THE ROOF', walls: W,
      route: [[-19, 14], [-19, -13], [-7, -13], [-7, 13], [7, 13], [7, -13], [19, -13], [19, 8], [22.4, 8]], exit: [23.8, 8], exitSide: 'e',
      foes: [['crawler', [-19, 6], [-19, 0], 'gloves'], ['guard', [-19, -6], [-19, -10], 'sword'], ['crawler', [-22, 13], [-22, 4.5], 'cannon'], ['crawler', [-14, -13], [-10, -13], 'charge'], ['pickpocket', [-10, 0], [-4, 0]],
        ['crawler', [-7, -4], [-7, 4], 'gloves'], ['lookout', [-3, 10]], ['crawler', [-7, 10], [-4, 13], 'cannon'], ['guard', [3, 13], [3, 13], 'sword'], ['crawler', [7, 6], [7, -2], 'gloves'],
        ['crawler', [10.5, -10], [4, -10], 'cannon'], ['crawler', [7, -12], [12, -12], 'charge'], ['guard', [19, -6], [19, 0], 'sword'], ['crawler', [22, 6], [16, 6], 'gloves'], ['crawler', [22, -10], [16, -10], 'cannon']],
      gates: [[-22.5, -9, [[-19, -9]]], [3.4, -2, [[7, -2]]], [16.2, 3, [[19, 3]]]],
      loot: [[-23, -16, 'chip'], [-3, 16, 'pearl'], [11, 16, 'chip'], [23, -14, 'chip']], powers: [[-23, 15.5, 'shield'], [-3.4, -16.5, 'triple'], [10.5, 16.5, 'speed'], [16, -16, 'power']],
      hazards: [[-19, -1, 'spill', 2.4, 2, 0], [-7, 0, 'spill', 2.4, 2, 0], [7, 4, 'shock', 2.6, 2.4, 0.6], [13, -13, 'spill', 2.6, 2.2, 0]] }; })(),
  // 4 · THE ROOF: helipad, the family helicopter, water tanks, the FREIGHT LIFT (the forklift comes out of it), Meru + the lake below
  (() => { const W = [[-24.6, -24.3, -18.6, 18.6, 8, 'void'], [24.3, 24.6, -18.6, 18.6, 8, 'void'], [-24.6, 24.6, -18.6, -18.3, 8, 'void'], [-24.6, 24.6, 18.3, 18.6, 8, 'void'],
      [-24.3, -23.7, -18.3, 18.3, 1.15, 'ledge'], [23.7, 24.3, -18.3, 18.3, 1.15, 'ledge'], [-23.7, 23.7, -18.3, -17.7, 1.15, 'ledge'], [-23.7, 23.7, 17.7, 18.3, 1.15, 'ledge'],
      [-23.7, -19.5, -2.5, 3.5, 3.4, 'wall'], [19.6, 23.7, -3, 3, 3.6, 'wall'], [-9, -2, 10.5, 14, 2.4, 'copter'], [-16.5, -12.5, -15.5, -11.5, 3.2, 'tank'], [12.5, 16.5, 12, 16, 3.2, 'tank']];
    return { name: 'THE ROOF', art: 'helipad', open: true, boss: true, wallCol: 0xcfc8bb, floorCol: '#b9bcc0', rugW: 2.6, tip: 'AMBUSH ON THE ROOF!', walls: W,
      route: [[-10.5, 0.5], [-5, 0.5], [-1, 0], [4, 0]], exit: [999, 999],
      foes: [['crawler', [-6, -5], [-10, -8], 'gloves'], ['crawler', [-4, 6], [-10, 6], 'gloves'], ['crawler', [2, -8], [2, -8], 'cannon'], ['crawler', [6, 8], [0, 8], 'charge'], ['guard', [8, -2], [8, 3], 'sword']],
      gates: [], loot: [[21, -16, 'chip'], [-21, 16, 'pearl']], powers: [[-12, 15, 'shield'], [10, -15, 'triple']], hazards: [] }; })(),
];

export function saltMode(o = {}) {   // s132: o = { lines, flip } so Pepper (worlds/pepper-building.js) reuses the bandits, camps, brains + cover with its own barks
  let C = null, cover = null; const BOSS_MAX = 600, TELL = {}, bits = { fires: [], lift: null, rotor: null };
  const rnd = (a, b) => a + Math.random() * (b - a), pk = a => a[(Math.random() * a.length) | 0];
  const FURS = [['#c46a2b', '#8a4519'], ['#8a8f96', '#5c6168'], ['#6b4a32', '#3f2b1d'], ['#d9cbb5', '#a8977e'], ['#3d3b3a', '#24221f']];
  const TORSO = { gloves: ['#3d3b3a', '#2a2826', '#141312'], cannon: ['#5a4a32', '#3f3322', '#1f190f'], charge: ['#5a1a14', '#3d110d', '#1c0806'], sword: ['#2e4a6b', '#1e3150', '#101a2c'], pickpocket: ['#4a2a5a', '#331d3f', '#1a0e20'], lookout: ['#3f5a3a', '#2b3f28', '#141f12'] };
  let mk = null;   // shared materials
  function mats() { if (mk) return mk; const { toon, THREE } = C; mk = { ink: toon('#141312'), gold: toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.3 }), wood: toon('#8b6a48'), woodD: toon('#5c4430'), red: toon('#ec3013'), yel: toon('#ffd23a'), steel: toon('#9aa0a6'), dark: toon('#2a2d33'), navy: toon('#2e4a6b'), white: toon('#f3f2f2'), cloth: toon('#e9e2d0'), felt: toon('#2f6b45') }; return mk; }
  const tellTex = () => TELL.t || (TELL.t = C.CT(64, 64, (g, w) => { g.fillStyle = '#ec3013'; g.beginPath(); g.arc(32, 32, 28, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(27, 12, 10, 26); g.fillRect(27, 43, 10, 9); }));
  // ---------- a BANDIT: a fox-kit fox (front +z) inside a group whose front is +x (the bot convention the engine's brains use) ----------
  function bandit(kind) { const { THREE, kit, M } = C, m = mats(), outer = new THREE.Group(), u = outer.userData, fu = pk(FURS);
    const f = kit.makeFox({ key: 'bandit', merged: true, torso: TORSO[kind] || TORSO.gloves, crest: '', outfit: kind === 'sword' ? 'armor' : kind === 'pickpocket' || kind === 'lookout' ? 'coat' : 'vest', gear: 'none', mood: 'stern', eyes: ['#ffd23a', '#ffd23a'], look: { ...PLAYER_MALE, fur: fu[0], furDark: fu[1], tailBase: fu[1], tailMid: fu[0] } });
    f.rotation.y = Math.PI / 2; outer.add(f); u.fox = f; const FP = f.userData.P, A = FP.arms;
    // the bandit MASK: a black band round the eyes
    { const band = M(new THREE.TorusGeometry(0.41, 0.06, 6, 24), m.ink, 0, 0.06, 0, FP.head, 0); band.rotation.x = Math.PI / 2; band.scale.set(1.04, 1.04, 1.6); }
    const paw = new THREE.Object3D(); paw.position.set(0, -0.44, 0.06); A[1].add(paw); u.muzzle = paw;
    if (kind === 'gloves') for (const a of A) { const k = M(new THREE.SphereGeometry(0.12, 10, 8), m.gold, 0, -0.44, 0.04, a, 0.02); k.scale.set(1.1, 0.8, 1.2); }
    if (kind === 'cannon') { M(new THREE.CylinderGeometry(0.05, 0.06, 0.26, 8), toon2('#3f7d4a'), 0, -0.5, 0.08, A[1], 0.015); M(new THREE.BoxGeometry(0.26, 0.3, 0.16), m.woodD, -0.3, 0.75, -0.05, FP.body, 0.02); }
    if (kind === 'charge') { const hm = M(new THREE.SphereGeometry(0.43, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), m.dark, 0, 0.12, 0, FP.head, 0.02); for (const s of [-1, 1]) { const h = M(new THREE.ConeGeometry(0.07, 0.4, 8), m.cloth, s * 0.36, 0.32, 0.05, FP.head, 0.015); h.rotation.z = -s * 0.9; } for (const a of A) M(new THREE.SphereGeometry(0.15, 10, 6), m.dark, 0, 0.02, 0, a, 0.02); }
    if (kind === 'sword') { const sg = new THREE.Group(); sg.position.set(0, -0.3, 0.2); A[0].add(sg); for (let i = 0; i < 4; i++) M(new THREE.BoxGeometry(0.16, 0.95, 0.06), i % 2 ? m.wood : m.woodD, -0.24 + i * 0.16, 0, 0, sg, 0.012); M(new THREE.BoxGeometry(0.7, 0.08, 0.08), m.ink, 0, 0.25, 0.04, sg, 0); M(new THREE.BoxGeometry(0.7, 0.08, 0.08), m.ink, 0, -0.25, 0.04, sg, 0); u.shieldG = sg;
      M(new THREE.CylinderGeometry(0.035, 0.05, 0.75, 8), m.woodD, 0, -0.5, 0.22, A[1], 0.015).rotation.x = Math.PI / 2; }
    if (kind === 'pickpocket') { M(new THREE.ConeGeometry(0.45, 0.6, 12), toon2('#4a2a5a'), 0, 0.42, -0.05, FP.head, 0.02); const sk = M(new THREE.SphereGeometry(0.17, 10, 8), m.cloth, 0, -0.62, 0.05, A[0], 0.015); sk.scale.y = 1.2; u.sack = sk; sk.visible = false; }
    if (kind === 'lookout') { for (const s of [-0.07, 0.07]) M(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 8), m.ink, s, 0.95, 0.27, FP.body, 0.01).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.34, 0.36, 0.08, 14), m.dark, 0, 0.36, 0, FP.head, 0.01); M(new THREE.CylinderGeometry(0.25, 0.27, 0.3, 14), m.dark, 0, 0.5, 0, FP.head, 0.015); }
    const tell = new THREE.Sprite(new THREE.SpriteMaterial({ map: tellTex(), depthTest: false, transparent: true })); tell.scale.setScalar(0.55); tell.position.y = 2.55; tell.renderOrder = 22; tell.visible = false; outer.add(tell); u.tell = tell;
    u.eye = { material: { opacity: 0.6 } }; u.kind = kind; u.ms = []; outer.traverse(o => { if (o.isMesh && o.material !== C.outlineMat) u.ms.push([o, o.material]); }); return outer; }
  const t2 = {}; function toon2(c) { return t2[c] || (t2[c] = C.toon(c)); }
  // ---------- a BANDIT CAMP (the engine's gate): tent, campfire, crates, flag, a red beam so you find it ----------
  function camp() { const { THREE, M } = C, m = mats(), g = new THREE.Group(), u = g.userData;
    const tent = M(new THREE.ConeGeometry(1.5, 2.2, 4, 1, true), toon2('#7a5a3a'), -0.3, 1.1, 0, g, 0.03); tent.rotation.y = Math.PI / 4; tent.material = toon2('#7a5a3a'); M(new THREE.ConeGeometry(0.5, 0.8, 4), toon2('#3f2b1d'), -0.3, 0.4, 1.08, g, 0.01).rotation.y = Math.PI / 4;
    for (let i = 0; i < 5; i++) { const l = M(new THREE.CylinderGeometry(0.07, 0.07, 0.7, 6), m.woodD, 1.25 + Math.cos(i * 1.26) * 0.12, 0.08, Math.sin(i * 1.26) * 0.12, g, 0.01); l.rotation.z = Math.PI / 2; l.rotation.y = i * 1.26; }
    const fire = new THREE.Sprite(new THREE.SpriteMaterial({ map: C.glowTex, color: 0xff8a2a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); fire.position.set(1.25, 0.5, 0); fire.scale.setScalar(1.1); g.add(fire); bits.fires.push(fire);
    const fl = M(new THREE.ConeGeometry(0.22, 0.6, 6), new THREE.MeshBasicMaterial({ color: 0xffb347 }), 1.25, 0.4, 0, g, 0); fire.userData.cone = fl;
    M(new THREE.BoxGeometry(0.8, 0.8, 0.8), m.wood, -0.6, 0.4, -1.4, g, 0.02); M(new THREE.BoxGeometry(0.6, 0.6, 0.6), m.woodD, -0.5, 1.1, -1.35, g, 0.02).rotation.y = 0.4;
    M(new THREE.CylinderGeometry(0.04, 0.04, 3.4, 6), m.ink, -1.6, 1.7, 0.9, g, 0.01); { const fg = M(new THREE.PlaneGeometry(1.0, 0.65), new THREE.MeshBasicMaterial({ map: flagTex(), side: THREE.DoubleSide }), -1.1, 3.05, 0.9, g, 0); u.flag = fg; }
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 14, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xff3b2a, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 9; g.add(beam); u.beam = beam;
    u.eye = { material: { opacity: 0.6 } }; u.ms = []; g.traverse(o => { if (o.isMesh && o !== beam && o.material !== C.outlineMat && !(o.material && o.material.isMeshBasicMaterial)) u.ms.push([o, o.material]); }); return g; }
  const flagTex = () => TELL.f || (TELL.f = C.CT(128, 84, (g, w, h) => { g.fillStyle = '#141312'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ec3013'; g.lineWidth = 12; g.beginPath(); g.moveTo(30, 14); g.lineTo(98, 70); g.moveTo(98, 14); g.lineTo(30, 70); g.stroke(); g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(64, 42, 14, 0, 7); g.fill(); }));
  // ---------- the BOSS: BARNACLE in a stolen FORKLIFT (front +x) ----------
  function forklift() { const { THREE, M, kit } = C, m = mats(), g = new THREE.Group(), u = g.userData, Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    M(Bx(2.2, 1.1, 1.6), m.yel, 0, 0.85, 0, g, 0.04); M(Bx(0.9, 1.3, 1.62), m.dark, -1.15, 0.95, 0, g, 0.03); for (let i = 0; i < 5; i++) M(Bx(0.02, 0.16, 1.64), i % 2 ? m.ink : m.yel, -1.6, 0.5 + i * 0.18, 0, g, 0);
    M(Bx(1.0, 0.3, 0.02), m.navy, 0.1, 1.05, 0.81, g, 0); M(Bx(1.0, 0.3, 0.02), m.navy, 0.1, 1.05, -0.81, g, 0);
    for (const [x, z] of [[0.75, 0.8], [0.75, -0.8], [-0.8, 0.8], [-0.8, -0.8]]) M(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 14).rotateX(Math.PI / 2), m.ink, x, 0.38, z, g, 0.02);
    for (const [x, z] of [[0.9, 0.7], [0.9, -0.7], [-0.75, 0.7], [-0.75, -0.7]]) M(Bx(0.08, 1.75, 0.08), m.dark, x, 2.25, z, g, 0); M(Bx(1.9, 0.08, 1.6), m.dark, 0.08, 3.12, 0, g, 0.02);
    for (const z of [-0.5, 0.5]) M(Bx(0.14, 3.2, 0.14), m.dark, 1.25, 1.7, z, g, 0.02);
    const forks = new THREE.Group(); forks.position.set(1.38, 0.15, 0); g.add(forks); M(Bx(0.12, 0.9, 1.2), m.dark, 0, 0.45, 0, forks, 0.02); for (const z of [-0.35, 0.35]) M(Bx(1.3, 0.08, 0.16), m.steel, 0.65, 0.04, z, forks, 0.015);
    M(Bx(1.1, 0.14, 1.1), m.wood, 0.7, 0.15, 0, forks, 0.015); M(Bx(0.9, 0.8, 0.9), m.woodD, 0.7, 0.62, 0, forks, 0.02); u.forks = forks;
    const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: C.glowTex, color: 0xffb347, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); lamp.position.set(0, 3.3, 0); lamp.scale.setScalar(0.8); g.add(lamp); u.lamp = lamp;
    // BARNACLE in the seat (big: ×1.3)
    const d = kit.makeFox({ ...BARNACLE, merged: true }); d.scale.setScalar(1.3); d.rotation.y = Math.PI / 2; d.position.set(-0.25, 0.75, 0); g.add(d); u.driver = d; const DP = d.userData.P;
    { const band = M(new THREE.TorusGeometry(0.41, 0.06, 6, 24), m.ink, 0, 0.06, 0, DP.head, 0); band.rotation.x = Math.PI / 2; band.scale.set(1.04, 1.04, 1.6); }
    const stars = new THREE.Group(); stars.position.set(-0.25, 3.5, 0); g.add(stars); for (let i = 0; i < 4; i++) { const s = M(new THREE.OctahedronGeometry(0.16), m.yel, Math.cos(i * 1.57) * 0.55, 0, Math.sin(i * 1.57) * 0.55, stars, 0.01); s.scale.y = 0.6; } stars.visible = false; u.stars = stars;
    const smoke = []; for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: C.glowTex, color: 0x6b6b6b, transparent: true, opacity: 0, depthWrite: false })); s.position.set(-1.2, 2, 0); g.add(s); smoke.push(s); } u.smoke = smoke;
    u.eye = { material: { opacity: 0.6 } }; u.ms = []; g.traverse(o => { if (o.isMesh && o.material !== C.outlineMat && !(o.material && o.material.isMeshBasicMaterial)) u.ms.push([o, o.material]); }); return g; }
  // telegraphs + crates for the boss
  let lane = null, ring = null; const crates = [];
  function fx() { if (lane) return; const { THREE, scene } = C; lane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0, depthWrite: false })); lane.rotation.x = -Math.PI / 2; lane.visible = false; scene.add(lane);
    ring = new THREE.Mesh(new THREE.RingGeometry(4.6, 5.0, 48), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.visible = false; scene.add(ring);
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), mats().wood), sh = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.4, depthWrite: false })); sh.rotation.x = -Math.PI / 2; m.visible = sh.visible = false; scene.add(m); scene.add(sh); crates.push({ m, sh, on: false }); } }
  function lobCrate(e, A) { const c = crates.find(q => !q.on); if (!c) return; const tx = A.P.x + rnd(-1.2, 1.2), tz = A.P.z + rnd(-1.2, 1.2), T = 1.15, gg = 14, x0 = e.x + Math.cos(e.yaw) * 1.8, z0 = e.z - Math.sin(e.yaw) * 1.8, y0 = 1.6;
    Object.assign(c, { on: true, x: x0, y: y0, z: z0, vx: (tx - x0) / T, vz: (tz - z0) / T, vy: (0.4 - y0 + 0.5 * gg * T * T) / T, tx, tz }); c.m.visible = c.sh.visible = true; c.sh.position.set(tx, 0.05, tz); }
  function stepCrates(dt, A) { for (const c of crates) { if (!c.on) continue; c.vy -= 14 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt; c.m.position.set(c.x, c.y, c.z); c.m.rotation.x += dt * 4; c.m.rotation.z += dt * 3; c.sh.material.opacity = 0.25 + 0.25 * Math.sin(A.St.t * 20);
      let pop = false; for (const q of A.bolts) if (q.on && q.mine && Math.hypot(q.x - c.x, q.y - c.y, q.z - c.z) < 0.75) { q.on = false; q.m.visible = false; pop = true; A.say3('+5 G', c.x, c.y + 0.6, c.z, '#ffd23a'); A.save.addGold(5); break; }
      if (!pop && c.y < 0.4) { pop = true; if (Math.hypot(A.P.x - c.x, A.P.z - c.z) < 1.3 && A.P.y < 1.2) A.hurt(12, c.x, c.z); A.St.shake = Math.max(A.St.shake, 0.2); }
      if (pop) { c.on = false; c.m.visible = c.sh.visible = false; A.burst(c.x, Math.max(0.4, c.y), c.z, 14, 0xb98a5a, 6); A.chunks(c.x, Math.max(0.4, c.y), c.z, 6); } } }
  const yawTo = (dx, dz) => Math.atan2(-dz, dx), angD = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  const api = {
    floors: SALT_FLOORS, bossMax: BOSS_MAX, bossName: 'BARNACLE · THE FORKLIFT', place: (i, F) => 'Salt Building · Floor ' + (i + 1) + ' · ' + F.name.toLowerCase(),
    challenge: { name: 'BARNACLE', text: 'You wrecked my ride. No weapons now, fox. Just paws. Duel me!' },
    txt: { locked: 'LOCKED · BREAK THE CAMPS', roof: 'OPEN · THE ROOF' },
    init(ctx) { C = ctx; cover = coverAI(ctx, { flip: o.flip || ['felt'], pose: (g, t, s, e) => api.pose(g, t, s, e),
      role: e => e.type === 'lookout' ? 'lookout' : e.type === 'crawler' && (e.var === 'gloves' || e.var === 'cannon') ? (e.var === 'cannon' ? 'thrower' : 'brawler') : null,
      whistle: (e, A) => { e.state = 'tell'; e.t = 0; A.say3('WHISTLE!', e.x, e.y + 2.8, e.z, '#ffd23a'); },
      lines: o.lines || { taunt: ['COME OUT, FOX!', 'SALT RUNS THIS TOWN!', 'IS THAT ALL?', 'MISSED ME!'], spot: ['THERE HE IS!', 'A FOX! GET HIM!', 'INTRUDER!'] } }); },
    floorReady(A) { cover.floor(A); }, cover(e, d, fx, fz) { return cover.shield(e, d, fx, fz); }, crouch(A, dt) { return cover.playerCrouch(A, dt); }, aimCost(e) { return cover.aimCost(e); },
    stats(S) { S.crawler = { ...S.crawler, hp: 45, sight: 8 }; S.guard = { ...S.guard, hp: 55 }; S.gate = { ...S.gate, hp: 190 }; S.pickpocket = { hp: 30 }; S.lookout = { hp: 35 }; S.boss = { hp: BOSS_MAX }; },
    PK: { crate: { hp: 3, cr: 40, fx: 'chunk' }, barrel: { hp: 2, cr: 25, fx: 'water' }, cash: { hp: 2, cr: 150, fx: 'paper' }, felt: { hp: 3, cr: 120, fx: 'chunk' }, forklift: { hp: 6, cr: 300, fx: 'spark' }, safe: { hp: 6, cr: 250, fx: 'spark' } },
    HB: { crawler: [0.55, 0, 1.9], guard: [0.6, 0, 2.0], pickpocket: [0.5, 0, 1.8], lookout: [0.5, 0, 1.9], gate: [1.4, 0, 2.6], boss: [1.7, 0, 3.0] },
    mesh(type, v) { if (type === 'gate') return camp(); if (type === 'boss') return forklift(); if (type === 'crawler') return bandit(v || 'gloves'); if (type === 'guard') return bandit('sword'); if (type === 'pickpocket' || type === 'lookout') return bandit(type); return null; },
    spawned(e, S) { if (e.var === 'charge') e.st = { ...S.crawler, sight: 12, chase: 2.2, tell: 0.65, lunge: 15, lungeHit: 18, hp: 55 }; if (e.var === 'charge') e.hp = e.max = 55; e.m.userData.var = e.var; },
    campSpawn(n, e, a) { const v = n % 3 === 2 ? 'cannon' : n % 5 === 4 ? 'charge' : 'gloves'; return [['crawler', a, [e.x + rnd(-3, 3), e.z + rnd(-3, 3)]], { from: e, var: v }]; },
    dmgMul(e) { return e.type === 'boss' ? (e.state === 'stun' ? 1.5 : 0.55) : 1; },
    pose(g, type, s, e) { const u = g.userData, f = u.fox; if (!f) return; C.kit.animFox(f, s.dt || 0.016, Math.min(5, s.speed || 0), false); const A = f.userData.P.arms, B = f.userData.P.body, p = s.p || 0, mo = s.mode || 'idle', v = u.var || u.kind;
      f.userData.mood = mo === 'tell' || mo === 'atk' ? 'angry' : 'stern'; u.tell.visible = mo === 'tell';
      if (type === 'guard') { A[0].rotation.x = mo === 'rest' ? -0.2 : -1.25; A[0].rotation.z = mo === 'rest' ? 0 : 0.35; if (mo === 'tell') A[1].rotation.x = -2.7 * p; else if (mo === 'atk') { A[1].rotation.x = -2.7 + 2.6 * Math.min(1, p * 2); B.rotation.x = 0.25; } return; }
      if (v === 'cannon') { if (mo === 'tell') { A[1].rotation.x = 2.4 * Math.min(1, p * 1.4); A[1].rotation.z = -0.2; } else if (mo === 'atk') A[1].rotation.x = -2.0 + p * 1.6; return; }
      if (mo === 'tell') { for (const a of A) a.rotation.x = 0.9 * p; B.rotation.x = -0.15 * p; } else if (mo === 'atk') { A[0].rotation.x = -1.5; A[1].rotation.x = -1.5 + Math.sin(p * 9) * 0.4; B.rotation.x = v === 'charge' ? 0.45 : 0.25; } },
    // PICKPOCKET + LOOKOUT brains (true = handled)
    upd(e, dt, A, walkTo, see, dist) { if (e.type !== 'pickpocket' && !(e.type === 'lookout' && e.state === 'tell') && cover && (e.cv ? e.cv.role : (e.type === 'lookout' || (e.type === 'crawler' && (e.var === 'gloves' || e.var === 'cannon')))) && cover.upd(e, dt, A, walkTo, see, dist)) return true;
      if (e.type !== 'pickpocket' && e.type !== 'lookout') return false; const P = A.P, dx = P.x - e.x, dz = P.z - e.z, g = e.m, u = g.userData; let mode = 'idle', p = 0;
      if (e.type === 'pickpocket') {
        if (e.state === 'idle') { if (see && dist < 9 && P.ko <= 0) { walkTo(P.x, P.z, 3.5); if (dist < 0.95 && A.St.state === 'run') { const n = Math.min(A.save.data.gold || 0, 30 + 10 * A.FI()); if (n > 0) A.save.addGold(-n); e.stolen = n; u.sack.visible = true; A.say3(n ? '-' + n + ' G · STOLEN!' : 'NO GOLD?!', P.x, P.y + 2.4, P.z, '#ff6b5a'); A.St.banner = n ? 'PICKPOCKET! CATCH HIM · GET YOUR ' + n + ' G BACK' : 'PICKPOCKET! HE FOUND NO GOLD'; A.St.bannerT = 2.6; e.state = 'flee'; e.hide = null; e.t = 0; } } else { const tg = e.goB ? e.pb || e.pa : e.pa; if (walkTo(tg[0], tg[1], 1.4)) e.goB = !e.goB; } }
        else if (e.state === 'flee') { if (!e.hide || e.t > 6) { const pts = (A.F().loot || []).concat(A.F().powers || []).map(q => [q[0], q[1]]); pts.sort((a, b) => Math.hypot(b[0] - P.x, b[1] - P.z) - Math.hypot(a[0] - P.x, a[1] - P.z)); e.hide = pts[(Math.random() * Math.min(2, pts.length)) | 0] || [e.x, e.z]; e.t = 0; e.lx = e.x; e.lz = e.z; e.lt = 0; }
          if (walkTo(e.hide[0], e.hide[1], 5.2)) { e.state = 'hide'; e.t = 0; } e.lt += dt; if (e.lt > 1) { if (Math.hypot(e.x - e.lx, e.z - e.lz) < 0.4) e.hide = null; e.lx = e.x; e.lz = e.z; e.lt = 0; } }
        else if (e.state === 'hide') { e.yaw += angD(yawTo(dx, dz), e.yaw) * Math.min(1, dt * 6); e.hop = Math.abs(Math.sin(e.t * 6)) * 0.12; if (dist < 5) { e.state = 'flee'; e.hide = null; e.hop = 0; } }
        if (e.state !== 'hide') e.hop = 0; }
      else { // LOOKOUT: scans, sees you → WHISTLE (red !) → 2 brawlers come running (twice at most); backs off if you get close
        e.calls = e.calls || 0;
        if (e.state === 'idle') { if (see && dist < 13) { e.yaw += angD(yawTo(dx, dz), e.yaw) * Math.min(1, dt * 6); if (dist < 3) { const o = { x: e.x, z: e.z }; A.moveCircle(o, e.x - dx / dist * 2.4 * dt, e.z - dz / dist * 2.4 * dt, 0.5, e.y); e.x = o.x; e.z = o.z; } if (e.cd <= 0 && e.calls < 2) { e.state = 'tell'; e.t = 0; A.say3('WHISTLE!', e.x, e.y + 2.8, e.z, '#ffd23a'); } } else e.yaw += dt * 0.6; }
        else if (e.state === 'tell') { mode = 'tell'; p = e.t / 0.9; e.yaw += angD(yawTo(dx, dz), e.yaw) * Math.min(1, dt * 6); const a = u.fox.userData.P.arms[1]; if (e.t > 0.9) { e.calls++; e.cd = 9; e.state = 'idle';
            for (let i = 0; i < 2; i++) { for (let k = 0; k < 8; k++) { const an = Math.random() * 6.28, r = rnd(2.2, 4), x = e.x + Math.cos(an) * r, z = e.z + Math.sin(an) * r; if (!A.inSolid(x, z, 0.6) && Math.abs(x) < 22.5 && Math.abs(z) < 16.5) { const q = A.spawnFoe(['crawler', [x, z, e.by || 0], [x, z]], { var: 'gloves' }); q.cd = 1.2; A.glowPop(x, 1, z, 0xffd23a, 2); break; } } }
            A.St.banner = 'THE LOOKOUT CALLED HIS CREW'; A.St.bannerT = 2; } } }
      api.pose(g, 'crawler', { mode, p, speed: e.spd || 0, dt }, e); if (e.type === 'lookout' && e.state === 'tell') { const a = u.fox.userData.P.arms[1]; a.rotation.x = -2.4; a.rotation.z = 0.5; }
      return true; },
    onKill(e, A) { if (e.type === 'pickpocket' && e.stolen != null) { const n = e.stolen + 15; A.save.addGold(n); A.say3('+' + n + ' G · YOUR GOLD BACK!', e.x, e.y + 2.6, e.z, '#7cff9b'); A.St.banner = 'CAUGHT HIM · +' + n + ' G'; A.St.bannerT = 2.2; A.St.thieves = (A.St.thieves || 0) + 1; e.stolen = null; } },
    thieves(foes) { return foes.filter(e => e.alive && e.type === 'pickpocket' && e.stolen != null); },
    // ---- BOSS ----
    bossIntro(A) { fx(); const e = A.spawnFoe(['boss', [22.5, 0], [22.5, 0]]); e.hp = e.max = BOSS_MAX; e.state = 'intro'; e.t = 0; e.yaw = Math.PI; e.plan = 0; e.calls = 0; A.St.banner = 'BARNACLE · THE FORKLIFT'; A.St.bannerT = 2.6; A.St.shake = 0.4; if (bits.lift) bits.lift.userData.open = true; return e; },
    updBoss(e, dt, A) { fx(); const g = e.m, u = g.userData, P = A.P, St = A.St, dx = P.x - e.x, dz = P.z - e.z, dist = Math.hypot(dx, dz) || 1; e.t += dt; e.hit = Math.max(0, e.hit - dt);
      const face = k => { e.yaw += angD(yawTo(dx, dz), e.yaw) * Math.min(1, dt * k); }, f0 = [Math.cos(e.yaw), -Math.sin(e.yaw)];
      const drive = (sp, r = 1.5) => { const o = { x: e.x, z: e.z }; A.moveCircle(o, e.x + Math.cos(e.yaw) * sp * dt, e.z - Math.sin(e.yaw) * sp * dt, r, 0); const hit = Math.hypot(o.x - (e.x + Math.cos(e.yaw) * sp * dt), o.z - (e.z - Math.sin(e.yaw) * sp * dt)) > 0.02; e.x = Math.max(-20.5, Math.min(18, o.x)); e.z = Math.max(-15.5, Math.min(15.5, o.z)); return hit || Math.abs(e.x) >= 20.4 || e.x >= 17.9 || Math.abs(e.z) >= 15.4; };
      u.stars.visible = e.state === 'stun'; if (u.stars.visible) u.stars.rotation.y += dt * 5;
      if (e.state !== 'rushT' && e.state !== 'rush') lane.visible = false; if (e.state !== 'slamT') ring.visible = false;
      if (e.state === 'intro') { e.x = 22.5 - Math.min(1, e.t / 1.6) * 7; face(1); if (e.t > 1.8) { e.state = 'idle'; e.t = 0; e.cd = 1.2; } }
      else if (e.state === 'idle') { face(3.5); if (dist > 9) drive(3.2); else if (dist < 5) drive(-2.4); e.cd -= dt;
        if (e.cd <= 0) { const plan = ['rush', 'crates', 'slam', 'rush', 'crates', 'rush', 'slam']; let s = plan[e.plan++ % plan.length]; if (e.hp < BOSS_MAX * 0.55 && e.calls < 1) { s = 'call'; e.calls++; }
          e.t = 0; if (s === 'rush') { e.state = 'rushT'; A.say3('MOVE!', P.x, P.y + 2.6, P.z, '#ff6b5a'); } else if (s === 'slam') { e.state = 'slamT'; A.say3('JUMP!', P.x, P.y + 2.6, P.z, '#ffd23a'); } else if (s === 'crates') { e.state = 'crates'; e.n = 3; } else e.state = 'call'; } }
      else if (e.state === 'rushT' || e.state === 'rush') { const L = 20; lane.visible = true; lane.scale.set(2.8, L, 1); lane.position.set(e.x + f0[0] * L / 2, 0.06, e.z + f0[1] * L / 2); lane.rotation.z = Math.atan2(f0[0], f0[1]);
        if (e.state === 'rushT') { face(e.t < 0.5 ? 6 : 0.5); lane.material.opacity = 0.32 + 0.2 * Math.sin(e.t * 28); u.forks.position.y = 0.15 + Math.sin(e.t * 30) * 0.03; if (e.t > 1.0) { e.state = 'rush'; e.t = 0; e.sx = e.x; e.sz = e.z; } }
        else { lane.material.opacity = 0.35; const wall = drive(14, 1.4); if (dist < 2.2 && P.y < 1.3) A.hurt(20, e.x - f0[0], e.z - f0[1]); if (Math.random() < 0.6) A.burst(e.x - f0[0] * 1.4, 0.3, e.z - f0[1] * 1.4, 2, 0x9aa0a6, 2);
          if (wall || e.t > 1.5) { e.state = wall ? 'stun' : 'idle'; e.t = 0; e.cd = 1.4; lane.visible = false; if (wall) { St.shake = 0.6; A.burst(e.x + f0[0] * 2, 1.2, e.z + f0[1] * 2, 24, 0xffd23a, 7); St.banner = 'HE CRASHED · HIT HIM NOW!'; St.bannerT = 1.8; } } } }
      else if (e.state === 'stun') { if (e.t > 2.0) { e.state = 'idle'; e.t = 0; e.cd = 0.8; } }
      else if (e.state === 'slamT') { face(2); ring.visible = true; ring.position.set(e.x + f0[0] * 1.6, 0.07, e.z + f0[1] * 1.6); ring.material.opacity = 0.5 + 0.35 * Math.sin(e.t * 22); u.forks.position.y = 0.15 + Math.min(1, e.t / 0.85) * 1.6;
        if (e.t > 0.95) { u.forks.position.y = 0.15; St.shake = 0.7; const rx = e.x + f0[0] * 1.6, rz = e.z + f0[1] * 1.6; A.burst(rx, 0.3, rz, 30, 0xd9cbb5, 9); A.glowPop(rx, 0.6, rz, 0xffd23a, 6); if (Math.hypot(P.x - rx, P.z - rz) < 5 && P.y < 0.55) A.hurt(16, rx, rz); e.state = 'idle'; e.t = 0; e.cd = 1.3; } }
      else if (e.state === 'crates') { face(5); u.forks.position.y = 0.15 + 0.5 * Math.abs(Math.sin(e.t * 6)); if (e.t > 0.55) { e.t = 0; lobCrate(e, A); e.n--; if (e.n <= 0) { e.state = 'idle'; e.cd = 1.3; } } }
      else if (e.state === 'call') { if (e.t > 0.7) { for (let i = 0; i < 3; i++) { const q = A.spawnFoe(['crawler', [18.6, -2 + i * 2], [12, -3 + i * 3]], { var: i === 1 ? 'cannon' : 'gloves' }); q.cd = 1; A.glowPop(18.6, 1, -2 + i * 2, 0xffd23a, 2); } St.banner = 'BARNACLE CALLS HIS CREW'; St.bannerT = 2; if (bits.lift) bits.lift.userData.open = true; e.state = 'idle'; e.cd = 2; } }
      else if (e.state === 'talk') { // knocked out of the forklift: smoke, he climbs out and stands up big next to it, facing you
        if (!e.out) { e.out = 0; for (const c of crates) { c.on = false; c.m.visible = c.sh.visible = false; } } e.out = Math.min(1, e.out + dt / 1.1); const d = u.driver, k = e.out;
        d.position.set(-0.25 + k * 3.9, 0.75 + Math.sin(k * Math.PI) * 1.8 - k * 0.75, 0); d.scale.setScalar(1.3 + 0.1 * k); g.rotation.z = 0.1 * k; d.rotation.y = Math.PI / 2 + angD(yawTo(dx, dz), e.yaw) * k; if (k >= 1 && !e.landed) { e.landed = true; St.shake = 0.5; A.burst(e.x + Math.cos(e.yaw) * 3.6, 0.3, e.z - Math.sin(e.yaw) * 3.6, 22, 0xd9cbb5, 7); }
        u.smoke.forEach((s, i) => { const q = (St.t * 0.6 + i / 4) % 1; s.position.set(-1.1 + q * 0.3, 2 + q * 2.4, 0); s.scale.setScalar(0.6 + q * 1.6); s.material.opacity = 0.5 * (1 - q); }); }
      if (u.driver && e.state !== 'talk') { C.kit.animFox(u.driver, dt, 0, false); const DP = u.driver.userData.P; for (const l of DP.legs) l.rotation.x = -1.45; DP.arms[0].rotation.x = DP.arms[1].rotation.x = -1.1; u.driver.userData.mood = e.state === 'stun' ? 'surprised' : 'angry'; }
      else if (u.driver) { C.kit.animFox(u.driver, dt, 0, false); u.driver.userData.mood = 'stern'; }
      u.lamp.material.opacity = 0.5 + 0.5 * Math.sin(St.t * 10); g.position.set(e.x, 0, e.z); g.rotation.y = e.yaw; g.scale.setScalar(e.hit > 0 ? 1.04 : 1); A.flash(e, e.hit > 0); stepCrates(dt, A); },
    tick(dt, t) { if (cover) cover.tick(dt); for (const f of bits.fires) { const k = 0.8 + 0.25 * Math.sin(t * 17 + f.id) + 0.15 * Math.sin(t * 29); f.scale.setScalar(1.1 * k); if (f.userData.cone) f.userData.cone.scale.set(1, k, 1); }
      if (bits.rotor) bits.rotor.rotation.y += dt * 0.4; if (bits.lift) { const L = bits.lift, o = L.userData.open; L.userData.k = Math.max(0, Math.min(1, (L.userData.k || 0) + (o ? dt : -dt) * 1.2)); L.position.y = L.userData.y0 + L.userData.k * 2.8; if (o) { L.userData.ot = (L.userData.ot || 0) + dt; if (L.userData.ot > 4) { L.userData.open = false; L.userData.ot = 0; } } } },
    say(s) { return String(s).replace(/GATES/g, 'CAMPS').replace(/GATE/g, 'CAMP').replace(/ CR\b/g, ' G'); },
    quest({ F, St, boss, gates, thief }) { if (thief) return 'A pickpocket has ' + thief + ' G of yours · catch him (THIEF marker)'; if (F.boss) return St.duelCall ? 'Barnacle wants a duel · no weapons, just paws' : boss ? 'Knock Barnacle out of the forklift · step out of the red lane · jump the fork slam' : 'Bandits on the roof · beat them all';
      return gates ? 'Follow the rug · red rugs lead to bandit camps (' + gates + ' left)' : 'All camps broken · follow the rug to the stairs'; },
    tips(tut, i, F) { return tut ? ['THE SALT BUILDING · BANDITS TOOK IT', 'FOLLOW THE RUG · RED RUGS LEAD TO BANDIT CAMPS', 'BREAK EVERY CAMP TO OPEN THE STAIRS', 'SHIELD BANDITS BLOCK THE FRONT · HIT AFTER A BASH', 'CATCH THE PICKPOCKET · GET YOUR GOLD BACK', 'HIT THE LOOKOUT BEFORE HE WHISTLES', 'BANDITS DUCK BEHIND CRATES · SHOOT THE CRATE TO BREAK THEIR COVER', 'STAND STILL BY A LOW CRATE TO DUCK · SHOOT TO POP UP']
      : ['FLOOR ' + (i + 1) + ' · ' + F.name, F.tip || 'BREAK THE CAMPS · THEN TAKE THE STAIRS']; },
    onWin(w, A) { const S = A.save, first = !S.flag('saltBuildingCleared'); let gold = 40, xp = 30; if (!w.roof) return;
      if (first) { gold = 200; xp = 150; S.setFlag('saltBuildingCleared'); S.setFlag('saltFavour'); S.addRelic('saltCellar'); const SUIT = { outfit: 'suit', torso: ['#2e4a6b', '#1e3150', '#f3f2f2'], name: 'SALT FAMILY SUIT' }; const have = S.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) S.setStat('tailorOutfits', [...list, SUIT]); }
      S.addGold(gold); S.addXp(xp); S.setStat('saltClears', S.stat('saltClears', 0) + 1); const best = S.stat('saltBest', 0); if (!best || w.time < best) S.setStat('saltBest', w.time); w.salt = { first, gold, xp, thieves: A.St.thieves || 0, best: S.stat('saltBest', 0) }; },
    // ---------- ART (after the engine's walls, before b.build) ----------
    art(F, G, b, pb, addSolid, solid) { const { THREE, signTex } = C, R = (() => { let s = 7 + F.name.length; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
      const sign = (txt, x, y, z, ry, w = 3.2) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: signTex(txt) })); s.position.set(x, y, z); s.rotation.y = ry; G.add(s); };
      const lamp = (x, z, y = 2.95, col = '#ffd9a0') => { b.box('mat', '#201e1d', 0.02, 3.2 - y, 0.02, x, y + (3.2 - y) / 2, z); b.cyl('mat', '#201e1d', 0.28, 0.18, x, y, z, 12, 0, 0, 0.4); b.sph('glo', col, 0.14, x, y - 0.12, z, 1, 10); };
      bits.fires = bits.fires.filter(f => f.parent && f.parent.parent); bits.rotor = null; bits.lift = null;
      F.walls.forEach((w, wi) => { const [x0, x1, z0, z1, h, k] = w, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sx = x1 - x0, sz = z1 - z0, s = solid[wi];
        if (k === 'crate') { pb.prop('crate', x0, x1, z0, z1, 0, h, s); const long = sx >= sz, L = long ? sx : sz, n = Math.max(1, Math.round(L / 1.3)), cw = L / n, lv = Math.max(1, Math.round(h / 1.3)), ch = h / lv;
          for (let i = 0; i < n; i++) for (let j = 0; j < lv; j++) { if (j === lv - 1 && lv > 1 && R() < 0.2) continue; const c = ['#a77b4f', '#8b6a48', '#b98a5a', '#7a5f40'][(i * 3 + j) % 4], u = -L / 2 + cw * (i + 0.5), d = (long ? sz : sx) - 0.06, px = long ? cx + u : cx, pz = long ? cz : cz + u, y = ch * (j + 0.5);
            pb.box('mat', c, long ? cw - 0.05 : d, ch - 0.04, long ? d : cw - 0.05, px, y, pz, (R() - 0.5) * 0.06); pb.box('mat', '#5c4430', long ? cw - 0.03 : d + 0.02, 0.07, long ? d + 0.02 : cw - 0.03, px, y + ch * 0.32, pz); pb.box('mat', '#5c4430', long ? cw - 0.03 : d + 0.02, 0.07, long ? d + 0.02 : cw - 0.03, px, y - ch * 0.32, pz); if (R() < 0.3) pb.box('mat', '#201e1d', 0.3, 0.3, 0.3, px + (long ? 0 : d / 2), y, pz + (long ? d / 2 : 0)); } }
        else if (k === 'fork') { pb.prop('forklift', x0, x1, z0, z1, 0, h, s); pb.box('mat', '#ffd23a', sx, 1.0, sz * 0.9, cx, 0.8, cz); pb.box('mat', '#2a2d33', 0.15, 2.4, sz * 0.7, x0 - 0.05, 1.2, cz); pb.box('gls', '#9aa0a6', 1.1, 0.06, 0.14, x0 - 0.6, 0.1, cz - 0.3); pb.box('gls', '#9aa0a6', 1.1, 0.06, 0.14, x0 - 0.6, 0.1, cz + 0.3); pb.box('mat', '#2a2d33', sx, 0.08, sz * 0.9, cx, h, cz); for (const [ax, az] of [[x0 + 0.4, z0], [x0 + 0.4, z1], [x1 - 0.4, z0], [x1 - 0.4, z1]]) pb.cyl('mat', '#141312', 0.3, 0.25, ax, 0.3, az, 12, Math.PI / 2); }
        else if (k === 'table') { pb.prop('cash', x0, x1, z0, z1, 0, h + 0.2, s); pb.box('gls', '#5c4430', sx, 0.07, sz, cx, h, cz); for (const [ax, az] of [[x0 + 0.15, z0 + 0.15], [x1 - 0.15, z0 + 0.15], [x0 + 0.15, z1 - 0.15], [x1 - 0.15, z1 - 0.15]]) pb.box('mat', '#3d2b1d', 0.08, h, 0.08, ax, h / 2, az);
          for (let i = 0; i < 5; i++) { const px = x0 + 0.4 + R() * (sx - 0.8), pz = z0 + 0.3 + R() * (sz - 0.6), hh = 0.05 + R() * 0.16; pb.box('mat', R() < 0.7 ? '#4f8a5c' : '#cfe6c8', 0.34, hh, 0.16, px, h + 0.035 + hh / 2, pz, R() * 0.4); } for (let i = 0; i < 3; i++) pb.cyl('gls', '#e6b45a', 0.07, 0.05 + R() * 0.15, x0 + 0.3 + R() * (sx - 0.6), h + 0.1, z0 + 0.3 + R() * (sz - 0.6), 10);
          pb.box('mat', '#2a2d33', 0.36, 0.22, 0.3, cx, h + 0.15, cz); pb.box('glo', '#7cff9b', 0.2, 0.05, 0.01, cx, h + 0.2, cz - 0.151); pb.cyl('mat', '#2f6b45', 0.12, 0.05, x1 - 0.3, h + 0.4, cz, 10, 0, 0, 0.5); pb.box('mat', '#c9a24a', 0.02, 0.38, 0.02, x1 - 0.3, h + 0.2, cz); pb.sph('glo', '#fff1c8', 0.05, x1 - 0.3, h + 0.34, cz); }
        else if (k === 'felt') { pb.prop('felt', x0, x1, z0, z1, 0, h + 0.1, s); pb.cyl('gls', '#5c3a24', 0.9, 0.09, cx, h, cz, 24); pb.cyl('mat', '#2f6b45', 0.82, 0.1, cx, h + 0.01, cz, 24); pb.cyl('mat', '#3d2b1d', 0.16, h, cx, h / 2, cz, 10); pb.cyl('mat', '#3d2b1d', 0.5, 0.06, cx, 0.03, cz, 14);
          for (let i = 0; i < 5; i++) { const a = i * 1.26 + R(), r = 0.5; pb.cyl('gls', ['#ec3013', '#f3f2f2', '#2e4a6b', '#ffd23a'][i % 4], 0.06, 0.04 + R() * 0.12, cx + Math.cos(a) * r, h + 0.1, cz + Math.sin(a) * r, 10); } for (let i = 0; i < 4; i++) pb.box('mat', '#f3f2f2', 0.12, 0.012, 0.17, cx + (R() - 0.5) * 0.6, h + 0.07, cz + (R() - 0.5) * 0.6, R() * 3);
          for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4, ax = cx + Math.cos(a) * 1.3, az = cz + Math.sin(a) * 1.3; b.box('mat', '#6b1f2a', 0.45, 0.07, 0.45, ax, 0.48, az, a); b.box('mat', '#3d2b1d', 0.06, 0.48, 0.06, ax, 0.24, az); b.box('mat', '#6b1f2a', 0.45, 0.55, 0.07, ax + Math.cos(a) * 0.22, 0.78, az + Math.sin(a) * 0.22, -a + Math.PI / 2); }
          b.tor('gls', '#e6b45a', 0.55, 0.04, cx, 2.75, cz, Math.PI / 2); for (let i = 0; i < 6; i++) { const a = i * 1.047; b.sph('glo', '#fff1c8', 0.08, cx + Math.cos(a) * 0.55, 2.8, cz + Math.sin(a) * 0.55); } b.sph('gls', '#e6b45a', 0.16, cx, 2.62, cz, 1.4, 10); b.box('mat', '#201e1d', 0.02, 0.5, 0.02, cx, 2.95, cz); }
        else if (k === 'edge') { for (let z = z0 + 0.6; z < z1; z += 2.2) { b.cyl('mat', '#ffd23a', 0.16, 1.0, cx, 0.5, z, 10); b.cyl('mat', '#201e1d', 0.18, 0.12, cx, 1.0, z, 10); } b.box('mat', '#201e1d', 0.05, 0.05, sz, cx, 0.85, cz); for (let z = z0; z < z1; z += 0.5) b.box('mat', z % 1 < 0.5 ? '#ffd23a' : '#201e1d', 0.5, 0.012, 0.5, cx - 0.6, 0.008, z + 0.25); }
        else if (k === 'ledge') { b.box('mat', '#e9e6e0', sx, h, sz, cx, h / 2, cz); b.box('mat', '#2e4a6b', sx + 0.04, 0.08, sz + 0.04, cx, h, cz); }
        else if (k === 'copter') { const y = 0.35; b.sph('gls', '#2e4a6b', 1.6, cx + 1.4, 1.35 + y, cz, 0.62, 18); b.sph('glass', '#9fd3f5', 1.0, cx + 2.4, 1.55 + y, cz, 0.6, 14); b.box('gls', '#2e4a6b', 3.6, 0.36, 0.36, cx - 1.6, 1.6 + y, cz); b.box('gls', '#f3f2f2', 0.6, 1.0, 0.08, cx - 3.3, 2.0 + y, cz); b.box('gls', '#f3f2f2', 2.2, 0.12, 1.66, cx + 1.3, 1.25 + y, cz);
          for (const s of [-1, 1]) { b.box('mat', '#201e1d', 3.4, 0.08, 0.1, cx + 1.4, 0.04, cz + s * 0.9); b.box('mat', '#201e1d', 0.08, 0.5, 0.08, cx + 0.6, 0.3, cz + s * 0.85); b.box('mat', '#201e1d', 0.08, 0.5, 0.08, cx + 2.2, 0.3, cz + s * 0.85); } b.cyl('mat', '#201e1d', 0.12, 0.5, cx + 1.4, 2.5 + y, cz, 8);
          const rot = new THREE.Group(); rot.position.set(cx + 1.4, 2.78 + y, cz); G.add(rot); for (let i = 0; i < 2; i++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.04, 0.26), C.toon('#201e1d')); bl.rotation.y = i * Math.PI / 2; rot.add(bl); } bits.rotor = rot; sign('SALT', cx + 1.0, 1.4 + y, cz + 1.0, 0, 1.6); }
        else if (k === 'tank') { b.cyl('gls', '#9aa0a6', Math.min(sx, sz) / 2 - 0.1, h - 0.7, cx, 0.7 + (h - 0.7) / 2, cz, 18); b.cyl('mat', '#6b737b', Math.min(sx, sz) / 2, 0.1, cx, h, cz, 18, 0, 0, 0.7); for (const [ax, az] of [[x0 + 0.4, z0 + 0.4], [x1 - 0.4, z0 + 0.4], [x0 + 0.4, z1 - 0.4], [x1 - 0.4, z1 - 0.4]]) b.box('mat', '#3d4148', 0.14, 0.7, 0.14, ax, 0.35, az); } });
      if (F.art === 'warehouse') { for (const z of [12, 1, -11]) { b.box('mat', '#e8b84a', 46, 0.012, 0.12, 0, 0.01, z - 2.4); b.box('mat', '#e8b84a', 46, 0.012, 0.12, 0, 0.01, z + 2.4); }
        for (const x of [-9.5, -0.8, 7.7, 16.7]) lamp(x, 6.5, 2.75); for (const x of [-17.5, -8.8, 0.2, 9.2]) lamp(x, -5.1, 2.75); for (const x of [-16, -4, 8, 20]) { lamp(x, 17.3, 2.7); lamp(x, -17.3, 2.7); }
        for (const [x, z] of [[-22.6, 16.4], [-21.4, 16.8], [22.6, -16.6], [-22.8, -16.6], [15, 16.6], [16.2, 16.8]]) pb.prop('barrel', x - 0.42, x + 0.42, z - 0.42, z + 0.42, 0, 1.05, addSolid(x - 0.42, x + 0.42, z - 0.42, z + 0.42, 1.05)), pb.cyl('gls', R() < 0.5 ? '#2e4a6b' : '#ec3013', 0.4, 1.0, x, 0.5, z, 14), pb.cyl('mat', '#201e1d', 0.41, 0.05, x, 0.3, z, 14), pb.cyl('mat', '#201e1d', 0.41, 0.05, x, 0.75, z, 14);
        for (let i = 0; i < 9; i++) b.sph('mat', '#f3f2f2', 0.3, 13 + (i % 3) * 0.5, 0.25 + Math.floor(i / 3) * 0.3, 16.6 - (i % 2) * 0.4, 0.7, 8);
        b.box('mat', '#5fa7cf', 30, 0.05, 40, 40, -0.6, 0); b.box('mat', '#8b6a48', 3, 0.3, 12, 26.5, -0.15, 1);   // the lake + a jetty outside the dock door
        { const x = 30, z = 1; b.box('gls', '#201e1d', 2.4, 0.9, 6.4, x, -0.1, z); b.box('gls', '#f3f2f2', 2.5, 0.12, 6.5, x, 0.38, z); b.box('gls', '#2e4a6b', 1.6, 1.2, 1.8, x, 0.9, z - 1); b.box('glass', '#9fd3f5', 1.62, 0.5, 1.82, x, 1.25, z - 1); b.box('mat', '#8b6a48', 1.6, 0.5, 2.2, x, 0.65, z + 1.6); }
        b.box('mat', '#201e1d', 0.3, 0.3, 10.2, 24.15, 3.05, 1); sign('SALT & SONS · IMPORT', -2, 2.5, -17.79, 0, 4); sign('DOCK', 23.79, 2.6, 8.5, -Math.PI / 2, 1.6); }
      if (F.art === 'counting') { for (const x of [-8, 2, 15]) lamp(x, -7, 2.75, '#fff1c8'); for (const x of [-16, 7]) lamp(x, 5, 2.75, '#fff1c8'); for (const x of [-6, 4, 14]) { lamp(x, 17.3, 2.7, '#fff1c8'); lamp(x, -17.3, 2.7, '#fff1c8'); }
        { const vx = -19, vz = 13.2; b.cyl('gls', '#9aa0a6', 1.5, 0.35, vx - 3.2, 1.6, vz + 1.2, 28, Math.PI / 2, 0, 1, 0.9); b.tor('gls', '#e6b45a', 0.7, 0.07, vx - 3.25, 1.6, vz + 1.0, Math.PI / 2, 0.9); for (let i = 0; i < 4; i++) b.box('gls', '#e6b45a', 1.3, 0.08, 0.08, vx - 3.25, 1.6, vz + 1.0, 0.9, 0, i * 0.785);
          b.box('mat', '#3d4148', 3.2, 0.3, 0.5, vx, 3.0, vz); for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) b.box('gls', '#e6b45a', 0.6, 0.18, 0.28, -22.6 + i * 0.6, 0.1 + j * 0.2, 17.4, 0); for (let i = 0; i < 4; i++) b.box('gls', '#e6b45a', 0.28, 0.18, 0.6, -14.6, 0.1 + i * 0.2, 15.5);
          addSolid(-23.6, -20.4, 17, 17.8, 0.5); sign('VAULT', vx, 3.0, vz - 0.26, Math.PI, 1.6); }
        for (const [x, z] of [[-23.4, -16], [23.4, -16], [23.4, 16]]) { pb.prop('safe', x - 0.5, x + 0.5, z - 0.5, z + 0.5, 0, 1.3, addSolid(x - 0.5, x + 0.5, z - 0.5, z + 0.5, 1.3)); pb.box('gls', '#3d4148', 1, 1.3, 1, x, 0.65, z); pb.cyl('gls', '#e6b45a', 0.16, 0.05, x - Math.sign(x) * 0.51, 0.8, z, 12, 0, Math.PI / 2); }
        sign('COUNTING ROOM', 2, 2.5, -17.79, 0, 4); sign('CASHIERS', 3, 2.4, -6.36, Math.PI, 2.4); }
      if (F.art === 'cardroom') { for (let x = -22; x <= 22; x += 2) b.box('mat', '#4a1620', 0.05, 0.012, 36, x, 0.008, 0); b.box('mat', '#e6b45a', 48, 0.3, 0.06, 0, 2.95, -17.95); b.box('mat', '#e6b45a', 48, 0.3, 0.06, 0, 2.95, 17.95);
        for (let i = 0; i < 6; i++) b.cyl('gls', ['#c9a24a', '#2e4a6b', '#ec3013'][i % 3], 0.07, 0.3, -23 + i * 0.5, 1.15, 17.1, 8); sign('THE SALT CARD ROOM', -18, 2.5, 17.79, Math.PI, 4); sign('BACK OFFICE', 18.5, 2.5, 17.79, Math.PI, 3.2);
        b.box('mat', '#8b2a2a', 7, 0.015, 9, 19, 0.01, -3); b.box('mat', '#e6b45a', 7.2, 0.012, 9.2, 19, 0.008, -3); b.sph('gls', '#2e86b8', 0.4, 22.8, 1.4, 15.6, 1, 14); b.box('mat', '#3d2b1d', 0.06, 1.0, 0.06, 22.8, 0.5, 15.6); b.cyl('mat', '#3d2b1d', 0.35, 0.05, 22.8, 0.03, 15.6, 12);
        { const t = C.CT(256, 320, (g, w, h) => { g.fillStyle = '#2e4a6b'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9cbb5'; g.beginPath(); g.ellipse(128, 150, 70, 80, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(70, 100); g.lineTo(84, 30); g.lineTo(110, 86); g.fill(); g.beginPath(); g.moveTo(186, 100); g.lineTo(172, 30); g.lineTo(146, 86); g.fill(); g.fillStyle = '#201e1d'; g.fillRect(96, 140, 18, 10); g.fillRect(142, 140, 18, 10); g.fillRect(100, 236, 56, 90); g.fillStyle = '#f3f2f2'; g.font = '900 30px Archivo, sans-serif'; g.fillText('OLD SALT', 56, 300); });
          const pm = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.75), new THREE.MeshLambertMaterial({ map: t })); pm.position.set(23.6, 1.9, -9); pm.rotation.y = -Math.PI / 2; G.add(pm); b.box('gls', '#e6b45a', 0.05, 1.9, 1.55, 23.65, 1.9, -9); }
        for (const [x, z] of [[-23, -17], [-14.4, 17], [23, 17]]) { b.cyl('mat', '#3d3b3a', 0.35, 0.6, x, 0.3, z, 12); for (let i = 0; i < 6; i++) b.sph('mat', i % 2 ? '#3d6b4a' : '#4f8a5c', 0.34, x + Math.cos(i) * 0.2, 0.95 + (i % 3) * 0.25, z + Math.sin(i) * 0.2, 1.3, 6); } }
      if (F.art === 'helipad') { b.cyl('mat', '#2a2d33', 5.2, 0.04, 4, 0.02, 0, 32); b.tor('mat', '#ffd23a', 4.6, 0.03, 4, 0.05, 0, Math.PI / 2); b.box('mat', '#f3f2f2', 0.6, 0.02, 3.4, 2.7, 0.06, 0); b.box('mat', '#f3f2f2', 0.6, 0.02, 3.4, 5.3, 0.06, 0); b.box('mat', '#f3f2f2', 2.0, 0.02, 0.6, 4, 0.06, 0);
        for (let z = -2.6; z < 2.6; z += 0.6) b.box('mat', Math.round(z / 0.6) % 2 ? '#ffd23a' : '#201e1d', 0.1, 3.2, 0.6, 19.54, 1.6, z + 0.3);
        { const d = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.0, 5.4), C.toon('#5c6670')); d.position.set(19.5, 1.5, 0); G.add(d); d.userData.y0 = 1.5; bits.lift = d; } sign('FREIGHT LIFT', 19.48, 3.3, 0, -Math.PI / 2, 2.8);
        b.box('mat', '#201e1d', 0.08, 2.6, 2.0, -19.46, 1.3, 0.5); b.box('glo', '#39e070', 0.06, 0.12, 2.3, -19.44, 2.66, 0.5);
        b.cyl('gls', '#f3f2f2', 0.08, 7, -21, 3.5, -15, 8); { const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshBasicMaterial({ map: signTex('SALT'), side: THREE.DoubleSide })); fl.position.set(-20.2, 6.4, -15); G.add(fl); }
        b.cyl('mat', '#5c6670', 0.12, 5, 21, 2.5, 15, 8); b.sph('glo', '#ff3b2a', 0.25, 21, 5.1, 15); sign('SALT BUILDING · ROOF', -21.6, 2.0, 3.51, 0, 3.4); } },
  };
  return api;
}
