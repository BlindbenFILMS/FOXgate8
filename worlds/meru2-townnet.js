// MERU 2.0 — FOUNTAIN-AREA PATH NETWORK (Ben, s34). One function used by BOTH the Town Layout Workshop (PATHS tab) and the game,
// so what Ben agrees in the plan is exactly what gets built. townNet(buildings, choices) → routes [{ id, kind, w, pts, on, ... }] + routes.plazas
// (brick entrance clearings). Kinds: main 3.2 m (the yellow brick road, already built by meru2-yellowroad.js), spur / spur2 / extra 2.4 m, front / link 2 m.
// choices = worlds/meru2-townpaths.js TOWN_PATHS, overridden by localStorage 'meru2.townPaths' (the workshop saves there).
import { TOWN_PATHS } from './meru2-townpaths.js';
export function townNet(all, P) {
  P = P || { on: {}, k: {}, extra: [] }; const SWK = 3.3 + 0.2, IN = [-160 + 6 + SWK, 160 - 6 - SWK, -140 + 6 + SWK, 150 - 6 - SWK]; const T = [-158, 158, -138, 148], DIR = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  const town = all.filter(b => !b.open && b.f && b.door && b.door[0] > T[0] && b.door[0] < T[1] && b.door[1] > T[2] && b.door[1] < T[3]);
  const ov = (a, b) => a[0] < b[1] && a[1] > b[0] && a[2] < b[3] && a[3] > b[2];
  // other buildings keep 3 m (their 2 m front strip + 1 m clear), the path's own building only must not be entered
  const segBlocked = (a, b, w, own) => { const h = w / 2, r = [Math.min(a[0], b[0]) - h, Math.max(a[0], b[0]) + h, Math.min(a[1], b[1]) - h, Math.max(a[1], b[1]) + h];
    if (r[0] < IN[0] || r[1] > IN[1] || r[2] < IN[2] || r[3] > IN[3]) return 'the sidewalk';   // s34: paths never run on the ring-road sidewalk
    for (const o of town) if (o.lot && o.lot.r) { const q = o.lot.r; if (ov(r, [q[0] - 1, q[1] + 1, q[2] - 1, q[3] + 1])) return o.label + ' lot'; }
    for (const o of town) { const f = o.f, box = own.includes(o.key) ? [f[0] + 1.5, f[1] - 1.5, f[2] + 1.5, f[3] - 1.5] : [f[0] - 3, f[1] + 3, f[2] - 3, f[3] + 3]; if (ov(r, box)) return o.label; }
    const cx = Math.max(r[0], Math.min(0, r[1])), cz = Math.max(r[2], Math.min(0, r[3])); return Math.hypot(cx, cz) < 12.5 ? 'the fountain' : null; };
  const blockedBy = (pts, w, own) => { for (let i = 0; i < pts.length - 1; i++) { const s = segBlocked(pts[i], pts[i + 1], w, own); if (s) return s; } return null; };
  const len = pts => pts.reduce((a, p, i) => i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : a, 0);
  const clean = pts => { const o = []; for (const p of pts) { const q = o[o.length - 1]; if (q && Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.05) continue; o.push(p); }
    for (let i = o.length - 2; i > 0; i--) { const a = o[i - 1], b = o[i], c = o[i + 1]; if ((Math.abs(a[0] - b[0]) < 0.05 && Math.abs(b[0] - c[0]) < 0.05) || (Math.abs(a[1] - b[1]) < 0.05 && Math.abs(b[1] - c[1]) < 0.05)) o.splice(i, 1); } return o; };
  const NAME = { ns: 'Castle ↔ Lake path', ew: 'Ruins ↔ Arena path' }, routes = [], plazas = [], PZ = {};
  routes.push({ id: 'main:n', kind: 'main', name: 'Main path north (to Castle)', pts: [[0, -138], [0, -9]] }, { id: 'main:s', kind: 'main', name: 'Main path south (to Lake)', pts: [[0, 9], [0, 148]] },
    { id: 'main:w', kind: 'main', name: 'Main path west (to Ruins)', pts: [[-158, 0], [-9, 0]] }, { id: 'main:e', kind: 'main', name: 'Main path east (to Arena)', pts: [[9, 0], [158, 0]] });
  // ENTRANCE CLEARINGS: a brick forecourt in front of every door (small shops 12 x 6 m, a little wider than their front; big buildings up to 20 x 8 m), kept inside the front wall's span
  for (const b of town) { const [dx, dz] = DIR[b.face] || [0, 1], [x, z] = b.door, f = b.f, wall = dz ? f[1] - f[0] : f[3] - f[2], small = wall < 20, D = small ? 6 : 8, W = small ? Math.min(wall + 4, 12) : Math.min(wall - 2, 20), hw = W / 2, g = small ? 2 : 0;
    let r = dz ? [x - hw, x + hw, Math.min(z, z + dz * D), Math.max(z, z + dz * D)] : [Math.min(x, x + dx * D), Math.max(x, x + dx * D), z - hw, z + hw];
    if (dz) { if (r[0] < f[0] - g) { r[1] += f[0] - g - r[0]; r[0] = f[0] - g; } if (r[1] > f[1] + g) { r[0] -= r[1] - f[1] - g; r[1] = f[1] + g; } }
    else { if (r[2] < f[2] - g) { r[3] += f[2] - g - r[2]; r[2] = f[2] - g; } if (r[3] > f[3] + g) { r[2] -= r[3] - f[3] - g; r[3] = f[3] + g; } }
    r = [Math.max(r[0], IN[0]), Math.min(r[1], IN[1]), Math.max(r[2], IN[2]), Math.min(r[3], IN[3])];   // s34: clearings stop at the sidewalk
    const Dr = dz ? Math.abs((dz < 0 ? r[2] : r[3]) - z) : Math.abs((dx < 0 ? r[0] : r[1]) - x), road = Dr < D - 0.05;   // cut short = the shop opens onto the street
    const p = { key: b.key, label: b.label, r, D: Dr, W, S: [x + dx * Math.max(0.5, Dr), z + dz * Math.max(0.5, Dr)], road }; plazas.push(p); PZ[b.key] = p; }
  // DOOR PATHS as a tree: nearest doors first; each goes straight out of its entrance until it meets the network (main path or a door path
  // already laid) in a clean T; if nothing is straight ahead it takes one bend. SECOND PATHS reach the other main path and are kept only
  // when short and not running beside another path.
  const net = routes.filter(r => r.kind === 'main').map(r => [r.pts[0], r.pts[1]]), spurs = [];
  const legs = pts => pts.slice(1).map((p, i) => [pts[i], p]);
  const side = (A, B) => { const va = Math.abs(A[0][0] - A[1][0]) < 0.05, vb = Math.abs(B[0][0] - B[1][0]) < 0.05; if (va !== vb) return false; const c = va ? 0 : 1, o = 1 - c;
    if (Math.abs(A[0][c] - B[0][c]) > 7) return false; const a0 = Math.min(A[0][o], A[1][o]), a1 = Math.max(A[0][o], A[1][o]), b0 = Math.min(B[0][o], B[1][o]), b1 = Math.max(B[0][o], B[1][o]);
    return Math.min(a1, b1) - Math.max(a0, b0) > 5; };
  const besideNet = pts => legs(pts).some(A => net.some(B => side(A, B)));
  const ray = (o, d, max = 130) => { let best = null; for (const [p, q] of net) { const vert = Math.abs(p[0] - q[0]) < 0.05;
    if (d[0] && vert) { const t = (p[0] - o[0]) * d[0], lo = Math.min(p[1], q[1]), hi = Math.max(p[1], q[1]); if (t > 0.5 && t <= max && o[1] >= lo - 0.01 && o[1] <= hi + 0.01 && (!best || t < best.t)) best = { t, h: [p[0], o[1]] }; }
    if (d[1] && !vert) { const t = (p[1] - o[1]) * d[1], lo = Math.min(p[0], q[0]), hi = Math.max(p[0], q[0]); if (t > 0.5 && t <= max && o[0] >= lo - 0.01 && o[0] <= hi + 0.01 && (!best || t < best.t)) best = { t, h: [o[0], p[1]] }; } } return best; };
  // EXTRA PATHS Ben asked for (any two entrances, across the quarters): straight if the two forecourts face each other, else the shortest Z or L
  for (const [ka, kb] of (P.extra || [])) { const A = town.find(b => b.key === ka), B = town.find(b => b.key === kb); if (!A || !B) continue;
    const a = PZ[ka], b = PZ[kb], fa = DIR[A.face] || [0, 1], fb = DIR[B.face] || [0, 1], own = [ka, kb]; let pick = null;
    const tryP = (pts, bonus = 0) => { pts = clean(pts); const L = len(pts) + (pts.length - 2) * 6 + bonus; if (pick && L >= pick.L) return; if (!blockedBy(pts, 2.4, own)) pick = { pts, L }; };
    if (fa[0] && fb[0]) { const lo = Math.max(a.r[2], b.r[2]) + 1.2, hi = Math.min(a.r[3], b.r[3]) - 1.2; for (let z = lo; z <= hi; z += 0.5) tryP([[a.S[0], z], [b.S[0], z]], Math.abs(z - (lo + hi) / 2) * 0.01); }
    if (fa[1] && fb[1]) { const lo = Math.max(a.r[0], b.r[0]) + 1.2, hi = Math.min(a.r[1], b.r[1]) - 1.2; for (let x = lo; x <= hi; x += 0.5) tryP([[x, a.S[1]], [x, b.S[1]]], Math.abs(x - (lo + hi) / 2) * 0.01); }
    if (!pick) { tryP([a.S, [b.S[0], a.S[1]], b.S]); tryP([a.S, [a.S[0], b.S[1]], b.S]);
      for (let m = -150; m <= 150; m += 1) { tryP([a.S, [m, a.S[1]], [m, b.S[1]], b.S]); tryP([a.S, [a.S[0], m], [b.S[0], m], b.S]); } }
    routes.push({ id: 'extra:' + ka + '-' + kb, kind: 'extra', name: A.label + ' ↔ ' + B.label + ' path', pts: pick ? pick.pts : [a.S, b.S], block: pick ? null : 'no clear way', def: true }); if (pick) net.push(...legs(pick.pts)); }
  const order = town.map(b => { const [dx, dz] = DIR[b.face] || [0, 1], S = PZ[b.key].S; const r = ray(S, [dx, dz], 400); return { b, d: r ? r.t : 400 }; }).sort((p, q) => p.d - q.d).map(o => o.b);
  for (const b of order) { const [dx, dz] = DIR[b.face] || [0, 1], own = [b.key], f = b.f, pz = PZ[b.key], S = pz.S, id = b.key + ':door';
    routes.push({ id: b.key + ':front', kind: 'front', bk: b.key, name: b.label + ' · front strip', pts: dz ? [[f[0], b.door[1] + dz], [f[1], b.door[1] + dz]] : [[b.door[0] + dx, f[2]], [b.door[0] + dx, f[3]]] });
    let best = null; const forced = P.k[id];
    let straight = null; const st = ray(S, [dx, dz]); if (st && forced == null) { const pts = [S, st.h]; if (!blockedBy(pts, 2.4, own)) straight = { pts, L: st.t, bend: null }; }
    // a straight T wins unless a one-bend path is much shorter (under 60 %)
    if (!straight || straight.L > 30) for (let k = forced != null ? forced : 0; k <= (forced != null ? forced : 50); k++) { const B = [S[0] + dx * k, S[1] + dz * k];
      for (const p of [[-dz, dx], [dz, -dx]]) { const h = ray(B, p); if (!h) continue; const pts = clean([S, B, h.h]), L = k + h.t + (k ? 3 : 0);
        if (best && L >= best.L) continue; const blk = blockedBy(pts, 2.4, own); if (blk && forced == null) continue; if (forced == null && besideNet(pts.slice(0, -1).concat([h.h]).slice(0, 2))) continue;
        best = { pts, L, bend: { x: S[0], z: S[1], dx, dz, k }, block: blk }; } }
    if (straight && (!best || best.L > 0.6 * straight.L)) best = straight;
    if (best) { const r = { id, kind: 'spur', bk: b.key, name: b.label + ' · door path', pts: best.pts, bend: best.bend, block: best.block || null, def: true }; routes.push(r); spurs.push(r); net.push(...legs(best.pts)); }
    // second path: to the main path the door path did not use (straight or one bend from the entrance)
    const endOn = best ? best.pts[best.pts.length - 1] : null;
    for (const tgt of ['ns', 'ew']) { const toNS = tgt === 'ns', sid = b.key + ':' + tgt; if (endOn && (toNS ? Math.abs(endOn[0]) < 0.05 : Math.abs(endOn[1]) < 0.05)) continue;
      const [sx, sz] = S, perp = toNS ? dx !== 0 : dz !== 0; let pts = null, bend = null;
      if (perp) { if (toNS ? Math.sign(dx) !== Math.sign(-sx) : Math.sign(dz) !== Math.sign(-sz)) continue; pts = toNS ? [[sx, sz], [0, sz]] : [[sx, sz], [sx, 0]]; }
      else { if (toNS ? Math.abs(sx) < 12 : Math.abs(sz) < 12) continue; const kf = P.k[sid];
        const mk = k => { const bx = sx + dx * k, bz = sz + dz * k; return clean(toNS ? [[sx, sz], [bx, bz], [0, bz]] : [[sx, sz], [bx, bz], [bx, 0]]); };
        const okPar = k => { const bx = sx + dx * k, bz = sz + dz * k; return toNS ? Math.abs(bz) >= 12 && Math.sign(bz) === Math.sign(sz) : Math.abs(bx) >= 12 && Math.sign(bx) === Math.sign(sx); };
        let k = kf; if (k == null) for (let t = 0; t <= 50; t++) if (okPar(t) && !blockedBy(mk(t), 2.4, own)) { k = t; break; } if (k == null) continue; pts = mk(k); bend = { x: sx, z: sz, dx, dz, k }; }
      const blk = blockedBy(pts, 2.4, own); if (blk && P.k[sid] == null) continue; const L = len(pts), L1 = best ? best.L : 999;
      const r = { id: sid, kind: 'spur2', bk: b.key, name: b.label + ' · second path to the ' + NAME[tgt], pts, bend, block: blk, def: !blk && L <= Math.min(55, 1.4 * L1 + 10) && !besideNet(pts) };
      routes.push(r); if (r.def) net.push(...legs(pts)); } }
  // LINKS: each entrance to the nearest entrance in its quarter (the main paths split the plaza into 4), one L with at most 2 bends
  const done = new Set();
  for (const a of town) { const qa = [Math.sign(a.door[0]), Math.sign(a.door[1])]; let best = null, bd = 90;
    for (const b of town) { if (b === a || Math.sign(b.door[0]) !== qa[0] || Math.sign(b.door[1]) !== qa[1]) continue; const d = Math.hypot(b.door[0] - a.door[0], b.door[1] - a.door[1]); if (d < bd) { bd = d; best = b; } }
    if (!best) continue; const id = 'link:' + [a.key, best.key].sort().join('-'); if (done.has(id)) continue; done.add(id);
    const starts = (b, to) => { const [dx, dz] = DIR[b.face] || [0, 1], p = PZ[b.key], r = p.r, out = [0, 3, 6, 10].map(s => [p.S[0] + dx * s, p.S[1] + dz * s]);
      return out; };
    let pick = null;
    for (const SA of starts(a, best.door)) for (const SB of starts(best, a.door)) for (const cn of [[SB[0], SA[1]], [SA[0], SB[1]]]) {
      const pts = clean([PZ[a.key].S, SA, cn, SB, PZ[best.key].S]), L = len(pts) + (pts.length - 2) * 6; if (pts.length > 5) continue; if (pick && L >= pick.L) continue; if (!blockedBy(pts, 2, [a.key, best.key])) pick = { pts, L }; }
    if (pick) { const dup = besideNet(pick.pts); routes.push({ id, kind: 'link', name: a.label + ' ↔ ' + best.label + ' link', pts: pick.pts, def: !dup }); if (!dup) net.push(...legs(pick.pts)); } }
  for (const r of routes) { r.w = { main: 3.2, spur: 2.4, spur2: 2.4, front: 2, link: 2, extra: 2.4 }[r.kind]; r.L = len(r.pts); r.on = r.kind === 'main' ? true : P.on[r.id] != null ? P.on[r.id] : r.def !== false; }
  routes.plazas = plazas;
  return routes;
}

export function townChoices() { const D = TOWN_PATHS; let P = { on: { ...D.on }, k: { ...D.k }, extra: D.extra.slice() };
  try { const p = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem('meru2.townPaths')) || 'null'); if (p) P = { on: { ...D.on, ...(p.on || {}) }, k: { ...D.k, ...(p.k || {}) }, extra: p.extra || D.extra.slice() }; } catch (e) {}
  return P; }
// the live network for a layout module (L.BUILDINGS already moved by TOWN_MOVES), cached per layout
let CACHE = null;
export function liveNet(L) { if (CACHE && CACHE.L === L) return CACHE.routes; const routes = townNet(L.BUILDINGS, townChoices()); CACHE = { L, routes }; return routes; }
// KEEP CLEAR (path + 1 m each side, clearings + 1 m, back-door approaches 3 m out): test (x, z, r) → true when a prop of radius r would stand on it
export function keepClear(L) { const R = liveNet(L), segs = [], rects = [];
  for (const r of R) { if (!r.on) continue; for (let i = 0; i < r.pts.length - 1; i++) segs.push([r.pts[i], r.pts[i + 1], r.w / 2 + 1]); }
  for (const p of R.plazas) rects.push([p.r[0] - 1, p.r[1] + 1, p.r[2] - 1, p.r[3] + 1]);
  const F = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  for (const b of L.BUILDINGS) if (b.door2 && b.backDoor && F[b.face2]) { const [dx, dz] = F[b.face2], [x, z] = b.door2, o = [x + dx * 4, z + dz * 4]; segs.push([[x, z], o, 3]); }
  const box = [-170, 170, -150, 160];
  return (x, z, m = 0) => { if (x < box[0] || x > box[1] || z < box[2] || z > box[3]) return false;
    for (const q of rects) if (x > q[0] - m && x < q[1] + m && z > q[2] - m && z < q[3] + m) return true;
    for (const [a, b, h] of segs) { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2)); if (Math.abs(x - a[0] - dx * u) < h + m && Math.abs(z - a[1] - dz * u) < h + m) return true; }
    return false; }; }

// the same keep-clear area as axis-aligned boxes (path + 1 m, clearings + 1 m): pushed into city.colliders for a moment while the
// decoration modules (market, gardens, breeze, parade) place things, so their "is it free?" searches skip the network; taken out again after
export function keepClearRects(L) { const R = liveNet(L), out = [];
  for (const r of R) { if (!r.on || r.kind === 'main') continue; const h = r.w / 2 + 1; for (let i = 0; i < r.pts.length - 1; i++) { const a = r.pts[i], b = r.pts[i + 1]; out.push({ f: [Math.min(a[0], b[0]) - h, Math.max(a[0], b[0]) + h, Math.min(a[1], b[1]) - h, Math.max(a[1], b[1]) + h], _kc: true }); } }
  for (const p of R.plazas) out.push({ f: [p.r[0] - 1, p.r[1] + 1, p.r[2] - 1, p.r[3] + 1], _kc: true });
  return out; }
