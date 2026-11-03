// s620c KEEPER POSER: one jointed fox's body language outside the shop kit (farm keepers, librarian, ranger, stall keepers).
//   const pose = keeperPoser(THREE, ['hips', 'think']);  each frame AFTER kit.animFox:  pose(fox, dt, mode)
//   mode 'wave' = the real WAVE · 'idle' = loop the list (each anim plays once, then the next) · null = blend out + endPose (stand easy)
// Returns false if the fox has no joints (caller keeps its old arm code).
import { applyPose, endPose, FOX_ANIMS } from './fox-poses.js?v=s648k';
export function keeperPoser(THREE, loop) {
  const L = loop.filter(k => FOX_ANIMS[k]), S = { a: null, t: 0, k: 0, i: 0 };
  return (F, dt, mode) => { if (!F || !F.userData.P || !F.userData.P.fore) return false;
    const name = mode === 'wave' ? 'wave' : mode === 'idle' && L.length ? L[S.i % L.length] : null;
    if (!name) { S.k = Math.max(0, S.k - dt * 3); if (S.a) { if (S.k <= 0) { endPose(F); S.a = null; } else applyPose(THREE, F, S.a, S.t, S.k); } return true; }
    if (name !== S.a) { S.a = name; S.t = 0; } S.t += dt;
    if (name !== 'wave' && S.t >= FOX_ANIMS[name].dur) { S.i = (S.i + 1) % L.length; S.a = L[S.i]; S.t = 0; }
    S.k = Math.min(1, S.k + dt * 3); applyPose(THREE, F, S.a, S.t, S.k); return true; };
}
