// 8 GATES — ARCADE · SLOTS: LUCKY GATES [arcadeSlots] — the maths. Pure data + functions (no DOM, no THREE), so it can be tested on its own.
// 3 reels × 3 rows, 3 paylines (1 = middle, 2 = top, 3 = bottom). Bet 1–5 gold per line.
// Return to player: 95.5% per line from the reels (worked out by enumerating all 10,648 stops), plus the progressive jackpot.
// Hit rate: about 1 spin in 4 pays on any one line; with 3 lines about 1 in 2.

export const SYMBOLS = {
  eight: { name: '8 CREST', short: '8', pay: 250 },
  crescent: { name: 'CRESCENT MOON', short: 'CRESCENT', pay: 100 },
  fox: { name: 'FOX', short: 'FOX', pay: 60 },
  rocket: { name: 'ROCKET', short: 'ROCKET', pay: 30 },
  star: { name: 'STAR', short: 'STAR', pay: 20 },
  sat: { name: 'SATELLITE', short: 'SAT', pay: 15 },
  moon: { name: 'FULL MOON', short: 'MOON', pay: 12 },
  blank: { name: 'BLANK', short: '—', pay: 0 },
};
export const STRIPS = [
  ['eight', 'blank', 'moon', 'blank', 'sat', 'star', 'rocket', 'fox', 'crescent', 'sat', 'moon', 'star', 'sat', 'rocket', 'fox', 'moon', 'sat', 'moon', 'star', 'rocket', 'crescent', 'moon'],
  ['eight', 'blank', 'moon', 'blank', 'sat', 'blank', 'star', 'blank', 'rocket', 'fox', 'crescent', 'sat', 'moon', 'star', 'sat', 'rocket', 'fox', 'moon', 'sat', 'star', 'rocket', 'crescent'],
  ['eight', 'blank', 'moon', 'blank', 'sat', 'blank', 'star', 'rocket', 'fox', 'crescent', 'sat', 'moon', 'star', 'sat', 'rocket', 'fox', 'moon', 'sat', 'star', 'rocket', 'crescent', 'star']];
export const STOPS = 22;
export const LINES = [{ id: 1, row: 1, name: 'MIDDLE' }, { id: 2, row: 0, name: 'TOP' }, { id: 3, row: 2, name: 'BOTTOM' }];
export const BET = { min: 1, max: 5 }, MAX_LINES = 3;
export const JACKPOT = { base: 250, share: 0.03 };          // pot starts at 250 and gets 3% of every bet; 8-8-8 at 5 per line wins it
export const DAILY_LOSS_LIMIT = 100;                         // gold a player can lose on one day before the machine says "come back tomorrow"
export const PAYTABLE = [
  ['8 · 8 · 8', '250× + JACKPOT at max bet'], ['CRESCENT · CRESCENT · CRESCENT', '100×'], ['FOX · FOX · FOX', '60×'], ['ROCKET · ROCKET · ROCKET', '30×'],
  ['STAR · STAR · STAR', '20×'], ['SATELLITE · SATELLITE · SATELLITE', '15×'], ['FULL MOON · FULL MOON · FULL MOON', '12×'], ['FULL MOON · FULL MOON · any', '5×'], ['FULL MOON · any · any', '2×']];

export const sym = (reel, stop) => STRIPS[reel][((stop % STOPS) + STOPS) % STOPS];
// rows on screen for a reel stopped at `stop`: [top, middle, bottom] (the strip runs upward on the drum, so the symbol above is stop + 1)
export const column = (reel, stop) => [sym(reel, stop + 1), sym(reel, stop), sym(reel, stop - 1)];
export function linePay(a, b, c) {
  if (a === b && b === c && SYMBOLS[a].pay) return { mult: SYMBOLS[a].pay, kind: a, n: 3 };
  if (a === 'moon' && b === 'moon') return { mult: 5, kind: 'moon', n: 2 };
  if (a === 'moon') return { mult: 2, kind: 'moon', n: 1 };
  return null;
}
// stops: [s0, s1, s2] · lines: 1–3 · bet per line
export function evaluate(stops, lines, bet) {
  const cols = stops.map((s, r) => column(r, s)), wins = []; let total = 0, jackpot = false;
  for (const L of LINES.slice(0, lines)) {
    const a = cols[0][L.row], b = cols[1][L.row], c = cols[2][L.row], p = linePay(a, b, c);
    if (p) { const amt = p.mult * bet; total += amt; const jp = p.kind === 'eight' && p.n === 3 && bet === BET.max; if (jp) jackpot = true; wins.push({ line: L.id, row: L.row, name: L.name, kind: p.kind, n: p.n, amt, jp, syms: [a, b, c] }); }
  }
  return { cols, wins, total, jackpot };
}
// near miss: two 8s (or two CRESCENTs) lined up on an active line after reels 1 + 2 → reel 3 spins longer
export function teaser(s0, s1, lines) { const c0 = column(0, s0), c1 = column(1, s1); return LINES.slice(0, lines).some(L => c0[L.row] === c1[L.row] && (c0[L.row] === 'eight' || c0[L.row] === 'crescent')); }
export const randStop = (rnd = Math.random) => Math.floor(rnd() * STOPS);
export function rtp() { let t = 0, n = 0; for (let a = 0; a < STOPS; a++) for (let b = 0; b < STOPS; b++) for (let c = 0; c < STOPS; c++) { const p = linePay(STRIPS[0][a], STRIPS[1][b], STRIPS[2][c]); t += p ? p.mult : 0; n++; } return t / n; }
