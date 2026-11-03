// MERU 2.0 — s90 CASINO DELUXE PART A (Ben's answers s90): TWO keepers — STERLING the pit boss on the floor (wine suit, gold cufflinks) and
// NICKEL the cashier at the cage (replaces the old anonymous casinoCashier) — shop kit (NOW HIRING past the velvet ropes, BEST board + clock on the
// door wall, chime, light) and the first 5 jobs: SORT THE DECKS (stud table: tap the right suit pile, then riffle the halves) · FIX THE SLOTS (walk:
// E at the 3 blinking machines) · CASH CAGE (tap chips to make the exact change) · VACUUM + CHIPS (drag the vacuum over the crumbs + dropped chips)
// · POLISH THE 8s (drag the cloth over the thumbprints on a gold 8 statue).
// Built in the casino's ORIGINAL frame (f -150..-105 × -32..32, door E at (-105, 0)); meru2-walk.js adds API.group to RL.MV 'casino' like the tavern.
// Bets stay gold from the purse (Ben). Parts B / C (cameras + cheater, sore loser, jackpot party + lights, 3D slot pull, lounge singer, prizes) to come.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { casinoLayout } from './meru2-casino.js';
import { PLAYER_FEMALE } from '../fox-kit.js?v=s673';
import { casJobsB, gamesB } from './meru2-casino-jobs2.js';
import { csFun } from './meru2-casino-fun.js';   // s90 part C: Lucky 8 slot pull, VIP lounge, Velvet's show, prizes, Jackpot Wall, keepers at work   // s90 part B: security cameras, sore loser, jackpot party + jackpot FX
const RAD = a => (a || 0) * Math.PI / 180;
const toWo = (o, lx, lz) => { const r = RAD(o.a), c = Math.cos(r), s = Math.sin(r); return [o.x + lx * c + lz * s, o.z - lx * s + lz * c]; };
const KP = { name: 'Sterling', role: 'PIT BOSS', color: '#7a2a3a', torso: ['#5b1f2e', '#c9a227', '#2a0e16'],
  hello: ['Sterling, pit boss. The floor never sleeps. Want a shift?', 'Back on my floor? Good. Plenty to do.', 'The house always needs hands. Pick a job.', 'Sharp as ever. Ready to work?'],
  open: ['Clean work.', 'The house thanks you.', 'Smooth. Very smooth.', 'That is how a floor runs.'],
  tips: ['Luck is a lady. The house is a mathematician.', 'Four suits, four piles. Never mix them.', 'Thumbprints show under the chandeliers. Polish every one.', 'Dropped chips belong to the house. The vacuum knows.',
    'A blinking slot is a sad slot. Fix it fast.', 'Ulric plays roulette like a general. He hates losing.'] };
const CP = { name: 'Nickel', role: 'CASHIER', torso: ['#2e4a6b', '#f3f2f2', '#1a2a3e'],
  hello: ['Nickel, cashier. Gold in, chips out. Want a turn at the cage?', 'Back at my window? The queue is growing.'],
  tips: ['White is one, red five, blue ten, green twenty-five.', 'Big chips first. It is faster.', 'Count room is down the stairs behind me. Staff only.'] };
const SUITS = [['SPADES', '\u2660', '#201e1d'], ['HEARTS', '\u2665', '#ec3013'], ['DIAMONDS', '\u2666', '#ec3013'], ['CLUBS', '\u2663', '#201e1d']];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const CHIPS = [{ v: 1, c: '#f3f2f2', f: '#201e1d' }, { v: 5, c: '#ec3013', f: '#ffffff' }, { v: 10, c: '#2f6fd6', f: '#ffffff' }, { v: 25, c: '#1f8a4c', f: '#ffffff' }];
const GUESTS = ['BIG LOU', 'DUCHESS', 'LUCKY PIP', 'OLD MOSS', 'TINSEL', 'RIVET', 'MADAME OPAL', 'SKIP'];
export function buildCasinoJobs({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted, wear, heal }) { const JW = jobWorker(THREE);
  let XF = null; const mutedQ = () => { try { return !!(isMuted && isMuted()); } catch (e) { return true; } };   // the walk sets up its sound flag after the shops are built
  const L = casinoLayout(), R0 = { X0: -150, X1: -105, Z0: -32, Z1: 32 }, DOOR = [-105, 0];
  const G = new THREE.Group(); G.name = 'casinoJobs'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const toW = v => { G.updateWorldMatrix(true, false); return G.localToWorld(v.clone()); };
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GOLD = '#c9a227';
  // ================= the keepers =================
  const boss = kit.makeFox({ key: 'csBoss', torso: KP.torso, outfit: 'suit', mood: 'smug', look: { fur: '#b8642a', furDark: '#7a3e14' } });
  const BOSS = { x: -121, z: -4, ry: Math.PI / 2 }; boss.position.set(BOSS.x, 0, BOSS.z); boss.rotation.y = BOSS.ry; G.add(boss); ring(BOSS.x, BOSS.z, 0.45);
  { const P0 = boss.userData && boss.userData.P; if (P0 && P0.fore && P0.hands) P0.hands.forEach(H => { const cf = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.08), LM(GOLD)); cf.position.set(0, 0.04, 0.05); H.g.add(cf); }); else if (P0 && P0.arms) P0.arms.forEach(a => { if (a) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.08), LM(GOLD)); c.position.set(0, -0.4, 0.06); a.add(c); } });
    if (P0 && P0.body) { const tie = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.04), LM(GOLD)); tie.position.set(0, 0.86, 0.3); P0.body.add(tie); } }
  const CA = L.cashier || { x: -140, z: 22, a: 180 }, CRY = RAD(CA.a) + Math.PI;   // facing INTO the cage (guests + the job camera look this way); Nickel faces the other way, out to the guests
  const cash = kit.makeFox({ key: 'csCash', torso: CP.torso, outfit: 'vest', mood: 'happy', look: PLAYER_FEMALE });
  const CASH0 = toWo(CA, 0, -1.6); cash.position.set(CASH0[0], 0, CASH0[1]); cash.rotation.y = CRY - Math.PI; G.add(cash);
  { const P0 = cash.userData && cash.userData.P; if (P0 && P0.head) { const vz = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.18), new THREE.MeshLambertMaterial({ color: '#2f9a5a', transparent: true, opacity: 0.85 })); vz.position.set(0, 0.2, 0.2); P0.head.add(vz); } }
  const kT = { key: 'csBoss', name: KP.name, role: KP.role, obj: boss, ry: BOSS.ry, r: 6 }, cT = { key: 'csCash', name: CP.name, role: CP.role, obj: cash, ry: cash.rotation.y, r: 6 };
  const ln = text => ({ who: 'csBoss', role: KP.role, text }), lnC = text => ({ who: 'csCash', role: CP.role, text });
  // ================= rings =================
  const PK = (L.pokers || []).find(p => p.game === 'stud') || (L.pokers || [])[0] || { x: -137, z: -21, a: 0 };
  const ST = (L.props || []).filter(p => p.type === 'statue').sort((a, b) => a.z - b.z)[0] || { x: -134.6, z: -10, a: 90 };
  const RINGS = { cards: toWo(PK, 3.6, -0.8), slots: [-124, -5], cage: toWo(CA, -5, -2), vac: [-124, 5], polish: toWo(ST, 0, 2.0) };
  const ringMesh = k => { const [x, z, y = 0] = RINGS[k]; const r1 = cyl(G, 0.5, 0.5, 0.012, YEL, x, 0.085, z, 22), r2 = cyl(G, 0.42, 0.42, 0.014, INK, x, 0.087, z, 22); r1.position.y += y; r2.position.y += y; r1.renderOrder = r2.renderOrder = 1; }; for (const k in RINGS) ringMesh(k);
  // ================= shop kit =================
  const GAMES = [{ k: 'cards', name: 'Sort the Decks', color: '#2e4a6b', grp: 'floor' }, { k: 'slots', name: 'Fix the Slots', color: '#ff3fb4', walk: true, grp: 'floor' }, { k: 'cage', name: 'Cash Cage', color: '#1f8a4c', grp: 'cage' },
    { k: 'vac', name: 'Vacuum + Chips', color: '#7a2a3a', grp: 'floor' }, { k: 'polish', name: 'Polish the 8s', color: GOLD, grp: 'floor' }, ...gamesB()];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), pre = 'cs';
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted: mutedQ, prefix: pre, color: KP.color, boardTitle: "Sterling's best", toWorld: toW, room: R0, door: [DOOR[0] - 0.5, DOOR[1]], keeper: boss, keeperRy: BOSS.ry, games: GAMES,
    board: { x: -105.62, y: 3.3, z: -8.5, ry: -Math.PI / 2, w: 1.3 }, hiring: { x: -116, y: 0, z: 2.6, ry: Math.PI }, hiringLine: 'WALK UP \u00b7 START WORK',
    sun: [{ x: -108, z: -9, w: 2.6, d: 3.2 }, { x: -108, z: 9, w: 2.6, d: 3.2 }], lamps: (L.chandeliers || []).map(q => [q.x, 6.9, q.z]),
    browse: [[-140.1, -7.9, Math.PI], [-129.05, 7.9, 0], [-124, -16.5, Math.PI], [-114, 14, 0]], slots: 2, clock: { x: -105.62, y: 3.6, z: 8.5, ry: -Math.PI / 2 } });
  // ================= state, sound, card UI =================
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, thanks = null, lastP = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at0 = 0) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at0, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = bf; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), coin = (a = 0) => { tone(2400, 0.04, 0.15, 'triangle', a); tone(3200, 0.03, 0.12, 'triangle', a + 0.03); };
  const clack = () => { tone(1800, 0.06, 0.05, 'square'); tone(900, 0.03, 0.06, 'triangle', 0.02); }, flick = () => noise(0.05, 0.03, 4000), zap = () => { tone(880, 0.04, 0.12, 'square'); tone(1320, 0.04, 0.2, 'square', 0.08); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + KP.color + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = (next, walk) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (walk ? 'RING \u00b7 STOP' : (touch ? '3' : 'SPACE') + ' \u00b7 STOP') + '</span></div>';
  const lst = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + items.map(([sw, t, r, ok]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (r ? ' \u00b7 ' + r : '') + '</span>').join('') + '</div>' : items.map(a => row(...a)).join('');
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>';
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
  const hitPl = pl => (ray().intersectPlane(pl, hitP) ? hitP.clone() : null), hitY = y => hitPl(new THREE.Plane(V(0, 1, 0), -y));
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const Fq of J.flies.slice()) { Fq.t += dt / Fq.dur; const k = Math.min(1, Fq.t), e = k * k * (3 - 2 * k); Fq.obj.position.lerpVectors(Fq.from, Fq.to, e); Fq.obj.position.y += Math.sin(k * Math.PI) * Fq.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(Fq), 1); Fq.then && Fq.then(); } } }
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt + bg] || (tagTex[txt + bg] = CT(128, 96, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = '900 ' + (txt.length > 2 ? 44 : 60) + 'px Archivo, sans-serif'; g.fillText(txt, W2 / 2, H / 2 + 3); }));
  const tagSprite = (txt, bg = '#ffffff', fg = INK, s = 0.5) => { if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: false })); sp.scale.set(s, s * 0.75, 1); sp.renderOrder = 6; return sp; };
  const addGold = n => { n = Math.max(0, Math.round(n * (XF && XF.luck() && J && !GN[J.g].fun ? 1.1 : 1))); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (after, t = 1.0) => { J.pause = t; J.after = after; };
  const arrowM = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: RED })); arrowM.rotation.x = Math.PI; arrowM.visible = false; arrowM.renderOrder = 5; G.add(arrowM);
  const beacon = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 24), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.8, depthWrite: false })); beacon.rotation.x = -Math.PI / 2; beacon.visible = false; G.add(beacon);
  const done = () => save.stat(pre + 'Done', null) || {};
  const KEEP = () => KP.name.toUpperCase();
  const blotT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 3, 32, 32, 31); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.65, 'rgba(255,255,255,0.85)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283, rr = 23 + (i % 3) * 5; g.lineTo(32 + Math.cos(a) * rr, 32 + Math.sin(a) * rr); } g.fill(); });
  // ================= JOB 1: SORT THE DECKS (tap) — stud table: a card turns up, tap its suit's pile; then riffle the two halves =================
  const TOPY = 0.995, PKY = RAD(PK.a);
  const cardTex = CT(128, 180, () => {}), drawFace = (r, s) => { const g = cardTex.userData.c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 180); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, 122, 174);
    g.fillStyle = s[2]; g.textBaseline = 'middle'; g.textAlign = 'left'; g.font = '900 38px Archivo, sans-serif'; g.fillText(r, 12, 30); g.font = '900 30px sans-serif'; g.fillText(s[1], 14, 64); g.textAlign = 'center'; g.font = '900 92px sans-serif'; g.fillText(s[1], 64, 118); cardTex.needsUpdate = true; };
  const CARD = new THREE.Group(); { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.42), new THREE.MeshBasicMaterial({ map: cardTex })); m.rotation.x = -Math.PI / 2; m.renderOrder = 4; CARD.add(m); } CARD.rotation.y = PKY; CARD.visible = false; G.add(CARD);
  const pileAt = i => { const [x, z] = toWo(PK, -1.2 + i * 0.8, 0.62); return V(x, TOPY, z); }, deckAt = () => { const [x, z] = toWo(PK, 0, -0.32); return V(x, TOPY, z); };
  const PILES = SUITS.map((s, i) => { const g = new THREE.Group(), p = pileAt(i); g.position.copy(p); g.rotation.y = PKY; g.visible = false; G.add(g);
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.46), new THREE.MeshBasicMaterial({ map: CT(128, 172, (q, w, h) => { q.fillStyle = '#163a52'; q.fillRect(0, 0, w, h); q.strokeStyle = '#ffffff'; q.lineWidth = 5; q.setLineDash([12, 8]); q.strokeRect(5, 5, w - 10, h - 10); q.fillStyle = s[2] === RED ? '#ff6a55' : '#ffffff'; q.font = '900 88px sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText(s[1], w / 2, h / 2 + 4); }), transparent: true })); lb.rotation.x = -Math.PI / 2; lb.position.y = 0.004; g.add(lb);
    const st = box(g, 0.29, 1, 0.41, '#ffffff', 0, 0.01, 0); st.scale.y = 0.001; st.visible = false; return { g, st, n: 0 }; });
  const DECK = box(G, 0.29, 0.07, 0.41, '#0d2236', 0, 0, 0); DECK.visible = false; DECK.rotation.y = PKY;
  const HALF = [-0.42, 0.42].map(lx => { const [x, z] = toWo(PK, lx, -0.32); const m = box(G, 0.29, 0.04, 0.41, '#0d2236', x, TOPY + 0.02, z); m.rotation.y = PKY; m.visible = false; return m; });
  const G1 = {
    begin() { J.deck = [...Array(12)].map(() => [RANKS[Math.random() * 13 | 0], SUITS[Math.random() * 4 | 0]]); J.i = 0; J.ph = 'sort'; PILES.forEach(p => { p.n = 0; p.g.visible = true; p.st.visible = false; });
      const d = deckAt(); DECK.position.set(d.x, TOPY + 0.035, d.z); DECK.visible = true; this.deal(); toast('A CARD TURNS UP \u00b7 TAP THE PILE WITH ITS SUIT', 2.8); },
    deal() { const c = J.deck[J.i]; if (!c) return; drawFace(c[0], c[1]); const d = deckAt(); CARD.position.set(d.x, TOPY + 0.08, d.z); CARD.visible = true; flick(); },
    press() { if (J.flies.length) return;
      if (J.ph === 'sort') { const c = J.deck[J.i]; if (!c) return; let best = -1, bd = TAPR() * 1.6; PILES.forEach((p, i) => { const d = dist(scrW(p.g.position)); if (d < bd) { bd = d; best = i; } }); if (best < 0) return;
        if (SUITS[best] !== c[1]) { miss('THAT IS ' + SUITS[best][0] + ' \u00b7 THIS CARD IS ' + c[1][0], 1.6); return; }
        const p = PILES[best]; fly(CARD, p.g.position.clone().setY(TOPY + 0.02 + p.n * 0.01), 0.22, 0.1, () => { if (!J) return; p.n++; p.st.visible = true; p.st.scale.y = p.n * 0.01; p.st.position.y = p.n * 0.005; clack(); CARD.visible = false; J.i++;
          if (J.i >= J.deck.length) { addGold(10); NEXT(() => G1.toShuffle(), 0.5); } else G1.deal(); }); return; }
      if (J.ph === 'shuf') { let best = -1, bd = TAPR() * 1.8; HALF.forEach((h, i) => { const d = dist(scrW(h.position)); if (d < bd) { bd = d; best = i; } }); if (best < 0) return;
        if (best !== J.want) { miss('THE OTHER HALF \u00b7 LEFT, RIGHT, LEFT\u2026', 1.4); return; } J.sh++; flick(); const h = HALF[best]; fly(h, h.position.clone(), 0.14, 0.06, null); J.want = 1 - J.want; J.tag.position.copy(HALF[J.want].position).setY(TOPY + 0.35);
        if (J.sh >= 8) { J.tag.visible = false; HALF.forEach(q => { q.visible = false; }); DECK.visible = true; addGold(4); ding(); NEXT(finishGame, 0.8); } } },
    toShuffle() { J.ph = 'shuf'; J.sh = 0; J.want = Math.random() < 0.5 ? 0 : 1; DECK.visible = false; PILES.forEach(p => { p.g.visible = false; }); HALF.forEach(h => { h.visible = true; }); J.tag = own(tagSprite('TAP', YEL, INK, 0.36)); J.tag.position.copy(HALF[J.want].position).setY(TOPY + 0.35); toast('NOW RIFFLE \u00b7 TAP THE LIT HALF, LEFT AND RIGHT IN TURN', 2.6); pop(); },
    card() { if (J.ph === 'shuf') return ['TAP THE LIT HALF', lab('RIFFLE ' + J.sh + ' / 8'), 's' + J.sh + J.want]; const c = J.deck[J.i]; if (!c) return ['SORTED', lab('12 / 12'), 'e'];
      return ['TAP THE ' + c[1][0] + ' PILE', lab((J.i + 1) + ' / 12 \u00b7 ' + c[0] + ' ' + c[1][1]) + lst(SUITS.map((s, i) => [s[2], s[1] + ' ' + s[0], String(PILES[i].n), s === c[1]])), 'c' + J.i]; },
    hint() { if (J.ph === 'shuf') return [HALF[J.want].position.clone(), 'TAP']; const c = J.deck[J.i]; return c ? [PILES[SUITS.indexOf(c[1])].g.position.clone(), 'TAP'] : null; },
    shot() { const [x, z] = toWo(PK, 0, 0.15); return [V(x, TOPY, z), 3.0, 1.7, 1.05, 2.2, PKY, 4.6]; },
    end() { CARD.visible = false; DECK.visible = false; PILES.forEach(p => { p.g.visible = false; }); HALF.forEach(h => { h.visible = false; }); } };
  // ================= JOB 2: FIX THE SLOTS (walk) — three machines blink; E at each =================
  const SL = L.slots || [];
  const slotFront = s => toWo(s, 0, 1.05);
  const nearSlot = P => { let b = null, bd = 1.5; for (const it of J.list) { if (it.got) continue; const [x, z] = slotFront(it.s); const d = Math.hypot(P.x - x, P.z - z); if (d < bd) { bd = d; b = it; } } return b; };
  const G2 = { walk: true,
    begin() { J.list = shuffle(SL.slice()).slice(0, 3).map((s, i) => ({ s, n: SL.indexOf(s) + 1, kind: i % 2 ? 'REFILL THE HOPPER' : 'CLEAR THE JAMMED REELS', got: false }));
      J.list.forEach(it => { const t = own(tagSprite('!', RED, '#ffffff', 0.5)); t.position.set(it.s.x, 3.0, it.s.z); it.tag = t; });
      toast('THREE MACHINES ARE BLINKING \u00b7 WALK UP \u00b7 E TO FIX', 2.8); zap(); },
    tick() { const on = (J.t * 3 | 0) % 2 === 0; J.list.forEach(it => { if (!it.got) it.tag.visible = on; }); },
    goal() { const P = J.P, rest = J.list.filter(it => !it.got); if (!rest.length || J.t < 6) return null; let b = rest[0], bd = 1e9; for (const it of rest) { const d = Math.hypot(P.x - it.s.x, P.z - it.s.z); if (d < bd) { bd = d; b = it; } } return [b.s.x, b.s.z, 1.0]; },
    prompt(P) { const it = nearSlot(P); return it ? 'FIX \u00b7 ' + it.kind : null; },
    talk(P) { const it = nearSlot(P); if (!it) return false; it.got = true; zap(); coin(0.15); addGold(6); G.remove(it.tag); it.tag = own(tagSprite('\u2713', '#2f9a5a', '#ffffff', 0.45)); it.tag.position.set(it.s.x, 3.0, it.s.z);
      const left = J.list.filter(x => !x.got).length; toast(left ? 'BACK IN BUSINESS \u00b7 ' + left + ' TO GO' : 'ALL MACHINES SINGING!', 1.6); if (!left) { ding(); NEXT(finishGame, 0.6); } return true; },
    card() { return ['WALK \u00b7 E AT THE BLINKING SLOT', lst(J.list.map(it => ['#ff3fb4', 'SLOT ' + it.n, it.got ? '\u2713' : it.kind.split(' ')[0] === 'REFILL' ? 'REFILL' : 'JAMMED', it.got])), J.list.map(it => +it.got).join('')]; },
    end() {} };
  // ================= JOB 3: CASH CAGE (tap) — make the exact change in chips =================
  const CY = 1.165, CLX = [1.2, 0.4, -0.4, -1.2];   // seen from inside the cage: 1 · 5 · 10 · 25 left to right
  const stackAt = i => { const [x, z] = toWo(CA, CLX[i], -0.22); return V(x, CY, z); }, trayAt = () => { const [x, z] = toWo(CA, 0, 0.3); return V(x, CY, z); };
  const chipGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.022, 14);
  const STACKS = CHIPS.map((c, i) => { const g = new THREE.Group(); g.position.copy(stackAt(i)); g.visible = false; G.add(g); for (let k = 0; k < 8; k++) { const m = new THREE.Mesh(chipGeo, LM(c.c)); m.position.y = 0.011 + k * 0.023; g.add(m); }
    const t = tagSprite(String(c.v), c.c, c.f, 0.3); t.position.y = 0.42; g.add(t); return g; });
  const TRAYM = box(G, 0.5, 0.02, 0.3, '#3d2a1c', 0, 0, 0); TRAYM.visible = false; { const p = trayAt(); TRAYM.position.set(p.x, CY + 0.01, p.z); TRAYM.rotation.y = RAD(CA.a); }
  const CUST = [kit.makeFox({ key: 'csGuest1', torso: ['#16a34a', '#f3f2f2', '#0d4a24'], outfit: 'suit', mood: 'happy' }), kit.makeFox({ key: 'csGuest2', torso: ['#a78bfa', '#ffd23a', '#4a2a7a'], outfit: 'dress', mood: 'excited', look: PLAYER_FEMALE }), kit.makeFox({ key: 'csGuest3', torso: ['#f97316', '#201e1d', '#7a3a0a'], outfit: 'coat', mood: 'happy' })];
  { const [x, z] = toWo(CA, 0, 1.25); CUST.forEach(f => { f.position.set(x, 0, z); f.rotation.y = CRY; f.visible = false; G.add(f); }); }
  const AMTS = [6, 11, 15, 20, 27, 32, 40, 55, 61, 76];
  const G3 = {
    begin() { J.q = shuffle(AMTS.slice()).slice(0, 5).map((a, i) => ({ a, who: GUESTS[(Math.random() * GUESTS.length) | 0], f: CUST[i % 3] })); J.i = 0; STACKS.forEach(s => { s.visible = true; }); TRAYM.visible = true;
      const [x, z] = toWo(CA, 3.2, -1.6); cash.position.set(x, 0, z); this.next(); toast('TAP THE CHIPS \u00b7 MAKE THE EXACT CHANGE \u00b7 BIG CHIPS FIRST', 3); },
    next() { const c = J.q[J.i]; if (!c) return; CUST.forEach(f => { f.visible = f === c.f; }); J.sum = 0; J.tray = []; coin(); },
    clearTray() { for (const m of J.tray) { if (m.parent) m.parent.remove(m); const k = J.objs.indexOf(m); if (k >= 0) J.objs.splice(k, 1); } J.tray = []; J.sum = 0; },
    press() { const c = J.q[J.i]; if (!c || J.over) return; let best = -1, bd = TAPR() * 1.4; STACKS.forEach((s, i) => { const d = dist(scrW(s.position.clone().setY(CY + 0.12))); if (d < bd) { bd = d; best = i; } }); if (best < 0) return;
      const ch = CHIPS[best], m = own(new THREE.Mesh(chipGeo, LM(ch.c))); m.position.copy(STACKS[best].position).setY(CY + 0.2); const n = J.tray.length, tp = trayAt(); J.tray.push(m); J.sum += ch.v; clack();
      fly(m, V(tp.x + ((n % 3) - 1) * 0.14, CY + 0.032 + Math.floor(n / 3) * 0.023, tp.z), 0.2, 0.12, null);
      if (J.sum === c.a) { addGold(4); NEXT(() => { coin(); G3.clearTray(); J.i++; if (J.i >= J.q.length) { ding(); NEXT(finishGame, 0.6); } else G3.next(); }, 0.7); toast(c.who + ': "SPOT ON!"', 1.2); }
      else if (J.sum > c.a) { J.over = true; miss('TOO MUCH \u00b7 ' + J.sum + ' OF ' + c.a + ' \u00b7 COUNT AGAIN', 1.8); NEXT(() => { G3.clearTray(); J.over = false; }, 0.7); } },
    card() { const c = J.q[J.i]; if (!c) return ['ALL PAID', lab('5 / 5'), 'e']; const need = c.a - J.sum;
      return ['MAKE ' + c.a + ' G IN CHIPS', lab((J.i + 1) + ' / 5 \u00b7 ' + c.who) + row(GOLD, 'WANTS', c.a + ' G', false) + row('#3d2a1c', 'ON THE TRAY', J.sum + ' G', J.sum === c.a) + lst(CHIPS.map(q => [q.c, q.v + ' CHIP', '', false])), J.i + '_' + J.sum + (J.over ? 'o' : '') + need]; },
    hint() { const c = J.q[J.i]; if (!c) return null; const need = c.a - J.sum, k = [3, 2, 1, 0].find(i => CHIPS[i].v <= need); return k == null ? null : [STACKS[k].position.clone().setY(CY + 0.12), 'TAP']; },
    shot() { return [V(CA.x, CY + 0.4, CA.z), 2.9, 2.0, 0.45, 2.1, CRY, 3.6]; },
    end() { STACKS.forEach(s => { s.visible = false; }); TRAYM.visible = false; CUST.forEach(f => { f.visible = false; }); cash.position.set(CASH0[0], 0, CASH0[1]); } };
  // ================= JOB 4: VACUUM + CHIPS (drag) — the main aisle by the slot islands =================
  const VA = { x0: -140, x1: -133.5, z0: -4, z1: 4 }, FLY = 0.085;
  const VAC = new THREE.Group(); box(VAC, 0.46, 0.07, 0.22, INK, 0, 0.035, 0); box(VAC, 0.26, 0.42, 0.2, RED, 0, 0.3, -0.12); { const h = cyl(VAC, 0.02, 0.02, 1.1, '#c0c4cc', 0, 0.75, -0.2, 6); h.rotation.x = -0.3; } box(VAC, 0.2, 0.05, 0.05, INK, 0, 1.28, -0.37); VAC.visible = false; G.add(VAC);
  const G4 = {
    begin() { J.sp = []; J.ch = []; const ok = (x, z) => J.sp.concat(J.ch).every(q => Math.hypot(q.x - x, q.z - z) > 0.9);
      for (let i = 0; i < 4; i++) { let x, z, n = 0; do { x = rnd(VA.x0 + 0.6, VA.x1 - 0.6); z = rnd(VA.z0 + 0.6, VA.z1 - 0.6); } while (!ok(x, z) && ++n < 30);
        const m = own(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: blotT, color: ['#e9dcc4', '#c9a26b', '#8a6a42', '#e9dcc4'][i], transparent: true, depthWrite: false, opacity: 0.9 }))); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * 6; m.position.set(x, FLY, z); m.renderOrder = 3; J.sp.push({ x, z, r: 0.42, m, d: 1 }); }
      for (let i = 0; i < 6; i++) { let x, z, n = 0; do { x = rnd(VA.x0 + 0.3, VA.x1 - 0.3); z = rnd(VA.z0 + 0.3, VA.z1 - 0.3); } while (!ok(x, z) && ++n < 30); const c = CHIPS[i % 4], m = own(new THREE.Mesh(chipGeo, LM(c.c))); m.position.set(x, FLY + 0.011, z); J.ch.push({ x, z, m, got: false }); }
      J.lp = null; toast('DRAG THE VACUUM \u00b7 CRUMBS + DROPPED CHIPS', 2.6); noise(0.5, 0.03, 1200); },
    press() { J.lp = null; },
    drag() { if (!ptr.down) return; const p = hitY(FLY); if (!p) return; p.x = clamp(p.x, VA.x0 - 0.5, VA.x1 + 0.5); p.z = clamp(p.z, VA.z0 - 0.5, VA.z1 + 0.5); VAC.visible = true; VAC.position.set(p.x, FLY, p.z);
      const mv = J.lp ? Math.hypot(p.x - J.lp.x, p.z - J.lp.z) : 0; if (J.lp && mv > 0.004) VAC.rotation.y = Math.atan2(p.x - J.lp.x, p.z - J.lp.z) + Math.PI; J.lp = p; if (mv < 0.003) return; if ((J.sw = (J.sw || 0) + mv) > 0.4) { J.sw = 0; noise(0.18, 0.02, 1500); }
      for (const s of J.sp) { if (s.d <= 0 || Math.hypot(p.x - s.x, p.z - s.z) > s.r + 0.15) continue; s.d -= mv * 1.6; s.m.material.opacity = Math.max(0, s.d) * 0.9; if (s.d <= 0) { s.m.visible = false; pop(); addGold(2); } }
      for (const c of J.ch) { if (c.got || Math.hypot(p.x - c.x, p.z - c.z) > 0.32) continue; c.got = true; addGold(1); coin(); fly(c.m, V(p.x, FLY + 0.35, p.z), 0.18, 0, () => { c.m.visible = false; }); }
      if (J.sp.every(s => s.d <= 0) && J.ch.every(c => c.got) && !J.pause) { ding(); NEXT(finishGame, 0.9); } },
    release() { J.lp = null; },
    card() { const nd = J.sp.filter(s => s.d > 0).length, nc = J.ch.filter(c => !c.got).length; return ['DRAG OVER THE MESS', lst([['#c9a26b', 'CRUMBS', nd + ' LEFT', !nd], [RED, 'CHIPS', nc + ' LEFT', !nc]]), 'v' + nd + '_' + nc]; },
    hint() { const s = J.sp.find(q => q.d > 0) || J.ch.find(c => !c.got); return s ? [V(s.x, FLY, s.z), 'DRAG'] : null; },
    shot() { return [V((VA.x0 + VA.x1) / 2, 0.1, 0), 7.2, 8.6, 0.9, 5, Math.PI / 2, 10]; },
    end() { VAC.visible = false; } };
  // ================= JOB 5: POLISH THE 8s (drag) — thumbprints on the front of a gold 8 =================
  const SY = RAD(ST.a), SPOTS8 = [[0.4, 1.42, 0.28, [0.4, 1.9, 3.4, 4.9]], [0.32, 2.12, 0.3, [0.9, 3.0, 5.1]]];
  const CLOTH = new THREE.Group(); box(CLOTH, 0.18, 0.14, 0.03, '#f6efe0', 0, 0, 0); CLOTH.rotation.y = SY; CLOTH.visible = false; G.add(CLOTH);
  const plane8 = (() => { const [x, z] = toWo(ST, 0, 0.34); return new THREE.Plane().setFromNormalAndCoplanarPoint(V(Math.sin(SY), 0, Math.cos(SY)), V(x, 0, z)); })();
  const G5 = {
    begin() { J.sp = []; for (const [Rr, cy, tube, ts] of SPOTS8) for (const t of ts) { const [x, z] = toWo(ST, Rr * Math.cos(t), tube + 0.025); const y = cy + Rr * Math.sin(t);
        const m = own(new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ map: blotT, color: '#5a4a2a', transparent: true, depthWrite: false, opacity: 0.8 }))); m.position.set(x, y, z); m.rotation.y = SY; m.renderOrder = 4; J.sp.push({ p: V(x, y, z), m, d: 1 }); }
      J.lp = null; toast('RUB OFF THE THUMBPRINTS \u00b7 DRAG THE CLOTH', 2.6); },
    press() { J.lp = null; },
    drag() { if (!ptr.down) return; const p = hitPl(plane8); if (!p) return; p.y = clamp(p.y, 0.95, 2.6); CLOTH.visible = true; CLOTH.position.copy(p);
      const mv = J.lp ? J.lp.distanceTo(p) : 0; J.lp = p; if (mv < 0.002) return; if ((J.sw = (J.sw || 0) + mv) > 0.25) { J.sw = 0; noise(0.08, 0.015, 5000); }
      for (const s of J.sp) { if (s.d <= 0 || s.p.distanceTo(p) > 0.15) continue; s.d -= mv * 3.2; s.m.material.opacity = Math.max(0, s.d) * 0.8; if (s.d <= 0) { s.m.visible = false; tone(2600, 0.03, 0.3, 'sine'); addGold(2); } }
      if (J.sp.every(s => s.d <= 0) && !J.pause) { ding(); tone(3136, 0.04, 1.2, 'sine', 0.15); NEXT(finishGame, 0.9); } },
    release() { J.lp = null; },
    card() { const n = J.sp.filter(s => s.d > 0).length; return ['DRAG THE CLOTH', lst([[GOLD, 'THUMBPRINTS', n + ' LEFT', !n]]), 'p' + n]; },
    hint() { const s = J.sp.find(q => q.d > 0); return s ? [s.p.clone(), 'RUB'] : null; },
    shot() { return [V(ST.x, 1.75, ST.z), 1.3, 1.9, 0.12, 1.8, SY, 2.6]; },
    end() { CLOTH.visible = false; } };
  const GD = { cards: G1, slots: G2, cage: G3, vac: G4, polish: G5 }; if (!SL.length) delete GD.slots;
  const JX = new Proxy({}, { get: (_, k) => J && J[k], set: (_, k, v) => { if (J) J[k] = v; return true; } });
  const XB = casJobsB({ THREE, G, L, toWo, RAD, V, box, cyl, LM, CT, kit, own, fly, miss, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, coin, lst, lab, tagSprite, TAPR, scrW, dist, sayTo, rnd, shuffle, touch, J: JX, CA, snap: () => { snapK = true; }, PLAYER_FEMALE, isMuted: mutedQ });
  Object.assign(GD, XB.GD); for (const k in XB.RINGS) { RINGS[k] = XB.RINGS[k]; ringMesh(k); } KP.tips.push(...XB.tips);
  XF = csFun({ THREE, G, toWo, RAD, V, box, cyl, LM, CT, kit, cols, ring, own, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, coin, clack, lst, lab, row, tagSprite, TAPR, scrW, dist, sayTo, rnd, touch, J: JX, save, wear, heal, done, GAMES, kT, ln, hour, boss, cash, CA, jackpot: (sl, len) => XB.jackpot(sl, len), PLAYER_FEMALE });
  Object.assign(GD, XF.GD); for (const k in XF.RINGS) { RINGS[k] = XF.RINGS[k]; ringMesh(k); } for (const q of XF.fun) GN[q.k] = q; KP.tips.push(...XF.tips);
  // ================= run a game =================
  function startGame(g, P) { if (busy || !GD[g]) return; J = { g, miss: 0, gold: 0, objs: [], flies: [], t: 0, pause: 0, P }; busy = 'job'; const R = RINGS[g];
    if (P && !GN[g].walk && R) { Object.assign(P, { x: R[0], z: R[1], sp: 0 }); if (R[2] != null) { P.y = R[2]; P.vy = 0; } } GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; if (GN[J.g].fun) { const r = GD[J.g].result ? GD[J.g].result() : ''; stop(); K.chime(0.6); toast(r, 4); return; } const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(8); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat(pre + 'Done', d); save.setStat('csClears', save.stat('csClears', 0) + 1); K.finish(g, stars, gold, first); stop();
    const gf = XF.gift(); thanks = { g, gold, gf }; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 +' + gold + ' GOLD' + (gf ? ' \u00b7 PRIZE: ' + XF.line(gf)[1] + ' \u00b7 SEE ' + KEEP() : ''), gf ? 3.6 : 2.6); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) J.objs.forEach(o => o.parent && o.parent.remove(o)); busy = null; J = null; ptr.down = false; hideCard(); arrowM.visible = false; beacon.visible = false; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g], c = g.card && g.card(); if (!c) { hideCard(); return; }
    setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? J.gold + ' G' : J.g === 'cage' ? CP.name.toUpperCase() : KEEP()) + foot(c[0], GN[J.g].walk) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; if (J.flies.length) flyTick(dt); if (!J) return; const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return;
    const go = g.goal ? g.goal() : null; if (go) { arrowM.visible = true; beacon.visible = true; arrowM.position.set(go[0], go[2] + 1.9 + Math.sin(J.t * 4) * 0.15, go[1]); arrowM.rotation.y += dt * 2; beacon.position.set(go[0], 0.1, go[1]); } else { arrowM.visible = false; beacon.visible = false; }
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
    if (v.pos) { camT.pos.copy(v.pos); camT.look.copy(v.look); if (!camCur.on || snapK) { camCur.on = true; camCur.pos.copy(v.pos); camCur.look.copy(v.look); } snapK = false; camCur.pos.lerp(camT.pos, Math.min(1, dt * 6)); camCur.look.lerp(camT.look, Math.min(1, dt * 6)); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); return; }   // part B: fixed CCTV views
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = snapK ? 1 : Math.min(1, dt * 3.2); snapK = false; camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.x = clamp(camCur.pos.x, R0.X0 + 0.5, R0.X1 - 0.5); camCur.pos.z = clamp(camCur.pos.z, R0.Z0 + 0.5, R0.Z1 - 0.5); camCur.pos.y = clamp(camCur.pos.y, 0.6, 8.2); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.830-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- places, talk + prompt ----------
  const inRoom = P => P.x > R0.X0 && P.x < R0.X1 && P.z > R0.Z0 && P.z < R0.Z1 && (P.y || 0) > -4.5 && (P.y || 0) < 4;   // includes the count room downstairs (y -3.4)
  const ringAt = P => { for (const k in RINGS) { if (!GD[k]) continue; const [x, z, y = 0] = RINGS[k]; if (Math.hypot(P.x - x, P.z - z) < 1.05 && Math.abs((P.y || 0) - y) < 1.5) return GN[k]; } return null; };
  const upF = P => Math.abs(P.y || 0) < 1.5, nearBoss = P => upF(P) && Math.hypot(P.x - boss.position.x, P.z - boss.position.z) < 2.9, nearCash = P => upF(P) && Math.hypot(P.x - cash.position.x, P.z - cash.position.z) < 3.1;
  function prompt(P) { if (J && GN[J.g].walk) { const gp = GD[J.g].prompt ? GD[J.g].prompt(P) : null; return gp || (nearBoss(P) ? KEEP() + ' \u00b7 STOP THE JOB' : null); } if (busy) return null; if (!inRoom(P)) return null;
    const r = ringAt(P); if (r) return r.fun ? 'PLAY \u00b7 ' + r.name.toUpperCase() : (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; { const fp = XF.prompt(P); if (fp) return fp; } if (nearBoss(P)) return 'TALK \u00b7 ' + KEEP(); if (nearCash(P)) return 'TALK \u00b7 ' + CP.name.toUpperCase(); return null; }
  const nextJob = () => { const d = done(); return (GAMES.find(q => !d[q.k] && GD[q.k]) || GAMES.filter(q => GD[q.k]).sort((a, c) => K.stars(a.k) - K.stars(c.k))[0]).k; };
  const SUBL = { floor: 'Floor jobs. Which one?', back: 'Security, downstairs by the count room. Ready?' };
  const sub = (grp = 'floor') => sayTo(kT, [{ ...ln(SUBL[grp]), choices: [...GAMES.filter(q => GD[q.k] && q.grp === grp).map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => { if (!busy) startGame(q.k, lastP); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const menu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(), lastP); } }, { text: 'FLOOR JOBS', pick: () => sub('floor') }, { text: 'SECURITY', pick: () => sub('back') }, { text: (done().cage ? '\u2713 ' : '') + 'THE CASH CAGE', pick: () => { if (!busy) startGame('cage', lastP); } },
      { text: 'MY PERKS', pick: () => XF.perks() }, { text: 'A TIP, PLEASE', pick: () => sayTo(kT, [ln(KP.tips[talked % KP.tips.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    let open = first ? KP.hello[0] : KP.hello[1 + (talked % 3)]; if (thanks && thanks.gf) { open = XF.line(thanks.gf)[0]; thanks = null; } if (thanks) { open = KP.open[save.stat('csClears', 1) % 4] + ' ' + thanks.gold + ' gold. More?'; thanks = null; }
    sayTo(kT, [{ ...ln(open), choices: ch }]); };
  let talkedC = 0;
  const menuC = () => sayTo(cT, [{ ...lnC(CP.hello[talkedC++ ? 1 : 0]), choices: [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame('cage', lastP); } }, { text: 'A TIP, PLEASE', pick: () => sayTo(cT, [lnC(CP.tips[talkedC % CP.tips.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  function talk(P) { lastP = P; if (J && GN[J.g].walk) { if (GD[J.g].talk && GD[J.g].talk(P)) return true; if (nearBoss(P)) { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 1.8); return true; } const r = ringAt(P); if (r && r.k === J.g) { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 1.8); return true; } return false; }
    if (busy) return true; if (!inRoom(P)) return false; const r = ringAt(P); if (r) { startGame(r.k, P); return true; }
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (XF.talk(P)) return true; if (nearBoss(P)) { tone(1320, 0.05, 0.6); menu(!talked++); return true; } if (nearCash(P)) { coin(); menuC(); return true; } return false; }
  function quit() { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  let outT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; toastT -= dt; const near = Math.hypot(P.x + 127.5, P.z); G.visible = near < (touch ? 60 : 110);
    if (busy === 'job' && J) { outT = inRoom(P) ? 0 : outT + dt; if (outT > (GN[J.g].walk ? 2 : 0.3)) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (busy === 'job' && J && !GN[J.g].walk && fox) JW(fox, J.g); if (!G.visible) return;
    XB.tick(dt, P, inRoom(P), !!busy); if (busy === 'job' && J) jobTick(dt, P); hintTick(t);
    kit.animFox(cash, dt, 0, false); CUST.forEach(f => f.visible && kit.animFox(f, dt, 0, false));
    if (inRoom(P) && !busy && Math.hypot(P.x - cash.position.x, P.z - cash.position.z) < 4.5) { const a = Math.atan2(P.x - cash.position.x, P.z - cash.position.z); let d = a - cash.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); cash.rotation.y += d * Math.min(1, dt * 3); }
    K.tick(dt, P, { inShop: inRoom(P), busy: !!busy, near, talking: false }); XF.tick(dt, P, fox, { inShop: inRoom(P), busy: !!busy }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => (busy && J && GN[J.g].walk ? null : busy), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), boss, cash, GD, RINGS,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    snap() { snapK = true; }, _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) jobTick(dt, lastP); }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), card, jackpot: s => XB.jackpot(s || L.slots[0]), dispose() { card.remove(); HINT.remove(); K.dispose(); XB.dispose(); } };
  window.__casJobs = API; return API;
}
