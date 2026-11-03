// 8 GATES — CHESS CLUB [chessClub] · rules + CPU player. Pure JS, no imports, no DOM.
// Full rules: castling, en passant, promotion, check, checkmate, stalemate, threefold repetition, fifty-move rule, insufficient material.
// Board: 64 squares, index 0 = a8 … 7 = h8 … 56 = a1 … 63 = h1. Pieces are letters: PNBRQK white, pnbrqk black, '' empty.
// The CPU runs in a module Worker (this same file) so the 3D scene never freezes on a phone; think() also works on the main thread.

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
export const FILES = 'abcdefgh';
export const sqName = i => FILES[i & 7] + (8 - (i >> 3));
export const sqIndex = s => (8 - +s[1]) * 8 + FILES.indexOf(s[0]);
export const colorOf = p => !p ? null : p < 'a' ? 'w' : 'b';
export const typeOf = p => p ? p.toLowerCase() : '';
export const PIECE_NAMES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

// ---------- precomputed jump + ray tables ----------
const inB = (r, f) => r >= 0 && r < 8 && f >= 0 && f < 8;
const KN = [], KG = [], RAYS = [];   // RAYS[sq][d] = squares along direction d (0-3 diagonal, 4-7 straight)
const DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
for (let s = 0; s < 64; s++) {
  const r = s >> 3, f = s & 7;
  KN[s] = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].filter(([a, b]) => inB(r + a, f + b)).map(([a, b]) => (r + a) * 8 + f + b);
  KG[s] = DIRS.filter(([a, b]) => inB(r + a, f + b)).map(([a, b]) => (r + a) * 8 + f + b);
  RAYS[s] = DIRS.map(([a, b]) => { const out = []; let rr = r + a, ff = f + b; while (inB(rr, ff)) { out.push(rr * 8 + ff); rr += a; ff += b; } return out; });
}

export class Chess {
  constructor(fen = START_FEN) { this.load(fen); }
  load(fen) {
    const [pos, turn, cas, ep, half, full] = fen.trim().split(/\s+/);
    this.b = []; for (const ch of pos.replace(/\//g, '')) { if (/\d/.test(ch)) for (let i = 0; i < +ch; i++) this.b.push(''); else this.b.push(ch); }
    if (this.b.length !== 64) throw new Error('bad FEN');
    this.turn = turn === 'b' ? 'b' : 'w';
    this.castle = { K: cas.includes('K'), Q: cas.includes('Q'), k: cas.includes('k'), q: cas.includes('q') };
    this.ep = ep && ep !== '-' ? sqIndex(ep) : -1; this.half = +half || 0; this.full = +full || 1;
    this.kings = { w: this.b.indexOf('K'), b: this.b.indexOf('k') };
    this.stack = []; this.history = []; this.reps = new Map(); this.bump(1);
    return this;
  }
  fen() {
    let s = ''; for (let r = 0; r < 8; r++) { let e = 0; for (let f = 0; f < 8; f++) { const p = this.b[r * 8 + f]; if (!p) e++; else { if (e) s += e; e = 0; s += p; } } if (e) s += e; if (r < 7) s += '/'; }
    const c = (this.castle.K ? 'K' : '') + (this.castle.Q ? 'Q' : '') + (this.castle.k ? 'k' : '') + (this.castle.q ? 'q' : '');
    return `${s} ${this.turn} ${c || '-'} ${this.ep >= 0 ? sqName(this.ep) : '-'} ${this.half} ${this.full}`;
  }
  key() { return this.b.map(p => p || '.').join('') + this.turn + (this.castle.K ? 'K' : '') + (this.castle.Q ? 'Q' : '') + (this.castle.k ? 'k' : '') + (this.castle.q ? 'q' : '') + this.ep; }
  bump(d) { const k = this.key(), n = (this.reps.get(k) || 0) + d; if (n > 0) this.reps.set(k, n); else this.reps.delete(k); }
  clone() { const c = new Chess(this.fen()); c.history = this.history.slice(); c.reps = new Map(this.reps); return c; }

  // is square s attacked by colour `by`?
  attacked(s, by) {
    const b = this.b, r = s >> 3, f = s & 7, W = by === 'w';
    const pr = W ? r + 1 : r - 1, P = W ? 'P' : 'p';
    if (pr >= 0 && pr < 8) { if (f > 0 && b[pr * 8 + f - 1] === P) return true; if (f < 7 && b[pr * 8 + f + 1] === P) return true; }
    const N = W ? 'N' : 'n', K = W ? 'K' : 'k', B = W ? 'B' : 'b', R = W ? 'R' : 'r', Q = W ? 'Q' : 'q';
    for (const t of KN[s]) if (b[t] === N) return true;
    for (const t of KG[s]) if (b[t] === K) return true;
    const rays = RAYS[s];
    for (let d = 0; d < 8; d++) { const ray = rays[d]; for (let i = 0; i < ray.length; i++) { const p = b[ray[i]]; if (!p) continue; if (p === Q || (d < 4 ? p === B : p === R)) return true; break; } }
    return false;
  }
  inCheck(c = this.turn) { return this.attacked(this.kings[c], c === 'w' ? 'b' : 'w'); }

  pseudo(capsOnly = false) {
    const b = this.b, me = this.turn, W = me === 'w', out = [], opp = W ? 'b' : 'w';
    const enemy = p => p && colorOf(p) === opp;
    const add = (from, to, flag = '', promo = '') => out.push({ from, to, piece: b[from], cap: flag === 'ep' ? (W ? 'p' : 'P') : b[to], flag, promo });
    for (let s = 0; s < 64; s++) {
      const p = b[s]; if (!p || colorOf(p) !== me) continue; const t = p.toLowerCase(), r = s >> 3, f = s & 7;
      if (t === 'p') {
        const dir = W ? -8 : 8, last = W ? 0 : 7, startR = W ? 6 : 1, one = s + dir;
        const pushP = (to, isCap) => { if ((to >> 3) === last) for (const q of 'qrbn') add(s, to, '', W ? q.toUpperCase() : q); else if (isCap || !capsOnly) add(s, to); };
        if (!b[one]) { if (!capsOnly || (one >> 3) === last) pushP(one, false); if (!capsOnly && r === startR && !b[one + dir]) add(s, one + dir, 'dbl'); }
        for (const df of [-1, 1]) { if (f + df < 0 || f + df > 7) continue; const to = one + df; if (enemy(b[to])) pushP(to, true); else if (to === this.ep) add(s, to, 'ep'); }
      } else if (t === 'n' || t === 'k') {
        for (const to of (t === 'n' ? KN : KG)[s]) { const q = b[to]; if (!q ? !capsOnly : colorOf(q) === opp) add(s, to); }
        if (t === 'k' && !capsOnly) {
          const home = W ? 60 : 4, cK = W ? this.castle.K : this.castle.k, cQ = W ? this.castle.Q : this.castle.q, R = W ? 'R' : 'r';
          if (s === home && (cK || cQ) && !this.attacked(home, opp)) {
            if (cK && !b[home + 1] && !b[home + 2] && b[home + 3] === R && !this.attacked(home + 1, opp) && !this.attacked(home + 2, opp)) add(s, home + 2, 'K');
            if (cQ && !b[home - 1] && !b[home - 2] && !b[home - 3] && b[home - 4] === R && !this.attacked(home - 1, opp) && !this.attacked(home - 2, opp)) add(s, home - 2, 'Q');
          }
        }
      } else {
        const d0 = t === 'r' ? 4 : 0, d1 = t === 'b' ? 4 : 8;
        for (let d = d0; d < d1; d++) for (const to of RAYS[s][d]) { const q = b[to]; if (!q) { if (!capsOnly) add(s, to); continue; } if (colorOf(q) === opp) add(s, to); break; }
      }
    }
    return out;
  }
  make(m) {
    const b = this.b, W = this.turn === 'w';
    this.stack.push({ m, castle: { ...this.castle }, ep: this.ep, half: this.half, full: this.full });
    b[m.to] = m.promo || m.piece; b[m.from] = '';
    if (m.flag === 'ep') b[m.to + (W ? 8 : -8)] = '';
    if (m.flag === 'K') { b[m.to - 1] = b[m.to + 1]; b[m.to + 1] = ''; }
    if (m.flag === 'Q') { b[m.to + 1] = b[m.to - 2]; b[m.to - 2] = ''; }
    const t = m.piece.toLowerCase();
    if (t === 'k') { this.kings[this.turn] = m.to; if (W) this.castle.K = this.castle.Q = false; else this.castle.k = this.castle.q = false; }
    for (const s of [m.from, m.to]) { if (s === 63) this.castle.K = false; if (s === 56) this.castle.Q = false; if (s === 7) this.castle.k = false; if (s === 0) this.castle.q = false; }
    this.ep = m.flag === 'dbl' ? (m.from + m.to) >> 1 : -1;
    this.half = t === 'p' || m.cap ? 0 : this.half + 1; if (!W) this.full++;
    this.turn = W ? 'b' : 'w';
  }
  unmake() {
    const u = this.stack.pop(); if (!u) return null; const m = u.m, b = this.b;
    this.turn = this.turn === 'w' ? 'b' : 'w'; const W = this.turn === 'w';
    b[m.from] = m.piece; b[m.to] = m.flag === 'ep' ? '' : (m.cap || '');
    if (m.flag === 'ep') b[m.to + (W ? 8 : -8)] = m.cap;
    if (m.flag === 'K') { b[m.to + 1] = b[m.to - 1]; b[m.to - 1] = ''; }
    if (m.flag === 'Q') { b[m.to - 2] = b[m.to + 1]; b[m.to + 1] = ''; }
    if (m.piece.toLowerCase() === 'k') this.kings[this.turn] = m.from;
    this.castle = u.castle; this.ep = u.ep; this.half = u.half; this.full = u.full; return m;
  }
  legal(capsOnly = false) { const me = this.turn, out = []; for (const m of this.pseudo(capsOnly)) { this.make(m); if (!this.attacked(this.kings[me], this.turn)) out.push(m); this.unmake(); } return out; }
  moves(from) { const L = this.legal(); return from == null ? L : L.filter(m => m.from === from); }

  san(m, legalList = this.legal()) {
    let s;
    if (m.flag === 'K') s = 'O-O'; else if (m.flag === 'Q') s = 'O-O-O';
    else {
      const t = m.piece.toLowerCase(), cap = !!m.cap;
      if (t === 'p') s = (cap ? FILES[m.from & 7] + 'x' : '') + sqName(m.to) + (m.promo ? '=' + m.promo.toUpperCase() : '');
      else {
        const rivals = legalList.filter(o => o.to === m.to && o.piece === m.piece && o.from !== m.from); let dis = '';
        if (rivals.length) { const sameF = rivals.some(o => (o.from & 7) === (m.from & 7)), sameR = rivals.some(o => (o.from >> 3) === (m.from >> 3)); dis = !sameF ? FILES[m.from & 7] : !sameR ? String(8 - (m.from >> 3)) : sqName(m.from); }
        s = t.toUpperCase() + dis + (cap ? 'x' : '') + sqName(m.to);
      }
    }
    this.make(m); const chk = this.inCheck(), mate = chk && this.legal().length === 0; this.unmake();
    return s + (mate ? '#' : chk ? '+' : '');
  }
  // play a move: {from,to,promo?} (promo letter any case, default queen). Returns the full move with .san, or null if illegal.
  move(req) {
    const L = this.legal(), from = typeof req.from === 'string' ? sqIndex(req.from) : req.from, to = typeof req.to === 'string' ? sqIndex(req.to) : req.to;
    const want = (req.promo || 'q').toLowerCase();
    const m = L.find(x => x.from === from && x.to === to && (!x.promo || x.promo.toLowerCase() === want)); if (!m) return null;
    const san = this.san(m, L); this.make(m); this.bump(1); const rec = { ...m, san, color: this.turn === 'w' ? 'b' : 'w' }; this.history.push(rec); return rec;
  }
  undo() { if (!this.history.length) return null; this.bump(-1); this.unmake(); return this.history.pop(); }
  insufficient() {
    const rest = []; for (let s = 0; s < 64; s++) { const p = this.b[s]; if (p && p.toLowerCase() !== 'k') rest.push([p.toLowerCase(), s]); }
    if (!rest.length) return true; if (rest.length === 1 && (rest[0][0] === 'n' || rest[0][0] === 'b')) return true;
    if (rest.every(([t]) => t === 'b')) { const shade = s => ((s >> 3) + (s & 7)) & 1; return rest.every(([, s]) => shade(s) === shade(rest[0][1])); }
    return false;
  }
  // { over, result: '1-0' | '0-1' | '1/2-1/2' | '*', reason, winner: 'w'|'b'|null, check }
  status() {
    const check = this.inCheck(), none = this.legal().length === 0;
    if (none && check) return { over: true, winner: this.turn === 'w' ? 'b' : 'w', result: this.turn === 'w' ? '0-1' : '1-0', reason: 'checkmate', check };
    if (none) return { over: true, winner: null, result: '1/2-1/2', reason: 'stalemate', check };
    if (this.half >= 100) return { over: true, winner: null, result: '1/2-1/2', reason: 'fifty-move rule', check };
    if ((this.reps.get(this.key()) || 0) >= 3) return { over: true, winner: null, result: '1/2-1/2', reason: 'threefold repetition', check };
    if (this.insufficient()) return { over: true, winner: null, result: '1/2-1/2', reason: 'not enough pieces to mate', check };
    return { over: false, winner: null, result: '*', reason: '', check };
  }
  material(c) { const V = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }; let n = 0; for (const p of this.b) if (p && colorOf(p) === c) n += V[p.toLowerCase()]; return n; }
  perft(d) { if (!d) return 1; let n = 0; for (const m of this.legal()) { this.make(m); n += this.perft(d - 1); this.unmake(); } return n; }
}

// ---------- the CPU (negamax + alpha-beta + quiescence, iterative deepening on a clock) ----------
const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const PST = {   // white's view, index 0 = a8 (the "simplified evaluation" tables)
  p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
  r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
  q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20],
  ke: [-50,-40,-30,-20,-20,-30,-40,-50, -30,-20,-10,0,0,-10,-20,-30, -30,-10,20,30,30,20,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,20,30,30,20,-10,-30, -30,-30,0,0,0,0,-30,-30, -50,-30,-30,-30,-30,-30,-30,-50],
};
function evaluate(c) {   // score for the side to move
  let s = 0, heavy = 0; for (const p of c.b) if (p) { const t = p.toLowerCase(); if (t === 'q') heavy += 2; else if (t !== 'p' && t !== 'k') heavy += 1; }
  const endgame = heavy <= 4;
  for (let i = 0; i < 64; i++) { const p = c.b[i]; if (!p) continue; const t = p.toLowerCase(), w = p < 'a', tab = PST[t === 'k' && endgame ? 'ke' : t]; const v = VAL[t] + tab[w ? i : i ^ 56]; s += w ? v : -v; }
  return c.turn === 'w' ? s : -s;
}
const MATE = 100000;
const order = (L, best) => { for (const m of L) m.o = (best && m.from === best.from && m.to === best.to && m.promo === best.promo ? 1e6 : 0) + (m.cap ? 10 * VAL[m.cap.toLowerCase()] - VAL[m.piece.toLowerCase()] + 1000 : 0) + (m.promo ? 800 : 0); L.sort((a, b) => b.o - a.o); return L; };
// level: 0 ROOKIE · 1 CLUB · 2 MASTER · 'hint'
export const LEVELS = [
  { id: 'rookie', name: 'ROOKIE', depth: 1, ms: 250, noise: 140, blunder: 0.22 },
  { id: 'club', name: 'CLUB', depth: 3, ms: 700, noise: 25, blunder: 0.03 },
  { id: 'master', name: 'MASTER', depth: 6, ms: 1600, noise: 0, blunder: 0 }];
export function think(chess, level = 1) {
  const L0 = LEVELS[level === 'hint' ? 2 : level] || LEVELS[1], c = chess instanceof Chess ? chess.clone() : new Chess(chess);
  const root = c.legal(); if (!root.length) return null; if (root.length === 1) return root[0];
  if (L0.blunder && Math.random() < L0.blunder) return root[Math.floor(Math.random() * root.length)];
  const t0 = Date.now(), limit = level === 'hint' ? 900 : L0.ms; let nodes = 0, stop = false;
  const q = (a, b, ply) => { nodes++; const sp = evaluate(c); if (sp >= b) return sp; if (sp > a) a = sp; if (ply > 8) return a;
    for (const m of order(c.legal(true))) { c.make(m); const v = -q(-b, -a, ply + 1); c.unmake(); if (v >= b) return v; if (v > a) a = v; } return a; };
  const neg = (d, a, b, ply) => { if ((++nodes & 1023) === 0 && Date.now() - t0 > limit) stop = true; if (stop) return 0;
    if (ply && (c.half >= 100 || (c.reps.get(c.key()) || 0) >= 2)) return 0;
    if (d <= 0) return q(a, b, ply);
    const L = c.legal(); if (!L.length) return c.inCheck() ? -MATE + ply : 0;
    let best = -Infinity; for (const m of order(L)) { c.make(m); c.bump(1); const v = -neg(d - 1, -b, -a, ply + 1); c.bump(-1); c.unmake(); if (stop) return 0; if (v > best) best = v; if (v > a) a = v; if (a >= b) break; } return best; };
  let bestM = root[0], bestScores = null;
  for (let d = 1; d <= L0.depth; d++) {
    const scores = []; let a = -Infinity;
    for (const m of order(root, bestM)) { c.make(m); c.bump(1); const v = -neg(d - 1, -Infinity, L0.noise ? Infinity : -a, 1); c.bump(-1); c.unmake(); if (stop) break; scores.push([m, v]); if (v > a) a = v; }
    if (stop) break;
    bestScores = scores.sort((x, y) => y[1] - x[1]); bestM = bestScores[0][0]; if (Math.abs(bestScores[0][1]) > MATE - 100) break; if (Date.now() - t0 > limit * 0.55) break;
  }
  if (!bestScores) return bestM;
  if (L0.noise && level !== 'hint') { const top = bestScores[0][1], pool = bestScores.filter(([, v]) => v >= top - L0.noise && Math.abs(top) < MATE - 100); if (pool.length > 1) return pool[Math.floor(Math.random() * pool.length)][0]; }
  return bestScores[0][0];
}

// ---------- Worker mode: new Worker(new URL('./chess-rules.js', import.meta.url), { type: 'module' }) ----------
if (typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined' && self instanceof WorkerGlobalScope) {
  self.onmessage = e => { const { id, fen, hist, level } = e.data || {}; let m = null;
    try { const c = new Chess(fen); if (Array.isArray(hist)) for (const k of hist) c.reps.set(k, (c.reps.get(k) || 0) + 1); const r = think(c, level); m = r ? { from: r.from, to: r.to, promo: r.promo || '' } : null; } catch (er) {}
    self.postMessage({ id, m }); };
}
