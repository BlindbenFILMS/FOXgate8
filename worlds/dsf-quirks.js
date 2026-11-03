// QUIRK'S BAR [dsfQuirks] interior (s349). Built far from the ring at (OX, 0, 0); entered with the quick fade.
// Local frame: door on the south wall (z = +11), the long bar along the north wall, the DABA wheel east, the holosuite mezzanine west.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=349f';
export const QB = { OX: 2000, hw: 15, hd: 11, h: 9, door: { x: 0, z: 10.2 }, enter: { x: 0, z: 6.4 }, hiring: { x: 8.2, z: -5.2 }, arcade: { x: 13.75, zs: [4.4, 6.4, 8.4] } };
export function buildQuirks(K) {
  const { THREE, scene, M, BOX, toon, basic, glowSprite, rnd, rr, pick, LOW } = K;
  const g = new THREE.Group(); g.position.set(QB.OX, 0, 0); scene.add(g);
  const anims = [], blocks = [], circles = [];
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, ol = 0) => { const m = M(BOX(w, h, d), mat, x, y, z, g, ol); return m; };
  const C = (r1, r2, h, mat, x, y, z, seg = 16, ol = 0) => M(new THREE.CylinderGeometry(r1, r2, h, seg), mat, x, y, z, g, ol);
  const flat = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); g.add(m); return m; };
  const sign = (lines, w, h, fg, x, y, z, ry = 0, bg = '#0e0d0c') => { lines = [].concat(lines); const ch = Math.max(128, Math.round(1024 * h / w)); const t = tex(canvas(1024, ch, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = fg; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); const n = lines.length, lh = H * 0.8 / n; lines.forEach((s, i) => { let fs = lh * (i ? 0.7 : 0.86); c.font = `900 ${fs}px ${FONT}`; const tw = c.measureText(s).width; if (tw > W * 0.9) { fs *= W * 0.9 / tw; c.font = `900 ${fs}px ${FONT}`; } c.fillStyle = i ? '#f3f2f2' : fg; c.textBaseline = 'middle'; c.fillText(s, W * 0.05, H * 0.1 + lh * (i + 0.5)); }); }));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const { hw, hd, h } = QB;
  // shell
  const wood = tex(canvas(256, 256, (c, w) => { c.fillStyle = '#4a2e18'; c.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 32) { c.fillStyle = `rgba(0,0,0,${(0.15 + rnd() * 0.2).toFixed(2)})`; c.fillRect(0, y, w, 2); for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(255,190,120,${(rnd() * 0.08).toFixed(3)})`; c.fillRect(rnd() * w, y + 4, rnd() * 80, 24); } } })); wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(8, 6);
  flat(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#c89a6a', { map: wood }), 0, 0, 0).receiveShadow = true;
  const ceil = flat(new THREE.PlaneGeometry(hw * 2, hd * 2), toon('#1e1610', { side: THREE.DoubleSide }), 0, h, 0); void ceil;
  const wallM = toon('#3a2414');
  B(hw * 2, h, 0.4, wallM, 0, h / 2, -hd - 0.2); B(0.4, h, hd * 2, wallM, -hw - 0.2, h / 2, 0); B(0.4, h, hd * 2, wallM, hw + 0.2, h / 2, 0);
  B(hw - 1.6, h, 0.4, wallM, -(hw + 1.6) / 2, h / 2, hd + 0.2); B(hw - 1.6, h, 0.4, wallM, (hw + 1.6) / 2, h / 2, hd + 0.2); B(3.2, h - 3.6, 0.4, wallM, 0, 3.6 + (h - 3.6) / 2, hd + 0.2);
  B(3.2, 3.6, 0.1, basic('#1a1008'), 0, 1.8, hd + 0.35);
  for (const sx of [-1, 1]) B(0.16, 3.6, 0.2, basic('#e0a13c'), sx * 1.7, 1.8, hd - 0.02); B(3.6, 0.16, 0.2, basic('#e0a13c'), 0, 3.6, hd - 0.02);
  // front windows onto the promenade (warm light from outside) + light patches + dust motes
  for (const sx of [-1, 1]) { B(hw - 5, 4.2, 0.06, basic('#ffcf8a', 0.85), sx * (hw / 2 + 1.5), 3.2, hd - 0.02); for (let i = 0; i <= 4; i++) B(0.16, 4.3, 0.1, toon('#1a0f06'), sx * (3.4 + i * (hw - 5) / 4), 3.2, hd - 0.08); }
  const patch = tex(canvas(128, 128, (c, w) => { const gr = c.createLinearGradient(0, 0, 0, w); gr.addColorStop(0, 'rgba(255,200,130,0.5)'); gr.addColorStop(1, 'rgba(255,200,130,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); }));
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const p = flat(new THREE.PlaneGeometry(1.9, 4.2), new THREE.MeshBasicMaterial({ map: patch, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), sx * (4.4 + i * 2.5), 0.02, hd - 2.4); p.rotation.z = 0; }
  { const n = LOW ? 40 : 110, pos = []; for (let i = 0; i < n; i++) pos.push(rr(-12, 12), rr(0.4, 4.6), rr(hd - 5, hd - 0.5)); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); const mot = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffe0b0, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(mot);
    const base = pos.slice(); anims.push((dt, t) => { const a = geo.attributes.position.array; for (let i = 0; i < n; i++) { a[i * 3] = base[i * 3] + Math.sin(t * 0.3 + i) * 0.4; a[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.21 + i * 1.7) * 0.3; } geo.attributes.position.needsUpdate = true; mot.material.opacity = 0.5 + 0.2 * Math.sin(t * 0.7); }); }
  // the long bar + backlit shelves of bottles
  const copper = toon('#b8742a', { emissive: new THREE.Color('#3a2008'), emissiveIntensity: 0.4 });
  B(18, 1.1, 1.4, toon('#2a1a0c'), -2, 0.55, -7.2, 0.03); B(18.4, 0.14, 1.7, copper, -2, 1.17, -7.2); B(18, 0.08, 0.05, basic('#ffb454'), -2, 0.12, -6.48);
  blocks.push([-11.2, 7.2, -7.95, -5.9], [-12.2, 8.0, -hd, -10.35]); /* s360: the lane behind the bar is walkable (BAR SHIFT), in from the east end */
  for (const x of [-10, -7.7, -5.4, -3.4, -2.0, -0.6, 0.8, 3.0, 5.3]) { /* s360: the 4 middle stools are the BAR SHIFT seats */ C(0.32, 0.32, 0.1, toon('#c0281a'), x, 0.82, -5.75, 12); C(0.05, 0.05, 0.8, toon('#222'), x, 0.4, -5.75, 6); }
  for (let r = 0; r < 3; r++) { B(20, 0.1, 0.5, toon('#1a0f06'), -2, 1.9 + r * 1.2, -hd + 0.3); B(20, 1.0, 0.05, basic('#ffb454', 0.55), -2, 2.4 + r * 1.2, -hd + 0.06); }
  { const L = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 34; i++) L.push([-11.6 + i * 0.58 + rr(-0.05, 0.05), 2.1 + r * 1.2, -hd + 0.35, rr(0.7, 1.2)]); const cols = ['#5fe3ff', '#8fe38f', '#e0a13c', '#b3121b', '#b98ad8', '#f2c94c'];
    const geo = new THREE.CylinderGeometry(0.09, 0.11, 0.5, 8); cols.forEach((c, ci) => { const list = L.filter((_, i) => i % cols.length === ci); const im = new THREE.InstancedMesh(geo, toon(c, { emissive: new THREE.Color(c), emissiveIntensity: 0.35, transparent: true, opacity: 0.9 }), list.length), o = new THREE.Object3D(); list.forEach(([x, y, z, s], i) => { o.position.set(x, y + 0.25 * s, z); o.scale.set(1, s, 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); g.add(im); }); }
  sign("QUIRK'S", 7, 1.5, '#e0a13c', -2, 6.0, -hd + 0.05);
  // the DABA table: built by worlds/dsf-daba.js (s358, the real game); the wall sign stays here
  const DT = { x: 9.5, z: -0.5 }; blocks.push([DT.x - 3.35, DT.x + 3.35, DT.z - 1.7, DT.z + 1.7]);
  sign(['DABA', 'THE WHEEL · ALL BETS'], 4.2, 1.4, '#e0a13c', hw - 0.05, 4.4, DT.z, -Math.PI / 2);
  // s488 QUIRK'S ARCADE: three pachinko cabinets on the east wall (south of DABA); each plays Fox Gate Pachinko in world (station-pachinko.js).
  // The head (board + marquee) is a group per cabinet; the one you play hides and the game's machine stands on the base.
  const AR = QB.arcade, heads = [], neon = ['#ff3ab4', '#5fe3ff', '#ffd23a'];
  const face = tex(canvas(256, 288, (c, W, H) => { c.fillStyle = '#120c2a'; c.fillRect(0, 0, W, H); c.strokeStyle = '#c9ccd2'; c.lineWidth = 8; c.beginPath(); c.arc(W / 2, H * 0.48, W * 0.42, 0, 7); c.stroke();
    c.fillStyle = '#d8dce4'; for (let y = 50; y < H - 50; y += 18) for (let x = 40 + (y / 18 % 2) * 9; x < W - 40; x += 18) if (Math.hypot(x - W / 2, y - H * 0.48) < W * 0.38) c.fillRect(x, y, 3, 3);
    c.fillStyle = '#ec3013'; c.fillRect(W / 2 - 34, H * 0.42, 68, 40); c.fillStyle = '#ffd23a'; c.font = '900 26px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('7 7 7', W / 2, H * 0.42 + 21); }));
  AR.zs.forEach((z, i) => { const x = AR.x; B(0.95, 1.0, 0.7, toon('#1b1048'), x, 0.5, z); B(0.97, 0.06, 0.72, toon('#c9ccd2'), x, 1.02, z); B(0.08, 0.03, 0.5, toon('#c9ccd2'), x - 0.36, 0.86, z);
    C(0.16, 0.16, 0.05, toon('#c9ccd2'), x - 0.37, 0.62, z + 0.28, 12).rotation.z = Math.PI / 2;
    const hd2 = new THREE.Group(); hd2.position.set(x + 0.1, 0, z); g.add(hd2); const hb = new THREE.Mesh(BOX(0.4, 1.15, 0.95), toon('#241a52')); hb.position.set(0.05, 1.62, 0); hd2.add(hb);
    const fm = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.97), new THREE.MeshBasicMaterial({ map: face, toneMapped: false })); fm.position.set(-0.155, 1.6, 0); fm.rotation.y = -Math.PI / 2; hd2.add(fm);
    const mq = new THREE.Mesh(BOX(0.3, 0.26, 0.95), basic(neon[i])); mq.position.set(0.0, 2.33, 0); hd2.add(mq); heads.push(hd2); });
  sign(['PACHINKO', 'FOX GATE · STEP UP'], 0.9, 0.24, '#ff3ab4', AR.x - 0.21, 2.33, AR.zs[1], -Math.PI / 2).visible = true;
  sign(["QUIRK'S ARCADE", 'PACHINKO · STAND ON A RING'], 5.2, 1.3, '#ff3ab4', hw - 0.05, 4.0, AR.zs[1], -Math.PI / 2);
  blocks.push([AR.x - 0.5, hw, AR.zs[0] - 0.55, AR.zs[2] + 0.55]);
  const arcRings = AR.zs.map((z, i) => { const r = flat(new THREE.RingGeometry(0.5, 0.66, 32), new THREE.MeshBasicMaterial({ color: neon[i], transparent: true, opacity: 0.85, toneMapped: false }), AR.x - 1.35, 0.03, z); return r; });
  anims.push((dt, t) => { heads.forEach((hd2, i) => { const m = hd2.children[2]; if (m) m.material.color.set(Math.floor(t * 3 + i) % 3 ? neon[i] : '#f3f2f2'); }); arcRings.forEach((r, i) => { r.material.opacity = 0.6 + 0.3 * Math.sin(t * 3 + i); }); });
  // tall bar tables
  const TB = [[-7.5, 1.5], [-2.5, 4.6], [2.8, 1.2], [-9.5, 6.4], [4.6, 6.0]]; for (const [x, z] of TB) { C(0.75, 0.75, 0.08, copper, x, 1.12, z, 20); C(0.08, 0.08, 1.1, toon('#1a0f06'), x, 0.55, z, 8); C(0.4, 0.4, 0.06, toon('#1a0f06'), x, 0.03, z, 12); circles.push([x, z, 1.05]); C(0.06, 0.05, 0.22, basic('#8fe38f', 0.85), x + 0.2, 1.27, z, 8); }
  // mezzanine + the holosuite doors (BOOKED)
  const MZ = { x0: -hw, x1: -10.6, z0: -hd, z1: 3.4, y: 4.4 }; B(MZ.x1 - MZ.x0, 0.35, MZ.z1 - MZ.z0, toon('#2a1a0c'), (MZ.x0 + MZ.x1) / 2, MZ.y - 0.17, (MZ.z0 + MZ.z1) / 2);
  B(0.08, 0.08, MZ.z1 - MZ.z0, toon('#c8a050'), MZ.x1, MZ.y + 1.0, (MZ.z0 + MZ.z1) / 2); for (let i = 0; i <= 7; i++) C(0.04, 0.04, 1.0, toon('#c8a050'), MZ.x1, MZ.y + 0.5, MZ.z0 + i * (MZ.z1 - MZ.z0) / 7, 6); B(0.06, 0.06, MZ.z1 - MZ.z0, basic('#ffb454'), MZ.x1, MZ.y - 0.36, (MZ.z0 + MZ.z1) / 2);
  for (const [x, z] of [[MZ.x1, -9], [MZ.x1, -3], [MZ.x1, 2.6]]) C(0.18, 0.18, MZ.y, toon('#2a1a0c'), x, MZ.y / 2, z, 10);
  for (let i = 0; i < 3; i++) { const z = -8.5 + i * 3.6; B(0.1, 2.8, 1.8, toon('#151018'), -hw + 0.06, MZ.y + 1.4, z); B(0.12, 0.25, 0.6, basic('#ec3013'), -hw + 0.1, MZ.y + 3.05, z); glowSprite(-hw + 0.3, MZ.y + 3.05, z, 0xff3a1a, 1.0, 0.7, g); }
  const steps = 14; for (let i = 0; i < steps; i++) B(2.6, 0.25, 0.5, toon('#3a2414'), -12.8, MZ.y * (i + 1) / steps - 0.12, 9.2 - i * 0.42);
  blocks.push([-14.6, -11.4, 3.2, 9.6]); for (const [x, z] of [[MZ.x1, -9], [MZ.x1, -3], [MZ.x1, 2.6]]) circles.push([x, z, 0.4]);
  C(0.05, 0.05, 1.0, toon('#c8a050'), -11.2, 0.5, 9.6, 6); C(0.05, 0.05, 1.0, toon('#c8a050'), -14.4, 0.5, 9.6, 6); B(3.2, 0.06, 0.06, toon('#b3121b'), -12.8, 0.85, 9.6);
  sign(['HOLOSUITES', 'BOOKED UNTIL SECOND SHIFT'], 3.0, 0.9, '#ff9a3a', -12.8, 1.7, 9.75, Math.PI);
  // the viewport onto space (painted: stars + the limb of Meru)
  const vp = tex(canvas(512, 512, (c, w) => { c.fillStyle = '#03040a'; c.fillRect(0, 0, w, w); for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(255,255,255,${(rnd() * 0.9).toFixed(2)})`; c.fillRect(rnd() * w, rnd() * w, 2, 2); } const gr = c.createRadialGradient(w * 0.5, w * 1.9, w * 1.1, w * 0.5, w * 1.9, w * 1.55); gr.addColorStop(0, '#2c6ea8'); gr.addColorStop(0.9, '#4a9ad8'); gr.addColorStop(1, 'rgba(120,200,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, w); c.globalCompositeOperation = 'destination-in'; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - 2, 0, 6.283); c.fill(); }));
  const vpm = new THREE.Mesh(new THREE.CircleGeometry(2.3, 48), new THREE.MeshBasicMaterial({ map: vp, transparent: true })); vpm.position.set(hw - 0.02, 5.6, -7.0); vpm.rotation.y = -Math.PI / 2; g.add(vpm); const vf = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.18, 8, 48), copper); vf.position.copy(vpm.position); vf.rotation.y = -Math.PI / 2; g.add(vf);
  // pendant lamps + the slow ceiling fan
  const pend = []; for (const [x, z] of [[-9, -3], [-4, 0], [1, -3], [-6, 5], [1, 6], [6, -4]]) { C(0.02, 0.02, 2.6, toon('#111'), x, h - 1.3, z, 4); const s = M(new THREE.SphereGeometry(0.3, 12, 8), basic('#ffcf8a'), x, h - 2.7, z, g, 0); void s; pend.push(glowSprite(x, h - 2.7, z, 0xffb454, 3.2, 0.55, g)); }
  anims.push((dt, t) => pend.forEach((p, i) => { p.material.opacity = 0.5 + 0.06 * Math.sin(t * 2 + i); }));
  const fan = new THREE.Group(); fan.position.set(-2, h - 0.6, 1.5); g.add(fan); C(0.25, 0.25, 0.3, toon('#2a1a0c'), 0, 0, 0, 12).removeFromParent(); fan.add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.3, 12), toon('#2a1a0c'))); for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(BOX(2.6, 0.05, 0.4), toon('#3a2414')); b.rotation.y = i * Math.PI / 2; b.position.set(Math.cos(i * Math.PI / 2) * 1.3, -0.1, -Math.sin(i * Math.PI / 2) * 1.3); fan.add(b); } anims.push(dt => { fan.rotation.y += dt * 1.1; });
  // NOW HIRING board at the end of the bar
  C(0.05, 0.05, 1.5, toon('#2a1a0c'), QB.hiring.x - 0.5, 0.75, QB.hiring.z, 6); C(0.05, 0.05, 1.5, toon('#2a1a0c'), QB.hiring.x + 0.5, 0.75, QB.hiring.z, 6); sign(['NOW HIRING', 'BAR SHIFT · TAP TO START'], 1.5, 0.9, '#ec3013', QB.hiring.x, 1.55, QB.hiring.z + 0.04, 0, '#f3f2f2'); circles.push([QB.hiring.x, QB.hiring.z, 0.6]);
  // walk test (local coords)
  function walk(x, z) { if (x < -hw + 0.5 || x > hw - 0.5 || z < -hd + 0.5 || z > hd - 0.4) return Math.abs(x) < 1.5 && z > hd - 0.4 && z < hd + 0.8; for (const [a, b, c, d] of blocks) if (x > a && x < b && z > c && z < d) return false; for (const [cx, cz, r] of circles) if (Math.hypot(x - cx, z - cz) < r) return false; return true; }
  return { g, anims, walk, DT, TB, arcade: { heads, spots: AR.zs.map(z => ({ x: AR.x - 1.35, z })) } };
}
