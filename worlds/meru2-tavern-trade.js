// MERU 2.0 · s602 TAVERN TRADERS (Ben): the MERU TAVERN gets a cork NOTICE BOARD (east wall, between the darts and the jukebox) with the
// same PRIVATE DEALS as the Meru dock's trade office, and MILO (Ben's pick: a young hustler) at the east end of the bar, who now and then
// has a SPECIAL LOT only for you. Offers are TAKEN here and SETTLED AT THE DOCK (Ben): a bought lot waits in MERU DOCK STORAGE; a buyer's
// order (save stat privOrders) is paid when you dock at MERU with the crates aboard (worlds/space-map.js openMenu).
// Plugged into worlds/meru2-tavern-jobs.js (tavern's original frame, f 12..52 × -100..-60). Other worlds' taverns: same module, port = world.
import { GOODS, priceAt } from './space-trade.js?v=s601d';
import { createMarket, EVENT_MIN } from './trade-market.js?v=s599a';
import { boardAt, doneList, markDone } from './trade-private.js?v=s601d';
import { storeOne } from './trade-deals.js?v=s601d';

export function tvTrade({ THREE, G, kit, sayTo, toast, tone, save, port = 'meru', world = 'MERU', BOARD = { x: 51.86, z: -74, ry: -Math.PI / 2 }, MILO = { x: 42.4, z: -92.4 } }) {
  const INK = '#201e1d', YEL = '#ffd23a', WHITE = '#f3f2f2', BYE = 'GOODBYE', ORDER_MIN = 40;
  const MKT = createMarket({ GOODS, basePrice: priceAt });
  const offers = () => boardAt(port, { buyPrice: MKT.buyPrice, sellPrice: MKT.sellPrice, done: doneList(save), ev: { ...MKT.event(), ms: EVENT_MIN * 60000 } });
  const gold = () => (save.data && save.data.gold) || 0;
  // ---------- the notice board ----------
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 340; const g = cv.getContext('2d');
  g.fillStyle = '#b8864e'; g.fillRect(0, 0, 512, 340); for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? '#a87840' : '#c89a60'; g.fillRect(Math.random() * 512, Math.random() * 340, 3, 3); }
  g.fillStyle = INK; g.fillRect(0, 0, 512, 70); g.fillStyle = YEL; g.font = '900 44px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('PRIVATE DEALS', 18, 37);
  [[24, 92, 140, 104, -0.04], [186, 96, 150, 96, 0.03], [354, 90, 134, 110, -0.02], [60, 214, 170, 100, 0.02], [262, 218, 190, 96, -0.03]].forEach(([x, y, w, h, r], i) => { g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(r); g.fillStyle = i % 2 ? '#fff6dc' : WHITE; g.fillRect(-w / 2, -h / 2, w, h);
    g.fillStyle = INK; for (let l = 0; l < 4; l++) g.fillRect(-w / 2 + 12, -h / 2 + 22 + l * 18, w - 24 - (l === 3 ? 40 : 0), 5); g.fillStyle = '#ec3013'; g.beginPath(); g.arc(0, -h / 2 + 8, 6, 0, 7); g.fill(); g.restore(); });
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const bd = new THREE.Group(); bd.position.set(BOARD.x, 0, BOARD.z); bd.rotation.y = BOARD.ry; G.add(bd);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 0.08), new THREE.MeshLambertMaterial({ color: '#3a2618' })); frame.position.set(0, 1.75, 0); bd.add(frame);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 1.24), new THREE.MeshBasicMaterial({ map: tex })); face.position.set(0, 1.75, 0.05); bd.add(face);
  const bPivot = new THREE.Object3D(); bPivot.position.set(BOARD.x - Math.sin(-BOARD.ry) * 0.3, 1.6, BOARD.z); G.add(bPivot);   // the talk target (the dialogue turns IT, not the board)
  const bT = { key: 'tvBoard', name: 'NOTICE BOARD', role: 'PRIVATE DEALS', obj: bPivot, r: 2.6 };
  const bln = text => ({ who: 'tvBoard', role: 'PRIVATE DEALS', text });
  // ---------- Milo ----------
  const milo = kit.makeFox({ key: 'tvMilo', torso: ['#2fb5a8', '#f3f2f2', '#1f6b63'], outfit: 'vest', mood: 'smug', look: { fur: '#d98a3a', furDark: '#9a5a22' } });
  milo.position.set(MILO.x, 0, MILO.z); const RY0 = Math.atan2(32 - MILO.x, -76 - MILO.z); milo.rotation.y = RY0; G.add(milo);
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 14), new THREE.MeshBasicMaterial({ color: '#ffd23a' })); G.add(coin);
  const mT = { key: 'tvMilo', name: 'Milo', role: 'BROKER', obj: milo, ry: RY0, r: 2.6 };
  const mln = text => ({ who: 'tvMilo', role: 'BROKER', text });
  const rnd = s => { let h = s | 0; return () => { h = (h * 1664525 + 1013904223) | 0; return ((h >>> 0) % 100000) / 100000; }; };
  function special() { const w = Math.floor(Date.now() / (30 * 60000)), R = rnd(w * 6151 + 17); if (R() > 0.6) return null; const P = GOODS.filter(q => !q.frontier && !q.exportOnly && !q.limited && q.p && q.p[port] != null); if (!P.length) return null;
    const q = P[Math.floor(R() * P.length)], o = { id: 'pm' + w + port, port, kind: 'sell', who: 'MILO', why: 'off a ship that left in a hurry', good: q.key, name: q.name, n: 6 + Math.floor(R() * 7), price: Math.max(1, Math.round(MKT.buyPrice(q, port) * (0.3 + R() * 0.1))), exp: (w + 1) * 30 * 60000 };
    return doneList(save).includes(o.id) ? null : o; }
  // ---------- taking an offer (settled at the dock) ----------
  function take(o, then) { if (o.kind === 'sell') { const cost = o.price * o.n; if (gold() < cost) { then('short', cost); return; } save.spend(cost); for (let i = 0; i < o.n; i++) storeOne(save, port, o.good); markDone(save, o.id); tone(1320, 0.06, 0.3); toast('PAID ' + cost + ' G · ' + o.n + ' ' + o.name + ' WAIT IN ' + world + ' DOCK STORAGE', 3.2); then('ok'); return; }
    const L = save.stat('privOrders', null), A = Array.isArray(L) ? L.slice() : []; A.push({ id: o.id, port, good: o.good, name: o.name, n: o.n, price: o.price, who: o.who, exp: Date.now() + ORDER_MIN * 60000 }); save.setStat('privOrders', A); markDone(save, o.id); tone(990, 0.05, 0.3);
    toast('ORDER TAKEN · BRING ' + o.n + ' ' + o.name + ' TO THE ' + world + ' DOCK IN ' + ORDER_MIN + ' MIN', 3.4); then('ok'); }
  function readBoard() { const L = offers().slice(0, 4); if (!L.length) { sayTo(bT, [bln('The board is bare. New notes go up every 30 minutes.')]); return; }
    sayTo(bT, [{ ...bln('Take a note here, settle it at the ' + world + ' dock. Lots wait in dock storage.'), choices: [...L.map(o => ({ text: o.kind === 'sell' ? 'BUY ' + o.n + ' ' + o.name + ' · ' + o.price * o.n + ' G' : o.who + ': SELL ' + o.n + ' ' + o.name + ' · +' + o.price * o.n + ' G', pick: () => take(o, (r, c) => { if (r === 'short') sayTo(bT, [bln('That lot costs ' + c + ' G. You have ' + gold() + '.')]); }) })), { text: BYE, bye: true, pick: () => {} }] }]); }
  let talked = 0;
  function miloTalk() { const S = special(), first = !talked++;
    sayTo(mT, [{ ...mln(first ? 'Milo. I hear about cargo before the market does. Want the inside line?' : 'Back for the inside line?'), choices: [
      { text: 'SHOW ME THE SPECIAL', pick: () => { if (!S) { sayTo(mT, [mln('Nothing hot right now. Read the board, or come back in a bit.')]); return; }
        sayTo(mT, [{ ...mln(S.n + ' ' + S.name + ', ' + S.price + ' G a crate. ' + S.why.charAt(0).toUpperCase() + S.why.slice(1) + '. Only for you.'), choices: [
          { text: 'BUY IT · ' + S.price * S.n + ' G', pick: () => take(S, r => sayTo(mT, [mln(r === 'ok' ? 'Pleasure. It waits in ' + world + ' dock storage. Not a word to the Barkeep.' : 'You are short. Come back with gold.')])) },
          { text: BYE, bye: true, pick: () => {} }] }]); } },
      { text: 'WHAT IS ON THE BOARD?', pick: () => { const L = offers(); sayTo(mT, [mln(L.length ? 'The board by the darts has ' + L.length + ' notes. ' + (L[0].kind === 'buy' ? 'A buyer pays well.' : 'A cheap lot, too.') : 'The board is bare. Try later.')]); } },
      { text: BYE, bye: true, pick: () => {} }] }]); }
  const near = (P, x, z, r) => Math.hypot(P.x - x, P.z - z) < r && Math.abs(P.y || 0) < 1.5;
  return {
    prompt(P) { if (near(P, bPivot.position.x, bPivot.position.z, 2.2)) return 'READ · THE NOTICE BOARD'; if (near(P, milo.position.x, milo.position.z, 2.5)) return 'TALK · MILO'; return null; },
    talk(P) { if (near(P, bPivot.position.x, bPivot.position.z, 2.2)) { readBoard(); return true; } if (near(P, milo.position.x, milo.position.z, 2.5)) { miloTalk(); return true; } return false; },
    tick(dt, P) { const t = performance.now() / 1000, u = (t * 0.9) % 1, hy = 1.05 + Math.sin(u * Math.PI) * 0.45; coin.position.set(milo.position.x + Math.sin(milo.rotation.y + 0.9) * 0.32, hy, milo.position.z + Math.cos(milo.rotation.y + 0.9) * 0.32); coin.rotation.x = t * 14; }
  };
}
