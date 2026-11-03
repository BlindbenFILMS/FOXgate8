// COVER AI (Ben s130c / s131): bandits fight like mobsters in a cover shooter. Shared by every bandit battle (Salt, Pepper, ...).
// Cover spots come from the floor's solids (walls + breakable props). A bandit spots you → barks → runs to a spot that puts the
// solid between you and him → DUCKS → red ! → POPS OUT for 2.5 s (thrower: aim + throw · brawler: shout + RUSH · lookout: peek + whistle)
// → ducks again. Cover props break (crates, tables) → he is exposed and runs for new cover. Flankers circle round. Wounded bandits
// retreat. Throwers blind-throw bottles over the top. Card tables get FLIPPED for cover. The player auto-crouches by low cover.
// Mode glue: coverAI(ctx, { role(e) → 'thrower'|'brawler'|'lookout'|null, pose(g, type, s, e), lines, flip: [prop kinds], whistle(e, A) }).
export function coverAI(C, o = {}) {
  const { THREE } = C, POP = o.pop ?? 2.5, TELL = 0.5;
  const LINES = Object.assign({ spot: ['THERE HE IS!', 'GET HIM!', 'A FOX!'], duck: ['COVER!', 'GET DOWN!'], taunt: ['COME OUT, FOX!', 'IS THAT ALL?', 'MISSED ME!'],
    pop: ['TAKE THIS!', 'HEY, FOX!'], rush: ['GET HIM!', 'CHARGE!', 'MINE!'], hit: ["I'M HIT!", 'OW! FALL BACK!'], lost: ['MY COVER!', 'NO COVER!'],
    flip: ['FLIP IT!', 'TABLE!'], flank: ['GO AROUND!', 'FLANK HIM!'], blind: ['HEADS UP!', 'CATCH!'], close: ['TOO CLOSE!', 'BACK OFF!'], coverMe: ['COVER ME!', 'GO GO GO!'] }, o.lines || {});
  const BAD = new Set(['void', 'gwall', 'pane', 'glass', 'deck', 'plat']);
  const rnd = (a, b) => a + Math.random() * (b - a), pk = a => a[(Math.random() * a.length) | 0], damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * Math.max(0, Math.min(0.1, dt))));
  const yawTo = (dx, dz) => Math.atan2(-dz, dx), angD = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
  let A = null, spots = [], flips = [], barkT = 0, nFlank = 0, tipped = false; const lobs = [], bubs = [];
  const live = s => A.solid.includes(s);
  function segBox(ax, az, bx, bz, s, p = 0) { let t0 = 0, t1 = 1; const dx = bx - ax, dz = bz - az;
    for (const [d, a, lo, hi] of [[dx, ax, s.x0 - p, s.x1 + p], [dz, az, s.z0 - p, s.z1 + p]]) { if (Math.abs(d) < 1e-6) { if (a < lo || a > hi) return false; } else { let u = (lo - a) / d, v = (hi - a) / d; if (u > v) [u, v] = [v, u]; t0 = Math.max(t0, u); t1 = Math.min(t1, v); if (t0 > t1) return false; } }
    return true; }
  const covers = (sp, px, pz) => live(sp.s) && (sp.x - px) * sp.nx + (sp.z - pz) * sp.nz > 0.5 && segBox(sp.x, sp.z, px, pz, sp.s, 0.05);
  // ---------- SPEECH BUBBLES (white box, ink rule, flush-left Archivo; no rounded corners) ----------
  const bubTex = {}, mc = document.createElement('canvas').getContext('2d');
  function bubT(txt) { if (bubTex[txt]) return bubTex[txt]; const fs = 46; mc.font = '900 ' + fs + 'px Archivo, sans-serif'; const w = Math.ceil(mc.measureText(txt).width) + 44, h = 104;
    return bubTex[txt] = { w, h, t: C.CT(w, h, g => { g.fillStyle = '#141312'; g.fillRect(0, 0, w, h - 22); g.beginPath(); g.moveTo(18, h - 24); g.lineTo(18, h); g.lineTo(46, h - 24); g.fill(); g.fillStyle = '#f3f2f2'; g.fillRect(5, 5, w - 10, h - 32); g.beginPath(); g.moveTo(23, h - 28); g.lineTo(23, h - 10); g.lineTo(38, h - 28); g.fill();
      g.font = '900 ' + fs + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillStyle = '#141312'; g.fillText(txt, 20, (h - 22) / 2 + 2); }) }; }
  function bark(e, key, force) { const cv = e.cv; if (!force && (barkT > 0 || cv.bt > 0)) return; barkT = 0.9; cv.bt = 3.5; const u = e.m.userData, b = bubT(typeof key === 'string' && LINES[key] ? pk(LINES[key]) : key);
    if (!u.bub) { u.bub = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false, transparent: true })); u.bub.center.set(0.06, 0); u.bub.renderOrder = 24; e.m.add(u.bub); }
    u.bub.material.map = b.t; u.bub.material.needsUpdate = true; const H = 0.62; u.bub.scale.set(H * b.w / b.h, H, 1); u.bub.position.set(0, 2.9, 0); u.bub.visible = true; u.bub.material.opacity = 1; u.bubT = 1.6; if (!bubs.includes(e)) bubs.push(e); }
  // ---------- BOTTLE LOBS (blind throws over the cover; a red ring marks where it lands) ----------
  function lob(e, tx, tz) { let q = lobs.find(l => !l.on); if (!q) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.34, 8), C.toon('#3f9a5e')), r = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.2, 28), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }));
      r.rotation.x = -Math.PI / 2; C.scene.add(m); C.scene.add(r); q = { m, r }; lobs.push(q); }
    const T = 1.15, g = 14, x0 = e.x, z0 = e.z, y0 = 1.9; Object.assign(q, { on: true, x: x0, y: y0, z: z0, vx: (tx - x0) / T, vz: (tz - z0) / T, vy: (0.2 - y0 + 0.5 * g * T * T) / T, tx, tz }); q.m.visible = q.r.visible = true; q.r.position.set(tx, (e.by || 0) + 0.05, tz); }
  function stepLobs(dt) { for (const q of lobs) { if (!q.on) continue; q.vy -= 14 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; q.m.position.set(q.x, q.y, q.z); q.m.rotation.x += dt * 9; q.r.material.opacity = 0.35 + 0.3 * Math.sin(A.St.t * 22);
      if (q.y < 0.25) { q.on = false; q.m.visible = q.r.visible = false; A.burst(q.x, 0.3, q.z, 12, 0x7fd18f, 5); A.burst(q.x, 0.3, q.z, 5, 0xe8f6ff, 3); if (Math.hypot(A.P.x - q.x, A.P.z - q.z) < 1.25 && A.P.y < 1.2) A.hurt(9, q.x, q.z); } } }
  // ---------- CARD TABLE FLIP (the table tips onto its edge toward you and becomes a low wall) ----------
  const _m = new THREE.Matrix4(), _r = new THREE.Matrix4(), _t = new THREE.Matrix4(), _a = new THREE.Vector3();
  function startFlip(f, e) { const p = f.p, P = A.P, dx0 = P.x - p.cx, dz0 = P.z - p.cz, ax = Math.abs(dx0) > Math.abs(dz0), dx = ax ? Math.sign(dx0) : 0, dz = ax ? 0 : Math.sign(dz0);
    f.done = true; f.anim = { t: 0, dx, dz, c0: [p.cx, p.y1 - 0.1, p.cz], c1: [p.cx + dx * 0.6, 0.62, p.cz + dz * 0.6], b0: p.parts.map(pt => pt.base.slice()) };
    const s = p.solid, cx = p.cx + dx * 0.6, cz = p.cz + dz * 0.6; const box = ax ? [cx - 0.16, cx + 0.16, cz - 0.9, cz + 0.9] : [cx - 0.9, cx + 0.9, cz - 0.16, cz + 0.16];
    f.box = box; f.sp = { x: p.cx - dx * 0.6, z: p.cz - dz * 0.6, nx: -dx, nz: -dz, tall: false, pop: null, by: 0 }; A.burst(p.cx, 0.9, p.cz, 10, 0xf3f2f2, 4); }
  function stepFlips(dt) { for (const f of flips) { const F = f.anim; if (!F || F.t >= 1) continue; const p = f.p; if (!p.alive) { F.t = 1; continue; } F.t = Math.min(1, F.t + dt / 0.38); const k = F.t * F.t * (3 - 2 * F.t);
      _a.set(F.dz, 0, -F.dx).normalize(); _r.makeRotationAxis(_a, k * Math.PI / 2); _t.makeTranslation(-F.c0[0], -F.c0[1], -F.c0[2]); _m.makeTranslation(F.c0[0] + (F.c1[0] - F.c0[0]) * k, F.c0[1] + (F.c1[1] - F.c0[1]) * k + Math.sin(k * Math.PI) * 0.35, F.c0[2] + (F.c1[2] - F.c0[2]) * k); _m.multiply(_r).multiply(_t);
      p.parts.forEach((pt, i) => { _r.fromArray(F.b0[i]).premultiply(_m); _r.toArray(pt.base); }); p.dirty = true;
      if (F.t >= 1) { const s = p.solid, [x0, x1, z0, z1] = f.box; Object.assign(s, { x0, x1, z0, z1, h: 1.3 }); Object.assign(p, { x0, x1, z0, z1, y0: 0, y1: 1.4, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2 }); f.sp.s = s; spots.push(f.sp); A.St.shake = Math.max(A.St.shake, 0.2); A.burst(p.cx, 0.2, p.cz, 14, 0xd9cbb5, 5); } } }
  // ---------- SPOTS ----------
  function floor(A_) { A = A_; spots = []; flips = []; nFlank = 0; barkT = 0; for (const q of lobs) { q.on = false; q.m.visible = q.r.visible = false; } bubs.length = 0;
    for (const s of A.solid) { if (BAD.has(s.k) || s.h < 0.75 || s.y0 != null || s.x0 < -24.2 || s.x1 > 24.2 || s.z0 < -18.2 || s.z1 > 18.2) continue; const tall = s.h >= 1.7, off = 0.8;
      if (s.prop && (o.flip || []).includes(s.prop.kind)) flips.push({ p: s.prop, done: false });
      for (const [ax, c, nx, nz] of [['x', s.z0 - off, 0, -1], ['x', s.z1 + off, 0, 1], ['z', s.x0 - off, -1, 0], ['z', s.x1 + off, 1, 0]]) { const a0 = ax === 'x' ? s.x0 : s.z0, a1 = ax === 'x' ? s.x1 : s.z1, L = a1 - a0; if (L < 0.5) continue;
        const ts = []; if (tall) ts.push([a0 + 0.45, -1], [a1 - 0.45, 1]); else { const n = Math.max(1, Math.round(L / 1.5)); for (let i = 0; i < n; i++) ts.push([a0 + L * (i + 0.5) / n, 0]); }
        for (const [t, side] of ts) { const x = ax === 'x' ? t : c, z = ax === 'x' ? c : t; if (Math.abs(x) > 23 || Math.abs(z) > 17 || A.inSolid(x, z, 0.5)) continue; let pop = null;
          if (tall) { const en = side < 0 ? a0 - 0.75 : a1 + 0.75, px = ax === 'x' ? en : c, pz = ax === 'x' ? c : en; if (A.inSolid(px, pz, 0.45) || Math.abs(px) > 23 || Math.abs(pz) > 17) continue; pop = [px, pz]; }
          spots.push({ x, z, s, nx, nz, tall, pop, by: 0 }); } } } }
  const BAND = { thrower: [6, 13], lookout: [8, 15], brawler: [3.5, 9] };
  function pick(e, far, loose) { const P = A.P, cv = e.cv, band = BAND[cv.role]; let best = null, bs = -1e9, cx = 0, cz = 0, n = 0;
    if (cv.flank) for (const q of A.foes) if (q !== e && q.alive && q.cv && q.cv.alert) { cx += q.x; cz += q.z; n++; }
    for (const sp of spots) { if (sp.taken && sp.taken !== e && sp.taken.alive) continue; if (!covers(sp, P.x, P.z)) continue; const dS = Math.hypot(sp.x - e.x, sp.z - e.z), dP = Math.hypot(sp.x - P.x, sp.z - P.z); if (dS > (loose ? 9 : 15) || dP < 2.8) continue;
      if (!loose && dS > 0.5 && A.segHitsWall(e.x, e.z, sp.x, sp.z, 0.4)) continue;
      let sc = -dS * 0.8 - (dP < band[0] ? (band[0] - dP) * 2 : dP > band[1] ? (dP - band[1]) * 1.2 : 0); if (far) sc += Math.min(dP, 16) * 1.6;
      if (n) { const gx = cx / n - P.x, gz = cz / n - P.z, c = (gx * (sp.x - P.x) + gz * (sp.z - P.z)) / ((Math.hypot(gx, gz) || 1) * (dP || 1)); sc += (1 - Math.abs(c)) * 7 - Math.max(0, c) * 4; }
      if (sp.tall && cv.role !== 'brawler' && A.segHitsWall(sp.pop[0], sp.pop[1], P.x, P.z, 1.35)) sc -= 5;
      sc += Math.random() * 0.8; if (sc > bs) { bs = sc; best = sp; } }
    return best || (loose ? null : pick(e, far, true)); }
  function flipPick(e) { const P = A.P; let best = null, bd = 5.5; for (const f of flips) { if (f.done || !f.p.alive || (f.claim && f.claim !== e && f.claim.alive)) continue; const d = Math.hypot(f.p.cx - e.x, f.p.cz - e.z), dP = Math.hypot(f.p.cx - P.x, f.p.cz - P.z); if (d < bd && dP > 4 && dP < 14) { bd = d; best = f; } } return best; }
  function claim(e, sp) { const cv = e.cv; if (cv.sp && cv.sp.taken === e) cv.sp.taken = null; cv.sp = sp; if (sp) sp.taken = e; }
  function seek(e, far) { const cv = e.cv; cv.t = 0; cv.chk = 0; cv.lt = 0; cv.lx = e.x; cv.lz = e.z; A.tele(e, false);
    const f = !far && flipPick(e), sp = pick(e, far); if (f && (!sp || Math.random() < 0.65)) { claim(e, null); f.claim = e; cv.flip = f; const P = A.P, dx0 = P.x - f.p.cx, dz0 = P.z - f.p.cz, ax = Math.abs(dx0) > Math.abs(dz0); cv.go = [f.p.cx - (ax ? Math.sign(dx0) : 0) * 1.25, f.p.cz - (ax ? 0 : Math.sign(dz0)) * 1.25]; cv.ph = 'flipgo'; return; }
    if (sp) { claim(e, sp); cv.ph = 'move'; } else { claim(e, null); cv.ph = 'open'; } }
  function alert(e, A, spread) { const cv = e.cv; if (cv.alert) return; cv.alert = true; cv.delay = spread ? rnd(0.25, 0.7) : 0; cv.ph = 'seek';
    if (!spread) { bark(e, cv.flank ? 'flank' : 'spot'); for (const q of A.foes) if (q !== e && q.alive && q.cv && !q.cv.alert && Math.hypot(q.x - e.x, q.z - e.z) < 10) alert(q, A, true); } }
  // ---------- THE BRAIN (true = handled · false = the engine's own brain runs this frame, e.g. the brawler's RUSH) ----------
  function upd(e, dt, A_, walkTo, see, dist) { A = A_; const P = A.P, u = e.m.userData, f = u.fox;
    const cv = e.cv || (e.cv = { role: o.role(e), ph: 'patrol', t: 0, bt: 0, ck: 0, pops: 0, flank: false });
    if (!cv.init) { cv.init = true; if (cv.role === 'brawler' && nFlank++ % 3 === 2) cv.flank = true; if (e.from) alert(e, A, false); }
    cv.t += dt; cv.bt -= dt; const dx = P.x - e.x, dz = P.z - e.z, face = k => { e.yaw += angD(yawTo(dx, dz), e.yaw) * Math.min(1, dt * k); };
    if (!cv.alert && ((see && dist < 14) || e.hp < e.max)) alert(e, A, false);
    if (cv.alert && !cv.hurt && e.hp < e.max * 0.4) { cv.hurt = true; bark(e, 'hit', true); cv.retreat = true; seek(e, true); }
    if (cv.delay > 0) { cv.delay -= dt; face(6); return pose(e, 'idle', 0, dt); }
    let mode = 'idle', p = 0, duck = 0;
    switch (cv.ph) {
      case 'patrol': { const tg = e.goB ? e.pb || e.pa : e.pa; if (walkTo(tg[0], tg[1], 1.4)) e.goB = !e.goB; break; }
      case 'seek': seek(e, cv.retreat); break;
      case 'open': if (cv.t > 2.2) { seek(e, false); break; } e.hop = 0; return false;
      case 'rush': { if (e.state === 'lunge') cv.lunged = true; if ((cv.lunged && e.state === 'idle') || cv.t > 4) { cv.lunged = false; seek(e, false); break; } e.hop = 0; cv.ck = 0; return false; }
      case 'move': case 'back': { const sp = cv.sp; duck = cv.ph === 'move' ? 0.25 : 0.4; if (!sp || !live(sp.s)) { bark(e, 'lost'); seek(e, false); break; }
        if (walkTo(sp.x, sp.z, cv.retreat ? 4.8 : cv.role === 'brawler' ? 4.2 : 3.7)) { cv.ph = 'duck'; cv.t = 0; cv.dur = cv.retreat ? 3.5 : rnd(1.2, 2.2); cv.blind = false; cv.retreat = false; if (Math.random() < 0.3) bark(e, 'duck'); break; }
        cv.chk += dt; if (cv.chk > 0.5) { cv.chk = 0; if (cv.ph === 'move' && !covers(sp, P.x, P.z)) { seek(e, cv.retreat); break; } }
        cv.lt += dt; if (cv.lt > 1) { if (Math.hypot(e.x - cv.lx, e.z - cv.lz) < 0.3) { cv.ph = 'open'; cv.t = 0; } cv.lx = e.x; cv.lz = e.z; cv.lt = 0; } break; }
      case 'flipgo': { const fl = cv.flip; if (!fl || fl.done || !fl.p.alive) { seek(e, false); break; } duck = 0.25; if (walkTo(cv.go[0], cv.go[1], 4.2)) { cv.ph = 'flip'; cv.t = 0; bark(e, 'flip', true); startFlip(fl, e); }
        cv.lt += dt; if (cv.lt > 1) { if (Math.hypot(e.x - cv.lx, e.z - cv.lz) < 0.3) { fl.claim = null; cv.flip = null; seek(e, false); } cv.lx = e.x; cv.lz = e.z; cv.lt = 0; } break; }
      case 'flip': { if (!cv.flip || !cv.flip.p.alive) { cv.flip = null; seek(e, false); break; } face(8); mode = 'atk'; p = cv.t / 0.4; if (cv.t > 0.5 && cv.flip.sp.s) { claim(e, cv.flip.sp); cv.flip = null; cv.ph = 'duck'; cv.t = 0; cv.dur = rnd(1.0, 1.6); } break; }
      case 'duck': { const sp = cv.sp; duck = 1; face(5); if (!sp || !live(sp.s)) { bark(e, 'lost', true); A.say3('EXPOSED!', e.x - 0.6, e.y + 3.2, e.z, '#ffd23a'); seek(e, false); break; }
        cv.chk += dt; if (cv.chk > 0.4) { cv.chk = 0; if (!covers(sp, P.x, P.z)) { bark(e, cv.role === 'brawler' ? 'rush' : 'lost'); if (cv.role === 'brawler' && dist < 7) { cv.ph = 'rush'; cv.t = 0; break; } seek(e, false); break; } }
        if (cv.role === 'brawler' && dist < 2.8) { cv.ph = 'rush'; cv.t = 0; bark(e, 'rush'); break; }
        if (cv.role !== 'brawler' && dist < 3.2) { bark(e, 'close'); seek(e, true); break; }
        if (cv.role === 'thrower' && !cv.blind && cv.t > cv.dur * 0.5) { cv.blind = true; if (Math.random() < 0.4) { bark(e, 'blind'); lob(e, P.x + rnd(-1.8, 1.8), P.z + rnd(-1.8, 1.8)); } }
        if (cv.t > cv.dur) { if (cv.role === 'thrower' && popped(e) >= 2) { cv.dur += rnd(0.4, 0.9); if (Math.random() < 0.3) bark(e, 'taunt'); break; } cv.ph = 'tell'; cv.t = 0; if (Math.random() < 0.25) bark(e, 'taunt'); } break; }
      case 'tell': { const sp = cv.sp; face(7); mode = 'tell'; p = cv.t / TELL; duck = 1 - Math.min(1, cv.t / TELL) * 0.6; if (sp && sp.tall) { duck = 0.3; walkTo(sp.pop[0], sp.pop[1], 3.4); }
        if (cv.t > TELL) { cv.ph = 'pop'; cv.t = 0; cv.aim = -0.2; cv.pops++; if (cv.role === 'brawler') bark(e, 'rush'); else if (Math.random() < 0.35) bark(e, 'pop'); } break; }
      case 'pop': { const sp = cv.sp; face(8); if (sp && sp.tall) walkTo(sp.pop[0], sp.pop[1], 3.4);
        if (cv.role === 'brawler') { mode = 'tell'; p = 1; if (cv.t > 0.6) { if (see && dist < 9) { cv.ph = 'rush'; cv.t = 0; e.state = 'idle'; e.cd = 0; coverMe(e); } else endPop(e); } break; }
        if (cv.role === 'lookout') { if (cv.t > 0.4 && see && e.cd <= 0 && (e.calls || 0) < 2 && o.whistle) { o.whistle(e, A); A.tele(e, false); return true; } if (cv.t > POP) endPop(e); break; }
        // THROWER: aim (red line) → throw → short rest → again, until the pop is over
        const SC = e.st || A.S.crawler; u.muzzle.getWorldPosition(_a); const ty = P.y + (P.crouch ? 0.85 : 1.3), lof = see && !A.segHitsWall(e.x, e.z, P.x, P.z, 1.35);
        cv.aim += dt; if (cv.aim > 0 && lof) { mode = 'tell'; p = cv.aim / 0.65; A.tele(e, true, _a.x, _a.y, _a.z, P.x, ty, P.z); if (cv.aim > 0.65) { A.tele(e, false); const L = Math.hypot(P.x - _a.x, ty - _a.y, P.z - _a.z) || 1, sp2 = SC.shell || 14;
            A.fireBolt(_a.x, _a.y, _a.z, (P.x - _a.x) / L * sp2, (ty - _a.y) / L * sp2, (P.z - _a.z) / L * sp2, false, SC.cannonHit || 10); A.burst(_a.x, _a.y, _a.z, 6, 0xffb347, 3); cv.aim = -0.55; } }
        else { A.tele(e, false); if (cv.aim > 0) cv.aim = 0; mode = cv.aim < -0.3 ? 'atk' : 'idle'; p = 1 + cv.aim / 0.55; }
        if (cv.t > POP) { A.tele(e, false); endPop(e); } break; }
    }
    return pose(e, mode, p, dt, duck); }
  const popped = e => A.foes.reduce((n, q) => n + (q !== e && q.alive && q.cv && q.cv.role === 'thrower' && (q.cv.ph === 'pop' || q.cv.ph === 'tell') ? 1 : 0), 0);
  // a brawler goes in → the throwers near him pop up and throw to cover him (COVER ME!)
  function coverMe(e) { let n = 0; for (const q of A.foes) if (q !== e && q.alive && q.cv && q.cv.role === 'thrower' && q.cv.ph === 'duck' && Math.hypot(q.x - e.x, q.z - e.z) < 12 && n < 2) { q.cv.t = Math.max(q.cv.t, q.cv.dur - 0.15 * n); n++; } if (n) bark(e, 'coverMe', true); }
  function endPop(e) { const cv = e.cv; if (cv.pops >= 2 && Math.random() < 0.5) { cv.pops = 0; seek(e, false); return; } cv.ph = cv.sp && cv.sp.tall ? 'back' : 'duck'; cv.t = 0; cv.dur = rnd(1.2, 2.2); cv.blind = false; }
  function pose(e, mode, p, dt, duck = 0) { const cv = e.cv, f = e.m.userData.fox; cv.ck = damp(cv.ck, duck, 10, dt); o.pose(e.m, 'crawler', { mode, p, speed: e.spd || 0, dt }, e);
    if (f && cv.ck > 0.01) { const FP = f.userData.P; for (const l of FP.legs) l.rotation.x = l.rotation.x + (-1.35 - l.rotation.x) * cv.ck; FP.body.rotation.x += 0.3 * cv.ck; }
    e.hop = -0.62 * cv.ck; return true; }
  // a hit on a ducked bandit from the far side of his cover lands on the cover (props crack + break; walls just stop it)
  function shield(e, d, fx, fz) { const cv = e.cv; if (!cv || cv.ck < 0.5 || !cv.sp || !A) return false; const s = cv.sp.s; if (!live(s) || !segBox(fx, fz, e.x, e.z, s, 0.1)) return false;
    const hx = Math.max(s.x0, Math.min(s.x1, e.x)), hz = Math.max(s.z0, Math.min(s.z1, e.z)); if (s.prop && s.prop.alive) A.hitProp(s.prop, 1, fx, fz, true, hx, Math.min(s.h - 0.1, 1), hz); else A.burst(hx, Math.min(s.h - 0.1, 1.1), hz, 5, 0xffffff, 3);
    const now = A.St.t; if (!(cv.coverSaid > now - 0.7)) { cv.coverSaid = now; A.say3('COVER', e.x - 0.6, e.y + 2.2, e.z, '#cfd3d6'); } return true; }
  // auto-aim: the laser picks an exposed bandit before one tucked behind his cover
  const aimCost = e => e.cv && e.cv.ck > 0.5 && e.cv.sp && live(e.cv.sp.s) && A && segBox(A.P.x, A.P.z, e.x, e.z, e.cv.sp.s, 0.05) ? 7 : 0;
  // THE PLAYER ducks by himself: standing still next to LOW cover while a bandit is after him (shooting / swinging pops him up)
  function playerCrouch(A_, dt) { A = A_; const P = A.P; if (P.ko > 0 || !P.ground || (P.popT || 0) > 0 || Math.hypot(P.vx, P.vz) > 1.2) return false;
    const th = A.foes.filter(q => q.alive && ((q.cv && q.cv.alert) || q.type === 'boss' || q.st || q.type === 'guard') && Math.hypot(q.x - P.x, q.z - P.z) < 18); if (!th.length) return false;
    const lows = []; for (const s of A.solid) { if (BAD.has(s.k) || s.y0 != null || s.h < 0.75 || s.h > 1.75) continue; const cx = Math.max(s.x0, Math.min(s.x1, P.x)), cz = Math.max(s.z0, Math.min(s.z1, P.z)); if (Math.hypot(P.x - cx, P.z - cz) < 1.0) lows.push(s); }
    // stay down a moment once ducked (no flicker); else duck only if a low block sits between you and somebody after you
    const near = lows.length > 0 && (P.crouch || th.some(q => lows.some(s => segBox(P.x, P.z, q.x, q.z, s, 0.05))));
    if (near && !P.crouch) { A.say3('COVER', P.x - 0.6, P.y + 2.0, P.z, '#7df9ff'); if (!tipped) { tipped = true; A.St.banner = 'DUCKED · SHOOT OR SWING TO POP UP'; A.St.bannerT = 2.2; } }
    return near; }
  function tick(dt) { if (!A) return; barkT -= dt; stepLobs(dt); stepFlips(dt);
    for (let i = bubs.length - 1; i >= 0; i--) { const e = bubs[i], u = e.m.userData; u.bubT -= dt; if (!e.alive || u.bubT <= 0) { u.bub.visible = false; bubs.splice(i, 1); continue; } u.bub.material.opacity = Math.min(1, u.bubT / 0.3); u.bub.position.y = 2.9 + (1.6 - u.bubT) * 0.12; } }
  return { floor, upd, shield, playerCrouch, tick, bark, aimCost, get spots() { return spots; }, get flips() { return flips; } };
}
