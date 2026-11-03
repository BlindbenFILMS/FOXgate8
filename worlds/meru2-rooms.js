// MERU 2.0 — step 3: interiors, part 1. TAVERN [meruTavern] and CASINO [meruCasino], dressed inside the city shells.
// Every game spot opens the original 2D minigame (minigames/meru/*.html) full-screen in the job panel.
// Casino = three SOUND BAYS split by glass partitions (slots west, poker north, wheel south) + the cashier cage, so voices don't stack.
import { BACK_DOORS } from './meru2-layout.js';
import { buildTavern } from './meru-tavern.js?v=s645';
import { buildCasino, CASINO_TALK } from './meru2-casino.js';
import { applyPose, endPose, FOX_ANIMS } from '../engine/fox-poses.js?v=s648k';
// s643d the LEFT-PAW wheel spin is (re)made here too, so a browser holding an older cached fox-poses.js still has it (that is why he stood still)
if (!FOX_ANIMS.wheel_spin_l && FOX_ANIMS.wheel_spin) { const PAIR = ['a', 'pole', 'palm', 'g', 'ext', 'wr', 'op', 'pt', 'fc', 'fcw', 'hp'], SRC = FOX_ANIMS.wheel_spin;
  const mir = o => { const q2 = { ...o }; for (const q of PAIR) if (Array.isArray(q2[q]) && q2[q].length === 2) q2[q] = [q2[q][1], q2[q][0]]; if (typeof q2.twist === 'number') q2.twist = -q2.twist; if (typeof q2.roll === 'number') q2.roll = -q2.roll; if (typeof q2.look === 'number') q2.look = -q2.look; if (Array.isArray(q2.head)) q2.head = [q2.head[0], -q2.head[1], -(q2.head[2] || 0)]; return q2; };
  FOX_ANIMS.wheel_spin_l = { ...SRC, label: 'WHEEL HOST: SPIN (LEFT PAW)', keys: SRC.keys.map(([t, o]) => [t, mir(o)]) }; }
// s614 CASINO FLOOR LIFE (Ben): the casino's existing people loop jointed job moves (engine/fox-poses.js) while you are nearby. No new graphics.
const CAS_JOBS = { casinoPoker1: ['c_shuffle', 'c_deal', 'c_deal', 'c_deal', 'c_deal', 'c_dwait'], casinoPoker2: ['c_dwait', 'c_shuffle', 'c_deal', 'c_deal', 'c_deal', 'c_deal'], casinoWheel: ['wheel_spin', 'host_greet'],
  casinoHost: ['host_greet'], casinoBartender: ['bar_wipe'], casinoSlots1: ['slot_pull', 'slot_pull', 'slot_win'], casinoSlots2: ['slot_pull', 'slot_win', 'slot_pull', 'slot_pull'], casinoStickman: ['c_push', 'c_dwait'],
  casinoCroupier: ['croupier'], casinoCrapsPlayer: ['dice_throw'], casinoPlayer1: ['think', 'hips'], casinoPlayer2: ['hips', 'think'] };
const G = 'minigames/meru/';
export function buildRooms({ THREE, scene, M, toon, kit, cast, cols, grad, save, audio, touch }) {
  const B = (w, h, d, col, x, y, z, ry = 0, o = 0.02) => { const m = M(new THREE.BoxGeometry(w, h, d), typeof col === 'string' ? toon(col) : col, x, y, z, null, o); m.rotation.y = ry; return m; };
  const C = (r, h, col, x, y, z, o = 0.02) => M(new THREE.CylinderGeometry(r, r, h, 20), typeof col === 'string' ? toon(col) : col, x, y, z, null, o);
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const glow = c => new THREE.MeshBasicMaterial({ color: c });
  const fox = (key, opt, x, z, ry) => { const f = kit.makeFox({ key, ...opt }); f.position.set(x, 0, z); f.rotation.y = ry; scene.add(f); ring(x, z, 0.5); return f; };
  const tex = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const spots = [], npcs = [], flick = [], tavDancers = [];
  const play = (label, url, x, z, r = 1.8) => spots.push({ key: label, x, z, r, prompt: 'PLAY \u00b7 ' + label, play: { label, url: G + url } });

  // ================= TAVERN [meruTavern] (f 12..52 × -100..-60, door S at x 32): the old Meru tavern, worlds/meru-tavern.js =================
  // bar, fireplace, tables, the 3D JUKEBOX and DARTS on the real board (+ Flick); replaces the step-3 placeholder that opened darts.html / jukebox.html
  const tav = buildTavern({ THREE, scene, M, toon, grad, kit, cols, save, audio, touch, rect: { x0: 12, x1: 52, z0: -100, z1: -60 }, clear: BACK_DOORS.tavern && BACK_DOORS.tavern.clear && !/[?&]backdoors=0/.test(location.search) ? [BACK_DOORS.tavern.clear] : [] }); spots.push(...tav.spots);
  {
    const TP = Object.fromEntries((tav.layout.people || []).map(p => [p.key, p])), nb = TP.noble || { x: 26, z: -76, a: 153 }, br = TP.docBraun || { x: 39, z: -85, a: 225 };   // placed in Tavern Workshop
    const noble = cast.make('noble'); noble.position.set(nb.x, 0, nb.z); noble.rotation.y = nb.a * Math.PI / 180; scene.add(noble); ring(nb.x, nb.z, 0.6); npcs.push(noble);
    npcs.push(fox('docBraun', { torso: '#5c6670', outfit: 'coat', joints: true }, br.x, br.z, br.a * Math.PI / 180)); tavDancers.push(npcs[npcs.length - 1]); }
  // s617 DOC BRAUN (Ben: keep going): jointed; dances to the JUKEBOX on its beat (GROOVE / CLAP ALONG / ARM WAVE, a new one each song bar),
  // otherwise a slow loop of THINK + HANDS ON HIPS + PROUD while you are in the tavern. Noble keeps his chair rig.
  const braun = npcs[npcs.length - 1], BR = { a: 'think', t: 0, on: false, k: 0, list: ['think', 'hips', 'think', 'proud'], i: 0, dance: ['groove', 'clap', 'disco', 'armwave', 'shuffle', 'hiphop', 'rockstep', 'moonwalk', 'jig'], di: 0, lastBar: -1 };
  function tickBraun(dt, J, P) { const near = P && Math.hypot(P.x - braun.position.x, P.z - braun.position.z) < 18 && !braun.userData.talking;
    if (!near) { if (BR.on) { endPose(braun); BR.on = false; } return; } let name, tt;
    if (J && J.beat != null && J.here) { const bar = Math.floor(J.beat / 8); if (bar !== BR.lastBar) { BR.lastBar = bar; if (bar % 2 === 0) BR.di = (BR.di + 1) % BR.dance.length; } name = BR.dance[BR.di]; tt = (J.beat * 0.5) % FOX_ANIMS[name].dur; }
    else { BR.t += dt; const A = FOX_ANIMS[BR.list[BR.i]]; if (BR.t >= A.dur) { BR.t = 0; BR.i = (BR.i + 1) % BR.list.length; } name = BR.list[BR.i]; tt = BR.t; }
    if (!FOX_ANIMS[name]) return; BR.k = Math.min(1, (BR.on ? BR.k : 0) + dt * 3); BR.on = true; applyPose(THREE, braun, name, tt, BR.k); }

  // ================= CASINO (f -150..-105 × -32..32, door E at z 0): worlds/meru2-casino.js, laid out in Casino Workshop.dc.html =================
  const casJobs = [], casArt = buildCasino({ THREE, scene, cols, touch, backDoor: BACK_DOORS.casino && !/[?&]backdoors=0/.test(location.search) ? BACK_DOORS.casino.door[1] : null }), casTalkers = [];
  { for (const s of casArt.spots) { play(s.label, s.url, s.x, s.z, s.r); if (s.slot) spots[spots.length - 1].slot = s.slot; if (s.wheel) spots[spots.length - 1].wheel = s.wheel; if (s.poker) spots[spots.length - 1].poker = s.poker; if (s.roul) spots[spots.length - 1].roul = s.roul; if (s.craps) spots[spots.length - 1].craps = s.craps; }   // s101: slots play in world
    for (const p of casArt.people) { if (p.key === 'casinoCashier') continue;   /* s90: Nickel (meru2-casino-jobs.js) works the cage now */ const jl = (CAS_JOBS[p.key] || []).filter(k => FOX_ANIMS[k]); const f = fox(p.key, jl.length ? { ...p.look, joints: true } : p.look, p.x, p.z, p.ry); npcs.push(f); if (jl.length) casJobs.push({ f, key: p.key, list: jl, i: Math.floor(Math.random() * jl.length), t: Math.random() * 2, on: false }); if (CASINO_TALK[p.key]) casTalkers.push({ key: p.key, obj: f, ry: p.ry, r: 2.4 }); } }

  // s643 WHEEL HOST (Ben: "the wheel fox is not doing any animation for spinning the wheel"): on his SPIN move he turns to the wheel's rim,
  // hauls a peg down and the REAL wheel spins (slows to a stop), then turns back to the guests for HOST GREET. Not while you play (disc hidden).
  const WH = { disc: (casArt.spots.find(s => s.wheel) || {}).wheel ? casArt.spots.find(s => s.wheel).wheel.disc : null, v: 0, ry0: null, pulled: false };
  // s643b SPOTLIGHT on the wheel host (Ben: "so we can see him"): one warm spot from above-front, no shadow (phone budget), + a soft floor pool
  let WHL = null; function wheelLight(f) { if (WHL) return; const sp = new THREE.SpotLight(0xfff0d0, 3.2, 11, 0.42, 0.55, 1.2); sp.castShadow = false; const tg = new THREE.Object3D(); scene.add(tg); sp.target = tg;
    const pool = new THREE.Mesh(new THREE.CircleGeometry(1.15, 32), new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, opacity: 0.16, depthWrite: false })); pool.rotation.x = -Math.PI / 2; scene.add(pool, sp); WHL = { sp, tg, pool }; }
  function wheelHost(J, dt) { const f = J.f; wheelLight(f); { const fr = f.rotation.y; WHL.sp.position.set(f.position.x + Math.sin(fr) * 2.2, f.position.y + 5.2, f.position.z + Math.cos(fr) * 2.2); WHL.tg.position.set(f.position.x, f.position.y + 1.1, f.position.z); WHL.pool.position.set(f.position.x, f.position.y + 0.02, f.position.z); }   /* s643g local: light, target + pool share the host's parent (the moved casino group); follows him when the walk moves him */
    if (WH.ry0 == null) WH.ry0 = f.rotation.y; const spin = J.i === 0;
    let want = WH.ry0;   /* s643c: he keeps facing the guests; the wheel is on his LEFT, the left paw hauls it */
    f.rotation.y += Math.atan2(Math.sin(want - f.rotation.y), Math.cos(want - f.rotation.y)) * Math.min(1, dt * 6);
    if (spin && J.t > 0.7 && !WH.pulled && WH.disc && WH.disc.visible) { WH.pulled = true; WH.v = -(5.5 + Math.random() * 3); } if (!spin || J.t < 0.3) WH.pulled = false; }
  function tick(dt, t, P, pfox, cam) { for (const f of npcs) kit.animFox(f, dt, 0, false);
    for (const J of casJobs) { const near = P && Math.hypot(P.x - J.f.position.x, P.z - J.f.position.z) < 20 && !J.f.userData.talking;
      if (!near) { if (J.on) { endPose(J.f); J.on = false; } continue; } const isHost = J.key === 'casinoWheel';
      if (isHost && window.__wheelHostPull) { window.__wheelHostPull = 0; J.i = 0; J.t = 0.35; J.mine = 1; }   // s643b: YOU pressed spin → he hauls the peg now
      if (isHost && window.__wheelPlaying && !J.mine && J.i === 0) { J.i = 1; J.t = 0; }   // while you play he waits (greets) until you spin
      const A = FOX_ANIMS[J.list[J.i]]; J.t += dt; if (J.t >= A.dur) { J.t = 0; J.i = (J.i + 1) % J.list.length; J.mine = 0; }
      J.k = Math.min(1, (J.on ? J.k : 0) + dt * 3); J.on = true;
      if (isHost) wheelHost(J, dt); applyPose(THREE, J.f, J.list[J.i], J.t, J.k); }
    if (WH.disc && WH.disc.visible) { WH.disc.rotation.z += WH.v * dt; WH.v *= Math.pow(0.42, dt); if (Math.abs(WH.v) < 0.05) WH.v = 0; } tickBraun(dt, tav.tick(dt, t, P, pfox, tavDancers), P); casArt.tick(dt, t, cam || P); for (const f of flick) { if (f.spin) f.spin.rotation.y += dt * 0.4; else f.scale.y = 0.85 + Math.sin(t * 13) * 0.1 + Math.sin(t * 7.1) * 0.08; } }
  return { spots, tick, tavern: tav, keys: new Set([...tav.keys, ...casTalkers.map(t => t.key)]), TALK: CASINO_TALK, talkers: casTalkers, toast: tav.toast, camFix: tav.camFix };
}
