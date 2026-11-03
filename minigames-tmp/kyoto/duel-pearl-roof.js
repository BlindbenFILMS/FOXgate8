// 8 GATES — PEARL SAIL · THE ROOF at sunset, looking down on Meru (duel stage STG.pearlRoof, only built when opts.pearl is set).
// Side-on lane x ∈ [−XMAX, XMAX] at z = 0. Behind the fighters: the parapet + glass rail (z ≈ −2.7), the window-cleaning ROOF CAR on its rail
// with the GONDOLA hanging over the edge (it follows SUDS-9 along the edge; he docks against it and falls with it), and Meru far below.
// Left end: the stair housing (the ROOF door Ben came out of). Right end: the PEARL SAIL sail mast. Phone-light: one instanced mesh for the city.
export function buildPearlRoof({ THREE, M, toon, canvasTex, glowTex, grad, touch, XMAX, rr }) {
  const g = new THREE.Group(); g.visible = false;
  const Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d), V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const W = toon('#eef0f2'), WD = toon('#c9ced3'), R = toon('#ec3013'), Y = toon('#ffd23a'), D = toon('#201e1d'), GR = toon('#56636e'), ST = toon('#9aa3ad'), GO = toon('#e6b45a', { emissive: 0x5a3e10, emissiveIntensity: 0.3 });
  const EDGE = -2.75;
  // ---- deck: pale roof membrane with seams, the helipad under the fighters, hazard stripes along the back edge ----
  { const t = canvasTex(256, 256, c => { c.fillStyle = '#d9dcdf'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 1400; i++) { c.fillStyle = i % 2 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)'; c.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); } c.fillStyle = 'rgba(60,70,80,0.22)'; for (let x = 0; x < 256; x += 64) c.fillRect(x, 0, 3, 256); for (let y = 0; y < 256; y += 128) c.fillRect(0, y, 256, 3); });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(9, 4); const fl = new THREE.Mesh(new THREE.PlaneGeometry(34, 16), new THREE.MeshToonMaterial({ map: t, gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, EDGE + 8); fl.receiveShadow = true; g.add(fl);
    const hp = canvasTex(512, 512, c => { c.fillStyle = '#2c3036'; c.fillRect(0, 0, 512, 512); c.strokeStyle = '#ffd23a'; c.lineWidth = 22; c.beginPath(); c.arc(256, 256, 200, 0, 7); c.stroke(); c.fillStyle = '#f3f2f2'; const H = (x, y, w, h) => c.fillRect(x, y, w, h); H(176, 150, 44, 212); H(292, 150, 44, 212); H(176, 234, 160, 44); c.strokeStyle = '#ec3013'; c.lineWidth = 6; c.strokeRect(14, 14, 484, 484); });
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 4.6), new THREE.MeshToonMaterial({ map: hp, gradientMap: grad })); pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.006, -0.05); pad.receiveShadow = true; pad.scale.set(1, 1, 1); g.add(pad);
    const hz = canvasTex(256, 32, c => { for (let i = -2; i < 18; i++) { c.fillStyle = i % 2 ? '#201e1d' : '#ffd23a'; c.beginPath(); c.moveTo(i * 16, 32); c.lineTo(i * 16 + 16, 0); c.lineTo(i * 16 + 32, 0); c.lineTo(i * 16 + 16, 32); c.fill(); } }); hz.wrapS = THREE.RepeatWrapping; hz.repeat.set(10, 1);
    const st = new THREE.Mesh(new THREE.PlaneGeometry(34, 0.45), new THREE.MeshBasicMaterial({ map: hz })); st.rotation.x = -Math.PI / 2; st.position.set(0, 0.008, EDGE + 0.42); g.add(st);
    const rl = new THREE.Mesh(new THREE.PlaneGeometry(34, 0.12), new THREE.MeshBasicMaterial({ color: 0xec3013 })); rl.rotation.x = -Math.PI / 2; rl.position.set(0, 0.009, EDGE + 0.12); g.add(rl);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, x = Math.cos(a) * 3.9, z = -0.05 + Math.sin(a) * 2.05; const l = new THREE.Mesh(new THREE.CircleGeometry(0.07, 10), new THREE.MeshBasicMaterial({ color: 0xff5a3a })); l.rotation.x = -Math.PI / 2; l.position.set(x, 0.012, z); g.add(l); } }
  // ---- parapet (white, red cap) + glass rail with steel posts; front lip far in front of the camera ----
  M(Bx(34, 0.55, 0.32), W, 0, 0.275, EDGE - 0.16, g, 0.015); M(Bx(34, 0.08, 0.36), R, 0, 0.58, EDGE - 0.16, g, 0);
  { const glass = new THREE.Mesh(new THREE.PlaneGeometry(34, 0.85), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide })); glass.position.set(0, 1.04, EDGE - 0.16); g.add(glass);
    M(Bx(34, 0.05, 0.06), ST, 0, 1.47, EDGE - 0.16, g, 0); for (let x = -16; x <= 16; x += 2) M(Bx(0.05, 0.9, 0.05), ST, x, 1.03, EDGE - 0.16, g, 0); }
  // the Pearl Sail's own glass facade dropping away under the edge (seen in SUDS-9's fall shot)
  { const ft = canvasTex(128, 128, c => { const gg = c.createLinearGradient(0, 0, 128, 128); gg.addColorStop(0, '#8fb6d0'); gg.addColorStop(0.5, '#f2b59a'); gg.addColorStop(1, '#5d7d9a'); c.fillStyle = gg; c.fillRect(0, 0, 128, 128); c.fillStyle = '#eef0f2'; c.fillRect(0, 0, 128, 7); c.fillRect(0, 0, 5, 128); c.fillRect(64, 0, 3, 128); c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(10, 120); c.lineTo(50, 10); c.lineTo(62, 10); c.lineTo(22, 120); c.fill(); }); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(10, 30);
    const fa = new THREE.Mesh(new THREE.PlaneGeometry(40, 120), new THREE.MeshBasicMaterial({ map: ft, side: THREE.DoubleSide })); fa.position.set(0, -60.02, EDGE - 0.33); g.add(fa); }
  // roof-car rail along the edge (the gondola rig rides on it)
  M(Bx(30, 0.08, 0.1), D, 0, 0.04, EDGE + 0.85, g, 0); M(Bx(30, 0.08, 0.1), D, 0, 0.04, EDGE + 1.25, g, 0);
  // ---- left end: stair housing with the ROOF door, sign, vents ----
  { const h = new THREE.Group(); h.position.set(-XMAX - 2.1, 0, -0.6); g.add(h); M(Bx(3.4, 3.1, 4.4), W, 0, 1.55, 0, h, 0.03); M(Bx(3.6, 0.22, 4.6), GR, 0, 3.2, 0, h, 0.02); M(Bx(3.42, 0.14, 4.42), R, 0, 2.95, 0, h, 0);
    M(Bx(0.08, 2.2, 1.2), toon('#3a3f48'), 1.72, 1.1, 0.4, h, 0.012); M(Bx(0.1, 0.12, 1.36), Y, 1.73, 2.26, 0.4, h, 0); M(Bx(0.06, 0.06, 0.25), ST, 1.78, 1.1, 0.85, h, 0);
    const sg = canvasTex(256, 64, c => { c.fillStyle = '#ec3013'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#fff'; c.font = '900 40px Archivo, Arial Black, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ROOF · R', 128, 34); });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.28), new THREE.MeshBasicMaterial({ map: sg })); s.position.set(1.76, 2.6, 0.4); s.rotation.y = Math.PI / 2; h.add(s);
    const lg = canvasTex(512, 128, c => { c.fillStyle = '#f3f2f2'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#ec3013'; c.fillRect(0, 108, 512, 20); c.fillStyle = '#201e1d'; c.font = '900 72px Archivo, Arial Black, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PEARL SAIL', 256, 58); });
    const lp = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), new THREE.MeshBasicMaterial({ map: lg })); lp.position.set(0, 2.3, 2.21); h.add(lp);
    for (let i = 0; i < 2; i++) { M(Bx(1.3, 0.9, 1.3), WD, -0.4, 3.75 + 0.001 * i, -1 + i * 1.6, h, 0.015); M(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 16), D, -0.4, 4.22, -1 + i * 1.6, h, 0); } }
  // HVAC units + a dish out on the corners (frame the lane on wide screens)
  for (const [x, z] of [[-XMAX - 1.6, 3.2], [XMAX + 2.6, 2.6]]) { M(Bx(1.8, 1.1, 1.3), WD, x, 0.55, z, g, 0.02); for (let i = 0; i < 2; i++) { M(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 16), D, x - 0.42 + i * 0.84, 1.13, z, g, 0); } }
  // ---- right end: the PEARL SAIL sail mast with the pearl on top + two pennants in the wind ----
  const flags = [];
  { const m = new THREE.Group(); m.position.set(XMAX + 2.4, 0, -1.2); g.add(m); M(Bx(1.6, 0.5, 1.6), W, 0, 0.25, 0, m, 0.02); M(Bx(1.64, 0.08, 1.64), R, 0, 0.5, 0, m, 0); M(new THREE.CylinderGeometry(0.09, 0.14, 11, 10), ST, 0, 5.8, 0, m, 0.01);
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(-2.8, 3.5, -0.05, 9.5); sh.lineTo(0, 9.5); sh.lineTo(0, 0);
    const sail = new THREE.Mesh(new THREE.ShapeGeometry(sh, 12), new THREE.MeshToonMaterial({ color: 0xf6f3ee, gradientMap: grad, side: THREE.DoubleSide, emissive: 0x3a2a24, emissiveIntensity: 0.25 })); sail.position.set(-0.05, 0.9, 0); sail.rotation.y = 0.3; m.add(sail);
    const sh2 = new THREE.Shape(); sh2.moveTo(0, 0); sh2.lineTo(0, 0.5); sh2.quadraticCurveTo(-1.3, 0.5, -1.6, 0); sh2.lineTo(0, 0); const red = new THREE.Mesh(new THREE.ShapeGeometry(sh2, 8), new THREE.MeshBasicMaterial({ color: 0xec3013, side: THREE.DoubleSide })); red.position.set(-0.06, 1.0, 0.002); red.rotation.y = 0.3; m.add(red);
    const pearl = M(new THREE.SphereGeometry(0.42, 20, 14), new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad, emissive: 0xffe8d0, emissiveIntensity: 0.5 }), 0, 11.6, 0, m, 0.012, 0.42);
    const pg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff1d8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 })); pg.position.copy(pearl.position); pg.scale.setScalar(2.8); m.add(pg);
    for (const [y, c] of [[10.6, 0xec3013], [9.9, 0xffd23a]]) { const fp = new THREE.Group(); fp.position.set(0, y, 0); m.add(fp); const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.42, 6, 1), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); fl.position.x = 0.75; fp.add(fl); flags.push({ fp, fl, base: fl.geometry.attributes.position.array.slice() }); } }
  // ---- the gondola rig: roof car on the rail + jib over the edge + two cables + the gondola (grey deck, rails, yellow-black skirt) ----
  const rig = new THREE.Group(); g.add(rig); const car = new THREE.Group(); rig.add(car); const gond = new THREE.Group(); rig.add(gond);
  { M(Bx(2.2, 0.7, 0.8), toon('#6b737b'), 0, 0.45, EDGE + 1.05, car, 0.02); M(Bx(2.22, 0.12, 0.82), Y, 0, 0.68, EDGE + 1.05, car, 0); for (const x of [-0.95, 0.95]) for (const z of [EDGE + 0.85, EDGE + 1.25]) { const w = M(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 12), D, x, 0.13, z, car, 0.006); w.rotation.x = Math.PI / 2; }
    M(Bx(0.28, 3.6, 0.28), GR, 0, 2.7, EDGE + 1.05, car, 0.015); M(Bx(0.22, 0.24, 2.9), GR, 0, 4.4, EDGE - 0.25, car, 0.015); M(Bx(0.12, 0.12, 1.9), Y, 0, 4.56, EDGE - 0.2, car, 0);
    const st2 = M(Bx(0.08, 0.08, 2.2), D, 0, 3.5, EDGE + 0.35, car, 0); st2.rotation.x = -0.75; M(Bx(0.5, 0.2, 0.3), D, 0, 4.3, EDGE - 1.6, car, 0.01); M(Bx(2.5, 0.08, 0.08), D, 0, 4.18, EDGE - 1.6, car, 0); }
  const GZ = EDGE - 1.6, GW = 3.0;
  { M(Bx(GW, 0.2, 1.2), toon('#8a9099'), 0, -0.1, GZ, gond, 0.025); for (const z of [GZ - 0.58, GZ + 0.58]) M(Bx(GW, 0.07, 0.07), D, 0, 1.0, z, gond, 0); for (const x of [-GW / 2 + 0.04, GW / 2 - 0.04]) for (const z of [GZ - 0.58, GZ + 0.58]) M(Bx(0.07, 1.05, 0.07), D, x, 0.48, z, gond, 0);
    for (let i = 0; i < 6; i++) M(Bx(GW / 6, 0.26, 0.03), toon(i % 2 ? '#201e1d' : '#ffd23a'), -GW / 2 + GW / 12 + i * GW / 6, -0.1, GZ + 0.62, gond, 0);
    M(Bx(0.5, 0.42, 0.4), toon('#2e7fb8'), -1.0, 0.21, GZ - 0.2, gond, 0.012); M(Bx(0.36, 0.26, 0.36), WD, 1.05, 0.13, GZ, gond, 0.012); }
  const cabM = new THREE.MeshBasicMaterial({ color: 0x201e1d }), cables = [-1.2, 1.2].map(dx => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 5), cabM); c.position.set(dx, 0, GZ); rig.add(c); return c; });
  // set(x, gondola y, tilt, z shift, cables snapped): SUDS-9 drives it (it follows him along the edge, rises in the intro, falls with him)
  const RG = { x: XMAX - 1.6, x0: -XMAX + 1.6, x1: XMAX - 0.6, grp: rig, gz: GZ, sway: 0,
    set(x, gy, tilt, gz, snapped) { rig.position.x = x; gond.position.y = gy; gond.rotation.z = tilt + RG.sway; gond.position.z = gz;
      for (const c of cables) { const top = 4.18, bot = gy + 1.0; c.visible = !snapped; c.position.y = (top + bot) / 2; c.scale.y = Math.max(0.05, top - bot); } } };
  // ---- MERU, far below: instanced towers (Meru 2 colours, lit windows at dusk), a few landmarks, the Pearl Quarter river + the sea ----
  { const fill = new THREE.DirectionalLight(0xffe2d2, 0.55); fill.position.set(3, 4, 12); g.add(fill); g.add(fill.target); }   // soft fill from the camera side so the dark-grey robot reads
  const city = new THREE.Group(); g.add(city); const BASE = -78;
  { const wt = canvasTex(64, 128, c => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 64, 128); for (let y = 6; y < 128; y += 10) for (let x = 5; x < 64; x += 10) { const lit = Math.random() < 0.38; c.fillStyle = lit ? (Math.random() < 0.5 ? '#ffd28a' : '#ffb35a') : 'rgba(30,36,48,0.55)'; c.fillRect(x, y, 6, 6); } }); wt.wrapS = wt.wrapT = THREE.RepeatWrapping;
    const N = touch ? 90 : 170, geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0); const mat = new THREE.MeshLambertMaterial({ map: wt }), im = new THREE.InstancedMesh(geo, mat, N), m4 = new THREE.Matrix4(), col = new THREE.Color();
    const PAL = ['#43525e', '#4f5c66', '#56636e', '#6b737b', '#2e4a6b', '#9b4b37', '#b0623f', '#b9a27e', '#ece6d8', '#c94c3a', '#2a2236', '#a99579'];
    // every rooftop sits BELOW eye level (the Pearl Sail is the tallest tower): tops just above the parapet sight line, so Meru reads as far below
    for (let i = 0; i < N; i++) { const z = -45 - Math.pow(Math.random(), 0.75) * 420, x = rr(-300, 300) * (0.35 + (-z) / 420), w = rr(10, 26), d = rr(10, 26), line = 1.9 - 0.115 * (9 - z), top = Math.min(-9, line + rr(-4, 9) + (Math.random() < 0.1 ? 6 : 0)), h = Math.max(6, top - BASE);
      m4.makeScale(w, h, d); m4.setPosition(x, BASE, z); im.setMatrixAt(i, m4); col.set(PAL[i % PAL.length]); im.setColorAt(i, col); }
    city.add(im);
    const gr = new THREE.Mesh(new THREE.PlaneGeometry(1400, 900), new THREE.MeshLambertMaterial({ color: 0x5a6250 })); gr.rotation.x = -Math.PI / 2; gr.position.set(0, BASE, -380); city.add(gr);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(4000, 2600), new THREE.MeshBasicMaterial({ color: 0x3c6688 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, BASE + 0.2, -2100); city.add(sea);
    const riv = new THREE.Mesh(new THREE.PlaneGeometry(26, 900), new THREE.MeshBasicMaterial({ color: 0x4a7aa0 })); riv.rotation.x = -Math.PI / 2; riv.rotation.z = 0.35; riv.position.set(60, BASE + 0.3, -420); city.add(riv);
    // landmarks: Lake tower (crown), Crest tower, the casino (purple, pink neon), the bank (cream columns), Meru castle on its hill, the arena ring
    const LM = (x, z, w, h, d, c, crown) => { const b = M(Bx(w, h, d), new THREE.MeshLambertMaterial({ color: c, map: wt }), x, BASE + h / 2, z, city, 0); if (crown) { M(Bx(w * 0.7, 6, d * 0.7), toon('#2c3036'), x, BASE + h + 3, z, city, 0); M(new THREE.CylinderGeometry(0.4, 0.4, 14, 6), toon('#ffd23a'), x, BASE + h + 13, z, city, 0); } return b; };
    LM(-90, -190, 26, 52, 24, 0x43525e, true); LM(60, -240, 24, 44, 22, 0x4f5c66, true); LM(-30, -150, 34, 52, 28, 0x2a2236);
    { const n = M(Bx(34.5, 1.6, 28.5), new THREE.MeshBasicMaterial({ color: 0xff4fd8 }), -30, BASE + 48, -150, city, 0); }
    LM(120, -170, 30, 50, 28, 0xece6d8); for (let i = 0; i < 6; i++) M(new THREE.CylinderGeometry(1.2, 1.2, 36, 8), toon('#f6f1e4'), 107 + i * 5.2, BASE + 18, -155, city, 0);
    { const hill = M(new THREE.SphereGeometry(70, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x55603f }), 190, BASE - 6, -300, city, 0); hill.scale.set(1, 0.5, 0.8);
      const kp = new THREE.Group(); kp.position.set(190, BASE + 28, -300); city.add(kp); M(Bx(26, 16, 20), new THREE.MeshLambertMaterial({ color: 0xb9a27e }), 0, 8, 0, kp, 0); M(Bx(18, 12, 14), new THREE.MeshLambertMaterial({ color: 0xece6d8 }), 0, 22, 0, kp, 0); M(new THREE.ConeGeometry(12, 9, 4), new THREE.MeshLambertMaterial({ color: 0x2e4a6b }), 0, 32, 0, kp, 0).rotation.y = Math.PI / 4;
      for (const s of [-1, 1]) { M(new THREE.CylinderGeometry(4, 4, 30, 10), new THREE.MeshLambertMaterial({ color: 0xa99579 }), s * 15, 15, 0, kp, 0); M(new THREE.ConeGeometry(5, 8, 10), new THREE.MeshLambertMaterial({ color: 0x2e4a6b }), s * 15, 34, 0, kp, 0); } }
    { const ar = new THREE.Mesh(new THREE.TorusGeometry(28, 7, 6, 28), new THREE.MeshLambertMaterial({ color: 0xc9ced3 })); ar.rotation.x = Math.PI / 2; ar.scale.set(1.3, 1, 1); ar.position.set(-170, BASE + 6, -240); city.add(ar); } }
  // ---- sky dressing: the low sun over the sea, its path on the water, a few warm clouds, drifting soap bubbles off the gondola ----
  { const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffc070, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 1, fog: false })); sun.position.set(-260, 30, -900); sun.scale.setScalar(260); g.add(sun);
    const core = new THREE.Mesh(new THREE.CircleGeometry(16, 32), new THREE.MeshBasicMaterial({ color: 0xfff0c8, fog: false })); core.position.set(-260, 26, -905); g.add(core);
    const path = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffa050, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55, fog: false })); path.position.set(-230, BASE + 4, -800); path.scale.set(120, 26, 1); g.add(path);
    const cl = canvasTex(128, 64, c => { const gg = c.createRadialGradient(64, 36, 4, 64, 36, 60); gg.addColorStop(0, 'rgba(255,214,190,0.95)'); gg.addColorStop(1, 'rgba(255,214,190,0)'); c.fillStyle = gg; c.beginPath(); c.ellipse(64, 34, 62, 26, 0, 0, 7); c.fill(); });
    for (let i = 0; i < 9; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cl, transparent: true, depthWrite: false, fog: false, opacity: 0.55 + Math.random() * 0.3, color: i % 3 ? 0xffc8b0 : 0xf2a0a8 })); s.position.set(rr(-500, 500), rr(60, 190), rr(-950, -700)); s.scale.set(rr(160, 320), rr(26, 50), 1); g.add(s); } }
  const bubM = new THREE.SpriteMaterial({ map: canvasTex(32, 32, c => { c.strokeStyle = 'rgba(230,250,255,0.9)'; c.lineWidth = 2; c.beginPath(); c.arc(16, 16, 13, 0, 7); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.arc(11, 11, 3, 0, 7); c.fill(); }), transparent: true, depthWrite: false });
  const motes = Array.from({ length: touch ? 8 : 16 }, () => { const s = new THREE.Sprite(bubM); s.scale.setScalar(rr(0.12, 0.3)); s.userData = { ph: Math.random() * 7, v: rr(0.3, 0.7) }; s.position.set(rr(-8, 8), rr(0, 5), rr(-4, 1)); g.add(s); return s; });
  function tick(dt, t, wind = 1) {
    for (const F of flags) { const p = F.fl.geometry.attributes.position, a = p.array; for (let i = 0; i < p.count; i++) { const x0 = F.base[i * 3] + 0.75; a[i * 3 + 2] = Math.sin(t * 7 * wind - x0 * 3) * 0.12 * x0; } p.needsUpdate = true; F.fp.rotation.y = 0.3 + Math.sin(t * 0.7) * 0.25; }
    for (const s of motes) { const u = s.userData; u.ph += dt; s.position.y += dt * u.v * 0.6; s.position.x += dt * (0.8 * wind + Math.sin(u.ph) * 0.3); if (s.position.y > 6 || s.position.x > 12) { s.position.set(rr(-10, 6), rr(-0.5, 0.5), rr(-4, 0.5)); } }
    RG.sway = Math.sin(t * 1.1) * 0.025 * wind; }
  return { g, rig: RG, tick, entry: { name: 'PEARL ROOF', sub: 'SUNSET', fog: [0xf0aa86, 24, 420], sun: [0xffa860, 1.65, -9, 5.5, 5], hemi: [0xffd6c0, 0x6a5878, 1.1], fx: 'pearl', far: 1400,
    sky: [[0, '#2b2356'], [0.38, '#8c3f78'], [0.66, '#e8725a'], [0.86, '#f6a65a'], [1, '#ffd49a']] } };
}
