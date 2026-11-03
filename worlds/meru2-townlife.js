// MERU 2.0 — s143 TOWN LIFE (Ben's answers: BUILD_PLAN.md "TOWN LIFE — BEN'S ANSWERS"). Everyone in town has a home and walks between home,
// work and the shops by the game clock. Shops lock 20:00-8:00 (CLOSED sign on every door, E = the hours); Tavern, Casino, Meru Lanes, homes,
// the cluster lobbies and civic buildings (police, stations, hospital, motel, fire, barracks) never close.
// Phone: 4 walkers on screen, desktop up to 10 (drops when frames get slow); never bunched (5 m apart); only near the player.
// Off-screen everyone keeps living on cheap timers; a route (A* on a 2 m grid over the colliders, paths + sidewalks preferred) is only worked
// out when someone walks near the player. Follow a fox into a shop and they are inside, looking round by the door. TALK = one line.
// Hooks: meru2-city.js doors (openers, locked) · meru2-shopkit.js (away → the keeper is not behind the counter while they are home).
import { ROSTER, dressFox } from './meru2-roster.js';
import { CLUSTER_BUILDINGS } from './meru2-layout.js';

export const OPEN = [8, 20];
const H24 = new Set(['tavern', 'casino', 'bowling']);
const CIVIC = /^(crest|lake|police|barracks|castle|aviary|skateGate|pearlSail|ferryDock|cave|station[A-Za-z]*)$/;
const CIVIC_NAME = /hospital|motel|fire station|\bstation\b/i;
const NAMES = ['Pip', 'Maple', 'Rowan', 'Juniper', 'Basil', 'Clover', 'Fennel', 'Thistle', 'Bramble', 'Sorrel', 'Tansy', 'Wren', 'Poppy', 'Alder', 'Briar', 'Cedar', 'Dill', 'Ember Jr.', 'Fern', 'Ginger', 'Heath', 'Ivy', 'Jasper', 'Kit', 'Linden', 'Moss', 'Nutmeg', 'Olive', 'Pepin', 'Quince', 'Rusk', 'Saffron', 'Tumble', 'Umber', 'Vetch', 'Willow', 'Yarrow', 'Zinnia', 'Biscotti', 'Pumpernickel'];
const TORSO = ['#2e4a6b', '#7a3f6b', '#3f7a52', '#c9a24a', '#8a5a34', '#5b6570', '#b8407f', '#2e8bd8', '#a8323e', '#e6dfcf', '#4f6b4a', '#6b4a7a'];
const OUTF = ['vest', 'coat', 'dress', 'suit', 'robe', 'tee', 'vest', 'coat'];
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const inWin = (h, a, b) => { a = ((a % 24) + 24) % 24; b = ((b % 24) + 24) % 24; return a <= b ? h >= a && h < b : h >= a || h < b; };

export function buildTownLife(o) {
  const { THREE, scene, kit, L, city, clusters, cols, ground, camera, sayTo, female } = o, touch = !!o.touch, hour = o.hour || (() => 12), nameOf = o.nameOf || (() => '');
  const rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const titleCase = s => s.toLowerCase().replace(/(^|[\s'-])[a-z]/g, c => c.toUpperCase());
  const the = n => (/^(meru|mr\.|granny|the)\b/i.test(n) || /'s\b/.test(n) ? n : 'the ' + n);
  // ================= PLACES (every door a fox can walk to) =================
  const PL = new Map();
  const place = (key, name, x, z, fx, fz, ex) => { let p = PL.get(key); if (!p) { p = { key, name, doors: [], lastDep: -99, used: [], ...ex }; PL.set(key, p); } p.doors.push({ x, z, ox: x + fx * 2.6, oz: z + fz * 2.6, ix: -fx, iz: -fz }); return p; };
  for (const d of city.doors || []) { const b = d.b; if (!b || !b.key) continue; const ry = d.g ? d.g.rotation.y : 0; place(b.key, b.label || b.key, d.x, d.z, Math.sin(ry), Math.cos(ry), { b, city: true }); }
  { const b = L.BUILDINGS.find(q => q.key === 'barracks'); if (b && b.door && !PL.has('barracks')) { const F = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[b.face] || [0, 1]; place('barracks', b.label || 'Barracks', b.door[0], b.door[1], F[0], F[1], { b }); } }
  const FR = (clusters && clusters.frames) || {};
  for (const c of CLUSTER_BUILDINGS) { const D = FR[c.key] && FR[c.key].D; if (!D || D.x == null) continue; place('cl:' + c.key, titleCase(c.title), D.x, D.z, Math.sin(D.ry || 0), Math.cos(D.ry || 0), { cl: c.cl, cluster: true, home: c.kind === 'apt', battle: !!c.battle }); }
  for (const k of ['crest', 'lake']) if (PL.has(k)) PL.get(k).home = true;
  const ROOMS = (clusters && clusters.rooms) || [], ROOM2PL = {};
  for (const c of CLUSTER_BUILDINGS) { const p = PL.get('cl:' + c.key); if (!p) continue; p.room = c.room; ROOM2PL[c.room] = p; p.R = ROOMS.find(r => r && r.c && r.c.key === c.key) || null; p.ckeeper = c.keeper || null; }
  const always = p => !!(p.home || p.battle || H24.has(p.key) || CIVIC.test(p.key) || CIVIC_NAME.test(p.name));
  const isOpen = (p, h) => always(p) || (h >= OPEN[0] && h < OPEN[1]);
  const closable = p => !always(p);
  const inTown = p => p.city && Math.abs(p.doors[0].x) < 215 && p.doors[0].z > -215 && p.doors[0].z < 215;
  const TOWN_SHOPS = [...PL.values()].filter(p => inTown(p) && !p.home && !CIVIC.test(p.key) && !/station|hospital/i.test(p.name));
  const VENUES = [...H24].map(k => PL.get(k)).filter(Boolean);
  const CL_SHOPS = {}; for (const p of PL.values()) if (p.cluster && !p.home && !p.battle) (CL_SHOPS[p.cl] = CL_SHOPS[p.cl] || []).push(p);
  // ================= PEOPLE =================
  const PEOPLE = [], miss = [];
  const findWork = w => { if (!w) return null; let s = String(w).toLowerCase(); s = ({ 'meru museum': 'meru history museum' })[s] || s; if (s === 'firestation') return [...PL.values()].find(p => /fire/i.test(p.name)) || null;
    let best = null; for (const p of PL.values()) { const n = p.name.toLowerCase(); if (n === s) return p; if (!best && p.city && (n.includes(s) || s.includes(n))) best = p; } return best; };
  const homeOf = s => { const [k, flat] = String(s || '').split(' '); return { p: PL.get(k) || null, flat: flat || '' }; };
  const UNI = /^(guard|officer|chief|spritz)/;
  for (const r of ROSTER) { const hm = homeOf(r.home), wk = findWork(r.work), beat = UNI.test(r.key);
    if (!hm.p) { miss.push(r.name + ': home ' + r.home); continue; } if (!beat && !wk) { miss.push(r.name + ': work ' + r.work); continue; }
    const per = { key: r.key, name: r.name, role: r.role, look: r.look, kind: beat ? 'beat' : 'keeper', home: hm.p, flat: hm.flat, work: wk, shift: r.shift, stops: r.stops || [], sp: r.look && r.look.look && r.look.look.elder ? 1.0 : 1.25 };
    PEOPLE.push(per); if (!beat && closable(wk) && !wk.keeperP) wk.keeperP = per; }
  // shop keepers built by the shop kit (every Town 2 interior): the kit's door tells which building it is
  for (const K of window.__shopKits || []) { if (!K.keeper || !K.doorWorld) continue; let w = null; try { w = K.doorWorld(); } catch (e) {} if (!w) continue;
    let best = null, bd = 9; for (const p of PL.values()) if (p.city) for (const d of p.doors) { const dd = Math.hypot(d.x - w.x, d.z - w.z); if (dd < bd) { bd = dd; best = p; } }
    if (!best) continue; (best.kits = best.kits || []).push(K);
    if (closable(best)) K.away = () => { const kp = best.keeperP; return kp ? !(kp.st === 'in' && kp.at === best) : !isOpen(best, hour()); }; }
  let hi = 0;
  for (const p of PL.values()) { if (!p.kits || p.keeperP || !closable(p)) continue; const KP = p.kits[0].keeper, u = KP.userData || {}, mk = u.mk || {}, home = PL.get(hi % 2 ? 'lake' : 'crest'); if (!home) continue;
    const per = { key: 'k_' + p.key, name: nameOf(u.foxKey) || u.foxName || mk.name || '', role: p.name, look: { torso: mk.torso, outfit: mk.outfit, look: mk.look, crest: mk.crest, eyes: mk.eyes, legColor: mk.legColor }, kind: 'keeper', home, flat: String(301 + (hi >> 1)), work: p, shift: OPEN, stops: hi % 3 === 0 ? ['pm'] : [], sp: 1.2 };
    hi++; PEOPLE.push(per); p.keeperP = per; }
  // cluster keepers (part B): live in their cluster's apartment block, walk to their lobby desk by the clock
  for (const p of PL.values()) { if (!p.cluster || !p.ckeeper || !closable(p) || p.keeperP) continue; const home = [...PL.values()].find(q => q.cluster && q.home && q.cl === p.cl); if (!home) continue;
    const KF = p.R && p.R.keeper, mk = (KF && KF.userData && KF.userData.mk) || {}, [kk, kn, kr] = p.ckeeper;
    const per = { key: 'ck_' + kk, name: kn, role: kr, look: { torso: mk.torso, outfit: mk.outfit, look: mk.look }, kind: 'keeper', home, flat: String(201 + (hash(kk) % 9)), work: p, shift: OPEN, stops: [], sp: 1.2, kf: KF };
    PEOPLE.push(per); p.keeperP = per; }
  // the cluster ENTER spots: locked 20:00-8:00 like the town doors
  for (const s of (clusters && clusters.spots) || []) { if (!s || typeof s.key !== 'string' || !s.key.startsWith('cl:in:')) continue; const p = PL.get('cl:' + s.key.slice(6)); if (!p || !closable(p)) continue; const base = s.prompt, use0 = s.use;
    Object.defineProperty(s, 'prompt', { configurable: true, get: () => (isOpen(p, hour()) ? base : p.name.toUpperCase() + ' \u00b7 CLOSED \u00b7 OPENS 8:00') });
    s.use = (...a) => { if (isOpen(p, hour())) return use0 && use0(...a); toastS = p.name.toUpperCase() + ' \u00b7 CLOSED \u00b7 OPEN 8:00 \u2013 20:00 \u00b7 NOW ' + String(hour()).padStart(2, '0') + ':00'; toastT = 3.5; }; p.spotLock = true; }
  const lookFor = seed => { const r = rng(hash(seed)), fem = r() < 0.5, outfit = fem && r() < 0.5 ? 'dress' : OUTF[(r() * OUTF.length) | 0]; return { torso: TORSO[(r() * TORSO.length) | 0], outfit, look: fem ? female : undefined, mood: 'happy' }; };
  let ni = 0; const nextName = () => NAMES[ni++ % NAMES.length];
  const WINS = { day: [9, 19], late: [13, 23], owl: [19, 27] };
  for (let i = 0; i < 18; i++) { const home = PL.get(i % 2 ? 'lake' : 'crest'); if (!home) continue; const type = i % 10 < 7 ? 'day' : i % 10 < 9 ? 'late' : 'owl', w = WINS[type], sh = (hash('w' + i) % 3) - 1;
    PEOPLE.push({ key: 'c_town' + i, name: nextName(), role: 'Townsfox', look: lookFor('c_town' + i), kind: 'cust', home, flat: String(401 + (i >> 1)), area: 'town', win: [w[0] + sh, w[1] + sh], sp: rnd(1.05, 1.4) }); }
  for (const p of PL.values()) { if (!p.cluster || !p.home || !(CL_SHOPS[p.cl] || []).length) continue;
    for (let i = 0; i < 5; i++) { const k = 'c_' + p.cl + i, sh = (hash(k) % 3) - 1; PEOPLE.push({ key: k, name: nextName(), role: 'Lives at ' + p.name, look: lookFor(k), kind: 'cust', home: p, flat: String(101 + i * 7), area: p.cl, win: [9 + sh, 19 + sh], sp: rnd(1.05, 1.4) }); } }
  const BEATK = ['police', 'bank', 'itemshop', 'armory', 'tavern', 'burgers', 'bowling', 'casino'].map(k => PL.get(k)).filter(Boolean);
  PEOPLE.filter(p => p.kind === 'beat').forEach((p, i) => { p.loop = BEATK.map((_, j) => BEATK[(j + i * 3) % BEATK.length]); p.li = 0; p.sp = 1.2; });
  // ================= ROUTES: A* on a 2 m grid =================
  const CS = 2, HALF = 560, GN = Math.ceil(HALF * 2 / CS), GA = GN * GN, LIMIT = touch ? 70000 : 120000;
  const gi = x => clamp(Math.floor((x + HALF) / CS), 0, GN - 1), cx = i => (i + 0.5) * CS - HALF;
  const ROADSEG = [], PATHSEG = []; for (const r of L.ROADS || []) for (let i = 1; i < r.p.length; i++) ROADSEG.push([r.p[i - 1], r.p[i], r.w / 2]);
  for (const r of L.PATHS || []) for (let i = 1; i < r.p.length; i++) PATHSEG.push([r.p[i - 1], r.p[i], 2.4]);
  const PLAZA = ((L.SKYLINE && L.SKYLINE.plazas) || []).map(q => q.r), SW = (L.SIDEWALK || 3.3) + 0.4;
  const segD = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz || 1, t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / l2, 0, 1); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); };
  function costAt(x, z) { for (const [a, b, hw] of ROADSEG) { const d = segD(x, z, a, b); if (d < hw) return 30; if (d < hw + SW) return 10; }
    for (const [a, b, hw] of PATHSEG) if (segD(x, z, a, b) < hw) return 10;
    for (const r of PLAZA) if (x > r[0] && x < r[1] && z > r[2] && z < r[3]) return 11;
    const s = L.surfaceAt ? L.surfaceAt(x, z) : 'grass'; return s === 'stone' || s === 'wood' || s === 'grit' ? 11 : s === 'sand' ? 16 : 20; }
  let S = null;
  function grid() { if (S) return S; S = { st: new Uint8Array(GA), cost: new Uint8Array(GA), g: new Float32Array(GA), stamp: new Uint32Array(GA), closed: new Uint32Array(GA), par: new Int32Array(GA), run: 0 };
    const mark = (i0, i1, j0, j1) => { for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) S.st[j * GN + i] = 2; };
    for (const c of cols) { if (c.tl) continue;
      if (c.f) { const f = c.f; if (f[1] - f[0] > 160 || f[3] - f[2] > 160) continue; mark(gi(f[0]), gi(f[1]), gi(f[2]), gi(f[3])); }
      else if (c.c) { const [x, z, r] = c.c; if (r > 25 || Math.abs(x) > HALF || Math.abs(z) > HALF) continue; if (r < 1) { mark(gi(x), gi(x), gi(z), gi(z)); continue; }
        for (let j = gi(z - r); j <= gi(z + r); j++) for (let i = gi(x - r); i <= gi(x + r); i++) if (Math.hypot(cx(i) - x, cx(j) - z) < r + 0.4) S.st[j * GN + i] = 2; } }
    return S; }
  const ok = q => { const s = S.st[q]; if (s) return s === 1; const x = cx(q % GN), z = cx((q / GN) | 0); let bad = false; try { const g = ground(x, z); bad = !g || g.water; } catch (e) { bad = true; } if (!bad && L.outOfMap && L.outOfMap(x, z, 2)) bad = true;
    S.st[q] = bad ? 2 : 1; if (!bad) S.cost[q] = costAt(x, z); return !bad; };
  const snap = (x, z) => { const i = gi(x), j = gi(z); for (let r = 0; r <= 4; r++) { let best = -1, bd = 1e9; for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue; const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= GN || jj >= GN) continue; const q = jj * GN + ii; if (!ok(q)) continue; const d = Math.hypot(cx(ii) - x, cx(jj) - z); if (d < bd) { bd = d; best = q; } } if (best >= 0) return best; } return -1; };
  const HK = [], HF = [];
  const hpush = (k, f) => { let i = HK.length; HK.push(k); HF.push(f); while (i > 0) { const p = (i - 1) >> 1; if (HF[p] <= f) break; HK[i] = HK[p]; HF[i] = HF[p]; i = p; } HK[i] = k; HF[i] = f; };
  const hpop = () => { const top = HK[0], lk = HK.pop(), lf = HF.pop(); if (HK.length) { let i = 0; const n = HK.length; for (;;) { let c = 2 * i + 1; if (c >= n) break; if (c + 1 < n && HF[c + 1] < HF[c]) c++; if (HF[c] >= lf) break; HK[i] = HK[c]; HF[i] = HF[c]; i = c; } HK[i] = lk; HF[i] = lf; } return top; };
  const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];
  function astar(s, t) { const run = ++S.run; HK.length = HF.length = 0; const ti = t % GN, tj = (t / GN) | 0;
    const hh = q => { const dx = Math.abs(q % GN - ti), dz = Math.abs(((q / GN) | 0) - tj); return (Math.max(dx, dz) + 0.4142 * Math.min(dx, dz)) * CS; };
    S.g[s] = 0; S.stamp[s] = run; S.par[s] = -1; hpush(s, hh(s)); let n = 0;
    while (HK.length) { const k = hpop(); if (k === t) break; if (S.closed[k] === run) continue; S.closed[k] = run; if (++n > LIMIT) return null; const i = k % GN, j = (k / GN) | 0;
      for (const [di, dj, m] of DIRS) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= GN || jj >= GN) continue; const q = jj * GN + ii; if (!ok(q)) continue; if (di && dj && (!ok(j * GN + ii) || !ok(jj * GN + i))) continue;
        const ng = S.g[k] + S.cost[q] / 10 * m * CS; if (S.stamp[q] !== run || ng < S.g[q]) { S.stamp[q] = run; S.g[q] = ng; S.par[q] = k; hpush(q, ng + hh(q)); } } }
    if (S.stamp[t] !== run) return null; const out = []; for (let k = t; k >= 0; k = S.par[k]) { out.push([cx(k % GN), cx((k / GN) | 0)]); if (out.length > 4000) return null; } return out.reverse(); }
  const los = (a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], d = Math.hypot(dx, dz), n = Math.ceil(d / (CS * 0.5)); const qa = gi(a[1]) * GN + gi(a[0]), qb = gi(b[1]) * GN + gi(b[0]); const mx = Math.max(S.cost[qa] || 10, S.cost[qb] || 10);
    for (let k = 1; k < n; k++) { const x = a[0] + dx * k / n, z = a[1] + dz * k / n, q = gi(z) * GN + gi(x); if (!ok(q) || S.cost[q] > mx) return false; } return true; };
  const RT = new Map(); const Q = [];
  const doorPair = (a, b) => { let best = null, bd = 1e9; for (const da of a.doors) for (const db of b.doors) { const d = Math.hypot(da.ox - db.ox, da.oz - db.oz); if (d < bd) { bd = d; best = [da, db]; } } return best; };
  function build(a, b) { grid(); const [da, db] = doorPair(a, b), s = snap(da.ox, da.oz), t = snap(db.ox, db.oz); if (s < 0 || t < 0) return { fail: true };
    let pts; if (los([da.ox, da.oz], [db.ox, db.oz])) pts = [];
    else { const raw = astar(s, t); if (!raw) return { fail: true }; pts = [[da.ox, da.oz]]; let i = 0; while (i < raw.length - 1) { let j = i + 1; while (j + 1 < raw.length && j - i < 40 && los(pts[pts.length - 1], raw[j + 1])) j++; pts.push(raw[j]); i = j; } pts.shift(); }
    const P = [[da.x, da.z], [da.ox, da.oz], ...pts, [db.ox, db.oz], [db.x, db.z]], cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    return { pts: P, cum, len: cum[cum.length - 1] }; }
  const rev = r => { if (r.fail) return r; const pts = [...r.pts].reverse(), cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, cum, len: cum[cum.length - 1] }; };
  const want = (a, b) => { const k = a.key + '>' + b.key; if (RT.has(k)) return RT.get(k); RT.set(k, 'q'); Q.push([a, b]); return 'q'; };
  function routeWork() { const t0 = performance.now(); while (Q.length && performance.now() - t0 < (touch ? 6 : 10)) { const [a, b] = Q.shift(); let r; try { r = build(a, b); } catch (e) { r = { fail: true }; console.warn('town life route: ' + (e && e.message)); } RT.set(a.key + '>' + b.key, r); RT.set(b.key + '>' + a.key, rev(r)); break; } }
  // ================= SCHEDULE =================
  let now = 0;
  let lastP = null; const playerKey = () => { if (city.inside) return city.inside.key; if (lastP && clusters && clusters.where) { const w = clusters.where(lastP); const p = w && ROOM2PL[w.key]; if (p) return p.key; } return ''; };
  const baseOf = (p, h) => { if (p.kind === 'keeper') { const w = p.work; return !closable(w) || (h >= OPEN[0] - 1 && h < OPEN[1]) ? 'work' : 'home'; }   // 24 h places (motel, hospital…): their keeper never leaves the desk
    if (p.kind === 'beat') return inWin(h, p.shift[0], p.shift[1]) ? 'patrol' : 'home'; return inWin(h, p.win[0], p.win[1]) ? 'errand' : 'home'; };
  const shopsFor = (p, h) => { const L0 = p.area === 'town' ? (h >= OPEN[0] && h < OPEN[1] ? TOWN_SHOPS : VENUES) : (CL_SHOPS[p.area] || []); return L0.filter(q => q !== p.at && isOpen(q, h)); };
  const pickShop = (p, h) => { const L0 = shopsFor(p, h); if (!L0.length) return null; const d = p.at.doors[0]; const near = L0.map(q => [q, Math.hypot(q.doors[0].x - d.x, q.doors[0].z - d.z)]).sort((a, b) => a[1] - b[1]).slice(0, 7); return near[(Math.random() * near.length) | 0][0]; };
  const nearestVenue = from => { let best = null, bd = 1e9; for (const v of VENUES) { const d = Math.hypot(v.doors[0].x - from.doors[0].x, v.doors[0].z - from.doors[0].z); if (d < bd) { bd = d; best = v; } } return bd < 220 ? best : null; };
  const DW = { shop: [25, 60], venue: [60, 150], venueStop: [40, 80], beat: [12, 22], home: [30, 110], work: [3, 3] };
  function startLeg(p, to, plan) { const from = p.at, pr = doorPair(from, to), da = pr[0], db = pr[1]; const est = Math.hypot(db.x - da.x, db.z - da.z) * 1.35 + 6;
    p.leg = { from, to, plan, t0: now + (playerKey() === from.key ? 2.5 : 0), dur: est / p.sp, route: null, key: from.key + '>' + to.key, da, db }; p.st = 'walk'; p.at = null; from.lastDep = now; }
  function arrive(p) { const L0 = p.leg; p.st = 'in'; p.at = L0.to; p.enterT = now; p.spot = null; const w = DW[L0.plan] || DW.shop; p.until = now + rnd(w[0], w[1]); p.lastPlan = L0.plan; p.leg = null; }
  const fitDur = (p, r) => { const L0 = p.leg; if (!L0 || L0.route || !r || r === 'q' || r.fail) return; L0.route = r; const sp = r.len / L0.dur; if (sp > 2) L0.dur = r.len / 2; else if (sp < 0.8) L0.dur = r.len / 0.8; };
  function think(p, h) {
    if (p.st === 'walk') { if (now >= p.leg.t0 + p.leg.dur) arrive(p); return; }
    const nb = baseOf(p, h); if (nb !== p.base) { p.base = nb; p.go = now + 2 + (hash(p.key + h) % 1000) / 1000 * 40; }
    if (now < p.until || now < (p.go || 0)) return;
    if (now - p.at.lastDep < 6) { p.until = p.at.lastDep + 6 + rnd(0, 3); return; }   // Ben: never bunched — one fox out of a door at a time
    let to = null, plan = null;
    if (p.kind === 'keeper') { const tgt = nb === 'work' ? p.work : p.home; if (p.at === tgt) { p.until = now + 3; return; }
      if (p.at === p.work && playerKey() === p.work.key) { p.until = now + 2; return; }   // the keeper waits for you to leave before locking up
      to = tgt; plan = nb === 'work' ? 'work' : 'home'; if (plan === 'home' && p.at === p.work && p.stops.includes('pm')) { const v = nearestVenue(p.work); if (v) { to = v; plan = 'venueStop'; } } }
    else if (p.kind === 'beat') { if (nb === 'patrol' && p.loop.length) { to = p.loop[p.li % p.loop.length]; if (to === p.at) { p.li++; to = p.loop[p.li % p.loop.length]; } p.li++; plan = 'beat'; } else if (p.at !== p.home) { to = p.home; plan = 'home'; } else { p.until = now + 5; return; } }
    else { if (nb === 'errand') { if (p.at === p.home || Math.random() < 0.35) { to = pickShop(p, h); plan = to && VENUES.includes(to) ? 'venue' : 'shop'; } if (!to && p.at !== p.home) { to = p.home; plan = 'home'; } } else if (p.at !== p.home) { to = p.home; plan = 'home'; } if (!to) { p.until = now + rnd(20, 40); return; } }
    if (!to || to === p.at) { p.until = now + 5; return; } startLeg(p, to, plan); }
  function initAll(h) { for (const p of PEOPLE) { p.base = baseOf(p, h); p.go = 0; p.st = 'in';
      if (p.kind === 'keeper') { p.at = p.base === 'work' ? p.work : p.home; p.until = now + 3; }
      else if (p.kind === 'beat') { if (p.base === 'patrol') { p.li = (Math.random() * p.loop.length) | 0; p.at = p.loop[p.li] || p.home; } else p.at = p.home; p.until = now + rnd(0, 20); }
      else { p.at = p.home; p.until = now + rnd(0, 50); if (p.base === 'errand' && Math.random() < 0.5) { const s = pickShop(p, h); if (s) { p.at = s; p.until = now + rnd(3, 40); } } }
      p.enterT = -99; }
    // a few already out on the street when you arrive
    for (const p of PEOPLE) if (p.kind !== 'keeper' && p.base !== 'home' && Math.random() < 0.3) { think(p, h); if (p.st !== 'walk') { p.until = 0; think(p, h); } if (p.st === 'walk') p.leg.t0 = now - Math.random() * p.leg.dur * 0.8; } }
  // ================= SHOWING THEM (phone budget, spacing, appear only where it can't be seen popping) =================
  const MAXB = touch ? 4 : 10; let budget = touch ? 4 : 8, ema = 1 / 60, adaptT = 0;
  const RR = touch ? 50 : 75, GAP = 5;
  const COLS = [...Array(MAXB)].map(() => { const c = { c: [1e5, 1e5, 0.42], tl: true }; cols.push(c); return c; });
  const FX = new Map(); let mkCD = 0; const shown = new Set();
  function foxOf(p) { let f = FX.get(p.key); if (f) return f; if (mkCD > 0) return null; mkCD = touch ? 0.3 : 0.12;
    if (FX.size >= MAXB + 6) for (const [k, g] of FX) if (![...shown].some(q => q.key === k)) { g.parent && g.parent.remove(g); FX.delete(k); break; }
    const { hat, ...a } = p.look || {}; try { f = kit.makeFox({ ...a, key: 'tl_' + p.key, name: p.name, gear: 'none', mood: a.mood || 'happy' }); } catch (e) { return null; }
    if (hat) try { dressFox(THREE, f, hat); } catch (e) {} f.userData.crowd = true; f.userData.townLife = p.key; f.scale.multiplyScalar(0.95 + (hash(p.key) % 100) / 1000); f.visible = false; if (!f.parent) scene.add(f); FX.set(p.key, f); return f; }
  const colBlock = (x, z, r) => { for (const c of cols) { if (c.tl || c.on === false) continue; if (c.c) { if (Math.hypot(x - c.c[0], z - c.c[1]) < c.c[2] + r) return true; } else if (c.f) { const f = c.f; if (x > f[0] - r && x < f[1] + r && z > f[2] - r && z < f[3] + r) return true; } } return false; };
  function spotFor(p, pl) { const d = pl.doors[0], lx = -d.iz, lz = d.ix, box = city.insideBox;
    for (const [a, b] of [[3, 1.8], [3, -1.8], [4.6, 2.6], [4.6, -2.6], [2.4, 2.6], [2.4, -2.6], [6, 1.6], [6, -1.6]]) { const x = d.x + d.ix * a + lx * b, z = d.z + d.iz * a + lz * b;
      if (box && !(x > box.x0 + 0.6 && x < box.x1 - 0.6 && z > box.z0 + 0.6 && z < box.z1 - 0.6)) continue; if (pl.used.some(u => u !== p && u.spot && Math.hypot(u.spot[0] - x, u.spot[1] - z) < 1.3)) continue; if (colBlock(x, z, 0.45)) continue; return [x, z]; } return null; }
  const along = (r, s) => { const C = r.cum, P = r.pts; let i = 1; while (i < C.length - 1 && C[i] < s) i++; const a = P[i - 1], b = P[i], l = C[i] - C[i - 1] || 1, t = clamp((s - C[i - 1]) / l, 0, 1); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
  // where a person is right now: { x, z, yaw, mv, indoor, door } or null (inside somewhere you can't see / no route yet)
  function posOf(p, pk) {
    const indoorOK = pl => !!pl && pl.city && pl.key === pk && !pl.home && pl !== null && pl.key !== 'itemshop' && !(pl.keeperP === p && p.kind === 'keeper' && p.at === p.work);
    if (p.st === 'in') { const pl = p.at; if (!indoorOK(pl)) return null; if (!p.spot) { p.spot = spotFor(p, pl); if (!p.spot) return null; if (!pl.used.includes(p)) pl.used.push(p); }
      const d = pl.doors[0], k = clamp((now - p.enterT) / 2.5, 0, 1), sx = d.x + d.ix * 0.6, sz = d.z + d.iz * 0.6, x = sx + (p.spot[0] - sx) * k, z = sz + (p.spot[1] - sz) * k; return { x, z, yaw: k < 1 ? Math.atan2(p.spot[0] - sx, p.spot[1] - sz) : null, mv: k < 1 ? 1.1 : 0, indoor: true }; }
    const L0 = p.leg, u = (now - L0.t0) / L0.dur;
    if (u < 0) { const pl = L0.from; if (!indoorOK(pl) || !p.spot) return null; const d = pl.doors[0], k = clamp(-u * L0.dur / 2.5, 0, 1), ex = d.x + d.ix * 0.6, ez = d.z + d.iz * 0.6; return { x: ex + (p.spot[0] - ex) * k, z: ez + (p.spot[1] - ez) * k, yaw: Math.atan2(ex - p.spot[0], ez - p.spot[1]), mv: 1.1, indoor: true }; }
    const r = L0.route; if (!r) return null; const s = clamp(u, 0, 1) * r.len, [x, z, tx, tz] = along(r, s), off = (p.side || 0.8) * clamp(Math.min(s, r.len - s) / 4, 0, 1);
    return { x: x - tz * off, z: z + tx * off, yaw: Math.atan2(tx, tz), mv: r.len / L0.dur, indoor: false, door: s < 4 || r.len - s < 4 }; }
  const approx = p => { const L0 = p.leg; if (!L0) return null; const u = clamp((now - L0.t0) / L0.dur, 0, 1); return [L0.da.x + (L0.db.x - L0.da.x) * u, L0.da.z + (L0.db.z - L0.da.z) * u]; };
  const V3 = new THREE.Vector3(); const offScreen = (x, y, z) => { V3.set(x, y + 1, z).project(camera); return V3.z > 1 || Math.abs(V3.x) > 1.08 || Math.abs(V3.y) > 1.1; };
  let selT = 0, thinkT = 0, toastS = '', toastT = 0, signT = 0;
  function select(P) { const pk = playerKey(), cand = [];
    for (const p of PEOPLE) { if (p.st === 'walk' && !p.leg.route) { const a = approx(p), r = RT.get(p.leg.key); if (r && r !== 'q') fitDur(p, r); else if (a && Math.hypot(a[0] - P.x, a[1] - P.z) < RR + 50) want(p.leg.from, p.leg.to); }
      const q = posOf(p, pk); p._q = q; if (!q) continue; const d = Math.hypot(q.x - P.x, q.z - P.z); if (d > (q.indoor ? 30 : RR)) continue; cand.push([p, shown.has(p) ? d - 15 : d, d]); }
    cand.sort((a, b) => a[1] - b[1]); const pick = [];
    for (const [p, , d] of cand) { if (pick.length >= budget) break; const q = p._q; if (pick.some(o => Math.hypot(o._q.x - q.x, o._q.z - q.z) < (q.indoor || o._q.indoor ? 1.2 : GAP))) continue;
      if (!shown.has(p) && !q.indoor && !q.door && d < 20 && !offScreen(q.x, P.y, q.z)) continue; pick.push(p); }
    for (const p of [...shown]) if (!pick.includes(p)) { shown.delete(p); const f = FX.get(p.key); if (f) f.visible = false; }
    for (const p of pick) if (!shown.has(p)) { const f = foxOf(p); if (f) { shown.add(p); f.position.set(p._q.x, 0, p._q.z); if (p._q.yaw != null) f.rotation.y = p._q.yaw; } } }
  const turnTo = (f, a, k) => { let d = a - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, k); };
  // ================= CLOSED signs on the doors =================
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const signM = new THREE.MeshBasicMaterial({ map: CT(256, 128, (g, W, H) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, W, H); g.strokeStyle = '#f3f2f2'; g.lineWidth = 5; g.strokeRect(7, 7, W - 14, H - 14); g.fillStyle = '#ffffff'; g.font = '900 54px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('CLOSED', 20, 50); g.fillStyle = '#ffd23a'; g.font = '900 22px Archivo, sans-serif'; g.fillText('OPEN 8:00 \u2013 20:00', 20, 100); }) });
  const signGeo = new THREE.PlaneGeometry(1.1, 0.55), SIGNS = [];
  for (const d of city.doors || []) { const p = d.b && PL.get(d.b.key); if (!p || !closable(p) || !d.g) continue; const m = new THREE.Mesh(signGeo, signM); m.position.set(0, 1.75, 0.1); m.visible = false; m.renderOrder = 2; d.g.add(m); SIGNS.push({ m, p, d }); }
  city.locked = b => { const p = b && PL.get(b.key); return !!p && closable(p) && !isOpen(p, hour()); };
  const lockedNear = P => { if (city.inside || (P.y || 0) > 2) return null; for (const s of SIGNS) if (!isOpen(s.p, hour()) && Math.hypot(P.x - s.d.x, P.z - s.d.z) < 3) return s; return null; };
  // ================= talk =================
  const nearTalk = P => { let best = null, bd = 2.1; for (const p of shown) { const q = p._q; if (!q) continue; const d = Math.hypot(q.x - P.x, q.z - P.z); if (d < bd) { bd = d; best = p; } } return best; };
  const label = p => (p.name ? p.name : the(p.role) + ' keeper').toUpperCase();
  function lineFor(p) { const L0 = p.leg, q = p._q;
    if (q && q.indoor) return p.st === 'in' ? 'Just having a look round ' + the(p.at.name) + '.' : 'All done in here. Off I go!';
    if (!L0) return 'Lovely day in Meru.';
    const to = the(L0.to.name), home = L0.to.name + (p.flat ? ', flat ' + p.flat : '');
    if (L0.plan === 'work') return closable(p.work) ? 'Morning! Off to open ' + the(p.work.name) + ' for 8:00.' : 'Off to work at ' + the(p.work.name) + '.';
    if (L0.plan === 'home') return p.kind === 'keeper' ? titleCase(the(p.work.name)) + ' is shut for the night. Home to ' + home + '.' : p.kind === 'beat' ? "Shift's over. Home to " + home + '.' : 'Heading home to ' + home + '. My feet are tired!';
    if (L0.plan === 'venue' || L0.plan === 'venueStop') return 'Off to ' + to + '. It never closes!';
    if (L0.plan === 'beat') return 'On the beat. Next stop, ' + to + '.';
    return 'Popping into ' + to + '. Need anything?'; }
  function talk(P) { const p = nearTalk(P);
    if (p) { const f = FX.get(p.key); const T = { key: 'tl_' + p.key, obj: f, name: p.name || label(p), role: (p.kind === 'cust' ? p.role : p.role || '').toUpperCase(), r: 2.4 }; p.talkT = 6;
      const CK = p.kind === 'cust' && globalThis.__m2VO && Math.random() < 0.6 ? globalThis.__m2VO.crowd(p.look && p.look.look && p.look.look.elder ? 'ELDER' : p.look && p.look.look ? 'WOMAN' : 'MAN') : null;   /* s181 voice pack 2: crowd foxes speak a TOWNSFOLK line of their voice */
      try { sayTo(T, [CK ? { who: T.key, role: T.role, text: CK.text, vo: CK.vo } : { who: T.key, role: T.role, text: lineFor(p) }]); } catch (e) { toastS = lineFor(p); toastT = 3; } return true; }
    const s = lockedNear(P); if (s) { const h = hour(); toastS = s.p.name.toUpperCase() + ' \u00b7 CLOSED \u00b7 OPEN 8:00 \u2013 20:00 \u00b7 NOW ' + String(h).padStart(2, '0') + ':00'; toastT = 3.5; return true; }
    return false; }
  function prompt(P) { const p = nearTalk(P); if (p) return 'TALK \u00b7 ' + label(p); const s = lockedNear(P); if (s) return s.p.name.toUpperCase() + ' \u00b7 CLOSED \u00b7 OPENS 8:00'; return null; }
  // ================= per frame =================
  let started = false;
  function tick(dt, P) { if (!P || !dt) return; dt = Math.min(dt, 0.1); now += dt; const h = hour();
    lastP = P; if (!started) { started = true; initAll(h); }
    if ((toastT -= dt) <= 0) toastS = ''; mkCD -= dt;
    ema += (dt - ema) * 0.05; if ((adaptT += dt) > 2) { adaptT = 0; if (ema > 1 / 24 && budget > 2) budget--; else if (ema < 1 / 45 && budget < (touch ? 4 : MAXB)) budget++; }
    if ((thinkT -= dt) <= 0) { thinkT = 0.25; for (const p of PEOPLE) think(p, h); for (const pl of PL.values()) if (pl.used.length) pl.used = pl.used.filter(u => u.st === 'in' ? u.at === pl : u.leg && u.leg.from === pl && now < u.leg.t0); }
    routeWork();
    if ((selT -= dt) <= 0) { selT = 0.25; select(P); }
    const pk = playerKey(), op = []; let ci = 0;
    for (const p of shown) { const f = FX.get(p.key); if (!f) continue;
      if (p.talkT > 0) { p.talkT -= dt; if (p.leg) p.leg.t0 += dt; else p.until = Math.max(p.until, now + 1); }
      let q = posOf(p, pk); if (!q) { f.visible = false; continue; }
      const dP = Math.hypot(P.x - q.x, P.z - q.z);
      if (p.leg && !q.indoor && p.talkT <= 0) { const ahead = (P.x - q.x) * Math.sin(q.yaw) + (P.z - q.z) * Math.cos(q.yaw) > 0; if (dP < 1.2 && ahead && (p.blk = (p.blk || 0) + dt) < 1.6) { p.leg.t0 += dt; q = posOf(p, pk) || q; q.mv = 0; } else if (dP >= 1.2) p.blk = 0; }
      p._q = q; f.visible = true; let y = 0; try { const g = ground(q.x, q.z); y = (g && g.h) || 0; } catch (e) {} f.position.set(q.x, y, q.z);
      const face = p.talkT > 0 || (dP < 2.2 && !q.mv) ? Math.atan2(P.x - q.x, P.z - q.z) : q.yaw; if (face != null) turnTo(f, face, dt * 6);
      kit.animFox && kit.animFox(f, dt, p.talkT > 0 ? 0 : q.mv, false);
      if (!q.indoor && ci < COLS.length) { COLS[ci].c[0] = q.x; COLS[ci].c[1] = q.z; ci++; } op.push([q.x, q.z]); }
    for (; ci < COLS.length; ci++) { COLS[ci].c[0] = 1e5; COLS[ci].c[1] = 1e5; }
    city.openers = op;
    if ((signT -= dt) <= 0) { signT = 0.5; for (const s of SIGNS) s.m.visible = !isOpen(s.p, h);
      for (const p of PL.values()) { const kp = p.keeperP, kf = kp && kp.kf; if (!kf) continue; const here = kp.st === 'in' && kp.at === p; if (!here && pk !== p.key) { if (kf.visible) { kf.visible = false; kf.userData.tlHid = true; } } else if (kf.userData.tlHid) { kf.visible = true; kf.userData.tlHid = false; } } } }
  const api = { tick, prompt, talk, toast: () => toastS, busy: () => null, camFix() {}, quit() {}, useItem: () => false, people: PEOPLE, places: PL, isOpen: (k, h = hour()) => { const p = PL.get(k); return !p || isOpen(p, h); },
    stats: () => ({ people: PEOPLE.length, places: PL.size, walking: PEOPLE.filter(p => p.st === 'walk').length, shown: [...shown].map(p => p.name + (p._q && p._q.indoor ? ' (in)' : '')), budget, routes: [...RT.values()].filter(r => r && r !== 'q' && !r.fail).length, failed: [...RT.values()].filter(r => r && r.fail).length, queue: Q.length, miss }),
    who: k => { const p = PEOPLE.find(q => q.key === k || q.name === k); return p && { name: p.name, st: p.st, at: p.at && p.at.name, to: p.leg && p.leg.to.name, plan: p.leg && p.leg.plan, base: p.base }; },
    route: (a, b) => { const A = PL.get(a), B = PL.get(b); return A && B ? build(A, B) : null; } };
  window.__townLife = api;
  console.info('town life: ' + PEOPLE.length + ' foxes, ' + PL.size + ' places, ' + SIGNS.length + ' lockable doors' + (miss.length ? ' · not placed: ' + miss.join(', ') : ''));
  return api;
}
