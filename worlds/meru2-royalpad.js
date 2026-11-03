// s339 (Ben): ROYAL LANDING PAD + TELEPAD on Castle Ridge, on the flat crest east of the castle gate (north of the Castle Road).
// TELEPAD (the Space Dock's glowing ring look): E → beam out + fade → Meru Spacedock.dc.html; the dock's teleporter beams you back onto it.
// OPENING (first time you beam in, before the tournament): the royal helicopter waits on the pad, two Meru Guards stop you as you walk past,
// "you are late for the tournament…", they board, an arrow over the helicopter, E = board; two more guards hold the edges of the area.
// s339c THE RIDE (Ben): lift-off → north over the Meru Loop train as it passes (the scene paces the train) → round the town fountain → down onto the
// HELICOPTER RIDES pad on the Arena Path (the rides chopper steps aside while you land). You + the escorts step out; flag heliToArena. E during the flight = skip.
// ?royal=open forces the opening (flags in memory only); ?arrive=telepad = arrive on the telepad as if beamed in.
import { vehicleKit } from '../engine/vehicle-kit.js';

export const ROYAL = { pad: [-188, -438], tele: [-177.5, -438], r: 5.2, area: 20 };
const GUARD = { outfit: 'armor', torso: ['#5a5f67', '#44484f', '#26292d'], crest: 'M', eyes: ['#3a2a1a', '#3a2a1a'], look: { armorAccent: '#e6b45a' } };
const LINE_STOP = 'YOU ARE LATE FOR THE TOURNAMENT AND THE KING SENT US TO FLY YOU TO THE ARENA ON THE DOUBLE.';
const LINE_BLOCK = 'YOU ARE NEXT AT THE ARENA. GET ON THE HELICOPTER, KING\u2019S ORDERS.';
const DOCK_URL = 'Meru Spacedock.dc.html', TOWN_URL = 'FOXGATE8-FRESH.dc.html';

export function buildRoyalPad({ THREE, scene, kit, save, sayTo, ground, cols, floraRemove, isMuted, train }) {
  const PI = Math.PI, [HX, HZ] = ROYAL.pad, [TX, TZ] = ROYAL.tele, CX = (HX + TX) / 2, CZ = HZ;
  const gy = (x, z) => ground(x, z) || 0, Y = gy(HX, HZ), TY = gy(TX, TZ);
  const qs = typeof location !== 'undefined' ? location.search : '';
  const forceOpen = /[?&]royal=open/.test(qs);
  if (forceOpen) { const real = save, F = { heliToArena: false, tournamentWon: false }; save = Object.create(real); save.flag = k => (k in F ? F[k] : real.flag(k)); save.setFlag = (k, v = true) => { if (k in F) F[k] = v; else real.setFlag(k, v); }; }
  let arrive = /[?&]arrive=telepad/.test(qs) || forceOpen || (typeof window !== 'undefined' && !!window.__m2TeleStart);   // s731 every normal start = beamed in on the telepad try { if (sessionStorage.getItem('meru2.arrive') === 'telepad') { arrive = true; sessionStorage.removeItem('meru2.arrive'); } } catch (e) {}
  const toonC = new Map(), toon = c => { if (!toonC.has(c)) toonC.set(c, new THREE.MeshToonMaterial({ color: c })); return toonC.get(c); };
  const basic = (c, o = 1, add) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1 || !!add, opacity: o, depthWrite: !(o < 1 || add), blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
  const CT = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const G = new THREE.Group(); G.name = 'royalPad'; scene.add(G);
  const M = (g, m, x = 0, y = 0, z = 0, parent = null) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); (parent || G).add(o); return o; };
  const flat = (g, m, x, y, z) => { const o = M(g, m, x, y, z); o.rotation.x = -PI / 2; return o; };

  // ---------- clear the ground (trees are planted later too, so again after load) ----------
  const clearP = (x, z) => Math.hypot(x - HX, z - HZ) < ROYAL.r + 3 || Math.hypot(x - TX, z - TZ) < 3.5;
  const clear = () => { try { floraRemove && floraRemove(clearP); } catch (e) {} for (const c of cols) if (c.c && c.on !== false && !c.royal && clearP(c.c[0], c.c[1])) c.on = false; };
  clear(); [2500, 9000, 25000].forEach(ms => setTimeout(clear, ms));

  // ---------- ROYAL LANDING PAD: stone disc, gold + red rings, H, ROYAL lettering, 4 lamp posts ----------
  const padT = CT(512, 512, (g, w) => { g.fillStyle = '#bfb3a3'; g.fillRect(0, 0, w, w); g.translate(w / 2, w / 2);
    g.strokeStyle = '#e6b45a'; g.lineWidth = 22; g.beginPath(); g.arc(0, 0, 226, 0, 7); g.stroke(); g.strokeStyle = '#ec3013'; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, 190, 0, 7); g.stroke();
    g.fillStyle = '#201e1d'; g.font = '900 240px Archivo, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', 0, 8);
    g.font = '900 40px Archivo, Arial, sans-serif'; g.fillStyle = '#e6b45a'; g.fillText('ROYAL', 0, -148); g.fillText('MERU', 0, 152); });
  M(new THREE.CylinderGeometry(ROYAL.r, ROYAL.r + 0.25, 0.22, 40), [toon('#a89c8c'), new THREE.MeshLambertMaterial({ map: padT }), toon('#a89c8c')], HX, Y + 0.11, HZ);
  const lampG = new THREE.SphereGeometry(0.16, 10, 8), poleG = new THREE.CylinderGeometry(0.06, 0.08, 1.6, 8), lamps = [];
  for (let i = 0; i < 4; i++) { const a = PI / 4 + i * PI / 2, x = HX + Math.cos(a) * (ROYAL.r + 0.9), z = HZ + Math.sin(a) * (ROYAL.r + 0.9), y = gy(x, z);
    M(poleG, toon('#26292d'), x, y + 0.8, z); lamps.push(M(lampG, basic(0xffd23a), x, y + 1.66, z)); }
  { const sT = CT(512, 96, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23a'; g.fillRect(0, h - 8, w, 8); g.fillStyle = '#f3f2f2'; g.font = '900 44px Archivo, Arial, sans-serif'; g.textBaseline = 'middle'; g.fillText('ROYAL LANDING PAD', 22, h / 2 - 2); });
    const sx = HX + 3.2, sz = HZ + ROYAL.r + 1.6, sy = gy(sx, sz); M(new THREE.BoxGeometry(0.1, 1.5, 0.1), toon('#26292d'), sx - 1.3, sy + 0.75, sz); M(new THREE.BoxGeometry(0.1, 1.5, 0.1), toon('#26292d'), sx + 1.3, sy + 0.75, sz);
    const s = M(new THREE.PlaneGeometry(2.9, 0.54), new THREE.MeshBasicMaterial({ map: sT, side: THREE.DoubleSide }), sx, sy + 1.55, sz); s.rotation.y = 0; }

  // ---------- TELEPAD (dock look) ----------
  const PR = 1.45, padRings = [1, 0.76, 0.52, 0.28].map((k, i) => flat(new THREE.RingGeometry(PR * k - 0.07, PR * k, 48), basic(0x7dd3fc, i ? 0.6 : 1), TX, TY + 0.17, TZ));
  M(new THREE.CylinderGeometry(PR, PR + 0.1, 0.16, 40), toon('#101821'), TX, TY + 0.08, TZ);
  const swell = [0, 1].map(() => flat(new THREE.RingGeometry(0.94, 1, 48), basic(0x7dd3fc, 0.5, true), TX, TY + 0.18, TZ));
  const glowT = CT(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const padGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0x7dd3fc, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })); padGlow.position.set(TX, TY + 0.5, TZ); padGlow.scale.setScalar(PR * 4); G.add(padGlow);
  M(new THREE.CylinderGeometry(PR * 0.9, PR * 0.9, 5, 28, 1, true), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), TX, TY + 2.5, TZ);
  { const lT = CT(640, 96, (g, w, h) => { g.font = '800 58px Archivo, Arial, sans-serif'; g.fillStyle = '#bae6fd'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TELEPORT to SPACE DOCK', w / 2, h / 2); });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: lT, transparent: true, depthWrite: false })); s.scale.set(4.2, 0.63, 1); s.position.set(TX, TY + 3.3, TZ); G.add(s); }
  const beamCol = M(new THREE.CylinderGeometry(1.1, 1.1, 16, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x7fe3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), TX, TY + 8, TZ);

  // ---------- the royal helicopter (parked on the pad) ----------
  let heli = null, V = null; try { heli = vehicleKit({ THREE, M: (g, m, x = 0, y = 0, z = 0, p = null) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); if (p) p.add(o); return o; }, toon }).make('heli'); heli.scale.setScalar(1.4); V = heli.userData.V || {}; if (V.gun) V.gun.visible = false; if (V.beam) V.beam.visible = false; G.add(heli); } catch (e) { console.warn('royal heli', e); }
  const H0 = { x: HX, y: Y + 0.22, z: HZ, yaw: 0 }, parkHeli = () => { if (!heli) return; heli.position.set(H0.x, H0.y, H0.z); heli.rotation.set(0, H0.yaw, 0); heli.visible = true; };
  parkHeli(); const heliCol = { c: [HX, HZ, 2.6], royal: true }; cols.push(heliCol);
  const BOARD = [HX + 3.4, HZ];   // the boarding spot on the telepad side
  let rpm = 0; const spin = dt => { if (!V) return; if (V.rotor) V.rotor.rotation.y += rpm * 26 * dt; if (V.tailRotor) V.tailRotor.rotation.x += rpm * 40 * dt; if (V.rotorDisc) V.rotorDisc.material.opacity = rpm * 0.22; if (V.tailDisc) V.tailDisc.material.opacity = rpm * 0.3; };
  const arrow = M(new THREE.ConeGeometry(0.42, 0.85, 4), basic(0xffd23a)); arrow.rotation.x = PI; arrow.visible = false;

  // ---------- the guards: 2 escorts (stop you, board) + 2 holding the edges ----------
  const mkG = (key, x, z, ry) => { const f = kit.makeFox({ key, name: 'Meru Guard', ...GUARD, mood: 'stern' }); f.position.set(x, gy(x, z), z); f.rotation.y = ry; f.userData.noCull = true; f.userData.rk = key; f.visible = false; G.add(f); return f; };
  const ESC = [mkG('royalEscort1', HX + 4.6, HZ + 6.2, PI * 0.75), mkG('royalEscort2', HX + 2.6, HZ + 6.8, PI * 0.8)];
  const EDGE = [mkG('royalEdge1', CX + 15, CZ + 11, -PI * 0.7), mkG('royalEdge2', CX - 14, CZ + 12, PI * 0.7)];
  const ESC0 = ESC.map(f => [f.position.x, f.position.z, f.rotation.y]);
  const tk = (f, role = 'MERU GUARD') => ({ key: f.userData.rk, obj: f, name: 'Meru Guard', role, ry: f.rotation.y, r: 3.2 });
  const angD = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const face = (f, x, z, dt, k = 6) => { f.rotation.y += angD(f.rotation.y, Math.atan2(x - f.position.x, z - f.position.z)) * Math.min(1, dt * k); };
  const walkTo = (f, x, z, dt, sp = 2.6, stop = 0.4) => { const dx = x - f.position.x, dz = z - f.position.z, d = Math.hypot(dx, dz); if (d <= stop) { kit.animFox(f, dt, 0, false); return true; } const s = Math.min(d - stop, sp * dt); f.position.x += dx / d * s; f.position.z += dz / d * s; f.position.y = gy(f.position.x, f.position.z); face(f, x, z, dt, 8); kit.animFox(f, dt, sp, false); return false; };

  // ---------- sound (tiny synth + the recorded take-off) ----------
  let AC = null; const ac = () => { if (isMuted && isMuted()) return null; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (e) { return null; } };
  const tone = (f0, dur, vol = 0.05, type = 'sine', glide = 1) => { const c = ac(); if (!c) return; const t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f0 * glide), t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05); };
  let heliAud = null; const heliSfx = () => { if (isMuted && isMuted()) return; try { heliAud = new Audio(new URL('../audio/heli/heli-idle-takeoff.mp3', import.meta.url).href); heliAud.currentTime = 8.6; heliAud.volume = 0.85; heliAud.play().catch(() => {}); } catch (e) {} };

  // ---------- fade (a black sheet over the page) ----------
  const fadeEl = document.createElement('div'); Object.assign(fadeEl.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', zIndex: '9000', transition: 'opacity 0.6s linear' }); document.body.appendChild(fadeEl);
  const fade = (o, s = 0.6) => { fadeEl.style.transition = 'opacity ' + s + 's linear'; fadeEl.style.opacity = String(o); };

  // ---------- state ----------
  const S = { op: null, t: 0, beam: null, toast: '', toastT: 0, blockT: 0, arriveT: 0, lastP: null, me: null };
  const opening = () => !save.flag('heliToArena') && !save.flag('tournamentWon');
  if (forceOpen || (arrive && opening())) S.op = 'wait';
  const showG = on => { ESC.forEach(f => { f.visible = on; }); EDGE.forEach(f => { f.visible = on; }); };
  showG(!!S.op);
  const toast = (t, s = 2.6) => { S.toast = t; S.toastT = s; };
  function beam(out, done) { S.beam = { out, t: 0, life: 1.9, done }; tone(out ? 660 : 330, 1.4, 0.05, 'sine', out ? 0.5 : 2); tone(1200, 0.5, 0.02, 'triangle', 0.6); }
  function placeOnPad(P) { if (!P) return; Object.assign(P, { x: TX, z: TZ, vy: 0, sp: 0, car: false, boat: false, ab: null, swim: false }); P.y = TY + 0.16; P.yaw = -PI / 2; }
  // called once the walk exists (the page's test start and our own first tick): put you on the telepad + beam in
  window.__m2Arrive = arrive ? () => { const P = S.lastP; if (!P) return; placeOnPad(P); if (!S.arriveT) { S.arriveT = performance.now(); fade(1, 0); requestAnimationFrame(() => fade(0, 0.9)); beam(false); } } : null;
  const onTele = P => Math.hypot(P.x - TX, P.z - TZ) < PR * 0.8 && Math.abs(P.y - TY) < 1.5;
  const nearBoard = P => Math.hypot(P.x - BOARD[0], P.z - BOARD[1]) < 2.6;
  function teleport(P) { toast('TELEPORTING', 2); S.op2 = S.op; S.leave = true; beam(true, () => { fade(1, 0.35); try { sessionStorage.setItem('dock.arrive', 'telepad'); } catch (e) {} try { save.where && save.where('meru', 'meruSpacedock'); } catch (e) {} setTimeout(() => { location.href = encodeURI(DOCK_URL); }, 380); }); }
  function board(P) { S.op = 'lift'; S.t = 0; arrow.visible = false; heliSfx(); tone(120, 1.2, 0.03, 'sawtooth', 1.8); FL.d = 0; FL.v = 0; FL.tr = null; FL.cam = null; FL.yawR = 0; pilot.visible = true; }
  // ---------- THE FLIGHT: one smooth curve, ridge → over the train → round the fountain → hover over the Arena Path pad ----------
  const AP = [280, -21], APY = 0.3, V3 = (x, y, z) => new THREE.Vector3(x, y, z), XT = [-150, -515], FO = [0, 0];
  const RT = [V3(HX, Y + 10, HZ), V3(-176, 36, -478), V3(XT[0], 24, XT[1]), V3(-112, 30, -548), V3(-52, 40, -505), V3(-26, 44, -300), V3(-24, 36, -95), V3(-30, 27, -22), V3(-4, 24, 28), V3(28, 26, -6), V3(90, 34, -26), V3(210, 24, -22), V3(AP[0], APY + 12, AP[1])];
  const curve = new THREE.CatmullRomCurve3(RT, false, 'centripetal'), CL = curve.getLength();
  const dNear = (x, z) => { let bd = 1e9, bt = 0; for (let i = 0; i <= 400; i++) { const p = curve.getPointAt(i / 400), d = Math.hypot(p.x - x, p.z - z); if (d < bd) { bd = d; bt = i / 400; } } return bt * CL; };
  const DX = dNear(...XT), DF = dNear(...FO);
  const FL = { d: 0, v: 0, tr: null, cam: null, yawR: 0, pitch: 0, roll: 0, yaw: H0.yaw };
  const pilot = kit.makeFox({ key: 'royalPilot', name: 'Royal Pilot', ...GUARD, mood: 'warm' }); pilot.visible = false; pilot.userData.noCull = true; G.add(pilot);
  const seatPilot = () => { if (!heli || !V || !V.seat) { pilot.visible = false; return; } heli.updateMatrixWorld(true); const s = heli.localToWorld(V.seat.clone()); pilot.position.set(s.x, s.y - 0.28, s.z); pilot.rotation.y = heli.rotation.y; };
  // the rides chopper on the Arena Path pad steps aside while the royal one lands there
  let rideHeli = null; const findRide = () => { if (rideHeli !== null) return rideHeli; rideHeli = undefined; scene.traverse(o => { if (rideHeli || o === heli || !o.userData || !o.userData.V || !o.userData.V.rotor) return; const p = o.position; if (Math.hypot(p.x - AP[0], p.z - AP[1]) < 7) rideHeli = o; }); return rideHeli; };
  const rideShow = on => { const r = findRide(); if (r) r.visible = on; };
  // the train: paced so its middle car is under you as you cross the north leg
  function trainStart() { const T = train; if (!T || !T.sAt) return; const sX = T.sAt(...XT), mid = Math.floor((T.CARS || 4) / 2) * (T.PITCH || 24); FL.tr = { sX, mid, v: 12, after: 0 }; }
  let flyAud = null; const flyLoop = on => { try { if (on && !flyAud && !(isMuted && isMuted())) { flyAud = new Audio(new URL('../audio/heli/heli-fly.mp3', import.meta.url).href); flyAud.volume = 0.7; flyAud.currentTime = 1; flyAud.play().catch(() => {}); } if (flyAud && on && flyAud.currentTime > 14.8) flyAud.currentTime = 1; if (!on && flyAud) { flyAud.pause(); flyAud = null; } } catch (e) {} };
  let landAud = null; const landSfx = () => { if (isMuted && isMuted()) return; try { landAud = new Audio(new URL('../audio/heli/heli-land-idle.mp3', import.meta.url).href); landAud.currentTime = 4; landAud.volume = 1; landAud.play().catch(() => {}); } catch (e) {} };
  function flyTick(dt, P, fox) { const T = S.t;
    // speed: ease up to 30 m/s, slow into the hover
    const rem = CL - FL.d, vMax = 30, want = Math.min(vMax, rem * 0.32 + 3); FL.v += Math.max(-dt * 9, Math.min(dt * 7, want - FL.v)); FL.d = Math.min(CL, FL.d + FL.v * dt);
    const u = FL.d / CL, p = curve.getPointAt(u), tg = curve.getTangentAt(u), yaw = Math.atan2(tg.x, tg.z), dy = angD(FL.yaw, yaw);
    FL.yawR += ((dy / Math.max(dt, 1e-3)) - FL.yawR) * Math.min(1, dt * 3); FL.yaw = yaw;
    FL.pitch += (Math.min(0.22, FL.v * 0.006 + (want - FL.v) * 0.01) - FL.pitch) * Math.min(1, dt * 2); FL.roll += (Math.max(-0.4, Math.min(0.4, -FL.yawR * 0.5)) - FL.roll) * Math.min(1, dt * 2.5);
    heli.position.copy(p); heli.rotation.set(FL.pitch, yaw, FL.roll, 'YXZ'); seatPilot();
    if (P) { P.x = p.x; P.z = p.z; P.y = gy(p.x, p.z); P.sp = 0; }   // the town around you loads its detail as you fly
    if (FL.tr && train) { const R = FL.tr, tLeft = (DX - FL.d) / Math.max(8, FL.v); if (FL.d < DX + 40) { const s = R.sX + R.mid - R.v * tLeft; train.scriptS = s; train.scriptV = R.v; } else { R.after += dt; train.scriptS = (train.scriptS || 0) + R.v * dt; train.scriptV = R.v; if (R.after > 6) { try { train.release(R.v); } catch (e) {} FL.tr = null; } } }
    if (FL.d >= CL - 0.05) { S.op = 'land'; S.t = 0; flyLoop(false); landSfx(); FL.y0 = heli.position.y; FL.yaw0 = FL.yaw; rideShow(false); } else flyLoop(true); }
  function landTick(dt) { const k = Math.min(1, S.t / 4.2), e = k * k * (3 - 2 * k); FL.pitch *= 0.9; FL.roll *= 0.9;
    const yw = FL.yaw0 + angD(FL.yaw0, Math.PI) * e; heli.position.set(AP[0], FL.y0 + (APY - FL.y0) * e, AP[1]); heli.rotation.set(FL.pitch, yw, FL.roll, 'YXZ'); seatPilot(); rideShow(false);
    if (k >= 1) { S.op = 'arrive'; S.t = 0; FL.yaw = Math.PI; } }

  function tick(dt, P, fox) { if (!P) return; S.lastP = P; S.me = fox; const now = performance.now(); if (S.toastT > 0) S.toastT -= dt; if (fox && fox.userData.baseS == null) fox.userData.baseS = fox.scale.x || 1;
    if (arrive && window.__meru2Walk) { if (!S.arriveT) window.__m2Arrive && window.__m2Arrive(); else if (now - S.arriveT < 9000 && Math.hypot(P.x - TX, P.z - TZ) > 6 && !['lift', 'fly', 'land', 'arrive'].includes(S.op)) placeOnPad(P); }
    const t = now / 1000, pulse = 0.55 + Math.sin(t * 2.4) * 0.3;
    padRings.forEach((r, i) => { if (i) r.material.opacity = pulse * (1 - i * 0.22); }); padGlow.material.opacity = 0.3 + pulse * 0.3;
    swell.forEach((r, i) => { const u = (t * 0.45 + i * 0.5) % 1; r.scale.setScalar(PR * (1 + u * 1.9)); r.material.opacity = (1 - u) * 0.55; });
    lamps.forEach((l, i) => { l.material.color.setHex(Math.sin(t * 1.3 + i) > -0.2 ? 0xffd23a : 0xe0b020); });
    // the beam: column + the fox shrinks out / grows in
    const B = S.beam; if (B) { B.t += dt; const k = Math.min(1, B.t / B.life), sc = B.out ? 1 - Math.min(1, Math.max(0, (k - 0.15) / 0.5)) : Math.min(1, Math.max(0, (k - 0.35) / 0.5));
      beamCol.material.opacity = Math.sin(k * PI) * 0.75; beamCol.position.set(P.x, TY + 8, P.z); beamCol.scale.set(1 - k * 0.3, 1, 1 - k * 0.3);
      if (fox) { fox.scale.setScalar(Math.max(0.001, sc) * (fox.userData.baseS || 1)); if (sc < 0.02) fox.visible = false; }
      if (k >= 1) { S.beam = null; beamCol.material.opacity = 0; if (fox) fox.scale.setScalar(fox.userData.baseS || 1); B.done && B.done(); } }
    spin(dt);
    // ---------- the opening ----------
    if (S.op === 'wait') { rpm = 0.35; ESC.forEach(f => { face(f, P.x, P.z, dt, 3); kit.animFox(f, dt, 0, false); }); EDGE.forEach(f => kit.animFox(f, dt, 0, false));
      if (!S.beam && S.arriveT && Math.hypot(P.x - TX, P.z - TZ) > 2.4 && Math.hypot(P.x - CX, P.z - CZ) < 16) { S.op = 'stop'; S.t = 0; } }
    else if (S.op === 'stop') { S.t += dt; const [a, b] = ESC; const ax = P.x + Math.sin(P.yaw + 0.5) * 2.0, az = P.z + Math.cos(P.yaw + 0.5) * 2.0;
      const r1 = walkTo(a, ax, az, dt, 3.4, 0.3), r2 = walkTo(b, ax + 1.0, az + 0.8, dt, 3.4, 0.3);
      if (P.sp != null) P.sp *= 0.5;
      if ((r1 && r2) || S.t > 3.2) { face(a, P.x, P.z, 1); face(b, P.x, P.z, 1); S.op = 'talk'; sayTo(tk(a, 'MERU GUARD \u00b7 ROYAL ESCORT'), [{ who: 'npc', text: LINE_STOP }], () => { S.op = 'toHeli'; S.t = 0; toast('BOARD THE HELICOPTER', 3); }, true); } }
    else if (S.op === 'talk') { ESC.forEach(f => { face(f, P.x, P.z, dt, 5); kit.animFox(f, dt, 0, false); }); }
    else if (S.op === 'toHeli' || S.op === 'board') { S.t += dt; rpm = Math.min(0.6, rpm + dt * 0.1);
      ESC.forEach((f, i) => { if (!f.visible) return; if (walkTo(f, BOARD[0] - 0.4, BOARD[1] + (i ? -0.8 : 0.8), dt, 2.8, 0.3)) { f.visible = false; tone(420, 0.12, 0.03, 'square'); } });
      if (S.op === 'toHeli' && ESC.every(f => !f.visible)) S.op = 'board';
      arrow.visible = true; arrow.position.set(H0.x, H0.y + 4.6 + 0.2 * Math.sin(t * 4), H0.z);
      EDGE.forEach(f => { face(f, P.x, P.z, dt, 3); kit.animFox(f, dt, 0, false); }); }
    if (S.op === 'toHeli' || S.op === 'board' || S.op === 'stop' || S.op === 'talk') {   // the edge guards hold you in the area
      const dx = P.x - CX, dz = P.z - CZ, d = Math.hypot(dx, dz); S.blockT -= dt;
      if (d > ROYAL.area) { P.x = CX + dx / d * ROYAL.area; P.z = CZ + dz / d * ROYAL.area; P.sp = 0; P.y = Math.max(P.y, gy(P.x, P.z));
        if (S.blockT <= 0 && S.op !== 'talk') { S.blockT = 7; const g = EDGE.slice().sort((a, b) => Math.hypot(a.position.x - P.x, a.position.z - P.z) - Math.hypot(b.position.x - P.x, b.position.z - P.z))[0]; face(g, P.x, P.z, 1); sayTo(tk(g), [{ who: 'npc', text: LINE_BLOCK }], null, false); } } }
    if (S.op === 'lift') { S.t += dt; const T = S.t; if (fox) fox.visible = false; P.sp = 0;
      rpm = Math.min(1, 0.6 + T * 0.35); const up = Math.max(0, T - 1.2), k = Math.min(1, up / 2.2), e = k * k * (3 - 2 * k);
      if (heli) { heli.position.set(H0.x, H0.y + e * (RT[0].y - H0.y), H0.z); heli.rotation.set(0, H0.yaw, 0.04 * Math.sin(T * 1.7), 'YXZ'); seatPilot(); }
      if (T > 1.0 && !FL.tr && train) trainStart();
      if (k >= 1) { S.op = 'fly'; S.t = 0; FL.yaw = H0.yaw; } }
    else if (S.op === 'fly') { S.t += dt; if (fox) fox.visible = false; rpm = 1; flyTick(dt, P, fox); }
    else if (S.op === 'land') { S.t += dt; if (fox) fox.visible = false; rpm = 1; if (P) { P.x = AP[0]; P.z = AP[1] + 5; P.y = gy(P.x, P.z); P.sp = 0; } landTick(dt); }
    else if (S.op === 'arrive') { S.t += dt; rpm = Math.max(0.15, rpm - dt * 0.25); seatPilot();
      if (!S.out && S.t > 1.6) { S.out = true; save.setFlag('heliToArena'); const ox = AP[0] - 2.6, oz = AP[1] + 4.4; Object.assign(P, { x: ox, z: oz, vy: 0, sp: 0, car: false }); P.y = gy(ox, oz) + APY; P.yaw = PI / 2; if (fox) fox.visible = true;
        ESC.forEach((f, i) => { const x = AP[0] - 1.2 + i * 1.3, z = AP[1] + 3.0 + i * 0.6; f.position.set(x, gy(x, z) + APY, z); f.rotation.y = PI / 2; f.visible = true; }); EDGE.forEach(f => { f.visible = false; });
        toast('MERU ARENA \u00b7 YOU ARE NEXT', 4); }
      if (S.out) { if (fox) fox.visible = true; ESC.forEach(f => { face(f, P.x, P.z, dt, 3); kit.animFox(f, dt, 0, false); });
        if (Math.hypot(P.x - AP[0], P.z - AP[1]) > 40 || S.t > 120) { S.op = null; S.out = false; showG(false); pilot.visible = false; parkHeli(); rpm = 0; rideShow(true); try { if (landAud) landAud.pause(); } catch (e) {} } } }
  }
  function busy() { return S.op === 'lift' || S.op === 'fly' || S.op === 'land' || (S.op === 'arrive' && !S.out) || (S.beam && S.beam.out) || S.leave ? 'royal' : null; }
  function prompt(P) { if (S.op === 'fly') return FL.d < CL - 120 ? 'SKIP THE FLIGHT' : null; if (S.op === 'lift' || S.op === 'land' || S.leave) return null;
    if ((S.op === 'board' || S.op === 'toHeli') && nearBoard(P)) return 'BOARD THE HELICOPTER';
    if (onTele(P) && !S.beam) return S.op ? null : 'TELEPORT \u00b7 SPACE DOCK'; return null; }
  function talk(P) { if (S.op === 'fly' && FL.d < CL - 120) { FL.d = CL - 120; FL.v = Math.min(FL.v, 20); FL.cam = null; return true; }   // E in the air = skip to the arena
    if (S.op === 'lift' || S.op === 'fly' || S.op === 'land' || S.leave) return true;
    if ((S.op === 'board' || S.op === 'toHeli') && nearBoard(P)) { board(P); return true; }
    if (onTele(P) && !S.beam) { if (S.op) { toast('KING\u2019S ORDERS \u00b7 BOARD THE HELICOPTER', 2.5); return true; } teleport(P); return true; } return false; }
  function camFix(cam, dt) { if (!heli || !['lift', 'fly', 'land', 'arrive'].includes(S.op) || (S.op === 'arrive' && S.out)) return; const h = heli.position, look = V3(h.x, h.y + 1.2, h.z);
    let want = null, k = 1;
    if (S.op === 'lift') want = V3(CX - 6, Y + 3.2, CZ + 16);
    else if (S.op === 'fly') { const nearX = Math.abs(FL.d - DX) < 75, nearF = Math.abs(FL.d - DF) < 60;
      if (nearX) want = V3(XT[0] + 30, 3.5, XT[1] + 16);   // low beside the rails: the helicopter crosses over the train
      else if (nearF) want = V3(26, 5, 30);                 // the fountain, looking up as you circle it
      else { const fx = Math.sin(FL.yaw), fz = Math.cos(FL.yaw); want = V3(h.x - fx * 15 + fz * 4, h.y + 5, h.z - fz * 15 - fx * 4); look.set(h.x + fx * 6, h.y + 0.5, h.z + fz * 6); k = 2.6; }
      const key = nearX ? 'x' : nearF ? 'f' : 'c'; if (FL.camKey !== key) { FL.camKey = key; FL.cam = null; } }
    else want = V3(AP[0] - 14, 5, AP[1] + 15);
    if (!FL.cam || k === 1) FL.cam = want.clone(); else FL.cam.lerp(want, Math.min(1, dt * k));
    cam.position.copy(FL.cam); cam.lookAt(look); }
  function quest() { if (S.op === 'fly' || S.op === 'lift' || S.op === 'land') return 'Fly to the arena'; if (S.op === 'board' || S.op === 'toHeli') return 'Board the royal helicopter'; if (S.op === 'wait') return 'Walk past the royal landing pad'; return null; }
  const api = { tick, busy, prompt, talk, camFix, quest, toast: () => (S.toastT > 0 ? S.toast : ''), quit() {}, useItem: () => false, pos: () => ({ pad: ROYAL.pad, tele: ROYAL.tele }), _S: S, open: () => { S.op = 'wait'; showG(true); ESC.forEach((f, i) => { f.position.set(ESC0[i][0], gy(ESC0[i][0], ESC0[i][1]), ESC0[i][1]); }); } };
  return api;
}
