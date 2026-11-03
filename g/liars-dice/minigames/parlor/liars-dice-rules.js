// 8 GATES — LIAR'S DICE RULES [liarsDice]. Pure game logic (no 3D, no DOM).
// Everyone rolls their dice in secret under a cup. In turn, each player raises the bid ("at least FOUR 5s on the whole table")
// or calls LIAR on the last bid (all cups lift: if the bid was true the caller loses a die, if not the bidder does)
// or calls SPOT ON (the bid is exactly right: the caller wins a die back; wrong, the caller loses one).
// Ones are WILD by default (they count as every face, and you bid on faces 2–6). Lose all your dice and you are out. Last player with dice wins.
// A raise = more dice, or the same number of dice with a higher face.

export const FACE_WORD = ['', 'ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
export const NUM_WORD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export const bidSay = b => (NUM_WORD[b.q] || b.q) + ' ' + (b.q === 1 ? FACE_WORD[b.f].replace(/s$/, '').replace(/xe$/, 'x') : FACE_WORD[b.f]);
export const bidTxt = b => b.q + ' × ' + b.f;
const d6 = () => 1 + Math.floor(Math.random() * 6);
export const alive = G => G.players.map((p, i) => p.n > 0 ? i : -1).filter(i => i >= 0);
export const totalDice = G => G.players.reduce((s, p) => s + p.n, 0);
export const minFace = opts => (opts.wild ? 2 : 1);
export const matches = (v, f, wild) => v === f || (wild && v === 1);
export function countFace(G, f) { let c = 0; G.players.forEach(p => p.dice.forEach(v => { if (matches(v, f, G.opts.wild)) c++; })); return c; }
export function isRaise(prev, b, opts) { if (b.f < minFace(opts) || b.f > 6 || b.q < 1) return false; if (!prev) return true; return b.q > prev.q || (b.q === prev.q && b.f > prev.f); }
export function minRaise(prev, opts) { if (!prev) return { q: 1, f: minFace(opts) }; return prev.f < 6 ? { q: prev.q, f: prev.f + 1 } : { q: prev.q + 1, f: minFace(opts) }; }
const nextAlive = (G, i) => { const n = G.players.length; for (let k = 1; k <= n; k++) { const j = (i + k) % n; if (G.players[j].n > 0) return j; } return i; };

// probability helpers (binomial)
const lgam = (() => { const c = [0]; for (let i = 1; i < 200; i++) c[i] = c[i - 1] + Math.log(i); return n => c[n]; })();
export function pAtLeast(k, n, p) { if (k <= 0) return 1; if (k > n) return 0; let s = 0; for (let i = k; i <= n; i++) s += Math.exp(lgam(n) - lgam(i) - lgam(n - i) + i * Math.log(p) + (n - i) * Math.log(1 - p)); return Math.min(1, s); }
export function pExactly(k, n, p) { if (k < 0 || k > n) return 0; return Math.exp(lgam(n) - lgam(k) - lgam(n - k) + k * Math.log(p) + (n - k) * Math.log(1 - p)); }
// chance that bid b is true, seen by someone holding `mine` with `unknown` other dice on the table
export function oddsTrue(b, mine, unknown, wild) { const have = mine.filter(v => matches(v, b.f, wild)).length; return pAtLeast(b.q - have, unknown, wild && b.f !== 1 ? 1 / 3 : 1 / 6); }
export function oddsExact(b, mine, unknown, wild) { const have = mine.filter(v => matches(v, b.f, wild)).length; return pExactly(b.q - have, unknown, wild && b.f !== 1 ? 1 / 3 : 1 / 6); }

// ---------------- the match ----------------
// players: [{ name, col, kind: 'me'|'local'|'cpu'|'net', cpu?, id? }]. opts: { wild: true, spot: true, start: 5 }
export function newMatch({ players, opts = {}, mode = 'cpu' }) {
  const o = { wild: true, spot: true, start: 5, ...opts };
  const G = { v: 1, mid: Math.floor(Math.random() * 1e9), seq: 0, mode, opts: o, players: players.map(p => ({ gone: false, ...p, n: o.start, dice: [] })), round: 0, turn: 0, starter: Math.floor(Math.random() * players.length),
    bid: null, history: [], phase: 'bid', reveal: null, winner: -1, ev: [], evId: 0, lost: players.map(() => 0) };
  startRound(G); return G;
}
export function startRound(G, rig) { G.round++; G.players.forEach((p, i) => { p.dice = rig && rig[i] ? rig[i].slice(0, p.n) : Array.from({ length: p.n }, d6); while (p.dice.length < p.n) p.dice.push(d6()); p.dice.sort((a, b) => a - b); });
  if (G.players[G.starter].n <= 0) G.starter = nextAlive(G, G.starter); G.turn = G.starter; G.bid = null; G.history = []; G.reveal = null; G.phase = 'bid'; event(G, { kind: 'roll', round: G.round }); }
function event(G, e) { G.evId++; G.ev.push({ id: G.evId, ...e }); if (G.ev.length > 8) G.ev.shift(); }

export function applyAct(G, p, a) {
  if (a.a === 'bid') { if (G.phase !== 'bid' || G.turn !== p) return false; const b = { q: a.q | 0, f: a.f | 0 }; if (!isRaise(G.bid, b, G.opts) || b.q > totalDice(G)) return false;
    G.bid = { ...b, p }; G.history.push({ ...b, p }); event(G, { kind: 'bid', p, q: b.q, f: b.f }); G.turn = nextAlive(G, p); return true; }
  if (a.a === 'liar' || a.a === 'spot') { if (G.phase !== 'bid' || G.turn !== p || !G.bid || (a.a === 'spot' && !G.opts.spot)) return false;
    const b = G.bid, count = countFace(G, b.f); let losers = [], gainer = -1, ok;
    if (a.a === 'liar') { ok = count < b.q; losers = [ok ? b.p : p]; } else { ok = count === b.q; if (ok) gainer = p; else losers = [p]; }
    G.reveal = { kind: a.a, caller: p, bid: { ...b }, count, ok, losers, gainer, dice: G.players.map(pl => pl.dice.slice()) };
    losers.forEach(i => { G.players[i].n = Math.max(0, G.players[i].n - 1); G.lost[i]++; }); if (gainer >= 0 && G.players[gainer].n < G.opts.start) G.players[gainer].n++;
    G.starter = a.a === 'spot' ? p : losers[0]; if (G.players[G.starter].n <= 0) G.starter = nextAlive(G, G.starter);
    event(G, { kind: a.a, p, ok, count, q: b.q, f: b.f, bp: b.p, losers, gainer }); G.phase = 'reveal'; G.turn = -1;
    const al = alive(G); if (al.length <= 1) { G.winner = al[0] ?? p; } return true; }
  if (a.a === 'next') { if (a.at != null && a.at !== G.seq) return false; if (G.phase !== 'reveal') return false; if (alive(G).length <= 1) { G.phase = 'end'; return true; } startRound(G, a.rig); return true; }
  return false;
}
// a player who leaves keeps nothing: their dice are removed (handled by the controller marking `gone`, then the CPU plays for them)

// what player `me` may see online: other dice stay hidden until the reveal
export function viewFor(G, me) { const V = JSON.parse(JSON.stringify(G)); if (G.phase === 'bid') V.players.forEach((p, i) => { if (i !== me) p.dice = p.dice.map(() => 0); }); return V; }

// ---------------- CPU ----------------
// skill 0..1. bluff 0..1 = how often it raises on faces it does not hold.
export function cpuMove(G, p, skill = 0.8, bluff = 0.25) {
  const me = G.players[p], unknown = totalDice(G) - me.n, wild = G.opts.wild, b = G.bid, jitter = () => (Math.random() - 0.5) * 0.25 * (1 - skill);
  if (b) { const pt = oddsTrue(b, me.dice, unknown, wild) + jitter();
    if (G.opts.spot && oddsExact(b, me.dice, unknown, wild) > 0.38 + 0.2 * (1 - skill) && Math.random() < 0.6) return { a: 'spot' };
    if (pt < 0.3 + 0.15 * (1 - skill)) return { a: 'liar' }; }
  if (!b) { const pr = wild ? 1 / 3 : 1 / 6; let bf = minFace(G.opts), bh = -1; for (let f = minFace(G.opts); f <= 6; f++) { const h = me.dice.filter(v => matches(v, f, wild)).length + Math.random() * 0.5; if (h > bh) { bh = h; bf = f; } }
    const have = me.dice.filter(v => matches(v, bf, wild)).length, q = Math.max(1, Math.min(totalDice(G), have + Math.floor(unknown * pr) - (Math.random() < skill ? 1 : 0))); return { a: 'bid', q, f: bf }; }
  // candidate raises: score = chance it is true (from my view), with a nudge toward faces I hold and a sometimes-bluff
  const cands = [], mr = minRaise(b, G.opts), maxQ = totalDice(G);
  for (let q = mr.q; q <= Math.min(maxQ, mr.q + 2); q++) for (let f = minFace(G.opts); f <= 6; f++) { const c = { q, f }; if (!isRaise(b, c, G.opts)) continue;
    const have = me.dice.filter(v => matches(v, f, wild)).length; let s = oddsTrue(c, me.dice, unknown, wild) + have * 0.03 + jitter(); if (Math.random() < bluff * 0.3 && have === 0) s += 0.15; cands.push({ c, s }); }
  if (!cands.length) return { a: 'liar' };
  cands.sort((x, y) => y.s - x.s); const best = cands[0];
  if (b && best.s < 0.25) return { a: 'liar' };
  return { a: 'bid', q: best.c.q, f: best.c.f };
}
