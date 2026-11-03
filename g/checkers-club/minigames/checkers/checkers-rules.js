// 8 GATES — CHECKERS CLUB [checkersClub] · rules + CPU. Pure JS, no imports, no DOM.
// English / American checkers: 8×8, play on the dark squares, RED moves first. Men move and jump diagonally forward;
// a man that reaches the far row is crowned and that ends the move; kings move and jump one square in any diagonal direction.
// Jumping is compulsory (rule can be switched off: opts.force = false); a jump that can continue must continue (multi-jump).
// Draws: threefold repetition, or 40 moves each (80 plies) with no capture and no man moved.
// Board: 64 squares, index 0 = a8-style top-left (White's far side). Colours: 'b' = RED (moves first), 'w' = WHITE.
// Pieces: 'b' red man, 'B' red king, 'w' white man, 'W' white king, '' empty. Red starts on rows 0–2 and moves down (row +1);
// White starts on rows 5–7 and moves up. Results use chess style: '1-0' White wins, '0-1' Red wins.
// Square numbers 1–32 (standard: Red's start squares are 1–12): row 0 left to right is 1–4 … row 7 is 29–32. Notation "11-15", jumps "22x15x8".

export const ROWS = 8;
export const dark = i => (((i >> 3) + (i & 7)) & 1) === 1;
export const NUM = []; export const SQ_OF = [];   // index → 1..32, and back
{ let n = 1; for (let i = 0; i < 64; i++) if (dark(i)) { NUM[i] = n; SQ_OF[n] = i; n++; } }
export const sqNum = i => NUM[i];
export const num = i => NUM[i];
export const sqOfNum = n => SQ_OF[n];
export const colorOf = p => !p ? null : p.toLowerCase();
export const isKing = p => !!p && p === p.toUpperCase();
export const COLOR_WORD = { b: 'Red', w: 'White' };
export const COLOR_NAME = COLOR_WORD;
const DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const STEP = [], JUMP = [];   // STEP[i][d] = neighbour or -1; JUMP[i][d] = landing or -1
for (let i = 0; i < 64; i++) { const r = i >> 3, c = i & 7; STEP[i] = DIAG.map(([a, b]) => (r + a >= 0 && r + a < 8 && c + b >= 0 && c + b < 8) ? (r + a) * 8 + c + b : -1); JUMP[i] = DIAG.map(([a, b]) => (r + 2 * a >= 0 && r + 2 * a < 8 && c + 2 * b >= 0 && c + 2 * b < 8) ? (r + 2 * a) * 8 + c + 2 * b : -1); }
const FWD = { b: [2, 3], w: [0, 1] };   // red men move down (row +1), white men up
export function startBoard() { const b = Array(64).fill(''); for (let i = 0; i < 64; i++) if (dark(i)) { const r = i >> 3; if (r <= 2) b[i] = 'b'; else if (r >= 5) b[i] = 'w'; } return b; }

export class Checkers {
  constructor(o = {}) { if (o.state) o = { ...o.state, ...o }; this.force = o.force !== false && o.forced !== false; this.reset(o.pos); if (o.quiet) this.quiet = o.quiet; }
  get forced() { return this.force; } set forced(v) { this.force = v !== false; }
  toJSON() { return { pos: this.pos(), force: this.force, quiet: this.quiet }; }
  reset(pos) {
    if (pos) { const [bd, t] = pos.split(':'); this.b = bd.split('').map(ch => ch === '.' ? '' : ch); this.turn = t === 'w' ? 'w' : 'b'; } else { this.b = startBoard(); this.turn = 'b'; }
    this.quiet = 0; this.stack = []; this.history = []; this.reps = new Map(); this.bump(1); return this;
  }
  pos() { return this.b.map(p => p || '.').join('') + ':' + this.turn; }
  key() { return this.pos(); }
  bump(d) { const k = this.key(), n = (this.reps.get(k) || 0) + d; if (n > 0) this.reps.set(k, n); else this.reps.delete(k); }
  clone() { const c = new Checkers({ force: this.force, pos: this.pos() }); c.quiet = this.quiet; c.history = this.history.slice(); c.reps = new Map(this.reps); return c; }
  dirsOf(p) { return isKing(p) ? [0, 1, 2, 3] : FWD[colorOf(p)]; }
  // all jump sequences for the piece on `from` (captured pieces stay on the board until the move ends and can't be jumped twice)
  jumpsFrom(from) {
    const b = this.b, p = b[from], me = colorOf(p), out = [], last = me === 'b' ? 7 : 0;
    const dfs = (at, path, caps) => { let more = false;
      for (const d of this.dirsOf(p)) { const mid = STEP[at][d], land = JUMP[at][d]; if (land < 0) continue; const q = b[mid];
        if (!q || colorOf(q) === me || caps.includes(mid) || (b[land] && land !== from)) continue;
        more = true; const np = [...path, land], nc = [...caps, mid];
        if (!isKing(p) && (land >> 3) === last) out.push({ from, to: land, path: np, caps: nc, piece: p, crown: true });
        else dfs(land, np, nc); }
      if (!more && caps.length) out.push({ from, to: at, path, caps, piece: p, crown: false });
    };
    dfs(from, [from], []); return out;
  }
  stepsFrom(from) { const b = this.b, p = b[from], out = [], last = colorOf(p) === 'b' ? 7 : 0; for (const d of this.dirsOf(p)) { const t = STEP[from][d]; if (t >= 0 && !b[t]) out.push({ from, to: t, path: [from, t], caps: [], piece: p, crown: !isKing(p) && (t >> 3) === last }); } return out; }
  legal() {
    const me = this.turn, jumps = [], steps = [];
    for (let i = 0; i < 64; i++) { const p = this.b[i]; if (!p || colorOf(p) !== me) continue; jumps.push(...this.jumpsFrom(i)); if (!this.force || !jumps.length) steps.push(...this.stepsFrom(i)); }
    return jumps.length && this.force ? jumps : [...jumps, ...steps];
  }
  moves(from) { const L = this.legal(); return from == null ? L : L.filter(m => m.from === from); }
  mustJump() { return this.force && this.legal().some(m => m.caps.length); }
  make(m) {
    const b = this.b; this.stack.push({ m, quiet: this.quiet, caps: m.caps.map(i => b[i]) });
    b[m.from] = ''; for (const c of m.caps) b[c] = ''; b[m.to] = m.crown ? m.piece.toUpperCase() : m.piece;
    this.quiet = m.caps.length || !isKing(m.piece) ? 0 : this.quiet + 1; this.turn = this.turn === 'b' ? 'w' : 'b';
  }
  unmake() { const u = this.stack.pop(); if (!u) return null; const m = u.m, b = this.b; b[m.to] = ''; m.caps.forEach((c, i) => b[c] = u.caps[i]); b[m.from] = m.piece; this.quiet = u.quiet; this.turn = this.turn === 'b' ? 'w' : 'b'; return m; }
  notation(m) { return this.note(m); }
  note(m) { return m.caps.length ? m.path.map(sqNum).join('x') : sqNum(m.from) + '-' + sqNum(m.to); }
  // play: { path:[...] } or { from, to } or { note: '22x15x8' }. Returns the move record (with .note) or null.
  move(req) {
    const L = this.legal(); let m = null;
    if (req.nums) req = { note: req.nums.join('-') };
    if (req.note) { const nums = String(req.note).split(/[-x]/).map(n => SQ_OF[+n]); m = L.find(x => x.path.length === nums.length && x.path.every((s, i) => s === nums[i])) || L.find(x => x.from === nums[0] && x.to === nums[nums.length - 1]); }
    else if (req.path) m = L.find(x => x.path.length === req.path.length && x.path.every((s, i) => s === req.path[i]));
    else { const c = L.filter(x => x.from === req.from && x.to === req.to); m = c.sort((a, b) => b.caps.length - a.caps.length)[0]; }
    if (!m) return null; const note = this.note(m); this.make(m); this.bump(1); const rec = { ...m, note, text: note, capped: this.stack[this.stack.length - 1].caps.slice(), color: colorOf(m.piece) }; this.history.push(rec); return rec;
  }
  undo() { if (!this.history.length) return null; this.bump(-1); this.unmake(); return this.history.pop(); }
  count(c) { let men = 0, kings = 0; for (const p of this.b) if (p && colorOf(p) === c) { if (isKing(p)) kings++; else men++; } return { men, kings, all: men + kings }; }
  status() {
    if (!this.legal().length) { const loser = this.turn, winner = loser === 'b' ? 'w' : 'b'; const none = this.count(loser).all === 0; return { over: true, winner, result: winner === 'w' ? '1-0' : '0-1', reason: none ? 'all pieces taken' : 'no moves left' }; }
    if (this.quiet >= 80) return { over: true, winner: null, result: '1/2-1/2', reason: '40 moves with no capture' };
    if ((this.reps.get(this.key()) || 0) >= 3) return { over: true, winner: null, result: '1/2-1/2', reason: 'threefold repetition' };
    return { over: false, winner: null, result: '*', reason: '' };
  }
  perft(d) { if (!d) return 1; let n = 0; for (const m of this.legal()) { this.make(m); n += this.perft(d - 1); this.unmake(); } return n; }
}

// ---------- CPU: negamax + alpha-beta, jump extension, iterative deepening on a clock ----------
const ADV = [0, 2, 4, 7, 10, 14, 18, 0];   // bonus by rows advanced (a man about to crown is worth a lot)
function evaluate(c) {
  let s = 0; const me = c.turn; let rm = 0, wm = 0, rk = 0, wk = 0;
  for (let i = 0; i < 64; i++) { const p = c.b[i]; if (!p) continue; const col = colorOf(p), r = i >> 3, f = i & 7, sign = col === me ? 1 : -1, red = col === 'b';
    if (isKing(p)) { s += sign * (165 + (3 - Math.abs(3.5 - r)) * 3 + (3 - Math.abs(3.5 - f)) * 3); if (red) rk++; else wk++; }
    else { const adv = red ? r : 7 - r; s += sign * (100 + ADV[adv] + ((f === 0 || f === 7) ? -4 : 0) + ((red ? r === 0 : r === 7) ? 10 : 0) + (r >= 3 && r <= 4 && f >= 2 && f <= 5 ? 6 : 0)); if (red) rm++; else wm++; } }
  // ahead in material → trade down; in a kings ending chase the enemy
  const mine = me === 'b' ? rm + rk : wm + wk, theirs = me === 'b' ? wm + wk : rm + rk; if (mine > theirs) s += (24 - mine - theirs) * 4; else if (theirs > mine) s -= (24 - mine - theirs) * 4;
  return s;
}
const WIN = 100000;
export const LEVELS = [
  { id: 'rookie', name: 'ROOKIE', depth: 2, ms: 250, noise: 70, blunder: 0.25 },
  { id: 'club', name: 'CLUB', depth: 6, ms: 700, noise: 12, blunder: 0.03 },
  { id: 'master', name: 'MASTER', depth: 14, ms: 1500, noise: 0, blunder: 0 }];
const ord = (L, best) => { for (const m of L) m.o = (best && m.from === best.from && m.to === best.to && m.path.length === best.path.length ? 1e6 : 0) + m.caps.length * 1000 + (m.crown ? 500 : 0); return L.sort((a, b) => b.o - a.o); };
export function think(game, level = 1) {
  const L0 = LEVELS[level === 'hint' ? 2 : level] || LEVELS[1], c = game instanceof Checkers ? game.clone() : new Checkers(game);
  const root = c.legal(); if (!root.length) return null; if (root.length === 1) return root[0];
  if (L0.blunder && Math.random() < L0.blunder) return root[Math.floor(Math.random() * root.length)];
  const t0 = Date.now(), limit = level === 'hint' ? 800 : L0.ms; let nodes = 0, stop = false;
  const neg = (d, a, b, ply) => { if ((++nodes & 1023) === 0 && Date.now() - t0 > limit) stop = true; if (stop) return 0;
    if (ply && (c.quiet >= 80 || (c.reps.get(c.key()) || 0) >= 2)) return 0;
    const L = c.legal(); if (!L.length) return -WIN + ply;
    const jumping = L[0].caps.length && c.force; if (d <= 0 && !jumping) return evaluate(c); if (d <= -6) return evaluate(c);   // keep going while jumps are forced
    let best = -Infinity; for (const m of ord(L)) { c.make(m); c.bump(1); const v = -neg(d - 1, -b, -a, ply + 1); c.bump(-1); c.unmake(); if (stop) return 0; if (v > best) best = v; if (v > a) a = v; if (a >= b) break; } return best; };
  let bestM = root[0], bestScores = null;
  for (let d = 1; d <= L0.depth; d++) {
    const scores = []; let a = -Infinity;
    for (const m of ord(root, bestM)) { c.make(m); c.bump(1); const v = -neg(d - 1, -Infinity, L0.noise ? Infinity : -a, 1); c.bump(-1); c.unmake(); if (stop) break; scores.push([m, v]); if (v > a) a = v; }
    if (stop) break; bestScores = scores.sort((x, y) => y[1] - x[1]); bestM = bestScores[0][0]; if (Math.abs(bestScores[0][1]) > WIN - 200) break; if (Date.now() - t0 > limit * 0.55) break;
  }
  if (!bestScores) return bestM;
  if (L0.noise && level !== 'hint') { const top = bestScores[0][1], pool = bestScores.filter(([, v]) => v >= top - L0.noise && Math.abs(top) < WIN - 200); if (pool.length > 1) return pool[Math.floor(Math.random() * pool.length)][0]; }
  return bestScores[0][0];
}

// ---------- Worker mode: new Worker(new URL('./checkers-rules.js', import.meta.url), { type: 'module' }) ----------
if (typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined' && self instanceof WorkerGlobalScope) {
  self.onmessage = e => { const { id, state, hist, level } = e.data || {}; let m = null;
    try { const c = new Checkers({ state }); if (Array.isArray(hist)) for (const k of hist) c.reps.set(k, (c.reps.get(k) || 0) + 1); const r = think(c, level); m = r ? { path: r.path } : null; } catch (er) {}
    self.postMessage({ id, m }); };
}
