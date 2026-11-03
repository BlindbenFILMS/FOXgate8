// 8 GATES · SPACE MAP · WORLD PATROLS + TREATIES (s384, from the 2D treaty[] / fleetFavor / fleetKills / peacePrice / moodOf).
// Every charted world flies a PATROL of 3 of its own ships round its sky (your 8g scout hull in the world's colour, its initial on the
// crest). PEACE by default: they are traffic, your shots pass through them. WAR is declared at a dock (2D bridge "Declare war"):
// that world's patrol fights you inside its sky (200 u), its dock refuses landing + trade. PROPOSE PEACE at its dock costs
// 2D peacePrice = max(40, kills × 20) − favour × 12. FAVOUR: breaking a pirate crew in a world's sky +1 (and 25 G), razing a pirate
// base +2 with everyone (2D). MOOD: LIKES YOU / NEUTRAL / ANGRY WITH YOU. SHASTA (the old 8g) is always ALLIED. Saved space.treaty.v1.
const TAU = Math.PI * 2, KEY = 'space.treaty.v1';
export function createFleets(X) {
  const { THREE, scene, IK, LOOKS, WORLDS, LOW } = X;
  let St, combat, toast, burst, save, beasts = null, dispT = 0, sayT = -99;
  let T = {}; try { T = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
  for (const k of ['treaty', 'kills', 'favor']) if (!T[k] || typeof T[k] !== 'object') T[k] = {};
  const saveT = () => { try { localStorage.setItem(KEY, JSON.stringify(T)); } catch (e) {} };
  const allied = k => k === 'shasta';
  const atWar = k => !allied(k) && T.treaty[k] === 'WAR';
  const price = k => Math.max(0, Math.max(40, (T.kills[k] || 0) * 20) - (T.favor[k] || 0) * 12);
  const mood = k => { if (allied(k)) return { t: 'ALLIED', c: '#6ee7b7' }; if (atWar(k)) return { t: 'AT WAR WITH YOU', c: '#ec3013' }; const a = T.kills[k] || 0, f = T.favor[k] || 0; return f > a ? { t: 'LIKES YOU', c: '#6ee7b7' } : a > f ? { t: 'ANGRY WITH YOU', c: '#ffb340' } : { t: 'NEUTRAL', c: '#f3f2f2' }; };
  const fleets = WORLDS.filter(w => w.dock).map(w => ({ w, key: w.key, ships: [], proto: null, built: false, back: 0 }));
  // s595 MERU flies its own fleet: the MERU CRUISER leads, two MERU SCOUTS (Space Install Workshop → MERU tabs)
  // s596 WORLD FLEETS: every docked world does the same with its own ships (FLEET_PRE: meru → mer, shasta → sha ...). Each proto is built once, on that world's first spawn, then cloned.
  const merP = {}, merProto = k => merP[k] || (merP[k] = IK.build(k, LOOKS && LOOKS[k])), PRE = X.FLEET_PRE || { meru: 'mer' };
  const protoOf = f => { if (f.proto) return f.proto; const look = { ...(LOOKS && LOOKS.ship), hull: '#f3f5fa', accent: f.w.tint, crestText: f.w.name[0], crestInk: f.w.tint, engine: f.w.tint };
    f.proto = IK.build('ship', look); return f.proto; };
  function spawnPatrol(f) { const P = PRE[f.key] ? null : protoOf(f); for (let i = 0; i < 3; i++) { if (f.ships[i] && !f.ships[i].dead) continue; const pre = PRE[f.key], MP = pre ? merProto(pre + (i === 0 ? 'Cruiser' : 'Scout')) : P, m = MP.group.clone(true); m.scale.multiplyScalar(pre && i === 0 ? 1.3 : 1.12);
      const r = 70 + i * 12, a = i / 3 * TAU + f.w.x * 0.001; f.ships[i] = combat.makeFleetShip(m, i === 0 ? 'fighter' : 'scout', f.w.x, f.w.z, r, a, 0.16 * (i % 2 ? -1 : 1), f.key, () => atWar(f.key), f.w.tint); } }
  const API = {
    T, atWar, price, mood, allied, fleets,
    attach(o) { St = o.St; combat = o.combat; toast = o.toast; burst = o.burst; save = o.save; beasts = o.beasts || null; },
    declare(k) { if (allied(k) || atWar(k)) return false; T.treaty[k] = 'WAR'; saveT(); const w = WORLDS.find(q => q.key === k); toast('WAR DECLARED · ' + (w ? w.name : k) + '. Their patrol will fight you in their sky.', 4); return true; },
    peace(k) { if (!atWar(k)) return false; const c = price(k); if (!save.spend(c)) { toast('THEY WANT MORE THAN YOU HAVE · ' + c + ' G', 3); return false; } T.treaty[k] = 'PEACE'; saveT(); const w = WORLDS.find(q => q.key === k); toast('PEACE SIGNED · ' + (w ? w.name : k) + (c ? ' · ' + c + ' G in reparations' : ''), 3.5); return true; },
    onKill(k) { T.kills[k] = (T.kills[k] || 0) + 1; saveT(); },
    favorAll(n) { for (const f of fleets) T.favor[f.key] = (T.favor[f.key] || 0) + n; saveT(); },
    crewBeaten(x, z) { let b = null, bd = 260; for (const f of fleets) { const d = Math.hypot(f.w.x - x, f.w.z - z); if (d < bd) { bd = d; b = f; } } if (!b || atWar(b.key)) return;
      T.favor[b.key] = (T.favor[b.key] || 0) + 1; saveT(); try { save.addGold(25); } catch (e) {} setTimeout(() => toast('FAVOUR EARNED · ' + b.w.name + ' · +25 G', 3), 1600); },
    mini(x, tx, tz) { for (const f of fleets) for (const p of f.ships) { if (!p || p.dead) continue; x.fillStyle = atWar(f.key) ? '#ff3a4a' : f.w.tint; x.beginPath(); x.arc(tx(p.x), tz(p.z), 2.6, 0, 7); x.fill(); } },
    update(dt) { if (!St || !combat) return;
      // s410 INTERCEPT: hostiles held at the edge of defended space → the nearest free patrol ships (2 per target) go and fight them
      if (X.intercept && (dispT -= dt) <= 0) {   // s413 (Ben): hostiles RUN from the defences now, so the patrols stay home (set X.intercept to bring the fights back) dispT = 0.4; const targets = [...combat.held, ...(beasts ? beasts.list.filter(c => c.held) : [])], ships = [];
        for (const f of fleets) if (f.built && !atWar(f.key)) for (const p of f.ships) if (p && !p.dead) ships.push({ p, f });
        for (const T of targets) { let n = ships.filter(s => s.p.intercept === T).length; while (n < 2) { let best = null, bd = 340; for (const s of ships) { if (s.p.intercept) continue; const d = Math.hypot(s.p.x - T.x, s.p.z - T.z); if (d < bd) { bd = d; best = s; } } if (!best) break; best.p.intercept = T; n++;
            if (St.t - sayT > 8) { sayT = St.t; toast(best.f.w.name + ' PATROL ENGAGING. You are in defended space.', 3); } } } }
      for (const f of fleets) { const d = Math.hypot(f.w.x - St.x, f.w.z - St.z);
        if (d < 380) { if (!f.built) { f.built = true; spawnPatrol(f); f.back = 90; } else if (f.ships.some(p => !p || p.dead) && (f.back -= dt) <= 0 && d > 210) { spawnPatrol(f); f.back = 90; } }
        else if (d > 470 && f.built) { f.built = false; f.ships.forEach(p => p && combat.removeShip(p)); f.ships = []; }
        if (f.built && f.proto) f.proto.tick(dt, 0); }
    },
  };
  return API;
}
