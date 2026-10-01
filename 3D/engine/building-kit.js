// Building polish kit: wall textures (brick, stone, plank, tile, panel, shingle), trims, corner posts,
// cornice, door frames + sconces, shuttered windows on every side, planters, roof dressing.
// Lifted from meru-game.js (the Meru polish pass). Usage:
//   const BK = createBuildingKit(K, { DARK, STEEL, lampM, windowM });
//   BK.dress(rec, { h, wall:'brick', base:'#273061', trim:'#e0a84a', accent:'#c42d3c', stone, shutter, flat, noCornice, roofMesh, roofColor });
//   rec = { g: Group (child 0 = wall box), w, d, dx: door x offset, f: front z }
// Path lining (the "always see the path" rule):
//   BK.linePath([[x,z],[x,z],...], { every: 7, side: 2.6, kind: 'lamp'|'tree'|'lantern', colliders })
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick } from '../village-game.js';
import { canvasTex } from './textures.js';

export function createBuildingKit(K, { DARK, STEEL, lampM, windowM }) {
  const { M, BOX, toon, grad, glowSprite, scene } = K;
  const texCache = {};
  function wallTex(kind, base) {
    const k = kind + base; if (texCache[k]) return texCache[k];
    const c0 = new THREE.Color(base), hex = (c, f) => '#' + c.clone().multiplyScalar(f).getHexString();
    const t = canvasTex(256, 256, (c) => {
      c.fillStyle = hex(c0, 1); c.fillRect(0, 0, 256, 256);
      if (kind === 'brick') { for (let r = 0; r < 8; r++) for (let q = -1; q < 5; q++) { const x = q * 64 + (r % 2) * 32, y = r * 32; c.fillStyle = hex(c0, 0.86 + ((r * 7 + q * 3) % 5) * 0.06); c.fillRect(x + 2, y + 2, 60, 28); } c.fillStyle = hex(c0, 0.62); for (let r = 0; r <= 8; r++) c.fillRect(0, r * 32 - 1, 256, 3); }
      if (kind === 'stone') { for (let r = 0; r < 5; r++) for (let q = -1; q < 4; q++) { const x = q * 86 + (r % 2) * 43, y = r * 52; c.fillStyle = hex(c0, 0.82 + ((r * 5 + q * 7) % 6) * 0.06); c.beginPath(); c.roundRect(x + 3, y + 3, 80, 46, 8); c.fill(); } }
      if (kind === 'plank') { for (let q = 0; q < 8; q++) { c.fillStyle = hex(c0, 0.86 + (q % 3) * 0.08); c.fillRect(q * 32 + 1, 0, 30, 256); c.fillStyle = hex(c0, 0.6); c.fillRect(q * 32, 0, 2, 256); for (let n = 0; n < 2; n++) { c.beginPath(); c.arc(q * 32 + 16, 40 + n * 140 + q * 9, 2.5, 0, 7); c.fill(); } } }
      if (kind === 'tile') { for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) { c.fillStyle = hex(c0, 0.88 + ((r + q) % 3) * 0.07); c.fillRect(q * 32 + 2, r * 32 + 2, 28, 28); } }
      if (kind === 'panel') { for (let q = 0; q < 4; q++) { c.fillStyle = hex(c0, 0.92); c.fillRect(q * 64 + 4, 4, 56, 248); c.strokeStyle = hex(c0, 1.35); c.lineWidth = 2; c.strokeRect(q * 64 + 10, 12, 44, 232); } }
      if (kind === 'shingle') { c.fillStyle = hex(c0, 0.7); c.fillRect(0, 0, 256, 256); for (let r = 0; r < 8; r++) for (let q = -1; q < 9; q++) { const x = q * 32 + (r % 2) * 16, y = r * 32; c.fillStyle = hex(c0, 0.9 + ((r * 3 + q) % 4) * 0.06); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30, y); c.lineTo(x + 30, y + 22); c.quadraticCurveTo(x + 15, y + 34, x, y + 22); c.closePath(); c.fill(); } }
    }); t.wrapS = t.wrapT = THREE.RepeatWrapping; texCache[k] = t; return t;
  }
  const texMat = (kind, base, rx, ry) => { const t = wallTex(kind, base).clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new THREE.MeshToonMaterial({ map: t, gradientMap: grad }); };
  function sconce(g, x, y, z, ry = 0) { const s = new THREE.Group(); s.position.set(x, y, z); s.rotation.y = ry; g.add(s); M(BOX(0.12, 0.12, 0.3), DARK, 0, 0, 0.12, s, 0.015); M(BOX(0.24, 0.3, 0.24), lampM, 0, -0.08, 0.32, s, 0.02); M(new THREE.ConeGeometry(0.2, 0.16, 4), DARK, 0, 0.12, 0.32, s, 0).rotation.y = Math.PI / 4; glowSprite(0, -0.08, 0.36, 0xffb060, 1.8, s); }
  function sideWindow(g, x, y, z, ry, trim, shutter) { const wg = new THREE.Group(); wg.position.set(x, y, z); wg.rotation.y = ry; g.add(wg);
    M(BOX(1.0, 1.2, 0.12), trim, 0, 0, 0, wg, 0.02); M(BOX(0.8, 1.0, 0.1), windowM, 0, 0, 0.03, wg, 0); M(BOX(0.06, 1.0, 0.13), trim, 0, 0, 0.04, wg, 0); M(BOX(0.8, 0.06, 0.13), trim, 0, 0.05, 0.04, wg, 0);
    M(BOX(1.2, 0.1, 0.25), trim, 0, -0.65, 0.08, wg, 0.012);
    if (shutter) for (const s of [-1, 1]) { const sh = M(BOX(0.42, 1.12, 0.06), shutter, s * 0.74, 0, 0.05, wg, 0.012); for (let k = -2; k <= 2; k++) M(BOX(0.36, 0.03, 0.07), trim, 0, k * 0.2, 0.01, sh, 0); } }
  function planter(g, x, z, col) { M(BOX(0.8, 0.5, 0.8), toon('#4a4560'), x, 0.25, z, g, 0.02); M(BOX(0.9, 0.08, 0.9), toon(col), x, 0.52, z, g, 0.012); M(new THREE.IcosahedronGeometry(0.45, 1), toon('#3f8a46'), x, 0.9, z, g, 0.025, 0.45); for (let i = 0; i < 4; i++) M(new THREE.SphereGeometry(0.07, 6, 4), toon(pick(['#ffd04a', '#ff8fb0', '#ffffff'])), x + rr(-0.3, 0.3), 1.1 + rr(-0.1, 0.15), z + rr(-0.3, 0.3), g, 0); }
  function dress(rec, o) {
    const { g, w, d, dx, f } = rec, h = o.h, trim = toon(o.trim), stone = toon(o.stone || '#5c5675');
    const wall = g.children[0]; if (o.wall) wall.material = texMat(o.wall, o.base, Math.max(1, w / 2.2), Math.max(1, h / 2.2));
    M(BOX(w + 0.5, 0.4, d + 0.5), stone, 0, 0.2, 0, g, 0.03);
    M(BOX(2.6, 0.14, 0.8), stone, dx, 0.07, f + 0.55, g, 0.015); M(BOX(2.2, 0.14, 0.5), stone, dx, 0.21, f + 0.4, g, 0.015);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { M(BOX(0.4, h + 0.1, 0.4), trim, sx * (w / 2 + 0.02), (h + 0.1) / 2, sz * (d / 2 + 0.02), g, 0.025); M(BOX(0.55, 0.18, 0.55), trim, sx * (w / 2 + 0.02), h + 0.12, sz * (d / 2 + 0.02), g, 0.015); }
    if (!o.noCornice) M(BOX(w + 0.45, 0.22, d + 0.45), trim, 0, h - 0.11, 0, g, 0.02);
    M(BOX(w + 0.08, 0.14, 0.12), trim, 0, 0.6, f + 0.04, g, 0);
    // door frame
    M(BOX(0.22, 2.7, 0.3), trim, dx - 1.25, 1.35, f + 0.08, g, 0.015); M(BOX(0.22, 2.7, 0.3), trim, dx + 1.25, 1.35, f + 0.08, g, 0.015); M(BOX(2.75, 0.3, 0.32), trim, dx, 2.75, f + 0.08, g, 0.015);
    M(new THREE.OctahedronGeometry(0.16, 0), toon(o.accent, { emissive: new THREE.Color(o.accent), emissiveIntensity: 0.5 }), dx, 2.75, f + 0.27, g, 0.01).scale.set(1, 1.2, 0.5);
    sconce(g, dx - 1.75, 2.4, f + 0.02); sconce(g, dx + 1.75, 2.4, f + 0.02);
    // windows down both sides and on the back
    const nSide = Math.max(1, Math.floor(d / 3)), nBack = Math.max(1, Math.floor(w / 3.4)), sh = o.shutter ? toon(o.shutter) : null;
    for (let i = 0; i < nSide; i++) { const z = -d / 2 + (i + 0.5) * d / nSide; sideWindow(g, w / 2 + 0.06, h * 0.55, z, Math.PI / 2, trim, sh); sideWindow(g, -w / 2 - 0.06, h * 0.55, z, -Math.PI / 2, trim, sh); }
    for (let i = 0; i < nBack; i++) sideWindow(g, -w / 2 + (i + 0.5) * w / nBack, h * 0.55, -d / 2 - 0.06, Math.PI, trim, sh);
    // planters at the front corners, clear of the door
    if (Math.abs(dx) < w / 2 - 2.6 || true) { const pxs = [-w / 2 + 0.9, w / 2 - 0.9].filter(px => Math.abs(px - dx) > 2.4); pxs.forEach(px => planter(g, px, f + 0.9, o.accent)); }
    // roof dressing
    if (o.flat) { for (let i = 0; i < 3; i++) { const vx = rr(-w / 3, w / 3), vz = rr(-d / 3, d / 4); M(BOX(0.9, 0.5, 0.7), STEEL, vx, h + 0.35, vz, g, 0.02); M(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12), DARK, vx, h + 0.64, vz, g, 0); } }
    if (o.roofMesh) { o.roofMesh.material = texMat('shingle', o.roofColor, 0.45, 0.45); }
  }
  function lampPost(x, z, parent, colliders) { M(new THREE.CylinderGeometry(0.07, 0.1, 2.2, 8), DARK, x, 1.1, z, parent, 0.03, 0.1); M(BOX(0.34, 0.4, 0.34), lampM, x, 2.4, z, parent, 0.03); M(new THREE.ConeGeometry(0.3, 0.25, 4), DARK, x, 2.72, z, parent, 0).rotation.y = Math.PI / 4; glowSprite(x, 2.4, z, 0xffb060, 2.6, parent); if (colliders) colliders.push({ c: [x, z, 0.25] }); }
  function lantern(x, z, parent, colliders, col = '#ffb85a') { M(new THREE.CylinderGeometry(0.05, 0.06, 1.3, 6), DARK, x, 0.65, z, parent, 0.015, 0.06); M(new THREE.SphereGeometry(0.2, 10, 8), toon(col, { emissive: new THREE.Color(col), emissiveIntensity: 1.4 }), x, 1.45, z, parent, 0.015, 0.2); glowSprite(x, 1.45, z, new THREE.Color(col).getHex(), 1.8, parent); if (colliders) colliders.push({ c: [x, z, 0.2] }); }
  function tree(x, z, parent, colliders) { const s = rr(0.85, 1.2); M(new THREE.CylinderGeometry(0.14 * s, 0.2 * s, 1.6 * s, 7), toon('#5a3d2b'), x, 0.8 * s, z, parent, 0.02, 0.2); M(new THREE.IcosahedronGeometry(1.0 * s, 1), toon(pick(['#3f8a46', '#4f9a4a', '#367a40'])), x, 2.1 * s, z, parent, 0.04, 1.0 * s); if (colliders) colliders.push({ c: [x, z, 0.3] }); }
  // walk a polyline (metres), drop a marker every `every` m on alternating sides (or both)
  function linePath(pts, { every = 7, side = 2.6, kind = 'lamp', both = false, parent, colliders } = {}) {
    const mk = kind === 'tree' ? tree : kind === 'lantern' ? lantern : lampPost; let next = every / 2, acc = 0, n = 0;
    for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], len = Math.hypot(x1 - x0, z1 - z0); if (!len) continue; const ux = (x1 - x0) / len, uz = (z1 - z0) / len;
      while (next <= acc + len) { const t = next - acc, px = x0 + ux * t, pz = z0 + uz * t; for (const sd of both ? [-1, 1] : [n++ % 2 ? 1 : -1]) mk(px - uz * side * sd, pz + ux * side * sd, parent, colliders); next += every; }
      acc += len; }
  }
  return { wallTex, texMat, sconce, sideWindow, planter, dress, lampPost, lantern, tree, linePath };
}
