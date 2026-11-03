// MERU 2.0 — s639 THE AVIARY FALCONER + HIS HAWK (Ben: "catching and sending a hawk off a hand"). Inside the Bird Aviary by the west
// vestibule: KESTREL (falconer, leather glove on the left paw) keeps a red-tailed hawk. Loop: hawk on the glove (a treat now + then) → he
// swings it off → it circles under the net → swoops back + lands on the glove (his arm dips). YOU: stand on the yellow ring beside him
// (prompt) and hold still: he sends the hawk to YOUR glove: catch (arm out, it lands, the weight dips your arm), hold + a treat, send it
// off, watch it go (paw over the eyes). Poses: engine/fox-poses.js hawkD. Hawk = a small built model (wings flap, tail fans, head turns).
import { applyD, endPose, hawkD } from '../engine/fox-poses.js?v=s648k';
export function buildFalconer({ THREE, scene, kit, toon, touch }) {
  const FX = 202.2, FZ = 112.6, RING = { x: 204.6, z: 113.8, r: 1.0 }, CX = 230, CZ = 114, V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const kes = kit.makeFox({ key: 'aviaryFalconer', name: 'Kestrel', joints: true, torso: ['#7a5a3a', '#e6dfcf', '#4a3420'], outfit: 'vest', mood: 'happy', look: { fur: '#c8743a', furDark: '#8a4a1e' } });
  kes.position.set(FX, 0, FZ); kes.rotation.y = Math.PI / 2; scene.add(kes);
  const glove = P => { const H = P && P.hands && P.hands[0]; if (!H) return null; const g = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.22, 10), toon('#8a6440')); g.position.set(0, 0.06, 0); H.g.add(g); return g; }; glove(kes.userData.P);
  // the hawk
  const hawk = new THREE.Group(), brown = toon('#6b4a2e'), cream = toon('#efe2c8'), rust = toon('#b8582a'), beakM = toon('#e6b45a'), dark = toon('#201e1d');
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), brown); body.scale.set(0.85, 0.9, 1.4); hawk.add(body);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), cream); chest.position.set(0, -0.02, 0.07); chest.scale.set(0.9, 1, 1.1); hawk.add(chest);
  const head = new THREE.Group(); head.position.set(0, 0.11, 0.15); hawk.add(head); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), brown); head.add(hd);
  const bk = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.07, 6), beakM); bk.rotation.x = Math.PI / 2 + 0.5; bk.position.set(0, -0.015, 0.075); head.add(bk);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 4), dark); e.position.set(s * 0.04, 0.015, 0.055); head.add(e); }
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.2), rust); tail.position.set(0, -0.02, -0.22); hawk.add(tail);
  const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(s * 0.1, 0.04, 0); hawk.add(w); const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.2), brown); m.position.set(s * 0.21, 0, -0.02); w.add(m); const tip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.018, 0.14), dark); tip.position.set(s * 0.46, 0, -0.06); w.add(tip); return { w, s }; });
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), beakM); legs.position.set(0, -0.13, 0.02); hawk.add(legs);
  hawk.scale.setScalar(1.3); scene.add(hawk);
  const H = { st: 'perch', on: 'kes', t: 0, a: 0, from: V(), to: V(), wantYou: false };
  const handW = f => { const P = f && f.userData.P; if (!P || !P.hands) return f.position.clone().add(V(0, 1.3, 0)); f.updateMatrixWorld(true); return P.hands[0].g.localToWorld(V(0, 0.12, 0.02)); };
  const circ = a => V(CX + Math.cos(a) * 14, 7 + Math.sin(a * 2) * 1.2, CZ + Math.sin(a) * 11);
  let K = { ph: 'hold', t: 0 }, Y = null, stillT = 0, near = false, lastFox = null;
  function wingFlap(k, folded) { for (const { w, s } of wings) { w.rotation.z = folded ? s * -1.2 : s * (0.35 * Math.sin(k)); w.rotation.y = folded ? s * 0.5 : 0; } tail.scale.x = folded ? 0.8 : 1.3; }
  function tick(dt, P, fox) { lastFox = fox; const dC = Math.hypot(P.x - FX, P.z - FZ); kes.visible = hawk.visible = dC < (touch ? 60 : 110); if (!kes.visible) return; H.t += dt; K.t += dt;
    kit.animFox(kes, dt, 0, false); const inRing = Math.hypot(P.x - RING.x, P.z - RING.z) < RING.r && !P.car && !P.swim; near = inRing; stillT = inRing && P.sp < 0.2 ? stillT + dt : 0;
    if (stillT > 1.2 && !Y && H.on === 'kes' && H.st === 'perch' && fox && fox.userData.P && fox.userData.P.fore) { H.wantYou = true; K = { ph: 'send', t: 0 }; }
    // Kestrel's arm
    let D; if (K.ph === 'hold') { D = hawkD(K.t % 6 > 4 ? 'offer' : 'hold', K.t); if (K.t > 7 && H.on === 'kes') K = { ph: 'send', t: 0 }; }
    else if (K.ph === 'send') { D = hawkD('send', K.t, { k: K.t / 0.6 }); if (K.t > 0.5 && H.on === 'kes') { H.on = null; H.st = 'out'; H.t = 0; H.from.copy(hawk.position); } if (K.t > 0.9) K = { ph: 'watch', t: 0 }; }
    else if (K.ph === 'watch') { D = hawkD('watch', K.t); if (K.t > 2.5) K = { ph: 'wait', t: 0 }; }
    else if (K.ph === 'wait') { D = hawkD('catch', K.t); if (!H.wantYou && !Y && H.st === 'fly' && H.t > 5) { H.st = 'in'; H.t = 0; H.target = 'kes'; H.from.copy(hawk.position); } }
    else if (K.ph === 'land') { D = hawkD('catch', K.t, { dip: Math.max(0, 1 - K.t / 0.5) }); if (K.t > 0.6) K = { ph: 'hold', t: 0 }; }
    D.head[1] = 0.45; applyD(THREE, kes, D, K.t, 1); kes.rotation.y += Math.atan2(Math.sin((Y || near ? Math.atan2(P.x - FX, P.z - FZ) : Math.PI / 2) - kes.rotation.y), Math.cos((Y || near ? Math.atan2(P.x - FX, P.z - FZ) : Math.PI / 2) - kes.rotation.y)) * Math.min(1, dt * 3);
    // YOU (the walk's fox): catch → hold + treat → send → watch
    if (H.wantYou && H.st === 'fly' && !Y && fox) { Y = { t: 0 }; H.st = 'in'; H.t = 0; H.target = 'you'; H.from.copy(hawk.position); }
    if (Y && fox && fox.userData.P && fox.userData.P.fore) { Y.t += dt; const t = Y.t; if (!near && !(Y.sendAt && t > Y.sendAt)) { if (Y.glove && Y.glove.parent) Y.glove.parent.remove(Y.glove); Y = null; H.wantYou = false; endPose(fox); if (H.on === 'you') { H.on = null; H.st = 'out'; H.t = 0; H.from.copy(hawk.position); } else if (H.st === 'in' && H.target === 'you') { H.target = 'kes'; H.t = 0; H.from.copy(hawk.position); } }   // s639b: walking away frees the hawk (back to Kestrel) + takes the glove off
      else { if (!Y.glove) Y.glove = glove(fox.userData.P); const landed = H.on === 'you', Dy = !landed && t < 4.6 ? hawkD('catch', t) : t < (Y.sendAt || 1e9) ? hawkD('offer', t, {}) : t < Y.sendAt + 0.8 ? hawkD('send', t, { k: (t - Y.sendAt) / 0.6 }) : hawkD('watch', t);
        if (landed && !Y.landT) Y.landT = t; if (Y.landT) { const d = Math.max(0, 1 - (t - Y.landT) / 0.5); if (d > 0) { const C = hawkD('catch', t, { dip: d }); applyD(THREE, fox, C, t, 1); } else applyD(THREE, fox, Dy, t, 1); if (!Y.sendAt && t - Y.landT > 3) Y.sendAt = t; } else applyD(THREE, fox, Dy, t, 1);
        if (Y.sendAt && t > Y.sendAt + 0.45 && H.on === 'you') { H.on = null; H.st = 'out'; H.t = 0; H.from.copy(hawk.position); H.wantYou = false; }
        if (Y.sendAt && t > Y.sendAt + 3) { endPose(fox); if (Y.glove && Y.glove.parent) Y.glove.parent.remove(Y.glove); Y = null; stillT = -6; } } }
    // the hawk
    const flapK = H.t * 14;
    if (H.on === 'you' && !Y) { H.on = null; H.st = 'out'; H.t = 0; H.from.copy(hawk.position); }   // safety: never ride on you without the catch running
    if (H.on) { const f = H.on === 'kes' ? kes : fox, p = handW(f); hawk.position.copy(p); hawk.rotation.set(0, f.rotation.y + Math.PI / 2 + 0.3 * Math.sin(H.t * 0.7), 0); head.rotation.y = 0.6 * Math.sin(H.t * 1.3); wingFlap(0, true); }
    else if (H.st === 'out') { const k = Math.min(1, H.t / 1.6), A = circ(H.a), p = H.from.clone().lerp(A, k * k * (3 - 2 * k)); p.y += Math.sin(k * Math.PI) * 1.5; hawk.lookAt(p.clone().add(p.clone().sub(hawk.position))); hawk.position.copy(p); wingFlap(flapK, false); if (k >= 1) { H.st = 'fly'; H.t = 0; } }
    else if (H.st === 'fly') { H.a += dt * 0.5; const p = circ(H.a), n = circ(H.a + 0.05); hawk.position.copy(p); hawk.lookAt(n); hawk.rotateZ(-0.35); wingFlap(H.t % 3 < 1.2 ? flapK * 0.8 : 0, false); }
    else if (H.st === 'in') { const tf = H.target === 'kes' ? kes : fox, to = handW(tf), k = Math.min(1, H.t / 1.6), p = H.from.clone().lerp(to, 1 - Math.pow(1 - k, 2)); p.y += Math.sin(k * Math.PI) * 0.8; hawk.lookAt(to); hawk.position.copy(p); wingFlap(flapK * (k > 0.8 ? 1.6 : 1), false);
      if (k >= 1) { H.on = H.target; H.st = 'perch'; H.t = 0; if (H.target === 'kes') K = { ph: 'land', t: 0 }; } } }
  return { tick, prompt: P => (near && !Y ? 'STAND STILL · KESTREL SENDS THE HAWK TO YOUR GLOVE' : null), kes, hawk };
}
