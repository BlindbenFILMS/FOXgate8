// 8 GATES — KUFA · THE CISTERN CUP [kufaStadium]. 3 v 3 soccer on the shared Game HUD (vehicle "soccer": 1 SHOOT · 2 PASS · 3 TACKLE).
// Ben's answers: shootout lessons with MASTER FARUQ first, then a 3-round cup of small matches. Side-on TV camera. Always Ben (teammates HADI + NASRIN play themselves),
// automatic keepers (BAHRI keeps for Ben). Shots use the green timing ring (the dribble touch); penalties use a power bar. One 3-minute game; a draw goes to penalties
// (you shoot with the power bar, you keep goal with 3 + the stick). Rounds: QASIM'S WATER CREW · GHAZI'S CARAVAN · FARUQ'S WATCH. Prize: CISTERN CUP relic.
// Save keys kufa.soccer.*, flags kufaSoccerLessons / kufaCupWon.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage } from '../../engine/restaurant-kit.js';

const PW = 19, PH = 11, GW = 2.7, GH = 2.2, BR = 0.17, G = 9.8, MATCH_T = 180, SPOT = PW - 6.5;
export const TEAMS = [
  { id: 'water', name: "QASIM'S WATER CREW", short: 'WATER CREW', capt: 'QASIM', round: 'ROUND 1', spd: 5.9, tackle: 1.3, shoot: 0.7, keep: 5.2, pen: 0.35, gold: 30, kit: ['#e2453f', '#fbf8ec', '#a82c26'], fur: ['#c9682a', '#e6e4de', '#9a6f4a'] },
  { id: 'caravan', name: "GHAZI'S CARAVAN", short: 'CARAVAN', capt: 'GHAZI', round: 'SEMI-FINAL', spd: 6.4, tackle: 1.7, shoot: 0.82, keep: 6.2, pen: 0.45, gold: 50, kit: ['#e2453f', '#fbf8ec', '#a82c26'], fur: ['#9a6f4a', '#f0dcbe', '#3a3836'] },
  { id: 'watch', name: "FARUQ'S WATCH", short: 'THE WATCH', capt: 'FARUQ', round: 'FINAL', spd: 6.9, tackle: 2.1, shoot: 0.92, keep: 7.2, pen: 0.58, gold: 150, kit: ['#e2453f', '#fbf8ec', '#a82c26'], fur: ['#e6e4de', '#3a3836', '#c9682a'] }];
const COACH = { id: 'faruq', name: 'MASTER FARUQ', short: 'FARUQ', capt: 'FARUQ', spd: 3.6, tackle: 0, shoot: 0.5, keep: 3.0, pen: 0.3, kit: ['#201e1d', '#f2c94c', '#0b0a0a'], fur: ['#e6e4de', '#e6e4de', '#e6e4de'] };
export const LESSONS = [
  { id: 'dribble', title: 'DRIBBLE', goal: 3, text: 'Run with the ball through the 3 glowing gates. The ball stays at your feet.' },
  { id: 'pass', title: 'PASS', goal: 3, text: 'Press 2 to pass to Hadi. He plays it back. 3 good passes.' },
  { id: 'shoot', title: 'SHOOT', goal: 2, text: 'The ring around the ball shrinks with every touch. Press 1 SHOOT when it is GREEN. Stick up or down picks the corner. Score 2.' },
  { id: 'tackle', title: 'TACKLE', goal: 2, text: 'Faruq has the ball. Run at him and press 3 to slide in. Win it 2 times.' },
  { id: 'pen', title: 'PENALTY', goal: 2, text: 'Aim with the stick. Press 1 to start the power, then 1 again in the GREEN. Score 2.' },
  { id: 'keep', title: 'KEEPER', goal: 2, text: 'Now you keep goal. Watch which way Faruq leans, hold the stick that way and press 3 to dive. Save 2.' }];
const SK = { lesson: 'kufa.soccer.lesson', round: 'kufa.soccer.round', wins: 'kufa.soccer.wins' };
const CROWD = ['#e2453f', '#3a6ea5', '#f2c94c', '#fbf8ec', '#2f9a8f', '#e8792e', '#201e1d', '#a8792e', '#f07a72'], FURS = ['#e8792e', '#c9682a', '#9a6f4a', '#e6e4de', '#3a3836', '#f0dcbe'];

export async function createSoccer({ container, onState = () => {} }) {
  const ST = createStage(container, { bg: '#f2d9a8' }), { CW, CHh, renderer, scene, camera, V3, toon, M, kit, audio, tone, puff, smokeS, sun, glowTex, touch } = ST;
  camera.far = 170; camera.updateProjectionMatrix();
  scene.background = canvasTex(4, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#6aa8d8'); g.addColorStop(0.6, '#e8d2a0'); g.addColorStop(1, '#f6e6c4'); c.fillStyle = g; c.fillRect(0, 0, 4, 256); });
  sun.position.set(-10, 24, 14); Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 16, bottom: -16, far: 80 }); sun.shadow.camera.updateProjectionMatrix();
  // ---------- stadium ----------
  const flat = (w, d, col, x, z, y = 0.004) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), col.isMaterial ? col : toon(col)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; scene.add(m); return m; };
  flat(200, 200, '#d9b57a', 0, 0, 0); flat(2 * PW + 12, 2 * PH + 12, '#b5543a', 0, 0, 0.002);
  const grassT = canvasTex(512, 256, c => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#7f9e48' : '#8aa952'; c.fillRect(i * 64, 0, 64, 256); } c.fillStyle = 'rgba(200,170,100,0.18)'; for (let i = 0; i < 90; i++) c.fillRect((i * 97) % 512, (i * 53) % 256, 14, 6); });
  flat(2 * PW + 3, 2 * PH + 3, new THREE.MeshToonMaterial({ map: grassT, gradientMap: ST.grad }), 0, 0, 0.004);
  const lineM = new THREE.MeshBasicMaterial({ color: 0xfbf8ec }), ln = (x0, z0, x1, z1) => flat(Math.max(0.12, Math.abs(x1 - x0)), Math.max(0.12, Math.abs(z1 - z0)), lineM, (x0 + x1) / 2, (z0 + z1) / 2, 0.008);
  for (const s of [-1, 1]) { ln(-PW, s * PH, PW, s * PH); ln(s * PW, -PH, s * PW, PH); ln(s * (PW - 5.5), -6, s * (PW - 5.5), 6); ln(s * PW, -6, s * (PW - 5.5), -6); ln(s * PW, 6, s * (PW - 5.5), 6); const sp = flat(0.3, 0.3, lineM, s * SPOT, 0, 0.009); }
  ln(0, -PH, 0, PH); { const ring = new THREE.Mesh(new THREE.RingGeometry(3.3, 3.45, 48), lineM); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.009; scene.add(ring); const cis = M(new THREE.TorusGeometry(1.1, 0.16, 8, 30), toon('#a89a80'), 0, 0.02, 0, scene, 0.01); cis.rotation.x = Math.PI / 2; cis.scale.z = 0.4; const cap = new THREE.Mesh(new THREE.CircleGeometry(1.0, 28), toon('#6a8aa0')); cap.rotation.x = -Math.PI / 2; cap.position.y = 0.012; scene.add(cap); }
  // goals: posts, bar, net box
  const netT = canvasTex(256, 128, c => { c.clearRect(0, 0, 256, 128); c.strokeStyle = 'rgba(250,248,240,0.9)'; c.lineWidth = 2; for (let x = 0; x <= 256; x += 10) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 128); c.stroke(); } for (let y = 0; y <= 128; y += 10) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); } });
  const netM = new THREE.MeshBasicMaterial({ map: netT, transparent: true, side: THREE.DoubleSide, depthWrite: false }), postM = toon('#fbf8ec'), goals = [];
  for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * PW, 0, 0); scene.add(g); for (const z of [-GW, GW]) M(new THREE.CylinderGeometry(0.08, 0.08, GH, 10), postM, 0, GH / 2, z, g, 0.012, 0.08); M(new THREE.BoxGeometry(0.16, 0.16, GW * 2 + 0.16), postM, 0, GH, 0, g, 0.012);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(GW * 2, GH), netM); back.rotation.y = Math.PI / 2; back.position.set(s * 1.4, GH / 2, 0); g.add(back); const top = new THREE.Mesh(new THREE.PlaneGeometry(1.4, GW * 2), netM); top.rotation.x = -Math.PI / 2; top.position.set(s * 0.7, GH, 0); g.add(top);
    const sides = []; for (const z of [-GW, GW]) { const sd = new THREE.Mesh(new THREE.PlaneGeometry(1.4, GH), netM); sd.position.set(s * 0.7, GH / 2, z); g.add(sd); sides.push(sd); } goals.push({ g, back, nets: [back, top, ...sides] }); }
  // boards round the pitch (the ball bounces off them), stands, crowd, palms
  const boardT = canvasTex(1024, 96, c => { c.fillStyle = '#a8792e'; c.fillRect(0, 0, 1024, 96); c.font = '900 54px Archivo, "Arial Black", Arial'; c.textBaseline = 'middle'; c.fillStyle = '#fbf8ec'; c.font = '900 46px Archivo, "Arial Black", Arial'; for (let i = 0; i < 2; i++) c.fillText('THE CISTERN CUP', 40 + i * 512, 50); c.fillStyle = '#201e1d'; c.fillRect(0, 0, 1024, 6); c.fillRect(0, 90, 1024, 6); }); boardT.wrapS = THREE.RepeatWrapping;
  for (const [x, z, w, ry] of [[0, -PH - 1.4, PW * 2 + 2.8, 0], [0, PH + 1.4, PW * 2 + 2.8, Math.PI], [-PW - 2.6, 0, PH * 2 + 2.8, Math.PI / 2], [PW + 2.6, 0, PH * 2 + 2.8, -Math.PI / 2]]) { const t = boardT.clone(); t.needsUpdate = true; t.repeat.set(w / 14, 1); const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, 0.12), [toon('#7a5a3a'), toon('#7a5a3a'), toon('#7a5a3a'), toon('#7a5a3a'), new THREE.MeshToonMaterial({ map: t, gradientMap: ST.grad }), toon('#7a5a3a')]); m.position.set(x, 0.4, z); m.rotation.y = ry; scene.add(m); }
  const seats = [], ROWS = touch ? 7 : 9, stone = toon('#c9a26a'), stone2 = toon('#b8925c');
  const stand = (cx, cz, len, ry) => { const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = ry; scene.add(g); for (let r = 0; r < ROWS; r++) { const h = 0.6 + r * 0.6, m = new THREE.Mesh(new THREE.BoxGeometry(len, h, 1), r % 2 ? stone : stone2); m.position.set(0, h / 2, -(r + 0.5)); m.receiveShadow = true; g.add(m); for (let x = -len / 2 + 0.4; x < len / 2 - 0.3; x += 0.62) if (Math.random() < 0.84) seats.push({ g, x: x + rr(-0.06, 0.06), y: h, z: -(r + 0.5) }); } return g; };
  stand(0, -PH - 6.5, PW * 2 + 8, 0); stand(-PW - 7.5, 0, PH * 2 + 6, Math.PI / 2); stand(PW + 7.5, 0, PH * 2 + 6, -Math.PI / 2);
  const crowdB = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.5, 0.3), new THREE.MeshToonMaterial({ gradientMap: ST.grad }), seats.length), crowdH = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 8, 6), new THREE.MeshToonMaterial({ gradientMap: ST.grad }), seats.length), dm = new THREE.Object3D(), cc = new THREE.Color();
  const crowdPos = seats.map(s => { s.g.updateMatrixWorld(); return V3(s.x, s.y, s.z).applyMatrix4(s.g.matrixWorld); });
  const placeCrowd = (jump = 0, t = 0) => { crowdPos.forEach((p, i) => { const j = jump ? Math.max(0, Math.sin(t * 14 + i * 1.7)) * jump * 0.35 : 0; dm.position.set(p.x, p.y + 0.25 + j, p.z); dm.updateMatrix(); crowdB.setMatrixAt(i, dm.matrix); dm.position.y = p.y + 0.66 + j; dm.updateMatrix(); crowdH.setMatrixAt(i, dm.matrix); }); crowdB.instanceMatrix.needsUpdate = crowdH.instanceMatrix.needsUpdate = true; };
  crowdPos.forEach((p, i) => { crowdB.setColorAt(i, cc.set(pick(CROWD))); crowdH.setColorAt(i, cc.set(pick(FURS))); }); placeCrowd(); scene.add(crowdB, crowdH);
  for (const [x, z] of [[-PW - 14, -PH - 14], [-6, -PH - 17], [9, -PH - 16.5], [PW + 14, -PH - 13], [-PW - 15, PH + 6], [PW + 15, PH + 7]]) { const p = new THREE.Group(); p.position.set(x, 0, z); scene.add(p); M(new THREE.CylinderGeometry(0.28, 0.4, 9, 7), toon('#8a6a42'), 0, 4.5, 0, p, 0); for (let i = 0; i < 7; i++) { const l = M(new THREE.BoxGeometry(3.6, 0.1, 0.9), toon('#5f8a3a'), 0, 9, 0, p, 0); l.rotation.y = i * 0.9; l.rotation.z = -0.35; l.position.set(Math.cos(i * 0.9) * 1.4, 8.7, -Math.sin(i * 0.9) * 1.4); } }
  const sbCanvas = document.createElement('canvas'); sbCanvas.width = 512; sbCanvas.height = 192; const sbT = new THREE.CanvasTexture(sbCanvas); sbT.colorSpace = THREE.SRGBColorSpace;
  { const sb = new THREE.Mesh(new THREE.PlaneGeometry(8, 3), new THREE.MeshBasicMaterial({ map: sbT })); sb.position.set(0, 10.4, -PH - 15.5); scene.add(sb); M(new THREE.BoxGeometry(8.4, 3.4, 0.3), toon('#201e1d'), 0, 10.4, -PH - 15.7, scene, 0.02); M(new THREE.BoxGeometry(0.3, 6, 0.3), toon('#5a646d'), 0, 6, -PH - 15.8, scene, 0); }
  let sbKey = ''; const drawBoard = (title, a, b, mid) => { const k = title + a + b + mid; if (k === sbKey) return; sbKey = k; const c = sbCanvas.getContext('2d'); c.fillStyle = '#0b0a0a'; c.fillRect(0, 0, 512, 192); c.fillStyle = '#f2c94c'; c.font = '900 24px Archivo, Arial'; c.fillText(title, 18, 32); c.fillRect(0, 46, 512, 4); c.fillStyle = '#fbf8ec'; c.font = '900 40px Archivo, Arial'; c.fillText(a, 18, 104); c.fillText(b, 18, 164); c.fillStyle = '#f2c94c'; c.font = '900 64px Archivo, Arial'; c.fillText(mid, 380, 140); sbT.needsUpdate = true; };
  // lesson gates
  const gates = [[-6, 3], [2, -3], [10, 2.5]].map(([x, z]) => { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); for (const dz of [-1.4, 1.4]) M(new THREE.ConeGeometry(0.28, 0.7, 10), toon('#ec3013'), 0, 0.35, dz, g, 0.012); const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.8), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.35, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.02; g.add(glow); g.visible = false; return { g, glow, x, z }; });
  // ---------- players ----------
  const strip = (f, sc = 0.78) => { const P0 = f.userData.P; if (P0.sword) P0.sword.visible = false; if (P0.gun) P0.gun.visible = false; f.scale.setScalar(sc); scene.add(f); return f; };
  const mkFox = (torso, fur, outfit = 'tee') => { const f = strip(kit.makeFox({ ...CAST.player, look: fur ? { ...CAST.player.look, fur, furDark: new THREE.Color(fur).multiplyScalar(0.7).getStyle() } : CAST.player.look, torso, outfit, crest: '', gear: 'none', mood: 'happy' })); f.userData.wagMul = 0.4; return f; };
  const HOME = ['#fbf8ec', '#fbf8ec', '#d7d2c8'], mkP = (team, name, f, ben = false) => ({ team, name, f, ben, x: 0, z: 0, vx: 0, vz: 0, face: team ? -Math.PI / 2 : Math.PI / 2, dPh: 0, kickT: 0, stun: 0, slide: 0, burst: 0, burstCd: 0, on: true, hx: 0, hz: 0, mv: 0 });
  const ben = mkP(0, 'BEN', mkFox(HOME, null), true), mates = [mkP(0, 'HADI', mkFox(HOME, '#9a6f4a')), mkP(0, 'NASRIN', mkFox(HOME, '#f0dcbe'))];
  const oppFoxes = [...TEAMS, COACH].map(t => [0, 1, 2].map(i => { const f = mkFox(t.kit, t.fur[i]); f.visible = false; return f; }));
  const opps = [0, 1, 2].map(i => mkP(1, '', oppFoxes[0][i]));
  const keepers = [mkP(0, 'BAHRI', mkFox(['#2f9a8f', '#fbf8ec', '#1f6a62'], '#c9682a')), mkP(1, 'KEEPER', mkFox(['#a78bfa', '#fbf8ec', '#5b21b6'], '#9a9a9e'))]; keepers.forEach((k, i) => { k.keeper = true; k.x = i ? PW - 0.5 : -PW + 0.5; });
  const outfield = () => [ben, ...mates, ...opps].filter(p => p.on), everyone = () => [...outfield(), ...keepers.filter(k => k.on)];
  // ---------- ball + markers ----------
  const ballM = M(new THREE.SphereGeometry(BR, 16, 12), new THREE.MeshToonMaterial({ gradientMap: ST.grad, map: canvasTex(128, 64, c => { c.fillStyle = '#fbf8ec'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#201e1d'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(10 + i * 22, i % 2 ? 18 : 44, 8, 0, 7); c.fill(); } }) }), 0, BR, 0, scene, 0.012, BR);
  const shadowM = new THREE.Mesh(new THREE.CircleGeometry(BR * 1.3, 16), new THREE.MeshBasicMaterial({ color: 0x2a1a08, transparent: true, opacity: 0.4, depthWrite: false })); shadowM.rotation.x = -Math.PI / 2; scene.add(shadowM);
  const ovl = (geo, col, op = 1) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthTest: false, depthWrite: false, side: THREE.DoubleSide })); m.renderOrder = 60; m.visible = false; scene.add(m); return m; };
  const gRing = (r0, r1, col, op) => { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })); m.rotation.x = -Math.PI / 2; m.renderOrder = 1; m.visible = false; scene.add(m); return m; };
  const ringO = gRing(0.46, 0.52, 0xffd23a, 0.55), ringI = gRing(0.46, 0.49, 0xffffff, 0.45), benMark = gRing(0.6, 0.68, 0xffd23a, 0.5);
  const reticle = ovl(new THREE.RingGeometry(0.22, 0.32, 28), 0xffd23a); reticle.rotation.y = Math.PI / 2;
  const B = { x: 0, y: BR, z: 0, vx: 0, vy: 0, vz: 0, owner: null, last: null, shot: null, live: true, net: false, spin: 0 };
  // ---------- state ----------
  const S = { mode: 'intro', ph: 'idle', t: 0, clock: MATCH_T, score: [0, 0], team: TEAMS[0], round: 0, L: 0, lc: 0, gate: 0, lessonDone: false, flash: null, flashT: 0, call: '', callT: 0, overT: 0, next: '', done: null, cheer: 0, bot: false, demo: false, pen: null, so: null, kickoff: 0, celebrate: 0 };
  const stick = { x: 0, y: 0 }, keys = new Set(); let PAUSE = false, ORIENT = 'behind'; const behind = () => ORIENT === 'behind' && !S.pen && (S.mode === 'lesson' || S.mode === 'match'), vert = () => !S.pen && (behind() || (ORIENT === 'ns' && CW() < CHh()));
  const wStick = (sx, sy) => vert() ? { x: sy, z: sx } : { x: sx, z: -sy };
  const flash = (txt, col = '#ffd23a', t = 1.3) => { S.flash = { txt, col }; S.flashT = t; }, call = (txt, t = 2.2) => { S.call = txt; S.callT = t; };
  const cheer = (n = 1.6) => { S.cheer = n; try { for (let i = 0; i < 6; i++) setTimeout(() => audio.burst && audio.burst(0.28, 1500 + Math.random() * 1200, 0.09), i * 130); } catch (e) {} };
  const thump = (k = 1) => { tone(110 * k, 0.06, 0.07, 'sine'); tone(220 * k, 0.04, 0.03, 'triangle'); }, whistle = (n = 1) => { for (let i = 0; i < n; i++) setTimeout(() => tone(2600, 0.18, 0.05, 'sine'), i * 240); };
  function setTeam(t, lesson = false) { S.team = t; const fi = t === COACH ? 3 : TEAMS.indexOf(t); oppFoxes.flat().forEach(f => f.visible = false); opps.forEach((p, i) => { p.f = oppFoxes[fi][i]; p.name = i === 0 ? t.capt : t.short + ' ' + (i + 1); p.on = !lesson || i === 0; p.f.visible = p.on; }); mates[1].on = !lesson; mates[1].f.visible = !lesson; keepers[1].name = lesson ? 'KEEPER' : t.short + ' KEEPER'; }
  // ---------- ball ----------
  const kick = (p, vx, vz, vy = 0, shot = null) => { B.owner = null; B.last = p; B.vx = vx; B.vz = vz; B.vy = vy; B.shot = shot; p.kickT = 0.35; thump(shot ? 1.2 : 0.9); };
  function ballStep(dt) { if (B.owner) { const p = B.owner, f = 0.5 + 0.13 * Math.sin(p.dPh * Math.PI * 2); B.x = p.x + Math.sin(p.face) * f; B.z = p.z + Math.cos(p.face) * f; B.y = BR; B.vx = p.vx; B.vz = p.vz; B.vy = 0; B.spin += Math.hypot(p.vx, p.vz) * dt * 4; return; }
    B.vy -= G * dt; B.x += B.vx * dt; B.y += B.vy * dt; B.z += B.vz * dt; B.spin += Math.hypot(B.vx, B.vz) * dt * 4;
    if (B.y < BR) { B.y = BR; if (B.vy < -1) { B.vy = -B.vy * 0.45; if (B.vy > 2.5) tone(160, 0.03, 0.025, 'sine'); } else B.vy = 0; } if (B.y <= BR + 0.01) { const k = Math.exp(-1.05 * dt); B.vx *= k; B.vz *= k; }
    if (Math.abs(B.z) > PH + 0.9) { B.z = Math.sign(B.z) * (PH + 0.9); B.vz *= -0.6; thump(0.6); }
    if (Math.abs(B.x) > PW && !B.net) { if (Math.abs(B.z) < GW - BR && B.y < GH - BR) { B.net = true; onGoal(B.x > 0 ? 0 : 1); } else if (Math.abs(B.x) > PW + 1.9) { B.x = Math.sign(B.x) * (PW + 1.9); B.vx *= -0.6; thump(0.6); if (B.shot) { if (S.mode === 'lesson') lessonShotEnd('WIDE'); B.shot = null; } } }
    if (B.net) { const s = Math.sign(B.x); if (Math.abs(B.x) > PW + 1.3) { B.x = s * (PW + 1.3); B.vx = 0; B.vz *= 0.5; } } }
  function pickups() { if (B.owner || B.net || S.ph !== 'play') return; for (const p of everyone()) { if (p.stun > 0 || p.kickT > 0) continue; const d = Math.hypot(p.x - B.x, p.z - B.z), sp = Math.hypot(B.vx, B.vz); const r = p.keeper ? 1.0 : 0.62;
      if (d < r && B.y < (p.keeper ? 2.3 : 0.7) && (sp < 15 || p.keeper)) { if (p.keeper && B.shot && B.shot.team !== p.team) onSave(p); B.owner = p; B.shot = null; p.dPh = 0; if (p.keeper) p.holdT = 0.8; if (p.ben) tone(660, 0.04, 0.04); return; } } }
  // ---------- goals / saves ----------
  function onGoal(team) { B.shot = null; if (S.mode === 'lesson') return lessonShotEnd('GOAL'); if (S.ph !== 'play') return; S.score[team]++; S.ph = 'goal'; S.overT = S.t + 2.6; S.next = 'kickoff'; S.kickTeam = 1 - team; whistle(1);
    if (team === 0) { cheer(2.4); flash('GOAL!', '#22c55e', 2); call('GOAL · ' + (B.last && B.last.team === 0 ? B.last.name : 'BEN\'S EIGHT') + ' · ' + S.score[0] + '–' + S.score[1], 2.6); } else { flash(S.team.short + ' SCORE', '#ff9a8a', 2); call(S.team.short + ' · ' + S.score[0] + '–' + S.score[1], 2.6); tone(196, 0.3, 0.05, 'sine'); } }
  function onSave(k) { if (S.mode === 'lesson') { lessonShotEnd('SAVED'); return; } flash(k.team === 0 ? 'BAHRI SAVES!' : 'SAVED', k.team === 0 ? '#22c55e' : '#ff9a8a', 1.2); if (k.team === 0) cheer(0.8); }
  // ---------- Ben's actions ----------
  function incoming() { if (B.owner || B.net || S.ph !== 'play' || S.pen || ben.stun > 0) return null; const dx = ben.x - B.x, dz = ben.z - B.z, v2 = B.vx * B.vx + B.vz * B.vz; if (v2 < 9) return null;
    const t = (dx * B.vx + dz * B.vz) / v2; if (t < -0.25 || t > 1.1) return null; const cx = B.x + B.vx * t - ben.x, cz = B.z + B.vz * t - ben.z, d = Math.hypot(cx, cz); if (d > 1.6 || B.y > 2.2) return null; return { t, d }; }
  function firstTime(n, inc) { const a = Math.abs(inc.t), q = a < 0.075 ? 1 : a < 0.16 ? 0.72 : 0.42, go = () => { if (B.owner || B.net) return; B.x = ben.x + Math.sin(ben.face) * 0.45; B.z = ben.z + Math.cos(ben.face) * 0.45; B.y = BR; if (n === 1) { benShoot(Math.min(1, q + 0.1)); if (q >= 1) flash('FIRST-TIME STRIKE!', '#22c55e', 1); } else { benPass(); flash(q >= 1 ? 'ONE-TOUCH PASS' : 'PASS', q >= 1 ? '#22c55e' : '#ffffff', 0.8); } };
    if (inc.t > 0.02) S.firstT = { at: S.t + inc.t, go }; else go(); }
  const ringDt = p => { const ph = p.dPh % 1; return Math.min(ph, 1 - ph) * 0.55; };
  function press(n) { if (PAUSE || (S.mode !== 'lesson' && S.mode !== 'match')) return; try { audio.init && audio.init(); } catch (e) {}
    if (S.pen) return penPress(n); if (S.ph !== 'play') return; const p = ben; if (p.stun > 0) return;
    const inc = B.owner !== p ? incoming() : null; if ((n === 1 || n === 2) && inc) { firstTime(n, inc); return; }
    if (n === 1) { if (B.owner !== p) { flash('GET THE BALL FIRST', '#ffffff', 0.9); return; } const dt = ringDt(p), q = dt < 0.075 ? 1 : dt < 0.15 ? 0.72 : 0.42; benShoot(q); }
    else if (n === 2) { if (B.owner === p) benPass(); else { const m = mates.find(m => B.owner === m); if (m) { passTo(m, ben); flash('CALLED FOR IT', '#ffffff', 0.8); } } }
    else if (n === 3) { if (B.owner === p) { if (p.burstCd <= 0) { p.burst = 0.6; p.burstCd = 2; tone(880, 0.05, 0.04); } } else if (p.slide <= 0 && !(p.slideCd > S.t)) { p.slide = 0.42; p.slideCd = S.t + 1.1; tone(140, 0.12, 0.04, 'triangle'); } } }
  function benShoot(q) { const p = ben, gx = PW + 0.3, wz = S.bot ? 0 : wStick(stick.x, stick.y).z, side = Math.abs(wz) > 0.3 ? Math.sign(wz) : (Math.random() < 0.5 ? -1 : 1), d = Math.hypot(gx - B.x, B.z);
    let tz = side * (q >= 1 ? GW - 0.4 : GW - 0.95) + (1 - q) * rr(-2.4, 2.4), ty = q >= 1 ? rr(0.35, 1.5) : rr(0.2, 1.9 + (1 - q) * 1.4); const sp = (16 + 9 * q) * (d > 24 ? 0.85 : 1), T = Math.hypot(gx - B.x, tz - B.z) / sp;
    kick(p, (gx - B.x) / T, (tz - B.z) / T, (ty - B.y + 0.5 * G * T * T) / T, { team: 0, q }); flash(q >= 1 ? 'PERFECT SHOT!' : q > 0.7 ? 'GOOD SHOT' : 'MIS-HIT', q >= 1 ? '#22c55e' : q > 0.7 ? '#ffffff' : '#e6b45a', 0.9); if (d > 24 && q < 1) flash('LONG RANGE', '#e6b45a', 0.9); }
  function passTo(from, to) { const lead = 0.35, tx = to.x + to.vx * lead, tz = to.z + to.vz * lead, d = Math.hypot(tx - B.x, tz - B.z), sp = clamp(d * 1.6 + 6, 9, 17); kick(from, (tx - B.x) / d * sp, (tz - B.z) / d * sp, d > 12 ? 2.5 : 0); B.passTo = to; }
  function benPass() { const cand = mates.filter(m => m.on); if (!cand.length) return; const ws = wStick(stick.x, stick.y), sx = ws.x, sz = ws.z, sm = Math.hypot(sx, sz); let best = null, bs = -1e9;
    for (const m of cand) { const dx = m.x - ben.x, dz = m.z - ben.z, d = Math.hypot(dx, dz) || 1; let sc = -d * 0.15 + dx * 0.06; if (sm > 0.3) sc += ((dx * sx + dz * sz) / (d * sm)) * 4; for (const o of opps) if (o.on) { const t = clamp(((o.x - ben.x) * dx + (o.z - ben.z) * dz) / (d * d), 0, 1), ox = ben.x + dx * t - o.x, oz = ben.z + dz * t - o.z; if (Math.hypot(ox, oz) < 1.2) sc -= 3; } if (sc > bs) { bs = sc; best = m; } }
    passTo(ben, best); }
  // ---------- AI ----------
  const goalX = team => team === 0 ? PW : -PW;
  function aiOutfield(p, dt) { const team = p.team, mine = B.owner && B.owner.team === team, opp = team ? [ben, ...mates] : opps, cfg = team ? S.team : { spd: 5.2, tackle: 0.75, shoot: 0.6 };
    let tx = p.x, tz = p.z, spd = cfg.spd;
    if (S.mode === 'lesson') { lessonAI(p, dt); return; }
    if (B.owner === p) { const gx = goalX(team), dg = Math.hypot(gx - p.x, p.z); let ax = gx - p.x, az = -p.z * 0.6; for (const o of opp) if (o.on) { const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz); if (d < 3) { ax += dx / d * 4 * (3 - d); az += dz / d * 5 * (3 - d); } } const al = Math.hypot(ax, az) || 1; tx = p.x + ax / al * 3; tz = p.z + az / al * 3; spd *= 0.86;
      const pressed = opp.some(o => o.on && Math.hypot(o.x - p.x, o.z - p.z) < 1.7); p.hold = (p.hold || 0) + dt;
      if (dg < 14 && Math.random() < dt * (dg < 8 ? 2.8 : 1.1)) { aiShoot(p, cfg); return; }
      if (team === 0 && p.hold > 1.6 && ben.on && Math.random() < dt * 2.5) { passTo(p, ben); p.hold = 0; return; }
      if (pressed && Math.random() < dt * 1.6) { const pals = (team ? opps : [ben, ...mates]).filter(m => m.on && m !== p); const to = team === 0 && Math.random() < 0.7 ? ben : pick(pals); if (to) { passTo(p, to); p.hold = 0; return; } } }
    else { p.hold = 0; const team3 = team ? opps.filter(m => m.on) : [ben, ...mates].filter(m => m.on), nearest = team3.reduce((a, m) => Math.hypot(m.x - B.x, m.z - B.z) < Math.hypot(a.x - B.x, a.z - B.z) ? m : a, team3[0]);
      if (mine) { const i = (team ? opps : mates).indexOf(p), lane = (i === 0 ? -1 : 1) * 5; tx = clamp(B.x + (team ? -6 : 6), -PW + 3, PW - 3); tz = lane; }
      else if (nearest === p || (B.owner && B.owner.team !== team && Math.hypot(p.x - B.x, p.z - B.z) < (team ? 7 : 4))) { const lead = B.owner ? 0.2 : 0.35; tx = B.x + B.vx * lead; tz = B.z + B.vz * lead; if (B.owner && B.owner.team !== team && Math.hypot(p.x - B.owner.x, p.z - B.owner.z) < 0.95 && B.owner.stun <= 0 && !B.owner.keeper && Math.random() < dt * cfg.tackle) steal(p, B.owner); }
      else { const ownG = -goalX(team); tx = (B.x + ownG) / 2; tz = clamp(B.z * 0.5 + ((team ? opps : mates).indexOf(p) ? 3 : -3), -PH + 1, PH - 1); } }
    steer(p, tx, tz, spd, dt); }
  function aiShoot(p, cfg) { const gx = goalX(p.team) + Math.sign(goalX(p.team)) * 0.3, q = rr(0.35, cfg.shoot), side = Math.random() < 0.5 ? -1 : 1, tz = side * rr(0.4, GW - 0.35) + (1 - q) * rr(-1.8, 1.8), ty = rr(0.2, 1.8), sp = 14 + 8 * q, T = Math.hypot(gx - B.x, tz - B.z) / sp; kick(p, (gx - B.x) / T, (tz - B.z) / T, (ty - B.y + 0.5 * G * T * T) / T, { team: p.team, q }); }
  function steal(by, from) { from.stun = 0.45; B.owner = null; B.last = by; const a = Math.atan2(by.x - from.x, by.z - from.z) + rr(-0.6, 0.6); B.vx = Math.sin(a) * 3.5; B.vz = Math.cos(a) * 3.5; tone(180, 0.06, 0.04, 'triangle'); if (from.ben) flash('TACKLED', '#ff9a8a', 0.9); else if (by.ben) flash('WON IT!', '#22c55e', 0.9); }
  function steer(p, tx, tz, spd, dt) { let dx = tx - p.x, dz = tz - p.z; const d = Math.hypot(dx, dz); let wx = 0, wz = 0; if (d > 0.15) { wx = dx / d * spd * Math.min(1, d / 1.2); wz = dz / d * spd * Math.min(1, d / 1.2); } accel(p, wx, wz, dt); }
  function accel(p, wx, wz, dt) { const a = Math.min(1, dt * 7); p.vx += (wx - p.vx) * a; p.vz += (wz - p.vz) * a; }
  function aiKeeper(k, dt) { const gx = k.team ? PW - 0.5 : -PW + 0.5, cfg = k.team ? S.team : { keep: 5 }; let tz = clamp(B.z * 0.7, -GW + 0.6, GW - 0.6), tx = gx;
    if (B.shot && B.shot.team !== k.team && Math.sign(B.vx) === Math.sign(gx)) { const t = (gx - B.x) / B.vx; if (t > 0 && t < 2) tz = clamp(B.z + B.vz * t, -GW - 0.4, GW + 0.4); }
    if (B.owner === k) { k.holdT -= dt; if (k.holdT <= 0) { const pals = (k.team ? opps : [ben, ...mates]).filter(m => m.on); const to = pals.reduce((a, m) => Math.abs(m.x - gx) < Math.abs(a.x - gx) + 4 && Math.random() < 0.6 ? m : a, pals[0]); if (to) passTo(k, to); } }
    const sp = B.shot ? cfg.keep : 3.2; k.x += clamp(tx - k.x, -sp * dt, sp * dt); k.z += clamp(tz - k.z, -sp * dt, sp * dt); k.vx = 0; k.vz = (tz - k.z) * 4; k.face = k.team ? -Math.PI / 2 : Math.PI / 2; }
  // ---------- Ben movement ----------
  function moveBen(dt) { let sx = stick.x, sy = stick.y; if (keys.has('KeyA') || keys.has('ArrowLeft')) sx = -1; if (keys.has('KeyD') || keys.has('ArrowRight')) sx = 1; if (keys.has('KeyW') || keys.has('ArrowUp')) sy = 1; if (keys.has('KeyS') || keys.has('ArrowDown')) sy = -1;
    const p = ben; if (S.bot) { const t = botTarget(); sx = t.x; sy = t.y; } const m = Math.hypot(sx, sy), own = B.owner === p; let spd = own ? 6.0 : 6.7; if (p.burst > 0) spd *= 1.45;
    if (p.slide > 0) { p.slide -= dt; const v = 9.5; p.vx = Math.sin(p.face) * v; p.vz = Math.cos(p.face) * v; for (const o of [...opps, keepers[1]]) if (o.on && B.owner === o && Math.hypot(o.x - p.x, o.z - p.z) < 1.15 && !o.keeper) { if (Math.random() < (S.mode === 'lesson' ? 1 : 0.6)) { steal(p, o); if (S.mode === 'lesson') lessonTackle(); } p.slide = 0; } return; }
    if (m > 0.12) { const w = wStick(sx, sy); accel(p, w.x / Math.max(1, m) * spd, w.z / Math.max(1, m) * spd, dt); } else accel(p, 0, 0, dt); }
  function botTarget() { const p = ben, toward = (x, z) => { const dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz) || 1; return d < 0.25 ? { x: 0, y: 0 } : vert() ? { x: dz / d, y: dx / d } : { x: dx / d, y: -dz / d }; };
    if (S.pen) return { x: S.pen.botX || 0, y: S.pen.botY || 0 };
    if (S.mode === 'lesson' && S.L === 0 && B.owner === p) { const g = gates[Math.min(S.gate, 2)]; return toward(g.x + 1.5, g.z); }
    if (B.owner === p) { const t = toward(PW, -p.z * 0.4 + p.z); if (Math.hypot(PW - p.x, p.z) < 13 && ringDt(p) < (S.botTol == null ? 0.05 : S.botTol) && S.mode !== 'lesson' || (S.mode === 'lesson' && S.L === 2 && ringDt(p) < 0.05 && p.x > PW - 14)) press(1); if (S.mode === 'lesson' && S.L === 1 && p.kickT <= 0 && Math.random() < 0.05) press(2); return t; }
    if (B.owner && B.owner.team === 1 && Math.hypot(B.owner.x - p.x, B.owner.z - p.z) < 2.2 && p.slide <= 0) { p.face = Math.atan2(B.owner.x - p.x, B.owner.z - p.z); press(3); }
    { const inc = incoming(); if (inc && Math.abs(inc.t) < 0.05 && inc.d < 1.1 && p.x > PW - 16 && !S.firstT) press(1); }
    if (B.owner && B.owner.team === 0 && !B.owner.ben) { if (Math.random() < 0.02) press(2); return toward(clamp(B.x + 6, -PW, PW - 4), -B.z * 0.5); }
    return toward(B.x + B.vx * 0.3, B.z + B.vz * 0.3); }
  // ---------- kickoff / match ----------
  function placeKickoff(kt) { B.net = false; B.shot = null; B.vx = B.vz = B.vy = 0; B.x = 0; B.z = 0; B.y = BR;
    const L = [[-5, 0], [-9, -5], [-9, 5]]; [ben, ...mates].forEach((p, i) => { p.x = L[i][0]; p.z = L[i][1]; p.vx = p.vz = 0; p.face = Math.PI / 2; p.stun = p.slide = 0; }); opps.forEach((p, i) => { p.x = -L[i][0]; p.z = -L[i][1]; p.vx = p.vz = 0; p.face = -Math.PI / 2; p.stun = 0; });
    keepers[0].x = -PW + 0.5; keepers[1].x = PW - 0.5; keepers.forEach(k => k.z = 0); const taker = kt === 0 ? ben : opps[0]; taker.x = kt === 0 ? -0.6 : 0.6; taker.z = 0; B.owner = taker; S.ph = 'kickoffWait'; S.overT = S.t + 1.2; }
  function startMatch(r) { r = clamp(r | 0, 0, 2); stick.x = stick.y = 0; audio.init && audio.init(); S.mode = 'match'; S.round = r; S.done = null; S.pen = null; S.so = null; setTeam(TEAMS[r]); S.score = [0, 0]; S.clock = MATCH_T; gates.forEach(g => g.g.visible = false); placeKickoff(0); S.ph = 'brief'; S.overT = S.t + 2.4; call(TEAMS[r].round + ' · BEN\'S EIGHT VS ' + TEAMS[r].name, 2.6); }
  function endMatch() { whistle(3); if (S.score[0] === S.score[1]) { call('FULL TIME · ' + S.score[0] + '–' + S.score[1] + ' · PENALTIES!', 3); S.ph = 'over'; S.overT = S.t + 2.6; S.next = 'shootout'; return; } S.ph = 'over'; S.overT = S.t + 2.6; S.next = 'finish'; call('FULL TIME · ' + S.score[0] + '–' + S.score[1], 3); if (S.score[0] > S.score[1]) cheer(2.6); }
  function finishMatch(won) { if (S.demo) { demoStop(); return; } const t = S.team, r = S.round; let gold = 0, relic = false;
    try { if (won) { gold = t.gold; save.addGold(gold); save.setStat(SK.round, Math.max(save.stat(SK.round, 0), r + 1)); save.setStat(SK.wins, save.stat(SK.wins, 0) + 1); if (r === 2) { save.addRelic('cisternCup'); save.setFlag('kufaCupWon'); relic = true; } } } catch (e) {}
    S.mode = 'done'; S.ph = 'idle'; S.pen = null; S.done = { won, round: t.round, opp: t.name, score: S.score.slice(), so: S.so ? S.so.score.slice() : null, gold, relic, next: won && r < 2 ? TEAMS[r + 1] : null, champ: won && r === 2 }; }
  // ---------- penalties ----------
  function penStart(who) { const P0 = { who, ph: who === 'ben' ? 'aim' : 'runup', t0: S.t, m: 0, dive: null, zone: null, done: false }; S.pen = P0; B.net = false; B.shot = null; B.owner = null; B.vx = B.vy = B.vz = 0; B.x = SPOT; B.z = 0; B.y = BR;
    const K = keepers[1]; [ben, ...mates, ...opps].forEach(p => { p.vx = p.vz = 0; }); mates.forEach((p, i) => { p.x = 0; p.z = -4 + i * 2.4; p.face = Math.PI / 2; }); opps.forEach((p, i) => { p.x = 1.5; p.z = 2 + i * 1.6; p.face = Math.PI / 2; }); keepers[0].x = -PW + 0.5; keepers[0].z = 0;
    if (who === 'ben') { ben.x = SPOT - 1.3; ben.z = -0.9; ben.face = Math.PI / 2; K.x = PW - 0.4; K.z = 0; K.on = true; K.f.visible = true; }
    else { const sh = S.mode === 'lesson' ? opps[0] : opps[S.so ? S.so.n % 3 : 0]; P0.shooter = sh; sh.x = SPOT - 1.4; sh.z = 0; sh.face = Math.PI / 2; ben.x = PW - 0.4; ben.z = 0; ben.face = -Math.PI / 2; K.f.visible = false; K.x = PW + 3; P0.zone = pick([-1, 1, -1, 1, 0]); P0.strike = S.t + 1.6; P0.perfect = Math.random() < (S.mode === 'lesson' ? 0 : S.team.pen * 0.4); } }
  const penMeter = () => clamp((S.t - S.pen.t0) / 1.0, 0, 1);
  function penPress(n) { const P0 = S.pen; if (P0.who === 'ben') { if (n !== 1) return; if (P0.ph === 'aim') { P0.ph = 'power'; P0.t0 = S.t; tone(500, 0.05, 0.03, 'sine'); } else if (P0.ph === 'power') penShoot(); }
    else if (n === 3 && P0.ph === 'runup' && P0.dive == null) { const sx = S.bot ? (P0.botX || 0) : stick.x; P0.dive = Math.abs(sx) < 0.35 ? 0 : (sx > 0 ? -1 : 1); P0.diveT = S.t; if (S.t < P0.strike - 0.75) { P0.zone = pick([-1, 0, 1].filter(z => z !== P0.dive)); P0.early = true; } } }
  function penShoot() { const P0 = S.pen, m = penMeter(); let tz = clamp(stick.x, -1, 1) * (GW - 0.25), ty = 0.3 + (clamp(stick.y, -1, 1) + 1) / 2 * 1.65, sp = 20, zone = 'GOOD', sc = 0.7;
    if (S.bot) { tz = (P0.botX || 0) * (GW - 0.3); ty = 0.8; }
    if (m < 0.35) { sp = 11; zone = 'TOO SOFT'; sc = 0.4; } else if (m < 0.6) { sp = 16; sc = 0.6; } else if (m <= 0.82) { sp = 25; zone = 'PERFECT'; sc = 0.12; } else if (m <= 0.92) { sp = 26; zone = 'RISKY'; if (Math.random() < 0.5) ty = GH + rr(0.2, 0.8); } else { sp = 27; zone = 'TOO HARD'; ty = GH + rr(0.4, 1.4); }
    tz += rr(-sc, sc); ty += rr(-sc, sc) * 0.6; const gx = PW + 0.3, T = Math.hypot(gx - B.x, tz - B.z) / sp; kick(ben, (gx - B.x) / T, (tz - B.z) / T, (ty - B.y + 0.5 * G * T * T) / T, { team: 0, q: zone === 'PERFECT' ? 1 : 0.6, pen: true }); P0.ph = 'flight'; P0.arrive = S.t + T; P0.tz = tz; P0.ty = ty; P0.perfect = zone === 'PERFECT';
    const K = keepers[1], third = Math.abs(tz) < 0.9 ? 0 : Math.sign(tz), skill = S.mode === 'lesson' ? 0.2 : S.team.pen; P0.kdive = Math.random() < skill ? third : pick([-1, 0, 1]); flash(zone === 'PERFECT' ? 'PERFECT STRIKE' : zone, zone === 'PERFECT' ? '#22c55e' : zone.startsWith('TOO') ? '#ff9a8a' : '#ffffff', 1); }
  function penStep(dt) { const P0 = S.pen; if (!P0 || P0.done) return; const K = keepers[1];
    if (P0.who === 'ben' && S.bot && S.ph === 'pen') { if (P0.botX == null) P0.botX = pick([-1, 1]) * 0.85; if (P0.ph === 'aim' && S.t - P0.t0 > 0.8) press(1); else if (P0.ph === 'power' && penMeter() >= 0.7) press(1); }
    if (P0.who === 'ben') { reticle.visible = P0.ph !== 'flight'; const rz = (S.bot ? (P0.botX || 0) : clamp(stick.x, -1, 1)) * (GW - 0.25), ry = S.bot ? 0.8 : 0.3 + (clamp(stick.y, -1, 1) + 1) / 2 * 1.65; reticle.position.set(PW + 0.05, ry, rz);
      if (P0.ph === 'power' && S.t - P0.t0 > 1.15) { P0.ph = 'aim'; flash('AGAIN · 1 THEN 1 IN THE GREEN', '#ffffff', 1); }
      if (P0.ph === 'flight') { const a = clamp((S.t - (P0.arrive - 0.45)) / 0.4, 0, 1); K.z = damp(K.z, P0.kdive * 1.7, 9 * a + 0.01, dt); K.diveY = Math.abs(P0.kdive) * a * 0.5;
        if (S.t >= P0.arrive) { P0.done = true; const reach = P0.kdive === 0 ? (Math.abs(P0.tz) < 1.0 && P0.ty < 2.0) : (Math.sign(P0.tz) === P0.kdive && Math.abs(Math.abs(P0.tz) - 1.7) < 1.05 && P0.ty < 1.8); const over = P0.ty > GH - 0.05 || Math.abs(P0.tz) > GW - 0.05;
          const saved = !over && reach && !(P0.perfect && Math.random() < 0.7); penResult(over ? 'MISS' : saved ? 'SAVE' : 'GOAL'); } } }
    else { reticle.visible = false; const sh = P0.shooter, lead = clamp((S.t - (P0.strike - 0.7)) / 0.5, 0, 1); sh.lean = P0.zone * lead * 0.35; if (P0.dive != null) { const a = clamp((S.t - P0.diveT) / 0.3, 0, 1); ben.z = damp(ben.z, P0.dive * 1.7, 10 * a + 0.01, dt); ben.diveY = Math.abs(P0.dive) * a * 0.5; }
      if (S.bot && P0.dive == null && S.t > P0.strike - 0.5) { P0.botX = -P0.zone; press(3); }
      if (P0.ph === 'runup' && S.t >= P0.strike) { const tz = P0.zone * (P0.perfect ? GW - 0.3 : rr(1.3, 2.0)) + (P0.zone === 0 ? rr(-0.5, 0.5) : 0), ty = P0.perfect ? 1.6 : rr(0.3, 1.3), gx = PW + 0.3, sp = 21, T = Math.hypot(gx - B.x, tz - B.z) / sp; sh.x += 0.6; kick(sh, (gx - B.x) / T, (tz - B.z) / T, (ty - B.y + 0.5 * G * T * T) / T, { team: 1, q: 0.8, pen: true }); P0.ph = 'flight'; P0.arrive = S.t + T; P0.tz = tz; }
      if (P0.ph === 'flight' && S.t >= P0.arrive) { P0.done = true; const ok = P0.dive != null && P0.dive === P0.zone && !(P0.perfect && Math.random() < 0.6); penResult(ok ? 'SAVE' : 'GOAL', true); } } }
  function penResult(r, keeping = false) { const P0 = S.pen; B.shot = null; if (r === 'SAVE') { B.vx = -B.vx * 0.3; B.vz *= 0.3; } tone(r === 'GOAL' ? (keeping ? 196 : 880) : keeping ? 1175 : 220, 0.2, 0.05, r === 'GOAL' && keeping ? 'sine' : 'triangle');
    const good = keeping ? r === 'SAVE' : r === 'GOAL'; flash(keeping ? (r === 'SAVE' ? 'GREAT SAVE!' : P0.early ? 'TOO EARLY · HE SAW YOU GO' : 'GOAL') : (r === 'GOAL' ? 'GOAL!' : r === 'SAVE' ? 'SAVED' : 'MISSED'), good ? '#22c55e' : '#ff9a8a', 1.4); if (good) cheer(1.2);
    if (S.mode === 'lesson') { if (good) { S.lc++; flash((keeping ? 'SAVED! ' : 'GOAL! ') + Math.min(S.lc, LESSONS[S.L].goal) + ' / ' + LESSONS[S.L].goal, '#22c55e', 1.4); if (S.lc >= LESSONS[S.L].goal) S.lessonDone = true; } S.ph = 'over'; S.overT = S.t + 1.6; S.next = S.lessonDone ? 'lessonNext' : 'lessonPen'; return; }
    const so = S.so; if (!keeping) so.score[0] += r === 'GOAL' ? 1 : 0; else so.score[1] += r === 'GOAL' ? 1 : 0; so.taken[keeping ? 1 : 0]++; if (keeping) so.n++;
    call('PENALTIES · BEN\'S EIGHT ' + so.score[0] + '–' + so.score[1] + ' ' + S.team.short, 2.4); S.ph = 'over'; S.overT = S.t + 1.8; S.next = 'soNext'; }
  function soNext() { const so = S.so, [a, b] = so.score, [ta, tb] = so.taken, n = Math.max(3, Math.max(ta, tb));
    if (ta === tb && ta >= 3 && a !== b) return finishMatch(a > b); if (ta === tb && ta < 3) { const left = 3 - ta; if (a > b + left || b > a + left) return finishMatch(a > b); }
    if (ta > tb && ta <= 3) { const left = 3 - tb; if (a > b + left) return finishMatch(true); if (b + 0 > a + (3 - ta)) return finishMatch(false); }
    S.ph = 'pen'; penStart(ta > tb ? 'opp' : 'ben'); }
  // ---------- lessons ----------
  function startLesson(i) { stick.x = stick.y = 0; audio.init && audio.init(); S.mode = 'lesson'; S.L = clamp(i | 0, 0, LESSONS.length - 1); S.lc = 0; S.gate = 0; S.lessonDone = false; S.done = null; S.pen = null; setTeam(COACH, true); keepers[1].on = true; keepers[1].f.visible = true; S.ph = 'brief'; S.overT = S.t + 2.0; S.next = 'lessonGo'; call('LESSON ' + (S.L + 1) + ' · ' + LESSONS[S.L].title + ' · MASTER FARUQ', 2.2); gates.forEach(g => g.g.visible = LESSONS[S.L].id === 'dribble'); lessonSetup(); }
  function lessonSetup() { const id = LESSONS[S.L].id; S.pen = null; B.net = false; B.shot = null; B.vx = B.vy = B.vz = 0; B.y = BR; ben.stun = ben.slide = 0; [ben, ...mates, ...opps].forEach(p => { p.vx = p.vz = 0; });
    opps[0].x = 6; opps[0].z = -6; mates[0].x = -2; mates[0].z = 6; ben.x = -12; ben.z = 0; ben.face = Math.PI / 2; keepers[0].x = -PW + 0.5; keepers[1].x = PW - 0.5; keepers.forEach(k => k.z = 0);
    if (id === 'dribble') { S.gate = Math.min(S.gate, 2); B.owner = ben; } else if (id === 'pass') { B.owner = ben; ben.x = -8; mates[0].x = 2; mates[0].z = 5; } else if (id === 'shoot') { ben.x = PW - 13; ben.z = rr(-3, 3); B.owner = ben; opps[0].x = PW - 4; opps[0].z = 8; } else if (id === 'tackle') { opps[0].x = 0; opps[0].z = 0; B.owner = opps[0]; ben.x = -6; } else if (id === 'pen') { S.ph = S.ph === 'brief' ? 'brief' : 'pen'; penStart('ben'); } else if (id === 'keep') { penStart('opp'); } }
  function lessonAI(p, dt) { const id = LESSONS[S.L].id;
    if (p === mates[0]) { if (B.owner === p) { p.hold = (p.hold || 0) + dt; if (p.hold > 0.9) { passTo(p, ben); p.hold = 0; } } else p.hold = 0; steer(p, B.owner === p ? p.x : id === 'pass' ? clamp(ben.x + 9, -PW + 3, PW - 3) : -2, id === 'pass' ? (ben.z > 0 ? -5 : 5) : 6, 4, dt); return; }
    if (p === opps[0]) { if (id === 'tackle') { if (B.owner === p) { const t = S.t * 0.6, tx = Math.cos(t) * 7, tz = Math.sin(t * 1.3) * 5; steer(p, tx, tz, COACH.spd, dt); } else if (!B.owner && S.ph === 'play') steer(p, B.x, B.z, 3, dt); else steer(p, p.x, p.z, 1, dt); } else steer(p, id === 'shoot' ? PW - 4 : 6, id === 'shoot' ? 8 : -6, 3, dt); } }
  function lessonShotEnd(r) { if (S.mode !== 'lesson' || S.ph !== 'play' || LESSONS[S.L].id !== 'shoot') return; B.shot = null; if (r === 'GOAL') { S.lc++; cheer(1); flash('GOAL! ' + Math.min(S.lc, 2) + ' / 2', '#22c55e', 1.4); if (S.lc >= 2) S.lessonDone = true; } else flash(r === 'SAVED' ? 'SAVED · TRY THE GREEN' : 'WIDE · AGAIN', '#ff9a8a', 1.3); S.ph = 'over'; S.overT = S.t + 1.6; S.next = S.lessonDone ? 'lessonNext' : 'lessonGo'; }
  function lessonTackle() { if (LESSONS[S.L].id !== 'tackle' || S.ph !== 'play') return; S.lc++; flash('WON IT! ' + Math.min(S.lc, 2) + ' / 2', '#22c55e', 1.3); if (S.lc >= 2) S.lessonDone = true; S.ph = 'over'; S.overT = S.t + 1.4; S.next = S.lessonDone ? 'lessonNext' : 'lessonGo'; }
  function lessonCheck() { const id = LESSONS[S.L].id;
    if (id === 'dribble' && B.owner === ben && S.gate < 3) { const g = gates[S.gate]; if (Math.abs(ben.x - g.x) < 0.5 && Math.abs(ben.z - g.z) < 1.4) { S.gate++; S.lc = S.gate; tone(1175, 0.08, 0.05); flash('GATE ' + S.gate + ' / 3', '#22c55e', 1); if (S.gate >= 3) { S.lessonDone = true; S.ph = 'over'; S.overT = S.t + 1.4; S.next = 'lessonNext'; } } }
    if (id === 'dribble' && B.owner !== ben && S.ph === 'play' && !B.owner && Math.hypot(B.vx, B.vz) < 0.5 && Math.hypot(B.x - ben.x, B.z - ben.z) > 3) { B.owner = ben; }
    if (id === 'pass') { if (B.owner === mates[0] && B.last === ben && !S.passCounted) { S.passCounted = true; S.lc++; tone(1175, 0.08, 0.05); flash('GOOD PASS ' + Math.min(S.lc, 3) + ' / 3', '#22c55e', 1); if (S.lc >= 3) { S.lessonDone = true; S.ph = 'over'; S.overT = S.t + 1.4; S.next = 'lessonNext'; } } if (B.owner === ben) S.passCounted = false; if (!B.owner && Math.hypot(B.vx, B.vz) < 0.3 && S.ph === 'play' && B.last === ben && Math.hypot(B.x - mates[0].x, B.z - mates[0].z) > 2) { flash('MISSED HIM · AGAIN', '#ff9a8a', 1.1); B.owner = ben; } }
    if (id === 'shoot' && S.ph === 'play' && !B.owner && !B.shot && B.last === ben && Math.hypot(B.vx, B.vz) < 0.4) lessonShotEnd('WIDE'); }
  function lessonNext() { const n = S.L + 1; try { save.setStat(SK.lesson, Math.max(save.stat(SK.lesson, 0), n)); } catch (e) {} cheer(1.2);
    if (n >= LESSONS.length) { try { save.setFlag('kufaSoccerLessons'); } catch (e) {} S.mode = 'done'; S.ph = 'idle'; S.pen = null; gates.forEach(g => g.g.visible = false); S.done = { lessons: true }; return; } startLesson(n); }
  // ---------- demo ----------
  function demoStart() { if (S.mode === 'lesson' || S.mode === 'match') return; S.demo = true; S.bot = true; startMatch(0); S.demoEnd = S.t + 70; }
  function demoStop() { if (!S.demo) return; S.demo = false; S.bot = false; stick.x = stick.y = 0; api.toIntro(); }
  function demoCap() { if (S.ph === 'brief' || S.ph === 'kickoffWait') return ['', 'WATCH A MATCH IN THE CISTERN CUP']; if (S.ph === 'goal') return ['', 'FIRST TO SCORE MORE IN 3 MINUTES WINS'];
    if (B.owner === ben) return ringDt(ben) < 0.1 ? ['1', 'RING IS GREEN: PRESS 1 TO SHOOT'] : ['STICK', 'DRIBBLE AT GOAL. THE RING SHRINKS WITH EVERY TOUCH'];
    if (B.owner && B.owner.team === 1) return ['3', 'GET CLOSE AND PRESS 3 TO SLIDE TACKLE']; { const inc = incoming(); if (inc) return ['1', 'BLUE RING: THE BALL IS COMING TO YOU. PRESS 1 ON GREEN TO SHOOT FIRST TIME']; } if (B.owner && B.owner.team === 0) return ['2', 'A TEAMMATE HAS IT. PRESS 2 TO CALL FOR THE BALL']; return ['STICK', 'RUN TO THE LOOSE BALL']; }
  // ---------- camera ----------
  const CAM = { look: V3(0, 0, 0) }; camera.position.set(0, 15, 22);
  function camShot() { const port = CW() < CHh(); if (S.pen) { camera.fov = port ? 66 : 48; return S.pen.who === 'ben' ? { pos: V3(SPOT - 7.5, 3.6, 1.6), look: V3(PW, 1.0, 0) } : { pos: V3(PW + 2.8, 4.7, 0.4), look: V3(SPOT - 1, 0.2, 0) }; }
    camera.fov = port ? 62 : 44; const cx = clamp(port ? B.x : B.x * 0.85, port ? -PW + 3 : -PW + 8, port ? PW - 3 : PW - 8);
    if (behind()) { camera.fov = port ? 64 : 50; const bx = clamp(ben.x, -PW - 1, PW - 5), bz = clamp(ben.z, -PH + 1, PH - 1); return { pos: V3(bx - (port ? 11.5 : 11), port ? 11.5 : 9, bz * 0.5), look: V3(bx + (port ? 5.5 : 6.5), 0, bz * 0.7) }; }
    if (vert()) { camera.fov = 60; const vx = S.mode === 'intro' || S.mode === 'done' ? -4 : clamp(B.x, -PW + 9, PW - 10); return { pos: V3(vx - 7.5, 26, 0), look: V3(vx + 2.5, 0, 0) }; }
    if (S.mode === 'intro' || S.mode === 'done') return { pos: V3(0, 18, 26), look: V3(0, 0, -1) };
    return port ? { pos: V3(cx, 21, 15), look: V3(cx, 0, 3.4) } : { pos: V3(cx, 16.5, 17.5), look: V3(cx, 0, -0.6) }; }
  // ---------- frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0;
  function step(dt) { S.t += dt; S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.callT -= dt; if (S.callT <= 0) S.call = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.9; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.5 * p.life; p.s.scale.setScalar(0.2 + (1 - p.life) * 0.4); }
    if (S.cheer > 0) { S.cheer -= dt; placeCrowd(Math.min(1, S.cheer), S.t); if (S.cheer <= 0) placeCrowd(); }
    if (S.demo && S.t > S.demoEnd) { demoStop(); return; }
    if (S.ph === 'brief' && S.t >= S.overT) { if (S.mode === 'lesson') { S.ph = LESSONS[S.L].id === 'pen' || LESSONS[S.L].id === 'keep' ? 'pen' : 'play'; if (S.ph === 'pen' && !S.pen) lessonSetup(); } else { S.ph = 'play'; whistle(1); } }
    if (S.ph === 'kickoffWait' && S.t >= S.overT) { S.ph = 'play'; whistle(1); }
    if (S.ph === 'over' && S.t >= S.overT) { const n = S.next; S.next = ''; if (n === 'kickoff') placeKickoff(S.kickTeam); else if (n === 'finish') finishMatch(S.score[0] > S.score[1]); else if (n === 'shootout') { S.so = { score: [0, 0], taken: [0, 0], n: 0 }; S.ph = 'pen'; penStart('ben'); call('PENALTIES · BEN SHOOTS FIRST', 2.4); } else if (n === 'soNext') soNext(); else if (n === 'lessonNext') lessonNext(); else if (n === 'lessonGo') { lessonSetup(); S.ph = 'play'; } else if (n === 'lessonPen') { S.ph = 'pen'; lessonSetup(); } }
    if (S.ph === 'goal' && S.t >= S.overT) { S.ph = 'over'; S.overT = S.t; }
    const playing = S.mode === 'lesson' || S.mode === 'match';
    if (playing && S.ph === 'play') { if (S.mode === 'match') { S.clock -= dt; if (S.clock <= 0) { S.clock = 0; endMatch(); } }
      for (const p of everyone()) { p.kickT = Math.max(0, p.kickT - dt); p.stun = Math.max(0, p.stun - dt); p.burst = Math.max(0, p.burst - dt); p.burstCd = Math.max(0, p.burstCd - dt); }
      moveBen(dt); for (const p of [...mates, ...opps]) if (p.on) { if (p.stun > 0) accel(p, 0, 0, dt); else aiOutfield(p, dt); } keepers.forEach(k => k.on && aiKeeper(k, dt));
      if (S.mode === 'match' && B.owner === ben) for (const o of opps) if (o.on && Math.hypot(o.x - ben.x, o.z - ben.z) < 1.05 && ben.stun <= 0 && Math.random() < dt * S.team.tackle * 1.5) steal(o, ben);
      for (const p of outfield()) { if (p.stun > 0) { p.vx *= 0.9; p.vz *= 0.9; } p.x = clamp(p.x + p.vx * dt, -PW - 0.5, PW + 0.5); p.z = clamp(p.z + p.vz * dt, -PH - 0.6, PH + 0.6); const sp = Math.hypot(p.vx, p.vz); if (sp > 0.4 && p.slide <= 0) p.face = Math.atan2(p.vx, p.vz); if (B.owner === p) p.dPh += dt / 0.55; p.mv = sp; }
      for (const a of outfield()) for (const b of outfield()) if (a !== b) { const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz); if (d > 0 && d < 0.7) { const k = (0.7 - d) / 2; a.x -= dx / d * k; a.z -= dz / d * k; } }
      if (S.mode === 'lesson') lessonCheck(); }
    if (S.firstT && S.t >= S.firstT.at) { const f = S.firstT; S.firstT = null; if (S.ph === 'play') f.go(); }
    if (playing && (S.ph === 'play' || S.ph === 'goal' || S.ph === 'over' || S.ph === 'pen')) { ballStep(dt); if (!S.firstT) pickups(); }
    if (S.ph === 'pen' || (S.pen && S.ph === 'over')) penStep(dt);
    // place foxes
    for (const p of [ben, ...mates, ...opps, ...keepers]) { if (!p.on) { p.f.visible = false; continue; } p.f.visible = true; p.f.position.set(p.x, (p.diveY || 0), p.z); const yaw = p.slide > 0 ? p.face : p.face; p.f.rotation.y = damp(p.f.rotation.y, yaw, 12, dt); p.f.rotation.z = p.slide > 0 ? 0.0 : damp(p.f.rotation.z, (p.lean || 0), 8, dt); p.f.rotation.x = p.slide > 0 ? -0.9 : p.stun > 0 ? 0.3 : 0; kit.animFox && kit.animFox(p.f, dt, p.mv || 0); if (!S.pen) { p.diveY = 0; p.lean = 0; } }
    goals[1].nets.forEach(n => n.visible = !(S.pen && S.pen.who === 'opp'));
    // ball, shadow, ring, Ben marker
    ballM.position.set(B.x, B.y, B.z); ballM.rotation.z = -B.spin; shadowM.position.set(B.x, 0.012, B.z); shadowM.scale.setScalar(1 + B.y * 0.15);
    const own = B.owner === ben && S.ph === 'play' && !S.pen, inc = !own && incoming(); if (inc && inc.t < 1.0) { const green = Math.abs(inc.t) < 0.075 && inc.d < 1.2; ringO.visible = ringI.visible = true; ringO.position.set(B.x, 0.015, B.z); ringI.position.copy(ringO.position); const pu = 1 + Math.sin(S.t * 9) * 0.035; ringI.scale.setScalar(pu); ringO.scale.setScalar((1 + Math.max(0, inc.t) * 2.6) * pu); ringO.material.opacity = 0.42 + Math.sin(S.t * 9) * 0.1; ringO.material.color.set(inc.d > 1.2 ? 0xff6a5a : green ? 0x22c55e : 0x7dd3fc); ringI.material.color.set(green ? 0x22c55e : 0xffffff); } else if (own) { const dtR = ringDt(ben), green = dtR < 0.075; ringO.visible = ringI.visible = true; ringO.position.set(B.x, 0.015, B.z); ringI.position.copy(ringO.position); const ph = ben.dPh % 1, pu = 1 + Math.sin(S.t * 9) * 0.035; ringI.scale.setScalar(pu); ringO.scale.setScalar((1 + (1 - ph) * 1.6) * pu); ringO.material.opacity = 0.42 + Math.sin(S.t * 9) * 0.1; ringO.material.color.set(green ? 0x22c55e : 0xffd23a); ringI.material.color.set(green ? 0x22c55e : 0xffffff); } else ringO.visible = ringI.visible = false;
    benMark.visible = playing && !S.pen; benMark.position.set(ben.x, 0.03, ben.z); benMark.scale.setScalar(1 + Math.sin(S.t * 6) * 0.06);
    gates.forEach((g, i) => { g.glow.material.opacity = i === S.gate ? 0.35 + Math.sin(S.t * 6) * 0.15 : i < S.gate ? 0.12 : 0.05; });
    const mm = Math.ceil(S.clock); drawBoard(S.mode === 'match' ? S.team.round + ' · THE CISTERN CUP' : 'THE CISTERN CUP', "BEN'S EIGHT", S.mode === 'match' ? S.team.short : S.mode === 'lesson' ? 'LESSONS' : 'KUFA STADIUM', S.mode === 'match' ? (S.so ? S.so.score[0] + '-' + S.so.score[1] : S.score[0] + '-' + S.score[1]) : '');
    const sh = camShot(); if (!S.pen && Math.min(CW(), CHh()) < 520 && (S.mode === 'lesson' || S.mode === 'match')) sh.pos = sh.look.clone().add(sh.pos.clone().sub(sh.look).multiplyScalar(0.85)); camera.updateProjectionMatrix(); const k = S.pen ? 4 : 2.6; camera.position.lerp(sh.pos, Math.min(1, dt * k)); CAM.look.lerp(sh.look, Math.min(1, dt * k)); camera.lookAt(CAM.look); }
  function frame() { raf = requestAnimationFrame(frame); { const pr = renderer.getPixelRatio(); if (Math.abs(renderer.domElement.width - Math.round(CW() * pr)) > 1 || Math.abs(renderer.domElement.height - Math.round(CHh() * pr)) > 1) onRs(); } const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh(), false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  const KMAP = { Digit1: 1, KeyJ: 1, Digit2: 2, KeyK: 2, Digit3: 3, Space: 3, KeyL: 3 };
  const onKD = e => { if (KMAP[e.code]) { e.preventDefault(); if (!e.repeat && !S.demo) press(KMAP[e.code]); return; } keys.add(e.code); }, onKU = e => keys.delete(e.code), onBlur = () => keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);
  const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  function hud() { const Lz = S.mode === 'lesson' ? LESSONS[S.L] : null, P0 = S.pen;
    const quest = S.mode === 'match' ? (S.team.round + ' · VS ' + S.team.name + ' · ' + S.score[0] + '–' + S.score[1] + (S.so ? ' · PENS ' + S.so.score[0] + '–' + S.so.score[1] : ' · ' + mmss(S.clock))) : Lz ? 'LESSON ' + (S.L + 1) + ' / ' + LESSONS.length + ' · ' + Lz.title + ' · ' + Math.min(S.lc, Lz.goal) + ' / ' + Lz.goal : 'THE CISTERN CUP · LESSONS, THEN 3 ROUNDS';
    const top = behind() ? V3(clamp(ben.x, -PW - 1, PW - 5) + 10, 2.6, 0).project(camera) : vert() ? V3(clamp(B.x, -PW + 9, PW - 10) + 8, 1, 0).project(camera) : V3(0, 3.2, -PH - 1).project(camera), popY = S.pen ? 0.22 : clamp((1 - top.y) / 2, 0.1, 0.45);
    return { mode: S.mode, ph: S.ph, quest, flash: S.flash, call: S.call, done: S.done, popY, lesson: Lz ? { n: S.L + 1, of: LESSONS.length, title: Lz.title, text: Lz.text, c: Math.min(S.lc, Lz.goal), goal: Lz.goal } : null,
      meter: P0 && P0.who === 'ben' && P0.ph === 'power' ? { v: penMeter() } : null, penAim: !!(P0 && P0.who === 'ben' && P0.ph === 'aim'), penKeep: !!(P0 && P0.who === 'opp' && P0.ph === 'runup'),
      match: S.mode === 'match' ? { team: S.team.name, round: S.team.round, score: S.score.slice(), clock: mmss(S.clock), so: S.so ? S.so.score.slice() : null } : null, demo: S.demo ? demoCap() : null,
      prog: { lesson: save.stat(SK.lesson, 0), lessons: LESSONS.length, round: save.stat(SK.round, 0), unlocked: !!save.flag('kufaSoccerLessons'), champ: !!save.flag('kufaCupWon') }, teams: TEAMS.map(t => ({ name: t.name, round: t.round, gold: t.gold })), gold: save.data.gold }; }
  frame(); setTeam(TEAMS[0]); placeKickoff(0); S.ph = 'idle';
  const api = { startLesson, startMatch, demoStart, demoStop, toIntro() { S.demo = false; S.bot = false; S.mode = 'intro'; S.ph = 'idle'; S.done = null; S.pen = null; S.so = null; gates.forEach(g => g.g.visible = false); setTeam(TEAMS[0]); keepers[1].f.visible = true; placeKickoff(0); S.ph = 'idle'; },
    melee() { if (!S.demo) press(1); }, range() { if (!S.demo) press(2); }, jump() { if (!S.demo) press(3); }, meleeUp() {}, setStick(x, y) { stick.x = x; stick.y = y; }, setOrient(o) { ORIENT = o === 'side' ? 'side' : o === 'ns' ? 'ns' : 'behind'; }, setPaused(v) { PAUSE = !!v; }, setHudPad() {},
    start() {}, talk() {}, choose() {}, closeDialog() {}, nextLine() {}, clearToast() {}, useItem() { flash('SAVE IT FOR AFTER THE MATCH', '#ffffff', 1.2); }, closeWheel() {}, skipTime() {}, eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy() {}, zoomBy() {}, getCam() { return { dist: 13, pitch: 0.38 }; }, setCam() {}, setMinimap() {}, toggleSound() {}, cycleWeather() {},
    mapData() { return { p: [ben.x, ben.z, ben.face], b: [['GOAL', PW, 0], ['OWN GOAL', -PW, 0], ['CISTERN HEAD', 0, 0]], f: [...mates].filter(m => m.on).map(m => [m.x, m.z]), e: opps.filter(o => o.on).map(o => [o.x, o.z]), q: [PW, 0, 'GOAL'] }; },
    hud, _bot(v = true, tol) { S.bot = !!v; S.botTol = tol; }, _sim(n, cb, dt = 1 / 30) { for (let i = 0; i < n; i++) { step(dt); if (cb && cb(S, i) === false) break; } renderer.render(scene, camera); onState(hud()); }, _state: () => S, _B: B, _ben: ben,
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
