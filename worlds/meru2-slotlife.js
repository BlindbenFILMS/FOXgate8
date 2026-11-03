// MERU 2.0 — s644 SLOT FLOOR LIFE (Ben: "slots running with the screens going, a lever to pull, the foxes in front pull it and the reels move;
// the other machines spin on their own, tasteful, staggered, at least one machine per row moving at a time").
// buildSlotLife(THREE, scene, groups, fox) adds to every LUCKY GATES cabinet: 3 real REELS (scrolling symbol strips, staggered stops) over the
// screen + a LEVER on the right side (red knob). A jointed fox standing in front of a cabinet plays SLOTS: PULL (mirrored) on its own clock: the RIGHT paw (arms[0])
// is IK'd onto the knob, the lever follows the paw down, springs back, the reels spin + stop L → R, then a cheer (1 in 4) or an "aww".
// Empty machines run ATTRACT spins: per row max one at a time, a short pause between (so one is almost always moving), never two rows in step. Only ticks within 34 m.
import { applyD, sampleAnim, endPose } from '../engine/fox-poses.js?v=s648k';
import { WS } from '../engine/world-sfx.js?v=s713';   // s712 Runway sounds (audio/meru)
const SYMS = ['7', 'star', '8', 'bar', 'fox', 'bell'], N = SYMS.length, STOOL = 1.08, SEAT_Y = 0.79;   // stool distance from the cabinet + seat top height
function stripTex(THREE) { const c = document.createElement('canvas'); c.width = 128; c.height = 128 * N; const g = c.getContext('2d');
  SYMS.forEach((s, i) => { const y = i * 128, cx = 64, cy = y + 64; g.fillStyle = i % 2 ? '#f3f2f2' : '#ffffff'; g.fillRect(0, y, 128, 128); g.fillStyle = '#d9d4cc'; g.fillRect(0, y + 126, 128, 2);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    if (s === '7') { g.font = '900 96px Archivo, sans-serif'; g.fillStyle = '#ec3013'; g.fillText('7', cx, cy + 4); }
    else if (s === '8') { g.font = '900 92px Archivo, sans-serif'; g.fillStyle = '#d4a017'; g.fillText('8', cx, cy + 4); g.strokeStyle = '#201e1d'; g.lineWidth = 3; g.strokeText('8', cx, cy + 4); }
    else if (s === 'star') { g.fillStyle = '#ffd23a'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 20 : 46; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.fill(); g.strokeStyle = '#a16207'; g.lineWidth = 4; g.stroke(); }
    else if (s === 'bar') { g.fillStyle = '#201e1d'; g.fillRect(14, cy - 24, 100, 48); g.font = '900 36px Archivo, sans-serif'; g.fillStyle = '#ffffff'; g.fillText('BAR', cx, cy + 2); }
    else if (s === 'fox') { g.fillStyle = '#f97316'; g.beginPath(); g.moveTo(cx - 40, cy - 34); g.lineTo(cx - 14, cy - 12); g.lineTo(cx + 14, cy - 12); g.lineTo(cx + 40, cy - 34); g.lineTo(cx + 34, cy + 6); g.lineTo(cx, cy + 40); g.lineTo(cx - 34, cy + 6); g.closePath(); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(cx - 20, cy + 14); g.lineTo(cx, cy + 40); g.lineTo(cx + 20, cy + 14); g.closePath(); g.fill(); g.fillStyle = '#201e1d'; g.fillRect(cx - 18, cy - 2, 8, 8); g.fillRect(cx + 10, cy - 2, 8, 8); }
    else { g.fillStyle = '#2563eb'; g.beginPath(); g.moveTo(cx - 34, cy + 26); g.quadraticCurveTo(cx - 34, cy - 40, cx, cy - 40); g.quadraticCurveTo(cx + 34, cy - 40, cx + 34, cy + 26); g.closePath(); g.fill(); g.beginPath(); g.arc(cx, cy + 32, 9, 0, 7); g.fill(); } });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
// s644c 4 MORE SLOT PLAYERS (Ben): 2 on the ENTRANCE AISLE rows (the island rows facing the centre aisle you walk down from the door), one each
// side and NOT across from each other, + 1 on the west wall row + 1 on an island's back row. Spots = casino-local machine positions.
const PLAYERS = [{ x: -130.1, z: -9.2, look: ['#38bdf8', '#e0f2fe', '#0369a1'], outfit: 'vest' }, { x: -139.05, z: 9.2, look: ['#f472b6', '#fce7f3', '#9d174d'], outfit: 'dress', female: true },
  { x: -148.95, z: -13.5, look: ['#a3e635', '#ecfccb', '#3f6212'], outfit: 'coat' }, { x: -129.05, z: 10.7, look: ['#ffd23a', '#201e1d', '#a16207'], outfit: 'suit', female: true }];
export function buildSlotLife(THREE, groups, fox, kit) {
  if (kit) for (const [i, q] of PLAYERS.entries()) { const g = groups.find(g => Math.hypot(g.position.x - q.x, g.position.z - q.z) < 0.35); if (!g || !g.parent) continue; const ry = g.rotation.y;
    const f = kit.makeFox({ key: 'slotPlayer' + i, joints: true, torso: q.look, outfit: q.outfit, female: !!q.female, mood: 'happy' }); f.position.set(g.position.x + Math.sin(ry) * STOOL, 0, g.position.z + Math.cos(ry) * STOOL); f.rotation.y = ry + Math.PI; g.parent.add(f); }
  const base = stripTex(THREE), red = new THREE.MeshLambertMaterial({ color: 0xec3013 }), chrome = new THREE.MeshLambertMaterial({ color: 0xc0c4cc }), dark = new THREE.MeshBasicMaterial({ color: 0x05080f }), winM = new THREE.MeshBasicMaterial({ color: 0xff3fb4 });
  const M = groups.map((g, gi) => { const reels = [];
    for (const ch of g.children) if (ch.isMesh && ch.material && ch.material.map && Math.abs(ch.position.z - 0.475) < 0.002) ch.visible = false;   /* s644b: hide the old static reel picture (it z-fought the new screen) */
    // s644e STOOL CLOSER (Ben: "standing too close … sit them on the stools"): the stool (baked into the cabinet's meshes at z 1.75) is pulled in to z ${STOOL}
    for (const ch of g.children) { if (!ch.isMesh || !ch.geometry || !ch.geometry.attributes.position || ch.material.map) continue; const pa = ch.geometry.attributes.position; let moved = false; for (let n = 0; n < pa.count; n++) if (pa.getZ(n) > 1.3) { pa.setZ(n, pa.getZ(n) - (1.75 - STOOL)); moved = true; } if (moved) { pa.needsUpdate = true; ch.geometry.computeBoundingSphere(); ch.geometry.computeBoundingBox(); } }
    const back = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.5), dark); back.position.set(0, 1.45, 0.478); g.add(back);
    for (let r = 0; r < 3; r++) { const tx = base.clone(); tx.needsUpdate = true; tx.repeat.set(1, 1.5 / N); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.44), new THREE.MeshBasicMaterial({ map: tx, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      m.position.set(-0.235 + r * 0.235, 1.45, 0.482); m.renderOrder = 2; g.add(m); const s0 = (gi * 7 + r * 3) % N; tx.offset.y = s0 / N; reels.push({ tx, pos: s0, v: 0, stopAt: 0, target: s0 }); }
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.012), winM); line.position.set(0, 1.45, 0.486); line.renderOrder = 3; g.add(line);
    const lever = new THREE.Group(); lever.position.set(0.57, 1.0, 0.42); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 14), chrome); hub.rotation.z = Math.PI / 2; lever.add(hub);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.42, 8), chrome); arm.position.y = 0.21; lever.add(arm); const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), red); knob.position.y = 0.44; lever.add(knob); g.add(lever);
    return { g, reels, lever, knob, spinning: false, t: 0, who: null, cyc: 0, wait: 1 + Math.random() * 3, react: 0, row: null }; });
  // rows: same facing + the same depth along that facing
  const rows = {}; for (const m of M) { m.g.updateWorldMatrix(true, false); const p = m.g.getWorldPosition(new THREE.Vector3()), f = new THREE.Vector3(0, 0, 1).transformDirection(m.g.matrixWorld); const k = Math.round(Math.atan2(f.x, f.z) * 2) + '|' + Math.round((p.x * f.x + p.z * f.z) / 1.6); (rows[k] = rows[k] || { ms: [], gap: 0.5 + Math.random() * 2 }).ms.push(m); m.row = rows[k]; }
  function spin(m, dur) { m.spinning = true; m.reels.forEach((r, i) => { r.v = 14 + Math.random() * 3; r.stopAt = dur + i * 0.4; r.target = Math.floor(Math.random() * N); }); }
  function reelTick(m, dt) { if (!m.spinning) return; let any = false; for (const r of m.reels) { if (r.stopAt > 0) { r.stopAt -= dt; r.pos += r.v * dt; any = true; if (r.stopAt <= 0) { r.pos = Math.ceil(r.pos) + ((r.target - Math.ceil(r.pos)) % N + N) % N; r.settle = 0.25; } }
      else if (r.settle > 0) { r.settle -= dt; any = true; } r.tx.offset.y = (((r.pos - 0.75) / N) % 1 + 1) % 1 + (r.settle > 0 ? Math.sin(r.settle * 40) * 0.004 : 0); } if (!any) m.spinning = false; }
  const V = new THREE.Vector3(), V2 = new THREE.Vector3(), FW = new THREE.Vector3(); let near = false, look = 0, foxes = [];
  function findWho(scene) { foxes = []; scene.traverse(o => { if (o !== fox && o.userData && o.userData.P && o.userData.P.fore) foxes.push(o); });
    for (const m of M) { m.g.getWorldPosition(V); FW.set(0, 0, 1).transformDirection(m.g.matrixWorld); V.addScaledVector(FW, STOOL); let b = null, bd = 1.0; for (const f of foxes) { f.getWorldPosition(V2); const d = Math.hypot(V2.x - V.x, V2.z - V.z); if (d < bd && !M.some(q => q !== m && q.who === f)) { bd = d; b = f; } } if (b !== m.who) { if (m.who) release(m.who); m.who = b; if (b) seatOn(b, m); } } }
  function seatOn(f, m) { const u = f.userData; if (!u._slotHome) u._slotHome = { p: f.position.clone(), r: f.rotation.y }; const W = m.g.localToWorld(new THREE.Vector3(0, 0, STOOL)), L = f.parent.worldToLocal(W.clone()); const HY = u.P.legs[0].position.y * (f.scale.y || 1);
    f.position.set(L.x, SEAT_Y - HY + 0.04, L.z); const q = new THREE.Quaternion(); f.parent.getWorldQuaternion(q); const pY = new THREE.Euler().setFromQuaternion(q, 'YXZ').y; const gq = new THREE.Quaternion(); m.g.getWorldQuaternion(gq); const gY = new THREE.Euler().setFromQuaternion(gq, 'YXZ').y; f.rotation.y = gY + Math.PI - pY; u.seated = true; }
  function release(f) { const u = f.userData; endPose(f); if (u._slotHome) { f.position.copy(u._slotHome.p); f.rotation.y = u._slotHome.r; u._slotHome = null; } u.seated = false; }
  // s644d RIGHT PAW: fox-kit builds arms[0] at x -0.42 = the fox's RIGHT (it faces +z), arms[1] = LEFT. slot_pull was authored with arms[1],
  // so the pose is mirrored (pairs swapped, turns flipped) and arms[0] is IK'd onto the knob, which sits on the fox's right.
  const PAIR = ['a', 'pole', 'palm', 'g', 'ext', 'wr', 'op', 'pt', 'fc', 'fcw', 'hp'];
  const mirrorD = D => { for (const q of PAIR) if (Array.isArray(D[q]) && D[q].length === 2) D[q] = [D[q][1], D[q][0]]; if (typeof D.twist === 'number') D.twist = -D.twist; if (typeof D.roll === 'number') D.roll = -D.roll; if (typeof D.look === 'number') D.look = -D.look; if (Array.isArray(D.head)) D.head = [D.head[0], -D.head[1], -(D.head[2] || 0)]; return D; };
  function knobTarget(f, m) { const FP = f.userData.P; m.knob.getWorldPosition(V); FP.body.worldToLocal(V); const sh = FP.arms[0].position; return [V.x - sh.x, V.y - sh.y, V.z - sh.z]; }
  function tick(dt, P, scene) { const p0 = M[0] && M[0].g.getWorldPosition(V); if (!p0) return; const on = Math.hypot(P.x - p0.x, P.z - p0.z) < 34; if (on !== near) { near = on; if (!on) M.forEach(m => { if (m.who) { release(m.who); m.who = null; } }); look = 0; } if (!on) return;
    if ((look -= dt) <= 0) { look = 2; findWho(scene); }
    for (const m of M) { if (!m.g.visible) { if (m.who) { endPose(m.who); } continue; }
      if (m.who) {   // a fox at this machine: PULL on its own clock
        m.t += dt; const A = 4.2; if (m.t > A + m.wait) { m.t = 0; m.wait = 1.2 + Math.random() * 3; m.cyc++; }
        const t = Math.min(m.t, A - 0.01); const D = sampleAnim('slot_pull', t);   /* s645: sampleAnim is right-handed now (a[0] = right paw) */ if (D) { D.l = [[0.03, 0.44, 0.2], [0.03, 0.44, 0.2]]; D.lpole = [[0, 0.3, 1], [0, 0.3, 1]]; D.drop = 0; D.hop = 0; const grab = t > 0.35 && t < 1.15; if (grab) { D.a[0] = knobTarget(m.who, m); D.g[0] = 1; }
          if (m.t > 3.2 && m.t < A && m.react) { D.a = [[0.16, 0.6, 0.12], [0.16, 0.6, 0.12]]; D.g = [1, 1]; D.mood = 'joy'; D.mp = { smile: 1, open: 0.6, teeth: 0.8 }; }
          applyD(THREE, m.who, D, m.t, Math.min(1, m.t * 4 + (m.cyc ? 1 : 0))); }
        const down = t < 0.6 ? 0 : t < 0.95 ? (t - 0.6) / 0.35 : t < 1.15 ? 1 - (t - 0.95) / 0.2 : 0; m.lever.rotation.x = 1.15 * down * down * (3 - 2 * down);
        if (t >= 0.95 && t - dt < 0.95) { spin(m, 1.1); m.react = Math.random() < 0.25; if (m.react) { { const p = m.g.getWorldPosition(new THREE.Vector3()), d = Math.hypot(P.x - p.x, P.z - p.z), v = Math.max(0, 1 - d / 22) * 0.5; if (v > 0.02) setTimeout(() => WS.play('slot-win', v), 1200); }   /* s712 a fox wins near you */ const s = Math.floor(Math.random() * N); m.reels.forEach(r => { r.target = s; }); } } }
      else m.lever.rotation.x *= Math.max(0, 1 - dt * 8);
      reelTick(m, dt); }
    // ATTRACT spins on the empty machines: per row one at a time, with a gap
    for (const k in rows) { const R = rows[k]; if (R.ms.some(m => m.spinning && !m.who)) continue; if ((R.gap -= dt) > 0) continue; const free = R.ms.filter(m => !m.who && !m.spinning && m.g.visible); if (free.length) spin(free[(Math.random() * free.length) | 0], 0.9 + Math.random() * 0.9); R.gap = 0.25 + Math.random() * 0.9; } }   // short gap: a row is almost always showing one moving screen, never all of them
  return { tick };
}
