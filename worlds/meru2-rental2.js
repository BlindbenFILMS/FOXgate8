// MERU 2.0 — s728c CAR RENTAL 2 [carRental2] interior (BUILD_PLAN interiors: the second rental only had a desk, a key board, 2 chairs + the clerk).
// Built from meru2-walk.js (the s34 block keeps the desk, its collider, the key board, the clerk + the RENT desk spot). Shell f = RB2.f, door N.
// Walkway door → desk kept clear (x ±1.5 of the door). Adds: a SHOWROOM car on a slowly turning turntable, the waiting corner (2 more chairs,
// coffee table + brochures, water cooler, plant), desk extras (bell, brochure stand, key tray, pen cup, lamp), a key lockbox + tyre stack behind the
// desk, posters (RENT A CAR · price, MERU ROADS map), ceiling lights, and shopKit life: the clerk idles / waves / looks at you, 1-2 customers by hour,
// door chime, door sun patch + motes, night lamps + darker corners, the wall clock.
import { meruCars } from '../engine/meru-cars.js?v=s679';
import { shopKit } from './meru2-shopkit.js?v=s728';
export function buildRental2({ THREE, scene, M, toon, kit, cols, save, camera, touch, hour, isMuted, F, clerk, price = 25 }) {
  const G = new THREE.Group(); G.name = 'carRental2Dress'; scene.add(G);
  const [x0, x1, z0, z1] = F, cx = (x0 + x1) / 2, tc = c => (typeof c === 'string' ? toon(c) : c);
  const box = (a, b, c, d) => cols.push({ f: [a, b, c, d] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const B = (w, h, d, col, x, y, z, ry = 0, o = 0.01, par = G) => { const m = M(new THREE.BoxGeometry(w, h, d), tc(col), x, y, z, par, o); m.rotation.y = ry; return m; };
  const C = (r, h, col, x, y, z, o = 0.01, par = G, n = 12) => M(new THREE.CylinderGeometry(r, r, h, n), tc(col), x, y, z, par, o);
  const IM = (geo, col, list) => { const im = new THREE.InstancedMesh(geo, tc(col), list.length), o3 = new THREE.Object3D(); list.forEach(([x, y, z, ry = 0, rx = 0, rz = 0], i) => { o3.position.set(x, y, z); o3.rotation.set(rx, ry, rz); o3.updateMatrix(); im.setMatrixAt(i, o3.matrix); }); im.castShadow = !touch; G.add(im); return im; };
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const plate = (w, h, draw, x, y, z, ry) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: CT(Math.round(w * 128), Math.round(h * 128), draw) })); p.position.set(x, y, z); p.rotation.y = ry; G.add(p); return p; };
  const spin = [];
  // SHOWROOM: a rental car on a turntable (east half), red + white ring, a spotlit price stand
  const tx = x1 - 3.0, tz = z0 + 4.4;
  { C(2.3, 0.14, '#3d3b3a', tx, 0.07, tz, 0.02, G, 32); const rim = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.05, 6, 40), new THREE.MeshBasicMaterial({ color: 0xec3013 })); rim.rotation.x = Math.PI / 2; rim.position.set(tx, 0.15, tz); G.add(rim);
    const tt = new THREE.Group(); tt.position.set(tx, 0.14, tz); G.add(tt); const CK = meruCars(THREE), car = CK.mkCar(tt, { col: '#ec3013' }); car.g.rotation.y = 0.5; spin.push([tt, 0.18]); ring(tx, tz, 2.4);
    B(0.06, 1.0, 0.06, '#201e1d', tx - 2.6, 0.5, z0 + 1.4); plate(0.8, 0.5, (q, W, H) => { q.fillStyle = '#201e1d'; q.fillRect(0, 0, W, H); q.fillStyle = '#ffd23a'; q.font = '900 30px Archivo, sans-serif'; q.textBaseline = 'top'; q.fillText('TOWN CAR', 10, 8); q.fillStyle = '#ffffff'; q.font = '900 26px Archivo, sans-serif'; q.fillText(price + ' G A DAY', 10, 40); }, tx - 2.6, 1.15, z0 + 1.43, 0); ring(tx - 2.6, z0 + 1.4, 0.15); }
  // WAITING CORNER (west): 2 more chairs, a coffee table with brochures + a magazine, water cooler, plant by the door
  { for (const z of [z0 + 4.8, z0 + 6.0]) { B(0.55, 0.1, 0.55, '#ec3013', x0 + 1.0, 0.45, z); B(0.08, 0.5, 0.55, '#ec3013', x0 + 0.75, 0.75, z); } IM(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 5), '#c0c4cc', [z0 + 2.4, z0 + 3.6, z0 + 4.8, z0 + 6.0].flatMap(z => [[x0 + 0.8, 0.2, z - 0.22], [x0 + 1.2, 0.2, z - 0.22], [x0 + 0.8, 0.2, z + 0.22], [x0 + 1.2, 0.2, z + 0.22]])); box(x0 + 0.5, x0 + 1.4, z0 + 4.4, z0 + 6.4);
    const ctx = x0 + 2.4, ctz = z0 + 4.2; B(0.8, 0.06, 1.4, '#5a3d26', ctx, 0.42, ctz); IM(new THREE.BoxGeometry(0.05, 0.4, 0.05), '#201e1d', [[ctx - 0.35, 0.2, ctz - 0.65], [ctx + 0.35, 0.2, ctz - 0.65], [ctx - 0.35, 0.2, ctz + 0.65], [ctx + 0.35, 0.2, ctz + 0.65]]); box(ctx - 0.45, ctx + 0.45, ctz - 0.75, ctz + 0.75);
    IM(new THREE.BoxGeometry(0.22, 0.012, 0.3), '#f3efe2', [[ctx - 0.15, 0.46, ctz - 0.4, 0.2], [ctx + 0.12, 0.46, ctz - 0.1, -0.3], [ctx - 0.05, 0.47, ctz + 0.35, 0.1]]); B(0.28, 0.01, 0.36, '#2e86b8', ctx + 0.1, 0.46, ctz + 0.5, 0.4, 0);
    C(0.2, 0.9, '#e5e7eb', x0 + 0.6, 0.45, z1 - 3.4, 0.02); C(0.15, 0.45, '#7dd3fc', x0 + 0.6, 1.12, z1 - 3.4, 0.01); C(0.05, 0.08, '#f3f2f2', x0 + 0.9, 0.95, z1 - 3.4, 0); ring(x0 + 0.6, z1 - 3.4, 0.3);
    C(0.3, 0.6, '#3d3b3a', x0 + 0.7, 0.3, z0 + 0.8, 0.02); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283, l = B(0.18, 0.03, 1.0, k % 2 ? '#3d6b4a' : '#4f8a5c', x0 + 0.7 + Math.sin(a) * 0.35, 1.05, z0 + 0.8 + Math.cos(a) * 0.35, a, 0); l.rotation.x = 0.6; } ring(x0 + 0.7, z0 + 0.8, 0.35); }
  // DESK EXTRAS (the desk itself is the walk's: 4 × 0.9 at the desk point) + behind the desk: key lockbox, tyre stack, a filing cabinet
  { const dx = cx, dz = z1 - 2.6, top = 1.16; C(0.06, 0.05, '#c9a227', dx + 1.4, top + 0.02, dz - 0.2, 0, G, 10); B(0.3, 0.22, 0.12, '#2e4a6b', dx + 0.6, top + 0.11, dz - 0.25, 0, 0); IM(new THREE.BoxGeometry(0.06, 0.18, 0.005), '#f3efe2', [0, 1, 2].map(i => [dx + 0.5 + i * 0.1, top + 0.15, dz - 0.32]));
    B(0.4, 0.04, 0.26, '#3d3b3a', dx - 0.3, top + 0.02, dz, 0, 0); IM(new THREE.TorusGeometry(0.03, 0.008, 4, 10), '#c0c4cc', [0, 1, 2, 3].map(i => [dx - 0.42 + i * 0.08, top + 0.05, dz, 0, Math.PI / 2])); C(0.04, 0.12, '#ec3013', dx + 1.0, top + 0.06, dz + 0.1, 0, G, 8);
    C(0.012, 0.4, '#201e1d', dx - 1.6, top + 0.2, dz + 0.2, 0, G, 6); C(0.1, 0.1, '#ffd23a', dx - 1.6, top + 0.42, dz + 0.15, 0, G, 10);
    B(0.9, 1.1, 0.25, '#5c6670', x1 - 1.0, 1.4, z1 - 0.3, 0, 0.01); IM(new THREE.TorusGeometry(0.035, 0.01, 4, 10), '#c9a227', [...Array(12)].map((_, i) => [x1 - 1.3 + (i % 4) * 0.2, 1.1 + (i / 4 | 0) * 0.3, z1 - 0.45, 0, 0]));
    IM(new THREE.CylinderGeometry(0.36, 0.36, 0.24, 14), '#1f2023', [0, 1, 2, 3].map(i => [x1 - 0.7, 0.12 + i * 0.25, z1 - 1.5, i * 0.6])); ring(x1 - 0.7, z1 - 1.5, 0.42);
    B(0.6, 1.3, 0.55, '#7c8794', x0 + 0.6, 0.65, z1 - 0.5, 0, 0.01); IM(new THREE.BoxGeometry(0.3, 0.03, 0.02), '#c0c4cc', [0.35, 0.75, 1.15].map(y => [x0 + 0.6, y, z1 - 0.79])); box(x0 + 0.25, x0 + 0.95, z1 - 0.8, z1 - 0.2); }
  // POSTERS + brochure rack by the door
  plate(2.2, 1.4, (q, W, H) => { q.fillStyle = '#ec3013'; q.fillRect(0, 0, W, H); q.fillStyle = '#ffffff'; q.font = '900 46px Archivo, sans-serif'; q.textBaseline = 'top'; q.fillText('RENT A CAR', 18, 18); q.font = '900 30px Archivo, sans-serif'; q.fillStyle = '#ffd23a'; q.fillText(price + ' G A DAY', 18, 76); q.fillStyle = '#ffffff'; q.font = '800 22px Archivo, sans-serif'; q.fillText('DRIVE ANYWHERE IN MERU', 18, 120); q.fillText('BRING IT BACK TO THE LOT', 18, 150); }, x1 - 0.06, 2.2, z0 + 4.4, -Math.PI / 2);
  plate(2.4, 1.6, (q, W, H) => { q.fillStyle = '#e9e3d6'; q.fillRect(0, 0, W, H); q.fillStyle = '#201e1d'; q.fillRect(0, 0, W, 34); q.fillStyle = '#ffffff'; q.font = '900 24px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillText('MERU ROADS', 12, 18); q.strokeStyle = '#2e4a6b'; q.lineWidth = 6; q.beginPath(); q.arc(W / 2, H / 2 + 14, 70, 0, 7); q.stroke(); q.strokeStyle = '#ec3013'; q.lineWidth = 4; q.beginPath(); q.moveTo(20, H / 2 + 14); q.lineTo(W - 20, H / 2 + 14); q.moveTo(W / 2, 44); q.lineTo(W / 2, H - 10); q.stroke(); q.fillStyle = '#ffd23a'; q.beginPath(); q.arc(W / 2 - 50, H / 2 - 20, 9, 0, 7); q.fill(); }, x0 + 0.06, 2.2, z0 + 8.2, Math.PI / 2);
  { const rx = cx - 2.6, rz = z0 + 0.5; B(0.8, 1.4, 0.3, '#201e1d', rx, 0.7, rz); IM(new THREE.BoxGeometry(0.2, 0.28, 0.02), '#ffffff', [0, 1, 2].flatMap(j => [0, 1, 2].map(i => [rx - 0.25 + i * 0.25, 0.4 + j * 0.4, rz + 0.17, 0, -0.2]))).material = new THREE.MeshLambertMaterial({ color: '#f3efe2' }); box(rx - 0.45, rx + 0.45, rz - 0.2, rz + 0.2); }
  // ceiling lights (night glow via shopKit lamps)
  for (const x of [cx - 3, cx + 3]) for (const z of [z0 + 3.5, z1 - 3.5]) B(1.6, 0.06, 0.35, '#f3f2f2', x, 4.6, z, 0, 0);
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'cr2', color: '#ec3013', boardTitle: 'CAR RENTAL', room: { X0: x0, X1: x1, Z0: z0, Z1: z1 }, door: [cx, z0 + 0.4], keeper: clerk || null, keeperRy: Math.PI,
    sun: [{ x: cx, z: z0 + 1.8, w: 3, d: 2.4 }], lamps: [[cx - 3, 4.4, z0 + 3.5], [cx + 3, 4.4, z0 + 3.5], [cx - 3, 4.4, z1 - 3.5], [cx + 3, 4.4, z1 - 3.5]],
    browse: [[cx + 0.6, z1 - 4.0, 0], [tx - 1.0, z0 + 1.6, 0.4], [x0 + 1.0, z1 - 3.4, -Math.PI / 2], [cx - 2.6, z0 + 1.1, Math.PI], [x0 + 1.0, z0 + 8.2, -Math.PI / 2]], clock: { x: cx + 2.6, y: 3.3, z: z1 - 0.06, ry: Math.PI } });
  function tick(dt, P) { const near = Math.hypot(P.x - cx, P.z - (z0 + z1) / 2); G.visible = near < (touch ? 55 : 95); if (near > 50) return; const inShop = P.x > x0 && P.x < x1 && P.z > z0 && P.z < z1 && (P.y || 0) < 4;
    K.tick(dt, P, { inShop, near }); for (const [o, s] of spin) o.rotation.y += s * dt; }
  return { G, K, tick };
}
