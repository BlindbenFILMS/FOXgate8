// 8 GATES — LAYOUT CHECKER (s344). checkLayout(L, { rooms2d }) → { items: [{ level: 'fail'|'warn'|'pass', rule, msg, at }], counts }.
// Rules = PARALLEL_WORLDS.md section 4 A. Pure data in, no three.js. Frame: metres, x east, z south.
export const WORLDS = ['meru', 'gaya', 'kyoto', 'jidda', 'kufa', 'luxor', 'nebo', 'ur', 'zion', 'shasta', 'home', 'earth', 'dsf', 'player'];
export const PROP_KINDS = ['bench', 'tree', 'lamp', 'planter', 'fence', 'rock', 'stall', 'sign', 'statue', 'fountain', 'crate', 'barrel'];
export const LININGS = ['lamps', 'lanterns', 'trees'];
export const BUDGET = { buildings: 60, props: 400, lamps: 300, trees: 7000 };
// EVERY WORLD HAS (Ben, s345). Buildings carry "role"; sizes are the workshop's default footprint (metres).
export const REQUIRED = [
  { role: 'castle', label: 'Castle', w: 60, d: 48, h: 18 }, { role: 'barracks', label: 'Barracks', w: 44, d: 28, h: 10 },
  { role: 'police', label: 'Police', w: 30, d: 24, h: 9 }, { role: 'fire', label: 'Fire Station', w: 28, d: 20, h: 9 },
  { role: 'news', label: 'News Station', w: 26, d: 20, h: 10 }, { role: 'tavern', label: 'Tavern (unique minigame)', w: 30, d: 24, h: 9 },
  { role: 'itemshop', label: 'Item Shop', w: 28, d: 24, h: 8 }, { role: 'armory', label: 'Armory', w: 24, d: 20, h: 8 },
  { role: 'post', label: 'Galactic Post Office (Meru Embassy)', w: 26, d: 20, h: 10 }, { role: 'farm', label: 'Farm', w: 40, d: 30, h: 9 },
  { role: 'restaurant', label: 'Restaurant (unique)', w: 22, d: 18, h: 7 }, { role: 'sport', label: 'Sport venue (unique)', w: 50, d: 40, h: 10 },
  { role: 'specialty', label: 'Specialty Shop (unique, like a pet store)', w: 18, d: 16, h: 7 }, { role: 'weapons', label: 'Special Weapons (8 ranged + melee)', w: 20, d: 16, h: 7 },
  { role: 'relicShop', label: 'Relic Shop (the famous relic to buy)', w: 16, d: 14, h: 7 }, { role: 'bank', label: 'Bank', w: 30, d: 24, h: 10 },
  { role: 'carRental', label: 'Car Rental', w: 26, d: 20, h: 6 }, { role: 'home', label: 'Player Home (rent / buy)', w: 16, d: 14, h: 8 },
  { role: 'hospital', label: 'Hospital', w: 34, d: 28, h: 12 }, { role: 'housing', label: 'Residential housing', w: 16, d: 14, h: 9, min: 3 },
];
export const ROLES = REQUIRED.map(r => r.role).concat(['shop', 'house', 'other', 'community']);
export const SPOT_KINDS = ['npc', 'keeper', 'crowd', 'hiring', 'game', 'relicFind', 'vehicle', 'helipad', 'telepad', 'plot'];
export const GATE_KINDS = ['battle', 'cave', 'minigame'];
export const CREATURES = ['monsters', 'creatures', 'robots'];
const nSpot = k => L => (L.spots || []).filter(s => s.kind === k).length, nGate = k => L => (L.gates || []).filter(g => g.kind === k).length, nWild = c => L => (L.wild || []).filter(w => (w.creatures || []).includes(c)).length;
export const REQUIRED_MORE = [
  { id: 'cave', label: 'Cave', n: nGate('cave'), min: 1 }, { id: 'battle', label: 'Battle areas', n: nGate('battle'), min: 4 },
  { id: 'monsters', label: 'Wild area: monsters', n: nWild('monsters'), min: 1 }, { id: 'creatures', label: 'Wild area: creatures', n: nWild('creatures'), min: 1 }, { id: 'robots', label: 'Wild area: robots', n: nWild('robots'), min: 1 },
  { id: 'relicFind', label: 'Legendary relic to find', n: nSpot('relicFind'), min: 1 }, { id: 'vehicle', label: 'Special vehicle', n: nSpot('vehicle'), min: 1 },
  { id: 'telepad', label: 'Castle helipad + teleport pad', n: L => { const c = (L.buildings || []).find(b => b.role === 'castle' && b.f); if (!c) return 0; const cx = (c.f[0] + c.f[1]) / 2, cz = (c.f[2] + c.f[3]) / 2, near = k => (L.spots || []).some(s => s.kind === k && s.at && Math.hypot(s.at[0] - cx, s.at[1] - cz) < 110); return near('helipad') && near('telepad') ? 1 : 0; }, min: 1 },
  { id: 'helipad', label: 'Helipads (castle + at least 1 more)', n: nSpot('helipad'), min: 2 },
  { id: 'signs', label: 'Roof sign + eye-level door sign, every building', n: L => { const B = (L.buildings || []).filter(b => b.f); return B.length && B.every(b => b.sign && b.sign.roof && b.sign.door) ? 1 : 0; }, min: 1 },
  { id: 'dock', label: 'Space dock', n: L => (L.dock && L.dock.pad ? 1 : 0), min: 1, notFor: 'earth' },
];
// PLAYER PLANET (s498, Ben): meta.kind 'player' = an almost empty city-builder world (template for all 4 player planets). Its own short list instead of the every-world list.
const nearCC = L => { const c = (L.buildings || []).find(b => b.role === 'community' && b.f); if (!c) return 0; const cx = (c.f[0] + c.f[1]) / 2, cz = (c.f[2] + c.f[3]) / 2, near = k => (L.spots || []).some(s => s.kind === k && s.at && Math.hypot(s.at[0] - cx, s.at[1] - cz) < 110); return near('helipad') && near('telepad') ? 1 : 0; };
export const PLAYER_REQUIRED = [
  { id: 'community', label: 'Community Center', n: L => (L.buildings || []).filter(b => b.role === 'community').length, min: 1 },
  { id: 'farm', label: 'The one farm', n: L => (L.buildings || []).filter(b => b.role === 'farm').length, min: 1 },
  { id: 'plots', label: 'Open build plots at start', n: L => (L.spots || []).filter(s => s.kind === 'plot' && !s.locked).length, min: 12 },
  { id: 'locked', label: 'Locked plots (clear land to open)', n: L => (L.spots || []).filter(s => s.kind === 'plot' && s.locked).length, min: 1 },
  { id: 'cave', label: 'Crystal cave', n: nGate('cave'), min: 1 },
  { id: 'creatures', label: 'Wild area: creatures', n: nWild('creatures'), min: 1 }, { id: 'monsters', label: 'Wild area: monsters', n: nWild('monsters'), min: 1 },
  { id: 'islands', label: 'Islands', n: L => (L.islands || []).length, min: 3 },
  { id: 'telepad', label: 'Community Center helipad + teleport pad', n: nearCC, min: 1 },
  { id: 'helipad', label: 'Helipads (Community Center + at least 1 more)', n: nSpot('helipad'), min: 2 },
  { id: 'signs', label: 'Roof sign + eye-level door sign, every building', n: L => { const B = (L.buildings || []).filter(b => b.f); return B.length && B.every(b => b.sign && b.sign.roof && b.sign.door) ? 1 : 0; }, min: 1 },
  { id: 'dock', label: 'Space dock (ship landing pad)', n: L => (L.dock && L.dock.pad ? 1 : 0), min: 1 },
];
// the EVERY WORLD HAS checklist: [{ id, label, have, min, ok, role? }]
export function worldList(L) { const B = L.buildings || [], W = (L.meta || {}).world;
  if ((L.meta || {}).kind === 'player') return PLAYER_REQUIRED.map(x => { const have = x.n(L); return { id: x.id, label: x.label, have, min: x.min, ok: have >= x.min }; });
  return REQUIRED.map(r => { const have = B.filter(b => b.role === r.role).length, min = r.min || 1; return { id: r.role, role: r.role, label: r.label, have, min, ok: have >= min }; })
    .concat(REQUIRED_MORE.filter(x => x.notFor !== W).map(x => { const have = x.n(L); return { id: x.id, label: x.label, have, min: x.min, ok: have >= x.min }; })); }
export const APRON = { w: 12, d: 8 };
const FACE = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
export const faceVec = f => FACE[f] || [0, 1];
const segD = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2)); return Math.hypot(px - ax - u * dx, pz - az - u * dz); };
export const polyD = (x, z, p) => { let d = Infinity; for (let i = 0; i < p.length - 1; i++) d = Math.min(d, segD(x, z, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1])); return p.length === 1 ? Math.hypot(x - p[0][0], z - p[0][1]) : d; };
export const polyLen = p => { let s = 0; for (let i = 0; i < p.length - 1; i++) s += Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]); return s; };
const inR = (x, z, r, m = 0) => x > r[0] - m && x < r[1] + m && z > r[2] - m && z < r[3] + m;
const rOver = (a, b, m = 0) => a[0] < b[1] - m && a[1] > b[0] + m && a[2] < b[3] - m && a[3] > b[2] + m;
const rC = r => [(r[0] + r[1]) / 2, (r[2] + r[3]) / 2];
// CLIFFS (s346): a hill with "cliff": true is a flat-topped plateau; its steep edge band (84-100% of r) cannot be walked: reach it by air only
export const onCliff = (L, x, z) => ((L.terrain || {}).hills || []).some(h => { if (!h.cliff) return false; const d = Math.hypot(x - h.c[0], z - h.c[1]) / h.r; return d >= 0.84 && d < 1; });
// ISLANDS (s348 Jidda): L.islands [{ key, r, round, blob }] = land inside the sea. blob = an organic coastline (bays + points) round r, seeded by the key, about the same size as r.
const iSeed = k => { let s = 7; for (const ch of String(k || 'i')) s = (s * 31 + ch.charCodeAt(0)) % 9973; return s / 9973 * 6.283; };
export const islandRad = (o, t) => { const s = iSeed(o.key); return 1.04 + 0.13 * Math.sin(3 * t + s) + 0.07 * Math.sin(5 * t + 1.7 * s) + 0.04 * Math.sin(8 * t + 2.3 * s); };
export function islandOutline(o, n = 64) { const [a, b, c, d] = o.r, cx = (a + b) / 2, cz = (c + d) / 2, rx = (b - a) / 2, rz = (d - c) / 2, out = [];
  for (let i = 0; i < n; i++) { const t = i / n * 6.283; if (o.blob) { const k = islandRad(o, t), ct = Math.cos(t), st = Math.sin(t), q = Math.pow(Math.pow(Math.abs(ct), 3) + Math.pow(Math.abs(st), 3), 1 / 3); out.push([cx + rx * k * ct / q, cz + rz * k * st / q]); } else if (o.round) out.push([cx + rx * Math.cos(t), cz + rz * Math.sin(t)]); }
  if (!o.blob && !o.round) return [[a, c], [b, c], [b, d], [a, d]]; return out; }
export const onIsland = (L, x, z) => (L.islands || []).some(o => { if (!o.r) return false; const [a, b, c, d] = o.r, cx = (a + b) / 2, cz = (c + d) / 2, rx = (b - a) / 2, rz = (d - c) / 2, dx = (x - cx) / rx, dz = (z - cz) / rz;
  if (o.blob) { const t = Math.atan2(dz, dx); return Math.pow(Math.pow(Math.abs(dx), 3) + Math.pow(Math.abs(dz), 3), 1 / 3) < islandRad(o, t); }
  return o.round ? Math.hypot(dx, dz) < 1 : inR(x, z, o.r); });
const inW = (w, x, z) => w.e ? Math.hypot((x - w.e[0]) / w.e[2], (z - w.e[1]) / w.e[3]) < 1 : w.r ? inR(x, z, w.r) : false;
// CANALS (s348 Jidda / Venice): water with "canal": true cuts through islands (a canal wins over island land)
export const inWater = (L, x, z) => (L.water || []).some(w => w.canal && inW(w, x, z)) || !onIsland(L, x, z) && (L.water || []).some(w => w.e ? Math.hypot((x - w.e[0]) / w.e[2], (z - w.e[1]) / w.e[3]) < 1 : w.r ? inR(x, z, w.r) : false);
export const onWay = (L, x, z, m = 0) => [...(L.paths || []), ...(L.roads || [])].some(p => p.p && polyD(x, z, p.p) <= (p.w || 4) / 2 + m);
export const zoneAt = (L, x, z) => { let hit = null; for (const Z of L.zones || []) if (Z.r ? inR(x, z, Z.r) : Z.c ? Math.hypot(x - Z.c[0], z - Z.c[1]) < Z.c[2] : false) hit = Z; return hit; };
// the apron = 12 x 8 m in front of the door, as a rect
export function apronRect(b) { const [fx, fz] = faceVec(b.face), [dx, dz] = b.door, hw = APRON.w / 2, d = APRON.d;
  return fx ? [Math.min(dx, dx + fx * d), Math.max(dx, dx + fx * d), dz - hw, dz + hw] : [dx - hw, dx + hw, Math.min(dz, dz + fz * d), Math.max(dz, dz + fz * d)]; }
export const apronFront = b => { const [fx, fz] = faceVec(b.face); return [b.door[0] + fx * APRON.d, b.door[1] + fz * APRON.d]; };
// FORESTS (s346, Nebo): terrain.forests [{ key, r, every, mix: 'pine'|'broad'|'mixed'|'palm' (s347 Kufa)|'cherry' (s348 Kyoto: pink blossom, 20% pines)|'tropical' (s348 Jidda: 55% palms + 45% lush broadleaf), giants }] + terrain.clearings [{ key, r }] → scattered trees,
// deterministic, never on a path / road (+2.5 m), building (+3), water, surface, clearing, gate, dock or spot. thin > 1 = fewer trees (phones).
export function forestTrees(L, { thin = 1 } = {}) {
  const T = L.terrain || {}, out = [], B = (L.buildings || []).filter(b => b.f), CL = (T.clearings || []).filter(c => c.r), SU = (L.surfaces || []).filter(s => s.r);
  const G = (L.gates || []).filter(g => g.at), S = (L.spots || []).filter(s => s.at), D = L.dock && L.dock.pad ? L.dock : null, sp = L.map && L.map.spawn;
  for (const f of T.forests || []) { if (!f.r) continue; let seed = 7; for (const ch of String(f.key || 'f')) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483647;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, e = Math.max(4, (f.every || 10) * thin), mix = f.mix || 'mixed', gi = f.giants == null ? 0.03 : f.giants, r = f.r;
    for (let x0 = r[0] + e / 2; x0 < r[1]; x0 += e) for (let z0 = r[2] + e / 2; z0 < r[3]; z0 += e) {
      const x = x0 + (rnd() - 0.5) * e * 0.8, z = z0 + (rnd() - 0.5) * e * 0.8, k = rnd(), sc = rnd(), g = rnd() < gi;
      if (CL.some(c => inR(x, z, c.r)) || SU.some(s => inR(x, z, s.r, 1)) || B.some(b => inR(x, z, b.f, 3)) || inWater(L, x, z) || onWay(L, x, z, 2.5)) continue;
      if (G.some(q => Math.hypot(x - q.at[0], z - q.at[1]) < (q.r || 6) + 5) || S.some(q => Math.hypot(x - q.at[0], z - q.at[1]) < 3) || (D && Math.hypot(x - D.pad[0], z - D.pad[1]) < (D.r || 12) + 6) || (sp && Math.hypot(x - sp[0], z - sp[1]) < 8)) continue;
      out.push({ x, z, s: g ? 2.4 + sc * 1.2 : 0.8 + sc * 0.7, kind: mix === 'tropical' ? (k < 0.55 ? 'palm' : 'broad') : mix === 'cherry' ? (k < 0.8 ? 'cherry' : 'pine') : mix === 'palm' ? 'palm' : mix === 'pine' ? 'pine' : mix === 'broad' ? 'broad' : k < 0.55 ? 'pine' : 'broad', giant: g }); } }
  return out; }
export function lampCount(L) { let n = 0; for (const p of L.paths || []) if (p.lining === 'lamps' || p.lining === 'lanterns') n += Math.floor(polyLen(p.p || []) / (p.every || 14)) * 2; return n + (L.props || []).filter(q => q.k === 'lamp').length; }
// rooms2d from the 2D world file text: the values of `var SCENE = { … }`, else every quoted '<world>Xxx' id
export function rooms2dFrom(text, world) { const m = /var\s+SCENE\s*=\s*\{([\s\S]*?)\}/.exec(text || ''); const re = new RegExp("['\"](" + world + "[A-Z]\\w*)['\"]", 'g');
  const src = m ? m[1] : (text || ''); return [...new Set([...src.matchAll(re)].map(a => a[1]))].filter(k => !/Css$|Style$/.test(k)); }

export function checkLayout(L, { rooms2d = null } = {}) {
  const out = [], add = (level, rule, msg, at) => out.push({ level, rule, msg, at: at || null });
  const meta = L.meta || {}, W = meta.world, legacy = !!meta.legacy, F = legacy ? 'warn' : 'fail', half = (L.map && L.map.half) || 0;
  // meta
  if (!WORLDS.includes(W)) add('fail', 'meta', 'meta.world must be one of: ' + WORLDS.join(', '));
  if (!(Number.isInteger(meta.version) && meta.version >= 1)) add('fail', 'meta', 'meta.version must be a whole number ≥ 1');
  if (!half) add('fail', 'meta', 'map.half missing (half the map size, metres)');
  // keys
  const all = [], cut = new Set((meta.cut || []).map(c => c.key || c));
  const push = (k, what, o, prefixed = true) => { if (!k) { add('fail', 'keys', what + ' without a key', o && (o.at || o.door || (o.r && rC(o.r)))); return; } all.push([k, what, prefixed, o]); };
  (L.zones || []).forEach(z => push(z.key, 'zone', z)); (L.buildings || []).forEach(b => push(b.key, 'building', b));
  (L.spots || []).forEach(s => push(s.key, 'spot', s, !s.from2d)); (L.gates || []).forEach(g => push(g.key, 'gate', g));
  (L.wild || []).forEach(w => push(w.key, 'wild', w)); (L.paths || []).forEach(p => push(p.key, 'path', p)); if (L.dock) push(L.dock.key, 'dock', L.dock);
  const seen = new Map(); let keyBad = 0, legacyN = 0;
  for (const [k, what, pre, o] of all) {
    if (seen.has(k)) { add(F, 'keys', `key "${k}" used twice (${seen.get(k)} + ${what})`); keyBad++; } seen.set(k, what);
    const badName = !/^[a-z][a-zA-Z0-9]*$/.test(k) ? 'is not camelCase' : pre && W && !k.startsWith(W) ? `must start with "${W}"` : null;
    if (badName) { keyBad++; if (legacy) legacyN++; else add('fail', 'keys', `"${k}" ${badName}`); }
  }
  if (legacyN) add('warn', 'keys', `${legacyN} old keys are not world-prefixed (legacy file, allowed)`);
  if (!keyBad) add('pass', 'keys', all.length + ' keys, unique + named right');
  // 2D rooms
  if (rooms2d && rooms2d.length) { const have = new Set(all.map(a => a[0]).concat((L.buildings || []).map(b => b.room2d).filter(Boolean))); const miss = rooms2d.filter(k => !have.has(k) && !cut.has(k));
    if (miss.length) add('fail', 'rooms', 'missing 2D rooms: ' + miss.join(', ')); else add('pass', 'rooms', 'all ' + rooms2d.length + ' 2D rooms present'); }
  else add('warn', 'rooms', '2D world file not found: rooms not checked (put it in uploads/surface_' + (W === 'shasta' ? 'player' : W === 'kyoto' ? 'gaya' : W) + '.html)');
  // zones
  for (const z of L.zones || []) if (!(z.depth >= 30)) add(F, 'zones', `zone ${z.key}: depth ${z.depth} < 30 m`, z.r ? rC(z.r) : z.c);
  // buildings: door on edge, overlap, water, bounds, apron, link
  const B = L.buildings || []; let doorBad = 0;
  for (const b of B) { if (!b.f || !b.door) { add('fail', 'buildings', `${b.key}: needs f + door`); continue; }
    const [x0, x1, z0, z1] = b.f, [dx, dz] = b.door, edge = { N: Math.abs(dz - z0), S: Math.abs(dz - z1), E: Math.abs(dx - x1), W: Math.abs(dx - x0) }[b.face];
    const along = (b.face === 'N' || b.face === 'S') ? dx >= x0 && dx <= x1 : dz >= z0 && dz <= z1;
    if (edge == null || edge > 0.5 || !along) { add('fail', 'doors', `${b.key}: door is not on its ${b.face || '?'} wall`, b.door); doorBad++; continue; }
    if (b.f.some(v => Math.abs(v) > half)) add('fail', 'bounds', `${b.key}: outside map.half`, rC(b.f));
    if ([[x0, z0], [x1, z0], [x0, z1], [x1, z1], rC(b.f)].some(([x, z]) => inWater(L, x, z))) add(F, 'water', `${b.key}: stands in water`, rC(b.f));
    const A = apronRect(b), hitB = B.find(o => o !== b && o.f && rOver(A, o.f, 0.05)), hitP = (L.props || []).find(p => p.at && inR(p.at[0], p.at[1], A));
    if (hitB || hitP) { add(F, 'aprons', `${b.key}: 12 x 8 m door apron blocked by ${hitB ? hitB.key : 'a ' + hitP.k}`, b.door); doorBad++; }
    const [ax, az] = apronFront(b); if (!onWay(L, ax, az, 1.5) && !onWay(L, dx, dz, 1.5)) { add(F, 'links', `${b.key}: no path from the door (add a short spur path)`, b.door); doorBad++; }
  }
  if (B.length && !doorBad) add('pass', 'doors', B.length + ' doors on their walls, aprons clear, linked');
  for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) if (B[i].f && B[j].f && rOver(B[i].f, B[j].f, 0.05)) add(F, 'overlap', `${B[i].key} overlaps ${B[j].key}`, rC(B[i].f));
  // paths
  let liningBad = 0; for (const p of L.paths || []) { if (!LININGS.includes(p.lining)) { add('fail', 'lining', `path ${p.key}: lining must be lamps, lanterns or trees`, p.p && p.p[0]); liningBad++; } else if (!(p.every > 0 && p.every <= 20)) { add('fail', 'lining', `path ${p.key}: "every" must be 1..20 m`, p.p && p.p[0]); liningBad++; }
    if ((p.p || []).some(([x, z]) => Math.abs(x) > half || Math.abs(z) > half)) add('fail', 'bounds', `path ${p.key}: leaves the map`, p.p[0]); }
  if ((L.paths || []).length && !liningBad) add('pass', 'lining', 'every path lined');
  const thin = (L.paths || []).filter(p => (p.w || 4) < 4); if (thin.length) add('warn', 'paths', 'paths should be large + easy (4 m or wider): ' + thin.map(p => p.key).join(', '), thin[0].p && thin[0].p[0]);
  if (!legacy) { const miss = worldList(L).filter(x => !x.ok);
    if (miss.length) add('fail', 'every world', 'missing: ' + miss.map(m => m.label + (m.min > 1 ? ` (${m.have}/${m.min})` : '')).join(' · '));
    else add('pass', 'every world', 'every-world list complete'); }
  if (!(L.paths || []).length) add('fail', 'paths', 'no paths yet');
  // spawn + reach
  const sp = L.map && L.map.spawn; if (!sp) add('fail', 'spawn', 'map.spawn missing'); else if (!onWay(L, sp[0], sp[1], 1)) add('fail', 'spawn', 'spawn is not on a path or road', sp);
  if (sp && half) { const R = reach(L, sp), bad = [];
    for (const z of L.zones || []) if (!z.air && !z.sea && !R.anyIn(z)) bad.push('zone ' + z.key);
    for (const z of (L.zones || []).filter(z => z.air)) { if (R.anyIn(z)) add('warn', 'reach', `air-only zone ${z.key} can be walked into (ring it with a cliff hill)`, z.r ? rC(z.r) : null); else add('pass', 'reach', `${z.key}: by air only (parachute)`); }
    for (const b of B) if (b.door && b.face && !R.at(...apronFront(b))) bad.push('door ' + b.key);
    if (L.dock && L.dock.pad && !R.at(...L.dock.pad)) bad.push('dock');
    for (const g of L.gates || []) if (g.at && !R.at(...g.at)) bad.push('gate ' + g.key);
    if (bad.length) add(F, 'reach', 'not reachable on foot from spawn: ' + bad.join(', ')); else add('pass', 'reach', 'everything reachable on foot'); }
  // dock, gates, wild
  if (W && W !== 'earth' && !legacy) { if (!L.dock || !L.dock.pad) add('fail', 'dock', 'space dock missing (every world except earth)'); else if (L.dock.key !== W + 'Spacedock') add('fail', 'dock', `dock key must be ${W}Spacedock`, L.dock.pad); }
  for (const g of L.gates || []) if (g.kind === 'battle' && !(L.wild || []).some(w => w.for === g.key)) add(F, 'wild', `gate ${g.key}: no wild area for it`, g.at);
  for (const w of L.wild || []) { const r = w.r; if (!r) { add('fail', 'wild', `wild ${w.key}: needs r`); continue; }
    const hit = (L.paths || []).find(p => { const m = (p.w || 4) / 2; for (let x = r[0]; x <= r[1]; x += 4) for (let z = r[2]; z <= r[3]; z += 4) if (polyD(x, z, p.p || []) <= m) return true; return false; });
    if (hit) add(F, 'wild', `wild ${w.key} touches path ${hit.key}`, rC(r)); }
  // look + terrain (s345: every world looks different)
  if (!legacy) { const lk = L.look || {}; if (!lk.sky || !lk.grass) add('warn', 'look', 'add a "look" block (sky, fog, grass…) so this world looks like itself'); else add('pass', 'look', 'own look: sky ' + [].concat(lk.sky).join(' → '));
    const T = L.terrain || {}; for (const h of T.hills || []) { const hitB = (L.buildings || []).find(b => b.f && Math.hypot(Math.max(b.f[0] - h.c[0], 0, h.c[0] - b.f[1]), Math.max(b.f[2] - h.c[1], 0, h.c[1] - b.f[3])) < h.r); const hitP = (L.paths || []).find(p => p.p && polyD(h.c[0], h.c[1], p.p) < h.r);
      if (hitB || hitP) add('warn', 'terrain', `hill ${h.key || ''} reaches ${hitB ? hitB.key : hitP.key} (things there would sit in the slope)`, h.c); } }
  // props + budget
  for (const f of (L.terrain || {}).forests || []) if (!f.r) add('fail', 'terrain', `forest ${f.key || '?'}: needs r`);
  const nT = forestTrees(L).length + (L.paths || []).filter(p => p.lining === 'trees').reduce((s, p) => s + Math.floor(polyLen(p.p || []) / (p.every || 14)) * 2, 0);
  const badK = [...new Set((L.props || []).filter(p => !PROP_KINDS.includes(p.k)).map(p => p.k))]; if (badK.length) add('fail', 'props', 'unknown prop kinds (ask Ben): ' + badK.join(', '));
  const nB = B.length, nP = (L.props || []).length, nL = lampCount(L);
  add(nB > BUDGET.buildings || nP > BUDGET.props || nL > BUDGET.lamps || nT > BUDGET.trees ? 'warn' : 'pass', 'budget', `phone budget: ${nB}/${BUDGET.buildings} buildings · ${nP}/${BUDGET.props} props · ~${nL}/${BUDGET.lamps} lamps · ~${nT}/${BUDGET.trees} trees`);
  // palette refs
  const pal = L.palette || {}; for (const b of B) for (const v of Object.values(b.style || {})) if (typeof v === 'string' && v.startsWith('@') && !pal[v.slice(1)]) add('fail', 'palette', `${b.key}: palette name ${v} not in palette`);
  const counts = { fail: out.filter(o => o.level === 'fail').length, warn: out.filter(o => o.level === 'warn').length, pass: out.filter(o => o.level === 'pass').length };
  out.sort((a, b) => ({ fail: 0, warn: 1, pass: 2 }[a.level] - { fail: 0, warn: 1, pass: 2 }[b.level]));
  return { items: out, counts, ok: counts.fail === 0 };
}
// flood fill on a 2 m grid from the spawn: walls = footprints, water (unless a path / road crosses it), map edge
export function reach(L, sp, cell = 2) {
  const half = L.map.half, N = Math.ceil(2 * half / cell), g = new Uint8Array(N * N), id = (x, z) => { const i = Math.floor((x + half) / cell), j = Math.floor((z + half) / cell); return i < 0 || j < 0 || i >= N || j >= N ? -1 : j * N + i; };
  const B = (L.buildings || []).filter(b => b.f);
  const blocked = (x, z) => B.some(b => inR(x, z, b.f, -0.3)) || onCliff(L, x, z) || (inWater(L, x, z) && !onWay(L, x, z));
  const s = id(sp[0], sp[1]); if (s < 0) return { at: () => false, anyIn: () => false };
  const q = [s]; g[s] = 2;
  while (q.length) { const c = q.pop(), i = c % N, j = (c - i) / N;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N || b >= N) continue; const k = b * N + a; if (g[k]) continue;
      const x = -half + (a + 0.5) * cell, z = -half + (b + 0.5) * cell; if (blocked(x, z)) { g[k] = 1; continue; } g[k] = 2; q.push(k); } }
  const at = (x, z) => { const k = id(x, z); if (k < 0) return false; if (g[k] === 2) return true; const i = k % N, j = (k - i) / N; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const kk = (j + b) * N + i + a; if (g[kk] === 2) return true; } return false; };
  const anyIn = Z => { if (Z.r) { for (let x = Z.r[0]; x <= Z.r[1]; x += cell) for (let z = Z.r[2]; z <= Z.r[3]; z += cell) if (g[id(x, z)] === 2) return true; return false; }
    if (Z.c) { const [cx, cz, r] = Z.c; for (let x = cx - r; x <= cx + r; x += cell) for (let z = cz - r; z <= cz + r; z += cell) if (Math.hypot(x - cx, z - cz) < r && g[id(x, z)] === 2) return true; } return false; };
  return { at, anyIn };
}
