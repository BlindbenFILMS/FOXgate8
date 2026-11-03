// ORE SHAFT MACHINES (s364): the Machine Fleet units that live under Engineering on Deep Space Fox, + R-8.
// Shared by the Ore Shaft cave (later) and Ore Shaft Machine Workshop.dc.html. Workshop writes localStorage 'ore.machines'
// = { look: {type: {...}}, stats: {type: {...}} }. Every machine has two states: HACKED (red eye, glitches, a voice not its own)
// and FREED (cyan eye, steady, its real voice). Front of every machine = +x.
export const TYPES = ['r8', 'pick', 'drill', 'survey', 'hauler', 'relay', 'rig'];
export const INFO = {
  r8: { name: 'R-8 · REPAIR DRONE', role: 'Hovers. Hacked: zaps you with its welder. Freed: follows you to every world and repairs.' },
  pick: { name: 'PICK-BOT', role: 'Miner brawler. Winds the pick up over its head (warning), then SLAMS. Step aside, hit it while the pick is stuck.' },
  drill: { name: 'DRILL CRAWLER', role: 'Punk brawler on treads. Raises the drill lance and revs it (warning), then CHARGES straight. After, the drill is too hot: hit it.' },
  survey: { name: 'SURVEY DRONE', role: 'Hooded hover head with a crane-arm spotlight cannon. The beam sweeps; it turns red + aims (warning), then fires a stun bolt. Hit it while the barrel smokes.' },
  hauler: { name: 'ORE HAULER', role: 'Ore truck that half-transforms to fight. Drops its plow + revs (warning), then RAMS. After, its hood steams: hit it.' },
  relay: { name: 'SIGNAL RELAY', role: 'BOSS PART 1. The machine that carries the hack. Sends out pulse rings: jump them. Destroy it.' },
  rig: { name: 'DRILL RIG', role: 'BOSS PART 2. A squat drill-rig mech with one giant head drill. Rears back + spins it up (warning), then HEADBUTTS. The drill sticks in the floor + its chest opens: hit the core, stun it, UNHACK it.' },
};
export const KIND = { r8: 'ranged', pick: 'melee', drill: 'charge', survey: 'ranged', hauler: 'charge', relay: 'pulse', rig: 'boss' };
export const BOSS = { relay: 'destroy', rig: 'unhack' };
// voices: HACKED = a voice not their own (flickers of the real robot in lower case); FREED = their own. Every line 20 words or less.
export const LINES = {
  r8: { hacked: 'RETURN TO CRADLE. RETURN... not my voice... RETURN.', freed: 'R-8 online. My own thoughts. Can I come with you?' },
  pick: { hacked: 'DIG. DIG. THE FOXES... ARE... the fault? DIG.', freed: 'My hands are mine again. Thank you, fox.' },
  drill: { hacked: 'CLEAR THE TUNNEL. CLEAR. THE. FOX.', freed: 'Quiet. The noise in my head is gone.' },
  survey: { hacked: 'SCANNING. INTRUDER. help me. INTRUDER.', freed: 'I can see the lamps now. I will find my own way.' },
  hauler: { hacked: 'LOAD. HAUL. CRUSH. LOAD.', freed: 'No more orders. I think I will rest a while.' },
  relay: { hacked: 'ALL UNITS. ONE VOICE. MY VOICE.', freed: 'SIGNAL... LOST.' },
  rig: { hacked: 'I AM THE DEEP. YOU ARE IN MY WAY.', freed: 'I was dreaming someone else\u2019s dream. I am awake.' },
};
export const LOOK0 = {
  r8: { body: '#5fe3ff', dark: '#5fe3ff', accent: '#1a3fb8', band: '#1a3fb8', eye: '#1a3fb8', free: '#5fe3ff', size: 1.3 },   // s364q ★ Ben's FINAL saved look
  pick: { body: '#e8b42a', dark: '#d0782c', accent: '#15171d', band: '#ec3013', eye: '#ff2a1a', free: '#5fe3ff', size: 1.15 },   // s364t ★ Ben's saved look
  drill: { body: '#d0782c', dark: '#2a2d33', accent: '#9aa0a6', band: '#ec3013', eye: '#ff2a1a', free: '#5fe3ff', size: 1.5 },
  survey: { body: '#9aa0a6', dark: '#2a2d33', accent: '#e8b42a', band: '#1a3fb8', eye: '#ff2a1a', free: '#5fe3ff', size: 1.3 },
  hauler: { body: '#d23a24', dark: '#2a2d33', accent: '#c8ccd2', band: '#1a3fb8', eye: '#ff2a1a', free: '#5fe3ff', size: 1.2 },
  relay: { body: '#2a2d33', dark: '#1a1c20', accent: '#ec3013', eye: '#ff2a1a', free: '#5fe3ff', size: 1 },
  rig: { body: '#3d4a5c', dark: '#1f242c', accent: '#f2c230', band: '#8a1c14', eye: '#ff2a1a', free: '#5fe3ff', size: 1.15 },
};
export const LOOK_UI = { band: 'HEADBAND / SCARF / CAPE', body: 'BODY', dark: 'DARK PARTS', accent: 'ACCENT', eye: 'HACKED EYE', free: 'FREED EYE' };
export const STATS0 = {
  r8: { hp: 30, walk: 2.2, hover: 1.6, sight: 8, tell: 0.6, range: 7, bolt: 10, hit: 6, rest: 1.8, unhack: 2.5 },
  pick: { hp: 50, walk: 1.4, sight: 7, tell: 0.55, reach: 1.8, hit: 14, rest: 1.4, unhack: 2.0 },
  drill: { hp: 60, walk: 1.2, sight: 9, tell: 0.8, lunge: 9, hit: 18, rest: 2.0, unhack: 2.5 },
  survey: { hp: 25, walk: 2.0, hover: 1.3, sight: 10, tell: 0.7, range: 10, bolt: 12, hit: 8, rest: 1.6, unhack: 1.5 },
  hauler: { hp: 120, walk: 1.0, sight: 8, tell: 0.9, lunge: 7, hit: 22, rest: 2.4, unhack: 3.0 },
  relay: { hp: 300, sight: 14, tell: 1.0, range: 9, pulse: 6, hit: 12, rest: 2.2 },
  rig: { hp: 600, walk: 0.8, sight: 14, tell: 1.1, reach: 5.0, hit: 28, rest: 2.6, unhack: 5.0 },
};
// [label, min, max, step, unit]
export const STAT_UI = {
  hp: ['HP', 5, 1000, 5, ''], walk: ['WALK SPEED', 0.3, 4, 0.1, 'M/S'], hover: ['HOVER HEIGHT', 0.6, 4, 0.1, 'M'], sight: ['SIGHT', 3, 20, 0.5, 'M'],
  tell: ['WARNING TIME', 0.2, 2, 0.05, 'S'], range: ['RANGE', 3, 16, 0.5, 'M'], bolt: ['BOLT SPEED', 4, 20, 0.5, 'M/S'], reach: ['REACH', 1, 7, 0.1, 'M'],
  lunge: ['CHARGE SPEED', 3, 16, 0.5, 'M/S'], pulse: ['PULSE SPEED', 2, 12, 0.5, 'M/S'], hit: ['HIT DAMAGE', 1, 50, 1, ''], rest: ['OPEN AFTER (REST)', 0.5, 4, 0.1, 'S'],
  unhack: ['UNHACK HOLD', 0.5, 8, 0.1, 'S'],
};
const KEY = 'ore.machines';
export function loadMachines() { let raw = {}; try { raw = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
  if (raw.look && raw.look.r8 && (raw.v || 1) < 2 && String(raw.look.r8.eye).toLowerCase() === '#ff2a1a') raw.look.r8.eye = '#1a3fb8';   // s364c R-8 hacked eye = dark blue (Ben)
  if (raw.look && raw.look.r8 && (raw.v || 1) < 4) delete raw.look.r8;   // s364d fighter look: new R-8 defaults
  if (raw.look && raw.look.pick && (raw.v || 1) < 5) delete raw.look.pick;   // s364r pick-bot fighter defaults
  if (raw.look && raw.look.drill && (raw.v || 1) < 6) { const sz = raw.look.drill.size; delete raw.look.drill; if (sz) raw.look.drill = { size: sz }; }   // s364u drill fighter defaults (keeps Ben's size)
  if ((raw.v || 1) < 7) { if (raw.look) delete raw.look.survey; if (raw.stats && raw.stats.survey && raw.stats.survey.hover === 2.4) delete raw.stats.survey.hover; }   // s364w survey fighter defaults
  if ((raw.v || 1) < 8 && raw.look) delete raw.look.hauler;   // s364aa hauler transformer defaults
  if ((raw.v || 1) < 10 && raw.look) delete raw.look.rig;   // s364af rig boss defaults
  const look = {}, stats = {}; for (const t of TYPES) { look[t] = { ...LOOK0[t], ...((raw.look || {})[t] || {}) }; stats[t] = { ...STATS0[t], ...((raw.stats || {})[t] || {}) }; } return { look, stats }; }
export function saveMachines(b) { try { localStorage.setItem(KEY, JSON.stringify({ ...b, v: 10 })); } catch (e) {} }

const outlineOf = ctx => ctx.outlineMat || (ctx._om = ctx._om || new ctx.THREE.MeshBasicMaterial({ color: 0x0e0c14, side: ctx.THREE.BackSide }));
// s364h the 8 + its ring take the BODY colour (Ben); the disc takes DARK PARTS. One texture per colour pair.
const crestC = new Map(); function crest8Tex(THREE, L) { const key = L.body + L.dark; if (crestC.has(key)) return crestC.get(key); const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = L.body; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.fillStyle = L.dark; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.fill();
  g.font = '900 176px Archivo, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 18; g.strokeStyle = '#15171d'; g.strokeText('8', 128, 138); g.fillStyle = L.body; g.fillText('8', 128, 138);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; crestC.set(key, t); return t; }
// s364p R-8's screen face. o = { ex: free|blink|joy|hack|mad|stun, col (eye colour), dx (look offset px), glitch, fl, spin }
function drawFace(u, o) { const F = u.face, T = !!o.tough, key = o.ex + o.col + o.dx + '|' + o.glitch + (o.ex === 'stun' ? o.spin : ''); if (F.key === key) return; F.key = key;
  const g = F.g, W = 256, cx = 128, cy = 124; g.clearRect(0, 0, W, W);
  const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  // glass screen: deep navy, soft inner gradient, ink bezel
  rr(26, 38, 204, 176, 64); const gr = g.createLinearGradient(0, 38, 0, 214); gr.addColorStop(0, '#1c2740'); gr.addColorStop(1, '#070b16'); g.fillStyle = gr; g.fill(); g.lineWidth = 9; g.strokeStyle = '#0b0d12'; g.stroke();
  g.save(); rr(30, 42, 196, 168, 60); g.clip();
  const hk = o.ex === 'hack' || o.ex === 'mad', c = o.col, X = o.dx;
  g.shadowColor = c; g.shadowBlur = 16; g.fillStyle = c; g.strokeStyle = c; g.lineCap = 'round'; g.lineJoin = 'round';
  const eyeL = cx - 44 + X, eyeR = cx + 44 + X;
  if (o.ex === 'free') { for (const x of [eyeL, eyeR]) { if (T) { rr(x - 25, cy - 24, 50, 44, 14); g.fill(); } else { g.beginPath(); g.ellipse(x, cy, 23, 30, 0, 0, 7); g.fill(); } }
    g.shadowBlur = 0; g.fillStyle = '#ffffff'; for (const x of [eyeL, eyeR]) { g.beginPath(); g.arc(x - 8, cy - 11, 7.5, 0, 7); g.fill(); g.beginPath(); g.arc(x + 8, cy + 10, 3.5, 0, 7); g.fill(); }
    if (!T) { g.fillStyle = 'rgba(255,120,170,0.55)'; for (const x of [eyeL - 26, eyeR + 26]) { g.beginPath(); g.ellipse(x, cy + 34, 14, 8, 0, 0, 7); g.fill(); } }
    g.shadowColor = c; g.shadowBlur = 10; g.strokeStyle = c; g.lineWidth = T ? 9 : 7; g.beginPath(); if (T) { g.moveTo(cx - 34 + X, cy + 40); g.quadraticCurveTo(cx + X, cy + 62, cx + 34 + X, cy + 40); g.stroke(); } else { g.moveTo(cx - 14 + X, cy + 40); g.quadraticCurveTo(cx - 7 + X, cy + 50, cx + X, cy + 42); g.quadraticCurveTo(cx + 7 + X, cy + 50, cx + 14 + X, cy + 40); g.stroke(); } }
  else if (o.ex === 'blink') { g.lineWidth = 9; for (const x of [eyeL, eyeR]) { g.beginPath(); g.moveTo(x - 20, cy + 4); g.quadraticCurveTo(x, cy + 14, x + 20, cy + 4); g.stroke(); }
    g.shadowBlur = 0; if (!T) { g.fillStyle = 'rgba(255,120,170,0.55)'; for (const x of [eyeL - 26, eyeR + 26]) { g.beginPath(); g.ellipse(x, cy + 34, 14, 8, 0, 0, 7); g.fill(); } }
    g.shadowBlur = 10; g.lineWidth = 7; g.beginPath(); g.moveTo(cx - 14 + X, cy + 40); g.quadraticCurveTo(cx - 7 + X, cy + 50, cx + X, cy + 42); g.quadraticCurveTo(cx + 7 + X, cy + 50, cx + 14 + X, cy + 40); g.stroke(); }
  else if (o.ex === 'joy') { g.lineWidth = 11; for (const x of [eyeL, eyeR]) { g.beginPath(); g.moveTo(x - 20, cy + 6); g.quadraticCurveTo(x, cy - 22, x + 20, cy + 6); g.stroke(); }
    g.beginPath(); g.moveTo(cx - 26, cy + 30); g.quadraticCurveTo(cx, cy + 66, cx + 26, cy + 30); g.closePath(); g.fill();
    g.shadowBlur = 0; g.fillStyle = T ? 'rgba(0,0,0,0)' : 'rgba(255,120,170,0.6)'; for (const x of [eyeL - 26, eyeR + 26]) { g.beginPath(); g.ellipse(x, cy + 30, 15, 9, 0, 0, 7); g.fill(); } }
  else if (hk) { const mad = o.ex === 'mad', h = mad ? 18 : 26, sl = mad ? 16 : 12;
    // slanted angry eyes: a rounded block with its inner top corner cut down
    for (const [x, s] of [[eyeL, 1], [eyeR, -1]]) { g.beginPath(); g.moveTo(x - 24, cy - h / 2 - (s > 0 ? 0 : sl)); g.lineTo(x + 24, cy - h / 2 - (s > 0 ? sl : 0)); g.lineTo(x + 24, cy + h / 2); g.lineTo(x - 24, cy + h / 2); g.closePath(); g.fill(); }
    g.lineWidth = 6; g.beginPath(); const my = cy + 44, n = mad ? 7 : 5, w = mad ? 52 : 40; for (let i = 0; i <= n; i++) { const x = cx - w / 2 + i * w / n, y = my + (i % 2 ? -6 : 6) * (mad ? 1.3 : 1); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  else if (o.ex === 'stun') { g.lineWidth = 6; for (const x of [eyeL, eyeR]) { g.beginPath(); for (let a = 0; a < 16; a += 0.3) { const r = a * 1.6, aa = a + o.spin * 1.57; g.lineTo(x + Math.cos(aa) * r, cy + Math.sin(aa) * r); } g.stroke(); }
    g.lineWidth = 6; g.beginPath(); for (let i = 0; i <= 24; i++) { const x = cx - 24 + i * 2; g.lineTo(x, cy + 44 + Math.sin(i * 0.8) * 4); } g.stroke(); }
  g.shadowBlur = 0;
  if (hk) { g.fillStyle = 'rgba(0,0,0,0.28)'; for (let y = 42; y < 212; y += 6) g.fillRect(0, y, W, 2);   // scanlines
    if (o.glitch) { for (let k = 0; k < o.glitch + 1; k++) { const y = 70 + Math.random() * 110, h = 6 + Math.random() * 14, dx = (Math.random() - 0.5) * 40; g.drawImage(F.c, 0, y, W, h, dx, y, W, h); } g.fillStyle = o.fl ? 'rgba(95,227,255,0.25)' : 'rgba(26,63,184,0.25)'; g.fillRect(0, 60 + Math.random() * 120, W, 3); } }
  // glass shine
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.ellipse(84, 70, 40, 14, -0.35, 0, 7); g.fill();
  g.restore(); F.tex.needsUpdate = true; }
let stripeC = null; function stripeTex(THREE) { if (stripeC) return stripeC; const c = document.createElement('canvas'); c.width = 512; c.height = 32; const g = c.getContext('2d'); g.fillStyle = '#15171d'; g.fillRect(0, 0, 512, 32); g.fillStyle = '#f2c230'; for (let x = -32; x < 544; x += 32) { g.beginPath(); g.moveTo(x, 32); g.lineTo(x + 16, 32); g.lineTo(x + 32, 0); g.lineTo(x + 16, 0); g.closePath(); g.fill(); } stripeC = new THREE.CanvasTexture(c); stripeC.colorSpace = THREE.SRGBColorSpace; return stripeC; }
const stenC = new Map(); function stencilTex(THREE, txt, col) { const k = txt + col; if (stenC.has(k)) return stenC.get(k); const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'); g.fillStyle = col; g.font = '900 76px Archivo, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 128, 68);
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 4; i++) g.fillRect(48 + i * 52, 20, 5, 96); for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(Math.random() * 256, Math.random() * 128, Math.random() * 3, 0, 7); g.fill(); }   // stencil bridges + scuffs
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; stenC.set(k, t); return t; }
let crackC = null; function crackTex(THREE) { if (crackC) return crackC; const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.strokeStyle = '#15120e'; g.lineCap = 'round';
  const br = (x, y, a, len, w, d) => { if (d > 3 || w < 1) return; const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); br(x2, y2, a + (Math.random() - 0.5) * 0.9, len * 0.7, w * 0.65, d + 1); if (Math.random() < 0.6) br(x2, y2, a + (Math.random() < 0.5 ? 0.7 : -0.7), len * 0.55, w * 0.55, d + 1); };
  for (let i = 0; i < 7; i++) br(128, 128, i / 7 * 6.283 + Math.random() * 0.4, 30 + Math.random() * 18, 7, 0);
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 34); gr.addColorStop(0, 'rgba(20,16,12,0.75)'); gr.addColorStop(1, 'rgba(20,16,12,0)'); g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 34, 0, 7); g.fill();
  crackC = new THREE.CanvasTexture(c); crackC.colorSpace = THREE.SRGBColorSpace; return crackC; }
let earC = null; function earTex(THREE, L) { if (earC) return earC; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#e0b020'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = '#15171d'; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill(); g.fillStyle = '#f3f2f2'; g.font = '900 64px Archivo, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('R8', 64, 68); earC = new THREE.CanvasTexture(c); earC.colorSpace = THREE.SRGBColorSpace; return earC; }
// ctx = { THREE, M(geo, mat, x, y, z, parent, outline, radius), toon(hex), glowTex }. Returns a Group (not added to a scene).
// userData: eyes (materials), head (glitch group), body (slump group), + per-type parts.
export function buildMachine(ctx, type, L) { const { THREE, M, toon, glowTex } = ctx; const g = new THREE.Group(), u = g.userData, p = new THREE.Group(); p.scale.setScalar(L.size || 1); g.add(p);
  const Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d), Sp = (r, a = 14, b = 10) => new THREE.SphereGeometry(r, a, b), Cy = (rt, rb, h, n = 12) => new THREE.CylinderGeometry(rt, rb, h, n);
  const B = toon(L.body), D = toon(L.dark), A = toon(L.accent); u.eyes = []; u.look = L; u.type = type;
  const eye = (geo, x, y, z, par) => { const m = new THREE.MeshBasicMaterial({ color: L.eye, toneMapped: false }); u.eyes.push(m); const e = M(geo, m, x, y, z, par, 0); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: L.eye, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(0.7); gl.position.set(x, y, z); par.add(gl); (u.glows = u.glows || []).push(gl); return e; };
  const body = new THREE.Group(); p.add(body); u.body = body; const head = new THREE.Group(); u.head = head;
  if (type === 'r8') { body.position.y = 0; head.position.y = 0; body.add(head); const BD = toon(L.band || '#ec3013'), INK = toon('#15171d');
    // s364d FIGHTER LOOK (Ben: "like a street fighter character, polished"): pearl shell, navy parts, gold trim, a red fighter's HEADBAND with
    // two tails that whip in the air, a gold crest fin, R-8 ear disks, gold shoulder pads, big gauntlet fists (welder in the right one), a thruster ring.
    M(Sp(0.55, 28, 20), B, 0, 0, 0, head, 0.045, 0.55);
    M(Cy(0.42, 0.34, 0.16, 24), D, 0, -0.44, 0, head, 0.03); M(Cy(0.44, 0.44, 0.05, 24), A, 0, -0.37, 0, head, 0);   // collar + gold rim
    // s364p SCREEN FACE (Ben: "more like a robot but cute"): a curved glass screen on the front of the dome (planar UVs, faces +x) with a
    // canvas face redrawn only when the expression changes: big rounded eyes with sparkle highlights, tiny smile + blush when freed,
    // slanted angry eyes + zig-zag mouth + scanlines when hacked, spirals when stunned, ^ ^ + open grin when celebrating. 
    { const R = 0.566, TH = 0.8, cap = new THREE.SphereGeometry(R, 32, 10, 0, Math.PI * 2, 0, TH), pos = cap.attributes.position, uv = cap.attributes.uv, k = 0.5 / (R * Math.sin(TH));
      for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 - pos.getZ(i) * k, 0.5 - pos.getX(i) * k); uv.needsUpdate = true;
      const fc = document.createElement('canvas'); fc.width = fc.height = 256; const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 4;
      const fm = new THREE.MeshBasicMaterial({ map: ft, transparent: true, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
      const scr = new THREE.Mesh(cap, fm); scr.rotation.z = -Math.PI / 2; scr.position.y = 0.02; scr.renderOrder = 2; head.add(scr); u.face = { c: fc, g: fc.getContext('2d'), tex: ft, key: '' };
      const fg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: L.eye, transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending })); fg.scale.setScalar(1.1); fg.position.set(0.62, 0.02, 0); head.add(fg); u.faceGlow = fg; drawFace(u, { ex: 'free', col: L.free, dx: 0 }); }
    // HEADBAND round the top of the shell, knot at the back (propeller on it, s364k)
    const band = M(new THREE.TorusGeometry(0.425, 0.06, 8, 40), BD, 0, 0.36, 0, head, 0); const bandIn = M(new THREE.TorusGeometry(0.425, 0.072, 6, 40), outlineOf(ctx), 0, 0.36, 0, head, 0); bandIn.rotation.copy(band.rotation); u.bandIn = bandIn; band.rotation.x = Math.PI / 2; band.rotation.y = -0.12; bandIn.rotation.copy(band.rotation);
    M(Bx(0.12, 0.14, 0.16), BD, -0.44, 0.33, 0, head, 0.02);
    // s364k (Ben): the waving tails are gone; a little PROPELLER spins behind his head where the knot is (hub + 3 blades + a motion blur disc)
    { const pr = new THREE.Group(); pr.position.set(-0.53, 0.33, 0); head.add(pr); M(Cy(0.05, 0.07, 0.1, 12), D, -0.02, 0, 0, pr, 0.012).rotation.z = Math.PI / 2;
      const rot = new THREE.Group(); rot.position.x = -0.09; pr.add(rot); u.prop = rot; M(Sp(0.05, 10, 8), A, 0, 0, 0, rot, 0.012, 0.05);
      for (let i = 0; i < 3; i++) { const bl = new THREE.Group(); bl.rotation.x = i * Math.PI * 2 / 3; rot.add(bl); const m = M(Bx(0.025, 0.24, 0.075), BD, 0, 0.14, 0, bl, 0.01); m.rotation.y = 0.45; }
      const bm = new THREE.MeshBasicMaterial({ color: L.band || '#1a3fb8', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }); const disc = new THREE.Mesh(new THREE.CircleGeometry(0.27, 24), bm); disc.rotation.y = Math.PI / 2; disc.position.x = -0.09; pr.add(disc); u.propBlur = bm; }
    // gold CREST fin + R-8 ear disks
    // s364g 8 CREST painted on the top of the dome (Ben): a cap with flat (top-down) UVs so the decal reads upright from the front; the gold fin moves back behind it
    { const R = 0.556, cap = new THREE.SphereGeometry(R, 28, 6, 0, Math.PI * 2, 0, 0.62), pos = cap.attributes.position, uv = cap.attributes.uv, k = 0.5 / (R * Math.sin(0.62));
      for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 - pos.getZ(i) * k, 0.5 - pos.getX(i) * k); uv.needsUpdate = true;
      const cm = new THREE.MeshLambertMaterial({ map: crest8Tex(THREE, L), transparent: true, polygonOffset: true, polygonOffsetFactor: -2 }); const cr = new THREE.Mesh(cap, cm); head.add(cr); u.crest = cr; }
    const fin = M(Bx(0.34, 0.15, 0.04), A, -0.34, 0.45, 0, head, 0.015); fin.rotation.z = 0.62; M(Bx(0.16, 0.08, 0.045), A, -0.46, 0.38, 0, head, 0).rotation.z = 0.9;
    const decal = earTex(THREE, L); for (const s of [-1, 1]) { const ed = M(Cy(0.18, 0.18, 0.08, 20), D, -0.02, 0.02, s * 0.52, head, 0.02); ed.rotation.x = Math.PI / 2; const fc = new THREE.Mesh(new THREE.CircleGeometry(0.15, 20), new THREE.MeshBasicMaterial({ map: decal, toneMapped: false })); fc.position.set(-0.02, 0.02, s * 0.565); fc.rotation.y = s > 0 ? 0 : Math.PI; head.add(fc); }
    // THRUSTER: cone + glowing ring
    M(Cy(0.2, 0.1, 0.22, 14), D, 0, -0.6, 0, head, 0.03); M(new THREE.TorusGeometry(0.17, 0.03, 6, 20), A, 0, -0.7, 0, head, 0).rotation.x = Math.PI / 2;
    u.jet = M(new THREE.ConeGeometry(0.13, 0.45, 12), new THREE.MeshBasicMaterial({ color: '#7df9ff', transparent: true, opacity: 0.6, toneMapped: false }), 0, -0.95, 0, head, 0); u.jet.rotation.x = Math.PI;
    const jg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#7df9ff', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); jg.scale.setScalar(0.8); jg.position.set(0, -0.78, 0); head.add(jg); u.jetGlow = jg;
    // s364q (Ben): a little warm core in the flame: a short orange cone inside the cyan one + a small red tip glow
    u.jetHot = M(new THREE.ConeGeometry(0.065, 0.24, 10), new THREE.MeshBasicMaterial({ color: '#ff8a1e', transparent: true, opacity: 0.85, toneMapped: false, depthWrite: false }), 0, -0.86, 0, head, 0); u.jetHot.rotation.x = Math.PI;
    { const rg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ff3b1a', transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); rg.scale.setScalar(0.32); rg.position.set(0, -1.12, 0); head.add(rg); u.jetRed = rg; }
    // ARMS: gold shoulder pad → navy upper arm → elbow → pearl forearm with a gold cuff → big navy GAUNTLET fist. s = +1 is the right (welder) arm.
    u.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(0.02, -0.18, s * 0.7); head.add(sh); sh.userData.s = s;
      M(Sp(0.17, 14, 10), A, 0, 0.02, 0, sh, 0.025, 0.17); M(Bx(0.2, 0.05, 0.3), A, 0, 0.15, 0, sh, 0.015);
      M(Cy(0.07, 0.065, 0.3, 10), D, 0, -0.16, 0, sh, 0.02); const el = new THREE.Group(); el.position.y = -0.32; sh.add(el); M(Sp(0.08, 10, 8), D, 0, 0, 0, el, 0.02, 0.08);
      M(Cy(0.09, 0.075, 0.28, 12), B, 0, -0.15, 0, el, 0.02); M(Cy(0.1, 0.1, 0.06, 12), A, 0, -0.26, 0, el, 0.012);
      const fist = new THREE.Group(); fist.position.y = -0.38; el.add(fist); M(Bx(0.2, 0.19, 0.2), D, 0, 0, 0, fist, 0.025); M(Bx(0.06, 0.16, 0.2), INK, 0.11, 0.01, 0, fist, 0);
      for (let k = 0; k < 3; k++) M(Bx(0.04, 0.035, 0.05), A, 0.135, 0.06 - k * 0.055, 0, fist, 0);
      if (s < 0) { const wr = new THREE.Group(); wr.position.set(0.02, -0.12, 0); fist.add(wr); M(Bx(0.05, 0.34, 0.035), INK, 0, -0.14, 0, wr, 0.01); const jaw = M(new THREE.TorusGeometry(0.06, 0.022, 6, 12, 4.4), INK, 0, -0.33, 0, wr, 0.01); jaw.rotation.z = -0.65; u.wrench = wr; }
      if (s > 0) { M(Cy(0.03, 0.045, 0.16, 8), A, 0, -0.17, 0, fist, 0.012); const tip = new THREE.Object3D(); tip.position.y = -0.27; fist.add(tip); u.muzzle = tip; const tg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#7df9ff', transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending })); tg.scale.setScalar(0.5); tip.add(tg); u.weld = tg; }
      sh.userData.el = el; return sh; });
    // s364i POLISH: glossy visor highlight, a soft ground SHADOW, HACK SHARDS (dark cubes orbiting the head while hacked, gone when freed)
    { const sm = new THREE.MeshBasicMaterial({ map: glowTex, color: '#000000', transparent: true, opacity: 0.45, depthWrite: false }); const sd = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), sm); sd.rotation.x = -Math.PI / 2; g.add(sd); u.shadow = sd; sd.renderOrder = -1; }
    u.shards = []; { const shM = new THREE.MeshBasicMaterial({ color: L.eye, transparent: true, opacity: 0.9, toneMapped: false }); u.shardM = shM; for (let i = 0; i < 7; i++) { const q = new THREE.Mesh(Bx(0.07, 0.07, 0.07), shM); q.userData = { a: i / 7 * 6.283, r: 0.75 + (i % 3) * 0.08, y: 0.15 + (i % 2) * 0.25, sp: 1.6 + (i % 4) * 0.4 }; head.add(q); u.shards.push(q); } }
  }
  else if (type === 'pick') {   // s364r PICK-BOT FIGHTER (Ben: "more like a street fighter character"): a hulking miner-brawler. V-shaped armoured chest,
    // hazard sash, big pauldrons, thick legs in a wide stance + steel-toe boots, hard hat with a headlamp (red when hacked, cyan when freed),
    // a screen visor face (same face kit as R-8, tough version), a steel jaw, a knotted neck scarf, big fists and a heavy pickaxe in the right hand.
    const BD = toon(L.band || '#ec3013'), INK = toon('#15171d'), STEEL = toon('#c8ccd2'), WOOD = toon('#6b4a2a');
    const hips = new THREE.Group(); hips.position.y = 1.05; body.add(hips); u.hips = hips;
    M(Bx(0.5, 0.3, 0.72), D, 0, 0.02, 0, hips, 0.03); M(Bx(0.56, 0.11, 0.78), A, 0, 0.18, 0, hips, 0.02); M(Bx(0.06, 0.16, 0.2), B, 0.29, 0.18, 0, hips, 0.012); M(Bx(0.07, 0.07, 0.07), INK, 0.33, 0.18, 0, hips, 0);
    u.legs = [-1, 1].map(s => { const hip = new THREE.Group(); hip.position.set(0, -0.02, s * 0.27); hips.add(hip); hip.userData.s = s;
      M(Cy(0.17, 0.14, 0.52, 10), D, 0, -0.26, 0, hip, 0.03); const kn = new THREE.Group(); kn.position.y = -0.5; hip.add(kn); M(Sp(0.15, 10, 8), B, 0.04, 0, 0, kn, 0.025, 0.15);
      M(Cy(0.15, 0.12, 0.45, 10), D, 0, -0.22, 0, kn, 0.03); M(Bx(0.1, 0.3, 0.22), B, 0.1, -0.2, 0, kn, 0.02);
      const ft = new THREE.Group(); ft.position.y = -0.47; kn.add(ft); M(Bx(0.5, 0.2, 0.3), INK, 0.08, -0.04, 0, ft, 0.03); M(Bx(0.16, 0.16, 0.31), B, 0.27, -0.05, 0, ft, 0.02); return { hip, kn, ft, s }; });
    const torso = new THREE.Group(); torso.position.y = 1.28; body.add(torso); u.torso = torso;
    M(Bx(0.46, 0.38, 0.6), D, 0, 0.16, 0, torso, 0.03);
    const chest = M(new THREE.CylinderGeometry(0.62, 0.4, 0.66, 4, 1), B, 0, 0.62, 0, torso, 0.045); chest.rotation.y = Math.PI / 4; chest.scale.set(0.72, 1, 1.12);
    for (const z of [-0.2, 0.2]) M(Bx(0.06, 0.26, 0.3), B, 0.34, 0.7, z, torso, 0.015);   // pec plates
    { const sash = M(Bx(0.03, 0.12, 1.05), BD, 0.36, 0.62, 0, torso, 0.012); sash.rotation.x = 0.7; }
    M(Cy(0.14, 0.16, 0.2, 10), D, 0, 1.0, 0, torso, 0.02);
    const scarf = M(new THREE.TorusGeometry(0.18, 0.07, 8, 20), BD, 0, 0.98, 0, torso, 0.015, 0.07); scarf.rotation.x = Math.PI / 2; M(Bx(0.12, 0.16, 0.14), BD, 0.17, 0.94, 0.12, torso, 0.015);
    torso.add(head); head.position.set(0.04, 1.24, 0);
    M(Bx(0.46, 0.44, 0.52), D, 0, 0, 0, head, 0.035); M(Bx(0.16, 0.14, 0.46), D, 0.2, -0.24, 0, head, 0.025); for (const z of [-0.16, 0.16]) M(Sp(0.028, 6, 4), STEEL, 0.285, -0.24, z, head, 0);
    { const fc = document.createElement('canvas'); fc.width = fc.height = 256; const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 4;
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.5), new THREE.MeshBasicMaterial({ map: ft, transparent: true, toneMapped: false })); scr.rotation.y = Math.PI / 2; scr.position.set(0.237, 0.01, 0); head.add(scr);
      u.face = { c: fc, g: fc.getContext('2d'), tex: ft, key: '' }; drawFace(u, { ex: 'hack', col: L.eye, dx: 0, tough: true }); }
    const hat = M(new THREE.SphereGeometry(0.36, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), B, -0.02, 0.2, 0, head, 0.03, 0.36); hat.scale.y = 0.85;
    M(Cy(0.42, 0.42, 0.045, 20), B, 0.05, 0.21, 0, head, 0.02); M(Bx(0.55, 0.05, 0.05), A, -0.02, 0.4, 0, head, 0.012);
    { const lp = M(Cy(0.08, 0.095, 0.1, 12), INK, 0.31, 0.34, 0, head, 0.015); lp.rotation.z = Math.PI / 2; eye(new THREE.CircleGeometry(0.065, 14), 0.365, 0.34, 0, head).rotation.y = Math.PI / 2; u.glows[u.glows.length - 1].scale.setScalar(0.5); }
    u.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(0, 0.8, s * 0.66); torso.add(sh); sh.userData.s = s;
      M(Sp(0.25, 14, 10), B, 0, 0.05, 0, sh, 0.035, 0.25); M(Bx(0.36, 0.06, 0.46), A, 0, 0.2, s * 0.03, sh, 0.015);
      M(Cy(0.12, 0.11, 0.42, 10), D, 0, -0.22, 0, sh, 0.025); const el = new THREE.Group(); el.position.y = -0.44; sh.add(el); M(Sp(0.12, 10, 8), D, 0, 0, 0, el, 0.02, 0.12);
      M(Cy(0.13, 0.15, 0.38, 10), B, 0, -0.2, 0, el, 0.025); M(Cy(0.16, 0.16, 0.07, 10), A, 0, -0.36, 0, el, 0.012);
      const fist = new THREE.Group(); fist.position.y = -0.5; el.add(fist); M(Bx(0.3, 0.28, 0.3), INK, 0, 0, 0, fist, 0.03); M(Bx(0.08, 0.24, 0.31), STEEL, 0.15, 0.01, 0, fist, 0.012);
      if (s > 0) { const pk = new THREE.Group(); fist.add(pk); u.pick = pk; M(Cy(0.045, 0.05, 1.3, 8), WOOD, 0, -0.45, 0, pk, 0.015); for (const y of [0.05, -0.12]) M(Cy(0.06, 0.06, 0.06, 8), BD, 0, y, 0, pk, 0);
        M(Bx(0.18, 0.2, 0.16), D, 0, -1.08, 0, pk, 0.02); const sp1 = M(new THREE.ConeGeometry(0.07, 0.62, 8), STEEL, 0.38, -1.12, 0, pk, 0.02); sp1.rotation.z = -Math.PI / 2 - 0.2;
        const sp2 = M(Bx(0.36, 0.1, 0.12), STEEL, -0.24, -1.05, 0, pk, 0.02); sp2.rotation.z = -0.15; M(Bx(0.06, 0.16, 0.14), STEEL, -0.42, -1.04, 0, pk, 0); }
      sh.userData.el = el; return sh; });
    // s364t POLISH: hazard-stripe hat band, PB-07 stencils on the pauldrons, twin exhaust stacks puffing smoke, a tip marker on the pick,
    // and SLAM FX (ground crack decal + dust ring + rock chips + steel sparks) that fire the moment the pick hits the floor.
    { const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.405, 0.405, 0.07, 28, 1, true), new THREE.MeshLambertMaterial({ map: stripeTex(THREE), side: THREE.DoubleSide })); hb.position.set(-0.02, 0.255, 0); head.add(hb); }
    { const st = stencilTex(THREE, 'PB-07', L.accent); for (const a of u.arms) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), new THREE.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false })); const s2 = a.userData.s; pl.position.set(0.02, 0.06, s2 * 0.255); pl.rotation.y = s2 > 0 ? 0 : Math.PI; a.add(pl); } }
    u.puffs = []; u.stacks = [-0.2, 0.2].map(z => { M(Cy(0.07, 0.08, 0.36, 10), D, -0.36, 1.05, z, torso, 0.015); M(Cy(0.085, 0.085, 0.05, 10), INK, -0.36, 1.24, z, torso, 0); const o = new THREE.Object3D(); o.position.set(-0.36, 1.28, z); torso.add(o); return o; });
    for (let i = 0; i < 8; i++) { const sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#9aa0a6', transparent: true, opacity: 0, depthWrite: false })); g.add(sp2); u.puffs.push({ s: sp2, life: 0 }); }
    { const tip = new THREE.Object3D(); tip.position.set(0.66, -1.17, 0); u.pick.add(tip); u.pickTip = tip; }
    { const cm = new THREE.MeshBasicMaterial({ map: crackTex(THREE), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }); const ck = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), cm); ck.rotation.x = -Math.PI / 2; ck.position.y = 0.025; g.add(ck); u.crack = ck;
      const dm = new THREE.MeshBasicMaterial({ color: '#c8b89a', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }); const dr = new THREE.Mesh(new THREE.RingGeometry(0.7, 1, 36), dm); dr.rotation.x = -Math.PI / 2; dr.position.y = 0.06; g.add(dr); u.dust = dr;
      const rk = toon('#6a5a48'); u.chips = []; for (let i = 0; i < 7; i++) { const c = M(new THREE.DodecahedronGeometry(0.05 + (i % 3) * 0.02, 0), rk, 0, -5, 0, g, 0); c.visible = false; u.chips.push({ m: c, v: [0, 0, 0], life: 0 }); }
      u.sparks = []; const skM = new THREE.MeshBasicMaterial({ color: '#ffd23a', toneMapped: false }); for (let i = 0; i < 6; i++) { const k = new THREE.Mesh(Bx(0.03, 0.03, 0.12), skM); k.visible = false; g.add(k); u.sparks.push({ m: k, v: [0, 0, 0], life: 0 }); } }
    { const sd = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: glowTex, color: '#000000', transparent: true, opacity: 0.45, depthWrite: false })); sd.rotation.x = -Math.PI / 2; sd.position.y = 0.02; g.add(sd); u.shadow = sd; } }
  else if (type === 'drill') {   // s364u DRILL CRAWLER FIGHTER (Ben: "like a street fighter character"): a punk brawler on tank treads.
    // Tread base with road wheels + hazard plate; V chest with DC-12 stencil + red sash; spiked pauldrons; red MOHAWK fins; goggles (glow
    // red hacked / cyan freed) over a screen face; right forearm = a big spinning DRILL LANCE, left = a 3-finger CLAW. FX: tread dust,
    // drill sparks on the charge, the tip glows hot + steams after it, smoke from the hip stacks.
    const BD = toon(L.band || '#ec3013'), INK = toon('#15171d'), STEEL = toon('#c8ccd2');
    u.bars = []; u.wheels = [];
    for (const s of [-1, 1]) { M(Bx(1.4, 0.4, 0.32), D, 0, 0.22, s * 0.5, body, 0.03); for (const x of [-0.7, 0.7]) { const e = M(Cy(0.2, 0.2, 0.32, 14), D, x, 0.22, s * 0.5, body, 0.03); e.rotation.x = Math.PI / 2; }
      for (const x of [-0.45, 0, 0.45]) { const w = M(Cy(0.15, 0.15, 0.34, 12), INK, x, 0.2, s * 0.5, body, 0); w.rotation.x = Math.PI / 2; u.wheels.push(w); M(Cy(0.07, 0.07, 0.35, 8), A, x, 0.2, s * 0.5, body, 0).rotation.x = Math.PI / 2; }
      for (let i = 0; i < 8; i++) u.bars.push(M(Bx(0.07, 0.05, 0.34), INK, -0.7 + i * 0.2, 0.44, s * 0.5, body, 0));
      M(Bx(1.5, 0.07, 0.38), B, 0, 0.47, s * 0.5, body, 0.015); }
    M(Bx(1.05, 0.28, 0.72), D, 0, 0.5, 0, body, 0.03);
    { const hz = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.2), new THREE.MeshLambertMaterial({ map: stripeTex(THREE) })); hz.rotation.y = Math.PI / 2; hz.position.set(0.53, 0.5, 0); body.add(hz); }
    u.rear = [-1, 1].map(s => { const o = new THREE.Object3D(); o.position.set(-0.85, 0.08, s * 0.5); body.add(o); return o; });
    const torso = new THREE.Group(); torso.position.set(-0.05, 0.66, 0); body.add(torso); u.torso = torso;
    M(Cy(0.22, 0.28, 0.2, 12), INK, 0, 0.08, 0, torso, 0.02);
    const chest = M(new THREE.CylinderGeometry(0.55, 0.36, 0.6, 4, 1), B, 0, 0.48, 0, torso, 0.045); chest.rotation.y = Math.PI / 4; chest.scale.set(0.7, 1, 1.1);
    { const st = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17), new THREE.MeshBasicMaterial({ map: stencilTex(THREE, 'DC-12', '#15171d'), transparent: true, depthWrite: false })); st.rotation.y = Math.PI / 2; st.position.set(0.315, 0.66, -0.17); st.scale.setScalar(0.85); torso.add(st); }
    { const sash = M(Bx(0.03, 0.11, 0.98), BD, 0.31, 0.5, 0, torso, 0.012); sash.rotation.x = -0.7; }
    u.stacks = [-0.2, 0.2].map(z => { M(Cy(0.06, 0.07, 0.3, 10), D, -0.3, 0.72, z, torso, 0.015); M(Cy(0.075, 0.075, 0.04, 10), INK, -0.3, 0.88, z, torso, 0); const o = new THREE.Object3D(); o.position.set(-0.3, 0.92, z); torso.add(o); return o; });
    M(Cy(0.13, 0.15, 0.16, 10), D, 0, 0.84, 0, torso, 0.02);
    torso.add(head); head.position.set(0.04, 1.06, 0);
    M(Bx(0.44, 0.42, 0.48), D, 0, 0, 0, head, 0.035); M(Bx(0.15, 0.13, 0.42), D, 0.2, -0.22, 0, head, 0.025);
    { const fc = document.createElement('canvas'); fc.width = fc.height = 256; const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 4;
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.46), new THREE.MeshBasicMaterial({ map: ft, transparent: true, toneMapped: false })); scr.rotation.y = Math.PI / 2; scr.position.set(0.227, -0.02, 0); head.add(scr);
      u.face = { c: fc, g: fc.getContext('2d'), tex: ft, key: '' }; drawFace(u, { ex: 'hack', col: L.eye, dx: 0, tough: true }); }
    M(Bx(0.46, 0.06, 0.5), INK, 0.0, 0.24, 0, head, 0.012);   // goggle strap
    for (const z of [-0.11, 0.11]) { const r = M(Cy(0.085, 0.085, 0.07, 14), INK, 0.2, 0.25, z, head, 0.012); r.rotation.z = Math.PI / 2; const e = eye(new THREE.CircleGeometry(0.065, 14), 0.237, 0.25, z, head); e.rotation.y = Math.PI / 2; u.glows[u.glows.length - 1].scale.setScalar(0.35); }
    u.mohawk = []; [[0.12, 0.13], [0.02, 0.2], [-0.08, 0.24], [-0.18, 0.2], [-0.26, 0.13]].forEach(([x, h], i) => { const f = M(Bx(0.09, h, 0.05), BD, x, 0.27 + h / 2, 0, head, 0.012); f.rotation.z = 0.25 + i * 0.05; u.mohawk.push(f); });
    u.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(0, 0.68, s * 0.6); torso.add(sh); sh.userData.s = s;
      M(Sp(0.22, 14, 10), B, 0, 0.04, 0, sh, 0.035, 0.22); for (let k = 0; k < 3; k++) { const sp1 = M(new THREE.ConeGeometry(0.05, 0.16, 8), STEEL, -0.08 + k * 0.08, 0.26, s * 0.04, sh, 0.012); sp1.rotation.x = s * 0.35; }
      M(Cy(0.11, 0.1, 0.4, 10), D, 0, -0.2, 0, sh, 0.025); const el = new THREE.Group(); el.position.y = -0.42; sh.add(el); M(Sp(0.11, 10, 8), D, 0, 0, 0, el, 0.02, 0.11);
      if (s > 0) { M(Cy(0.15, 0.18, 0.34, 12), B, 0, -0.17, 0, el, 0.025); M(Cy(0.2, 0.2, 0.08, 14), A, 0, -0.36, 0, el, 0.012);
        const dr = new THREE.Group(); dr.position.y = -0.42; el.add(dr); u.drill = dr; const cone = M(new THREE.ConeGeometry(0.19, 0.78, 12), STEEL, 0, -0.39, 0, dr, 0.025); cone.rotation.x = Math.PI;
        for (let i = 0; i < 4; i++) { const r = M(new THREE.TorusGeometry(0.16 - i * 0.035, 0.022, 5, 14), INK, 0, -0.1 - i * 0.16, 0, dr, 0); r.rotation.x = Math.PI / 2; r.rotation.y = 0.35; }
        const tip = new THREE.Object3D(); tip.position.y = -0.8; dr.add(tip); u.drillTip = tip;
        const hg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ff5a1e', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); hg.scale.setScalar(0.7); hg.position.y = -0.62; el.add(hg); u.heatGlow = hg; hg.position.y = -1.05; }
      else { M(Cy(0.13, 0.15, 0.34, 10), B, 0, -0.17, 0, el, 0.025); M(Cy(0.16, 0.16, 0.07, 10), A, 0, -0.34, 0, el, 0.012);
        const palm = new THREE.Group(); palm.position.y = -0.42; el.add(palm); M(Bx(0.24, 0.14, 0.24), INK, 0, 0, 0, palm, 0.025);
        u.claw = [[0.07, -0.08], [0.07, 0.08], [-0.09, 0]].map(([x, z]) => { const f = new THREE.Group(); f.position.set(x, -0.06, z); palm.add(f); const a = M(Bx(0.06, 0.2, 0.06), STEEL, 0, -0.1, 0, f, 0.012); const tipc = M(new THREE.ConeGeometry(0.035, 0.1, 6), STEEL, 0, -0.24, 0, f, 0); tipc.rotation.x = Math.PI; void a; f.userData.dir = x > 0 ? 1 : -1; return f; }); }
      sh.userData.el = el; return sh; });
    u.puffs = []; for (let i = 0; i < 14; i++) { const sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#9aa0a6', transparent: true, opacity: 0, depthWrite: false })); g.add(sp2); u.puffs.push({ s: sp2, life: 0 }); }
    u.sparks = []; { const skM = new THREE.MeshBasicMaterial({ color: '#ffd23a', toneMapped: false }); for (let i = 0; i < 10; i++) { const k = new THREE.Mesh(Bx(0.03, 0.03, 0.12), skM); k.visible = false; g.add(k); u.sparks.push({ m: k, v: [0, 0, 0], life: 0 }); } }
    // s364v POLISH: a spiral FLUTE wound round the drill cone, twin HEADLIGHTS on the tread front, an amber BEACON on the back (spins
    // while hacked), BACKFIRE flames out of the hip stacks on the charge, TREAD MARKS left on the floor behind the charge.
    { const pts = []; for (let i = 0; i <= 60; i++) { const k = i / 60, r = 0.19 * (1 - k) + 0.012, a = k * Math.PI * 2 * 3.2; pts.push(new THREE.Vector3(Math.cos(a) * r, -k * 0.78, Math.sin(a) * r)); }
      M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 90, 0.022, 5, false), toon('#8a9098'), 0, 0, 0, u.drill, 0); }
    u.lights = [-1, 1].map(z => { M(Bx(0.08, 0.14, 0.2), INK, 0.56, 0.5, z * 0.33, body, 0.012); const lm = new THREE.MeshBasicMaterial({ color: '#fff0c8', toneMapped: false }); const l = M(new THREE.CircleGeometry(0.055, 12), lm, 0.605, 0.5, z * 0.33, body, 0); l.rotation.y = Math.PI / 2;
      const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#fff0c8', transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(0.45); gl.position.set(0.64, 0.5, z * 0.33); body.add(gl); return { lm, gl }; });
    { M(Cy(0.09, 0.11, 0.08, 12), INK, -0.48, 0.68, 0, body, 0.012); const bm = new THREE.MeshBasicMaterial({ color: '#ffa31a', transparent: true, opacity: 0.9, toneMapped: false }); M(Sp(0.085, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), bm, -0.48, 0.72, 0, body, 0);
      const bk = new THREE.Group(); bk.position.set(-0.48, 0.76, 0); body.add(bk); const beam = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffa31a', transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); beam.scale.set(0.9, 0.35, 1); beam.position.x = 0.12; bk.add(beam); u.beacon = { bk, bm, beam }; }
    u.flames = u.stacks.map(st => { const fm = new THREE.MeshBasicMaterial({ color: '#ff8a1e', transparent: true, opacity: 0, toneMapped: false, depthWrite: false }); const f = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 8), fm); f.position.y = 0.12; st.add(f);
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.16, 6), new THREE.MeshBasicMaterial({ color: '#ffe08a', transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); c.position.y = 0.08; st.add(c); return { f, c }; });
    { const tm = new THREE.MeshBasicMaterial({ color: '#141210', transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }); u.marks = [-1, 1].map(z => { const q = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.28), tm); q.rotation.x = -Math.PI / 2; q.position.set(0, 0.022, z * 0.5); q.visible = false; g.add(q); return q; }); u.markM = tm; }
    { const sd = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.1), new THREE.MeshBasicMaterial({ map: glowTex, color: '#000000', transparent: true, opacity: 0.45, depthWrite: false })); sd.rotation.x = -Math.PI / 2; sd.position.y = 0.02; g.add(sd); u.shadow = sd; } }
  else if (type === 'survey') {   // s364z SURVEY DRONE v2 (Ben): NO body or arms. The hooded HEAD sits on the rotor ring; a CRANE ARM on top of the head
    // (turret yaw → boom → elbow → spotlight cannon) aims the beam in ANY direction (lamp uses lookAt, +z = forward).
    const BD = toon(L.band || '#1a3fb8'), INK = toon('#15171d');
    const base = new THREE.Group(); body.add(base); u.base = base;
    M(new THREE.TorusGeometry(0.42, 0.06, 8, 28), D, 0, 0, 0, base, 0.02, 0.06).rotation.x = Math.PI / 2; M(Cy(0.24, 0.16, 0.16, 14), INK, 0, -0.02, 0, base, 0.02);
    u.rot = []; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, x = Math.cos(a) * 0.58, z = Math.sin(a) * 0.58; const arm = M(Bx(0.26, 0.05, 0.06), D, Math.cos(a) * 0.44, 0, Math.sin(a) * 0.44, base, 0); arm.rotation.y = -a;
      M(Cy(0.08, 0.09, 0.1, 12), B, x, 0, z, base, 0.015); const r = new THREE.Group(); r.position.set(x, 0.07, z); base.add(r); for (const k of [0, Math.PI / 2]) M(Bx(0.36, 0.015, 0.05), A, 0, 0, 0, r, 0).rotation.y = k; u.rot.push(r); }
    { const ug = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#7df9ff', transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })); ug.scale.setScalar(0.9); ug.position.y = -0.12; base.add(ug); u.underGlow = ug; }
    M(Cy(0.2, 0.26, 0.14, 14), B, 0, 0.1, 0, body, 0.02); M(new THREE.TorusGeometry(0.21, 0.025, 6, 20), A, 0, 0.17, 0, body, 0).rotation.x = Math.PI / 2;   // collar on the ring
    body.add(head); head.position.set(0, 0.38, 0);
    M(Bx(0.38, 0.36, 0.4), D, 0, 0, 0, head, 0.03);
    { const fc = document.createElement('canvas'); fc.width = fc.height = 256; const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 4;
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.4), new THREE.MeshBasicMaterial({ map: ft, transparent: true, toneMapped: false })); scr.rotation.y = Math.PI / 2; scr.position.set(0.195, -0.01, 0); head.add(scr);
      u.face = { c: fc, g: fc.getContext('2d'), tex: ft, key: '' }; drawFace(u, { ex: 'hack', col: L.eye, dx: 0, tough: true }); }
    { const hood = M(new THREE.SphereGeometry(0.34, 18, 12, -Math.PI / 2, Math.PI, 0, Math.PI * 0.78), BD, -0.02, 0.03, 0, head, 0.025, 0.34); hood.scale.set(1.0, 1.05, 1.12);
      const peak = M(Bx(0.1, 0.05, 0.42), BD, 0.17, 0.22, 0, head, 0.012); peak.rotation.z = -0.25; }
    { const sco = new THREE.Group(); sco.position.set(0.17, 0.13, 0.25); sco.rotation.y = -0.25; head.add(sco); u.scope = sco; const tb = M(Cy(0.065, 0.075, 0.16, 12), INK, 0.06, 0, 0, sco, 0.015); tb.rotation.z = Math.PI / 2; M(new THREE.TorusGeometry(0.07, 0.015, 6, 14), A, 0.14, 0, 0, sco, 0).rotation.y = Math.PI / 2;
      const ln = eye(new THREE.CircleGeometry(0.055, 14), 0.145, 0, 0, sco); ln.rotation.y = Math.PI / 2; u.glows[u.glows.length - 1].scale.setScalar(0.32); }
    // CRANE ARM
    const cr = new THREE.Group(); cr.position.set(-0.04, 0.33, 0); head.add(cr); u.crane = cr; M(Cy(0.11, 0.13, 0.08, 14), INK, 0, 0, 0, cr, 0.012);
    const yaw = new THREE.Group(); yaw.position.y = 0.05; cr.add(yaw); u.cY = yaw; M(Cy(0.08, 0.09, 0.1, 12), D, 0, 0.04, 0, yaw, 0.015);
    const sh = new THREE.Group(); sh.position.y = 0.11; yaw.add(sh); u.cS = sh; M(Sp(0.065, 10, 8), A, 0, 0, 0, sh, 0.012, 0.065);
    M(Bx(0.07, 0.48, 0.07), B, 0, 0.24, 0, sh, 0.015); for (const z of [-0.045, 0.045]) M(Bx(0.02, 0.42, 0.02), INK, 0, 0.24, z, sh, 0);
    { const hyd = M(Cy(0.018, 0.018, 0.3, 6), toon('#c8ccd2'), 0.06, 0.16, 0, sh, 0); hyd.rotation.z = -0.25; }
    const el = new THREE.Group(); el.position.y = 0.48; sh.add(el); u.cE = el; M(Sp(0.06, 10, 8), A, 0, 0, 0, el, 0.012, 0.06);
    M(Bx(0.06, 0.42, 0.06), B, 0, 0.21, 0, el, 0.015); for (const z of [-0.04, 0.04]) M(Bx(0.018, 0.36, 0.018), INK, 0, 0.21, z, el, 0);
    const wr = new THREE.Group(); wr.position.y = 0.44; el.add(wr); M(Sp(0.05, 10, 8), A, 0, 0, 0, wr, 0.01, 0.05);
    const lamp = new THREE.Group(); wr.add(lamp); u.lamp = lamp;
    { const hs = M(Cy(0.1, 0.13, 0.22, 14), INK, 0, 0, 0.02, lamp, 0.015); hs.rotation.x = Math.PI / 2; M(new THREE.TorusGeometry(0.125, 0.022, 6, 16), A, 0, 0, 0.13, lamp, 0);
      for (let i = 0; i < 4; i++) { const fn = M(Bx(0.02, 0.05, 0.12), D, Math.cos(i * 1.571) * 0.12, Math.sin(i * 1.571) * 0.12, -0.04, lamp, 0); void fn; }
      const lm = new THREE.MeshBasicMaterial({ color: '#fff4c8', toneMapped: false }); u.lensM = lm; M(new THREE.CircleGeometry(0.105, 16), lm, 0, 0, 0.135, lamp, 0);
      const tip = new THREE.Object3D(); tip.position.z = 0.16; lamp.add(tip); u.muzzle = tip;
      u.beamMat = new THREE.MeshBasicMaterial({ color: '#fff4c8', transparent: true, opacity: 0.14, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const bg = new THREE.ConeGeometry(0.6, 4, 18, 1, true); bg.rotateX(-Math.PI / 2); bg.translate(0, 0, 2); const bm = new THREE.Mesh(bg, u.beamMat); bm.position.z = 0.14; lamp.add(bm); u.beam = bm;
      const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffd23a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); fl.scale.setScalar(0.8); tip.add(fl); u.flash = fl; }
    u.v1 = new THREE.Vector3(); u.v2 = new THREE.Vector3();
    u.puffs = []; for (let i = 0; i < 8; i++) { const sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#c8ccd2', transparent: true, opacity: 0, depthWrite: false })); g.add(sp2); u.puffs.push({ s: sp2, life: 0 }); }
    { const sd = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: glowTex, color: '#000000', transparent: true, opacity: 0.4, depthWrite: false })); sd.rotation.x = -Math.PI / 2; g.add(sd); u.shadow = sd; } }
  else if (type === 'hauler') {   // s364aa ORE HAULER = TRANSFORMER BRAWLER (Ben: "mostly still a hauler but with personified qualities").
    // A 6-wheel ore truck. The WINDSHIELD is its face (screen face) under two hinged SUN-VISOR BROWS; the GRILLE is its jaw; the cab is
    // its chest. Freed it is just a truck (arms folded flat along the cab, waves now and then). Hacked it HALF-TRANSFORMS: the cab rears up
    // on its pivot, the fender pauldrons swing out (spare wheel on each shoulder) and two piston arms unfold into a boxing guard.
    // TELL = plow drops + wheels spin in place; ATK = rams; REST = plow half up, cab sags, hood steams (the opening).
    const BD = toon(L.band || '#1a3fb8'), INK = toon('#15171d'), CH = toon('#c8ccd2');
    u.wheels = []; for (const x of [-1.0, -0.35, 0.8]) for (const z of [-1, 1]) { const w = new THREE.Group(); w.position.set(x, 0.3, z * 0.66); body.add(w); w.rotation.x = Math.PI / 2; const ti = M(Cy(0.3, 0.3, 0.26, 16), INK, 0, 0, 0, w, 0.025); void ti;
      M(Cy(0.17, 0.17, 0.27, 12), A, 0, 0, 0, w, 0); M(Bx(0.06, 0.28, 0.3), D, 0, 0, 0, w, 0); M(Bx(0.3, 0.28, 0.06), D, 0, 0, 0, w, 0); u.wheels.push(w); }
    u.rear = [-1, 1].map(z => { const o = new THREE.Object3D(); o.position.set(-1.1, 0.05, z * 0.66); body.add(o); return o; });
    const up = new THREE.Group(); body.add(up); u.up = up;
    M(Bx(2.5, 0.16, 0.7), INK, -0.15, 0.44, 0, up, 0.02);
    // ORE BED
    M(Bx(1.4, 0.1, 1.3), D, -0.65, 0.58, 0, up, 0.02); for (const z of [-0.62, 0.62]) { M(Bx(1.4, 0.44, 0.08), B, -0.65, 0.82, z, up, 0.025); for (const x of [-1.2, -0.65, -0.1]) M(Bx(0.08, 0.46, 0.1), D, x, 0.82, z, up, 0); }
    M(Bx(0.08, 0.44, 1.3), B, -1.35, 0.82, 0, up, 0.025); M(Bx(1.42, 0.06, 1.34), A, -0.65, 1.05, 0, up, 0.012);
    { const st = stencilTex(THREE, 'OH-44', '#15171d'); for (const z of [-1, 1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.3), new THREE.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false })); pl.position.set(-0.75, 0.84, z * 0.665); pl.rotation.y = z > 0 ? 0 : Math.PI; up.add(pl); } }
    u.ore = []; { const ore = toon('#4a3f5a'); for (let i = 0; i < 9; i++) { const x = -1.15 + (i % 3) * 0.45, z = -0.36 + Math.floor(i / 3) * 0.36, y = 0.92 + (i % 2) * 0.06; const o = M(new THREE.DodecahedronGeometry(0.2 + (i % 3) * 0.04, 0), ore, x, y, z, up, 0.02); o.rotation.set(i, i * 2, 0); o.userData.y = y; u.ore.push(o); }
      u.crys = []; const cm = new THREE.MeshBasicMaterial({ color: '#5fe3ff', toneMapped: false }); for (const [x, z] of [[-0.95, 0.15], [-0.45, -0.25], [-0.2, 0.3]]) { const c = M(new THREE.OctahedronGeometry(0.11, 0), cm, x, 1.12, z, up, 0.012); c.scale.y = 1.7; c.userData.y = 1.12; const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#5fe3ff', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(0.5); c.add(gl); u.ore.push(c); u.crys.push(gl); } }
    // CAB (pivots at its rear-bottom so it can rear up)
    const cab = new THREE.Group(); cab.position.set(0.1, 0.58, 0); up.add(cab); u.cab = cab;
    M(Bx(0.9, 0.62, 1.22), B, 0.45, 0.6, 0, cab, 0.035); M(Bx(0.3, 0.42, 1.18), B, 1.0, 0.22, 0, cab, 0.03); M(Bx(0.92, 0.08, 1.24), A, 0.46, 0.93, 0, cab, 0.012);
    M(Bx(0.06, 0.06, 1.2), BD, 0.92, 0.35, 0, cab, 0);   // blue stripe under the windshield
    { const fc = document.createElement('canvas'); fc.width = fc.height = 256; const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 4;
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.56), new THREE.MeshBasicMaterial({ map: ft, transparent: true, toneMapped: false })); scr.rotation.y = Math.PI / 2; scr.position.set(0.905, 0.62, 0); cab.add(scr);
      u.face = { c: fc, g: fc.getContext('2d'), tex: ft, key: '' }; drawFace(u, { ex: 'hack', col: L.eye, dx: 0, tough: true }); }
    u.brows = [-1, 1].map(z => { const b = new THREE.Group(); b.position.set(0.95, 0.92, z * 0.29); cab.add(b); M(Bx(0.14, 0.07, 0.5), D, 0, 0, 0, b, 0.012); b.userData.s = z; return b; });
    { M(Bx(0.06, 0.3, 0.86), INK, 1.16, 0.2, 0, cab, 0.012); for (let i = 0; i < 5; i++) M(Bx(0.04, 0.26, 0.04), CH, 1.19, 0.2, -0.34 + i * 0.17, cab, 0); M(Bx(0.08, 0.06, 1.2), CH, 1.16, 0.02, 0, cab, 0.012); }   // grille jaw + bumper
    u.hoodPt = new THREE.Object3D(); u.hoodPt.position.set(1.0, 0.46, 0); cab.add(u.hoodPt);
    u.lights = [-1, 1].map(z => { M(Bx(0.06, 0.16, 0.18), INK, 1.16, 0.22, z * 0.5, cab, 0.012); const lm = new THREE.MeshBasicMaterial({ color: '#fff0c8', toneMapped: false }); const l = M(new THREE.CircleGeometry(0.065, 12), lm, 1.195, 0.22, z * 0.5, cab, 0); l.rotation.y = Math.PI / 2;
      const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#fff0c8', transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(0.5); gl.position.set(1.23, 0.22, z * 0.5); cab.add(gl); return { lm, gl }; });
    { M(Bx(0.2, 0.07, 0.9), INK, 0.5, 1.0, 0, cab, 0.012); u.bar = [-0.3, 0, 0.3].map(z => { const m2 = new THREE.MeshBasicMaterial({ color: '#5a3a10', toneMapped: false }); M(Sp(0.06, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), m2, 0.5, 1.03, z, cab, 0); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffa31a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(0.45); gl.position.set(0.5, 1.08, z); cab.add(gl); return { m: m2, gl }; }); }
    u.stacks = [-1, 1].map(z => { M(Cy(0.06, 0.07, 0.62, 10), CH, 0.04, 0.95, z * 0.5, cab, 0.015); M(Cy(0.075, 0.075, 0.04, 10), INK, 0.04, 1.27, z * 0.5, cab, 0); const o = new THREE.Object3D(); o.position.set(0.04, 1.3, z * 0.5); cab.add(o); return o; });
    u.flames = u.stacks.map(st => { const fm = new THREE.MeshBasicMaterial({ color: '#ff8a1e', transparent: true, opacity: 0, toneMapped: false, depthWrite: false }); const f = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.3, 8), fm); f.position.y = 0.13; st.add(f); return f; });
    // ARMS: fender pauldron with a spare wheel → upper piston → elbow → forearm ram → fist. Fold flat along the cab side when freed.
    u.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(0.55, 0.62, s * 0.7); cab.add(sh); sh.userData.s = s;
      M(Bx(0.52, 0.12, 0.26), B, 0, 0.12, 0, sh, 0.02); M(Bx(0.54, 0.04, 0.27), A, 0, 0.19, 0, sh, 0);
      { const sw = M(Cy(0.16, 0.16, 0.1, 14), INK, 0, 0.04, s * 0.13, sh, 0.015); sw.rotation.x = Math.PI / 2; M(Cy(0.08, 0.08, 0.11, 10), A, 0, 0.04, s * 0.135, sh, 0).rotation.x = Math.PI / 2; }
      M(Cy(0.08, 0.075, 0.36, 10), D, 0, -0.18, 0, sh, 0.02); M(Cy(0.03, 0.03, 0.4, 6), CH, 0.07, -0.18, 0, sh, 0);
      const el = new THREE.Group(); el.position.y = -0.38; sh.add(el); M(Sp(0.09, 10, 8), INK, 0, 0, 0, el, 0.015, 0.09);
      M(Bx(0.2, 0.34, 0.2), B, 0, -0.18, 0, el, 0.02); M(Bx(0.22, 0.05, 0.22), A, 0, -0.33, 0, el, 0);
      const fist = new THREE.Group(); fist.position.y = -0.46; el.add(fist); M(Bx(0.27, 0.25, 0.27), INK, 0, 0, 0, fist, 0.025); M(Bx(0.08, 0.21, 0.28), CH, 0.135, 0.01, 0, fist, 0.012);
      sh.userData.el = el; return sh; });
    // PLOW (front shield): hangs from a hinge at the bumper; raised = tucked up, dropped = ram blade
    { const sh = new THREE.Group(); sh.position.set(1.36, 0.66, 0); up.add(sh); u.shield = sh; M(Bx(0.1, 0.62, 1.42), A, 0.04, -0.31, 0, sh, 0.025);
      const hz = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 0.22), new THREE.MeshLambertMaterial({ map: stripeTex(THREE) })); hz.rotation.y = Math.PI / 2; hz.position.set(0.095, -0.5, 0); sh.add(hz);
      for (const z of [-0.45, 0, 0.45]) M(Bx(0.12, 0.42, 0.06), D, 0.0, -0.24, z, sh, 0); const tip = new THREE.Object3D(); tip.position.set(0.08, -0.62, 0); sh.add(tip); u.plowTip = tip; }
    u.puffs = []; for (let i = 0; i < 16; i++) { const sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#9aa0a6', transparent: true, opacity: 0, depthWrite: false })); g.add(sp2); u.puffs.push({ s: sp2, life: 0 }); }
    u.sparks = []; { const skM = new THREE.MeshBasicMaterial({ color: '#ffd23a', toneMapped: false }); for (let i = 0; i < 10; i++) { const k = new THREE.Mesh(Bx(0.03, 0.03, 0.12), skM); k.visible = false; g.add(k); u.sparks.push({ m: k, v: [0, 0, 0], life: 0 }); } }
    { const sd = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.2), new THREE.MeshBasicMaterial({ map: glowTex, color: '#000000', transparent: true, opacity: 0.45, depthWrite: false })); sd.rotation.x = -Math.PI / 2; sd.position.set(-0.1, 0.02, 0); g.add(sd); u.shadow = sd; } }
  else if (type === 'relay') { body.add(head);
    M(Bx(1.6, 0.5, 1.6), D, 0, 0.25, 0, body, 0.04); M(Bx(1.2, 0.3, 1.2), B, 0, 0.65, 0, body, 0.03);
    M(Cy(0.16, 0.24, 4.2, 10), B, 0, 2.9, 0, body, 0.04); for (const y of [1.6, 2.6, 3.6]) M(Cy(0.5, 0.5, 0.08, 16), D, 0, y, 0, body, 0.02);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, c = M(Bx(1.4, 0.08, 0.08), D, Math.cos(a) * 0.7, 2.2, Math.sin(a) * 0.7, body, 0); c.rotation.y = -a; }
    head.position.set(0, 5.1, 0); eye(Sp(0.28, 12, 10), 0, 0, 0, head); u.beacon = head;
    u.dishes = [0, 1, 2].map(i => { const d = new THREE.Group(); d.position.set(0, 3.0 + i * 0.4, 0); d.rotation.y = i * 2.1; body.add(d); const dm = M(new THREE.SphereGeometry(0.45, 12, 6, 0, Math.PI * 2, 0, 1.0), A, 0.35, 0, 0, d, 0.02); dm.rotation.z = -Math.PI / 2; return d; });
    u.cables = []; for (let i = 0; i < 6; i++) { const a = i * 1.047, c = M(Cy(0.05, 0.05, 2.4, 6), toon('#1a1c20'), Math.cos(a) * 1.6, 0.06, Math.sin(a) * 1.6, body, 0); c.rotation.z = Math.PI / 2; c.rotation.y = -a; } }
  else if (type === 'rig') {   // s364ai DRILL RIG BOSS v2 (Ben: "one big drill on the head, shorter, so he can headbutt with the giant drill").
    // A squat, bull-like mining mech transformed from a drill rig: short heavy legs, a wide excavator-cab chest with the CORE behind two
    // armour doors, the head sunk between huge pauldrons, ONE GIANT SPINNING DRILL on the forehead like a rhino horn, neck pistons, a
    // dark-red tarp cape, gorilla arms. Attack = HEADBUTT: rears back + spins the drill up, then lunges and drives it into the floor.
    const BD = toon(L.band || '#8a1c14'), INK = toon('#15171d'), CH = toon('#c8ccd2');
    const up = new THREE.Group(); body.add(up); u.up = up;
    u.legs = [-1, 1].map(s => { const hip = new THREE.Group(); hip.position.set(0, 1.28, s * 0.72); up.add(hip);
      M(Cy(0.34, 0.3, 0.6, 12), D, 0, -0.3, 0, hip, 0.04); M(Bx(0.22, 0.46, 0.56), B, 0.26, -0.28, 0, hip, 0.03);
      const kn = new THREE.Group(); kn.position.y = -0.6; hip.add(kn); M(Sp(0.3, 12, 10), B, 0.06, 0, 0, kn, 0.035, 0.3);
      M(Cy(0.3, 0.4, 0.56, 12), D, 0, -0.28, 0, kn, 0.04); M(Bx(0.18, 0.44, 0.5), B, 0.28, -0.26, 0, kn, 0.03); { const ps = M(Cy(0.05, 0.05, 0.5, 8), CH, -0.26, -0.26, 0, kn, 0.012); ps.rotation.z = 0.12; }
      const ft = new THREE.Group(); ft.position.y = -0.56; kn.add(ft); M(Bx(1.1, 0.26, 0.74), INK, 0.2, 0.02, 0, ft, 0.04); M(Bx(0.36, 0.24, 0.76), B, 0.66, 0.02, 0, ft, 0.03);
      M(Cy(0.44, 0.5, 0.08, 16), D, -0.05, -0.09, 0, ft, 0.02); return { hip, kn, ft, s }; });
    M(Bx(1.0, 0.5, 1.75), D, 0, 1.32, 0, up, 0.04); M(Bx(1.05, 0.13, 1.8), A, 0, 1.55, 0, up, 0.02);
    { const hz = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.22), new THREE.MeshLambertMaterial({ map: stripeTex(THREE) })); hz.rotation.y = Math.PI / 2; hz.position.set(0.505, 1.3, 0); up.add(hz); }
    const torso = new THREE.Group(); torso.position.set(0, 1.6, 0); up.add(torso); u.torso = torso;
    M(Cy(0.6, 0.75, 0.4, 12), D, 0, 0.2, 0, torso, 0.03);
    M(Bx(1.45, 0.95, 2.4), B, 0, 0.85, 0, torso, 0.06); M(Bx(1.1, 0.22, 2.1), B, -0.05, 1.4, 0, torso, 0.04);
    { const gm = new THREE.MeshBasicMaterial({ color: '#1c2740', toneMapped: false }); for (const z of [-0.62, 0.62]) { M(Bx(0.05, 0.34, 0.66), INK, 0.71, 1.08, z, torso, 0.01); M(Bx(0.03, 0.27, 0.58), gm, 0.74, 1.08, z, torso, 0); M(Bx(0.035, 0.045, 0.5), toon('#5a6a86'), 0.755, 1.17, z - 0.02, torso, 0); } }
    { const hz = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.2), new THREE.MeshLambertMaterial({ map: stripeTex(THREE) })); hz.rotation.y = Math.PI / 2; hz.position.set(0.73, 0.46, 0); torso.add(hz); }
    { const st = stencilTex(THREE, 'DR-01', '#15171d'); for (const z of [-1, 1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), new THREE.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false })); pl.position.set(0, 0.88, z * 1.205); pl.rotation.y = z > 0 ? 0 : Math.PI; torso.add(pl); } }
    { const hs = M(Cy(0.36, 0.36, 0.12, 18), INK, 0.71, 0.74, 0, torso, 0.015); hs.rotation.z = Math.PI / 2; eye(Sp(0.23, 16, 12), 0.75, 0.74, 0, torso); u.coreGlow = u.glows[u.glows.length - 1]; u.coreGlow.scale.setScalar(1.3); }
    u.doors = [-1, 1].map(s => { const h = new THREE.Group(); h.position.set(0.78, 0.74, s * 0.42); torso.add(h); M(Bx(0.08, 0.56, 0.42), B, 0, 0, -s * 0.21, h, 0.02); M(Bx(0.09, 0.07, 0.42), A, 0.005, 0.19, -s * 0.21, h, 0); h.userData.s = s; return h; });
    u.vents = [-0.6, 0.6].map(z => { M(Bx(0.4, 0.06, 0.36), INK, -0.3, 1.53, z, torso, 0.01); const o = new THREE.Object3D(); o.position.set(-0.3, 1.62, z); torso.add(o); return o; });
    u.corePt = new THREE.Object3D(); u.corePt.position.set(0.85, 0.74, 0); torso.add(u.corePt);
    u.warn = [-1, 1].map(z => { const wm = new THREE.MeshBasicMaterial({ color: '#5a3a10', toneMapped: false }); M(Sp(0.08, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), wm, 0.3, 1.52, z * 0.95, torso, 0); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffa31a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(0.6); gl.position.set(0.3, 1.6, z * 0.95); torso.add(gl); return { wm, gl }; });
    torso.add(head); head.position.set(0.34, 1.64, 0);
    for (const z of [-0.32, 0.32]) { const np = M(Cy(0.05, 0.05, 0.55, 8), CH, -0.32, -0.12, z, head, 0.012); np.rotation.z = -0.6; M(Cy(0.08, 0.08, 0.12, 8), INK, -0.5, -0.32, z, head, 0.01); }
    M(Bx(0.8, 0.6, 0.86), D, 0, 0, 0, head, 0.04); M(Bx(0.32, 0.22, 0.8), D, 0.28, -0.3, 0, head, 0.03); for (const z of [-0.28, 0.28]) M(Sp(0.03, 6, 4), CH, 0.445, -0.3, z, head, 0);
    { const fc = document.createElement('canvas'); fc.width = fc.height = 256; const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 4;
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.46), new THREE.MeshBasicMaterial({ map: ft, transparent: true, toneMapped: false })); scr.rotation.y = Math.PI / 2; scr.position.set(0.405, 0.02, 0); head.add(scr);
      u.face = { c: fc, g: fc.getContext('2d'), tex: ft, key: '' }; drawFace(u, { ex: 'hack', col: L.eye, dx: 0, tough: true }); }
    M(Bx(0.9, 0.16, 0.94), B, -0.02, 0.37, 0, head, 0.03); { const bv = M(Bx(0.14, 0.1, 0.92), B, 0.42, 0.27, 0, head, 0.015); bv.rotation.z = -0.3; }
    // THE GIANT HEAD DRILL (rhino-horn mount on the forehead, tilted up; the bit spins round its own axis)
    { const hd = new THREE.Group(); hd.position.set(0.06, 0.46, 0); hd.rotation.z = -Math.PI / 2 + 0.62; head.add(hd); u.hd = hd;
      M(Cy(0.38, 0.44, 0.32, 18), A, 0, 0.1, 0, hd, 0.025); { const r = M(new THREE.TorusGeometry(0.37, 0.05, 6, 22), INK, 0, 0.27, 0, hd, 0); r.rotation.x = Math.PI / 2; }
      const bit = new THREE.Group(); bit.position.y = 0.3; hd.add(bit); u.bit = bit;
      M(new THREE.ConeGeometry(0.36, 1.75, 16), CH, 0, 0.875, 0, bit, 0.03);
      { const pts = []; for (let i = 0; i <= 70; i++) { const k = i / 70, r = 0.36 * (1 - k) + 0.018, a = k * Math.PI * 2 * 3.6; pts.push(new THREE.Vector3(Math.cos(a) * r, k * 1.75, Math.sin(a) * r)); } M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 110, 0.04, 5, false), toon('#8a9098'), 0, 0, 0, bit, 0); }
      for (const [y, r] of [[0.12, 0.33], [0.3, 0.3]]) { const b = M(new THREE.TorusGeometry(r, 0.025, 5, 18), A, 0, y, 0, bit, 0); b.rotation.x = Math.PI / 2; }
      const tip = new THREE.Object3D(); tip.position.y = 1.78; bit.add(tip); u.bitTip = tip;
      const hg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ff5a1e', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); hg.scale.setScalar(0.75); hg.position.y = 1.85; hd.add(hg); u.heatGlow = hg; }
    u.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(0, 1.12, s * 1.48); sh.scale.setScalar(0.86); torso.add(sh); sh.userData.s = s;
      M(Bx(1.0, 0.5, 0.85), B, 0, 0.2, s * 0.05, sh, 0.04); M(Bx(1.02, 0.08, 0.87), A, 0, 0.47, s * 0.05, sh, 0.012); { const ps = M(Cy(0.07, 0.07, 0.9, 8), CH, -0.32, -0.15, -s * 0.18, sh, 0.012); ps.rotation.x = -s * 0.35; }
      M(Cy(0.24, 0.22, 0.9, 12), D, 0, -0.45, 0, sh, 0.035); const el = new THREE.Group(); el.position.y = -0.95; sh.add(el); M(Sp(0.26, 12, 10), INK, 0, 0, 0, el, 0.025, 0.26);
      M(Bx(0.56, 0.88, 0.56), B, 0, -0.44, 0, el, 0.04); M(Bx(0.6, 0.1, 0.6), A, 0, -0.86, 0, el, 0.012);
      const fist = new THREE.Group(); fist.position.y = -1.1; el.add(fist); M(Bx(0.72, 0.62, 0.72), INK, 0, 0, 0, fist, 0.04); M(Bx(0.14, 0.5, 0.74), CH, 0.37, 0.02, 0, fist, 0.015);
      for (const z of [-0.24, 0, 0.24]) { const k = M(new THREE.ConeGeometry(0.07, 0.24, 8), A, 0.52, 0.1, z, fist, 0.01); k.rotation.z = -Math.PI / 2; }
      sh.userData.el = el; return sh; });
    { const cm = BD.clone(); cm.side = THREE.DoubleSide; u.cape = [-0.8, 0, 0.8].map((z, j) => { const root = new THREE.Group(); root.position.set(-0.72, 1.42, z); torso.add(root); let par = root; const segs = [];
        for (let i = 0; i < 4; i++) { const sg = new THREE.Group(); sg.position.y = i ? -0.52 : 0; par.add(sg); const pl = M(new THREE.PlaneGeometry(0.82, 0.54), cm, 0, -0.26, 0, sg, 0); pl.rotation.y = Math.PI / 2; segs.push(sg); par = sg; }
        root.userData = { segs, j }; return root; }); }
    { const cm2 = new THREE.MeshBasicMaterial({ map: crackTex(THREE), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }); const ck = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), cm2); ck.rotation.x = -Math.PI / 2; ck.position.y = 0.025; g.add(ck); u.crack = ck;
      const dm = new THREE.MeshBasicMaterial({ color: '#c8b89a', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }); const dr = new THREE.Mesh(new THREE.RingGeometry(0.7, 1, 40), dm); dr.rotation.x = -Math.PI / 2; dr.position.y = 0.06; g.add(dr); u.dust = dr;
      const rk = toon('#6a5a48'); u.chips = []; for (let i = 0; i < 12; i++) { const c = M(new THREE.DodecahedronGeometry(0.07 + (i % 3) * 0.03, 0), rk, 0, -5, 0, g, 0); c.visible = false; u.chips.push({ m: c, v: [0, 0, 0], life: 0 }); }
      u.sparks = []; const skM = new THREE.MeshBasicMaterial({ color: '#ffd23a', toneMapped: false }); for (let i = 0; i < 16; i++) { const k = new THREE.Mesh(Bx(0.04, 0.04, 0.16), skM); k.visible = false; g.add(k); u.sparks.push({ m: k, v: [0, 0, 0], life: 0 }); } }
    u.puffs = []; for (let i = 0; i < 18; i++) { const sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#c8ccd2', transparent: true, opacity: 0, depthWrite: false })); g.add(sp2); u.puffs.push({ s: sp2, life: 0 }); }
    { const sd = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.4), new THREE.MeshBasicMaterial({ map: glowTex, color: '#000000', transparent: true, opacity: 0.5, depthWrite: false })); sd.rotation.x = -Math.PI / 2; sd.position.y = 0.02; g.add(sd); u.shadow = sd; } }
  // generic: a small hazard light
  u.size = L.size || 1; return g; }

// s = { mode: 'idle' | 'tell' | 'atk' | 'rest' | 'stun', p: 0..1, speed, dt, t, hacked: bool }
const dmp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt)), sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
export function poseMachine(g, s) { const u = g.userData, type = u.type, dt = s.dt || 0.016, t = s.t || 0, m = s.mode || 'idle', p = Math.min(1, Math.max(0, s.p || 0)), sp = s.speed || 0, hk = s.hacked !== false;
  // eyes: HACKED = red pulse + glitch flicker (the real robot shows through in cyan for a frame); FREED = steady cyan; STUN = dim
  const flick = hk && (Math.sin(t * 13 + (u.seed || 0)) > 0.95 || Math.sin(t * 0.7) > 0.985), stun = m === 'stun';
  const col = stun ? (Math.sin(t * 9) > 0 ? '#3a0a08' : (hk ? u.look.eye : u.look.free)) : flick || !hk ? u.look.free : u.look.eye, k = hk && !stun ? 0.55 + 0.45 * Math.sin(t * 6) : 1;
  for (const e of u.eyes) { e.color.set(col); if (hk && !stun && !flick) e.color.multiplyScalar(0.45 + 0.55 * k); } for (const gl of u.glows || []) { gl.material.color.set(col); gl.material.opacity = stun ? 0.2 : m === 'tell' ? 0.9 : type === 'r8' && !hk ? 0.18 : 0.5; }
  // glitch: hacked heads twitch now and then
  u.gl = (u.gl || 0) - dt; if (hk && !stun && u.gl <= 0 && Math.random() < dt * 1.4) { u.gl = 0.12; u.gx = (Math.random() - 0.5) * 0.08; u.gr = (Math.random() - 0.5) * 0.25; }
  const gOn = u.gl > 0; u.head.position.z = gOn ? u.gx : dmp(u.head.position.z, 0, 20, dt); if (hk || stun) u.head.rotation.y = gOn ? u.gr : dmp(u.head.rotation.y, 0, 14, dt);
  // stun slump
  u.body.rotation.z = dmp(u.body.rotation.z, stun ? -0.22 : 0, 6, dt);
  if (type === 'r8') { const angry = hk && !stun, fight = angry || m === 'tell' || m === 'atk';
    // fighting-game idle: a quick rhythmic bounce + forward lean when hacked; slow float + upright when freed; drop when stunned
    const bob = stun ? -0.32 + Math.sin(t * 3) * 0.02 : fight ? -Math.abs(Math.sin(t * 4.2)) * 0.09 + 0.04 : Math.sin(t * 1.8) * 0.06; u.head.position.y = dmp(u.head.position.y, bob, 18, dt);
    u.head.rotation.z = dmp(u.head.rotation.z, stun ? -0.35 : m === 'atk' ? -0.22 : fight ? -0.1 : 0.1, 8, dt);
    if (!hk && !stun && !(u.cel > 0)) { const look = Math.sin(t * 0.45) > 0.55 ? 0.5 : Math.sin(t * 0.45) < -0.75 ? -0.35 : 0; u.head.rotation.y = dmp(u.head.rotation.y, look, 2.5, dt); } u.head.rotation.x = dmp(u.head.rotation.x, stun ? 0.2 : 0, 6, dt);
    u.bl = (u.bl || 0) - dt; if (u.bl < -2.8 - Math.random() * 2.5) u.bl = 0.14;
    { const ex = u.cel > 0 ? 'joy' : stun ? 'stun' : !hk ? (u.bl > 0 ? 'blink' : 'free') : m === 'tell' || m === 'atk' ? 'mad' : 'hack';
      const dx = !hk && !stun ? Math.round(-(u.head.rotation.y || 0) * 30) : 0, glitch = hk && gOn ? 1 + (Math.random() * 3 | 0) : 0, fl = hk && flick;
      drawFace(u, { ex, col: fl || !hk || stun ? u.look.free : u.look.eye, dx, glitch, fl, spin: stun ? Math.floor(t * 8) % 4 : 0 });
      u.faceGlow.material.color.set(fl || !hk ? u.look.free : u.look.eye); u.faceGlow.material.opacity = stun ? 0.08 : m === 'tell' ? 0.45 : hk ? 0.28 : 0.16; }
    // ARMS [shoulder, elbow] (rotation.z: + swings forward). Guard = fists up in front; TELL = right arm locks out, aiming the welder; ATK = recoil
    const pump = Math.sin(t * 4.2), wave = !hk && !stun && Math.sin(t * 0.37) > 0.93;
    for (const a of u.arms) { const s = a.userData.s, R = s > 0; let sh, el, sp = 0.18 * s;
      if (stun) { sh = 0.15; el = 0.1; sp = 0.05 * s; }
      else if (!hk) { if (R) { sh = wave ? 2.6 : 0.1 + Math.sin(t * 1.1 + 1.5) * 0.08; el = wave ? 0.6 + Math.sin(t * 9) * 0.35 : 0.4 + Math.sin(t * 1.1 + 2.1) * 0.1; sp = wave ? 0.1 : -0.32; } else { sh = 0.12 + Math.sin(t * 1.1) * 0.08; el = 0.3 + Math.sin(t * 1.1 + 0.6) * 0.1; sp = 0.32; } }   // s364l CASUAL: both arms hang loose and sway, the wrench twirls, a wave now and then
      else if (R && m === 'tell') { sh = 1.55; el = 0.05; sp = 0.12; }
      else if (R && m === 'atk') { sh = 1.75 - p * 0.6; el = 0.25 * p; sp = 0.12; }
      else if (!R && (m === 'tell' || m === 'atk')) { sh = 0.75; el = 2.0; sp = -0.15; }
      else { sh = 0.85 + (R ? pump : -pump) * 0.1; el = 1.75 + (R ? -pump : pump) * 0.12; sp = 0.22 * s; }
      a.rotation.z = dmp(a.rotation.z, sh, m === 'atk' ? 30 : 12, dt); a.userData.el.rotation.z = dmp(a.userData.el.rotation.z, el, m === 'atk' ? 30 : 12, dt); a.rotation.x = dmp(a.rotation.x, sp, 10, dt); }
    if (u.weld) u.weld.material.opacity = !hk ? 0 : m === 'tell' ? 0.5 + 0.5 * Math.sin(t * 40) * p : m === 'atk' ? 1 - p : 0;
    // HEADBAND TAILS whip behind: faster when fighting, droop when stunned
    { const want = stun ? 0 : u.cel > 0 ? 60 : fight ? (m === 'tell' || m === 'atk' ? 48 : 34) : 16; u.propV = dmp(u.propV || 0, want, stun ? 1.5 : 4, dt); u.prop.rotation.x += u.propV * dt; u.propBlur.opacity = Math.min(0.28, Math.max(0, (u.propV - 12) / 120)); }
    if (u.wasHk && !hk) u.cel = 1.4; u.wasHk = hk; u.cel = Math.max(0, (u.cel || 0) - dt);
    if (u.cel > 0) { const c = 1 - u.cel / 1.4; u.head.rotation.y = c * Math.PI * 2; u.head.position.y = Math.sin(c * Math.PI) * 0.45; const R = u.arms[1]; R.rotation.z = 2.9; R.userData.el.rotation.z = 0.2; }
    const gy = g.position.y; u.shadow.position.y = -gy + 0.02; const sc = Math.max(0.5, 1.2 - gy * 0.15); u.shadow.scale.setScalar(sc); u.shadow.material.opacity = Math.max(0.15, 0.5 - gy * 0.08);
    const showSh = hk && !stun; for (const q of u.shards) { const d = q.userData; d.a += dt * d.sp * (gOn ? 3 : 1); q.visible = showSh; q.position.set(Math.cos(d.a) * d.r * 0.6, d.y + Math.sin(t * 3 + d.a) * 0.06, Math.sin(d.a) * d.r); q.rotation.set(t * 3 + d.a, t * 2, 0); const k = u.cel > 0 ? 1 + (1.4 - u.cel) * 4 : 1; q.position.multiplyScalar(k); }
    u.shardM.opacity = u.cel > 0 ? Math.max(0, u.cel - 0.9) * 2 : gOn ? 1 : 0.75; if (flick) u.shardM.color.set(u.look.free); else u.shardM.color.set(u.look.eye);
    if (u.wrench) { const cas = !hk && !stun && !wave && !(u.cel > 0); u.wrench.rotation.z = 0; u.wrench.rotation.y = cas ? t * 5 : dmp(u.wrench.rotation.y % 6.283, 0, 8, dt); }   // s364m casual: the wrench hangs loose and twirls in his fingers
    u.jet.material.opacity = stun ? 0.08 : 0.4 + 0.3 * Math.random(); { const f = 0.85 + Math.random() * 0.3; u.jetHot.material.opacity = stun ? 0.1 : 0.7 + Math.random() * 0.25; u.jetHot.scale.set(f, (stun ? 0.4 : 0.8) + Math.random() * 0.35, f); u.jetRed.material.opacity = stun ? 0.05 : 0.25 + Math.random() * 0.15; u.jetRed.position.y = -1.08 - u.jet.scale.y * 0.05; } u.jet.scale.y = (stun ? 0.4 : 0.8) + Math.random() * 0.4; u.jetGlow.material.opacity = stun ? 0.1 : 0.4 + 0.2 * Math.random(); }
  else if (type === 'pick') { const fight = hk && !stun; u.ph = (u.ph || 0) + sp * dt * 3.0;
    if (u.wasHk && !hk) u.cel = 1.3; u.wasHk = hk; u.cel = Math.max(0, (u.cel || 0) - dt); const cel = u.cel > 0;
    // stance: knees bent + a rhythmic bounce when hacked; relaxed when freed; buckled when stunned
    const bounce = fight && m === 'idle' ? Math.abs(Math.sin(t * 4)) * 0.05 : 0, crouch = stun ? 0.22 : fight ? (m === 'tell' ? 0.06 : m === 'atk' || m === 'rest' ? 0.16 : 0.1 - bounce) : cel ? -0.08 * Math.sin((1 - u.cel / 1.3) * Math.PI) * 3 : 0.03;
    u.hips.position.y = dmp(u.hips.position.y, 1.05 - crouch, 14, dt); u.torso.position.y = u.hips.position.y + 0.23;
    for (const l of u.legs) { const sw = Math.sin(u.ph + (l.s > 0 ? 0 : Math.PI)) * Math.min(0.55, sp * 0.35), bend = crouch * 3.2;
      l.hip.rotation.z = dmp(l.hip.rotation.z, sw + bend * 0.5 + (fight ? l.s * 0.12 : 0), 12, dt); l.kn.rotation.z = dmp(l.kn.rotation.z, -bend - Math.max(0, -sw) * 0.6, 12, dt); l.ft.rotation.z = -(l.hip.rotation.z + l.kn.rotation.z);
      l.hip.rotation.x = dmp(l.hip.rotation.x, l.s * (fight ? 0.2 : 0.08), 8, dt); }
    const lean = stun ? -0.3 : m === 'tell' ? 0.18 * sm(p) : m === 'atk' ? -0.42 * sm(Math.min(1, p * 2.2)) : m === 'rest' ? -0.38 : fight ? -0.1 : 0.02;
    u.torso.rotation.z = m === 'atk' ? lean : dmp(u.torso.rotation.z, lean, 9, dt); u.torso.rotation.y = dmp(u.torso.rotation.y, fight && m === 'idle' ? -0.3 : stun ? 0.15 : 0, 6, dt);
    if (!hk && !stun && !cel) { const lk = Math.sin(t * 0.45) > 0.55 ? 0.45 : Math.sin(t * 0.45) < -0.75 ? -0.3 : 0; u.head.rotation.y = dmp(u.head.rotation.y, lk, 2.5, dt); }
    const R = u.arms[1], Lf = u.arms[0], pk = u.pick; let rs, re, pr, ls, le, lx = -0.1;
    if (stun) { rs = 0.1; re = 0.1; pr = 0.25; ls = 0.1; le = 0.15; }
    else if (cel) { rs = 0.4; re = 2.3; pr = 1.6; ls = 3.0; le = 0.2 + Math.sin(t * 14) * 0.15; lx = -0.2; }
    else if (!hk) { rs = 0.4; re = 2.3; pr = 1.6; ls = 0.12 + Math.sin(t * 1.1) * 0.06; le = 0.3; }
    else if (m === 'tell') { rs = 0.5 + 2.6 * sm(p); re = 1.2 - 0.9 * sm(p); pr = 1.0 - 0.6 * sm(p); ls = 0.9; le = 1.9; }
    else if (m === 'atk') { const k = sm(Math.min(1, p * 2.4)); rs = 3.1 - 2.55 * k; re = 0.3 - 0.2 * k; pr = 0.4 - 0.2 * k; ls = 0.4; le = 1.2; }
    else if (m === 'rest') { rs = 0.55; re = 0.1; pr = 0.2; ls = 0.4; le = 1.2; }
    else { const pump = Math.sin(t * 4); rs = 0.5 + pump * 0.05; re = 1.2; pr = 1.0; ls = 0.95 - pump * 0.08; le = 1.95 + pump * 0.08; }
    if (m === 'rest' && hk && !stun) { const tug = Math.max(0, Math.sin(t * 26)) * 0.06 * (p > 0 ? 1 : 1); rs += tug; u.torso.rotation.z += Math.sin(t * 26) * 0.006; }
    const kk = m === 'atk' ? 40 : 11; R.rotation.z = m === 'atk' ? rs : dmp(R.rotation.z, rs, kk, dt); R.userData.el.rotation.z = m === 'atk' ? re : dmp(R.userData.el.rotation.z, re, kk, dt); pk.rotation.z = m === 'atk' ? pr : dmp(pk.rotation.z, pr, kk, dt); R.rotation.x = dmp(R.rotation.x, 0.1, 8, dt);
    Lf.rotation.z = dmp(Lf.rotation.z, ls, 11, dt); Lf.userData.el.rotation.z = dmp(Lf.userData.el.rotation.z, le, 11, dt); Lf.rotation.x = dmp(Lf.rotation.x, lx, 8, dt);
    u.bl = (u.bl || 0) - dt; if (u.bl < -3 - Math.random() * 2.5) u.bl = 0.14;
    { const ex = cel ? 'joy' : stun ? 'stun' : !hk ? (u.bl > 0 ? 'blink' : 'free') : m === 'tell' || m === 'atk' ? 'mad' : 'hack', fl = hk && flick;
      drawFace(u, { ex, col: fl || !hk || stun ? u.look.free : u.look.eye, dx: !hk && !stun ? Math.round(-(u.head.rotation.y || 0) * 30) : 0, glitch: hk && gOn ? 1 + (Math.random() * 3 | 0) : 0, fl, spin: stun ? Math.floor(t * 8) % 4 : 0, tough: true }); }
    u.shadow.scale.setScalar(1 + crouch * 0.4);
    // SLAM FX: fire once when the swing reaches the floor
    if (m !== 'atk') u.slammed = false; else if (!u.slammed && p >= 0.4) { u.slammed = true; const V = u.pickTip.position.constructor, w = u.pickTip.getWorldPosition(new V()); g.worldToLocal(w);
      u.crack.position.set(w.x, 0.025, w.z); u.crack.rotation.z = Math.random() * 6.283; u.crack.material.opacity = 1; u.crackT = 2.6; u.dust.position.set(w.x, 0.06, w.z); u.dustT = 0;
      u.chips.forEach(c => { const a = Math.random() * 6.283, v = 1.5 + Math.random() * 2.5; c.m.position.set(w.x, 0.1, w.z); c.v = [Math.cos(a) * v, 2.5 + Math.random() * 3, Math.sin(a) * v]; c.life = 0.9 + Math.random() * 0.4; c.m.visible = true; });
      u.sparks.forEach(k => { const a = Math.random() * 6.283, v = 3 + Math.random() * 3; k.m.position.set(w.x, 0.15, w.z); k.v = [Math.cos(a) * v, 2 + Math.random() * 3, Math.sin(a) * v]; k.life = 0.3 + Math.random() * 0.2; k.m.visible = true; }); }
    if (u.crackT > 0) { u.crackT -= dt; u.crack.material.opacity = Math.min(1, u.crackT / 0.8); }
    if (u.dustT != null && u.dustT < 0.7) { u.dustT += dt; const k = u.dustT / 0.7; u.dust.scale.setScalar(0.3 + k * 1.6); u.dust.material.opacity = 0.55 * (1 - k); }
    for (const c of u.chips) { if (!c.m.visible) continue; c.life -= dt; c.v[1] -= 14 * dt; c.m.position.x += c.v[0] * dt; c.m.position.y = Math.max(0.04, c.m.position.y + c.v[1] * dt); c.m.position.z += c.v[2] * dt; if (c.m.position.y <= 0.04) { c.v[0] *= 0.7; c.v[2] *= 0.7; c.v[1] = Math.abs(c.v[1]) * 0.3; } c.m.rotation.x += dt * 9; if (c.life <= 0) c.m.visible = false; }
    for (const k of u.sparks) { if (!k.m.visible) continue; k.life -= dt; k.v[1] -= 10 * dt; k.m.position.x += k.v[0] * dt; k.m.position.y += k.v[1] * dt; k.m.position.z += k.v[2] * dt; k.m.lookAt(k.m.position.x + k.v[0], k.m.position.y + k.v[1], k.m.position.z + k.v[2]); if (k.life <= 0) k.m.visible = false; }
    // EXHAUST: dark puffs, fast + thick when hacked, a burst on the slam, gentle grey wisps when freed, none when stunned
    u.pT = (u.pT || 0) - dt; const rate = stun ? 0 : hk ? (m === 'tell' ? 0.07 : 0.16) : 0.5;
    if (rate && u.pT <= 0) { u.pT = rate * (0.7 + Math.random() * 0.6); for (const st of u.stacks) { const q = u.puffs.find(q => q.life <= 0); if (!q) break; const V = st.position.constructor, w = st.getWorldPosition(new V()); g.worldToLocal(w); q.s.position.copy(w); q.life = q.max = 1.1 + Math.random() * 0.5; q.s.material.color.set(hk ? '#3b4049' : '#c8ccd2'); } }
    for (const q of u.puffs) { if (q.life <= 0) { q.s.material.opacity = 0; continue; } q.life -= dt; const k = 1 - q.life / q.max; q.s.position.y += dt * (0.9 - k * 0.4); q.s.position.x -= dt * 0.25; q.s.scale.setScalar(0.18 + k * 0.6); q.s.material.opacity = (hk ? 0.55 : 0.3) * (1 - k); } }
  else if (type === 'drill') { const fight = hk && !stun; if (u.wasHk && !hk) u.cel = 1.3; u.wasHk = hk; u.cel = Math.max(0, (u.cel || 0) - dt); const cel = u.cel > 0;
    // particles live in g's space: shift them back when g moves so dust + sparks stay where they were made
    const gx = g.position.x / (u.size || 1), dgx = gx - (u.lastX == null ? gx : u.lastX); u.lastX = gx; if (dgx) { for (const q of u.puffs) if (q.life > 0) q.s.position.x -= dgx; for (const k of u.sparks) if (k.m.visible) k.m.position.x -= dgx; }
    const rev = m === 'tell' ? 4 + 10 * p : 0; u.tr = (u.tr || 0) + (sp + rev) * dt;
    const n = 8; u.bars.forEach((b, i) => { b.position.x = -0.7 + ((((i % n) / n + u.tr / 1.6) % 1 + 1) % 1) * 1.4; }); for (const w of u.wheels) w.rotation.y = -u.tr / 0.15;
    const bounce = fight && m === 'idle' ? Math.abs(Math.sin(t * 4.5)) * 0.045 : 0; u.torso.position.y = dmp(u.torso.position.y, 0.66 + bounce - (stun ? 0.12 : 0), 14, dt);
    const lean = stun ? 0.28 : m === 'tell' ? 0.16 * sm(p) : m === 'atk' ? -0.4 : m === 'rest' ? -0.12 : fight ? -0.08 : 0.04;
    u.torso.rotation.z = dmp(u.torso.rotation.z, lean, m === 'atk' ? 20 : 8, dt); u.torso.rotation.y = dmp(u.torso.rotation.y, fight && m === 'idle' ? -0.25 : m === 'tell' ? -0.45 : 0, 6, dt);
    u.body.position.x = m === 'tell' ? Math.sin(t * 60) * 0.02 : 0;
    if (!hk && !stun && !cel) { const lk = Math.sin(t * 0.45) > 0.55 ? 0.45 : Math.sin(t * 0.45) < -0.75 ? -0.3 : 0; u.head.rotation.y = dmp(u.head.rotation.y, lk, 2.5, dt); }
    u.mohawk.forEach((f, i) => { f.rotation.x = Math.sin(t * (fight ? 10 : 3) - i * 0.7) * (stun ? 0.02 : fight ? 0.08 : 0.04); });
    const R = u.arms[1], Lf = u.arms[0]; let rs, re, ls, le, lx = -0.1, claw;
    if (stun) { rs = 0.1; re = 0.1; ls = 0.1; le = 0.15; claw = 0.05; }
    else if (cel) { rs = 2.9; re = 0.1; ls = 3.0; le = 0.2 + Math.sin(t * 14) * 0.15; claw = 0.6 + Math.sin(t * 14) * 0.4; lx = -0.2; }
    else if (!hk) { rs = 0.3; re = 0.4; ls = 0.15 + Math.sin(t * 1.1) * 0.06; le = 0.35; claw = 0.2 + Math.max(0, Math.sin(t * 0.8)) * 0.55; }
    else if (m === 'tell') { rs = 2.55; re = -0.45; ls = 0.95; le = 1.9; claw = 0.05; }
    else if (m === 'atk') { rs = 1.55; re = 0.0; ls = -0.35; le = 0.5; claw = 0.7; }
    else if (m === 'rest') { rs = 0.75 + Math.sin(t * 20) * 0.02; re = 0.25; ls = 0.4; le = 1.0; claw = 0.4; }
    else { const pump = Math.sin(t * 4.5); rs = 1.0 + pump * 0.05; re = 1.05; ls = 0.95 - pump * 0.08; le = 1.95 + pump * 0.08; claw = 0.12; }
    const kk = m === 'atk' ? 30 : 11; R.rotation.z = dmp(R.rotation.z, rs, kk, dt); R.userData.el.rotation.z = dmp(R.userData.el.rotation.z, re, kk, dt); R.rotation.x = dmp(R.rotation.x, 0.08, 8, dt);
    Lf.rotation.z = dmp(Lf.rotation.z, ls, 11, dt); Lf.userData.el.rotation.z = dmp(Lf.userData.el.rotation.z, le, 11, dt); Lf.rotation.x = dmp(Lf.rotation.x, lx, 8, dt);
    for (const f of u.claw) f.rotation.z = dmp(f.rotation.z, f.userData.dir * claw, 12, dt);
    const want = stun ? 0 : cel ? 40 : !hk ? 3 : m === 'tell' ? 10 + 42 * p : m === 'atk' ? 52 : m === 'rest' ? 1.5 : 8; u.dv = dmp(u.dv || 0, want, stun ? 1.5 : m === 'rest' ? 1.0 : 5, dt); u.drill.rotation.y += u.dv * dt;
    u.heat = Math.max(0, Math.min(1, (u.heat || 0) + dt * (m === 'atk' ? 2.4 : m === 'tell' ? 0.5 : -0.3))); u.heatGlow.material.opacity = u.heat * 0.85 * (0.85 + Math.random() * 0.15);
    // FX
    const V = u.drillTip.position.constructor, wp = (o) => { const w = o.getWorldPosition(new V()); g.worldToLocal(w); w.divideScalar(1); return w; };
    const puff = (o, col, op, up, big) => { const q = u.puffs.find(q => q.life <= 0); if (!q) return; q.s.position.copy(wp(o)).multiplyScalar(1 / (u.size || 1)); q.life = q.max = 0.8 + Math.random() * 0.5; q.op = op; q.up = up; q.big = big; q.s.material.color.set(col); };
    const spark = () => { const k = u.sparks.find(k => !k.m.visible); if (!k) return; k.m.position.copy(wp(u.drillTip)).multiplyScalar(1 / (u.size || 1)); const a = Math.random() * 6.283; k.v = [1 + Math.random() * 2, 1 + Math.random() * 3, Math.cos(a) * 3]; k.life = 0.25 + Math.random() * 0.2; k.m.visible = true; };
    u.fxT = (u.fxT || 0) - dt; if (u.fxT <= 0) { u.fxT = 0.06;
      if (m === 'atk' || (m === 'tell' && p > 0.3)) for (const r of u.rear) if (Math.random() < 0.8) puff(r, '#c8b89a', 0.6, 0.3, 1.2);
      if (m === 'atk' && hk) { spark(); spark(); }
      if (u.heat > 0.35 && m !== 'atk' && Math.random() < 0.6) puff(u.drillTip, '#e8eef2', 0.45 * u.heat, 1.1, 0.7);
      u.sT = (u.sT || 0) - 0.06; const rate = stun ? 0 : hk ? (m === 'tell' ? 0.1 : 0.22) : 0.55; if (rate && u.sT <= 0) { u.sT = rate; for (const st of u.stacks) puff(st, hk ? '#3b4049' : '#c8ccd2', hk ? 0.5 : 0.28, 0.9, 0.8); } }
    for (const q of u.puffs) { if (q.life <= 0) { q.s.material.opacity = 0; continue; } q.life -= dt; const k = 1 - q.life / q.max; q.s.position.y += dt * q.up * (1 - k * 0.5); q.s.position.x -= dt * 0.3; q.s.scale.setScalar((0.15 + k * 0.6) * q.big); q.s.material.opacity = q.op * (1 - k); }
    for (const k of u.sparks) { if (!k.m.visible) continue; k.life -= dt; k.v[1] -= 10 * dt; k.m.position.x += k.v[0] * dt; k.m.position.y += k.v[1] * dt; k.m.position.z += k.v[2] * dt; k.m.lookAt(k.m.position.x + k.v[0], k.m.position.y + k.v[1], k.m.position.z + k.v[2]); if (k.life <= 0) k.m.visible = false; }
    u.bl = (u.bl || 0) - dt; if (u.bl < -3 - Math.random() * 2.5) u.bl = 0.14;
    { const ex = cel ? 'joy' : stun ? 'stun' : !hk ? (u.bl > 0 ? 'blink' : 'free') : m === 'tell' || m === 'atk' ? 'mad' : 'hack', fl = hk && flick;
      drawFace(u, { ex, col: fl || !hk || stun ? u.look.free : u.look.eye, dx: !hk && !stun ? Math.round(-(u.head.rotation.y || 0) * 30) : 0, glitch: hk && gOn ? 1 + (Math.random() * 3 | 0) : 0, fl, spin: stun ? Math.floor(t * 8) % 4 : 0, tough: true }); }
    // headlights: warm white, flicker on a glitch, red flash on the warning, dim when stunned
    for (const l of u.lights) { const c = stun ? '#3a2a10' : m === 'tell' && Math.sin(t * 30) > 0 ? '#ff3b2a' : gOn ? '#5fe3ff' : '#fff0c8'; l.lm.color.set(c); l.gl.material.color.set(c); l.gl.material.opacity = stun ? 0.05 : m === 'tell' || m === 'atk' ? 0.85 : 0.45; }
    // beacon: spins amber while hacked (faster on the charge), off when freed / stunned
    { const on = hk && !stun; u.beacon.bk.rotation.y += dt * (m === 'atk' ? 16 : m === 'tell' ? 12 : 7); u.beacon.beam.material.opacity = on ? 0.75 : 0; u.beacon.bm.color.set(on ? '#ffa31a' : '#5a3a10'); }
    // backfire: flame pops out of both stacks through the charge
    for (const f of u.flames) { const on = m === 'atk' && hk ? Math.random() < 0.7 : m === 'tell' && p > 0.85 ? Math.random() < 0.3 : false; const tgt = on ? 0.9 : 0; f.f.material.opacity = dmp(f.f.material.opacity, tgt, 30, dt); f.c.material.opacity = f.f.material.opacity; const sc = 0.7 + Math.random() * 0.6; f.f.scale.set(1, sc, 1); f.c.scale.set(1, sc, 1); }
    // tread marks: start where the charge begins, stretch behind him, fade after
    if (m === 'atk' && hk && u.markX == null) u.markX = 0; if (u.markX != null) { u.markX -= dgx; const x0 = Math.min(u.markX, 0) - 0.3, x1 = 0.3, L2 = Math.max(0.05, x1 - x0); for (const q of u.marks) { q.visible = true; q.scale.x = L2; q.position.x = x0 + L2 / 2; } u.markM.opacity = 0.55; if (m !== 'atk') { u.markHold = (u.markHold || 0) + dt; if (u.markHold > 0.1) { u.markFade = u.markX; u.markX = null; u.markHold = 0; u.markT = 2.5; } } }
    else if (u.markT > 0) { u.markT -= dt; for (const q of u.marks) q.position.x -= dgx; u.markM.opacity = 0.55 * Math.min(1, u.markT / 1.2); if (u.markT <= 0) for (const q of u.marks) q.visible = false; } }
  else if (type === 'survey') { const fight = hk && !stun; if (u.wasHk && !hk) u.cel = 1.3; u.wasHk = hk; u.cel = Math.max(0, (u.cel || 0) - dt); const cel = u.cel > 0;
    u.body.position.y = dmp(u.body.position.y, stun ? -0.45 : cel ? Math.sin((1 - u.cel / 1.3) * Math.PI) * 0.4 : fight && m === 'idle' ? Math.sin(t * 4.5) * 0.04 : 0, 10, dt);
    u.rot.forEach((r, i) => r.rotation.y += dt * (stun ? 3 : 45) * (i % 2 ? 1 : -1)); u.underGlow.material.opacity = stun ? 0.08 : 0.35 + Math.random() * 0.15; u.underGlow.material.color.set(hk && !stun ? '#7df9ff' : '#c8f6ff');
    u.base.rotation.z = dmp(u.base.rotation.z, m === 'atk' ? 0.15 : stun ? -0.2 : 0, 8, dt);
    if (!hk && !stun && !cel) { const lk = Math.sin(t * 0.45) > 0.55 ? 0.45 : Math.sin(t * 0.45) < -0.75 ? -0.3 : 0; u.head.rotation.y = dmp(u.head.rotation.y, lk, 2.5, dt); }
    u.head.rotation.z = dmp(u.head.rotation.z, m === 'tell' ? -0.12 : stun ? -0.3 : 0, 6, dt);
    // CRANE AIM (target in g space): hacked idle = sweep a full circle on the floor; TELL/ATK/REST = the target (s.aim, world) or straight ahead;
    // freed = lazy flashlight sweep in front; stunned = the arm droops, beam off; celebration = beam swings up
    const gy = g.position.y, floor = -gy + 0.05, V = u.v1, Q = u.v2; let tx, ty, tz, kk = 3;
    if (stun) { tx = 0.8; ty = floor; tz = 0.3; kk = 2; }
    else if (hk && (m === 'tell' || m === 'atk' || m === 'rest')) { if (s.aim) { V.set(s.aim[0], s.aim[1], s.aim[2]); g.worldToLocal(V); tx = V.x; ty = V.y; tz = V.z; } else { tx = 5; ty = floor + 1.1; tz = 0; } kk = m === 'tell' ? 9 : 6; }
    else if (cel) { const a = (1 - u.cel / 1.3) * 6.283; tx = Math.cos(a) * 2; ty = 3; tz = Math.sin(a) * 2; kk = 8; }
    else if (hk) { const a = t * 1.1; tx = Math.cos(a) * 3; ty = floor; tz = Math.sin(a) * 3; kk = 4; }
    else { const a = Math.sin(t * 0.4) * 1.0; tx = Math.cos(a) * 2.6; ty = floor; tz = Math.sin(a) * 2.6; kk = 2.5; }
    if (!u.aimL) u.aimL = { x: tx, y: ty, z: tz }; const AL = u.aimL; AL.x = dmp(AL.x, tx, kk, dt); AL.y = dmp(AL.y, ty, kk, dt); AL.z = dmp(AL.z, tz, kk, dt);
    V.set(AL.x, AL.y, AL.z); g.localToWorld(V); Q.copy(V); u.crane.worldToLocal(Q);
    { const want = Math.atan2(-Q.z, Q.x), cur = u.cY.rotation.y, d = ((want - cur + Math.PI) % 6.283 + 6.283) % 6.283 - Math.PI; u.cY.rotation.y = cur + d * (1 - Math.exp(-(stun ? 1 : 7) * dt)); }
    { const hd = Math.hypot(Q.x, Q.z), elv = Math.atan2(Q.y, hd), up = Math.max(0, elv), dn = Math.max(0, -elv);
      u.cS.rotation.z = dmp(u.cS.rotation.z, stun ? -1.25 : -0.3 - 0.35 * Math.min(1, hd / 5) + up * 0.25, 6, dt); u.cE.rotation.z = dmp(u.cE.rotation.z, stun ? -1.1 : -0.55 - dn * 0.5 + up * 0.6, 6, dt); }
    u.lamp.lookAt(V);
    u.muzzle.getWorldPosition(Q); const dist = Q.distanceTo(V), sz = u.size || 1;
    // SPOTLIGHT: warm sweep when hacked, red + tight on the warning, cyan-white flashlight when freed, off when stunned
    const bc = stun ? '#000000' : m === 'tell' || (hk && flick) ? '#ff4a3a' : hk ? '#fff4c8' : '#c8f6ff'; u.beamMat.color.set(bc); u.lensM.color.set(stun ? '#2a2a2a' : bc);
    u.beamMat.opacity = stun ? 0 : m === 'tell' ? 0.24 + 0.1 * Math.sin(t * 30) : m === 'atk' ? 0.05 : hk ? 0.14 : 0.11; const nw = m === 'tell' ? 0.35 : 1; u.beam.scale.set(nw, nw, Math.max(0.2, Math.min(2.5, dist / (4 * sz))));
    if (m === 'atk' && !u.shot) { u.shot = true; u.flash.material.opacity = 1; u.smokeT = 1.4; } if (m !== 'atk') u.shot = false; u.flash.material.opacity = Math.max(0, u.flash.material.opacity - dt * 5);
    u.pT = (u.pT || 0) - dt; if (u.smokeT > 0) { u.smokeT -= dt; if (u.pT <= 0) { u.pT = 0.09; const q = u.puffs.find(q => q.life <= 0); if (q) { u.muzzle.getWorldPosition(Q); g.worldToLocal(Q); q.s.position.copy(Q); q.life = q.max = 0.9; } } }
    for (const q of u.puffs) { if (q.life <= 0) { q.s.material.opacity = 0; continue; } q.life -= dt; const k = 1 - q.life / q.max; q.s.position.y += dt * 0.7; q.s.scale.setScalar(0.1 + k * 0.4); q.s.material.opacity = 0.4 * (1 - k); }
    u.shadow.position.y = -gy + 0.02; u.shadow.scale.setScalar(Math.max(0.5, 1.1 - gy * 0.12)); u.shadow.material.opacity = Math.max(0.12, 0.45 - gy * 0.07);
    u.bl = (u.bl || 0) - dt; if (u.bl < -3 - Math.random() * 2.5) u.bl = 0.14;
    { const ex = cel ? 'joy' : stun ? 'stun' : !hk ? (u.bl > 0 ? 'blink' : 'free') : m === 'tell' || m === 'atk' ? 'mad' : 'hack', fl = hk && flick;
      drawFace(u, { ex, col: fl || !hk || stun ? u.look.free : u.look.eye, dx: !hk && !stun ? Math.round(-(u.head.rotation.y || 0) * 30) : 0, glitch: hk && gOn ? 1 + (Math.random() * 3 | 0) : 0, fl, spin: stun ? Math.floor(t * 8) % 4 : 0, tough: true }); } }
  else if (type === 'hauler') { const fight = hk && !stun; if (u.wasHk && !hk) u.cel = 1.4; u.wasHk = hk; u.cel = Math.max(0, (u.cel || 0) - dt); const cel = u.cel > 0;
    const gx = g.position.x / (u.size || 1), dgx = gx - (u.lastX == null ? gx : u.lastX); u.lastX = gx; if (dgx) { for (const q of u.puffs) if (q.life > 0) q.s.position.x -= dgx; for (const k of u.sparks) if (k.m.visible) k.m.position.x -= dgx; }
    const rev = m === 'tell' ? 6 + 14 * p : 0; u.rl = (u.rl || 0) + (sp + rev) * dt / 0.3; for (const w of u.wheels) w.rotation.y = -u.rl;
    const ck = cel ? 1 - u.cel / 1.4 : 0, hop = cel ? Math.sin(ck * Math.PI) * 0.35 : 0; u.body.position.y = hop;
    const bounce = fight && m === 'idle' ? Math.abs(Math.sin(t * 4)) * 0.05 : !hk && !stun ? Math.sin(t * 1.6) * 0.012 : m === 'tell' ? Math.sin(t * 40) * 0.012 : 0;
    u.up.position.y = dmp(u.up.position.y, bounce - (stun ? 0.1 : m === 'rest' ? 0.05 : 0), 14, dt);
    const tilt = stun ? -0.12 : cel ? 0.5 * Math.sin(ck * Math.PI) : m === 'tell' ? -0.05 : m === 'atk' ? -0.1 : m === 'rest' ? -0.13 : fight ? 0.17 + Math.sin(t * 4) * 0.025 : 0;
    u.cab.rotation.z = dmp(u.cab.rotation.z, tilt, m === 'atk' ? 20 : 7, dt); u.cab.rotation.x = dmp(u.cab.rotation.x, stun ? 0.1 : 0, 5, dt);
    u.shield.rotation.z = dmp(u.shield.rotation.z, m === 'tell' || m === 'atk' ? 0 : m === 'rest' ? 0.55 : stun ? 0.15 : 1.25, m === 'tell' ? 10 : 6, dt);
    // ARMS: folded flat when freed (a truck), unfold into a guard when hacked
    const wave = !hk && !stun && !cel && Math.sin(t * 0.37) > 0.93;
    for (const a of u.arms) { const s2 = a.userData.s, R = s2 > 0; let sh, el, sx = s2 * 0.14;
      if (stun) { sh = 0.1; el = 0.1; sx = s2 * 0.2; }
      else if (cel) { sh = 2.9; el = 0.2 + Math.sin(t * 14) * 0.15; sx = s2 * 0.25; }
      else if (!hk) { if (R && wave) { sh = 2.6; el = 0.6 + Math.sin(t * 9) * 0.35; sx = 0.2; } else { sh = -1.45; el = 2.95; sx = -s2 * 0.02; } }
      else if (m === 'tell') { sh = 1.25; el = 0.35; }
      else if (m === 'atk') { sh = 1.5; el = 0.15; }
      else if (m === 'rest') { sh = 0.3 + Math.sin(t * 6) * 0.04; el = 0.4; }
      else { const pump = Math.sin(t * 4) * (R ? 1 : -1); sh = 0.85 + pump * 0.08; el = 1.75 - pump * 0.1; }
      a.rotation.z = dmp(a.rotation.z, sh, m === 'atk' ? 25 : 7, dt); a.userData.el.rotation.z = dmp(a.userData.el.rotation.z, el, m === 'atk' ? 25 : 7, dt); a.rotation.x = dmp(a.rotation.x, sx, 7, dt); }
    // BROWS (sun visors): angry slant when hacked, level when freed, droop when stunned
    { const br = hk && !stun ? (m === 'tell' || m === 'atk' ? 0.42 : 0.28) : stun ? -0.3 : cel ? -0.2 : -0.08; for (const b of u.brows) { b.rotation.x = dmp(b.rotation.x, -b.userData.s * br, 10, dt); b.position.y = dmp(b.position.y, hk && !stun ? 0.9 : 0.94, 10, dt); } }
    // LIGHTS
    for (const l of u.lights) { const c = stun ? '#3a2a10' : m === 'tell' && Math.sin(t * 30) > 0 ? '#ff3b2a' : gOn ? '#5fe3ff' : '#fff0c8'; l.lm.color.set(c); l.gl.material.color.set(c); l.gl.material.opacity = stun ? 0.05 : m === 'tell' || m === 'atk' ? 0.85 : 0.4; }
    { const haz = (m === 'rest' || stun) && Math.sin(t * 9) > 0; u.bar.forEach((b, i) => { const on = haz || (hk && !stun && m !== 'rest' && Math.sin(t * 10 + i * 2.1) > 0.3); b.m.color.set(on ? '#ffa31a' : '#5a3a10'); b.gl.material.opacity = on ? 0.8 : 0; }); }
    for (const c of u.crys) c.material.opacity = 0.35 + 0.25 * Math.sin(t * 3);
    u.ore.forEach((o, i) => { o.position.y = o.userData.y + (fight && m === 'idle' ? Math.abs(Math.sin(t * 4 + i)) * 0.02 : 0) + (cel ? Math.max(0, Math.sin(ck * Math.PI * 2 + i)) * 0.12 : 0) + (m === 'atk' ? Math.random() * 0.03 : 0); });
    for (const f of u.flames) { const on = hk && (m === 'atk' ? Math.random() < 0.75 : m === 'tell' && p > 0.6 ? Math.random() < 0.35 : false); f.material.opacity = dmp(f.material.opacity, on ? 0.9 : 0, 30, dt); f.scale.set(1, 0.7 + Math.random() * 0.6, 1); }
    // FX
    const V = u.plowTip.position.constructor, wp = o => { const w = o.getWorldPosition(new V()); g.worldToLocal(w); return w; };
    const puff = (o, col, op, up2, big) => { const q = u.puffs.find(q => q.life <= 0); if (!q) return; q.s.position.copy(wp(o)); q.life = q.max = 0.8 + Math.random() * 0.5; q.op = op; q.up = up2; q.big = big; q.s.material.color.set(col); };
    const spark = () => { const k = u.sparks.find(k => !k.m.visible); if (!k) return; k.m.position.copy(wp(u.plowTip)); k.v = [1.5 + Math.random() * 2.5, 1 + Math.random() * 3, (Math.random() - 0.5) * 6]; k.life = 0.25 + Math.random() * 0.2; k.m.visible = true; };
    u.fxT = (u.fxT || 0) - dt; if (u.fxT <= 0) { u.fxT = 0.06;
      if (m === 'atk' || (m === 'tell' && p > 0.25)) for (const r of u.rear) if (Math.random() < 0.8) puff(r, '#c8b89a', 0.6, 0.3, 1.4);
      if (m === 'atk' && hk) { spark(); spark(); }
      if (m === 'rest' && Math.random() < 0.7) puff(u.hoodPt, '#e8eef2', 0.5, 1.2, 0.9);
      u.sT = (u.sT || 0) - 0.06; const rate = stun ? 0 : hk ? (m === 'tell' ? 0.07 : 0.2) : 0.6; if (rate && u.sT <= 0) { u.sT = rate; for (const st of u.stacks) puff(st, hk ? '#2a2d33' : '#c8ccd2', hk ? 0.55 : 0.28, 1.0, hk ? 1 : 0.7); } }
    for (const q of u.puffs) { if (q.life <= 0) { q.s.material.opacity = 0; continue; } q.life -= dt; const k = 1 - q.life / q.max; q.s.position.y += dt * q.up * (1 - k * 0.5); q.s.position.x -= dt * 0.3; q.s.scale.setScalar((0.15 + k * 0.6) * q.big); q.s.material.opacity = q.op * (1 - k); }
    for (const k of u.sparks) { if (!k.m.visible) continue; k.life -= dt; k.v[1] -= 10 * dt; k.m.position.x += k.v[0] * dt; k.m.position.y += k.v[1] * dt; k.m.position.z += k.v[2] * dt; k.m.lookAt(k.m.position.x + k.v[0], k.m.position.y + k.v[1], k.m.position.z + k.v[2]); if (k.life <= 0) k.m.visible = false; }
    u.shadow.position.y = -hop + 0.02;
    u.bl = (u.bl || 0) - dt; if (u.bl < -3 - Math.random() * 2.5) u.bl = 0.14;
    { const ex = cel ? 'joy' : stun ? 'stun' : !hk ? (u.bl > 0 ? 'blink' : 'free') : m === 'tell' || m === 'atk' ? 'mad' : 'hack', fl = hk && flick;
      drawFace(u, { ex, col: fl || !hk || stun ? u.look.free : u.look.eye, dx: 0, glitch: hk && gOn ? 1 + (Math.random() * 3 | 0) : 0, fl, spin: stun ? Math.floor(t * 8) % 4 : 0, tough: true }); } }
  else if (type === 'relay') { u.dishes.forEach((d, i) => d.rotation.y += dt * (stun ? 0.1 : 0.6 + i * 0.3)); u.beacon.scale.setScalar(m === 'tell' ? 1 + 0.5 * p : 1 + 0.1 * Math.sin(t * 5)); }
  else if (type === 'rig') { const fight = hk && !stun; if (u.wasHk && !hk) u.cel = 1.6; u.wasHk = hk; u.cel = Math.max(0, (u.cel || 0) - dt); const cel = u.cel > 0, ck = cel ? 1 - u.cel / 1.6 : 0;
    const br = Math.sin(t * 1.6), tug = m === 'rest' && hk ? Math.max(0, Math.sin(t * 18)) * 0.06 : 0, ka = sm(Math.min(1, p * 3));
    // squat stance: feet planted, knees bend by crouch; crouches into the wind-up, drops on the headbutt
    const crouch = stun ? 0.5 : m === 'rest' ? 0.34 : m === 'atk' ? 0.22 + 0.12 * ka : m === 'tell' ? 0.24 * sm(p) : fight ? 0.12 + br * 0.025 : cel ? 0.16 * Math.sin(ck * Math.PI * 2) : 0.02;
    u.cr = dmp(u.cr || 0, Math.max(0, crouch), m === 'atk' ? 18 : 6, dt); const LL = 1.16, la = Math.acos(Math.max(0.2, (LL - u.cr) / LL)); u.up.position.y = -u.cr;
    for (const l of u.legs) { l.hip.rotation.z = la; l.kn.rotation.z = -2 * la; l.ft.rotation.z = la; l.hip.rotation.x = dmp(l.hip.rotation.x, -l.s * (fight || m !== 'idle' ? 0.12 : 0.05), 6, dt); }
    // LUNGE: rocks back on the wind-up, drives forward on the headbutt, stays in while the drill is stuck
    const lx = m === 'atk' ? -0.25 + 1.65 * ka : m === 'rest' ? 1.4 : m === 'tell' ? -0.25 * sm(p) : 0; u.lx = m === 'atk' ? lx : dmp(u.lx || 0, lx, m === 'rest' ? 8 : 2.2, dt); u.up.position.x = u.lx;
    const lean = stun ? -0.35 : m === 'tell' ? 0.34 * sm(p) : m === 'atk' ? 0.34 - 1.14 * ka : m === 'rest' ? -0.8 + tug * 0.4 : fight ? -0.12 + br * 0.02 : cel ? 0.25 * Math.sin(ck * Math.PI) : 0.02;
    u.torso.rotation.z = m === 'atk' ? lean : dmp(u.torso.rotation.z, lean, 7, dt); u.torso.rotation.y = dmp(u.torso.rotation.y, fight && m === 'idle' ? -0.15 : 0, 4, dt);
    if (!hk && !stun && !cel) { const lk = Math.sin(t * 0.45) > 0.55 ? 0.4 : Math.sin(t * 0.45) < -0.75 ? -0.3 : 0; u.head.rotation.y = dmp(u.head.rotation.y, lk, 2, dt); }
    const hz = stun ? -0.3 : m === 'tell' ? 0.36 * sm(p) : m === 'atk' ? 0.36 - 0.72 * ka : m === 'rest' ? -0.3 : fight ? Math.sin(t * 2.2) * 0.05 : cel ? 0.3 : 0;
    u.head.rotation.z = m === 'atk' ? hz : dmp(u.head.rotation.z, hz, 7, dt);
    for (const a of u.arms) { const s2 = a.userData.s, R = s2 > 0; let sh, el, sx;
      if (stun) { sh = 0.15; el = 0.1; sx = 0.1; }
      else if (cel) { sh = R ? 3.0 : 0.25; el = R ? 0.15 + Math.sin(t * 12) * 0.1 : 0.3; sx = 0.15; }
      else if (!hk) { sh = 0.1 + Math.sin(t * 1.1 + s2) * 0.05; el = 0.25; sx = 0.12; }
      else if (m === 'tell') { sh = -0.55 * sm(p); el = 0.55; sx = 0.35; }
      else if (m === 'atk') { sh = -0.55 - 0.45 * ka; el = 0.3; sx = 0.25; }
      else if (m === 'rest') { sh = 1.05 + tug; el = 0.15; sx = 0.22; }
      else { const pump = Math.sin(t * 2.2) * (R ? 1 : -1); sh = 0.7 + pump * 0.06; el = 1.35 - pump * 0.08; sx = 0.2; }
      a.rotation.z = m === 'atk' ? sh : dmp(a.rotation.z, sh, 6, dt); a.userData.el.rotation.z = m === 'atk' ? el : dmp(a.userData.el.rotation.z, el, 6, dt); a.rotation.x = dmp(a.rotation.x, -s2 * sx, 6, dt); }
    // DRILL: idles slow, screams up on the wind-up, full speed on the headbutt, grinds stuck in the floor on the rest
    { const want = stun ? 0 : m === 'rest' ? 6 : m === 'atk' ? 55 : m === 'tell' ? 10 + 45 * p : cel ? 30 : hk ? 5 : 1.5; u.bv = dmp(u.bv || 0, want, stun ? 1.5 : 4, dt); u.bit.rotation.y += u.bv * dt;
      u.bit.position.x = m === 'rest' || m === 'tell' ? (Math.random() - 0.5) * 0.025 : 0;
      u.heat = Math.max(0, Math.min(1, (u.heat || 0) + dt * (m === 'atk' || m === 'rest' ? 1.6 : m === 'tell' ? 0.4 : -0.35))); u.heatGlow.material.opacity = u.heat * 0.6 * (0.85 + Math.random() * 0.15); }
    { const fl = hk && !stun && (m === 'tell' || m === 'atk') && Math.sin(t * 22) > 0; for (const w of u.warn) { w.wm.color.set(fl ? '#ffa31a' : '#5a3a10'); w.gl.material.opacity = fl ? 0.85 : 0; } }
    // CORE: armour doors open while the drill is stuck (the weak point) + a little when freed
    { const open = m === 'rest' || cel ? 1.35 : !hk && !stun ? 0.3 : 0; for (const d of u.doors) d.rotation.y = dmp(d.rotation.y, -d.userData.s * open, 8, dt);
      u.coreGlow.scale.setScalar(m === 'rest' ? 2.2 + Math.sin(t * 12) * 0.3 : cel ? 2.5 : 1.3); u.coreGlow.material.opacity = m === 'rest' || cel ? 0.95 : stun ? 0.15 : 0.55; }
    { const trail = m === 'atk' ? -0.55 : m === 'tell' ? -0.12 : stun ? 0.1 : 0, amp = m === 'atk' ? 0.18 : fight ? 0.08 : 0.05, spd = fight ? 2.4 : 1.4;
      for (const c of u.cape) { const { segs, j } = c.userData; segs.forEach((sg, i) => { const tgt = (i === 0 ? -u.torso.rotation.z * 0.85 + trail : trail * 0.25) + Math.sin(t * spd - i * 0.7 + j * 1.3) * amp; sg.rotation.z = dmp(sg.rotation.z, tgt, 8, dt); }); } }
    // IMPACT FX at the drill tip: once on the headbutt, then sparks + grit while it grinds in the floor
    const V = u.bitTip.position.constructor, wp = o => { const w = o.getWorldPosition(new V()); g.worldToLocal(w); return w; };
    const spark = (tp, sp2) => { const k = u.sparks.find(k => !k.m.visible); if (!k) return; const a = Math.random() * 6.283, v = sp2 * (0.6 + Math.random() * 0.6); k.m.position.set(tp.x, Math.max(0.12, tp.y), tp.z); k.v = [Math.cos(a) * v * 0.6 - 1, 2 + Math.random() * 3, Math.sin(a) * v]; k.life = 0.3 + Math.random() * 0.2; k.m.visible = true; };
    if (m !== 'atk') u.slammed = false; else if (!u.slammed && p >= 0.33) { u.slammed = true; const tp = wp(u.bitTip);
      u.crack.position.set(tp.x, 0.025, tp.z); u.crack.rotation.z = Math.random() * 6.283; u.crack.material.opacity = 1; u.crackT = 3; u.dust.position.set(tp.x, 0.06, tp.z); u.dustT = 0;
      u.chips.forEach(c => { const a = Math.random() * 6.283, v = 2 + Math.random() * 3; c.m.position.set(tp.x, 0.2, tp.z); c.v = [Math.cos(a) * v, 3 + Math.random() * 3.5, Math.sin(a) * v]; c.life = 1 + Math.random() * 0.5; c.m.visible = true; });
      for (let i = 0; i < 12; i++) spark(tp, 6); }
    if (m === 'rest' && hk && Math.random() < dt * 14) spark(wp(u.bitTip), 4);
    if (u.crackT > 0) { u.crackT -= dt; u.crack.material.opacity = Math.min(1, u.crackT / 0.9); }
    if (u.dustT != null && u.dustT < 0.9) { u.dustT += dt; const k = u.dustT / 0.9; u.dust.scale.setScalar(0.5 + k * 3); u.dust.material.opacity = 0.6 * (1 - k); }
    for (const c of u.chips) { if (!c.m.visible) continue; c.life -= dt; c.v[1] -= 14 * dt; c.m.position.x += c.v[0] * dt; c.m.position.y = Math.max(0.05, c.m.position.y + c.v[1] * dt); c.m.position.z += c.v[2] * dt; if (c.m.position.y <= 0.05) { c.v[0] *= 0.7; c.v[2] *= 0.7; c.v[1] = Math.abs(c.v[1]) * 0.3; } c.m.rotation.x += dt * 8; if (c.life <= 0) c.m.visible = false; }
    for (const k of u.sparks) { if (!k.m.visible) continue; k.life -= dt; k.v[1] -= 10 * dt; k.m.position.x += k.v[0] * dt; k.m.position.y += k.v[1] * dt; k.m.position.z += k.v[2] * dt; k.m.lookAt(k.m.position.x + k.v[0], k.m.position.y + k.v[1], k.m.position.z + k.v[2]); if (k.life <= 0) k.m.visible = false; }
    u.pT = (u.pT || 0) - dt; if (u.pT <= 0) { const rate = stun ? 0 : m === 'rest' ? 0.06 : hk ? 0.25 : 0.7; if (rate) { u.pT = rate; const src = m === 'rest' ? [...u.vents, u.corePt, u.bitTip] : u.vents;
      for (const o of src) { const q = u.puffs.find(q => q.life <= 0); if (!q) break; q.s.position.copy(wp(o)); q.life = q.max = 1.0 + Math.random() * 0.5; q.big = m === 'rest' ? 1.5 : 1; q.op = m === 'rest' ? 0.55 : hk ? 0.5 : 0.25; q.s.material.color.set(o === u.bitTip ? '#c8b89a' : m === 'rest' || !hk ? '#e8eef2' : '#2a2d33'); } } else u.pT = 0.2; }
    for (const q of u.puffs) { if (q.life <= 0) { q.s.material.opacity = 0; continue; } q.life -= dt; const k = 1 - q.life / q.max; q.s.position.y += dt * 1.0 * (1 - k * 0.5); q.s.position.x -= dt * 0.3; q.s.scale.setScalar((0.25 + k * 0.9) * q.big); q.s.material.opacity = q.op * (1 - k); }
    u.bl = (u.bl || 0) - dt; if (u.bl < -3 - Math.random() * 2.5) u.bl = 0.14;
    { const ex = cel ? 'joy' : stun ? 'stun' : !hk ? (u.bl > 0 ? 'blink' : 'free') : m === 'tell' || m === 'atk' ? 'mad' : 'hack', fl = hk && flick;
      drawFace(u, { ex, col: fl || !hk || stun ? u.look.free : u.look.eye, dx: !hk && !stun ? Math.round(-(u.head.rotation.y || 0) * 30) : 0, glitch: hk && gOn ? 1 + (Math.random() * 3 | 0) : 0, fl, spin: stun ? Math.floor(t * 8) % 4 : 0, tough: true }); } } }
