// INFIRMARY / SICKBAY [dsfInfirmary] interior (s350): Dr Bashad's ward. Clean cyan-white sickbay on the east side of the ring.
// Built far from the ring at (OX, 0, 0). Local frame: promenade door south (z = +hd), the hull + a viewport north (z = -hd).
// Ward of 3 biobeds (the 2D "three in overnight"), a free BIOBED with a scanner arch (lie down = scan), Bashad's console,
// the BONE SET table under a surgical lamp ring + an x-ray light board (the job), a cabinet of glowing vials, NOW HIRING board.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
export const IB = { OX: 3200, hw: 13, hd: 10, h: 6.5, door: { x: 0, z: 9.2 }, enter: { x: 0, z: 6.2 }, hiring: { x: 9.6, z: 6.6 }, keeper: { x: 0, z: -4.2 }, scan: { x: -5.5, z: 4.6 }, boneSet: { x: 7, z: -4.2 } };
export function buildInfirmary(K) {
  const { THREE, scene, M, BOX, toon, basic, rnd, rr, pick, LOW } = K;
  const g = new THREE.Group(); g.position.set(IB.OX, 0, 0); scene.add(g);
  const anims = [], blocks = [], circles = [];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, p = g) => M(BOX(w, h, d), mat, x, y, z, p, 0);
  const C = (r1, r2, h, mat, x, y, z, seg = 16, p = g) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0);
  const plane = (w, h, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#0b1218') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    return plane(w, h, new THREE.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, ry); };
  const { hw, hd, h } = IB, cyan = '#5fe3ff';
  // shell: pale tiles, light walls with a cyan rail, ceiling light panels
  const tile = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#dfe8ec'; c.fillRect(0, 0, w, w); c.strokeStyle = '#b8c6cc'; c.lineWidth = 3; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, w); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } }));
  tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(hw / 2, hd / 2);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#ffffff', { map: tile })); f.rotation.x = -Math.PI / 2; g.add(f); }
  B(1.2, 0.02, hd * 2 - 1, basic(cyan, 0.5), 0, 0.012, 0.5);
  const wallM = toon('#c9d4da'), trim = toon('#24303a');
  B(hw * 2, h, 0.3, wallM, 0, h / 2, -hd); for (const s of [-1, 1]) B(0.3, h, hd * 2, wallM, s * hw, h / 2, 0);
  B(hw - 1.6, h, 0.3, wallM, -(hw + 1.6) / 2, h / 2, hd); B(hw - 1.6, h, 0.3, wallM, (hw + 1.6) / 2, h / 2, hd); B(3.2, h - 3.4, 0.3, wallM, 0, 3.4 + (h - 3.4) / 2, hd);
  for (const s of [-1, 1]) B(0.16, 3.4, 0.36, basic(cyan), s * 1.6, 1.7, hd); B(3.4, 0.16, 0.36, basic(cyan), 0, 3.4, hd);
  { const ce = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#9aa8b0', { side: THREE.DoubleSide })); ce.rotation.x = Math.PI / 2; ce.position.y = h; g.add(ce); }
  for (const x of [-8, 0, 8]) for (const z of [-5, 3]) B(3.2, 0.06, 1.2, basic('#f4fbff'), x, h - 0.04, z);
  for (const [x, z, w, d] of [[0, -hd + 0.16, hw * 2, 0.04], [-hw + 0.16, 0, 0.04, hd * 2], [hw - 0.16, 0, 0.04, hd * 2]]) B(w || 0.04, 0.1, d || 0.04, basic(cyan, 0.9), x, 1.1, z);
  // north: a viewport onto space under the big INFIRMARY sign
  { const vt = tex(canvas(1024, 320, (c, w, hh) => { c.fillStyle = '#02040c'; c.fillRect(0, 0, w, hh); for (let i = 0; i < 360; i++) { c.fillStyle = `rgba(255,255,255,${(0.3 + rnd() * 0.7).toFixed(2)})`; c.fillRect(rnd() * w, rnd() * hh, 1.5, 1.5); } const pg = c.createRadialGradient(w * 0.6, hh * 2.4, hh * 1.4, w * 0.6, hh * 2.4, hh * 2.0); pg.addColorStop(0, '#2f7a6a'); pg.addColorStop(0.86, '#4aa0c8'); pg.addColorStop(0.95, 'rgba(160,220,255,0.8)'); pg.addColorStop(1, 'rgba(160,220,255,0)'); c.fillStyle = pg; c.fillRect(0, 0, w, hh); }));
    vt.wrapS = THREE.RepeatWrapping; anims.push(dt => { vt.offset.x = (vt.offset.x + dt * 0.004) % 1; }); plane(9, 2.6, new THREE.MeshBasicMaterial({ map: vt, toneMapped: false }), 0, 2.4, -hd + 0.17);
    B(9.4, 0.2, 0.2, trim, 0, 3.75, -hd + 0.2); B(9.4, 0.2, 0.2, trim, 0, 1.05, -hd + 0.2); for (const s of [-1, 0, 1]) B(0.16, 2.8, 0.2, trim, s * 4.6, 2.4, -hd + 0.2); }
  sign(['INFIRMARY', 'SICKBAY · DR. BASHAD'], 8, 1.5, cyan, 0, 5.0, -hd + 0.18);
  // Bashad's console desk + chair (the keeper stands behind it)
  B(4.4, 1.0, 1.2, toon('#e8eef2'), 0, 0.5, -2.6); B(4.6, 0.08, 1.4, basic(cyan, 0.7), 0, 1.04, -2.6); blocks.push([-2.4, 2.4, -3.3, -1.9]);
  for (const x of [-1.2, 1.2]) { const s = B(1.1, 0.7, 0.05, basic('#9fe8ff', 0.85), x, 1.5, -2.9); s.rotation.x = -0.25; }
  // the ward: three biobeds on the west wall, each with a monitor + a curtain rail; the 2D overnight patients
  const beat = (w, hh, col) => { const cv = canvas(256, 96, () => {}), t = tex(cv), ctx = cv.getContext('2d'); let ph = rnd() * 10; anims.push(dt => { ph += dt; ctx.fillStyle = '#061218'; ctx.fillRect(0, 0, 256, 96); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); for (let x = 0; x < 256; x += 4) { const u = ((x / 256) * 3 + ph * 1.2) % 1; const y = 48 - (u > 0.42 && u < 0.46 ? 34 : u > 0.46 && u < 0.5 ? -22 : Math.sin(u * 30) * 2); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); t.needsUpdate = true; }); return new THREE.MeshBasicMaterial({ map: t, toneMapped: false }); };
  const bed = (x, z, ry, label, patient) => { const bg = new THREE.Group(); bg.position.set(x, 0, z); bg.rotation.y = ry; g.add(bg);
    M(BOX(2.6, 0.7, 1.2), toon('#e8eef2'), 0, 0.35, 0, bg, 0); M(BOX(2.6, 0.06, 1.24), basic(cyan, 0.8), 0, 0.72, 0, bg, 0); M(BOX(2.4, 0.16, 1.0), toon('#bfe6f2'), 0, 0.82, 0, bg, 0); M(BOX(0.5, 0.18, 0.8), toon('#ffffff'), -1.0, 0.95, 0, bg, 0);
    if (patient) { M(BOX(1.6, 0.34, 0.8), toon(patient), 0.2, 1.02, 0, bg, 0); const hd2 = M(new THREE.SphereGeometry(0.26, 12, 10), toon('#d8783a'), -0.95, 1.12, 0, bg, 0); anims.push((dt, t) => { hd2.position.y = 1.12 + Math.sin(t * 1.3 + x) * 0.015; }); }
    M(BOX(0.12, 2.4, 0.12), trim, -1.45, 1.2, -0.75, bg, 0); const mon = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.45), beat(1, 0.45, '#7dff9a')); mon.position.set(-1.38, 2.2, -0.68); mon.rotation.y = Math.PI / 2; bg.add(mon);
    if (label) { const ct = sign([label], 1.9, 0.42, cyan, 0, 0, 0); bg.add(ct); ct.position.set(0, 2.7, -0.62); ct.rotation.y = 0; } };
  const WARD = [[-6.5, 'BED 1 · CONDUIT BURN', '#e0c8a0'], [-2.6, 'BED 2 · BAR-RELATED JAW', '#a8c8e0'], [1.3, 'BED 3 · GAYAN PILGRIM', '#d8b0d0']];
  for (const [z, lab, col] of WARD) { bed(-hw + 1.6, z, 0, null, col); blocks.push([-hw, -hw + 3.1, z - 0.8, z + 0.8]); const lb = sign([lab], 2.4, 0.5, cyan, -hw + 0.18, 3.0, z, Math.PI / 2); void lb;
    const mon = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.5), beat(1, 0.5, '#7dff9a')); mon.position.set(-hw + 0.18, 2.1, z - 1.0); mon.rotation.y = Math.PI / 2; g.add(mon); }
  for (const z of [-4.55, -0.65]) { B(3.2, 0.06, 0.06, trim, -hw + 1.7, 3.6, z); const cu = plane(3.0, 2.6, toon('#9fd0dc', { side: THREE.DoubleSide, transparent: true, opacity: 0.85 }), -hw + 1.7, 2.25, z); anims.push((dt, t) => { cu.rotation.y = Math.sin(t * 0.7 + z) * 0.03; }); blocks.push([-hw, -hw + 3.3, z - 0.15, z + 0.15]); }
  // the free BIOBED + scanner arch (lie down = scan)
  const S = IB.scan; { const bg = new THREE.Group(); bg.position.set(S.x, 0, S.z); g.add(bg); M(BOX(2.6, 0.7, 1.2), toon('#e8eef2'), 0, 0.35, 0, bg, 0); M(BOX(2.6, 0.06, 1.24), basic(cyan, 0.8), 0, 0.72, 0, bg, 0); M(BOX(2.4, 0.16, 1.0), toon('#ffffff'), 0, 0.82, 0, bg, 0);
    const arch = new THREE.Group(); bg.add(arch); const ar = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.09, 8, 28, Math.PI), basic(cyan, 0.9)); ar.rotation.y = Math.PI / 2; ar.position.y = 0.72; arch.add(ar);
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 1.6), new THREE.MeshBasicMaterial({ color: 0x9ff4ff, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); beam.rotation.y = Math.PI / 2; beam.scale.x = 30; beam.position.y = 1.3; arch.add(beam);
    S.arch = arch; S.beam = beam; S.on = 0; anims.push((dt, t) => { arch.position.x = Math.sin(t * (S.on > 0 ? 2.6 : 0.5)) * 1.1; beam.material.opacity = S.on > 0 ? 0.5 + Math.sin(t * 20) * 0.15 : 0.12; if (S.on > 0) S.on -= dt; });
    sign(['BIOBED', 'LIE DOWN · SCAN'], 1.6, 0.7, cyan, 0, 1.25, 0.7, 0, undefined); }
  g.children[g.children.length - 1].position.set(S.x, 1.25, S.z + 0.66);
  blocks.push([S.x - 1.4, S.x + 1.4, S.z - 0.7, S.z + 0.7]);
  // BONE SET: the surgical table under a lamp ring + the x-ray light board on the east wall
  const BS = IB.boneSet; B(2.4, 0.9, 1.0, toon('#8a98a0'), BS.x, 0.45, BS.z); B(2.4, 0.1, 1.1, toon('#e8eef2'), BS.x, 0.95, BS.z); C(0.12, 0.16, 0.9, trim, BS.x, 0.45, BS.z, 10); blocks.push([BS.x - 1.4, BS.x + 1.4, BS.z - 0.7, BS.z + 0.7]);
  let lamp; { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 8, 28), basic('#fff6e0').clone()); ring.rotation.x = Math.PI / 2; ring.position.set(BS.x, 3.4, BS.z); g.add(ring); lamp = { ring, pole: B(0.08, h - 3.4, 0.08, trim, BS.x, (h + 3.4) / 2, BS.z) };
    const xr = tex(canvas(512, 320, (c, w, hh) => { c.fillStyle = '#0d2a3a'; c.fillRect(0, 0, w, hh); c.strokeStyle = '#e8fbff'; c.lineCap = 'round'; c.lineWidth = 10; const L = (a, b, d, e) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); };
      L(110, 160, 400, 160); for (let i = 0; i < 9; i++) L(150 + i * 28, 160, 150 + i * 28 + 8, 120); L(150, 160, 120, 250); L(190, 160, 210, 250); L(360, 160, 330, 250); L(390, 160, 420, 250); c.lineWidth = 6; for (let i = 0; i < 5; i++) L(400 + i * 18, 160 - i * 12, 418 + i * 18, 148 - i * 12);
      c.beginPath(); c.arc(80, 140, 34, 0, 7); c.stroke(); L(60, 110, 50, 78); L(96, 110, 108, 78); c.strokeStyle = '#ff6a5a'; c.lineWidth = 6; L(195, 196, 212, 214); c.font = `900 34px ${FONT}`; c.fillStyle = '#5fe3ff'; c.fillText('BONE SET', 20, 300); }));
    plane(3.4, 2.1, new THREE.MeshBasicMaterial({ map: xr, toneMapped: false }), hw - 0.17, 2.4, BS.z, -Math.PI / 2); }
  // cabinet of glowing vials (east wall, south of the light board) + the NOW HIRING board by the door
  B(0.6, 2.4, 3.2, toon('#e8eef2'), hw - 0.45, 1.2, 1.4); blocks.push([hw - 0.8, hw, -0.3, 3.1]);
  { const vm = [basic('#7dff9a'), basic('#5fe3ff'), basic('#ffb454'), basic('#c890ff')]; for (let i = 0; i < 4; i++) for (let k = 0; k < (LOW ? 4 : 8); k++) C(0.06, 0.06, 0.22, pick(vm), hw - 0.8, 0.5 + i * 0.55, 0.0 + k * (2.8 / (LOW ? 4 : 8)), 6); }
  sign(['NOW HIRING', 'BONE SET · TAP TO START'], 2.2, 1.1, '#ec3013', IB.hiring.x, 1.9, IB.hiring.z - 0.06, 0, '#0b1218'); B(2.3, 1.2, 0.08, trim, IB.hiring.x, 1.9, IB.hiring.z - 0.12); C(0.05, 0.05, 1.3, trim, IB.hiring.x, 0.65, IB.hiring.z - 0.12, 6); circles.push([IB.hiring.x, IB.hiring.z - 0.12, 0.45]);
  // a potted plant + waiting bench by the door (west)
  B(3.0, 0.45, 0.8, toon('#5a6a74'), -7.5, 0.25, hd - 0.9); blocks.push([-9.1, -5.9, hd - 1.4, hd]); C(0.35, 0.28, 0.6, toon('#e8eef2'), -10.8, 0.3, hd - 1.0, 12); C(0.05, 0.5, 1.2, toon('#4f8a3a'), -10.8, 1.2, hd - 1.0, 7); circles.push([-10.8, hd - 1.0, 0.6]);
  function walk(x, z) { if (x < -hw + 0.5 || x > hw - 0.5 || z < -hd + 0.6 || z > hd - 0.4) return Math.abs(x) < 1.4 && z > hd - 0.4 && z < hd + 0.8; for (const [a, b, c, d] of blocks) if (x > a - 0.3 && x < b + 0.3 && z > c - 0.3 && z < d + 0.3) return false; for (const [cx, cz, r] of circles) if (Math.hypot(x - cx, z - cz) < r + 0.3) return false; return true; }
  return { g, anims, walk, scan: S, lamp };
}
