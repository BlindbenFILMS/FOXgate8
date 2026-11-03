// 8 GATES · THE FIRST SHIPMENT · SPACE ESCORT (s523, Ben's opening mission). After the take-off shot from the player planet (?launch=p1&mission=escort):
// the CARGO SHIP (the colony freighter with the planet's first RAW CRYSTAL) autoflies to the LUXOR STARGATE; a line runs from your ship to the gate;
// NOBLE: "Keep your eyes open for more pirates..."; a pirate crew jumps you on the way; stay close to the cargo ship (it waits if you fall behind);
// fly INTO the gate → white jump flash → you come out at MERU's stargate with the freighter → dock at MERU for the PEACE DAY TOURNAMENT.
// escortKit({ THREE, scene, St, WORLDS, INSTALLS, combat, toast, say, snd, glow }) → { tick(dt, t), on, hudQuest(), line }
export function escortKit(X) {
  const { THREE, scene, St, WORLDS, INSTALLS, combat, toast, say } = X;
  const W = k => WORLDS.find(w => w.key === k), lux = W('luxor'), meru = W('meru'), p1 = W('p1');
  const gateOf = w => ({ x: w.x + INSTALLS.gate.dx, z: w.z + INSTALLS.gate.dz });
  const G1 = gateOf(lux), G2 = gateOf(meru), MD = { x: meru.x + 22, z: meru.z };
  const E = { on: true, ph: 'escort', t: 0, ambushed: false, wait: false, cx: p1.x + 10, cz: p1.z + 6, h: 0, jump: 0 };
  // the freighter: a stubby cargo hull with crystal crates on deck, glowing cyan
  const cargo = new THREE.Group(); { const tm = (c, e) => new THREE.MeshToonMaterial({ color: c, emissive: e || '#000000' }), add = (g, m, x, y, z, s) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); if (s) o.scale.set(...s); cargo.add(o); return o; };
    add(new THREE.BoxGeometry(5, 2.2, 11), tm('#c8ccd2'), 0, 0, 0); add(new THREE.BoxGeometry(5.4, 0.4, 11.4), tm('#ec3013'), 0, 1.2, 0); const nose = add(new THREE.ConeGeometry(2.6, 3.6, 4), tm('#c8ccd2'), 0, 0, -7.2); nose.rotation.x = -Math.PI / 2; nose.rotation.y = Math.PI / 4;
    for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(1.3, 1.1, 1.3), tm('#7fe3ff', '#1a6a8a'), (i % 2 ? 1 : -1) * 1.2, 1.9, -3 + Math.floor(i / 2) * 2.6);
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(2.6, 0.3, 4), tm('#8a929a'), s * 3.6, -0.3, 2.5); X.glow && (cargo.userData.eng = X.glow(cargo, '#7fe3ff')); }
  cargo.scale.setScalar(0.9); cargo.position.set(E.cx, 0, E.cz); scene.add(cargo);
  // the route line: your ship → the gate (dashed, red)
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)); const line = new THREE.Line(lg, new THREE.LineDashedMaterial({ color: '#ec3013', dashSize: 4, gapSize: 3, transparent: true, opacity: 0.9, depthWrite: false })); line.frustumCulled = false; scene.add(line);
  const flash = document.createElement('div'); flash.style.cssText = 'position:fixed;inset:0;background:#e8f8ff;opacity:0;pointer-events:none;z-index:2147482500'; document.body.appendChild(flash);
  setTimeout(() => say('NOBLE', 'Keep your eyes open for more pirates, this cargo is worth a lot of credits SO stay close to the cargo ship.'), 5200);
  const tgt = () => E.ph === 'escort' ? G1 : E.ph === 'meru' ? MD : G2;
  function tick(dt, t) { if (!E.on) return; E.t += dt; const T = tgt();
    // the freighter flies the route, waits for you if you fall behind
    const dPl = Math.hypot(St.x - E.cx, St.z - E.cz); E.wait = dPl > 70; if (E.wait && !E.warned) { E.warned = true; toast('Stay close to the CARGO SHIP! It is waiting for you.', 3); } if (!E.wait) E.warned = false;
    if (E.ph !== 'jump' && St.phase === 'free') { const dx = T.x - E.cx, dz = T.z - E.cz, d = Math.hypot(dx, dz), sp = E.wait ? 0 : d > 30 ? 13 : 8; if (d > 1) { E.cx += dx / d * sp * dt; E.cz += dz / d * sp * dt; E.h = Math.atan2(dx, -dz); } }
    cargo.position.set(E.cx, Math.sin(t * 1.3) * 0.3, E.cz); cargo.rotation.y = -E.h + Math.PI; cargo.rotation.z = Math.sin(t * 0.9) * 0.04;
    // the ambush, halfway
    if (!E.ambushed && E.ph === 'escort' && E.cz > lux.z - 0.6 * (lux.z - p1.z) - 40 && St.phase === 'free') { E.ambushed = true; try { combat.spawnCrew(true); } catch (e) {} say('NOBLE', 'Black hulls! Drive them off the cargo ship!'); }
    // line from you to the gate
    const a = lg.attributes.position; a.setXYZ(0, St.x, 0.5, St.z); a.setXYZ(1, T.x, 0.5, T.z); a.needsUpdate = true; line.computeLineDistances(); line.visible = E.ph !== 'meru' || Math.hypot(St.x - MD.x, St.z - MD.z) > 30;
    // the gate jump
    if (E.ph === 'escort' && Math.hypot(St.x - G1.x, St.z - G1.z) < 10 && St.phase === 'free') { E.ph = 'jump'; E.jump = 0; X.snd && X.snd('undock'); }
    if (E.ph === 'jump') { E.jump += dt; flash.style.opacity = String(Math.min(1, E.jump / 0.5) * (E.jump < 1.2 ? 1 : Math.max(0, 1 - (E.jump - 1.2) / 0.8)));
      if (E.jump > 0.6 && !E.through) { E.through = true; St.x = G2.x + 6; St.z = G2.z + 6; St.vx = St.vz = 0; E.cx = G2.x - 6; E.cz = G2.z + 8; X.jumped && X.jumped(); }
      if (E.jump > 2.0) { E.ph = 'meru'; flash.style.opacity = '0'; say('NOBLE', 'Through the gate! That is MERU dead ahead. Dock, and get to the tournament!'); } }
    if (E.ph === 'meru' && Math.hypot(E.cx - MD.x, E.cz - MD.z) < 4 && !E.home) { E.home = true; toast('The cargo ship is docked at MERU. The crystal is delivered!', 4); try { localStorage.setItem('pp.shipment', 'delivered'); } catch (e) {} } }
  const hudQuest = () => E.ph === 'escort' ? { title: 'The first shipment', text: 'Escort the cargo ship to the LUXOR STARGATE. Watch for pirates!' } : E.ph === 'jump' ? { title: 'The first shipment', text: 'Through the stargate…' } : { title: 'Peace Day Tournament', text: 'Dock at MERU. The tournament is starting!' };
  return { tick, hudQuest, get on() { return E.on; }, get ph() { return E.ph; }, end() { E.on = false; scene.remove(cargo); scene.remove(line); flash.remove(); } };
}
