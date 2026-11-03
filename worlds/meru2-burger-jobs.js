// MERU 2.0 — s118 BURGERS [meruBurgers] DELUXE PART A (Ben's answers s118). TWO keepers: SIZZLE behind the counter (2D look, his 2D lines verbatim;
// YES, PUT ME TO WORK! = THE SHIFT, the burger-shift game that already plays in this diner) + BUN, the delivery fox, by the staff door (floor + back jobs).
// Part A jobs: MOP + WIPE (Bun, walk: spills on the hall floor + sticky tables) · RESTOCK THE CONDIMENT BAR (Sizzle, tap the right jug for the empty
// dispenser) · WASH THE DISHES (Sizzle, drag the sponge over the grime). NEW: condiment bar + dish station on the hall side of the staff wall.
// Built in the ORIGINAL frame (hall f 70..103.4 × 32..64, door W (70, 48); back of house x 103.4..114 × 40..56 behind the staff door, z 46..50);
// meru2-walk.js adds API.group to RL.MV 'burgers'. Stats prefix mbr (mbrDone, mbrClears, mbrStar_/mbrBest_<job>). s119 PART B in worlds/meru2-burger-jobs2.js (peel + chop, bus, truck, Bun's delivery loop). Parts C / D to come.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { bgJobsB, BG_GAMES_B } from './meru2-burger-jobs2.js';
import { bgPrizes } from './meru2-burger-prize.js';
import { bgLife } from './meru2-burger-life.js?v=s645';   // s121 part D: look + life (smoke + sizzle, rush crowds, jukebox, neon, fans, shake bar, drive-thru)   // s120 part C: prizes, staff meal, secret menu, employee of the month, own booth   // s119 part B: peel + chop, bus the tables, unload the truck, Bun's delivery loop
const SZ = { name: 'Sizzle', role: 'BURGERS', color: '#c42d3c', torso: ['#33333d', '#1a1a22', '#0a0a0e'],
  first: 'Any chance you are looking for a job? We got great burgers here, super fun to make.',
  hello: ['Grill is hot. Pick a job.', 'Back for more? The tickets missed you.', 'Apron on. What will it be?'],
  tips: ['Read the ticket first. Always the ticket.', 'Fries go golden, not brown. Brown is for toast.', 'Ketchup runs out first. Every single day.', 'A clean plate is a happy customer.'] };
const MAKE = ['Seven things, in order, and the ticket tells you all seven. Sear the patty and FLIP it so both sides match \u2014 that is the whole of the grill.', 'Cheese goes on before it comes off the heat, or it just sits there cold. Then sauce, then dress the bun with only what the ticket asks for. Only what it asks for.', 'Chop the side, fry it GOLDEN, and slide the cup under the right tap. Four orders and then you are done.'];
const HOW = ['Cooked for the barracks. Two hundred foxes, twice a day, and not one of them ever said a word about it.', 'So I put a griddle on a cart at the ARENA gate. Sold out before the second bout. Sold out the next day before the first.', 'The Tavern let me build onto their east wall for a cut of it. Best deal either of us ever made \u2014 they get the trade, I get the wall.'];
const BN = { name: 'Bun', role: 'DELIVERY + FLOOR', torso: ['#f3f2f2', '#c42d3c', '#7a1808'],
  hello: ['Bun. I deliver, I mop, I carry. Need work?', 'Floor is sticky again. Want a job?', 'Back from a run. What do you need?'],
  tips: ['Mop first, then wipe. Never the other way.', 'Sticky tables mean someone had a shake.', 'Watch for the shine on the floor. That is a spill.'] };
export function buildBurgerJobs({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted, shift = () => false, shiftOn = () => false, heal = null, wear = null }) { const JW = jobWorker(THREE);
  const mutedQ = () => { try { return !!(isMuted && isMuted()); } catch (e) { return true; } };
  const R0 = { X0: 70, X1: 103.4, Z0: 32, Z1: 64 }, BH = { X0: 103.4, X1: 114, Z0: 40, Z1: 56 }, DOOR = [70, 48];
  const G = new THREE.Group(); G.name = 'burgerJobs'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const toW = v => { G.updateWorldMatrix(true, false); return G.localToWorld(v.clone()); };
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const colF = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] });
  const label = (txt, bg, fg, w = 512, h = 96, fs = 54) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = '900 ' + fs + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 18, H / 2 + 2); });
  const plane = (tex, w, h, x, y, z, ry = 0, par = G) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', STEEL = '#c9ced3', CHROME = '#cbd5e1';
  // ================= the keepers =================
  let oldSizzle = null; scene.traverse(o => { if (!oldSizzle && o.userData && o.userData.foxKey === 'burgerCook') oldSizzle = o; });
  const sizzle = kit.makeFox({ key: 'mbrSizzle', torso: SZ.torso, outfit: 'vest', mood: 'warm' });
  const SIZ = { x: 86.7, z: 62.4, ry: Math.PI }; sizzle.position.set(SIZ.x, 0, SIZ.z); sizzle.rotation.y = SIZ.ry; G.add(sizzle);
  { const P0 = sizzle.userData && sizzle.userData.P; if (P0 && P0.body) box(P0.body, 0.42, 0.6, 0.04, WHITE, 0, 0.6, 0.3); if (P0 && P0.head) { box(P0.head, 0.4, 0.12, 0.3, WHITE, 0, 0.33, 0); box(P0.head, 0.41, 0.03, 0.31, RED, 0, 0.28, 0); } }
  const bun = kit.makeFox({ key: 'mbrBun', torso: BN.torso, outfit: 'vest', mood: 'happy' });
  const BUN = { x: 101.9, z: 51.4, ry: -Math.PI / 2 }; bun.position.set(BUN.x, 0, BUN.z); bun.rotation.y = BUN.ry; G.add(bun); cols.push({ c: [BUN.x, BUN.z, 0.4] });
  { const P0 = bun.userData && bun.userData.P; if (P0 && P0.head) { box(P0.head, 0.4, 0.1, 0.4, RED, 0, 0.3, 0); box(P0.head, 0.34, 0.03, 0.2, RED, 0, 0.26, 0.28); } }
  const kT = { key: 'mbrSizzle', name: SZ.name, role: SZ.role, obj: sizzle, ry: SIZ.ry, r: 6 }, bT = { key: 'mbrBun', name: BN.name, role: BN.role, obj: bun, ry: BUN.ry, r: 6 };
  const ln = text => ({ who: 'mbrSizzle', role: SZ.role, text }), lnB = text => ({ who: 'mbrBun', role: BN.role, text });
  // ================= NEW: condiment bar + dish station on the hall face of the staff wall =================
  const COND = [['KETCHUP', RED], ['MUSTARD', YEL], ['RELISH', '#3f9a3a'], ['MAYO', '#f6f0dc'], ['ONIONS', '#b98ad6']], CBZ = [38.2, 39.2, 40.2, 41.2, 42.2], CBX = 102.85;
  box(G, 0.8, 0.95, 4.8, '#c42d3c', CBX, 0.475, 40); box(G, 0.86, 0.05, 4.9, '#e6e1d3', CBX, 0.975, 40); colF(102.4, 103.3, 37.55, 42.45);
  plane(label('SAUCES \u00b7 HELP YOURSELF', INK, YEL, 512, 64, 34), 2.4, 0.3, 103.2, 1.95, 40, -Math.PI / 2);
  const DISP = COND.map(([n, c], i) => { const g = new THREE.Group(); g.position.set(CBX, 1.0, CBZ[i]); G.add(g); box(g, 0.34, 0.5, 0.3, CHROME, 0, 0.25, 0); box(g, 0.3, 0.06, 0.26, c, 0, 0.53, 0); cyl(g, 0.02, 0.02, 0.1, INK, -0.19, 0.3, 0, 6);
    const lvl = box(g, 0.02, 0.4, 0.1, c, -0.175, 0.22, 0.09); lvl.geometry.translate(0, 0.2, 0); lvl.position.y = 0.02; const tg = plane(label(n, c === '#f6f0dc' ? INK : c, c === '#f6f0dc' || c === YEL ? INK : WHITE, 256, 64, 34), 0.3, 0.08, -0.176, 0.45, 0, -Math.PI / 2, g);
    return { g, lvl, n, c, fill: 1 }; });
  const CART = new THREE.Group(); CART.position.set(102.0, 0, 36.7); G.add(CART); box(CART, 1.5, 0.08, 0.6, STEEL, 0, 0.7, 0); for (const sx of [-0.7, 0.7]) for (const sz of [-0.26, 0.26]) cyl(CART, 0.02, 0.02, 0.7, INK, sx, 0.35, sz, 6); box(CART, 1.4, 0.2, 0.5, '#9a7550', 0, 0.84, 0); colF(101.2, 102.8, 36.35, 37.05);
  const JUGS = COND.map(([n, c], i) => { const m = new THREE.Group(); m.position.set(-0.56 + i * 0.28, 0.94, 0); CART.add(m); cyl(m, 0.08, 0.09, 0.26, c, 0, 0.13, 0, 10); cyl(m, 0.03, 0.03, 0.06, INK, 0, 0.29, 0, 8); return { m, n, c, home: m.position.clone() }; });
  const DSX = 102.85, DSZ = 55;
  box(G, 0.8, 0.95, 3.6, STEEL, DSX, 0.475, DSZ); box(G, 0.86, 0.05, 3.7, '#dfe3e6', DSX, 0.975, DSZ); colF(102.4, 103.3, 53.15, 56.85);
  box(G, 0.6, 0.02, 1.0, '#7c8288', DSX, 0.985, 54.1); for (const dz of [-0.5, 0.5]) box(G, 0.6, 0.16, 0.04, STEEL, DSX, 1.07, 54.1 + dz); for (const dx of [-0.3, 0.3]) box(G, 0.04, 0.16, 1.0, STEEL, DSX + dx, 1.07, 54.1);
  cyl(G, 0.02, 0.02, 0.5, CHROME, 103.15, 1.25, 54.1, 6); box(G, 0.3, 0.03, 0.03, CHROME, 103.0, 1.5, 54.1);
  const RACK = new THREE.Group(); RACK.position.set(DSX, 1.0, 56.0); G.add(RACK); box(RACK, 0.5, 0.04, 1.2, CHROME, 0, 0.02, 0); for (let i = 0; i < 7; i++) box(RACK, 0.02, 0.3, 0.02, CHROME, -0.22, 0.17, -0.5 + i * 0.17);
  const STACK = []; for (let i = 0; i < 5; i++) { const p = cyl(G, 0.17, 0.15, 0.025, WHITE, DSX + 0.05, 1.02 + i * 0.03, 54.9, 16); STACK.push(p); }
  plane(label('DISH RETURN', INK, YEL, 512, 64, 40), 1.4, 0.18, 103.2, 1.95, 55, -Math.PI / 2);
  // ================= rings =================
  const RINGS = { cond: [101.75, 40.0], dish: [101.85, 55.4], mop: [101.2, 46.8] };
  const ringMesh = k => { const [x, z] = RINGS[k]; const r1 = cyl(G, 0.5, 0.5, 0.012, YEL, x, 0.09, z, 22), r2 = cyl(G, 0.42, 0.42, 0.014, INK, x, 0.092, z, 22); r1.renderOrder = r2.renderOrder = 2; }; for (const k in RINGS) ringMesh(k);
  // ================= shop kit =================
  const GAMES = [{ k: 'cond', name: 'Restock the Condiment Bar', color: RED, grp: 'siz' }, { k: 'dish', name: 'Wash the Dishes', color: '#38bdf8', grp: 'siz' }, { k: 'mop', name: 'Mop + Wipe', color: '#3f9a3a', grp: 'bun', walk: true }, ...BG_GAMES_B];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), pre = 'mbr';
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted: mutedQ, prefix: pre, color: SZ.color, boardTitle: "Sizzle's best", toWorld: toW, room: R0, door: [DOOR[0] + 0.5, DOOR[1]], keeper: sizzle, keeperRy: SIZ.ry, games: GAMES,
    board: { x: 70.12, y: 2.7, z: 41.5, ry: Math.PI / 2, w: 1.3 }, hiring: { x: 71.6, y: 0, z: 44.0, ry: Math.PI / 2 }, hiringLine: 'WALK UP \u00b7 START WORK',
    sun: [{ x: 76, z: 34.6, w: 3, d: 2.4 }, { x: 95.5, z: 34.6, w: 3, d: 2.4 }, { x: 74.5, z: 61.4, w: 3, d: 2.4 }], lamps: [[75, 2.6, 38.4], [86, 2.6, 42.8], [97, 2.6, 38.4], [74.5, 2.6, 54.6], [100.3, 2.6, 58.6]],
    browse: [[101.4, 39.0, Math.PI / 2], [81.5, 55.2, Math.PI], [86.7, 57.6, Math.PI]], slots: 2, clock: { x: 70.12, y: 3.1, z: 55.5, ry: Math.PI / 2 } });
  // ================= state, sound, card UI (same card as every shop) =================
  let toastTxt = '', toastT = 0, talked = 0, talkedB = 0, busy = null, J = null, thanks = null, lastP = null, firstTalk = true;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at0 = 0) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at0, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = bf; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), swish = () => noise(0.35, 0.03, 1200), squirt = () => { noise(0.25, 0.04, 600); tone(220, 0.03, 0.2, 'sine'); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + SZ.color + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span></div>';
  const lst = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + items.map(([sw, t, r, ok]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (r ? ' \u00b7 ' + r : '') + '</span>').join('') + '</div>' : items.map(a => row(...a)).join('');
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
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = V(), inv = new THREE.Matrix4();
  const ray = () => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); G.updateWorldMatrix(true, false); inv.copy(G.matrixWorld).invert(); return rc.ray.clone().applyMatrix4(inv); };
  const hitY = y => (ray().intersectPlane(new THREE.Plane(V(0, 1, 0), -y), hitP) ? hitP.clone() : null);
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const Fq of J.flies.slice()) { Fq.t += dt / Fq.dur; const k = Math.min(1, Fq.t), e = k * k * (3 - 2 * k); Fq.obj.position.lerpVectors(Fq.from, Fq.to, e); Fq.obj.position.y += Math.sin(k * Math.PI) * Fq.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(Fq), 1); Fq.then && Fq.then(); } } }
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt + bg] || (tagTex[txt + bg] = CT(160, 96, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = '900 ' + (txt.length > 6 ? 26 : txt.length > 4 ? 34 : 44) + 'px Archivo, sans-serif'; g.fillText(txt, W2 / 2, H / 2 + 3); }));
  const tagSprite = (txt, bg = '#ffffff', fg = INK, s = 0.5) => { if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: false })); sp.scale.set(s, s * 0.6, 1); sp.renderOrder = 6; return sp; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (after, t = 1.0) => { J.pause = t; J.after = after; };
  const done = () => save.stat(pre + 'Done', null) || {};
  const blotT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 3, 32, 32, 31); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.65, 'rgba(255,255,255,0.85)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const blot = (c, s, op = 0.85) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: blotT, color: c, transparent: true, opacity: op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })); m.rotation.x = -Math.PI / 2; m.renderOrder = 3; return m; };
  // ================= JOB 1: RESTOCK THE CONDIMENT BAR (Sizzle) — a dispenser runs EMPTY, tap the jug that matches =================
  const G1 = {
    begin() { J.n = 0; J.N = 8; DISP.forEach(d => { d.fill = 0.6 + Math.random() * 0.4; d.lvl.scale.y = d.fill; }); this.next(); toast('A SAUCE RUNS OUT \u00b7 TAP ITS JUG ON THE CART', 2.6); },
    next() { if (J.n >= J.N) { finishGame(); return; } let i; do { i = Math.random() * 5 | 0; } while (i === J.last && Math.random() < 0.8); J.last = i; J.want = i; DISP[i].fill = 0.05; DISP[i].lvl.scale.y = 0.05;
      if (J.tag) { G.remove(J.tag); J.tag = null; } J.tag = own(tagSprite('EMPTY', RED, WHITE, 0.46)); J.tag.position.set(CBX - 0.2, 1.85, CBZ[i]); J.t0 = J.t; },
    press() { const k = nearest(JUGS, j => CART.position.clone().add(j.home).add(V(0, 0.12, 0)), TAPR() * 1.4); if (k < 0) return;
      if (k !== J.want) { miss('THAT IS ' + JUGS[k].n + ' \u00b7 THE EMPTY ONE IS ' + COND[J.want][0]); return; }
      const jg = JUGS[k], D = DISP[k], wpos = V(); jg.m.getWorldPosition(wpos); G.worldToLocal(wpos); CART.remove(jg.m); jg.m.position.copy(wpos); G.add(jg.m); squirt();
      fly(jg.m, V(CBX - 0.25, 1.75, CBZ[k]), 0.45, 0.4, () => { D.fill = 1; D.lvl.scale.y = 1; addGold(J.t - J.t0 < 3 ? 3 : 2); pop(); G.remove(jg.m); jg.m.position.copy(jg.home); CART.add(jg.m); J.n++; NEXT(() => G1.next(), 0.5); }); },
    card() { return ['REFILL ' + COND[J.want][0], lst(COND.map(([n, c], i) => [c, n, i === J.want ? 'EMPTY' : '', i !== J.want])) + gauge(J.n / J.N), J.n + '_' + J.want]; },
    hint() { const j = JUGS[J.want]; return [CART.position.clone().add(j.home).add(V(0, 0.3, 0)), 'TAP']; },
    shot() { return [V(102.4, 1.1, 39.2), 4.2, 1.9, 0.4, 2.6, -Math.PI / 2 - 0.25, 4.2]; },
    end() { JUGS.forEach(j => { if (j.m.parent !== CART) { j.m.parent && j.m.parent.remove(j.m); j.m.position.copy(j.home); CART.add(j.m); } }); DISP.forEach(d => { d.fill = 1; d.lvl.scale.y = 1; }); } };
  // ================= JOB 2: WASH THE DISHES (Sizzle) — drag the sponge over every grime spot, 5 plates =================
  const SPONGE = new THREE.Group(); box(SPONGE, 0.16, 0.05, 0.1, YEL, 0, 0.035, 0); box(SPONGE, 0.16, 0.02, 0.1, '#3f9a3a', 0, 0.07, 0); SPONGE.visible = false; G.add(SPONGE);
  const SUDS = []; const sud = (x, z) => { const m = blot('#ffffff', 0.08 + Math.random() * 0.06, 0.9); m.position.set(x, 1.05, z); own(m); SUDS.push({ m, t: 0.8 }); };
  const PLATE = new THREE.Vector3(DSX, 1.0, 54.1);
  const G2 = {
    begin() { J.n = 0; J.N = 5; STACK.forEach(p => { p.visible = true; }); SPONGE.visible = true; SPONGE.position.set(DSX - 0.2, 1.05, 54.6); J.racked = []; this.next(); toast('DRAG THE SPONGE OVER THE GRIME', 2.6); },
    next() { if (J.n >= J.N) { finishGame(); return; } STACK[J.N - 1 - J.n].visible = false;
      const p = own(new THREE.Group()); p.position.copy(PLATE); cyl(p, 0.2, 0.17, 0.025, WHITE, 0, 0.02, 0, 18); cyl(p, 0.13, 0.13, 0.027, '#e9e4d6', 0, 0.021, 0, 18); J.plate = p;
      const n = 4 + (Math.random() * 3 | 0); J.spots = []; for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, r = Math.random() * 0.14; const m = blot(['#8a5a2a', '#b8733f', '#6b4a2a', '#c9a23a'][i % 4], 0.11 + Math.random() * 0.05, 0.95); m.position.set(Math.sin(a) * r, 0.04, Math.cos(a) * r); p.add(m); J.spots.push({ m, d: 1 }); }
      J.t0 = J.t; J.over = false; },
    drag() { if (!ptr.down || !J.plate) return; const h = hitY(1.05); if (!h) return; SPONGE.position.set(clamp(h.x, DSX - 0.32, DSX + 0.32), 1.05, clamp(h.z, 53.6, 54.6)); const lx = SPONGE.position.x - PLATE.x, lz = SPONGE.position.z - PLATE.z;
      let any = false; J.spots.forEach(s => { if (s.d <= 0) return; if (Math.hypot(s.m.position.x - lx, s.m.position.z - lz) < 0.09) { s.d -= 0.09; s.m.material.opacity = Math.max(0, s.d) * 0.95; any = true; if (s.d <= 0) { s.m.visible = false; pop(); } } });
      if (any) { if (Math.random() < 0.3) sud(SPONGE.position.x + rnd(-0.05, 0.05), SPONGE.position.z + rnd(-0.05, 0.05)); if (Math.random() < 0.15) noise(0.08, 0.015, 3000); }
      if (J.spots.every(s => s.d <= 0)) this.clean(); },
    clean() { const p = J.plate; J.plate = null; ding(); addGold(J.t - J.t0 < 7 ? 4 : 3); const slot = J.racked.length; J.racked.push(p);
      fly(p, V(DSX - 0.12, 1.18, 56.0 - 0.5 + slot * 0.17), 0.5, 0.25, () => { p.rotation.set(0, 0, Math.PI / 2); }); J.n++; NEXT(() => G2.next(), 0.7); },
    tick(dt) { for (let i = SUDS.length - 1; i >= 0; i--) { const s = SUDS[i]; s.t -= dt; s.m.material.opacity = Math.max(0, s.t); if (s.t <= 0) { s.m.parent && s.m.parent.remove(s.m); SUDS.splice(i, 1); } }
      if (J.plate && !J.over && J.t - J.t0 > 14) { J.over = true; miss('TOO SLOW \u00b7 THAT PLATE GOES BACK IN TO SOAK'); const p = J.plate; J.plate = null; p.parent && p.parent.remove(p); J.n++; NEXT(() => G2.next(), 1.0); } },
    card() { const left = J.spots ? J.spots.filter(s => s.d > 0).length : 0; return ['PLATE ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, '<div style="font-size:13px;font-weight:800">GRIME LEFT \u00b7 ' + left + '</div>' + gauge(J.n / J.N), J.n + '_' + left]; },
    hint() { const s = J.spots && J.spots.find(q => q.d > 0); return s ? [V(PLATE.x + s.m.position.x, 1.08, PLATE.z + s.m.position.z), 'SCRUB'] : null; },
    shot() { return [V(DSX, 1.02, 54.4), 1.5, 1.2, 0.95, 1.4, -Math.PI / 2, 2.4]; },
    end() { SPONGE.visible = false; STACK.forEach(p => { p.visible = true; }); SUDS.length = 0; } };
  // ================= JOB 3: MOP + WIPE (Bun, walk) — spills on the floor (shine) + sticky tables, walk up + E =================
  const SPILLS = [[73.5, 46.2], [79, 49.5], [84, 47], [90, 50], [95.5, 46.5], [100, 49], [88, 36.2], [77.5, 52.5]];
  const TABLES = [...[75, 80.5, 86, 91.5, 97].flatMap(x => [[x, 38.4], [x, 42.8]]), [74.5, 54.6], [78.5, 54.6], [96.3, 54.6], [100.3, 58.6]];
  const MOP = new THREE.Group(); cyl(MOP, 0.015, 0.015, 1.3, '#9a7550', 0, 0.65, 0, 6); cyl(MOP, 0.14, 0.1, 0.12, '#e6e1d3', 0, 0.06, 0, 10); MOP.visible = false; G.add(MOP);
  const G3 = {
    begin() { J.list = [...shuffle(SPILLS.slice()).slice(0, 4).map(([x, z]) => ({ x, z, k: 'spill' })), ...shuffle(TABLES.slice()).slice(0, 2).map(([x, z]) => ({ x, z, k: 'table' }))]; J.left = J.list.length;
      J.list.forEach(it => { if (it.k === 'spill') { it.m = own(blot(['#c9a23a', '#8a5a2a', '#f472b6'][Math.random() * 3 | 0], 1.1, 0.7)); it.m.position.set(it.x, 0.075, it.z); }
        else { it.m = own(blot('#f472b6', 0.7, 0.55)); it.m.position.set(it.x, 0.81, it.z); } it.tag = own(tagSprite(it.k === 'spill' ? 'MOP' : 'WIPE', it.k === 'spill' ? '#7cff9b' : '#f9a8d4', INK, 0.4)); it.tag.position.set(it.x, it.k === 'spill' ? 0.9 : 1.6, it.z); });
      J.act = 0; toast('SPILLS + STICKY TABLES \u00b7 WALK UP + ' + (touch ? 'TALK' : 'E'), 2.8); },
    near(P) { let b = null, bd = 9; for (const it of J.list) { if (it.done) continue; const d = Math.hypot(P.x - it.x, P.z - it.z); if (d < (it.k === 'spill' ? 1.1 : 1.9) && d < bd) { bd = d; b = it; } } return b; },
    prompt(P) { const it = this.near(P); return it ? (it.k === 'spill' ? 'MOP THE SPILL' : 'WIPE THE TABLE') : null; },
    talk(P) { const it = this.near(P); if (!it || J.act > 0) return !!it; J.act = 0.9; J.cur = it; swish(); if (it.k === 'spill') { MOP.visible = true; MOP.position.set(it.x, 0, it.z); } return true; },
    tick(dt) { if (J.t > 75 + J.miss * 15) miss('THE FLOOR IS STILL STICKY \u00b7 KEEP GOING', 1.6);
      if (J.act > 0) { J.act -= dt; const it = J.cur; it.m.material.opacity *= 0.9; MOP.rotation.y += dt * 10; MOP.position.x = it.x + Math.sin(J.t * 12) * 0.25;
        if (J.act <= 0) { it.done = true; it.m.visible = false; it.tag.visible = false; MOP.visible = false; J.left--; addGold(3); pop(); if (J.left <= 0) { ding(); NEXT(() => finishGame(), 0.6); } } } },
    goal() { const P = J.P; if (!P) return null; let b = null, bd = 1e9; for (const it of J.list) { if (it.done) continue; const d = Math.hypot(P.x - it.x, P.z - it.z); if (d < bd) { bd = d; b = it; } } return b ? [b.x, b.z, b.k === 'table' ? 0.8 : 0] : null; },
    card() { return ['CLEAN ' + J.left + ' MORE', lst(J.list.map(it => [it.k === 'spill' ? '#7cff9b' : '#f9a8d4', it.k === 'spill' ? 'SPILL' : 'TABLE', '', !!it.done])), J.left + '_' + J.miss]; },
    end() { MOP.visible = false; } };
  const GD = { cond: G1, dish: G2, mop: G3 };
  const JX = new Proxy({}, { get: (_, k) => J && J[k], set: (_, k, v) => { if (J) J[k] = v; return true; } });
  const XB = bgJobsB({ THREE, G, V, box, cyl, LM, CT, kit, own, fly, miss, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, swish, lst, gauge, tagSprite, TAPR, scrW, dist, ptr, hitY, rnd, shuffle, clamp, touch, bun, BUN, TABLES, DSX, J: JX, colF });
  Object.assign(GD, XB.GD); for (const k in XB.RINGS) { RINGS[k] = XB.RINGS[k]; ringMesh(k); } BN.tips.push(...XB.tips);
  const PZ = bgPrizes({ THREE, G, box, cyl, CT, save, heal, wear, toast: (t, s) => toast(t, s), ding, tone, done, GAMES, sayTo, kT, ln, CHOICE_BYE });
  const LF = bgLife({ THREE, G, box, cyl, LM, CT, kit, cols, touch, hour, tone, noise, toast: (t, s) => toast(t, s), isMuted: mutedQ, inRoom: P => inRoom(P), busyQ: () => !!busy || shiftOn() });
  const arrowM = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: RED })); arrowM.rotation.x = Math.PI; arrowM.visible = false; arrowM.renderOrder = 5; G.add(arrowM);
  const beacon = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 24), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.8, depthWrite: false })); beacon.rotation.x = -Math.PI / 2; beacon.visible = false; G.add(beacon);
  // ================= run a game =================
  const KEEP = g => (GN[g] && GN[g].grp === 'bun' ? BN.name : SZ.name).toUpperCase();
  function startGame(g, P) { if (busy || !GD[g]) return; J = { g, miss: 0, gold: 0, objs: [], flies: [], t: 0, pause: 0, P }; busy = 'job'; const R = RINGS[g]; if (P && R && !GN[g].walk) Object.assign(P, { x: R[0], z: R[1], sp: 0 }); GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(8); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat(pre + 'Done', d); save.setStat(pre + 'Clears', save.stat(pre + 'Clears', 0) + 1); K.finish(g, stars, gold, first); stop();
    const gf = PZ.gift(); thanks = { g, gold, by: GN[g].grp, gf }; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 +' + gold + ' GOLD' + (gf ? ' \u00b7 PRIZE: ' + PZ.line(gf)[1] + ' \u00b7 SEE SIZZLE' : ''), gf ? 3.2 : 2.6); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) J.objs.forEach(o => o.parent && o.parent.remove(o)); busy = null; J = null; ptr.down = false; hideCard(); arrowM.visible = false; beacon.visible = false; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g], c = g.card && g.card(); if (!c) { hideCard(); return; } setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? J.gold + ' G' : KEEP(J.g)) + foot(c[0]) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; if (J.flies.length) flyTick(dt); if (!J) return; const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0) J.pause = 0; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return;
    const go = g.goal ? g.goal() : null; if (go) { arrowM.visible = beacon.visible = true; arrowM.position.set(go[0], go[2] + 1.9 + Math.sin(J.t * 4) * 0.15, go[1]); arrowM.rotation.y += dt * 2; beacon.position.set(go[0], 0.1 + go[2], go[1]); } else arrowM.visible = beacon.visible = false;
    drawCard(); }
  // ---------- camera: job shots, clamped inside the hall ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !GN[J.g].walk && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    const RB = camT.look.x > R0.X1 ? { X0: BH.X0 + 0.3, X1: BH.X1 - 0.4, Z0: BH.Z0 + 0.5, Z1: BH.Z1 - 0.5 } : { X0: R0.X0 + 0.5, X1: R0.X1 - 0.3, Z0: R0.Z0 + 0.5, Z1: R0.Z1 - 0.5 }; camCur.pos.x = clamp(camCur.pos.x, RB.X0, RB.X1); camCur.pos.z = clamp(camCur.pos.z, RB.Z0, RB.Z1); camCur.pos.y = clamp(camCur.pos.y, 0.6, 4.0); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.830-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- places, talk + prompt ----------
  const inHall = P => P.x > R0.X0 && P.x < R0.X1 && P.z > R0.Z0 && P.z < R0.Z1 && Math.abs(P.y || 0) < 4;
  const inRoom = P => inHall(P) || (P.x >= BH.X0 && P.x < BH.X1 && P.z > BH.Z0 && P.z < BH.Z1 && Math.abs(P.y || 0) < 4) || (!!J && J.g === 'truck' && XB.inYard(P));
  const ringAt = P => { for (const k in RINGS) { const [x, z] = RINGS[k]; if (Math.hypot(P.x - x, P.z - z) < 1.05) return GN[k]; } return null; };
  const nearSiz = P => Math.hypot(P.x - SIZ.x, P.z - SIZ.z) < 3.4 && P.z < 60, nearBun = P => XB.bunHome() && Math.hypot(P.x - bun.position.x, P.z - bun.position.z) < 2.6, bunOut = P => !XB.bunHome() && Math.hypot(P.x - BUN.x, P.z - BUN.z) < 2.6;
  function prompt(P) { if (J && GN[J.g].walk) { const gp = GD[J.g].prompt ? GD[J.g].prompt(P) : null; return gp || (nearBun(P) ? BN.name.toUpperCase() + ' \u00b7 STOP THE JOB' : null); } if (busy || shiftOn() || !inRoom(P)) return null; const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; { const lp = LF.prompt(P); if (lp) return lp; } if (nearBun(P)) return 'TALK \u00b7 ' + BN.name.toUpperCase(); if (bunOut(P)) return 'BUN IS OUT ON A DELIVERY'; if (nearSiz(P)) return 'TALK \u00b7 ' + SZ.name.toUpperCase(); return null; }
  const nextJob = grp => { const d = done(), L = GAMES.filter(q => GD[q.k] && (!grp || q.grp === grp)); return (L.find(q => !d[q.k]) || L.slice().sort((a, c) => K.stars(a.k) - K.stars(c.k))[0]).k; };
  const sub = (T, lnF, grp, line) => sayTo(T, [{ ...lnF(line), choices: [...GAMES.filter(q => q.grp === grp).map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => { if (!busy) startGame(q.k, lastP); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const menuS = () => { let open = firstTalk ? SZ.first : SZ.hello[talked % SZ.hello.length]; firstTalk = false; { const pg = PZ.takePending(); if (pg && !(thanks && thanks.gf)) thanks = { by: 'siz', gold: 0, gf: pg }; } if (thanks && thanks.gf) { const gf = thanks.gf; thanks = null; if (PZ.thankLine(gf)) return; open = PZ.line(gf)[0]; } else if (thanks && thanks.by === 'siz') { open = 'Nice work. ' + thanks.gold + ' gold, and the sauces thank you.'; thanks = null; } talked++;
    sayTo(kT, [{ ...ln(open), choices: [{ text: CHOICE_WORK, pick: () => { if (!busy && !shift()) toast('THE GRILL IS BUSY \u00b7 TRY AGAIN', 2); } }, { text: 'KITCHEN JOBS', pick: () => sub(kT, ln, 'siz', 'Small jobs between shifts. Pick one.') },
      { text: 'STAFF MEAL', pick: () => PZ.meal() }, { text: 'MY PRIZES', pick: () => PZ.prizes() },
      { text: 'TELL ME ABOUT BURGERS', pick: () => sayTo(kT, [{ ...ln('Ask away.'), choices: [{ text: 'HOW DO I MAKE BURGERS?', pick: () => sayTo(kT, MAKE.map(ln)) }, { text: 'HOW DID YOU GET INTO THE BURGER BUSINESS?', pick: () => sayTo(kT, HOW.map(ln)) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'A TIP, PLEASE', pick: () => sayTo(kT, [ln(SZ.tips[talked % SZ.tips.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); };
  const menuB = () => { let open = BN.hello[talkedB++ ? 1 + (talkedB % 2) : 0]; if (thanks && thanks.by === 'bun') { open = 'Floor shines. ' + thanks.gold + ' gold for you.' + (thanks.gf ? ' Sizzle has a prize for you.' : ''); if (!thanks.gf) thanks = null; else thanks.by = 'siz'; }
    sayTo(bT, [{ ...lnB(open), choices: [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob('bun'), lastP); } }, { text: 'FLOOR JOBS', pick: () => sub(bT, lnB, 'bun', 'Floor jobs. Which one?') },
      { text: 'WHERE DO YOU DELIVER?', pick: () => sayTo(bT, [lnB('Everywhere. The square, the lake, both apartment lobbies.'), lnB('White bag, red letters. If you see it, it is mine.')]) },
      { text: 'A TIP, PLEASE', pick: () => sayTo(bT, [lnB(BN.tips[talkedB % BN.tips.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); };
  function talk(P) { lastP = P; if (J && GN[J.g].walk) { if (GD[J.g].talk && GD[J.g].talk(P)) return true; if (nearBun(P)) { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 1.8); return true; } return false; } if (busy || shiftOn() || !inRoom(P)) return false;
    const r = ringAt(P); if (r) { startGame(r.k, P); return true; }
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (LF.talk(P)) return true; if (nearBun(P)) { tone(880, 0.04, 0.2, 'triangle'); menuB(); return true; } if (bunOut(P)) { toast('BUN IS OUT ON A DELIVERY \u00b7 BACK SOON', 1.8); return true; } if (nearSiz(P)) { tone(660, 0.04, 0.2, 'triangle'); menuS(); return true; } return false; }
  function quit() { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  let outT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; toastT -= dt; const near = Math.hypot(P.x - 90, P.z - 48); G.visible = near < (touch ? 60 : 110); if (oldSizzle) oldSizzle.visible = false;
    if (busy === 'job' && J) { outT = inRoom(P) ? 0 : outT + dt; if (outT > (GN[J.g].walk ? 2 : 0.3)) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (busy === 'job' && J && !GN[J.g].walk && fox) JW(fox, J.g); if (!G.visible) { LF.away(); return; }
    if (busy === 'job' && J) jobTick(dt, P); hintTick(t);
    const bunWalking = XB.bunTick(dt, P, !!busy || shiftOn()); if (!bunWalking) kit.animFox(bun, dt, 0, false);
    if (bunWalking) {} else if (inRoom(P) && !busy && nearBun(P)) { const a = Math.atan2(P.x - bun.position.x, P.z - bun.position.z); let d = a - bun.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); bun.rotation.y += d * Math.min(1, dt * 3); }
    else if (!busy) { let d = BUN.ry - bun.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); bun.rotation.y += d * Math.min(1, dt * 2); }
    K.tick(dt, P, { inShop: inRoom(P), busy: !!busy || shiftOn(), near, talking: false }); PZ.tick(dt, P, fox, shiftOn());
    try { LF.tick(dt, P); } catch (e) { if (!LF.err) { LF.err = 1; console.warn('burger life: ' + (e && e.stack || e)); } } }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => (busy && J && GN[J.g].walk ? null : busy), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), sizzle, bun, GD, RINGS, DISP, JUGS, XB, PZ, LF, yardCols: XB.yardCols,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) jobTick(dt, lastP); }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), dispose() { card.remove(); HINT.remove(); K.dispose && K.dispose(); } };
  window.__burgerJobs = API; return API;
}
