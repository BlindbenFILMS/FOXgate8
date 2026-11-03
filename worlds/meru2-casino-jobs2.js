// MERU 2.0 — s90 CASINO DELUXE PART B: SECURITY CAMERAS (count room CCTV desk: flip 4 cameras, tap the guest with a card up his sleeve, 3 rounds)
// · SORE LOSER (walk: calm Grumbles at the roulette, walk him to the door; he stops for "one more spin" and needs a word) · JACKPOT PARTY (walk:
// a slot hits, siren + lights; fetch the BIG CHEQUE from Nickel, hand it to the winner, confetti) + the JACKPOT FX (beacon, floor flash, coin
// fountain, siren) that also fires on its own every few minutes while you are in the casino. Called from meru2-casino-jobs.js (old casino frame).
export const gamesB = () => [{ k: 'cctv', name: 'Security Cameras', color: '#2e4a6b', grp: 'back' }, { k: 'loser', name: 'Sore Loser', color: '#ec3013', walk: true, grp: 'floor' }, { k: 'jackpot', name: 'Jackpot Party', color: '#ffd23a', walk: true, grp: 'floor' }];
const SUSN = ['SLICK RENNY', 'DAPPER DEX', 'MOLLY FINCH', 'COUNT VOSS', 'GINGER TAM'];
export function casJobsB(X) {
  const { THREE, G, L, toWo, RAD, V, box, cyl, LM, CT, kit, own, fly, miss, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, coin, lst, lab, tagSprite, TAPR, scrW, dist, sayTo, rnd, shuffle, touch, J, CA, snap, PLAYER_FEMALE } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', GOLD = '#c9a227';
  const P0 = (L.pokers || []), STUD = P0.find(p => p.game === 'stud') || P0[0], HOLD = P0.find(p => p.game === 'holdem') || P0[1] || STUD, CR = L.craps || { x: -118, z: 24, a: 180 }, RO = L.roulette || { x: -112, z: -22, a: 0 };
  const seat = (T, k) => { const a = Math.PI * 0.2 + k * Math.PI * 0.15, px = Math.cos(a) * 3.0, pz = Math.sin(a) * 2.05, [x, z] = toWo(T, px, pz); return { x, z, ry: RAD(T.a) + Math.atan2(-px, -pz) }; };
  const at = (T, lx, lz, dry) => { const [x, z] = toWo(T, lx, lz); return { x, z, ry: RAD(T.a) + dry }; };
  const S1 = (L.slots || []).find(s => (s.a || 0) === 0 && s.z < 0) || { x: -140.1, z: -9.2, a: 0 };
  const SPOT = [seat(STUD, 3), seat(HOLD, 4), at(CR, 1.3, 1.6, Math.PI), at(RO, 1.0, 1.25, Math.PI), at(S1, 0, 1.2, Math.PI)];
  const LOOKS = [['#2e86b8', '#f3f2f2', '#16435c'], ['#3f9a5e', '#ffd23a', '#1e5230'], ['#a78bfa', '#f3f2f2', '#4a2a7a'], ['#201e1d', GOLD, '#111111'], ['#f97316', '#f3f2f2', '#7a3a0a']];
  const SUS = SPOT.map((s, i) => { const f = kit.makeFox({ key: 'csSus' + i, torso: LOOKS[i], outfit: i === 3 ? 'suit' : i % 2 ? 'coat' : 'vest', mood: 'happy', look: i === 2 ? PLAYER_FEMALE : undefined }); f.position.set(s.x, 0, s.z); f.rotation.y = s.ry; f.visible = false; G.add(f); return { f, ...s, n: SUSN[i] }; });
  const CAMS = [{ n: 'POKER ROOM', pos: V(-129.5, 7.3, -11), look: V(-130.5, 0.7, -21.5), s: [0, 1] }, { n: 'ROULETTE', pos: V(-106.2, 7.3, -11.5), look: V(-113, 0.7, -21.5), s: [3] },
    { n: 'CRAPS', pos: V(-109, 7.3, 13.5), look: V(-118, 0.7, 23), s: [2] }, { n: 'SLOT FLOOR', pos: V(-129, 7.3, 1.5), look: V(-140, 0.7, -8.5), s: [4] }];
  const sleeveT = CT(64, 90, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(2, 2, w - 4, h - 4); g.fillStyle = RED; g.font = '900 54px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('\u2665', w / 2, h / 2 + 4); });
  const SLEEVE = new THREE.Sprite(new THREE.SpriteMaterial({ map: sleeveT })); SLEEVE.scale.set(0.42, 0.58, 1); SLEEVE.visible = false; G.add(SLEEVE);
  // ---------- CCTV overlay (Modernist: ink frame, REC, flush-left labels, 48 px camera buttons) ----------
  const OV = document.createElement('div'); OV.style.cssText = 'position:fixed;inset:0;z-index:28;pointer-events:none;display:none;font-family:Archivo,sans-serif';
  OV.innerHTML = '<div style="position:absolute;inset:0;background:repeating-linear-gradient(rgba(0,0,0,0.16) 0 2px, transparent 2px 4px), rgba(120,170,150,0.10)"></div>'
    + '<div data-l style="position:absolute;left:50%;top:104px;transform:translateX(-50%);display:flex;gap:8px;align-items:center;background:#201e1d;color:#f3f2f2;font-weight:900;font-size:14px;padding:6px 10px;white-space:nowrap"><span style="width:10px;height:10px;background:#ec3013;border-radius:50%"></span><span data-t></span></div>'
    + '<div data-b style="position:absolute;left:50%;bottom:84px;transform:translateX(-50%);display:flex;gap:0;pointer-events:auto;border:2px solid #201e1d"></div>';
  document.body.appendChild(OV); const OVT = OV.querySelector('[data-t]'), OVB = OV.querySelector('[data-b]');
  const camBtns = CAMS.map((c, i) => { const b = document.createElement('button'); b.textContent = 'CAM ' + (i + 1); b.setAttribute('aria-label', 'Camera ' + (i + 1) + ' ' + c.n);
    b.style.cssText = 'min-width:64px;height:48px;border:0;border-left:' + (i ? '2px solid #201e1d' : '0') + ';font:900 14px Archivo,sans-serif;cursor:pointer;padding:0 10px;text-align:left';
    b.addEventListener('click', e => { e.stopPropagation(); if (J.g !== 'cctv') return; J.cam = i; snap(); tone(1200, 0.04, 0.06, 'square'); paintBtns(); }); OVB.appendChild(b); return b; });
  const paintBtns = () => { camBtns.forEach((b, i) => { const on = J.cam === i; b.style.background = on ? '#ec3013' : '#f3f2f2'; b.style.color = on ? '#ffffff' : '#201e1d'; }); OVT.textContent = 'CAM ' + (J.cam + 1) + ' \u00b7 ' + CAMS[J.cam].n + ' \u00b7 REC'; };
  const susHead = s => V(s.x, 1.35, s.z);
  // ================= SECURITY CAMERAS (tap, at the count room desk) =================
  const B1 = {
    begin() { J.r = 0; J.cam = 0; SUS.forEach(s => { s.f.visible = true; }); OV.style.display = 'block'; paintBtns(); this.round(); toast('A CHEAT IS ON THE FLOOR \u00b7 FLIP THE CAMERAS \u00b7 TAP HIM WHEN THE CARD SHOWS', 3.4); },
    round() { J.ch = (Math.random() * SUS.length) | 0; J.told = 0; J.tt = rnd(1.5, 3); J.tell = 0; },
    tick(dt) { J.tt -= dt; const s = SUS[J.ch];
      if (J.tell > 0) { J.tell -= dt; const k = 1 - Math.max(0, J.tell) / 1.6; SLEEVE.visible = true; const r = s.ry; SLEEVE.position.set(s.x + Math.sin(r) * 0.42 + Math.cos(r) * 0.25, 1.0 + Math.sin(k * Math.PI) * 0.35, s.z + Math.cos(r) * 0.42 - Math.sin(r) * 0.25); s.f.rotation.y = s.ry + Math.sin(J.t * 9) * 0.25; if (J.tell <= 0) { SLEEVE.visible = false; s.f.rotation.y = s.ry; } }
      else if (J.tt <= 0) { J.tell = 1.6; J.told++; J.tt = 3.6; }
      SUS.forEach((q, i) => { if (q.f.visible) kit.animFox(q.f, dt, 0, false); }); },
    press() { let b = -1, bd = TAPR() * 1.7; CAMS[J.cam].s.forEach(i => { const d = dist(scrW(susHead(SUS[i]))), d2 = dist(scrW(V(SUS[i].x, 0.8, SUS[i].z))); const m = Math.min(d, d2); if (m < bd) { bd = m; b = i; } }); if (b < 0) return;
      if (b !== J.ch) { miss('NOT ' + SUS[b].n + ' \u00b7 PLAYING FAIR', 1.6); return; }
      if (!J.told) { miss('NO PROOF YET \u00b7 WAIT FOR THE CARD', 1.6); return; }
      addGold(8); ding(); SLEEVE.visible = false; J.tell = 0; toast('CAUGHT \u00b7 ' + SUS[b].n + ' \u00b7 A CARD UP THE SLEEVE', 1.8); J.r++; if (J.r >= 3) NEXT(finishGame, 1.0); else NEXT(() => B1.round(), 1.2); },
    card() { const onCam = CAMS[J.cam].s.includes(J.ch); return ['FLIP CAMS \u00b7 TAP THE CHEAT', lab('CAM ' + (J.cam + 1) + ' \u00b7 ' + CAMS[J.cam].n) + lst([0, 1, 2].map(i => [RED, 'CHEAT ' + (i + 1), i < J.r ? 'CAUGHT' : i === J.r ? 'AT LARGE' : '', i < J.r])), J.r + '_' + J.cam + (onCam ? 'o' : '')]; },
    hint() { if (!J.told || !CAMS[J.cam].s.includes(J.ch)) return null; return [susHead(SUS[J.ch]), 'TAP']; },
    shot() { const c = CAMS[J.cam]; return { pos: c.pos, look: c.look }; },
    end() { OV.style.display = 'none'; SLEEVE.visible = false; SUS.forEach(s => { s.f.visible = false; s.f.rotation.y = s.ry; }); } };
  // ================= SORE LOSER (walk) =================
  const LOS = kit.makeFox({ key: 'csLoser', torso: ['#8a6a42', '#f3f2f2', '#4a3418'], outfit: 'coat', mood: 'angry' }); LOS.visible = false; G.add(LOS);
  const LH = at(RO, -1.25, 1.3, Math.PI), DOORP = [-107.4, 0], lT = { key: 'csLoser', name: 'Grumbles', role: 'SORE LOSER', obj: LOS, ry: LH.ry, r: 6 };
  const lLn = text => ({ who: 'csLoser', role: 'SORE LOSER', text });
  const moveTo = (f, x, z, sp, dt) => { const dx = x - f.position.x, dz = z - f.position.z, d = Math.hypot(dx, dz); if (d < 0.05) { kit.animFox(f, dt, 0, false); return d; } const s = Math.min(d, sp * dt); f.position.x += dx / d * s; f.position.z += dz / d * s; let a = Math.atan2(dx, dz) - f.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); f.rotation.y += a * Math.min(1, dt * 8); kit.animFox(f, dt, sp, false); return d; };
  const B2 = { walk: true,
    begin() { J.ph = 'rant'; LOS.position.set(LH.x, 0, LH.z); LOS.rotation.y = LH.ry; LOS.visible = true; J.st = 0; toast('A SORE LOSER AT THE ROULETTE \u00b7 WALK HIM TO THE DOOR', 2.8); tone(180, 0.06, 0.4, 'square'); },
    near(P, r = 2.0) { return Math.hypot(P.x - LOS.position.x, P.z - LOS.position.z) < r; },
    tick(dt) { const P = J.P; if (!P) return;
      if (J.ph === 'rant') { LOS.rotation.y = LH.ry + Math.sin(J.t * 5) * 0.3; kit.animFox(LOS, dt, 0, false); if ((J.rt = (J.rt || 0) - dt) <= 0) { J.rt = 4; toast('GRUMBLES: "RIGGED! THAT WHEEL IS RIGGED!"', 1.6); } }
      else if (J.ph === 'follow') { const d = Math.hypot(P.x - LOS.position.x, P.z - LOS.position.z); if (d > 1.6) moveTo(LOS, P.x, P.z, Math.min(3.6, 1.2 + d), dt); else kit.animFox(LOS, dt, 0, false);
        J.st -= dt; if (J.st <= 0) { J.ph = 'back'; toast('GRUMBLES: "ONE MORE SPIN!" \u00b7 HE IS HEADING BACK', 2); tone(220, 0.05, 0.3, 'square'); } }
      else if (J.ph === 'back') { moveTo(LOS, LH.x, LH.z, 1.6, dt); }
      else if (J.ph === 'out') { if (moveTo(LOS, -101.5, 0, 2.4, dt) < 0.3) { LOS.visible = false; J.ph = 'gone'; addGold(J.rude ? 6 : 12); ding(); NEXT(finishGame, 0.4); } } },
    goal() { if (J.ph === 'follow') return [DOORP[0], DOORP[1], 0]; if (J.ph === 'rant' || J.ph === 'back') return [LOS.position.x, LOS.position.z, 0.4]; return null; },
    prompt(P) { if ((J.ph === 'rant' || J.ph === 'back') && this.near(P)) return J.ph === 'rant' ? 'TALK \u00b7 GRUMBLES' : 'CALM HIM DOWN'; if (J.ph === 'follow' && Math.hypot(P.x - DOORP[0], P.z - DOORP[1]) < 2.6 && this.near(P, 3.6)) return 'SHOW HIM OUT'; return null; },
    talk(P) { if (J.ph === 'rant' && this.near(P)) { sayTo(lT, [{ ...lLn('Rigged! That wheel is RIGGED! I want my gold back!'), choices: [
        { text: 'THIS WAY, SIR. THE HOUSE THANKS YOU.', pick: () => { if (!J || J.g !== 'loser') return; J.rude = false; J.ph = 'follow'; J.st = rnd(8, 11); toast('HE FOLLOWS YOU \u00b7 TO THE FRONT DOOR', 1.8); } },
        { text: 'OUT. NOW.', pick: () => { if (!J || J.g !== 'loser') return; J.rude = true; miss('GRUMBLES: "HOW RUDE!" \u00b7 HE FOLLOWS, SULKING', 2); J.ph = 'follow'; J.st = rnd(5, 7); } }] }]); return true; }
      if (J.ph === 'back' && this.near(P)) { J.ph = 'follow'; J.st = rnd(8, 11) - (J.rude ? 3 : 0); toast('GRUMBLES: "FINE. FINE."', 1.4); pop(); return true; }
      if (J.ph === 'follow' && Math.hypot(P.x - DOORP[0], P.z - DOORP[1]) < 2.6 && this.near(P, 3.6)) { J.ph = 'out'; toast('GRUMBLES: "I AM NEVER COMING BACK!" \u00b7 (HE WILL)', 2); return true; } return false; },
    card() { const t = { rant: 'TALK TO GRUMBLES', follow: 'WALK HIM TO THE DOOR', back: 'CATCH HIM \u00b7 E TO CALM', out: 'GOODBYE, GRUMBLES', gone: 'DONE' }[J.ph]; return [t, lst([[RED, 'GRUMBLES', J.ph === 'follow' ? 'FOLLOWING' : J.ph === 'back' ? 'WANDERING' : J.ph === 'out' || J.ph === 'gone' ? 'OUT' : 'RANTING', J.ph === 'out' || J.ph === 'gone']]), J.ph]; },
    end() { LOS.visible = false; } };
  // ================= JACKPOT FX (beacon, floor flash, coin fountain, siren) =================
  const FX = new THREE.Group(); FX.visible = false; G.add(FX);
  const beamT = CT(64, 64, g => { const r = g.createLinearGradient(0, 0, 64, 0); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(0.5, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const BEAC = new THREE.Group(); FX.add(BEAC); cyl(BEAC, 0.14, 0.18, 0.22, RED, 0, 0.11, 0, 12);
  for (const [c, ry] of [[RED, 0], [YEL, Math.PI / 2]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.5), new THREE.MeshBasicMaterial({ map: beamT, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: 0.8 })); m.position.y = 0.16; m.rotation.y = ry; BEAC.add(m); }
  const JSIGN = tagSprite('JACKPOT!', YEL, INK, 1.1); JSIGN.scale.set(1.4, 0.75, 1); FX.add(JSIGN);
  const FLOOR = new THREE.Mesh(new THREE.PlaneGeometry(44, 63), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); FLOOR.rotation.x = -Math.PI / 2; FLOOR.position.set(-127.5, 0.11, 0); FLOOR.renderOrder = 2; FLOOR.visible = false; G.add(FLOOR);
  const CN = touch ? 24 : 48, cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CN * 3), 3)); const COINS = new THREE.Points(cg, new THREE.PointsMaterial({ color: '#ffd23a', size: 0.12 })); COINS.frustumCulled = false; FX.add(COINS); const CV = [...Array(CN)].map(() => [0, -9, 0, 0, 0, 0]);
  const CF = touch ? 40 : 80, fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CF * 3), 3)); fg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(CF * 3), 3));
  const CONF = new THREE.Points(fg, new THREE.PointsMaterial({ size: 0.09, vertexColors: true })); CONF.frustumCulled = false; CONF.visible = false; G.add(CONF); const FV = [...Array(CF)].map(() => [0, -9, 0, 0, 0, 0]);
  { const ca = fg.attributes.color.array, pal = ['#ec3013', '#ffd23a', '#2f6fd6', '#1f8a4c', '#f3f2f2'].map(c => new THREE.Color(c)); for (let i = 0; i < CF; i++) { const c = pal[i % pal.length]; ca[i * 3] = c.r; ca[i * 3 + 1] = c.g; ca[i * 3 + 2] = c.b; } }
  let jpT = 0, jpSlot = null, ambT = rnd(60, 120), ac = null;
  // s101 (Ben: "the jackpot sound is off, try another one"): the sawtooth siren became a JACKPOT FANFARE: rising bell arpeggios (C E G C), a warm major chord swell and a shower of coin tinkles
  const siren = len => { if (X.isMuted && X.isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); const t0 = ac.currentTime, out = ac.createGain(); out.gain.value = 0.9; out.connect(ac.destination);
      const tone = (t, f, type, d, peak) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(out); o.start(t); o.stop(t + d + 0.05); };
      const bell = (t, f, d = 0.7, p = 0.06) => { tone(t, f, 'sine', d, p); tone(t, f * 2.76, 'sine', d * 0.35, p * 0.25); tone(t, f * 5.4, 'sine', d * 0.15, p * 0.12); };
      const ARP = [523.25, 659.25, 783.99, 1046.5]; const runs = Math.max(1, Math.round(len / 1.5));
      for (let r = 0; r < runs; r++) { const t = t0 + r * 1.5; ARP.forEach((f, k) => bell(t + k * 0.09, f * (r % 2 ? 1.122 : 1))); bell(t + 0.42, 2093, 1.1, 0.05); }
      for (const f of [261.63, 329.63, 392, 523.25]) { const o = ac.createOscillator(), g = ac.createGain(), l = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = f; l.type = 'lowpass'; l.frequency.value = 1800; g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.012, t0 + 0.5); g.gain.linearRampToValueAtTime(0.0001, t0 + len); o.connect(l); l.connect(g); g.connect(out); o.start(t0); o.stop(t0 + len + 0.05); }
      for (let k = 0; k < len * 14; k++) tone(t0 + 0.3 + Math.random() * (len - 0.4), 2600 + Math.random() * 2400, 'triangle', 0.06, 0.012 + Math.random() * 0.012);   // coins
    } catch (e) {} };
  function jackpot(s, len = 6) { jpSlot = s; jpT = len; FX.visible = true; FLOOR.visible = true; FX.position.set(s.x, 0, s.z); BEAC.position.set(0, 2.62, 0); JSIGN.position.set(0, 3.7, 0); CV.forEach(c => { c[1] = -9; }); siren(Math.min(len, 4)); for (let k = 0; k < 6; k++) coin(0.3 + k * 0.12); }
  function confetti(x, y, z) { CONF.visible = true; FV.forEach(v => { v[0] = x + rnd(-0.2, 0.2); v[1] = y; v[2] = z + rnd(-0.2, 0.2); v[3] = rnd(-1.6, 1.6); v[4] = rnd(2, 4.5); v[5] = rnd(-1.6, 1.6); }); J.cf = 3; }
  function fxTick(dt, t) { if (jpT > 0) { jpT -= dt; BEAC.rotation.y += dt * 7; JSIGN.visible = (t * 4 | 0) % 2 === 0; FLOOR.material.color.set((t * 3 | 0) % 2 ? RED : YEL); FLOOR.material.opacity = 0.07 + 0.05 * Math.sin(t * 12);
      const a = COINS.geometry.attributes.position.array; CV.forEach((c, i) => { if (c[1] < 0) { if (jpT > 1) { c[0] = rnd(-0.15, 0.15); c[1] = 2.6; c[2] = rnd(-0.15, 0.15); c[3] = rnd(-1.2, 1.2); c[4] = rnd(1.5, 3.5); c[5] = rnd(-1.2, 1.2); } } else { c[4] -= 9.8 * dt; c[0] += c[3] * dt; c[1] += c[4] * dt; c[2] += c[5] * dt; } a[i * 3] = c[0]; a[i * 3 + 1] = c[1]; a[i * 3 + 2] = c[2]; }); COINS.geometry.attributes.position.needsUpdate = true;
      if (jpT <= 0) { FX.visible = false; FLOOR.visible = false; jpSlot = null; } }
    if (CONF.visible) { const a = CONF.geometry.attributes.position.array; let live = 0; FV.forEach((v, i) => { if (v[1] > 0.1) { v[4] -= 4.5 * dt; v[3] *= 0.99; v[0] += v[3] * dt; v[1] += v[4] * dt; v[2] += v[5] * dt; live++; } a[i * 3] = v[0]; a[i * 3 + 1] = v[1]; a[i * 3 + 2] = v[2]; }); CONF.geometry.attributes.position.needsUpdate = true; if (!live) CONF.visible = false; } }
  // ================= JACKPOT PARTY (walk) =================
  const WIN = kit.makeFox({ key: 'csWinnie', torso: ['#ff4f9a', '#ffd23a', '#7a2a5a'], outfit: 'dress', mood: 'excited', look: PLAYER_FEMALE }); WIN.visible = false; G.add(WIN);
  const chqT = CT(512, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = GOLD; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14); g.fillStyle = INK; g.textBaseline = 'middle'; g.font = '900 30px Archivo, sans-serif'; g.fillText('MERU CASINO \u00b7 JACKPOT', 30, 48);
    g.fillRect(30, 76, w - 60, 4); g.font = '800 26px Archivo, sans-serif'; g.fillText('PAY TO: WINNIE', 30, 112); g.fillStyle = RED; g.font = '900 78px Archivo, sans-serif'; g.fillText('500 GOLD', 30, 182); g.fillStyle = INK; g.font = '800 20px Archivo, sans-serif'; g.fillText('SIGNED: NICKEL, CASHIER', 30, 228); });
  const CHQ = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.55), new THREE.MeshBasicMaterial({ map: chqT, side: THREE.DoubleSide })); CHQ.visible = false; G.add(CHQ);
  const CAGEF = toWo(CA, 0, 1.3), nearCage = P => Math.hypot(P.x - CAGEF[0], P.z - CAGEF[1]) < 2.2, nearWin = P => Math.hypot(P.x - WIN.position.x, P.z - WIN.position.z) < 2.0;
  const B3 = { walk: true,
    begin() { const isl = (L.slots || []).filter(s => Math.abs(s.z) < 12 && Math.abs(s.z) > 5); const s = isl[(Math.random() * isl.length) | 0] || (L.slots || [])[0]; if (!s) { NEXT(finishGame, 0.1); return; } J.s = s; J.n = (L.slots || []).indexOf(s) + 1;
      const [x, z] = toWo(s, 0, 1.1); WIN.position.set(x, 0, z); WIN.rotation.y = RAD(s.a) + Math.PI; WIN.visible = true; J.ph = 'get'; jackpot(s, 7); toast('JACKPOT ON SLOT ' + J.n + '! \u00b7 GET THE BIG CHEQUE FROM NICKEL', 3); },
    tick(dt) { const P = J.P; if (!P) return; WIN.position.y = J.ph === 'done' ? 0 : Math.abs(Math.sin(J.t * 7)) * 0.22; kit.animFox(WIN, dt, 0, false);
      if (J.ph === 'give') { const yw = P.yaw || 0; CHQ.visible = true; CHQ.position.set(P.x + Math.sin(yw) * 0.55, (P.y || 0) + 1.55, P.z + Math.cos(yw) * 0.55); CHQ.rotation.set(0, yw, 0); } },
    goal() { if (J.ph === 'get') return [CAGEF[0], CAGEF[1], 0]; if (J.ph === 'give') return [WIN.position.x, WIN.position.z, 0.6]; return null; },
    prompt(P) { if (J.ph === 'get' && nearCage(P)) return 'TAKE THE BIG CHEQUE'; if (J.ph === 'give' && nearWin(P)) return 'HAND OVER THE CHEQUE'; return null; },
    talk(P) { if (J.ph === 'get' && nearCage(P)) { J.ph = 'give'; coin(); toast('NICKEL: "FIVE HUNDRED GOLD. DO NOT DROP IT."', 2.2); return true; }
      if (J.ph === 'give' && nearWin(P)) { J.ph = 'done'; fly(CHQ, V(WIN.position.x, 1.9, WIN.position.z), 0.4, 0.2, null); CHQ.rotation.y = WIN.rotation.y; confetti(WIN.position.x, 2.4, WIN.position.z); siren(1.5); ding(); addGold(15); toast('WINNIE: "I NEVER WIN ANYTHING!" \u00b7 THE ROOM CHEERS', 2.4); NEXT(finishGame, 2.4); return true; } return false; },
    card() { return [J.ph === 'get' ? 'TO THE CAGE \u00b7 NICKEL' : J.ph === 'give' ? 'TO THE WINNER \u00b7 SLOT ' + J.n : 'PARTY!', lst([[YEL, 'BIG CHEQUE', J.ph === 'get' ? 'AT THE CAGE' : J.ph === 'give' ? 'CARRYING' : '\u2713', J.ph === 'done'], ['#ff4f9a', 'WINNIE', 'SLOT ' + J.n, J.ph === 'done']]), J.ph]; },
    end() { WIN.visible = false; CHQ.visible = false; } };
  const RINGS = { cctv: [-129.1, 20.4, -3.4], loser: [-116.5, -16], jackpot: [-124, -13] };
  const tips = ['A cheat looks at the cameras twice. Watch the sleeves.', 'Sore losers want a word, not a fight. Be polite.', 'Big cheques come from Nickel. Never from the till.'];
  function tick(dt, P, inShop, busy) { const t = performance.now() / 1000; fxTick(dt, t); if (inShop && !busy && jpT <= 0) { ambT -= dt; if (ambT <= 0) { ambT = rnd(120, 240); const SL = L.slots || []; if (SL.length) jackpot(SL[(Math.random() * SL.length) | 0], 5); } } }
  return { GD: { cctv: B1, loser: B2, jackpot: B3 }, RINGS, tips, tick, jackpot, dispose() { OV.remove(); } };
}
