// MERU 2.0 — s93 BOAT HOUSE DELUXE PART C (prizes), plugged into worlds/meru2-boat-jobs.js (Captain Ace) + worlds/meru2-jetty-jobs.js (the Fisherman).
// One prize per finished job across BOTH keepers (5 boathouse + 7 jetty = 12), in Ben's order: CAPTAIN'S HAT (1st job, worn) · SAILOR OUTFIT (3 jobs,
// worn + Tailor wardrobe) · LUCKY FLOAT CHARM (5 jobs: on your belt, +3 gold every boathouse / jetty job) · YOUR OWN SPEEDBOAT (7 jobs: Ace paints the
// lake speedboat you drive, colour pick) · NAME ON THE BEST OF THE BAY board (9 jobs, west wall) · GOLDEN ANCHOR trophy + 150 gold (11 jobs) ·
// FREE BOAT RENTAL FOREVER (all 12). Stats bhHat / bhHatOn / bhSailor / bhCharm / bhBoat / bhBoatC / bhBoard / bhAnchor / bhFreeRent.
export function bhPrizes(X) {
  const { THREE, G, box, cyl, LM, CT, save, wear, toast, ding, tone, sayTo, kT, ln, lake } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#e6b45a', NAVY = '#2e4a6b', WOOD = '#6b4f3a';
  const st = (k, d) => save.stat('bh' + k, d), set = (k, v) => save.setStat('bh' + k, v);
  const cnt = o => Object.keys(o || {}).filter(k => o[k]).length;
  const nDone = () => cnt(save.stat('bhDone', null)) + cnt(save.stat('bjDone', null));
  const name = () => { try { return (save.data.name || 'YOU').toUpperCase(); } catch (e) { return 'YOU'; } };
  const fit = (c, t, x, y, w, px, wt = 900) => { let s = px; c.font = wt + ' ' + s + 'px Archivo, sans-serif'; while (s > 10 && c.measureText(t).width > w) { s -= 2; c.font = wt + ' ' + s + 'px Archivo, sans-serif'; } c.fillText(t, x, y); };
  // ================= worn: captain's hat (head), sailor collar + neckerchief (body), lucky float (belt) =================
  const SAIL = { outfit: 'vest', torso: [WHITE, NAVY, INK], name: 'SAILOR OUTFIT' };
  const sailOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === SAIL.name); };
  const grp = () => { const g = new THREE.Group(); g.traverse(o => { o.renderOrder = 2; }); return g; };
  const hatMesh = () => { const g = grp(); cyl(g, 0.21, 0.2, 0.1, WHITE, 0, 0.36, 0.01, 14); cyl(g, 0.205, 0.205, 0.05, NAVY, 0, 0.3, 0.01, 14); box(g, 0.28, 0.025, 0.14, INK, 0, 0.27, 0.2); box(g, 0.08, 0.05, 0.012, GOLD, 0, 0.31, 0.212); return g; };
  const collarMesh = () => { const g = grp(); const b = box(g, 0.44, 0.28, 0.03, NAVY, 0, 0.9, -0.25); b.rotation.x = 0.35; box(g, 0.44, 0.025, 0.032, WHITE, 0, 0.8, -0.215).rotation.x = 0.35;
    const k = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 3), LM(RED)); k.rotation.x = Math.PI; k.position.set(0, 0.84, 0.3); g.add(k); return g; };
  const floatMesh = () => { const g = grp(); cyl(g, 0.006, 0.006, 0.12, INK, 0.3, 0.5, 0.1, 4); const a = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 6, 0, 6.3, 0, Math.PI / 2), LM(RED)), b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 6, 0, 6.3, Math.PI / 2, Math.PI / 2), LM(WHITE));
    a.position.set(0.3, 0.42, 0.1); b.position.copy(a.position); g.add(a, b); return g; };
  let worn = null;
  function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.body) return; const hat = !!(st('Hat', false) && st('HatOn', true)), k = [hat, sailOn(), !!(st('Charm', false) && st('CharmOn', true))].join('|');
    if (worn && worn.k === k && worn.P === P) return; if (worn) worn.ms.forEach(m => m.parent && m.parent.remove(m)); worn = { k, P, ms: [] };
    const put = (par, m) => { if (par) { par.add(m); worn.ms.push(m); } };
    if (hat) put(P.head, hatMesh()); if (sailOn()) put(P.body, collarMesh()); if (st('Charm', false) && st('CharmOn', true)) put(P.body, floatMesh()); }
  // ================= YOUR OWN SPEEDBOAT: the lake speedboat you drive takes the paint =================
  const PAINTS = [['RACING RED', RED], ['HARBOUR NAVY', NAVY], ['SUNNY YELLOW', YEL], ['LAKE GREEN', '#1d6b4c'], ['MIDNIGHT BLACK', '#2b2928'], ['PEARL WHITE', '#e8e4dc']];
  let paintM = null, painted = null;
  function paintTick() { const c = st('Boat', false) ? st('BoatC', null) : null; if (!c || c === painted) return; const Lk = lake && lake(), m = Lk && Lk.meshes && Lk.meshes.boat; if (!m) return;
    if (!paintM) m.traverse(o => { if (!paintM && o.isMesh && Array.isArray(o.material) && o.material.length === 3) { const mm = o.material.slice(); mm[0] = mm[0].clone(); o.material = mm; paintM = mm[0]; } });
    if (paintM) { paintM.color.set(c); painted = c; } }
  const paintPick = open => sayTo(kT, [{ ...ln(open || 'Your speedboat needs paint. Pick a colour, rookie.'), choices: [...PAINTS.map(([n, c]) => ({ text: n, pick: () => { set('BoatC', c); paintTick(); ding(); toast('YOUR SPEEDBOAT \u00b7 ' + n + ' \u00b7 SHE IS AT THE DOCK', 3); } })), { text: 'LATER', bye: true, pick: () => {} }] }]);
  // ================= BEST OF THE BAY board (west wall, high, above the course chalkboard) =================
  const BB = new THREE.Group(); BB.position.set(60.56, 4.55, 219.6); BB.rotation.y = Math.PI / 2; G.add(BB); box(BB, 3.7, 2.3, 0.05, INK, 0, 0, -0.03);
  const bbT = CT(640, 384, () => {}); { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.1), new THREE.MeshBasicMaterial({ map: bbT })); m.position.z = 0.005; BB.add(m); }
  let bbKey = '';
  function drawBoard() { const on = !!st('Board', false), nm = name(), k = on + nm; if (k === bbKey) return; bbKey = k; const c = bbT.userData.c.getContext('2d'), w = 640, h = 384;
    c.fillStyle = WHITE; c.fillRect(0, 0, w, h); c.fillStyle = NAVY; c.fillRect(0, 0, w, 64); c.fillStyle = RED; c.fillRect(0, 0, 14, 64); c.fillStyle = '#ffffff'; c.textBaseline = 'middle'; fit(c, 'SPEEDBOAT BAY \u00b7 BEST OF THE BAY', 30, 34, w - 50, 32);
    for (let i = 0; i < 8; i++) { const col = i % 2, row = i >> 1, x = 20 + col * 310, y = 92 + row * 46; c.fillStyle = INK; c.fillRect(x, y + 36, 290, 2); fit(c, String(1980 + i * 3), x, y + 18, 90, 26, 800); fit(c, 'CAPTAIN ACE', x + 100, y + 18, 190, 26); }
    const y = 290; c.fillStyle = on ? YEL : '#d6d2cb'; c.fillRect(20, y, w - 40, 72); c.fillStyle = INK; c.fillRect(20, y, 12, 72); fit(c, 'THIS YEAR', 46, y + 22, 200, 22, 800); fit(c, on ? nm + ' \u00b7 HARBOUR CREW' : '?  \u00b7  9 JOBS FOR ACE + THE FISHERMAN', 46, y + 52, w - 90, 30); bbT.needsUpdate = true; }
  drawBoard();
  // ================= GOLDEN ANCHOR on a plinth by the trophy wall =================
  const AN = new THREE.Group(); AN.position.set(61.5, 0, 216.6); G.add(AN); box(AN, 0.62, 1.0, 0.62, INK, 0, 0.5, 0); box(AN, 0.66, 0.05, 0.66, GOLD, 0, 1.02, 0);
  { const a = new THREE.Group(); a.position.y = 1.05; a.rotation.y = Math.PI / 2; AN.add(a); cyl(a, 0.03, 0.03, 0.62, GOLD, 0, 0.36, 0, 8); box(a, 0.34, 0.05, 0.05, GOLD, 0, 0.56, 0);
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 6, 12), LM(GOLD)); r.position.y = 0.72; a.add(r); const arc = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.028, 6, 16, Math.PI), LM(GOLD)); arc.rotation.z = Math.PI; arc.position.y = 0.3; a.add(arc);
    for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), LM(GOLD)); f.position.set(s * 0.24, 0.34, 0); a.add(f); } }
  X.cols && X.cols.push({ c: [61.5, 216.6, 0.45], get on() { return AN.visible; } });
  // ================= prizes =================
  const LINES = {
    hat: ["A captain's hat, rookie. You earned the peak.", "CAPTAIN'S HAT"],
    sailor: ['Sailor whites. The Tailor keeps a set for you too.', 'SAILOR OUTFIT'],
    charm: ['My lucky float. Eight summers afloat. Plus 3 gold a job now.', 'LUCKY FLOAT CHARM'],
    boat: ['The speedboat is yours now. She needs a coat of paint.', 'YOUR OWN SPEEDBOAT'],
    board: ['Your name is up on the Best of the Bay board. Next to mine.', 'NAME ON THE BAY BOARD'],
    anchor: ['Eleven jobs. The golden anchor, and 150 gold. One to go.', 'GOLDEN ANCHOR + 150 GOLD'],
    rent: ['All twelve jobs. Boats are free for you, forever.', 'FREE BOAT RENTAL FOREVER'] };
  const FISH = { hat: 'Ace saw that. A captain\'s hat for you, friend.', boat: 'That speedboat is yours, friend. Ace has the paint pots.', board: 'Ace put your name on his board. Best of the Bay!', charm: 'Ace\'s lucky float. Plus 3 gold a job, friend.' };
  const line = (k, who) => { const L = LINES[k]; return L ? [who === 'fish' && FISH[k] ? FISH[k] : L[0], L[1]] : null; };
  function gift() { const n = nDone();
    if (!st('Hat', false)) { set('Hat', true); set('HatOn', true); return 'hat'; }
    if (n >= 3 && !st('Sailor', false)) { set('Sailor', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SAIL.name)) save.setStat('tailorOutfits', [...list, SAIL]); save.setOutfit && save.setOutfit(SAIL); wear && wear(SAIL); return 'sailor'; }
    if (n >= 5 && !st('Charm', false)) { set('Charm', true); save.give && save.give('luckyFloat'); return 'charm'; }
    if (n >= 7 && !st('Boat', false)) { set('Boat', true); return 'boat'; }
    if (n >= 9 && !st('Board', false)) { set('Board', true); drawBoard(); return 'board'; }
    if (n >= 11 && !st('Anchor', false)) { set('Anchor', true); save.give && save.give('goldenAnchor'); save.addGold(150); return 'anchor'; }
    if (n >= 12 && !st('FreeRent', false)) { set('FreeRent', true); save.setStat('m2BoatRented', true); return 'rent'; }
    return null; }
  // called by both keepers when a job is finished: the lucky float pays first, then the next prize
  function onFinish() { const lucky = st('Charm', false) ? 3 : 0; if (lucky) save.addGold(lucky); const gf = gift(); if (gf) { ding(); tone(1318, 0.05, 0.6, 'triangle', 0.15); } return { gf, lucky }; }
  const needPaint = () => !!st('Boat', false) && !st('BoatC', null);
  function perks() { const own = [['HAT', st('Hat', false)], ['SAILOR OUTFIT', st('Sailor', false)], ['LUCKY FLOAT', st('Charm', false)], ['SPEEDBOAT', st('Boat', false)], ['BAY BOARD', st('Board', false)], ['GOLDEN ANCHOR', st('Anchor', false)], ['FREE RENTAL', st('FreeRent', false)]].filter(q => q[1]).map(q => q[0].toLowerCase());
    const ch = []; if (st('Hat', false)) ch.push({ text: st('HatOn', true) ? 'HAT OFF' : 'HAT ON', pick: () => { set('HatOn', !st('HatOn', true)); toast(st('HatOn', true) ? "CAPTAIN'S HAT ON" : "CAPTAIN'S HAT OFF", 1.6); } });
    if (st('Charm', false)) ch.push({ text: st('CharmOn', true) ? 'FLOAT OFF' : 'FLOAT ON', pick: () => { set('CharmOn', !st('CharmOn', true)); toast(st('CharmOn', true) ? 'LUCKY FLOAT ON' : 'LUCKY FLOAT OFF', 1.6); } });
    if (st('Boat', false)) ch.push({ text: 'REPAINT MY SPEEDBOAT', pick: () => paintPick('New colour for your boat? Pick one.') });
    sayTo(kT, [{ ...ln(own.length ? 'Yours so far: ' + own.join(', ') + '.' : 'Work the harbour and the prizes come, rookie.'), choices: [...ch, { text: 'GOODBYE', bye: true, pick: () => {} }] }]); }
  let rT = 0;
  function tick(dt, fox) { applyWear(fox); paintTick(); if ((rT -= dt) <= 0) { rT = 1.5; drawBoard(); AN.visible = !!st('Anchor', false); } }
  AN.visible = !!st('Anchor', false);
  return { gift, onFinish, line, perks, tick, applyWear, paintPick, needPaint, freeRent: () => !!st('FreeRent', false), nDone, drawBoard };
}
