import * as THREE from './vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from './village-game.js';
import { crestTex, emblemTex } from './meru-game.js?v=s670';
import { heavy as bossHeavy, BOSS_FOX, BOSS_INFO, bossExtras, ironWarden, makerPrime, suds9 } from './engine/bosses.js?v=s685d';
import { foxKit, DEFAULT_LOOK, LOOK_KEY, loadLook, PLAYER_MALE, PLAYER_FEMALE, KING_MIGHT, HOPE_LOOK } from './fox-kit.js?v=s686';
import { castKit, loadCastRigs, MAX_LOOK } from './engine/cast.js?v=s681';
import { nobleShoes } from './engine/noble-shoes.js?v=s701';
import { nobleWeaponKit } from './engine/noble-weapons.js';
import { nobleSupers, makeTargets } from './engine/noble-supers.js?v=s702c';
import { hopeSupers } from './engine/hope-supers.js?v=s704';
import { r8Weapons } from './engine/r8-weapons.js?v=s709';
import { nobleShoes as nobleShoesKit } from './engine/noble-shoes.js?v=s701';
import { loadArmorSets, dressArmor, tickArmor } from './engine/armor-sets.js';   // s716 PLANET GUARDS wear their planet's armour set
import { fighterGear } from './engine/fighter-gear.js?v=s695c';   // s700 HOLSTERED gear: sword sheathed on the back (belt + strap), laser on the hip   // s698 Noble's chair weapons in the workshop
import { buildMachine, poseMachine, loadMachines, LOOK0 as MLOOK } from './worlds/ore-machines.js';

// s670 ONE OF EACH CHARACTER (Ben): the top row lists each character once; the OUTFIT row shows the outfits that character can wear.
// Player, Hope + Noble are built by engine/cast.js (the jointed tall body, Hope's cane, Noble's chair + shoe drones); everyone else gets joints + hands too.
const AR = ['#ffffff', '#e7edf4', '#6b7d93'];
export const CHARACTERS = {
  player: { label: 'Player', cast: 'player', look: 'male', sexes: true, base: { outfit: 'armor', torso: AR, crest: '8', eyes: ['#38bdf8', '#38bdf8'] } },
  hope: { label: 'Hope', cast: 'hope', look: 'hope', female: true, base: { outfit: 'armor', torso: AR, crest: '8', bow: true, glasses: 'sun', legColor: '#38bdf8', eyes: ['#f472b6', '#2dd4bf'] } },
  max: { label: 'Prince Max', cast: 'max', look: 'max', base: { outfit: 'armor', torso: ['#2b3f78', '#3a4a75', '#e6b45a'], crest: 'M', glasses: 'royal', legColor: '#22304f', eyes: ['#0f172a', '#0f172a'] } },
  noble: { label: 'Noble', cast: 'noble', look: 'male', chair: true, base: { outfit: 'armor', torso: AR, crest: '8', legColor: '#38bdf8', eyes: ['#dc2626', '#dc2626'] } },
  grand: { label: 'Grand', hero: true, look: 'male', base: { outfit: 'coat', torso: ['#a78bfa', '#5b21b6', '#2e1065'], crest: 'G', eyes: ['#a78bfa', '#a78bfa'] } },
  ulric: { label: 'Ulric', hero: true, look: 'male', heavy: true, pads: ['#b45309', '#e6b45a'], lookX: { bodyScale: 1.04, headWidth: 1.12, cheeks: 1.4, eyeSize: 1.08, eyeTilt: -0.12, browWeight: 4, blush: 0.2 }, base: { outfit: 'robe', torso: ['#fdba74', '#b45309', '#7c2d12'], crest: 'U', eyes: ['#65a30d', '#65a30d'], mood: 'warm' } },   /* s685d Ben: a GENTLE GIANT, Lox's size less 10 % (1.15 × 0.9 ≈ 1.04 on the tall build): wide soft face, round kind eyes */
  lucius: { label: 'Lucius', hero: true, look: 'male', base: { outfit: 'suit', torso: ['#fca5a5', '#991b1b', '#450a0a'], crest: 'L', eyes: ['#eab308', '#eab308'] } },
  jamos: { label: 'Jamos', hero: true, look: 'male', base: { outfit: 'coat', torso: ['#93c5fd', '#1e3a8a', '#0f172a'], crest: 'J', eyes: ['#16a34a', '#16a34a'] } },
};
// outfits: 'own' = the character's usual clothes; the rest pick the female / male cut from the character
export const COSTUMES = {
  own: { label: 'USUAL' },
  swim: { label: 'SWIM', f: { outfit: 'swimsuit', torso: ['#1f6fd0', '#f3f2f2', '#0b2a5c'] }, m: { outfit: 'trunks', torso: ['#ec3013', '#f3f2f2', '#7a1d10'] } },
  box: { label: 'BOXING', f: { outfit: 'boxsport', torso: ['#f3f2f2', '#d82a3a', '#c0392b'] }, m: { outfit: 'boxtank', torso: ['#1f3a8a', '#f3f2f2', '#c0392b'] } },
  robe: { label: 'RING ROBE', f: { outfit: 'boxsport', torso: ['#f3f2f2', '#d82a3a', '#c0392b'], boxRobe: true, robeCol: '#7a1d2a' }, m: { outfit: 'boxtank', torso: ['#1f3a8a', '#e6b45a', '#c0392b'], boxRobe: true, robeCol: '#1b2350' } },
  spar: { label: 'SPARRING', f: { outfit: 'boxsport', torso: ['#f3f2f2', '#d82a3a', '#c0392b'], headGuard: '#c0392b' }, m: { outfit: 'boxtank', torso: ['#1f3a8a', '#f3f2f2', '#c0392b'], headGuard: '#1f3a8a' } },
  armor: { label: '8 ARMOUR', f: { outfit: 'armor', torso: AR, crest: '8' }, m: { outfit: 'armor', torso: AR, crest: '8' } },
};
export const costumesFor = k => { const C = CHARACTERS[k]; if (!C) return []; return Object.keys(COSTUMES).filter(c => !(C.chair && c !== 'own') && !(c === 'armor' && C.base.outfit === 'armor')); };
export const OUTFITS = Object.fromEntries(Object.entries(CHARACTERS).map(([k, c]) => [k, { label: c.label }]));   // the top row (kept name for the page)
// MERU BOSSES (s149): engine/bosses.js. fox bosses take the Look sliders; robots are shown as built
export const BOSSES = {
  barnacle: { label: 'Barnacle', kind: 'Bandit', fox: 'barnacle', frame: [1.25, 6.4] },
  jack: { label: 'Jalapeño Jack', kind: 'Bandit', fox: 'jack', frame: [1.15, 6.0] },
  sumo: { label: 'Oyakata Fox', kind: 'Sumo', fox: 'sumo', frame: [1.35, 7.0], poses: [['stance', 'Fight stance'], ['tsuppari', 'Hundred palm'], ['press', 'Belly press'], ['tachiai', 'Tachiai charge'], ['shiko', 'Shiko stomp'], ['taunt', 'Belly-slap taunt'], ['salt', 'Salt throw'], ['victory', 'Victory'], ['hurt', 'Hurt'], ['stunned', 'Stunned']] },
  michelle: { label: 'Princess Michelle', kind: 'Meru princess', fox: 'michelle', frame: [1.0, 5.2], poses: [['royal', 'Royal stance'], ['fight', 'Fight stance'], ['palm', 'Palm strike'], ['taunt', 'Taunt'], ['victory', 'Victory'], ['hurt', 'Hurt'], ['stunned', 'Stunned']] },
  king: { label: 'King Might', kind: 'Meru king', fox: 'king', frame: [1.15, 6.0], poses: [['royal', 'Royal stance'], ['fight', 'Fight stance'], ['palm', 'Palm strike'], ['taunt', 'Taunt'], ['victory', 'Victory'], ['hurt', 'Hurt'], ['stunned', 'Stunned']] },
  rook: { label: 'Rook', kind: 'Cave bandit', fox: 'rook', frame: [1.15, 6.0] },
  lox: { label: 'Lox', kind: 'Luxor leader', fox: 'lox', frame: [1.15, 6.0] },
  warden: { label: 'Iron Warden', kind: 'Robot', robot: 'warden', frame: [1.6, 9.5], poses: [['stance', 'Fight stance'], ['taunt', 'Taunt'], ['stomp', 'Stomp'], ['rocket', 'Rocket punch'], ['spin', 'Spin attack'], ['stunned', 'Stunned'], ['hurt', 'Hurt']] },
  suds: { label: 'SUDS-9', kind: 'Robot', robot: 'suds', frame: [1.5, 9.0], poses: [['stance', 'Fight stance'], ['taunt', 'Squeegee twirl'], ['sweepL', 'Low sweep'], ['sweepH', 'High sweep'], ['spray', 'Soap spray'], ['cyclone', 'Squeegee cyclone'], ['victory', 'Victory'], ['hurt', 'Hurt'], ['stunned', 'Stunned']] },
  prime: { label: 'Maker Prime', kind: 'Robot', robot: 'prime', frame: [1.9, 11.5], poses: [['stance', 'Fight stance'], ['taunt', 'Taunt'], ['laser', 'Laser sweep'], ['combo', 'Claw + drill'], ['build', 'Build a mini-bot'], ['slam', 'Ground slam'], ['stunned', 'Stunned'], ['hurt', 'Hurt']] } };
export { BOSS_INFO, BOSS_FOX };
export { DEFAULT_LOOK, LOOK_KEY, loadLook, HOPE_LOOK, PLAYER_MALE, PLAYER_FEMALE, MAX_LOOK };

export async function createWorkshop({ container, onPick = () => {} }) {
  window.__allHands = true;   // s671b every fox in the workshop gets real fingers (fox-kit HANDS), not just the listed cast
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;cursor:grab';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#cfe0e6');
  const camera = new THREE.PerspectiveCamera(30, W() / H(), 0.05, 100);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: /[?&]foxmerge=1/.test(location.search) });   // ?foxmerge=1: preview the merged (phone perf) fox

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b0a8, 1.1));
  const key = new THREE.DirectionalLight(0xfff4e6, 2.4); key.position.set(3, 6, 4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -2, right: 2, top: 3, bottom: -1, near: 1, far: 20 }); key.shadow.bias = -0.0005; scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd4ff, 0.8); rim.position.set(-4, 3, -3); scene.add(rim);
  // KYOTO DOJO backdrop (same set as the Human Workshop): plank floor, shoji wall, posts, beams and the tiled roof
  { const CT = (w2, h2, fn) => { const c = document.createElement('canvas'); c.width = w2; c.height = h2; fn(c.getContext('2d'), w2, h2); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }, DOJO = new THREE.Group(); DOJO.position.set(-2, -0.12, 0.6); scene.add(DOJO);
  const plankT = CT(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#c9a06a', '#bf955f', '#d2aa74', '#b88d58'][i % 4]; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(60,36,18,0.35)'; g.fillRect(0, i * 32, w, 2); g.fillRect((i * 97) % w, i * 32, 2, 32); } }); plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping; plankT.repeat.set(3, 3);
  const shojiT = CT(256, 256, (g, w, h) => { g.fillStyle = '#f6f1e6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5a3a22'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); g.lineWidth = 3; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); } for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, i * h / 6); g.lineTo(w, i * h / 6); g.stroke(); } }); shojiT.wrapS = THREE.RepeatWrapping; shojiT.repeat.set(6, 1);
  const ink = toon('#201e1d'), wood = toon('#5a3a22'), roofM = toon('#3a3836');
  const fl = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 7), new THREE.MeshToonMaterial({ map: plankT, gradientMap: grad })); fl.position.set(2, -0.15, -0.5); fl.receiveShadow = true; DOJO.add(fl);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 3), new THREE.MeshToonMaterial({ map: shojiT, gradientMap: grad })); wall.position.set(2, 1.5, -3.9); DOJO.add(wall);
    for (const x of [-4, 0, 4, 8]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.6, 0.22), wood); p.position.set(x, 1.8, -3.9); DOJO.add(p); if (x === -4 || x === 8) { const p2 = p.clone(); p2.position.z = 2.9; DOJO.add(p2); } }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.3, 0.3), wood); beam.position.set(2, 3.5, 2.9); DOJO.add(beam); const beam2 = beam.clone(); beam2.position.z = -3.9; DOJO.add(beam2);
    for (const s of [0, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(13, 0.18, 4.4), roofM); r.position.set(2, 4.1 - s * 0.0, s ? 1.8 : -2.4); r.rotation.x = s ? 0.32 : -0.32; DOJO.add(r); }
  }
  const ped = M(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 64), toon('#f3f2f2'), 0, -0.06, 0, null, 0.02, 1.1);
  M(new THREE.CylinderGeometry(1.12, 1.12, 0.03, 64), toon('#1d4ed8'), 0, -0.005, 0, null, 0);
  const emb = emblemTex(); const disc = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40), new THREE.MeshToonMaterial({ map: emb, gradientMap: grad, transparent: true })); disc.rotation.x = -Math.PI / 2; disc.position.set(0, 0.002, 0.62); scene.add(disc);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 48), new THREE.ShadowMaterial({ opacity: 0.12 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.12; floor.receiveShadow = true; scene.add(floor);

  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, await loadCastRigs().catch(() => ({})));
  const St = { costume: 'own', sex: 'm', gear: 'both', look: loadLook(), outfit: 'player', mood: 'neutral', talking: false, yaw: 0.35, pitch: 0.12, dist: 6.6, focus: 'full', spin: false, t: 0, dirty: true, peek: false };
  let fox = null;
  function rebuild() {
    if (fox) { scene.remove(fox); fox.traverse(o => { if (o.material && o.material.map && o.material.map.isCanvasTexture && o.material.transparent && o.material.alphaTest) { o.material.map.dispose(); } }); }
    kit.setLook(St.look);
    if (St.model) { fox = St.model.obj; fox.userData.isRobot = true; fox.userData.frame = St.model.frame; fox.userData.idle = St.model.tick; scene.add(fox); St.dirty = false; return; }   /* s676 fleet, bots, items */
    if (St.machine) { const gt = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
      let L = MLOOK[St.machine]; try { const sv = loadMachines(); if (sv && sv.look && sv.look[St.machine]) L = { ...L, ...sv.look[St.machine] }; } catch (e) {}
      fox = buildMachine({ THREE, M, toon, glowTex: gt }, St.machine, L); fox.userData.isRobot = true; fox.userData.machine = St.machine; fox.userData.idle = (t, dt) => poseMachine(fox, { t, dt, mode: 'idle', hacked: 0 }); scene.add(fox);
      { const pose = fox.userData.idle; for (let i = 0; i < 30; i++) pose(i * 0.05, 0.05); fox.updateMatrixWorld(true); let lo = 1e9, hi = -1e9; fox.traverse(q => { if (q.isMesh && q.geometry && !(q.material && q.material.side === THREE.BackSide) && !(q.material && q.material.transparent)) { q.geometry.computeBoundingBox(); const b = q.geometry.boundingBox.clone().applyMatrix4(q.matrixWorld); lo = Math.min(lo, b.min.y); hi = Math.max(hi, b.max.y); } });
        if (isFinite(lo) && Math.abs(lo) > 0.02) fox.position.y = -lo; if (isFinite(hi)) fox.userData.frame = [Math.max(0.6, (hi - Math.min(lo, 0)) * 0.45), Math.max(4.2, (hi - Math.min(lo, 0)) * 2.4)]; }   /* s706 Ben: R-8 sat half under the floor: stand every machine ON the floor + frame it from its real height */ if (St.machine === 'r8') try { fox.userData.su = r8Weapons({ THREE, M, toon }, fox, { targets: () => St.tg || [] }); fox.userData.su.equip('melee', St.r8m || 'fist'); fox.userData.su.equip('ranged', St.r8r || 'rivet');   /* after the floor settle, so they sit on his real sides */ } catch (e) { console.warn('r8 weapons', e); } St.dirty = false; return; }   /* s671 R-8 + the Machine Fleet */
    if (St.def) { fox = kit.makeFox({ ...St.def, joints: true, look: St.edited ? St.look : (() => { const base = { ...(St.def.female ? PLAYER_FEMALE : PLAYER_MALE) }, own = St.def.look || {}; if (own.fur) { if (!own.chinPatchCol && (own.chin || own.muzzle)) base.chinPatchCol = own.chin || own.muzzle; if (!own.paw) base.paw = own.fur; if (!own.tailMid) base.tailMid = own.fur; if (!own.tailBase) base.tailBase = own.furDark || own.fur; } return { ...base, ...own }; })() /* s715d paws + tail follow the def's own fur */, mood: St.mood, gear: St.def.outfit === 'armor' || St.def.hero ? (St.gear === 'holster' ? 'both' : St.gear) : 'none' }); if (St.def.armorSet) { const S = loadArmorSets()[St.def.armorSet]; if (S) { try { dressArmor({ THREE, M, toon }, fox, S); fox.userData.tickArmor = t => tickArmor(fox, t); } catch (e) { console.warn('guard armour', e); } } }   /* s716 planet guard */ if (St.gear === 'holster' && (St.def.outfit === 'armor' || St.def.hero) && !fox.userData.rig) fighterGear({ THREE, M, toon }, fox, {});   /* s699 Ben: every hero carries the sword + laser */ scene.add(fox); fox.position.set(0, 0, 0); St.dirty = false; return; }   /* s671 planet leaders + cast */
    const bo = St.boss && BOSSES[St.boss];
    if (St.friend) {   /* s709 FRIENDLY WARDEN / MAKER: the boss robots, smaller + friendlier (red lights → blue / teal), on the player's team, with R-8's weapon engine */
      const fk = St.friend; fox = (fk === 'warden' ? ironWarden : makerPrime)({ THREE, M, toon, grad }); fox.userData.isRobot = true; fox.scale.setScalar(fk === 'warden' ? 0.6 : 0.55); const to = new THREE.Color(fk === 'warden' ? '#38bdf8' : '#2dd4bf');
      fox.traverse(q => { if (!q.isMesh || !q.material || Array.isArray(q.material)) return; const m = q.material, c = m.color; const red = c && c.r > 0.5 && c.g < 0.4 && c.b < 0.4, er = m.emissive && m.emissive.r > 0.4 && m.emissive.g < 0.4; if (red || er) { q.material = m.clone(); if (red) q.material.color.copy(to); if (er) q.material.emissive.copy(to); } });
      scene.add(fox); fox.updateMatrixWorld(true); let lo = 1e9, hi = -1e9; fox.traverse(q => { if (q.isMesh && q.geometry && !(q.material && (q.material.side === THREE.BackSide || q.material.transparent))) { q.geometry.computeBoundingBox(); const b = q.geometry.boundingBox.clone().applyMatrix4(q.matrixWorld); lo = Math.min(lo, b.min.y); hi = Math.max(hi, b.max.y); } });
      if (isFinite(lo) && Math.abs(lo) > 0.02) fox.position.y = -lo; const h = hi - lo; fox.userData.frame = [Math.max(0.6, h * 0.45), Math.max(4.2, h * 2.4)];
      try { fox.userData.su = r8Weapons({ THREE, M, toon }, fox, { targets: () => St.tg || [], faceOff: 0 }); fox.userData.su.equip('melee', St.r8m || (fk === 'warden' ? 'bash' : 'fist')); fox.userData.su.equip('ranged', St.r8r || (fk === 'warden' ? 'rivet' : 'turret')); } catch (e) { console.warn('friend weapons', e); }
      St.dirty = false; return; }
    if (bo && bo.robot) { fox = ({ warden: ironWarden, prime: makerPrime, suds: suds9 }[bo.robot])({ THREE, M, toon, grad }); fox.userData.isRobot = true; if (St.pose) { fox.userData.pose = St.pose; fox.userData.pt = 0; } scene.add(fox); St.dirty = false; return; }
    if (bo) { const d = BOSS_FOX[bo.fox]; fox = kit.makeFox({ ...d, joints: true, look: St.edited ? St.look : d.look, mood: St.mood }); bossExtras(bo.fox, fox, { THREE, M, toon }); if (d.scale) fox.scale.setScalar(d.scale); if (fox.userData.posePose && St.pose && bo.poses && bo.poses.some(p => p[0] === St.pose)) { fox.userData.pose = St.pose; fox.userData.pt = 0; } fox.position.set(0, 0, 0); fox.userData.mood = St.mood; St.dirty = false; return; }
    const C = CHARACTERS[St.outfit] || CHARACTERS.player, fem = C.female || (C.sexes && St.sex === 'f'), cos = COSTUMES[St.costume] && St.costume !== 'own' ? COSTUMES[St.costume][fem ? 'f' : 'm'] : null;
    const base = { ...(C.look === 'max' ? MAX_LOOK : C.look === 'hope' ? HOPE_LOOK : fem ? PLAYER_FEMALE : PLAYER_MALE), ...(C.lookX || {}) }, look = St.edited ? St.look : base;
    const armed = C.hero || C.chair || C.cast === 'hope' || (cos ? cos.outfit : C.base.outfit) === 'armor', o = { ...C.base, ...(cos || {}), look, mood: St.mood, gear: armed && (!(C.chair || C.cast === 'hope') || St.gear === 'holster') ? (St.gear === 'holster' ? 'both' : St.gear) : 'none' };   /* s700b Hope + Noble wear the belt + sheath too (their hands stay on the cane / wheels) */   /* s671 no sword in Noble's lap */
    if (cos) { o.bow = C.base.bow && !cos.headGuard; o.crest = cos.crest || (cos.outfit === 'armor' ? '8' : null); }
    fox = C.cast ? cast.make(C.cast, o) : kit.makeFox({ ...o, key: 'ws_' + St.outfit, joints: true });
    if (C.cast === 'hope') { try { fox.userData.su = hopeSupers({ THREE, M, toon }, fox, { targets: () => St.tg || [] }); } catch (e) { console.warn('hope supers', e); } }
    if (St.gear === 'holster' && o.gear === 'both') { const keep = fox.userData.rig; fighterGear({ THREE, M, toon }, fox, {}); if (keep) { fox.userData.gearRig = fox.userData.rig; fox.userData.rig = keep; } }   /* the cane / chair rig keeps running; the sheathed gear just sits on the back + hip */
    if (C.heavy && fox.userData.P) bossHeavy(fox.userData.P, THREE);
    if (C.pads && fox.userData.P) { const P = fox.userData.P, B = P.body, pm = toon(C.pads[0]), tm = toon(C.pads[1]);   /* s685e Ben: soft shoulder pads + a padded collar so the wide robe meets the neck cleanly */
      for (const a of P.arms || []) { const s = Math.sign(a.position.x) || 1, pg = new THREE.Group(); pg.position.set(a.position.x * 1.02, a.position.y - 0.04, a.position.z); pg.rotation.z = -s * 0.3; pg.userData.built = true; B.add(pg);   /* built = already in tall-hero space (else heroBuild lifts it) */
        M(new THREE.SphereGeometry(0.24, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), pm, 0, 0, 0, pg, 0.02, 0.24).scale.set(1.0, 0.55, 1.05);
        M(new THREE.TorusGeometry(0.235, 0.022, 6, 28), tm, 0, 0.005, 0, pg, 0.006).rotation.x = Math.PI / 2; }
      { const y0 = (P.arms[0] ? P.arms[0].position.y : 1.6) - 0.06, yoke = M(new THREE.CylinderGeometry(0.3, 0.46, 0.16, 28), pm, 0, y0, 0, B, 0.016, 0.46); yoke.scale.set(1.25, 1, 0.95); yoke.userData.built = true; const yr = M(new THREE.TorusGeometry(0.3, 0.02, 6, 30), tm, 0, y0 + 0.08, 0, B, 0.006); yr.rotation.x = Math.PI / 2; yr.scale.set(1.25, 0.95, 1); yr.userData.built = true; } }   /* a soft yoke joins the pads across the shoulders, below the chin */   /* s685d big frames (Ulric the gentle giant) use Lox's bulk */   /* s670 every character on the current jointed body */
    if (C.cast === 'noble' && fox.userData.rig) { const NS = nobleShoes({ THREE, M, toon }).attach(fox); fox.userData.shoes = NS; try { fox.userData.nw = nobleWeaponKit({ THREE, M, toon }).attach(fox); } catch (e) { console.warn('noble weapons', e); }
      try { fox.userData.su = nobleSupers({ THREE, M, toon }, fox, NS, fox.userData.nw, { targets: () => St.tg || [], kit: nobleShoesKit({ THREE, M, toon }), hover: v => { St.supHover = v; } }); } catch (e) { console.warn('noble supers', e); } }
    scene.add(fox); fox.position.set(0, 0, 0); fox.userData.mood = St.mood; St.dirty = false;
  }
  const ptr = { down: false, x: 0, y: 0 };
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { ptr.down = true; ptr.x = e.clientX; ptr.y = e.clientY; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; });
  el.addEventListener('pointermove', e => { if (!ptr.down) return; St.yaw -= (e.clientX - ptr.x) * 0.008; St.pitch = clamp(St.pitch + (e.clientY - ptr.y) * 0.005, -0.3, 1.0); ptr.x = e.clientX; ptr.y = e.clientY; });
  const up = () => { ptr.down = false; el.style.cursor = 'grab'; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', e => { St.dist = clamp(St.dist + e.deltaY * 0.004, 1.4, 14); e.preventDefault(); }, { passive: false });
  const ro = new ResizeObserver(() => requestAnimationFrame(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); })); ro.observe(container);

  const clock = new THREE.Clock(); let raf = 0; const look = new THREE.Vector3(), camT = new THREE.Vector3(0, 1.0, 0); let camD = 5.2;
  function frame() {
    raf = requestAnimationFrame(frame); const dt = Math.min(clock.getDelta(), 0.05); St.t += dt;
    if (St.dirty) rebuild();
    if (St.spin && !ptr.down) St.yaw += dt * 0.5;
    if (fox.userData.isRobot) { fox.userData.idle && fox.userData.idle(St.t, dt); if (fox.userData.su) fox.userData.su.tick(dt); if (St.tg) St.tg.tick(dt); const fr = fox.userData.frame || fox.userData.machine ? (fox.userData.frame || [0.9, 5.2]) : BOSSES[St.boss].frame, fF = St.focus === 'face'; camT.y = damp(camT.y, fF ? fr[0] * 1.55 : fr[0], 6, dt); camD = damp(camD, fF ? fr[1] * 0.42 : Math.max(St.dist, fr[1]), 6, dt); /* FACE CLOSE-UP works on robots too */ camera.position.set(Math.sin(St.yaw) * Math.cos(St.pitch) * camD, camT.y + Math.sin(St.pitch) * camD, Math.cos(St.yaw) * Math.cos(St.pitch) * camD); camera.lookAt(0, camT.y, 0); if (St.tg) { const wd = Math.max(15, 5.6 / (Math.tan(camera.fov * Math.PI / 360) * camera.aspect)), wp = 0.18;   /* s705c fit the whole ring on narrow (phone / split) views */ camera.position.set(Math.sin(St.yaw) * Math.cos(wp) * wd, 1.2 + Math.sin(wp) * wd, Math.cos(St.yaw) * Math.cos(wp) * wd); camera.lookAt(0, 1.2, 0); } renderer.render(scene, camera); return; }
    const u = fox.userData; u.mood = St.mood; u.talkStyle = St.talkStyle; if (!u.say) u.talking = St.talking; else if (!u.talking && !u.say) St.talking = false;
    camera.position.set(Math.sin(St.yaw) * Math.cos(St.pitch) * camD, camT.y + Math.sin(St.pitch) * camD, Math.cos(St.yaw) * Math.cos(St.pitch) * camD);
    u.lookAt = St.peek ? look.copy(camera.position) : null;
    kit.animFox(fox, dt, 0); if (fox.userData.shoes) fox.userData.shoes.tick(dt); if (fox.userData.su) fox.userData.su.tick(dt); if (St.tg) St.tg.tick(dt); if (fox.userData.nw) { const nw = fox.userData.nw, hv = (St.nwHover || St.supHover) ? Math.min(1, (St.nwHk = (St.nwHk || 0) + dt * 2)) : (St.nwHk = Math.max(0, (St.nwHk || 0) - dt * 2)); nw.hover(hv); const q = nw.update(dt, 0) || {}; fox.rotation.y = (q.yaw || 0) + (fox.userData.faceYaw || 0); fox.rotation.x = q.tilt || 0; fox.position.y = (q.lift || 0) + hv * 0.45; } if (fox.userData.posePose) fox.userData.posePose(St.t, dt);
    const hp = fox.userData.P && fox.userData.P.head; if (hp) { hp.getWorldPosition(look); St.headY = St.headY == null ? look.y : damp(St.headY, look.y, 8, dt); } const headY = (St.headY ?? 1.95) / 1.12;   /* s670b measured from the built fox (Noble sits lower in his chair) */
    const bf = St.boss && BOSSES[St.boss] && BOSSES[St.boss].frame, bs = St.boss && BOSS_FOX[BOSSES[St.boss].fox] && BOSS_FOX[BOSSES[St.boss].fox].scale || 1;
    const tall = Math.max(1, (St.headY ?? 1.95) / 1.95 * (fox.userData.P && fox.userData.P.hat ? 1.12 : 1));   /* s683b taller foxes + hats: frame from the real head height */
    camT.y = damp(camT.y, St.focus === 'face' ? headY * 1.12 * bs : bf ? bf[0] : 1.2 * tall, 6, dt); camD = damp(camD, St.focus === 'face' ? Math.min(St.dist, 4.2) * bs : bf ? Math.max(St.dist, bf[1]) : St.dist * tall, 6, dt);
    camera.lookAt(0, camT.y, 0);
    if (St.tg) { St.wideK = damp(St.wideK || 0, 1, 4, dt); const k = St.wideK, wd = Math.max(16, 5.6 / (Math.tan(camera.fov * Math.PI / 360) * camera.aspect)), wy = 1.0, wp = 0.16; camera.position.lerp(new THREE.Vector3(Math.sin(St.yaw) * Math.cos(wp) * wd, wy + Math.sin(wp) * wd, Math.cos(St.yaw) * Math.cos(wp) * wd), k); camera.lookAt(0, camT.y + (wy - camT.y) * k, 0); } else St.wideK = 0;   /* s701b supers: a wide shot of Noble + the training ring (overrides the body framing) */
    renderer.render(scene, camera);
  }
  rebuild(); frame();
  return {
    setLook(l) { St.look = { ...DEFAULT_LOOK, ...l }; St.edited = true; St.dirty = true; },
    async setModel(id) { St.friend = null; const gt = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
      const W = await import('./engine/workshop-models.js?v=s692c'); const m = await W.build(id, { THREE, M, toon, grad, outlineMat, glowTex: gt }); St.def = null; St.boss = null; St.machine = null; St.model = m; St.dist = m.frame[1]; St.dirty = true; },
    setOutfit(k) { St.friend = null; St.model = null; St.outfit = k; St.boss = null; St.def = null; St.machine = null; St.costume = 'own'; St.edited = false; St.dirty = true; },
    setDef(d) { St.friend = null; St.model = null; St.def = d; St.boss = null; St.machine = null; St.edited = false; St.dirty = true; }, setFriend(f) { St.model = null; St.friend = f; St.machine = null; St.def = null; St.boss = null; St.r8m = St.r8r = null; St.dirty = true; }, setMachine(t) { St.friend = null; St.r8m = St.r8r = null; St.model = null; St.machine = t; St.def = null; St.boss = null; St.dirty = true; },
    setCostume(c) { St.costume = c; St.dirty = true; }, setSex(s) { St.sex = s; St.edited = false; St.dirty = true; }, throwShoe(i = 0) { return !!(fox && fox.userData.shoes && fox.userData.shoes.throw(i)); }, hopeSuper(k) { return this.nobleSuper(k); }, r8Weapon(k) { return this.nobleSuper(k); }, r8Equip(slot, kk) { if (slot === 'melee') St.r8m = kk; else St.r8r = kk; if (fox && fox.userData.su && fox.userData.su.equip) fox.userData.su.equip(slot, kk); }, r8Attack(slot) { const su = fox && fox.userData.su, w = su && su.worn && su.worn(slot); return w ? this.nobleSuper(w) : false; },
    nobleSuper(k) { if (!fox || !fox.userData.su) return false; if (!St.tg) St.tg = makeTargets({ THREE, M, toon }, scene); St.yaw = 0.35; return fox.userData.su.play(k); }, superTargets(on) { if (on && !St.tg) St.tg = makeTargets({ THREE, M, toon }, scene); if (!on && St.tg) { St.tg.dispose(); St.tg = null; } },
    nobleWeapon(k) { if (!fox || !fox.userData.nw) return; if (k === 'hover') { St.nwHover = !St.nwHover; return; } fox.userData.nw.play(k); },
    refresh() { St.dirty = true; },   // s608: rebuild with the same outfit (box fit props changed)
    setBoss(k) { St.friend = null; St.model = null; St.def = null; St.machine = null; St.boss = k; St.pose = BOSSES[k] && BOSSES[k].poses ? BOSSES[k].poses[0][0] : 'stance'; St.edited = false; St.dirty = true; St.dist = 5.2; },
    setPose(k) { St.pose = k; if (fox && (fox.userData.isRobot || fox.userData.posePose)) { fox.userData.pose = k; fox.userData.pt = 0; } },
    setMood(m) { St.mood = m; },
    setGear(gr) { St.gear = gr; St.dirty = true; },
    setTalking(v) { St.talking = v; if (!v && fox && !fox.userData.isRobot) fox.userData.say = null; },
    setTalkStyle(ts) { St.talkStyle = ts; }, say(text) { St.talking = true; if (fox) fox.userData.say = { text, t: 0, shown: 0 }; }, speech() { const sy = fox && fox.userData.say; return sy ? { text: sy.text, shown: sy.shown || 0 } : null; },
    setFocus(f) { St.focus = f; if (f === 'face') { St.dist = 2.1; St.pitch = 0.05; } else { St.dist = 6.6; St.pitch = 0.12; } },
    setSpin(v) { St.spin = v; }, setPeek(v) { St.peek = v; },
    view(name) { St.yaw = { front: 0, three: 0.6, side: Math.PI / 2, back: Math.PI }[name] ?? 0; },
    hop() { if (!fox.userData.isRobot) fox.userData.hop = 1; },
    save(l, key) { localStorage.setItem(key || LOOK_KEY, JSON.stringify(l)); },
    get fox() { return fox; },
    snapshot() { return renderer.domElement.toDataURL('image/png'); },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.remove(); },
  };
}

export { NOBLE_SUPERS } from './engine/noble-supers.js?v=s702c';

export { HOPE_SUPERS } from './engine/hope-supers.js?v=s704';

export { R8_MELEE, R8_RANGED, R8_SUPERS, ROBOT_KITS } from './engine/r8-weapons.js?v=s709';

export { iconURL, superIcon } from './engine/super-icons.js?v=s710';
