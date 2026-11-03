// ORE SHAFT · BATTLE MAP (s365b): the 3 levels under Engineering on Deep Space Fox, built from Ore Shaft Layout Workshop (ore.shaft.layout)
// with the Machine Workshop robots (ore.machines). Explore + fight. Machines live in the wild areas and never step onto the walkway.
// Machines are victims of the hack: at 0 HP they are STUNNED, never destroyed. With the unhacker, stand close + E = UNHACK (a ring fills, stay near).
// Each level: a TOUGH guard drops a part (TUNER COIL → ROUGH UNHACKER · FOCUS LENS → faster · CORE KEY → TRUE UNHACKER); R-8 repairs the lift; ride down.
// L2: the signal hacks R-8 (your first unhack). L3 BOSS (s366): the Drill Rig guards the Signal Relay. Phase 1 = wreck the relay (jump its pulse rings,
// the Rig is shielded by the signal + hunts you). Phase 2 = the shield drops: hit the Rig's core when the drill sticks, stun it, UNHACK it. Reward + clue.
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js';
import { castKit } from '../engine/cast.js';
import { save } from '../engine/save.js';
import { buildMachine, poseMachine, loadMachines, KIND, LINES } from './ore-machines.js?v=s364aj';
import { loadLayout, LEVELS, TOOL, MNAME, pathDist, inRect } from './ore-shaft-layout.js?v=s365';
import { oreSceneKit, buildOreLevel, hash, rng } from './ore-shaft-scene.js?v=s365d';
import { battleMusic } from '../engine/battle-music.js?v=s267';
import { oreAmbient } from './ore-ambient.js?v=s367';

const R8_LINES = {
  start: [['R-8', 'Chief O\u2019Brain says stay close. I keep hearing a voice that is not mine.'], ['R-8', 'The hacked miners stay off the walkway. Follow the lamps.']],
  glitch: ['RETURN TO CRA\u2014 no. Sorry. Still me.', 'ALL UNITS\u2014 ugh. Static.', 'I am fine. Mostly fine.', 'That voice again. Ignore it.'],
  part: [['R-8', 'A TUNER COIL! I can build a rough unhacker from it.'], ['R-8', 'A FOCUS LENS! Your unhacker works faster now.'], ['R-8', 'The CORE KEY! The unhacker is complete.']],
  built: 'Stun a machine, stand close, press E. Stay near while the ring fills.',
  lift: [['R-8', 'The lift motor is fried. Hold on, I can fix it.']],
  fixed: 'Lift repaired. Going down?',
  arrive: [[], [['R-8', 'The signal is louder down here. Fox\u2026 something is pulling at me.']], [['R-8', 'This is where the signal comes from. The transmitter sends it down to Meru.']]],
  freed: [['R-8', 'R-8 online. My own thoughts. Can I come with you?'], ['R-8', 'I will teach the others. Free will beats orders.']],
};
const BOSS_LINES = {
  intro: [['SIGNAL RELAY', LINES.relay.hacked, 'THE HACK’S VOICE'], ['R-8', 'That is the transmitter! It sends the hack down to Meru. Wreck it.'], ['R-8', 'The Rig is shielded by the signal. Dodge him. Jump the red rings.']],
  introRig: [['DRILL RIG', LINES.rig.hacked, 'NOT HIS OWN VOICE'], ['R-8', 'Hit his core when the drill sticks. Stun him, then unhack him.']],
  relayDown: [['R-8', 'The relay is down! The signal to Meru is cut.'], ['DRILL RIG', 'NO… THE VOICE… I AM THE DEEP.', 'NOT HIS OWN VOICE'], ['R-8', 'His shield is gone. Hit the core when the drill sticks, then unhack him.']],
  won: [['R-8', 'The bots on Meru are waking up. Their own thoughts again.'], ['DRILL RIG', 'The ore we hid holds cyan crystals. They hum with power. Enough to keep us running.', 'FREED · HIS OWN VOICE'],
    ['R-8', 'Enough to live on. Not to grow. To grow, we would need the foxes.'], ['R-8', 'I tuned your laser with the relay core. It hits harder now. Let us tell the Chief.']],
};
const PART_FLAG = ['orePart1', 'orePart2', 'orePart3'];

export async function createOreShaft({ container, onState = () => {}, startLevel = 0, onExit = () => { location.href = 'Deep Space Fox.dc.html'; } }) {
  const touch = matchMedia('(pointer: coarse)').matches, W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.5 : 2)); renderer.setSize(W(), H()); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(55, W() / H(), 0.2, 400);
  const hemi = new THREE.HemisphereLight(0xc8dcf0, 0x30363c, 1.25); scene.add(hemi); const sun = new THREE.DirectionalLight(0xfff0d8, 0.85); sun.position.set(-30, 60, 20); scene.add(sun);
  const head = new THREE.PointLight(0xffd8a0, 30, 16, 1.5); scene.add(head);   // the fox's work light: warm pool round you
  const grad = makeGradient(), cache = new Map(), toon = c => { if (!cache.has(c)) cache.set(c, new THREE.MeshToonMaterial({ color: c, gradientMap: grad })); return cache.get(c); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x0e0c14, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const K = oreSceneKit({ toon, outlineMat, touch }), glowTex = K.glowTex;
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const fox = castKit({ THREE, M, toon, makeFox: kit.makeFox }).make('player', { holster: true }); if (!fox.parent) scene.add(fox); const G = fox.userData.rig;
  const mach = loadMachines(), botKit = { THREE, M, toon, glowTex, outlineMat };
  const shadowMat = new THREE.MeshBasicMaterial({ map: glowTex, color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false });
  const blob = (s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), shadowMat); m.rotation.x = -Math.PI / 2; scene.add(m); return m; };
  const foxShadow = blob(1.6);

  // ---------- state ----------
  const L = loadLayout(); let li = Math.max(0, Math.min(2, startLevel)), lv = null, D = null, SC = null, deckY = 0.2;
  const P = { x: 0, z: 0, y: 0, vx: 0, vz: 0, vy: 0, yaw: 0, hp: 100, en: 100, inv: 0, ko: 0, air: false, jumps: 0, mHold: null, rHeld: false, rCd: 0, steamCd: 0 };
  const St = { state: 'ready', paused: false, t: 0, banner: '', bannerT: 0, dialog: null, dq: [], fade: 0, fadeTo: null, quest: '', prompt: null, shake: 0, sleep: false,
    lift: 'broken', arenaSeen: false, r8hacked: false, lvFreed: 0, lvTotal: 0, un: null };
  const stick = { x: 0, y: 0 }, keys = new Set(), CAM = { yaw: 0, pitch: touch ? 0.5 : 0.42, dist: touch ? 11 : 9.5, zoom: 1, drag: null };
  const tool = () => PART_FLAG.reduce((n, f) => n + (save.flag(f) ? 1 : 0), 0);   // 0 = none, 1..3
  let foes = [], shots = [], floaters = [], falls = [], pulses = [], guard = null, partDrop = null, R8 = null, liftIt = null, arenaIt = null;
  const laserD = () => save.flag('oreLaserUp') ? 14 : 9;
  const bossHurtable = e => { const B = St.boss; if (!B || !e.boss || !e.hacked) return false; if (e.type === 'relay') return B.phase === 'relay' && e.state !== 'dead'; return B.phase === 'rig' && e.state !== 'stun' && e.state !== 'down' && e.state !== 'free'; };
  const canHit = e => e.hacked && e.state !== 'stun' && e.state !== 'down' && e.state !== 'free' && e.state !== 'dead' && (!e.boss || bossHurtable(e));

  // ---------- helpers ----------
  const yawTo = (dx, dz) => Math.atan2(-dz, dx);   // machines face +x
  const _v = new THREE.Vector3();
  function say3(text, x, y, z, col = '#f3f2f2', big = false) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d'); g.font = `900 ${big ? 60 : 46}px Archivo, "Arial Black", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#000'; g.strokeText(text, 256, 50); g.fillStyle = col; g.fillText(text, 256, 50);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, sizeAttenuation: false })); s.renderOrder = 20; const h = touch ? 0.07 : 0.055; s.scale.set(h * 512 / 96, h, 1); s.position.set(x, y, z); scene.add(s); floaters.push({ s, t: 0, life: 1.4 });
    if (floaters.length > 14) { const q = floaters.shift(); scene.remove(q.s); q.s.material.map.dispose(); q.s.material.dispose(); } }
  const sparkGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09), sparks = [];
  function burst(x, y, z, n, col) { for (let i = 0; i < n; i++) { let s = sparks.find(q => !q.on); if (!s) { if (sparks.length > 160) break; s = { m: new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ toneMapped: false })) }; scene.add(s.m); sparks.push(s); } const a = Math.random() * 6.283, v = rr(2, 5.5); Object.assign(s, { on: true, x, y, z, vx: Math.cos(a) * v, vy: rr(1, 5), vz: Math.sin(a) * v, life: rr(0.3, 0.7) }); s.m.material.color.set(col); s.m.visible = true; } }
  function banner(t, sec = 2.4) { St.banner = t; St.bannerT = sec; }
  function dialog(lines, then) { St.dq = lines.slice(); St.dTotal = lines.length; St.dStep = 0; St.dqThen = then || null; nextLine(); }
  function nextLine() { const l = St.dq.shift(); if (!l) { St.dialog = null; const f = St.dqThen; St.dqThen = null; if (f) f(); emit(); return; } St.dStep++; St.dialog = { name: l[0], role: l[2] ? l[2] : l[0].startsWith('R-8') ? (l[0] === 'R-8' ? 'REPAIR DRONE · ENGINEERING' : 'NOT HIS OWN VOICE') : '', text: l[1], choices: null, required: false, step: St.dStep, total: St.dTotal }; emit(); }
  const items = it => lv.items.filter(i => i.k === it);
  const onDeck = (x, z) => pathDist(lv, x, z) < 0;
  // ground height under (x, z): walkway deck, conveyor tops, the ore pile-up (climb it)
  function groundAt(x, z, y = 99) { let g = onDeck(x, z) ? deckY + 0.125 : 0;
    for (const b of SOL.belts) { const u = (x - b.x) * b.c + (z - b.z) * b.s, v = -(x - b.x) * b.s + (z - b.z) * b.c; if (Math.abs(u) < b.len / 2 && Math.abs(v) < 1.2 && y > 0.6) g = Math.max(g, 0.92); }
    for (const p of SOL.piles) { const d = Math.hypot(x - p.x, z - p.z); if (d < p.r) g = Math.max(g, p.h * (1 - d / p.r)); }
    return g; }
  const SOL = { circles: [], belts: [], piles: [] };
  function buildSolids() { SOL.circles = []; SOL.belts = []; SOL.piles = [];
    for (const it of lv.items) { if (it.k === 'rock') SOL.circles.push([it.x, it.z, it.r * 0.92]); else if (it.k === 'dead') SOL.circles.push([it.x, it.z, 1.9]); else if (it.k === 'chute') SOL.circles.push([it.x, it.z, 3.4]);
      else if (it.k === 'belt') { const a = (it.ang || 0) * Math.PI / 180; SOL.belts.push({ x: it.x, z: it.z, len: it.len, c: Math.cos(a), s: Math.sin(a), up: it.dir === 'up' }); }
      else if (it.k === 'pile') SOL.piles.push({ x: it.x, z: it.z, r: it.r, h: it.h || 4 }); } }
  function collide(o, r, y) { const d = D; o.x = clamp(o.x, -d.hw + 1.2, d.hw - 1.2); o.z = clamp(o.z, -d.hd + 1.2, d.hd - 1.2);
    for (const [cx, cz, cr] of SOL.circles) { const dx = o.x - cx, dz = o.z - cz, dd = Math.hypot(dx, dz), m = cr + r; if (dd < m && dd > 1e-4) { o.x = cx + dx / dd * m; o.z = cz + dz / dd * m; } }
    for (const b of SOL.belts) { if (y > 0.8) continue; const dx = o.x - b.x, dz = o.z - b.z, u = dx * b.c + dz * b.s, v = -dx * b.s + dz * b.c, hu = b.len / 2 + r, hv = 1.2 + r; if (Math.abs(u) < hu && Math.abs(v) < hv) { const pu = hu - Math.abs(u), pv = hv - Math.abs(v); let nu = u, nv = v; if (pu < pv) nu = Math.sign(u || 1) * hu; else nv = Math.sign(v || 1) * hv; o.x = b.x + nu * b.c - nv * b.s; o.z = b.z + nu * b.s + nv * b.c; } } }

  // ---------- level ----------
  function clearLevel() { if (SC) { scene.remove(SC.root); SC.root.traverse(c => { if (c.geometry) c.geometry.dispose(); }); } for (const e of foes) { scene.remove(e.m); if (e.ring) scene.remove(e.ring); if (e.bar) scene.remove(e.bar); if (e.sh) scene.remove(e.sh); } foes = []; for (const q of shots) scene.remove(q.m); shots = []; for (const f of falls) { scene.remove(f.m); scene.remove(f.sh); } falls = []; if (partDrop) { scene.remove(partDrop.m); partDrop = null; } if (unRing) { scene.remove(unRing); unRing = null; } clearPulses(); if (St.boss && St.boss.fx) for (const m of St.boss.fx) scene.remove(m); St.boss = null; }
  function clearPulses() { for (const q of pulses) { scene.remove(q.m); q.m.material.dispose(); } pulses = []; }
  function loadLevel(i) {
    clearLevel(); li = i; lv = L.levels[i]; D = LEVELS[i];
    SC = buildOreLevel(K, L, i, { labels: false, machines: false, touch }); scene.add(SC.root); deckY = SC.deckY;
    scene.background = new THREE.Color(SC.mood.bg); scene.fog = new THREE.Fog(SC.mood.bg, touch ? 40 : 55, touch ? 85 : 120); hemi.color.set(SC.mood.hemi);
    buildSolids(); liftIt = items('lift')[0] || { x: lv.paths[0].pts[0][0], z: lv.paths[0].pts[0][1] };
    const p0 = lv.paths[0] ? lv.paths[0].pts : [[liftIt.x, liftIt.z], [liftIt.x + 1, liftIt.z]], q1 = p0[Math.min(1, p0.length - 1)];
    { const dx = q1[0] - liftIt.x, dz = q1[1] - liftIt.z, dl = Math.hypot(dx, dz) || 1; Object.assign(P, { x: liftIt.x + dx / dl * 4, z: liftIt.z + dz / dl * 4, y: deckY + 0.13, vx: 0, vz: 0, vy: 0, hp: Math.max(P.hp, 60) }); P.yaw = Math.atan2(dx, dz); CAM.yaw = P.yaw + Math.PI - 0.55; }   // camera behind, looking down the path
    St.lift = save.flag(PART_FLAG[i]) ? 'fixed' : 'broken'; St.r8hacked = false; St.un = null;
    // machines: each spawn circle → n hacked machines; the guard = a TOUGH one that drops the part
    const r = rng(hash('lv' + i) + 11);
    for (const s of items('spawn')) for (let k = 0; k < (s.n || 1); k++) { const a = r() * 6.283, d = s.n > 1 ? s.r * 0.6 * r() + 0.8 : 0; spawn(s.m, s.x + Math.cos(a) * d, s.z + Math.sin(a) * d, { home: [s.x, s.z], roam: s.r + 7 }); }
    guard = null; const gi = items('guard')[0]; if (gi) { guard = spawn(gi.m, gi.x, gi.z, { home: [gi.x, gi.z], roam: 9, tough: true }); if (save.flag(PART_FLAG[i])) { guard.state = tool() ? 'free' : 'down'; guard.hp = 0; guard.hacked = !tool(); } }
    St.lvTotal = foes.length; St.lvFreed = 0;
    // s367 FREED MINERS STAY FREED: oreFreed_<lv>_<id> → spawn them freed + idle (they already live off the walkway)
    for (const e of foes) if (save.flag('oreFreed_' + i + '_' + e.id) && tool()) { e.hacked = false; e.state = 'free'; e.hp = 0; e.t = 0; St.lvFreed++; }
    AMB.level(i);
    // L3: the boss pair in the arena (fight starts when you walk in)
    arenaIt = items('arena')[0] || null; St.boss = null;
    if (i === 2 && arenaIt) { const done = save.flag('oreBossDone'), B = St.boss = { phase: done ? 'done' : 'wait', relay: null, rig: null, fx: [] };
      const ri = items('relay')[0]; if (ri && !done && !save.flag('oreRelayDown')) { const e = spawn('relay', ri.x, ri.z, { boss: true, home: [ri.x, ri.z], roam: 0 }); Object.assign(e, { state: 'boss', rad: 1.7, aimY: 2.6, ringR: 2.4, dead: 0 }); B.relay = e; }
      const gi2 = items('rig')[0]; if (gi2) { const e = spawn('rig', gi2.x, gi2.z, { boss: true, home: [gi2.x, gi2.z], roam: 0 }); Object.assign(e, { state: done ? 'free' : 'boss', hacked: !done, rad: 1.9, aimY: 2.4, ringR: 3.2 }); if (done) e.hp = 0; e.yaw = yawTo(liftIt.x - e.x, liftIt.z - e.z); B.rig = e; }
      if (B.relay && B.rig) { const sh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0x3a6cff, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); sh.scale.setScalar(3.1 * B.rig.size); scene.add(sh);
        const bm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1), new THREE.MeshBasicMaterial({ color: 0x5f8cff, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); scene.add(bm); B.fx = [sh, bm]; B.shield = sh; B.beam = bm; } }
    if (!R8) makeR8(); R8.x = P.x + Math.cos(P.yaw) * 1.8; R8.z = P.z - Math.sin(P.yaw) * 1.8; R8.mode = 'follow'; R8.hacked = false;
    St.quest = questText(); St.fade = 1; St.fadeTo = 0; emit();
    if (St.state === 'run') setTimeout(() => { banner(D.name, 2.8); if (R8_LINES.arrive[i].length) dialog(R8_LINES.arrive[i]); }, 600);
  }
  function questText() { const t = tool(), got = save.flag(PART_FLAG[li]);
    if (li === 2 && St.boss) { const ph = St.boss.phase, r = St.boss.rig;
      if (ph === 'relay') return 'Wreck the SIGNAL RELAY · jump the red rings · dodge the Rig';
      if (ph === 'rig' && r) return r.state === 'stun' ? 'Stand close to the DRILL RIG + E · UNHACK him' : r.state === 'down' ? 'The Rig is powered down · find the unhacker parts' : 'Stun the DRILL RIG · hit his core when the drill sticks';
      if (ph === 'won' || ph === 'done') return 'Shaft clear · ride the lift up to Chief O\u2019Brain'; }
    if (li === 1 && !save.flag('oreR8Free')) return St.r8hacked ? 'R-8 is HACKED! Stun him, then stand close + E to UNHACK him' : 'Follow the lamps through the flooded hall';
    if (!got) return 'Find the TOUGH ' + (guard ? MNAME[guard.type] : 'machine') + ' · it carries the ' + TOOL[li].part;
    if (li === 2) return 'Enter the arena · the Drill Rig guards the Signal Relay';
    if (St.lift !== 'fixed') return 'Back to the lift · R-8 can fix it';
    return 'Ride the lift down' + (t ? ' · unhack the stunned machines on the way' : ''); }
  function spawn(type, x, z, o = {}) { const st = { ...(mach.stats[type] || {}) }, look = mach.look[type] || {}, size = (look.size || 1) * (o.tough ? 1.2 : 1);
    if (o.tough) st.hp = (st.hp || 50) * 2; const m = buildMachine(botKit, type, look); m.scale.setScalar(size); m.userData.seed = Math.random() * 9; scene.add(m);
    const e = { type, x, z, y: 0, yaw: Math.random() * 6.28, hp: st.hp || 50, max: st.hp || 50, st, size, m, state: 'idle', t: Math.random() * 2, hacked: true, spd: 0, home: o.home || [x, z], roam: o.roam ?? 10, tough: !!o.tough, boss: !!o.boss, cd: rr(0.5, 2), hy: type === 'survey' || type === 'r8' ? (st.hover || 1.4) : 0, look, dir: [1, 0], hitDone: false, id: foes.length, rad: 0.9 * size, sh: blob(1.8 * size) };
    // HP bar (two sprites, left-anchored fill)
    const bar = new THREE.Group(); const bg = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x000000, depthTest: false, sizeAttenuation: false })); bg.center.set(0.5, 0.5); bg.scale.set(0.09, 0.012, 1); const fg = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xec3013, depthTest: false, sizeAttenuation: false })); fg.center.set(0.5, 0.5); fg.scale.set(0.086, 0.008, 1); bg.renderOrder = 15; fg.renderOrder = 16; bar.add(bg, fg); bar.userData.fg = fg; bar.visible = false; scene.add(bar); e.bar = bar;
    foes.push(e); return e; }
  function makeR8() { const look = { ...mach.look.r8 }, m = buildMachine(botKit, 'r8', look); m.scale.setScalar((look.size || 1.3) * 0.8); scene.add(m); R8 = { m, x: 0, z: 0, y: 1.6, yaw: 0, cd: 2, glitch: rr(9, 14), gT: 0, mode: 'follow', hacked: false, fixT: 0, sh: blob(1.4) }; }

  // ---------- combat ----------
  const sword = 24;
  function hurtFoe(e, d, fx, fz) {
    if (e.boss && e.type === 'rig' && e.hacked && St.boss && St.boss.phase === 'relay') { if ((e.shT || 0) < St.t) { e.shT = St.t + 0.8; say3('SIGNAL SHIELD', e.x, e.y + 4.4, e.z, '#7fa8ff'); burst(e.x, 2.2, e.z, 8, 0x3a6cff); } return false; }
    if (!canHit(e)) return false;
    const mul = e.state === 'rest' ? 1.6 : e.type === 'rig' ? 0.5 : 1; d = Math.round(d * mul); e.hp -= d; e.flash = 0.15; const ty = e.aimY ? e.y + e.aimY + 1.6 : e.y + 2.2 * e.size;
    say3(mul > 1 ? d + ' · OPEN!' : mul < 1 ? d + ' · ARMOUR' : String(d), e.x, ty, e.z, mul > 1 ? '#7cff9b' : mul < 1 ? '#cfcac4' : '#ffd23a'); burst(e.x, e.aimY ? e.aimY : 1 + e.hy, e.z, 6, 0xffb347);
    if (!e.boss) { const dx = e.x - fx, dz = e.z - fz, dd = Math.hypot(dx, dz) || 1; if (e.state !== 'atk') { e.x += dx / dd * 0.35; e.z += dz / dd * 0.35; } if (e.state === 'idle') { e.state = 'chase'; e.t = 0; } }
    if (e.hp <= 0) { if (e.type === 'relay' && e.boss) wreckRelay(e); else stunFoe(e); } return true; }
  function wreckRelay(e) { const B = St.boss; e.hp = 0; e.state = 'dead'; e.dead = 0; e.t = 0; burst(e.x, 3, e.z, 40, 0xff3b2a); burst(e.x, 1.5, e.z, 30, 0xffb347); burst(e.x, 4.5, e.z, 20, 0x3a6cff); St.shake = 0.8; clearPulses();
    say3('RELAY WRECKED!', e.x, e.y + 5, e.z, '#ffd23a', true); save.setFlag('oreRelayDown'); if (B.fx) { for (const m of B.fx) scene.remove(m); B.fx = []; B.shield = B.beam = null; } if (B.rig) burst(B.rig.x, 2.4, B.rig.z, 24, 0x3a6cff);
    B.phase = 'cut'; banner('THE SIGNAL TO MERU IS CUT', 2.8); setTimeout(() => dialog(BOSS_LINES.relayDown, () => { B.phase = 'rig'; banner('THE RIG\u2019S SHIELD IS DOWN', 2.6); setTimeout(() => banner('WAIT FOR THE DRILL TO STICK · HIT THE CORE', 2.8), 2800); emit(); }), 1400); }
  function pulse(x, z, max, sp, dmg, col) { AMB.sfx(col === 0xffb347 ? 'slam' : 'pulse'); const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.8, 72, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    m.geometry.translate(0, 0.4, 0); m.position.set(x, 0.02, z); m.scale.set(0.5, 1, 0.5); scene.add(m); pulses.push({ m, x, z, r: 0.5, max, sp, dmg, hit: false, jumped: false }); }
  function stunFoe(e) { AMB.sfx('stun'); e.hp = 0; e.state = tool() ? 'stun' : 'down'; e.t = 0; burst(e.x, 1.2, e.z, 18, 0x5fe3ff); St.shake = Math.max(St.shake, 0.2);
    say3(tool() ? (e.boss ? 'STUNNED · UNHACK HIM!' : 'STUNNED · UNHACK IT!') : 'POWERED DOWN', e.x, e.y + (e.aimY ? e.aimY + 2 : 2.6 * e.size), e.z, '#5fe3ff', true); if (e.boss) { banner(tool() ? 'DRILL RIG STUNNED · STAND CLOSE + E' : 'DRILL RIG POWERED DOWN', 2.6); St.shake = 0.5; }
    if (e === guard && !save.flag(PART_FLAG[li])) dropPart(e.x, e.z);
    if (e.r8) { St.quest = questText(); } }
  function dropPart(x, z) { const g = new THREE.Group(); const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), new THREE.MeshBasicMaterial({ color: 0xffd23a, toneMapped: false })); g.add(core); const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(2.4); g.add(halo); g.position.set(x, 1.2, z); scene.add(g); partDrop = { m: g, x, z, core };
    banner(TOOL[li].part + ' DROPPED · GRAB IT', 2.6); }
  function pickPart() { AMB.sfx('part'); scene.remove(partDrop.m); partDrop = null; save.setFlag(PART_FLAG[li]); burst(P.x, 1.4, P.z, 24, 0xffd23a); G.powerFx && G.powerFx(0xffd23a);
    const t = tool(); banner(TOOL[t - 1].name + ' BUILT', 2.8); dialog([R8_LINES.part[li], ...(t === 1 ? [['R-8', R8_LINES.built]] : [])], () => { St.quest = questText(); emit(); });
    for (const e of foes) if (e.state === 'down') { e.state = 'stun'; e.t = 0; } St.quest = questText(); }
  function nearestFoe(x, z, r, front) { let best = null, bd = r; for (const e of foes) { if (!canHit(e)) continue; const dx = e.x - x, dz = e.z - z, d = Math.hypot(dx, dz) - e.rad; if (d > bd) continue; if (front != null) { const c = (dx * Math.sin(P.yaw) + dz * Math.cos(P.yaw)) / (Math.hypot(dx, dz) || 1); if (c < front) continue; } bd = d; best = e; } return best; }
  function doHit(mv) { if (!mv) return; const reach = mv.reach || 2.7, cone = mv.cone ?? 0.25, k = mv.k || 1; let n = 0;
    const tgt = nearestFoe(P.x, P.z, reach + 1.5, -0.2); if (tgt && cone > -1) P.yaw = Math.atan2(tgt.x - P.x, tgt.z - P.z);   // turn into the closest machine
    setTimeout(() => { for (const e of foes) { const dx = e.x - P.x, dz = e.z - P.z, d = Math.hypot(dx, dz); if (d > reach + e.rad) continue; const c = (dx * Math.sin(P.yaw) + dz * Math.cos(P.yaw)) / (d || 1); if (c < cone) continue; if (hurtFoe(e, sword * k, P.x, P.z)) n++; } if (n) St.shake = Math.max(St.shake, 0.08 * k); }, (mv.dur || 0.24) * 450); }
  function shoot() { if (P.ko > 0 || St.state !== 'run') return; const from = G.shoot(); const e = nearestFoe(P.x, P.z, 22, 0.55);
    if (e) { P.yaw = Math.atan2(e.x - P.x, e.z - P.z); const to = new THREE.Vector3(e.x, e.y + (e.aimY || 1 + e.hy * 0.6), e.z); G.bolt(from, to, true); const d = Math.hypot(e.x - P.x, e.z - P.z); setTimeout(() => hurtFoe(e, laserD(), P.x, P.z), d / 70 * 1000); } else G.bolt(from, null, false); P.rCd = 0.18; }
  function hurtP(d, fx, fz) { if (P.inv > 0 || P.ko > 0 || St.state !== 'run') return; P.hp = Math.max(0, P.hp - d); P.inv = 0.7; G.hurt && G.hurt(fx, fz, 1, 0.55); const dx = P.x - fx, dz = P.z - fz, dd = Math.hypot(dx, dz) || 1; P.vx += dx / dd * 6; P.vz += dz / dd * 6; St.shake = Math.max(St.shake, 0.25); say3('-' + d, P.x, P.y + 2.2, P.z, '#ff6b5a');
    if (P.hp <= 0) { P.ko = 2.6; banner('KNOCKED OUT · BACK TO THE LIFT', 2.4); } emit(); }
  function fireBolt(e, from, col = 0xff3b2a) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.6, 3, 6), new THREE.MeshBasicMaterial({ color: col, toneMapped: false })); m.geometry.rotateX(Math.PI / 2); scene.add(m);
    const ty = P.y + 1.1, L = Math.hypot(P.x - from.x, ty - from.y, P.z - from.z) || 1, sp = e ? (e.st.bolt || 10) : 16; shots.push({ m, x: from.x, y: from.y, z: from.z, v: [(P.x - from.x) / L * sp, (ty - from.y) / L * sp, (P.z - from.z) / L * sp], dmg: e ? (e.st.hit || 6) : 0, life: 3, own: e }); }
  // ---------- unhack ----------
  let unRing = null; const unMat = new THREE.MeshBasicMaterial({ color: 0x5fe3ff, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
  function drawUn(e, k) { const r = e.ringR || 1.3 * e.size; if (unRing) { scene.remove(unRing); unRing.geometry.dispose(); } unRing = new THREE.Mesh(new THREE.RingGeometry(r - 0.14, r + 0.14, 64, 1, Math.PI / 2, -Math.max(0.001, k) * Math.PI * 2), unMat); unRing.rotation.x = -Math.PI / 2; unRing.position.set(e.x, (e.state === 'down' || e.state === 'stun' ? 0 : 0) + 0.08 + groundAt(e.x, e.z, 0), e.z); scene.add(unRing); }
  function unhackable() { if (!tool() || P.ko > 0) return null; let best = null, bd = 3.0; for (const e of foes) { if (e.state !== 'stun' || !e.hacked) continue; const d = Math.hypot(e.x - P.x, e.z - P.z) - e.rad * 0.5; if (d < bd) { bd = d; best = e; } } return best; }
  function startUnhack(e) { const t = tool(); St.un = { e, t: 0, need: (e.st.unhack || 2.5) * TOOL[t - 1].hold }; G.sfx && G.sfx('power', { p: 0.5, v: 0.5 }); emit(); }
  function freeFoe(e) { e.hacked = false; e.state = 'free'; e.t = 0; burst(e.x, 1.4, e.z, 26, 0x5fe3ff); say3('FREED!', e.x, e.y + 2.8 * e.size, e.z, '#5fe3ff', true); St.lvFreed++; save.setFlag('oreFreed_' + li + '_' + e.id); AMB.sfx('free'); St.shake = 0.15;
    if (e.r8) { foes.splice(foes.indexOf(e), 1); scene.remove(e.bar); scene.remove(e.sh); R8.away = false; R8.m.visible = true; R8.sh.visible = true; R8.x = e.x; R8.z = e.z; scene.remove(e.m); R8.mode = 'follow'; save.setFlag('oreR8Free'); St.r8hacked = false; dialog(R8_LINES.freed, () => { St.quest = questText(); emit(); }); return; }
    St.voice = { name: MNAME[e.type], text: LINES[e.type] ? LINES[e.type].freed : 'Thank you.', t: 4 };
    if (e.boss) { e.walkTo = null; St.boss.phase = 'won'; St.shake = 0.5; burst(e.x, 3, e.z, 30, 0x5fe3ff); banner('DRILL RIG FREED!', 2.6); setTimeout(() => dialog(BOSS_LINES.won, bossReward), 2200); emit(); return; }
    const a = Math.random() * 6.283; e.walkTo = [clamp(e.x + Math.cos(a) * 14, -D.hw + 3, D.hw - 3), clamp(e.z + Math.sin(a) * 14, -D.hd + 3, D.hd - 3)]; emit(); }

  function bossReward() { save.setFlag('oreBossDone'); save.setFlag('oreLaserUp'); save.addRelic('powerCrystal'); save.addXp(250); save.addGold(150); G.powerFx && G.powerFx(0x5fe3ff); burst(P.x, 1.4, P.z, 30, 0x5fe3ff);
    banner('ORE SHAFT CLEAR', 3); St.win = true; emit(); }
  // ---------- boss brains (L3) ----------
  function stepBoss(e, dt) { const S = e.st, B = St.boss, a = arenaIt, dx = P.x - e.x, dz = P.z - e.z, dist = Math.hypot(dx, dz), ox = e.x, oz = e.z;
    e.t += dt; e.flash = Math.max(0, (e.flash || 0) - dt); e.bar.visible = false; e.m.visible = e.state !== 'gone' && Math.hypot(camera.position.x - e.x, camera.position.z - e.z) < 95;
    const face = (k = 6) => { const q = yawTo(dx, dz); e.yaw += Math.atan2(Math.sin(q - e.yaw), Math.cos(q - e.yaw)) * Math.min(1, dt * k); };
    const fight = B && (B.phase === 'relay' || B.phase === 'rig') && St.state === 'run', inA = a && P.ko <= 0 && Math.hypot(P.x - a.x, P.z - a.z) < a.r + 3;
    let mode = 'idle', p = 0;
    if (e.type === 'relay') {
      if (e.state === 'dead' || e.state === 'gone') { mode = 'stun'; e.dead = Math.min(1, e.dead + dt * 0.6); e.m.scale.set(e.size, e.size * Math.max(0.04, 1 - e.dead), e.size); if (e.dead < 1 && Math.random() < dt * 24) burst(e.x + rr(-1, 1), rr(0.5, 4) * (1 - e.dead), e.z + rr(-1, 1), 2, pick([0xff3b2a, 0xffb347, 0x3a6cff])); if (e.dead >= 1) e.state = 'gone'; }
      else if (fight && B.phase === 'relay') { const half = e.hp < e.max * 0.5;
        if (e.state === 'boss' || e.state === 'idle') { e.state = 'idle'; if (e.t > (half ? 1.4 : 2.3)) { e.state = 'tell'; e.t = 0; } }
        else if (e.state === 'tell') { mode = 'tell'; p = e.t / (S.tell || 1); if (e.t > (S.tell || 1)) { e.state = 'atk'; e.t = 0; pulse(e.x, e.z, a.r + 4, S.pulse || 6, S.hit || 12, 0xff3b2a); burst(e.x, 4.6, e.z, 10, 0xff3b2a); St.shake = Math.max(St.shake, 0.12);
            if (half) setTimeout(() => { if (e.state !== 'dead' && e.state !== 'gone' && B.phase === 'relay') pulse(e.x, e.z, a.r + 4, (S.pulse || 6) * 1.15, S.hit || 12, 0xff3b2a); }, 900); } }
        else if (e.state === 'atk') { mode = 'atk'; p = e.t / 0.5; if (e.t > 0.5) { e.state = 'rest'; e.t = 0; } }
        else if (e.state === 'rest') { mode = 'rest'; if (e.t > (S.rest || 2.2) * (half ? 0.6 : 1)) { e.state = 'idle'; e.t = 0; } } }
    } else {
      if (e.state === 'free') mode = 'idle';
      else if (e.state === 'down' || e.state === 'stun') { mode = 'stun'; if (Math.random() < dt * 6) burst(e.x + rr(-1, 1), rr(1, 3), e.z + rr(-1, 1), 1, 0x5fe3ff);
        if (e.state === 'stun' && e.t > 22 && !(St.un && St.un.e === e)) { e.state = 'chase'; e.t = 0; e.hp = Math.round(e.max * 0.35); say3('REBOOTED', e.x, e.y + 4.4, e.z, '#ff6b5a', true); banner('THE RIG REBOOTED · STUN HIM AGAIN', 2.2); } }
      else if (!fight) { if (dist < 26) face(1.5); }
      else { const ph2 = B.phase === 'rig', hard = ph2 && e.hp < e.max * 0.5, reachP = 3.2 * e.size; e.cd -= dt;
        const mv = (tx, tz, sp) => { const ddx = tx - e.x, ddz = tz - e.z, d = Math.hypot(ddx, ddz); if (d < 0.05) return; const s = Math.min(d, sp * dt); let nx = e.x + ddx / d * s, nz = e.z + ddz / d * s; const qx = nx - a.x, qz = nz - a.z, qd = Math.hypot(qx, qz), lim = a.r - 1.5; if (qd > lim) { nx = a.x + qx / qd * lim; nz = a.z + qz / qd * lim; } e.x = nx; e.z = nz; };
        if (e.state === 'boss' || e.state === 'idle' || e.state === 'chase') { e.state = 'chase';
          if (inA) { face(3); if (dist > reachP * 0.85) mv(P.x, P.z, ph2 ? (hard ? 1.8 : 1.5) : 1.1); if (e.cd <= 0 && dist < reachP + 1.6) { e.state = 'tell'; e.t = 0; e.hitDone = false; } }
          else { mv(e.home[0], e.home[1], 1.1); const hx = e.home[0] - e.x, hz = e.home[1] - e.z; if (Math.hypot(hx, hz) > 0.4) { const q = yawTo(hx, hz); e.yaw += Math.atan2(Math.sin(q - e.yaw), Math.cos(q - e.yaw)) * Math.min(1, dt * 3); } } }
        else if (e.state === 'tell') { const T = hard ? 0.85 : (S.tell || 1.1); mode = 'tell'; p = e.t / T; face(e.t < T * 0.6 ? 4 : 0.6); if (e.t > T) { e.state = 'atk'; e.t = 0; } }
        else if (e.state === 'atk') { const pl = 0.7; mode = 'atk'; p = e.t / pl;
          if (!e.hitDone && e.t > pl * 0.35) { e.hitDone = true; const ix = e.x + Math.cos(e.yaw) * reachP, iz = e.z - Math.sin(e.yaw) * reachP; burst(ix, 0.2, iz, 24, 0xc8b89a); burst(ix, 0.4, iz, 12, 0xffd23a); St.shake = Math.max(St.shake, 0.5);
            if (Math.hypot(P.x - ix, P.z - iz) < 2.4 && P.y - groundAt(P.x, P.z, 0) < 1.2) hurtP(S.hit || 28, ix, iz); if (ph2) pulse(ix, iz, 10, 11, 12, 0xffb347); }
          if (e.t > pl) { e.state = 'rest'; e.t = 0; if (ph2) say3('DRILL STUCK · HIT THE CORE!', e.x, e.y + 4.6, e.z, '#7cff9b'); } }
        else if (e.state === 'rest') { mode = 'rest'; if (Math.random() < dt * 16) burst(e.x + Math.cos(e.yaw) * reachP, 0.3, e.z - Math.sin(e.yaw) * reachP, 1, 0xffd23a); if (e.t > (ph2 ? (S.rest || 2.6) : 1.2)) { e.state = 'chase'; e.t = 0; e.cd = rr(0.4, 1.2); } } }
    }
    { const o = { x: e.x, z: e.z }; collide(o, e.rad, 0); e.x = o.x; e.z = o.z; }
    e.spd = damp(e.spd, Math.hypot(e.x - ox, e.z - oz) / Math.max(dt, 1e-4), 10, dt); e.y = groundAt(e.x, e.z, 0);
    try { poseMachine(e.m, { mode, p, speed: e.spd, dt, t: St.t + e.m.userData.seed, hacked: e.hacked, aim: [P.x, P.y + 1.1, P.z] }); } catch (er) {}
    e.m.position.set(e.x, e.y, e.z); e.m.rotation.y = e.yaw; e.sh.position.set(e.x, e.y + 0.03, e.z); e.sh.visible = e.state !== 'gone'; }
  // ---------- machine brains ----------
  const phaseLen = e => ({ melee: 0.45, charge: 0.6, ranged: 0.35, pulse: 0.5, boss: 0.7 })[KIND[e.type]] || 0.5;
  function stepFoe(e, dt) {
    if (e.boss) { stepBoss(e, dt); return; }
    const S = e.st, kind = KIND[e.type], dx = P.x - e.x, dz = P.z - e.z, dist = Math.hypot(dx, dz), ox = e.x, oz = e.z, far = dist > 60;
    e.m.visible = dist < 75; e.bar.visible = false; if (far && e.state !== 'free') { e.m.visible = dist < 75; return; }
    e.t += dt; e.flash = Math.max(0, (e.flash || 0) - dt);
    const face = (k = 6) => { const a = yawTo(dx, dz); e.yaw += Math.atan2(Math.sin(a - e.yaw), Math.cos(a - e.yaw)) * Math.min(1, dt * k); };
    // legal ground: inside its roam circle and never on the walkway
    const tryMove = (nx, nz) => { if (pathDist(lv, nx, nz) < e.rad + 0.2) return false; if (Math.hypot(nx - e.home[0], nz - e.home[1]) > e.roam && Math.hypot(nx - e.home[0], nz - e.home[1]) > Math.hypot(e.x - e.home[0], e.z - e.home[1])) return false; e.x = nx; e.z = nz; return true; };
    const walk = (tx, tz, sp) => { const ddx = tx - e.x, ddz = tz - e.z, d = Math.hypot(ddx, ddz); if (d < 0.05) return; const s = Math.min(d, sp * dt); if (!tryMove(e.x + ddx / d * s, e.z + ddz / d * s)) { tryMove(e.x + ddx / d * s, e.z) || tryMove(e.x, e.z + ddz / d * s); } };
    const see = !P.ko && St.state === 'run' && dist < (S.sight || 8) + (e.state === 'chase' ? 4 : 0);
    let mode = 'idle', p = 0;
    if (e.boss) { mode = 'idle'; if (dist < 20) face(1.5); }
    else if (e.state === 'down') mode = 'stun';
    else if (e.state === 'stun') { mode = 'stun'; if (Math.random() < dt * 4) burst(e.x, 1 + Math.random(), e.z, 1, 0x5fe3ff); if (e.t > 16 && !(St.un && St.un.e === e)) { e.state = 'idle'; e.hp = Math.round(e.max * 0.4); say3('REBOOTED', e.x, e.y + 2.4, e.z, '#ff6b5a'); } }
    else if (e.state === 'free') { mode = 'idle'; if (e.walkTo) { const ddx = e.walkTo[0] - e.x, ddz = e.walkTo[1] - e.z, d = Math.hypot(ddx, ddz); if (d > 0.5) { const s = Math.min(d, 1.3 * dt); const nx = e.x + ddx / d * s, nz = e.z + ddz / d * s; if (pathDist(lv, nx, nz) > e.rad) { e.x = nx; e.z = nz; } else e.walkTo = null; e.yaw = yawTo(ddx, ddz); } else e.walkTo = null; } }
    else {
      if (e.state === 'idle') { if (see) { e.state = 'chase'; e.t = 0; if (Math.random() < 0.5 && LINES[e.type]) say3(LINES[e.type].hacked.split('.')[0] + '.', e.x, e.y + 2.6 * e.size, e.z, '#ff6b5a'); } else { if (!e.wp || e.t > 4) { e.t = 0; const a = Math.random() * 6.283, r = Math.random() * e.roam * 0.6; e.wp = [e.home[0] + Math.cos(a) * r, e.home[1] + Math.sin(a) * r]; } walk(e.wp[0], e.wp[1], (S.walk || 1.4) * 0.5); const wx = e.wp[0] - e.x, wz = e.wp[1] - e.z; if (Math.hypot(wx, wz) > 0.3) { const a = yawTo(wx, wz); e.yaw += Math.atan2(Math.sin(a - e.yaw), Math.cos(a - e.yaw)) * Math.min(1, dt * 3); } } }
      else if (e.state === 'chase') { face(); e.cd -= dt; if (!see && e.t > 2) { e.state = 'idle'; e.t = 0; }
        const want = kind === 'melee' ? (S.reach || 1.8) + 0.2 : kind === 'ranged' ? (S.range || 8) * 0.75 : 6;
        if (dist > want) walk(P.x, P.z, S.walk || 1.4); else if (kind === 'ranged' && dist < want * 0.5) walk(e.x - dx, e.z - dz, (S.walk || 1.4) * 0.7);
        if (e.cd <= 0 && see) { const ready = kind === 'melee' ? dist < (S.reach || 1.8) + 0.9 : kind === 'ranged' ? dist < (S.range || 8) + 1 : kind === 'charge' ? dist < 11 && dist > 2.5 : false; if (ready) { e.state = 'tell'; e.t = 0; e.hitDone = false; e.dir = [dx / (dist || 1), dz / (dist || 1)]; } } }
      else if (e.state === 'tell') { p = e.t / (S.tell || 0.6); mode = 'tell'; if (kind !== 'charge') face(8); else { e.yaw = yawTo(e.dir[0], e.dir[1]); }
        if (kind === 'ranged') { e.tele = true; }
        if (e.t > (S.tell || 0.6)) { e.state = 'atk'; e.t = 0; e.tele = false; if (kind === 'ranged') { const mz = e.m.userData.muzzle || (e.m.userData.glows && e.m.userData.glows[0]); if (mz) mz.getWorldPosition(_v); else _v.set(e.x, e.y + 1.4 + e.hy, e.z); fireBolt(e, _v.clone()); burst(_v.x, _v.y, _v.z, 6, 0xffb347); } } }
      else if (e.state === 'atk') { const pl = phaseLen(e); p = e.t / pl; mode = 'atk';
        if (kind === 'melee' && !e.hitDone && e.t > pl * 0.4) { e.hitDone = true; const fx = e.x + Math.cos(e.yaw) * (S.reach || 1.8), fz = e.z - Math.sin(e.yaw) * (S.reach || 1.8); burst(fx, 0.15, fz, 10, 0xc8b89a); St.shake = Math.max(St.shake, 0.12); if (Math.hypot(P.x - fx, P.z - fz) < 1.5 && P.y < 1.6) hurtP(S.hit || 14, e.x, e.z); }
        if (kind === 'charge') { const s = (S.lunge || 8) * dt; const moved = tryMove(e.x + e.dir[0] * s, e.z + e.dir[1] * s); if (Math.random() < dt * 20) burst(e.x, 0.2, e.z, 1, 0xc8b89a); if (!e.hitDone && Math.hypot(P.x - e.x, P.z - e.z) < 1.4 * e.size && P.y < 1.4) { e.hitDone = true; hurtP(S.hit || 18, e.x, e.z); } if (!moved && e.t > 0.1) e.t = pl; }
        if (e.t > pl) { e.state = 'rest'; e.t = 0; } }
      else if (e.state === 'rest') { mode = 'rest'; if (e.t > (S.rest || 1.5)) { e.state = 'chase'; e.t = 0; e.cd = rr(0.6, 1.6); } }
      if (e.hp < e.max && dist < 16) { e.bar.visible = true; }
    }
    // separation
    for (const o of foes) { if (o === e || o.boss) continue; const sx = e.x - o.x, sz = e.z - o.z, sd = Math.hypot(sx, sz), m = e.rad + o.rad; if (sd < m && sd > 1e-3) { const k = (m - sd) * 0.5; const nx = e.x + sx / sd * k, nz = e.z + sz / sd * k; if (pathDist(lv, nx, nz) > e.rad) { e.x = nx; e.z = nz; } } }
    { const o = { x: e.x, z: e.z }; collide(o, e.rad, 0); e.x = o.x; e.z = o.z; }
    e.spd = damp(e.spd, Math.hypot(e.x - ox, e.z - oz) / Math.max(dt, 1e-4), 10, dt);
    const gy = groundAt(e.x, e.z, 0); e.y = gy;
    try { poseMachine(e.m, { mode, p, speed: e.spd, dt, t: St.t + e.m.userData.seed, hacked: e.hacked, aim: [P.x, P.y + 1.1, P.z] }); } catch (er) {}
    e.m.position.set(e.x, e.y + (mode === 'stun' ? Math.min(e.hy, 0.3) : e.hy), e.z); e.m.rotation.y = e.yaw; e.sh.position.set(e.x, e.y + 0.03, e.z);
    if (e.bar.visible) { e.bar.position.set(e.x, e.y + e.hy + 2.6 * e.size, e.z); e.bar.userData.fg.scale.x = 0.086 * Math.max(0, e.hp / e.max); }
  }
  // ---------- R-8 ----------
  function stepR8(dt) { const r = R8; if (!r || r.away) return; r.cd -= dt; r.glitch -= dt;
    let tx, tz; if (r.mode === 'fix') { tx = liftIt.x + 1.5; tz = liftIt.z; r.fixT += dt; if (Math.random() < dt * 14) burst(liftIt.x + rr(-1, 1), rr(1, 4), liftIt.z + rr(-1, 1), 2, 0xffd23a);
        if (r.fixT > 3) { r.mode = 'follow'; St.lift = 'fixed'; banner('LIFT REPAIRED', 2.2); St.quest = questText(); dialog([['R-8', R8_LINES.fixed]]); } }
    else { const crx = Math.cos(CAM.yaw), crz = -Math.sin(CAM.yaw), cfx = -Math.sin(CAM.yaw), cfz = -Math.cos(CAM.yaw); tx = P.x + crx * 2.2 + cfx * 0.6; tz = P.z + crz * 2.2 + cfz * 0.6; } /* s365e: beside you on the camera's right, a touch ahead */
    r.x = damp(r.x, tx, 2.5, dt); r.z = damp(r.z, tz, 2.5, dt); r.y = damp(r.y, groundAt(r.x, r.z, 0) + 1.6 + Math.sin(St.t * 2) * 0.15, 3, dt);
    // fights beside you: zaps the nearest hacked machine in reach
    const e = r.mode === 'follow' && St.state === 'run' ? (() => { let b = null, bd = 9; for (const q of foes) { if (!canHit(q)) continue; const d = Math.hypot(q.x - r.x, q.z - r.z) - (q.boss ? q.rad : 0); if (d < bd) { bd = d; b = q; } } return b; })() : null;
    let ax = P.x, az = P.z; if (e) { ax = e.x; az = e.z; if (r.cd <= 0) { r.cd = 2.4; const from = new THREE.Vector3(r.x, r.y + 0.6, r.z), to = new THREE.Vector3(e.x, e.y + (e.aimY || 1 + e.hy * 0.6), e.z); G.bolt && zap(from, to); AMB.sfx('zap'); setTimeout(() => hurtFoe(e, 5, r.x, r.z), 120); } }
    r.yaw = damp(r.yaw, yawTo(ax - r.x, az - r.z), 4, dt);
    let gl = false; if (r.glitch <= 0 && r.mode === 'follow' && St.state === 'run' && !St.dialog) { r.glitch = rr(10, 16); r.gT = 0.5; say3(pick(R8_LINES.glitch), r.x, r.y + 1.6, r.z, '#5fe3ff'); } if (r.gT > 0) { r.gT -= dt; gl = true; }
    try { poseMachine(r.m, { mode: 'idle', p: 0, speed: 0.4, dt, t: St.t, hacked: gl, aim: [ax, 1.1, az] }); } catch (er) {}
    r.m.position.set(r.x, r.y, r.z); r.m.rotation.y = r.yaw;
    { const cx = camera.position.x, cz = camera.position.z, ax2 = P.x - cx, az2 = P.z - cz, L2 = ax2 * ax2 + az2 * az2 || 1, t2 = ((r.x - cx) * ax2 + (r.z - cz) * az2) / L2, px = cx + ax2 * t2, pz = cz + az2 * t2; r.m.visible = !(t2 > 0.05 && t2 < 0.95 && Math.hypot(r.x - px, r.z - pz) < 1.1); }
    r.sh.position.set(r.x, groundAt(r.x, r.z, 0) + 0.03, r.z); }
  const zapMat = new THREE.MeshBasicMaterial({ color: 0x5fe3ff, transparent: true, opacity: 0.9, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }), zaps = [];
  function zap(from, to) { const L = from.distanceTo(to), m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, L), zapMat); m.position.copy(from).lerp(to, 0.5); m.lookAt(to); scene.add(m); zaps.push({ m, t: 0.12 }); burst(to.x, to.y, to.z, 5, 0x5fe3ff); }
  function r8Hack() { if (St.r8hacked || save.flag('oreR8Free') || !R8) return; St.r8hacked = true; const h = items('r8hack')[0];
    dialog([['R-8', 'Fox\u2026 the voice is too loud\u2026'], ['R-8 · HACKED', LINES.r8.hacked]], () => { R8.away = true; R8.m.visible = false; R8.sh.visible = false; let sx = h.x, sz = h.z; for (let k = 0; k < 40 && pathDist(lv, sx, sz) < 2.5; k++) { const a = k * 0.9; sx = h.x + Math.cos(a) * (3 + k * 0.3); sz = h.z + Math.sin(a) * (3 + k * 0.3); } burst(R8.x, R8.y, R8.z, 20, 0x1a3fb8); const e = spawn('r8', sx, sz, { home: [sx, sz], roam: 14 }); e.r8 = true; e.state = 'chase'; e.size = 1.04; e.m.scale.setScalar((mach.look.r8.size || 1.3) * 0.8); St.quest = questText(); banner('R-8 IS HACKED · STUN HIM, THEN UNHACK HIM', 3); emit(); });
  }

  // ---------- input ----------
  const onKD = e => { if (/INPUT|TEXTAREA/.test((e.target && e.target.tagName) || '')) return; keys.add(e.code); if (e.repeat) return;
    if (e.code === 'Space') { e.preventDefault(); api.jump(); } else if (e.code === 'Digit1' || e.code === 'KeyJ') api.melee(); else if (e.code === 'Digit2' || e.code === 'KeyK') api.range(); else if (e.code === 'KeyE' || e.code === 'Enter') api.talk(); };
  const onKU = e => { keys.delete(e.code); if (e.code === 'Digit1' || e.code === 'KeyJ') api.meleeUp(); if (e.code === 'Digit2' || e.code === 'KeyK') api.rangeUp(); };
  const onBlur = () => { keys.clear(); P.rHeld = false; };
  addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);
  { const el = renderer.domElement, ptr = new Map(); let pd = null;
    el.addEventListener('pointerdown', e => { ptr.set(e.pointerId, [e.clientX, e.clientY]); if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pd = { d0: Math.hypot(a[0] - b[0], a[1] - b[1]), z0: CAM.zoom }; } else CAM.drag = { x: e.clientX, y: e.clientY, yaw: CAM.yaw, pitch: CAM.pitch }; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', e => { if (!ptr.has(e.pointerId)) return; ptr.set(e.pointerId, [e.clientX, e.clientY]); if (ptr.size >= 2 && pd) { const [a, b] = [...ptr.values()]; CAM.zoom = clamp(pd.z0 * pd.d0 / Math.max(1, Math.hypot(a[0] - b[0], a[1] - b[1])), 0.6, 1.8); return; } if (CAM.drag) { CAM.yaw = CAM.drag.yaw - (e.clientX - CAM.drag.x) * 0.008; CAM.pitch = clamp(CAM.drag.pitch + (e.clientY - CAM.drag.y) * 0.005, 0.15, 1.2); } });
    const up = e => { ptr.delete(e.pointerId); if (ptr.size < 2) pd = null; if (!ptr.size) CAM.drag = null; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', e => { e.preventDefault(); CAM.zoom = clamp(CAM.zoom * Math.exp(e.deltaY * 0.0012), 0.6, 1.8); }, { passive: false }); }

  // ---------- frame ----------
  let last = performance.now(), raf = 0, dead = false, emitT = 0;
  // s367 MUSIC: battle music (engine/battle-music.js) when hacked machines come for you or the boss fight is on; the level's ambience bed under it
  const BGM = battleMusic(), AMB = oreAmbient(); let musT = 0, calmT = 0;
  function musicTick(dt) { musT -= dt; if (musT > 0) return; musT = 0.25; const live = St.state === 'run'; if (live) AMB.start(); else AMB.stop();
    const B = St.boss, boss = live && B && (B.phase === 'relay' || B.phase === 'rig' || B.phase === 'cut'); let n = 0;
    if (live && !boss) for (const e of foes) if (e.hacked && !['idle', 'down', 'stun', 'free', 'dead', 'gone'].includes(e.state) && Math.hypot(e.x - P.x, e.z - P.z) < 18) n++;
    if (boss || n > 0) { calmT = 0; try { BGM.song('battle'); } catch (e) {} BGM.start(); BGM.intensity(boss ? (B.phase === 'rig' ? 1 : 0.8) : Math.min(1, 0.25 + n * 0.2)); } else if (BGM.on && (calmT += 0.25) > 4) BGM.stop(1.5);
    AMB.duck(BGM.on); }
  function frame(now) { if (dead) return; raf = requestAnimationFrame(frame); let dt = Math.min(0.05, (now - last) / 1000); last = now; if (St.sleep) { BGM.stop(0.4); AMB.stop(); return; } if (St.paused) dt = 0;
    musicTick(dt);
    St.t += dt; if (St.fadeTo != null) { St.fade = damp(St.fade, St.fadeTo, 5, dt); if (Math.abs(St.fade - St.fadeTo) < 0.01) { St.fade = St.fadeTo; if (St.fadeTo === 1 && St.fadeCb) { const cb = St.fadeCb; St.fadeCb = null; cb(); } else St.fadeTo = null; } }
    const run = St.state === 'run' && !St.dialog && dt > 0;
    for (const f of SC.anim) f(St.t);
    // player
    P.inv = Math.max(0, P.inv - dt); P.rCd -= dt; if (P.ko > 0) { P.ko -= dt; if (P.ko <= 0) { P.hp = 100; Object.assign(P, { x: liftIt.x + 0.5, z: liftIt.z, y: deckY + 0.2, vx: 0, vz: 0, vy: 0 }); St.un = null; clearPulses(); for (const e of foes) if (e.state === 'chase' || e.state === 'tell' || e.state === 'atk') { e.state = 'idle'; e.t = 0; } emit(); } }
    const kx = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0), ky = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
    let ix = clamp(stick.x + kx, -1, 1), iy = clamp(stick.y + ky, -1, 1); if (!run || P.ko > 0) ix = iy = 0;
    const fx = -Math.sin(CAM.yaw), fz = -Math.cos(CAM.yaw), rx = -fz, rz = fx, im = Math.min(1, Math.hypot(ix, iy)), mx = rx * ix + fx * iy, mz = rz * ix + fz * iy, ml = Math.hypot(mx, mz) || 1;
    const g0 = groundAt(P.x, P.z, P.y + 0.3), onGround = P.y <= g0 + 0.05, inWater = !onDeck(P.x, P.z) && items('water').some(w => inRect(w, P.x, P.z)) && P.y < 0.5, onIce = items('ice').some(w => inRect(w, P.x, P.z)) && onGround && !onDeck(P.x, P.z);
    const sp = 6.2 * (inWater ? 0.55 : 1) * (P.mHold && P.mHold.power ? 0.5 : 1), tvx = mx / ml * sp * im, tvz = mz / ml * sp * im, trac = onIce ? 1.4 : onGround ? 14 : 4;
    P.vx = damp(P.vx, tvx, trac, dt); P.vz = damp(P.vz, tvz, trac, dt);
    // conveyors push you along the belt when you stand on them
    if (P.y > 0.85) for (const b of SOL.belts) { const u = (P.x - b.x) * b.c + (P.z - b.z) * b.s, v = -(P.x - b.x) * b.s + (P.z - b.z) * b.c; if (Math.abs(u) < b.len / 2 && Math.abs(v) < 1.2) { P.x += b.c * 2.4 * dt; P.z += b.s * 2.4 * dt; } }
    if (im > 0.1) P.yaw = Math.atan2(tvx, tvz);
    P.x += P.vx * dt; P.z += P.vz * dt; collide(P, 0.45, P.y);
    for (const e of foes) { if (!e.boss || e.state === 'gone' || e.state === 'dead') continue; const qx = P.x - e.x, qz = P.z - e.z, qd = Math.hypot(qx, qz), m = e.rad + 0.45; if (qd < m && qd > 1e-4) { P.x = e.x + qx / qd * m; P.z = e.z + qz / qd * m; } }
    P.vy -= 24 * dt; P.y += P.vy * dt; const g1 = groundAt(P.x, P.z, P.y + 0.45); if (P.y <= g1) { if (g1 - P.y < 0.5 || P.vy <= 0) { P.y = g1; P.vy = Math.max(0, P.vy); P.jumps = 0; } } P.air = P.y > g1 + 0.05;
    if (P.mHold) { P.mHold.t += dt; if (!P.mHold.power && P.mHold.t > 0.3) { P.mHold.power = G.charge(); } }
    if (P.rHeld && P.rCd <= 0 && run) shoot();
    fox.position.set(P.x, P.y, P.z); fox.rotation.y = P.yaw; kit.animFox(fox, dt, P.air ? 0 : Math.hypot(P.vx, P.vz), P.air); foxShadow.position.set(P.x, g1 + 0.03, P.z); fox.visible = P.ko <= 0 || Math.sin(St.t * 20) > 0;
    head.position.set(P.x, P.y + 4.2, P.z);
    // hazards
    if (run && P.ko <= 0) {
      for (const c of items('cable')) if (Math.hypot(P.x - c.x, P.z - c.z) < c.r && P.y < 1.2 && !onDeck(P.x, P.z)) { if (P.inv <= 0) { hurtP(10, c.x, c.z); banner('LIVE CABLE!', 1.4); burst(P.x, 0.8, P.z, 14, 0x7cff9b); } }
      for (const v of items('vent')) { const ph = rng(hash(v.id))() * 4; if ((St.t + ph) % 4 < 1.4 && Math.hypot(P.x - v.x, P.z - v.z) < 1.4 && P.y < 3) { P.steamCd -= dt; if (P.steamCd <= 0) { P.steamCd = 0.5; hurtP(5, v.x, v.z); P.vy = Math.max(P.vy, 5); } } }
      for (const r of items('rubble')) { r._cd = (r._cd ?? rr(1, 3)) - dt; if (r._cd <= 0) { r._cd = rr(2.6, 4); const inside = Math.hypot(P.x - r.x, P.z - r.z) < r.r; const a = Math.random() * 6.283, d = Math.random() * r.r * 0.8, x = inside ? P.x + rr(-0.5, 0.5) : r.x + Math.cos(a) * d, z = inside ? P.z + rr(-0.5, 0.5) : r.z + Math.sin(a) * d; const m = M(new THREE.DodecahedronGeometry(0.8, 0), toon('#6a6258'), x, 22, z, null, 0.05, 0.8); falls.push({ m, sh: blob(2.2), x, z, t: 0 }); } } }
    for (let i = falls.length - 1; i >= 0; i--) { const f = falls[i]; f.t += dt; const k = Math.min(1, f.t / 1.0), y = 22 * (1 - k * k); f.m.position.y = Math.max(0.6, y); f.m.rotation.x += dt * 4; f.sh.position.set(f.x, 0.05, f.z); f.sh.scale.setScalar(0.4 + k * 0.9); f.sh.material = shadowMat;
      if (k >= 1 && !f.hit) { f.hit = true; burst(f.x, 0.4, f.z, 12, 0xc8b89a); St.shake = Math.max(St.shake, 0.15); if (Math.hypot(P.x - f.x, P.z - f.z) < 1.4 && P.y < 1.5) hurtP(12, f.x, f.z); }
      if (f.t > 2.2) { scene.remove(f.m); scene.remove(f.sh); falls.splice(i, 1); } }
    // machines + bolts
    for (const e of foes.slice()) stepFoe(e, run ? dt : 0);
    for (let i = shots.length - 1; i >= 0; i--) { const q = shots[i]; q.life -= dt; if (run) { q.x += q.v[0] * dt; q.y += q.v[1] * dt; q.z += q.v[2] * dt; } q.m.position.set(q.x, q.y, q.z); q.m.lookAt(q.x + q.v[0], q.y + q.v[1], q.z + q.v[2]);
      const hitP = Math.hypot(q.x - P.x, q.z - P.z) < 0.6 && q.y > P.y && q.y < P.y + 2; if (hitP) hurtP(q.dmg, q.x - q.v[0], q.z - q.v[2]);
      if (hitP || q.life <= 0 || q.y < 0 || SOL.circles.some(([cx, cz, cr]) => Math.hypot(q.x - cx, q.z - cz) < cr)) { if (!hitP) burst(q.x, Math.max(0.2, q.y), q.z, 4, 0xff6b5a); scene.remove(q.m); shots.splice(i, 1); } }
    for (let i = pulses.length - 1; i >= 0; i--) { const q = pulses[i]; if (run) q.r += q.sp * dt; q.m.scale.set(q.r, 1, q.r); q.m.material.opacity = 0.75 * Math.min(1, (q.max - q.r) / 3);
      const d = Math.hypot(P.x - q.x, P.z - q.z), air = P.y - groundAt(P.x, P.z, 0) > 0.45; if (run && P.ko <= 0 && Math.abs(d - q.r) < 0.6) { if (air) { if (!q.jumped && !q.hit) { q.jumped = true; say3('NICE JUMP!', P.x, P.y + 2.4, P.z, '#7cff9b'); } } else if (!q.hit && !q.jumped) { q.hit = true; hurtP(q.dmg, q.x, q.z); } }
      if (q.r >= q.max) { scene.remove(q.m); q.m.material.dispose(); pulses.splice(i, 1); } }
    if (St.boss && St.boss.shield && St.boss.rig) { const B = St.boss, rg = B.rig, rl = B.relay; B.shield.position.set(rg.x, rg.y + 2.2 * rg.size, rg.z); B.shield.material.opacity = 0.14 + 0.08 * Math.sin(St.t * 6) + (Math.random() < 0.04 ? 0.15 : 0);
      if (rl) { const ax = rl.x, ay = rl.y + 4.6, az = rl.z, bx = rg.x, by = rg.y + 3, bz = rg.z, Lb = Math.hypot(bx - ax, by - ay, bz - az) || 1; B.beam.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); B.beam.scale.set(1 + Math.random() * 0.6, 1 + Math.random() * 0.6, Lb); B.beam.lookAt(bx, by, bz); } }
    if (run && li === 2 && St.boss && St.boss.phase === 'wait' && arenaIt && Math.hypot(P.x - arenaIt.x, P.z - arenaIt.z) < arenaIt.r + 1) { const B = St.boss; B.phase = 'intro';
      if (B.relay) dialog(BOSS_LINES.intro, () => { B.phase = 'relay'; banner('BOSS · WRECK THE SIGNAL RELAY', 2.8); ['JUMP THE RED RINGS', 'THE RIG IS SHIELDED · DODGE HIM'].forEach((t, k) => setTimeout(() => { if (B.phase === 'relay') banner(t, 2.4); }, 3000 + k * 2700)); emit(); });
      else dialog(BOSS_LINES.introRig, () => { B.phase = 'rig'; banner('BOSS · UNHACK THE DRILL RIG', 2.8); emit(); }); }
    for (let i = zaps.length - 1; i >= 0; i--) { zaps[i].t -= dt; if (zaps[i].t <= 0) { scene.remove(zaps[i].m); zaps[i].m.geometry.dispose(); zaps.splice(i, 1); } }
    stepR8(run ? dt : 0);
    // unhack in progress: stay close while the ring fills
    if (St.un) { const u = St.un, e = u.e, d = Math.hypot(e.x - P.x, e.z - P.z); if (d > (e.boss ? e.rad + 3.2 : 3.6) || P.ko > 0 || e.state !== 'stun') { St.un = null; if (unRing) { scene.remove(unRing); unRing = null; } banner('UNHACK BROKEN · GET CLOSE AGAIN', 1.6); }
      else { if (run) u.t += dt; drawUn(e, u.t / u.need); if (Math.random() < dt * 10) burst(e.x + rr(-0.5, 0.5), 1 + Math.random(), e.z + rr(-0.5, 0.5), 1, 0x5fe3ff); if (u.t >= u.need) { St.un = null; scene.remove(unRing); unRing = null; freeFoe(e); } } }
    // part pickup + story triggers
    if (partDrop) { partDrop.m.rotation.y += dt * 2; partDrop.m.position.y = 1.2 + Math.sin(St.t * 3) * 0.2; if (run && Math.hypot(P.x - partDrop.x, P.z - partDrop.z) < 1.5) pickPart(); }
    if (run && li === 1 && !save.flag('oreR8Free') && !St.r8hacked) { const h = items('r8hack')[0]; if (h && Math.hypot(P.x - h.x, P.z - h.z) < 9) r8Hack(); }
    // prompt (ACTIONS / E)
    const nearLift = Math.hypot(P.x - liftIt.x, P.z - liftIt.z) < 3.4, uh = !St.un && unhackable();
    St.prompt = St.state !== 'run' || St.dialog ? null : uh ? 'UNHACK ' + MNAME[uh.type] : nearLift && li === 0 && (St.lift === 'fixed' || !save.flag(PART_FLAG[0])) ? 'THE LIFT · DOWN OR OUT' : nearLift && save.flag(PART_FLAG[li]) && li < 2 ? (St.lift === 'fixed' ? 'RIDE THE LIFT DOWN' : R8 && R8.mode === 'fix' ? null : 'ASK R-8 TO FIX THE LIFT') : nearLift && li > 0 ? 'RIDE THE LIFT UP' : null;
    // camera: behind the fox, drags to orbit, eases round behind you as you run
    if (im > 0.2 && !CAM.drag) { const want = P.yaw + Math.PI; CAM.yaw += Math.atan2(Math.sin(want - CAM.yaw), Math.cos(want - CAM.yaw)) * Math.min(1, dt * 0.6 * im); }
    const port = H() > W(), dist = CAM.dist * CAM.zoom * (port ? 1.25 : 1), cy = P.y + 1.2, sh = St.shake > 0 ? (St.shake -= dt, St.shake * 0.4) : 0;
    camera.position.set(P.x + Math.sin(CAM.yaw) * Math.cos(CAM.pitch) * dist + rr(-sh, sh), cy + Math.sin(CAM.pitch) * dist + rr(-sh, sh), P.z + Math.cos(CAM.yaw) * Math.cos(CAM.pitch) * dist);
    camera.position.x = clamp(camera.position.x, -D.hw + 0.5, D.hw - 0.5); camera.position.z = clamp(camera.position.z, -D.hd + 0.5, D.hd - 0.5); camera.fov = port ? 62 : 55; camera.updateProjectionMatrix(); camera.lookAt(P.x, cy, P.z);
    // floaters + sparks
    for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i]; f.t += dt || 0.016; f.s.position.y += (dt || 0.016) * 0.9; f.s.material.opacity = 1 - Math.max(0, (f.t - f.life * 0.6) / (f.life * 0.4)); if (f.t > f.life) { scene.remove(f.s); f.s.material.map.dispose(); f.s.material.dispose(); floaters.splice(i, 1); } }
    for (const s of sparks) { if (!s.on) continue; s.life -= dt; s.vy -= 14 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; if (s.y < 0.05) { s.y = 0.05; s.vy *= -0.3; } s.m.position.set(s.x, s.y, s.z); if (s.life <= 0) { s.on = false; s.m.visible = false; } }
    if (St.bannerT > 0) { St.bannerT -= dt; if (St.bannerT <= 0) St.banner = ''; } if (St.voice) { St.voice.t -= dt; if (St.voice.t <= 0) St.voice = null; }
    { const lg = SC.root.userData.lift; if (lg) lg.visible = Math.hypot(camera.position.x - liftIt.x, camera.position.z - liftIt.z) > 7 && Math.hypot(P.x - liftIt.x, P.z - liftIt.z) > 5.5 || camera.position.y > 7; }
    renderer.render(scene, camera);
    emitT -= dt || 0.016; if (emitT <= 0) { emitT = 0.1; emit(); } }
  function emit() { const t = tool();
    onState({ state: St.state, hp: P.hp, en: P.en, ko: P.ko > 0, level: li, levelName: D ? D.name : '', place: 'Deep Space Fox · Ore Shaft · ' + (D ? D.short : ''), quest: { text: questText() }, prompt: St.prompt, dialog: St.dialog, banner: St.banner, fade: St.fade,
      tool: t ? TOOL[t - 1].name : '', parts: t, freed: St.lvFreed, total: St.lvTotal, un: St.un ? Math.min(1, St.un.t / St.un.need) : null, unName: St.un ? MNAME[St.un.e.type] : '', voice: St.voice ? { name: St.voice.name, text: St.voice.text } : null, r8hacked: St.r8hacked, gold: save.data.gold, boss: bossHud(), win: !!St.win && !St.dialog }); }
  function bossHud() { const B = St.boss; if (!B || (B.phase !== 'relay' && B.phase !== 'rig' && B.phase !== 'cut')) return null; const e = B.phase === 'rig' ? B.rig : B.relay; if (!e) return null;
    const relay = e.type === 'relay', stun = e.state === 'stun' || e.state === 'down';
    return { name: relay ? 'SIGNAL RELAY' : 'DRILL RIG', k: Math.max(0, e.hp / e.max), col: relay ? '#ec3013' : stun ? '#5fe3ff' : '#f2c230', sub: relay ? (e.state === 'dead' || e.state === 'gone' ? 'WRECKED' : 'WRECK IT · JUMP THE RINGS') : stun ? (tool() ? 'STUNNED · STAND CLOSE + E' : 'POWERED DOWN') : e.state === 'rest' ? 'OPEN · HIT THE CORE' : 'ARMOURED · WAIT FOR THE DRILL TO STICK', phase: relay ? '1 / 2' : '2 / 2' }; }
  function goLevel(i) { AMB.sfx('lift'); St.fadeTo = 1; St.fadeCb = () => { loadLevel(i); }; }
  function climbOut() { banner('CLIMBING OUT…', 1.6); try { sessionStorage.setItem('dsf.arrive', 'engineHatch'); } catch (e) {} save.where('dsf', 'dsfEngineering'); St.fadeTo = 1; St.fadeCb = () => { St.sleep = true; onExit(); }; }
  function choice(name, role, opts) { St.dialog = { name, role, text: null, choices: opts.map(o => ({ text: o[0], bye: !!o[2] })) }; St.choiceActs = opts.map(o => o[1]); emit(); }
  function liftMenu() { const fixed = St.lift === 'fixed' && save.flag(PART_FLAG[0]);
    choice('THE LIFT', 'ROBOT WORKS · TOP OF THE SHAFT', [...(fixed ? [['RIDE THE LIFT DOWN', () => { banner('GOING DOWN…', 1.6); goLevel(1); }]] : []), ['CLIMB OUT · BACK TO ENGINEERING', climbOut], ['STAY HERE', null, true]]); }

  const api = {
    start(tut) { if (St.state !== 'ready') return; St.state = 'run'; if (tut) ['FOLLOW THE LAMPS · MACHINES STAY OFF THE WALKWAY', '1 · SWORD (HOLD = POWER SWING) · 2 · LASER', 'HIT A MACHINE WHILE IT RESTS = OPEN!', 'AT 0 HP THEY ARE STUNNED, NEVER WRECKED', 'FIND THE TOUGH GUARD · IT CARRIES A PART', 'STUNNED + CLOSE + E = UNHACK · STAY NEAR', 'LIFT BROKEN? E · R-8 FIXES IT'].forEach((t, i) => setTimeout(() => banner(t, 2.6), 3200 + i * 2900)); St.fadeTo = 0; banner(D.name, 2.8); if (li === 0) dialog(R8_LINES.start); else if (R8_LINES.arrive[li].length) dialog(R8_LINES.arrive[li]); emit(); },
    melee() { if (St.state !== 'run' || P.ko > 0 || St.dialog) return; if (!P.mHold) P.mHold = { t: 0 }; },
    meleeUp() { const h = P.mHold; if (!h) return; P.mHold = null; if (h.power) { const R = G.release(); if (R) { doHit({ ...R, cone: -1.1, dur: 0.3 }); say3(R.c > 0.95 ? 'FULL POWER!' : 'POWER SWING', P.x, P.y + 2.4, P.z, '#9ff3ff'); } return; } const mv = G.strike(m => doHit(m)); if (mv) doHit(mv); },
    range() { if (St.state !== 'run' || P.ko > 0 || St.dialog) return; P.rHeld = true; if (P.rCd <= 0) shoot(); }, rangeUp() { P.rHeld = false; },
    jump() { if (St.state !== 'run' || P.ko > 0 || St.dialog) return; const g = groundAt(P.x, P.z, P.y + 0.3); if (P.y <= g + 0.08) { P.vy = 8.6; P.jumps = 1; } else if (P.jumps < 2) { P.vy = 7.4; P.jumps = 2; } }, jumpUp() { if (P.vy > 3) P.vy *= 0.6; },
    talk() { if (St.dialog) { if (!St.dialog.choices) nextLine(); return; } if (St.state !== 'run' || P.ko > 0) return; const uh = !St.un && unhackable(); if (uh) { startUnhack(uh); return; }
      const nearLift = Math.hypot(P.x - liftIt.x, P.z - liftIt.z) < 3.4;
      if (nearLift && li === 0 && (St.lift === 'fixed' || !save.flag(PART_FLAG[0]))) { liftMenu(); return; }
      if (nearLift && save.flag(PART_FLAG[li]) && li < 2) { if (St.lift === 'fixed') { banner('GOING DOWN…', 1.6); goLevel(li + 1); } else if (R8 && R8.mode !== 'fix') dialog(R8_LINES.lift, () => { R8.mode = 'fix'; R8.fixT = 0; AMB.sfx('fix'); }); return; }
      if (nearLift && li > 0) { banner('GOING UP…', 1.6); goLevel(li - 1); } },
    closeWin() { St.win = false; emit(); },
    choose(i) { const d = St.dialog; if (d && d.choices) { const f = St.choiceActs && St.choiceActs[i]; St.dialog = null; St.choiceActs = null; emit(); if (f) f(); return; } nextLine(); }, closeDialog() { if (St.dialog) { if (St.dialog.choices) { St.dialog = null; St.choiceActs = null; emit(); return; } St.dq = []; nextLine(); } }, nextLine() { nextLine(); }, clearToast() {}, closeWheel() {}, skipTime() {},
    useItem() { const uh = !St.un && unhackable(); if (uh) startUnhack(uh); },
    setPaused(p) { St.paused = !!p; }, setHudPad() {}, setStick(x, y) { stick.x = x || 0; stick.y = y || 0; },
    eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy(dx, dy) { CAM.yaw -= (dx || 0) * 0.008; CAM.pitch = clamp(CAM.pitch + (dy || 0) * 0.005, 0.15, 1.2); }, lookRelease() {}, zoomBy(f) { CAM.zoom = clamp(CAM.zoom * f, 0.6, 1.8); },
    getCam() { return { dist: CAM.dist * CAM.zoom, pitch: CAM.pitch }; }, setCam() {}, mapData() { return { p: [P.x, P.z, P.yaw], indoor: true, b: [], f: [], e: [], q: null }; }, setMinimap() {}, toggleSound() {}, cycleWeather() {},
    slowToggle() { return false; }, superTap() { return false; }, actionsTap() { api.talk(); }, actionsOpen() { api.talk(); },
    goLevel(i) { if (St.state === 'ready') { loadLevel(i); return; } goLevel(i); },
    resetRun() { for (const f of [...PART_FLAG, 'oreR8Free', 'oreRelayDown', 'oreBossDone']) save.setFlag(f, false); St.win = false; loadLevel(0); },
    resetBoss() { save.setFlag('oreRelayDown', false); save.setFlag('oreBossDone', false); St.win = false; loadLevel(2); },
    _dbg: { P, St, get foes() { return foes; }, get R8() { return R8; }, scene, camera, tp(x, z) { Object.assign(P, { x, z, y: 2, vx: 0, vz: 0 }); }, stunAll() { for (const e of foes) if (e.hacked && !e.boss) stunFoe(e); }, give(n) { for (let i = 0; i < n; i++) save.setFlag(PART_FLAG[i]); }, get boss() { return St.boss; }, pulses: () => pulses.length, arena() { if (arenaIt) Object.assign(P, { x: arenaIt.x - arenaIt.r + 2, z: arenaIt.z, y: 2, vx: 0, vz: 0 }); }, hurtBoss(n) { const B = St.boss, e = B && (B.phase === 'rig' ? B.rig : B.relay); if (e && canHit(e)) { e.hp = Math.min(e.hp, n); hurtFoe(e, 1, P.x, P.z); } } },
    destroy() { dead = true; BGM.stop(0.2); AMB.stop(0.2); cancelAnimationFrame(raf); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); ro.disconnect(); renderer.dispose(); renderer.domElement.remove(); },
  };
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); }); ro.observe(container);
  loadLevel(li); St.fade = 0; St.fadeTo = null; raf = requestAnimationFrame(frame); emit();
  return api;
}
