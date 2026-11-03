// ORE SHAFT LAYOUT (s365): the 3-level battle map under Engineering on Deep Space Fox. Pure data + checker (no three.js).
// Ore Shaft Layout Workshop.dc.html edits it → localStorage 'ore.shaft.layout'. The cave (next) reads loadLayout().
// Units = metres. Plan coords: x → east, z → south. Each level = { items: [{id,k,x,z,...}], paths: [{id,w,pts:[[x,z]..]}] }.
export const STORE = 'ore.shaft.layout', VER = 1;
export const LEVELS = [
  { key: 'oreWorks', name: 'LEVEL 1 · ROBOT WORKS', short: 'ROBOT WORKS', hw: 50, hd: 35, floor: '#4a4640', note: 'Dead machines, cables, conveyors. Ore belts go UP, rubble belts go to the trash chute. The diverted ore PILE-UP.' },
  { key: 'oreHall', name: 'LEVEL 2 · ASTEROID HALL', short: 'ASTEROID HALL', hw: 60, hd: 50, floor: '#3c444c', note: 'The BIIIIG room: giant asteroid pieces the bots harvest. Flooded by the burst water main. Walkways = catwalks.' },
  { key: 'oreDeep', name: 'LEVEL 3 · THE DEEP', short: 'THE DEEP', hw: 50, hd: 45, floor: '#3a4450', note: 'Icy, the trash chute drops rubble. The DRILL RIG guards the SIGNAL RELAY.' },
];
// the unhack item grows with each part (Ben s365): rough after part 1, faster with 2 + 3. hold = × the machine's UNHACK HOLD.
export const TOOL = [
  { part: 'TUNER COIL', lv: 0, name: 'ROUGH UNHACKER', hold: 1.6 },
  { part: 'FOCUS LENS', lv: 1, name: 'UNHACKER', hold: 1.25 },
  { part: 'CORE KEY', lv: 2, name: 'TRUE UNHACKER', hold: 1.0 },
];
export const MTYPES = ['pick', 'drill', 'survey', 'hauler'];
export const MNAME = { pick: 'PICK-BOT', drill: 'DRILL CRAWLER', survey: 'SURVEY DRONE', hauler: 'ORE HAULER', r8: 'R-8', relay: 'SIGNAL RELAY', rig: 'DRILL RIG' };
// shape: pt | circle (r) | rect (w,d) | belt (len, ang, dir). grp = which tool group. one: max one per level. lv: only on these levels.
export const KINDS = {
  lift:   { label: 'LIFT', grp: 'STORY', shape: 'pt', col: '#f3f2f2', one: true, tip: 'The broken lift. R-8 repairs it when the level is cleared.' },
  guard:  { label: 'PART GUARD', grp: 'STORY', shape: 'pt', col: '#ffd23a', one: true, tip: 'A TOUGH machine (2× HP). Beat it, its unhack part drops.' },
  r8hack: { label: 'R-8 HACKED', grp: 'STORY', shape: 'pt', col: '#1a3fb8', one: true, lv: [1], tip: 'The signal grabs R-8 here. Fight + unhack him: your FIRST unhack.' },
  arena:  { label: 'BOSS ARENA', grp: 'STORY', shape: 'circle', col: '#ec3013', one: true, lv: [2], r: 16, tip: 'The Drill Rig guards the relay in here.' },
  relay:  { label: 'SIGNAL RELAY', grp: 'STORY', shape: 'pt', col: '#ec3013', one: true, lv: [2], tip: 'Boss part 1. Wreck it while dodging the Rig.' },
  rig:    { label: 'DRILL RIG', grp: 'STORY', shape: 'pt', col: '#f2c230', one: true, lv: [2], tip: 'Boss part 2. Stun + UNHACK it once the relay is down.' },
  spawn:  { label: 'MACHINES', grp: 'FOES', shape: 'circle', col: '#ff6b5a', r: 4, tip: 'Hacked machines that roam this circle (off the path).' },
  wild:   { label: 'WILD AREA', grp: 'MAP', shape: 'rect', col: '#8a6a4a', w: 20, d: 14, tip: 'Off-path rubble ground. Machines live out here, not on the path.' },
  lamp:   { label: 'EXTRA LAMP', grp: 'MAP', shape: 'pt', col: '#ffc870', tip: 'A work lamp (the path gets its lamps on its own).' },
  rock:   { label: 'ASTEROID', grp: 'MAP', shape: 'circle', col: '#9aa0a6', r: 8, tip: 'A giant piece of asteroid with ore veins. Solid.' },
  pile:   { label: 'ORE PILE-UP', grp: 'MAP', shape: 'circle', col: '#d0782c', r: 6, tip: 'The diverted ore. You can climb it.' },
  belt:   { label: 'CONVEYOR', grp: 'MAP', shape: 'belt', col: '#e0b020', len: 14, tip: 'Pushes you. UP = ore belt to the station. CHUTE = rubble to the trash chute.' },
  dead:   { label: 'DEAD MACHINE', grp: 'MAP', shape: 'pt', col: '#6a7078', tip: 'Old broken mining machine + cables (cover).' },
  chute:  { label: 'TRASH CHUTE', grp: 'MAP', shape: 'pt', col: '#b8b2ac', tip: 'The chute from above. Rubble falls near it.' },
  main:   { label: 'BURST MAIN', grp: 'MAP', shape: 'pt', col: '#5fb8ff', tip: 'The water main that burst and flooded the shaft.' },
  water:  { label: 'DEEP WATER', grp: 'HAZARD', shape: 'rect', col: '#2f6fd0', w: 24, d: 16, tip: 'Slows you. The path crosses it on a catwalk.' },
  cable:  { label: 'LIVE CABLE', grp: 'HAZARD', shape: 'circle', col: '#7cff9b', r: 3.5, tip: 'A live cable in the water: shocks you. Keep it off the path.' },
  ice:    { label: 'ICE', grp: 'HAZARD', shape: 'rect', col: '#9fd8ec', w: 16, d: 12, tip: 'You slide.' },
  rubble: { label: 'FALLING RUBBLE', grp: 'HAZARD', shape: 'circle', col: '#c8ccd2', r: 5, tip: 'Rubble drops from the chute (a shadow warns first).' },
  vent:   { label: 'STEAM VENT', grp: 'HAZARD', shape: 'pt', col: '#f3f2f2', tip: 'Bursts steam on a timer.' },
};
export const GROUPS = ['STORY', 'FOES', 'MAP', 'HAZARD'];
export const UI = { r: ['RADIUS', 2, 30, 0.5, 'm'], w: ['WIDTH', 4, 90, 1, 'm'], d: ['DEPTH', 4, 90, 1, 'm'], len: ['LENGTH', 4, 40, 1, 'm'], ang: ['TURN', 0, 360, 5, '°'], n: ['HOW MANY', 1, 6, 1, ''], pw: ['PATH WIDTH', 2, 8, 0.5, 'm'], lampEvery: ['LAMP EVERY', 5, 20, 1, 'm'], h: ['HEIGHT', 1, 8, 0.5, 'm'] };

let uid = 1; const nid = k => k + '_' + (uid++).toString(36) + Math.random().toString(36).slice(2, 5);
const I = (k, x, z, o = {}) => ({ id: nid(k), k, x, z, ...o });
const P = (w, pts) => ({ id: nid('path'), w, pts });
export function defaultLevel(i) {
  if (i === 0) return { lampEvery: 9, paths: [
      P(4, [[-42, 0], [-30, 0], [-18, -10], [0, -12], [18, -8], [30, 2], [26, 16], [8, 22], [-12, 22], [-26, 12], [-34, 2]]),
      P(3, [[30, 2], [40, -12], [42, -22]])],
    items: [I('lift', -44, 0), I('guard', 42, -26, { m: 'hauler' }),
      I('wild', -2, -27, { w: 44, d: 12 }), I('wild', 6, 5, { w: 28, d: 12 }), I('wild', -32, -24, { w: 20, d: 14 }), I('wild', 36, 28, { w: 24, d: 10 }),
      I('spawn', -6, -27, { m: 'pick', n: 2, r: 5 }), I('spawn', 12, 5, { m: 'survey', n: 1, r: 4 }), I('spawn', -1, 6, { m: 'pick', n: 1, r: 3 }), I('spawn', -32, -24, { m: 'drill', n: 1, r: 5 }), I('spawn', 36, 28, { m: 'pick', n: 2, r: 4 }),
      I('belt', -8, -19, { len: 16, ang: 0, dir: 'up' }), I('belt', 14, -21, { len: 12, ang: 20, dir: 'up' }), I('belt', 6, 9, { len: 14, ang: 0, dir: 'chute' }),
      I('pile', 24, -25, { r: 7, h: 5 }), I('vent', -14, 16), I('vent', 18, 12), I('vent', -22, -4),
      I('dead', -40, -12), I('dead', 45, 10), I('dead', -20, 30), I('dead', 12, -31), I('dead', -6, 15)] };
  if (i === 1) return { lampEvery: 9, paths: [
      P(4, [[-52, 0], [-38, 0], [-28, -14], [-8, -30], [14, -34], [34, -26], [48, -10], [46, 10], [30, 30], [6, 38], [-18, 34], [-32, 18], [-40, 4]]),
      P(3, [[34, -26], [42, -38]])],
    items: [I('lift', -54, 0), I('guard', 44, -42, { m: 'drill' }), I('r8hack', -33, -7),
      I('rock', 0, 0, { r: 16 }), I('rock', 24, 14, { r: 8 }), I('rock', -48, -40, { r: 6 }), I('rock', 52, 40, { r: 6 }),
      I('water', 4, 2, { w: 80, d: 56 }), I('cable', -14, -6, { r: 4 }), I('cable', 16, 24, { r: 3.5 }), I('cable', 30, -14, { r: 3.5 }),
      I('wild', 4, 4, { w: 50, d: 36 }), I('wild', -44, -38, { w: 28, d: 18 }), I('wild', 48, 42, { w: 20, d: 12 }),
      I('spawn', 14, -12, { m: 'pick', n: 2, r: 4 }), I('spawn', -12, 18, { m: 'survey', n: 1, r: 4 }), I('spawn', 26, -2, { m: 'hauler', n: 1, r: 4 }), I('spawn', -42, -38, { m: 'drill', n: 1, r: 5 }), I('spawn', 46, 42, { m: 'pick', n: 2, r: 4 }),
      I('main', -52, -24), I('belt', -12, 40, { len: 18, ang: 0, dir: 'up' }), I('dead', -46, 16), I('dead', 54, -26), I('dead', 10, -44)] };
  return { lampEvery: 9, paths: [
      P(4, [[-42, -34], [-30, -34], [-20, -22], [-26, -6], [-34, 8], [-26, 24], [-8, 30], [4, 22], [6, 10]]),
      P(3, [[-26, 24], [-38, 34]])],
    items: [I('lift', -44, -36), I('guard', -40, 37, { m: 'survey' }),
      I('arena', 22, 4, { r: 16 }), I('relay', 30, -2), I('rig', 15, 9),
      I('ice', -8, 0, { w: 18, d: 28 }), I('ice', 22, 30, { w: 28, d: 12 }), I('ice', 27, 12, { w: 8, d: 6 }),
      I('water', -4, -38, { w: 22, d: 10 }), I('cable', 0, -38, { r: 3 }),
      I('chute', 34, -36), I('rubble', 29, -29, { r: 6 }), I('rubble', 12, -30, { r: 5 }),
      I('vent', -12, -30), I('vent', 10, -12), I('vent', -36, -4),
      I('wild', -7, 0, { w: 16, d: 26 }), I('wild', 24, -30, { w: 28, d: 14 }), I('wild', -45, -10, { w: 8, d: 18 }), I('wild', 22, 31, { w: 26, d: 10 }),
      I('spawn', -7, -3, { m: 'pick', n: 2, r: 4 }), I('spawn', 22, -30, { m: 'drill', n: 1, r: 5 }), I('spawn', -45, -10, { m: 'survey', n: 1, r: 3 }), I('spawn', 22, 31, { m: 'hauler', n: 1, r: 4 }),
      I('dead', -44, 20), I('dead', 44, 30), I('dead', 44, -10), I('pile', -2, 40, { r: 5, h: 3 })] };
}
export const defaultLayout = () => ({ v: VER, levels: LEVELS.map((_, i) => defaultLevel(i)) });
export function loadLayout() { try { const j = JSON.parse(localStorage.getItem(STORE) || 'null'); if (j && j.v === VER && Array.isArray(j.levels) && j.levels.length === 3) return j; } catch (e) {} return defaultLayout(); }
export function saveLayout(L) { try { localStorage.setItem(STORE, JSON.stringify(L)); } catch (e) {} }
export const newItem = (k, x, z, m) => { const K = KINDS[k], o = I(k, x, z); for (const p of ['r', 'w', 'd', 'len']) if (K[p] != null) o[p] = K[p]; if (k === 'belt') { o.ang = 0; o.dir = 'up'; } if (k === 'spawn') { o.m = m || 'pick'; o.n = 1; } if (k === 'guard') o.m = m || 'hauler'; if (k === 'pile') o.h = 4; return o; };
export const newPath = (x, z) => P(4, [[x, z]]);

// geometry
export function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], l = dx * dx + dz * dz || 1e-6; let t = ((x - a[0]) * dx + (z - a[1]) * dz) / l; t = Math.max(0, Math.min(1, t)); const px = a[0] + dx * t, pz = a[1] + dz * t; return Math.hypot(x - px, z - pz); }
export function pathDist(lv, x, z) { let best = 1e9, w = 4; for (const p of lv.paths) for (let i = 0; i < p.pts.length - 1; i++) { const d = segDist(x, z, p.pts[i], p.pts[i + 1]) - p.w / 2; if (d < best) { best = d; w = p.w; } } if (best === 1e9) for (const p of lv.paths) for (const q of p.pts) best = Math.min(best, Math.hypot(x - q[0], z - q[1]) - p.w / 2); return best; }
export const inRect = (it, x, z, pad = 0) => Math.abs(x - it.x) <= it.w / 2 + pad && Math.abs(z - it.z) <= it.d / 2 + pad;
// does a path run through this rect / circle? (samples every 1 m)
export function pathHits(lv, test) { for (const p of lv.paths) for (let i = 0; i < p.pts.length - 1; i++) { const a = p.pts[i], b = p.pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]))); for (let s = 0; s <= n; s++) { const x = a[0] + (b[0] - a[0]) * s / n, z = a[1] + (b[1] - a[1]) * s / n; if (test(x, z, p.w / 2)) return true; } } return false; }
// work lamps along every path, alternating sides, + the extra lamps
export function lampsFor(lv) {
  const out = [], ev = lv.lampEvery || 9;
  for (const p of lv.paths) { let carry = ev * 0.5, side = 1;
    for (let i = 0; i < p.pts.length - 1; i++) { const a = p.pts[i], b = p.pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); if (L < 0.01) continue; const ux = dx / L, uz = dz / L, off = p.w / 2 + 1;
      let s = carry; while (s < L) { out.push({ x: a[0] + ux * s - uz * off * side, z: a[1] + uz * s + ux * off * side, path: p.id }); side = -side; s += ev; } carry = s - L; } }
  for (const it of lv.items) if (it.k === 'lamp') out.push({ x: it.x, z: it.z, extra: true });
  return out;
}
export const pathLen = p => { let L = 0; for (let i = 0; i < p.pts.length - 1; i++) L += Math.hypot(p.pts[i + 1][0] - p.pts[i][0], p.pts[i + 1][1] - p.pts[i][1]); return L; };

// CHECKER: [{ lv, s: 'PASS'|'WARN'|'FAIL', t }]
export function checkLayout(L) {
  const out = [];
  L.levels.forEach((lv, li) => {
    const D = LEVELS[li], A = (s, t) => out.push({ lv: li, s, t }), of = k => lv.items.filter(i => i.k === k);
    const lift = of('lift'), guard = of('guard'), spawns = of('spawn'), wild = of('wild');
    lift.length === 1 ? A('PASS', 'Lift placed') : A('FAIL', lift.length ? 'Only one lift per level' : 'No lift');
    if (!lv.paths.length || !lv.paths.some(p => p.pts.length > 1)) A('FAIL', 'No path'); else if (lift[0]) { const d = pathDist(lv, lift[0].x, lift[0].z); d <= 4 ? A('PASS', 'Path starts at the lift') : A('FAIL', 'Path does not reach the lift (' + d.toFixed(0) + ' m)'); }
    if (guard.length !== 1) A('FAIL', 'Needs one PART GUARD (drops ' + TOOL[li].part + ')'); else { const d = pathDist(lv, guard[0].x, guard[0].z); d <= 12 ? A('PASS', 'Guard drops the ' + TOOL[li].part + ' (' + MNAME[guard[0].m] + ')') : A('WARN', 'Guard is ' + d.toFixed(0) + ' m from the path; lamps will not lead there'); }
    const n = spawns.reduce((s, i) => s + (i.n || 1), 0); n ? A('PASS', n + ' machines in ' + spawns.length + ' groups') : A('WARN', 'No machines');
    for (const s of spawns) { if (pathDist(lv, s.x, s.z) < s.r) A('FAIL', MNAME[s.m] + ' group sits on the path (they must stay off it)'); if (!wild.some(w => inRect(w, s.x, s.z))) A('WARN', MNAME[s.m] + ' group is outside every wild area'); }
    wild.length ? A('PASS', wild.length + ' wild areas') : A('WARN', 'No wild area off the path');
    for (const w of wild) if (pathHits(lv, (x, z, r) => inRect(w, x, z, -1))) A('WARN', 'A wild area covers the path');
    for (const c of of('cable')) if (pathHits(lv, (x, z, r) => Math.hypot(x - c.x, z - c.z) < c.r + r)) A('FAIL', 'Live cable touches the path');
    for (const r of of('rubble')) if (pathHits(lv, (x, z, rr) => Math.hypot(x - r.x, z - r.z) < r.r + rr)) A('WARN', 'Rubble falls on the path (OK if you want a dodge moment)');
    for (const r of of('rock')) if (pathHits(lv, (x, z, rr) => Math.hypot(x - r.x, z - r.z) < r.r + rr)) A('FAIL', 'An asteroid blocks the path');
    if (of('water').some(w => pathHits(lv, (x, z) => inRect(w, x, z)))) A('PASS', 'Path crosses the water on a catwalk');
    if (li === 1) { const h = of('r8hack')[0]; !h ? A('FAIL', 'Place where R-8 gets HACKED') : pathDist(lv, h.x, h.z) <= 8 ? A('PASS', 'R-8 hack spot is on the way') : A('WARN', 'R-8 hack spot is far from the path'); }
    if (li === 2) { const ar = of('arena')[0], re = of('relay')[0], rg = of('rig')[0];
      if (!ar) A('FAIL', 'No boss arena'); else { re && Math.hypot(re.x - ar.x, re.z - ar.z) < ar.r ? A('PASS', 'Relay inside the arena') : A('FAIL', 'Relay must be inside the arena'); rg && Math.hypot(rg.x - ar.x, rg.z - ar.z) < ar.r ? A('PASS', 'Rig guards the relay') : A('FAIL', 'Rig must be inside the arena'); pathDist(lv, ar.x, ar.z) <= ar.r + 2 ? A('PASS', 'Path leads into the arena') : A('FAIL', 'Path does not reach the arena'); if (guard[0] && Math.hypot(guard[0].x - ar.x, guard[0].z - ar.z) < ar.r) A('FAIL', 'Part guard is inside the arena (fight it first)'); } }
    for (const it of lv.items) if (Math.abs(it.x) > D.hw || Math.abs(it.z) > D.hd) A('FAIL', KINDS[it.k].label + ' is outside the level');
    for (const p of lv.paths) for (const q of p.pts) if (Math.abs(q[0]) > D.hw || Math.abs(q[1]) > D.hd) { A('FAIL', 'A path point is outside the level'); break; }
    A('PASS', lampsFor(lv).length + ' work lamps');
  });
  return out;
}
