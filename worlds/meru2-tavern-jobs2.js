// MERU 2.0 — s88 TAVERN DELUXE PART B: the other 5 jobs, plugged into worlds/meru2-tavern-jobs.js (same old frame, same J / card / camera).
// CHANGE THE KEG (walk, cellar: unhook the empty → empties pallet → a MERU AMBER keg (never the LUXOR one) → hook it up)
// · RESTOCK THE TOP SHELF (tap a bottle in the crate, tap the slot with its colour tag) · CALM THE TAVERN REGULAR (walk + choices: someone changed his song;
// the 2D game's lines "HEY — who changed my song?!!!" / "You need to learn some MANNERS!" / the apology) · KEEP SCORE AT THE DARTS (Flick's board: 3 darts land,
// tap the right total, 4 rounds) · CATCH THE CELLAR RATS (tap 6 rats into the cage, never MOUSER the cellar cat).
// Cellar meshes draw early (renderOrder -2) like worlds/meru2-cellar.js so the tavern floor never paints over them.
const SEG = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
export const gamesB = () => [{ k: 'restock', name: 'Restock the Shelf', color: '#3f9a5e', grp: 'bar' }, { k: 'rowdy', name: 'Calm the Regular', color: '#52525b', walk: true, grp: 'bar' },
  { k: 'keg', name: 'Change the Keg', color: '#c9a227', walk: true, grp: 'back' }, { k: 'darts', name: 'Keep Score at Darts', color: '#ec3013', grp: 'back' }, { k: 'rats', name: 'Catch the Cellar Rats', color: '#6b6258', grp: 'back' }];
export function tavJobsB(X) {
  const { THREE, G, L, RAD, toWo, V, box, cyl, LM, CT, label, plane, kit, cols, ring, own, fly, miss, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, coin, clack, thud, lst, lab, row, tagSprite, TAPR, scrW, dist, sayTo, KEEP, clamp, rnd, shuffle, touch, tav, J } = X;
  const INK = '#201e1d', YEL = '#ffd23a', WHITE = '#f3f2f2', RED = '#ec3013', CY = -3.2;
  const early = o => { o.traverse(m => { if (m.isMesh) m.renderOrder = -2; }); return o; };
  const RINGS = {}, GD = {};
  const paintRing = (x, z, y) => { const a = cyl(G, 0.5, 0.5, 0.012, YEL, x, y + 0.085, z, 22), b = cyl(G, 0.42, 0.42, 0.014, INK, x, y + 0.087, z, 22); if (y < -1) { early(a); early(b); } else a.renderOrder = b.renderOrder = 1; };
  // ================= CHANGE THE KEG (walk, cellar) =================
  const CPL = [48.6, -99.25], CPLE = [48.6, -97.9], EMP = [50.7, -97.3], KEGS = [];
  const kegMesh = (lux, par, x, z, y = CY) => { const g = new THREE.Group(); g.position.set(x, y, z); par.add(g); cyl(g, 0.3, 0.3, 0.62, '#9aa0a6', 0, 0.31, 0, 14); for (const yy of [0.08, 0.54]) cyl(g, 0.31, 0.31, 0.04, '#5c6670', 0, yy, 0, 14); cyl(g, 0.305, 0.305, 0.14, lux ? RED : '#c9a227', 0, 0.31, 0, 14); cyl(g, 0.06, 0.06, 0.05, INK, 0, 0.64, 0, 8); return g; };
  { const cp = new THREE.Group(); G.add(cp); box(cp, 1.1, 1.2, 0.08, '#5c6670', CPL[0], CY + 1.4, CPL[1]); cyl(cp, 0.14, 0.14, 0.7, '#2f6fd6', CPL[0] + 0.7, CY + 0.35, CPL[1] + 0.15, 10); box(cp, 0.05, 0.05, 0.7, INK, CPL[0], CY + 0.95, CPL[1] + 0.4);
    const pl = plane(cp, label('AMBER LINE', INK, YEL, 256, 64), 0.8, 0.2, CPL[0], CY + 1.75, CPL[1] + 0.05); pl.renderOrder = -2; early(cp); cols.push({ f: [CPL[0] - 0.6, CPL[0] + 0.9, CPL[1] - 0.1, CPL[1] + 0.3], y0: CY - 1, y1: -0.8 });
    const pal = new THREE.Group(); G.add(pal); box(pal, 1.2, 0.14, 1.0, '#8a6a46', EMP[0], CY + 0.07, EMP[1]); kegMesh(false, pal, EMP[0] - 0.3, EMP[1], CY + 0.14); const ep = plane(pal, label('EMPTIES', INK, WHITE, 256, 64), 0.6, 0.15, EMP[0], CY + 0.95, EMP[1] - 0.52); ep.rotation.y = 0; early(pal); cols.push({ c: [EMP[0], EMP[1], 0.65], y0: CY - 1, y1: -0.8 }); }
  const lux = shuffle([false, true, false, true]); lux.forEach((l, i) => { const x = 35 + i * 1.1, z = -98.3, g = kegMesh(l, G, x, z); const t = plane(g, label(l ? 'LUXOR' : 'MERU AMBER', INK, l ? RED : YEL, 256, 64), 0.5, 0.125, 0, 0.9, 0.31); t.renderOrder = -2; early(g); cols.push({ c: [x, z, 0.33], y0: CY - 1, y1: -0.8 }); KEGS.push({ g, x, z, lux: l }); });
  const onKeg = new THREE.Group(); G.add(onKeg); { const k = kegMesh(false, onKeg, CPL[0], CPL[1] + 0.55); onKeg.userData.k = k; } early(onKeg);
  const CARRY = new THREE.Group(); { const k = kegMesh(false, CARRY, 0, 0, 0); CARRY.userData.band = k.children[3]; } CARRY.visible = false; G.add(CARRY); early(CARRY);
  const near = (P, p, r = 1.4) => Math.hypot(P.x - p[0], P.z - p[1]) < r && (P.y || 0) < -1.5;
  RINGS.keg = [47.0, -96.4, CY]; paintRing(47.0, -96.4, CY);
  GD.keg = { walk: true,
    begin() { J.st = 0; onKeg.visible = true; toast('THE AMBER TAP IS DRY \u00b7 DOWN THE CELLAR STAIRS', 2.8); pop(); },
    tick() { const P = J.P; if (!P) return; CARRY.visible = J.st === 1 || J.st === 3; if (CARRY.visible) { const yw = P.yaw || 0; CARRY.position.set(P.x + Math.sin(yw) * 0.45, (P.y || 0) + 0.55, P.z + Math.cos(yw) * 0.45); CARRY.rotation.y = yw; CARRY.userData.band.material = LM(J.st === 1 ? '#5c6670' : '#c9a227'); } },
    goal() { const P = J.P; if ((P.y || 0) > -1.5) return [43.5, -98.2, 0.2]; return J.st === 0 || J.st === 3 ? [CPLE[0], CPLE[1], CY] : J.st === 1 ? [EMP[0], EMP[1], CY] : null; },
    nearK(P) { let b = null, bd = 1.2; for (const k of KEGS) { if (!k.g.visible) continue; const d = Math.hypot(P.x - k.x, P.z - (k.z + 0.7)); if (d < bd && (P.y || 0) < -1.5) { bd = d; b = k; } } return b; },
    prompt(P) { if ((J.st === 0 || J.st === 3) && near(P, CPLE)) return J.st ? 'HOOK UP \u00b7 THE NEW KEG' : 'UNHOOK \u00b7 THE EMPTY KEG'; if (J.st === 1 && near(P, EMP, 1.6)) return 'DROP \u00b7 ON THE EMPTIES'; if (J.st === 2) { const k = this.nearK(P); if (k) return 'TAKE \u00b7 ' + (k.lux ? 'LUXOR' : 'MERU AMBER'); } return null; },
    talk(P) { if (J.st === 0 && near(P, CPLE)) { J.st = 1; onKeg.visible = false; tone(300, 0.05, 0.3, 'square'); noise(0.3, 0.03, 2000); toast('EMPTY \u00b7 TO THE EMPTIES PALLET', 1.6); return true; }
      if (J.st === 1 && near(P, EMP, 1.6)) { J.st = 2; thud(); toast('NOW A FULL KEG \u00b7 THE RIGHT ONE', 1.6); return true; }
      if (J.st === 2) { const k = this.nearK(P); if (k) { if (k.lux) { miss('"ANYONE OFFERING YOU THE LUXOR STUFF IS NO FRIEND."', 2.4); return true; } J.st = 3; k.g.visible = false; J.took = k; thud(); toast('TO THE AMBER LINE', 1.4); return true; } }
      if (J.st === 3 && near(P, CPLE)) { J.st = 4; onKeg.visible = true; noise(0.6, 0.04, 1200); tone(880, 0.04, 0.3); addGold(14); ding(); toast('HSSS \u00b7 THE AMBER FLOWS', 1.8); NEXT(finishGame, 0.8); return true; } return false; },
    card() { const S = ['UNHOOK THE EMPTY', 'TO THE EMPTIES PALLET', 'TAKE A MERU AMBER KEG', 'HOOK IT UP', 'DONE']; return [S[J.st], lst(S.slice(0, 4).map((s, i) => [i === 2 ? '#c9a227' : '#5c6670', (i + 1) + ' ' + s, i < J.st ? '\u2713' : '', i < J.st])), 'k' + J.st]; },
    end() { CARRY.visible = false; onKeg.visible = true; KEGS.forEach(k => { k.g.visible = true; }); } };
  // ================= RESTOCK THE TOP SHELF (tap, tap) =================
  const SH = L.shelves || { x: 30, z: -99.3, a: 0 }, SHY = 3.3, BOT = [['#3f9a5e', 'GREEN'], ['#c42d3c', 'RED'], ['#e0a84a', 'GOLD'], ['#38bdf8', 'BLUE']];
  const shelfAt = (lx, lz, y) => { const [x, z] = toWo(SH, lx, lz); return V(x, y, z); };
  const bottleGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.44, 10), neckGeo = new THREE.CylinderGeometry(0.025, 0.04, 0.16, 8);
  const mkBottle = c => { const g = new THREE.Group(); const b = new THREE.Mesh(bottleGeo, LM(c)); b.position.y = 0.22; g.add(b); const n = new THREE.Mesh(neckGeo, LM(c)); n.position.y = 0.52; g.add(n); const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.01), LM(WHITE)); l.position.set(0, 0.22, 0.085); g.add(l); return g; };
  const LADDER = new THREE.Group(); LADDER.visible = false; G.add(LADDER); { const [x, z] = toWo(SH, 4.0, 0.9); LADDER.position.set(x, 0, z); LADDER.rotation.y = RAD(SH.a); for (const s of [-1, 1]) { const r = box(LADDER, 0.06, 3.4, 0.06, '#8a6440', s * 0.25, 1.7, 0); r.rotation.x = -0.18; } for (let i = 0; i < 8; i++) box(LADDER, 0.5, 0.04, 0.05, '#8a6440', 0, 0.3 + i * 0.4, -(0.3 + i * 0.4 - 1.7) * 0.18); }
  RINGS.restock = [...toWo(L.bar, -9, 2.6)]; paintRing(RINGS.restock[0], RINGS.restock[1], 0);
  GD.restock = {
    begin() { const cs = shuffle([0, 0, 1, 1, 2, 2, 3, 3]); J.slots = shuffle([0, 0, 1, 1, 2, 2, 3, 3]).map((c, i) => { const p = shelfAt(-2.1 + i * 0.6, -0.22, SHY); const t = own(new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.12), new THREE.MeshBasicMaterial({ color: BOT[c][0] }))); t.position.copy(shelfAt(-2.1 + i * 0.6, 0.01, SHY - 0.08)); t.rotation.y = RAD(SH.a); return { c, p, full: false }; });
      const crate = own(new THREE.Group()); crate.position.copy(shelfAt(3.1, -0.25, SHY)); crate.rotation.y = RAD(SH.a); box(crate, 0.9, 0.22, 0.5, '#9a7550', 0, 0.11, 0);
      J.bots = cs.map((c, i) => { const m = own(mkBottle(BOT[c][0])); m.position.copy(shelfAt(2.8 + (i % 4) * 0.2, -0.35 + (i / 4 | 0) * 0.2, SHY + 0.05)); m.rotation.y = RAD(SH.a); return { c, m, in: false }; }); J.held = null; LADDER.visible = true;
      toast('TAP A BOTTLE \u00b7 THEN THE SLOT WITH ITS COLOUR', 2.6); },
    press() { if (J.flies.length) return; if (!J.held) { let b = null, bd = TAPR() * 1.3; for (const q of J.bots) { if (q.in) continue; const d = dist(scrW(q.m.position.clone().setY(q.m.position.y + 0.25))); if (d < bd) { bd = d; b = q; } } if (b) { J.held = b; fly(b.m, b.m.position.clone().setY(SHY + 0.35), 0.15, 0, null); clack(); } return; }
      let s = null, bd = TAPR() * 1.4; for (const q of J.slots) { if (q.full) continue; const d = dist(scrW(q.p.clone().setY(SHY + 0.2))); if (d < bd) { bd = d; s = q; } }
      if (!s) { let b = null, bd2 = TAPR(); for (const q of J.bots) { if (q.in || q === J.held) continue; const d = dist(scrW(q.m.position.clone().setY(q.m.position.y + 0.25))); if (d < bd2) { bd2 = d; b = q; } } if (b) { const h = J.held; fly(h.m, h.m.position.clone().setY(SHY + 0.05), 0.15, 0, null); J.held = b; fly(b.m, b.m.position.clone().setY(SHY + 0.35), 0.15, 0, null); } return; }
      const h = J.held; if (s.c !== h.c) { miss('THAT SLOT IS ' + BOT[s.c][1] + ' \u00b7 THIS BOTTLE IS ' + BOT[h.c][1], 1.8); return; }
      s.full = true; h.in = true; J.held = null; fly(h.m, s.p, 0.3, 0.15, () => clack()); addGold(2); if (J.slots.every(q => q.full)) { ding(); addGold(4); NEXT(finishGame, 1.0); } },
    card() { const n = J.slots.filter(q => q.full).length; return [J.held ? 'TAP THE ' + BOT[J.held.c][1] + ' SLOT' : 'TAP A BOTTLE IN THE CRATE', lab(n + ' / 8 ON THE SHELF') + lst(BOT.map((b, i) => [b[0], b[1], J.slots.filter(q => q.c === i && q.full).length + '/2', J.slots.filter(q => q.c === i).every(q => q.full)])), 'r' + n + (J.held ? J.held.c : '')]; },
    hint() { if (!J.held) { const b = J.bots.find(q => !q.in); return b ? [b.m.position.clone().setY(b.m.position.y + 0.25), 'TAP'] : null; } const s = J.slots.find(q => !q.full && q.c === J.held.c); return s ? [s.p.clone().setY(SHY + 0.1), 'HERE'] : null; },
    shot() { return [shelfAt(0.4, 0, SHY + 0.2), 6.4, 1.4, 0.24, 3.0, RAD(SH.a), 9.5]; },
    end() { LADDER.visible = false; } };
  // ================= CALM THE TAVERN REGULAR (walk + choices) =================
  const JB = L.jukebox || { x: 51.05, z: -68, a: 270 }, [rx, rz] = toWo(JB, -1.6, 2.2);
  const REG = kit.makeFox({ key: 'tvRegular', torso: ['#52525b', '#27272a', '#09090b'], outfit: 'armor', mood: 'angry' }); REG.position.set(rx, 0, rz); REG.visible = false; G.add(REG);
  const rT = { key: 'tvRegular', name: 'Tavern Regular', role: 'PATRON', obj: REG, ry: 0, r: 6 }, rl = text => ({ who: 'tvRegular', role: 'PATRON', text });
  RINGS.rowdy = [...toWo(JB, 2.2, 2.6)]; paintRing(RINGS.rowdy[0], RINGS.rowdy[1], 0);
  const ROUNDS = [
    ['HEY \u2014 who changed my song?!!!', ["I'll put your song back on.", 'Nobody likes your song.', 'Maybe a ghost did it.']],
    ['Somebody bumped my table too. Spilled half my Amber!', ['Barkeep, one Amber on me.', 'Drink slower, then.', 'Arm wrestle you for it?']],
    ['...Fine. But it is MY night.', ['It is. Sit down and enjoy it.', 'Calm down, grumpy.', 'Sing along with me!']]];
  GD.rowdy = { walk: true,
    begin() { J.r = 0; J.talking = false; REG.visible = true; toast('THE REGULAR IS SHOUTING BY THE JUKEBOX \u00b7 GO CALM HIM', 2.8); tone(180, 0.06, 0.3, 'sawtooth'); },
    tick(dt) { const P = J.P; kit.animFox(REG, dt, 0, false); if (P) REG.rotation.y = Math.atan2(P.x - REG.position.x, P.z - REG.position.z); if (J.r < 3 && !J.talking) REG.position.y = Math.abs(Math.sin(J.t * 7)) * 0.08; else REG.position.y = 0; },
    goal() { return J.talking || J.r >= 3 ? null : [REG.position.x, REG.position.z, 0]; },
    prompt(P) { return Math.hypot(P.x - REG.position.x, P.z - REG.position.z) < 2.4 && J.r < 3 ? 'TALK \u00b7 TAVERN REGULAR' : null; },
    ask() { const [line, opts] = ROUNDS[J.r], order = shuffle([0, 1, 2]); J.talking = true; rT.ry = REG.rotation.y;
      sayTo(rT, [{ ...rl(line), choices: order.map(i => ({ text: opts[i].toUpperCase(), pick: () => { if (!J) return; J.talking = false; if (i !== 0) { miss('THAT MADE IT WORSE', 1.4); setTimeout(() => { if (J && J.g === 'rowdy') { J.talking = true; sayTo(rT, [{ ...rl('You need to learn some MANNERS!'), choices: [{ text: 'TRY AGAIN', pick: () => { if (J) this.ask(); } }] }]); } }, 50); return; }
        J.r++; coin(); addGold(4); if (J.r === 1 && tav.jukebox && tav.jukebox.play) try { tav.jukebox.play(0); } catch (e) {}
        if (J.r >= 3) { setTimeout(() => { if (!J) return; sayTo(rT, [rl("I'm sorry everyone. I am the one that needed to learn manners.")]); ding(); NEXT(finishGame, 2.5); }, 50); } else setTimeout(() => { if (J) this.ask(); }, 50); } })) }]); },
    talk(P) { if (J.r < 3 && Math.hypot(P.x - REG.position.x, P.z - REG.position.z) < 2.4) { this.ask(); return true; } return false; },
    card() { return [J.r >= 3 ? 'ALL CALM' : 'TALK TO HIM \u00b7 PICK THE KIND ANSWER', lst(['HIS SONG', 'HIS DRINK', 'HIS NIGHT'].map((t, i) => ['#52525b', t, i < J.r ? '\u2713' : '', i < J.r])), 'w' + J.r]; },
    end() { REG.visible = false; REG.position.y = 0; } };
  // ================= KEEP SCORE AT THE DARTS (tap) =================
  const DB = L.darts2 || { x: 51.5, z: -80, a: 270 }, DA = RAD(DB.a), FX = Math.sin(DA), FZ = Math.cos(DA), RX = Math.cos(DA), RZ = -Math.sin(DA), DR = 0.5, DY = 2.0;
  const onBoard = (u, v, d = 0.06) => V(DB.x + FX * d + RX * u, DY + v, DB.z + FZ * d + RZ * u);
  const dartGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.16, 5);
  const mkDart = () => { const g = new THREE.Group(); const s = new THREE.Mesh(dartGeo, LM('#c0c4cc')); s.rotation.x = Math.PI / 2; g.add(s); const f = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.005), LM(RED)); f.position.z = 0.08; g.add(f); g.rotation.y = DA; return g; };
  RINGS.darts = [...toWo(DB, 1.6, 3.2)]; paintRing(RINGS.darts[0], RINGS.darts[1], 0);
  const throwOne = () => { const k = Math.random(); if (k < 0.07) return { s: 50, t: 'BULL', r: 0.01, i: 0 }; if (k < 0.15) return { s: 25, t: 'OUTER BULL', r: 0.07, i: 0 }; const i = (Math.random() * 20) | 0, n = SEG[i]; if (k < 0.3) return { s: n * 3, t: 'TREBLE ' + n, r: 0.6, i }; if (k < 0.4) return { s: n * 2, t: 'DOUBLE ' + n, r: 0.97, i }; return { s: n, t: String(n), r: 0.78, i }; };
  GD.darts = {
    begin() { J.round = 0; J.ok = 0; this.deal(); toast('FLICK THROWS \u00b7 TAP HIS SCORE', 2.4); },
    deal() { (J.dm || []).forEach(m => m.parent && m.parent.remove(m)); (J.tg || []).forEach(m => m.parent && m.parent.remove(m)); J.th = [throwOne(), throwOne(), throwOne()]; J.total = J.th.reduce((a, b) => a + b.s, 0); J.dm = []; J.shown = 0; J.tg = [];
      J.th.forEach((d, n) => setTimeout(() => { if (!J || J.g !== 'darts') return; const a = d.i / 20 * Math.PI * 2 + rnd(-0.12, 0.12), r = d.r * DR, m = own(mkDart()); m.position.copy(onBoard(Math.sin(a) * r, Math.cos(a) * r)); J.dm.push(m); J.shown++; tone(1200, 0.04, 0.06, 'square'); if (J.shown === 3) this.choices(); }, 350 + n * 450)); },
    choices() { const set = new Set([J.total]); while (set.size < 3) { const d = [-20, -10, -5, 5, 10, 15, 20][(Math.random() * 7) | 0]; if (J.total + d > 0) set.add(J.total + d); } J.opts = shuffle([...set]);
      J.tg = J.opts.map((v, i) => { const t = own(tagSprite(String(v), WHITE, INK, 0.62)); t.position.copy(onBoard(DR + 0.55, 0.45 - i * 0.42, 0.3)); t.userData.v = v; return t; }); },
    press() { if (!J.tg || !J.tg.length) return; let b = null, bd = TAPR() * 1.3; for (const t of J.tg) { const d = dist(scrW(t.position)); if (d < bd) { bd = d; b = t; } } if (!b) return;
      if (b.userData.v !== J.total) { miss('NOT ' + b.userData.v + ' \u00b7 ADD THEM AGAIN', 1.6); b.visible = false; return; }
      J.ok++; coin(); addGold(4); toast(J.th.map(d => d.t).join(' + ') + ' = ' + J.total, 2); J.tg.forEach(t => t.parent && t.parent.remove(t)); J.tg = []; J.round++;
      if (J.round >= 4) { ding(); NEXT(finishGame, 1.4); } else NEXT(() => this.deal(), 1.3); },
    card() { const th = J.th || []; return [J.tg && J.tg.length ? 'TAP THE TOTAL' : 'WATCH THE DARTS', lab('ROUND ' + Math.min(4, J.round + 1) + ' / 4') + lst(th.slice(0, J.shown || 0).map((d, i) => [RED, 'DART ' + (i + 1), d.t, false])), 'd' + J.round + '_' + (J.shown || 0) + (J.tg ? J.tg.length : 0)]; },
    hint() { const t = J.tg && J.tg.find(q => q.userData.v === J.total); return t ? [t.position.clone(), 'ADD THEM UP'] : null; },
    shot() { return [onBoard(0.35, -0.05, 0), 2.2, 1.6, 0.12, 2.2, DA, 4.5]; },
    end() {} };
  // ================= CATCH THE CELLAR RATS (tap) =================
  const RR = { x0: 34.8, x1: 41.4, z0: -96.6, z1: -93.9 }, CAGE = [41.2, -96.9];
  const ratGeo = new THREE.SphereGeometry(0.1, 8, 6), tailGeo = new THREE.CylinderGeometry(0.008, 0.004, 0.22, 4);
  const mkRat = (cat) => { const g = new THREE.Group(); const c = cat ? '#e0823a' : '#6b6258'; const b = new THREE.Mesh(ratGeo, LM(c)); b.scale.set(cat ? 1.5 : 0.9, cat ? 1.4 : 0.75, cat ? 2.4 : 1.6); b.position.y = cat ? 0.17 : 0.08; g.add(b);
    const h = new THREE.Mesh(new THREE.SphereGeometry(cat ? 0.11 : 0.06, 8, 6), LM(c)); h.position.set(0, cat ? 0.3 : 0.1, cat ? 0.26 : 0.17); g.add(h); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(cat ? 0.04 : 0.03, cat ? 0.08 : 0.04, 4), LM(cat ? '#c06a2a' : '#d9a0a0')); e.position.set(s * (cat ? 0.06 : 0.035), cat ? 0.41 : 0.15, cat ? 0.25 : 0.16); g.add(e); }
    const t = new THREE.Mesh(tailGeo, LM(cat ? '#e0823a' : '#d9a0a0')); t.rotation.x = cat ? -0.6 : Math.PI / 2 - 0.2; t.position.set(0, cat ? 0.32 : 0.06, cat ? -0.32 : -0.26); if (cat) t.scale.set(4, 1.6, 4); g.add(t); return early(g); };
  const CG = new THREE.Group(); CG.position.set(CAGE[0], CY, CAGE[1]); G.add(CG); { for (let i = 0; i < 6; i++) box(CG, 0.02, 0.4, 0.02, '#9aa0a6', -0.3 + i * 0.12, 0.2, 0.2); for (let i = 0; i < 6; i++) box(CG, 0.02, 0.4, 0.02, '#9aa0a6', -0.3 + i * 0.12, 0.2, -0.2); box(CG, 0.66, 0.03, 0.44, '#5c6670', 0, 0.4, 0); box(CG, 0.66, 0.03, 0.44, '#5c6670', 0, 0.01, 0); } early(CG); CG.visible = false;
  RINGS.rats = [44.6, -95.2, CY]; paintRing(44.6, -95.2, CY);
  const roam = (q, dt, sp) => { q.cd -= dt; if (q.cd <= 0) { q.cd = rnd(0.5, 1.4); q.h = rnd(0, Math.PI * 2); } const nx = q.m.position.x + Math.sin(q.h) * sp * dt, nz = q.m.position.z + Math.cos(q.h) * sp * dt;
    if (nx < RR.x0 || nx > RR.x1) q.h = -q.h; else q.m.position.x = nx; if (nz < RR.z0 || nz > RR.z1) q.h = Math.PI - q.h; else q.m.position.z = nz; q.m.rotation.y += (Math.atan2(Math.sin(q.h - q.m.rotation.y), Math.cos(q.h - q.m.rotation.y))) * Math.min(1, dt * 10); };
  GD.rats = {
    begin() { CG.visible = true; J.rats = [...Array(6)].map(() => { const m = own(mkRat(false)); m.position.set(rnd(RR.x0, RR.x1), CY, rnd(RR.z0, RR.z1)); return { m, h: rnd(0, 6.3), cd: 0, got: false }; });
      const cm = own(mkRat(true)); cm.position.set((RR.x0 + RR.x1) / 2, CY, (RR.z0 + RR.z1) / 2); J.cat = { m: cm, h: 0, cd: 0 }; J.cd = 0; toast('TAP THE RATS INTO THE CAGE \u00b7 NOT MOUSER THE CAT', 2.8); },
    tick(dt) { const sp = touch ? 1.0 : 1.3; for (const q of J.rats) if (!q.got) roam(q, dt, sp); roam(J.cat, dt, 0.4); J.cd -= dt; if ((J.sq = (J.sq || 0) - dt) <= 0) { J.sq = rnd(0.6, 1.6); tone(2600 + Math.random() * 800, 0.012, 0.06, 'triangle'); } },
    press() { const cs = dist(scrW(J.cat.m.position.clone().setY(CY + 0.2))); let b = null, bd = TAPR() * 1.25; for (const q of J.rats) { if (q.got) continue; const d = dist(scrW(q.m.position.clone().setY(CY + 0.08))); if (d < bd) { bd = d; b = q; } }
      if (cs < Math.min(bd, TAPR()) && J.cd <= 0) { J.cd = 1.2; miss('NOT MOUSER! SHE IS ON YOUR SIDE.', 1.6); tone(700, 0.05, 0.3, 'sawtooth'); return; } if (!b) return;
      b.got = true; tone(3200, 0.03, 0.1, 'triangle'); fly(b.m, V(CAGE[0] + rnd(-0.2, 0.2), CY + 0.05, CAGE[1] + rnd(-0.1, 0.1)), 0.35, 0.4, () => pop()); addGold(3); if (J.rats.every(q => q.got)) { ding(); NEXT(finishGame, 1.0); } },
    card() { const n = J.rats.filter(q => q.got).length; return ['TAP A RAT', lab(n + ' / 6 CAUGHT') + lst([['#6b6258', 'RATS', (6 - n) + ' LEFT', n >= 6], ['#e0823a', 'MOUSER', 'LEAVE HER', false]]), 'c' + n]; },
    hint() { const q = J.rats.find(r => !r.got); return q ? [q.m.position.clone().setY(CY + 0.1), 'TAP'] : null; },
    shot() { return [V(38.1, CY, -95.25), 6.8, 3.0, 1.05, 2.4, 0, 3.0, [30.6, 51.4, -99.4, -86.6, CY + 0.5, -0.4]]; },
    end() { CG.visible = false; } };
  const tips = ['The Amber line is in the cellar, by the stairs. Never hook up the Luxor stuff.', 'Bottles go where their colour tag is.', 'A treble is three times the number. The bull is fifty.', 'Mouser hunts the rats with you. Leave her be.', 'The Regular just wants his song. Be kind.'];
  return { RINGS, GD, tips };
}
