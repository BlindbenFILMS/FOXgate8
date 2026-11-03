// MERU 2.0 — s94 BARRACKS DELUXE PART A (Ben's answers s94): the BARRACKS drill hall [meruBarracks] (f -40..40 × -440..-400, door S (0, -400)).
// TWO keepers: the GUARD CAPTAIN (at his desk, west) runs the DUTY jobs, the MASTER OF ARMS (by the circle, east) runs the TRAINING jobs.
// Both keep their 2D lines (WHAT IS THIS PLACE? / WHAT SHOULD I WORK ON?). REST on a bunk (2D: health full, +15 XP once).
// Shop kit: NOW HIRING by the door, the DUTY ROSTER board (stars + best) + clock on the south wall, chime, door sun patch, chandelier glows.
// Part A jobs: MAKE THE BUNKS · POLISH THE ARMOUR · COOK FOR THE MESS (Captain) · SHARPEN THE SWORDS · FETCH ARROWS · STACK THE WEAPON RACK (Master).
// Part B (s95): LIGHT THE BRAZIERS · GUARD DUTY · INSPECTION (Captain) · RESTUFF THE DUMMIES · MORNING DRILL (Master) + the 3D SPAR bout (engine/combat.js, own instance).
// Part C1 (s96): prizes + the dais walls = worlds/meru2-barracks-prize.js (PZ). Part C2 (s97): the look + the guards' day = worlds/meru2-barracks-life.js (LF).
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { keeperPoser } from '../engine/keeper-poser.js?v=s645';   // s624 jointed Master of Arms
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { DIALOGUE } from './meru-interiors.js';
import { brkPrizes } from './meru2-barracks-prize.js';
import { brkLife } from './meru2-barracks-life.js?v=s645';
const CAPT = { name: 'Guard Captain', role: 'BARRACKS', color: '#52525b',
  hello: ['Soldier. The King\u2019s hall runs on work. Ready for duty?', 'Back on duty, soldier?', 'Bunks, armour, mess. Pick a duty.', 'Idle hands rust faster than steel. Work.'],
  open: ['Squared away, soldier.', 'That passes inspection.', 'Clean work. The King would approve.', 'Good. Again?'],
  tips: ['Corners tight enough to bounce a coin. Anything less, strip it and start again.', 'Polish in small circles. A dull plate tells the enemy where to aim.', 'One scoop per bowl. Two hundred mouths, one pot.', 'Up at five, lights out at ten. The King keeps better hours than you.'] };
const MOA = { name: 'Master of Arms', role: 'BARRACKS', color: '#1e3a8a',
  hello: ['You want to train? Work first. Steel before sparring.', 'Back again? Good. Pick your drill.', 'The edge, the arrows, the rack. Choose.', 'Feet ready? Hands ready? Work.'],
  open: ['Not bad. Not bad at all.', 'Clean. Again?', 'That is how a guard works.', 'Good hands today.'],
  tips: ['Lay the edge on the stone. Let the wheel do the work.', 'Some arrows bite deep. Hold and pull straight.', 'Everything on the wall has a shape. Match the shape.', 'Feet first, blade second. Always.'] };
export function buildBarracksJobs({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted, heal, hp, hpMax, people, wear }) { const JW = jobWorker(THREE);
  const mutedQ = () => { try { return !!(isMuted && isMuted()); } catch (e) { return true; } };
  const R0 = { X0: -40, X1: 40, Z0: -440, Z1: -400 }, DOOR = [0, -400], FL = 0.06;
  const G = new THREE.Group(); G.name = 'barracksJobs'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const toW = v => v.clone();
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const ring = (x, z, r) => cols.push({ c: [x, z, r] }), boxC = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#e6b45a', NAVY = '#1f2650', STEEL = '#a9b1b9', WOOD = '#6b4a32', DARK = '#3d2a1c';
  // ================= the keepers (built by meru2-barracks.js; this module owns their talk + idle) =================
  const pick = k => (people || []).find(p => p.key === k);
  const cP = pick('barracksGuardCaptain'), mP = pick('barracksMasterOfArms');
  for (const k of ['barracksGuardCaptain', 'barracksMasterOfArms']) { const i = (people || []).findIndex(p => p.key === k); if (i >= 0) people.splice(i, 1); }   // the generic talker no longer grabs them
  const capt = cP && cP.obj, moa = mP && mP.obj; if (capt) capt.userData.ownAnim = true; if (moa) moa.userData.ownAnim = true;
  const kC = capt && { key: 'barracksGuardCaptain', name: CAPT.name, role: CAPT.role, obj: capt, ry: cP.ry, r: 6 }, kM = moa && { key: 'barracksMasterOfArms', name: MOA.name, role: MOA.role, obj: moa, ry: mP.ry, r: 6 };
  const lnC = text => ({ who: 'guard captain', role: CAPT.role, text }), lnM = text => ({ who: 'master of arms', role: MOA.role, text });
  // ================= PROPS =================
  // armour stands (west wing, south): 3 breastplates + helms facing the door
  const ARM = [-34, -31, -28].map(x => { const g = new THREE.Group(); g.position.set(x, FL, -412); G.add(g); cyl(g, 0.05, 0.05, 1.1, DARK, 0, 0.55, 0); box(g, 0.5, 0.06, 0.5, DARK, 0, 0.03, 0);
    box(g, 0.62, 0.72, 0.3, STEEL, 0, 1.28, 0); box(g, 0.86, 0.14, 0.32, STEEL, 0, 1.6, 0); box(g, 0.2, 0.2, 0.02, GOLD, 0, 1.36, 0.16); cyl(g, 0.19, 0.2, 0.3, STEEL, 0, 1.86, 0, 12); box(g, 0.3, 0.06, 0.02, INK, 0, 1.86, 0.2);
    boxC(x - 0.45, x + 0.45, -412.35, -411.65); return g; });
  const ARMZ = -412 + 0.152;
  // the stew pot by the west mess table (tripod + fire) + its ladle
  const POT = V(-9.2, FL, -421.0);
  { cyl(G, 0.5, 0.42, 0.62, '#2b2a29', POT.x, FL + 0.62, POT.z, 16); cyl(G, 0.46, 0.46, 0.02, '#8a4a1e', POT.x, FL + 0.9, POT.z, 16); for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2, l = box(G, 0.05, 1.3, 0.05, '#3d3b3a', POT.x + Math.cos(a) * 0.55, FL + 0.6, POT.z + Math.sin(a) * 0.55); l.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); }
    for (let i = 0; i < 5; i++) box(G, 0.5, 0.06, 0.08, '#5a3a22', POT.x, FL + 0.08, POT.z, 0).rotation.y = i * 0.63; ring(POT.x, POT.z, 0.65); }
  const fireM = new THREE.MeshBasicMaterial({ color: '#ff8a3a', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }), fire = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.4, 8), fireM); fire.position.set(POT.x, FL + 0.3, POT.z); G.add(fire);
  const LADLE = new THREE.Group(); cyl(LADLE, 0.09, 0.06, 0.07, '#8a8580', 0, 0, 0, 10); box(LADLE, 0.03, 0.03, 0.55, '#8a8580', 0, 0.12, 0.3).rotation.x = -0.4; const ladleStew = cyl(LADLE, 0.08, 0.08, 0.02, '#8a4a1e', 0, 0.035, 0, 10); ladleStew.visible = false; G.add(LADLE);
  const LADLE0 = V(POT.x + 0.15, FL + 1.05, POT.z + 0.1); LADLE.position.copy(LADLE0);
  const BOWLZ = [-421.6, -420.15, -418.7, -417.25, -415.8, -414.35];
  const BOWLS = BOWLZ.map(z => { const g = new THREE.Group(); g.position.set(-7.3, 0.85, z); G.add(g); cyl(g, 0.14, 0.09, 0.09, '#8a6a42', 0, 0.045, 0, 12); const s = cyl(g, 0.12, 0.12, 0.02, '#8a4a1e', 0, 0.08, 0, 12); s.visible = false; return { g, s }; });
  // the grindstone (east, by the weapon racks)
  const GRIND = V(34.8, FL, -411);
  const wheelP = new THREE.Group(); wheelP.position.set(GRIND.x, FL + 0.78, GRIND.z); wheelP.rotation.z = Math.PI / 2; G.add(wheelP);
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.16, 20), LM('#8a8580')); wheelP.add(wheel); box(wheel, 0.04, 0.17, 0.84, '#6a6662', 0, 0, 0);
  { for (const s of [-1, 1]) { box(G, 0.08, 0.8, 0.08, WOOD, GRIND.x + s * 0.2, FL + 0.4, GRIND.z - 0.35); box(G, 0.08, 0.8, 0.08, WOOD, GRIND.x + s * 0.2, FL + 0.4, GRIND.z + 0.35); } box(G, 0.5, 0.06, 0.9, WOOD, GRIND.x, FL + 0.32, GRIND.z); box(G, 0.34, 0.12, 0.7, '#5a5654', GRIND.x, FL + 0.42, GRIND.z);
    cyl(G, 0.04, 0.04, 0.6, '#3d3b3a', GRIND.x, FL + 0.78, GRIND.z, 6).rotation.z = Math.PI / 2; boxC(GRIND.x - 0.35, GRIND.x + 0.35, GRIND.z - 0.5, GRIND.z + 0.5); }
  const SWD = new THREE.Group(); box(SWD, 0.05, 0.02, 0.9, '#c0c4cc', 0, 0, 0); box(SWD, 0.26, 0.04, 0.05, GOLD, 0, 0, 0.47); box(SWD, 0.04, 0.04, 0.24, DARK, 0, 0, 0.62); SWD.visible = false; G.add(SWD);
  // archery butts (built in meru2-barracks.js): faces at x 38.34, centre y 1.4; a quiver by the line
  const BUTTZ = [-436, -430, -424], BUTTX = 38.3, BUTTY = 1.4, QUIV = V(36.0, FL, -427.4);
  { cyl(G, 0.16, 0.13, 0.7, '#7a4a28', QUIV.x, FL + 0.35, QUIV.z, 10); for (let i = 0; i < 5; i++) box(G, 0.015, 0.4, 0.015, '#c9b48a', QUIV.x + rnd(-0.07, 0.07), FL + 0.8, QUIV.z + rnd(-0.07, 0.07)); ring(QUIV.x, QUIV.z, 0.25); }
  const arrowG = () => { const g = new THREE.Group(); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.72, 5), LM('#c9a46a')); sh.rotation.z = Math.PI / 2; sh.position.x = -0.36; g.add(sh);
    for (const r of [0, Math.PI / 2]) { const f = box(g, 0.14, 0.06, 0.004, RED, -0.68, 0, 0); f.rotation.x = r; } return g; };
  // the WEAPON WALL (east wall, between the butts and the racks): 6 painted slots + a trestle with the weapons
  const KINDS = ['sword', 'spear', 'axe', 'sword', 'axe', 'spear'], SLOTZ = KINDS.map((_, i) => -421.3 + i * 0.8), WALLX = 39.32;
  const silT = CT(512, 208, (g, W, H) => { g.fillStyle = '#7a5a3e'; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = '#efe6d2'; g.strokeStyle = '#efe6d2'; g.lineCap = 'round';
    KINDS.forEach((k, i) => { const u = (SLOTZ[i] + 421.8) / 5 * W; g.lineWidth = 7;
      if (k === 'sword') { g.beginPath(); g.moveTo(u, 30); g.lineTo(u, 140); g.stroke(); g.fillRect(u - 18, 140, 36, 7); g.fillRect(u - 4, 147, 8, 24); }
      if (k === 'spear') { g.beginPath(); g.moveTo(u, 40); g.lineTo(u, 190); g.stroke(); g.beginPath(); g.moveTo(u, 14); g.lineTo(u - 11, 44); g.lineTo(u + 11, 44); g.fill(); }
      if (k === 'axe') { g.beginPath(); g.moveTo(u, 30); g.lineTo(u, 180); g.stroke(); g.beginPath(); g.moveTo(u, 34); g.lineTo(u + 30, 24); g.quadraticCurveTo(u + 42, 54, u + 30, 84); g.lineTo(u, 74); g.fill(); }
      g.fillStyle = INK; g.font = '900 18px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText(k.toUpperCase(), u, H - 10); g.fillStyle = '#efe6d2'; }); });
  { const p = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.03), new THREE.MeshLambertMaterial({ map: silT })); p.position.set(WALLX, 1.45, -419.3); p.rotation.y = -Math.PI / 2; G.add(p);
    SLOTZ.forEach(z => cyl(G, 0.025, 0.025, 0.12, '#3d3b3a', WALLX - 0.06, 2.3, z, 6).rotation.z = Math.PI / 2);
    box(G, 0.8, 0.06, 3.4, WOOD, 37.6, 0.72, -419.3); for (const z of [-420.8, -417.8]) for (const s of [-0.3, 0.3]) box(G, 0.06, 0.7, 0.06, DARK, 37.6 + s, 0.36, z); boxC(37.15, 38.05, -421.05, -417.55); }
  const wpn = k => { const g = new THREE.Group();
    if (k === 'sword') { box(g, 0.06, 0.95, 0.02, '#c0c4cc', 0, 0.1, 0); box(g, 0.26, 0.05, 0.05, GOLD, 0, -0.4, 0); box(g, 0.05, 0.24, 0.05, DARK, 0, -0.55, 0); }
    if (k === 'spear') { cyl(g, 0.02, 0.02, 1.5, '#8a6a42', 0, -0.1, 0, 6); const t = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), LM('#c0c4cc')); t.position.y = 0.76; g.add(t); }
    if (k === 'axe') { cyl(g, 0.025, 0.025, 1.0, '#8a6a42', 0, -0.05, 0, 6); box(g, 0.24, 0.2, 0.03, '#c0c4cc', 0.1, 0.36, 0); }
    g.userData.k = k; return g; };
  // ================= rings =================
  const RINGS = { bunks: [-32.4, -428.5], armour: [-31, -409.6], mess: [-9.9, -423.0], sharpen: [33.0, -411], arrows: [36.4, -430.2], rack: [35.6, -419.3], rest: [-25.2, -434.8],
    braziers: [0, -421.0], guard: [0, -406.0], inspect: [-1.4, -423.6], dummies: [17, -432.0], drill: [15.5, -406.4] };
  for (const k in RINGS) { const [x, z] = RINGS[k]; const c = k === 'rest' ? '#9fd7a8' : YEL; const r1 = cyl(G, 0.5, 0.5, 0.012, c, x, FL + 0.03, z, 22), r2 = cyl(G, 0.42, 0.42, 0.014, INK, x, FL + 0.032, z, 22); r1.renderOrder = r2.renderOrder = 1; }
  // ================= shop kit =================
  const GAMES = [{ k: 'bunks', name: 'Make the Bunks', color: NAVY, by: 'c' }, { k: 'armour', name: 'Polish the Armour', color: '#7a828a', by: 'c' }, { k: 'mess', name: 'Cook for the Mess', color: '#8a4a1e', by: 'c' },
    { k: 'braziers', name: 'Light the Braziers', color: '#ff8a3a', by: 'c' }, { k: 'guard', name: 'Guard Duty', color: '#2f7a4a', by: 'c' }, { k: 'inspect', name: 'Inspection', color: '#52525b', by: 'c' },
    { k: 'sharpen', name: 'Sharpen the Swords', color: '#5a5654', by: 'm' }, { k: 'arrows', name: 'Fetch the Arrows', color: RED, by: 'm' }, { k: 'rack', name: 'Stack the Weapon Rack', color: WOOD, by: 'm' },
    { k: 'dummies', name: 'Restuff the Dummies', color: '#d6b86a', by: 'm' }, { k: 'drill', name: 'Morning Drill', color: NAVY, by: 'm' }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), pre = 'brk';
  let LF = null;
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted: mutedQ, lampsOn: () => !(LF && LF.lightsOut()), prefix: pre, color: CAPT.color, boardTitle: 'Duty roster', toWorld: toW, room: R0, door: [DOOR[0], DOOR[1] - 0.5], keeper: capt || null, keeperRy: cP ? cP.ry : 0, games: GAMES,
    board: { x: -7, y: 3.2, z: -400.64, ry: Math.PI, w: 1.6 }, hiring: { x: -3.4, y: 0, z: -402.2, ry: Math.PI }, hiringLine: 'WALK UP \u00b7 REPORT FOR DUTY',
    sun: [{ x: 0, z: -403.2, w: 3.4, d: 4.2 }], lamps: [[-24, 6.4, -428], [0, 6.4, -428], [24, 6.4, -428], [-24, 6.4, -414], [0, 6.4, -414], [24, 6.4, -414]], browse: [], clock: { x: 6, y: 3.4, z: -400.64, ry: Math.PI } });
  // ================= state, sound, card UI =================
  let toastTxt = '', toastT = 0, talkC = 0, talkM = 0, busy = null, J = null, thanks = null, lastP = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at0 = 0) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at0, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = bf; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square');
  const clang = () => { tone(2350, 0.05, 0.5, 'triangle'); tone(3120, 0.03, 0.4, 'triangle'); noise(0.12, 0.04, 4000); }, thud = () => tone(110, 0.08, 0.18, 'sine'), rub = () => noise(0.08, 0.02, 3000);
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r, c) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + c + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span></div>';
  const lst = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + items.map(([sw, t, r, ok]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (r ? ' \u00b7 ' + r : '') + '</span>').join('') + '</div>' : items.map(a => row(...a)).join('');
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>';
  const gauge = (v, lo, hi, needle) => '<div style="position:relative;height:20px;border:2px solid #201e1d;background:#ffffff;margin-top:6px"><div style="position:absolute;top:0;bottom:0;left:' + (lo * 100).toFixed(1) + '%;width:' + ((hi - lo) * 100).toFixed(1) + '%;background:#9fd7a8"></div>' +
    (needle ? '<div style="position:absolute;top:-2px;bottom:-2px;left:calc(' + (v * 100).toFixed(1) + '% - 2px);width:4px;background:#201e1d"></div>' : '<div style="position:absolute;top:0;bottom:0;left:0;width:' + Math.min(100, v * 100).toFixed(1) + '%;background:' + (v > hi ? '#ec3013' : '#201e1d') + ';opacity:0.85"></div>') + '</div>';
  const setCard = (k, html) => { if (k === cardKey) return; cardKey = k; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ---------- input (tap jobs) ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && !!J;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), TAPR = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = V();
  const hitPl = pl => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); return rc.ray.intersectPlane(pl, hitP) ? hitP.clone() : null; };
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const Fq of J.flies.slice()) { Fq.t += dt / Fq.dur; const k = Math.min(1, Fq.t), e = k * k * (3 - 2 * k); Fq.obj.position.lerpVectors(Fq.from, Fq.to, e); Fq.obj.position.y += Math.sin(k * Math.PI) * Fq.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(Fq), 1); Fq.then && Fq.then(); } } }
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt + bg] || (tagTex[txt + bg] = CT(128, 96, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = '900 ' + (txt.length > 2 ? 40 : 60) + 'px Archivo, sans-serif'; g.fillText(txt, W2 / 2, H / 2 + 3); }));
  const tagSprite = (txt, bg = '#ffffff', fg = INK, s = 0.5) => { if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: false })); sp.scale.set(s, s * 0.75, 1); sp.renderOrder = 6; return sp; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (after, t = 1.0) => { J.pause = t; J.after = after; };
  const done = () => save.stat(pre + 'Done', null) || {};
  const PZ = brkPrizes({ THREE, G, box, cyl, LM, CT, cols, save, wear, toast, ding, tone, sayTo, hour, heal });
  LF = brkLife({ THREE, G, kit, LM, CT, box, cyl, touch, hour, tone, noise, toast, camera });
  const blotT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 3, 32, 32, 31); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.6, 'rgba(255,255,255,0.85)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, rr = 23 + (i % 3) * 5; g.lineTo(32 + Math.cos(a) * rr, 32 + Math.sin(a) * rr); } g.fill(); });
  // ================= JOB 1: MAKE THE BUNKS (tap) — tuck 4 corners in order, fluff the pillow, the Captain bounces a coin =================
  const BUNKX = [-36, -32.4, -28.8], BZ = -426, BY = 0.72;
  const corner = (b, i) => V(BUNKX[b] + [-0.42, 0.42, 0.42, -0.42][i], BY, BZ + [-0.9, -0.9, 0.9, 0.9][i]);
  const G1 = {
    begin() { J.b = 0; this.setup(); toast('TUCK THE CORNERS IN ORDER \u00b7 THEN THE PILLOW', 2.8); },
    setup() { J.mk && J.mk.forEach(m => m.parent && m.parent.remove(m)); if (J.mess) J.mess.parent && J.mess.parent.remove(J.mess);
      const x = BUNKX[J.b]; J.mess = own(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 1.3), LM('#2b3570'))); J.mess.position.set(x + 0.12, 0.8, BZ + 0.15); J.mess.rotation.set(0.12, 0.4, 0.08);
      J.order = shuffle([0, 1, 2, 3]); J.k = 0; J.mk = J.order.map((c, i) => { const s = own(tagSprite(String(i + 1), i === 0 ? YEL : '#d6d2cb', INK, 0.17)); s.position.copy(corner(J.b, c)).setY(BY + 0.1); return { s, c }; });
      J.pil = own(tagSprite('PILLOW', '#d6d2cb', INK, 0.24)); J.pil.position.set(x, BY + 0.16, BZ - 0.72); J.pil.visible = false; },
    press() { if (J.flies.length) return; if (J.k >= 4) { if (dist(scrW(J.pil.position)) < TAPR() * 1.4) { pop(); J.pil.visible = false; addGold(4); this.coin(); } return; }
      let best = -1, bd = TAPR() * 1.2; J.mk.forEach((m, i) => { if (!m.s.visible) return; const d = dist(scrW(m.s.position)); if (d < bd) { bd = d; best = i; } }); if (best < 0) return;
      if (best !== J.k) { miss('NOT THAT CORNER \u00b7 FOLLOW THE NUMBERS', 1.4); return; }
      J.mk[best].s.visible = false; tone(520 + J.k * 80, 0.05, 0.15, 'triangle'); addGold(1); J.k++; J.mess.scale.set(1 - J.k * 0.06, 1 - J.k * 0.18, 1 - J.k * 0.06); J.mess.rotation.y *= 0.6;
      if (J.k < 4) J.mk[J.k].s.material.map = tagFor(String(J.k + 1), YEL, INK); else { J.mess.visible = false; J.pil.visible = true; J.pil.material.map = tagFor('PILLOW', YEL, INK); toast('TAP THE PILLOW', 1.2); } },
    coin() { const c = own(cyl(new THREE.Group(), 0.05, 0.05, 0.012, '#e6b45a', 0, 0, 0, 12)); const x = BUNKX[J.b]; c.position.set(x, 1.3, BZ); J.ph = 'coin'; thud();
      fly(c, V(x, BY + 0.02, BZ), 0.35, 0, () => { tone(1900, 0.05, 0.3, 'triangle'); fly(c, V(x, BY + 0.02, BZ + 0.05), 0.4, 0.35, () => { c.visible = false; ding(); toast('THE COIN BOUNCES \u00b7 PASSED', 1.2); J.ph = null; J.b++; if (J.b >= BUNKX.length) NEXT(finishGame, 0.8); else NEXT(() => { G1.setup(); snapK = true; }, 0.8); }); }); },
    card() { return [J.k >= 4 ? 'TAP THE PILLOW' : 'TUCK CORNER ' + (J.k + 1), lab('BUNK ' + Math.min(3, J.b + 1) + ' / 3') + lst(BUNKX.map((_, i) => [NAVY, 'BUNK ' + (i + 1), i < J.b ? '\u2713' : i === J.b ? Math.min(J.k, 4) + ' / 4' : '', i < J.b])), 'b' + J.b + '_' + J.k]; },
    hint() { if (J.ph) return null; if (J.k >= 4) return J.pil.visible ? [J.pil.position.clone(), 'TAP'] : null; const m = J.mk[J.k]; return m ? [m.s.position.clone(), 'TAP'] : null; },
    shot() { return [V(BUNKX[Math.min(J.b, 2)], BY, BZ), 1.5, 1.2, 0.36, 1.8, Math.PI, 2.4]; },
    end() {} };
  // ================= JOB 2: POLISH THE ARMOUR (drag) — rub every dull spot off 3 breastplates =================
  const armPl = new THREE.Plane().setFromNormalAndCoplanarPoint(V(0, 0, 1), V(0, 0, ARMZ));
  const CLOTH = new THREE.Group(); box(CLOTH, 0.16, 0.12, 0.03, '#efe6d2', 0, 0, 0); CLOTH.visible = false; G.add(CLOTH);
  const G2 = {
    begin() { J.c = 0; this.spots(); toast('DRAG THE CLOTH \u00b7 RUB OFF EVERY DULL SPOT', 2.6); },
    spots() { (J.sp || []).forEach(s => s.m.parent && s.m.parent.remove(s.m)); J.sp = []; const x0 = ARM[J.c].position.x;
      for (let i = 0; i < 8; i++) { let x, y, n = 0; do { x = x0 + rnd(-0.25, 0.25); y = FL + rnd(1.0, 1.6); } while (J.sp.some(s => Math.hypot(s.p.x - x, s.p.y - y) < 0.13) && ++n < 30);
        const m = own(new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15), new THREE.MeshBasicMaterial({ map: blotT, color: '#4a4236', transparent: true, opacity: 0.85, depthWrite: false }))); m.position.set(x, y, ARMZ + 0.004); m.renderOrder = 3; J.sp.push({ p: m.position.clone(), m, d: 1 }); }
      J.lp = null; },
    press() { J.lp = null; },
    drag() { if (!ptr.down || J.pause > 0) return; const p = hitPl(armPl); if (!p) return; const x0 = ARM[J.c].position.x; p.x = clamp(p.x, x0 - 0.4, x0 + 0.4); p.y = clamp(p.y, FL + 0.9, FL + 1.75); CLOTH.visible = true; CLOTH.position.set(p.x, p.y, ARMZ + 0.04);
      const mv = J.lp ? J.lp.distanceTo(p) : 0; J.lp = p; if (mv < 0.002) return; if ((J.sw = (J.sw || 0) + mv) > 0.25) { J.sw = 0; rub(); }
      for (const s of J.sp) { if (s.d <= 0 || Math.hypot(s.p.x - p.x, s.p.y - p.y) > 0.11) continue; s.d -= mv * 3.2; s.m.material.opacity = Math.max(0, s.d) * 0.85; if (s.d <= 0) { s.m.visible = false; tone(2600, 0.03, 0.25, 'triangle'); addGold(1); } }
      if (J.sp.every(s => s.d <= 0)) { ding(); J.c++; if (J.c >= ARM.length) NEXT(finishGame, 0.9); else { toast('SHINING \u00b7 NEXT PLATE', 1.2); NEXT(() => { G2.spots(); snapK = false; }, 0.9); } } },
    release() { J.lp = null; },
    card() { const n = J.sp.filter(s => s.d > 0).length; return ['DRAG THE CLOTH', lab('PLATE ' + Math.min(3, J.c + 1) + ' / 3') + lst([['#4a4236', 'DULL SPOTS', n + ' LEFT', !n]]), 'a' + J.c + '_' + n]; },
    hint() { const s = J.sp.find(q => q.d > 0); return s ? [s.p.clone(), 'RUB'] : null; },
    shot() { const x = ARM[Math.min(J.c, 2)].position.x; return [V(x, FL + 1.32, -412), 1.0, 1.0, 0.12, 1.4, 0, 2.2]; },
    end() { CLOTH.visible = false; } };
  // ================= JOB 3: COOK FOR THE MESS (hold + tap) — hold on the pot to fill the ladle, let go on the green, tap a bowl =================
  const SCOOP = [0.55, 0.78];
  const G3 = {
    begin() { J.ph = 'scoop'; J.lvl = 0; J.n = 0; BOWLS.forEach(b => { b.s.visible = false; }); LADLE.position.copy(LADLE0); ladleStew.visible = false; toast('HOLD ON THE POT \u00b7 LET GO ON THE GREEN \u00b7 TAP A BOWL', 3); },
    press() { if (J.flies.length) return; if (J.ph === 'scoop') { if (dist(scrW(V(POT.x, FL + 0.9, POT.z))) < TAPR() * 2.2) { J.hold = true; J.lvl = 0; } return; }
      if (J.ph === 'serve') { let best = -1, bd = TAPR() * 1.4; BOWLS.forEach((b, i) => { const d = dist(scrW(b.g.position)); if (d < bd) { bd = d; best = i; } }); if (best < 0) return; const b = BOWLS[best];
        if (b.s.visible) { miss('THAT BOWL IS FULL', 1.2); return; } J.ph = 'fly'; fly(LADLE, b.g.position.clone().setY(b.g.position.y + 0.25), 0.4, 0.3, () => { if (!J) return; b.s.visible = true; ladleStew.visible = false; tone(300, 0.05, 0.2); addGold(3); J.n++;
          fly(LADLE, LADLE0, 0.35, 0.2, () => { if (!J) return; if (J.n >= BOWLS.length) { ding(); toast('SIX BOWLS \u00b7 MESS IS SERVED', 1.4); NEXT(finishGame, 0.8); } else J.ph = 'scoop'; }); }); } },
    release() { if (!J.hold) return; J.hold = false; if (J.ph !== 'scoop') return; if (J.lvl < SCOOP[0]) { toast('NOT ENOUGH \u00b7 HOLD AGAIN', 1.1); J.lvl = 0; return; } ladleStew.visible = true; pop(); J.ph = 'serve'; toast('ONE SCOOP \u00b7 TAP AN EMPTY BOWL', 1.2); },
    tick(dt) { fire.scale.setScalar(0.85 + Math.sin(J.t * 13) * 0.12); if (!J.hold || J.ph !== 'scoop') return; J.lvl += dt * 0.5; LADLE.position.y = LADLE0.y - Math.min(0.3, J.lvl * 0.4); if ((J.gl = (J.gl || 0) + dt) > 0.2) { J.gl = 0; tone(120 + Math.random() * 50, 0.04, 0.12); }
      if (J.lvl > SCOOP[1]) { J.hold = false; J.lvl = 0; LADLE.position.copy(LADLE0); miss('TOO MUCH \u00b7 STEW ON THE FLOOR', 1.6); } },
    card() { return [J.ph === 'serve' || J.ph === 'fly' ? 'TAP AN EMPTY BOWL' : 'HOLD \u00b7 LET GO ON GREEN', lab('BOWLS ' + J.n + ' / ' + BOWLS.length) + gauge(J.ph === 'scoop' ? J.lvl : 0, SCOOP[0], SCOOP[1]), J.ph + J.n + '_' + Math.round(J.lvl * 60)]; },
    hint() { if (J.ph === 'scoop' && !J.hold) return [V(POT.x, FL + 0.9, POT.z), 'HOLD']; if (J.ph === 'serve') { const b = BOWLS.find(q => !q.s.visible); return b ? [b.g.position.clone(), 'TAP'] : null; } return null; },
    shot() { return [V(-8.1, 0.85, -418.4), 7.6, 1.5, 0.62, 3.2, -Math.PI / 2 - 0.25, 7.0]; },
    end() { LADLE.position.copy(LADLE0); ladleStew.visible = false; } };
  // ================= JOB 4: SHARPEN THE SWORDS (timing) — tap when the edge crosses the green, 3 passes × 3 swords =================
  const G4 = {
    begin() { J.s = 0; J.p = 0; J.v = 0; J.dir = 1; this.band(); SWD.visible = true; toast('TAP WHEN THE NEEDLE IS ON THE GREEN', 2.6); },
    band() { const b = rnd(0.12, 0.7); J.band = [b, b + 0.17 - J.s * 0.02]; },
    press() { if (J.flies.length) return; const [lo, hi] = J.band; if (J.v >= lo && J.v <= hi) { clang(); this.sparks(); addGold(2); J.p++; toast('EDGE ' + J.p + ' / 3', 0.8);
        if (J.p >= 3) { J.p = 0; J.s++; ding(); if (J.s >= 3) { SWD.visible = false; NEXT(finishGame, 0.8); return; } toast('SHARP \u00b7 NEXT SWORD', 1.1); NEXT(() => {}, 0.7); } this.band(); }
      else { miss('DULL SPOT \u00b7 WAIT FOR THE GREEN', 1.2); noise(0.2, 0.05, 900); this.band(); } },
    sparks() { for (let i = 0; i < 6; i++) { const s = own(new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: i % 2 ? '#ffd23a' : '#ff8a3a' }))); s.position.copy(SWD.position); fly(s, SWD.position.clone().add(V(rnd(-0.5, -0.1), rnd(0.1, 0.5), rnd(-0.4, 0.4))), 0.35, 0.1, () => { s.visible = false; }); } },
    tick(dt) { wheel.rotation.y += dt * 9; if (J.pause > 0) return; J.v += J.dir * dt * (0.7 + J.s * 0.28); if (J.v > 1) { J.v = 1; J.dir = -1; } if (J.v < 0) { J.v = 0; J.dir = 1; } SWD.position.set(GRIND.x - 0.08, FL + 1.22, GRIND.z + (J.v - 0.5) * 0.75); },
    card() { return ['TAP ON THE GREEN', lab('SWORD ' + Math.min(3, J.s + 1) + ' / 3 \u00b7 EDGE ' + J.p + ' / 3') + gauge(J.v, J.band[0], J.band[1], true), 's' + J.s + J.p + '_' + Math.round(J.v * 50) + '_' + J.band[0].toFixed(2)]; },
    hint() { return J.v >= J.band[0] && J.v <= J.band[1] ? [SWD.position.clone(), 'TAP'] : null; },
    shot() { return [V(GRIND.x, FL + 1.0, GRIND.z), 1.6, 1.2, 0.38, 1.8, -Math.PI / 2, 2.6]; },
    end() { SWD.visible = false; } };
  // ================= JOB 5: FETCH THE ARROWS (tap / hold) — 4 arrows per butt, one bites deep (hold) =================
  const G5 = {
    begin() { J.c = 0; this.setup(); toast('TAP AN ARROW TO PULL IT \u00b7 HOLD THE STUCK ONES', 2.8); },
    setup() { (J.ar || []).forEach(a => a.g.parent && a.g.parent.remove(a.g)); const zc = BUTTZ[J.c], st = Math.random() * 4 | 0; J.ar = [];
      for (let i = 0; i < 4; i++) { let y, z, n = 0; do { const a = rnd(0, 6.283), r = rnd(0.08, 0.58); z = zc + Math.cos(a) * r; y = BUTTY + Math.sin(a) * r; } while (J.ar.some(q => Math.hypot(q.z - z, q.y - y) < 0.2) && ++n < 30);
        const g = own(arrowG()); g.position.set(BUTTX, y, z); g.rotation.set(rnd(-0.12, 0.12), rnd(-0.15, 0.15), rnd(-0.1, 0.1)); J.ar.push({ g, y, z, stuck: i === st, out: false }); }
      J.hold = null; },
    tip: a => V(BUTTX - 0.45, a.y, a.z),
    press() { if (J.flies.length) return; let best = null, bd = TAPR() * 1.2; for (const a of J.ar) { if (a.out) continue; const d = dist(scrW(G5.tip(a))); if (d < bd) { bd = d; best = a; } }
      if (!best) { if (dist(scrW(V(BUTTX, BUTTY, BUTTZ[J.c]))) < TAPR() * 2.4) miss('NOTHING THERE \u00b7 TAP AN ARROW', 1.2); return; }
      if (best.stuck) { J.hold = best; J.ht = 0; return; } this.pull(best); },
    pull(a) { a.out = true; pop(); addGold(2); fly(a.g, V(QUIV.x, FL + 0.9, QUIV.z), 0.45, 0.6, () => { a.g.visible = false; tone(880, 0.03, 0.12, 'triangle'); });
      if (J.ar.every(q => q.out)) { ding(); J.c++; if (J.c >= BUTTZ.length) NEXT(finishGame, 1.0); else { toast('BUTT CLEAR \u00b7 NEXT ONE', 1.1); NEXT(() => { G5.setup(); }, 1.0); } } },
    release() { if (J.hold && J.ht < 0.8) toast('IT IS STUCK \u00b7 HOLD IT', 1.1); J.hold = null; },
    tick(dt) { if (!J.hold || !ptr.down) return; J.ht += dt; J.hold.g.rotation.y = Math.sin(J.t * 40) * 0.06; if ((J.cr = (J.cr || 0) + dt) > 0.15) { J.cr = 0; tone(260, 0.03, 0.08, 'triangle'); } if (J.ht >= 0.8) { const a = J.hold; J.hold = null; this.pull(a); } },
    card() { const n = J.ar.filter(a => !a.out).length, st = J.ar.some(a => a.stuck && !a.out); return [J.hold ? 'KEEP HOLDING' : 'TAP AN ARROW', lab('BUTT ' + Math.min(3, J.c + 1) + ' / 3') + lst([[RED, 'ARROWS', n + ' LEFT', !n], ['#7a4a28', 'STUCK \u00b7 HOLD', st ? '1' : '\u2713', !st]]) + (J.hold ? gauge(J.ht / 0.8, 1, 1) : ''), 'r' + J.c + '_' + n + '_' + (J.hold ? Math.round(J.ht * 20) : -1)]; },
    hint() { const a = J.ar.find(q => !q.out && !q.stuck) || J.ar.find(q => !q.out); return a ? [G5.tip(a), a.stuck ? 'HOLD' : 'TAP'] : null; },
    shot() { return [V(BUTTX - 0.25, BUTTY, BUTTZ[Math.min(J.c, 2)]), 1.8, 1.7, 0.14, 1.8, -Math.PI / 2, 2.8]; },
    end() {} };
  // ================= JOB 6: STACK THE WEAPON RACK (tap, tap) — pick a weapon off the trestle, tap the slot with its shape =================
  const RACKSPOT = (i) => V(WALLX - 0.12, 1.5, SLOTZ[i]);
  const G6 = {
    begin() { J.w = shuffle(KINDS.slice()).map((k, i) => { const g = own(wpn(k)); g.position.set(37.6, 0.79, -420.6 + i * 0.58); g.rotation.set(0, 0, Math.PI / 2); return { g, k, home: g.position.clone(), on: -1 }; }); J.fill = KINDS.map(() => false); J.sel = null; toast('TAP A WEAPON \u00b7 THEN THE SLOT WITH ITS SHAPE', 2.8); },
    press() { if (J.flies.length) return; let bw = null, bd = TAPR() * 1.3; for (const w of J.w) { if (w.on >= 0) continue; const d = dist(scrW(w.g.position)); if (d < bd) { bd = d; bw = w; } }
      let bs = -1, sd = TAPR() * 1.6; SLOTZ.forEach((_, i) => { if (J.fill[i]) return; const d = dist(scrW(RACKSPOT(i))); if (d < sd) { sd = d; bs = i; } });
      if (bw && (!J.sel || bd < sd || bs < 0)) { if (J.sel) J.sel.g.position.copy(J.sel.home); J.sel = bw; bw.g.position.y = bw.home.y + 0.14; pop(); return; }
      if (bs >= 0 && J.sel) { const w = J.sel; if (KINDS[bs] !== w.k) { miss('WRONG SHAPE \u00b7 THAT SLOT TAKES A ' + KINDS[bs].toUpperCase(), 1.5); return; }
        J.sel = null; J.fill[bs] = true; w.on = bs; w.g.rotation.set(0, 0, 0); fly(w.g, RACKSPOT(bs), 0.4, 0.25, () => { thud(); tone(1800, 0.03, 0.3, 'triangle'); addGold(3); if (J.fill.every(Boolean)) { ding(); NEXT(finishGame, 0.9); } }); return; }
      if (bs >= 0 && !J.sel) toast('PICK A WEAPON FIRST', 1.0); },
    card() { const n = J.fill.filter(Boolean).length; return [J.sel ? 'TAP THE ' + J.sel.k.toUpperCase() + ' SLOT' : 'TAP A WEAPON', lst(['sword', 'spear', 'axe'].map(k => [k === 'sword' ? '#c0c4cc' : k === 'spear' ? '#8a6a42' : '#5a5654', k.toUpperCase() + 'S', KINDS.filter((q, i) => q === k && J.fill[i]).length + ' / 2', KINDS.every((q, i) => q !== k || J.fill[i])])), 'w' + n + '_' + (J.sel ? J.sel.k + J.sel.home.z : '')]; },
    hint() { if (!J.sel) { const w = J.w.find(q => q.on < 0); return w ? [w.g.position.clone(), 'TAP'] : null; } const i = KINDS.findIndex((k, j) => k === J.sel.k && !J.fill[j]); return i >= 0 ? [RACKSPOT(i), 'TAP'] : null; },
    shot() { return [V(38.4, 1.15, -419.3), 5.4, 2.1, 0.2, 3.0, -Math.PI / 2, 6.4]; },
    end() {} };
  // ================= PART B (s95) =================
  const GUARD_T = ['#52525b', '#27272a', '#09090b'];
  const gFox = {}, guardFox = (k, o = {}) => gFox[k] || (gFox[k] = (() => { const f = kit.makeFox({ key: 'brkG' + k, torso: o.torso || GUARD_T, crest: 'M', gear: o.gear ?? 'sword', outfit: 'armor', mood: 'stern' }); f.visible = false; G.add(f); return f; })());
  const hideGuards = () => Object.values(gFox).forEach(f => { f.visible = false; f.rotation.set(0, 0, 0); const P0 = f.userData.P; if (P0 && P0.head) P0.head.rotation.x = 0; });
  const wideTex = {}, wideTag = (txt, bg, fg = '#ffffff', s = 0.62) => { const t = wideTex[txt + bg] || (wideTex[txt + bg] = CT(256, 96, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; g.font = '900 44px Archivo, sans-serif'; g.fillText(txt, 20, H / 2 + 3); }));
    if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); sp.scale.set(s, s * 0.375, 1); sp.renderOrder = 6; return sp; };
  const walkers = []; const walkTo = (f, to, sp, then) => { const d = f.position.distanceTo(to); f.rotation.y = Math.atan2(to.x - f.position.x, to.z - f.position.z); fly(f, to, Math.max(0.3, d / sp), 0, then); walkers.push(f); };
  // braziers: 6 NEW standing braziers along the hall (light them at dusk; they stay lit until 7 in the morning)
  const fireM2 = new THREE.MeshBasicMaterial({ color: '#ff9a3a', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const BRZ = [[-4.2, -418], [4.2, -418], [-4.2, -424], [4.2, -424], [-4.2, -430], [4.2, -430]].map(([x, z]) => { cyl(G, 0.06, 0.06, 1.0, '#3d3b3a', x, FL + 0.5, z, 8); cyl(G, 0.3, 0.06, 0.1, '#3d3b3a', x, FL + 0.05, z, 10); cyl(G, 0.42, 0.28, 0.3, '#3d3b3a', x, FL + 1.12, z, 12);
    const coal = cyl(G, 0.36, 0.36, 0.03, '#2a2220', x, FL + 1.26, z, 12); const fl = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 8), fireM2); fl.position.set(x, FL + 1.56, z); fl.visible = false; G.add(fl); ring(x, z, 0.42); return { x, z, fl, coal, lit: false }; });
  const setLit = (b, on) => { b.lit = on; b.fl.visible = on; b.fl.scale.setScalar(1); b.coal.material = LM(on ? '#ff6a2a' : '#2a2220'); };
  let lastH = null;
  const BAND7 = [0.6, 0.85];
  const G7 = {
    begin() { BRZ.forEach(b => setLit(b, false)); J.order = shuffle([0, 1, 2, 3, 4, 5]); J.i = 0; J.ph = 'pick'; J.lvl = 0; J.mk = BRZ.map((b, i) => { const s = own(tagSprite(String(J.order.indexOf(i) + 1), '#d6d2cb', INK, 0.4)); s.position.set(b.x, FL + 2.3, b.z); return s; }); this.mark(); toast('LIGHT THEM IN ORDER · TAP, THEN HOLD THE BELLOWS', 3); },
    mark() { J.mk.forEach((s, i) => { const n = J.order.indexOf(i); s.visible = n >= J.i; s.material.map = tagFor(String(n + 1), n === J.i ? YEL : '#d6d2cb', INK); }); },
    cur() { return BRZ[J.order[J.i]]; },
    press() { if (J.ph === 'pick') { let best = -1, bd = TAPR() * 1.6; BRZ.forEach((b, i) => { if (b.lit) return; const d = dist(scrW(V(b.x, FL + 1.3, b.z))); if (d < bd) { bd = d; best = i; } }); if (best < 0) return;
        if (best !== J.order[J.i]) { miss('NOT THAT ONE · FOLLOW THE NUMBERS', 1.4); return; } J.ph = 'blow'; J.lvl = 0; pop(); toast('HOLD THE BELLOWS · LET GO ON THE GREEN', 1.8); return; }
      if (J.ph === 'blow') J.hold = true; },
    release() { if (!J.hold) return; J.hold = false; const b = this.cur(); if (J.lvl < BAND7[0]) { toast('TOO SMALL · HOLD AGAIN', 1.1); return; }
      setLit(b, true); tone(180, 0.06, 0.5, 'sawtooth'); noise(0.4, 0.05, 600); addGold(3); J.i++; J.ph = 'pick'; J.lvl = 0; if (J.i >= BRZ.length) { ding(); toast('THE HALL IS LIT', 1.4); NEXT(finishGame, 1.0); } else { this.mark(); toast('LIT · NEXT ' + (J.i + 1), 1.0); } },
    tick(dt) { const b = this.cur(); if (J.ph !== 'blow' || !b) return; if (J.hold) { J.lvl += dt * 0.55; if ((J.bl = (J.bl || 0) + dt) > 0.3) { J.bl = 0; noise(0.25, 0.03, 300); } }
      b.fl.visible = J.lvl > 0.05; b.fl.scale.setScalar(Math.max(0.2, J.lvl * 1.4)); if (J.lvl > BAND7[1]) { J.hold = false; J.lvl = 0; b.fl.visible = false; miss('FLARE UP · TOO MUCH AIR', 1.6); noise(0.5, 0.08, 200); } },
    card() { return [J.ph === 'pick' ? 'TAP BRAZIER ' + (J.i + 1) : 'HOLD · LET GO ON GREEN', lab('LIT ' + J.i + ' / 6') + gauge(J.ph === 'blow' ? J.lvl : 0, BAND7[0], BAND7[1]), J.ph + J.i + '_' + Math.round(J.lvl * 60)]; },
    hint() { const b = this.cur(); return b ? [V(b.x, FL + 1.3, b.z), J.ph === 'pick' ? 'TAP' : 'HOLD'] : null; },
    shot() { return [V(0, 1.0, -424), 9.4, 9, 1.0, 7, 0, 11]; },
    end() { if (J && J.i < BRZ.length) BRZ.forEach(b => { if (!b.lit) b.fl.visible = false; }); } };
  // guard duty: visitors walk in through the door; read the pass, LET IN or STOP
  const VISIT = [{ name: 'FLINT', pass: 'MERU GUARD', ok: 1, torso: GUARD_T, outfit: 'armor' }, { name: 'ASH', pass: 'MERU GUARD', ok: 1, torso: GUARD_T, outfit: 'armor' }, { name: 'COOK TOM', pass: 'KITCHEN', ok: 1, torso: ['#f3f2f2', '#e7e5ef', '#a8a29a'], outfit: 'vest' },
    { name: 'MESSENGER', pass: 'ROYAL POST', ok: 1, torso: ['#1f2650', '#e6b45a', '#111827'], outfit: 'coat' }, { name: 'SGT. BISCUIT', pass: 'MINIMART', ok: 1, torso: ['#6b7340', '#4a5420', '#2e3414'], outfit: 'vest' },
    { name: 'BRIK', pass: 'MERU GAURD', ok: 0, why: 'SPELT WRONG', torso: GUARD_T, outfit: 'armor' }, { name: 'STRANGER', pass: '', ok: 0, why: 'NO PASS', torso: ['#3a3a3a', '#1f1f1f', '#0a0a0a'], outfit: 'coat' },
    { name: 'MASKED FOX', pass: 'MERU GUARD', ok: 0, why: 'NO SEAL', noSeal: 1, torso: ['#3a2f4a', '#211a2b', '#0e0a14'], outfit: 'coat' }, { name: 'OLD PELL', pass: 'VISITOR 1999', ok: 0, why: 'EXPIRED', torso: ['#1f2937', '#e6b45a', '#111827'], outfit: 'vest' }];
  const vFox = {}, visFox = i => vFox[i] || (vFox[i] = (() => { const v = VISIT[i], f = kit.makeFox({ key: 'brkV' + i, torso: v.torso, crest: 'M', outfit: v.outfit, gear: 'none', mood: v.ok ? 'happy' : 'smug' }); f.visible = false; G.add(f); return f; })());
  const passTex = {}, passFor = i => passTex[i] || (passTex[i] = CT(256, 176, (g, W2, H) => { const v = VISIT[i]; g.fillStyle = '#ffffff'; g.fillRect(0, 0, W2, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H - 8); g.fillStyle = INK; g.textBaseline = 'middle';
    if (!v.pass) { g.font = '900 40px Archivo, sans-serif'; g.fillText('NO PASS', 22, H / 2); return; } g.fillStyle = NAVY; g.fillRect(4, 4, W2 - 8, 40); g.fillStyle = '#ffffff'; g.font = '900 22px Archivo, sans-serif'; g.fillText('PASS · BARRACKS', 16, 25);
    g.fillStyle = INK; g.font = '900 30px Archivo, sans-serif'; g.fillText(v.pass, 16, 82); g.font = '800 24px Archivo, sans-serif'; g.fillText(v.name, 16, 128); if (!v.noSeal) { g.fillStyle = GOLD; g.beginPath(); g.arc(W2 - 44, 130, 26, 0, 7); g.fill(); g.fillStyle = INK; g.font = '900 28px Archivo, sans-serif'; g.fillText('M', W2 - 54, 132); } }));
  const GATE = V(0, FL, -403.6);
  const G8 = {
    begin() { const ok = shuffle([0, 1, 2, 3, 4]).slice(0, 4), bad = shuffle([5, 6, 7, 8]).slice(0, 2); J.q = shuffle([...ok, ...bad]); J.i = 0; J.ph = 'walk'; this.next(); toast('READ EACH PASS · LET IN OR STOP', 2.8); },
    next() { const i = J.q[J.i], f = visFox(i); f.position.set(0, FL, -400.2); f.visible = true; J.ph = 'walk'; walkTo(f, GATE, 1.4, () => { if (!J) return; f.rotation.y = Math.PI; J.ph = 'ask';
        J.pass = own(new THREE.Sprite(new THREE.SpriteMaterial({ map: passFor(i), depthTest: false }))); J.pass.scale.set(touch ? 0.9 : 0.72, (touch ? 0.9 : 0.72) * 0.69, 1); J.pass.renderOrder = 6; J.pass.position.set(0.55, FL + 1.55, GATE.z);
        J.yes = own(wideTag('LET IN', '#2f7a4a')); J.yes.position.set(-0.75, FL + 0.75, GATE.z - 0.1); J.no = own(wideTag('STOP', RED)); J.no.position.set(0.75, FL + 0.75, GATE.z - 0.1); }); },
    press() { if (J.ph !== 'ask') return; const dy = dist(scrW(J.yes.position)), dn = dist(scrW(J.no.position)), R = TAPR() * 1.6; if (Math.min(dy, dn) > R) return; const yes = dy < dn, v = VISIT[J.q[J.i]], f = visFox(J.q[J.i]);
      [J.pass, J.yes, J.no].forEach(s => { s.visible = false; }); J.ph = 'walk';
      if (yes && v.ok) { pop(); addGold(3); toast('PASS GOOD · IN YOU GO, ' + v.name, 1.3); walkTo(f, V(-5, FL, -406.5), 1.4, () => this.after(f)); }
      else if (!yes && !v.ok) { ding(); addGold(5); toast('CAUGHT! ' + v.why, 1.5); walkTo(f, V(0, FL, -400.2), 1.8, () => this.after(f)); }
      else if (yes) { miss('AN INTRUDER GOT IN · ' + v.why, 1.8); walkTo(f, V(-5, FL, -406.5), 1.4, () => this.after(f)); }
      else { miss('THAT PASS WAS REAL', 1.6); walkTo(f, V(0, FL, -400.2), 1.4, () => this.after(f)); } },
    after(f) { if (!J) return; f.visible = false; J.i++; if (J.i >= J.q.length) NEXT(finishGame, 0.6); else NEXT(() => G8.next(), 0.5); },
    card() { return [J.ph === 'ask' ? 'LET IN OR STOP?' : 'NEXT VISITOR…', lab('VISITOR ' + Math.min(6, J.i + 1) + ' / 6') + lab('CHECK: SPELLING · THE GOLD SEAL · THE DATE'), 'v' + J.i + J.ph]; },
    hint() { if (J.ph !== 'ask') return null; return [(VISIT[J.q[J.i]].ok ? J.yes : J.no).position.clone(), 'TAP']; },
    shot() { return [V(0, FL + 1.15, GATE.z), 2.8, 2.2, 0.16, 2.6, Math.PI, 3.8]; },
    end() { Object.values(vFox).forEach(f => { f.visible = false; }); } };
  // inspection: 5 guards in a line, one thing is wrong each round
  const LINEX = [-3.2, -1.6, 0, 1.6, 3.2], LINEZ = -427;
  const FAULTS = [['backwards', 'FACING THE WRONG WAY'], ['lean', 'SLOUCHING'], ['red', 'WRONG UNIFORM'], ['nosword', 'NO SWORD'], ['asleep', 'ASLEEP ON DUTY']];
  const G9 = {
    begin() { J.r = 0; J.f = shuffle(FAULTS.slice()); this.round(); toast('TAP THE GUARD WHO IS WRONG', 2.6); },
    round() { hideGuards(); J.bad = Math.random() * 5 | 0; const fk = J.f[J.r][0]; LINEX.forEach((x, i) => { let f = guardFox(i); if (i === J.bad && fk === 'red') f = guardFox('red', { torso: ['#a8323e', '#7a1f2a', '#3a0d12'] }); if (i === J.bad && fk === 'nosword') f = guardFox('nos', { gear: 'none' });
        f.position.set(x, FL, LINEZ); f.rotation.set(0, 0, 0); f.visible = true; kit.animFox(f, 0.016, 0, false); if (i === J.bad) { if (fk === 'backwards') f.rotation.y = Math.PI; if (fk === 'lean') f.rotation.z = 0.22; const P0 = f.userData.P; if (fk === 'asleep' && P0 && P0.head) P0.head.rotation.x = 0.55; } }); },
    press() { if (J.pause > 0) return; let best = -1, bd = TAPR() * 1.5; LINEX.forEach((x, i) => { const d = dist(scrW(V(x, FL + 1.0, LINEZ))); if (d < bd) { bd = d; best = i; } }); if (best < 0) return;
      if (best !== J.bad) { miss('HE LOOKS FINE · LOOK AGAIN', 1.4); return; } ding(); addGold(4); toast(J.f[J.r][1] + ' · SPOTTED', 1.3); J.r++; if (J.r >= J.f.length) NEXT(finishGame, 1.0); else NEXT(() => G9.round(), 1.0); },
    card() { return ['TAP THE WRONG GUARD', lab('ROUND ' + Math.min(5, J.r + 1) + ' / 5') + lst(FAULTS.map(([k, t]) => ['#52525b', t, J.f.slice(0, J.r).some(q => q[0] === k) ? '\u2713' : '', J.f.slice(0, J.r).some(q => q[0] === k)])), 'i' + J.r]; },
    hint() { return [V(LINEX[J.bad], FL + 1.0, LINEZ), 'TAP']; },
    shot() { return [V(0, FL + 1.05, LINEZ), 7.8, 2.2, 0.14, 4, 0, 9]; },
    end() { hideGuards(); } };
  // restuff the straw dummies (the 3 dummies are in meru2-barracks.js at x 14 / 17 / 20, z -434; their front faces z -433.69)
  const DUMX = [14, 17, 20], DUMZ = -433.68, BALE = V(18.7, FL, -431.7);
  { box(G, 0.9, 0.5, 0.6, '#d6b86a', BALE.x, FL + 0.25, BALE.z); for (const s of [-0.22, 0.22]) box(G, 0.92, 0.04, 0.62, '#8a6a42', BALE.x + s, FL + 0.25, BALE.z).rotation.y = 0; boxC(BALE.x - 0.5, BALE.x + 0.5, BALE.z - 0.35, BALE.z + 0.35); }
  const G10 = {
    begin() { J.c = 0; this.holes(); toast('TAP A HOLE TO STUFF IT · 2 HANDFULS EACH', 2.8); },
    holes() { (J.h || []).forEach(h => { h.m.parent && h.m.parent.remove(h.m); h.t.parent && h.t.parent.remove(h.t); }); const x0 = DUMX[J.c]; J.h = [];
      for (let i = 0; i < 4; i++) { let x, y, n = 0; do { x = x0 + rnd(-0.2, 0.2); y = FL + rnd(0.95, 1.65); } while (J.h.some(h => Math.hypot(h.x - x, h.y - y) < 0.16) && ++n < 30);
        const m = own(new THREE.Mesh(new THREE.CircleGeometry(0.065, 10), LM('#4a3018'))); m.position.set(x, y, DUMZ); m.renderOrder = 3; const t = own(new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 5), LM('#e8cf86'))); t.position.set(x, y, DUMZ + 0.06); t.rotation.x = Math.PI / 2; J.h.push({ x, y, m, t, n: 0 }); } },
    press() { if (J.flies.length) return; let best = null, bd = TAPR() * 1.2; for (const h of J.h) { if (h.n >= 2) continue; const d = dist(scrW(V(h.x, h.y, DUMZ))); if (d < bd) { bd = d; best = h; } }
      if (!best) { if (dist(scrW(V(DUMX[J.c], FL + 1.3, DUMZ))) < TAPR() * 2.2) miss('NO HOLE THERE', 1.1); return; }
      const tuft = own(new THREE.Mesh(new THREE.DodecahedronGeometry(0.06, 0), LM('#e8cf86'))); tuft.position.set(BALE.x, FL + 0.55, BALE.z); best.n++; tone(500 + best.n * 120, 0.04, 0.12, 'triangle');
      fly(tuft, V(best.x, best.y, DUMZ + 0.02), 0.32, 0.4, () => { tuft.visible = false; rub(); addGold(1); if (best.n >= 2) { best.m.visible = false; best.t.visible = false; }
        if (J.h.every(h => h.n >= 2)) { thud(); ding(); J.c++; toast('PUNCH TEST · HOLDS', 1.1); if (J.c >= DUMX.length) NEXT(finishGame, 1.0); else NEXT(() => { G10.holes(); }, 1.0); } }); },
    card() { const n = J.h.filter(h => h.n < 2).length; return ['TAP A HOLE', lab('DUMMY ' + Math.min(3, J.c + 1) + ' / 3') + lst([['#4a3018', 'HOLES', n + ' LEFT', !n]]), 'd' + J.c + '_' + J.h.map(h => h.n).join('')]; },
    hint() { const h = J.h.find(q => q.n < 2); return h ? [V(h.x, h.y, DUMZ), 'TAP'] : null; },
    shot() { const x = DUMX[Math.min(J.c, 2)]; return [V(x + 0.6, FL + 1.25, -434), 2.0, 1.4, 0.16, 1.7, 0.15, 2.8]; },
    end() {} };
  // morning drill: a squad marches in place; tap on every beat, keep still on HALT
  const SQX = [12.5, 14.5, 16.5, 18.5], SQZ = -410, BEAT = 0.6, NNOTE = 20;
  const G11 = {
    begin() { hideGuards(); SQX.forEach((x, i) => { const f = guardFox(i); f.position.set(x, FL, SQZ); f.rotation.set(0, 0, 0); f.visible = true; });
      const halts = new Set(); while (halts.size < 3) halts.add(3 + (Math.random() * (NNOTE - 4) | 0)); J.t0 = J.t + 4 * BEAT; J.notes = [...Array(NNOTE).keys()].map(i => ({ t: J.t0 + i * BEAT, halt: halts.has(i), j: null })); J.cnt = -1; J.hits = 0; toast('TAP ON EVERY BEAT · KEEP STILL ON HALT', 2.4); },
    press() { const now = J.t; let best = null, bd = 0.2; for (const n of J.notes) { if (n.j) continue; const d = Math.abs(n.t - now); if (d < bd) { bd = d; best = n; } }
      if (!best) { if (J.notes.some(n => !n.j && Math.abs(n.t - now) < 0.45)) miss('OUT OF STEP', 0.8); return; }
      if (best.halt) { best.j = 'x'; miss('HALT! FEET STILL', 1.0); return; } best.j = 'ok'; J.hits++; addGold(1); tone(160, 0.07, 0.12, 'triangle'); },
    tick(dt) { const now = J.t; const ci = Math.floor((now - (J.t0 - 4 * BEAT)) / BEAT); if (ci !== J.cnt && ci >= 0 && ci < 4) { J.cnt = ci; toast(String(4 - ci) === '1' ? 'FORWARD…' : 'READY · ' + (4 - ci), 0.5); tone(440, 0.04, 0.1); }
      let marching = now >= J.t0 - 0.1; for (const n of J.notes) { if (!n.beeped && now >= n.t) { n.beeped = true; tone(n.halt ? 300 : 90, n.halt ? 0.05 : 0.09, 0.2, n.halt ? 'square' : 'sine'); toast(n.halt ? 'HALT!' : (J.notes.indexOf(n) % 2 ? 'RIGHT' : 'LEFT'), 0.45); }
        if (!n.j && now > n.t + 0.2) { if (n.halt) { n.j = 'ok'; addGold(1); } else { n.j = 'x'; miss('MISSED A STEP', 0.7); } } if (n.halt && Math.abs(now - n.t) < BEAT * 0.5) marching = false; }
      SQX.forEach((_, i) => kit.animFox(guardFox(i), dt, marching ? 1.3 : 0, false));
      const last = J.notes[J.notes.length - 1]; if (now > last.t + 0.4 && !J.pause) { ding(); NEXT(finishGame, 0.6); } },
    card() { const now = J.t, Q = Math.round(now * 20); const lane = '<div style="position:relative;height:30px;border:2px solid #201e1d;background:#ffffff;margin-top:6px;overflow:hidden"><div style="position:absolute;left:15%;top:0;bottom:0;width:3px;background:#201e1d"></div>' +
        J.notes.filter(n => n.t - now > -0.3 && n.t - now < 2.4).map(n => { const l = 15 + (n.t - now) / 2.4 * 85; return '<div style="position:absolute;top:5px;left:calc(' + l.toFixed(1) + '% - 8px);width:16px;height:16px;box-sizing:border-box;border:2px solid #201e1d;background:' + (n.j === 'ok' ? '#9fd7a8' : n.j === 'x' ? '#cfcac3' : n.halt ? '#ec3013' : '#ffd23a') + ';color:#fff;font:900 11px Archivo,sans-serif;line-height:12px;text-align:center">' + (n.halt ? '\u2715' : '') + '</div>'; }).join('') + '</div>';
      const left = J.notes.filter(n => !n.j).length; return [now < J.t0 ? 'GET READY' : 'TAP ON THE LINE', lab('STEPS ' + J.hits + ' · ' + left + ' TO GO · RED = HALT') + lane, 'm' + Q]; },
    hint() { return null; },
    shot() { return [V(15.5, FL + 1.0, SQZ), 7.0, 2.2, 0.24, 4, 0, 8]; },
    end() { hideGuards(); } };
  // ================= SPAR (2D: bout card, he stops you at 25%, XP) — a real 3D bout in the circle =================
  const CIRC = { x: 24, z: -422, r: 4.1 }, SPARRING = [26.6, -424.6];
  { const r1 = cyl(G, 0.5, 0.5, 0.012, RED, SPARRING[0], FL + 0.03, SPARRING[1], 22), r2 = cyl(G, 0.42, 0.42, 0.014, INK, SPARRING[0], FL + 0.032, SPARRING[1], 22); r1.renderOrder = r2.renderOrder = 1; }
  const inCirc = (o, nx, nz) => { const dx = nx - CIRC.x, dz = nz - CIRC.z, d = Math.hypot(dx, dz); if (d > CIRC.r) { nx = CIRC.x + dx / d * CIRC.r; nz = CIRC.z + dz / d * CIRC.r; } o.x = nx; o.z = nz; };
  let CBs = null, SPf = null, SP = null; const moaHome = moa ? moa.position.clone() : null;
  const sparAudio = { tone: (f, d, v, type) => tone(f, v, d, type), burst: (d, f, v) => noise(d, v, f * 0.5) };
  const BOUT = document.createElement('div'); BOUT.style.cssText = 'position:fixed;left:16px;top:22%;z-index:31;pointer-events:none;display:none;font-family:Archivo,sans-serif;max-width:min(86vw,420px)';
  BOUT.innerHTML = '<div style="background:#201e1d;color:#ffd23a;font-weight:900;font-size:13px;letter-spacing:3px;padding:6px 10px">THE BARRACKS PRESENTS</div><div style="background:#f3f2f2;border:2px solid #201e1d;border-top:0;padding:10px 12px 12px"><div style="font-weight:900;font-size:44px;line-height:1;color:#201e1d">SPAR</div><div style="font-weight:900;font-size:18px;color:#1e3a8a;margin-top:4px">VS THE MASTER OF ARMS</div><div style="height:2px;background:#201e1d;margin:10px 0 8px"></div><div style="font-weight:800;font-size:13px;color:#201e1d;line-height:1.5">1 MELEE · 2 RANGE · MOVE TO DODGE<br>PUT HIM ON THE SAND TO WIN<br>HE STOPS YOU AT 25% · NOBODY GETS HURT</div></div>';
  document.body.appendChild(BOUT);
  async function sparStart(P) { if (!moa || SP || busy) return; if (!CBs) { const { createCombat } = await import('../engine/combat.js'); CBs = createCombat({ THREE, scene, audio: sparAudio, move: (o, nx, nz) => inCirc(o, nx, nz) });
      SPf = CBs.add({ key: 'barracksMasterOfArms', x: moaHome.x, z: moaHome.z, face: mP.ry, c: moa }, { hp: 150, dmg: 9, speed: 3.3, cd: 1.1, wind: 0.45 }); SPf.anim = (dt, spd) => kit.animFox(moa, dt, spd, false); }
    if (SP || busy) return; CBs.reset(); SPf.n.x = moaHome.x; SPf.n.z = moaHome.z; SPf.n.face = Math.atan2(SPARRING[0] - moaHome.x, SPARRING[1] - moaHome.z); Object.assign(P, { x: SPARRING[0], z: SPARRING[1], sp: 0 }); if ('yaw' in P) P.yaw = Math.atan2(moaHome.x - P.x, moaHome.z - P.z);
    SP = { ph: 'card', t: 0, cnt: -1 }; BOUT.style.display = 'block'; BOUT.style.opacity = '1'; tone(392, 0.06, 0.4); tone(523, 0.05, 0.6, 'sine', 0.2); }
  function sparEnd(res) { if (!SP) return; SP = null; BOUT.style.display = 'none'; hideCard(); if (SPf) { SPf.hostile = false; SPf.down = false; SPf.state = 'idle'; SPf.hp = SPf.max; } if (moa) { moa.position.copy(moaHome); moa.rotation.set(0, mP.ry, 0); }
    if (res === 'abort') return; if (res === 'loss') { save.setStat(pre + 'SparLosses', save.stat(pre + 'SparLosses', 0) + 1); save.addXp(15); toast('BOUT OVER · +15 XP · YOU TOOK YOUR LUMPS', 2.6); sayTo(kM, [lnM('Again, when you are ready.')]); return; }
    const first = !save.stat(pre + 'SparWins', 0); save.setStat(pre + 'SparWins', save.stat(pre + 'SparWins', 0) + 1); save.addXp(120); if (first) save.setStat('statPoints', save.stat('statPoints', 0) + 1);
    ding(); toast('YOU WIN THE BOUT · +120 XP' + (first ? ' · +1 STAT POINT' : ''), 3); setTimeout(() => sparWinTalk(first), 900); }
  const sparQs = () => [['How do I earn EXPERIENCE?', ['Everything you put down pays. So does every LOCK you talk out of its business, and every job you see through to the end.', 'Bouts in this circle pay as well \u2014 win or lose, though I would rather you won.', 'Each rank costs a little more than the last, so the slow way up is to fight the same weak thing forever. Do not.']],
    ['What do the four STATS do?', ['ATTACK is what your blade takes off them. DEFENSE is what you shrug off before it reaches you.', 'SPEED is your feet, your reach, and how often a blow finds nothing but air where you were standing.', 'SMARTS is what your scanner will tell you, and what a clever fox can talk their way into. Sharp enough and doors open that never open for a big arm.']],
    ['What are TRAITS?', ['Every THIRD rank, instead of another point, you pick a knack. Locks. A silver tongue at the market. Wind that will not quit.', 'One each, and they stay with you. Choose for the fox you mean to become, not the one limping out of my circle today.']],
    ['How do I spend a point?', ['You do not go looking. The window finds you the moment you rank up and waits until you have chosen.', 'ONE point a rank \u2014 only one. So spend it on whatever has been nearly killing you, not on whatever sounds grandest.']]];
  function sparAsk(again) { const ch = sparQs().map(([q, rs]) => ({ text: q.toUpperCase(), pick: () => sayTo(kM, rs.map(lnM), () => sparAsk(true)) }));
    ch.push({ text: 'NO QUESTIONS. THANK YOU, MASTER.', bye: true, pick: () => sayTo(kM, [lnM('Then get out of my circle and go be useful. Come back when you want the other lesson.')]) });
    sayTo(kM, [{ ...lnM(again ? 'Anything else?' : 'Double. Now \u2014 any questions about LEVELLING UP, while I am still winded enough to answer them?'), choices: ch }]); }
  function sparWinTalk(first) { if (!kM || busy) return; if (!first) { sayTo(kM, [lnM('Well struck.'), lnM('Again, when you are ready.')]); return; }
    sayTo(kM, [lnM('Hold. Stand up \u2014 that was clean. You had me, and I do not say that to be kind.'), lnM('And the King pays DOUBLE for putting his own weapons master on the sand. 120 EXPERIENCE, the lot of it yours.'), { who: 'player', text: 'Double?' }], () => sparAsk(false)); }
  function sparTick(dt, P, fox) { SP.t += dt; if (SP.ph === 'card') { if (SP.t > 2.6) { BOUT.style.display = 'none'; SP.ph = 'count'; SP.t = 0; } if (moa) { moa.rotation.y = Math.atan2(P.x - moa.position.x, P.z - moa.position.z); kit.animFox(moa, dt, 0, false); } inCirc(P, P.x, P.z); return; }
    if (SP.ph === 'count') { const c = Math.floor(SP.t); if (c !== SP.cnt) { SP.cnt = c; toast(c < 3 ? String(3 - c) : 'FIGHT!', 0.8); tone(c < 3 ? 520 : 880, 0.07, c < 3 ? 0.15 : 0.5, 'square'); } if (moa) kit.animFox(moa, dt, 0, false); inCirc(P, P.x, P.z); if (SP.t > 3.2) { SP.ph = 'fight'; CBs.engage(); } return; }
    const r = CBs.update(dt, { x: P.x, z: P.z, y: P.y || 0, face: P.yaw || 0 }, fox); if (fox) CBs.pose(fox); inCirc(P, P.x, P.z);
    const me = CBs.P.hp, him = Math.max(0, SPf.hp);
    setCard('spar' + Math.round(me) + '_' + Math.round(him), head('SPAR \u00b7 MASTER OF ARMS', 'BOUT', MOA.color) + '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>1 MELEE \u00b7 2 RANGE</span><span style="color:#f3f2f2;white-space:nowrap">TALK \u00b7 YIELD</span></div><div style="padding:8px 10px 10px">' +
      lab('YOU \u00b7 ' + Math.round(me)) + '<div style="position:relative;height:14px;border:2px solid #201e1d;background:#ffffff;margin-top:3px"><div style="position:absolute;top:0;bottom:0;left:0;width:' + me + '%;background:#201e1d"></div><div style="position:absolute;top:-2px;bottom:-2px;left:25%;width:2px;background:#ec3013"></div></div>' +
      lab('MASTER OF ARMS \u00b7 ' + Math.round(him)) + '<div style="position:relative;height:14px;border:2px solid #201e1d;background:#ffffff;margin-top:3px"><div style="position:absolute;top:0;bottom:0;left:0;width:' + (him / 150 * 100).toFixed(1) + '%;background:#1e3a8a"></div></div></div>');
    if (me <= 25) { tone(220, 0.06, 0.6, 'sawtooth'); sparEnd('loss'); return; } if (SPf.down || r.allDown) { sparEnd('win'); } }
  function spar(kind, P, fox) { if (!SP) return false; if (SP.ph === 'fight') CBs.attack(kind, { x: P.x, z: P.z, y: P.y || 0, face: P.yaw || 0 }, fox, { meleeDmg: 30, laserDmg: 15 }); return true; }
  const sparAskStart = () => sayTo(kM, [{ ...lnM('Step in the circle? I will not go easy.'), choices: [{ text: 'SPAR!', pick: () => sparStart(lastP) }, { text: 'NOT NOW', bye: true, pick: () => {} }] }]);
  const GD = { bunks: G1, armour: G2, mess: G3, sharpen: G4, arrows: G5, rack: G6, braziers: G7, guard: G8, inspect: G9, dummies: G10, drill: G11 };
  // ================= run a game =================
  function startGame(g, P) { if (busy || !GD[g]) return; J = { g, miss: 0, gold: 0, objs: [], flies: [], t: 0, pause: 0, P }; busy = 'job'; const R = RINGS[g];
    if (P && R) Object.assign(P, { x: R[0], z: R[1], sp: 0 }); GD[g].begin(P); K.chime(0.8); snapK = false; }
  function finishGame() { if (!J) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(8); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat(pre + 'Done', d); save.setStat(pre + 'Clears', save.stat(pre + 'Clears', 0) + 1); K.finish(g, stars, gold, first); stop();
    const gf = PZ.onFinish(); thanks = { g, gold, by: GN[g].by, gf }; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 +' + gold + ' GOLD', 2.6); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) J.objs.forEach(o => o.parent && o.parent.remove(o)); busy = null; J = null; ptr.down = false; hideCard(); }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g], c = g.card && g.card(); if (!c) { hideCard(); return; } const by = GN[J.g].by === 'm';
    setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? Math.floor(J.gold) + ' G' : by ? 'MASTER' : 'CAPTAIN', by ? MOA.color : CAPT.color) + foot(c[0]) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; if (J.flies.length) flyTick(dt); if (!J) return; const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (g.tick && J.g === 'sharpen') wheel.rotation.y += dt * 9; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return; drawCard(); }
  // ---------- camera (tap jobs), clamped inside the hall ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null, snapK = false; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = snapK ? 1 : Math.min(1, dt * 3.2); snapK = false; camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.x = clamp(camCur.pos.x, R0.X0 + 0.8, R0.X1 - 0.8); camCur.pos.z = clamp(camCur.pos.z, R0.Z0 + 0.8, R0.Z1 - 0.8); camCur.pos.y = clamp(camCur.pos.y, 0.6, 8.6); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.830-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- REST (2D: health full, +15 XP once) ----------
  function rest() { const full = hp && hpMax && hp() >= hpMax(); if (full) { toast('YOU ARE RESTED ALREADY', 1.8); return; } if (heal) heal(9999); tone(392, 0.05, 0.6); tone(523, 0.04, 0.8, 'sine', 0.25); tone(659, 0.04, 1.0, 'sine', 0.5);
    let xp = ''; if (!save.flag('barracksRest')) { save.setFlag('barracksRest'); save.addXp(15); xp = ' \u00b7 +15 XP \u00b7 YOU FOUND THE BUNKS'; } toast('RESTED \u00b7 HEALTH FULL' + xp, 2.6); }
  // ---------- places, talk + prompt ----------
  const inRoom = P => P.x > R0.X0 && P.x < R0.X1 && P.z > R0.Z0 && P.z < R0.Z1 && (P.y || 0) > -1.5 && (P.y || 0) < 6;
  const ringAt = P => { for (const k in RINGS) { const [x, z] = RINGS[k]; if (Math.hypot(P.x - x, P.z - z) < 1.05) return k; } return null; };
  const near = (o, P, r = 2.9) => !!o && Math.hypot(P.x - o.position.x, P.z - o.position.z) < r;
  function prompt(P) { if (SP) return 'TALK \u00b7 YIELD THE BOUT'; if (busy || !inRoom(P)) return null; if (moa && Math.hypot(P.x - SPARRING[0], P.z - SPARRING[1]) < 1.05) return 'SPAR \u00b7 MASTER OF ARMS'; const r = ringAt(P); if (r === 'rest') return 'REST \u00b7 TAKE A BUNK'; if (!r && PZ.atLocker(P)) return 'FOOTLOCKER \u00b7 YOUR THINGS'; if (r) return (done()[r] ? '\u2713 ' : '') + 'START \u00b7 ' + GN[r].name.toUpperCase();
    if (K.atHiring(P)) return 'NOW HIRING \u00b7 REPORT FOR DUTY'; if (near(capt, P)) return 'TALK \u00b7 GUARD CAPTAIN'; if (near(moa, P)) return 'TALK \u00b7 MASTER OF ARMS'; return null; }
  const nextJob = by => { const d = done(), L2 = GAMES.filter(q => !by || q.by === by); return (L2.find(q => !d[q.k]) || L2.slice().sort((a, c) => K.stars(a.k) - K.stars(c.k))[0]).k; };
  const sub = (kT, ln, by, title) => sayTo(kT, [{ ...ln(title), choices: [...GAMES.filter(q => q.by === by).map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => { if (!busy) startGame(q.k, lastP); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const menuC = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob('c'), lastP); } }, { text: 'DUTY JOBS', pick: () => sub(kC, lnC, 'c', 'Duty jobs. Pick one, soldier.') },
      { text: 'WHAT IS THIS PLACE?', pick: () => sayTo(kC, DIALOGUE.barracksGuardCaptain) }, { text: 'A TIP, PLEASE', pick: () => sayTo(kC, [lnC(CAPT.tips[talkC % CAPT.tips.length])]) }, { text: 'PRIZES + PERKS', pick: () => PZ.perks(kC, lnC) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    let open = first ? CAPT.hello[0] : CAPT.hello[1 + (talkC % 3)]; if (thanks && thanks.by === 'c') { open = thanks.gf ? PZ.line(thanks.gf)[0] : CAPT.open[save.stat(pre + 'Clears', 1) % 4] + ' ' + Math.floor(thanks.gold) + ' gold.'; const bq = thanks.gf === 'boost'; thanks = null; if (bq) { PZ.boostPick(kC, lnC, open); return; } }
    sayTo(kC, [{ ...lnC(open), choices: ch }]); };
  const menuM = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob('m'), lastP); } }, { text: 'TRAINING JOBS', pick: () => sub(kM, lnM, 'm', 'Training jobs. Choose your drill.') },
      { text: 'SPAR IN THE CIRCLE', pick: () => sparStart(lastP) }, { text: 'WHAT SHOULD I WORK ON?', pick: () => sayTo(kM, DIALOGUE.barracksMasterOfArms) }, { text: 'A TIP, PLEASE', pick: () => sayTo(kM, [lnM(MOA.tips[talkM % MOA.tips.length])]) }, { text: 'PRIZES + PERKS', pick: () => PZ.perks(kM, lnM) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    let open = first ? MOA.hello[0] : MOA.hello[1 + (talkM % 3)]; if (thanks && thanks.by === 'm') { open = thanks.gf ? PZ.line(thanks.gf)[0] : MOA.open[save.stat(pre + 'Clears', 1) % 4] + ' ' + Math.floor(thanks.gold) + ' gold.'; if (thanks.gf === 'boost') { thanks = null; PZ.boostPick(kM, lnM, open); return; } thanks = null; }
    sayTo(kM, [{ ...lnM(open), choices: ch }]); };
  function talk(P) { lastP = P; if (SP) { if (SP.ph === 'fight') sparEnd('loss'); return true; } if (busy) return true; if (!inRoom(P)) return false; if (moa && Math.hypot(P.x - SPARRING[0], P.z - SPARRING[1]) < 1.05) { sparAskStart(); return true; } const r = ringAt(P); if (r === 'rest') { rest(); return true; } if (!r && PZ.atLocker(P)) { tone(180, 0.05, 0.25, 'triangle'); PZ.locker(kC || kM, kC ? lnC : lnM); return true; } if (r) { startGame(r, P); return true; }
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (kC && near(capt, P)) { tone(880, 0.05, 0.4); menuC(!talkC++); return true; } if (kM && near(moa, P)) { tone(740, 0.05, 0.4); menuM(!talkM++); return true; } return false; }
  function quit() { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  // the Master of Arms: idle, wave when you walk in, look at you when close (the Captain gets this from the shop kit)
  let mWave = 0, mWas = false; const MPOSE = keeperPoser(THREE, ['hips', 'k_inspect', 'think', 'k_inspect']);
  const turn = (o, a, k) => { let d = a - o.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); o.rotation.y += d * Math.min(1, k); };
  function moaTick(dt, t, P, inR) { if (!moa || SP) return; if (inR && !mWas) mWave = busy ? 0 : 1.6; mWas = inR; const d = Math.hypot(P.x - moa.position.x, P.z - moa.position.z);
    if (d < 4.5 && inR) turn(moa, Math.atan2(P.x - moa.position.x, P.z - moa.position.z), dt * 3); else turn(moa, mP.ry + Math.sin(t * 0.5) * 0.15, dt * 1.5); kit.animFox(moa, dt, 0, false);
    if (MPOSE(moa, dt, mWave > 0 ? 'wave' : busy || d < 3 || !inR ? null : 'idle')) { if (mWave > 0) mWave -= dt; return; }
    const A = moa.userData.P && moa.userData.P.arms; if (A && mWave > 0) { mWave -= dt; A[1].rotation.x = -2.7; A[1].rotation.z = 0.35 + Math.sin(t * 14) * 0.35; } }
  let outT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; toastT -= dt; PZ.tick(dt, fox); const nr = Math.hypot(Math.max(R0.X0 - P.x, 0, P.x - R0.X1), Math.max(R0.Z0 - P.z, 0, P.z - R0.Z1)); G.visible = nr < (touch ? 60 : 110);
    try { LF.tick(dt, P, { busy: !!busy, sp: !!SP, near: nr, inR: inRoom(P) }); } catch (e) { if (!LF.err) { LF.err = 1; console.warn('barracks life: ' + (e && e.stack || e)); } }
    if (busy === 'job' && J) { outT = inRoom(P) ? 0 : outT + dt; if (outT > 0.3) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (busy === 'job' && J && fox) JW(fox, J.g); if (!G.visible) return; const inR = inRoom(P);
    if (!busy) fire.scale.setScalar(0.85 + Math.sin(t * 13) * 0.12);
    BRZ.forEach((b, i) => { if (b.lit) b.fl.scale.set(1 + Math.sin(t * 11 + i) * 0.08, 1 + Math.sin(t * 17 + i * 2) * 0.18, 1 + Math.sin(t * 13 + i) * 0.08); });
    { const h = hour(); if (lastH != null && lastH < 7 && h >= 7 && !(J && J.g === 'braziers')) BRZ.forEach(b => setLit(b, false)); lastH = h; }
    if (J) for (const f of walkers.slice()) { if (!J.flies.some(q => q.obj === f)) walkers.splice(walkers.indexOf(f), 1); else kit.animFox(f, dt, 1.4, false); }
    if (SP) { if (!inR) sparEnd('abort'); else sparTick(dt, P, fox); }
    if (busy === 'job' && J) jobTick(dt, P); hintTick(t); moaTick(dt, t, P, inR);
    K.tick(dt, P, { inShop: inR, busy: !!busy, near: nr, talking: false }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, active: () => !!busy || !!SP, spar, sparStart: P => sparStart(P || lastP), sparState: () => SP && { ...SP, me: CBs && CBs.P.hp, him: SPf && SPf.hp }, BRZ, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, PZ, start: (g, P) => startGame(g, P || lastP), GD, RINGS, rest, LF,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    snap() { snapK = true; }, _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) jobTick(dt, lastP); }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), card, dispose() { card.remove(); HINT.remove(); BOUT.remove(); K.dispose(); } };
  window.__barracksJobs = API; return API;
}
