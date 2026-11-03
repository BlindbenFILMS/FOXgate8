// MERU EMBASSY · GALACTIC POST [dsfPost] interior (s351): Meru's own office on the station. Blue-grey + brass.
// Postmaster Lenn (DRAFT name) at the counter under the brass MERU crest, sorting pigeonholes behind, pneumatic mail tubes up
// into the ceiling (capsules zip up), a wall of numbered parcel lockers (LOCKER 8 = yours), the embassy PERMITS window (west).
// Built far from the ring at (OX, 0, 0). Local frame: promenade door south (z = +hd).
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
export const PB = { OX: 10200, hw: 10, hd: 8, h: 5.6, door: { x: 0, z: 7.2 }, enter: { x: 0, z: 4.6 }, hiring: { x: 7.6, z: 5.2 }, keeper: { x: 0, z: -4.9 }, locker: { x: 8.9, z: -0.6 }, tube: { x: -2.8, z: -3.0 }, permit: { x: -7.0, z: 0.4 } };
export function buildPost(K) {
  const { THREE, scene, M, BOX, toon, basic, rr, LOW } = K;
  const g = new THREE.Group(); g.position.set(PB.OX, 0, 0); scene.add(g);
  const anims = [], blocks = [], circles = [];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, p = g) => M(BOX(w, h, d), mat, x, y, z, p, 0);
  const C = (r1, r2, h, mat, x, y, z, seg = 16, p = g) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0);
  const plane = (w, h, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#141a22') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry); };
  const { hw, hd, h } = PB, BLUE = '#7fb8de', BRASS = '#c9a24a', brass = toon(BRASS), wallM = toon('#2a3440'), wood = toon('#4a3a2a');
  // floor: blue-grey tiles with a brass compass rose in the middle
  const tile = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#3a4654'; c.fillRect(0, 0, w, w); c.fillStyle = '#334050'; c.fillRect(0, 0, w / 2, w / 2); c.fillRect(w / 2, w / 2, w / 2, w / 2); c.strokeStyle = '#25303c'; c.lineWidth = 3; c.strokeRect(0, 0, w, w); }));
  tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(hw / 2, hd / 2);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#ffffff', { map: tile })); f.rotation.x = -Math.PI / 2; g.add(f);
    const rose = tex(canvas(512, 512, (c, w) => { c.translate(w / 2, w / 2); c.strokeStyle = BRASS; c.lineWidth = 10; c.beginPath(); c.arc(0, 0, 230, 0, 7); c.stroke(); c.fillStyle = BRASS; for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * Math.PI / 4); c.beginPath(); c.moveTo(0, -(i % 2 ? 140 : 220)); c.lineTo(26, 0); c.lineTo(-26, 0); c.closePath(); c.fill(); c.restore(); } c.font = `900 120px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#25303c'; c.beginPath(); c.arc(0, 0, 70, 0, 7); c.fill(); c.fillStyle = BRASS; c.fillText('8', 0, 6); }));
    const r = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: rose, transparent: true, toneMapped: false })); r.rotation.x = -Math.PI / 2; r.position.set(0, 0.012, 1.2); g.add(r); }
  // shell
  B(hw * 2, h, 0.3, wallM, 0, h / 2, -hd); for (const s of [-1, 1]) B(0.3, h, hd * 2, wallM, s * hw, h / 2, 0);
  B(hw - 1.5, h, 0.3, wallM, -(hw + 1.5) / 2, h / 2, hd); B(hw - 1.5, h, 0.3, wallM, (hw + 1.5) / 2, h / 2, hd); B(3, h - 3.3, 0.3, wallM, 0, 3.3 + (h - 3.3) / 2, hd);
  for (const s of [-1, 1]) B(0.16, 3.3, 0.36, basic(BLUE), s * 1.5, 1.65, hd); B(3.2, 0.16, 0.36, basic(BLUE), 0, 3.3, hd);
  for (const [x, z, w, d] of [[0, -hd + 0.17, hw * 2, 0.05], [-hw + 0.17, 0, 0.05, hd * 2], [hw - 0.17, 0, 0.05, hd * 2]]) { B(w, 0.08, d, brass, x, 1.0, z); B(w, 0.08, d, brass, x, h - 0.25, z); }
  { const ce = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#1e2630', { side: THREE.DoubleSide })); ce.rotation.x = Math.PI / 2; ce.position.y = h; g.add(ce); }
  for (const [x, z] of [[-5, -2], [5, -2], [-5, 4], [5, 4], [0, 1.2]]) { B(0.03, 0.7, 0.03, brass, x, h - 0.35, z); C(0.12, 0.5, 0.35, toon('#2a3440'), x, h - 0.85, z, 14); C(0.42, 0.42, 0.02, basic('#e6f2ff'), x, h - 1.03, z, 14); }
  sign(['MERU EMBASSY', 'GALACTIC POST · SPACE STATION 8'], 6.4, 1.1, BLUE, 0, 4.6, hd - 0.17, Math.PI);
  // north: the counter (Lenn behind it), brass rail, a scale, stamps; pigeonholes + the MERU crest on the back wall
  B(7.0, 1.05, 1.1, wood, 0, 0.53, -3.6); B(7.2, 0.08, 1.3, brass, 0, 1.08, -3.6); blocks.push([-3.6, 3.6, -4.2, -3.0]);
  for (const x of [-3.4, -1.2, 1.2, 3.4]) C(0.03, 0.03, 0.9, brass, x, 1.55, -3.15, 6); B(6.9, 0.05, 0.05, brass, 0, 2.0, -3.15);
  sign(['POST', 'LETTERS · PARCELS'], 2.0, 0.7, BLUE, -2.3, 2.45, -3.12); sign(['EMBASSY', 'MERU · PERMITS'], 2.0, 0.7, BRASS, 2.3, 2.45, -3.12);
  { C(0.22, 0.25, 0.08, brass, 1.6, 1.16, -3.5, 14); B(0.06, 0.25, 0.06, brass, 1.6, 1.28, -3.5); C(0.18, 0.18, 0.03, brass, 1.6, 1.42, -3.5, 14); B(0.3, 0.12, 0.22, toon('#c8b088'), 1.6, 1.5, -3.5); for (let i = 0; i < 4; i++) B(0.22, 0.02, 0.16, toon(['#c8b088', '#e8e0c8', '#a8c0d8', '#d8a878'][i]), -1.2 + i * 0.3, 1.13, -3.4 + (i % 2) * 0.15).rotation.y = rr(-0.4, 0.4); }
  const holes = tex(canvas(512, 256, (c, W, H) => { c.fillStyle = '#3a2a1a'; c.fillRect(0, 0, W, H); for (let i = 0; i < 12; i++) for (let j = 0; j < 6; j++) { c.fillStyle = '#1a120c'; c.fillRect(i * 42 + 4, j * 42 + 4, 36, 36); if ((i * 7 + j * 3) % 4) { c.fillStyle = ['#e8e0c8', '#c8b088', '#a8c0d8', '#f0d8b8'][(i + j) % 4]; c.fillRect(i * 42 + 8, j * 42 + 18, 28, 22); } } }));
  plane(7.6, 2.4, toon('#ffffff', { map: holes }), 0, 2.2, -hd + 0.17);
  { const crest = tex(canvas(512, 512, (c, w) => { c.translate(w / 2, w / 2); c.fillStyle = BRASS; c.beginPath(); c.moveTo(0, -230); c.lineTo(200, -150); c.lineTo(180, 90); c.lineTo(0, 230); c.lineTo(-180, 90); c.lineTo(-200, -150); c.closePath(); c.fill(); c.fillStyle = '#25303c'; c.beginPath(); c.moveTo(0, -190); c.lineTo(165, -125); c.lineTo(148, 75); c.lineTo(0, 190); c.lineTo(-148, 75); c.lineTo(-165, -125); c.closePath(); c.fill(); c.fillStyle = BRASS; c.font = `900 150px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('M', 0, -20); c.font = `900 56px ${FONT}`; c.fillText('MERU', 0, 120); }));
    plane(1.8, 1.8, new THREE.MeshBasicMaterial({ map: crest, transparent: true, toneMapped: false }), 0, 4.35, -hd + 0.2); }
  // pneumatic mail tubes: three glass tubes from a brass intake up into the ceiling; capsules shoot up on a loop (and on SEND)
  const T = PB.tube, glass = new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide });
  B(1.6, 1.2, 0.9, brass, T.x, 0.6, T.z); B(1.0, 0.25, 0.1, toon('#1a120c'), T.x, 1.05, T.z + 0.46); blocks.push([T.x - 0.8, T.x + 0.8, T.z - 0.45, T.z + 0.45]);
  const caps = [];
  for (const dx of [-0.45, 0, 0.45]) { C(0.16, 0.16, h - 1.2, glass, T.x + dx, 1.2 + (h - 1.2) / 2, T.z, 12); for (const y of [1.3, h - 0.1]) C(0.2, 0.2, 0.12, brass, T.x + dx, y, T.z, 12);
    const cap = C(0.11, 0.11, 0.35, toon(['#c9a24a', '#7fb8de', '#ec3013'][caps.length]), T.x + dx, 1.4, T.z, 10); caps.push({ m: cap, t: rr(0, 6), sp: rr(3, 5) }); }
  anims.push(dt => { for (const c of caps) { c.t += dt; const u = c.t % c.sp, y = u < 0.7 ? 1.4 + (u / 0.7) * (h - 1.6) : 1.4; c.m.position.y = y; c.m.visible = u < 0.7 || u > c.sp - 0.8; } });
  sign(['SEND A LETTER', 'TUBE TO MERU'], 1.6, 0.6, BLUE, T.x, 1.65, T.z + 0.47);
  function send() { caps[1].t = 0; caps[1].sp = Math.max(caps[1].sp, 3); }
  // east: parcel lockers (numbered, lit inside), LOCKER 8 glows
  const lock = tex(canvas(512, 512, (c, W) => { c.fillStyle = '#25303c'; c.fillRect(0, 0, W, W); c.font = `900 40px ${FONT}`; c.textBaseline = 'top'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const n = j * 4 + i + 1; c.fillStyle = n === 8 ? '#ffe066' : '#5a6a7c'; c.fillRect(i * 128 + 6, j * 128 + 6, 116, 116); c.fillStyle = n === 8 ? '#25303c' : '#e6f2ff'; c.fillText(String(n), i * 128 + 18, j * 128 + 16); c.fillStyle = '#1a2028'; c.fillRect(i * 128 + 90, j * 128 + 56, 14, 14); } }));
  B(0.5, 3.4, 4.4, wallM, hw - 0.3, 1.7, -0.6); plane(4.2, 3.2, new THREE.MeshBasicMaterial({ map: lock, toneMapped: false }), hw - 0.56, 1.75, -0.6, -Math.PI / 2); blocks.push([hw - 0.6, hw, -2.8, 1.6]);
  sign(['PARCEL LOCKERS', 'LOCKER 8 · STEWARD'], 2.6, 0.7, BLUE, hw - 0.56, 3.85, -0.6, -Math.PI / 2);
  // west: the embassy PERMITS window, a Meru banner, a bench
  B(0.9, 1.1, 2.6, wood, -hw + 1.0, 0.55, 0.4); B(1.0, 0.07, 2.7, brass, -hw + 1.0, 1.12, 0.4); blocks.push([-hw, -hw + 1.5, -0.9, 1.7]);
  plane(2.4, 1.4, new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide }), -hw + 1.42, 1.85, 0.4, Math.PI / 2);
  sign(['PERMITS · VISAS', 'MERU EMBASSY'], 2.4, 0.7, BRASS, -hw + 0.2, 3.0, 0.4, Math.PI / 2);
  { const ban = tex(canvas(256, 512, (c, w, H) => { c.fillStyle = '#2e4a6b'; c.fillRect(0, 0, w, H); c.fillStyle = BRASS; c.fillRect(0, 0, w, 24); c.fillRect(0, H - 60, w, 14); c.font = `900 150px ${FONT}`; c.textAlign = 'center'; c.fillText('M', w / 2, 260); }));
    for (const z of [-5.0, 5.4]) { plane(1.2, 2.4, toon('#ffffff', { map: ban, side: THREE.DoubleSide }), -hw + 0.2, 3.2, z, Math.PI / 2); B(0.06, 0.06, 1.4, brass, -hw + 0.24, 4.42, z); } }
  B(2.6, 0.45, 0.7, toon('#2e4a6b'), -6.0, 0.23, 5.4); B(2.6, 0.7, 0.14, wood, -6.0, 0.8, 5.8); blocks.push([-7.3, -4.7, 5.0, 5.9]);
  C(0.32, 0.26, 0.55, wallM, 8.8, 0.28, 7.0, 12); C(0.05, 0.45, 1.2, toon('#4f8a3a'), 8.8, 1.1, 7.0, 7); circles.push([8.8, 7.0, 0.45]);
  // a parcel trolley (half loaded)
  B(1.4, 0.06, 0.8, brass, 4.8, 0.4, 2.6); for (const [x, z] of [[4.2, 2.3], [5.4, 2.3], [4.2, 2.9], [5.4, 2.9]]) C(0.08, 0.08, 0.06, toon('#111'), x, 0.08, z, 8).rotation.z = Math.PI / 2;
  B(0.06, 0.9, 0.8, brass, 4.1, 0.85, 2.6); for (const [x, y, z, w] of [[4.6, 0.62, 2.6, 0.5], [5.1, 0.6, 2.5, 0.4], [4.8, 0.95, 2.6, 0.35]]) B(w, w * 0.8, w, toon('#c8a878'), x, y, z); blocks.push([4.0, 5.6, 2.1, 3.1]);
  // NOW HIRING
  sign(['NOW HIRING', 'MAIL RUN · ASK LENN'], 2.2, 1.1, '#ec3013', PB.hiring.x, 1.9, PB.hiring.z - 0.06); B(2.3, 1.2, 0.08, toon('#2a1a12'), PB.hiring.x, 1.9, PB.hiring.z - 0.12); C(0.05, 0.05, 1.3, brass, PB.hiring.x, 0.65, PB.hiring.z - 0.12, 6); circles.push([PB.hiring.x, PB.hiring.z - 0.12, 0.45]);
  if (!LOW) { const n = 30, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(-6, 6); pos[i * 3 + 1] = rr(0.5, 4); pos[i * 3 + 2] = rr(-5, 5); } const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xe6f2ff, size: 0.04, transparent: true, opacity: 0.5, depthWrite: false })); g.add(pts); anims.push((dt, t) => { pts.position.y = Math.sin(t * 0.3) * 0.2; }); }
  function walk(x, z) { if (x < -hw + 0.5 || x > hw - 0.5 || z < -hd + 0.6 || z > hd - 0.4) return Math.abs(x) < 1.3 && z > hd - 0.4 && z < hd + 0.8; for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false; for (const [cx, cz, r] of circles) if (Math.hypot(x - cx, z - cz) < r + 0.3) return false; return true; }
  return { g, anims, walk, send };
}
