// MERU 2.0 — s121 FORTUNE TELLER DELUXE PART B: two more jobs, built inside worlds/meru2-fortune-jobs.js (GD merged there).
// HANG THE DREAMCATCHERS + WIND CHIMES (Lumi, drag): 3 dreamcatchers + 2 wind chimes from the basket to the hook with the matching colour tag on the
//   rail along the partition's reading-room face (z -60.35); 2 rounds (the tags shuffle); after the first clear they stay up for good (stat mftHung).
// FIND ORA'S LOST RING (Ora, walk): 10 search spots in both rooms ("?" tags); E = search; the ball tells you WARMER / COLDER; give the ring back to Ora.
export function ftJobsB(X) {
  const { THREE, G, V, box, cyl, LM, CT, colF, JX, own, miss, addGold, NEXT, toast, finishGame, tone, noise, shimmer, TAPR, scrW, dist, ptr, ray, rnd, save, touch, NOTES, ORA, GOLD, INK, YEL } = X;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // ================= JOB 3: HANG THE DREAMCATCHERS + WIND CHIMES =================
  const HZ = -60.35, HY = 2.42, HX = [-85.0, -83.6, -82.2, -80.8, -79.4];
  box(G, 6.3, 0.06, 0.06, GOLD, -82.2, 2.66, -60.28);
  const tagM = HX.map(() => new THREE.MeshBasicMaterial({ color: '#888888' }));
  HX.forEach((x, i) => { cyl(G, 0.012, 0.012, 0.18, GOLD, x, 2.56, HZ, 6); const t = new THREE.Mesh(new THREE.CircleGeometry(0.075, 16), tagM[i]); t.position.set(x, 2.85, -60.2); t.rotation.y = Math.PI; G.add(t); const rim = new THREE.Mesh(new THREE.RingGeometry(0.075, 0.095, 16), LM(INK)); rim.position.set(x, 2.85, -60.205); rim.rotation.y = Math.PI; G.add(rim); });
  box(G, 2.9, 0.45, 0.5, '#3a2440', -82.2, 0.225, -61.35); box(G, 2.92, 0.04, 0.52, GOLD, -82.2, 0.46, -61.35); colF(-83.65, -80.75, -61.6, -61.1);
  const webT = CT(128, 128, (g) => { g.clearRect(0, 0, 128, 128); g.strokeStyle = '#f3efe2'; g.lineWidth = 2; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.cos(a) * 62, 64 + Math.sin(a) * 62); g.stroke(); } for (let r = 14; r < 62; r += 12) { g.beginPath(); for (let k = 0; k <= 8; k++) { const a = k / 8 * Math.PI * 2 + r * 0.02; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } g.stroke(); } g.fillStyle = '#9fd6ff'; g.beginPath(); g.arc(64, 64, 5, 0, 7); g.fill(); });
  const COLS = ['#c084fc', '#38bdf8', '#f472b6', '#ffd23a', '#7cff9b'];
  const ITEMS = COLS.map((c, i) => { const g = new THREE.Group(); G.add(g); const chime = i >= 3;
    box(g, 0.006, 0.16, 0.006, INK, 0, -0.08, 0);
    if (!chime) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.016, 6, 22), LM(c)); t.position.y = -0.31; g.add(t); const w = new THREE.Mesh(new THREE.CircleGeometry(0.145, 18), new THREE.MeshBasicMaterial({ map: webT, transparent: true, side: THREE.DoubleSide, depthWrite: false })); w.position.y = -0.31; g.add(w);
      for (const dx of [-0.09, 0, 0.09]) { box(g, 0.004, 0.1, 0.004, INK, dx, -0.5, 0); const f = box(g, 0.035, 0.13, 0.008, dx ? '#f3efe2' : c, dx, -0.6, 0); f.rotation.z = dx * 1.5; } }
    else { cyl(g, 0.1, 0.1, 0.025, c, 0, -0.17, 0, 14); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, h = 0.18 + k * 0.04; cyl(g, 0.011, 0.011, h, '#cbd5e1', Math.cos(a) * 0.07, -0.19 - h / 2, Math.sin(a) * 0.07, 6); } const cl = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), LM(INK)); cl.position.y = -0.3; g.add(cl); }
    return { g, c, i, chime, home: V(-83.4 + i * 0.6, 0.48 + (chime ? 0.52 : 0.73), -61.35), hung: -1, ph: Math.random() * 6 }; });
  const hookPos = h => V(HX[h], HY, HZ);
  const hungAll = () => { ITEMS.forEach((it, i) => { it.hung = i; it.g.position.copy(hookPos(i)); }); HX.forEach((_, i) => tagM[i].color.set(COLS[i])); };
  const toBasket = () => ITEMS.forEach(it => { it.hung = -1; it.g.position.copy(it.home); it.g.rotation.set(0, 0, 0); });
  if (save.stat('mftHung', false)) hungAll(); else { toBasket(); HX.forEach((_, i) => tagM[i].color.set(COLS[i])); }
  let held = null; const hitP = V(), dragPlane = new THREE.Plane(V(0, 0, 1), 60.9);
  const G3 = {
    begin() { Object.assign(JX, { N: 2, n: 0 }); toast('HANG EACH ONE ON THE HOOK WITH ITS COLOUR', 2.6); this.round(); },
    round() { const J = JX; if (J.n >= J.N) { finishGame(); return; } toBasket(); held = null; J.map = shuffle([0, 1, 2, 3, 4]); J.map.forEach((ci, h) => tagM[h].color.set(COLS[ci])); J.left = 5; J.t0 = J.t; },
    press() { const i = (() => { let best = -1, bd = TAPR() * 1.5; ITEMS.forEach((it, k) => { if (it.hung >= 0) return; const d = dist(scrW(it.g.position.clone().add(V(0, it.chime ? -0.25 : -0.31, 0)))); if (d < bd) { bd = d; best = k; } }); return best; })(); if (i >= 0) { held = ITEMS[i]; tone(660, 0.03, 0.12, 'triangle'); } },
    drag() { if (!held || !ptr.down) return; if (ray().intersectPlane(dragPlane, hitP)) { held.g.position.set(Math.max(-85.6, Math.min(-78.8, hitP.x)), Math.max(0.9, Math.min(2.6, hitP.y + 0.3)), -60.9); } },
    release() { if (!held) return; const it = held; held = null; const J = JX; let h = -1, bd = TAPR() * 2.2; HX.forEach((_, k) => { if (ITEMS.some(q => q.hung === k)) return; const d = dist(scrW(hookPos(k).add(V(0, -0.3, 0)))); if (d < bd) { bd = d; h = k; } });
      if (h < 0) { it.g.position.copy(it.home); return; }
      if (COLS[J.map[h]] !== it.c) { miss('WRONG HOOK \u00b7 MATCH THE COLOUR TAG', 1.5); it.g.position.copy(it.home); return; }
      it.hung = h; it.g.position.copy(hookPos(h)); addGold(1); if (it.chime) [0, 1, 2, 3].forEach(k => tone(NOTES[(it.i + k * 2) % 7] * 2, 0.025, 0.9, 'sine', k * 0.09)); else tone(NOTES[it.i] , 0.04, 0.4, 'triangle'); it.sw = 1;
      J.left--; if (J.left <= 0) { shimmer(); addGold(J.t - J.t0 < 14 ? 4 : 3); toast(J.n + 1 < J.N ? 'THE BAD DREAMS STAY OUT' : 'THE ROOM CHIMES', 1.4); J.n++; NEXT(() => G3.round(), 1.6); } },
    tick(dt) { const J = JX; if (J.t - J.t0 > 40 + (J.missT || 0) * 15) { J.missT = (J.missT || 0) + 1; miss('KEEP GOING \u00b7 LUMI IS WAITING', 1.4); } },
    hint() { const J = JX, it = ITEMS.find(q => q.hung < 0); if (!it || held) return null; return [it.g.position.clone().add(V(0, -0.3, 0)), 'DRAG']; },
    card() { const J = JX; return ['ROUND ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, '<div style="font-size:13px;font-weight:800">LEFT TO HANG \u00b7 ' + (J.left || 0) + '</div>', J.n + '_' + J.left]; },
    shot() { return [V(-82.2, 1.55, -60.6), 6.6, 2.5, 0.12, 2.6, Math.PI, 5.2]; },
    end() { held = null; if (save.stat('mftHung', false) || (save.stat('mftDone', null) || {}).hang) { save.setStat('mftHung', true); hungAll(); } else { toBasket(); HX.forEach((_, i) => tagM[i].color.set(COLS[i])); } } };
  function lookTick(dt, t) { ITEMS.forEach(it => { if (it.hung < 0) { it.g.rotation.z = 0; return; } it.sw = Math.max(0.15, (it.sw || 0.15) - dt * 0.4); it.g.rotation.z = Math.sin(t * 1.4 + it.ph) * 0.09 * it.sw * 2; it.g.rotation.y = Math.sin(t * 0.7 + it.ph) * 0.3; }); }
  // ================= JOB 4: FIND ORA'S LOST RING (walk + search) =================
  const SPOTS = [['THE CABINET', -84.3, -56.6], ['THE SIDE TABLE', -75.95, -57.2], ['THE DOOR CANDLES', -84.0, -49.95], ['THE DOOR CANDLES', -75.95, -49.95], ['THE RUG', -82.7, -53.0],
    ['THE ALTAR', -84.35, -64.4], ['THE BOOKCASE', -75.15, -68.9], ['THE STAR CHART', -80, -71.0], ['THE READING CHAIR', -81.3, -65.1], ['THE BASKET', -82.2, -61.95]].map(([n, x, z], i) => ({ n, x, z, i, back: z < -60 }));
  const qT = CT(96, 96, (g) => { g.fillStyle = YEL; g.beginPath(); g.arc(48, 48, 44, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.fillStyle = INK; g.font = '900 60px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 48, 52); });
  const RING = new THREE.Group(); { const t = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 8, 20), LM('#e6b45a')); RING.add(t); const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.03), new THREE.MeshBasicMaterial({ color: '#9fd6ff' })); gem.position.y = 0.08; RING.add(gem); } RING.visible = false; G.add(RING);
  const near = P => { let b = null, bd = 1.25; for (const s of JX.sp || []) { if (s.done) continue; const d = Math.hypot(P.x - s.x, P.z - s.z); if (d < bd) { bd = d; b = s; } } return b; };
  const nearOra = P => Math.hypot(P.x - ORA.x, P.z - ORA.z) < 2.4 && P.z > -60;
  const G4 = { walk: true,
    begin() { const J = JX; J.sp = SPOTS.map(s => ({ ...s, done: false })); J.ring = J.sp[Math.random() * J.sp.length | 0]; J.wrong = 0; J.has = false; J.last = null; J.act = 0;
      J.sp.forEach(s => { s.tag = own(new THREE.Sprite(new THREE.SpriteMaterial({ map: qT, depthTest: false, transparent: true }))); const sc = touch ? 0.42 : 0.32; s.tag.scale.set(sc, sc, 1); s.tag.renderOrder = 6; s.tag.position.set(s.x, 1.35, s.z); });
      toast('MY RING! I TOOK IT OFF TO WASH. ' + (J.ring.back ? 'I WAS IN THE READING ROOM.' : 'I WAS OUT HERE.') + ' SEARCH THE "?"', 3.4); },
    prompt(P) { const J = JX; if (J.has) return nearOra(P) ? 'GIVE THE RING TO ORA' : null; if (J.act > 0) return null; const s = near(P); return s ? 'SEARCH \u00b7 ' + s.n : null; },
    talk(P) { const J = JX; if (J.has) { if (nearOra(P)) { shimmer(); RING.visible = false; addGold(J.wrong <= 3 ? 6 : 4); toast('ORA: "I SAW YOU WOULD FIND IT." \u00b7 RING RETURNED', 2.6); NEXT(() => finishGame(), 0.8); J.has = false; J.back = true; return true; } return false; }
      const s = near(P); if (!s || J.act > 0) return !!s; J.act = 0.7; s.done = true; s.tag.visible = false; noise(0.25, 0.02, 1500);
      if (s === J.ring) { J.has = true; RING.visible = true; RING.position.set(s.x, 1.0, s.z); tone(988, 0.05, 0.4, 'triangle'); tone(1318, 0.04, 0.5, 'triangle', 0.12); addGold(3); toast('FOUND IT! TAKE IT BACK TO ORA', 2.2); return true; }
      J.wrong++; const d = Math.hypot(s.x - J.ring.x, s.z - J.ring.z), w = J.last == null ? (d < 8 ? 'WARM' : 'COLD') : d < J.last ? 'WARMER' : 'COLDER'; J.last = d;
      if (J.wrong > 3) miss('NOT HERE \u00b7 THE BALL FEELS ' + w, 1.8); else { tone(w.startsWith('WARM') ? 523 : 262, 0.04, 0.3, 'sine'); toast('NOT HERE \u00b7 THE BALL FEELS ' + w, 1.8); } return true; },
    tick(dt) { const J = JX; J.act = Math.max(0, J.act - dt); (J.sp || []).forEach(s => { if (s.tag && s.tag.visible) s.tag.position.y = 1.35 + Math.sin(J.t * 3 + s.i) * 0.06; });
      if (J.has && J.P) { RING.position.lerp(V(J.P.x, 1.55, J.P.z), Math.min(1, dt * 6)); RING.rotation.y += dt * 3; }
      if (J.t > 100 + (J.slow || 0) * 20) { J.slow = (J.slow || 0) + 1; miss('ORA IS TAPPING HER FOOT', 1.4); } },
    goal() { const J = JX; return J.has ? [ORA.x, ORA.z, 0] : null; },
    card() { const J = JX; const left = (J.sp || []).filter(s => !s.done).length; return [J.has ? 'BRING IT TO ORA' : 'SEARCH THE TENT', '<div style="font-size:13px;font-weight:800">' + (J.has ? 'RING FOUND \u2713' : 'SPOTS LEFT \u00b7 ' + left + ' \u00b7 WRONG \u00b7 ' + J.wrong) + '</div>', (J.has ? 'h' : 's') + left]; },
    end() { RING.visible = false; } };
  return { GD: { hang: G3, ring: G4 }, lookTick, ITEMS, SPOTS, tips: ['Match the tag, not the shape. Lumi mixes them up.', 'A ring is never lost. It is only somewhere else.'] };
}
