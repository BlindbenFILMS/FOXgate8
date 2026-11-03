// CARGO BAY FOUR [dsfCargo] interior (s349). Small shuttles fly in through the force-field door (Ben s349); SHUTTLE HIRE desk;
// the ambush teaser: three HACKED Machine Fleet LOADER ROBOTS behind a cordon (the battle comes later: gate dsfCargoAmbush).
// Built far from the ring at (OX, 0, 0). Local frame: promenade door south (z = +hd), the force field onto space north (z = -hd).
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=349f';
export const CB = { OX: 2600, hw: 22, hd: 18, h: 14, door: { x: 0, z: 17.2 }, enter: { x: 0, z: 13 }, pad: { x: 0, z: -5, r: 6 }, desk: { x: -14, z: 10 }, hiring: { x: -10.4, z: 12.6 }, tele: { x: 12, z: 12 } };
export function buildCargo(K) {
  const { THREE, scene, M, BOX, toon, basic, glowSprite, rnd, rr, pick, LOW } = K;
  const g = new THREE.Group(); g.position.set(CB.OX, 0, 0); scene.add(g);
  const anims = [], blocks = [], circles = [], robots = [];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, ol = 0, p = g) => M(BOX(w, h, d), mat, x, y, z, p, ol);
  const C = (r1, r2, h, mat, x, y, z, seg = 16, p = g) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, p, 0);
  const flat = (geo, mat, x, y, z, p = g) => { const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); p.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#0e0d0c') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const { hw, hd, h } = CB;
  // shell: deck plating with hazard lanes, walls, the big opening north
  const deck = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#3a3a3c'; c.fillRect(0, 0, w, w); c.strokeStyle = '#26262a'; c.lineWidth = 3; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, w); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(0,0,0,${(rnd() * 0.15).toFixed(2)})`; c.fillRect(rnd() * w, rnd() * w, rr(4, 30), rr(2, 8)); } }));
  deck.wrapS = deck.wrapT = THREE.RepeatWrapping; deck.repeat.set(11, 9); flat(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#c8c8cc', { map: deck }), 0, 0, 0).receiveShadow = true;
  const hz = tex(canvas(256, 32, (c, w, H) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, H); c.fillStyle = '#e8c45a'; for (let x = -H; x < w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 16, 0); c.lineTo(x + 16 + H, H); c.lineTo(x + H, H); c.fill(); } })); hz.wrapS = THREE.RepeatWrapping;
  const stripe = (x, z, w, d, rot = 0) => { const t = hz.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(Math.max(w, d) / 2)), 1); const m = flat(new THREE.PlaneGeometry(Math.max(w, d), 0.5), new THREE.MeshBasicMaterial({ map: t }), x, 0.02, z); m.rotation.z = rot; return m; };
  stripe(0, 2.2, 30, 0); stripe(-15, -5, 0, 14, Math.PI / 2); stripe(15, -5, 0, 14, Math.PI / 2);
  const ceil = flat(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#1c1d20', { side: THREE.DoubleSide }), 0, h, 0); void ceil;
  const wallM = toon('#34312c');
  B(0.4, h, hd * 2, wallM, -hw - 0.2, h / 2, 0); B(0.4, h, hd * 2, wallM, hw + 0.2, h / 2, 0);
  B(hw - 2, h, 0.4, wallM, -(hw + 2) / 2, h / 2, hd + 0.2); B(hw - 2, h, 0.4, wallM, (hw + 2) / 2, h / 2, hd + 0.2); B(4, h - 4, 0.4, wallM, 0, 4 + (h - 4) / 2, hd + 0.2);
  for (const sx of [-1, 1]) B(0.2, 4, 0.2, basic('#e8c45a'), sx * 2.1, 2, hd - 0.02); B(4.4, 0.2, 0.2, basic('#e8c45a'), 0, 4, hd - 0.02);
  const OW = 30, OH = 11; B((hw * 2 - OW) / 2, h, 0.6, wallM, -(OW / 2 + (hw * 2 - OW) / 4), h / 2, -hd - 0.3); B((hw * 2 - OW) / 2, h, 0.6, wallM, OW / 2 + (hw * 2 - OW) / 4, h / 2, -hd - 0.3); B(OW, h - OH, 0.6, wallM, 0, OH + (h - OH) / 2, -hd - 0.3);
  for (const sx of [-1, 1]) B(0.6, OH, 0.8, toon('#e8c45a'), sx * (OW / 2 + 0.3), OH / 2, -hd - 0.3); B(OW + 1.2, 0.6, 0.8, toon('#e8c45a'), 0, OH + 0.3, -hd - 0.3);
  // the force field across the opening (space behind it)
  const ffT = tex(canvas(256, 256, (c, w) => { c.fillStyle = 'rgba(120,220,255,0.06)'; c.fillRect(0, 0, w, w); c.strokeStyle = 'rgba(160,235,255,0.45)'; c.lineWidth = 1.5; for (let y = 0; y < w; y += 16) { c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, y + Math.sin(x * 0.08) * 3); c.stroke(); } })); ffT.wrapS = ffT.wrapT = THREE.RepeatWrapping; ffT.repeat.set(4, 1.5);
  const ff = new THREE.Mesh(new THREE.PlaneGeometry(OW, OH), new THREE.MeshBasicMaterial({ map: ffT, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); ff.position.set(0, OH / 2, -hd - 0.1); g.add(ff); anims.push((dt, t) => { ffT.offset.y -= dt * 0.08; ff.material.opacity = 0.45 + 0.1 * Math.sin(t * 2.3); });
  B(OW, 0.12, 0.3, basic('#7fe3ff'), 0, 0.06, -hd + 0.2);
  // landing pad + lights
  const P = CB.pad; flat(new THREE.CircleGeometry(P.r, 48), toon('#26282c'), P.x, 0.03, P.z); flat(new THREE.RingGeometry(P.r - 0.25, P.r, 64), basic('#e8c45a'), P.x, 0.04, P.z); flat(new THREE.RingGeometry(1.6, 1.9, 48), basic('#e8c45a', 0.8), P.x, 0.04, P.z);
  const padL = []; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; padL.push(glowSprite(P.x + Math.cos(a) * (P.r + 0.4), 0.2, P.z + Math.sin(a) * (P.r + 0.4), 0xffc040, 0.9, 0.8, g)); } anims.push((dt, t) => padL.forEach((s, i) => { s.material.opacity = ((t * 6 - i) % 12 + 12) % 12 < 1.5 ? 1 : 0.25; }));
  sign(['SHUTTLE PAD', 'KEEP CLEAR WHEN AMBER'], 4.6, 1.1, '#e8c45a', -hw + 0.05, 5.5, -5, Math.PI / 2);
  // the overhead crane gantry, moving slowly
  for (const sx of [-1, 1]) B(0.6, 0.6, hd * 2, toon('#e8c45a'), sx * (hw - 1), h - 1.2, 0);
  const crane = new THREE.Group(); crane.position.set(0, h - 1.2, 0); g.add(crane); crane.add(new THREE.Mesh(BOX(hw * 2 - 2, 0.7, 0.9), toon('#e8c45a'))); const trol = new THREE.Mesh(BOX(1.6, 0.9, 1.4), toon('#3a3632')); trol.position.y = -0.6; crane.add(trol); const cab = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 6, 4), toon('#111')); cab.position.y = -3.8; trol.add(cab); const hook = new THREE.Mesh(BOX(2.2, 1.6, 1.6), toon('#7a5a2a')); hook.position.y = -7.4; trol.add(hook);
  anims.push((dt, t) => { crane.position.z = Math.sin(t * 0.07) * 9 + 3; trol.position.x = Math.sin(t * 0.11 + 1) * 12; });
  // crates along both walls (Tessa Vor's stock, freight)
  const cols = ['#7a5a2a', '#5a6a3a', '#8a4a2a', '#4a5a6a', '#7a6a3a', '#6a3a3a'];
  const stack = (x0, z0, nx, nz, ny) => { for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const n = 1 + Math.floor(rnd() * ny); for (let k = 0; k < n; k++) B(1.9, 1.9, 1.9, toon(pick(cols)), x0 + i * 2.05, 0.95 + k * 1.95, z0 + j * 2.05, 0.02); } blocks.push([x0 - 1.1, x0 + (nx - 1) * 2.05 + 1.1, z0 - 1.1, z0 + (nz - 1) * 2.05 + 1.1]); };
  stack(-hw + 1.4, -12, 2, 5, 3); stack(-hw + 1.4, 1, 2, 3, 2); stack(hw - 3.5, 4, 2, 4, 3);
  sign(['STOCK · T. VOR', 'DO NOT OPEN'], 2.6, 0.8, '#e8c45a', -hw + 5.6, 1.6, -7.5, Math.PI / 2);
  // fuel lines + beacons
  for (const z of [-14, -2]) { C(0.25, 0.25, h - 2, toon('#8a3a2a'), hw - 0.6, (h - 2) / 2, z, 10); }
  const bec = []; for (const [x, z] of [[-OW / 2 - 1.2, -hd + 0.4], [OW / 2 + 1.2, -hd + 0.4]]) { C(0.25, 0.3, 0.4, basic('#ff3a1a'), x, OH + 1.2, z, 10); bec.push(glowSprite(x, OH + 1.2, z + 0.4, 0xff2a10, 3, 0.8, g)); } anims.push((dt, t) => bec.forEach((s, i) => { s.material.opacity = 0.25 + 0.7 * Math.max(0, Math.sin(t * 4 + i * Math.PI)); }));
  // overhead work lights
  const wl = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const x = -15 + i * 10, z = -12 + j * 11; B(2.4, 0.2, 0.6, basic('#fff2dc'), x, h - 0.3, z); wl.push(glowSprite(x, h - 0.6, z, 0xfff0d0, 4, 0.35, g)); }
  // SHUTTLE HIRE desk (south-west) + NOW HIRING
  B(5, 1.1, 1.4, toon('#3a3632'), CB.desk.x, 0.55, CB.desk.z, 0.03); B(5.2, 0.12, 1.6, toon('#e8c45a'), CB.desk.x, 1.16, CB.desk.z); B(4.8, 0.06, 0.05, basic('#e8c45a'), CB.desk.x, 0.14, CB.desk.z + 0.72); blocks.push([CB.desk.x - 2.7, CB.desk.x + 2.7, CB.desk.z - 2.6, CB.desk.z + 0.9]);
  sign(['SHUTTLE HIRE', 'MERU · KUFA STATION · CHARTERS'], 5, 1.3, '#e8c45a', CB.desk.x, 3.0, CB.desk.z - 1.6);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), basic('#9fd8ff', 0.85)); scr.position.set(CB.desk.x + 1.4, 1.65, CB.desk.z - 0.2); scr.rotation.x = -0.3; g.add(scr);
  C(0.05, 0.05, 1.5, toon('#2a2622'), CB.hiring.x - 0.5, 0.75, CB.hiring.z, 6); C(0.05, 0.05, 1.5, toon('#2a2622'), CB.hiring.x + 0.5, 0.75, CB.hiring.z, 6); sign(['NOW HIRING', 'CARGO LOADER'], 1.5, 0.9, '#ec3013', CB.hiring.x, 1.55, CB.hiring.z + 0.04, 0, '#f3f2f2'); circles.push([CB.hiring.x, CB.hiring.z, 0.6]);
  // the bay's own transporter pad
  { const T = CB.tele; flat(new THREE.CircleGeometry(1.8, 40), toon('#101821'), T.x, 0.03, T.z); const rs = [1, 0.66, 0.33].map((k, i) => flat(new THREE.RingGeometry(1.8 * k - 0.06, 1.8 * k, 48), basic('#7dd3fc', i ? 0.6 : 1), T.x, 0.05, T.z)); anims.push((dt, t) => rs.forEach((r, i) => { if (i) r.material.opacity = 0.4 + 0.3 * Math.sin(t * 2.4 + i); })); sign('TRANSPORTER', 2.6, 0.5, '#7dd3fc', T.x, 2.6, T.z + 1.9, Math.PI, '#0b1218'); }
  // HACKED LOADER ROBOTS behind a cordon (east bay)
  const RB = { x0: 8, x1: hw - 4, z0: -15, z1: -8 };
  for (const z of [RB.z1 + 0.8]) { stripe((RB.x0 + RB.x1) / 2, z, RB.x1 - RB.x0, 0); }
  for (let i = 0; i <= 4; i++) { const x = RB.x0 + i * (RB.x1 - RB.x0) / 4; C(0.08, 0.1, 1.1, toon('#e8c45a'), x, 0.55, RB.z1 + 0.8, 8); } B(RB.x1 - RB.x0, 0.06, 0.06, toon('#ec3013'), (RB.x0 + RB.x1) / 2, 0.95, RB.z1 + 0.8);
  blocks.push([RB.x0 - 0.3, hw, -hd, RB.z1 + 1.1]);
  sign(['CAUTION', 'LOADERS OFFLINE · DO NOT CROSS'], 3.6, 1.0, '#ec3013', (RB.x0 + RB.x1) / 2, 1.9, RB.z1 + 0.84, 0, '#f3f2f2');
  const bodyM = toon('#c8b07a'), darkM = toon('#3a3632');
  for (let i = 0; i < 3; i++) { const r = new THREE.Group(); const x = RB.x0 + 2 + i * 4, z = -12 + (i % 2) * 1.4; r.position.set(x, 0, z); g.add(r);
    B(1.8, 0.6, 1.4, darkM, 0, 0.3, 0, 0.02, r); const bd = B(1.4, 1.7, 1.0, bodyM, 0, 1.5, 0, 0.03, r); void bd; const hd2 = B(1.0, 0.6, 0.8, bodyM, 0, 2.7, 0, 0.03, r);
    const eye = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.18), new THREE.MeshBasicMaterial({ color: 0xff2a10, toneMapped: false })); eye.position.set(0, 2.72, 0.41); r.add(eye); const eg = glowSprite(0, 2.72, 0.6, 0xff2a10, 1.2, 0.7, r);
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.85, 2.0, 0); r.add(a); B(0.3, 1.4, 0.3, darkM, 0, -0.6, 0, 0.02, a); B(0.5, 0.25, 0.6, toon('#e8c45a'), 0, -1.35, 0.15, 0, a); return a; });
    C(0.03, 0.03, 0.6, darkM, 0.3, 3.3, 0, 4, r); const ant = glowSprite(0.3, 3.6, 0, 0xff2a10, 0.4, 0.9, r);
    r.rotation.y = rr(-0.6, 0.6); const R0 = { x, z, ry: r.rotation.y };
    robots.push({ r, eye, eg, ant, arms, R0, glitch: rr(1, 4), real: 0, at: [x, z] }); }
  anims.push((dt, t) => robots.forEach((b, i) => { b.glitch -= dt; b.arms.forEach((a, k) => { a.rotation.x = Math.sin(t * 0.8 + i + k) * 0.15; });
    if (b.glitch < 0) { b.glitch = rr(1.5, 5); b.jt = 0.35; b.real = rnd() < 0.35 ? 0.25 : 0; }
    if (b.jt > 0) { b.jt -= dt; b.r.position.x = b.R0.x + rr(-0.06, 0.06); b.r.rotation.y = b.R0.ry + rr(-0.12, 0.12); } else { b.r.position.x = b.R0.x; b.r.rotation.y = b.R0.ry + Math.sin(t * 0.3 + i) * 0.2; }
    if (b.real > 0) { b.real -= dt; b.eye.material.color.set(0x5fe3ff); b.eg.material.color.set(0x5fe3ff); } else { b.eye.material.color.set(0xff2a10); b.eg.material.color.set(0xff2a10); }
    b.eye.material.opacity = 1; b.ant.material.opacity = (t * 2 + i) % 1 < 0.2 ? 1 : 0.2; }));
  // the small shuttle that comes and goes through the force field
  const sh = new THREE.Group(); g.add(sh); const hullM = toon('#d8dce2');
  { const hb = new THREE.Mesh(BOX(4.4, 2.0, 7.0), hullM); hb.position.y = 1.6; sh.add(hb); const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 1.4, 2.4, 4), hullM); nose.rotation.set(-Math.PI / 2, Math.PI / 4, 0); nose.position.set(0, 1.6, -4.6); sh.add(nose); const win = new THREE.Mesh(BOX(3.0, 0.7, 0.1), toon('#38bdf8', { emissive: new THREE.Color('#0e4a6e'), emissiveIntensity: 0.7 })); win.position.set(0, 2.2, -3.52); sh.add(win);
    const stripeM = toon('#ec3013'); const st = new THREE.Mesh(BOX(4.45, 0.3, 7.05), stripeM); st.position.y = 1.2; sh.add(st); for (const s of [-1, 1]) { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 5, 12), toon('#8a919a')); n.rotation.x = Math.PI / 2; n.position.set(s * 2.9, 1.4, 0.6); sh.add(n); const leg = new THREE.Mesh(BOX(0.2, 0.9, 0.2), toon('#555')); leg.position.set(s * 1.6, 0.45, 0); sh.add(leg); }
    sh.userData.glow = [-1, 1].map(s => glowSprite(s * 2.9, 1.4, 3.3, 0x7fd8ff, 2.4, 0.9, sh)); }
  const SH = { ph: 'landed', t: 12 }, far = new THREE.Vector3(10, 26, -140), padV = new THREE.Vector3(P.x, 0, P.z);
  anims.push((dt, t) => { SH.t -= dt; const glow = k => sh.userData.glow.forEach(s => { s.material.opacity = k; });
    if (SH.ph === 'landed') { sh.position.copy(padV); sh.rotation.set(0, 0, 0); glow(0.15); if (SH.t < 0) { SH.ph = 'out'; SH.t = 7; } }
    else if (SH.ph === 'out') { const u = 1 - SH.t / 7, k = u * u; sh.position.lerpVectors(padV, far, k); sh.position.y += Math.sin(Math.min(1, u * 3) * Math.PI / 2) * 3; sh.rotation.x = -0.15 * Math.min(1, u * 4); glow(0.9); if (SH.t < 0) { SH.ph = 'away'; SH.t = rr(10, 20); sh.visible = false; } }
    else if (SH.ph === 'away') { if (SH.t < 0) { SH.ph = 'in'; SH.t = 8; sh.visible = true; } }
    else if (SH.ph === 'in') { const u = 1 - SH.t / 8, k = 1 - Math.pow(1 - u, 3); sh.position.lerpVectors(far, padV, k); sh.position.y += (1 - k) * 2; sh.rotation.x = 0.1 * (1 - k); glow(0.9 * (1 - k) + 0.2); if (SH.t < 0) { SH.ph = 'landed'; SH.t = rr(18, 30); } } });
  circles.push([P.x, P.z, 4.2]);
  function walk(x, z) { if (x < -hw + 0.5 || x > hw - 0.5 || z < -hd + 0.8 || z > hd - 0.4) return Math.abs(x) < 1.8 && z > hd - 0.4 && z < hd + 0.8; for (const [a, b, c, d] of blocks) if (x > a && x < b && z > c && z < d) return false; for (const [cx, cz, r] of circles) if (Math.hypot(x - cx, z - cz) < r && !(SH.ph !== 'landed' && cx === P.x && cz === P.z)) return false; return true; }
  return { g, anims, walk, robots, shuttle: SH };
}
