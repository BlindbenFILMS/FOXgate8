// 8 GATES · SPACE MAP · CREATURE NESTS (s381, from the 2D seedTheDeep NESTS + nestRock / postWatch / nestRouse / nestRockBroken).
// THE HOLLOW (Starserpents) · THE LANTERN HOUSE (Void Moths) · THE CISTERN (Deephands = our Octopus), 120° apart past the edge.
// Each: an unbreakable CORE rock with a glowing mouth, 8 BIG rocks (34 hull, prizes) on ring A + 16 small ones on ring B (one hit,
// nothing in them), turning opposite ways. A WATCH of 3 beasts circles the core from the moment you are near. Every rock you break
// ROUSES the nest (big = 2, small = 1): the watch comes at you and a GARRISON of up to 3 more crawl out of the mouth.
// Prizes (2D nestPrize): slot 2 = the WEAPON CRATE (once ever), slots 0 + 4 = PEARLS, the rest = cells. Broken rock regrows after
// 5 minutes (wall clock); the crate never does. Saved in space.finds.v1 nests{}.
import { NESTS, NEST, FINDS } from './space-galaxy.js?v=s441';
const TAU = Math.PI * 2;
const prizeOf = i => i === 2 ? 'crate' : (i === 0 || i === 4) ? 'pearl' : 'cells';

export function createNests(X) {
  const { THREE, scene, toon, label, INST, LOW, dotTex, F, saveF } = X;
  let St, combat, beasts, toast, burst, save;
  if (!F.nests || typeof F.nests !== 'object') F.nests = {};
  // a lumpy rock: icosphere pushed by layered sines (cheap, deterministic), flat-shaded toon
  const rockGeo = (det, seed, k = 0.22) => { const g = new THREE.IcosahedronGeometry(1, det), P = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const n = Math.sin(v.x * 3.1 + seed) * Math.sin(v.y * 2.7 + seed * 1.7) * Math.sin(v.z * 3.4 + seed * 0.6) + 0.5 * Math.sin(v.x * 7 + v.z * 5 + seed); v.multiplyScalar(1 + n * k); P.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); return g; };
  const rockMat = toon('#6f655c', { flatShading: true }), bigGeo = rockGeo(LOW ? 1 : 2, 3.3), smallGeo = rockGeo(1, 7.1, 0.28);
  const nB = NESTS.length * NEST.big, nS = NESTS.length * NEST.small;
  const bigMesh = new THREE.InstancedMesh(bigGeo, rockMat, nB), smallMesh = new THREE.InstancedMesh(smallGeo, rockMat, nS);
  bigMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(nB * 3).fill(1), 3); bigMesh.frustumCulled = smallMesh.frustumCulled = false; scene.add(bigMesh); scene.add(smallMesh);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
  function rockPos(n, r, out) { const a = r.a + n.rot * (r.big ? 1 : -1.4); return out.set(n.N.x + Math.cos(a) * r.r, r.big ? -8 : -4, n.N.z + Math.sin(a) * r.r); }
  const nests = NESTS.map((N, ni) => {
    const S = F.nests[N.key] || (F.nests[N.key] = { broken: [], regrowAt: 0, crate: false });
    if (S.regrowAt && Date.now() > S.regrowAt) { S.broken = []; S.regrowAt = 0; }
    const g = new THREE.Group(); g.position.set(N.x, -NEST.core - 4, N.z); scene.add(g);
    const core = new THREE.Mesh(rockGeo(LOW ? 2 : 3, ni * 5.1 + 1, 0.18), toon('#4e4740', { flatShading: true })); core.scale.setScalar(NEST.core); g.add(core);
    // the mouth: a dark hollow + the beast's glow inside it, facing south (toward the usual camera)
    const mouth = new THREE.Mesh(new THREE.CircleGeometry(NEST.core * 0.28, 24), new THREE.MeshBasicMaterial({ color: '#05030a' })); mouth.position.set(0, NEST.core * 0.55, NEST.core * 0.86); mouth.lookAt(0, NEST.core * 1.2, NEST.core * 3); g.add(mouth);
    const glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: N.tint, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 })); glowS.position.set(0, NEST.core * 0.62, NEST.core * 0.95); glowS.scale.setScalar(NEST.core * 0.9); g.add(glowS);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: N.tint, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.18 })); halo.scale.setScalar(NEST.core * 4.2); g.add(halo);
    const rings = []; for (const [r, w] of [[NEST.ringA, 2.2], [NEST.ringB, 1.6]]) { const m = new THREE.Mesh(new THREE.RingGeometry(r - w, r + w, 96), new THREE.MeshBasicMaterial({ color: N.tint, transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(N.x, -6, N.z); scene.add(m); rings.push(m); }
    const lb = label(N.name, 'NEST · ' + N.beasts, '#ffffff', N.tint, 1.05, 520); lb.position.set(N.x + NEST.core + 6, 1, N.z - NEST.core * 0.6);
    INST.push({ virtual: true, x: N.x, z: N.z, fr: 34, frange: 80 });
    const rocks = [];
    for (let i = 0; i < NEST.big; i++) rocks.push({ big: true, i, slot: 'b' + i, prize: prizeOf(i), R: 7 + (i % 3) * 0.7, a: i / NEST.big * TAU, r: NEST.ringA, hp: NEST.bigHp, flash: 0, idx: ni * NEST.big + i, gone: S.broken.includes('b' + i) || (prizeOf(i) === 'crate' && S.crate) });
    for (let i = 0; i < NEST.small; i++) rocks.push({ big: false, i, slot: 's' + i, R: 2.6 + (i % 4) * 0.5, a: i / NEST.small * TAU + 0.19, r: NEST.ringB, hp: 1, flash: 0, idx: ni * NEST.small + i, gone: S.broken.includes('s' + i) });
    return { N, S, g, core, glowS, halo, rings, lb, rocks, rot: 0, awake: false, watch: [], guards: [], anger: 0, dirty: true };
  });
  function placeRocks(n, t) { for (const r of n.rocks) { rockPos(n, r, _v); _e.set(r.i * 0.7 + t * 0.06 * (r.i % 2 ? 1 : -1), r.i * 1.3, 0); _q.setFromEuler(_e); const sc = r.gone ? 0.0001 : r.R; _s.set(sc, sc * 0.82, sc); _m.compose(_v, _q, _s);
      if (r.big) { bigMesh.setMatrixAt(r.idx, _m); if (r.flash > 0) _c.setRGB(2, 2, 2); else { const dmg = 1 - r.hp / NEST.bigHp; _c.setRGB(1, 1 - dmg * 0.25, 1 - dmg * 0.5); } bigMesh.setColorAt(r.idx, _c); } else smallMesh.setMatrixAt(r.idx, _m); }
    bigMesh.instanceMatrix.needsUpdate = true; bigMesh.instanceColor.needsUpdate = true; smallMesh.instanceMatrix.needsUpdate = true; }
  function sleepNest(n) { n.awake = false; for (const c of [...n.watch, ...n.guards]) beasts.remove(c); n.watch = []; n.guards = []; n.anger = 0; }
  function wakeNest(n) { n.awake = true; if (n.S.regrowAt && Date.now() > n.S.regrowAt) { n.S.broken = []; n.S.regrowAt = 0; n.rocks.forEach(r => { r.gone = r.prize === 'crate' && n.S.crate; r.hp = r.big ? NEST.bigHp : 1; }); n.dirty = true; saveF(); toast(n.N.name + ' HAS TURNED OVER · NEW ROCK ON THE RINGS', 3.5); }
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; n.watch.push(beasts.spawn(n.N.fam, { x: n.N.x, z: n.N.z }, { dx: Math.cos(a) * NEST.watchR, dz: Math.sin(a) * NEST.watchR, orbit: { r: NEST.watchR + (i - 1) * 7, a, spd: 0.25 * (i % 2 ? 1 : -1) }, leash: { x: n.N.x, z: n.N.z, r: NEST.leash }, nest: n.N.key })); }
    n.watch = n.watch.filter(Boolean); }
  function rouse(n, k) { n.anger += k; n.watch.forEach(c => beasts.provoke(c, 30));
    for (let j = 0; j < k; j++) { if (n.guards.filter(c => !c.dead).length >= NEST.garrison) { if (j === 0) toast(n.N.name + ' IS AWAKE', 2.4); return; }
      const a = Math.PI / 2 + (Math.random() - 0.5) * 0.8, x = n.N.x + Math.cos(a) * (NEST.core + 8), z = n.N.z + Math.sin(a) * (NEST.core + 8);
      const c = beasts.spawn(n.N.fam, { x: n.N.x, z: n.N.z }, { dx: x - n.N.x, dz: z - n.N.z, leash: { x: n.N.x, z: n.N.z, r: NEST.leash }, noBack: true, prov: St.t + 9999, nest: n.N.key }); if (c) n.guards.push(c);
      burst(x, z, n.N.tint, 14, 1.4); }
    toast(n.anger <= 2 ? 'SOMETHING IN THE CORE HAS NOTICED' : n.N.name + ' IS COMING OUT', 2.6); }
  function breakRock(n, r) { r.gone = true; n.dirty = true; if (!n.S.broken.includes(r.slot)) n.S.broken.push(r.slot); if (!n.S.regrowAt) n.S.regrowAt = Date.now() + NEST.regrowMs;
    const x = n.N.x + Math.cos(r.a + n.rot * (r.big ? 1 : -1.4)) * r.r, z = n.N.z + Math.sin(r.a + n.rot * (r.big ? 1 : -1.4)) * r.r;
    burst(x, z, r.big ? '#ffd23a' : '#9a8f84', r.big ? 22 : 8, r.big ? 1.8 : 1); rouse(n, r.big ? 2 : 1); if (combat.dropCoin) combat.dropCoin(x, z, r.big ? 4 : 1, true);   /* s469 every rock leaves coins */
    if (r.big) { if (r.prize === 'crate') { n.S.crate = true; combat.drop('coin', x, z, 400); combat.drop('coin', x, z, 400); combat.drop('shield', x, z); try { save.addXp(150); } catch (e) {} toast('WEAPON CRATE! Old arms, sealed. Worth a fortune.', 4.5); }
      else if (r.prize === 'pearl') { const v = 400 + Math.floor(Math.random() * 220); for (let k = 0; k < 3; k++) combat.drop('coin', x, z, Math.round(v / 3)); toast('A PEARL in the rock · ' + v + ' G', 3); }
      else { combat.drop(['shield', 'energy', 'health'][(Math.random() * 3) | 0], x, z); combat.drop(['shield', 'energy', 'health'][(Math.random() * 3) | 0], x, z); } }
    saveF(); }
  nests.forEach(n => placeRocks(n, 0));
  return {
    nests,
    attach(o) { St = o.St; combat = o.combat; beasts = o.beasts; toast = o.toast; burst = o.burst; save = o.save; },
    hitShot(s) { const sx = s.m.position.x, sz = s.m.position.z;
      for (const n of nests) { if (Math.abs(n.N.x - sx) > NEST.ringB + 10 || Math.abs(n.N.z - sz) > NEST.ringB + 10) continue;
        for (const r of n.rocks) { if (r.gone) continue; rockPos(n, r, _v); if (Math.hypot(_v.x - sx, _v.z - sz) < r.R + (s.missile ? 1.5 : 0.5)) { r.hp -= r.big ? (s.dmg || 10) : 99; r.flash = 0.1; window.__spaceSnd && window.__spaceSnd('rockShot', { at: [sx, sz], v: 0.8 }); if (r.big) burst(sx, sz, '#ffd8a8', 4, 0.7); if (r.hp <= 0) breakRock(n, r); return true; } }
        if (Math.hypot(n.N.x - sx, n.N.z - sz) < NEST.core * 0.9) { burst(sx, sz, '#9a8f84', 3, 0.6); return true; } }   // the core: shots spark off it
      return false; },
    mini(x, tx, tz, k) { for (const n of nests) { x.strokeStyle = n.N.tint; x.lineWidth = 2; x.beginPath(); x.arc(tx(n.N.x), tz(n.N.z), Math.max(5, NEST.ringA * k), 0, 7); x.stroke(); x.fillStyle = n.N.tint; x.beginPath(); x.arc(tx(n.N.x), tz(n.N.z), Math.max(3, NEST.core * k), 0, 7); x.fill(); } },
    update(dt) { if (!St) return; const t = St.t;
      for (const n of nests) { const d = Math.hypot(n.N.x - St.x, n.N.z - St.z), vis = d < 700;
        n.g.visible = vis; n.rings.forEach(m => m.visible = vis);
        if (!n.awake && d < NEST.wake && St.phase === 'free') wakeNest(n); else if (n.awake && d > NEST.sleep) sleepNest(n);
        n.guards = n.guards.filter(c => !c.dead); n.watch = n.watch.filter(c => c && !(c.dead && c.noBack));
        if (!vis) continue;
        n.rot += dt * 0.025; n.core.rotation.y += dt * 0.01; n.glowS.material.opacity = 0.55 + 0.35 * Math.sin(t * 1.3 + n.N.x);
        for (const r of n.rocks) r.flash = Math.max(0, r.flash - dt); if (d < 420) placeRocks(n, t); }
    },
  };
}
