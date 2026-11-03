// Shared builder bits for DSF ring-shop interiors (s352): shell with the south door, signs, lamps, motes, NOW HIRING,
// walk test from blocks/circles. Each room module: roomKit(K, Q) → helpers; push spots {key,x,z,r,run(X)} for the station.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
export function roomKit(K, Q) {
  const { THREE, scene, M, BOX, toon, basic, rr, LOW, glowSprite } = K;
  const g = new THREE.Group(); g.position.set(Q.OX, 0, 0); scene.add(g);
  const anims = [], blocks = [], circles = [], spots = [];
  const tex = (c, rep) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
  const B = (w, h, d, mat, x, y, z, p = g) => M(BOX(w, h, d), mat, x, y, z, p, 0);
  const C = (r1, r2, h, mat, x, y, z, seg = 16, p = g) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0);
  const S = (r, mat, x, y, z, p = g) => M(new THREE.SphereGeometry(r, 14, 10), mat, x, y, z, p, 0);
  const plane = (w, h, mat, x, y, z, ry = 0, p = g) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; };
  const flat = (w, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; g.add(m); return m; };
  const lit = t => new THREE.MeshBasicMaterial({ map: t, toneMapped: false, transparent: true });
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#141414') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry); };
  const block = (a, b, c, d) => blocks.push([a, b, c, d]), circle = (x, z, r) => circles.push([x, z, r]);
  function shell({ wall, floor, ceil = '#161616', trim, title }) {
    const { hw, hd, h } = Q, wm = toon(wall);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#ffffff', { map: floor })); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; g.add(f);
    B(hw * 2, h, 0.3, wm, 0, h / 2, -hd); for (const s of [-1, 1]) B(0.3, h, hd * 2, wm, s * hw, h / 2, 0);
    B(hw - 1.5, h, 0.3, wm, -(hw + 1.5) / 2, h / 2, hd); B(hw - 1.5, h, 0.3, wm, (hw + 1.5) / 2, h / 2, hd); B(3, h - 3.3, 0.3, wm, 0, 3.3 + (h - 3.3) / 2, hd);
    for (const s of [-1, 1]) B(0.16, 3.3, 0.36, basic(trim), s * 1.5, 1.65, hd); B(3.2, 0.16, 0.36, basic(trim), 0, 3.3, hd);
    { const ce = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon(ceil, { side: THREE.DoubleSide })); ce.rotation.x = Math.PI / 2; ce.position.y = h; g.add(ce); }
    sign(title, 6.2, 1.1, trim, 0, Math.min(h - 0.8, 4.6), hd - 0.17, Math.PI);
  }
  function lamps(pts, col = '#ffe2c0') { const dk = toon('#1a1a1a'); for (const [x, z] of pts) { B(0.03, 0.6, 0.03, dk, x, Q.h - 0.3, z); C(0.1, 0.38, 0.28, dk, x, Q.h - 0.74, z, 12); C(0.32, 0.32, 0.02, basic(col), x, Q.h - 0.88, z, 12); if (!LOW) glowSprite(x, Q.h - 1.0, z, col, 1.4, 0.35, g); } }
  function motes(color = 0xffe2c0, n = 30) { if (LOW) return; const pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(-Q.hw * 0.6, Q.hw * 0.6); pos[i * 3 + 1] = rr(0.5, Q.h - 1); pos[i * 3 + 2] = rr(-Q.hd * 0.6, Q.hd * 0.6); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 0.04, transparent: true, opacity: 0.5, depthWrite: false })); g.add(pts); anims.push((dt, t) => { pts.position.y = Math.sin(t * 0.3) * 0.2; }); }
  function hiring(sub) { const H = Q.hiring; sign(['NOW HIRING', sub], 2.2, 1.1, '#ec3013', H.x, 1.9, H.z - 0.06); B(2.3, 1.2, 0.08, toon('#2a1a12'), H.x, 1.9, H.z - 0.12); C(0.05, 0.05, 1.3, toon('#c9a24a'), H.x, 0.65, H.z - 0.12, 6); circle(H.x, H.z - 0.12, 0.45); }
  function walk(x, z) { const { hw, hd } = Q; if (x < -hw + 0.5 || x > hw - 0.5 || z < -hd + 0.6 || z > hd - 0.4) return Math.abs(x) < 1.3 && z > hd - 0.4 && z < hd + 0.8; for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false; for (const [cx, cz, r] of circles) if (Math.hypot(x - cx, z - cz) < r + 0.3) return false; return true; }
  return { THREE, g, anims, blocks, circles, spots, tex, B, C, S, plane, flat, lit, sign, block, circle, shell, lamps, motes, hiring, walk, canvas, FONT, toon, basic, rr, LOW, glowSprite };
}
