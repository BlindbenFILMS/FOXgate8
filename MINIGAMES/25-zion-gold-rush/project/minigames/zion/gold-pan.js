// 8 GATES — ZION · GOLD RUSH: THE PANNING HALL [zionPanHall]. The 2D Gold River cabinet (gpan) rebuilt in 3D as a walk-in interior.
// WALK: Ben walks the hall (stick / WASD / tap the floor). Three panning bays on a raised flume: THE NORTH BAR, THE MIDDLE REACH, THE DEEP BEND
//       (names, richness, nugget odds and grain from the 2D panningSpots). CLERK WICK at the SURVAY OFFICE files claims (+35%, one at a time).
//       THE CAMP SLUICE runs the black sand you carry for 14 gold a pan. The HIGH SCORES board keeps one best per bar. JUNO (Zion townsfolk) gives tips.
// PAN:  the 2D wash physics, unchanged constants: 3 pans a session; the gravel rides up the wall and over the lip; swirl too hard and the colour goes too.
//       Gravel gone = CLEAN-UP: sweep the black sand for a bonus, or BANK it. Water drains whether you work it or not.
// TOUCH: CIRCLE your finger round the pan = swirl (faster circles = harder wash) · SWIPE DOWN = dip for fresh water (2 per pan)
//        TAP THE GOLD in the clean-up = pick it out with tweezers (safe in the vial) · SWIPE UP = bank. HUD buttons: 1 SWIRL (hold) · 2 DIP · 3 BANK.
//        The stick circles swirl too. Desktop: hold Space / 1 to wash, mouse circles, 2 dip, 3 / B bank, Esc leaves the bar.
// MERGE: buildPanHall(ctx) builds the interior at an origin from a Meru-style ctx ({ THREE, M, toon, scene, origin, kit }) so any world's building can
//        host it; createGoldPan({ container, onState }) runs it stand-alone and returns the page API + the Game HUD engine contract.
// SAVE:  stats zion.goldpan.best.<bar>, zion.goldpan.worked.<bar>, zion.goldpan.claim, zion.goldpan.con, zion.goldpan.washes, zion.goldpan.nuggets;
//        flag zionGoldPanFirst; relic luckyNugget (first nugget). Reads flag zionRiverClean (the derrick quest) for the oil on the water.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, pick } from '../../village-game.js';
import { canvasTex, crestTex, bannerTex, FONT } from '../../engine/textures.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, hintRings } from '../../engine/restaurant-kit.js';
import { createPanAudio } from './gold-pan-audio.js';

export const GOLDPAN = { name: 'GOLD RUSH', room: 'zionPanHall', world: 'Zion', place: 'Zion · The Panning Hall' };
export const BARS = [
  { id: 'pan-north', name: 'THE NORTH BAR', short: 'NORTH BAR', tag: 'Coarse gravel over a shallow riffle — the bar everybody learns on.', rich: 90, nugget: 0.15, nuggetWorth: 100, grain: 7.4, oil: 0, x: -4.6, gravel: '#a39270' },
  { id: 'pan-mid', name: 'THE MIDDLE REACH', short: 'MIDDLE REACH', tag: 'Finer sand, and more of it worth keeping.', rich: 150, nugget: 0.28, nuggetWorth: 150, grain: 5.65, oil: 0.33, x: 0, gravel: '#bba987' },
  { id: 'pan-south', name: 'THE DEEP BEND', short: 'DEEP BEND', tag: 'The richest water on the river, and the least forgiving.', rich: 230, nugget: 0.45, nuggetWorth: 240, grain: 3.9, oil: 1, x: 4.6, gravel: '#7a6e58' }];
// the 2D cabinet's constants, unchanged (world file "Planet Zion — build 127"), plus DIPS (new: the 3D hall lets you dunk for water)
export const C = { TH: 0.20, WEXP: 0.32, REXP: 0.12, RIM: 5.4, LIFT: 0.42, SINK: 0.045, SEXP: 0.85, NORETURN: 0.82, LOOSE_AT: 0.44, RESEAT: 0.24, LOOSE_SINK: 0.25, SHIELD: 0.38,
  TILT_UP: 1.9, TILT_DOWN: 2.6, OIL_THIRST: 0.10, WATER_IDLE: 0.070, WATER_WASH: 0.012, PANS: 3, DEPLETE: 0.5, CLAIM_BONUS: 0.35, CON_PER: 14, CLEANUP_SHARE: 0.45, CLEANUP_WATER: 0.52, CLEANUP_RATE: 3.0, DIPS: 2 };
const KIND = [{ k: 0, name: 'sand', w: 1.0, waste: 1, col: '#cbbf9e' }, { k: 1, name: 'gravel', w: 1.7, waste: 1, col: '#8f8366' }, { k: 2, name: 'black', w: 2.5, waste: 0, col: '#2b2721' },
  { k: 3, name: 'flake', w: 6.0, waste: 0, col: '#ffd447' }, { k: 4, name: 'nugget', w: 12.0, waste: 0, col: '#ffe27a' }];
const SK = { best: 'zion.goldpan.best.', worked: 'zion.goldpan.worked.', claim: 'zion.goldpan.claim', con: 'zion.goldpan.con', washes: 'zion.goldpan.washes', nug: 'zion.goldpan.nuggets' };
const WICK = { name: 'WICK', role: 'Survay Clerk', open: 'If you are working water on this river, I would rather it was written down. Saves the arguing later.',
  topics: [['What does a claim get me?', ['The bar is yours to work while you hold it. A third more to the pan, and nobody else standing in your riffle.', 'One at a time. You want the middle reach instead, you give me back the north bar first, and I strike it out in front of you.', 'That is the whole of it. The register is not the law. It is just the only thing between two people and an argument.']],
    ['Who else is on the book?', ['Nobody, at the minute. Half the camp went up the hill after the trucks and the other half went home to think about it.', 'Which is the best time to file, if you are asking me sideways.']],
    ['Why is it spelled SURVAY?', ['The sign painter charged by the letter and could not spell. I was not paying him twice.', 'Everybody knows where it is.']]] };
const JUNO = { name: 'JUNO', role: 'Zion · panner', lines: ['Cold paws, warm stove. Want the trick? Circle the pan. Slow circles move the sand, fast ones move EVERYTHING.', 'Watch the gold line on the gauge. Keep your wash just under it and the colour stays put. The last stubborn gravel needs a quick burst over it, then ease off.', 'Run dry? Swipe down and dunk it. Two dunks a pan, so do not waste them.', 'When the gravel is gone, tap the gold and pick it out. Then you can scrub the black sand as hard as you like.', 'Do not bank the black sand in the pan, carry it to the sluice. Wick pays nothing for it, but the riffles do.'] };

// ---------------- the pan: pure simulation (the 2D gpan code, kept whole) ----------------
export function dealPan(S, n, salt) {
  let seed = 0; const key = (S.id || S.name) + '#' + n + '#' + (salt || 0); for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }, grains = [];
  const push = (k, count, rlo, rhi, slo, shi) => { for (let i = 0; i < count; i++) { const sz = slo + rnd() * (shi - slo); grains.push({ k, live: 1, loose: 0, a: rnd() * Math.PI * 2, r: rlo + rnd() * (rhi - rlo), s: sz, m: sz * sz, tw: rnd(), rx: rnd() * 6, ry: rnd() * 6 }); } };
  push(0, 84, 0.30, 0.96, 3.0, 5.6); push(1, 46, 0.22, 0.92, 4.2, 7.4); push(2, Math.round(14 + rnd() * 12), 0.14, 0.62, 3.0, 4.8); push(3, Math.round(16 + rnd() * 16), 0.10, 0.66, 2.6, 4.4);
  if (rnd() < (S.nugget || 0)) push(4, 1, 0.10, 0.30, 8.5, 10.5);
  return grains; }
export function loadPan(p, n) { p.grains = dealPan(p.S, n, p.salt); p.m0 = p.wasteM0 = p.goldM0 = p.conM0 = 0; p.pickedM = 0; p.pickedNug = 0; p.dips = C.DIPS;
  for (const g of p.grains) { p.m0 += g.m; if (KIND[g.k].waste) p.wasteM0 += g.m; if (g.k === 3) p.goldM0 += g.m; if (g.k === 2) p.conM0 += g.m; } p.hadNugget = p.grains.some(g => g.k === 4); }
function cover(p) { const rem = [0, 0, 0, 0, 0]; for (const g of p.grains) if (g.live) rem[g.k] += g.m; const cv = [0, 0, 0, 0, 0]; let run = 0; for (let k = 0; k < 5; k++) { cv[k] = run; run += rem[k]; } return cv; }
function thr(p, k, cv) { const w = k === 3 ? (p.S.grain || KIND[3].w) : KIND[k].w, shade = Math.max(0.10, 1 - C.SHIELD * (cv / Math.max(1e-6, p.m0))); return C.TH * Math.pow(w, C.WEXP) / shade; }
export const panSafe = p => Math.min(1.4, thr(p, 3, cover(p)[3]));
export const panBlackLine = p => thr(p, 2, cover(p)[2]);
const massLeft = (p, f, m0) => { let l = 0; for (const g of p.grains) if (g.live && f(g)) l += g.m; return m0 > 0 ? l / m0 : 0; };
export const wasteLeft = p => massLeft(p, g => KIND[g.k].waste, p.wasteM0), blackLeft = p => massLeft(p, g => g.k === 2, p.conM0), goldLeft = p => massLeft(p, g => g.k === 3, p.goldM0);
// one physics step; returns the grains that went over the lip this step
function panStep(p, dt) { const out = [];
  p.tilt = clamp(p.tilt + (p.target > p.tilt ? Math.min(p.target - p.tilt, C.TILT_UP * dt) : -Math.min(p.tilt - p.target, C.TILT_DOWN * dt)), 0, 1);
  const thirst = 1 + C.OIL_THIRST * (p.S.oil || 0); p.water = Math.max(0, p.water - (C.WATER_IDLE + (p.tilt > 0.05 ? C.WATER_WASH : 0)) * thirst * dt);
  const cv = cover(p), th = [0, 1, 2, 3, 4].map(k => thr(p, k, cv[k])), LIFT = C.LIFT * (p.phase === 'cleanup' ? C.CLEANUP_RATE : 1);
  for (const g of p.grains) { if (!g.live) continue; const w = g.k === 3 ? (p.S.grain || KIND[3].w) : KIND[g.k].w, over = p.tilt - th[g.k];
    g.a += (0.5 + p.tilt * 2.4) * dt * (1 + (g.tw - 0.5) * 0.25) * p.dir;
    if (over > 0) g.r += LIFT * over * (1 + C.RIM * g.r) / Math.pow(w, C.REXP) * dt;
    else if (g.r < C.NORETURN) g.r -= C.SINK * Math.pow(w, C.SEXP) * (g.loose ? C.LOOSE_SINK : 1) * dt;
    if (g.r > C.LOOSE_AT) g.loose = 1; else if (g.r < C.RESEAT) g.loose = 0; if (g.r < 0.05) g.r = 0.05;
    if (g.r >= 1) { g.live = 0; out.push(g); } }
  return out; }
function panScore(p) { const gold = clamp((massLeft(p, g => g.k === 3, 1) + p.pickedM) / Math.max(1e-6, p.goldM0), 0, 1); let nug = p.pickedNug, con = 0;
  for (const g of p.grains) { if (!g.live) continue; if (g.k === 4) nug++; if (g.k === 2) con += g.m; }
  const bl = p.conM0 > 0 ? con / p.conM0 : 0, cleaned = Math.max(0, 1 - bl), bonus = Math.round(p.S.rich * p.yield * C.CLEANUP_SHARE * cleaned);
  return { gold, nug, bl, cleaned, bonus, take: Math.round(p.S.rich * p.yield * gold) + nug * Math.round((p.S.nuggetWorth || 120) * p.yield) + bonus }; }

// ---------------- the hall interior ----------------
export function buildPanHall(ctx) {
  const { THREE: T3, M, toon, scene, origin = { x: 0, z: 0 }, glowTex } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const W = 16, D = 12, H = 4.6, HW = W / 2, HD = D / 2, TY = 0.9, TZ0 = -5.85, TZ1 = -4.5, colliders = [], front = [], flow = [], bulbs = [], lamps = [];
  const box = (w, h, d, mat, x, y, z, o = 0.015, par = root) => M(new T3.BoxGeometry(w, h, d), mat, x, y, z, par, o);
  const solid = (x0, z0, x1, z1) => colliders.push({ x0, z0, x1, z1 });
  const wood = toon('#8a5a32'), woodD = toon('#5e3b1f'), woodL = toon('#b07a46'), brass = toon('#e0b04a'), iron = toon('#3a3836'), gold = toon('#ffd23a'), cream = toon('#f3e6c8');
  const plankT = (base, seam, rep) => canvasTex(256, 256, c => { c.fillStyle = base; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 8; i++) { const x = i * 32; c.fillStyle = i % 2 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)'; c.fillRect(x, 0, 32, 256); c.fillStyle = seam; c.fillRect(x, 0, 3, 256); c.fillRect(x, (i * 97) % 256, 32, 3); c.fillStyle = 'rgba(30,18,8,0.5)'; c.fillRect(x + 8, (i * 97 + 10) % 256, 3, 3); c.fillRect(x + 22, (i * 97 + 10) % 256, 3, 3); } }, rep);
  const tm = (t, rep) => { const m = new T3.MeshToonMaterial({ map: t, gradientMap: ctx.grad }); return m; };
  { const g = new T3.Mesh(new T3.PlaneGeometry(80, 80), toon('#3b2a18')); g.rotation.x = -Math.PI / 2; g.position.y = -0.02; root.add(g); }
  // floor: worn boards + a dirt run along the flume
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), tm(plankT('#9a6a3c', '#5a3a1e', [D / 2.4, W / 2.4]))); fl.rotation.x = -Math.PI / 2; fl.rotation.z = Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  { const dirt = new T3.Mesh(new T3.PlaneGeometry(W - 0.4, 2.2), tm(canvasTex(256, 64, c => { c.fillStyle = '#7d6446'; c.fillRect(0, 0, 256, 64); for (let i = 0; i < 260; i++) { c.fillStyle = ['#6b553a', '#8c7352', '#5f4a32', '#9a8460'][i % 4]; c.beginPath(); c.arc(Math.random() * 256, Math.random() * 64, 1 + Math.random() * 2.4, 0, 7); c.fill(); } }, [4, 1]))); dirt.rotation.x = -Math.PI / 2; dirt.position.set(0, 0.004, -3.6); dirt.receiveShadow = true; root.add(dirt); }
  // walls: vertical planks with a gold wainscot
  const wallT = plankT('#7a4e2a', '#4a2e16', [6, 1.6]), wallM = tm(wallT);
  for (const [x, z, w, ry] of [[0, -HD, W, 0], [-HW, 0, D, Math.PI / 2], [HW, 0, D, -Math.PI / 2]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; root.add(m);
    const trim = box(ry ? 0.08 : w, 0.12, ry ? w : 0.08, gold, x + (ry ? Math.sign(-x) * 0.03 : 0), 1.25, z + (ry ? 0 : 0.03), 0); trim.castShadow = false; }
  const roof = []; { const ceil = new T3.Mesh(new T3.PlaneGeometry(W, D), toon('#3a2614')); ceil.rotation.x = Math.PI / 2; ceil.position.y = H; root.add(ceil); roof.push(ceil); for (let z = -HD + 1; z < HD; z += 2.4) roof.push(box(W, 0.26, 0.3, woodD, 0, H - 0.2, z, 0.012)); }
  // front wall with the door (hidden whenever the camera is in front of it)
  { const fwM = tm(plankT('#7a4e2a', '#4a2e16', [3, 1.6])); for (const [x, w] of [[-4.6, 6.8], [4.6, 6.8]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), fwM); m.position.set(x, H / 2, HD); m.rotation.y = Math.PI; root.add(m); front.push(m); }
    const hd = new T3.Mesh(new T3.PlaneGeometry(2.4, H - 2.8), fwM); hd.position.set(0, 2.8 + (H - 2.8) / 2, HD); hd.rotation.y = Math.PI; root.add(hd); front.push(hd);
    const door = new T3.Mesh(new T3.PlaneGeometry(2.0, 2.7), new T3.MeshBasicMaterial({ color: 0xffe9a8 })); door.position.set(0, 1.35, HD + 0.02); door.rotation.y = Math.PI; root.add(door); front.push(door); }
  // ---- THE FLUME: a raised trough of river water along the back wall, fed by a waterwheel
  const waterT = canvasTex(128, 128, c => { c.fillStyle = '#3d86a8'; c.fillRect(0, 0, 128, 128); for (let i = 0; i < 40; i++) { c.strokeStyle = i % 3 ? 'rgba(160,214,236,0.35)' : 'rgba(255,255,255,0.55)'; c.lineWidth = 1 + (i % 3); const y = Math.random() * 128, x = Math.random() * 128; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 14 + Math.random() * 30, y + rr(-2, 2)); c.stroke(); } }, [10, 1]); flow.push({ t: waterT, v: 0.32, ax: 'x' });
  const waterM = new T3.MeshBasicMaterial({ map: waterT, transparent: true, opacity: 0.88 });
  { const L = 14.6, cx = 0.1; box(L, 0.14, TZ1 - TZ0, woodD, cx, TY - 0.2, (TZ0 + TZ1) / 2); box(L, 0.42, 0.1, wood, cx, TY - 0.06, TZ1, 0.02); box(L, 0.42, 0.1, wood, cx, TY - 0.06, TZ0, 0.02); box(0.1, 0.42, TZ1 - TZ0, wood, cx + L / 2, TY - 0.06, (TZ0 + TZ1) / 2);
    box(L, 0.05, 0.16, brass, cx, TY + 0.16, TZ1 + 0.02, 0.008); for (let x = -6.8; x <= 7.2; x += 1.4) { box(0.14, TY - 0.27, 0.14, woodD, x, (TY - 0.27) / 2, TZ1 + 0.05, 0.012); box(0.14, TY - 0.27, 0.14, woodD, x, (TY - 0.27) / 2, TZ0 + 0.05, 0.012); }
    const w = new T3.Mesh(new T3.PlaneGeometry(L - 0.1, TZ1 - TZ0 - 0.12), waterM); w.rotation.x = -Math.PI / 2; w.position.set(cx, TY - 0.05, (TZ0 + TZ1) / 2); root.add(w);
    solid(-7.3, TZ0 - 0.2, 7.5, TZ1 + 0.12); }
  // waterwheel + spout at the west end
  const wheel = new T3.Group(); wheel.position.set(-7.55, 1.5, (TZ0 + TZ1) / 2); root.add(wheel);
  { const rim = M(new T3.TorusGeometry(1.0, 0.07, 6, 24), wood, 0, 0, 0, wheel, 0.015); rim.rotation.y = Math.PI / 2; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, s = M(new T3.BoxGeometry(0.1, 0.36, 0.5), woodL, 0, Math.sin(a) * 0.95, Math.cos(a) * 0.95, wheel, 0.01); s.rotation.x = -a; const sp = M(new T3.BoxGeometry(0.05, 1.9, 0.05), woodD, 0, 0, 0, wheel, 0); sp.rotation.x = a; }
    box(0.3, 0.3, 0.3, iron, -7.55, 1.5, (TZ0 + TZ1) / 2); const fall = new T3.Mesh(new T3.PlaneGeometry(0.5, 1.4), waterM); fall.position.set(-7.05, 1.3, (TZ0 + TZ1) / 2 + 0.01); root.add(fall); box(0.6, 0.1, 0.5, wood, -7.05, 2.05, (TZ0 + TZ1) / 2, 0.01); }
  // ---- marquee: GOLD RUSH, with chasing bulbs (the 2D cabinet's marquee)
  { const mt = canvasTex(1024, 256, c => { c.fillStyle = '#140e04'; c.fillRect(0, 0, 1024, 256); c.strokeStyle = '#ffd23a'; c.lineWidth = 10; c.strokeRect(10, 10, 1004, 236); const g = c.createLinearGradient(0, 40, 0, 190); g.addColorStop(0, '#fff5c4'); g.addColorStop(0.45, '#ffd447'); g.addColorStop(1, '#b47b12'); c.font = `900 132px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 16; c.strokeStyle = '#150e02'; c.strokeText('GOLD RUSH', 512, 112); c.fillStyle = g; c.fillText('GOLD RUSH', 512, 112); c.font = `800 34px ${FONT}`; c.fillStyle = '#ffe196'; c.fillText('ZION  ·  THE PANNING HALL  ·  WASH FOR COLOUR', 512, 212); });
    const mq = new T3.Mesh(new T3.PlaneGeometry(5.2, 1.3), new T3.MeshBasicMaterial({ map: mt })); mq.position.set(0, 3.35, -HD + 0.085); root.add(mq); box(5.4, 1.5, 0.08, woodD, 0, 3.35, -HD + 0.02, 0.012);
    const bg = new T3.SphereGeometry(0.06, 8, 6); for (let i = 0; i < 26; i++) { const top = i < 13, k = top ? i : i - 13, m = new T3.Mesh(bg, new T3.MeshBasicMaterial({ color: 0x7a5814 })); m.position.set(-2.5 + k * (5 / 12), top ? 4.06 : 2.64, -HD + 0.12); root.add(m); bulbs.push(m); }
    for (const x of [-6.2, 6.2]) { const ban = new T3.Mesh(new T3.PlaneGeometry(1.0, 2.0), new T3.MeshBasicMaterial({ map: bannerTex('Z', '#c9931a', '#ffe89a', '#201608'), transparent: true })); ban.position.set(x, 3.1, -HD + 0.05); root.add(ban); }
    const cr = new T3.Mesh(new T3.CircleGeometry(0.55, 32), new T3.MeshBasicMaterial({ map: crestTex('Z', '#ffd23a', '#201608', '#ffd23a') })); cr.position.set(0, 3.2, HD - 0.05); cr.rotation.y = Math.PI; root.add(cr); front.push(cr); }
  // ---- the three bays: hanging sign, lantern, gravel tub, a mat to stand on
  const signT = (t1, t2, col) => canvasTex(512, 160, c => { c.fillStyle = '#4a2e16'; c.fillRect(0, 0, 512, 160); c.fillStyle = '#5e3b1f'; for (let y = 0; y < 160; y += 40) c.fillRect(0, y, 512, 36); c.strokeStyle = col; c.lineWidth = 8; c.strokeRect(6, 6, 500, 148); c.font = `900 62px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#1a0f05'; c.strokeText(t1, 256, 66); c.fillStyle = col; c.fillText(t1, 256, 66); c.font = `800 26px ${FONT}`; c.fillStyle = '#f3e6c8'; c.fillText(t2, 256, 124); });
  const bays = BARS.map((b, i) => { const x = b.x, sz = -3.9;
    const s = new T3.Mesh(new T3.PlaneGeometry(2.1, 0.66), new T3.MeshBasicMaterial({ map: signT(b.short, ['★', '★★', '★★★'][i] + '  RICHNESS', '#ffd23a') })); s.position.set(x, 2.25, TZ1 + 0.1); root.add(s); box(2.2, 0.72, 0.05, woodD, x, 2.25, TZ1 + 0.06, 0.01);
    for (const dx of [-0.9, 0.9]) box(0.03, 2.5 - 2.25 + 2.1, 0.03, iron, x + dx, 2.25 + 0.3 + (H - 2.6) / 2, TZ1 + 0.08, 0);
    const mat = new T3.Mesh(new T3.PlaneGeometry(1.3, 0.9), toon('#c9931a')); mat.rotation.x = -Math.PI / 2; mat.position.set(x, 0.006, sz + 0.1); root.add(mat);
    const tub = M(new T3.CylinderGeometry(0.34, 0.28, 0.42, 14), wood, x + 1.15, 0.21, sz - 0.25, root, 0.015, 0.34); M(new T3.TorusGeometry(0.34, 0.025, 5, 16), iron, 0, 0.17, 0, tub, 0).rotation.x = Math.PI / 2;
    const pile = M(new T3.SphereGeometry(0.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon(b.gravel), 0, 0.2, 0, tub, 0); pile.scale.y = 0.5; solid(x + 0.8, sz - 0.6, x + 1.5, sz + 0.1);
    for (let k = 0; k < 7; k++) M(new T3.DodecahedronGeometry(0.05 + (k % 3) * 0.02, 0), toon(k % 3 ? b.gravel : '#5a5246'), x + 1.15 + rr(-0.2, 0.2), 0.42 + rr(0, 0.05), sz - 0.25 + rr(-0.2, 0.2), root, 0);
    const lamp = new T3.Group(); lamp.position.set(x - 1.3, 2.55, TZ1 + 0.35); root.add(lamp); box(0.03, H - 2.55, 0.03, iron, x - 1.3, 2.55 + (H - 2.55) / 2, TZ1 + 0.35, 0); M(new T3.BoxGeometry(0.24, 0.32, 0.24), brass, 0, 0, 0, lamp, 0.012); lamps.push(lamp);
    if (b.oil) { const film = new T3.Mesh(new T3.CircleGeometry(0.9, 24), new T3.MeshBasicMaterial({ color: 0x7e609e, transparent: true, opacity: 0.0, depthWrite: false })); film.rotation.x = -Math.PI / 2; film.position.set(x, TY - 0.04, (TZ0 + TZ1) / 2); film.scale.x = 1.5; root.add(film); b._film = film; }
    return { id: b.id, bar: b, stand: { x, z: sz }, pan: { x, y: TY + 0.13, z: -4.92 }, sign: s }; });
  // ---- SURVAY OFFICE: Wick's counter on the east side, with the claims board and a brass scale
  { const cx = 6.35; box(0.8, 1.0, 3.4, wood, cx, 0.5, 0.1, 0.02); box(0.96, 0.08, 3.56, brass, cx, 1.04, 0.1, 0.012); box(0.06, 0.8, 3.4, woodL, cx - 0.42, 0.48, 0.1, 0);
    const sc = new T3.Group(); sc.position.set(cx, 1.08, -0.9); root.add(sc); M(new T3.CylinderGeometry(0.03, 0.05, 0.42, 8), brass, 0, 0.21, 0, sc, 0.006); M(new T3.BoxGeometry(0.5, 0.03, 0.03), brass, 0, 0.42, 0, sc, 0.004); for (const s of [-1, 1]) M(new T3.CylinderGeometry(0.1, 0.07, 0.03, 12), brass, s * 0.24, 0.3, 0, sc, 0.005);
    const book = box(0.3, 0.06, 0.42, toon('#7a1d2a'), cx, 1.11, 0.8, 0.006); book.rotation.y = 0.2; box(0.28, 0.065, 0.38, cream, cx, 1.115, 0.8, 0).rotation.y = 0.2;
    const st = canvasTex(512, 128, c => { c.fillStyle = '#201608'; c.fillRect(0, 0, 512, 128); c.strokeStyle = '#ffd23a'; c.lineWidth = 8; c.strokeRect(6, 6, 500, 116); c.font = `900 66px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffd23a'; c.fillText('SURVAY OFFICE', 256, 68); });
    const sg = new T3.Mesh(new T3.PlaneGeometry(2.6, 0.65), new T3.MeshBasicMaterial({ map: st })); sg.position.set(HW - 0.06, 2.75, 0.1); sg.rotation.y = -Math.PI / 2; root.add(sg);
    const ct = canvasTex(256, 192, c => { c.fillStyle = '#8a6a44'; c.fillRect(0, 0, 256, 192); for (let i = 0; i < 9; i++) { c.save(); c.translate(20 + (i % 3) * 78, 18 + Math.floor(i / 3) * 58); c.rotate(rr(-0.08, 0.08)); c.fillStyle = i === 4 ? '#ffd23a' : '#f3e6c8'; c.fillRect(0, 0, 64, 46); c.fillStyle = '#5a4a32'; for (let l = 0; l < 4; l++) c.fillRect(6, 8 + l * 9, 30 + (l * 13) % 22, 3); c.fillStyle = '#c42d3c'; c.beginPath(); c.arc(32, 3, 4, 0, 7); c.fill(); c.restore(); } });
    const cb = new T3.Mesh(new T3.PlaneGeometry(1.6, 1.2), new T3.MeshBasicMaterial({ map: ct })); cb.position.set(HW - 0.06, 1.75, 1.3); cb.rotation.y = -Math.PI / 2; root.add(cb);
    solid(cx - 0.45, -1.65, HW, 1.85); }
  // ---- high windows with afternoon light falling in (east + west walls)
  { const shaftT = canvasTex(32, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,236,190,0.9)'); g.addColorStop(1, 'rgba(255,220,160,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 256); const h = c.createLinearGradient(0, 0, 32, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.5, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)'); c.globalCompositeOperation = 'destination-out'; c.fillStyle = h; c.fillRect(0, 0, 32, 256); });
    const glass = new T3.MeshBasicMaterial({ color: 0xfff1cc }), shaftM = new T3.MeshBasicMaterial({ map: shaftT, transparent: true, opacity: 0.16, depthWrite: false, blending: T3.AdditiveBlending, side: T3.DoubleSide });
    for (const sx of [-1, 1]) for (const z of [-2.6, 2.9]) { const wx = sx * (HW - 0.05), w = new T3.Mesh(new T3.PlaneGeometry(1.1, 0.8), glass); w.position.set(wx, 3.55, z); w.rotation.y = -sx * Math.PI / 2; root.add(w);
      box(0.08, 0.9, 0.08, woodD, wx, 3.55, z, 0.006); box(0.08, 0.06, 1.2, woodD, wx, 3.55, z, 0.006); box(0.1, 0.08, 1.24, woodD, wx, 3.12, z, 0.008); box(0.1, 0.08, 1.24, woodD, wx, 3.98, z, 0.008);
      const L = 4.2, sh = new T3.Mesh(new T3.PlaneGeometry(1.0, L), shaftM); sh.position.set(wx - sx * 1.15, 3.55 - 1.75, z); sh.rotation.z = -sx * 0.58; root.add(sh); } }
  // ---- CAMP SLUICE: a long riffled box sloping down the west side, river water running through it
  const sluiceWater = canvasTex(64, 128, c => { c.fillStyle = '#4a8fb0'; c.fillRect(0, 0, 64, 128); for (let i = 0; i < 16; i++) { c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(rr(0, 60), rr(0, 128), 2, 10 + rr(0, 14)); } }, [1, 3]); flow.push({ t: sluiceWater, v: -0.9, ax: 'y' });
  const sluice = new T3.Group(); sluice.position.set(-6.65, 0.95, 0.15); sluice.rotation.x = -0.12; root.add(sluice);
  { const L = 4.4; M(new T3.BoxGeometry(0.7, 0.06, L), woodD, 0, 0, 0, sluice, 0.012); for (const s of [-1, 1]) M(new T3.BoxGeometry(0.06, 0.24, L), wood, s * 0.35, 0.1, 0, sluice, 0.012); for (let z = -L / 2 + 0.4; z < L / 2; z += 0.36) M(new T3.BoxGeometry(0.64, 0.05, 0.04), iron, 0, 0.05, z, sluice, 0);
    const w = new T3.Mesh(new T3.PlaneGeometry(0.62, L), new T3.MeshBasicMaterial({ map: sluiceWater, transparent: true, opacity: 0.7 })); w.rotation.x = -Math.PI / 2; w.position.y = 0.07; sluice.add(w);
    for (const z of [-1.9, 0, 1.9]) for (const s of [-1, 1]) box(0.08, 0.95 + z * 0.12 * -1 * 0 + (z < 0 ? 0.25 : z > 0 ? -0.2 : 0), 0.08, woodD, -6.65 + s * 0.3, (0.95 + (z < 0 ? 0.25 : z > 0 ? -0.2 : 0)) / 2, 0.15 + z, 0.01);
    M(new T3.CylinderGeometry(0.42, 0.36, 0.4, 14), wood, -6.65, 0.2, 2.75, root, 0.015, 0.42); const tw = new T3.Mesh(new T3.CircleGeometry(0.38, 16), waterM); tw.rotation.x = -Math.PI / 2; tw.position.set(-6.65, 0.38, 2.75); root.add(tw);
    const st = canvasTex(512, 128, c => { c.fillStyle = '#201608'; c.fillRect(0, 0, 512, 128); c.strokeStyle = '#ffd23a'; c.lineWidth = 8; c.strokeRect(6, 6, 500, 116); c.font = `900 60px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffd23a'; c.fillText('CAMP SLUICE', 256, 68); });
    const sg = new T3.Mesh(new T3.PlaneGeometry(2.2, 0.55), new T3.MeshBasicMaterial({ map: st })); sg.position.set(-HW + 0.06, 2.5, 0.15); sg.rotation.y = Math.PI / 2; root.add(sg);
    solid(-HW, -2.2, -6.15, 3.2); }
  const sluiceSpark = []; for (let i = 0; i < 10; i++) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: glowTex, color: 0xffd447, transparent: true, opacity: 0, depthWrite: false })); s.scale.setScalar(0.18); sluice.add(s); sluiceSpark.push({ s, life: 0, z: 0 }); }
  // ---- HIGH SCORES board on the west wall near the door
  const boardCv = document.createElement('canvas'); boardCv.width = 512; boardCv.height = 384; const boardTex = new T3.CanvasTexture(boardCv); boardTex.colorSpace = T3.SRGBColorSpace;
  const board = new T3.Mesh(new T3.PlaneGeometry(2.2, 1.65), new T3.MeshBasicMaterial({ map: boardTex })); board.position.set(-HW + 0.07, 1.9, 4.5); board.rotation.y = Math.PI / 2; root.add(board);
  box(0.06, 1.85, 2.4, woodD, -HW + 0.03, 1.9, 4.5, 0.012);
  function drawBoard(rows) { const c = boardCv.getContext('2d'); c.fillStyle = '#1c2a22'; c.fillRect(0, 0, 512, 384); c.strokeStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 30; i++) { c.beginPath(); c.moveTo(Math.random() * 512, Math.random() * 384); c.lineTo(Math.random() * 512, Math.random() * 384); c.stroke(); }
    c.fillStyle = '#ffd447'; c.font = `900 48px ${FONT}`; c.textBaseline = 'top'; c.fillText('HIGH SCORES', 30, 24); c.fillStyle = '#f3efe2'; c.font = `800 22px ${FONT}`; c.fillText('ONE BEST WASH PER BAR', 30, 82);
    rows.forEach((r, i) => { const y = 136 + i * 74; c.fillStyle = r.claim ? '#ffd447' : '#f3efe2'; c.font = `900 34px ${FONT}`; c.fillText(r.name, 30, y); c.textAlign = 'right'; c.fillStyle = r.best ? '#ffd447' : 'rgba(243,239,226,0.5)'; c.fillText(r.best ? r.best + 'g' : '- - -', 482, y); c.textAlign = 'left'; if (r.claim) { c.font = `800 18px ${FONT}`; c.fillStyle = '#ffd447'; c.fillText('YOUR CLAIM', 30, y + 40); } });
    boardTex.needsUpdate = true; }
  // ---- the corners: ore cart, potbelly stove (Juno warms her paws), barrels, crates
  { const cart = new T3.Group(); cart.position.set(-3.6, 0, 4.1); root.add(cart); for (const s of [-1, 1]) M(new T3.BoxGeometry(2.6, 0.04, 0.06), iron, 0, 0.02, s * 0.32, cart, 0); for (let x = -1.2; x <= 1.2; x += 0.4) M(new T3.BoxGeometry(0.12, 0.03, 0.8), woodD, x, 0.015, 0, cart, 0);
    M(new T3.BoxGeometry(1.0, 0.5, 0.7), toon('#6b5a44'), 0, 0.45, 0, cart, 0.02); for (const [x, z] of [[-0.35, -0.32], [0.35, -0.32], [-0.35, 0.32], [0.35, 0.32]]) M(new T3.CylinderGeometry(0.13, 0.13, 0.06, 12), iron, x, 0.15, z, cart, 0.01, 0.13).rotation.x = Math.PI / 2;
    for (let i = 0; i < 9; i++) M(new T3.DodecahedronGeometry(0.1 + (i % 3) * 0.03, 0), i % 3 === 0 ? gold : toon('#8a7a62'), rr(-0.35, 0.35), 0.74, rr(-0.22, 0.22), cart, 0.01); solid(-4.2, 3.7, -3.0, 4.5);
    const stove = new T3.Group(); stove.position.set(6.8, 0, 4.9); root.add(stove); M(new T3.CylinderGeometry(0.42, 0.48, 1.0, 14), iron, 0, 0.6, 0, stove, 0.02, 0.48); M(new T3.CylinderGeometry(0.1, 0.1, H - 1.1, 8), iron, 0, 1.1 + (H - 1.1) / 2, 0, stove, 0.01, 0.1);
    const glow = new T3.Sprite(new T3.SpriteMaterial({ map: glowTex, color: 0xff8a2a, transparent: true, opacity: 0.85, depthWrite: false })); glow.scale.setScalar(1.3); glow.position.set(-0.3, 0.55, -0.3); stove.add(glow); lamps.push({ glow }); solid(6.3, 4.4, HW, HD);
    box(0.6, 0.5, 0.6, woodL, 5.55, 0.25, 4.3, 0.015); solid(5.25, 4.0, 5.85, 4.6);
    for (const [x, z] of [[-7.3, -3.7], [7.3, -3.6], [2.6, 5.4], [3.2, 5.45]]) { M(new T3.CylinderGeometry(0.32, 0.32, 0.86, 12), wood, x, 0.43, z, root, 0.015, 0.32); M(new T3.TorusGeometry(0.33, 0.025, 4, 14), iron, x, 0.65, z, root, 0).rotation.x = Math.PI / 2; solid(x - 0.35, z - 0.35, x + 0.35, z + 0.35); }
    for (const [x, z, s] of [[-2.4, 5.3, 0.7], [-1.7, 5.4, 0.5], [-2.2, 5.3, 0.4]]) { box(s, s, s, woodL, x, s / 2 + (s === 0.4 ? 0.7 : 0), z, 0.015); } solid(-2.8, 4.9, -1.4, 5.8); }
  // hanging lanterns down the middle
  for (const [x, z] of [[-4, -1], [0, -1], [4, -1], [-2, 2.6], [2, 2.6]]) { const g = new T3.Group(); g.position.set(x, 3.3, z); root.add(g); M(new T3.BoxGeometry(0.22, 0.3, 0.22), brass, 0, 0, 0, g, 0.01); box(0.02, H - 3.3, 0.02, iron, x, 3.3 + (H - 3.3) / 2, z, 0);
    const gl = new T3.Sprite(new T3.SpriteMaterial({ map: glowTex, color: 0xffc860, transparent: true, opacity: 0.7, depthWrite: false })); gl.scale.setScalar(0.9); g.add(gl); lamps.push({ glow: gl }); }
  for (const l of lamps) if (l.isGroup) { const gl = new T3.Sprite(new T3.SpriteMaterial({ map: glowTex, color: 0xffc860, transparent: true, opacity: 0.75, depthWrite: false })); gl.scale.setScalar(0.8); l.add(gl); }
  solid(-HW - 1, -HD - 1, -HW + 0.35, HD + 1); solid(HW - 0.35, -HD - 1, HW + 1, HD + 1); solid(-HW - 1, HD - 0.3, HW + 1, HD + 1);
  let bt = 0;
  function update(t, dt, { oil = 0, sluiceRun = 0 } = {}) {
    for (const f of flow) { if (f.ax === 'x') f.t.offset.x = (f.t.offset.x + f.v * dt) % 1; else f.t.offset.y = (f.t.offset.y + f.v * dt) % 1; }
    wheel.rotation.x += dt * 0.9; bt += dt; const k = Math.floor(bt * 7); bulbs.forEach((b, i) => b.material.color.setHex((i + k) % 4 === 0 ? 0xfff3c0 : 0x7a5814));
    for (const l of lamps) if (l.glow) l.glow.material.opacity = 0.62 + Math.sin(t * 7.3 + l.glow.id) * 0.06;
    for (const b of BARS) if (b._film) b._film.material.opacity = b.oil * oil * 0.45;
    for (const s of sluiceSpark) { if (sluiceRun > 0 && s.life <= 0 && Math.random() < dt * 8) { s.life = 1; s.z = -1.9; s.x = rr(-0.25, 0.25); } if (s.life > 0) { s.life -= dt * 0.8; s.z += dt * 3.2; s.s.position.set(s.x, 0.12, s.z); s.s.material.opacity = Math.min(1, s.life * 1.4); } else s.s.material.opacity = 0; } }
  return { root, W, D, H, TY, TZ0, TZ1, bays, colliders, front, roof, wheel, drawBoard, update, spots: { wick: { x: 5.25, z: 0.1, npc: { x: 7.15, z: 0.1 } }, sluice: { x: -5.55, z: 0.4 }, board: { x: -6.9, z: 4.5 }, juno: { x: 4.75, z: 3.55, npc: { x: 5.55, z: 4.3 } }, door: { x: 0, z: 5.1 } } };
}

// ---------------- stand-alone: the hall, Ben, the pan, the page API + Game HUD engine contract ----------------
export async function createGoldPan({ container, onState = () => {}, onExit = null }) { const ST = createStage(container, { bg: '#24170b' }); ST.container = container; return mountGoldPan(ST, { onState, onExit, ownLoop: true }); }
// MERGE ENTRY: mount the hall + the game into a world's existing stage (the same shape createStage() returns: THREE scene, camera, renderer,
// toon, M, kit, V3, CW, CHh, puff, smokeS, sun, glowTex, grad, touch). Everything sits under one group at `origin`; the host calls
// api.frame(dt) from its own loop while api.active is true, renders, and hands the camera over. See GOLD_RUSH_MERGE.md.
export function mountGoldPan(ST, { onState = () => {}, onExit = null, origin = { x: 0, z: 0 }, ownLoop = false } = {}) {
  const { CW, CHh, renderer, scene, camera, V3, toon, M, kit, puff: puffW, smokeS, sun, glowTex, touch } = ST, container = ST.container;
  const OV = new THREE.Vector3(origin.x, 0, origin.z), G = new THREE.Group(); G.position.copy(OV); scene.add(G);
  const puff = (x, y, z, ...a) => puffW(x + OV.x, y, z + OV.z, ...a);
  if (ownLoop) { scene.traverse(o => { if (o.isHemisphereLight) { o.color.set(0xffe6bc); o.groundColor.set(0x6a4426); o.intensity = 1.1; } });
    sun.color.set(0xffe0b0); sun.intensity = 1.35; sun.position.set(2, 9, 5); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 8, bottom: -8, far: 30 }); sun.shadow.camera.updateProjectionMatrix(); }
  const hall = buildPanHall({ THREE, M, toon, scene, grad: ST.grad, glowTex, origin });
  const SND = createPanAudio(), snd = (k, ...a) => { try { SND[k](...a); } catch (e) {} };
  // ---------- polish: fog, warm lamp light, dust in the air, glints on the flume, ripples, the "go here" ring ----------
  if (ownLoop) scene.fog = new THREE.Fog(0x24170b, 15, 36);
  const warm = (x, y, z, i, d) => { const l = new THREE.PointLight(0xffb468, i, d, 1.8); l.position.set(x, y, z); G.add(l); return l; };
  const stoveL = warm(6.4, 1.0, 4.5, 1.8, 7.5); for (const b of hall.bays) if (!touch || b.bar.x === 0) warm(b.bar.x, 2.4, -3.4, touch ? 1.4 : 0.8, 6.5);
  const MOTES = touch ? 70 : 140, moteG = new THREE.BufferGeometry(), moteP = new Float32Array(MOTES * 3), moteS = [];
  for (let i = 0; i < MOTES; i++) { moteP.set([rr(-7.4, 7.4), rr(0.3, 3.9), rr(-4.6, 5.4)], i * 3); moteS.push(rr(0, 6.28)); } moteG.setAttribute('position', new THREE.BufferAttribute(moteP, 3));
  const motes = new THREE.Points(moteG, new THREE.PointsMaterial({ map: glowTex, color: 0xffe2a0, size: 0.07, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); G.add(motes);
  const glints = []; for (let i = 0; i < 18; i++) { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xdff6ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); g.position.set(rr(-7, 7.2), hall.TY - 0.03, rr(hall.TZ0 + 0.15, hall.TZ1 - 0.15)); g.scale.setScalar(rr(0.08, 0.16)); g.userData.ph = rr(0, 6.28); G.add(g); glints.push(g); }
  const ripples = []; { const rg = new THREE.RingGeometry(0.85, 1, 32).rotateX(-Math.PI / 2); for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: 0xe8f8ff, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; scene.add(m); ripples.push({ m, t: 1, s: 1 }); } }
  let ripI = 0; function ripple(x, z, size = 1) { const r = ripples[ripI = (ripI + 1) % ripples.length]; r.m.position.set(x, hall.TY - 0.035, clamp(z, OV.z + hall.TZ0 + 0.1, OV.z + hall.TZ1 - 0.1)); r.t = 0; r.s = size; r.m.visible = true; }
  const starT = canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,236,150,0.9)'); g.addColorStop(1, 'rgba(255,200,60,0)'); c.fillStyle = g; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 7 : 31; c.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } c.fill(); });
  const sparks = []; const HR = hintRings(ST);

  hall.bays.forEach(b => { b.stand.z = -4.0; b.pan.z = -4.74; b.pan.y = hall.TY + 0.1; });
  // ---------- the cast ----------
  const strip = (f, sc = 0.56) => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; f.scale.setScalar(sc); G.add(f); return f; };
  const ben = strip(kit.makeFox({ ...CAST.player, gear: 'none' })); ben.position.set(0, 0, 3.9); ben.rotation.y = Math.PI;
  const wick = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#d9cfae', furDark: '#8d7c4e' }, torso: ['#e8dcc0', '#7a6a3c', '#3c3322'], outfit: 'vest', crest: '', gear: 'none', mood: 'neutral' }));
  wick.position.set(hall.spots.wick.npc.x, 0, hall.spots.wick.npc.z); wick.rotation.y = -Math.PI / 2;
  const juno = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#c9682a', furDark: '#8a4213' }, torso: ['#ffd23a', '#fbf8ec', '#a8792e'], outfit: 'tee', crest: '', gear: 'none', mood: 'happy' }));
  juno.position.set(hall.spots.juno.npc.x, 0.21, hall.spots.juno.npc.z); juno.rotation.y = -2.4; { const P = juno.userData.P; P.legs.forEach(l => l.rotation.x = -1.35); }
  // a wide-brim prospector hat for Juno (she has been at this a while)
  { const P = juno.userData.P, h = new THREE.Group(); h.position.set(0, (P.head.position.y || 1.3) + 0.36, 0); P.body.add(h); M(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 20), toon('#7a5a32'), 0, 0, 0, h, 0.01, 0.42); M(new THREE.CylinderGeometry(0.2, 0.24, 0.2, 16), toon('#7a5a32'), 0, 0.1, 0, h, 0.012, 0.24); M(new THREE.CylinderGeometry(0.245, 0.245, 0.05, 16), toon('#ffd23a'), 0, 0.03, 0, h, 0, 0.245); }
  const npcs = [{ f: wick, key: 'wick' }, { f: juno, key: 'juno', sit: true }];
  // ---------- the pan ----------
  const PR = 0.34, PROF = [[0, 0], [0.4, 0], [0.5, 0.006], [0.65, 0.026], [0.82, 0.06], [0.94, 0.092], [1.0, 0.104], [1.1, 0.108], [1.12, 0.096]];
  const hAt = r => { for (let i = 1; i < PROF.length; i++) if (r <= PROF[i][0]) { const [r0, h0] = PROF[i - 1], [r1, h1] = PROF[i]; return h0 + (h1 - h0) * (r - r0) / (r1 - r0); } return 0.104; };
  const rAt = h => { for (let i = 1; i < 7; i++) if (h <= PROF[i][1]) { const [r0, h0] = PROF[i - 1], [r1, h1] = PROF[i]; return h1 === h0 ? r1 : r0 + (r1 - r0) * (h - h0) / (h1 - h0); } return 1; };
  const panG = new THREE.Group(); G.add(panG); const panTilt = new THREE.Group(); panG.add(panTilt);
  { const lathe = new THREE.LatheGeometry(PROF.map(([r, h]) => new THREE.Vector2(Math.max(0.0001, r * PR), h)), 44), body = new THREE.Mesh(lathe, new THREE.MeshToonMaterial({ color: '#5d5548', gradientMap: ST.grad, side: THREE.DoubleSide })); body.castShadow = true; body.receiveShadow = true; panTilt.add(body);
    const ink = new THREE.Mesh(new THREE.TorusGeometry(PR * 1.12, 0.007, 5, 48), new THREE.MeshBasicMaterial({ color: 0x1a1626 })); ink.rotation.x = Math.PI / 2; ink.position.y = 0.097; panTilt.add(ink);
    const hi = new THREE.Mesh(new THREE.TorusGeometry(PR * 1.05, 0.005, 4, 48, 2.2), new THREE.MeshBasicMaterial({ color: 0xbfb49a })); hi.rotation.x = -Math.PI / 2; hi.rotation.z = 2.2; hi.position.y = 0.109; panTilt.add(hi);
    for (const [k, rn] of [[0, 0.7], [1, 0.78], [2, 0.86]]) { const g = new THREE.TorusGeometry(rn * PR, 0.0055, 4, 22, 2.2); g.rotateX(-Math.PI / 2); g.rotateY(0.47); const m = new THREE.Mesh(g, toon('#2e2a24')); m.position.y = hAt(rn) + 0.004; panTilt.add(m); } }
  const dashes = new THREE.Group(); panTilt.add(dashes); { const dm = new THREE.MeshBasicMaterial({ color: 0xec7c58, transparent: true, opacity: 0.6 }); for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2, d = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.003, 0.006), dm); d.position.set(Math.cos(a) * C.NORETURN * PR, hAt(C.NORETURN) + 0.012, Math.sin(a) * C.NORETURN * PR); d.rotation.y = -a + Math.PI / 2; dashes.add(d); } }
  const swirlT = canvasTex(128, 128, c => { c.fillStyle = '#8cc6dc'; c.fillRect(0, 0, 128, 128); c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(64, 64, 18 + i * 13, i, i + 1.7); c.stroke(); } });
  const waterM = new THREE.MeshBasicMaterial({ map: swirlT, transparent: true, opacity: 0.42, depthWrite: false }), waterD = new THREE.Mesh(new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2), waterM); waterD.renderOrder = 5; panTilt.add(waterD);
  const oilD = new THREE.Mesh(new THREE.CircleGeometry(1, 30).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x8a5cc0, transparent: true, opacity: 0, depthWrite: false })); oilD.renderOrder = 6; panTilt.add(oilD);
  const flakeM = new THREE.MeshToonMaterial({ color: '#ffd447', emissive: '#a8700a', emissiveIntensity: 0.6, gradientMap: ST.grad }), nugM = new THREE.MeshToonMaterial({ color: '#ffe27a', emissive: '#8a5a08', emissiveIntensity: 0.45, gradientMap: ST.grad });
  const GEO = [new THREE.IcosahedronGeometry(1, 0), new THREE.DodecahedronGeometry(1, 0), new THREE.IcosahedronGeometry(1, 0), new THREE.CylinderGeometry(1, 0.8, 0.32, 7), new THREE.DodecahedronGeometry(1, 1)];
  { const p = GEO[4].attributes.position; for (let i = 0; i < p.count; i++) { const s = 1 + Math.sin(p.getX(i) * 9 + p.getY(i) * 5) * 0.12; p.setXYZ(i, p.getX(i) * s, p.getY(i) * s * 0.7, p.getZ(i) * s); } GEO[4].computeVertexNormals(); }
  const CAP = [90, 52, 30, 36, 2], LAYER = [0.012, 0.008, 0.004, 0.02, 0.016];
  const inst = KIND.map((K, i) => { const m = new THREE.InstancedMesh(GEO[i], i === 3 ? flakeM : i === 4 ? nugM : new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: ST.grad }), CAP[i]); m.frustumCulled = false; m.castShadow = false;
    const base = new THREE.Color(K.col), c = new THREE.Color(); for (let j = 0; j < CAP[i]; j++) { c.copy(base).offsetHSL(0, 0, i < 3 ? rr(-0.07, 0.07) : rr(-0.03, 0.04)); m.setColorAt(j, c); } m.count = 0; panTilt.add(m); return m; });
  const dummy = new THREE.Object3D();
  // the vial on the trough lip: fills as you bank
  const vial = new THREE.Group(); G.add(vial); { M(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), toon('#5e3b1f'), 0, -0.01, 0, vial, 0.006, 0.05); const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 14), new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.28, depthWrite: false })); glass.position.y = 0.11; vial.add(glass); M(new THREE.CylinderGeometry(0.035, 0.03, 0.04, 10), toon('#a8792e'), 0, 0.24, 0, vial, 0.005, 0.035); }
  const vialFill = M(new THREE.CylinderGeometry(0.039, 0.039, 1, 12), flakeM, 0, 0.01, 0, vial, 0); vialFill.scale.y = 0.001;
  for (let i = 0; i < 6; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starT, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); sp.renderOrder = 9; panTilt.add(sp); sparks.push({ sp, t: rr(0, 1), g: null }); }
  const vialGlint = new THREE.Sprite(new THREE.SpriteMaterial({ map: starT, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); vialGlint.scale.setScalar(0.12); vialGlint.position.set(0.02, 0.15, 0.04); vial.add(vialGlint);
  // spill + fly-to-vial particles
  const SPN = 56, spillI = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0xffffff }), SPN); spillI.frustumCulled = false; scene.add(spillI); const spills = []; const _c = new THREE.Color();
  function spawnSpill(pos, vel, col, s, life = 1.2, to = null) { if (spills.length >= SPN) spills.shift(); spills.push({ p: pos, v: vel, col, s, life, to, t: 0, from: pos.clone() }); }
  // ---------- state ----------
  const S = { active: true, t: 0, mode: 'intro', sel: 0, cardBay: false, flash: null, flashT: 0, toast: null, toastT: 0, demo: null, done: null, swirlUsed: false, sluiceRun: 0, hand: null, juno: 0 };
  let p = null, DLG = null, PAUSE = false, runs = 0;
  const stick = { x: 0, y: 0, a: null, w: 0, t: 0 }, keys = new Set(), SW = { w: 0, last: 0, dir: 1 };
  let goal = null, goalTalk = null;
  const flash = (txt, col = '#ffd23a', d = 1.6) => { S.flash = { txt, col }; S.flashT = d; };
  const toast = (txt, d = 3.2) => { S.toast = txt; S.toastT = d; };
  const oilOn = () => !save.flag('zionRiverClean');
  const claimId = () => save.stat(SK.claim, null);
  const yieldOf = id => (claimId() === id ? 1 + C.CLAIM_BONUS : 1) / (1 + C.DEPLETE * save.stat(SK.worked + id, 0));
  const best = id => save.stat(SK.best + id, 0);
  const redrawBoard = () => hall.drawBoard(BARS.map(b => ({ name: b.short, best: best(b.id), claim: claimId() === b.id }))); redrawBoard();
  const bay = () => hall.bays[S.sel];
  // ---------- dialogue (the Game HUD's dialog box) ----------
  function say(name, role, lines, then) { DLG = { name, role, lines: lines.map(t => typeof t === 'string' ? { text: t } : t), i: 0, chars: 0, then }; }
  function wickMenu(open) { const held = claimId();
    DLG = { name: WICK.name, role: WICK.role, conv: true, i: 0, chars: open ? 0 : 999, lines: [{ text: open || 'Anything else for the register?' }],
      choices: [...BARS.map(b => ({ text: (held === b.id ? 'Your claim: ' : 'File a claim on ') + b.name + (held === b.id ? ' (held)' : ''), asked: held === b.id, act: () => { if (held === b.id) return wickMenu('That one is already yours. Work it.'); if (!S.demo) { save.setStat(SK.claim, b.id); redrawBoard(); } say(WICK.name, WICK.role, ['The claim on ' + b.name + ' is filed in your name. A third more to the pan while you hold it, and only one claim at a time.' + (held ? ' ' + BARS.find(x => x.id === held).name + ' is struck out.' : '')], () => wickMenu()); } })),
        ...WICK.topics.map(([q, a]) => ({ text: q, act: () => say(WICK.name, WICK.role, a, () => wickMenu()) })), { text: 'Just looking.', bye: true, act: () => say(WICK.name, WICK.role, ['The board is on the wall. Look all you want.']) }] }; }
  function sluiceTalk() { const con = save.stat(SK.con, 0);
    if (con < 0.05) return say('THE CAMP SLUICE', 'Riffles · river water', ['A long box with riffles down it, running river water. It takes the black sand you save out of the pan and washes the last of the colour out of it.', 'You have none to run yet. Finish a pan without scouring the heavy sand out of it and bring that.']);
    const pay = Math.round(con * C.CON_PER);
    DLG = { name: 'THE CAMP SLUICE', role: 'Riffles · river water', conv: true, i: 0, chars: 0, lines: [{ text: 'You are carrying ' + con.toFixed(1) + ' pans of black sand. Run it through the riffles and it is worth about ' + pay + ' gold.' }],
      choices: [{ text: 'RUN IT', act: () => { DLG = null; const c = save.stat(SK.con, 0); save.setStat(SK.con, 0); const g = Math.round(c * C.CON_PER); if (g > 0) { save.addGold(g); save.addXp(20); } S.sluiceRun = 3.2; flash('+' + g + ' GOLD · THE CAMP SLUICE', '#ffd23a', 2.4); snd('sluice'); } }, { text: 'NOT YET', bye: true, act: () => { DLG = null; } }] }; }
  // ---------- interactables ----------
  const SPOTS = () => [...hall.bays.map((b, i) => ({ key: 'bay', i, x: b.stand.x, z: b.stand.z, label: 'PAN AT ' + b.bar.name })), { key: 'wick', ...hall.spots.wick, label: 'TALK TO WICK · SURVAY CLERK' },
    { key: 'sluice', ...hall.spots.sluice, label: save.stat(SK.con, 0) >= 0.05 ? 'RUN THE CAMP SLUICE' : 'THE CAMP SLUICE' }, { key: 'board', ...hall.spots.board, label: 'READ THE HIGH SCORES' }, { key: 'door', x: 0, z: 5.25, label: onExit ? 'LEAVE THE HALL' : 'THE DOOR · BACK OUT TO ZION' }, { key: 'juno', ...hall.spots.juno, label: 'TALK TO JUNO' }];
  function nearSpot() { let bst = null, bd = 1.05; for (const s of SPOTS()) { const d = Math.hypot(ben.position.x - s.x, ben.position.z - s.z); if (d < bd) { bd = d; bst = s; } } return bst; }
  function interact(s) { if (!s) return; goal = null; goalTalk = null;
    if (s.key === 'bay') return openCard(s.i, true);
    if (s.key === 'wick') { wick.userData.talking = true; return wickMenu(WICK.open); }
    if (s.key === 'sluice') return sluiceTalk();
    if (s.key === 'door') { if (onExit) { snd('open'); return onExit(); } return toast('THE DOOR OPENS ONTO THE WORLD ONCE THE HALL IS PLACED IN ONE', 3); }
    if (s.key === 'board') return toast('HIGH SCORES · ' + BARS.map(b => b.short + ' ' + (best(b.id) ? best(b.id) + 'g' : '—')).join(' · '), 4);
    if (s.key === 'juno') { const k = S.juno++ % JUNO.lines.length; return say(JUNO.name, JUNO.role, [JUNO.lines[k]]); } }
  // ---------- flow ----------
  function openCard(i, atBay) { if (atBay) snd('open'); S.sel = clamp(i | 0, 0, 2); S.mode = 'intro'; S.cardBay = !!atBay; S.done = null; DLG = null; }
  function newSession(i) { const b = BARS[i]; S.sel = i;
    p = { id: b.id, S: { ...b, oil: oilOn() ? b.oil : 0 }, panNo: 1, water: 1, tilt: 0, target: 0, held: false, phase: 'wash', score: 0, con: 0, takes: [], nuggets: 0, cleaned: 0, bonus: 0, settling: 0, over: false, overT: 0, yield: yieldOf(b.id), salt: ++runs + Math.floor(Math.random() * 1e6), dir: 1, dipT: 0, pickCd: 0, msg: 'PAN 1 · CIRCLE TO SWIRL', msgT: 2.4, lostGold: 0, firstPick: true, spilledFlash: 0, swirlSnd: 0 };
    loadPan(p, 1); }
  function startPan(i = S.sel) { SND.init(); snd('start');
    newSession(i); S.mode = 'glide'; S.glideT = 0; S.glideFrom = ben.position.clone(); S.done = null; DLG = null; goal = null; S.swirlUsed = S.swirlUsed && !S.demo; SW.w = 0; }
  function leavePan() { if (S.mode !== 'pan' && S.mode !== 'glide') return; p = null; S.mode = 'walk'; flash('LEFT THE BAR · NOTHING PAID', '#ffffff', 1.8); }
  function land(spoiled) { if (!p || p.settling > 0 || p.over) return; let take = 0, txt;
    if (spoiled) { txt = 'DRY · STILL FULL OF GRAVEL. NOTHING IN IT.'; p.takes.push(0); snd('dry'); }
    else { const sc = panScore(p); take = sc.take; p.score += take; p.nuggets += sc.nug; p.con += sc.bl; p.bonus += sc.bonus; p.cleaned += sc.cleaned; p.takes.push(take);
      txt = (sc.nug ? 'A NUGGET!  ' : '') + '+' + take + ' GOLD' + (sc.bonus > 0 ? '  (' + sc.bonus + ' OFF THE CLEAN-UP)' : '') + (sc.gold > 0.92 && !sc.bonus ? ' · CLEAN WASH' : '');
      // the colour goes into the vial
      const wp = V3(); for (const g of p.grains) if (g.live && g.k >= 3) { grainWorld(g, wp); spawnSpill(wp.clone(), V3(), g.k === 4 ? 0xffe27a : 0xffd447, 0.012 * (g.k === 4 ? 2.6 : 1), 0.9, vial.localToWorld(V3(0, 0.2, 0))); }
      snd('bank', sc.nug > 0); }
    p.msg = txt; p.msgT = 2.6; flash(txt, spoiled ? '#ec3013' : '#ffd23a', 2.4); p.settling = 1.6; p.held = false; }
  function nextPan() { if (p.panNo >= C.PANS) { p.over = true; p.overT = S.t + 1.4; p.msg = p.score > 0 ? 'WASHED OUT · ' + p.score + ' GOLD' : 'NOTHING IN IT'; p.msgT = 6; return; }
    snd('nextPan'); p.panNo++; p.water = 1; p.tilt = 0; p.phase = 'wash'; loadPan(p, p.panNo); p.msg = 'PAN ' + p.panNo + ' · CIRCLE TO SWIRL'; p.msgT = 2.0; flash('PAN ' + p.panNo + ' OF ' + C.PANS, '#ffffff', 1.4); }
  function finish() { const b = BARS[S.sel], q = p; p = null;
    if (S.demo) { demoStop(); return; }
    const old = best(q.id), beat = q.score > old; if (beat) save.best(SK.best + q.id, q.score);
    for (const x of BARS) save.setStat(SK.worked + x.id, x.id === q.id ? save.stat(SK.worked + x.id, 0) + 1 : Math.max(0, save.stat(SK.worked + x.id, 0) - 1));
    save.setStat(SK.con, +(save.stat(SK.con, 0) + q.con).toFixed(3)); save.setStat(SK.washes, save.stat(SK.washes, 0) + 1); if (q.nuggets) save.setStat(SK.nug, save.stat(SK.nug, 0) + q.nuggets);
    let relic = false; if (q.score > 0) { save.addGold(q.score); save.addXp(beat ? 55 : 28); } if (q.nuggets && !save.data.relics.includes('luckyNugget')) { save.addRelic('luckyNugget'); relic = true; }
    const first = !save.flag('zionGoldPanFirst'); save.setFlag('zionGoldPanFirst'); redrawBoard();
    S.done = { lost: q.lostGold, bar: b.name, short: b.short, score: q.score, takes: q.takes, nuggets: q.nuggets, bonus: q.bonus, con: +q.con.toFixed(2), conTotal: +save.stat(SK.con, 0).toFixed(1), best: Math.max(old, q.score), beat, old, xp: q.score > 0 ? (beat ? 55 : 28) : 0, relic, first, yieldPct: Math.round(q.yield * 100) };
    S.mode = 'done'; snd('fanfare', beat); }
  function dip() { if (!p || S.mode !== 'pan' || p.over || p.settling > 0 || p.dipT > 0) return; if (p.dips <= 0) { flash('NO DIPS LEFT IN THIS PAN', '#ffffff', 1.3); return; }
    p.dips--; p.dipT = 0.85; p.dipDone = false; snd('dip'); { const w = panG.getWorldPosition(V3()); ripple(w.x, w.z, 1.4); } }
  function bank() { if (!p || S.mode !== 'pan' || p.over) return; if (p.settling > 0) return; if (p.phase !== 'cleanup') { flash('BANK ONCE THE GRAVEL IS GONE', '#ffffff', 1.4); return; } land(false); }
  function grainWorld(g, out) { const rad = 0.0052 * g.s, rp = g.r * PR * 0.985; out.set(Math.cos(g.a) * rp, hAt(g.r) + rad * 0.5 + LAYER[g.k], Math.sin(g.a) * rp); return panTilt.localToWorld(out); }
  const _sv = new THREE.Vector3();
  function toScreen(w) { _sv.copy(w).project(camera); return { x: (_sv.x + 1) / 2 * CW(), y: (1 - _sv.y) / 2 * CHh(), z: _sv.z }; }
  function panScreen() { panTilt.updateMatrixWorld(); const c = toScreen(panG.getWorldPosition(V3())), e = toScreen(panG.localToWorld(V3(PR, 0.1, 0))), e2 = toScreen(panG.localToWorld(V3(0, 0.1, PR))); return { x: c.x, y: c.y, r: Math.max(Math.hypot(e.x - c.x, e.y - c.y), Math.hypot(e2.x - c.x, e2.y - c.y)) }; }
  function tryPick(sx, sy, radius = touch ? 40 : 28) { if (!p || p.phase !== 'cleanup' || p.settling > 0 || p.over || p.pickCd > 0) return false; panTilt.updateMatrixWorld(); let bst = null, bd = radius; const wp = V3();
    for (const g of p.grains) { if (!g.live || g.k < 3) continue; const s = toScreen(grainWorld(g, wp)), d = Math.hypot(s.x - sx, s.y - sy); if (d < bd) { bd = d; bst = g; } }
    if (!bst) return false; bst.live = 0; if (bst.k === 3) p.pickedM += bst.m; else p.pickedNug++; p.pickCd = 0.16; grainWorld(bst, wp);
    spawnSpill(wp.clone(), V3(), bst.k === 4 ? 0xffe27a : 0xffd447, 0.012 * (bst.k === 4 ? 2.6 : 1.1), 0.7, vial.localToWorld(V3(0, 0.2, 0))); puffW(wp.x, wp.y + 0.02, wp.z, 0xfff1b0, 1);
    snd('pick', bst.k === 4); try { navigator.vibrate && navigator.vibrate(bst.k === 4 ? [20, 40, 20] : 12); } catch (e) {}
    if (bst.k === 4) flash('A NUGGET! SAFE IN THE VIAL', '#ffd23a', 1.8); else if (p.firstPick) flash('PICKED · SAFE IN THE VIAL', '#ffd23a', 1.2); p.firstPick = false; return true; }
  // ---------- touch: circle = swirl · swipe down = dip · swipe up = bank · tap the gold = pick · tap the floor = walk ----------
  const el = renderer.domElement; let ptr = null; const ray = new THREE.Raycaster(), floorP = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const rel = e => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  el.addEventListener('pointerdown', e => { if (ptr || S.demo || !S.active) return; SND.init(); const q = rel(e); try { el.setPointerCapture(e.pointerId); } catch (er) {}
    ptr = { id: e.pointerId, x0: q.x, y0: q.y, x: q.x, y: q.y, t0: performance.now(), lt: performance.now(), ang: null, acc: 0, path: 0, picked: false };
    if (S.mode === 'pan') { if (tryPick(q.x, q.y)) ptr.picked = true; else { const c = panScreen(); ptr.c = c; ptr.ang = Math.atan2(q.y - c.y, q.x - c.x); } } });
  el.addEventListener('pointermove', e => { if (!ptr || ptr.id !== e.pointerId) return; const q = rel(e), now = performance.now(); ptr.path += Math.hypot(q.x - ptr.x, q.y - ptr.y); ptr.x = q.x; ptr.y = q.y;
    if (S.mode === 'pan' && !ptr.picked && ptr.c) { const c = ptr.c, dx = q.x - c.x, dy = q.y - c.y; if (Math.hypot(dx, dy) > c.r * 0.16) { const a = Math.atan2(dy, dx); if (ptr.ang != null) { const da = wrap(a - ptr.ang), dt = Math.max(0.008, (now - ptr.lt) / 1000); ptr.acc += da; const wi = da / dt; SW.w += (wi - SW.w) * Math.min(1, dt / 0.12); SW.last = now; if (Math.abs(ptr.acc) > 2.4) S.swirlUsed = true; } ptr.ang = a; } ptr.lt = now; } });
  const endPtr = e => { if (!ptr || ptr.id !== e.pointerId) return; const q = rel(e), dt = performance.now() - ptr.t0, dx = q.x - ptr.x0, dy = q.y - ptr.y0, P0 = ptr; ptr = null;
    if (S.mode === 'pan' && !P0.picked) { if (dt < 450 && Math.abs(dy) > 60 && Math.abs(dx) < Math.abs(dy) * 0.8 && Math.hypot(dx, dy) > P0.path * 0.8) { if (dy > 0) dip(); else bank(); return; }
      if (dt < 300 && Math.hypot(dx, dy) < 12) { if (p && p.phase === 'cleanup') flash('TAP RIGHT ON THE GOLD TO PICK IT', '#ffffff', 1.1); else if (!S.swirlUsed) flash('CIRCLE YOUR FINGER ROUND THE PAN', '#ffffff', 1.3); } return; }
    if (S.mode === 'walk' && !DLG && dt < 350 && Math.hypot(dx, dy) < 14) { const r = el.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2(q.x / r.width * 2 - 1, -(q.y / r.height) * 2 + 1), camera); const hit = V3(); if (ray.ray.intersectPlane(floorP, hit)) { hit.sub(OV);
      let s = null, bd = 1.2; for (const sp of SPOTS()) { const d = Math.hypot(hit.x - sp.x, hit.z - sp.z); if (d < bd) { bd = d; s = sp; } } if (!s) for (const n of npcs) if (Math.hypot(hit.x - n.f.position.x, hit.z - n.f.position.z) < 0.9) s = SPOTS().find(sp => sp.key === n.key);
      if (s) { goal = V3(s.x, 0, s.z); goalTalk = s; } else goal = V3(clamp(hit.x, -7.4, 7.4), 0, clamp(hit.z, -4, 5.6)); } } };
  el.addEventListener('pointerup', endPtr); el.addEventListener('pointercancel', e => { if (ptr && ptr.id === e.pointerId) ptr = null; });
  // ---------- walking ----------
  function collide(pos, r = 0.28) { for (const b of hall.colliders) { const cx = clamp(pos.x, b.x0, b.x1), cz = clamp(pos.z, b.z0, b.z1), dx = pos.x - cx, dz = pos.z - cz, d = Math.hypot(dx, dz); if (d < r) { if (d < 1e-4) { pos.z = b.z1 + r; continue; } pos.x = cx + dx / d * r; pos.z = cz + dz / d * r; } }
    for (const n of npcs) { const dx = pos.x - n.f.position.x, dz = pos.z - n.f.position.z, d = Math.hypot(dx, dz); if (d < 0.55 && d > 1e-4) { pos.x = n.f.position.x + dx / d * 0.55; pos.z = n.f.position.z + dz / d * 0.55; } } }
  function walk(dt) { let sx = stick.x, sy = stick.y; if (keys.has('KeyA') || keys.has('ArrowLeft')) sx = -1; if (keys.has('KeyD') || keys.has('ArrowRight')) sx = 1; if (keys.has('KeyW') || keys.has('ArrowUp')) sy = 1; if (keys.has('KeyS') || keys.has('ArrowDown')) sy = -1;
    let vx = 0, vz = 0; const run = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 4.6 : 3.2, m = Math.hypot(sx, sy);
    if (m > 0.12) { goal = null; goalTalk = null; vx = sx / Math.max(1, m) * run; vz = -sy / Math.max(1, m) * run; }
    else if (goal) { const dx = goal.x - ben.position.x, dz = goal.z - ben.position.z, d = Math.hypot(dx, dz); if (d < 0.12) { goal = null; const gt = goalTalk; goalTalk = null; if (gt && !S.demo) interact(gt); } else { const sp = Math.min(run, d / dt); vx = dx / d * sp; vz = dz / d * sp; } }
    const before = ben.position.clone(); ben.position.x += vx * dt; ben.position.z += vz * dt; collide(ben.position); S.stepD = (S.stepD || 0) + ben.position.distanceTo(before); if (S.stepD > 0.62) { S.stepD = 0; snd('step', run > 4); if (Math.random() < 0.5) puff(ben.position.x, 0.04, ben.position.z, 0xc8a878, 1); }
    if (goal && ben.position.distanceTo(before) < 0.2 * Math.hypot(vx, vz) * dt) { S.stuck = (S.stuck || 0) + dt; if (S.stuck > 0.5) { goal = null; goalTalk = null; S.stuck = 0; } } else S.stuck = 0;
    const sp = Math.hypot(vx, vz); if (sp > 0.2) ben.rotation.y = damp(ben.rotation.y, ben.rotation.y + wrap(Math.atan2(vx, vz) - ben.rotation.y), 12, dt); return sp; }
  // ---------- camera: frame a target into the free screen area (SAFE = HUD + cards), the free area's centre via a view offset ----------
  const SAFE = { top: 0, bottom: 0, left: 0, right: 0 }, CAM = { pos: V3(0, 5, 12), look: V3(0, 1, -2), ox: 0, oy: 0 };
  function frameFor(target, worldR, elv, yaw = 0, fill = 0.94) { const W = CW(), H = CHh(), x0 = SAFE.left, x1 = W - SAFE.right, y0 = SAFE.top, y1 = H - SAFE.bottom, rw = Math.max(90, x1 - x0), rh = Math.max(90, y1 - y0);
    const fov = camera.fov * Math.PI / 180, px = Math.min(rw, rh) * fill, d = (2 * worldR * H) / (2 * Math.tan(fov / 2) * px), dir = V3(Math.sin(yaw) * Math.cos(elv), Math.sin(elv), Math.cos(yaw) * Math.cos(elv));
    return { pos: target.clone().addScaledVector(dir, d), look: target.clone(), ox: W / 2 - (x0 + x1) / 2, oy: H / 2 - (y0 + y1) / 2 }; }
  function camShot() { const port = CW() < CHh(); camera.fov = port ? 56 : 44;
    if (S.mode === 'pan' || S.mode === 'glide' || (S.mode === 'done' && S.done)) { const b = bay(), t = V3(b.pan.x, b.pan.y + 0.05, b.pan.z); if (S.mode === 'done') return frameFor(t.add(V3(0.2, 0.05, 0.3)), 0.95, 0.55, Math.PI - 0.5, 0.9); return frameFor(t, PR * 1.16, 1.1, Math.PI, 0.88); }
    if (S.mode === 'intro') { if (S.cardBay) { const b = bay(); return frameFor(V3(b.stand.x, 0.95, b.stand.z - 0.55), 1.35, 0.42, 0.18); } return frameFor(V3(0, 1.3, -1.4), port ? 4.6 : 5.6, 0.36, 0, 0.98); }
    const t = ben.position.clone().add(V3(0, 0.6, port ? -1.6 : -1.1)); t.z = Math.min(t.z, port ? 2.4 : 3.0); t.x = clamp(t.x, -4.5, 4.5); return frameFor(t, port ? 4.0 : 3.4, port ? 0.8 : 0.62, 0, 1); }
  // ---------- demo (nothing is saved) ----------
  function demoStart() { SND.init(); DLG = null; p = null; S.done = null; ben.position.set(0, 0, 3.9); ben.rotation.y = Math.PI; S.sel = 0; S.mode = 'walk'; goal = V3(hall.bays[0].stand.x, 0, hall.bays[0].stand.z); goalTalk = null; S.demo = { ph: 'walk', t: 0, picks: 0, key: 'WALK', cap: 'Walk up to a bar with the stick, or just tap the floor. Then press TALK.' }; }
  function demoStop() { if (!S.demo) return; S.demo = null; S.hand = null; p = null; goal = null; openCard(0, false); }
  function demoStep(dt) { const D = S.demo; D.t += dt; const set = (key, cap) => { D.key = key; D.cap = cap; }; S.hand = null;
    if (D.ph === 'walk') { if (!goal) { D.ph = 'talk'; D.t = 0; set('TALK', 'At the bar: TALK opens the card. PAN IT starts a session of three pans.'); } return; }
    if (D.ph === 'talk') { if (D.t > 1.4) { startPan(0); D.ph = 'wash'; D.t = 0; set('CIRCLE', 'Circle your finger round the pan. Faster circles wash harder. Keep the wash just UNDER the gold line.'); } return; }
    if (!p || S.mode !== 'pan') return; const c = panScreen();
    if (D.ph === 'wash') { const ang = D.t * 7.2; S.hand = { x: c.x + Math.cos(ang) * c.r * 0.62, y: c.y + Math.sin(ang) * c.r * 0.62 * 0.8, down: true };
      p.target = p.dipT > 0 ? 0 : clamp(panSafe(p) - 0.07, 0.22, 0.96); p.dir = 1;
      if (p.water < 0.32 && p.dips > 0 && p.phase === 'wash') { D.ph = 'dip'; D.t = 0; set('SWIPE ↓', 'Running dry? Swipe DOWN to dunk the pan for fresh water. Two dips a pan.'); }
      if (p.phase === 'cleanup') { D.ph = 'pick'; D.t = 0; set('TAP', 'The gravel is gone. Tap the gold to pick it out with the tweezers. Picked gold is safe in the vial.'); } return; }
    if (D.ph === 'dip') { p.target = 0; S.hand = { x: c.x, y: c.y - c.r * 0.5 + Math.min(1, D.t / 0.6) * c.r, down: D.t < 0.6 }; if (D.t > 0.6 && !D.did) { D.did = true; dip(); } if (D.t > 1.6) { D.did = false; D.ph = 'wash'; D.t = 0; set('CIRCLE', 'Back to swirling. Keep it just under the gold line.'); } return; }
    if (D.ph === 'pick') { p.target = 0; if (!D.tgt || !D.tgt.live) { D.tgt = p.grains.find(g => g.live && g.k >= 3); D.tt = 0; } D.tt = (D.tt || 0) + dt;
      if (D.tgt) { const s = toScreen(grainWorld(D.tgt, V3())); S.hand = { x: s.x, y: s.y, down: D.tt > 0.45 }; if (D.tt > 0.6) { tryPick(s.x, s.y, 60); D.picks++; D.tgt = null; } }
      if (D.picks >= 4 || !D.tgt) { D.ph = 'sweep'; D.t = 0; set('CIRCLE', 'Now sweep the black sand off, gently. Between the two lines on the gauge.'); } return; }
    if (D.ph === 'sweep') { const ang = D.t * 5; S.hand = { x: c.x + Math.cos(ang) * c.r * 0.6, y: c.y + Math.sin(ang) * c.r * 0.48, down: true }; p.target = clamp((panBlackLine(p) + panSafe(p)) / 2, 0, 1);
      if (D.t > 3.2 || blackLeft(p) < 0.25) { D.ph = 'bank'; D.t = 0; set('SWIPE ↑', 'Swipe UP (or press 3) to bank it into the vial.'); } return; }
    if (D.ph === 'bank') { p.target = 0; S.hand = { x: c.x, y: c.y + c.r * 0.4 - Math.min(1, D.t / 0.7) * c.r, down: D.t < 0.7 }; if (D.t > 0.8 && !D.did) { D.did = true; bank(); } if (D.t > 2.6) { D.did = false; D.ph = 'end'; D.t = 0; set('3 PANS', 'That is one pan. A session is three, then Wick pays you. Your turn!'); } return; }
    if (D.ph === 'end') { p.target = 0; if (D.t > 2.6) demoStop(); } }
  // ---------- frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0;
  function step(dt) { S.t += dt; if ((S.flashT -= dt) <= 0) S.flash = null; if ((S.toastT -= dt) <= 0) S.toast = null; if (S.sluiceRun > 0) S.sluiceRun -= dt;
    if (DLG) { const c0 = Math.floor(DLG.chars / 5); DLG.chars += dt * 70; const L = DLG.lines[DLG.i]; if (L && DLG.chars < L.text.length && Math.floor(DLG.chars / 5) !== c0) snd('talk'); }
    for (const s of smokeS) { if (s.life <= 0) { s.s.material.opacity = 0; continue; } s.life -= dt * 1.4; s.s.position.addScaledVector(s.v, dt); s.s.material.opacity = 0.6 * s.life; s.s.scale.setScalar(0.08 + (1 - s.life) * 0.18); }
    hall.update(S.t, dt, { oil: oilOn() ? 1 : 0, sluiceRun: S.sluiceRun });
    if (S.demo) demoStep(dt);
    let mv = 0; const b = bay();
    if (S.mode === 'walk' && !DLG) mv = walk(dt);
    if (S.mode === 'glide') { S.glideT += dt; const k = Math.min(1, S.glideT / 0.9), e = k * k * (3 - 2 * k); ben.position.lerpVectors(S.glideFrom, V3(b.stand.x, 0, b.stand.z), e); ben.rotation.y = damp(ben.rotation.y, ben.rotation.y + wrap(Math.PI - ben.rotation.y), 10, dt); mv = k < 1 ? 2 : 0; if (k >= 1) { S.mode = 'pan'; flash('PAN 1 OF 3 · ' + p.S.name, '#ffd23a', 1.6); } }
    // the pan + Ben's arms
    const panning = S.mode === 'pan' || S.mode === 'glide' || S.mode === 'done';
    panG.visible = panning || S.mode === 'intro' && S.cardBay; vial.visible = panG.visible; panG.position.set(b.pan.x, b.pan.y, b.pan.z); vial.position.set(b.pan.x + 0.5, hall.TY + 0.19, -4.42);
    if (p && S.mode === 'pan') {
      if (p.pickCd > 0) p.pickCd -= dt; if (performance.now() - SW.last > 140) SW.w *= Math.exp(-dt * 7);
      const swirlT = clamp(Math.abs(SW.w) / 12, 0, 1); if (!S.demo) { p.target = p.dipT > 0 ? 0 : Math.max(swirlT, p.held ? 1 : 0, stick.w); if (Math.abs(SW.w) > 1) p.dir = Math.sign(SW.w); }
      if (p.msgT > 0) p.msgT -= dt;
      if (p.over) { if (S.t >= p.overT) finish(); }
      else if (p.settling > 0) { p.settling -= dt; p.tilt = Math.max(0, p.tilt - C.TILT_DOWN * dt); if (p.settling <= 0) nextPan(); }
      else { if (p.dipT > 0) { p.dipT -= dt; if (p.dipT < 0.45 && !p.dipDone) { p.dipDone = true; p.water = 1; const w = panG.getWorldPosition(V3()); puffW(w.x, hall.TY, w.z, 0xd8f0ff, 3);  } }
        const out = panStep(p, dt); let gold = 0;
        const pw = panG.getWorldPosition(V3()); for (const g of out) { const wp = grainWorld(g, V3()), dir = V3(wp.x - pw.x, 0, wp.z - pw.z).normalize(); spawnSpill(wp, dir.multiplyScalar(rr(0.5, 0.9)).add(V3(0, rr(0.3, 0.6), 0)), g.k >= 3 ? 0xffd447 : g.k === 2 ? 0x2b2721 : 0xb8ac8c, 0.0052 * g.s * 0.9, 1.2); if (g.k >= 3) gold++; }
        if (gold) { p.lostGold += gold; if (S.t > p.spilledFlash) { p.spilledFlash = S.t + 1.6; flash('COLOUR OVER THE LIP! EASE OFF', '#ec3013', 1.3); snd('lip'); } }
        if (out.length) { snd('spill', out.length, gold > 0); if (Math.random() < 0.5) { const sp = out[0], wp = grainWorld(sp, V3()); ripple(wp.x, wp.z, 0.5); } }
        if (p.phase === 'wash' && wasteLeft(p) <= 0.001) { p.phase = 'cleanup'; p.held = false; p.water = Math.max(p.water, C.CLEANUP_WATER); p.msg = 'GRAVEL GONE · CLEAN IT UP, OR BANK IT'; p.msgT = 3.2; flash('GRAVEL GONE! TAP THE GOLD · OR BANK IT', '#22c55e', 2.4); snd('cleanup'); }
        if (p.phase === 'wash') { const w = wasteLeft(p); if (w < (p.wasteLast ?? 2) - 0.004) { p.wasteLast = w; p.stuckT = 0; } else if ((p.stuckT = (p.stuckT || 0) + dt) > 3.2 && w < 0.4 && !S.demo) { p.stuckT = -6; flash('THE LAST GRAVEL NEEDS A PUSH · SWIRL HARDER FOR A MOMENT', '#ffffff', 2.4); } }
        if (p.water <= 0) land(p.phase === 'wash'); }
    }
    // pan pose: tipped away + precessing with the swirl; dunked on a dip; tipped toward the vial when it lands
    { const tl = p ? p.tilt : 0, ph = (S.panPh = (S.panPh || 0) + dt * (1.2 + tl * 6) * (p ? p.dir : 1)), th = 0.03 + tl * 0.16; let dy = 0, tx = -th * 0.6 + Math.cos(ph) * th, tz = Math.sin(ph) * th;
      if (p && p.dipT > 0) { const k = Math.sin(Math.min(1, (0.85 - p.dipT) / 0.85) * Math.PI); dy = -0.2 * k; tx = -0.45 * k; }
      if (p && p.settling > 0 && !p.over) { const k = Math.sin(Math.min(1, (1.6 - p.settling) / 1.6) * Math.PI); tz = -0.35 * k; }
      panTilt.position.y = damp(panTilt.position.y, dy, 14, dt); panTilt.rotation.x = damp(panTilt.rotation.x, tx, 10, dt); panTilt.rotation.z = damp(panTilt.rotation.z, tz, 10, dt); dashes.rotation.y += dt * 0.4; }
    // grains
    if (p && panG.visible) { const n = [0, 0, 0, 0, 0]; for (const g of p.grains) { if (!g.live) continue; const m = inst[g.k], i = n[g.k]; if (i >= CAP[g.k]) continue; n[g.k]++;
        const rad = 0.0052 * g.s * (g.k === 3 ? 1.15 : 1), rp = g.r * PR * 0.985; dummy.position.set(Math.cos(g.a) * rp, hAt(g.r) + rad * (g.k === 3 ? 0.3 : 0.5) + LAYER[g.k], Math.sin(g.a) * rp);
        const slope = g.r > 0.5 ? (g.r - 0.5) * 0.9 : 0; dummy.rotation.set(g.k === 3 ? slope * Math.sin(g.a + 1.57) : g.rx, g.k === 3 ? g.a : g.ry + g.a, g.k === 3 ? -slope * Math.cos(g.a + 1.57) : 0); dummy.scale.set(rad, g.k === 3 ? rad : rad * 0.72, rad); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }
      inst.forEach((m, k) => { m.count = n[k]; m.instanceMatrix.needsUpdate = true; }); flakeM.emissiveIntensity = 0.45 + Math.sin(S.t * 5) * 0.2 + (p.phase === 'cleanup' ? 0.25 : 0);
      const hw = 0.006 + p.water * 0.074, rw = rAt(hw) * PR * 0.99; waterD.scale.set(rw, 1, rw); waterD.position.y = hw; waterD.rotation.y -= dt * (0.6 + p.tilt * 5) * p.dir; waterM.opacity = 0.18 + p.water * 0.32; oilD.scale.set(rw * 0.9, 1, rw * 0.9); oilD.position.y = hw + 0.001; oilD.material.opacity = (p.S.oil || 0) * 0.22; oilD.rotation.y += dt * 0.3;
    } else if (!p) inst.forEach(m => m.count = 0);
    { const tgt = p ? Math.min(1, p.score / Math.max(1, p.S.rich * 2.4)) : S.done ? Math.min(1, S.done.score / Math.max(1, BARS[S.sel].rich * 2.4)) : 0; vialFill.scale.y = damp(vialFill.scale.y, Math.max(0.001, tgt * 0.2), 4, dt); vialFill.position.y = 0.02 + vialFill.scale.y / 2; }
    // spills
    for (let i = spills.length - 1; i >= 0; i--) { const s = spills[i]; s.t += dt; s.life -= dt; if (s.to) { const k = Math.min(1, s.t / 0.55); s.p.lerpVectors(s.from, s.to, k); s.p.y += Math.sin(k * Math.PI) * 0.18; if (k >= 1) s.life = 0; } else { s.v.y -= 9.8 * dt; s.p.addScaledVector(s.v, dt); if (s.p.y < hall.TY - 0.05) { s.life = 0; if (Math.random() < 0.3) puffW(s.p.x, hall.TY - 0.04, s.p.z, 0xd8f0ff, 1); } } if (s.life <= 0) spills.splice(i, 1); }
    for (let i = 0; i < SPN; i++) { const s = spills[i]; if (s) { dummy.position.copy(s.p); dummy.rotation.set(s.t * 7, s.t * 5, 0); dummy.scale.setScalar(s.s); } else dummy.scale.setScalar(0); dummy.updateMatrix(); spillI.setMatrixAt(i, dummy.matrix); if (s) spillI.setColorAt(i, _c.setHex(s.col)); }
    spillI.instanceMatrix.needsUpdate = true; if (spillI.instanceColor) spillI.instanceColor.needsUpdate = true;
    // polish
    { const pa = moteG.attributes.position; for (let i = 0; i < MOTES; i++) { moteS[i] += dt * 0.3; let y = pa.getY(i) + dt * 0.05 * Math.sin(moteS[i] * 0.7), x = pa.getX(i) + dt * 0.06 * Math.cos(moteS[i]); if (y > 3.9) y = 0.3; if (x > 7.5) x = -7.4; pa.setXY(i, x, y); } pa.needsUpdate = true; }
    for (const g of glints) { g.position.x += dt * 0.47; if (g.position.x > 7.2) { g.position.x = -7.1; g.position.z = rr(hall.TZ0 + 0.15, hall.TZ1 - 0.15); } g.userData.ph += dt * 3; g.material.opacity = Math.max(0, Math.sin(g.userData.ph)) ** 6 * 0.9; }
    for (const r of ripples) { if (r.t >= 1) { r.m.visible = false; continue; } r.t += dt / 0.9; const k = r.t; r.m.scale.setScalar(0.05 + k * 0.45 * r.s); r.m.material.opacity = (1 - k) * 0.6; }
    stoveL.intensity = 1.6 + Math.sin(S.t * 11) * 0.12 + Math.sin(S.t * 23.7) * 0.08;
    if (p && panG.visible) { const live = p.grains.filter(g => g.live && g.k >= 3 && g.r > 0.08); for (const s of sparks) { s.t += dt * (p.phase === 'cleanup' ? 1.4 : 0.8); if (s.t >= 1 || (s.g && !s.g.live)) { s.t = 0; s.g = live.length ? live[Math.floor(Math.random() * live.length)] : null; }
        if (!s.g) { s.sp.material.opacity = 0; continue; } const rp = s.g.r * PR * 0.985; s.sp.position.set(Math.cos(s.g.a) * rp, hAt(s.g.r) + 0.03, Math.sin(s.g.a) * rp); const k = Math.sin(s.t * Math.PI); s.sp.scale.setScalar(0.02 + k * (p.phase === 'cleanup' ? 0.06 : 0.04)); s.sp.material.opacity = k; } }
    else for (const s of sparks) s.sp.material.opacity = 0;
    { const want = vialFill.scale.y; if (want > (S.vialSeen || 0) + 0.004) { S.vialSeen = want; S.vialGl = 1; } S.vialGl = Math.max(0, (S.vialGl || 0) - dt * 1.5); vialGlint.material.opacity = S.vialGl; vialGlint.position.y = 0.02 + want; }
    if (S.mode === 'walk' && !S.demo && !DLG) { const bb = bay(), d = Math.hypot(ben.position.x - bb.stand.x, ben.position.z - bb.stand.z); HR.place(d > 1.6 ? { p: V3(bb.stand.x + OV.x, 0.01, bb.stand.z + OV.z), r: 0.55 } : null, S.t, dt); } else HR.place(null, S.t, dt);
    { const md = S.mode === 'pan' || S.mode === 'glide' ? 'pan' : 'hall'; if (md !== S.md) { S.md = md; SND.setMood(md); } }
    SND.update(dt, { benX: ben.position.x, benZ: ben.position.z, panning: S.mode === 'pan' && !!p && !(p.settling > 0) && !(p.dipT > 0), tilt: p ? p.tilt : 0, over: !!(p && S.mode === 'pan' && !(p.settling > 0) && p.tilt > panSafe(p) + 0.01), gravel: p ? 0.4 + wasteLeft(p) * 0.6 : 1 });
    // foxes
    kit.animFox(ben, dt, mv); kit.animFox(wick, dt, 0); for (const n of npcs) { const near = Math.hypot(ben.position.x - n.f.position.x, ben.position.z - n.f.position.z) < 3.2; n.f.userData.lookAt = near ? ben.position.clone().add(V3(0, 1.2, 0)) : null; if (n.f !== wick) kit.animFox(n.f, dt, 0); if (n.sit) n.f.userData.P.legs.forEach(l => l.rotation.x = -1.35); n.f.userData.talking = !!(DLG && DLG.name === n.key.toUpperCase()); }
    if (S.mode === 'pan' || S.mode === 'glide' || S.mode === 'done' || (S.mode === 'intro' && S.cardBay)) { const P = ben.userData.P, sw = p ? Math.sin(S.panPh) * 0.12 * (0.3 + p.tilt) : 0; P.arms[0].rotation.x = -1.12 + sw; P.arms[1].rotation.x = -1.12 - sw; P.arms[0].rotation.z = -0.32; P.arms[1].rotation.z = 0.32; P.body.rotation.x = 0.16; ben.userData.lookAt = panG.getWorldPosition(V3());
      if (S.mode === 'intro' && S.cardBay) { ben.position.x = damp(ben.position.x, b.stand.x, 6, dt); ben.position.z = damp(ben.position.z, b.stand.z, 6, dt); ben.rotation.y = damp(ben.rotation.y, ben.rotation.y + wrap(Math.PI - ben.rotation.y), 8, dt); } }
    else ben.userData.lookAt = null;
    // camera
    const sh = camShot(); sh.pos.add(OV); sh.look.add(OV); const k = 1 - Math.exp(-dt * (S.mode === 'walk' ? 5 : 3.2)); CAM.pos.lerp(sh.pos, k); CAM.look.lerp(sh.look, k); CAM.ox += (sh.ox - CAM.ox) * k; CAM.oy += (sh.oy - CAM.oy) * k;
    camera.position.copy(CAM.pos); camera.lookAt(CAM.look); const W = CW(), H = CHh(); camera.aspect = W / H; if (Math.abs(CAM.ox) + Math.abs(CAM.oy) > 0.5) camera.setViewOffset(W, H, CAM.ox, CAM.oy, W, H); else camera.clearViewOffset(); camera.updateProjectionMatrix();
    for (const m of hall.front) m.visible = camera.position.z - OV.z < hall.D / 2 - 0.4; for (const m of hall.roof) m.visible = camera.position.y < hall.H - 0.5; }
  function tick(dt) { if (!PAUSE && S.active) step(dt); hudT -= dt; if (hudT <= 0) { hudT = S.mode === 'pan' ? 0.05 : 0.1; onState(hud()); } }
  function frame() { raf = requestAnimationFrame(frame); tick(Math.min(0.05, clock.getDelta())); renderer.render(scene, camera); }
  function onRs() { renderer.setSize(CW(), CHh()); } let ro = null; if (ownLoop) { addEventListener('resize', onRs); ro = new ResizeObserver(onRs); ro.observe(container); }
  const onKD = e => { if (!S.active || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; const c = e.code;
    if (S.mode === 'pan' && !S.demo) { if (c === 'Space' || c === 'Digit1' || c === 'KeyJ') { e.preventDefault(); if (p) p.held = true; return; } if (c === 'Digit2' || c === 'KeyK') { e.preventDefault(); if (!e.repeat) dip(); return; } if (c === 'Digit3' || c === 'KeyB' || c === 'KeyL' || c === 'Enter') { e.preventDefault(); if (!e.repeat) bank(); return; } if (c === 'Escape') { leavePan(); return; } }
    if (S.mode === 'walk' && !S.demo) { if (c === 'KeyE' || c === 'Enter') { e.preventDefault(); if (!e.repeat) api.talk(); return; } if (c === 'Space') { e.preventDefault(); if (!e.repeat) { ben.userData.hop = 1; snd('hop'); } return; } }
    keys.add(c); };
  const onKU = e => { keys.delete(e.code); if (p && (e.code === 'Space' || e.code === 'Digit1' || e.code === 'KeyJ')) p.held = false; };
  addEventListener('keydown', onKD); addEventListener('keyup', onKU); const onVis = () => SND.suspend(document.hidden); document.addEventListener('visibilitychange', onVis); const onBlur = () => { keys.clear(); if (p) p.held = false; }; addEventListener('blur', onBlur);
  function hud() { const sp = S.mode === 'walk' && !DLG && !S.demo ? nearSpot() : null, cl = claimId();
    const bars = BARS.map(b => ({ id: b.id, name: b.name, short: b.short, tag: b.tag, rich: b.rich, nugget: b.nugget, best: best(b.id), claim: cl === b.id, oil: oilOn() ? b.oil : 0, yieldPct: Math.round(yieldOf(b.id) * 100) }));
    let ring = null; if (p && S.mode === 'pan' && p.phase === 'wash' && !S.swirlUsed && !S.demo) ring = panScreen();
    const pan = p ? { name: p.S.name, panNo: p.panNo, pans: C.PANS, phase: p.phase, water: p.water, tilt: p.tilt, safe: Math.min(1, panSafe(p)), black: p.phase === 'cleanup' ? Math.min(1, panBlackLine(p)) : null, waste: wasteLeft(p), blackLeft: blackLeft(p),
      bonusIf: Math.round(p.S.rich * p.yield * C.CLEANUP_SHARE * Math.max(0, 1 - blackLeft(p))), score: p.score, best: best(p.id), yieldPct: Math.round(p.yield * 100), dips: p.dips, dipsMax: C.DIPS, settling: p.settling > 0, over: p.over, oil: p.S.oil, claim: cl === p.id, msg: p.msgT > 0 ? p.msg : '', hot: p.tilt > panSafe(p) } : null;
    const quest = S.mode === 'pan' && p ? p.S.short + ' · PAN ' + p.panNo + '/' + C.PANS + ' · ' + p.score + 'g' + (p.phase === 'cleanup' ? ' · CLEAN-UP' : '') : S.mode === 'walk' ? 'GOLD RUSH · WALK UP TO A BAR AND TALK' : 'GOLD RUSH · THE PANNING HALL';
    const L = DLG ? DLG.lines[DLG.i] : null, done = DLG ? DLG.chars >= L.text.length : false;
    return { mode: S.mode, sel: S.sel, cardBay: S.cardBay, bars, pan, gold: save.data.gold, con: +save.stat(SK.con, 0).toFixed(1), conPay: Math.round(save.stat(SK.con, 0) * C.CON_PER), washes: save.stat(SK.washes, 0), nuggets: save.stat(SK.nug, 0), claim: cl,
      flash: S.flash, toast: S.toast, prompt: sp ? sp.label : null, done: S.done, demo: S.demo ? { key: S.demo.key, cap: S.demo.cap } : null, hand: S.hand, ring, quest, first: !save.flag('zionGoldPanFirst'),
      dialog: DLG ? { name: DLG.name, role: DLG.role, text: L.text.slice(0, Math.floor(DLG.chars)), step: DLG.i + 1, total: DLG.lines.length, done, you: !!L.you, more: !!DLG.conv, required: false, choices: DLG.choices && done && DLG.i === DLG.lines.length - 1 ? DLG.choices.map(c => ({ text: c.text, asked: !!c.asked, bye: !!c.bye })) : null } : null }; }
  if (ownLoop) frame();
  const api = {
    // page
    openCard, startPan, leavePan, demoStart, demoStop, dip, bank, hud,
    lookAround() { SND.init(); S.mode = 'walk'; S.done = null; DLG = null; if (S.cardBay) { const b = bay(); ben.position.set(b.stand.x, 0, b.stand.z + 0.6); } },
    toIntro() { if (S.demo) S.demo = null; p = null; S.done = null; openCard(S.sel, false); },
    select(i) { SND.init(); snd('click'); S.sel = clamp(i | 0, 0, 2); },
    setSafe(top, bottom, left = 0, right = 0) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; SAFE.right = right; },
    // Game HUD engine contract
    melee() { if (S.demo) return; if (S.mode === 'pan' && p) p.held = true; else if (S.mode === 'walk') { const P = ben.userData; P.talking = true; setTimeout(() => P.talking = false, 900); } },
    meleeUp() { if (p) p.held = false; }, range() { if (!S.demo) dip(); }, jump() { if (S.demo) return; if (S.mode === 'pan') bank(); else if (S.mode === 'walk') { ben.userData.hop = 1; snd('hop'); } },
    talk() { if (S.demo) return; SND.init(); if (DLG) return api.nextLine(); if (S.mode === 'walk') interact(nearSpot()); },
    choose(i) { if (DLG && DLG.choices && DLG.choices[i]) DLG.choices[i].act(); }, closeDialog() { DLG = null; wick.userData.talking = false; },
    nextLine() { if (!DLG) return; const L = DLG.lines[DLG.i]; if (DLG.chars < L.text.length) { DLG.chars = L.text.length; return; } if (DLG.choices && DLG.i === DLG.lines.length - 1) return; if (DLG.i < DLG.lines.length - 1) { DLG.i++; DLG.chars = 0; return; } const t = DLG.then; DLG = null; t && t(); },
    clearToast() { S.toast = null; }, useItem() { toast('NO ITEMS AT THE BAR · YOUR PAWS ARE FULL', 2); }, closeWheel() {}, skipTime() {}, setPaused(v) { PAUSE = !!v; }, setHudPad() {},
    setStick(x, y) { stick.x = x; stick.y = y; const m = Math.hypot(x, y), now = performance.now();
      if (S.mode === 'pan' && m > 0.5) { const a = Math.atan2(y, x); if (stick.a != null) { const dt = Math.max(0.008, (now - stick.t) / 1000), wi = Math.abs(wrap(a - stick.a)) / dt; stick.w = clamp(stick.w + (clamp(wi / 10, 0, 1) - stick.w) * Math.min(1, dt / 0.15), 0, 1); if (stick.w > 0.2) S.swirlUsed = true; } stick.a = a; stick.t = now; } else { stick.a = null; stick.w = 0; } },
    start() {}, eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy() {}, zoomBy() {}, getCam() { return { dist: 6, pitch: 0.5 }; }, setCam() {}, setMinimap() {}, toggleSound() { SND.setMuted(!SND.muted); }, sound: () => ({ muted: SND.muted, music: SND.music }), toggleMute() { SND.init(); SND.setMuted(!SND.muted); }, toggleMusic() { SND.init(); SND.setMusic(!SND.music); }, cycleWeather() {},
    mapData() { return { p: [ben.position.x, ben.position.z, ben.rotation.y], b: [...hall.bays.map(b => [b.bar.short, b.stand.x, b.stand.z]), ['SURVAY OFFICE', 6.3, 0.1], ['CAMP SLUICE', -6.6, 0.2], ['HIGH SCORES', -7.5, 4.5]], f: npcs.map(n => [n.f.position.x, n.f.position.z]), e: [], q: S.mode === 'walk' ? [hall.bays[S.sel].stand.x, hall.bays[S.sel].stand.z, BARS[S.sel].short] : null }; },
    // test hooks
    _state: () => S, _pan: () => p, _ben: ben, _cam: () => ({ SW, ptr, CAM, SAFE, cam: camera.position, fov: camera.fov, zoom: camera.zoom, view: camera.view, pm: camera.projectionMatrix.elements.slice(0, 6), benS: ben.scale.x, rs: renderer.getSize(new THREE.Vector2()) }), _sim(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); }, _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _screen: panScreen, _pick: tryPick, _gold: () => { panTilt.updateMatrixWorld(); return p ? p.grains.filter(g => g.live && g.k >= 3).map(g => toScreen(grainWorld(g, V3()))) : []; }, _target(v) { if (p) { S.demo = S.demo || null; p.held = false; SW.w = v * 10; SW.last = performance.now() + 1e7; } },
    get active() { return S.active; }, setActive(v) { S.active = !!v; if (!v) { camera.clearViewOffset(); camera.updateProjectionMatrix(); p = null; S.mode = 'walk'; HR.place(null, 0, 0); } SND.suspend(!v); G.visible = true; },
    frame: tick, group: G, hall, enterAt(door = true) { S.active = true; S.mode = 'walk'; p = null; DLG = null; ben.position.set(0, 0, door ? 3.9 : 0); ben.rotation.y = Math.PI; SND.init(); SND.suspend(false); },
    destroy() { cancelAnimationFrame(raf); if (ro) { removeEventListener('resize', onRs); ro.disconnect(); } scene.remove(G); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); if (ownLoop) { renderer.dispose(); renderer.domElement.remove(); } SND.dispose(); document.removeEventListener('visibilitychange', onVis); } };
  return api;
}
