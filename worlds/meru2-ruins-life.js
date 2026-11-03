// MERU 2.0 — s127 RUINS MUSEUM LOOK + LIFE (Ben's 8, s123), plugged into worlds/meru2-ruins-jobs.js as LF.
// Sun patches, floor dust + lamp glow come from shopKit. Here: SUN SHAFTS (door + 3 high slits, swing with the hour, motes drifting in them; a faint moon shaft at night) ·
// TORCH HALOS flicker (bigger at night) + DARK CORNERS at night · VISITORS by time of day (exhibit tour, one takes photos) ·
// DIGGERS come in from the desert with a crate of finds for Sandy's table · SAND blows in at the door in gusts (+ a drift on the threshold) ·
// OLD STONE HUM inside + WIND IN THE RUINS outside · BATS stream out of the Ruins Cave at dusk and fly home at dawn.
// The desert DIG TEAM (Grit, Dune, Marl) is the permit camp (worlds/meru2-permit-jobs2.js).
import { caveMouth } from './meru2-cave-mouth.js';
export function rsLife(X) {
  const { THREE, G, scene, kit, CT, LM, softT, hour, touch, mutedQ, ground, TORCH, LAMPS, sandy, inRoom, tone, noise, toast, YEL, INK } = X;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const H = () => (hour ? hour() : 12), night = () => { const h = H(); return h >= 20 || h < 6; };
  const gy = (x, z) => { try { const g = ground ? ground(x, z) : 0; return isFinite(g) ? g : 0; } catch (e) { return 0; } };
  const DOOR = [-380, -45], CAVE = [-432, 0];
  const turnTo = (f, a, k) => { let d = a - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * k; };
  // ================= SUN SHAFTS (additive quads: top on the south wall, foot on the floor, foot swings with the hour) =================
  const shaftT = CT(64, 256, (g, w, h) => { const r = g.createLinearGradient(0, 0, 0, h); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.7, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h);
    const e = g.createLinearGradient(0, 0, w, 0); e.addColorStop(0, 'rgba(0,0,0,1)'); e.addColorStop(0.25, 'rgba(0,0,0,0)'); e.addColorStop(0.75, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = e; g.fillRect(0, 0, w, h); });
  const slitM = new THREE.MeshBasicMaterial({ color: '#fff3d0' });
  const SH = [{ x: -380, y: 3.9, w: 3.0, len: 4.6, slit: false }, { x: -372, y: 7.0, w: 0.7, len: 7.4, slit: true }, { x: -388, y: 7.0, w: 0.7, len: 7.4, slit: true }, { x: -405, y: 6.4, w: 0.7, len: 6.8, slit: true }].map(s => {
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3)); geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2)); geo.setIndex([0, 2, 1, 1, 2, 3]);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: shaftT, color: '#ffe2a8', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.frustumCulled = false; m.renderOrder = 4; G.add(m);
    if (s.slit) { const w = new THREE.Mesh(new THREE.PlaneGeometry(s.w, 1.0), slitM); w.position.set(s.x, s.y - 0.4, DOOR[1] - 0.07); w.rotation.y = Math.PI; G.add(w); s.win = w; }
    return { ...s, m, pos: geo.attributes.position, foot: V() }; });
  let shH = -1;
  const shaftsAt = h => { const k = clamp((h - 12) / 6, -1, 1); SH.forEach(s => { const z0 = DOOR[1] - 0.12, top = s.y, fx = s.x + k * s.len * 0.45, fz = z0 - s.len * (0.55 + 0.25 * (1 - Math.abs(k))), hw = s.w / 2, fw = hw * 1.25, p = s.pos.array;
      p.set([s.x - hw, top, z0, s.x + hw, top, z0, fx - fw, 0.06, fz, fx + fw, 0.06, fz]); s.pos.needsUpdate = true; s.m.geometry.computeBoundingSphere(); s.foot.set(fx, 0, fz); s.top = top; s.z0 = z0; }); };
  // motes floating inside the shafts
  const NM = touch ? 36 : 72, mp = new Float32Array(NM * 3), MOTE = [];
  for (let i = 0; i < NM; i++) MOTE.push({ s: i % SH.length, u: Math.random(), v: rnd(-0.5, 0.5), ph: rnd(0, 6.3), sp: rnd(0.01, 0.035) });
  const mGeo = new THREE.BufferGeometry(); mGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(mGeo, new THREE.PointsMaterial({ map: softT, color: '#fff0c8', size: 0.05, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); motes.frustumCulled = false; motes.renderOrder = 5; G.add(motes);
  // ================= TORCH HALOS + NIGHT dark corners =================
  const haloM = () => new THREE.SpriteMaterial({ map: softT, color: '#ffb35c', transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
  const HALO = [...TORCH.map(t => ({ p: t.fl.position, i: t.i, k: 1 })), ...LAMPS.map(([x, y, z], i) => ({ p: V(x, y - 0.12, z), i: 20 + i, k: 0.7 }))].map(o => { const s = new THREE.Sprite(haloM()); s.position.copy(o.p); s.renderOrder = 4; G.add(s); return { ...o, s }; });
  const darkT = CT(128, 128, g => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 63); r.addColorStop(0, 'rgba(10,6,2,1)'); r.addColorStop(1, 'rgba(10,6,2,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const DARK = [[-393.6, -46.4], [-366.4, -46.4], [-393.6, -68.6], [-366.4, -68.6], [-413.6, -46.4], [-396.4, -46.4], [-413.6, -68.6], [-396.4, -68.6], [-380, -68.8]].map(([x, z]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), new THREE.MeshBasicMaterial({ map: darkT, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6 })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.08, z); m.renderOrder = 3; G.add(m); return m; });
  // ================= SAND at the door (a drift on the threshold + gusts) =================
  const driftT = CT(256, 128, (g, w, h) => { const r = g.createRadialGradient(w / 2, 0, 4, w / 2, 0, w / 2); r.addColorStop(0, 'rgba(214,186,132,0.95)'); r.addColorStop(0.6, 'rgba(205,180,136,0.55)'); r.addColorStop(1, 'rgba(205,180,136,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(168,139,94,0.35)' : 'rgba(240,222,180,0.35)'; g.fillRect(Math.random() * w, Math.random() * h * 0.8, 2, 1); } });
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.3), new THREE.MeshBasicMaterial({ map: driftT, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -5 })); m.rotation.x = -Math.PI / 2; m.position.set(DOOR[0], 0.085, DOOR[1] - 1.1); m.renderOrder = 3; G.add(m); }
  const GRAIN = [], NG = touch ? 14 : 26; for (let i = 0; i < NG; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softT, color: '#d6bb88', transparent: true, opacity: 0, depthWrite: false })); s.visible = false; s.renderOrder = 4; G.add(s); GRAIN.push({ s, t: 0, life: 1, v: V() }); }
  let gustT = 4, gust = 0;
  const doGust = here => { gust = 1; for (const q of GRAIN) { if (Math.random() < 0.25) continue; q.t = q.life = rnd(1.4, 2.6); q.s.position.set(DOOR[0] + rnd(-1.5, 1.5), rnd(0.05, 0.35), DOOR[1] + rnd(0.5, 1.6)); q.v.set(rnd(-0.5, 0.5), rnd(0, 0.12), -rnd(1.6, 3.0)); q.sz = rnd(0.25, 0.6); q.s.visible = true; }
    if (here) noise(1.4, 0.012, 500); };
  // ================= VISITORS (exhibit tour by the hour) =================
  // each stop: approach path (from the cross aisle z -57) + stand point + what they look at
  const STOPS = [{ p: [[-391.6, -57], [-392.6, -51.5]], at: [-394, -51.5] }, { p: [[-368.2, -58.1], [-367.6, -52.5]], at: [-366, -52.5] }, { p: [[-388, -57], [-388.8, -65.0]], at: [-390.5, -66.5] },
    { p: [[-372.5, -58.1], [-372.5, -59.7]], at: [-372.5, -62.2] }, { p: [[-369.5, -58.1], [-369.5, -64.9]], at: [-369.5, -66.5] }, { p: [[-387.6, -57], [-387.6, -67.7]], at: [-390, -70] },
    { p: [[-384.5, -57], [-384.5, -64.4]], at: [-382, -69.6] }, { p: [[-390.5, -57.6]], at: [-390.5, -61.8] }];
  const aisle = x => (x > -380 ? -58.1 : -57), HUB = [-380, -57], IN = [[-380, -40.5], [-380, -46.4], [-380, -50.5]];
  const LOOKS = [['#5a7a9a', '#3a5a7a', '#1d2f44'], ['#c9a24a', '#8a6a2a', '#4a3a14'], ['#9b5c3a', '#6b3a22', '#3a1e12']];
  const VIS = LOOKS.slice(0, touch ? 2 : 3).map((torso, i) => { const f = kit.makeFox({ key: 'mrsVisit' + i, torso, outfit: i === 1 ? 'robe' : 'coat', female: i === 1, mood: 'happy' }); f.visible = false; G.add(f); return { f, st: 'off', path: [], spd: 1.15, t: 0, n: 0, cam: i === 0 }; });
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: softT, color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); flash.scale.setScalar(0.9); flash.renderOrder = 6; G.add(flash); let flashT = 0;
  const wantV = () => { const h = H(); return h < 9 || h >= 20 ? 0 : h >= 13 && h < 17 ? 3 : h >= 17 ? 1 : 2; };
  const walkTo = (v, pts, then) => { v.path = pts.map(p => p.slice()); v.st = 'walk'; v.then = then; };
  const stopFree = (s, ring) => !ring || Math.hypot(s.p[s.p.length - 1][0] - ring[0], s.p[s.p.length - 1][1] - ring[1]) > 3.5;
  let visT = 3;
  const nextStop = (v, ring) => { const L = STOPS.filter((s, i) => i !== v.si && stopFree(s, ring) && !VIS.some(o => o !== v && o.si === i)); const s = L[(Math.random() * L.length) | 0];
    if (!s || v.n >= 4) { v.si = -1; walkTo(v, [[v.f.position.x, aisle(v.f.position.x)], HUB, IN[2], IN[1], IN[0]], 'gone'); return; } v.si = STOPS.indexOf(s); v.n++; walkTo(v, [[v.f.position.x, aisle(v.f.position.x)], ...s.p], 'look'); };
  const step = (o, dt) => { const p = o.path[0]; if (!p) return -1; const dx = p[0] - o.f.position.x, dz = p[1] - o.f.position.z, d = Math.hypot(dx, dz); if (d < 0.08) { o.path.shift(); return 0; }
    const s = Math.min(d, o.spd * dt); o.f.position.x += dx / d * s; o.f.position.z += dz / d * s; turnTo(o.f, Math.atan2(dx, dz), Math.min(1, dt * 8)); return o.spd; };
  const yAt = (x, z) => (z > DOOR[1] + 0.2 ? gy(x, z) : 0);
  function visitTick(dt, P, here, job) { const w = job === 'watch' ? 0 : wantV(), ring = job && X.RINGS[job]; visT -= dt;
    if (job === 'watch') VIS.forEach(v => { v.st = 'off'; v.f.visible = false; });
    const on = VIS.filter(v => v.st !== 'off').length;
    if (visT <= 0 && on < w) { visT = 10 + rnd(0, 12); const v = VIS.find(u => u.st === 'off'); if (v) { v.n = 0; v.si = -1; v.f.position.set(IN[0][0], yAt(IN[0][0], IN[0][1]), IN[0][1]); v.f.rotation.y = Math.PI; v.f.visible = true; walkTo(v, [IN[1], IN[2], HUB], 'pick'); } }
    for (const v of VIS) { if (v.st === 'off') continue; let spd = 0;
      if (v.st === 'walk') { const r = step(v, dt); if (r < 0) { v.st = v.then; v.t = 0; if (v.st === 'gone') { v.st = 'off'; v.f.visible = false; continue; } if (v.st === 'pick') { nextStop(v, ring); continue; } } else spd = r; v.f.position.y = yAt(v.f.position.x, v.f.position.z); }
      else if (v.st === 'look') { const s = STOPS[v.si]; turnTo(v.f, Math.atan2(s.at[0] - v.f.position.x, s.at[1] - v.f.position.z), Math.min(1, dt * 3)); v.t += dt;
        if (v.cam && here && v.t > 2.5 && v.t < 2.5 + dt * 1.5 && Math.random() < 0.6) { flash.position.copy(v.f.position).add(V(Math.sin(v.f.rotation.y) * 0.4, 1.35, Math.cos(v.f.rotation.y) * 0.4)); flashT = 0.18; tone(2400, 0.015, 0.05, 'square'); }
        if (v.t > 7 + v.si % 3 * 2 || (ring && !stopFree(s, ring))) nextStop(v, ring); }
      if (here || !touch) kit.animFox(v.f, dt, spd, false); }
    flashT -= dt; flash.material.opacity = Math.max(0, flashT / 0.18) * 0.9; }
  // ================= DIGGERS with finds (desert → door → Sandy's finds table → back out) =================
  const hat = f => { const P0 = f.userData && f.userData.P; if (!P0 || !P0.head) return; const h = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), LM(YEL)); h.position.y = 0.16; P0.head.add(h); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.02, 14), LM(YEL)); b.position.y = 0.16; P0.head.add(b); };
  const crate = () => { const c = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.24, 0.36), LM('#8a6a42')); c.add(b); const s = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.34), LM('#cdb488')); s.position.y = 0.11; c.add(s);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.12, 8), LM('#b5603a')); pot.position.set(-0.1, 0.17, 0); c.add(pot); const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06), LM('#8f8574')); st.position.set(0.12, 0.15, 0.03); c.add(st); return c; };
  const DIGP = { in: [[-380, -38], [-380, -46.4], [-380, -48.5], [-383, -57.2], [-394, -57.4], [-397.6, -57.0], [-399.4, -54.2], [-403.2, -53.05]], drop: V(-403.2, 0.99, -51.85) };
  const DIGS = [['#7a6a4a', '#5a4a30', '#2e2618'], ['#6a4a3a', '#4a3226', '#2a1a12']].map((torso, i) => { const f = kit.makeFox({ key: 'mrsDigger' + i, torso, outfit: 'vest', female: i === 1, mood: 'happy' }); hat(f); f.visible = false; G.add(f);
    const c = crate(); c.position.set(0, 0.92, 0.36); f.add(c); return { f, c, st: 'off', path: [], spd: 1.25, t: 0 }; });
  const tableCrate = crate(); tableCrate.visible = false; G.add(tableCrate); let tableT = 0, digT = 25, sandyLook = null;
  const SANDY_JOBS = { brush: 1, catalogue: 1, dig: 1, rub: 1 };
  function digTick(dt, P, here, job) { const h = H(); digT -= dt;
    if (digT <= 0 && h >= 8 && h < 18 && !SANDY_JOBS[job] && job !== 'watch') { digT = rnd(45, 80); const d = DIGS.find(q => q.st === 'off'); if (d && !DIGS.some(q => q.st !== 'off')) {
      d.f.position.set(DIGP.in[0][0], gy(DIGP.in[0][0], DIGP.in[0][1]), DIGP.in[0][1]); d.f.rotation.y = Math.PI; d.f.visible = true; d.c.visible = true; d.path = DIGP.in.slice(1).map(p => p.slice()); d.st = 'in';
      if (here && !job) toast('A DIGGER BRINGS NEW FINDS FOR SANDY', 2.2); } }
    sandyLook = null;
    for (const d of DIGS) { if (d.st === 'off') continue; let spd = 0;
      if (d.st === 'in' || d.st === 'out') { const r = step(d, dt); if (r < 0) { if (d.st === 'in') { d.st = 'drop'; d.t = 0; } else { d.st = 'off'; d.f.visible = false; continue; } } else spd = r; d.f.position.y = d.f.position.z > DOOR[1] + 0.2 ? gy(d.f.position.x, d.f.position.z) : 0; }
      if (d.st === 'drop') { turnTo(d.f, 0, Math.min(1, dt * 4)); d.t += dt; sandyLook = d.f.position;
        if (d.t > 0.9 && d.c.visible) { d.c.visible = false; tableCrate.position.copy(DIGP.drop); tableCrate.rotation.y = rnd(-0.2, 0.2); tableCrate.visible = true; tableT = 12; if (here) { tone(330, 0.04, 0.12, 'square'); noise(0.12, 0.015, 900); tone(988, 0.03, 0.3, 'triangle', 0.25); } }
        if (d.t > 2.6) { d.st = 'out'; d.path = DIGP.in.slice(0, -1).reverse().map(p => p.slice()); d.path.push([-381, -30]); } }
      if (here || !touch) kit.animFox(d.f, dt, spd, false); }
    if (tableT > 0) { tableT -= dt; if (tableT <= 0 || SANDY_JOBS[job]) { tableCrate.visible = false; tableT = 0; } } }
  // ================= BATS (Ruins Cave, dusk out / dawn home) =================
  const BG = new THREE.Group(); BG.name = 'ruinsBats'; scene.add(BG); const mouthY = gy(CAVE[0] + 4, CAVE[1]) + 1.6; BG.position.set(CAVE[0] + 1.5, mouthY, CAVE[1]);
  const batM = new THREE.MeshBasicMaterial({ color: '#1a1416', side: THREE.DoubleSide }), wingG = new THREE.BufferGeometry(); wingG.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, -0.07, 0, 0, 0.07, 0.3, 0.02, 0.02, 0.22, 0, -0.08]), 3)); wingG.setIndex([0, 1, 2, 0, 2, 3]); wingG.computeVertexNormals();
  const BATS = []; for (let i = 0; i < (touch ? 9 : 16); i++) { const b = new THREE.Group(); const body = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), batM); body.scale.set(1, 0.8, 1.6); b.add(body);
    const L = new THREE.Mesh(wingG, batM), R = new THREE.Mesh(wingG, batM); R.scale.x = -1; b.add(L, R); b.visible = false; BG.add(b); BATS.push({ b, L, R, ph: rnd(0, 6.3), r: rnd(5, 13), y: rnd(3, 9), w: rnd(0.6, 1.1) * (Math.random() < 0.5 ? -1 : 1), d: i * 0.045, fx: rnd(9, 16), fz: rnd(-8, 8) }); }
  let squeakT = 2;
  function batTick(dt, t, PW) { const h = H(), near = Math.hypot(PW.x - CAVE[0], PW.z - CAVE[1]) < (touch ? 80 : 120); BG.visible = near && ((h >= 18.4 && h < 21.2) || (h >= 4.8 && h < 6.4)); if (!BG.visible) return;
    let any = 0; for (const o of BATS) { let e, away = 0; if (h >= 18) { e = clamp((h - 18.4 - o.d) / 0.18, 0, 1); away = clamp((h - 20.6) / 0.6, 0, 1); } else e = 1 - clamp((h - 4.8 - o.d) / 0.22, 0, 1);
      o.b.visible = e > 0 && away < 1; if (!o.b.visible) continue; any++;
      const a = o.ph + t * o.w, cx = o.fx + away * 40, cy = o.y + away * 14, sx = cx + Math.cos(a) * o.r, sy = cy + Math.sin(t * 1.7 + o.ph) * 1.2, sz = o.fz + Math.sin(a) * o.r;
      const k = e * e * (3 - 2 * e), x = sx * k, y = sy * k, z = sz * k; const px = o.b.position.x, pz = o.b.position.z; o.b.position.set(x, y, z);
      const dx = x - px, dz = z - pz; if (Math.abs(dx) + Math.abs(dz) > 1e-4) o.b.rotation.y = Math.atan2(dx, dz) - Math.PI / 2;
      const fl = Math.sin(t * 22 + o.ph) * 0.9; o.L.rotation.z = fl; o.R.rotation.z = -fl; }
    squeakT -= dt; if (any && squeakT <= 0) { squeakT = rnd(0.6, 2.2); if (Math.hypot(PW.x - CAVE[0], PW.z - CAVE[1]) < 35) tone(rnd(3600, 4800), 0.006, 0.06, 'sine'); } }
  // ================= OLD STONE HUM (inside) + WIND IN THE RUINS (outside nearby) =================
  let ac = null, snd = null;
  const sndSet = (hum, wind) => { if (mutedQ()) { hum = 0; wind = 0; } if (!snd && !hum && !wind) return; try {
      if (!snd) { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const hg = ac.createGain(), wg = ac.createGain(); hg.gain.value = wg.gain.value = 0; hg.connect(ac.destination); wg.connect(ac.destination);
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.connect(hg); const os = [55, 82.4, 110.2].map((f, i) => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f; const og = ac.createGain(); og.gain.value = [0.6, 0.3, 0.15][i]; o.connect(og).connect(lp); o.start(); return o; });
        const n = ac.sampleRate * 3 | 0, bf = ac.createBuffer(1, n, ac.sampleRate), dd = bf.getChannelData(0); let last = 0; for (let i = 0; i < n; i++) { last = last * 0.97 + (Math.random() * 2 - 1) * 0.03; dd[i] = last * 6; }
        const src = ac.createBufferSource(); src.buffer = bf; src.loop = true; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 0.7; src.connect(bp).connect(wg); src.start();
        const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.09; lg.gain.value = 260; lfo.connect(lg).connect(bp.frequency); lfo.start(); snd = { hg, wg, os: [...os, src, lfo] }; }
      const t = ac.currentTime; snd.hg.gain.setTargetAtTime(hum, t, 0.8); snd.wg.gain.setTargetAtTime(wind, t, 0.6);
      if (!hum && !wind && snd.hg.gain.value < 0.001 && snd.wg.gain.value < 0.001) { const s = snd; snd = null; try { s.os.forEach(o => o.stop()); s.hg.disconnect(); s.wg.disconnect(); } catch (e) {} } } catch (e) {} };
  let CM = null; try { CM = caveMouth(X); } catch (e) { console.warn('cave mouth: ' + (e && e.stack || e)); }
  // ================= per frame =================
  let nk = -1;
  function tick(dt, t, P, here, job, PW) { PW = PW || P; batTick(dt, t, PW); if (CM) try { CM.tick(dt, t, PW); } catch (e) { console.warn(e); CM = null; }
    const dRuin = Math.min(Math.hypot(PW.x + 390, PW.z + 57.5), Math.hypot(PW.x - CAVE[0], PW.z - CAVE[1]));
    sndSet(here ? 0.03 : 0, (here ? 0.006 : dRuin < 70 ? 0.02 * (1 - dRuin / 70) : 0) * (1 + gust * 1.5)); gust = Math.max(0, gust - dt * 0.6);
    if (!G.visible) return; const h = H(), nt = night();
    // shafts: day = warm gold (amber at the ends of the day), night = a faint blue moon shaft at the door only
    const hk = Math.round(h * 20) / 20; if (hk !== shH) { shH = hk; shaftsAt(nt ? 12 + Math.sin(h) : h); }
    const day = h >= 7 && h < 18.5 ? Math.sin(clamp((h - 6.5) / 12, 0, 1) * Math.PI) : 0, warm = clamp(Math.abs(h - 12.5) / 6, 0, 1);
    SH.forEach((s, i) => { const o = nt ? (i === 0 ? 0.07 : 0) : day * (i === 0 ? 0.22 : 0.32) * (0.9 + Math.sin(t * 0.6 + i) * 0.1); s.m.material.opacity += (o - s.m.material.opacity) * Math.min(1, dt * 2); s.m.visible = s.m.material.opacity > 0.004;
      s.m.material.color.set(nt ? '#9ab8ff' : warm > 0.7 ? '#ffc078' : '#ffe2a8'); if (s.win) s.win.material.color.set(nt ? '#2a3550' : warm > 0.7 ? '#ffd29a' : '#fff3d0'); });
    // motes
    if (here) { const mo = nt ? 0 : day * 0.85; motes.material.opacity += (mo - motes.material.opacity) * Math.min(1, dt * 2); motes.visible = motes.material.opacity > 0.01;
      if (motes.visible) { MOTE.forEach((m, i) => { const s = SH[m.s]; if (!s.top) return; m.u = (m.u + m.sp * dt * 0.4) % 1; const u = m.u, x0 = s.x, y0 = s.top, z0 = s.z0;
        mp[i * 3] = x0 + (s.foot.x - x0) * u + m.v * s.w * (1 + u * 0.25) + Math.sin(t * 0.3 + m.ph) * 0.12; mp[i * 3 + 1] = y0 + (0.06 - y0) * u + Math.sin(t * 0.5 + m.ph) * 0.1; mp[i * 3 + 2] = z0 + (s.foot.z - z0) * u + Math.cos(t * 0.4 + m.ph) * 0.12; }); mGeo.attributes.position.needsUpdate = true; } }
    else motes.visible = false;
    // torch halos flicker, bigger + brighter at night; dark corners at night
    HALO.forEach(o => { const f = 0.85 + Math.sin(t * 11 + o.i * 1.9) * 0.1 + Math.sin(t * 23 + o.i) * 0.06; o.s.material.opacity = (nt ? 0.8 : 0.32) * f * o.k; o.s.scale.setScalar((nt ? 1.5 : 0.85) * f * o.k); });
    if (nk !== +nt) nk = +nt; DARK.forEach(m => { const o = nt ? 0.72 : 0.14; m.material.opacity += (o - m.material.opacity) * Math.min(1, dt * 1.5); });
    // sand gusts at the door
    gustT -= dt; if (gustT <= 0) { gustT = rnd(6, 14); if (Math.hypot(PW.x - DOOR[0], PW.z - DOOR[1]) < 25) doGust(here); }
    for (const q of GRAIN) { if (q.t <= 0) continue; q.t -= dt; const k = 1 - q.t / q.life; q.s.position.addScaledVector(q.v, dt); q.v.multiplyScalar(1 - dt * 0.6); q.s.scale.set(q.sz * (1 + k * 1.5), q.sz * 0.35 * (1 + k), 1); q.s.material.opacity = Math.sin(k * Math.PI) * 0.4; if (q.t <= 0) q.s.visible = false; }
    // visitors + diggers
    visitTick(dt, P, here, job); digTick(dt, P, here, job);
    return sandyLook; }
  return { tick, VIS, DIGS, BATS, SH, get CM() { return CM; }, gust: () => doGust(true), dispose() { sndSet(0, 0); scene.remove(BG); if (CM) CM.dispose(); } };
}
