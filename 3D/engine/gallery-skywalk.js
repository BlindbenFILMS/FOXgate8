// Blind Canvas gallery: the skywalk from the 2nd floor to the eye platform.
// The 2nd floor ends at x -146 (between Deja Hadley's and Craig Ellis's bio walls) with two interview screens over a low wall.
// The screens are made smaller and moved apart (gallery.json vids 21/22), a gap is opened in the wall between them (CARVES
// 'skywalk gap' hides the old wall; it's rebuilt here in two parts), and a ramp in the bridge's style (oak deck, stained-glass
// side panels, the deep blue handrail, ink posts) climbs 9 m over 53 m to the iris platform over the music room, where the lift
// goes down. So visitors can find the lift from upstairs and come down into the music room.
import * as THREE from '../vendor/three/three.module.js';
import { stainedGlass } from './gallery-stained.js';

export const SKYWALK = { x0: -145.4, y0: 5.66, x1: -199.3, y1: 14.81, z: -0.4, W: 2.8 };

export function buildSkywalk({ scene, wood, woodify }) {
  const S = SKYWALK, g = new THREE.Group(); scene.add(g); const col = [];
  const deckM = woodify(new THREE.MeshLambertMaterial({ color: 0xffffff }), wood, 4, true);
  const inkM = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), blueM = new THREE.MeshBasicMaterial({ color: 0x15309a });
  const glassM = stainedGlass({ cell: 0.42, y0: S.y0, y1: S.y1 + 1.2 });
  // the ramp, along -x (same construction as the entrance bridge)
  { let x0 = S.x1, y0 = S.y1, x1 = S.x0, y1 = S.y0;   // ordered so the angle stays in (-90°, 90°)
    const len = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0), mx = (x0 + x1) / 2, my = (y0 + y1) / 2, W = S.W;
    const piece = (w, h, d, mat, oy, oz, solid) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); const off = new THREE.Vector3(0, oy, oz).applyAxisAngle(new THREE.Vector3(0, 0, 1), ang); m.position.set(mx + off.x, my + off.y, S.z + off.z); m.rotation.z = ang; g.add(m); if (solid) col.push(m); return m; };
    piece(len + 0.02, 0.3, W, deckM, -0.13, 0, true);
    for (const s of [-1, 1]) {
      piece(len + 0.02, 0.5, 0.12, inkM, -0.2, s * (W / 2 + 0.06), false);
      piece(len + 0.02, 0.06, 0.1, blueM, 1.05, s * (W / 2 - 0.02), false);
      piece(len + 0.02, 1.0, 0.06, glassM, 0.55, s * (W / 2 - 0.02), true).renderOrder = 4;
    }
    const n = Math.max(1, Math.round(len / 2));
    for (let i = 0; i <= n; i++) { const t = i / n, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t;
      for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 0.08), inkM); p.position.set(px, py + 0.52, S.z + s * (W / 2 - 0.02)); g.add(p); } }
  }
  // the 2nd floor's edge wall, rebuilt in two parts with the gap for the skywalk
  { const white = new THREE.MeshLambertMaterial({ color: 0xf4f2ee }), x = -145.71, y0 = 5.13, y1 = 7.28, za = -13.35, zb = 12.39, g0 = S.z - S.W / 2 - 0.05, g1 = S.z + S.W / 2 + 0.05;
    for (const [a, b] of [[za, g0], [g1, zb]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, y1 - y0, b - a), white); m.position.set(x, (y0 + y1) / 2, (a + b) / 2); g.add(m); col.push(m); }
    // a slim ink sill across the threshold
    const sill = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, S.W + 0.1), inkM); sill.position.set(x, S.y0 + 0.01, S.z); g.add(sill);
  }
  // slim black frames behind the two smaller interview screens (the screens themselves come from gallery.json)
  for (const z of [-6.95, 6.15]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.96, 5.16), inkM); f.position.set(-145.68, 8.7, z); g.add(f); }
  g.updateMatrixWorld(true);
  for (const m of col) m.updateMatrixWorld(true);
  return { group: g, col };
}
