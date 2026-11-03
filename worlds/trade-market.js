// 8 GATES · THE LIVING MARKET (s599, Ben: "take the lead and do all of these").
// · MOVING PRICES: every crate you SELL at a port pushes that good's price there down 8 % (BUY pushes it up 5 %); it drifts back 2 % a minute.
// · DEMAND EVENTS: a new event every EVENT_MIN minutes (the same for everyone at that time): a FESTIVAL (one good pays x2 at one port)
//   or a SHORTAGE (one building good sells out away from home and pays x1.6). Toasted on the map + shown at the dock.
// · PRICE MEMORY: every dock you open records the prices you saw (and when). BEST SALE for a good = the best price you remember.
// · CARGO BOOK: what you paid per crate (average) + when it was loaded, so the hold shows PAID vs WORTH and SPOILAGE can happen.
// · REPUTATION per world: crates traded there → tiers KNOWN / TRUSTED / FAVOURED: better prices (3 / 6 / 10 %) + 1 more crate of limited stock a tier.
// · CONTRACTS: 2 at every dock per window ("bring 6 MERU STONE to NEBO within 25 min · 140 G"). Take one, dock at the target with the crates.
// · FRONTIER LICENCE (bought at MERU or DEEP SPACE FOX): frontier goods sell at half price without it.
// · CONTRABAND: REAVER BULLION pays well, but patrolled docks scan you (25 %): it is seized + a fine.
// · SPOILAGE: live animals in the hold lose 1 every 15 min, ice cores melt 1 every 20 min. Grain, honey, salt, seed keep.
const K = { press: 'space.market.v1', seen: 'space.priceSeen.v1', book: 'space.holdBook.v1', rep: 'space.tradeRep.v1', con: 'space.contracts.v1', lic: 'space.licence.v1' };
const J = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }, S = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
export const EVENT_MIN = 15, SELL_DROP = 0.08, BUY_RISE = 0.05, RECOVER_PM = 0.02;
export const REP_TIERS = [[0, 'NEW', 0], [10, 'KNOWN', 0.03], [30, 'TRUSTED', 0.06], [70, 'FAVOURED', 0.10]];
export const LICENCE_COST = 250, FINE = 120, SCAN_ODDS = 0.25, CONTRABAND = new Set(['beta2_good']);
export const SPOIL = { gaya_goat: 15, shasta_sheep: 15, kufa_camel: 15, nebo_bees: 15, shasta_ice_core: 20 };   // minutes per lost crate
const PORTS = ['shasta', 'luxor', 'ur', 'gaya', 'meru', 'zion', 'nebo', 'kufa', 'jidda'];
const NAME = { shasta: 'SHASTA', luxor: 'LUXOR', ur: 'UR', gaya: 'GAYA', meru: 'MERU', zion: 'ZION', nebo: 'NEBO', kufa: 'KUFA', jidda: 'JIDDA' };
const rnd = s => { let h = s | 0; return () => { h = (h * 1664525 + 1013904223) | 0; return ((h >>> 0) % 100000) / 100000; }; };

export function createMarket({ GOODS, basePrice }) {
  const good = k => GOODS.find(g => g.key === k);
  // ---- pressure ----
  const pAll = () => J(K.press) || {};
  function press(port, k) { const r = (pAll()[port] || {})[k]; if (!r) return 0; const mins = (Date.now() - r[1]) / 60000, v = r[0]; const d = Math.max(0, Math.abs(v) - RECOVER_PM * mins); return Math.sign(v) * d; }
  function push(port, k, dv) { const P = pAll(), v = Math.max(-0.6, Math.min(0.8, press(port, k) + dv)); (P[port] = P[port] || {})[k] = [v, Date.now()]; S(K.press, P); }
  // ---- events (the same for everyone in a window) ----
  function eventAt(w) { const R = rnd(w * 7919 + 13), lux = GOODS.filter(g => !g.frontier && (g.lux || !g.mat)), mats = GOODS.filter(g => g.limit);
    if (R() < 0.65) { const g = lux[Math.floor(R() * lux.length)], port = PORTS.filter(p => p !== g.home)[Math.floor(R() * 8)]; return { w, kind: 'FESTIVAL', good: g.key, port, mult: 2, text: NAME[port] + ' FESTIVAL · ' + g.name + ' PAYS DOUBLE' }; }
    const g = mats[Math.floor(R() * mats.length)]; return { w, kind: 'SHORTAGE', good: g.key, port: '*', mult: 1.6, text: g.name + ' SHORTAGE · SOLD OUT AWAY FROM ' + NAME[g.home] + ' · PAYS x1.6' }; }
  const win = () => Math.floor(Date.now() / (EVENT_MIN * 60000));
  const event = () => eventAt(win());
  const eventLeft = () => Math.ceil(((win() + 1) * EVENT_MIN * 60000 - Date.now()) / 60000);
  function evMult(g, port, selling) { const e = event(); if (e.good !== g.key) return 1; if (e.kind === 'FESTIVAL') return e.port === port && selling ? e.mult : 1; return g.home !== port ? e.mult : 1; }
  const shortage = (g, port) => { const e = event(); return e.kind === 'SHORTAGE' && e.good === g.key && g.home !== port; };
  let lastEv = -1; function eventNews() { const w = win(); if (w === lastEv) return null; const first = lastEv < 0; lastEv = w; return first ? null : 'MARKET NEWS · ' + event().text; }
  // ---- reputation ----
  const repAll = () => J(K.rep) || {};
  const repN = port => repAll()[port] || 0;
  const tier = port => { const n = repN(port); let t = REP_TIERS[0]; for (const q of REP_TIERS) if (n >= q[0]) t = q; return { n, name: t[1], k: t[2], i: REP_TIERS.indexOf(t), next: (REP_TIERS[REP_TIERS.indexOf(t) + 1] || [null])[0] }; };
  const addRep = (port, n) => { const R = repAll(); R[port] = (R[port] || 0) + n; S(K.rep, R); };
  // ---- prices ----
  function buyPrice(g, port) { const b = basePrice(g, port), t = tier(port); return Math.max(1, Math.round(b * (1 + Math.max(0, press(port, g.key))) * (shortage(g, port) ? 1.6 : 1) * (1 - t.k))); }
  function sellPrice(g, port) { const b = basePrice(g, port), t = tier(port); let p = b * (1 + press(port, g.key)) * evMult(g, port, true) * (1 + t.k); if (g.frontier && !licence()) p *= 0.5; return Math.max(1, Math.round(p)); }
  const trend = (g, port) => { const v = press(port, g.key); return v > 0.04 ? 'UP' : v < -0.04 ? 'DOWN' : ''; };
  // ---- memory ----
  const seenAll = () => J(K.seen) || {};
  function remember(port, list) { const A = seenAll(), now = Date.now(); A[port] = A[port] || {}; for (const [k, p] of list) A[port][k] = [p, now]; S(K.seen, A); }
  function bestSale(k, here) { const A = seenAll(); let best = null; for (const port of Object.keys(A)) { if (port === here) continue; const r = A[port][k]; if (r && (!best || r[0] > best.p)) best = { port, name: NAME[port] || port.toUpperCase(), p: r[0], age: Math.round((Date.now() - r[1]) / 60000) }; } return best; }
  // ---- cargo book (paid + loaded time) ----
  const book = () => J(K.book) || {};
  function onLoad(k, price, n = 1) { const B = book(), r = B[k] || { n: 0, paid: 0, t: Date.now() }; const tot = r.paid * r.n + (price || 0) * n; r.n += n; r.paid = r.n ? tot / r.n : 0; if (r.n === n) r.t = Date.now(); B[k] = r; S(K.book, B); }
  function onUnload(k, n = 1) { const B = book(), r = B[k]; if (!r) return; r.n = Math.max(0, r.n - n); if (!r.n) delete B[k]; else B[k] = r; S(K.book, B); }
  const paid = k => { const r = book()[k]; return r ? Math.round(r.paid) : null; };
  // spoilage: returns { lost: [[k, n]], hold } and updates the book; call before showing the hold
  function spoil(hold) { const B = book(), lost = [], now = Date.now(); for (const k of Object.keys(SPOIL)) { const r = B[k]; if (!r || !hold[k]) continue; const n = Math.floor((now - r.t) / (SPOIL[k] * 60000)); if (n < 1) continue; const q = Math.min(n, hold[k]); hold[k] -= q; if (!hold[k]) delete hold[k]; r.t += n * SPOIL[k] * 60000; r.n = hold[k] || 0; if (!r.n) delete B[k]; lost.push([k, q]); } S(K.book, B); return { lost, hold }; }
  // ---- licence + contraband ----
  const licence = () => !!J(K.lic);
  const buyLicence = () => S(K.lic, { at: Date.now() });
  function scan(hold, patrolled) { const n = [...CONTRABAND].reduce((a, k) => a + (hold[k] || 0), 0); if (!n || !patrolled || Math.random() > SCAN_ODDS) return null; for (const k of CONTRABAND) { onUnload(k, hold[k] || 0); delete hold[k]; } return { n, fine: FINE }; }
  // ---- contracts ----
  const conAll = () => J(K.con) || { active: [], done: [] };
  function offers(port) { const w = Math.floor(Date.now() / (20 * 60000)), R = rnd(w * 131 + port.length * 977 + port.charCodeAt(0)), pool = GOODS.filter(g => !g.frontier && !g.limited && g.home !== port), out = [];
    for (let i = 0; i < 2; i++) { const g = pool[Math.floor(R() * pool.length)], to = PORTS.filter(p => p !== port && p !== g.home)[Math.floor(R() * 7)], n = 3 + Math.floor(R() * 5), mins = 20 + Math.floor(R() * 4) * 5, pay = Math.round(n * (basePrice(g, to) * 1.6 + 6));
      out.push({ id: port + '-' + w + '-' + i, from: port, good: g.key, name: g.name, to, toName: NAME[to], n, mins, pay }); }
    const C = conAll(); return out.filter(o => !C.active.some(a => a.id === o.id) && !C.done.includes(o.id)); }
  function take(o) { const C = conAll(); if (C.active.length >= 3) return false; C.active.push({ ...o, due: Date.now() + o.mins * 60000 }); S(K.con, C); return true; }
  const active = () => { const C = conAll(), now = Date.now(); const keep = C.active.filter(a => a.due > now), gone = C.active.length - keep.length; if (gone) { C.active = keep; S(K.con, C); } return { list: keep, expired: gone }; };
  // at a dock: deliver every active contract for this port the hold can fill → [{ c, pay }]
  function deliver(port, hold) { const C = conAll(), now = Date.now(), out = []; C.active = C.active.filter(a => { if (a.due < now) return false; if (a.to !== port || (hold[a.good] || 0) < a.n) return true; hold[a.good] -= a.n; if (!hold[a.good]) delete hold[a.good]; onUnload(a.good, a.n); out.push({ c: a, pay: a.pay }); C.done = [a.id, ...C.done].slice(0, 40); addRep(port, a.n * 2); return false; }); S(K.con, C); return out; }
  return { event, eventLeft, eventNews, buyPrice, sellPrice, trend, push, remember, bestSale, onLoad, onUnload, paid, spoil, licence, buyLicence, scan, offers, take, active, deliver, tier, addRep, shortage, NAME, good };
}
