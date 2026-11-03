// MERU 2.0 — s125 RUINS MUSEUM DELUXE PART C (Ben's answers s123), plugged into worlds/meru2-ruins-jobs.js as PZ.
// THE COLLECTION WALL (north wall, behind the Ninth Key: 8 niches, fills as you sell, YOUR NAME on each relic you brought in) ·
// a daily WANTED relic (easel by the Sage's desk) that pays DOUBLE once a game day · the DONORS plaque (south wall, west of the door).
// PRIZES, one per finished job (distinct jobs done): 1 EXPLORER HAT (worn) · 3 EXPLORER OUTFIT (worn, the Tailor keeps it) ·
// 5 TROWEL + BRUSH on your belt · 8 YOUR OWN RELIC CASE (south-east corner, was RESERVED) · 10 GOLDEN TROWEL + 100 gold. First relic sold = name on the DONORS plaque.
// Stats: mrsHat / mrsHatOn / mrsOutfit / mrsTools / mrsToolsOn / mrsCase / mrsTrophy / mrsDonor / mrsDayN / mrsWantedDay.
export function rsPrizes(X) {
  const { THREE, G, LM, CT, box, cyl, plane, colF, colC, fitTxt, save, wear, hour, RELICS, FINDS, pre, GOLD, INK, YEL, WOOD, WOODD } = X;
  const st = (k, d) => save.stat(pre + k, d), set = (k, v) => save.setStat(pre + k, v);
  const name = () => { try { return (save.data.name || 'YOU').toUpperCase(); } catch (e) { return 'YOU'; } };
  const doneN = () => Object.keys(st('Done', null) || {}).length, sold = () => st('Sold', null) || {};
  // ---------- game day (the hour wrapping past midnight) ----------
  let lastH = null; const day = () => st('DayN', 0);
  const dayTick = () => { const h = hour ? hour() : 12; if (lastH != null && h < lastH - 12) set('DayN', day() + 1); lastH = h; };
  const IDS = Object.keys(RELICS), wanted = () => IDS[(day() * 5 + 3) % IDS.length], paidToday = () => st('WantedDay', -1) === day();
  // ================= worn: EXPLORER HAT (head) + TROWEL + BRUSH (body) =================
  const OUT = { outfit: 'coat', torso: ['#c8b07a', '#8a6d3b', '#4e3922'], name: 'EXPLORER OUTFIT' };
  const hatMesh = () => { const g = new THREE.Group(), K = '#c8b07a';
    cyl(g, 0.31, 0.31, 0.022, K, 0, 0.28, 0, 22); cyl(g, 0.17, 0.19, 0.17, K, 0, 0.37, 0, 18); cyl(g, 0.192, 0.192, 0.045, '#4e3922', 0, 0.31, 0, 18);
    const dent = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), LM(K)); dent.scale.y = 0.35; dent.position.y = 0.455; g.add(dent); return g; };
  const toolsMesh = () => { const g = new THREE.Group(), LEA = '#6b4a2a';
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.305, 0.025, 6, 24), LM(LEA)); band.rotation.x = Math.PI / 2; band.scale.set(1, 1.12, 1); band.position.y = 0.63; g.add(band);
    const tw = new THREE.Group(); tw.position.set(0.31, 0.5, -0.04); tw.rotation.z = 0.14; g.add(tw); cyl(tw, 0.018, 0.018, 0.13, WOOD, 0, 0.09, 0, 6);
    const bl = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 4), LM('#9aa3ab')); bl.rotation.x = Math.PI; bl.scale.z = 0.25; bl.position.y = -0.04; tw.add(bl);
    const br = new THREE.Group(); br.position.set(-0.31, 0.5, -0.04); br.rotation.z = -0.14; g.add(br); cyl(br, 0.015, 0.015, 0.16, WOOD, 0, 0.06, 0, 6); box(br, 0.06, 0.06, 0.035, '#e8d9b0', 0, -0.05, 0);
    g.traverse(o => { o.renderOrder = 2; }); return g; };
  let wH = null, wT = null;
  const fit = (w, on, fox, part, mk) => { const P = fox && fox.userData && fox.userData.P, par = P && P[part]; if (!par) return w;
    if (w && w.on === on && w.fox === fox && (!w.m || w.m.parent === par)) return w; if (w && w.m && w.m.parent) w.m.parent.remove(w.m); w = { on, fox, m: null }; if (on) { w.m = mk(); w.m.traverse(o => { o.renderOrder = 2; }); par.add(w.m); } return w; };
  function applyWear(fox) { dayTick(); wH = fit(wH, !!(st('Hat', false) && st('HatOn', true)), fox, 'head', hatMesh); wT = fit(wT, !!(st('Tools', false) && st('ToolsOn', true)), fox, 'body', toolsMesh); }
  const hatOn = () => { set('HatOn', true); if (save.stat('mftHat', false)) save.setStat('mftHatWear', 'off'); if (save.stat('brkHelmOn', null) === true) save.setStat('brkHelmOn', false); };   // one hat at a time
  // ================= THE COLLECTION WALL (north wall, x -393.6..-386.4, behind the Ninth Key) =================
  const CW = { x0: -393.6, x1: -386.4, zb: -69.95, zf: -69.5 }, cx = (CW.x0 + CW.x1) / 2, NN = 8, SLOT = [...IDS, ...Array(Math.max(0, NN - IDS.length)).fill(null)].slice(0, NN);
  box(G, 7.4, 2.5, 0.06, '#5a2a1e', cx, 1.55, CW.zb); box(G, 7.4, 0.4, 0.5, WOODD, cx, 0.2, -69.75); box(G, 7.4, 0.1, 0.5, WOOD, cx, 1.55, -69.75); box(G, 7.4, 0.12, 0.5, WOODD, cx, 2.76, -69.75);
  for (let i = 0; i <= 4; i++) box(G, 0.08, 2.4, 0.5, WOOD, CW.x0 + i * 1.8, 1.6, -69.75); colF(CW.x0 - 0.1, CW.x1 + 0.1, -70, CW.zf + 0.05);
  const headT = CT(1024, 96, () => {}); plane(headT, 5.0, 0.47, cx, 3.2, CW.zf + 0.01, 0, G, false);
  const NI = SLOT.map((id, i) => { const col = i % 4, row = i < 4 ? 1 : 0, x = CW.x0 + 0.9 + col * 1.8, c = row ? 2.15 : 0.95;
    const t = CT(512, 112, () => {}), pq = plane(t, 1.5, 0.33, x, row ? 1.55 : 0.22, CW.zf + 0.012, 0, G, false);
    box(G, 0.34, 0.22, 0.24, '#e6d3a8', x, c - 0.44, -69.72); const g = new THREE.Group(); g.position.set(x, c - 0.1, -69.72); G.add(g);
    if (id === 'shardpin') { const pin = cyl(g, 0.012, 0.012, 0.42, '#b8b0a0', 0, 0, 0, 6); pin.rotation.z = 0.7; const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.08), new THREE.MeshPhongMaterial({ color: '#9fd6ff', emissive: 0x16304a, shininess: 90 })); gem.position.set(-0.1, 0.08, 0.02); g.add(gem); }
    else if (id === 'gatecoin') { const d = cyl(g, 0.15, 0.15, 0.025, GOLD, 0, 0, 0, 24); d.rotation.x = Math.PI / 2; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, s = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 4), LM('#8a6a22')); s.position.set(Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0.016); g.add(s); } }
    else if (id) { const o = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), LM(GOLD)); g.add(o); }
    const q = plane(CT(128, 128, (cg, W) => { cg.fillStyle = 'rgba(230,211,168,0.35)'; cg.font = '900 110px Archivo, sans-serif'; cg.textAlign = 'center'; cg.textBaseline = 'middle'; cg.fillText('?', W / 2, W / 2 + 6); }), 0.5, 0.5, x, c, CW.zb + 0.04, 0);
    return { id, t, g, q }; });
  let wallKey = '';
  function drawWall() { const S = sold(), nm = name(), k = JSON.stringify(S) + nm; if (k === wallKey) return; wallKey = k; const have = SLOT.filter(id => id && S[id]).length;
    { const c = headT.userData.c.getContext('2d'); c.fillStyle = '#2b2219'; c.fillRect(0, 0, 1024, 96); c.fillStyle = GOLD; c.textBaseline = 'middle'; fitTxt(c, 'THE COLLECTION \u00b7 ' + have + ' OF ' + NN, 24, 50, 976, 56); headT.needsUpdate = true; }
    NI.forEach(n => { const on = !!(n.id && S[n.id]); n.g.visible = on; n.q.visible = !on; const c = n.t.userData.c.getContext('2d'); c.fillStyle = '#2b2219'; c.fillRect(0, 0, 512, 112); c.strokeStyle = GOLD; c.lineWidth = 4; c.strokeRect(5, 5, 502, 102); c.textBaseline = 'middle';
      if (on) { c.fillStyle = '#e6d3a8'; fitTxt(c, RELICS[n.id].name.toUpperCase(), 20, 38, 472, 34); c.fillStyle = YEL; fitTxt(c, 'GIVEN BY ' + nm + (S[n.id] > 1 ? ' \u00b7 \u00d7' + S[n.id] : ''), 20, 80, 472, 26, 800); }
      else { c.fillStyle = '#b89a66'; fitTxt(c, '?', 20, 38, 472, 34); fitTxt(c, n.id ? 'STILL OUT THERE' : 'STILL IN THE HILL', 20, 80, 472, 26, 800); }
      n.t.needsUpdate = true; }); }
  // ================= WANTED TODAY (easel by the Sage's desk, faces the door) =================
  const WB = { x: -383.3, z: -61.0 }; for (const s of [-1, 1]) { const l = box(G, 0.05, 1.9, 0.05, WOOD, WB.x + s * 0.38, 0.95, WB.z); l.rotation.z = -s * 0.08; } { const b = box(G, 0.05, 1.7, 0.05, WOOD, WB.x, 0.85, WB.z - 0.32); b.rotation.x = -0.2; } box(G, 0.98, 0.04, 0.1, WOOD, WB.x, 1.06, WB.z + 0.04); colC(WB.x, WB.z - 0.1, 0.5);
  const wantT = CT(512, 384, () => {}); plane(wantT, 0.92, 0.69, WB.x, 1.45, WB.z + 0.04, 0, G, false); let wantKey = '';
  function drawWanted() { const id = wanted(), paid = paidToday(), k = id + paid + day(); if (k === wantKey) return; wantKey = k; const c = wantT.userData.c.getContext('2d'), W = 512, H = 384;
    c.fillStyle = '#2b2a28'; c.fillRect(0, 0, W, H); c.strokeStyle = WOOD; c.lineWidth = 14; c.strokeRect(7, 7, W - 14, H - 14); c.textBaseline = 'middle';
    c.fillStyle = '#ec3013'; c.fillRect(30, 34, 300, 64); c.fillStyle = '#ffffff'; fitTxt(c, 'WANTED TODAY', 44, 68, 276, 44);
    c.fillStyle = '#f3f2f2'; fitTxt(c, RELICS[id].name.toUpperCase(), 32, 168, W - 64, 46); c.fillStyle = paid ? '#b8b0a0' : YEL; fitTxt(c, paid ? 'PAID TODAY \u00b7 BACK TOMORROW' : 'PAYS DOUBLE \u00b7 ' + RELICS[id].value * 2 + ' GOLD', 32, 252, W - 64, 34);
    c.fillStyle = '#b8b0a0'; fitTxt(c, 'ONE A DAY \u00b7 THE SAGE', 32, 320, W - 64, 26, 800); wantT.needsUpdate = true; }
  const nearWanted = P => Math.hypot(P.x - WB.x, P.z - (WB.z + 0.9)) < 1.2;
  // ================= DONORS plaque (south wall, west of the door, faces in) =================
  const donT = CT(512, 320, () => {}); plane(donT, 1.6, 1.0, -391.6, 2.1, -45.42, Math.PI, G, false); let donKey = '';
  function drawDonors() { const on = !!st('Donor', false), k = on + name(); if (k === donKey) return; donKey = k; const c = donT.userData.c.getContext('2d'), W = 512, H = 320;
    c.fillStyle = '#2b2219'; c.fillRect(0, 0, W, H); c.strokeStyle = GOLD; c.lineWidth = 8; c.strokeRect(10, 10, W - 20, H - 20); c.textBaseline = 'middle'; c.fillStyle = GOLD; fitTxt(c, 'DONORS TO THE MUSEUM', 32, 52, W - 64, 40);
    c.fillRect(32, 82, W - 64, 4); c.fillStyle = '#e6d3a8'; ['HIS MAJESTY KING MIGHT', 'THE LANTERN GUILD', 'A TRAVELLER, NAME UNKNOWN'].forEach((t, i) => fitTxt(c, t, 32, 120 + i * 44, W - 64, 28, 800));
    if (on) { c.fillStyle = YEL; fitTxt(c, name(), 32, 120 + 3 * 44, W - 64, 30); } donT.needsUpdate = true; }
  // ================= YOUR OWN RELIC CASE (south-east corner, faces north; RESERVED until earned) =================
  const OC = { x: -369.2, z: -46.7 }; box(G, 1.4, 0.9, 0.72, WOODD, OC.x, 0.45, OC.z); box(G, 1.48, 0.05, 0.8, WOOD, OC.x, 0.92, OC.z); box(G, 1.48, 0.05, 0.8, WOOD, OC.x, 1.74, OC.z);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(G, 0.04, 0.82, 0.04, WOOD, OC.x + sx * 0.7, 1.33, OC.z + sz * 0.36); colF(OC.x - 0.76, OC.x + 0.76, OC.z - 0.42, OC.z + 0.42);
  { const g = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.8, 0.7), new THREE.MeshPhongMaterial({ color: 0xdfefff, transparent: true, opacity: 0.18, shininess: 120, depthWrite: false })); g.position.set(OC.x, 1.33, OC.z); g.renderOrder = 3; G.add(g); }
  const CASEIN = new THREE.Group(); CASEIN.position.set(OC.x, 0.95, OC.z); G.add(CASEIN); FINDS.forEach((f, i) => { const g = new THREE.Group(); g.position.x = (i - 1) * 0.44; g.rotation.y = Math.PI + (i - 1) * 0.3; f[1](g); CASEIN.add(g); });
  const ocT = CT(512, 160, () => {}); plane(ocT, 1.0, 0.31, OC.x, 0.6, OC.z - 0.365, Math.PI, G, false); let ocKey = '';
  const TROPHY = new THREE.Group(); TROPHY.position.set(OC.x, 1.77, OC.z); G.add(TROPHY); { const gm = new THREE.MeshPhongMaterial({ color: GOLD, emissive: 0x3a2a08, shininess: 90 });
    box(TROPHY, 0.3, 0.08, 0.2, WOODD, 0, 0.04, 0); const tw = new THREE.Group(); tw.position.y = 0.3; TROPHY.add(tw); const bl = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 4), gm); bl.rotation.x = Math.PI; bl.scale.z = 0.22; tw.add(bl);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 8), gm); h.position.y = 0.24; tw.add(h); }
  function drawCase() { const own = !!st('Case', false), tr = !!st('Trophy', false), k = own + '' + tr + name(); if (k === ocKey) return; ocKey = k; CASEIN.visible = own; TROPHY.visible = tr;
    const c = ocT.userData.c.getContext('2d'), W = 512, H = 160; c.fillStyle = '#2b2219'; c.fillRect(0, 0, W, H); c.strokeStyle = GOLD; c.lineWidth = 6; c.strokeRect(8, 8, W - 16, H - 16); c.textBaseline = 'middle';
    c.fillStyle = '#e6d3a8'; fitTxt(c, own ? 'THE ' + name() + ' COLLECTION' : 'RESERVED', 26, H * 0.38, W - 52, 44); c.fillStyle = '#b89a66'; fitTxt(c, own ? (tr ? 'GOLDEN TROWEL \u00b7 EVERY JOB DONE' : 'FINDS BY A FRIEND OF THE MUSEUM') : 'FOR A FRIEND OF THE MUSEUM', 26, H * 0.72, W - 52, 26, 800); ocT.needsUpdate = true; }
  const redraw = () => { drawWall(); drawWanted(); drawDonors(); drawCase(); }; redraw();
  // ================= selling: WANTED pays double once a game day; first sale = DONORS =================
  function price(id) { const r = RELICS[id]; if (id === wanted() && !paidToday()) { set('WantedDay', day()); return { v: r.value * 2, dbl: true }; } return { v: r.value, dbl: false }; }
  function afterSell() { let pz = null; if (!st('Donor', false)) { set('Donor', true); pz = 'donor'; } redraw(); return pz; }
  // ================= prizes (one per finished job, by distinct jobs done) =================
  const LINES = {
    hat: ['An explorer hat. Every digger needs one. Wear it with pride.', 'EXPLORER HAT'],
    outfit: ['The full explorer outfit. The Tailor keeps a copy for you.', 'EXPLORER OUTFIT'],
    tools: ['A trowel and a brush for your belt. Real tools, for real work.', 'TROWEL + BRUSH'],
    case: ['Your own relic case, by the door. Your name is on it.', 'YOUR OWN RELIC CASE'],
    trophy: ['Every job done. The golden trowel, and 100 gold. The hill is proud.', 'GOLDEN TROWEL + 100 GOLD'],
    donor: ['Your name goes on the DONORS plaque. By the door.', 'NAME ON THE DONORS PLAQUE'] };
  function gift() { const n = doneN();
    if (!st('Hat', false)) { set('Hat', true); hatOn(); return ['hat']; }
    if (n >= 3 && !st('Outfit', false)) { set('Outfit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === OUT.name)) save.setStat('tailorOutfits', [...list, OUT]); save.setOutfit && save.setOutfit(OUT); wear && wear(OUT); return ['outfit']; }
    if (n >= 5 && !st('Tools', false)) { set('Tools', true); set('ToolsOn', true); return ['tools']; }
    if (n >= 8 && !st('Case', false)) { set('Case', true); redraw(); return ['case']; }
    if (n >= 10 && !st('Trophy', false)) { set('Trophy', true); save.addGold(100); redraw(); return ['trophy']; }
    return []; }
  const line = ks => LINES[ks[0]][0], label = ks => ks.map(k => LINES[k][1]).join(' + ');
  const nextAt = () => { const n = doneN(); if (!st('Hat', false)) return 1; for (const [m, k] of [[3, 'Outfit'], [5, 'Tools'], [8, 'Case'], [10, 'Trophy']]) if (!st(k, false)) return Math.max(0, m - n); return 0; };
  // the Sage's YOUR PRIZES (wear picks, last GOODBYE)
  function menu(sayTo, kT, ln, bye) { const ch = [];
    if (!st('Hat', false)) { sayTo(kT, [{ ...ln('Finish one job, child. Then we talk prizes.'), choices: [{ text: bye, bye: true, pick: () => {} }] }]); return; }
    const hon = !!st('HatOn', true); ch.push({ text: hon ? 'TAKE OFF THE EXPLORER HAT' : 'WEAR THE EXPLORER HAT', pick: () => { if (hon) set('HatOn', false); else hatOn(); } });
    if (st('Outfit', false)) { const o = save.data && save.data.outfit; if (!(o && o.name === OUT.name)) ch.push({ text: 'WEAR THE EXPLORER OUTFIT', pick: () => { save.setOutfit && save.setOutfit(OUT); wear && wear(OUT); } }); }
    if (st('Tools', false)) { const on = !!st('ToolsOn', true); ch.push({ text: on ? 'TOOLS OFF THE BELT' : 'TOOLS ON THE BELT', pick: () => set('ToolsOn', !on) }); }
    ch.push({ text: bye, bye: true, pick: () => {} }); const n = nextAt();
    sayTo(kT, [{ ...ln(n ? 'Your prizes. ' + n + ' more job' + (n > 1 ? 's' : '') + ' for the next one.' : 'Every prize I have is yours now. Well dug.'), choices: ch }]); }
  const wantedLines = ln => { const id = wanted(), r = RELICS[id]; return paidToday() ? [ln('WANTED today: the ' + r.name.toUpperCase() + '. Already paid double. Come back tomorrow.')] : [ln('WANTED today: the ' + r.name.toUpperCase() + '. Bring one in and I pay ' + r.value * 2 + ' gold.')]; };
  let rT = 0, t0 = 0;
  function tick(dt) { t0 += dt; if ((rT -= dt) <= 0) { rT = 1.5; redraw(); } if (TROPHY.visible) TROPHY.rotation.y += dt * 0.6; }
  return { gift, line, label, menu, tick, applyWear, price, afterSell, wanted, wantedLines, nearWanted, redraw, OUT };
}
