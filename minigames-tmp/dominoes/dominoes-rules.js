// 8 GATES — DOMINOES CLUB [dominoesClub] · rules + CPU. Pure JS, no DOM, no Three (also runs in node for tests).
// Double-six set (28 tiles). 2–4 players: 7 tiles each for 2, 5 each for 3–4; the rest is the boneyard.
// Two games:
//   DRAW       — match a number at either open end; can't play → draw from the boneyard until you can (or pass when it is empty).
//                Go out ("domino!") and score every pip left in the other hands. Blocked (everyone passes): lowest hand wins
//                the others' pips minus its own.
//   ALL FIVES  — the same, plus: after every play add up the open ends; a multiple of 5 scores that many points. A double at an
//                end counts both halves. A double led becomes the SPINNER: once both its sides are played, its top and bottom open
//                too (four ends). Going out scores the others' pips rounded to the nearest 5.
// First to the target (default 100) wins the match. Hand 1 (and after a tied block): the highest double leads, else the
// heaviest tile. Later hands: the last hand's winner leads any tile.
// Everything replays from { n, mode, target, seed, log } (resume, undo, online).
// Exports: TILES, tileText, pipsOf, isDouble, handSizeFor, Dominoes, think(game, p, level), tileSVG(a, b, opts)

export const TILES = []; for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) TILES.push([a, b]);
export const pipsOf = id => id < 0 ? 0 : TILES[id][0] + TILES[id][1];
export const isDouble = id => id >= 0 && TILES[id][0] === TILES[id][1];
export const tileText = id => id < 0 ? '?' : TILES[id][1] + '-' + TILES[id][0];
export const handSizeFor = n => n === 2 ? 7 : 5;
export const NUM_WORD = ['blank', 'one', 'two', 'three', 'four', 'five', 'six'];
export const tileWords = id => { const [a, b] = TILES[id]; return a === b ? 'double ' + NUM_WORD[a] : NUM_WORD[b] + ' ' + NUM_WORD[a]; };
const ARMS = ['L', 'R', 'U', 'D'];

function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const entryVal = e => e.d ? e.o * 2 : e.o;

// open ends of a line: [{ arm, v }]
export function endsOf(line) {
  if (line.lead == null) return []; const t = TILES[line.lead], A = line.arms, out = [];
  out.push({ arm: 'L', v: A.L.length ? A.L[A.L.length - 1].o : t[0] }); out.push({ arm: 'R', v: A.R.length ? A.R[A.R.length - 1].o : t[1] });
  if (line.spin && A.L.length && A.R.length) { out.push({ arm: 'U', v: A.U.length ? A.U[A.U.length - 1].o : t[0] }); out.push({ arm: 'D', v: A.D.length ? A.D[A.D.length - 1].o : t[0] }); }
  return out;
}
// All Fives count of the open ends
export function countOf(line) {
  if (line.lead == null) return 0; const t = TILES[line.lead], A = line.arms, last = k => A[k][A[k].length - 1];
  if (line.spin) { const dbl = t[0] * 2; if (!A.L.length && !A.R.length) return dbl;
    let s = (A.L.length ? entryVal(last('L')) : dbl) + (A.R.length ? entryVal(last('R')) : dbl);
    if (A.L.length && A.R.length) { if (A.U.length) s += entryVal(last('U')); if (A.D.length) s += entryVal(last('D')); } return s; }
  if (!A.L.length && !A.R.length) return t[0] + t[1];
  return (A.L.length ? entryVal(last('L')) : (t[0] === t[1] ? t[0] * 2 : t[0])) + (A.R.length ? entryVal(last('R')) : (t[0] === t[1] ? t[0] * 2 : t[1]));
}
const emptyLine = () => ({ lead: null, spin: false, cnt: 0, arms: { L: [], R: [], U: [], D: [] } });

export class Dominoes {
  constructor({ n = 2, mode = 'draw', target = 100, seed = 1, log = [] } = {}) {
    this.n = Math.max(2, Math.min(4, n)); this.mode = mode === 'fives' ? 'fives' : 'draw'; this.target = target; this.seed = seed >>> 0;
    this.scores = Array(this.n).fill(0); this.handNo = 0; this.log = []; this.winner = null; this.last = null; this.lastHand = null; this.nextLeader = null;
    this.deal(); for (const a of log) if (!this.apply(a)) break;
  }
  deal() {
    this.handNo++; const r = rng(this.seed * 31 + this.handNo * 977), ids = shuffle([...Array(28).keys()], r), hs = handSizeFor(this.n);
    this.hands = []; for (let i = 0; i < this.n; i++) this.hands.push(ids.slice(i * hs, (i + 1) * hs)); this.bone = ids.slice(this.n * hs);
    this.line = emptyLine(); this.passes = 0; this.voids = Array.from({ length: this.n }, () => Array(7).fill(false)); this.phase = 'play'; this.last = { k: 'deal', hand: this.handNo };
    if (this.nextLeader != null) { this.turn = this.nextLeader; this.mustLead = null; return; }
    for (let d = 6; d >= 0; d--) { const id = TILES.findIndex(t => t[0] === d && t[1] === d), who = this.hands.findIndex(h => h.includes(id)); if (who >= 0) { this.turn = who; this.mustLead = id; return; } }
    let best = -1, who = 0; this.hands.forEach((h, p) => h.forEach(id => { const k = pipsOf(id) * 10 + TILES[id][1]; if (k > best) { best = k; who = p; this.mustLead = id; } })); this.turn = who;
  }
  get boneN() { return this.bone.length; }
  ends() { return endsOf(this.line); }
  count() { return countOf(this.line); }
  armEnd(arm) { const e = this.ends().find(x => x.arm === arm); return e ? e.v : null; }
  legal(p = this.turn) {
    if (this.phase !== 'play') return []; const h = this.hands[p];
    if (this.line.lead == null) return (this.mustLead != null ? h.filter(id => id === this.mustLead) : h).map(id => ({ id, arm: 'C' }));
    const E = this.ends(), out = []; for (const id of h) { if (id < 0) continue; const [a, b] = TILES[id]; for (const e of E) if (a === e.v || b === e.v) out.push({ id, arm: e.arm }); } return out;
  }
  canPlay(p = this.turn) { return this.legal(p).length > 0; }
  mustDraw(p = this.turn) { return this.phase === 'play' && p === this.turn && !this.canPlay(p) && this.bone.length > 0; }
  mustPass(p = this.turn) { return this.phase === 'play' && p === this.turn && !this.canPlay(p) && this.bone.length === 0; }
  // what a play would score in All Fives (no change to the game)
  scoreIf(id, arm) { if (this.mode !== 'fives') return 0; const L = this.line, save = L.lead, spin = L.spin; let c;
    if (arm === 'C') { L.lead = id; L.spin = isDouble(id); c = countOf(L); L.lead = save; L.spin = spin; }
    else { const v = this.armEnd(arm), [a, b] = TILES[id]; L.arms[arm].push({ id, i: v, o: a === v ? b : a, d: a === b }); c = countOf(L); L.arms[arm].pop(); }
    return c > 0 && c % 5 === 0 ? c : 0; }
  play(id, arm) {
    const p = this.turn; if (this.phase !== 'play') return null; const ok = this.legal(p).some(m => m.id === id && m.arm === arm); if (!ok) return null;
    const h = this.hands[p]; h.splice(h.indexOf(id), 1);
    let inner = null, outer = null;
    if (arm === 'C') { this.line.lead = id; this.line.spin = this.mode === 'fives' && isDouble(id); this.mustLead = null; }
    else { const v = this.armEnd(arm), [a, b] = TILES[id]; inner = v; outer = a === v ? b : a; this.line.arms[arm].push({ id, i: v, o: outer, d: a === b, n: ++this.line.cnt }); }
    let pts = 0; if (this.mode === 'fives') { const c = this.count(); if (c > 0 && c % 5 === 0) pts = c; this.scores[p] += pts; }
    this.passes = 0; this.log.push(['p', id, arm]);
    this.last = { k: 'play', p, id, arm, pts, inner, outer, count: this.count(), spin: arm === 'C' && this.line.spin };
    const ev = this.last;
    if (this.scores[p] >= this.target) { this.lastHand = null; this.endMatch(p, 'reached ' + this.target); }
    else if (!h.length) this.endHand(p, false);
    else this.turn = (p + 1) % this.n;
    return ev;
  }
  markVoid(p) { for (const e of this.ends()) this.voids[p][e.v] = true; }
  draw() { const p = this.turn; if (!this.mustDraw(p)) return null; this.markVoid(p); const id = this.bone.pop(); this.hands[p].push(id); this.log.push(['d']); this.last = { k: 'draw', p, id, left: this.bone.length }; return this.last; }
  pass() { const p = this.turn; if (!this.mustPass(p)) return null; this.markVoid(p); this.passes++; this.log.push(['x']); this.last = { k: 'pass', p };
    const ev = this.last; if (this.passes >= this.n) this.endHand(null, true); else this.turn = (p + 1) % this.n; return ev; }
  endHand(w, blocked) {
    const pip = this.hands.map(h => h.reduce((s, id) => s + pipsOf(id), 0)); let winner = w;
    if (blocked) { const min = Math.min(...pip), who = pip.map((v, i) => v === min ? i : -1).filter(i => i >= 0); winner = who.length === 1 ? who[0] : null; }
    let pts = 0; if (winner != null) { let raw = pip.reduce((s, v, i) => i === winner ? s : s + v, 0) - (blocked ? pip[winner] : 0); raw = Math.max(0, raw); pts = this.mode === 'fives' ? Math.round(raw / 5) * 5 : raw; this.scores[winner] += pts; }
    this.lastHand = { winner, pts, blocked, pips: pip, hands: this.hands.map(h => [...h]), hand: this.handNo };
    this.nextLeader = winner;   /* `last` stays the play or pass that ended the hand, so viewers can animate it */
    if (winner != null && this.scores[winner] >= this.target) this.endMatch(winner, blocked ? 'blocked game' : 'domino'); else this.phase = 'hand';
  }
  endMatch(p, why) { this.phase = 'over'; this.winner = p; this.why = why; }
  next() { if (this.phase !== 'hand') return false; this.log.push(['n']); this.deal(); return true; }
  apply(a) { const k = a[0]; if (k === 'p') return !!this.play(a[1], a[2]); if (k === 'd') return !!this.draw(); if (k === 'x') return !!this.pass(); if (k === 'n') return this.next(); return false; }
  toJSON() { return { n: this.n, mode: this.mode, target: this.target, seed: this.seed, log: this.log.map(a => [...a]) }; }
  clone() { const c = Object.create(Dominoes.prototype); Object.assign(c, this); c.scores = [...this.scores]; c.hands = this.hands.map(h => [...h]); c.bone = [...this.bone]; c.voids = this.voids.map(v => [...v]); c.log = [];
    c.line = { lead: this.line.lead, spin: this.line.spin, cnt: this.line.cnt, arms: { L: [...this.line.arms.L], R: [...this.line.arms.R], U: [...this.line.arms.U], D: [...this.line.arms.D] } }; return c; }
  // what player p may see (online): other hands become -1 placeholders until the hand is over
  view(p) {
    const show = q => q === p || this.phase !== 'play';
    const last = this.last && this.last.k === 'draw' && this.last.p !== p ? { ...this.last, id: -1 } : this.last;
    return { n: this.n, mode: this.mode, target: this.target, seed: 0, handNo: this.handNo, scores: [...this.scores], turn: this.turn, phase: this.phase, passes: this.passes, mustLead: this.mustLead, winner: this.winner, why: this.why || '',
      line: this.line, hands: this.hands.map((h, q) => show(q) ? [...h] : h.map(() => -1)), boneN: this.bone.length, voids: this.voids, last, lastHand: this.lastHand, ply: this.log.length }; }
  static fromView(v) { const c = Object.create(Dominoes.prototype), { boneN, ...rest } = v; Object.assign(c, rest); c.line = JSON.parse(JSON.stringify(v.line)); c.hands = v.hands.map(h => [...h]); c.bone = Array(v.boneN).fill(-1); c.log = []; c.scores = [...v.scores]; c.voids = v.voids.map(x => [...x]); return c; }
}

// ---------------- CPU ----------------
// ROOKIE: mostly random, sometimes sensible. CLUB: a weighted rule of thumb (score now, dump heavy tiles and doubles, keep
// numbers you can follow). MASTER: deals the unseen tiles into many possible hands (respecting what each player has shown they
// lack when they drew or passed), plays every candidate to the end of the hand with the CLUB rule, picks the best average.
export const LEVELS = { 0: { name: 'rookie' }, 1: { name: 'club' }, 2: { name: 'master', worlds: 70 }, hint: { name: 'master', worlds: 50 } };
function heur(g, p, m) {
  const [a, b] = TILES[m.id]; let s = (a + b) * 0.9 + (a === b ? 3.5 : 0);
  if (g.mode === 'fives') s += g.scoreIf(m.id, m.arm) * 2.6;
  // keep options: tiles left in hand that still match an end after this play
  const v = m.arm === 'C' ? null : g.armEnd(m.arm), newEnd = m.arm === 'C' ? [a, b] : [a === v ? b : a]; let keep = 0;
  for (const id of g.hands[p]) { if (id === m.id || id < 0) continue; const [x, y] = TILES[id]; if (newEnd.includes(x) || newEnd.includes(y)) keep++; }
  return s + keep * 1.2;
}
function bestHeur(g, p, noise = 0) { const L = g.legal(p); let best = null, bv = -1e9; for (const m of L) { const v = heur(g, p, m) + (noise ? Math.random() * noise : 0); if (v > bv) { bv = v; best = m; } } return best; }
function stepGreedy(g) { const p = g.turn; if (g.mustDraw(p)) { g.draw(); return true; } if (g.mustPass(p)) { g.pass(); return true; } const m = bestHeur(g, p, 0.6); if (!m) return false; g.play(m.id, m.arm); return true; }
function sampleWorld(g, p) {
  const seen = new Set(g.hands[p]); for (const k of ARMS) for (const e of g.line.arms[k]) seen.add(e.id); if (g.line.lead != null) seen.add(g.line.lead);
  const unknown = shuffle([...Array(28).keys()].filter(id => !seen.has(id)), Math.random), w = g.clone(), pool = [...unknown];
  for (let q = 0; q < g.n; q++) { if (q === p) continue; const need = g.hands[q].length, take = [];
    for (let pass = 0; pass < 2 && take.length < need; pass++) for (let i = 0; i < pool.length && take.length < need; i++) { const id = pool[i]; if (id < 0) continue; const [a, b] = TILES[id]; if (pass === 0 && (g.voids[q][a] || g.voids[q][b])) continue; take.push(id); pool[i] = -1; }
    w.hands[q] = take; }
  w.bone = pool.filter(id => id >= 0); return w;
}
export function think(g, p = g.turn, level = 1) {
  const L = g.legal(p); if (!L.length) return null; if (L.length === 1) return L[0];
  const cfg = LEVELS[level] || LEVELS[1];
  if (cfg.name === 'rookie') return Math.random() < 0.55 ? L[Math.floor(Math.random() * L.length)] : bestHeur(g, p, 4);
  if (cfg.name === 'club') return bestHeur(g, p, 1.2);
  // master: determinized playouts
  const uniq = []; const keyOf = m => m.id + ':' + (m.arm === 'C' ? 'C' : g.armEnd(m.arm) + (g.line.spin && !g.line.arms.L.length && !g.line.arms.R.length ? 'S' : m.arm));
  const seenK = new Set(); for (const m of L) { const k = keyOf(m); if (!seenK.has(k)) { seenK.add(k); uniq.push(m); } }
  if (uniq.length === 1) return uniq[0];
  const tot = uniq.map(() => 0), K = cfg.worlds;
  for (let k = 0; k < K; k++) { const w = sampleWorld(g, p);
    uniq.forEach((m, mi) => { const s = w.clone(), before = [...s.scores], hand0 = s.handNo; s.play(m.id, m.arm); let guard = 0; while (s.phase === 'play' && s.handNo === hand0 && guard++ < 80) if (!stepGreedy(s)) break;
      let v = s.scores[p] - before[p], opp = 0; for (let q = 0; q < s.n; q++) if (q !== p) opp = Math.max(opp, s.scores[q] - before[q]);
      if (s.phase === 'over') v += s.winner === p ? 60 : -60; tot[mi] += v - opp + heur(g, p, m) * 0.05; }); }
  let bi = 0; tot.forEach((v, i) => { if (v > tot[bi]) bi = i; }); return uniq[bi];
}

// ---------------- where every tile of the line lies on the table (units: one tile half = 1) ----------------
// Arms grow outward from the lead in the order tiles were played. Doubles lie crosswise. When the next tile would leave the
// play area (±FX, ±FZ) or hit another tile, the arm turns a corner (the turning tile sits beside the last one), trying the
// clockwise turn first. Returns { tiles: Map(id → { x, z, axis: 'x'|'z', neg }), ends: { L|R|U|D: { x, z, dx, dz } } }
// where `neg` is the pip number at the tile's negative-axis end, and ends[arm] is where the next tile's inner half would go.
export function layoutLine(line, FX = 9, FZ = 8, snake = false) {
  const tiles = new Map(), rects = [], ends = {}; if (line.lead == null) return { tiles, ends, rects };
  const t = TILES[line.lead], eps = 0.04;
  const free = (r, bounds, m = 0) => (!bounds || (r[0] >= -FX + m - eps && r[1] <= FX - m + eps && r[2] >= -FZ + m - eps && r[3] <= FZ - m + eps)) && rects.every(q => r[0] >= q[1] - eps || r[1] <= q[0] + eps || r[2] >= q[3] - eps || r[3] <= q[2] + eps);
  const rectOf = (cx, cz, hx, hz) => [cx - hx, cx + hx, cz - hz, cz + hz];
  const st = {};
  if (t[0] === t[1]) { tiles.set(line.lead, { x: 0, z: 0, axis: 'z', neg: t[0] }); rects.push(rectOf(0, 0, 0.5, 1));
    st.L = { x: 0, z: 0, dx: -1, dz: 0 }; st.R = { x: 0, z: 0, dx: 1, dz: 0 }; st.U = { x: 0, z: -0.5, dx: 0, dz: -1 }; st.D = { x: 0, z: 0.5, dx: 0, dz: 1 }; }
  else { tiles.set(line.lead, { x: 0, z: 0, axis: 'x', neg: t[0] }); rects.push(rectOf(0, 0, 1, 0.5)); st.L = { x: -0.5, z: 0, dx: -1, dz: 0 }; st.R = { x: 0.5, z: 0, dx: 1, dz: 0 }; }
  const all = []; for (const k of ARMS) for (const e of line.arms[k]) all.push([k, e]); all.sort((a, b) => (a[1].n || 0) - (b[1].n || 0));
  for (const [k, e] of all) { const S = st[k]; if (!S) continue; const d = [S.dx, S.dz], cw = [-S.dz, S.dx], ccw = [S.dz, -S.dx]; let done = false; const turnDir = S.turn ? (S.turn > 0 ? cw : ccw) : null;
    const opt = (dd, bounds) => { const c1 = [S.x + d[0], S.z + d[1]], c2 = dd === d ? [S.x + 2 * d[0], S.z + 2 * d[1]] : [c1[0] + dd[0], c1[1] + dd[1]];
      const r = [Math.min(c1[0], c2[0]) - 0.5, Math.max(c1[0], c2[0]) + 0.5, Math.min(c1[1], c2[1]) - 0.5, Math.max(c1[1], c2[1]) + 0.5];
      return free(r, bounds, bounds && dd === d ? 1 : 0) ? { dd, c1, c2, r } : null; };   /* a straight run keeps one unit spare so a corner always fits */
    const room = o => { rects.push(o.r); let n = 0, x = o.c2[0], z = o.c2[1]; const D = o.dd, L = [-D[1], D[0]], Rr = [D[1], -D[0]];
      for (let k = 1; k <= 4; k++) { const ok = dir => { const a1 = [x + D[0] * (k === 1 ? 1 : 2 * k - 1), z + D[1] * (k === 1 ? 1 : 2 * k - 1)]; return free([a1[0] - 0.5 - (dir ? 0 : 0), a1[0] + 0.5, a1[1] - 0.5, a1[1] + 0.5], true); };
        const c = [x + D[0] * (2 * k - 1), z + D[1] * (2 * k - 1)]; if (!free([c[0] - 0.5, c[0] + 0.5, c[1] - 0.5, c[1] + 0.5], true)) break; n++; }
      for (const T of [L, Rr]) { const c = [o.c2[0] + D[0] + T[0], o.c2[1] + D[1] + T[1]]; if (free([c[0] - 0.5, c[0] + 0.5, c[1] - 0.5, c[1] + 0.5], true)) n += 0.5; }
      rects.pop(); return n; };
    const commit = o => { const { dd, c1, c2, r } = o, axis = c1[0] !== c2[0] ? 'x' : 'z', lo = axis === 'x' ? c1[0] < c2[0] : c1[1] < c2[1];
      tiles.set(e.id, { x: (c1[0] + c2[0]) / 2, z: (c1[1] + c2[1]) / 2, axis, neg: lo ? e.i : e.o }); rects.push(r); S.x = c2[0]; S.z = c2[1]; S.turn = dd === d ? 0 : S.turn ? 0 : (dd === cw ? 1 : -1); S.dx = dd[0]; S.dz = dd[1]; return true; };
    const tryStraightish = (bounds) => { const order = !bounds ? [cw, ccw, d] : snake && turnDir ? [turnDir, d, turnDir === cw ? ccw : cw] : [d, cw, ccw];
      const cands = order.map(dd => opt(dd, bounds)).filter(Boolean); if (!cands.length) return false;
      if (bounds && cands.length > 1) { const good = cands.find(o => room(o) >= 1); if (good) return commit(good); }   /* skip a corner that walks into a dead end */
      return commit(cands[0]); };
    if (e.d) { const cx = S.x + d[0], cz = S.z + d[1], r = d[0] ? rectOf(cx, cz, 0.5, 1) : rectOf(cx, cz, 1, 0.5);
      if (free(r, true, 0.5)) { tiles.set(e.id, { x: cx, z: cz, axis: d[0] ? 'z' : 'x', neg: e.o }); rects.push(r); S.x = cx; S.z = cz; done = true; } }
    if (!done) done = tryStraightish(true);
    if (!done) done = tryStraightish(false);
    if (!done) { const c1 = [S.x + d[0], S.z + d[1]], c2 = [S.x + 2 * d[0], S.z + 2 * d[1]], axis = d[0] ? 'x' : 'z', lo = axis === 'x' ? c1[0] < c2[0] : c1[1] < c2[1];
      tiles.set(e.id, { x: (c1[0] + c2[0]) / 2, z: (c1[1] + c2[1]) / 2, axis, neg: lo ? e.i : e.o, over: true }); S.x = c2[0]; S.z = c2[1]; } }
  for (const e of endsOf(line)) { const S = st[e.arm]; if (S) ends[e.arm] = { x: S.x + S.dx, z: S.z + S.dz, dx: S.dx, dz: S.dz, v: e.v }; }
  return { tiles, ends, rects };
}

// ---------------- a tile as an SVG data URI (for the HUD rack) ----------------
const PIPS = { 0: [], 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]] };
export const PIP_COL = ['#1a1626', '#c81e3a', '#1d6fd6', '#1f8a4c', '#8a4bd6', '#d26a12', '#1a1626'];   // per-number pip colours (COLOUR PIPS)
export function tileSVG(a, b, { back = false, colour = false, contrast = false } = {}) {
  const W = 60, H = 116, face = contrast ? '#ffffff' : '#fbf6ea', edge = contrast ? '#000000' : '#1a1626';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="${back ? '#7a1f2b' : face}" stroke="${edge}" stroke-width="3"/>`;
  if (back) { s += `<rect x="9" y="9" width="${W - 18}" height="${H - 18}" fill="none" stroke="#e6b45a" stroke-width="2"/><circle cx="${W / 2}" cy="${H / 2}" r="7" fill="#e6b45a"/></svg>`; return 'data:image/svg+xml,' + encodeURIComponent(s); }
  s += `<line x1="8" y1="${H / 2}" x2="${W - 8}" y2="${H / 2}" stroke="${edge}" stroke-width="3"/><circle cx="${W / 2}" cy="${H / 2}" r="3.2" fill="#c9a24a" stroke="${edge}" stroke-width="1"/>`;
  const half = (v, y0) => { for (const [cx, cy] of PIPS[v]) s += `<circle cx="${15 + cx * 15}" cy="${y0 + 13 + cy * 15}" r="5.4" fill="${colour ? PIP_COL[v] : edge}"/>`; };
  half(b, 2); half(a, H / 2); s += '</svg>'; return 'data:image/svg+xml,' + encodeURIComponent(s);
}
