// MERU 2.0 — s85 APARTMENTS PART C (prizes + look). Plugged into worlds/meru2-apts-jobs.js, one call per building (key 'crest' | 'lake').
// PRIZES (one per finished job, in this order): CARETAKER OVERALLS + TOOL BELT (first job anywhere, worn, Tailor keeps them) ·
// RIDE-ON MOWER (after 3 mows here; the lawn job then rides, wider cut) · SPARE KEY (3 jobs: the BACK DOOR by the lift, in + out) ·
// GUEST BED (5 jobs: rest = full heal once a game day, keeper menu) · RENT SHARE (8 jobs: collect 25 gold a game day) ·
// GOLDEN CARETAKER KEY + 100 gold (every job here; the key hangs by the BEST board). BUY YOUR OWN FLAT any time: flat 105 (floor 1),
// 300 gold at Crestview / 400 at Lakeside → HOME plate + doormat, the bed = REST any time.
// LOOK: the lobby NOTICE BOARD (lost cat / found, a party, flat for sale / welcome, a club night; E reads it) · BALCONY TENANTS by time of day.
export function aptPrizes(X) {
  const { THREE, G, key, KP, W, UV, V3, YAW, RY0, hu, hv, GY, FY, CT, fitTxt, LM, kit, save, heal, wear, toast, ding, coin, tone, done, GAMES, clk, inBld, BALS, job, sayTo, kT, ln, hour, pre, rectC, touch } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#c9a227', lake = key === 'lake';
  const st = (k, d) => save.stat(pre + k, d), set = (k, v) => save.setStat(pre + k, v), day = () => Math.floor(clk() / 24);
  const nDone = () => { const d = done(); return GAMES.filter(q => d[q.k]).length; };
  const PRICE = lake ? 400 : 300, FLAT = 105;
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 10) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const frame = (par, u, y, v, ry = RY0) => { const g = new THREE.Group(); const [x, z] = W(u, v); g.position.set(x, y, z); g.rotation.y = ry; par.add(g); return g; };
  const near = (P, u, v, y, r = 1.3) => { const [x, z] = W(u, v); return Math.hypot(P.x - x, P.z - z) < r && Math.abs((P.y || 0) - y) < 1.6; };
  // ================= the overalls + tool belt (worn) =================
  const OVR = { outfit: 'vest', torso: ['#3d6a9e', '#2a4a72', '#1a2a3e'], name: 'CARETAKER OVERALLS' };
  const ovOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === OVR.name); };
  const beltMesh = () => { const g = new THREE.Group(), LEA = '#6b4a2a';
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 6, 26), LM(LEA)); band.rotation.x = Math.PI / 2; band.scale.set(1, 1.12, 1); band.position.y = 0.6; g.add(band);
    box(g, 0.1, 0.08, 0.03, GOLD, 0, 0.6, 0.345);
    for (const s of [-1, 1]) { box(g, 0.13, 0.15, 0.07, LEA, s * 0.19, 0.5, 0.29); box(g, 0.135, 0.04, 0.075, '#4a311e', s * 0.19, 0.57, 0.29); }
    const hm = new THREE.Group(); hm.position.set(0.33, 0.5, 0.05); hm.rotation.z = 0.12; g.add(hm); cyl(hm, 0.018, 0.018, 0.3, '#b8864f', 0, -0.06, 0, 6); box(hm, 0.06, 0.06, 0.16, '#5c6670', 0, 0.1, 0);
    const wr = new THREE.Group(); wr.position.set(-0.33, 0.48, 0.05); wr.rotation.z = -0.1; g.add(wr); box(wr, 0.03, 0.26, 0.04, '#9aa0a6', 0, 0, 0); { const t = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.014, 5, 10, 4.6), LM('#9aa0a6')); t.position.y = 0.14; t.rotation.y = Math.PI / 2; wr.add(t); }
    g.traverse(o => { o.renderOrder = 2; }); return g; };
  let worn = null;
  function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.body) return; const on = ovOn();
    if (worn && worn.on === on && worn.fox === fox && (!worn.m || worn.m.parent === P.body)) return; if (worn && worn.m && worn.m.parent) worn.m.parent.remove(worn.m); worn = { on, fox, m: null }; if (!on) return; const m = beltMesh(); P.body.add(m); worn.m = m; }
  // ================= the RIDE-ON mower (prize; parked where the push mower was) =================
  const RM = new THREE.Group(); RM.visible = false; G.add(RM);
  { const GR = '#2f7a4a'; box(RM, 0.9, 0.3, 1.5, GR, 0, 0.42, 0.05); box(RM, 1.05, 0.08, 0.9, '#3d3b3a', 0, 0.2, 0.25); box(RM, 0.86, 0.22, 0.5, GR, 0, 0.6, 0.62); box(RM, 0.6, 0.06, 0.06, YEL, 0, 0.66, 0.88);
    box(RM, 0.5, 0.1, 0.42, INK, 0, 0.66, -0.3); box(RM, 0.5, 0.42, 0.08, INK, 0, 0.88, -0.52);
    const col = cyl(RM, 0.025, 0.025, 0.5, '#9aa0a6', 0, 0.85, 0.28, 6); col.rotation.x = -0.5; const wh = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 6, 16), LM(INK)); wh.position.set(0, 1.07, 0.16); wh.rotation.x = -1.1; RM.add(wh);
    for (const [x, z, r] of [[-0.48, 0.55, 0.17], [0.48, 0.55, 0.17], [-0.5, -0.45, 0.26], [0.5, -0.45, 0.26]]) { const w = cyl(RM, r, r, 0.16, INK, x, r, z, 14); w.rotation.z = Math.PI / 2; const hb = cyl(RM, r * 0.45, r * 0.45, 0.17, YEL, x, r, z, 10); hb.rotation.z = Math.PI / 2; } }
  const ride = () => !!st('Ride', false);
  // ================= the BACK DOOR (spare key): mailbox-side wall by the lift =================
  const BDU = -9.5, BV = -hv;
  { const g = frame(G, BDU, 0, BV + 0.24, YAW(0, 1)); box(g, 1.3, 2.5, 0.06, lake ? '#3d3b3a' : '#5a3d26', 0, 1.25, 0); box(g, 1.5, 0.12, 0.1, lake ? '#c0c4cc' : GOLD, 0, 2.56, 0); cyl(g, 0.04, 0.04, 0.08, GOLD, 0.48, 1.1, 0.06, 8).rotation.x = Math.PI / 2;
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), new THREE.MeshBasicMaterial({ map: CT(256, 64, (c, w, h) => { c.fillStyle = INK; c.fillRect(0, 0, w, h); c.fillStyle = WHITE; c.textBaseline = 'middle'; fitTxt(c, 'BACK DOOR \u00b7 KEY', 12, h / 2 + 2, w - 24, 30); }) })); pl.position.set(0, 2.15, 0.04); g.add(pl);
    const o = frame(G, BDU, GY, BV - 0.06, YAW(0, -1)); box(o, 1.3, 2.5, 0.06, lake ? '#3d3b3a' : '#5a3d26', 0, 1.25, 0); box(o, 1.5, 0.12, 0.1, lake ? '#c0c4cc' : GOLD, 0, 2.56, 0); box(o, 1.6, 0.08, 1.0, '#9a948a', 0, 0.04, 0.5); cyl(o, 0.04, 0.04, 0.08, GOLD, -0.48, 1.1, 0.06, 8).rotation.x = Math.PI / 2; }
  // ================= flat 105 (yours): HOME plate + doormat in the hall, a rest ring by the bed =================
  const FL1 = new THREE.Group(); FL1.visible = false; G.add(FL1); const Y1 = FY[1];
  const homeT = CT(256, 72, (c, w, h) => { c.fillStyle = GOLD; c.fillRect(0, 0, w, h); c.strokeStyle = INK; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = INK; c.textBaseline = 'middle'; fitTxt(c, 'HOME', 16, h / 2 + 2, w - 32, 40); });
  const homeP = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.14), new THREE.MeshBasicMaterial({ map: homeT })); { const [x, z] = W(0.25, 2 - 0.15); homeP.position.set(x, Y1 + 1.36, z); homeP.rotation.y = YAW(0, -1); FL1.add(homeP); }
  const mat = frame(FL1, -1, Y1 + 0.05, 1.35); box(mat, 1.2, 0.02, 0.7, KP.color, 0, 0, 0); box(mat, 1.0, 0.024, 0.5, lake ? '#c0c4cc' : GOLD, 0, 0, 0);
  const bedR = frame(FL1, 1.0, Y1 + 0.05, 7.6); cyl(bedR, 0.5, 0.5, 0.012, YEL, 0, 0, 0, 22); cyl(bedR, 0.42, 0.42, 0.014, INK, 0, 0.002, 0, 22);
  const ownF = () => !!st('Flat', false);
  // ================= golden key on the wall by the BEST board =================
  const GK = frame(G, hu - 0.45, 3.45, 8.9, YAW(-1, 0)); { const gm = '#e6b45a'; const r = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.04, 8, 18), LM(gm)); r.position.y = 0.2; GK.add(r); box(GK, 0.05, 0.42, 0.05, gm, 0, -0.1, 0); box(GK, 0.12, 0.05, 0.05, gm, 0.06, -0.24, 0); box(GK, 0.09, 0.05, 0.05, gm, 0.045, -0.12, 0); box(GK, 0.5, 0.7, 0.03, INK, 0, 0.03, -0.04); }
  GK.visible = !!st('All', false);
  // ================= NOTICE BOARD (lobby, mailbox wall) =================
  const NBU = 4.6, NBV = -hv + 0.3, NB = frame(G, NBU, 1.75, NBV, YAW(0, 1));
  box(NB, 1.7, 1.2, 0.06, lake ? '#5c6670' : '#5a3d26', 0, 0, -0.03);
  const nbT = CT(512, 352, () => {}), nbM = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 1.07), new THREE.MeshBasicMaterial({ map: nbT })); nbM.position.z = 0.005; NB.add(nbM);
  const notes = () => { const d = done(), who = KP.name.toUpperCase();
    return [d.cat ? ['BISCUIT IS HOME!', 'THANK YOU, NEIGHBOUR', '#2f7a4a'] : ['LOST CAT: BISCUIT', 'GINGER \u00b7 SEE ' + who, RED],
      ownF() ? ['WELCOME, NEIGHBOUR!', 'FLAT ' + FLAT + ' IS SOLD', GOLD] : ['FLAT ' + FLAT + ' FOR SALE', PRICE + ' GOLD \u00b7 ASK ' + who, '#2f6fd6'],
      lake ? ['LAWN YOGA', 'SUNDAY 8 AM', '#f472b6'] : ['GARDEN PARTY', 'SATURDAY \u00b7 TEA + CAKE', '#f472b6'],
      lake ? ['GAME NIGHT', 'FRIDAY \u00b7 FLAT 203', YEL] : ['BOOK CLUB', 'THURSDAY \u00b7 FLAT 102', YEL]]; };
  let nbKey = '';
  function drawBoard() { const N = notes(), k = N.map(n => n[0]).join('|'); if (k === nbKey) return; nbKey = k; const c = nbT.userData.c.getContext('2d'), w = 512, h = 352;
    c.fillStyle = '#b8864f'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,0.08)'; for (let i = 0; i < 260; i++) c.fillRect((i * 97) % w, (i * 53) % h, 3, 3);
    c.fillStyle = INK; c.fillRect(0, 0, w, 50); c.fillStyle = WHITE; c.textBaseline = 'middle'; fitTxt(c, 'NOTICE BOARD', 16, 27, w - 32, 30);
    N.forEach((n, i) => { const x = 14 + (i % 2) * 250, y = 62 + (i / 2 | 0) * 144, rot = ((i * 37) % 5 - 2) * 0.012; c.save(); c.translate(x + 117, y + 66); c.rotate(rot); c.translate(-117, -66);
      c.fillStyle = WHITE; c.fillRect(0, 0, 234, 132); c.fillStyle = n[2]; c.fillRect(0, 0, 234, 14); c.fillStyle = INK; c.textBaseline = 'middle'; fitTxt(c, n[0], 10, 54, 214, 26); fitTxt(c, n[1], 10, 96, 214, 18, 800);
      c.fillStyle = RED; c.beginPath(); c.arc(117, 8, 7, 0, 7); c.fill(); c.restore(); });
    nbT.needsUpdate = true; }
  drawBoard();
  // ================= BALCONY TENANTS (by time of day) =================
  const TEN = [kit.makeFox({ key: 'apBal1' + key, torso: lake ? ['#f3f2f2', '#2e4a6b', INK] : ['#8f3445', '#e9dcc4', '#3d1a22'], outfit: 'coat', mood: 'happy', look: lake ? {} : { elder: 1 } }),
    kit.makeFox({ key: 'apBal2' + key, torso: lake ? ['#ffd23a', '#5c6670', INK] : ['#3f7a52', '#e9dcc4', '#22382a'], outfit: 'vest', mood: 'happy' })];
  const MUG = new THREE.Group(); cyl(MUG, 0.05, 0.045, 0.1, WHITE, 0, 0, 0, 10); cyl(MUG, 0.042, 0.042, 0.005, '#5a361b', 0, 0.048, 0, 10);
  TEN.forEach(f => { f.visible = false; f.scale.multiplyScalar(0.95); });
  const slot = h => (h >= 7 && h < 10 ? [0, 3] : h >= 12 && h < 16 ? [-1, 1] : h >= 17 && h < 21.5 ? [2, 1] : [-1, -1]);
  let balKey = '';
  function balTick(dt, P) { const h = hour ? hour() : 12, J = job(), [a, b] = slot(h), [pu, pv] = UV(P.x, P.z), far = Math.hypot(pu - hu, pv) > (touch ? 55 : 90);
    const show = !J && !inBld(P) && !far && BALS && BALS.length === 4, k = show ? a + '|' + b : 'off';
    if (k !== balKey) { balKey = k; [a, b].forEach((bi, i) => { const f = TEN[i]; if (!show || bi < 0) { f.visible = false; return; } const B = BALS[bi]; B.g.add(f); f.position.set(i ? -0.6 : 0.55, 0.0, 0.72); f.rotation.set(0, i ? 0.35 : -0.25, 0); f.visible = true;
      if (i === 0 && a === 0) { const P0 = f.userData && f.userData.P, arm = P0 && P0.arms && P0.arms[1]; if (arm) { arm.add(MUG); MUG.position.set(0, -0.42, 0.1); } } else if (MUG.parent && i === 0) MUG.parent.remove(MUG); }); }
    if (show) TEN.forEach(f => { if (f.visible) kit.animFox(f, dt, 0, false); }); }
  // ================= prizes (one per finish) =================
  const LINES = {
    overalls: ['Your caretaker overalls and tool belt. The Tailor keeps them too.', 'OVERALLS + TOOL BELT'],
    ride: ['Three lawns! From now on you ride the mower.', 'RIDE-ON MOWER'],
    key: ['A spare key for you. The back door by the lift.', 'SPARE KEY \u00b7 BACK DOOR'],
    rest: ['Tired? The guest bed is yours once a day. Just ask.', 'GUEST BED \u00b7 DAILY REST'],
    rent: ['Head caretaker now! A share of the rent, every day. Ask me.', 'RENT \u00b7 25 GOLD A DAY'],
    all: ['Every job done! The golden key of ' + (lake ? 'Lakeside' : 'Crestview') + ', and 100 gold.', 'GOLDEN CARETAKER KEY + 100 GOLD'] };
  function gift(g) { if (g === 'lawn') set('Mows', st('Mows', 0) + 1); const nd = nDone();
    if (!save.stat('apOveralls', false)) { save.setStat('apOveralls', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === OVR.name)) save.setStat('tailorOutfits', [...list, OVR]);
      save.setOutfit && save.setOutfit(OVR); wear && wear(OVR); return 'overalls'; }
    if (st('Mows', 0) >= 3 && !ride()) { set('Ride', true); return 'ride'; }
    if (nd >= 3 && !st('Key', false)) { set('Key', true); return 'key'; }
    if (nd >= 5 && !st('Rest', false)) { set('Rest', true); return 'rest'; }
    if (nd >= 8 && !st('Rent', false)) { set('Rent', true); set('RentDay', day() - 1); return 'rent'; }
    if (nd >= GAMES.length && !st('All', false)) { set('All', true); save.give('goldenFlatKey'); save.addGold(100); GK.visible = true; return 'all'; }
    return null; }
  // ================= keeper PERKS sub-menu =================
  const restOk = () => st('Rest', false) && st('RestDay', -1) !== day(), rentOk = () => st('Rent', false) && st('RentDay', -1) !== day();
  function rest(where) { if (heal) heal(999); tone(523, 0.05, 0.4); tone(659, 0.05, 0.4, 'sine', 0.15); tone(784, 0.05, 0.6, 'sine', 0.3); toast(where + ' \u00b7 FULL HEALTH', 2.4); }
  function perks() { const ch = [];
    if (!ownF()) ch.push({ text: 'BUY FLAT ' + FLAT + ' \u00b7 ' + PRICE + ' G', pick: () => { if (save.spend && save.spend(PRICE)) { set('Flat', true); ding(); coin(); toast('FLAT ' + FLAT + ' IS YOURS \u00b7 FLOOR 1', 3); drawBoard(); sayTo(kT, [ln('Welcome home! Flat ' + FLAT + ', floor 1. The bed is all yours.')]); } else sayTo(kT, [ln('Flat ' + FLAT + ' is ' + PRICE + ' gold. Come back when you have it.')]); } });
    if (rentOk()) ch.push({ text: 'COLLECT RENT \u00b7 25 G', pick: () => { set('RentDay', day()); save.addGold(25); coin(); coin(0.12); toast('RENT \u00b7 +25 GOLD \u00b7 MORE TOMORROW', 2.4); } });
    if (restOk()) ch.push({ text: 'REST IN THE GUEST BED', pick: () => { set('RestDay', day()); rest('A GOOD NAP'); } });
    if (ownF()) ch.push({ text: 'MY FLAT \u00b7 ' + FLAT, pick: () => sayTo(kT, [ln('Flat ' + FLAT + ', floor 1. Rest on your bed any time.')]) });
    const info = ['SPARE KEY', 'GUEST BED', 'RENT', 'RIDE-ON'].filter((n, i) => [st('Key', false), st('Rest', false), st('Rent', false), ride()][i]);
    const open = info.length ? 'Your perks: ' + info.join(', ').toLowerCase() + '. What do you need?' : 'Work hard and the perks come. A flat is for sale.';
    sayTo(kT, [{ ...ln(open), choices: [...ch, { text: 'GOODBYE', bye: true, pick: () => {} }] }]); }
  // ================= prompt + talk (not during jobs) =================
  const inLob = P => inBld(P) && (P.y || 0) < 2.5;
  function prompt(P) { if (inLob(P) && near(P, BDU, BV + 1.0, 0, 1.25)) return st('Key', false) ? 'BACK DOOR \u00b7 GO OUT' : 'BACK DOOR \u00b7 LOCKED';
    if (!inBld(P) && near(P, BDU, BV - 1.1, GY, 1.4)) return st('Key', false) ? 'BACK DOOR \u00b7 GO IN' : 'BACK DOOR \u00b7 LOCKED';
    if (inLob(P) && near(P, NBU, NBV + 1.0, 0, 1.4)) return 'READ \u00b7 NOTICE BOARD';
    if (ownF() && inBld(P) && near(P, 1.0, 7.6, Y1, 1.2)) return 'REST \u00b7 YOUR BED'; return null; }
  let nbI = 0;
  function talk(P) { const key0 = st('Key', false);
    if (inLob(P) && near(P, BDU, BV + 1.0, 0, 1.25)) { if (!key0) { tone(196, 0.05, 0.25, 'square'); toast('LOCKED \u00b7 ' + KP.name.toUpperCase() + ' HAS A SPARE KEY FOR HELPERS', 2.4); return true; }
      const [x, z] = W(BDU, BV - 1.2); Object.assign(P, { x, z, y: GY, vy: 0, sp: 0 }); tone(880, 0.04, 0.2); toast('OUT THE BACK DOOR', 1.4); return true; }
    if (!inBld(P) && near(P, BDU, BV - 1.1, GY, 1.4)) { if (!key0) { tone(196, 0.05, 0.25, 'square'); toast('LOCKED \u00b7 RESIDENTS AND HELPERS ONLY', 2.2); return true; }
      const [x, z] = W(BDU, BV + 1.3); Object.assign(P, { x, z, y: 0, vy: 0, sp: 0 }); tone(880, 0.04, 0.2); toast('IN THE BACK DOOR \u00b7 THE LIFT IS RIGHT HERE', 1.8); return true; }
    if (inLob(P) && near(P, NBU, NBV + 1.0, 0, 1.4)) { const N = notes(), n = N[nbI++ % N.length]; tone(1320, 0.03, 0.2); toast(n[0] + ' \u00b7 ' + n[1], 2.6); return true; }
    if (ownF() && inBld(P) && near(P, 1.0, 7.6, Y1, 1.2)) { rest('YOUR OWN BED'); return true; } return false; }
  // ================= per frame =================
  let bT = 0;
  function tick(dt, P, fox) { applyWear(fox); const inb = inBld(P), f1 = inb && (P.y || 0) > FY[1] - 1.2 && (P.y || 0) < FY[2] - 1.2; FL1.visible = f1 && ownF(); balTick(dt, P);
    if ((bT -= dt) <= 0) { bT = 1.5; drawBoard(); GK.visible = !!st('All', false); } }
  // camera pass: on the ride-on, sit the player on the seat (legs forward)
  function camFix(cam, fox) { const J = job(); if (!fox || !J || J.g !== 'lawn' || !ride()) return; const U = fox.userData && fox.userData.P; fox.position.y += 0.42; if (U && U.legs) U.legs.forEach(l => { l.rotation.x = -1.35; }); }
  return { gift, line: k => LINES[k], perks, prompt, talk, tick, camFix, ride, RM, applyWear };
}
