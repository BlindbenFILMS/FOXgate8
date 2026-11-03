// MERU 2.0 — s126 PERMIT OFFICE PART B: THE DIG PERMIT. With digPermit set (Spade, THE DIG PERMIT) the FOUR SITES in the desert open:
// THE COLONNADE · THE PIT · THE OLD WELL · THE SPIRE (named on Spade's THE FOUR SITES plan). Each site = a landmark, a red flag pole, a name post
// and 3 DIG MOUNDS (red pegs) that come back every game day. Walk up + E = DIG: gold, a named find, sometimes a 2D relic (Shard Pin, Gate Coin)
// for the Old Sage. The permit runs 7 game days; Spade renews it for 15 gold, FREE once all 8 of his jobs are done (the FREE RENEWALS prize).
// "Stamp me out to the field" also opens the 2D DUNEGLASS DIG (minigames/meru/duneglass.html) in the panel, as the 2D openDigPrompt.
export function pmDig(X) {
  const { THREE, ROOT, V, LM, CT, box, cyl, colC, plane, label, save, touch, toW, ground, hour, toast, tone, noise, chimes, clamp, pick, allDone } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', STONE = '#d6c7a4', STONED = '#a8946a', SAND = '#d9bf8c', WOODD = '#4a3520';
  const gh = (x, z) => { try { const w = toW(V(x, 0, z)); const h = ground ? ground(w.x, w.z) : w.y; return isFinite(h) ? clamp(h - w.y, -3, 12) : 0; } catch (e) { return 0; } };
  const st = (k, d) => save.stat('mpo' + k, d), set = (k, v) => save.setStat('mpo' + k, v);
  const flag = k => { try { return !!save.flag(k); } catch (e) { return false; } };
  // ---------- game day (hour wraps) ----------
  let lastH = null; const dayN = () => st('DayN', 0);
  const dayTick = () => { let h = 12; try { h = hour(); } catch (e) {} if (lastH != null && h + 6 < lastH) set('DayN', dayN() + 1); lastH = h; };
  const LIFE = 7, RENEW = 15;
  const permitDay = () => st('PermitDay', null);
  const daysLeft = () => { if (!flag('digPermit')) return 0; let d = permitDay(); if (d == null) { set('PermitDay', dayN()); d = dayN(); } return Math.max(0, LIFE - (dayN() - d)); };
  const valid = () => daysLeft() > 0;
  const freeRenew = () => !!allDone();
  // ---------- the four sites ----------
  const SITES = [
    { k: 'colonnade', n: 'THE COLONNADE', at: [-385, 45], gold: [4, 10], relic: 0.05, finds: ['A CLAY BEAD', 'A BENT NAIL', 'A COPPER BIT', 'A LAMP SHARD'] },
    { k: 'pit', n: 'THE PIT', at: [-470, 55], gold: [6, 14], relic: 0.07, finds: ['A BONE BUTTON', 'A POT HANDLE', 'A FLINT', 'A RUSTED BUCKLE'] },
    { k: 'well', n: 'THE OLD WELL', at: [-475, -55], gold: [8, 18], relic: 0.09, finds: ['A WELL BUCKET HOOP', 'A GREEN GLASS DROP', 'A BRONZE RING', 'AN OLD KEY'] },
    { k: 'spire', n: 'THE SPIRE', at: [-497, 18], gold: [10, 24], relic: 0.12, finds: ['A CARVED TILE', 'A SILVER THREAD', 'A GATE STUD', 'A STONE EYE'] }];
  const RELICS = [['shardpin', 'SHARD PIN'], ['gatecoin', 'GATE COIN OF OLD MERU']];
  const SG = new THREE.Group(); SG.name = 'permitDigSites'; ROOT.add(SG);
  const flagT = label('', RED, RED, 32, 32);
  const peg = (par, x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); par.add(g); const mound = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.32, 9), LM(SAND)); mound.position.y = 0.16; g.add(mound);
    cyl(g, 0.018, 0.018, 0.8, WOODD, 0.25, 0.4, 0.05, 6); plane(flagT, 0.22, 0.14, 0.36, 0.72, 0.05, 0, g, false); const hole = new THREE.Mesh(new THREE.CircleGeometry(0.45, 12), LM('#6e5235')); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.03; hole.visible = false; g.add(hole);
    return { g, mound, hole, flag: g.children.slice(1, 3) }; };
  SITES.forEach((s, i) => { const g = new THREE.Group(); g.position.set(s.at[0], 0, s.at[1]); SG.add(g); s.g = g;
    if (s.k === 'colonnade') { for (let c = 0; c < 4; c++) { const h = [2.6, 1.4, 3.2, 0.8][c]; cyl(g, 0.32, 0.36, h, STONE, -2.4 + c * 1.6, h / 2, -2.6, 10); colC(s.at[0] - 2.4 + c * 1.6, s.at[1] - 2.6, 0.45); } box(g, 2.2, 0.35, 0.6, STONED, 1.6, 0.17, -1.6).rotation.y = 0.3; }
    else if (s.k === 'pit') { for (let c = 0; c < 10; c++) { const a = c / 10 * 6.283; box(g, 0.5, 0.35, 0.4, STONED, Math.cos(a) * 2.2, 0.17, -3 + Math.sin(a) * 1.4).rotation.y = -a; } const d = new THREE.Mesh(new THREE.CircleGeometry(1.8, 16), LM('#4a3a26')); d.rotation.x = -Math.PI / 2; d.scale.y = 0.62; d.position.set(0, 0.04, -3); g.add(d); }
    else if (s.k === 'well') { const w = cyl(g, 0.9, 1.0, 0.8, STONE, 0, 0.4, -2.8, 14); const top = new THREE.Mesh(new THREE.CircleGeometry(0.75, 14), LM('#1e1a14')); top.rotation.x = -Math.PI / 2; top.position.set(0, 0.81, -2.8); g.add(top); for (const dx of [-0.9, 0.9]) cyl(g, 0.05, 0.05, 1.6, WOODD, dx, 1.2, -2.8, 6); const bar = cyl(g, 0.04, 0.04, 2, WOODD, 0, 1.95, -2.8, 6); bar.rotation.z = Math.PI / 2; colC(s.at[0], s.at[1] - 2.8, 1.1); }
    else { const sp = new THREE.Mesh(new THREE.ConeGeometry(1.1, 7.5, 7), LM('#b98a5a')); sp.position.set(0, 3.75, -3.4); sp.rotation.z = 0.06; g.add(sp); const sp2 = new THREE.Mesh(new THREE.ConeGeometry(0.6, 3.4, 6), LM('#a8794a')); sp2.position.set(1.4, 1.7, -2.6); g.add(sp2); colC(s.at[0], s.at[1] - 3.4, 1.2); colC(s.at[0] + 1.4, s.at[1] - 2.6, 0.7); }
    cyl(g, 0.05, 0.05, 4.2, WOODD, 3.2, 2.1, -2.2, 6); plane(flagT, 0.9, 0.55, 3.66, 3.8, -2.2, 0, g, false);
    const post = new THREE.Group(); post.position.set(2.6, 0, 1.8); g.add(post); cyl(post, 0.05, 0.05, 1.5, WOODD, 0, 0.75, 0, 6); plane(label(s.n + ' \u00b7 DIG SITE ' + (i + 1), WOODD, '#f0d5a6', 1024, 112, 56), 1.4, 0.16, 0, 1.35, 0.05, 0, post, false); plane(label('PERMIT HOLDERS ONLY', RED, '#ffffff', 512, 80, 44), 0.9, 0.14, 0, 1.12, 0.05, 0, post, false);
    s.pegs = [0, 1, 2].map(j => { const a = j * 2.1 + i, r = 1.6 + j * 0.9, p = peg(g, Math.cos(a) * r, 0.6 + Math.sin(a) * r * 0.7); p.x = s.at[0] + Math.cos(a) * r; p.z = s.at[1] + 0.6 + Math.sin(a) * r * 0.7; return p; }); });
  let placed = false; const place = () => { for (const s of SITES) { s.g.position.y = gh(s.at[0], s.at[1]); } placed = true; };
  // ---------- mounds: 3 per site per game day ----------
  const dugKey = (s, j) => s.k + j;
  const dugToday = () => { const d = st('DigDay', null) || {}; return d.day === dayN() ? d.dug || {} : {}; };
  const refresh = () => { const D = dugToday(); for (const s of SITES) s.pegs.forEach((p, j) => { const dug = !!D[dugKey(s, j)]; p.mound.visible = !dug; p.flag.forEach(o => { o.visible = !dug; }); p.hole.visible = dug; }); };
  let lastDay = -1, digT = 0, digAt = null;
  const nearPeg = P => { for (const s of SITES) { if (Math.hypot(P.x - s.at[0], P.z - s.at[1]) > 9) continue; const D = dugToday(); for (let j = 0; j < 3; j++) { const p = s.pegs[j]; if (!D[dugKey(s, j)] && Math.hypot(P.x - p.x, P.z - p.z) < 1.3) return { s, j, p }; } } return null; };
  const atSite = P => SITES.find(s => Math.hypot(P.x - s.at[0], P.z - s.at[1]) < 7) || null;
  function dig(hit) { const { s, j, p } = hit, D = { ...dugToday() }; D[dugKey(s, j)] = 1; set('DigDay', { day: dayN(), dug: D }); set('Dug', st('Dug', 0) + 1); refresh();
    digT = 1.0; digAt = p; noise(0.35, 0.05, 900); setTimeout(() => noise(0.3, 0.04, 1100), 350);
    const carried = (save.data && save.data.relics) || [], free = RELICS.filter(r => !carried.includes(r[0]));
    if (free.length && Math.random() < s.relic) { const r = pick(free); save.addRelic(r[0]); set('DigRelics', st('DigRelics', 0) + 1); chimes(); toast('A RELIC! \u00b7 ' + r[1] + ' \u00b7 TAKE IT TO THE OLD SAGE', 3.4); return; }
    const g = s.gold[0] + Math.round(Math.random() * (s.gold[1] - s.gold[0])); save.addGold(g); tone(880, 0.05, 0.3, 'triangle'); tone(1175, 0.04, 0.3, 'triangle', 0.08); toast(pick(s.finds) + ' \u00b7 +' + g + ' GOLD', 2.6); }
  const puffs = []; const puffM = new THREE.MeshBasicMaterial({ color: SAND, transparent: true, opacity: 0.7, depthWrite: false });
  function tick(dt, P) { dayTick(); if (!placed) place(); const near = Math.hypot(P.x + 441, P.z) < (touch ? 115 : 140); SG.visible = near; if (!near) return;
    if (dayN() !== lastDay) { lastDay = dayN(); refresh(); }
    if (digT > 0 && digAt) { digT -= dt; if (Math.random() < dt * 22) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), puffM); const w = digAt.g.getWorldPosition(V()); SG.worldToLocal(w); m.position.set(w.x + (Math.random() - 0.5) * 0.6, w.y + 0.15, w.z + (Math.random() - 0.5) * 0.6); m.userData.v = V((Math.random() - 0.5) * 1.2, 1.6 + Math.random(), (Math.random() - 0.5) * 1.2); m.userData.t = 0.7; SG.add(m); puffs.push(m); } }
    for (let i = puffs.length - 1; i >= 0; i--) { const m = puffs[i]; m.userData.t -= dt; m.userData.v.y -= 5 * dt; m.position.addScaledVector(m.userData.v, dt); if (m.userData.t <= 0) { SG.remove(m); m.geometry.dispose(); puffs.splice(i, 1); } } }
  function prompt(P) { const h = nearPeg(P); if (h) return valid() ? 'DIG \u00b7 ' + h.s.n : flag('digPermit') ? 'PERMIT RAN OUT \u00b7 RENEW AT SPADE' : 'NO PERMIT \u00b7 SEE SPADE'; const s = atSite(P); return s && valid() && s.pegs.every((p, j) => dugToday()[dugKey(s, j)]) ? s.n + ' \u00b7 DUG OUT TODAY' : null; }
  function talk(P) { const h = nearPeg(P); if (!h) return false; if (!valid()) { tone(196, 0.05, 0.25, 'square'); toast(flag('digPermit') ? 'YOUR DIG PERMIT RAN OUT \u00b7 SPADE RENEWS IT' : 'NO DIG PERMIT \u00b7 SPADE AT THE PERMIT OFFICE', 2.6); return true; } if (digT > 0) return true; dig(h); return true; }
  // ---------- Spade's side: status, renew ----------
  const status = () => (valid() ? 'Good for ' + daysLeft() + (daysLeft() === 1 ? ' more day.' : ' more days.') : 'It ran out.');
  function renew() { const free = freeRenew(); if (!free && !save.spend(RENEW)) return { ok: false, line: 'Fifteen gold for a renewal. Come back with it.' };
    set('PermitDay', dayN()); set('Renewals', st('Renewals', 0) + 1); chimes(); toast('DIG PERMIT RENEWED \u00b7 ' + LIFE + ' DAYS' + (free ? ' \u00b7 FREE' : ' \u00b7 -' + RENEW + ' GOLD'), 2.6);
    return { ok: true, line: free ? 'On the house. You have done every job I have. Seven days.' : 'Fifteen gold. Stamped. Seven more days.' }; }
  const stamped = () => { set('PermitDay', dayN()); refresh(); };
  return { SITES, tick, prompt, talk, valid, daysLeft, status, renew, stamped, freeRenew, RENEW, refresh, dayN, _dig: (k, j = 0) => { const s = SITES.find(q => q.k === k); if (s) dig({ s, j, p: s.pegs[j] }); } };
}
