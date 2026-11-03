import * as THREE from './vendor/three/three.module.js';
import { rr, pick, clamp, smooth, lerp, damp, makeGradient, glowTexture, dotTexture, Ambience } from './village-game.js';
import { crestTex, canvasTex, FONT } from './meru-game.js';
import { foxKit, loadLook, PLAYER_MALE } from './fox-kit.js';
import { CAST, castKit } from './engine/cast.js';
import { loadChair } from './engine/chair.js';
import { loadCane } from './engine/cane.js';
import { hopeWeaponKit, HOPE_MELEE, HOPE_RANGED, HOPE_HOLDS, HOPE_PASSIVES } from './engine/hope-weapons.js';
import { nobleWeaponKit, NOBLE_MELEE, NOBLE_RANGED, NOBLE_HOLDS, stunSeconds } from './engine/noble-weapons.js';
export const HERO_KEY = 'meru.combatHero.v1';

export const TUNE_KEY = 'meru.combatTune.v1';
export const DEFAULT_TUNE = {
  walk: 6.4, run: 9.5, accel: 18, turn: 14, jump: 8, gravity: 24,
  dodgeDist: 4, dodgeDur: 0.24, dodgeCd: 0.5,
  swingTime: 0.28, windup: 0.18, reach: 2.6, arc: 1.5, lunge: 3, comboWindow: 0.75, finisher: 1.4, swordDmg: 25, hitStop: 0.08, trail: 1,
  fireRate: 6.5, boltSpeed: 60, homing: 8, energyCost: 5, energyRegen: 26, recoil: 1, laserDmg: 15,
  camDist: 8.2, camPitch: 0.42, camFollow: 9, shake: 0.3, fov: 58,
};
export function loadTune() { try { return { ...DEFAULT_TUNE, ...JSON.parse(localStorage.getItem(TUNE_KEY) || '{}') }; } catch (e) { return { ...DEFAULT_TUNE }; } }

export async function createLab({ container, onState = () => {} }) {
  const T = loadTune();
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#dcdad6'); scene.fog = new THREE.Fog(0xdcdad6, 30, 70);
  const camera = new THREE.PerspectiveCamera(T.fov, W() / H(), 0.1, 200);
  const grad = makeGradient(), glowTex = glowTexture(), dotTex = dotTexture(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const audio = new Ambience();

  // ---------- yard ----------
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa89f94, 1.0));
  const sun = new THREE.DirectionalLight(0xfff2e0, 2.3); sun.position.set(8, 16, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 60 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; scene.add(sun, sun.target);
  const floorT = canvasTex(1024, 1024, (g) => {
    g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, 1024, 1024);
    g.strokeStyle = 'rgba(32,30,29,0.16)'; g.lineWidth = 2; for (let i = 0; i <= 1024; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.moveTo(0, i); g.lineTo(1024, i); g.stroke(); }
    g.strokeStyle = 'rgba(32,30,29,0.5)'; g.lineWidth = 4; for (let i = 0; i <= 1024; i += 128) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.moveTo(0, i); g.lineTo(1024, i); g.stroke(); }
    g.strokeStyle = '#ec3013'; g.lineWidth = 6; g.beginPath(); g.moveTo(512, 0); g.lineTo(512, 1024); g.moveTo(0, 512); g.lineTo(1024, 512); g.stroke();
    g.beginPath(); g.arc(512, 512, 128, 0, 7); g.stroke();
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(64, 64), new THREE.MeshToonMaterial({ map: floorT, gradientMap: grad })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  for (const [x, z, w, d] of [[0, -32, 64, 1], [0, 32, 64, 1], [-32, 0, 1, 64], [32, 0, 1, 64]]) M(new THREE.BoxGeometry(w, 1.2, d), toon('#201e1d'), x, 0.6, z, null, 0);

  // ---------- dummies ----------
  const targetT = canvasTex(256, 256, (g) => { const c = ['#ec3013', '#f3f2f2']; for (let i = 0; i < 5; i++) { g.fillStyle = c[i % 2]; g.beginPath(); g.arc(128, 128, 126 - i * 25, 0, 7); g.fill(); } });
  const dummies = [];
  function makeDummy(x, z, kind = 'post') {
    const root = new THREE.Group(); root.position.set(x, 0, z); scene.add(root);
    M(new THREE.CylinderGeometry(0.55, 0.65, 0.18, 20), toon('#38404f'), 0, 0.09, 0, root, 0.03, 0.65);
    const sway = new THREE.Group(); sway.position.y = 0.18; root.add(sway);
    M(new THREE.CylinderGeometry(0.07, 0.08, 0.9, 10), toon('#6b4a35'), 0, 0.45, 0, sway, 0.02, 0.08);
    const torso = M(new THREE.CylinderGeometry(0.38, 0.34, 0.85, 18), toon('#d9b26a'), 0, 1.15, 0, sway, 0.035, 0.38);
    for (const y of [0.9, 1.4]) M(new THREE.TorusGeometry(0.37, 0.03, 6, 22), toon('#8a6a3a'), 0, y, 0, sway, 0).rotation.x = Math.PI / 2;
    M(new THREE.BoxGeometry(1.1, 0.1, 0.1), toon('#6b4a35'), 0, 1.35, 0, sway, 0.02);
    const head = M(new THREE.SphereGeometry(0.28, 18, 12), toon('#e6c88a'), 0, 1.85, 0, sway, 0.03, 0.28);
    const tgt = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), new THREE.MeshToonMaterial({ map: targetT, gradientMap: grad })); tgt.position.set(0, 1.15, 0.385); sway.add(tgt);
    const mats = []; sway.traverse(o => { if (o.isMesh && o.material !== outlineMat) { o.material = o.material.clone(); if (!o.material.emissive) o.material.emissive = new THREE.Color(0); mats.push(o.material); } });
    const bar = new THREE.Group(); bar.position.y = 2.5; root.add(bar); const bb = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.14), new THREE.MeshBasicMaterial({ color: 0x000000, depthTest: false, transparent: true })); const bf = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.08), new THREE.MeshBasicMaterial({ color: 0xec3013, depthTest: false, transparent: true })); bf.position.z = 0.002; bb.renderOrder = 5; bf.renderOrder = 6; bar.add(bb, bf); bar.visible = false;
    const iceBlock = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.3, 1.1), new THREE.MeshBasicMaterial({ color: 0xbfefff, transparent: true, opacity: 0.38, depthWrite: false })); iceBlock.position.y = 1.15; iceBlock.visible = false; root.add(iceBlock);
    const d = { bar, bf, iceBlock, hp: 300, max: 300, chill: 0, frozen: 0, icicles: [], root, sway, x, z, ax: 0, az: 0, vx: 0, vz: 0, flash: 0, hits: 0, mats, moving: kind === 'moving', t: rr(0, 6), home: [x, z] };
    dummies.push(d); return d;
  }
  const _md = makeDummy;
  makeDummy(0, -5); makeDummy(-4.5, -8); makeDummy(4.5, -8); makeDummy(0, -13); makeDummy(-9, -2); makeDummy(9, -2);
  const mover = makeDummy(0, -18, 'moving'); mover.root.visible = false;
  const crates = []; for (const [x, z] of [[-7, -11], [7, -12], [-3.5, -17]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); M(new THREE.BoxGeometry(1.1, 1.1, 1.1), toon('#9a6b3c'), 0, 0.55, 0, g, 0.03); for (const y of [0.18, 0.92]) M(new THREE.BoxGeometry(1.14, 0.12, 1.14), toon('#6b4a2c'), 0, y, 0, g, 0); crates.push({ g, x, z, down: 0 }); }

  // ---------- fx ----------
  const sparkN = 300, sparkArr = new Float32Array(sparkN * 3).fill(-999), sparkV = Array.from({ length: sparkN }, () => ({ v: new THREE.Vector3(), life: 0 }));
  const sparkGeo = new THREE.BufferGeometry(); sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkArr, 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: 0xffb347, map: dotTex, size: 0.13, transparent: true, depthWrite: false, alphaTest: 0.1 })); sparks.frustumCulled = false; scene.add(sparks); let sparkI = 0;
  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3(), v5 = new THREE.Vector3();
  function burst(p, n = 14, speed = 6) { for (let k = 0; k < n; k++) { const s = sparkV[sparkI]; s.life = rr(0.25, 0.55); s.v.set(rr(-1, 1), rr(0.3, 1.4), rr(-1, 1)).normalize().multiplyScalar(rr(0.4, 1) * speed); sparkArr.set([p.x, p.y, p.z], sparkI * 3); sparkI = (sparkI + 1) % sparkN; } }
  const popups = [];
  function popup(p, text, color = '#201e1d') { const cw = Math.max(256, Math.ceil(text.length * 44 / 64) * 64), t = canvasTex(cw, 96, (g) => { g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#f3f2f2'; g.strokeText(text, cw / 2, 50); g.fillStyle = color; g.fillText(text, cw / 2, 50); }); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.position.copy(p); s.scale.set(1.5 * cw / 256, 0.56, 1); s.renderOrder = 10; scene.add(s); popups.push({ s, t: 0 }); }
  // sword trail ribbon
  const TR = 18, trailPos = new Float32Array(TR * 2 * 3), trailCol = new Float32Array(TR * 2 * 4), trailIdx = [];
  for (let i = 0; i < TR - 1; i++) { const a = i * 2; trailIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3)); trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 4)); trailGeo.setIndex(trailIdx);
  const trail = new THREE.Mesh(trailGeo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); trail.frustumCulled = false; scene.add(trail);
  const trailPts = []; // {base, tip, age}
  const bolts = [], boltGeo = new THREE.CapsuleGeometry(0.06, 0.8, 3, 6); boltGeo.rotateX(Math.PI / 2);
  const boltMat = new THREE.MeshBasicMaterial({ color: 0xb8f4ff });
  // ---------- WEAPONS: five melee (button 1) and five ranged (button 2). Racket + gloves are two-handed (no ranged). ----------
  const MELEE = { sword: { spd: 1, reach: 1, dmg: 1, tip: 1.3 }, racket: { spd: 1, reach: 1, dmg: 1, tip: 1.05, two: true }, gloves: { spd: 4, reach: 0.75, dmg: 0.5, tip: 0.2, two: true }, spear: { spd: 1, reach: 1.5, dmg: 0.75, tip: 2.25 }, hammer: { spd: 0.5, reach: 1.25, dmg: 1, tip: 1.3, breaks: true } };
  const RANGED = { laser: { rate: 1, dmg: 1, cost: 1, col: 0x38bdf8 }, staff: { rate: 0.5, dmg: 1.25, cost: 1.6, col: 0xff7a1a }, scatter: { rate: 0.5, dmg: 0.5, cost: 1.6, col: 0x9ff3ff }, ice: { rate: 0.75, dmg: 0.2, cost: 1.2, col: 0xbfefff }, rocket: { rate: 0.25, dmg: 3, cost: 4, col: 0xffb347 } };
  const INV = { health: 3, pep: 3, cell: 3 }, WEAR = { armor: true, gauntlets: true, boots: true }; let PAUSE = false;
  const W8 = { m: 'sword', r: 'laser' }, WM = () => MELEE[W8.m], WR = () => (MELEE[W8.m].two ? null : RANGED[W8.r]);
  const fireGeo = new THREE.SphereGeometry(0.16, 10, 8), fireMat = new THREE.MeshBasicMaterial({ color: 0xff8a2a });
  const pelletGeo = new THREE.CapsuleGeometry(0.055, 0.7, 3, 6); pelletGeo.rotateX(Math.PI / 2); const pelletMat = new THREE.MeshBasicMaterial({ color: 0xe6fbff });
  const iceGeo = new THREE.ConeGeometry(0.07, 0.5, 6); iceGeo.rotateX(Math.PI / 2); const iceMat = new THREE.MeshBasicMaterial({ color: 0xcff6ff });
  const icicleGeo = new THREE.ConeGeometry(0.05, 0.36, 5); icicleGeo.rotateX(Math.PI / 2);
  const rocketGeo = new THREE.CapsuleGeometry(0.08, 0.5, 3, 6); rocketGeo.rotateX(Math.PI / 2); const rocketMat = new THREE.MeshBasicMaterial({ color: 0x6b7a3a });
  const enemyGeo = new THREE.SphereGeometry(0.18, 10, 8), enemyMat = new THREE.MeshBasicMaterial({ color: 0xff3b3b }), reflMat = new THREE.MeshBasicMaterial({ color: 0xffd23a });
  const booms = [], fires = [], debris = [];

  // ---------- fox ----------
  const fox = kit.makeFox({ ...CAST.player });   // engine/cast.js
  const FP = fox.userData.P, swordArm = FP.arms[1], gunArm = FP.arms[0];
  const wg = {}; { const mv = (src, name) => { const g = new THREE.Group(); [...src.children].forEach(c => g.add(c)); src.add(g); wg[name] = g; }; mv(FP.sword, 'sword'); mv(FP.gun, 'laser');
    const add = name => { const g = new THREE.Group(); (MELEE[name] ? FP.sword : FP.gun).add(g); wg[name] = g; return g; };
    const steel = toon('#cbd5e1'), dark = toon('#1f2937'), wood = toon('#7a5236');
    { const g = add('racket'); M(new THREE.CylinderGeometry(0.03, 0.036, 0.46, 8), dark, 0, 0.12, 0, g, 0.01); M(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), toon('#e5e7eb'), 0, 0.42, 0, g, 0.008); const hd = M(new THREE.TorusGeometry(0.2, 0.026, 6, 22), toon('#ec3013'), 0, 0.72, 0, g, 0.01); hd.scale.y = 1.25; const st = new THREE.Mesh(new THREE.CircleGeometry(0.19, 18), new THREE.MeshBasicMaterial({ color: 0xf3f4f6, transparent: true, opacity: 0.55, side: THREE.DoubleSide })); st.position.y = 0.72; st.scale.y = 1.25; g.add(st); }
    { const g = add('spear'); M(new THREE.CylinderGeometry(0.026, 0.03, 2.1, 8), wood, 0, 0.95, 0, g, 0.01); M(new THREE.ConeGeometry(0.07, 0.3, 8), steel, 0, 2.15, 0, g, 0.01); M(new THREE.TorusGeometry(0.04, 0.012, 4, 10), toon('#e6b45a'), 0, 1.98, 0, g, 0).rotation.x = Math.PI / 2; }
    { const g = add('hammer'); M(new THREE.CylinderGeometry(0.032, 0.038, 1.2, 8), wood, 0, 0.5, 0, g, 0.01); M(new THREE.BoxGeometry(0.56, 0.28, 0.28), toon('#4b5563'), 0, 1.15, 0, g, 0.02); M(new THREE.BoxGeometry(0.58, 0.07, 0.3), toon('#e6b45a'), 0, 1.15, 0, g, 0); }
    for (const [arm, k] of [[FP.arms[1], 'gloveR'], [FP.arms[0], 'gloveL']]) { const g = new THREE.Group(); g.position.set(0, -0.44, 0.03); arm.add(g); M(new THREE.SphereGeometry(0.14, 12, 10), toon('#c42d3c'), 0, -0.03, 0.02, g, 0.015, 0.14); M(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10), toon('#f3f4f6'), 0, 0.1, 0, g, 0.01, 0.1); wg[k] = g; }
    { const g = add('staff'); const r = M(new THREE.CylinderGeometry(0.025, 0.03, 1.1, 8), wood, 0, 0.05, 0.22, g, 0.01); r.rotation.x = Math.PI / 2; const o = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), new THREE.MeshBasicMaterial({ color: 0xff8a2a })); o.position.set(0, 0.05, 0.8); g.add(o); }
    { const g = add('scatter'); M(new THREE.BoxGeometry(0.22, 0.15, 0.44), toon('#334155'), 0, 0.03, 0.12, g, 0.015); for (let i = -2; i <= 2; i++) { const b = M(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 6), toon('#9ca3af'), i * 0.04, 0.08, 0.46, g, 0); b.rotation.x = Math.PI / 2; } }
    { const g = add('ice'); M(new THREE.BoxGeometry(0.13, 0.17, 0.42), toon('#e0f2fe'), 0, 0.02, 0.14, g, 0.015); const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.08), new THREE.MeshBasicMaterial({ color: 0x9ff3ff })); cr.position.set(0, 0.1, 0.5); g.add(cr); }
    { const g = add('rocket'); const t = M(new THREE.CylinderGeometry(0.1, 0.1, 1.0, 12), toon('#4d5a2a'), 0, 0.12, 0.25, g, 0.015, 0.1); t.rotation.x = Math.PI / 2; M(new THREE.BoxGeometry(0.06, 0.1, 0.12), dark, 0, 0.25, 0.1, g, 0.01); }
  }
  function applyWeapons() { for (const k of Object.keys(MELEE)) if (wg[k]) wg[k].visible = W8.m === k; FP.sword.visible = W8.m !== 'gloves'; wg.gloveR.visible = wg.gloveL.visible = W8.m === 'gloves'; FP.gun.visible = !MELEE[W8.m].two; for (const k of Object.keys(RANGED)) wg[k].visible = W8.r === k; }
  applyWeapons();
  // ---------- NOBLE as a selectable fighter (castKit make('noble') + chair rig + engine/noble-weapons.js) ----------
  const noble = castKit({ THREE, M, toon, makeFox: kit.makeFox }, { chair: await loadChair() }).make('noble'); scene.add(noble); noble.rotation.order = 'YXZ'; noble.visible = false;
  const NK = nobleWeaponKit({ THREE, M, toon }), NW = NK.attach(noble), nRig = noble.userData.rig;
  const shoeMeshes = {}; for (const k of Object.keys(NOBLE_RANGED)) { const m = NK.makeShoe(k); m.visible = false; scene.add(m); shoeMeshes[k] = m; }
  // ---------- HOPE as a selectable fighter (castKit make('hope') + cane rig + engine/hope-weapons.js) ----------
  const hope = castKit({ THREE, M, toon, makeFox: kit.makeFox }, { cane: await loadCane() }).make('hope'); scene.add(hope); hope.visible = false;
  const hRig = hope.userData.rig, HK = hopeWeaponKit({ THREE, M, toon, scene });
  const HO = { m: 'sweep', r: 'echo', act: null, cd: 0, rcd: 0, ecd: 0, wcd: 0, combo: 0, comboT: 0, pinged: null, tip: null, bell: null, beatT: 0, streak: 0, shield: false, vault: false, slam: false, droneS: 'idle', droneT: null, droneTm: 0, peck: 0 };
  try { const sv = JSON.parse(localStorage.getItem(HERO_KEY + '.h') || '{}'); if (HOPE_MELEE[sv.m]) HO.m = sv.m; if (HOPE_RANGED[sv.r]) HO.r = sv.r; } catch (e) {}
  const drone = HK.makeDrone(); drone.visible = false; scene.add(drone); const shieldM = HK.makeShield(); scene.add(shieldM);
  const tipM = HK.makeTip(); tipM.visible = tipM.userData.cord.visible = false; scene.add(tipM, tipM.userData.cord); const bellM = HK.makeBell(); bellM.visible = false; scene.add(bellM);
  const echoGeo = new THREE.SphereGeometry(0.11, 10, 8), echoMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd });
  let HERO = 'player'; try { const hv = localStorage.getItem(HERO_KEY); HERO = hv === 'noble' || hv === 'hope' ? hv : 'player'; } catch (e) {}
  const N = { m: 'spike', r: 'shoe', act: null, cd: 0, rcd: 0, shoe: null, hoverT: 0, hovering: false, rocketQ: [] };
  try { const sv = JSON.parse(localStorage.getItem(HERO_KEY + '.w') || '{}'); if (NOBLE_MELEE[sv.m]) N.m = sv.m; if (NOBLE_RANGED[sv.r]) N.r = sv.r; } catch (e) {}
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x9ff3ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 })); flash.position.set(0, 0.16, 0.7); flash.scale.setScalar(0.9); FP.gun.add(flash);
  const reticle = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.64, 32), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.9, depthTest: false, side: THREE.DoubleSide })); reticle.renderOrder = 9; scene.add(reticle);

  const P = { hp: 100, hurtT: 0, x: 0, z: 4, y: 0, vx: 0, vz: 0, vy: 0, face: Math.PI, ground: true, en: 100, enT: 0, fireCd: 0, recoil: 0,
    swing: 0, swingDur: 0, wind: 0, combo: 0, comboT: 0, hitSet: new Set(), lungeT: 0, ldx: 0, ldz: 0, lsp: 0, dash: 0, dashCd: 0, dx: 0, dz: 0, stepT: 0, target: null, queued: false };
  const St = { yaw: 0, pitch: T.camPitch, t: 0, slow: 1, hitStop: 0, shake: 0, lockOn: false, autoAim: false, moving: false, dmgLog: [], hits: 0, best: 0, lastCombo: 0 };
  const keys = new Set(), mouse = { l: false, r: false, mx: false, x: 0, y: 0 };
  // phone-first input: a floating stick, and three buttons. 1 tap = slash, hold = charged power hit; 2 tap = shot, hold = charged
  // power shot; 3 = jump, double-tap = roll. Combos are rhythm based: press on the beat (the tick as each swing ends) for PERFECT.
  // 1 → 3 → 1 in rhythm = SKY SPLITTER (jump, then an air slash that slams down with a shockwave).
  const HOLD = 0.22, CHG = 0.8, BEAT = () => T.beatWin ?? 0.13;
  const STK = { x: 0, y: 0, m: 0, lowT: -9, fullT: 0 }, INP = [], CH = { h1: null, h2: null, lastJump: -9, full1: false, full2: false };
  let flickOn = true;
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); ring.rotation.x = -Math.PI / 2; scene.add(ring);
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 48), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); shock.rotation.x = -Math.PI / 2; scene.add(shock); let shockT = 9;

  // ---------- input ----------
  const onKeyDown = e => {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; audio.init();
    if (e.code === 'KeyQ') { api.toggleScope(); return; }
    if (SC.on) { const zk = { Digit1: 'body', Digit2: 'legs', Digit3: 'arm', Digit4: 'head' }[e.code]; if (zk) { api.scopeAdd(zk); return; } if (e.code === 'Enter') { if (SC.queue.length) api.scopeExecute(); else api.toggleScope(); return; } if (e.code === 'Backspace') { api.scopeClear(); return; } if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') { api.scopeCycle(e.code === 'ArrowLeft' ? -1 : 1); return; } if (e.code === 'Escape') { api.toggleScope(); return; } return; }
    keys.add(e.code);
    if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) api.press3(true); }
    if ((e.code === 'KeyJ' || e.code === 'KeyF') && !e.repeat) api.press1(true);
    if ((e.code === 'KeyK' || e.code === 'KeyG') && !e.repeat) api.press2(true);
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyL') api.dodge();
    if (e.code === 'Tab') { e.preventDefault(); api.cycleTarget(); }
    if (e.code === 'KeyR') api.resetDummies();
    if (e.code === 'KeyN' && !e.repeat) api.setHero(HERO === 'player' ? 'hope' : HERO === 'hope' ? 'noble' : 'player');
    if (/Arrow/.test(e.code)) e.preventDefault();
  };
  const onKeyUp = e => { keys.delete(e.code); if (e.code === 'KeyJ' || e.code === 'KeyF') api.press1(false); if (e.code === 'KeyK' || e.code === 'KeyG') api.press2(false); if (e.code === 'Space') api.press3(false); }, onBlur = () => { keys.clear(); CH.h1 = CH.h2 = CH.h3 = null; };
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); window.addEventListener('blur', onBlur);
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { audio.init(); el.setPointerCapture(e.pointerId); mouse.x = e.clientX; mouse.y = e.clientY; if (e.button === 0) { mouse.l = true; api.press1(true); } if (e.button === 2) { mouse.r = true; api.press2(true); } if (e.button === 1) { mouse.mx = true; e.preventDefault(); } });
  el.addEventListener('pointermove', e => { if (mouse.mx) { St.yaw -= (e.clientX - mouse.x) * 0.006; St.pitch = clamp(St.pitch + (e.clientY - mouse.y) * 0.004, 0.05, 1.2); St.dragT = 1.5; } mouse.x = e.clientX; mouse.y = e.clientY; });
  el.addEventListener('pointerup', e => { if (e.button === 0) { mouse.l = false; api.press1(false); } if (e.button === 2) { mouse.r = false; api.press2(false); } if (e.button === 1) mouse.mx = false; });
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('wheel', e => { T.camDist = clamp(T.camDist + e.deltaY * 0.01, 3, 16); e.preventDefault(); }, { passive: false });
  const ro = new ResizeObserver(() => requestAnimationFrame(() => { renderer.setSize(W(), H(), false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; camera.aspect = W() / H(); camera.updateProjectionMatrix(); })); ro.observe(container);

  // ---------- combat ----------
  const aliveD = () => dummies.filter(d => d.root.visible && !(d.down > 0));
  // ---------- THE SCOPE (2D toggleScope): freeze, pick a target + up to three called shots, then a slow-motion volley ----------
  const ZONES = [
    { key: 'body', name: 'BODY', odds: 1.00, dmg: 1.0, col: '#7cff9b', line: 'The shot you can count on', y: 1.15, side: 0 },
    { key: 'legs', name: 'LEGS', odds: 0.85, dmg: 0.8, col: '#8ff5ff', line: 'Halves its speed', y: 0.45, side: 0 },
    { key: 'arm', name: 'ARM', odds: 0.70, dmg: 1.2, col: '#ffd166', line: 'Takes its weapon away', y: 1.3, side: 0.38 },
    { key: 'head', name: 'HEAD', odds: 0.50, dmg: 2.6, col: '#ff5c5c', line: 'Critical, and it reels', y: 1.85, side: 0 }];
  const RANGE = 22, OPT = RANGE * 0.45;
  const SC = { on: false, target: null, queue: [], exec: null, pending: [] };
  const scopeList = () => aliveD().filter(d => Math.hypot(d.x - P.x, d.z - P.z) < RANGE * 1.6).sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z));
  const bodyChance = d => { if (!d) return 0; const dist = Math.hypot(d.x - P.x, d.z - P.z); if (dist > RANGE) return 0; const k = Math.max(0, 1 - Math.abs(dist - OPT) / (RANGE * 0.62)); return Math.min(0.98, 0.75 + 0.20 * k); };
  const zoneChance = (d, z) => { const b = bodyChance(d); if (b <= 0) return 0; return Math.max(0.04, Math.min(z.key === 'head' ? 0.88 : 0.99, b * z.odds)); };
  function scopeShot(z) {
    const d = SC.target; if (!d || !d.root.visible) return; const ch = zoneChance(d, z); if (ch <= 0) return;
    P.en = Math.max(0, P.en - T.energyCost); P.enT = 0.6; P.face = Math.atan2(d.x - P.x, d.z - P.z); fox.rotation.y = P.face; fox.updateMatrixWorld(true);
    v3.set(0, 0.16, 0.7); FP.gun.localToWorld(v3); const from = v3.clone(), rx = Math.cos(P.face), rz = -Math.sin(P.face);
    const landed = Math.random() < ch; let to = new THREE.Vector3(d.x + rx * z.side, z.y, d.z + rz * z.side);
    if (!landed) { const dir = to.clone().sub(from), off = (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.1), c = Math.cos(off), s = Math.sin(off); const nx = dir.x * c - dir.z * s, nz = dir.x * s + dir.z * c; to = from.clone().add(new THREE.Vector3(nx, dir.y, nz).multiplyScalar(1.4)); }
    const mesh = new THREE.Mesh(boltGeo, boltMat); mesh.position.copy(from); scene.add(mesh); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(z.col), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); gl.scale.setScalar(1.1); mesh.add(gl);
    const len = from.distanceTo(to); SC.pending.push({ mesh, from, to, t: 0, dur: len / T.boltSpeed, z, d, landed });
    flash.material.opacity = 1; audio.tone(1500, 0.14, 0.05, 'sawtooth', 0.35);
  }
  function landShot(s) {
    scene.remove(s.mesh);
    if (!s.landed) { popup(v3.copy(s.to).setY(2.2), 'MISS', '#9ca3af'); burst(v3.copy(s.to), 6, 3); return; }
    const dmg = Math.round(T.laserDmg * s.z.dmg); hitDummy(s.d, dmg, P, 'laser', s.z.key === 'head');
    if (s.z.key === 'legs') { s.d.slowT = 6; popup(v3.set(s.d.x, 2.9, s.d.z), 'SLOWED', '#8ff5ff'); }
    if (s.z.key === 'arm') { popup(v3.set(s.d.x, 2.9, s.d.z), 'DISARMED', '#ffd166'); }
    if (s.z.key === 'head') { St.shake = Math.max(St.shake, 0.5); s.d.vx *= 2.2; s.d.vz *= 2.2; popup(v3.set(s.d.x, 2.9, s.d.z), 'CRITICAL', '#ff5c5c'); audio.tone(220, 0.2, 0.06, 'square', 0.6); }
  }
  function pickTarget() {
    let best = null, bs = -1e9; const fx = Math.sin(P.face), fz = Math.cos(P.face);
    for (const d of aliveD()) { const dx = d.x - P.x, dz = d.z - P.z, dist = Math.hypot(dx, dz); if (dist > 22) continue; const dot = (dx * fx + dz * fz) / (dist || 1); const sc = dot * 2 - dist * 0.12; if (dot > 0.2 && sc > bs) { bs = sc; best = d; } }
    return best;
  }
  function hitDummy(d, dmg, from, kind, big) {
    if (d.down > 0) return; d.hp = Math.max(0, d.hp - dmg); if (d.hp <= 0) { d.down = 2.5; popup(v3.set(d.x, 3.0, d.z), 'DOWN', '#ffd23a'); }
    const dx = d.x - from.x, dz = d.z - from.z, l = Math.hypot(dx, dz) || 1;
    d.vx += dx / l * (big ? 5 : 3); d.vz += dz / l * (big ? 5 : 3); d.flash = 0.1; d.hits++;
    burst(v3.set(d.x, 1.2, d.z), big ? 26 : 14, big ? 8 : 6);
    popup(v3.set(d.x + rr(-0.3, 0.3), 2.3 + rr(0, 0.3), d.z), String(dmg), kind === 'sword' ? '#0e7fb8' : '#201e1d');
    St.dmgLog.push([St.t, dmg]); St.hits++;
    audio.tone(kind === 'sword' ? 200 : 520, 0.08, 0.07, 'square', 0.6); audio.burst(0.06, kind === 'sword' ? 1200 : 2600, 0.12);
    St.shake = Math.max(St.shake, big ? T.shake * 1.4 : T.shake * 0.6);
  }
  const swordTip = new THREE.Vector3(), swordBase = new THREE.Vector3();
  function bladeWorld() { FP.sword.updateWorldMatrix(true, false); swordBase.set(0, 0.2, 0).applyMatrix4(FP.sword.matrixWorld); swordTip.set(0, WM().tip, 0).applyMatrix4(FP.sword.matrixWorld); }

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, hudKey = '';
  const camPos = new THREE.Vector3(0, 6, 14), camLook = new THREE.Vector3();
  function update(rdt) {
    let dt = rdt * St.slow * (SC.on || PAUSE ? 0 : SC.exec ? 0.2 : 1); St.t += dt;
    if (SC.exec) { const E = SC.exec; E.wait -= rdt; if (E.wait <= 0 && E.i < E.list.length) { scopeShot(E.list[E.i]); E.i++; E.wait = 0.45; } if (E.i >= E.list.length && !SC.pending.length) { E.hold = (E.hold || 0) + rdt; if (E.hold > 0.6) SC.exec = null; } }
    for (let i = SC.pending.length - 1; i >= 0; i--) { const s = SC.pending[i]; s.t += rdt * 0.35; const u = Math.min(1, s.t / Math.max(0.05, s.dur)); s.mesh.position.lerpVectors(s.from, s.to, u); s.mesh.lookAt(s.to); if (u >= 1) { landShot(s); SC.pending.splice(i, 1); } }
    if (SC.on) { if (!SC.target || !SC.target.root.visible) { const l = scopeList(); SC.target = l[0] || null; } }
    if (St.hitStop > 0) { St.hitStop -= rdt; dt *= 0.06; }
    // input
    let ix = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0), iy = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
    if (keys.has('ArrowLeft')) St.yaw += rdt * 2; if (keys.has('ArrowRight')) St.yaw -= rdt * 2;
    if (keys.has('ArrowUp')) St.pitch = clamp(St.pitch + rdt, 0.05, 1.2); if (keys.has('ArrowDown')) St.pitch = clamp(St.pitch - rdt, 0.05, 1.2);
    St.rt = (St.rt || 0) + rdt; ix += STK.x; iy += STK.y; if (STK.m > 0.92) STK.fullT += rdt; else STK.fullT = 0;
    const c1 = CH.h1 != null ? clamp((St.t - CH.h1 - HOLD) / CHG, -1, 1) : -1, c2 = CH.h2 != null ? clamp((St.t - CH.h2 - HOLD) / CHG, -1, 1) : -1;
    const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
    if (CH.h3 != null && !CH.rolled && St.t - CH.h3 > 0.15 && il > 0.5 && !(HERO !== 'player' && !P.ground) && !(HERO === 'hope' && HO.shield)) { CH.rolled = true; api.dodgeDir(ix / Math.max(il, 1e-3), iy / Math.max(il, 1e-3)); }
    const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw), rx = Math.cos(St.yaw), rz = -Math.sin(St.yaw);
    let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix; const ml = Math.hypot(mx, mz); if (ml > 0) { mx /= ml; mz /= ml; }
    const run = keys.has('KeyE') || keys.has('ShiftRight') || STK.fullT > 1.2;
    P.pepT = Math.max(0, (P.pepT || 0) - dt);
    const spd = (run ? T.run : T.walk) * (WEAR.boots ? 1.1 : 1) * (P.pepT > 0 ? 1.3 : 1) * Math.min(1, il) * (P.swing > 0 ? 0.45 : 1) * (c1 >= 0 || c2 >= 0 ? 0.35 : 1) * (HERO === 'noble' && N.act && N.act.k !== 'ram' ? 0.55 : 1) * (HERO === 'hope' ? (HO.shield ? 0.25 : HO.act ? 0.6 : 1) : 1);
    if (P.lungeT > 0) { P.lungeT -= dt; P.vx = P.ldx * P.lsp; P.vz = P.ldz * P.lsp; }
    else if (P.dash > 0) { P.dash -= dt; const ds = T.dodgeDist / T.dodgeDur; P.vx = P.dx * ds; P.vz = P.dz * ds; if (Math.random() < 0.5) burst(v3.set(P.x, 0.1, P.z), 1, 1.2); }
    else { P.vx = damp(P.vx, mx * spd, T.accel, dt); P.vz = damp(P.vz, mz * spd, T.accel, dt); }
    P.x = clamp(P.x + P.vx * dt, -30, 30); P.z = clamp(P.z + P.vz * dt, -30, 30);
    for (const d of aliveD()) { const dx = P.x - d.x, dz = P.z - d.z, dd = Math.hypot(dx, dz); if (dd < 0.95 && dd > 1e-4) { P.x = d.x + dx / dd * 0.95; P.z = d.z + dz / dd * 0.95; } }
    for (const c of crates) { if (c.down > 0) continue; const dx = P.x - c.x, dz = P.z - c.z, dd = Math.hypot(dx, dz); if (dd < 1.05 && dd > 1e-4) { P.x = c.x + dx / dd * 1.05; P.z = c.z + dz / dd * 1.05; } }
    const hs = Math.hypot(P.vx, P.vz);
    if (St.lockOn) { if (!P.target || !P.target.root.visible || Math.hypot(P.target.x - P.x, P.target.z - P.z) > 24) P.target = pickTarget(); } else P.target = St.autoAim && (CH.h2 != null || P.swing > 0) ? pickTarget() : null;
    const aiming = CH.h2 != null;
    let want = hs > 0.4 ? Math.atan2(P.vx, P.vz) : P.face;
    if ((P.swing > 0 || aiming || P.fireCd > 0 || (HERO === 'noble' && N.act) || (HERO === 'hope' && HO.act)) && P.target) want = Math.atan2(P.target.x - P.x, P.target.z - P.z);
    let df = want - P.face; df = Math.atan2(Math.sin(df), Math.cos(df)); P.face += df * Math.min(1, dt * T.turn);
    if (St.lockOn && P.target && !(St.dragT > 0)) { const cy = Math.atan2(P.x - P.target.x, P.z - P.target.z); let dy = cy - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, rdt * 2.2); }
    else if (hs > 0.6 && !(St.dragT > 0)) { let dy = (Math.atan2(P.vx, P.vz) + Math.PI) - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, rdt * 1.4); }
    St.dragT = (St.dragT || 0) - rdt; if (St.backT > 0) { St.backT -= rdt; if (St.backT <= 0) St.yaw -= Math.PI; }
    P.vy -= T.gravity * dt * (HERO === 'noble' && !N.crash ? 0.5 : 1); P.y += P.vy * dt; if (P.y <= 0) { if (N.crash) nobleCrash(); if (HO.slam) hopeSlam(); if (!P.ground && P.vy < -6) audio.burst(0.08, 500, 0.15); P.y = 0; P.vy = 0; P.ground = true; if (P.slam) slamLand(); }
    if (P.ground && hs > 1 && P.dash <= 0) { P.stepT -= dt * hs; if (P.stepT < 0) { P.stepT = 2.2; audio.step(); } }
    P.dashCd = Math.max(0, P.dashCd - dt); P.fireCd = Math.max(0, P.fireCd - dt); P.comboT -= dt; if (P.comboT < 0) P.combo = 0;
    P.enT -= dt; if (P.enT < 0) P.en = Math.min(100, P.en + T.energyRegen * dt);
    if (P.queued && P.swing <= 0) { P.queued = false; api.slash(P.qT, P.qH); }
    if (P.fireQ != null && P.fireCd <= 0) { const q = P.fireQ; P.fireQ = null; fire(q); }
    P.hurtT -= dt; if (P.hurtT < 0) P.hp = Math.min(100, P.hp + 10 * dt);
    if (St.turret) { St.turretT = (St.turretT ?? 1) - dt; if (St.turretT <= 0) { St.turretT = 2.4; const d = dummies[3]; if (d.root.visible && !(d.down > 0) && !(d.frozen > 0) && !(d.stunT > 0)) enemyShot(d); } }
    // animate body
    fox.position.set(P.x, P.y, P.z); fox.rotation.y = P.face;
    fox.userData.mood = P.swing > 0 || aiming ? 'determined' : 'warm';
    kit.animFox(fox, dt, P.dash > 0 ? 0 : hs, !P.ground);
    FP.body.rotation.y = 0;
    if (P.dash > 0) FP.body.rotation.x = (1 - P.dash / T.dodgeDur) * Math.PI * 2;
    if (P.spin > 0) { P.spin = Math.max(0, P.spin - dt / 0.5); FP.body.rotation.x = -(1 - P.spin) * Math.PI * 2; FP.body.position.y += 0.35 * Math.sin((1 - P.spin) * Math.PI); }
    if (P.ground) P.spin = 0;
    // sword swing pose (after animFox so it wins)
    if (P.swing > 0) {
      P.swing -= dt; const total = P.swingDur, tt = 1 - Math.max(0, P.swing) / total, wf = T.windup / (T.windup + T.swingTime);
      const w = tt < wf ? smooth(0, 1, tt / wf) : 1, s = tt < wf ? 0 : Math.pow(smooth(0, 1, (tt - wf) / (1 - wf)), 0.7);
      if (P.combo === 1) { swordArm.rotation.set(lerp(-1.2, -3.05, w) + (lerp(-3.05, -0.35, s) + 3.05) * (s > 0 ? 1 : 0), 0, 0.12); FP.sword.rotation.set(Math.PI - 0.3, 0, 0); FP.body.rotation.x = lerp(-0.08 * w, 0.18, s); }
      else if (P.combo === 2) { swordArm.rotation.set(-1.45, 0, s > 0 ? lerp(1.35, -1.25, s) : lerp(0.3, 1.35, w)); FP.sword.rotation.set(Math.PI - 0.15, 0, 0); FP.body.rotation.y = s > 0 ? lerp(0.5, -0.55, s) : lerp(0, 0.5, w); }
      else { swordArm.rotation.set(-1.5, 0, 0.9); FP.sword.rotation.set(Math.PI - 0.2, 0, 0); FP.body.rotation.y = s > 0 ? -s * Math.PI * 2 : w * 0.4; FP.body.position.y += Math.sin(s * Math.PI) * 0.25; }
      if (W8.m === 'gloves' && !P.rspin) { const k = Math.sin(Math.min(1, tt) * Math.PI), arm = P.hand === 2 ? gunArm : swordArm, oth = P.hand === 2 ? swordArm : gunArm; arm.rotation.set(-0.5 - k * 1.15, 0, (P.hand === 2 ? -0.12 : 0.12)); oth.rotation.set(-0.9, 0, P.hand === 2 ? 0.25 : -0.25); FP.body.rotation.y = (P.hand === 2 ? 0.28 : -0.28) * k; FP.body.rotation.x = 0.05 * k; }
      // hit window
      if (tt > wf + 0.05 && tt < 0.95) for (const d of aliveD()) {
        if (P.hitSet.has(d)) continue; const dx = d.x - P.x, dz = d.z - P.z, dist = Math.hypot(dx, dz);
        let a2 = Math.atan2(dx, dz) - P.face; a2 = Math.atan2(Math.sin(a2), Math.cos(a2));
        if (dist < T.reach * WM().reach + 0.5 && Math.abs(a2) < (P.combo === 3 || P.pow > 0.6 ? 3.3 : T.arc * (W8.m === 'spear' ? 0.6 : 1))) { P.hitSet.add(d); const big = P.combo === 3 && W8.m !== 'gloves'; hitDummy(d, Math.round(T.swordDmg * WM().dmg * (WEAR.gauntlets ? 1.1 : 1) * (big && !P.rspin ? T.finisher : 1) * (P.rmul || 1) * (P.pow ? 1.6 + 1.4 * P.pow : 1)), P, 'sword', big || P.pow > 0); if (P.pow > 0.5) St.shake = Math.max(St.shake, 0.3 + P.pow * 0.4); St.hitStop = T.hitStop * (big ? 1.6 : 1); }
      }
      if (tt > wf + 0.05 && tt < 0.95) {
        for (const c of crates) { if (c.down > 0 || P.hitSet.has(c)) continue; const dx = c.x - P.x, dz = c.z - P.z, dist = Math.hypot(dx, dz); let a2 = Math.atan2(dx, dz) - P.face; a2 = Math.atan2(Math.sin(a2), Math.cos(a2)); if (dist < T.reach * WM().reach + 0.8 && Math.abs(a2) < (P.combo === 3 ? 3.3 : T.arc)) { P.hitSet.add(c); if (WM().breaks) breakCrate(c); else { popup(v3.set(c.x, 1.8, c.z), 'CLANK', '#9ca3af'); audio.tone(900, 0.05, 0.05, 'square'); } } }
        if (W8.m === 'racket') for (const b of bolts) { if (!b.enemy) continue; const dx = b.m.position.x - P.x, dz = b.m.position.z - P.z, dist = Math.hypot(dx, dz); let a2 = Math.atan2(dx, dz) - P.face; a2 = Math.atan2(Math.sin(a2), Math.cos(a2)); if (dist < T.reach + 0.9 && (P.rspin || Math.abs(a2) < T.arc + 0.3)) reflect(b); }
      }
      if (P.swing <= 0) { St.lastCombo = P.combo; P.beatAt = St.t; if (P.comboT > 0 && !P.pow && P.combo < 3) audio.tone(1250, 0.035, 0.035, 'square'); }
    }
    // gun pose
    if (aiming || P.fireCd > 0) { gunArm.rotation.x = -1.48 - P.recoil * 0.35; gunArm.rotation.z = -0.08; FP.gun.rotation.set(1.43 - P.recoil * 0.5, 0, 0); FP.gun.position.z = 0.1 - P.recoil * 0.06; }
    else FP.gun.position.z = 0.1;
    if (c1 >= 0 && P.swing <= 0) { swordArm.rotation.set(-2.7, 0, 0.6 + Math.sin(St.t * 30) * 0.03 * (c1 + 0.2)); FP.sword.rotation.set(Math.PI - 0.3, 0, 0); FP.body.position.y -= 0.08; if (c1 >= 1 && !CH.full1) { CH.full1 = true; audio.tone(990, 0.12, 0.05, 'triangle', 1.5); burst(v3.set(P.x, 1.6, P.z), 8, 2); } }
    if (c2 >= 1 && !CH.full2) { CH.full2 = true; audio.tone(1320, 0.12, 0.05, 'triangle', 1.5); }
    chargeGlow.visible = c1 > 0 || c2 > 0; if (chargeGlow.visible) { const c = Math.max(c1, c2), host = c1 > 0 ? FP.sword : FP.gun; if (chargeGlow.parent !== host) host.add(chargeGlow); chargeGlow.position.set(0, c1 > 0 ? 0.7 : 0.16, c1 > 0 ? 0 : 0.7); chargeGlow.scale.setScalar(0.4 + c * 1.4 + (c >= 1 ? Math.sin(St.t * 24) * 0.15 : 0)); chargeGlow.material.color.set(c >= 1 ? 0xffd23a : 0xffffff); }
    if (P.slam) { swordArm.rotation.set(-3.0, 0, 0.1); FP.sword.rotation.set(Math.PI - 0.3, 0, 0); FP.body.rotation.x = -0.25; }
    { const since = St.t - (P.beatAt ?? -9), inSwing = P.swing > 0 && !P.pow && P.combo < 3, win = P.comboT > 0 && since >= 0 && since < BEAT() * 1.2 && !P.pow && St.lastCombo < 3;
      ring.position.set(P.x, 0.04, P.z); if (inSwing) { const k = P.swing / P.swingDur; ring.scale.setScalar(0.6 + 1.7 * k); ring.material.opacity = 0.55; ring.material.color.set(k * P.swingDur < BEAT() ? 0xffd23a : 0xffffff); } else if (win) { ring.scale.setScalar(0.6); ring.material.opacity = 0.9; ring.material.color.set(0xffd23a); } else ring.material.opacity = Math.max(0, ring.material.opacity - rdt * 4); }
    shockT += dt; shock.visible = shockT < 0.4; if (shock.visible) { shock.scale.setScalar(0.5 + shockT * 10); shock.material.opacity = 1 - shockT / 0.4; }
    P.recoil = damp(P.recoil, 0, 14, dt); flash.material.opacity = damp(flash.material.opacity, 0, 22, dt);
    if (HERO === 'noble') nobleUpdate(dt, hs); if (HERO === 'hope') hopeUpdate(dt, hs); HK.update(dt);
    // trail
    bladeWorld();
    trailPts.unshift({ b: swordBase.clone(), t: swordTip.clone(), on: P.swing > 0 && T.trail > 0.5 }); if (trailPts.length > TR) trailPts.pop();
    for (let i = 0; i < TR; i++) { const p = trailPts[i] || trailPts[trailPts.length - 1]; const a = p && p.on ? (1 - i / TR) * 0.75 : 0; trailPos.set([p.b.x, p.b.y, p.b.z], i * 6); trailPos.set([p.t.x, p.t.y, p.t.z], i * 6 + 3); trailCol.set([0.35, 0.85, 1, a * 0.2], i * 8); trailCol.set([0.75, 0.97, 1, a], i * 8 + 4); }
    trailGeo.attributes.position.needsUpdate = true; trailGeo.attributes.color.needsUpdate = true;
    // bolts
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i]; b.life -= dt;
      if (b.target && b.target.root.visible && T.homing > 0) { v4.set(b.target.x, 1.2, b.target.z).sub(b.m.position).normalize().multiplyScalar(b.spd || T.boltSpeed); b.v.lerp(v4, Math.min(1, dt * (b.homeK || T.homing))); }
      b.m.position.addScaledVector(b.v, dt); b.m.lookAt(v5.copy(b.m.position).add(b.v)); if (b.m.position.y < 0.05) b.life = -1;
      if (b.kind === 'scatter') { const k = Math.min(1, b.life / 0.1); b.m.scale.set(k, k, 1); }
      if (b.enemy && HERO === 'hope') { const dd = Math.hypot(b.m.position.x - P.x, b.m.position.z - P.z); if (HO.shield && dd < 1.25) reflect(b); else if (!b.sensed && dd < b.v.length() * 0.45) { b.sensed = true; St.senseT = 0.5; audio.tone(1980, 0.08, 0.05, 'sine', 1); HK.wave(v3.set(P.x, 0, P.z), 1.3, 0xffffff, 0.3); popup(v3.set(P.x, 3.0, P.z), 'SENSE', '#7dd3fc'); } }
      if (b.enemy) { if (Math.hypot(b.m.position.x - P.x, b.m.position.z - P.z) < 0.6 && b.m.position.y > P.y + 0.2 && b.m.position.y < P.y + 2) { hurtPlayer(8); b.life = -1; } if (b.life < 0) { burst(b.m.position, 5, 2); scene.remove(b.m); bolts.splice(i, 1); } continue; }
      let hit = null; for (const d of aliveD()) { if (!(b.hs && b.hs.has(d)) && Math.hypot(b.m.position.x - d.x, b.m.position.z - d.z) < 0.55 * (b.big || 1) && b.m.position.y > 0.4 && b.m.position.y < 2.2) { hit = d; break; } }
      if (hit) { onImpact(b, hit); if (b.hs) { b.hs.add(hit); St.hitStop = 0.06; } }
      if ((hit && !b.hs) || b.life < 0) { if (!hit) { if (b.kind === 'staff' || b.kind === 'rocket') onImpact(b, null); else burst(b.m.position, 4, 2); } scene.remove(b.m); bolts.splice(i, 1); }
    }
    for (let i = booms.length - 1; i >= 0; i--) { const o = booms[i]; o.t += dt; const k = o.t / 0.35; o.m.scale.setScalar(0.3 + k * o.r); o.m.material.opacity = Math.max(0, 0.8 * (1 - k)); if (k >= 1) { scene.remove(o.m); booms.splice(i, 1); } }
    for (let i = fires.length - 1; i >= 0; i--) { const f = fires[i]; f.t -= dt; f.tick -= dt; f.fl.forEach((s, j) => { s.scale.setScalar(0.7 + 0.35 * Math.sin(St.t * 14 + j * 2)); s.material.opacity = Math.min(1, f.t) * 0.9; }); f.disc.material.opacity = Math.min(1, f.t) * 0.45;
      if (f.tick <= 0) { f.tick = 0.5; for (const d of aliveD()) if (Math.hypot(d.x - f.x, d.z - f.z) < 1.6) hitDummy(d, 3, { x: f.x, z: f.z }, 'laser', false); if (Math.hypot(P.x - f.x, P.z - f.z) < 1.6 && P.y < 0.6) hurtPlayer(3); }
      if (f.t <= 0) { scene.remove(f.g); fires.splice(i, 1); } }
    for (let i = debris.length - 1; i >= 0; i--) { const o = debris[i]; o.t -= dt; o.v.y -= 20 * dt; o.m.position.addScaledVector(o.v, dt); if (o.m.position.y < 0.08) { o.m.position.y = 0.08; o.v.multiplyScalar(0.5); o.v.y = Math.abs(o.v.y) * 0.3; } o.m.rotation.x += dt * 6; o.m.rotation.z += dt * 4; if (o.t <= 0) { scene.remove(o.m); debris.splice(i, 1); } }
    for (const c of crates) if (c.down > 0) { c.down -= dt; if (c.down <= 0) c.g.visible = true; }
    // dummies spring
    for (const d of dummies) {
      if (d.slowT > 0) d.slowT -= dt;
      if (d.stars) { if (d.stunT > 0) { d.stunT -= dt; d.stars.userData.tick(dt); d.vx *= 0.85; d.vz *= 0.85; if (d.stunT <= 0) popup(v3.set(d.x, 2.9, d.z), 'AWAKE', '#9ca3af'); } d.stars.visible = d.stunT > 0; }
      if (d.tripT > 0) d.tripT -= dt; if (d.confT > 0) d.confT -= dt; if (d.brkT > 0) d.brkT -= dt;
      if (d.outT > 0 || d.mark) { if (!d.mark) { d.mark = HK.makeMarker(); d.mark.position.y = 1.15; d.root.add(d.mark); } d.outT = Math.max(0, (d.outT || 0) - dt); d.mark.visible = d.outT > 0 && d.root.visible; if (d.mark.visible) d.mark.quaternion.copy(camera.quaternion); }
      d.chill = Math.max(0, d.chill - dt * 0.08); if (d.frozen > 0) { d.frozen -= dt; d.vx = d.vz = 0; if (d.frozen <= 0) { popup(v3.set(d.x, 2.9, d.z), 'THAWED', '#bfefff'); } } d.iceBlock.visible = d.frozen > 0;
      if (d.moving) { d.t += dt * (d.slowT > 0 ? 0.5 : 1) * (1 - d.chill) * (d.frozen > 0 || d.stunT > 0 ? 0 : 1); d.x = Math.sin(d.t * 0.7) * 8; d.z = -16 + Math.cos(d.t * 0.45) * 3; d.root.position.set(d.x, 0, d.z); }
      d.vx += -d.ax * 60 * dt - d.vx * 6 * dt; d.vz += -d.az * 60 * dt - d.vz * 6 * dt; d.ax += d.vx * dt; d.az += d.vz * dt;
      d.sway.rotation.set(d.az * 0.6, d.stunT > 0 ? Math.sin(St.t * 7) * 0.18 : 0, -d.ax * 0.6 + (d.stunT > 0 ? Math.sin(St.t * 5) * 0.06 : 0)); d.flash = Math.max(0, d.flash - dt); d.mats.forEach(m => d.flash > 0 ? m.emissive.setScalar(0.8) : d.outT > 0 ? m.emissive.setRGB(0.04, 0.28, 0.42) : m.emissive.setScalar(0));
      if (d.tripT > 0) d.sway.rotation.x += Math.min(0.4, d.tripT) * 1.2; if (d.confT > 0) { d.sway.rotation.z += Math.sin(St.t * 9 + d.x) * 0.14; d.sway.rotation.y += Math.sin(St.t * 4) * 0.4; }
      if (d.down > 0) { d.down -= dt; d.sway.rotation.x = Math.min(1.45, (d.downR = (d.downR || 0) + dt * 6)); if (d.down <= 0) { d.downR = 0; d.hp = d.max; d.f50 = d.f20 = false; clearIce(d); } }
      d.bar.visible = d.hp < d.max && !(d.down > 0) && d.root.visible; if (d.bar.visible) { d.bar.quaternion.copy(camera.quaternion); const k = d.hp / d.max; d.bf.scale.x = Math.max(0.001, k); d.bf.position.x = -0.47 * (1 - k); }
    }
    // fx
    for (let i = 0; i < sparkN; i++) { const s = sparkV[i]; if (s.life <= 0) continue; s.life -= dt; s.v.y -= 14 * dt; sparkArr[i * 3] += s.v.x * dt; sparkArr[i * 3 + 1] += s.v.y * dt; sparkArr[i * 3 + 2] += s.v.z * dt; if (s.life <= 0 || sparkArr[i * 3 + 1] < 0) { s.life = 0; sparkArr[i * 3 + 1] = -999; } }
    sparkGeo.attributes.position.needsUpdate = true;
    for (let i = popups.length - 1; i >= 0; i--) { const p = popups[i]; p.t += dt; p.s.position.y += dt * 1.2; p.s.material.opacity = 1 - smooth(0.5, 0.9, p.t); if (p.t > 0.9) { scene.remove(p.s); p.s.material.map.dispose(); popups.splice(i, 1); } }
    { const rt = SC.on ? null : P.target; reticle.visible = !!rt; if (rt) { reticle.position.set(rt.x, 1.2, rt.z); reticle.lookAt(camera.position); reticle.material.color.set(SC.on ? 0xffd23a : 0xec3013); } }
    // camera
    let tx = P.x, tz = P.z; if (P.target && St.lockOn) { tx = lerp(P.x, P.target.x, 0.25); tz = lerp(P.z, P.target.z, 0.25); }
    // phones: 25% further out, a little higher, and the view leads ahead of the fox so you see where it is going
    const mob = (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches) || container.clientWidth < 900, cDist = T.camDist * (mob ? 1.25 : 1) * (mob && container.clientHeight > container.clientWidth ? 1.2 : 1), cPit = Math.min(1.2, St.pitch + (mob ? 0.09 : 0));
    if (mob && !(P.target && St.lockOn)) { const lead = 2.6 + Math.min(2, Math.hypot(P.vx, P.vz) * 0.25); tx += Math.sin(P.face) * lead; tz += Math.cos(P.face) * lead; }
    if (!St.eyeHeld) { St.eyeY = damp(St.eyeY || 0, 0, 14, rdt); St.eyeP = damp(St.eyeP || 0, 0, 14, rdt); }
    const eY = St.yaw + (St.eyeY || 0), eP = clamp(cPit + (St.eyeP || 0), 0.03, 1.35);
    const fr = (SC.on || SC.exec) && SC.target && SC.target.root.visible ? SC.target : null;
    v3.set(tx + Math.sin(eY) * Math.cos(eP) * cDist, 1.6 + Math.sin(eP) * cDist, tz + Math.cos(eY) * Math.cos(eP) * cDist);
    if (!fr) { camPos.x = damp(camPos.x, v3.x, T.camFollow, rdt); camPos.y = damp(camPos.y, v3.y, T.camFollow, rdt); camPos.z = damp(camPos.z, v3.z, T.camFollow, rdt);
    camLook.x = damp(camLook.x, tx, T.camFollow + 3, rdt); camLook.y = damp(camLook.y, 1.5, T.camFollow + 3, rdt); camLook.z = damp(camLook.z, tz, T.camFollow + 3, rdt); }
    // SCOPE FRAMING: close on the target, its whole body inside the clear band above the CALLED SHOTS panel (and below the key hints)
    if (fr) { const Hh = H(), Ww = W(), top = SC.on ? 16 : 24; let bot = SC.on ? 250 : 24, left = 0; if (SC.on) { const pe = document.getElementById('scopePanel'), ps = document.getElementById('scopeSide'); if (pe) { const cr = container.getBoundingClientRect(), pr = pe.getBoundingClientRect(); bot = Math.max(0, cr.bottom - pr.top) + 12; } else if (ps) { const cr = container.getBoundingClientRect(), pr = ps.getBoundingClientRect(); left = Math.max(0, pr.right - cr.left); bot = 24; } } St.hOffW = left; const band = Math.max(120, Hh - top - bot), vfov = camera.fov * Math.PI / 180;
      // straight-on close-up: camera in front of the target (on the side facing you), its full height filling the band with ~7% padding top + bottom
      if (!fr.hgt) { const bb = new THREE.Box3(), tb = new THREE.Box3(); fr.root.updateMatrixWorld(true); fr.root.traverse(o => { if (o.isMesh && o.geometry && o.material !== outlineMat && o.visible) { o.geometry.computeBoundingBox(); tb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); bb.union(tb); } }); fr.hgt = clamp(bb.max.y - Math.max(0, bb.min.y), 1, 6); }
      const Ho = fr.hgt, cy = Ho / 2, D = clamp(Ho * 1.15 * Hh / (2 * Math.tan(vfov / 2) * band), 1.6, 18), ux = P.x - fr.x, uz = P.z - fr.z, ul = Math.hypot(ux, uz) || 1, a = Math.atan2(ux / ul, uz / ul);
      v3.set(fr.x + Math.sin(a) * D, cy, fr.z + Math.cos(a) * D);
      if (St.scT !== fr) { St.scT = fr; camPos.lerp(v3, 0.6); camLook.set(fr.x, cy, fr.z); }
      camPos.x = damp(camPos.x, v3.x, 10, rdt); camPos.y = damp(camPos.y, v3.y, 10, rdt); camPos.z = damp(camPos.z, v3.z, 10, rdt);
      camLook.x = damp(camLook.x, fr.x, 14, rdt); camLook.y = damp(camLook.y, cy, 14, rdt); camLook.z = damp(camLook.z, fr.z, 14, rdt);
      St.band = { top, bot, left, Ww, Hh };
      const want = Hh / 2 - (top + band / 2); St.vOff = damp(St.vOff || 0, want, 8, rdt); St.hOff = damp(St.hOff || 0, -left / 2, 8, rdt);
    } else { St.scT = null; St.band = null; St.vOff = damp(St.vOff || 0, 0, 8, rdt); St.hOff = damp(St.hOff || 0, 0, 8, rdt); }
    if (Math.abs(St.vOff) > 0.5 || Math.abs(St.hOff || 0) > 0.5) camera.setViewOffset(W(), H(), St.hOff || 0, St.vOff, W(), H()); else if (camera.view && camera.view.enabled) camera.clearViewOffset();
    St.shake = Math.max(0, St.shake - rdt * 1.5); const sh = fr && SC.on ? 0 : St.shake;
    camera.position.set(camPos.x + rr(-sh, sh) * 0.3, camPos.y + rr(-sh, sh) * 0.3, camPos.z + rr(-sh, sh) * 0.3); camera.lookAt(camLook);
    // POV: eyes of the fighter; the body is hidden, the stick still moves you (camera yaw follows the way you face)
    if (St.pov && !SC.on && !SC.exec) { let dy = (P.face + Math.PI) - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, rdt * 10); fox.visible = noble.visible = hope.visible = false;
      const hy = (HERO === 'noble' ? 1.35 : 1.62) + P.y, fa = P.face + (St.eyeY || 0), pa = -(St.eyeP || 0) * 0.9 - 0.06; camera.position.set(P.x + Math.sin(P.face) * 0.25, hy, P.z + Math.cos(P.face) * 0.25); camera.lookAt(camera.position.x + Math.sin(fa) * Math.cos(pa) * 10, hy + Math.sin(pa) * 10, camera.position.z + Math.cos(fa) * Math.cos(pa) * 10); }
    if (camera.fov !== T.fov) { camera.fov = T.fov; camera.updateProjectionMatrix(); }
    sun.target.position.set(P.x, 0, P.z); sun.position.set(P.x + 8, 16, P.z + 10);
    // hud
    hudT -= rdt;
    if (hudT < 0) { hudT = 0.1; St.dmgLog = St.dmgLog.filter(([t]) => St.t - t < 5); const dps = St.dmgLog.reduce((a, [, d]) => a + d, 0) / 5; St.best = Math.max(St.best, dps);
      const st = SC.target, sd = st ? Math.hypot(st.x - P.x, st.z - P.z) : 0;
      const scope = SC.on || SC.exec ? { on: SC.on, exec: !!SC.exec, target: st ? 'DUMMY ' + (dummies.indexOf(st) + 1) : null, dist: Math.round(sd), inRange: !!st && sd <= RANGE, sweet: !!st && Math.abs(sd - OPT) < RANGE * 0.15, zones: ZONES.map(z => ({ key: z.key, name: z.name, col: z.col, line: z.line, pct: Math.round(zoneChance(st, z) * 100) })), queue: SC.queue.map(z => z.name), cost: T.energyCost, count: scopeList().length } : null;
      let nd = 999; for (const d of aliveD()) nd = Math.min(nd, Math.hypot(d.x - P.x, d.z - P.z));
      const hud = { hero: HERO, hm: HO.m, hr: HO.r, hstreak: HO.streak, nm: N.m, nr: N.r, nshoe: !!N.shoe, nhover: N.hovering, nd: Math.round(nd), laserR: RANGE, inv: { ...INV }, wear: { ...WEAR }, pep: Math.ceil(P.pepT || 0), wm: W8.m, wr: W8.r, two: HERO !== 'player' ? false : !!WM().two, turret: !!St.turret, hp: Math.round(P.hp), ch1: c1 >= 0 ? Math.round(c1 * 20) / 20 : -1, ch2: c2 >= 0 ? Math.round(c2 * 20) / 20 : -1, rhythm: P.rhythm || 0, flick: flickOn, scope, en: Math.round(P.en), combo: P.combo, hits: St.hits, dps: Math.round(dps), best: Math.round(St.best), slow: St.slow < 1, lock: St.lockOn, moving: St.moving };
      const k = JSON.stringify(hud); if (k !== hudKey) { hudKey = k; onState(hud); } }
  }
  function fire(c = 0) {
    const R = WR(); if (!R) return;
    if (P.fireCd > 0) { P.fireQ = c; return; }
    const cost = T.energyCost * R.cost * (c > 0 ? 1 + 2 * c : 1);
    if (P.en < cost) { audio.tone(160, 0.08, 0.04, 'square'); P.fireCd = 0.25; return; }
    P.en -= cost; P.enT = 0.4; P.fireCd = 1 / (T.fireRate * R.rate); P.recoil = T.recoil * (1 + c * 1.5) * (W8.r === 'rocket' ? 2.5 : W8.r === 'scatter' ? 1.6 : 1); flash.material.opacity = 1; flash.material.color.set(R.col);
    if (c > 0 || W8.r === 'rocket') St.shake = Math.max(St.shake, 0.2 + c * 0.3);
    const t = P.target || pickTarget(); if (t) P.face = Math.atan2(t.x - P.x, t.z - P.z);
    fox.rotation.y = P.face; fox.updateMatrixWorld(true); v3.set(0, 0.16, W8.r === 'rocket' ? 0.8 : 0.7); FP.gun.localToWorld(v3);
    const dir = (t ? v4.set(t.x, 1.2, t.z).sub(v3) : v4.set(Math.sin(P.face), 0, Math.cos(P.face))).normalize().clone();
    const mul = c > 0 ? 1 + 1.5 * c : 1, base = T.laserDmg * R.dmg * mul;
    const shoot = (d, o) => { const mm = new THREE.Mesh(o.geo || boltGeo, o.mat || boltMat); mm.position.copy(v3); scene.add(mm); if (o.scale) mm.scale.setScalar(o.scale); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: o.col ?? R.col, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); gl.scale.setScalar(o.glow || 0.9); mm.add(gl);
      bolts.push({ m: mm, v: d.clone().multiplyScalar(o.speed || T.boltSpeed), life: o.life || 1.4, target: o.home === false ? null : t, dmg: Math.max(1, Math.round(base)), hs: o.pierce ? new Set() : null, big: o.big || 1, kind: W8.r }); };
    if (W8.r === 'laser') shoot(dir, { scale: c > 0 ? 1 + 2.2 * c : 1, col: c > 0 ? 0xffd23a : R.col, pierce: c > 0, big: c > 0 ? 1 + c : 1 });
    else if (W8.r === 'staff') shoot(dir, { geo: fireGeo, mat: fireMat, speed: T.boltSpeed * 0.45, glow: 1.6, scale: mul, life: 2.2 });
    else if (W8.r === 'scatter') { burst(v3, 10, 5); flash.scale && flash.scale.setScalar(1.6); for (let i = -2; i <= 2; i++) { const an = i * 0.07 + rr(-0.02, 0.02), cs = Math.cos(an), sn = Math.sin(an); shoot(new THREE.Vector3(dir.x * cs - dir.z * sn, dir.y, dir.x * sn + dir.z * cs), { geo: pelletGeo, mat: pelletMat, col: 0x5fe3ff, home: false, life: 0.3, speed: T.boltSpeed * 0.75, glow: 1.1, scale: mul > 1 ? 1.4 : 1 }); } }
    else if (W8.r === 'ice') shoot(dir, { geo: iceGeo, mat: iceMat, speed: T.boltSpeed * 0.8, glow: 0.8, scale: mul });
    else shoot(dir, { geo: rocketGeo, mat: rocketMat, speed: T.boltSpeed * 0.42, glow: 1.2, life: 2.5, scale: mul });
    const snd = { laser: [1500, 0.12, 'sawtooth'], staff: [380, 0.25, 'triangle'], scatter: [900, 0.1, 'square'], ice: [2200, 0.1, 'sine'], rocket: [140, 0.4, 'sawtooth'] }[W8.r];
    audio.tone(snd[0], snd[1], 0.05, snd[2], 0.35); if (W8.r === 'scatter' || W8.r === 'rocket') audio.burst(0.18, W8.r === 'rocket' ? 500 : 2000, 0.16);
  }
  function boom(p, r, col) { const mm = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); mm.position.copy(p).setY(Math.max(0.3, p.y)); scene.add(mm); booms.push({ m: mm, t: 0, r }); burst(mm.position, 22, 7); audio.burst(0.3, 400, 0.3); audio.tone(90, 0.3, 0.06, 'square', 0.5); }
  function makeFire(x, z) { const g = new THREE.Group(); g.position.set(x, 0.05, z); scene.add(g); const disc = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), new THREE.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })); disc.rotation.x = -Math.PI / 2; g.add(disc);
    const fl = []; for (let i = 0; i < 6; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: i % 2 ? 0xffb347 : 0xff5a1a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); const a = i / 6 * Math.PI * 2; s.position.set(Math.cos(a) * 0.8, 0.5, Math.sin(a) * 0.8); g.add(s); fl.push(s); } return { g, disc, fl, x, z, t: 3, tick: 0.2 }; }
  function onImpact(b, hit) { const p = b.m.position, k = b.kind || 'laser';
    if (k === 'staff') { if (hit) hitDummy(hit, b.dmg, P, 'laser', false); boom(p, 1.4, 0xff7a1a); for (const d of aliveD()) if (d !== hit && Math.hypot(d.x - p.x, d.z - p.z) < 1.4) hitDummy(d, Math.round(b.dmg / 2), P, 'laser', false); return; }
    if (k === 'echo') { if (hit) hopeHit(hit, b.dmg, false); else burst(p, 4, 2); return; }
    if (k === 'mini') { if (hit) hitDummy(hit, b.dmg, P, 'laser', true); boom(p, 1.6, 0xffb347); for (const d of aliveD()) if (d !== hit && Math.hypot(d.x - p.x, d.z - p.z) < 1.6) hitDummy(d, Math.round(b.dmg / 2), P, 'laser', false); St.shake = Math.max(St.shake, 0.35); return; }
    if (k === 'rocket') { if (hit) hitDummy(hit, b.dmg, P, 'laser', true); boom(p, 3, 0xffb347); for (const d of aliveD()) if (d !== hit && Math.hypot(d.x - p.x, d.z - p.z) < 3) hitDummy(d, Math.round(b.dmg / 2), P, 'laser', true); fires.push(makeFire(p.x, p.z)); St.shake = Math.max(St.shake, 0.6); return; }
    if (!hit) return; hitDummy(hit, b.dmg || T.laserDmg, P, 'laser', !!b.hs); if (k === 'ice') iceHit(hit); }
  function iceHit(d) { d.chill = Math.min(0.75, d.chill + 0.15); d.slowT = Math.max(d.slowT || 0, 1.5);
    if (d.icicles.length < 10) { const ic = new THREE.Mesh(icicleGeo, iceMat), a = Math.atan2(P.x - d.x, P.z - d.z) + rr(-0.7, 0.7); ic.position.set(Math.sin(a) * 0.4, 0.95 + rr(0, 0.55), Math.cos(a) * 0.4); ic.rotation.y = a + Math.PI; d.sway.add(ic); d.icicles.push(ic); }
    if (d.hp > 0 && !d.f50 && d.hp <= d.max * 0.5) { d.f50 = true; freeze(d); } else if (d.hp > 0 && !d.f20 && d.hp <= d.max * 0.2) { d.f20 = true; freeze(d); } }
  function freeze(d) { d.frozen = 5; popup(v3.set(d.x, 3.0, d.z), 'FROZEN', '#9ff3ff'); audio.tone(2600, 0.3, 0.05, 'sine', 0.3); burst(v3.set(d.x, 1.2, d.z), 16, 3); }
  function clearIce(d) { d.icicles.forEach(ic => d.sway.remove(ic)); d.icicles = []; d.chill = 0; d.frozen = 0; d.iceBlock.visible = false; }
  function breakCrate(c) { c.down = 4; c.g.visible = false; St.shake = Math.max(St.shake, 0.5); St.hitStop = 0.1; audio.burst(0.3, 700, 0.25); audio.tone(150, 0.2, 0.06, 'square', 0.6); popup(v3.set(c.x, 1.9, c.z), 'SMASH', '#ffd23a');
    for (let i = 0; i < 10; i++) { const mm = new THREE.Mesh(new THREE.BoxGeometry(rr(0.15, 0.35), rr(0.08, 0.2), rr(0.15, 0.4)), toon(i % 3 ? '#9a6b3c' : '#6b4a2c')); mm.position.set(c.x + rr(-0.4, 0.4), rr(0.3, 1), c.z + rr(-0.4, 0.4)); scene.add(mm); debris.push({ m: mm, v: new THREE.Vector3(rr(-4, 4), rr(3, 7), rr(-4, 4)), t: 1.4 }); } }
  function enemyShot(d) { const mm = new THREE.Mesh(enemyGeo, enemyMat); mm.position.set(d.x, 1.3, d.z); scene.add(mm); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff3b3b, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); gl.scale.setScalar(1.1); mm.add(gl); const v = new THREE.Vector3(P.x - d.x, P.y + 1.1 - 1.3, P.z - d.z).normalize().multiplyScalar(8); bolts.push({ m: mm, v, life: 5, enemy: true, target: null }); audio.tone(300, 0.12, 0.04, 'square'); }
  function reflect(b) { b.enemy = false; b.kind = 'refl'; let best = null, bd = 1e9; for (const d of aliveD()) { const dd = Math.hypot(d.x - b.m.position.x, d.z - b.m.position.z); if (dd < bd) { bd = dd; best = d; } } b.target = best; const tp = best ? v4.set(best.x, 1.2, best.z) : v4.set(b.m.position.x - b.v.x, b.m.position.y, b.m.position.z - b.v.z); b.v.copy(tp.sub(b.m.position).normalize().multiplyScalar(22)); b.dmg = Math.round(T.laserDmg * 1.5); b.life = 2; b.m.material = reflMat; b.m.children[0] && b.m.children[0].material.color.set(0xffd23a); popup(v3.set(P.x, 2.8, P.z), 'RETURN!', '#ffd23a'); audio.tone(1000, 0.08, 0.05, 'triangle', 1.5); St.hitStop = 0.05; }
  function hurtPlayer(n) { if (HERO === 'hope' && (P.dash > 0 || St.perfect > 0)) { popup(v3.set(P.x, 2.8, P.z), 'PERFECT', '#7dd3fc'); St.hitStop = 0.08; return; } if (WEAR.armor) n = Math.max(1, Math.round(n * 0.85)); P.hp = Math.max(0, P.hp - n); P.hurtT = 2; popup(v3.set(P.x, 2.6, P.z), '-' + n, '#ec3013'); St.shake = Math.max(St.shake, 0.3); audio.tone(160, 0.12, 0.05, 'square'); }
  const chargeGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); chargeGlow.visible = false;
  function rhythm131(now) { const n = INP.length; if (n < 2) return false; const a = INP[n - 2], b = INP[n - 1]; if (a.k !== '1' || b.k !== '3') return false; const g1 = b.t - a.t, g2 = now - b.t; return g1 > 0.1 && g1 < 0.95 && g2 > 0.1 && g2 < 0.95; }
  function skySplit() { P.slam = true; P.vy = -24; P.swing = 0; P.queued = false; popup(v3.set(P.x, 3.4, P.z), 'SKY SPLITTER', '#ffd23a'); audio.tone(660, 0.1, 0.05, 'triangle', 2.2); }
  function slamLand() { P.slam = false; shockT = 0; shock.position.set(P.x, 0.06, P.z); St.shake = Math.max(St.shake, 0.8); St.hitStop = 0.14; burst(v3.set(P.x, 0.2, P.z), 30, 9); audio.burst(0.35, 300, 0.3); audio.tone(110, 0.3, 0.07, 'square', 0.5);
    for (const d of aliveD()) { const dd = Math.hypot(d.x - P.x, d.z - P.z); if (dd < 4) hitDummy(d, Math.round(T.swordDmg * 2.4 * WM().dmg), P, 'sword', true); }
    P.combo = 1; P.swingDur = 0.25; P.swing = 0.06; P.hitSet = new Set(aliveD()); P.comboT = 0.3; P.rhythm = 0; }
  function powerHit(c) { P.pow = Math.max(0.15, c); P.rmul = 1; P.rhythm = 0; P.combo = 3; P.rspin = false; P.hand = 1; P.swingDur = (T.windup * 0.4 + T.swingTime) * 1.3 / Math.min(2, WM().spd); P.swing = P.swingDur; P.comboT = P.swingDur; P.hitSet = new Set(); P.queued = false;
    audio.burst(0.22, 1600, 0.16); if (c >= 1) popup(v3.set(P.x, 3.2, P.z), 'MAX POWER', '#ffd23a');
    const t = P.target || pickTarget(); if (t) { const d = Math.hypot(t.x - P.x, t.z - P.z); if (d < T.lunge * 1.6 + T.reach) { P.face = Math.atan2(t.x - P.x, t.z - P.z); if (d > T.reach * 0.7) { P.ldx = Math.sin(P.face); P.ldz = Math.cos(P.face); P.lungeT = 0.14; P.lsp = Math.min(40, (d - T.reach * 0.65) / 0.14); } } } }
  // ---------- NOBLE'S WEAPONS ----------
  const nMul = () => (WEAR.gauntlets ? 1.1 : 1) * (P.pepT > 0 ? 1 : 1);
  const faceTarget = () => { const t = P.target || pickTarget(); if (t) P.face = Math.atan2(t.x - P.x, t.z - P.z); return t; };
  function stunDummy(d, s) { if (!d.stars) { d.stars = NK.makeStars(0.42); d.stars.position.y = 2.35; d.root.add(d.stars); } d.stunT = Math.max(d.stunT || 0, s); d.stars.visible = true; popup(v3.set(d.x, 2.9, d.z), 'STUNNED ' + s + ' s', '#ffd23a'); }
  function nobleMelee() {
    if (N.act || N.cd > 0 || P.slam) return; const W = NOBLE_MELEE[N.m], t = faceTarget();
    N.act = { k: N.m, t: 0, dur: W.dur, cd: W.cd, hs: new Set() }; NW.play(N.m, W.dur, { radius: T.reach + 0.5 });
    if (N.m === 'spike') { audio.tone(900, 0.06, 0.04, 'square'); audio.burst(0.3, 1800, 0.14); }
    else if (N.m === 'ram') { P.ldx = Math.sin(P.face); P.ldz = Math.cos(P.face); P.lungeT = 0.3; P.lsp = t ? clamp((Math.hypot(t.x - P.x, t.z - P.z) - 1.1) / 0.3, 4, 15) : 12; audio.tone(260, 0.2, 0.06, 'sawtooth', 2); audio.burst(0.25, 900, 0.12); }
    else { audio.tone(196, 0.45, 0.09, 'sawtooth', 0.7); audio.tone(247, 0.45, 0.06, 'square', 0.7); St.shake = Math.max(St.shake, 0.25);
      let n = 0; for (const d of aliveD()) if (Math.hypot(d.x - P.x, d.z - P.z) < T.reach + 0.5) { stunDummy(d, stunSeconds({ height: 2.1 })); n++; } if (!n) popup(v3.set(P.x, 2.8, P.z), 'HONK', '#ffd23a'); }
  }
  function nobleSpin(c = 1) {
    if (N.act || P.slam) return; const H = NOBLE_HOLDS.spin; N.cd = 0; N.act = { k: 'spin', t: 0, dur: HO.dur, cd: 0.5, hs: new Set(), c }; NW.play('spin', HO.dur, { radius: HO.radius });
    popup(v3.set(P.x, 3.2, P.z), 'SPIN-OUT', '#ffd23a'); audio.burst(0.5, 1400, 0.18); audio.tone(330, 0.5, 0.05, 'sawtooth', 2.5); St.shake = Math.max(St.shake, 0.4);
  }
  function nobleRockets() {
    if (N.rcd > 0) return; const cost = T.energyCost * 3; if (P.en < cost) { audio.tone(160, 0.08, 0.04, 'square'); return; }
    P.en -= cost; P.enT = 0.6; N.rcd = 1.4; NW.play('rockets', NOBLE_HOLDS.rockets.dur); faceTarget(); N.rocketQ = [{ t: 0.28, i: 0 }, { t: 0.44, i: 1 }];
    popup(v3.set(P.x, 3.0, P.z), 'LAUNCHERS', '#ffb347'); audio.tone(520, 0.12, 0.04, 'triangle', 0.6);
  }
  function launchMini(i) {
    const o = NW.muzzleWorld(i, new THREE.Vector3()), list = aliveD().sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z)).filter(d => Math.hypot(d.x - P.x, d.z - P.z) < 24);
    const t = P.target && i === 0 ? P.target : list[i % Math.max(1, list.length)] || P.target || null;
    const mm = new THREE.Mesh(rocketGeo, rocketMat); mm.scale.setScalar(0.6); mm.position.copy(o); scene.add(mm); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb347, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); gl.scale.setScalar(1.4); mm.add(gl);
    const v = new THREE.Vector3(Math.sin(P.face) + (i ? 0.35 : -0.35) * Math.cos(P.face), 0.55, Math.cos(P.face) - (i ? 0.35 : -0.35) * Math.sin(P.face)).normalize().multiplyScalar(12);
    bolts.push({ m: mm, v, spd: 26, life: 2.4, target: t, dmg: Math.max(1, Math.round(T.laserDmg * 1.5)), hs: null, big: 1, kind: 'mini' }); audio.tone(180, 0.3, 0.05, 'sawtooth', 0.4); audio.burst(0.15, 700, 0.12); burst(o, 6, 2);
  }
  function nobleThrow() {
    if (N.shoe) { popup(v3.set(P.x, 2.8, P.z), 'BOOT OUT', '#9ca3af'); return; }
    const R = NOBLE_RANGED[N.r], t = faceTarget(); noble.rotation.y = P.face; noble.updateMatrixWorld(true); const o = nRig.boots[0].getWorldPosition(new THREE.Vector3());
    let dx = Math.sin(P.face), dz = Math.cos(P.face), range = R.range; if (t) { const ex = t.x - o.x, ez = t.z - o.z, L = Math.hypot(ex, ez) || 1; if (L < R.range * 1.3) { dx = ex / L; dz = ez / L; range = Math.min(R.range, L + 1.2); } }
    N.shoe = { k: N.r, R, phase: 'out', t: 0, life: 0, ox: o.x, oy: o.y, oz: o.z, dx, dz, range, x: o.x, y: o.y, z: o.z, vx: dx * 17, vy: 0, vz: dz * 17, hs: new Set(), target: N.r === 'homing' ? t : null, mesh: shoeMeshes[N.r] };
    N.shoe.mesh.visible = true; nRig.throwT = 0.25; nRig.boots[0].visible = false; audio.burst(0.18, 2200, 0.12); audio.tone(N.r === 'boot' ? 300 : 620, 0.1, 0.04, 'triangle', 1.6);
  }
  function shoeHits(s, mul) { for (const d of aliveD()) { if (s.hs.has(d)) continue; if (Math.hypot(s.x - d.x, s.z - d.z) < s.R.hitR + 0.4 && s.y > 0.2 && s.y < 2.4) { s.hs.add(d); hitDummy(d, Math.max(1, Math.round(T.laserDmg * s.R.dmg * mul)), { x: s.x, z: s.z }, 'laser', s.k === 'boot'); St.hitStop = Math.max(St.hitStop, 0.04); return d; } } return null; }
  function updateNobleShoe(dt) {
    const s = N.shoe; if (!s) return; s.life += dt; const R = s.R, slow = s.k === 'boot' ? 0.6 : 1;
    if (s.phase === 'out') {
      if (s.k === 'homing') {
        if (!s.target || !s.target.root.visible || s.target.down > 0) { let bd = R.range; s.target = null; for (const d of aliveD()) { const dd = Math.hypot(d.x - s.x, d.z - s.z); if (dd < bd) { bd = dd; s.target = d; } } }
        const sp = 17; if (s.target) { v4.set(s.target.x - s.x, 1.2 - s.y, s.target.z - s.z).normalize().multiplyScalar(sp); s.vx += (v4.x - s.vx) * Math.min(1, dt * 7); s.vy += (v4.y - s.vy) * Math.min(1, dt * 7); s.vz += (v4.z - s.vz) * Math.min(1, dt * 7); } else s.vy += ((1.2 - s.y) * 4 - s.vy) * Math.min(1, dt * 5);
        s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt;
        if (shoeHits(s, 1) || s.life > R.out * 1.6 || Math.hypot(s.x - s.ox, s.z - s.oz) > R.range) { s.phase = 'back'; s.hs.clear(); s.life = 0; }
      } else {
        s.t = Math.min(1, s.t + dt / R.out); const fwd = s.range * Math.sin(s.t * Math.PI / 2), sd = 0.77 * Math.sin(s.t * Math.PI), px = s.dz, pz = -s.dx;
        const nx = s.ox + s.dx * fwd + px * sd, nz = s.oz + s.dz * fwd + pz * sd, ny = s.oy + (1.2 - s.oy) * Math.sin(s.t * Math.PI / 2) + 0.5 * Math.sin(s.t * Math.PI), idt = 1 / Math.max(dt, 1e-4);
        s.vx = (nx - s.x) * idt; s.vy = (ny - s.y) * idt; s.vz = (nz - s.z) * idt; s.x = nx; s.y = ny; s.z = nz; shoeHits(s, 1);
        if (s.t >= 1) { s.phase = 'back'; s.vx = s.vy = s.vz = 0; s.hs.clear(); s.life = 0; }
      }
    } else {
      const tx = P.x - s.x, ty = P.y + 1.6 - s.y, tz = P.z - s.z, tl = Math.hypot(tx, ty, tz) || 1, dr = Math.pow(0.86, dt * 60), a = 360 * slow * dt / tl;
      s.vx = s.vx * dr + tx * a; s.vy = s.vy * dr + ty * a; s.vz = s.vz * dr + tz * a; const sp = Math.hypot(s.vx, s.vy, s.vz), mx = 21 * slow; if (sp > mx) { s.vx *= mx / sp; s.vy *= mx / sp; s.vz *= mx / sp; }
      s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; shoeHits(s, 0.55);
      if (tl < 0.9 || s.life > 2.5) { s.mesh.visible = false; nRig.boots[0].visible = true; N.shoe = null; audio.tone(880, 0.05, 0.03, 'triangle'); return; }
    }
    s.mesh.position.set(s.x, s.y, s.z); s.mesh.userData.body.rotation.y += dt * 33 * slow; if (Math.random() < 0.5) burst(v3.set(s.x, s.y, s.z), 1, 0.6);
  }
  function nobleUpdate(dt, hs) {
    N.cd = Math.max(0, N.cd - dt); N.rcd = Math.max(0, N.rcd - dt);
    // HOVER: hold 3 in the air, a short glide (1.4 s), jets under the seat
    const hov = CH.h3 != null && !P.ground && St.t - CH.h3 > 0.15 && N.hoverT < NOBLE_HOLDS.hover.max;
    if (hov) { if (!N.hovering) { audio.tone(240, 0.3, 0.04, 'sawtooth', 1.8); popup(v3.set(P.x, P.y + 2.8, P.z), 'HOVER', '#7dd3fc'); } N.hoverT += dt; CH.hovered = true; if (P.vy < 0) P.vy = Math.max(P.vy, -0.5); P.vy += T.gravity * dt * 0.46; P.vy = Math.min(P.vy, 2.5); }
    if (P.ground) N.hoverT = 0; N.hovering = hov; NW.hover(N.crash ? 0 : hov ? 1 : P.ground ? 0 : P.vy > 0 ? 1 : 0.35);
    if (N.act) { const a = N.act; a.t += dt; const mul = nMul();
      if (a.k === 'spike' && a.t > 0.06) for (const d of aliveD()) { if (a.hs.has(d)) continue; if (Math.hypot(d.x - P.x, d.z - P.z) < T.reach + 0.4) { a.hs.add(d); hitDummy(d, Math.round(T.swordDmg * NOBLE_MELEE.spike.dmg * mul), P, 'sword', false); St.hitStop = T.hitStop; } }
      if (a.k === 'ram' && a.t < 0.34) for (const d of aliveD()) { if (a.hs.has(d)) continue; const dx = d.x - P.x, dz = d.z - P.z, dist = Math.hypot(dx, dz); let a2 = Math.atan2(dx, dz) - P.face; a2 = Math.atan2(Math.sin(a2), Math.cos(a2)); if (dist < 1.9 && Math.abs(a2) < 0.9) { a.hs.add(d); hitDummy(d, Math.round(T.swordDmg * NOBLE_MELEE.ram.dmg * mul), P, 'sword', true); St.hitStop = T.hitStop * 1.4; P.lungeT = Math.min(P.lungeT, 0.03); } }
      if (a.k === 'spin' && a.t > 0.12 && a.t < 0.72) for (const d of aliveD()) { if (a.hs.has(d)) continue; if (Math.hypot(d.x - P.x, d.z - P.z) < NOBLE_HOLDS.spin.radius) { a.hs.add(d); hitDummy(d, Math.round(T.swordDmg * NOBLE_HOLDS.spin.dmg * mul), P, 'sword', true); St.hitStop = T.hitStop; } }
      if (a.k === 'spin' && a.t > 0.12 && a.t < 0.72) for (const c of crates) { if (c.down > 0 || a.hs.has(c)) continue; if (Math.hypot(c.x - P.x, c.z - P.z) < NOBLE_HOLDS.spin.radius) { a.hs.add(c); breakCrate(c); } }
      if (a.t >= a.dur) { N.act = null; N.cd = a.cd; } }
    for (let i = N.rocketQ.length - 1; i >= 0; i--) { const q = N.rocketQ[i]; q.t -= dt; if (q.t <= 0) { launchMini(q.i); N.rocketQ.splice(i, 1); } }
    updateNobleShoe(dt);
    nRig.throwT = Math.max(0, (nRig.throwT || 0) - dt);
    noble.position.set(P.x, P.y, P.z); noble.rotation.set(0, P.face, 0);
    kit.animFox(noble, dt, P.dash > 0 ? T.dodgeDist / T.dodgeDur : hs, false);
    const pose = NW.update(dt, hs); noble.position.y = P.y + pose.lift + (N.hovering ? Math.sin(St.t * 9) * 0.03 : 0); noble.rotation.set(pose.tilt, P.face + pose.yaw, 0);
  }
  function nobleCrash() { const h = N.crash.h; N.crash = null; const r = Math.min(4, 2.4 + h * 0.25), dmg = Math.round(T.swordDmg * (0.5 + h * 0.45) * nMul());
    shockT = 0; shock.position.set(P.x, 0.06, P.z); St.shake = Math.max(St.shake, 0.4 + Math.min(0.6, h * 0.12)); St.hitStop = 0.1; burst(v3.set(P.x, 0.2, P.z), 20 + Math.round(h * 4), 8); audio.burst(0.4, 260, 0.3); audio.tone(90, 0.35, 0.08, 'square', 0.5);
    popup(v3.set(P.x, 3.2, P.z), 'CRASH ' + h.toFixed(1) + ' m', '#ffd23a'); for (const d of aliveD()) if (Math.hypot(d.x - P.x, d.z - P.z) < r) hitDummy(d, dmg, P, 'sword', true); }
  // ---------- HOPE'S WEAPONS ----------
  function hopeHit(d, dmg, big) { let m = 1, tag = null; if (d.tripT > 0) { m *= 1.5; d.tripT = 0; tag = 'TRIPPED +50%'; } if (d.outT > 0) { m *= 1.5; tag = 'CRITICAL'; } if (d.brkT > 0) m *= 1.25;
    hitDummy(d, Math.max(1, Math.round(dmg * m)), P, 'sword', big || d.outT > 0); if (tag) popup(v3.set(d.x, 3.3, d.z), tag, '#0e7fb8'); HO.pinged = d; }
  const inArc = (d, reach, arc) => { const dx = d.x - P.x, dz = d.z - P.z, dist = Math.hypot(dx, dz); let a2 = Math.atan2(dx, dz) - P.face; a2 = Math.atan2(Math.sin(a2), Math.cos(a2)); return dist < reach && Math.abs(a2) < arc; };
  const hm = () => (WEAR.gauntlets ? 1.1 : 1);
  function hopeMelee() {
    if (HO.act || HO.cd > 0) return; const tg = faceTarget(); const Rr = T.reach * 0.95 + 0.4, mk = (o) => { HO.act = { t: 0, hs: new Set(), mul: 1, ...o }; };
    if (tg && HO.m !== 'tap') { const d = Math.hypot(tg.x - P.x, tg.z - P.z); if (d > Rr * 0.75 && d < T.lunge + Rr) { P.ldx = Math.sin(P.face); P.ldz = Math.cos(P.face); P.lungeT = 0.12; P.lsp = Math.min(30, (d - Rr * 0.7) / 0.12); } }
    if (HO.m === 'sweep') { hRig.strike(); mk({ k: 'sweep', dur: 0.36, cd: 0.08, w0: 0.06, w1: 0.3, reach: Rr, arc: 1.45, trip: true }); audio.burst(0.12, 2600, 0.1); }
    else if (HO.m === 'staff') { HO.combo = HO.comboT > 0 ? (HO.combo % 3) + 1 : 1; HO.comboT = 0.8; hRig.strike(); audio.burst(0.12, 2200 + HO.combo * 300, 0.1);
      if (HO.combo < 3) mk({ k: 'staff', dur: 0.28, cd: 0.02, w0: 0.05, w1: 0.25, reach: Rr, arc: HO.combo === 2 ? 3.3 : 1.3, mul: HOPE_MELEE.staff.dmg, spin: HO.combo === 2 });
      else { P.ldx = Math.sin(P.face); P.ldz = Math.cos(P.face); P.lungeT = 0.12; P.lsp = 10; mk({ k: 'staff', dur: 0.38, cd: 0.15, w0: 0.08, w1: 0.3, reach: T.reach * 1.4 + 0.5, arc: 0.45, mul: HOPE_MELEE.staff.dmg * 1.4, big: true }); popup(v3.set(P.x, 3.0, P.z), 'THRUST', '#0e7fb8'); } }
    else if (HO.m === 'tap') mk({ k: 'tap', dur: 0.75, cd: 0.25, w0: 9, w1: -1, taps: 0 });
    else { const ph = HO.beatT % 0.5, off = Math.min(ph, 0.5 - ph), on = off < 0.11; if (on) HO.streak = Math.min(8, HO.streak + 1); else { if (HO.streak) popup(v3.set(P.x, 3.0, P.z), 'OFF BEAT', '#9ca3af'); HO.streak = 0; }
      const mul = on ? Math.min(3, 1 + 0.25 * HO.streak) : 1; if (on) popup(v3.set(P.x, 3.0, P.z), 'BEAT ×' + mul.toFixed(2).replace(/0$/, ''), '#ffd23a'); hRig.strike(); audio.burst(0.1, on ? 3200 : 1600, 0.1); mk({ k: 'beat', dur: 0.3, cd: 0.02, w0: 0.05, w1: 0.26, reach: Rr, arc: 1.45, mul, big: mul >= 2 }); }
  }
  function hopeEcho() { if (HO.ecd > 0) return; HO.ecd = 3; hRig.strike(); const o = v3.set(P.x, 0, P.z).clone(); HK.wave(o, HOPE_HOLDS.echo.radius, 0x7dd3fc, 0.8); setTimeout(() => HK.wave(o, HOPE_HOLDS.echo.radius * 0.7, 0xbae6fd, 0.7), 140);
    audio.tone(1760, 0.12, 0.05, 'sine', 0.5); audio.tone(880, 0.6, 0.03, 'sine', 0.4); popup(v3.set(P.x, 3.2, P.z), 'ECHOLOCATION', '#7dd3fc'); let best = null, bd = 1e9;
    for (const d of aliveD()) { const dd = Math.hypot(d.x - P.x, d.z - P.z); if (dd < HOPE_HOLDS.echo.radius) { d.outT = HOPE_HOLDS.echo.dur; if (dd < bd) { bd = dd; best = d; } } } if (best) HO.pinged = best; }
  function hopeWave() { if (HO.wcd > 0) return; const cost = T.energyCost * 2; if (P.en < cost) { audio.tone(160, 0.08, 0.04, 'square'); return; } P.en -= cost; P.enT = 0.5; HO.wcd = 1.5; faceTarget();
    HK.fan(v3.set(P.x, 0, P.z), P.face, HOPE_HOLDS.wave.len, HOPE_HOLDS.wave.ang); audio.burst(0.45, 900, 0.25); audio.tone(300, 0.4, 0.06, 'sawtooth', 0.6); St.shake = Math.max(St.shake, 0.35); popup(v3.set(P.x, 3.2, P.z), 'WAVE OF SOUND', '#7dd3fc');
    for (const d of aliveD()) if (inArc(d, HOPE_HOLDS.wave.len, HOPE_HOLDS.wave.ang + 0.15)) { hopeHit(d, Math.round(T.swordDmg * 0.6 * hm()), true); const dx = d.x - P.x, dz = d.z - P.z, l = Math.hypot(dx, dz) || 1; d.vx += dx / l * 5; d.vz += dz / l * 5; if (!(d.brkT > 0)) popup(v3.set(d.x, 2.9, d.z), 'ARMOR BREAK', '#ec3013'); d.brkT = 5; } }
  function hopeRanged() {
    if (HO.rcd > 0) return; const t = faceTarget(), fwd = v4.set(Math.sin(P.face), 0, Math.cos(P.face)).clone();
    if (HO.r === 'echo') { if (P.en < T.energyCost) { audio.tone(160, 0.08, 0.04, 'square'); return; } P.en -= T.energyCost; P.enT = 0.4; HO.rcd = 1 / (T.fireRate * 0.6);
      const tg = HO.pinged && HO.pinged.root.visible && !(HO.pinged.down > 0) ? HO.pinged : t; const o = v3.set(P.x, 1.3, P.z).addScaledVector(fwd, 0.5).clone(); const mm = new THREE.Mesh(echoGeo, echoMat); mm.position.copy(o); scene.add(mm); HK.glow(0x7dd3fc, 0.9, mm);
      bolts.push({ m: mm, v: (tg ? v5.set(tg.x, 1.2, tg.z).sub(o).normalize() : fwd).clone().multiplyScalar(T.boltSpeed * 0.6), spd: T.boltSpeed * 0.6, homeK: 30, life: 2.5, target: tg, dmg: Math.round(T.laserDmg * HOPE_RANGED.echo.dmg), hs: null, big: 1, kind: 'echo' });
      audio.tone(2400, 0.03, 0.05, 'square'); audio.tone(1200, 0.12, 0.03, 'sine', 0.5); HK.wave(v3.set(P.x, 0, P.z), 1.2, 0xbae6fd, 0.25); return; }
    if (HO.r === 'tip') { if (HO.tip) return; HO.rcd = 0.5; const from = hRig.tipW.clone(); HO.tip = { phase: 'out', pos: from, target: t && Math.hypot(t.x - P.x, t.z - P.z) < HOPE_RANGED.tip.range + 1 ? t : null, dir: fwd, dist: 0 }; tipM.visible = tipM.userData.cord.visible = true; audio.burst(0.12, 3000, 0.1); return; }
    if (HO.r === 'bell') { if (HO.bell) return; HO.rcd = 0.9; const to = t ? new THREE.Vector3(t.x, 0.3, t.z) : new THREE.Vector3(P.x, 0.3, P.z).addScaledVector(fwd, 6); HO.bell = { from: new THREE.Vector3(P.x, 1.4, P.z), to, t: 0, dur: 0.75 }; bellM.visible = true; audio.tone(1320, 0.1, 0.03, 'sine'); return; }
    if (HO.droneS !== 'idle') { popup(v3.set(P.x, 2.8, P.z), 'DRONE BUSY', '#9ca3af'); return; } if (!t) { popup(v3.set(P.x, 2.8, P.z), 'NO TARGET', '#9ca3af'); return; }
    HO.droneS = 'go'; HO.droneT = t; HO.rcd = 0.4; audio.tone(1500, 0.06, 0.04, 'triangle'); audio.tone(1900, 0.06, 0.04, 'triangle', 1.2);
  }
  function hopeSlam() { HO.slam = false; shockT = 0; shock.position.set(P.x, 0.06, P.z); St.shake = Math.max(St.shake, 0.5); St.hitStop = 0.1; burst(v3.set(P.x, 0.2, P.z), 22, 7); audio.burst(0.3, 400, 0.25); audio.tone(120, 0.25, 0.06, 'square', 0.5);
    popup(v3.set(P.x, 3.2, P.z), 'VAULT SLAM', '#0e7fb8'); for (const d of aliveD()) if (Math.hypot(d.x - P.x, d.z - P.z) < 2.6) hopeHit(d, Math.round(T.swordDmg * 1.2 * hm()), true); }
  const dronePos = new THREE.Vector3(0, 2.3, 4);
  function hopeUpdate(dt, hs) {
    HO.cd = Math.max(0, HO.cd - dt); HO.rcd = Math.max(0, HO.rcd - dt); HO.ecd = Math.max(0, HO.ecd - dt); HO.wcd = Math.max(0, HO.wcd - dt); HO.comboT -= dt; if (HO.comboT < 0) HO.combo = 0; St.senseT = Math.max(0, (St.senseT || 0) - dt); St.perfect = Math.max(0, (St.perfect || 0) - dt);
    const held3 = CH.h3 != null ? St.t - CH.h3 : -1, moving = Math.hypot(STK.x, STK.y) > 0.3 || ['KeyW', 'KeyA', 'KeyS', 'KeyD'].some(k => keys.has(k));
    if (held3 > 0.15 && !P.ground && !HO.vault) { HO.vault = true; HO.slam = true; CH.hovered = true; P.vy = Math.max(P.vy, 0) + T.jump * 0.95; hRig.strike(); popup(v3.set(P.x, P.y + 2.8, P.z), 'CANE VAULT', '#0e7fb8'); audio.tone(520, 0.15, 0.05, 'triangle', 1.8); HK.wave(v3.set(P.x, 0, P.z), 1.2, 0xffffff, 0.3); }
    if (P.ground && !HO.slam) HO.vault = false;
    const wantShield = held3 > 0.3 && P.ground && !moving && P.dash <= 0; if (wantShield && !HO.shield) { audio.tone(110, 0.5, 0.05, 'sawtooth', 1.02); popup(v3.set(P.x, 2.9, P.z), 'FEEDBACK SHIELD', '#7dd3fc'); }
    HO.shield = wantShield; if (HO.shield) CH.hovered = true; shieldM.visible = HO.shield; if (HO.shield) { shieldM.position.set(P.x, 0, P.z); shieldM.userData.tick(St.t); }
    if (HO.m === 'beat') { const b0 = HO.beatT % 0.5; HO.beatT += dt; if (HO.beatT % 0.5 < b0) { audio.tone(HO.streak ? 880 : 660, 0.04, 0.03, 'square'); HK.wave(v3.set(P.x, 0, P.z), 0.8 + Math.min(HO.streak, 8) * 0.12, HO.streak ? 0xffd23a : 0xffffff, 0.22); } }
    if (HO.act) { const a = HO.act; a.t += dt;
      if (a.t >= a.w0 && a.t <= a.w1) for (const d of aliveD()) { if (a.hs.has(d) || !inArc(d, a.reach, a.arc)) continue; a.hs.add(d); hopeHit(d, Math.round(T.swordDmg * a.mul * hm()), a.big); if (a.trip && !(d.down > 0)) { d.tripT = 1.6; popup(v3.set(d.x, 2.9, d.z), 'TRIPPED', '#7dd3fc'); } St.hitStop = T.hitStop; }
      if (a.k === 'tap') { const marks = [0.12, 0.27, 0.42]; while (a.taps < 3 && a.t >= marks[a.taps]) { a.taps++; hRig.strike(); HK.wave(hRig.tipW, 0.5, 0xffffff, 0.2); audio.tone(900 + a.taps * 120, 0.03, 0.05, 'square'); }
        if (a.t >= 0.5 && !a.fired) { a.fired = true; const fx = Math.sin(P.face), fz = Math.cos(P.face); HK.line(v3.set(P.x, 0, P.z), P.face, 8); St.shake = Math.max(St.shake, 0.3); audio.burst(0.3, 500, 0.2); audio.tone(140, 0.25, 0.06, 'square', 0.7);
          for (const d of aliveD()) { const dx = d.x - P.x, dz = d.z - P.z, along = dx * fx + dz * fz, lat = Math.abs(dx * fz - dz * fx); if (along > 0 && along < 8.4 && lat < 0.95) hopeHit(d, Math.round(T.swordDmg * HOPE_MELEE.tap.dmg * hm()), true); } } }
      if (a.t >= a.dur) { HO.act = null; HO.cd = a.cd; } }
    if (HO.tip) { const tp = HO.tip, sp = tp.phase === 'out' ? 28 : 34;
      if (tp.phase === 'out') { if (tp.target) tp.dir = v4.set(tp.target.x - tp.pos.x, 1.2 - tp.pos.y, tp.target.z - tp.pos.z).normalize().clone(); else tp.dir.y = (1.0 - tp.pos.y) * 0.5; tp.pos.addScaledVector(tp.dir, sp * dt); tp.dist += sp * dt;
        for (const d of aliveD()) if (Math.hypot(d.x - tp.pos.x, d.z - tp.pos.z) < 0.6) { hopeHit(d, Math.round(T.laserDmg * HOPE_RANGED.tip.dmg), false); const dx = P.x - d.x, dz = P.z - d.z, l = Math.hypot(dx, dz) || 1; d.vx += dx / l * 9; d.vz += dz / l * 9; popup(v3.set(d.x, 2.9, d.z), 'PULLED', '#7dd3fc'); tp.phase = 'back'; audio.tone(700, 0.08, 0.05, 'triangle', 0.6); break; }
        if (tp.dist > HOPE_RANGED.tip.range) tp.phase = 'back'; }
      else { v4.copy(hRig.tipW).sub(tp.pos); const l = v4.length(); if (l < 0.5) { HO.tip = null; tipM.visible = tipM.userData.cord.visible = false; audio.tone(1400, 0.03, 0.03, 'square'); } else tp.pos.addScaledVector(v4.normalize(), Math.min(l, sp * dt)); }
      if (HO.tip) { tipM.position.copy(tp.pos); const pa = tipM.userData.cord.geometry.attributes.position; pa.setXYZ(0, hRig.tipW.x, hRig.tipW.y, hRig.tipW.z); pa.setXYZ(1, tp.pos.x, tp.pos.y, tp.pos.z); pa.needsUpdate = true; } }
    if (HO.bell) { const b = HO.bell; b.t += dt / b.dur; const u = Math.min(1, b.t); bellM.position.lerpVectors(b.from, b.to, u); bellM.position.y += Math.sin(u * Math.PI) * 2.6; bellM.rotation.z = Math.sin(St.t * 20) * 0.5;
      if (u >= 1) { HO.bell = null; bellM.visible = false; HK.wave(b.to, 2.2, 0xffd23a, 0.45); HK.wave(b.to, 1.4, 0xffffff, 0.35); audio.tone(1320, 0.6, 0.05, 'sine', 1); audio.tone(1760, 0.5, 0.04, 'sine', 1);
        for (const d of aliveD()) if (Math.hypot(d.x - b.to.x, d.z - b.to.z) < 2.2) { hopeHit(d, Math.round(T.laserDmg * HOPE_RANGED.bell.dmg), false); d.confT = 3; popup(v3.set(d.x, 2.9, d.z), '???', '#ffd23a'); } } }
    // GUIDE DRONE: rides by her left shoulder; sent, it flies to the target and pecks for 2.5 s
    drone.visible = HO.r === 'drone' || HO.droneS !== 'idle'; const home = v4.set(P.x + Math.cos(P.face) * 0.75, P.y + 2.3, P.z - Math.sin(P.face) * 0.75).clone();
    let goal = home, spd = 12; const tg = HO.droneT;
    if (HO.droneS !== 'idle' && HO.droneS !== 'back' && (!tg || !tg.root.visible || tg.down > 0)) HO.droneS = 'back';
    if (HO.droneS === 'go') { goal = v5.set(tg.x, 1.9, tg.z).clone(); spd = 9; if (dronePos.distanceTo(goal) < 0.6) { HO.droneS = 'peck'; HO.droneTm = 2.5; HO.peck = 0.2; } }
    else if (HO.droneS === 'peck') { goal = v5.set(tg.x + Math.sin(St.t * 3) * 0.3, 1.75 + Math.abs(Math.sin(St.t * 12)) * 0.15, tg.z + Math.cos(St.t * 3) * 0.3).clone(); HO.droneTm -= dt; HO.peck -= dt; if (HO.peck <= 0) { HO.peck = 0.5; hopeHit(tg, Math.max(1, Math.round(T.laserDmg * HOPE_RANGED.drone.dmg)), false); audio.tone(2600, 0.03, 0.03, 'square'); } if (HO.droneTm <= 0) HO.droneS = 'back'; }
    else if (HO.droneS === 'back' && dronePos.distanceTo(home) < 0.5) { HO.droneS = 'idle'; HO.droneT = null; }
    const dv = v5.copy(goal).sub(dronePos), dl = dv.length(); if (HO.droneS === 'idle') dronePos.lerp(goal, Math.min(1, dt * 6)); else dronePos.addScaledVector(dv.normalize(), Math.min(dl, spd * dt));
    drone.position.copy(dronePos); if (dl > 0.05) drone.rotation.y = Math.atan2(goal.x - dronePos.x, goal.z - dronePos.z); else drone.rotation.y = P.face; drone.userData.tick(St.t, HO.droneS !== 'idle');
    hope.position.set(P.x, P.y, P.z); const spin = HO.act && HO.act.spin ? -(HO.act.t / HO.act.dur) * Math.PI * 2 : 0; hope.rotation.set(0, P.face + spin, 0);
    kit.animFox(hope, dt, P.dash > 0 ? 0 : hs, false); if (P.dash > 0) hope.userData.P.body.rotation.x = (1 - P.dash / T.dodgeDur) * Math.PI * 2;
  }
  const POOL = { player: { hp: 100, en: 100 }, hope: { hp: 100, en: 100 }, noble: { hp: 100, en: 100 } };
  function setHero(h) { if (POOL[HERO]) { POOL[HERO].hp = P.hp; POOL[HERO].en = P.en; } HERO = h === 'noble' || h === 'hope' ? h : 'player'; P.hp = POOL[HERO].hp; P.en = POOL[HERO].en; fox.visible = HERO === 'player'; noble.visible = HERO === 'noble'; hope.visible = HERO === 'hope'; drone.visible = false; shieldM.visible = false; HO.act = null; HO.shield = false; HO.slam = false; HO.droneS = 'idle'; if (HO.tip) { HO.tip = null; tipM.visible = tipM.userData.cord.visible = false; } if (HO.bell) { HO.bell = null; bellM.visible = false; } N.act = null; N.cd = 0; N.rocketQ = []; N.crash = null; if (N.shoe) { N.shoe.mesh.visible = false; N.shoe = null; } nRig.boots[0].visible = true; SC.on = false; SC.queue = []; P.swing = 0; P.queued = false; CH.h1 = CH.h2 = CH.h3 = null; try { localStorage.setItem(HERO_KEY, HERO); } catch (e) {} hudKey = '';
    // snap the newly shown fox onto the player spot so it does not slide in from wherever it was last, and leave POV
    St.pov = false; const shown = HERO === 'noble' ? noble : HERO === 'hope' ? hope : fox; shown.position.set(P.x, P.y, P.z); shown.rotation.y = P.face; P.swing = 0; P.dash = 0; }
  setHero(HERO);
  function frame() { raf = requestAnimationFrame(frame); try { update(Math.min(clock.getDelta(), 0.05)); } catch (e) { window.__labErr = String(e && e.stack || e); } renderer.render(scene, camera); }
  frame();

  const api = {
    _sc: () => SC,
    _step(n = 1) { for (let i = 0; i < n; i++) update(1 / 30); renderer.render(scene, camera); },
    racketSpin() { if (P.swing > 0 || P.slam) return; P.combo = 3; P.rspin = true; P.pow = 0; P.rmul = 1; P.hand = 1; P.swingDur = 2 * (T.windup + T.swingTime); P.swing = P.swingDur; P.hitSet = new Set(); P.comboT = P.swingDur; P.queued = false; audio.burst(0.2, 1800, 0.14); },
    equip(mk, rk) { if (mk && MELEE[mk]) W8.m = mk; if (rk && RANGED[rk]) W8.r = rk; P.swing = 0; P.rspin = false; CH.h1 = CH.h2 = null; P.fireQ = null; applyWeapons(); audio.tone(700, 0.06, 0.04, 'triangle'); },
    setHero(h) { setHero(h); audio.tone(700, 0.06, 0.04, 'triangle'); }, getHero: () => HERO,
    hopeSets: () => ({ melee: HOPE_MELEE, ranged: HOPE_RANGED, holds: HOPE_HOLDS, passives: HOPE_PASSIVES }),
    equipHope(mk, rk) { if (mk && HOPE_MELEE[mk]) { HO.m = mk; HO.streak = 0; } if (rk && HOPE_RANGED[rk]) HO.r = rk; HO.act = null; try { localStorage.setItem(HERO_KEY + '.h', JSON.stringify({ m: HO.m, r: HO.r })); } catch (e) {} audio.tone(700, 0.06, 0.04, 'triangle'); hudKey = ''; },
    nobleSets: () => ({ melee: NOBLE_MELEE, ranged: NOBLE_RANGED, holds: NOBLE_HOLDS }),
    equipNoble(mk, rk) { if (mk && NOBLE_MELEE[mk]) N.m = mk; if (rk && NOBLE_RANGED[rk] && !N.shoe) N.r = rk; N.act = null; try { localStorage.setItem(HERO_KEY + '.w', JSON.stringify({ m: N.m, r: N.r })); } catch (e) {} audio.tone(700, 0.06, 0.04, 'triangle'); hudKey = ''; },
    setPaused(v) { PAUSE = !!v; if (v) { keys.clear(); CH.h1 = CH.h2 = CH.h3 = null; } },
    useItem(k) { if (!(INV[k] > 0)) { audio.tone(160, 0.08, 0.04, 'square'); return false; } INV[k]--; const at = v3.set(P.x, 2.8, P.z);
      if (k === 'health') { P.hp = Math.min(100, P.hp + 50); popup(at, '+50 HP', '#7cff9b'); } else if (k === 'pep') { P.pepT = 30; popup(at, 'PEP · 30 s', '#ffd23a'); } else if (k === 'cell') { P.en = Math.min(100, P.en + 50); popup(at, '+50 EN', '#38bdf8'); }
      audio.tone(880, 0.1, 0.05, 'triangle', 1.5); hudKey = ''; return true; },
    wear(k, on) { if (k in WEAR) { WEAR[k] = !!on; audio.tone(on ? 760 : 420, 0.06, 0.04, 'triangle'); hudKey = ''; } },
    mapData: () => ({ p: [P.x, P.z, P.face], d: dummies.filter(d => d.root.visible).map(d => [d.x, d.z, d.down > 0]), c: crates.filter(c => !(c.down > 0)).map(c => [c.x, c.z]) }),
    setTurret(v) { St.turret = v; St.turretT = 0.8; },
    toggleScope() { if (SC.exec) return; if (!SC.on && HERO !== 'player') { popup(v3.set(P.x, 2.8, P.z), HERO === 'noble' ? 'NO SCOPE ON THE CHAIR' : 'HOPE USES ECHOLOCATION (HOLD 1)', '#9ca3af'); return; } if (!SC.on && !WR()) { popup(v3.set(P.x, 2.8, P.z), 'NO RANGED WEAPON', '#9ca3af'); return; } SC.on = !SC.on; SC.queue = []; if (SC.on) { const l = scopeList(); SC.target = P.target && l.includes(P.target) ? P.target : l[0] || null; } audio.tone(SC.on ? 880 : 520, 0.08, 0.04, 'triangle'); },
    scopeCycle(dir) { const l = scopeList(); if (!l.length) return; const i = l.indexOf(SC.target); SC.target = l[(i + dir + l.length) % l.length]; audio.tone(700, 0.04, 0.03, 'square'); },
    scopeAdd(key) { if (!SC.on || SC.queue.length >= 3 || !SC.target) return; const z = ZONES.find(q => q.key === key); if (!z || zoneChance(SC.target, z) <= 0) { audio.tone(160, 0.08, 0.04, 'square'); return; } if (P.en < T.energyCost * (SC.queue.length + 1)) { audio.tone(160, 0.08, 0.04, 'square'); return; } SC.queue.push(z); audio.tone(980, 0.05, 0.035, 'triangle'); },
    scopeClear() { SC.queue = []; audio.tone(400, 0.06, 0.03, 'triangle'); },
    scopeExecute() { if (!SC.on || !SC.queue.length) return; SC.exec = { list: SC.queue.slice(), i: 0, wait: 0.25 }; SC.queue = []; SC.on = false; keys.clear(); audio.tone(1200, 0.1, 0.04, 'triangle'); },
    setTune(t) { Object.assign(T, t); St.pitch = T.camPitch; },
    scopeBand: () => St.band,
    setMuted(v) { audio.setMuted && audio.setMuted(!!v); },
    getCam() { return { dist: T.camDist, pitch: St.pitch }; },
    eyeLook(dx, dy = 0) { St.eyeHeld = true; St.eyeY = (St.eyeY || 0) - dx * 0.008; St.eyeP = clamp((St.eyeP || 0) + dy * 0.005, St.pov ? -0.9 : -0.3, 0.9); },
    eyeRelease() { St.eyeHeld = false; },
    togglePov(v) { St.pov = v == null ? !St.pov : !!v; St.eyeY = 0; St.eyeP = 0; if (!St.pov) setHero(HERO); return St.pov; },
    lookBy(dx, dy = 0) { St.yaw -= dx * 0.008; St.pitch = clamp(St.pitch + dy * 0.005, 0.05, 1.2); St.dragT = 1.5; },
    lookBack() { St.yaw += Math.PI; St.dragT = 1.3; St.backT = 1.3; },
    zoomBy(f) { T.camDist = clamp(T.camDist * f, 3, 16); },
    press1(down) { if (SC.on || SC.exec) return; audio.init(); if (down) { CH.h1 = St.t; CH.full1 = false; return; } if (CH.h1 == null) return; const held = St.t - CH.h1; CH.h1 = null; if (HERO === 'hope') { if (held < HOLD + 0.45) hopeMelee(); else hopeEcho(); return; } if (HERO === 'noble') { if (held < HOLD + 0.45) nobleMelee(); else nobleSpin(clamp((held - HOLD) / CHG, 0, 1)); return; } if (held < HOLD) api.slash(); else powerHit(clamp((held - HOLD) / CHG, 0, 1)); },
    press2(down) { if (SC.on || SC.exec) return; audio.init(); if (HERO === 'hope') { if (down) { CH.h2 = St.t; CH.full2 = false; return; } if (CH.h2 == null) return; const hh = St.t - CH.h2; CH.h2 = null; if (hh < HOLD + 0.2) hopeRanged(); else hopeWave(); return; } if (HERO === 'noble') { if (down) { CH.h2 = St.t; CH.full2 = false; return; } if (CH.h2 == null) return; const hn = St.t - CH.h2; CH.h2 = null; if (hn < HOLD) nobleThrow(); else nobleRockets(); return; } if (W8.m === 'racket') { if (down) api.racketSpin(); return; } if (W8.m === 'gloves') { if (down) api.slash(undefined, 2); return; } if (down) { CH.h2 = St.t; CH.full2 = false; return; } if (CH.h2 == null) return; const held = St.t - CH.h2; CH.h2 = null; fire(held < HOLD ? 0 : Math.max(0.15, clamp((held - HOLD) / CHG, 0, 1))); },
    // 3: tap = jump, tap again in the air = DOUBLE JUMP with a flip; HOLD 3 + push the stick = ROLL that way
    press3(down = true) { if (SC.on || SC.exec) return; audio.init(); if (down) { CH.h3 = St.t; CH.rolled = false; CH.hovered = false; return; } if (CH.h3 == null) return; CH.h3 = null; if (CH.rolled) return; if (CH.hovered) { CH.hovered = false; return; } const now = St.t;
      if (HERO === 'noble') { if (P.ground) { P.vy = T.jump * 1.06; P.ground = false; P.dbl = true; INP.push({ k: '3', t: now }); if (INP.length > 6) INP.shift(); audio.burst(0.35, 900, 0.16); audio.tone(180, 0.35, 0.05, 'sawtooth', 2.4); burst(v3.set(P.x, 0.1, P.z), 14, 3); } else if (!N.crash) { N.crash = { h: P.y }; P.vy = -26; audio.tone(500, 0.2, 0.05, 'sawtooth', 0.4); } return; }
      if (P.ground) { P.vy = T.jump; P.ground = false; P.dbl = false; INP.push({ k: '3', t: now }); if (INP.length > 6) INP.shift(); audio.tone(420, 0.12, 0.04, 'triangle', 1.8); }
      else if (!P.dbl && !P.slam && N.hoverT === 0) { P.dbl = true; P.vy = T.jump * 1.12; P.spin = HERO === 'noble' ? 0 : 1; burst(v3.set(P.x, P.y + 0.2, P.z), 8, 2.5); audio.tone(620, 0.14, 0.045, 'triangle', 1.6); } },
    setStick(x, y) { const mg = Math.hypot(x, y); if (flickOn) { if (mg < 0.25) STK.lowT = St.rt || 0; else if (mg >= 0.98 && STK.m < 0.98 && (St.rt || 0) - STK.lowT < 0.09) api.dodgeDir(x, y); } STK.x = x; STK.y = y; STK.m = mg; },
    dodgeDir(x, y) { const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw), rx = Math.cos(St.yaw), rz = -Math.sin(St.yaw); P.vx = (fx * y + rx * x) * 3; P.vz = (fz * y + rz * x) * 3; api.dodge(); },
    setFlick(v) { flickOn = v; },
    getTune: () => ({ ...T }),
    slash(pressT, hand = 1) {
      const now = pressT ?? St.t;
      if (P.slam) return;
      if (P.swing > 0) { if (P.swingDur - P.swing > P.swingDur * 0.45 && !P.pow) { P.queued = true; P.qT = now; P.qH = hand; } return; }   // presses in the first half of a swing are ignored (no mashing)
      if (!P.ground && P.y > 0.3 && rhythm131(now)) { INP.length = 0; skySplit(); return; }
      INP.push({ k: '1', t: now }); if (INP.length > 6) INP.shift();
      const off = now - (P.beatAt ?? -9), chain = P.comboT > 0 && !P.pow, onBeat = chain && W8.m !== 'gloves' && off >= -BEAT() && off <= BEAT() * 1.2;
      P.pow = 0; P.rspin = false; P.hand = hand; P.combo = chain ? (P.combo % (W8.m === 'gloves' ? 2 : 3)) + 1 : 1; P.comboT = T.comboWindow + T.swingTime + T.windup;
      if (onBeat) { P.rhythm = (P.rhythm || 0) + 1; P.rmul = 1.3; popup(v3.set(P.x, 3, P.z), P.combo === 3 && P.rhythm >= 2 ? 'RHYTHM FINISHER' : 'PERFECT', '#ffd23a'); if (P.combo === 3 && P.rhythm >= 2) P.rmul = 1.3 * 1.4; audio.tone(1760, 0.06, 0.04, 'triangle'); } else { P.rhythm = 0; P.rmul = 1; }
      P.swingDur = (T.windup + T.swingTime) / WM().spd * (P.combo === 3 ? 1.25 : 1); P.swing = P.swingDur; P.hitSet = new Set();
      audio.burst(0.14, 2600, 0.12);
      const t = P.target || pickTarget(); if (t) { const d = Math.hypot(t.x - P.x, t.z - P.z); if (d < T.lunge + T.reach) { P.face = Math.atan2(t.x - P.x, t.z - P.z); if (d > T.reach * 0.7) { P.ldx = Math.sin(P.face); P.ldz = Math.cos(P.face); P.lungeT = 0.12; P.lsp = Math.min(32, (d - T.reach * 0.65) / 0.12); } } }
    },
    dodge() { if (P.dashCd > 0 || P.dash > 0 || P.slam) return; if (HERO === 'hope' && St.senseT > 0) { St.perfect = 0.6; popup(v3.set(P.x, 3.0, P.z), 'PERFECT DODGE', '#7dd3fc'); audio.tone(2200, 0.15, 0.05, 'sine', 1.5); } CH.h1 = null; let dx = P.vx, dz = P.vz; const l = Math.hypot(dx, dz); if (l < 0.5) { dx = -Math.sin(P.face); dz = -Math.cos(P.face); } else { dx /= l; dz /= l; } P.dx = dx; P.dz = dz; P.dash = T.dodgeDur; P.dashCd = T.dodgeCd + T.dodgeDur; audio.burst(0.14, 1800, 0.1); },
    cycleTarget() { const list = aliveD().sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z)); if (!list.length) return; const i = list.indexOf(P.target); P.target = list[(i + 1) % list.length]; },
    setSlow(v) { St.slow = v ? 0.25 : 1; },
    setLock(v) { St.lockOn = v; if (!v) P.target = null; },
    setMoving(v) { St.moving = v; mover.root.visible = v; if (!v && P.target === mover) P.target = null; },
    resetDummies() { dummies.forEach(d => { d.ax = d.az = d.vx = d.vz = 0; d.hits = 0; d.hp = d.max; d.down = 0; d.downR = 0; d.f50 = d.f20 = false; clearIce(d); }); crates.forEach(c => { c.down = 0; c.g.visible = true; }); St.hits = 0; St.best = 0; St.dmgLog = []; },
    demo(kind) { if (kind === 'hmelee') { hopeMelee(); return; } if (kind === 'hrange') { hopeRanged(); return; } if (kind === 'hecho') { hopeEcho(); return; } if (kind === 'hwave') { hopeWave(); return; }
      if (kind === 'hvault') { api.press3(true); api.press3(false); setTimeout(() => api.press3(true), 300 / St.slow); setTimeout(() => api.press3(false), 700 / St.slow); return; }
      if (kind === 'hshield') { api.press3(true); setTimeout(() => api.press3(false), 2500 / St.slow); St.turret = true; St.turretT = 0.6; hudKey = ''; return; }
      if (kind === 'nmelee') { nobleMelee(); return; } if (kind === 'nthrow') { nobleThrow(); return; } if (kind === 'spinout') { nobleSpin(); return; } if (kind === 'launch') { nobleRockets(); return; }
      if (kind === 'crash') { api.press3(true); api.press3(false); setTimeout(() => { api.press3(true); api.press3(false); }, 700 / St.slow); return; }
      if (kind === 'hover') { api.press3(true); api.press3(false); setTimeout(() => api.press3(true), 260 / St.slow); setTimeout(() => api.press3(false), 1700 / St.slow); return; }
      if (kind === '131') { api.slash(); setTimeout(() => { api.press3(true); api.press3(false); }, 380 / St.slow); setTimeout(() => api.slash(), 760 / St.slow); return; } if (kind === 'power') { api.press1(true); setTimeout(() => api.press1(false), 1100 / St.slow); return; } if (kind === 'pshot') { api.press2(true); setTimeout(() => api.press2(false), 1100 / St.slow); return; } if (kind === 'combo') { api.slash(); setTimeout(api.slash, (T.windup + T.swingTime) * 1000 / St.slow * 0.75); setTimeout(api.slash, (T.windup + T.swingTime) * 2000 / St.slow * 0.75); } else if (kind === 'slash') api.slash(); else if (kind === 'fire') { let n = 0; const iv = setInterval(() => { P.fireCd = 0; fire(); if (++n >= 5) clearInterval(iv); }, 1000 / T.fireRate / St.slow); } else if (kind === 'dodge') api.dodge(); else if (kind === 'jump') { api.press3(true); api.press3(false); setTimeout(() => { api.press3(true); api.press3(false); }, 250 / St.slow); } },
    save(t) { localStorage.setItem(TUNE_KEY, JSON.stringify(t)); },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur); audio.dispose(); renderer.dispose(); el.remove(); },
  };
  window.__lab = api;
  return api;
}
