// 8 GATES — LUXOR · FOXY BOXING at THE FIGHTING PIT [luxorFightingPit] (lessons at the BOXING GYM with COACH BRUNO). Game HUD vehicle "boxing": 1 JAB · 2 UPPER · 3 BLOCK.
// Ben's answers: camera behind Ben over the shoulder; classic arcade (the stick only leans left / right or ducks down); HOLD 3 = block; tap 2 = uppercut, HOLD 2 = power uppercut;
// counter ring: when the rival winds up, a ring shrinks on his glove; punch on GREEN = COUNTER. First to 3 knockdowns. Stamina bar (HUD EN), crowd meter → 1 + 2 together = 8-GATE HAYMAKER.
// Card: PODD → VEK → SURA → FERRO → LYRA (champion), each with a tell + a trick. Cartoon stars when dazed, ring announcer + bell, belt ceremony for the IRON BELT. Everyone in boxer outfits.
// Save keys luxor.box.*, flags luxorBoxLessons / luxorIronBelt, relic ironBelt.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage } from '../../engine/restaurant-kit.js';

const RY = 0.8, BZ = 1.05, OZ = -1.05;
// trick: how to beat it. 'side' = lean left/right, 'duck' = stick down, 'block' = hold 3
export const RIVALS = [
  { id: 'podd', name: 'PODD', nick: 'THE BOULDER', speed: 0.75, guard: 0.35, hp: 100, dmg: 0.9, gold: 20, trick: { name: 'BELLY BUMP', beat: 'side', tell: 'He sticks his belly out and wobbles.' }, look: ['#9a6f4a', '#6b4a2c'], kit: ['#3a6ea5', '#f2c94c', '#ec3013'], tricky: 0.25 },
  { id: 'vek', name: 'VEK', nick: 'THE TRICKSTER', speed: 0.95, guard: 0.45, hp: 100, dmg: 1.0, gold: 30, trick: { name: 'FEINT', beat: 'wait', tell: 'He winds up, stops, then jabs. Wait for the real one.' }, look: ['#e6e4de', '#a8a6a0'], kit: ['#2f9a8f', '#fbf8ec', '#f2c94c'], tricky: 0.35 },
  { id: 'sura', name: 'SURA', nick: 'THE STORM', speed: 1.25, guard: 0.5, hp: 100, dmg: 0.85, gold: 40, trick: { name: 'FLURRY', beat: 'block', tell: 'She bounces on her toes. Three fast jabs: hold 3.' }, look: ['#c9682a', '#8a4213'], kit: ['#a78bfa', '#fbf8ec', '#ec3013'], tricky: 0.35 },
  { id: 'ferro', name: 'FERRO', nick: 'THE ANVIL', speed: 0.95, guard: 0.55, hp: 110, dmg: 1.35, gold: 60, trick: { name: 'IRON HAMMER', beat: 'side', tell: 'Both gloves go up high. It smashes through a block: lean away.' }, look: ['#3a3836', '#1a1918'], kit: ['#5a646d', '#201e1d', '#e8792e'], tricky: 0.4 },
  { id: 'lyra', name: 'LYRA', nick: 'THE CHAMPION', speed: 1.2, guard: 0.6, hp: 120, dmg: 1.2, gold: 150, trick: { name: 'SPIN UPPERCUT', beat: 'duck', tell: 'She spins on the spot. Duck under it.' }, look: ['#f0dcbe', '#c2a577'], kit: ['#ec3013', '#f2c94c', '#f2c94c'], tricky: 0.45, mix: true }];
const COACH = { id: 'bruno', name: 'COACH BRUNO', nick: 'BOXING GYM', speed: 0.7, guard: 0, hp: 999, dmg: 0, gold: 0, trick: null, look: ['#9a9a9e', '#6a6a70'], kit: ['#201e1d', '#ec3013', '#ec3013'], tricky: 0 };
export const LESSONS = [
  { id: 'jab', title: 'JABS', goal: 5, text: 'Tap 1 for a LEFT jab, tap 2 for a RIGHT jab. Quick and cheap on stamina. Land 5 on the pads.' },
  { id: 'upper', title: 'UPPERCUT', goal: 2, text: 'HOLD 1 or 2 to charge an uppercut with that glove. The longer you hold, the harder it hits (it tops out). Let go to throw. Land 2 strong ones.' },
  { id: 'block', title: 'BLOCK', goal: 3, text: 'Bruno throws punches. HOLD 3 to keep your guard up. Block 3.' },
  { id: 'dodge', title: 'DODGE', goal: 3, text: 'Watch his shoulder. Hooks: lean the other way or duck (stick down). Uppercuts: lean left or right. Dodge 3.' },
  { id: 'counter', title: 'COUNTER', goal: 2, text: 'When he winds up, a ring shrinks on his glove. Punch (1 or 2) on GREEN to counter. 2 counters.' },
  { id: 'hay', title: '8-GATE HAYMAKER', goal: 1, text: 'Good boxing fills the crowd meter. When it is full press 1 + 2 together. Land the haymaker.' }];
const SK = { lesson: 'luxor.box.lesson', round: 'luxor.box.round', wins: 'luxor.box.wins' };
const CROWD = ['#e2453f', '#3a6ea5', '#f2c94c', '#fbf8ec', '#2f9a8f', '#e8792e', '#201e1d', '#a8792e', '#f07a72'], FURS = ['#e8792e', '#c9682a', '#9a6f4a', '#e6e4de', '#3a3836', '#f0dcbe'];

export async function createBoxing({ container, onState = () => {} }) {
  const ST = createStage(container, { bg: '#1a0f0c' }), { CW, CHh, renderer, scene, camera, V3, toon, M, kit, audio, tone, puff, smokeS, sun, glowTex, touch } = ST;
  camera.far = 140; camera.updateProjectionMatrix();
  scene.background = canvasTex(4, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#2a0e08'); g.addColorStop(0.6, '#5a1e10'); g.addColorStop(1, '#8a3a1a'); c.fillStyle = g; c.fillRect(0, 0, 4, 256); });
  sun.position.set(0.4, 15, 0.6); sun.intensity = 1.9; Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); sun.shadow.camera.updateProjectionMatrix();
  // ---------- the pit + the ring ----------
  const flat = (r, col, y) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), toon(col)); m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; scene.add(m); return m; };
  flat(60, '#3a1a10', 0); flat(13, '#d9a86a', 0.01);
  { const matT = canvasTex(512, 512, c => { c.fillStyle = '#e8dcc4'; c.fillRect(0, 0, 512, 512); c.strokeStyle = '#a82c26'; c.lineWidth = 18; c.strokeRect(9, 9, 494, 494); c.fillStyle = '#a82c26'; c.font = '900 260px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = 0.85; c.fillText('L', 256, 270); });
    M(new THREE.BoxGeometry(6.4, RY, 6.4), toon('#5a1e10'), 0, RY / 2, 0, scene, 0.02); const mat = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 6.2), new THREE.MeshToonMaterial({ map: matT, gradientMap: ST.grad })); mat.rotation.x = -Math.PI / 2; mat.position.y = RY + 0.005; mat.receiveShadow = true; scene.add(mat);
    const posts = [[-3, -3, '#ec3013'], [3, -3, '#3a6ea5'], [3, 3, '#fbf8ec'], [-3, 3, '#fbf8ec']]; for (const [x, z, c] of posts) { M(new THREE.CylinderGeometry(0.09, 0.09, 1.6, 10), toon('#c9c3b8'), x, RY + 0.8, z, scene, 0.01, 0.09); M(new THREE.BoxGeometry(0.3, 0.9, 0.3), toon(c), x * 0.97, RY + 0.85, z * 0.97, scene, 0.012); }
    const ropeCol = ['#ec3013', '#fbf8ec', '#3a6ea5']; for (let i = 0; i < 3; i++) { const y = RY + 0.5 + i * 0.4; for (const [x0, z0, x1, z1] of [[-3, -3, 3, -3], [3, -3, 3, 3], [3, 3, -3, 3], [-3, 3, -3, -3]]) { if (z0 === 3 && z1 === 3) continue; const L = Math.hypot(x1 - x0, z1 - z0), r = M(new THREE.CylinderGeometry(0.035, 0.035, L, 6), toon(ropeCol[i]), (x0 + x1) / 2, y, (z0 + z1) / 2, scene, 0.006, 0.035); r.rotation.z = x0 !== x1 ? Math.PI / 2 : 0; r.rotation.x = z0 !== z1 ? Math.PI / 2 : 0; } } }
  // tiers + 200 fans (instanced), braziers, the IRON BELT on its stand
  const seats = [], tierM = [toon('#6b2a18'), toon('#5a2414')];
  for (let r = 0; r < 4; r++) { const rad = 9.5 + r * 1.3, h = 0.8 + r * 0.8, ring = new THREE.Mesh(new THREE.CylinderGeometry(rad + 0.65, rad + 0.65, h, 48, 1, true, 0, Math.PI * 2), tierM[r % 2]); ring.position.y = h / 2; ring.material.side = THREE.DoubleSide; scene.add(ring); const top = new THREE.Mesh(new THREE.RingGeometry(rad - 0.65, rad + 0.65, 48), tierM[(r + 1) % 2]); top.rotation.x = -Math.PI / 2; top.position.y = h; scene.add(top);
    const n = Math.round(rad * 5.2); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if (Math.abs(Math.sin(a)) < 0.1 && Math.cos(a) > 0.9) continue; if (Math.random() < 0.82) seats.push({ x: Math.cos(a) * rad, y: h, z: Math.sin(a) * rad, a }); } }
  const crowdB = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.5, 0.3), new THREE.MeshToonMaterial({ gradientMap: ST.grad }), seats.length), crowdH = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 8, 6), new THREE.MeshToonMaterial({ gradientMap: ST.grad }), seats.length), dm = new THREE.Object3D(), cc = new THREE.Color();
  const placeCrowd = (jump = 0, t = 0) => { seats.forEach((p, i) => { const j = jump ? Math.max(0, Math.sin(t * 14 + i * 1.7)) * jump * 0.35 : 0; dm.position.set(p.x, p.y + 0.25 + j, p.z); dm.rotation.set(0, -p.a - Math.PI / 2, 0); dm.updateMatrix(); crowdB.setMatrixAt(i, dm.matrix); dm.position.y = p.y + 0.66 + j; dm.updateMatrix(); crowdH.setMatrixAt(i, dm.matrix); }); crowdB.instanceMatrix.needsUpdate = crowdH.instanceMatrix.needsUpdate = true; };
  seats.forEach((p, i) => { crowdB.setColorAt(i, cc.set(pick(CROWD))); crowdH.setColorAt(i, cc.set(pick(FURS))); }); placeCrowd(); scene.add(crowdB, crowdH);
  const flames = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.5, x = Math.cos(a) * 8, z = Math.sin(a) * 8; M(new THREE.CylinderGeometry(0.35, 0.2, 1.4, 8), toon('#3a3836'), x, 0.7, z, scene, 0.012); M(new THREE.CylinderGeometry(0.45, 0.35, 0.25, 10), toon('#5a646d'), x, 1.5, z, scene, 0.01); const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff8a2a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); fl.position.set(x, 1.95, z); fl.scale.setScalar(1.3); scene.add(fl); flames.push(fl); const pl = new THREE.PointLight(0xff7a2a, 0.9, 9); pl.position.set(x, 2.2, z); if (i % 2 === 0 || !touch) scene.add(pl); }
  const beltMat = toon('#f2c94c'), plateM = toon('#d9b45a');
  const mkBelt = () => { const g = new THREE.Group(); const strap = M(new THREE.TorusGeometry(0.3, 0.05, 6, 24), toon('#201e1d'), 0, 0, 0, g, 0.006); strap.rotation.x = Math.PI / 2; strap.scale.set(1, 1, 1.4); M(new THREE.BoxGeometry(0.3, 0.22, 0.05), plateM, 0, 0, 0.3, g, 0.008); M(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10), toon('#ec3013'), 0, 0, 0.33, g, 0).rotation.x = Math.PI / 2; return g; };
  { const st = new THREE.Group(); st.position.set(5.2, 0, -5.2); scene.add(st); M(new THREE.BoxGeometry(0.8, 1.6, 0.8), toon('#3a3836'), 0, 0.8, 0, st, 0.015); const b = mkBelt(); b.position.y = 1.85; b.scale.setScalar(1.6); st.add(b); }
  // ---------- fighters (everyone in boxer outfits) ----------
  const mkFox = (look, kitc, mood = 'determined', sc = 0.95) => { const f = kit.makeFox({ ...CAST.player, look: look ? { ...CAST.player.look, fur: look[0], furDark: look[1] } : CAST.player.look, torso: kitc, outfit: 'boxer', crest: '', gear: 'none', mood }); const P0 = f.userData.P; if (P0.sword) P0.sword.visible = false; if (P0.gun) P0.gun.visible = false; f.scale.setScalar(sc); f.userData.wagMul = 0.4; scene.add(f); return f; };
  const benF = mkFox(null, ['#fbf8ec', '#ec3013', '#38bdf8']);
  const rivalF = [...RIVALS, COACH].map(r => { const f = mkFox(r.look, r.kit, 'stern'); f.visible = false; return f; });
  const refF = mkFox(['#e6e4de', '#a8a6a0'], ['#201e1d', '#fbf8ec', '#fbf8ec'], 'neutral', 0.85); refF.position.set(3.6, 0, -3.7); refF.rotation.y = -Math.PI * 0.75;
  const benBelt = mkBelt(); benBelt.visible = false; benBelt.scale.setScalar(1.05); benF.userData.P.body.add(benBelt); benBelt.position.y = 0.72;
  const starT = canvasTex(64, 64, c => { c.fillStyle = '#ffd23a'; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 12 : 30, a = i / 10 * Math.PI * 2 - Math.PI / 2; c.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } c.closePath(); c.fill(); c.strokeStyle = '#201e1d'; c.lineWidth = 3; c.stroke(); });
  const stars = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starT, transparent: true, depthWrite: false })); s.scale.setScalar(0.28); s.visible = false; scene.add(s); return s; });
  const ovl = (geo, col, op = 1) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthTest: false, depthWrite: false, side: THREE.DoubleSide })); m.renderOrder = 60; m.visible = false; scene.add(m); return m; };
  const ringO = ovl(new THREE.RingGeometry(0.2, 0.26, 40), 0xffd23a, 0.75), ringI = ovl(new THREE.RingGeometry(0.2, 0.22, 40), 0xffffff, 0.6);
  const pop = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff2b0, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); pop.renderOrder = 70; scene.add(pop);
  const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); glint.scale.setScalar(0.5); glint.visible = false; scene.add(glint);
  // ---------- state ----------
  const S = { mode: 'intro', ph: 'idle', t: 0, L: 0, lc: 0, lessonDone: false, round: 0, flash: null, flashT: 0, call: '', callT: 0, overT: 0, next: '', done: null, cheer: 0, bot: false, demo: false, kd: [0, 0], crowd: 0, cam: 'fight', shake: 0 };
  const ben = { f: benF, hp: 100, st: 100, guard: false, lean: 0, duck: 0, punch: null, hurt: 0, down: 0, cd: 0, hold2: null, pend1: null, x: 0 };
  const opp = { f: rivalF[0], cfg: RIVALS[0], hp: 100, state: 'idle', t: 0, atk: null, lean: 0, duck: 0, punch: null, hurt: 0, down: 0, daze: 0, guardUp: true, x: 0 };
  const stick = { x: 0, y: 0 }, keys = new Set(); let PAUSE = false, CAMV = 'classic';
  // classic arcade-boxing framing: camera straight behind Ben, Ben drawn see-through so the rival is never hidden
  const benMats = []; benF.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); benMats.push(m.material); m.receiveShadow = false; } }); let benGhost = -1;
  const gloveMats = new Set(); const gloveOutlines = []; (benF.userData.P.arms || []).forEach(arm => arm.traverse(m => { if (m.isMesh && m.geometry.type === 'SphereGeometry' && m.parent === arm) { gloveMats.add(m.material); m.renderOrder = 41; m.children.forEach(c => gloveOutlines.push(c)); } }));
  gloveMats.forEach(m => { if (m.emissive) m.emissive.set('#38bdf8').multiplyScalar(0.6); });
  const ghostBen = on => { if (on === benGhost) return; benGhost = on; gloveMats.forEach(mt => { mt.depthTest = !on; mt.needsUpdate = true; }); gloveOutlines.forEach(c => c.visible = !on); benMats.forEach(mt => { if (gloveMats.has(mt)) return; mt.transparent = on; mt.opacity = on ? 0.42 : 1; mt.depthWrite = !on; mt.needsUpdate = true; }); benF.renderOrder = on ? 30 : 0; };
  const flash = (txt, col = '#ffd23a', t = 1.1) => { S.flash = { txt, col }; S.flashT = t; }, call = (txt, t = 2.2) => { S.call = txt; S.callT = t; };
  const cheer = (n = 1.4) => { S.cheer = Math.max(S.cheer, n); try { for (let i = 0; i < 5; i++) setTimeout(() => audio.burst && audio.burst(0.25, 1500 + Math.random() * 1200, 0.08), i * 130); } catch (e) {} };
  const bell = (n = 1) => { for (let i = 0; i < n; i++) setTimeout(() => { tone(1320, 0.5, 0.06, 'sine'); tone(1980, 0.35, 0.03, 'sine'); }, i * 280); };
  const thwack = (k = 1) => { tone(90 * k, 0.09, 0.12, 'triangle'); tone(260 * k, 0.04, 0.05, 'square'); try { audio.burst && audio.burst(0.05, 900, 0.06); } catch (e) {} };
  const crowdAdd = n => { const was = S.crowd >= 1; S.crowd = clamp(S.crowd + n, 0, 1); if (!was && S.crowd >= 1) { flash('CROWD IS WILD · 1 + 2 = 8-GATE HAYMAKER', '#ffd23a', 1.8); cheer(1.2); } };
  function setRival(cfg) { opp.cfg = cfg; const i = cfg === COACH ? 5 : RIVALS.indexOf(cfg); rivalF.forEach((f, k) => f.visible = k === i); opp.f = rivalF[i]; }
  // ---------- input ----------
  const benDodge = () => { const sx = S.bot ? (S.botLean || 0) : (keys.has('KeyA') || keys.has('ArrowLeft') ? -1 : keys.has('KeyD') || keys.has('ArrowRight') ? 1 : stick.x), sy = S.bot ? (S.botDuck ? -1 : 0) : (keys.has('KeyS') || keys.has('ArrowDown') ? -1 : stick.y); if (sy < -0.5) return 'duck'; if (sx < -0.45) return 'left'; if (sx > 0.45) return 'right'; return null; };
  const ARM = { 1: 1, 2: 0 };   // button 1 = left glove (arms[1]), 2 = right glove (arms[0])
  function press(n, down = true) { if (PAUSE || (S.mode !== 'lesson' && S.mode !== 'match')) return; try { audio.init && audio.init(); } catch (e) {}
    if (n === 3) { ben.guard = down; return; } ben.hold = ben.hold || {};
    if (!down) { const t0 = ben.hold[n]; ben.hold[n] = null; if (t0 == null || S.ph !== 'fight') return; const h = S.t - t0; if (h < 0.2) throwPunch('jab', 0, ARM[n]); else throwPunch('power', clamp(h / 0.8, 0, 1), ARM[n]); return; }
    if (S.ph !== 'fight' || ben.down > 0 || ben.hurt > 0.2) return; const o = n === 1 ? 2 : 1;
    if (S.crowd >= 1 && ben.hold[o] != null && S.t - ben.hold[o] < 0.2) { ben.hold = {}; throwPunch('hay', 0, 0); return; }
    ben.hold[n] = S.t; }
  const COST = { jab: 6, upper: 13, power: 22, hay: 0 }, DMG = { jab: 5, upper: 10, power: 18, hay: 38 }, WIND = { jab: 0.11, upper: 0.22, power: 0.3, hay: 0.42 };
  function throwPunch(kind, pw = 0, arm = null) { if (kind === 'hay') { ben.punch = null; ben.cd = 0; } if (ben.punch || ben.cd > 0) return; if (kind === 'hay') S.crowd = 0; const tired = ben.st < COST[kind]; ben.st = Math.max(0, ben.st - COST[kind]); ben.punch = { kind, t: 0, dur: WIND[kind] + 0.16, hit: WIND[kind], pw, tired, arm: arm != null ? arm : (kind === 'jab' ? 1 : 0), done: false }; S.camSwing = { side: (arm != null ? arm : 1) === 1 ? -1 : 1, t: kind === 'hay' ? 0.6 : 0.42, amp: kind === 'jab' ? 0.7 : 1 }; ben.cd = kind === 'jab' ? 0.18 : 0.32; tone(kind === 'hay' ? 220 : 520, 0.04, 0.03, 'sine'); if (tired) flash('TIRED · LET YOUR STAMINA COME BACK', '#e6b45a', 0.9); }
  function resolveBen(p) { const o = opp, c = o.cfg; let dmg = DMG[p.kind] * (p.kind === 'power' ? 0.6 + 0.4 * p.pw : 1) * (p.tired ? 0.4 : 1), msg = '', col = '#ffffff';
    if (o.state === 'down' || S.ph !== 'fight') return;
    const green = o.state === 'windup' && o.atk && o.atk.counterable && Math.abs(o.atk.strike - S.t) < 0.16 && o.atk.strike - S.t > -0.02;
    if (green) { dmg *= 2.1; msg = 'COUNTER!'; col = '#22c55e'; o.atk = null; o.state = 'dazed'; o.daze = 1.3; crowdAdd(0.28); cheer(1); if (S.mode === 'lesson' && LESSONS[S.L].id === 'counter') lessonCount('COUNTER'); }
    else if (o.state === 'windup' && o.atk && o.atk.feint && !o.atk.real) { msg = 'HE FEINTED'; col = '#e6b45a'; dmg *= 0.5; }
    else if ((o.state === 'idle' || o.state === 'windup') && Math.random() < c.guard * (p.kind === 'jab' ? 1 : 0.7) && p.kind !== 'hay') { o.blockFx = 0.25; tone(320, 0.04, 0.04, 'square'); flash('BLOCKED', '#9ca3af', 0.5); ben.st = Math.max(0, ben.st - 3); return; }
    else if (o.state === 'recover') { dmg *= 1.3; msg = p.kind === 'jab' ? '' : 'OPENING!'; } else if (o.state === 'dazed') dmg *= 1.5;
    if (p.kind === 'hay') { msg = '8-GATE HAYMAKER!'; col = '#ffd23a'; o.state = 'dazed'; o.daze = 1.6; S.shake = 0.5; cheer(2.2); for (let i = 0; i < 10; i++) puff(o.f.position.x + rr(-0.3, 0.3), RY + 1.8, OZ + rr(-0.2, 0.2), 0xffd23a, 1); if (S.mode === 'lesson' && LESSONS[S.L].id === 'hay') lessonCount('HAYMAKER'); }
    if (p.kind === 'power' && p.pw > 0.8 && o.state !== 'dazed') { o.state = 'dazed'; o.daze = 0.9; }
    o.hurt = 0.3; thwack(p.kind === 'jab' ? 1.4 : 0.9); if (ben.gloveAt) pop.position.copy(ben.gloveAt); else pop.position.set(o.f.position.x, RY + 2.0, OZ + 0.45); pop.material.opacity = 1; pop.scale.setScalar(p.kind === 'jab' ? 0.7 : p.kind === 'hay' ? 2.2 : 1.2); S.punchKick = p.kind === 'jab' ? 0.12 : 0.25; crowdAdd(p.kind === 'jab' ? 0.04 : 0.09); if (S.mode !== 'lesson') o.hp -= dmg;
    if (msg) flash(msg, col, 0.9); puff(o.f.position.x, RY + 1.5, OZ + 0.25, 0xffffff, p.kind === 'jab' ? 1 : 3);
    if (S.mode === 'lesson') { const id = LESSONS[S.L].id; if (id === 'jab' && p.kind === 'jab') lessonCount('JAB'); if (id === 'upper' && p.kind === 'power' && p.pw > 0.5) lessonCount('POWER UPPERCUT'); else if (id === 'upper' && p.kind === 'power') flash('HOLD A LITTLE LONGER', '#ffffff', 1); else if (id === 'upper' && p.kind === 'jab') flash('HOLD THE BUTTON TO CHARGE', '#ffffff', 1); }
    if (o.hp <= 0) knockdown(1); }
  // ---------- rival AI ----------
  const ATK = { jab: { wind: 0.42, dmg: 6, block: true, beats: ['left', 'right', 'duck'], counter: true }, hookL: { wind: 0.62, dmg: 10, block: true, beats: ['right', 'duck'], counter: true, side: -1 }, hookR: { wind: 0.62, dmg: 10, block: true, beats: ['left', 'duck'], counter: true, side: 1 }, upper: { wind: 0.72, dmg: 12, block: true, beats: ['left', 'right'], counter: true } };
  function startAttack() { const o = opp, c = o.cfg, lesson = S.mode === 'lesson'; let type = pick(['jab', 'jab', 'hookL', 'hookR', 'upper']), trick = false;
    if (lesson) { const id = LESSONS[S.L].id; type = id === 'block' ? pick(['jab', 'hookL', 'hookR']) : id === 'dodge' ? pick(['hookL', 'hookR', 'upper', 'jab']) : pick(['hookL', 'hookR', 'upper']); }
    else if (c.trick && Math.random() < c.tricky) trick = true; const tk = c.mix ? pick([RIVALS[0].trick, RIVALS[2].trick, RIVALS[3].trick, c.trick, c.trick]) : c.trick;
    const base = trick ? { wind: 1.0, dmg: 18, block: tk.beat === 'block', beats: tk.beat === 'side' ? ['left', 'right'] : tk.beat === 'duck' ? ['duck'] : tk.beat === 'block' ? [] : ['left', 'right', 'duck'], counter: false, trick: tk.name } : ATK[type];
    const sp = lesson ? 0.75 : c.speed, wind = base.wind / sp; o.atk = { type: trick ? 'trick' : type, ...base, wind, strike: S.t + wind, counterable: base.counter, hits: trick && tk.name === 'FLURRY' ? 3 : 1, feint: c.id === 'vek' && (trick || Math.random() < 0.25), real: false };
    if (o.atk.feint) { o.atk.strike = S.t + wind * 0.6; o.atk.counterable = false; }
    o.state = 'windup'; o.t = S.t; if (trick) { flash(c.name + ': ' + tk.name + '!', '#ff9a8a', 1.2); tone(160, 0.3, 0.04, 'sawtooth'); } }
  function strike() { const o = opp, a = o.atk; if (!a) return; if (a.feint && !a.real) { a.real = true; a.type = 'jab'; Object.assign(a, ATK.jab, { wind: 0.28, strike: S.t + 0.28, counterable: true }); o.state = 'windup'; o.t = S.t; flash('FEINT!', '#e6b45a', 0.6); return; }
    const d = benDodge(), c = o.cfg, dmg = a.dmg * (S.mode === 'lesson' ? 0 : c.dmg); o.punch = { t: 0, arm: a.side === 1 ? 0 : 1, kind: a.type === 'upper' || a.trick === 'SPIN UPPERCUT' ? 'upper' : 'jab' };
    if (ben.down > 0) { o.atk = null; o.state = 'idle'; return; }
    if (d && a.beats.includes(d)) { flash('DODGED', '#7dd3fc', 0.7); tone(700, 0.05, 0.03, 'sine'); crowdAdd(0.1); o.state = 'recover'; o.t = S.t; o.rec = a.trick ? 1.4 : 0.9; if (S.mode === 'lesson' && LESSONS[S.L].id === 'dodge') lessonCount('DODGE'); }
    else if (ben.guard && a.block) { flash('BLOCKED', '#ffffff', 0.6); tone(300, 0.05, 0.05, 'square'); ben.st = Math.max(0, ben.st - 7); ben.hp -= dmg * 0.15; ben.hurt = 0.12; o.state = a.hits > 1 ? 'windup' : 'recover'; o.t = S.t; o.rec = 0.6; if (S.mode === 'lesson' && LESSONS[S.L].id === 'block') lessonCount('BLOCK'); }
    else { const bt = ben.guard && !a.block ? ' · IT SMASHES THROUGH' : d && !a.beats.includes(d) ? ' · WRONG WAY' : ''; ben.hp -= dmg; ben.hurt = 0.4; S.shake = 0.25; thwack(0.8); flash((a.trick ? a.trick : 'HIT') + bt, '#ff9a8a', 0.8); o.state = a.hits > 1 ? 'windup' : 'idle'; o.t = S.t; o.idleFor = rr(0.5, 1.2); if (S.mode === 'lesson') { const id = LESSONS[S.L].id; if (id === 'block' || id === 'dodge') flash(id === 'block' ? 'HOLD 3 BEFORE IT LANDS' : 'LEAN THE OTHER WAY, OR DUCK', '#e6b45a', 1.1); } }
    if (a.hits > 1) { a.hits--; a.strike = S.t + 0.3; a.counterable = false; } else o.atk = null;
    if (ben.hp <= 0) knockdown(0); }
  function oppThink(dt) { const o = opp; if (S.ph !== 'fight') return;
    if (o.state === 'dazed') { o.daze -= dt; if (o.daze <= 0) { o.state = 'idle'; o.t = S.t; o.idleFor = rr(0.3, 0.7); } return; }
    if (o.state === 'recover') { if (S.t - o.t > (o.rec || 0.8)) { o.state = 'idle'; o.t = S.t; o.idleFor = rr(0.4, 1.2); } return; }
    if (o.state === 'windup') { if (S.t >= o.atk.strike) strike(); return; }
    if (o.state === 'idle') { const lesson = S.mode === 'lesson', id = lesson && LESSONS[S.L].id; if (lesson && (id === 'jab' || id === 'upper' || id === 'hay')) return; if (S.t - o.t > (o.idleFor || 1.2) / (lesson ? 0.8 : o.cfg.speed)) startAttack(); } }
  // ---------- knockdowns ----------
  function knockdown(who) { const o = opp; S.kd[who]++; S.ph = 'down'; S.downWho = who; S.overT = S.t + 3.6; S.count = 0; S.countT = S.t + 0.7; o.atk = null; ben.punch = null; S.shake = 0.6; tone(80, 0.5, 0.12, 'triangle'); stars.forEach(s => s.visible = false);
    if (who === 1) { o.state = 'down'; o.down = 1; cheer(2.2); flash(o.cfg.name + ' IS DOWN!', '#22c55e', 1.4); } else { ben.down = 1; flash('YOU ARE DOWN!', '#ff9a8a', 1.4); }
    call('KNOCKDOWN · ' + (who === 1 ? 'BEN ' + S.kd[1] + ' OF 3' : o.cfg.name + ' ' + S.kd[0] + ' OF 3'), 2); }
  function afterDown() { const o = opp, who = S.downWho;
    if (S.kd[who] >= 3) { S.ph = 'over'; S.overT = S.t + 1.6; S.next = 'finish'; S.won = who === 1; bell(3); call(who === 1 ? 'WINNER BY KNOCKOUT · BEN!' : 'WINNER BY KNOCKOUT · ' + o.cfg.name, 3); if (who === 1) cheer(3); return; }
    if (who === 1) { o.down = 0; o.state = 'idle'; o.t = S.t; o.hp = o.cfg.hp * (1 - S.kd[1] * 0.2); } else { ben.down = 0; ben.hp = 100 - S.kd[0] * 15; ben.st = 80; }
    S.ph = 'fight'; bell(1); call('FIGHT!', 1.2); }
  // ---------- flow ----------
  function resetFighters() { Object.assign(ben, { hp: 100, st: 100, guard: false, punch: null, hurt: 0, down: 0, cd: 0, hold2: null, pend1: null }); Object.assign(opp, { hp: opp.cfg.hp, state: 'idle', t: S.t, atk: null, punch: null, hurt: 0, down: 0, daze: 0, idleFor: 1.5 }); S.kd = [0, 0]; }
  function startMatch(r) { r = clamp(r | 0, 0, RIVALS.length - 1); stick.x = stick.y = 0; audio.init && audio.init(); S.mode = 'match'; S.round = r; S.done = null; S.crowd = 0; setRival(RIVALS[r]); resetFighters(); benBelt.visible = false; S.ph = 'intro'; S.overT = S.t + 3.4; S.cam = 'fight';
    const c = RIVALS[r]; call('IN THIS CORNER... ' + c.nick + ' · ' + c.name + '!', 3.2); setTimeout(() => S.mode === 'match' && call('THE TELL: ' + c.trick.tell, 3.4), 1700); }
  function finishMatch() { if (S.demo) { demoStop(); return; } const c = opp.cfg, r = S.round, won = S.won; let gold = 0, relic = false;
    try { if (won) { gold = c.gold; save.addGold(gold); save.setStat(SK.round, Math.max(save.stat(SK.round, 0), r + 1)); save.setStat(SK.wins, save.stat(SK.wins, 0) + 1); if (r === RIVALS.length - 1) { save.addRelic('ironBelt'); save.setFlag('luxorIronBelt'); relic = true; } } } catch (e) {}
    const champ = won && r === RIVALS.length - 1, res = { won, opp: c.name, nick: c.nick, kd: S.kd.slice(), gold, relic, next: won && r < RIVALS.length - 1 ? RIVALS[r + 1] : null, champ, round: 'FIGHT ' + (r + 1) + ' OF ' + RIVALS.length };
    if (champ) { S.ph = 'ceremony'; S.overT = S.t + 5; S.cam = 'ceremony'; benBelt.visible = true; cheer(4); call('YOUR NEW CHAMPION · THE IRON BELT!', 4); S.pendingDone = res; return; }
    S.mode = 'done'; S.ph = 'idle'; S.done = res; }
  function startLesson(i) { stick.x = stick.y = 0; audio.init && audio.init(); S.mode = 'lesson'; S.L = clamp(i | 0, 0, LESSONS.length - 1); S.lc = 0; S.lessonDone = false; S.done = null; setRival(COACH); resetFighters(); S.crowd = LESSONS[S.L].id === 'hay' ? 1 : 0; S.ph = 'intro'; S.overT = S.t + 2; S.cam = 'fight'; call('BOXING GYM · LESSON ' + (S.L + 1) + ' · ' + LESSONS[S.L].title, 2.2); }
  function lessonCount(what) { const Lz = LESSONS[S.L]; S.lc++; tone(1175, 0.06, 0.04); flash(what + ' ' + Math.min(S.lc, Lz.goal) + ' / ' + Lz.goal, '#22c55e', 0.9); if (Lz.id === 'hay') S.crowd = 1; if (S.lc >= Lz.goal && !S.lessonDone) { S.lessonDone = true; S.ph = 'over'; S.overT = S.t + 1.6; S.next = 'lessonNext'; } }
  function lessonNext() { const n = S.L + 1; try { save.setStat(SK.lesson, Math.max(save.stat(SK.lesson, 0), n)); } catch (e) {} cheer(1);
    if (n >= LESSONS.length) { try { save.setFlag('luxorBoxLessons'); } catch (e) {} S.mode = 'done'; S.ph = 'idle'; S.done = { lessons: true }; return; } startLesson(n); }
  // ---------- demo + bot ----------
  function demoStart() { if (S.mode === 'lesson' || S.mode === 'match') return; S.demo = true; S.bot = true; startMatch(0); S.demoEnd = S.t + 65; }
  function demoStop() { if (!S.demo) return; S.demo = false; S.bot = false; api.toIntro(); }
  function demoCap() { const o = opp; if (S.ph === 'intro') return ['', 'WATCH A FIGHT IN THE PIT']; if (S.ph === 'down') return ['', 'KNOCK HIM DOWN 3 TIMES TO WIN'];
    if (S.crowd >= 1) return ['1+2', 'CROWD METER FULL: 1 + 2 TOGETHER = 8-GATE HAYMAKER']; if (o.state === 'windup' && o.atk && o.atk.counterable) return ['1', 'HE WINDS UP: PUNCH ON THE GREEN RING TO COUNTER']; if (o.state === 'windup') return ['STICK', 'A TRICK! LEAN, DUCK OR HOLD 3 TO BLOCK'];
    if (o.state === 'recover' || o.state === 'dazed') return ['HOLD', 'HE IS OPEN: HOLD 1 OR 2 FOR A CHARGED UPPERCUT']; return ['1 / 2', 'TAP 1 / 2 FOR LEFT / RIGHT JABS. WATCH FOR HIS TELL']; }
  function botStep() { const o = opp, a = o.atk; S.botLean = 0; S.botDuck = false; ben.guard = false; if (S.ph !== 'fight' || ben.down > 0) return; const err = S.botErr || 0.12;
    if (o.state === 'windup' && a) { const left = a.strike - S.t; if (!S.botPlan || S.botPlan.a !== a) { const lid = S.mode === 'lesson' && LESSONS[S.L].id; S.botPlan = { a, act: lid === 'block' ? 'block' : lid === 'dodge' ? 'dodge' : lid === 'counter' && a.counterable ? 'counter' : a.counterable && Math.random() < 0.5 ? 'counter' : a.beats.length ? 'dodge' : 'block', miss: Math.random() < err }; }
      const P0 = S.botPlan; if (P0.miss) return; if (P0.act === 'counter' && left < 0.06 + WIND.jab && left > 0 && !ben.punch) throwPunch('jab', 0, Math.random() < 0.5 ? 0 : 1); else if (P0.act === 'dodge' && left < 0.25) { const b = a.beats[0]; if (b === 'duck') S.botDuck = true; else S.botLean = b === 'left' ? -1 : 1; } else if (P0.act === 'block' && left < 0.4) ben.guard = true; return; }
    if (S.crowd >= 1 && !ben.punch) { throwPunch('hay'); return; }
    if ((o.state === 'recover' || o.state === 'dazed') && !ben.punch && ben.cd <= 0) { if (ben.st > 30 && Math.random() < 0.4) throwPunch('power', 0.9, Math.random() < 0.5 ? 0 : 1); else throwPunch('jab', 0, Math.random() < 0.5 ? 0 : 1); return; }
    if (o.state === 'idle' && !ben.punch && ben.cd <= 0 && ben.st > 40 && Math.random() < 0.05) throwPunch('jab', 0, Math.random() < 0.5 ? 0 : 1); }
  // ---------- poses ----------
  const _t1 = new THREE.Vector3(), _t2 = new THREE.Vector3();
  function pose(F, X, dt, facing) { const P0 = F.userData.P, arms = P0.arms; kit.animFox && kit.animFox(F, dt, 0); if (!arms) return; const d = X.lean || 0, k = X.duck || 0;
    F.position.set(X.x + d * 0.45 * (facing > 0 ? -1 : 1), RY - k * 0.28, facing > 0 ? BZ : OZ); P0.body.rotation.z = d * 0.32 * (facing > 0 ? 1 : -1); P0.body.rotation.x = k * 0.35 + (X.hurt > 0 ? -0.25 * X.hurt : 0);
    const guard = X.guard || X.blockFx > 0; arms.forEach((a, i) => { const s = i === 0 ? 1 : -1; a.position.set(a.userData.x0 ?? (a.userData.x0 = a.position.x), a.userData.y0 ?? (a.userData.y0 = a.position.y), 0.24); if (guard) a.rotation.set(-2.35, 0, s * 0.55); else a.rotation.set(-1.85, 0, s * 0.32); });
    const p = X.punch; if (p) { const a = arms[p.arm], s = p.arm === 0 ? 1 : -1, u = clamp(p.t / (p.hit || 0.12), 0, 1), back = clamp((p.t - (p.hit || 0.12)) / 0.16, 0, 1), e = u < 1 ? u : 1 - back;
      const big = X === ben ? 1 : 0.6; a.scale.setScalar(1.25 * (1 + e * 0.45 * big));
      if (p.kind === 'jab') { a.rotation.set(-1.85 + e * 0.3, 0, s * 0.32 * (1 - e)); a.position.z = 0.24 + e * 0.75 * big; P0.body.rotation.y = -s * e * 0.45 * big; }
      else { const hk = p.kind === 'hay'; a.rotation.set(-0.6 - e * (hk ? 2.0 : 2.4), 0, s * (hk ? 0.9 : 0.2) * (1 - e * 0.5)); a.position.z = 0.24 + e * (hk ? 0.85 : 0.5) * big; P0.body.rotation.y = -s * e * (hk ? 0.8 : 0.55) * big; P0.body.rotation.x -= e * 0.18 * big; F.position.y += e * 0.06 * big; } }
    if (p && arms[p.arm].children[1]) { const a = arms[p.arm], tF = X === ben ? opp.f : benF, sc = tF.scale.y, face = tF.userData.P.head, e = clamp(p.t / (p.hit || 0.12), 0, 1) < 1 ? clamp(p.t / (p.hit || 0.12), 0, 1) : 1 - clamp((p.t - (p.hit || 0.12)) / 0.16, 0, 1);
      const tw = _t1; if (face) face.getWorldPosition(tw); else tw.set(tF.position.x, tF.position.y + 1.7 * sc, tF.position.z); tw.y += (p.kind === 'jab' ? -0.05 : -0.28) * sc; if (X === ben) tw.x += (p.arm === 1 ? -1 : 1) * 0.22 * sc; tw.z += (X === ben ? 0.34 : -0.34) * sc; if (X !== ben && (ben.lean || ben.duck)) tw.set(tF.position.x - (ben.lean || 0) * 0.45, tw.y + (ben.duck || 0) * 0.3, tw.z);
      F.updateMatrixWorld(true); const reach = Math.min(1, e * 1.15); a.children[1].getWorldPosition(_t2); F.position.x += (tw.x - _t2.x) * reach * 0.4; F.position.z += (tw.z - _t2.z) * reach * 0.45; F.updateMatrixWorld(true); a.children[1].getWorldPosition(_t2);
      const par = a.parent, lt = par.worldToLocal(tw.clone()), lg = par.worldToLocal(_t2.clone()); a.position.add(lt.sub(lg).multiplyScalar(reach)); F.updateMatrixWorld(true); a.children[1].getWorldPosition(_t2); X.gloveAt = _t2.clone(); }
    else arms.forEach(a => a.scale.setScalar(1.25));
    if (X === opp && X.state === 'windup' && X.atk) { const a = arms[X.atk.side === 1 ? 0 : 1], w = clamp((S.t - X.t) / X.atk.wind, 0, 1); if (X.atk.trick === 'IRON HAMMER') arms.forEach((m, i) => { m.rotation.set(-2.25 - w * 0.25, 0, (i === 0 ? 1 : -1) * 0.5); m.position.z = 0.45; }); else if (X.atk.trick === 'BELLY BUMP') { P0.body.rotation.x = -0.3 * w; } else if (X.atk.trick === 'SPIN UPPERCUT') F.rotation.y = (facing > 0 ? Math.PI : 0) + w * Math.PI * 2; else if (X.atk.trick === 'FLURRY') F.position.y += Math.abs(Math.sin(S.t * 18)) * 0.08; else { a.rotation.set(-1.4 - w * 0.3, 0, (X.atk.side || 0) * 0.5 * w); P0.body.rotation.z += (X.atk.side || 0) * 0.15 * w; if (X.atk.type === 'upper') { a.rotation.set(-0.5, 0, 0); X.duck = 0.4 * w; } } }
    if (X.down > 0) { P0.body.rotation.x = facing > 0 ? 1.3 : -1.3; F.position.y = RY - 0.1; } }
  // ---------- camera ----------
  const CAM = { look: V3(0, 1.6, 0) }; camera.position.set(0, 4, 8);
  function camShot() { const port = CW() < CHh(); if (S.mode === 'intro' || S.mode === 'done') { camera.fov = port ? 58 : 36; const sw = Math.sin(S.t * 0.25) * 0.6; return port ? { pos: V3(8.8 + sw, RY + 3.2, 0.4), look: V3(0, RY + 0.4, 0) } : { pos: V3(8.4, RY + 1.9, 2.3 + sw * 0.5), look: V3(0, RY + 1.15, 2.3) }; }
    if (S.cam === 'ceremony') { camera.fov = port ? 58 : 40; return { pos: V3(0.5, RY + 1.9, BZ - 3.6), look: V3(0, RY + 1.3, BZ) }; }
    const lx = -(ben.lean || 0) * 0.25;
    if (CAMV === 'classic') { camera.fov = port ? 52 : 38; const short = !port && CHh() < 420; return { pos: V3(lx * 0.3, RY + (port ? 3.7 : short ? 3.55 : 3.25), BZ + (port ? 4.3 : short ? 3.9 : 3.5)), look: V3(0, RY + (port ? 2.15 : short ? 2.85 : 2.25), OZ) }; }
    if (CAMV === 'side' || (CAMV === 'auto' && Math.min(CW(), CHh()) < 520)) { camera.fov = port ? 58 : 40; return port ? { pos: V3(7.4, RY + 2.6, 0.1), look: V3(0, RY + 1.15, 0.1) } : { pos: V3(5.4, RY + 1.9, 0), look: V3(0, RY + 1.2, 0) }; }
    if (CAMV === 'high') { camera.fov = port ? 60 : 44; return { pos: V3(1.6, RY + 4.6, BZ + 4.2), look: V3(0, RY + 0.9, -0.1) }; }
    camera.fov = port ? 50 : 38; return { pos: V3(0.35 + lx, RY + (port ? 3.6 : 3.1), BZ + (port ? 3.4 : 2.7)), look: V3(0.1, RY + 1.05, OZ - 0.1) }; }
  // ---------- frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0;
  function step(dt) { S.t += dt; S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.callT -= dt; if (S.callT <= 0) S.call = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.9; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.5 * p.life; p.s.scale.setScalar(0.2 + (1 - p.life) * 0.4); }
    if (S.cheer > 0) { S.cheer -= dt; placeCrowd(Math.min(1, S.cheer), S.t); if (S.cheer <= 0) placeCrowd(); }
    flames.forEach((f, i) => f.scale.setScalar(1.2 + Math.sin(S.t * 9 + i) * 0.15));
    if (S.demo && S.t > S.demoEnd) { demoStop(); return; }
    const playing = S.mode === 'lesson' || S.mode === 'match';
    if (S.ph === 'intro' && S.t >= S.overT) { S.ph = 'fight'; bell(1); call(S.mode === 'match' ? 'FIGHT!' : 'GO!', 1.2); opp.t = S.t; }
    if (S.ph === 'down') { if (S.t >= S.countT && S.count < 3) { S.count++; S.countT = S.t + 0.75; call('DOWN · ' + S.count + '...', 0.8); tone(400, 0.08, 0.04); } if (S.t >= S.overT) afterDown(); }
    if (S.ph === 'over' && S.t >= S.overT) { const n = S.next; S.next = ''; if (n === 'finish') finishMatch(); else if (n === 'lessonNext') lessonNext(); }
    if (S.ph === 'ceremony' && S.t >= S.overT) { S.mode = 'done'; S.ph = 'idle'; S.cam = 'fight'; S.done = S.pendingDone; }
    if (playing && S.ph === 'fight') { if (S.bot) botStep();
      const d = benDodge(); ben.lean = damp(ben.lean, d === 'left' ? -1 : d === 'right' ? 1 : 0, 16, dt); ben.duck = damp(ben.duck, d === 'duck' ? 1 : 0, 16, dt);
      ben.cd = Math.max(0, ben.cd - dt); ben.hurt = Math.max(0, ben.hurt - dt); opp.hurt = Math.max(0, opp.hurt - dt); opp.blockFx = Math.max(0, (opp.blockFx || 0) - dt);
      if (!ben.punch && !ben.guard) ben.st = Math.min(100, ben.st + dt * 20); else if (ben.guard) ben.st = Math.min(100, ben.st + dt * 6);
      
      if (ben.punch) { const p = ben.punch; p.t += dt; if (!p.done && p.t >= p.hit) { p.done = true; resolveBen(p); } if (p.t >= p.dur) ben.punch = null; }
      if (opp.punch) { opp.punch.t += dt; opp.punch.hit = 0.1; if (opp.punch.t > 0.3) opp.punch = null; }
      oppThink(dt); if (opp.state !== 'windup' || !(opp.atk && opp.atk.type === 'upper')) opp.duck = damp(opp.duck || 0, 0, 10, dt);
      if (S.mode === 'lesson' && opp.hp < 50) opp.hp = 100; }
    // fighters
    pose(benF, ben, dt, 1); benF.rotation.y = Math.PI; pose(opp.f, opp, dt, -1); if (!(opp.state === 'windup' && opp.atk && opp.atk.trick === 'SPIN UPPERCUT')) opp.f.rotation.y = 0;
    if (S.cam === 'ceremony') { benF.rotation.y = 0; benF.userData.P.arms.forEach((a, i) => a.rotation.set(-2.9 + Math.sin(S.t * 6 + i) * 0.15, 0, i ? -0.3 : 0.3)); opp.f.visible = false; if (Math.random() < dt * 12) puff(rr(-2, 2), RY + rr(2.5, 3.5), rr(-2, 2), pick([0xffd23a, 0xec3013, 0xfbf8ec]), 1); }
    else if (opp.cfg) opp.f.visible = true;
    refF.position.x = 3.6 + Math.sin(S.t * 0.7) * 0.15; kit.animFox && kit.animFox(refF, dt, 0);
    // dazed stars
    const dz = opp.state === 'dazed' || opp.state === 'down', bz = ben.down > 0; stars.forEach((s, i) => { const who = dz ? opp.f : bz ? benF : null; s.visible = !!who && S.cam !== 'ceremony'; if (!who) return; const a = S.t * 5 + i * 2.1; s.position.set(who.position.x + Math.cos(a) * 0.4, who.position.y + 2.2, who.position.z + Math.sin(a) * 0.4); });
    // counter ring on his glove
    const a = opp.atk; if (playing && S.ph === 'fight' && opp.state === 'windup' && a && a.counterable) { const left = a.strike - S.t, green = Math.abs(left) < 0.16, arm = opp.f.userData.P.arms[a.side === 1 ? 0 : 1], wp = new THREE.Vector3(); arm.children[1] ? arm.children[1].getWorldPosition(wp) : arm.getWorldPosition(wp);
      ringO.visible = ringI.visible = true; ringO.position.copy(wp); ringI.position.copy(wp); ringO.quaternion.copy(camera.quaternion); ringI.quaternion.copy(camera.quaternion); ringO.scale.setScalar(1 + Math.max(0, left) * 2.2); ringO.material.color.set(green ? 0x22c55e : 0xffd23a); ringI.material.color.set(green ? 0x22c55e : 0xffffff); glint.visible = false; }
    else { ringO.visible = ringI.visible = false; glint.visible = playing && opp.state === 'windup' && !!a; if (glint.visible) { glint.position.set(opp.f.position.x, RY + 2.3, OZ); glint.material.color.set(0xff6a5a); glint.scale.setScalar(0.5 + Math.sin(S.t * 20) * 0.1); } }
    const classic = CAMV === 'classic' && (S.mode === 'lesson' || S.mode === 'match') && S.cam !== 'ceremony'; ghostBen(classic); ben.x = CAMV === 'classic' ? 0 : -0.5; const cer = S.cam === 'ceremony', menu = S.mode === 'intro' || S.mode === 'done'; benF.scale.setScalar(cer || menu ? 0.95 : 0.95 * 0.86); opp.f.scale.setScalar(menu ? 0.95 : 0.95 * 1.25); benF.traverse(m => { if (m.isMesh) m.castShadow = !classic; });
    pop.material.opacity = Math.max(0, pop.material.opacity - dt * 6); pop.scale.multiplyScalar(1 + dt * 3);
    const sh = camShot(); if (S.punchKick > 0) { S.punchKick -= dt; sh.pos.z -= S.punchKick * 1.4; }
    if (S.camSwing && S.camSwing.t > 0 && CAMV !== 'side' && CAMV !== 'auto') { const cs = S.camSwing; cs.t -= dt; const k = Math.sin(clamp(cs.t / 0.42, 0, 1) * Math.PI) * cs.amp; sh.pos.x += cs.side * 0.42 * k; sh.look.x += cs.side * 0.22 * k; }
    camera.updateProjectionMatrix(); camera.position.lerp(sh.pos, Math.min(1, dt * 5)); CAM.look.lerp(sh.look, Math.min(1, dt * 5)); camera.lookAt(CAM.look);
    if (S.shake > 0) { S.shake -= dt; camera.position.x += rr(-0.06, 0.06) * S.shake * 4; camera.position.y += rr(-0.06, 0.06) * S.shake * 4; } }
  function frame() { raf = requestAnimationFrame(frame); { const pr = renderer.getPixelRatio(); if (Math.abs(renderer.domElement.width - Math.round(CW() * pr)) > 1 || Math.abs(renderer.domElement.height - Math.round(CHh() * pr)) > 1) onRs(); } const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh(), false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  const KMAP = { Digit1: 1, KeyJ: 1, Digit2: 2, KeyK: 2, Digit3: 3, Space: 3, KeyL: 3 };
  const onKD = e => { if (KMAP[e.code]) { e.preventDefault(); if (!e.repeat && !S.demo) press(KMAP[e.code], true); return; } keys.add(e.code); }, onKU = e => { keys.delete(e.code); if (KMAP[e.code] && !S.demo) press(KMAP[e.code], false); }, onBlur = () => { keys.clear(); ben.guard = false; };
  addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);
  function hud() { const Lz = S.mode === 'lesson' ? LESSONS[S.L] : null, o = opp, c = o.cfg;
    const quest = S.mode === 'match' ? ('FIGHT ' + (S.round + 1) + ' / ' + RIVALS.length + ' · VS ' + c.name + ' · KNOCKDOWNS ' + S.kd[1] + '–' + S.kd[0] + ' · FIRST TO 3') : Lz ? 'BOXING GYM · LESSON ' + (S.L + 1) + ' / ' + LESSONS.length + ' · ' + Lz.title + ' · ' + Math.min(S.lc, Lz.goal) + ' / ' + Lz.goal : 'THE FIGHTING PIT · LESSONS, THEN THE CARD';
    const hv = V3(opp.f.position.x, opp.f.position.y + 2.95 * opp.f.scale.y, opp.f.position.z).project(camera), headY = clamp((1 - hv.y) / 2, 0.04, 0.7);
    return { headY, mode: S.mode, ph: S.ph, quest, flash: S.flash, call: S.call, done: S.done, hp: Math.max(0, Math.round(ben.hp)), st: Math.round(ben.st), crowd: S.crowd, power: (() => { const hs = Object.values(ben.hold || {}).filter(v => v != null); return hs.length ? clamp((S.t - Math.min(...hs)) / 0.8, 0, 1) : null; })(),
      rival: S.mode === 'match' || S.mode === 'lesson' ? { name: c.name, nick: c.nick, hp: S.mode === 'lesson' ? 1 : clamp(o.hp / c.hp, 0, 1), kd: S.kd.slice(), trick: c.trick ? c.trick.name : '', tell: c.trick ? c.trick.tell : '' } : null,
      lesson: Lz ? { n: S.L + 1, of: LESSONS.length, title: Lz.title, text: Lz.text, c: Math.min(S.lc, Lz.goal), goal: Lz.goal } : null, demo: S.demo ? demoCap() : null, ceremony: S.ph === 'ceremony',
      prog: { lesson: save.stat(SK.lesson, 0), lessons: LESSONS.length, round: save.stat(SK.round, 0), unlocked: !!save.flag('luxorBoxLessons'), champ: !!save.flag('luxorIronBelt') }, rivals: RIVALS.map(r => ({ name: r.name, nick: r.nick, gold: r.gold })), gold: save.data.gold }; }
  frame(); setRival(RIVALS[0]);
  const api = { startLesson, startMatch, demoStart, demoStop, toIntro() { S.demo = false; S.bot = false; S.mode = 'intro'; S.ph = 'idle'; S.done = null; S.cam = 'fight'; benBelt.visible = false; setRival(RIVALS[0]); resetFighters(); },
    melee() { if (!S.demo) press(1, true); }, meleeUp() { if (!S.demo) press(1, false); }, range() { if (!S.demo) press(2, true); }, rangeUp() { if (!S.demo) press(2, false); }, jump() { if (!S.demo) press(3, true); }, jumpUp() { if (!S.demo) press(3, false); },
    setStick(x, y) { stick.x = x; stick.y = y; }, setCamView(v) { CAMV = ['side', 'high', 'auto', 'arcade'].includes(v) ? v : 'classic'; }, setPaused(v) { PAUSE = !!v; }, setHudPad() {}, start() {}, talk() {}, choose() {}, closeDialog() {}, nextLine() {}, clearToast() {}, useItem() { flash('SAVE IT FOR AFTER THE FIGHT', '#ffffff', 1.2); }, closeWheel() {}, skipTime() {}, eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy() {}, zoomBy() {}, getCam() { return { dist: 13, pitch: 0.38 }; }, setCam() {}, setMinimap() {}, toggleSound() {}, cycleWeather() {},
    mapData() { return { p: [0, BZ, Math.PI], b: [['RING', 0, 0], ['IRON BELT', 5.2, -5.2]], f: [], e: [[0, OZ]], q: null }; },
    hud, _bot(v = true, err = 0.12) { S.bot = !!v; S.botErr = err; }, _sim(n, cb, dt = 1 / 30) { for (let i = 0; i < n; i++) { step(dt); if (cb && cb(S, i) === false) break; } renderer.render(scene, camera); onState(hud()); }, _state: () => S, _ben: ben, _opp: opp,
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
