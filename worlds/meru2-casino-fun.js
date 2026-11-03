// MERU 2.0 — s90 CASINO DELUXE PART C (Ben's answers s90): the fun + the prizes + the look, plugged into worlds/meru2-casino-jobs.js (old casino frame).
// FUN: LUCKY 8 DELUXE — a real 3D slot (tap = pull the lever, three reels spin in the room and stop one by one; three 8s = JACKPOT: siren, lights,
// your win on the JACKPOT WALL); the GOLD 8 high-roller machine inside the VIP LOUNGE (bet 25) · VELVET'S SHOW — the lounge singer on a little stage
// by the south wall (sings 6 PM - 2 AM; sit at the ring and tap the hearts to cheer).
// PRIZES (one per finished job, in order): DEALER VEST + BOW TIE (worn, the Tailor keeps it) · LUCKY DICE CHARM (3 jobs: +10% gold on casino jobs
// and a nudge on the slot reels) · VIP CARD (5 jobs: Max lets you into the high-roller lounge) · YOUR NAME ON THE JACKPOT WALL (7 jobs) ·
// GOLDEN 8 trophy + 150 gold (all 8 jobs). LOOK: Sterling shuffles a deck, Nickel stacks chips when you are not close.
const SYMS = ['8', '\u2605', '\u2665', '\u2666', '\u2663', 'BAR'], SCOL = ['#ffd23a', '#20e8ff', '#ff4f9a', '#ff6a55', '#7cff9b', '#ffffff'], WGT = [1, 2, 3, 4, 4, 4], MULT3 = [100, 25, 12, 6, 6, 5];
export const funGames = () => [{ k: 'pull', name: 'Lucky 8 Deluxe', color: '#ffd23a', fun: true }, { k: 'pullvip', name: 'Gold 8 (VIP)', color: '#c9a227', fun: true }, { k: 'show', name: "Velvet's Show", color: '#ff4f9a', fun: true }];
export function csFun(X) {
  const { THREE, G, toWo, RAD, V, box, cyl, LM, CT, kit, cols, ring, own, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, coin, clack, lst, lab, row, tagSprite, TAPR, scrW, dist, sayTo, rnd, touch, J, save, wear, heal, done, GAMES, kT, ln, hour, boss, cash, CA, jackpot, PLAYER_FEMALE } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#c9a227';
  const st = (k, d) => save.stat('cs' + k, d), set = (k, v) => save.setStat('cs' + k, v);
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 12) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const name = () => { try { return (save.data.name || 'YOU').toUpperCase(); } catch (e) { return 'YOU'; } };
  const nDone = () => { const d = done(); return GAMES.filter(q => d[q.k]).length; };
  const colBox = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] });
  const night = () => { const h = hour ? hour() : 12; return h >= 18 || h < 2; };
  // ================= REEL MACHINES =================
  const reelT = CT(768, 128, (g, w, h) => { for (let i = 0; i < 6; i++) { const x = i * 128; g.fillStyle = i % 2 ? '#10142a' : '#141a33'; g.fillRect(x, 0, 128, h); g.fillStyle = '#1e5b6b'; g.fillRect(x, 0, 3, h);
      g.save(); g.translate(x + 64, 64); g.rotate(Math.PI / 2); g.fillStyle = SCOL[i]; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 ' + (SYMS[i] === 'BAR' ? 40 : 84) + 'px Archivo, sans-serif'; g.fillText(SYMS[i], 0, 4); g.restore(); } });
  const reelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.26, 30, 1, true); reelGeo.rotateZ(Math.PI / 2);
  const reelM = new THREE.MeshBasicMaterial({ map: reelT, side: THREE.DoubleSide });
  const symA = i => (i + 0.5) / 6 * Math.PI * 2;
  function machine(o, gold, title) { const g = new THREE.Group(); g.position.set(o.x, 0, o.z); g.rotation.y = RAD(o.a); G.add(g); const body = gold ? GOLD : '#2a1640', edge = gold ? YEL : '#20e8ff';
    box(g, 1.5, 0.9, 1.1, INK, 0, 0.45, 0); box(g, 1.5, 1.5, 1.0, body, 0, 1.65, -0.05); box(g, 1.2, 0.72, 0.06, '#05080f', 0, 1.62, 0.43); box(g, 1.3, 0.1, 0.34, body, 0, 2.03, 0.6); box(g, 1.3, 0.1, 0.34, body, 0, 1.21, 0.6); for (const sx of [-0.63, 0.63]) box(g, 0.08, 0.86, 0.34, body, sx, 1.62, 0.6); box(g, 1.5, 0.6, 0.8, INK, 0, 2.7, -0.15); box(g, 1.54, 0.05, 1.04, edge, 0, 0.92, -0.05);
    for (const y of [1.25, 1.99]) box(g, 1.24, 0.04, 0.04, edge, 0, y, 0.78); for (const x of [-0.6, 0.6]) box(g, 0.04, 0.78, 0.04, edge, x, 1.62, 0.78);
    box(g, 1.3, 0.08, 0.5, INK, 0, 1.1, 0.6); cyl(g, 0.07, 0.07, 0.04, RED, 0, 1.16, 0.66, 12); box(g, 0.7, 0.06, 0.25, '#c0c4cc', 0, 0.7, 0.58);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.5), new THREE.MeshBasicMaterial({ map: CT(512, 180, (q, w, h) => { q.fillStyle = '#05080f'; q.fillRect(0, 0, w, h); q.strokeStyle = edge; q.lineWidth = 8; q.strokeRect(5, 5, w - 10, h - 10); q.fillStyle = gold ? YEL : '#ffffff'; q.textBaseline = 'middle'; fitTxt(q, title, 24, 70, w - 48, 64); q.fillStyle = '#ff3fb4'; fitTxt(q, gold ? 'HIGH ROLLERS \u00b7 BET 25' : 'BET 5 \u00b7 THREE 8s = JACKPOT', 24, 136, w - 48, 30, 800); }) }));
    top.position.set(0, 2.7, 0.26); g.add(top);
    const reels = [-0.36, 0, 0.36].map(x => { const r = new THREE.Mesh(reelGeo, reelM); r.position.set(x, 1.62, 0.5); r.rotation.x = symA((Math.random() * 6) | 0); g.add(r); return { m: r, spin: false, tgt: 0 }; });
    const payl = box(g, 1.18, 0.012, 0.02, '#ff3fb4', 0, 1.62, 0.76);
    const lever = new THREE.Group(); lever.position.set(0.82, 1.3, 0.1); g.add(lever); box(g, 0.12, 0.24, 0.24, INK, 0.79, 1.3, 0.1); cyl(lever, 0.025, 0.025, 0.7, '#c0c4cc', 0, 0.35, 0, 8); { const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), LM(RED)); b.position.y = 0.72; lever.add(b); }
    const [c0, c1, c2, c3] = (() => { const r = RAD(o.a), c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r)), ex = 0.85 * c + 0.6 * s, ez = 0.85 * s + 0.6 * c; return [o.x - ex, o.x + ex, o.z - ez, o.z + ez]; })(); colBox(c0, c1, c2, c3);
    return { o, g, reels, lever, payl, gold, bet: gold ? 25 : 5, title }; }
  const M1 = machine({ x: -110.5, z: -8.5, a: 0 }, false, 'LUCKY 8 DELUXE'), M2 = machine({ x: -144.5, z: -28.9, a: 0 }, true, 'GOLD 8');
  const leverAt = M => { const [x, z] = toWo(M.o, 0.82, 0.1); return V(x, 2.0, z); };
  const pickSym = () => { let r = Math.random() * 18; for (let i = 0; i < 6; i++) { r -= WGT[i]; if (r < 0) return i; } return 5; };
  function evalReels(s) { if (s[0] === s[1] && s[1] === s[2]) return MULT3[s[0]]; const n8 = s.filter(x => x === 0).length; if (n8 === 2) return 3; if (s[0] === s[1] || s[1] === s[2] || s[0] === s[2]) return 1; return 0; }
  const JW = () => st('JackList', []) || [];
  const pullGame = M => ({
    begin() { J.M = M; J.n = 0; J.won = 0; J.spent = 0; J.busy2 = false; toast((M.gold ? 'GOLD 8 \u00b7 BET 25' : 'LUCKY 8 \u00b7 BET 5') + ' \u00b7 TAP TO PULL \u00b7 ' + (touch ? '3' : 'SPACE') + ' TO LEAVE', 3); },
    press() { if (J.busy2) return; if (!(save.spend && save.spend(M.bet))) { toast('NOT ENOUGH GOLD \u00b7 ' + M.bet + ' G A PULL', 1.8); tone(196, 0.05, 0.25, 'square'); return; }
      J.busy2 = true; J.n++; J.spent += M.bet; J.lt = 0; let s = [pickSym(), pickSym(), pickSym()];
      if (st('Dice', false) && !(s[0] === s[1] && s[1] === s[2]) && Math.random() < 0.15) { s[2] = s[0] === s[1] ? s[0] : s[1]; }
      J.res = s; J.stopAt = [0.75, 1.15, 1.55]; J.st0 = J.t; M.reels.forEach(r => { r.spin = true; r.ease = 0; }); noise(0.25, 0.03, 2000); clack(); },
    tick(dt) { if (J.lt != null) { J.lt += dt; const k = Math.min(1, J.lt / 0.5); M.lever.rotation.x = Math.sin(k * Math.PI) * 1.1; if (k >= 1) J.lt = null; }
      if (!J.busy2) return; const el = J.t - J.st0;
      M.reels.forEach((r, i) => { if (r.spin) { r.m.rotation.x += dt * 16; if ((J.tk = (J.tk || 0) + dt) > 0.07) { J.tk = 0; tone(1400 + i * 120, 0.012, 0.04, 'square'); }
          if (el >= J.stopAt[i]) { r.spin = false; const a = symA(J.res[i]), cur = r.m.rotation.x; r.from = cur; r.tgt = a + Math.PI * 2 * (Math.ceil((cur - a) / (Math.PI * 2)) + 1); r.ease = 0.001; clack(); } }
        else if (r.ease > 0) { r.ease = Math.min(1, r.ease + dt / 0.3); const e = 1 - Math.pow(1 - r.ease, 3); r.m.rotation.x = r.from + (r.tgt - r.from) * e; if (r.ease >= 1) r.ease = 0; } });
      if (M.reels.every(r => !r.spin && !r.ease) && el > J.stopAt[2] + 0.35) { J.busy2 = false; const m = evalReels(J.res), pay = m * M.bet;
        if (pay) { addGold(pay); J.won += pay; coin(); if (m >= 100) { jackpot({ x: M.o.x, z: M.o.z, a: M.o.a }, 7); const L2 = [{ n: name(), g: pay }, ...JW()].slice(0, 5); set('JackList', L2); drawWall(); toast('JACKPOT!!! \u00b7 +' + pay + ' GOLD \u00b7 YOUR NAME GOES ON THE WALL', 3.4); }
          else if (m >= 3) { ding(); toast(SYMS[J.res[0]] + ' ' + SYMS[J.res[1]] + ' ' + SYMS[J.res[2]] + ' \u00b7 +' + pay + ' G', 1.8); } else toast('A PAIR \u00b7 MONEY BACK', 1.2); }
        else { tone(220, 0.03, 0.2, 'triangle'); } } },
    card() { const s = J.res; return [J.busy2 ? 'SPINNING\u2026' : 'TAP TO PULL \u00b7 ' + M.bet + ' G', lab('PULLS ' + J.n + ' \u00b7 WON ' + J.won + ' G' + (st('Dice', false) ? ' \u00b7 LUCKY DICE' : '')) + (s && !J.busy2 ? row('#ff3fb4', 'LAST', SYMS[s[0]] + ' ' + SYMS[s[1]] + ' ' + SYMS[s[2]], evalReels(s) > 0) : '') + lst([[YEL, '8 8 8', MULT3[0] + 'X', false], ['#20e8ff', '\u2605\u2605\u2605', '25X', false], [WHITE, 'ANY PAIR', '1X', false]]), J.n + '_' + J.busy2 + J.won]; },
    hint() { return J.busy2 ? null : [leverAt(M), 'PULL']; },
    shot() { const [x, z] = toWo(M.o, 0.1, 0); return [V(x, 1.85, z), 2.0, 3.0, 0.12, 2.6, RAD(M.o.a), 4.4]; },
    result() { const net = J.won - J.spent; return M.title + ' \u00b7 ' + J.n + (J.n === 1 ? ' PULL' : ' PULLS') + ' \u00b7 ' + (net >= 0 ? 'UP ' + net : 'DOWN ' + -net) + ' G'; },
    end() { M.reels.forEach(r => { r.spin = false; r.ease = 0; }); M.lever.rotation.x = 0; } });
  // ================= VIP LOUNGE (north-west corner) + MAX on the rope =================
  const VR = { x0: -148.6, x1: -140.8, z0: -30.6, z1: -19.6 }, GAP = [-26, -22.4];
  { const post = (x, z) => { cyl(G, 0.04, 0.04, 0.95, GOLD, x, 0.475, z, 8); const k = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), LM(GOLD)); k.position.set(x, 0.98, z); G.add(k); cyl(G, 0.16, 0.16, 0.04, GOLD, x, 0.02, z, 12); };
    const rope = (x0, z0, x1, z1) => { const L2 = Math.hypot(x1 - x0, z1 - z0), m = box(G, 0.06, 0.06, L2, '#a3162b', (x0 + x1) / 2, 0.86, (z0 + z1) / 2); m.rotation.y = Math.atan2(x1 - x0, z1 - z0); colBox(Math.min(x0, x1) - 0.06, Math.max(x0, x1) + 0.06, Math.min(z0, z1) - 0.06, Math.max(z0, z1) + 0.06); };
    for (const [z0, z1] of [[VR.z0 + 0.4, GAP[0]], [GAP[1], VR.z1]]) { post(VR.x1, z0); post(VR.x1, z1); rope(VR.x1, z0, VR.x1, z1); } post(VR.x0 + 0.3, VR.z1); rope(VR.x0 + 0.3, VR.z1, VR.x1, VR.z1);
    box(G, 1.0, 0.45, 2.6, '#c9a227', -147.6, 0.22, -23.6); box(G, 0.25, 0.7, 2.6, '#8f6b17', -148.1, 0.7, -23.6); for (const s of [-1, 1]) box(G, 1.0, 0.6, 0.22, '#8f6b17', -147.6, 0.4, -23.6 + s * 1.3); colBox(-148.2, -147.0, -25, -22.2);
    cyl(G, 0.5, 0.5, 0.05, '#05080f', -145.7, 0.72, -23.6, 20); cyl(G, 0.52, 0.52, 0.03, GOLD, -145.7, 0.7, -23.6, 20); cyl(G, 0.05, 0.05, 0.7, GOLD, -145.7, 0.35, -23.6, 8); ring(-145.7, -23.6, 0.55);
    for (let k = 0; k < 4; k++) cyl(G, 0.04, 0.04, 0.05 + k * 0.03, [GOLD, '#1f8a4c', RED, INK][k], -145.85 + k * 0.1, 0.77, -23.5, 10);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: CT(512, 128, (q, w, h) => { q.fillStyle = '#05080f'; q.fillRect(0, 0, w, h); q.strokeStyle = GOLD; q.lineWidth = 8; q.strokeRect(5, 5, w - 10, h - 10); q.fillStyle = YEL; q.textBaseline = 'middle'; fitTxt(q, 'VIP \u00b7 HIGH ROLLERS', 24, h / 2 + 2, w - 48, 56); }) }));
    sg.position.set(-149.5, 3.2, -24.8); sg.rotation.y = Math.PI / 2; G.add(sg); }
  const MAX = kit.makeFox({ key: 'csMax', torso: ['#201e1d', '#201e1d', '#111111'], outfit: 'suit', mood: 'neutral', glasses: true, look: { fur: '#6b5a4a', furDark: '#3a2e24' } }); MAX.scale.multiplyScalar(1.12);
  const MAXIN = [-140.1, (GAP[0] + GAP[1]) / 2], MAXOUT = [-140.1, GAP[0] - 0.9]; MAX.position.set(MAXIN[0], 0, MAXIN[1]); MAX.rotation.y = Math.PI / 2; G.add(MAX);
  const vip = () => !!st('Vip', false), mT = { key: 'csMax', name: 'Max', role: 'VIP DOOR', obj: MAX, ry: Math.PI / 2, r: 6 }, lnM = t => ({ who: 'csMax', role: 'VIP DOOR', text: t });
  const nearMax = P => Math.abs(P.y || 0) < 1.5 && Math.hypot(P.x - MAX.position.x, P.z - MAX.position.z) < 2.2;
  let gateT = 0; function gate(P, dt) { gateT -= dt; if (vip() || Math.abs(P.y || 0) > 1.5) return; if (P.x < VR.x1 - 0.1 && P.x > VR.x0 && P.z > VR.z0 && P.z < VR.z1) { P.x = VR.x1 + 0.45; if (gateT <= 0) { gateT = 2.5; toast('MAX: "VIP CARD, PLEASE."', 1.8); } } }
  // ================= VELVET'S SHOW (stage by the south wall) =================
  const SG = { x: -113, z: 29.5 }, SY = 0.4;
  { box(G, 5, SY, 3, '#3d2a1c', SG.x, SY / 2, SG.z); box(G, 4.9, 0.03, 2.9, '#5a1e2a', SG.x, SY + 0.01, SG.z); box(G, 5.04, 0.08, 0.06, GOLD, SG.x, SY - 0.02, SG.z - 1.5); colBox(SG.x - 2.5, SG.x + 2.5, SG.z - 1.5, SG.z + 1.6);
    for (let i = 0; i < 9; i++) box(G, 0.56, 3.6, 0.12, i % 2 ? '#8f1d2c' : '#a3162b', SG.x - 2.25 + i * 0.56, SY + 1.8, 31.35); box(G, 5.2, 0.3, 0.2, GOLD, SG.x, SY + 3.7, 31.3);
    cyl(G, 0.18, 0.18, 0.03, INK, SG.x, SY + 0.015, SG.z - 0.2, 12); cyl(G, 0.015, 0.015, 1.5, '#c0c4cc', SG.x, SY + 0.75, SG.z - 0.2, 6); { const mic = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), LM(INK)); mic.position.set(SG.x, SY + 1.52, SG.z - 0.24); G.add(mic); }
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.55), new THREE.MeshBasicMaterial({ map: CT(512, 128, (q, w, h) => { q.fillStyle = '#05080f'; q.fillRect(0, 0, w, h); q.strokeStyle = '#ff4f9a'; q.lineWidth = 8; q.strokeRect(5, 5, w - 10, h - 10); q.fillStyle = '#ffffff'; q.textBaseline = 'middle'; fitTxt(q, 'TONIGHT: VELVET', 24, 50, w - 48, 54); q.fillStyle = '#ff4f9a'; fitTxt(q, '6 PM \u2013 2 AM \u00b7 THE LOUNGE', 24, 100, w - 48, 28, 800); }) }));
    sg.position.set(SG.x, SY + 4.2, 31.2); sg.rotation.y = Math.PI; G.add(sg); }
  const coneM = new THREE.MeshBasicMaterial({ color: '#ffe2a8', transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const CONE = new THREE.Mesh(new THREE.ConeGeometry(1.3, 8.2, 20, 1, true), coneM); CONE.position.set(SG.x, SY + 4.1, SG.z); G.add(CONE);
  const VEL = kit.makeFox({ key: 'csVelvet', torso: ['#c9a227', '#ffd23a', '#7a5a10'], outfit: 'dress', mood: 'happy', look: PLAYER_FEMALE }); VEL.position.set(SG.x, SY, SG.z + 0.35); VEL.rotation.y = Math.PI; G.add(VEL);
  const MEL = [523, 659, 784, 659, 698, 659, 587, 523, 440, 523, 587, 659, 587, 523, 494, 523];
  const heartT = CT(64, 64, g => { g.fillStyle = '#ff4f9a'; g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.beginPath(); g.moveTo(32, 54); g.bezierCurveTo(-4, 30, 10, 4, 32, 20); g.bezierCurveTo(54, 4, 68, 30, 32, 54); g.fill(); g.stroke(); });
  const SHOW = {
    begin() { J.h = []; J.cheer = 0; J.ht = 0.6; J.nt = 0; J.ni = 0; J.len = 22; toast('VELVET SINGS \u00b7 TAP THE HEARTS TO CHEER', 2.6); },
    tick(dt) { J.nt -= dt; if (J.nt <= 0 && J.t < J.len) { J.nt = 0.42; const f = MEL[J.ni++ % MEL.length]; tone(f, 0.035, 0.38, 'triangle'); if (J.ni % 2) tone(f / 2, 0.02, 0.5, 'sine'); }
      J.ht -= dt; if (J.ht <= 0 && J.t < J.len - 1.5) { J.ht = rnd(0.55, 0.95); const sp = own(new THREE.Sprite(new THREE.SpriteMaterial({ map: heartT, depthTest: false }))); const s = touch ? 0.55 : 0.42; sp.scale.set(s, s, 1); sp.renderOrder = 6; sp.position.set(SG.x + rnd(-2.2, 2.2), SY + 1.2, SG.z - rnd(0.6, 1.6)); J.h.push({ sp, vy: rnd(0.45, 0.7), live: true }); }
      for (const q of J.h) { if (!q.live) continue; q.sp.position.y += q.vy * dt; q.sp.position.x += Math.sin(J.t * 2 + q.vy * 9) * dt * 0.3; if (q.sp.position.y > SY + 4.0) { q.live = false; q.sp.visible = false; } }
      if (J.t >= J.len && !J.pause) { ding(); NEXT(finishGame, 0.6); } },
    press() { let b = null, bd = TAPR() * 1.5; for (const q of J.h) { if (!q.live) continue; const d = dist(scrW(q.sp.position)); if (d < bd) { bd = d; b = q; } } if (!b) return; b.live = false; b.sp.visible = false; J.cheer++; pop(); if (J.cheer % 5 === 0) tone(1046, 0.04, 0.4, 'sine'); },
    card() { return ['TAP THE HEARTS', lab('CHEERS ' + J.cheer + ' \u00b7 ' + Math.max(0, Math.ceil(J.len - J.t)) + ' S'), J.cheer + '_' + Math.ceil(J.len - J.t)]; },
    hint() { const q = J.h.find(x => x.live); return q ? [q.sp.position.clone(), 'TAP'] : null; },
    shot() { return [V(SG.x, SY + 1.7, SG.z - 0.6), 5.2, 3.6, 0.1, 3.4, Math.PI, 7]; },
    result() { const b = st('ShowBest', 0); if (J.cheer > b) set('ShowBest', J.cheer); return J.cheer >= 15 ? 'VELVET BLOWS YOU A KISS \u00b7 ' + J.cheer + ' CHEERS' : J.cheer + ' CHEERS \u00b7 VELVET TAKES A BOW'; },
    end() {} };
  // ================= JACKPOT WALL (south wall, west end) + golden 8 =================
  const JWG = new THREE.Group(); JWG.position.set(-145.2, 3.3, 31.42); JWG.rotation.y = Math.PI; G.add(JWG); box(JWG, 2.76, 1.86, 0.05, GOLD, 0, 0, 0.0);
  const jwT = CT(768, 512, () => {}); { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.73), new THREE.MeshBasicMaterial({ map: jwT })); m.position.z = 0.03; JWG.add(m); } box(JWG, 2.6, 0.05, 0.3, GOLD, 0, -1.0, 0.15);
  const G8 = new THREE.Group(); G8.position.set(0.9, -0.97, 0.16); JWG.add(G8); cyl(G8, 0.1, 0.12, 0.08, INK, 0, 0.04, 0, 10); for (const [r, y, t] of [[0.09, 0.2, 0.05], [0.075, 0.37, 0.05]]) { const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 18), new THREE.MeshPhongMaterial({ color: '#e6b45a', shininess: 90 })); m.position.y = y; G8.add(m); } G8.visible = false;
  let jwKey = '';
  function drawWall() { const L2 = JW(), nm = !!st('Wall', false), gt = !!st('Gold', false), k = JSON.stringify(L2) + nm + gt + name(); if (k === jwKey) return; jwKey = k; const c = jwT.userData.c.getContext('2d'), w = 768, h = 512;
    c.fillStyle = '#05080f'; c.fillRect(0, 0, w, h); c.fillStyle = RED; c.fillRect(0, 0, w, 76); c.fillStyle = '#ffffff'; c.textBaseline = 'middle'; fitTxt(c, 'JACKPOT WALL', 24, 40, 460, 46);
    c.fillStyle = YEL; fitTxt(c, 'STAFF OF THE FLOOR', 24, 116, 400, 24, 800); c.fillStyle = nm ? '#ffffff' : '#4a4a55'; fitTxt(c, nm ? name() : '8 JOBS FOR STERLING', 24, 160, 500, 42);
    c.fillStyle = '#ffd23a'; c.fillRect(24, 196, w - 48, 3); c.fillStyle = YEL; fitTxt(c, 'BIG WINS', 24, 228, 300, 24, 800);
    const list = L2.length ? L2 : [{ n: 'MADAME OPAL', g: 500 }, { n: 'BIG LOU', g: 500 }]; list.slice(0, 5).forEach((e, i) => { const y = 270 + i * 46; c.fillStyle = '#ffffff'; fitTxt(c, (i + 1) + '. ' + e.n, 24, y, 460, 30, 800); c.textAlign = 'right'; c.fillStyle = YEL; fitTxt(c, e.g + ' G', w - 24, y, 200, 30); c.textAlign = 'left'; });
    jwT.needsUpdate = true; G8.visible = gt; }
  drawWall();
  // ================= prizes =================
  const VEST = { outfit: 'vest', torso: ['#201e1d', '#f3f2f2', '#7a2a3a'], name: 'DEALER VEST' };
  const vestOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === VEST.name); };
  let worn = null;
  function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.body) return; const on = vestOn(); if (worn && worn.on === on && worn.fox === fox && (!worn.m || worn.m.parent === P.body)) return;
    if (worn && worn.m && worn.m.parent) worn.m.parent.remove(worn.m); worn = { on, fox, m: null }; if (!on) return; const g = new THREE.Group(); for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 4), LM(RED)); t.rotation.z = s * Math.PI / 2; t.position.set(s * 0.06, 0.86, 0.3); g.add(t); } { const k = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), LM(RED)); k.position.set(0, 0.86, 0.31); g.add(k); } P.body.add(g); worn.m = g; }
  const LINES = { vest: ['Dealer vest and bow tie. You look like the house now.', 'DEALER VEST + BOW TIE'], dice: ['Lucky dice. Keep them close. The reels like them.', 'LUCKY DICE CHARM'],
    vip: ['A VIP card. Show Max. The high-roller lounge is yours.', 'VIP CARD'], wall: ['Staff of the floor. Your name is on the Jackpot Wall.', 'NAME ON THE JACKPOT WALL'], gold: ['Every job on my floor. The golden 8, and 150 gold.', 'GOLDEN 8 + 150 GOLD'] };
  function gift() { const nd = nDone();
    if (!st('Vest', false)) { set('Vest', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === VEST.name)) save.setStat('tailorOutfits', [...list, VEST]); save.setOutfit && save.setOutfit(VEST); wear && wear(VEST); return 'vest'; }
    if (nd >= 3 && !st('Dice', false)) { set('Dice', true); save.give && save.give('luckyDice'); return 'dice'; }
    if (nd >= 5 && !st('Vip', false)) { set('Vip', true); save.give && save.give('vipCard'); return 'vip'; }
    if (nd >= 7 && !st('Wall', false)) { set('Wall', true); drawWall(); return 'wall'; }
    if (nd >= GAMES.length && !st('Gold', false)) { set('Gold', true); save.give && save.give('golden8'); save.addGold(150); drawWall(); return 'gold'; } return null; }
  function perks() { const have = ['DEALER VEST', 'LUCKY DICE', 'VIP CARD', 'JACKPOT WALL', 'GOLDEN 8'].filter((n, i) => [st('Vest', false), st('Dice', false), vip(), st('Wall', false), st('Gold', false)][i]);
    sayTo(kT, [ln(have.length ? 'Yours so far: ' + have.join(', ').toLowerCase() + '.' : 'Work my floor and the perks come. Vest first.')]); }
  // ================= keepers at work =================
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.14), LM('#0d2236')); { const A = boss.userData && boss.userData.P && boss.userData.P.arms; if (A && A[0]) { deck.position.set(0, -0.5, 0.08); A[0].add(deck); } }
  const chipStack = new THREE.Group(); { const [x, z] = toWo(CA, -0.9, -0.25); chipStack.position.set(x, 1.165, z); G.add(chipStack); for (let k = 0; k < 10; k++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12), LM([RED, '#2f6fd6', '#1f8a4c', WHITE][k % 4])); m.position.y = 0.01 + k * 0.021; m.visible = false; chipStack.add(m); } }
  let wk = 0;
  function keepers(dt, P, busy) { wk += dt; const BA = boss.userData && boss.userData.P && boss.userData.P.arms, CAr = cash.userData && cash.userData.P && cash.userData.P.arms;
    const db = Math.hypot(P.x - boss.position.x, P.z - boss.position.z); deck.visible = db >= 3 || busy;
    if (BA && BA[0] && BA[1] && (db >= 3 || busy)) { const s = Math.sin(wk * 7); BA[0].rotation.x = -1.1 + s * 0.12; BA[1].rotation.x = -1.1 - s * 0.12; BA[0].rotation.z = 0.35; BA[1].rotation.z = -0.35; }
    const dc = Math.hypot(P.x - cash.position.x, P.z - cash.position.z), n = Math.floor(wk / 0.6) % 12; chipStack.children.forEach((m, i) => { m.visible = i < Math.min(10, n); });
    if (CAr && CAr[1] && dc >= 3.2 && !(busy && J.g === 'cage')) { const k = (wk / 0.6) % 1; CAr[1].rotation.x = -1.0 - Math.sin(k * Math.PI) * 0.35; } }
  // ================= places =================
  const RINGS = { pull: toWo(M1.o, 0, 1.75), pullvip: toWo(M2.o, 0, 1.6), show: [-112, 26.6] };
  function prompt(P) { if (nearMax(P)) return vip() ? 'MAX \u00b7 "GO ON IN."' : 'TALK \u00b7 MAX'; return null; }
  function talk(P) { if (!nearMax(P)) return false; sayTo(mT, [lnM(vip() ? 'Card checks out. Enjoy the lounge.' : 'High rollers only. Sterling gives the cards to his best staff.')]); return true; }
  let lastIn = false;
  function tick(dt, P, fox, s) { applyWear(fox); gate(P, dt); keepers(dt, P, s.busy); const t = performance.now() / 1000;
    const want = vip() ? MAXOUT : MAXIN; MAX.position.x += (want[0] - MAX.position.x) * Math.min(1, dt * 3); MAX.position.z += (want[1] - MAX.position.z) * Math.min(1, dt * 3); kit.animFox(MAX, dt, 0, false);
    const on = night() || (J.g === 'show'); VEL.visible = on; CONE.visible = on; if (on) { kit.animFox(VEL, dt, 0, false); VEL.rotation.z = Math.sin(t * 2.2) * 0.06; coneM.color.setHSL((t * 0.05) % 1, 0.6, 0.75); }
    if (s.inShop !== lastIn) { lastIn = s.inShop; if (s.inShop) drawWall(); } }
  return { GD: { pull: pullGame(M1), pullvip: pullGame(M2), show: SHOW }, RINGS, fun: funGames(), tips: ['Three 8s on the Lucky 8 rings the bells.', 'Velvet sings from six. Cheer loud.'], gift, line: k => LINES[k], perks, tick, prompt, talk, luck: () => !!st('Dice', false), vip, drawWall, M1, M2 };
}
