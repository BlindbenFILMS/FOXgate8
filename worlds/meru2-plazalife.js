// MERU 2.0 — s642 PLAZA LIFE round the fountain (Ben: "do them all"): KIDS playing (two throw + catch a ball, one skips rope, one plays
// hopscotch, two play TAG round a tree-free patch), a fox on a fountain bench FEEDING THE PIGEONS (pigeons peck + hop at the crumbs), and a
// COUPLE walking the fountain ring HOLDING PAWS. All jointed; poses from engine/fox-poses.js (k_ball, k_jumprope, k_hopscotch, k_tag,
// s_feedbirds, s_holdpaws). Only ticks within 60 m (phones 45 m).
import { applyPose, applyD, endPose, neutralD, FOX_ANIMS } from '../engine/fox-poses.js?v=s648k';
export function buildPlazaLife({ THREE, scene, kit, L, ground, touch }) {
  const gy = (x, z) => { try { return ground(x, z, 0).h || 0; } catch (e) { return 0; } }, R = Math.random, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const PA = (L.PATHS || []).filter(q => Math.hypot(q.p[0][0], q.p[0][1]) < 1.5).map(q => Math.atan2(q.p[1][0] - q.p[0][0], q.p[1][1] - q.p[0][1]));
  const free = (a, skip = []) => { let best = a, bd = -1; for (let k = -1.2; k <= 1.2; k += 0.05) { const b = a + k, m = Math.min(...PA.concat(skip).map(c => Math.abs(Math.atan2(Math.sin(b - c), Math.cos(b - c)))), 9); if (m > bd) { bd = m; best = b; } } return best; };
  let easelA = 0.6, bd0 = -1; for (let a = 0; a < Math.PI * 2; a += 0.05) { const m = PA.length ? Math.min(...PA.map(b => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(b - a) ? Math.cos(a - b) : 1)))) : 1; if (m > bd0) { bd0 = m; easelA = a; } }
  const kidA = free(easelA + Math.PI, [easelA]), at = (a, r) => [Math.sin(a) * r, Math.cos(a) * r];
  const LOOKS = [['#38bdf8', '#e0f2fe', '#0369a1'], ['#f472b6', '#fce7f3', '#9d174d'], ['#a3e635', '#ecfccb', '#3f6212'], ['#ffd23a', '#201e1d', '#a16207'], ['#a78bfa', '#ede9fe', '#5b21b6'], ['#f97316', '#fff7ed', '#9a3412']];
  const mk = (key, i, sc, opt = {}) => { const f = kit.makeFox({ joints: true, key, torso: LOOKS[i % LOOKS.length], outfit: i % 2 ? 'dress' : 'vest', female: !!(i % 2), mood: 'happy', ...opt }); f.scale.setScalar(sc); scene.add(f); return f; };
  const all = [], colliders = [];
  // ---- KIDS (scale 0.62) at radius 20 on the kids' side ----
  const [kx, kz] = at(kidA, 20), side = [Math.cos(kidA), -Math.sin(kidA)];
  const ballA = mk('kidBallA', 0, 0.62), ballB = mk('kidBallB', 1, 0.62); const bA = [kx + side[0] * 2.2, kz + side[1] * 2.2], bB = [kx - side[0] * 2.2, kz - side[1] * 2.2];
  ballA.position.set(bA[0], gy(...bA), bA[1]); ballB.position.set(bB[0], gy(...bB), bB[1]); ballA.rotation.y = Math.atan2(bB[0] - bA[0], bB[1] - bA[1]); ballB.rotation.y = ballA.rotation.y + Math.PI;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), new THREE.MeshLambertMaterial({ color: 0xec3013 })); scene.add(ball);
  const [jx, jz] = at(kidA + 0.18, 23), rope = mk('kidRope', 2, 0.62); rope.position.set(jx, gy(jx, jz), jz); rope.rotation.y = kidA + Math.PI;
  const ropeM = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.012, 4, 24, Math.PI * 1.2), new THREE.MeshLambertMaterial({ color: 0xffd23a })); scene.add(ropeM);
  const [hx, hz] = at(kidA - 0.2, 23), hop = mk('kidHop', 3, 0.62); hop.rotation.y = kidA - 0.2 + Math.PI / 2; const H0 = [hx, hz];
  const [tx, tz] = at(kidA, 25.5), tagA = mk('kidTagA', 4, 0.62), tagB = mk('kidTagB', 5, 0.62);
  // ---- BIRD FEEDER on the fountain bench nearest the kids' side ----
  const B = (window.__m2benches || []).filter(b => Math.hypot(b[0], b[1]) < 13).sort((a, b) => Math.abs(Math.atan2(Math.sin(Math.atan2(a[0], a[1]) - kidA - 1.2), Math.cos(Math.atan2(a[0], a[1]) - kidA - 1.2))) - Math.abs(Math.atan2(Math.sin(Math.atan2(b[0], b[1]) - kidA - 1.2), Math.cos(Math.atan2(b[0], b[1]) - kidA - 1.2))))[0];
  let feeder = null, pigeons = []; if (B) { feeder = mk('birdFeeder', 4, 1, { outfit: 'coat', mood: 'calm', look: { fur: '#b9aea4', furDark: '#857a70' } }); feeder.position.set(B[0] + Math.sin(B[2]) * 0.12, gy(B[0], B[1]) - 0.34, B[1] + Math.cos(B[2]) * 0.12); feeder.rotation.y = B[2]; feeder.userData.bench = B;
    const gm = new THREE.MeshLambertMaterial({ color: 0x8a8d96 }), hm = new THREE.MeshLambertMaterial({ color: 0x4a6b7a });
    for (let i = 0; i < 6; i++) { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), gm); b.scale.set(0.8, 0.8, 1.2); g.add(b); const h = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), hm); h.position.set(0, 0.07, 0.08); g.add(h); scene.add(g); const a = R() * 6.28, r = 0.9 + R() * 1.2; pigeons.push({ g, h, a, r, ph: R() * 9 }); } }
  // ---- COUPLE walking the ring (radius 14.5), holding paws ----
  const cA = mk('ringCoupleA', 0, 1, { mood: 'love' }), cB = mk('ringCoupleB', 1, 1, { mood: 'love' }); let ca = R() * 6.28;
  all.push(ballA, ballB, rope, hop, tagA, tagB, cA, cB); if (feeder) all.push(feeder);
  let t = 0, near = false, tag = { it: 0, a: 0, b: Math.PI, cool: 0, lunge: 0 }, hopX = 0;
  function tick(dt, P) { const d = Math.hypot(P.x - kx, P.z - kz), on = d < (touch ? 45 : 60); if (on !== near) { near = on; all.forEach(f => { f.visible = on; if (!on) endPose(f); }); ball.visible = ropeM.visible = on; pigeons.forEach(q => { q.g.visible = on; }); } if (!on) return; t += dt;
    // ball: a throw each 3 s, A → B → A
    const bt = t % 6, toB = bt < 3, k = (bt % 3) / 3; for (const [f, me] of [[ballA, true], [ballB, false]]) { kit.animFox(f, dt, 0, false); applyPose(THREE, f, 'k_ball', ((toB === me) ? (bt % 3) : (bt % 3) + 1.5) % 3, 1); }
    const fr = toB ? bA : bB, to = toB ? bB : bA, fl = Math.min(1, Math.max(0, (k - 0.2) / 0.55)); ball.position.set(fr[0] + (to[0] - fr[0]) * fl, gy(fr[0], fr[1]) + 0.55 + Math.sin(fl * Math.PI) * 1.4, fr[1] + (to[1] - fr[1]) * fl);
    kit.animFox(rope, dt, 0, false); applyPose(THREE, rope, 'k_jumprope', t, 1); const ra = t * Math.PI * 2 * 1.5; ropeM.position.set(jx, rope.position.y + 0.45, jz); ropeM.rotation.set(ra, rope.rotation.y, 0, 'YXZ'); ropeM.rotation.order = 'YXZ'; ropeM.rotation.set(-ra, rope.rotation.y + Math.PI / 2, 0);
    hopX = (t % 6) / 6; const hd = [Math.sin(hop.rotation.y), Math.cos(hop.rotation.y)]; hop.position.set(H0[0] + hd[0] * hopX * 2.6, gy(...H0), H0[1] + hd[1] * hopX * 2.6); kit.animFox(hop, dt, 0, false); applyPose(THREE, hop, 'k_hopscotch', (t % 6) / 2, 1);
    // tag: runner + chaser on a 3 m circle; when caught the chaser lunges, they swap
    tag.a += dt * 1.15; tag.b += dt * 1.15 * (tag.lunge > 0 ? 0 : 1.08); if (tag.lunge > 0) tag.lunge -= dt; const gap = Math.atan2(Math.sin(tag.a - tag.b), Math.cos(tag.a - tag.b));
    if (Math.abs(gap) < 0.25 && tag.lunge <= 0 && tag.cool <= 0) { tag.lunge = 0.9; tag.cool = 3; [tag.a, tag.b] = [tag.b - 0.9, tag.a]; } tag.cool -= dt;
    for (const [f, a, chase] of [[tagA, tag.it ? tag.b : tag.a, false], [tagB, tag.it ? tag.a : tag.b, true]]) { const x = tx + Math.sin(a) * 3, z = tz + Math.cos(a) * 3; f.position.set(x, gy(x, z), z); f.rotation.y = a + Math.PI / 2; kit.animFox(f, dt, chase && tag.lunge > 0 ? 0 : 3.6, false); if (chase && tag.lunge > 0) applyPose(THREE, f, 'k_tag', 1.6, 1); }
    // feeder + pigeons
    if (feeder) { kit.animFox(feeder, dt, 0, false); applyPose(THREE, feeder, 's_feedbirds', t, 1); const Bb = feeder.userData.bench, fx = Bb[0] + Math.sin(Bb[2]) * 1.4, fz = Bb[1] + Math.cos(Bb[2]) * 1.4;
      for (const q of pigeons) { q.ph += dt; if (R() < dt * 0.4) { q.a += (R() - 0.5) * 1.2; q.r = 0.6 + R() * 1.4; } const x = fx + Math.cos(q.a) * q.r, z = fz + Math.sin(q.a) * q.r, peck = Math.max(0, Math.sin(q.ph * 7)) > 0.7; q.g.position.lerp(V(x, gy(x, z) + 0.06 + (Math.sin(q.ph * 3) > 0.95 ? 0.08 : 0), z), Math.min(1, dt * 2)); q.g.rotation.y = Math.atan2(fx - x, fz - z); q.h.position.y = peck ? 0.02 : 0.07; } }
    // couple
    ca += dt * 0.085; for (const [f, r, inside] of [[cA, 14.2, 0], [cB, 14.9, 1]]) { const x = Math.sin(ca) * r, z = Math.cos(ca) * r; f.position.set(x, gy(x, z), z); f.rotation.y = ca + Math.PI / 2; kit.animFox(f, dt, 1.2, false); const D = neutralD(); D.a[inside ? 1 : 0] = [-0.02, -0.56, 0.1 + 0.05 * Math.sin(t * 5)]; D.g[inside ? 1 : 0] = 0.6; D.palm[inside ? 1 : 0] = [-1, 0, 0]; D.head = [0, (inside ? -1 : 1) * 0.4 * (Math.sin(t * 0.7) > 0.6 ? 1 : 0), 0]; D.mood = 'love'; D.mp = { smile: 0.7 }; D.freeLegs = true; applyD(THREE, f, D, t, 0.85); } }
  return { tick, colliders };
}
