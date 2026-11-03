// 8 GATES · SPACE EVENTS (s603, Ben's picks). One event at a time, every 6-10 min of free flight (first after ~4 min), never in the arena.
// · DISTRESS CALL: a ship in trouble 250-450 u off. Causes: PIRATES (2-3 on it) · DEAD ENGINE (hold beside it 6 s to patch it) ·
//   GLITCHING MACHINES (hacked machines attack it; the call is STATIC, the only hint, Ben). 3 min to get there.
// · WORLD RAID: 3-4 pirates hit a world's dock; its DOCK HULL drops while they are near it. Beat them all = big reward (+ rare blueprint).
// · CONVOY UNDER FIRE: a world's own cargo ship (not yours) between two docks, jumped by pirates; it holds until they are gone.
// · RAIDERS FLEE: after a raid / pirate call is won, sometimes one runs for the nearest pirate base: CATCH it = loot; let it reach
//   the base and RAZE the base within 6 min = a big bonus (+ rare blueprint).
// · PREPARE TO BE BOARDED: a pirate gunner locks a tractor on you: TAP to break free (all ships for now; the walk-in cockpit-defence
//   wave is next). Fail = hull hit.
// IGNORED (didn't get there in time): a small standing loss with the nearest world (Ben). Rewards: gold, standing, ship items, salvage
// crates; blueprints only from world raids + bases (Ben).
export function createEvents(X) {
  const { THREE, scene, St, combat, toast, snd, save, docks, WORLDS, deep, MKT, fleets, IK, LOOKS, burst, giveItem, addCrates, portKey, WORLD_NAME = {}, blueprint, arena } = X;
  const rr = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const lenOf = g => { const b = new THREE.Box3().setFromObject(g); return Math.max(b.max.z - b.min.z, b.max.x - b.min.x) || 1; };
  function model(type, len) { const o = IK.build(type, (LOOKS || {})[type] || {}); o.group.userData.noFloat = true; o.group.scale.multiplyScalar(len / lenOf(o.group)); return o; }
  const ringM = new THREE.MeshBasicMaterial({ color: '#ec3013', transparent: true, opacity: 0.7, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(14, 0.6, 6, 48), ringM); ring.rotation.x = Math.PI / 2; ring.visible = false; scene.add(ring);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 1), new THREE.MeshBasicMaterial({ color: '#ff4fb4', transparent: true, opacity: 0.7, depthWrite: false })); beam.visible = false; scene.add(beam);
  let E = null, nextT = 240 + rr(0, 60), shipObj = null;
  const free = () => St.phase === 'free' && !St.menu && !St.tugAsk && !(arena && arena());
  const openDocks = () => docks.filter(d => !d.station && d.key !== 'p1' && WORLDS.some(w => w.key === d.key) && !(fleets && fleets.atWar(d.key)));
  const nearDock = (x, z) => { let b = null, bd = 1e9; for (const d of openDocks()) { const q = Math.hypot(d.x - x, d.z - z); if (q < bd) { bd = q; b = d; } } return b; };
  const alive = L => L.filter(p => p && !p.dead && combat.list && combat.list.includes(p));
  const ring2 = (x, z, n, r, cls) => { const L = []; for (let i = 0; i < n; i++) { const a = i / n * 6.28 + rr(0, 0.5), p = combat.arenaShip && combat.arenaShip(typeof cls === 'function' ? cls(i) : cls, x + Math.cos(a) * r, z + Math.sin(a) * r); if (p) L.push(p); } return L; };
  function setShip(type, len, x, z) { clearShip(); shipObj = model(type, len); shipObj.group.position.set(x, 0, z); scene.add(shipObj.group); }
  function clearShip() { if (shipObj) { scene.remove(shipObj.group); shipObj = null; } }
  function end() { E = null; ring.visible = false; beam.visible = false; clearShip(); St.evQuest = null; St.board = null; nextT = St.t + rr(360, 600); }
  function reward(o) { const d = nearDock(o.x, o.z), port = d ? portKey(d) : null, wn = d ? (WORLD_NAME[port] || d.name) : ''; const g = Math.round(rr(o.gold[0], o.gold[1])), bits = ['+' + g + ' G']; save.addGold(g);
    if (port && o.rep) { MKT.addRep(port, o.rep); bits.push('+' + o.rep + ' standing ' + wn); }
    if (Math.random() < (o.item || 0.4)) { const k = pick(['repair', 'fuel', 'shield', 'cell']); giveItem(k); bits.push('a ' + { repair: 'REPAIR KIT', fuel: 'FUEL CELL', shield: 'SHIELD CELL', cell: 'ENERGY CELL' }[k]); }
    if (Math.random() < (o.crates || 0.3)) { const n = addCrates(1 + Math.floor(Math.random() * 3)); if (n) bits.push(n + ' salvage crate' + (n > 1 ? 's' : '')); }
    if (o.bp && Math.random() < o.bp) { const b = blueprint(); if (b) bits.push('a BLUEPRINT: ' + b); }
    snd('pickup'); toast((o.title || 'DONE') + ' · ' + bits.join(' · '), 5.5); }
  function ignored(x, z, what) { const d = nearDock(x, z); if (d) MKT.addRep(portKey(d), -2); toast(what + ' · nobody came. ' + (d ? (WORLD_NAME[portKey(d)] || d.name) + ' noticed (-2 standing).' : ''), 4.5); end(); }
  const quest = (title, text) => { St.evQuest = { title, text }; };
  const where = (x, z) => { let b = null, bd = 1e9; for (const w of WORLDS) { const d = Math.hypot(w.x - x, w.z - z); if (d < bd) { bd = d; b = w; } } return b ? 'near ' + b.name : 'in deep space'; };
  // ---------- the events ----------
  function startDistress() { const a = rr(0, 6.28), r = rr(250, 450), x = St.x + Math.cos(a) * r, z = St.z + Math.sin(a) * r, cause = pick(['pirates', 'pirates', 'engine', 'machines']);
    setShip('hullCargo', 15, x, z); E = { k: 'distress', cause, x, z, t: 0, limit: 180, arrived: false, foes: [], fix: 0 };
    toast(cause === 'machines' ? 'COMMS · ...HELP... [STATIC] ...any ship... [STATIC] ' + where(x, z).toUpperCase() : cause === 'engine' ? 'DISTRESS CALL · a freighter ' + where(x, z) + ' has a dead engine. Can anyone help?' : 'DISTRESS CALL · a freighter ' + where(x, z) + ' is under attack! Pirates!', 5.5); snd('pirates');
    quest('DISTRESS CALL', cause === 'machines' ? 'A garbled call. Follow the red ring.' : 'A ship needs help. Follow the red ring. 3 min.'); }
  function startRaid() { const L = openDocks().filter(d => Math.hypot(d.x - St.x, d.z - St.z) < 900); if (!L.length) return startDistress(); const d = pick(L), port = portKey(d);
    E = { k: 'raid', d, port, x: d.x, z: d.z, t: 0, limit: 180, arrived: false, foes: [], hp: 100 }; toast('WORLD RAID · pirates are hitting the ' + (WORLD_NAME[port] || d.name) + ' dock! Defend it!', 5.5); snd('pirates'); quest('WORLD RAID · ' + (WORLD_NAME[port] || d.name), 'Drive the raiders off the dock.'); }
  function startConvoy() { const L = openDocks(); if (L.length < 2) return startDistress(); const A = pick(L.filter(d => Math.hypot(d.x - St.x, d.z - St.z) < 900)) || pick(L), B = pick(L.filter(d => d !== A)); const u = rr(0.25, 0.5), x = A.x + (B.x - A.x) * u, z = A.z + (B.z - A.z) * u;
    setShip('hullCargo', 17, x, z); E = { k: 'convoy', A, B, u, x, z, t: 0, limit: 180, arrived: false, foes: [] }; toast('CONVOY UNDER FIRE · a ' + (WORLD_NAME[portKey(A)] || A.name) + ' cargo ship ' + where(x, z) + ' is under attack!', 5.5); snd('pirates'); quest('CONVOY UNDER FIRE', 'Save the ' + (WORLD_NAME[portKey(A)] || A.name) + ' convoy.'); }
  function startBoard() { const a = rr(0, 6.28), x = St.x + Math.cos(a) * 30, z = St.z + Math.sin(a) * 30, p = combat.arenaShip && combat.arenaShip('gunner', x, z); if (!p) return; E = { k: 'board', p, t: 0 };
    St.board = { left: 5, taps: 0, need: 16 }; toast('PREPARE TO BE BOARDED · a pirate tractor has you! TAP TO BREAK FREE!', 4); snd('pirates'); quest('PREPARE TO BE BOARDED', 'Tap to break the tractor beam.'); }
  function startFlee(x, z) { const B = (deep.bases || []).filter(b => !b.razed); if (!B.length) return false; let b = B[0], bd = 1e9; for (const q of B) { const d = Math.hypot(q.x - x, q.z - z); if (d < bd) { bd = d; b = q; } }
    const p = combat.arenaShip && combat.arenaShip('fighter', x, z); if (!p) return false; E = { k: 'flee', p, base: b, t: 0 }; toast('RAIDERS FLEE · one is running for ' + b.name + '! Catch it for its loot, or follow it in.', 5); quest('RAIDERS FLEE', 'Catch the runner before it reaches ' + b.name + '.'); return true; }
  // the struggle (Space Map.dc.html card + keys call this)
  function boardTap() { const B = St.board; if (!B) return; B.taps++; snd('menu'); if (B.taps >= B.need) { St.board = null; const p = E && E.p; if (p && !p.dead) { combat.debuff && combat.debuff(p, 'stunT', 4); } toast('BROKE FREE · the tractor snaps. Now hit back!', 3); snd('shieldUp'); E = { k: 'boardFight', p, t: 0 }; quest('PIRATE GUNNER', 'Take it down.'); } }
  // ---------- tick ----------
  function tick(dt) { if (!E) { if (St.t > nextT && free()) { nextT = St.t + 30; const r = Math.random(); if (r < 0.34) startDistress(); else if (r < 0.56) startRaid(); else if (r < 0.78) startConvoy(); else startBoard(); } return; }
    E.t += dt; const dist = Math.hypot(St.x - E.x, St.z - E.z);
    ring.visible = E.x != null && E.k !== 'board' && E.k !== 'boardFight'; if (ring.visible) { ring.position.set(E.x, -0.5, E.z); ringM.opacity = 0.4 + Math.sin(St.t * 5) * 0.3; ring.scale.setScalar(E.k === 'raid' ? 3 : 1); }
    if (shipObj) { shipObj.tick && shipObj.tick(dt, 600); }
    if (E.k === 'distress' || E.k === 'convoy') {
      if (!E.arrived) { if (dist < 140) { E.arrived = true; if (E.cause === 'engine') { quest('DEAD ENGINE', 'Hold still beside the freighter to patch it.'); toast('Slow down beside it and hold still. Your crew patches the engine.', 3.5); } else { E.foes = ring2(E.x, E.z, E.cause === 'machines' ? 2 : 2 + (Math.random() < 0.5 ? 1 : 0), 40, E.cause === 'machines' ? 'machine' : i => i ? 'scout' : 'fighter'); quest(E.k === 'convoy' ? 'CONVOY UNDER FIRE' : 'DISTRESS CALL', 'Beat the attackers.'); } } else if (E.t > E.limit) return ignored(E.x, E.z, E.k === 'convoy' ? 'The convoy was lost' : 'The call went quiet'); return; }
      if (E.cause === 'engine') { const slow = Math.hypot(St.vx, St.vz) < 4 && dist < 22; E.fix = slow ? E.fix + dt : Math.max(0, E.fix - dt * 0.5); if (slow && Math.random() < 0.3) burst(E.x + rr(-2, 2), E.z + rr(-2, 2), '#ffd23a', 1, 0.5); St.evQuest = { title: 'DEAD ENGINE', text: 'Hold still beside it · ' + Math.min(100, Math.round(E.fix / 6 * 100)) + ' %' };
        if (E.fix >= 6) { reward({ x: E.x, z: E.z, gold: [30, 60], rep: 4, item: 0.6, crates: 0.4, title: 'ENGINE PATCHED · "We owe you one, fox."' }); end(); } else if (E.t > E.limit + 120 && dist > 300) end(); return; }
      if (!alive(E.foes).length) { const runs = Math.random() < 0.4 && E.cause !== 'machines', x = E.x, z = E.z; reward({ x, z, gold: E.k === 'convoy' ? [50, 90] : [40, 80], rep: E.k === 'convoy' ? 6 : 4, item: 0.4, crates: 0.4, title: E.k === 'convoy' ? 'CONVOY SAVED' : E.cause === 'machines' ? 'ATTACKERS DOWN · the static stops' : 'SHIP SAVED' }); end(); if (runs) startFlee(x + 30, z); }
      else if (E.k === 'convoy' && shipObj) { /* it holds while under fire */ }
      return; }
    if (E.k === 'raid') { if (!E.arrived) { if (dist < 220) { E.arrived = true; E.foes = ring2(E.x, E.z, 3 + (Math.random() < 0.5 ? 1 : 0), 55, i => ['fighter', 'scout', 'gunner', 'scout'][i]); } else if (E.t > E.limit) return ignored(E.x, E.z, 'The ' + (WORLD_NAME[E.port] || E.d.name) + ' dock was raided'); else return; }
      const L = alive(E.foes), near = L.filter(p => Math.hypot(p.x - E.x, p.z - E.z) < 140).length; E.hp = Math.max(0, E.hp - near * 1.6 * dt); St.evQuest = { title: 'WORLD RAID · ' + (WORLD_NAME[E.port] || E.d.name), text: 'DOCK HULL ' + Math.ceil(E.hp) + ' % · ' + L.length + ' raiders left' };
      if (near && Math.random() < dt * near) burst(E.x + rr(-8, 8), E.z + rr(-8, 8), '#ff8a3a', 4, 1);
      if (!L.length) { reward({ x: E.x, z: E.z, gold: [110, 160], rep: 10, item: 0.6, crates: 0.5, bp: 0.15, title: 'RAID BROKEN · ' + (WORLD_NAME[E.port] || E.d.name) + ' cheers you' }); const x = E.x, z = E.z; end(); if (Math.random() < 0.5) startFlee(x + 40, z); return; }
      if (E.hp <= 0) { MKT.addRep(E.port, -3); toast('The ' + (WORLD_NAME[E.port] || E.d.name) + ' dock took heavy damage. The raiders got away with its stores (-3 standing).', 5); L.forEach(p => combat.removeShip(p)); end(); } return; }
    if (E.k === 'flee') { const p = E.p, b = E.base; if (!p || p.dead) { reward({ x: St.x, z: St.z, gold: [40, 70], rep: 0, item: 0.5, crates: 0.7, title: 'RUNNER CAUGHT · its loot is yours' }); end(); return; }
      const dx = b.x - p.x, dz = b.z - p.z, d = Math.hypot(dx, dz) || 1; combat.tractorHold(p, p.x + dx / d * 26 * dt * 4, p.z + dz / d * 26 * dt * 4); E.x = p.x; E.z = p.z; St.evQuest = { title: 'RAIDERS FLEE', text: 'Catch it · ' + Math.round(d) + ' u from ' + b.name };
      if (d < 70) { combat.removeShip(p); E = { k: 'base', base: b, t: 0, x: b.x, z: b.z }; b.known = true; toast('It made it to ' + b.name + '. Raze the base within 6 min for a big bonus!', 5); quest('RAZE ' + b.name, 'Destroy the base · 6 min.'); } return; }
    if (E.k === 'base') { const b = E.base; St.evQuest = { title: 'RAZE ' + b.name, text: Math.max(0, Math.ceil((360 - E.t) / 60)) + ' MIN LEFT' }; if (b.razed) { reward({ x: b.x, z: b.z, gold: [200, 260], rep: 0, item: 0.8, crates: 0.6, bp: 0.35, title: 'BASE RAZED IN TIME · bonus' }); end(); } else if (E.t > 360) { toast('Too slow. The raiders dug in at ' + b.name + '.', 3.5); end(); } return; }
    if (E.k === 'board') { const p = E.p, B = St.board; if (!p || p.dead) { end(); return; } beam.visible = true; const ex = St.x - p.x, ez = St.z - p.z, el = Math.hypot(ex, ez) || 1; beam.position.set((St.x + p.x) / 2, 0.3, (St.z + p.z) / 2); beam.rotation.y = Math.atan2(ex, ez); beam.scale.set(1 + Math.sin(St.t * 30) * 0.3, 1, el);
      St.vx *= Math.exp(-dt * 3); St.vz *= Math.exp(-dt * 3); St.x += -ex / el * Math.max(0, el - 14) * dt * 0.8; St.z += -ez / el * Math.max(0, el - 14) * dt * 0.8;
      if (B) { B.left -= dt; if (B.left <= 0) { St.board = null; beam.visible = false; St.hull = Math.max(1, St.hull - 20); snd('hurt'); toast('BOARDERS hit your hull before you broke loose (-20 HULL). Fight back!', 4); E = { k: 'boardFight', p, t: 0 }; quest('PIRATE GUNNER', 'Take it down.'); } } return; }
    if (E.k === 'boardFight') { beam.visible = false; if (!E.p || E.p.dead) { reward({ x: St.x, z: St.z, gold: [40, 70], rep: 0, item: 0.5, crates: 0.5, title: 'BOARDERS BEATEN' }); end(); } else if (E.t > 120 && Math.hypot(E.p.x - St.x, E.p.z - St.z) > 300) end(); return; }
  }
  return { tick, boardTap, get on() { return !!E; }, get kind() { return E && E.k; }, course() { return E && E.x != null && E.k !== 'board' && E.k !== 'boardFight' ? { x: E.x, z: E.z, name: (St.evQuest && St.evQuest.title) || 'EVENT' } : null; },
    test(k) { if (E) end(); ({ distress: startDistress, raid: startRaid, convoy: startConvoy, board: startBoard })[k || 'distress'](); }, stop() { if (E) end(); } };
}
