// MERU 2.0 — s114 MERU LANES [meruBowling] DELUXE PART A (Ben's answers s114): TWO keepers — MOTT at the shoe desk (2D look + apron, his 2D
// lines verbatim) and SPROCKET, a NEW pinsetter mechanic in the NEW walk-in BACK ROOM behind the pin decks (x 144.75..149.6 × z -37.6..-15.1,
// STAFF ONLY gate in its south wall off the café floor) — shop kit, and the first 6 jobs: SHOE DESK · SORT THE BALL RACK · POLISH THE BALLS (Mott)
// · OIL THE LANES · UNJAM THE PINSETTER · FIX THE BALL RETURN (Sprocket). Built in the hall's ORIGINAL frame (f 105..150 × -38..10, door W (105, -14));
// meru2-walk.js adds API.group to RL.MV 'bowling'. Stats prefix mln. Parts B / C (league night, foul judge, bumpers, claw, lost + found, the cast
// challenges, prizes, glow bowling + look extras, visitors) to come.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { lnJobsB, LN_GAMES_B } from './meru2-lanes-jobs2.js';
import { lnPrizes } from './meru2-lanes-prize.js';   // s116 part C1: prizes, honour board, diner menu
import { lnLife } from './meru2-lanes-life.js?v=s645';   // s117 part C2: cosmic glow, disco, neon, trophy case, jukebox, strike show, roster / league / party / diner life
import { lnCast } from './meru2-lanes-cast.js';   // s115 part B2: Rook / Nera / Gale challenges + spare drills on the 3D tenpin   // s115 part B: keep score, foul judge, kids' bumpers, claw restock, lost + found
const MP = { name: 'Mott', role: 'LANES KEEPER', color: '#b07a2c', torso: ['#f0b866', '#b07a2c', '#5a3a12'],
  hello: ['Mott. Shoes, lanes, and a job if you want one.', 'Back again? The pins missed you.', 'Plenty to do. Pick a job.', 'Good timing. The shoes are piling up.'],
  open: ['Tidy work.', 'The lanes thank you.', 'Chalked up.', 'That is how a house runs.'],
  tips: ['Spray every pair. Every pair.', 'Light balls up top, heavy ones low. Backs matter.', 'A clean ball rolls true.', 'Sprocket talks to the machines. Let him.', 'Nera says 212 was luck. It was not.'] };
const SP = { name: 'Sprocket', role: 'PINSETTER MECHANIC', torso: ['#4a5a6b', '#e07a1a', '#2a333d'],
  hello: ['Sprocket. I keep the machines happy. Want to get greasy?', 'Back for more grease? Good.'],
  tips: ['Six machines, six moods. Lane four sulks.', 'Tilted pins first, then reset. Never the other way.', 'Oil the middle, keep the edges dry. That is the hook.', 'Bolts out, ball out, then test.'] };
const LANES_OPEN = [{ who: 'player', text: 'Are the lanes open?' },
  { who: 'npc', text: 'All three, and no coin for any of them. King Might had them laid the year the gates woke \u2014 said a city that only knows how to fight forgets how to be a city.' },
  { who: 'npc', text: 'Shoes are on the rack behind me. Take a pair, bring them back, that is the whole arrangement.' },
  { who: 'player', text: 'Anyone worth bowling against?' },
  { who: 'npc', text: 'ROOK at the table bowls a hundred and forty-seven, near enough every week, and I have watched him do it for two years. Never a word about it either.' },
  { who: 'npc', text: 'Gale down at lane one has been trying to beat him since the spring. Ask him how it is going. Go on.' },
  { who: 'npc', text: 'And NERA at the racks holds the house \u2014 two hundred and twelve. She will tell you it was luck. It was not.' }];
const NAMES = ['PELL', 'FLICK', 'KIA', 'OTTO', 'MARLA', 'PIP', 'GALE', 'NERA'];
export function buildLanesJobs({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted, lanes, tenpin = () => false, tenpinOn = () => false, heal = null, wear = null }) { const JW = jobWorker(THREE);
  const mutedQ = () => { try { return !!(isMuted && isMuted()); } catch (e) { return true; } };
  const R0 = { X0: 105, X1: 150, Z0: -38, Z1: 10 }, DOOR = [105, -14], BR = { x0: 144.75, x1: 149.6, z0: -37.6, z1: -15.1 };
  const LZ = (lanes && lanes.LZ) || [-36, -32.2, -28.4, -24.6, -20.8, -17], PAIRS = (lanes && lanes.PAIRS) || [-34.1, -26.5, -18.9];
  const G = new THREE.Group(); G.name = 'lanesJobs'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const toW = v => { G.updateWorldMatrix(true, false); return G.localToWorld(v.clone()); };
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const sph = (par, r, c, x, y, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), new THREE.MeshPhongMaterial({ color: c, shininess: 90, specular: 0x777777 })); m.position.set(x, y, z); par.add(m); return m; };
  const colF = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const label = (txt, bg, fg, w = 512, h = 96, fs = 54) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = '900 ' + fs + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 18, H / 2 + 2); });
  const plane = (tex, w, h, x, y, z, ry = 0, par = G) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', STEEL = '#3a3f47', BALLC = ['#7c3aed', '#ec3013', '#38bdf8', '#ffd23a', '#22c55e', '#f472b6', '#f97316'];
  // ================= THE BACK ROOM (Ben: walk-in) =================
  const BRX = (BR.x0 + BR.x1) / 2, BRZ = (BR.z0 + BR.z1) / 2, BRW = BR.x1 - BR.x0, BRD = BR.z1 - BR.z0, GATE = [146.4, 148.2];
  { const conc = CT(128, 128, (g, w) => { g.fillStyle = '#6d6a66'; g.fillRect(0, 0, w, w); for (let i = 0; i < 260; i++) { g.fillStyle = Math.random() < 0.5 ? '#77736e' : '#625f5b'; g.fillRect(Math.random() * w, Math.random() * w, 2, 2); } g.strokeStyle = '#55524e'; g.lineWidth = 2; g.strokeRect(0, 0, w, w); });
    conc.wrapS = conc.wrapT = THREE.RepeatWrapping; conc.repeat.set(BRW / 2, BRD / 2);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(BRW, BRD), new THREE.MeshLambertMaterial({ map: conc })); fl.rotation.x = -Math.PI / 2; fl.position.set(BRX, 0.075, BRZ); fl.renderOrder = 1; G.add(fl);
    for (const x of [146.35, 148.35]) { const s = box(G, 0.08, 0.005, BRD - 0.4, YEL, x, 0.08, BRZ); s.renderOrder = 2; }   // walkway lines from the gate
    box(G, GATE[0] - 144.6, 2.6, 0.2, '#2a2830', (144.6 + GATE[0]) / 2, 1.3, -15.0); box(G, 149.6 - GATE[1], 2.6, 0.2, '#2a2830', (GATE[1] + 149.6) / 2, 1.3, -15.0);
    box(G, GATE[1] - GATE[0], 0.3, 0.2, '#2a2830', (GATE[0] + GATE[1]) / 2, 2.45, -15.0); for (const x of GATE) box(G, 0.08, 2.3, 0.24, YEL, x + (x === GATE[0] ? 0.04 : -0.04), 1.15, -15.0);
    plane(label('STAFF ONLY \u00b7 PINSETTERS', INK, YEL, 512, 64, 34), 1.7, 0.21, (GATE[0] + GATE[1]) / 2, 2.45, -14.88, 0);
    colF(144.6, GATE[0], -15.12, -14.88); colF(GATE[1], 149.7, -15.12, -14.88);
    // workbench + pegboard on the east wall, oil drums, cage lamps
    box(G, 0.9, 0.9, 3.2, '#5a3d26', 149.05, 0.45, -28.6); box(G, 0.95, 0.06, 3.3, '#7a5536', 149.05, 0.93, -28.6); colF(148.55, 149.7, -30.25, -26.95);
    box(G, 0.03, 1.2, 3.0, '#c9b48a', 149.55, 1.8, -28.6); for (let i = 0; i < 6; i++) box(G, 0.05, 0.3 + (i % 3) * 0.1, 0.06, ['#c0c4cc', RED, '#c0c4cc'][i % 3], 149.5, 1.8 + (i % 2) * 0.3, -29.8 + i * 0.48);
    for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.15, 10), LM('#f3f2f2')); p.position.set(148.85 + (i % 2) * 0.2, 1.03, -29.5 + i * 0.5); G.add(p); }
    for (const [x, z, c] of [[149.1, -36.6, '#1f5f9a'], [148.4, -36.8, RED]]) { cyl(G, 0.3, 0.3, 0.9, c, x, 0.45, z, 14); ring(x, z, 0.34); }
    for (const z of [-34, -27, -20]) { cyl(G, 0.03, 0.03, 0.8, INK, 147.4, 3.3, z, 6); const l = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffe8b0' })); l.position.set(147.4, 2.85, z); G.add(l); } }
  // the six pinsetters, one behind each pin deck (their face toward the room, +x)
  const MX = 145.5, FACE = 146.27;
  const MACH = LZ.map((z, i) => { const g = new THREE.Group(); G.add(g); box(g, 1.5, 2.4, 1.9, STEEL, MX, 1.2, z); box(g, 1.52, 0.12, 1.92, '#2a2d33', MX, 2.45, z);
    const tur = cyl(g, 0.55, 0.55, 0.45, RED, MX, 2.75, z, 18); const wh = cyl(g, 0.6, 0.6, 0.07, '#2a2d33', FACE, 1.35, z, 22); wh.rotation.z = Math.PI / 2; const rim = cyl(g, 0.62, 0.62, 0.04, YEL, FACE - 0.02, 1.35, z, 22); rim.rotation.z = Math.PI / 2;
    const hub = cyl(g, 0.1, 0.1, 0.1, '#c0c4cc', FACE + 0.04, 1.35, z, 10); hub.rotation.z = Math.PI / 2;
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: '#3fd36a' })); lamp.position.set(FACE, 2.2, z - 0.6); g.add(lamp);
    const btn = cyl(g, 0.09, 0.09, 0.06, YEL, FACE + 0.01, 0.65, z + 0.6, 12); btn.rotation.z = Math.PI / 2;
    plane(label('LANE ' + (i + 1), INK, WHITE, 256, 96, 56), 0.5, 0.19, FACE + 0.005, 2.2, z + 0.25, Math.PI / 2, g);
    colF(MX - 0.75, FACE + 0.05, z - 0.95, z + 0.95); return { g, z, tur, wh, lamp, btn, i }; });
  // ================= the keepers =================
  const oldMott = lanes && lanes.npcs ? lanes.npcs.find(f => f && f.position && Math.abs(f.position.x - 113) < 0.5 && Math.abs(f.position.z + 7.7) < 0.5) : null;
  const mott = kit.makeFox({ key: 'lnMott', torso: MP.torso, outfit: 'vest', mood: 'warm' });
  const MOTT = { x: 113, z: -7.7, ry: Math.PI }; mott.position.set(MOTT.x, 0, MOTT.z); mott.rotation.y = MOTT.ry; G.add(mott);
  { const P0 = mott.userData && mott.userData.P; if (P0 && P0.body) { box(P0.body, 0.42, 0.55, 0.04, '#f3ead8', 0, 0.62, 0.3); } if (P0 && P0.arms && P0.arms[0]) box(P0.arms[0], 0.06, 0.28, 0.12, WHITE, 0, -0.42, 0.08); }
  const mech = kit.makeFox({ key: 'lnMech', torso: SP.torso, outfit: 'coat', mood: 'happy' });
  const MECH = { x: 147.6, z: -18.6, ry: 0 }; mech.position.set(MECH.x, 0, MECH.z); mech.rotation.y = MECH.ry; G.add(mech); ring(MECH.x, MECH.z, 0.42);
  { const P0 = mech.userData && mech.userData.P; if (P0 && P0.head) { box(P0.head, 0.42, 0.1, 0.42, '#e07a1a', 0, 0.3, 0); box(P0.head, 0.36, 0.03, 0.2, '#e07a1a', 0, 0.26, 0.28); }
    if (P0 && P0.arms && P0.arms[1]) { box(P0.arms[1], 0.04, 0.34, 0.06, '#c0c4cc', 0, -0.5, 0.1); box(P0.arms[1], 0.12, 0.06, 0.06, '#c0c4cc', 0, -0.68, 0.1); }
    if (P0 && P0.body) box(P0.body, 0.2, 0.08, 0.04, RED, 0.1, 0.5, 0.3); }
  const kT = { key: 'lnMott', name: MP.name, role: MP.role, obj: mott, ry: MOTT.ry, r: 6 }, sT = { key: 'lnMech', name: SP.name, role: SP.role, obj: mech, ry: MECH.ry, r: 6 };
  const ln = text => ({ who: 'lnMott', role: MP.role, text }), lnS = text => ({ who: 'lnMech', role: SP.role, text });
  // ================= rings =================
  const RINGS = { shoes: [116.2, -7.2], polish: [109.6, -7.2], rack: [113.4, -34.7], oil: [125.4, -36], ret: [122.6, -35.8], unjam: [148.4, -24] };
  const ringMesh = k => { const [x, z] = RINGS[k]; const r1 = cyl(G, 0.5, 0.5, 0.012, YEL, x, 0.09, z, 22), r2 = cyl(G, 0.42, 0.42, 0.014, INK, x, 0.092, z, 22); r1.renderOrder = r2.renderOrder = 2; }; for (const k in RINGS) ringMesh(k);
  // ================= shop kit =================
  const GAMES = [{ k: 'shoes', name: 'Shoe Desk', color: '#c42d3c', grp: 'mott' }, { k: 'rack', name: 'Sort the Ball Rack', color: '#7c3aed', grp: 'mott' }, { k: 'polish', name: 'Polish the Balls', color: '#38bdf8', grp: 'mott' },
    { k: 'oil', name: 'Oil the Lanes', color: '#e6b45a', grp: 'mech' }, { k: 'unjam', name: 'Unjam the Pinsetter', color: RED, grp: 'mech' }, { k: 'ret', name: 'Fix the Ball Return', color: '#22c55e', grp: 'mech' }, ...LN_GAMES_B];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), pre = 'mln';
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted: mutedQ, prefix: pre, color: MP.color, boardTitle: "Mott's best", toWorld: toW, room: R0, door: [DOOR[0] + 0.5, DOOR[1]], keeper: mott, keeperRy: MOTT.ry, games: GAMES,
    board: { x: 105.38, y: 3.3, z: -9.0, ry: Math.PI / 2, w: 1.3 }, hiring: { x: 107.4, y: 0, z: -17.2, ry: -Math.PI / 2 }, hiringLine: 'WALK UP \u00b7 START WORK',
    sun: [{ x: 107.6, z: -21, w: 2.6, d: 3.2 }, { x: 107.6, z: -7, w: 2.6, d: 3.2 }], lamps: [[110, 3.4, -20], [116, 3.4, -20], [110, 3.4, -13], [116, 3.4, -13], [127.2, 4.2, -26.5], [138.6, 4.2, -26.5]],
    browse: [[114.6, -28.0, Math.PI / 2], [114.6, -21.2, Math.PI / 2], [113, -11.0, 0], [130, 6.2, Math.PI]], slots: 2, clock: { x: 105.38, y: 3.5, z: -36.4, ry: Math.PI / 2 } });
  // ================= state, sound, card UI (same card as every shop) =================
  let toastTxt = '', toastT = 0, talked = 0, talkedS = 0, busy = null, J = null, thanks = null, lastP = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at0 = 0) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at0, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = bf; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square');
  const clack = () => { tone(1500, 0.06, 0.06, 'square'); tone(700, 0.04, 0.08, 'triangle', 0.02); }, thunk = () => { tone(110, 0.09, 0.25, 'sine'); noise(0.12, 0.03, 300); }, hiss = (l = 0.3) => noise(l, 0.035, 2500);
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + MP.color + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span></div>';
  const lst = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + items.map(([sw, t, r, ok]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (r ? ' \u00b7 ' + r : '') + '</span>').join('') + '</div>' : items.map(a => row(...a)).join('');
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>';
  const gauge = (v, a, b) => '<div style="position:relative;height:16px;border:2px solid #201e1d;background:#ffffff;margin-top:6px"><div style="position:absolute;top:0;bottom:0;left:' + (a * 100) + '%;width:' + ((b - a) * 100) + '%;background:#3fd36a"></div><div style="position:absolute;top:0;bottom:0;left:0;width:' + Math.min(100, v * 100).toFixed(1) + '%;background:rgba(32,30,29,0.55)"></div></div>';
  const setCard = (k, html) => { if (k === cardKey) return; cardKey = k; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && !!J && !GN[J.g].walk;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), TAPR = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(toW(v)).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearest = (list, posOf, r) => { let best = -1, bd = r; list.forEach((it, i) => { const d = dist(scrW(posOf(it))); if (d < bd) { bd = d; best = i; } }); return best; };
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = V(), inv = new THREE.Matrix4();
  const setRay = () => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); };
  const ray = () => { setRay(); G.updateWorldMatrix(true, false); inv.copy(G.matrixWorld).invert(); return rc.ray.clone().applyMatrix4(inv); };
  const hitY = y => (ray().intersectPlane(new THREE.Plane(V(0, 1, 0), -y), hitP) ? hitP.clone() : null);
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const Fq of J.flies.slice()) { Fq.t += dt / Fq.dur; const k = Math.min(1, Fq.t), e = k * k * (3 - 2 * k); Fq.obj.position.lerpVectors(Fq.from, Fq.to, e); Fq.obj.position.y += Math.sin(k * Math.PI) * Fq.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(Fq), 1); Fq.then && Fq.then(); } } }
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt + bg] || (tagTex[txt + bg] = CT(160, 96, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = '900 ' + (txt.length > 4 ? 34 : txt.length > 2 ? 44 : 60) + 'px Archivo, sans-serif'; g.fillText(txt, W2 / 2, H / 2 + 3); }));
  const tagSprite = (txt, bg = '#ffffff', fg = INK, s = 0.5) => { if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: false })); sp.scale.set(s, s * 0.6, 1); sp.renderOrder = 6; return sp; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (after, t = 1.0) => { J.pause = t; J.after = after; };
  const done = () => save.stat(pre + 'Done', null) || {};
  const blotT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 3, 32, 32, 31); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.65, 'rgba(255,255,255,0.85)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, rr = 23 + (i % 3) * 5; g.lineTo(32 + Math.cos(a) * rr, 32 + Math.sin(a) * rr); } g.fill(); });
  const CUST = [['#f97316', 'vest'], ['#38bdf8', 'coat'], ['#a78bfa', 'dress', 1]].map(([t, o, fem], i) => { const f = kit.makeFox({ key: 'lnCust' + i, torso: t, outfit: o, female: !!fem, mood: 'happy' }); f.visible = false; G.add(f); return f; });
  // ================= JOB 1: SHOE DESK (Mott) — tap the pair in the size asked for · returned pairs: HOLD the spray, let go on green =================
  const SZ = [7, 8, 9, 10, 11], DY = 1.11, DZ = -9.05, SPRAY = [0.55, 0.8];
  const shoePair = c => { const g = new THREE.Group(); for (const s of [-0.08, 0.08]) { box(g, 0.13, 0.09, 0.27, c, s, 0.045, 0); box(g, 0.135, 0.025, 0.28, WHITE, s, 0.012, 0); box(g, 0.1, 0.05, 0.08, '#f3ead8', s, 0.1, -0.06); } return g; };
  const SHOES = SZ.map((n, i) => { const g = shoePair(i % 2 ? '#2e4a6b' : '#c42d3c'); g.position.set(111.4 + i * 0.8, DY, DZ); g.visible = false; G.add(g); const t = tagSprite(String(n), YEL, INK, 0.28); t.position.set(0, 0.32, 0); g.add(t); return g; });
  const CAN = new THREE.Group(); cyl(CAN, 0.05, 0.05, 0.2, '#22c55e', 0, 0.1, 0, 10); cyl(CAN, 0.02, 0.02, 0.05, WHITE, 0, 0.22, 0, 6); CAN.position.set(113.6, DY, DZ + 0.1); CAN.visible = false; G.add(CAN);
  const mist = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4), new THREE.MeshBasicMaterial({ map: blotT, color: '#d8f5e0', transparent: true, opacity: 0, depthWrite: false })); mist.position.set(113.2, DY + 0.25, DZ - 0.2); mist.renderOrder = 5; G.add(mist);
  const G1 = {
    begin() { const kinds = shuffle(['rent', 'rent', 'rent', 'rent', 'spray', 'spray']); if (kinds[0] === 'spray') kinds.push(kinds.shift()); J.q = kinds.map((k, i) => ({ k, size: SZ[Math.random() * 5 | 0], who: NAMES[(Math.random() * 6) | 0], f: CUST[i % 3] }));
      J.i = 0; SHOES.forEach(s => { s.visible = true; }); mott.position.set(110.4, 0, -7.3); this.next(); toast('A FOX COMES UP \u00b7 TAP THE SIZE THEY ASK FOR', 2.6); },
    next() { const c = J.q[J.i]; if (!c) return; CUST.forEach(f => { f.visible = f === c.f; }); c.f.position.set(113, 0, -10.4); c.f.rotation.y = 0; J.lvl = 0; J.hold = false;
      if (J.tag) { G.remove(J.tag); J.tag = null; } J.tag = own(tagSprite(c.k === 'rent' ? 'SIZE ' + c.size : 'RETURN', c.k === 'rent' ? WHITE : '#7cff9b', INK, 0.5)); J.tag.position.set(113, 2.15, -10.4);
      if (c.k === 'spray') { c.pair = own(shoePair('#6b4a2a')); c.pair.position.set(113.1, DY, DZ - 0.2); c.stink = own(tagSprite('~ ~ ~', '#7cff9b', INK, 0.34)); c.stink.position.set(113.1, DY + 0.42, DZ - 0.2); CAN.visible = true; } else CAN.visible = false; pop(); },
    after() { const c = J.q[J.i]; c.f.visible = false; J.i++; if (J.i >= J.q.length) { ding(); NEXT(finishGame, 0.6); } else NEXT(() => G1.next(), 0.5); },
    press() { const c = J.q[J.i]; if (!c || J.flies.length) return; if (c.k === 'spray') { J.hold = true; J.lvl = J.lvl || 0; return; }
      const b = nearest(SHOES, s => s.position.clone().setY(DY + 0.1), TAPR() * 1.5); if (b < 0) return; if (SZ[b] !== c.size) { miss('THAT IS A ' + SZ[b] + ' \u00b7 ' + c.who + ' WANTS ' + c.size, 1.6); return; }
      const sh = SHOES[b], home = sh.position.clone(); clack(); addGold(3); fly(sh, V(113, DY + 0.05, DZ - 0.35), 0.25, 0.15, () => { if (!J) return; toast(c.who + ': "PERFECT FIT!"', 1.2); NEXT(() => { sh.position.copy(home); G1.after(); }, 0.5); }); },
    release() { const c = J && J.q[J.i]; if (!c || c.k !== 'spray' || !J.hold) return; J.hold = false; if (J.lvl < SPRAY[0]) { miss('STILL SMELLY \u00b7 HOLD LONGER', 1.4); J.lvl = 0; return; } if (J.lvl <= SPRAY[1]) { addGold(3); ding(); toast('FRESH AS A DAISY', 1.2); c.stink.visible = false; fly(c.pair, V(113, DY + 0.6, -5.9), 0.4, 0.2, () => { if (J) c.pair.visible = false; }); NEXT(() => G1.after(), 0.6); } },
    tick(dt) { const c = J.q[J.i]; if (!c) return; if (c.k === 'spray' && J.hold) { J.lvl += dt * 0.6; if ((J.st = (J.st || 0) + dt) > 0.12) { J.st = 0; hiss(0.12); } if (J.lvl > 1) { J.hold = false; J.lvl = 0; miss('TOO MUCH SPRAY \u00b7 COUGH, COUGH', 1.6); } }
      mist.material.opacity = J.hold ? 0.55 : Math.max(0, mist.material.opacity - dt * 2); CAN.rotation.z = J.hold ? -0.5 : 0; },
    card() { const c = J.q[J.i]; if (!c) return ['ALL SERVED', lab('6 / 6'), 'e']; if (c.k === 'spray') return ['HOLD \u00b7 LET GO ON GREEN', lab((J.i + 1) + ' / 6 \u00b7 ' + c.who + ' \u00b7 RETURN') + gauge(J.lvl, SPRAY[0], SPRAY[1]), 's' + J.i + '_' + Math.round(J.lvl * 30)];
      return ['TAP SIZE ' + c.size, lab((J.i + 1) + ' / 6 \u00b7 ' + c.who) + lst(SZ.map(n => [n === c.size ? YEL : WHITE, 'SIZE ' + n, '', n === c.size])), 'r' + J.i]; },
    hint() { const c = J.q[J.i]; if (!c) return null; if (c.k === 'spray') return J.hold ? null : [CAN.position.clone().setY(DY + 0.2), 'HOLD']; return [SHOES[SZ.indexOf(c.size)].position.clone().setY(DY + 0.1), 'TAP']; },
    shot() { return [V(113, DY + 0.1, DZ), 3.8, 1.7, 0.55, 2.0, 0, 3.0]; },
    end() { SHOES.forEach(s => { s.visible = false; }); CAN.visible = false; mist.material.opacity = 0; CUST.forEach(f => { f.visible = false; }); mott.position.set(MOTT.x, 0, MOTT.z); mott.rotation.y = MOTT.ry; } };
  // ================= JOB 2: SORT THE BALL RACK (Mott) — a ball on the cart, tap its tier: TOP 8-10 LB · MIDDLE 12 · BOTTOM 14-16 =================
  const RKZ = -34.7, TIERS = [{ y: 1.25, x: 115.6, t: '8-10', ok: w => w <= 10 }, { y: 0.85, x: 115.8, t: '12', ok: w => w === 12 }, { y: 0.45, x: 116.0, t: '14-16', ok: w => w >= 14 }], WTS = [8, 10, 12, 14, 16];
  const CART = new THREE.Group(); box(CART, 0.6, 0.06, 0.6, '#c0c4cc', 0, 0.7, 0); for (const [x, z] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) box(CART, 0.04, 0.7, 0.04, '#c0c4cc', x, 0.35, z); CART.position.set(114.4, 0, RKZ); CART.visible = false; G.add(CART);
  const TIERTAG = TIERS.map(t => { const s = tagSprite(t.t, YEL, INK, 0.36); s.position.set(t.x - 0.25, t.y + 0.05, -32.35); s.visible = false; G.add(s); return s; });
  const G2 = {
    begin() { J.q = shuffle([8, 10, 12, 12, 14, 16, 8, 14, 16]).map(w => ({ w })); J.i = 0; CART.visible = true; TIERTAG.forEach(s => { s.visible = true; }); this.next(); toast('TAP THE TIER FOR ITS WEIGHT \u00b7 LIGHT UP TOP, HEAVY LOW', 2.8); },
    next() { const c = J.q[J.i]; if (!c) return; c.m = own(new THREE.Group()); sph(c.m, 0.14, BALLC[J.i % BALLC.length], 0, 0, 0); const t = tagSprite(c.w + ' LB', WHITE, INK, 0.36); t.position.y = 0.32; c.m.add(t); c.m.position.set(114.4, 0.9, RKZ); pop(); },
    press() { const c = J.q[J.i]; if (!c || J.flies.length) return; const b = nearest(TIERS, t => V(t.x, t.y + 0.1, RKZ), TAPR() * 1.8); if (b < 0) return;
      if (!TIERS[b].ok(c.w)) { miss(c.w + ' LB DOES NOT GO ' + ['UP TOP', 'IN THE MIDDLE', 'AT THE BOTTOM'][b], 1.5); return; }
      thunk(); addGold(2); fly(c.m, V(TIERS[b].x, TIERS[b].y + 0.12, RKZ + rnd(-0.6, 0.6)), 0.3, 0.2, () => { if (!J) return; c.m.visible = false; J.i++; if (J.i >= J.q.length) { ding(); NEXT(finishGame, 0.6); } else G2.next(); }); },
    card() { const c = J.q[J.i]; if (!c) return ['RACK SORTED', lab('9 / 9'), 'e']; return ['TAP THE TIER FOR ' + c.w + ' LB', lab((J.i + 1) + ' / 9') + lst(TIERS.map((t, i) => [YEL, ['TOP', 'MIDDLE', 'BOTTOM'][i], t.t + ' LB', t.ok(c.w)])), 'k' + J.i]; },
    hint() { const c = J.q[J.i]; if (!c) return null; const t = TIERS.find(q => q.ok(c.w)); return [V(t.x, t.y + 0.1, RKZ), 'TAP']; },
    shot() { return [V(115.0, 0.85, RKZ), 2.6, 1.8, 0.3, 2.2, -Math.PI / 2, 3.4]; },
    end() { CART.visible = false; TIERTAG.forEach(s => { s.visible = false; }); } };
  // ================= JOB 3: POLISH THE BALLS (Mott) — a ball turns on the spinner; drag the cloth over the scuffs, 3 balls =================
  const SPN = V(109.4, DY, DZ), BR3 = 0.22;
  const SPIN = new THREE.Group(); cyl(SPIN, 0.2, 0.24, 0.12, INK, 0, 0.06, 0, 16); cyl(SPIN, 0.12, 0.12, 0.04, '#c0c4cc', 0, 0.14, 0, 12); SPIN.position.copy(SPN); G.add(SPIN);
  const PBALL = sph(G, BR3, BALLC[0], SPN.x, SPN.y + 0.16 + BR3, SPN.z); PBALL.visible = false;
  const CLOTH = new THREE.Group(); box(CLOTH, 0.16, 0.03, 0.14, '#f6efe0', 0, 0, 0); CLOTH.visible = false; G.add(CLOTH);
  const G3 = {
    begin() { J.b = 0; this.load(); toast('DRAG THE CLOTH OVER THE SCUFFS \u00b7 THE BALL TURNS', 2.6); },
    load() { PBALL.material.color.set(BALLC[(J.b * 2 + 1) % BALLC.length]); PBALL.visible = true; PBALL.rotation.set(0, 0, 0); (J.sp || []).forEach(s => PBALL.remove(s.m)); J.sp = [];
      for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 + rnd(-0.3, 0.3), el = rnd(-0.15, 0.75), dir = V(Math.cos(el) * Math.sin(a), Math.sin(el), Math.cos(el) * Math.cos(a));
        const m = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), new THREE.MeshBasicMaterial({ map: blotT, color: '#3a3a3a', transparent: true, opacity: 0.85, depthWrite: false })); m.position.copy(dir).multiplyScalar(BR3 + 0.004); m.lookAt(dir.clone().multiplyScalar(2)); m.renderOrder = 4; PBALL.add(m); J.sp.push({ dir, m, d: 1 }); } pop(); },
    press() { J.lp = null; },
    drag() { if (!ptr.down) return; setRay(); PBALL.updateMatrixWorld(true); const h = rc.intersectObject(PBALL, false)[0]; if (!h) return; CLOTH.visible = true; G.updateWorldMatrix(true, false); CLOTH.position.copy(G.worldToLocal(h.point.clone()));
      const p = h.point.clone(), mv = J.lp ? J.lp.distanceTo(p) : 0; J.lp = p; if (mv < 0.002) return; if ((J.sw = (J.sw || 0) + mv) > 0.2) { J.sw = 0; noise(0.06, 0.015, 5000); }
      const loc = PBALL.worldToLocal(p.clone()).normalize();
      for (const s of J.sp) { if (s.d <= 0 || s.dir.distanceTo(loc) > 0.38) continue; s.d -= mv * 4.5; s.m.material.opacity = Math.max(0, s.d) * 0.85; if (s.d <= 0) { s.m.visible = false; tone(2600, 0.03, 0.3); addGold(1); } }
      if (J.sp.every(s => s.d <= 0) && !J.pause) { ding(); J.b++; if (J.b >= 3) NEXT(finishGame, 0.8); else NEXT(() => G3.load(), 0.7); } },
    release() { J.lp = null; CLOTH.visible = false; },
    tick(dt) { if (PBALL.visible) PBALL.rotation.y += dt * 0.7; },
    card() { const n = J.sp ? J.sp.filter(s => s.d > 0).length : 5; return ['DRAG THE CLOTH', lab('BALL ' + Math.min(3, J.b + 1) + ' / 3') + lst([['#3a3a3a', 'SCUFFS', n + ' LEFT', !n]]), 'p' + J.b + '_' + n]; },
    hint() { const s = J.sp && J.sp.find(q => q.d > 0); if (!s) return null; PBALL.updateMatrixWorld(true); G.updateWorldMatrix(true, false); return [G.worldToLocal(PBALL.localToWorld(s.dir.clone().multiplyScalar(BR3))), 'RUB']; },
    shot() { return [V(SPN.x, SPN.y + 0.38, SPN.z), 0.9, 0.8, 0.35, 1.0, 0, 1.6]; },
    end() { PBALL.visible = false; CLOTH.visible = false; } };
  // ================= JOB 4: OIL THE LANES (Sprocket) — lane 1: drag the oiler over the dotted middle boards, keep the edges + the far end dry =================
  const OZ = LZ[0], OX0 = 126.8, SEG = 2, NS = 7, NB = 5, BW = 0.36, OY = 0.125;
  const cellPos = (s, b) => V(OX0 + SEG * (s + 0.5), OY, OZ + (b - 2) * BW);
  const dotT = CT(64, 64, (g, w) => { g.strokeStyle = 'rgba(255,210,58,0.95)'; g.lineWidth = 5; g.setLineDash([8, 6]); g.strokeRect(4, 4, w - 8, w - 8); });
  const OILER = new THREE.Group(); box(OILER, 0.7, 0.32, 0.9, RED, 0, 0.2, 0); box(OILER, 0.72, 0.05, 0.92, INK, 0, 0.38, 0); box(OILER, 0.06, 0.6, 0.06, '#c0c4cc', -0.4, 0.6, 0); OILER.visible = false; G.add(OILER);
  const G4 = {
    begin() { J.cells = []; for (let s = 0; s < NS; s++) for (let b = 0; b < NB; b++) { const tgt = s < 5 && b >= 1 && b <= 3, p = cellPos(s, b);
        const sheen = own(new THREE.Mesh(new THREE.PlaneGeometry(SEG * 0.98, BW * 0.96), new THREE.MeshBasicMaterial({ color: '#bfe8ff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }))); sheen.rotation.x = -Math.PI / 2; sheen.position.copy(p); sheen.renderOrder = 3;
        let dot = null; if (tgt) { dot = own(new THREE.Mesh(new THREE.PlaneGeometry(SEG * 0.98, BW * 0.96), new THREE.MeshBasicMaterial({ map: dotT, transparent: true, depthWrite: false }))); dot.rotation.x = -Math.PI / 2; dot.position.copy(p).setY(OY + 0.002); dot.renderOrder = 3; }
        J.cells.push({ s, b, tgt, sheen, dot, on: false }); }
      OILER.visible = true; OILER.position.copy(cellPos(0, 2)); J.lp = null; toast('DRAG THE OILER \u00b7 OIL INSIDE THE DOTTED LINES ONLY', 2.8); },
    press() { J.lp = null; },
    drag() { if (!ptr.down) return; const p = hitY(OY); if (!p) return; p.x = clamp(p.x, OX0 + 0.2, OX0 + SEG * NS - 0.2); p.z = clamp(p.z, OZ - 2.5 * BW, OZ + 2.5 * BW); OILER.position.set(p.x, OY, p.z);
      const mv = J.lp ? Math.hypot(p.x - J.lp.x, p.z - J.lp.z) : 0; J.lp = p; if (mv > 0.01 && (J.sw = (J.sw || 0) + mv) > 0.8) { J.sw = 0; hiss(0.15); }
      const s = clamp(Math.floor((p.x - OX0) / SEG), 0, NS - 1), b = clamp(Math.round((p.z - OZ) / BW) + 2, 0, NB - 1), c = J.cells.find(q => q.s === s && q.b === b); if (!c || c.on) return;
      c.on = true; c.sheen.material.opacity = c.tgt ? 0.42 : 0; if (c.tgt) { if (c.dot) c.dot.visible = false; addGold(1); pop(); } else { c.sheen.material.color.set('#ff6a55'); c.sheen.material.opacity = 0.35; miss(s >= 5 ? 'NOT THE FAR END \u00b7 THE BALL NEEDS GRIP TO HOOK' : 'NOT THE EDGES \u00b7 KEEP THE GUTTER BOARDS DRY', 1.6); }
      if (J.cells.every(q => !q.tgt || q.on) && !J.pause) { ding(); NEXT(finishGame, 0.9); } },
    release() { J.lp = null; },
    card() { const left = J.cells.filter(q => q.tgt && !q.on).length, bad = J.cells.filter(q => !q.tgt && q.on).length; return ['DRAG \u00b7 OIL THE DOTTED BOARDS', lab('LANE 1') + lst([['#bfe8ff', 'TO OIL', left + ' LEFT', !left], ['#ff6a55', 'DRY BOARDS OILED', String(bad), !bad]]), 'o' + left + '_' + bad]; },
    hint() { const c = J.cells.find(q => q.tgt && !q.on); return c ? [cellPos(c.s, c.b), 'DRAG'] : null; },
    shot() { return [V(OX0 + SEG * 3.2, 0.1, OZ), 3.0, 9.0, 0.85, 5, -Math.PI / 2, 11]; },
    end() { OILER.visible = false; } };
  // ================= JOB 5: UNJAM THE PINSETTER (Sprocket) — 3 machines in turn: tap the tilted pins on the wheel, then RESET =================
  const pinG = lanes && lanes.pinGeo ? lanes.pinGeo : new THREE.CylinderGeometry(0.05, 0.08, 0.57, 10).translate(0, 0.285, 0), pinM = new THREE.MeshLambertMaterial({ color: '#f3f2f2', vertexColors: !!(lanes && lanes.pinGeo && lanes.pinGeo.attributes.color) });
  const G5 = {
    begin() { J.ms = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3); J.mi = 0; this.load(); toast('TAP THE TILTED PINS ON THE WHEEL \u00b7 THEN THE YELLOW RESET', 2.8); },
    load() { const M = MACH[J.ms[J.mi]]; M.lamp.material.color.set('#ff2a1a'); J.ph = 'pins'; J.pins = []; const bad = shuffle([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, 2 + (J.mi > 0 ? 1 : 0));
      for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283, g = own(new THREE.Group()); g.position.set(FACE + 0.06, 1.35 + Math.sin(a) * 0.36, M.z + Math.cos(a) * 0.36); const p = new THREE.Mesh(pinG, pinM); p.scale.setScalar(0.42); p.position.y = -0.12; g.add(p);
        const ang = -a + Math.PI / 2; g.rotation.x = ang; const tilt = bad.includes(k); if (tilt) g.rotation.x += 0.75 * (k % 2 ? 1 : -1); let tg = null; if (tilt) { tg = own(tagSprite('!', RED, '#ffffff', 0.22)); tg.position.set(FACE + 0.25, g.position.y, g.position.z); }
        J.pins.push({ g, tilt, ok: !tilt, ang, tg }); } thunk(); },
    press() { const M = MACH[J.ms[J.mi]]; if (J.ph === 'spin') return;
      if (J.ph === 'reset') { const d = dist(scrW(M.btn.position)); if (d < TAPR() * 1.6) { clack(); J.ph = 'spin'; J.t0 = J.t; M.lamp.material.color.set('#ffd23a'); noise(0.9, 0.04, 400); } else { const pp = nearest(J.pins, q => q.g.position, TAPR()); if (pp >= 0) miss('PINS ARE DONE \u00b7 HIT THE YELLOW RESET', 1.4); } return; }
      const b = nearest(J.pins, q => q.g.position, TAPR() * 1.2); if (b >= 0) { const q = J.pins[b]; if (q.ok) { if (!q.tilt) miss('THAT ONE IS STRAIGHT \u00b7 THE RED ! ONES', 1.4); return; } q.ok = true; q.g.rotation.x = q.ang; if (q.tg) q.tg.visible = false; clack(); addGold(1);
          if (J.pins.every(p => p.ok)) { J.ph = 'reset'; pop(); toast('NOW THE YELLOW RESET BUTTON', 1.4); } return; }
      if (dist(scrW(M.btn.position)) < TAPR() * 1.4) miss('PINS FIRST \u00b7 THEN RESET', 1.4); },
    tick(dt) { const M = MACH[J.ms[J.mi]]; if (J.ph === 'reset') M.btn.scale.setScalar(1 + Math.abs(Math.sin(J.t * 6)) * 0.4); else M.btn.scale.setScalar(1);
      if (J.ph === 'spin') { const k = J.t - J.t0; M.wh.rotation.x += dt * 9; J.pins.forEach(q => { q.g.visible = k < 0.4; }); if (k > 1.1) { M.lamp.material.color.set('#3fd36a'); ding(); addGold(3); J.ph = 'done'; J.mi++; if (J.mi >= J.ms.length) NEXT(finishGame, 0.6); else NEXT(() => { J.pins.forEach(q => { if (q.tg) G.remove(q.tg); G.remove(q.g); }); G5.load(); }, 0.7); } } },
    card() { const n = J.pins ? J.pins.filter(q => !q.ok).length : 0, L = 'LANE ' + (MACH[J.ms[Math.min(J.mi, 2)]].i + 1); return [J.ph === 'reset' ? 'TAP THE YELLOW RESET' : J.ph === 'spin' ? 'RUNNING\u2026' : 'TAP THE TILTED PINS', lab('MACHINE ' + Math.min(3, J.mi + 1) + ' / 3 \u00b7 ' + L) + lst([[RED, 'TILTED PINS', n + ' LEFT', !n], [YEL, 'RESET', J.ph === 'spin' || J.ph === 'done' ? '\u2713' : '', J.ph === 'spin' || J.ph === 'done']]), 'u' + J.mi + J.ph + n]; },
    hint() { const M = MACH[J.ms[J.mi]]; if (J.ph === 'reset') return [M.btn.position.clone(), 'TAP']; const q = J.pins && J.pins.find(p => !p.ok); return q ? [q.g.position.clone(), 'TAP'] : null; },
    shot() { const M = MACH[J.ms[Math.min(J.mi, J.ms.length - 1)]]; return [V(FACE, 1.1, M.z), 1.8, 1.9, 0.15, 2.2, Math.PI / 2, 3.1]; },
    end() { MACH.forEach(M => { M.lamp.material.color.set('#3fd36a'); M.btn.scale.setScalar(1); }); } };
  // ================= JOB 6: FIX THE BALL RETURN (Sprocket) — lane 1 + 2's return: 4 bolts (2 taps each), the stuck ball out, HOLD TEST =================
  const RX = 123.12, RZ = PAIRS[0], RY = 0.4;
  const PANEL = new THREE.Group(); box(PANEL, 0.04, 0.46, 0.4, '#4a4458', 0, 0, 0); PANEL.position.set(RX - 0.03, RY, RZ); PANEL.visible = false; G.add(PANEL);
  const BOLTS = [[-0.15, -0.16], [-0.15, 0.16], [0.15, -0.16], [0.15, 0.16]].map(([y, z]) => { const m = cyl(G, 0.035, 0.035, 0.05, YEL, RX - 0.07, RY + y, RZ + z, 6); m.rotation.z = Math.PI / 2; m.visible = false; return m; });
  const STUCK = sph(G, 0.15, '#7c3aed', RX + 0.08, RY, RZ); STUCK.visible = false;
  const TESTB = cyl(G, 0.06, 0.06, 0.05, '#3fd36a', RX - 0.06, RY + 0.36, RZ + 0.28, 12); TESTB.rotation.z = Math.PI / 2; TESTB.visible = false;
  const G6 = {
    begin() { J.ph = 'bolts'; J.bt = [0, 0, 0, 0]; PANEL.visible = true; PANEL.position.set(RX - 0.03, RY, RZ); BOLTS.forEach(b => { b.visible = true; b.position.x = RX - 0.07; }); STUCK.visible = true; STUCK.position.set(RX + 0.08, RY, RZ); TESTB.visible = false; J.lvl = 0; toast('BALLS ARE NOT COMING BACK \u00b7 TAP EACH BOLT TWICE', 2.6); },
    press() { if (J.flies.length) return;
      if (J.ph === 'bolts') { const b = nearest(BOLTS, m => m.position, TAPR() * 1.1); if (b < 0) { if (dist(scrW(STUCK.position)) < TAPR()) miss('PANEL FIRST \u00b7 THE BOLTS', 1.3); return; } if (J.bt[b] >= 2) return; J.bt[b]++; BOLTS[b].rotation.x += 1.6; BOLTS[b].position.x -= 0.03; clack();
        if (J.bt[b] >= 2) { const m = BOLTS[b]; fly(m, V(RX - 0.6, 0.12, m.position.z + rnd(-0.2, 0.2)), 0.35, 0.1, null); }
        if (J.bt.every(n => n >= 2)) { J.ph = 'ball'; addGold(2); NEXT(() => { fly(PANEL, V(RX - 0.7, 0.3, RZ - 0.5), 0.4, 0.2, () => { if (J) PANEL.rotation.z = 1.4; }); thunk(); toast('THERE IT IS \u00b7 TAP THE STUCK BALL', 1.6); }, 0.3); } return; }
      if (J.ph === 'ball') { if (dist(scrW(STUCK.position)) < TAPR() * 1.4) { addGold(2); thunk(); fly(STUCK, V(RX - 0.9, 0.17, RZ + 0.4), 0.45, 0.3, () => { if (!J) return; J.ph = 'test'; TESTB.visible = true; PANEL.rotation.z = 0; PANEL.position.set(RX - 0.03, RY, RZ); BOLTS.forEach(b => { b.visible = false; }); toast('PANEL BACK ON \u00b7 HOLD THE GREEN TEST BUTTON', 1.8); }); } else miss('THE PURPLE BALL, WEDGED INSIDE', 1.3); return; }
      if (J.ph === 'test') { if (dist(scrW(TESTB.position)) < TAPR() * 1.6) { J.hold = true; noise(0.4, 0.03, 300); } else miss('HOLD THE GREEN BUTTON', 1.2); } },
    release() { if (J && J.ph === 'test' && J.hold) { J.hold = false; if (J.lvl < 1) { J.lvl = 0; toast('HOLD IT UNTIL THE BALL COMES UP', 1.4); } } },
    tick(dt) { if (J.ph === 'test') { TESTB.scale.setScalar(1 + (J.hold ? 0 : Math.abs(Math.sin(J.t * 6)) * 0.4)); if (J.hold) { J.lvl += dt; if (J.lvl >= 1) { J.hold = false; J.ph = 'done'; thunk(); ding(); addGold(3); toast('THUNK \u00b7 BALLS ARE BACK', 1.4); NEXT(finishGame, 0.9); } } } },
    card() { const nb = J.bt ? J.bt.filter(n => n < 2).length : 4; return [J.ph === 'bolts' ? 'TAP EACH BOLT TWICE' : J.ph === 'ball' ? 'TAP THE STUCK BALL' : J.ph === 'test' ? 'HOLD THE GREEN BUTTON' : 'FIXED',
      lab('RETURN \u00b7 LANES 1 + 2') + lst([[YEL, 'BOLTS', nb + ' LEFT', !nb], ['#7c3aed', 'STUCK BALL', J.ph === 'test' || J.ph === 'done' ? 'OUT' : '', J.ph === 'test' || J.ph === 'done']]) + (J.ph === 'test' ? gauge(J.lvl, 0.98, 1) : ''), 'b' + J.ph + nb + '_' + Math.round((J.lvl || 0) * 20)]; },
    hint() { if (J.ph === 'bolts') { const i = J.bt.findIndex(n => n < 2); return i >= 0 ? [BOLTS[i].position.clone(), 'TAP'] : null; } if (J.ph === 'ball') return [STUCK.position.clone(), 'TAP']; if (J.ph === 'test' && !J.hold) return [TESTB.position.clone(), 'HOLD']; return null; },
    shot() { return [V(RX, RY + 0.12, RZ), 1.2, 1.0, 0.3, 1.3, -Math.PI / 2 - 0.55, 2.0]; },
    end() { PANEL.visible = false; BOLTS.forEach(b => { b.visible = false; }); STUCK.visible = false; TESTB.visible = false; PANEL.rotation.z = 0; } };
  const GD = { shoes: G1, rack: G2, polish: G3, oil: G4, unjam: G5, ret: G6 };
  const JX = new Proxy({}, { get: (_, k) => J && J[k], set: (_, k, v) => { if (J) J[k] = v; return true; } });
  const XB = lnJobsB({ THREE, G, V, box, cyl, sph, LM, CT, kit, own, fly, miss, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, clack, thunk, lst, lab, row, tagSprite, TAPR, scrW, dist, nearest, rnd, shuffle, LZ, CUST, NAMES, touch, mott, J: JX, ringCol: ring });
  Object.assign(GD, XB.GD); for (const k in XB.RINGS) { RINGS[k] = XB.RINGS[k]; ringMesh(k); } MP.tips.push(...XB.tips);
  const CS = lnCast({ lanes, save, sayTo, toast: (t, s) => toast(t, s), ding, tone, hour, tenpin, tenpinOn, CHOICE_BYE });
  const PZ = lnPrizes({ THREE, G, box, cyl, LM, CT, save, heal, wear, toast: (t, s) => toast(t, s), ding, tone, done, GAMES, sayTo, kT, ln, lanes, CHOICE_BYE, inRoom: P => inRoom(P) });
  const LF = lnLife({ THREE, G, box, cyl, LM, CT, kit, cols, save, lanes, touch, hour, tone, noise, toast: (t, s) => toast(t, s), inRoom: P => inRoom(P), jobBusy: () => !!(busy === 'job' && J && !GN[J.g].walk) });
  const arrowM = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: RED })); arrowM.rotation.x = Math.PI; arrowM.visible = false; arrowM.renderOrder = 5; G.add(arrowM);
  const beacon = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 24), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.8, depthWrite: false })); beacon.rotation.x = -Math.PI / 2; beacon.visible = false; G.add(beacon);
  // ================= run a game =================
  const KEEP = g => (GN[g] && GN[g].grp === 'mech' ? SP.name : MP.name).toUpperCase();
  function startGame(g, P) { if (busy || !GD[g]) return; J = { g, miss: 0, gold: 0, objs: [], flies: [], t: 0, pause: 0, P }; busy = 'job'; const R = RINGS[g]; if (P && R && !GN[g].walk) Object.assign(P, { x: R[0], z: R[1], sp: 0 }); GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(8); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat(pre + 'Done', d); save.setStat(pre + 'Clears', save.stat(pre + 'Clears', 0) + 1); K.finish(g, stars, gold, first); stop();
    const gf = PZ.gift(); thanks = { g, gold, by: GN[g].grp, gf }; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 +' + gold + ' GOLD' + (gf ? ' \u00b7 PRIZE: ' + PZ.line(gf)[1] + ' \u00b7 SEE MOTT' : ''), gf ? 3.6 : 2.6); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) J.objs.forEach(o => o.parent && o.parent.remove(o)); busy = null; J = null; ptr.down = false; hideCard(); arrowM.visible = false; beacon.visible = false; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g], c = g.card && g.card(); if (!c) { hideCard(); return; } setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? J.gold + ' G' : KEEP(J.g)) + foot(c[0]) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; if (J.flies.length) flyTick(dt); if (!J) return; const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0) J.pause = 0; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return;
    const go = g.goal ? g.goal() : null; if (go) { arrowM.visible = beacon.visible = true; arrowM.position.set(go[0], go[2] + 1.9 + Math.sin(J.t * 4) * 0.15, go[1]); arrowM.rotation.y += dt * 2; beacon.position.set(go[0], 0.1, go[1]); } else arrowM.visible = beacon.visible = false;
    drawCard(); }
  // ---------- camera: job shots (clamped inside the hall / the back room) + the back-room walk view ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  const inBack = P => P.x > BR.x0 && P.x < BR.x1 + 0.4 && P.z > BR.z0 - 0.4 && P.z < BR.z1;
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !GN[J.g].walk && GD[J.g].shot ? GD[J.g].shot() : null, P = lastP;
    if (!v && P && !busy && inBack(P)) {   // back room: camera inside the room, behind + above, looking north along it
      lensOff(cam); camT.pos.set(clamp(P.x + 0.4, BR.x0 + 0.6, BR.x1 - 0.4), 3.1, clamp(P.z + 4.2, BR.z0 + 1, BR.z1 + 1.6)); camT.look.set(P.x, 1.0, P.z - 1.6);
      if (!camCur.on) { camCur.on = true; camCur.pos.copy(cam.position); camCur.look.copy(camT.look); } const k = Math.min(1, dt * 4); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); return; }
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    const back = J && J.g === 'unjam'; camCur.pos.x = clamp(camCur.pos.x, back ? BR.x0 + 0.3 : R0.X0 + 0.5, back ? BR.x1 - 0.3 : R0.X1 - 0.5); camCur.pos.z = clamp(camCur.pos.z, back ? BR.z0 + 0.3 : R0.Z0 + 0.5, back ? BR.z1 - 0.3 : R0.Z1 - 0.5); camCur.pos.y = clamp(camCur.pos.y, 0.6, 8.2); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.830-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- places, talk + prompt ----------
  const inRoom = P => P.x > R0.X0 && P.x < R0.X1 && P.z > R0.Z0 && P.z < R0.Z1 && Math.abs(P.y || 0) < 4;
  const ringAt = P => { for (const k in RINGS) { const [x, z] = RINGS[k]; if (Math.hypot(P.x - x, P.z - z) < 1.05) return GN[k]; } return null; };
  const nearMott = P => Math.hypot(P.x - mott.position.x, P.z - mott.position.z) < 2.9, nearMech = P => Math.hypot(P.x - mech.position.x, P.z - mech.position.z) < 2.6;
  function prompt(P) { if (J && GN[J.g].walk) { const gp = GD[J.g].prompt ? GD[J.g].prompt(P) : null; return gp || (nearMott(P) ? MP.name.toUpperCase() + ' \u00b7 STOP THE JOB' : null); } if (busy || !inRoom(P)) return null; const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; { const cp = CS.prompt(P); if (cp) return cp; } { const lp = LF.prompt(P); if (lp) return lp; } if (PZ.atDiner(P)) return 'DINER \u00b7 ORDER'; if (nearMech(P)) return 'TALK \u00b7 ' + SP.name.toUpperCase(); if (nearMott(P)) return 'TALK \u00b7 ' + MP.name.toUpperCase(); return null; }
  const nextJob = grp => { const d = done(), L = GAMES.filter(q => GD[q.k] && (!grp || q.grp === grp)); return (L.find(q => !d[q.k]) || L.slice().sort((a, c) => K.stars(a.k) - K.stars(c.k))[0]).k; };
  const sub = (T, lnF, grp, line) => sayTo(T, [{ ...lnF(line), choices: [...GAMES.filter(q => q.grp === grp).map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => { if (!busy) startGame(q.k, lastP); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const howAmI = () => { const best = save.stat('meru.bowling.best', 0) || 0, HOUSE = 212, ROOK = 147, L = [];
    if (!best) { L.push({ who: 'player', text: 'Do you keep score in here?' }, ln('Chalk board behind me, and I keep it honest. You have not bowled a game yet.'), ln('Take lane two \u2014 it runs true, whatever Gale says about it. I will chalk you up.')); }
    else { L.push({ who: 'player', text: 'How am I doing?' }, ln('Best game I have you down for is ' + best + '.'));
      L.push(ln(best >= HOUSE ? 'Which takes the house off NERA, and she has not said a word since. I have known that fox four years and I have never once seen her quiet.'
        : best >= ROOK ? 'That is past ROOK, and past ROOK is further than most of them ever get. NERA still has you \u2014 two hundred and twelve \u2014 and she will find a way to mention it.'
        : best >= 100 ? 'Respectable. ROOK bowls a hundred and forty-seven without appearing to try, if you want a number to walk towards.' : 'Early days. Start left of centre and let it drift in \u2014 that is Gale\u0027s advice, and Gale has never once taken it.')); }
    sayTo(kT, L); };
  const menuM = first => { let open = first ? MP.hello[0] : MP.hello[1 + (talked % 3)]; if (thanks && thanks.gf) { const gf = thanks.gf; thanks = null; if (PZ.thankLine(gf)) return; open = PZ.line(gf)[0]; } else if (thanks && thanks.by === 'mott') { open = MP.open[save.stat(pre + 'Clears', 1) % 4] + ' ' + thanks.gold + ' gold. More?'; thanks = null; }
    sayTo(kT, [{ ...ln(open), choices: [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob('mott'), lastP); } }, { text: 'FRONT DESK JOBS', pick: () => sub(kT, ln, 'mott', 'Desk jobs. Which one?') },
      { text: 'ARE THE LANES OPEN?', pick: () => sayTo(kT, LANES_OPEN.map(l => (l.who === 'npc' ? ln(l.text) : l))) }, { text: 'HOW AM I DOING?', pick: howAmI }, { text: 'PRIZES + YOUR BALL', pick: () => PZ.prizes() },
      { text: 'A TIP, PLEASE', pick: () => sayTo(kT, [ln(MP.tips[talked % MP.tips.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); };
  const menuS = () => { let open = SP.hello[talkedS++ ? 1 : 0]; if (thanks && thanks.by === 'mech') { open = 'Machines are purring. ' + thanks.gold + ' gold.' + (thanks.gf ? ' Mott has a prize for you.' : ' More?'); if (!thanks.gf) thanks = null; }
    sayTo(sT, [{ ...lnS(open), choices: [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob('mech'), lastP); } }, { text: 'BACK ROOM JOBS', pick: () => sub(sT, lnS, 'mech', 'Grease jobs. Pick one.') },
      { text: 'WHAT IS BACK HERE?', pick: () => sayTo(sT, [lnS('Six pinsetters, one per lane. Every frame they sweep, lift and set ten pins.'), lnS('When one jams, the lane goes dark. Then I come running.')]) },
      { text: 'A TIP, PLEASE', pick: () => sayTo(sT, [lnS(SP.tips[talkedS % SP.tips.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); };
  function talk(P) { lastP = P; if (J && GN[J.g].walk) { if (GD[J.g].talk && GD[J.g].talk(P)) return true; if (nearMott(P)) { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 1.8); return true; } return false; } if (busy) return true; if (!inRoom(P)) return false; const r = ringAt(P); if (r) { startGame(r.k, P); return true; }
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (CS.talk(P)) return true; if (LF.talk(P)) return true; if (PZ.atDiner(P)) { tone(1046, 0.04, 0.3); PZ.diner(); return true; } if (nearMech(P)) { tone(880, 0.05, 0.3, 'triangle'); menuS(); return true; } if (nearMott(P)) { tone(1320, 0.05, 0.6); menuM(!talked++); return true; } return false; }
  function quit() { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  let outT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; toastT -= dt; const near = Math.hypot(P.x - 127.5, P.z + 14); G.visible = near < (touch ? 60 : 110); if (oldMott) oldMott.visible = false;
    if (busy === 'job' && J) { outT = inRoom(P) ? 0 : outT + dt; if (outT > (GN[J.g].walk ? 2 : 0.3)) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (busy === 'job' && J && !GN[J.g].walk && fox) JW(fox, J.g); if (!G.visible) return;
    if (busy === 'job' && J) jobTick(dt, P); hintTick(t);
    kit.animFox(mech, dt, 0, false); CUST.forEach(f => f.visible && kit.animFox(f, dt, 0, false));
    if (inRoom(P) && !busy && Math.hypot(P.x - mech.position.x, P.z - mech.position.z) < 4.5) { const a = Math.atan2(P.x - mech.position.x, P.z - mech.position.z); let d = a - mech.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); mech.rotation.y += d * Math.min(1, dt * 3); }
    else if (!busy) { let d = MECH.ry - mech.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); mech.rotation.y += d * Math.min(1, dt * 2); }
    if (inRoom(P) && !busy) for (const M of MACH) { const ph = (t * 0.5 + M.i * 0.37) % 6; if (ph < 0.6) M.wh.rotation.x += dt * 5; }   // the machines cycle now and then
    K.tick(dt, P, { inShop: inRoom(P), busy: !!busy, near, talking: false }); CS.tick(); PZ.tick(dt, P, fox); LF.tick(dt, P); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => (busy && J && GN[J.g].walk ? null : busy), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), mott, mech, GD, RINGS, MACH, PZ, LF,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) jobTick(dt, lastP); }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), dispose() { card.remove(); HINT.remove(); XB.dispose(); K.dispose && K.dispose(); } };
  window.__lanesJobs = API; return API;
}
