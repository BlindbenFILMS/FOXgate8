import { applyD, lifeD } from '../engine/fox-poses.js?v=s648k';   // s630 jointed tavern patrons, pianist + cook
// MERU 2.0 — s89 TAVERN DELUXE PART C2 (Ben's LOOK list, s86): the tavern comes alive. Plugged into worlds/meru2-tavern-jobs.js as LF.
// NIGHT CROWD: patrons sit at the round tables by the hour (2 in the morning, 4 by day, 7 in the evening, 10 at night; 6 max on phones), mugs in hand, a sip now and then.
// PIANO in the south-west corner (west wall): upright, bench, candle; a PIANIST plays 7 PM - 1 AM; E = play a tune (or ask him for one).
// KITCHEN HATCH on the west wall by the bar: a nook with a counter, a COOK in a chef hat (7 AM - 11 PM), plates, a bell, a soup pot with STEAM.
// CELLAR: more barrels (a 2-high rack along the south wall east of the tuns, a cradle row under the tally board on the east wall).
// BEER GARDEN: the deck out back (worlds/meru2-tavdeck.js, s34) gets patrons at its bistro tables by the hour (2-4, 11 AM - 10 PM): tavJ.deck(dk) + deckTick.
export function tvLife(X) {
  const { THREE, G, scene, L, RAD, box, cyl, LM, CT, fitTxt, kit, cols, hour, touch, tone, toast } = X;
  const INK = '#201e1d', YEL = '#ffd23a', WHITE = '#f3f2f2', BRASS = '#e0a84a', WOOD = '#3a2618', CY = -3.2;
  const hr = () => (hour ? hour() : 12) % 24;
  const LOOKS = [['#8f3445', '#e9dcc4', '#3d1a22', 'coat'], ['#2e4a6b', '#f3f2f2', '#1a2a3e', 'suit'], ['#3f7a52', '#e9dcc4', '#22382a', 'vest'], ['#c75b9b', '#9a4078', '#6a2a50', 'dress'], ['#5a8ac8', '#3d6aa0', '#2a4a70', 'vest'],
    ['#ffd23a', '#5c6670', INK, 'vest'], ['#7c3aed', '#ede9fe', '#4c1d95', 'coat'], ['#b8733f', '#f6e2cc', '#6b3d22', 'vest'], ['#52525b', '#e6ecf4', '#27272a', 'suit'], ['#e07a30', '#fff0e0', '#b05a1e', 'dress'], ['#0e7fb8', '#e0f2fe', '#0b3a52', 'coat'], ['#2f7a4a', '#ffd23a', '#1a3318', 'vest']];
  const FURS = [{}, { fur: '#8a6a4a', furDark: '#5f4630', muzzle: '#ece0d0' }, { fur: '#a86a9a', furDark: '#7a4a70', muzzle: '#f4e4f0', lashes: 1 }, { fur: '#5a4a3a', furDark: '#3a2e22' }, { fur: '#c9743a', furDark: '#9a5426' }, { elder: 1 }];
  const mugGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.12, 8);
  const mkPatron = (key, i, mug = true) => { const lk = LOOKS[i % LOOKS.length], f = kit.makeFox({ joints: true, key, torso: lk.slice(0, 3), outfit: lk[3], mood: i % 3 ? 'happy' : 'neutral', look: FURS[i % FURS.length] });
    const P = f.userData && f.userData.P; if (mug && P && P.hands && P.hands[1] && P.fore) { const m = new THREE.Mesh(mugGeo, LM(i % 2 ? BRASS : '#9aa0a6')); m.position.set(0, -0.1, 0.05); m.scale.setScalar(0.8); P.hands[1].g.add(m); } else if (mug && P && P.arms && P.arms[1]) { const m = new THREE.Mesh(mugGeo, LM(i % 2 ? BRASS : '#9aa0a6')); m.position.set(0, -0.48, 0.1); P.arms[1].add(m); }   /* s630: the mug sits in the real paw */ f.visible = false; f.userData.ph = Math.random() * 10; return f; };
  const sitPose = (f, dt, t) => { kit.animFox(f, dt, 0, false); const P = f.userData && f.userData.P; if (!P) return; if (P.fore) { applyD(THREE, f, lifeD('sitDrink', t, { ph: f.userData.ph || 0 }), t, 1); return; } if (P.legs) P.legs.forEach(l => { l.rotation.x = -1.45; }); if (!P.fore && P.hero && P.body) P.body.position.y = -P.hero.dL;
    if (P.arms && P.arms[1]) { const k = (t + f.userData.ph) % 9, sip = k > 7.4 ? Math.sin((k - 7.4) / 1.6 * Math.PI) : 0; P.arms[1].rotation.x = -0.9 - sip * 1.2; P.arms[1].rotation.z = 0.15; }
    if (P.head) P.head.rotation.y = Math.sin(t * 0.4 + f.userData.ph) * 0.35; };
  // ================= NIGHT CROWD at the round tables =================
  const TB = L.tables || [], SEATS = [];
  TB.forEach((T, ti) => { for (const j of [1, 2]) { const a = j / 3 * Math.PI * 2 + 0.4 + RAD(T.a); SEATS.push({ x: T.x + Math.sin(a) * 1.32, z: T.z + Math.cos(a) * 1.32, ry: a + Math.PI, ti });   /* s181: fox-scale chairs (meru-tavern.js) */ } });
  { let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = SEATS.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [SEATS[i], SEATS[j]] = [SEATS[j], SEATS[i]]; } }
  const MAXC = Math.min(SEATS.length, touch ? 6 : 10), CROWD = [];
  const want = h => { const n = h >= 20 || h < 2 ? 10 : h >= 17 ? 7 : h >= 11 ? 4 : h >= 7 ? 2 : 1; return Math.min(MAXC, n); };
  let cN = -1;
  function crowdSet(n) { if (n === cN) return; cN = n; for (let i = 0; i < MAXC; i++) { if (i >= n) { if (CROWD[i]) CROWD[i].visible = false; continue; }
      const f = CROWD[i] || (CROWD[i] = (() => { const q = mkPatron('tvCrowd' + i, i + 3); G.add(q); return q; })()), S = SEATS[i]; f.position.set(S.x, 0.15, S.z); f.rotation.y = S.ry; f.visible = true; } }
  // ================= PIANO (south-west corner, west wall) =================
  const PN = L.piano || { x: 12.42, z: -71.5, a: 90 }, PA = RAD(PN.a), PG = new THREE.Group(); PG.position.set(PN.x, 0, PN.z); PG.rotation.y = PA; G.add(PG);
  { const BODY = '#2a1a12'; box(PG, 1.5, 1.3, 0.6, BODY, 0, 0.65, 0); box(PG, 1.56, 0.06, 0.64, '#1a100a', 0, 1.33, 0); box(PG, 1.42, 0.08, 0.34, BODY, 0, 0.76, 0.46); box(PG, 1.5, 0.3, 0.06, BODY, 0, 0.18, 0.3);
    for (const s of [-1, 1]) box(PG, 0.06, 0.78, 0.36, BODY, s * 0.73, 0.4, 0.45);
    const kt = CT(256, 32, (c, w, h) => { c.fillStyle = WHITE; c.fillRect(0, 0, w, h); c.fillStyle = INK; for (let i = 0; i <= 36; i++) c.fillRect(i * (w / 36), 0, 1, h); const blk = [1, 2, 4, 5, 6]; for (let o = 0; o < 6; o++) for (const b of blk) c.fillRect((o * 7 + b) * (w / 42) - 2.5, 0, 5, h * 0.6); });
    const k = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.16), new THREE.MeshBasicMaterial({ map: kt })); k.rotation.x = -Math.PI / 2; k.position.set(0, 0.805, 0.5); PG.add(k);
    box(PG, 1.3, 0.24, 0.02, '#1a100a', 0, 1.0, 0.31); const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.28), LM('#efe6d2')); sh.position.set(0, 1.02, 0.325); sh.rotation.x = -0.15; PG.add(sh);
    cyl(PG, 0.04, 0.04, 0.12, '#efe6d2', 0.55, 1.42, 0.05, 8); cyl(PG, 0.06, 0.07, 0.03, BRASS, 0.55, 1.37, 0.05, 8);
    box(PG, 0.9, 0.08, 0.36, WOOD, 0, 0.5, 1.05); for (const sx of [-0.38, 0.38]) for (const sz of [-0.13, 0.13]) box(PG, 0.05, 0.48, 0.05, WOOD, sx, 0.24, 1.05 + sz);
    const [ax, az] = [PN.x, PN.z]; cols.push({ f: [ax - 0.05, ax + 0.75, az - 0.8, az + 0.8] }); }
  const pW = (lx, lz) => [PN.x + lx * Math.cos(PA) + lz * Math.sin(PA), PN.z - lx * Math.sin(PA) + lz * Math.cos(PA)];
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), new THREE.MeshBasicMaterial({ color: '#ffb04a' })); flame.position.set(0.55, 1.51, 0.05); PG.add(flame);
  let pianist = null; const getPianist = () => { if (pianist) return pianist; pianist = mkPatron('tvPianist', 8, false); const [x, z] = pW(0, 1.05); pianist.position.set(x, 0.04, z); pianist.rotation.y = PA + Math.PI; G.add(pianist);
    const P = pianist.userData && pianist.userData.P; if (P && P.head) { const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.05, 12), LM(INK)); hat.position.y = 0.32; P.head.add(hat); } return pianist; };
  const pianistOn = () => { const h = hr(); return h >= 19 || h < 1; };
  const TUNES = [[0, 4, 7, 12, 7, 4, 0, -5, 0], [7, 5, 4, 2, 0, 2, 4, 0], [0, 0, 7, 7, 9, 9, 7, 5, 5, 4, 4, 2, 2, 0], [12, 11, 9, 7, 9, 7, 4, 0]];
  let tuneI = 0, tuneT = 0; const playTune = () => { const T = TUNES[tuneI++ % TUNES.length]; T.forEach((n, i) => { const f = 261.63 * Math.pow(2, n / 12); tone(f, 0.06, 0.9, 'triangle', i * 0.28); tone(f / 2, 0.025, 0.9, 'sine', i * 0.28); }); tuneT = T.length * 0.28 + 0.4; };
  const benchFront = pW(0, 1.75), nearPiano = P => Math.hypot(P.x - benchFront[0], P.z - benchFront[1]) < 1.4 && Math.abs(P.y || 0) < 1.5;
  // ================= KITCHEN HATCH (west wall, by the bar) =================
  const KH = L.kitchen || { x: 12.0, z: -95.5 }, KW = 2.2, KD = 0.95;
  { const kt = CT(512, 256, (c, w, h) => { c.fillStyle = '#e8dcc4'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = 0; x < w; x += 32) c.fillRect(x, 0, 2, h); for (let y = 0; y < h; y += 32) c.fillRect(0, y, w, 2);
      c.fillStyle = '#5a3d26'; c.fillRect(0, 70, w, 10); c.fillStyle = '#9aa0a6'; [[60, 40, 30], [150, 34, 26], [380, 44, 34]].forEach(([x, rw, rh]) => c.fillRect(x, 70 - rh, rw, rh)); c.fillStyle = '#b87333'; for (const x of [250, 300, 340]) { c.beginPath(); c.arc(x, 120, 20, 0, 7); c.fill(); c.fillRect(x - 2, 90, 4, 12); }
      c.fillStyle = '#2b2a2e'; c.fillRect(40, 180, 430, 76); c.fillStyle = '#ff8a3a'; c.fillRect(80, 196, 120, 10); c.fillRect(300, 196, 120, 10); });
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(KW, 1.5), new THREE.MeshBasicMaterial({ map: kt })); bd.position.set(KH.x + 0.03, 1.7, KH.z); bd.rotation.y = Math.PI / 2; G.add(bd);
    for (const s of [-1, 1]) box(G, KD, 2.7, 0.1, WOOD, KH.x + KD / 2, 1.35, KH.z + s * (KW / 2 + 0.05));
    box(G, KD, 0.5, KW + 0.2, WOOD, KH.x + KD / 2, 2.7, KH.z); box(G, 0.1, 1.05, KW, '#6b4a35', KH.x + KD - 0.05, 0.525, KH.z); box(G, 0.62, 0.06, KW + 0.1, '#7a5236', KH.x + KD - 0.2, 1.08, KH.z); box(G, 0.04, 0.04, KW + 0.1, BRASS, KH.x + KD + 0.11, 1.1, KH.z);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.32), new THREE.MeshBasicMaterial({ map: CT(512, 112, (c, w, h) => { c.fillStyle = INK; c.fillRect(0, 0, w, h); c.fillStyle = YEL; c.textBaseline = 'middle'; fitTxt(c, 'KITCHEN', 20, h / 2 + 2, w - 40, 64); }) }));
    sg.position.set(KH.x + KD + 0.06, 2.7, KH.z); sg.rotation.y = Math.PI / 2; G.add(sg);
    for (const dz of [-0.55, 0.35]) { cyl(G, 0.17, 0.15, 0.025, WHITE, KH.x + KD - 0.15, 1.125, KH.z + dz, 14); const fd = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 6, 0, 6.3, 0, 1.5), LM(dz < 0 ? '#b8733f' : '#d99a2b')); fd.position.set(KH.x + KD - 0.15, 1.14, KH.z + dz); G.add(fd); }
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 6, 0, 6.3, 0, 1.6), LM(BRASS)); bell.position.set(KH.x + KD - 0.1, 1.11, KH.z + 0.85); G.add(bell);
    cyl(G, 0.17, 0.16, 0.24, '#5c6670', KH.x + KD - 0.28, 1.23, KH.z - 0.95 + 0.1, 14); cols.push({ f: [KH.x, KH.x + KD + 0.15, KH.z - KW / 2 - 0.15, KH.z + KW / 2 + 0.15] }); }
  const steamT = CT(64, 64, (c, w) => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, w); });
  const STEAM = [...Array(touch ? 5 : 8)].map((_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamT, transparent: true, depthWrite: false, opacity: 0 })); s.userData.t = i / (touch ? 5 : 8); G.add(s); return s; });
  const SX = KH.x + KD - 0.28, SZ = KH.z - 0.85;
  const cook = kit.makeFox({ joints: true, key: 'tvCook', torso: [WHITE, '#e6ecf4', '#9aa0a6'], outfit: 'vest', mood: 'happy', look: { fur: '#c9743a', furDark: '#9a5426' } }); cook.position.set(KH.x + 0.38, 0, KH.z); cook.rotation.y = Math.PI / 2; G.add(cook);
  { const P = cook.userData && cook.userData.P; if (P && P.head) { const h = new THREE.Group(); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.22, 12), LM('#ffffff')); a.position.y = 0.4; h.add(a); const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), LM('#ffffff')); b.position.y = 0.55; b.scale.y = 0.6; h.add(b); P.head.add(h); } }
  const cookOn = () => { const h = hr(); return h >= 7 && h < 23; };
  // ================= CELLAR BARRELS =================
  { const CG = new THREE.Group(); G.add(CG); const bar = (x, y, z, ry, r = 0.38) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(0, ry, Math.PI / 2); CG.add(g); cyl(g, r, r, 0.85, '#7a5236', 0, 0, 0, 12); for (const d of [-0.3, 0.3]) cyl(g, r + 0.012, r + 0.012, 0.03, '#2b2a2e', 0, d, 0, 12); cyl(g, r * 0.92, r * 0.92, 0.87, '#5c3e28', 0, 0, 0, 12).scale.set(1, 1, 1); };
    for (const x of [41.9, 42.7, 43.5, 44.3]) { box(CG, 0.12, 0.12, 1.0, '#4a3424', x, CY + 0.06, -87.2); } box(CG, 3.0, 0.1, 0.12, '#4a3424', 43.1, CY + 0.06, -86.8); box(CG, 3.0, 0.1, 0.12, '#4a3424', 43.1, CY + 0.06, -87.6);
    [41.95, 42.75, 43.55, 44.35].forEach(x => bar(x, CY + 0.5, -87.2, 0)); [42.35, 43.15, 43.95].forEach(x => bar(x, CY + 1.22, -87.2, 0));
    box(CG, 0.12, 0.1, 3.2, '#4a3424', 51.0, CY + 0.06, -93.9); box(CG, 0.12, 0.1, 3.2, '#4a3424', 51.4, CY + 0.06, -93.9); [-95.0, -94.0, -93.0].forEach(z => bar(51.2, CY + 0.46, z, Math.PI / 2, 0.36));
    CG.traverse(o => { if (o.isMesh) o.renderOrder = -2; }); cols.push({ f: [41.4, 44.8, -87.8, -86.3], y0: CY - 1, y1: -0.8 }, { f: [50.7, 51.7, -95.5, -92.4], y0: CY - 1, y1: -0.8 }); }
  // ================= BEER GARDEN (the deck out back) =================
  let DK = null; const DECK = [];
  function deck(dk) { if (!dk || !dk.seats || !dk.seats.length) return; const S = dk.seats, pick = []; const skipT = dk.duetT || [], tabs = [...new Set(S.map(s => s.t))].filter(t => !skipT.includes(t)); for (const t of tabs) { const ss = S.filter(s => s.t === t); pick.push(ss[0]); if (ss[2]) pick.push(ss[2]); }
    DK = { dk, seats: pick, cx: (dk.rect[0] + dk.rect[1]) / 2, cz: (dk.rect[2] + dk.rect[3]) / 2 }; }
  const deckWant = h => (h >= 18 && h < 22 ? (touch ? 3 : 4) : h >= 15 && h < 18 ? 3 : h >= 11 && h < 15 ? 2 : 0);
  let dN = -1;
  function deckTick(dt, P) { if (!DK) return; const far = Math.hypot(P.x - DK.cx, P.z - DK.cz) > (touch ? 35 : 55), n = far ? 0 : Math.min(deckWant(hr()), DK.seats.length), t = performance.now() / 1000;
    if (n !== dN) { dN = n; for (let i = 0; i < Math.max(n, DECK.length); i++) { if (i >= n) { if (DECK[i]) DECK[i].visible = false; continue; } const f = DECK[i] || (DECK[i] = (() => { const q = mkPatron('tvDeck' + i, i + 6); scene.add(q); return q; })()), S = DK.seats[i]; f.position.set(S.x, S.y + 0.04, S.z); f.rotation.y = S.ry; f.visible = true; } }
    for (let i = 0; i < n; i++) sitPose(DECK[i], dt, t); }
  // ================= per frame (tavern frame) =================
  let hT = 0;
  function tick(dt, P, inRoom) { const t = performance.now() / 1000; if ((hT -= dt) <= 0) { hT = 2; crowdSet(want(hr())); const pOn = pianistOn(); if (pOn || pianist) getPianist().visible = pOn; cook.visible = cookOn(); }
    flame.scale.y = 0.85 + Math.sin(t * 11) * 0.15; if (!inRoom) return;
    for (let i = 0; i < cN; i++) if (CROWD[i]) sitPose(CROWD[i], dt, t);
    if (pianist && pianist.visible) { kit.animFox(pianist, dt, 0, false); const Q = pianist.userData && pianist.userData.P; if (Q && Q.fore) applyD(THREE, pianist, lifeD('piano', t), t, 1); else if (Q) { if (Q.legs) Q.legs.forEach(l => { l.rotation.x = -1.45; }); if (!Q.fore && Q.hero && Q.body) Q.body.position.y = -Q.hero.dL; if (Q.arms) Q.arms.forEach((a, k) => { a.rotation.x = -1.15 + Math.sin(t * 7 + k * 1.7) * 0.12; a.rotation.z = (k ? 1 : -1) * (0.25 + Math.sin(t * 3.1 + k) * 0.12); }); if (Q.head) Q.head.rotation.z = Math.sin(t * 1.6) * 0.1; } }
    if (cook.visible) { kit.animFox(cook, dt, 0, false); const Q = cook.userData && cook.userData.P; if (Q && Q.fore) applyD(THREE, cook, lifeD('cook', t), t, 1); else if (Q && Q.arms) { Q.arms[0].rotation.x = -1.0 + Math.sin(t * 5) * 0.25; Q.arms[1].rotation.x = -0.7 + Math.sin(t * 2.3) * 0.1; } }
    STEAM.forEach(s => { s.userData.t = (s.userData.t + dt * 0.35) % 1; const k = s.userData.t; s.position.set(SX + Math.sin(k * 6 + s.id) * 0.08, 1.38 + k * 1.1, SZ + Math.cos(k * 5 + s.id) * 0.06); s.scale.setScalar(0.18 + k * 0.42); s.material.opacity = (cook.visible ? 0.5 : 0.18) * Math.sin(k * Math.PI); });
    if (tuneT > 0) tuneT -= dt; }
  function prompt(P) { if (nearPiano(P)) return pianistOn() ? 'ASK FOR A SONG \u00b7 THE PIANIST' : 'PLAY \u00b7 THE PIANO'; return null; }
  function talk(P) { if (!nearPiano(P)) return false; if (tuneT > 0) return true; playTune(); toast(pianistOn() ? 'THE PIANIST: "THIS ONE IS FOR THE BARKEEP."' : '\u266A A LITTLE TAVERN TUNE', 2.4); return true; }
  return { tick, prompt, talk, deck, deckTick, crowd: () => cN };
}
