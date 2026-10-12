// MERU 2.0 — LAKE RESCUE (Ben: "the player can carry anyone who needs help in the water").
// One swimmer in trouble at a time, out in deep water: bobbing low, thrashing (splashes), a pulsing red ring, a HELP marker on the compass.
// Swim up, 1 = GRAB. You carry them on their back beside you (slower, no diving). Reach the shallows, a jetty or land = safe: reward (DRAFT).
// No dialogue: prompts + toasts only. Stats: meru2Rescues (count).
import { PLAYER_MALE } from '../fox-kit.js';

export const RESCUE = { gold: 10, xp: 15, every: [70, 120], firstAfter: 20, minShore: 22, near: 130, draft: true };
const LOOKS = [
  [['#38bdf8', '#e0f2fe', '#0369a1'], '#e9772c'], [['#f472b6', '#fce7f3', '#9d174d'], '#d86a26'], [['#ffd23a', '#e6b45a', '#7a5c38'], '#c9b48a'],
  [['#22c55e', '#dcfce7', '#14532d'], '#f08a3c'], [['#f3f2f2', '#2e4a6b', '#16263c'], '#a8a29a'],
];

export function buildRescue({ THREE, scene, kit, lake, L, ground, shoreD, save }) {
  const LW = L.WATER[0].e, I = L.ISLAND;
  const ringM = new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 32), ringM); ring.rotation.x = -Math.PI / 2; ring.visible = false; scene.add(ring);
  const S = { v: null, state: 'off', wait: RESCUE.firstAfter, t: 0, look: 0, x: 0, z: 0, warned: false, safeT: 0 };
  let toast = '', toastT = 0;
  const say = (t, s = 2.5) => { toast = t; toastT = s; };

  function spot(P) {
    for (let k = 0; k < 40; k++) { const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 70, x = P.x + Math.cos(a) * r, z = P.z + Math.sin(a) * r;
      const inL = L.inLake(x, z); if (!inL) continue;
      if (L.islandR(x, z) < I.c[2] + 18) continue; const g = ground(x, z, 0); if (!g.water || shoreD(x, z) < RESCUE.minShore) continue; return [x, z]; }
    return null; }
  function spawn(P) { const p = spot(P); if (!p) { S.wait = 8; return; }
    const [torso, fur] = LOOKS[S.look++ % LOOKS.length];
    if (S.v) scene.remove(S.v);
    S.v = kit.makeFox({ key: 'lakeSwimmer', look: { ...PLAYER_MALE, fur }, torso, outfit: 'tee', crest: '', gear: 'none' }); S.v.scale.multiplyScalar(0.92); S.v.rotation.order = 'YXZ'; scene.add(S.v);
    [S.x, S.z] = p; S.state = 'help'; S.t = 0; S.warned = false; }
  function clear() { if (S.v) scene.remove(S.v); S.v = null; S.state = 'off'; ring.visible = false; S.wait = RESCUE.every[0] + Math.random() * (RESCUE.every[1] - RESCUE.every[0]); }

  function tick(dt, P, active) {
    if (toastT > 0) { toastT -= dt; if (toastT <= 0) toast = ''; }
    const nearLake = shoreD(P.x, P.z) > -60;
    if (S.state === 'off') { if (active && nearLake) { S.wait -= dt; if (S.wait <= 0) spawn(P); } return; }
    S.t += dt; const v = S.v, wv = lake.waveAt ? lake.waveAt(S.x, S.z) : 0;
    if (S.state === 'help') {
      const d = Math.hypot(P.x - S.x, P.z - S.z);
      if (d > 260 || !active) { clear(); return; }
      if (!S.warned && d < RESCUE.near) { S.warned = true; say('SOMEONE NEEDS HELP IN THE WATER', 3); }
      v.position.set(S.x + Math.sin(S.t * 1.7) * 0.15, -1.05 + wv + Math.abs(Math.sin(S.t * 3.1)) * 0.25, S.z); v.rotation.set(Math.sin(S.t * 4) * 0.18, Math.atan2(P.x - S.x, P.z - S.z), Math.sin(S.t * 3.3) * 0.22);
      const Pf = v.userData.P; if (Pf && Pf.arms) Pf.arms.forEach((a, i) => { a.rotation.x = -2.6 + Math.sin(S.t * 9 + i * 2) * 0.7; a.rotation.z = (i ? 1 : -1) * (0.4 + Math.sin(S.t * 7 + i) * 0.3); });
      if (Math.random() < dt * 5) lake.fx(S.x + (Math.random() - 0.5) * 0.8, 0.1 + wv, S.z + (Math.random() - 0.5) * 0.8, 3, 2.4, 0.8, false);
      ring.visible = true; ring.position.set(S.x, 0.14 + wv, S.z); const k = (S.t * 0.8) % 1; ring.scale.setScalar(1 + k * 1.4); ringM.opacity = 0.75 * (1 - k);
      return; }
    if (S.state === 'carry') { ring.visible = false;
      const sx = Math.sin(P.yaw), cz = Math.cos(P.yaw); v.position.set(P.x - sx * 0.9 + cz * 0.55, P.y + 0.15, P.z - cz * 0.9 - sx * 0.55); v.rotation.set(-1.25, P.yaw, 0);
      const Pf = v.userData.P; if (Pf && Pf.arms) Pf.arms.forEach(a => { a.rotation.x = -0.2; a.rotation.z = 0; });
      if (!P.swim) { const g = ground(P.x, P.z); S.state = 'safe'; S.safeT = 0; const n = save.stat('meru2Rescues', 0) + 1; save.setStat('meru2Rescues', n); save.addGold(RESCUE.gold); save.addXp(RESCUE.xp);
        v.position.set(P.x + cz * 1.1, g.h, P.z - sx * 1.1); v.rotation.set(0, P.yaw + Math.PI, 0); say('SAFE · +' + RESCUE.gold + ' GOLD · +' + RESCUE.xp + ' XP · RESCUES ' + n, 3.5); lake.fx(v.position.x, g.h + 0.1, v.position.z, 8, 2, 1, false); }
      return; }
    if (S.state === 'safe') { S.safeT += dt; kit.animFox && kit.animFox(v, dt, 0); if (S.safeT > 6) clear(); } }

  return {
    tick,
    carrying: () => S.state === 'carry',
    canGrab: P => S.state === 'help' && P.swim && Math.hypot(P.x - S.x, P.z - S.z) < 2.2,
    grab(P) { if (!this.canGrab(P)) return false; S.state = 'carry'; P.dive = 0; lake.fx(S.x, 0.1, S.z, 10, 2.6, 1.2); say('CARRY THEM TO THE SHORE', 3); return true; },
    marker: () => S.state === 'help' ? [S.x, S.z, 'HELP'] : null,
    toast: () => toast,
    reset: clear,
  };
}
