// MERU 2.0 — s641 ART BY THE FOUNTAIN (Ben: bring 2 of the Blind Canvas COLOUR INSIDE THE LINES easels to the Meru fountain + a painting
// animation; a fox painting at one, the other open to you). engine/colour-easels.js (a copy of the gallery's colouring) builds the 2 easels,
// a gravel pad, the paint table + the COLOUR INSIDE THE LINES sign, at the free spot round the fountain furthest from every plaza path.
// EASEL 1: PIP the painter (jointed) paints for real: brush dabs (fox-poses workD 'easel'), and every few dabs the next shape on her canvas
// fills with colour; a finished picture stays up a while, then a fresh sheet + a new picture. EASEL 2: yours. Walk up → COLOUR INSIDE THE
// LINES (E / TALK) → the raised-lines panel; your fox stands at the easel painting while it is open; HANG ON THE EASEL keeps it (this device).
import { setupColour } from '../engine/colour-easels.js';
import { applyD, endPose, workD } from '../engine/fox-poses.js?v=s648k';
export function buildEasels({ THREE, scene, kit, L, ground, touch }) {
  const gy = (x, z) => { try { return ground(x, z, 0).h || 0; } catch (e) { return 0; } };
  // the spot: radius 17.5 round the fountain, the angle furthest from every plaza path out of the centre
  const PA = (L.PATHS || []).filter(q => Math.hypot(q.p[0][0], q.p[0][1]) < 1.5).map(q => Math.atan2(q.p[1][0] - q.p[0][0], q.p[1][1] - q.p[0][1]));
  let best = 0.6, bd = -1; for (let a = 0; a < Math.PI * 2; a += 0.05) { const m = PA.length ? Math.min(...PA.map(b => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))))) : 1; if (m > bd) { bd = m; best = a; } }
  const R = 17.5, at = (da, r = R) => [Math.sin(best + da) * r, Math.cos(best + da) * r], out = a => Math.atan2(Math.sin(best + a), Math.cos(best + a));
  const [e1x, e1z] = at(-0.09), [e2x, e2z] = at(0.09), [tx, tz] = at(0, R + 0.4), [sx, sz] = at(0.26, R - 0.6);
  const EZ = [{ x: e1x, z: e1z, face: out(-0.09), pic: 'flower' }, { x: e2x, z: e2z, face: out(0.09), pic: 'house' }];   // boards face away from the fountain: you paint looking at it
  const xs = [e1x, e2x, tx], zs = [e1z, e2z, tz]; const CO = { x0: Math.min(...xs) - 1.3, x1: Math.max(...xs) + 1.3, z0: Math.min(...zs) - 1.3, z1: Math.max(...zs) + 1.3, sign: [sx, sz], table: [tx, tz], signFace: Math.atan2(-sx, -sz) + Math.PI };
  const colliders = []; const W = { THREE, scene, groundAt: (x, _y, z) => gy(x, z), addNear: () => {} };
  const C = setupColour({ G: { world: W }, easels: EZ, corner: CO, store: 'meru2.colour' });
  // PIP the painter at easel 1 (stands in front of the board, facing it + the fountain beyond)
  const E1 = EZ[0], fx = E1.x + Math.sin(E1.face) * 0.95, fz = E1.z + Math.cos(E1.face) * 0.95;
  const pip = kit.makeFox({ key: 'fountainPainter', name: 'Pip', joints: true, torso: ['#f3f2f2', '#ec3013', '#201e1d'], outfit: 'vest', female: true, mood: 'happy', look: { fur: '#e08a3c', furDark: '#a8561f' } });
  pip.position.set(fx, gy(fx, fz), fz); pip.rotation.y = E1.face + Math.PI; scene.add(pip);
  const Pp = pip.userData.P; if (Pp && Pp.hands) { const brush = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), new THREE.MeshLambertMaterial({ color: 0xb08356 })); h.rotation.x = Math.PI / 2; h.position.z = 0.1; brush.add(h); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.06, 6), new THREE.MeshLambertMaterial({ color: 0x2f6fd6 })); tip.rotation.x = Math.PI / 2; tip.position.z = 0.27; brush.add(tip); brush.position.set(0, -0.08, 0.02); Pp.hands[1].g.add(brush);
    const pal = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.015, 18), new THREE.MeshLambertMaterial({ color: 0xb08356 })); pal.scale.z = 0.7; pal.position.set(0, -0.06, 0.08); Pp.hands[0].g.add(pal); }
  colliders.push({ c: [fx, fz, 0.45] }, { c: [EZ[0].x, EZ[0].z, 0.6] }, { c: [EZ[1].x, EZ[1].z, 0.6] }, { c: [tx, tz, 0.55] });
  let t = 0, nextFill = 3, full = 0, picI = 0, mine = null; const PICS = C.pics || ['flower'];
  function tick(dt, P, fox) { t += dt; const d = Math.hypot(P.x - fx, P.z - fz); pip.visible = d < (touch ? 70 : 120); if (!pip.visible) return;
    kit.animFox(pip, dt, 0, false); if (Pp && Pp.fore) applyD(THREE, pip, workD('easel', t), t, 1);
    if (full > 0) { full -= dt; if (full <= 0) { picI = (picI + 1) % PICS.length; C.reset(0, PICS[picI]); nextFill = 2; } }
    else if ((nextFill -= dt) <= 0 && (t % 9) < 6.6) { nextFill = 2.4 + Math.random() * 2; if (!C.autoFill(0)) full = 14; }
    // you at easel 2 while the panel is open
    const open = C.isOpen && C.isOpen(); if (open && fox && fox.userData.P && fox.userData.P.fore) { const E2 = EZ[1], px = E2.x + Math.sin(E2.face) * 0.95, pz = E2.z + Math.cos(E2.face) * 0.95; fox.position.set(px, gy(px, pz), pz); fox.rotation.y = E2.face + Math.PI; P.x = px; P.z = pz; applyD(THREE, fox, workD('easel', t + 3), t, 1); mine = fox; }
    else if (mine) { endPose(mine); mine = null; } }
  const nearMine = P => Math.hypot(P.x - EZ[1].x, P.z - EZ[1].z) < 2.3;
  return { tick, colliders, prompt: P => (nearMine(P) && !(C.isOpen && C.isOpen()) ? 'COLOUR INSIDE THE LINES · RAISED LINES YOU CAN FEEL' : null), talk: P => { if (!nearMine(P)) return false; C.open({ easel: 1 }); return true; }, busy: () => !!(C.isOpen && C.isOpen()) };
}
