// MERU 2.0 — THE MERU ARENA from outside (Ben: "the interior can be seen from outside, the approach needs to feel epic").
// A colosseum at the end of the Arena Path (centre 406, 0; r 28, ~20 m tall, flood towers to 36 m) built from the same parts as the
// fight map (Meru Arena.dc.html): lavender sand ring + crest, navy tiers full of a bobbing crowd, King Might's royal box with the
// red / white awning on the far side. Three storeys of OPEN arches (see through to the stands), a 23 m GRAND PORTAL straight down the
// road with a tunnel cut through the stands, so from the gate at x 360 you look across the sand to the royal box.
// Approach: a forecourt with a red runner, two bronze fox champions on plinths, an avenue of hanging banners, flame braziers.
// Night: braziers + arcade lamps, flood-light beams onto the sand, a warm glow over the bowl. The tunnel barrier = E · ENTER MERU ARENA
// (spot 'arenaEnter' → the fight page; the page's ← TOWN brings you back here). Phone: half crowd, no shadows, far detail hidden.
export function buildArena({ THREE, scene, L, city, toon, CT, touch }) {
  const root = new THREE.Group(); root.name = 'meru2Arena'; scene.add(root);
  const AX = 406, AZ = 0, RF = 28, N = 32, STEP = Math.PI * 2 / N, PG = 0.392, SG = 0.18;   // portal half-angle, stands gap half-angle
  const C = city.colliders, colliders = [], col = o => { C.push(o); colliders.push(o); };
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), E = new THREE.Euler(), Qt = new THREE.Quaternion();
  const T = (x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0, s = 1) => new THREE.Matrix4().compose(V(x, y, z), Qt.setFromEuler(E.set(rx, ry, rz, 'YXZ')).clone(), typeof s === 'number' ? V(s, s, s) : s);
  const out = a => Math.PI / 2 - a;   // rotY that points local +Z outward at angle a
  const dA = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
  const bins = new Map(), add = (mat, g, m) => { g = g.index ? g.toNonIndexed() : g; g.applyMatrix4(m); (bins.get(mat) || bins.set(mat, []).get(mat)).push(g); };
  const merge = list => { let n = 0; for (const g of list) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
    for (const g of list) { if (!g.attributes.normal) g.computeVertexNormals(); pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return G; };
  const ring = (mat, r0, r1, y0, y1, gap = 0, segs = 96) => add(mat, new THREE.LatheGeometry([[r0, y0], [r1, y0], [r1, y1], [r0, y1], [r0, y0]].map(([r, y]) => new THREE.Vector2(r, y)), segs, 1.5 * Math.PI + gap, Math.PI * 2 - 2 * gap), T(AX, 0, AZ));
  const shadowy = m => { m.castShadow = !touch; m.receiveShadow = !touch; return m; };

  // ---------- materials ----------
  const stoneT = CT(256, 256, (g, w, h) => { let s = 4417; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; g.fillStyle = '#8c7f6c'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 4; y++) for (let x = -1; x < 3; x++) { const c = new THREE.Color('#dccfb6').offsetHSL(0, (r() - 0.5) * 0.03, (r() - 0.5) * 0.08); g.fillStyle = '#' + c.getHexString(); const x0 = x * 128 + (y % 2) * 64 + 2, y0 = y * 64 + 2; g.fillRect(x0, y0, 124, 60);
      g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(x0, y0, 124, 3); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x0, y0 + 54, 124, 6); for (let k = 0; k < 10; k++) { g.fillStyle = 'rgba(0,0,0,' + (0.03 + r() * 0.06) + ')'; g.fillRect(x0 + r() * 110, y0 + r() * 50, 3 + r() * 9, 2 + r() * 5); } } });
  stoneT.wrapS = stoneT.wrapT = THREE.RepeatWrapping; stoneT.repeat.set(0.25, 0.25);
  const stone = toon('#ffffff', { map: stoneT }), plain = toon('#cdbfa6'), red = toon('#ec3013'), gold = toon('#e6b45a'), navy = toon('#2d3360'), navyD = toon('#262b52'), rail = toon('#4b5390'),
    dark = toon('#3a3540'), ink = toon('#201e1d'), iron = toon('#3a3634'), bronze = toon('#c99a45'), bronzeD = toon('#8e6a2e'), white = toon('#f2f0ea'), throne = toon('#7a1d2a');
  const redGlow = toon('#c42d3c', { emissive: new THREE.Color('#c42d3c'), emissiveIntensity: 0.35 });
  const crestT = CT(256, 256, (g, w) => { g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill(); g.fillStyle = '#1b2350'; g.beginPath(); g.arc(128, 128, 104, 0, 7); g.fill(); g.strokeStyle = '#e6b45a'; g.lineWidth = 4; g.beginPath(); g.arc(128, 128, 92, 0, 7); g.stroke();
    g.fillStyle = '#f3f2f2'; g.font = '900 130px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', 128, 136); });
  const crestM = new THREE.MeshBasicMaterial({ map: crestT, transparent: true, alphaTest: 0.4 });

  // ---------- the bowl: sand, podium wall, tiers (gap = the tunnel to the west) ----------
  const sandT = CT(1024, 1024, g => { g.fillStyle = '#c9c6dd'; g.fillRect(0, 0, 1024, 1024); for (let i = 0; i < 5000; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(60,50,110,0.08)'; g.fillRect(Math.random() * 1024, Math.random() * 1024, 3, 3); }
    g.strokeStyle = 'rgba(70,60,120,0.22)'; g.lineWidth = 6; g.setLineDash([22, 16]); for (const r of [190, 360]) { g.beginPath(); g.arc(512, 512, r, 0, 7); g.stroke(); } g.setLineDash([]);
    g.fillStyle = 'rgba(80,70,130,0.10)'; for (const [x, y, r] of [[340, 330, 70], [700, 640, 90], [610, 330, 50], [380, 700, 60]]) { g.beginPath(); g.ellipse(x, y, r, r * 0.55, 0.3, 0, 7); g.fill(); } });
  const sandM = toon('#ffffff', { map: sandT }), sand = new THREE.Mesh(new THREE.CircleGeometry(13.2, 72), sandM); sand.rotation.x = -Math.PI / 2; sand.position.set(AX, 0.05, AZ); sand.receiveShadow = !touch; root.add(sand);
  const med = new THREE.Mesh(new THREE.CircleGeometry(2.2, 40), crestM); med.rotation.x = -Math.PI / 2; med.position.set(AX, 0.07, AZ); root.add(med);
  ring(navyD, 13.2, 13.6, 0, 1.3, SG); ring(redGlow, 13.15, 13.65, 1.3, 1.42, SG);
  const TIERS = 8, T0 = 13.6, TW = 1.45, TH = 1.05, Y0 = 1.6, tp = [[T0, 0], [T0, Y0]];
  for (let i = 0; i < TIERS; i++) tp.push([T0 + i * TW, Y0 + i * TH], [T0 + (i + 1) * TW, Y0 + i * TH]);
  const RB = T0 + TIERS * TW; tp.push([RB, 11], [RB + 1, 11], [RB + 1, 0], [T0, 0]);
  { const g = new THREE.LatheGeometry(tp.map(([r, y]) => new THREE.Vector2(r, y)), 96, 1.5 * Math.PI + SG, Math.PI * 2 - 2 * SG); add(navy, g, T(AX, 0, AZ)); }
  for (let i = 0; i < TIERS; i++) ring(rail, T0 + i * TW - 0.02, T0 + i * TW + 0.16, Y0 + i * TH + 0.01, Y0 + i * TH + 0.05, SG, 72);
  ring(gold, RB - 0.05, RB + 1.05, 11, 11.25, SG, 72);
  // tunnel cheek walls (radial, along the gap edges) + the barrier (gold posts, red rope) where the walk ends
  for (const s of [-1, 1]) { const a = Math.PI + s * SG; for (const [r0, r1, h] of [[13.4, 19, 4.2], [19, RF - 0.6, 10]]) { const rc = (r0 + r1) / 2; add(plain, new THREE.BoxGeometry(0.8, h, r1 - r0), T(AX + Math.cos(a) * rc, h / 2, AZ + Math.sin(a) * rc, out(a))); add(red, new THREE.BoxGeometry(0.86, 0.3, r1 - r0), T(AX + Math.cos(a) * rc, h - 0.15, AZ + Math.sin(a) * rc, out(a))); }
    for (let r = 20; r < RF; r += 1.2) col({ c: [AX + Math.cos(a) * r, AZ + Math.sin(a) * r, 0.6] }); }
  { const bx = AX - 22, hz = 22 * Math.sin(SG) - 0.5; for (const s of [-1, 1]) { add(gold, new THREE.CylinderGeometry(0.12, 0.14, 1.2, 10), T(bx, 0.6, s * hz)); add(gold, new THREE.SphereGeometry(0.18, 10, 8), T(bx, 1.25, s * hz)); }
    const rope = new THREE.CatmullRomCurve3([V(bx, 1.05, -hz), V(bx, 0.8, 0), V(bx, 1.05, hz)]); add(red, new THREE.TubeGeometry(rope, 12, 0.05, 6), T());
    col({ f: [bx - 0.4, bx + 0.4, -hz - 0.4, hz + 0.4] }); }

  // ---------- the royal box (east, facing the tunnel) ----------
  { const rx = AX + 17.2; add(navyD, new THREE.BoxGeometry(5, 3.2, 10), T(rx, 1.6, AZ)); add(gold, new THREE.BoxGeometry(5.2, 0.2, 10.2), T(rx, 3.25, AZ));
    for (const sz of [-1, 1]) for (const dx of [-2.2, 2.2]) add(gold, new THREE.BoxGeometry(0.22, 3.8, 0.22), T(rx + dx, 5.2, AZ + sz * 4.7));
    for (let k = 0; k < 12; k++) add(k % 2 ? white : red, new THREE.BoxGeometry(5.6, 0.08, 0.86), T(rx + 0.2, 7.2, AZ - 4.73 + k * 0.86, 0, 0, -0.26));
    add(throne, new THREE.BoxGeometry(0.4, 1.9, 1.5), T(rx + 1.4, 4.2, AZ)); add(throne, new THREE.BoxGeometry(1.1, 0.4, 1.7), T(rx + 0.9, 3.55, AZ)); add(gold, new THREE.BoxGeometry(0.45, 0.25, 1.6), T(rx + 1.4, 5.25, AZ));
    const cd = new THREE.Mesh(new THREE.CircleGeometry(1, 36), crestM); cd.position.set(rx - 2.75, 7.4, AZ); cd.rotation.y = -Math.PI / 2; root.add(cd); }

  // ---------- the facade: three storeys of open arches, cornices, parapet ----------
  const W = 2 * RF * Math.sin(STEP / 2) + 0.04, D = 1.4;
  const bay = (h, hw, spring, sill) => { const s = new THREE.Shape(), w = W / 2;
    if (sill == null) { s.moveTo(-w, 0); s.lineTo(-hw, 0); s.lineTo(-hw, spring); s.absarc(0, spring, hw, Math.PI, 0, true); s.lineTo(hw, 0); s.lineTo(w, 0); s.lineTo(w, h); s.lineTo(-w, h); s.closePath(); }
    else { s.moveTo(-w, 0); s.lineTo(w, 0); s.lineTo(w, h); s.lineTo(-w, h); s.closePath(); const hp = new THREE.Path(); hp.moveTo(-hw, sill); hp.lineTo(hw, sill); hp.lineTo(hw, spring); hp.absarc(0, spring, hw, 0, Math.PI, false); hp.lineTo(-hw, sill); s.holes.push(hp); }
    const g = new THREE.ExtrudeGeometry(s, { depth: D, bevelEnabled: false, curveSegments: 8 }); g.translate(0, 0, -D / 2); return g; };
  const STOR = [[0, 7, bay(7, 1.75, 4.4)], [7.5, 6, bay(6, 1.5, 3.4, 0.9)], [14, 4.8, bay(4.8, 1.2, 2.7, 0.9)]];
  const bays = []; for (let k = 0; k < N; k++) { const a = (k + 0.5) * STEP; if (dA(a, Math.PI) < PG) continue; bays.push(a); for (const [y, , g] of STOR) add(stone, g.clone(), T(AX + Math.cos(a) * RF, y, AZ + Math.sin(a) * RF, out(a))); }
  // pilasters between the bays (each storey), cornices, parapet, gallery floors behind the arches
  for (let k = 0; k < N; k++) { const a = k * STEP; if (dA(a, Math.PI) < PG + 0.02) continue; const x = AX + Math.cos(a) * (RF + 0.85), z = AZ + Math.sin(a) * (RF + 0.85);
    add(plain, new THREE.BoxGeometry(0.9, 18.6, 0.5), T(x, 9.3, z, out(a))); }
  const GP = PG - 0.01;
  ring(red, RF - 0.75, RF + 1.25, 7, 7.5, GP); ring(plain, RF - 0.75, RF + 1.25, 13.5, 14, GP); ring(plain, RF - 0.75, RF + 0.95, 18.8, 19.9, GP); ring(gold, RF - 0.8, RF + 1.0, 19.9, 20.15, GP);
  ring(dark, RB + 1, RF - 0.7, 6.95, 7.45, GP, 72); ring(dark, RB + 1, RF - 0.7, 13.45, 13.95, GP, 72); ring(plain, RB, RF - 0.7, 18.7, 18.85, GP, 72);
  ring(dark, RB + 1, RB + 1.1, 0, 6.95, GP, 72);   // dim back of the ground arcade
  for (let i = 0; i < 64; i++) { const a = (i + 0.5) / 64 * Math.PI * 2; if (dA(a, Math.PI) < PG + 0.04) continue; col({ c: [AX + Math.cos(a) * (RF + 0.3), AZ + Math.sin(a) * (RF + 0.3), 1.7] }); }

  // ---------- the GRAND PORTAL (west, straight down the road) + twin pylons ----------
  const PW = RF * Math.sin(PG) + 0.3, PX = AX - RF * Math.cos(PG) - 0.4;
  { const s = new THREE.Shape(); s.moveTo(-PW, 0); s.lineTo(-5, 0); s.lineTo(-5, 8); s.absarc(0, 8, 5, Math.PI, 0, true); s.lineTo(5, 0); s.lineTo(PW, 0); s.lineTo(PW, 20.2); s.lineTo(0, 23.4); s.lineTo(-PW, 20.2); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 3, bevelEnabled: false, curveSegments: 14 }); g.translate(0, 0, -1.5); add(stone, g, T(PX, 0, AZ, -Math.PI / 2));
    const arch = new THREE.Shape(); arch.moveTo(-5.6, 0); arch.lineTo(-5.6, 8); arch.absarc(0, 8, 5.6, Math.PI, 0, true); arch.lineTo(5.6, 0); arch.lineTo(5, 0); arch.lineTo(5, 8); arch.absarc(0, 8, 5, 0, Math.PI, false); arch.lineTo(-5, 0); arch.closePath();
    const ag = new THREE.ExtrudeGeometry(arch, { depth: 0.4, bevelEnabled: false, curveSegments: 14 }); add(gold, ag, T(PX - 1.5, 0, AZ, -Math.PI / 2));
    add(red, new THREE.BoxGeometry(0.4, 0.6, PW * 2 + 0.2), T(PX - 1.6, 14.1, AZ)); add(gold, new THREE.BoxGeometry(0.3, 0.25, PW * 2 + 0.2), T(PX - 1.6, 20.1, AZ));
    for (const sz of [-1, 1]) { const z = sz * (PW + 1.4); add(plain, new THREE.BoxGeometry(4, 25, 3.2), T(PX, 12.5, z)); add(red, new THREE.BoxGeometry(4.2, 0.6, 3.4), T(PX, 7.25, z)); add(red, new THREE.BoxGeometry(4.2, 0.6, 3.4), T(PX, 20.2, z)); add(gold, new THREE.BoxGeometry(4.4, 0.7, 3.6), T(PX, 25.35, z));
      add(ink, new THREE.CylinderGeometry(0.1, 0.12, 6, 8), T(PX, 28.7, z)); col({ f: [PX - 2, PX + 2, z - 1.6, z + 1.6] }); }
    for (let z = 5.6; z < PW; z += 1.6) for (const s2 of [-1, 1]) col({ c: [PX, s2 * z, 1.6] });
    const word = new THREE.Mesh(new THREE.PlaneGeometry(15, 3.6), new THREE.MeshBasicMaterial({ map: CT(1024, 246, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e6b45a'; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = '#e6b45a'; g.font = '900 190px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ARENA', w / 2, h / 2 + 10); }) }));
    word.position.set(PX - 1.56, 17.4, AZ); word.rotation.y = -Math.PI / 2; root.add(word); }

  // ---------- flood towers (4, on the diagonals) ----------
  const lampT = CT(128, 64, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); for (let y = 0; y < 3; y++) for (let x = 0; x < 6; x++) { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(12 + x * 21, 11 + y * 21, 8, 0, 7); g.fill(); } });
  const lampM = new THREE.MeshBasicMaterial({ map: lampT, color: 0x9a9890 }), heads = [];
  for (const a of [Math.PI / 4, 3 * Math.PI / 4, -Math.PI / 4, -3 * Math.PI / 4]) { const x = AX + Math.cos(a) * (RF + 3), z = AZ + Math.sin(a) * (RF + 3), toC = out(a + Math.PI);
    add(plain, new THREE.BoxGeometry(2.4, 1.4, 2.4), T(x, 0.7, z)); add(ink, new THREE.CylinderGeometry(0.45, 0.9, 34, 10), T(x, 18, z)); for (const y of [12, 24]) add(red, new THREE.CylinderGeometry(0.75, 0.75, 0.5, 10), T(x, y, z));
    add(ink, new THREE.BoxGeometry(5.6, 3.4, 0.5), T(x, 35.4, z, toC, 0.45)); const p = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3), lampM); p.position.set(x + Math.cos(a + Math.PI) * 0.3, 35.4 - 0.1, z + Math.sin(a + Math.PI) * 0.3); p.rotation.set(0, 0, 0); p.quaternion.setFromEuler(E.set(0.45, toC, 0, 'YXZ')); root.add(p);
    add(red, new THREE.SphereGeometry(0.3, 8, 6), T(x, 37.6, z)); col({ c: [x, z, 1.8] }); heads.push(V(x + Math.cos(a + Math.PI) * 0.8, 35, z + Math.sin(a + Math.PI) * 0.8)); }

  // ---------- forecourt: red runner, bronze champions, banner avenue, braziers ----------
  add(red, new THREE.BoxGeometry(32.5, 0.04, 3.2), T(377.2, 0.03, AZ)); for (const sz of [-1, 1]) add(gold, new THREE.BoxGeometry(32.5, 0.05, 0.2), T(377.2, 0.035, AZ + sz * 1.7));
  const champion = (x, z, ry) => { const S = T(x, 2.4, z, ry), b = (mat, g, m) => add(mat, g, S.clone().multiply(m));
    add(plain, new THREE.BoxGeometry(3.8, 2.4, 3.8), T(x, 1.2, z)); add(red, new THREE.BoxGeometry(3.9, 0.35, 3.9), T(x, 1.9, z)); add(gold, new THREE.BoxGeometry(4.1, 0.2, 4.1), T(x, 2.45, z)); col({ f: [x - 2, x + 2, z - 2, z + 2] });
    for (const s of [-1, 1]) { b(bronzeD, new THREE.BoxGeometry(0.85, 2.9, 1.0), T(s * 0.6, 1.45, 0)); b(bronze, new THREE.BoxGeometry(1.0, 0.5, 1.4), T(s * 0.6, 0.25, 0.15)); b(bronze, new THREE.SphereGeometry(0.85, 12, 10), T(s * 1.5, 5.5, 0)); b(bronzeD, new THREE.BoxGeometry(0.62, 2.3, 0.72), T(s * 0.95, 4.35, 0.55, 0, -0.55, s * 0.12)); b(bronze, new THREE.SphereGeometry(0.4, 10, 8), T(s * 0.32, 3.4, 1.3)); }
    b(bronze, new THREE.CylinderGeometry(1.45, 1.1, 2.9, 8), T(0, 4.35, 0)); b(bronzeD, new THREE.BoxGeometry(2.4, 0.5, 1.5), T(0, 3.0, 0)); b(gold, new THREE.CircleGeometry(0.55, 20), T(0, 4.7, 1.3));
    b(bronzeD, new THREE.BoxGeometry(2.9, 4.6, 0.25), T(0, 3.6, -1.0, 0, 0.12)); b(bronze, new THREE.CapsuleGeometry(0.42, 2.2, 4, 8), T(0.6, 1.3, -1.5, 0, 1.0, 0.4));
    b(bronze, new THREE.SphereGeometry(0.92, 14, 12), T(0, 6.5, 0.05)); b(bronze, new THREE.ConeGeometry(0.46, 1.15, 10), T(0, 6.3, 0.95, 0, Math.PI / 2)); b(bronzeD, new THREE.SphereGeometry(0.13, 8, 6), T(0, 6.3, 1.5));
    for (const s of [-1, 1]) b(bronze, new THREE.ConeGeometry(0.36, 1.05, 8), T(s * 0.52, 7.5, -0.05, 0, 0, -s * 0.2));
    b(iron, new THREE.BoxGeometry(0.34, 3.4, 0.12), T(0, 1.7, 1.45)); b(gold, new THREE.BoxGeometry(1.7, 0.22, 0.3), T(0, 3.45, 1.4)); b(gold, new THREE.CylinderGeometry(0.11, 0.11, 0.55, 8), T(0, 3.75, 1.4)); b(gold, new THREE.SphereGeometry(0.17, 8, 6), T(0, 4.1, 1.4)); };
  for (const sz of [-1, 1]) champion(370.5, AZ + sz * 9.2, -Math.PI / 2);
  // banners: 8 on the avenue masts, 2 tall ones down the pylons (instanced, sway in the shader)
  const banT = CT(128, 384, (g, w, h) => { g.fillStyle = '#ec3013'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h); g.lineTo(w / 2, h - 46); g.lineTo(0, h); g.closePath(); g.fill(); g.fillStyle = '#e6b45a'; g.fillRect(0, 0, w, 14); g.fillRect(8, 22, 6, h - 80); g.fillRect(w - 14, 22, 6, h - 80);
    g.beginPath(); g.arc(w / 2, 150, 44, 0, 7); g.fill(); g.fillStyle = '#1b2350'; g.beginPath(); g.arc(w / 2, 150, 36, 0, 7); g.fill(); g.fillStyle = '#f3f2f2'; g.font = '900 50px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', w / 2, 154); });
  const uT = { value: 0 }, sway = (mat, body) => { mat.onBeforeCompile = sh => { sh.uniforms.uT = uT; sh.vertexShader = 'uniform float uT; attribute float aPh;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' + body); }; return mat; };
  const banM = sway(new THREE.MeshLambertMaterial({ map: banT, side: THREE.DoubleSide, transparent: true, alphaTest: 0.5 }), 'float k = clamp((0.5 - position.y) , 0.0, 1.0); transformed.z += sin(uT * 1.7 + aPh + position.y * 1.4) * k * 0.28;');
  const BAN = []; for (const sz of [-1, 1]) for (const x of [362.5, 366.5]) BAN.push([x, 6.2, sz * 13, sz < 0 ? 0 : Math.PI, 1, 6]);
  for (const sz of [-1, 1]) for (const x of [374.5]) BAN.push([x, 6.2, sz * 13, sz < 0 ? 0 : Math.PI, 1, 6]);
  for (const sz of [-1, 1]) BAN.push([PX - 2.75, 12.6, sz * (PW + 1.4), -Math.PI / 2, 1, 15]);
  { const g = new THREE.PlaneGeometry(1.9, 1, 1, 8); const ph = new Float32Array(BAN.length); const im = new THREE.InstancedMesh(g, banM, BAN.length);
    BAN.forEach(([x, y, z, ry, , h], i) => { im.setMatrixAt(i, T(x, y, z, ry, 0, 0, V(h > 8 ? 2.4 : 1.9, h, 1).divide(V(1.9, 1, 1)))); ph[i] = i * 1.7; }); g.setAttribute('aPh', new THREE.InstancedBufferAttribute(ph, 1)); root.add(im);
    for (const [x, y, z, , , h] of BAN) if (h > 8) { add(gold, new THREE.BoxGeometry(1.0, 0.16, 0.16), T(x + 0.5, y + h / 2 + 0.1, z)); add(gold, new THREE.BoxGeometry(0.12, 0.12, 2.6), T(x, y + h / 2 + 0.1, z)); }
    for (const [x, y, z, , , h] of BAN) if (h < 8) { add(ink, new THREE.CylinderGeometry(0.12, 0.16, 10.4, 8), T(x, 5.2, z)); add(gold, new THREE.BoxGeometry(0.12, 0.12, 2.4), T(x, 9.35, z, Math.PI / 2)); add(gold, new THREE.SphereGeometry(0.22, 8, 6), T(x, 10.5, z)); col({ c: [x, z, 0.3] }); } }
  // braziers
  const flames = [], flameM = new THREE.MeshBasicMaterial({ color: 0xff8a1a }), flameM2 = new THREE.MeshBasicMaterial({ color: 0xffd23a });
  const BRZ = [[364.5, -4.6], [364.5, 4.6], [376, -6.4], [376, 6.4]];
  for (const [x, z] of BRZ) { add(plain, new THREE.BoxGeometry(1.1, 1.2, 1.1), T(x, 0.6, z)); add(red, new THREE.BoxGeometry(1.16, 0.2, 1.16), T(x, 1.1, z)); add(iron, new THREE.CylinderGeometry(0.75, 0.42, 0.55, 12), T(x, 1.48, z)); col({ c: [x, z, 0.75] });
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.3, 8), flameM); f.position.set(x, 2.3, z); const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.8, 7), flameM2); f2.position.set(x, 2.1, z); root.add(f, f2); flames.push(f, f2); }

  // ---------- flags on the parapet (instanced, wave in the shader) ----------
  const flagCols = ['#ec3013', '#e6b45a', '#f2f0ea', '#1b2350'].map(c => new THREE.Color(c)), FL = [];
  for (let k = 0; k < N; k++) { const a = k * STEP; if (dA(a, Math.PI) < PG + 0.02) continue; FL.push([AX + Math.cos(a) * (RF + 0.4), AZ + Math.sin(a) * (RF + 0.4)]); }
  for (const sz of [-1, 1]) FL.push([PX, sz * (PW + 1.4), 1]);
  const flagG = new THREE.PlaneGeometry(1.9, 1.1, 6, 1); flagG.translate(0.95, 0, 0);
  const flagM = sway(new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), 'transformed.z += sin(uT * 4.2 + position.x * 2.3 + aPh) * position.x * 0.17; transformed.y -= position.x * 0.06;');
  const flags = new THREE.InstancedMesh(flagG, flagM, FL.length); { const ph = new Float32Array(FL.length);
    FL.forEach(([x, z, big], i) => { const top = big ? 31 : 23.2; flags.setMatrixAt(i, T(x, top, z, 0.5, 0, 0, big ? 2.2 : 1)); flags.setColorAt(i, flagCols[i % 4]); ph[i] = i * 0.9; if (!big) add(ink, new THREE.CylinderGeometry(0.06, 0.08, 3.6, 6), T(x, 21.8, z)); });
    flagG.setAttribute('aPh', new THREE.InstancedBufferAttribute(ph, 1)); root.add(flags); }

  // ---------- the crowd (instanced, bobbing in the shader; skips the tunnel + the royal box) ----------
  const CR = []; const gapS = touch ? 1.05 : 0.72;
  for (let i = 0; i < TIERS; i++) { const r = T0 + i * TW + TW * 0.55, y = Y0 + i * TH, n = Math.floor(Math.PI * 2 * r / gapS); for (let k = 0; k < n; k++) { const a = (k + (Math.random() - 0.5) * 0.4) / n * Math.PI * 2; if (dA(a, Math.PI) < SG + 0.06 || (dA(a, 0) < 0.3 && i < 6)) continue; if (Math.random() < 0.08) continue; CR.push([AX + Math.cos(a) * r, y, AZ + Math.sin(a) * r, out(a + Math.PI)]); } }
  const shirts = ['#c42d3c', '#f2f0ea', '#38bdf8', '#e6b45a', '#7c3aed', '#1e3a8a', '#ea580c', '#4ade80'].map(c => new THREE.Color(c));
  const bob = 'transformed.y += max(0.0, sin(uT * 7.0 + aPh)) * 0.16 * step(0.55, fract(aPh * 0.37));';
  const headG = (() => { const parts = [new THREE.SphereGeometry(0.25, 7, 5).toNonIndexed(), new THREE.ConeGeometry(0.09, 0.24, 4).toNonIndexed().translate(-0.13, 0.26, 0), new THREE.ConeGeometry(0.09, 0.24, 4).toNonIndexed().translate(0.13, 0.26, 0), new THREE.ConeGeometry(0.09, 0.26, 6).toNonIndexed().rotateX(Math.PI / 2).translate(0, -0.04, 0.26)]; return merge(parts); })();
  const bodyM = sway(toon('#ffffff'), bob), headM = sway(toon('#f07a2a'), bob);
  const cBody = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.24, 0.4, 2, 6), bodyM, CR.length), cHead = new THREE.InstancedMesh(headG, headM, CR.length);
  { const ph = new Float32Array(CR.length); CR.forEach(([x, y, z, ry], i) => { cBody.setMatrixAt(i, T(x, y + 0.5, z, ry)); cHead.setMatrixAt(i, T(x, y + 1.05, z, ry)); cBody.setColorAt(i, shirts[(Math.random() * shirts.length) | 0]); ph[i] = Math.random() * 40; });
    cBody.geometry.setAttribute('aPh', new THREE.InstancedBufferAttribute(ph, 1)); cHead.geometry.setAttribute('aPh', new THREE.InstancedBufferAttribute(ph, 1)); root.add(cBody, cHead); }

  // ---------- bake the static bins ----------
  for (const [mat, list] of bins) root.add(shadowy(new THREE.Mesh(merge(list), mat)));

  // ---------- night: arcade lamps, brazier glows, flood beams, bowl glow ----------
  const glowT = CT(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,225,170,1)'); r.addColorStop(1, 'rgba(255,225,170,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const night = new THREE.Group(); night.visible = false; root.add(night);
  { const pts = []; for (const a of bays) { pts.push(AX + Math.cos(a) * (RF - 0.3), 4.6, AZ + Math.sin(a) * (RF - 0.3)); pts.push(AX + Math.cos(a) * (RF - 0.3), 10.6, AZ + Math.sin(a) * (RF - 0.3)); }
    for (const [x, z] of BRZ) pts.push(x, 2.4, z);
    night.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)), new THREE.PointsMaterial({ map: glowT, size: 4.5, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
    const heady = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(heads.flatMap(h => [h.x, h.y, h.z]), 3)), new THREE.PointsMaterial({ map: glowT, size: 16, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xfff4d8 })); night.add(heady);
    const beamA = CT(4, 64, (g, w, h) => { const r = g.createLinearGradient(0, 0, 0, h); r.addColorStop(0, '#000'); r.addColorStop(0.7, '#555'); r.addColorStop(1, '#fff'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
    const beamM = new THREE.MeshBasicMaterial({ color: 0xfff1cc, alphaMap: beamA, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    for (const h of heads) { const tgt = V(AX + (h.x - AX) * 0.12, 0, AZ + (h.z - AZ) * 0.12), d = tgt.clone().sub(h), len = d.length(); const g = new THREE.ConeGeometry(7, len, 20, 1, true); g.translate(0, -len / 2, 0); const m = new THREE.Mesh(g, beamM); m.position.copy(h); m.quaternion.setFromUnitVectors(V(0, -1, 0), d.normalize()); night.add(m); }
    const bowl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xffd9a0, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })); bowl.position.set(AX, 14, AZ); bowl.scale.set(80, 34, 1); night.add(bowl); }

  const covers = (x, z) => (x >= 358 && x <= 388 && Math.abs(z - AZ) <= 16) || Math.hypot(x - AX, z - AZ) < RF + 4;
  const spots = [{ key: 'arenaEnter', x: AX - 23.4, z: AZ, r: 3.2, prompt: 'ENTER \u00b7 MERU ARENA' }];
  const detail = [cBody, cHead, flags]; let far = null, lit = false;
  return { root, colliders, covers, spots, stats: { crowd: CR.length, flags: FL.length },
    setNight(on) { lit = on; night.visible = on; lampM.color.set(on ? 0xffffff : 0x9a9890); sandM.emissive.set(on ? 0x2a2440 : 0x000000); },
    tick(dt, now, cam) { uT.value = now / 1000; const f = Math.hypot(cam.x - AX, cam.z - AZ) > (touch ? 120 : 200); if (f !== far) { far = f; for (const m of detail) m.visible = !f; }
      if (!f) for (let i = 0; i < flames.length; i++) { const k = 1 + Math.sin(now / 80 + i * 1.9) * 0.14 + Math.sin(now / 37 + i) * 0.06; flames[i].scale.set(1 / k, k, 1 / k); } } };
}
