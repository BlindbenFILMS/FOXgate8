// MERU — the Ruins caves [meruRuinsInterior], under the Desert temple. Same scene, far south; quick fade in.
// Laid out from the 2D caveLayout() fractions (ref/meruRuinsInterior.*): passage + cave-in, the Crossing (river + bridge),
// the Hollow, the sealed door, the Roost (river + stepping-stone serpent), the bandit camp, Max's cage, two chests.
// People, lines and story beats verbatim from surface_meru.html (banditCallOut, openParley, openMaxRescueTalk, freeMax).
import { branch } from '../engine/story.js';

export const CAVE = { x: 300, z: 230, w: 34, d: 80, h: 7, key: 'cave' };
const fx = f => CAVE.x + (f - 0.5) * CAVE.w, fz = f => CAVE.z + (f - 0.5) * CAVE.d;
const ux = x => (x - CAVE.x) / CAVE.w + 0.5, uz = z => (z - CAVE.z) / CAVE.d + 0.5;
export const at = (a, b) => ({ x: fx(a), z: fz(b) });

const CH = [[0.442, 0.558, 0.004, 0.128], [0.10, 0.90, 0.118, 0.330], [0.42, 0.58, 0.322, 0.402], [0.12, 0.88, 0.396, 0.655], [0.445, 0.555, 0.648, 0.712], [0.08, 0.92, 0.706, 0.974]];
const RIV = [[0.10, 0.90, 0.150, 0.212], [0.08, 0.92, 0.792, 0.902]];
const BRIDGE = { xc: 0.5, w: 0.1 }, SERP = { amp: 0.055, waves: 1.5, w: 0.13 };
const RUBBLE = [0.442, 0.558, 0.088, 0.110], CAGE = { x: 0.5, y: 0.947, r: 0.04 };
export const CHESTS = [at(0.352, 0.962), at(0.648, 0.962)];
export const ENTRY = at(0.5, 0.05), EXIT_SPOT = at(0.5, 0.02);
export const CAMP_ROW = 0.898, FIRE = at(0.664, 0.928), DOOR = at(0.5, 0.660);
const serpX = v => { const t = (v - RIV[1][2]) / (RIV[1][3] - RIV[1][2]); return 0.5 + SERP.amp * Math.sin(t * SERP.waves * Math.PI * 2); };
export const state = { rubble: 3, doorOpen: 0 };

export function walk(x, z) {
  const a = ux(x), b = uz(z); if (!CH.some(([x0, x1, y0, y1]) => a > x0 + 0.012 && a < x1 - 0.012 && b > y0 + 0.004 && b < y1 - 0.004)) return false;
  if (b > RIV[0][2] && b < RIV[0][3]) return Math.abs(a - BRIDGE.xc) < BRIDGE.w / 2 - 0.01;
  if (b > RIV[1][2] && b < RIV[1][3]) return Math.abs(a - serpX(b)) < SERP.w / 2 - 0.012;
  if (state.rubble > 0 && a > RUBBLE[0] && a < RUBBLE[1] && b > RUBBLE[2] - 0.004 && b < RUBBLE[3] + 0.004) return false;
  if (state.doorOpen < 0.8 && b > 0.650 && b < 0.672) return false;
  if (Math.hypot((a - CAGE.x) * CAVE.w, (b - CAGE.y) * CAVE.d) < 1.5) return false;
  for (const c of CHESTS) if (Math.hypot(x - c.x, z - c.z) < 0.75) return false;
  if (Math.hypot(x - FIRE.x, z - FIRE.z) < 0.9) return false;
  return true;
}
CAVE.walk = walk;
CAVE.camOK = (x, z) => { const a = ux(x), b = uz(z); return CH.some(([x0, x1, y0, y1]) => a > x0 && a < x1 && b > y0 && b < y1); };

// the crew (2D BANDIT_CREW) + Max. Torsos from the 2D roster; combat numbers from its combat blocks.
export const BANDITS = [
  { key: 'snag', name: 'Snag', role: 'Bandit', outfit: 'vest', torso: ['#2b2b30', '#171719', '#08080a'], crest: '8', gear: 'sword', ...at(0.40, 0.752), face: Math.PI, mood: 'stern', fight: { hp: 60, dmg: 14, speed: 3.1 } },
  { key: 'rell', name: 'Rell', role: 'Bandit', outfit: 'vest', torso: ['#2b2b30', '#171719', '#08080a'], crest: '8', gear: 'laser', ...at(0.60, 0.914), face: Math.PI, mood: 'smug', fight: { hp: 55, dmg: 12, speed: 3.2, ranged: true } },
  { key: 'rook', name: 'Rook', role: 'Bandit boss', outfit: 'coat', torso: ['#8a6440', '#5c412a', '#2f2016'], crest: '8', gear: 'laser', ...at(0.50, 0.922), face: Math.PI, mood: 'smug', fight: { hp: 95, dmg: 16, speed: 3.0, ranged: true, cd: 1.6 } },
  { key: 'vix', name: 'Vix', role: 'Bandit', outfit: 'vest', female: true, torso: ['#2b2b30', '#171719', '#08080a'], crest: '8', gear: 'sword', ...at(0.418, 0.936), face: Math.PI, mood: 'stern', fight: { hp: 60, dmg: 13, speed: 3.3 } },
  { key: 'cutter', name: 'Cutter', role: 'Bandit', outfit: 'armor', torso: ['#2b2b30', '#171719', '#08080a'], crest: '8', gear: 'sword', ...at(0.582, 0.936), face: Math.PI, mood: 'stern', fight: { hp: 75, dmg: 17, speed: 2.8, cd: 1.5 } },
];
export const MAX_CAGED = { key: 'max', name: 'Max', role: 'Prince', outfit: 'armor', torso: ['#3a4a75', '#22304f', '#0e1730'], crest: 'M', ...at(0.5, 0.947), face: Math.PI, mood: 'sad' };
export const MAX_FREE = at(0.445, 0.934);
export const MARCH = { player: at(0.5, CAMP_ROW), rook: at(0.5, 0.9255), vix: at(0.408, 0.914), snag: at(0.56, 0.872) };
export const RELEASE_Z = fz(0.878);

export const DIALOGUE = {
  vix: [{ who: 'player', text: 'You held the cage.' }, { who: 'npc', text: 'I held a door. There is a difference, and I have had a great deal of time down here to think about how much of one.' }, { who: 'player', text: 'Has it helped?' }, { who: 'npc', text: 'Not yet. ROOK says a job is a job and the coin does not know where it came from. Rook says a lot of things.' }, { who: 'npc', text: 'The prince never once shouted. Sat in there like a fox waiting for a boat. That is the part that stays with me.' }],
  snag: [{ who: 'player', text: 'You are bleeding.' }, { who: 'npc', text: 'I am always bleeding. I have the near bank, and the near bank is where the BATS come down and the rats come up.' }, { who: 'player', text: 'Ask for a different post.' }, { who: 'npc', text: 'I have. Twice. ROOK says somebody has to hold it, and he is right, and I have noticed it is never him.' }, { who: 'npc', text: 'Watch the water on the crossing. Whatever is living in it does not like a light, and I would rather you found that out from me.' }],
};
const P = t => ({ who: 'player', text: t }), N = t => ({ who: 'npc', text: t });
export const CALL_OUT = [N('OI! Far enough, stranger. Nobody wanders this deep by accident. What are you doing down here?'), P('I\u0027m looking for someone.'), N('Course you are. Everybody is. On your feet. The boss will want a word.')];
export const PARLEY = () => branch([N('Well. Look what the tunnel dragged in.'), P('That\u0027s Max. In the cage. He\u0027s a friend of mine.'), N('He is cargo, is what he is. Say your piece. You get one.')], [
  { label: 'Release Max, or fight me.', replies: ['Ha! Did you hear that? He wants a duel. Three of us, friend. There was never going to be a duel.'], do: 'fight' },
  { label: 'What will you ransom him for?', replies: ['Now that is a civil question. Two thousand gold. Not a coin under. And understand me. You come back ALONE.', 'One second lantern on that path and we are gone. And so is he. No trace. No body. Nothing to bury.'], set: 'ransomNamed', do: 'release' },
  { label: 'Can I join your gang?', replies: ['Hm. You came down alone, past the bats. And you are still standing. One job, and we will talk.', 'The OLD SAGE up at the RUINS MUSEUM wears a ring. Black stone. He never takes it off.', 'Lift it off him and bring it here. Then we will see about your friend.'], set: 'ringJob', do: 'release' },
]);
export const MAX_BUSY = [N('NO TIME TO TALK \u2014 there are still BANDITS ABOUT!')];
export const RESCUE = (nm = 'FOX') => branch([N('HEY COUSIN ' + nm + ' \u2014 LET ME OUTTA HERE!'), P('Hold still \u2014 where\u0027s the key?'), N('FORGET the key. DO YOU KNOW HOW TO PICK A LOCK?')], [
  { label: 'I\u0027ve picked a few.', replies: ['Course you have. Go on then \u2014 nice and slow.'], do: 'lock' },
  { label: 'Not a clue.', replies: ['Then today you learn. Old lock, cousin. Three pins, and they are lazy. Wait for the pick to line up, then press.', 'That is the whole trick.'], do: 'lock' },
]);
export const FREED = chestsOpen => branch([N('HA! Look at you. Cousin the locksmith. CAN you take me back to the CASTLE?'), N('We can still make my Father\u0027s Birthday Party!'), ...(chestsOpen < 2 ? [N('Open those chests before we go.'), N('Could be something good in them!')] : [])], [
  { label: 'Stay close \u2014 we\u0027re going home.', replies: ['Right behind you. Lead the way!'], set: 'maxFollowing' },
  { label: 'Give me a minute down here first.', replies: ['Fine, fine. I\u0027ve waited this long. Shout when you\u0027re ready.'] },
]);
export const READY = chestsOpen => branch([N('Ready when you are, cousin. That party will not wait for us.'), ...(chestsOpen < 2 ? [N('And those chests are still shut. Could be some good stuff!')] : [])], [
  { label: 'Stay close \u2014 we\u0027re going home.', replies: ['Right behind you. Lead the way!'], set: 'maxFollowing' },
  { label: 'Not yet.', replies: ['Fine. I\u0027ll be right here, obviously.'] },
]);
export const HAUL = [{ gold: 35, relic: 'shardpin', name: 'SHARD PIN' }, { gold: 55, relic: 'gatecoin', name: 'GATE COIN' }];

export function buildCaves(K) {
  const { THREE, scene, M, BOX, toon, grad, glowing, glowSprite, BK, flames, emblemTex, DARK, GOLD, WOOD, roomLights } = K;
  const T = new THREE.Group(); T.position.set(CAVE.x, 0, CAVE.z); scene.add(T); const L = (a, b) => [(a - 0.5) * CAVE.w, (b - 0.5) * CAVE.d];
  // floors
  const floorM = BK.texMat('stone', '#5a4a3a', 3, 3);
  for (const [x0, x1, y0, y1] of CH) { const [a, b] = L(x0, y0), [c, d] = L(x1, y1); const m = new THREE.Mesh(new THREE.PlaneGeometry(c - a, d - b), floorM); m.rotation.x = -Math.PI / 2; m.position.set((a + c) / 2, 0.01, (b + d) / 2); m.receiveShadow = true; T.add(m); }
  // rock: one instanced mesh of boulders round every chamber edge (cells not on any floor, next to one)
  const cs = 1.0, nx = Math.ceil(CAVE.w / cs) + 2, nz = Math.ceil(CAVE.d / cs) + 2; const onFloor = (x, z) => CAVE.camOK(CAVE.x + x, CAVE.z + z);
  const cells = []; for (let i = -1; i < nx; i++) for (let j = -1; j < nz; j++) { const x = -CAVE.w / 2 + i * cs + cs / 2, z = -CAVE.d / 2 + j * cs + cs / 2; if (onFloor(x, z)) continue; let near = false; for (let a = -1; a <= 1 && !near; a++) for (let b = -1; b <= 1 && !near; b++) if (onFloor(x + a * cs, z + b * cs)) near = true; if (near) cells.push([x, z]); }
  const rockGeo = new THREE.DodecahedronGeometry(0.85, 0), rockM = new THREE.MeshToonMaterial({ color: '#4a3c30', gradientMap: grad });
  const rocks = new THREE.InstancedMesh(rockGeo, rockM, cells.length * 2), dm = new THREE.Object3D(), col = new THREE.Color(); let k = 0; const R = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(11);
  for (const [x, z] of cells) for (let l = 0; l < 2; l++) { const s = 0.62 + R() * 0.3; dm.position.set(x + (R() - 0.5) * 0.3, l * 2.6 + 1.2, z + (R() - 0.5) * 0.3); dm.rotation.set(R() * 0.6, R() * 3, R() * 0.6); dm.scale.set(s, s * (2.2 + R()), s); dm.updateMatrix(); rocks.setMatrixAt(k, dm.matrix); rocks.setColorAt(k++, col.set(R() < 0.5 ? '#6a5644' : '#5a4838')); }
  rocks.castShadow = false; rocks.receiveShadow = true; T.add(rocks);
  // rivers + bridge + serpent stones
  const waterM = new THREE.MeshToonMaterial({ color: '#1f4a6e', gradientMap: grad, emissive: new THREE.Color('#0e2a44'), emissiveIntensity: 0.6 });
  for (const [x0, x1, y0, y1] of RIV) { const [a, b] = L(x0, y0), [c, d] = L(x1, y1); const m = new THREE.Mesh(new THREE.PlaneGeometry(c - a, d - b), waterM); m.rotation.x = -Math.PI / 2; m.position.set((a + c) / 2, -0.15, (b + d) / 2); T.add(m); }
  { const [a, b] = L(BRIDGE.xc, RIV[0][2] - 0.008), [, d] = L(0, RIV[0][3] + 0.008), w = BRIDGE.w * CAVE.w; for (let z = b; z < d; z += 0.42) M(BOX(w, 0.1, 0.36), WOOD, a, 0.05, z + 0.2, T, 0.01); for (const s of [-1, 1]) { M(BOX(0.1, 0.1, d - b), toon('#3a2618'), a + s * w / 2, 0.55, (b + d) / 2, T, 0); for (let z = b; z <= d; z += 1.4) M(BOX(0.1, 0.6, 0.1), toon('#3a2618'), a + s * w / 2, 0.3, z, T, 0); } }
  for (let v = RIV[1][2]; v <= RIV[1][3]; v += 0.009) { const [x, z] = L(serpX(v), v); const s = 0.75 + R() * 0.3; const st = M(new THREE.CylinderGeometry(s, s * 1.1, 0.3, 9), toon(R() < 0.5 ? '#8a7d66' : '#9a8d74'), x + (R() - 0.5) * 0.3, 0.02, z, T, 0.02, s); st.rotation.y = R() * 3; }
  // the cave-in
  const rub = new THREE.Group(); T.add(rub); { const [a, b] = L(RUBBLE[0], RUBBLE[2]), [c, d] = L(RUBBLE[1], RUBBLE[3]); for (let i = 0; i < 9; i++) { const s = 0.4 + R() * 0.45; M(new THREE.DodecahedronGeometry(s, 0), toon('#6b5a46'), a + 0.3 + R() * (c - a - 0.6), s * 0.7 + (i > 5 ? 0.6 : 0), b + R() * (d - b), rub, 0.02, s); } for (let i = 0; i < 3; i++) M(BOX(1.4, 0.18, 0.2), WOOD, a + 0.7 + i * 0.9, 0.4 + i * 0.2, (b + d) / 2, rub, 0.01).rotation.z = 0.5 - i * 0.4; }
  // the sealed door with its golden crest (lifts open as you approach)
  const door = new THREE.Group(); T.add(door); { const [x, z] = L(0.5, 0.660), w = 0.11 * CAVE.w; for (const s of [-1, 1]) M(BOX(0.5, 4.4, 0.6), toon('#3a3448'), x + s * (w / 2 + 0.25), 2.2, z, T, 0.02); M(BOX(w + 1.0, 0.5, 0.7), toon('#3a3448'), x, 4.5, z, T, 0.02);
    const slab = M(BOX(w, 4.0, 0.3), toon('#2a2533'), 0, 2.0, 0, door, 0.02); door.position.set(x, 0, z); const t = emblemTex(); const d = new THREE.Mesh(new THREE.CircleGeometry(0.85, 32), new THREE.MeshToonMaterial({ map: t, gradientMap: grad, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.35 })); d.position.set(0, 2.2, -0.16); d.rotation.y = Math.PI; door.add(d); M(new THREE.TorusGeometry(0.9, 0.07, 6, 32), GOLD, 0, 2.2, -0.17, door, 0); }
  // the Hollow's abandoned crate + spear, torches on the chamber walls
  { const [x, z] = L(0.80, 0.452); M(BOX(1.0, 0.9, 1.0), WOOD, x - 0.6, 0.45, z, T, 0.02); const sp = M(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 5), WOOD, x + 0.4, 1.1, z, T, 0); sp.rotation.z = -0.5; M(new THREE.CylinderGeometry(0.9, 0.9, 0.03, 16), toon('#6b4a7a'), x + 0.3, 0.02, z + 0.4, T, 0); }
  for (const [a, b] of [[0.448, 0.049], [0.552, 0.049], [0.14, 0.137], [0.86, 0.137], [0.14, 0.287], [0.86, 0.287], [0.18, 0.467], [0.82, 0.467], [0.18, 0.607], [0.82, 0.607], [0.12, 0.757], [0.88, 0.757], [0.12, 0.937], [0.88, 0.937]]) { const [x, z] = L(a, b); M(new THREE.CylinderGeometry(0.06, 0.08, 1.6, 6), DARK, x, 0.8, z, T, 0.01, 0.08); const f = M(new THREE.ConeGeometry(0.16, 0.42, 7), glowing('#ff9a3a', null, 2.4), x, 1.82, z, T, 0); f.castShadow = false; flames.push({ fl: f, fi: f, ph: R() * 9 }); glowSprite(x, 1.8, z, 0xff9a40, 2.6, T); }
  // the bandit camp: fire, table, bedrolls, the cage, two chests
  { const [x, z] = L(0.664, 0.928); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; M(new THREE.DodecahedronGeometry(0.2, 0), toon('#5a5040'), x + Math.cos(a) * 0.65, 0.12, z + Math.sin(a) * 0.65, T, 0.01, 0.2); } const f1 = M(new THREE.ConeGeometry(0.42, 1.0, 8), glowing('#ff8a2a', null, 2.6), x, 0.5, z, T, 0); const f2 = M(new THREE.ConeGeometry(0.22, 0.6, 8), glowing('#ffe28a', null, 2.6), x, 0.4, z, T, 0); f1.castShadow = f2.castShadow = false; flames.push({ fl: f1, fi: f2, ph: 1 }); glowSprite(x, 0.8, z, 0xff8a3a, 5, T); }
  { const [x, z] = L(0.33, 0.918); M(BOX(2.2, 0.12, 0.9), WOOD, x, 0.75, z, T, 0.02); for (const s of [-1, 1]) M(BOX(0.12, 0.75, 0.8), toon('#3a2618'), x + s * 0.95, 0.37, z, T, 0); M(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 10), toon('#cbd5e1'), x - 0.6, 0.91, z, T, 0); M(new THREE.SphereGeometry(0.11, 8, 6), toon('#7dd3fc'), x, 0.92, z, T, 0); M(BOX(0.16, 0.26, 0.16), toon('#4ade80'), x + 0.6, 0.94, z, T, 0); }
  for (const [a, b, r] of [[0.24, 0.93, 0.3], [0.76, 0.95, -0.2], [0.80, 0.90, 0.5]]) { const [x, z] = L(a, b); M(BOX(0.9, 0.12, 2.0), toon('#7a5a3a'), x, 0.06, z, T, 0.01).rotation.y = r; }
  { const [x, z] = L(CAGE.x, CAGE.y); const g = new THREE.Group(); g.position.set(x, 0, z); T.add(g); M(new THREE.CylinderGeometry(1.4, 1.4, 0.15, 20), toon('#3a3448'), 0, 0.07, 0, g, 0.02, 1.4); M(new THREE.CylinderGeometry(1.45, 1.45, 0.18, 20), toon('#3a3448'), 0, 2.6, 0, g, 0.02, 1.45);
    const bars = new THREE.Group(); g.add(bars); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; M(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 5), toon('#9aa0b0'), Math.cos(a) * 1.35, 1.3, Math.sin(a) * 1.35, bars, 0); } K.cageBars = bars; }
  K.chestLids = CHESTS.map(c => { const g = new THREE.Group(); g.position.set(c.x - CAVE.x, 0, c.z - CAVE.z); T.add(g); M(BOX(1.0, 0.55, 0.65), WOOD, 0, 0.28, 0, g, 0.02); const lid = new THREE.Group(); lid.position.set(0, 0.55, -0.32); g.add(lid); M(BOX(1.04, 0.2, 0.68), toon('#7a5236'), 0, 0.1, 0.32, lid, 0.02); M(BOX(0.16, 0.18, 0.06), GOLD, 0, 0.05, 0.67, lid, 0); return lid; });
  for (const [a, b] of [[0.5, 0.06], [0.5, 0.22], [0.3, 0.52], [0.7, 0.52], [0.5, 0.80], [0.5, 0.93]]) { const L2 = new THREE.PointLight(0xffb070, 0, 28, 1.2); const [x, z] = L(a, b); L2.position.set(CAVE.x + x, 4.2, CAVE.z + z); scene.add(L2); roomLights.push({ L: L2, k: 22 }); }
  return { group: T, rubble: rub, door, update(dt, px, pz) {
    if (state.rubble <= 0 && rub.visible) { rub.children.forEach(m => { m.position.y -= dt * 3; }); if (rub.children[0].position.y < -2) rub.visible = false; }
    const near = Math.hypot(px - DOOR.x, pz - DOOR.z) < 5; state.doorOpen = Math.max(0, Math.min(1, state.doorOpen + (near ? dt : -dt * 0.5) * 1.2)); door.position.y = state.doorOpen * 4.2;
  } };
}

// bats (the Crossing + the Hollow) and rats (the Hollow + the Roost banks): off the bridge/door line, they come at you when you are close
export const CRITTERS = [
  ...[[0.25, 0.27], [0.75, 0.27], [0.3, 0.45], [0.7, 0.58]].map(([a, b], i) => ({ kind: 'bat', key: 'bat' + i, ...at(a, b) })),
  ...[[0.22, 0.52], [0.78, 0.47], [0.25, 0.74], [0.8, 0.74]].map(([a, b], i) => ({ kind: 'rat', key: 'rat' + i, ...at(a, b) })),
];
export function makeCritter(K, p) {
  const { THREE, scene, M, toon } = K; const c = new THREE.Group(); scene.add(c); c.userData = {};
  if (p.kind === 'bat') { M(new THREE.SphereGeometry(0.22, 10, 8), toon('#2a2433'), 0, 0, 0, c, 0.02, 0.22); for (const s of [-1, 1]) M(new THREE.ConeGeometry(0.07, 0.16, 4), toon('#2a2433'), s * 0.1, 0.22, 0, c, 0); M(new THREE.SphereGeometry(0.04, 6, 4), toon('#ff4d4d', { emissive: new THREE.Color('#ff2a2a'), emissiveIntensity: 1.2 }), 0.07, 0.04, 0.19, c, 0); M(new THREE.SphereGeometry(0.04, 6, 4), toon('#ff4d4d', { emissive: new THREE.Color('#ff2a2a'), emissiveIntensity: 1.2 }), -0.07, 0.04, 0.19, c, 0);
    const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.x = s * 0.15; c.add(w); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.36), toon('#3a3248', { side: THREE.DoubleSide })); m.position.x = s * 0.35; m.rotation.x = -Math.PI / 2; w.add(m); return [w, s]; });
    return { c, opts: { hp: 18, dmg: 6, speed: 4.2, cd: 1.1, wind: 0.3, aggro: 7, fly: 1.4, critter: true, reach: 1.4 }, anim: t => wings.forEach(([w, s]) => { w.rotation.z = s * Math.sin(t * 18) * 0.7; }) }; }
  M(new THREE.SphereGeometry(0.26, 10, 8), toon('#6b5d52'), 0, 0.22, 0, c, 0.02, 0.26).scale.set(0.8, 0.7, 1.4); M(new THREE.SphereGeometry(0.14, 8, 6), toon('#6b5d52'), 0, 0.26, 0.36, c, 0.02, 0.14);
  for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.06, 6, 4), toon('#c9a2a2'), s * 0.09, 0.4, 0.33, c, 0.01);
  const tail = M(new THREE.CylinderGeometry(0.02, 0.01, 0.6, 5), toon('#c9a2a2'), 0, 0.18, -0.6, c, 0); tail.rotation.x = Math.PI / 2 - 0.3;
  return { c, opts: { hp: 22, dmg: 7, speed: 3.6, cd: 1.2, wind: 0.32, aggro: 6, critter: true, reach: 1.2 }, anim: (t, spd) => { tail.rotation.z = Math.sin(t * (spd ? 14 : 3)) * 0.5; } };
}
export const RING_HANDOVER = [{ who: 'player', text: 'The ring. Black stone, off the old fox.' }, { who: 'npc', text: 'Well. Look at that. He has worn that thing since before I was born. VIX. Open the cage. Your friend walks. You both do.' }, { who: 'npc', text: 'You are one of us now. Both of you. Bring me anything old and I will pay over the odds.' }, { who: 'npc', text: 'No questions. That is the whole business.' }];
export const ROOK_RING = [{ who: 'npc', text: 'Lift it off him and bring it here. Then we will see about your friend.' }];
export const ROOK_RANSOM = [{ who: 'npc', text: 'Now that is a civil question. Two thousand gold. Not a coin under. And understand me. You come back ALONE.' }];
export const RELICS = { shardpin: { name: 'Shard Pin', value: 45, remark: 'A cloak pin. I have not seen one in years.' }, gatecoin: { name: 'Gate Coin of Old Meru', value: 120, remark: 'Eight dots. Struck while all eight gates still answered.' } };
