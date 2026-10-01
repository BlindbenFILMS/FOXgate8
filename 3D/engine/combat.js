// Shared light combat for walk-around rooms (caves, wilds, ambushes). The Arena keeps its own fuller engine.
// Player: melee swing (arc), ranged laser (hitscan, auto-aims inside a cone). Foes: melee or ranged, chase,
// telegraph (wind-up), strike; ranged shots lock their aim at wind-up so moving dodges them.
//   const CB = createCombat({ THREE, scene, audio, move });   // move(o, nx, nz, r) = the room's wall slide
//   CB.add(npc, { hp, dmg, speed, ranged, cd, wind });       // npc = a town fox record { x, z, face, c }
//   CB.engage(list?)   all (or the listed) foes turn hostile
//   CB.attack('melee'|'range', Pl, playerFox, { laserDmg, hit: extra targets [{x,z,r,onHit}] })
//   CB.update(dt, Pl, playerFox) → { playerDown, allDown, active }
import { damp } from '../village-game.js';

export function createCombat({ THREE, scene, audio, move }) {
  const foes = [], P = { hp: 100, max: 100, meleeCd: 0, shotCd: 0, swingT: 0, shootT: 0, hurtT: 0, inv: 0 };
  const beams = []; const beamGeo = new THREE.CylinderGeometry(0.035, 0.035, 1, 6, 1, true); beamGeo.translate(0, 0.5, 0); beamGeo.rotateX(Math.PI / 2);
  function beam(from, to, color) { const m = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, depthWrite: false })); m.position.copy(from); m.lookAt(to); m.scale.set(1, 1, from.distanceTo(to)); scene.add(m); beams.push({ m, t: 0, life: 0.14 }); return m; }
  const tele = [];
  const A = new THREE.Vector3(), B = new THREE.Vector3();
  const add = (n, o = {}) => { const f = { n, hp: o.hp ?? 60, max: o.hp ?? 60, dmg: o.dmg ?? 12, speed: o.speed ?? 3, ranged: !!o.ranged, cd: o.cd ?? 1.3, wind: o.wind ?? (o.ranged ? 0.6 : 0.42), hostile: false, down: false, state: 'idle', t: 0, home: [n.x, n.z, n.face], aggro: o.aggro || 0, fly: o.fly || 0, critter: !!o.critter, reach: o.reach }; n.ctl = f; foes.push(f); return f; };
  const alive = () => foes.filter(f => !f.down);
  function hurtFoe(f, dmg, from) {
    if (f.down) return; f.hp -= dmg; f.n.c.userData.hop = 1; f.n.c.userData.lineMood = 'angry'; f.flash = 0.18; if (!f.hostile) engage();
    const dx = f.n.x - from.x, dz = f.n.z - from.z, d = Math.hypot(dx, dz) || 1; move(f.n, f.n.x + dx / d * 0.55, f.n.z + dz / d * 0.55, 0.4);
    audio && audio.burst && audio.burst(0.08, 900, 0.16);
    if (f.hp <= 0) { f.down = true; f.state = 'down'; f.t = 0; audio && audio.tone && audio.tone(180, 0.35, 0.05, 'sawtooth', 0.6); }
  }
  function engage(list) { for (const f of foes) if (!list || list.includes(f.n.key)) { f.hostile = true; if (!f.down) f.state = 'chase'; } }
  function attack(kind, Pl, fox, { laserDmg = 15, meleeDmg = 30, hit = [] } = {}) {
    const fx = Math.sin(Pl.face), fz = Math.cos(Pl.face);
    if (kind === 'melee') { if (P.meleeCd > 0) return false; P.meleeCd = 0.42; P.swingT = 0.32; audio && audio.burst && audio.burst(0.05, 1800, 0.08);
      for (const f of alive()) { const dx = f.n.x - Pl.x, dz = f.n.z - Pl.z, d = Math.hypot(dx, dz); if (d < 2.3 && (dx * fx + dz * fz) / (d || 1) > 0.25) hurtFoe(f, meleeDmg, Pl); }
      for (const h of hit) { const d = Math.hypot(h.x - Pl.x, h.z - Pl.z); if (d < 2.3 + (h.r || 0)) h.onHit('melee'); }
      return true; }
    if (P.shotCd > 0) return false; P.shotCd = 0.34; P.shootT = 0.18;
    let best = null, bs = -1; for (const f of alive()) { const dx = f.n.x - Pl.x, dz = f.n.z - Pl.z, d = Math.hypot(dx, dz); if (d > 18) continue; const dot = (dx * fx + dz * fz) / (d || 1); if (dot < 0.72) continue; const s = dot * 2 - d / 18; if (s > bs) { bs = s; best = f; } }
    let tgtH = null; for (const h of hit) { const dx = h.x - Pl.x, dz = h.z - Pl.z, d = Math.hypot(dx, dz); if (d < 16 && (dx * fx + dz * fz) / (d || 1) > 0.7) tgtH = h; }
    A.set(Pl.x + fx * 0.5, Pl.y + 1.15, Pl.z + fz * 0.5);
    if (best) { B.set(best.n.x, 1.0, best.n.z); hurtFoe(best, laserDmg, Pl); } else if (tgtH) { B.set(tgtH.x, 1.0, tgtH.z); tgtH.onHit('range'); } else B.set(A.x + fx * 14, A.y, A.z + fz * 14);
    beam(A, B, 0x7dd3fc); audio && audio.tone && audio.tone(880, 0.08, 0.04, 'square', 0.4); return true;
  }
  function update(dt, Pl, fox) {
    P.meleeCd -= dt; P.shotCd -= dt; P.inv -= dt; P.hurtT = Math.max(0, P.hurtT - dt);
    for (let i = beams.length - 1; i >= 0; i--) { const b = beams[i]; b.t += dt; b.m.material.opacity = 0.95 * (1 - b.t / b.life); if (b.t > b.life) { scene.remove(b.m); b.m.material.dispose(); beams.splice(i, 1); } }
    for (let i = tele.length - 1; i >= 0; i--) { const t = tele[i]; if (t.f.down || t.f.state !== 'wind') { scene.remove(t.m); t.m.material.dispose(); tele.splice(i, 1); } }
    let playerDown = false;
    for (const f of foes) { const n = f.n, c = n.c, u = c.userData, P2 = u.P; f.t += dt; f.flash = Math.max(0, (f.flash || 0) - dt);
      if (f.down) { c.rotation.x = damp(c.rotation.x, -Math.PI / 2, 8, dt); c.position.set(n.x, damp(c.position.y, f.critter ? 0.12 : 0.35, 8, dt), n.z); continue; }
      const dx = Pl.x - n.x, dz = Pl.z - n.z, d = Math.hypot(dx, dz); let spd = 0;
      if (!f.hostile && f.aggro && d < f.aggro) { f.hostile = true; f.state = 'chase'; f.t = 0; }
      if (f.hostile) {
        const want = Math.atan2(dx, dz); let df = want - n.face; df = Math.atan2(Math.sin(df), Math.cos(df)); n.face += df * Math.min(1, dt * 8);
        const reach = f.reach || (f.ranged ? 8 : 1.5);
        if (f.state === 'chase') { const keep = f.ranged ? 6 : 0; if (d > reach) { spd = f.speed; move(n, n.x + dx / d * spd * dt, n.z + dz / d * spd * dt, 0.42); } else if (f.ranged && d < keep - 1) { spd = f.speed * 0.6; move(n, n.x - dx / d * spd * dt, n.z - dz / d * spd * dt, 0.42); }
          if (d <= reach + 0.3 && f.t > f.cd) { f.state = 'wind'; f.t = 0; u.hop = 0.6; f.aim = [Pl.x, Pl.z];
            if (f.ranged) { A.set(n.x, 1.1, n.z); B.set(Pl.x, 1.0, Pl.z); const m = beam(A, B, 0xff3b3b); m.material.opacity = 0.35; beams.pop(); tele.push({ f, m }); } } }
        else if (f.state === 'wind') { if (f.t > f.wind) { f.state = 'chase'; f.t = 0; u.hop = 1;
            if (f.ranged) { A.set(n.x, 1.1, n.z); B.set(f.aim[0], 1.0, f.aim[1]); beam(A, B, 0xff4d4d); audio && audio.tone && audio.tone(330, 0.1, 0.04, 'square', 0.5); if (Math.hypot(Pl.x - f.aim[0], Pl.z - f.aim[1]) < 1.0 && P.inv <= 0) hurtPlayer(f.dmg); }
            else if (d < 2.0 && P.inv <= 0) hurtPlayer(f.dmg); } }
      }
      u.lineMood = f.hostile ? 'angry' : null; n.speedNow = damp(n.speedNow || 0, spd, 8, dt);
      c.position.set(n.x, 0.06 + (f.fly ? f.fly + Math.sin(f.t * 5) * 0.18 : 0), n.z); c.rotation.y = n.face; if (f.anim) f.anim(dt, spd);
      if (f.state === 'wind' && P2) { const k = f.t / f.wind; P2.arms[1].rotation.x = -2.4 * k; }
    }
    function hurtPlayer(dmg) { P.hp = Math.max(0, P.hp - dmg); P.hurtT = 0.4; P.inv = 0.5; fox.userData.hop = 0.7; audio && audio.burst && audio.burst(0.12, 400, 0.2); if (P.hp <= 0) playerDown = true; }
    const al = alive(), active = foes.some(f => f.hostile && !f.down);
    return { playerDown, allDown: foes.length > 0 && !al.length, active };
  }
  // after animFox: the player's attack poses
  function pose(fox) { const P2 = fox.userData.P; if (!P2) return;
    if (P.swingT > 0) { const k = 1 - P.swingT / 0.32; P2.arms[1].rotation.x = -2.6 + k * 3.2; P2.arms[1].rotation.z = 0.4; }
    if (P.shootT > 0) { P2.arms[0].rotation.x = -1.55; }
    P.swingT = Math.max(0, P.swingT - 1 / 60); P.shootT = Math.max(0, P.shootT - 1 / 60); }
  function reset(only) { P.hp = P.max; for (const f of foes) { if (only && !only(f)) continue; f.hostile = false; f.down = false; f.hp = f.max; f.state = 'idle'; f.t = 0; f.n.x = f.home[0]; f.n.z = f.home[1]; f.n.face = f.home[2]; f.n.c.rotation.x = 0; } }
  const hostileFoe = n => n.ctl && n.ctl.hostile && !n.ctl.down;
  return { add, engage, attack, update, pose, reset, foes, P, alive, hostileFoe, hud: () => ({ hp: Math.round(P.hp), max: P.max, foes: alive().filter(f => f.hostile).length, hurt: P.hurtT > 0 }) };
}
