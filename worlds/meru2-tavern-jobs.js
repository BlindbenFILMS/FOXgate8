// MERU 2.0 — s87 TAVERN DELUXE PART A (Ben's answers s86): the BARKEEP (the 2D tavern's keeper, key tavernGuard: apron, behind the bar in line with the door),
// shop kit (NOW HIRING by the door, BEST board + clock on the front wall, chime, light), POOL vs ZIGGY (Tavern Pool from the 3D-foxgate8 repo,
// minigames/tavern-pool/Main.dc.html?world=meru, opened in the game panel) and the first 5 jobs:
// POUR DRINKS (tap the right dispenser, hold to pour, let go on the white line) · SERVE THE TABLES (walk: tray, E at each table that ordered)
// · WIPE + MOP (drag the cloth / mop over the spills, mind the candle) · BRING IN LOGS (walk: back-door log rack → the basket by the fire, 3 trips)
// · RACK THE TABLE (tap the balls into the triangle: the black in the middle, the back corners one red + one blue).
// Built in the tavern's ORIGINAL frame (f 12..52 × -100..-60, the layout from Tavern Workshop = rooms.tavern.layout); meru2-walk.js adds API.group to the
// tavern's moved group (RL.MV 'tavern') like the apartments. Drinks (Ben): MERU AMBER for grown-ups, JUICE + COCOA for kids.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { BACK_DOORS } from './meru2-layout.js';
import { gamesB, tavJobsB } from './meru2-tavern-jobs2.js';
import { gamesF, tavFun } from './meru2-tavern-fun.js?v=s645';   // s89 part B2: darts match vs Flick + karaoke stage
import { tvPrizes } from './meru2-tavern-prize.js';
import { tvTrade } from './meru2-tavern-trade.js?v=s602';   // s602 TAVERN TRADERS: notice board + MILO
import { tvLife } from './meru2-tavern-life.js?v=s645';   // s89 part C2: night crowd, piano, kitchen hatch, cellar barrels, beer-garden patrons   // s89 part C1: prizes, drinks, trophy wall, chalkboard, keeper at work   // s89 part B2: darts match vs Flick + karaoke stage   // s88 part B: keg, restock, the Regular, darts score, cellar rats
const RAD = a => (a || 0) * Math.PI / 180;
const toWo = (o, lx, lz) => { const r = RAD(o.a), c = Math.cos(r), s = Math.sin(r); return [o.x + lx * c + lz * s, o.z - lx * s + lz * c]; };
export const POOL_URL = 'minigames/tavern-pool/Main.dc.html?world=meru&embed=1';
const KP = { name: 'Barkeep', role: 'TAVERN', color: '#8a6a42', torso: ['#f6efe0', '#d9c8a8', '#8a6a42'],
  hello: ['Every night is busy since the gala. Want work? I always need hands.', 'Back again? The glasses will not fill themselves.', 'Good timing. Pick a job.', 'Keeping the glasses full. Help me out?'],
  open: ['Good work.', 'Smooth as Amber.', 'The room noticed.', 'That is how it is done.'],
  tips: ['Meru Amber. Five gold. Brewed under the castle where the water runs cold.', 'Anyone offering you the Luxor stuff is no friend.', 'Board is free, and the jukebox takes no coin. So people talk.',
    'Stop the pour on the white line. Spill it and you pour again.', 'Kids get juice or cocoa. Never the Amber.', 'Black ball in the middle of the rack. Back corners: one red, one blue.', 'Mind the candle when you wipe a table.', 'The logs are out the back door, on the deck.'] };
const DRINK = { amber: { n: 'MERU AMBER', c: '#d99a2b', top: '#fff6dc' }, juice: { n: 'APPLE JUICE', c: '#f2b632', top: '#f7d36a' }, cocoa: { n: 'HOT COCOA', c: '#6b3d22', top: '#f3e6d6' } };
const GROWN = ['OLD GORSE', 'CAPTAIN RUSK', 'MAGGIE', 'BRAM', 'SILT', 'AUNT FERN'], KIDS = ['LITTLE PIP', 'TANSY', 'NIBS', 'WREN'];
export function buildTavernJobs({ THREE, scene, kit, cols, save, tav, touch, sayTo, camera, hour, isMuted, openPlay, cast, heal, wear }) {
  const L = tav.layout, R0 = { X0: 12, X1: 52, Z0: -100, Z1: -60 }, DOOR = [32, -60];
  const G = new THREE.Group(); G.name = 'tavernJobs'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const toW = v => { G.updateWorldMatrix(true, false); return G.localToWorld(v.clone()); };
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 12) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const at = (o, lx, lz, y = 0, dYaw = 0) => { const g = new THREE.Group(), [x, z] = toWo(o, lx, lz); g.position.set(x, y, z); g.rotation.y = RAD(o.a) + dYaw; G.add(g); return g; };
  const ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', BRASS = '#e0a84a';
  const label = (txt, bg, fg, w = 256, h = 64) => CT(w, h, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W2 - 24, Math.round(H * 0.56)); });
  const plane = (par, map, w, h, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  // ================= the BARKEEP (behind the bar, in line with the door) =================
  const BAR = L.bar, BY = RAD(BAR.a), KX = DOOR[0] - BAR.x;
  const keeper = kit.makeFox({ key: 'tvKeep', torso: KP.torso, outfit: 'vest', mood: 'happy', look: { fur: '#c97a3a', furDark: '#8a4a1e' } });
  { const [x, z] = toWo(BAR, KX, -1.45); keeper.position.set(x, 0, z); keeper.rotation.y = BY; G.add(keeper); ring(x, z, 0.45); }
  { const P0 = keeper.userData && keeper.userData.P; if (P0 && P0.body) { const ap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.62, 0.04), LM('#6b4a2a')); ap.position.set(0, 0.42, 0.29); P0.body.add(ap); }
    if (P0 && P0.arms && P0.arms[0]) { const tw = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.04), LM(WHITE)); tw.position.set(0, -0.44, 0.06); P0.arms[0].add(tw); } }
  const kT = { key: 'tvKeep', name: KP.name, role: KP.role, obj: keeper, ry: BY, r: 6 };
  const ln = text => ({ who: 'tvKeep', role: KP.role, text });
  // ================= ZIGGY + the pool table (Tavern Pool's Meru shark) =================
  const PO = L.pool, PH = [1.42, 2.55], PS = 1.7 * 1.33, PY = 1.05, BR = 0.032 * PS;
  const ziggy = kit.makeFox({ key: 'tvZiggy', torso: ['#3a6ea5', '#fbf8ec', '#22446e'], outfit: 'vest', mood: 'smug', look: { fur: '#c9682a', furDark: '#8a4213' } });
  if (PO) { const [x, z] = toWo(PO, -(PH[0] + 0.75), 1.3); ziggy.position.set(x, 0, z); ziggy.rotation.y = RAD(PO.a) + Math.PI / 2; G.add(ziggy); ring(x, z, 0.45);
    const cue = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, 1.45, 6), LM('#e6c27a')); cue.position.set(0.32, 0.72, 0.12); cue.rotation.z = 0.08; ziggy.add(cue); }
  const nearPool = P => { if (!PO || Math.abs(P.y || 0) > 1.5) return false; const [zx, zz] = [ziggy.position.x, ziggy.position.z]; if (Math.hypot(P.x - zx, P.z - zz) < 1.8) return true; const r = -RAD(PO.a), dx = P.x - PO.x, dz = P.z - PO.z, lx = dx * Math.cos(r) + dz * Math.sin(r), lz = -dx * Math.sin(r) + dz * Math.cos(r); return Math.abs(lx) < PH[0] + 0.7 && Math.abs(lz) < PH[1] + 0.7; };
  // ================= job rings + their props =================
  const tdist = T => Math.hypot(T.x - (BAR.x - 3), T.z - (BAR.z + 7));
  const WT = (L.tables || []).slice().sort((a, b) => tdist(a) - tdist(b))[0] || { x: 27, z: -88, a: 0 };
  const FP = L.fireplace || { x: 12.45, z: -81, a: 90 };
  const BD = BACK_DOORS.tavern && !/[?&]backdoors=0/.test(location.search) ? BACK_DOORS.tavern.door : null;
  const RACKP = BD ? [BD[0] - 1.6, BD[1] - 1.7] : [R0.X1 - 2.2, R0.Z0 + 2.2];
  const BASK = toWo(FP, 2.7, 1.0);
  const RINGS = { pour: toWo(BAR, 8, 2.6), serve: toWo(BAR, -6, 2.6), wipe: (() => { const a = Math.atan2(DOOR[0] - WT.x, DOOR[1] - WT.z); return [WT.x + Math.sin(a) * 2.6, WT.z + Math.cos(a) * 2.6]; })(),
    logs: [BASK[0] + 1.3, BASK[1] + 0.2], rack: PO ? toWo(PO, 0, -(PH[1] + 0.85)) : [28, -82.4] };
  for (const k in RINGS) { const [x, z] = RINGS[k]; const r1 = cyl(G, 0.5, 0.5, 0.012, YEL, x, 0.085, z, 22), r2 = cyl(G, 0.42, 0.42, 0.014, INK, x, 0.087, z, 22); r1.renderOrder = r2.renderOrder = 1; }
  // drink station on the bar (east of the old taps): AMBER tap tower · JUICE jug · COCOA urn
  const DSX = { amber: 7.2, juice: 8.0, cocoa: 8.8 }, DISP = {};
  for (const k of ['amber', 'juice', 'cocoa']) { const g = at(BAR, DSX[k], -0.3, 1.26);
    if (k === 'amber') { box(g, 0.3, 0.06, 0.24, BRASS, 0, 0.03, 0); cyl(g, 0.05, 0.05, 0.42, BRASS, 0, 0.25, 0, 8); box(g, 0.05, 0.05, 0.22, BRASS, 0, 0.44, 0.1); box(g, 0.05, 0.22, 0.05, '#d99a2b', 0, 0.58, -0.02); }
    else if (k === 'juice') { box(g, 0.3, 0.1, 0.26, INK, 0, 0.05, 0); const j = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.34, 14), new THREE.MeshLambertMaterial({ color: '#f2b632', transparent: true, opacity: 0.8 })); j.position.y = 0.28; g.add(j); cyl(g, 0.125, 0.125, 0.03, INK, 0, 0.46, 0, 14); box(g, 0.04, 0.04, 0.1, INK, 0, 0.14, 0.15); }
    else { box(g, 0.3, 0.06, 0.26, INK, 0, 0.03, 0); cyl(g, 0.13, 0.12, 0.36, '#b8733f', 0, 0.24, 0, 14); const lid = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 6, 0, 6.3, 0, 1.4), LM('#b8733f')); lid.position.y = 0.42; g.add(lid); box(g, 0.04, 0.04, 0.12, '#5a3d26', 0, 0.12, 0.16); }
    plane(g, label(DRINK[k].n, INK, k === 'amber' ? YEL : WHITE, 256, 56), 0.36, 0.08, 0, 0.1, 0.135); DISP[k] = g; }
  const PATRON = kit.makeFox({ key: 'tvBarP', torso: ['#3f7a52', '#e9dcc4', '#22382a'], outfit: 'coat', mood: 'happy' }), KID = kit.makeFox({ key: 'tvBarK', torso: ['#f472b6', '#ffd23a', '#7a2a5a'], outfit: 'vest', mood: 'excited' });
  for (const f of [PATRON, KID]) { const [x, z] = toWo(BAR, 8, 1.8); f.position.set(x, 0, z); f.rotation.y = BY + Math.PI; f.visible = false; G.add(f); } KID.scale.multiplyScalar(0.74);
  // the log rack (outside the back door, on the deck) + the basket by the fire
  { const g = new THREE.Group(); g.position.set(RACKP[0], 0, RACKP[1]); G.add(g); box(g, 1.5, 0.08, 0.6, '#5a3d26', 0, 0.06, 0); for (const s of [-1, 1]) box(g, 0.08, 1.1, 0.6, '#5a3d26', s * 0.72, 0.55, 0);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - (r & 1); i++) { const lg = cyl(g, 0.11, 0.11, 0.58, '#8a5a3a', -0.48 + i * 0.32 + (r & 1) * 0.16, 0.22 + r * 0.21, 0, 8); lg.rotation.x = Math.PI / 2; }
    plane(g, label('FIREWOOD', INK, YEL, 256, 64), 0.6, 0.15, 0, 1.0, 0.31); ring(RACKP[0], RACKP[1], 0.7); }
  const BSK = new THREE.Group(); BSK.position.set(BASK[0], 0, BASK[1]); G.add(BSK); cyl(BSK, 0.42, 0.34, 0.42, '#b8864f', 0, 0.21, 0, 14); cyl(BSK, 0.44, 0.44, 0.04, '#8a6440', 0, 0.42, 0, 14); ring(BASK[0], BASK[1], 0.48);
  const BLOGS = []; for (let i = 0; i < 6; i++) { const lg = cyl(BSK, 0.08, 0.08, 0.62, '#8a5a3a', (i % 3 - 1) * 0.17, 0.5 + (i / 3 | 0) * 0.15, 0, 8); lg.rotation.x = Math.PI / 2; lg.rotation.z = (i % 2) * 0.2; lg.visible = false; BLOGS.push(lg); }
  const basketN = () => save.stat('tvLogs', 2); const showLogs = () => BLOGS.forEach((l, i) => { l.visible = i < basketN(); }); showLogs();
  // ================= shop kit =================
  const GAMES = [{ k: 'pour', name: 'Pour Drinks', color: '#d99a2b', grp: 'bar' }, { k: 'serve', name: 'Serve the Tables', color: RED, walk: true, grp: 'bar' }, { k: 'wipe', name: 'Wipe + Mop', color: '#2f6fd6', grp: 'bar' }, { k: 'logs', name: 'Bring In Logs', color: '#8a5a3a', walk: true, grp: 'back' }, { k: 'rack', name: 'Rack the Table', color: '#1d6b4c', grp: 'back' }, ...gamesB()];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), pre = 'tv';
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: pre, color: KP.color, boardTitle: "Barkeep's best", toWorld: toW, room: R0, door: [DOOR[0], DOOR[1] - 0.5], keeper, keeperRy: BY, games: GAMES,
    board: { x: 26, y: 3.4, z: -60.32, ry: Math.PI, w: 1.3 }, hiring: { x: 35.2, y: 0, z: -63, ry: -Math.PI / 2 }, hiringLine: 'WALK UP \u00b7 START WORK',
    sun: [{ x: 21, z: -63.5, w: 2.6, d: 2.6 }, { x: 43, z: -63.5, w: 2.6, d: 2.6 }], lamps: (L.lanterns || []).slice(0, 8).map(q => [q.x, 4.6, q.z]),
    browse: [[...toWo(BAR, -3, 2.0), BY + Math.PI], [...toWo(BAR, 4, 2.0), BY + Math.PI], [WT.x + 1.6, WT.z + 1.6, -2.4], [(L.tables[3] || WT).x - 1.6, (L.tables[3] || WT).z + 1.4, 2.3]], slots: 2,
    clock: { x: 38, y: 3.4, z: -60.32, ry: Math.PI } });
  // ================= state, sound, card UI =================
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, thanks = null, lastP = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at0 = 0) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at0, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = bf; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), coin = (a = 0) => { tone(2400, 0.04, 0.15, 'triangle', a); tone(3200, 0.03, 0.12, 'triangle', a + 0.03); };
  const clack = () => { tone(1800, 0.06, 0.05, 'square'); tone(900, 0.03, 0.06, 'triangle', 0.02); }, glug = () => tone(220 + Math.random() * 80, 0.03, 0.08, 'sine'), thud = () => { tone(120, 0.08, 0.2, 'square'); noise(0.12, 0.03, 800); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + KP.color + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = (next, walk) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (walk ? 'RING \u00b7 STOP' : (touch ? '3' : 'SPACE') + ' \u00b7 STOP') + '</span></div>';
  const lst = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + items.map(([sw, t, r, ok]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (r ? ' \u00b7 ' + r : '') + '</span>').join('') + '</div>' : items.map(a => row(...a)).join('');
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>';
  const pourBar = (f, c) => '<div style="position:relative;height:18px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:0;top:0;bottom:0;width:' + (clamp(f, 0, 1.05) / 1.05 * 100).toFixed(1) + '%;background:' + c + '"></div><div style="position:absolute;top:-2px;bottom:-2px;left:' + (0.8 / 1.05 * 100).toFixed(1) + '%;width:' + (0.14 / 1.05 * 100).toFixed(1) + '%;border-left:3px solid #fff;border-right:3px solid #fff;box-shadow:0 0 0 1px #201e1d"></div></div>';
  const setCard = (k, html) => { if (k === cardKey) return; cardKey = k; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ---------- input (tap jobs) ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && J && !GN[J.g].walk;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), TAPR = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(toW(v)).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = V(), inv = new THREE.Matrix4();
  const ray = () => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); G.updateWorldMatrix(true, false); inv.copy(G.matrixWorld).invert(); return rc.ray.clone().applyMatrix4(inv); };
  const hitY = y => (ray().intersectPlane(new THREE.Plane(V(0, 1, 0), -y), hitP) ? hitP.clone() : null);
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const Fq of J.flies.slice()) { Fq.t += dt / Fq.dur; const k = Math.min(1, Fq.t), e = k * k * (3 - 2 * k); Fq.obj.position.lerpVectors(Fq.from, Fq.to, e); Fq.obj.position.y += Math.sin(k * Math.PI) * Fq.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(Fq), 1); Fq.then && Fq.then(); } } }
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt + bg] || (tagTex[txt + bg] = CT(128, 96, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = '900 60px Archivo, sans-serif'; g.fillText(txt, W2 / 2, H / 2 + 3); }));
  const tagSprite = (txt, bg = '#ffffff', fg = INK, s = 0.5) => { if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: false })); sp.scale.set(s, s * 0.75, 1); sp.renderOrder = 6; return sp; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (after, t = 1.0) => { J.pause = t; J.after = after; };
  const arrowM = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: RED })); arrowM.rotation.x = Math.PI; arrowM.visible = false; arrowM.renderOrder = 5; G.add(arrowM);
  const beacon = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 24), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.8, depthWrite: false })); beacon.rotation.x = -Math.PI / 2; beacon.visible = false; G.add(beacon);
  const done = () => save.stat(pre + 'Done', null) || {};
  const KEEP = () => KP.name.toUpperCase();
  // ================= JOB 1: POUR DRINKS (tap) =================
  const glassG = new THREE.Group(); glassG.visible = false; G.add(glassG);
  const fillGeo = new THREE.CylinderGeometry(0.072, 0.064, 1, 14); fillGeo.translate(0, 0.5, 0);
  const fillM = new THREE.MeshLambertMaterial({ color: '#d99a2b' }), FILL = new THREE.Mesh(fillGeo, fillM); FILL.position.y = 0.012; glassG.add(FILL);
  const foamM = new THREE.MeshLambertMaterial({ color: '#fff6dc' }), FOAM = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.074, 0.03, 14), foamM); glassG.add(FOAM);
  { const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.27, 16, 1, true), new THREE.MeshLambertMaterial({ color: '#dff1f7', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); gl.position.y = 0.135; gl.renderOrder = 3; glassG.add(gl);
    const bt = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 16), new THREE.MeshLambertMaterial({ color: '#dff1f7', transparent: true, opacity: 0.6 })); bt.position.y = 0.006; glassG.add(bt);
    const line = new THREE.Mesh(new THREE.TorusGeometry(0.086, 0.005, 4, 24), new THREE.MeshBasicMaterial({ color: '#ffffff' })); line.rotation.x = Math.PI / 2; line.position.y = 0.012 + 0.87 * 0.24; glassG.add(line); }
  const setLvl = (lv, k) => { const h = Math.max(0.001, Math.min(1.0, lv) * 0.24); FILL.scale.y = h; FOAM.position.y = 0.012 + h + 0.012; FOAM.visible = lv > 0.05; fillM.color.set(DRINK[k || 'amber'].c); foamM.color.set(DRINK[k || 'amber'].top); };
  const glassAt = k => { const [x, z] = toWo(BAR, DSX[k], 0.02); return V(x, 1.265, z); }, glassHome = () => { const [x, z] = toWo(BAR, 8, 0.38); return V(x, 1.265, z); };
  const G1 = {
    begin() { J.orders = [...Array(6)].map((_, i) => { const kid = Math.random() < 0.35; const d = kid ? (Math.random() < 0.5 ? 'juice' : 'cocoa') : (Math.random() < 0.6 ? 'amber' : Math.random() < 0.5 ? 'juice' : 'cocoa'); return { who: kid ? KIDS[(Math.random() * KIDS.length) | 0] : GROWN[(Math.random() * GROWN.length) | 0], kid, d }; }); J.i = 0; this.next(); toast('TAP THE RIGHT DRINK \u00b7 HOLD TO POUR \u00b7 LET GO ON THE WHITE LINE', 3); },
    next() { const o = J.orders[J.i]; if (!o) return; J.sel = null; J.lv = 0; J.pour = false; PATRON.visible = !o.kid; KID.visible = o.kid; glassG.visible = true; glassG.position.copy(glassHome()); glassG.scale.setScalar(1); setLvl(0, o.d); },
    pick() { let best = null, bd = TAPR() * 1.6; for (const k in DISP) { const g = DISP[k]; const s = scrW(V(g.position.x, 1.55, g.position.z)), d = dist(s); if (d < bd) { bd = d; best = k; } } return best; },
    press() { const o = J.orders[J.i]; if (!o || J.flies.length) return; const k = this.pick(); if (!k) { if (J.sel) J.pour = true; return; }
      if (k !== o.d) { miss(o.kid && k === 'amber' ? KEEP() + ': "NOT FOR KIDS! JUICE OR COCOA."' : o.who + ' WANTS ' + DRINK[o.d].n + '.', 2); return; }
      if (J.sel !== k) { J.sel = k; fly(glassG, glassAt(k), 0.25, 0.04, () => { if (J && ptr.down) J.pour = true; }); clack(); return; } J.pour = true; },
    release() { if (!J.pour) return; J.pour = false; const o = J.orders[J.i]; if (!o) return;
      if (J.lv < 0.8) { if (J.lv > 0.02) toast('A LITTLE MORE \u00b7 HOLD AGAIN', 1.4); return; }
      const good = J.lv <= 0.94; if (good) { addGold(o.d === 'amber' ? 5 : 3); coin(); } else { addGold(1); toast(o.who + ': "BIT FULL!"', 1.4); }
      const [x, z] = toWo(BAR, 8, 0.48); fly(glassG, V(x, 1.265, z), 0.35, 0.05, () => { if (!J) return; pop(); J.i++; if (J.i >= J.orders.length) { ding(); NEXT(finishGame, 0.9); } else NEXT(() => this.next(), 0.6); }); J.sel = null; },
    tick(dt) { const o = J.orders[J.i]; if (!o || !J.pour || !J.sel) return; J.lv += dt * (touch ? 0.42 : 0.5); if ((J.gl = (J.gl || 0) - dt) <= 0) { J.gl = 0.12; glug(); } setLvl(J.lv, o.d);
      if (J.lv > 1.02) { J.pour = false; miss(KEEP() + ': "SPILT! FRESH GLASS."', 1.8); noise(0.4, 0.04, 900); J.sel = null; J.lv = 0; setLvl(0, o.d); glassG.position.copy(glassHome()); } },
    card() { const o = J.orders[J.i]; if (!o) return ['NICE', lab('ALL SERVED'), 'end']; return [J.sel ? (J.pour ? 'LET GO ON THE WHITE LINE' : 'HOLD TO POUR') : 'TAP ' + DRINK[o.d].n, lab((J.i + 1) + ' / ' + J.orders.length + ' \u00b7 ' + o.who + (o.kid ? ' (KID)' : '')) + row(DRINK[o.d].c, DRINK[o.d].n, '', false) + pourBar(J.lv, DRINK[o.d].c), J.i + (J.sel || '') + (J.pour ? 'p' : '') + Math.round(J.lv * 20)]; },
    hint() { const o = J.orders[J.i]; if (!o) return null; if (!J.sel) { const g = DISP[o.d]; return [V(g.position.x, 1.55, g.position.z), 'TAP ' + DRINK[o.d].n]; } return J.pour ? null : [V(glassG.position.x, 1.45, glassG.position.z), 'HOLD']; },
    shot() { const [x, z] = toWo(BAR, 8, 0.2); return [V(x, 1.42, z), 3.0, 1.7, 0.36, 2.2, BY, 4.5]; },
    end() { glassG.visible = false; PATRON.visible = KID.visible = false; } };
  // ================= JOB 2: SERVE THE TABLES (walk) =================
  const TRAY = new THREE.Group(); { box(TRAY, 0.5, 0.03, 0.36, '#9aa0a6', 0, 0, 0); } TRAY.visible = false; G.add(TRAY);
  const TRAYM = []; for (let i = 0; i < 3; i++) { const m = cyl(TRAY, 0.05, 0.045, 0.13, '#d99a2b', -0.15 + i * 0.15, 0.08, 0, 10); TRAYM.push(m); }
  const SEAT = [kit.makeFox({ key: 'tvSeat1', torso: ['#8f3445', '#e9dcc4', '#3d1a22'], outfit: 'coat', mood: 'happy' }), kit.makeFox({ key: 'tvSeat2', torso: ['#2e4a6b', '#f3f2f2', '#1a2a3e'], outfit: 'suit', mood: 'happy' }), kit.makeFox({ key: 'tvSeat3', torso: ['#ffd23a', '#5c6670', INK], outfit: 'vest', mood: 'excited' })];
  SEAT.forEach(f => { f.visible = false; G.add(f); });
  const TB = (L.tables || []).map((T, i) => ({ T, n: i + 1 }));
  const nearTable = P => { let b = null, bd = 2.3; for (const q of TB) { const d = Math.hypot(P.x - q.T.x, P.z - q.T.z); if (d < bd) { bd = d; b = q; } } return b; };
  const G2 = { walk: true,
    begin() { const pick = shuffle(TB.slice()).slice(0, 3); J.list = pick.map((q, i) => ({ q, d: ['amber', 'juice', 'cocoa'][(Math.random() * 3) | 0], got: false, f: SEAT[i] }));
      J.list.forEach((it, i) => { const T = it.q.T, a = 0.4 + RAD(T.a), cx = T.x + Math.sin(a) * 1.25, cz = T.z + Math.cos(a) * 1.25; it.f.position.set(cx, 0, cz); it.f.rotation.y = a + Math.PI; it.f.visible = true; TRAYM[i].material = LM(DRINK[it.d].c); TRAYM[i].visible = true; });
      J.tags = TB.map(q => { const on = J.list.some(it => it.q === q), t = own(tagSprite(String(q.n), on ? YEL : WHITE, INK, on ? 0.55 : 0.4)); t.position.set(q.T.x, 2.3, q.T.z); t.userData.q = q; return t; });
      TRAY.visible = true; toast('THREE ORDERS \u00b7 WALK TO EACH TABLE \u00b7 E TO SERVE', 2.8); pop(); },
    tick() { const P = J.P; if (!P) return; const yw = P.yaw || 0; TRAY.position.set(P.x + Math.sin(yw) * 0.45, (P.y || 0) + 1.15, P.z + Math.cos(yw) * 0.45); TRAY.rotation.y = yw; },
    goal() { const P = J.P, rest = J.list.filter(it => !it.got); if (!rest.length) return null; let b = rest[0], bd = 1e9; for (const it of rest) { const d = Math.hypot(P.x - it.q.T.x, P.z - it.q.T.z); if (d < bd) { bd = d; b = it; } } return J.t > 6 ? [b.q.T.x, b.q.T.z, 1.0] : null; },
    prompt(P) { const q = nearTable(P); if (!q) return null; const it = J.list.find(x => x.q === q); return it && !it.got ? 'SERVE \u00b7 TABLE ' + q.n + ' \u00b7 ' + DRINK[it.d].n : 'TABLE ' + q.n; },
    talk(P) { const q = nearTable(P); if (!q) return false; const it = J.list.find(x => x.q === q);
      if (!it) { miss('TABLE ' + q.n + ' DID NOT ORDER \u00b7 CHECK THE CARD', 1.8); return true; } if (it.got) { toast('TABLE ' + q.n + ' \u00b7 ALREADY SERVED', 1.2); return true; }
      it.got = true; coin(); addGold(5); TRAYM[J.list.indexOf(it)].visible = false; const tg = J.tags.find(t => t.userData.q === q); if (tg) tg.visible = false; const left = J.list.filter(x => !x.got).length;
      toast(left ? 'TABLE ' + q.n + ' SAYS CHEERS \u00b7 ' + left + ' TO GO' : 'ALL SERVED!', 1.6); if (!left) { ding(); finishGame(); } return true; },
    card() { return ['WALK \u00b7 E AT THE TABLE', lst(J.list.map(it => [DRINK[it.d].c, 'TABLE ' + it.q.n, it.got ? '\u2713' : DRINK[it.d].n, it.got])), J.list.map(it => +it.got).join('')]; },
    end() { TRAY.visible = false; SEAT.forEach(f => { f.visible = false; }); } };
  // ================= JOB 3: WIPE + MOP (drag) =================
  const spillT = CT(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 4, 32, 32, 31); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.7, 'rgba(255,255,255,0.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, rr = 24 + (i % 3) * 5; g.lineTo(32 + Math.cos(a) * rr, 32 + Math.sin(a) * rr); } g.fill(); });
  const CLOTH = new THREE.Group(); box(CLOTH, 0.26, 0.04, 0.18, '#5fb0d6', 0, 0.02, 0); CLOTH.visible = false; G.add(CLOTH);
  const MOP = new THREE.Group(); { const h = cyl(MOP, 0.018, 0.018, 1.3, '#8a6440', 0, 0.68, 0, 6); h.rotation.z = 0.25; box(MOP, 0.36, 0.06, 0.16, WHITE, 0, 0.03, 0); } MOP.visible = false; G.add(MOP);
  const TOPY = 1.005, FLY = 0.09;
  const G3 = {
    begin() { const T = WT, ca = 0.4 + RAD(T.a); J.sp = [];
      for (let i = 0; i < 3; i++) { const a = i * 2.1 + 0.6, r = 0.45; J.sp.push({ x: T.x + Math.cos(a) * r, z: T.z + Math.sin(a) * r, y: TOPY, r: 0.17 }); }
      for (let i = 0; i < 3; i++) { const a = ca + i * 2.094 + 1.047, r = rnd(1.7, 2.1); J.sp.push({ x: T.x + Math.sin(a) * r, z: T.z + Math.cos(a) * r, y: FLY, r: 0.34 }); }
      J.sp.forEach((s, i) => { const k = ['amber', 'juice', 'cocoa'][i % 3]; const m = own(new THREE.Mesh(new THREE.PlaneGeometry(s.r * 2, s.r * 2), new THREE.MeshBasicMaterial({ map: spillT, color: DRINK[k].c, transparent: true, depthWrite: false, opacity: 0.85 }))); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * 6; m.position.set(s.x, s.y + 0.004, s.z); m.renderOrder = 3; s.m = m; s.d = 1; });
      J.cd = 0; toast('DRAG OVER THE SPILLS \u00b7 TABLE TOP + FLOOR \u00b7 MIND THE CANDLE', 2.8); },
    press() { J.lp = null; },
    drag() { if (!ptr.down) return; let p = hitY(TOPY), top = p && Math.hypot(p.x - WT.x, p.z - WT.z) < 0.84; if (!top) p = hitY(FLY); if (!p) return;
      CLOTH.visible = !!top; MOP.visible = !top; (top ? CLOTH : MOP).position.set(p.x, top ? TOPY : FLY, p.z);
      if (top && Math.hypot(p.x - WT.x, p.z - WT.z) < 0.12 && J.cd <= 0) { J.cd = 1.5; miss(KEEP() + ': "MIND THE CANDLE!"', 1.6); }
      const mv = J.lp ? Math.hypot(p.x - J.lp.x, p.z - J.lp.z) : 0; J.lp = p; if (mv < 0.003) return; (top ? CLOTH : MOP).rotation.y += mv * 4; if ((J.sw = (J.sw || 0) + mv) > 0.3) { J.sw = 0; noise(0.12, 0.018, 3500); }
      for (const s of J.sp) { if (s.d <= 0 || Math.abs(s.y - (top ? TOPY : FLY)) > 0.2 || Math.hypot(p.x - s.x, p.z - s.z) > s.r + 0.12) continue; s.d -= mv * (top ? 2.6 : 1.5); s.m.material.opacity = Math.max(0, s.d) * 0.85; if (s.d <= 0) { s.m.visible = false; pop(); addGold(2); } }
      if (J.sp.every(s => s.d <= 0) && !J.pause) { ding(); NEXT(finishGame, 0.9); } },
    release() { J.lp = null; },
    tick(dt) { J.cd -= dt; },
    card() { const n = J.sp.filter(s => s.d > 0).length; return ['DRAG ON THE SPILLS', lst([['#d99a2b', 'TABLE', J.sp.filter(s => s.d > 0 && s.y > 0.5).length + ' LEFT', !J.sp.some(s => s.d > 0 && s.y > 0.5)], ['#2f6fd6', 'FLOOR', J.sp.filter(s => s.d > 0 && s.y < 0.5).length + ' LEFT', !J.sp.some(s => s.d > 0 && s.y < 0.5)], [RED, 'CANDLE', 'MIND IT', false]]), 'w' + n]; },
    hint() { const s = J.sp.find(q => q.d > 0); return s ? [V(s.x, s.y, s.z), 'RUB'] : null; },
    shot() { const a = Math.atan2(DOOR[0] - WT.x, DOOR[1] - WT.z); return [V(WT.x, 0.55, WT.z), 5.2, 4.4, 0.98, 3.4, a, 8]; },
    end() { CLOTH.visible = MOP.visible = false; } };
  // ================= JOB 4: BRING IN LOGS (walk, 3 trips) =================
  const CARRY = new THREE.Group(); for (const s of [-1, 1]) { const lg = cyl(CARRY, 0.09, 0.09, 0.6, '#8a5a3a', s * 0.1, 0, 0, 8); lg.rotation.z = Math.PI / 2; } CARRY.visible = false; G.add(CARRY);
  const nearRack = P => Math.hypot(P.x - RACKP[0], P.z - RACKP[1]) < 1.6, nearBasket = P => Math.hypot(P.x - BASK[0], P.z - BASK[1]) < 1.7;
  const G4 = { walk: true, zone: 'deck',
    begin() { J.trips = 0; J.carry = false; save.setStat('tvLogs', 0); showLogs(); toast('THE FIRE IS LOW \u00b7 LOGS ARE OUT THE BACK DOOR', 2.8); pop(); },
    tick() { const P = J.P; if (!P) return; CARRY.visible = J.carry; if (J.carry) { const yw = P.yaw || 0; CARRY.position.set(P.x + Math.sin(yw) * 0.4, (P.y || 0) + 1.05, P.z + Math.cos(yw) * 0.4); CARRY.rotation.y = yw; } if (J.t > 100 && !J.slow) { J.slow = true; J.miss++; } },
    goal() { return J.carry ? [BASK[0], BASK[1], 0] : [RACKP[0], RACKP[1], 0]; },
    prompt(P) { if (!J.carry && nearRack(P)) return 'PICK UP \u00b7 2 LOGS'; if (J.carry && nearBasket(P)) return 'DROP \u00b7 IN THE BASKET'; return null; },
    talk(P) { if (!J.carry && nearRack(P)) { J.carry = true; thud(); toast('TO THE FIREPLACE', 1.4); return true; }
      if (J.carry && nearBasket(P)) { J.carry = false; J.trips++; thud(); addGold(5); save.setStat('tvLogs', Math.min(6, J.trips * 2)); showLogs(); const left = 3 - J.trips; toast(left ? 'THE FIRE PERKS UP \u00b7 ' + left + ' MORE' : 'ROARING!', 1.6); if (!left) { ding(); finishGame(); } return true; } return false; },
    card() { return [J.carry ? 'TO THE BASKET BY THE FIRE' : 'OUT THE BACK DOOR \u00b7 THE LOG RACK', lab('TRIPS ' + J.trips + ' / 3') + lst([['#8a5a3a', 'LOGS IN', String(J.trips * 2), J.trips >= 3]]), J.trips + (J.carry ? 'c' : '')]; },
    end() { CARRY.visible = false; } };
  // ================= JOB 5: RACK THE TABLE (tap) =================
  const BALLC = { r: '#e0442a', b: '#2f6fd8', k: '#17161a' };
  const ballGeo = new THREE.SphereGeometry(BR, 14, 10);
  const slotPos = k => { let r = 0, i = k; while (i > r) { i -= r + 1; r++; } const x = (i - r / 2) * BR * 2.02, z = -0.5 * PS - r * BR * 1.75; const [wx, wz] = toWo(PO, x, z); return V(wx, PY + BR, wz); };
  const TRI = new THREE.Group(); TRI.visible = false; G.add(TRI);
  if (PO) { const rr = BR * 2.02, side = 5 * rr, h = side * 0.866, [ax, az] = toWo(PO, 0, -0.5 * PS + BR * 1.2); TRI.position.set(ax, PY + 0.03, az); TRI.rotation.y = RAD(PO.a);
    const bar = (x0, z0, x1, z1) => { const m = box(TRI, 0.04, 0.05, Math.hypot(x1 - x0, z1 - z0), '#6b4a2a', (x0 + x1) / 2, 0, (z0 + z1) / 2); m.rotation.y = Math.atan2(x1 - x0, z1 - z0); };
    bar(0, 0, -side / 2, -h * 1.02); bar(0, 0, side / 2, -h * 1.02); bar(-side / 2, -h * 1.02, side / 2, -h * 1.02); }
  let rackMesh = null;
  const G5 = {
    begin() { rackMesh = rackMesh || scene.getObjectByName('poolRack'); if (rackMesh) rackMesh.visible = false; const cols0 = shuffle([...Array(7).fill('r'), ...Array(7).fill('b'), 'k']); J.balls = [];
      for (const c of cols0) { let x, z, ok = false; for (let n = 0; n < 40 && !ok; n++) { x = rnd(-PS / 2 + 0.15, PS / 2 - 0.15); z = rnd(0.05, PS - 0.2); ok = J.balls.every(b => Math.hypot(b.lx - x, b.lz - z) > BR * 2.6); }
        const m = own(new THREE.Mesh(ballGeo, LM(BALLC[c]))); const [wx, wz] = toWo(PO, x, z); m.position.set(wx, PY + BR, wz); J.balls.push({ c, m, lx: x, lz: z, in: false }); }
      J.slot = 0; J.slots = []; TRI.visible = true; toast('TAP THE BALLS INTO THE TRIANGLE \u00b7 BLACK IN THE MIDDLE', 2.8); },
    press() { if (J.flies.length > 2 || J.slot >= 15) return; let b = null, bd = TAPR() * 1.2; for (const q of J.balls) { if (q.in) continue; const d = dist(scrW(q.m.position)); if (d < bd) { bd = d; b = q; } } if (!b) return;
      const s = J.slot; if (b.c === 'k' && s !== 4) { miss(KEEP() + ': "THE BLACK GOES IN THE MIDDLE. LATER."', 1.8); return; } if (s === 4 && b.c !== 'k') { miss('THIS SPOT IS FOR THE BLACK \u00b7 FIND IT', 1.8); return; }
      if (s === 14 && J.slots[10] === b.c) { miss('BACK CORNERS: ONE RED, ONE BLUE', 1.8); return; }
      b.in = true; J.slots[s] = b.c; J.slot++; fly(b.m, slotPos(s), 0.28, 0.12, () => clack());
      if (J.slot >= 15) { addGold(12); NEXT(() => { fly(TRI, TRI.position.clone().setY(PY + 0.6), 0.5, 0, null); ding(); NEXT(finishGame, 0.7); }, 0.5); } },
    card() { const s = J.slot, need = s === 4 ? 'THE BLACK' : s === 14 ? (J.slots[10] === 'r' ? 'A BLUE' : 'A RED') : 'ANY RED OR BLUE'; return [s < 15 ? 'NEXT: ' + need : 'RACKED!', lab(s + ' / 15 IN') + lst([[BALLC.k, 'BLACK', 'MIDDLE', s > 4], [BALLC.r, 'CORNERS', 'RED + BLUE', s > 14]]), 'r' + s]; },
    hint() { const s = J.slot; const b = J.balls.find(q => !q.in && (s === 4 ? q.c === 'k' : q.c !== 'k' && !(s === 14 && J.slots[10] === q.c))); return b ? [b.m.position.clone(), 'TAP'] : null; },
    shot() { const [x, z] = toWo(PO, 0, -0.35 * PS); return [V(x, PY, z), 2.4, 2.6, 1.0, 2.0, RAD(PO.a), 5]; },
    end() { TRI.visible = false; TRI.position.y = PY + 0.03; if (rackMesh) rackMesh.visible = true; } };
  const GD = { pour: G1, serve: G2, wipe: G3, logs: G4, rack: G5 }; if (!PO) delete GD.rack;
  const JX = new Proxy({}, { get: (_, k) => J && J[k], set: (_, k, v) => { if (J) J[k] = v; return true; } });
  const XB = tavJobsB({ THREE, G, L, RAD, toWo, V, box, cyl, LM, CT, label, plane, kit, cols, ring, own, fly, miss, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, coin, clack, thud, lst, lab, row, tagSprite, TAPR, scrW, dist, sayTo, KEEP, clamp, rnd, shuffle, touch, tav, J: JX });
  Object.assign(GD, XB.GD); Object.assign(RINGS, XB.RINGS); KP.tips.push(...XB.tips);
  const XF = tavFun({ THREE, G, L, RAD, toWo, V, box, cyl, LM, CT, label, plane, kit, cols, own, fly, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, coin, lst, lab, sayTo, rnd, touch, tav, J: JX, save, cast, kT, ln, stop: () => stop() });
  Object.assign(GD, XF.GD); Object.assign(RINGS, XF.RINGS); KP.tips.push(...XF.tips); for (const q of gamesF()) GN[q.k] = q;
  const PZ = tvPrizes({ THREE, G, L, toWo, RAD, box, cyl, LM, CT, fitTxt, save, heal, wear, toast, ding, coin, tone, done, GAMES, sayTo, kT, ln, hour, keeper, BAR, KX });
  let TR = { prompt: () => null, talk: () => false, tick() {} }; try { TR = tvTrade({ THREE, G, kit, sayTo: (...a) => sayTo(...a), toast, tone, save }); } catch (e) { console.warn('tavern trade: ' + (e && e.stack || e)); }
  const LF = tvLife({ THREE, G, scene, L, RAD, box, cyl, LM, CT, fitTxt, kit, cols, hour, touch, tone, toast });
  // ================= run a game =================
  function startGame(g, P) { if (busy || !GD[g]) return; J = { g, miss: 0, gold: 0, objs: [], flies: [], t: 0, pause: 0, P }; busy = 'job'; const R = RINGS[g];
    if (P && !GN[g].walk && R) { Object.assign(P, { x: R[0], z: R[1], sp: 0 }); if (R[2] != null) { P.y = R[2]; P.vy = 0; } } GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; if (GN[J.g].fun) { const r = GD[J.g].result ? GD[J.g].result() : ''; stop(); K.chime(0.6); toast(r, 4); return; } const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(8); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat(pre + 'Done', d); save.setStat('tvClears', save.stat('tvClears', 0) + 1); K.finish(g, stars, gold, first); stop();
    const gf = PZ.gift(g); thanks = { g, gold, gf }; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 +' + gold + ' GOLD' + (gf ? ' \u00b7 PRIZE: ' + PZ.line(gf)[1] + ' \u00b7 SEE ' + KEEP() : ''), gf ? 3.6 : 2.6); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) J.objs.forEach(o => o.parent && o.parent.remove(o)); busy = null; J = null; ptr.down = false; hideCard(); arrowM.visible = false; beacon.visible = false; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g], c = g.card && g.card(); if (!c) { hideCard(); return; }
    setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? J.gold + ' G' : KEEP()) + foot(c[0], GN[J.g].walk) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; if (J.flies.length) flyTick(dt); if (!J) return; const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return;
    const go = g.goal ? g.goal() : null; if (go) { arrowM.visible = true; beacon.visible = true; arrowM.position.set(go[0], go[2] + 1.9 + Math.sin(J.t * 4) * 0.15, go[1]); arrowM.rotation.y += dt * 2; beacon.position.set(go[0], go[2] + 0.1, go[1]); } else { arrowM.visible = false; beacon.visible = false; }
    drawCard(); }
  // ---------- camera (tap jobs), clamped inside the room ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null, snapK = false; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !GN[J.g].walk && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = snapK ? 1 : Math.min(1, dt * 3.2); snapK = false; camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    const bx = v[7] || [R0.X0 + 0.5, R0.X1 - 0.5, R0.Z0 + 0.5, R0.Z1 - 0.5, 0.6, 5.6]; camCur.pos.x = clamp(camCur.pos.x, bx[0], bx[1]); camCur.pos.z = clamp(camCur.pos.z, bx[2], bx[3]); camCur.pos.y = clamp(camCur.pos.y, bx[4], bx[5]); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.830-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- places, talk + prompt ----------
  const inRoom = P => P.x > R0.X0 && P.x < R0.X1 && P.z > R0.Z0 && P.z < R0.Z1 && (P.y || 0) < 4;
  const onDeck = P => BD && P.x > R0.X0 - 2 && P.x < R0.X1 + 2 && P.z > R0.Z0 - 9 && P.z <= R0.Z0 + 0.5;
  const ringAt = P => { for (const k in RINGS) { if (!GD[k]) continue; const [x, z, y = 0] = RINGS[k]; if (Math.hypot(P.x - x, P.z - z) < 1.05 && Math.abs((P.y || 0) - y) < 1.5) return GN[k]; } return null; };
  const nearKeeper = P => Math.hypot(P.x - keeper.position.x, P.z - keeper.position.z) < 2.9 && Math.abs(P.y || 0) < 1.5;
  const playPool = () => { tone(880, 0.05, 0.3); if (openPlay) openPlay('POOL VS ZIGGY', POOL_URL); };
  function prompt(P) { if (J && GN[J.g].walk) { const gp = GD[J.g].prompt ? GD[J.g].prompt(P) : null; return gp || (nearKeeper(P) ? KEEP() + ' \u00b7 STOP THE JOB' : null); } if (busy) return null; if (!inRoom(P)) return null;
    const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; { const tp = TR.prompt(P); if (tp) return tp; } { const lp = LF.prompt(P); if (lp) return lp; } if (nearPool(P)) return 'PLAY POOL \u00b7 VS ZIGGY'; if (nearKeeper(P)) return 'TALK \u00b7 ' + KEEP(); return null; }
  const nextJob = () => { const d = done(); return (GAMES.find(q => !d[q.k] && GD[q.k]) || GAMES.filter(q => GD[q.k]).sort((a, c) => K.stars(a.k) - K.stars(c.k))[0]).k; };
  const SUBL = { bar: 'Bar jobs. Which one?', back: 'Back of house and the cellar. Which one?' };
  const sub = grp => sayTo(kT, [{ ...ln(SUBL[grp]), choices: [...GAMES.filter(q => GD[q.k] && q.grp === grp).map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => { if (!busy) startGame(q.k, lastP); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const games = () => sayTo(kT, [{ ...ln('Darts with Flick, pool with Ziggy, or the stage.'), choices: [{ text: 'DARTS VS FLICK', pick: () => { if (!busy) startGame('match', lastP); } }, ...(PO ? [{ text: 'POOL VS ZIGGY', pick: () => playPool() }] : []),
    { text: 'KARAOKE', pick: () => { if (!busy) startGame('karaoke', lastP); } }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const menu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(), lastP); } }, { text: 'BAR JOBS', pick: () => sub('bar') }, { text: 'CELLAR + BACK JOBS', pick: () => sub('back') }, { text: 'PLAY A GAME', pick: () => games() },
      { text: 'DRINKS + PERKS', pick: () => PZ.perks() }, { text: 'A TIP, PLEASE', pick: () => sayTo(kT, [ln(KP.tips[talked % KP.tips.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    let open = first ? KP.hello[0] : KP.hello[1 + (talked % 3)]; if (thanks) { open = thanks.gf ? PZ.line(thanks.gf)[0] : KP.open[save.stat('tvClears', 1) % 4] + ' ' + thanks.gold + ' gold. More?'; thanks = null; }
    sayTo(kT, [{ ...ln(open), choices: ch }]); };
  function talk(P) { lastP = P; if (J && GN[J.g].walk) { if (GD[J.g].talk && GD[J.g].talk(P)) return true; if (nearKeeper(P)) { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 1.8); return true; } const r = ringAt(P); if (r && r.k === J.g) { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 1.8); return true; } return false; }
    if (busy) return true; if (!inRoom(P)) return false; const r = ringAt(P); if (r) { startGame(r.k, P); return true; }
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (TR.talk(P)) return true; if (LF.talk(P)) return true; if (nearPool(P)) { playPool(); return true; } if (!nearKeeper(P)) return false; tone(1320, 0.05, 0.6); menu(!talked++); return true; }
  function quit() { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  let outT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; PZ.applyWear(fox); toastT -= dt; const near = Math.hypot(P.x - 32, P.z + 80); G.visible = near < (touch ? 60 : 110);
    if (busy === 'job' && J) { const ok = inRoom(P) || (GN[J.g].walk && onDeck(P)); outT = ok ? 0 : outT + dt; if (outT > (GN[J.g].walk ? 2 : 0.3)) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (busy === 'job' && J && !GN[J.g].walk && fox) fox.visible = false; if (!G.visible) return;
    if (busy === 'job' && J) jobTick(dt, P); hintTick(t); LF.tick(dt, P, inRoom(P)); TR.tick(dt, P);
    if (ziggy.visible && G.visible) kit.animFox(ziggy, dt, 0, false); if (PATRON.visible) kit.animFox(PATRON, dt, 0, false); if (KID.visible) kit.animFox(KID, dt, 0, false); SEAT.forEach(f => f.visible && kit.animFox(f, dt, 0, false));
    if (PO && inRoom(P) && !busy) { const a = Math.atan2(P.x - ziggy.position.x, P.z - ziggy.position.z); if (Math.hypot(P.x - ziggy.position.x, P.z - ziggy.position.z) < 4) { let d = a - ziggy.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); ziggy.rotation.y += d * Math.min(1, dt * 3); } }
    K.tick(dt, P, { inShop: inRoom(P), busy: !!busy, near, talking: false }); PZ.tick(dt, P, fox, { inShop: inRoom(P), busy: !!busy, talking: false }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => (busy && J && GN[J.g].walk ? null : busy), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, PZ, LF, deck: dk => LF.deck(dk), deckTick: (dt, P) => LF.deckTick(dt, P), start: (g, P) => startGame(g, P || lastP), keeper, ziggy, GD, RINGS, RACKP, BASK,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    snap() { snapK = true; }, _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) jobTick(dt, lastP); }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), card, dispose() { card.remove(); HINT.remove(); K.dispose(); } };
  window.__tavJobs = API; return API;
}
