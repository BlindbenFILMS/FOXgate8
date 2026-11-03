// PEPPER BUILDING [meruPepperBuilding] · BATTLE (Ben s132): the Deco Pepper family building, taken over by bandits. Built on saltMode()
// (worlds/salt-building.js: bandits, camps, brains, cover AI) running on the Pearl Sail 3D floor engine (worlds/pearl-floor3d.js, mode 'pepper').
// Ben's picks: 1 RENT OFFICE (what visitors see) → 2 THIEF TRAINING GYM (laser grid + training dummies) → 3 STOLEN GOODS STOREROOM (loot sacks
// with a shop's name: hand each in at that Meru shop) → ROOF WATER TANKS: boss JALAPEÑO JACK (master thief: swaps places with decoys, only the
// real one casts a shadow · grapple hook between the tanks · card throws) → the DUEL (Kyoto engine, ?pepper=1).
// New bandits: ROPE THIEF (drops from the ceiling, grabs gold, climbs back up) · TRAINING DUMMY (asleep on the mats until you walk past).
// Lasers: touch = small hurt + ALARM (2 bandits) · JUMP the low beams · wait for the blinking ones · break the red laser box to switch one off.
import { PLAYER_MALE } from '../fox-kit.js';
import { saltMode } from './salt-building.js';

export const JACK = { key: 'jack', name: 'JALAPEÑO JACK', torso: ['#3f6d2e', '#2a4a1f', '#141312'], crest: '', outfit: 'coat', gear: 'none', eyes: ['#ffd23a', '#ffd23a'], mood: 'stern',
  look: { ...PLAYER_MALE, fur: '#b8401f', furDark: '#6b2210', tailBase: '#6b2210', tailMid: '#b8401f', tailTip: '#3f6d2e' } };
// the stolen goods sacks (floor 3): shop = the Meru 2 building key the sack goes back to (worlds/meru2-walk.js hands them in)
export const PEPPER_SACKS = [
  { shop: 'tavern', label: 'TAVERN', what: 'the tavern bell' }, { shop: 'itemshop', label: 'ITEM SHOP', what: 'a crate of potions' },
  { shop: 'armory', label: 'ARMORY', what: 'a polished shield' }, { shop: 'bank', label: 'BANK', what: 'a bag of coins' },
  { shop: 'burgers', label: 'BURGERS', what: 'the secret sauce' }, { shop: 'fortune', label: 'FORTUNE TELLER', what: 'the crystal ball' }];
const WH = 3.2;
const WALLS4 = () => [[-24.3, -24, -18, 18, WH, 'wall'], [-24, 24, -18.3, -18, WH, 'wall'], [-24, 24, 18, 18.3, WH, 'wall'], [24, 24.3, -18, 18, WH, 'wall'], [-27, -24.3, -21, 21, 8, 'void'], [24.3, 27, -21, 21, 8, 'void'], [-27, 27, -21, -18.3, 8, 'void'], [-27, 27, 18.3, 21, 8, 'void']];

export const PEPPER_FLOORS = [
  // 1 · RENT OFFICE: the front door (east), the RENT counter, filing cabinet rows, desks, safes
  (() => { const W = WALLS4().concat([
      [-13, -6, 5.8, 7.2, 2.0, 'files'], [-4.6, 3, 5.8, 7.2, 1.05, 'counter'], [4.4, 11, 5.8, 7.2, 2.0, 'files'], [12.4, 21, 5.8, 7.2, 2.0, 'files'],
      [-21, -14, -5.8, -4.4, 2.0, 'files'], [-12.6, -5, -5.8, -4.4, 1.05, 'counter'], [-3.6, 4, -5.8, -4.4, 2.0, 'files'], [5.4, 13, -5.8, -4.4, 2.0, 'files'],
      [-8.4, -6.4, 14.6, 15.6, 0.8, 'desk'], [7.6, 9.6, 15, 16, 0.8, 'desk'], [-2.4, -0.4, -15.6, -14.6, 0.8, 'desk'], [9.6, 11.6, -16, -15, 0.8, 'desk'], [19.4, 21.4, -15, -14, 0.8, 'desk'],
      [22, 23.2, -9, -7.8, 1.3, 'safe'], [-23.4, -22.4, 15.4, 16.4, 1.3, 'safe'], [22.6, 23.6, 15.4, 16.4, 1.3, 'safe'], [21.6, 23.4, 8.6, 9.3, 0.5, 'bench']]);
    return { name: 'RENT OFFICE', art: 'rent', wallCol: 0xd9cfb8, floorCol: '#3f4f3a', tip: 'THE RENT OFFICE · BREAK THE CAMPS', walls: W,
      route: [[19, 12], [-17, 12], [-17, 1], [17, 1], [17, -11], [-22.4, -11]], exit: [-23.8, -11],
      foes: [['crawler', [12, 12], [4, 12], 'gloves'], ['crawler', [-6, 12], [-12, 12], 'gloves'], ['crawler', [2, 15], [-4, 15], 'cannon'], ['guard', [-17, 8], [-17, 4], 'sword'], ['lookout', [-20.5, 9.5]],
        ['crawler', [-10, 1], [0, 1], 'gloves'], ['crawler', [6, 1], [12, 1], 'charge'], ['crawler', [6, 3], [6, 3], 'rope'], ['crawler', [14.5, -2], [14.5, -2], 'cannon'], ['crawler', [20, -9.5], [20, -2], 'gloves'],
        ['guard', [8, -11], [0, -11], 'sword'], ['pickpocket', [-8, -11], [-14, -11]], ['crawler', [-6, -15], [-12, -15], 'cannon'], ['crawler', [-20, -14], [-20, -8], 'charge']],
      gates: [[0, 16.2, [[0, 12]]], [-21.5, 6.5, [[-17, 6.5]]], [21.2, -3, [[17, -3]]]],
      loot: [[22, 16.4, 'chip'], [-22, 13.6, 'pearl'], [22, -16, 'chip'], [-10, -16, 'pearl']], powers: [[-22.5, -1.5, 'speed'], [-3, 16.5, 'shield'], [22, 4, 'triple'], [3, -16.5, 'power']],
      hazards: [[-4, 12, 'spill', 2.6, 2.2, 0], [9, 1, 'spill', 2.4, 2, 0], [-17, -2, 'shock', 1.8, 1.8, 0.5], [4, -11, 'shock', 1.8, 1.8, 1.2]] }; })(),
  // 2 · THIEF TRAINING GYM: mirror walls, weight benches, mats with training dummies, the LASER GRID across every lane, a locker room (north-west)
  (() => { const W = WALLS4().concat([
      [-13, -3, -7.6, -6.4, 1.05, 'counter'], [-13, -3, -7.06, -6.94, WH, 'gwall'], [-1.6, 8.4, -7.6, -6.4, 1.05, 'counter'], [-1.6, 8.4, -7.06, -6.94, WH, 'gwall'], [9.8, 21, -7.6, -6.4, WH, 'wall'],
      [-21, -12, 4.4, 5.6, WH, 'wall'], [-10.6, -1, 4.94, 5.06, WH, 'gwall'], [0.4, 14, 4.4, 5.6, WH, 'wall'],
      [-14, -13.6, 13, 18, WH, 'wall'], [-24, -20.6, 13, 13.4, WH, 'wall'], [-17.4, -14, 13, 13.4, WH, 'wall'], [-23.6, -14.4, 17.2, 17.9, 2.2, 'locker'],
      [-12, -9, -16.8, -15.2, 0.6, 'bench'], [4, 7, -16.8, -15.2, 0.6, 'bench'], [-8, -5, 15, 16.6, 0.6, 'bench'], [8, 12, 14.5, 16.5, 0.6, 'bench'], [-15, -13, 1.6, 3.2, 0.6, 'bench']]);
    return { name: 'THIEF TRAINING GYM', art: 'gym', wallCol: 0x4a4f57, floorCol: '#7a2a22', tip: 'THE GYM · JUMP THE LOW LASERS · WAIT FOR THE BLINKING ONES', walls: W,
      route: [[18, -13], [-17, -13], [-17, -1], [17, -1], [17, 11], [-22.4, 11]], exit: [-23.8, 11],
      // lasers: [x, z0, z1, h, 'low' | 'timed', phase] · the red LASER BOX sits at z0
      lasers: [[9, -17.6, -7.7, 0.4, 'low', 0], [-6, -17.6, -7.7, 0.95, 'timed', 0], [8, -6.3, 4.3, 0.4, 'low', 0], [-9, -6.3, 4.3, 0.95, 'timed', 1.1], [3, 17.6, 5.7, 0.95, 'timed', 2.0], [-11, 17.6, 5.7, 0.4, 'low', 0]],
      foes: [['crawler', [14, -13], [12, -13], 'gloves'], ['guard', [-10, -13], [-14, -13], 'sword'], ['crawler', [-14, -16], [-20, -16], 'cannon'], ['lookout', [-21, -3]], ['crawler', [-17, -9.5], [-17, -4], 'charge'],
        ['crawler', [12, -16.2], [12, -16.2], 'dummy'], ['crawler', [-4, 2], [-4, 2], 'dummy'], ['crawler', [3, -3.5], [3, -3.5], 'dummy'], ['crawler', [13, 2], [13, 2], 'dummy'], ['crawler', [-7, 8], [-7, 8], 'dummy'], ['crawler', [11, 8], [11, 8], 'dummy'],
        ['pickpocket', [6, 2], [0, 2]], ['crawler', [12, -4], [5, -4], 'cannon'], ['guard', [14, -1], [14, -1], 'sword'], ['crawler', [20, 2], [20, 8], 'gloves'],
        ['crawler', [8, 11], [0, 11], 'gloves'], ['crawler', [0, 15.5], [0, 15.5], 'cannon'], ['guard', [-10, 11], [-14, 11], 'sword'], ['crawler', [6, 8], [6, 8], 'rope']],
      gates: [[-1, -16.2, [[-1, -13]]], [-21.5, -7, [[-17, -7]]], [21.5, 5, [[17, 5]]]],
      loot: [[-22, 16, 'chip'], [-19, 15.6, 'chip'], [-16, 15.6, 'pearl'], [22, -16.5, 'chip']], powers: [[-15.6, 14.6, 'triple'], [22, 16, 'shield'], [-22, -16, 'speed'], [21.5, -3.5, 'power']],
      hazards: [[13, -13, 'spill', 2.2, 2, 0], [2, 11, 'spill', 2.4, 2, 0]] }; })(),
  // 3 · STOLEN GOODS STOREROOM: three long walls (a zig-zag), shelves of stolen things, crate piles, the LOOT SACKS, the stairs east
  (() => { const W = WALLS4().concat([[-13.6, -12.4, -8, 18, WH, 'wall'], [-0.6, 0.6, -18, 8, WH, 'wall'], [12.4, 13.6, -8, 18, WH, 'wall'],
      [-23.6, -22.6, -15, -5, 2.4, 'shelf'], [2, 10, -17.6, -16.8, 2.4, 'shelf'], [14.4, 22, -17.6, -16.8, 2.4, 'shelf'], [1.4, 11, 16.8, 17.6, 2.4, 'shelf'], [-11, -2, 16.8, 17.6, 2.4, 'shelf'], [-23.6, -22.6, 4, 12, 2.4, 'shelf']]);
    for (const [x, z] of [[-22.5, 1], [-10.8, -4], [-10.8, 5], [-3.2, -5], [-3.2, 4], [3.2, 7], [10.8, -4], [10.8, 4], [18, -6], [22, -10]]) W.push([x - 0.85, x + 0.85, z - 0.85, z + 0.85, 1.1, 'crate']);
    return { name: 'STOLEN GOODS STOREROOM', art: 'store', wallCol: 0x5c5650, floorCol: '#4a463f', tip: 'THE STOREROOM · GRAB THE STOLEN GOODS SACKS', walls: W,
      route: [[-19, 14], [-19, -13], [-7, -13], [-7, 13], [7, 13], [7, -13], [19, -13], [19, 8], [22.4, 8]], exit: [23.8, 8], exitSide: 'e',
      sacks: [[-20, -16.5], [-10, 15.6], [-3, -16], [10, 15.6], [16, -16], [22, 3.5]],
      foes: [['crawler', [-19, 6], [-19, 0], 'gloves'], ['guard', [-19, -6], [-19, -10], 'sword'], ['crawler', [-20.5, 13], [-20.5, 4.5], 'cannon'], ['crawler', [-14, -13], [-10, -13], 'charge'], ['pickpocket', [-10, 0], [-4, 0]],
        ['crawler', [-7, -4], [-7, 4], 'gloves'], ['lookout', [-3, 10]], ['crawler', [-7, 10], [-4, 13], 'cannon'], ['guard', [3, 13], [3, 13], 'sword'], ['crawler', [7, 6], [7, -2], 'gloves'],
        ['crawler', [10.5, -10], [4, -10], 'cannon'], ['crawler', [9, -12], [9, -12], 'rope'], ['guard', [19, -6], [19, 0], 'sword'], ['crawler', [22, 6], [16, 6], 'gloves'], ['crawler', [16, -10], [16, -10], 'cannon'], ['crawler', [-4, -11], [-4, -11], 'rope']],
      gates: [[-22.5, -9, [[-19, -9]]], [3.4, -2, [[7, -2]]], [16.2, 3, [[19, 3]]]],
      loot: [[-23, -16.5, 'chip'], [-3, 15.4, 'pearl'], [11.4, 15.4, 'chip'], [23, -14, 'chip']], powers: [[-21, 15.5, 'shield'], [-3.4, -14, 'triple'], [10.5, 14, 'speed'], [16, -14, 'power']],
      hazards: [[-19, -1, 'spill', 2.4, 2, 0], [-7, 0, 'spill', 2.4, 2, 0], [7, 4, 'shock', 2.6, 2.4, 0.6], [13, -13, 'spill', 2.6, 2.2, 0]] }; })(),
  // 4 · THE ROOF: six water tanks on stilts (Jack's grapple points), the PENTHOUSE (east; Jack comes out of it), the stair hut (west)
  (() => { const W = [[-24.6, -24.3, -18.6, 18.6, 8, 'void'], [24.3, 24.6, -18.6, 18.6, 8, 'void'], [-24.6, 24.6, -18.6, -18.3, 8, 'void'], [-24.6, 24.6, 18.3, 18.6, 8, 'void'],
      [-24.3, -23.7, -18.3, 18.3, 1.15, 'ledge'], [23.7, 24.3, -18.3, 18.3, 1.15, 'ledge'], [-23.7, 23.7, -18.3, -17.7, 1.15, 'ledge'], [-23.7, 23.7, 17.7, 18.3, 1.15, 'ledge'],
      [-23.7, -19.5, -2.5, 3.5, 3.4, 'wall'], [18.6, 23.7, -5, 5, 3.6, 'wall'],
      [-16.5, -12.5, -15.5, -11.5, 3.2, 'tank'], [-16.5, -12.5, 11.5, 15.5, 3.2, 'tank'], [12.5, 16.5, -16, -12, 3.2, 'tank'], [12.5, 16.5, 12, 16, 3.2, 'tank'], [-2, 2, -15.5, -11.5, 3.2, 'tank'], [-2, 2, 11.5, 15.5, 3.2, 'tank']];
    return { name: 'THE ROOF', art: 'tanks', open: true, boss: true, wallCol: 0xcfc8bb, floorCol: '#9a9d9f', rugW: 2.6, tip: 'AMBUSH ON THE ROOF!', walls: W,
      route: [[-10.5, 0.5], [-5, 0.5], [-1, 0], [4, 0]], exit: [999, 999],
      foes: [['crawler', [-6, -5], [-10, -8], 'gloves'], ['crawler', [-4, 6], [-10, 6], 'gloves'], ['crawler', [2, -8], [2, -8], 'cannon'], ['crawler', [6, 8], [0, 8], 'charge'], ['guard', [8, -2], [8, 3], 'sword']],
      gates: [], loot: [[21, -16, 'chip'], [-21, 16, 'pearl']], powers: [[-8, 15, 'shield'], [8, -15, 'triple']], hazards: [] }; })(),
];

export function pepperMode() {
  const base = saltMode({ lines: { taunt: ['COME OUT, FOX!', 'NICE WALLET!', 'THIS BUILDING IS OURS!', 'MISSED ME!'], spot: ['THERE HE IS!', 'A FOX! GRAB HIM!', 'INTRUDER!'] } });
  let C = null, AA = null; const BOSS_MAX = 600, LZ = { beams: [], sacks: [], ropes: [], alarm: 0, warnT: 0 }, BX = { lane: null, hook: null, smoke: [], decoyT: 0 };
  const rnd = (a, b) => a + Math.random() * (b - a), pk = a => a[(Math.random() * a.length) | 0];
  const yawTo = (dx, dz) => Math.atan2(-dz, dx), angD = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  const t2 = {}, toon2 = c => t2[c] || (t2[c] = C.toon(c));
  const collect = g => { const u = g.userData; u.eye = u.eye || { material: { opacity: 0.6 } }; u.ms = []; g.traverse(o => { if (o.isMesh && o.material !== C.outlineMat && !(o.material && o.material.isMeshBasicMaterial)) u.ms.push([o, o.material]); }); return g; };
  // ---------- JALAPEÑO JACK (front +x) · decoys are the same fox with no shadow ----------
  function jackFox(decoy) { const { THREE, kit, M } = C, outer = new THREE.Group(), u = outer.userData, f = kit.makeFox({ ...JACK, merged: true }); f.rotation.y = Math.PI / 2; outer.add(f); u.fox = f; const FP = f.userData.P;
    { const band = M(new THREE.TorusGeometry(0.41, 0.06, 6, 24), toon2('#141312'), 0, 0.06, 0, FP.head, 0); band.rotation.x = Math.PI / 2; band.scale.set(1.04, 1.04, 1.6); }
    M(new THREE.CylinderGeometry(0.3, 0.36, 0.12, 14), toon2('#141312'), 0, 0.4, 0, FP.head, 0.01); M(new THREE.CylinderGeometry(0.05, 0.03, 0.22, 8), toon2('#3f6d2e'), 0.08, 0.55, 0, FP.head, 0.01);
    M(new THREE.TorusGeometry(0.3, 0.07, 6, 18), toon2('#3f6d2e'), 0, 0.98, 0, FP.body, 0.01).rotation.x = Math.PI / 2;
    const hk = M(new THREE.TorusGeometry(0.1, 0.03, 6, 12, Math.PI * 1.3), toon2('#9aa0a6'), 0, -0.5, 0.05, FP.arms[1], 0.01); hk.rotation.y = Math.PI / 2;
    if (decoy) { outer.traverse(o => { if (o.isMesh) o.castShadow = false; }); u.decoy = true; }
    else { const sh = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.7, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.04; sh.renderOrder = 2; outer.add(sh); u.shadow = sh; }
    return collect(outer); }
  function jackPose(g, dt, sp, mode, p) { const f = g.userData.fox; if (!f) return; C.kit.animFox(f, dt, Math.min(5, sp), false); const A = f.userData.P.arms, B = f.userData.P.body;
    f.userData.mood = mode === 'atk' || mode === 'tell' ? 'angry' : mode === 'laugh' ? 'happy' : mode === 'hurt' ? 'surprised' : 'stern';
    if (mode === 'tell') { A[1].rotation.x = -2.6 * Math.min(1, p * 1.6); A[1].rotation.z = 0.3; } else if (mode === 'atk') { A[1].rotation.x = -2.6 + 2.8 * Math.min(1, p * 2.5); B.rotation.x = 0.3; }
    else if (mode === 'hook') { A[1].rotation.x = -2.9; A[0].rotation.x = -2.2; } else if (mode === 'throw') { A[1].rotation.x = -1.6 + Math.sin(p * 12) * 0.6; } else if (mode === 'arms') { A[0].rotation.x = A[1].rotation.x = -1.1; A[0].rotation.z = 0.7; A[1].rotation.z = -0.7; } }
  // ---------- TRAINING DUMMY (wood + straw, a target on the chest; red eyes when it wakes) ----------
  function dummy() { const { THREE, M } = C, g = new THREE.Group(), u = g.userData, bd = new THREE.Group(); g.add(bd); u.body = bd;
    M(new THREE.CylinderGeometry(0.42, 0.5, 0.14, 16), toon2('#3d2b1d'), 0, 0.07, 0, g, 0.02);
    M(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 8), toon2('#8b6a48'), 0, 0.5, 0, bd, 0.015);
    M(new THREE.CylinderGeometry(0.34, 0.3, 0.85, 14), toon2('#c9a06a'), 0, 1.25, 0, bd, 0.03);
    for (const y of [0.95, 1.55]) M(new THREE.TorusGeometry(0.33, 0.03, 6, 18), toon2('#5c4430'), 0, y, 0, bd, 0).rotation.x = Math.PI / 2;
    const hd = M(new THREE.SphereGeometry(0.27, 14, 10), toon2('#d9b98a'), 0, 1.9, 0, bd, 0.025); u.head = hd;
    for (const s of [-1, 1]) { const a = M(new THREE.CylinderGeometry(0.07, 0.07, 0.62, 8), toon2('#8b6a48'), 0, 1.4, s * 0.48, bd, 0.012); a.rotation.x = Math.PI / 2; u['arm' + (s < 0 ? 0 : 1)] = a; }
    M(new THREE.CircleGeometry(0.2, 18), new THREE.MeshBasicMaterial({ color: 0xec3013 }), 0.32, 1.3, 0, bd, 0).rotation.y = Math.PI / 2; M(new THREE.CircleGeometry(0.12, 18), new THREE.MeshBasicMaterial({ color: 0xf3f2f2 }), 0.325, 1.3, 0, bd, 0).rotation.y = Math.PI / 2; M(new THREE.CircleGeometry(0.05, 12), new THREE.MeshBasicMaterial({ color: 0xec3013 }), 0.33, 1.3, 0, bd, 0).rotation.y = Math.PI / 2;
    const em = new THREE.MeshBasicMaterial({ color: 0x201e1d }); for (const s of [-0.09, 0.09]) M(new THREE.SphereGeometry(0.045, 8, 6), em, 0.24, 1.94, s, bd, 0); u.eyeM = em; u.dummy = true; return collect(g); }
  // ---------- ROPE THIEF: a pickpocket bandit + his rope (hangs from the ceiling at his drop spot) ----------
  function ropeMesh(x, z) { const { THREE } = C, r = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), toon2('#a77b4f')); r.position.set(x, 0, z); C.scene.add(r); r.userData.top = WH + 0.05; LZ.ropes.push(r); return r; }
  // ---------- lasers + sacks ----------
  let beamMat = null, beamWarn = null; const sackTex = {};
  function beamMats() { if (beamMat) return; const { THREE } = C; beamMat = new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }); beamWarn = new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }); }
  const sackHave = () => { const S = AA ? AA.save : null; if (!S) return new Set(); const a = S.stat('pepperSacks', null), b = S.stat('pepperSacksBack', null); return new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]); };
  function alarm(A, x, z) { if (LZ.alarm > 0) return; LZ.alarm = 6; A.St.banner = 'ALARM! · BANDITS COMING'; A.St.bannerT = 2; A.St.shake = Math.max(A.St.shake, 0.25); A.say3('ALARM!', x, 2.6, z, '#ff6b5a');
    for (let i = 0; i < 2; i++) for (let k = 0; k < 10; k++) { const an = Math.random() * 6.28, r = rnd(3, 5.5), px = x + Math.cos(an) * r, pz = z + Math.sin(an) * r; if (!A.inSolid(px, pz, 0.6) && Math.abs(px) < 22.5 && Math.abs(pz) < 16.5) { const q = A.spawnFoe(['crawler', [px, pz], [px, pz]], { var: 'gloves' }); q.cd = 1.2; A.glowPop(px, 1, pz, 0xff3b2a, 2); break; } } }
  // boss telegraphs
  function bfx() { if (BX.lane) return; const { THREE, scene } = C; BX.lane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0, depthWrite: false })); BX.lane.rotation.x = -Math.PI / 2; BX.lane.visible = false; scene.add(BX.lane);
    BX.hook = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 6).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x201e1d })); BX.hook.visible = false; scene.add(BX.hook); }
  function hookTo(x0, y0, z0, x1, y1, z1) { const L = Math.hypot(x1 - x0, y1 - y0, z1 - z0) || 0.01; BX.hook.visible = true; BX.hook.scale.set(1, 1, L); BX.hook.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); BX.hook.lookAt(x1, y1, z1); }
  const puff = (A, x, y, z) => { A.burst(x, y + 1, z, 22, 0x8a4a3a, 6); A.burst(x, y + 1, z, 12, 0x3f6d2e, 4); A.glowPop(x, y + 1, z, 0xff8a2a, 2.6); };
  const tanks = () => (AA ? AA.F().walls : []).filter(w => w[5] === 'tank').map(([x0, x1, z0, z1, h]) => ({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, r: (x1 - x0) / 2, h }));
  const ringSpot = (A, ang, r) => { for (let k = 0; k < 8; k++) { const a = ang + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.3, x = A.P.x + Math.cos(a) * r, z = A.P.z + Math.sin(a) * r; if (x > -21 && x < 18 && Math.abs(z) < 15.5 && !A.inSolid(x, z, 0.8)) return [x, z]; } return [Math.max(-20, Math.min(17, A.P.x + 4)), Math.max(-15, Math.min(15, A.P.z))]; };
  const decoys = A => A.foes.filter(q => q.alive && q.var === 'decoy');
  function endSwap(A, e, found) { for (const q of decoys(A)) A.damage(q, 999, q.x, q.z); if (found) { A.St.banner = 'FOUND HIM!'; A.St.bannerT = 1.6; e.state = 'stun'; e.t = 0; A.say3('OUCH!', e.x, e.y + 2.8, e.z, '#ffd23a'); } else { e.state = 'idle'; e.t = 0; e.cd = 1.2; } }

  const api = {
    ...base, floors: PEPPER_FLOORS, bossMax: BOSS_MAX, bossName: 'JALAPEÑO JACK · MASTER THIEF', place: (i, F) => 'Pepper Building · Floor ' + (i + 1) + ' · ' + F.name.toLowerCase(),
    challenge: { name: 'JALAPEÑO JACK', text: 'Fine. No more tricks, no more dummies. Paws only, fox. Duel me!' },
    init(ctx) { C = ctx; base.init(ctx); },
    floorReady(A) { AA = A; base.floorReady(A); },
    stats(S) { base.stats(S); },
    PK: { ...base.PK, cabinet: { hp: 3, cr: 60, fx: 'paper' }, bench: { hp: 2, cr: 30, fx: 'chunk' }, shelf: { hp: 4, cr: 0, fx: 'chunk' }, lasbox: { hp: 1, cr: 0, fx: 'spark' }, locker: { hp: 4, cr: 40, fx: 'spark' } },
    HB: { ...base.HB, boss: [0.7, 0, 2.2] },
    mesh(type, v) { if (type === 'boss') return jackFox(false); if (type === 'crawler' && v === 'dummy') return dummy(); if (type === 'crawler' && v === 'decoy') return jackFox(true); if (type === 'crawler' && v === 'rope') return base.mesh('pickpocket'); return base.mesh(type, v); },
    spawned(e, S) { base.spawned(e, S); if (e.var === 'dummy') { e.st = { ...S.crawler, sight: 10, chase: 1.9, hp: 40 }; e.hp = e.max = 40; e.sleep = true; e.yaw = rnd(0, 6.28); }
      if (e.var === 'decoy') { e.hp = e.max = 1; } if (e.var === 'rope') { e.hp = e.max = 30; e.state = 'up'; e.y = 30; e.cd = rnd(0.5, 2); e.rope = ropeMesh(e.pa[0], e.pa[1]); e.m.visible = false; } },
    dmgMul(e) { return e.type === 'boss' ? (e.state === 'stun' ? 1.5 : e.state === 'vanish' || e.state === 'zip' ? 0.05 : 0.6) : 1; },
    aimCost(e) { if (e.var === 'rope' && e.state === 'up') return 999; if (e.var === 'dummy' && e.sleep) return 4; return base.aimCost(e); },
    pose(g, type, s) { const u = g.userData; if (u.dummy) { const mo = s.mode || 'idle', p = s.p || 0, b = u.body; b.rotation.z = mo === 'tell' ? -0.3 * p : mo === 'atk' ? 0.35 : Math.sin((s.t || 0) * 9) * 0.06 * Math.min(1, (s.speed || 0)); u.arm0.rotation.z = u.arm1.rotation.z = mo === 'atk' ? 0.9 : 0; return; }
      if (u.decoy) { jackPose(g, s.dt || 0.016, s.speed || 0, s.mode || 'idle', s.p || 0); return; } base.pose(g, type, s); },
    upd(e, dt, A, walkTo, see, dist) { const P = A.P, g = e.m, u = g.userData, dx = P.x - e.x, dz = P.z - e.z;
      // TRAINING DUMMY: asleep (slumped) until you walk past or hit it, then a slow brawler (engine brain)
      if (e.var === 'dummy') { if (e.sleep) { if ((dist < 3.4 && see) || e.hp < e.max) { e.sleep = false; e.hop = 0; u.eyeM.color.set(0xff2a1a); A.say3('IT MOVED!', e.x, 2.6, e.z, '#ffd23a'); A.burst(e.x, 1.3, e.z, 10, 0xd9b98a, 4); e.cd = 0.8; if (!A.St.dumT) { A.St.dumT = 1; A.St.banner = 'THE DUMMIES ARE ALIVE!'; A.St.bannerT = 1.8; } }
          else { u.body.rotation.z = 0.12; u.body.rotation.x = 0.06; return true; } } return false; }
      // DECOY: walks in with Jack, swipes at nothing, poofs when the swap ends
      if (e.var === 'decoy') { const B = A.foes.find(q => q.type === 'boss' && q.alive); if (!B || (B.state !== 'stalk' && B.state !== 'swipeT' && B.state !== 'swipe')) { jackPose(g, dt, 0, 'laugh', 0); return true; }   // the boss poofs them (endSwap); killing here would re-show the hp bar
        let mode = 'idle', p = 0; e.ft = (e.ft || 0) - dt; if (dist > 2.1) walkTo(P.x, P.z, 2.5); else { e.yaw += angD(yawTo(dx, dz), e.yaw) * Math.min(1, dt * 8); if (e.ft <= 0) e.ft = 2.2; } if (e.ft > 1.6) { mode = 'tell'; p = (2.2 - e.ft) / 0.6; } else if (e.ft > 1.3) { mode = 'atk'; p = (1.6 - e.ft) / 0.3; }
        jackPose(g, dt, e.spd || (dist > 2.1 ? 2.5 : 0), mode, p); return true; }
      // ROPE THIEF: up in the ceiling → DROPS when you come near → runs at you, grabs gold → back to the rope → CLIMBS away
      if (e.var === 'rope') { const [rx, rz] = e.pa, r = e.rope; let mode = 'idle', p = 0; e.hop = 0;
        const hitNow = e.hp < (e.lastHp ?? e.hp); e.lastHp = e.hp;
        if (e.state === 'up') { g.visible = false; e.y = 30; e.x = rx; e.z = rz; if (e.cd <= 0 && Math.hypot(P.x - rx, P.z - rz) < 7.5 && P.ko <= 0 && Math.abs(P.y) < 2) { e.state = 'drop'; e.t = 0; g.visible = true; A.say3('DROP IN!', rx, 3.2, rz, '#ffd23a'); } }
        else if (e.state === 'drop') { e.y = WH * (1 - Math.min(1, e.t / 0.55)); e.yaw += angD(yawTo(dx, dz), e.yaw) * Math.min(1, dt * 8); if (e.t > 0.6) { e.y = 0; e.state = 'grab'; e.t = 0; } }
        else if (e.state === 'grab') { walkTo(P.x, P.z, 4.6); mode = 'atk'; p = (e.t * 2) % 1; if (dist < 1.0 && A.St.state === 'run' && P.ko <= 0) { const n = Math.min(A.save.data.gold || 0, 25 + 10 * A.FI()); if (n > 0) A.save.addGold(-n); e.stolen = (e.stolen || 0) + n; u.sack.visible = true; A.say3(n ? '-' + n + ' G · STOLEN!' : 'NO GOLD?!', P.x, P.y + 2.4, P.z, '#ff6b5a'); A.St.banner = n ? 'ROPE THIEF! HIT HIM BEFORE HE CLIMBS' : 'ROPE THIEF! HE FOUND NO GOLD'; A.St.bannerT = 2.4; e.state = 'back'; e.t = 0; } else if (e.t > 3.5) { e.state = 'back'; e.t = 0; } }
        else if (e.state === 'back') { if (walkTo(rx, rz, 5) || Math.hypot(e.x - rx, e.z - rz) < 0.5 || e.t > 6) { e.state = 'climb'; e.t = 0; e.x = rx; e.z = rz; } }
        else if (e.state === 'climb') { mode = 'tell'; p = 1; e.y = WH * Math.min(1, e.t / 1.3); if (hitNow && e.y < 2.6) { e.state = 'back'; e.t = 0; e.y = 0; A.say3('OOF!', e.x, 2.4, e.z, '#ffd23a'); }
          else if (e.t > 1.35) { e.state = 'up'; e.cd = 7; if (e.stolen) { A.St.banner = 'HE GOT AWAY WITH ' + e.stolen + ' G · CATCH HIM NEXT TIME'; A.St.bannerT = 2.4; } } }
        if (r) { const top = r.userData.top, bot = e.state === 'up' ? 1.4 : Math.max(0, e.y + 1.6); r.scale.y = Math.max(0.05, top - bot); r.position.set(rx, (top + bot) / 2, rz); r.visible = !!(e.alive); }
        base.pose(g, 'crawler', { mode, p, speed: e.state === 'grab' || e.state === 'back' ? 4 : 0, dt }); if (e.state === 'climb' || e.state === 'drop') { const Ar = u.fox.userData.P.arms; Ar[0].rotation.x = Ar[1].rotation.x = -2.8; }
        return true; }
      return base.upd(e, dt, A, walkTo, see, dist); },
    onKill(e, A) { if (e.var === 'rope') { if (e.rope) e.rope.visible = false; if (e.stolen) { const n = e.stolen + 15; A.save.addGold(n); A.say3('+' + n + ' G · YOUR GOLD BACK!', e.x, e.y + 2.6, e.z, '#7cff9b'); A.St.banner = 'CAUGHT HIM · +' + n + ' G'; A.St.bannerT = 2.2; A.St.thieves = (A.St.thieves || 0) + 1; e.stolen = null; } return; }
      if (e.var === 'decoy') { A.burst(e.x, 1.2, e.z, 18, 0xd9b98a, 6); if (!A.St.duelCall) A.say3('DECOY!', e.x, 2.6, e.z, '#ffd23a'); return; }
      if (e.var === 'dummy') { A.burst(e.x, 1.2, e.z, 16, 0xd9b98a, 6); return; } base.onKill(e, A); },
    thieves(foes) { return foes.filter(e => e.alive && (e.type === 'pickpocket' || e.var === 'rope') && e.stolen != null && e.stolen > 0); },
    // ---------- BOSS: JALAPEÑO JACK ----------
    bossIntro(A) { bfx(); const e = A.spawnFoe(['boss', [21, 0], [21, 0]]); e.hp = e.max = BOSS_MAX; e.state = 'intro'; e.t = 0; e.yaw = Math.PI; e.plan = 0; e.calls = 0; e.y = 0; A.St.banner = 'JALAPEÑO JACK · MASTER THIEF'; A.St.bannerT = 2.6; A.St.shake = 0.3; return e; },
    updBoss(e, dt, A) { bfx(); const g = e.m, u = g.userData, P = A.P, St = A.St, dx = P.x - e.x, dz = P.z - e.z, dist = Math.hypot(dx, dz) || 1; e.t += dt; e.hit = Math.max(0, e.hit - dt);
      const face = k => { e.yaw += angD(yawTo(dx, dz), e.yaw) * Math.min(1, dt * k); }; let mode = 'idle', p = 0, sp = 0;
      const walk = (tx, tz, s) => { const ddx = tx - e.x, ddz = tz - e.z, L = Math.hypot(ddx, ddz); if (L < 0.2) return true; e.yaw += angD(yawTo(ddx, ddz), e.yaw) * Math.min(1, dt * 8); const o = { x: e.x, z: e.z }; A.moveCircle(o, e.x + ddx / L * s * dt, e.z + ddz / L * s * dt, 0.6, 0); e.x = Math.max(-21, Math.min(18, o.x)); e.z = Math.max(-15.5, Math.min(15.5, o.z)); sp = s; return L < 0.5; };
      const hpDrop = e.hp < (e.hp0 ?? e.hp); e.hp0 = e.hp; if (e.state !== 'vanish' && e.state !== 'stalk' && e.state !== 'swipeT' && e.state !== 'swipe') for (const q of decoys(A)) A.damage(q, 999, q.x, q.z);
      if (e.state !== 'zipT' && e.state !== 'zip') BX.lane.visible = false; if (e.state !== 'zipT' && e.state !== 'zip' && e.state !== 'perch') BX.hook.visible = false;
      if (e.state !== 'vanish') g.visible = true;
      if (e.state === 'intro') { e.x = 21 - Math.min(1, e.t / 1.6) * 6; sp = 3; face(1); mode = 'laugh'; if (e.t > 1.8) { e.state = 'idle'; e.t = 0; e.cd = 1; A.say3('LOOKING FOR ME?', e.x, 2.8, e.z, '#ffd23a'); } }
      else if (e.state === 'idle') { face(4); if (dist > 8) walk(P.x, P.z, 3); else if (dist < 4) { const o = { x: e.x, z: e.z }; A.moveCircle(o, e.x - dx / dist * 2.6 * dt, e.z - dz / dist * 2.6 * dt, 0.6, 0); e.x = Math.max(-21, Math.min(18, o.x)); e.z = Math.max(-15.5, Math.min(15.5, o.z)); sp = 2.6; } e.cd -= dt;
        if (e.cd <= 0) { const plan = ['swap', 'zip', 'cards', 'swap', 'zip', 'swap', 'cards']; let s = plan[e.plan++ % plan.length]; if (e.hp < BOSS_MAX * 0.55 && e.calls < 1) { s = 'call'; e.calls++; } e.t = 0;
          if (s === 'zip') { const T = tanks(); let best = null, bs = 1e9; for (const t of T) { const L = Math.hypot(t.x - e.x, t.z - e.z); if (L < 7) continue; const ux = (t.x - e.x) / L, uz = (t.z - e.z) / L, along = (P.x - e.x) * ux + (P.z - e.z) * uz, off = Math.abs((P.x - e.x) * uz - (P.z - e.z) * ux), sc = (along > 0 && along < L ? off : 9 + off) + L * 0.05; if (sc < bs) { bs = sc; best = t; } }
            if (best) { e.tank = best; e.sx = e.x; e.sz = e.z; e.state = 'zipT'; A.say3('MOVE!', P.x, P.y + 2.6, P.z, '#ff6b5a'); } else { e.state = 'idle'; e.cd = 0.4; } }
          else if (s === 'swap') { e.state = 'vanish'; puff(A, e.x, 0, e.z); A.say3('NOW YOU SEE ME…', e.x, 2.8, e.z, '#ffd23a'); }
          else if (s === 'cards') { e.state = 'cards'; e.n = 3; }
          else e.state = 'call'; } }
      else if (e.state === 'vanish') { g.visible = false; if (e.t > 0.55) { const a0 = Math.random() * 6.28, slots = [0, 1, 2, 3, 4].map(i => ringSpot(A, a0 + i * 1.2566, 6.5)), me = (Math.random() * 5) | 0;
          slots.forEach((s, i) => { if (i === me) { e.x = s[0]; e.z = s[1]; } else { const q = A.spawnFoe(['crawler', [s[0], s[1]], [s[0], s[1]]], { var: 'decoy' }); q.yaw = yawTo(P.x - s[0], P.z - s[1]); } puff(A, s[0], 0, s[1]); });
          e.yaw = yawTo(P.x - e.x, P.z - e.z); e.state = 'stalk'; e.t = 0; e.cd = 1; g.visible = true; St.banner = 'WHICH ONE IS REAL? · LOOK FOR THE SHADOW'; St.bannerT = 2.4; if (!St.jackTip) { St.jackTip = 1; } } }
      else if (e.state === 'stalk' || e.state === 'swipeT' || e.state === 'swipe') { if (hpDrop) { endSwap(A, e, true); }
        else if (e.state === 'stalk') { e.cd -= dt; if (dist > 1.9) walk(P.x, P.z, 2.5); else face(8); if (dist < 2.0 && e.cd <= 0) { e.state = 'swipeT'; e.t = 0; } if (e.t > 7) endSwap(A, e, false); }
        else if (e.state === 'swipeT') { face(8); mode = 'tell'; p = e.t / 0.5; if (e.t > 0.5) { e.state = 'swipe'; e.t = 0; } }
        else { mode = 'atk'; p = e.t / 0.3; if (e.t > 0.12 && !e.hitDone) { e.hitDone = true; if (dist < 2.3 && P.y < 1.4) A.hurt(14, e.x, e.z); } if (e.t > 0.35) { e.hitDone = false; e.state = 'stalk'; e.t = 1; e.cd = 1.3; } } }
      else if (e.state === 'stun') { mode = 'hurt'; if (e.t > 1.6) { e.state = 'idle'; e.t = 0; e.cd = 0.8; } }
      else if (e.state === 'zipT' || e.state === 'zip') { const T = e.tank, L = Math.hypot(T.x - e.sx, T.z - e.sz), ux = (T.x - e.sx) / L, uz = (T.z - e.sz) / L; BX.lane.visible = true; BX.lane.scale.set(2.4, L, 1); BX.lane.position.set((e.sx + T.x) / 2, 0.06, (e.sz + T.z) / 2); BX.lane.rotation.z = Math.atan2(ux, uz);
        if (e.state === 'zipT') { e.yaw = yawTo(ux, uz); mode = 'hook'; BX.lane.material.opacity = 0.3 + 0.2 * Math.sin(e.t * 28); hookTo(e.x, 2.3, e.z, T.x, T.h + 0.2, T.z); if (e.t > 0.9) { e.state = 'zip'; e.t = 0; } }
        else { BX.lane.material.opacity = 0.35; const k = Math.min(1, e.t / (L / 15)); e.x = e.sx + (T.x - e.sx) * k; e.z = e.sz + (T.z - e.sz) * k; e.y = (T.h + 0.05) * Math.pow(k, 1.6) + Math.sin(k * Math.PI) * 0.6; mode = 'hook'; hookTo(e.x, e.y + 2.3, e.z, T.x, T.h + 0.2, T.z);
          if (Math.hypot(P.x - e.x, P.z - e.z) < 1.5 && P.y < e.y + 1.0 && e.y < 2.2) A.hurt(16, e.x - ux, e.z - uz); if (Math.random() < 0.5) A.burst(e.x, e.y + 1, e.z, 2, 0x3f6d2e, 2);
          if (k >= 1) { e.y = T.h + 0.05; e.state = 'perch'; e.t = 0; e.n = 3; BX.hook.visible = false; St.shake = Math.max(St.shake, 0.2); A.say3('UP HERE!', e.x, e.y + 2.6, e.z, '#ffd23a'); } } }
      else if (e.state === 'perch') { face(6); mode = 'throw'; p = e.t; if (e.t > 0.5 && e.n > 0 && e.t > 0.5 + (3 - e.n) * 0.45) { e.n--; const y0 = e.y + 1.5, L = Math.hypot(dx, P.y + 0.9 - y0, dz) || 1; A.fireBolt(e.x, y0, e.z, dx / L * 15, (P.y + 0.9 - y0) / L * 15, dz / L * 15, false, 9); A.say3('CARD!', e.x, y0 + 0.8, e.z, '#f3f2f2'); }
        if (e.t > 2.2) { const T = e.tank, L = Math.hypot(P.x - T.x, P.z - T.z) || 1; e.hx0 = e.x; e.hz0 = e.z; e.hy0 = e.y; e.hx = T.x + (P.x - T.x) / L * (T.r + 1.6); e.hz = T.z + (P.z - T.z) / L * (T.r + 1.6); if (A.inSolid(e.hx, e.hz, 0.7)) { e.hx = T.x + (T.r + 1.6); e.hz = T.z; } e.state = 'hopdown'; e.t = 0; } }
      else if (e.state === 'hopdown') { const k = Math.min(1, e.t / 0.6); e.x = e.hx0 + (e.hx - e.hx0) * k; e.z = e.hz0 + (e.hz - e.hz0) * k; e.y = e.hy0 * (1 - k) + Math.sin(k * Math.PI) * 1.2; if (k >= 1) { e.y = 0; e.x = Math.max(-21, Math.min(18, e.x)); e.z = Math.max(-15.5, Math.min(15.5, e.z)); e.state = 'idle'; e.t = 0; e.cd = 1.2; A.burst(e.x, 0.3, e.z, 14, 0xcfc8bb, 5); } }
      else if (e.state === 'cards') { face(6); mode = 'throw'; p = e.t; if (e.t > 0.5) { e.t = 0; e.n--; const y0 = 1.5; for (const s of [-0.18, 0, 0.18]) { const a = Math.atan2(dz, dx) + s, vx = Math.cos(a) * 14, vz = Math.sin(a) * 14; A.fireBolt(e.x, y0, e.z, vx, (P.y + 0.9 - y0) / dist * 14, vz, false, 8); } if (e.n <= 0) { e.state = 'idle'; e.cd = 1.3; } } }
      else if (e.state === 'call') { mode = 'laugh'; if (e.t > 0.7) { for (let i = 0; i < 3; i++) { const q = A.spawnFoe(['crawler', [17.6, -2 + i * 2], [12, -3 + i * 3]], { var: i === 1 ? 'cannon' : 'gloves' }); q.cd = 1; A.glowPop(17.6, 1, -2 + i * 2, 0xffd23a, 2); } St.banner = 'JACK CALLS HIS CREW'; St.bannerT = 2; e.state = 'idle'; e.cd = 2; } }
      else if (e.state === 'talk') { if (!e.out) { e.out = 1; for (const q of decoys(A)) A.damage(q, 999, q.x, q.z); BX.lane.visible = BX.hook.visible = false; } e.y = Math.max(0, e.y - dt * 6); face(4); mode = 'arms'; }
      if (u.shadow) { u.shadow.position.y = e.state === 'perch' ? 0.04 : 0.04 - e.y; u.shadow.visible = e.state !== 'vanish' && e.state !== 'zip' && e.state !== 'hopdown'; }   // the TELL: only the real Jack casts this shadow
      jackPose(g, dt, sp, mode, p); g.position.set(e.x, e.y, e.z); g.rotation.y = e.yaw; g.scale.setScalar(e.hit > 0 ? 1.05 : 1); A.flash(e, e.hit > 0); },
    tick(dt, t) { base.tick(dt, t); const A = AA; if (!A) return; LZ.alarm = Math.max(0, LZ.alarm - dt);
      const run = A.St.state === 'run', P = A.P;
      for (const B of LZ.beams) { const on = B.box.alive, k = B.kind === 'timed' ? ((t + B.ph) % 3.2) : 0, live = on && (B.kind === 'low' || k < 1.8), warm = on && B.kind === 'timed' && k > 2.85;
        B.m.visible = live || warm; B.m.material = live ? beamMat : beamWarn; B.glow.visible = on; if (B.m.visible) B.m.scale.x = B.m.scale.z = live ? 1 + 0.25 * Math.sin(t * 30 + B.ph) : 0.6;
        if (live && run && P.inv <= 0 && P.ko <= 0 && Math.abs(P.x - B.x) < 0.32 && P.z > B.zlo - 0.2 && P.z < B.zhi + 0.2 && P.y < B.h + 0.08 && P.y + 1.6 > B.h) { A.hurt(6, B.x + (P.x < B.x ? 1 : -1), P.z); alarm(A, B.x, P.z); }
        if (!on && !B.off) { B.off = true; A.say3('LASER OFF', B.x, 1.6, B.z0, '#7cff9b'); } }
      for (const s of LZ.sacks) { if (s.got) continue; s.g.position.y = 0.05 + Math.abs(Math.sin(t * 2.4 + s.i)) * 0.12; s.g.rotation.y += dt * 0.8;
        if (run && Math.hypot(P.x - s.x, P.z - s.z) < 1.2 && P.y < 1.5) { s.got = true; s.g.visible = false; const S = A.save, a = S.stat('pepperSacks', null), list = Array.isArray(a) ? a : []; if (!list.includes(s.d.shop)) S.setStat('pepperSacks', [...list, s.d.shop]);
          A.St.sacks = (A.St.sacks || 0) + 1; A.burst(s.x, 1, s.z, 14, 0xe6b45a, 5); A.say3('STOLEN GOODS · ' + s.d.label, s.x, 2.2, s.z, '#ffd23a'); A.St.banner = 'TAKE IT BACK TO THE ' + s.d.label + ' IN MERU'; A.St.bannerT = 2.4; } } },
    quest({ F, St, boss, gates, thief }) { if (thief) return 'A thief has ' + thief + ' G of yours · catch him (THIEF marker)';
      if (F.boss) return St.duelCall ? 'Jalapeño Jack wants a duel · paws only' : boss ? 'Hit the REAL Jack · only he has a shadow · step out of the red lane' : 'Bandits on the roof · beat them all';
      const left = LZ.sacks.filter(s => !s.got).length;
      if (F.art === 'gym' && gates) return 'Jump the low lasers · wait for the blinking ones · break a red laser box (' + gates + ' camps left)';
      if (F.art === 'store' && left) return 'Grab the stolen goods sacks (' + left + ' left) · ' + (gates ? gates + ' camps left' : 'then the stairs');
      return gates ? 'Follow the rug · red rugs lead to bandit camps (' + gates + ' left)' : 'All camps broken · follow the rug to the stairs'; },
    tips(tut, i, F) { return tut ? ['THE PEPPER BUILDING · BANDITS TOOK IT', 'FOLLOW THE RUG · RED RUGS LEAD TO BANDIT CAMPS', 'BREAK EVERY CAMP TO OPEN THE STAIRS', 'ROPE THIEVES DROP FROM THE CEILING · HIT THEM BEFORE THEY CLIMB', 'CATCH A THIEF · GET YOUR GOLD BACK', 'BANDITS DUCK BEHIND CABINETS · BREAK THEIR COVER']
      : ['FLOOR ' + (i + 1) + ' · ' + F.name, F.tip || 'BREAK THE CAMPS · THEN TAKE THE STAIRS', ...(F.art === 'gym' ? ['LASERS: TOUCH ONE = ALARM · SLASH THE RED BOX TO SWITCH IT OFF', 'SOME DUMMIES ARE NOT ASLEEP'] : F.art === 'store' ? ['EACH SACK HAS A SHOP NAME · TAKE IT BACK IN MERU FOR A PRIZE'] : F.boss ? ['THE REAL JACK HAS A SHADOW · DECOYS DO NOT'] : [])]; },
    onWin(w, A) { const S = A.save, first = !S.flag('pepperBuildingCleared'); let gold = 40, xp = 30; if (!w.roof) return;
      if (first) { gold = 200; xp = 150; S.setFlag('pepperBuildingCleared'); S.setFlag('pepperFavour'); S.addRelic('pepperMill'); const SUIT = { outfit: 'suit', torso: ['#7a1d2a', '#3f6d2e', '#f3f2f2'], name: 'PEPPER FAMILY SUIT' }; const have = S.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) S.setStat('tailorOutfits', [...list, SUIT]); }
      S.addGold(gold); S.addXp(xp); S.setStat('pepperClears', S.stat('pepperClears', 0) + 1); const best = S.stat('pepperBest', 0); if (!best || w.time < best) S.setStat('pepperBest', w.time);
      const carry = S.stat('pepperSacks', null); w.pepper = { first, gold, xp, thieves: A.St.thieves || 0, sacks: A.St.sacks || 0, carry: Array.isArray(carry) ? carry.length : 0, best: S.stat('pepperBest', 0) }; w.salt = w.pepper; },
    // ---------- ART ----------
    art(F, G, b, pb, addSolid, solid) { base.art(F, G, b, pb, addSolid, solid); beamMats(); const { THREE, signTex } = C, R = (() => { let s = 11 + F.name.length; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
      for (const r of LZ.ropes) { if (r.parent) r.parent.remove(r); } LZ.ropes = []; LZ.beams = []; LZ.sacks = []; LZ.alarm = 0;
      const sign = (txt, x, y, z, ry, w = 3.2) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: signTex(txt) })); s.position.set(x, y, z); s.rotation.y = ry; G.add(s); };
      const lamp = (x, z, y = 2.75, col = '#ffd9a0') => { b.box('mat', '#201e1d', 0.02, 3.2 - y, 0.02, x, y + (3.2 - y) / 2, z); b.cyl('mat', '#201e1d', 0.28, 0.18, x, y, z, 12, 0, 0, 0.4); b.sph('glo', col, 0.14, x, y - 0.12, z, 1, 10); };
      F.walls.forEach((w, wi) => { const [x0, x1, z0, z1, h, k] = w, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sx = x1 - x0, sz = z1 - z0, s = solid[wi];
        if (k === 'files') { pb.prop('cabinet', x0, x1, z0, z1, 0, h, s); const long = sx >= sz, L = long ? sx : sz, n = Math.max(1, Math.round(L / 0.9)), cw = L / n, d = long ? sz : sx;
          for (let i = 0; i < n; i++) { const u = -L / 2 + cw * (i + 0.5), px = long ? cx + u : cx, pz = long ? cz : cz + u, c = ['#6b7a6a', '#5f6e5e', '#74826f'][i % 3];
            pb.box('mat', c, long ? cw - 0.04 : d, h, long ? d : cw - 0.04, px, h / 2, pz); for (let j = 0; j < 4; j++) { const y = h * (0.15 + j * 0.23); for (const sd of [-1, 1]) { pb.box('mat', '#2a2d33', long ? cw - 0.2 : 0.02, 0.03, long ? 0.02 : cw - 0.2, px + (long ? 0 : sd * (d / 2 + 0.01)), y + 0.16, pz + (long ? sd * (d / 2 + 0.01) : 0)); pb.box('gls', '#c9a24a', long ? 0.18 : 0.03, 0.04, long ? 0.03 : 0.18, px + (long ? 0 : sd * (d / 2 + 0.02)), y + 0.08, pz + (long ? sd * (d / 2 + 0.02) : 0)); } }
            if (R() < 0.35) pb.box('mat', '#f3f2f2', 0.3, 0.06, 0.24, px + (R() - 0.5) * 0.3, h + 0.03, pz, R()); } }
        else if (k === 'safe') { pb.prop('safe', x0, x1, z0, z1, 0, h, s); pb.box('gls', '#3d4148', sx, h, sz, cx, h / 2, cz); pb.cyl('gls', '#e6b45a', 0.16, 0.05, cx - Math.sign(cx) * (sx / 2 + 0.01), h * 0.6, cz, 12, 0, Math.PI / 2); }
        else if (k === 'bench') { pb.prop('bench', x0, x1, z0, z1, 0, h + 0.2, s); const long = sx >= sz; pb.box('mat', '#201e1d', sx * (long ? 1 : 0.5), 0.14, sz * (long ? 0.5 : 1), cx, h, cz); pb.box('mat', '#ec3013', sx * (long ? 0.98 : 0.46), 0.04, sz * (long ? 0.46 : 0.98), cx, h + 0.08, cz);
          for (const q of [-0.4, 0.4]) pb.box('mat', '#5c6670', 0.08, h, 0.08, cx + (long ? q * sx : 0), h / 2, cz + (long ? 0 : q * sz));
          if (F.art === 'gym') { pb.cyl('gls', '#9aa0a6', 0.03, long ? sz + 1.2 : sx + 1.2, cx, h + 0.55, cz, 8, long ? Math.PI / 2 : 0, long ? 0 : Math.PI / 2); for (const sd of [-1, 1]) pb.cyl('mat', '#201e1d', 0.26, 0.08, cx + (long ? 0 : sd * (sx / 2 + 0.45)), h + 0.55, cz + (long ? sd * (sz / 2 + 0.45) : 0), 14, long ? Math.PI / 2 : 0, long ? 0 : Math.PI / 2); } }
        else if (k === 'shelf') { pb.prop('shelf', x0, x1, z0, z1, 0, h, s); const long = sx >= sz, L = long ? sx : sz, d = long ? sz : sx, n = Math.max(2, Math.round(L / 1.6));
          for (let i = 0; i <= n; i++) { const u = -L / 2 + L * i / n; pb.box('mat', '#3d4148', long ? 0.06 : d, h, long ? d : 0.06, long ? cx + u : cx, h / 2, long ? cz : cz + u); }
          for (let j = 0; j < 3; j++) { const y = 0.25 + j * (h - 0.4) / 2.6; pb.box('mat', '#8b6a48', long ? L : d, 0.05, long ? d : L, cx, y, cz);
            for (let i = 0; i < n * 2; i++) { const u = -L / 2 + L * (i + 0.5) / (n * 2), px = long ? cx + u : cx, pz = long ? cz : cz + u, r = R(), c = ['#ec3013', '#2e4a6b', '#e6b45a', '#f3f2f2', '#4f8a5c', '#7a1d2a', '#9aa0a6'][(r * 7) | 0];
              if (r < 0.3) pb.box('gls', c, 0.4, 0.32, 0.36, px, y + 0.19, pz, R()); else if (r < 0.5) pb.cyl('gls', c, 0.13, 0.4, px, y + 0.23, pz, 10); else if (r < 0.65) { pb.box('mat', '#201e1d', long ? 0.6 : 0.06, 0.44, long ? 0.06 : 0.6, px, y + 0.25, pz); pb.box('glo', c, long ? 0.5 : 0.02, 0.34, long ? 0.02 : 0.5, px + (long ? 0 : 0.03), y + 0.25, pz + (long ? 0.03 : 0)); } else if (r < 0.85) pb.sph('gls', c, 0.16, px, y + 0.18, pz, 1.2, 10); } } }
        else if (k === 'locker') { pb.prop('locker', x0, x1, z0, z1, 0, h, s); const n = Math.round(sx / 0.6); for (let i = 0; i < n; i++) { const px = x0 + sx * (i + 0.5) / n; pb.box('gls', i % 2 ? '#2e4a6b' : '#3a5a7b', sx / n - 0.03, h, sz, px, h / 2, cz); for (let j = 0; j < 3; j++) pb.box('mat', '#201e1d', sx / n - 0.2, 0.03, 0.02, px, h - 0.2 - j * 0.08, z0 - 0.01); pb.box('gls', '#c9a24a', 0.04, 0.16, 0.03, px + sx / n / 2 - 0.12, h * 0.55, z0 - 0.02); } } });
      if (F.art === 'rent') { for (const x of [-9.5, 7.7, 16.7]) lamp(x, 6.5, 2.75); for (const x of [-17.5, 0.2, 9.2]) lamp(x, -5.1, 2.75); for (const x of [-16, -4, 8]) { lamp(x, 17.3, 2.7); lamp(x, -17.3, 2.7); }
        sign('PEPPER PROPERTIES · RENT OFFICE', -2, 2.5, -17.79, 0, 4.4); sign('RENT DUE · PAY HERE', -0.8, 2.3, 7.21, 0, 2.8); sign('LATE FEES', -8.8, 2.3, -4.39, 0, 2); sign('FRONT DOOR', 23.79, 2.6, 12, -Math.PI / 2, 2.2);
        b.box('mat', '#201e1d', 0.12, 2.8, 2.2, 23.9, 1.4, 12); b.box('glass', '#bcd4e6', 0.06, 2.6, 1.0, 23.84, 1.3, 11.45); b.box('glass', '#bcd4e6', 0.06, 2.6, 1.0, 23.84, 1.3, 12.55);
        b.box('mat', '#3d2b1d', 0.5, 0.9, 0.5, 2.4, 0.45, 8.0); b.box('mat', '#ec3013', 0.52, 0.12, 0.52, 2.4, 0.95, 8.0); sign('RENT BOX', 2.4, 1.25, 8.27, 0, 0.8); addSolid(2.15, 2.65, 7.75, 8.25, 1.0);
        for (let i = 0; i < 6; i++) { const t = C.CT(128, 160, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = ['#c9b79c', '#9fb4c7', '#d9cfc0'][i % 3]; g.fillRect(14, 20, 100, 90); g.fillStyle = '#201e1d'; for (let k = 0; k < 6; k++) g.fillRect(24 + (k % 3) * 30, 32 + Math.floor(k / 3) * 36, 18, 22); g.fillStyle = '#ec3013'; g.fillRect(14, 120, 100, 24); g.fillStyle = '#fff'; g.font = '900 18px Archivo, sans-serif'; g.fillText('FOR RENT', 20, 139); });
          const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.12), new THREE.MeshLambertMaterial({ map: t })); pm.position.set(-20 + i * 2.6, 1.7, 17.79); pm.rotation.y = Math.PI; G.add(pm); }
        for (let i = 0; i < 24; i++) b.box('gls', '#e6b45a', 0.05, 0.12, 0.02, -22 + (i % 8) * 0.22, 1.2 + Math.floor(i / 8) * 0.3, -17.78); sign('KEYS', -21.2, 2.2, -17.78, 0, 1.2); }
      if (F.art === 'gym') { for (const [x, z] of [[-4, 2], [3, -3.5], [13, 2], [-7, 8], [11, 8], [12, -16.2]]) { b.box('mat', '#2e4a6b', 3.0, 0.06, 2.4, x, 0.03, z); b.box('mat', '#f3f2f2', 3.04, 0.062, 0.06, x, 0.031, z - 1.2); b.box('mat', '#f3f2f2', 3.04, 0.062, 0.06, x, 0.031, z + 1.2); }
        for (const x of [-8, 2, 15]) lamp(x, -7, 2.75, '#fff1c8'); for (const x of [-16, 7]) lamp(x, 5, 2.75, '#fff1c8'); for (const x of [-6, 14]) { lamp(x, 17.4, 2.7, '#fff1c8'); lamp(x, -17.4, 2.7, '#fff1c8'); }
        sign('PEPPER JUGGLING SCHOOL', 2, 2.5, -17.79, 0, 4); sign('QUICK PAWS · LIGHT FEET', 15, 2.4, 4.39, Math.PI, 3.2); sign('LOCKERS', -19, 2.6, 13.42, 0, 1.8); sign('NO PICKING POCKETS · OUTSIDE CLASS', -8, 2.4, 17.79, Math.PI, 4);
        for (const [x, z] of [[22.8, -12], [22.8, 12]]) { b.box('mat', '#201e1d', 0.04, 2.2, 0.04, x, 2.1, z); const bag = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.2, 14), C.toon('#7a1d2a')); bag.position.set(x, 1.4, z); G.add(bag); addSolid(x - 0.35, x + 0.35, z - 0.35, z + 0.35, 2.0); }
        for (const L of F.lasers || []) { const [x, za, zb, h, kind, ph] = L, zlo = Math.min(za, zb), zhi = Math.max(za, zb), zd = Math.sign(zb - za);
          const bxS = addSolid(x - 0.25, x + 0.25, za - 0.25, za + 0.25, 1.4), box = pb.prop('lasbox', x - 0.25, x + 0.25, za - 0.25, za + 0.25, 0, 1.4, bxS); pb.box('gls', '#201e1d', 0.5, 1.4, 0.5, x, 0.7, za); pb.box('glo', '#ff2a1a', 0.3, 0.2, 0.04, x, h, za + zd * 0.26); pb.box('mat', '#ec3013', 0.52, 0.08, 0.52, x, 1.4, za);
          b.box('mat', '#201e1d', 0.18, 1.4, 0.18, x, 0.7, zb); b.box('glo', '#ff2a1a', 0.12, 0.1, 0.04, x, h, zb - zd * 0.1); if (kind === 'timed') b.box('glo', '#ffd23a', 0.2, 0.06, 0.2, x, 1.43, zb);
          const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), beamMat); m.rotation.x = Math.PI / 2; m.scale.y = Math.abs(zb - za) - 0.5; m.position.set(x, h, (za + zb) / 2); G.add(m);
          const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, Math.abs(zb - za) - 0.4), new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending })); glow.rotation.x = -Math.PI / 2; glow.position.set(x, 0.02, (za + zb) / 2); G.add(glow);
          LZ.beams.push({ x, z0: za, zlo: zlo + 0.25, zhi: zhi - 0.25, h, kind, ph: ph || 0, m, glow, box }); } }
      if (F.art === 'store') { for (const z of [-4, 6]) for (const x of [-19, -7, 7, 19]) lamp(x, z + (x === 7 || x === -7 ? 0 : 0), 2.75, '#fff1c8'); sign('STOREROOM · STAFF ONLY', -18, 2.5, 17.79, Math.PI, 3.6); sign('STOLEN? NO. STORED.', 6, 2.5, -17.79, 0, 3.6); sign('STAIRS', 23.79, 2.6, 8, -Math.PI / 2, 1.6);
        const have = sackHave(); (F.sacks || []).forEach(([x, z], i) => { const d = PEPPER_SACKS[i]; if (!d || have.has(d.shop)) return; const g = new THREE.Group(); g.position.set(x, 0.05, z); G.add(g);
          const sk = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), C.toon('#c9b28a')); sk.scale.set(1, 1.15, 1); sk.position.y = 0.45; g.add(sk); const tie = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.22, 10), C.toon('#8b6a48')); tie.position.y = 0.95; g.add(tie);
          const tx = sackTex[d.label] || (sackTex[d.label] = signTex(d.label)), tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false, transparent: true })); tag.scale.set(1.8, 0.45, 1); tag.position.y = 1.7; tag.renderOrder = 21; g.add(tag);
          const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: C.glowTex, color: 0xffd23a, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); gl.scale.setScalar(1.8); gl.position.y = 0.5; g.add(gl);
          LZ.sacks.push({ x, z, d, g, i, got: false }); }); }
      if (F.art === 'tanks') { for (let z = -4.6; z < 4.6; z += 0.6) b.box('mat', Math.round(z / 0.6) % 2 ? '#3f6d2e' : '#201e1d', 0.1, 3.4, 0.6, 18.54, 1.7, z + 0.3);
        b.box('glass', '#bcd4e6', 0.08, 2.6, 2.4, 18.56, 1.3, 0); b.box('glo', '#ffe1a8', 0.04, 2.4, 2.2, 18.6, 1.3, 0); sign('PENTHOUSE', 18.5, 3.2, 0, -Math.PI / 2, 2.6);
        b.box('mat', '#201e1d', 0.08, 2.6, 2.0, -19.46, 1.3, 0.5); b.box('glo', '#39e070', 0.06, 0.12, 2.3, -19.44, 2.66, 0.5);
        b.cyl('gls', '#f3f2f2', 0.08, 7, 21, 3.5, 15, 8); { const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshBasicMaterial({ map: signTex('PEPPER'), side: THREE.DoubleSide })); fl.position.set(21.8, 6.4, 15); G.add(fl); }
        for (const t of F.walls.filter(w => w[5] === 'tank')) { const [x0, x1, z0, z1, h] = t, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; b.cyl('mat', '#7a5236', (x1 - x0) / 2 + 0.03, 0.08, cx, h - 0.6, cz, 18); b.cyl('mat', '#7a5236', (x1 - x0) / 2 + 0.03, 0.08, cx, 1.4, cz, 18); b.box('mat', '#3d4148', 0.08, 2.4, 0.08, cx + (x1 - x0) / 2 + 0.05, 1.9, cz); }
        sign('PEPPER BUILDING · ROOF', -21.6, 2.0, 3.51, 0, 3.4); b.cyl('mat', '#5c6670', 0.12, 5, -21, 2.5, -15, 8); b.sph('glo', '#ff3b2a', 0.25, -21, 5.1, -15); } },
  };
  return api;
}
