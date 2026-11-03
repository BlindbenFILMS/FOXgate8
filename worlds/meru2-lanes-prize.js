// MERU 2.0 — s116 MERU LANES DELUXE PART C1: PRIZES (Ben's answers s114), plugged into worlds/meru2-lanes-jobs.js as PZ.
// One prize per finished job, in this order: LEAGUE SHIRT (1 job, worn, the Tailor keeps it) · YOUR OWN BALL (2: pick its colour, the tenpin ball takes it)
// · LUCKY BOWLING SHOES (4: worn in the hall, tenpin pays +50% gold) · FREE DINER FOOD (6) · NAME ON THE HONOUR BOARD (8) · GLOW BOWLING (10: unlock flag,
// the switch + the cosmic look come in part C2) · GOLDEN PIN TROPHY + 100 gold (all 11). Also: the HONOUR BOARD (west wall) + the DINER counter menu.
export function lnPrizes(X) {
  const { THREE, G, box, cyl, LM, CT, save, heal, wear, toast, ding, tone, done, GAMES, sayTo, kT, ln, lanes, CHOICE_BYE, inRoom } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#e6b45a';
  const st = (k, d) => save.stat('mln' + k, d), set = (k, v) => save.setStat('mln' + k, v);
  const nDone = () => { const d = done(); return GAMES.filter(q => d[q.k]).length; };
  const name = () => { try { return (save.data.name || 'YOU').toUpperCase(); } catch (e) { return 'YOU'; } };
  const fit = (c, t, x, y, maxW, fs, wt = 900) => { let f = fs; do { c.font = wt + ' ' + f + 'px Archivo, sans-serif'; f -= 2; } while (f > 10 && c.measureText(t).width > maxW); c.fillText(t, x, y); };
  // ================= LEAGUE SHIRT (worn) + LUCKY SHOES (worn while in the hall) =================
  const SHIRT = { outfit: 'vest', torso: ['#38bdf8', '#201e1d', '#0c4a6e'], name: 'LEAGUE SHIRT' };
  const shirtOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === SHIRT.name); };
  const backT = CT(256, 96, (c, w, h) => { c.fillStyle = '#38bdf8'; c.fillRect(0, 0, w, h); c.fillStyle = INK; c.textBaseline = 'middle'; fit(c, 'MERU LANES', 14, 34, w - 28, 40); c.fillStyle = RED; c.fillRect(14, 62, w - 28, 8); });
  const shirtMesh = () => { const g = new THREE.Group(); box(g, 0.1, 0.1, 0.02, RED, -0.14, 0.95, 0.31); box(g, 0.06, 0.06, 0.025, WHITE, -0.14, 0.95, 0.315);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.16), new THREE.MeshBasicMaterial({ map: backT })); b.position.set(0, 0.9, -0.31); b.rotation.y = Math.PI; g.add(b); return g; };
  const shoeMesh = () => { const g = new THREE.Group(); box(g, 0.15, 0.08, 0.28, RED, 0, -0.46, 0.05); box(g, 0.155, 0.025, 0.29, WHITE, 0, -0.495, 0.05); box(g, 0.152, 0.03, 0.08, '#2e4a6b', 0, -0.44, 0.12); return g; };
  let worn = null;
  function applyWear(fox, inHall) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.body) return; const on = shirtOn(), sh = !!st('Shoes', false) && inHall, legs = P.legs || [];
    if (worn && worn.fox === fox && worn.on === on && worn.sh === sh && (!worn.m || worn.m.parent === P.body)) return;
    if (worn) { if (worn.m && worn.m.parent) worn.m.parent.remove(worn.m); worn.s.forEach(m => m.parent && m.parent.remove(m)); }
    worn = { fox, on, sh, m: null, s: [] }; if (on) { worn.m = shirtMesh(); P.body.add(worn.m); } if (sh) legs.forEach(l => { const m = shoeMesh(); l.add(m); worn.s.push(m); }); }
  // ================= HONOUR BOARD (west wall, between the window and the clock) + the golden pin on its shelf =================
  const HB = { x: 105.4, y: 3.2, z: -30.5 }, HW = 2.4, HH = 1.3;
  const hbG = new THREE.Group(); hbG.position.set(HB.x, HB.y, HB.z); hbG.rotation.y = Math.PI / 2; G.add(hbG); box(hbG, HW + 0.12, HH + 0.12, 0.05, INK, 0, 0, 0);
  const hbT = CT(768, 416, () => {}); { const m = new THREE.Mesh(new THREE.PlaneGeometry(HW, HH), new THREE.MeshBasicMaterial({ map: hbT })); m.position.z = 0.03; hbG.add(m); }
  box(hbG, HW, 0.05, 0.24, INK, 0, -HH / 2 - 0.08, 0.12);
  const PIN = new THREE.Group(); { const pts = [[0, 0], [0.05, 0], [0.075, 0.06], [0.08, 0.13], [0.06, 0.2], [0.032, 0.25], [0.035, 0.29], [0.045, 0.32], [0.035, 0.36], [0, 0.375]].map(([x, y]) => new THREE.Vector2(x * 1.6, y * 1.6));
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), new THREE.MeshPhongMaterial({ color: GOLD, shininess: 120, specular: 0xffe7a0 })); PIN.add(m); cyl(PIN, 0.11, 0.13, 0.06, INK, 0, -0.03, 0, 12); }
  PIN.position.set(0.85, -HH / 2 - 0.03, 0.14); hbG.add(PIN); PIN.visible = false;
  let hbKey = '';
  function drawBoard() { const house = Math.max(212, st('House', 0) || 0), mine = (st('House', 0) || 0) > 212, rook = !!st('Rook', false), lw = st('LeagueW', 0) || 0, best = save.stat('meru.bowling.best', 0) || 0,
      dr = ['7-10 SPLIT', '10 PIN', '7 PIN', 'THE BUCKET', 'BABY SPLIT'].filter(n => (st('Drill_' + n.replace(/[^A-Z0-9]/g, ''), 0) || 0) >= 3).length, nb = !!st('Board', false), gp = !!st('GoldPin', false);
    const k = [house, mine, rook, lw, best, dr, nb, gp, name()].join('|'); if (k === hbKey) return; hbKey = k; const c = hbT.userData.c.getContext('2d'), w = 768, h = 416;
    c.fillStyle = '#0e1230'; c.fillRect(0, 0, w, h); c.fillStyle = RED; c.fillRect(0, 0, w, 58); c.fillStyle = WHITE; c.textBaseline = 'middle'; fit(c, 'MERU LANES \u00b7 HONOUR BOARD', 18, 30, w - 36, 34);
    const rowY = 92; const rows = [['HOUSE RECORD', house + ' \u00b7 ' + (mine ? name() : 'NERA')], ['BEST GAME', best ? best + ' \u00b7 ' + name() : '\u2014'], ['BEAT ROOK (147)', rook ? name() : '\u2014'],
      ['LEAGUE NIGHT WINS', String(lw)], ['SPARE DRILLS', dr + ' / 5'], ['STAFF OF THE LANES', nb ? name() : '8 JOBS FOR MOTT']];
    rows.forEach(([a, b], i) => { const y = rowY + i * 52; c.fillStyle = 'rgba(56,189,248,0.35)'; c.fillRect(18, y + 24, w - 36, 2); c.fillStyle = '#9fb3d9'; fit(c, a, 22, y, 330, 26, 800); c.fillStyle = (i === 5 ? nb : b !== '\u2014' && b !== '0' && b !== '0 / 5') ? YEL : WHITE; c.textAlign = 'right'; fit(c, b, w - 22, y, 380, 30); c.textAlign = 'left'; });
    hbT.needsUpdate = true; PIN.visible = gp; }
  drawBoard();
  // ================= YOUR OWN BALL (colour pick; the 3D tenpin reads mlnBallCol) =================
  const COLS = [['PURPLE', '#7c3aed'], ['RED', RED], ['SKY BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PINK', '#f472b6']];
  const pickBall = (open) => sayTo(kT, [{ ...ln(open || 'Your ball. Pick a colour, and it rolls for you on lane four.'), choices: [...COLS.map(([n, c]) => ({ text: n + (st('BallCol', null) === c ? ' \u2713' : ''), pick: () => { set('BallCol', c); ding(); toast('YOUR BALL \u00b7 ' + n + ' \u00b7 IT ROLLS ON LANE 4', 2.4); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  // ================= THE DINER counter (south wall): menu, heals; FREE once you have the prize =================
  const MENU = [['PIN BURGER', 6, 30], ['STRIKE DOG', 4, 20], ['SPARE FRIES', 3, 15], ['SODA', 2, 10], ['SHAKE', 3, 15], ['ROOT FLOAT', 3, 15]];
  const DN = { x: 132, z: 7.6 }, server = (lanes && lanes.npcs || []).find(f => f && f.position && Math.abs(f.position.x - 135.5) < 0.6 && Math.abs(f.position.z - 8.3) < 0.6) || null;
  const dT = { key: 'lnDiner', name: 'Diner', role: 'MERU LANES DINER', obj: server, ry: server ? server.rotation.y : Math.PI, r: 6 }, dl = text => ({ who: 'lnDiner', role: dT.role, text });
  { const r1 = cyl(G, 0.5, 0.5, 0.012, '#52e3ff', DN.x, 0.09, DN.z, 22), r2 = cyl(G, 0.42, 0.42, 0.014, INK, DN.x, 0.092, DN.z, 22); r1.renderOrder = r2.renderOrder = 2; }
  const atDiner = P => Math.hypot(P.x - DN.x, P.z - DN.z) < 1.1;
  function order(i) { const [n, p, hp] = MENU[i], free = !!st('Food', false); if (!free && !(save.spend && save.spend(p))) { sayTo(dT, [dl(n.charAt(0) + n.slice(1).toLowerCase() + ' is ' + p + ' gold, hon.')]); return; }
    if (heal) heal(hp); tone(523, 0.04, 0.2); tone(784, 0.03, 0.25, 'sine', 0.1); toast(n + (free ? ' \u00b7 ON THE HOUSE' : ' \u00b7 ' + p + ' G') + ' \u00b7 +' + hp + ' HP', 2.2); }
  function diner() { const free = !!st('Food', false); sayTo(dT, [{ ...dl(free ? 'Staff eat free. What will it be?' : 'What can I get you?'), choices: [...MENU.map((m, i) => ({ text: m[0] + ' \u00b7 ' + (free ? 'FREE' : m[1] + ' G'), pick: () => order(i) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  // ================= prizes (one per finish) =================
  const LINES = {
    shirt: ['League shirt. You are on the team now. The Tailor keeps one too.', 'LEAGUE SHIRT'],
    ball: ['Your own ball. Pick the colour.', 'YOUR OWN BALL'],
    shoes: ['Lucky shoes. Wear them on the lanes. Games pay more.', 'LUCKY BOWLING SHOES'],
    food: ['The diner feeds staff for free now. Eat up.', 'FREE DINER FOOD'],
    board: ['Your name is on the honour board. Staff of the lanes.', 'NAME ON THE HONOUR BOARD'],
    glow: ['Glow bowling is yours. The GLOW switch is on my desk.', 'GLOW BOWLING UNLOCKED'],
    gold: ['Every job in the house. The golden pin, and 100 gold.', 'GOLDEN PIN TROPHY + 100 GOLD'] };
  function gift() { const nd = nDone();
    if (!st('Shirt', false)) { set('Shirt', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SHIRT.name)) save.setStat('tailorOutfits', [...list, SHIRT]); save.setOutfit && save.setOutfit(SHIRT); wear && wear(SHIRT); return 'shirt'; }
    if (nd >= 2 && !st('Ball', false)) { set('Ball', true); return 'ball'; }
    if (nd >= 4 && !st('Shoes', false)) { set('Shoes', true); return 'shoes'; }
    if (nd >= 6 && !st('Food', false)) { set('Food', true); return 'food'; }
    if (nd >= 8 && !st('Board', false)) { set('Board', true); drawBoard(); return 'board'; }
    if (nd >= 10 && !st('Glow', false)) { set('Glow', true); return 'glow'; }
    if (nd >= GAMES.length && !st('GoldPin', false)) { set('GoldPin', true); save.give && save.give('goldenPin'); save.addGold(100); drawBoard(); return 'gold'; }
    return null; }
  // after the prize line, the ball prize goes straight to the colour pick
  const thankLine = gf => { if (gf === 'ball') { pickBall(LINES.ball[0]); return true; } return false; };
  function prizes() { const have = [['SHIRT', 'Shirt'], ['BALL', 'Ball'], ['SHOES', 'Shoes'], ['DINER FOOD', 'Food'], ['BOARD', 'Board'], ['GLOW', 'Glow'], ['GOLDEN PIN', 'GoldPin']].filter(([, k]) => st(k, false)).map(([n]) => n);
    const ch = []; if (st('Ball', false)) ch.push({ text: 'CHANGE MY BALL COLOUR', pick: () => pickBall() }); ch.push({ text: CHOICE_BYE, bye: true, pick: () => {} });
    sayTo(kT, [{ ...ln(have.length ? 'Yours so far: ' + have.join(', ').toLowerCase() + '.' : 'Nothing yet. Work for me and the prizes come.'), choices: ch }]); }
  // ================= per frame =================
  let rT = 0;
  function tick(dt, P, fox) { applyWear(fox, inRoom(P)); if ((rT -= dt) <= 0) { rT = 1.5; drawBoard(); } }
  return { gift, line: k => LINES[k], thankLine, prizes, pickBall, tick, applyWear, drawBoard, atDiner: P => atDiner(P), diner, COLS };
}
