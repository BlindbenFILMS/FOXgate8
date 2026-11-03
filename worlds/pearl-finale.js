// PEARL SAIL FINALE (s303, Ben's script in BUILD_PLAN "NEXT CHAT s302"): after SUDS-9 is beaten on the roof a HELICOPTER lands on the
// helipad, MERU GUARDS + MACHINE FLEET EXECUTIVES step out, the talk (Ben's lines word for word, the long ones split across 2 boxes),
// everyone boards, the helicopter takes off over Meru and lands on the ROYAL LANDING PAD (the castle's south terrace, in the roof's
// Meru-below model). In-engine, tap / E / Space to advance, every shot frames the speaker clear of the dialogue box (phone first).
// The executives don't know about the hack (CLAUDE.md STORY ARC): they call it "routine systems training".
import { vehicleKit } from '../engine/vehicle-kit.js';
import { CAST } from '../engine/cast.js';

const PAD = [4, 9];                                   // roof helipad (worlds/pearl-floor3d.js roof art)
const CY = -72 + 10;                                  // Meru-below ground -72, castle walls 10 high: the terrace top
const RP = [-110, -138.25];                           // ROYAL LANDING PAD on the castle's south terrace (keep face z -143.5)
const LINES = [
  { who: 'exec', vo: 'fin-exec-1', text: 'YOU INTERRUPTED OUR ROUTINE SYSTEMS TRAINING! WE ADMIT IT WAS ON FULL ALERT' },
  { who: 'exec', vo: 'fin-exec-2', text: 'AND EVEN OUR GUARDS HAD TO TAKE A BREAK, SO WE THANK YOU FOR TEACHING THEM HOW IT\u2019S DONE.' },
  { who: 'player', vo: 'fin-ben-1', text: 'THE MACHINE FLEET IS MALFUNCTIONING. THEY ALSO ATTACKED US IN SPACE AND THE MERU GATE WENT DARK.' },
  { who: 'exec', vo: 'fin-exec-3', text: 'THAT IS IMPOSSIBLE, BUT IF WHAT YOU SAID ABOUT THE GATE IS TRUE,' },
  { who: 'exec', vo: 'fin-exec-4', text: 'YOU WOULD BE THE ONLY FOX TO WITNESS IT.' },
  { who: 'guard', vo: 'fin-guard-1', text: 'NO TIME FOR CHITCHAT, THE KING WANTS TO SEE YOU, GET ON THE HELICOPTER.' },
];
const WHO = { exec: ['EXECUTIVE', 'MACHINE FLEET'], player: [CAST.player.name || 'BEN', 'YOU'], guard: ['MERU GUARD', 'ROYAL GUARD'] };

export function pearlFinale({ THREE, scene, camera, kit, M, toon, CT, glowTex, fox, P, St, W, H, onDone = () => {}, onBegin = () => {} }) {
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z), lerp = (a, b, t) => a + (b - a) * t, cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, angD = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const bez = (a, b, c, t) => { const u = 1 - t; return V3(u * u * a.x + 2 * u * t * b.x + t * t * c.x, u * u * a.y + 2 * u * t * b.y + t * t * c.y, u * u * a.z + 2 * u * t * b.z + t * t * c.z); };
  const objs = []; let built = false, heli, V, pilot, cast = {}, ph = null, pt = 0, li = 0, fade = 0, rpm = 0, audio = null, shot = null, padG = null;
  const H0 = { pos: V3(0, 0, 0), yaw: 0, pitch: 0, roll: 0 };

  function build() {
    built = true;
    heli = vehicleKit({ THREE, M, toon }).make('heli'); heli.scale.setScalar(1.4); V = heli.userData.V; if (V.gun) V.gun.visible = false; if (V.beam) V.beam.visible = false;
    { // s304 (Ben): the MERU M crest on the helicopter: tail fin discs (were the 8) + both sides of the engine hump
      const mt = CT(128, 128, (g, w) => { g.fillStyle = '#26292d'; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 2, 0, 7); g.fill(); g.strokeStyle = '#e6b45a'; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 8, 0, 7); g.stroke(); g.fillStyle = '#f3f2f2'; g.font = '900 78px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', w / 2, w / 2 + 5); });
      V.body.traverse(o => { if (o.isMesh && o.material && o.material.map && o.geometry.parameters && Math.abs((o.geometry.parameters.radius || 0) - 0.22) < 0.001) { o.material = new THREE.MeshBasicMaterial({ map: mt }); } });
      for (const s of [-1, 1]) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.21, 24), new THREE.MeshBasicMaterial({ map: mt })); d.position.set(s * 0.612, 1.25 + 0.65, -0.35); d.rotation.y = s * Math.PI / 2; V.body.add(d); } }
    heli.rotation.order = 'YXZ'; scene.add(heli); objs.push(heli);
    const mk = (o, key) => { const f = kit.makeFox({ key, mood: 'neutral', ...o }); scene.add(f); objs.push(f); return f; };
    const GUARD = { outfit: 'armor', torso: ['#5a5f67', '#44484f', '#26292d'], crest: 'M', eyes: ['#3a2a1a', '#3a2a1a'], look: { armorAccent: '#e6b45a' } };   // s304 (Ben): MERU GUARDS = the player's armour in Meru DARK GREY with the M crest
    cast.exec = mk({ name: 'Executive', outfit: 'suit', torso: ['#e7e4dc', '#475569', '#26292d'], mood: 'warm' }, 'mfExecLead');
    cast.exec2 = mk({ name: 'Executive', outfit: 'suit', torso: ['#201e1d', '#ec3013', '#111111'], mood: 'neutral' }, 'mfExec2');
    cast.guard = mk({ name: 'Meru Guard', ...GUARD, mood: 'stern' }, 'finGuard1');
    cast.guard2 = mk({ name: 'Meru Guard', ...GUARD, mood: 'stern' }, 'finGuard2');
    pilot = mk({ name: 'Pilot', ...GUARD, mood: 'neutral' }, 'finPilot'); for (const l of pilot.userData.P.legs) l.rotation.x = -1.45;
    cast.door1 = mk({ name: 'Castle Guard', ...GUARD, mood: 'stern' }, 'finDoor1'); cast.door2 = mk({ name: 'Castle Guard', ...GUARD, mood: 'stern' }, 'finDoor2');
    for (const k in cast) cast[k].visible = false;
    buildPad();
    // head height for the shots
    const bb = new THREE.Box3().setFromObject(cast.exec); cast.headY = Math.max(1.2, bb.max.y - 0.65);
  }

  // ROYAL LANDING PAD on the castle terrace: stone pad + crest, merlons on the south edge, a keep door + red carpet, lanterns, banners
  function buildPad() {
    const G = new THREE.Group(); padG = G; scene.add(G); objs.push(G); const [x, z] = RP;
    const box = (c, w, h, d, px, py, pz, out = 0.03) => M(new THREE.BoxGeometry(w, h, d), toon(c), px, py, pz, G, out);
    const tex = CT(512, 512, (g, w) => { g.fillStyle = '#d9cfc0'; g.fillRect(0, 0, w, w); g.translate(w / 2, w / 2);
      g.strokeStyle = '#e6b45a'; g.lineWidth = 26; g.beginPath(); g.arc(0, 0, 226, 0, 7); g.stroke(); g.strokeStyle = '#ec3013'; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 186, 0, 7); g.stroke();
      g.fillStyle = '#e6b45a'; g.beginPath(); g.moveTo(-120, 40); g.lineTo(-130, -70); g.lineTo(-66, -14); g.lineTo(0, -96); g.lineTo(66, -14); g.lineTo(130, -70); g.lineTo(120, 40); g.closePath(); g.fill(); g.fillRect(-120, 52, 240, 26);
      g.fillStyle = '#201e1d'; g.font = '900 54px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 0, -4); g.font = '900 40px Archivo, sans-serif'; g.fillText('ROYAL PAD', 0, 132); });
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.4, 0.16, 40), [toon('#bfb3a3'), new THREE.MeshLambertMaterial({ map: tex }), toon('#bfb3a3')]); pad.position.set(x, CY + 0.08, z); G.add(pad);
    for (let i = -8; i <= 8; i++) box('#e9e6e0', 1.1, 1.0, 0.7, x + i * 2.05, CY + 0.5, -133.4);                                   // south battlements
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) box('#e9e6e0', 0.7, 1.0, 1.1, x + sx * 16.6, CY + 0.5, -135.5 - i * 2.1);
    box('#201e1d', 2.6, 3.8, 0.12, x, CY + 1.9, -143.44, 0); box('#e6b45a', 3.1, 0.22, 0.2, x, CY + 3.9, -143.4, 0); for (const sx of [-1, 1]) box('#e6b45a', 0.22, 3.9, 0.2, x + sx * 1.42, CY + 1.95, -143.4, 0);
    box('#ec3013', 2.2, 0.03, 4.6, x, CY + 0.02, -141.0, 0);                                                                       // carpet keep door → pad
    const glo = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
    for (const [dx, dz] of [[-6.4, 3.4], [6.4, 3.4], [-6.4, -3.4], [6.4, -3.4]]) { box('#26292d', 0.14, 1.6, 0.14, x + dx, CY + 0.8, z + dz, 0.02); const l = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), glo); l.position.set(x + dx, CY + 1.75, z + dz); G.add(l);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffc070, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(1.6); s.position.copy(l.position); G.add(s); }
    const btex = CT(128, 256, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#e6b45a'; g.fillRect(0, 0, w, 12); g.font = '900 96px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', w / 2, h * 0.45); });
    for (const sx of [-1, 1]) { box('#26292d', 0.12, 6, 0.12, x + sx * 3.6, CY + 3, -143.2, 0.02); const b = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.6), new THREE.MeshLambertMaterial({ map: btex, side: THREE.DoubleSide })); b.position.set(x + sx * 3.6 + sx * 0.7, CY + 4.5, -143.15); G.add(b); }
    G.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  }

  // ---------- actors ----------
  const A = (f, x, y, z, yaw) => { f.position.set(x, y, z); f.rotation.y = yaw; f.visible = true; f.userData.goal = null; };
  const walkTo = (f, x, z, yaw, delay = 0) => { f.userData.goal = { x, z, yaw, delay }; };
  function stepFox(f, dt) { if (!f.visible) return; const u = f.userData, g = u.goal; let sp = 0;
    if (g) { if (g.delay > 0) g.delay -= dt; else { const dx = g.x - f.position.x, dz = g.z - f.position.z, d = Math.hypot(dx, dz);
      if (d > 0.05) { const s = Math.min(d, 1.9 * dt); f.position.x += dx / d * s; f.position.z += dz / d * s; f.rotation.y += angD(f.rotation.y, Math.atan2(dx, dz)) * Math.min(1, dt * 10); sp = 1.9; }
      else if (g.yaw != null) f.rotation.y += angD(f.rotation.y, g.yaw) * Math.min(1, dt * 6); else u.goal = null; } }
    kit.animFox(f, dt, sp, false); }
  const placePlayer = (x, y, z, yaw) => { Object.assign(P, { x, y, z, vx: 0, vz: 0, vy: 0, yaw }); fox.position.set(x, y, z); fox.rotation.y = yaw; fox.visible = true; };
  function stepPlayer(dt) { const g = fox.userData.goal; let sp = 0; if (g && g.delay <= 0) { const dx = g.x - P.x, dz = g.z - P.z, d = Math.hypot(dx, dz); if (d > 0.05) { const s = Math.min(d, 1.9 * dt); P.x += dx / d * s; P.z += dz / d * s; P.yaw += angD(P.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 10); sp = 1.9; } else if (g.yaw != null) P.yaw += angD(P.yaw, g.yaw) * Math.min(1, dt * 6); else fox.userData.goal = null; } else if (g) g.delay -= dt;
    fox.position.set(P.x, P.y, P.z); fox.rotation.y = P.yaw; fox.userData.mood = 'determined'; kit.animFox(fox, dt, sp, false); }

  // ---------- helicopter ----------
  function setHeli() { heli.position.copy(H0.pos); heli.rotation.set(H0.pitch, H0.yaw, H0.roll); heli.updateMatrixWorld(true);
    const s = heli.localToWorld(V.seat.clone()); pilot.position.set(s.x, s.y - 0.28, s.z); pilot.rotation.y = H0.yaw; pilot.visible = true; }
  function spinRotor(dt) { V.rotor.rotation.y += rpm * 26 * dt; V.tailRotor.rotation.x += rpm * 40 * dt; V.rotorDisc.material.opacity = rpm * 0.22; V.tailDisc.material.opacity = rpm * 0.3;
    V.rotor.children.forEach((b, i) => { if (i) b.visible = rpm < 0.85 || (St.t * 60 + i) % 2 < 1; }); if (V.strobe) V.strobe.visible = Math.sin(St.t * 9) > 0.6; }
  const doorPt = (side, out = 1.2) => { const p = heli.localToWorld(V3(side * (0.93 + out / 1.4), 0, -0.35)); return [p.x, p.z]; };

  // ---------- rotor sound (own little synth, louder the closer the camera) ----------
  function audioOn() { try { if (audio) { audio.ctx.resume && audio.ctx.resume(); return; } const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; const ctx = new AC();
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const n = ctx.createBufferSource(); n.buffer = buf; n.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 320; bp.Q.value = 0.9;
    const chop = ctx.createGain(); chop.gain.value = 0.5; const lfo = ctx.createOscillator(); lfo.frequency.value = 18; const lg = ctx.createGain(); lg.gain.value = 0.5; lfo.connect(lg); lg.connect(chop.gain);
    const hum = ctx.createOscillator(); hum.type = 'sawtooth'; hum.frequency.value = 62; const hg = ctx.createGain(); hg.gain.value = 0.05; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
    const out = ctx.createGain(); out.gain.value = 0; n.connect(bp); bp.connect(chop); chop.connect(out); hum.connect(hg); hg.connect(lp); lp.connect(out); out.connect(ctx.destination); n.start(); lfo.start(); hum.start();
    const recM = ctx.createGain(); recM.gain.value = 0; recM.connect(ctx.destination); audio = { ctx, out, lfo, hum, rec: recM }; recLoad(); } catch (e) { audio = null; } }
  // s307 (Ben): RECORDED HELICOPTER (audio/heli/*.mp3): fly = cruising loop · land = landing then idle (quiet file, boosted) · off = idle, lifts off at 11 s
  const RECF = { fly: ['heli-fly', 1.0, 1.0, 15.0], land: ['heli-land-idle', 4.0, 9.0, 16.3], off: ['heli-idle-takeoff', 1.2, 1.0, 10.4] }; const RB = {}; let recCur = null, recWant = null;
  function recLoad() { if (!audio || recLoad.on) return; recLoad.on = true; for (const [k, [n]] of Object.entries(RECF)) fetch(new URL('../audio/heli/' + n + '.mp3', import.meta.url)).then(r => r.ok ? r.arrayBuffer() : null).then(b => b && audio && audio.ctx.decodeAudioData(b)).then(buf => { if (buf) { RB[k] = buf; if (recWant && recWant[0] === k && !recCur) rec(...recWant); } }).catch(() => {}); }
  function rec(k, off = 0, loop = true) { recWant = [k, off, loop]; if (!audio || !RB[k]) return; const c = audio.ctx, t = c.currentTime, [, g0, ls, le] = RECF[k];
    if (recCur) { const o = recCur; o.g.gain.cancelScheduledValues(t); o.g.gain.setTargetAtTime(0.0001, t, 0.25); try { o.src.stop(t + 1.2); } catch (e) {} }
    const src = c.createBufferSource(); src.buffer = RB[k]; if (loop) { src.loop = true; src.loopStart = ls; src.loopEnd = Math.min(le, RB[k].duration); } const g = c.createGain(); g.gain.value = 0.0001; g.gain.setTargetAtTime(g0, t, 0.2); src.connect(g); g.connect(audio.rec); src.start(t, Math.min(off, RB[k].duration - 0.1)); recCur = { src, g, k }; }
  function audioStep() { if (!audio) return; const d = camera.position.distanceTo(heli.position), v = rpm * cl(1 - d / 140, 0.06, 1) * 0.45, t = audio.ctx.currentTime;
    const hasRec = recCur && RB[recCur.k]; audio.out.gain.setTargetAtTime(hasRec ? 0 : v, t, 0.1); audio.rec.gain.setTargetAtTime(hasRec ? cl(1 - d / 220, 0.35, 1) * 0.9 * (ph === 'talk' ? 0.35 : 1) : 0, t, 0.15); audio.lfo.frequency.setTargetAtTime(6 + rpm * 16, t, 0.2); audio.hum.frequency.setTargetAtTime(40 + rpm * 30, t, 0.2); }
  function audioOff() { if (!audio) return; recCur = null; recWant = null; recLoad.on = false; try { audio.out.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.2); audio.rec.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.3); const c = audio.ctx; setTimeout(() => { try { c.close(); } catch (e) {} }, 900); } catch (e) {} audio = null; }

  // ---------- camera: cut / glide, the subject framed clear of the dialogue box ----------
  const camP = V3(0, 0, 0), camL = V3(0, 0, 0);
  function frame(pos, look, cut, dt, k = 3) { if (cut) { camP.copy(pos); camL.copy(look); } else { const a = 1 - Math.exp(-k * dt); camP.lerp(pos, a); camL.lerp(look, a); }
    camera.position.copy(camP); camera.lookAt(camL); }
  function viewFor(talking) { const w = W(), h = H(), phone = Math.min(w, h) < 520, land = phone && w > h; camera.aspect = w / h;
    if (!talking) camera.clearViewOffset(); else { const sx = land ? 0.24 : phone ? 0 : 0.12, sy = land ? 0.06 : phone ? 0.24 : 0.16; camera.setViewOffset(w, h, -sx * w, sy * h, w, h); }
    camera.fov = land ? 50 : phone ? 62 : 50; camera.updateProjectionMatrix(); }
  const head = f => V3(f.position.x, f.position.y + cast.headY, f.position.z);

  // ---------- phases ----------
  const ROOF = { exec: [4.0, 5.0, Math.PI], exec2: [5.9, 5.8, Math.PI - 0.3], guard: [2.0, 5.4, Math.PI + 0.35], guard2: [7.5, 6.8, Math.PI - 0.6], player: [4, 1.6, 0] };
  const APPROACH = [V3(-80, 26, 46), V3(-24, 14, 22), V3(PAD[0], 7, PAD[1])];
  const FLY = [V3(PAD[0], 14, PAD[1]), V3(-55, 12, -70), V3(RP[0], CY + 14, RP[1])];
  const go = p => { ph = p; pt = 0; };
  function start() { if (!built) build(); onBegin(); audioOn(); St.recL = false; li = 0; rpm = 1; fade = 1; St.fade = 1;
    placePlayer(ROOF.player[0], 0, ROOF.player[1], ROOF.player[2]); fox.userData.goal = null;
    Object.assign(H0, { pos: APPROACH[0].clone(), yaw: 2.0, pitch: 0.12, roll: 0 }); setHeli();
    for (const k of ['exec', 'exec2', 'guard', 'guard2', 'door1', 'door2']) cast[k].visible = false;
    St.banner = 'SUDS-9 IS DOWN'; St.bannerT = 2.2; go('arrive'); rec('fly', 2); }

  function step(dt) { if (!ph) return; pt += dt; fade = Math.max(0, fade - dt * 1.6); let talking = false, cut = false;
    if (ph === 'arrive') { const T1 = 6.5, T2 = 2.8; if (pt >= T1 - 1.2 && !St.recL) { St.recL = true; rec('land', 2.5); }
      if (pt < T1) { const t = ease(pt / T1), p = bez(...APPROACH, t), q = bez(...APPROACH, Math.min(1, t + 0.02)); H0.pos.copy(p); H0.yaw += angD(H0.yaw, Math.atan2(q.x - p.x, q.z - p.z) || H0.yaw) * Math.min(1, dt * 3); H0.pitch = lerp(0.12, 0.02, t); }
      else { const t = ease(Math.min(1, (pt - T1) / T2)); H0.pos.set(PAD[0], lerp(7, 0, t), PAD[1]); H0.yaw += angD(H0.yaw, Math.PI) * Math.min(1, dt * 2.5); H0.pitch = 0; }
      P.yaw += angD(P.yaw, Math.atan2(H0.pos.x - P.x, H0.pos.z - P.z)) * Math.min(1, dt * 3);
      frame(V3(12.5, 2.6, -4.5), H0.pos.clone().lerp(V3(PAD[0], 1.2, PAD[1]), 0.45).add(V3(0, 1, 0)), pt < dt * 1.5, dt, 2.2);
      if (pt >= T1 + T2) { H0.yaw = Math.PI; rpm = 0.6; const sides = [[-1, 'exec'], [1, 'guard'], [-1, 'exec2'], [1, 'guard2']]; setHeli();
        sides.forEach(([s, k], i) => { const [x, z] = doorPt(s, 0.2); A(cast[k], x, 0, z, Math.atan2(-s, 0)); cast[k].visible = false; cast[k].userData.showAt = i * 0.45; const r = ROOF[k]; walkTo(cast[k], r[0], r[1], r[2], i * 0.45); });
        go('unload'); } }
    else if (ph === 'unload') { for (const k of ['exec', 'exec2', 'guard', 'guard2']) if (!cast[k].visible && pt >= cast[k].userData.showAt) cast[k].visible = true;
      P.yaw += angD(P.yaw, 0) * Math.min(1, dt * 4); frame(V3(12, 3.2, -1.5), V3(4, 1.6, 5.5), false, dt, 2);
      if (pt > 3.6) { go('talk'); cut = true; sayVo(0); } }
    if (ph === 'talk') { talking = true; const L = LINES[li], sp = L.who; for (const k of ['exec', 'guard', 'player']) { const f = k === 'player' ? fox : cast[k]; f.userData.talking = k === sp; f.userData.lineMood = k === sp ? (k === 'guard' ? 'stern' : k === 'player' ? 'determined' : 'warm') : null; }
      if (sp === 'exec') frame(V3(1.1, 2.6, -0.9), head(cast.exec), pt < dt * 1.5 || shot !== sp, dt);
      else if (sp === 'player') frame(V3(0.2, 2.7, 5.2), head(fox), pt < dt * 1.5 || shot !== sp, dt);
      else frame(V3(5.7, 2.75, -1.5), head(cast.guard), pt < dt * 1.5 || shot !== sp, dt);
      shot = sp; }
    else if (ph === 'board') { frame(V3(12.5, 3.2, -1.5), V3(4, 1.4, 7.5), pt < dt * 1.5, dt, 2);
      for (const k of ['guard', 'guard2']) { const f = cast[k]; if (f.visible && !f.userData.goal) f.visible = false; }
      if (fox.visible && !fox.userData.goal) fox.visible = false;
      if (pt > 2.6) { rpm = Math.min(1, rpm + dt * 0.8); } if (pt > 3.6 && !fox.visible) go('takeoff'); }
    else if (ph === 'takeoff') { const t = ease(Math.min(1, pt / 4)); rpm = 1; H0.pos.set(PAD[0], lerp(0, 14, t), PAD[1]); const yawTo = Math.atan2(FLY[1].x - PAD[0], FLY[1].z - PAD[1]); H0.yaw = lerp(Math.PI, Math.PI + angD(Math.PI, yawTo), t); H0.pitch = 0.1 * Math.max(0, t - 0.6) / 0.4;
      frame(V3(11, 1.7, -1.5), H0.pos.clone().add(V3(0, 1, 0)), pt < dt * 1.5, dt, 3);
      if (pt === dt || pt < dt * 1.5) { St.banner = 'TO THE CASTLE'; St.bannerT = 2.4; rec('off', 10.6, false); } if (pt >= 4) go('fly'); }
    else if (ph === 'fly') { const T = 9.5, t = Math.min(1, pt / T), e = ease(t), p = bez(...FLY, e), q = bez(...FLY, Math.min(1, e + 0.015)); H0.pos.copy(p);
      const hd = Math.atan2(q.x - p.x, q.z - p.z); H0.yaw += angD(H0.yaw, hd) * Math.min(1, dt * 2); H0.pitch = 0.22 * Math.sin(Math.PI * t); H0.roll = 0.12 * Math.sin(Math.PI * 2 * t);
      const back = V3(-Math.sin(H0.yaw) * 15, 5.5, -Math.cos(H0.yaw) * 15), side = V3(Math.cos(H0.yaw) * 6, 0, -Math.sin(H0.yaw) * 6);
      frame(H0.pos.clone().add(back).add(side), H0.pos.clone().add(V3(0, 0.5, 0)), pt < dt * 1.5, dt, 2.5);
      if (pt < dt * 1.5) { St.banner = 'OVER MERU'; St.bannerT = 2.4; rec('fly', 3); } if (t >= 1) go('land'); }
    else if (ph === 'land') { const t = ease(Math.min(1, pt / 4.2)); H0.pos.set(RP[0], lerp(CY + 14, CY, t), RP[1]); H0.yaw += angD(H0.yaw, Math.PI / 2) * Math.min(1, dt * 1.6); H0.pitch *= 0.9; H0.roll *= 0.9;
      frame(V3(-93, CY + 6.5, -125), H0.pos.clone().add(V3(0, 0.6, 0)), pt < dt * 1.5, dt, 2);
      if (pt < dt * 1.5) { rec('land', 4); St.banner = 'ROYAL LANDING PAD · MERU CASTLE'; St.bannerT = 3.2; A(cast.door1, RP[0] - 2.4, CY, -142.8, 0); A(cast.door2, RP[0] + 2.4, CY, -142.8, 0); }
      if (pt >= 4.6) { H0.yaw = Math.PI / 2; setHeli(); rpm = 0.5; const [x, z] = doorPt(1, 0.2); placePlayer(x, CY, z, Math.PI); fox.userData.goal = { x: RP[0] + 0.9, z: -141.9, yaw: Math.PI, delay: 0.3 }; A(cast.guard, x + 0.6, CY, z + 0.2, Math.PI); walkTo(cast.guard, RP[0] - 0.9, -141.7, Math.PI, 0.9); go('arrive2'); } }
    else if (ph === 'arrive2') { rpm = Math.max(0.15, rpm - dt * 0.2); frame(V3(-103.8, CY + 3.0, -133.6), V3(RP[0], CY + 1.9, -141.2), pt < dt * 1.5, dt, 2);
      if (pt > 1.8 && !St.finQ) { St.finQ = true; St.banner = 'PEARL SAIL COMPLETE'; St.bannerT = 2.6; setTimeout(() => { St.banner = 'NEW QUEST · KING\u2019S ERRAND'; St.bannerT = 3; }, 2700); }
      if (pt > 6.2) { fade = Math.min(1, (pt - 6.2) * 1.8 + fade); } if (pt > 7) { end(); return; } }
    if (heli) { setHeli(); spinRotor(dt); audioStep(); }
    for (const k of ['exec', 'exec2', 'guard', 'guard2', 'door1', 'door2']) if (cast[k]) stepFox(cast[k], dt);
    if (ph !== 'board' || fox.visible) stepPlayer(dt);
    viewFor(talking); St.fade = Math.max(fade, ph === 'arrive2' ? fade : 0); }

  // s316 Ben's recordings for each box (audio/vo/fin-*.mp3); the helicopter ducks while someone talks
  let voEl = null; function sayVo(i) { try { if (voEl) voEl.pause(); voEl = null; const L = LINES[i]; if (!L || !L.vo || window.__8gMuted) return; voEl = new Audio(new URL('../audio/vo/' + L.vo + '.mp3', import.meta.url).href); voEl.volume = 1; voEl.play().catch(() => {}); } catch (e) {} }
  function next() { audioOn(); if (ph !== 'talk') return; li++; pt = 0; if (li < LINES.length) sayVo(li); else sayVo(-1);
    if (li >= LINES.length) { for (const k of ['exec', 'guard']) { cast[k].userData.talking = false; cast[k].userData.lineMood = null; } fox.userData.talking = false; fox.userData.lineMood = null;
      [['guard', 1, 0.5], ['guard2', -1, 0.2]].forEach(([k, s, d]) => { const [x, z] = doorPt(s, 0.2); walkTo(cast[k], x, z, null, d); });   /* s304 (Ben): the MACHINE FLEET EXECUTIVES stay at the building; only you + the guards board */
      walkTo(cast.exec, 2.6, 3.4, 0.35, 0.3); walkTo(cast.exec2, 6.2, 3.8, -0.35, 0.6);
      { const [x, z] = doorPt(1, 0.2); fox.userData.goal = { x, z, yaw: null, delay: 0.9 }; } go('board'); } }
  function dialog() { if (ph !== 'talk') return null; const L = LINES[li], [name, role] = WHO[L.who]; return { name, role, text: L.text, step: li + 1, total: LINES.length, required: true }; }
  function end() { ph = null; audioOff(); sayVo(-1); camera.clearViewOffset(); camera.fov = 55; camera.updateProjectionMatrix(); for (const o of objs) o.visible = false; fox.visible = true; St.fade = 0; onDone(); }
  function dispose() { audioOff(); for (const o of objs) scene.remove(o); objs.length = 0; built = false; }
  return { start, step, next, dialog, dispose, get on() { return !!ph; }, get phase() { return ph; }, quest: () => ph === 'talk' || ph === 'arrive' || ph === 'unload' ? 'The Machine Fleet has landed' : 'Fly to the castle · the King wants to see you' };
}
