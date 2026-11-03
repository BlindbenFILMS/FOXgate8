// 8 GATES — GAYA · THE GAYA OPEN [gayaStadium]. 3D tennis on the shared Game HUD (vehicle "tennis": 1 HIT · 2 LOB · 3 SMASH).
// Ben chose layout 1c: you run with the stick; a ring shrinks around the ball as it reaches you; press while it is GREEN.
// Camera behind Ben (TV view), hard court in a big arena with crowd. Lessons with FAULT (ballfox) first, then 3 rounds: SLICE · LOFT · ACE (champion).
// Umpire DEUCE in the chair. Prize: GOLDEN RACKET relic. Match = one short set, first to 4 games. Save keys gaya.tennis.*, flags gayaTennisLessons / gayaOpenWon.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage } from '../../engine/restaurant-kit.js';

const HL = 11.885, SW = 4.115, DW = 5.485, SV = 6.4, NH = 0.95, G = 9.8, BR = 0.1, REACH = 1.8;
export const OPP = [
  { id: 'slice', name: 'SLICE', round: 'ROUND 1', spd: 5.4, react: 0.3, err: 0.1, lob: 0.12, pace: 0.9, away: 0.6, srv: 16, gold: 30, fur: '#c9682a', furDark: '#8a4213', torso: ['#3a6ea5', '#fbf8ec', '#22446e'] },
  { id: 'loft', name: 'LOFT', round: 'SEMI-FINAL', spd: 6.0, react: 0.25, err: 0.06, lob: 0.42, pace: 1.0, away: 0.72, srv: 18, gold: 50, fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#2f9a8f', '#fbf8ec', '#1f6a62'] },
  { id: 'ace', name: 'ACE', round: 'FINAL', spd: 6.8, react: 0.2, err: 0.035, lob: 0.2, pace: 1.22, away: 0.85, srv: 22, gold: 150, fur: '#3a3836', furDark: '#1a1918', torso: ['#f2c94c', '#201e1d', '#a8792e'] }];
const COACH = { id: 'fault', name: 'FAULT', spd: 6, react: 0.2, err: 0, lob: 0, pace: 0.7, srv: 14, fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#ec3013', '#fbf8ec', '#a82c26'] };
export const LESSONS = [
  { id: 'hit', title: 'HIT', goal: 3, feed: 'flat', text: 'Run to the ball with the stick. Press 1 HIT when the ring around the ball turns green.' },
  { id: 'aim', title: 'AIM', goal: 2, feed: 'flat', text: 'Hold the stick LEFT or RIGHT as you hit. Land one ball in each glowing box.' },
  { id: 'lob', title: 'LOB', goal: 2, feed: 'flat', text: 'Press 2 LOB to send the ball high and deep. Land 2 lobs in.' },
  { id: 'smash', title: 'SMASH', goal: 2, feed: 'lob', text: 'Fault lobs it high. Get under it and press 3 SMASH. Land 2 smashes.' },
  { id: 'serve', title: 'SERVE', goal: 2, feed: 'serve', text: 'Press 1 to toss. Press 1 again while the bar is in the GREEN. Land 2 serves in the box.' },
  { id: 'rally', title: 'RALLY', goal: 5, feed: 'rally', text: 'Fault hits back now. Keep it going: 5 in a row over the net.' }];
const PTS = ['0', '15', '30', '40'], SK = { lesson: 'gaya.tennis.lesson', round: 'gaya.tennis.round', wins: 'gaya.tennis.wins' };
const CROWD = ['#e2453f', '#3a6ea5', '#f2c94c', '#fbf8ec', '#2f9a8f', '#a78bfa', '#f07a72', '#201e1d', '#e8792e', '#7cc8e0'], FURS = ['#e8792e', '#c9682a', '#9a6f4a', '#e6e4de', '#3a3836', '#f0dcbe', '#9a9a9e'];

export async function createTennis({ container, onState = () => {} }) {
  const ST = createStage(container, { bg: '#8fc8ea' }), { CW, CHh, renderer, scene, camera, V3, toon, M, kit, audio, tone, puff, smokeS, sun, glowTex, touch } = ST;
  camera.far = 160; camera.updateProjectionMatrix();
  scene.background = canvasTex(4, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#5aa8de'); g.addColorStop(0.55, '#a8d8f0'); g.addColorStop(1, '#e8f4f8'); c.fillStyle = g; c.fillRect(0, 0, 4, 256); });
  sun.position.set(-8, 22, 10); Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 18, bottom: -18, far: 70 }); sun.shadow.camera.updateProjectionMatrix();
  // ---------- arena ----------
  const flat = (w, d, col, x, z, y = 0.004) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), col.isMaterial ? col : toon(col)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; scene.add(m); return m; };
  flat(160, 160, '#3f8a5c', 0, 0, 0); flat(2 * DW + 7.2, 2 * HL + 12.4, '#3f6fb0', 0, 0, 0.003);
  const lineM = new THREE.MeshBasicMaterial({ color: 0xffffff }), ln = (x0, z0, x1, z1) => flat(Math.max(0.06, Math.abs(x1 - x0)), Math.max(0.06, Math.abs(z1 - z0)), lineM, (x0 + x1) / 2, (z0 + z1) / 2, 0.008);
  for (const s of [-1, 1]) { ln(-DW, s * HL, DW, s * HL); ln(s * DW, -HL, s * DW, HL); ln(s * SW, -HL, s * SW, HL); ln(-SW, s * SV, SW, s * SV); ln(0, s * HL, 0, s * (HL - 0.2)); } ln(0, -SV, 0, SV);
  { const nw = 2 * DW + 1.8, netT = canvasTex(512, 64, c => { c.clearRect(0, 0, 512, 64); c.strokeStyle = 'rgba(20,20,24,0.85)'; c.lineWidth = 2; for (let x = 0; x <= 512; x += 8) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 64); c.stroke(); } for (let y = 0; y <= 64; y += 8) { c.beginPath(); c.moveTo(0, y); c.lineTo(512, y); c.stroke(); } });
    const net = new THREE.Mesh(new THREE.PlaneGeometry(nw, NH - 0.05), new THREE.MeshBasicMaterial({ map: netT, transparent: true, side: THREE.DoubleSide, depthWrite: false })); net.position.set(0, (NH - 0.05) / 2 + 0.02, 0); scene.add(net);
    M(new THREE.BoxGeometry(nw, 0.07, 0.04), toon('#fbf8ec'), 0, NH, 0, scene, 0.008); M(new THREE.BoxGeometry(0.05, NH, 0.03), toon('#fbf8ec'), 0, NH / 2, 0, scene, 0);
    for (const s of [-1, 1]) M(new THREE.CylinderGeometry(0.06, 0.06, 1.07, 10), toon('#2a4a38'), s * nw / 2, 0.535, 0, scene, 0.01, 0.06); }
  const boardT = canvasTex(1024, 96, c => { c.fillStyle = '#1f4a34'; c.fillRect(0, 0, 1024, 96); c.font = '900 56px Archivo, "Arial Black", Arial'; c.textBaseline = 'middle'; c.fillStyle = '#fbf8ec'; for (let i = 0; i < 3; i++) { c.fillText('THE GAYA OPEN', 30 + i * 345, 50); } c.fillStyle = '#f2c94c'; c.fillRect(0, 0, 1024, 6); c.fillRect(0, 90, 1024, 6); }); boardT.wrapS = THREE.RepeatWrapping;
  const wallX = DW + 6.5, wallZ = HL + 8; for (const [x, z, w, ry] of [[-wallX, 0, wallZ * 2, Math.PI / 2], [wallX, 0, wallZ * 2, -Math.PI / 2], [0, -wallZ, wallX * 2, 0]]) { const t = boardT.clone(); t.needsUpdate = true; t.repeat.set(w / 14, 1); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.1), new THREE.MeshToonMaterial({ map: t, gradientMap: ST.grad })); m.position.set(x, 0.55, z); m.rotation.y = ry; scene.add(m); }
  // stands: stepped concrete + an instanced crowd (2 draw calls for every fan)
  const concrete = toon('#9a968c'), seats = [], ROWS = touch ? 7 : 9;
  const stand = (cx, cz, len, out, ry) => { const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = ry; scene.add(g); for (let r = 0; r < ROWS; r++) { const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.55 + r * 0.55, 0.95), r % 2 ? concrete : toon('#8a867c')); m.position.set(0, (0.55 + r * 0.55) / 2 + 0.6, out * (r * 0.95 + 0.5)); m.receiveShadow = true; g.add(m); for (let x = -len / 2 + 0.4; x < len / 2 - 0.3; x += 0.62) if (Math.random() < 0.86) seats.push({ g, x: x + rr(-0.06, 0.06), y: 0.6 + 0.55 + r * 0.55, z: out * (r * 0.95 + 0.5) }); } return g; };
  stand(-wallX - 0.6, 0, wallZ * 2 - 1, -1, Math.PI / 2); stand(wallX + 0.6, 0, wallZ * 2 - 1, -1, -Math.PI / 2); const far = stand(0, -wallZ - 0.6, wallX * 2 + 1, -1, 0);
  const crowdB = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.5, 0.3), new THREE.MeshToonMaterial({ gradientMap: ST.grad }), seats.length), crowdH = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 8, 6), new THREE.MeshToonMaterial({ gradientMap: ST.grad }), seats.length), dm = new THREE.Object3D(), cc = new THREE.Color();
  const crowdPos = seats.map(s => { s.g.updateMatrixWorld(); return V3(s.x, s.y, s.z).applyMatrix4(s.g.matrixWorld); });
  const placeCrowd = (jump = 0, t = 0) => { crowdPos.forEach((p, i) => { const j = jump ? Math.max(0, Math.sin(t * 14 + i * 1.7)) * jump * 0.35 : 0; dm.position.set(p.x, p.y + 0.25 + j, p.z); dm.rotation.set(0, 0, 0); dm.updateMatrix(); crowdB.setMatrixAt(i, dm.matrix); dm.position.y = p.y + 0.66 + j; dm.updateMatrix(); crowdH.setMatrixAt(i, dm.matrix); }); crowdB.instanceMatrix.needsUpdate = crowdH.instanceMatrix.needsUpdate = true; };
  crowdPos.forEach((p, i) => { crowdB.setColorAt(i, cc.set(pick(CROWD))); crowdH.setColorAt(i, cc.set(pick(FURS))); }); placeCrowd(); scene.add(crowdB, crowdH);
  { const rb = new THREE.Group(); rb.position.set(0, 0, -wallZ - 0.6); scene.add(rb); M(new THREE.BoxGeometry(6, 0.12, 3.2), toon('#a82c26'), 0, 4.4, -2.4, rb, 0.02); M(new THREE.BoxGeometry(6.1, 0.3, 0.12), toon('#f2c94c'), 0, 4.25, -0.8, rb, 0.01); for (const x of [-2.9, 2.9]) M(new THREE.BoxGeometry(0.14, 2.6, 0.14), toon('#f2c94c'), x, 3.1, -0.85, rb, 0.01); }
  for (const [x, z] of [[-wallX - 9, -wallZ - 6], [wallX + 9, -wallZ - 6], [-wallX - 9, wallZ - 2], [wallX + 9, wallZ - 2]]) { M(new THREE.CylinderGeometry(0.25, 0.35, 16, 8), toon('#5a646d'), x, 8, z, scene, 0); const l = M(new THREE.BoxGeometry(2.6, 1.4, 0.4), toon('#3a3836'), x, 16.4, z, scene, 0.02); l.lookAt(0, 0, 0); for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.05), new THREE.MeshBasicMaterial({ color: 0xfff6d8 })); b.position.set(-0.9 + (i % 3) * 0.9, i < 3 ? 0.3 : -0.3, 0.22); l.add(b); } }
  // scoreboard over the far stand (redrawn when the score changes)
  const sbCanvas = document.createElement('canvas'); sbCanvas.width = 512; sbCanvas.height = 192; const sbT = new THREE.CanvasTexture(sbCanvas); sbT.colorSpace = THREE.SRGBColorSpace;
  { const sb = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 2.7), new THREE.MeshBasicMaterial({ map: sbT })); sb.position.set(-8, 9.6, -wallZ - 8.6); scene.add(sb); M(new THREE.BoxGeometry(7.6, 3.1, 0.3), toon('#201e1d'), -8, 9.6, -wallZ - 8.8, scene, 0.02); M(new THREE.BoxGeometry(0.3, 4.5, 0.3), toon('#5a646d'), -8, 6, -wallZ - 8.9, scene, 0); }
  let sbKey = ''; const drawBoard = rows => { const k = JSON.stringify(rows); if (k === sbKey) return; sbKey = k; const c = sbCanvas.getContext('2d'); c.fillStyle = '#0b0a0a'; c.fillRect(0, 0, 512, 192); c.fillStyle = '#f2c94c'; c.font = '900 26px Archivo, Arial'; c.fillText(rows.title, 18, 34); c.fillRect(0, 48, 512, 4);
    rows.lines.forEach((r, i) => { const y = 98 + i * 58; c.fillStyle = r.serve ? '#d9f24c' : '#0b0a0a'; c.beginPath(); c.arc(26, y - 10, 8, 0, 7); c.fill(); c.fillStyle = '#fbf8ec'; c.font = '900 40px Archivo, Arial'; c.fillText(r.name, 46, y + 4); c.fillStyle = '#f2c94c'; c.fillText(r.g, 330, y + 4); c.fillStyle = '#fbf8ec'; c.fillText(r.p, 410, y + 4); }); sbT.needsUpdate = true; };
  // umpire chair + benches
  { M(new THREE.BoxGeometry(0.9, 0.1, 0.9), toon('#2a4a38'), DW + 1.7, 1.75, 0, scene, 0.01); for (const [dx, dz] of [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]]) M(new THREE.BoxGeometry(0.08, 1.75, 0.08), toon('#2a4a38'), DW + 1.7 + dx, 0.875, dz, scene, 0.006); M(new THREE.BoxGeometry(0.1, 0.9, 0.9), toon('#2a4a38'), DW + 2.1, 2.2, 0, scene, 0.01);
    for (const z of [-2.2, 2.2]) { M(new THREE.BoxGeometry(0.6, 0.45, 1.8), toon('#3a6ea5'), DW + 2.4, 0.225, z, scene, 0.012); M(new THREE.BoxGeometry(0.2, 0.08, 0.4), toon('#fbf8ec'), DW + 2.4, 0.49, z + 0.3, scene, 0.005); } }
  // ---------- foxes ----------
  const strip = (f, sc = 0.78) => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; f.scale.setScalar(sc); scene.add(f); return f; };
  const racketFor = f => { const P = f.userData.P, arm = P.arms && P.arms[0]; if (!arm) return null; const g = new THREE.Group(); g.position.set(0, -0.4, 0.02); arm.add(g); M(new THREE.CylinderGeometry(0.025, 0.03, 0.28, 8), toon('#201e1d'), 0, -0.14, 0, g, 0.006); const head = new THREE.Group(); head.position.y = -0.48; g.add(head);
    const rim = M(new THREE.TorusGeometry(0.17, 0.022, 6, 22), toon('#ec3013'), 0, 0, 0, head, 0.006); rim.scale.set(0.85, 1.12, 1); const str = new THREE.Mesh(new THREE.CircleGeometry(0.16, 18), new THREE.MeshBasicMaterial({ color: 0xfbf8ec, transparent: true, opacity: 0.55, side: THREE.DoubleSide })); str.scale.set(0.85, 1.12, 1); head.add(str); return g; };
  const mkFox = (cfg, outfit = 'tee') => { const f = strip(kit.makeFox({ ...CAST.player, look: cfg.fur ? { ...CAST.player.look, fur: cfg.fur, furDark: cfg.furDark } : CAST.player.look, torso: cfg.torso, outfit, crest: '', gear: 'none', mood: 'happy' })); racketFor(f); return f; };
  const benF = mkFox({ torso: ['#fbf8ec', '#fbf8ec', '#ec3013'] }), oppF = [...OPP, COACH].map(c => { const f = mkFox(c); f.visible = false; return f; });
  const deuce = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#e6e4de', furDark: '#a8a6a0' }, torso: ['#1f4a34', '#fbf8ec', '#16352a'], outfit: 'coat', crest: '', gear: 'none', mood: 'neutral' })); deuce.position.set(DW + 1.75, 1.8, 0); deuce.rotation.y = -Math.PI / 2;
  // ---------- ball + markers ----------
  const ballM = M(new THREE.SphereGeometry(BR, 14, 10), toon('#d9f24c'), 0, 1, 0, scene, 0.012, BR);
  { const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xeaff6a, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(0.75); ballM.add(gl); }
  const shadowM = new THREE.Mesh(new THREE.CircleGeometry(BR * 1.4, 16), new THREE.MeshBasicMaterial({ color: 0x0b1a30, transparent: true, opacity: 0.4, depthWrite: false })); shadowM.rotation.x = -Math.PI / 2; scene.add(shadowM);
  const ovl = (geo, col, op = 1) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthTest: false, depthWrite: false, side: THREE.DoubleSide })); m.renderOrder = 60; m.visible = false; scene.add(m); return m; };
  const ringO = ovl(new THREE.RingGeometry(0.3, 0.4, 40), 0xffd23a), ringI = ovl(new THREE.RingGeometry(0.3, 0.33, 40), 0xffffff, 0.85);
  const markR = ovl(new THREE.RingGeometry(0.2, 0.3, 28), 0xffd23a, 0.9); markR.rotation.x = -Math.PI / 2;
  const boxL = ovl(new THREE.PlaneGeometry(SW - 1.2, HL - 1.2), 0x22c55e, 0.28), boxR = ovl(new THREE.PlaneGeometry(SW - 1.2, HL - 1.2), 0x22c55e, 0.28); for (const [b, s] of [[boxL, -1], [boxR, 1]]) { b.rotation.x = -Math.PI / 2; b.position.set(s * (SW + 1.2) / 2, 0.02, -(HL + 1.2) / 2); }
  // ---------- state ----------
  const S = { mode: 'intro', ph: 'idle', t: 0, L: 0, lc: 0, aim: { l: 0, r: 0 }, lessonDone: false, round: 0, match: null, flash: null, flashT: 0, call: '', callT: 0, overT: 0, next: '', done: null, cheer: 0, bot: false, tossT: 0, srvT: 0, lastGrade: '' };
  const P = { f: benF, x: 0.9, z: HL + 0.4, swingT: 0, swingType: 'flat', cd: 0, pending: null, mv: 0 }, O = { f: oppF[0], x: 0, z: -HL - 0.6, plan: null, swingT: 0, swingType: 'flat', cfg: OPP[0], mv: 0 };
  const B = { p: V3(0, 1, 0), v: V3(), live: false, rules: false, hit: null, bounces: 0, serve: false, box: 1, type: 'flat', netHit: false, apex: 0, hold: 'p' };
  const stick = { x: 0, y: 0 }, keys = new Set(), hist = []; let PR = null, PAUSE = false;
  const flash = (txt, col = '#ffd23a', t = 1.3) => { S.flash = { txt, col }; S.flashT = t; }, call = (txt, t = 2.2) => { S.call = txt; S.callT = t; };
  const other = w => w === 'p' ? 'o' : 'p', oppName = () => O.cfg.name;
  const cheer = (n = 1.6) => { S.cheer = n; try { for (let i = 0; i < 5; i++) setTimeout(() => audio.burst && audio.burst(0.25, 1600 + Math.random() * 1200, 0.09), i * 140); } catch (e) {} };
  const pock = (hi = 1) => { tone(700 * hi, 0.04, 0.09, 'square'); tone(320 * hi, 0.07, 0.06, 'triangle'); };
  function setOpp(cfg) { O.cfg = cfg; const i = cfg === COACH ? 3 : OPP.indexOf(cfg); oppF.forEach((f, k) => f.visible = k === i); O.f = oppF[i]; }
  // ---------- physics ----------
  function physStep(dt) { const p = B.p, v = B.v, z0 = p.z; v.y -= G * dt; p.addScaledVector(v, dt);
    if ((z0 > 0) !== (p.z > 0) && !B.netHit && Math.abs(p.x) < DW + 0.95 && p.y < NH + BR) { B.netHit = true; p.z = z0 > 0 ? 0.14 : -0.14; v.z *= -0.12; v.x *= 0.3; v.y = Math.min(v.y, 0) * 0.3; tone(150, 0.08, 0.05, 'sine'); }
    if (p.y < BR && v.y < 0) { p.y = BR; v.y = -v.y * 0.7; v.x *= 0.86; v.z *= 0.86; if (v.y < 0.5) v.y = 0; if (Math.abs(v.y) > 0.5) tone(240, 0.03, 0.04, 'sine'); if (B.rules) onBounce(); } }
  function simulate(maxT, fn) { const p = B.p.clone(), v = B.v.clone(), h = 1 / 90; let t = 0, nb = 0; while (t < maxT) { v.y -= G * h; p.addScaledVector(v, h); t += h; let bo = false; if (p.y < BR && v.y < 0) { p.y = BR; v.y = -v.y * 0.7; v.x *= 0.86; v.z *= 0.86; nb++; bo = true; } if (fn(p, v, t, nb, bo) === false) break; } }
  const inCourt = (x, z, serve, box, side) => side * z > 0 && Math.abs(x) <= SW + 0.06 && Math.abs(z) <= (serve ? SV : HL) + 0.06 && (!serve || x * box >= -0.06);
  function launch(p0, tx, tz, T, fix, who, type, serve = false, box = 1) { const vel = V3(), solve = () => vel.set((tx - p0.x) / T, (BR - p0.y + 0.5 * G * T * T) / T, (tz - p0.z) / T); solve();
    if (fix) for (let k = 0; k < 16; k++) { const tc = -p0.z / vel.z; if (tc <= 0 || tc >= T) break; if (p0.y + vel.y * tc - 0.5 * G * tc * tc > NH + 0.24) break; T *= 1.07; solve(); }
    S.botOff = S.botErr ? rr(0, S.botErr) : 0; B.q = null; Object.assign(B, { live: true, rules: true, hit: who, bounces: 0, serve, box, type, netHit: false, hold: null }); B.p.copy(p0); B.v.copy(vel); B.apex = p0.y + Math.max(0, vel.y * vel.y / (2 * G)); hist.length = 0; O.plan = null; PR = null; P.pending = null; }
  function onBounce() { const side = B.p.z > 0 ? 'p' : 'o';
    if (B.bounces === 0) { if (side === B.hit) return B.serve ? fault('NET') : endPoint(other(B.hit), 'NET');
      if (!inCourt(B.p.x, B.p.z, B.serve, B.box, side === 'p' ? 1 : -1)) { S.lastOut = B.hit + ' ' + B.type + ' ' + B.p.x.toFixed(1) + ',' + B.p.z.toFixed(1); return B.serve ? fault('FAULT') : endPoint(other(B.hit), 'OUT'); }
      B.bounces = 1; puff(B.p.x, 0.05, B.p.z, 0xd8e8f8, 2); if (B.hit === 'p' && S.mode === 'lesson') lessonLand(); return; }
    endPoint(B.hit, B.serve ? 'ACE!' : B.hit === 'p' ? 'WINNER!' : 'MISSED'); }
  // ---------- swings ----------
  function swing(X, type) { X.swingT = 0.32; X.swingType = type; }
  function poseSwing(X, dt) { const P0 = X.f.userData.P, arm = P0.arms && P0.arms[0]; if (!arm) return; X.swingT = Math.max(0, X.swingT - dt); const k = X.swingT > 0 ? 1 - X.swingT / 0.32 : -1;
    if (k < 0) { arm.rotation.set(-0.9, 0, -0.5); return; } if (X.swingType === 'smash' || X.swingType === 'serve') arm.rotation.set(-3.0 + k * 2.6, 0, -0.2); else if (X.swingType === 'lob') arm.rotation.set(-0.3 - k * 2.0, 0, -0.4 + k * 0.6); else arm.rotation.set(-1.4, 0, -1.5 + k * 2.6); }
  // ---------- player shots ----------
  function press(type) { if (PAUSE || (S.mode !== 'lesson' && S.mode !== 'match')) return; try { audio.init && audio.init(); } catch (e) {}
    if (S.ph === 'serveP') return toss(); if (S.ph === 'toss') return serveHit();
    if (S.ph !== 'rally' || P.swingT > 0.12) return; swing(P, type);
    if (!(B.rules && B.hit === 'o')) return; let best = null; const cand = (tau, x, y, z) => { const d = Math.hypot(x - P.x, z - P.z); if (z > 0.3 && y < 3.9 && (!best || d < best.d)) best = { tau, d, y }; };
    for (const h of hist) if (h.t - S.t >= -0.32) cand(h.t - S.t, h.x, h.y, h.z);
    simulate(0.32, (p, v, t, nb) => { if (B.bounces + nb >= 2) return false; cand(t, p.x, p.y, p.z); });
    if (!best || best.d > (type === 'smash' ? REACH + 0.3 : REACH)) { flash(best && best.tau > 0.2 ? 'TOO EARLY' : 'TOO FAR · RUN TO IT', '#ff9a8a', 1); return; }
    const a = Math.abs(best.tau), q = a < 0.075 ? 1 : a < 0.16 ? 0.72 : 0.42, grade = q >= 1 ? 'PERFECT!' : q > 0.7 ? 'GOOD' : best.tau > 0 ? 'EARLY' : 'LATE';
    if (type === 'smash' && best.y < 1.45) { type = 'flat'; flash('TOO LOW TO SMASH', '#e6b45a', 0.9); }
    const ax = stick.kx != null ? stick.kx : stick.x; if (best.tau > 0.012) P.pending = { at: S.t + best.tau, type, q, grade, ax }; else playerShot(type, q, grade, ax); }
  function playerShot(type, q, grade, ax = stick.x) { const sx = Math.abs(ax) > 0.25 ? Math.sign(ax) : 0, p0 = B.p.clone(); let tx = sx ? sx * (q >= 1 ? SW - 0.7 : SW - 1.3) : rr(-1.3, 1.3), tz, T; tx += (1 - q) * rr(-2.4, 2.4); const fix = Math.random() > (1 - q) * 0.5;
    if (type === 'lob') { tz = -rr(9.2, 10.9) + (1 - q) * rr(-1.5, 2.3); T = 1.85; } else if (type === 'smash') { tz = -rr(5.5, 8.6) + (1 - q) * rr(-1.5, 2.2); T = Math.hypot(tx - p0.x, tz - p0.z) / (24 + 7 * q); } else { tz = -rr(8.2, 10.6) + (1 - q) * rr(-2, 2.5); T = Math.hypot(tx - p0.x, tz - p0.z) / (13 + 6 * q); }
    launch(p0, tx, tz, T, fix, 'p', type); B.q = q; pock(type === 'smash' ? 1.25 : 1); S.lastGrade = grade; flash(grade + (type === 'smash' ? ' SMASH' : type === 'lob' ? ' LOB' : ''), q >= 1 ? '#22c55e' : q > 0.7 ? '#ffffff' : '#e6b45a', 0.9); if (q >= 1) puff(p0.x, p0.y, p0.z, 0xffffff, 3); }
  // ---------- serves ----------
  const srvSide = () => S.mode === 'match' ? ((S.match.pts[0] + S.match.pts[1]) % 2 === 0 ? 1 : -1) : (S.lc % 2 === 0 ? 1 : -1);
  function setupServe() { const side = srvSide(), M0 = S.match, server = S.mode === 'match' ? M0.server : 'p'; B.live = false; B.rules = false; P.pending = null; PR = null;
    if (server === 'p') { P.x = side * 0.9; P.z = HL + 0.35; O.x = -side * 2.4; O.z = -HL - 0.5; B.hold = 'p'; S.ph = 'serveP'; B.box = -side; }
    else { O.x = -side * 0.9; O.z = -HL - 0.35; P.x = side * 2.4; P.z = HL + 0.6; B.hold = 'o'; S.ph = 'serveO'; S.srvT = S.t + (S.bot ? 0.6 : 1.4); B.box = side; } }
  function toss() { S.ph = 'toss'; S.tossT = S.t; B.hold = null; B.live = true; B.rules = false; B.p.set(P.x + 0.25, 1.25, P.z - 0.25); B.v.set(0, 5.4, 0); tone(500, 0.05, 0.03, 'sine'); }
  const meterV = () => clamp((S.t - S.tossT) / 1.05, 0, 1);
  function serveHit() { const m = meterV(), side = srvSide(), box = -side, sx = Math.abs(stick.x) > 0.25 ? Math.sign(stick.x) : 0; swing(P, 'serve'); const p0 = V3(P.x + 0.2, 2.6, P.z - 0.3);
    let tx = box * (sx ? (sx === box ? SW - 0.5 : 0.5) : rr(1.2, SW - 1)), tz = -rr(4.7, 5.9), sp = 18, fix = true, grade = 'GOOD SERVE';
    if (m < 0.36) { tz = -rr(0.6, 2.2); sp = 13; fix = false; grade = 'TOO SOFT'; } else if (m < 0.6) { sp = 15; } else if (m <= 0.82) { sp = 25; tz = -rr(5.3, 6.2); grade = 'PERFECT SERVE!'; } else if (m <= 0.92) { sp = 26; if (Math.random() < 0.5) { tz = -SV - rr(0.4, 1.3); grade = 'TOO HARD'; } } else { sp = 27; tz = -SV - rr(0.8, 2); grade = 'TOO HARD'; }
    launch(p0, tx, tz, Math.hypot(tx - p0.x, tz - p0.z) / sp, fix, 'p', 'serve', true, box); S.ph = 'rally'; pock(1.2); flash(grade, grade.startsWith('PERFECT') ? '#22c55e' : grade.startsWith('TOO') ? '#ff9a8a' : '#ffffff', 1); }
  function oppServe() { const c = O.cfg, side = srvSide(), box = side, second = S.mode === 'match' && S.match.serveN === 2, faultIt = S.mode === 'match' && Math.random() < c.err * (second ? 0.35 : 1.1); swing(O, 'serve'); const p0 = V3(O.x - 0.2, 2.6, O.z + 0.3);
    let tx = box * rr(1, SW - 0.7), tz = rr(4.6, 5.9), sp = second ? c.srv * 0.72 : c.srv; if (faultIt) { if (Math.random() < 0.5) tz = SV + rr(0.4, 1.4); else { tz = rr(0.5, 2); sp *= 0.7; } }
    launch(p0, tx, tz, Math.hypot(tx - p0.x, tz - p0.z) / sp, !faultIt || tz > SV, 'o', 'serve', true, box); S.ph = 'rally'; pock(1.1); }
  function fault(why) { if (S.ph === 'over') return; B.rules = false; S.ph = 'over'; P.pending = null;
    if (S.mode === 'lesson') { flash(why === 'NET' ? 'INTO THE NET · AGAIN' : 'FAULT · AGAIN', '#ff9a8a', 1.4); S.overT = S.t + 1.4; S.next = 'feed'; return; }
    const M0 = S.match; if (M0.serveN === 1) { M0.serveN = 2; call(why === 'NET' ? 'NET · SECOND SERVE' : 'FAULT · SECOND SERVE'); S.overT = S.t + 1.4; S.next = 'serve'; return; }
    M0.serveN = 1; S.ph = 'live'; endPoint(other(M0.server), 'DOUBLE FAULT'); }
  // ---------- scoring ----------
  function scoreTxt() { const M0 = S.match; if (!M0) return ''; const [a, b] = M0.pts; if (a >= 3 && b >= 3) return a === b ? 'DEUCE' : 'AD ' + (a > b ? 'BEN' : oppName()); const sv = M0.server === 'p'; return sv ? PTS[a] + '–' + PTS[b] : PTS[b] + '–' + PTS[a]; }
  function endPoint(w, why) { if (S.ph === 'over') return; B.rules = false; S.ph = 'over'; P.pending = null; S.overT = S.t + 1.9; S.next = 'point';
    if (S.mode === 'lesson') return lessonEnd(w, why);
    const M0 = S.match; M0.serveN = 1; const i = w === 'p' ? 0 : 1; M0.pts[i]++; if (w === 'p') cheer(why === 'WINNER!' || why === 'ACE!' ? 1.8 : 1); else tone(196, 0.25, 0.04, 'sine');
    const [a, b] = M0.pts; let gameW = null; if (a >= 4 && a - b >= 2) gameW = 0; else if (b >= 4 && b - a >= 2) gameW = 1;
    const why2 = why === 'WINNER!' ? (w === 'p' ? 'WINNER!' : oppName() + ' WINNER') : why === 'MISSED' ? oppName() + ' WINNER' : why;
    if (gameW != null) { M0.games[gameW]++; M0.pts = [0, 0]; M0.server = other(M0.server); const gw = M0.games[gameW] >= 4;
      flash(why2, w === 'p' ? '#22c55e' : '#ff9a8a', 1.4); call((gameW === 0 ? 'GAME BEN' : 'GAME ' + oppName()) + ' · ' + M0.games[0] + '–' + M0.games[1], 2.6);
      if (gw) { S.next = 'matchEnd'; S.overT = S.t + 2.8; call((gameW === 0 ? 'GAME, SET AND MATCH · BEN' : 'GAME, SET AND MATCH · ' + oppName()), 3.2); if (gameW === 0) cheer(2.6); } else S.overT = S.t + 2.4; }
    else { flash(why2, w === 'p' ? '#22c55e' : '#ff9a8a', 1.3); call(scoreTxt()); } }
  function startPoint() { S.ph = 'live'; setupServe(); }
  function startMatch(r) { r = clamp(r | 0, 0, 2); stick.x = stick.y = 0; audio.init && audio.init(); S.mode = 'match'; S.round = r; S.done = null; setOpp(OPP[r]); S.match = { pts: [0, 0], games: [0, 0], server: 'p', serveN: 1 }; S.ph = 'brief'; S.overT = S.t + 2.6; S.next = 'point'; call(OPP[r].round + ' · BEN VS ' + OPP[r].name, 2.6); boxL.visible = boxR.visible = false; setupServe(); S.ph = 'brief'; }
  function finishMatch() { if (S.demo) { demoStop(); return; } const M0 = S.match, won = M0.games[0] > M0.games[1], c = O.cfg, r = S.round; let gold = 0, relic = false;
    try { if (won) { gold = c.gold; save.addGold(gold); save.setStat(SK.round, Math.max(save.stat(SK.round, 0), r + 1)); save.setStat(SK.wins, save.stat(SK.wins, 0) + 1); if (r === 2) { save.addRelic('goldenRacket'); save.setFlag('gayaOpenWon'); relic = true; } } } catch (e) {}
    S.mode = 'done'; S.ph = 'idle'; B.live = false; S.done = { won, round: c.round, opp: c.name, games: M0.games.slice(), gold, relic, next: won && r < 2 ? OPP[r + 1] : null, again: !won, champ: won && r === 2 }; }
  // ---------- demo: autopilot plays Slice with captions; nothing is saved ----------
  function demoStart() { if (S.mode === 'lesson' || S.mode === 'match') return; S.demo = true; S.bot = true; S.botErr = 0.08; startMatch(0); S.demoEnd = S.t + 75; }
  function demoStop() { if (!S.demo) return; S.demo = false; S.bot = false; S.botErr = 0; stick.x = stick.y = 0; stick.kx = 0; api.toIntro(); }
  function demoCap() { if (!S.demo) return null; if (S.ph === 'brief') return ['', 'WATCH A MATCH AT THE GAYA OPEN'];
    if (S.ph === 'serveP') return ['1', 'YOUR SERVE: TAP 1 TO TOSS']; if (S.ph === 'toss') return ['1', 'TAP 1 AGAIN WHILE THE BAR IS GREEN'];
    if (S.ph === 'serveO' || S.ph === 'oToss') return ['', oppName() + ' SERVES. GET READY'];
    if (S.ph === 'rally' && B.hit === 'o') return PR && PR.best && PR.best.t < 0.6 ? ['1', 'PRESS 1 HIT WHEN THE RING TURNS GREEN'] : ['STICK', 'RUN TO THE BALL. THE YELLOW MARK SHOWS WHERE IT LANDS'];
    if (S.ph === 'rally') return ['', 'HOLD THE STICK LEFT OR RIGHT AS YOU HIT TO AIM']; return ['', 'FIRST TO 4 GAMES WINS THE MATCH']; }
  // ---------- lessons ----------
  function startLesson(i) { audio.init && audio.init(); stick.x = stick.y = 0; S.mode = 'lesson'; S.L = clamp(i | 0, 0, LESSONS.length - 1); S.lc = 0; S.aim = { l: 0, r: 0 }; S.lessonDone = false; S.done = null; setOpp(COACH); S.match = null; S.ph = 'brief'; S.overT = S.t + 2.2; S.next = 'feed'; call('LESSON ' + (S.L + 1) + ' · ' + LESSONS[S.L].title, 2.2); boxL.visible = boxR.visible = LESSONS[S.L].id === 'aim'; P.x = 0.6; P.z = HL - 0.5; O.x = 0; O.z = -7.5; B.live = false; B.hold = 'o'; }
  function feed() { const Lz = LESSONS[S.L]; if (Lz.feed === 'serve') { setupServe(); return; } const rally = Lz.feed === 'rally'; O.x = rally ? 0 : clamp(O.x, -1, 1); O.z = rally ? -HL - 0.4 : -7.5; P.pending = null;
    const p0 = V3(O.x - 0.2, 1.0, O.z + 0.4), tx = clamp(P.x + rr(-1.3, 1.3), -SW + 0.6, SW - 0.6), lob = Lz.feed === 'lob', tz = lob ? rr(6.4, 7.6) : rr(7.2, 9.2); swing(O, lob ? 'lob' : 'flat');
    launch(p0, tx, tz, lob ? 2.15 : rally ? 1.5 : 1.4, true, 'o', lob ? 'lob' : 'flat'); S.ph = 'rally'; pock(0.9); }
  function lessonLand() { const Lz = LESSONS[S.L], t = B.type, x = B.p.x; let ok = false, msg = '';
    if (Lz.id === 'hit' || Lz.id === 'rally') ok = true; else if (Lz.id === 'aim') { if (x < -1.2 && !S.aim.l) { S.aim.l = 1; ok = true; } else if (x > 1.2 && !S.aim.r) { S.aim.r = 1; ok = true; } else msg = S.aim.l ? 'NOW AIM RIGHT' : S.aim.r ? 'NOW AIM LEFT' : 'HOLD LEFT OR RIGHT AS YOU HIT'; }
    else if (Lz.id === 'lob') { ok = t === 'lob'; if (!ok) msg = 'IN, BUT USE 2 LOB'; } else if (Lz.id === 'smash') { ok = t === 'smash'; if (!ok) msg = 'IN, BUT USE 3 SMASH'; } else if (Lz.id === 'serve') ok = B.serve;
    if (ok) { S.lc++; tone(1175, 0.08, 0.05); setTimeout(() => tone(1568, 0.12, 0.05), 100); flash('IN! ' + Math.min(S.lc, Lz.goal) + ' / ' + Lz.goal, '#22c55e', 1.2); if (S.lc >= Lz.goal) S.lessonDone = true; } else if (msg) flash(msg, '#e6b45a', 1.5);
    if (Lz.id !== 'rally' || S.lessonDone) { B.rules = false; S.ph = 'over'; S.overT = S.t + (S.lessonDone ? 1.6 : 1.3); S.next = S.lessonDone ? 'lessonNext' : 'feed'; } }
  function lessonEnd(w, why) { const Lz = LESSONS[S.L]; S.overT = S.t + 1.4; S.next = S.lessonDone ? 'lessonNext' : 'feed';
    if (w === 'o') { if (Lz.id === 'rally' && S.lc) { flash('RALLY OVER AT ' + S.lc + ' · AGAIN', '#ff9a8a', 1.5); S.lc = 0; } else flash(why === 'MISSED' ? 'MISSED IT · AGAIN' : why === 'NET' ? 'NET · AGAIN' : why + ' · AGAIN', '#ff9a8a', 1.3); } }
  function lessonNext() { const n = S.L + 1; try { save.setStat(SK.lesson, Math.max(save.stat(SK.lesson, 0), n)); } catch (e) {} cheer(1.2);
    if (n >= LESSONS.length) { try { save.setFlag('gayaTennisLessons'); } catch (e) {} S.mode = 'done'; S.ph = 'idle'; B.live = false; boxL.visible = boxR.visible = false; S.done = { lessons: true }; return; } startLesson(n); }
  // ---------- opponent ----------
  function oppThink(dt) { const c = O.cfg, rally = S.mode === 'match' || (S.mode === 'lesson' && LESSONS[S.L].feed === 'rally');
    if (rally && S.ph === 'rally' && B.rules && B.hit === 'p' && !O.plan) { let fb = null, cp = null; simulate(3.2, (p, v, t, nb, bo) => { const tb = B.bounces + nb; if (bo && tb === 1) { fb = { x: p.x, z: p.z, out: !inCourt(p.x, p.z, B.serve, B.box, -1) }; if (fb.out) return false; } if (tb === 1 && fb && ((v.y < 0 && p.y < 1.1) || p.z < -HL - 2.6)) { cp = { x: p.x, z: p.z, t }; return false; } if (tb >= 2) return false; });
      O.plan = !B.netHit && fb && !fb.out && cp ? { at: S.t + cp.t, x: cp.x, z: cp.z, go: S.t + c.react } : { leave: true }; }
    let tx = O.x, tz = O.z; const inRally = S.ph === 'rally' || S.ph === 'over';
    if (inRally && O.plan && !O.plan.leave && S.t >= O.plan.go) { tx = O.plan.x + 0.5; tz = O.plan.z - 0.25; } else if (inRally && rally && (!O.plan || O.plan.leave)) { tx = clamp(B.p.x * 0.35, -2, 2); tz = -HL - 0.7; }
    const dx = tx - O.x, dz = tz - O.z, d = Math.hypot(dx, dz), sp = c.spd * dt; O.mv = 0; if (d > 0.04) { const k = Math.min(1, sp / d); O.x += dx * k; O.z += dz * k; O.mv = Math.min(d, sp) / dt; } O.z = clamp(O.z, -HL - 4.5, -1.2); O.x = clamp(O.x, -DW - 3, DW + 3);
    if (O.plan && !O.plan.leave && S.t >= O.plan.at) { const dd = Math.hypot(B.p.x - O.x, B.p.z - O.z); if (dd < 1.75 && B.rules && B.hit === 'p') oppShot(); O.plan = { leave: true }; }
    if (S.ph === 'serveO' && S.t >= S.srvT) { S.ph = 'oToss'; B.hold = null; B.live = true; B.rules = false; B.p.set(O.x - 0.2, 1.25, O.z + 0.25); B.v.set(0, 5.4, 0); S.srvT = S.t + 0.62; }
    if (S.ph === 'oToss' && S.t >= S.srvT) oppServe(); }
  function oppShot() { const c = O.cfg, p0 = B.p.clone(); let type = 'flat', tx, tz, T, fix = true;
    if (S.mode === 'lesson') { tx = clamp(P.x + rr(-1.5, 1.5), -SW + 0.6, SW - 0.6); tz = rr(7.4, 9.4); T = Math.hypot(tx - p0.x, tz - p0.z) / 11; }
    else { if (P.z < 7 || Math.random() < c.lob) type = 'lob'; const away = Math.random() < (c.away || 0.7) ? -Math.sign(P.x || rr(-1, 1)) : Math.sign(P.x || 1); const atk = B.q != null && B.q < 0.9; tx = away * (atk ? rr(SW - 1.4, SW - 0.35) : rr(0.6, SW - 0.55)); tz = type === 'lob' ? rr(9, 11) : rr(7, 10.6); T = type === 'lob' ? 1.95 : Math.hypot(tx - p0.x, tz - p0.z) / ((atk ? 15.5 : 12) * c.pace + rr(0, 4));
      if (Math.random() < c.err) { const r = Math.random(); if (r < 0.4) { fix = false; T *= 0.82; tz = rr(2.5, 5.5); } else if (r < 0.7) tz = HL + rr(0.4, 2); else tx = Math.sign(tx || 1) * (SW + rr(0.3, 1.4)); } }
    launch(p0, tx, tz, T, fix, 'o', type); swing(O, type); pock(0.95); }
  // ---------- player per frame ----------
  function predictPlayer() { PR = null; if (!(B.rules && B.hit === 'o' && S.ph === 'rally')) return; let best = null, fb = null, sweet = null; const lobby = B.apex > 3.4;
    simulate(2.8, (p, v, t, nb, bo) => { const tb = B.bounces + nb; if (bo && tb === 1 && !fb) fb = { x: p.x, z: p.z, out: !inCourt(p.x, p.z, B.serve, B.box, 1) }; if (tb >= 2) return false; if (p.z < 0.4) return;
      const d = Math.hypot(p.x - P.x, p.z - P.z); if (p.y < 3.8 && (!best || d < best.d)) best = { t, d, y: p.y };
      if (!sweet && ((tb === 1 && v.y < 0 && p.y < 1.15) || (lobby && tb === 0 && v.y < 0 && p.y < 2.8 && p.z > 3.5) || p.z > HL + 2.4)) sweet = { x: p.x, z: p.z, high: tb === 0 }; });
    PR = { best, fb, sweet }; }
  function movePlayer(dt) { let sx = stick.x, sy = stick.y; if (keys.has('KeyA') || keys.has('ArrowLeft')) sx = -1; if (keys.has('KeyD') || keys.has('ArrowRight')) sx = 1; if (keys.has('KeyW') || keys.has('ArrowUp')) sy = 1; if (keys.has('KeyS') || keys.has('ArrowDown')) sy = -1; stick.kx = sx;
    const serving = S.ph === 'serveP' || S.ph === 'toss', recv = S.ph === 'serveO' || S.ph === 'oToss' || S.ph === 'brief'; let vx = 0, vz = 0; const sp = 6.2;
    if (serving) { if (S.ph === 'serveP') { const side = srvSide(); P.x = clamp(P.x + sx * 3 * dt, side > 0 ? 0.3 : -SW + 0.5, side > 0 ? SW - 0.5 : -0.3); } P.mv = 0; return; }
    if (!recv) { const m = Math.hypot(sx, sy); if (m > 0.15) { vx = sx * sp; vz = -sy * sp; } else if (PR && PR.sweet && !(PR.fb && PR.fb.out)) { const tx = PR.sweet.x - 0.62, tz = clamp(PR.sweet.z + 0.25, 1.5, HL + 3), dx = tx - P.x, dz = tz - P.z, d = Math.hypot(dx, dz), a = sp * (S.mode === 'match' ? [0.64, 0.56, 0.48][S.round] : 0.66); if (d > 0.08) { vx = dx / d * Math.min(a, d / dt); vz = dz / d * Math.min(a, d / dt); } }
      else if (!PR && S.ph === 'rally' && B.hit === 'p') { const dx = clamp(B.p.x * 0.3, -2, 2) - P.x, dz = HL + 0.6 - P.z, d = Math.hypot(dx, dz); if (d > 0.1) { vx = dx / d * Math.min(3, d / dt); vz = dz / d * Math.min(3, d / dt); } } }
    P.x = clamp(P.x + vx * dt, -DW - 3, DW + 3); P.z = clamp(P.z + vz * dt, 1.2, HL + 4.5); P.mv = Math.hypot(vx, vz); }
  // ---------- camera ----------
  const CAM = { look: V3(0, 0, -3) }; camera.position.set(0, 6, HL + 9);
  function camShot() { const port = CW() < CHh(), px = S.mode === 'intro' || S.mode === 'done' ? 0 : P.x, pz = S.mode === 'intro' || S.mode === 'done' ? HL : Math.max(P.z, HL - 2); camera.fov = port ? 64 : 46;
    return port ? { pos: V3(px * 0.35, 10.6, pz + 9.4), look: V3(px * 0.15, 0, HL * 0.02) } : { pos: V3(px * 0.45, 7.6, pz + 8.6), look: V3(px * 0.2, 0, -HL * 0.02) }; }
  // ---------- frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0;
  function step(dt) { S.t += dt; S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.callT -= dt; if (S.callT <= 0) S.call = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.9; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.5 * p.life; p.s.scale.setScalar(0.2 + (1 - p.life) * 0.4); }
    if (S.cheer > 0) { S.cheer -= dt; placeCrowd(Math.min(1, S.cheer), S.t); if (S.cheer <= 0) placeCrowd(); }
    const sub = 3; if (B.live) for (let i = 0; i < sub; i++) physStep(dt / sub);
    if (B.live) { hist.push({ t: S.t, x: B.p.x, y: B.p.y, z: B.p.z }); while (hist.length && hist[0].t < S.t - 0.4) hist.shift(); }
    if (S.ph === 'toss' && S.t - S.tossT > 1.2) { S.ph = 'serveP'; B.live = false; B.hold = 'p'; flash('TOSS AGAIN', '#ffffff', 1); }
    if (S.ph === 'over' && S.t >= S.overT) { const n = S.next; S.next = ''; if (n === 'matchEnd') finishMatch(); else if (n === 'serve') setupServe(); else if (n === 'lessonNext') lessonNext(); else if (n === 'feed') feed(); else startPoint(); }
    if (S.demo && (S.t > S.demoEnd || (S.match && S.match.games[0] + S.match.games[1] >= 2 && S.ph === 'over' && S.next === 'point'))) { demoStop(); return; } if (S.ph === 'brief' && S.t >= S.overT) { if (S.mode === 'lesson') feed(); else startPoint(); }
    if (S.mode === 'lesson' || S.mode === 'match') { predictPlayer(); movePlayer(dt); oppThink(dt);
      if (P.pending && S.t >= P.pending.at) { const pd = P.pending; P.pending = null; if (B.rules && B.hit === 'o') playerShot(pd.type, pd.q, pd.grade, pd.ax); }
      if (S.bot && PR && PR.best && !P.pending && P.swingT <= 0 && PR.best.t < 0.05 && PR.best.d < REACH) { if (S.mode === 'lesson' && S.L === 1) stick.kx = S.aim.l ? 1 : -1; } if (S.bot && PR && PR.best && !P.pending && P.swingT <= 0 && PR.best.t < 0.05 + (S.botOff || 0) && PR.best.d < REACH) press(S.L === 3 && S.mode === 'lesson' ? 'smash' : S.mode === 'lesson' && S.L === 2 ? 'lob' : PR.best.y > 2.2 ? 'smash' : 'flat');
      if (S.bot && S.ph === 'serveP' && S.t > (S.botT || 0)) { S.botT = S.t + 0.5; press('flat'); } if (S.bot && S.ph === 'toss' && meterV() >= 0.7) press('flat');
      }
    if (B.hold === 'p') B.p.set(P.x + 0.3, 0.9, P.z - 0.1); else if (B.hold === 'o') B.p.set(O.x - 0.3, 0.9, O.z + 0.1);
    // place foxes
    P.f.position.set(P.x, 0, P.z); O.f.position.set(O.x, 0, O.z); const pYaw = Math.PI + (P.swingT > 0 && P.swingType === 'flat' ? (0.32 - P.swingT) * 2.2 - 0.35 : 0); P.f.rotation.y = damp(P.f.rotation.y, pYaw, 14, dt); O.f.rotation.y = damp(O.f.rotation.y, 0, 14, dt);
    kit.animFox && (kit.animFox(P.f, dt, P.mv), kit.animFox(O.f, dt, O.mv), kit.animFox(deuce, dt, 0)); poseSwing(P, dt); poseSwing(O, dt);
    deuce.rotation.y = -Math.PI / 2 + clamp(B.p.z * 0.04, -0.5, 0.5);
    // ball, shadow, ring, landing marker
    ballM.position.copy(B.p); ballM.visible = B.live || !!B.hold; shadowM.visible = ballM.visible && B.live; shadowM.position.set(B.p.x, 0.012, B.p.z); shadowM.scale.setScalar(1 + B.p.y * 0.12); shadowM.material.opacity = Math.max(0.12, 0.42 - B.p.y * 0.05);
    const bt = PR && PR.best; if (bt && bt.t < 1.0 && bt.d < 3) { const t = bt.t, reach = bt.d < REACH, green = t < 0.09 && reach; ringO.visible = ringI.visible = true; ringO.position.copy(B.p); ringI.position.copy(B.p); ringO.quaternion.copy(camera.quaternion); ringI.quaternion.copy(camera.quaternion); ringO.scale.setScalar(1 + t * 4.2); ringO.material.color.set(!reach ? 0xff6a5a : green ? 0x22c55e : 0xffd23a); ringI.material.color.set(green ? 0x22c55e : 0xffffff); }
    else ringO.visible = ringI.visible = false;
    if (PR && PR.fb && B.bounces === 0) { markR.visible = true; markR.position.set(PR.fb.x, 0.02, PR.fb.z); markR.material.color.set(PR.fb.out ? 0xff6a5a : 0xffd23a); markR.scale.setScalar(1 + Math.sin(S.t * 10) * 0.08); } else markR.visible = false;
    for (const b of [boxL, boxR]) if (b.visible) b.material.opacity = 0.2 + Math.sin(S.t * 4) * 0.08 + ((b === boxL ? S.aim.l : S.aim.r) ? 0.25 : 0);
    // board
    const M0 = S.match; drawBoard(M0 ? { title: O.cfg.round + ' · THE GAYA OPEN', lines: [{ name: 'BEN', g: String(M0.games[0]), p: M0.pts[0] >= 3 && M0.pts[1] >= 3 ? (M0.pts[0] > M0.pts[1] ? 'AD' : '40') : PTS[Math.min(3, M0.pts[0])], serve: M0.server === 'p' }, { name: O.cfg.name, g: String(M0.games[1]), p: M0.pts[0] >= 3 && M0.pts[1] >= 3 ? (M0.pts[1] > M0.pts[0] ? 'AD' : '40') : PTS[Math.min(3, M0.pts[1])], serve: M0.server === 'o' }] } : { title: 'THE GAYA OPEN', lines: [{ name: S.mode === 'lesson' ? 'LESSONS' : 'WELCOME', g: '', p: '' }, { name: 'UMPIRE DEUCE', g: '', p: '' }] });
    const sh = camShot(); camera.updateProjectionMatrix(); camera.position.lerp(sh.pos, Math.min(1, dt * 3)); CAM.look.lerp(sh.look, Math.min(1, dt * 3)); camera.lookAt(CAM.look); }
  function frame() { raf = requestAnimationFrame(frame); { const pr = renderer.getPixelRatio(); if (Math.abs(renderer.domElement.width - Math.round(CW() * pr)) > 1 || Math.abs(renderer.domElement.height - Math.round(CHh() * pr)) > 1) onRs(); } const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh(), false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  const KMAP = { Digit1: 'flat', KeyJ: 'flat', Digit2: 'lob', KeyK: 'lob', Space: 'smash', Digit3: 'smash', KeyL: 'smash' };
  const onKD = e => { if (KMAP[e.code]) { e.preventDefault(); if (!e.repeat && !S.demo) press(KMAP[e.code]); return; } keys.add(e.code); }, onKU = e => keys.delete(e.code); addEventListener('keydown', onKD); addEventListener('keyup', onKU); const onBlur = () => keys.clear(); addEventListener('blur', onBlur);
  function hud() { const M0 = S.match, Lz = S.mode === 'lesson' ? LESSONS[S.L] : null;
    const quest = S.mode === 'match' ? (O.cfg.round + ' · VS ' + O.cfg.name + ' · GAMES ' + M0.games[0] + '–' + M0.games[1] + ' · ' + (scoreTxt() || '0–0') + (M0.server === 'p' ? ' · YOUR SERVE' : '')) : Lz ? 'LESSON ' + (S.L + 1) + ' / ' + LESSONS.length + ' · ' + Lz.title + ' · ' + Math.min(S.lc, Lz.goal) + ' / ' + Lz.goal : 'THE GAYA OPEN · LESSONS, THEN 3 ROUNDS';
    return { mode: S.mode, ph: S.ph, quest, flash: S.flash, call: S.call, done: S.done, lesson: Lz ? { n: S.L + 1, of: LESSONS.length, title: Lz.title, text: Lz.text, c: Math.min(S.lc, Lz.goal), goal: Lz.goal } : null,
      netY: (() => { const v = V3(0, NH * 0.55, 0).project(camera); return clamp((1 - v.y) / 2, 0.08, 0.9); })(), meter: S.ph === 'toss' ? { v: meterV() } : null, serveP: S.ph === 'serveP', receiving: S.ph === 'serveO' || S.ph === 'oToss', match: M0 ? { opp: O.cfg.name, round: O.cfg.round, games: M0.games.slice(), score: scoreTxt(), serveN: M0.serveN, server: M0.server } : null,
      demo: S.demo ? demoCap() : null, prog: { lesson: save.stat(SK.lesson, 0), lessons: LESSONS.length, round: save.stat(SK.round, 0), unlocked: !!save.flag('gayaTennisLessons'), champ: !!save.flag('gayaOpenWon') }, opps: OPP.map(o => ({ name: o.name, round: o.round, gold: o.gold })), gold: save.data.gold }; }
  frame();
  const api = { startLesson, startMatch, demoStart, demoStop, toIntro() { S.demo = false; S.bot = false; S.mode = 'intro'; S.ph = 'idle'; S.done = null; S.match = null; B.live = false; B.hold = null; boxL.visible = boxR.visible = false; P.x = 0.9; P.z = HL + 0.4; setOpp(OPP[0]); O.x = 0; O.z = -HL - 0.6; },
    melee() { if (!S.demo) press('flat'); }, range() { if (!S.demo) press('lob'); }, jump() { if (!S.demo) press('smash'); }, meleeUp() {}, setStick(x, y) { stick.x = x; stick.y = y; }, setPaused(v) { PAUSE = !!v; }, setHudPad() {},
    start() {}, talk() {}, choose() {}, closeDialog() {}, nextLine() {}, clearToast() {}, useItem() { flash('SAVE IT FOR AFTER THE MATCH', '#ffffff', 1.2); }, closeWheel() {}, skipTime() {}, eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy() {}, zoomBy() {}, getCam() { return { dist: 13, pitch: 0.38 }; }, setCam() {}, setMinimap() {}, toggleSound() {}, cycleWeather() {},
    mapData() { return { p: [P.x, P.z, Math.PI], b: [['NET', 0, 0], ['UMPIRE', DW + 1.7, 0], ['ROYAL BOX', 0, -wallZ - 3]], f: [[O.x, O.z]], e: [], q: null }; },
    hud, _bot(v = true, err = 0) { S.bot = !!v; S.botErr = err; }, _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _sim(n, cb, dt = 1 / 30) { for (let i = 0; i < n; i++) { step(dt); if (cb && cb(S, i) === false) break; } renderer.render(scene, camera); onState(hud()); }, _dbg: () => ({ PR, stick: { ...stick }, keys: [...keys] }), _state: () => S, _B: B, _P: P, _O: O,
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
