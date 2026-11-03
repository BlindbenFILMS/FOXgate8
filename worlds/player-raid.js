// PLAYER PLANET · BEAR RAIDS + THE ARMY v1 (s507). Bears come down off the plains at night (from day 3, every 2-4 days) and go for
// buildings. Hard fail (Ben): a bear left alone smashes a building → DAMAGED (stops counting for the town, smoke, red sign) until
// REPAIRED. Fight back: 1 MELEE (sword, close) · 2 RANGE (laser, the nearest bear ahead) → the bear is SCARED OFF back north.
// BARRACKS = a PLATOON of 4 soldiers (military law): follows you by default; board → THE ARMY: FOLLOW ME / GUARD THE COMMONS /
// GUARD THE FARM, BETTER WEAPONS (×2). Galaxy law: the army stays on this world. A WATCHTOWER warns before a raid. All numbers DRAFT.
export function makeRaids(X) {
  const { THREE, M, BOX, toon, basic, glowSprite, sign, scene, animal, ANIM, Hg, P, St, save, note, toast, prompt, audio, chime, BUILD, PLOTS, makeFox, animFox } = X;
  const S = () => save.data.stats || {};
  const dmg = () => new Set(S().ppDamaged || []), setDmg = s => save.setStat('ppDamaged', [...s]);
  const R = { on: false, bears: [], next: S().ppRaidDay || 3, hp: 100, hurtT: 0, warned: false, fx: [] };
  const army = () => ({ mode: 'follow', arms: 0, ...(S().ppArmy || {}) }), setArmy = o => save.setStat('ppArmy', o);
  // ---------- damage marks on buildings ----------
  const marks = new Map();
  function markDamaged(id) { const e = BUILD.doneGroup(id); if (!e || marks.has(id)) return; const { g, p } = e, w = p.w || 16; g.rotation.z = 0.035;
    const m = new THREE.Group(); m.position.set(p.x, Hg(p.x, p.z), p.z); scene.add(m); const sm = []; for (let i = 0; i < 5; i++) { const s2 = glowSprite(RR(-w / 4, w / 4), 8, 0, '#3a3836', 4, 0, m); s2.material.blending = THREE.NormalBlending; sm.push({ s: s2, o: i / 5 }); }
    M(BOX(0.2, 2.4, 0.2), toon('#3a2618'), -w / 2 + 1, 1.2, (p.d || 14) / 2 + 2.6, m, 0); sign(m, 'DAMAGED', 3, 1.2, -w / 2 + 1, 2.6, (p.d || 14) / 2 + 2.75, 0, { bg: '#ec3013', sub: 'E · REPAIR IT' }); marks.set(id, { m, sm, g }); }
  function repair(id) { const k = marks.get(id); if (k) { scene.remove(k.m); k.g.rotation.z = 0; marks.delete(id); } const s = dmg(); s.delete(id); setDmg(s); }
  for (const id of dmg()) markDamaged(id);
  const RR = (a, b) => a + (b - a) * Math.random();
  // ---------- the platoon ----------
  const SOL = [];
  function spawnPlatoon() { if (SOL.length || !BUILD.builds().some(b => b.done && b.k === 'barracks')) return; for (let i = 0; i < 4; i++) { const c = makeFox({ key: 'ppSoldier' + i, torso: '#ec3013', look: X.LOOK(i + 3), outfit: 'armor', eyes: ['#3a2a1a', '#3a2a1a'], mood: 'neutral' }); c.position.set(P.x - 4 - i, Hg(P.x, P.z + 6), P.z + 6); SOL.push({ c, cd: 0, i }); } chime(); note('THE PLATOON', 'Four soldiers report from the barracks. They follow you. THE ARMY on the build board gives orders.'); }
  const POSTS = { commons: [0, 20], farm: [40, -230] };
  function armyMenu() { const A = army(), has = SOL.length > 0, s = BUILD.stock();
    prompt('THE ARMY', has ? '1 PLATOON · 4 SOLDIERS · ' + (A.arms ? 'BETTER WEAPONS' : 'STANDARD WEAPONS') + ' · ORDERS: ' + ({ follow: 'FOLLOW ME', commons: 'GUARD THE COMMONS', farm: 'GUARD THE FARM' }[A.mode]) : 'No army yet. Build a BARRACKS: military law needs soldiers.', [
      ['FOLLOW ME', () => { setArmy({ ...A, mode: 'follow' }); toast('Platoon: following you.'); }, !has || A.mode === 'follow'],
      ['GUARD THE COMMONS', () => { setArmy({ ...A, mode: 'commons' }); toast('Platoon: guarding the Commons.'); }, !has || A.mode === 'commons'],
      ['GUARD THE FARM', () => { setArmy({ ...A, mode: 'farm' }); toast('Platoon: guarding the farm.'); }, !has || A.mode === 'farm'],
      ['BETTER WEAPONS · 80 PLANET GOLD', () => { const q = BUILD.stock(); q.g -= 80; BUILD.setStock(q); setArmy({ ...A, arms: 1 }); chime(); toast('New weapons for the platoon. Twice the punch.'); }, !has || A.arms || s.g < 80],
      ['BACK', () => BUILD.board()]]); }
  // ---------- raids ----------
  function startRaid() { if (R.on) return; R.on = true; R.warned = false; const n = 2 + (St.day % 3 === 0 ? 1 : 0); for (let i = 0; i < n; i++) { const o = animal('bear', null, RR(-120, 160), -410 - i * 8); ANIM.pop(); o.hp = 4; o.state = 'raid'; o.smash = 0; o.target = null; o.hitT = 0; R.bears.push(o); }
    audio.tone(80, 1.4, 0.08, 'sawtooth', 0.6); note('BEAR RAID!', (BUILD.totals().guard ? 'The watch rings the bell. ' : '') + n + ' bears are coming down off the plains. Press 1 or 2 to drive them off!'); }
  function endRaid() { R.on = false; R.bears.forEach(b => scene.remove(b.g)); R.bears = []; R.next = St.day + 2 + (St.day % 3); save.setStat('ppRaidDay', R.next); const d = dmg().size; chime(); note('THE RAID IS OVER', d ? d + ' building' + (d > 1 ? 's' : '') + ' damaged. Walk up and press E to repair.' : 'Not a scratch. Well defended!'); }
  function targets() { const T = []; for (const [id, e] of BUILD.doneEntries()) if (!dmg().has(id)) T.push({ id, x: e.p.x, z: e.p.z }); T.push({ id: 'barn', x: 90, z: -232 }, { id: 'cc', x: 0, z: -14 }); return T; }
  function hitBear(o, n) { o.hp -= n; o.flash = 0.2; audio.tone(160, 0.25, 0.07, 'sawtooth', 0.6); if (o.hp <= 0 && o.state !== 'flee') { o.state = 'flee'; audio.tone(70, 0.8, 0.08, 'sawtooth', 0.5); toast('The bear turns tail and runs!'); } }
  function attack(n) { if ((!R.on && !PR.on) || St.inside) return false; let best = null, bd = n === 1 ? 4 : 28; for (const o of allFoes()) { const dx = o.g.position.x - P.x, dz = o.g.position.z - P.z, d = Math.hypot(dx, dz); if (n === 2 && d > 3) { const a = Math.atan2(dx, dz) - P.face; if (Math.cos(a) < 0.7) continue; } if (d < bd) { bd = d; best = o; } }
    if (n === 1) { audio.tone(700, 0.08, 0.05, 'triangle', 0.5); if (best) best.hit(1); return true; }
    audio.tone(1400, 0.15, 0.04, 'square', 0.4); const end = best ? best.g.position.clone().setY(best.g.position.y + 1.4) : new THREE.Vector3(P.x + Math.sin(P.face) * 25, P.gy + 1.4, P.z + Math.cos(P.face) * 25), st2 = new THREE.Vector3(P.x, P.gy + 1.2, P.z);
    const len = st2.distanceTo(end), las = new THREE.Mesh(BOX(0.12, 0.12, len), basic('#ff3a2a', 0.9, true)); las.position.copy(st2).lerp(end, 0.5); las.lookAt(end); scene.add(las); R.fx.push({ m: las, t: 0.12 }); if (best) best.hit(1); return true; }
  // ---------- PIRATE RAIDS (s515): a pirate ship anchors off the beach at dusk, a landing party walks up to the Community Center to
  // steal from the PLANET STORE (gold + crystal), then runs back to the boat. LIGHTHOUSE = an early warning; DEFENCE TURRETS shoot
  // raiders (need power after dark); the platoon fights them. Knocked-out pirates surrender and are shipped off. All numbers DRAFT.
  const PR = { on: false, foes: [], next: S().ppPirateDay || 6, ship: null, warned: false };
  const ship = new THREE.Group(); { const hull = toon('#3a2418'), sail = toon('#201e1d'); M(BOX(5, 2.4, 16), hull, 0, 0.6, 0, ship); M(BOX(5.4, 0.4, 16.4), toon('#ec3013'), 0, 1.9, 0, ship, 0); const bow = M(new THREE.ConeGeometry(2.5, 5, 4), hull, 0, 0.6, -10, ship); bow.rotation.x = -Math.PI / 2; bow.rotation.y = Math.PI / 4;
    for (const z of [-3, 4]) { M(new THREE.CylinderGeometry(0.2, 0.25, 14, 6), toon('#5a3a22'), 0, 8, z, ship, 0); const sl = M(BOX(6, 6, 0.15), sail, 0, 8.5, z + 0.3, ship, 0); sl.rotation.y = 0.1; } M(BOX(2, 1.2, 0.08), toon('#ec3013'), 1, 15.4, -3, ship, 0); ship.visible = false; scene.add(ship); }
  const BEACH = [60, 296], CCP = [0, -10];
  const allFoes = () => [...R.bears.filter(b => b.state !== 'flee').map(b => ({ g: b.g, hit: n => hitBear(b, n) })), ...PR.foes.filter(p => p.st === 'raid' || p.st === 'loot').map(p => ({ g: p.c, hit: n => hitPirate(p, n) }))];
  function startPirates() { if (PR.on) return; PR.on = true; PR.warned = false; ship.visible = true; ship.position.set(70, 0, 420); ship.rotation.y = 0; const n = 3 + (St.day % 2);
    for (let i = 0; i < n; i++) { const c = makeFox({ key: 'ppPirate' + i, torso: ['#201e1d', '#5a1a1a', '#2a3a5a'][i % 3], look: X.LOOK(i + 5), outfit: 'coat', eyes: ['#ec3013', '#ec3013'], mood: 'angry' }); c.visible = false; PR.foes.push({ c, st: 'boat', hp: 3, t: i * 1.4, loot: 0, cd: 0, i, path: 0 }); }
    audio.tone(110, 1.6, 0.07, 'sawtooth', 0.7); note('PIRATES!', 'A black-sailed ship drops anchor off the beach. They are after the planet store. Stop them at the shore!'); }
  function hitPirate(p, n) { p.hp -= n; p.flash = 0.2; audio.tone(260, 0.2, 0.06, 'sawtooth', 0.6); if (p.hp <= 0) { if (p.loot) { const s = BUILD.stock(); s.g += p.loot.g; s.c += p.loot.c; BUILD.setStock(s); toast('You got the stolen loot back!'); p.loot = 0; } p.st = 'down'; p.t = 2.5; audio.tone(90, 0.6, 0.06, 'sawtooth', 0.6); } }
  function endPirates() { PR.on = false; const caught = PR.foes.filter(p => p.st === 'down' || p.st === 'cuffed').length, lost = PR.foes.filter(p => p.st === 'gone' && p.took).reduce((a, p) => a + p.took, 0); PR.foes.forEach(p => scene.remove(p.c)); PR.foes = []; PR.sail = 1;
    PR.next = St.day + 5 + (St.day % 3); save.setStat('ppPirateDay', PR.next); if (caught) { const s = BUILD.stock(); s.t += caught * 6; BUILD.setStock(s); } chime(); note('THE PIRATES SAIL OFF', (caught ? caught + ' caught and shipped to Meru for trial. They left ' + caught * 6 + ' timber behind. ' : '') + (lost ? 'They got away with ' + lost + ' planet gold.' : 'The planet store is safe!')); }
  const TUR = new Map();
  function turrets() { const out = []; for (const [id, e] of BUILD.doneEntries()) { const b = BUILD.builds().find(q => q.id === id); if (b && b.k === 'turret' && !dmg().has(id)) out.push({ id, x: e.p.x, z: e.p.z }); } return out; }
  function pirateTick(dt, t) {
    const evening = St.hour > 18 && St.hour < 21; if (!PR.on && St.day >= PR.next && evening && St.phase === 'free' && !R.on) { if (BUILD.builds().some(b => b.done && b.k === 'lighthouse') && !PR.warned) { PR.warned = true; note('THE LIGHTHOUSE', 'Black sails on the horizon! Pirates will land in a few moments. Get to the beach!'); setTimeout(startPirates, 9000); } else if (!PR.warned) startPirates(); }
    if (PR.sail) { ship.position.z += dt * 6; if (ship.position.z > 560) { PR.sail = 0; ship.visible = false; } }
    if (!PR.on) return; if (ship.position.z > 330) ship.position.z = Math.max(330, ship.position.z - dt * 8); ship.position.y = Math.sin(t * 1.2) * 0.2; ship.rotation.z = Math.sin(t) * 0.03;
    const powered = St.hour > 6.5 && St.hour < 18.5 || BUILD.totals().power > 2, TT = turrets();
    for (const p of PR.foes) { const c = p.c; let tx = null, tz = null, sp = 0;
      if (p.st === 'boat') { if (ship.position.z <= 332) { p.t -= dt; if (p.t <= 0) { p.st = 'raid'; c.visible = !St.inside; c.position.set(BEACH[0] + (p.i - 1.5) * 2.4, 0, BEACH[1]); } } continue; }
      if (p.st === 'down') { p.t -= dt; c.rotation.x = Math.min(Math.PI / 2, c.rotation.x + dt * 4); c.position.y = Math.max(0, Hg(c.position.x, c.position.z)) + 0.3; if (p.t <= 0) { p.st = 'cuffed'; c.visible = false; } continue; }
      if (p.st === 'cuffed' || p.st === 'gone') { c.visible = false; continue; }
      const pd = Math.hypot(P.x - c.position.x, P.z - c.position.z);
      if (p.st === 'raid') { if (pd < 6 && !St.inside) { tx = P.x; tz = P.z; sp = 4; p.cd -= dt; if (pd < 2.2 && p.cd <= 0) { p.cd = 1.3; hurt(6, 'A pirate swings a cutlass!', 'A PIRATE'); } }
        else { const wp = c.position.z > 60 ? [60, 40] : CCP; tx = wp[0] + (p.i - 1.5) * 2; tz = wp[1]; sp = 3.4; const dcc = Math.hypot(CCP[0] - c.position.x, CCP[1] - c.position.z); if (dcc < 7) { sp = 0; p.steal = (p.steal || 0) + dt; if (p.steal > 7) { const s = BUILD.stock(), g = Math.min(40, Math.floor(s.g * 0.3)), cr = Math.min(3, Math.floor(s.c)); s.g -= g; s.c -= cr; BUILD.setStock(s); p.loot = { g, c: cr }; p.took = g; p.st = 'loot'; note('THE STORE IS ROBBED!', 'A pirate grabbed ' + g + ' gold and ' + cr + ' crystal. Catch them before the boat!'); } } } }
      else if (p.st === 'loot') { tx = BEACH[0]; tz = BEACH[1] + 6; sp = 4.6; if (Math.hypot(tx - c.position.x, tz - c.position.z) < 3) { p.st = 'gone'; toast('A pirate rows off with the loot!'); } }
      if (tx != null && sp) { const dx = tx - c.position.x, dz = tz - c.position.z, d = Math.hypot(dx, dz) || 1; c.position.x += dx / d * sp * dt; c.position.z += dz / d * sp * dt; c.rotation.y = Math.atan2(dx, dz); }
      c.position.y = Math.max(-0.6, Hg(c.position.x, c.position.z)); if (p.flash > 0) { p.flash -= dt; c.position.y += 0.25; } c.visible = !St.inside; animFox(c, dt, sp);
      for (const T of TT) { if (!powered) break; const k = TUR.get(T.id) || { cd: 0 }; TUR.set(T.id, k); k.cd -= dt / Math.max(1, PR.foes.length); if (k.cd <= 0 && Math.hypot(c.position.x - T.x, c.position.z - T.z) < 45) { k.cd = 1.6; const a = new THREE.Vector3(T.x, Hg(T.x, T.z) + 7, T.z), b = c.position.clone().setY(c.position.y + 1.2), las = new THREE.Mesh(BOX(0.18, 0.18, a.distanceTo(b)), basic('#7fe3ff', 0.9, true)); las.position.copy(a).lerp(b, 0.5); las.lookAt(b); scene.add(las); R.fx.push({ m: las, t: 0.14 }); if (!St.inside && Math.hypot(P.x - T.x, P.z - T.z) < 60) audio.tone(1800, 0.12, 0.03, 'square', 0.3); hitPirate(p, 1); } } }
    if (PR.foes.length && PR.foes.every(p => p.st === 'cuffed' || p.st === 'gone')) endPirates(); }
  function tick(dt, t) { pirateTick(dt, t);
    for (let i = R.fx.length - 1; i >= 0; i--) { const f = R.fx[i]; f.t -= dt; if (f.t <= 0) { scene.remove(f.m); R.fx.splice(i, 1); } }
    for (const k of marks.values()) for (const p of k.sm) { const u = (t * 0.2 + p.o) % 1; p.s.position.y = 6 + u * 10; p.s.scale.setScalar(3 + u * 6); p.s.material.opacity = 0.5 * (1 - u); }
    spawnPlatoon();
    if (!R.on && St.day >= R.next && (St.hour > 21.5 || St.hour < 2) && St.phase === 'free') { if (BUILD.totals().guard && !R.warned) { R.warned = true; note('WATCHTOWER', 'Bears moving on the plains. They will be here soon!'); setTimeout(startRaid, 8000); } else if (!R.warned) startRaid(); }
    R.hurtT -= dt; if (R.hp < 100 && !R.on && R.hurtT < -4) R.hp = Math.min(100, R.hp + dt * 4);
    const A = army(), dm = A.arms ? 2 : 1;
    for (const o of R.bears) { const g = o.g; let spd = 0, tx, tz;
      if (o.state === 'flee') { tx = g.position.x; tz = -520; spd = 6; if (g.position.z < -440) { o.gone = true; } }
      else { if (!o.target || (o.target.id !== 'cc' && o.target.id !== 'barn' && dmg().has(o.target.id))) { const T = targets(); o.target = T.sort((a, b) => Math.hypot(a.x - g.position.x, a.z - g.position.z) - Math.hypot(b.x - g.position.x, b.z - g.position.z))[0]; o.smash = 0; }
        const dp = Math.hypot(P.x - g.position.x, P.z - g.position.z); if (dp < 10 && !St.inside) { tx = P.x; tz = P.z; spd = 3.6; if (dp < 2.4 && R.hurtT <= 0) { R.hurtT = 1.4; R.hp -= 12; audio.tone(120, 0.3, 0.08, 'sawtooth', 0.5); toast('The bear swipes at you!'); if (R.hp <= 0) { R.hp = 100; X.faint(); } } }
        else { tx = o.target.x; tz = o.target.z; const d = Math.hypot(tx - g.position.x, tz - g.position.z); if (d > 10) spd = 3.2; else { o.smash += dt; if (Math.sin(t * 6) > 0.9) audio.tone(200, 0.1, 0.03, 'square'); if (o.smash > 9 && o.target.id !== 'cc' && o.target.id !== 'barn') { const s = dmg(); s.add(o.target.id); setDmg(s); markDamaged(o.target.id); note('A BUILDING IS DAMAGED', 'The bear wrecked the ' + BUILD.nameOf(o.target.id) + '. Drive it off!'); o.target = null; } else if (o.smash > 9) { o.smash = 0; toast(o.target.id === 'barn' ? 'The bear is scaring the barn animals!' : 'The bear is clawing at the Community Center!'); } } } }
      if (spd) { const dx = tx - g.position.x, dz = tz - g.position.z, d = Math.hypot(dx, dz) || 1; g.position.x += dx / d * spd * dt; g.position.z += dz / d * spd * dt; let df = Math.atan2(-dx, -dz) - g.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); g.rotation.y += df * Math.min(1, dt * 4); }
      g.position.y = Hg(g.position.x, g.position.z); o.ph += dt * (spd ? 8 : o.smash ? 14 : 0); o.legs.forEach((l, i) => { l.rotation.x = Math.sin(o.ph + (i % 2 ? Math.PI : 0)) * 0.6; }); if (o.flash > 0) { o.flash -= dt; g.position.y += 0.3; }
      g.visible = !St.inside; }
    if (R.on) { R.bears = R.bears.filter(b => { if (b.gone) { scene.remove(b.g); return false; } return true; }); if (!R.bears.length) endRaid(); }
    // soldiers
    SOL.forEach((s, i) => { const c = s.c; let tx, tz; const foe = allFoes().sort((a, b) => Math.hypot(a.g.position.x - c.position.x, a.g.position.z - c.position.z) - Math.hypot(b.g.position.x - c.position.x, b.g.position.z - c.position.z))[0], fd = foe ? Math.hypot(foe.g.position.x - c.position.x, foe.g.position.z - c.position.z) : 1e9;
      if (foe && fd < 70) { tx = foe.g.position.x + (i % 2 ? 1.6 : -1.6); tz = foe.g.position.z + (i < 2 ? 1.6 : -1.6); s.cd -= dt; if (fd < 3 && s.cd <= 0) { s.cd = 1.2; foe.hit(0.5 * dm); } }
      else if (A.mode === 'follow') { const back = 3 + Math.floor(i / 2) * 1.6, side = (i % 2 ? 1 : -1) * 1.4; tx = P.x - Math.sin(P.face) * back + Math.cos(P.face) * side; tz = P.z - Math.cos(P.face) * back - Math.sin(P.face) * side; }
      else { const p = POSTS[A.mode]; tx = p[0] + (i % 2 ? 3 : -3); tz = p[1] + (i < 2 ? 3 : -3); }
      const dx = tx - c.position.x, dz = tz - c.position.z, d = Math.hypot(dx, dz), sp = d > 0.4 ? Math.min(8, d * 2.4) : 0; if (d > 60 && A.mode === 'follow' && !foe) { c.position.set(tx, Hg(tx, tz), tz); } else if (sp) { c.position.x += dx / d * sp * dt; c.position.z += dz / d * sp * dt; c.rotation.y = Math.atan2(dx, dz); }
      c.position.y = Hg(c.position.x, c.position.z); c.visible = !St.inside; animFox(c, dt, sp); if (foe && fd < 3) { const Ar = c.userData.P && c.userData.P.arms; if (Ar && Ar[1]) Ar[1].rotation.x = -1.8 + Math.sin(t * 10 + i) * 1.1; } });
  }
  const nearDamaged = (x, z) => { for (const id of dmg()) { const e = BUILD.doneGroup(id); if (e && Math.abs(x - e.p.x) < (e.p.w || 16) / 2 + 4 && Math.abs(z - e.p.z) < (e.p.d || 14) / 2 + 5) return id; } return null; };
  function repairMenu(id) { const s = BUILD.stock(), ok = s.g >= 15 && s.t >= 10; prompt('REPAIR · ' + BUILD.nameOf(id), 'Bear damage. 15 PLANET GOLD · 10 TIMBER (DRAFT)', [['REPAIR IT', () => { const q = BUILD.stock(); q.g -= 15; q.t -= 10; BUILD.setStock(q); repair(id); chime(); toast('Good as new.'); }, !ok], ...(ok ? [] : [['NOT ENOUGH · SELL CRYSTAL OR DONATE', () => BUILD.budget()]]), ['NOT NOW', null]]); }
  function hurt(n, msg, who) { if (R.hurtT > 0) return; R.hurtT = 1; R.hp -= n; audio.tone(120, 0.3, 0.08, 'sawtooth', 0.5); toast(msg); if (R.hp <= 0) { R.hp = 100; X.faint(who); } }
  return { startPirates, get pirates() { return PR.on; }, hurt, tick, attack, armyMenu, startRaid, nearDamaged, repairMenu, get on() { return R.on || PR.on; }, get hp() { return Math.round(R.hp); }, isDamaged: id => dmg().has(id), R };
}
