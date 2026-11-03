// GAROK'S tailor [dsfTailor] interior (s350): a narrow, rich little shop. Purple walls, warm lamps, bolts of cloth floor to ceiling.
// Built far from the ring at (OX, 0, 0). Local frame: promenade door south (z = +hd). Garok at the cutting counter (north),
// the FITTING BLOCK + three-way mirror (stand on it = measured), mannequins in the window, sewing table, NOW HIRING · FOXY TAILORS.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
export const TB = { OX: 3800, hw: 10, hd: 8, h: 5.5, door: { x: 0, z: 7.2 }, enter: { x: 0, z: 4.4 }, hiring: { x: 7.4, z: 5.0 }, keeper: { x: 0, z: -4.85 }, block: { x: -5.2, z: -1.6 }, cut: { x: -1.4, z: -3.35 }, cust: { x: -3.9, z: -3.0 }, car: { x: -5.3, z: 0.35 }, garokFit: { x: -4.5, z: -2.6 } };
const TAILDUST = {};
export function buildTailor(K) {
  const { THREE, scene, M, BOX, toon, basic, rnd, rr, pick, LOW } = K;
  const g = new THREE.Group(); g.position.set(TB.OX, 0, 0); scene.add(g);
  const anims = [], blocks = [], circles = [], mirrors = [];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, p = g) => M(BOX(w, h, d), mat, x, y, z, p, 0);
  const C = (r1, r2, h, mat, x, y, z, seg = 16, p = g) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0);
  const plane = (w, h, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#140c18') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry); };
  const { hw, hd, h } = TB, lilac = '#b98ad8', CLOTH = ['#6a2a5a', '#2a4a7a', '#c9a24a', '#8a1a2a', '#3a6a4a', '#d8c8b0', '#4a2a6a', '#1a1a2a', '#b05a3a', '#e0d0e8'];
  // shell: dark wood floor with a long runner, purple walls with a gold dado rail, warm pendant lamps
  const wood = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#3a2418'; c.fillRect(0, 0, w, w); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#422a1c' : '#352014'; c.fillRect(0, i * 32, w, 30); } }));
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(hw / 3, hd / 3);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#ffffff', { map: wood })); f.rotation.x = -Math.PI / 2; g.add(f); }
  B(2.2, 0.02, hd * 2 - 3, toon('#5a2a4a'), 0, 0.012, 0.6); B(2.4, 0.021, hd * 2 - 3, toon('#c9a24a'), 0, 0.01, 0.6);
  const wallM = toon('#2e2238'), gold = toon('#c9a24a');
  B(hw * 2, h, 0.3, wallM, 0, h / 2, -hd); for (const s of [-1, 1]) B(0.3, h, hd * 2, wallM, s * hw, h / 2, 0);
  B(hw - 1.5, h, 0.3, wallM, -(hw + 1.5) / 2, h / 2, hd); B(hw - 1.5, h, 0.3, wallM, (hw + 1.5) / 2, h / 2, hd); B(3, h - 3.3, 0.3, wallM, 0, 3.3 + (h - 3.3) / 2, hd);
  for (const s of [-1, 1]) B(0.16, 3.3, 0.36, basic(lilac), s * 1.5, 1.65, hd); B(3.2, 0.16, 0.36, basic(lilac), 0, 3.3, hd);
  for (const [x, z, w, d] of [[0, -hd + 0.17, hw * 2, 0.05], [-hw + 0.17, 0, 0.05, hd * 2], [hw - 0.17, 0, 0.05, hd * 2]]) B(w, 0.1, d, gold, x, 1.0, z);
  { const ce = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#1e1624', { side: THREE.DoubleSide })); ce.rotation.x = Math.PI / 2; ce.position.y = h; g.add(ce); }
  for (const [x, z] of [[-4, -3], [4, -3], [-4, 3.5], [4, 3.5], [0, 0]]) { B(0.03, 1.0, 0.03, gold, x, h - 0.5, z); const sh = C(0.45, 0.2, 0.4, toon('#c9a24a'), x, h - 1.15, z, 12); const bulb = M(new THREE.SphereGeometry(0.16, 10, 8), basic('#ffd9a0'), x, h - 1.35, z, g, 0); void sh; void bulb; }
  // big sign over the counter + GAROK's monogram
  sign(["GAROK'S", 'TAILOR · PLAIN AND SIMPLE'], 7, 1.3, lilac, 0, 4.3, -hd + 0.18);
  // north: the cutting counter (Garok behind it), shears, a bolt being cut, the till
  B(6.4, 1.0, 1.9, toon('#4a2e1e'), 0, 0.5, -3.35); B(6.6, 0.08, 2.1, gold, 0, 1.04, -3.35); blocks.push([-3.3, 3.3, -4.4, -2.3]);
  { const r = C(0.12, 0.12, 0.9, toon('#6a2a5a'), 1.4, 1.2, -3.0, 12); r.rotation.z = Math.PI / 2; const r2 = C(0.11, 0.11, 0.8, toon('#2a4a7a'), 1.5, 1.2, -3.5, 12); r2.rotation.z = Math.PI / 2; B(0.6, 0.4, 0.5, toon('#2a1a12'), 2.6, 1.3, -3.9); }
  // walls of cloth: shelves of rolled bolts (east + west walls, north half) and the back wall behind Garok
  const bolts = (x, z, along, n, ry) => { const sg = new THREE.Group(); sg.position.set(x, 0, z); sg.rotation.y = ry; g.add(sg); M(BOX(along, 3.6, 0.7), toon('#2a1a12'), 0, 1.8, 0, sg, 0);
    for (let row = 0; row < 4; row++) for (let i = 0; i < n; i++) { const b = M(new THREE.CylinderGeometry(0.16, 0.16, 0.6, 10), toon(pick(CLOTH)), -along / 2 + 0.3 + i * (along - 0.6) / (n - 1), 0.55 + row * 0.85, 0.12, sg, 0); b.rotation.x = Math.PI / 2; } };
  bolts(0, -hd + 0.55, 9, LOW ? 8 : 14, 0); bolts(-hw + 0.55, -3.5, 5, LOW ? 5 : 8, Math.PI / 2); bolts(hw - 0.55, -3.5, 5, LOW ? 5 : 8, -Math.PI / 2);
  blocks.push([-hw, -hw + 1.0, -6.0, -1.0], [hw - 1.0, hw, -6.0, -1.0]);
  // the FITTING BLOCK + three-way mirror (west)
  const FB = TB.block; C(0.8, 0.85, 0.3, toon('#4a2e1e'), FB.x, 0.15, FB.z, 20); { const rim = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.04, 6, 32), gold); rim.rotation.x = Math.PI / 2; rim.position.set(FB.x, 0.31, FB.z); g.add(rim); }
  { const mm = new THREE.MeshBasicMaterial({ color: 0xb8c4d0, toneMapped: false }); for (const [dx, ry] of [[-1.45, Math.PI / 2 - 0.5], [0, Math.PI / 2], [1.45, Math.PI / 2 + 0.5]]) { const sg = new THREE.Group(); sg.position.set(FB.x - 1.7 + Math.abs(dx) * 0.35, 0, FB.z + dx); sg.rotation.y = ry; g.add(sg); M(BOX(1.4, 3.0, 0.08), gold, 0, 1.7, -0.05, sg, 0); const mr = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 2.8), mm); mr.position.set(0, 1.7, 0.0); sg.add(mr); mirrors.push(mr); } }
  blocks.push([FB.x - 2.4, FB.x - 1.1, FB.z - 2.2, FB.z + 2.2]);
  // mannequins by the shop window (south-west + south-east), each in one of the station looks
  const manq = (x, z, col, trimC) => { C(0.05, 0.05, 1.0, gold, x, 0.5, z, 6); C(0.35, 0.35, 0.06, toon('#2a1a12'), x, 0.03, z, 14); M(BOX(0.7, 1.0, 0.4), toon(col), x, 1.5, z, g, 0); M(BOX(0.72, 0.1, 0.42), toon(trimC), x, 1.95, z, g, 0); M(new THREE.SphereGeometry(0.2, 10, 8), toon('#d8c8b0'), x, 2.25, z, g, 0); circles.push([x, z, 0.5]); };
  manq(-7.2, 5.6, '#4a2a6a', '#c9a24a'); manq(-5.4, 6.0, '#8a1a2a', '#f3f2f2'); manq(7.2, 2.2, '#2a4a7a', '#c9a24a');
  // sewing table (east) with a machine whose wheel turns, thread spools, a bolt half-sewn
  B(2.4, 0.85, 1.1, toon('#4a2e1e'), 6.0, 0.43, -0.2); blocks.push([4.7, 7.3, -0.85, 0.45]);
  { B(0.8, 0.45, 0.35, toon('#1a1a22'), 6.0, 1.08, -0.3); B(0.2, 0.35, 0.3, toon('#1a1a22'), 5.65, 1.4, -0.3); const wh = C(0.16, 0.16, 0.05, gold, 6.42, 1.15, -0.3, 14); wh.rotation.z = Math.PI / 2; anims.push(dt => { wh.rotation.x += dt * 5; });
    for (let i = 0; i < 5; i++) C(0.06, 0.06, 0.14, toon(pick(CLOTH)), 5.0 + i * 0.18, 0.93, 0.2, 8); const cl = B(1.2, 0.03, 0.8, toon('#6a2a5a'), 6.6, 0.88, 0.1); cl.rotation.y = 0.2; }
  // a velvet chair + side table for waiting, a tall plant
  B(1.0, 0.5, 1.0, toon('#5a2a4a'), -7.6, 0.25, 2.2); B(1.0, 1.0, 0.2, toon('#5a2a4a'), -7.6, 0.75, 2.7); circles.push([-7.6, 2.3, 0.8]);
  C(0.35, 0.28, 0.6, toon('#2a1a12'), 8.6, 0.3, 6.8, 12); C(0.05, 0.5, 1.3, toon('#4f8a3a'), 8.6, 1.25, 6.8, 7); circles.push([8.6, 6.8, 0.5]);
  // NOW HIRING board
  sign(['NOW HIRING', 'FOXY TAILORS · TAP TO START'], 2.2, 1.1, '#ec3013', TB.hiring.x, 1.9, TB.hiring.z - 0.06, 0, '#140c18'); B(2.3, 1.2, 0.08, toon('#2a1a12'), TB.hiring.x, 1.9, TB.hiring.z - 0.12); C(0.05, 0.05, 1.3, gold, TB.hiring.x, 0.65, TB.hiring.z - 0.12, 6); circles.push([TB.hiring.x, TB.hiring.z - 0.12, 0.45]);
  // dust motes in the lamp light
  if (!LOW) { const n = 40, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(-6, 6); pos[i * 3 + 1] = rr(0.5, 4); pos[i * 3 + 2] = rr(-5, 5); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = TAILDUST.pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffe2b0, size: 0.05, transparent: true, opacity: 0.6, depthWrite: false })); g.add(pts); anims.push((dt, t) => { pts.position.y = Math.sin(t * 0.3) * 0.2; pts.rotation.y = t * 0.02; }); }
  function walk(x, z) { if (x < -hw + 0.5 || x > hw - 0.5 || z < -hd + 0.6 || z > hd - 0.4) return Math.abs(x) < 1.3 && z > hd - 0.4 && z < hd + 0.8; for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false; for (const [cx, cz, r] of circles) if (Math.hypot(x - cx, z - cz) < r + 0.3) return false; return true; }
  return { g, anims, walk, dust: TAILDUST, mirrors, circles };
}
