// 8 GATES · TRADE CONVOYS ON THE MAP (s599 · s601 one per TRADE DEAL · s601b ESCORTED, Ben). Each deal's CARGO SHIP sits beside its
// start dock (IN = the deal's world, OUT = your planet). When a run is due it shows a ring: fly up beside it (30 u) and it sails, you
// escort it. It only moves while you stay close (150 u) and no pirates are on it; it waits forever. CONVOY CALL once a run (25-60 % of
// the way): pirates jump it, beat them = it sails on; run off (300 u) while they are on it = LOST (the run is used, nothing moves).
// Arrival = the run settles (trade-deals runOne). Nothing runs while you are off the space map.
export function createConvoys({ THREE, scene, IK, LOOKS, save, combat, toast, snd, WORLDS, homeKey = 'p1', deals, shipSpec, goodName, place, canRun, runOne, lostRun, finish, WORLD_NAME = {}, RISK = 0.15 }) {
  const live = new Map(), SPEED = 13, NEAR = 30, KEEP = 150, LOSE = 300;
  const lenOf = g => { const b = new THREE.Box3().setFromObject(g); return Math.max(b.max.z - b.min.z, b.max.x - b.min.x) || 1; };
  function model(type, len) { const o = IK.build(type, (LOOKS || {})[type] || {}); o.group.userData.noFloat = true; o.group.scale.multiplyScalar(len / lenOf(o.group)); if (o.api && o.api.snapRamp) o.api.snapRamp(0); return o; }
  const jammed = () => !save.stat('spaceYardGuardFree', 0);
  const nearName = (x, z) => { let b = null, bd = 1e9; for (const w of WORLDS) { const d = Math.hypot(w.x - x, w.z - z); if (d < bd) { bd = d; b = w; } } return b ? b.name : 'SPACE'; };
  const ringM = new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.8, depthWrite: false });
  function build(d) { const g = new THREE.Group(); scene.add(g); const len = shipSpec(save, d.ship)[4] || 17, cargo = model('hullCargo', len); g.add(cargo.group);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(len * 0.75, 0.5, 6, 40), ringM.clone()); ring.rotation.x = Math.PI / 2; ring.position.y = -0.5; g.add(ring); return { g, cargo, ring, ship: d.ship, foes: [], told: 0, holdT: 0 }; }
  const nm = k => WORLD_NAME[k] || k;
  let saveT = 0;
  function tick(dt, St) { const L = deals(save), seen = new Set(), now = Date.now(); let dirty = false, out = null;
    for (const d of L) { seen.add(d.id); let C = live.get(d.id); if (C && C.ship !== d.ship) { scene.remove(C.g); live.delete(d.id); C = null; } if (!C) { C = build(d); live.set(d.id, C); }
      const a = d.dir === 'in' ? place(d.port) : place(homeKey), b = d.dir === 'in' ? place(homeKey) : place(d.port), gname = goodName(d.good), toName = d.dir === 'in' ? 'your planet' : nm(d.port); if (!a || !b) continue;
      const dx = b.x - a.x, dz = b.z - a.z, LEN = Math.hypot(dx, dz) || 1, ux = dx / LEN, uz = dz / LEN, sx = a.x + ux * 24 - uz * 12, sz = a.z + uz * 24 + ux * 12;   // parks off the dock, toward the lane
      const ready = now >= d.last + shipSpec(save, d.ship)[2] * 60000, free = St.phase === 'free';
      C.cargo.tick && C.cargo.tick(dt, 600); C.g.rotation.y = Math.atan2(dx, dz) + Math.PI;
      if (d.ph !== 'sail') { C.g.position.set(sx, 0, sz); C.g.visible = true; const dist = Math.hypot(St.x - sx, St.z - sz), ok = ready && canRun(save, d);
        C.ring.visible = ready; C.ring.material.color.set(ok ? '#ffd23a' : '#ec3013'); C.ring.material.opacity = 0.45 + Math.sin(St.t * 4) * 0.3;
        if (ready && free && dist < 170 && now - C.told > 60000) { C.told = now; toast(ok ? 'CARGO SHIP READY · fly beside it to escort the ' + gname + ' run to ' + toName + '.' : 'CARGO SHIP WAITING · ' + canRun(save, d).why, 4.5); }
        if (ok && free && dist < NEAR) { d.ph = 'sail'; d.u = 0; d.hit = false; C.foes = []; dirty = true; toast('ESCORT · the ' + gname + ' convoy is under way to ' + toName + '. Stay close.', 4.5); snd && snd('undock'); } continue; }
      // sailing
      C.ring.visible = false; const u = d.u || 0, x = sx + (b.x - sx) * u, z = sz + (b.z - sz) * u, dist = Math.hypot(St.x - x, St.z - z), foes = C.foes.filter(p => !p.dead && combat.list && combat.list.includes(p));
      C.g.position.set(x, 0, z); C.g.visible = true;
      if (!d.hit && u > 0.25 && u < 0.6) { d.hit = true; dirty = true; const odds = RISK * 1.5 + (jammed() && d.port === 'meru' ? 0.1 : 0);
        if (Math.random() < odds) { for (let i = 0; i < 2; i++) { const an = Math.random() * 6.28, p = combat.arenaShip && combat.arenaShip('scout', x + Math.cos(an) * 45, z + Math.sin(an) * 45); if (p) C.foes.push(p); }
          if (C.foes.length) { toast('CONVOY CALL · pirates on your ' + gname + ' convoy near ' + nearName(x, z) + '! Drive them off.', 5); snd && snd('pirates'); } } }
      if (C.foes.length && !foes.length) { C.foes = []; toast('CONVOY SAFE · the ' + gname + ' run sails on.', 3); snd && snd('shieldUp'); }
      if (foes.length && dist > LOSE) { const line = lostRun(d); C.foes = []; d.ph = 'dock'; d.u = 0; d.last = now; dirty = true; toast(line + '. You left it.', 4.5); if (d.left <= 0) out = (out || []).concat(d.id); continue; }
      if (dist < KEEP && !foes.length) d.u = Math.min(1, u + SPEED * dt / LEN);
      else if (!foes.length && (C.holdT -= dt) <= 0) { C.holdT = 20; toast('The ' + gname + ' convoy is holding. Fly back beside it.', 3); }
      if (d.u >= 1) { const line = runOne(save, d); d.ph = 'dock'; d.u = 0; d.last = now; dirty = true; toast(line, 4.5); snd && snd('pickup'); if (d.left <= 0) out = (out || []).concat(d.id); } }
    for (const [k, C] of live) if (!seen.has(k)) { scene.remove(C.g); live.delete(k); }
    if (out) { const done = L.filter(d => out.includes(d.id)); for (const d of done) setTimeout(() => toast(finish(save, d), 5), 4800); save.setStat('tradeDeals', L.filter(d => !out.includes(d.id))); return; }
    if (dirty || (saveT -= dt) <= 0) { saveT = 2; save.setStat('tradeDeals', L); } }
  return { tick, get list() { return [...live.values()]; } };
}
