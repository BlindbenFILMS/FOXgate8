// 8 GATES · BUILDING GOODS SUPPLY + TRADE ROUTES (s599, Ben).
// PORT STOCK: building goods (mat t/s/m) sell everywhere, but an away port only keeps a few crates at a high price and restocks slowly;
// the HOME world keeps a big stock at the best price and restocks fast. TRADE ROUTE: set up at the home world's dock; a cargo ship
// brings ROUTE.crates every ROUTE.everyMin real minutes to YOUR planet, paid from the PLANET budget (ppStock.g) at the home price.
// Pirates hit unescorted convoys: ESCORT = none / one escort / two strong escorts (fee per run, lower risk).
// Maths (drafts, 1 crate = 10 stock): a HOUSE needs 20 timber, a TAVERN 24 timber + 10 stone, a VILLA 40 t + 40 s + 10 m.
//  · on the planet: 2 woodcutters = 0.6 timber / game hour (1 real min) → 20 timber ≈ 33 real minutes; stone + metal: none.
//  · buying out 3 away ports (2 crates each) = 60 stock = about two small buildings, at ~2.5x the home price.
//  · a route: 8 crates (80 stock) every 20 real minutes, at the home price + the escort fee.
export const BUILD_GOODS = { gaya_timber: ['t', 'TIMBER', 'gaya'], meru_stone: ['s', 'STONE', 'meru'], zion_metal: ['m', 'METAL', 'zion'] };
export const PER_CRATE = 10;
export const PORT = { homeCap: 40, homeRegenMs: 2 * 60 * 1000, awayCap: 2, awayRegenMs: 30 * 60 * 1000 };
// s599 ROUND 2: SHIPS per route: STANDARD (8 crates / 20 min) · BIG HAULER (12 crates) · FAST RUNNER (every 14 min), 120 G to switch.
// SELL ROUTE: CRYSTAL OUT: every run takes up to 4 raw crystal from the planet and sells it at CRYSTAL_PRICE each, gold to the planet.
export const SHIPS = { std: ['STANDARD HAULER', 8, 20, 0], big: ['BIG HAULER', 12, 20, 120], fast: ['FAST RUNNER', 8, 14, 120] };
export const CRYSTAL_PRICE = 25, CRYSTAL_RUN = 4;
export const ROUTE = { setup: 150, crates: 8, everyMin: 20, maxCatchUp: 6,
  escorts: [['none', 'NO ESCORT', 0, 0.30], ['one', 'ONE ESCORT', 20, 0.10], ['two', 'TWO STRONG ESCORTS', 50, 0.02]] };
const KEY = 'space.portStock.v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
const store = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
// LIVE STOCK (limited: bees, goats, sheep, camels): 3 at the home world (one more every 20 min), 1 at other ports (one every hour).
const rule = (g, port) => g.limited ? (g.home === port ? [3, 20 * 60000] : [1, 60 * 60000]) : g.home === port ? [PORT.homeCap, PORT.homeRegenMs] : [PORT.awayCap, PORT.awayRegenMs];
function rec(g, port, P = load()) { const [cap, ms] = rule(g, port), now = Date.now(), r = (P[port] || {})[g.key]; if (!r) return { n: cap, t: now, cap, ms };
  const k = Math.floor((now - r[1]) / ms), n = Math.min(cap, r[0] + Math.max(0, k)); return { n, t: n >= cap ? now : r[1] + k * ms, cap, ms }; }
// crates on sale here (Infinity = not a limited good)
export function portAvail(g, port) { return g && (g.limit || g.limited) ? rec(g, port).n : Infinity; }
export function portNext(g, port) { if (!g || !(g.limit || g.limited)) return 0; const r = rec(g, port); return r.n >= r.cap ? 0 : Math.max(0, r.t + r.ms - Date.now()); }
export function portTake(g, port) { if (!g || !(g.limit || g.limited)) return true; const P = load(), r = rec(g, port, P); if (r.n < 1) return false; (P[port] = P[port] || {})[g.key] = [r.n - 1, r.t]; store(P); return true; }
// ---- routes (save stat 'tradeRoutes': [{ good, from, escort, last, log: [] }]) ----
export const routes = save => ((save.data && save.data.stats || {}).tradeRoutes || []).slice();
export function routeFor(save, good) { return routes(save).find(r => r.good === good) || null; }
export function addRoute(save, good, escort) { const L = routes(save).filter(r => r.good !== good); L.push({ good, from: good === 'crystal' ? 'home' : BUILD_GOODS[good][2], escort, ship: 'std', last: Date.now(), log: [] }); save.setStat('tradeRoutes', L); }
export function setShip(save, good, ship) { const L = routes(save), r = L.find(q => q.good === good); if (r) { r.ship = ship; save.setStat('tradeRoutes', L); } }
export const shipOf = r => SHIPS[r.ship || 'std'] || SHIPS.std;
export function setEscort(save, good, escort) { const L = routes(save), r = L.find(q => q.good === good); if (r) { r.escort = escort; save.setStat('tradeRoutes', L); } }
export function dropRoute(save, good) { save.setStat('tradeRoutes', routes(save).filter(r => r.good !== good)); }
// run every convoy that is due: pay from planet gold, roll pirates, add stock. homePrice(goodKey) → gold per crate. Returns news lines.
export function settleRoutes(save, homePrice) {
  const L = routes(save); if (!L.length) return []; const st = { g: 0, t: 60, s: 30, m: 10, c: 8, ...((save.data.stats || {}).ppStock || {}) }, news = [], now = Date.now(), every = ROUTE.everyMin * 60000;
  const jam = !save.stat('spaceYardGuardFree', 0);
  for (const r of L) { const SH = shipOf(r), ev = SH[2] * 60000; let k = Math.floor((now - r.last) / ev); if (k < 1) continue; const last0 = r.last; r.last += k * ev; k = Math.min(k, ROUTE.maxCatchUp);
    const E = ROUTE.escorts.find(e => e[0] === r.escort) || ROUTE.escorts[0], sellR = r.good === 'crystal', [mat, nm] = sellR ? ['c', 'CRYSTAL'] : BUILD_GOODS[r.good], cost = sellR ? E[2] : SH[1] * homePrice(r.good) + E[2];
    for (let i = 0; i < k; i++) { let line; const runAt = last0 + i * ev, risk = r.safe === runAt ? 0 : r.lost === runAt ? 1 : E[3] + (jam && r.from === 'meru' ? 0.1 : 0);   /* s599 convoy calls on the map */
      if (st.g < cost) line = 'UNPAID · ' + nm + ' convoy stayed home (needs ' + cost + ' planet gold)';
      else if (sellR) { const q = Math.min(CRYSTAL_RUN, Math.floor(st.c || 0)); if (!q) line = 'EMPTY · no crystal to ship'; else { st.g -= cost; st.c -= q; if (Math.random() < risk) line = 'LOST · pirates took ' + q + ' crystal'; else { st.g += q * CRYSTAL_PRICE; line = 'SOLD · ' + q + ' crystal · +' + q * CRYSTAL_PRICE + ' planet gold'; } } }
      else { st.g -= cost; if (Math.random() < risk) line = 'LOST · pirates took the ' + nm + ' convoy'; else { st[mat] = (st[mat] || 0) + SH[1] * PER_CRATE; line = 'DELIVERED · +' + SH[1] * PER_CRATE + ' ' + nm; } }
      news.push(line); r.log = [line, ...(r.log || [])].slice(0, 5); } }
  save.setStat('tradeRoutes', L); save.setStat('ppStock', st); return news;
}
export const nextRunMs = r => Math.max(0, r.last + shipOf(r)[2] * 60000 - Date.now());
