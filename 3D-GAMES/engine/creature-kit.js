import { faceKit } from './face-kit.js';
import { polishKit } from './polish-kit.js';
// 8 GATES — CREATURE KIT. creatureKit({ THREE, toon, M }) → { build(name, opts), animate(group, state, t, dt), families }.
// Bodies from primitives + toon materials + ink outlines (same look as fox-kit). Each creature: userData.joints (named
// pivots), userData.weak (its weak-point mesh; material.emissive can be driven gold), userData.family / variant / calls.
// States: idle, move (opts.speed), windup, attack, recover, hurt, stagger, armorBreak, die. Durations in STATE_DUR.
export const STATE_DUR = { windup: 0.6, attack: 0.4, recover: 1.0, hurt: 0.3, stagger: 1.2, armorBreak: 0.8, die: 1.6 };
const CRAB = {
  'Crystal Crab': { shell: '#6b3fa0', belly: '#d9c6f2', crys: '#d68cff', glow: '#f5e6ff', scale: 1 },   // Gaya = shades of purple
  'Woken Crab': { shell: '#4b2f9e', belly: '#b9b0f5', crys: '#8f7bff', glow: '#e6e0ff', scale: 1.06, woken: true },
  'Sump Crab': { shell: '#56563a', belly: '#8f8964', crys: '#4fb3a0', glow: '#c4f5ea', scale: 0.94, sump: true },
};
// GAYA rule: shades of purple. Colour and size step up through the list.
const GOLEM = {
  'Crystal Golem': { body: '#7a52b3', dark: '#4d2f7a', crys: '#d68cff', glow: '#f5e6ff', scale: 1.0 },
  'Bank Golem': { body: '#6d4aa3', dark: '#45296f', crys: '#c79bff', glow: '#efe2ff', scale: 1.08, moss: true },
  'Road Warden': { body: '#5f3d93', dark: '#3b2266', crys: '#b67bff', glow: '#eadbff', scale: 1.2, crown: 3, band: true },
  'Deep Warden': { body: '#46297a', dark: '#2a1650', crys: '#9b6bff', glow: '#e1d4ff', scale: 1.33, crown: 5, arms: true },
  'Vein Warden': { body: '#331d5e', dark: '#1d0f3a', crys: '#ff7bd5', glow: '#ffe1f4', scale: 1.48, crown: 5, arms: true, veins: true },
};
const SHARD = {
  'Shardthrower': { body: '#8a5cc7', dark: '#56368a', crys: '#e09bff', glow: '#f8ecff', scale: 1.0 },
  'Blue Shardthrower': { body: '#5a4bc4', dark: '#352a80', crys: '#8fa8ff', glow: '#e6ecff', scale: 1.08, turret: true },
};
const RAINBOW = ['#ec3013', '#ff8a1a', '#ffd23a', '#5cd65c', '#38bdf8', '#6b5cff', '#d64fd6'];
// GATE GUARDS: one robot family, three bodies, skinned per world
const BOT_SKIN = {
  sink: { plate: '#4f7f7a', trim: '#a8603a', dark: '#24363a', eye: '#5fe3ff' }, furnace: { plate: '#5a4a44', trim: '#ff8a1a', dark: '#231b18', eye: '#ffb020', glow: true },
  blackout: { plate: '#25252b', trim: '#3a3a44', dark: '#0f0f13', eye: '#ec3013' }, hive: { plate: '#e0b43a', trim: '#1a1a1e', dark: '#2a2420', eye: '#ffd23a', stripes: true },
  gate: { plate: '#e8e4dc', trim: '#c9a24a', dark: '#4a4640', eye: '#5fe3ff' }, fort: { plate: '#6b7348', trim: '#3f4530', dark: '#2a2e20', eye: '#ffd23a' },
  frame: { plate: '#8a8f96', trim: '#5b6168', dark: '#33373c', eye: '#ffffff', bare: true }, grey: { plate: '#9aa0a8', trim: '#6b7178', dark: '#3a3e44', eye: '#9fd8ff', bare: true },
  plated: { plate: '#7d8590', trim: '#4b5563', dark: '#2a2e34', eye: '#ffd23a' }, factor: { plate: '#1a1a1e', trim: '#d4a83a', dark: '#0c0c0e', eye: '#ffd23a', crown: true },
};
const BOTS = {
  'Sink Sentry': ['sentry', 'sink'], 'Sink Charger': ['charger', 'sink'], 'Sink Warden': ['warden', 'sink'],
  'Furnace Sentry': ['sentry', 'furnace'], 'Furnace Charger': ['charger', 'furnace'], 'Furnace Warden': ['warden', 'furnace'],
  'Blackout Sentry': ['sentry', 'blackout'], 'Blackout Charger': ['charger', 'blackout'], 'Blackout Warden': ['warden', 'blackout'],
  'Hive Lancer': ['sentry', 'hive'], 'Hive Drone': ['charger', 'hive'], 'Hive Warden': ['warden', 'hive'],
  'Gate Lance': ['sentry', 'gate'], 'Gate Crawler': ['charger', 'gate'], 'Gate Warden': ['warden', 'gate'],
  'Fort Sentry': ['sentry', 'fort'], 'Fort Guard': ['charger', 'fort'], 'Sentry Frame': ['sentry', 'frame'], 'Warden Frame': ['warden', 'frame'],
  'Grey Frame': ['sentry', 'grey'], 'Plated Frame': ['charger', 'plated'], 'Runner': ['charger', 'grey'], 'Marker': ['sentry', 'plated'], "The Factor's Frame": ['warden', 'factor'],
};
const SCARAB = { 'Scarab': ['#c9a35c', '#7a5a2a'], 'Dune Scarab': ['#e0c48a', '#9a7a4a'], 'Pipe Scarab': ['#b87333', '#6b3a1a'], 'Road Scarab': ['#6b6f74', '#2f3236'], 'Sump Scarab': ['#56563a', '#2f3020'], 'Apron Scarab': ['#ff8a1a', '#1a1a1e'] };
const SPITTER = { 'Spitter': ['#a07850', '#e8b070'], 'Grit Spitter': ['#8a8070', '#d8c8a0'], 'Rig Spitter': ['#6b6f74', '#ffb020'], 'Road Spitter': ['#55595e', '#e0c48a'], 'Drain Spitter': ['#4f6b5e', '#9fb59a'], 'Overflow Spitter': ['#3f5a6a', '#8fc3df'], 'Siege Spitter': ['#5a3d2b', '#ff8a1a'] };
const HUSK = { 'Husk': ['#d8c8a8', '#8a7a5a'], 'Drain Husk': ['#a8b49e', '#4f5f4a'], 'Standpipe Husk': ['#c9b090', '#6b5a40'] };
const WYRM = { 'The Breaker': ['#e8e0d0', '#f7f1e6', '#b8ac98'], 'Convoy Wyrm': ['#d8c8a8', '#efe4cc', '#8a7a5a'], 'The Cistern Wyrm': ['#c8d8dc', '#eef4f6', '#7f9aa0'] };
const DUR = { urbeast: { windup: 0.7, attack: 0.5, recover: 1.0 }, attendant: { windup: 1.2, attack: 1.6, recover: 1.3, armorBreak: 0.9 }, specimen: { windup: 1.0, attack: 0.6, recover: 1.4, armorBreak: 1.2, die: 2.4 }, queen: { windup: 1.1, attack: 1.0, recover: 1.5, armorBreak: 1.2, die: 2.4 }, deadfall: { windup: 1.1, attack: 0.7, recover: 1.8, armorBreak: 1.0, die: 2.4 }, mole: { windup: 0.9, attack: 0.5, recover: 1.4 }, hornet: { windup: 0.7, attack: 0.9, recover: 0.8 }, thorn: { windup: 0.9, attack: 0.5, recover: 1.4 }, spore: { windup: 0.9, attack: 0.5, recover: 0.9 }, ash: { windup: 1.0, attack: 0.6, recover: 1.2 }, cinder: { windup: 1.2, attack: 0.8, recover: 1.6, armorBreak: 1.4, die: 3.0, stagger: 1.6 }, slag: { windup: 0.9, attack: 0.55, recover: 1.2, armorBreak: 0.9 }, ember: { windup: 0.9, attack: 0.6, recover: 0.8 }, vent: { windup: 1.0, attack: 0.5, recover: 1.2 }, devil: { windup: 1.2, attack: 0.5, recover: 1.8 }, siphon: { windup: 1.3, attack: 1.0, recover: 1.6, armorBreak: 0.9, die: 2.4 }, scarab: { windup: 0.9, attack: 0.5, recover: 1.6 }, spitter: { windup: 1.4, attack: 0.6, recover: 1.0 }, husk: { windup: 1.0, attack: 0.5, recover: 1.8, hurt: 0.3 }, flamingo: { windup: 0.7, attack: 0.6, recover: 0.9 }, serpent: { windup: 1.1, attack: 1.0, recover: 1.5, die: 2.4, armorBreak: 1.0 }, sentry: { windup: 0.8, attack: 0.55, recover: 0.9 }, charger: { windup: 0.9, attack: 0.8, recover: 0.6, stagger: 2.0 }, warden: { windup: 1.0, attack: 0.55, recover: 1.3, armorBreak: 1.0, die: 2.0 }, giant: { windup: 1.1, attack: 0.7, recover: 1.6, armorBreak: 1.4, die: 3.0, stagger: 1.6, hurt: 0.4 }, shard: { windup: 0.75, attack: 0.35, recover: 1.1, hurt: 0.6 }, crab: {}, golem: { windup: 0.9, attack: 0.6, recover: 1.3, armorBreak: 1.0, die: 2.2, stagger: 1.4 } };
export function creatureKit({ THREE, toon, M }) {
  const FK = faceKit(THREE, toon), rbox = FK.rbox, PK = polishKit(THREE, toon, M);
  const lerp = (a, b, k) => a + (b - a) * k, cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = k => k * k * (3 - 2 * k);
  const crys = (c, glow) => new THREE.MeshToonMaterial({ color: c, emissive: new THREE.Color(c), emissiveIntensity: glow ?? 0.35, gradientMap: toon('#ffffff').gradientMap });
  function buildCrab(name) {
    const V = CRAB[name] || CRAB['Crystal Crab'], g = new THREE.Group(), J = {};
    const body = new THREE.Group(); body.position.y = 0.55; g.add(body); J.body = body;
    const shell = M(new THREE.SphereGeometry(0.6, 22, 14), V.woken ? crys(V.shell, 0.18) : toon(V.shell), 0, 0, 0, body, 0.035, 0.6); shell.scale.set(1.18, 0.5, 0.92);
    const belly = M(new THREE.CylinderGeometry(0.56, 0.5, 0.12, 18), toon(V.belly), 0, -0.2, 0, body, 0.03, 0.56); belly.scale.z = 0.82;
    // the geode: a glowing core (the weak point) ringed by crystal shards
    const geode = new THREE.Group(); geode.position.set(0, 0.24, -0.06); body.add(geode); J.geode = geode;
    const weakMat = new THREE.MeshToonMaterial({ color: V.glow, emissive: new THREE.Color(V.crys), emissiveIntensity: 0.9, gradientMap: toon('#ffffff').gradientMap });
    const weak = M(new THREE.SphereGeometry(0.17, 14, 10), weakMat, 0, 0.08, 0, geode, 0.02, 0.17);
    const cm = crys(V.crys), shards = [];
    for (const [x, y, z, rx, rz, s] of [[0, 0.26, 0, 0, 0, 1.1], [0.2, 0.16, 0.08, 0.2, -0.6, 0.9], [-0.2, 0.15, 0.06, 0.15, 0.6, 0.85], [0.08, 0.13, -0.2, -0.6, -0.2, 0.8], [-0.1, 0.12, 0.2, 0.6, 0.25, 0.7]]) {
      const sh = M(new THREE.OctahedronGeometry(0.15, 0), cm, x, y, z, geode, 0.02); sh.scale.set(0.55 * s, 1.7 * s, 0.55 * s); sh.rotation.set(rx, 0, rz); sh.userData.home = sh.position.clone(); shards.push(sh); }
    J.shards = shards; J.cm = cm;
    // eyes on stalks: big whites so the face reads on a phone
    J.eyes = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.2, 0.18, 0.42); body.add(e); M(new THREE.CylinderGeometry(0.03, 0.04, 0.26, 8), toon(V.shell), 0, 0.12, 0, e, 0.015, 0.04); M(new THREE.SphereGeometry(0.11, 14, 10), toon('#ffffff'), 0, 0.28, 0, e, 0.02, 0.11); const p = M(new THREE.SphereGeometry(0.055, 10, 8), toon('#15121c'), 0, 0.29, 0.08, e, 0); e.userData.pupil = p; return e; });
    // claws: shoulder pivot → forearm → pincer with a hinged lower jaw
    J.claws = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 0.52, -0.02, 0.34); body.add(sh);
      const arm = M(new THREE.CylinderGeometry(0.06, 0.075, 0.42, 8), toon(V.shell), 0, 0, 0.2, sh, 0.02, 0.07); arm.rotation.x = Math.PI / 2;
      const hand = new THREE.Group(); hand.position.set(s * 0.04, 0.02, 0.44); sh.add(hand);
      const palm = M(new THREE.SphereGeometry(0.17, 14, 10), toon(V.shell), 0, 0, 0, hand, 0.025, 0.17); palm.scale.set(1, 0.78, 1.25);
      const top = M(new THREE.BoxGeometry(0.12, 0.1, 0.36), toon(V.belly), 0, 0.05, 0.26, hand, 0.02); top.rotation.x = -0.12;
      const jaw = new THREE.Group(); jaw.position.set(0, -0.04, 0.1); hand.add(jaw); M(new THREE.BoxGeometry(0.1, 0.08, 0.3), toon(V.belly), 0, 0, 0.15, jaw, 0.02);
      for (let q = 0; q < 3; q++) { const tt = M(new THREE.ConeGeometry(0.022, 0.07, 4), toon('#f5f0ff'), 0, -0.01, 0.16 + q * 0.07, hand, 0); tt.rotation.x = Math.PI; const tb = M(new THREE.ConeGeometry(0.02, 0.06, 4), toon('#f5f0ff'), 0, 0.045, 0.06 + q * 0.07, jaw, 0); }   // serrated pincers
      if (V.woken) { const c = M(new THREE.OctahedronGeometry(0.07, 0), cm, 0, 0.14, -0.02, hand, 0.012); c.scale.y = 1.8; }
      return { sh, hand, jaw, s }; });
    // six legs, three a side
    J.legs = []; for (const s of [-1, 1]) [0.12, -0.12, -0.36].forEach((z, i) => { const p = new THREE.Group(); p.position.set(s * 0.5, -0.06, z); body.add(p); const l = M(new THREE.CylinderGeometry(0.035, 0.05, 0.62, 7), toon(V.shell), s * 0.22, -0.2, 0, p, 0.015, 0.05); l.rotation.z = s * 1.05; J.legs.push({ p, s, ph: i * 2.1 + (s > 0 ? Math.PI : 0) }); });
    if (V.sump) for (const [x, z] of [[0.45, 0.2], [-0.4, -0.25], [0.15, -0.5]]) M(new THREE.CylinderGeometry(0.025, 0.012, 0.22, 5), toon('#3f6b3a'), x, -0.24, z, body, 0);
    g.scale.setScalar(V.scale);
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'crab', variant: name, joints: J, weak, weakMat, weakBase: new THREE.Color(V.crys), calls, height: 1.3 * V.scale, reach: 1.1, events: [] });
    return g;
  }
  function animateCrab(g, state, t, dt, opts = {}) {
    const J = g.userData.joints, B = J.body;
    B.position.set(0, 0.55, 0); B.rotation.set(0, 0, 0); g.rotation.z = 0;
    let clawX = 0.1, jaw = 0.15, legAmp = 0.06, legRate = 3, eyeWob = Math.sin(t * 1.7) * 0.08;
    J.shards.forEach(s => { s.position.copy(s.userData.home); s.visible = true; });
    if (state === 'idle') { B.position.y += Math.sin(t * 2.2) * 0.02; jaw = 0.12 + Math.max(0, Math.sin(t * 1.3)) * 0.2; }
    else if (state === 'move') { const sp = opts.speed ?? 1; legAmp = 0.5; legRate = 15 * sp; B.rotation.z = Math.sin(t * legRate) * 0.05; B.position.y += Math.abs(Math.sin(t * legRate)) * 0.03; clawX = 0.25; }
    else if (state === 'windup') { const k = ease(cl(t / 0.3)); clawX = lerp(0.1, -0.95, k); B.rotation.x = -0.12 * k; jaw = t > 0.15 ? 0.55 * Math.abs(Math.sin((t - 0.15) * 14)) : 0.15; }
    else if (state === 'attack') { const k = cl(t / 0.4), snap = k < 0.5 ? k * 2 : (k - 0.5) * 2; clawX = lerp(-0.95, 0.35, ease(snap)); jaw = snap < 0.4 ? 0.6 : 0; B.position.z = Math.sin(k * Math.PI) * 0.35; B.rotation.x = 0.15 * Math.sin(k * Math.PI); }
    else if (state === 'recover') { clawX = 0.55; jaw = 0.4; B.rotation.x = 0.16; B.position.y -= 0.06; legAmp = 0.02; }
    else if (state === 'hurt') { B.position.x = Math.sin(t * 70) * 0.05 * (1 - cl(t / 0.3)); B.rotation.x = -0.1; jaw = 0.5; }
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 6) * 0.25; B.rotation.x = 0.1; clawX = 0.6; jaw = 0.5; eyeWob = t * 9; }
    else if (state === 'armorBreak') { const k = cl(t / 0.8); J.shards.forEach((s, i) => { const d = s.userData.home.clone().normalize(); s.position.copy(s.userData.home).addScaledVector(d, k * 0.9).add(new THREE.Vector3(0, Math.sin(k * Math.PI) * 0.4, 0)); s.visible = k < 0.95; }); B.position.y -= 0.05 * Math.sin(k * Math.PI); jaw = 0.6; }
    else if (state === 'die') { const k = ease(cl(t / 0.5)); g.rotation.z = Math.PI * k; B.position.y = lerp(0.55, 0.3, k); legAmp = t > 0.5 ? 0.25 * Math.max(0, 1 - (t - 0.5) / 0.9) : 0.1; legRate = 22; clawX = 0.9; jaw = 0.7; J.shards.forEach(s => { s.visible = t < 0.7; }); }
    if (state === 'idle') { B.position.x = Math.sin(t * 0.9) * 0.12; legAmp = Math.max(legAmp, Math.abs(Math.cos(t * 0.9)) * 0.28); legRate = 12; }   // a little sideways shuffle
    { const U = g.userData; if (state === 'windup' && (U.lastJaw || 0) > 0.3 && jaw < 0.12) U.events.push('clack'); U.lastJaw = jaw; if (J.cm) J.cm.emissiveIntensity = 0.3 + Math.sin(t * 2.2) * 0.15; }
    J.claws.forEach((c, i) => { c.sh.rotation.set(clawX + (state === 'idle' ? Math.sin(t * 1.4 + i) * 0.05 : 0), c.s * 0.25, 0); c.jaw.rotation.x = jaw; });
    J.legs.forEach(L => { L.p.rotation.set(Math.sin(t * legRate + L.ph) * legAmp, 0, state === 'die' ? -L.s * 0.6 : Math.cos(t * legRate + L.ph) * legAmp * 0.4); });
    J.eyes.forEach((e, i) => { e.rotation.z = (i ? -1 : 1) * 0.12 + Math.sin(eyeWob + i) * 0.1; e.rotation.x = state === 'windup' || state === 'attack' ? 0.25 : 0; });
  }
  function buildGolem(name) {
    const V = GOLEM[name] || GOLEM['Crystal Golem'], g = new THREE.Group(), J = {}, cm = crys(V.crys), bm = toon(V.body), dm = toon(V.dark);
    const hips = new THREE.Group(); hips.position.y = 1.0; g.add(hips); J.hips = hips;
    J.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.3, 0, 0); hips.add(p); M(rbox(0.38, 0.5, 0.4), bm, 0, -0.25, 0, p, 0.03); M(rbox(0.42, 0.52, 0.44), dm, 0, -0.7, 0.02, p, 0.03); M(rbox(0.52, 0.18, 0.64), dm, 0, -0.92, 0.08, p, 0.03); return { p, s }; });
    const torso = new THREE.Group(); hips.add(torso); J.torso = torso;
    const chest = M(rbox(1.2, 0.95, 0.76), bm, 0, 0.6, 0, torso, 0.04); chest.scale.set(1, 1, 1);
    M(rbox(0.9, 0.32, 0.6), dm, 0, 0.08, 0, torso, 0.03);
    if (V.band) M(rbox(1.22, 0.12, 0.78), toon('#e6d6ff'), 0, 0.42, 0, torso, 0);
    // head: small, heavy brow, big glowing eyes
    const head = new THREE.Group(); head.position.set(0, 1.22, 0.06); torso.add(head); J.head = head;
    M(rbox(0.44, 0.36, 0.42), bm, 0, 0, 0, head, 0.03); M(rbox(0.5, 0.1, 0.2), dm, 0, 0.12, 0.16, head, 0.02);
    const eyeM = new THREE.MeshBasicMaterial({ color: V.glow }); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), eyeM); e.position.set(s * 0.11, 0.02, 0.21); head.add(e); }
    if (V.crown) for (let i = 0; i < V.crown; i++) { const a = (i / (V.crown - 1 || 1) - 0.5) * 1.6; const c = M(new THREE.OctahedronGeometry(0.08, 0), cm, Math.sin(a) * 0.2, 0.26 + Math.cos(a) * 0.04, -0.05, head, 0.012); c.scale.y = 2 + (i === Math.floor(V.crown / 2) ? 0.8 : 0); c.rotation.z = -a * 0.5; }
    // shoulder slabs: the crust (whole → cracked → broken)
    J.pauldrons = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.72, 1.06, 0); torso.add(p); const sl = M(rbox(0.6, 0.26, 0.66), cm, 0, 0, 0, p, 0.03); sl.rotation.z = -s * 0.25; const sp = M(new THREE.OctahedronGeometry(0.13, 0), cm, s * 0.12, 0.2, 0, p, 0.015); sp.scale.y = 2.2; sp.rotation.z = -s * 0.4; p.userData.home = p.position.clone(); return p; });
    J.cracks = []; for (const [x, y, z, w, r] of [[0.25, 0.75, 0.385, 0.42, 0.7], [-0.3, 0.5, 0.385, 0.34, -0.5], [0.72, 1.18, 0.34, 0.36, 0.3], [-0.72, 1.16, 0.34, 0.32, -0.4]]) { const c = new THREE.Mesh(rbox(w, 0.03, 0.02), new THREE.MeshBasicMaterial({ color: 0x140a24 })); c.position.set(x, y, z); c.rotation.z = r; c.visible = false; torso.add(c); J.cracks.push(c); }
    // back slabs (what it throws) over the glowing core (the weak point)
    const weakMat = new THREE.MeshToonMaterial({ color: V.glow, emissive: new THREE.Color(V.crys), emissiveIntensity: 0.9, gradientMap: toon('#ffffff').gradientMap });
    const weak = M(new THREE.SphereGeometry(0.22, 14, 10), weakMat, 0, 0.62, -0.34, torso, 0.02, 0.22);
    J.slabs = [[-0.27, 0.8, -0.1], [0.27, 0.82, 0.12], [0, 0.38, 0]].map(([x, y, r]) => { const s = M(rbox(0.5, 0.5, 0.14), cm, x, y, -0.45, torso, 0.025); s.rotation.set(0.12, 0, r); return s; });
    // arms: long, hanging, boulder fists; the right one grabs and throws
    J.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 0.8, 0.98, 0); torso.add(sh); M(rbox(0.32, 0.6, 0.34), bm, 0, -0.3, 0, sh, 0.03); const el = new THREE.Group(); el.position.y = -0.62; sh.add(el); M(rbox(0.34, 0.55, 0.36), dm, 0, -0.26, 0, el, 0.03);
      if (V.arms) { const c = M(new THREE.OctahedronGeometry(0.1, 0), cm, s * 0.18, -0.2, 0, el, 0.012); c.scale.y = 2; c.rotation.z = -s * 0.6; }
      const fist = M(new THREE.IcosahedronGeometry(0.28, 0), bm, 0, -0.62, 0.02, el, 0.03, 0.28); return { sh, el, fist, s }; });
    const held = M(rbox(0.5, 0.5, 0.14), cm, 0, -0.1, 0.25, J.arms[1].fist, 0.025); held.visible = false; J.held = held;
    if (V.crown) { const cape = new THREE.Group(); cape.position.set(0, 1.12, -0.42); torso.add(cape); J.cape = cape; for (let i = 0; i < 7; i++) { const x = (i - 3) * 0.17, l = 0.55 + (3 - Math.abs(i - 3)) * 0.12; const c = M(new THREE.OctahedronGeometry(0.1, 0), cm, x, -l / 2 - 0.05, -Math.abs(i - 3) * 0.02, cape, 0.012); c.scale.set(0.9, l / 0.2, 0.5); } }   // the Wardens wear a cape of crystal shards
    if (V.moss) for (const [x, y, z, par] of [[0.1, 0.16, 0.05, J.pauldrons[0]], [-0.05, 0.15, 0, J.pauldrons[1]], [0, 0.2, 0, head]]) { const m2 = M(new THREE.IcosahedronGeometry(0.11, 0), toon('#5f8f3e'), x, y, z, par, 0.012); m2.scale.set(1.4, 0.6, 1.2); }
    if (V.veins) { const vm = new THREE.MeshBasicMaterial({ color: V.crys }); for (const [x, y, w, r] of [[0.2, 0.62, 0.7, 0.9], [-0.25, 0.7, 0.6, -0.7], [0, 0.3, 0.8, 0.1]]) { const v = new THREE.Mesh(rbox(w, 0.035, 0.02), vm); v.position.set(x, y, 0.385); v.rotation.z = r; torso.add(v); } }
    g.scale.setScalar(V.scale);
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'golem', variant: name, joints: J, weak, weakMat, weakBase: new THREE.Color(V.crys), slabColor: V.crys, calls, height: 2.42 * V.scale, reach: 2.0 * V.scale, slabsLeft: 3, crust: 0, events: [] });
    return g;
  }
  function enterGolem(g, state) { const U = g.userData, J = U.joints;
    g.visible = true;
    if (state === 'windup') { U.willThrow = U.slabsLeft > 0; if (U.willThrow) U.taking = 3 - U.slabsLeft; }
    if (state === 'attack' && U.willThrow) { U.slabsLeft--; }
    if (state === 'armorBreak') U.crust = Math.min(2, U.crust + 1);
    if (state === 'die') U.dead = true; else U.dead = false;
    J.slabs.forEach((s, i) => s.visible = i >= 3 - U.slabsLeft || (state === 'windup' && false));
    J.held.visible = state === 'attack' && U.willThrow;
    U.weakMat.emissiveIntensity = U.slabsLeft === 0 ? 1.6 : 0.9; }
  function animateGolem(g, state, t, dt) {
    const U = g.userData, J = U.joints, H = J.hips, T = J.torso, D = DUR.golem;
    H.position.set(0, 1.0, 0); H.rotation.set(0, 0, 0); T.rotation.set(0, 0, 0); T.position.set(0, 0, 0); J.head.rotation.set(0, 0, 0);
    let a0 = [0.08, 0, 0.12], a1 = [0.08, 0, -0.12], legA = 0, el0 = -0.15, el1 = -0.15;
    const setArm = (A, x, y, z, el) => { A.sh.rotation.set(x, y, z); A.el.rotation.x = el; };
    if (state === 'idle') { T.rotation.x = Math.sin(t * 1.1) * 0.03; T.position.y = Math.sin(t * 1.1) * 0.015; a0[0] = 0.08 + Math.sin(t * 1.1) * 0.05; a1[0] = 0.08 + Math.sin(t * 1.1 + 1) * 0.05; J.head.rotation.y = Math.sin(t * 0.5) * 0.25; }
    else if (state === 'move') { const w = t * 4.5; legA = Math.sin(w) * 0.42; H.position.y = 1.0 + Math.abs(Math.cos(w)) * -0.06; T.rotation.y = Math.sin(w) * 0.1; T.rotation.z = Math.sin(w) * 0.04; a0[0] = -Math.sin(w) * 0.45; a1[0] = Math.sin(w) * 0.45; }
    else if (state === 'windup') { const k = ease(cl(t / (D.windup * 0.75)));
      if (U.willThrow) { a1 = [lerp(0.08, -2.7, k), 0, lerp(-0.12, 0.35, k)]; el1 = lerp(-0.15, -0.9, k); T.rotation.y = -0.35 * k; T.rotation.x = -0.1 * k;
        if (t > D.windup * 0.6 && !U.ripped) { U.ripped = true; U.events.push('rip'); } if (U.ripped) { J.held.visible = true; const s = J.slabs[U.taking]; if (s) s.visible = false; } }
      else { a0 = [lerp(0.08, -2.9, k), 0, 0.2]; a1 = [lerp(0.08, -2.9, k), 0, -0.2]; el0 = el1 = -0.5 * k; T.rotation.x = -0.2 * k; H.position.y = 1.0 - 0.1 * k; } }
    else if (state === 'attack') { const k = cl(t / D.attack);
      if (U.willThrow) { const s = ease(cl(k / 0.55)); a1 = [lerp(-2.7, 0.7, s), 0, lerp(0.35, -0.1, s)]; el1 = lerp(-0.9, -0.1, s); T.rotation.y = lerp(-0.35, 0.3, s); T.rotation.x = 0.15 * s; if (k > 0.42 && J.held.visible) { J.held.visible = false; U.events.push('throw'); } }
      else { const s = ease(cl(k / 0.45)); a0 = [lerp(-2.9, 0.5, s), 0, 0.1]; a1 = [lerp(-2.9, 0.5, s), 0, -0.1]; el0 = el1 = -0.1; T.rotation.x = 0.4 * s; H.position.y = 1.0 - 0.15 * s; if (k > 0.45 && !U.slammed) { U.slammed = true; U.events.push('slam'); } } }
    else if (state === 'recover') { T.rotation.x = 0.28; H.position.y = 0.94; a0 = [0.5, 0, 0.1]; a1 = [0.5, 0, -0.1]; J.head.rotation.x = 0.2; }
    else if (state === 'hurt') { T.position.x = Math.sin(t * 50) * 0.04 * (1 - cl(t / 0.3)); T.rotation.x = -0.12; }
    else if (state === 'stagger') { T.rotation.z = Math.sin(t * 4) * 0.18; T.rotation.x = 0.15; H.position.y = 0.92; legA = Math.sin(t * 4) * 0.15; a0 = [0.3, 0, 0.4]; a1 = [0.3, 0, -0.4]; J.head.rotation.z = Math.sin(t * 5) * 0.25; }
    else if (state === 'armorBreak') { const k = cl(t / D.armorBreak); T.rotation.x = -0.15 * Math.sin(k * Math.PI); a0 = [-0.6 * Math.sin(k * Math.PI), 0, 0.6]; a1 = [-0.6 * Math.sin(k * Math.PI), 0, -0.6];
      if (U.crust >= 2) J.pauldrons.forEach((p, i) => { p.position.copy(p.userData.home).add(new THREE.Vector3((i ? 1 : -1) * k * 0.6, -k * k * 1.6, 0.2 * k)); p.rotation.z = (i ? -1 : 1) * k * 2; p.visible = k < 0.97; }); }
    else if (state === 'die') { const k = ease(cl(t / 1.0)); H.position.y = lerp(1.0, 0.55, k); legA = 0; T.rotation.x = 0.5 * k; a0 = [0.9 * k, 0, 0.3]; a1 = [0.9 * k, 0, -0.3]; J.legs.forEach(L => L.p.rotation.x = -1.2 * k); if (t > 1.05 && g.visible) { g.visible = false; U.events.push('shatter'); } }
    if (state !== 'die') J.legs.forEach(L => L.p.rotation.set(L.s * legA, 0, 0));
    if (state !== 'armorBreak') J.pauldrons.forEach(p => { p.position.copy(p.userData.home); p.rotation.z = 0; p.visible = U.crust < 2; });
    J.cracks.forEach(c => c.visible = U.crust >= 1);
    if (state !== 'windup') U.ripped = false; if (state !== 'attack') U.slammed = false;
    setArm(J.arms[0], a0[0], a0[1], a0[2], el0); setArm(J.arms[1], a1[0], a1[1], a1[2], el1);
    if (J.cape) { J.cape.rotation.x = 0.12 + Math.sin(t * 2.1) * 0.05 + (state === 'move' ? 0.3 + Math.sin(t * 9) * 0.06 : 0) + (state === 'attack' ? -0.35 : 0) - T.rotation.x * 0.8; J.cape.rotation.z = -T.rotation.y * 0.6 + Math.sin(t * 1.3) * 0.04; }
    if (state === 'move') { const sp = Math.floor(t * 4.5 / Math.PI); if (sp !== U.stp) { U.stp = sp; U.events.push('step'); } }   // heavy footsteps
  }
  function buildShard(name) {
    const V = SHARD[name] || SHARD['Shardthrower'], g = new THREE.Group(), J = {}, cm = crys(V.crys), bm = toon(V.body), dm = toon(V.dark);
    const hips = new THREE.Group(); hips.position.y = 0.95; g.add(hips); J.hips = hips;
    // stilt legs (the Blue one is rooted: a crystal base instead of feet)
    J.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.14, 0, 0); hips.add(p); const th = M(new THREE.CylinderGeometry(0.045, 0.06, 0.5, 6), dm, 0, -0.25, 0, p, 0.015, 0.06); const sh = M(new THREE.CylinderGeometry(0.035, 0.05, 0.5, 6), dm, 0, -0.7, 0.05, p, 0.015, 0.05); sh.rotation.x = -0.1; M(new THREE.OctahedronGeometry(0.08, 0), cm, 0, -0.95, 0.07, p, 0.012); return { p, s }; });
    if (V.turret) { const base = M(new THREE.CylinderGeometry(0.34, 0.42, 0.22, 6), cm, 0, 0.11, 0, g, 0.02, 0.42); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2, c = M(new THREE.OctahedronGeometry(0.09, 0), cm, Math.cos(a) * 0.36, 0.2, Math.sin(a) * 0.36, g, 0.012); c.scale.y = 2; c.rotation.z = Math.cos(a) * 0.5; c.rotation.x = Math.sin(a) * 0.5; } }
    const torso = new THREE.Group(); hips.add(torso); J.torso = torso;
    const ch = M(new THREE.OctahedronGeometry(0.3, 0), bm, 0, 0.36, 0, torso, 0.025); ch.scale.set(0.9, 1.5, 0.7);
    const weakMat = new THREE.MeshToonMaterial({ color: V.glow, emissive: new THREE.Color(V.crys), emissiveIntensity: 0.9, gradientMap: toon('#ffffff').gradientMap });
    // the head: a crystal face with one big eye (it shields this when you get close)
    const head = new THREE.Group(); head.position.set(0, 0.86, 0.02); torso.add(head); J.head = head;
    const hd = M(new THREE.OctahedronGeometry(0.17, 0), bm, 0, 0, 0, head, 0.02); hd.scale.set(1, 1.25, 0.9);
    const weak = M(new THREE.SphereGeometry(0.075, 12, 9), weakMat, 0, 0.01, 0.13, head, 0.015, 0.075); J.eye = weak;
    for (const [x, r] of [[-0.09, 0.5], [0.09, -0.5], [0, 0]]) { const c = M(new THREE.OctahedronGeometry(0.06, 0), cm, x, 0.2, -0.02, head, 0.01); c.scale.y = 2.4; c.rotation.z = r; }
    // short guard arm (left) and the long throwing arm (right) with three shards fanned in the hand
    const arm = (s, len, w) => { const sh = new THREE.Group(); sh.position.set(s * 0.26, 0.62, 0); torso.add(sh); M(new THREE.CylinderGeometry(w, w * 0.8, len, 6), dm, 0, -len / 2, 0, sh, 0.012, w); const el = new THREE.Group(); el.position.y = -len; sh.add(el); M(new THREE.CylinderGeometry(w * 0.8, w * 0.6, len, 6), bm, 0, -len / 2, 0, el, 0.012, w); const hand = new THREE.Group(); hand.position.y = -len; el.add(hand); M(new THREE.OctahedronGeometry(w * 1.4, 0), cm, 0, 0, 0, hand, 0.01); return { sh, el, hand, s }; };
    J.guard = arm(-1, 0.3, 0.045); J.thrower = arm(1, 0.5, 0.05);
    { const crest = M(new THREE.OctahedronGeometry(0.08, 0), crys(V.crys, 1.3), 0, 0.3, -0.03, head, 0.01); crest.scale.y = 3.2; J.crest = crest; }   // a glowing crest
    J.quiver = []; { const q = new THREE.Group(); q.position.set(-0.12, 0.5, -0.2); q.rotation.z = 0.3; torso.add(q); M(new THREE.CylinderGeometry(0.07, 0.06, 0.32, 8), dm, 0, 0, 0, q, 0.01, 0.07); for (let i = 0; i < 6; i++) { const c = M(new THREE.OctahedronGeometry(0.05, 0), cm, ((i % 3) - 1) * 0.035, 0.2 + (i > 2 ? 0.04 : 0), (i > 2 ? 0.02 : -0.02), q, 0.006); c.scale.y = 2.6; J.quiver.push(c); } }   // the quiver on its back empties as it throws
    J.tail = []; { let par = hips; for (let i = 0; i < 3; i++) { const s = new THREE.Group(); s.position.set(0, i ? -0.02 : -0.05, i ? -0.14 : -0.12); par.add(s); const c = M(new THREE.OctahedronGeometry(0.06 - i * 0.012, 0), cm, 0, 0, -0.06, s, 0.006); c.scale.z = 2; J.tail.push(s); par = s; } }   // a little crystal tail
    J.held = [-0.45, 0, 0.45].map(a => { const c = M(new THREE.OctahedronGeometry(0.07, 0), cm, Math.sin(a) * 0.1, -0.12, 0, J.thrower.hand, 0.01); c.scale.y = 2.6; c.rotation.z = a; return c; });
    g.scale.setScalar(V.scale);
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'shard', variant: name, joints: J, weak, weakMat, weakBase: new THREE.Color(V.crys), slabColor: V.crys, calls, height: 2.1 * V.scale, reach: 0, ranged: true, turret: !!V.turret, events: [] });
    return g;
  }
  function animateShard(g, state, t, dt, opts = {}) {
    const U = g.userData, J = U.joints, H = J.hips, T = J.torso, D = DUR.shard;
    H.position.set(0, 0.95, 0); H.rotation.set(0, 0, 0); T.rotation.set(0, 0, 0); J.head.rotation.set(0, 0, 0); g.rotation.set(0, g.rotation.y, 0);
    let th = [0.2, 0, 0.25, -0.3], gd = [0.15, 0, -0.2, -0.4], legA = 0, glint = 0;
    J.held.forEach(c => { c.visible = true; c.scale.setScalar(1); c.scale.y = 2.6; });
    if (state === 'idle') { T.rotation.z = Math.sin(t * 1.6) * 0.05; H.position.y += Math.sin(t * 3.2) * 0.012; J.head.rotation.y = Math.sin(t * 0.9) * 0.4; th[0] = 0.2 + Math.sin(t * 1.6) * 0.08; }
    else if (state === 'move') { if (U.turret) { T.rotation.y = Math.sin(t * 1.5) * 0.6; } else { const w = t * 9; legA = Math.sin(w) * 0.55; H.position.y += Math.abs(Math.sin(w)) * 0.05; T.rotation.x = -0.15; J.head.rotation.x = -0.1; } }
    else if (state === 'windup') { const k = ease(cl(t / (D.windup * 0.7))); th = [lerp(0.2, -2.4, k), lerp(0, -0.4, k), lerp(0.25, 0.9, k), lerp(-0.3, -1.3, k)]; T.rotation.y = -0.5 * k; T.rotation.z = 0.12 * k; gd = [lerp(0.15, -1.2, k), 0, -0.5, -0.6]; glint = t > D.windup * 0.45 ? 0.5 + 0.5 * Math.sin(t * 40) : 0; J.held.forEach((c, i) => c.scale.setScalar(1 + glint * 0.35)); }
    else if (state === 'attack') { const k = cl(t / D.attack), s = ease(cl(k / 0.5)); th = [lerp(-2.4, 0.9, s), lerp(-0.4, 0.5, s), lerp(0.9, -0.2, s), lerp(-1.3, -0.1, s)]; T.rotation.y = lerp(-0.5, 0.45, s); if (k > 0.35 && !U.fanned) { U.fanned = true; U.events.push('fan'); } if (U.fanned) J.held.forEach(c => c.visible = false); }
    else if (state === 'recover') { th = [0.9, 0.3, 0.1, -0.2]; T.rotation.x = 0.12; J.head.rotation.x = 0.15; J.held.forEach(c => c.visible = false); if (!U.turret) { const w = t * 7; legA = Math.sin(w) * 0.4 * Math.max(0, 1 - t); } }
    else if (state === 'hurt') { // panics and shields its face
      const k = ease(cl(t / 0.15)); gd = [lerp(0.15, -2.2, k), 0.3, lerp(-0.2, 0.7, k), -2.1 * k]; th = [lerp(0.2, -1.9, k), -0.3, lerp(0.25, -0.6, k), -1.9 * k]; T.rotation.x = -0.2 * k; H.position.y -= 0.08 * k; J.head.rotation.x = 0.3 * k; T.position.x = Math.sin(t * 60) * 0.02; }
    else if (state === 'stagger') { T.rotation.z = Math.sin(t * 7) * 0.3; H.position.y -= 0.06; legA = Math.sin(t * 7) * 0.2; J.head.rotation.z = Math.sin(t * 9) * 0.4; th = [0.5, 0, 0.8, -0.2]; gd = [0.5, 0, -0.8, -0.2]; }
    else if (state === 'armorBreak') { const k = cl(t / 0.8); T.rotation.x = -0.25 * Math.sin(k * Math.PI); J.held.forEach(c => c.visible = k < 0.2); }
    else if (state === 'die') { const k = ease(cl(t / 0.8)); g.rotation.x = -1.35 * k; H.position.y = lerp(0.95, 0.35, k); th = [-0.6, 0, 1.2 * k, 0]; gd = [-0.6, 0, -1.2 * k, 0]; if (t > 0.85 && g.visible) { g.visible = false; U.events.push('shatter'); } }
    if (state !== 'attack') U.fanned = false; if (state !== 'die') g.visible = true;
    J.legs.forEach(L => L.p.rotation.set(L.s * legA, 0, 0));
    J.thrower.sh.rotation.set(th[0], th[1], th[2]); J.thrower.el.rotation.x = th[3];
    J.guard.sh.rotation.set(gd[0], gd[1], gd[2]); J.guard.el.rotation.x = gd[3];
    U.weakMat.emissiveIntensity = 0.9 + glint * 1.2;
    if (U.quiverN == null) U.quiverN = 6; if (state === 'attack' && U.fanned && !U.took) { U.took = true; U.quiverN = Math.max(0, U.quiverN - 2); } if (state !== 'attack') U.took = false; if (state === 'idle' && t > 1.2) U.quiverN = 6;
    J.quiver.forEach((c, i) => c.visible = i < U.quiverN); J.tail.forEach((s, i) => s.rotation.y = Math.sin(t * 3 - i * 0.8) * 0.35); J.crest.material.emissiveIntensity = 1.0 + glint * 1.5 + Math.sin(t * 3) * 0.2;
  }
  function buildGiant(name) {
    const g = new THREE.Group(), J = {}, base = toon('#5a3a8f'), dark = toon('#3a2366'), cm = crys('#e09bff');
    // the platform it never leaves
    const plat = new THREE.Group(); g.add(plat); J.plat = plat;
    M(new THREE.CylinderGeometry(2.2, 2.5, 0.6, 8), toon('#4a3a5e'), 0, 0.3, 0, plat, 0.03, 2.5);
    M(new THREE.CylinderGeometry(2.25, 2.25, 0.08, 8), toon('#ffd23a'), 0, 0.62, 0, plat, 0);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, c = M(new THREE.OctahedronGeometry(0.22, 0), cm, Math.cos(a) * 2.1, 0.8, Math.sin(a) * 2.1, plat, 0.015); c.scale.y = 2.2; }
    const body = new THREE.Group(); body.position.y = 0.66; g.add(body); J.body = body;
    // legs: two stumps, planted
    for (const s of [-1, 1]) { M(new THREE.BoxGeometry(0.8, 1.3, 0.85), dark, s * 0.62, 0.65, 0, body, 0.04); M(new THREE.BoxGeometry(1.0, 0.3, 1.1), dark, s * 0.64, 0.15, 0.1, body, 0.03); }
    const torso = new THREE.Group(); torso.position.y = 1.3; body.add(torso); J.torso = torso;
    M(new THREE.BoxGeometry(2.3, 1.9, 1.4), base, 0, 1.0, 0, torso, 0.05);
    M(new THREE.BoxGeometry(1.7, 0.5, 1.1), dark, 0, -0.05, 0, torso, 0.04);
    // the core (weak point) sits in the chest, hidden under the paint until phase 3
    const weakMat = new THREE.MeshToonMaterial({ color: '#ffffff', emissive: new THREE.Color('#fff2d6'), emissiveIntensity: 1.2, gradientMap: toon('#ffffff').gradientMap });
    const weak = M(new THREE.SphereGeometry(0.42, 18, 12), weakMat, 0, 1.05, 0.52, torso, 0.03, 0.42);
    // paint: rainbow stripes over the front and the shoulders (peels off as it takes damage)
    J.paint = []; RAINBOW.forEach((c, i) => { const p = M(new THREE.BoxGeometry(2.32, 0.26, 0.04), toon(c), 0, 0.2 + i * 0.26, 0.71, torso, 0); p.userData.home = p.position.clone(); p.userData.rz = (Math.random() - 0.5) * 0.08; p.rotation.z = p.userData.rz; J.paint.push(p); });
    for (const [x, y, c, r] of [[-0.7, 1.55, 3, 0.3], [0.65, 0.5, 5, -0.4], [0.2, 1.75, 1, 0.1], [-0.35, 0.35, 6, -0.2]]) { const hp = new THREE.Group(); hp.position.set(x, y, 0.735); hp.rotation.z = r; torso.add(hp); const pm = toon(RAINBOW[c]); M(new THREE.CircleGeometry(0.12, 12), pm, 0, 0, 0, hp, 0); for (let f = 0; f < 4; f++) M(new THREE.PlaneGeometry(0.045, 0.13), pm, (f - 1.5) * 0.055, 0.15, 0.001, hp, 0); M(new THREE.PlaneGeometry(0.045, 0.1), pm, 0.13, 0.03, 0.001, hp, 0).rotation.z = -0.8; hp.userData.home = hp.position.clone(); hp.userData.rz = r; J.paint.push(hp); }   // painted handprints
    for (const [s, c] of [[-1, 2], [1, 5]]) { const sw = M(new THREE.TorusGeometry(0.22, 0.04, 5, 16, Math.PI * 1.6), toon(RAINBOW[c]), s * 0.9, 1.15, 0.735, torso, 0); sw.userData.home = sw.position.clone(); sw.userData.rz = s; sw.rotation.z = s; J.paint.push(sw); }   // swirls
    J.drips = [0.6, -0.4, 0.1, -0.8, 0.9].map((x, i) => { const d = M(new THREE.CylinderGeometry(0.025, 0.035, 0.3, 6), toon(RAINBOW[i + 1]), x, 0.1, 0.72, torso, 0); d.geometry.translate(0, -0.15, 0); return d; });   // paint drips
    J.cracks = []; for (const [x, y, w, r] of [[0.3, 1.3, 0.9, 0.8], [-0.4, 0.8, 0.8, -0.6], [0.1, 0.55, 0.7, 0.2], [-0.15, 1.55, 0.6, -0.3]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, 0.03), new THREE.MeshBasicMaterial({ color: 0xfff2d6 })); c.position.set(x, y, 0.72); c.rotation.z = r; c.visible = false; torso.add(c); J.cracks.push(c); }
    // head: a crowned crystal block with two painted eyes
    const head = new THREE.Group(); head.position.set(0, 2.25, 0.05); torso.add(head); J.head = head;
    M(new THREE.BoxGeometry(0.95, 0.75, 0.85), base, 0, 0, 0, head, 0.04);
    M(new THREE.BoxGeometry(1.0, 0.16, 0.3), dark, 0, 0.26, 0.32, head, 0.02);
    J.eyes = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.04), new THREE.MeshBasicMaterial({ color: 0xfff2d6 })); e.position.set(s * 0.22, 0.06, 0.44); head.add(e); return e; });
    for (let i = 0; i < 5; i++) { const a = (i / 4 - 0.5) * 1.5, c = M(new THREE.OctahedronGeometry(0.16, 0), crys(RAINBOW[i + 1], 0.5), Math.sin(a) * 0.4, 0.55 + Math.cos(a) * 0.08 + (i === 2 ? 0.15 : 0), 0, head, 0.015); c.scale.y = 2.3; c.rotation.z = -a * 0.5; }
    // shoulders + huge arms with painted fists
    J.arms = [-1, 1].map((s, i) => { const sh = new THREE.Group(); sh.position.set(s * 1.4, 1.65, 0); torso.add(sh);
      const pad = M(new THREE.BoxGeometry(0.95, 0.55, 1.1), cm, 0, 0.25, 0, sh, 0.035); pad.rotation.z = -s * 0.2;
      M(new THREE.BoxGeometry(0.6, 1.1, 0.62), base, 0, -0.55, 0, sh, 0.035); const el = new THREE.Group(); el.position.y = -1.1; sh.add(el);
      M(new THREE.BoxGeometry(0.62, 1.0, 0.66), dark, 0, -0.5, 0, el, 0.035); const fist = M(new THREE.IcosahedronGeometry(0.55, 0), base, 0, -1.15, 0.05, el, 0.04, 0.55);
      const band = M(new THREE.BoxGeometry(0.66, 0.16, 0.7), toon(RAINBOW[i ? 4 : 1]), 0, -0.75, 0, el, 0); J.paint.push(band); band.userData.home = band.position.clone(); band.userData.rz = 0;
      return { sh, el, fist, s }; });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'giant', variant: name, joints: J, weak, weakMat, weakBase: new THREE.Color('#fff2d6'), slabColor: '#e09bff', calls, height: 5.2, reach: 2.6, phase: 1, boss: true, events: [] });
    return g;
  }
  function enterGiant(g, state) { const U = g.userData; if (state === 'armorBreak') U.phase = Math.min(3, U.phase + 1); U.dead = state === 'die'; }
  function animateGiant(g, state, t, dt) {
    const U = g.userData, J = U.joints, B = J.body, T = J.torso, D = DUR.giant, ph = U.phase;
    B.position.set(0, 0.66, 0); B.rotation.set(0, 0, 0); T.rotation.set(0, 0, 0); T.position.set(0, 1.3, 0); J.head.rotation.set(0, 0, 0);
    let a0 = [0.1, 0, 0.15, -0.2], a1 = [0.1, 0, -0.15, -0.2];
    if (state === 'idle') { const b = Math.sin(t * 0.9); T.position.y += b * 0.03; T.rotation.x = b * 0.02; a0[0] = 0.1 + b * 0.05; a1[0] = 0.1 - b * 0.05; J.head.rotation.y = Math.sin(t * 0.4) * 0.3; }
    else if (state === 'move') { T.rotation.y = Math.sin(t * 1.2) * 0.45; J.head.rotation.y = Math.sin(t * 1.2) * 0.25; a0[2] = 0.15 + Math.sin(t * 1.2) * 0.1; }   // it never steps off the platform: it turns to track you
    else if (state === 'windup') { const k = ease(cl(t / (D.windup * 0.8)));
      if (ph === 1) { a1 = [lerp(0.1, -2.6, k), 0, lerp(-0.15, 0.4, k), lerp(-0.2, -1.0, k)]; T.rotation.y = -0.4 * k; }
      else if (ph === 2) { a0 = [lerp(0.1, -3.0, k), 0, 0.25, -0.4 * k]; a1 = [lerp(0.1, -3.0, k), 0, -0.25, -0.4 * k]; T.rotation.x = -0.18 * k; T.position.y += 0.15 * k; }
      else { a0 = [-0.6 * k, 0, lerp(0.15, 1.4, k), -0.3]; a1 = [-0.6 * k, 0, lerp(-0.15, -1.4, k), -0.3]; T.rotation.x = -0.12 * k; J.head.rotation.x = -0.35 * k; } }
    else if (state === 'attack') { const k = cl(t / D.attack), s = ease(cl(k / 0.5));
      if (ph === 1) { a1 = [lerp(-2.6, 0.8, s), 0, lerp(0.4, -0.1, s), lerp(-1.0, -0.1, s)]; T.rotation.y = lerp(-0.4, 0.35, s); if (k > 0.4 && !U.fired) { U.fired = true; U.events.push('stick'); } }
      else if (ph === 2) { a0 = [lerp(-3.0, 0.7, s), 0, 0.1, -0.1]; a1 = [lerp(-3.0, 0.7, s), 0, -0.1, -0.1]; T.rotation.x = 0.4 * s; T.position.y -= 0.25 * s; if (k > 0.45 && !U.fired) { U.fired = true; U.events.push('slam', 'rain'); } }
      else { a0 = [0.2, 0, lerp(1.4, 0.3, s), -0.3]; a1 = [0.2, 0, lerp(-1.4, -0.3, s), -0.3]; T.rotation.x = 0.1 * s; J.head.rotation.x = 0.2 * s; if (k > 0.4 && !U.fired) { U.fired = true; U.events.push('roar', 'summon'); } } }
    else if (state === 'recover') { T.rotation.x = 0.3; T.position.y -= 0.12; a0 = [0.7, 0, 0.1, -0.1]; a1 = [0.7, 0, -0.1, -0.1]; J.head.rotation.x = 0.3; }
    else if (state === 'hurt') { T.position.x = Math.sin(t * 40) * 0.06 * (1 - cl(t / 0.4)); T.rotation.x = -0.1; }
    else if (state === 'stagger') { T.rotation.z = Math.sin(t * 3) * 0.12; T.rotation.x = 0.18; J.head.rotation.z = Math.sin(t * 4) * 0.2; a0 = [0.4, 0, 0.5, -0.3]; a1 = [0.4, 0, -0.5, -0.3]; }
    else if (state === 'armorBreak') { const k = cl(t / D.armorBreak); T.rotation.x = -0.2 * Math.sin(k * Math.PI); a0 = [-1.2 * Math.sin(k * Math.PI), 0, 0.9, -0.5]; a1 = [-1.2 * Math.sin(k * Math.PI), 0, -0.9, -0.5]; J.head.rotation.x = -0.4 * Math.sin(k * Math.PI); if (t < dt * 1.5) U.events.push('roar'); }
    else if (state === 'die') { const k = ease(cl(t / 2.0)); T.rotation.x = 0.9 * k; T.position.y = 1.3 - 0.9 * k; a0 = [1.2 * k, 0, 0.4, -0.2]; a1 = [1.2 * k, 0, -0.4, -0.2]; J.head.rotation.x = 0.5 * k; if (t > 2.1 && B.visible) { B.visible = false; U.events.push('shatter'); } }
    if (state !== 'die') B.visible = true;
    if (state !== 'attack') U.fired = false;
    // paint: whole in phase 1, flaking in phase 2, gone in phase 3 (core and cracks glow through)
    J.paint.forEach((p, i) => { const keep = ph === 1 || (ph === 2 && i % 2 === 0); p.visible = keep; if (keep) { p.position.copy(p.userData.home); p.rotation.z = p.userData.rz; } });
    if (state === 'armorBreak' && ph >= 2) { const k = cl(t / 1.0); J.paint.forEach((p, i) => { const going = ph === 3 ? i % 2 === 0 : i % 2 === 1; if (!going) return; p.visible = k < 0.95; p.position.copy(p.userData.home).add(new THREE.Vector3((i % 3 - 1) * k * 1.2, -k * k * 2.4, 0.6 * k)); p.rotation.z = p.userData.rz + k * (i % 2 ? 2 : -2); }); }
    if (state === 'hurt' && t < dt * 1.5) U.events.push('paintSplash'); J.drips.forEach((d, i) => { d.visible = ph < 3; d.scale.y = 0.4 + ((t * 0.25 + i * 0.37) % 1) * 1.2; });
    J.cracks.forEach(c => c.visible = ph >= 2); U.weakMat.emissiveIntensity = ph >= 3 ? 1.8 + Math.sin(t * 6) * 0.4 : 1.2;
    J.eyes.forEach(e => e.material.color.set(ph >= 3 ? '#ff7bd5' : '#fff2d6'));
    const set = (A, a) => { A.sh.rotation.set(a[0], a[1], a[2]); A.el.rotation.x = a[3]; }; set(J.arms[0], a0); set(J.arms[1], a1);
  }
  function buildBot(name) {
    const [body, sk] = BOTS[name] || BOTS['Sink Sentry'], S = BOT_SKIN[sk], g = new THREE.Group(), J = {};
    const pm = toon(S.plate), tm = S.glow ? new THREE.MeshToonMaterial({ color: S.trim, emissive: new THREE.Color(S.trim), emissiveIntensity: 0.5, gradientMap: toon('#fff').gradientMap }) : toon(S.trim), dm = toon(S.dark), eyeM = new THREE.MeshBasicMaterial({ color: S.eye });
    const weakMat = new THREE.MeshToonMaterial({ color: '#ffffff', emissive: new THREE.Color(S.eye), emissiveIntensity: 0.9, gradientMap: toon('#fff').gradientMap });
    const root = new THREE.Group(); g.add(root); J.root = root; let weak, height = 1.6, reach = 0;
    const plate = (w, h, d, x, y, z, par, m = pm) => S.bare && m === pm ? M(rbox(w * 0.6, h, d * 0.6), dm, x, y, z, par, 0.02) : M(rbox(w, h, d), m, x, y, z, par, 0.025);
    if (body === 'sentry') {
      J.legs = [0, 1, 2].map(i => { const a = i / 3 * Math.PI * 2 + Math.PI; const p = new THREE.Group(); p.position.set(0, 0.9, 0); p.rotation.y = a; root.add(p); const l = M(new THREE.CylinderGeometry(0.05, 0.07, 1.05, 6), dm, 0, -0.4, 0.32, p, 0.015, 0.07); l.rotation.x = 0.55; M(rbox(0.2, 0.08, 0.26), tm, 0, -0.86, 0.62, p, 0.015); return p; });
      const tor = new THREE.Group(); tor.position.y = 0.95; root.add(tor); J.torso = tor;
      plate(0.75, 0.6, 0.6, 0, 0.25, 0, tor); M(rbox(0.79, 0.1, 0.64), tm, 0, 0.02, 0, tor, 0.01);
      weak = M(rbox(0.34, 0.34, 0.12), weakMat, 0, 0.28, -0.34, tor, 0.015);   // the power cell on its back
      const hd = new THREE.Group(); hd.position.y = 0.66; tor.add(hd); J.head = hd; plate(0.5, 0.32, 0.44, 0, 0.1, 0, hd);
      const vis = new THREE.Mesh(rbox(0.36, 0.08, 0.02), eyeM); vis.position.set(0, 0.14, 0.23); hd.add(vis); J.visor = vis;
      J.barrels = new THREE.Group(); J.barrels.position.set(0, 0.06, 0.3); hd.add(J.barrels); for (const [x, y] of [[-0.08, 0.05], [0.08, 0.05], [-0.08, -0.07], [0.08, -0.07]]) { const b = M(new THREE.CylinderGeometry(0.035, 0.035, 0.46, 8), dm, x, y, 0.2, J.barrels, 0.01, 0.035); b.rotation.x = Math.PI / 2; }
      if (S.stripes) for (let i = 0; i < 3; i++) M(rbox(0.77, 0.06, 0.62), dm, 0, 0.12 + i * 0.16, 0, tor, 0);
      height = 1.85; }
    else if (body === 'charger') {
      const ch = new THREE.Group(); ch.position.y = 0.42; root.add(ch); J.torso = ch;
      plate(1.0, 0.5, 1.5, 0, 0.1, 0, ch); M(rbox(1.04, 0.1, 1.54), tm, 0, -0.12, 0, ch, 0.01);
      J.wheels = []; for (const s of [-1, 1]) for (const z of [-0.5, 0.5]) { const w = M(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 12), dm, s * 0.58, -0.12, z, ch, 0.02, 0.3); w.rotation.z = Math.PI / 2; J.wheels.push(w); }
      const ram = M(rbox(1.1, 0.42, 0.16), tm, 0, 0.0, 0.83, ch, 0.02); for (const s of [-1, 1]) { const h = M(new THREE.ConeGeometry(0.1, 0.42, 6), tm, s * 0.34, 0.06, 1.05, ch, 0.012); h.rotation.x = Math.PI / 2; }
      const hd = new THREE.Group(); hd.position.set(0, 0.42, 0.42); ch.add(hd); J.head = hd; plate(0.5, 0.26, 0.4, 0, 0, 0, hd);
      const vis = new THREE.Mesh(rbox(0.38, 0.07, 0.02), eyeM); vis.position.set(0, 0.02, 0.21); hd.add(vis); J.visor = vis;
      weak = M(rbox(0.5, 0.22, 0.4), weakMat, 0, 0.42, -0.45, ch, 0.015);   // the engine block, open while it is stunned
      J.exhaust = [-0.22, 0.22].map(x => { const e = M(new THREE.CylinderGeometry(0.06, 0.07, 0.3, 8), dm, x, 0.55, -0.62, ch, 0.01, 0.07); return e; });
      if (S.stripes) for (let i = 0; i < 4; i++) M(rbox(1.02, 0.52, 0.12), dm, 0, 0.1, -0.55 + i * 0.36, ch, 0);
      height = 1.25; }
    else {
      const hips = new THREE.Group(); hips.position.y = 1.15; root.add(hips); J.hips = hips;
      J.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.34, 0, 0); hips.add(p); plate(0.32, 0.6, 0.36, 0, -0.3, 0, p, dm); plate(0.38, 0.55, 0.44, 0, -0.85, 0.04, p); M(rbox(0.46, 0.14, 0.62), tm, 0, -1.08, 0.1, p, 0.015); return { p, s }; });
      const tor = new THREE.Group(); hips.add(tor); J.torso = tor;
      plate(1.2, 0.95, 0.75, 0, 0.6, 0, tor); M(rbox(1.24, 0.14, 0.79), tm, 0, 0.18, 0, tor, 0.015);
      weak = M(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16), weakMat, 0, 0.7, 0.4, tor, 0.015, 0.2); weak.rotation.x = Math.PI / 2;   // the chest core
      const hd = new THREE.Group(); hd.position.y = 1.25; tor.add(hd); J.head = hd; plate(0.5, 0.42, 0.48, 0, 0, 0, hd);
      const vis = new THREE.Mesh(rbox(0.4, 0.1, 0.02), eyeM); vis.position.set(0, 0.04, 0.25); hd.add(vis); J.visor = vis;
      if (S.crown) for (let i = 0; i < 5; i++) M(new THREE.ConeGeometry(0.05, 0.2, 4), tm, -0.18 + i * 0.09, 0.3, 0, hd, 0.01);
      J.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 0.78, 1.0, 0); tor.add(sh); M(rbox(0.5, 0.36, 0.56), tm, 0, 0.08, 0, sh, 0.02); plate(0.28, 0.6, 0.3, 0, -0.35, 0, sh, dm); const el = new THREE.Group(); el.position.y = -0.66; sh.add(el); plate(0.32, 0.55, 0.34, 0, -0.27, 0, el); return { sh, el, s }; });
      // left arm: a tower shield. right arm: a hammer.
      plate(0.12, 1.1, 0.8, -0.2, -0.4, 0.1, J.arms[0].el, tm); M(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), dm, 0, -0.75, 0.25, J.arms[1].el, 0.012, 0.05).rotation.x = Math.PI / 2;
      J.hammer = M(rbox(0.6, 0.38, 0.38), dm, 0, -0.75, 0.82, J.arms[1].el, 0.025); M(rbox(0.64, 0.08, 0.42), tm, 0, -0.75, 0.82, J.arms[1].el, 0);
      if (S.stripes) for (let i = 0; i < 3; i++) M(rbox(1.22, 0.08, 0.77), dm, 0, 0.4 + i * 0.22, 0, tor, 0);
      height = 2.65; reach = 1.9; }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    // one signature detail per world skin, so you can tell the worlds apart at a glance
    const hd = J.head, tr = J.torso, top = body === 'charger' ? 0.4 : body === 'sentry' ? 0.58 : 1.12;
    if (sk === 'sink') { J.drips = [-0.25, 0.05, 0.3].map((x, i) => { const d = M(new THREE.SphereGeometry(0.035, 6, 5), new THREE.MeshBasicMaterial({ color: '#5fc8e8' }), x, 0, 0.3, tr, 0); d.userData.x = x; d.userData.ph = i * 0.33; return d; }); M(new THREE.TorusGeometry(0.12, 0.03, 6, 12), toon('#a8603a'), 0.22, top * 0.6, 0.3, tr, 0.01); }   // dripping, a rusty pipe ring
    if (sk === 'furnace') J.vents = [-1, 1].map(s => M(new THREE.CylinderGeometry(0.06, 0.08, 0.28, 8), toon('#231b18'), s * 0.25, top + 0.08, -0.15, tr, 0.01, 0.08));   // smoke stacks
    if (sk === 'hive') { const wmH = new THREE.MeshBasicMaterial({ color: '#fff4c0', transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }); J.hwings = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.15, top * 0.85, -0.3); tr.add(p); const w = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.18), wmH); w.position.x = s * 0.26; p.add(w); return { p, s }; }); }   // bee wings
    if (sk === 'gate') { const c = M(rbox(0.06, 0.22, 0.32), toon('#c9a24a'), 0, 0.28, -0.02, hd, 0.01); }   // gold crest
    if (sk === 'fort') for (const s of [-1, 1]) { const sb = M(new THREE.CapsuleGeometry(0.08, 0.18, 4, 8), toon('#a89870'), s * (body === 'warden' ? 0.8 : 0.42), top * 0.95, 0, tr, 0.012); sb.rotation.z = Math.PI / 2; }   // sandbag shoulders
    if (sk === 'blackout') { const st = M(new THREE.BoxGeometry(0.5, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: '#ec3013' }), 0, top * 0.5, 0.31, tr, 0); J.stripe = st; }   // red scan stripe
    if (sk === 'frame' || sk === 'grey') J.gears = [0.2, -0.2].map((x, i) => { const gr = M(new THREE.TorusGeometry(0.1, 0.03, 4, 8), toon('#c9a24a'), x, top * 0.5, 0.18, tr, 0.008); return gr; });   // exposed gears turning
    if (sk === 'plated') for (let i = 0; i < 6; i++) M(new THREE.SphereGeometry(0.025, 6, 4), toon('#cfd6dc'), -0.25 + i * 0.1, top * 0.75, 0.31, tr, 0);   // rivets
    if (sk === 'factor') { const cape = new THREE.Group(); cape.position.set(0, top, -0.36); tr.add(cape); M(new THREE.PlaneGeometry(0.9, 1.0).translate(0, -0.5, 0), toon('#7a1d2a', { side: THREE.DoubleSide }), 0, 0, 0, cape, 0); J.fcape = cape; }   // the Factor's cape
    if (body === 'charger') { const pl = M(rbox(1.3, 0.3, 0.2), toon(S.trim === '#1a1a1e' ? '#9aa0a8' : S.trim), 0, -0.12, 1.0, tr, 0.02); pl.rotation.x = -0.35; }   // ram plough
    // extra for the whole family: an antenna that blinks green on patrol, red when it spots you
    { const ant = M(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 5), toon('#3a3a44'), 0.14, 0.32, -0.06, hd, 0.005); J.antTip = M(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: '#5cff6a' }), 0.14, 0.48, -0.06, hd, 0); }
    Object.assign(g.userData, { family: body, variant: name, joints: J, weak, weakMat, weakBase: new THREE.Color(S.eye), slabColor: S.eye, calls, height, reach, ranged: body === 'sentry', laneAngles: body === 'sentry' ? [0] : null, charge: body === 'charger', events: [] });
    return g;
  }
  function animateBot(g, state, t, dt) {
    const U = g.userData, J = U.joints, body = U.family, D = DUR[body];
    J.root.position.set(0, 0, 0); J.root.rotation.set(0, 0, 0); J.torso.rotation.set(0, 0, 0); J.head.rotation.set(0, 0, 0); g.visible = state !== 'die' || g.visible;
    let vis = 1;
    if (body === 'sentry') { let spin = 0;
      if (state === 'idle') { J.head.rotation.y = Math.sin(t * 0.8) * 0.7; vis = 0.6 + 0.4 * Math.sin(t * 3); }
      else if (state === 'move') { J.legs.forEach((p, i) => p.rotation.x = Math.sin(t * 8 + i * 2.1) * 0.15); J.root.position.y = Math.abs(Math.sin(t * 8)) * 0.03; }
      else if (state === 'windup') { const k = cl(t / D.windup); spin = k * 30; J.torso.rotation.x = -0.05 * k; vis = 1 + k * 1.5 * (0.5 + 0.5 * Math.sin(t * 30)); }
      else if (state === 'attack') { spin = 30; J.root.position.z = -Math.abs(Math.sin(t * 40)) * 0.04; vis = 2; [0.05, 0.2, 0.35].forEach((at, i) => { if (t >= at && !(U.shot > i)) { U.shot = i + 1; U.events.push('bolt'); } }); }
      else if (state === 'recover') { J.head.rotation.x = 0.25; J.torso.rotation.x = 0.08; vis = 0.3; }
      else if (state === 'hurt') J.root.position.x = Math.sin(t * 60) * 0.04;
      else if (state === 'stagger') { J.head.rotation.y = Math.sin(t * 9) * 0.6; J.torso.rotation.z = Math.sin(t * 5) * 0.12; vis = Math.random() > 0.5 ? 1 : 0.1; }
      else if (state === 'armorBreak') J.torso.rotation.x = -0.2 * Math.sin(cl(t / 0.8) * Math.PI);
      else if (state === 'die') { const k = ease(cl(t / 0.8)); J.legs.forEach((p, i) => p.rotation.x = 0.5 * k); J.root.position.y = -0.55 * k; J.head.rotation.x = 0.6 * k; vis = 0; if (t > 1.0 && g.visible) { g.visible = false; U.events.push('explode'); } }
      J.barrelRot = (J.barrelRot || 0) + spin * dt; J.barrels.rotation.z = J.barrelRot; if (state !== 'attack') U.shot = 0; }
    else if (body === 'charger') { let wheel = 0;
      if (state === 'idle') { J.torso.position.y = 0.42 + Math.sin(t * 20) * 0.006; vis = 0.8; }
      else if (state === 'move') { wheel = 8; J.torso.rotation.x = -0.03; }
      else if (state === 'windup') { const k = cl(t / D.windup); wheel = 18 * k; J.torso.rotation.x = 0.08 * k; J.root.position.z = -0.25 * k; J.torso.position.y = 0.42 + Math.sin(t * 50) * 0.02 * k; vis = 1.5; if (Math.floor(t * 8) !== U.puff) { U.puff = Math.floor(t * 8); U.events.push('rev'); } }
      else if (state === 'attack') { wheel = 30; J.torso.rotation.x = -0.08; vis = 2; }
      else if (state === 'recover') { wheel = 0; vis = 0.5; }
      else if (state === 'hurt') J.root.position.x = Math.sin(t * 60) * 0.04;
      else if (state === 'stagger') { J.torso.rotation.z = Math.sin(t * 7) * 0.08; J.head.rotation.y = Math.sin(t * 6) * 0.5; vis = Math.random() > 0.5 ? 1 : 0.1; if (Math.floor(t * 3) !== U.spark) { U.spark = Math.floor(t * 3); U.events.push('spark'); } }
      else if (state === 'armorBreak') J.torso.rotation.x = -0.15 * Math.sin(cl(t / 0.8) * Math.PI);
      else if (state === 'die') { const k = ease(cl(t / 0.6)); J.torso.rotation.z = 0.4 * k; J.root.position.y = -0.15 * k; vis = 0; if (t > 0.8 && g.visible) { g.visible = false; U.events.push('explode'); } }
      J.wheels.forEach(w => w.rotation.x += wheel * dt); J.exhaust.forEach(e => e.scale.y = 1 + (state === 'windup' ? 0.15 * Math.sin(t * 40) : 0)); }
    else { let a0 = [0.15, 0, 0.1, -0.3], a1 = [0.1, 0, -0.1, -0.2], legA = 0; J.hips.position.y = 1.15;
      if (state === 'idle') { const b = Math.sin(t * 1.4); J.torso.rotation.x = b * 0.02; a1[0] = 0.1 + b * 0.05; J.head.rotation.y = Math.sin(t * 0.5) * 0.3; }
      else if (state === 'move') { const w = t * 5; legA = Math.sin(w) * 0.38; J.hips.position.y = 1.15 - Math.abs(Math.cos(w)) * 0.05; J.torso.rotation.y = Math.sin(w) * 0.08; }
      else if (state === 'windup') { const k = ease(cl(t / (D.windup * 0.8))); a1 = [lerp(0.1, -2.9, k), 0, -0.2, lerp(-0.2, -0.5, k)]; a0 = [lerp(0.15, -0.9, k), 0, 0.3, -0.9]; J.torso.rotation.x = -0.15 * k; J.torso.rotation.y = -0.2 * k; vis = 1 + k; }
      else if (state === 'attack') { const k = cl(t / D.attack), s = ease(cl(k / 0.45)); a1 = [lerp(-2.9, 0.6, s), 0, -0.1, -0.1]; a0 = [-0.9, 0, 0.3, -0.9]; J.torso.rotation.x = 0.35 * s; J.hips.position.y = 1.15 - 0.12 * s; if (k > 0.45 && !U.slammed) { U.slammed = true; U.events.push('slam'); } vis = 2; }
      else if (state === 'recover') { J.torso.rotation.x = 0.28; J.hips.position.y = 1.08; a1 = [0.6, 0, -0.1, -0.1]; a0 = [0.5, 0, 0.4, -0.1]; vis = 0.4; }
      else if (state === 'hurt') { J.torso.position.x = Math.sin(t * 50) * 0.03; a0 = [-0.9, 0, 0.3, -0.9]; }
      else if (state === 'stagger') { J.torso.rotation.z = Math.sin(t * 4) * 0.14; legA = Math.sin(t * 4) * 0.12; a0 = [0.4, 0, 0.6, -0.2]; a1 = [0.4, 0, -0.6, -0.2]; vis = Math.random() > 0.5 ? 1 : 0.1; }
      else if (state === 'armorBreak') { const k = cl(t / D.armorBreak); J.torso.rotation.x = -0.2 * Math.sin(k * Math.PI); if (t < dt * 1.5) U.events.push('spark'); }
      else if (state === 'die') { const k = ease(cl(t / 1.2)); J.hips.position.y = 1.15 - 0.55 * k; J.torso.rotation.x = 0.7 * k; a0 = [0.9 * k, 0, 0.4, 0]; a1 = [0.9 * k, 0, -0.4, 0]; J.legs.forEach(L => L.p.rotation.x = -1.2 * k); vis = 0; if (t > 1.3 && g.visible) { g.visible = false; U.events.push('explode'); } }
      if (state !== 'die') J.legs.forEach(L => L.p.rotation.set(L.s * legA, 0, 0)); if (state !== 'attack') U.slammed = false;
      const set = (A, a) => { A.sh.rotation.set(a[0], a[1], a[2]); A.el.rotation.x = a[3]; }; set(J.arms[0], a0); set(J.arms[1], a1); }
    if (state !== 'die') g.visible = true;
    J.visor.scale.set(1, Math.max(0.05, vis), 1);
    { const alert = state === 'windup' || state === 'attack'; J.antTip.material.color.set(alert ? (Math.sin(t * 30) > 0 ? '#ec3013' : '#3a0a0a') : (Math.sin(t * 2) > 0.6 ? '#5cff6a' : '#1f4a24')); }
    if (J.drips) J.drips.forEach(d => { const k2 = (t * 0.7 + d.userData.ph) % 1; d.position.y = -k2 * 0.6; d.scale.setScalar(k2 < 0.9 ? 1 : (1 - k2) * 10); });
    if (J.hwings) J.hwings.forEach(w => w.p.rotation.y = w.s * (0.3 + Math.sin(t * 60) * 0.35));
    if (J.vents && state === 'idle' && Math.random() < dt * 1.2) U.events.push('smoke'); if (J.vents && (state === 'windup' || state === 'attack') && Math.random() < dt * 8) U.events.push('smoke');
    if (J.gears) J.gears.forEach((gr, i) => gr.rotation.z = t * (i ? -2 : 2));
    if (J.stripe) J.stripe.position.y = J.stripe.position.y * 0 + (0.3 + Math.sin(t * 3) * 0.25);
    if (J.fcape) J.fcape.rotation.x = 0.1 + Math.sin(t * 1.6) * 0.06 + (state === 'move' ? 0.3 : 0) - J.torso.rotation.x;
    if (body === 'charger' && state === 'attack' && Math.floor(t * 12) !== U.dst) { U.dst = Math.floor(t * 12); U.events.push('dust'); }   // dust trail on the charge U.weakMat.emissiveIntensity = 0.9 + (state === 'recover' || state === 'stagger' ? 0.8 : 0);
  }
  function buildFlamingo(name) {
    const g = new THREE.Group(), J = {}, pink = toon('#ff7fb0'), deep = toon('#e8508a'), pale = toon('#ffc2d9'), leg = toon('#e8709a'), blk = toon('#1a1a1e');
    const body = new THREE.Group(); body.position.y = 1.15; g.add(body); J.body = body;
    const b = M(new THREE.SphereGeometry(0.3, 16, 12), pink, 0, 0, 0, body, 0.025, 0.3); b.scale.set(0.85, 0.75, 1.35);
    const tail = M(new THREE.ConeGeometry(0.14, 0.3, 6), deep, 0, 0.05, -0.45, body, 0.015); tail.rotation.x = -1.9;
    J.wings = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.22, 0.08, 0.05); body.add(p); const w = M(new THREE.SphereGeometry(0.22, 12, 8), deep, s * 0.04, 0, -0.08, p, 0.015, 0.22); w.scale.set(0.3, 0.6, 1.4); const tip = M(new THREE.BoxGeometry(0.04, 0.12, 0.26), blk, s * 0.05, -0.04, -0.36, p, 0.01); return { p, s }; });
    // neck: three links so it can S-curve, preen and snap round
    let par = body; J.neck = [0, 1, 2].map(i => { const n = new THREE.Group(); n.position.set(0, i ? 0.32 : 0.12, i ? 0 : 0.3); par.add(n); M(new THREE.CylinderGeometry(0.05, 0.06, 0.34, 8), pink, 0, 0.16, 0, n, 0.012, 0.06); par = n; return n; });
    const head = new THREE.Group(); head.position.y = 0.34; par.add(head); J.head = head;
    M(new THREE.SphereGeometry(0.09, 12, 9), pale, 0, 0, 0, head, 0.012, 0.09);
    const beak = new THREE.Group(); beak.position.set(0, -0.01, 0.07); head.add(beak); const bk = M(new THREE.CylinderGeometry(0.035, 0.05, 0.16, 8), pale, 0, 0, 0.07, beak, 0.01, 0.05); bk.rotation.x = Math.PI / 2; const tip = M(new THREE.ConeGeometry(0.035, 0.12, 8), blk, 0, -0.04, 0.17, beak, 0.01); tip.rotation.x = Math.PI / 2 + 0.9; J.beak = beak;
    for (const s of [-1, 1]) { const e = M(new THREE.SphereGeometry(0.022, 8, 6), toon('#ffd23a'), s * 0.065, 0.025, 0.04, head, 0); M(new THREE.SphereGeometry(0.011, 6, 5), blk, s * 0.072, 0.025, 0.055, head, 0); }
    // legs: thigh pivot, backward knee, foot
    J.legs = [-1, 1].map(s => { const hip = new THREE.Group(); hip.position.set(s * 0.08, -0.1, 0.02); body.add(hip); M(new THREE.CylinderGeometry(0.02, 0.022, 0.5, 6), leg, 0, -0.25, 0, hip, 0.008, 0.022); const knee = new THREE.Group(); knee.position.y = -0.5; hip.add(knee); M(new THREE.SphereGeometry(0.03, 6, 5), leg, 0, 0, 0, knee, 0.008); M(new THREE.CylinderGeometry(0.018, 0.02, 0.5, 6), leg, 0, -0.25, 0, knee, 0.008, 0.02); const ft = M(new THREE.BoxGeometry(0.1, 0.02, 0.14), leg, 0, -0.5, 0.04, knee, 0.008); return { hip, knee, s }; });
    const weakMat = new THREE.MeshToonMaterial({ color: '#e8709a', emissive: new THREE.Color('#ff7fb0'), emissiveIntensity: 0, gradientMap: toon('#fff').gradientMap });
    J.legs.forEach(L => L.hip.children[0].material = weakMat);
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'flamingo', variant: name, joints: J, weak: J.legs[0].hip.children[0], weakMat, weakBase: new THREE.Color('#ff7fb0'), calls, height: 2.0, reach: 1.0, flock: true, events: [] });
    return g;
  }
  function animateFlamingo(g, state, t, dt, opts = {}) {
    const U = g.userData, J = U.joints, B = J.body, D = DUR.flamingo;
    B.position.set(0, 1.15, 0); B.rotation.set(0, 0, 0); g.rotation.z = 0;
    let n = [0.5, -0.9, 0.5], hy = 0, wing = 0, l0 = [0, 0], l1 = [0, 0], beak = 0;
    if (state === 'idle') { const p = (t + (opts.off || 0)) % 7; l1 = [-0.9, 2.1]; B.position.y += Math.sin(t * 1.2) * 0.01; hy = Math.sin(t * 0.6 + (opts.off || 0)) * 0.6; if (p > 5 && p < 6.5) { n = [1.2, -1.6, 1.9]; hy = 2.2; } }   // one leg; sometimes preens under the wing
    else if (state === 'move') { const w = t * 8; l0 = [Math.sin(w) * 0.6, Math.max(0, -Math.sin(w)) * 1.2]; l1 = [-Math.sin(w) * 0.6, Math.max(0, Math.sin(w)) * 1.2]; B.position.y += Math.abs(Math.sin(w)) * 0.03; n = [0.7, -0.9, 0.4]; }
    else if (state === 'windup') { const k = ease(cl(t / 0.12)); n = [lerp(0.5, -0.1, k), lerp(-0.9, -0.3, k), lerp(0.5, 0.6, k)]; hy = 0; wing = k * 1.1; B.rotation.x = 0.1 * k; beak = t > 0.2 && t < 0.4 ? 0.5 : 0; if (t > 0.2 && !U.honk) { U.honk = true; U.events.push('honk'); } }   // every head snaps round at once
    else if (state === 'attack') { const w = t * 16, k = cl(t / D.attack); l0 = [Math.sin(w) * 0.9, Math.max(0, -Math.sin(w)) * 1.3]; l1 = [-Math.sin(w) * 0.9, Math.max(0, Math.sin(w)) * 1.3]; wing = 0.9 + Math.sin(t * 20) * 0.5; B.rotation.x = 0.35; n = [1.2, -0.2, 0.2]; B.position.z = k * 1.6; if (k > 0.7) { n = [1.6, 0.1, 0.4]; beak = 0.4; } }
    else if (state === 'recover') { B.rotation.z = Math.sin(t * 5) * 0.12; wing = 0.3; l0 = [0.3, 0.4]; l1 = [-0.4, 0.2]; n = [0.9, -0.6, 0.6]; B.position.z = 1.6; }
    else if (state === 'hurt') { B.position.x = Math.sin(t * 60) * 0.03; wing = 0.8; n = [0.2, -0.4, 0.9]; beak = 0.5; }
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 6) * 0.3; l0 = [Math.sin(t * 6) * 0.4, 0.5]; l1 = [-Math.sin(t * 6) * 0.4, 0.5]; n = [0.8 + Math.sin(t * 7) * 0.4, -0.9, 0.6]; hy = Math.sin(t * 9) * 0.8; wing = 0.4; }
    else if (state === 'armorBreak') { wing = 1.3 * Math.sin(cl(t / 0.8) * Math.PI); if (t < dt * 1.5) U.events.push('feathers'); }
    else if (state === 'die') { const k = ease(cl(t / 0.9)); l0 = [0.4 * k, 2.2 * k]; l1 = [-0.3 * k, 2.2 * k]; B.position.y = lerp(1.15, 0.25, k); g.rotation.z = 1.3 * k; n = [1.4 * k, 0.4 * k, 0.3]; wing = 0.6 * (1 - k); if (t > 0.6 && !U.puffed) { U.puffed = true; U.events.push('feathers'); } }
    if (state !== 'windup') U.honk = false; if (state !== 'die') U.puffed = false;
    J.neck.forEach((q, i) => q.rotation.x = n[i]); J.neck[0].rotation.y = hy * 0.5; J.head.rotation.y = hy * 0.3;
    J.wings.forEach(w => w.p.rotation.set(0, 0, w.s * wing)); J.beak.rotation.x = beak;
    J.legs.forEach((L, i) => { const q = i ? l1 : l0; L.hip.rotation.x = q[0]; L.knee.rotation.x = q[1]; });
    if (!opts.off) { const per = state === 'move' || state === 'attack' ? 0.3 : 1.6; if (Math.floor(t / per) !== U.rp) { U.rp = Math.floor(t / per); if (state !== 'die') U.events.push('ripple'); } if (state === 'attack' && Math.floor(t * 6) !== U.hk) { U.hk = Math.floor(t * 6); if (U.hk % 2 === 0) U.events.push('honk'); } if (state === 'idle' && Math.random() < dt * 0.25) U.events.push('feather1'); }
  }
  function buildSerpent(name) {
    const drain = /Drain|Cistern/.test(name), W = WYRM[name], g = new THREE.Group(), J = {}, N = 16;
    const scale = toon(W ? W[0] : drain ? '#3f5a4a' : '#c9a35c'), belly = toon(W ? W[1] : drain ? '#9fb59a' : '#f1dcae'), spine = toon(W ? W[2] : drain ? '#2a3a32' : '#8a6a3a');
    J.segs = []; for (let i = 0; i < N; i++) { const r = 0.34 * (1 - i / N * 0.7); const s = new THREE.Group(); g.add(s); const m = M(new THREE.SphereGeometry(r, 14, 10), scale, 0, 0, 0, s, 0.025, r); m.scale.set(1, 0.9, 1.25); if (i % 2 === 0) { const f = M(new THREE.ConeGeometry(r * 0.35, r * 0.9, 4), spine, 0, r * 0.9, 0, s, 0.01); f.rotation.x = -0.4; } const bl = M(new THREE.SphereGeometry(r * 0.8, 10, 8), belly, 0, -r * 0.35, 0, s, 0); bl.scale.set(1, 0.6, 1.2); J.segs.push(s); }
    const head = new THREE.Group(); g.add(head); J.head = head;
    const skull = M(new THREE.SphereGeometry(0.4, 16, 12), scale, 0, 0.06, 0.2, head, 0.03, 0.4); skull.scale.set(0.82, 0.55, 1.05); M(new THREE.BoxGeometry(0.66, 0.12, 0.3), spine, 0, 0.26, 0.05, head, 0.02);
    for (const s of [-1, 1]) { const h = M(new THREE.ConeGeometry(0.07, 0.36, 5), spine, s * 0.22, 0.32, -0.12, head, 0.012); h.rotation.x = -1.0; }
    const weakMat = new THREE.MeshToonMaterial({ color: '#fff4c8', emissive: new THREE.Color(drain ? '#5fe3ff' : '#ffb020'), emissiveIntensity: 0.9, gradientMap: toon('#fff').gradientMap });
    const eyes = W ? [-1, 0, 1].map(s => { const p = M(new THREE.SphereGeometry(0.06, 8, 6), weakMat, s * 0.16, 0.25, 0.4, head, 0.01, 0.06); p.scale.set(1, 0.4, 1); return p; }) : [-1, 1].map(s => M(new THREE.SphereGeometry(0.08, 10, 8), weakMat, s * 0.25, 0.16, 0.42, head, 0.012, 0.08));   // the Wyrm is blind: sensing pits instead of eyes
    const jaw = new THREE.Group(); jaw.position.set(0, -0.08, 0.0); head.add(jaw); M(new THREE.BoxGeometry(0.56, 0.14, 0.7), belly, 0, -0.04, 0.32, jaw, 0.025); J.jaw = jaw;
    J.frill = new THREE.Group(); J.frill.position.set(0, 0.1, -0.1); head.add(J.frill); for (let i = 0; i < 7; i++) { const a = (i / 6 - 0.5) * 2.6; const f = M(new THREE.ConeGeometry(0.06, 0.5, 4), toon(drain ? '#6b9a7a' : W ? '#d8c0b0' : '#e07a3a'), Math.sin(a) * 0.25, Math.cos(a) * 0.2, -0.05, J.frill, 0.008); f.rotation.z = -a; }   // a frill that flares
    J.tongue = new THREE.Group(); J.tongue.position.set(0, -0.02, 0.6); head.add(J.tongue); M(new THREE.BoxGeometry(0.03, 0.01, 0.3).translate(0, 0, 0.15), toon('#c42d3c'), 0, 0, 0, J.tongue, 0); for (const s of [-1, 1]) { const fk2 = M(new THREE.BoxGeometry(0.02, 0.01, 0.08), toon('#c42d3c'), s * 0.02, 0, 0.32, J.tongue, 0); fk2.rotation.y = s * 0.4; }
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const tth = M(new THREE.ConeGeometry(0.035, 0.12, 4), toon('#fffaf0'), s * (0.22 - i * 0.02), -0.06, 0.6 - i * 0.12, head, 0); tth.rotation.x = Math.PI; }
    J.mounds = []; for (let i = 0; i < N + 1; i++) { const md = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 6), toon(drain ? '#4a6a6a' : '#e0c48a')); md.scale.set(1, 0.18, 1.2); md.visible = false; g.add(md); J.mounds.push(md); }
    if (name === 'Convoy Wyrm') for (const [i, c] of [[5, '#8a6a3a'], [9, '#6b7348']]) { const cr = M(new THREE.BoxGeometry(0.4, 0.3, 0.35), toon(c), 0, 0.32, 0, J.segs[i], 0.02); cr.rotation.y = 0.4; }   // the convoy it swallowed, still strapped on
    if (drain) { J.water = new THREE.Mesh(new THREE.CircleGeometry(2.15, 40), new THREE.MeshBasicMaterial({ color: 0x2a4a5a, transparent: true, opacity: 0.55, depthWrite: false })); J.water.rotation.x = -Math.PI / 2; J.water.position.y = 0.03; g.add(J.water); }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'serpent', variant: name, joints: J, weak: eyes[0], weakMat, weakBase: new THREE.Color(drain ? '#5fe3ff' : '#ffb020'), slabColor: drain ? '#9fb59a' : '#e0c48a', calls, height: 2.6, reach: 0, burrow: true, frame: 2.4, blind: !!W, trail: [], hp: new THREE.Vector3(1.4, -0.4, 0), events: [] });
    return g;
  }
  function animateSerpent(g, state, t, dt) {
    const U = g.userData, J = U.joints, D = DUR.serpent, T = new THREE.Vector3(); let jaw = 0.1, rate = 8, lie = false;
    if (state === 'idle' || state === 'move') { const sp = state === 'move' ? 1.6 : 0.7, a = t * sp; T.set(Math.cos(a) * 1.35, -0.42 + Math.sin(a * 3) * 0.28, Math.sin(a) * 1.35); }
    else if (state === 'windup' && U.blind) { T.set(Math.sin(t * 3.2) * 0.5, 0.7, 0.9); jaw = 0.25; rate = 6; if (t > D.windup * 0.8 && !U.lock) { U.lock = true; U.events.push('lockon'); } }   // listens, head swaying, then locks onto the sound
    else if (state === 'windup') { const k = cl(t / D.windup); T.set(Math.sin(t * 9) * 0.1, -0.3, lerp(-1.6, 1.0, k)); rate = 14; if (Math.floor(t * 6) !== U.rum) { U.rum = Math.floor(t * 6); U.events.push('rumble'); } }   // the dune line racing at you
    else if (state === 'attack') { const k = cl(t / D.attack); if (k < 0.35) { const q = k / 0.35; T.set(0, lerp(-0.3, 2.6, ease(q)), lerp(1.0, 1.5, q)); jaw = 0.9; if (!U.burst) { U.burst = true; U.events.push('burst'); } } else { const q = (k - 0.35) / 0.65; T.set(0, 2.6 - q * q * 3.4, 1.5 + q * 1.6); jaw = lerp(0.9, 0.1, q); } rate = 20; }
    else if (state === 'recover') { T.set(Math.sin(t * 0.8) * 0.2, 0.42, 2.0 - t * 0.15); jaw = 0.35; lie = true; rate = 5; }
    else if (state === 'hurt') { T.set(Math.sin(t * 50) * 0.08, 1.4, 1.4); jaw = 0.7; rate = 14; }
    else if (state === 'stagger') { T.set(Math.sin(t * 3) * 0.6, 1.1 + Math.sin(t * 5) * 0.2, 1.3); jaw = 0.5; rate = 6; }
    else if (state === 'armorBreak') { T.set(0, 2.2, 1.0); jaw = 0.8; rate = 10; if (t < dt * 1.5) U.events.push('scales'); }
    else if (state === 'die') { if (t < 0.9) { T.set(0, 2.4, 1.2); jaw = 0.9; } else { const q = ease(cl((t - 0.9) / 0.8)); T.set(0, lerp(2.4, 0.36, q), lerp(1.2, 2.0, q)); jaw = 0.5; lie = true; } rate = 8; if (t > 1.7 && !U.thud) { U.thud = true; U.events.push('thud'); } }
    if (state !== 'attack') U.burst = false; if (state !== 'die') U.thud = false; if (state !== 'windup') U.lock = false;
    U.hp.lerp(T, 1 - Math.exp(-rate * dt));
    const tr = U.trail; if (!tr.length) for (let i = 0; i < 80; i++) tr.push(U.hp.clone().add(new THREE.Vector3(0, -i * 0.05, -i * 0.05)));
    if (tr[0].distanceTo(U.hp) > 0.06) { tr.unshift(U.hp.clone()); if (tr.length > 90) tr.pop(); }
    if (lie) for (let i = 4; i < tr.length; i++) tr[i].y = lerp(tr[i].y, Math.max(0.3 - i * 0.002, tr[i].y < 0 ? tr[i].y : 0.3), 1 - Math.exp(-3 * dt));
    { const fl = state === 'windup' || state === 'attack' ? 1.4 : state === 'die' ? 0.3 : 0.55; J.frill.scale.setScalar(lerp(J.frill.scale.x, fl, 1 - Math.exp(-8 * dt))); const fk = (t * 0.6) % 2; J.tongue.scale.z = state === 'idle' && fk < 0.3 ? Math.sin(fk / 0.3 * Math.PI) : 0.01; }
    J.head.position.copy(U.hp); const look = tr[3] || tr[tr.length - 1]; J.head.lookAt(U.hp.clone().multiplyScalar(2).sub(look)); J.jaw.rotation.x = jaw;
    J.head.visible = U.hp.y > -0.15; J.mounds[0].visible = U.hp.y < 0.05 && U.hp.y > -0.75; J.mounds[0].position.set(U.hp.x, 0.02, U.hp.z); J.mounds[0].scale.set(1.1, 0.2 * (1 + Math.min(0, U.hp.y)), 1.3);
    J.segs.forEach((s, i) => { const p = tr[Math.min(tr.length - 1, (i + 1) * 5)]; s.position.copy(p); const q = tr[Math.min(tr.length - 1, (i + 1) * 5 - 2)]; s.lookAt(q); s.visible = p.y > -0.18; const md = J.mounds[i + 1]; md.visible = p.y < 0.08 && p.y > -0.7; md.position.set(p.x, 0.02, p.z); const d = 1 - Math.abs(p.y + 0.15) / 0.6; md.scale.set(0.9 * (1 - i / 22), 0.16 * Math.max(0.2, d), 1.1 * (1 - i / 22)); });
    if (J.water) J.water.material.opacity = 0.5 + Math.sin(t * 2) * 0.05;
    U.weakMat.emissiveIntensity = state === 'recover' || state === 'stagger' ? 1.6 : 0.9;
  }
  function buildScarab(name) {
    const [c1, c2] = SCARAB[name] || SCARAB['Scarab'], g = new THREE.Group(), J = {}, sh = toon(c1), dk = toon(c2);
    const body = new THREE.Group(); body.position.y = 0.32; g.add(body); J.body = body;
    const shell = M(new THREE.SphereGeometry(0.5, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), sh, 0, 0, 0, body, 0.03, 0.5); shell.scale.set(1, 0.7, 1.3);
    const seam = M(new THREE.BoxGeometry(0.03, 0.04, 1.25), dk, 0, 0.34, 0, body, 0); seam.scale.y = 1;
    const weakMat = new THREE.MeshToonMaterial({ color: '#f1dcae', emissive: new THREE.Color('#ffd23a'), emissiveIntensity: 0, gradientMap: toon('#fff').gradientMap });
    const belly = M(new THREE.CylinderGeometry(0.48, 0.44, 0.1, 18), weakMat, 0, -0.03, 0, body, 0.02, 0.48); belly.scale.z = 1.25;
    const head = new THREE.Group(); head.position.set(0, 0.04, 0.62); body.add(head); J.head = head; M(new THREE.SphereGeometry(0.22, 14, 10), dk, 0, 0, 0, head, 0.02, 0.22).scale.set(1.2, 0.7, 0.9);
    for (const s of [-1, 1]) { const h = M(new THREE.ConeGeometry(0.05, 0.3, 6), dk, s * 0.12, 0.04, 0.2, head, 0.01); h.rotation.set(Math.PI / 2 - 0.3, 0, -s * 0.4); M(new THREE.SphereGeometry(0.04, 8, 6), toon('#ffd23a'), s * 0.13, 0.08, 0.14, head, 0); }
    J.legs = []; for (const s of [-1, 1]) [0.3, 0, -0.3].forEach((z, i) => { const p = new THREE.Group(); p.position.set(s * 0.42, 0, z); body.add(p); const l = M(new THREE.CylinderGeometry(0.03, 0.04, 0.4, 6), dk, s * 0.15, -0.12, 0, p, 0.01, 0.04); l.rotation.z = s * 1.1; J.legs.push({ p, s, ph: i * 2.1 + (s > 0 ? Math.PI : 0) }); });
    if (name === 'Apron Scarab') for (let i = 0; i < 4; i++) M(new THREE.BoxGeometry(0.9, 0.02, 0.1), toon('#1a1a1e'), 0, 0.3 - Math.abs(i - 1.5) * 0.05, -0.45 + i * 0.3, body, 0);
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'scarab', variant: name, joints: J, weak: belly, weakMat, weakBase: new THREE.Color('#ffd23a'), slabColor: '#e0c48a', calls, height: 0.65, reach: 1.0, events: [] });
    return g;
  }
  function animateScarab(g, state, t, dt) {
    const U = g.userData, J = U.joints, B = J.body; B.position.set(0, 0.32, 0); B.rotation.set(0, 0, 0); g.position.y = 0;
    let amp = 0.05, rate = 3;
    if (state === 'idle') { J.head.rotation.y = Math.sin(t * 1.3) * 0.3; }
    else if (state === 'move') { amp = 0.5; rate = 22; B.position.y += Math.abs(Math.sin(t * 22)) * 0.02; }
    else if (state === 'windup') { const k = cl(t / 0.5); B.position.y = lerp(0.32, -0.45, ease(k)); amp = 0.6; rate = 26; B.rotation.x = 0.4 * k; if (Math.floor(t * 10) !== U.dg) { U.dg = Math.floor(t * 10); U.events.push('dig'); } }   // digs in; the ripple runs ahead
    else if (state === 'attack') { const k = cl(t / 0.5); if (k < 0.3) { B.position.y = lerp(-0.45, 0.6, k / 0.3); if (!U.popped) { U.popped = true; U.events.push('pop'); } } else B.position.y = lerp(0.6, 0.32, (k - 0.3) / 0.7); B.position.z = 0.9 + k * 0.8; amp = 0.6; rate = 26; B.rotation.x = -0.3 * (1 - k); }
    else if (state === 'recover') { B.rotation.z = Math.PI; B.position.y = 0.42; B.position.z = 1.7; amp = 0.7; rate = 14; }   // flipped on its back: belly up
    else if (state === 'hurt') B.position.x = Math.sin(t * 60) * 0.03;
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 6) * 0.35; amp = 0.3; rate = 10; }
    else if (state === 'armorBreak') { B.rotation.x = -0.2 * Math.sin(cl(t / 0.8) * Math.PI); if (t < dt * 1.5) U.events.push('chips'); }
    else if (state === 'die') { const k = ease(cl(t / 0.4)); B.rotation.z = Math.PI * k; B.position.y = lerp(0.32, 0.42, k); amp = t > 0.4 ? 0.4 * Math.max(0, 1 - (t - 0.4) / 0.9) : 0.2; rate = 24; }
    if (state !== 'windup') U.dg = -1; if (state !== 'attack') U.popped = false;
    J.legs.forEach(L => L.p.rotation.set(Math.sin(t * rate + L.ph) * amp, 0, state === 'die' && t > 1.3 ? -L.s * 0.8 : 0));
    U.weakMat.emissiveIntensity = state === 'recover' ? 0.8 + 0.5 * Math.sin(t * 12) : 0;
  }
  function buildSpitter(name) {
    const [c1, c2] = SPITTER[name] || SPITTER['Spitter'], g = new THREE.Group(), J = {}, bd = toon(c1), dk = toon('#3a2a1a');
    const body = new THREE.Group(); body.position.y = 0.7; g.add(body); J.body = body;
    // the bellows: a ribbed barrel on four legs, a nozzle at the front
    const bel = new THREE.Group(); body.add(bel); J.bel = bel; for (let i = 0; i < 5; i++) M(new THREE.CylinderGeometry(0.36 - Math.abs(i - 2) * 0.03, 0.36 - Math.abs(i - 2) * 0.03, 0.14, 14), i % 2 ? dk : bd, 0, 0, -0.3 + i * 0.15, bel, 0.015, 0.36).rotation.x = Math.PI / 2;
    const noz = new THREE.Group(); noz.position.set(0, -0.02, 0.45); body.add(noz); J.noz = noz; const nz = M(new THREE.CylinderGeometry(0.08, 0.16, 0.4, 12), toon('#8a6a3a'), 0, 0, 0.18, noz, 0.015, 0.16); nz.rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.05, 8, 6), toon('#ffb020'), s * 0.16, 0.18, 0.36, body, 0);
    const weakMat = new THREE.MeshToonMaterial({ color: c2, emissive: new THREE.Color(c2), emissiveIntensity: 0.3, gradientMap: toon('#fff').gradientMap });
    const sac = M(new THREE.SphereGeometry(0.3, 16, 12), weakMat, 0, 0.38, -0.05, body, 0.02, 0.3); J.sac = sac;
    J.legs = []; for (const s of [-1, 1]) for (const z of [-0.25, 0.25]) { const p = new THREE.Group(); p.position.set(s * 0.28, -0.15, z); body.add(p); M(new THREE.CylinderGeometry(0.04, 0.05, 0.6, 6), dk, s * 0.08, -0.27, 0, p, 0.012, 0.05).rotation.z = s * 0.3; J.legs.push({ p, s, ph: (s > 0 ? 0 : Math.PI) + (z > 0 ? Math.PI : 0) }); }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'spitter', variant: name, joints: J, weak: sac, weakMat, weakBase: new THREE.Color(c2), slabColor: c2, calls, height: 1.3, reach: 0, ranged: true, events: [] });
    return g;
  }
  function animateSpitter(g, state, t, dt) {
    const U = g.userData, J = U.joints, B = J.body; B.position.set(0, 0.7, 0); B.rotation.set(0, 0, 0);
    let sac = 1, amp = 0, bel = 1;
    if (state === 'idle') { sac = 1 + Math.sin(t * 2) * 0.05; bel = 1 + Math.sin(t * 2) * 0.04; }
    else if (state === 'move') { amp = 0.4; }
    else if (state === 'windup') { const k = cl(t / 1.4); sac = 1 + k * 0.9; bel = 1 - k * 0.15; B.rotation.x = -0.1 * k; U.weakMat.emissiveIntensity = 0.3 + k * 1.2 * (0.6 + 0.4 * Math.sin(t * (6 + k * 20))); }   // the sac swelling IS the timer
    else if (state === 'attack') { const k = cl(t / 0.6); sac = lerp(1.9, 0.5, ease(k)); bel = 1.15; B.rotation.x = 0.12; B.position.z = -0.1 * (1 - k); if (!U.spat) { U.spat = true; U.events.push('cone'); } }
    else if (state === 'recover') { sac = 0.5 + cl(t / 1.0) * 0.5; amp = 0.25; }
    else if (state === 'hurt') B.position.x = Math.sin(t * 60) * 0.03;
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 5) * 0.2; amp = 0.2; }
    else if (state === 'armorBreak') { const k = cl(t / 0.8); sac = k < 0.25 ? 1 + k * 3 : 0.01; if (k > 0.25 && !U.pop) { U.pop = true; U.events.push('blind'); } }   // the full sac bursts and blinds everything nearby
    else if (state === 'die') { const k = ease(cl(t / 0.7)); B.position.y = lerp(0.7, 0.3, k); B.rotation.z = 0.5 * k; sac = 1 - k; bel = 1 - 0.3 * k; }
    if (state !== 'attack') U.spat = false; if (state !== 'armorBreak') U.pop = false; if (state !== 'windup') U.weakMat.emissiveIntensity = 0.3;
    J.sac.scale.setScalar(Math.max(0.01, sac)); J.bel.scale.set(1, 1, bel);
    J.legs.forEach(L => L.p.rotation.x = Math.sin(t * 9 + L.ph) * amp);
  }
  function buildHusk(name) {
    const [c1, c2] = HUSK[name] || HUSK['Husk'], g = new THREE.Group(), J = {}, wrap = toon(c1), dk = toon(c2);
    const hips = new THREE.Group(); hips.position.y = 0.95; g.add(hips); J.hips = hips;
    J.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.13, 0, 0); hips.add(p); M(new THREE.CylinderGeometry(0.08, 0.07, 0.95, 8), wrap, 0, -0.47, 0, p, 0.015, 0.08); for (let i = 0; i < 4; i++) M(new THREE.TorusGeometry(0.08, 0.012, 4, 10), dk, 0, -0.15 - i * 0.22, 0, p, 0).rotation.x = Math.PI / 2 + (i % 2 ? 0.3 : -0.3); return { p, s }; });
    const tor = new THREE.Group(); hips.add(tor); J.torso = tor; tor.rotation.x = 0.35;
    M(new THREE.CylinderGeometry(0.2, 0.17, 0.7, 10), wrap, 0, 0.35, 0, tor, 0.02, 0.2);
    for (let i = 0; i < 5; i++) M(new THREE.TorusGeometry(0.19, 0.015, 4, 12), dk, 0, 0.1 + i * 0.14, 0, tor, 0).rotation.set(Math.PI / 2 + (i % 2 ? 0.25 : -0.25), 0, 0);
    const head = new THREE.Group(); head.position.set(0, 0.82, 0.05); tor.add(head); J.head = head; M(new THREE.SphereGeometry(0.16, 12, 10), wrap, 0, 0, 0, head, 0.015, 0.16).scale.set(1, 1.15, 1);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffb020' })); e.position.set(s * 0.06, 0.02, 0.14); head.add(e); }
    const hood = M(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, 1.6), toon('#8a6a4a'), 0, 0.03, -0.02, head, 0.015, 0.2);
    const weakMat = new THREE.MeshToonMaterial({ color: '#7fc8e8', emissive: new THREE.Color('#5fe3ff'), emissiveIntensity: 0, gradientMap: toon('#fff').gradientMap });
    const flask = M(new THREE.CylinderGeometry(0.07, 0.08, 0.2, 10), weakMat, 0.2, 0.2, 0.12, tor, 0.01, 0.08);   // its water flask: what it wants, what you lure it with
    J.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 0.25, 0.62, 0); tor.add(sh); M(new THREE.CylinderGeometry(0.05, 0.045, 0.75, 7), wrap, 0, -0.37, 0, sh, 0.012, 0.05); for (let i = 0; i < 3; i++) M(new THREE.TorusGeometry(0.05, 0.01, 4, 8), dk, 0, -0.15 - i * 0.22, 0, sh, 0).rotation.x = Math.PI / 2; for (let f = 0; f < 3; f++) { const fi = M(new THREE.CylinderGeometry(0.012, 0.008, 0.14, 4), dk, (f - 1) * 0.025, -0.8, 0.02, sh, 0); fi.rotation.x = 0.3; } return { sh, s }; });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'husk', variant: name, joints: J, weak: flask, weakMat, weakBase: new THREE.Color('#5fe3ff'), slabColor: c1, calls, height: 1.7, reach: 1.2, events: [] });
    return g;
  }
  function animateHusk(g, state, t, dt) {
    const U = g.userData, J = U.joints, T = J.torso; J.hips.position.set(0, 0.95, 0); T.rotation.set(0.35, 0, 0); J.head.rotation.set(-0.3, 0, 0);
    let a0 = [0.35, 0, 0.1], a1 = [0.35, 0, -0.1], legA = 0;
    if (state === 'idle') { T.rotation.z = Math.sin(t * 0.7) * 0.04; J.head.rotation.y = Math.sin(t * 0.3) * 0.4; a0[0] = 0.3 + Math.sin(t * 0.7) * 0.05; }
    else if (state === 'move') { const w = t * 2.6; legA = Math.sin(w) * 0.3; T.rotation.z = Math.sin(w) * 0.08; J.hips.position.y = 0.95 - Math.abs(Math.cos(w)) * 0.03; a0 = [0.5, 0, 0.1]; a1 = [0.5, 0, -0.1]; }   // slow shamble
    else if (state === 'windup') { const k = ease(cl(t / 0.8)); a0 = [lerp(0.35, -1.6, k), 0, lerp(0.1, 0.35, k)]; a1 = [lerp(0.35, -1.6, k), 0, lerp(-0.1, -0.35, k)]; T.rotation.x = 0.35 - 0.25 * k; J.head.rotation.x = -0.3 - 0.2 * k; }   // arms lift
    else if (state === 'attack') { const k = cl(t / 0.5), s = ease(cl(k / 0.4)); a0 = [-1.6, 0, lerp(0.35, -0.15, s)]; a1 = [-1.6, 0, lerp(-0.35, 0.15, s)]; J.hips.position.z = s * 0.6; T.rotation.x = 0.5; if (k > 0.35 && !U.grabbed) { U.grabbed = true; U.events.push('grab'); } }
    else if (state === 'recover') { a0 = [-1.4, 0, -0.15]; a1 = [-1.4, 0, 0.15]; J.hips.position.z = 0.6; T.rotation.x = 0.55 + Math.sin(t * 8) * 0.04; if (Math.floor(t * 2.5) !== U.dr) { U.dr = Math.floor(t * 2.5); U.events.push('drain'); } }   // holds and drains: mash to break free
    else if (state === 'hurt') { if (t < dt * 1.5) U.events.push('dust'); }   // it never flinches
    else if (state === 'stagger') { T.rotation.z = Math.sin(t * 3) * 0.15; legA = Math.sin(t * 3) * 0.1; }
    else if (state === 'armorBreak') { if (t < dt * 1.5) U.events.push('dust'); T.rotation.x = 0.35 - 0.15 * Math.sin(cl(t / 0.8) * Math.PI); }
    else if (state === 'die') { const k = ease(cl(t / 1.2)); J.hips.position.y = lerp(0.95, 0.12, k); T.rotation.x = 0.35 + 1.1 * k; J.legs.forEach(L => L.p.rotation.x = -1.4 * k); a0 = [0.2, 0, 0.6 * k]; a1 = [0.2, 0, -0.6 * k]; if (t > 1.2 && !U.crumb) { U.crumb = true; U.events.push('dust'); } }
    if (state !== 'attack') U.grabbed = false; if (state !== 'die') U.crumb = false; if (state !== 'recover') U.dr = -1;
    if (state !== 'die') J.legs.forEach(L => L.p.rotation.set(L.s * legA, 0, 0));
    J.arms[0].sh.rotation.set(a0[0], a0[1], a0[2]); J.arms[1].sh.rotation.set(a1[0], a1[1], a1[2]);
    U.weakMat.emissiveIntensity = state === 'recover' || state === 'stagger' ? 0.9 : 0.2;
  }
  function buildDevil(name) {
    const dry = name === 'Dry Devil', g = new THREE.Group(), J = {}, col = dry ? '#d8c8a8' : '#c9a35c';
    J.rings = []; for (let i = 0; i < 7; i++) { const r = 0.25 + i * 0.16; const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06 + i * 0.012, 6, 24), new THREE.MeshToonMaterial({ color: col, gradientMap: toon('#fff').gradientMap, transparent: true, opacity: 0.55 - i * 0.03 })); m.rotation.x = Math.PI / 2; m.position.y = 0.2 + i * 0.32; g.add(m); J.rings.push(m); }
    J.motes = []; for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.04 + Math.random() * 0.05, 5, 4), new THREE.MeshBasicMaterial({ color: i % 4 ? col : '#8a6a3a' })); g.add(m); J.motes.push({ m, a: Math.random() * 6.3, h: Math.random() * 2.2, r: 0.3 + Math.random() * 0.9 }); }
    const face = new THREE.Group(); face.position.set(0, 1.45, 0.5); g.add(face); J.face = face;
    const weakMat = new THREE.MeshToonMaterial({ color: '#fff4c8', emissive: new THREE.Color('#ffb020'), emissiveIntensity: 0.6, gradientMap: toon('#fff').gradientMap });
    const eyes = [-1, 1].map(s => M(new THREE.SphereGeometry(0.09, 10, 8), weakMat, s * 0.16, 0, 0, face, 0.012, 0.09));
    for (const s of [-1, 1]) { const b = M(new THREE.BoxGeometry(0.2, 0.04, 0.04), toon('#3a2a1a'), s * 0.15, 0.12, 0.02, face, 0); b.rotation.z = s * 0.45; }
    const mouth = M(new THREE.TorusGeometry(0.09, 0.025, 6, 12, Math.PI), toon('#3a2a1a'), 0, -0.16, 0.02, face, 0); mouth.rotation.z = Math.PI;
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'devil', variant: name, joints: J, weak: eyes[0], weakMat, weakBase: new THREE.Color('#ffb020'), slabColor: col, calls, height: 2.4, reach: 1.6, spin: 6, events: [] });
    return g;
  }
  function animateDevil(g, state, t, dt) {
    const U = g.userData, J = U.joints; let target = 6, face = 0.25, lean = 0;
    if (state === 'move') { target = 8; lean = 0.12; }
    else if (state === 'windup') { target = 14; face = 0.1; if (Math.floor(t * 5) !== U.sk) { U.sk = Math.floor(t * 5); U.events.push('suck'); } }   // spins up and pulls you in
    else if (state === 'attack') { target = 18; if (!U.spat) { U.spat = true; U.events.push('spit'); } }
    else if (state === 'recover' || state === 'stagger') { target = 1.2; face = 1; }   // spin slows, the face shows: hit it now
    else if (state === 'hurt') { target = 3; face = 0.8; }
    else if (state === 'armorBreak') { target = 2; face = 1; if (t < dt * 1.5) U.events.push('dust'); }
    else if (state === 'die') { target = Math.max(0, 6 - t * 5); face = Math.max(0, 1 - t); }
    if (state !== 'windup') U.sk = -1; if (state !== 'attack') U.spat = false;
    U.spin = lerp(U.spin, target, 1 - Math.exp(-3 * dt)); U.ang = (U.ang || 0) + U.spin * dt;
    const dying = state === 'die' ? cl(t / 1.4) : 0;
    J.rings.forEach((r, i) => { r.rotation.z = U.ang * (1 + i * 0.1); r.position.x = Math.sin(U.ang * 0.7 + i) * (0.05 + i * 0.02) + lean * i * 0.1; r.position.y = (0.2 + i * 0.32) * (1 - dying * 0.8); r.material.opacity = (0.55 - i * 0.03) * (1 - dying); r.scale.setScalar(1 + (state === 'windup' ? Math.sin(t * 20 + i) * 0.05 : 0)); });
    J.motes.forEach(q => { q.a += dt * U.spin * (1.2 - q.r * 0.4); const h = q.h * (1 - dying * 0.9); q.m.position.set(Math.cos(q.a) * q.r * (0.5 + h * 0.35), 0.1 + h, Math.sin(q.a) * q.r * (0.5 + h * 0.35)); q.m.visible = dying < 0.95; });
    J.face.visible = face > 0.15; J.face.scale.setScalar(0.6 + face * 0.6); J.face.position.x = Math.sin(t * U.spin * 0.6) * (1 - face) * 0.3;
    U.weakMat.emissiveIntensity = face > 0.9 ? 1.4 + Math.sin(t * 10) * 0.4 : 0.6;
  }
  function buildSiphon(name) {
    const g = new THREE.Group(), J = {}, brass = toon('#c9a24a'), dk = toon('#5a4a2a'), iron = toon('#3a3836'), cop = toon('#b87333');
    const body = new THREE.Group(); body.position.y = 1.7; g.add(body); J.body = body;
    J.legs = [0, 1, 2].map(i => { const a = i / 3 * Math.PI * 2 + Math.PI / 3; const p = new THREE.Group(); p.position.set(Math.sin(a) * 0.5, -0.2, Math.cos(a) * 0.5); p.rotation.y = a; body.add(p); const up = M(new THREE.CylinderGeometry(0.08, 0.1, 1.0, 8), brass, 0, -0.35, 0.35, p, 0.015, 0.1); up.rotation.x = 0.8; const kn = new THREE.Group(); kn.position.set(0, -0.7, 0.72); p.add(kn); M(new THREE.SphereGeometry(0.12, 10, 8), dk, 0, 0, 0, kn, 0.012, 0.12); const lo = M(new THREE.CylinderGeometry(0.07, 0.09, 0.95, 8), brass, 0, -0.45, 0.1, kn, 0.015, 0.09); lo.rotation.x = -0.2; M(new THREE.CylinderGeometry(0.16, 0.2, 0.08, 10), iron, 0, -0.92, 0.2, kn, 0.012, 0.2); return { p, kn, i }; });
    const boiler = M(new THREE.CylinderGeometry(0.62, 0.66, 1.3, 20), cop, 0, 0.45, 0, body, 0.035, 0.66);
    M(new THREE.SphereGeometry(0.62, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), cop, 0, 1.1, 0, body, 0.03, 0.62);
    for (const y of [0, 0.45, 0.9]) M(new THREE.TorusGeometry(0.66, 0.035, 6, 28), brass, 0, y, 0, body, 0).rotation.x = Math.PI / 2;
    const pipe = M(new THREE.CylinderGeometry(0.1, 0.12, 1.0, 10), iron, 0.25, 1.9, -0.1, body, 0.015, 0.12); J.pipe = pipe; M(new THREE.CylinderGeometry(0.18, 0.12, 0.2, 10), iron, 0.25, 2.45, -0.1, body, 0.015, 0.18);
    // gauge with a needle
    const gauge = new THREE.Group(); gauge.position.set(0, 0.85, 0.64); body.add(gauge); M(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 18), brass, 0, 0, 0, gauge, 0.01, 0.17).rotation.x = Math.PI / 2; const fc = new THREE.Mesh(new THREE.CircleGeometry(0.14, 18), new THREE.MeshBasicMaterial({ color: '#f7f1e6' })); fc.position.z = 0.03; gauge.add(fc); const red = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.14, 12, 1, -0.2, 1.0), new THREE.MeshBasicMaterial({ color: '#ec3013' })); red.position.z = 0.031; gauge.add(red);
    J.needle = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.12, 0.01), new THREE.MeshBasicMaterial({ color: '#1a1a1e' })); J.needle.geometry.translate(0, 0.05, 0); J.needle.position.z = 0.035; gauge.add(J.needle);
    // three valves (the weak points): shut all three
    const weakMat = new THREE.MeshToonMaterial({ color: '#ec3013', emissive: new THREE.Color('#ffd23a'), emissiveIntensity: 0, gradientMap: toon('#fff').gradientMap });
    J.valves = [0, 1, 2].map(i => { const a = i / 3 * Math.PI * 2; const v = new THREE.Group(); v.position.set(Math.sin(a) * 0.72, 0.3, Math.cos(a) * 0.72); v.rotation.y = a; body.add(v); M(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 6), iron, 0, 0, -0.04, v, 0).rotation.x = Math.PI / 2; const w = new THREE.Group(); w.position.z = 0.04; v.add(w); M(new THREE.TorusGeometry(0.14, 0.03, 6, 14), weakMat, 0, 0, 0, w, 0.01); for (let s = 0; s < 3; s++) { const sp = M(new THREE.BoxGeometry(0.26, 0.025, 0.025), weakMat, 0, 0, 0, w, 0); sp.rotation.z = s * Math.PI / 3; } const vent = M(new THREE.CylinderGeometry(0.07, 0.1, 0.2, 8), iron, 0, -0.3, 0.05, v, 0.01, 0.1); return { v, w, vent, shut: false }; });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'siphon', variant: name, joints: J, weak: J.valves[0].w.children[0], weakMat, weakBase: new THREE.Color('#ffd23a'), slabColor: '#c9a24a', calls, height: 4.4, reach: 0, shut: 0, events: [] });
    return g;
  }
  function enterSiphon(g, state) { const U = g.userData; if (state === 'armorBreak') { U.shut = Math.min(3, U.shut + 1); U.events.push('clank'); } }
  function animateSiphon(g, state, t, dt) {
    const U = g.userData, J = U.joints, B = J.body; B.position.set(0, 1.7, 0); B.rotation.set(0, 0, 0); let press = 0.2, legA = 0;
    if (state === 'idle') { press = 0.25 + Math.sin(t * 2) * 0.05; B.position.y += Math.sin(t * 6) * 0.01; if (Math.floor(t * 0.8) !== U.hs) { U.hs = Math.floor(t * 0.8); U.events.push('hiss'); } }
    else if (state === 'move') { legA = 1; B.position.y += Math.abs(Math.sin(t * 3)) * 0.06; B.rotation.y = Math.sin(t * 1.5) * 0.2; }
    else if (state === 'windup') { const k = cl(t / 1.3); press = 0.25 + k * 0.75; B.position.y += Math.sin(t * 40) * 0.015 * k; if (t > 0.3 && !U.pooled) { U.pooled = true; U.events.push('pools'); } }   // pressure builds; purple pools mark where the steam will blast
    else if (state === 'attack') { press = 1; B.position.y -= 0.08; if (!U.blown) { U.blown = true; U.events.push('steam'); } }
    else if (state === 'recover') { press = 0.05; B.position.y -= 0.12; B.rotation.x = 0.06; }   // vents open, valves exposed
    else if (state === 'hurt') B.position.x = Math.sin(t * 50) * 0.03;
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 3) * 0.08; press = 0.6 + Math.sin(t * 9) * 0.3; }
    else if (state === 'die') { const k = ease(cl(t / 1.6)); press = 1; B.position.y = lerp(1.7, 0.7, k); B.rotation.z = 0.5 * k; J.legs.forEach(L => L.kn.rotation.x = -0.9 * k); if (t > 0.6 && !U.boom) { U.boom = true; U.events.push('steam', 'explode'); } }
    if (state !== 'idle') U.hs = -1; if (state !== 'windup') U.pooled = false; if (state !== 'attack') U.blown = false; if (state !== 'die') U.boom = false;
    if (state !== 'die') J.legs.forEach(L => { L.p.rotation.x = legA * Math.sin(t * 3 + L.i * 2.1) * 0.2; L.kn.rotation.x = legA * Math.max(0, Math.sin(t * 3 + L.i * 2.1)) * -0.3; });
    J.needle.rotation.z = lerp(2.2, -0.4, press);
    J.valves.forEach((v, i) => { v.shut = i < U.shut; v.w.rotation.z = v.shut ? 1.6 : (state === 'recover' ? t * 3 : 0); v.vent.visible = !v.shut; });
    U.weakMat.emissiveIntensity = state === 'recover' || state === 'stagger' ? 0.8 + 0.5 * Math.sin(t * 12) : 0;
  }
  const lavaMat = k0 => new THREE.MeshToonMaterial({ color: '#ffb020', emissive: new THREE.Color('#ff5a1a'), emissiveIntensity: k0, gradientMap: toon('#fff').gradientMap });
  function buildSlag(name) {
    const g = new THREE.Group(), J = {}, rock = toon('#3a3230'), rock2 = toon('#2a2422'), seam = lavaMat(0.9);
    const hips = new THREE.Group(); hips.position.y = 0.95; g.add(hips); J.hips = hips;
    J.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.3, 0, 0); hips.add(p); M(new THREE.DodecahedronGeometry(0.3, 0), rock, 0, -0.35, 0, p, 0.025, 0.3).scale.set(1, 1.3, 1); M(new THREE.DodecahedronGeometry(0.3, 0), rock2, 0, -0.78, 0.08, p, 0.025, 0.3).scale.set(1.2, 0.6, 1.4); return { p, s }; });
    const tor = new THREE.Group(); hips.add(tor); J.torso = tor; tor.rotation.x = 0.3;
    const core = M(new THREE.SphereGeometry(0.55, 14, 10), seam, 0, 0.55, 0, tor, 0, 0.55); core.scale.set(1, 1.05, 0.85);   // the molten body under the crust
    J.crust = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, y = 0.25 + (i % 3) * 0.3; const c = M(new THREE.DodecahedronGeometry(0.26 + (i % 2) * 0.05, 0), i % 2 ? rock : rock2, Math.cos(a) * 0.48, y, Math.sin(a) * 0.4, tor, 0.02, 0.28); c.scale.set(1, 0.85, 0.7); c.lookAt(new THREE.Vector3(0, y, 0)); c.userData.home = c.position.clone(); J.crust.push(c); }
    for (let i = 0; i < 4; i++) { const c = M(new THREE.DodecahedronGeometry(0.22, 0), rock, (i - 1.5) * 0.25, 1.05, -0.1 + (i % 2) * 0.1, tor, 0.02, 0.22); c.userData.home = c.position.clone(); J.crust.push(c); }
    const head = new THREE.Group(); head.position.set(0, 1.2, 0.18); tor.add(head); J.head = head; M(new THREE.DodecahedronGeometry(0.24, 0), rock, 0, 0, 0, head, 0.02, 0.24);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff2b0' })); e.position.set(s * 0.09, 0.02, 0.2); head.add(e); }
    J.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 0.65, 0.9, 0); tor.add(sh); M(new THREE.DodecahedronGeometry(0.22, 0), rock, 0, -0.25, 0, sh, 0.02, 0.22).scale.set(1, 1.5, 1); const el = new THREE.Group(); el.position.y = -0.55; sh.add(el); M(new THREE.SphereGeometry(0.14, 8, 6), seam, 0, 0, 0, el, 0); M(new THREE.DodecahedronGeometry(0.34, 0), rock2, 0, -0.35, 0.05, el, 0.025, 0.34); return { sh, el, s }; });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'slag', variant: name, joints: J, weak: core, weakMat: seam, weakBase: new THREE.Color('#ff5a1a'), slabColor: '#3a3230', calls, height: 2.1, reach: 1.5, crustLvl: 0, events: [] });
    return g;
  }
  function enterSlag(g, state) { const U = g.userData; if (state === 'armorBreak') { U.crustLvl = Math.min(3, U.crustLvl + 1); U.events.push('chunks'); } }
  function animateSlag(g, state, t, dt) {
    const U = g.userData, J = U.joints, T = J.torso, sp = 1 + U.crustLvl * 0.25; J.hips.position.set(0, 0.95, 0); T.rotation.set(0.3, 0, 0);
    let a0 = [0.2, 0, 0.15, -0.3], a1 = [0.2, 0, -0.15, -0.3], legA = 0, flare = 0;
    if (state === 'idle') { T.position.y = Math.sin(t * 1.5) * 0.02; flare = 0.1 + 0.1 * Math.sin(t * 3); }
    else if (state === 'move') { const w = t * 4 * sp; legA = Math.sin(w) * 0.35; T.rotation.z = Math.sin(w) * 0.06; a0[0] = -Math.sin(w) * 0.4; a1[0] = Math.sin(w) * 0.4; }
    else if (state === 'windup') { const k = ease(cl(t / (0.7 / sp))); a0 = [lerp(0.2, -2.8, k), 0, 0.3, -0.5]; a1 = [lerp(0.2, -2.8, k), 0, -0.3, -0.5]; T.rotation.x = 0.3 - 0.4 * k; flare = k * 1.6 * (0.7 + 0.3 * Math.sin(t * 30)); }   // the seams flare before the swing
    else if (state === 'attack') { const k = cl(t / 0.55), s = ease(cl(k / 0.45)); a0 = [lerp(-2.8, 0.6, s), 0, 0.1, -0.1]; a1 = [lerp(-2.8, 0.6, s), 0, -0.1, -0.1]; T.rotation.x = lerp(-0.1, 0.7, s); J.hips.position.y = 0.95 - 0.12 * s; flare = 1; if (k > 0.45 && !U.hit) { U.hit = true; U.events.push('slam', 'splash'); } }
    else if (state === 'recover') { T.rotation.x = 0.7; J.hips.position.y = 0.85; a0 = [0.6, 0, 0.2, -0.1]; a1 = [0.6, 0, -0.2, -0.1]; flare = 0.6; }
    else if (state === 'hurt') T.position.x = Math.sin(t * 50) * 0.04;
    else if (state === 'stagger') { T.rotation.z = Math.sin(t * 4) * 0.15; legA = Math.sin(t * 4) * 0.12; flare = 0.5; }
    else if (state === 'armorBreak') { T.rotation.x = 0.3 - 0.25 * Math.sin(cl(t / 0.9) * Math.PI); flare = 1.2; }
    else if (state === 'die') { const k = ease(cl(t / 1.4)); J.hips.position.y = lerp(0.95, 0.3, k); T.rotation.x = 0.3 + 0.9 * k; flare = Math.max(0, 1 - k * 1.5) * 1.5; J.legs.forEach(L => L.p.rotation.x = -1.2 * k); }
    if (state !== 'attack') U.hit = false;
    if (state !== 'die') J.legs.forEach(L => L.p.rotation.set(L.s * legA, 0, 0));
    const set = (A, a) => { A.sh.rotation.set(a[0], a[1], a[2]); A.el.rotation.x = a[3]; }; set(J.arms[0], a0); set(J.arms[1], a1);
    // crust falls away in steps; more seam shows, it glows brighter
    J.crust.forEach((c, i) => { const gone = i < U.crustLvl * 6; if (state === 'armorBreak' && gone && i >= (U.crustLvl - 1) * 6) { const k = cl(t / 0.9); c.visible = k < 0.95; c.position.copy(c.userData.home).add(new THREE.Vector3(c.userData.home.x * k * 2, -k * k * 1.6 + k * 0.6, c.userData.home.z * k * 2)); } else { c.visible = !gone; c.position.copy(c.userData.home); } });
    U.weakMat.emissiveIntensity = 0.9 + U.crustLvl * 0.35 + flare;
  }
  function buildEmber(name) {
    const g = new THREE.Group(), J = {}, coal = toon('#2a2422');
    const body = new THREE.Group(); body.position.y = 0.4; g.add(body); J.body = body;
    const weakMat = lavaMat(0.8);
    M(new THREE.DodecahedronGeometry(0.28, 1), coal, 0, 0, 0, body, 0.02, 0.28);
    const heart = M(new THREE.SphereGeometry(0.2, 12, 10), weakMat, 0, 0, 0, body, 0, 0.2); heart.scale.setScalar(1.25);   // soft in the middle; shows through the cracks
    for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.03), weakMat); const a = i * 1.05; c.position.set(Math.cos(a) * 0.27, Math.sin(i * 1.7) * 0.15, Math.sin(a) * 0.27); c.lookAt(0, c.position.y, 0); c.rotation.z = i; body.add(c); }
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff2b0' })); e.position.set(s * 0.09, 0.06, 0.26); body.add(e); }
    J.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.12, -0.2, 0); body.add(p); M(new THREE.CylinderGeometry(0.025, 0.035, 0.22, 5), coal, 0, -0.1, 0, p, 0.01, 0.035); return { p, s }; });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'ember', variant: name, joints: J, weak: heart, weakMat, weakBase: new THREE.Color('#ff5a1a'), slabColor: '#ff8a1a', calls, height: 0.7, reach: 1.4, flock: true, events: [] });
    return g;
  }
  function animateEmber(g, state, t, dt, opts = {}) {
    const U = g.userData, J = U.joints, B = J.body, o = opts.off || 0; B.position.set(0, 0.4, 0); B.rotation.set(0, 0, 0); B.scale.setScalar(1);
    let glow = 0.8 + 0.3 * Math.sin(t * 4 + o), white = 0, hop = 0;
    if (state === 'idle') { hop = Math.abs(Math.sin(t * 3 + o)) * 0.12; }
    else if (state === 'move') { hop = Math.abs(Math.sin(t * 7 + o)) * 0.5; B.rotation.x = Math.sin(t * 7 + o) * 0.3; }
    else if (state === 'windup') { hop = Math.abs(Math.sin(t * 9)) * 0.6; white = cl(t / 0.9); B.scale.setScalar(1 + white * 0.25 + Math.sin(t * 40) * 0.03 * white); }   // glows white just before it goes off
    else if (state === 'attack') { const k = cl(t / 0.6); white = 1; B.position.z = k * 1.4; hop = Math.sin(k * Math.PI) * 0.7; B.scale.setScalar(1.25 + k * 0.4); if (k > 0.8 && !U.boomed) { U.boomed = true; U.events.push('explodeSmall'); } }
    else if (state === 'recover') { glow = 0.3; }
    else if (state === 'hurt') B.position.x = Math.sin(t * 60) * 0.03;
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 8) * 0.4; }
    else if (state === 'die') { const k = cl(t / 1.0); glow = 0.8 * (1 - k); B.scale.setScalar(1 - k * 0.3); if (t > 0.1 && !U.fz) { U.fz = true; U.events.push('fizzle'); } }
    if (state !== 'attack') U.boomed = false; if (state !== 'die') U.fz = false;
    B.position.y += hop; g.visible = !(state === 'attack' && U.boomed);
    J.legs.forEach((L, i) => L.p.rotation.x = Math.sin(t * 14 + i * Math.PI) * (state === 'move' || state === 'windup' ? 0.6 : 0.1));
    U.weakMat.emissiveIntensity = glow + white * 2.5; U.weakMat.color.setRGB(1, 0.69 + white * 0.31, 0.13 + white * 0.87);
  }
  function buildVent(name) {
    const g = new THREE.Group(), J = {}, rock = toon('#4a3f3a'), dk = toon('#2a2422');
    const body = new THREE.Group(); body.position.y = 0.35; g.add(body); J.body = body;
    M(new THREE.CylinderGeometry(0.45, 0.75, 1.3, 9), rock, 0, 0.65, 0, body, 0.03, 0.75);
    for (let i = 0; i < 5; i++) { const a = i * 1.26; const r = M(new THREE.DodecahedronGeometry(0.2, 0), dk, Math.cos(a) * 0.62, 0.15 + (i % 2) * 0.3, Math.sin(a) * 0.62, body, 0.015, 0.2); }
    const weakMat = lavaMat(0.6);
    const lava = M(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 14), weakMat, 0, 1.28, 0, body, 0, 0.34); J.lava = lava;
    J.lips = [0, 1, 2, 3].map(i => { const a = i * Math.PI / 2 + Math.PI / 4; const p = new THREE.Group(); p.position.set(Math.cos(a) * 0.38, 1.3, Math.sin(a) * 0.38); p.rotation.y = -a + Math.PI / 2; body.add(p); M(new THREE.BoxGeometry(0.4, 0.12, 0.3), dk, 0, 0, 0.12, p, 0.015); return p; });
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff2b0' })); e.position.set(s * 0.17, 0.95, 0.5); body.add(e); }
    J.legs = [0, 1, 2, 3].map(i => { const a = i * Math.PI / 2; const p = new THREE.Group(); p.position.set(Math.cos(a) * 0.5, 0.05, Math.sin(a) * 0.5); body.add(p); M(new THREE.DodecahedronGeometry(0.17, 0), dk, 0, -0.2, 0, p, 0.012, 0.17); return { p, i }; });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'vent', variant: name, joints: J, weak: lava, weakMat, weakBase: new THREE.Color('#ff5a1a'), slabColor: '#ff8a1a', calls, height: 1.75, reach: 0, lobber: true, events: [] });
    return g;
  }
  function animateVent(g, state, t, dt) {
    const U = g.userData, J = U.joints, B = J.body; B.position.set(0, 0.35, 0); B.rotation.set(0, 0, 0); let open = 0.1, amp = 0, glow = 0.6;
    if (state === 'idle') { open = 0.1 + Math.max(0, Math.sin(t * 1.2)) * 0.15; if (Math.random() < dt * 0.8) U.events.push('smoke'); }
    else if (state === 'move') { amp = 1; B.position.y += Math.abs(Math.sin(t * 6)) * 0.05; }
    else if (state === 'windup') { const k = cl(t / 1.0); open = 0.1 + ease(k) * 1.1; glow = 0.6 + k * 2; B.position.y -= 0.08 * k; }   // the mouth opens before it throws
    else if (state === 'attack') { open = 1.2; glow = 2.5; B.position.y = 0.35 + Math.sin(cl(t / 0.3) * Math.PI) * 0.15; if (!U.lobbed) { U.lobbed = true; U.events.push('lob'); } }
    else if (state === 'recover') { open = 0.9; glow = 1.6 + Math.sin(t * 12) * 0.4; }   // open mouth = weak point
    else if (state === 'hurt') { B.position.x = Math.sin(t * 60) * 0.03; open = 0; }
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 4) * 0.12; open = 0.6; }
    else if (state === 'die') { const k = ease(cl(t / 1.4)); B.position.y = lerp(0.35, -0.4, k); glow = 0.6 * (1 - k); open = 0.5 * (1 - k); if (t < dt * 1.5) U.events.push('smoke'); }
    if (state !== 'attack') U.lobbed = false;
    J.lips.forEach(p => p.rotation.x = -open); J.legs.forEach(L => L.p.rotation.x = Math.sin(t * 6 + L.i * 1.6) * 0.4 * amp);
    U.weakMat.emissiveIntensity = glow;
  }
  function buildAsh(name) {
    const g = new THREE.Group(), J = {}, ash = toon('#9a9894'), ash2 = toon('#6b6965'), frost = toon('#dfeaf0');
    const hips = new THREE.Group(); hips.position.y = 1.25; g.add(hips); J.hips = hips;
    J.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.14, 0, 0); hips.add(p); M(new THREE.CylinderGeometry(0.06, 0.05, 0.65, 6), ash, 0, -0.32, 0, p, 0.012, 0.06); const kn = new THREE.Group(); kn.position.y = -0.65; p.add(kn); M(new THREE.CylinderGeometry(0.05, 0.035, 0.62, 6), ash2, 0, -0.3, 0, kn, 0.012, 0.05); M(new THREE.ConeGeometry(0.08, 0.2, 5), frost, 0, -0.6, 0.06, kn, 0.01).rotation.x = Math.PI / 2; return { p, kn, s }; });
    const tor = new THREE.Group(); hips.add(tor); J.torso = tor;
    const ch = M(new THREE.CylinderGeometry(0.24, 0.14, 0.9, 7), ash, 0, 0.45, 0, tor, 0.02, 0.24); ch.scale.z = 0.7;
    const weakMat = new THREE.MeshToonMaterial({ color: '#ffb020', emissive: new THREE.Color('#ff5a1a'), emissiveIntensity: 0.25, gradientMap: toon('#fff').gradientMap });
    const ember = M(new THREE.SphereGeometry(0.08, 10, 8), weakMat, 0, 0.6, 0.15, tor, 0.01, 0.08);   // the last coal in its chest
    for (let i = 0; i < 5; i++) { const fl = M(new THREE.BoxGeometry(0.12, 0.02, 0.08), ash2, (i % 2 ? 0.12 : -0.1), 0.2 + i * 0.15, 0.16, tor, 0); fl.rotation.z = i; }
    const head = new THREE.Group(); head.position.y = 1.05; tor.add(head); J.head = head;
    M(new THREE.ConeGeometry(0.16, 0.42, 6), ash, 0, 0.1, 0, head, 0.015).rotation.x = Math.PI;
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: '#bfe8ff' })); e.position.set(s * 0.06, 0.12, 0.12); head.add(e); }
    J.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 0.28, 0.85, 0); tor.add(sh); M(new THREE.CylinderGeometry(0.04, 0.035, 0.7, 6), ash, 0, -0.35, 0, sh, 0.01, 0.04); for (let f = 0; f < 3; f++) { const c = M(new THREE.ConeGeometry(0.02, 0.24, 4), frost, (f - 1) * 0.04, -0.8, 0.02, sh, 0); c.rotation.x = Math.PI; } return { sh, s }; });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'ash', variant: name, joints: J, weak: ember, weakMat, weakBase: new THREE.Color('#ff5a1a'), slabColor: '#dfeaf0', calls, height: 2.45, reach: 1.6, events: [] });
    return g;
  }
  function animateAsh(g, state, t, dt) {
    const U = g.userData, J = U.joints, T = J.torso; J.hips.position.set(0, 1.25, 0); T.rotation.set(0, 0, 0); J.head.rotation.set(0, 0, 0);
    let a0 = [0.05, 0, 0.12], a1 = [0.05, 0, -0.12], legA = 0;
    if (state === 'idle') { T.rotation.z = Math.sin(t * 0.6) * 0.03; J.head.rotation.y = Math.sin(t * 0.4) * 0.5; if (Math.random() < dt * 1.5) U.events.push('flake'); }
    else if (state === 'move') { const w = t * 3.4; legA = Math.sin(w) * 0.35; J.legs.forEach((L, i) => L.kn.rotation.x = Math.max(0, Math.sin(w + i * Math.PI)) * 0.5); if (Math.floor(w / Math.PI) !== U.st) { U.st = Math.floor(w / Math.PI); U.events.push('frostStep'); } }   // every step leaves frost, even on lava
    else if (state === 'windup') { const k = ease(cl(t / 0.8)); a0 = [lerp(0.05, -1.2, k), 0, lerp(0.12, 1.0, k)]; a1 = [lerp(0.05, -1.2, k), 0, lerp(-0.12, -1.0, k)]; T.rotation.x = -0.15 * k; J.head.rotation.x = -0.3 * k; if (Math.floor(t * 8) !== U.br) { U.br = Math.floor(t * 8); U.events.push('breath'); } }   // drinks the heat out of the air: frost breath
    else if (state === 'attack') { const k = cl(t / 0.6), s = ease(cl(k / 0.4)); a0 = [lerp(-1.2, 0.4, s), 0, lerp(1.0, -0.4, s)]; a1 = [lerp(-1.2, 0.4, s), 0, lerp(-1.0, 0.4, s)]; T.rotation.x = 0.3 * s; J.hips.position.z = s * 0.5; if (k > 0.35 && !U.hit) { U.hit = true; U.events.push('chill'); } }
    else if (state === 'recover') { T.rotation.x = 0.25; a0 = [0.3, 0, 0.3]; a1 = [0.3, 0, -0.3]; J.hips.position.z = 0.5; }
    else if (state === 'hurt') T.position.x = Math.sin(t * 50) * 0.03;
    else if (state === 'stagger') { T.rotation.z = Math.sin(t * 4) * 0.2; legA = Math.sin(t * 4) * 0.15; }
    else if (state === 'armorBreak') { if (t < dt * 1.5) U.events.push('flake', 'flake', 'flake'); }
    else if (state === 'die') { const k = ease(cl(t / 1.6)); g.scale.setScalar(Math.max(0.01, 1 - k)); J.hips.position.y = 1.25 - 0.6 * k; if (t > 0.2 && !U.dd) { U.dd = true; U.events.push('dust'); } }
    if (state !== 'die') { g.scale.setScalar(1); U.dd = false; J.legs.forEach(L => L.p.rotation.set(L.s * legA, 0, 0)); }
    if (state !== 'attack') U.hit = false;
    J.arms[0].sh.rotation.set(a0[0], a0[1], a0[2]); J.arms[1].sh.rotation.set(a1[0], a1[1], a1[2]);
    U.weakMat.emissiveIntensity = state === 'recover' || state === 'stagger' ? 1.2 + Math.sin(t * 10) * 0.4 : 0.25;
  }
  function buildCinder(name) {
    const g = new THREE.Group(), J = {}, rock = toon('#1f1a19'), rock2 = toon('#2e2725');
    const body = new THREE.Group(); body.position.y = 0.3; g.add(body); J.body = body;
    const heartMat = new THREE.MeshToonMaterial({ color: '#fff2b0', emissive: new THREE.Color('#ff5a1a'), emissiveIntensity: 1.6, gradientMap: toon('#fff').gradientMap });
    const heart = M(new THREE.SphereGeometry(0.8, 18, 14), heartMat, 0, 2.2, 0, body, 0, 0.8); J.heart = heart;   // the mountain's own body between the ribs
    M(new THREE.SphereGeometry(1.1, 16, 12), new THREE.MeshBasicMaterial({ color: '#ff5a1a', transparent: true, opacity: 0.18, depthWrite: false }), 0, 2.2, 0, body, 0);
    M(new THREE.CylinderGeometry(0.2, 0.25, 3.2, 8), rock, 0, 2.0, -0.85, body, 0.03, 0.25);   // spine
    J.ribs = []; for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const r = M(new THREE.TorusGeometry(1.15 - Math.abs(i - 2) * 0.1, 0.11, 6, 16, Math.PI * 0.85), i % 2 ? rock : rock2, 0, 1.2 + i * 0.42, -0.1, body, 0.03); r.rotation.set(0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0); r.rotation.order = 'YXZ'; r.rotation.x = 0.15; r.userData.home = { y: r.position.y, s }; J.ribs.push(r); }
    // a skull of black rock; two huge arms made of cooled flows
    const head = new THREE.Group(); head.position.set(0, 3.6, 0.1); body.add(head); J.head = head; M(new THREE.DodecahedronGeometry(0.6, 0), rock, 0, 0, 0, head, 0.04, 0.6);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshBasicMaterial({ color: '#fff2b0' })); e.position.set(s * 0.22, 0.05, 0.5); head.add(e); }
    J.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 1.3, 3.1, 0); body.add(sh); M(new THREE.DodecahedronGeometry(0.45, 0), rock2, 0, 0, 0, sh, 0.03, 0.45); M(new THREE.CylinderGeometry(0.28, 0.22, 1.5, 7), rock, 0, -0.8, 0, sh, 0.03, 0.28); const el = new THREE.Group(); el.position.y = -1.55; sh.add(el); M(new THREE.SphereGeometry(0.22, 8, 6), heartMat, 0, 0, 0, el, 0); M(new THREE.CylinderGeometry(0.24, 0.32, 1.3, 7), rock2, 0, -0.65, 0, el, 0.03, 0.32); M(new THREE.DodecahedronGeometry(0.5, 0), rock, 0, -1.4, 0.1, el, 0.035, 0.5); return { sh, el, s }; });
    for (const s of [-1, 1]) M(new THREE.DodecahedronGeometry(0.7, 0), rock, s * 0.8, 0.5, 0, body, 0.04, 0.7).scale.set(1, 1.4, 1.2);
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'cinder', variant: name, joints: J, weak: heart, weakMat: heartMat, weakBase: new THREE.Color('#ff5a1a'), slabColor: '#ff8a1a', calls, height: 4.6, reach: 3.0, phase: 1, boss: true, events: [] });
    return g;
  }
  function enterCinder(g, state) { const U = g.userData; if (state === 'armorBreak') U.phase = Math.min(3, U.phase + 1); }
  function animateCinder(g, state, t, dt) {
    const U = g.userData, J = U.joints, B = J.body, ph = U.phase; B.position.set(0, 0.3, 0); B.rotation.set(0, 0, 0); J.head.rotation.set(0, 0, 0);
    let a0 = [0.1, 0, 0.2, -0.2], a1 = [0.1, 0, -0.2, -0.2], beat = 1 + Math.sin(t * (ph * 2.5)) * 0.06 * ph;
    if (state === 'idle') { B.position.y += Math.sin(t * 0.8) * 0.04; J.head.rotation.y = Math.sin(t * 0.4) * 0.3; }
    else if (state === 'move') { B.rotation.y = Math.sin(t * 1.1) * 0.35; B.position.y += Math.abs(Math.sin(t * 2.2)) * 0.06; }
    else if (state === 'windup') { const k = ease(cl(t / 1.0));
      if (ph === 1) { a1 = [lerp(0.1, -1.4, k), 0, lerp(-0.2, 1.4, k), -0.4]; B.rotation.y = -0.4 * k; }
      else if (ph === 2) { a0 = [lerp(0.1, -3.0, k), 0, 0.3, -0.3]; a1 = [lerp(0.1, -3.0, k), 0, -0.3, -0.3]; J.head.rotation.x = -0.5 * k; beat = 1 + k * 0.3; }
      else { B.position.y -= 0.3 * k; J.head.rotation.x = -0.6 * k; beat = 1 + k * 0.5 + Math.sin(t * 30) * 0.05; } }
    else if (state === 'attack') { const k = cl(t / 0.8), s = ease(cl(k / 0.5));
      if (ph === 1) { a1 = [-1.4, 0, lerp(1.4, -1.6, s), -0.4]; B.rotation.y = lerp(-0.4, 0.6, s); if (k > 0.35 && !U.f) { U.f = true; U.events.push('sweep'); } }   // a flat sweep: jump it
      else if (ph === 2) { a0 = [lerp(-3.0, 0.6, s), 0, 0.2, -0.1]; a1 = [lerp(-3.0, 0.6, s), 0, -0.2, -0.1]; if (k > 0.45 && !U.f) { U.f = true; U.events.push('slam', 'rain'); } }   // slams: lava rains on blue discs
      else { beat = 1.5 - k * 0.4; J.head.rotation.x = 0.3 * s; if (k > 0.2 && !U.f) { U.f = true; U.events.push('nova'); } } }   // the heart flares: a ring of fire rolls outward
    else if (state === 'recover') { B.rotation.x = 0.15; B.position.y -= 0.2; a0 = [0.5, 0, 0.3, -0.1]; a1 = [0.5, 0, -0.3, -0.1]; beat = 1.15; }
    else if (state === 'hurt') B.position.x = Math.sin(t * 40) * 0.06;
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 3) * 0.1; J.head.rotation.z = Math.sin(t * 4) * 0.2; }
    else if (state === 'armorBreak') { const k = cl(t / 1.4); B.rotation.x = -0.15 * Math.sin(k * Math.PI); if (t < dt * 1.5) U.events.push('roar', 'chunks'); }
    else if (state === 'die') { const k = ease(cl(t / 2.0)); B.position.y = 0.3 - 1.2 * k; B.rotation.x = 0.4 * k; beat = Math.max(0.2, 1 - k); if (t > 2.1 && B.visible) { B.visible = false; U.events.push('explode'); } }
    if (state !== 'die') B.visible = true; if (state !== 'attack') U.f = false;
    // ribs break away phase by phase; the heart pulses faster
    J.ribs.forEach((r, i) => { const gone = (ph >= 2 && i < 4) || (ph >= 3 && i < 8); r.visible = !gone; });
    J.heart.scale.setScalar(beat); U.weakMat.emissiveIntensity = 1.4 + ph * 0.4 + (state === 'recover' ? Math.sin(t * 10) * 0.5 : 0);
    const set = (A, a) => { A.sh.rotation.set(a[0], a[1], a[2]); A.el.rotation.x = a[3]; }; set(J.arms[0], a0); set(J.arms[1], a1);
  }
  function buildHornet(name) {
    const lancer = /Lancer/.test(name), g = new THREE.Group(), J = {}, yel = toon(lancer ? '#ff8a1a' : '#ffd23a'), blk = toon('#1a1a1e');
    const body = new THREE.Group(); body.position.y = 1.6; g.add(body); J.body = body;
    M(new THREE.SphereGeometry(0.14, 12, 10), blk, 0, 0, 0.12, body, 0.015, 0.14).scale.set(1, 0.9, 1.1);
    const ab = new THREE.Group(); ab.position.z = -0.05; body.add(ab); J.ab = ab;
    for (let i = 0; i < 4; i++) { const r = 0.17 - Math.abs(i - 1.2) * 0.03; M(new THREE.SphereGeometry(r, 12, 9), i % 2 ? blk : yel, 0, -0.02 * i, -0.1 - i * 0.12, ab, 0.012, r).scale.set(1, 0.9, 0.7); }
    const sting = M(new THREE.ConeGeometry(0.04, 0.2, 6), blk, 0, -0.1, -0.62, ab, 0.008); sting.rotation.x = -Math.PI / 2 - 0.3;
    const weakMat = new THREE.MeshToonMaterial({ color: '#fff', emissive: new THREE.Color(lancer ? '#ff3b3b' : '#ffd23a'), emissiveIntensity: 0, gradientMap: toon('#fff').gradientMap });
    const bead = M(new THREE.SphereGeometry(0.05, 8, 6), weakMat, 0, -0.14, -0.7, ab, 0, 0.05); J.bead = bead;
    const head = new THREE.Group(); head.position.z = 0.32; body.add(head); M(new THREE.SphereGeometry(0.11, 10, 8), yel, 0, 0, 0, head, 0.012, 0.11);
    for (const s of [-1, 1]) { M(new THREE.SphereGeometry(0.06, 8, 6), toon('#5a1a1a'), s * 0.07, 0.03, 0.05, head, 0); const an = M(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 4), blk, s * 0.04, 0.12, 0.06, head, 0); an.rotation.set(0.6, 0, s * 0.3); }
    const wm = new THREE.MeshBasicMaterial({ color: '#dff4ff', transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
    J.wings = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.08, 0.1, 0.1); body.add(p); const w = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.14), wm); w.position.x = s * 0.22; p.add(w); return { p, s }; });
    if (lancer) { J.spear = M(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 5), blk, 0.12, -0.12, 0.2, body, 0.006); J.spear.rotation.x = Math.PI / 2; }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'hornet', variant: name, joints: J, weak: bead, weakMat, weakBase: new THREE.Color('#ffd23a'), slabColor: '#ffd23a', calls, height: 1.9, reach: lancer ? 0 : 1.2, flock: true, ranged: lancer, laneAngles: lancer ? [0] : null, events: [] });
    return g;
  }
  function animateHornet(g, state, t0, dt, opts = {}) {
    const U = g.userData, J = U.joints, B = J.body, lancer = U.ranged, delay = ((opts.off || 0) / 1.3) * 0.2, t = Math.max(0, t0 - (state === 'attack' || state === 'windup' ? delay : 0));
    B.position.set(Math.sin(t0 * 1.7 + (opts.off || 0)) * 0.12, 1.6 + Math.sin(t0 * 3 + (opts.off || 0)) * 0.08, 0); B.rotation.set(0, 0, 0); let buzz = 60, glow = 0;
    if (state === 'move') { B.position.x = Math.sin(t0 * 2.4) * 0.5; B.rotation.z = Math.cos(t0 * 2.4) * 0.3; }
    else if (state === 'windup') { const k = cl(t / 0.7); B.position.z = -0.5 * ease(k); B.position.y += 0.4 * k; J.ab.rotation.x = 0.8 * k; glow = k * 2; }   // the sting bead lights first
    else if (state === 'attack') { const k = cl(t / 0.6); if (lancer) { J.ab.rotation.x = 0.8; if (k > 0.1 && !U.thrown) { U.thrown = true; U.events.push('stingShot'); } glow = 1 - k; } else { B.position.z = lerp(-0.5, 2.4, ease(k)); B.position.y = 2.0 - Math.sin(k * Math.PI) * 0.9; B.rotation.x = 0.4 * Math.sin(k * Math.PI); J.ab.rotation.x = 1.0; glow = 2; if (k > 0.5 && !U.thrown) { U.thrown = true; U.events.push('swing'); } } buzz = 90; }   // one after another, never together
    else if (state === 'recover') { B.position.z = lancer ? 0 : 2.4; B.position.y = 1.9; B.rotation.z = Math.sin(t * 8) * 0.2; }
    else if (state === 'hurt') B.position.x += Math.sin(t * 60) * 0.05;
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 9) * 0.6; B.position.y -= 0.4; buzz = 25; }
    else if (state === 'die') { const k = cl(t0 / 0.9); B.position.y = 1.6 * (1 - k * k); B.rotation.z = k * 6; buzz = 20 * (1 - k); }
    if (state !== 'attack') U.thrown = false; if (state !== 'windup' && state !== 'attack') J.ab.rotation.x = 0;
    J.wings.forEach(w => w.p.rotation.z = w.s * Math.sin(t0 * buzz) * 0.6);
    U.weakMat.emissiveIntensity = glow;
  }
  function buildThorn(name) {
    const stump = /Root/.test(name), g = new THREE.Group(), J = {}, bark = toon(stump ? '#6b4a35' : '#4a3a2a'), bark2 = toon(stump ? '#5a3d2b' : '#3a2e22'), thornM = toon('#c9b48a');
    const body = new THREE.Group(); body.position.y = 0.7; g.add(body); J.body = body;
    if (stump) { M(new THREE.CylinderGeometry(0.5, 0.6, 1.0, 10), bark, 0, 0.35, 0, body, 0.03, 0.6); M(new THREE.CylinderGeometry(0.46, 0.46, 0.04, 10), toon('#c9a173'), 0, 0.86, 0, body, 0, 0.46); for (let i = 0; i < 3; i++) M(new THREE.TorusGeometry(0.15 + i * 0.12, 0.012, 4, 16), toon('#8a6a4a'), 0, 0.885, 0, body, 0).rotation.x = Math.PI / 2; }
    else { const log = M(new THREE.CylinderGeometry(0.42, 0.48, 1.6, 9), bark, 0, 0.2, 0, body, 0.03, 0.48); log.rotation.x = Math.PI / 2; for (const z of [-0.5, 0.2]) { const br = M(new THREE.CylinderGeometry(0.06, 0.1, 0.8, 6), bark2, 0.3, 0.6, z, body, 0.015, 0.1); br.rotation.z = -0.6; } }
    J.thorns = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const th = M(new THREE.ConeGeometry(0.05, 0.36, 5), thornM, Math.cos(a) * 0.42, 0.2 + Math.sin(a) * 0.42, 0.72 - (i % 3) * 0.12, body, 0.008); th.rotation.x = Math.PI / 2; th.userData.base = th.scale.clone(); J.thorns.push(th); }   // all the thorns face front
    const weakMat = new THREE.MeshToonMaterial({ color: '#7fb04a', emissive: new THREE.Color('#ffd23a'), emissiveIntensity: 0, gradientMap: toon('#fff').gradientMap });
    const moss = M(new THREE.SphereGeometry(0.32, 10, 8), weakMat, 0, 0.5, -0.55, body, 0.015, 0.32); moss.scale.set(1, 0.4, 1);   // soft mossy back: flank it
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffd23a' })); e.position.set(s * 0.16, 0.36, stump ? 0.55 : 0.8); body.add(e); }
    J.legs = []; for (const s of [-1, 1]) for (const z of [-0.45, 0.45]) { const p = new THREE.Group(); p.position.set(s * 0.38, -0.05, z); body.add(p); const r = M(new THREE.CylinderGeometry(0.06, 0.04, 0.7, 5), bark2, s * 0.1, -0.3, 0, p, 0.012, 0.06); r.rotation.z = s * 0.35; J.legs.push({ p, s, ph: (s > 0 ? 0 : Math.PI) + (z > 0 ? Math.PI : 0) }); }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'thorn', variant: name, joints: J, weak: moss, weakMat, weakBase: new THREE.Color('#ffd23a'), slabColor: '#6b4a35', calls, height: 1.5, reach: 1.3, events: [] });
    return g;
  }
  function animateThorn(g, state, t, dt) {
    const U = g.userData, J = U.joints, B = J.body; B.position.set(0, 0.7, 0); B.rotation.set(0, 0, 0); let amp = 0, bristle = 1;
    if (state === 'idle') B.rotation.z = Math.sin(t * 0.8) * 0.03;
    else if (state === 'move') { amp = 0.4; B.position.y += Math.abs(Math.sin(t * 6)) * 0.04; }
    else if (state === 'windup') { const k = cl(t / 0.6); bristle = 1 + ease(k) * 0.9; B.position.z = -0.25 * k; B.rotation.x = 0.1 * k; if (k > 0.3 && !U.br) { U.br = true; U.events.push('bristle'); } }   // thorns bristle
    else if (state === 'attack') { const k = cl(t / 0.5); bristle = 1.9; B.position.z = lerp(-0.25, 1.2, ease(cl(k / 0.4))); amp = 0.7; if (k > 0.35 && !U.hit) { U.hit = true; U.events.push('slam'); } }
    else if (state === 'recover') { B.position.z = 1.2; B.rotation.x = 0.18; bristle = 0.7; }
    else if (state === 'hurt') { B.position.x = Math.sin(t * 50) * 0.03; bristle = 1.6; }
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 4) * 0.2; amp = 0.2; }
    else if (state === 'armorBreak') { bristle = Math.max(0.01, 1 - cl(t / 0.5)); if (t < dt * 1.5) U.events.push('chunks'); }
    else if (state === 'die') { const k = ease(cl(t / 1.0)); B.position.y = lerp(0.7, 0.3, k); B.rotation.z = 0.6 * k; J.legs.forEach(L => L.p.rotation.z = -L.s * 0.8 * k); }
    if (state !== 'windup') U.br = false; if (state !== 'attack') U.hit = false;
    J.thorns.forEach((th, i) => th.scale.set(1, 1, 1).multiplyScalar(bristle * (state === 'windup' ? 1 + Math.sin(t * 30 + i) * 0.05 : 1)));
    if (state !== 'die') J.legs.forEach(L => L.p.rotation.x = Math.sin(t * 6 + L.ph) * amp);
    U.weakMat.emissiveIntensity = state === 'recover' || state === 'stagger' ? 0.7 + Math.sin(t * 12) * 0.4 : 0;
  }
  const SPORE = { 'Sporeling': ['#a855f7', '#e9d5ff'], 'Glowspite': ['#22d3ee', '#cffafe'], 'Seedcaster': ['#84cc16', '#ecfccb'] };
  function buildSpore(name) {
    const [c1, c2] = SPORE[name] || SPORE['Sporeling'], g = new THREE.Group(), J = {}, stalk = toon('#f1e6d0');
    const body = new THREE.Group(); body.position.y = 0.25; g.add(body); J.body = body;
    M(new THREE.CylinderGeometry(0.13, 0.17, 0.45, 10), stalk, 0, 0.22, 0, body, 0.015, 0.17);
    const weakMat = new THREE.MeshToonMaterial({ color: c1, emissive: new THREE.Color(c1), emissiveIntensity: 0.8, gradientMap: toon('#fff').gradientMap });
    const cap = M(new THREE.SphereGeometry(0.36, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), weakMat, 0, 0.42, 0, body, 0.02, 0.36); cap.scale.y = 0.75; J.cap = cap;
    for (let i = 0; i < 6; i++) { const a = i * 1.05; M(new THREE.SphereGeometry(0.045, 6, 5), toon(c2), Math.cos(a) * 0.22, 0.6 - (i % 2) * 0.04, Math.sin(a) * 0.22, body, 0); }
    for (const s of [-1, 1]) { M(new THREE.SphereGeometry(0.045, 8, 6), toon('#ffffff'), s * 0.07, 0.3, 0.14, body, 0); M(new THREE.SphereGeometry(0.022, 6, 5), toon('#1a1a1e'), s * 0.07, 0.3, 0.18, body, 0); }
    J.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.08, 0, 0); body.add(p); M(new THREE.CylinderGeometry(0.03, 0.035, 0.24, 5), stalk, 0, -0.12, 0, p, 0.008, 0.035); return { p, s }; });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'spore', variant: name, joints: J, weak: cap, weakMat, weakBase: new THREE.Color(c1), slabColor: c1, calls, height: 0.85, reach: name === 'Sporeling' ? 0.9 : 0, flock: true, ranged: name !== 'Sporeling', lobber: name === 'Seedcaster', laneAngles: name === 'Glowspite' ? null : [0], events: [] });
    return g;
  }
  function animateSpore(g, state, t, dt, opts = {}) {
    const U = g.userData, J = U.joints, B = J.body, o = opts.off || 0, nm = U.variant; B.position.set(0, 0.25, 0); B.rotation.set(0, 0, 0); let sq = 1, glow = 0.8 + 0.3 * Math.sin(t * 2 + o);
    if (state === 'idle') { sq = 1 + Math.sin(t * 2.4 + o) * 0.05; B.rotation.z = Math.sin(t * 1.3 + o) * 0.08; }
    else if (state === 'move') { B.position.y += Math.abs(Math.sin(t * 9 + o)) * 0.2; sq = 1 + Math.sin(t * 18 + o) * 0.08; }
    else if (state === 'windup') { const k = cl(t / 0.9); sq = 1 - 0.3 * ease(k); glow = 0.8 + k * 2; }   // squashes down, cap brightens
    else if (state === 'attack') { const k = cl(t / 0.5); sq = lerp(0.7, 1.3, ease(cl(k / 0.3))); if (nm === 'Sporeling') { B.position.z = Math.sin(k * Math.PI) * 0.8; B.position.y += Math.sin(k * Math.PI) * 0.4; } if (k > 0.2 && !U.f) { U.f = true; U.events.push(nm === 'Seedcaster' ? 'seeds' : nm === 'Glowspite' ? 'spores' : 'swing'); } glow = 2.4; }
    else if (state === 'recover') { sq = 0.9; glow = 0.4; }
    else if (state === 'hurt') B.position.x = Math.sin(t * 60) * 0.03;
    else if (state === 'stagger') B.rotation.z = Math.sin(t * 7) * 0.4;
    else if (state === 'die') { const k = cl(t / 0.6); sq = Math.max(0.05, 1 - k); glow = 0.8 * (1 - k); if (!U.pf) { U.pf = true; U.events.push('spores'); } }
    if (state !== 'attack') U.f = false; if (state !== 'die') U.pf = false;
    B.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)); J.legs.forEach((L, i) => L.p.rotation.x = state === 'move' ? Math.sin(t * 18 + i * Math.PI) * 0.6 : 0);
    U.weakMat.emissiveIntensity = glow;
  }
  function buildQueen(name) {
    const g = new THREE.Group(), J = {}, yel = toon('#e0a020'), blk = toon('#1a1a1e'), gold = toon('#ffd23a');
    const perch = M(new THREE.CylinderGeometry(1.6, 1.8, 0.4, 10), toon('#6b4a35'), 0, 0.2, 0, g, 0.03, 1.8);   // the top landing of the giant tree
    const body = new THREE.Group(); body.position.y = 2.2; g.add(body); J.body = body;
    M(new THREE.SphereGeometry(0.42, 14, 12), blk, 0, 0, 0.3, body, 0.025, 0.42).scale.set(1, 0.95, 1.15);
    const ab = new THREE.Group(); ab.position.z = -0.1; body.add(ab); J.ab = ab;
    for (let i = 0; i < 5; i++) { const r = 0.5 - Math.abs(i - 1.5) * 0.08; M(new THREE.SphereGeometry(r, 14, 10), i % 2 ? blk : yel, 0, -0.06 * i, -0.3 - i * 0.34, ab, 0.02, r).scale.set(1, 0.9, 0.7); }
    const weakMat = new THREE.MeshToonMaterial({ color: '#fff', emissive: new THREE.Color('#ff3b3b'), emissiveIntensity: 0.5, gradientMap: toon('#fff').gradientMap });
    const sting = M(new THREE.ConeGeometry(0.1, 0.55, 8), blk, 0, -0.3, -2.0, ab, 0.012); sting.rotation.x = -Math.PI / 2 - 0.3; const bead = M(new THREE.SphereGeometry(0.12, 10, 8), weakMat, 0, -0.42, -2.2, ab, 0, 0.12);
    const head = new THREE.Group(); head.position.set(0, 0.12, 0.85); body.add(head); J.head = head; M(new THREE.SphereGeometry(0.3, 12, 10), yel, 0, 0, 0, head, 0.02, 0.3);
    for (const s of [-1, 1]) { M(new THREE.SphereGeometry(0.15, 10, 8), toon('#5a1a1a'), s * 0.18, 0.06, 0.14, head, 0.01); const an = M(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5), blk, s * 0.12, 0.38, 0.1, head, 0.008); an.rotation.set(0.6, 0, s * 0.4); }
    for (let i = 0; i < 5; i++) { const a = (i / 4 - 0.5) * 2.2; const c = M(new THREE.ConeGeometry(0.06, 0.22, 4), gold, Math.sin(a) * 0.2, 0.32 + (i === 2 ? 0.06 : 0), Math.cos(a) * 0.1 - 0.05, head, 0.01); } M(new THREE.TorusGeometry(0.2, 0.03, 6, 16), gold, 0, 0.26, -0.03, head, 0).rotation.x = Math.PI / 2;   // the crown
    const wm = new THREE.MeshBasicMaterial({ color: '#dff4ff', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
    J.wings = []; for (const s of [-1, 1]) for (const [y, w] of [[0.3, 1.6], [0.15, 1.1]]) { const p = new THREE.Group(); p.position.set(s * 0.25, y, 0.2); body.add(p); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.32), wm); m.position.x = s * w / 2; p.add(m); J.wings.push({ p, s }); }
    J.legs = []; for (const s of [-1, 1]) for (const z of [0.5, 0.2, -0.1]) { const p = new THREE.Group(); p.position.set(s * 0.3, -0.3, z); body.add(p); const l = M(new THREE.CylinderGeometry(0.03, 0.02, 0.7, 5), blk, s * 0.2, -0.3, 0, p, 0.008); l.rotation.z = s * 0.6; J.legs.push({ p, s }); }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'queen', variant: name, joints: J, weak: bead, weakMat, weakBase: new THREE.Color('#ff3b3b'), slabColor: '#ffd23a', calls, height: 3.6, reach: 2.0, phase: 1, boss: true, events: [] });
    return g;
  }
  function enterQueen(g, state) { if (state === 'armorBreak') g.userData.phase = Math.min(3, g.userData.phase + 1); }
  function animateQueen(g, state, t, dt) {
    const U = g.userData, J = U.joints, B = J.body, ph = U.phase, grounded = ph >= 3; let buzz = grounded ? 4 : 50, wingAmp = grounded ? 0.15 : 0.55;
    B.position.set(0, grounded ? 0.9 : 2.2 + Math.sin(t * 2) * 0.12, 0); B.rotation.set(0, 0, 0); J.ab.rotation.x = 0; J.head.rotation.set(0, 0, 0);
    if (state === 'move') { B.rotation.y = Math.sin(t * 1.2) * 0.5; }
    else if (state === 'windup') { const k = cl(t / 1.1); if (ph === 1) { J.ab.rotation.x = 0.6 * k; B.position.y += 0.3 * k; } else if (ph === 2) { B.position.z = -0.4 * k; wingAmp = 0.2; buzz = 8; B.rotation.x = -0.2 * k; } else { B.rotation.x = -0.3 * k; J.head.rotation.x = -0.4 * k; } }
    else if (state === 'attack') { const k = cl(t / 1.0); if (ph === 1) { J.ab.rotation.x = 0.6; if (!U.f) { U.f = true; U.events.push('summon'); } } else if (ph === 2) { wingAmp = 0.9; buzz = 30; B.rotation.x = 0.15; if (Math.floor(t * 10) !== U.gu) { U.gu = Math.floor(t * 10); U.events.push('gust'); } } else { const s = ease(cl(k / 0.4)); B.position.z = s * 1.0; B.rotation.x = 0.4 * s; J.ab.rotation.x = 1.2 * s; if (k > 0.35 && !U.f) { U.f = true; U.events.push('slam'); } } }   // 1 hornet waves · 2 wings blow you to the edge · 3 lands and fights close
    else if (state === 'recover') { B.position.y -= grounded ? 0.15 : 0.5; B.rotation.x = 0.2; wingAmp = 0.1; buzz = 5; }
    else if (state === 'hurt') B.position.x = Math.sin(t * 50) * 0.05;
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 4) * 0.25; buzz = 10; }
    else if (state === 'armorBreak') { const k = cl(t / 1.2); B.position.y = lerp(B.position.y, ph >= 3 ? 0.9 : 2.2, k); if (t < dt * 1.5) U.events.push('roar'); }
    else if (state === 'die') { const k = ease(cl(t / 1.6)); B.position.y = lerp(B.position.y, 0.75, k); B.rotation.z = 1.2 * k; buzz = 30 * (1 - k); }
    if (state !== 'attack') { U.f = false; U.gu = -1; }
    J.wings.forEach((w, i) => w.p.rotation.z = w.s * Math.sin(t * buzz + i) * wingAmp + (grounded ? w.s * -0.4 : 0));
    J.legs.forEach((L, i) => L.p.rotation.x = grounded ? 0.4 : Math.sin(t * 2 + i) * 0.15);
    U.weakMat.emissiveIntensity = state === 'recover' || grounded ? 1.2 + Math.sin(t * 8) * 0.4 : 0.5;
  }
  function buildDeadfall(name) {
    const g = new THREE.Group(), J = {}, bark = toon('#5a4030'), bark2 = toon('#3f2e22'), leaf = toon('#4a6a3a');
    const body = new THREE.Group(); body.position.y = 0.2; g.add(body); J.body = body;
    for (const s of [-1, 1]) { const l = M(new THREE.CylinderGeometry(0.24, 0.3, 1.5, 8), bark2, s * 0.45, 0.75, 0, body, 0.025, 0.3); l.rotation.z = s * 0.12; }
    const tor = new THREE.Group(); tor.position.y = 1.5; body.add(tor); J.torso = tor;
    for (let i = 0; i < 6; i++) { const lg = M(new THREE.CylinderGeometry(0.2, 0.24, 1.6, 8), i % 2 ? bark : bark2, (i - 2.5) * 0.18, 0.8, (i % 2) * 0.12, tor, 0.02, 0.24); lg.rotation.z = (i - 2.5) * 0.12; }
    const weakMat = new THREE.MeshToonMaterial({ color: '#c8f08a', emissive: new THREE.Color('#9be35a'), emissiveIntensity: 0.3, gradientMap: toon('#fff').gradientMap });
    const heart = M(new THREE.SphereGeometry(0.28, 12, 10), weakMat, 0, 0.9, 0.24, tor, 0.015, 0.28);   // the green wood still alive at its middle
    const head = new THREE.Group(); head.position.y = 1.85; tor.add(head); J.head = head; M(new THREE.CylinderGeometry(0.34, 0.4, 0.6, 8), bark, 0, 0, 0, head, 0.025, 0.4);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#c8f08a' })); e.position.set(s * 0.14, 0.05, 0.36); head.add(e); }
    for (let i = 0; i < 5; i++) { const b = M(new THREE.CylinderGeometry(0.03, 0.06, 0.7, 5), bark2, (i - 2) * 0.16, 0.5, -0.05, head, 0.008); b.rotation.z = (i - 2) * 0.35; M(new THREE.IcosahedronGeometry(0.16, 0), leaf, (i - 2) * 0.28, 0.82, -0.05, head, 0.01); }
    J.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 0.65, 1.5, 0); tor.add(sh); M(new THREE.CylinderGeometry(0.16, 0.2, 1.2, 7), bark, 0, -0.55, 0, sh, 0.02, 0.2); const el = new THREE.Group(); el.position.y = -1.15; sh.add(el); M(new THREE.CylinderGeometry(0.13, 0.16, 1.0, 7), bark2, 0, -0.45, 0, el, 0.02, 0.16); for (let f = 0; f < 3; f++) { const fi = M(new THREE.CylinderGeometry(0.03, 0.05, 0.4, 5), bark2, (f - 1) * 0.08, -1.05, 0.05, el, 0.008); fi.rotation.z = (f - 1) * 0.4; } return { sh, el, s }; });
    const held = M(new THREE.CylinderGeometry(0.16, 0.18, 1.4, 8), bark, 0, -1.05, 0.1, J.arms[1].el, 0.02, 0.18); held.rotation.x = Math.PI / 2; held.visible = false; J.held = held;
    // the nearby trees it regrows from: chop them first
    J.trees = [-1, 1].map(s => { const tr = new THREE.Group(); tr.position.set(s * 2.0, 0, -0.9); g.add(tr); M(new THREE.CylinderGeometry(0.14, 0.2, 2.0, 7), bark, 0, 1.0, 0, tr, 0.02, 0.2); M(new THREE.IcosahedronGeometry(0.75, 0), leaf, 0, 2.3, 0, tr, 0.03, 0.75); return tr; });
    const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 5), new THREE.MeshBasicMaterial({ color: '#9be35a' })); vine.visible = false; g.add(vine); J.vine = vine;
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'deadfall', variant: name, joints: J, weak: heart, weakMat, weakBase: new THREE.Color('#9be35a'), slabColor: '#5a4030', calls, height: 4.2, reach: 0, treesLeft: 2, boss: false, events: [] });
    return g;
  }
  function enterDeadfall(g, state) { const U = g.userData; if (state === 'armorBreak' && U.treesLeft > 0) { U.treesLeft--; U.felling = U.treesLeft; U.events.push('chop'); } }
  function animateDeadfall(g, state, t, dt) {
    const U = g.userData, J = U.joints, T = J.torso; J.body.position.set(0, 0.2, 0); T.rotation.set(0, 0, 0); J.held.visible = false; J.vine.visible = false;
    let a0 = [0.15, 0, 0.15, -0.2], a1 = [0.15, 0, -0.15, -0.2];
    if (state === 'idle') { T.rotation.z = Math.sin(t * 0.6) * 0.03; J.head.rotation.y = Math.sin(t * 0.3) * 0.3; }
    else if (state === 'move') { T.rotation.z = Math.sin(t * 2) * 0.08; J.body.position.y += Math.abs(Math.sin(t * 2)) * 0.06; }
    else if (state === 'windup') { const k = ease(cl(t / 0.9)); a1 = [lerp(0.15, -2.6, k), 0, lerp(-0.15, 0.4, k), lerp(-0.2, -0.9, k)]; T.rotation.y = -0.4 * k; J.held.visible = t > 0.3; }   // tears a log off and hefts it
    else if (state === 'attack') { const k = cl(t / 0.7), s = ease(cl(k / 0.5)); a1 = [lerp(-2.6, 0.7, s), 0, lerp(0.4, -0.1, s), -0.2]; T.rotation.y = lerp(-0.4, 0.3, s); J.held.visible = k < 0.42; if (k > 0.42 && !U.f) { U.f = true; U.events.push('logThrow'); } }
    else if (state === 'recover') { a0 = [0.5, 0, 0.3, -0.1]; a1 = [0.5, 0, -0.3, -0.1]; T.rotation.x = 0.2; if (U.treesLeft > 0) { const tr = J.trees.find(q => q.visible); if (tr) { const a = tr.position.clone().setY(1.6), b = new THREE.Vector3(0, 2.6, 0); J.vine.visible = true; J.vine.position.copy(a).add(b).multiplyScalar(0.5); J.vine.scale.y = a.distanceTo(b); J.vine.lookAt(b); J.vine.rotateX(Math.PI / 2); } } }   // regrows from the nearest tree
    else if (state === 'hurt') T.position.x = Math.sin(t * 40) * 0.05;
    else if (state === 'stagger') { T.rotation.z = Math.sin(t * 3) * 0.15; }
    else if (state === 'armorBreak') { const tr = J.trees[U.felling]; if (tr) { tr.rotation.z = (U.felling ? 1 : -1) * ease(cl(t / 0.8)) * 1.5; } }
    else if (state === 'die') { const k = ease(cl(t / 2.0)); T.rotation.x = 1.4 * k; J.body.position.y = 0.2 - 0.8 * k; if (t > 2.0 && !U.dd) { U.dd = true; U.events.push('chunks'); } }
    if (state !== 'attack') U.f = false; if (state !== 'die') U.dd = false;
    J.trees.forEach((tr, i) => { tr.visible = i < U.treesLeft || (state === 'armorBreak' && i === U.felling); if (state !== 'armorBreak') tr.rotation.z = 0; });
    const set = (A, a) => { A.sh.rotation.set(a[0], a[1], a[2]); A.el.rotation.x = a[3]; }; set(J.arms[0], a0); set(J.arms[1], a1);
    U.weakMat.emissiveIntensity = U.treesLeft === 0 ? 1.4 + Math.sin(t * 8) * 0.4 : state === 'recover' ? 0.8 : 0.3;
  }
  function buildMole(name) {
    const warden = /Molewarden/.test(name), g = new THREE.Group(), J = {}, fur = toon(warden ? '#4a3a32' : '#6b5a4a'), pink = toon('#f4a6b8');
    J.holes = [[-1.1, 0.4], [1.0, 0.6], [0, 1.6]].map(([x, z]) => { const h = new THREE.Group(); h.position.set(x, 0, z); g.add(h); M(new THREE.TorusGeometry(0.42, 0.13, 6, 16), toon('#7a5a3a'), 0, 0.06, 0, h, 0.012).rotation.x = Math.PI / 2; const d = new THREE.Mesh(new THREE.CircleGeometry(0.36, 16), new THREE.MeshBasicMaterial({ color: '#1a1410' })); d.rotation.x = -Math.PI / 2; d.position.y = 0.03; h.add(d); return h; });
    const mole = new THREE.Group(); g.add(mole); J.mole = mole; const sc = warden ? 1.35 : 1;
    M(new THREE.CapsuleGeometry(0.28 * sc, 0.4 * sc, 4, 10), fur, 0, 0.45 * sc, 0, mole, 0.02);
    const head = new THREE.Group(); head.position.y = 0.85 * sc; mole.add(head); J.head = head;
    M(new THREE.SphereGeometry(0.24 * sc, 12, 10), fur, 0, 0, 0, head, 0.02); const nose = M(new THREE.SphereGeometry(0.08 * sc, 8, 6), pink, 0, -0.02, 0.24 * sc, head, 0.01);
    const weakMat = new THREE.MeshToonMaterial({ color: '#f4a6b8', emissive: new THREE.Color('#ffd23a'), emissiveIntensity: 0, gradientMap: toon('#fff').gradientMap }); nose.material = weakMat;
    for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.025 * sc, 6, 5), toon('#1a1a1e'), s * 0.09 * sc, 0.07 * sc, 0.2 * sc, head, 0);
    if (warden) { M(new THREE.CylinderGeometry(0.26, 0.3, 0.12, 12), toon('#c9a24a'), 0, 0.22, 0, head, 0.01); M(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff2b0' }), 0, 0.26, 0.2, head, 0); }   // a miner's helmet with a lamp
    J.paws = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.26 * sc, 0.65 * sc, 0.12 * sc); mole.add(p); M(new THREE.SphereGeometry(0.12 * sc, 8, 6), pink, 0, 0, 0, p, 0.01).scale.set(1.3, 0.5, 1); return p; });
    const clod = M(new THREE.DodecahedronGeometry(0.2, 0), toon('#6b4a2a'), 0, 0, 0.1, J.paws[1], 0.012); clod.visible = false; J.clod = clod;
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'mole', variant: name, joints: J, weak: nose, weakMat, weakBase: new THREE.Color('#ffd23a'), slabColor: '#6b4a2a', calls, height: 1.3 * sc, reach: warden ? 0 : 0.8, lobber: warden, hole: 0, warden, frame: 0, events: [] });
    delete g.userData.frame;
    return g;
  }
  function animateMole(g, state, t, dt) {
    const U = g.userData, J = U.joints, mo = J.mole; let up = 0, twitch = 0; J.clod.visible = false; J.head.rotation.set(0, 0, 0);
    if (state === 'idle' || state === 'move') { const cyc = state === 'move' ? 1.2 : 2.4, i = Math.floor(t / cyc) % 3, k = (t % cyc) / cyc; U.hole = i; up = k < 0.2 ? k / 0.2 : k < 0.6 ? 1 : k < 0.8 ? 1 - (k - 0.6) / 0.2 : 0; J.head.rotation.y = Math.sin(t * 4) * 0.5; }   // whack-a-mole
    else if (state === 'windup') { U.hole = 2; up = 0; twitch = 1; if (Math.floor(t * 8) !== U.tw) { U.tw = Math.floor(t * 8); U.events.push('dig'); } }   // the dirt mound twitches
    else if (state === 'attack') { U.hole = 2; const k = cl(t / 0.5); up = Math.min(1, k / 0.2); if (U.warden) { J.clod.visible = k < 0.45; J.paws[1].rotation.x = lerp(-2.4, 0.6, ease(cl(k / 0.5))); if (k > 0.45 && !U.f) { U.f = true; U.events.push('clod'); } } else { mo.position.z = 1.6 + Math.sin(k * Math.PI) * 0.5; if (k > 0.3 && !U.f) { U.f = true; U.events.push('swing'); } } }
    else if (state === 'recover') { U.hole = 2; up = 1; J.head.rotation.z = Math.sin(t * 6) * 0.3; J.head.rotation.x = 0.2; }   // dazed: hit it now
    else if (state === 'hurt') { up = 1; J.head.rotation.x = -0.3; }
    else if (state === 'stagger') { up = 1; J.head.rotation.z = Math.sin(t * 8) * 0.4; }
    else if (state === 'die') { up = Math.max(0, 1 - t); J.head.rotation.z = 0.8; }
    else up = 1;
    if (state !== 'attack') { U.f = false; J.paws[1].rotation.x = 0; } if (state !== 'windup') U.tw = -1;
    const h = J.holes[U.hole]; if (state !== 'attack' || U.warden) { mo.position.x = h.position.x; mo.position.z = h.position.z; } else mo.position.x = h.position.x;
    mo.position.y = -1.1 * (1 - up) * (U.warden ? 1.35 : 1); mo.visible = up > 0.02;
    J.holes.forEach((q, i) => q.position.y = i === U.hole && twitch ? Math.abs(Math.sin(t * 30)) * 0.05 : 0);
    U.weakMat.emissiveIntensity = state === 'recover' ? 0.8 + Math.sin(t * 12) * 0.4 : 0;
  }
  // UR: the lab's escaped creatures, one body plan in three builds. Every one still wears its collar and tag.
  const UR = { 'Reed Runner': { kind: 'runner', h: 0.55 }, 'Tall One': { kind: 'tall', h: 2.5 }, 'Spitter (Ur)': { kind: 'spit', h: 2.0 } };
  function buildUr(name) {
    const V = UR[name] || UR['Reed Runner'], g = new THREE.Group(), J = {}, skin = toon('#9aa48a'), skin2 = toon('#6f7a62'), collarM = toon('#c9a24a');
    const weakMat = new THREE.MeshToonMaterial({ color: '#d8d0c0', emissive: new THREE.Color('#ffd23a'), emissiveIntensity: 0, gradientMap: toon('#fff').gradientMap });
    const tagC = document.createElement('canvas'); tagC.width = 64; tagC.height = 32; const tx = tagC.getContext('2d'); tx.fillStyle = '#e8e4dc'; tx.fillRect(0, 0, 64, 32); tx.fillStyle = '#1a1a1e'; tx.font = '900 18px Archivo, Arial'; tx.fillText(V.kind === 'runner' ? 'R-11' : V.kind === 'tall' ? 'T-04' : 'S-07', 6, 23); const tagT = new THREE.CanvasTexture(tagC);
    const tag = () => { const t = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.07), new THREE.MeshBasicMaterial({ map: tagT, side: THREE.DoubleSide })); return t; };
    if (V.kind === 'runner') {
      const body = new THREE.Group(); body.position.y = 0.4; g.add(body); J.body = body;
      M(new THREE.CapsuleGeometry(0.14, 0.5, 4, 10), skin, 0, 0, 0, body, 0.015).rotation.x = Math.PI / 2;
      const head = new THREE.Group(); head.position.set(0, 0.08, 0.42); body.add(head); J.head = head; M(new THREE.SphereGeometry(0.12, 10, 8), skin, 0, 0, 0, head, 0.012).scale.set(0.9, 0.8, 1.3); for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.025, 6, 5), toon('#ffd23a'), s * 0.06, 0.04, 0.12, head, 0);
      const col = M(new THREE.TorusGeometry(0.1, 0.025, 6, 14), weakMat, 0, 0.06, 0.3, body, 0); col.rotation.x = 0.3; const tg = tag(); tg.position.set(0, -0.06, 0.38); body.add(tg);
      J.legs = []; for (const s of [-1, 1]) for (const z of [-0.22, 0.22]) { const p = new THREE.Group(); p.position.set(s * 0.1, -0.05, z); body.add(p); M(new THREE.CylinderGeometry(0.025, 0.02, 0.36, 5), skin2, 0, -0.18, 0, p, 0.008); J.legs.push({ p, ph: (s > 0 ? 0 : Math.PI) + (z > 0 ? Math.PI : 0) }); }
      const tail = M(new THREE.CylinderGeometry(0.02, 0.005, 0.4, 5), skin2, 0, 0.05, -0.45, body, 0.006); tail.rotation.x = -1.1;
      Object.assign(g.userData, { weak: col, reach: 1.1, flock: true, height: 0.6 });
    } else {
      const tall = V.kind === 'tall', hipY = tall ? 1.25 : 1.0;
      const hips = new THREE.Group(); hips.position.y = hipY; g.add(hips); J.hips = hips;
      J.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.12, 0, 0); hips.add(p); M(new THREE.CylinderGeometry(0.05, 0.04, hipY * 0.55, 6), skin, 0, -hipY * 0.27, 0, p, 0.01); const kn = new THREE.Group(); kn.position.y = -hipY * 0.55; p.add(kn); M(new THREE.CylinderGeometry(0.04, 0.03, hipY * 0.45, 6), skin2, 0, -hipY * 0.22, 0, kn, 0.01); return { p, kn, s }; });
      const tor = new THREE.Group(); hips.add(tor); J.torso = tor; tor.rotation.x = tall ? 0.15 : 0.35;
      M(new THREE.CapsuleGeometry(0.16, tall ? 0.6 : 0.45, 4, 10), skin, 0, 0.42, 0, tor, 0.015);
      const head = new THREE.Group(); head.position.y = tall ? 0.95 : 0.82; tor.add(head); J.head = head; M(new THREE.SphereGeometry(0.15, 10, 8), skin, 0, 0, 0.02, head, 0.012).scale.set(0.85, 1.1, 1.1);
      for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffd23a' })); e.position.set(s * 0.06, 0.03, 0.14); head.add(e); }
      const throat = M(new THREE.SphereGeometry(0.1, 10, 8), toon('#c8b0a0'), 0, -0.13, 0.08, head, 0.01); J.throat = throat;
      const col = M(new THREE.TorusGeometry(0.13, 0.03, 6, 14), weakMat, 0, tall ? 0.8 : 0.68, 0, tor, 0); col.rotation.x = Math.PI / 2; const tg = tag(); tg.position.set(0, tall ? 0.74 : 0.62, 0.15); tor.add(tg);
      const al = tall ? 1.3 : 0.75; J.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 0.2, tall ? 0.72 : 0.6, 0); tor.add(sh); M(new THREE.CylinderGeometry(0.035, 0.03, al * 0.5, 6), skin, 0, -al * 0.25, 0, sh, 0.008); const el = new THREE.Group(); el.position.y = -al * 0.5; sh.add(el); M(new THREE.CylinderGeometry(0.03, 0.025, al * 0.5, 6), skin2, 0, -al * 0.25, 0, el, 0.008); for (let f = 0; f < 3; f++) { const c = M(new THREE.ConeGeometry(0.015, 0.14, 4), toon('#2a2622'), (f - 1) * 0.025, -al * 0.5 - 0.06, 0, el, 0); c.rotation.x = Math.PI; } return { sh, el, s }; });
      Object.assign(g.userData, { weak: col, reach: tall ? 2.3 : 0, ranged: !tall, laneAngles: tall ? null : [0], height: V.h });
    }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'urbeast', kind: V.kind, variant: name, joints: J, weakMat, weakBase: new THREE.Color('#ffd23a'), slabColor: '#9aa48a', calls, events: [] });
    return g;
  }
  function animateUr(g, state, t, dt, opts = {}) {
    const U = g.userData, J = U.joints;
    if (U.kind === 'runner') { const B = J.body, o = opts.off || 0; B.position.set(0, 0.4, 0); B.rotation.set(0, 0, 0); let amp = 0, rate = 0;
      if (state === 'idle') { const a = t * 2 + o; B.position.x = Math.sin(a) * 0.3; B.rotation.y = Math.cos(a) * 0.6; amp = 0.5; rate = 18; }   // the pack circles
      else if (state === 'move') { amp = 0.8; rate = 30; }
      else if (state === 'windup') { B.position.y = 0.3; B.rotation.x = 0.15; amp = 0.1; rate = 40; }   // crouches before the dart
      else if (state === 'attack') { const k = cl(t / 0.5); B.position.z = Math.sin(k * Math.PI) * 1.6; B.position.y = 0.4 + Math.sin(k * Math.PI) * 0.25; amp = 1; rate = 34; if (k > 0.45 && !U.f) { U.f = true; U.events.push('swing'); } }
      else if (state === 'recover') { B.rotation.z = Math.sin(t * 6) * 0.2; }
      else if (state === 'stagger') { B.rotation.z = Math.sin(t * 9) * 0.5; }
      else if (state === 'die') { const k = cl(t / 0.4); B.rotation.z = 1.6 * k; B.position.y = 0.4 - 0.25 * k; }
      if (state !== 'attack') U.f = false;
      J.legs.forEach(L => L.p.rotation.x = Math.sin(t * rate + L.ph) * amp);
      U.weakMat.emissiveIntensity = state === 'recover' ? 0.8 : 0; return; }
    const tall = U.kind === 'tall', T = J.torso, hy = tall ? 1.25 : 1.0; J.hips.position.set(0, hy, 0); T.rotation.set(tall ? 0.15 : 0.35, 0, 0); J.head.rotation.set(0, 0, 0); J.throat.scale.setScalar(1);
    let a0 = [0.1, 0, 0.1, -0.1], a1 = [0.1, 0, -0.1, -0.1], legA = 0;
    if (state === 'idle') { if (tall && (t % 4) > 2.5) { /* freezes when looked at */ } else { T.rotation.z = Math.sin(t * 1.3) * 0.04; J.head.rotation.y = Math.sin(t * 0.9) * 0.6; a0[0] = 0.1 + Math.sin(t * 1.3) * 0.08; } }
    else if (state === 'move') { const w = t * (tall ? 4 : 6); legA = Math.sin(w) * 0.45; J.legs.forEach((L, i) => L.kn.rotation.x = Math.max(0, Math.sin(w + i * Math.PI)) * 0.7); a0[0] = -Math.sin(w) * 0.5; a1[0] = Math.sin(w) * 0.5; }
    else if (state === 'windup') { const k = ease(cl(t / 0.6)); if (tall) { J.hips.position.y = hy - 0.25 * k; T.rotation.x = 0.15 + 0.4 * k; a0 = [lerp(0.1, -0.6, k), 0, 0.5, -0.4]; a1 = [lerp(0.1, -0.6, k), 0, -0.5, -0.4]; } else { J.throat.scale.setScalar(1 + k * 0.9); J.head.rotation.x = -0.3 * k; T.rotation.x = 0.35 - 0.2 * k; } }   // Tall One coils; Spitter's throat swells
    else if (state === 'attack') { const k = cl(t / 0.5), s = ease(cl(k / 0.35)); if (tall) { J.hips.position.z = s * 1.1; T.rotation.x = 0.55 + 0.3 * s; a0 = [lerp(-0.6, -1.7, s), 0, 0.1, lerp(-0.4, 0, s)]; a1 = [lerp(-0.6, -1.7, s), 0, -0.1, lerp(-0.4, 0, s)]; if (k > 0.3 && !U.f) { U.f = true; U.events.push('swing'); } } else { J.throat.scale.setScalar(lerp(1.9, 0.8, s)); J.head.rotation.x = 0.2 * s; if (k > 0.1 && !U.f) { U.f = true; U.events.push('spit'); } } }
    else if (state === 'recover') { if (tall) { J.hips.position.z = 1.1; T.rotation.x = 0.7; a0 = [-1.2, 0, 0.2, 0]; a1 = [-1.2, 0, -0.2, 0]; } else { J.legs.forEach(L => L.p.rotation.x = Math.sin(t * 8) * 0.3); J.hips.position.z = -Math.min(1, t) * 0.8; } }   // Spitter backs off; Tall One overextended
    else if (state === 'hurt') T.position.x = Math.sin(t * 50) * 0.03;
    else if (state === 'stagger') { T.rotation.z = Math.sin(t * 5) * 0.2; legA = Math.sin(t * 5) * 0.15; }
    else if (state === 'die') { const k = ease(cl(t / 1.0)); J.hips.position.y = hy - (hy - 0.15) * k; T.rotation.x = 0.3 + 1.1 * k; J.legs.forEach(L => L.p.rotation.x = -1.3 * k); }
    if (state !== 'attack') U.f = false;
    if (state !== 'die' && state !== 'recover') J.legs.forEach(L => L.p.rotation.set(L.s * legA, 0, 0));
    J.arms.forEach((A, i) => { const a = i ? a1 : a0; A.sh.rotation.set(a[0], a[1], a[2]); A.el.rotation.x = a[3]; });
    U.weakMat.emissiveIntensity = state === 'recover' || state === 'stagger' ? 0.8 + Math.sin(t * 12) * 0.4 : 0;
  }
  const ATT = { 'Wrapped Attendant': ['#d8cdb4', '#ffd38a'], 'Ray Sentinel': ['#c9b48a', '#ff5a3a'], 'The Hall Warden': ['#b8a888', '#5fe3ff'], 'The Tallykeeper': ['#e0d4b8', '#c084fc'] };
  function buildAttendant(name) {
    const [lin, lc] = ATT[name] || ATT['Wrapped Attendant'], g = new THREE.Group(), J = {}, linen = toon(lin), linen2 = toon('#9a8a6a'), big = name === 'The Hall Warden' ? 1.2 : 1;
    const lightM = new THREE.MeshBasicMaterial({ color: lc });
    const body = new THREE.Group(); body.position.y = 0.2; g.add(body); J.body = body;
    M(new THREE.CylinderGeometry(0.5, 0.65, 0.4, 10), linen2, 0, 0.2, 0, body, 0.02, 0.65);
    const core = M(new THREE.CylinderGeometry(0.42, 0.5, 1.6, 12), lightM, 0, 1.2, 0, body, 0); J.core = core;   // the light inside
    J.wraps = []; for (let i = 0; i < 9; i++) { const w = M(new THREE.CylinderGeometry(0.47 - Math.abs(i - 4) * 0.008, 0.49, 0.16, 12, 1, true), i % 2 ? linen : linen2, 0, 0.5 + i * 0.17, 0, body, 0); w.material = w.material.clone(); w.material.side = THREE.DoubleSide; w.rotation.z = (i % 3 - 1) * 0.04; w.userData.home = w.position.clone(); J.wraps.push(w); }
    const head = new THREE.Group(); head.position.y = 2.15; body.add(head); J.head = head;
    M(new THREE.SphereGeometry(0.36, 12, 10), linen, 0, 0, 0, head, 0.02, 0.36).scale.set(1, 0.9, 1);
    const weakMat = new THREE.MeshToonMaterial({ color: lc, emissive: new THREE.Color(lc), emissiveIntensity: 0.6, gradientMap: toon('#fff').gradientMap });
    const lens = M(new THREE.CylinderGeometry(0.14, 0.16, 0.12, 14), weakMat, 0, 0, 0.33, head, 0.01, 0.16); lens.rotation.x = Math.PI / 2;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.35, 6, 10, 1, true), new THREE.MeshBasicMaterial({ color: lc, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide })); beam.geometry.translate(0, 3, 0); beam.rotation.x = Math.PI / 2 + 0.25; beam.position.z = 0.36; beam.visible = false; head.add(beam); J.beam = beam;
    if (name === 'The Tallykeeper') for (let i = 0; i < 6; i++) M(new THREE.BoxGeometry(0.04, 0.2, 0.02), toon('#3a2a1a'), -0.3 + i * 0.12, 1.6, 0.5, body, 0);
    g.scale.setScalar(big);
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'attendant', variant: name, joints: J, weak: lens, weakMat, weakBase: new THREE.Color(lc), slabColor: lin, calls, height: 2.6 * big, reach: 0, cut: 0, events: [] });
    return g;
  }
  function enterAttendant(g, state) { const U = g.userData; if (state === 'armorBreak') { U.cut = Math.min(3, U.cut + 1); U.events.push('linen'); } }
  function animateAttendant(g, state, t, dt) {
    const U = g.userData, J = U.joints, B = J.body; B.position.set(0, 0.2, 0); J.head.rotation.set(0, 0, 0); J.beam.visible = false; let glow = 0.6;
    if (state === 'idle') { J.head.rotation.y = Math.sin(t * 0.4) * 0.6; B.position.y += Math.sin(t * 1.2) * 0.01; }
    else if (state === 'move') { B.rotation.y = Math.sin(t * 0.8) * 0.15; B.position.y += Math.abs(Math.sin(t * 2.5)) * 0.02; }
    else if (state === 'windup') { const k = cl(t / 1.2); glow = 0.6 + k * 2.5 * (0.7 + 0.3 * Math.sin(t * 25)); J.head.rotation.y = -0.9 * ease(k); if (t > 1.0) { J.beam.visible = true; J.beam.material.opacity = 0.15; } }   // the lens warms up
    else if (state === 'attack') { const k = cl(t / 1.6); glow = 3; J.beam.visible = true; J.beam.material.opacity = 0.45 + 0.1 * Math.sin(t * 30); J.head.rotation.y = lerp(-0.9, 0.9, k); if (Math.floor(t * 6) !== U.hm) { U.hm = Math.floor(t * 6); U.events.push('hum'); } }   // slow sweeping beam: hide behind a pillar
    else if (state === 'recover') { glow = 0.3 + Math.sin(t * 10) * 0.2; J.head.rotation.x = 0.3; }
    else if (state === 'hurt') B.position.x = Math.sin(t * 40) * 0.03;
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 3) * 0.08; glow = Math.random() > 0.5 ? 2 : 0.2; }
    else if (state === 'die') { const k = ease(cl(t / 1.4)); J.head.rotation.x = 0.8 * k; B.rotation.z = 0.5 * k; B.position.y = 0.2 - 0.3 * k; glow = Math.max(0, 1 - k) * 2; }
    if (state !== 'attack') U.hm = -1; if (state !== 'move') B.rotation.y = 0;
    // cut linen strips fall away: more light shows through
    J.wraps.forEach((w, i) => { const gone = i % 3 < U.cut; if (state === 'armorBreak' && gone && i % 3 === U.cut - 1) { const k = cl(t / 0.9); w.visible = k < 0.95; w.position.copy(w.userData.home).add(new THREE.Vector3(0, -k * k * 1.5, 0)); w.rotation.x = k; } else { w.visible = !gone; w.position.copy(w.userData.home); w.rotation.x = 0; } });
    U.weakMat.emissiveIntensity = glow + U.cut * 0.3;
  }
  function buildSpecimen(name) {
    const cart = /Cart/.test(name), g = new THREE.Group(), J = {}, skin = toon(cart ? '#7d8590' : '#a8a090'), skin2 = toon(cart ? '#4b5563' : '#7a7062');
    const hips = new THREE.Group(); hips.position.y = 1.6; g.add(hips); J.hips = hips;
    J.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.32, 0, 0); hips.add(p); M(new THREE.CylinderGeometry(0.16, 0.13, 0.85, 8), skin, 0, -0.42, 0, p, 0.02); const kn = new THREE.Group(); kn.position.y = -0.85; p.add(kn); M(new THREE.CylinderGeometry(0.13, 0.11, 0.75, 8), skin2, 0, -0.37, 0, kn, 0.02); M(new THREE.BoxGeometry(0.26, 0.1, 0.4), skin2, 0, -0.75, 0.08, kn, 0.015); return { p, kn, s }; });
    const tor = new THREE.Group(); hips.add(tor); J.torso = tor; tor.rotation.x = 0.2;
    M(new THREE.CapsuleGeometry(0.42, 0.75, 4, 12), skin, 0, 0.65, 0, tor, 0.03);
    if (cart) for (let i = 0; i < 3; i++) M(new THREE.BoxGeometry(0.9, 0.18, 0.7), toon('#374151'), 0, 0.35 + i * 0.32, 0.02, tor, 0.015);
    const head = new THREE.Group(); head.position.y = 1.5; tor.add(head); J.head = head; M(new THREE.SphereGeometry(0.28, 12, 10), skin, 0, 0, 0.04, head, 0.02).scale.set(0.9, 1.05, 1.1);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: cart ? '#ff3b3b' : '#ffd23a' })); e.position.set(s * 0.1, 0.04, 0.27); head.add(e); }
    const weakMat = new THREE.MeshToonMaterial({ color: '#c9a24a', emissive: new THREE.Color('#ffd23a'), emissiveIntensity: 0.3, gradientMap: toon('#fff').gradientMap });
    // four collars, four numbers: neck, chest, two wrists
    J.collars = []; const ring = (par, x, y, z, r, rx = Math.PI / 2) => { const c = M(new THREE.TorusGeometry(r, 0.05, 6, 16), weakMat, x, y, z, par, 0.008); c.rotation.x = rx; J.collars.push(c); return c; };
    ring(tor, 0, 1.25, 0, 0.26); ring(tor, 0, 0.75, 0, 0.47);
    J.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 0.55, 1.1, 0); tor.add(sh); M(new THREE.CylinderGeometry(0.13, 0.11, 0.85, 8), skin, 0, -0.42, 0, sh, 0.02); const el = new THREE.Group(); el.position.y = -0.85; sh.add(el); M(new THREE.CylinderGeometry(0.11, 0.1, 0.8, 8), skin2, 0, -0.4, 0, el, 0.02); M(new THREE.SphereGeometry(0.18, 8, 6), skin, 0, -0.85, 0.02, el, 0.015); ring(el, 0, -0.62, 0, 0.13); return { sh, el, s }; });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'specimen', variant: name, joints: J, weak: J.collars[0], weakMat, weakBase: new THREE.Color('#ffd23a'), slabColor: '#c9a24a', calls, height: 2.75, reach: 2.0, phase: 0, boss: true, events: [] });
    return g;
  }
  function enterSpecimen(g, state) { const U = g.userData; if (state === 'armorBreak' && U.phase < 4) { U.phase++; U.events.push('collar'); } }
  function animateSpecimen(g, state, t, dt) {
    const U = g.userData, J = U.joints, T = J.torso, sp = 1 + U.phase * 0.2; J.hips.position.set(0, 1.6, 0); T.rotation.set(0.2, 0, 0); J.head.rotation.set(0, 0, 0);
    g.scale.setScalar(1 + U.phase * 0.06);   // stronger with every collar it breaks
    let a0 = [0.1, 0, 0.15, -0.2], a1 = [0.1, 0, -0.15, -0.2], legA = 0;
    if (state === 'idle') { T.rotation.z = Math.sin(t * 1.0 * sp) * 0.04; J.head.rotation.y = Math.sin(t * 0.6) * 0.4; }
    else if (state === 'move') { const w = t * 3.5 * sp; legA = Math.sin(w) * 0.4; J.legs.forEach((L, i) => L.kn.rotation.x = Math.max(0, Math.sin(w + i * Math.PI)) * 0.5); a0[0] = -Math.sin(w) * 0.4; a1[0] = Math.sin(w) * 0.4; }
    else if (state === 'windup') { const k = ease(cl(t / (0.8 / sp))); a0 = [lerp(0.1, -2.7, k), 0, 0.4, -0.5]; a1 = [lerp(0.1, -2.7, k), 0, -0.4, -0.5]; T.rotation.x = 0.2 - 0.35 * k; }
    else if (state === 'attack') { const k = cl(t / 0.6), s = ease(cl(k / 0.4)); a0 = [lerp(-2.7, 0.5, s), 0, 0.1, -0.1]; a1 = [lerp(-2.7, 0.5, s), 0, -0.1, -0.1]; T.rotation.x = lerp(-0.15, 0.6, s); J.hips.position.y = 1.6 - 0.15 * s; if (k > 0.4 && !U.f) { U.f = true; U.events.push('slam'); } }
    else if (state === 'recover') { T.rotation.x = 0.6; J.hips.position.y = 1.48; a0 = [0.5, 0, 0.3, -0.1]; a1 = [0.5, 0, -0.3, -0.1]; }
    else if (state === 'hurt') T.position.x = Math.sin(t * 40) * 0.04;
    else if (state === 'stagger') { T.rotation.z = Math.sin(t * 3) * 0.15; legA = Math.sin(t * 3) * 0.1; }
    else if (state === 'armorBreak') { const k = cl(t / 1.2); T.rotation.x = 0.2 - 0.4 * Math.sin(k * Math.PI); a0 = [-1.2 * Math.sin(k * Math.PI), 0, 1.0, -0.6]; a1 = [-1.2 * Math.sin(k * Math.PI), 0, -1.0, -0.6]; J.head.rotation.x = -0.5 * Math.sin(k * Math.PI); }
    else if (state === 'die') { const k = ease(cl(t / 1.8)); J.hips.position.y = 1.6 - 1.3 * k; T.rotation.x = 0.2 + 1.0 * k; J.legs.forEach(L => L.p.rotation.x = -1.3 * k); if (t > 1.8 && !U.dd) { U.dd = true; U.events.push('slam'); } }
    if (state !== 'attack') U.f = false; if (state !== 'die') U.dd = false;
    if (state !== 'die') J.legs.forEach(L => L.p.rotation.set(L.s * legA, 0, 0));
    const set = (A, a) => { A.sh.rotation.set(a[0], a[1], a[2]); A.el.rotation.x = a[3]; }; set(J.arms[0], a0); set(J.arms[1], a1);
    J.collars.forEach((c, i) => c.visible = i >= U.phase);
    U.weakMat.emissiveIntensity = state === 'recover' || state === 'stagger' ? 1.0 + Math.sin(t * 12) * 0.4 : 0.3;
  }
  const L = FK.LIGHT;
  const FACES = {
    golem: U => ({ par: U.joints.head, y: 0.0, z: 0.215, s: 1.1 }),
    sentry: U => ({ par: U.joints.head, y: 0.08, z: 0.235, s: 1.0, eyes: true, col: '#1a1416' }), charger: U => ({ par: U.joints.head, y: -0.02, z: 0.215, s: 0.95, eyes: true }), warden: U => ({ par: U.joints.head, y: -0.01, z: 0.255, s: 1.15, eyes: true }),
    giant: U => ({ par: U.joints.head, y: 0.0, z: 0.44, s: 2.2 }),
    shard: U => ({ par: U.joints.head, y: -0.04, z: 0.15, s: 0.55, brows: false }),
    crab: U => ({ par: U.joints.body, y: -0.04, z: 0.56, s: 1.0, brows: false }),
    spitter: U => ({ par: U.joints.body, y: 0.17, z: 0.4, s: 1.4, mouth: false }),
    husk: U => ({ par: U.joints.head, y: -0.01, z: 0.15, s: 0.65 }),
    slag: U => ({ par: U.joints.head, y: 0.0, z: 0.23, s: 1.0, col: L }), ember: U => ({ par: U.joints.body, y: 0.03, z: 0.28, s: 0.75, col: L }), vent: U => ({ par: U.joints.body, y: 0.92, z: 0.53, s: 1.4, col: L }),
    ash: U => ({ par: U.joints.head, y: 0.09, z: 0.13, s: 0.62 }), cinder: U => ({ par: U.joints.head, y: 0.0, z: 0.52, s: 2.0, col: L }),
    thorn: U => ({ par: U.joints.body, y: 0.33, z: U.variant === 'Rootwalker' ? 0.57 : 0.83, s: 1.3, col: L }), spore: U => ({ par: U.joints.body, y: 0.27, z: 0.17, s: 0.6 }),
    scarab: U => ({ par: U.joints.head, y: 0.04, z: 0.18, s: 0.75 }), serpent: U => ({ par: U.joints.head, y: 0.14, z: 0.62, s: 1.3, mouth: false }), wyrm: U => ({ par: U.joints.head, y: 0.14, z: 0.62, s: 1.3, mouth: false }),
    devil: () => null, queen: U => ({ par: U.joints.head, y: 0.04, z: 0.24, s: 1.2, mouth: false }), deadfall: U => ({ par: U.joints.head, y: 0.02, z: 0.39, s: 1.0, col: L }),
    mole: U => ({ par: U.joints.head, y: 0.06, z: U.warden ? 0.3 : 0.22, s: U.warden ? 0.9 : 0.7 }), attendant: U => ({ par: U.joints.head, y: 0.06, z: 0.33, s: 1.5, mouth: false }),
    specimen: U => ({ par: U.joints.head, y: 0.02, z: 0.3, s: 0.8 }), siphon: U => ({ par: U.joints.body, y: 0.55, z: 0.68, s: 1.8, eyes: true }),
  };
  const BOTFAM = n => ({ names: Object.keys(BOTS).filter(k => BOTS[k][0] === n), build: buildBot, animate: animateBot });
  const families = { urbeast: { names: Object.keys(UR), build: buildUr, animate: animateUr }, attendant: { names: Object.keys(ATT), build: buildAttendant, animate: animateAttendant, enter: enterAttendant }, specimen: { names: ['Specimen One', 'Cart Warden'], build: buildSpecimen, animate: animateSpecimen, enter: enterSpecimen }, queen: { names: ['Hive Queen'], build: buildQueen, animate: animateQueen, enter: enterQueen }, deadfall: { names: ['The Deadfall'], build: buildDeadfall, animate: animateDeadfall, enter: enterDeadfall }, mole: { names: ['Garden Mole', 'The Molewarden'], build: buildMole, animate: animateMole }, hornet: { names: ['Hornet', 'Hornet Lancer'], build: buildHornet, animate: animateHornet }, thorn: { names: ['Thornback', 'Rootwalker'], build: buildThorn, animate: animateThorn }, spore: { names: Object.keys(SPORE), build: buildSpore, animate: animateSpore }, ash: { names: ['Ashwalker'], build: buildAsh, animate: animateAsh }, cinder: { names: ['The First Cinder'], build: buildCinder, animate: animateCinder, enter: enterCinder }, slag: { names: ['Slagback'], build: buildSlag, animate: animateSlag, enter: enterSlag }, ember: { names: ['Ember'], build: buildEmber, animate: animateEmber }, vent: { names: ['Ventmaw'], build: buildVent, animate: animateVent }, devil: { names: ['Dust Devil', 'Dry Devil'], build: buildDevil, animate: animateDevil }, wyrm: { names: Object.keys(WYRM), build: buildSerpent, animate: animateSerpent }, siphon: { names: ['Warden of the Siphon'], build: buildSiphon, animate: animateSiphon, enter: enterSiphon }, scarab: { names: Object.keys(SCARAB), build: buildScarab, animate: animateScarab }, spitter: { names: Object.keys(SPITTER), build: buildSpitter, animate: animateSpitter }, husk: { names: Object.keys(HUSK), build: buildHusk, animate: animateHusk }, flamingo: { names: ['Flamingo'], build: buildFlamingo, animate: animateFlamingo }, serpent: { names: ['Sand Serpent', 'The Drain Serpent'], build: buildSerpent, animate: animateSerpent }, sentry: BOTFAM('sentry'), charger: BOTFAM('charger'), warden: BOTFAM('warden'), giant: { names: ['The Painted Giant'], build: buildGiant, animate: animateGiant, enter: enterGiant }, shard: { names: Object.keys(SHARD), build: buildShard, animate: animateShard }, crab: { names: Object.keys(CRAB), build: buildCrab, animate: animateCrab }, golem: { names: Object.keys(GOLEM), build: buildGolem, animate: animateGolem, enter: enterGolem } };
  const famOf = name => Object.values(families).find(f => f.names.includes(name));
  return {
    families,
    canBuild: name => !!famOf(name),
    build(name, opts = {}) { const f = famOf(name); if (!f) return null; const g = f.build(name, opts); const U = g.userData;
      const ext = { scrap: u => u.kind === 'bolt' ? { par: u.joints.head, y: -0.02, z: 0.17, s: 0.75, col: '#f5e6d0' } : u.kind === 'hulk' ? { par: u.joints.body, y: 0.95, z: 1.15, s: 2.6, mouth: false, col: '#f5e6d0' } : { par: u.joints.body, y: 0.12, z: 0.12, s: 0.7, brows: true, mouth: false }, crusher: u => ({ par: u.joints.torso, y: 1.35, z: 0.81, s: 2.4, eyes: true }), worm: u => ({ par: u.joints.head, y: 0.11, z: 0.19, s: 0.9, eyes: true, mouth: false }), octo: u => ({ par: u.joints.body, y: 0.12, z: 0.62, s: 1.8 }), belt: u => ({ par: u.joints.head, y: 0.14, z: 0.62, s: 1.3, mouth: false }), king: u => ({ par: u.joints.head, y: 0.06, z: 0.45, s: 1.6 }), fed: u => ({ par: u.joints.head, y: 0.1, z: 0.62, s: 2.0, brows: true }), snow: u => ({ par: u.joints.head, y: 0.04, z: 0.27, s: 1.1 }), urbeast: u => u.kind === 'runner' ? null : ({ par: u.joints.head, y: 0.03, z: 0.15, s: 0.6 }) };
      const spec = (FACES[U.family] || ext[U.family] || (() => null))(U);
      if (spec && spec.par && !opts.noFace) { U.cface = FK.addFace(spec.par, spec); U.calls = (U.calls || 0) + 6; }
      if (!opts.noPolish) PK.build(g);
      return g; },
    animate(g, state, t, dt, opts) { const f = families[g.userData.family]; if (f) f.animate(g, state, t, dt, opts); if (g.userData.cface) FK.setFace(g.userData.cface, state, dt); PK.tick(g, state, t, dt, opts); },
    polish: PK,
    enter(g, state) { const f = families[g.userData.family]; if (f && f.enter) f.enter(g, state); },
    register(id, fam) { families[id] = fam; DUR[id] = fam.dur || {}; },
    setPhase(g, n) { if (g && g.userData.boss) { g.userData.phase = n; } },
    dur(g, state) { const d = DUR[g.userData.family] || {}; return d[state] ?? STATE_DUR[state]; },
    // the shared tell language: one colour per tell, drawn on the ground by the game
    TELL: { melee: '#ec3013', charge: '#ff8a1a', lob: '#38bdf8', hazard: '#a855f7', weak: '#ffd23a' },
  };
}
