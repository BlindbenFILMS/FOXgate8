// Blind Canvas gallery: the music room's ceiling, rebuilt smooth: "the eyelid".
// Over the music room the model had an eye-shaped opening built from 20-sided rings: a 2.3 m black band round the opening,
// a chunky white upstand, a ceiling deck, more black bands and a tall faceted outer wall. Those are carved (gallery-remodel.js
// CARVES 'eyelid rings') and rebuilt here as true smooth ellipses on the same footprint:
//  · the eyelid: a slim white rim round the opening with a rounded ink lip at its lower edge (the lash line), and a soft blue
//    cove light washing up its inner face;
//  · the ceiling deck between the rings: a clean white soffit underneath, oak on top;
//  · the outer wall: a slim ink base, then a band of stained glass in the facade's colours (deep blues low, opal whites high) with
//    an ink cap rail and slim mullions; open where the skywalk passes through;
//  · the iris (the glass platform) hung from the eyelid on eight slim steel spokes.
import * as THREE from '../vendor/three/three.module.js';
import { stainedGlass } from './gallery-stained.js';

export const EYELID = { cx: -208.08, cz: -0.45, r1: [9.6, 17.8], r2: [13.92, 25.77], brim: { cx: -211.06, cz: -0.45, r: [17.97, 33.17] } };

// sweep a profile [[d, y], ...] (d = offset outward from the ellipse) round an ellipse, from angle a0 to a1
function sweep(prof, rx, rz, cx, cz, a0, a1, N) {
  const pos = [], uv = [], idx = [], M = prof.length;
  for (let i = 0; i <= N; i++) { const t = a0 + (a1 - a0) * i / N, c = Math.cos(t), s = Math.sin(t);
    prof.forEach(([d, y], j) => { pos.push(cx + (rx + d) * c, y, cz + (rz + d) * s); uv.push(i / N, j / (M - 1)); }); }
  for (let i = 0; i < N; i++) for (let j = 0; j < M - 1; j++) { const a = i * M + j, b = (i + 1) * M + j; idx.push(a, b, b + 1, a, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// a flat ring between two ellipses at height y
function flatRing(r1, r2, cx, cz, y, N) {
  const pos = [], idx = [];
  for (let i = 0; i <= N; i++) { const t = i / N * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); pos.push(cx + r1[0] * c, y, cz + r1[1] * s, cx + r2[0] * c, y, cz + r2[1] * s); }
  for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 2, a + 3, a, a + 3, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

export function buildEyelid({ scene, wood, woodify, lift = { x: -205.6, z: -0.5, y1: 14.81, ringOut: 6.25 }, gap = { z0: -2.0, z1: 1.2 } }) {
  const E = EYELID, g = new THREE.Group(); scene.add(g);
  const white = new THREE.MeshLambertMaterial({ color: 0xf4f2ee, side: THREE.DoubleSide }), ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b, side: THREE.DoubleSide });
  const oak = woodify(new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }), wood);
  const N = 192, TAU = Math.PI * 2, [ax, az] = E.r1, [bx, bz] = E.r2;
  const add = (geo, mat, ro) => { const m = new THREE.Mesh(geo, mat); if (ro != null) m.renderOrder = ro; g.add(m); return m; };
  // ---- the eyelid round the opening: white faces, rounded ink lip (the lash line)
  add(sweep([[0, 12.1], [0, 9.38]], ax, az, E.cx, E.cz, 0, TAU, N), white);                                   // inner face
  add(sweep([[0, 9.38], [0, 9.24], [0.05, 9.04], [0.18, 8.92], [0.36, 8.88], [0.55, 8.95], [0.7, 9.0]], ax, az, E.cx, E.cz, 0, TAU, N), ink);   // the lip
  add(sweep([[0, 12.1], [0.06, 12.16], [0.3, 12.16], [0.36, 12.1]], ax, az, E.cx, E.cz, 0, TAU, N), ink);   // slim ink cap on top
  add(sweep([[0.36, 12.1], [0.36, 9.7]], ax, az, E.cx, E.cz, 0, TAU, N), white);                              // outer face, above the deck
  // a cove light washing up the inside of the eyelid, and the light strip itself
  { const cv = document.createElement('canvas'); cv.width = 4; cv.height = 64; const c = cv.getContext('2d'); const gr = c.createLinearGradient(0, 64, 0, 0); gr.addColorStop(0, 'rgba(140,200,255,0.55)'); gr.addColorStop(0.35, 'rgba(120,180,255,0.18)'); gr.addColorStop(1, 'rgba(120,180,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 4, 64);
    const t = new THREE.CanvasTexture(cv);
    add(sweep([[-0.015, 9.4], [-0.015, 11.6]], ax, az, E.cx, E.cz, 0, TAU, N), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 3);
    add(sweep([[-0.03, 9.4], [-0.03, 9.46]], ax, az, E.cx, E.cz, 0, TAU, N), new THREE.MeshBasicMaterial({ color: 0xbfe4ff })); }
  // ---- the ceiling deck between the rings: white soffit below, oak above
  add(flatRing([ax + 0.7, az + 0.7], [bx, bz], E.cx, E.cz, 9.0, N), new THREE.MeshBasicMaterial({ color: 0xe6e2da, side: THREE.DoubleSide }));   // (lit a little from the cove, so it doesn't read grey)
  add(flatRing([ax + 0.36, az + 0.36], [bx, bz], E.cx, E.cz, 9.7, N), oak);
  // ---- the outer wall: slim ink base, white to the deck, then stained glass to an ink cap rail (open where the skywalk passes)
  add(sweep([[0, 8.3], [0, 8.52]], bx, bz, E.cx, E.cz, 0, TAU, N), ink);
  add(sweep([[0, 8.52], [0, 10.0]], bx, bz, E.cx, E.cz, 0, TAU, N), white);
  add(sweep([[0, 8.3], [0.3, 8.3]], bx, bz, E.cx, E.cz, 0, TAU, N), ink);
  const g0 = Math.asin(gap.z0 / bz), g1 = Math.asin(gap.z1 / bz);   // the skywalk's gap, on the +x side (angle ~0)
  const glass = stainedGlass({ cell: 0.7, y0: 9.4, y1: 15.0, plane: 'cyl', cyl: [E.cx, E.cz, (bx + bz) / 2] });
  add(sweep([[0, 10.0], [0, 15.0]], bx, bz, E.cx, E.cz, g1, g0 + TAU, N), glass, 4);
  add(sweep([[0, 10.0], [0, 13.3]], bx, bz, E.cx, E.cz, g0, g1, 6), glass, 4);   // under the skywalk
  add(sweep([[0, 10.0], [0.3, 10.0]], bx, bz, E.cx, E.cz, 0, TAU, N), ink);       // a slim ink sill under the glass
  add(sweep([[-0.05, 15.0], [-0.05, 15.18], [0.35, 15.18], [0.35, 15.0]], bx, bz, E.cx, E.cz, g1, g0 + TAU, N), ink);   // the cap rail
  { const n = 40; for (let i = 0; i < n; i++) { const t = (i + 0.5) / n * TAU; if (t > TAU + g0 - 0.02 || t < g1 + 0.02) continue;   // slim mullions
    const x = E.cx + bx * Math.cos(t), z = E.cz + bz * Math.sin(t), m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 5.0, 0.07), ink); m.position.set(x, 12.5, z); g.add(m); } }
  // ---- the iris hung from the eyelid on slim steel spokes (none on the +x side, where the skywalk comes in)
  { const steel = new THREE.MeshLambertMaterial({ color: 0x30343a });
    for (let k = 0; k < 8; k++) { const a = (22.5 + k * 45) * Math.PI / 180, dx = Math.cos(a), dz = Math.sin(a);
      const p0 = new THREE.Vector3(lift.x + dx * (lift.ringOut - 0.15), lift.y1 - 0.25, lift.z + dz * (lift.ringOut - 0.15));
      // where this direction meets the eyelid: solve ((x-cx)/ax)^2 + ((z-cz)/az)^2 = 1 for s along the ray from the lift
      const ox = lift.x - E.cx, oz = lift.z - E.cz, A = (dx / ax) ** 2 + (dz / az) ** 2, B = 2 * (ox * dx / ax ** 2 + oz * dz / az ** 2), C = (ox / ax) ** 2 + (oz / az) ** 2 - 1;
      const s = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A) + 0.18, p1 = new THREE.Vector3(lift.x + dx * s, 12.16, lift.z + dz * s);
      const len = p0.distanceTo(p1), rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 8), steel);
      rod.position.copy(p0).add(p1).multiplyScalar(0.5); rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p1.clone().sub(p0).normalize()); g.add(rod);
      for (const p of [p0, p1]) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), steel); f.position.copy(p); g.add(f); } } }
  // ---- the 2nd floor's ceiling brim round the void (black, 8.0–8.7 m): the model's edge is a 12-sided polygon; a smooth band
  // laid just inside it hides the facets
  { const B = E.brim, [rx, rz] = B.r, prof = [[0.75, 8.71], [0, 8.71], [0, 7.99], [0.75, 7.99]];
    add(sweep(prof, rx - 0.75, rz - 0.75, B.cx, B.cz, 0, TAU, N), ink); }
  g.updateMatrixWorld(true);
  return { group: g };
}
