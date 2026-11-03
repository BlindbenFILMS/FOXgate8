// MERU 2.0 — s121 FORTUNE TELLER [meruFortune] DELUXE PART A (Ben's answers s121). The tent is TWICE the size now: the FRONT PARLOUR
// (old f -86..-74 × -60..-48, door S at (-80, -48), Ora's table) + a new BACK READING ROOM (z -72..-60) through an ARCH in the partition
// (x -77.7..-75.9, z -60). TWO keepers: ORA (her 2D look + her 8 story sets from worlds/meru-ora.json, verbatim, by Max quest stage, as her
// first line) + LUMI, her young apprentice, in the reading room. Part A jobs: POLISH THE CRYSTAL BALL (Ora, drag the cloth over the smudges)
// · LIGHT THE CANDLES IN ORDER (Lumi, watch the order, tap it back). Built in the ORIGINAL frame; meru2-walk.js adds API.group to RL.MV 'fortune'.
// Stats prefix mft (mftDone, mftClears, mftStar_/mftBest_<job>, mftStory = the last story set heard).
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { oraIndex } from './meru-fortune.js';
import { ftJobsB } from './meru2-fortune-jobs2.js';   // part B: hang the dreamcatchers, find Ora's ring
import { ftPrizes } from './meru2-fortune-prize.js';   // part C: star hat / hood, your name on the star chart
import { ftLife } from './meru2-fortune-life.js';   // part D: look + life
const OR = { name: 'Ora', role: 'FORTUNE TELLER', color: '#7c3aed', torso: ['#c4b5fd', '#7c3aed', '#3b0764'],
  hello: ['Sit, child. The ball is listening.', 'Back again. I felt you on the step.', 'The candles leaned toward the door. So, you.'],
  tips: ['Rub the ball in small circles. It hates hurry.', 'A seer sees nothing with a dirty ball.', 'Most futures are just pasts, walking forward.'] };
const LU = { name: 'Lumi', role: 'APPRENTICE SEER', torso: ['#26306b', '#c0995c', '#141a40'],
  hello: ['Hi! I am Lumi. I do the jobs Ora is too wise for.', 'Back room jobs today. Want one?', 'Ora says I am nearly a seer. Nearly.'],
  tips: ['Watch the candles once. Then trust your paw.', 'Never blow a candle out. Pinch it. Ora told me.', 'The star chart is upside down. On purpose. Probably.'] };
export function buildFortuneJobs({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted }) {
  const mutedQ = () => { try { return !!(isMuted && isMuted()); } catch (e) { return true; } };
  const R0 = { X0: -86, X1: -74, Z0: -60, Z1: -48 }, BR = { X0: -86, X1: -74, Z0: -72, Z1: -60 }, DOOR = [-80, -48], ARCH = { x0: -77.7, x1: -75.9, z: -60 };
  const G = new THREE.Group(); G.name = 'fortuneJobs'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const toW = v => { G.updateWorldMatrix(true, false); return G.localToWorld(v.clone()); };
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const colF = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] });
  const plane = (tex, w, h, x, y, z, ry = 0, par = G) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const label = (txt, bg, fg, w = 512, h = 96, fs = 54) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = '900 ' + fs + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 18, H / 2 + 2); });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#c0995c', PLUM = '#3a2440', PLUM2 = '#2a1a2e', VIO = '#5b3f7a', NAVY = '#141a40';
  // ================= the partition + arch, the BACK READING ROOM =================
  for (const [x0, x1] of [[-86, ARCH.x0], [ARCH.x1, -74]]) { box(G, x1 - x0, 6.9, 0.2, PLUM, (x0 + x1) / 2, 3.45, ARCH.z); colF(x0, x1, ARCH.z - 0.15, ARCH.z + 0.15); }
  { const w = ARCH.x1 - ARCH.x0, cx = (ARCH.x0 + ARCH.x1) / 2; box(G, w, 4.4, 0.2, PLUM, cx, 4.7, ARCH.z);
    const arc = new THREE.Mesh(new THREE.TorusGeometry(w / 2, 0.06, 6, 20, Math.PI), LM(GOLD)); arc.position.set(cx, 2.5, ARCH.z + 0.12); G.add(arc); const arc2 = arc.clone(); arc2.position.z = ARCH.z - 0.12; G.add(arc2);
    for (const s of [-1, 1]) for (const dz of [0.12, -0.12]) box(G, 0.08, 2.5, 0.04, GOLD, cx + s * w / 2, 1.25, ARCH.z + dz);
    plane(label('READING ROOM', PLUM2, YEL, 512, 80, 40), 1.5, 0.24, cx, 2.95, ARCH.z + 0.11, 0); }
  const plankT = CT(256, 256, (g, w) => { g.fillStyle = '#3d2a1c'; g.fillRect(0, 0, w, w); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#4a3322' : '#433021'; g.fillRect(0, i * 32, w, 30); g.fillStyle = '#24170e'; g.fillRect(0, i * 32 + 30, w, 2); g.fillRect((i * 97) % w, i * 32, 2, 30); } }); plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping; plankT.repeat.set(3, 3);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(11.8, 11.8), new THREE.MeshLambertMaterial({ map: plankT, polygonOffset: true, polygonOffsetFactor: -1 })); f.rotation.x = -Math.PI / 2; f.position.set(-80, 0.05, -66); G.add(f); }
  const rugT = CT(512, 512, (g, w) => { const c = w / 2, Rr = (r, col) => { g.fillStyle = col; g.beginPath(); g.arc(c, c, r, 0, 7); g.fill(); }; Rr(254, GOLD); Rr(244, NAVY); g.fillStyle = YEL; for (let i = 0; i < 90; i++) { const a = Math.random() * 6.28, r = Math.random() * 220; g.fillRect(c + Math.cos(a) * r, c + Math.sin(a) * r, 3, 3); }
    g.strokeStyle = GOLD; g.lineWidth = 6; g.beginPath(); g.arc(c, c, 120, 0, 7); g.stroke(); g.save(); g.translate(c, c); g.fillStyle = GOLD; for (let i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(0, -112); g.lineTo(14, -40); g.lineTo(-14, -40); g.closePath(); g.fill(); } g.restore(); g.globalCompositeOperation = 'destination-in'; Rr(254, '#000'); });
  { const r = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshLambertMaterial({ map: rugT, transparent: true, alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -4 })); r.rotation.x = -Math.PI / 2; r.position.set(-80, 0.06, -66.6); G.add(r); }
  // star ceiling (turns at night in part D)
  const ceilT = CT(512, 512, (g, w) => { g.fillStyle = '#0e1230'; g.fillRect(0, 0, w, w); for (let i = 0; i < 260; i++) { g.fillStyle = Math.random() < 0.15 ? YEL : '#e8e2ff'; const s = Math.random() < 0.1 ? 3 : 1.5; g.fillRect(Math.random() * w, Math.random() * w, s, s); } g.strokeStyle = 'rgba(232,226,255,0.35)'; g.lineWidth = 1.5; for (let k = 0; k < 6; k++) { g.beginPath(); let x = Math.random() * w, y = Math.random() * w; g.moveTo(x, y); for (let j = 0; j < 4; j++) { x += rnd(-60, 60); y += rnd(-60, 60); g.lineTo(x, y); } g.stroke(); } });
  const CEIL = new THREE.Mesh(new THREE.CircleGeometry(5.8, 40), new THREE.MeshBasicMaterial({ map: ceilT })); CEIL.rotation.x = Math.PI / 2; CEIL.position.set(-80, 5.9, -66); G.add(CEIL);
  // THE STAR CHART on the back wall (your name goes on it: part C)
  const chartT = CT(1024, 512, (g, W, H) => { g.fillStyle = NAVY; g.fillRect(0, 0, W, H); g.strokeStyle = GOLD; g.lineWidth = 10; g.strokeRect(10, 10, W - 20, H - 20); g.lineWidth = 2; g.strokeRect(26, 26, W - 52, H - 52);
    g.strokeStyle = 'rgba(192,153,92,0.5)'; for (let r = 60; r < 260; r += 50) { g.beginPath(); g.arc(W / 2, H / 2 + 40, r, Math.PI, 0); g.stroke(); }
    const C = [[[180, 160], [240, 120], [300, 150], [330, 220]], [[620, 140], [690, 180], [760, 130], [820, 200], [780, 260]], [[420, 300], [480, 260], [560, 290], [600, 360]]];
    for (const P of C) { g.strokeStyle = 'rgba(232,226,255,0.7)'; g.lineWidth = 2; g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); P.forEach(([x, y]) => { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }); }
    g.fillStyle = YEL; g.font = '900 44px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('THE STARS OVER MERU', 50, 64); g.fillStyle = '#e8e2ff'; g.font = '800 22px Archivo, sans-serif'; g.fillText('CHARTED BY ORA \u00b7 COPIED BY LUMI', 50, 104); });
  plane(chartT, 5.0, 2.5, -80, 2.9, -71.78, 0); box(G, 5.2, 2.7, 0.06, GOLD, -80, 2.9, -71.84);
  // reading table + 2 chairs (visitors in part D)
  const RT = { x: -80, z: -66.6 }; cyl(G, 0.75, 0.62, 0.78, VIO, RT.x, 0.39, RT.z, 20); cyl(G, 0.76, 0.76, 0.04, '#4a2f66', RT.x, 0.8, RT.z, 20); cyl(G, 0.1, 0.12, 0.06, GOLD, RT.x, 0.85, RT.z, 10);
  const orb2 = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 12), new THREE.MeshPhongMaterial({ color: 0xc4b5fd, emissive: 0x4c2a8a, transparent: true, opacity: 0.85, shininess: 120 })); orb2.position.set(RT.x, 1.0, RT.z); G.add(orb2); cols.push({ c: [RT.x, RT.z, 0.85] });
  for (const s of [-1, 1]) { const z = RT.z + s * 1.2; box(G, 0.6, 0.08, 0.55, PLUM, RT.x, 0.48, z); box(G, 0.6, 1.0, 0.08, PLUM, RT.x, 0.98, z + s * 0.26); for (const lx of [-0.26, 0.26]) for (const lz of [-0.22, 0.22]) box(G, 0.05, 0.46, 0.05, PLUM2, RT.x + lx, 0.23, z + lz); }
  // bookcase (east wall, south of Lumi) + a crate of dreamcatcher hoops (part B)
  { const x = -74.4, z = -69.6; box(G, 0.6, 2.4, 1.8, PLUM, x, 1.2, z); for (const y of [0.5, 1.1, 1.7]) { box(G, 0.56, 0.04, 1.7, '#4a2f66', x - 0.04, y, z); for (let k = 0; k < 7; k++) box(G, 0.22, 0.26 - (k % 3) * 0.03, 0.08, ['#7a2a3a', '#26306b', '#3d6b4a', GOLD][k % 4], x - 0.1, y + 0.15, z - 0.7 + k * 0.22); } colF(x - 0.32, -74, z - 0.92, z + 0.92); }
  // two hanging star lanterns
  const LANT = [[-83, 3.5, -64.5], [-77, 3.7, -68.5]].map(([x, y, z]) => { box(G, 0.012, 5.9 - y, 0.012, INK, x, (5.9 + y) / 2, z); const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.24), LM(GOLD)); m.position.set(x, y, z); G.add(m); return m; });
  // ================= JOB 2 PROP: THE CANDLE ALTAR (west wall of the reading room) =================
  const ALT = { x: -85.35, z: -66 }; box(G, 0.6, 0.9, 3.6, PLUM, ALT.x, 0.45, ALT.z); box(G, 0.66, 0.05, 3.7, '#4a2f66', ALT.x, 0.925, ALT.z); box(G, 0.02, 0.7, 3.5, GOLD, ALT.x + 0.31, 0.45, ALT.z); colF(-86, -85.0, ALT.z - 1.85, ALT.z + 1.85);
  plane(label('THE SEVEN CANDLES', PLUM2, YEL, 512, 80, 40), 1.8, 0.28, -85.94, 2.0, ALT.z, Math.PI / 2);
  const flameM = () => new THREE.MeshBasicMaterial({ color: '#ffc060', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const NOTES = [392, 440, 494, 587, 659, 784, 880];
  const CAND = [...Array(7)].map((_, i) => { const z = ALT.z - 1.5 + i * 0.5, h = 0.24 + (i % 3) * 0.08; cyl(G, 0.07, 0.06, 0.03, GOLD, ALT.x, 0.965, z, 10); cyl(G, 0.045, 0.045, h, '#f5dfae', ALT.x, 0.98 + h / 2, z, 8);
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.11, 8), flameM()); fl.position.set(ALT.x, 1.0 + h + 0.05, z); G.add(fl);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#ffb347', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.set(0.35, 0.35, 1); halo.position.copy(fl.position); G.add(halo);
    return { i, z, tip: V(ALT.x, 1.0 + h + 0.02, z), fl, halo, lit: 0 }; });
  const candSet = (c, k) => { c.lit = k; c.fl.material.opacity = k; c.halo.material.opacity = k * 0.7; };
  // ================= the keepers =================
  let oldOra = null; scene.traverse(o => { if (!oldOra && o.userData && o.userData.foxKey === 'ora') oldOra = o; });
  const ora = kit.makeFox({ key: 'mftOra', torso: OR.torso, outfit: 'robe', female: true, mood: 'warm', look: { fur: '#e2e8f0', furDark: '#94a3b8', muzzle: '#f8fafc' } });
  const ORA = { x: -80, z: -58.2, ry: 0 }; ora.position.set(ORA.x, 0, ORA.z); G.add(ora);
  { const P0 = ora.userData && ora.userData.P; if (P0 && P0.head) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 18), LM(GOLD)); b.rotation.x = Math.PI / 2; b.position.y = 0.2; P0.head.add(b); const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.04), LM('#9fd6ff')); gem.position.set(0, 0.2, 0.2); P0.head.add(gem); } }
  const lumi = kit.makeFox({ key: 'mftLumi', torso: LU.torso, outfit: 'robe', mood: 'happy', look: { fur: '#c9743a', furDark: '#9a5426' } }); lumi.scale.setScalar(0.84);
  const LUM = { x: -75.3, z: -64.4, ry: -Math.PI / 2 }; lumi.position.set(LUM.x, 0, LUM.z); lumi.rotation.y = LUM.ry; G.add(lumi); cols.push({ c: [LUM.x, LUM.z, 0.35] });
  { const P0 = lumi.userData && lumi.userData.P; if (P0 && P0.head) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 10), LM(LU.torso[0])); h.position.y = 0.42; h.rotation.x = -0.15; P0.head.add(h); for (let k = 0; k < 4; k++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.025), LM(YEL)); const a = k * 1.6; s.position.set(Math.sin(a) * 0.14, 0.3 + k * 0.06, Math.cos(a) * 0.14); P0.head.add(s); } } }
  const kT = { key: 'mftOra', name: OR.name, role: OR.role, obj: ora, ry: ORA.ry, r: 6 }, lT = { key: 'mftLumi', name: LU.name, role: LU.role, obj: lumi, ry: LUM.ry, r: 6 };
  const ln = text => ({ who: 'mftOra', role: OR.role, text }), lnL = text => ({ who: 'mftLumi', role: LU.role, text });
  let STORY = null; fetch(new URL('./meru-ora.json', import.meta.url)).then(r => r.json()).then(j => { STORY = j; }).catch(() => {});
  // ================= rings + shop kit =================
  const RINGS = { ball: [-81.55, -55.15], cand: [-84.05, -66], hang: [-82.2, -62.75] };
  const ringMesh = k => { const [x, z] = RINGS[k]; const r1 = cyl(G, 0.5, 0.5, 0.012, YEL, x, 0.09, z, 22), r2 = cyl(G, 0.42, 0.42, 0.014, INK, x, 0.092, z, 22); r1.renderOrder = r2.renderOrder = 2; }; for (const k in RINGS) ringMesh(k);
  const GAMES = [{ k: 'ball', name: 'Polish the Crystal Ball', color: '#38bdf8', grp: 'ora' }, { k: 'cand', name: 'Light the Candles', color: '#f59e0b', grp: 'lumi' },
    { k: 'hang', name: 'Hang the Dreamcatchers', color: '#c084fc', grp: 'lumi' }, { k: 'ring', name: "Find Ora's Ring", color: '#e6b45a', grp: 'ora', walk: true }, { k: 'shift', name: 'The Full Shift', color: '#7c3aed', grp: 'shift' }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), pre = 'mft';
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted: mutedQ, prefix: pre, color: OR.color, boardTitle: "Ora's best", toWorld: toW, room: { X0: -86, X1: -74, Z0: -72, Z1: -48 }, door: [DOOR[0], DOOR[1] - 0.5], keeper: ora, keeperRy: ORA.ry, games: GAMES,
    board: { x: -85.88, y: 2.6, z: -51.6, ry: Math.PI / 2, w: 1.2 }, hiring: { x: -82.9, y: 0, z: -50.4, ry: 0 }, hiringLine: 'WALK UP \u00b7 SEE YOUR FUTURE',
    sun: [{ x: -80, z: -50.0, w: 2.4, d: 1.8 }, { x: -80, z: -69.4, w: 2.6, d: 1.8 }], lamps: [[-83.2, 3.6, -57.4], [-76.8, 3.9, -57.4], [-83.2, 3.8, -51.2], [-76.8, 3.5, -51.2], [-83, 3.5, -64.5], [-77, 3.7, -68.5]],
    browse: [[-84.0, -56.6, -Math.PI / 2], [-74.95, -69.6, Math.PI / 2], [-80, -70.6, Math.PI]], slots: 1, clock: { x: -74.12, y: 3.0, z: -52.4, ry: -Math.PI / 2 } });
  // ================= state, sound, card UI (same card as every shop) =================
  let toastTxt = '', toastT = 0, talked = 0, talkedL = 0, busy = null, J = null, thanks = null, lastP = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at0 = 0) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at0, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = bf; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, nope = () => tone(196, 0.05, 0.25, 'square'), shimmer = () => [1318, 1568, 1976, 2637].forEach((f, i) => tone(f, 0.025, 0.5, 'sine', i * 0.06));
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + OR.color + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span></div>';
  const gauge = v => '<div style="position:relative;height:16px;border:2px solid #201e1d;background:#ffffff;margin-top:6px"><div style="position:absolute;top:0;bottom:0;left:0;width:' + Math.min(100, v * 100).toFixed(1) + '%;background:#3fd36a"></div></div>';
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
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), inv = new THREE.Matrix4();
  const ray = () => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); G.updateWorldMatrix(true, false); inv.copy(G.matrixWorld).invert(); return rc.ray.clone().applyMatrix4(inv); };
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (after, t = 1.0) => { J.pause = t; J.after = after; };
  const done = () => save.stat(pre + 'Done', null) || {};
  const softT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 2, 32, 32, 31); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.6, 'rgba(255,255,255,0.8)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  // ================= JOB 1: POLISH THE CRYSTAL BALL (Ora) — drag the cloth over the smudges =================
  const BALL = V(-80, 1.22, -56.5), BR0 = 0.3;
  const SWIRL = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshBasicMaterial({ color: '#7cd8ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); SWIRL.position.copy(BALL); G.add(SWIRL);
  const CLOTH = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshLambertMaterial({ color: '#c75b9b', side: THREE.DoubleSide })); CLOTH.visible = false; CLOTH.renderOrder = 7; G.add(CLOTH);
  const SPARK = [];
  const G1 = {
    begin() { Object.assign(J, { N: 3, n: 0, sm: [] }); toast('RUB THE SMUDGES OFF THE BALL', 2.4); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } J.sm.forEach(s => s.m.parent && s.m.parent.remove(s.m)); J.sm = []; J.t0 = J.t; J.over = false; const n = 5 + J.n; const toCam = V(0, 0.25, 1).normalize();
      for (let i = 0; i < n; i++) { let d; for (let k = 0; k < 30; k++) { d = V(rnd(-1, 1), rnd(-0.8, 0.9), rnd(-1, 1)).normalize(); if (d.dot(toCam) > 0.45 && J.sm.every(s => s.d.distanceTo(d) > 0.45)) break; }
        const m = own(new THREE.Mesh(new THREE.CircleGeometry(rnd(0.05, 0.075), 12), new THREE.MeshBasicMaterial({ map: softT, color: ['#4a3a2a', '#6b5a48', '#3a3a44'][i % 3], transparent: true, opacity: 0.85, depthWrite: false })));
        m.position.copy(BALL).addScaledVector(d, BR0 + 0.006); m.lookAt(m.position.clone().add(d)); m.renderOrder = 6; J.sm.push({ m, d, dirt: 1 }); } },
    press() { CLOTH.visible = true; },
    drag() { if (!ptr.down) return; const r = ray(), oc = r.origin.clone().sub(BALL), b = oc.dot(r.direction), c = oc.lengthSq() - (BR0 + 0.03) ** 2, h = b * b - c;
      if (h > 0) { const t = -b - Math.sqrt(h); const p = r.origin.clone().addScaledVector(r.direction, t), n = p.clone().sub(BALL).normalize(); CLOTH.position.copy(BALL).addScaledVector(n, BR0 + 0.04); CLOTH.lookAt(CLOTH.position.clone().add(n)); CLOTH.visible = true; } else CLOTH.visible = false;
      const R = TAPR() * 0.9; for (const s of J.sm) { if (s.dirt <= 0) continue; if (dist(scrW(s.m.position)) < R) { s.dirt -= 0.12; s.m.material.opacity = Math.max(0, s.dirt) * 0.85; if (Math.random() < 0.3) noise(0.06, 0.012, 5000); if (s.dirt <= 0) { s.m.visible = false; addGold(1); tone(NOTES[(J.sm.indexOf(s)) % 7] * 2, 0.03, 0.25, 'sine'); for (let k = 0; k < 4; k++) { const sp = own(new THREE.Sprite(new THREE.SpriteMaterial({ map: softT, color: '#ffffff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))); sp.scale.setScalar(0.06); sp.position.copy(s.m.position); SPARK.push({ sp, v: V(rnd(-0.4, 0.4), rnd(0.2, 0.7), rnd(-0.4, 0.4)), t: 0.6 }); } } } }
      if (J.sm.every(s => s.dirt <= 0) && !J.over) { J.over = true; shimmer(); addGold(J.t - J.t0 < 10 ? 4 : 3); toast(J.n + 1 < J.N ? 'CLEAR AS A STILL LAKE' : 'THE BALL SINGS', 1.4); J.n++; NEXT(() => G1.next(), 1.2); } },
    release() { CLOTH.visible = false; },
    tick(dt) { const left = J.sm.filter(s => s.dirt > 0).length, cl = J.sm.length ? 1 - left / J.sm.length : 0; SWIRL.material.opacity = 0.08 + cl * 0.35 + Math.sin(J.t * 3) * 0.04; SWIRL.rotation.y += dt * (0.5 + cl * 3);
      if (!J.over && J.t - J.t0 > 22) { J.over = true; miss('THE MIST CLOUDS OVER \u00b7 ORA WIPES IT HERSELF'); J.n++; NEXT(() => G1.next(), 1.2); } },
    hint() { const s = J.sm.find(q => q.dirt > 0); return s ? [s.m.position, 'RUB'] : null; },
    card() { const left = J.sm.filter(s => s.dirt > 0).length; return ['BALL ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, '<div style="font-size:13px;font-weight:800">SMUDGES LEFT \u00b7 ' + left + '</div>' + gauge(1 - Math.max(0, J.t - J.t0) / 22), J.n + '_' + left]; },
    shot() { return [BALL, 1.0, 0.85, 0.22, 1.05, 0, 1.9]; },
    end() { CLOTH.visible = false; SWIRL.material.opacity = 0; } };
  // ================= JOB 2: LIGHT THE CANDLES IN ORDER (Lumi) — watch, then tap it back =================
  const G2 = {
    begin() { Object.assign(J, { N: 3, n: 0, seq: [], k: 0, phase: 'show', st: 0 }); CAND.forEach(c => candSet(c, 0)); toast('WATCH THE ORDER, THEN TAP IT BACK', 2.4); this.round(); },
    round() { if (J.n >= J.N) { finishGame(); return; } CAND.forEach(c => candSet(c, 0)); const L = 3 + J.n; J.seq = []; while (J.seq.length < L) { const i = Math.random() * 7 | 0; if (J.seq[J.seq.length - 1] !== i) J.seq.push(i); } J.k = 0; J.phase = 'show'; J.st = -0.6; J.t0 = J.t; },
    press() { if (J.phase !== 'tap') return; const i = nearest(CAND, c => c.tip, TAPR() * 1.2); if (i < 0) return; const c = CAND[i];
      if (i === J.seq[J.k] && !c.lit) { candSet(c, 1); tone(NOTES[i], 0.05, 0.6, 'triangle'); noise(0.08, 0.01, 2000); J.k++; addGold(1);
        if (J.k >= J.seq.length) { J.phase = 'done'; shimmer(); addGold(J.t - J.t0 < 12 ? 3 : 2); toast(J.n + 1 < J.N ? 'THE ROOM GLOWS' : 'SEVEN LIGHTS, ONE PATH', 1.4); J.n++; NEXT(() => G2.round(), 1.4); } }
      else { miss(c.lit ? 'THAT ONE IS ALREADY LIT' : 'WRONG CANDLE \u00b7 WATCH AGAIN', 1.6); noise(0.3, 0.03, 900); CAND.forEach(q => candSet(q, 0)); J.k = 0; J.phase = 'show'; J.st = -0.8; } },
    tick(dt) { if (J.phase === 'show') { J.st += dt; const per = 0.75, idx = Math.floor(J.st / per), f = J.st / per - idx; CAND.forEach(c => { if (!c.lit) { c.fl.material.opacity = 0; c.halo.material.opacity = 0; } });
        if (J.st >= 0 && idx < J.seq.length) { const c = CAND[J.seq[idx]], k = f < 0.7 ? 1 : 0; c.fl.material.opacity = k; c.halo.material.opacity = k * 0.8; if (f < 0.05 && !J['b' + idx + '_' + J.n + '_' + J.miss]) { J['b' + idx + '_' + J.n + '_' + J.miss] = 1; tone(NOTES[J.seq[idx]], 0.05, 0.5, 'triangle'); } }
        if (idx >= J.seq.length) { J.phase = 'tap'; toast('YOUR TURN', 1.0); } }
      CAND.forEach(c => { if (c.lit) { c.fl.scale.set(1, 0.85 + Math.sin(J.t * 17 + c.i) * 0.15, 1); } }); },
    hint() { if (J.phase !== 'tap') return null; return [CAND[J.seq[J.k]].tip, 'TAP']; },
    card() { return ['ROUND ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, '<div style="font-size:13px;font-weight:800">' + (J.phase === 'show' ? 'WATCH \u00b7 ' + J.seq.length + ' CANDLES' : J.phase === 'tap' ? 'TAP \u00b7 ' + J.k + ' OF ' + J.seq.length : 'LIT!') + '</div>', J.n + J.phase + J.k]; },
    shot() { return [V(ALT.x, 1.15, ALT.z), 3.9, 1.2, 0.28, 2.0, Math.PI / 2, 4.2]; },
    end() { CAND.forEach(c => candSet(c, 0)); } };
  const GD = { ball: G1, cand: G2 };
  const JX = new Proxy({}, { get: (_, k) => J && J[k], set: (_, k, v) => { if (J) J[k] = v; return true; } });
  const XB = ftJobsB({ THREE, G, V, box, cyl, LM, CT, colF, JX, own, miss, addGold, NEXT, toast, finishGame, tone, noise, shimmer, TAPR, scrW, dist, ptr, ray, rnd, save, touch, NOTES, ORA, GOLD, INK, YEL });
  Object.assign(GD, XB.GD); LU.tips.push(XB.tips[0]); OR.tips.push(XB.tips[1]);
  const PZ = ftPrizes({ THREE, G, LM, CT, save, NAVY, GOLD, YEL, shimmer });
  const LF = ftLife({ THREE, G, kit, CT, LM, box, cyl, colF, hour, touch, mutedQ, CAND, candSet, SWIRL, CEIL, BALL, ora, tone, jobKey: () => J && J.g, softT, YEL, GOLD, INK });
  const arrowM = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: RED })); arrowM.rotation.x = Math.PI; arrowM.visible = false; arrowM.renderOrder = 5; G.add(arrowM);
  const beacon = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 24), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.8, depthWrite: false })); beacon.rotation.x = -Math.PI / 2; beacon.visible = false; G.add(beacon);
  // THE FULL SHIFT (Ora's YES, PUT ME TO WORK!): the 4 jobs in a row, one shift card, one badge at the end
  let SH = null; const SH_LIST = ['ball', 'cand', 'hang', 'ring'];
  function startShift(P) { if (busy) return; SH = { i: 0, gold: 0, miss: 0, wait: 0 }; toast('THE FULL SHIFT \u00b7 4 JOBS IN A ROW', 2.4); startGame(SH_LIST[0], P); }
  // ================= run a game =================
  const KEEP = g => (GN[g] && GN[g].grp === 'lumi' ? LU.name : OR.name).toUpperCase();
  function startGame(g, P) { if (busy || !GD[g]) return; J = { g, miss: 0, gold: 0, objs: [], flies: [], t: 0, pause: 0, P }; busy = 'job'; const R = RINGS[g]; if (P && R && !GN[g].walk) Object.assign(P, { x: R[0], z: R[1], sp: 0 }); GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(8); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat(pre + 'Done', d); save.setStat(pre + 'Clears', save.stat(pre + 'Clears', 0) + 1);
    if (SH) { SH.gold += gold; SH.miss += J.miss; if (stars > K.stars(g)) save.setStat(pre + 'Star_' + g, stars); stop(); SH.i++;
      if (SH.i < SH_LIST.length) { SH.wait = 1.6; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 NEXT: ' + GN[SH_LIST[SH.i]].name.toUpperCase(), 1.8); return; }
      const sg = SH.gold + 15 + (SH.miss ? 0 : 10); save.addGold(15 + (SH.miss ? 0 : 10)); const sst = SH.miss === 0 ? 3 : SH.miss <= 3 ? 2 : 1, sf = !K.stars('shift'); K.finish('shift', sst, sg, sf); save.setStat(pre + 'Shifts', save.stat(pre + 'Shifts', 0) + 1);
      const pz = PZ.gift(true); thanks = { g: 'shift', gold: sg, by: 'ora', pz }; SH = null; toast('THE FULL SHIFT DONE \u00b7 +' + sg + ' GOLD' + (pz.length ? ' \u00b7 PRIZE: ' + PZ.label(pz) : ''), pz.length ? 3.6 : 2.8); return; }
    K.finish(g, stars, gold, first); stop();
    const pz = PZ.gift(false); thanks = { g, gold, by: GN[g].grp, pz }; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 +' + gold + ' GOLD' + (pz.length ? ' \u00b7 PRIZE: ' + PZ.label(pz) : ''), pz.length ? 3.6 : 2.6); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) J.objs.forEach(o => o.parent && o.parent.remove(o)); SPARK.length = 0; busy = null; J = null; ptr.down = false; hideCard(); arrowM.visible = beacon.visible = false; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g], c = g.card && g.card(); if (!c) { hideCard(); return; } setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), SH ? 'SHIFT ' + (SH.i + 1) + '/' + SH_LIST.length : J.gold ? J.gold + ' G' : KEEP(J.g)) + foot(c[0]) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; const g = GD[J.g];
    for (let i = SPARK.length - 1; i >= 0; i--) { const s = SPARK[i]; s.t -= dt; s.sp.position.addScaledVector(s.v, dt); s.sp.material.opacity = Math.max(0, s.t / 0.6); if (s.t <= 0) { s.sp.parent && s.sp.parent.remove(s.sp); SPARK.splice(i, 1); } }
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0) J.pause = 0; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return;
    const go = g.goal ? g.goal() : null; if (go) { arrowM.visible = beacon.visible = true; arrowM.position.set(go[0], go[2] + 1.9 + Math.sin(J.t * 4) * 0.15, go[1]); arrowM.rotation.y += dt * 2; beacon.position.set(go[0], 0.1 + go[2], go[1]); } else arrowM.visible = beacon.visible = false;
    drawCard(); }
  // ---------- camera: job shots, clamped inside the room the shot is in ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !GN[J.g].walk && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    const RB = camT.look.z < ARCH.z ? { X0: BR.X0 + 0.4, X1: BR.X1 - 0.4, Z0: BR.Z0 + 0.4, Z1: BR.Z1 - 0.4 } : { X0: R0.X0 + 0.4, X1: R0.X1 - 0.4, Z0: R0.Z0 + 0.4, Z1: R0.Z1 - 0.4 }; camCur.pos.x = clamp(camCur.pos.x, RB.X0, RB.X1); camCur.pos.z = clamp(camCur.pos.z, RB.Z0, RB.Z1); camCur.pos.y = clamp(camCur.pos.y, 0.6, 4.6); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.830-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- places, talk + prompt ----------
  const inRoom = P => P.x > R0.X0 && P.x < R0.X1 && P.z > BR.Z0 && P.z < R0.Z1 && Math.abs(P.y || 0) < 4;
  const ringAt = P => { for (const k in RINGS) { const [x, z] = RINGS[k]; if (Math.hypot(P.x - x, P.z - z) < 1.05) return GN[k]; } return null; };
  const nearOra = P => Math.hypot(P.x - ORA.x, P.z - ORA.z) < 3.4 && P.z > ARCH.z, nearLumi = P => Math.hypot(P.x - LUM.x, P.z - LUM.z) < 2.6 && P.z < ARCH.z;
  function prompt(P) { if (J && GN[J.g].walk) { const gp = GD[J.g].prompt ? GD[J.g].prompt(P) : null; return gp || (nearOra(P) ? OR.name.toUpperCase() + ' \u00b7 STOP THE JOB' : null); } if (busy || !inRoom(P)) return null; const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; if (nearLumi(P)) return 'TALK \u00b7 ' + LU.name.toUpperCase(); if (nearOra(P)) return 'TALK \u00b7 ' + OR.name.toUpperCase(); return null; }
  const nextJob = grp => { const d = done(), L = GAMES.filter(q => GD[q.k] && q.grp !== 'shift' && (!grp || q.grp === grp)); return (L.find(q => !d[q.k]) || L.slice().sort((a, c) => K.stars(a.k) - K.stars(c.k))[0]).k; };
  const sub = (T, lnF, grp, line) => sayTo(T, [{ ...lnF(line), choices: [...GAMES.filter(q => q.grp === grp).map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => { if (!busy) startGame(q.k, lastP); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const storyIdx = () => { try { return oraIndex(k => !!save.flag(k)); } catch (e) { return 7; } };
  const storyLines = i => (STORY && STORY[i] ? STORY[i].map(l => l.who === 'player' ? { who: 'player', text: l.text } : ln(l.text)) : null);
  const oraMenu = open => ({ ...ln(open), choices: [{ text: CHOICE_WORK, pick: () => { if (!busy) startShift(lastP); } }, { text: 'TENT JOBS', pick: () => sub(kT, ln, 'ora', 'Small tasks for steady paws. Choose.') },
    { text: 'WHAT DO YOU SEE?', pick: () => { const L = storyLines(storyIdx()); if (L) sayTo(kT, L); else sayTo(kT, [ln('The ball is cloudy today. Ask me later.')]); } },
    { text: 'A TIP, PLEASE', pick: () => sayTo(kT, [ln(OR.tips[talked % OR.tips.length])]) }, { text: 'YOUR PRIZES', pick: () => PZ.menu(sayTo, kT, ln, CHOICE_BYE) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] });
  const menuO = () => { const si = storyIdx(), L = storyLines(si); talked++;
    if (L && save.stat(pre + 'Story', -1) !== si) { save.setStat(pre + 'Story', si); const last = L.pop(); sayTo(kT, [...L, { ...last, choices: oraMenu(last.text).choices }]); return; }
    let open = OR.hello[talked % OR.hello.length]; if (thanks && thanks.by === 'ora') { open = thanks.pz && thanks.pz.length ? PZ.line(thanks.pz) : thanks.g === 'shift' ? 'A whole shift. ' + thanks.gold + ' gold. I knew you would.' : 'The ball thanks you. ' + thanks.gold + ' gold, as foretold.'; thanks = null; } sayTo(kT, [oraMenu(open)]); };
  const menuL = () => { let open = LU.hello[talkedL++ ? 1 + (talkedL % 2) : 0]; if (thanks && thanks.by === 'lumi') { open = thanks.pz && thanks.pz.indexOf('hat') >= 0 ? 'A star hat! Mine is a hood. Ora can swap yours. Same stars.' : 'You did it! ' + thanks.gold + ' gold. Do not tell Ora I clapped.'; thanks = null; }
    sayTo(lT, [{ ...lnL(open), choices: [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob('lumi'), lastP); } }, { text: 'BACK ROOM JOBS', pick: () => sub(lT, lnL, 'lumi', 'Back room jobs. Which one?') },
      { text: 'WHO ARE YOU?', pick: () => sayTo(lT, [lnL('Ora found me asleep on her step. I was seven.'), lnL('Now I sweep, I light, I learn. One day, I see.')]) },
      { text: 'A TIP, PLEASE', pick: () => sayTo(lT, [lnL(LU.tips[talkedL % LU.tips.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); };
  function talk(P) { lastP = P; if (J && GN[J.g].walk) { if (GD[J.g].talk && GD[J.g].talk(P)) return true; if (nearOra(P)) { quit(); return true; } return false; } if (busy || !inRoom(P)) return false; const r = ringAt(P); if (r) { startGame(r.k, P); return true; }
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (nearLumi(P)) { tone(880, 0.04, 0.2, 'triangle'); menuL(); return true; } if (nearOra(P)) { shimmer(); menuO(); return true; } return false; }
  function quit() { stop(); toast(SH ? 'SHIFT STOPPED \u00b7 GOLD KEPT' : 'JOB STOPPED \u00b7 GOLD KEPT', 2); SH = null; }
  let outT = 0;
  const face = (f, home, P, near, dt) => { if (near && !busy) { const a = Math.atan2(P.x - f.position.x, P.z - f.position.z); let d = a - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * 3); } else { let d = home - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * 2); } };
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; toastT -= dt; const near = Math.hypot(P.x + 80, P.z + 60); G.visible = near < (touch ? 60 : 110);
    if (oldOra) { oldOra.visible = false; if (oldOra.position.y > -40) oldOra.position.set(-80, -50, -200); }
    if (busy === 'job' && J) { outT = inRoom(P) ? 0 : outT + dt; if (outT > (GN[J.g].walk ? 2 : 0.3)) { stop(); SH = null; toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (SH && !busy && SH.wait > 0) { SH.wait -= dt; if (SH.wait <= 0) { if (inRoom(P)) startGame(SH_LIST[SH.i], P); else SH = null; } }
    if (busy === 'job' && J && !GN[J.g].walk && fox) fox.visible = false; PZ.applyWear(fox); if (!G.visible) { LF.humOn(false); return; } XB.lookTick(dt, t); PZ.tick(dt, t, fox);
    if (busy === 'job' && J) jobTick(dt, P); hintTick(t);
    kit.animFox(lumi, dt, 0, false); const here = inRoom(P); face(lumi, LUM.ry, P, here && nearLumi(P), dt);
    orb2.material.emissiveIntensity = 0.8 + Math.sin(t * 1.7) * 0.3; LANT.forEach((m, i) => { m.rotation.y += dt * (0.3 + i * 0.1); });
    K.tick(dt, P, { inShop: here, busy: !!busy, near, talking: false }); LF.tick(dt, t, P, here, !!busy); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => (busy && J && GN[J.g].walk ? null : busy), active: () => !!busy, shift: () => SH, startShift: P => startShift(P || lastP), XB, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), ora, lumi, PZ, LF, GD, RINGS, CAND, inRoom,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) jobTick(dt, lastP); }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), dispose() { card.remove(); HINT.remove(); K.dispose && K.dispose(); } };
  window.__fortuneJobs = API; return API;
}
