// 8 GATES — ARCADE · SLOTS: LUCKY GATES [arcadeSlots]. A new 3D three-line slot machine for the arcade room (not a replacement for #161).
// 3 reels × 3 rows, paylines 1 (middle) · 2 (top) · 3 (bottom), bet 1–5 shared gold a line. 8 · 8 · 8 at max bet wins the progressive jackpot.
// Real gold through engine/save.js, with a daily loss limit (100 gold). Demo mode (?demo=1) spins free credits.
// ONLINE JACKPOT ROOM: up to 5 friends on their own phones share one growing pot and see each other's wins live.
// Accessibility: SOUND REELS (each symbol has its own note when its reel stops), SPOKEN RESULTS, big controls, phone buzz.
// FILES: slots.js (game) · slots-rules.js (maths) · slots-machine.js (cabinet + world prop) · slots-audio.js (sound + music)
//        · slots-embed.js (open from a world) · arcade-room.js (the room, shared with nothing else yet). Uses pinball-machine.js
//        (dot-matrix display, glow, the pinball machine standing beside it) and pinball-audio.js (synth engine).
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit } from '../../fox-kit.js';
import { castKit } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { crestTex } from '../../engine/textures.js';
import { makeGradient, pinballProp } from './pinball-machine.js';
import { buildSlotMachine, stopAngle } from './slots-machine.js';
import { SYMBOLS, LINES, BET, MAX_LINES, JACKPOT, DAILY_LOSS_LIMIT, PAYTABLE, evaluate, teaser, randStop, column } from './slots-rules.js';
import { SlotSound, SlotsMusic, SYMBOL_NOTE } from './slots-audio.js';
import { buildArcadeRoom } from './arcade-room.js';

export const SLOTS = { name: 'LUCKY GATES', room: 'arcadeSlots', key: 'arcadeSlots', maxPlayers: 5 };
export const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PINK', '#f472b6']];
export const SAVE_KEYS = { pot: 'arcadeSlots.pot', day: 'arcadeSlots.day', prefs: 'arcadeSlots.prefs', spins: 'arcadeSlots.spins', won: 'arcadeSlots.won', bigWin: 'arcadeSlots.bigWin', jackpots: 'arcadeSlots.jackpots', jackpotFlag: 'arcadeSlots.jackpot' };
export { PAYTABLE };
export const HOW = [
  ['SPIN', 'Tap SPIN (or pull the lever on screen with the SPIN button). Space / Enter on a keyboard.'],
  ['LINES', '1 = middle row, 2 = + top row, 3 = + bottom row. More lines = more ways to win, more gold per spin.'],
  ['BET', '1 to 5 gold on each line. Total bet = bet × lines.'],
  ['JACKPOT', '8 · 8 · 8 on a line at BET 5 wins 1,250 plus the whole JACKPOT pot. Every spin adds 3% of its bet to the pot.'],
  ['FULL MOONS', 'A full moon on the first reel always pays. Two moons from the left pay more.'],
  ['DAILY LIMIT', 'You can lose at most ' + DAILY_LOSS_LIMIT + ' gold a day here. Then the machine rests until tomorrow.'],
  ['ONLINE', 'Open a JACKPOT ROOM: up to 5 friends share one pot and see each other’s wins.']];

const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => v < a ? a : v > b ? b : v, pick = a => a[Math.floor(Math.random() * a.length)];
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
const fmt = n => Math.round(n).toLocaleString('en-US');
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

function localDuel({ game, code, onMsg, onStatus }) {
  const id = 'L' + Math.random().toString(36).slice(2, 9); let bc = null;
  try { bc = new BroadcastChannel('8g-' + game + '-' + code); } catch (e) { setTimeout(() => onStatus && onStatus('offline'), 0); return { id, send() {}, leave() {} }; }
  bc.onmessage = e => { const m = e.data; if (!m || m.from === id || (m.to && m.to !== id)) return; onMsg && onMsg(m.t, m.d, m.from); };
  setTimeout(() => onStatus && onStatus('local'), 0);
  return { id, send(t, d, to) { try { bc.postMessage({ t, d, to: to || null, from: id }); } catch (e) {} }, leave() { try { bc.close(); } catch (e) {} } };
}
async function connectNet(opts) { try { const mod = await import(new URL('engine/duel-net.js', document.baseURI).href); if (mod && mod.connectDuel) return await mod.connectDuel(opts); } catch (e) {} return localDuel(opts); }

// WORLD MODE (s101, Ben "casino: do the same for each game"): createSlots({ onState, opts: { world: { renderer, camera, parent, height } } }) plays on a casino cabinet in a 3D map:
// no room, cast, lights or render of its own; the real machine is built into world.parent (scaled to world.height), the game camera is private (the map blends to it), keys come from the map (keyDown).
export async function createSlots({ container, onState, opts = {} }) {
  const WD = opts.world || null;
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => (WD ? innerWidth : container.clientWidth) || 1, CH = () => (WD ? innerHeight : container.clientHeight) || 1;
  const renderer = WD ? WD.renderer : new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' });
  if (!WD) { renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.75 : 2)); renderer.setSize(CW(), CH()); renderer.shadowMap.enabled = !touch;
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement); }
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#14112a'); scene.fog = new THREE.Fog('#14112a', 10, 24);
  const camera = new THREE.PerspectiveCamera(WD ? (WD.camera.fov || 55) : 40, CW() / CH(), WD ? 0.02 : 0.05, 60);
  let STAGE = null, stageYaw = 0; if (WD) { STAGE = new THREE.Group(); STAGE.name = 'slotsWorld'; WD.parent.add(STAGE); STAGE.updateWorldMatrix(true, false); const q = new THREE.Quaternion(); STAGE.getWorldQuaternion(q); stageYaw = new THREE.Euler().setFromQuaternion(q, 'YXZ').y; }
  const grad = makeGradient(THREE), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  scene.add(new THREE.HemisphereLight(0xf2eaff, 0x3a2a4a, 1.25));
  const sun = new THREE.DirectionalLight(0xfff2e0, 1.5); sun.position.set(2, 7, 3.5); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 14 }); scene.add(sun);
  const snd = new SlotSound(), music = new SlotsMusic(snd);

  // ---------------- room, machine, neighbours, cast ----------------
  const room = WD ? null : buildArcadeRoom({ THREE, toon, M, grad, touch, scene }, { signs: ['ARCADE', 'JACKPOT'] });
  const SM = buildSlotMachine({ THREE, toon, M, grad, touch }, { scale: 1.35 }); (STAGE || scene).add(SM.machine);
  if (WD) { const bx = new THREE.Box3().setFromObject(SM.machine), h = Math.max(0.1, bx.max.y - bx.min.y); SM.machine.scale.multiplyScalar((WD.height || 2.65) / h); SM.machine.updateMatrixWorld(true); }
  let pin = null; if (!WD) try { pin = pinballProp({ THREE, toon, M, grad, touch }, { x: -2.2, z: -0.7, rotY: 0.5, best: save.stat('arcadePinball.best', 0) }); scene.add(pin.group); } catch (e) {}
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }), foxes = {};
  if (!WD) try {
    foxes.ben = cast.make('player'); foxes.ben.position.set(1.25, 0, 0.75); foxes.ben.rotation.y = -Math.PI * 0.7; foxes.ben.userData.mood = 'excited'; scene.add(foxes.ben);
    foxes.hope = cast.make('hope'); foxes.hope.position.set(2.0, 0, -0.35); foxes.hope.rotation.y = -Math.PI * 0.55; foxes.hope.userData.mood = 'happy'; scene.add(foxes.hope);
    foxes.noble = cast.make('noble'); foxes.noble.position.set(-1.25, 0, 0.7); foxes.noble.rotation.y = Math.PI * 0.7; foxes.noble.userData.mood = 'happy'; scene.add(foxes.noble);
  } catch (e) { console.warn('slots: cast failed', e); }

  // ---------------- state ----------------
  const prefs = Object.assign({ music: true, sound: true, soundReels: true, speech: false, haptics: true }, (() => { try { return save.stat(SAVE_KEYS.prefs, null) || {}; } catch (e) { return {}; } })());
  snd.sfxOn = prefs.sound; snd.musicOn = prefs.music;
  const st = { phase: 'menu', bet: 1, lines: 3, spinning: false, auto: 0, stops: [3, 10, 17], result: null, winT: 0, winIds: [], win: 0, winShown: 0, msg: null, msgQ: [], demo: false, demoCredits: 100, session: { spent: 0, won: 0, spins: 0 }, tease: false, feed: [], creditShown: 0, kind: '' };
  const reels = SM.reels.map((g, i) => ({ g, a: stopAngle(st.stops[i]), v: 0, mode: 'idle', from: 0, to: 0, t: 0, dur: 0.6, stopAt: 0, lastTick: 0 }));
  reels.forEach(r => r.g.rotation.x = r.a);
  let dirty = true, lastEmit = 0, lastT = performance.now(), tNow = 0, stopped = false, leverT = 0, tickGate = 0;
  const timers = []; const later = (s, fn) => timers.push({ t: tNow + s, fn });
  const buzz = ms => { if (prefs.haptics && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} };
  const sfx = (k, pan = 0, amt) => { if (prefs.sound) snd.play(k, pan, amt); };
  const say = t => { if (!prefs.speech || !window.speechSynthesis) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.rate = 1.08; music.setDuck(0.4); u.onend = u.onerror = () => music.setDuck(1); speechSynthesis.speak(u); } catch (e) {} };
  function flash(t, sub = '', col = '#ffd23a', dur = 1.8) { st.msgQ.push({ t, sub, col, dur }); dirty = true; }
  // gold, the day's limit and the pot
  const gold = () => st.demo ? st.demoCredits : (() => { try { return save.data.gold; } catch (e) { return 0; } })();
  function dayRec() { let d = null; try { d = save.stat(SAVE_KEYS.day, null); } catch (e) {} if (!d || d.d !== today()) d = { d: today(), net: 0 }; return d; }
  function dayAdd(n) { const d = dayRec(); d.net += n; try { save.setStat(SAVE_KEYS.day, d); } catch (e) {} }
  const lossLeft = () => Math.max(0, DAILY_LOSS_LIMIT + Math.min(0, dayRec().net));
  let localPot = (() => { try { return save.stat(SAVE_KEYS.pot, JACKPOT.base); } catch (e) { return JACKPOT.base; } })();
  const pot = () => N && net.st === 'room' ? net.pot : localPot;
  function potAdd(n) { if (N && net.st === 'room') { net.pot += n; N.send('bet', { add: n }); } else { localPot += n; try { save.setStat(SAVE_KEYS.pot, Math.round(localPot * 100) / 100); } catch (e) {} } }
  function potReset() { if (N && net.st === 'room') net.pot = JACKPOT.base; else { localPot = JACKPOT.base; try { save.setStat(SAVE_KEYS.pot, localPot); } catch (e) {} } }

  // ---------------- spin ----------------
  const totalBet = () => st.bet * st.lines;
  function canSpin() {
    if (st.spinning || st.phase !== 'play') return 'busy';
    if (st.demo) return st.demoCredits >= totalBet() ? '' : 'nogold';
    if (gold() < totalBet()) return 'nogold';
    if (totalBet() > lossLeft()) return lossLeft() <= 0 ? 'limit' : 'lower';
    return '';
  }
  function spin() {
    snd.wake(); const why = canSpin();
    if (why === 'busy') return;
    if (why) { st.auto = 0; sfx('nogold'); buzz(60);
      if (why === 'nogold') flash('NOT ENOUGH GOLD', 'LOWER YOUR BET OR LINES', '#ec3013'); else if (why === 'limit') flash('DAILY LIMIT REACHED', 'THE MACHINE RESTS TILL TOMORROW', '#ec3013', 2.6); else flash('BET TOO HIGH FOR TODAY', 'ONLY ' + lossLeft() + ' GOLD LEFT TODAY', '#ec3013', 2.2);
      say(why === 'limit' ? 'Daily limit reached. Come back tomorrow.' : 'Not enough gold.'); return; }
    const total = totalBet();
    if (st.demo) st.demoCredits -= total; else { try { save.spend(total); } catch (e) {} dayAdd(-total); st.session.spent += total; }
    potAdd(total * JACKPOT.share);
    st.result = null; st.win = 0; st.winShown = 0; st.winIds = []; st.winT = 0; st.kind = ''; SM.showWins([], false); SM.setCoins(0);
    st.stops = [randStop(), randStop(), randStop()]; st.tease = teaser(st.stops[0], st.stops[1], st.lines);
    st.spinning = true; leverT = 0.7; SM.press('spin'); sfx('lever'); later(0.05, () => sfx('insert')); buzz(25);
    const base = 0.95, gap = 0.4;
    reels.forEach((r, i) => { r.mode = 'spin'; r.v = 0; r.stopAt = tNow + base + i * gap + (i === 2 && st.tease ? 1.4 : 0); });
    if (st.tease) later(base + gap + 0.5, () => { sfx('tease'); const c0 = column(0, st.stops[0]), c1 = column(1, st.stops[1]), two8 = [0, 1, 2].some(r => c0[r] === 'eight' && c1[r] === 'eight'); flash(two8 ? '8 · 8 · ?' : 'CRESCENT · CRESCENT · ?', 'COME ON…', '#ffd23a', 1.4); });
    dirty = true;
  }
  function reelStopped(i) {
    const r = reels[i], col = column(i, st.stops[i]); sfx('stop', (i - 1) * 0.5); buzz(12);
    if (prefs.soundReels) later(0.06, () => sfx('note', (i - 1) * 0.5, SYMBOL_NOTE[col[1]]));
    if (reels.every(q => q.mode === 'idle')) settle();
  }
  function settle() {
    const r = evaluate(st.stops, st.lines, st.bet); st.result = r; st.spinning = false;
    let amt = r.total; const jp = r.jackpot ? Math.floor(pot()) : 0; amt += jp;
    const kind = r.jackpot ? 'jackpot' : amt >= totalBet() * 20 ? 'big' : amt >= totalBet() * 5 ? 'medium' : amt > 0 ? 'small' : '';
    st.kind = kind; st.win = amt; st.lastWin = amt; st.winIds = r.wins.map(w => w.line); st.winT = amt > 0 ? (kind === 'jackpot' ? 8 : kind === 'big' ? 5 : 3.2) : 0;
    st.winCells = r.wins.flatMap(w => Array.from({ length: w.n }, (_, reel) => ({ reel, row: w.row, col: SM.LCOL[w.line - 1] }))); st.burstT = 0;
    st.winCells.forEach(c => { const p = SM.cellPos(c.reel, c.row); SM.burst(p.x, p.y, c.col, kind === 'small' ? 5 : 10); });
    try { save.setStat(SAVE_KEYS.spins, save.stat(SAVE_KEYS.spins) + 1); } catch (e) {} st.session.spins++;
    if (amt > 0) {
      if (st.demo) st.demoCredits += amt; else { try { save.addGold(amt); save.setStat(SAVE_KEYS.won, save.stat(SAVE_KEYS.won) + amt); save.best(SAVE_KEYS.bigWin, amt); } catch (e) {} dayAdd(amt); st.session.won += amt; }
      const top = r.wins.slice().sort((a, b) => b.amt - a.amt)[0], what = top.n === 3 ? SYMBOLS[top.kind].name + ' × 3' : top.n === 2 ? 'TWO MOONS' : 'FULL MOON';
      if (kind === 'jackpot') { potReset(); flash('JACKPOT!', '+' + fmt(amt) + ' GOLD', '#ffd23a', 4); sfx('jackpot'); later(0.3, () => sfx('big')); buzz([60, 40, 60, 40, 120]); shake(0.8); try { if (!st.demo) { save.setFlag(SAVE_KEYS.jackpotFlag, true); save.setStat(SAVE_KEYS.jackpots, save.stat(SAVE_KEYS.jackpots) + 1); } } catch (e) {} if (N) N.send('win', { amt, what: 'JACKPOT', jp: true }); }
      else { flash((kind === 'big' ? 'BIG WIN ' : 'WIN ') + fmt(amt), what + (r.wins.length > 1 ? ' · ' + r.wins.length + ' LINES' : ' · ' + top.name), kind === 'big' ? '#ffd23a' : '#22c55e', kind === 'big' ? 3 : 1.8); sfx(kind); if (kind === 'big') { buzz([40, 30, 80]); shake(0.4); } else buzz(30);
        if (N && amt >= 10) N.send('win', { amt, what }); }
      SM.setCoins(Math.min(18, Math.ceil(amt / 4)));
      if (kind === 'big' || kind === 'jackpot') { musicBoost = kind === 'jackpot' ? 10 : 6; }
      say((kind === 'jackpot' ? 'Jackpot! ' : '') + 'You win ' + amt + ' gold. ' + r.wins.map(w => w.name.toLowerCase() + ' line, ' + w.syms.map(s => SYMBOLS[s].name.toLowerCase()).join(', ')).join('. '));
    } else say('No win. ' + r.cols.map(c => SYMBOLS[c[1]].name.toLowerCase()).join(', ') + '.');
    if (N) N.send('st', { won: st.session.won - st.session.spent, spins: st.session.spins });
    if (st.auto > 0) { st.auto--; if (kind === 'jackpot' || kind === 'big') st.auto = 0; else later(amt > 0 ? 1.7 : 0.75, () => { if (st.auto >= 0 && st.phase === 'play') spin(); }); }
    dirty = true;
  }
  let musicBoost = 0;
  // controls
  function setBet(b) { if (st.spinning) return; st.bet = clamp(b | 0, BET.min, BET.max); sfx('button'); SM.press('bet'); dirty = true; }
  function setLines(n) { if (st.spinning) return; st.lines = clamp(n | 0, 1, MAX_LINES); sfx('button'); SM.press('lines'); dirty = true; }
  function maxBet() { if (st.spinning) return; st.bet = BET.max; st.lines = MAX_LINES; SM.press('max'); sfx('button'); dirty = true; spin(); }
  function toggleAuto() { if (st.auto > 0) { st.auto = 0; sfx('button'); dirty = true; return; } st.auto = 9; sfx('button'); dirty = true; spin(); }

  // ---------------- camera ----------------
  const SAFE = { top: 0, bottom: 0, left: 0, right: 0 }; let view = 'menu', camShake = 0, shotKey = '', shot = null;
  function shake(a) { camShake = Math.max(camShake, a); }
  const fitCam = new THREE.PerspectiveCamera(40, 1, 0.05, 60), camPos = V3(0, 2, 4), camTgt = V3(0, 1.4, 0), wantPos = V3(), wantTgt = V3();
  function fitShot(pts, el, yaw = 0, margin = 0.04) {
    const W = CW(), H = CH(); fitCam.aspect = W / H; fitCam.fov = camera.fov; fitCam.updateProjectionMatrix();
    const xL = -1 + 2 * SAFE.left / W + margin, xR = 1 - 2 * SAFE.right / W - margin, yT = 1 - 2 * SAFE.top / H - margin, yB = -1 + 2 * SAFE.bottom / H + margin;
    yaw += stageYaw; const dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el)), tgt = V3(); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / pts.length);
    const _p = V3(), bounds = d => { fitCam.position.copy(tgt).addScaledVector(dir, d); fitCam.lookAt(tgt); fitCam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitCam); if (_p.z > 1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
    let d = 3;
    for (let it = 0; it < 4; it++) { let lo = 0.3, hi = 30; for (let k = 0; k < 26; k++) { const m = (lo + hi) / 2, b = bounds(m); if (b && b.x1 - b.x0 <= xR - xL && b.y1 - b.y0 <= yT - yB) hi = m; else lo = m; } d = hi;
      const b = bounds(d); if (!b) break; const ox = (b.x0 + b.x1) / 2 - (xL + xR) / 2, oy = (b.y0 + b.y1) / 2 - (yB + yT) / 2, hh = Math.tan(fitCam.fov * Math.PI / 360) * d, right = V3(1, 0, 0).applyQuaternion(fitCam.quaternion), up = V3(0, 1, 0).applyQuaternion(fitCam.quaternion);
      tgt.addScaledVector(right, ox * hh * fitCam.aspect).addScaledVector(up, oy * hh); }
    return { pos: tgt.clone().addScaledVector(dir, d), tgt };
  }
  const mpt = (x, y, z) => { SM.machine.updateMatrixWorld(true); return SM.machine.localToWorld(V3(x, y, z)); };
  function playPts(port) { return port ? [mpt(-0.36, 0.86, 0.3), mpt(0.36, 0.86, 0.3), mpt(-0.36, 2.0, 0.2), mpt(0.36, 2.0, 0.2)] : [mpt(-0.33, 1.07, 0.36), mpt(0.33, 1.07, 0.36), mpt(-0.33, 1.83, 0.29), mpt(0.33, 1.83, 0.29), mpt(0.42, 1.75, 0.05)]; }
  function menuPts() { return [mpt(-0.4, 0, 0.3), mpt(0.45, 0, 0.3), mpt(-0.4, 2.02, 0), mpt(0.45, 2.02, 0), V3(-1.55, 2.3, 0.7), V3(2.2, 2.3, -0.3), V3(-1.55, 0, 0.7), V3(2.2, 0, -0.3), V3(1.5, 0, 1.0)]; }
  function updateShot() { const W = CW(), H = CH(), port = H > W, key = view + W + 'x' + H + JSON.stringify(SAFE); if (key === shotKey && shot) return shot; shotKey = key;
    shot = view === 'play' ? fitShot(playPts(port), port ? 0.1 : 0.12, 0, 0.03) : fitShot(menuPts(), port ? 0.3 : 0.24, port ? 0 : -0.25, 0.04); return shot; }

  // ---------------- frame ----------------
  const easeOutBack = x => { const c1 = 1.25, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  function frame() {
    if (stopped) return; requestAnimationFrame(frame);
    const now = performance.now(), dt = Math.min(0.05, (now - lastT) / 1000); lastT = now; if (document.hidden) return;
    tNow += dt; for (let i = timers.length - 1; i >= 0; i--) if (timers[i].t <= tNow) { const t = timers.splice(i, 1)[0]; try { t.fn(); } catch (e) { console.warn(e); } }
    // reels
    reels.forEach((r, i) => {
      if (r.mode === 'spin') { r.v = Math.min(17, r.v + dt * 60); r.a += r.v * dt;
        if (tNow >= r.stopAt) { const base = stopAngle(st.stops[i]), TAU = Math.PI * 2; let to = base + Math.ceil((r.a + 2.2 - base) / TAU) * TAU; r.mode = 'stop'; r.from = r.a; r.to = to; r.t = 0; r.dur = 0.36 + (to - r.a) / 17 * 0.55; } }
      else if (r.mode === 'stop') { r.t += dt / r.dur; const k = Math.min(1, r.t); r.a = r.from + (r.to - r.from) * easeOutBack(k); if (k >= 1) { r.a = r.to; r.mode = 'idle'; r.v = 0; reelStopped(i); } }
      const step = Math.floor(r.a / (Math.PI * 2 / 22)); if (step !== r.lastTick) { r.lastTick = step; if (r.mode !== 'idle' && now - tickGate > 42) { tickGate = now; sfx('tick', (i - 1) * 0.5, i); } }
      r.g.rotation.x = r.a; });
    // lever
    if (leverT > 0) { leverT = Math.max(0, leverT - dt); const k = leverT > 0.45 ? (0.7 - leverT) / 0.25 : leverT / 0.45; SM.arm.rotation.x = -0.25 + 1.25 * smooth(0, 1, k); }
    // lights, lines, display
    if (st.winT > 0) st.winT = Math.max(0, st.winT - dt);
    const blink = Math.floor(tNow * 5) % 2 === 0; SM.showWins(st.winIds, st.winT > 0 && (blink || st.winT > 2.5));
    SM.setLines(st.phase === 'menu' ? 3 : st.lines);
    const winning = st.winT > 0 && st.win > 0, teasing = st.spinning && st.tease && reels[0].mode === 'idle' && reels[1].mode === 'idle' && reels[2].mode !== 'idle';
    const best = winning && st.result ? st.result.wins.slice().sort((a, b) => b.amt - a.amt)[0] : null;
    SM.chase(dt, winning ? (st.kind === 'jackpot' ? 'jackpot' : st.kind === 'big' ? 'big' : 'win') : teasing ? 'tease' : st.spinning ? 'spin' : 'idle', best ? SM.LCOL[best.line - 1] : null);
    SM.cellFx(winning ? st.winCells || [] : [], tNow, winning ? 'win' : teasing ? 'tease' : null, dt);
    if (winning && (st.kind === 'big' || st.kind === 'jackpot')) { st.burstT = (st.burstT || 0) - dt; if (st.burstT <= 0) { st.burstT = st.kind === 'jackpot' ? 0.3 : 0.6; const c = pick(st.winCells || []); if (c) { const p = SM.cellPos(c.reel, c.row); SM.burst(p.x, p.y, c.col, 6); } } }
    const why = st.phase === 'play' ? canSpin() : 'busy'; SM.button('spin', !why || (why === 'busy' && st.spinning && blink)); SM.button('bet', st.phase === 'play' && !st.spinning); SM.button('lines', st.phase === 'play' && !st.spinning); SM.button('max', st.phase === 'play' && !st.spinning && st.bet < BET.max);
    if (st.win > 0 && st.winShown < st.win) { const prev = Math.floor(st.winShown); st.winShown = Math.min(st.win, st.winShown + Math.max(st.win / 2.2, 12) * dt); if (Math.floor(st.winShown) !== prev && Math.floor(st.winShown) % Math.max(1, Math.floor(st.win / 30)) === 0) sfx('coin'); dirty = true; }
    st.creditShown = damp(st.creditShown, gold(), st.winShown < st.win ? 3 : 12, dt);
    SM.drawBanner({ creditLbl: st.demo ? 'DEMO' : 'CREDITS', credits: fmt(st.creditShown), bet: st.phase === 'play' ? st.bet + '×' + st.lines + '=' + totalBet() : '—', win: st.win > 0 && st.winT > 0 ? fmt(st.winShown) : (st.lastWin ? fmt(st.lastWin) : '0'), winHot: st.win > 0 && st.winT > 0, potLbl: N && net.st === 'room' ? 'ROOM POT' : 'JACKPOT', pot: fmt(pot()) });
    drawDMD(); { const k = 0.86 + 0.14 * Math.sin(tNow * 3.2); SM.dmdMat.color.setRGB(k, k, k); }
    if (st.msg) { st.msg.left -= dt; if (st.msg.left <= 0) { st.msg = null; dirty = true; } }
    if (!st.msg && st.msgQ.length) { const m = st.msgQ.shift(); st.msg = { ...m, left: m.dur }; dirty = true; }
    // music
    if (musicBoost > 0) musicBoost = Math.max(0, musicBoost - dt);
    if (snd.live && prefs.music) music.setMode(musicBoost > 0 ? (st.kind === 'jackpot' ? 'jackpot' : 'win') : 'lounge');
    // room + cast + neighbour
    if (room) room.tick(dt, now); if (pin) pin.update(dt);
    for (const [k, f] of Object.entries(foxes)) { f.visible = !(view === 'play' && k === 'ben'); if (f.visible) { if (st.winT > 0 && st.kind && st.kind !== 'small') { f.userData.mood = 'excited'; if (!f.userData.hop && Math.random() < dt * 2) f.userData.hop = 1; } try { kit.animFox(f, dt, 0); } catch (e) {} } }
    // camera
    const sh = updateShot(); if (sh) { wantPos.copy(sh.pos); wantTgt.copy(sh.tgt); }
    const k = 1 - Math.exp(-4.5 * dt); camPos.lerp(wantPos, k); camTgt.lerp(wantTgt, k); camera.position.copy(camPos); camera.lookAt(camTgt);
    if (camShake > 0) { camShake = Math.max(0, camShake - dt * 1.3); const a = camShake * camShake * 0.02; camera.position.x += Math.sin(now * 0.083) * a; camera.position.y += Math.cos(now * 0.071) * a * 0.7; }
    if (!WD) renderer.render(scene, camera);
    if (dirty && now - lastEmit > 80) { lastEmit = now; dirty = false; onState && onState(hud()); }
  }
  function drawDMD() {
    if (st.phase === 'menu') { const k = Math.floor(tNow / 2.6) % 3; SM.dmd.draw(k === 0 ? ['LUCKY GATES'] : k === 1 ? ['JACKPOT', fmt(pot())] : ['3 LINES', 'PAYS GOLD']); return; }
    if (st.spinning) { SM.dmd.draw(['GOOD LUCK', 'BET ' + totalBet()]); return; }
    if (st.win > 0 && st.winT > 0) { SM.dmd.draw([st.kind === 'jackpot' ? 'JACKPOT!' : st.kind === 'big' ? 'BIG WIN' : 'WIN', fmt(st.winShown)]); return; }
    SM.dmd.draw([(st.demo ? 'DEMO ' : 'GOLD ') + fmt(gold()), 'BET ' + st.bet + ' × ' + st.lines + ' = ' + totalBet()]);
  }

  // ---------------- online jackpot room ----------------
  let N = null, netTok = 0, nTimer = 0; const peers = new Map();
  const net = { st: null, code: '', status: '', j: 0, msg: '', pot: JACKPOT.base, ping: null };
  function members() { if (!N) return []; const all = [{ id: N.id, j: net.j, me: true, won: st.session.won - st.session.spent, spins: st.session.spins }, ...[...peers.entries()].map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, SLOTS.maxPlayers); }
  const nameOf = id => { const m = members(), i = m.findIndex(x => x.id === id); const C = NET_COLS[i] || NET_COLS[0]; return { name: id === (N && N.id) ? 'YOU' : C[0], col: C[1] }; };
  function netOpen() { snd.wake(); Object.assign(net, { st: 'menu', code: '', status: '', msg: '' }); dirty = true; }
  function netCreate() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 4; i++) c += A[Math.floor(Math.random() * A.length)]; return netJoin(c); }
  async function netJoin(code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { net.msg = 'Type the 4-letter room code from your friend.'; dirty = true; return; }
    netLeave(true); peers.clear(); Object.assign(net, { st: 'room', code, status: 'connecting', j: Date.now(), msg: '', pot: JACKPOT.base, ping: null }); st.feed = []; dirty = true;
    const tok = ++netTok;
    const conn = await connectNet({ game: 'slots', code, onJoin: id => hello(id), onLeave: id => gone(id), onMsg: (t, d, id) => nMsg(t, d, id), onStatus: s => { net.status = s; dirty = true; } });
    if (tok !== netTok) { conn.leave(); return; } N = conn; hello(); dirty = true;
    try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {}
    clearInterval(nTimer); nTimer = setInterval(nTick, 1000);
  }
  function netLeave(keep) { netTok++; clearInterval(nTimer); if (N) { try { N.send('ev', { k: 'bye' }); N.leave(); } catch (e) {} } N = null; peers.clear();
    if (!keep) { net.st = null; st.feed = []; try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {} } dirty = true; }
  function hello(to) { if (N) N.send('hi', { v: 1, j: net.j, pot: net.pot, won: st.session.won - st.session.spent, spins: st.session.spins }, to); }
  function feed(id, txt, big) { const n = nameOf(id); st.feed.unshift({ name: n.name, col: n.col, txt, big: !!big }); st.feed.length = Math.min(st.feed.length, 6); dirty = true; }
  function nMsg(t, d, id) {
    if (!N || !d) return; const known = peers.has(id), now = performance.now();
    if (t === 'hi') { const p = peers.get(id) || {}; peers.set(id, { ...p, j: +d.j || Date.now(), won: +d.won || 0, spins: +d.spins || 0, seen: now }); if (+d.pot > net.pot) net.pot = +d.pot; if (!known) { setTimeout(() => hello(id), 0); sfx('join'); feed(id, 'JOINED THE ROOM'); } dirty = true; return; }
    if (!known) return; const p = peers.get(id); p.seen = now;
    if (t === 'pg') { if (d.t != null) N.send('pg', { e: d.t }, id); else if (d.e != null) net.ping = Math.max(1, Math.round(now - d.e)); return; }
    if (t === 'bet') { net.pot += +d.add || 0; dirty = true; return; }
    if (t === 'st') { p.won = +d.won || 0; p.spins = +d.spins || 0; dirty = true; return; }
    if (t === 'win') { if (d.jp) { net.pot = JACKPOT.base; feed(id, 'HIT THE JACKPOT · +' + fmt(d.amt), true); sfx('big'); flash(nameOf(id).name + ' HIT THE JACKPOT', '+' + fmt(d.amt) + ' GOLD', '#ffd23a', 2.4); } else { feed(id, 'WON ' + fmt(d.amt) + ' · ' + String(d.what || '').slice(0, 24), d.amt >= 100); if (d.amt >= 100) sfx('small'); } return; }
    if (t === 'ev' && d.k === 'bye') gone(id);
  }
  function gone(id) { if (!peers.has(id)) return; feed(id, 'LEFT'); peers.delete(id); dirty = true; }
  function nTick() { if (!N) return; N.send('pg', { t: performance.now() }); const now = performance.now(); for (const [id, p] of peers) if (now - p.seen > 25000) gone(id); }

  // ---------------- flow ----------------
  let lock = null; async function wake(on) { try { if (on && !lock && navigator.wakeLock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } else if (!on && lock) { await lock.release(); lock = null; } } catch (e) { lock = null; } }
  function play() { snd.wake(); sfx('insert'); st.phase = 'play'; st.demo = false; view = 'play'; shotKey = ''; wake(true); dirty = true; if (lossLeft() <= 0) flash('DAILY LIMIT REACHED', 'COME BACK TOMORROW', '#ec3013', 3); }
  function demoStart() { snd.wake(); st.phase = 'play'; st.demo = true; st.demoCredits = 100; view = 'play'; shotKey = ''; dirty = true; st.auto = 999; later(0.4, spin); }
  function toMenu() { st.auto = 0; if (st.spinning) return; st.phase = 'menu'; st.demo = false; view = 'menu'; shotKey = ''; st.msgQ.length = 0; st.msg = null; wake(false); dirty = true; }
  function setPref(k, v) { prefs[k] = v; try { save.setStat(SAVE_KEYS.prefs, { ...prefs }); } catch (e) {} if (k === 'sound') snd.setSfx(v); if (k === 'music') music.setOn(v); if (v) { snd.wake(); sfx('button'); } dirty = true; }
  const onVis = () => { if (document.hidden) { st.auto = 0; music.setDuck(0); } else music.setDuck(1); };
  document.addEventListener('visibilitychange', onVis);
  const firstTap = () => { snd.wake(); }; addEventListener('pointerdown', firstTap, true);
  const KEY = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; snd.wake(); if (st.phase !== 'play') return; const c = e.code;
    if (c === 'Space' || c === 'Enter') { e.preventDefault(); if (!e.repeat) spin(); } else if (c === 'ArrowUp') { e.preventDefault(); setBet(st.bet + 1); } else if (c === 'ArrowDown') { e.preventDefault(); setBet(st.bet - 1); }
    else if (/^Digit[123]$/.test(c)) setLines(+c[5]); else if (c === 'KeyM') maxBet(); else if (c === 'KeyA') toggleAuto(); };
  if (!WD) addEventListener('keydown', KEY);   // world: the map forwards the keys

  function hud() {
    const m = net.st ? members() : [], r = st.result;
    return {
      phase: st.phase, demo: st.demo, spinning: st.spinning, touch, bet: st.bet, lines: st.lines, total: totalBet(), auto: st.auto > 0 && !st.demo, autoLeft: st.auto,
      gold: Math.round(st.creditShown), goldReal: gold(), win: Math.floor(st.winShown), winFull: st.win, kind: st.kind, winOn: st.winT > 0 && st.win > 0,
      pot: Math.floor(pot()), potRoom: !!(N && net.st === 'room'), can: st.phase === 'play' ? canSpin() : 'busy', lossLeft: lossLeft(), limit: DAILY_LOSS_LIMIT,
      rows: r ? [0, 1, 2].map(row => r.cols.map(c => SYMBOLS[c[row]].short).join(' · ')) : null, wins: r ? r.wins.map(w => ({ line: w.line, name: w.name, amt: w.amt, what: w.n === 3 ? SYMBOLS[w.kind].name + ' × 3' : w.n === 2 ? 'TWO MOONS' : 'FULL MOON' })) : [],
      msg: st.msg ? { t: st.msg.t, sub: st.msg.sub, col: st.msg.col } : null, prefs: { ...prefs },
      stats: (() => { try { return { spins: save.stat(SAVE_KEYS.spins), won: save.stat(SAVE_KEYS.won), bigWin: save.stat(SAVE_KEYS.bigWin), jackpots: save.stat(SAVE_KEYS.jackpots) }; } catch (e) { return {}; } })(), session: { ...st.session },
      net: !net.st ? null : { st: net.st, code: net.code, status: net.status, msg: net.msg, ping: net.ping, full: !!N && m.length >= SLOTS.maxPlayers && !m.some(x => x.me),
        members: m.map((x, i) => ({ name: x.me ? 'YOU' : (NET_COLS[i] || NET_COLS[0])[0], col: (NET_COLS[i] || NET_COLS[0])[1], me: x.me, won: x.won || 0, spins: x.spins || 0 })), feed: st.feed.slice() },
    };
  }
  function setSafe(top, bottom, left = 0, right = 0) { if (SAFE.top === top && SAFE.bottom === bottom && SAFE.left === left && SAFE.right === right) return; Object.assign(SAFE, { top, bottom, left, right }); shotKey = ''; }
  const ro = new ResizeObserver(() => { if (!WD) renderer.setSize(CW(), CH()); camera.aspect = CW() / CH(); camera.updateProjectionMatrix(); shotKey = ''; dirty = true; }); ro.observe(WD ? document.documentElement : container);
  { const s0 = updateShot(); if (s0) { camPos.copy(s0.pos); camTgt.copy(s0.tgt); wantPos.copy(s0.pos); wantTgt.copy(s0.tgt); } }
  st.creditShown = gold(); requestAnimationFrame(frame); setTimeout(() => onState && onState(hud()), 0);

  // test hook: spin n times instantly (maths + gold + limits, no animation)
  function simulate(n) { const out = { spins: 0, spent: 0, won: 0, blocked: '' }; for (let i = 0; i < n; i++) { const why = canSpin(); if (why) { out.blocked = why; break; } const total = totalBet(); if (st.demo) st.demoCredits -= total; else { save.spend(total); dayAdd(-total); } potAdd(total * JACKPOT.share); st.stops = [randStop(), randStop(), randStop()]; out.spins++; out.spent += total; const r = evaluate(st.stops, st.lines, st.bet); let amt = r.total + (r.jackpot ? Math.floor(pot()) : 0); if (r.jackpot) potReset(); if (amt) { if (st.demo) st.demoCredits += amt; else { save.addGold(amt); dayAdd(amt); } out.won += amt; } } reels.forEach((r, i) => { r.a = stopAngle(st.stops[i]); }); return out; }

  return {
    keyDown: e => KEY(e), snapCam() { const s0 = updateShot(); if (s0) { camPos.copy(s0.pos); camTgt.copy(s0.tgt); wantPos.copy(s0.pos); wantTgt.copy(s0.tgt); camera.position.copy(camPos); camera.lookAt(camTgt); } },
    hud, setSafe, play, demoStart, toMenu, spin, setBet, setLines, maxBet, toggleAuto, setPref, simulate,
    netOpen, netCreate, netJoin, netLeave: () => netLeave(false), netBack: () => { if (net.st === 'menu') { net.st = null; dirty = true; } else netLeave(false); },
    wake: () => snd.wake(), state: st, scene, camera, renderer, machine: SM, music, snd,
    destroy() { stopped = true; ro.disconnect(); netLeave(false); wake(false); music.stop(); snd.stopAll(); removeEventListener('keydown', KEY); removeEventListener('pointerdown', firstTap, true); document.removeEventListener('visibilitychange', onVis); if (WD) { STAGE.parent && STAGE.parent.remove(STAGE); } else { renderer.dispose(); renderer.domElement.remove(); } },
  };
}
