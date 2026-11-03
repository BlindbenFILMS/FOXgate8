// MERU 2.0 — s89 TAVERN DELUXE PART C1 (Ben's answers s86): PRIZES + the first look items, plugged into worlds/meru2-tavern-jobs.js.
// PRIZES (one per finished job, in this order): BARKEEP APRON (first job, worn, the Tailor keeps it) · YOUR OWN TANKARD (3 jobs: hangs on the peg
// behind the bar, a swig = full heal once a game day) · STAFF DRINKS (5 jobs: drinks on the house) · YOUR NAME ON THE WALL PLAQUE (8 jobs) ·
// GOLDEN TANKARD trophy + 100 gold (all 10 jobs). DRINKS: Meru Amber 5 G (+25 HP), apple juice / hot cocoa 3 G (+15 HP), from the Barkeep's DRINKS + PERKS.
// LOOK: TROPHY WALL (north wall, west end: darts best, Flick beaten, karaoke best, Ziggy's pool cup, your plaque, the golden tankard) ·
// CHALKBOARD MENU + a daily special (north wall, east of the shelves) · the BARKEEP wipes glasses and pulls pints when you are not close.
export function tvPrizes(X) {
  const { THREE, G, L, toWo, RAD, box, cyl, LM, CT, fitTxt, save, heal, wear, toast, ding, coin, tone, done, GAMES, sayTo, kT, ln, hour, keeper, BAR, KX } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#e6b45a', WOOD = '#3a2618';
  const st = (k, d) => save.stat('tv' + k, d), set = (k, v) => save.setStat('tv' + k, v);
  const nDone = () => { const d = done(); return GAMES.filter(q => d[q.k]).length; };
  const name = () => { try { return (save.data.name || 'YOU').toUpperCase(); } catch (e) { return 'YOU'; } };
  // ---------- game day (counts the hour wrapping past midnight) ----------
  let lastH = null; const day = () => st('DayN', 0);
  const dayTick = () => { const h = hour ? hour() : 12; if (lastH != null && h < lastH - 12) set('DayN', day() + 1); lastH = h; };
  // ================= the APRON (worn) =================
  const APR = { outfit: 'vest', torso: ['#f6efe0', '#d9c8a8', '#8a6a42'], name: 'BARKEEP APRON' };
  const apOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === APR.name); };
  const apronMesh = () => { const g = new THREE.Group(); box(g, 0.5, 0.62, 0.04, '#6b4a2a', 0, 0.42, 0.29); box(g, 0.24, 0.12, 0.045, '#5a3d22', 0, 0.3, 0.3); box(g, 0.08, 0.26, 0.02, WHITE, 0.2, 0.28, 0.32); g.traverse(o => { o.renderOrder = 2; }); return g; };
  let worn = null;
  function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.body) return; const on = apOn();
    if (worn && worn.on === on && worn.fox === fox && (!worn.m || worn.m.parent === P.body)) return; if (worn && worn.m && worn.m.parent) worn.m.parent.remove(worn.m); worn = { on, fox, m: null }; if (!on) return; const m = apronMesh(); P.body.add(m); worn.m = m; }
  // ================= YOUR TANKARD on the peg rack behind the bar =================
  const tankard = (par, c, x, y, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); par.add(g); cyl(g, 0.085, 0.09, 0.2, c, 0, 0.1, 0, 12); cyl(g, 0.092, 0.092, 0.025, c, 0, 0.012, 0, 12); cyl(g, 0.09, 0.09, 0.02, c, 0, 0.2, 0, 12);
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.016, 6, 12, Math.PI), LM(c)); h.position.set(0.09, 0.1, 0); h.rotation.z = -Math.PI / 2; g.add(h); return g; };
  const PEG = new THREE.Group(); { const [x, z] = toWo(L.shelves || { x: 30, z: -99.3, a: 0 }, KX + 1.6, 0.62); PEG.position.set(x, 0, z); PEG.rotation.y = RAD((L.shelves || {}).a); G.add(PEG);
    box(PEG, 1.2, 0.08, 0.06, WOOD, 0, 2.05, 0); for (let i = 0; i < 4; i++) box(PEG, 0.03, 0.03, 0.12, '#9aa0a6', -0.45 + i * 0.3, 2.0, 0.05);
    [0, 1, 3].forEach(i => tankard(PEG, '#8f969c', -0.45 + i * 0.3, 1.72, 0.12)); }
  const MINE = tankard(PEG, '#c9cdd2', -0.45 + 2 * 0.3, 1.72, 0.12); { const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.06), new THREE.MeshBasicMaterial({ map: CT(128, 48, (c, w, h) => { c.fillStyle = YEL; c.fillRect(0, 0, w, h); c.fillStyle = INK; c.textBaseline = 'middle'; fitTxt(c, name(), 6, h / 2 + 2, w - 12, 30); }) })); tag.position.set(0, 0.12, 0.1); MINE.add(tag); }
  // ================= TROPHY WALL (north wall, west end) =================
  const TW = { x: 15.6, y: 3.05, z: -99.86 }, TWW = 4.6, TWH = 1.9;
  const twG = new THREE.Group(); twG.position.set(TW.x, TW.y, TW.z); G.add(twG); box(twG, TWW + 0.16, TWH + 0.16, 0.06, WOOD, 0, 0, 0);
  const twT = CT(1024, 424, () => {}); { const m = new THREE.Mesh(new THREE.PlaneGeometry(TWW, TWH), new THREE.MeshBasicMaterial({ map: twT })); m.position.z = 0.035; twG.add(m); }
  box(twG, TWW, 0.06, 0.26, WOOD, 0, -TWH / 2 - 0.05, 0.14);
  const cup = (c, x) => { const g = new THREE.Group(); g.position.set(x, -TWH / 2 - 0.02, 0.15); twG.add(g); cyl(g, 0.09, 0.11, 0.05, INK, 0, 0.025, 0, 10); cyl(g, 0.025, 0.03, 0.14, c, 0, 0.12, 0, 8); const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8, 0, 6.3, 0, 1.6), LM(c)); b.rotation.x = Math.PI; b.position.y = 0.3; g.add(b);
    for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 5, 10, Math.PI), LM(c)); h.position.set(s * 0.12, 0.26, 0); h.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(h); } return g; };
  cup('#c0c4cc', -1.55);   // Ziggy's pool cup
  const GOLDT = tankard(twG, GOLD, 1.55, -TWH / 2 - 0.02, 0.15, 1.7); GOLDT.visible = false;
  let twKey = '';
  function drawWall() { const flick = save.stat('tvFlickWins', 0), db = save.stat('meru.darts.best', 0) || 0, kb = save.stat('tvKaraBest', 0) || 0, pl = !!st('Plaque', false), gt = !!st('Gold', false);
    const k = [flick, db, kb, pl, gt, name()].join('|'); if (k === twKey) return; twKey = k; const c = twT.userData.c.getContext('2d'), w = 1024, h = 424;
    c.fillStyle = '#4a3020'; c.fillRect(0, 0, w, h); c.fillStyle = INK; c.fillRect(0, 0, w, 64); c.fillStyle = YEL; c.textBaseline = 'middle'; fitTxt(c, 'TROPHY WALL', 20, 34, 500, 40);
    const cell = (i, head, big, sub, on, col) => { const x = 16 + i * 252, y = 80; c.fillStyle = on ? WHITE : '#6b5a4a'; c.fillRect(x, y, 236, 236); c.fillStyle = on ? col : '#5a4a3a'; c.fillRect(x, y, 236, 30);
      c.fillStyle = on ? WHITE : '#3a2e24'; fitTxt(c, head, x + 10, y + 16, 216, 20); c.fillStyle = on ? INK : '#3a2e24'; fitTxt(c, big, x + 10, y + 110, 216, 64); fitTxt(c, sub, x + 10, y + 190, 216, 22, 800); };
    cell(0, 'TAVERN POOL', 'ZIGGY', 'CHAMP SINCE THE GALA', true, '#1d6b4c');
    cell(1, 'DARTS', db ? String(db) : '\u2014', flick ? 'BEAT FLICK \u00b7 ' + flick + (flick > 1 ? ' WINS' : ' WIN') : 'BEST 3 DARTS \u00b7 BEAT FLICK', !!db || flick > 0, RED);
    cell(2, 'KARAOKE', kb ? String(kb) : '\u2014', 'BEST SONG', kb > 0, '#7c3aed');
    cell(3, 'STAFF OF THE MONTH', pl ? name() : '?', gt ? 'GOLDEN TANKARD' : pl ? 'BARKEEP SAYS THANKS' : '8 JOBS FOR THE BARKEEP', pl, '#8a6a42');
    c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(0, 330, w, 2); c.fillStyle = '#d9c8a8'; c.font = '700 22px Archivo, sans-serif'; c.fillText('BRING A TROPHY HOME TO MERU', 20, 380); twT.needsUpdate = true; GOLDT.visible = gt; }
  drawWall();
  // ================= CHALKBOARD MENU (north wall, east of the shelves) =================
  const SPEC = [['CASTLE STEW', 6], ['FIREPLACE PIE', 4], ['AMBER + CRISPS', 6], ['WARM PRETZEL', 3], ['COCOA + MARSHMALLOW', 4], ['CHEESE TOASTIE', 4], ['LAKE FISH + CHIPS', 7]];
  const CB = { x: 43.6, y: 2.95, z: -99.86 }, cbT = CT(512, 352, () => {}); { const g = new THREE.Group(); g.position.set(CB.x, CB.y, CB.z); G.add(g); box(g, 2.5, 1.74, 0.06, WOOD, 0, 0, 0); const m = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.58), new THREE.MeshBasicMaterial({ map: cbT })); m.position.z = 0.035; g.add(m); box(g, 2.3, 0.05, 0.12, WOOD, 0, -0.84, 0.06); }
  let cbKey = '';
  function drawChalk() { const sp = SPEC[day() % SPEC.length], free = !!st('Staff', false), k = sp[0] + free; if (k === cbKey) return; cbKey = k; const c = cbT.userData.c.getContext('2d'), w = 512, h = 352;
    c.fillStyle = '#1c2a22'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 90; i++) c.fillRect((i * 131) % w, (i * 71) % h, 18, 2);
    c.fillStyle = WHITE; c.textBaseline = 'middle'; fitTxt(c, 'TODAY AT THE TAVERN', 22, 36, w - 44, 32);
    [['MERU AMBER', '5'], ['APPLE JUICE', '3'], ['HOT COCOA', '3']].forEach(([n, p], i) => { const y = 92 + i * 44; c.fillStyle = WHITE; fitTxt(c, n, 22, y, 330, 28, 700); c.textAlign = 'right'; fitTxt(c, p + ' G', w - 22, y, 120, 28, 800); c.textAlign = 'left'; });
    c.fillStyle = YEL; c.fillRect(22, 226, w - 44, 3); fitTxt(c, 'SPECIAL', 22, 254, 160, 24); c.fillStyle = WHITE; fitTxt(c, sp[0], 22, 290, 340, 30, 800); c.textAlign = 'right'; fitTxt(c, sp[1] + ' G', w - 22, 290, 120, 30, 800); c.textAlign = 'left';
    if (free) { c.fillStyle = RED; c.fillRect(w - 190, 6, 180, 40); c.fillStyle = WHITE; fitTxt(c, 'STAFF DRINK FREE', w - 182, 27, 166, 20); } cbT.needsUpdate = true; }
  drawChalk();
  // ================= the BARKEEP: wipes a glass, pulls a pint =================
  const KA = keeper.userData && keeper.userData.P; const KG = new THREE.Group(); { const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.16, 10), new THREE.MeshLambertMaterial({ color: '#dff1f7', transparent: true, opacity: 0.55 })); gl.position.y = 0.08; KG.add(gl);
    const fl = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.046, 1, 10), LM('#d99a2b')); fl.position.y = 0.01; fl.geometry.translate(0, 0.5, 0); fl.scale.y = 0.001; KG.add(fl); KG.userData.fl = fl; KG.position.set(0, -0.52, 0.1); if (KA && KA.arms && KA.arms[1]) KA.arms[1].add(KG); }
  let kT0 = 0, inPrev = false, enterT = 0;
  function keeperWork(dt, P, inShop, busy, talking) { if (!KA || !KA.arms) return; if (inShop && !inPrev) enterT = 2.2; inPrev = inShop; enterT -= dt;
    const d = Math.hypot(P.x - keeper.position.x, P.z - keeper.position.z); if (talking || enterT > 0 || d < 3) { KG.visible = d >= 3 && !talking; return; } KG.visible = true; kT0 += dt; const ph = kT0 % 14, A = KA.arms;
    if (ph < 8) { const w = kT0 * 6; A[1].rotation.x = -1.15; A[1].rotation.z = -0.25; A[0].rotation.x = -1.05 + Math.sin(w) * 0.14; A[0].rotation.z = 0.3 + Math.cos(w) * 0.18; KG.userData.fl.scale.y = 0.001; }
    else { const k = (ph - 8) / 6, pull = Math.min(1, k * 3) - Math.max(0, (k - 0.8) * 5); A[0].rotation.x = -1.7 + pull * 0.8; A[0].rotation.z = 0.15; A[1].rotation.x = -1.25; A[1].rotation.z = -0.2; KG.userData.fl.scale.y = Math.max(0.001, Math.min(0.15, k * 0.19)); } }
  // ================= prizes (one per finish) =================
  const LINES = {
    apron: ['You are one of us now. Your own apron. The Tailor keeps one too.', 'BARKEEP APRON'],
    tankard: ['Your own tankard, on the peg behind me. A swig a day, on me.', 'YOUR OWN TANKARD'],
    staff: ['Staff drink free. Order anything, any time.', 'STAFF DRINKS \u00b7 FREE'],
    plaque: ['Staff of the month. Your name is on the trophy wall.', 'NAME ON THE WALL PLAQUE'],
    gold: ['Every job in the house. The golden tankard, and 100 gold.', 'GOLDEN TANKARD + 100 GOLD'] };
  function gift() { const nd = nDone();
    if (!save.stat('tvApron', false)) { save.setStat('tvApron', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === APR.name)) save.setStat('tailorOutfits', [...list, APR]); save.setOutfit && save.setOutfit(APR); wear && wear(APR); return 'apron'; }
    if (nd >= 3 && !st('Tankard', false)) { set('Tankard', true); MINE.visible = true; return 'tankard'; }
    if (nd >= 5 && !st('Staff', false)) { set('Staff', true); drawChalk(); return 'staff'; }
    if (nd >= 8 && !st('Plaque', false)) { set('Plaque', true); drawWall(); return 'plaque'; }
    if (nd >= GAMES.length && !st('Gold', false)) { set('Gold', true); save.give && save.give('goldenTankard'); save.addGold(100); drawWall(); return 'gold'; }
    return null; }
  MINE.visible = !!st('Tankard', false);
  // ================= DRINKS + PERKS (keeper sub-menu) =================
  const DR = [['MERU AMBER', 5, 25, '#d99a2b'], ['APPLE JUICE', 3, 15, '#f2b632'], ['HOT COCOA', 3, 15, '#6b3d22']];
  const swigOk = () => st('Tankard', false) && st('SwigDay', -1) !== day();
  function drink(i) { const [n, p, hp] = DR[i], free = !!st('Staff', false); if (!free && !(save.spend && save.spend(p))) { sayTo(kT, [ln(n.charAt(0) + n.slice(1).toLowerCase() + ' is ' + p + ' gold. Come back with coin.')]); return; }
    if (heal) heal(hp); tone(220, 0.04, 0.2); tone(330, 0.03, 0.2, 'sine', 0.1); coin(0.2); toast(n + (free ? ' \u00b7 ON THE HOUSE' : ' \u00b7 ' + p + ' G') + ' \u00b7 +' + hp + ' HP', 2.2); }
  function perks() { const free = !!st('Staff', false), ch = DR.map((d, i) => ({ text: d[0] + ' \u00b7 ' + (free ? 'FREE' : d[1] + ' G'), pick: () => drink(i) }));
    if (swigOk()) ch.push({ text: 'A SWIG FROM MY TANKARD', pick: () => { set('SwigDay', day()); if (heal) heal(999); ding(); toast('YOUR OWN TANKARD \u00b7 FULL HEALTH \u00b7 AGAIN TOMORROW', 2.6); } });
    const have = ['APRON', 'TANKARD', 'STAFF DRINKS', 'PLAQUE', 'GOLDEN TANKARD'].filter((n, i) => [save.stat('tvApron', false), st('Tankard', false), free, st('Plaque', false), st('Gold', false)][i]);
    sayTo(kT, [{ ...ln(have.length ? 'Yours so far: ' + have.join(', ').toLowerCase() + '. What will it be?' : 'What will it be? Work for me and the perks come.'), choices: [...ch, { text: 'GOODBYE', bye: true, pick: () => {} }] }]); }
  // ================= per frame =================
  let rT = 0;
  function tick(dt, P, fox, s) { dayTick(); applyWear(fox); keeperWork(dt, P, s.inShop, s.busy, s.talking); if ((rT -= dt) <= 0) { rT = 1.5; drawWall(); drawChalk(); MINE.visible = !!st('Tankard', false); } }
  return { gift, line: k => LINES[k], perks, tick, applyWear, drawWall };
}
