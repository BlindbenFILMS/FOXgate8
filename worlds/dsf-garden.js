// s484 DOME HARVEST (Kufa Station · The Garden · Sister Holly): a new station job played on the garden's own four raised beds.
// 90 s shift, camera eases over the dome garden. TAP a ripe crop to pick it (copper gourds NE, sun peppers SE, dune berries SW,
// honeyroot NW). Ripe crops rot after 6 s. Each bed dries out: TAP its copper VALVE to water it (dry = no growth, wilting).
// COPPER BEETLES crawl in from the bed edges toward the crops: TAP to flick them off. The Fleet POLLINATOR drone is hacked
// (red eye, sprays blight on a bed); TAP it to reset it: its eye turns cyan, it hums its own tune and speeds up the bed under it.
// ★ 14 · ★★ 22 · ★★★ 30 picked. Gold 2 a crop (+10 for freeing the drone). Stats kuHarvestBest, kuHarvestShifts; flag kuDroneFreed.
const CROPS = [{ a: 45, name: 'COPPER GOURD', col: '#d08a4a', sc: [1.2, 0.9, 1.2] }, { a: 135, name: 'SUN PEPPER', col: '#ec3013', sc: [0.8, 1.3, 0.8] },
  { a: 225, name: 'DUNE BERRY', col: '#7a3fd0', sc: [0.85, 0.85, 0.85] }, { a: 315, name: 'HONEYROOT', col: '#e8b42a', sc: [0.75, 1.4, 0.75] }];
const SHIFT = 90, RIPE = 6, BOT_Y = 2.3;

export function makeDomeHarvest(K, { host, ox, pol, D, audio, save, LOW }) {
  const { THREE } = K, rr = (a, b) => a + Math.random() * (b - a), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const root = new THREE.Group(); root.visible = false; host.add(root);
  const PW = 12.6, PH = PW * 0.7, YS = 0.55;
  const G = { stem: new THREE.CylinderGeometry(0.03, 0.04, 1, 6), leaf: new THREE.SphereGeometry(0.16, 8, 6), fruit: new THREE.SphereGeometry(0.13, 12, 10), bug: new THREE.SphereGeometry(0.09, 10, 8), valve: new THREE.TorusGeometry(0.16, 0.035, 6, 16) };
  const MT = { stem: K.toon('#3a6a2a'), leaf: K.toon('#5fa040'), dry: K.toon('#9a8a4a'), rot: K.toon('#5a3a1a'), bug: K.toon('#b8642e'), cu: K.toon('#d08a4a'), ink: K.toon('#201e1d') };
  const fruitMat = CROPS.map(c => K.toon(c.col, { emissive: c.col, emissiveIntensity: 0.25 }));
  const beds = CROPS.map((C, bi) => { const [cx, cz] = pol(4.4, C.a), ry = -C.a * D, cs = Math.cos(ry), sn = Math.sin(ry), W2 = (lx, lz) => [cx + lx * cs + lz * sn, cz - lx * sn + lz * cs];
    const plants = []; for (const lx of [-0.8, 0, 0.8]) for (const lz of [-0.8, 0, 0.8]) { const [x, z] = W2(lx, lz), g = new THREE.Group(); g.position.set(x, 0.5, z); root.add(g);
      const stem = new THREE.Mesh(G.stem, MT.stem); stem.position.y = 0.25; stem.scale.y = 0.5; g.add(stem); const lv = []; for (let k = 0; k < 3; k++) { const l = new THREE.Mesh(G.leaf, MT.leaf); const a = k * 2.1; l.position.set(Math.cos(a) * 0.12, 0.2, Math.sin(a) * 0.12); l.scale.set(1, 0.45, 0.7); g.add(l); lv.push(l); }
      const fr = new THREE.Mesh(G.fruit, fruitMat[bi]); fr.position.y = 0.45; fr.scale.set(...C.sc); g.add(fr); plants.push({ g, stem, lv, fr, x, z, bed: bi, grow: 0, ripeT: 0, rot: false, pop: 0 }); }
    const [vx, vz] = W2(0, 1.55); const vg = new THREE.Group(); vg.position.set(vx, 0, vz); root.add(vg); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8), MT.cu); post.position.y = 0.4; vg.add(post);
    const wheel = new THREE.Mesh(G.valve, MT.cu); wheel.position.y = 0.82; wheel.rotation.x = Math.PI / 2; vg.add(wheel);
    const meter = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.08), K.basic('#5fe3ff', 0.95)); meter.position.set(0, 1.05, 0); vg.add(meter);
    return { C, cx, cz, plants, vx, vz, wheel, meter, water: 1, boost: 0, spin: 0, blight: 0 }; });
  const allP = beds.flatMap(b => b.plants);
  // the pollinator drone (Fleet-built): body, rotor ring, the eye
  const bot = new THREE.Group(); root.add(bot); { const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), K.toon('#c9ccd2')); bot.add(b); }
  const rotor = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 6, 24), MT.ink); rotor.rotation.x = Math.PI / 2; rotor.position.y = 0.16; bot.add(rotor);
  const eyeM = new THREE.MeshBasicMaterial({ color: '#ff3a2a', toneMapped: false }), eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), eyeM); eye.position.set(0, 0, 0.2); bot.add(eye);
  const spray = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#ff3a2a', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); spray.position.y = -0.95; bot.add(spray);
  const bugs = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(G.bug, MT.bug); m.scale.set(1, 0.55, 1.4); m.visible = false; root.add(m); bugs.push({ m, on: false }); }
  // always there: the job ring on the south path + a NOW HIRING board (big, high contrast)
  { const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), new THREE.MeshBasicMaterial({ color: '#9ff09f', transparent: true, opacity: 0.9, toneMapped: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.03, 6.0); host.add(ring);
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 320; const c = cv.getContext('2d'); c.fillStyle = '#201e1d'; c.fillRect(0, 0, 1024, 320); c.fillStyle = '#9ff09f'; c.fillRect(0, 0, 1024, 22); c.fillRect(0, 298, 1024, 22);
    c.fillStyle = '#f3f2f2'; c.font = '900 120px Archivo, Arial'; c.textBaseline = 'middle'; c.fillText('NOW HIRING', 48, 120, 930); c.fillStyle = '#ffd23a'; c.font = '800 56px Archivo, Arial'; c.fillText('DOME HARVEST \u00b7 STAND ON THE RING', 48, 230, 930);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 8), MT.cu); post.position.set(1.4, 0.95, 6.3); host.add(post);
    for (const [dz, ry] of [[0.05, 0], [-0.05, Math.PI]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(1.4, 1.72, 6.3 + dz); m.rotation.y = ry; host.add(m); } }
  let s = null, overlay = 'intro', hidden = [];
  const sfx = (f, d = 0.12, v = 0.04, t = 'triangle') => { try { audio.tone(f, d, v, t); } catch (e) {} };
  function hideProps() { hidden = []; const p = V3(); host.traverse(o => { if (!o.visible || !(o.isMesh || o.isSprite) || o === root) return; for (let q = o; q; q = q.parent) if (q === root) return; o.getWorldPosition(p);
      const lx = p.x - ox, lz = p.z, r = Math.hypot(lx, lz); if (r > 7.4) return;
      if (p.y > 1.6 || (p.y > 0.45 && beds.some(b => Math.hypot(lx - b.cx, lz - b.cz) < 1.6))) { hidden.push(o); o.visible = false; } }); }
  function fresh() { allP.forEach(p => { p.grow = rr(0.15, 0.95); p.ripeT = 0; p.rot = false; p.pop = 0; }); beds.forEach(b => { b.water = rr(0.6, 1); b.boost = 0; b.blight = 0; }); bugs.forEach(b => { b.on = false; b.m.visible = false; });
    return { t: SHIFT, picked: 0, rotted: 0, flicked: 0, eaten: 0, freed: false, botAt: V3(0, BOT_Y, 0), botTo: V3(2, BOT_Y, 2), botMode: 'wander', botT: 4, sprayBed: -1, bugT: 5, flash: null, flashT: 0, done: false }; }
  const say = (t, d = 1.6) => { s.flash = t; s.flashT = d; };
  function pick(p) { if (p.rot) { p.rot = false; p.grow = 0; p.ripeT = 0; sfx(220, 0.1, 0.03); say('CLEARED'); return; }
    if (p.grow < 1) { sfx(160, 0.08, 0.02, 'square'); return; } p.grow = 0; p.ripeT = 0; p.pop = 0.5; s.picked++; sfx(660 + (s.picked % 5) * 80, 0.14, 0.05); }
  function finish() { s.done = true; overlay = 'done'; const stars = s.picked >= 30 ? 3 : s.picked >= 22 ? 2 : s.picked >= 14 ? 1 : 0; s.stars = stars; s.gold = s.picked * 2 + (s.freed ? 10 : 0);
    try { if (s.gold) save.addGold(s.gold); save.setStat('kuHarvestShifts', save.stat('kuHarvestShifts', 0) + 1); if (s.picked > save.stat('kuHarvestBest', 0)) save.setStat('kuHarvestBest', s.picked); if (s.freed) save.setFlag('kuDroneFreed'); } catch (e) {}
    [523, 659, 784].forEach((f, i) => setTimeout(() => sfx(f, 0.25, 0.04), i * 110)); }
  function step(dt, T) { s.t -= dt; if (s.flashT > 0 && (s.flashT -= dt) <= 0) s.flash = null; if (s.t <= 0) { s.t = 0; finish(); return; }
    for (const b of beds) { b.water = Math.max(0, b.water - dt / (b.blight > 0 ? 6 : 24)); b.blight = Math.max(0, b.blight - dt); b.boost = Math.max(0, b.boost - dt); b.spin = Math.max(0, b.spin - dt);
      const rate = b.water > 0 ? (0.09 + (b.boost > 0 ? 0.1 : 0)) : 0;
      for (const p of b.plants) { if (p.rot) continue; if (p.grow < 1) { p.grow = Math.min(1, p.grow + rate * dt * rr(0.8, 1.2)); if (p.grow >= 1) p.ripeT = 0; } else { p.ripeT += dt * (b.water > 0 ? 1 : 1.8); if (p.ripeT > RIPE) { p.rot = true; s.rotted++; } } } }
    // beetles
    if ((s.bugT -= dt) <= 0) { s.bugT = Math.max(2.2, 6 - (SHIFT - s.t) / 25) * rr(0.7, 1.2); const bg = bugs.find(q => !q.on); const targets = allP.filter(p => !p.rot && p.grow > 0.5);
      if (bg && targets.length) { const p = targets[Math.floor(Math.random() * targets.length)], a = rr(0, 6.28); bg.on = true; bg.p = p; bg.x = p.x + Math.cos(a) * 1.6; bg.z = p.z + Math.sin(a) * 1.6; bg.m.visible = true; } }
    for (const bg of bugs) { if (!bg.on) continue; const dx = bg.p.x - bg.x, dz = bg.p.z - bg.z, d = Math.hypot(dx, dz);
      if (d < 0.12) { if (bg.p.grow >= 1) s.eaten++; bg.p.grow = 0; bg.p.ripeT = 0; bg.on = false; bg.m.visible = false; sfx(120, 0.2, 0.04, 'sawtooth'); say('A BEETLE ATE ONE'); continue; }
      const sp = 0.38 * dt; bg.x += dx / d * sp; bg.z += dz / d * sp; bg.m.position.set(bg.x, 0.53, bg.z); bg.m.rotation.y = Math.atan2(dx, dz); }
    // the drone
    const bt = s.botAt; s.botT -= dt;
    if (s.botMode === 'wander' && s.botT <= 0) { const b = beds[Math.floor(Math.random() * 4)]; s.botTo.set(b.cx, BOT_Y, b.cz); s.botMode = s.freed ? 'pollinate' : 'blight'; s.sprayBed = beds.indexOf(b); s.botT = 4; }
    else if ((s.botMode === 'blight' || s.botMode === 'pollinate') && s.botT <= 0) { s.botMode = 'wander'; s.botTo.set(rr(-5, 5), BOT_Y, rr(-4, 4)); s.botT = s.freed ? 3 : rr(5, 8); s.sprayBed = -1; }
    bt.lerp(s.botTo, 1 - Math.exp(-dt * 1.2)); const over = s.sprayBed >= 0 && Math.hypot(bt.x - s.botTo.x, bt.z - s.botTo.z) < 0.5;
    if (over && s.botMode === 'blight') { const b = beds[s.sprayBed]; if (b.blight <= 0) say('THE DRONE IS SPRAYING ' + b.C.name + 'S \u00b7 TAP IT'); b.blight = 1.5; }
    if (over && s.botMode === 'pollinate') beds[s.sprayBed].boost = 2; }
  function pose(T) { const t2 = T;
    for (const p of allP) { const g = Math.max(0.12, Math.min(1, p.grow)), b = beds[p.bed], dry = b.water <= 0;
      p.stem.scale.y = 0.2 + 0.6 * g; p.stem.position.y = p.stem.scale.y / 2; p.lv.forEach((l, k) => { l.position.y = 0.12 + 0.5 * g * (0.4 + k * 0.15); l.material = p.rot ? MT.rot : dry ? MT.dry : MT.leaf; });
      p.fr.visible = p.grow >= 0.55 || p.rot; const fk = p.rot ? 0.8 : Math.max(0, (p.grow - 0.55) / 0.45); p.fr.position.y = 0.35 + 0.45 * g; p.fr.material = p.rot ? MT.rot : fruitMat[p.bed];
      const ripe = p.grow >= 1 && !p.rot, pulse = ripe ? 1 + 0.12 * Math.sin(t2 * 8 + p.x) : 1; p.fr.scale.set(b.C.sc[0] * fk * pulse, b.C.sc[1] * fk * pulse, b.C.sc[2] * fk * pulse);
      if (p.pop > 0) { p.pop = Math.max(0, p.pop - 0.016); } p.g.position.y = 0.5 + (p.pop > 0 ? Math.sin(p.pop * 6) * 0.08 : 0); }
    for (const b of beds) { b.meter.scale.x = Math.max(0.02, b.water); b.meter.material.color.set(b.water < 0.25 ? '#ec3013' : '#5fe3ff'); b.wheel.rotation.z += b.spin > 0 ? 0.3 : 0; }
    bot.position.copy(s ? s.botAt : V3(0, BOT_Y, 0)); bot.position.y += Math.sin(t2 * 3) * 0.08; rotor.rotation.z += 0.5; eyeM.color.set(s && s.freed ? '#5fe3ff' : (Math.sin(t2 * 13) > 0.85 ? '#5fe3ff' : '#ff3a2a'));
    const sp = s && s.sprayBed >= 0 && Math.hypot(bot.position.x - s.botTo.x, bot.position.z - s.botTo.z) < 0.6; spray.material.color.set(s && s.freed ? '#9ff09f' : '#ff3a2a'); spray.material.opacity = sp ? 0.22 + 0.08 * Math.sin(t2 * 10) : 0; }
  const tapAt = (x, z) => { if (!s || s.done || overlay) return;
    const bd = Math.hypot(s.botAt.x - x, s.botAt.z - z); if (!s.freed && bd < 0.9) { s.freed = true; s.botMode = 'wander'; s.botT = 1; s.sprayBed = -1; sfx(392, 0.3, 0.05, 'sine'); setTimeout(() => sfx(784, 0.4, 0.04, 'sine'), 140); say('DRONE RESET \u00b7 ITS EYE IS BLUE \u00b7 IT HUMS ITS OWN TUNE', 2.6); return; }
    for (const bg of bugs) if (bg.on && Math.hypot(bg.x - x, bg.z - z) < 0.5) { bg.on = false; bg.m.visible = false; s.flicked++; sfx(990, 0.06, 0.04, 'square'); return; }
    for (const b of beds) if (Math.hypot(b.vx - x, b.vz - z) < 0.6) { b.water = 1; b.blight = 0; b.spin = 0.6; sfx(300, 0.3, 0.04, 'sine'); say(b.C.name + ' BED WATERED'); return; }
    let best = null, bd2 = 0.5; for (const p of allP) { const d = Math.hypot(p.x - x, p.z - z); if (d < bd2) { bd2 = d; best = p; } } if (best) pick(best); };
  return {
    title: 'DOME HARVEST', where: 'The Garden \u00b7 Sister Holly', W: 200, H: 140, room: host,
    surface: { c: V3(ox, YS, 0), u: V3(1, 0, 0), v: V3(0, 0, 1), n: V3(0, 1, 0), w: PW, h: PH, maxD: 7.4, maxY: 7.6 },
    stand: { x: ox, z: 6.0, face: Math.PI }, spot: { x: 0, z: 6.0, r: 0.9 },
    begin() { overlay = 'intro'; s = null; root.visible = true; hideProps(); allP.forEach(p => { p.grow = rr(0.2, 0.9); p.rot = false; }); pose(0); },
    end() { root.visible = false; hidden.forEach(o => { o.visible = true; }); hidden = []; s = null; overlay = 'intro'; },
    tick(dt, T, fly) { for (const o of hidden) o.visible = false; if (s && !s.done && !overlay && fly > 0.85) step(dt, T); pose(T); },
    down(gx, gy) { tapAt((gx / 200 - 0.5) * PW, (gy / 140 - 0.5) * PH); }, move() {}, up() {},
    hud() {
      if (overlay === 'intro') return { card: { kicker: 'The Garden \u00b7 Sister Holly', title: 'Dome Harvest', body: 'Tap ripe crops to pick them. Tap a bed\u2019s copper valve when it runs dry. Tap beetles to flick them off. The pollinator drone is glitching: tap it.', buttons: ['YES, PUT ME TO WORK!', 'GOODBYE'] } };
      if (overlay === 'done' && s) return { card: { kicker: 'Kufa Station \u00b7 The Garden', title: s.stars === 3 ? 'Best harvest in months' : s.stars ? 'Harvest in' : 'A thin harvest', mood: s.picked + ' picked \u00b7 ' + (s.stars ? '\u2605'.repeat(s.stars) : 'no stars') + (s.gold ? ' \u00b7 +' + s.gold + ' G' : ''),
        notes: ['Rotted ' + s.rotted + ' \u00b7 beetles flicked ' + s.flicked + ' \u00b7 eaten ' + s.eaten].concat(s.freed ? ['Holly: \u201CThat drone hummed its own tune. First time in months.\u201D'] : ['The drone is still spraying blight. Try tapping it.']).concat(['Best shift: ' + Math.max(s.picked, save.stat('kuHarvestBest', 0)) + ' picked']), buttons: ['ANOTHER SHIFT', 'GOODBYE'] } };
      if (!s) return {};
      const dry = beds.filter(b => b.water < 0.2).map(b => b.C.name + 'S'), ripe = allP.filter(p => p.grow >= 1 && !p.rot).length;
      return { stats: [['Time', String(Math.ceil(s.t)), s.t < 15 ? '#ec3013' : null], ['Picked', String(s.picked)], ['Ripe', String(ripe)], ['Drone', s.freed ? 'FREE' : 'HACKED', s.freed ? '#5fe3ff' : '#ec3013']], showStats: true,
        where: s.flash || (dry.length ? 'DRY: ' + dry.join(' + ') + ' \u00b7 TAP THE VALVE' : ripe ? 'TAP THE GLOWING CROPS TO PICK THEM' : 'GROWING\u2026 WATCH FOR BEETLES') }; },
    cardPick(i) { const b = this.hud().card && this.hud().card.buttons[i]; if (!b || /GOODBYE|LEAVE/.test(b)) return 'leave'; s = fresh(); overlay = null; sfx(523, 0.3, 0.04, 'sine'); },
  };
}
