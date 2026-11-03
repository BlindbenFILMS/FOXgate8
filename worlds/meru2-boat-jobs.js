// MERU 2.0 — s91 BOAT HOUSE DELUXE PART A (Ben's answers s91): the SPEEDBOAT BAY boathouse [meruSpeedboatBay] (f 60..90 × 205..228, door N (75, 205);
// wet slip x 70.4..79.6 from z 210 with the speedboat; low docks either side at y 0.4). NEW keeper CAPTAIN ACE, harbour master, retired 8-time
// Speedboat Bay champion (cool, calls you "rookie"), at the head of the slip in line with the door. Shop kit (NOW HIRING, BEST board + clock,
// chime, sun, lamps, browsers), the TROPHY WALL (west), and the first 5 jobs (inside): REFUEL (tap the cap, hold to pump, stop on the line) ·
// TIE THE KNOTS (figure 8 round the cleats, tap the lit point) · LIFE JACKETS (tap the size that fits the fox) · SCRUB THE HULL (drag the scraper
// over the barnacles) · PAINT THE NUMBER (drag the brush over the stencil 8). The trailer boat sits on the east floor.
// Part B = worlds/meru2-jetty-jobs.js (s92). Part C (s93) = worlds/meru2-boat-prize.js (PZ) + worlds/meru2-boat-life.js (LF).
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { PLAYER_FEMALE } from '../fox-kit.js';
import { buildJettyJobs } from './meru2-jetty-jobs.js';
import { bhPrizes } from './meru2-boat-prize.js';   // s93 part C: prizes (both keepers)
import { bhLife } from './meru2-boat-life.js';   // s93 part C: look extras + visitors   // s92 part B: the Fisherman's jetty jobs + shore path (ticked + routed from here)
const KP = { name: 'Captain Ace', role: 'HARBOUR MASTER', color: '#2e4a6b', torso: ['#f3f2f2', '#ec3013', '#201e1d'],
  hello: ['Ace. Eight-time Speedboat Bay champ. Now I run the harbour. Want work, rookie?', 'Rookie! Back for another shift?', 'The lake waits for nobody. Pick a job.', 'Fast hands today? Good. Let us work.'],
  open: ['Clean run, rookie.', 'Podium finish.', 'Smooth as flat water.', 'Champion stuff.'],
  tips: ['Fill to the line. Too much and the lake gets a drink.', 'Figure eight round the cleat, then lock it.', 'Barnacles slow a hull down. Scrape every last one.', 'Small fox, small jacket. Nobody swims in a tent.',
    'Paint the number big. The judges squint.', 'First cup at fourteen. Lost a tooth on the second.', 'Eight cups on that wall. The ninth one is yours to win.'] };
const CUSTJ = [{ name: 'KIA', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], sz: 0 }, { name: 'OTTO', torso: ['#7a8a3a', '#e8e2c8', '#4a5420'], sz: 2 }, { name: 'FLICK', torso: ['#ffd23a', '#201e1d', '#a16207'], sz: 1 },
  { name: 'MARLA', torso: ['#f472b6', '#fce7f3', '#9d174d'], sz: 0, f: 1 }, { name: 'MICHAEL JAY', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], sz: 2 }, { name: 'PELL', torso: ['#1f2937', '#e6b45a', '#111827'], sz: 1 }];
const SZ = [['S', 'SMALL', 0.74], ['M', 'MEDIUM', 0.95], ['L', 'LARGE', 1.16]];
export function buildBoatJobs({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted, ground, wear, lake }) { const JW = jobWorker(THREE);
  const mutedQ = () => { try { return !!(isMuted && isMuted()); } catch (e) { return true; } };
  const R0 = { X0: 60, X1: 90, Z0: 205, Z1: 228 }, DOOR = [75, 205], DECK = 0.4;
  const G = new THREE.Group(); G.name = 'boatJobs'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const toW = v => { G.updateWorldMatrix(true, false); return G.localToWorld(v.clone()); };
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const ring = (x, z, r) => cols.push({ c: [x, z, r] }), boxC = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#c9a227', NAVY = '#2e4a6b', ORANGE = '#f97316';
  // ================= the keeper: CAPTAIN ACE at the head of the slip, facing the door =================
  const ace = kit.makeFox({ key: 'bhAce', torso: KP.torso, outfit: 'coat', mood: 'smug', look: { fur: '#c8743a', furDark: '#8a4a1e' } });
  const ACE = { x: 75, z: 208.7, ry: Math.PI }; ace.position.set(ACE.x, 0, ACE.z); ace.rotation.y = ACE.ry; G.add(ace); ring(ACE.x, ACE.z, 0.45);
  { const P0 = ace.userData && ace.userData.P; if (P0 && P0.body) { const md = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 14), LM(GOLD)); md.rotation.x = Math.PI / 2; md.position.set(0.1, 0.95, 0.3); P0.body.add(md); }
    if (P0 && P0.head) { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 14), LM(WHITE)); cap.position.set(0, 0.3, 0); P0.head.add(cap); const pk = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.025, 0.16), LM(INK)); pk.position.set(0, 0.25, 0.2); P0.head.add(pk); } }
  const kT = { key: 'bhAce', name: KP.name, role: KP.role, obj: ace, ry: ACE.ry, r: 6 }, ln = text => ({ who: 'captain ace', role: KP.role, text });
  // a rail across the head of the slip behind him
  box(G, 9.2, 0.06, 0.06, NAVY, 75, 1.0, 209.9); for (const x of [70.6, 75, 79.4]) box(G, 0.07, 1.0, 0.07, NAVY, x, 0.5, 209.9);
  // ================= the TROPHY WALL (west): 8 cups on 2 shelves, photos, a banner =================
  { const WX = 60.55; for (const y of [1.25, 1.95]) box(G, 0.34, 0.05, 6.2, '#6b4f3a', WX + 0.17, y, 212); boxC(60, 60.8, 208.9, 215.1);
    for (let i = 0; i < 8; i++) { const y = i < 4 ? 1.275 : 1.975, z = 209.6 + (i % 4) * 1.6, s = 0.8 + (i % 3) * 0.15; cyl(G, 0.05 * s, 0.07 * s, 0.05, INK, WX + 0.17, y + 0.025, z, 8); cyl(G, 0.025 * s, 0.025 * s, 0.14 * s, GOLD, WX + 0.17, y + 0.12 * s, z, 6);
      cyl(G, 0.11 * s, 0.05 * s, 0.2 * s, GOLD, WX + 0.17, y + 0.28 * s, z, 12); for (const sz of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.05 * s, 0.012, 5, 10), LM(GOLD)); h.position.set(WX + 0.17, y + 0.3 * s, z + sz * 0.12 * s); G.add(h); } }
    const photo = (k) => CT(160, 120, (g, W, H) => { g.fillStyle = '#e8e4dc'; g.fillRect(0, 0, W, H); g.fillStyle = '#8a8680'; g.fillRect(8, 8, W - 16, H * 0.55); g.fillStyle = '#4a4744'; g.fillRect(8, 8 + H * 0.55, W - 16, H * 0.3);
      g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(30 + k * 6, 70); g.lineTo(120, 70); g.lineTo(134, 60); g.lineTo(44 + k * 6, 60); g.fill(); g.fillStyle = '#f3f2f2'; g.beginPath(); g.moveTo(20, 74); g.quadraticCurveTo(10, 66, 4, 70); g.lineTo(28, 78); g.fill();
      g.fillStyle = '#201e1d'; g.font = '900 16px Archivo, sans-serif'; g.fillText((1980 + k * 3) + ' \u00b7 1ST', 12, H - 6); });
    [209.6, 212, 214.4].forEach((z, i) => { box(G, 0.04, 0.78, 1.02, INK, WX + 0.02, 2.9, z); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.68), new THREE.MeshBasicMaterial({ map: photo(i) })); p.position.set(WX + 0.05, 2.9, z); p.rotation.y = Math.PI / 2; G.add(p); });
    const bn = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.5), new THREE.MeshBasicMaterial({ map: CT(512, 56, (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = RED; g.fillRect(0, 0, 12, H); g.fillStyle = '#ffffff'; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('CAPTAIN ACE \u00b7 8\u00d7 BAY CHAMPION', 26, H / 2 + 2); }) }));
    bn.position.set(WX + 0.05, 3.62, 212); bn.rotation.y = Math.PI / 2; G.add(bn); }
  // ================= the TRAILER BOAT (east floor): white hull on stands, red stripe, bow north =================
  const HX = 86.2, HZ0 = 218.4, HZ1 = 223, HY0 = 0.45, HY1 = 1.35, SIDE = HX - 0.9;
  { const hull = box(G, 1.8, HY1 - HY0, HZ1 - HZ0, WHITE, HX, (HY0 + HY1) / 2, (HZ0 + HZ1) / 2); hull.material = LM(WHITE);
    const bow = new THREE.Shape([new THREE.Vector2(-0.9, 0), new THREE.Vector2(0.9, 0), new THREE.Vector2(0, -1.1)]), bg = new THREE.ExtrudeGeometry(bow, { depth: HY1 - HY0, bevelEnabled: false }); bg.rotateX(Math.PI / 2);
    const bm = new THREE.Mesh(bg, LM(WHITE)); bm.position.set(HX, HY1, HZ0); G.add(bm);
    box(G, 1.84, 0.1, HZ1 - HZ0, RED, HX, HY1 - 0.18, (HZ0 + HZ1) / 2); box(G, 1.7, 0.08, 4.2, '#a07a52', HX, HY1 + 0.02, (HZ0 + HZ1) / 2 + 0.1); box(G, 0.5, 0.5, 0.3, INK, HX, HY0 + 0.6, HZ1 + 0.1);
    for (const z of [219.2, 222.2]) box(G, 2.0, HY0, 0.3, '#5a5654', HX, HY0 / 2, z); for (const sx of [-1, 1]) cyl(G, 0.28, 0.28, 0.16, INK, HX + sx * 1.05, 0.28, 220.7, 12).rotation.z = Math.PI / 2;
    boxC(85.1, 87.3, 217.2, 223.4); }
  // ================= the LIFE JACKET RACK (north wall, east of the door) =================
  const RZ = 205.75, HOOKX = [84.0, 85.5, 87.0];
  { box(G, 4.6, 0.08, 0.12, '#6b4f3a', 85.5, 1.72, RZ - 0.1); boxC(83, 88, 205, 206.1);
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.36), new THREE.MeshBasicMaterial({ map: CT(256, 40, (g, W, H) => { g.fillStyle = ORANGE; g.fillRect(0, 0, W, H); g.fillStyle = INK; g.font = '900 24px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('LIFE JACKETS \u00b7 S M L', 10, H / 2 + 1); }) })); tag.position.set(85.5, 2.2, RZ - 0.1); G.add(tag); }
  const JK = SZ.map(([l], i) => { const s = [0.78, 1, 1.22][i], g = new THREE.Group(); g.position.set(HOOKX[i], 1.25, RZ); G.add(g);
    box(g, 0.5 * s, 0.6 * s, 0.14, ORANGE, 0, 0, 0); box(g, 0.08, 0.6 * s, 0.15, '#c95a10', 0, 0, 0.002); box(g, 0.52 * s, 0.05, 0.16, INK, 0, -0.12 * s, 0);
    const t = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.26), new THREE.MeshBasicMaterial({ map: CT(64, 64, (q, W) => { q.fillStyle = WHITE; q.fillRect(0, 0, W, W); q.strokeStyle = INK; q.lineWidth = 6; q.strokeRect(3, 3, W - 6, W - 6); q.fillStyle = INK; q.font = '900 44px Archivo, sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText(l, 32, 35); }) }));
    t.position.set(0, 0.52 * s, 0.08); g.add(t); return { g, home: g.position.clone(), i }; });
  // ================= the PUMP (east dock) + the slip boat's fuel cap =================
  const PUMP = V(81.4, DECK, 221.8), CAP = V(76.0, 1.0, 221.6);
  { box(G, 0.5, 1.2, 0.45, RED, PUMP.x, DECK + 0.6, PUMP.z); box(G, 0.36, 0.22, 0.04, WHITE, PUMP.x - 0.25, DECK + 0.95, PUMP.z); ring(PUMP.x, PUMP.z, 0.4); }
  const capM = cyl(G, 0.09, 0.09, 0.05, YEL, CAP.x, CAP.y, CAP.z, 12);
  const NOZ = new THREE.Group(); box(NOZ, 0.08, 0.08, 0.3, INK, 0, 0, 0); box(NOZ, 0.05, 0.14, 0.05, INK, 0, -0.07, -0.08); G.add(NOZ); const NOZ0 = V(PUMP.x - 0.3, DECK + 0.8, PUMP.z); NOZ.position.copy(NOZ0);
  const hoseM = new THREE.MeshLambertMaterial({ color: INK }); let hose = null;
  const setHose = () => { if (hose) { G.remove(hose); hose.geometry.dispose(); } const a = V(PUMP.x - 0.2, DECK + 0.7, PUMP.z), b = NOZ.position.clone(), m = a.clone().lerp(b, 0.5); m.y = Math.min(a.y, b.y) - 0.35;
    hose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 12, 0.03, 5), hoseM); G.add(hose); }; setHose();
  // ================= the CLEATS (west dock edge, by the slip) =================
  const CLZ = [212.6, 216.4, 224.6], CLX = 70.1;
  CLZ.forEach(z => { box(G, 0.14, 0.06, 0.2, '#5a5654', CLX, DECK + 0.03, z); box(G, 0.09, 0.07, 0.48, '#7a7670', CLX, DECK + 0.09, z); });
  const ropeM = new THREE.MeshLambertMaterial({ color: '#c9b48a' });
  // ================= rings =================
  const RINGS = { fuel: [80.8, 219.4, DECK], knots: [69.0, 211.0, DECK], jackets: [85.5, 207.6], scrub: [83.9, 222.0], paint: [83.9, 219.3] };
  const ringMesh = k => { const [x, z, y = 0] = RINGS[k]; const r1 = cyl(G, 0.5, 0.5, 0.012, YEL, x, 0.085 + y, z, 22), r2 = cyl(G, 0.42, 0.42, 0.014, INK, x, 0.087 + y, z, 22); r1.renderOrder = r2.renderOrder = 1; }; for (const k in RINGS) ringMesh(k);
  // ================= shop kit =================
  const GAMES = [{ k: 'fuel', name: 'Refuel the Boats', color: RED, grp: 'shop' }, { k: 'knots', name: 'Tie the Knots', color: '#c9b48a', grp: 'shop' }, { k: 'jackets', name: 'Life Jackets', color: ORANGE, grp: 'shop' },
    { k: 'scrub', name: 'Scrub the Hull', color: '#5a8a9a', grp: 'shop' }, { k: 'paint', name: 'Paint the Number', color: NAVY, grp: 'shop' }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), pre = 'bh';
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted: mutedQ, prefix: pre, color: KP.color, boardTitle: "Ace's best", toWorld: toW, room: R0, door: [DOOR[0], DOOR[1] + 0.5], keeper: ace, keeperRy: ACE.ry, games: GAMES,
    board: { x: 65.2, y: 2.6, z: 205.62, ry: 0, w: 1.3 }, hiring: { x: 71.4, y: 0, z: 206.9, ry: Math.PI }, hiringLine: 'WALK UP \u00b7 START WORK',
    sun: [{ x: 65, z: 207.6, w: 2.6, d: 2.4 }, { x: 85, z: 209.4, w: 2.6, d: 2.4 }], lamps: [[65, 4.2, 211], [85, 4.2, 211], [65, 4.2, 222], [85, 4.2, 222], [75, 4.4, 216]],
    browse: [[61.6, 212, -Math.PI / 2], [88.4, 213, Math.PI / 2], [66, 216, Math.PI]], slots: 2, clock: { x: 68.4, y: 2.9, z: 205.62, ry: 0 } });
  // ================= state, sound, card UI =================
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, thanks = null, lastP = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at0 = 0) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at0, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = bf; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), horn = () => { tone(220, 0.06, 0.5, 'sawtooth'); tone(277, 0.05, 0.5, 'sawtooth'); };
  const glug = () => tone(140 + Math.random() * 60, 0.04, 0.12, 'sine'), scrape = () => noise(0.09, 0.03, 2200), creak = () => tone(330, 0.03, 0.2, 'triangle');
  const PZ = bhPrizes({ THREE, G, box, cyl, LM, CT, save, wear, toast, ding, tone, sayTo, kT, ln, lake, cols });
  const LF = bhLife({ THREE, G, scene, box, cyl, LM, CT, kit, cols, save, hour, touch, tone, mutedQ, ground, lake, sayTo, toast });
  const JJ = buildJettyJobs({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted: mutedQ, ground, onFinish: () => PZ.onFinish(), prizeLine: (k, w) => PZ.line(k, w), freeRent: () => PZ.freeRent() });
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + KP.color + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span></div>';
  const lst = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + items.map(([sw, t, r, ok]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (r ? ' \u00b7 ' + r : '') + '</span>').join('') + '</div>' : items.map(a => row(...a)).join('');
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>';
  const gauge = (v, lo, hi) => '<div style="position:relative;height:20px;border:2px solid #201e1d;background:#ffffff;margin-top:6px"><div style="position:absolute;top:0;bottom:0;left:' + (lo * 100).toFixed(1) + '%;width:' + ((hi - lo) * 100).toFixed(1) + '%;background:#9fd7a8"></div><div style="position:absolute;top:0;bottom:0;left:0;width:' + Math.min(100, v * 100).toFixed(1) + '%;background:' + (v > hi ? '#ec3013' : '#201e1d') + ';opacity:0.85"></div></div>';
  const setCard = (k, html) => { if (k === cardKey) return; cardKey = k; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ---------- input (tap jobs) ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && !!J;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), TAPR = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(toW(v)).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = V(), inv = new THREE.Matrix4();
  const ray = () => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); G.updateWorldMatrix(true, false); inv.copy(G.matrixWorld).invert(); return rc.ray.clone().applyMatrix4(inv); };
  const hitPl = pl => (ray().intersectPlane(pl, hitP) ? hitP.clone() : null);
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const Fq of J.flies.slice()) { Fq.t += dt / Fq.dur; const k = Math.min(1, Fq.t), e = k * k * (3 - 2 * k); Fq.obj.position.lerpVectors(Fq.from, Fq.to, e); Fq.obj.position.y += Math.sin(k * Math.PI) * Fq.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(Fq), 1); Fq.then && Fq.then(); } } }
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt + bg] || (tagTex[txt + bg] = CT(128, 96, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = '900 ' + (txt.length > 2 ? 40 : 60) + 'px Archivo, sans-serif'; g.fillText(txt, W2 / 2, H / 2 + 3); }));
  const tagSprite = (txt, bg = '#ffffff', fg = INK, s = 0.5) => { if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: false })); sp.scale.set(s, s * 0.75, 1); sp.renderOrder = 6; return sp; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (after, t = 1.0) => { J.pause = t; J.after = after; };
  const done = () => save.stat(pre + 'Done', null) || {};
  const KEEP = () => 'ACE';
  const blotT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 3, 32, 32, 31); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.65, 'rgba(255,255,255,0.85)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, rr = 23 + (i % 3) * 5; g.lineTo(32 + Math.cos(a) * rr, 32 + Math.sin(a) * rr); } g.fill(); });
  // ================= JOB 1: REFUEL (tap + hold) — tap the cap, hold to pump, let go in the green band; 3 tanks =================
  const FUEL = [[0.5, 'HALF'], [0.75, 'THREE QUARTERS'], [0.95, 'FULL']];
  const G1 = {
    begin() { J.i = 0; J.ph = 'cap'; J.lvl = 0; J.tag = own(tagSprite('TAP', YEL, INK, 0.36)); J.tag.position.copy(CAP).setY(CAP.y + 0.35); toast('TAP THE YELLOW FUEL CAP \u00b7 THEN HOLD TO PUMP', 2.8); },
    band() { const t = FUEL[J.i][0]; return [t - 0.06, Math.min(1, t + 0.05)]; },
    press() { if (J.flies.length) return; if (J.ph === 'cap') { if (dist(scrW(CAP)) > TAPR() * 1.8) return; J.ph = 'move'; pop(); J.tag.visible = false; fly(NOZ, CAP.clone().setY(CAP.y + 0.12), 0.4, 0.4, () => { if (J) { J.ph = 'pump'; toast('HOLD TO PUMP \u00b7 LET GO ON THE GREEN', 2.2); } }); return; }
      if (J.ph === 'pump') J.pumping = true; },
    release() { if (!J.pumping) return; J.pumping = false; const [lo, hi] = this.band(); if (J.lvl < lo) { toast('NOT YET \u00b7 HOLD AGAIN', 1.2); return; }
      if (J.lvl <= hi) { addGold(5); ding(); toast(FUEL[J.i][1] + ' \u00b7 SPOT ON', 1.2); this.nextTank(); } },
    nextTank() { J.ph = 'wait'; NEXT(() => { J.i++; J.lvl = 0; if (J.i >= FUEL.length) { NOZ.position.copy(NOZ0); setHose(); finishGame(); return; } J.ph = 'pump'; horn(); toast('NEXT BOAT IN \u00b7 FILL TO ' + FUEL[J.i][1], 2); }, 0.9); },
    tick(dt) { if (J.ph === 'move' || J.ph === 'cap') setHose(); if (J.ph !== 'pump' || !J.pumping) return; J.lvl += dt * 0.3; J.gl = (J.gl || 0) + dt; if (J.gl > 0.16) { J.gl = 0; glug(); }
      const [, hi] = this.band(); if (J.lvl > hi) { J.pumping = false; miss('OVER THE LINE \u00b7 THE LAKE GOT A DRINK', 1.8); this.nextTank(); } },
    card() { if (J.i >= FUEL.length) return ['ALL TANKS FULL', lab('3 / 3'), 'e']; const [lo, hi] = this.band();
      return [J.ph === 'cap' ? 'TAP THE FUEL CAP' : 'HOLD \u00b7 LET GO ON GREEN', lab('BOAT ' + (J.i + 1) + ' / 3 \u00b7 FILL TO ' + FUEL[J.i][1]) + gauge(J.lvl, lo, hi), J.ph + J.i + '_' + Math.round(J.lvl * 60)]; },
    hint() { return J.ph === 'cap' ? [CAP.clone(), 'TAP'] : J.ph === 'pump' && !J.pumping ? [CAP.clone(), 'HOLD'] : null; },
    shot() { return [V(78.2, 0.9, 221.2), 5.6, 2.2, 0.55, 2.8, Math.PI / 2 - 0.35, 5.2]; },
    end() { NOZ.position.copy(NOZ0); setHose(); } };
  // ================= JOB 2: TIE THE KNOTS (tap) — 3 cleats, figure 8: tap the lit point, 4 wraps + LOCK =================
  const KNOT = [[-0.06, -0.21], [0.06, 0.21], [0.06, -0.21], [-0.06, 0.21], [0, 0]];
  const ptK = (c, i) => V(CLX + KNOT[i][0], DECK + (i === 4 ? 0.16 : 0.12), CLZ[c] + KNOT[i][1]);
  const G2 = {
    begin() { J.c = 0; J.k = 0; J.mk = []; this.marks(); toast('FIGURE 8 \u00b7 TAP THE LIT POINT \u00b7 THEN LOCK', 2.8); },
    marks() { J.mk.forEach(m => { if (m.parent) m.parent.remove(m); }); J.mk = KNOT.map((_, i) => { const s = own(tagSprite(i === 4 ? 'LOCK' : String(i + 1), i === J.k ? YEL : '#d6d2cb', INK, i === 4 ? 0.22 : 0.16)); s.position.copy(ptK(J.c, i)).setY(DECK + 0.3); s.visible = i >= J.k; return s; }); J.pts = [V(73.2, 0.7, CLZ[J.c] + 0.4), V(70.6, DECK + 0.1, CLZ[J.c] + 0.25)]; this.rope(); },
    rope() { if (J.rp) { G.remove(J.rp); J.rp.geometry.dispose(); } const c = new THREE.CatmullRomCurve3(J.pts); J.rp = own(new THREE.Mesh(new THREE.TubeGeometry(c, J.pts.length * 6, 0.025, 5), ropeM)); },
    press() { let best = -1, bd = TAPR() * 1.2; J.mk.forEach((m, i) => { if (!m.visible) return; const d = dist(scrW(m.position)); if (d < bd) { bd = d; best = i; } }); if (best < 0) return;
      if (best !== J.k) { miss(J.k === 4 ? 'TAP LOCK TO FINISH THE KNOT' : 'NOT THAT ONE \u00b7 FOLLOW THE NUMBERS', 1.4); return; }
      J.pts.push(ptK(J.c, best)); this.rope(); creak(); J.k++; if (J.k <= 4) { J.mk.forEach((m, i) => { m.visible = i >= J.k; m.material.map = tagFor(i === 4 ? 'LOCK' : String(i + 1), i === J.k ? YEL : '#d6d2cb', INK); }); }
      if (J.k > 4) { addGold(5); ding(); J.mk.forEach(m => { m.visible = false; }); const keep = J.rp; J.rp = null; J.c++; if (J.c >= CLZ.length) { NEXT(finishGame, 0.8); return; } NEXT(() => { J.k = 0; G2.marks(); snapK = false; }, 0.8); toast('TIED \u00b7 NEXT CLEAT', 1.2); void keep; } },
    card() { return ['TAP ' + (J.k === 4 ? 'LOCK' : 'POINT ' + (J.k + 1)), lab('CLEAT ' + Math.min(3, J.c + 1) + ' / 3') + lst(CLZ.map((_, i) => ['#c9b48a', 'CLEAT ' + (i + 1), i < J.c ? '\u2713' : i === J.c ? J.k + ' / 5' : '', i < J.c])), 'k' + J.c + '_' + J.k]; },
    hint() { const m = J.mk && J.mk[J.k]; return m && m.visible ? [m.position.clone(), 'TAP'] : null; },
    shot() { const z = CLZ[Math.min(J.c, CLZ.length - 1)]; return [V(CLX, DECK + 0.12, z), 1.3, 1.0, 0.9, 1.5, -Math.PI / 2, 2.3]; },
    end() {} };
  // ================= JOB 3: LIFE JACKETS (tap) — a fox walks up; tap the size that fits =================
  const cfox = {}; const custFox = i => { if (cfox[i]) return cfox[i]; const C = CUSTJ[i], f = kit.makeFox({ key: 'bhCust' + i, torso: C.torso, outfit: 'vest', mood: 'happy', look: C.f ? PLAYER_FEMALE : undefined }); f.visible = false; f.scale.multiplyScalar(SZ[C.sz][2]); G.add(f); return (cfox[i] = f); };
  const CUSTAT = V(88.3, 0, 207.2);
  const G3 = {
    begin() { J.q = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 5); J.i = 0; this.next(); toast('TAP THE JACKET THAT FITS \u00b7 LOOK HOW BIG THEY ARE', 2.8); },
    next() { Object.values(cfox).forEach(f => { f.visible = false; }); JK.forEach(j => { j.g.position.copy(j.home); j.g.visible = true; }); const f = custFox(J.q[J.i]); f.position.copy(CUSTAT); f.rotation.y = -Math.PI / 2 - 0.5; f.visible = true; pop(); },
    press() { if (J.flies.length || J.i >= J.q.length) return; let best = -1, bd = TAPR() * 1.6; JK.forEach((j, i) => { const d = dist(scrW(j.g.position)); if (d < bd) { bd = d; best = i; } }); if (best < 0) return;
      const C = CUSTJ[J.q[J.i]]; if (best !== C.sz) { miss(best < C.sz ? 'TOO SMALL FOR ' + C.name : 'TOO BIG FOR ' + C.name, 1.5); return; }
      const j = JK[best]; fly(j.g, V(CUSTAT.x, 1.1 * SZ[C.sz][2], CUSTAT.z), 0.35, 0.3, () => { if (!J) return; j.g.visible = false; addGold(4); tone(990, 0.05, 0.3); toast(C.name + ': "SNUG. THANKS!"', 1.2);
        NEXT(() => { J.i++; if (J.i >= J.q.length) { ding(); finishGame(); } else G3.next(); }, 0.7); }); },
    card() { if (J.i >= J.q.length) return ['ALL KITTED OUT', lab('5 / 5'), 'e']; const C = CUSTJ[J.q[J.i]];
      return ['WHICH SIZE FITS?', lab((J.i + 1) + ' / 5 \u00b7 ' + C.name + (J.miss ? ' \u00b7 SIZE ' + SZ[C.sz][0] : '')) + lst(SZ.map(s => [ORANGE, s[0] + ' \u00b7 ' + s[1], '', false])), 'j' + J.i + '_' + J.miss]; },
    hint() { if (J.i >= J.q.length) return null; return [JK[CUSTJ[J.q[J.i]].sz].g.position.clone(), 'TAP']; },
    shot() { return [V(86.2, 1.1, 205.9), 5.2, 2.2, 0.18, 3.0, 0, 5.6]; },
    end() { Object.values(cfox).forEach(f => { f.visible = false; }); JK.forEach(j => { j.g.position.copy(j.home); j.g.visible = true; }); } };
  // ================= JOB 4: SCRUB THE HULL (drag) — barnacles on the trailer boat's west side =================
  const sidePl = new THREE.Plane().setFromNormalAndCoplanarPoint(V(-1, 0, 0), V(SIDE - 0.02, 0, 0));
  const SCR = new THREE.Group(); box(SCR, 0.04, 0.12, 0.22, '#9aa3ab', 0, 0, 0); box(SCR, 0.05, 0.3, 0.05, '#6b4f3a', -0.04, -0.18, 0); SCR.visible = false; G.add(SCR);
  const barnG = new THREE.DodecahedronGeometry(0.05, 0);
  const G4 = {
    begin() { J.sp = []; for (let i = 0; i < 11; i++) { let y, z, n = 0; do { y = rnd(HY0 + 0.1, HY1 - 0.28); z = rnd(220.3, 222.8); } while (J.sp.some(s => Math.hypot(s.p.y - y, s.p.z - z) < 0.2) && ++n < 30);
        const m = own(new THREE.Mesh(barnG, LM(['#8a8680', '#a8a29a', '#6a6560'][i % 3]))); m.position.set(SIDE - 0.02, y, z); m.scale.set(0.6, 1, 1); J.sp.push({ p: m.position.clone(), m, d: 1 }); }
      J.lp = null; toast('DRAG THE SCRAPER \u00b7 OFF WITH EVERY BARNACLE', 2.6); },
    press() { J.lp = null; },
    drag() { if (!ptr.down) return; const p = hitPl(sidePl); if (!p) return; p.y = clamp(p.y, HY0, HY1); p.z = clamp(p.z, HZ0, HZ1); SCR.visible = true; SCR.position.set(SIDE - 0.08, p.y, p.z);
      const mv = J.lp ? J.lp.distanceTo(p) : 0; J.lp = p; if (mv < 0.002) return; if ((J.sw = (J.sw || 0) + mv) > 0.2) { J.sw = 0; scrape(); }
      for (const s of J.sp) { if (s.d <= 0 || Math.hypot(s.p.y - p.y, s.p.z - p.z) > 0.13) continue; s.d -= mv * 3; s.m.scale.setScalar(Math.max(0.2, s.d)); if (s.d <= 0) { pop(); addGold(1); fly(s.m, V(SIDE - 0.4, 0.05, s.p.z), 0.35, 0.05, () => { s.m.visible = false; }); } }
      if (J.sp.every(s => s.d <= 0) && !J.pause) { ding(); NEXT(finishGame, 0.9); } },
    release() { J.lp = null; },
    card() { const n = J.sp.filter(s => s.d > 0).length; return ['DRAG THE SCRAPER', lst([['#8a8680', 'BARNACLES', n + ' LEFT', !n]]), 's' + n]; },
    hint() { const s = J.sp.find(q => q.d > 0); return s ? [s.p.clone(), 'DRAG'] : null; },
    shot() { return [V(SIDE, 0.9, 221.5), 2.9, 1.3, 0.15, 2.0, -Math.PI / 2, 3.3]; },
    end() { SCR.visible = false; } };
  // ================= JOB 5: PAINT THE NUMBER (drag) — a stencil 8 on the bow; brush over every dot =================
  const BRUSH = new THREE.Group(); box(BRUSH, 0.05, 0.08, 0.1, RED, 0, 0, 0); box(BRUSH, 0.04, 0.26, 0.04, '#a07a52', -0.03, -0.16, 0); BRUSH.visible = false; G.add(BRUSH);
  const P8 = { z: 219.25, y0: 0.74, y1: 1.07, r: 0.16 };
  const G5 = {
    begin() { J.sp = []; for (const [cy, n] of [[P8.y0, 9], [P8.y1, 8]]) for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, y = cy + Math.cos(a) * P8.r * (cy === P8.y1 ? 0.88 : 1), z = P8.z + Math.sin(a) * P8.r * 0.85;
        const m = own(new THREE.Mesh(new THREE.CircleGeometry(0.045, 10), new THREE.MeshBasicMaterial({ color: '#c8c4bc' }))); m.position.set(SIDE - 0.015, y, z); m.rotation.y = -Math.PI / 2; m.renderOrder = 3; J.sp.push({ p: m.position.clone(), m, d: 1 }); }
      J.lp = null; toast('DRAG THE BRUSH \u00b7 PAINT EVERY DOT OF THE 8', 2.6); },
    press() { J.lp = null; },
    drag() { if (!ptr.down) return; const p = hitPl(sidePl); if (!p) return; p.y = clamp(p.y, HY0, HY1); p.z = clamp(p.z, HZ0, HZ1); BRUSH.visible = true; BRUSH.position.set(SIDE - 0.07, p.y, p.z);
      const mv = J.lp ? J.lp.distanceTo(p) : 0; J.lp = p; if (mv < 0.002) return; if ((J.sw = (J.sw || 0) + mv) > 0.3) { J.sw = 0; noise(0.06, 0.012, 5000); }
      for (const s of J.sp) { if (s.d <= 0 || Math.hypot(s.p.y - p.y, s.p.z - p.z) > 0.07) continue; s.d = 0; s.m.material.color.set(RED); s.m.scale.setScalar(1.35); tone(1200 + J.sp.filter(q => q.d <= 0).length * 40, 0.03, 0.15, 'triangle'); addGold(0.5); }
      for (const s of J.sp) if (s.d > 0) continue; if (J.sp.every(s => s.d <= 0) && !J.pause) { ding(); NEXT(finishGame, 0.9); } },
    release() { J.lp = null; },
    card() { const n = J.sp.filter(s => s.d > 0).length; return ['DRAG THE BRUSH', lst([[RED, 'DOTS', n + ' LEFT', !n]]), 'p' + n]; },
    hint() { const s = J.sp.find(q => q.d > 0); return s ? [s.p.clone(), 'PAINT'] : null; },
    shot() { return [V(SIDE, 0.92, P8.z), 1.2, 1.0, 0.1, 1.4, -Math.PI / 2, 2.2]; },
    end() { BRUSH.visible = false; } };
  // the painted 8 stays on the hull once done (saved)
  const keep8 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.62), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: CT(80, 100, (g) => { g.fillStyle = RED; g.font = '900 96px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 40, 54); }) }));
  keep8.position.set(SIDE - 0.012, 0.9, P8.z); keep8.rotation.y = -Math.PI / 2; keep8.visible = !!done().paint; G.add(keep8);
  const GD = { fuel: G1, knots: G2, jackets: G3, scrub: G4, paint: G5 };
  // ================= run a game =================
  function startGame(g, P) { if (busy || !GD[g]) return; J = { g, miss: 0, gold: 0, objs: [], flies: [], t: 0, pause: 0, P }; busy = 'job'; const R = RINGS[g]; keep8.visible = g === 'paint' ? false : keep8.visible;
    if (P && R) { Object.assign(P, { x: R[0], z: R[1], sp: 0 }); if (R[2] != null) { P.y = R[2]; P.vy = 0; } } GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(8); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat(pre + 'Done', d); save.setStat('bhClears', save.stat('bhClears', 0) + 1); K.finish(g, stars, gold, first); stop();
    const pz = PZ.onFinish(); thanks = { g, gold, gf: pz.gf }; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 +' + gold + ' GOLD' + (pz.lucky ? ' \u00b7 +' + pz.lucky + ' LUCKY FLOAT' : '') + (pz.gf ? ' \u00b7 PRIZE: ' + PZ.line(pz.gf)[1] : ''), pz.gf ? 4 : 2.6); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) J.objs.forEach(o => o.parent && o.parent.remove(o)); busy = null; J = null; ptr.down = false; hideCard(); keep8.visible = !!done().paint; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g], c = g.card && g.card(); if (!c) { hideCard(); return; }
    setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? Math.floor(J.gold) + ' G' : KEEP()) + foot(c[0]) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; if (J.flies.length) flyTick(dt); if (!J) return; const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return; drawCard(); }
  // ---------- camera (tap jobs), clamped inside the room ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null, snapK = false; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { if (JJ.busy()) { JJ.camFix(cam, dt); return; } JJ.camFix(cam, dt); const v = busy === 'job' && J && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = snapK ? 1 : Math.min(1, dt * 3.2); snapK = false; camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.x = clamp(camCur.pos.x, R0.X0 + 0.6, R0.X1 - 0.6); camCur.pos.z = clamp(camCur.pos.z, R0.Z0 + 0.6, R0.Z1 - 0.6); camCur.pos.y = clamp(camCur.pos.y, 0.6, 4.6); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.830-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- places, talk + prompt ----------
  const inRoom = P => P.x > R0.X0 && P.x < R0.X1 && P.z > R0.Z0 && P.z < R0.Z1 && (P.y || 0) > -1.5 && (P.y || 0) < 3;
  const ringAt = P => { for (const k in RINGS) { if (!GD[k]) continue; const [x, z, y = 0] = RINGS[k]; if (Math.hypot(P.x - x, P.z - z) < 1.05 && Math.abs((P.y || 0) - y) < 1.2) return GN[k]; } return null; };
  const nearAce = P => Math.hypot(P.x - ace.position.x, P.z - ace.position.z) < 2.9;
  function prompt(P) { if (busy || JJ.busy()) return null; if (!inRoom(P)) return JJ.prompt(P);
    const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); const lp = LF.prompt(P); if (lp) return lp; if (K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; if (nearAce(P)) return 'TALK \u00b7 ' + KEEP(); return null; }
  const nextJob = () => { const d = done(); return (GAMES.find(q => !d[q.k] && GD[q.k]) || GAMES.slice().sort((a, c) => K.stars(a.k) - K.stars(c.k))[0]).k; };
  const sub = () => sayTo(kT, [{ ...ln('Boathouse jobs. Pick one, rookie.'), choices: [...GAMES.filter(q => GD[q.k]).map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => { if (!busy) startGame(q.k, lastP); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const menu = first => { if (PZ.needPaint()) { const gb = thanks && thanks.gf === 'boat'; thanks = null; PZ.paintPick(gb ? PZ.line('boat')[0] + ' Pick a colour.' : null); return; }
    const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(), lastP); } }, { text: 'BOATHOUSE JOBS', pick: () => sub() },
      { text: 'THE TROPHIES', pick: () => sayTo(kT, [ln('Eight cups. Eight summers. The lake was faster then. So was I.')]) }, { text: 'PRIZES + PERKS', pick: () => PZ.perks() }, { text: 'A TIP, PLEASE', pick: () => sayTo(kT, [ln(KP.tips[talked % KP.tips.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    let open = first ? KP.hello[0] : KP.hello[1 + (talked % 3)]; if (thanks) { open = thanks.gf ? PZ.line(thanks.gf)[0] : KP.open[save.stat('bhClears', 1) % 4] + ' ' + Math.floor(thanks.gold) + ' gold. Again?'; thanks = null; }
    sayTo(kT, [{ ...ln(open), choices: ch }]); };
  function talk(P) { lastP = P; if (JJ.busy()) return JJ.talk(P); if (busy) return true; if (!inRoom(P)) return JJ.talk(P); const r = ringAt(P); if (r) { startGame(r.k, P); return true; } if (LF.talk(P)) return true;
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (nearAce(P)) { tone(880, 0.05, 0.4); menu(!talked++); return true; } return false; }
  function quit() { if (JJ.busy()) { JJ.quit(); return; } stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  let outT = 0;
  function tick(dt, P, fox) { JJ.tick(dt, P, fox); const t = performance.now() / 1000; lastP = P; toastT -= dt; const near = Math.hypot(P.x - 75, P.z - 216.5); G.visible = near < (touch ? 60 : 110); PZ.tick(dt, fox); LF.tick(dt, P, inRoom(P));
    if (busy === 'job' && J) { outT = inRoom(P) ? 0 : outT + dt; if (outT > 0.3) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (busy === 'job' && J && fox) JW(fox, J.g); if (!G.visible) return;
    if (busy === 'job' && J) jobTick(dt, P); hintTick(t);
    Object.values(cfox).forEach(f => f.visible && kit.animFox(f, dt, 0, false));
    K.tick(dt, P, { inShop: inRoom(P), busy: !!busy, near, talking: false }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy || JJ.busy(), active: () => !!busy || JJ.active(), toast: () => (toastT > 0 ? toastTxt : '') || JJ.toast(), JJ, job: () => J, start: (g, P) => startGame(g, P || lastP), ace, GD, RINGS, useItem: () => false,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    snap() { snapK = true; }, _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) jobTick(dt, lastP); }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), card, dispose() { card.remove(); HINT.remove(); K.dispose(); JJ.dispose(); LF.dispose(); }, PZ, LF };
  window.__boatJobs = API; return API;
}
