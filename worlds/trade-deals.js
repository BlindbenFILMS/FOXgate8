// 8 GATES · TRADE DEALS + THE CARGO FLEET (s601, Ben). Replaces the s599 fee-only trade routes (trade-routes.js keeps the port stock).
// You can still buy whatever fits in your own hold at any dock MARKET. To send a CARGO SHIP on autopilot you need a DEAL, made in person
// at that dock's TRADE OFFICE with its officer (names Ben OK'd s601: same first letter as the world). A deal needs: PEACE with the world,
// trade STANDING there (KNOWN; LUXOR = TRUSTED), a SIGNING FEE (your gold) and a FREE CARGO SHIP. Terms: price per crate, crates per run
// (= the ship), number of runs (3 / 5 / 8); then it ends and you renegotiate. War cancels the deal.
// IN  = the world's goods to your planet, paid from PLANET gold (ppStock.g). OUT = your planet's goods (brick, crystal, cloth) sold there,
// gold to the planet. Goods with no planet use yet go to ppStock.wh (the warehouse, part 2).
// FLEET (save stat cargoFleet): you start with one SMALL HAULER (+ enough crystal for its first export run); more at any SHIPYARD.
import { GOODS } from './space-trade.js?v=s601d';
import { USE } from './player-farm.js?v=s601d';

export const OFFICERS = {
  meru:   { n: 'MOLLY', open: 0.12, give: 0.10, yld: 0.60, pat: 3, hi: 'Welcome to the MERU trade office. Fair terms, fast ships. What are we moving?', ok: 'Done. Fair is fair.', no: 'That is under my cost. Try again.', mad: 'We are going in circles, dear. Come back in a while.', sign: 'Signed. Your ship sails on the next run.' },
  gaya:   { n: 'GUS', open: 0.15, give: 0.12, yld: 0.50, pat: 4, longK: 0.04, hi: 'Slow down, friend. Good deals grow like trees. Long ones grow best.', ok: 'Hm. Yes. That will do.', no: 'Too quick, too cheap. Think longer.', mad: 'Let it rest. Come back when it has grown.', sign: 'Signed. Longer deals, better prices. Remember that.' },
  jidda:  { n: 'JAX', open: 0.25, give: 0.14, yld: 0.35, pat: 3, hi: 'Jax. Fastest deals in the nine. My first price is never my last.', ok: 'Ha! You got me. Fine.', no: 'Nope. Try harder.', mad: 'You are wasting my clock. Later.', sign: 'Deal! Pleasure robbing you.' },
  kufa:   { n: 'KIRA', open: 0.15, give: 0.08, yld: 0.45, pat: 2, small: true, hi: 'Kira. I move ore by the shaft-load. Small orders waste my time.', ok: 'Fine. Load it.', no: 'No. Bring a bigger ship.', mad: 'Enough. Out of my office.', sign: 'Signed. Do not be late.' },
  luxor:  { n: 'LYRA', open: 0.18, give: 0.10, yld: 0.50, pat: 3, tier: 2, hi: 'You stand in LUXOR. Respect first. Then we speak of price.', ok: 'You may have it.', no: 'You forget where you are.', mad: 'This audience is over.', sign: 'It is written. LUXOR keeps its word.' },
  nebo:   { n: 'NED', open: 0.10, give: 0.14, yld: 0.75, pat: 4, hi: 'Oh! A trader. I am Ned. I mean, NEBO TRADE OFFICE. Hello!', ok: 'Um. Okay! Yes. Sure!', no: 'I, er, cannot go that low. Sorry!', mad: 'I need to ask my boss. Come back later?', sign: 'Signed! My first big one. Thank you!' },
  ur:     { n: 'URSA', open: 0.14, give: 0.10, yld: 0.50, pat: 3, memo: true, hi: 'Ursa. I remember every deal ever made at UR. Let us make a good one.', ok: 'I will remember that.', no: 'Your last offer was better.', mad: 'I will remember this too. Later.', sign: 'Signed. Finish it well and I give better terms.' },
  zion:   { n: 'ZED', open: 0.14, give: 0.10, yld: 0.45, pat: 2, fav: 'zion_metal', hi: 'Zed. Metal first. Talk after.', ok: 'Fine.', no: 'No.', mad: 'Done talking.', sign: 'Signed. Metal moves.' },
  shasta: { n: 'SUKI', open: 0.20, give: 0.06, yld: 0.30, pat: 2, warm: true, hi: 'Suki. SHASTA trades with friends. We will see if you are one.', ok: 'Friends, then.', no: 'Not yet. Trade here more.', mad: 'Cold out here. Come back later.', sign: 'Signed. Do not make me regret it.' }
};
export const WORLD_NAME = { shasta: 'SHASTA', luxor: 'LUXOR', ur: 'UR', gaya: 'GAYA', meru: 'MERU', zion: 'ZION', nebo: 'NEBO', kufa: 'KUFA', jidda: 'JIDDA' };
export const CARGO = { small: ['SMALL HAULER', 6, 20, 0, 13], hauler: ['HAULER', 10, 20, 500, 17], big: ['BIG HAULER', 16, 24, 1200, 22] };   // name, crates, min per run, price, model length
export const RUNS = [3, 5, 8], LOCK_MS = 10 * 60000, RISK = 0.15, STAND_NEED = ['NEW', 'KNOWN', 'TRUSTED'];
export const fee = runs => 40 + 10 * runs;
const G = k => GOODS.find(g => g.key === k);
export const goodName = k => (G(k) || {}).name || k;

// ---------- fleet ----------
export function fleet(save) { let f = save.stat('cargoFleet', null); if (!Array.isArray(f) || !f.length) { f = [{ id: 'c1', size: 'small' }]; save.setStat('cargoFleet', f);
    const st = { g: 0, t: 60, s: 30, m: 10, c: 8, ...(save.stat('ppStock', null) || {}) }, need = CARGO.small[1] * 2; if ((st.c || 0) < need) { st.c = need; save.setStat('ppStock', st); } }   /* Ben: enough crystal for the first export run */
  return f.slice(); }
export function buyCargo(save, size) { const C = CARGO[size]; if (!C || !C[3] || !save.spend(C[3])) return false; const f = fleet(save); f.push({ id: 'c' + Date.now().toString(36), size }); save.setStat('cargoFleet', f); return true; }
export const deals = save => { const d = save.stat('tradeDeals', null); return Array.isArray(d) ? d.slice() : []; };
export const freeShips = save => { const D = deals(save); return fleet(save).filter(s => !D.some(d => d.ship === s.id)).sort((a, b) => CARGO[b.size][1] - CARGO[a.size][1]); };
export const shipSpec = (save, id) => CARGO[(fleet(save).find(s => s.id === id) || {}).size || 'small'];
export const nextRunMs = (save, d) => Math.max(0, d.last + shipSpec(save, d.ship)[2] * 60000 - Date.now());
// s599 routes are closed: deals are made in person now (Ben: "old routes need a deal")
export function migrate(save) { const r = save.stat('tradeRoutes', null); if (Array.isArray(r) && r.length) { save.setStat('tradeRoutes', []); return true; } return false; }

// ---------- what a port trades ----------
export const goodsIn = port => GOODS.filter(g => !g.frontier && !g.exportOnly && g.home !== 'p1' && g.p && g.p[port] != null);
export const goodsOut = () => GOODS.filter(g => g.exportOnly && g.export);
const lock = (save, port) => (save.stat('dealLock', null) || {})[port] || 0;
export function gate(save, port, { tierI, tierName, atWar }) { const O = OFFICERS[port]; if (!O) return { ok: false, line: 'No trade office here.' };
  if (atWar) return { ok: false, line: 'We are at war. No deals. Not with you.' };
  const lk = lock(save, port) - Date.now(); if (lk > 0) return { ok: false, line: O.mad + ' (' + Math.ceil(lk / 60000) + ' MIN)' };
  const need = O.tier || 1; if (tierI < need) return { ok: false, line: 'Trade here more first. I deal with ' + STAND_NEED[need] + ' traders. You are ' + tierName + '.', stand: true };
  if (!freeShips(save).length) return { ok: false, line: 'Every cargo ship you own is busy. Buy another at a SHIPYARD.', noShip: true };
  return { ok: true, line: O.hi }; }

// ---------- negotiation (N lives in the dock menu) ----------
// base = the port's market price (in: its buy price · out: its sell price). Opening offer = base ± open; the officer's limit = base ∓ give.
export function begin(save, port, dir, key, base, tierI) { const O = OFFICERS[port], ship = freeShips(save)[0], crates = CARGO[ship.size][1];
  let open = O.open * (O.fav === key ? 0.5 : 1), give = O.give + (O.warm ? tierI * 0.04 : 0) + (O.memo ? Math.min(0.1, save.stat('dealsDone_' + port, 0) * 0.02) : 0) + tierI * 0.02;
  const s = dir === 'in' ? 1 : -1, price = Math.max(1, Math.round(base * (1 + s * open))), lim = Math.max(1, Math.round(base * (1 - s * give)));
  return { dir, good: key, base, price, lim, runs: 5, asks: 0, pat: O.pat + (O.warm ? tierI : 0), crates, ship: ship.id, line: null }; }
export function effective(port, N) { const O = OFFICERS[port], s = N.dir === 'in' ? 1 : -1, ri = RUNS.indexOf(N.runs); let k = 1 - s * (O.longK || 0) * Math.max(0, ri);
  if (O.small && N.crates < 10) k *= 1 + s * 0.1; return Math.max(1, Math.round(N.price * k)); }
export function haggle(save, port, N, tierI) { const O = OFFICERS[port], s = N.dir === 'in' ? 1 : -1, gap = (N.price - N.lim) * s;
  if (gap < 1) { N.pat--; N.line = N.pat <= 0 ? O.mad : O.no + ' That is my best.'; return N.pat <= 0 ? 'mad' : 'floor'; }
  const p = Math.max(0.05, Math.min(0.95, O.yld + tierI * (O.warm ? 0.15 : 0.08) - N.asks * 0.12)); N.asks++; const r = Math.random(); let move = 0, kind;
  if (r < p) { move = Math.max(1, Math.round(gap * 0.5)); kind = 'agree'; N.line = O.ok; } else if (r < p + (1 - p) * 0.55) { move = Math.max(1, Math.round(gap * 0.25)); kind = 'counter'; N.line = 'Meet me halfway. ' + Math.round(N.price - s * move) + ' G a crate.'; }
  else { N.pat--; kind = N.pat <= 0 ? 'mad' : 'refuse'; N.line = N.pat <= 0 ? O.mad : O.no; }
  N.price = Math.max(1, N.price - s * move); if (kind === 'mad') { const L = { ...(save.stat('dealLock', null) || {}) }; L[port] = Date.now() + LOCK_MS; save.setStat('dealLock', L); } return kind; }
export function sign(save, port, N) { const f = fee(N.runs); if (!save.spend(f)) return { ok: false, line: 'The signing fee is ' + f + ' G. Come back with it.' };
  const ship = freeShips(save).find(s => s.id === N.ship) || freeShips(save)[0]; if (!ship) return { ok: false, line: 'You have no free cargo ship.' };
  const D = deals(save); D.push({ id: 'd' + Date.now().toString(36), port, good: N.good, dir: N.dir, price: effective(port, N), crates: CARGO[ship.size][1], runs: N.runs, left: N.runs, ship: ship.id, last: Date.now() - CARGO[ship.size][2] * 60000, log: [] });   /* s601b: the first run is ready at once */
  save.setStat('tradeDeals', D); return { ok: true, line: OFFICERS[port].sign }; }
export function cancel(save, id) { save.setStat('tradeDeals', deals(save).filter(d => d.id !== id)); }
export const dealState = (save, d) => d.ph === 'sail' ? 'UNDER WAY' : nextRunMs(save, d) > 0 ? 'NEXT IN ' + Math.ceil(nextRunMs(save, d) / 60000) + ' MIN' : 'READY · WAITING FOR YOUR ESCORT AT ' + (d.dir === 'in' ? (WORLD_NAME[d.port] || d.port) : 'YOUR PLANET');
export const dealLine = (save, d) => (d.dir === 'in' ? goodName(d.good) + ' FROM ' : goodName(d.good) + ' TO ') + (WORLD_NAME[d.port] || d.port) + ' · ' + d.crates + ' × ' + d.price + ' G · ' + d.left + '/' + d.runs + ' RUNS · ' + dealState(save, d);

// ---------- runs (s601b, Ben): the cargo ship WAITS at its dock until you fly up beside it, then you escort it the whole way ----------
const stock = save => ({ g: 0, t: 60, s: 30, m: 10, c: 8, ...(save.stat('ppStock', null) || {}) });
export function canRun(save, d) { const st = stock(save), nm = goodName(d.good);
  if (d.dir === 'in') { const cost = d.price * d.crates; return st.g >= cost ? { ok: true } : { ok: false, why: 'Your planet needs ' + cost + ' gold to pay for the ' + nm + ' run.' }; }
  const g = G(d.good), per = (g && g.per) || 1; return Math.floor((st[g && g.export] || 0) / per) >= 1 ? { ok: true } : { ok: false, why: 'No ' + nm + ' on your planet to ship.' }; }
// one escorted run arrived: move the goods + the gold. Mutates d (left, log). Returns the news line.
export function runOne(save, d) { const st = stock(save), nm = goodName(d.good), wn = WORLD_NAME[d.port] || d.port; let line;
  if (d.dir === 'in') { const cost = d.price * d.crates; if (st.g < cost) line = 'UNPAID · the planet could not pay for the ' + nm + ' run';
    else { st.g -= cost; d.left--; const U = USE[d.good]; if (U && U.k) st[U.k] = (st[U.k] || 0) + d.crates * U.per; else if (U && U.food) st.f = (st.f ?? 60) + d.crates * U.food; else { st.wh = { ...(st.wh || {}) }; st.wh[d.good] = (st.wh[d.good] || 0) + d.crates; }
      line = 'DELIVERED · ' + d.crates + ' ' + nm + ' from ' + wn + ' · -' + cost + ' planet gold'; } }
  else { const g = G(d.good), per = (g && g.per) || 1, key = g && g.export, q = Math.min(d.crates, Math.floor((st[key] || 0) / per)); if (!q) line = 'EMPTY · no ' + nm + ' left to sell';
    else { st[key] -= q * per; d.left--; st.g += q * d.price; line = 'SOLD · ' + q + ' ' + nm + ' at ' + wn + ' · +' + q * d.price + ' planet gold'; } }
  d.log = [line, ...(d.log || [])].slice(0, 5); save.setStat('ppStock', st); return line; }
export function lostRun(d) { d.left--; const line = 'LOST · pirates took the ' + goodName(d.good) + ' run'; d.log = [line, ...(d.log || [])].slice(0, 5); return line; }
export function finish(save, d) { save.setStat('dealsDone_' + d.port, save.stat('dealsDone_' + d.port, 0) + 1); return 'DEAL DONE · ' + goodName(d.good) + ' with ' + (WORLD_NAME[d.port] || d.port) + '. Talk to ' + OFFICERS[d.port].n + ' to sign again.'; }
// only war ends a deal off-screen now (runs need you)
export function settleDeals(save, { atWar = () => false } = {}) { const L = deals(save); if (!L.length) return []; const news = [], keep = L.filter(d => { if (!atWar(d.port)) return true; news.push('DEAL CANCELLED · war with ' + (WORLD_NAME[d.port] || d.port) + ' ended the ' + goodName(d.good) + ' deal'); return false; }); if (keep.length !== L.length) save.setStat('tradeDeals', keep); return news; }

// ---------- DOCK STORAGE (Ben: 1 G a crate a day; 1 game day = 24 real min) ----------
export const RENT_DAY_MS = 24 * 60000;
const storeAll = save => ({ ...(save.stat('dockStore', null) || {}) });
export const stored = (save, port) => ({ ...(storeAll(save)[port] || {}) });   // good → [crates, since]
export const rentOf = (rec, n = 1) => rec ? Math.max(1, Math.ceil((Date.now() - rec[1]) / RENT_DAY_MS)) * n : 0;
export function storeOne(save, port, key) { const A = storeAll(save), P = { ...(A[port] || {}) }, r = P[key], now = Date.now(); P[key] = r ? [r[0] + 1, (r[1] * r[0] + now) / (r[0] + 1)] : [1, now]; A[port] = P; save.setStat('dockStore', A); }
export function takeOne(save, port, key) { const A = storeAll(save), P = { ...(A[port] || {}) }, r = P[key]; if (!r || r[0] < 1) return { ok: false }; const rent = rentOf(r); if (!save.spend(rent)) return { ok: false, rent };
  if (r[0] <= 1) delete P[key]; else P[key] = [r[0] - 1, r[1]]; A[port] = P; save.setStat('dockStore', A); return { ok: true, rent }; }
