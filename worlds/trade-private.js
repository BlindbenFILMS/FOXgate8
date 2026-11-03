// 8 GATES · PRIVATE TRADES (s601c, Ben): besides the dock MARKET, private buyers + sellers. Shown on the PRIVATE DEALS board in each dock's
// TRADE OFFICE and called in over COMMS on the space map. No names (generic people) until Ben OKs characters.
// · BUYERS (a wealthy citizen's estate, a private lab, a wedding feast...): want N crates of one good HERE, pay 1.4-1.8x the market.
// · SELLERS (bankrupt shipper, estate sale...): a lot of 8-20 crates at 40-60 % of the market. You buy the WHOLE lot: what fits goes in
//   your hold, the rest into DOCK STORAGE at that dock (rent 1 G a crate a day).
// · BULK LOT with every MARKET NEWS window: a fire sale of 20-40 crates somewhere at 40-55 %. Good to buy + store until that good is hot.
// The board changes every 30 min; a taken offer is gone (save stat privDone).
import { GOODS } from './space-trade.js?v=s601d';
export const PORTS = ['shasta', 'luxor', 'ur', 'gaya', 'meru', 'zion', 'nebo', 'kufa', 'jidda'];
export const WIN_MS = 30 * 60000;
const rnd = s => { let h = s | 0; return () => { h = (h * 1664525 + 1013904223) | 0; return ((h >>> 0) % 100000) / 100000; }; };
const pick = (R, a) => a[Math.floor(R() * a.length)];
const BUYERS = [['A WEALTHY CITIZEN', 'for a new estate'], ['A WEALTHY CITIZEN', 'for a private lab'], ['A WEDDING PARTY', 'for the feast'], ['A SHIPBUILDER', 'for a rush job'], ['A TAVERN KEEPER', 'before the festival crowds'], ['A MUSEUM', 'for its new hall']];
const SELLERS = [['A BANKRUPT SHIPPER', 'must sell today'], ['AN ESTATE SALE', 'everything must go'], ['A CLOSING WAREHOUSE', 'clearing the floor'], ['A STRANDED TRADER', 'needs gold to fly home']];
const BULK = ['A WAREHOUSE FIRE SALE', 'A SHIPPING LINE GONE BUST', 'A FAILED COLONY'];
const pool = port => GOODS.filter(g => !g.frontier && !g.exportOnly && !g.limited && g.p && g.p[port] != null);
export function bulkLot(ev, buyPrice) { if (!ev) return null; const R = rnd(ev.w * 4243 + 7), port = pick(R, PORTS), P = pool(port).filter(g => g.key !== ev.good); if (!P.length) return null; const g = pick(R, P), n = 20 + Math.floor(R() * 21);
  return { id: 'pk' + ev.w, port, kind: 'sell', bulk: true, who: pick(R, BULK), why: 'in the market news', good: g.key, name: g.name, n, price: Math.max(1, Math.round(buyPrice(g, port) * (0.4 + R() * 0.15))), exp: (ev.w + 1) * ev.ms }; }
export function boardAt(port, { buyPrice, sellPrice, done = [], ev = null }) { const w = Math.floor(Date.now() / WIN_MS), R = rnd(w * 911 + port.charCodeAt(0) * 31 + port.length * 7), P = pool(port), out = [], exp = (w + 1) * WIN_MS; if (!P.length) return out;
  const nB = R() < 0.5 ? 2 : 1; for (let i = 0; i < nB; i++) { const g = pick(R, P), b = pick(R, BUYERS); out.push({ id: 'pb' + w + port + i, port, kind: 'buy', who: b[0], why: b[1], good: g.key, name: g.name, n: 3 + Math.floor(R() * 6), price: Math.round(sellPrice(g, port) * (1.4 + R() * 0.4)), exp }); }
  { const g = pick(R, P), s = pick(R, SELLERS); out.push({ id: 'ps' + w + port, port, kind: 'sell', who: s[0], why: s[1], good: g.key, name: g.name, n: 8 + Math.floor(R() * 13), price: Math.max(1, Math.round(buyPrice(g, port) * (0.4 + R() * 0.2))), exp }); }
  const B = bulkLot(ev, buyPrice); if (B && B.port === port) out.unshift(B);
  return out.filter(o => !done.includes(o.id) && o.exp > Date.now()); }
export const doneList = save => { const d = save.stat('privDone', null); return Array.isArray(d) ? d : []; };
export const markDone = (save, id) => save.setStat('privDone', [id, ...doneList(save)].slice(0, 80));
export const offerLine = o => o.kind === 'buy' ? o.who + ' wants ' + o.n + ' ' + o.name + ' ' + o.why + ' · ' + o.price + ' G a crate' : o.who + ' sells ' + o.n + ' ' + o.name + ' · ' + o.price + ' G a crate (' + o.why + ')';
