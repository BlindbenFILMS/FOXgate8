// 8 GATES — MERU CASINO · FIVE CARD STUD [meruCasino → poker table]
// You walk up to Kane's table in the gold-trimmed Meru casino, sit down, and play stud right off the felt.
// One card down, four up, a betting round after each up card (2nd–5th street). Fixed limit: ante 1, bets 2 / 4, bet + 3 raises.
// Deck art: the FOXES are the face cards (J = Fox Knave in 8 armour, Q = Fox Queen, K = Fox King) and the SHUTTLE is the ace (high).
// Solo: you + 1–4 Meru foxes (AI). Online: 2–5 friends (host runs the table, peer to peer through engine/duel-net.js,
// or a same-browser BroadcastChannel fallback for testing in tabs). Gold: solo buy-in comes from the shared save; online uses friendly chips.
//
// NO STATIC IMPORTS on purpose. The page hands in load(path) which finds three.js and fox-kit.js wherever the host serves them
// (repo, Design canvas, a world panel). That is the fix for the canvas black screen: no '../../' links between code files.
// MERGE: createStud({ container, load, onState }) stands alone. StudTable / evalHand / aiDecide are pure and can run inside meru-game.js.

export const STUD = { key: 'meruStud', name: 'FIVE CARD STUD', room: 'meruCasino', ante: 1, small: 2, big: 4, cap: 4, buyIn: 100, maxSeats: 5, turnSecs: 30 };
export const SAVE_KEYS = ['meruStud.handsPlayed', 'meruStud.handsWon', 'meruStud.bestPot', 'meruStud.bestHand', 'meruStud.royal', 'meruStud.firstWin'];

const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt)), pick = a => a[Math.floor(Math.random() * a.length)];
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// ======================================================================= POKER CORE (pure)
const SUITS = ['s', 'h', 'd', 'c'];
export const SUIT_CH = { s: '♠', h: '♥', d: '♦', c: '♣' };
export const RANK_CH = r => r === 14 ? 'A' : r === 13 ? 'K' : r === 12 ? 'Q' : r === 11 ? 'J' : String(r);
const ONE = { 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten', 11: 'Jack', 12: 'Queen', 13: 'King', 14: 'Shuttle' };
const MANY = r => r === 6 ? 'Sixes' : ONE[r] + 's';
export const newDeck = () => { const d = []; for (const s of SUITS) for (let r = 2; r <= 14; r++) d.push({ r, s }); return d; };
const rnd = n => { try { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; } catch (e) { return Math.floor(Math.random() * n); } };
export const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Works for 1–5 cards. With fewer than 5 only pairs / trips / quads count (that is how the showing hands are ranked).
export function evalHand(cards) {
  const n = cards.length; if (!n) return { cat: -1, score: -1, name: '' };
  const cnt = {}; for (const c of cards) cnt[c.r] = (cnt[c.r] || 0) + 1;
  const groups = Object.entries(cnt).map(([r, k]) => [+r, k]).sort((a, b) => b[1] - a[1] || b[0] - a[0]), uniq = groups.map(g => g[0]);
  let flush = false, straight = 0;
  if (n === 5) { flush = cards.every(c => c.s === cards[0].s); if (uniq.length === 5) { const s = [...uniq].sort((a, b) => b - a); if (s[0] - s[4] === 4) straight = s[0]; else if (s[0] === 14 && s[1] === 5) straight = 5; } }
  const k0 = groups[0][1], k1 = groups[1] ? groups[1][1] : 0; let cat, kick = uniq;
  if (straight && flush) { cat = 8; kick = [straight]; } else if (k0 === 4) cat = 7; else if (k0 === 3 && k1 === 2) cat = 6; else if (flush) cat = 5;
  else if (straight) { cat = 4; kick = [straight]; } else if (k0 === 3) cat = 3; else if (k0 === 2 && k1 === 2) cat = 2; else if (k0 === 2) cat = 1; else cat = 0;
  let score = cat; for (let i = 0; i < 5; i++) score = score * 15 + (kick[i] || 0);
  return { cat, score, kick, name: handName(cat, kick, n) };
}
function handName(cat, k, n) {
  switch (cat) {
    case 8: return k[0] === 14 ? 'Royal Launch' : 'Straight flush, ' + ONE[k[0]] + ' high';
    case 7: return 'Four ' + MANY(k[0]);
    case 6: return 'Full house, ' + MANY(k[0]) + ' over ' + MANY(k[1]);
    case 5: return 'Flush, ' + ONE[k[0]] + ' high';
    case 4: return k[0] === 14 ? 'Straight to the Shuttle' : 'Straight, ' + ONE[k[0]] + ' high';
    case 3: return 'Three ' + MANY(k[0]);
    case 2: return MANY(k[0]) + ' and ' + MANY(k[1]);
    case 1: return 'Pair of ' + MANY(k[0]);
    default: return n === 1 ? ONE[k[0]] : ONE[k[0]] + ' high';
  }
}
export const HAND_RANKS = ['High card', 'Pair', 'Two pair', 'Three of a kind', 'Straight', 'Flush', 'Full house', 'Four of a kind', 'Straight flush (Royal Launch with the Shuttle)'];

export class StudTable {
  constructor(seats, o = {}) {
    this.o = { ...STUD, ...o }; this.handNo = 0; this.phase = 'idle'; this.pot = 0; this.street = 0; this.toAct = -1; this.curBet = 0; this.raises = 0; this.result = null; this.ev = [];
    this.P = []; seats.forEach(s => this.addSeat(s));
  }
  addSeat(s) { this.P.push({ id: s.id, name: s.name, kind: s.kind, pers: s.pers, lk: s.lk ?? 0, chips: s.chips ?? this.o.buyIn, cards: [], bet: 0, total: 0, folded: true, out: true, allIn: false, acted: false, last: '', gone: false }); return this.P.length - 1; }
  live() { return this.P.filter(p => !p.folded); }
  canAct(p) { return !p.folded && !p.allIn; }
  startHand() {
    if (this.P.filter(p => p.chips > 0 && !p.gone).length < 2) return false;
    this.handNo++; this.deck = shuffle(newDeck()); this.pot = 0; this.result = null; this.street = 0;
    for (const p of this.P) { p.cards = []; p.bet = 0; p.total = 0; p.allIn = false; p.acted = false; p.last = ''; p.folded = !(p.chips > 0 && !p.gone); p.out = p.folded; }
    for (const p of this.live()) { const a = Math.min(this.o.ante, p.chips); p.chips -= a; p.total += a; this.pot += a; if (!p.chips) { p.allIn = true; p.last = 'ALL IN'; } }
    for (const p of this.live()) p.cards.push({ ...this.deck.pop(), up: false });
    for (const p of this.live()) p.cards.push({ ...this.deck.pop(), up: true });
    this.street = 2; this.ev.push({ k: 'deal' }); this.beginBetting(); return true;
  }
  beginBetting() {
    for (const p of this.P) { p.bet = 0; p.acted = false; if (!p.folded && !p.allIn) p.last = ''; }
    this.curBet = 0; this.raises = 0;
    if (this.P.filter(p => this.canAct(p)).length < 2) { this.toAct = -1; if (this.street >= 5) this.showdown(); else this.phase = 'deal'; return; }
    this.phase = 'bet'; this.toAct = this.firstToAct();
  }
  firstToAct() { let best = -1, bs = -2; const n = this.P.length, st = this.handNo % n; for (let k = 0; k < n; k++) { const i = (st + k) % n, p = this.P[i]; if (!this.canAct(p)) continue; const sc = evalHand(p.cards.filter(c => c.up)).score; if (sc > bs) { bs = sc; best = i; } } return best; }
  betSize() { return this.street <= 3 ? this.o.small : this.o.big; }
  legal(i) {
    const p = this.P[i]; if (this.phase !== 'bet' || i !== this.toAct || !p) return null;
    const toCall = Math.max(0, this.curBet - p.bet), others = this.P.some((q, j) => j !== i && this.canAct(q));
    const raiseCost = Math.min(this.curBet + this.betSize() - p.bet, p.chips);
    return { toCall, call: Math.min(toCall, p.chips), fold: toCall > 0, check: toCall === 0, raise: this.raises < this.o.cap && p.chips > toCall && others, open: this.curBet === 0, raiseTo: p.bet + raiseCost, raiseCost, allInCall: toCall > 0 && toCall >= p.chips, allInRaise: raiseCost >= p.chips };
  }
  pay(p, n) { n = Math.min(n, p.chips); p.chips -= n; p.bet += n; p.total += n; this.pot += n; if (!p.chips) p.allIn = true; return n; }
  act(i, a) {
    const L = this.legal(i); if (!L) return false; const p = this.P[i];
    if (a === 'fold' && !L.fold) a = 'check';
    if (a === 'check' && !L.check) a = 'fold';
    if (a === 'raise' && !L.raise) a = L.check ? 'check' : 'call';
    if (a === 'fold') p.folded = true, p.last = 'FOLD';
    else if (a === 'check') p.last = 'CHECK';
    else if (a === 'call') { const n = this.pay(p, L.toCall); p.last = p.allIn ? 'ALL IN' : 'CALL ' + n; }
    else if (a === 'raise') { this.pay(p, L.raiseCost); if (p.bet > this.curBet) { if (p.bet >= this.curBet + this.betSize()) this.raises++; this.curBet = p.bet; for (const q of this.P) if (q !== p) q.acted = false; } p.last = p.allIn ? 'ALL IN' : (L.open ? 'BET ' : 'RAISE TO ') + p.bet; }
    p.acted = true; this.ev.push({ k: 'act', i, a, last: p.last });
    if (this.live().length === 1) { this.finish(); return true; }
    if (this.P.every(q => !this.canAct(q) || (q.acted && q.bet === this.curBet))) { this.endStreet(); return true; }
    const n = this.P.length; for (let k = 1; k <= n; k++) { const j = (i + k) % n; if (this.canAct(this.P[j])) { this.toAct = j; break; } }
    return true;
  }
  endStreet() { this.toAct = -1; if (this.street >= 5) this.showdown(); else this.phase = 'deal'; }
  dealStreet() { if (this.phase !== 'deal') return false; this.street++; for (const p of this.live()) p.cards.push({ ...this.deck.pop(), up: true }); this.ev.push({ k: 'deal' }); this.beginBetting(); return true; }
  leave(i) { const p = this.P[i]; if (!p) return; p.gone = true; if (this.phase === 'bet' && this.toAct === i) this.act(i, 'fold'); else if (!p.folded && this.phase !== 'over') { p.folded = true; p.last = 'LEFT'; if (this.live().length === 1 && this.phase !== 'over') this.finish(); else if (this.phase === 'bet' && this.P.every(q => !this.canAct(q) || (q.acted && q.bet === this.curBet))) this.endStreet(); } }
  handOf(p) { return evalHand(p.cards); }
  finish() { this.settle([{ amt: this.pot, elig: this.live() }], true); }
  showdown() {
    const live = this.live(), levels = [...new Set(live.map(p => p.total))].sort((a, b) => a - b), pots = []; let prev = 0;
    for (const L of levels) { let amt = 0; for (const p of this.P) amt += Math.max(0, Math.min(p.total, L) - prev); pots.push({ amt, elig: live.filter(p => p.total >= L) }); prev = L; }
    let extra = 0; for (const p of this.P) extra += Math.max(0, p.total - prev); if (extra && pots.length) pots[pots.length - 1].amt += extra;
    this.settle(pots, false);
  }
  settle(pots, byFold) {
    const won = new Map(), ev = new Map(); for (const p of this.live()) ev.set(p, this.handOf(p));
    for (const pt of pots) { if (!pt.amt || !pt.elig.length) continue; let best = -1, ws = []; for (const p of pt.elig) { const s = byFold ? 0 : ev.get(p).score; if (s > best) { best = s; ws = [p]; } else if (s === best) ws.push(p); }
      const share = Math.floor(pt.amt / ws.length); let odd = pt.amt - share * ws.length; for (const p of ws) { won.set(p, (won.get(p) || 0) + share + (odd-- > 0 ? 1 : 0)); } }
    for (const [p, g] of won) p.chips += g;
    this.result = { byFold, pot: this.pot, winners: [...won].map(([p, g]) => ({ i: this.P.indexOf(p), amt: g, hand: byFold ? '' : ev.get(p).name, cat: byFold ? -1 : ev.get(p).cat })), hands: this.P.map(p => !p.folded && !byFold ? ev.get(p).name : '') };
    this.phase = 'over'; this.toAct = -1; this.ev.push({ k: 'over' });
  }
  // What seat v is allowed to see. Everything here is plain JSON (sent over the network as is).
  view(v) {
    const R = this.result, show = R && !R.byFold;
    return { handNo: this.handNo, phase: this.phase, street: this.street, pot: this.pot, curBet: this.curBet, betSize: this.betSize(), toAct: this.toAct, me: v, result: R,
      players: this.P.map((p, i) => ({ name: p.name, kind: p.kind, lk: p.lk, chips: p.chips, bet: p.bet, total: p.total, folded: p.folded, out: p.out, allIn: p.allIn, last: p.last, gone: p.gone,
        cards: p.cards.map(c => (c.up || i === v || (show && !p.folded)) ? { r: c.r, s: c.s, up: c.up } : { r: 0, s: '', up: false }) })),
      legal: this.legal(v) };
  }
}

// Monte-Carlo equity against the live foxes, then a personality decides. Uses only what that fox can see.
export function aiDecide(T, i) {
  const me = T.P[i], L = T.legal(i); if (!L) return 'check';
  const pers = me.pers || { aggr: 1.4, bluff: 0.08, call: 1 }, opp = T.P.filter((p, j) => j !== i && !p.folded), key = c => c.r + c.s, known = new Set();
  for (const p of T.P) for (const c of p.cards) if (c.up || p === me) known.add(key(c));
  const rest = newDeck().filter(c => !known.has(key(c))), N = 220; let win = 0;
  for (let it = 0; it < N; it++) {
    let top = rest.length; const draw = () => { const j = Math.floor(Math.random() * top), c = rest[j]; rest[j] = rest[--top]; rest[top] = c; return c; };
    const mine = me.cards.slice(); while (mine.length < 5) mine.push(draw()); const ms = evalHand(mine).score; let best = true, ties = 0;
    for (const p of opp) { const h = p.cards.filter(c => c.up); h.push(draw()); while (h.length < 5) h.push(draw()); const s = evalHand(h).score; if (s > ms) { best = false; break; } if (s === ms) ties++; }
    if (best) win += 1 / (1 + ties);
  }
  const e = win / N + rr(-0.04, 0.04), fair = 1 / (opp.length + 1), odds = L.toCall / (T.pot + L.toCall);
  if (L.raise && e > fair * pers.aggr) return 'raise';
  if (L.check) return L.raise && T.street >= 3 && Math.random() < pers.bluff ? 'raise' : 'check';
  if (e >= odds * pers.call || (T.street === 2 && L.toCall <= T.o.small && e > fair * 0.55)) return 'call';
  return 'fold';
}

// ======================================================================= TEXAS HOLD'EM (same table, same chips, same foxes)
// Fixed limit: blinds 1/2, bets 2 pre-flop + flop, 4 on turn + river, a bet and three raises. Two hole cards each, five on the board.
export function best5(cards) {
  if (cards.length <= 5) return evalHand(cards); let best = null; const n = cards.length, pick5 = [];
  const rec = (start, chosen) => { if (chosen.length === 5) { const e = evalHand(chosen.map(i => cards[i])); if (!best || e.score > best.score) best = e; return; } for (let i = start; i <= n - (5 - chosen.length); i++) { chosen.push(i); rec(i + 1, chosen); chosen.pop(); } };
  rec(0, []); return best;
}
export const HOLDEM = { small: 2, big: 4, sb: 1, bb: 2, cap: 4, buyIn: 100 };
export class HoldemTable extends StudTable {
  constructor(seats, o = {}) { super(seats, { ...HOLDEM, ...o }); this.game = 'holdem'; this.board = []; this.button = -1; }
  handOf(p) { return best5(p.cards.concat(this.board)); }
  nextWith(i, f) { const n = this.P.length; for (let k = 1; k <= n; k++) { const j = (i + k) % n; if (f(this.P[j])) return j; } return -1; }
  startHand() {
    if (this.P.filter(p => p.chips > 0 && !p.gone).length < 2) return false;
    this.handNo++; this.deck = shuffle(newDeck()); this.pot = 0; this.result = null; this.board = []; this.street = 0;
    for (const p of this.P) { p.cards = []; p.bet = 0; p.total = 0; p.allIn = false; p.acted = false; p.last = ''; p.folded = !(p.chips > 0 && !p.gone); p.out = p.folded; }
    const inHand = p => !p.folded; this.button = this.nextWith(this.button < 0 ? this.P.length - 1 : this.button, inHand);
    const heads = this.live().length === 2, sb = heads ? this.button : this.nextWith(this.button, inHand), bb = this.nextWith(sb, inHand);
    this.sbI = sb; this.bbI = bb;
    this.pay(this.P[sb], this.o.sb); this.P[sb].last = this.P[sb].allIn ? 'ALL IN' : 'SMALL BLIND ' + this.P[sb].bet;
    this.pay(this.P[bb], this.o.bb); this.P[bb].last = this.P[bb].allIn ? 'ALL IN' : 'BIG BLIND ' + this.P[bb].bet;
    for (let r = 0; r < 2; r++) { let j = sb; for (let k = 0; k < this.P.length; k++) { const p = this.P[j]; if (!p.folded) p.cards.push({ ...this.deck.pop(), up: false }); j = (j + 1) % this.P.length; } }
    this.curBet = Math.max(...this.P.map(p => p.bet)); this.raises = 1; this.phase = 'bet'; this.ev.push({ k: 'deal' });
    if (this.P.filter(p => this.canAct(p)).length < 2 && this.P.every(q => !this.canAct(q) || q.bet === this.curBet)) { this.toAct = -1; this.phase = 'deal'; return true; }
    this.toAct = this.nextWith(bb, p => this.canAct(p)); return true;
  }
  beginBetting() {
    for (const p of this.P) { p.bet = 0; p.acted = false; if (!p.folded && !p.allIn) p.last = ''; }
    this.curBet = 0; this.raises = 0;
    if (this.P.filter(p => this.canAct(p)).length < 2) { this.toAct = -1; if (this.street >= 3) this.showdown(); else this.phase = 'deal'; return; }
    this.phase = 'bet'; this.toAct = this.nextWith(this.button, p => this.canAct(p));
  }
  betSize() { return this.street <= 1 ? this.o.small : this.o.big; }
  endStreet() { this.toAct = -1; if (this.street >= 3) this.showdown(); else this.phase = 'deal'; }
  dealStreet() { if (this.phase !== 'deal') return false; this.street++; this.deck.pop(); const n = this.street === 1 ? 3 : 1; for (let k = 0; k < n; k++) this.board.push({ ...this.deck.pop(), up: true }); this.ev.push({ k: 'deal' }); this.beginBetting(); return true; }
  view(v) { const V = super.view(v); V.game = 'holdem'; V.board = this.board.map(c => ({ r: c.r, s: c.s, up: true })); V.button = this.button; V.sb = this.sbI; V.bb = this.bbI; return V; }
}
// fox play for hold'em: Monte-Carlo over the unseen board and the other foxes' hole cards
export function aiDecideHoldem(T, i) {
  const me = T.P[i], L = T.legal(i); if (!L) return 'check';
  const pers = me.pers || { aggr: 1.4, bluff: 0.08, call: 1 }, opp = T.P.filter((p, j) => j !== i && !p.folded), key = c => c.r + c.s, known = new Set();
  for (const c of me.cards.concat(T.board)) known.add(key(c));
  const rest = newDeck().filter(c => !known.has(key(c))), N = opp.length > 2 ? 90 : 140; let win = 0;
  for (let it = 0; it < N; it++) {
    let top = rest.length; const draw = () => { const j = Math.floor(Math.random() * top), c = rest[j]; rest[j] = rest[--top]; rest[top] = c; return c; };
    const board = T.board.slice(); while (board.length < 5) board.push(draw());
    const ms = best5(me.cards.concat(board)).score; let best = true, ties = 0;
    for (const p of opp) { const s2 = best5([draw(), draw()].concat(board)).score; if (s2 > ms) { best = false; break; } if (s2 === ms) ties++; }
    if (best) win += 1 / (1 + ties);
  }
  const e = win / N + rr(-0.04, 0.04), fair = 1 / (opp.length + 1), odds = L.toCall / (T.pot + L.toCall);
  if (L.raise && e > fair * pers.aggr) return 'raise';
  if (L.check) return L.raise && T.street >= 1 && Math.random() < pers.bluff ? 'raise' : 'check';
  if (e >= odds * pers.call || (T.street === 0 && L.toCall <= T.o.small && e > fair * 0.7)) return 'call';
  return 'fold';
}

// ======================================================================= SAVE (same storage as engine/save.js, copied so this file has no imports)
const SAVE_KEY = '8gates.save.v1';
const freshSave = () => ({ v: 1, world: 'meru', zone: 'meruTown', gold: 50, xp: 0, items: { erToGo: 1, energyPod: 1, chocolates: 1 }, relics: [], outfit: null, flags: { starterKit: true }, stats: {} });
function saveRead() { try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { const d = Object.assign(freshSave(), JSON.parse(raw)); d.flags = d.flags || {}; d.stats = d.stats || {}; return d; } } catch (e) {} return freshSave(); }
function saveEdit(fn) { const d = saveRead(); fn(d); try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch (e) {} try { const S = parent && parent !== window && parent.__8G_SAVE; if (S && S.reload) S.reload(); } catch (e) {} return d; }
const pref = (k, d) => { try { const v = localStorage.getItem('meruStud.' + k); return v == null ? d : v; } catch (e) { return d; } };
const setPref = (k, v) => { try { localStorage.setItem('meruStud.' + k, String(v)); } catch (e) {} };

// ======================================================================= SOUND (tiny synth, no files)
class Sfx {
  constructor() { this.on = pref('sound', '1') !== '0'; }
  ctx() { if (!this.c) { try { this.c = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (this.c.state === 'suspended') this.c.resume(); return this.c; }
  tone(f, d, v = 0.06, type = 'triangle', at = 0) { if (!this.on) return; const c = this.ctx(); if (!c) return; const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.03); }
  noise(d, v = 0.08, at = 0, hp = 2500) { if (!this.on) return; const c = this.ctx(); if (!c) return; if (!this.nb) { const b = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate), a = b.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; this.nb = b; }
    const t = c.currentTime + at, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.nb; f.type = 'highpass'; f.frequency.value = hp; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f).connect(g).connect(c.destination); s.start(t); s.stop(t + d + 0.02); }
  card() { this.noise(0.06, 0.07, 0, 3200); } chip() { this.tone(2350, 0.05, 0.035, 'sine'); this.tone(3050, 0.05, 0.03, 'sine', 0.035); }
  turn() { this.tone(660, 0.12, 0.05); this.tone(880, 0.16, 0.045, 'triangle', 0.1); } fold() { this.tone(240, 0.16, 0.04, 'sine'); }
  win() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.28, 0.06, 'triangle', i * 0.09)); } lose() { [392, 330].forEach((f, i) => this.tone(f, 0.25, 0.04, 'sine', i * 0.14)); }
}

// ======================================================================= MUSIC (lounge jazz, made on the fly)
// Swung 8ths at 92 bpm: ii-V-I turnarounds on a warm electric piano, a walking upright bass, brushed hats and the odd vibraphone phrase.
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const PROG = [ // [bass root, chord tones]
  [50, [65, 69, 72, 76]], [43, [59, 65, 69, 76]], [48, [64, 67, 71, 74]], [45, [64, 67, 70, 73]],
  [41, [65, 69, 72, 76]], [52, [67, 71, 74, 76]], [50, [65, 69, 72, 77]], [43, [65, 71, 74, 77]]];
class Lounge {
  constructor(sfx) { this.sfx = sfx; this.on = pref('music', '1') !== '0'; this.playing = false; }
  start() {
    if (!this.on || this.playing) return; const c = this.sfx.ctx(); if (!c) return; this.c = c;
    this.out = c.createGain(); this.out.gain.value = 0.0001; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
    const dl = c.createDelay(1); dl.delayTime.value = 0.31; const fb = c.createGain(); fb.gain.value = 0.3; const wet = c.createGain(); wet.gain.value = 0.22;
    this.bus = c.createGain(); this.bus.connect(lp); lp.connect(this.out); lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(this.out); this.out.connect(c.destination);
    this.out.gain.linearRampToValueAtTime(0.42, c.currentTime + 2.5); this.playing = true; this.beat = 0; this.next = c.currentTime + 0.12;
    this.timer = setInterval(() => this.sched(), 90);
  }
  stop() { if (!this.playing) return; this.playing = false; clearInterval(this.timer); const c = this.c, o = this.out; try { o.gain.cancelScheduledValues(c.currentTime); o.gain.setValueAtTime(o.gain.value, c.currentTime); o.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.8); } catch (e) {} setTimeout(() => { try { o.disconnect(); } catch (e) {} }, 1000); }
  toggle() { this.on = !this.on; setPref('music', this.on ? 1 : 0); if (this.on) this.start(); else this.stop(); }
  sched() { const c = this.c; if (!c || c.state !== 'running') return; const B = 60 / 92; while (this.next < c.currentTime + 0.35) { this.play(this.beat, this.next, B); this.beat++; this.next += B; } }
  voice(f, t, d, v, type = 'sine', att = 0.01, dest = this.bus) { const c = this.c, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(dest); o.start(t); o.stop(t + d + 0.05); return o; }
  keys(m, t, d, v) { this.voice(mtof(m), t, d, v, 'sine', 0.008); this.voice(mtof(m) * 2.003, t, d * 0.45, v * 0.22, 'triangle', 0.004); }
  hat(t, v, len = 0.05) { const c = this.c; if (!this.nb) { const bf = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate), a = bf.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; this.nb = bf; } const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.nb; f.type = 'highpass'; f.frequency.value = 7200; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len); s.connect(f).connect(g).connect(this.bus); s.start(t); s.stop(t + len + 0.02); }
  play(beat, t, B) {
    const bar = Math.floor(beat / 4) % PROG.length, b = beat % 4, [root, ch] = PROG[bar], [nroot] = PROG[(bar + 1) % PROG.length], sw = B * 0.66;
    // walking bass: root, a chord tone, another, then a step into the next root
    const walk = [root, root + 7, root + 12, nroot + (Math.random() < 0.5 ? 1 : -1)];
    this.voice(mtof(walk[b] + 12), t, B * 0.85, 0.15, 'triangle', 0.006); this.voice(mtof(walk[b]), t, B * 0.85, 0.1, 'sine', 0.006);
    // comping: on 1 and the swung "and" of 2
    if (b === 0) ch.forEach((m, i) => this.keys(m, t + i * 0.008, B * 1.6, 0.045));
    if (b === 1 && Math.random() < 0.7) ch.forEach((m, i) => this.keys(m, t + sw + i * 0.006, B * 0.9, 0.035));
    // brushes: ride on every beat + the swung skip note, chick on 2 and 4
    this.hat(t, 0.05, 0.12); if (Math.random() < 0.8) this.hat(t + sw, 0.03, 0.08); if (b % 2) this.hat(t, 0.07, 0.04);
    // vibraphone phrase now and then
    if (Math.random() < 0.32) { const m = ch[Math.floor(Math.random() * ch.length)] + 12, o = this.voice(mtof(m), t + (Math.random() < 0.5 ? 0 : sw), B * 1.4, 0.05, 'sine', 0.004); try { const lfo = this.c.createOscillator(), lg = this.c.createGain(); lfo.frequency.value = 5.5; lg.gain.value = 3; lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(t + B * 1.5); } catch (e) {} }
  }
}

// ======================================================================= CAST AT THE TABLE (DRAFT names: Kane + Lyra are the casino's foxes in the brief; the others walk Meru Town Square)
const FOXES = [
  { name: 'LYRA', pers: { aggr: 1.25, bluff: 0.14, call: 0.9 }, base: 'f', outfit: 'dress', torso: ['#14b8a6', '#0f766e', '#134e4a'], fur: ['#f4efe7', '#cdbfae', '#ffffff'], line: 'Lyra never folds a pretty card.' },
  { name: 'GRAND', pers: { aggr: 1.65, bluff: 0.03, call: 1.15 }, base: 'k', outfit: 'suit', torso: ['#334155', '#1e293b', '#0f172a'], fur: ['#a8a29e', '#78716c', '#f5f5f4'] },
  { name: 'ULRIC', pers: { aggr: 1.5, bluff: 0.05, call: 0.75 }, base: 'm', outfit: 'coat', torso: ['#2f5d2a', '#1f3d1c', '#13260f'], fur: ['#b4441c', '#7c2d12', '#fde7d4'] },
  { name: 'JAMOS', pers: { aggr: 1.4, bluff: 0.08, call: 1.0 }, base: 'm', outfit: 'vest', torso: ['#2563eb', '#1d4ed8', '#1e3a8a'], fur: ['#f2741f', '#c2410c', '#ffe4c4'] },
  { name: 'LUCIUS', pers: { aggr: 1.2, bluff: 0.18, call: 0.85 }, base: 'm', outfit: 'suit', torso: ['#1c1917', '#0c0a09', '#000000'], fur: ['#57534e', '#292524', '#e7e5e4'] }];
const NET_LOOKS = [
  { base: 'm', outfit: 'armor', torso: ['#ffffff', '#e7edf4', '#6b7d93'] }, { base: 'f', outfit: 'dress', torso: ['#c42d3c', '#9b1c2c', '#5a0f19'] },
  { base: 'm', outfit: 'vest', torso: ['#e6b45a', '#b8862f', '#6b4a12'] }, { base: 'f', outfit: 'coat', torso: ['#7c3aed', '#5b21b6', '#2e1065'], fur: ['#f4efe7', '#cdbfae', '#ffffff'] },
  { base: 'm', outfit: 'suit', torso: ['#0e7fb8', '#0b5f8a', '#063a54'], fur: ['#57534e', '#292524', '#e7e5e4'] }];

// ======================================================================= ENTRY
export async function createStud({ container, load, onState = () => {}, embed = false }) {
  const THREE = await load('vendor/three/three.module.js'), FK = await load('fox-kit.js');
  try { await Promise.race([document.fonts.load('900 64px Archivo'), new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), FONT = '"Archivo", "Arial Black", Arial, sans-serif';
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1;
  const DPR = Math.min(devicePixelRatio || 1, touch ? 1.75 : 2);

  // ---------- stage (same recipe as engine/restaurant-kit.js createStage: toon + ink outlines) ----------
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR); renderer.setSize(CW(), CH(), false); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !touch; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), BG = new THREE.Color('#1a0a12'); scene.background = BG; scene.fog = new THREE.Fog('#1a0a12', 15, 34);
  const camera = new THREE.PerspectiveCamera(45, CW() / CH(), 0.3, 80);
  const grad = (() => { const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
  const mcache = new Map(), toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!mcache.has(k)) mcache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return mcache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return o; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const canvasTex = (w, h, draw, repeat) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); } return t; };
  const crestTex = (letter, ring, bg = '#070a13', fg = '#ffffff') => canvasTex(128, 128, g => { g.fillStyle = ring; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = bg; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill(); g.fillStyle = fg; g.font = `900 70px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(letter, 64, 68); });
  const kit = FK.foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const sfx = new Sfx(), music = new Lounge(sfx);
  // browsers only allow sound after a tap: the first tap anywhere starts the lounge band
  const firstTap = () => { sfx.ctx(); if (music.on) music.start(); };
  container.addEventListener('pointerdown', firstTap); addEventListener('keydown', firstTap);
  document.addEventListener('visibilitychange', () => { try { const c = sfx.c; if (!c) return; if (document.hidden) c.suspend(); else c.resume(); } catch (e) {} });

  scene.add(new THREE.HemisphereLight(0xffe9d2, 0x40202c, 1.05));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.5); sun.position.set(2, 9, 4); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 20 }); scene.add(sun);
  const glowTex = canvasTex(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const glow = (x, y, z, s, col, op = 0.8) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })); sp.position.set(x, y, z); sp.scale.setScalar(s); scene.add(sp); return sp; };

  // ---------- the casino room (gold-trimmed hall; slots on the back wall, treasure wheel, neon) ----------
  const blinkers = [], spinners = [];
  (function room() {
    const carpet = canvasTex(256, 256, (g, w) => { g.fillStyle = '#5a1222'; g.fillRect(0, 0, w, w); g.strokeStyle = '#c99a3a'; g.lineWidth = 4; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(w / 2, 6 + i * w / 2 - 6); g.lineTo(w - 6, w / 2); g.lineTo(w / 2, w - 6); g.lineTo(6, w / 2); g.closePath(); } g.stroke(); g.fillStyle = '#7a1a2e'; g.beginPath(); g.arc(w / 2, w / 2, 26, 0, 7); g.fill(); g.fillStyle = '#e6b45a'; for (const [x, y] of [[0, 0], [w, 0], [0, w], [w, w]]) { g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill(); } g.fillStyle = '#3d0b17'; g.fillRect(w / 2 - 3, 0, 6, 18); g.fillRect(w / 2 - 3, w - 18, 6, 18); }, 9);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshToonMaterial({ map: carpet, gradientMap: grad })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = !touch; scene.add(floor);
    const wallMat = toon('#3a1224'), trim = toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.35 });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(26, 8, 26), [wallMat, wallMat, toon('#1c0812'), wallMat, wallMat, wallMat].map(m => { const c = m.clone(); c.side = THREE.BackSide; return c; })); walls.position.y = 4; scene.add(walls);
    for (const [x, z, ry] of [[0, -12.95, 0], [0, 12.95, Math.PI], [-12.95, 0, Math.PI / 2], [12.95, 0, -Math.PI / 2]]) for (const y of [1.0, 1.12, 6.9]) { const b = new THREE.Mesh(new THREE.BoxGeometry(26, y === 1.12 ? 0.03 : 0.1, 0.06), trim); b.position.set(x, y, z); b.rotation.y = ry; scene.add(b); }
    for (const x of [-8, 8]) for (const z of [-8, 6]) { M(new THREE.CylinderGeometry(0.42, 0.42, 8, 16), toon('#4a1a2c'), x, 4, z, null, 0.03, 0.42); M(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16), trim, x, 0.15, z, null, 0); M(new THREE.CylinderGeometry(0.5, 0.42, 0.3, 16), trim, x, 7.6, z, null, 0); }
    // slot machines along the back wall
    const reelSym = ['8', '♦', '7', '★', 'FOX'];
    for (let i = 0; i < 7; i++) { const x = -7.2 + i * 2.4, z = -12.1, body = toon(i % 2 ? '#9b1c2c' : '#1e3a8a');
      M(new THREE.BoxGeometry(1.3, 1.9, 0.9), body, x, 0.95, z, null, 0.03); M(new THREE.BoxGeometry(1.36, 0.12, 0.96), trim, x, 1.95, z, null, 0);
      M(new THREE.BoxGeometry(1.2, 0.5, 0.5), toon('#111827'), x, 2.3, z, null, 0.02);
      const scr = canvasTex(256, 96, (g, w, h) => { g.fillStyle = '#fff7e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#c42d3c'; g.font = `900 52px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let k = 0; k < 3; k++) { g.fillText(reelSym[(i + k * 2) % reelSym.length], 43 + k * 85, 52); if (k) { g.fillStyle = '#1a1626'; g.fillRect(k * 85, 0, 3, h); g.fillStyle = '#c42d3c'; } } });
      const s = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.38), new THREE.MeshBasicMaterial({ map: scr })); s.position.set(x, 1.42, z + 0.46); scene.add(s);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshBasicMaterial({ color: i % 2 ? '#ffd23a' : '#ff5a6a' })); top.position.set(x, 2.68, z); scene.add(top);
      blinkers.push({ m: top, sp: glow(x, 2.68, z + 0.1, 1.1, i % 2 ? 0xffd23a : 0xff5a6a, 0.6), ph: i * 0.9 }); }
    // treasure wheel (left wall)
    const wheelTex = canvasTex(256, 256, (g, w) => { const n = 12; for (let k = 0; k < n; k++) { g.fillStyle = ['#c42d3c', '#e6b45a', '#1e3a8a', '#f3f2f2'][k % 4]; g.beginPath(); g.moveTo(128, 128); g.arc(128, 128, 124, k / n * 7, (k + 1) / n * Math.PI * 2 + 0.01); g.fill(); } g.fillStyle = '#1a1626'; g.beginPath(); g.arc(128, 128, 30, 0, 7); g.fill(); g.fillStyle = '#e6b45a'; g.font = `900 34px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 128, 131); });
    const wheel = new THREE.Mesh(new THREE.CircleGeometry(2, 40), new THREE.MeshBasicMaterial({ map: wheelTex })); wheel.position.set(-12.85, 3.6, -3); wheel.rotation.y = Math.PI / 2; scene.add(wheel); spinners.push(wheel);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.1, 8, 48), trim); rim.position.copy(wheel.position); rim.rotation.y = Math.PI / 2; scene.add(rim);
    // neon sign (right wall)
    const neon = canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#12060c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ff5a8a'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.shadowColor = '#ffd23a'; g.shadowBlur = 18; g.fillStyle = '#ffe9a0'; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MERU CASINO', w / 2, h / 2 + 4); });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), new THREE.MeshBasicMaterial({ map: neon })); sign.position.set(12.85, 4.6, -2); sign.rotation.y = -Math.PI / 2; scene.add(sign); glow(12.6, 4.6, -2, 5, 0xff5a8a, 0.35);
    // chandeliers
    for (const [x, z] of [[-6, -5], [6, -5], [0, 6]]) { M(new THREE.TorusGeometry(0.6, 0.05, 6, 24), trim, x, 6.6, z, null, 0).rotation.x = Math.PI / 2; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; const b = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff3c4' })); b.position.set(x + Math.cos(a) * 0.6, 6.7, z + Math.sin(a) * 0.6); scene.add(b); } glow(x, 6.6, z, 3.2, 0xffd9a0, 0.55); }
  })();

  // ---------- card art: shared with the Card Workshop (minigames/meru/stud-cards.js), driven by one style object ----------
  const CA = await load('minigames/meru/stud-cards.js'), cardStyle = await CA.loadCardStyle(), RES = touch ? 2 : 2.5;
  const art = CA.createCardArt({ THREE, FK, style: cardStyle, RES, FONT });
  const { CWp, CHp, rrect, suitPath, paintCard } = art, isRed = CA.isRed;
  const cardFaceCanvas = (r, s) => { const c = art.newCanvas(); paintCard(c, r, s); return c; };
  const backTex = (() => { const c = art.newCanvas(); art.paintBack(c); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const faceMats = new Map(), backMat = new THREE.MeshBasicMaterial({ map: backTex, alphaTest: 0.5 }), dimBack = new THREE.MeshBasicMaterial({ map: backTex, color: 0x808080, alphaTest: 0.5 }); backTex.anisotropy = 8;
  const texCache = new Map();
  function faceMat(r, s, dim) { const k = r + s + (dim ? 'd' : ''); if (!faceMats.has(k)) { let tex = texCache.get(r + s); if (!tex) { tex = new THREE.CanvasTexture(cardFaceCanvas(r, s)); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; texCache.set(r + s, tex); } faceMats.set(k, new THREE.MeshBasicMaterial({ map: tex, color: dim ? 0x8a8a8a : 0xffffff, alphaTest: 0.5 })); } return faceMats.get(k); }

  // ---------- fox looks ----------
  function lookFor(d) {
    const base = d.base === 'f' ? FK.PLAYER_FEMALE : d.base === 'k' ? FK.KING_MIGHT : FK.PLAYER_MALE, L = { ...base };
    if (d.fur) { L.fur = d.fur[0]; L.paw = d.fur[0]; L.furDark = d.fur[1]; L.tailBase = d.fur[1]; L.tailMid = d.fur[0]; L.fluff = d.fur[2]; L.chin = d.fur[2]; }
    if (d.acc) L.armorAccent = d.acc;
    return L;
  }
  const makeFox = (d, extra = {}) => kit.makeFox({ torso: d.torso, outfit: d.outfit, look: lookFor(d), mood: 'neutral', ...extra });

  art.dispose();   // the portrait studio's own renderer is no longer needed
  // LIVE LINK to the Card Workshop: when the deck style saved on this device changes (another tab, another canvas board),
  // redraw every card texture in place, no reload needed.
  let styleRaw = (() => { try { return localStorage.getItem(CA.CARD_STYLE_KEY) || ''; } catch (e) { return ''; } })();
  function restyleCards() {
    let raw = ''; try { raw = localStorage.getItem(CA.CARD_STYLE_KEY) || ''; } catch (e) { return; } if (raw === styleRaw) return; styleRaw = raw;
    let st = null; try { st = raw ? JSON.parse(raw) : null; } catch (e) { return; }
    art.setStyle(st || CA.DEFAULT_CARD_STYLE); art.dispose();
    for (const [k, tex] of texCache) { const r = parseInt(k, 10), s2 = k.slice(-1); paintCard(tex.image, r, s2); tex.needsUpdate = true; }
    art.paintBack(backTex.image); backTex.needsUpdate = true;
  }
  addEventListener('storage', e => { if (e.key === CA.CARD_STYLE_KEY) restyleCards(); });
  const restyleTimer = setInterval(restyleCards, 1500);

  // ---------- table ----------
  const FELT_Y = 0.86, CARD = { w: 0.38, h: 0.532 }, cardGeoS = new THREE.PlaneGeometry(CARD.w, CARD.h);
  const table = new THREE.Group(); scene.add(table);
  const feltTex = canvasTex(1024, 1024, (g, w) => { const c = w / 2, r = g.createRadialGradient(c, c, 30, c, c, c); r.addColorStop(0, '#1a8064'); r.addColorStop(0.7, '#0f5e48'); r.addColorStop(1, '#083a2d'); g.fillStyle = r; g.fillRect(0, 0, w, w);
    // fibre: thousands of tiny strokes, the nap of real baize
    for (let i = 0; i < 9000; i++) { const x = Math.random() * w, y = Math.random() * w, a = Math.random() * 6.28, l = 2 + Math.random() * 4; g.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    g.strokeStyle = 'rgba(230,180,90,0.8)'; g.lineWidth = 6; g.beginPath(); g.arc(c, c, w * 0.462, 0, 7); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(c, c, w * 0.446, 0, 7); g.stroke();
  });
  const feltMat = new THREE.MeshToonMaterial({ map: feltTex, gradientMap: grad }), railMat = toon('#2a0d14'), railTop = toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.3 }), apronMat = toon('#4a1a2c'), walnut = toon('#3b2314'), stitch = toon('#c99a3a');
  railMat.color.set('#3a1018');
  const ellipseShape = (rx, rz, hole) => { const s = new THREE.Shape(); s.absellipse(0, 0, rx, rz, 0, Math.PI * 2, false, 0); if (hole) { const h = new THREE.Path(); h.absellipse(0, 0, hole[0], hole[1], 0, Math.PI * 2, true, 0); s.holes.push(h); } return s; };
  const turnTex = canvasTex(512, 256, g => { g.strokeStyle = '#ffd23a'; for (let i = 0; i < 6; i++) { g.globalAlpha = 0.16 + i * 0.12; g.lineWidth = 14 - i * 2; rrect(g, 14, 14, 484, 228, 28); g.stroke(); } });
  const turnRing = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: turnTex, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); turnRing.rotation.x = -Math.PI / 2; turnRing.position.y = FELT_Y + 0.005; turnRing.visible = false; scene.add(turnRing);
  const lamp = new THREE.Group(); scene.add(lamp); M(new THREE.CylinderGeometry(0.5, 1.1, 0.5, 24, 1, true), toon('#0f3d30', { side: THREE.DoubleSide }), 0, 5.2, 0, lamp, 0.02); M(new THREE.CylinderGeometry(0.02, 0.02, 2.6, 6), railTop, 0, 6.7, 0, lamp, 0); glow(0, 4.9, 0, 3.4, 0xffe2a8, 0.6);
  let LAY = null;
  // two layouts: wide (landscape / desktop) and deep (portrait phone: the long side of the table points away from you)
  const LAYOUTS = {
    land: { rx: 2.75, rz: 1.8, me: { row: [0, 1.12], sp: 0.4, sc: 1.32 }, dealer: [0, -2.45], sp: 0.25, osc: 1, pot: [0, 0.06],
      seats: { 1: { pos: [-3.25, 0.25], row: [-1.72, 0.05] }, 2: { pos: [-1.75, -2.1], row: [-0.98, -0.96] }, 3: { pos: [1.75, -2.1], row: [0.98, -0.96] }, 4: { pos: [3.25, 0.25], row: [1.72, 0.05] } } },
    port: { rx: 2.0, rz: 2.85, me: { row: [0, 2.02], sp: 0.4, sc: 1.4 }, dealer: [0, -3.5], sp: 0.27, osc: 1.2, pot: [0, -0.24],
      seats: { 1: { pos: [-2.55, 0.8], row: [-0.96, 0.8] }, 2: { pos: [-2.55, -1.35], row: [-0.96, -1.3] }, 3: { pos: [2.55, -1.35], row: [0.96, -1.3] }, 4: { pos: [2.55, 0.8], row: [0.96, 0.8] } } } };
  // HEADS-UP (you + one fox): the fox sits across from you and both rows of cards fill the felt, edge to edge with a margin.
  LAYOUTS.land1 = { heads: true, rx: 2.75, rz: 1.8, me: { row: [0, 0.78], sp: 0.72, sc: 1.8 }, sp: 0.72, osc: 1.8, dealer: [0.75, -2.4], pot: [-0.95, 0.03], bets: { 0: [0.95, 0.15], 2: [0.95, -0.1] },
    seats: { 2: { pos: [-1.25, -2.55], row: [0, -0.74] } } };
  LAYOUTS.port1 = { heads: true, rx: 2.0, rz: 2.85, me: { row: [0, 0.95], sp: 0.645, sc: 1.6 }, sp: 0.645, osc: 1.6, dealer: [0.6, -3.35], pot: [-0.6, 0.07], bets: { 0: [0.6, 0.27], 2: [0.6, -0.12] },
    seats: { 2: { pos: [-1.3, -3.6], row: [0, -0.82] } } };
  // HOLD'EM: two hole cards per seat, the five-card board across the middle of the felt
  const HL = (base, o) => ({ ...base, ...o, holdem: true });
  LAYOUTS.landH = HL(LAYOUTS.land, { me: { row: [0, 1.12], sp: 0.52, sc: 1.32 }, sp: 0.3, osc: 1.0, board: { row: [0, 0.0], sp: 0.42, sc: 0.98 }, pot: [0, 0.58] });
  LAYOUTS.portH = HL(LAYOUTS.port, { me: { row: [0, 2.02], sp: 0.52, sc: 1.4 }, sp: 0.34, osc: 1.2, board: { row: [0, -0.25], sp: 0.45, sc: 1.0 }, pot: [0, 0.32] });
  LAYOUTS.land1H = HL(LAYOUTS.land1, { me: { row: [0, 0.98], sp: 0.78, sc: 1.6 }, sp: 0.62, osc: 1.35, board: { row: [0, -0.02], sp: 0.56, sc: 1.18 }, pot: [-1.85, 0.02], bets: { 0: [1.75, 0.5], 2: [1.75, -0.55] },
    seats: { 2: { pos: [-1.25, -2.55], row: [0, -0.95] } } });
  LAYOUTS.port1H = HL(LAYOUTS.port1, { me: { row: [0, 1.25], sp: 0.72, sc: 1.7 }, sp: 0.6, osc: 1.45, board: { row: [0, -0.02], sp: 0.6, sc: 1.28 }, pot: [-1.0, 0.56], bets: { 0: [1.0, 0.56], 2: [0.95, -0.56] },
    seats: { 2: { pos: [-1.3, -3.6], row: [0, -1.15] } } });
  const SLOT_SETS = { 0: [], 1: [2], 2: [1, 4], 3: [1, 2, 4], 4: [1, 2, 3, 4] };
  const tableParts = [];
  const crestTex8 = canvasTex(512, 512, (g, w) => { const c = w / 2;
    // deep green disc, a shade darker than the baize, so the crest reads as printed into the felt
    const dg = g.createRadialGradient(c - 50, c - 70, 20, c, c, 250); dg.addColorStop(0, '#0f5a45'); dg.addColorStop(1, '#073a2c'); g.fillStyle = dg; g.beginPath(); g.arc(c, c, 252, 0, 7); g.fill();
    // gold double ring with a beaded track between
    const ring = (r, lw, col) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(c, c, r, 0, 7); g.stroke(); };
    ring(244, 8, '#e6b45a'); ring(232, 2, 'rgba(255,217,138,0.8)'); ring(180, 2.5, '#e6b45a'); ring(172, 1.2, 'rgba(255,217,138,0.6)');
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; if (Math.abs(Math.sin(a)) < 0.2) continue; g.fillStyle = i % 2 ? 'rgba(230,180,90,0.55)' : 'rgba(255,217,138,0.85)'; g.beginPath(); g.arc(c + Math.cos(a) * 226, c + Math.sin(a) * 226, i % 2 ? 2 : 3, 0, 7); g.fill(); }
    const arc = (txt, rad, a0, flip) => { g.font = `900 30px ${FONT}`; g.fillStyle = '#ffd98a'; g.textAlign = 'center'; g.textBaseline = 'middle'; const step = (flip ? -1 : 1) * 0.118; let a = a0 - (txt.length - 1) * step / 2; for (const ch of txt) { g.save(); g.translate(c + Math.cos(a) * rad, c + Math.sin(a) * rad); g.rotate(a + (flip ? -Math.PI / 2 : Math.PI / 2)); g.fillText(ch, 0, 0); g.restore(); a += step; } };
    arc('MERU CASINO', 205, -Math.PI / 2, false); arc('8 GATES', 205, Math.PI / 2, true);
    for (const a of [Math.PI, 0]) { g.fillStyle = '#e6b45a'; g.save(); g.translate(c + Math.cos(a) * 205, c + Math.sin(a) * 205); g.rotate(Math.PI / 4); g.fillRect(-8, -8, 16, 16); g.fillStyle = '#073a2c'; g.fillRect(-3, -3, 6, 6); g.restore(); }
    // laurel sprigs either side of the 8
    for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) { const a = Math.PI / 2 + sx * (0.45 + k * 0.22), x = c + Math.cos(a) * 140, y = c + Math.sin(a) * 140 - 20; g.save(); g.translate(x, y); g.rotate(a + sx * 0.9); g.fillStyle = k % 2 ? 'rgba(230,180,90,0.75)' : 'rgba(255,217,138,0.75)'; g.beginPath(); g.ellipse(0, 0, 13, 5.5, 0, 0, 7); g.fill(); g.restore(); }
    // the 8: gold edge, white body, a soft gold glow, holes in the disc green
    g.lineCap = 'round'; g.lineJoin = 'round'; const eight = () => { g.beginPath(); g.ellipse(c, c - 50, 48, 44, 0, 0, 7); g.moveTo(c + 60, c + 62); g.ellipse(c, c + 62, 60, 54, 0, 0, 7); };
    g.shadowColor = 'rgba(255,210,58,0.55)'; g.shadowBlur = 22; g.strokeStyle = '#b8862f'; g.lineWidth = 44; eight(); g.stroke(); g.shadowBlur = 0;
    g.strokeStyle = '#ffd98a'; g.lineWidth = 38; eight(); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 28; eight(); g.stroke();
    g.fillStyle = '#0a4636'; g.beginPath(); g.ellipse(c, c - 50, 31, 27, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(c, c + 62, 40, 34, 0, 0, 7); g.fill();
    const gl = g.createLinearGradient(0, 0, w, w); gl.addColorStop(0, 'rgba(255,255,255,0.1)'); gl.addColorStop(0.5, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.beginPath(); g.arc(c, c, 250, 0, 7); g.fill(); });
  crestTex8.anisotropy = 8;
  const crestMat8 = new THREE.MeshBasicMaterial({ map: crestTex8, transparent: true, opacity: 0.96, depthWrite: false });
  const poolTex = canvasTex(256, 256, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(255,236,190,0.55)'); r.addColorStop(0.55, 'rgba(255,220,160,0.18)'); r.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const poolMat = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 });
  let layKey = '', slotMarks = [];
  const markTex = canvasTex(200 * 2, 280 * 2, g => { g.scale(2, 2); g.strokeStyle = 'rgba(230,180,90,0.55)'; g.lineWidth = 3; g.setLineDash([10, 7]); rrect(g, 6, 6, 188, 268, 14); g.stroke(); });
  function buildTable(key) {
    const kind = key.replace(/[1H]/g, ''); LAY = LAYOUTS[key]; LAY.kind = kind; layKey = key; tableParts.forEach(m => { table.remove(m); m.geometry.dispose(); }); tableParts.length = 0;
    const { rx, rz } = LAY, add = (geo, mat, y) => { const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = !touch; m.castShadow = !touch; table.add(m); tableParts.push(m); return m; };
    const fg = new THREE.ShapeGeometry(ellipseShape(rx, rz), 64), uv = fg.attributes.uv, p = fg.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / rx * 0.5 + 0.5, p.getY(i) / rz * 0.5 + 0.5);
    add(fg, feltMat, FELT_Y);
    { const pool = new THREE.Mesh(new THREE.PlaneGeometry(rx * 1.7, rz * 1.7), poolMat); pool.rotation.x = -Math.PI / 2; pool.position.y = FELT_Y + 0.001; table.add(pool); tableParts.push(pool);
      const hd = LAYOUTS[key].heads, R8 = hd ? (kind === 'port' ? 0.4 : 0.28) : (kind === 'port' ? 0.5 : 0.55), cr = new THREE.Mesh(new THREE.CircleGeometry(R8, 64), crestMat8); cr.rotation.x = -Math.PI / 2; cr.position.set(0, FELT_Y + 0.002, hd ? (kind === 'port' ? 0.06 : 0.02) : 0); cr.renderOrder = 1; table.add(cr); tableParts.push(cr); }
    add(new THREE.ExtrudeGeometry(ellipseShape(rx + 0.32, rz + 0.32, [rx - 0.02, rz - 0.02]), { depth: 0.1, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2, curveSegments: 48 }), railMat, FELT_Y - 0.06).position.y = FELT_Y - 0.04;
    add(new THREE.ExtrudeGeometry(ellipseShape(rx + 0.36, rz + 0.36, [rx + 0.3, rz + 0.3]), { depth: 0.02, bevelEnabled: false, curveSegments: 48 }), railTop, FELT_Y + 0.08);
    add(new THREE.ShapeGeometry(ellipseShape(rx - 0.0, rz - 0.0, [rx - 0.1, rz - 0.1]), 64), walnut, FELT_Y + 0.003);
    add(new THREE.ShapeGeometry(ellipseShape(rx - 0.1, rz - 0.1, [rx - 0.12, rz - 0.12]), 64), railTop, FELT_Y + 0.0035);
    // stitched seam on the padded rail
    add(new THREE.ShapeGeometry(ellipseShape(rx + 0.17, rz + 0.17, [rx + 0.155, rz + 0.155]), 64), stitch, FELT_Y + 0.112);
    const ap = add(new THREE.ExtrudeGeometry(ellipseShape(rx + 0.2, rz + 0.2), { depth: 0.36, bevelEnabled: false, curveSegments: 40 }), apronMat, FELT_Y - 0.4); ap.rotation.x = -Math.PI / 2;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, FELT_Y - 0.4, 20), apronMat); ped.position.y = (FELT_Y - 0.4) / 2; table.add(ped); tableParts.push(ped);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.08, 24), railTop); base.position.y = 0.04; table.add(base); tableParts.push(base);
    // heads-up: dashed gold boxes printed on the felt where each of the ten cards lands
    slotMarks.forEach(m => scene.remove(m)); slotMarks = [];
    const marks = [...(LAY.heads ? [0, 2] : []).flatMap(sl => [...Array(LAY.holdem ? 2 : 5).keys()].map(k => [sl, k])), ...(LAY.holdem ? [0, 1, 2, 3, 4].map(k => ['B', k]) : [])];
    for (const [sl, k] of marks) { const sc = sl === 'B' ? LAY.board.sc : sl === 0 ? LAY.me.sc : LAY.osc, m = new THREE.Mesh(new THREE.PlaneGeometry(CARD.w * sc * 1.06, CARD.h * sc * 1.05), new THREE.MeshBasicMaterial({ map: markTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; const t = cardTarget(sl, k); m.position.set(t.x, FELT_Y + 0.0015, t.z); scene.add(m); slotMarks.push(m); }
  }
  function relayout(force) { const key = lastKind + (G.mode === 'play' && SLOT_USED.length === 1 ? '1' : '') + (G.mode === 'play' && G.game === 'holdem' ? 'H' : ''); if (key === layKey && !force) return false; buildTable(key); placeSeats(); for (const o of Object.values(cardObjs)) if (!o.sweep) o.t = Math.max(o.t, 0.999); return true; }

  // ---------- dealer + seated foxes ----------
  const kane = makeFox({ base: 'm', outfit: 'vest', torso: ['#1f1f1f', '#151515', '#0b0b0b'], fur: ['#d9733a', '#9a4a22', '#fff1e0'] }, { bow: false });
  { // the classic green dealer's visor: a snug fabric band round the brow + a crescent brim that dips toward the front
    const head = kane.userData.P.head, vis = new THREE.Group(); head.add(vis);
    const BY = 0.33, R0 = 0.27, SX = 1.08;     // band height on the skull, band radius, slight oval to follow the head
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R0, R0 * 1.03, 0.075, 48, 1, true), new THREE.MeshToonMaterial({ color: '#146c37', gradientMap: grad, side: THREE.DoubleSide }));
    band.position.y = BY; band.scale.set(SX, 1, 1); band.rotation.x = 0.06; vis.add(band);
    const trim = new THREE.Mesh(new THREE.TorusGeometry(R0 * 1.03, 0.008, 6, 48), toon('#0b4a26')); trim.rotation.x = Math.PI / 2 + 0.06; trim.position.y = BY - 0.036; trim.scale.set(SX, 1, 1); vis.add(trim);
    // brim: built vertex by vertex so its inner edge hugs the band and it widens + drops toward the front
    const A = 1.3, NA = 36, NR = 5, W = 0.24, pos = [], idx = [], edge = [];
    for (let ia = 0; ia <= NA; ia++) { const a = -A + (2 * A * ia) / NA, ca = Math.cos(a), w = W * (0.25 + 0.75 * Math.pow(ca, 1.4));
      for (let ir = 0; ir <= NR; ir++) { const f = ir / NR, r = R0 * 1.03 + w * f, drop = w * f * (0.08 + 0.14 * ca);
        pos.push(Math.sin(a) * r * SX, BY - 0.036 - drop, Math.cos(a) * r); if (ir === NR) edge.push(new THREE.Vector3(Math.sin(a) * r * SX, BY - 0.036 - drop, Math.cos(a) * r)); } }
    for (let ia = 0; ia < NA; ia++) for (let ir = 0; ir < NR; ir++) { const k = ia * (NR + 1) + ir, k2 = k + NR + 1; idx.push(k, k2, k + 1, k + 1, k2, k2 + 1); }
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); bg.setIndex(idx); bg.computeVertexNormals();
    const brim = new THREE.Mesh(bg, new THREE.MeshToonMaterial({ color: '#34c766', gradientMap: grad, transparent: true, opacity: 0.82, side: THREE.DoubleSide, depthWrite: true, emissive: new THREE.Color('#0f6b2f'), emissiveIntensity: 0.4 }));
    brim.renderOrder = 3; vis.add(brim);
    const lip = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge), 48, 0.009, 5, false), toon('#0f5a2b')); vis.add(lip);
  }
  kane.userData.wagMul = 0.6;
  const chairs = {};
  function chairAt(slot) { if (!chairs[slot]) { const g = new THREE.Group(); M(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 18), toon('#9b1c2c'), 0, 0.62, 0, g, 0.02, 0.42); M(new THREE.CylinderGeometry(0.06, 0.08, 0.55, 8), railTop, 0, 0.3, 0, g, 0); M(new THREE.BoxGeometry(0.8, 0.9, 0.12), toon('#7a1626'), 0, 1.1, -0.42, g, 0.02); M(new THREE.BoxGeometry(0.86, 0.06, 0.16), railTop, 0, 1.57, -0.42, g, 0); scene.add(g); chairs[slot] = g; } return chairs[slot]; }
  const seatFox = {};   // slot → { fox, key }
  function placeSeats() { placeDeck();
    kane.position.set(LAY.dealer[0], 0, LAY.dealer[1]); kane.rotation.y = LAY.dealer[0] ? Math.atan2(-LAY.dealer[0], -LAY.dealer[1]) * 0.6 : 0;
    for (let s = 1; s <= 4; s++) { const d = LAY.seats[s], ch = chairAt(s); ch.visible = !!d; if (!d) continue; ch.position.set(d.pos[0] * 1.08, 0, d.pos[1] * 1.08 - (LAY.kind === 'land' && s >= 2 && s <= 3 ? 0.1 : 0)); ch.rotation.y = Math.atan2(-d.pos[0], -d.pos[1]); }
    for (const [s, o] of Object.entries(seatFox)) { const d = LAY.seats[s]; if (!d) { o.fox.visible = false; continue; } o.fox.visible = true; o.fox.position.set(d.pos[0], -0.34, d.pos[1]); o.fox.rotation.y = Math.atan2(-d.pos[0], -d.pos[1]); }
  }
  function setSeatFox(slot, key, d) {
    const cur = seatFox[slot]; if (cur && cur.key === key) return cur.fox;
    if (cur) { scene.remove(cur.fox); }
    if (!d) { delete seatFox[slot]; chairAt(slot).visible = !!(LAY && LAY.seats[slot]); return null; }
    const f = makeFox(d); seatFox[slot] = { fox: f, key }; const p = LAY.seats[slot]; f.position.set(p.pos[0], -0.34, p.pos[1]); f.rotation.y = Math.atan2(-p.pos[0], -p.pos[1]); return f;
  }
  const seatPose = f => { const P = f.userData.P; if (!P) return; P.legs.forEach(l => { l.rotation.x = -1.45; }); P.arms.forEach((a, i) => { a.rotation.x = Math.min(a.rotation.x, -0.95); }); };

  // ---------- chips ----------
  // Casino chips: glossy clay with edge inserts, an inlaid top with the value, stacked by colour like a real dealer would.
  const CHIP_SPEC = { '#1a1626': { v: 100, mark: '#e6b45a', inlay: '#2a2440', ink: '#e6b45a' }, '#16a34a': { v: 25, mark: '#ffffff', inlay: '#e8f5ec', ink: '#15803d' },
    '#c42d3c': { v: 5, mark: '#ffffff', inlay: '#fbe9ea', ink: '#c42d3c' }, '#f3f2f2': { v: 1, mark: '#1d4ed8', inlay: '#ffffff', ink: '#1d4ed8' } };
  const chipGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.026, 32), CHIP_COLS = [[100, '#1a1626'], [25, '#16a34a'], [5, '#c42d3c'], [1, '#f3f2f2']];
  const chipEdge = toon('#ffffff');
  function makeStack() { const g = new THREE.Group(); g.userData = { amt: -1, pool: [] }; scene.add(g); return g; }
  const chipMatCache = {};
  function chipMats(col) {
    if (chipMatCache[col]) return chipMatCache[col]; const sp = CHIP_SPEC[col] || { v: '', mark: '#ffffff', inlay: '#ffffff', ink: '#000000' };
    const side = canvasTex(512, 32, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) { const x = i * w / 6 + 16; g.fillStyle = sp.mark; g.fillRect(x, 3, 52, h - 6); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x + 8, 3, 2, h - 6); g.fillRect(x + 42, 3, 2, h - 6); }
      const sh = g.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(255,255,255,0.35)'); sh.addColorStop(0.18, 'rgba(255,255,255,0)'); sh.addColorStop(0.82, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = sh; g.fillRect(0, 0, w, h); });
    const top = canvasTex(256, 256, g => { const c = 128; g.fillStyle = col; g.beginPath(); g.arc(c, c, 128, 0, 7); g.fill();
      g.fillStyle = sp.mark; for (let i = 0; i < 6; i++) { g.save(); g.translate(c, c); g.rotate(i * Math.PI / 3); g.beginPath(); g.moveTo(-18, -128); g.lineTo(18, -128); g.lineTo(13, -100); g.lineTo(-13, -100); g.closePath(); g.fill(); g.restore(); }
      for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; g.fillStyle = i % 2 ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)'; g.beginPath(); g.arc(c + Math.cos(a) * 90, c + Math.sin(a) * 90, 2.2, 0, 7); g.fill(); }
      g.strokeStyle = sp.mark; g.lineWidth = 5; g.beginPath(); g.arc(c, c, 80, 0, 7); g.stroke();
      const ig = g.createRadialGradient(c - 20, c - 25, 6, c, c, 76); ig.addColorStop(0, '#ffffff'); ig.addColorStop(1, sp.inlay); g.fillStyle = ig; g.beginPath(); g.arc(c, c, 74, 0, 7); g.fill();
      g.fillStyle = sp.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${String(sp.v).length > 2 ? 54 : 70}px ${FONT}`; g.fillText(String(sp.v), c, c - 6);
      g.font = `900 17px ${FONT}`; g.fillText('MERU', c, c + 40);
      const gl = g.createLinearGradient(0, 0, 256, 256); gl.addColorStop(0, 'rgba(255,255,255,0.22)'); gl.addColorStop(0.5, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.beginPath(); g.arc(c, c, 128, 0, 7); g.fill(); });
    top.anisotropy = 8;
    const mk = map => new THREE.MeshStandardMaterial({ map, roughness: 0.38, metalness: 0.04 });
    const m = [mk(side), mk(top), mk(top)]; chipMatCache[col] = m; return m;
  }
  // columns of one colour each, arranged in a tidy cluster; a little hand-stacked wobble
  const CLUSTER = [[0, 0], [0.19, 0], [0.095, 0.165], [-0.095, 0.165], [-0.19, 0], [-0.095, -0.165], [0.095, -0.165], [0.285, 0.165], [-0.285, 0.165]];
  function setStack(g, amt) {
    if (g.userData.amt === amt) return; g.userData.amt = amt; const cols = []; let a = amt;
    for (const [v, c] of CHIP_COLS) { let n = 0; while (a >= v && n < 40) { n++; a -= v; } let left = n; while (left > 0 && cols.length < CLUSTER.length) { const k = Math.min(10, left); cols.push([c, k]); left -= k; } }
    const total = cols.reduce((t, x) => t + x[1], 0), pool = g.userData.pool; while (pool.length < total) { const m = new THREE.Mesh(chipGeo, chipEdge); m.castShadow = !touch; g.add(m); pool.push(m); }
    let i = 0; cols.forEach(([c, k], ci) => { const [cx, cz] = CLUSTER[ci]; for (let h = 0; h < k; h++, i++) { const m = pool[i], j = (i * 7919) % 97 / 97; m.visible = true; m.material = chipMats(c); m.rotation.set(0, i * 0.9 + j, 0); m.position.set(cx + (j - 0.5) * 0.009, 0.013 + h * 0.0265, cz + ((i * 31) % 13 / 13 - 0.5) * 0.009); } });
    for (; i < pool.length; i++) pool[i].visible = false;
  }
  const sparks = []; for (let i = 0; i < 70; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); sp.visible = false; scene.add(sp); sparks.push({ sp, v: V3(), life: 0 }); }
  let sparkI = 0;
  function burst(at, n = 36, col = 0xffd23a) { for (let i = 0; i < n; i++) { const p = sparks[sparkI = (sparkI + 1) % sparks.length], a = Math.random() * Math.PI * 2, sp = 0.6 + Math.random() * 1.4; p.sp.position.copy(at); p.sp.position.y += 0.05; p.v.set(Math.cos(a) * sp * 0.6, 1.6 + Math.random() * 1.8, Math.sin(a) * sp * 0.6); p.life = 1; p.sp.material.color.setHex(Math.random() < 0.3 ? 0xffffff : col); p.sp.visible = true; } }
  const dButton = (() => { const t = canvasTex(128, 128, g => { g.fillStyle = '#fbf7ee'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.strokeStyle = '#1a1626'; g.lineWidth = 6; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.stroke(); g.fillStyle = '#1a1626'; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('D', 64, 68); });
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 28), [toon('#e7e2d6'), new THREE.MeshBasicMaterial({ map: t }), toon('#e7e2d6')]); m.castShadow = !touch; m.visible = false; m.userData.to = V3(); scene.add(m); return m; })();
  const potStack = makeStack(), betStacks = {}, flyers = [];
  const betStack = slot => betStacks[slot] || (betStacks[slot] = makeStack());
  function flyChips(from, to, amt, delay = 0) { if (amt <= 0) return; const g = makeStack(); setStack(g, Math.min(amt, 60)); g.position.copy(from); flyers.push({ g, from: from.clone(), to: to.clone(), t: -delay, d: 0.45 }); }

  // ---------- cards in 3D ----------
  const cardObjs = {};   // `${hand}:${player}:${k}` → obj
  let dealClock = 0, busyUntil = 0, now = 0;
  const shadowTex = canvasTex(128, 160, g => { for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(0,0,0,0.09)'; rrect(g, 4 + i * 1.6, 4 + i * 1.6, 120 - i * 3.2, 152 - i * 3.2, 12); g.fill(); } });
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.7 });
  function newCardMesh() { const sh = new THREE.Mesh(new THREE.PlaneGeometry(CARD.w * 1.16, CARD.h * 1.12), shadowMat); sh.rotation.x = -Math.PI / 2; scene.add(sh); const g = new THREE.Group(), f = new THREE.Mesh(cardGeoS, backMat), b = new THREE.Mesh(cardGeoS, backMat); f.rotation.x = -Math.PI / 2; f.position.y = 0.0015; b.rotation.set(Math.PI / 2, 0, Math.PI); b.position.y = -0.0015; g.add(f, b); g.userData = { f, b, sh }; scene.add(g); return g; }
  const glowCardTex = canvasTex(128, 160, g => { for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(255,210,58,0.12)'; rrect(g, 2 + i * 1.6, 2 + i * 1.6, 124 - i * 3.2, 156 - i * 3.2, 14); g.fill(); } });
  const glowCardMat = new THREE.MeshBasicMaterial({ map: glowCardTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  // face cards smile, wink or grin now and then; the Shuttle fires its thrusters and floats back down
  function repaint(o, opt) { const tex = texCache.get(o.r + o.s); if (!tex) return; paintCard(tex.image, o.r, o.s, opt); tex.needsUpdate = true; }
  function animCard(o, dt) {
    if (o.animT == null) { o.animT = -1; o.animAt = now + rr(1.2, 4.5); }
    if (o.animT < 0) { if (now < o.animAt) return; o.animT = 0; const A = art.style.anim, pool = [A.wave && 'wave', A.wave && 'wave', A.wink && 'wink', A.grin && 'grin'].filter(Boolean); if (o.r === 14 ? !A.hop : !pool.length) { o.animT = -1; o.animAt = now + 5; return; } o.kind = o.r === 14 ? 'fly' : pick(pool); o.frame = -1; o.painted = 0; }
    o.animT += dt; const dur = o.kind === 'fly' ? 1.9 : o.kind === 'wave' ? 1.5 : o.kind === 'wink' ? 0.7 : 1.1, done = o.animT >= dur;
    if (o.kind === 'fly') { if (done || now - o.painted > 0.033) { o.painted = now; repaint(o, { t: done ? 0 : o.animT / dur }); } }
    else { const f = done ? 0 : o.kind === 'wave' ? (o.animT < dur - 0.2 ? 3 + (Math.floor(o.animT / 0.2) % 2) : 0) : o.animT < dur * 0.8 ? (o.kind === 'wink' ? 1 : 2) : 0; if (f !== o.frame) { o.frame = f; repaint(o, { f }); } }
    if (done) { const ev = Math.max(1, +art.style.anim.every || 5); o.animT = -1; o.animAt = now + rr(ev * 0.6, ev * 1.5); }
  }
  function placeShadow(g, win) { const sh0 = g.userData.sh; sh0.material = win ? glowCardMat : shadowMat; if (win) { sh0.visible = g.visible; sh0.position.set(g.position.x, FELT_Y + 0.004, g.position.z); sh0.scale.setScalar(g.scale.x * 1.18); return; } const sh = g.userData.sh, lift = Math.max(0, g.position.y - FELT_Y); sh.visible = g.visible; sh.position.set(g.position.x + 0.02 + lift * 0.25, FELT_Y + 0.004, g.position.z + 0.03 + lift * 0.35); sh.scale.setScalar(g.scale.x * (1 + lift * 0.6)); }
  const deck = new THREE.Group(); scene.add(deck);
  { const cream = toon('#efe7d6'), top = new THREE.MeshBasicMaterial({ map: backTex }); const b = new THREE.Mesh(new THREE.BoxGeometry(CARD.w * 1.15, 0.07, CARD.h * 1.15), [cream, cream, top, cream, cream, cream]); b.position.y = 0.035; b.castShadow = !touch; deck.add(b); deck.userData.box = b; addOutline(b, 0.012);
    const tray = new THREE.Group(); tray.position.set(0.62, 0, 0); deck.add(tray); M(new THREE.BoxGeometry(0.62, 0.06, 0.3), walnut, 0, 0.03, 0, tray, 0.012);
    ['#1a1626', '#16a34a', '#c42d3c', '#f3f2f2'].forEach((c, i) => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.26, 20), chipMats(c)); r.rotation.x = Math.PI / 2; r.position.set(-0.225 + i * 0.15, 0.07, 0); tray.add(r); }); }
  function placeDeck() { const bx = deck.userData.box;  const d = LAY.dealer, f = Math.sqrt((d[0] / LAY.rx) ** 2 + (d[1] / LAY.rz) ** 2), k = 1.0 / f; deck.position.set(d[0] * k, FELT_Y + 0.1, d[1] * k); deck.rotation.y = Math.atan2(-d[0], -d[1]); if (bx) bx.rotation.y = -deck.rotation.y; }
  const dealerHand = () => V3(deck.position.x, deck.position.y + 0.12, deck.position.z);
  function slotOf(i, V) { const n = V.players.length, me = V.me, k = (i - me + n) % n; if (k === 0) return 0; return SLOT_SETS[n - 1][k - 1]; }
  function rowPos(slot) { if (slot === 0) return LAY.me.row; return LAY.seats[slot].row; }
  function cardTarget(slot, k) { if (slot === 'B') { const b = LAY.board; return V3(b.row[0] + (k - 2) * b.sp, FELT_Y + 0.014 + k * 0.006, b.row[1]); } const r = rowPos(slot), sp = slot === 0 ? LAY.me.sp : LAY.sp; return V3(r[0] + (LAY.holdem ? k - 0.5 : k - 2) * sp, FELT_Y + 0.014 + k * 0.006, r[1] + (slot === 0 && k === 0 ? -0.04 : 0)); }

  // ---------- HAND TRAY: your five cards in their own leather tray, full width at the bottom of the screen ----------
  // Drawn by a flat overlay camera on top of the 3D table. It uses the same card textures, so the winks and the Shuttle hop show here too.
  const hudScene = new THREE.Scene(), hudCam = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10), quad = new THREE.PlaneGeometry(1, 1);
  const trayTex = canvasTex(1024, 300, (g, w, h) => { const r = 26; rrect(g, 4, 4, w - 8, h - 8, r); const lg = g.createLinearGradient(0, 0, 0, h); lg.addColorStop(0, '#3a1018'); lg.addColorStop(1, '#1c070c'); g.fillStyle = lg; g.fill();
    for (let i = 0; i < 2500; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.08)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.strokeStyle = '#e6b45a'; g.lineWidth = 6; rrect(g, 6, 6, w - 12, h - 12, r - 2); g.stroke(); g.strokeStyle = 'rgba(230,180,90,0.5)'; g.lineWidth = 2; g.setLineDash([10, 8]); rrect(g, 18, 18, w - 36, h - 36, r - 10); g.stroke(); });
  const trayBg = new THREE.Mesh(quad, new THREE.MeshBasicMaterial({ map: trayTex, transparent: true, depthWrite: false })); trayBg.renderOrder = 0; hudScene.add(trayBg);
  const trayGlowTex = canvasTex(512, 160, g => { g.strokeStyle = '#ffd23a'; for (let i = 0; i < 7; i++) { g.globalAlpha = 0.1 + i * 0.12; g.lineWidth = 16 - i * 2; rrect(g, 10, 10, 492, 140, 26); g.stroke(); } });
  const trayGlow = new THREE.Mesh(quad, new THREE.MeshBasicMaterial({ map: trayGlowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); trayGlow.renderOrder = 1; hudScene.add(trayGlow);
  const holeTag = new THREE.Mesh(quad, new THREE.MeshBasicMaterial({ map: canvasTex(256, 64, (g, w, h) => { rrect(g, 2, 2, w - 4, h - 4, 14); g.fillStyle = '#000000'; g.fill(); g.strokeStyle = '#ffd23a'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#ffd23a'; g.font = `900 30px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HOLE \u00b7 ONLY YOU', w / 2, h / 2 + 2); }), transparent: true, depthWrite: false })); holeTag.renderOrder = 30; hudScene.add(holeTag);
  const trayCards = {};   // card key → { m, glow }
  let trayOn = pref('tray', '1') !== '0', TRAY = null;
  function trayRect(forFit) {
    if (!trayOn || !G || G.mode !== 'play' || !LAY) return null; const W = CW(), H = CH(), land = W > H * 1.15, avail = W - (land ? SAFE.right : 0) - 16, pad = Math.max(8, Math.round(W * 0.018)), hold = LAY.holdem, n = hold ? 2 : 5, step = hold ? 1.08 : 0.93;
    let cw = (avail - 2 * pad) / (1 + (n - 1) * step), ch = cw * 1.4; const cap = land ? H * (hold ? 0.27 : 0.3) : H * (hold ? 0.2 : 0.17); if (ch > cap) { ch = cap; cw = ch / 1.4; }
    const cardsW = cw * (1 + (n - 1) * step), w = hold ? avail : cardsW + 2 * pad, h = ch + 2 * pad, x = 8 + (avail - w) / 2, y = (land ? 10 : SAFE.bottom + 6);
    return { x, y, w, h, cw, ch, pad, step: cw * step, x0: x + (w - cardsW) / 2 };
  }
  function updateTray(dt) {
    TRAY = trayRect(); const on = !!TRAY && !!G.V; trayBg.visible = on; holeTag.visible = false; trayGlow.visible = false;
    for (const t of Object.values(trayCards)) t.seen = false;
    if (on) { const W = CW(), H = CH(); if (hudCam.right !== W || hudCam.top !== H) { hudCam.right = W; hudCam.top = H; hudCam.updateProjectionMatrix(); }
      const T = TRAY; trayBg.position.set(T.x + T.w / 2, T.y + T.h / 2, -5); trayBg.scale.set(T.w, T.h, 1);
      const V = G.V, myTurn = V && V.phase === 'bet' && V.toAct === V.me;
      if (myTurn) { trayGlow.visible = true; trayGlow.position.copy(trayBg.position); trayGlow.position.z = -4; trayGlow.scale.set(T.w + 16, T.h + 16, 1); trayGlow.material.opacity = 0.65 + Math.sin(now * 5) * 0.3; }
      for (const [key, o] of Object.entries(cardObjs)) { if (!o.mine) continue; let t = trayCards[key];
        if (!t) { t = trayCards[key] = { m: new THREE.Mesh(quad, o.g.userData.f.material), glow: new THREE.Mesh(quad, glowCardMat) }; hudScene.add(t.glow, t.m); }
        t.seen = true; const m = t.m, rx = T.x0 + T.cw / 2 + o.k * T.step, ry = T.y + T.pad + T.ch / 2;
        m.material = o.r ? o.g.userData.f.material : backMat; m.renderOrder = 10 + o.k; t.glow.renderOrder = 5;
        if (o.sweep) { const e = ease(Math.min(1, o.t)); m.visible = true; m.position.set(rx, ry - e * T.ch * 1.2, o.k * 0.2); m.scale.set(T.cw * (1 - e * 0.3), T.ch * (1 - e * 0.3), 1); m.rotation.z = e * 0.4; t.glow.visible = false; continue; }
        if (o.delay > 0) { m.visible = false; t.glow.visible = false; continue; }
        const e = ease(Math.min(1, o.t)); m.visible = true; m.position.set(rx, ry + (1 - e) * T.ch * 0.9, o.k * 0.2); m.rotation.z = (1 - e) * -0.35; m.scale.set(T.cw * (0.7 + 0.3 * e), T.ch * (0.7 + 0.3 * e), 1);
        t.glow.visible = !!o.win; if (o.win) { t.glow.position.set(rx, ry, -2); t.glow.scale.set(T.cw * 1.22, T.ch * 1.16, 1); }
        if (false) { holeTag.visible = true; holeTag.position.set(rx, ry + T.ch / 2 + 2, 3); const tw = Math.min(T.cw * 0.95, 96); holeTag.scale.set(tw, tw / 4, 1); } }
    }
    for (const [key, t] of Object.entries(trayCards)) { if (!t.seen || !on) { t.m.visible = false; t.glow.visible = false; } if (!t.seen) { hudScene.remove(t.m, t.glow); delete trayCards[key]; } }
  }

  // ---------- camera ----------
  const fitCam = new THREE.PerspectiveCamera(45, 1, 0.05, 80), _p = V3();
  let SAFE = { top: 0, bottom: 0, left: 0, right: 0 }; const SAFE0 = () => SAFE;
  function fitShot(pts, el, margin = 0.04, SAFE = SAFE0()) {
    const W = CW(), H = CH(); fitCam.aspect = W / H; fitCam.fov = camera.fov; fitCam.updateProjectionMatrix();
    const yT = 1 - 2 * SAFE.top / H - margin, yB = -1 + 2 * SAFE.bottom / H + margin, xL = -1 + 2 * SAFE.left / W + margin, xR = 1 - 2 * SAFE.right / W - margin, sx = (xL + xR) / 2, sy = (yT + yB) / 2;
    const dir = V3(0, Math.sin(el), Math.cos(el)), tgt = V3(); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / pts.length);
    const bounds = d => { fitCam.position.copy(tgt).addScaledVector(dir, d); fitCam.lookAt(tgt); fitCam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitCam); if (_p.z > 1 || _p.z < -1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
    const fits = d => { const b = bounds(d); return b && b.x0 >= xL && b.x1 <= xR && b.y0 >= yB && b.y1 <= yT; };
    let d = 6; for (let it = 0; it < 4; it++) { let lo = 1, hi = 40; for (let k = 0; k < 20; k++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m; } d = hi; const b = bounds(d); if (!b) break;
      const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, th = Math.tan(fitCam.fov * Math.PI / 360) * d, right = V3().setFromMatrixColumn(fitCam.matrixWorld, 0), up = V3().setFromMatrixColumn(fitCam.matrixWorld, 1);
      tgt.addScaledVector(right, (cx - sx) * th * fitCam.aspect).addScaledVector(up, (cy - sy) * th); }
    return { pos: tgt.clone().addScaledVector(dir, d), look: tgt };
  }
  function seatShot() {
    const pts = [], push = (x, y, z) => pts.push(V3(x, y, z)), o = SLOT_USED.length ? SLOT_USED : [1, 2, 3, 4];
    const tr = trayRect(true), me = LAY.me.row, mw = 2 * LAY.me.sp + CARD.w * LAY.me.sc / 2 + 0.05;
    if (!tr) { push(me[0] - mw, FELT_Y, me[1] + CARD.h * 0.75); push(me[0] + mw, FELT_Y, me[1] + CARD.h * 0.75); } else push(0, FELT_Y, LAY.pot[1] + 0.35);
    for (const s of o) { const r = LAY.seats[s].row, w = 2 * LAY.sp + CARD.w * LAY.osc / 2 + 0.05; push(r[0] - w, FELT_Y, r[1] - CARD.h * LAY.osc / 2); push(r[0] + w, FELT_Y, r[1] + CARD.h * LAY.osc / 2); const p = LAY.seats[s].pos; push(p[0] * (LAY.kind === 'port' ? 0.78 : 0.95), FELT_Y + 0.9, p[1]); }
    if (LAY.board) { const b = LAY.board, w = 2 * b.sp + CARD.w * b.sc / 2 + 0.05; push(b.row[0] - w, FELT_Y, b.row[1] - CARD.h * b.sc / 2); push(b.row[0] + w, FELT_Y, b.row[1] + CARD.h * b.sc / 2); }
    if (!(tr && LAY.kind === 'land')) push(LAY.dealer[0], 1.95, LAY.dealer[1]); if (!tr) push(0, FELT_Y, LAY.rz + 0.3);
    if (tr) return fitShot(pts, LAY.heads ? (LAY.kind === 'port' ? 0.95 : 0.72) : LAY.kind === 'port' ? 0.92 : 0.62, 0.03, { ...SAFE, bottom: tr.y + tr.h + 6 });
    return fitShot(pts, LAY.heads ? (LAY.kind === 'port' ? 1.08 : 0.82) : LAY.kind === 'port' ? 0.98 : 0.68, 0.03);
  }
  function introShot() {
    const pts = [V3(-LAY.rx - 1.2, 0.1, 0), V3(LAY.rx + 1.2, 0.1, 0), V3(0, 2.2, LAY.dealer[1] - 0.3), V3(0, 0.2, LAY.rz + 0.6), V3(0, 2.2, 0)];
    const s = fitShot(pts, 0.24, 0.06); return s;
  }
  const cam = { pos: V3(0, 1.8, 12.5), look: V3(0, 1.2, 0), from: null, to: null, t: 1, dur: 1, bob: 0 };
  function camTo(shot, dur = 1.4, walk = false) { cam.from = { pos: cam.pos.clone(), look: cam.look.clone() }; cam.to = shot; cam.t = 0; cam.dur = dur; cam.walk = walk; }
  let SLOT_USED = [];

  // ======================================================================= GAME CONTROL
  const G = {
    game: pref('game', 'stud') === 'holdem' ? 'holdem' : 'stud',
    mode: 'intro', kind: null, T: null, V: null, meIdx: 0, practice: false, chipsBefore: 0, overDone: 0, aiAt: 0, dealAt: 0, nextAt: 0, turnKey: '', turnT0: 0, say: null, sayT: 0,
    seenHand: 0, lastActs: {}, wins: {}, bust: false, net: null, netConn: null, err: '', resultShown: 0 };
  let emitT = 0, labelCache = '';

  function say(who, text) { G.say = { who, text }; G.sayT = now + Math.max(2.6, text.length * 0.07); const f = who === 'KANE' ? kane : null; if (f) f.userData.say = { text, t: 0 }; emitSoon(); }
  const STREET = ['', '', 'SECOND STREET', 'THIRD STREET', 'FOURTH STREET', 'FIFTH STREET'];

  function seatsSolo(n) {
    const order = [...FOXES]; const lk = pref('lastFoxes', ''); // keep a stable table: Lyra always sits, the rest rotate
    const pickd = [order[0], ...order.slice(1).sort(() => Math.random() - 0.5)].slice(0, n);
    return pickd.map((f, i) => ({ id: 'ai' + i, name: f.name, kind: 'ai', pers: f.pers, lk: FOXES.indexOf(f) }));
  }
  function startSolo(nFoxes) {
    const d = saveRead(); G.practice = d.gold < 10; const buy = G.practice ? STUD.buyIn : Math.min(d.gold, STUD.buyIn);
    setPref('foxes', nFoxes);
    G.kind = 'solo'; G.meIdx = 0; G.bust = false;
    G.game = pref('game', 'stud') === 'holdem' ? 'holdem' : 'stud'; const TT = G.game === 'holdem' ? HoldemTable : StudTable;
    G.T = new TT([{ id: 'me', name: 'YOU', kind: 'me', chips: buy, lk: -1 }, ...seatsSolo(nFoxes)]);
    sit(); setTimeout(() => newHand(), 1500);
  }
  function sit() { G.mode = 'play'; G.lastActs = {}; G.resultShown = 0; buildFromSeats(); camTo(seatShot(), 1.6); sfx.ctx(); say('KANE', G.game === 'holdem' ? pick(['Take a seat. Texas Hold\u2019em: blinds one and two, bets two and four.', 'Two cards each, five on the board. Best five wins.', 'Hold\u2019em it is. The button moves every hand.']) : pick(['Take a seat. Ante is one, bets two and four.', 'Welcome to my table. Foxes are the faces, the Shuttle flies high.', 'Sit, sit. One down, four up. Good luck.'])); emit(); }
  function buildFromSeats() {
    const V = G.T ? G.T.view(G.meIdx) : G.V; if (!V) return; const n = V.players.length; SLOT_USED = SLOT_SETS[n - 1] || []; relayout();
    for (let s = 1; s <= 4; s++) { const i = V.players.findIndex((p, j) => j !== V.me && slotOf(j, V) === s), p = V.players[i];
      if (!p) { setSeatFox(s, null, null); continue; }
      const d = p.lk >= 0 && p.kind !== 'net' && p.kind !== 'me' ? FOXES[p.lk] : NET_LOOKS[(p.lk >= 0 ? p.lk : i) % NET_LOOKS.length];
      setSeatFox(s, p.name + '|' + (p.kind === 'ai' ? 'a' + p.lk : 'n' + p.lk), d); }
  }
  function newHand() {
    const T = G.T; if (!T) return;
    if (G.kind === 'solo') { for (const p of T.P) if (p.kind === 'ai' && p.chips <= 0) { p.chips = STUD.buyIn; say('KANE', p.name + ' buys back in.'); } }
    else { netSeatNewcomers(); for (const p of T.P) if (p.chips <= 0 && !p.gone) p.chips = STUD.buyIn; T.P.forEach((p, i) => { if (p.gone) p.chips = 0; }); }
    const me = T.P[G.meIdx]; if (G.kind === 'solo' && me.chips <= 0) { G.bust = true; emit(); return; }
    G.chipsBefore = me.chips; G.overDone = 0;
    if (!T.startHand()) { say('KANE', 'Not enough players for a hand.'); emit(); return; }
    say('KANE', G.game === 'holdem' ? (T.handNo === 1 ? 'Blinds in. Two cards each.' : pick(['Blinds in.', 'New hand. The button moves.', 'Shuffle up and deal.'])) : T.handNo === 1 ? 'Ante up. Hole card down, one card up.' : pick(['Ante up.', 'New hand. Ante up.', 'Shuffle up and deal.']));
    sync();
  }
  function sync() {
    const T = G.T; if (T) { G.V = T.view(G.meIdx); drainEvents(); if (G.kind === 'net' && G.netConn) netBroadcast(); }
    if (!G.V) return; applyView(G.V); emit();
  }
  function drainEvents() { const T = G.T; while (T.ev.length) { const e = T.ev.shift(); if (e.k === 'act') { const p = T.P[e.i]; if (e.a === 'fold') sfx.fold(); else if (e.a !== 'check') sfx.chip(); else sfx.tone(520, 0.05, 0.03, 'square');
        if (p.kind === 'ai') { const f = foxOfIdx(e.i); if (f) { f.userData.say = { text: p.last.toLowerCase(), t: 0 }; f.userData.mood = e.a === 'fold' ? 'sad' : e.a === 'raise' ? 'determined' : 'neutral'; } } } } }
  const foxOfIdx = i => { const V = G.V || (G.T && G.T.view(G.meIdx)); if (!V) return null; const s = slotOf(i, V); return s ? (seatFox[s] && seatFox[s].fox) : null; };

  function applyView(V) {
    const n = V.players.length; if (SLOT_SETS[n - 1] !== SLOT_USED) { SLOT_USED = SLOT_SETS[n - 1] || []; buildFromSeats(); if (G.mode === 'play') camTo(seatShot(), 0.8); } else buildFromSeats();
    // new hand → sweep old cards back to the dealer
    for (const [k, o] of Object.entries(cardObjs)) if (o.hand !== V.handNo && !o.sweep) { o.sweep = true; o.from = o.g.position.clone(); o.to = dealerHand(); o.t = 0; o.d = 0.4; o.delay = 0; }
    const dealt = [];
    V.players.forEach((p, i) => { const slot = slotOf(i, V); p.cards.forEach((c, k) => {
      const key = V.handNo + ':' + i + ':' + k; let o = cardObjs[key];
      if (!o) { o = cardObjs[key] = { g: newCardMesh(), hand: V.handNo, i, k, slot, r: 0, s: '', faceUp: false, t: 0, d: 0.38, delay: 0, flip: 0, flipT: 1, dim: false, mine: i === V.me }; dealt.push(o); o.g.position.copy(dealerHand()); o.from = dealerHand(); o.g.rotation.z = Math.PI; }
      o.slot = slot; const up = c.r ? (c.up || i === V.me || (V.result && !V.result.byFold)) : false;
      if (c.r && (o.r !== c.r || o.s !== c.s)) { o.r = c.r; o.s = c.s; if (o.r >= 11) repaint(o, {}); }
      const dim = p.folded && !(V.result && V.result.winners.some(w => w.i === i)); o.win = !!(V.result && !V.result.byFold && V.result.winners.some(w => w.i === i));
      if (o.r) o.g.userData.f.material = faceMat(o.r, o.s, dim); o.g.userData.b.material = dim ? dimBack : backMat;
      if (up !== o.faceUp) { o.faceUp = up; o.flipT = o.t >= 1 ? 0 : 1; }
    }); });
    // hold'em board: flop, turn and river land face up across the middle
    (V.board || []).forEach((c, k) => { const key = V.handNo + ':B:' + k; let o = cardObjs[key];
      if (!o) { o = cardObjs[key] = { g: newCardMesh(), hand: V.handNo, i: 99, k, slot: 'B', r: c.r, s: c.s, faceUp: true, t: 0, d: 0.42, delay: 0, flipT: 1, mine: false }; dealt.push(o); o.g.position.copy(dealerHand()); o.from = dealerHand(); o.g.rotation.z = Math.PI; if (o.r >= 11) repaint(o, {}); }
      o.slot = 'B'; o.g.userData.f.material = faceMat(o.r, o.s, false); o.win = false; });
    // dealer button (hold'em): a white D puck beside whoever has the button
    if (V.game === 'holdem' && V.button >= 0 && V.phase !== 'idle') { const bp = betSpot(slotOf(V.button, V)); dButton.visible = true; dButton.userData.to = V3(bp.x + (bp.x > 0 ? -0.36 : 0.36), FELT_Y + 0.012, bp.z); } else dButton.visible = false;
    // deal order: round by round, starting left of the dealer like a real deal
    dealt.sort((a, b) => a.k - b.k || a.i - b.i);
    for (const o of dealt) { dealClock = Math.max(dealClock, now) + 0.14; o.delay = dealClock - now; o.t = 0; busyUntil = Math.max(busyUntil, dealClock + 0.45); }
    if (dealt.length) { kane.userData.dealT = dealClock + 0.3; }
    // chips: bets in front of each seat, the pot in the middle
    const betSum = V.players.reduce((a, p) => a + p.bet, 0);
    V.players.forEach((p, i) => { const slot = slotOf(i, V), st = betStack(slot), prev = st.userData.amt; const bp = betSpot(slot); st.position.copy(bp);
      if (prev > 0 && p.bet === 0 && V.phase !== 'over') flyChips(bp, potSpot(), prev); const show = V.phase === 'over' && G.resultShown === V.handNo ? 0 : p.bet; setStack(st, show); });
    for (const s of [0, 1, 2, 3, 4]) if (!SLOT_USED.includes(s) && s !== 0 && betStacks[s]) setStack(betStacks[s], 0);
    let potShow = V.pot - betSum; if (V.phase === 'over') potShow = V.pot;
    potStack.position.copy(potSpot()); if (V.phase !== 'over' || !G.resultShown) setStack(potStack, Math.max(0, potShow));
    if (V.phase === 'over' && G.resultShown !== V.handNo) { G.resultShown = V.handNo; const W = V.result.winners; setTimeout(() => { setStack(potStack, 0); W.forEach((w, j) => flyChips(potSpot(), betSpot(slotOf(w.i, V)).add(V3(0, 0, 0.12)), w.amt, j * 0.1)); sfx.chip(); }, 900);
      // flip all bet stacks into the pot first
      V.players.forEach((p, i) => { const st = betStack(slotOf(i, V)); if (st.userData.amt > 0) { flyChips(st.position, potSpot(), st.userData.amt); setStack(st, 0); } }); }
    // fox moods
    V.players.forEach((p, i) => { const f = foxOfIdx(i); if (!f) return; const win = V.result && V.result.winners.some(w => w.i === i); f.userData.mood = win ? 'excited' : p.folded ? 'sad' : V.toAct === i ? 'curious' : (f.userData.mood === 'sad' ? 'neutral' : f.userData.mood); });
  }
  const potSpot = () => V3(LAY.pot[0], FELT_Y + 0.002, LAY.pot[1]);
  function betSpot(slot) { if (LAY.bets && LAY.bets[slot]) return V3(LAY.bets[slot][0], FELT_Y + 0.002, LAY.bets[slot][1]); if (slot === 0) return V3(LAY.me.row[0] + (LAY.kind === 'port' ? 0.0 : 0.0), FELT_Y + 0.002, LAY.me.row[1] - CARD.h * LAY.me.sc / 2 - 0.22); const r = LAY.seats[slot].row; const dz = LAY.kind === 'port' ? 0 : 0; return V3(r[0] * 0.55, FELT_Y + 0.002, r[1] + CARD.h * LAY.osc / 2 + 0.2 + dz); }

  // ---------- the loop: solo / host drive the table; everyone animates ----------
  function tick(dt) {
    const T = G.T; if (!T || G.mode !== 'play') return;
    if (T.phase === 'bet') {
      const i = T.toAct, p = T.P[i], key = T.handNo + ':' + T.street + ':' + i + ':' + T.ev.length + ':' + T.pot;
      if (key !== G.turnKey) { G.turnKey = key; G.turnT0 = now; G.aiAt = 0; if (i === G.meIdx) { sfx.turn(); try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} } emit(); }
      if (now < busyUntil) return;
      if (p.kind === 'ai') { if (!G.aiAt) G.aiAt = now + rr(0.55, 1.15); else if (now >= G.aiAt) { G.aiAt = 0; T.act(i, T.game === 'holdem' ? aiDecideHoldem(T, i) : aiDecide(T, i)); sync(); } }
      else if (G.kind === 'net' && now - G.turnT0 > STUD.turnSecs) { const L = T.legal(i); T.act(i, L && L.check ? 'check' : 'fold'); if (p.kind === 'net') T.P[i].last += ' (TIME)'; sync(); }
    } else if (T.phase === 'deal') {
      if (!G.dealAt) G.dealAt = now + 0.8; else if (now >= G.dealAt && now >= busyUntil) { G.dealAt = 0; T.dealStreet(); if (T.phase === 'bet' || T.phase === 'deal') say('KANE', T.game === 'holdem' ? ['', 'The flop.', 'The turn.', 'The river.'][T.street] : T.street === 5 ? 'Fifth street. Last card.' : STREET[T.street].charAt(0) + STREET[T.street].slice(1).toLowerCase() + '.'); sync(); }
    } else if (T.phase === 'over' && G.overDone !== T.handNo && now >= busyUntil) {
      G.overDone = T.handNo; handOver();
    }
    if (G.kind === 'net' && T.phase === 'over' && G.nextAt && now >= G.nextAt) { G.nextAt = 0; newHand(); }
  }
  function handOver() {
    const T = G.T, R = T.result, me = T.P[G.meIdx], iWon = R.winners.some(w => w.i === G.meIdx), W = R.winners.map(w => T.P[w.i].name === 'YOU' ? 'you' : T.P[w.i].name).join(' and ');
    say('KANE', R.byFold ? 'Everyone folded. Pot to ' + W + '.' : 'Showdown! ' + (R.winners[0].hand) + '. Pot to ' + W + '.');
    if (iWon) sfx.win(); else sfx.lose();
    setTimeout(() => burst(potSpot(), iWon ? 60 : 24, iWon ? 0xffd23a : 0x7dd3fc), 900);
    statsFor(G.meIdx, T);
    if (G.kind === 'solo') { const delta = me.chips - G.chipsBefore; if (!G.practice) saveEdit(d => { d.gold = Math.max(0, d.gold + delta); }); G.chipsBefore = me.chips; if (me.chips <= 0) G.bust = true; }
    if (G.kind === 'net') { G.nextAt = now + 8; netBroadcast(); }
    emit();
  }
  const SK = () => G.game === 'holdem' ? 'meruStud.holdem.' : 'meruStud.';
  function statsFor(i, T) {
    const R = T.result, mine = R.winners.find(w => w.i === i), me = T.P[i], k = SK();
    saveEdit(d => { const S = d.stats; S[k + 'handsPlayed'] = (S[k + 'handsPlayed'] || 0) + (me.out ? 0 : 1);
      if (mine) { S[k + 'handsWon'] = (S[k + 'handsWon'] || 0) + 1; S[k + 'bestPot'] = Math.max(S[k + 'bestPot'] || 0, R.pot); d.flags[k + 'firstWin'] = true;
        if (mine.cat >= 0) S[k + 'bestHand'] = Math.max(S[k + 'bestHand'] ?? -1, mine.cat); if (mine.cat === 8 && mine.hand === 'Royal Launch') d.flags[k + 'royal'] = true; } });
  }
  // a client builds the same "over" moment from the host's view
  function clientOver(V) { if (G.overDone === V.handNo) return; G.overDone = V.handNo; G.nextAt = now + 8; const R = V.result, iWon = R.winners.some(w => w.i === V.me); if (iWon) sfx.win(); else sfx.lose(); setTimeout(() => burst(potSpot(), iWon ? 60 : 24, iWon ? 0xffd23a : 0x7dd3fc), 900);
    const W = R.winners.map(w => w.i === V.me ? 'you' : V.players[w.i].name).join(' and '); say('KANE', R.byFold ? 'Everyone folded. Pot to ' + W + '.' : 'Showdown! ' + R.winners[0].hand + '. Pot to ' + W + '.');
    const k = SK(); saveEdit(d => { const S = d.stats; S[k + 'handsPlayed'] = (S[k + 'handsPlayed'] || 0) + 1; if (iWon) { S[k + 'handsWon'] = (S[k + 'handsWon'] || 0) + 1; S[k + 'bestPot'] = Math.max(S[k + 'bestPot'] || 0, R.pot); } }); }

  // ======================================================================= ONLINE (host runs StudTable; everyone else renders the host's view)
  const NET_GAME = 'stud', MAXP = STUD.maxSeats;
  async function netConnect(code, H) {
    try { const m = await load('engine/duel-net.js'); if (m && m.connectDuel) { const N = await m.connectDuel({ game: NET_GAME, code, ...H }); N.via = 'online'; return N; } } catch (e) {}
    if (!('BroadcastChannel' in window)) throw new Error('no network');
    const id = Math.random().toString(36).slice(2, 10), bc = new BroadcastChannel('meruStud.room.' + code), seen = new Map(), post = o => { try { bc.postMessage(o); } catch (e) {} };
    bc.onmessage = e => { const m = e.data; if (!m || m.from === id || (m.to && m.to !== id)) return;
      if (m.sys === 'hello' || m.sys === 'beat') { const isNew = !seen.has(m.from); seen.set(m.from, Date.now()); if (isNew) { H.onJoin(m.from); if (m.sys === 'hello') post({ sys: 'beat', from: id }); } return; }
      if (m.sys === 'bye') { if (seen.delete(m.from)) H.onLeave(m.from); return; }
      if (!seen.has(m.from)) { seen.set(m.from, Date.now()); H.onJoin(m.from); } else seen.set(m.from, Date.now()); H.onMsg(m.t, m.d, m.from); };
    const hb = setInterval(() => { post({ sys: 'beat', from: id }); const t = Date.now(); for (const [k, v] of seen) if (t - v > 9000) { seen.delete(k); H.onLeave(k); } }, 2000);
    post({ sys: 'hello', from: id }); setTimeout(() => H.onStatus && H.onStatus('connected'), 0);
    return { id, code, via: 'local', send(t, d, to) { post({ from: id, to, t, d }); }, leave() { clearInterval(hb); post({ sys: 'bye', from: id }); try { bc.close(); } catch (e) {} } };
  }
  const netName = () => (pref('name', '') || 'FOX').toUpperCase().slice(0, 10);
  function netMembers() { const n = G.net; if (!n || !G.netConn) return []; const all = [{ id: G.netConn.id, name: n.name, j: n.j, ready: n.ready, me: true }, ...Object.entries(n.peers).map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all; }
  const netHostId = () => { const m = netMembers(); return m.length ? m[0].id : null; };
  const isHost = () => G.netConn && netHostId() === G.netConn.id;
  async function netJoin(code, name) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { G.net = { ...(G.net || {}), st: 'menu', msg: 'Type the 4-letter room code from your friend.' }; emit(); return; }
    netLeave(true); if (name) setPref('name', String(name).toUpperCase().slice(0, 10));
    G.net = { st: 'room', code, status: 'connecting', name: netName(), j: Date.now(), ready: false, fill: false, peers: {}, msg: '', via: '' }; emit();
    let N; try { N = await netConnect(code, { onJoin: id => netHello(id), onLeave: id => netGone(id), onMsg: (t, d, id) => netMsg(t, d, id), onStatus: s => { if (G.net) { G.net.status = s; emit(); } } }); }
    catch (e) { G.net = { ...G.net, status: 'offline', msg: 'Online play could not load here. Some school or work Wi-Fi blocks it.' }; emit(); return; }
    G.netConn = N; G.net.via = N.via; G.net.status = 'connected'; try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {} emit();
  }
  function netCreate(name) { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 4; i++) c += A[rnd(A.length)]; return netJoin(c, name); }
  function netHello(id) { const n = G.net; if (!n || !G.netConn) return; G.netConn.send('hi', { j: n.j, name: n.name, ready: n.ready, fill: n.fill, playing: G.mode === 'play' && G.kind === 'net' }, id); }
  function netGone(id) { const n = G.net; if (!n || !n.peers[id]) return; const wasHost = netHostId() === id; delete n.peers[id];
    if (G.kind === 'net' && G.T) { const i = G.T.P.findIndex(p => p.id === id); if (i >= 0) { G.T.leave(i); sync(); } }
    else if (G.kind === 'net' && wasHost && G.mode === 'play') { stand(); G.net.msg = 'The host left the table. Make a new room to keep playing.'; }
    emit(); }
  function netMsg(t, d, id) {
    const n = G.net; if (!n) return;
    if (t === 'hi') { const known = !!n.peers[id]; n.peers[id] = { name: String(d.name || 'FOX').slice(0, 10), j: +d.j || Date.now(), ready: !!d.ready, playing: !!d.playing }; if (d.fill != null && netHostId() === id) n.fill = !!d.fill; if (!known) netHello(id); emit(); maybeStart(); return; }
    if (t === 'rd') { if (n.peers[id]) { n.peers[id].ready = !!d.on; emit(); maybeStart(); } return; }
    if (t === 'fill') { if (netHostId() === id) { n.fill = !!d.on; emit(); } return; }
    if (t === 'st') { if (G.T) return; G.game = d.game === 'holdem' ? 'holdem' : 'stud'; if (G.mode !== 'play' || G.kind !== 'net') { G.kind = 'net'; G.mode = 'play'; n.st = 'play'; G.V = d; buildFromSeats(); camTo(seatShot(), 1.6); say('KANE', 'Welcome to the table, ' + n.name + '.'); }
      G.V = d; applyView(d); if (d.phase === 'over') clientOver(d); else if (d.phase === 'bet' && d.toAct === d.me && G.turnKey !== d.handNo + ':' + d.street + ':' + d.curBet + ':' + d.pot) { G.turnKey = d.handNo + ':' + d.street + ':' + d.curBet + ':' + d.pot; G.turnT0 = now; sfx.turn(); }
      if (d.say && (!G.say || d.say.text !== G.say.text)) say(d.say.who, d.say.text); emit(); return; }
    if (t === 'act') { const T = G.T; if (!T) return; const i = T.P.findIndex(p => p.id === id); if (i >= 0 && T.toAct === i) { T.act(i, d.a); sync(); } return; }
  }
  function maybeStart() {
    const n = G.net; if (!n || !G.netConn || G.mode === 'play' || !isHost()) return; const m = netMembers().slice(0, MAXP); if (m.length < 2 || !m.every(x => x.ready)) return;
    const seats = m.map((x, i) => ({ id: x.id, name: x.me ? n.name : x.name, kind: x.me ? 'me' : 'net', lk: i, chips: STUD.buyIn }));
    if (n.fill) { const pool = [...FOXES]; while (seats.length < MAXP && pool.length) { const f = pool.shift(); seats.push({ id: 'ai' + seats.length, name: f.name, kind: 'ai', pers: f.pers, lk: FOXES.indexOf(f) }); } }
    G.kind = 'net'; G.meIdx = 0; G.game = pref('game', 'stud') === 'holdem' ? 'holdem' : 'stud'; G.T = new (G.game === 'holdem' ? HoldemTable : StudTable)(seats); n.st = 'play'; n.ready = false; Object.values(n.peers).forEach(p => p.ready = false);
    sit(); setTimeout(() => newHand(), 1600);
  }
  function netSeatNewcomers() { const T = G.T, n = G.net; if (!T || !n) return; for (const x of netMembers()) { if (T.P.length >= MAXP) break; if (!T.P.some(p => p.id === x.id)) T.addSeat({ id: x.id, name: x.name, kind: 'net', lk: T.P.length, chips: STUD.buyIn }); } T.P = T.P.filter((p, i) => !p.gone || i === G.meIdx); }
  function netBroadcast() { const T = G.T, N = G.netConn; if (!T || !N) return; T.P.forEach((p, i) => { if (p.kind === 'net' && !p.gone) { const v = T.view(i); v.say = G.say; v.tl = T.phase === 'bet' && T.toAct === i ? Math.max(0, Math.round(STUD.turnSecs - (now - G.turnT0))) : 0; v.game = G.game; N.send('st', v, p.id); } }); }
  function netLeave(silent) { if (G.netConn) { try { G.netConn.leave(); } catch (e) {} } G.netConn = null; if (!silent) { G.net = null; try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {} } }

  // ======================================================================= STATE FOR THE PAGE
  function emitSoon() { emitT = 0; }
  function seatLabels() {
    const V = G.V; if (!V || G.mode !== 'play') return []; const W = CW(), H = CH(), out = [];
    V.players.forEach((p, i) => { if (i === V.me) return; const s = slotOf(i, V); if (!s) return; const L = LAY.seats[s];
      if (LAY.heads) _p.set(L.row[0] - 2 * LAY.sp, FELT_Y, L.row[1] - CARD.h * LAY.osc / 2 - 0.05).project(camera); else _p.set(L.pos[0], 2.0, L.pos[1]).project(camera); const x = (_p.x * 0.5 + 0.5) * W, y = (-_p.y * 0.5 + 0.5) * H;
      const hold = V.game === 'holdem', up = hold ? [] : p.cards.filter(c => c.up && c.r), showdown = V.result && !V.result.byFold && !p.folded, full = showdown ? (hold ? best5(p.cards.filter(c => c.r).concat(V.board || [])) : evalHand(p.cards.filter(c => c.r))) : null;
      out.push({ k: 'p' + i, name: p.name, chips: p.chips, x: Math.round(x), y: Math.round(y), turn: V.toAct === i, folded: p.folded, out: p.out, last: p.gone ? 'LEFT' : p.last, show: full ? full.name : up.length ? 'SHOWS ' + evalHand(up).name.toUpperCase() : '', win: !!(V.result && V.result.winners.find(w => w.i === i)), amt: (V.result && (V.result.winners.find(w => w.i === i) || {}).amt) || 0, cards: up.map(c => RANK_CH(c.r) + SUIT_CH[c.s]).join(' ') }); });
    return out;
  }
  function emit() {
    const V = G.V, me = V ? V.players[V.me] : null, L = V && V.legal, d = saveRead();
    const hold = !!(V && V.game === 'holdem'), board = hold ? (V.board || []) : [], myCards = me ? me.cards.filter(c => c.r) : [], myHand = myCards.length ? (hold ? best5(myCards.concat(board)) : evalHand(myCards)) : null, R = V && V.result;
    let result = null;
    if (R && V.phase === 'over' && G.mode === 'play') { const ws = R.winners, mine = ws.find(w => w.i === V.me);
      result = { mine: !!mine, title: mine ? (ws.length > 1 ? 'SPLIT POT' : 'YOU WIN') : (ws.map(w => V.players[w.i].name).join(' + ') + (ws.length > 1 ? ' SPLIT' : ' WINS')), amt: mine ? mine.amt : ws[0].amt,
        hand: R.byFold ? 'Everyone else folded' : ws[0].hand, lines: R.byFold ? [] : V.players.map((p, i) => ({ k: 'r' + i, name: i === V.me ? 'YOU' : p.name, txt: p.folded || p.out ? 'FOLDED' : (R.hands[i] || ''), win: ws.some(w => w.i === i) })).filter(x => x.txt && x.txt !== 'FOLDED') }; }
    const myTurn = !!(L && G.mode === 'play'), owe = L ? L.toCall : 0;
    const prompt = !V || G.mode !== 'play' ? '' : V.phase === 'over' ? '' : myTurn ? (owe ? owe + ' TO CALL' : 'YOUR MOVE') + ' · POT ' + V.pot : V.phase === 'bet' && V.toAct >= 0 ? (V.players[V.toAct].name + ' IS THINKING…') : V.phase === 'deal' ? 'DEALING…' : '';
    const n = G.net, mem = netMembers();
    onState({ mode: G.mode, kind: G.kind, err: G.err, practice: G.practice, gold: d.gold, foxes: +pref('foxes', 1), sound: sfx.on, music: music.on, embed, name: netName(),
      layout: LAY ? LAY.kind : 'land', trayOn, tray: (() => { const t = trayRect(); return t ? { x: Math.round(t.x), y: Math.round(t.y), w: Math.round(t.w), h: Math.round(t.h) } : null; })(), street: V ? (hold ? (V.phase === 'idle' ? '' : ['PRE-FLOP', 'FLOP', 'TURN', 'RIVER'][V.street] || '') : V.street ? STREET[V.street] : '') : '', game: G.mode === 'play' && V ? (hold ? 'holdem' : 'stud') : G.game, pot: V ? V.pot : 0, prompt, myTurn,
      me: me ? { chips: me.chips, bet: me.bet, folded: me.folded, hand: myHand ? myHand.name : '', hole: hold ? '' : me.cards[0] && me.cards[0].r ? RANK_CH(me.cards[0].r) + SUIT_CH[me.cards[0].s] : '', cards: myCards.map(c => RANK_CH(c.r) + SUIT_CH[c.s]).join(' ') + (board.length ? ' \u00b7 BOARD ' + board.map(c => RANK_CH(c.r) + SUIT_CH[c.s]).join(' ') : '') } : null,
      legal: L ? { fold: L.fold, check: L.check, call: L.call, raise: L.raise, open: L.open, raiseTo: L.raiseTo, allInCall: L.allInCall, allInRaise: L.allInRaise } : null,
      seats: seatLabels(), say: G.say && now < G.sayT ? G.say : null, result, bust: G.bust && G.kind === 'solo', handNo: V ? V.handNo : 0, waitNext: G.kind === 'net' && V && V.phase === 'over' ? Math.max(0, Math.ceil(G.nextAt ? G.nextAt - now : 8)) : 0,
      tl: G.kind === 'net' && myTurn ? Math.max(0, Math.round(STUD.turnSecs - (now - G.turnT0))) : 0,
      stats: { played: d.stats[SK() + 'handsPlayed'] || 0, won: d.stats[SK() + 'handsWon'] || 0, best: d.stats[SK() + 'bestPot'] || 0 },
      net: n ? { st: n.st, code: n.code || '', status: n.status || '', msg: n.msg || '', via: n.via || '', fill: !!n.fill, ready: !!n.ready, host: isHost(), members: mem.slice(0, MAXP).map(x => ({ k: x.id, name: x.me ? n.name + ' (YOU)' : x.name, ready: !!x.ready })), full: mem.length > MAXP && !mem.slice(0, MAXP).some(x => x.me) } : null });
    labelCache = '';
  }

  // ======================================================================= RESIZE + LOOP
  let lastKind = '';
  function resize() {
    const W = CW(), H = CH(); renderer.setSize(W, H, false); camera.aspect = W / H; camera.fov = W / H < 0.8 ? 52 : 42; camera.updateProjectionMatrix();
    const kind = W / H < 0.85 ? 'port' : 'land';
    if (kind !== lastKind) { lastKind = kind; relayout(true); }
    if (G.mode === 'play') { const s = seatShot(); cam.pos.copy(s.pos); cam.look.copy(s.look); cam.to = null; } else if (G.mode === 'intro' && (!cam.to || !cam.walk)) { const s = introShot(); cam.pos.copy(s.pos); cam.look.copy(s.look); cam.to = null; }
    emitSoon();
  }
  const ro = new ResizeObserver(() => resize()); ro.observe(container); resize();
  { const s = introShot(); cam.pos.copy(s.pos).add(V3(0, -0.2, 6)); cam.look.copy(s.look); camTo(s, 2.6, true); }

  let raf = 0, last = performance.now(), dead = false, labelT = 0;
  const _v = V3(), _w = V3();
  function frame(t) {
    if (dead) return; raf = requestAnimationFrame(frame); const dt = clamp((t - last) / 1000, 0, 0.05); last = t; now += dt;
    // camera
    if (cam.to) { cam.t = Math.min(1, cam.t + dt / cam.dur); const e = ease(cam.t); cam.pos.lerpVectors(cam.from.pos, cam.to.pos, e); cam.look.lerpVectors(cam.from.look, cam.to.look, e); if (cam.walk) cam.pos.y += Math.sin(cam.t * Math.PI * 6) * 0.04 * (1 - cam.t); if (cam.t >= 1) cam.to = null; }
    camera.position.copy(cam.pos); if (G.mode === 'intro' && !cam.to) camera.position.x += Math.sin(now * 0.25) * 0.25; camera.lookAt(cam.look);
    // foxes
    kane.userData.lookAt = camera.position; kit.animFox(kane, dt, 0);
    if (kane.userData.dealT && now < kane.userData.dealT) { const P = kane.userData.P; P.arms[1].rotation.x = -1.2 + Math.sin(now * 14) * 0.35; P.arms[0].rotation.x = -0.9; }
    else if (G.mode === 'intro') { const P = kane.userData.P; P.arms[0].rotation.x = -0.9 + Math.sin(now * 3) * 0.12; P.arms[1].rotation.x = -0.9 - Math.sin(now * 3) * 0.12; }
    const V = G.V, ti = V && V.toAct;
    for (const [s, o] of Object.entries(seatFox)) { const f = o.fox; f.userData.lookAt = null; if (V && ti >= 0 && slotOf(ti, V) === +s) f.userData.lookAt = null; kit.animFox(f, dt, 0); seatPose(f); }
    // cards
    for (const [key, o] of Object.entries(cardObjs)) {
      const g = o.g;
      if (o.sweep) { o.t += dt / o.d; const e = ease(Math.min(1, o.t)); g.position.lerpVectors(o.from, o.to, e); g.position.y += Math.sin(e * Math.PI) * 0.4; g.scale.setScalar(Math.max(0.01, 1 - e * 0.6)); if (o.t >= 1) { scene.remove(g); scene.remove(g.userData.sh); delete cardObjs[key]; } else placeShadow(g); continue; }
      const tgt = cardTarget(o.slot, o.k), sc = o.slot === 'B' ? LAY.board.sc : o.slot === 0 ? LAY.me.sc : LAY.osc;
      if (o.delay > 0) { o.delay -= dt; g.position.copy(dealerHand()); g.visible = false; g.userData.sh.visible = false; continue; }
      if (!o.shown) { o.shown = true; sfx.card(); } g.visible = !(o.mine && TRAY);
      if (o.t < 1) { o.t = Math.min(1, o.t + dt / o.d); const e = ease(o.t); _v.copy(dealerHand()); g.position.lerpVectors(_v, tgt, e); g.position.y += Math.sin(e * Math.PI) * 0.35; g.rotation.y = (1 - e) * 2.4; g.scale.setScalar(0.8 + (sc - 0.8) * e); g.rotation.z = o.faceUp ? Math.PI * (1 - e) : Math.PI; if (o.t >= 1) o.flipT = 1; }
      else { g.position.x = damp(g.position.x, tgt.x, 10, dt); g.position.z = damp(g.position.z, tgt.z, 10, dt); g.position.y = tgt.y; g.rotation.y = 0; g.scale.setScalar(sc);
        if (o.flipT < 1) { o.flipT = Math.min(1, o.flipT + dt / 0.35); const e = ease(o.flipT); g.rotation.z = o.faceUp ? Math.PI * (1 - e) : Math.PI * e; g.position.y += Math.sin(e * Math.PI) * 0.2; } else g.rotation.z = o.faceUp ? 0 : Math.PI; }
      // your hole card: tipped up toward you, like peeking at it
      const peek = o.mine && (LAY.holdem || o.k === 0) && o.t >= 1 && o.faceUp && !(V && V.result && !V.result.byFold) ? 0.32 : 0;
      o.peek = damp(o.peek || 0, peek, 8, dt); g.rotation.x = o.peek;
      if (o.peek > 0.001) { const hh = CARD.h * g.scale.x / 2; g.position.y += Math.sin(o.peek) * hh + 0.004; g.position.z -= (1 - Math.cos(o.peek)) * hh; }
      placeShadow(g, o.win); if (o.mine && TRAY) g.userData.sh.visible = false;
      if (o.r >= 11 && o.faceUp && o.t >= 1 && o.flipT >= 1) animCard(o, dt);
    }
    // chips in flight
    for (let i = flyers.length - 1; i >= 0; i--) { const f = flyers[i]; f.t += dt / f.d; if (f.t < 0) { f.g.visible = false; continue; } f.g.visible = true; const e = ease(Math.min(1, f.t)); f.g.position.lerpVectors(f.from, f.to, e); f.g.position.y += Math.sin(e * Math.PI) * 0.3; if (f.t >= 1) { scene.remove(f.g); flyers.splice(i, 1); } }
    if (dButton.visible) dButton.position.lerp(dButton.userData.to, 1 - Math.exp(-8 * dt));
    for (const p of sparks) { if (p.life <= 0) continue; p.life -= dt / 1.3; if (p.life <= 0) { p.sp.visible = false; continue; } p.v.y -= 3.2 * dt; p.sp.position.addScaledVector(p.v, dt); p.sp.material.opacity = Math.min(1, p.life * 1.4); p.sp.scale.setScalar(0.06 + 0.1 * p.life); }
    // whose turn: a gold ring on the felt
    if (V && V.phase === 'bet' && ti >= 0 && G.mode === 'play' && now >= busyUntil - 0.2) { const s = slotOf(ti, V), r = s === 0 ? LAY.me.row : LAY.seats[s].row, sc = s === 0 ? LAY.me.sc : LAY.osc, sp = s === 0 ? LAY.me.sp : LAY.sp;
      turnRing.visible = true; turnRing.position.set(r[0], FELT_Y + 0.005, r[1]); turnRing.scale.set(4 * sp + CARD.w * sc + 0.3, CARD.h * sc + 0.26, 1); turnRing.material.opacity = 0.6 + Math.sin(now * 5) * 0.3; } else turnRing.visible = false;
    for (const b of blinkers) { const on = Math.sin(now * 3 + b.ph) > 0; b.sp.material.opacity = on ? 0.7 : 0.15; }
    for (const w of spinners) w.rotation.z += dt * 0.15;
    lamp.visible = G.mode !== 'play';
    tick(dt);
    if (G.say && now > G.sayT && G.say) { G.say = null; emitSoon(); }
    labelT -= dt; emitT -= dt;
    if (G.mode === 'play' && (cam.to || labelT <= 0)) { labelT = cam.to ? 0.08 : 0.5; const k = JSON.stringify(seatLabels().map(s => [s.x, s.y])); if (k !== labelCache) { emit(); labelCache = k; } }
    if (emitT <= 0) { emitT = 1; emit(); }
    renderer.render(scene, camera);
    updateTray(dt); if (TRAY) { renderer.autoClear = false; renderer.clearDepth(); renderer.render(hudScene, hudCam); renderer.autoClear = true; }
  }
  raf = requestAnimationFrame(frame);

  function stand() { G.mode = 'intro'; G.T = null; G.V = null; G.kind = null; G.bust = false; for (const [k, o] of Object.entries(cardObjs)) { scene.remove(o.g); scene.remove(o.g.userData.sh); delete cardObjs[k]; } for (const s of Object.values(betStacks)) setStack(s, 0); setStack(potStack, 0); for (let s = 1; s <= 4; s++) setSeatFox(s, null, null); SLOT_USED = [];
    G.T = null; startIdle(); relayout(); placeSeats(); camTo(introShot(), 1.4); emit(); }
  // the idle table you walk up to: Lyra and two others already playing a quiet hand
  function startIdle() { const idle = [0, 1, 3]; SLOT_USED = [1, 2, 4]; idle.forEach((fi, k) => setSeatFox([1, 2, 4][k], 'idle' + fi, FOXES[fi])); }
  startIdle(); emit();

  // ======================================================================= API for the page
  return {
    sitSolo(n) { n = clamp(n | 0 || 3, 1, 4); for (let s = 1; s <= 4; s++) setSeatFox(s, null, null); startSolo(n); },
    act(a) { if (G.mode !== 'play') return; sfx.ctx(); if (G.T) { if (G.T.toAct === G.meIdx) { G.T.act(G.meIdx, a); sync(); } } else if (G.netConn && G.V && G.V.toAct === G.V.me) { G.netConn.send('act', { a }, netHostId()); } },
    nextHand() { if (G.kind === 'solo' && G.T && G.T.phase === 'over') newHand(); },
    rebuy() { if (G.kind !== 'solo' || !G.T) return; const d = saveRead(); G.practice = d.gold < 10; const me = G.T.P[G.meIdx]; me.chips = G.practice ? STUD.buyIn : Math.min(d.gold, STUD.buyIn); G.bust = false; say('KANE', 'Fresh chips. Good luck.'); newHand(); },
    leave() { if (G.kind === 'solo' && G.T && G.T.phase !== 'over' && G.T.phase !== 'idle' && !G.practice) { const me = G.T.P[G.meIdx]; if (!me.out) { const lost = G.chipsBefore - me.chips; if (lost > 0) saveEdit(d => { d.gold = Math.max(0, d.gold - lost); }); } }
      if (G.kind === 'net') { if (G.T) { /* host leaving ends the table for everyone */ } netLeave(false); }
      stand(); },
    toggleTray() { trayOn = !trayOn; setPref('tray', trayOn ? 1 : 0); if (G.mode === 'play') camTo(seatShot(), 0.5); emit(); },
    music() { sfx.ctx(); music.toggle(); emit(); },
    setGame(g) { if (G.mode === 'play') return; G.game = g === 'holdem' ? 'holdem' : 'stud'; setPref('game', G.game); emit(); },
    sound() { sfx.on = !sfx.on; setPref('sound', sfx.on ? 1 : 0); if (sfx.on) sfx.chip(); emit(); },
    netOpen() { G.net = G.net || { st: 'menu', name: netName(), msg: '', peers: {} }; emit(); },
    netClose() { netLeave(false); G.net = null; emit(); },
    netCreate, netJoin,
    netReady() { const n = G.net; if (!n || !G.netConn) return; n.ready = !n.ready; G.netConn.send('rd', { on: n.ready }); emit(); maybeStart(); },
    netFill() { const n = G.net; if (!n || !G.netConn || !isHost()) return; n.fill = !n.fill; G.netConn.send('fill', { on: n.fill }); emit(); },
    setName(v) { setPref('name', String(v || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 10)); if (G.net) G.net.name = netName(); emit(); },
    setSafe(s) { if (G.peek) return; const k = JSON.stringify(s); if (k === JSON.stringify(SAFE)) return; SAFE = { ...SAFE, ...s }; if (G.mode === 'play') { const sh = seatShot(); if (cam.to) cam.to = sh; else { cam.pos.copy(sh.pos); cam.look.copy(sh.look); } } },
    destroy() { music.stop(); clearInterval(restyleTimer); dead = true; cancelAnimationFrame(raf); ro.disconnect(); netLeave(false); renderer.dispose(); renderer.domElement.remove(); },
    get state() { return G; }, renderer, scene,
    peek(what) { G.peek = true; const p = /kane/.test(what) ? kane.getWorldPosition(V3()) : V3(0, FELT_Y, 0); cam.to = null; if (what === 'kane') { const side = what === 'kane2'; cam.pos.set(p.x + (side ? 2.2 : 0.6), 2.15, p.z + (side ? 0.9 : 2.3)); cam.look.set(p.x, 1.78, p.z); } else { cam.pos.set(0.01, FELT_Y + 2.2, 0.6); cam.look.set(0, FELT_Y, 0); } },
    cardSheet(list) { const c = document.createElement('canvas'), W = CWp * RES, H = CHp * RES; c.width = W * list.length; c.height = H; const g = c.getContext('2d'); list.forEach(([r, s2, opt], i) => { const k = document.createElement('canvas'); k.width = W; k.height = H; if (r) paintCard(k, r, s2, opt || {}); else k.getContext('2d').drawImage(backTex.image, 0, 0); g.drawImage(k, i * W, 0); }); return c.toDataURL('image/png'); },
    debug() { const sh = seatShot(); return { SAFE, W: CW(), H: CH(), cam: cam.pos.toArray(), look: cam.look.toArray(), shot: sh.pos.toArray(), shotLook: sh.look.toArray(), lay: LAY.kind, fov: camera.fov, aspect: camera.aspect, now, dealClock, busyUntil, slots: SLOT_USED, cards: Object.values(cardObjs).map(o => [o.hand, o.i, o.slot, o.k, +o.t.toFixed(2), +o.delay.toFixed(2), o.g.visible, o.g.position.toArray().map(v => +v.toFixed(2)), !!o.sweep]) }; },
  };
}
