// MERU 2.0 — BACKROOMS: the shared UNDER-FLOOR room kit (same trick as the tavern cellar, worlds/meru2-cellar.js).
// spec = { rect: {x0,x1,z0,z1}, y (floor), top (ceiling), stair: {x0,x1,z0,z1,dir} (dir +1 = steps go down toward +x, -1 toward -x),
//          wall: texture, floor: texture, tint }. dress(b, ctx) adds the room's props to a room-kit Bin (merged by material).
// No floor is cut: room + stairs draw first (renderOrder -2), then a depth-only cap over the opening (renderOrder -1).
import { makeRoomKit } from './meru2-roomkit.js';

export function makeUnder({ THREE, scene, cols, touch }, spec, dress) {
  const R = spec.rect, S = spec.stair, Y = spec.y, TOP = spec.top ?? -0.15, H = TOP - Y, cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2, dir = S.dir || 1;
  const G = new THREE.Group(); scene.add(G); const K = makeRoomKit({ THREE, touch }), b = K.Bin();
  const wt = spec.wall; wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set((R.x1 - R.x0) / (spec.wallRep || 3), H / (spec.wallRep || 3));
  const shell = new THREE.Mesh(new THREE.BoxGeometry(R.x1 - R.x0, H, R.z1 - R.z0), new THREE.MeshLambertMaterial({ map: wt, side: THREE.BackSide, color: spec.tint ?? 0xffffff })); shell.position.set(cx, Y + H / 2, cz); G.add(shell);
  K.flat(G, spec.floor, R.x1 - R.x0 - 0.1, R.z1 - R.z0 - 0.1, cx, Y + 0.02, cz, spec.floorRep || 2, spec.floorMat ? spec.floorMat(spec.floor) : null);
  // the stair: 12 steps, side walls, hand rail, a frame + rail round the opening at floor level (colliders with y0, so only on the stair + floor)
  { const n = 12, len = S.x1 - S.x0, run = len / n, rise = -Y / n, w = S.z1 - S.z0, mz = (S.z0 + S.z1) / 2, sc = spec.stepCol || ['#5c6670', '#6b737b'];
    for (let i = 0; i < n; i++) { const top = -rise * (i + 1) + rise * 0.5, x = dir > 0 ? S.x0 + run * (i + 0.5) : S.x1 - run * (i + 0.5); b.box('mat', sc[i % 2], run + 0.02, top - Y, w, x, (top + Y) / 2, mz); b.box('mat', '#e0b23a', 0.06, 0.012, w, x - dir * (run / 2 - 0.03), top + 0.006, mz); }
    for (const z of [S.z0 - 0.12, S.z1 + 0.12]) b.box('mat', spec.shaftCol || '#8e939a', len, -Y + 0.02, 0.22, (S.x0 + S.x1) / 2, Y / 2, z);
    const yAt = x => -(dir > 0 ? (x - S.x0) : (S.x1 - x)) / len * -Y;
    for (let i = 0; i <= 4; i++) { const x = S.x0 + 0.3 + i * (len - 0.6) / 4; b.box('gls', '#9aa0a6', 0.05, 0.9, 0.05, x, yAt(x) + 0.45, S.z1 + 0.05); }
    b.box('gls', '#c9a227', len, 0.05, 0.05, (S.x0 + S.x1) / 2, Y / 2 + 0.9, S.z1 + 0.05, 0, 0, dir * -Math.atan2(-Y, len));
    for (const z of [S.z0 - 0.08, S.z1 + 0.08]) b.box('mat', '#3f4854', len + 0.2, 0.06, 0.12, (S.x0 + S.x1) / 2, 0.06, z); b.box('mat', '#3f4854', 0.12, 0.06, w + 0.3, dir > 0 ? S.x1 + 0.05 : S.x0 - 0.05, 0.06, mz);
    for (const z of [S.z0 - 0.1, S.z1 + 0.1]) { for (let x = S.x0 + 0.3; x <= S.x1 - 0.1; x += (len - 0.4) / 4) b.box('gls', '#9aa0a6', 0.06, 1.0, 0.06, x, 0.5, z); b.box('gls', '#ffd23a', len - 0.3, 0.06, 0.07, (S.x0 + S.x1) / 2, 1.0, z); }
    for (const z of [S.z0 - 0.15, S.z1 + 0.15]) cols.push({ f: dir > 0 ? [S.x0 + 0.2, S.x1, z - 0.05, z + 0.05] : [S.x0, S.x1 - 0.2, z - 0.05, z + 0.05], y0: Y - 1, y1: 0.6 });
    cols.push({ f: dir > 0 ? [S.x1, S.x1 + 0.1, S.z0, S.z1] : [S.x0 - 0.1, S.x0, S.z0, S.z1], y0: -1.2, y1: 0.6 }); }
  // walls (below the floor only)
  cols.push({ f: [R.x0 - 0.3, R.x0, R.z0, R.z1], y0: Y - 1, y1: -0.8 }, { f: [R.x1, R.x1 + 0.3, R.z0, R.z1], y0: Y - 1, y1: -0.8 }, { f: [R.x0, R.x1, R.z0 - 0.3, R.z0], y0: Y - 1, y1: -0.8 }, { f: [R.x0, R.x1, R.z1, R.z1 + 0.3], y0: Y - 1, y1: -0.8 });
  const solid = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1], y0: Y - 1, y1: -0.8 }), round = (x, z, r) => cols.push({ c: [x, z, r], y0: Y - 1, y1: -0.8 });
  const extra = dress(b, { K, G, Y, TOP, R, S, solid, round, THREE }) || [];
  b.build(G); G.traverse(o => { if (o.isMesh) o.renderOrder = -2; });
  const cap = new THREE.Mesh(new THREE.PlaneGeometry(S.x1 - S.x0, S.z1 - S.z0), new THREE.MeshBasicMaterial({ colorWrite: false })); cap.rotation.x = -Math.PI / 2; cap.position.set((S.x0 + S.x1) / 2, 0.09, (S.z0 + S.z1) / 2); cap.renderOrder = -1; scene.add(cap);
  const inR = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
  return {
    groundAt(x, z, y) { if (inR(x, z, S) && y < 0.6) { const f = dir > 0 ? (x - S.x0) / (S.x1 - S.x0) : (S.x1 - x) / (S.x1 - S.x0); return Math.max(Y, -f * -Y); } if (inR(x, z, R) && y < -1) return Y; return null; },
    tick(cam, dt, t) { const v = Math.hypot(cam.x - cx, cam.z - cz) < (touch ? 60 : 110); G.visible = v; cap.visible = v; if (v && extra.tick) extra.tick(dt, t); },
  };
}
