// 8 GATES — CREATURE AI (the shared ENEMY library brain). One brain per spawned creature; the host moves the body and
// plays the states it returns. Roles come from the creature's userData: boss, ranged / lobber (keep distance), charge
// (runs a lane, stuns itself), melee (default). Damage: every Nth hit staggers; armor breaks at 50% (bosses also at 25%).
export function createBrain(g, ck, opts = {}) {
  const U = g.userData, role = U.boss ? 'boss' : U.charge ? 'charge' : (U.ranged || U.lobber) ? 'ranged' : 'melee';
  const max = opts.hp ?? (U.boss ? 400 : (U.height || 1.5) > 2.2 ? 160 : U.flock ? 30 : 70);
  const range = role === 'ranged' ? 5.5 : role === 'charge' ? 4.5 : (U.reach || 1.2) + 0.4;
  const noFlinch = /Husk|Attendant|Warden of the Siphon/.test(U.variant || '');
  const B = { role, max, hp: max, range, hits: 0, cool: 0.8, breaks: 0, dead: false, strike: false, speed: role === 'ranged' ? 1.6 : U.boss ? 1.2 : 2.2 };
  B.update = (dt, d, state, st) => {
    B.strike = false; if (B.dead) return null; B.cool -= dt;
    if (B.stunT > 0) { B.stunT -= dt; B.stunned = B.stunT > 0; return state !== 'idle' && state !== 'hurt' ? 'idle' : null; }   // STUNNED: frozen in place (host shows stars + dizzy face)
    const dur = ck.dur(g, state) || 0;
    if (state === 'windup' && st >= dur) return 'attack';
    if (state === 'attack') { if (st < dt * 1.5) B.strike = true; if (st >= dur) return role === 'charge' ? 'stagger' : 'recover'; return null; }
    if ((state === 'recover' || state === 'hurt' || state === 'stagger' || state === 'armorBreak') && st >= dur) { B.cool = 0.6 + Math.random() * 0.6; return 'idle'; }
    if (state === 'idle' || state === 'move') {
      const want = role === 'ranged' ? (d > range || d < 2.6) : d > range;
      if (!want && B.cool <= 0) return 'windup';
      if (want && state !== 'move') return 'move';
      if (!want && state === 'move') return 'idle';
    }
    return null;
  };
  // the host moves toward the target in 'move' (away if a ranged creature is too close); chargers run during 'attack'
  B.moveSign = d => B.stunT > 0 ? 0 : role === 'ranged' && d < 2.6 ? -1 : 1;
  // Noble's AUDIO HORN: stun(seconds) — use stunSeconds(userData) from engine/noble-weapons.js for the size class
  B.stun = s => { if (B.dead) return; B.stunT = Math.max(B.stunT || 0, s); B.stunned = true; B.cool = Math.max(B.cool, s); };
  B.hurt = (n, weak, state) => {
    if (B.dead) return null; const open = state === 'recover' || state === 'stagger';
    const dmg = Math.round(n * (weak ? (open ? 3 : 1.6) : 1)); B.hp = Math.max(0, B.hp - dmg); B.hits++; B.lastDmg = dmg;
    if (B.hp <= 0) { B.dead = true; return 'die'; }
    const thresholds = U.boss ? [0.5, 0.25] : [0.5]; if (B.breaks < thresholds.length && B.hp / B.max <= thresholds[B.breaks]) { B.breaks++; return 'armorBreak'; }
    if (state === 'attack' || state === 'windup') return weak ? 'stagger' : null;   // committed: only a weak-point hit interrupts
    if (B.hits % (U.boss ? 6 : 3) === 0) return 'stagger';
    return noFlinch ? null : 'hurt';
  };
  return B;
}
