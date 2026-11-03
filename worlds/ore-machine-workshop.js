// ORE SHAFT MACHINE WORKSHOP (s364): a cave turntable for the Ore Shaft machines (worlds/ore-machines.js) with the player fox as
// the target. HACKED: plays its attack on a loop (tell → attack → rest) with the live tuning. FREED: idles, steady cyan eye.
// UNHACK demo: the machine is stunned, the unhack ring fills over the UNHACK HOLD time, then it is freed (relay: destroyed).
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, lerp, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js';
import { CAST } from '../engine/cast.js';
import { buildMachine, poseMachine, KIND, LINES, BOSS } from './ore-machines.js?v=s364aj';

export async function createMachineWorkshop({ container, onEvent = () => {} }) {
  const touch = matchMedia('(pointer: coarse)').matches, W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, preserveDrawingBuffer: true }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.5 : 2)); renderer.setSize(W(), H()); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = !touch;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1d252c'); scene.fog = new THREE.Fog(0x1d252c, 24, 58);
  const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xc8dcf0, 0x30363c, 1.35)); const sun = new THREE.DirectionalLight(0xfff0d8, 1.3); sun.position.set(-6, 12, 8); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); scene.add(sun);
  const lampL = new THREE.PointLight(0xffc870, 18, 14, 1.6); lampL.position.set(2, 3.4, -4); scene.add(lampL);
  const grad = makeGradient(), cache = new Map(), toon = c => { if (!cache.has(c)) cache.set(c, new THREE.MeshToonMaterial({ color: c, gradientMap: grad })); return cache.get(c); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x0e0c14, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const CT = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const glowTex = CT(64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  // stage: cave rock floor, icy puddles, a work lamp on a post, the glowing guide line, rock walls in the fog
  const rockTex = CT(256, 256, (g, w) => { g.fillStyle = '#4a5058'; g.fillRect(0, 0, w, w); for (let i = 0; i < 900; i++) { const v = 60 + Math.random() * 40 | 0; g.fillStyle = `rgb(${v},${v + 4},${v + 10})`; g.fillRect(Math.random() * w, Math.random() * w, 2 + Math.random() * 6, 2 + Math.random() * 6); } g.strokeStyle = 'rgba(20,24,30,0.5)'; g.lineWidth = 2; for (let i = 0; i < 12; i++) { g.beginPath(); let x = Math.random() * w, y = Math.random() * w; g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (Math.random() - 0.5) * 60; y += (Math.random() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); } });
  rockTex.wrapS = rockTex.wrapT = THREE.RepeatWrapping; rockTex.repeat.set(8, 8);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(22, 48), new THREE.MeshLambertMaterial({ map: rockTex })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const ice = new THREE.MeshLambertMaterial({ color: 0x9fd8ec, transparent: true, opacity: 0.75 }); for (const [x, z, r] of [[-3, 3.5, 1.4], [5.5, -3.2, 1.1], [9, 2.8, 0.8]]) { const d = new THREE.Mesh(new THREE.CircleGeometry(r, 20), ice); d.rotation.x = -Math.PI / 2; d.position.set(x, 0.015, z); d.scale.set(1, 0.7, 1); scene.add(d); }
  const guide = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.14), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.55, toneMapped: false })); guide.rotation.x = -Math.PI / 2; guide.position.set(3, 0.02, 2.2); scene.add(guide);
  { const post = M(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 8), toon('#3b4049'), 2, 1.6, -4); void post; M(new THREE.BoxGeometry(0.5, 0.3, 0.3), toon('#e0b020'), 2, 3.3, -3.85); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffc870, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(1.6); gl.position.set(2, 3.25, -3.7); scene.add(gl); }
  { const rk = toon('#3a4048'); for (let i = 0; i < 16; i++) { const a = Math.PI + i / 15 * Math.PI, r = rr(15, 19); const m = M(new THREE.DodecahedronGeometry(rr(2, 4), 0), rk, Math.cos(a) * r, rr(0.5, 2.5), Math.sin(a) * r, null, 0); m.scale.y = rr(1.2, 2.4); m.rotation.set(rr(0, 3), rr(0, 3), 0); } }
  // s364ab FIGHT STAGE (Ben: "look like it is on a fighting game"): arena floor + hazard edge, VS rim lights, a big back banner, cables, crates
  { const ac = CT(512, 512, (g, w) => { g.fillStyle = '#3a4048'; g.fillRect(0, 0, w, w); g.strokeStyle = '#2a2f36'; g.lineWidth = 6; for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, w); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); }
      g.globalAlpha = 0.25; g.fillStyle = '#15171d'; for (let i = 0; i < 60; i++) { g.beginPath(); g.arc(Math.random() * w, Math.random() * w, 4 + Math.random() * 14, 0, 7); g.fill(); } g.globalAlpha = 1; });
    const ar = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshLambertMaterial({ map: ac })); ar.rotation.x = -Math.PI / 2; ar.position.set(3, 0.012, 0); ar.receiveShadow = true; scene.add(ar);
    const st = CT(1024, 32, (g, w, h) => { g.fillStyle = '#15171d'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c230'; for (let x = -32; x < w + 32; x += 32) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 16, h); g.lineTo(x + 32, 0); g.lineTo(x + 16, 0); g.closePath(); g.fill(); } }); st.wrapS = THREE.RepeatWrapping; st.repeat.set(4, 1);
    const edge = new THREE.Mesh(new THREE.RingGeometry(8.6, 9.1, 96, 1), new THREE.MeshBasicMaterial({ map: st })); edge.rotation.x = -Math.PI / 2; edge.position.set(3, 0.016, 0); scene.add(edge);
    const ban = CT(1024, 256, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 24, h); g.fillRect(w - 24, 0, 24, h); g.strokeStyle = '#f3f2f2'; g.lineWidth = 6; g.strokeRect(36, 18, w - 72, h - 36);
      g.fillStyle = '#f3f2f2'; g.font = '900 120px Archivo, Arial Black, sans-serif'; g.textBaseline = 'middle'; g.fillText('ORE SHAFT', 70, 112); g.fillStyle = '#ec3013'; g.font = '900 52px Archivo, Arial Black, sans-serif'; g.fillText('LEVEL 3 · THE DEEP', 74, 200); });
    const bn = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshBasicMaterial({ map: ban, toneMapped: false })); bn.position.set(3, 5.2, -12); scene.add(bn);
    for (const x of [-2.3, 8.3]) { M(new THREE.BoxGeometry(0.35, 6.6, 0.35), toon('#2a2d33'), x, 3.3, -12, null, 0.03); M(new THREE.BoxGeometry(0.5, 0.2, 0.5), toon('#e0b020'), x, 6.6, -12, null, 0.02); }
    const cab = toon('#15171d'); for (const [x0, x1, y] of [[-2.3, 8.3, 6.9], [-2.3, 8.3, 6.4]]) { const pts = []; for (let i = 0; i <= 16; i++) { const k = i / 16; pts.push(new THREE.Vector3(x0 + (x1 - x0) * k, y - Math.sin(k * Math.PI) * 0.9, -11.8)); } M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.05, 5), cab, 0, 0, 0, null, 0); }
    const crate = toon('#6b4a2a'), cr2 = toon('#c9a23a'); for (const [x, z, s] of [[-5.5, -6, 1.1], [-4.6, -7.2, 0.8], [11.5, -6.5, 1.2], [12.4, -5.2, 0.7], [-6, 5, 0.9]]) { M(new THREE.BoxGeometry(s, s, s), (x + z) % 2 ? crate : cr2, x, s / 2, z, null, 0.03); }
    const rl = new THREE.PointLight(0xff3b2a, 26, 14, 1.4); rl.position.set(-3.2, 3.2, 3.5); scene.add(rl); const bl = new THREE.PointLight(0x3f7cff, 26, 14, 1.4); bl.position.set(9.5, 3.2, 3.5); scene.add(bl); }
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3b2a, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }); let ring = null;
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }), line = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1), lineMat); line.visible = false; scene.add(line);
  const boltProto = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.6, 3, 6), new THREE.MeshBasicMaterial({ color: 0xff3b2a, toneMapped: false })); boltProto.geometry.rotateX(Math.PI / 2);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xff3b2a, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }); const pulses = [];
  const unMat = new THREE.MeshBasicMaterial({ color: 0x5fe3ff, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }); let unRing = null, unBack = null;
  const sparkGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1), sparks = []; const burst = (x, y, z, n, col) => { for (let i = 0; i < n; i++) { let s = sparks.find(q => !q.on); if (!s) { s = { m: new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial()) }; scene.add(s.m); sparks.push(s); } const a = Math.random() * 6.283, v = rr(2, 5); Object.assign(s, { on: true, x, y, z, vx: Math.cos(a) * v, vy: rr(1, 5), vz: Math.sin(a) * v, life: rr(0.3, 0.7) }); s.m.material.color.set(col); s.m.visible = true; } };
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const fox = kit.makeFox({ ...CAST.player }); if (!fox.parent) scene.add(fox); fox.traverse(o => { if (o.isMesh) o.castShadow = !touch; });
  let type = 'r8', look = null, stats = null, bot = null, loop = true, showRing = true, hacked = true, face = false, saved = null;
  const B = { x: 0, y: 0, state: 'idle', t: 0, spd: 0, un: 0, dead: 0 }, F = { x: 5, kick: 0 }, St = { t: 0, shake: 0 };
  const FOXD = { r8: 5, pick: 3.4, drill: 6.5, survey: 6, hauler: 6.5, relay: 7, rig: 6.4 };
  const ringR = () => KIND[type] === 'ranged' ? stats.range : KIND[type] === 'pulse' ? stats.range : KIND[type] === 'boss' || KIND[type] === 'melee' ? stats.reach : stats.sight;
  function rebuildRing() { if (ring) { scene.remove(ring); ring.geometry.dispose(); } const r = ringR() * (type === 'rig' ? 1 : 1); ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.06, r + 0.06, 96), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.025, 0); ring.visible = showRing && hacked; scene.add(ring); }
  const ORB = { yaw: 0.0, pitch: 0.12, dist: 9, tx: 2, ty: 1, tz: 0 };
  const say = (msg, col) => onEvent({ msg, col }), voice = () => onEvent({ line: LINES[type][hacked ? 'hacked' : 'freed'], hacked });
  const hoverY = () => type === 'r8' || type === 'survey' ? stats.hover : 0;
  function show(t, L, S, keepState) { if (!keepState) { hacked = true; } type = t; look = L; stats = S; if (bot) scene.remove(bot); clearFx(); bot = buildMachine({ THREE, M, toon, glowTex, outlineMat }, t, L); bot.userData.seed = Math.random() * 9; scene.add(bot);
    Object.assign(B, { x: 0, y: hoverY(), state: 'idle', t: 0, spd: 0, un: 0, dead: 0 }); F.x = FOXD[t] * (t === 'rig' || t === 'drill' || t === 'hauler' ? Math.max(1, L.size || 1) : 1); bot.scale.setScalar(1);
    const big = (L.size || 1) * (t === 'rig' ? 1.15 : t === 'relay' ? 1.8 : 1); ORB.tx = F.x * 0.5 - (t === 'hauler' ? 0.4 * (L.size || 1) : 0); ORB.ty = t === 'rig' ? 2.3 : t === 'relay' ? 2.6 : 1.3 + big * 0.2; ORB.dist = (F.x + 3.2 * big) / (2 * Math.tan(0.39) * Math.min(1.4, Math.max(0.55, W() / H()))) + 1.5;   // s364ab side-on framing that fits both fighters ORB.yaw = 0.0; ORB.pitch = 0.12; face = false; fox.visible = true;
    rebuildRing(); voice(); onEvent({ round: true }); }
  function tune(S) { stats = S; rebuildRing(); }
  function clearFx() { line.visible = false; for (const q of shots) scene.remove(q.m); shots.length = 0; for (const q of pulses) scene.remove(q.m); pulses.length = 0; if (unRing) { scene.remove(unRing); scene.remove(unBack); unRing = unBack = null; } }
  const _v = new THREE.Vector3(), shots = [];
  const eyePos = () => { const e = bot.userData.muzzle || (bot.userData.glows && bot.userData.glows[0]); if (e) e.getWorldPosition(_v); else _v.set(B.x, 1, 0); return _v; };
  function tele(on, x0, y0, z0, x1, y1, z1) { line.visible = on; if (!on) return; const L = Math.hypot(x1 - x0, y1 - y0, z1 - z0); line.scale.z = L; line.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); line.lookAt(x1, y1, z1); lineMat.opacity = 0.35 + 0.35 * Math.sin(St.t * 40); }
  function fire(from, speed, dmg, ty) { const m = boltProto.clone(); scene.add(m); const L = Math.hypot(F.x - from.x, ty - from.y, -from.z) || 1; shots.push({ m, x: from.x, y: from.y, z: from.z, v: [(F.x - from.x) / L * speed, (ty - from.y) / L * speed, -from.z / L * speed], dmg }); burst(from.x, from.y, from.z, 8, 0xffb347); }
  function hitFox(d) { F.kick = 1; burst(F.x, 1.1, 0, 10, 0xff3b2a); say('-' + d + ' HP', '#ff6b5a'); onEvent({ hit: d }); }
  const phaseLen = () => ({ melee: 0.45, charge: 0.6, ranged: 0.35, pulse: 0.5, boss: 0.7 })[KIND[type]];
  function step(dt) { const S = stats, kind = KIND[type], chestY = 1.1, ox = B.x;
    if (B.state === 'stun') { B.un += dt; const k = Math.min(1, B.un / (S.unhack || 3)); drawUn(k); if (Math.abs(k - (B.unSent || 0)) > 0.03 || k >= 1) { B.unSent = k; onEvent({ un: k }); } if (Math.random() < dt * 8) burst(B.x, 1 + Math.random() * (type === 'rig' ? 3 : 1), (Math.random() - 0.5), 2, 0x5fe3ff);
      if (k >= 1) { clearFx(); if (BOSS[type] === 'destroy') { B.state = 'dead'; B.t = 0; burst(0, 3, 0, 40, 0xff3b2a); burst(0, 1, 0, 30, 0xffb347); St.shake = 0.6; say('RELAY DESTROYED · THE HACK SIGNAL IS DOWN', '#7cff9b'); onEvent({ ko: 'destroyed' }); onEvent({ line: LINES.relay.freed, hacked: true }); }
        else { hacked = false; B.state = 'idle'; B.t = 0; burst(B.x, 1.4, 0, 24, 0x5fe3ff); say('UNHACKED · FREE WILL', '#7df9ff'); voice(); onEvent({ ko: 'freed' }); if (ring) ring.visible = false; } } }
    else if (B.state === 'dead') { B.dead = Math.min(1, B.dead + dt * 0.8); bot.scale.set(1, Math.max(0.05, 1 - B.dead), 1); if (B.t > 3) { show(type, look, stats); return; } }
    else if (!hacked) { B.x = damp(B.x, 0, 3, dt); if (type === 'r8') B.y = damp(B.y, S.hover + Math.sin(St.t * 2) * 0.15, 2, dt); }
    else if (B.state === 'idle') { B.x = damp(B.x, 0, 3, dt); if (type === 'r8' || type === 'survey') B.y = damp(B.y, S.hover + Math.sin(St.t * 2) * 0.2, 2, dt);
      if (B.t > 1.6 && loop) { B.state = 'tell'; B.t = 0; B.hitDone = false; say(({ melee: 'PICK RAISED · ', charge: type === 'drill' ? 'DRILL REVS · ' : 'PLATE DOWN · ', ranged: 'AIM LINE · ', pulse: 'BEACON CHARGES · ', boss: 'REARS UP · ' })[kind] + S.tell.toFixed(2) + ' S', '#ffd23a'); } }
    else if (B.state === 'tell') { if (kind === 'melee') B.x = damp(B.x, Math.max(0, F.x - S.reach - 0.2), 4, dt);
      if (kind === 'ranged') { const e = eyePos(); tele(true, e.x, e.y, e.z, F.x, chestY, 0); }
      if (B.t > S.tell) { tele(false); B.state = 'atk'; B.t = 0; if (kind === 'ranged') fire(eyePos().clone(), S.bolt, S.hit, chestY); if (kind === 'pulse') spawnPulse(); } }
    else if (B.state === 'atk') { const pl = phaseLen();
      if (kind === 'melee' && !B.hitDone && B.t > pl * 0.4) { B.hitDone = true; burst(B.x + S.reach, 0.1, 0, 10, 0xc8b89a); if (F.x - B.x <= S.reach + 0.6) hitFox(S.hit); }
      if (kind === 'charge') { const sz = look.size || 1, stopD = type === 'drill' ? 2.05 * sz : 2.2 * sz; B.x = Math.min(B.x + S.lunge * dt, F.x - stopD); if (!B.hitDone && B.x >= F.x - stopD - 0.1) { B.hitDone = true; hitFox(S.hit); St.shake = 0.25; } }
      if (kind === 'boss' && !B.hitDone && B.t > pl * 0.35) { B.hitDone = true; St.shake = 0.6; spawnShock(); burst(2.5, 0.2, 0, 24, 0xc8b89a); if (F.x <= S.reach + 3.6) hitFox(S.hit); }
      if (B.t > pl) { B.state = 'rest'; B.t = 0; say('OPEN! · ' + S.rest.toFixed(1) + ' S', '#7cff9b'); } }
    else if (B.state === 'rest') { if (kind === 'charge') B.x = damp(B.x, 0, 1.5, dt); if (B.t > S.rest) { B.state = 'idle'; B.t = 0; } }
    B.spd = damp(B.spd, Math.abs(B.x - ox) / Math.max(dt, 1e-4) + (B.state === 'idle' && hacked && type !== 'relay' ? 0.5 : 0), 10, dt);
    const mode = B.state === 'dead' ? 'stun' : B.state, p = B.state === 'tell' ? B.t / S.tell : B.state === 'atk' ? B.t / phaseLen() : 0;
    poseMachine(bot, { mode, p, speed: B.spd, dt, t: St.t, hacked, aim: [F.x, 1.1, 0] });
    bot.position.set(B.x, B.y, 0); if (ring) ring.position.x = B.x; if (unRing) { unRing.position.x = unBack.position.x = B.x; } }
  function spawnPulse() { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), pulseMat.clone()); m.rotation.x = -Math.PI / 2; m.position.y = 0.4; scene.add(m); pulses.push({ m, r: 1, hit: false }); }
  function spawnShock() { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), pulseMat.clone()); m.material.color.set(0xffb347); m.rotation.x = -Math.PI / 2; m.position.set(3.2 * (look.size || 1), 0.05, 0); scene.add(m); pulses.push({ m, r: 1, hit: true, shock: true, max: stats.reach }); }
  function stepFx(dt) { for (let i = shots.length - 1; i >= 0; i--) { const q = shots[i]; q.x += q.v[0] * dt; q.y += q.v[1] * dt; q.z += q.v[2] * dt; q.m.position.set(q.x, q.y, q.z); q.m.lookAt(q.x + q.v[0], q.y + q.v[1], q.z + q.v[2]); if (q.x > F.x - 0.3) { hitFox(q.dmg); scene.remove(q.m); shots.splice(i, 1); } }
    for (let i = pulses.length - 1; i >= 0; i--) { const q = pulses[i]; q.r += (q.shock ? 10 : stats.pulse) * dt; const s = q.r; q.m.scale.set(s, s, 1); const max = q.shock ? q.max : stats.range; q.m.material.opacity = 0.85 * (1 - q.r / max);
      if (!q.hit && q.r >= F.x) { q.hit = true; F.jump = 1; say('JUMP THE RING!', '#ffd23a'); } if (q.r >= max) { scene.remove(q.m); pulses.splice(i, 1); } } }
  function drawUn(k) { const r = type === 'rig' ? 3.4 : type === 'relay' ? 2.2 : 1.4; if (!unBack) { unBack = new THREE.Mesh(new THREE.RingGeometry(r - 0.12, r + 0.12, 64), new THREE.MeshBasicMaterial({ color: 0x0b0a0a, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false })); unBack.rotation.x = -Math.PI / 2; unBack.position.y = 0.03; scene.add(unBack); }
    if (unRing) { scene.remove(unRing); unRing.geometry.dispose(); } unRing = new THREE.Mesh(new THREE.RingGeometry(r - 0.12, r + 0.12, 64, 1, Math.PI / 2, -Math.max(0.001, k) * Math.PI * 2), BOSS[type] === 'destroy' ? pulseMat : unMat); unRing.rotation.x = -Math.PI / 2; unRing.position.y = 0.04; scene.add(unRing); }
  // orbit: drag to turn, wheel / pinch to zoom
  const ptrs = new Map(); let pinch0 = 0, dist0 = 0; const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); dist0 = ORB.dist; } });
  el.addEventListener('pointermove', e => { if (!ptrs.has(e.pointerId)) return; const p = ptrs.get(e.pointerId); if (ptrs.size === 1) { ORB.yaw -= (e.clientX - p[0]) * 0.008; ORB.pitch = clamp(ORB.pitch + (e.clientY - p[1]) * 0.006, -0.05, 1.3); } ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; ORB.dist = clamp(dist0 * pinch0 / Math.max(20, Math.hypot(a[0] - b[0], a[1] - b[1])), 3, 40); } });
  const up = e => ptrs.delete(e.pointerId); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', e => { e.preventDefault(); ORB.dist = clamp(ORB.dist * (1 + Math.sign(e.deltaY) * 0.1), 3, 40); }, { passive: false });
  let raf = 0, last = performance.now(), dead = false;
  const sched = () => { if (dead) return; if (document.hidden) setTimeout(() => frame(performance.now()), 33); else raf = requestAnimationFrame(frame); };
  function frame(now) { if (dead) return; sched(); const dt = Math.min(0.05, (now - last) / 1000); last = now; St.t += dt; if (!bot) return; B.t += dt;
    try { step(dt); stepFx(dt); } catch (e) { if (!frame.err) { frame.err = 1; console.warn('machine workshop: ' + (e.stack || e)); } }
    F.kick = Math.max(0, F.kick - dt * 3); F.jump = Math.max(0, (F.jump || 0) - dt * 2.2); fox.position.set(F.x + F.kick * 0.5, Math.sin(F.kick * Math.PI) * 0.15 + Math.sin(F.jump * Math.PI) * 0.9, 0); fox.rotation.y = -Math.PI / 2; kit.animFox(fox, dt, 0, false);
    for (const s of sparks) { if (!s.on) continue; s.life -= dt; s.vy -= 14 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; s.m.position.set(s.x, s.y, s.z); if (s.life <= 0) { s.on = false; s.m.visible = false; } }
    guide.material.opacity = 0.4 + 0.2 * Math.sin(St.t * 2); lampL.intensity = 18 + Math.sin(St.t * 17) * 0.6;
    St.shake = Math.max(0, St.shake - dt); const sh = St.shake * 0.25, cp = Math.cos(ORB.pitch);
    camera.position.set(ORB.tx + Math.sin(ORB.yaw) * cp * ORB.dist + (Math.random() - 0.5) * sh, ORB.ty + Math.sin(ORB.pitch) * ORB.dist + (Math.random() - 0.5) * sh, ORB.tz + Math.cos(ORB.yaw) * cp * ORB.dist); camera.lookAt(ORB.tx, ORB.ty, ORB.tz); camera.aspect = W() / H(); camera.updateProjectionMatrix();
    try { renderer.render(scene, camera); } catch (e) { if (!frame.rerr) { frame.rerr = 1; console.warn('machine workshop render: ' + (e.stack || e)); } } }
  const ro = new ResizeObserver(() => renderer.setSize(W(), H())); ro.observe(container); sched();
  return {
    show, tune, _orb: ORB, _B: B, get _bot() { return bot; },
    setLoop(on) { loop = !!on; if (!loop && B.state !== 'stun' && B.state !== 'dead') { B.state = 'idle'; B.t = 0; line.visible = false; } },
    attackNow() { if (!hacked || B.state === 'stun' || B.state === 'dead') return; B.state = 'idle'; B.t = 99; const was = loop; loop = true; setTimeout(() => { loop = was; }, 50); },
    setHacked(on) { if (B.state === 'stun' || B.state === 'dead') clearFx(); hacked = !!on; B.state = 'idle'; B.t = 0; line.visible = false; bot.scale.setScalar(1); if (ring) ring.visible = showRing && hacked; voice(); },
    unhack() { if (B.state === 'stun' || B.state === 'dead') return; if (!hacked) { hacked = true; } clearFx(); B.state = 'stun'; B.t = 0; B.un = 0; B.unSent = 0; burst(B.x, 1.2, 0, 16, 0xffd23a); say(BOSS[type] === 'destroy' ? 'STUNNED · HOLD ITEM TO OVERLOAD IT' : 'STUNNED · HOLD ITEM TO UNHACK', '#7df9ff'); },
    setFace(on) { face = !!on; fox.visible = !face; const k = look ? look.size || 1 : 1, hy = { r8: B.y, pick: 2.6, drill: 1.75, survey: B.y + 0.75, hauler: 1.25, relay: 5.0, rig: 3.35 }[type]; if (face) { saved = { ...ORB }; const fly = type === 'r8' || type === 'survey'; Object.assign(ORB, { yaw: 1.2, pitch: 0.12, dist: (type === 'rig' ? 5 : type === 'relay' ? 4 : type === 'r8' ? 3.4 : type === 'hauler' ? 4 : 3) * k, tx: B.x + (type === 'rig' ? 0.3 : type === 'hauler' ? 1.1 * k : 0), ty: fly ? hy + 0.1 * k : hy * k, tz: 0 }); } else if (saved) Object.assign(ORB, saved); },
    setRing(on) { showRing = !!on; if (ring) ring.visible = showRing && hacked; },
    get hacked() { return hacked; }, get busy() { return B.state === 'stun' || B.state === 'dead'; },
    destroy() { dead = true; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.remove(); },
  };
}
