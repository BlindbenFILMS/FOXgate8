// PEARL SAIL BOT WORKSHOP (s35x): a turntable for the five Pearl Sail bots. Shows the bot from worlds/pearl-bots.js with the player fox
// as the target, plays its attack on a loop (tell → attack → rest) using the live tuning, draws its sight / range ring on the floor.
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, lerp, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js';
import { CAST } from '../engine/cast.js';
import { buildBot, poseBot, pulseEyes, animGate } from './pearl-bots.js';

export async function createBotWorkshop({ container, onEvent = () => {} }) {
  const touch = matchMedia('(pointer: coarse)').matches, W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, preserveDrawingBuffer: true }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.5 : 2)); renderer.setSize(W(), H()); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = !touch;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#aab1ba'); scene.fog = new THREE.Fog(0xaab1ba, 18, 40);
  const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xf2f6ff, 0x55595f, 1.25)); const sun = new THREE.DirectionalLight(0xfff4e0, 1.5); sun.position.set(-6, 12, 8); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); scene.add(sun);
  const grad = makeGradient(), cache = new Map(), toon = c => { if (!cache.has(c)) cache.set(c, new THREE.MeshToonMaterial({ color: c, gradientMap: grad })); return cache.get(c); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const CT = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const glowTex = CT(64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  // stage: server-room floor tile + a wall stub (turret mount)
  const floorTex = CT(256, 256, (g, w) => { g.fillStyle = '#c4c9cf'; g.fillRect(0, 0, w, w); g.strokeStyle = '#9aa0a6'; g.lineWidth = 4; for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, w); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); } }); floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(10, 10);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(20, 48), new THREE.MeshLambertMaterial({ map: floorTex })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 3), new THREE.MeshLambertMaterial({ color: 0xf3f2f2 })); wall.position.set(-0.45, 1.6, 0); wall.receiveShadow = true; scene.add(wall);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff3b2a, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }); let ring = null;
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }), line = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1), lineMat); line.visible = false; scene.add(line);
  const boltM = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.7, 3, 6), new THREE.MeshBasicMaterial({ color: 0xff3b2a })); boltM.geometry.rotateX(Math.PI / 2); boltM.visible = false; scene.add(boltM);
  const sparkGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1), sparks = []; const burst = (x, y, z, n, col) => { for (let i = 0; i < n; i++) { let s = sparks.find(q => !q.on); if (!s) { s = { m: new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial()) }; scene.add(s.m); sparks.push(s); } const a = Math.random() * 6.283, v = rr(2, 5); Object.assign(s, { on: true, x, y, z, vx: Math.cos(a) * v, vy: rr(1, 5), vz: Math.sin(a) * v, life: rr(0.3, 0.6) }); s.m.material.color.set(col); s.m.visible = true; } };
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const fox = kit.makeFox({ ...CAST.player }); if (!fox.parent) scene.add(fox); fox.traverse(o => { if (o.isMesh) o.castShadow = !touch; });
  let face = false, saved = null; let type = 'crawler', variant = '', look = null, stats = null, bot = null, mini = null, loop = true, showRing = true;
  const B = { x: 0, y: 0, z: 0, yaw: 0, state: 'idle', t: 0, hop: 0, squash: 0, sd: 0, v: null };
  const F = { x: 4, kick: 0 };
  const foxDist = () => type === 'crawler' && variant === 'cannon' ? 6 : type === 'guard' && variant === 'pistol' ? 5 : ({ crawler: 3.6, drone: 5, turret: 7, guard: 3.6, gate: 5 })[type];   /* s251b a clear gap at idle so the charge + stop reads */
  const ringR = () => type === 'turret' || type === 'gate' ? stats.range : type === 'crawler' && variant === 'cannon' ? stats.cannonRange : type === 'guard' && variant === 'pistol' ? stats.gunRange : stats.sight || 6;
  function rebuildRing() { if (ring) { scene.remove(ring); ring.geometry.dispose(); } const r = ringR(); ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.06, r + 0.06, 96), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.set(B.x, 0.02, 0); ring.visible = showRing; scene.add(ring); }
  const ORB = { yaw: -0.55, pitch: 0.32, dist: 9, tx: 2, ty: 1, tz: 0 };
  function show(t, L, S, v = '') { face = false; saved = null; fox.visible = true; type = t; variant = v; look = L; stats = S; if (bot) scene.remove(bot); if (mini) { scene.remove(mini); mini = null; } bot = buildBot({ THREE, M, toon, glowTex, outlineMat }, t, L, v); scene.add(bot);
    Object.assign(B, { x: 0, y: t === 'drone' ? S.hover : 0, z: 0, yaw: 0, state: 'idle', t: 0, hop: 0, v: null }); wall.visible = false; F.x = foxDist(); line.visible = false; boltM.visible = false;
    const big = (L.size || 1) * (t === 'gate' ? 1.5 : 1); ORB.yaw = t === 'turret' ? 0.5 : t === 'gate' ? -0.55 : 0.22; ORB.tx = F.x * 0.45; ORB.ty = t === 'gate' ? 1.6 : 1.1; ORB.dist = Math.max(7, F.x * 1.25 + 5) * Math.max(1, big * 0.85); rebuildRing(); }
  function tune(S) { stats = S; F.x = foxDist(); rebuildRing(); }
  // attack preview: idle (1.6 s) → TELL (warning time) → ATTACK → REST
  const say = (msg, col) => onEvent({ msg, col });
  function step(dt) { const L = look, S = stats, u = bot.userData; B.t += dt; const fx = F.x, chestY = 1.1;
    if (type === 'crawler') { const ox = B.x;
      if (variant === 'cannon') {
        if (B.state === 'idle') { if (B.t > 1.4 && loop) { B.state = 'tell'; B.t = 0; say('AIM LINE · ' + (S.tell * 1.5).toFixed(2) + ' S', '#ffd23a'); } }
        else if (B.state === 'tell') { u.muzzle.getWorldPosition(_v); tele(true, _v.x, _v.y, _v.z, fx, 0.9, 0); u.eye.material.opacity = 0.6 + 0.4 * Math.sin(B.t * 50); if (B.t > S.tell * 1.5) { tele(false); u.eye.material.opacity = 0.6; fire(_v, S.shell, S.cannonHit, 0.9); B.state = 'atk'; B.t = 0; } }
        else if (B.state === 'atk') { if (B.t > 0.4) { B.state = 'rest'; B.t = 0; } }
        else if (B.state === 'rest') { if (B.t > S.rest + 0.8) { B.state = 'idle'; B.t = 0; } } }
      else {
        if (B.state === 'idle') { if (B.t > 1.6 && loop) { B.state = 'tell'; B.t = 0; say('LEAN BACK · ' + S.tell.toFixed(2) + ' S', '#ffd23a'); } }
        else if (B.state === 'tell') { u.eye.material.opacity = 0.6 + 0.4 * Math.sin(B.t * 50); if (B.t > S.tell) { B.state = 'atk'; B.t = 0; u.eye.material.opacity = 0.6; B.hitDone = false; } }
        else if (B.state === 'atk') { B.x = Math.min(B.x + S.lunge * dt, fx - 1.2);   /* s251 stop short, the glove reaches */ if (B.x > fx - 1.6 && !B.hitDone) { B.hitDone = true; hitFox(S.lungeHit); } if (B.t > 0.3) { B.state = 'rest'; B.t = 0; } }
        else if (B.state === 'rest') { B.x = damp(B.x, 0, 3, dt); if (B.t > S.rest) { B.state = 'idle'; B.t = 0; B.x = 0; } } }
      B.spd = damp(B.spd || 0, Math.abs(B.x - ox) / Math.max(dt, 1e-4) + (B.state === 'idle' ? 0.6 : 0), 10, dt);
      poseBot(bot, 'crawler', { mode: B.state, p: B.state === 'tell' ? B.t / (variant === 'cannon' ? S.tell * 1.5 : S.tell) : B.state === 'atk' ? B.t / (variant === 'cannon' ? 0.4 : 0.3) : 0, speed: B.spd, dt, t: St.t }); }
    else if (type === 'drone') { const hy = S.hover;
      if (B.state === 'idle') { B.y = damp(B.y, hy + Math.sin(St.t * 2) * 0.3, 2, dt); B.x = damp(B.x, 0, 2, dt); if (B.t > 1.6 && loop) { B.state = 'tell'; B.t = 0; B.tg = [fx, chestY, 0]; say('AIM LINE · ' + S.tell.toFixed(2) + ' S', '#ffd23a'); } }
      else if (B.state === 'tell') { tele(true, B.x + 0.4, B.y, 0, ...B.tg); u.eye.material.opacity = 1; if (B.t > S.tell) { tele(false); u.eye.material.opacity = 0.6; B.state = 'atk'; B.t = 0; const L2 = Math.hypot(B.tg[0] - B.x, B.tg[1] - B.y) || 1; B.v = [(B.tg[0] - B.x) / L2 * S.swoop, (B.tg[1] - B.y) / L2 * S.swoop]; } }
      else if (B.state === 'atk') { B.x = Math.min(B.x + B.v[0] * dt, fx - 0.85); B.y = Math.max(0.6, B.y + B.v[1] * dt); if (B.x > fx - 0.9) { hitFox(S.hit); B.state = 'rest'; B.t = 0; } else if (B.t > 1.0) { B.state = 'rest'; B.t = 0; } }
      else if (B.state === 'rest') { B.x = damp(B.x, 0, 3, dt); B.y = damp(B.y, hy, 3, dt); if (B.t > S.rest) { B.state = 'idle'; B.t = 0; } }
      u.rot.forEach((r, i) => r.rotation.y += dt * (i ? 40 : -40)); }
    else if (type === 'turret') { u.muzzle.getWorldPosition(_v); const pitch = Math.atan2(chestY - _v.y, Math.max(0.5, fx - _v.x)); u.piv.rotation.z = damp(u.piv.rotation.z, pitch, 8, dt); B.rec = damp(B.rec || 0, 0, 8, dt); u.barrel.position.x = 0.2 - B.rec * 0.22;
      u.flash.material.opacity = B.rec > 0.5 ? (B.rec - 0.5) * 2 : B.state === 'tell' ? 0.3 * Math.min(1, B.t / S.tell) : 0; u.flash.scale.setScalar(B.rec > 0.5 ? 1.2 : 0.5);
      if (B.state === 'idle') { if (B.t > 1.2 && loop) { B.state = 'tell'; B.t = 0; say('LASER SIGHT · ' + S.tell.toFixed(2) + ' S', '#ffd23a'); } }
      else if (B.state === 'tell') { const c = Math.cos(pitch), s = Math.sin(pitch); tele(true, _v.x, _v.y, _v.z, _v.x + S.range * c, _v.y + S.range * s, 0); u.eye.material.opacity = 0.5 + B.t; if (B.t > S.tell) { tele(false); u.eye.material.opacity = 0.6; fire(_v, S.bolt, S.hit, chestY); B.rec = 1; B.state = 'atk'; B.t = 0; } }
      else if (B.state === 'atk') { if (B.t > 0.3) { B.state = 'rest'; B.t = 0; } }
      else if (B.state === 'rest') { if (B.t > S.rest) { B.state = 'idle'; B.t = 0; } } }
    else if (type === 'guard') { const ox = B.x, pist = variant === 'pistol';
      if (B.state === 'idle') { B.x = damp(B.x, 0, 3, dt); if (B.t > 1.4 && loop) { B.state = 'tell'; B.t = 0; say((pist ? 'AIM · ' : 'WIND-UP · ') + S.tell.toFixed(2) + ' S', '#ffd23a'); } }
      else if (B.state === 'tell') { u.eye.material.opacity = 0.6 + 0.4 * Math.sin(B.t * 50); if (pist) { u.muzzle.getWorldPosition(_v); tele(true, _v.x, _v.y, _v.z, fx, chestY, 0); } if (B.t > S.tell) { tele(false); B.state = 'atk'; B.t = 0; u.eye.material.opacity = 0.6; B.hitDone = false; if (pist) fire(_v, S.bolt, S.gunHit, chestY); } }
      else if (B.state === 'atk') { if (pist) { if (B.t > 0.35) { B.state = 'idle'; B.t = 0; } } else { B.x = Math.min(B.x + S.bash * dt, fx - 1.75);   /* s251 stop BEFORE the fox's body; the sword covers the rest */ if (!B.hitDone && B.x > fx - 1.8) { B.hitDone = true; hitFox(S.hit); } if (B.t > 0.25) { B.state = 'rest'; B.t = 0; say('OPEN! · ' + S.stagger.toFixed(1) + ' S', '#7cff9b'); } } }
      else if (B.state === 'rest') { if (B.t > S.stagger) { B.state = 'idle'; B.t = 0; } }
      B.spd = damp(B.spd || 0, Math.abs(B.x - ox) / Math.max(dt, 1e-4) + (B.state === 'idle' ? 0.9 : 0), 10, dt);
      poseBot(bot, 'guard', { mode: B.state, p: B.state === 'tell' ? B.t / S.tell : B.state === 'atk' ? B.t / (pist ? 0.35 : 0.25) : 0, speed: B.spd, dt, t: St.t }); }
    else if (type === 'gate') { animGate(bot, dt, St.t, camera.position, mini && mini.userData.t < 0.6 ? 2.2 : 1); u.beam.material.opacity = 0.16 + 0.08 * Math.sin(St.t * 3);
      if (loop && B.t > S.every) { B.t = 0; spawnMini(); say('SPAWN · EVERY ' + S.every + ' S · MAX ' + S.max, '#ffd23a'); }
      if (mini) { mini.userData.t += dt; const k = mini.userData.t; mini.position.x = 0.5 + k * 1.6; poseBot(mini, 'crawler', { mode: 'idle', speed: 1.6, dt, t: St.t }); mini.scale.setScalar(Math.min(1, k * 3) * (k > 2 ? Math.max(0.01, 1 - (k - 2) * 2) : 1)); if (k > 2.5) { scene.remove(mini); mini = null; } } }
    bot.position.set(B.x, B.y + B.hop, B.z); bot.rotation.y = B.yaw; bot.scale.set(1, 1 - B.squash * 0.35, 1); if (ring) ring.position.x = 0; }
  function spawnMini() { if (mini) scene.remove(mini); burst(0, 1.4, 0, 12, look.eye); mini = buildBot({ THREE, M, toon, glowTex, outlineMat }, 'crawler', { body: '#4a4e55', dark: '#1f2226', accent: '#9aa0a6', glove: '#ec3013', eye: '#ff2a1a', size: 1 }, 'gloves'); mini.userData.t = 0; mini.position.set(0.5, 0, 0); scene.add(mini); }
  function tele(on, x0, y0, z0, x1, y1, z1) { line.visible = on; if (!on) return; const L = Math.hypot(x1 - x0, y1 - y0, z1 - z0); line.scale.z = L; line.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); line.lookAt(x1, y1, z1); lineMat.opacity = 0.35 + 0.35 * Math.sin(St.t * 40); }
  const _v = new THREE.Vector3(), shots = [];
  function fire(from, speed, dmg, ty) { const m = boltM.clone(); m.material = boltM.material; m.visible = true; scene.add(m); const L = Math.hypot(F.x - from.x, ty - from.y, -from.z) || 1; shots.push({ m, x: from.x, y: from.y, z: from.z, v: [(F.x - from.x) / L * speed, (ty - from.y) / L * speed, -from.z / L * speed], dmg }); burst(from.x, from.y, from.z, 8, 0xffb347); }
  function stepShots(dt) { for (let i = shots.length - 1; i >= 0; i--) { const q = shots[i]; q.x += q.v[0] * dt; q.y += q.v[1] * dt; q.z += q.v[2] * dt; q.m.position.set(q.x, q.y, q.z); q.m.lookAt(q.x + q.v[0], q.y + q.v[1], q.z + q.v[2]); if (q.x > F.x - 0.3) { hitFox(q.dmg); scene.remove(q.m); shots.splice(i, 1); } } }
  function hitFox(d) { F.kick = 1; burst(F.x, 1.1, 0, 10, 0xff3b2a); say('-' + d + ' HP', '#ff6b5a'); }
  // orbit: drag to turn, wheel / pinch to zoom
  const ptrs = new Map(); let pinch0 = 0, dist0 = 0;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); dist0 = ORB.dist; } });
  el.addEventListener('pointermove', e => { if (!ptrs.has(e.pointerId)) return; const p = ptrs.get(e.pointerId); if (ptrs.size === 1) { ORB.yaw -= (e.clientX - p[0]) * 0.008; ORB.pitch = clamp(ORB.pitch + (e.clientY - p[1]) * 0.006, -0.05, 1.3); } ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; ORB.dist = clamp(dist0 * pinch0 / Math.max(20, Math.hypot(a[0] - b[0], a[1] - b[1])), 3, 30); } });
  const up = e => ptrs.delete(e.pointerId); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', e => { e.preventDefault(); ORB.dist = clamp(ORB.dist * (1 + Math.sign(e.deltaY) * 0.1), 3, 30); }, { passive: false });
  const St = { t: 0 }; let raf = 0, last = performance.now(), dead = false;
  const sched = () => { if (dead) return; if (document.hidden) setTimeout(() => frame(performance.now()), 33); else raf = requestAnimationFrame(frame); };
  function frame(now) { if (dead) return; sched(); const dt = Math.min(0.05, (now - last) / 1000); last = now; St.t += dt; if (!bot) return;
    try { step(dt); stepShots(dt); } catch (e) { if (!frame.err) { frame.err = 1; console.warn('bot workshop: ' + (e.stack || e)); } }
    if (face) { ORB.tx = damp(ORB.tx, B.x, 6, dt); }
    F.kick = Math.max(0, F.kick - dt * 3); fox.position.set(F.x + F.kick * 0.5, Math.sin(F.kick * Math.PI) * 0.15, 0); fox.rotation.y = -Math.PI / 2; kit.animFox(fox, dt, 0, false);
    for (const s of sparks) { if (!s.on) continue; s.life -= dt; s.vy -= 14 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; s.m.position.set(s.x, s.y, s.z); if (s.life <= 0) { s.on = false; s.m.visible = false; } }
    pulseEyes(THREE, St.t);
    const cp = Math.cos(ORB.pitch); camera.position.set(ORB.tx + Math.sin(ORB.yaw) * cp * ORB.dist, ORB.ty + Math.sin(ORB.pitch) * ORB.dist, ORB.tz + Math.cos(ORB.yaw) * cp * ORB.dist); camera.lookAt(ORB.tx, ORB.ty, ORB.tz); camera.aspect = W() / H(); camera.updateProjectionMatrix();
    try { renderer.render(scene, camera); } catch (e) { if (!frame.rerr) { frame.rerr = 1; console.warn('bot workshop render: ' + (e.stack || e)); } } }
  const ro = new ResizeObserver(() => renderer.setSize(W(), H())); ro.observe(container); sched();
  return { ORB, 
    show, tune,
    setLoop(on) { loop = !!on; if (!loop) { B.state = 'idle'; B.t = 0; line.visible = false; boltM.visible = false; } },
    attackNow() { B.t = 99; if (B.state !== 'idle') { B.state = 'idle'; } const was = loop; loop = true; setTimeout(() => { loop = was; }, 50); },
    // FACE view: fox hidden, close 3/4 front view of the head (Ben: see the angry eyes)
    setFace(on) { face = !!on; fox.visible = !face; const k = look ? look.size || 1 : 1, hy = { crawler: 1.0, drone: B.y, turret: 1.15, guard: 2.1, gate: 1.6 }[type]; if (face) { saved = { ...ORB }; Object.assign(ORB, { yaw: 1.15, pitch: 0.12, dist: (type === 'gate' ? 6 : type === 'guard' ? 3.4 : 2.8) * k, tx: B.x, ty: hy * k, tz: 0 }); } else if (saved) Object.assign(ORB, saved); },
    setRing(on) { showRing = !!on; if (ring) ring.visible = showRing; },
    destroy() { dead = true; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.remove(); },
  };
}
