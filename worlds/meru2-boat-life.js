// MERU 2.0 — s93 BOAT HOUSE DELUXE PART C (look extras + visitors), plugged into worlds/meru2-boat-jobs.js.
// LOOK: water light RIPPLES on the ceiling over the slip + the south wall · ROPE COILS + NETS (docks, west wall, jetty) · GULLS on 4 mooring posts
// by the Speedboat Bay jetty (fly off when you come close, come back later) · a LIGHTHOUSE LAMP on the boathouse roof (rotating beams at night) ·
// the RADIO on a crate in the south-east corner (E to switch; a little shanty, quiet, only inside) · RAIN ON THE TIN ROOF: showers come and go by
// game day + hour (2-hour slots), heard inside, a roof leak drips into a bucket. VISITORS: RACERS in suits wait for the course (west floor, by the
// hour, talk to them) · off-duty town roster foxes queue at the Fisherman's BOAT HIRE counter and row hired rowboats round the bay by time of day.
import { ROSTER, rosterFoxes } from './meru2-roster.js';
import { WS } from '../engine/world-sfx.js?v=s713';   // s711 Runway sounds (audio/meru)
import { PLAYER_FEMALE } from '../fox-kit.js';
export function bhLife(X) {
  const { THREE, G, scene, box, cyl, LM, CT, kit, cols, save, hour, touch, tone, mutedQ, ground, lake, sayTo, toast } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', NAVY = '#2e4a6b', ROPE = '#c9b48a', DECK = 0.4, JY = 0.9;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
  const gAt = (x, z) => { try { const h = ground ? ground(x, z, 0) : 0; return Number.isFinite(h) ? h : 0; } catch (e) { return 0; } };
  const H = () => (hour ? hour() : 12), isNight = () => { const h = H(); return h >= 19.5 || h < 6.5; };
  const OUT = new THREE.Group(); OUT.name = 'boatLife'; scene.add(OUT);   // outdoor bits keep their own distance culling
  const radTex = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  // ================= RIPPLES: ceiling over the slip + the slip-end (south) wall =================
  const RU = { uT: { value: 0 }, uK: { value: 0.6 } };
  const ripM = new THREE.ShaderMaterial({ uniforms: RU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform float uT; uniform float uK; varying vec2 vU; void main(){ vec2 p = vU * vec2(7., 12.); float a = 0.; for (int i = 0; i < 3; i++) { float f = float(i); p += vec2(sin(p.y * 1.3 + uT * 0.9 + f), cos(p.x * 1.1 - uT * 0.7 + f * 1.7)) * 0.4; a += abs(sin(p.x + p.y * 0.6 + uT * 0.5)); }' +
      ' a = pow(max(0., 1. - a / 3. * 1.25), 3.) * 1.8; float e = smoothstep(0., 0.15, vU.x) * smoothstep(1., 0.85, vU.x) * smoothstep(0., 0.12, vU.y) * smoothstep(1., 0.88, vU.y); gl_FragColor = vec4(vec3(0.72, 0.94, 1.) * a * e * uK, 1.); }' });
  { const c = new THREE.Mesh(new THREE.PlaneGeometry(14, 18), ripM); c.rotation.x = Math.PI / 2; c.position.set(75, 7.92, 219); G.add(c);
    const w = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.4), ripM); w.rotation.y = Math.PI; w.position.set(75, 2.2, 227.6); G.add(w); }
  // ================= ROPE COILS + NETS =================
  const ropeM = LM(ROPE);
  const coil = (par, x, y, z, r = 0.32) => { for (let i = 0; i < 4; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(r - i * 0.03, 0.035, 5, 16), ropeM); t.rotation.x = Math.PI / 2; t.position.set(x, y + 0.035 + i * 0.06, z); par.add(t); } };
  coil(G, 69.3, DECK, 219.2); coil(G, 81.2, DECK, 213.2, 0.28); coil(OUT, 73.1, JY, 241); coil(OUT, 73.2, JY, 258.4, 0.26);
  const netT = CT(256, 160, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#4a5a48'; g.lineWidth = 3; for (let i = -h; i < w + h; i += 18) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h * 0.6, h); g.stroke(); g.beginPath(); g.moveTo(i + h * 0.6, 0); g.lineTo(i, h); g.stroke(); } });
  const floatBall = (par, x, y, z, c) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), LM(c)); m.position.set(x, y, z); par.add(m); };
  { const n = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), new THREE.MeshLambertMaterial({ map: netT, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide })); n.position.set(60.6, 1.9, 226.3); n.rotation.y = Math.PI / 2; G.add(n);
    box(G, 0.06, 0.06, 2.6, ROPE, 60.62, 2.82, 226.3); for (let i = 0; i < 5; i++) floatBall(G, 60.68, 2.78, 225.3 + i * 0.5, i % 2 ? WHITE : RED); }
  { const p = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), LM('#55654f')); p.scale.set(1.3, 0.35, 1); p.position.set(76.7, JY + 0.15, 236.5); OUT.add(p); for (let i = 0; i < 3; i++) floatBall(OUT, 76.2 + i * 0.45, JY + 0.3, 236.2 + (i % 2) * 0.5, i % 2 ? WHITE : RED); }
  // ================= GULLS on mooring posts by the Speedboat Bay jetty =================
  const POSTS = [[71.5, 236], [71.5, 257], [78.5, 240], [78.5, 261]], PTOP = 1.8;
  const GULLS = POSTS.map(([x, z], i) => { cyl(OUT, 0.15, 0.17, PTOP + 0.6, '#5c4430', x, (PTOP - 0.6) / 2, z, 8); cyl(OUT, 0.17, 0.17, 0.04, '#3e2c1e', x, PTOP, z, 8); cols.push({ c: [x, z, 0.2] });
    const g = new THREE.Group(); g.position.set(x, PTOP + 0.02, z); g.rotation.y = i * 1.7; OUT.add(g);
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), LM(WHITE)); body.scale.set(0.11, 0.1, 0.21); body.position.y = 0.12; g.add(body);
    const head = new THREE.Group(); head.position.set(0, 0.24, 0.13); g.add(head); { const hm = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), LM(WHITE)); head.add(hm); const bk = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.09, 6), LM(YEL)); bk.rotation.x = Math.PI / 2; bk.position.set(0, -0.01, 0.1); head.add(bk);
      for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), LM(INK)); e.position.set(s * 0.05, 0.02, 0.04); head.add(e); } }
    const tail = box(g, 0.1, 0.03, 0.12, '#3a3836', 0, 0.14, -0.22); void tail;
    const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(s * 0.08, 0.17, 0); g.add(w); const m = box(w, 0.26, 0.02, 0.16, '#8c9298', s * 0.13, 0, -0.02); void m; box(w, 0.06, 0.021, 0.16, INK, s * 0.25, 0, -0.02); return w; });
    for (const s of [-1, 1]) box(g, 0.015, 0.06, 0.015, '#d98a3a', s * 0.04, 0.03, 0);
    return { g, head, wings, home: [x, PTOP + 0.02, z], st: 'sit', t: Math.random() * 5, a: Math.random() * 6, r: 5 + i, call: 4 + Math.random() * 8, look: 0 }; });
  function gullTick(dt, P, near) { const t = performance.now() / 1000;
    for (const q of GULLS) { const [hx, hy, hz] = q.home, dP = Math.hypot(P.x - hx, P.z - hz); q.t += dt;
      if (q.st === 'sit') { q.g.position.set(hx, hy, hz); q.wings.forEach((w, s) => { w.rotation.z = (s ? -1 : 1) * 0.05; }); if (isNight()) q.head.position.z = 0.06; else { q.head.position.z = 0.13; if ((q.look -= dt) <= 0) { q.look = 1 + Math.random() * 3; q.head.rotation.y = (Math.random() - 0.5) * 1.6; } }
        if (dP < 3.4) { q.st = 'fly'; q.t = 0; q.a = Math.atan2(hz - P.z, hx - P.x); if (near < 40 && !mutedQ()) { tone(1450, 0.03, 0.18, 'triangle'); tone(1100, 0.03, 0.22, 'triangle', 0.12); } }
        else if (!isNight() && near < 30 && (q.call -= dt) <= 0) { q.call = 7 + Math.random() * 14; tone(1500 + Math.random() * 200, 0.018, 0.14, 'triangle'); tone(1150, 0.016, 0.2, 'triangle', 0.1); } }
      else if (q.st === 'fly') { q.a += dt * 0.55; const up = Math.min(1, q.t / 1.5), cx = hx + Math.cos(q.a) * q.r * up, cz = hz + Math.sin(q.a) * q.r * up; q.g.position.set(cx, hy + up * (4 + Math.sin(q.t * 0.7) * 0.8), cz); q.g.rotation.y = -q.a; q.head.rotation.y = 0;
        const fl = Math.sin(t * 16) * 0.8; q.wings[0].rotation.z = fl; q.wings[1].rotation.z = -fl; if (q.t > 12 && dP > 6) { q.st = 'land'; q.t = 0; q.from = q.g.position.clone(); } }
      else { const k = Math.min(1, q.t / 2.2), e = k * k * (3 - 2 * k); q.g.position.set(q.from.x + (hx - q.from.x) * e, q.from.y + (hy - q.from.y) * e, q.from.z + (hz - q.from.z) * e); const fl = Math.sin(t * 12) * 0.6 * (1 - k); q.wings[0].rotation.z = fl; q.wings[1].rotation.z = -fl;
        if (k >= 1) { q.st = 'sit'; q.g.rotation.y = Math.random() * 6; } if (dP < 3.4 && k > 0.3) { q.st = 'fly'; q.t = 1.5; } } } }
  // ================= LIGHTHOUSE LAMP on the roof (south-east corner) =================
  const LH = new THREE.Group(); LH.position.set(87.4, 8.4, 225.4); OUT.add(LH);
  cyl(LH, 0.5, 0.55, 0.3, NAVY, 0, 0.15, 0, 12); for (let i = 0; i < 3; i++) cyl(LH, 0.36 - i * 0.03, 0.39 - i * 0.03, 0.6, i % 2 ? WHITE : RED, 0, 0.6 + i * 0.6, 0, 12);
  cyl(LH, 0.52, 0.52, 0.07, INK, 0, 2.15, 0, 14); const lampG = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.5, 12), new THREE.MeshBasicMaterial({ color: '#c9d6dc' })); lampG.position.y = 2.45; LH.add(lampG);
  { const c = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.4, 12), LM(RED)); c.position.y = 2.9; LH.add(c); }
  const LGLOW = new THREE.Sprite(new THREE.SpriteMaterial({ map: radTex, color: 0xffd98a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); LGLOW.scale.setScalar(4); LGLOW.position.y = 2.45; LH.add(LGLOW);
  const BEAM = new THREE.Group(); BEAM.position.y = 2.45; LH.add(BEAM);
  { const bm = new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    for (const s of [-1, 1]) { const geo = new THREE.ConeGeometry(1.6, 14, 14, 1, true); geo.translate(0, -7, 0); const m = new THREE.Mesh(geo, bm); m.rotation.z = s * Math.PI / 2; m.rotation.x = 0.06; BEAM.add(m); } }
  // ================= the RADIO (south-east corner, on a crate) =================
  const RAD = { x: 89.05, z: 226.9 };
  box(G, 0.62, 0.6, 0.62, '#8a6a46', RAD.x, 0.3, RAD.z); box(G, 0.64, 0.04, 0.64, '#6b4f3a', RAD.x, 0.6, RAD.z); cols.push({ f: [RAD.x - 0.32, RAD.x + 0.32, RAD.z - 0.32, RAD.z + 0.32] });
  const radio = new THREE.Group(); radio.position.set(RAD.x, 0.62, RAD.z); radio.rotation.y = -Math.PI * 0.75; G.add(radio);
  box(radio, 0.44, 0.26, 0.18, '#7a2a24', 0, 0.13, 0); box(radio, 0.2, 0.18, 0.01, '#2b2321', -0.09, 0.13, 0.092); const dial = box(radio, 0.12, 0.05, 0.012, '#3a3330', 0.12, 0.18, 0.093);
  cyl(radio, 0.022, 0.022, 0.03, INK, 0.1, 0.08, 0.1, 8).rotation.x = Math.PI / 2; cyl(radio, 0.022, 0.022, 0.03, INK, 0.16, 0.08, 0.1, 8).rotation.x = Math.PI / 2; { const a = cyl(radio, 0.006, 0.006, 0.5, '#9aa0a6', 0.17, 0.48, -0.05, 4); a.rotation.z = -0.35; }
  const radioOn = () => !!save.stat('bhRadio', true);
  const SHANTY = [[587, 1], [587, 0.5], [587, 0.5], [587, 1], [440, 1], [494, 1], [554, 1], [587, 2], [659, 1], [659, 0.5], [659, 0.5], [659, 1], [587, 1], [554, 1], [494, 1], [440, 2],
    [587, 1], [740, 1], [659, 1], [587, 1], [554, 1], [494, 1], [440, 1], [494, 1], [554, 1], [587, 1], [659, 1], [554, 1], [587, 3], [0, 1]];
  let sq = { i: 0, t: 0 };
  function radioTick(dt, P, inRoom) { const on = radioOn(); dial.material = LM(on ? '#ffd23a' : '#3a3330'); if (!on || !inRoom || mutedQ()) return; const d = Math.hypot(P.x - RAD.x, P.z - RAD.z), k = 0.026 * clamp(1 - d / 16, 0.15, 1);
    sq.t -= dt; if (sq.t > 0) return; const [f, b] = SHANTY[sq.i % SHANTY.length], beat = 0.3; sq.t = b * beat; if (f) { tone(f, k, b * beat * 0.9, 'triangle'); if (sq.i % 2 === 0) tone(f / 2, k * 0.6, beat * 0.8, 'sine'); } sq.i++; }
  // ================= RAIN ON THE TIN ROOF (2-hour slots by game day) + the leak into a bucket =================
  const day = () => save.stat('meru2Day', 1) || 1, fr = v => v - Math.floor(v);
  const raining = () => window.__bhRain != null ? !!window.__bhRain : fr(Math.sin(day() * 91.7 + Math.floor(H() / 2) * 12.3) * 43758.5) < 0.22;
  const BK = { x: 83.2, z: 213.6 };
  cyl(G, 0.21, 0.17, 0.36, '#8f969c', BK.x, 0.18, BK.z, 12); const bkW = cyl(G, 0.19, 0.19, 0.01, '#5a8a9a', BK.x, 0.3, BK.z, 12); const bkR = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.05, 14), new THREE.MeshBasicMaterial({ color: '#dff1f7', transparent: true, depthWrite: false })); bkR.rotation.x = -Math.PI / 2; bkR.position.set(BK.x, 0.312, BK.z); G.add(bkR);
  cols.push({ c: [BK.x, BK.z, 0.25] }); const stain = new THREE.Mesh(new THREE.CircleGeometry(0.5, 14), new THREE.MeshBasicMaterial({ color: '#6b6560', transparent: true, opacity: 0.35, depthWrite: false })); stain.rotation.x = Math.PI / 2; stain.position.set(BK.x, 7.9, BK.z); G.add(stain);
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: '#dff1f7' })); drop.scale.y = 1.8; G.add(drop); drop.visible = false;
  let ac = null, rainN = null, rainGn = null, wasRain = false, dropT = 0, ringT = 1;
  let rainWS = null, thT = 20; const rainSnd2 = on => { on = on && !mutedQ(); if (on && !rainWS) rainWS = WS.loop('rain'); if (rainWS) { if (on) rainWS.set(0.45, 1); else { rainWS.stop(); rainWS = null; } } };   // s711 recorded rain
  const rainSnd = on => { if (WS.ready('rain') || rainWS) { rainSnd2(on); if (rainN && rainGn) rainGn.gain.value = 0; return; } if (mutedQ() && on) on = false; try { if (on && !ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (!ac) return;
      if (on && !rainN) { const n = ac.sampleRate * 2 | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; rainN = ac.createBufferSource(); rainN.buffer = bf; rainN.loop = true;
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.6; rainGn = ac.createGain(); rainGn.gain.value = 0; rainN.connect(bp).connect(rainGn).connect(ac.destination); rainN.start(); }
      if (rainGn) rainGn.gain.setTargetAtTime(on ? 0.05 : 0, ac.currentTime, 0.6); } catch (e) {} };
  function rainTick(dt, inRoom) { const r = raining(), on = r && inRoom; rainSnd(on); if (on && !wasRain) toast && toast('RAIN ON THE TIN ROOF', 2.2); wasRain = on; stain.visible = r;
    if (!on) { drop.visible = false; bkR.visible = false; return; } if ((thT -= dt) <= 0) { thT = 25 + Math.random() * 35; if (!mutedQ()) WS.play('thunder', 0.3 + Math.random() * 0.2); }
    if (Math.random() < dt * 9 && !mutedQ()) tone(2600 + Math.random() * 1600, 0.01, 0.05, 'triangle');
    dropT += dt; const fall = 1.25, y = 7.85 - Math.min(1, dropT / fall) ** 2 * (7.85 - 0.32); drop.visible = true; drop.position.set(BK.x, y, BK.z);
    if (dropT >= fall) { dropT = -0.3 - Math.random() * 0.6; ringT = 0; if (!mutedQ()) tone(1700 + Math.random() * 300, 0.02, 0.12, 'sine'); }
    ringT += dt; const k = Math.min(1, ringT / 0.7); bkR.visible = k < 1; bkR.scale.setScalar(1 + k * 3); bkR.material.opacity = 1 - k; }
  // ================= VISITORS 1: RACERS in suits waiting for the course (west floor) =================
  const RACE = [{ n: 'DASH VELLO', torso: [WHITE, RED, INK], at: [66.7, 224.4, -Math.PI / 2] }, { n: 'MARINA SWIFT', torso: [YEL, INK, '#a16207'], f: 1, at: [65.2, 226.1, -Math.PI / 2 + 0.7] }, { n: 'TORQUE', torso: ['#2e86b8', WHITE, '#16263c'], at: [67.9, 226.4, Math.PI - 0.3] }];
  const RLINES = ['Waiting for my heat. Ace says the chop is up today.', 'Nitro on the ramps. That is the whole secret.', 'Lap two is where they lose it. Watch the slalom.', 'Saw your time on the board. Not bad, rookie.', 'Torpedo the barrels early. Clear water after.'];
  const racers = RACE.map((R, i) => { const f = kit.makeFox({ key: 'bhRacer' + i, torso: R.torso, outfit: 'suit', mood: i === 1 ? 'happy' : 'smug', look: R.f ? PLAYER_FEMALE : undefined }); const [x, z, ry] = R.at; f.position.set(x, 0, z); f.rotation.y = ry; f.visible = false; G.add(f);
    const P0 = f.userData && f.userData.P; if (P0 && P0.arms && P0.arms[0]) { const hm = new THREE.Group(); hm.position.set(0, -0.5, 0.1); P0.arms[0].add(hm); const s = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), LM(R.torso[0])); hm.add(s); box(hm, 0.36, 0.05, 0.02, R.torso[1], 0, 0.04, 0); box(hm, 0.2, 0.08, 0.06, INK, 0, 0, 0.15); }
    const c = { c: [x, z, 0.35], on: false }; cols.push(c); return { f, R, c, ry, i, said: 0 }; });
  const nRacers = () => { const h = H(); return h >= 12 && h < 18 ? 3 : h >= 10 && h < 12 ? 1 : h >= 18 && h < 19.5 ? 2 : 0; };
  // ================= VISITORS 2: the roster hires boats (queue at the hut + rowboats on the bay) =================
  const rFox = rosterFoxes({ THREE, kit, cap: 6 });
  const onShift = (r, h) => { const [s, e] = r.shift; return s <= e ? h >= s && h < e : h >= s || h < e; };
  const pickFree = (seed, n, h) => { const L = ROSTER.filter(r => !onShift(r, h) && !(r.look && r.look.hat)); let s = seed; const a = L.slice(); for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
  const QUEUE = [[94.4, 231.7, Math.PI / 2], [93.3, 233.5, Math.PI / 2 - 0.4]];
  const nQueue = h => (h >= 12 && h < 18 ? 2 : h >= 8 && h < 19 ? 1 : 0), nRow = h => (h >= 14 && h < 18 ? 3 : h >= 11 && h < 14 ? 2 : (h >= 8 && h < 11) || (h >= 18 && h < 19.5) ? 1 : 0);
  const ROWC = ['#2e4a6b', '#1d6b4c', '#a03a2a'];
  let LOOPS = [[58, 278, 7], [94, 280, 7], [76, 293, 6]], loopsOk = false;
  const rowboats = ROWC.map((c, i) => { const g = new THREE.Group(); g.visible = false; OUT.add(g); box(g, 1.0, 0.32, 2.0, c, 0, 0.16, 0); box(g, 0.86, 0.06, 1.86, '#a07a52', 0, 0.3, 0); box(g, 1.04, 0.06, 2.04, WHITE, 0, 0.34, 0);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.6, 4), LM(c)); bow.rotation.set(Math.PI / 2, Math.PI / 4, 0); bow.scale.set(1, 1, 0.55); bow.position.set(0, 0.17, 1.28); g.add(bow); box(g, 0.9, 0.05, 0.25, '#8a6a46', 0, 0.36, -0.25);
    const oars = [-1, 1].map(s => { const o = new THREE.Group(); o.position.set(s * 0.52, 0.38, 0.05); g.add(o); const sh = cyl(o, 0.02, 0.02, 1.7, '#c9a46a', s * 0.6, 0, 0, 5); sh.rotation.z = Math.PI / 2 - s * 0.35; box(o, 0.3, 0.02, 0.14, '#c9a46a', s * 1.35, -0.3, 0); return o; });
    return { g, oars, ph: i * 2.1, fox: null, key: '' }; });
  let vKey = '', qFox = [];
  function visitorsSet(h) { const seed = day() * 31 + Math.floor(h), k = seed + '|' + nQueue(h) + '|' + nRow(h); if (k === vKey) return; vKey = k;
    const want = pickFree(day() * 17 + Math.floor(h / 2), 5, h), q = want.slice(0, nQueue(h)), rw = want.slice(2, 2 + nRow(h));
    qFox.forEach(f => { f.visible = false; }); rowboats.forEach(b => { if (b.fox) b.fox.visible = false; b.fox = null; b.g.visible = false; });
    qFox = q.map((r, i) => { const f = rFox(r, OUT), [x, z, ry] = QUEUE[i]; f.position.set(x, gAt(x, z), z); f.rotation.y = ry; f.visible = true; return f; });
    rw.forEach((r, i) => { const b = rowboats[i]; if (!LOOPS[i]) return; b.fox = rFox(r, OUT); b.fox.visible = true; b.g.visible = true; }); }
  function checkLoops() { const Lk = lake && lake(); if (!Lk || !Lk.waterOK) return; loopsOk = true; LOOPS = LOOPS.map(([x, z, r]) => { for (let rr = r; rr >= 3; rr -= 1) { let ok = true; for (let a = 0; a < 6.28; a += 0.5) if (!Lk.waterOK(x + Math.cos(a) * rr, z + Math.sin(a) * rr)) { ok = false; break; } if (ok) return [x, z, rr]; } return null; }); vKey = ''; }
  function rowTick(dt, t) { const Lk = lake && lake(); rowboats.forEach((b, i) => { if (!b.g.visible || !LOOPS[i]) return; const [cx, cz, r] = LOOPS[i], a = t * 0.9 / r + b.ph, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, yw = Math.atan2(-Math.sin(a), Math.cos(a));
      const wy = Lk && Lk.waveAt ? (Lk.waveAt(x, z) || 0) : 0, y = wy - 0.12 + Math.sin(t * 1.6 + i) * 0.03; b.g.position.set(x, y, z); b.g.rotation.set(Math.sin(t * 1.3 + i) * 0.03, yw, 0);
      const st = Math.sin(t * 2.4 + i); b.oars.forEach((o, s) => { o.rotation.y = (s ? -1 : 1) * st * 0.5; o.rotation.x = Math.cos(t * 2.4 + i) * 0.18; });
      const f = b.fox; if (f) { f.position.set(x - Math.sin(yw) * 0.25, y + 0.02, z - Math.cos(yw) * 0.25); f.rotation.y = yw + Math.PI; kit.animFox(f, 0.016, 0, false); const A = f.userData && f.userData.P && f.userData.P.arms; if (A) for (const q of A) { if (!q) continue; q.rotation.x = -1.2 + st * 0.45; } } }); }
  // ================= talk + prompt (inside: the radio, a racer) =================
  const nearRadio = P => Math.hypot(P.x - RAD.x, P.z - RAD.z) < 1.5;
  const nearRacer = P => racers.find(q => q.f.visible && Math.hypot(P.x - q.f.position.x, P.z - q.f.position.z) < 1.7);
  function prompt(P) { if (nearRadio(P)) return 'RADIO \u00b7 ' + (radioOn() ? 'TURN OFF' : 'TURN ON'); const r = nearRacer(P); if (r) return 'TALK \u00b7 ' + r.R.n; return null; }
  function talk(P) { if (nearRadio(P)) { save.setStat('bhRadio', !radioOn()); tone(radioOn() ? 880 : 440, 0.04, 0.12, 'square'); sq.t = 0.4; toast && toast(radioOn() ? 'RADIO ON \u00b7 MERU BAY FM' : 'RADIO OFF', 1.6); return true; }
    const r = nearRacer(P); if (r) { const rr = { key: 'bhRacer' + r.i, name: r.R.n, role: 'RACER', obj: r.f, ry: r.ry, r: 5 }; sayTo(rr, [{ who: r.R.n.toLowerCase(), role: 'RACER', text: RLINES[(r.i + r.said++) % RLINES.length] }]); return true; } return false; }
  // ================= per frame =================
  let vT = 0;
  function tick(dt, P, inRoom) { const t = performance.now() / 1000, h = H(), night = isNight();
    const dIn = Math.hypot(P.x - 75, P.z - 216.5), dOut = Math.hypot(P.x - 80, P.z - 255); OUT.visible = Math.min(dIn, dOut) < (touch ? 110 : 200);
    if (!OUT.visible) { rainSnd(false); return; }
    LH.visible = true; LGLOW.visible = BEAM.visible = night; lampG.material.color.set(night ? '#ffe9a8' : '#c9d6dc'); if (night) BEAM.rotation.y = t * 0.9;
    if (!loopsOk) checkLoops(); if ((vT -= dt) <= 0) { vT = 2; visitorsSet(h); }
    const nearOut = dOut < (touch ? 70 : 110); gullTick(dt, P, dOut); if (nearOut) { rowTick(dt, t); qFox.forEach(f => { if (f.visible) kit.animFox(f, dt, 0, false); }); }
    rainTick(dt, inRoom);
    if (G.visible) { RU.uT.value = t; RU.uK.value = night ? 0.3 : 0.65; radioTick(dt, P, inRoom);
      const n = nRacers(); racers.forEach(q => { const on = q.i < n; q.f.visible = on; q.c.on = on; if (!on) return; const d = Math.hypot(P.x - q.f.position.x, P.z - q.f.position.z), a = d < 4 ? Math.atan2(P.x - q.f.position.x, P.z - q.f.position.z) : q.ry; q.f.rotation.y += wrapA(a - q.f.rotation.y) * Math.min(1, dt * 3); kit.animFox(q.f, dt, 0, false); }); } }
  function dispose() { rainSnd(false); try { if (rainN) rainN.stop(); } catch (e) {} }
  return { tick, prompt, talk, dispose, raining, racers, GULLS, LOOPS: () => LOOPS, visitorsSet: () => { vKey = ''; visitorsSet(H()); } };
}
