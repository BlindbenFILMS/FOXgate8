// 8 GATES — MERU CASINO · ROULETTE IN WORLD (s101, Ben: "the next casino game made like this"). Plays on the casino's own roulette table:
// the felt layout painted on the table IS the betting board (tap it), the casino's rotor spins for real and a ball runs the track and drops into a pocket.
// American wheel (0 + 00). Bets: any number (35:1), dozens (2:1), RED/BLACK · ODD/EVEN · 1-18/19-36 (1:1); 0 / 00 lose the outside bets. Shared gold (save).
// createRoulette({ THREE, group, rotor, order, camera, save, isMuted, touch, onState }) → { camera, update(dt), tap(x, y, cam), bet(key), chip(v), spin(), clear(), rebet(), hud(), destroy() }
export const ROUL = { key: 'meruRoulette', chips: [1, 5, 10, 25], maxTable: 200 };
const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
export const lab = n => n === 37 ? '00' : String(n);
export const colOf = n => n === 0 || n === 37 ? 'GREEN' : REDS.has(n) ? 'RED' : 'BLACK';
const OUT = ['low', 'even', 'red', 'black', 'odd', 'high'], OUTN = { low: '1-18', even: 'EVEN', red: 'RED', black: 'BLACK', odd: 'ODD', high: '19-36', d1: '1st 12', d2: '2nd 12', d3: '3rd 12' };
export function betName(k) { return k.startsWith('n:') ? lab(+k.slice(2)) : OUTN[k] || k; }
export function pays(k, n) { const g = n === 0 || n === 37;   // → multiple of the stake won (0 = lost)
  if (k.startsWith('n:')) return +k.slice(2) === n ? 35 : 0; if (g) return 0;
  if (k[0] === 'd') return Math.ceil(n / 12) === +k[1] ? 2 : 0;
  return { low: n <= 18, high: n >= 19, even: n % 2 === 0, odd: n % 2 === 1, red: REDS.has(n), black: !REDS.has(n) }[k] ? 1 : 0; }
// the casino's felt texture (worlds/meru2-casino.js `lay`, 512 × 192 px) on a 3.0 × 1.35 m plane at (0.75, 0.905, 0.05), canvas top = far side (−z)
const LW = 512, LH = 192, CWD = (LW - 70) / 12, CHT = 36, FX = 0.75, FY = 0.907, FZ = 0.05, FW = 3.0, FD = 1.35;
const px2l = (px, py) => [FX + (px / LW - 0.5) * FW, FZ + (py / LH - 0.5) * FD];
function betAt(px, py) { if (px >= 6 && px < 46 && py >= 6 && py < 6 + CHT * 3) return 'n:' + (py < 6 + CHT * 1.5 ? 0 : 37);
  if (px < 50 || px >= 50 + CWD * 12) return null; const c = Math.floor((px - 50) / CWD);
  if (py >= 6 && py < 6 + CHT * 3) { const r = Math.floor((py - 6) / CHT); return 'n:' + (c * 3 + (3 - r)); }
  if (py >= 6 + CHT * 3 && py < 36 + CHT * 3) return 'd' + (Math.floor(c / 4) + 1);
  if (py >= 36 + CHT * 3 && py < 66 + CHT * 3) return OUT[Math.floor(c / 2)]; return null; }
function betSpot(k) { let px, py; if (k.startsWith('n:')) { const n = +k.slice(2); if (n === 0 || n === 37) { px = 26; py = 6 + CHT * (n ? 2.25 : 0.75); } else { const c = Math.floor((n - 1) / 3), r = 3 - (n - c * 3); px = 50 + (c + 0.5) * CWD; py = 6 + (r + 0.5) * CHT; } }
  else if (k[0] === 'd') { px = 50 + ((+k[1] - 1) * 4 + 2) * CWD; py = 21 + CHT * 3; } else { px = 50 + (OUT.indexOf(k) * 2 + 1) * CWD; py = 51 + CHT * 3; } return px2l(px, py); }
const CHIPC = { 1: '#f3f2f2', 5: '#ec3013', 10: '#2e6bd8', 25: '#22a35a' };

export function createRoulette({ THREE, group, rotor, order, camera: worldCam, save = null, isMuted = () => false, touch = false, onState = () => {} }) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), N = order.length, now = () => performance.now() / 1000;
  group.updateWorldMatrix(true, true); const L2W = (x, y, z) => group.localToWorld(V(x, y, z)), gq = new THREE.Quaternion(); group.getWorldQuaternion(gq);
  const G = new THREE.Group(); G.name = 'rouletteWorld'; group.add(G);
  const RC = rotor.position.clone(), R0 = rotor.rotation.y; rotor.userData.held = true;   // the casino's idle spin stops while you play
  // ---------- ball + chips ----------
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 10), new THREE.MeshPhongMaterial({ color: '#ffffff', shininess: 120 })); ball.visible = false; G.add(ball);
  const chipGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.014, 18), chipMats = {}; for (const [v, c] of Object.entries(CHIPC)) chipMats[v] = new THREE.MeshLambertMaterial({ color: c });
  const edgeMat = new THREE.MeshBasicMaterial({ color: '#201e1d' }), edgeGeo = new THREE.CylinderGeometry(0.047, 0.047, 0.008, 18);
  const stacks = new Map();   // bet key → Group of chip meshes
  function drawStack(k) { let s = stacks.get(k); const amt = bets[k] || 0; if (!amt) { if (s) { G.remove(s); stacks.delete(k); } return; }
    if (!s) { s = new THREE.Group(); G.add(s); stacks.set(k, s); const [x, z] = betSpot(k); s.position.set(x, FY, z); } while (s.children.length) s.remove(s.children[0]);
    let left = amt, h = 0; for (const v of [25, 10, 5, 1]) while (left >= v && h < 12) { left -= v; const m = new THREE.Mesh(chipGeo, chipMats[v]); m.position.y = 0.007 + h * 0.015; const e = new THREE.Mesh(edgeGeo, edgeMat); e.position.y = m.position.y; s.add(e, m); h++; } }
  const hiMat = new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const hi = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), hiMat); hi.position.y = FY + 0.003; G.add(hi);
  // ---------- sound ----------
  let ac = null; const A = () => { if (isMuted()) return null; try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; } return ac; };
  const blip = (f, d, type = 'square', v = 0.05) => { const c = A(); if (!c) return; const o = c.createOscillator(), g = c.createGain(), t = c.currentTime; o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.02); };
  const clack = () => { blip(1800, 0.03, 'square', 0.03); blip(900, 0.05, 'triangle', 0.04); };
  // ---------- state ----------
  let chip = 5, bets = {}, last = {}, phase = 'bet', hist = [], res = null, msg = null, dirty = true, lastEmit = 0;
  const spin0 = { t0: 0, dur: 6.2, n: 0, a0: 0, rotV: 0, ballA0: 0, ballW: 0, drop: 0, tick: 0, ra: R0 };
  const gold = () => { try { return save ? save.data.gold : 0; } catch (e) { return 0; } }, down = () => Object.values(bets).reduce((a, b) => a + b, 0);
  const say = (t, sub = '', col = '#ffd23a', d = 2.4) => { msg = { t, sub, col, until: now() + d }; dirty = true; };
  function bet(k) { if (phase !== 'bet' || !k) return; if (down() + chip > ROUL.maxTable) { say('TABLE LIMIT ' + ROUL.maxTable, '', '#ec3013', 1.6); return; } if (down() + chip > gold()) { say('NOT ENOUGH GOLD', 'LOWER YOUR CHIP', '#ec3013', 1.6); return; }
    bets[k] = (bets[k] || 0) + chip; drawStack(k); clack(); flashAt(k); dirty = true; }
  function flashAt(k) { const [x, z] = betSpot(k), big = !k.startsWith('n:'); hi.position.x = x; hi.position.z = z; hi.scale.set(big ? CWD * (k[0] === 'd' ? 4 : 2) / LW * FW : CWD / LW * FW, 1, (k === 'n:0' || k === 'n:37' ? CHT * 1.5 : big ? 30 : CHT) / LH * FD); hiT = now(); }
  let hiT = -9;
  function clear() { if (phase !== 'bet') return; for (const k of Object.keys(bets)) { delete bets[k]; drawStack(k); } dirty = true; }
  function rebet() { if (phase !== 'bet') return; clear(); const tot = Object.values(last).reduce((a, b) => a + b, 0); if (!tot) return; if (tot > gold()) { say('NOT ENOUGH GOLD', '', '#ec3013', 1.6); return; } bets = { ...last }; for (const k of Object.keys(bets)) drawStack(k); clack(); dirty = true; }
  function spin() { if (phase !== 'bet') return; const tot = down(); if (!tot) { say('PLACE A BET FIRST', touch ? 'TAP THE FELT' : 'CLICK THE FELT', '#ffd23a', 1.6); return; }
    if (!save || !save.spend(tot)) { say('NOT ENOUGH GOLD', '', '#ec3013', 1.6); return; } last = { ...bets }; A();
    const n = order[Math.floor(Math.random() * N)]; Object.assign(spin0, { t0: now(), n, ra: rotor.rotation.y, rotV: 2.4 + Math.random() * 0.6, ballA0: Math.random() * Math.PI * 2, ballW: -(11 + Math.random() * 2), tick: 0 });
    phase = 'spin'; res = null; ball.visible = true; blip(220, 0.5, 'sawtooth', 0.025); dirty = true; }
  // ---------- the wheel ----------
  const pocketA = n => { const i = order.indexOf(n); return (i + 0.5) / N * Math.PI * 2; };   // canvas angle on the rotor face (x → +x, y → +z)
  function rotorLocal(r, a, y) { const p = V(Math.cos(a) * r, y, Math.sin(a) * r); p.applyAxisAngle(V(0, 1, 0), rotor.rotation.y); return p.add(RC); }
  function settle() { const n = spin0.n, won = Object.entries(last).reduce((a, [k, v]) => a + (pays(k, n) ? v * (pays(k, n) + 1) : 0), 0), staked = Object.values(last).reduce((a, b) => a + b, 0);
    if (won > 0 && save) save.addGold(won); hist.unshift(n); hist.length = Math.min(hist.length, 8); res = { n, won, net: won - staked, col: colOf(n) };
    for (const k of Object.keys(bets)) { if (!pays(k, n)) { delete bets[k]; drawStack(k); } }   // losing chips are swept, winners stay a moment
    say(lab(n) + ' ' + colOf(n), won > 0 ? 'YOU WIN ' + won + ' GOLD' : 'NO WIN THIS TIME', won > 0 ? '#ffd23a' : '#f3f2f2', 3.2);
    if (won > 0) { blip(660, 0.15, 'triangle', 0.07); setTimeout(() => blip(880, 0.15, 'triangle', 0.07), 120); setTimeout(() => blip(1320, 0.3, 'triangle', 0.07), 240); } else blip(180, 0.3, 'sawtooth', 0.03);
    const [hx, hz] = betSpot('n:' + n); hi.position.x = hx; hi.position.z = hz; hi.scale.set(CWD / LW * FW, 1, (n === 0 || n === 37 ? CHT * 1.5 : CHT) / LH * FD); hiT = now() + 1.6;
    phase = 'result'; setTimeout(() => { for (const k of Object.keys(bets)) { delete bets[k]; drawStack(k); } phase = 'bet'; ball.visible = false; dirty = true; }, 3200); dirty = true; }
  // ---------- camera: the felt + the wheel, from the player's side; closer on the wheel while it spins ----------
  const cam = new THREE.PerspectiveCamera(worldCam.fov || 50, 1, 0.05, 200), tcam = cam.clone(), pv = V(); let shotKey = '', shotA = null, shotB = null;
  function fit(pts, pitch, yMin) { const Wd = innerWidth || 1, Hd = innerHeight || 1; tcam.fov = worldCam.fov || 50; tcam.aspect = Wd / Hd; tcam.updateProjectionMatrix();
    const C = V(); pts.forEach(p => C.add(p)); C.multiplyScalar(1 / pts.length); const dir = V(0, -Math.sin(pitch), -Math.cos(pitch)).applyQuaternion(gq).normalize(); let lo = 0.6, hi2 = 12;
    for (let i = 0; i < 18; i++) { const D = (lo + hi2) / 2; tcam.position.copy(C).addScaledVector(dir, -D); tcam.lookAt(C); tcam.updateMatrixWorld(); let ok = true;
      for (const p of pts) { pv.copy(p).project(tcam); if (pv.z > 1 || Math.abs(pv.x) > 0.94 || pv.y > 0.86 - (Hd > Wd ? 0.1 : 0) || pv.y < yMin) { ok = false; break; } } if (ok) hi2 = D; else lo = D; }
    tcam.position.copy(C).addScaledVector(dir, -hi2); tcam.lookAt(C); return { p: tcam.position.clone(), q: tcam.quaternion.clone() }; }
  function shots() { const Wd = innerWidth, Hd = innerHeight, key = Wd + 'x' + Hd; if (key === shotKey) return; shotKey = key; const port = Hd > Wd, btm = touch ? (port ? 230 : 120) : 90, yMin = -1 + 2 * btm / Hd;
    const felt = [L2W(FX - FW / 2, FY, FZ - FD / 2), L2W(FX + FW / 2, FY, FZ - FD / 2), L2W(FX - FW / 2, FY, FZ + FD / 2), L2W(FX + FW / 2, FY, FZ + FD / 2)], wh = [-1, 1].flatMap(s => [L2W(RC.x + s * 0.72, RC.y, RC.z), L2W(RC.x, RC.y, RC.z + s * 0.72)]);
    shotA = fit([...felt, ...wh], port ? 1.05 : 0.95, yMin); shotB = fit(wh, 1.15, yMin); }
  shots(); cam.position.copy(shotA.p); cam.quaternion.copy(shotA.q);
  // ---------- tap the felt ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(), hit = V(), inv = new THREE.Matrix4();
  function tap(cx, cy, viewCam) { if (phase !== 'bet') return false; ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, viewCam || cam);
    inv.copy(group.matrixWorld).invert(); const o = ray.ray.origin.clone().applyMatrix4(inv), d = ray.ray.direction.clone().transformDirection(inv); if (Math.abs(d.y) < 1e-4) return false; const t = (FY - o.y) / d.y; if (t < 0) return false;
    const x = o.x + d.x * t, z = o.z + d.z * t, px = ((x - FX) / FW + 0.5) * LW, py = ((z - FZ) / FD + 0.5) * LH; const k = betAt(px, py); if (!k) return false; bet(k); return true; }
  // ---------- loop ----------
  function update(dt) { shots(); const t = now();
    if (phase === 'spin') { const s = spin0, e = t - s.t0, D = s.dur;
      rotor.rotation.y = s.ra + s.rotV * (e - e * e / (2 * D * 1.6));   // the rotor slows gently
      const T = D - 1.1, tl = Math.min(1, e / T), a = s.ballA0 + s.ballW * (e - e * e / (2 * T * 1.25));   // the ball runs the track the other way, slowing
      if (e < T) { const r = 0.6 - 0.05 * tl * tl; ball.position.set(RC.x + Math.cos(a) * r, RC.y + 0.06, RC.z + Math.sin(a) * r);
        const ti = Math.floor(a / (Math.PI * 2 / N)); if (ti !== s.tick && e > D * 0.45) { s.tick = ti; blip(2400 + Math.random() * 400, 0.012, 'square', 0.02); } s.lastA = a; s.lastR = r; }
      else { const u = Math.min(1, (e - (D - 1.1)) / 1.1), k = u * u * (3 - 2 * u), tgt = rotorLocal(0.43, pocketA(s.n), 0.035); if (!s.fromP) s.fromP = ball.position.clone();
        ball.position.lerpVectors(s.fromP, tgt, k); ball.position.y += Math.abs(Math.sin(u * Math.PI * 3)) * 0.05 * (1 - u); if (u > 0.3 && !s.clk) { s.clk = 1; blip(1600, 0.03, 'square', 0.04); } if (u > 0.6 && s.clk === 1) { s.clk = 2; blip(1300, 0.03, 'square', 0.03); }
        if (u >= 1) { s.fromP = null; s.clk = 0; settle(); } } }
    else if (phase === 'result') { rotor.rotation.y += dt * 0.25; ball.position.copy(rotorLocal(0.43, pocketA(spin0.n), 0.035)); }
    else rotor.rotation.y += dt * 0.12;
    const ha = t - hiT; hiMat.opacity = ha < 0.35 ? 0.5 * (1 - ha / 0.35) : (phase === 'result' && ha < 0 ? 0.35 + Math.sin(t * 8) * 0.2 : 0);
    const want = phase === 'spin' ? shotB : shotA, k = 1 - Math.exp(-3 * dt); cam.position.lerp(want.p, k); cam.quaternion.slerp(want.q, k); cam.fov = worldCam.fov || 50; cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    if (msg && t > msg.until) { msg = null; dirty = true; }
    const n2 = performance.now(); if (dirty || n2 - lastEmit > 250) { dirty = false; lastEmit = n2; onState(hud()); } }
  function hud() { return { phase, chip, chips: ROUL.chips, gold: gold(), down: down(), bets: Object.entries(bets).map(([k, v]) => ({ k, name: betName(k), v })), hist: hist.map(n => ({ n: lab(n), col: colOf(n) })), res, msg: msg ? { t: msg.t, sub: msg.sub, col: msg.col } : null, canSpin: phase === 'bet' && down() > 0, canRebet: phase === 'bet' && Object.keys(last).length > 0 }; }
  return { camera: cam, update, tap, bet, chip(v) { if (ROUL.chips.includes(v)) { chip = v; dirty = true; } }, spin, clear, rebet, hud, busy: () => phase === 'spin',
    destroy() { group.remove(G); rotor.userData.held = false; chipGeo.dispose(); edgeGeo.dispose(); try { ac && ac.close(); } catch (e) {} } };
}
