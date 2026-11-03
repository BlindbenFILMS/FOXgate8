// MERU 2.0 — s122 FORTUNE TELLER DELUXE PART D: LOOK + LIFE (Ben's 9, s121), plugged into worlds/meru2-fortune-jobs.js as LF.
// Sun patches + dust motes + lamp glow come from shopKit. Here: CANDLE FLICKER + SMOKE CURLS (altar candles idle-lit, 2 smoke wisps) ·
// CRYSTAL BALL SWIRL reacts to you (brighter + faster + warmer as you come close) · STAR CEILING turns (faster + brighter at night) ·
// WIND CHIMES + BEAD CURTAIN at the door (strands part around you, chimes ring as you pass) · INCENSE burner with a rising smoke column ·
// A QUEUE OF VISITORS (2-3 by day on the east wall, the front one walks up for a reading with Ora, then leaves) ·
// NIGHT = candlelight only (8 dark corner pools + bigger candle halos) · MYSTIC HUM (a soft low drone while you are inside, muted with the game).
export function ftLife(X) {
  const { THREE, G, kit, CT, LM, box, cyl, colF, hour, touch, mutedQ, CAND, candSet, SWIRL, CEIL, BALL, inRoom, ora, tone, jobKey, softT, YEL, GOLD, INK } = X;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), rnd = (a, b) => a + Math.random() * (b - a);
  const night = () => { const h = hour ? hour() : 12; return h >= 20 || h < 6; };
  const DOOR = { x0: -81.7, x1: -78.3, z: -48.3, top: 2.55 };
  // ================= SMOKE pool (candle wisps + incense) =================
  const PUFF = [], N_P = touch ? 14 : 22; for (let i = 0; i < N_P; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softT, color: '#d9d2e6', transparent: true, opacity: 0, depthWrite: false })); s.visible = false; G.add(s); PUFF.push({ s, t: 0, life: 1, v: V(), x0: 0, z0: 0, ph: 0 }); }
  const emit = (p, life, sz, vy) => { const q = PUFF.find(u => u.t <= 0); if (!q) return; q.t = q.life = life; q.s.position.copy(p); q.x0 = p.x; q.z0 = p.z; q.ph = rnd(0, 6.3); q.v.set(0, vy, 0); q.sz = sz; q.s.visible = true; };
  // ================= INCENSE burner (front parlour, west wall) =================
  const INC = V(-85.25, 0, -53.4); cyl(G, 0.14, 0.18, 0.9, '#3a2440', INC.x, 0.45, INC.z, 10); cyl(G, 0.2, 0.2, 0.04, GOLD, INC.x, 0.92, INC.z, 12); cyl(G, 0.09, 0.06, 0.08, GOLD, INC.x, 0.98, INC.z, 10);
  box(G, 0.008, 0.26, 0.008, '#7a2a3a', INC.x, 1.12, INC.z); const ember = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), new THREE.MeshBasicMaterial({ color: '#ff6a2a' })); ember.position.set(INC.x, 1.25, INC.z); G.add(ember); colF(INC.x - 0.22, INC.x + 0.22, INC.z - 0.22, INC.z + 0.22);
  const INC_TIP = V(INC.x, 1.26, INC.z);
  // ================= BEAD CURTAIN (inside the door) =================
  const beadT = CT(32, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = INK; g.fillRect(15, 0, 2, h); const C = ['#c084fc', GOLD, '#7c3aed', '#f472b6', '#38bdf8']; for (let y = 6, k = 0; y < h; y += 14, k++) { g.fillStyle = C[k % C.length]; g.beginPath(); g.arc(16, y, 5, 0, 7); g.fill(); } });
  const beadM = new THREE.MeshBasicMaterial({ map: beadT, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide });
  const STR = []; { const n = 16, L = DOOR.top - 0.25; for (let i = 0; i < n; i++) { const x = DOOR.x0 + 0.1 + i * (DOOR.x1 - DOOR.x0 - 0.2) / (n - 1), pv = new THREE.Group(); pv.position.set(x, DOOR.top, DOOR.z); G.add(pv);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.06, L), beadM); m.position.y = -L / 2; pv.add(m); STR.push({ pv, x, ax: 0, az: 0, vx: 0, vz: 0, ph: i * 0.7 }); }
    box(G, DOOR.x1 - DOOR.x0 + 0.1, 0.06, 0.06, GOLD, (DOOR.x0 + DOOR.x1) / 2, DOOR.top + 0.02, DOOR.z); }
  // ================= WIND CHIMES (just inside the door, west side) =================
  const CH = new THREE.Group(); CH.position.set(-82.3, 2.75, -48.75); G.add(CH); box(CH, 0.006, 0.3, 0.006, INK, 0, 0.15, 0); cyl(CH, 0.12, 0.12, 0.02, GOLD, 0, 0, 0, 12);
  const TUBE = [0, 1, 2, 3, 4].map(i => { const a = i / 5 * Math.PI * 2, L = 0.34 + i * 0.06, pv = new THREE.Group(); pv.position.set(Math.sin(a) * 0.09, -0.01, Math.cos(a) * 0.09); CH.add(pv); cyl(pv, 0.013, 0.013, L, '#c9cdd2', 0, -0.06 - L / 2, 0, 6); return { pv, a: 0, v: 0 }; });
  const CHF = [1568, 1760, 2093, 2349, 2637]; let chimeCD = 0;
  const ringChimes = k => { if (chimeCD > 0) return; chimeCD = 1.2; TUBE.forEach((t, i) => { t.v += rnd(1.5, 3) * k; tone(CHF[(i * 3) % 5], 0.02 * k, 1.6, 'sine', i * 0.09 + rnd(0, 0.05)); }); };
  // ================= NIGHT: dark corner pools (both rooms) =================
  const darkT = CT(128, 128, g => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 63); r.addColorStop(0, 'rgba(6,4,12,1)'); r.addColorStop(1, 'rgba(6,4,12,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const DARK = []; for (const [x, z] of [[-85.4, -48.6], [-74.6, -48.6], [-85.4, -59.4], [-74.6, -59.4], [-85.4, -60.6], [-74.6, -60.6], [-85.4, -71.4], [-74.6, -71.4]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), new THREE.MeshBasicMaterial({ map: darkT, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6 })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.075, z); m.renderOrder = 3; G.add(m); DARK.push(m); }
  // ================= QUEUE OF VISITORS =================
  const LOOKS = [['#9b5c3a', '#6b3a22', '#3a1e12'], ['#2a6b5c', '#1d4a3f', '#0f2a24'], ['#a8323e', '#7a1f2a', '#3a0e14'], ['#c9a24a', '#8a6a2a', '#4a3a14'], ['#3a5a9a', '#26406b', '#141f3a']];
  const QSPOT = [[-75.6, -53.4], [-75.6, -52.2], [-75.6, -51.0]], READ = [-79.15, -55.0], OUT = [[-80, -49.2], [-80, -46.2]];
  const VIS = LOOKS.slice(0, 3).map((torso, i) => { const f = kit.makeFox({ key: 'mftVisit' + i, torso, outfit: i === 1 ? 'coat' : 'robe', female: i !== 0, mood: 'neutral' }); f.visible = false; G.add(f); return { f, st: 'off', path: [], spd: 1.3, t: 0, slot: -1 }; });
  const want = () => { const h = hour ? hour() : 12; return h < 9 || h >= 20 ? 0 : h >= 13 && h < 17 ? 3 : 2; };
  let readT = 25 + rnd(0, 10), spawnT = 2;
  const goTo = (v, pts, then) => { v.path = pts.map(p => p.slice()); v.st = 'walk'; v.then = then; };
  function visitTick(dt, P, here, busy) { const w = want(); spawnT -= dt;
    const queued = VIS.filter(v => v.st === 'queue' || (v.st === 'walk' && v.then === 'queue')).sort((a, b) => a.slot - b.slot);
    if (spawnT <= 0 && queued.length < w) { const v = VIS.find(u => u.st === 'off'); if (v) { spawnT = 6 + rnd(0, 6);
      v.slot = queued.length; v.f.position.set(OUT[1][0], 0, OUT[1][1]); v.f.rotation.y = Math.PI; v.f.visible = true; goTo(v, [OUT[0], [-77.4, -50.6], QSPOT[Math.min(v.slot, 2)]], 'queue'); } }
    // front of the queue walks up when Ora is free (no job at her table, you not standing on the reading spot)
    readT -= dt; const front = queued[0], reading = VIS.find(v => v.st === 'read' || (v.st === 'walk' && v.then === 'read'));
    const free = !(busy && jobKey() === 'ball') && Math.hypot(P.x - READ[0], P.z - READ[1]) > 1.1;
    if (readT <= 0 && front && front.st === 'queue' && !reading && free) { front.slot = -1; goTo(front, [[-77.2, -54.2], READ], 'read'); queued.slice(1).forEach((v, i) => { v.slot = i; goTo(v, [QSPOT[i]], 'queue'); }); }
    for (const v of VIS) { if (v.st === 'off') continue; let spd = 0;
      if (v.st === 'walk') { const p = v.path[0]; if (!p) { v.st = v.then; v.t = 0; if (v.st === 'read') { readT = 18; } if (v.st === 'gone') { v.st = 'off'; v.f.visible = false; } continue; }
        const dx = p[0] - v.f.position.x, dz = p[1] - v.f.position.z, d = Math.hypot(dx, dz); if (d < 0.08) { v.path.shift(); continue; } const s = Math.min(d, v.spd * dt); v.f.position.x += dx / d * s; v.f.position.z += dz / d * s; spd = v.spd;
        let a = Math.atan2(dx, dz) - v.f.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); v.f.rotation.y += a * Math.min(1, dt * 8); }
      else { const tgt = v.st === 'read' ? Math.atan2(ora.position.x - v.f.position.x, ora.position.z - v.f.position.z) : -Math.PI / 2 - 0.5; let a = tgt - v.f.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); v.f.rotation.y += a * Math.min(1, dt * 3); }
      if (v.st === 'read') { v.t += dt; if (v.t > 16) { readT = 10 + rnd(0, 14); goTo(v, [[-80, -52.5], OUT[0], OUT[1]], 'gone'); } }
      if (here || !touch) kit.animFox(v.f, dt, spd, false); }
    // Ora leans in + her ball brightens while someone is being read
    return VIS.some(v => v.st === 'read'); }
  // ================= MYSTIC HUM =================
  let ac = null, hum = null;
  const humOn = on => { if (on && mutedQ()) on = false; if (!on && !hum) return; try { if (on && !hum) { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const g = ac.createGain(); g.gain.value = 0; g.connect(ac.destination);
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; lp.connect(g); const os = [110, 164.8, 220.6].map((f, i) => { const o = ac.createOscillator(); o.type = i === 2 ? 'triangle' : 'sine'; o.frequency.value = f; const og = ac.createGain(); og.gain.value = [0.5, 0.32, 0.12][i]; o.connect(og).connect(lp); o.start(); return o; });
        const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.13; lg.gain.value = 220; lfo.connect(lg).connect(lp.frequency); lfo.start(); hum = { g, os: [...os, lfo] }; }
      if (hum) { const t = ac.currentTime; hum.g.gain.cancelScheduledValues(t); hum.g.gain.setTargetAtTime(on ? 0.022 : 0, t, on ? 1.2 : 0.4); if (!on) { const h = hum; hum = null; setTimeout(() => { try { h.os.forEach(o => o.stop()); h.g.disconnect(); } catch (e) {} }, 1500); } } } catch (e) {} };
  // ================= per frame =================
  let wasNear = false, smT = 0, incT = 0, nk = -1;
  function tick(dt, t, P, here, busy) { const nt = night(), jk = busy ? jobKey() : null; chimeCD -= dt;
    // candles: idle-lit with flicker (the candle job owns them while it runs)
    if (jk !== 'cand' && here) CAND.forEach(c => { if (c.lit < 1) candSet(c, 1); const f = 0.85 + Math.sin(t * 13 + c.i * 2.3) * 0.08 + Math.sin(t * 29 + c.i) * 0.05; c.fl.scale.set(1, f, 1); c.halo.material.opacity = (nt ? 0.95 : 0.6) * f; c.halo.scale.setScalar(nt ? 0.55 : 0.35); });
    // smoke curls (2 candles) + incense column
    if (here) { smT -= dt; incT -= dt; if (smT <= 0) { smT = 0.5; const c = CAND[(Math.random() * 7) | 0]; if (c.lit) emit(c.tip.clone().setY(c.tip.y + 0.1), 2.6, 0.08, 0.28); } if (incT <= 0) { incT = 0.32; emit(INC_TIP, 3.4, 0.07, 0.34); } ember.material.color.setHSL(0.05, 1, 0.5 + Math.sin(t * 3) * 0.1); }
    for (const q of PUFF) { if (q.t <= 0) continue; q.t -= dt; const k = 1 - q.t / q.life; q.s.position.y += q.v.y * dt; q.s.position.x = q.x0 + Math.sin(q.ph + k * 5) * 0.06 * (1 + k * 3); q.s.position.z = q.z0 + Math.cos(q.ph + k * 4) * 0.05 * (1 + k * 3);
      q.s.scale.setScalar(q.sz * (1 + k * 4)); q.s.material.opacity = Math.sin(k * Math.PI) * 0.32; if (q.t <= 0) q.s.visible = false; }
    // crystal ball reacts to you (+ a visitor's reading)
    const reading = visitTick(dt, P, here, busy);
    if (jk !== 'ball') { const d = Math.hypot(P.x - BALL.x, P.z - BALL.z), k = here ? Math.max(reading ? 0.7 : 0, 1 - (d - 1.0) / 3.0) : 0, kk = Math.max(0, Math.min(1, k));
      SWIRL.material.opacity = 0.06 + kk * 0.42 + Math.sin(t * 2.4) * 0.04; SWIRL.rotation.y += dt * (0.4 + kk * 3.2); SWIRL.rotation.x = Math.sin(t * 0.7) * 0.4 * kk; SWIRL.material.color.setHSL(0.55 - kk * 0.28, 0.9, 0.62); SWIRL.scale.setScalar(1 + Math.sin(t * 5) * 0.04 * kk); }
    // star ceiling turns; night = candlelight only
    CEIL.rotation.z += dt * (nt ? 0.045 : 0.008); if (nk !== +nt) { nk = +nt; CEIL.material.color.set(nt ? '#ffffff' : '#9aa0c0'); }
    DARK.forEach(m => { const o = nt ? 0.78 : 0.18; m.material.opacity += (o - m.material.opacity) * Math.min(1, dt * 1.5); });
    // bead curtain parts around you; chimes ring as you pass the door
    const nearDoor = Math.abs(P.z - DOOR.z) < 0.9 && P.x > DOOR.x0 - 0.4 && P.x < DOOR.x1 + 0.4;
    if (nearDoor && !wasNear) ringChimes(1); wasNear = nearDoor;
    const pusher = [P, ...VIS.filter(v => v.st !== 'off').map(v => ({ x: v.f.position.x, z: v.f.position.z }))];
    for (const s of STR) { let tx = 0, tz = 0; for (const p of pusher) { const dx = s.x - p.x, dz = DOOR.z - p.z; if (Math.abs(dz) < 0.55 && Math.abs(dx) < 0.6) { tz += (dz > 0 ? -1 : 1) * 0.9 * (1 - Math.abs(dx) / 0.6); tx += Math.sign(dx || 1) * 0.35 * (1 - Math.abs(dx) / 0.6); } }
      tx += Math.sin(t * 1.3 + s.ph) * 0.02; s.vx += ((tx - s.ax) * 30 - s.vx * 5) * dt; s.vz += ((tz - s.az) * 30 - s.vz * 5) * dt; s.ax += s.vx * dt; s.az += s.vz * dt; s.pv.rotation.x = s.az; s.pv.rotation.z = s.ax; }
    TUBE.forEach((u, i) => { u.v += (-u.a * 22 - u.v * 1.6) * dt; u.v += Math.sin(t * 0.9 + i) * 0.04 * dt; u.a += u.v * dt; u.pv.rotation.x = u.a; u.pv.rotation.z = u.a * 0.6; });
    humOn(here); }
  return { tick, humOn, VIS, STR, ringChimes, night };
}
