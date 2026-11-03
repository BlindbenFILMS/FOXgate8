// MERU 2.0 — s119 BURGERS DELUXE PART B, plugged into worlds/meru2-burger-jobs.js (same ctx, OLD frame: hall 70..103.4 × 32..64, back of house 103.4..114 × 40..56,
// back door E (114, 48)). PEEL + CHOP (Sizzle, tap: prep table in the back of house: swipe to peel, tap the dotted lines to chop) · BUS THE TABLES (Bun, walk:
// carry dirty trays to the dish return, 2 at a time) · UNLOAD THE TRUCK (Bun, walk: boxes from the van outside the back door to the cooler / racks / crates / syrup).
// + BUN'S DELIVERY LOOP: now and then Bun takes a TO GO bag out of the back door and comes back ~30 s later.
// The van stands OUTSIDE the old footprint: its collider is returned in yardCols (old frame) for the walk to move (like the armory yard).
export const BG_GAMES_B = [{ k: 'peel', name: 'Peel + Chop', color: '#84cc16', grp: 'siz' }, { k: 'bus', name: 'Bus the Tables', color: '#c42d3c', grp: 'bun', walk: true },
  { k: 'truck', name: 'Unload the Truck', color: '#2e4a6b', grp: 'bun', walk: true }];
export function bgJobsB(C) {
  const { THREE, G, V, box, cyl, LM, CT, kit, own, fly, miss, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, swish, lst, gauge, tagSprite, TAPR, scrW, dist, ptr, hitY, rnd, shuffle, clamp, touch, bun, BUN, TABLES, DSX, J } = C;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', STEEL = '#c9ced3';
  const yardCols = [], colF = (x0, x1, z0, z1) => C.colF(x0, x1, z0, z1);
  const chop = () => { tone(180, 0.07, 0.09, 'square'); noise(0.08, 0.04, 2500); }, thud = () => { tone(110, 0.08, 0.18, 'sine'); noise(0.12, 0.03, 400); }, clink = () => { tone(1320, 0.03, 0.25); tone(1760, 0.02, 0.3, 'sine', 0.05); };
  const fwdOf = P => { const d = J.mv || [0, 1]; return d; };
  // ================= PREP TABLE (back of house, north side of the lane) =================
  const PT = { x: 106.5, z: 44.2, y: 0.92 };
  box(G, 1.8, 0.05, 0.8, '#dfe3e6', PT.x, 0.88, PT.z); for (const sx of [-0.85, 0.85]) for (const sz of [-0.35, 0.35]) cyl(G, 0.025, 0.025, 0.86, STEEL, PT.x + sx, 0.43, PT.z + sz, 6);
  box(G, 1.7, 0.03, 0.7, STEEL, PT.x, 0.22, PT.z); colF(105.6, 107.4, 43.8, 44.6);
  box(G, 0.62, 0.035, 0.42, '#c9a874', PT.x, PT.y, PT.z);   // cutting board
  cyl(G, 0.13, 0.11, 0.2, '#3f6a2c', PT.x - 0.68, 1.0, PT.z, 12);   // peel bucket
  const BIN = new THREE.Group(); BIN.position.set(PT.x + 0.66, 0.91, PT.z); G.add(BIN); box(BIN, 0.34, 0.12, 0.3, STEEL, 0, 0.06, 0); box(BIN, 0.3, 0.02, 0.26, '#7c8288', 0, 0.11, 0);
  const KNIFE = new THREE.Group(); box(KNIFE, 0.004, 0.06, 0.24, '#e8edf2', 0, 0, 0); box(KNIFE, 0.02, 0.03, 0.12, INK, 0, 0.02, 0.18); KNIFE.visible = false; G.add(KNIFE);
  const PEELER = new THREE.Group(); box(PEELER, 0.03, 0.02, 0.12, '#e8edf2', 0, 0, 0); box(PEELER, 0.03, 0.03, 0.1, RED, 0, 0.01, 0.1); PEELER.visible = false; G.add(PEELER);
  const VEG = [{ n: 'ONION', skin: '#b9814a', flesh: '#efe6f0', s: [0.1, 0.09, 0.09], peel: 3, cuts: 4 }, { n: 'POTATO', skin: '#9a6b3c', flesh: '#f3dc8a', s: [0.13, 0.07, 0.08], peel: 4, cuts: 5 },
    { n: 'TOMATO', skin: '#e2342a', flesh: '#f25b45', s: [0.09, 0.085, 0.09], peel: 0, cuts: 4 }, { n: 'LETTUCE', skin: '#3f8a2a', flesh: '#a8d878', s: [0.12, 0.1, 0.12], peel: 2, cuts: 3 },
    { n: 'PICKLE', skin: '#2f6b2a', flesh: '#cfe8a8', s: [0.17, 0.045, 0.045], peel: 0, cuts: 6 }];
  const lineM = new THREE.MeshBasicMaterial({ color: RED, depthTest: false, transparent: true }), cutM = new THREE.MeshBasicMaterial({ color: INK });
  const vegP = () => V(PT.x, PT.y + 0.02 + J.v.s[1], PT.z);
  const G1 = {
    begin() { J.list = shuffle(VEG.slice()).slice(0, 4); J.i = -1; J.slices = []; this.next(); toast('SWIPE TO PEEL \u00b7 TAP THE RED LINES TO CHOP', 2.8); },
    next() { if (J.vm) { J.vm.parent && J.vm.parent.remove(J.vm); J.vm = null; } (J.lines || []).forEach(l => l.m.parent && l.m.parent.remove(l.m)); J.i++; if (J.i >= J.list.length) { finishGame(); return; }
      const v = J.v = J.list[J.i]; const m = own(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), new THREE.MeshLambertMaterial({ color: v.skin }))); m.scale.set(...v.s); m.position.copy(vegP()); J.vm = m;
      if (v.n === 'LETTUCE') for (let k = 0; k < 5; k++) { const lf = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), LM('#5aa83a')); lf.scale.set(0.55, 0.35, 0.55); const a = k / 5 * 6.28; lf.position.set(Math.sin(a) * 0.55, 0.3, Math.cos(a) * 0.55); m.add(lf); }
      J.peeled = 0; J.acc = 0; J.ph = v.peel ? 'peel' : 'chop'; J.lines = []; J.t0 = J.t; J.over = false; if (J.ph === 'chop') this.showLines(); },
    showLines() { const v = J.v; for (let i = 1; i <= v.cuts; i++) { const lx = -v.s[0] * 0.85 + 1.7 * v.s[0] * i / (v.cuts + 1); const l = own(new THREE.Mesh(new THREE.BoxGeometry(0.006, v.s[1] * 2.5, v.s[2] * 2.5), lineM)); l.renderOrder = 7; l.position.set(PT.x + lx, vegP().y, PT.z); J.lines.push({ m: l, lx, cut: false }); } },
    press() { J.lx = ptr.x; J.ly = ptr.y; if (J.ph !== 'chop') return; let best = null, bd = TAPR() * 1.5; for (const l of J.lines) { if (l.cut) continue; const d = dist(scrW(l.m.position)); if (d < bd) { bd = d; best = l; } }
      if (!best) { if (dist(scrW(vegP())) < TAPR() * 3) miss('CHOP ON THE RED LINES', 1.2); return; }
      best.cut = true; best.m.material = cutM; best.m.renderOrder = 0; best.m.scale.set(1, 0.9, 0.9); chop(); addGold(1); KNIFE.visible = true; KNIFE.position.set(best.m.position.x, vegP().y + 0.16, PT.z); J.knT = 0.18;
      if (J.lines.every(l => l.cut)) this.served(); },
    drag() { const h = hitY(PT.y + 0.06); if (J.ph === 'peel') { if (h) { PEELER.visible = true; PEELER.position.set(clamp(h.x, PT.x - 0.4, PT.x + 0.4), PT.y + 0.12, clamp(h.z, PT.z - 0.25, PT.z + 0.25)); }
        if (!ptr.down) return; const step = Math.hypot(ptr.x - (J.lx ?? ptr.x), ptr.y - (J.ly ?? ptr.y)); J.lx = ptr.x; J.ly = ptr.y; if (dist(scrW(vegP())) > TAPR() * 2.4) return; J.acc += step; if (Math.random() < 0.2) noise(0.05, 0.015, 3500);
        if (J.acc > TAPR() * 3.2) { J.acc = 0; this.strip(); } } },
    strip() { const v = J.v; J.peeled++; swish(); const s = own(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.006, 0.03), LM(v.skin))); s.position.copy(vegP()).add(V(rnd(-0.05, 0.05), v.s[1], 0)); fly(s, V(PT.x - 0.68, 1.12, PT.z), 0.4, 0.18, () => { s.visible = false; });
      J.vm.material.color.set(v.skin).lerp(new THREE.Color(v.flesh), J.peeled / v.peel); if (v.n === 'LETTUCE') { const lf = J.vm.children.filter(c => c.visible); lf.slice(0, Math.ceil(lf.length / (v.peel - J.peeled + 1))).forEach(c => { c.visible = false; }); }
      if (J.peeled >= v.peel) { pop(); J.ph = 'chop'; PEELER.visible = false; this.showLines(); toast(v.n + ' PEELED \u00b7 NOW CHOP', 1.2); } },
    served() { const v = J.v; J.ph = 'done'; ding(); addGold(J.t - J.t0 < 12 ? 4 : 2); J.vm.visible = false; J.lines.forEach(l => { l.m.visible = false; });
      for (let i = 0; i <= v.cuts; i++) { const r = Math.min(v.s[1], v.s[2]) * (0.6 + 0.4 * Math.sin(Math.PI * (i + 0.5) / (v.cuts + 1))); const sl = own(new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.014, 12), LM(v.flesh))); sl.rotation.z = Math.PI / 2;
        sl.position.set(PT.x - v.s[0] * 0.85 + 1.7 * v.s[0] * (i + 0.5) / (v.cuts + 1), vegP().y, PT.z); const to = V(BIN.position.x + rnd(-0.1, 0.1), 1.04 + J.slices.length * 0.004, PT.z + rnd(-0.08, 0.08)); J.slices.push(sl); setTimeout(() => { if (J.g === 'peel') fly(sl, to, 0.35, 0.15, () => { sl.rotation.set(0, 0, 0); }); }, 120 + i * 60); }
      NEXT(() => G1.next(), 1.1); },
    tick(dt) { if (J.knT > 0) { J.knT -= dt; KNIFE.position.y -= dt * 0.6; if (J.knT <= 0) KNIFE.visible = false; }
      if (J.ph !== 'done' && !J.over && J.t - J.t0 > 25) { J.over = true; miss('TOO SLOW \u00b7 SIZZLE TAKES THAT ONE'); J.ph = 'done'; NEXT(() => G1.next(), 1.0); } },
    card() { const v = J.v; if (!v) return null; const left = J.ph === 'peel' ? v.peel - J.peeled : J.lines.filter(l => !l.cut).length;
      return [J.ph === 'peel' ? 'SWIPE TO PEEL \u00b7 ' + left : J.ph === 'chop' ? 'TAP THE LINES \u00b7 ' + left : 'IN THE BIN', lst(J.list.map((q, i) => [q.flesh, q.n, i === J.i ? (J.ph === 'peel' ? 'PEEL' : 'CHOP') : '', i < J.i || (i === J.i && J.ph === 'done')])) + gauge(J.i / J.list.length), J.i + J.ph + left]; },
    hint() { if (J.ph === 'peel') return [vegP(), 'SWIPE']; const l = J.lines && J.lines.find(q => !q.cut); return J.ph === 'chop' && l ? [l.m.position, 'TAP'] : null; },
    shot() { return [V(PT.x, PT.y + 0.05, PT.z), 1.2, 0.7, 0.85, 1.0, 0, 2.0]; },
    end() { KNIFE.visible = false; PEELER.visible = false; } };
  // ================= BUS THE TABLES (Bun, walk) =================
  const RET = [101.9, 55.0];
  const mkTray = () => { const g = new THREE.Group(); box(g, 0.5, 0.025, 0.36, '#c42d3c', 0, 0.012, 0); cyl(g, 0.12, 0.1, 0.02, WHITE, -0.1, 0.035, 0, 14); cyl(g, 0.05, 0.04, 0.12, RED, 0.14, 0.08, -0.06, 10);
    box(g, 0.08, 0.04, 0.06, '#e6b45a', -0.1, 0.06, 0.02); box(g, 0.06, 0.05, 0.05, WHITE, 0.12, 0.05, 0.1); return g; };
  const G2 = {
    begin() { J.trays = shuffle(TABLES.slice()).slice(0, 5).map(([x, z]) => { const m = own(mkTray()); m.position.set(x + rnd(-0.2, 0.2), 0.8, z + rnd(-0.15, 0.15)); m.rotation.y = rnd(-0.5, 0.5); const tg = own(tagSprite('TRAY', '#fca5a5', INK, 0.4)); tg.position.set(x, 1.6, z); return { m, tg, x, z, st: 'table' }; });
      J.held = []; J.left = J.trays.length; toast('DIRTY TRAYS \u00b7 CARRY 2 AT A TIME TO THE DISH RETURN', 2.8); },
    nearT(P) { let b = null, bd = 1.9; for (const t of J.trays) { if (t.st !== 'table') continue; const d = Math.hypot(P.x - t.x, P.z - t.z); if (d < bd) { bd = d; b = t; } } return b; },
    atRet: P => Math.hypot(P.x - RET[0], P.z - RET[1]) < 1.8,
    prompt(P) { if (J.held.length && this.atRet(P)) return 'DROP THE TRAYS \u00b7 ' + J.held.length; const t = this.nearT(P); if (t) return J.held.length >= 2 ? 'HANDS FULL \u00b7 DISH RETURN' : 'PICK UP THE TRAY'; return null; },
    talk(P) { if (J.held.length && this.atRet(P)) { const n = J.held.length; J.held.forEach((t, i) => { t.st = 'done'; fly(t.m, V(DSX, 1.0 + i * 0.06, 54.2 + i * 0.3), 0.35, 0.2, () => { t.m.visible = false; }); }); J.held = []; J.left -= n; clink(); addGold(3 * n);
        toast(J.left ? 'IN THE SINK \u00b7 ' + J.left + ' TO GO' : 'ALL TABLES CLEAR', 1.4); if (!J.left) { ding(); NEXT(() => finishGame(), 0.7); } return true; }
      const t = this.nearT(P); if (!t) return false; if (J.held.length >= 2) { toast('HANDS FULL \u00b7 TAKE THEM TO THE DISH RETURN', 1.4); return true; }
      t.st = 'held'; t.tg.visible = false; J.held.push(t); pop(); addGold(1); return true; },
    tick(dt) { const P = J.P; if (!P) return; if (J.t > 80 + J.miss * 15) miss('CUSTOMERS ARE WAITING FOR TABLES', 1.6);
      if (J.pp) { const dx = P.x - J.pp[0], dz = P.z - J.pp[1], d = Math.hypot(dx, dz); if (d > 0.02) J.mv = [dx / d, dz / d]; } J.pp = [P.x, P.z]; const f = fwdOf(P);
      J.held.forEach((t, i) => { t.m.position.set(P.x + f[0] * 0.4, (P.y || 0) + 1.0 + i * 0.09, P.z + f[1] * 0.4); t.m.rotation.y = Math.atan2(f[0], f[1]); }); },
    goal() { const P = J.P; if (!P) return null; if (J.held.length >= 2 || (J.held.length && !J.trays.some(t => t.st === 'table'))) return [RET[0], RET[1], 0];
      let b = null, bd = 1e9; for (const t of J.trays) { if (t.st !== 'table') continue; const d = Math.hypot(P.x - t.x, P.z - t.z); if (d < bd) { bd = d; b = t; } } return b ? [b.x, b.z, 0.8] : null; },
    card() { return [J.held.length >= 2 ? 'TO THE DISH RETURN \u00b7 E' : 'WALK UP \u00b7 E AT A TRAY', lst(J.trays.map(t => ['#c42d3c', 'TRAY', t.st === 'held' ? 'CARRYING' : '', t.st === 'done'])), J.left + '_' + J.held.length]; },
    end() {} };
  // ================= THE VAN (outside the back door, north of the apron) + UNLOAD THE TRUCK (Bun, walk) =================
  const VAN = new THREE.Group(); VAN.position.set(115.8, 0, 40.7); G.add(VAN);
  box(VAN, 2.1, 1.9, 3.6, WHITE, 0, 1.25, 0.9); box(VAN, 2.12, 0.28, 3.62, RED, 0, 0.75, 0.9); box(VAN, 2.0, 1.3, 1.4, WHITE, 0, 1.0, -1.6); box(VAN, 1.9, 0.6, 0.05, '#7cc4ff', 0, 1.35, -2.31); box(VAN, 2.04, 0.2, 1.42, RED, 0, 0.75, -1.6);
  for (const sx of [-1.02, 1.02]) for (const sz of [-1.6, 1.8]) { const w = cyl(VAN, 0.36, 0.36, 0.26, INK, sx, 0.36, sz, 14); w.rotation.z = Math.PI / 2; }
  { const t = CT(512, 160, (g, W, H) => { g.fillStyle = WHITE; g.fillRect(0, 0, W, H); g.fillStyle = RED; g.font = '900 86px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('BURGERS', 20, 62); g.fillStyle = INK; g.font = '800 34px Archivo, sans-serif'; g.fillText('FRESH TO MERU \u00b7 DAILY', 22, 128); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.8), new THREE.MeshBasicMaterial({ map: t })); m.position.set(1.06, 1.55, 0.9); m.rotation.y = Math.PI / 2; VAN.add(m); }
  const DOORS = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 1.04, 0, 2.71); VAN.add(p); box(p, 1.02, 1.8, 0.05, '#e6e3dc', -s * 0.51, 1.25, 0); box(p, 0.06, 0.2, 0.06, INK, -s * 0.92, 1.2, 0.05); p.userData.s = s; return p; });
  const CRATES = []; for (let i = 0; i < 6; i++) CRATES.push(box(VAN, 0.5, 0.36, 0.42, '#c9a874', -0.5 + (i % 3) * 0.5, 0.58 + (i / 3 | 0) * 0.38, 2.2));
  yardCols.push({ f: [114.7, 116.9, 38.0, 43.45] });
  const KINDS = { BUNS: { c: '#e6b45a', at: [105.2, 53.7], to: 'DRY RACK', y: 1.1 }, PATTIES: { c: '#ec3013', at: [109.4, 47.1], to: 'THE COOLER', y: 1.1 }, VEG: { c: '#84cc16', at: [105.7, 42.5], to: 'PRODUCE CRATES', y: 0.5 }, SYRUP: { c: '#2e4a6b', at: [104.45, 44.5], to: 'SYRUP STACK', y: 1.0 } };
  const PICK = [115.8, 44.2], inYard = P => P.x > 113.6 && P.x < 121 && P.z > 36 && P.z < 52;
  const mkCrate = k => { const g = new THREE.Group(); box(g, 0.5, 0.36, 0.42, '#c9a874', 0, 0, 0); box(g, 0.52, 0.1, 0.44, KINDS[k].c, 0, 0.06, 0); return g; };
  const G3 = {
    begin() { const ks = Object.keys(KINDS); J.boxes = shuffle([...ks, ...shuffle(ks.slice()).slice(0, 2)]).map(k => ({ k, st: 'van' })); J.left = J.boxes.length; J.hold = null; J.open = 0;
      J.spotTags = Object.entries(KINDS).map(([k, q]) => { const t = own(tagSprite(k, q.c, k === 'BUNS' || k === 'VEG' ? INK : WHITE, 0.44)); t.position.set(q.at[0], 1.9, q.at[1]); return t; });
      CRATES.forEach(c => { c.visible = true; }); toast('THE VAN IS IN \u00b7 OUT THE BACK DOOR', 2.6); },
    nearVan: P => Math.hypot(P.x - PICK[0], P.z - PICK[1]) < 1.5,
    nearSpot(P) { for (const k in KINDS) { const q = KINDS[k]; if (Math.hypot(P.x - q.at[0], P.z - q.at[1]) < 1.35) return k; } return null; },
    prompt(P) { if (J.hold) { const s = this.nearSpot(P); return s ? 'PUT DOWN \u00b7 ' + J.hold.k : null; } return this.nearVan(P) && J.boxes.some(b => b.st === 'van') ? 'TAKE A BOX' : null; },
    talk(P) { if (J.hold) { const s = this.nearSpot(P); if (!s) return false; const b = J.hold, q = KINDS[b.k];
        if (s !== b.k) { miss(b.k + ' GO TO ' + q.to, 1.6); return true; } J.hold = null; b.st = 'done'; thud(); addGold(4); J.left--; fly(b.m, V(q.at[0] + rnd(-0.3, 0.3), q.y, q.at[1] + (q.at[1] > 50 ? 0.6 : -0.5)), 0.3, 0.2, () => { b.m.visible = false; });
        toast(J.left ? b.k + ' AWAY \u00b7 ' + J.left + ' TO GO' : 'VAN EMPTY', 1.3); if (!J.left) { ding(); NEXT(() => finishGame(), 0.7); } return true; }
      if (!this.nearVan(P)) return false; const b = J.boxes.find(q => q.st === 'van'); if (!b) return false; b.st = 'held'; J.hold = b; b.m = own(mkCrate(b.k)); { const tg = tagSprite(b.k, KINDS[b.k].c, b.k === 'BUNS' || b.k === 'VEG' ? INK : WHITE, 0.36); tg.position.set(0, 0.45, 0); b.m.add(tg); }
      const vis = CRATES.filter(c => c.visible); if (vis.length) vis[vis.length - 1].visible = false; pop(); toast(b.k + ' \u00b7 TO ' + KINDS[b.k].to, 1.4); return true; },
    tick(dt) { const P = J.P; if (!P) return; if (J.t > 90 + J.miss * 15) miss('SIZZLE NEEDS THOSE BOXES', 1.6); J.open = Math.min(1, J.open + dt * 1.5); DOORS.forEach(d => { d.rotation.y = d.userData.s * J.open * 1.9; });
      if (J.pp) { const dx = P.x - J.pp[0], dz = P.z - J.pp[1], d = Math.hypot(dx, dz); if (d > 0.02) J.mv = [dx / d, dz / d]; } J.pp = [P.x, P.z]; const f = fwdOf(P);
      if (J.hold) { J.hold.m.position.set(P.x + f[0] * 0.42, (P.y || 0) + 0.95, P.z + f[1] * 0.42); J.hold.m.rotation.y = Math.atan2(f[0], f[1]); } },
    goal() { if (J.hold) { const q = KINDS[J.hold.k]; return [q.at[0], q.at[1], 0]; } return J.boxes.some(b => b.st === 'van') ? [PICK[0], PICK[1], 0] : null; },
    card() { return [J.hold ? J.hold.k + ' \u2192 ' + KINDS[J.hold.k].to : 'AT THE VAN \u00b7 E', lst(J.boxes.map(b => [KINDS[b.k].c, b.k, b.st === 'held' ? 'CARRYING' : '', b.st === 'done'])), J.left + '_' + (J.hold ? J.hold.k : '')]; },
    end() { DOORS.forEach(d => { d.rotation.y = 0; }); CRATES.forEach(c => { c.visible = true; }); } };
  // ================= BUN'S DELIVERY LOOP =================
  const BAG = new THREE.Group(); box(BAG, 0.22, 0.28, 0.14, '#fbfbf7', 0, 0, 0); box(BAG, 0.16, 0.08, 0.005, RED, 0, 0.02, 0.072); box(BAG, 0.14, 0.03, 0.005, '#e6b45a', 0, 0.06, 0.072); BAG.position.set(0.3, 0.62, 0.1); BAG.visible = false; bun.add(BAG);
  const ROUTE = [[BUN.x, BUN.z], [102.6, 48], [113.6, 48], [115.6, 48.3], [119.5, 48.6]];
  const D = { st: 'home', wait: rnd(40, 70), i: 0, away: 0 };
  function bunTick(dt, P, blockLeave) { const near = P && Math.hypot(P.x - bun.position.x, P.z - bun.position.z) < 4;
    if (D.st === 'home') { D.wait -= dt; if (D.wait <= 0 && !blockLeave && !near) { D.st = 'out'; D.i = 1; BAG.visible = true; } return false; }
    if (D.st === 'away') { D.away -= dt; if (D.away <= 0) { D.st = 'back'; D.i = ROUTE.length - 2; bun.visible = true; BAG.visible = false; } return true; }
    const tgt = ROUTE[D.i], dx = tgt[0] - bun.position.x, dz = tgt[1] - bun.position.z, d = Math.hypot(dx, dz), sp = 1.7;
    if (d < 0.08) { if (D.st === 'out') { D.i++; if (D.i >= ROUTE.length) { D.st = 'away'; D.away = rnd(25, 35); bun.visible = false; } }
      else { D.i--; if (D.i < 0) { D.st = 'home'; D.wait = rnd(80, 120); bun.position.set(BUN.x, 0, BUN.z); } } return true; }
    const k = Math.min(1, sp * dt / d); bun.position.x += dx * k; bun.position.z += dz * k; const a = Math.atan2(dx, dz); let r = a - bun.rotation.y; r = Math.atan2(Math.sin(r), Math.cos(r)); bun.rotation.y += r * Math.min(1, dt * 8);
    kit.animFox(bun, dt, sp, false); return true; }
  return { GAMES: BG_GAMES_B, GD: { peel: G1, bus: G2, truck: G3 }, RINGS: { peel: [106.5, 45.35], bus: [99.8, 52.6], truck: [112.4, 47.2] },
    tips: ['Peel toward the bucket, never toward your paws.', 'Two trays at a time. Three is how plates break.', 'Patties go cold first. Cooler before anything else.'],
    yardCols, inYard, bunTick, bunHome: () => D.st === 'home', bunState: () => D.st, sendBun: () => { if (D.st === 'home') D.wait = 0; }, VAN };
}
