// MERU 2.0 — s99 CASTLE DELUXE PART B: 4 keep jobs (treasury: COUNT THE GOLD · GUARD THE VAULT; council: SERVE THE KING'S DINNER; hall: SIT FOR THE PORTRAIT)
// + 4 courtyard jobs (FEED + GROOM THE HORSES · DRAW WATER · WORK THE PORTCULLIS · BANNERS + FLAGS). All run by Steward Barnaby, framework = meru2-castle-jobs.js.
// Keep jobs live in G (x / z world, y above the keep floor); yard jobs in GY (x / z world, y above the courtyard flagstones).
export const GAMES_B = [
  { k: 'gold', name: 'Count the Gold', color: '#e6b45a', by: 's', grp: 'y', room: 'treasury' }, { k: 'vault', name: 'Guard the Vault', color: '#52525b', by: 's', grp: 'y', room: 'treasury' },
  { k: 'dinner', name: 'Serve the King\u2019s Dinner', color: '#8a4a1e', by: 's', grp: 'h', room: 'council' }, { k: 'portrait', name: 'Sit for the Portrait', color: '#a8323e', by: 's', grp: 'h', room: 'hall', fox: true },
  { k: 'horses', name: 'Feed + Groom the Horses', color: '#8a6a42', by: 's', grp: 'y', room: 'yard', yard: true }, { k: 'well', name: 'Draw Water', color: '#2a6a9a', by: 's', grp: 'y', room: 'yard', yard: true },
  { k: 'gate', name: 'Work the Portcullis', color: '#3d3b3a', by: 's', grp: 'y', room: 'yard', yard: true }, { k: 'flags', name: 'Banners + Flags', color: '#a8323e', by: 's', grp: 'y', room: 'yard', yard: true }];
export const RINGS_B = { gold: [13.8, 9.6], vault: [12.6, 12.4], dinner: [12.4, -3.6], portrait: [3.4, -6.0] };
export const YRINGS_B = { horses: [-245.9, -420.2], well: [-240, -437.6], gate: [-230.2, -435.6], flags: [-236, -433.4] };
export function castleJobsB(X) {
  const { THREE, G, GY, kit, V, box, cyl, LM, CT, IX, IZ, IY, OY, C, cols, colB, colR, tone, noise, ding, pop, thud, rub, trumpet, lab, lst, gauge, TAPR, dist, scrW, own, fly, walkTo, tagSprite, tagFor, nameTag, addGold, miss, NEXT, toast, finish, save, ptr, keyS, hitPl, king, clamp, rnd, blotT, INK, YEL, GOLD, WOOD, DARK, IRON, RED } = X;
  const W = (lx, y, lz) => V(IX + lx, y, IZ + lz), oy = (n, a) => cols.push({ ...n, y0: OY - 3, y1: OY + (a || 6) });
  const GZ = C.gate[1], GX = C.r[1] - 2;
  const spotM = () => new THREE.MeshBasicMaterial({ map: blotT, color: '#4a3220', transparent: true, opacity: 0.85, depthWrite: false });
  // ================= COUNT THE GOLD (treasury; hold to slide coins, let go at exactly 10) =================
  const TB = W(13.8, 0, 8.0);
  { box(G, 2.0, 0.06, 0.8, WOOD, TB.x, 0.8, TB.z); for (const a of [-0.9, 0.9]) for (const b of [-0.32, 0.32]) box(G, 0.07, 0.78, 0.07, DARK, TB.x + a, 0.39, TB.z + b); colB(12.75, 14.85, 7.55, 8.45);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), LM(GOLD)); h.scale.y = 0.45; h.position.set(IX + 13.15, 0.83, TB.z); G.add(h); }
  const coinG = new THREE.CylinderGeometry(0.07, 0.07, 0.014, 12), coinM = LM('#f0c060'), STX = i => IX + 13.62 + i * 0.21;
  const gold = {
    begin(P, J) { J.s = 0; J.n = 0; J.coins = []; J.hold = false; toast('HOLD TO SLIDE COINS \u00b7 LET GO AT EXACTLY 10', 3); },
    press(J) { if (J.flies.length) return; J.hold = true; J.ht = 0; J.acc = 0.7; },
    release(J) { if (!J.hold) return; J.hold = false; if (J.n === 10) { tone(1800, 0.05, 0.4, 'triangle'); addGold(3); J.s++; J.n = 0; J.coins = []; if (J.s >= 6) { ding(); toast('SIXTY GOLD COUNTED', 1.4); NEXT(finish, 0.9); } else toast('TEN \u00b7 NEXT STACK', 0.9); } else if (J.n > 0) toast(J.n + ' \u00b7 KEEP GOING', 0.8); },
    coin(J) { const c = own(new THREE.Mesh(coinG, coinM)); c.position.set(STX(J.s), 0.84 + J.n * 0.014, TB.z); J.coins.push(c); J.n++; tone(2200 + J.n * 50, 0.025, 0.08, 'triangle');
      if (J.n > 10) { J.hold = false; noise(0.3, 0.05, 2500); miss('ELEVEN! THE STACK TOPPLES \u00b7 START IT AGAIN', 1.6); J.coins.forEach((q, i) => fly(q, V(TB.x - 0.62 + rnd(-0.08, 0.08), 0.86, TB.z + rnd(-0.12, 0.12)), 0.3 + i * 0.02, 0.15, () => { q.visible = false; })); J.coins = []; J.n = 0; } },
    tick(dt, J) { if (!J.hold) return; J.ht += dt; J.acc += dt * (2.2 + J.ht * 2.6); while (J.acc >= 1 && J.hold) { J.acc -= 1; this.coin(J); } },
    card(J) { return [J.hold ? 'LET GO AT 10' : 'HOLD TO SLIDE COINS', lab('STACK ' + Math.min(6, J.s + 1) + ' / 6') + '<div style="font-weight:900;font-size:40px;line-height:1;margin-top:4px;color:' + (J.n === 10 ? '#2f7a4a' : '#201e1d') + '">' + J.n + '<span style="font-size:16px"> / 10</span></div>', 'g' + J.s + '_' + J.n + (J.hold ? 'h' : '')]; },
    hint(J) { return J.hold ? null : [V(IX + 13.15, 0.9, TB.z), 'HOLD']; },
    shot() { return [V(IX + 14.0, 0.86, TB.z), 2.4, 0.9, 0.55, 1.6, 0, 2.6]; },
    end() {} };
  // ================= GUARD THE VAULT (treasury; one clerk pockets a coin, tap him) =================
  const CLK = [[18.4, 6.4, 20.2, 5.8], [19.0, 13.2, 20.6, 14.2], [20.0, 10.9, 21.2, 10.5], [15.0, 14.0, 15.0, 15.2]];
  const CLT = [['#5a5560', '#3d3a42', '#201e1d'], ['#6b4a32', '#4a3424', '#2a1c12'], ['#3a4a5a', '#2a3540', '#151c22'], ['#5a4a3a', '#3d3226', '#1f1912']];
  let clerks = null; const getClerks = () => clerks || (clerks = CLK.map((c, i) => { const f = kit.makeFox({ key: 'casClerk' + i, torso: CLT[i], crest: 'M', outfit: 'vest', gear: 'none', mood: 'stern' }); f.visible = false; G.add(f); return { f, c }; }));
  const glint = new THREE.Mesh(new THREE.OctahedronGeometry(0.07), new THREE.MeshBasicMaterial({ color: '#ffe680' })); glint.visible = false; G.add(glint);
  const vault = {
    begin(P, J) { getClerks().forEach(({ f, c }) => { f.position.copy(W(c[0], 0, c[1])); f.rotation.y = Math.atan2(c[2] - c[0], c[3] - c[1]); f.userData.ry0 = f.rotation.y; f.visible = true; }); J.r = 0; this.round(J); toast('WATCH THE HANDS \u00b7 TAP THE CLERK WHO POCKETS A COIN', 3); },
    round(J) { J.th = Math.random() * 4 | 0; J.t0 = J.t + rnd(1.8, 4.2); J.dec = [0, 1, 2, 3].filter(i => i !== J.th).map(i => ({ i, t: J.t + rnd(0.6, 5) })); J.caught = false; getClerks().forEach(({ f }) => { f.rotation.y = f.userData.ry0; }); },
    arms(J, dt) { let g = false; getClerks().forEach(({ f }, i) => { kit.animFox(f, dt, 0, false); const A = f.userData.P && f.userData.P.arms; if (!A) return; let ax = -0.6 + Math.sin(J.t * 3 + i) * 0.15, az = 0;
        if (J.dec.some(q => q.i === i && J.t > q.t && J.t < q.t + 0.9)) { ax = -2.4; az = 0.3; }
        if (i === J.th && !J.caught && J.t > J.t0 && J.t < J.t0 + 0.9) { const k = (J.t - J.t0) / 0.9; ax = k < 0.5 ? -1.3 : 0.4; az = k < 0.5 ? 0 : 0.5; g = true; const hp = A[0].getWorldPosition(V()); glint.position.set(hp.x, hp.y - IY - 0.35, hp.z); glint.rotation.y += dt * 9; }
        A[0].rotation.x = ax; A[0].rotation.z = az; }); glint.visible = g; },
    tick(dt, J) { this.arms(J, dt); if (!J.caught && J.t > J.t0 + 6.5) { miss('HE GOT AWAY \u00b7 WATCH CLOSER', 1.6); J.r++; if (J.r >= 4) NEXT(finish, 0.8); else this.round(J); } },
    press(J) { let best = -1, bd = TAPR() * 1.5; getClerks().forEach(({ f }, i) => { const d = dist(scrW(V(f.position.x, 1.0, f.position.z))); if (d < bd) { bd = d; best = i; } }); if (best < 0 || J.caught) return;
      if (J.t < J.t0) { miss('NOTHING YET \u00b7 WATCH THE HANDS', 1.3); return; } if (best !== J.th) { miss('HIS HANDS ARE CLEAN', 1.3); return; }
      J.caught = true; ding(); addGold(5); toast('CAUGHT! THE COIN GOES BACK', 1.4); const f = clerks[best].f; f.rotation.y += Math.PI; J.r++; if (J.r >= 4) NEXT(finish, 1.0); else NEXT(() => vault.round(J), 1.2); },
    card(J) { const w = J.t < J.t0; return [w ? 'WATCH THE HANDS' : 'WHO TOOK IT?', lab('ROUND ' + Math.min(4, J.r + 1) + ' / 4') + lab('A FLASH OF GOLD = A POCKETED COIN'), 'v' + J.r + (w ? 'a' : 'b')]; },
    hint(J) { if (J.t < J.t0 || J.caught) return null; const f = clerks[J.th].f; return [V(f.position.x, 1.0, f.position.z), 'TAP']; },
    shot() { return [W(18, 1.0, 10.3), 6.8, 2.4, 0.3, 4, -Math.PI / 2, 6.5]; },
    end() { (clerks || []).forEach(({ f }) => { f.visible = false; }); glint.visible = false; } };
  // ================= SERVE THE KING'S DINNER (council room; tap a dish, tap the diner who asked for it, 2 courses) =================
  const DISH = [['SOUP', '#d8782a'], ['ROAST', '#7a4a28'], ['PIE', '#c8962a'], ['FRUIT', '#c8321e']];
  { const s = W(11.6, 0, -7); box(G, 0.6, 0.85, 2.4, DARK, s.x, 0.425, s.z); box(G, 0.66, 0.05, 2.46, WOOD, s.x, 0.87, s.z); colB(11.25, 11.95, -8.25, -5.75); }
  const dishMesh = k => { const g = new THREE.Group(); cyl(g, 0.16, 0.12, 0.08, '#f3efe2', 0, 0.04, 0, 14); if (k === 0) cyl(g, 0.13, 0.13, 0.02, DISH[0][1], 0, 0.08, 0, 12);
    if (k === 1) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), LM(DISH[1][1])); m.scale.set(1.2, 0.6, 0.9); m.position.y = 0.12; g.add(m); } if (k === 2) cyl(g, 0.14, 0.15, 0.06, DISH[2][1], 0, 0.11, 0, 14);
    if (k === 3) for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), LM(i % 2 ? '#2f9a4a' : DISH[3][1])); m.position.set(Math.cos(i * 1.6) * 0.06, 0.12, Math.sin(i * 1.6) * 0.06); g.add(m); } return g; };
  const SBD = DISH.map((_, k) => { const g = dishMesh(k); g.position.copy(W(11.6, 0.9, -7.9 + k * 0.6)); G.add(g); return g; });
  const DIN = [{ n: 'KING MIGHT', king: true, at: [27.3, -7], ry: -Math.PI / 2, pl: [25.1, -7] }, { n: 'LADY ROSE', at: [18, -9.75], ry: 0, pl: [18, -8.12], torso: ['#a8323e', '#e6b45a', '#3a0d12'], outfit: 'dress' },
    { n: 'SIR HUGO', at: [22, -9.75], ry: 0, pl: [22, -8.12], torso: ['#2f4a6a', '#c0c4cc', '#151c22'], outfit: 'coat' }, { n: 'LORD OAK', at: [20, -4.25], ry: Math.PI, pl: [20, -5.88], torso: ['#2f7a4a', '#e6b45a', '#1e3a26'], outfit: 'coat' }];
  const dF = {}, dinFox = i => dF[i] || (dF[i] = (() => { const d = DIN[i], f = kit.makeFox({ key: 'casDiner' + i, torso: d.torso, crest: 'M', outfit: d.outfit, gear: 'none', mood: 'happy' }); f.visible = false; G.add(f); return f; })());
  const dinner = {
    begin(P, J) { J.f = DIN.map((d, i) => { if (d.king) { if (king) { J.k0 = { p: king.position.clone(), ry: king.rotation.y }; king.position.set(IX + d.at[0], IY, IZ + d.at[1]); king.rotation.y = d.ry; } return king; } const f = dinFox(i); f.position.copy(W(d.at[0], 0, d.at[1])); f.rotation.y = d.ry; f.visible = true; return f; });
      J.c = 0; J.sel = -1; J.plated = []; this.course(J); toast('TAP A DISH \u00b7 THEN THE DINER WHO WANTS IT', 3); },
    course(J) { (J.bub || []).forEach(b => { b.visible = false; }); J.plated.forEach(m => { m.visible = false; }); J.plated = []; J.want = DIN.map(() => Math.random() * 4 | 0); J.served = DIN.map(() => false);
      J.bub = DIN.map((d, i) => { const s = own(nameTag(DISH[J.want[i]][0], DISH[J.want[i]][1], '#ffffff', 0.7)); s.position.copy(W(d.at[0], 2.35, d.at[1])); return s; }); },
    press(J) { if (J.flies.length) return; let bd = TAPR() * 1.2, bk = -1; SBD.forEach((g, k) => { const d = dist(scrW(g.position)); if (d < bd) { bd = d; bk = k; } });
      let dd = TAPR() * 1.6, bi = -1; DIN.forEach((d, i) => { if (J.served[i]) return; const q = Math.min(dist(scrW(W(d.at[0], 1.3, d.at[1]))), dist(scrW(W(d.pl[0], 0.9, d.pl[1]))), dist(scrW(J.bub[i].position))); if (q < dd) { dd = q; bi = i; } });
      if (bk >= 0 && (bi < 0 || bd < dd || J.sel < 0)) { if (J.sel >= 0) SBD[J.sel].position.y = 0.9; J.sel = bk; SBD[bk].position.y = 1.02; pop(); return; }
      if (bi < 0) return; if (J.sel < 0) { toast('PICK A DISH FIRST', 1.0); return; } if (J.want[bi] !== J.sel) { miss(DIN[bi].n + ' ASKED FOR ' + DISH[J.want[bi]][0], 1.5); return; }
      const k = J.sel; SBD[k].position.y = 0.9; J.sel = -1; J.served[bi] = true; J.bub[bi].visible = false; const m = own(dishMesh(k)); m.position.copy(SBD[k].position); J.plated.push(m);
      fly(m, W(DIN[bi].pl[0], 0.88, DIN[bi].pl[1]), 0.55, 0.5, () => { tone(900, 0.04, 0.2, 'triangle'); addGold(2); if (!J.served.every(Boolean)) return; J.c++;
        if (J.c >= 2) { ding(); toast('THE KING: A SPLENDID SUPPER!', 1.8); NEXT(finish, 1.2); } else { pop(); toast('SECOND COURSE', 1.2); NEXT(() => dinner.course(J), 0.9); } }); },
    tick(dt, J) { J.f.forEach((f, i) => { if (f && !DIN[i].king) kit.animFox(f, dt, 0, false); }); },
    card(J) { return [J.sel >= 0 ? 'WHO WANTS ' + DISH[J.sel][0] + '?' : 'TAP A DISH', lab('COURSE ' + Math.min(2, J.c + 1) + ' / 2') + lst(DIN.map((d, i) => [DISH[J.want[i]][1], d.n, J.served[i] ? '\u2713' : DISH[J.want[i]][0], J.served[i]])), 'd' + J.c + '_' + J.sel + '_' + J.served.join('')]; },
    hint(J) { if (J.sel < 0) { const i = J.served.findIndex(q => !q); return i >= 0 ? [SBD[J.want[i]].position.clone(), 'TAP'] : null; } const i = DIN.findIndex((d, q) => !J.served[q] && J.want[q] === J.sel); return i >= 0 ? [W(DIN[i].pl[0], 0.9, DIN[i].pl[1]), 'TAP'] : null; },
    shot() { return [W(19.4, 1.0, -7), 16.5, 3.8, 0.85, 6, 0, 9.5]; },
    end(J) { if (king && J.k0) { king.position.copy(J.k0.p); king.rotation.y = J.k0.ry; } Object.values(dF).forEach(f => { f.visible = false; }); SBD.forEach(g => { g.position.y = 0.9; }); } };
  // ================= SIT FOR THE PORTRAIT (throne room; hold the pose, drag to stay balanced, 4 layers) =================
  const PW = 160, PH = 200;
  const paint = (g, k) => { g.fillStyle = '#efe6d2'; g.fillRect(0, 0, PW, PH); if (k < 0) return; g.fillStyle = '#7a1f2b'; g.fillRect(0, 0, PW, PH); g.fillStyle = '#a8323e'; g.fillRect(0, PH * 0.62, PW, PH * 0.38);
    if (k >= 1) { g.fillStyle = '#e8742a'; g.beginPath(); g.moveTo(40, 70); g.lineTo(52, 22); g.lineTo(70, 56); g.lineTo(90, 56); g.lineTo(108, 22); g.lineTo(120, 70); g.quadraticCurveTo(124, 120, 80, 140); g.quadraticCurveTo(36, 120, 40, 70); g.fill(); g.fillStyle = '#1f2650'; g.fillRect(30, 140, 100, 60); }
    if (k >= 2) { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(58, 104); g.quadraticCurveTo(80, 146, 102, 104); g.quadraticCurveTo(80, 116, 58, 104); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(64, 88, 5, 0, 7); g.fill(); g.beginPath(); g.arc(96, 88, 5, 0, 7); g.fill(); g.beginPath(); g.arc(80, 118, 5, 0, 7); g.fill(); g.fillStyle = GOLD; g.fillRect(70, 152, 20, 20); }
    if (k >= 3) { g.strokeStyle = GOLD; g.lineWidth = 10; g.strokeRect(5, 5, PW - 10, PH - 10); g.fillStyle = GOLD; g.font = 'italic 900 15px Archivo, sans-serif'; g.fillText('Umber', PW - 62, PH - 16); } };
  const canT = CT(PW, PH, g => paint(g, save.stat('casPortrait', false) ? 3 : -1));
  const layerURL = k => { const c = document.createElement('canvas'); c.width = PW; c.height = PH; paint(c.getContext('2d'), k); return c.toDataURL(); };
  { const e = W(3.4, 0, -2.6); for (const [a, b, r] of [[-0.3, 0.1, 0.12], [0.3, 0.1, -0.12]]) { const l = box(G, 0.05, 1.9, 0.05, WOOD, e.x + a, 0.95, e.z + b); l.rotation.z = r; } const bl = box(G, 0.05, 1.9, 0.05, WOOD, e.x, 0.95, e.z - 0.3); bl.rotation.x = -0.2;
    box(G, 0.9, 0.05, 0.12, WOOD, e.x, 0.95, e.z + 0.08); box(G, 0.88, 1.08, 0.04, '#efe6d2', e.x, 1.52, e.z + 0.1); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.0), new THREE.MeshLambertMaterial({ map: canT })); p.position.set(e.x, 1.52, e.z + 0.125); G.add(p); colR(3.4, -2.6, 0.45); }
  const painter = kit.makeFox({ key: 'casPainter', torso: ['#6b4a32', '#e6b45a', '#3d2a1c'], crest: 'M', outfit: 'vest', gear: 'none', mood: 'happy' }); painter.position.copy(W(3.75, 0, -1.8)); painter.rotation.y = Math.PI; painter.visible = false; G.add(painter);
  const PNAMES = ['SKETCH', 'COLOUR', 'DETAILS', 'SIGNATURE'];
  const portrait = {
    begin(P, J) { J.k = 0; J.prog = 0; J.v = 0.5; J.dr = 0; J.drT = 0; J.out = 0; J.ph = 'wait'; J.urls = [0, 1, 2, 3].map(layerURL); J.blank = layerURL(-1); painter.visible = true; if (P && 'yaw' in P) P.yaw = 0;
      paint(canT.userData.c.getContext('2d'), -1); canT.needsUpdate = true; toast('MAESTRO UMBER PAINTS YOU \u00b7 HOLD TO POSE \u00b7 DRAG TO STAY IN THE GREEN', 3.4); },
    press(J) { J.ax = ptr.x; if (J.ph === 'wait') { J.ph = 'pose'; J.out = 0; tone(523, 0.04, 0.3); } },
    release(J) { if (J.ph !== 'pose') return; J.ph = 'wait'; if (J.prog > 0.05) { miss('YOU MOVED \u00b7 HOLD STILL', 1.4); J.prog = Math.max(0, J.prog - 0.35); } },
    tick(dt, J) { kit.animFox(painter, dt, 0, false); const A = painter.userData.P && painter.userData.P.arms; if (A) { A[1].rotation.x = J.ph === 'pose' ? -1.4 + Math.sin(J.t * 7) * 0.25 : -0.3; A[1].rotation.z = J.ph === 'pose' ? Math.sin(J.t * 5) * 0.3 : 0; }
      const fx = X.fox && X.fox(); if (fx) fx.rotation.z = (J.v - 0.5) * 0.5; if (J.ph !== 'pose') return;
      const st = clamp((ptr.x - J.ax) / (innerWidth * 0.12), -1, 1) + keyS(); J.dt2 = (J.dt2 || 0) - dt; if (J.dt2 <= 0) { J.dt2 = rnd(0.8, 1.8); J.drT = rnd(-0.8, 0.8); } J.dr += (J.drT - J.dr) * Math.min(1, dt * 2);
      J.v = clamp(J.v + (J.dr + st * 0.9) * dt * 0.55, 0, 1); const inG = J.v > 0.38 && J.v < 0.62;
      if (inG) { J.out = 0; J.prog += dt / 3.5; } else { J.out += dt; if (J.out > 0.6) { J.out = 0; miss('YOU MOVED \u00b7 BACK TO THE GREEN', 1.3); J.prog = Math.max(0, J.prog - 0.35); J.v = 0.5; } }
      if ((J.br = (J.br || 0) + dt) > 0.4) { J.br = 0; noise(0.06, 0.012, 4000); }
      if (J.prog >= 1) { J.prog = 0; paint(canT.userData.c.getContext('2d'), J.k); canT.needsUpdate = true; tone(784, 0.05, 0.4, 'triangle'); addGold(3); J.k++;
        if (J.k >= 4) { J.ph = 'done'; save.setStat('casPortrait', true); ding(); toast('THE PORTRAIT IS FINISHED \u00b7 MAESTRO UMBER BOWS', 2); NEXT(finish, 1.4); } else toast(PNAMES[J.k - 1] + ' DONE \u00b7 KEEP STILL', 1.0); } },
    card(J) { const k = Math.min(3, J.k), s = innerHeight < 500 ? [64, 80] : [96, 120], prev = k ? J.urls[k - 1] : J.blank;
      const pic = '<div style="position:relative;width:' + s[0] + 'px;height:' + s[1] + 'px;margin-top:8px;border:2px solid #201e1d"><img src="' + prev + '" style="position:absolute;inset:0;width:100%;height:100%;display:block"><img src="' + J.urls[k] + '" style="position:absolute;inset:0;width:100%;height:100%;display:block;clip-path:inset(0 0 ' + (100 - J.prog * 100).toFixed(0) + '% 0)"></div>';
      return [J.ph === 'pose' ? 'HOLD STILL \u00b7 DRAG TO BALANCE' : 'PRESS AND HOLD TO POSE', lab('LAYER ' + (k + 1) + ' / 4 \u00b7 ' + PNAMES[k]) + gauge(J.v, 0.38, 0.62, true) + pic, 'p' + J.k + '_' + Math.round(J.prog * 20) + '_' + Math.round(J.v * 30) + J.ph]; },
    hint(J) { return J.ph === 'wait' ? [W(3.4, 1.1, -6.0), 'HOLD'] : null; },
    shot() { return [W(3.4, 1.0, -6.0), 1.6, 2.2, 0.12, 2.4, 0.35, 3.2]; },
    end() { painter.visible = false; const fx = X.fox && X.fox(); if (fx) fx.rotation.z = 0; } };
  // ================= YARD: FEED + GROOM THE HORSES (stable lean-to on the north wall) =================
  const horse = (c, x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); GY.add(g); box(g, 1.5, 0.62, 0.55, c, 0, 1.15, 0); for (const a of [-0.55, 0.55]) for (const b of [-0.18, 0.18]) cyl(g, 0.07, 0.06, 0.88, c, a, 0.44, b, 6);
    const nk = box(g, 0.32, 0.75, 0.3, c, 0.75, 1.55, 0); nk.rotation.z = -0.5; const head = new THREE.Group(); head.position.set(1.0, 1.85, 0); g.add(head); box(head, 0.55, 0.26, 0.26, c, 0.2, 0, 0);
    for (const s of [-1, 1]) { box(head, 0.06, 0.12, 0.05, c, -0.02, 0.18, s * 0.08); box(head, 0.04, 0.04, 0.02, INK, 0.12, 0.05, s * 0.135); } const mn = box(g, 0.5, 0.12, 0.08, INK, 0.65, 1.78, 0); mn.rotation.z = -0.5;
    const tail = box(g, 0.08, 0.6, 0.1, INK, -0.8, 1.0, 0); tail.rotation.z = 0.3; const mg = box(GY, 0.5, 0.3, 0.5, WOOD, x + 1.62, 0.55, z); box(GY, 0.08, 0.4, 0.08, DARK, x + 1.62, 0.2, z);
    const hay = box(GY, 0.42, 0.08, 0.42, '#d6b86a', x + 1.62, 0.72, z); hay.visible = false; oy({ f: [x - 0.85, x + 1.9, z - 0.35, z + 0.35] }); return { g, head, tail, hay, x, z }; };
  const HORSES = [horse('#7a4a28', -247.8, -417.4), horse('#e8e2d6', -243.9, -417.4)], HAYP = V(-247.2, 1.05, -415.9);
  const BRUSH = new THREE.Group(); box(BRUSH, 0.22, 0.06, 0.1, '#7a4a28', 0, 0, 0); box(BRUSH, 0.2, 0.04, 0.08, '#d6b86a', 0, -0.05, 0); BRUSH.visible = false; GY.add(BRUSH);
  const horses = {
    begin(P, J) { J.h = 0; J.ph = 'feed'; HORSES.forEach(h => { h.hay.visible = false; }); toast('TAP THE HAY TO FEED \u00b7 THEN BRUSH OFF THE MUD', 3); },
    spots(J) { (J.sp || []).forEach(s => { s.m.visible = false; }); J.sp = []; const h = HORSES[J.h], z = h.z - 0.285;
      for (let i = 0; i < 8; i++) { let x, y, n = 0; do { x = h.x + rnd(-0.62, 0.62); y = rnd(0.95, 1.4); } while (J.sp.some(s => Math.hypot(s.p.x - x, s.p.y - y) < 0.14) && ++n < 30);
        const m = own(new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), spotM())); m.position.set(x, y, z - 0.004); m.rotation.y = Math.PI; m.renderOrder = 3; J.sp.push({ p: m.position.clone(), m, d: 1 }); }
      J.pl = new THREE.Plane().setFromNormalAndCoplanarPoint(V(0, 0, -1), V(0, 0, z)); J.lp = null; },
    press(J) { if (J.flies.length) return; if (J.ph === 'feed') { if (dist(scrW(HAYP)) > TAPR() * 2.2) { toast('TAP THE HAY BALES', 1.0); return; } const h = HORSES[J.h], c = own(new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), LM('#d6b86a'))); c.position.copy(HAYP); J.ph = 'fly';
        fly(c, V(h.x + 1.62, 0.8, h.z), 0.6, 0.6, () => { c.visible = false; h.hay.visible = true; tone(300, 0.04, 0.2); addGold(2); J.eat = 1.6; J.ph = 'eat'; }); return; } J.lp = null; },
    drag(J) { if (J.ph !== 'groom' || !ptr.down || J.pause > 0) return; const p = hitPl(J.pl); if (!p) return; const h = HORSES[J.h]; p.x = clamp(p.x, h.x - 0.75, h.x + 0.75); p.y = clamp(p.y, 0.85, 1.5);
      BRUSH.visible = true; BRUSH.position.set(p.x, p.y, J.pl.constant ? h.z - 0.33 : h.z - 0.33); const mv = J.lp ? J.lp.distanceTo(p) : 0; J.lp = p; if (mv < 0.002) return; if ((J.sw = (J.sw || 0) + mv) > 0.22) { J.sw = 0; rub(); }
      for (const s of J.sp) { if (s.d <= 0 || Math.hypot(s.p.x - p.x, s.p.y - p.y) > 0.14) continue; s.d -= mv * 2.8; s.m.material.opacity = Math.max(0, s.d) * 0.85; if (s.d <= 0) { s.m.visible = false; tone(1400, 0.03, 0.15, 'triangle'); addGold(1); } }
      if (J.sp.every(s => s.d <= 0)) { BRUSH.visible = false; ding(); J.h++; J.ph = 'wait'; if (J.h >= HORSES.length) { toast('TWO HAPPY HORSES', 1.3); NEXT(finish, 1.0); } else { toast('SHINY \u00b7 NEXT HORSE', 1.2); NEXT(() => { J.ph = 'feed'; }, 1.0); } } },
    release(J) { J.lp = null; },
    tick(dt, J) { if (J.ph !== 'eat') return; J.eat -= dt; const h = HORSES[J.h]; h.head.rotation.z = -0.5 - Math.abs(Math.sin(J.t * 6)) * 0.2; if ((J.mu = (J.mu || 0) + dt) > 0.3) { J.mu = 0; tone(140 + Math.random() * 30, 0.03, 0.08, 'triangle'); }
      if (J.eat <= 0) { h.head.rotation.z = 0; J.ph = 'groom'; this.spots(J); toast('NOW BRUSH OFF THE MUD', 1.4); } },
    card(J) { const n = J.sp && J.ph === 'groom' ? J.sp.filter(s => s.d > 0).length : 8; return [J.ph === 'groom' ? 'DRAG THE BRUSH' : J.ph === 'eat' ? 'MUNCH\u2026' : 'TAP THE HAY', lab('HORSE ' + Math.min(2, J.h + 1) + ' / 2') + lst([['#d6b86a', 'HAY', J.ph === 'feed' ? '' : '\u2713', J.ph !== 'feed'], ['#4a3220', 'MUD', n + ' LEFT', !n]]), 'h' + J.h + J.ph + n]; },
    hint(J) { if (J.ph === 'feed') return [HAYP.clone(), 'TAP']; if (J.ph === 'groom') { const s = J.sp.find(q => q.d > 0); return s ? [s.p.clone(), 'RUB'] : null; } return null; },
    shot(J) { const h = HORSES[Math.min(J.h, 1)]; return J.ph === 'groom' ? [V(h.x, 1.15, h.z - 0.3), 1.8, 1.0, 0.15, 1.6, Math.PI, 2.6] : [V(-245.9, 1.1, -416.8), 5.8, 2.2, 0.3, 4, Math.PI, 6.5]; },
    end() { BRUSH.visible = false; HORSES.forEach(h => { h.head.rotation.z = 0; }); } };
  // ================= YARD: DRAW WATER (the well; hold to wind, let go when it snags, pour into the barrel) =================
  const WX = -240, WZ = -440, BAR = V(-237.6, 0, -440.4);
  const BKT = new THREE.Group(); cyl(BKT, 0.16, 0.13, 0.26, '#7a5236', 0, 0, 0, 10); const bw = cyl(BKT, 0.14, 0.14, 0.02, '#3a6a8a', 0, 0.1, 0, 10); BKT.position.set(WX, 0.45, WZ); BKT.visible = false; GY.add(BKT); bw.visible = true;
  const wRope = box(GY, 0.02, 1, 0.02, '#8a6a42', WX, 1.4, WZ); wRope.visible = false;
  const wCrank = new THREE.Group(); wCrank.position.set(WX - 1.25, 2.0, WZ); GY.add(wCrank); box(wCrank, 0.04, 0.3, 0.04, IRON, 0, 0.15, 0); box(wCrank, 0.14, 0.04, 0.04, IRON, -0.07, 0.3, 0);
  { cyl(GY, 0.38, 0.34, 0.9, WOOD, BAR.x, 0.45, BAR.z, 14); for (const y of [0.2, 0.7]) cyl(GY, 0.39, 0.39, 0.05, IRON, BAR.x, y, BAR.z, 14); oy({ c: [BAR.x, BAR.z, 0.42] }); }
  const barW = cyl(GY, 0.33, 0.33, 0.02, '#3a6a8a', BAR.x, 0.3, BAR.z, 14);
  const well = {
    begin(P, J) { J.n = 0; J.d = 0; J.ph = 'wind'; J.sn = null; J.snT = J.t + rnd(1.2, 2.5); barW.position.y = 0.3; toast('HOLD TO WIND \u00b7 LET GO WHEN IT SNAGS', 3); },
    press(J) { if (J.flies.length) return; if (J.ph === 'wind') { J.hold = true; return; }
      if (J.ph === 'pour') { if (dist(scrW(V(BAR.x, 0.9, BAR.z))) > TAPR() * 2.2) { toast('TAP THE BARREL', 1.0); return; } J.ph = 'fly'; fly(BKT, V(BAR.x, 1.3, BAR.z), 0.5, 0.3, () => { BKT.rotation.z = 1.4; noise(0.5, 0.04, 600); J.n++; barW.position.y = 0.3 + J.n * 0.17; addGold(3);
          setTimeout(() => { BKT.rotation.z = 0; }, 400); if (J.n >= 3) { ding(); toast('THE BARREL IS FULL', 1.3); NEXT(finish, 1.0); } else { NEXT(() => { BKT.position.set(WX, 0.45, WZ); BKT.visible = false; J.d = 0; J.ph = 'wind'; J.snT = J.t + rnd(1.2, 2.5); }, 0.8); toast('POURED \u00b7 WIND THE NEXT ONE', 1.1); } }); } },
    release(J) { J.hold = false; },
    tick(dt, J) { if (J.ph !== 'wind') return; if (!J.sn && J.t > J.snT && J.d < 0.85) { J.sn = { t0: J.t }; tone(330, 0.05, 0.3, 'square'); }
      if (J.sn) { const a = J.t - J.sn.t0; if (a > 0.45 && a < 1.1 && J.hold) { noise(0.4, 0.06, 900); miss('THE ROPE SLIPS \u00b7 LET GO ON A SNAG', 1.4); J.d = Math.max(0, J.d - 0.3); J.hold = false; J.sn = null; J.snT = J.t + rnd(1.5, 3); } else if (a >= 1.1) { J.sn = null; J.snT = J.t + rnd(1.2, 2.8); } }
      if (J.hold && !(J.sn && J.t - J.sn.t0 > 0.45)) { J.d += dt / 3.6; wCrank.rotation.x += dt * 8; if ((J.cr = (J.cr || 0) + dt) > 0.18) { J.cr = 0; tone(220 + Math.random() * 30, 0.025, 0.07, 'square'); } }
      const y = 0.45 + J.d * 1.45; BKT.position.set(WX + (J.sn ? Math.sin(J.t * 30) * 0.03 : 0), y, WZ); BKT.visible = y > 0.92; wRope.visible = true; wRope.scale.y = Math.max(0.05, 2.0 - y - 0.13); wRope.position.y = (2.0 + y + 0.13) / 2;
      if (J.d >= 1) { J.d = 1; J.hold = false; J.ph = 'pour'; pop(); toast('UP! TAP THE BARREL TO POUR', 1.4); } },
    card(J) { const w = J.ph === 'wind', sn = !!J.sn; return [w ? (sn ? 'SNAG! LET GO' : 'HOLD TO WIND') : 'TAP THE BARREL', lab('BUCKET ' + Math.min(3, J.n + 1) + ' / 3') + (w ? gauge(J.d, 0.97, 1) : lst([['#3a6a8a', 'BARREL', J.n + ' / 3', J.n >= 3]])) + (w && sn ? '<div style="margin-top:6px;background:#ec3013;color:#ffffff;font-weight:900;font-size:13px;padding:4px 8px">SNAG \u00b7 LET GO!</div>' : ''), 'w' + J.n + J.ph + Math.round(J.d * 30) + (sn ? 's' : '')]; },
    hint(J) { if (J.ph === 'wind' && !J.hold && !J.sn) return [wCrank.position.clone(), 'HOLD']; if (J.ph === 'pour') return [V(BAR.x, 0.9, BAR.z), 'TAP']; return null; },
    shot() { return [V(-239, 1.3, WZ), 4.6, 2.6, 0.25, 3.2, 0, 5]; },
    end() { BKT.position.set(WX, 0.45, WZ); BKT.visible = false; BKT.rotation.z = 0; wRope.visible = false; } };
  // ================= YARD: WORK THE PORTCULLIS (a NEW iron gate inside the gatehouse; lower gently, raise before the rider) =================
  const PX = GX + 1.85, PTOP = 6.6, PCG = new THREE.Group(); PCG.position.set(PX, PTOP, GZ); GY.add(PCG);
  for (let i = 0; i < 9; i++) { const z = -2.4 + i * 0.6; box(PCG, 0.12, 5.6, 0.12, IRON, 0, 2.8, z); const sp = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 6), LM(IRON)); sp.rotation.x = Math.PI; sp.position.set(0, -0.1, z); PCG.add(sp); }
  for (let j = 0; j < 5; j++) box(PCG, 0.14, 0.14, 5.2, IRON, 0, 0.5 + j * 1.2, 0);
  const pcCol = { f: [PX - 0.3, PX + 0.3, GZ - 2.6, GZ + 2.6], y0: OY - 8, y1: OY + 40, on: false }; cols.push(pcCol);
  const gW = new THREE.Group(); gW.position.set(GX - 2.62, 1.2, GZ - 5.5); GY.add(gW); { const d = cyl(gW, 0.16, 0.16, 0.5, WOOD, 0, 0, 0, 10); d.rotation.x = Math.PI / 2; box(gW, 0.1, 0.5, 0.6, IRON, 0.06, 0, 0); }
  const gCrank = new THREE.Group(); gCrank.position.set(GX - 2.7, 1.2, GZ - 5.1); GY.add(gCrank); box(gCrank, 0.04, 0.36, 0.04, IRON, 0, 0.18, 0); box(gCrank, 0.04, 0.04, 0.16, IRON, 0, 0.36, 0.08);
  let rider = null; const getRider = () => rider || (rider = (() => { const f = kit.makeFox({ key: 'casRider', torso: ['#1f2650', GOLD, '#111827'], crest: 'M', outfit: 'coat', gear: 'none', mood: 'happy' }); f.visible = false; GY.add(f); return f; })());
  const gate = {
    begin(P, J) { J.ord = ['LOWER', 'RAISE', 'LOWER', 'RAISE']; J.o = 0; J.y = PTOP; PCG.position.y = PTOP; this.order(J); },
    order(J) { const o = J.ord[J.o]; J.tl = o === 'RAISE' ? 5.5 : 0; J.late = false; tone(o === 'RAISE' ? 660 : 440, 0.05, 0.3); toast(o === 'RAISE' ? 'A RIDER IS COMING \u00b7 RAISE THE GATE!' : 'GATE DRILL \u00b7 LOWER IT GENTLY', 1.8); },
    press(J) { if (J.flies.length || J.done2) return; J.hold = true; },
    release(J) { const was = J.hold; J.hold = false; if (!was) return; const o = J.ord[J.o]; if (o === 'LOWER' && J.y > 0 && J.y <= 0.5) this.done(J, true); else if (o === 'LOWER' && J.y > 0.5) toast('LOWER STILL', 0.9); },
    done(J, ok) { thud(); if (ok) { addGold(3); tone(1200, 0.04, 0.3, 'triangle'); } J.o++; if (J.o >= J.ord.length) { J.done2 = true; ding(); toast('THE GATE WORKS LIKE A CLOCK', 1.4); NEXT(finish, 1.2); } else NEXT(() => gate.order(J), 0.8); },
    rider(J) { const f = getRider(); f.position.set(GX + 6, 0, GZ); f.visible = true; walkTo(f, V(GX - 7, 0, GZ), 4, () => { f.visible = false; }); },
    tick(dt, J) { const o = J.ord[J.o]; if (!o || J.pause > 0) return; if (o === 'RAISE') { J.tl -= dt; if (J.tl <= 0 && !J.late) { J.late = true; miss('TOO SLOW \u00b7 THE RIDER WAITS', 1.6); } }
      if (J.hold) { J.y += (o === 'LOWER' ? -1.9 : 2.2) * dt; gCrank.rotation.z += dt * (o === 'LOWER' ? -9 : 9); if ((J.ck = (J.ck || 0) + dt) > 0.15) { J.ck = 0; tone(160 + Math.random() * 40, 0.03, 0.06, 'square'); }
        if (o === 'LOWER' && J.y <= 0) { J.y = 0; J.hold = false; noise(0.4, 0.08, 300); miss('SLAM! EASE IT DOWN', 1.4); this.done(J, false); }
        else if (o === 'RAISE' && J.y >= PTOP) { J.y = PTOP; J.hold = false; this.done(J, true); this.rider(J); } }
      PCG.position.y = Math.max(0, J.y); pcCol.on = J.y < 2; },
    card(J) { const o = J.ord[Math.min(J.o, J.ord.length - 1)], low = o === 'LOWER';
      return [low ? 'HOLD \u00b7 LET GO NEAR THE GROUND' : 'HOLD TO RAISE', lab('ORDER ' + Math.min(4, J.o + 1) + ' / 4 \u00b7 ' + o) + (low ? gauge(1 - J.y / PTOP, 1 - 0.5 / PTOP, 0.995) : gauge(J.y / PTOP, 0.97, 1)) + (low ? '' : lab('RIDER IN ' + Math.max(0, Math.ceil(J.tl)) + ' S')), 'q' + J.o + Math.round(J.y * 10) + '_' + Math.ceil(J.tl)]; },
    hint(J) { return J.hold ? null : [gCrank.position.clone(), 'HOLD']; },
    shot() { return [V(PX, 3.2, GZ), 6, 7, 0.1, 6, -Math.PI / 2, 10]; },
    end() { PCG.position.y = PTOP; pcCol.on = false; if (rider) rider.visible = false; } };
  // ================= YARD: BANNERS + FLAGS (fold 2 banners on the trestle, hoist the yard flag between gusts) =================
  const TRX = -236, TRZ = -436.6, POLE = V(-236, 0, -424.6), PHT = 9;
  { box(GY, 2.4, 0.06, 1.0, WOOD, TRX, 0.8, TRZ); for (const a of [-1.0, 1.0]) for (const b of [-0.4, 0.4]) box(GY, 0.07, 0.78, 0.07, DARK, TRX + a, 0.39, TRZ + b); oy({ f: [TRX - 1.25, TRX + 1.25, TRZ - 0.55, TRZ + 0.55] });
    cyl(GY, 0.07, 0.09, PHT, '#c0c4cc', POLE.x, PHT / 2, POLE.z, 8); const ball = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), LM(GOLD)); ball.position.set(POLE.x, PHT + 0.1, POLE.z); GY.add(ball); cyl(GY, 0.3, 0.36, 0.3, '#8a7f70', POLE.x, 0.15, POLE.z, 10);
    box(GY, 0.015, PHT, 0.015, '#efe6d2', POLE.x + 0.1, PHT / 2, POLE.z); oy({ c: [POLE.x, POLE.z, 0.4] }, 12); }
  const flagT = CT(256, 160, (g, w, h) => { g.fillStyle = '#a8323e'; g.fillRect(0, 0, w, h); g.fillStyle = GOLD; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14); g.font = '900 96px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('M', 84, h / 2 + 6); });
  const flagM = new THREE.MeshLambertMaterial({ map: flagT, side: THREE.DoubleSide }), FLAG = new THREE.Group(); FLAG.position.set(POLE.x, PHT - 0.6, POLE.z); GY.add(FLAG);
  const flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0).translate(0.82, 0, 0), flagM); FLAG.add(flagMesh);
  const banM = new THREE.MeshLambertMaterial({ map: flagT });
  const flags = {
    begin(P, J) { J.b = 0; J.ph = 'fold'; FLAG.position.y = 0.8; J.fy2 = 0.8; this.banner(J); toast('DRAG EACH NUMBERED EDGE ACROSS TO FOLD \u00b7 THEN HOIST THE FLAG', 3.2); },
    banner(J) { J.bn = own(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.012, 1.0), banM)); J.bn.position.set(TRX - 0.3, 0.84, TRZ); J.step = 0; J.dm = { x0: -0.8, x1: 0.8, z0: -0.5, z1: 0.5, n: 1 }; this.tag(J); },
    edge(J) { const d = J.dm, cx = TRX - 0.3 + (d.x0 + d.x1) / 2, cz = TRZ + (d.z0 + d.z1) / 2; return J.step < 2 ? [V(TRX - 0.3 + d.x1, 0.86, cz), V(TRX - 0.3 + d.x0, 0.86, cz)] : [V(cx, 0.86, TRZ + d.z1), V(cx, 0.86, TRZ + d.z0)]; },
    tag(J) { if (!J.tg) J.tg = own(tagSprite('1', YEL, INK, 0.22)); J.tg.material.map = tagFor(String(J.step + 1), YEL, INK); J.tg.position.copy(this.edge(J)[0]).setY(0.97); J.tg.visible = true; },
    press(J) { if (J.flies.length) return; if (J.ph === 'fold') { J.grab = dist(scrW(this.edge(J)[0])) < TAPR() * 1.5; if (!J.grab) toast('GRAB THE NUMBERED EDGE', 1.0); return; } if (J.ph === 'hoist') J.hold = true; },
    drag(J) { if (J.ph !== 'fold' || !J.grab || !ptr.down) return; const [a, b] = this.edge(J), sa = scrW(a), sb = scrW(b), dx = sb[0] - sa[0], dy = sb[1] - sa[1], tt = dx * dx + dy * dy || 1;
      const k = clamp(((ptr.x - sa[0]) * dx + (ptr.y - sa[1]) * dy) / tt, 0, 1); J.tg.position.lerpVectors(a, b, k).setY(0.97 + Math.sin(k * Math.PI) * 0.2); if (k > 0.85) { J.grab = false; rub(); tone(500 + J.step * 90, 0.04, 0.15, 'triangle'); this.fold(J); } },
    release(J) { J.hold = false; if (J.grab) { J.grab = false; if (J.ph === 'fold') this.tag(J); } },
    fold(J) { const d = J.dm; if (J.step < 2) d.x1 = (d.x0 + d.x1) / 2; else d.z1 = (d.z0 + d.z1) / 2; d.n *= 2; const m = J.bn; m.scale.set((d.x1 - d.x0) / 1.6, d.n, (d.z1 - d.z0) / 1.0); m.position.set(TRX - 0.3 + (d.x0 + d.x1) / 2, 0.834 + d.n * 0.006, TRZ + (d.z0 + d.z1) / 2); addGold(1); J.step++;
      if (J.step < 4) { this.tag(J); return; } J.tg.visible = false; pop(); J.b++; fly(m, V(TRX + 0.85, 0.85 + J.b * 0.1, TRZ), 0.4, 0.25, () => { if (J.b >= 2) { J.ph = 'hoist'; J.gust = null; J.gT = J.t + rnd(1.0, 2.0); toast('NOW HOIST THE FLAG \u00b7 LET GO IN A GUST', 2.2); } else flags.banner(J); }); },
    tick(dt, J) { if (J.ph !== 'hoist') return; if (!J.gust && J.t > J.gT) { J.gust = { t0: J.t }; noise(1.2, 0.03, 400); }
      if (J.gust) { const a = J.t - J.gust.t0; if (a > 0.5 && a < 1.3 && J.hold) { miss('THE GUST YANKS THE ROPE \u00b7 LET GO IN A GUST', 1.5); J.fy2 = Math.max(0.8, J.fy2 - 1.6); J.hold = false; J.gust = null; J.gT = J.t + rnd(1.2, 2.4); } else if (a >= 1.3) { J.gust = null; J.gT = J.t + rnd(1.0, 2.4); } }
      if (J.hold && !(J.gust && J.t - J.gust.t0 > 0.5)) { J.fy2 += dt * 1.7; if ((J.sq = (J.sq || 0) + dt) > 0.2) { J.sq = 0; tone(900 + Math.random() * 100, 0.015, 0.05, 'triangle'); } }
      FLAG.position.y = J.fy2; if (J.fy2 >= PHT - 0.6) { J.fy2 = PHT - 0.6; FLAG.position.y = J.fy2; J.hold = false; J.ph = 'done'; trumpet(); toast('THE FLAG FLIES OVER MERU', 1.6); NEXT(finish, 1.4); } },
    card(J) { if (J.ph === 'fold') return ['DRAG EDGE ' + (J.step + 1) + ' ACROSS', lab('BANNER ' + Math.min(2, J.b + 1) + ' / 2') + lst([[RED, 'FOLDS', J.step + ' / 4', J.step >= 4]]), 'f' + J.b + '_' + J.step];
      const g = !!J.gust; return [g ? 'GUST! LET GO' : 'HOLD TO HOIST', lab('THE YARD FLAG') + gauge((J.fy2 - 0.8) / (PHT - 1.4), 0.97, 1) + (g ? '<div style="margin-top:6px;background:#ec3013;color:#ffffff;font-weight:900;font-size:13px;padding:4px 8px">GUST \u00b7 LET GO!</div>' : ''), 'h' + Math.round(J.fy2 * 10) + (g ? 'g' : '')]; },
    hint(J) { if (J.ph === 'fold') return [this.edge(J)[0], 'DRAG']; if (J.ph === 'hoist' && !J.hold && !J.gust) return [V(POLE.x, 1.2, POLE.z), 'HOLD']; return null; },
    shot(J) { return J.ph === 'fold' || J.ph === 'wait' ? [V(TRX, 0.86, TRZ), 2.6, 1.2, 0.95, 2.0, 0, 3.2] : [V(POLE.x, 4.6, POLE.z), 3, 9.6, 0.12, 6, Math.PI, 11]; },
    end() { FLAG.position.y = PHT - 0.6; } };
  // ================= idle life: tails swish, the yard flag flaps =================
  function tick(dt, t, J) { HORSES.forEach((h, i) => { h.tail.rotation.x = Math.sin(t * 2.2 + i * 2) * 0.35; if (!(J && J.g === 'horses')) h.head.rotation.z = Math.sin(t * 0.5 + i) * 0.08; });
    const gust = J && J.g === 'flags' && J.gust; flagMesh.rotation.y = Math.sin(t * (gust ? 9 : 3)) * (gust ? 0.5 : 0.22); }
  return { GD: { gold, vault, dinner, portrait, horses, well, gate, flags }, tick, paint, PW, PH };
}
