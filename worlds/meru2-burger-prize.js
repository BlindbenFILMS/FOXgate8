// MERU 2.0 — s120 BURGERS DELUXE PART C: PRIZES (Ben's answers s118), plugged into worlds/meru2-burger-jobs.js as PZ (old frame).
// WORK = finished jobs (mbrClears) + finished shifts (mbrShifts, a shift that ran 60 s or more). One prize per step:
// 1 DINER TEE (worn, the Tailor keeps it; burger print on the chest) · 2 PAPER HAT (worn with the tee) · 3 NAME TAG · 4 FREE STAFF MEALS ·
// 6 EMPLOYEE OF THE MONTH (your name + face in the frame on the west wall) · 8 YOUR OWN SECRET MENU BURGER (pick it; plaque on the staff wall, on the menu) ·
// all 6 jobs + 9 work: GOLDEN SPATULA + 100 gold (on the shelf under the photo) · 12 work: YOUR OWN BOOTH (north wall, RESERVED + your name).
export function bgPrizes(X) {
  const { THREE, G, box, cyl, CT, save, heal, wear, toast, ding, tone, done, GAMES, sayTo, kT, ln, CHOICE_BYE } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#e6b45a', DRED = '#c42d3c';
  const st = (k, d) => save.stat('mbr' + k, d), set = (k, v) => save.setStat('mbr' + k, v);
  const work = () => (st('Clears', 0) || 0) + (st('Shifts', 0) || 0), allJobs = () => { const d = done(); return GAMES.every(q => d[q.k]); };
  const name = () => { try { return (save.data.name || 'YOU').toUpperCase(); } catch (e) { return 'YOU'; } };
  const fit = (c, t, x, y, maxW, fs, wt = 900) => { let f = fs; do { c.font = wt + ' ' + f + 'px Archivo, sans-serif'; f -= 2; } while (f > 10 && c.measureText(t).width > maxW); c.fillText(t, x, y); };
  const plane = (tex, w, h, x, y, z, ry, par = G) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  // ================= worn: the tee (outfit) + burger print, paper hat, name tag =================
  const TEE = { outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', DRED], name: 'DINER TEE' };
  const teeOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === TEE.name); };
  const printT = CT(128, 128, (g, W, H) => { g.clearRect(0, 0, W, H); g.lineWidth = 5; g.strokeStyle = INK; const X0 = 64;
    g.fillStyle = '#e39a42'; g.beginPath(); g.ellipse(X0, 54, 48, 30, 0, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#6fbf3a'; g.fillRect(14, 54, 100, 9); g.strokeRect(14, 54, 100, 9);
    g.fillStyle = '#ffc93a'; g.fillRect(18, 63, 92, 8); g.fillStyle = '#6e3f22'; g.fillRect(14, 71, 100, 16); g.strokeRect(14, 71, 100, 16); g.fillStyle = '#d98f3a'; g.fillRect(18, 89, 92, 16); g.strokeRect(18, 89, 92, 16); });
  const tagT = CT(128, 64, (g, W, H) => { g.fillStyle = WHITE; g.fillRect(0, 0, W, H); g.fillStyle = DRED; g.fillRect(0, 0, W, 18); g.fillStyle = INK; g.textBaseline = 'middle'; fit(g, name(), 8, 42, W - 16, 30); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(2, 2, W - 4, H - 4); });
  let worn = null;
  function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.body) return; const on = teeOn(), hat = on && !!st('Hat', false), tag = on && !!st('Tag', false);
    if (worn && worn.fox === fox && worn.on === on && worn.hat === hat && worn.tag === tag && worn.body === P.body) return;
    if (worn) worn.m.forEach(m => m.parent && m.parent.remove(m)); worn = { fox, on, hat, tag, m: [], body: P.body };
    if (on) { const pr = plane(printT, 0.3, 0.3, 0, 0.9, 0.3, 0, P.body); worn.m.push(pr); }
    if (hat && P.head) { const h = new THREE.Group(); P.head.add(h); box(h, 0.4, 0.12, 0.3, WHITE, 0, 0.33, 0); box(h, 0.41, 0.03, 0.31, DRED, 0, 0.28, 0); worn.m.push(h); }
    if (tag) { const t = plane(tagT, 0.13, 0.065, 0.13, 1.07, 0.3, 0, P.body); worn.m.push(t); } }
  // ================= west wall: EMPLOYEE OF THE MONTH + the golden spatula shelf =================
  const EM = { x: 70.14, y: 2.45, z: 37.6 }, emG = new THREE.Group(); emG.position.set(EM.x, EM.y, EM.z); emG.rotation.y = Math.PI / 2; G.add(emG);
  box(emG, 1.08, 1.3, 0.04, GOLD, 0, 0, 0); const emT = CT(256, 304, () => {}); plane(emT, 0.96, 1.14, 0, 0, 0.025, 0, emG);
  box(emG, 1.1, 0.04, 0.26, INK, 0, -0.86, 0.13);
  const SPAT = new THREE.Group(); { const gm = new THREE.MeshPhongMaterial({ color: GOLD, shininess: 120, specular: 0xffe7a0 }); const a = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, 0.03), gm); a.position.y = 0.15; SPAT.add(a);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.012), gm); b.position.y = 0.36; SPAT.add(b); box(SPAT, 0.14, 0.03, 0.1, INK, 0, 0.015, 0); }
  SPAT.position.set(0.3, -0.84, 0.14); SPAT.rotation.z = -0.15; emG.add(SPAT); SPAT.visible = false;
  let emKey = '';
  function drawEM() { const me = !!st('Month', false), k = me + name(); if (k === emKey) return; emKey = k; const c = emT.userData.c.getContext('2d'), w = 256, h = 304;
    c.fillStyle = WHITE; c.fillRect(0, 0, w, h); c.fillStyle = DRED; c.fillRect(0, 0, w, 50); c.fillStyle = '#fff'; c.textBaseline = 'middle'; fit(c, 'EMPLOYEE OF THE MONTH', 10, 26, w - 20, 24);
    c.fillStyle = '#cfe3f2'; c.fillRect(28, 62, w - 56, 176); const fur = me ? '#e8792a' : '#f3f2f2', cx = w / 2;   // a fox face portrait
    c.fillStyle = fur; c.beginPath(); c.moveTo(cx - 62, 118); c.lineTo(cx - 52, 70); c.lineTo(cx - 22, 104); c.lineTo(cx + 22, 104); c.lineTo(cx + 52, 70); c.lineTo(cx + 62, 118); c.lineTo(cx, 214); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 5; c.stroke();
    c.fillStyle = '#fbf6ec'; c.beginPath(); c.moveTo(cx - 40, 160); c.lineTo(cx + 40, 160); c.lineTo(cx, 214); c.closePath(); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(cx - 24, 140, 7, 0, 7); c.arc(cx + 24, 140, 7, 0, 7); c.fill(); c.beginPath(); c.arc(cx, 206, 8, 0, 7); c.fill();
    c.fillStyle = me ? DRED : '#c42d3c'; c.fillRect(cx - 52, 222, 104, 16); c.fillStyle = INK; c.textAlign = 'center'; fit(c, me ? name() : 'BUN', cx, 266, w - 30, 40); c.textAlign = 'left'; emT.needsUpdate = true; SPAT.visible = !!st('Spatula', false); }
  // ================= the SECRET MENU plaque (staff wall, between the sauces and the staff door) =================
  const SECRETS = [{ n: n => 'THE DOUBLE ' + n, d: 'TWO PATTIES \u00b7 TWO CHEESE \u00b7 SAUCE', hp: 50 }, { n: n => n + "'S FIRE STACK", d: 'PATTY \u00b7 PEPPERS \u00b7 HOT SAUCE \u00b7 ONION', hp: 50 },
    { n: n => 'THE GARDEN ' + n, d: 'LETTUCE \u00b7 TOMATO \u00b7 PICKLES \u00b7 ONION', hp: 50 }, { n: n => n + ' DELUXE', d: 'EVERYTHING ON IT. EVERYTHING.', hp: 60 }];
  const smT = CT(384, 192, () => {}), smM = plane(smT, 1.3, 0.65, 103.32, 2.25, 44.4, -Math.PI / 2); smM.visible = false;
  let smKey = '';
  function drawSM() { const i = st('Secret', null); smM.visible = i != null; if (i == null) return; const k = i + name(); if (k === smKey) return; smKey = k; const c = smT.userData.c.getContext('2d'), w = 384, h = 192, S = SECRETS[i];
    c.fillStyle = INK; c.fillRect(0, 0, w, h); c.fillStyle = YEL; c.textBaseline = 'middle'; fit(c, 'SECRET MENU', 16, 30, w - 32, 30); c.fillStyle = RED; c.fillRect(16, 52, w - 32, 4);
    c.fillStyle = WHITE; fit(c, S.n(name()), 16, 92, w - 32, 38); c.fillStyle = '#cfcac3'; fit(c, S.d, 16, 140, w - 32, 22, 800); c.fillStyle = YEL; fit(c, 'ASK SIZZLE', 16, 172, w - 32, 20); smT.needsUpdate = true; }
  // ================= YOUR OWN BOOTH (north wall booth at x 86.5) =================
  const BX = 86.5, rsT = CT(512, 128, () => {}), rsM = plane(rsT, 2.0, 0.5, BX, 1.75, 32.64, 0); rsM.visible = false;
  const tent = new THREE.Group(); tent.position.set(BX, 0.79, 33.6); G.add(tent); tent.visible = false; { const tt = CT(128, 64, (g, W, H) => { g.fillStyle = DRED; g.fillRect(0, 0, W, H); g.fillStyle = WHITE; g.textBaseline = 'middle'; fit(g, 'RESERVED', 8, H / 2, W - 16, 26); });
    for (const s of [-1, 1]) { const m = plane(tt, 0.22, 0.11, 0, 0.06, s * 0.03, s > 0 ? 0 : Math.PI, tent); m.rotation.x = s * -0.3; } }
  let rsKey = '';
  function drawRS() { const on = !!st('Booth', false); rsM.visible = tent.visible = on; if (!on) return; const k = name(); if (k === rsKey) return; rsKey = k; const c = rsT.userData.c.getContext('2d'), w = 512, h = 128;
    c.fillStyle = INK; c.fillRect(0, 0, w, h); c.fillStyle = GOLD; c.fillRect(0, h - 10, w, 10); c.fillStyle = YEL; c.textBaseline = 'middle'; fit(c, 'RESERVED', 18, 34, w - 36, 28); c.fillStyle = WHITE; fit(c, name() + "'S BOOTH", 18, 82, w - 36, 46); rsT.needsUpdate = true; }
  // ================= STAFF MEAL (Sizzle's menu): heals; FREE once you have the prize =================
  const MENU = [['BURGER', 5, 25], ['CHEESEBURGER', 6, 30], ['FRIES', 3, 15], ['SHAKE', 3, 15], ['COLA', 2, 10]];
  function order(n, p, hp) { const free = !!st('Food', false); if (!free && !(save.spend && save.spend(p))) { sayTo(kT, [ln(n.charAt(0) + n.slice(1).toLowerCase() + ' is ' + p + ' gold. Work a shift and it is free.')]); return; }
    if (heal) heal(hp); tone(523, 0.04, 0.2); tone(784, 0.03, 0.25, 'sine', 0.1); toast(n + (free ? ' \u00b7 ON THE HOUSE' : ' \u00b7 ' + p + ' G') + ' \u00b7 +' + hp + ' HP', 2.2); }
  function meal() { const free = !!st('Food', false), i = st('Secret', null), L = MENU.map(m => ({ text: m[0] + ' \u00b7 ' + (free ? 'FREE' : m[1] + ' G'), pick: () => order(m[0], m[1], m[2]) }));
    if (i != null) { const S = SECRETS[i]; L.unshift({ text: S.n(name()) + ' \u00b7 ' + (free ? 'FREE' : '8 G'), pick: () => order(S.n(name()), 8, S.hp) }); }
    sayTo(kT, [{ ...ln(free ? 'Staff eat free. What will it be?' : 'Hungry? Staff price till you earn free meals.'), choices: [...L, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  const pickSecret = open => sayTo(kT, [{ ...ln(open || 'Your burger, your name. Which one goes on the menu?'), choices: [...SECRETS.map((S, i) => ({ text: S.n(name()) + (st('Secret', null) === i ? ' \u2713' : ''), pick: () => { set('Secret', i); smKey = ''; drawSM(); ding(); toast('ON THE SECRET MENU \u00b7 ' + S.n(name()), 2.4); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  // ================= prizes =================
  const LINES = { tee: ['Crew tee. You are one of us now. The Tailor keeps one too.', 'DINER TEE'], hat: ['Paper hat. Wear it with pride. And the tee.', 'PAPER HAT'], tag: ['Name tag. Now the regulars know who to thank.', 'NAME TAG'],
    food: ['Staff eat free. Ask me for a STAFF MEAL any time.', 'FREE STAFF MEALS'], month: ['Employee of the month. Look at the west wall.', 'EMPLOYEE OF THE MONTH'],
    secret: ['You get your own burger on the secret menu. Pick it.', 'YOUR SECRET MENU BURGER'], spatula: ['Every job in my diner. The golden spatula, and 100 gold.', 'GOLDEN SPATULA + 100 GOLD'], booth: ['That booth by the north wall is yours. Your name is on it.', 'YOUR OWN BOOTH'] };
  function gift() { const w = work();
    if (w >= 1 && !st('Tee', false)) { set('Tee', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === TEE.name)) save.setStat('tailorOutfits', [...list, TEE]); save.setOutfit && save.setOutfit(TEE); wear && wear(TEE); return 'tee'; }
    if (w >= 2 && !st('Hat', false)) { set('Hat', true); return 'hat'; }
    if (w >= 3 && !st('Tag', false)) { set('Tag', true); return 'tag'; }
    if (w >= 4 && !st('Food', false)) { set('Food', true); return 'food'; }
    if (w >= 6 && !st('Month', false)) { set('Month', true); drawEM(); return 'month'; }
    if (w >= 8 && !st('SecretOk', false)) { set('SecretOk', true); return 'secret'; }
    if (w >= 9 && allJobs() && !st('Spatula', false)) { set('Spatula', true); save.give && save.give('goldenSpatula'); save.addGold(100); emKey = ''; drawEM(); return 'spatula'; }
    if (w >= 12 && !st('Booth', false)) { set('Booth', true); drawRS(); return 'booth'; }
    return null; }
  const thankLine = gf => { if (gf === 'secret') { pickSecret(LINES.secret[0]); return true; } return false; };
  function prizes() { const have = [['TEE', 'Tee'], ['HAT', 'Hat'], ['NAME TAG', 'Tag'], ['FREE MEALS', 'Food'], ['EMPLOYEE OF THE MONTH', 'Month'], ['SECRET BURGER', 'SecretOk'], ['GOLDEN SPATULA', 'Spatula'], ['YOUR BOOTH', 'Booth']].filter(([, k]) => st(k, false)).map(([n]) => n);
    const ch = []; if (st('SecretOk', false)) ch.push({ text: 'CHANGE MY SECRET BURGER', pick: () => pickSecret() }); if (st('Tee', false) && !teeOn()) ch.push({ text: 'PUT THE TEE BACK ON', pick: () => { save.setOutfit && save.setOutfit(TEE); wear && wear(TEE); toast('DINER TEE ON', 1.6); } }); ch.push({ text: CHOICE_BYE, bye: true, pick: () => {} });
    sayTo(kT, [{ ...ln(have.length ? 'Yours so far: ' + have.join(', ').toLowerCase() + '. ' + work() + ' shifts and jobs.' : 'Nothing yet. Work a shift or a job and the prizes come.'), choices: ch }]); }
  // a shift that ran 60 s or more counts as work
  let shT = 0, wasOn = false, pend = null;
  function tick(dt, P, fox, shiftOn) { applyWear(fox); if (shiftOn) shT += dt; if (wasOn && !shiftOn) { if (shT >= 60) { set('Shifts', (st('Shifts', 0) || 0) + 1); pend = gift(); if (pend) toast('SHIFT DONE \u00b7 PRIZE: ' + LINES[pend][1] + ' \u00b7 SEE SIZZLE', 3); } shT = 0; } wasOn = shiftOn;
    drawEM(); drawSM(); drawRS(); }
  drawEM(); drawSM(); drawRS();
  return { gift, line: k => LINES[k], thankLine, prizes, meal, pickSecret, tick, takePending: () => { const p = pend; pend = null; return p; }, SECRETS };
}
