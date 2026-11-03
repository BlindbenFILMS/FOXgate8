// 8 GATES — MERU CASINO · CRAPS IN WORLD (s101, Ben: "next game please"). Plays on the casino's own craps table: the felt painted on the table is the board
// (tap it), two real dice fly down the table, bounce off the far rail and settle on the roll. Shared gold (save). The old 2D minigames/earth/craps.html stays the fallback.
// Bets: PASS LINE + DON'T PASS (line bets, stay up until they win or lose), FIELD (one roll: 3 4 9 10 11 pay 1:1, 2 and 12 pay 2:1), ANY 7 (4:1), ANY CRAPS (7:1),
// PLACE 4 5 6 8 9 10 (9:5 · 7:5 · 7:6, lose on a 7). Come-out: 7/11 PASS wins, 2/3/12 PASS loses (12 pushes DON'T PASS); otherwise that number is the POINT.
// createCraps({ THREE, group, camera, save, isMuted, touch, onState }) → { camera, update(dt), tap(x, y, cam), bet(key), chip(v), roll(), clear(), hud(), busy(), destroy() }
export const CRAPS = { key: 'meruCraps', chips: [1, 5, 10, 25], maxTable: 200 };
const PLACE = [4, 5, 6, 8, 9, 10], PLACE_PAY = { 4: [9, 5], 10: [9, 5], 5: [7, 5], 9: [7, 5], 6: [7, 6], 8: [7, 6] };
export const BETN = { pass: 'PASS LINE', dont: "DON'T PASS", field: 'FIELD', any7: 'ANY 7', craps: 'ANY CRAPS', p4: 'PLACE 4', p5: 'PLACE 5', p6: 'PLACE 6', p8: 'PLACE 8', p9: 'PLACE 9', p10: 'PLACE 10' };
// the casino felt (worlds/meru2-casino.js `felt`, 512 × 256) on a 4.3 × 2.2 m plane at y 0.96, turned round: canvas x+ = local −x, canvas top = local +z
const W = 512, H = 256, FW = 4.3, FD = 2.2, FY = 0.962;
// s101 (Ben: "the zoom in is way off"): the game now faces the PLAYER'S side (+z, where you walk up), so the camera no longer flies across the table: our felt reads from there
const c2l = (px, py) => [(px / W - 0.5) * FW, (py / H - 0.5) * FD], l2c = (x, z) => [(x / FW + 0.5) * W, (z / FD + 0.5) * H];
function betAt(px, py) { if (px < 24 || px > W - 24) return null;
  if (py >= 24 && py < 84) return 'p' + PLACE[Math.min(5, Math.floor((px - 24) / ((W - 48) / 6)))];
  if (py >= 90 && py < 160) return px < 280 ? null : px < 384 ? 'any7' : 'craps';
  if (py >= H - 92 && py < H - 58) return px < 200 ? 'dont' : 'field'; if (py >= H - 52 && py < H - 22) return 'pass'; return null; }
const SPOT = { pass: [W / 2 + 90, H - 37], dont: [120, H - 75], field: [380, H - 75], any7: [332, 140], craps: [436, 140] };
PLACE.forEach((n, i) => { SPOT['p' + n] = [24 + (i + 0.5) * ((W - 48) / 6), 70]; });
const CHIPC = { 1: '#f3f2f2', 5: '#ec3013', 10: '#2e6bd8', 25: '#22a35a' };
const FACES = [3, 4, 1, 6, 2, 5], NRM = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];   // BoxGeometry material order +x −x +y −y +z −z
function dieFace(n) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 30, 64, 64, 92); gr.addColorStop(0, '#fffdf6'); gr.addColorStop(1, '#d9d1bf'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#b8af9b'; g.lineWidth = 5; g.strokeRect(2.5, 2.5, 123, 123);
  const P = { 1: [[64, 64]], 2: [[34, 34], [94, 94]], 3: [[30, 30], [64, 64], [98, 98]], 4: [[34, 34], [94, 34], [34, 94], [94, 94]], 5: [[30, 30], [98, 30], [64, 64], [30, 98], [98, 98]], 6: [[34, 28], [94, 28], [34, 64], [94, 64], [34, 100], [94, 100]] }[n];
  g.fillStyle = n === 1 ? '#ec3013' : '#201e1d'; for (const [x, y] of P) { g.beginPath(); g.arc(x, y, n === 1 ? 16 : 11, 0, 7); g.fill(); } return c; }

// s101 (Ben: "improve the graphics of the table"): a new high-res felt laid over the casino's, same board coordinates (so taps + chips line up)
function paintFelt() { const K = 4, c = document.createElement('canvas'); c.width = W * K; c.height = H * K; const g = c.getContext('2d'); g.scale(K, K);
  const gr = g.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * 0.6); gr.addColorStop(0, '#178256'); gr.addColorStop(1, '#0b4a32'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)'; g.fillRect(Math.random() * W, Math.random() * H, 0.6, 0.6 + Math.random()); }
  const GOLD = '#e6b45a', INK = '#f3f2f2', F = s => '900 ' + s + 'px Archivo, sans-serif';
  const box = (x, y, w, h, col = INK, lw = 2) => { g.strokeStyle = col; g.lineWidth = lw; g.strokeRect(x, y, w, h); };
  g.strokeStyle = GOLD; g.lineWidth = 3; g.strokeRect(8, 8, W - 16, H - 16); g.lineWidth = 1; g.strokeRect(13, 13, W - 26, H - 26);
  g.textBaseline = 'middle'; g.textAlign = 'center';
  ['4', '5', 'SIX', '8', 'NINE', '10'].forEach((t, i) => { const bw = (W - 48) / 6, x = 24 + i * bw; box(x, 24, bw, 60); g.fillStyle = t === 'SIX' || t === 'NINE' ? GOLD : INK; g.font = F(t.length > 2 ? 18 : 30); g.fillText(t, x + bw / 2, 52); g.fillStyle = 'rgba(243,242,242,0.7)'; g.font = F(7); g.fillText(['9 TO 5', '7 TO 5', '7 TO 6', '7 TO 6', '7 TO 5', '9 TO 5'][i], x + bw / 2, 76); });
  box(24, 90, 256, 70); g.fillStyle = '#ec3013'; g.font = 'italic ' + F(38); g.fillText('COME', 152, 118); g.fillStyle = GOLD; g.font = F(8); g.fillText('MERU CASINO \u00b7 SINCE THE FIRST GATE', 152, 146);
  g.fillStyle = 'rgba(236,48,19,0.22)'; g.fillRect(280, 90, 104, 70); box(280, 90, 104, 70); g.fillStyle = INK; g.font = F(20); g.fillText('ANY 7', 332, 118); g.font = F(8); g.fillText('4 TO 1', 332, 140);
  box(384, 90, 104, 70); g.fillStyle = INK; g.font = F(15); g.fillText('ANY CRAPS', 436, 116); g.font = F(8); g.fillText('2 \u00b7 3 \u00b7 12 \u00b7 7 TO 1', 436, 138);
  box(24, H - 92, 176, 34); g.fillStyle = INK; g.font = F(13); g.fillText("DON'T PASS BAR", 112, H - 80); g.font = F(8); g.fillText('12 PUSHES', 112, H - 66);
  box(200, H - 92, 288, 34); g.font = F(13); g.fillStyle = INK; g.fillText('FIELD', 236, H - 75); ['2', '3', '4', '9', '10', '11', '12'].forEach((n, i) => { const x = 280 + i * 30, dbl = n === '2' || n === '12'; if (dbl) { g.strokeStyle = GOLD; g.lineWidth = 1.5; g.beginPath(); g.arc(x, H - 75, 10, 0, 7); g.stroke(); } g.fillStyle = dbl ? GOLD : INK; g.font = F(13); g.fillText(n, x, H - 75); });
  g.fillStyle = 'rgba(230,180,90,0.16)'; g.fillRect(24, H - 52, W - 48, 30); box(24, H - 52, W - 48, 30, GOLD, 2.5); g.fillStyle = INK; g.font = F(22); g.fillText('PASS LINE', W / 2, H - 36);
  return c; }

export function createCraps({ THREE, group, camera: worldCam, save = null, isMuted = () => false, touch = false, onState = () => {} }) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), now = () => performance.now() / 1000;
  group.updateWorldMatrix(true, true); const L2W = (x, y, z) => group.localToWorld(V(x, y, z)), gq = new THREE.Quaternion(); group.getWorldQuaternion(gq);
  const G = new THREE.Group(); G.name = 'crapsWorld'; group.add(G);
  const feltTex = new THREE.CanvasTexture(paintFelt()); feltTex.colorSpace = THREE.SRGBColorSpace; feltTex.anisotropy = 8;
  const felt = new THREE.Mesh(new THREE.PlaneGeometry(FW, FD), new THREE.MeshLambertMaterial({ map: feltTex })); felt.rotation.set(-Math.PI / 2, 0, 0); felt.position.y = FY - 0.0005; G.add(felt);
  const pool = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), r = x.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, 'rgba(255,226,170,0.35)'); r.addColorStop(1, 'rgba(255,226,170,0)'); x.fillStyle = r; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return new THREE.Mesh(new THREE.PlaneGeometry(FW * 0.95, FD * 1.1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); })(); pool.position.y = FY + 0.001; G.add(pool);   // the lamp's warm pool on the felt
  // ---------- dice ----------
  const S = 0.17, dieGeo = new THREE.BoxGeometry(S, S, S), dieMats = FACES.map(n => { const t = new THREE.CanvasTexture(dieFace(n)); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshLambertMaterial({ map: t }); });
  const dice = [0, 1].map(i => { const m = new THREE.Mesh(dieGeo, dieMats); m.position.set(0.3 + i * 0.3, FY + S / 2, -0.3 + i * 0.2); G.add(m); return { m, v: V(), w: V(), rest: true, want: 1 }; });
  const shadowM = new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.25, depthWrite: false });
  const shadows = dice.map(() => { const s = new THREE.Mesh(new THREE.CircleGeometry(S * 0.75, 16).rotateX(-Math.PI / 2), shadowM); s.position.y = FY + 0.002; G.add(s); return s; });
  // ---------- chips + highlight + puck ----------
  const chipGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.016, 18), edgeGeo = new THREE.CylinderGeometry(0.062, 0.062, 0.008, 18), edgeMat = new THREE.MeshBasicMaterial({ color: '#201e1d' }), chipMats = {};
  for (const [v, c] of Object.entries(CHIPC)) chipMats[v] = new THREE.MeshLambertMaterial({ color: c });
  const stacks = new Map();
  function drawStack(k) { let s = stacks.get(k); const amt = bets[k] || 0; if (!amt) { if (s) { G.remove(s); stacks.delete(k); } return; }
    if (!s) { s = new THREE.Group(); G.add(s); stacks.set(k, s); const [x, z] = c2l(...SPOT[k]); s.position.set(x, FY, z); } while (s.children.length) s.remove(s.children[0]);
    let left = amt, h = 0; for (const v of [25, 10, 5, 1]) while (left >= v && h < 12) { left -= v; const m = new THREE.Mesh(chipGeo, chipMats[v]); m.position.y = 0.008 + h * 0.017; const e = new THREE.Mesh(edgeGeo, edgeMat); e.position.y = m.position.y; s.add(e, m); h++; } }
  const puckT = on => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = on ? '#f3f2f2' : '#201e1d'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = on ? '#201e1d' : '#f3f2f2'; g.font = '900 46px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(on ? 'ON' : 'OFF', 64, 68); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const puckOn = puckT(true), puckOff = puckT(false), puck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 24), [edgeMat, new THREE.MeshBasicMaterial({ map: puckOff }), edgeMat]); G.add(puck);
  const placePuck = () => { const [x, z] = point ? c2l(SPOT['p' + point][0], 40) : c2l(40, 40); puck.position.set(x, FY + 0.012, z); puck.material[1].map = point ? puckOn : puckOff; puck.material[1].needsUpdate = true; };
  // s101 (Ben: "I got stuck on the first roll"): until a chip is down, a bobbing CHOOSE ONE arrow floats over the betting rows (no area highlighted)
  const cue = (() => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const g = cv.getContext('2d'); g.fillStyle = '#ec3013'; g.fillRect(56, 0, 400, 112); g.strokeStyle = '#201e1d'; g.lineWidth = 8; g.strokeRect(56, 0, 400, 112);
    g.fillStyle = '#fff'; g.font = '900 72px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('CHOOSE ONE', 84, 60); g.fillStyle = '#ec3013'; g.beginPath(); g.moveTo(196, 112); g.lineTo(316, 112); g.lineTo(256, 236); g.closePath(); g.fill(); g.stroke();
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(0.9, 0.45, 1); s.renderOrder = 10; return s; })();
  { const [x, z] = c2l(W / 2, H - 60); cue.position.set(x, FY + 0.55, z); } G.add(cue); let everBet = false;
  const hiMat = new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const hi = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), hiMat); hi.position.y = FY + 0.003; G.add(hi); let hiT = -9;
  // ---------- sound ----------
  let ac = null; const A = () => { if (isMuted()) return null; try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; } return ac; };
  const blip = (f, d, type = 'square', v = 0.05) => { const c = A(); if (!c) return; const o = c.createOscillator(), g = c.createGain(), t = c.currentTime; o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.02); };
  const knock = v => { blip(260 + Math.random() * 120, 0.05, 'triangle', 0.04 * v); blip(1400 + Math.random() * 400, 0.02, 'square', 0.015 * v); }, clack = () => { blip(1800, 0.03, 'square', 0.03); blip(900, 0.05, 'triangle', 0.04); };
  // ---------- state ----------
  let chip = 5, bets = {}, point = 0, phase = 'bet', hist = [], msg = null, dirty = true, lastEmit = 0, rollT = 0, roll2 = [1, 1];
  const gold = () => { try { return save ? save.data.gold : 0; } catch (e) { return 0; } }, down = () => Object.values(bets).reduce((a, b) => a + b, 0);
  const say = (t, sub = '', col = '#ffd23a', d = 2.6) => { msg = { t, sub, col, until: now() + d }; dirty = true; };
  const removable = k => !(point && (k === 'pass' || k === 'dont'));   // line bets stay up once there is a point
  function bet(k) { if (phase !== 'bet' || !k || !BETN[k]) return; if ((k === 'pass' || k === 'dont') && point) { say('LINE BETS GO DOWN ON THE COME-OUT', 'WAIT FOR THE POINT TO END', '#ffd23a', 2); return; }
    if (down() + chip > CRAPS.maxTable) { say('TABLE LIMIT ' + CRAPS.maxTable, '', '#ec3013', 1.6); return; } if (!save || !save.spend(chip)) { say('NOT ENOUGH GOLD', 'LOWER YOUR CHIP', '#ec3013', 1.6); return; }
    bets[k] = (bets[k] || 0) + chip; everBet = true; drawStack(k); clack(); flash(k); dirty = true; }
  function flash(k) { const [x, z] = c2l(...SPOT[k]); hi.position.x = x; hi.position.z = z; const big = k === 'pass' ? [W - 48, 30] : k === 'dont' ? [176, 34] : k === 'field' ? [288, 34] : k[0] === 'p' ? [(W - 48) / 6, 60] : [100, 60]; hi.scale.set(big[0] / W * FW, 1, big[1] / H * FD); hiT = now(); }
  function clear() { if (phase !== 'bet') return; let back = 0; for (const k of Object.keys(bets)) if (removable(k)) { back += bets[k]; delete bets[k]; drawStack(k); } if (back && save) save.addGold(back); dirty = true; }
  // ---------- the throw ----------
  function roll() { if (phase !== 'bet') return; if (!down()) { say('PLACE A BET FIRST', touch ? 'TAP THE FELT' : 'CLICK THE FELT', '#ffd23a', 1.6); return; } A();
    roll2 = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]; phase = 'roll'; rollT = now(); blip(140, 0.25, 'sawtooth', 0.03);
    const vx0 = (Math.random() - 0.5) * 0.5, vz0 = -(3.1 + Math.random() * 0.5);   // s101 (Ben): both dice leave the hand together, so they land close
    dice.forEach((d, i) => { d.rest = false; d.want = roll2[i]; d.m.position.set(-0.2 + i * 0.21, FY + 0.5, 0.85); d.v.set(vx0 + (Math.random() - 0.5) * 0.12, 1.25 + Math.random() * 0.2, vz0 + (Math.random() - 0.5) * 0.25); d.w.set(rr(18), rr(18), rr(18)); d.settle = null; });
    dirty = true; }
  const rr = a => (Math.random() * 2 - 1) * a, UP = V(0, 1, 0);
  function stepDice(dt) { let all = true;
    for (const d of dice) { if (d.rest) continue; all = false; const m = d.m;
      if (d.settle) { d.settle.t = Math.min(1, d.settle.t + dt / 0.35); m.quaternion.slerpQuaternions(d.settle.q0, d.settle.q1, d.settle.t * d.settle.t * (3 - 2 * d.settle.t)); m.position.y = FY + S / 2; if (d.settle.t >= 1) d.rest = true; continue; }
      d.v.y -= 9.8 * dt; m.position.addScaledVector(d.v, dt); const e = V(d.w.x * dt, d.w.y * dt, d.w.z * dt), qq = new THREE.Quaternion().setFromEuler(new THREE.Euler(e.x, e.y, e.z)); m.quaternion.premultiply(qq);
      if (m.position.y < FY + S / 2) { m.position.y = FY + S / 2; if (d.v.y < -0.6) knock(Math.min(1, -d.v.y / 3)); d.v.y = -d.v.y * 0.42; d.v.x *= 0.8; d.v.z *= 0.8; d.w.multiplyScalar(0.7); }
      if (m.position.z < -(1.0 - S / 2)) { m.position.z = -(1.0 - S / 2); d.v.z = Math.abs(d.v.z) * 0.55; d.w.multiplyScalar(0.8); knock(0.8); }   // the far rail
      if (m.position.z > 1.0) { m.position.z = 1.0; d.v.z = -Math.abs(d.v.z) * 0.5; } if (Math.abs(m.position.x) > 2.1 - S / 2) { m.position.x = Math.sign(m.position.x) * (2.1 - S / 2); d.v.x *= -0.5; }
      if (Math.abs(d.v.y) < 0.35 && m.position.y < FY + S / 2 + 0.01 && Math.hypot(d.v.x, d.v.z) < 0.35) {   // nearly still: turn the wanted face up
        const nn = NRM[FACES.indexOf(d.want)], cur = V(...nn).applyQuaternion(m.quaternion), fix = new THREE.Quaternion().setFromUnitVectors(cur, UP), q1 = m.quaternion.clone().premultiply(fix); d.settle = { t: 0, q0: m.quaternion.clone(), q1 }; d.v.set(0, 0, 0); } }
    { const a = dice[0].m.position, b2 = dice[1].m.position, dx = b2.x - a.x, dz = b2.z - a.z, dd = Math.hypot(dx, dz) || 1e-4, min = S * 1.12;   // s101: the dice never merge: push apart, trade a little speed
      if (dd < min && Math.abs(a.y - b2.y) < S) { const nx = dx / dd, nz = dz / dd, push = (min - dd) / 2; a.x -= nx * push; a.z -= nz * push; b2.x += nx * push; b2.z += nz * push;
        const [p, q] = dice, rv = (q.v.x - p.v.x) * nx + (q.v.z - p.v.z) * nz; if (rv < 0) { p.v.x += rv * nx * 0.8; p.v.z += rv * nz * 0.8; q.v.x -= rv * nx * 0.8; q.v.z -= rv * nz * 0.8; knock(0.6); } } }
    dice.forEach((d, i) => { shadows[i].position.x = d.m.position.x; shadows[i].position.z = d.m.position.z; shadows[i].visible = true; });
    return all; }
  function resolve() { const [a, b] = roll2, n = a + b; let won = 0; const out = [];
    const pay = (k, mult) => { const v = bets[k]; if (!v) return; const amt = v + Math.floor(v * mult); won += amt; out.push(BETN[k] + ' +' + Math.floor(v * mult)); delete bets[k]; drawStack(k); };
    const lose = k => { if (bets[k]) { delete bets[k]; drawStack(k); } };
    // one-roll bets
    if ([3, 4, 9, 10, 11].includes(n)) pay('field', 1); else if (n === 2 || n === 12) pay('field', 2); else lose('field');
    if (n === 7) pay('any7', 4); else lose('any7'); if ([2, 3, 12].includes(n)) pay('craps', 7); else lose('craps');
    // place bets
    for (const p of PLACE) { const k = 'p' + p; if (!bets[k]) continue; if (n === 7) lose(k); else if (n === p) { const [x, y] = PLACE_PAY[p]; const v = bets[k], w2 = Math.floor(v * x / y); won += w2; out.push(BETN[k] + ' +' + w2); } }   // a place bet that hits stays up
    let head = '';
    if (!point) { if (n === 7 || n === 11) { pay('pass', 1); lose('dont'); head = n === 7 ? 'SEVEN · WINNER!' : 'YO-LEVEN!'; } else if ([2, 3, 12].includes(n)) { lose('pass'); if (n === 12) { if (bets.dont) { won += bets.dont; out.push("DON'T PASS PUSH"); delete bets.dont; drawStack('dont'); } } else pay('dont', 1); head = 'CRAPS ' + n; }
      else { point = n; head = 'THE POINT IS ' + n; } }
    else if (n === point) { pay('pass', 1); lose('dont'); head = 'POINT MADE · ' + n + '!'; point = 0; }
    else if (n === 7) { lose('pass'); pay('dont', 1); head = 'SEVEN OUT'; point = 0; }
    else head = n + (a === b ? ' · THE HARD WAY' : '');
    if (won > 0 && save) save.addGold(won); hist.unshift({ a, b, n }); hist.length = Math.min(hist.length, 8); placePuck();
    say(head, out.length ? out.join(' \u00b7 ') : 'ROLL AGAIN', won > 0 ? '#ffd23a' : n === 7 && !point ? '#ff5a4a' : '#f3f2f2', 3);
    if (won > 0) { blip(660, 0.15, 'triangle', 0.07); setTimeout(() => blip(990, 0.25, 'triangle', 0.07), 130); }
    const [hx, hz] = c2l(SPOT[point ? 'p' + point : 'pass'][0], SPOT[point ? 'p' + point : 'pass'][1]); hi.position.x = hx; hi.position.z = hz; hiT = now();
    phase = 'result'; setTimeout(() => { phase = 'bet'; dirty = true; }, 900); dirty = true; }
  placePuck();
  // ---------- camera: from the side where the felt reads the right way up ----------
  const cam = new THREE.PerspectiveCamera(worldCam.fov || 50, 1, 0.05, 200), tcam = cam.clone(), pv = V(); let shotKey = '', shot = null;
  function shots() { const Wd = innerWidth || 1, Hd = innerHeight || 1, key = Wd + 'x' + Hd; if (key === shotKey) return; shotKey = key; const port = Hd > Wd, btm = touch ? (port ? 230 : 120) : 90, yMin = -1 + 2 * btm / Hd;
    const pts = [[-FW / 2, -FD / 2], [FW / 2, -FD / 2], [-FW / 2, FD / 2], [FW / 2, FD / 2]].map(([x, z]) => L2W(x, FY, z)); pts.push(L2W(0, 1.4, -1.2));
    tcam.fov = worldCam.fov || 50; tcam.aspect = Wd / Hd; tcam.updateProjectionMatrix(); const C = L2W(0, FY, 0.05), pitch = port ? 1.1 : 0.95, dir = V(0, -Math.sin(pitch), -Math.cos(pitch)).applyQuaternion(gq).normalize(); let lo = 0.8, hi2 = 14;
    for (let i = 0; i < 18; i++) { const D = (lo + hi2) / 2; tcam.position.copy(C).addScaledVector(dir, -D); tcam.lookAt(C); tcam.updateMatrixWorld(); let ok = true;
      for (const p of pts) { pv.copy(p).project(tcam); if (pv.z > 1 || Math.abs(pv.x) > 0.95 || pv.y > 0.86 - (port ? 0.1 : 0) || pv.y < yMin) { ok = false; break; } } if (ok) hi2 = D; else lo = D; }
    tcam.position.copy(C).addScaledVector(dir, -hi2); tcam.lookAt(C); shot = { p: tcam.position.clone(), q: tcam.quaternion.clone() }; }
  shots(); cam.position.copy(shot.p); cam.quaternion.copy(shot.q);
  // ---------- tap the felt ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), inv = new THREE.Matrix4();
  function tap(cx, cy, viewCam) { if (phase !== 'bet') return false; ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, viewCam || cam);
    inv.copy(group.matrixWorld).invert(); const o = ray.ray.origin.clone().applyMatrix4(inv), d = ray.ray.direction.clone().transformDirection(inv); if (Math.abs(d.y) < 1e-4) return false; const t = (FY - o.y) / d.y; if (t < 0) return false;
    const [px, py] = l2c(o.x + d.x * t, o.z + d.z * t), k = betAt(px, py); if (!k) return false; bet(k); return true; }
  // ---------- loop ----------
  function update(dt) { shots(); const t = now(); dt = Math.min(dt, 0.04);
    if (phase === 'roll') { if (stepDice(dt) || t - rollT > 6) { dice.forEach(d => { d.rest = true; }); resolve(); } }
    const ha = t - hiT; hiMat.opacity = ha < 0.5 ? 0.5 * (1 - ha / 0.5) : 0;
    cue.visible = phase === 'bet' && !down(); if (cue.visible) cue.position.y = FY + 0.55 + Math.sin(t * 3.2) * 0.05;
    const k = 1 - Math.exp(-3 * dt); cam.position.lerp(shot.p, k); cam.quaternion.slerp(shot.q, k); cam.fov = worldCam.fov || 50; cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    if (msg && t > msg.until) { msg = null; dirty = true; }
    const n2 = performance.now(); if (dirty || n2 - lastEmit > 250) { dirty = false; lastEmit = n2; onState(hud()); } }
  function hud() { return { phase, chip, chips: CRAPS.chips, gold: gold(), down: down(), point, bets: Object.entries(bets).map(([k, v]) => ({ k, name: BETN[k], v })), hist: hist.map(h => ({ n: String(h.n), a: h.a, b: h.b, hard: h.a === h.b })), msg: msg ? { t: msg.t, sub: msg.sub, col: msg.col } : null, canRoll: phase === 'bet' && down() > 0, first: !everBet, needBet: phase === 'bet' && !down() }; }
  return { camera: cam, update, tap, bet, chip(v) { if (CRAPS.chips.includes(v)) { chip = v; dirty = true; } }, roll, clear, hud, busy: () => phase === 'roll',
    refund() { let back = 0; for (const k of Object.keys(bets)) back += bets[k]; bets = {}; if (back && save) save.addGold(back); },   // leaving the table hands back every chip still on the felt
    destroy() { group.remove(G); feltTex.dispose(); chipGeo.dispose(); edgeGeo.dispose(); dieGeo.dispose(); dieMats.forEach(m => { m.map.dispose(); m.dispose(); }); try { ac && ac.close(); } catch (e) {} } };
}
