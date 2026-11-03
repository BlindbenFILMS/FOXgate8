// MERU 2.0 — s96 BARRACKS DELUXE PART C1 (prizes + the dais walls), plugged into worlds/meru2-barracks-jobs.js as PZ.
// One prize per finished job (11 jobs, both keepers count): 1 GUARD HELMET + RECRUIT badge (worn) · 2 MERU GUARD ARMOUR (worn + Tailor) · 3 PRIVATE ·
// 4 YOUR OWN BUNK + FOOTLOCKER (store items) · 5 CORPORAL · 6 MESS PRIVILEGES (a free hot bowl a day = full health) · 7 SERGEANT · 8 NAME ON THE HONOUR ROLL ·
// 9 GOLDEN SWORD + 200 gold · 11 STAT BOOST (+1 ATTACK / DEFENSE / SPEED / SMARTS, save stat foxStats). Stats brkHelm / brkHelmOn / brkArmour / brkRank / brkBunk /
// brkLocker / brkMess / brkBowlDay / brkDayN / brkHonour / brkSword / brkBoost / brkBoostK. DAIS: HONOUR ROLL board (west of the throne) + MERU'S BATTLES banners
// and the golden sword plinth (east of the throne).
import { ITEM_LABELS } from './meru-shops.js';
export function brkPrizes(X) {
  const { THREE, G, box, cyl, LM, CT, cols, save, wear, toast, ding, tone, sayTo, hour, heal } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#e6b45a', NAVY = '#1f2650', STEEL = '#a9b1b9';
  const st = (k, d) => save.stat('brk' + k, d), set = (k, v) => save.setStat('brk' + k, v);
  const nDone = () => { const o = save.stat('brkDone', null) || {}; return Object.keys(o).filter(k => o[k]).length; };
  const name = () => { try { return (save.data.name || 'YOU').toUpperCase(); } catch (e) { return 'YOU'; } };
  const fit = (c, t, x, y, w, px, wt = 900) => { let s = px; c.font = wt + ' ' + s + 'px Archivo, sans-serif'; while (s > 10 && c.measureText(t).width > w) { s -= 2; c.font = wt + ' ' + s + 'px Archivo, sans-serif'; } c.fillText(t, x, y); };
  const RANKS = ['RECRUIT', 'PRIVATE', 'CORPORAL', 'SERGEANT'], rank = () => st('Rank', -1), rankName = () => RANKS[Math.max(0, rank())];
  // ---------- game day (the hour wrapping past midnight) ----------
  let lastH = null; const day = () => st('DayN', 0);
  const dayTick = () => { const h = hour ? hour() : 12; if (lastH != null && h < lastH - 12) set('DayN', day() + 1); lastH = h; };
  // ================= worn: helmet (head), rank badge (chest) =================
  const ARM = { outfit: 'armor', torso: [STEEL, RED, NAVY], name: 'MERU GUARD ARMOUR' };
  const grp = () => new THREE.Group();
  const helmMesh = () => { const g = grp(); const d = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), LM(STEEL)); d.scale.set(1, 0.8, 1.05); d.position.y = 0.24; g.add(d);
    cyl(g, 0.25, 0.25, 0.05, '#7a828a', 0, 0.25, 0, 14); box(g, 0.05, 0.1, 0.4, RED, 0, 0.45, -0.02); box(g, 0.05, 0.13, 0.03, '#7a828a', 0, 0.2, 0.25); return g; };
  const badgeMesh = n => { const g = grp(); box(g, 0.13, 0.13, 0.02, RED, 0.13, 0.62, 0.3); box(g, 0.14, 0.14, 0.015, INK, 0.13, 0.62, 0.293);
    if (!n) box(g, 0.04, 0.04, 0.012, GOLD, 0.13, 0.62, 0.312);
    for (let i = 0; i < n; i++) for (const s of [-1, 1]) { const b = box(g, 0.07, 0.016, 0.012, GOLD, 0.13 + s * 0.025, 0.66 - i * 0.032, 0.312); b.rotation.z = s * 0.6; }
    return g; };
  let worn = null;
  function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.body) return; const h = !!(st('Helm', false) && st('HelmOn', true)), r = st('BadgeOn', true) ? rank() : -1, k = h + '|' + r;
    if (worn && worn.k === k && worn.P === P && worn.ms.every(m => m.parent)) return; if (worn) worn.ms.forEach(m => m.parent && m.parent.remove(m)); worn = { k, P, ms: [] };
    const put = (par, m) => { if (par) { par.add(m); worn.ms.push(m); } };
    if (h) put(P.head, helmMesh()); if (r >= 0) put(P.body, badgeMesh(r)); }
  // ================= DAIS WEST: the HONOUR ROLL =================
  const HR = new THREE.Group(); HR.position.set(-10.8, 3.7, -439.28); G.add(HR); box(HR, 4.6, 2.9, 0.06, INK, 0, 0, -0.03); box(HR, 4.7, 0.12, 0.1, GOLD, 0, 1.5, 0);
  const hrT = CT(640, 400, () => {}); { const m = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.75), new THREE.MeshBasicMaterial({ map: hrT })); m.position.z = 0.005; HR.add(m); }
  const ROLL = [['KING MIGHT', 'THE CROWN'], ['GUARD CAPTAIN', 'CAPTAIN'], ['MASTER OF ARMS', 'MASTER'], ['SGT. BISCUIT', 'QUARTERMASTER'], ['DOT DIESEL', 'MOTOR POOL'], ['SGT. FLINT', 'NIGHT WATCH'], ['CPL. ASH', 'ARCHERS'], ['CPL. BRICK', 'THE GATE']];
  let hrKey = '';
  function drawRoll() { const on = !!st('Honour', false), k = on + name() + rank(); if (k === hrKey) return; hrKey = k; const c = hrT.userData.c.getContext('2d'), w = 640, h = 400;
    c.fillStyle = WHITE; c.fillRect(0, 0, w, h); c.fillStyle = NAVY; c.fillRect(0, 0, w, 62); c.fillStyle = RED; c.fillRect(0, 0, 14, 62); c.fillStyle = '#ffffff'; c.textBaseline = 'middle'; fit(c, 'HONOUR ROLL \u00b7 MERU BARRACKS', 30, 33, w - 50, 32);
    ROLL.forEach(([n, r], i) => { const col = i % 2, row = i >> 1, x = 20 + col * 310, y = 80 + row * 50; c.fillStyle = INK; c.fillRect(x, y + 42, 290, 2); fit(c, n, x, y + 16, 290, 24); c.fillStyle = '#5c5856'; fit(c, r, x, y + 34, 290, 14, 700); });
    const y = 294; c.fillStyle = on ? YEL : '#d6d2cb'; c.fillRect(20, y, w - 40, 86); c.fillStyle = INK; c.fillRect(20, y, 12, 86); fit(c, 'THIS YEAR', 46, y + 22, 200, 20, 800);
    fit(c, on ? rankName() + ' ' + name() : '?  \u00b7  8 JOBS FOR THE CAPTAIN + THE MASTER', 46, y + 56, w - 90, 32); hrT.needsUpdate = true; }
  drawRoll();
  // ================= DAIS EAST: MERU'S BATTLES banners + the golden sword =================
  const BW = new THREE.Group(); BW.position.set(10.8, 0, -439.28); G.add(BW); box(BW, 4.4, 0.08, 0.1, '#3d3b3a', 0, 5.2, 0.02);
  for (const [i, t] of [['THE BRIDGE', 'IRON + FIRE'], ['THE ARENA', 'IRON WARDEN'], ['DEFENSE BASE', 'PLANET WATCH']].entries()) {
    const tx = CT(128, 256, c => { c.fillStyle = i === 1 ? RED : NAVY; c.fillRect(0, 0, 128, 256); c.fillStyle = GOLD; c.fillRect(0, 0, 128, 10); c.beginPath(); c.arc(64, 70, 30, 0, 7); c.fill(); c.fillStyle = i === 1 ? RED : NAVY; c.font = '900 34px Archivo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('M', 64, 72);
      c.fillStyle = '#ffffff'; let s = 22; c.font = '900 ' + s + 'px Archivo, sans-serif'; while (c.measureText(t[0]).width > 116) { s -= 2; c.font = '900 ' + s + 'px Archivo, sans-serif'; } c.fillText(t[0], 64, 136); c.font = '700 13px Archivo, sans-serif'; c.fillText(t[1], 64, 162);
      c.fillStyle = GOLD; c.beginPath(); c.moveTo(0, 210); c.lineTo(64, 246); c.lineTo(128, 210); c.lineTo(128, 214); c.lineTo(64, 250); c.lineTo(0, 214); c.fill(); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.2), new THREE.MeshBasicMaterial({ map: tx, side: THREE.DoubleSide })); m.position.set(-1.4 + i * 1.4, 4.05, 0.05); BW.add(m); }
  const SW = new THREE.Group(); SW.position.set(10.8, 0, -437.9); G.add(SW); box(SW, 0.7, 1.0, 0.7, INK, 0, 0.5, 0); box(SW, 0.76, 0.05, 0.76, GOLD, 0, 1.02, 0);
  { const s = new THREE.Group(); s.position.y = 1.05; SW.add(s); box(s, 0.3, 0.06, 0.2, '#3d3b3a', 0, 0.03, 0); box(s, 0.07, 0.95, 0.02, GOLD, 0, 0.62, 0); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 4), LM(GOLD)); tip.position.y = 1.15; s.add(tip);
    box(s, 0.36, 0.05, 0.05, GOLD, 0, 0.16, 0); box(s, 0.04, 0.12, 0.04, '#6b4a32', 0, 0.08, 0); cyl(s, 0.035, 0.035, 0.04, GOLD, 0, 0.12, 0, 8); }
  cols && cols.push({ c: [10.8, -437.9, 0.5], get on() { return SW.visible; } });
  // ================= YOUR BUNK (west wing, row 2, first bunk) + FOOTLOCKER =================
  const BK = [-36, -426], LK = [-36, -424.6], LK_AT = [-36, -423.7];
  const NB = new THREE.Group(); NB.position.set(BK[0], 2.05, BK[1] + 1.05); G.add(NB); box(NB, 0.96, 0.26, 0.03, INK, 0, 0, 0);
  const nbT = CT(256, 64, () => {}); { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), new THREE.MeshBasicMaterial({ map: nbT })); m.position.z = 0.017; NB.add(m); }
  box(NB, 0.94, 0.06, 1.3, RED, 0, -0.27, -0.75);   // a red blanket on the top bunk
  const LOCK = new THREE.Group(); LOCK.position.set(LK[0], 0, LK[1]); G.add(LOCK); box(LOCK, 0.92, 0.06, 0.02, RED, 0, 0.3, 0.26); box(LOCK, 0.1, 0.12, 0.04, GOLD, 0, 0.36, 0.27);
  let nbKey = ''; function drawBunk() { const k = name() + rank(); if (k === nbKey) return; nbKey = k; const c = nbT.userData.c.getContext('2d'); c.fillStyle = YEL; c.fillRect(0, 0, 256, 64); c.fillStyle = INK; c.fillRect(0, 0, 10, 64); c.textBaseline = 'middle'; fit(c, rankName() + ' ' + name(), 20, 33, 226, 30); nbT.needsUpdate = true; }
  const lockIn = () => st('Locker', null) || {}, lab = id => (ITEM_LABELS[id] || String(id).replace(/([A-Z])/g, ' $1')).toUpperCase();
  function locker(kT, ln) { const bag = Object.entries((save.data && save.data.items) || {}).filter(q => q[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 5), box2 = Object.entries(lockIn()).filter(q => q[1] > 0).slice(0, 5);
    const ch = [...bag.map(([id, n]) => ({ text: 'STORE \u00b7 ' + lab(id) + ' \u00d7' + n, pick: () => { if (!save.take(id, n)) return; const L = { ...lockIn() }; L[id] = (L[id] || 0) + n; set('Locker', L); tone(220, 0.05, 0.2); toast('STORED \u00b7 ' + lab(id) + ' \u00d7' + n, 1.8); } })),
      ...box2.map(([id, n]) => ({ text: 'TAKE \u00b7 ' + lab(id) + ' \u00d7' + n, pick: () => { const L = { ...lockIn() }; delete L[id]; set('Locker', L); save.give(id, n); tone(330, 0.05, 0.2); toast('TAKEN \u00b7 ' + lab(id) + ' \u00d7' + n, 1.8); } })), { text: 'GOODBYE', bye: true, pick: () => {} }];
    sayTo(kT, [{ ...ln(box2.length ? 'Your footlocker. ' + box2.length + ' kind' + (box2.length > 1 ? 's' : '') + ' of thing inside.' : 'Your footlocker. Empty. Store what you like.'), choices: ch }]); }
  const atLocker = P => !!st('Bunk', false) && Math.hypot(P.x - LK_AT[0], P.z - LK_AT[1]) < 1.1;
  // ================= prizes =================
  const LINES = {
    helm: ['A Meru guard helmet. And your badge, recruit. Wear both with pride.', 'GUARD HELMET + RECRUIT BADGE'],
    armour: ['Guard armour, in Meru colours. The Tailor keeps a set for you.', 'MERU GUARD ARMOUR'],
    r1: ['Promoted. Private now. One chevron on that badge.', 'RANK \u00b7 PRIVATE'],
    bunk: ['The bunk by the lockers is yours now. The footlocker keeps your things.', 'YOUR OWN BUNK + FOOTLOCKER'],
    r2: ['Corporal. Two chevrons. The recruits will salute you now.', 'RANK \u00b7 CORPORAL'],
    mess: ['Mess privileges. One hot bowl a day, on the house. Full health.', 'MESS PRIVILEGES'],
    r3: ['Sergeant. Three chevrons. Few guards ever earn those.', 'RANK \u00b7 SERGEANT'],
    honour: ['Your name is on the Honour Roll. Up on the dais wall.', 'NAME ON THE HONOUR ROLL'],
    sword: ['The golden sword, and 200 gold. Meru does not forget its guards.', 'GOLDEN SWORD + 200 GOLD'],
    boost: ['Every job in the hall. Pick one thing to train harder.', 'STAT BOOST'] };
  const line = k => LINES[k] || null;
  function gift() { const n = nDone();
    if (!st('Helm', false)) { set('Helm', true); set('HelmOn', true); if (rank() < 0) set('Rank', 0); return 'helm'; }
    if (n >= 2 && !st('Armour', false)) { set('Armour', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === ARM.name)) save.setStat('tailorOutfits', [...list, ARM]); save.setOutfit && save.setOutfit(ARM); wear && wear(ARM); return 'armour'; }
    if (n >= 3 && rank() < 1) { set('Rank', 1); return 'r1'; }
    if (n >= 4 && !st('Bunk', false)) { set('Bunk', true); return 'bunk'; }
    if (n >= 5 && rank() < 2) { set('Rank', 2); return 'r2'; }
    if (n >= 6 && !st('Mess', false)) { set('Mess', true); return 'mess'; }
    if (n >= 7 && rank() < 3) { set('Rank', 3); return 'r3'; }
    if (n >= 8 && !st('Honour', false)) { set('Honour', true); drawRoll(); return 'honour'; }
    if (n >= 9 && !st('Sword', false)) { set('Sword', true); save.give && save.give('goldenSword'); save.addGold(200); return 'sword'; }
    if (n >= 11 && !st('Boost', false)) { set('Boost', true); return 'boost'; }
    return null; }
  function onFinish() { const gf = gift(); if (gf) { ding(); tone(1318, 0.05, 0.6, 'triangle', 0.15); setTimeout(() => toast('PRIZE \u00b7 ' + LINES[gf][1], 2.8), 2700); } return gf; }
  const needBoost = () => !!st('Boost', false) && !st('BoostK', null);
  const STATS = [['attack', 'ATTACK'], ['defense', 'DEFENSE'], ['speed', 'SPEED'], ['smarts', 'SMARTS']];
  const boostPick = (kT, ln, open) => sayTo(kT, [{ ...ln(open || 'Pick one thing to train harder. Choose well.'), choices: [...STATS.map(([k, n]) => ({ text: '+1 ' + n, pick: () => {
    const s = { attack: 1, defense: 1, speed: 1, smarts: 1, ...(save.stat('foxStats', null) || {}) }; s[k] = Math.min(20, (s[k] || 1) + 1); save.setStat('foxStats', s); set('BoostK', k); ding(); toast('+1 ' + n + ' \u00b7 NOW ' + s[k], 2.6); } })), { text: 'LATER', bye: true, pick: () => {} }] }]);
  const bowlOk = () => !!st('Mess', false) && st('BowlDay', -1) !== day();
  function perks(kT, ln) { const own = [['HELMET', st('Helm', false)], ['ARMOUR', st('Armour', false)], [rankName() + ' BADGE', rank() >= 0], ['BUNK', st('Bunk', false)], ['MESS', st('Mess', false)], ['HONOUR ROLL', st('Honour', false)], ['GOLDEN SWORD', st('Sword', false)]].filter(q => q[1]).map(q => q[0].toLowerCase());
    const ch = []; if (st('Helm', false)) ch.push({ text: st('HelmOn', true) ? 'HELMET OFF' : 'HELMET ON', pick: () => { set('HelmOn', !st('HelmOn', true)); toast(st('HelmOn', true) ? 'GUARD HELMET ON' : 'GUARD HELMET OFF', 1.6); } });
    if (rank() >= 0) ch.push({ text: st('BadgeOn', true) ? 'BADGE OFF' : 'BADGE ON', pick: () => { set('BadgeOn', !st('BadgeOn', true)); toast(st('BadgeOn', true) ? rankName() + ' BADGE ON' : 'BADGE OFF', 1.6); } });
    if (bowlOk()) ch.push({ text: 'A HOT BOWL FROM THE MESS', pick: () => { set('BowlDay', day()); if (heal) heal(9999); tone(392, 0.05, 0.3); tone(523, 0.04, 0.5, 'sine', 0.15); toast('MESS STEW \u00b7 FULL HEALTH \u00b7 AGAIN TOMORROW', 2.6); } });
    else if (st('Mess', false)) ch.push({ text: 'MESS \u00b7 BACK TOMORROW', pick: () => toast('ONE BOWL A DAY \u00b7 COME BACK TOMORROW', 2) });
    if (needBoost()) ch.push({ text: 'PICK MY STAT BOOST', pick: () => boostPick(kT, ln) });
    sayTo(kT, [{ ...ln(own.length ? 'Yours so far: ' + own.join(', ') + '.' : 'Work the hall and the prizes come, soldier.'), choices: [...ch, { text: 'GOODBYE', bye: true, pick: () => {} }] }]); }
  // ================= per frame =================
  let rT = 0;
  const vis = () => { SW.visible = !!st('Sword', false); const b = !!st('Bunk', false); NB.visible = b; LOCK.visible = b; if (b) drawBunk(); };
  function tick(dt, fox) { dayTick(); applyWear(fox); if ((rT -= dt) <= 0) { rT = 1.5; drawRoll(); vis(); } }
  vis();
  return { gift, onFinish, line, perks, tick, applyWear, boostPick, needBoost, nDone, drawRoll, rankName, rank, atLocker, locker, LK_AT };
}
