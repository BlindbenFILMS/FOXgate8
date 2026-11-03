// PEARL SAIL BOTS (s35x): the five Pearl Sail bot models + their fight tuning, shared by the 3D floor (worlds/pearl-floor3d.js)
// and Pearl Sail Bot Workshop.dc.html. The workshop writes localStorage 'pearl.bots' = { look: {type: {...}}, stats: {type: {...}} }.
export const BOT_TYPES = ['crawler', 'drone', 'turret', 'guard', 'gate'];
// s35y: two builds each (Ben): crawler = GLOVES | CANNON, guard = SWORD | PISTOL. The share sliders pick how many of each.
export const VARIANTS = { crawler: [['gloves', 'BOXING GLOVES'], ['cannon', 'TANK CANNON']], guard: [['sword', 'SWORD'], ['pistol', 'PISTOL']] };
// which stats only matter for one build (the workshop hides the rest)
export const STAT_FOR = { crawler: { cannonRange: 'cannon', shell: 'cannon', cannonHit: 'cannon', chase: 'gloves', lunge: 'gloves', lungeHit: 'gloves' }, guard: { gunRange: 'pistol', gunHit: 'pistol', bolt: 'pistol', bash: 'sword', hit: 'sword', stagger: 'sword' } };
export const BOT_INFO = {
  crawler: { name: 'CRAWLER', role: 'Tank treads. GLOVES: leans back, then charges + PUNCHES. CANNON: aim line, then a shell.' },
  drone: { name: 'DRONE', role: 'Hovers. Shows a red AIM LINE, then SWOOPS at you.' },
  turret: { name: 'FLOOR TURRET', role: 'Stands on the floor and turns to follow you. LASER SIGHT, then a red bolt from twin barrels.' },
  guard: { name: 'SHIELDED GUARD', role: 'Pulsing shield blocks the front. SWORD: winds up + slashes, then is OPEN. PISTOL: aims, shoots from range.' },
  gate: { name: 'GATE SPAWNER', role: 'Spawns crawlers + drones. Destroy every gate to open the stairs.' },
};
export const LOOK0 = {
  crawler: { body: '#8a909b', dark: '#3b4049', accent: '#cdd2da', glove: '#ec3013', gold: '#e8b42a', eye: '#ff2a1a', size: 1 },
  drone: { body: '#8a909b', dark: '#3b4049', accent: '#cdd2da', eye: '#ff2a1a', size: 1 },
  turret: { body: '#8a909b', dark: '#3b4049', accent: '#ec3013', eye: '#ff2a1a', size: 1 },
  guard: { body: '#8a909b', dark: '#3b4049', accent: '#ec3013', eye: '#ff2a1a', shield: '#7df9ff', blade: '#7df9ff', band: '#ec3013', gold: '#e8b42a', size: 1 },
  gate: { body: '#2a2d33', dark: '#2a2d33', accent: '#ec3013', trim: '#e8b84a', eye: '#ff3b2a', size: 1 },
};
export const LOOK_UI = { body: 'BODY', dark: 'DARK PARTS', accent: 'ACCENT', eye: 'EYE + GLOW', shield: 'SHIELD', trim: 'LINTEL', glove: 'BOXING GLOVES', blade: 'SWORD BLADE', band: 'SASH', gold: 'GOLD TRIM' };
export const STATS0 = {
  crawler: { hp: 40, walk: 1.6, chase: 3, sight: 7, tell: 0.4, lunge: 10, hit: 10, lungeHit: 14, rest: 1.6, cannonShare: 0.35, cannonRange: 9, shell: 9, cannonHit: 14 },
  drone: { hp: 25, hover: 2.6, sight: 9, tell: 0.6, swoop: 11, hit: 12, rest: 1.8 },
  turret: { hp: 50, range: 16, tell: 0.6, bolt: 11, hit: 10, rest: 2.2 },
  guard: { hp: 70, walk: 1.4, chase: 2.2, sight: 7, tell: 0.45, bash: 7, hit: 15, touch: 8, stagger: 1.0, pistolShare: 0.5, gunRange: 8, bolt: 12, gunHit: 8 },
  gate: { hp: 160, every: 4, max: 3, range: 24 },
};
// [label, min, max, step, unit]
export const STAT_UI = {
  hp: ['HP', 5, 400, 5, ''], walk: ['PATROL SPEED', 0.5, 4, 0.1, 'M/S'], chase: ['CHASE SPEED', 0.5, 6, 0.1, 'M/S'], sight: ['SIGHT', 3, 16, 0.5, 'M'],
  tell: ['WARNING TIME', 0.15, 1.5, 0.05, 'S'], lunge: ['LUNGE SPEED', 4, 18, 0.5, 'M/S'], hit: ['HIT DAMAGE', 1, 40, 1, ''], lungeHit: ['LUNGE DAMAGE', 1, 40, 1, ''],
  rest: ['REST AFTER ATTACK', 0.4, 4, 0.1, 'S'], hover: ['HOVER HEIGHT', 1.2, 3, 0.1, 'M'], swoop: ['SWOOP SPEED', 4, 20, 0.5, 'M/S'], range: ['RANGE', 6, 30, 0.5, 'M'],
  bolt: ['BOLT SPEED', 5, 24, 0.5, 'M/S'], bash: ['BASH SPEED', 3, 14, 0.5, 'M/S'], touch: ['TOUCH DAMAGE', 0, 30, 1, ''], stagger: ['OPEN TIME', 0.3, 2.5, 0.1, 'S'],
  every: ['SPAWN EVERY', 2, 15, 0.5, 'S'], max: ['MAX SPAWNS', 1, 5, 1, ''], size: ['SIZE', 0.7, 1.5, 0.05, '×'],
  cannonShare: ['CANNON SHARE', 0, 1, 0.05, ''], cannonRange: ['CANNON RANGE', 4, 16, 0.5, 'M'], shell: ['SHELL SPEED', 4, 20, 0.5, 'M/S'], cannonHit: ['SHELL DAMAGE', 1, 40, 1, ''],
  pistolShare: ['PISTOL SHARE', 0, 1, 0.05, ''], gunRange: ['PISTOL RANGE', 3, 14, 0.5, 'M'], gunHit: ['PISTOL DAMAGE', 1, 30, 1, ''],
};
const KEY = 'pearl.bots';
export function loadBots() { let raw = {}; try { raw = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
  if ((raw.v || 1) < 4 && raw.look) for (const t of ['crawler', 'drone', 'turret', 'guard']) { const l = raw.look[t]; if (!l) continue; for (const [k2, old] of [['body', '#4a4e55'], ['dark', '#1f2226'], ['accent', '#9aa0a6']]) if (l[k2] && l[k2].toLowerCase() === old) delete l[k2]; }   /* s297 (Ben): robots SILVER-GREY (a grey not used on the maps) so they stand out */
  if ((raw.v || 1) < 3 && raw.stats && raw.stats.gate) { const g = raw.stats.gate; if (g.every === 6) delete g.every; if (g.max === 2) delete g.max; if (g.range === 22) delete g.range; }   // s35z6: new spawn defaults win over the old untouched ones
  if ((raw.v || 1) < 2 && raw.look) for (const t of ['crawler', 'drone', 'turret', 'guard']) { const l = raw.look[t]; if (!l) continue; if (l.body === '#f3f2f2' || (t === 'turret' && l.body === '#9aa0a6')) delete l.body; if (l.dark === '#2a2d33') delete l.dark; }
  const look = {}, stats = {}; for (const t of BOT_TYPES) { look[t] = { ...LOOK0[t], ...((raw.look || {})[t] || {}) }; stats[t] = { ...STATS0[t], ...((raw.stats || {})[t] || {}) }; } return { look, stats }; }
export function saveBots(b) { try { localStorage.setItem(KEY, JSON.stringify({ ...b, v: 4 })); } catch (e) {} }

// eye materials (the floor flickers every one of them each frame)
export const eyeMats = [];
// s35z (Ben): every eye pulses DEEP RED → RED on a loop
const DEEP = { r: 0.16, g: 0, b: 0 }; export function pulseEyes(THREE, t) { const k = 0.5 + 0.5 * Math.sin(t * 6); for (const m of eyeMats) { const b = m.userData.base; m.color.setRGB(DEEP.r + (b.r - DEEP.r) * k, DEEP.g + (b.g - DEEP.g) * k, DEEP.b + (b.b - DEEP.b) * k); } } const eyeCache = new Map(), shCache = new Map(); let portalC = null;
function eyeMat(THREE, col) { if (!eyeCache.has(col)) { const m = new THREE.MeshBasicMaterial({ color: col }); m.userData.base = new THREE.Color(col); eyeCache.set(col, m); eyeMats.push(m); } return eyeCache.get(col); }
function portalTex(THREE) { if (portalC) return portalC; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), cc = 64;
  for (let r = cc; r > 0; r -= 2) { const k = r / cc, v = Math.round(150 + 105 * (1 - k)); g.fillStyle = `rgba(${v},${v},${v},${0.15 + 0.6 * (1 - k)})`; g.beginPath(); g.arc(cc, cc, r, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 3; for (let a = 0; a < 3; a++) { g.beginPath(); for (let t = 0; t < 1; t += 0.02) { const ang = a * 2.094 + t * 6, r2 = t * cc * 0.95; g.lineTo(cc + Math.cos(ang) * r2, cc + Math.sin(ang) * r2); } g.stroke(); }
  portalC = new THREE.CanvasTexture(c); portalC.colorSpace = THREE.SRGBColorSpace; return portalC; }

// ctx = { THREE, M(geo, mat, x, y, z, parent, outline, radius), toon(hex), glowTex, outlineMat }. Front of every bot = +x. Returns a Group (not added to a scene).
export function buildBot(ctx, type, L, v = '') { const { THREE, M, toon, glowTex, outlineMat } = ctx; const g = new THREE.Group(), u = g.userData, p = new THREE.Group(); p.scale.setScalar(L.size || 1); g.add(p); u.inner = p;
  const Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d), Sp = (r, a = 12, b = 8) => new THREE.SphereGeometry(r, a, b);
  const B = toon(L.body), D = toon(L.dark), A = toon(L.accent), E = eyeMat(THREE, L.eye);
  const cylX = (r, len, n = 12, r2 = r) => { const q = new THREE.CylinderGeometry(r2, r, len, n); q.rotateZ(-Math.PI / 2); q.translate(len / 2, 0, 0); return q; }, cylZ = (r, len, n = 12) => { const q = new THREE.CylinderGeometry(r, r, len, n); q.rotateX(Math.PI / 2); return q; }, Cap = (r, len, n = 10) => new THREE.CapsuleGeometry(r, len, 4, n);
  const WHT = toon('#f3f2f2');
  // s35z: BOX HEADS with ANGRY eyes (slanted bars, inner ends low) under a slanted brow + a mouth grille. fx = face plane x
  const angry = (par, fx, y, gap, w, h, mouth) => { for (const sg of [-1, 1]) { const z = sg * gap; M(Bx(0.035, h, w), E, fx + 0.012, y, z, par, 0).rotation.x = -sg * 0.45; M(Bx(0.05, h * 0.7, w * 1.15), D, fx + 0.02, y + h * 1.1, z + sg * 0.01, par, 0).rotation.x = -sg * 0.55; }
    if (mouth) for (let i = -1; i <= 1; i++) M(Bx(0.03, 0.025, gap * 1.6), D, fx + 0.012, mouth + i * 0.045, 0, par, 0); };
  if (type === 'crawler') { // s368e (Ben: "look like a street fighter character"): a tread-driven BOXER. Tank treads below, a champion belt, a hunched
    // V-taper torso, big delts, a padded HEADGEAR + mouthguard, real arms with wrist wraps and BOXING GLOVES on the piston forearms (GLOVES build), or
    // armoured fists + a SHOULDER CANNON (CANNON build). Same hooks as before (wheels · bars · hull · arms {sh, piston, ext} · barrel · muzzle · flash).
    const cannon = v === 'cannon', G2 = toon(L.glove || '#ec3013'), GD = toon(L.gold || '#e8b42a'); u.wheels = []; u.bars = []; u.arms = [];
    for (const z of [-0.42, 0.42]) { const sg = Math.sign(z); M(Bx(1.1, 0.34, 0.26), D, 0, 0.22, z, p, 0.03); for (const x of [-0.55, 0.55]) M(cylZ(0.17, 0.26, 14), D, x, 0.22, z, p, 0.03, 0.17);
      for (const x of [-0.4, 0, 0.4]) { const w = M(cylZ(0.11, 0.05, 10), A, x, 0.22, z + sg * 0.14, p, 0); M(Bx(0.18, 0.035, 0.02), D, 0, 0, sg * 0.03, w, 0); M(Bx(0.035, 0.18, 0.02), D, 0, 0, sg * 0.03, w, 0); u.wheels.push(w); }
      for (let i = 0; i < 6; i++) u.bars.push(M(Bx(0.05, 0.03, 0.28), A, 0, 0.4, z, p, 0)); }
    for (const z of [-0.56, 0.56]) { M(Bx(1.0, 0.16, 0.04), B, 0, 0.3, z, p, 0.015); for (const x of [-0.36, 0, 0.36]) M(Sp(0.025, 6, 4), GD, x, 0.3, z + Math.sign(z) * 0.025, p, 0); }   // s368g polish: armoured tread skirts with gold bolts
    M(Bx(0.12, 0.2, 0.7), A, 0.6, 0.26, 0, p, 0.02).rotation.z = -0.35; for (const z of [-0.2, 0, 0.2]) M(Bx(0.05, 0.18, 0.06), D, 0.64, 0.26, z, p, 0).rotation.z = -0.35;
    u.pipes = []; for (const z of [-0.18, 0.18]) { M(new THREE.CylinderGeometry(0.05, 0.06, 0.36, 8), D, -0.42, 0.62, z, p, 0.015); const sm2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x9aa0a8, transparent: true, opacity: 0, depthWrite: false })); sm2.position.set(-0.42, 0.85, z); p.add(sm2); u.pipes.push(sm2); }
    const hull = new THREE.Group(); hull.position.y = 0.62; p.add(hull); u.hull = hull;
    M(Bx(0.62, 0.24, 0.66), D, 0, -0.06, 0, hull, 0.03); M(Bx(0.66, 0.12, 0.7), G2, 0, 0.08, 0, hull, 0.02); M(Bx(0.06, 0.18, 0.26), GD, 0.33, 0.08, 0, hull, 0.015); for (const z of [-0.24, 0.24]) M(Bx(0.04, 0.08, 0.08), GD, 0.33, 0.08, z, hull, 0.01); M(Sp(0.06, 8, 6), E, 0.36, 0.08, 0, hull, 0);
    const tor = new THREE.Group(); tor.position.y = 0.1; tor.rotation.z = -0.14; hull.add(tor); u.tor = tor;
    M(Cap(0.22, 0.12, 12), B, 0, 0.16, 0, tor, 0.02).scale.set(0.85, 1, 1.05); for (const y of [0.1, 0.22]) for (const z of [-0.08, 0.08]) M(Bx(0.06, 0.09, 0.12), A, 0.19, y, z, tor, 0.01);
    const ch = M(new THREE.CylinderGeometry(0.52, 0.3, 0.5, 8), B, 0, 0.5, 0, tor, 0.03); ch.scale.set(0.7, 1, 1); ch.rotation.y = Math.PI / 8;
    for (const z of [-0.16, 0.16]) M(Bx(0.07, 0.2, 0.24), A, 0.3, 0.58, z, tor, 0.012).rotation.z = -0.15;
    M(new THREE.CylinderGeometry(0.17, 0.22, 0.16, 10), D, 0, 0.8, 0, tor, 0.015);
    for (const z of [-0.46, 0.46]) { M(Sp(0.21, 12, 8), B, 0, 0.66, z, tor, 0.02, 0.21).scale.set(1.05, 0.9, 0.95); M(new THREE.TorusGeometry(0.17, 0.025, 6, 16), GD, 0, 0.6, z, tor, 0).rotation.x = Math.PI / 2; }
    const hd = new THREE.Group(); hd.position.set(0.08, 1.02, 0); hd.scale.setScalar(1.3); tor.add(hd); u.head = hd;
    // s368j (Ben): helmet removed. A bare robot fighter's head: dark faceplate, armoured brow ridge, cheek vents, angry eyes, white mouthguard.
    M(Sp(0.18, 14, 10), B, 0, -0.01, 0, hd, 0.02, 0.18).scale.set(1, 1.05, 0.95);
    M(Bx(0.08, 0.22, 0.26), D, 0.13, -0.01, 0, hd, 0.015); M(Bx(0.1, 0.05, 0.3), A, 0.13, 0.1, 0, hd, 0.012).rotation.z = -0.2;
    for (const z of [-0.15, 0.15]) for (const y of [-0.04, 0.0]) M(Bx(0.06, 0.015, 0.03), D, 0.08, y, z, hd, 0);
    M(Bx(0.18, 0.04, 0.03), GD, -0.02, 0.17, 0, hd, 0.01);
    angry(hd, 0.17, 0.03, 0.055, 0.09, 0.045, 0); M(Bx(0.05, 0.06, 0.15), WHT, 0.17, -0.09, 0, hd, 0.012);
    if (cannon) { M(Bx(0.36, 0.2, 0.26), D, -0.06, 0.88, -0.34, tor, 0.02); const br = new THREE.Group(); br.position.set(0.18, 1.02, -0.34); tor.add(br); u.barrel = br;
      M(cylX(0.075, 0.75, 12), B, -0.1, 0, 0, br, 0.02); M(cylX(0.11, 0.16, 12), D, 0.6, 0, 0, br, 0.02); M(new THREE.TorusGeometry(0.085, 0.025, 5, 14), GD, 0.3, 0, 0, br, 0).rotation.y = Math.PI / 2;
      u.muzzle = new THREE.Object3D(); u.muzzle.position.x = 0.8; br.add(u.muzzle); u.flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb347, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); u.flash.position.x = 0.82; br.add(u.flash); }
    for (const z of [-0.46, 0.46]) { const sh = new THREE.Group(); sh.position.set(0.06, 0.58, z * 0.92); tor.add(sh); M(Cap(0.1, 0.14, 10).rotateZ(Math.PI / 2), D, 0.08, -0.02, 0, sh, 0.02);
      const piston = M(cylX(0.08, 1, 10, 0.065), B, 0, 0, 0, sh, 0); const ext = new THREE.Group(); ext.position.x = 0.3; sh.add(ext);
      if (!cannon) { M(cylX(0.1, 0.1, 12), WHT, -0.08, 0, 0, ext, 0.02); M(Sp(0.2, 14, 10), G2, 0.13, 0, 0, ext, 0.03, 0.2).scale.set(1.2, 1, 1); M(Sp(0.08, 8, 6), G2, 0.06, 0.13, -Math.sign(z) * 0.1, ext, 0.02, 0.08); M(Bx(0.04, 0.12, 0.3), WHT, 0.0, 0, 0, ext, 0); M(cylX(0.115, 0.035, 12), GD, -0.02, 0, 0, ext, 0); for (const xx of [0.02, 0.08, 0.14]) M(Bx(0.025, 0.02, 0.12), WHT, xx, 0.19, 0, ext, 0); }
      else { M(Sp(0.13, 10, 8), D, 0.06, 0, 0, ext, 0.02, 0.13); for (const yy of [-0.05, 0.05]) M(Bx(0.08, 0.035, 0.2), A, 0.17, yy, 0, ext, 0.01); M(cylX(0.09, 0.08, 10), GD, -0.06, 0, 0, ext, 0.01); }
      u.arms.push({ sh, piston, ext }); }
    u.cannon = cannon; }
  else if (type === 'drone') { M(Sp(0.42), B, 0, 0, 0, p, 0.03, 0.42); M(new THREE.TorusGeometry(0.46, 0.06, 6, 20), D, 0, 0, 0, p, 0).rotation.x = Math.PI / 2; M(Sp(0.13, 8, 6), E, 0.38, 0, 0, p, 0); u.rot = []; for (const sx of [-0.35, 0.35]) { M(Bx(0.06, 0.25, 0.06), D, sx, 0.45, 0, p, 0); u.rot.push(M(Bx(0.7, 0.03, 0.1), A, sx, 0.58, 0, p, 0)); } }
  else if (type === 'turret') { // s35z2 (Ben): a FLOOR turret — tripod + armoured base, a box head with angry eyes that turns to follow you, twin barrels
    for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.5; M(Bx(0.7, 0.08, 0.12), D, Math.cos(a) * 0.32, 0.1, -Math.sin(a) * 0.32, p, 0.02).rotation.y = a; M(Bx(0.18, 0.06, 0.18), A, Math.cos(a) * 0.64, 0.03, -Math.sin(a) * 0.64, p, 0.015).rotation.y = a; }
    M(new THREE.CylinderGeometry(0.4, 0.5, 0.32, 8), D, 0, 0.26, 0, p, 0.03); M(new THREE.TorusGeometry(0.44, 0.04, 5, 8), A, 0, 0.42, 0, p, 0).rotation.x = Math.PI / 2;
    M(new THREE.CylinderGeometry(0.15, 0.17, 0.5, 10), B, 0, 0.66, 0, p, 0.02); M(new THREE.CylinderGeometry(0.27, 0.27, 0.1, 10), A, 0, 0.9, 0, p, 0.02);
    const piv = new THREE.Group(); piv.position.y = 1.15; p.add(piv); u.piv = piv;
    M(Bx(0.62, 0.46, 0.58), B, 0, 0, 0, piv, 0.03); angry(piv, 0.31, 0.06, 0.1, 0.14, 0.06, -0.13); for (const z of [-0.3, 0.3]) for (let i = 0; i < 3; i++) M(Bx(0.36, 0.03, 0.02), D, -0.05, -0.1 + i * 0.08, z, piv, 0);
    M(Bx(0.16, 0.12, 0.26), A, -0.24, 0.29, 0, piv, 0.02);
    const br = new THREE.Group(); br.position.set(0.2, -0.1, 0); piv.add(br); u.barrel = br; for (const z of [-0.14, 0.14]) { M(cylX(0.06, 0.72, 10), D, 0, 0, z, br, 0.02); M(cylX(0.085, 0.13, 10), A, 0.66, 0, z, br, 0.02); }
    M(Bx(0.18, 0.12, 0.4), D, 0.05, 0, 0, br, 0.02);
    u.muzzle = new THREE.Object3D(); u.muzzle.position.x = 0.82; br.add(u.muzzle); u.flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: L.eye, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); u.flash.position.x = 0.85; br.add(u.flash); }
  else if (type === 'guard') { // s368 (Ben: "look like a street fighter character"): a heroic armoured FIGHTER: V-taper chest with a glowing core, big
    // gold-rimmed pauldrons, a crested helmet with a visor + a HEADBAND whose tails stream behind, a belt SASH, gauntlets, a wide bent-knee stance that
    // bounces like a fighting-game idle. Same hooks as before (legs · shArm · wArm · wpn · shieldG · shMat · shCore · blade / pistol), so the floor fights the same.
    const pistol = v === 'pistol', sk = L.shield || '#7df9ff', BD = toon(L.band || '#ec3013'), GD = toon(L.gold || '#e8b42a'); u.pistol = pistol; u.legs = []; u.tails = [];
    // pelvis + belt + sash (on p; the upper body bounces above it)
    M(Bx(0.34, 0.24, 0.5), D, 0, 1.02, 0, p, 0.02); M(Bx(0.4, 0.11, 0.58), BD, 0, 1.13, 0, p, 0.02); M(Bx(0.08, 0.12, 0.14), GD, 0.21, 1.13, 0, p, 0.015);
    for (const z of [-0.07, 0.07]) { const tl = new THREE.Group(); tl.position.set(0.22, 1.09, z); p.add(tl); M(Bx(0.035, 0.42, 0.1), BD, 0, -0.21, 0, tl, 0.012); tl.userData.ph = z * 20; tl.userData.base = [0.12, z * 2]; u.tails.push(tl); }
    for (const z of [-0.2, 0.2]) { const sg = Math.sign(z), lg = new THREE.Group(); lg.position.set(0, 1.0, z); lg.rotation.x = -sg * 0.14; p.add(lg);
      const th = new THREE.Group(); th.rotation.z = 0.32; lg.add(th); M(Cap(0.14, 0.32, 10), D, 0, -0.25, 0, th, 0.02); M(Bx(0.06, 0.3, 0.22), B, 0.12, -0.22, 0, th, 0.015);
      const kn = new THREE.Group(); kn.position.y = -0.5; kn.rotation.z = -0.62; th.add(kn); M(Sp(0.12, 10, 8), GD, 0.06, 0, 0, kn, 0.015, 0.12);
      M(new THREE.CylinderGeometry(0.13, 0.1, 0.42, 10), B, 0, -0.24, 0, kn, 0.02); M(Bx(0.06, 0.36, 0.18), A, 0.1, -0.24, 0, kn, 0.012);
      const bt = M(Bx(0.36, 0.13, 0.2), D, 0.08, -0.5, 0, kn, 0.02); bt.rotation.z = 0.3; M(Bx(0.08, 0.05, 0.21), GD, 0.24, -0.46, 0, kn, 0.01).rotation.z = 0.3; u.legs.push(lg); }
    const tor = new THREE.Group(); tor.position.set(0, 1.14, 0); tor.rotation.z = -0.08; p.add(tor); u.tor = tor;
    M(Cap(0.2, 0.16, 12), D, 0, 0.2, 0, tor, 0.02).scale.set(0.9, 1, 1.1); for (const y of [0.13, 0.27]) M(Bx(0.08, 0.1, 0.26), B, 0.17, y, 0, tor, 0.012);
    const ch = M(new THREE.CylinderGeometry(0.48, 0.27, 0.56, 8), B, 0, 0.62, 0, tor, 0.03); ch.scale.set(0.66, 1, 1); ch.rotation.y = Math.PI / 8;
    for (const z of [-0.15, 0.15]) M(Bx(0.06, 0.2, 0.2), A, 0.27, 0.72, z, tor, 0.012).rotation.z = -0.15; M(Sp(0.08, 10, 8), E, 0.32, 0.66, 0, tor, 0); M(new THREE.TorusGeometry(0.1, 0.025, 6, 16).rotateY(Math.PI / 2), GD, 0.32, 0.66, 0, tor, 0);
    M(new THREE.TorusGeometry(0.29, 0.04, 6, 8), GD, 0, 0.9, 0, tor, 0).rotation.x = Math.PI / 2;
    for (const z of [-0.5, 0.5]) { const pa = M(Sp(0.24, 12, 8, 0), A, 0, 0.84, z, tor, 0.02, 0.24); pa.scale.set(1.1, 0.85, 1); M(new THREE.TorusGeometry(0.21, 0.035, 6, 18), GD, 0, 0.8, z, tor, 0).rotation.x = Math.PI / 2; M(Bx(0.3, 0.05, 0.06), GD, 0, 1.0, z, tor, 0.01); }
    M(new THREE.CylinderGeometry(0.11, 0.14, 0.14, 10), D, 0, 0.97, 0, tor, 0.015);
    // the head: crested helmet, visor eyes, jaw guard, headband with two tails out the back
    const hd = new THREE.Group(); hd.position.set(0.02, 1.13, 0); tor.add(hd); u.head = hd;
    M(Sp(0.23, 14, 10), B, 0, 0, 0, hd, 0.025, 0.23).scale.set(1, 1.05, 0.92); M(Bx(0.2, 0.12, 0.3), D, 0.1, -0.13, 0, hd, 0.015); angry(hd, 0.2, 0.0, 0.08, 0.12, 0.06, 0);
    { const fin = new THREE.Shape(); fin.moveTo(0.16, 0); fin.lineTo(-0.3, 0.02); fin.lineTo(-0.42, 0.2); fin.lineTo(-0.1, 0.1); fin.lineTo(0.16, 0); const fg = new THREE.ExtrudeGeometry(fin, { depth: 0.04, bevelEnabled: false }); fg.translate(0, 0, -0.02); M(fg, GD, 0, 0.2, 0, hd, 0.012); }
    // arms: big gauntlets
    const arm = z => { const a2 = new THREE.Group(); a2.position.set(0, 0.78, z); tor.add(a2); M(Cap(0.1, 0.24), D, 0, -0.2, 0, a2, 0.02); M(Sp(0.11, 8, 6), GD, 0, -0.38, 0, a2, 0.015, 0.11);
      M(new THREE.CylinderGeometry(0.15, 0.1, 0.3, 10), B, 0, -0.54, 0, a2, 0.02); M(Bx(0.05, 0.24, 0.12), A, 0.12, -0.54, 0, a2, 0.012); M(Sp(0.12, 10, 8), D, 0, -0.72, 0, a2, 0.02, 0.12); return a2; };
    u.shArm = arm(0.5); u.wArm = arm(-0.5); u.shArm.rotation.x = 0.5; u.hand = new THREE.Object3D(); u.hand.position.set(0.04, -0.7, 0); u.shArm.add(u.hand); /* s368c: the shield is strapped to this forearm */ const wp = new THREE.Group(); wp.position.set(0, -0.72, 0); u.wArm.add(wp); u.wpn = wp;
    if (!pistol) { M(cylX(0.045, 0.26, 6), D, -0.13, 0, 0, wp, 0.01); M(Bx(0.07, 0.08, 0.4), GD, 0.12, 0, 0, wp, 0.02); const bm = new THREE.MeshBasicMaterial({ color: L.blade || '#7df9ff' }); u.bladeMat = bm; u.bladeBase = L.blade || '#7df9ff';
      M(Bx(1.0, 0.13, 0.04), bm, 0.65, 0, 0, wp, 0.02); M(new THREE.ConeGeometry(0.065, 0.18, 4).rotateZ(-Math.PI / 2), bm, 1.24, 0, 0, wp, 0); }
    else { M(Bx(0.38, 0.14, 0.1), D, 0.13, 0.03, 0, wp, 0.02); M(Bx(0.08, 0.2, 0.08), D, -0.02, -0.08, 0, wp, 0.015); M(Bx(0.3, 0.04, 0.11), GD, 0.12, 0.11, 0, wp, 0.01); M(cylX(0.035, 0.12, 8), A, 0.31, 0.05, 0, wp, 0); M(Sp(0.035, 6, 5), E, 0.44, 0.05, 0, wp, 0);
      u.muzzle = new THREE.Object3D(); u.muzzle.position.set(0.46, 0.05, 0); wp.add(u.muzzle); u.flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: L.eye, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); u.flash.position.set(0.48, 0.05, 0); u.flash.scale.setScalar(0.7); wp.add(u.flash); }
    const sg = new THREE.Group(); sg.position.set(0.64, 1.2, 0.08); p.add(sg); u.shieldG = sg; u.shield = sg;
    u.shMat = new THREE.MeshPhongMaterial({ color: sk, emissive: sk, emissiveIntensity: 0.4, transparent: true, opacity: 0.45, shininess: 120, depthWrite: false, side: THREE.DoubleSide });
    M(new THREE.CylinderGeometry(0.6, 0.6, 0.07, 6).rotateZ(Math.PI / 2), u.shMat, 0, 0, 0, sg, 0); M(new THREE.TorusGeometry(0.6, 0.045, 4, 6).rotateY(Math.PI / 2).rotateX(Math.PI / 6), GD, 0, 0, 0, sg, 0);
    u.shCore = M(new THREE.CircleGeometry(0.32, 6).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ color: sk, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), 0.05, 0, 0, sg, 0); }
  else if (type === 'gate') { const T = toon(L.trim || '#e8b84a');
    for (const sx of [-1.1, 1.1]) { M(Bx(0.36, 2.8, 0.36), B, sx, 1.4, 0, p, 0.03); M(Bx(0.4, 0.14, 0.4), A, sx, 0.5, 0, p, 0); M(Bx(0.4, 0.14, 0.4), A, sx, 2.2, 0, p, 0); }
    M(Bx(3.2, 0.26, 0.5), T, 0, 2.95, 0, p, 0.03); M(Bx(2.6, 0.16, 0.36), D, 0, 2.55, 0, p, 0.02);
    // s35z3 (Ben): a LIVE portal — a camera-facing group (u.disk) holding 3 swirl layers spinning at different speeds + directions, a throbbing core, a rim and motes sucked into the middle (animGate)
    const face = new THREE.Group(); face.position.y = 1.35; p.add(face); u.disk = face; u.swirl = [];
    const pmat = (o, extra) => new THREE.MeshBasicMaterial({ map: portalTex(THREE), color: L.eye, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, ...extra });
    { const back = new THREE.Mesh(new THREE.CircleGeometry(0.98, 32), new THREE.MeshBasicMaterial({ color: '#1a0605', transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide })); back.position.z = -0.03;   /* s294 (Ben): slightly see-through */ back.userData.nf = 1; face.add(back); }
    for (const [r, o, sp, z] of [[0.98, 0.72, 2.6, 0], [0.8, 0.62, -4.2, 0.01], [0.55, 0.72, 7.5, 0.02]]) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 32), pmat(o)); m.position.z = z; m.userData.nf = 1; m.userData.sp = sp; m.userData.o = o; face.add(m); u.swirl.push(m); }
    u.rim = new THREE.Mesh(new THREE.RingGeometry(0.92, 1.04, 40), new THREE.MeshBasicMaterial({ color: L.eye, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); u.rim.position.z = 0.03; u.rim.userData.nf = 1; face.add(u.rim);
    u.core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffe0c0', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); u.core.position.z = 0.05; face.add(u.core);
    u.motes = []; for (let i = 0; i < 14; i++) { const s2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: i % 3 ? L.eye : '#ffd23a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); s2.position.z = 0.06; face.add(s2); u.motes.push(s2); }
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 14, 12, 1, true), new THREE.MeshBasicMaterial({ color: L.eye, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 8; p.add(beam); u.beam = beam; }
  const eye = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: L.eye, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); eye.scale.setScalar(type === 'crawler' ? 0.45 : type === 'guard' ? 1.1 : type === 'gate' ? 2.6 : 0.9);
  if (type === 'crawler') eye.position.set(0.18, 0.03, 0); else if (type === 'guard') eye.position.set(0.22, 0, 0); else if (type === 'turret') eye.position.set(0.36, 1.2, 0); else eye.position.set(type === 'gate' ? 0 : 0.62, type === 'gate' ? 1.35 : 0, 0); (u.head || p).add(eye); u.eye = eye;
  u.ms = []; g.traverse(o => { if (o.isMesh && o.material !== outlineMat && o.material !== E && !o.userData.nf && o !== u.beam && o !== u.shCore) u.ms.push([o, o.material]); }); return g; }

// s35y: one pose function for the crawler + guard, used by the 3D floor and the workshop.
// s = { mode: 'idle' | 'tell' | 'atk' | 'rest', p: 0..1 through that phase, speed (m/s, drives treads / legs), dt, t }
const dmp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt)), sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x), lp = (a, b, k) => a + (b - a) * k;
export function poseBot(g, type, s) { const u = g.userData, dt = s.dt || 0.016, t = s.t || 0, m = s.mode || 'idle', p = Math.min(1, Math.max(0, s.p || 0)), sp = s.speed || 0;
  if (m === 'atk' && u.lastM !== 'atk') u.side = 1 - (u.side || 0); u.lastM = m;
  if (type === 'crawler') { u.tread = (u.tread || 0) + sp * dt; for (const w of u.wheels) w.rotation.z = -u.tread / 0.11; const n = u.bars.length; u.bars.forEach((b, i) => { b.position.x = ((((i / n) - u.tread / 1.1) % 1 + 1) % 1) * 1.0 - 0.5; });
    u.hull.position.y = 0.62 + Math.sin(t * 16) * 0.014 * Math.min(1, sp); if (u.tor) { const id = (1 - Math.min(1, sp)) * (m === 'rest' ? 0.3 : 1), punch = m === 'atk' && !u.cannon ? Math.sin(p * Math.PI) : 0, sd2 = (u.side ? 1 : -1);   // s368g: boxer bob + weave, shoulder twist into the punch, slump + daze on rest
      u.tor.position.y = 0.1 - Math.abs(Math.sin(t * 5.6)) * 0.03 * id - (m === 'rest' ? 0.05 : 0);
      u.tor.rotation.x = dmp(u.tor.rotation.x, Math.sin(t * 2.8) * 0.07 * id + punch * 0.4 * sd2, 14, dt);
      u.tor.rotation.y = dmp(u.tor.rotation.y, punch * 0.45 * sd2 + (m === 'idle' ? Math.sin(t * 1.9) * 0.08 : 0), 14, dt);
      u.tor.rotation.z = dmp(u.tor.rotation.z, m === 'tell' ? 0.02 : m === 'atk' ? -0.3 : m === 'rest' ? 0.08 : -0.14, 12, dt);
      u.head.rotation.z = dmp(u.head.rotation.z, m === 'tell' ? -0.25 : m === 'atk' ? 0.12 : m === 'rest' ? -0.25 : 0.05, 12, dt); u.head.rotation.x = m === 'rest' ? Math.sin(t * 3) * 0.18 : dmp(u.head.rotation.x, 0, 10, dt);
      if (u.pipes) u.pipes.forEach((s2, i) => { const k = ((t * (1.4 + sp) + i * 0.5) % 1); s2.position.y = 0.85 + k * 0.5; s2.scale.setScalar(0.15 + k * 0.35); s2.material.opacity = (0.45 - k * 0.45) * (0.4 + Math.min(1, sp) * 0.6 + (m === 'tell' ? 0.6 : 0)); }); } u.hull.rotation.z = dmp(u.hull.rotation.z, m === 'tell' ? 0.12 * sm(p * 2) : m === 'atk' ? -0.14 : 0, 12, dt);
    if (u.barrel) { u.barrel.rotation.z = dmp(u.barrel.rotation.z, m === 'tell' ? 0.08 : 0, 10, dt); u.barrel.position.x = 0.18 - (m === 'atk' ? 0.3 * (1 - p) : 0); u.flash.material.opacity = m === 'atk' && p < 0.35 ? 1 - p / 0.35 : m === 'tell' ? 0.35 * p * (0.6 + 0.4 * Math.sin(t * 40)) : 0; u.flash.scale.setScalar(m === 'atk' ? 1.4 : 0.5); }
    u.arms.forEach((a, i) => { const base = u.cannon ? 0.2 : 0.3; let x; if (m === 'tell') x = base - 0.16 * sm(p * 3) + Math.sin(t * 45 + i) * 0.015; else if (m === 'atk' && !u.cannon) x = i === u.side ? base + Math.sin(p * Math.PI) * 0.85 : base - 0.12; else x = base + Math.sin(t * 4 + i * 2) * 0.03;
      x = Math.max(0.05, x); a.ext.position.x = x; a.piston.scale.x = x; a.sh.rotation.y = (i ? 1 : -1) * (m === 'atk' && i === u.side && !u.cannon ? 0.28 : 0.12); a.sh.rotation.z = m === 'tell' && !u.cannon ? 0.35 * sm(p * 3) : dmp(a.sh.rotation.z, 0, 12, dt); }); }
  else if (type === 'guard') { u.sd = dmp(u.sd || 0, m === 'rest' ? 1 : 0, 10, dt); const sd = u.sd; u.ph = (u.ph || 0) + sp * dt * 4.5; const wk = Math.min(1, sp / 1.4) * (1 - sd), pulse = Math.sin(t * 7);
    u.legs.forEach((l, i) => l.rotation.z = Math.sin(u.ph + i * Math.PI) * 0.55 * wk);
    if (u.tor) { const idle = (1 - wk) * (1 - sd), bob = Math.abs(Math.sin(t * 5.2)) * 0.035 * idle; u.tor.position.y = 1.14 - bob - sd * 0.08;   // s368 fighting-game idle bounce
      const lean = m === 'tell' ? (u.pistol ? -0.04 : 0.12 * sm(p)) : m === 'atk' ? (u.pistol ? -0.04 : -0.3 * sm(Math.min(1, p * 2))) : m === 'rest' ? 0.12 : -0.08 - 0.06 * wk; u.tor.rotation.z = dmp(u.tor.rotation.z, lean, 12, dt);
      if (u.head) u.head.rotation.z = -u.tor.rotation.z * 0.5 + (m === 'rest' ? -0.3 * sd : 0);
      for (const tl of u.tails) { const q = tl.userData, fl = Math.sin(t * 9 + q.ph) * 0.18 + Math.sin(t * 15.3 + q.ph) * 0.07, wind = Math.min(1, sp / 2) * 0.4; if (q.head) { tl.rotation.z = 0.35 - wind * 0.5 + fl * 0.6; tl.rotation.y = q.base[0] + fl * 0.5; } else { tl.rotation.z = q.base[0] + wind + fl * 0.4; tl.rotation.x = q.base[1] + fl * 0.3; } } }
    const sg = u.shieldG; sg.position.set((m === 'tell' && !u.pistol ? 0.5 : 0.64) - sd * 0.25, 1.2 - sd * 0.7, 0.08); sg.rotation.z = -sd * 1.1; sg.scale.setScalar(1 + 0.05 * pulse); u.shHit = Math.max(0, (u.shHit || 0) - dt); const shK = u.shK ?? 1, flick = shK < 0.35 && Math.random() < 0.2 ? 0.4 : 1; u.shMat.opacity = (0.36 + 0.16 * pulse) * (0.45 + 0.55 * shK) * flick + (u.shHit > 0 ? 0.4 : 0); u.shMat.emissiveIntensity = 0.35 + 0.3 * pulse + (u.shHit > 0 ? 1.2 : 0); u.shCore.material.opacity = 0.22 + 0.22 * pulse;
    u.shArm.rotation.z = 1.05 - sd * 0.9 + Math.sin(u.ph) * 0.05 * wk;
    if (u.hand) { u.hand.updateWorldMatrix(true, false); const v = u.hv || (u.hv = u.hand.position.clone()); v.set(0, 0, 0); u.hand.localToWorld(v); u.inner.worldToLocal(v); sg.position.set(v.x + 0.1, v.y, v.z - 0.06); }   // s368c: shield follows the fist
    let a; if (u.pistol) a = m === 'tell' ? lp(0.3, 1.57, sm(p * 2)) : m === 'atk' ? 1.57 + 0.45 * (1 - p) : m === 'rest' ? 0.05 : 0.3 + Math.sin(u.ph + Math.PI) * 0.15 * wk;
    else a = m === 'tell' ? lp(0.5, 2.7, sm(p)) : m === 'atk' ? lp(2.7, 0.05, sm(Math.min(1, p * 1.6))) : m === 'rest' ? -0.15 : 0.5 + Math.sin(u.ph + Math.PI) * 0.15 * wk;
    u.wArm.rotation.z = m === 'idle' || m === 'rest' ? dmp(u.wArm.rotation.z, a, 10, dt) : a;
    if (u.pistol) { u.wpn.rotation.z = -u.wArm.rotation.z + (m === 'rest' ? -0.4 : 0); u.flash.material.opacity = m === 'atk' && p < 0.4 ? 1 - p / 0.4 : 0; }
    else u.bladeMat.color.set(m === 'tell' && Math.sin(t * 40) > 0 ? '#ffffff' : u.bladeBase || (u.bladeBase = '#' + u.bladeMat.color.getHexString())); } }

// s35z3: the gate portal, every frame (floor + workshop). cam = camera.position
export function animGate(g, dt, t, cam, k = 1) { const u = g.userData; if (!u.disk) return; u.disk.lookAt(cam.x, cam.y, cam.z);
  const beat = 0.5 + 0.5 * Math.sin(t * 5), fast = Math.sin(t * 23) * 0.5 + 0.5;
  u.swirl.forEach((m, i) => { m.rotation.z += m.userData.sp * dt * k; const s = 1 + 0.07 * Math.sin(t * (3 + i * 1.7) + i * 2); m.scale.setScalar(s); m.material.opacity = m.userData.o * (0.75 + 0.25 * Math.sin(t * (6 + i * 3) + i)); });
  u.rim.scale.setScalar(1 + 0.04 * beat); u.rim.material.opacity = 0.55 + 0.45 * beat;
  u.core.scale.setScalar((0.9 + 0.7 * beat + 0.15 * fast) * k); u.core.material.opacity = 0.65 + 0.35 * beat;
  const n = u.motes.length; u.motes.forEach((s2, i) => { const ph = ((t * 0.7 * k + i / n) % 1 + 1) % 1, r = 1.05 * (1 - ph * ph), a = i * 2.39 + ph * 6.5; s2.position.x = Math.cos(a) * r; s2.position.y = Math.sin(a) * r; s2.material.opacity = Math.sin(ph * Math.PI) * 0.95; s2.scale.setScalar(0.12 + 0.16 * (1 - ph)); }); }
