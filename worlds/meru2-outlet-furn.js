// MERU 2.0 — s153 OUTLETS STORE 5: FURNITURE (unit 5, south side; worlds/meru2-outlets.js runs the fight). A ransacked showroom maze.
// Cover (all breakable): 2 SOFAS by the door (cushions fly, sofa tips back), 2 TALL WARDROBES (doors creak; broken = doors fly open + it leans),
// a STACK OF MATTRESSES mid-floor (soft: lots of HP; top ones slide off), the fake KITCHEN island + the fake BEDROOM bed, 2 wallpaper PARTITIONS.
// Decor you can shoot: 3 CHANDELIERS (crash down, glass sparkle) + 3 FLOOR LAMPS (topple). Lieutenant: LAMPSHADE LOU (lampshade hat, robe), key 4 of 4.
export function buildFurn({ THREE, M, toon, scene, b, touch }) {
  const [x0, x1, z0, z1] = b.f, dir = b.face === 'N' ? 1 : -1, ZF = b.face === 'N' ? z0 : z1, cx = (x0 + x1) / 2, H = (b.sty && b.sty.h) || 7, DEP = Math.abs(z1 - z0);
  const W = (a, d) => [cx + a, ZF + dir * d];
  const root = new THREE.Group(); root.name = 'outletFurn'; scene.add(root);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const T = h => toon(h), MT = { ink: T('#201e1d'), steel: T('#8a9096'), dark: T('#3d3b3a'), wood: T('#8b6a48'), oak: T('#b58a5c'), cream: T('#e9e3d6'), white: T('#f3f2f2'), red: T('#c8262c'), yellow: T('#ffd23a'), blue: T('#2e5f8a'), green: T('#3f7a52'), mustard: T('#c9952a'), plum: T('#6a3a5a'), gold: T('#d9b24a'), tile: T('#d8d2c6') };
  const ry0 = dir > 0 ? 0 : Math.PI;
  // floor: showroom parquet, scuffed + footprints
  { const t = CT(256, 256, (g, w, h) => { g.fillStyle = '#9a7650'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? 'rgba(255,240,220,0.07)' : 'rgba(40,24,10,0.1)'; g.fillRect(i * 32, j * 32, 32, 32); g.strokeStyle = 'rgba(30,18,8,0.3)'; g.strokeRect(i * 32, j * 32, 32, 32); for (let k = 1; k < 4; k++) { g.beginPath(); if ((i + j) % 2) { g.moveTo(i * 32 + k * 8, j * 32); g.lineTo(i * 32 + k * 8, j * 32 + 32); } else { g.moveTo(i * 32, j * 32 + k * 8); g.lineTo(i * 32 + 32, j * 32 + k * 8); } g.stroke(); } }
      for (let i = 0; i < 600; i++) { g.fillStyle = Math.random() < 0.6 ? 'rgba(30,20,10,0.12)' : 'rgba(255,248,236,0.06)'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 2); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); const fl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 - 0.8, DEP - 0.8), new THREE.MeshLambertMaterial({ map: t })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0.035, (z0 + z1) / 2); root.add(fl); }
  const glowT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  // dust motes
  const NL = touch ? 40 : 90, motes = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: NL * 3 }, (_, i) => i % 3 === 0 ? x0 + 1 + Math.random() * (x1 - x0 - 2) : i % 3 === 1 ? 0.5 + Math.random() * (H - 1.5) : Math.min(z0, z1) + 1 + Math.random() * (DEP - 2)), 3)), new THREE.PointsMaterial({ color: 0xfff2d8, size: 0.06, transparent: true, opacity: 0.55, depthWrite: false }));
  root.add(motes);
  // glass sparkle pool
  const SP = [], spG = new THREE.BoxGeometry(0.05, 0.05, 0.05), NS = touch ? 24 : 48;
  for (let i = 0; i < NS; i++) { const m = new THREE.Mesh(spG, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })); m.visible = false; root.add(m); SP.push({ m, v: new THREE.Vector3(), t: 0 }); }
  let spI = 0; const spark = (x, y, z, n = 8, col = 0xfff4d0) => { for (let i = 0; i < n; i++) { const s = SP[spI++ % NS]; s.m.position.set(x, y, z); s.m.material.color.setHex(Math.random() < 0.4 ? 0xffffff : col); s.v.set((Math.random() - 0.5) * 4, 1 + Math.random() * 2.5, (Math.random() - 0.5) * 4); s.t = 0.5 + Math.random() * 0.5; s.m.visible = true; } };
  const banner = (txt, sub, w, h, col, bg) => CT(512, Math.round(512 * h / w), (g, cw, ch) => { g.fillStyle = bg; g.fillRect(0, 0, cw, ch); g.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 40; i++) g.fillRect(Math.random() * cw, Math.random() * ch, 30, 2); g.fillStyle = col; g.font = '900 ' + Math.round(ch * 0.42) + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 18, ch * 0.4, cw - 36); if (sub) { g.font = '800 ' + Math.round(ch * 0.2) + 'px Archivo, sans-serif'; g.fillText(sub, 20, ch * 0.78, cw - 40); } });
  const sign = (txt, sub, w, h, col, bg, x, y, z, ry, rz = 0) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: banner(txt, sub, w, h, col, bg) })); p.position.set(x, y, z); p.rotation.set(0, ry, rz); root.add(p); return p; };
  { const [x, z] = W(0, 0.4); sign('FURNITURE', 'MAKE YOURSELF AT HOME', 7, 1.1, '#f3f2f2', '#6a3a5a', x, 5.2, z, ry0); }
  const backBan = (() => { const [x, z] = W(0, DEP - 0.42); return sign('SIT · STAY · PAY', 'ASSEMBLY NOT INCLUDED', 6, 1.2, '#201e1d', '#ffd23a', x, 5.4, z, ry0 + Math.PI, 0.04); })();
  // ---------- breakable cover ----------
  const bars = [], debris = [];
  const mk = (kind, a, d, w, dd, hp, build, onBreak, ry = ry0) => { const [x, z] = W(a, d), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); build(g); const B = { g, x, z, w, d: dd, ry, hp, kind, onBreak: () => onBreak(B) }; bars.push(B); return B; };
  const fling = (list, up = 3, out = 5) => { for (const m of list) { const w = new THREE.Vector3(); m.getWorldPosition(w); const c = m.clone(); c.position.copy(w); c.rotation.set(0, Math.random() * 3, 0); root.add(c); m.visible = false;
      debris.push({ m: c, src: m, v: new THREE.Vector3((Math.random() - 0.5) * out, up * (0.6 + Math.random() * 0.8), (Math.random() - 0.5) * out), sp: (Math.random() - 0.5) * 8, h: ((m.geometry && m.geometry.parameters.height) || 0.2) / 2 }); } };
  // sofas: broken = cushions fly, frame tips back
  const sofa = (a, d, mat) => mk('sofa', a, d, 2.6, 1.1, 60, g => { M(new THREE.BoxGeometry(2.6, 0.45, 1.0), mat, 0, 0.3, 0, g, 0.015); M(new THREE.BoxGeometry(2.6, 0.75, 0.25), mat, 0, 0.75, -0.42, g, 0.015); for (const s of [-1.2, 1.2]) M(new THREE.BoxGeometry(0.25, 0.65, 1.0), mat, s, 0.45, 0, g, 0.012);
      for (const s of [-1.2, 1.2]) for (const t of [-0.4, 0.4]) M(new THREE.BoxGeometry(0.06, 0.1, 0.06), MT.ink, s, 0.04, t, g, 0);
      g.userData.s = []; for (const s of [-0.55, 0.55]) g.userData.s.push(M(new THREE.BoxGeometry(1.05, 0.18, 0.75), mat, s, 0.62, 0.08, g, 0.008)); g.userData.s.push(M(new THREE.BoxGeometry(0.4, 0.4, 0.14), MT.yellow, -0.7, 0.85, -0.22, g, 0.006));
      const tg = M(new THREE.BoxGeometry(0.22, 0.12, 0.01), MT.white, 1.15, 0.65, 0.51, g, 0); tg.rotation.z = 0.3; },
    B => { fling(B.g.userData.s, 3.5, 5); B.g.rotation.set(-0.9, B.ry, 0); B.g.position.y = 0.35; });
  sofa(-5.5, 4.5, MT.green); sofa(5.5, 4.5, MT.mustard);
  // armchairs beside them (decor)
  for (const [a, d, m] of [[-9, 5.5, MT.red], [9, 5.5, MT.blue]]) { const [x, z] = W(a, d), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry0 + (a < 0 ? 0.5 : -0.5); root.add(g); M(new THREE.BoxGeometry(1.0, 0.45, 0.9), m, 0, 0.3, 0, g, 0.012); M(new THREE.BoxGeometry(1.0, 0.8, 0.22), m, 0, 0.8, -0.36, g, 0.012); for (const s of [-0.45, 0.45]) M(new THREE.BoxGeometry(0.16, 0.6, 0.9), m, s, 0.45, 0, g, 0.01); }
  // tall wardrobes: doors creak; broken = doors swing wide + it leans
  const doors = [];
  const ward = (a, d) => mk('wardrobe', a, d, 1.8, 0.9, 90, g => { M(new THREE.BoxGeometry(1.8, 2.7, 0.85), MT.wood, 0, 1.35, 0, g, 0.015); M(new THREE.BoxGeometry(1.9, 0.12, 0.92), MT.oak, 0, 2.76, 0, g, 0.008); M(new THREE.BoxGeometry(1.7, 2.5, 0.02), MT.ink, 0, 1.35, 0.43, g, 0);
      g.userData.d = []; for (const s of [-1, 1]) { const hg = new THREE.Group(); hg.position.set(s * 0.86, 0, 0.44); g.add(hg); M(new THREE.BoxGeometry(0.85, 2.5, 0.05), MT.oak, -s * 0.425, 1.35, 0.02, hg, 0.008); M(new THREE.BoxGeometry(0.04, 0.22, 0.04), MT.gold, -s * 0.78, 1.4, 0.07, hg, 0); const D = { hg, s, ph: Math.random() * 9 }; g.userData.d.push(D); doors.push(D); } },
    B => { for (const D of B.g.userData.d) { D.hg.rotation.y = D.s * 1.6; D.broke = true; } B.g.rotation.set(0.12, B.ry, 0.08); });
  const wards = [ward(-8.6, 10), ward(8.6, 10)];
  // mattress stack (soft cover, mid-floor): top ones slide off
  const matCols = [MT.white, MT.cream, MT.blue, MT.white, MT.cream];
  mk('mattress', 0, 12.5, 2.2, 3.0, 170, g => { g.userData.s = []; for (let i = 0; i < 5; i++) { const m = M(new THREE.BoxGeometry(2.0, 0.3, 2.8), matCols[i], (Math.random() - 0.5) * 0.15, 0.17 + i * 0.31, (Math.random() - 0.5) * 0.15, g, 0.01); m.rotation.y = (Math.random() - 0.5) * 0.1; g.userData.s.push(m); }
      const tg = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.4), new THREE.MeshLambertMaterial({ map: banner('SOFT SALE', 'PRINCESS + PEA TESTED', 1.4, 0.4, '#f3f2f2', '#2e5f8a') })); tg.position.set(0, 1.0, 1.43); g.add(tg); },
    B => { fling(B.g.userData.s.slice(2), 1.2, 3); });
  // KITCHEN set (west back): wall counter (decor) + island (cover)
  { const [x, z] = W(-6.5, DEP - 0.9), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry0 + Math.PI; root.add(g); M(new THREE.BoxGeometry(6.6, 0.9, 0.7), MT.white, 0, 0.45, 0, g, 0.012); M(new THREE.BoxGeometry(6.7, 0.06, 0.76), MT.dark, 0, 0.93, 0, g, 0);
    for (let i = 0; i < 6; i++) M(new THREE.BoxGeometry(0.03, 0.7, 0.01), MT.ink, -2.75 + i * 1.1, 0.45, 0.36, g, 0); M(new THREE.BoxGeometry(6.6, 0.8, 0.4), MT.white, 0, 2.6, -0.15, g, 0.01);
    M(new THREE.BoxGeometry(0.7, 0.05, 0.5), MT.steel, 1.2, 0.97, 0, g, 0); M(new THREE.BoxGeometry(0.9, 1.9, 0.7), MT.steel, -2.8, 0.95, 0.05, g, 0.012);
    const t = CT(64, 64, q => { q.fillStyle = '#d8d2c6'; q.fillRect(0, 0, 64, 64); q.strokeStyle = '#8a9096'; q.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { q.beginPath(); q.moveTo(i, 0); q.lineTo(i, 64); q.moveTo(0, i); q.lineTo(64, i); q.stroke(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 2);
    const bs = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.2), new THREE.MeshLambertMaterial({ map: t })); bs.position.set(0, 1.6, -0.34); g.add(bs); }
  const kitBan = (() => { const [x, z] = W(-6.5, DEP - 4.5); return sign('DREAM KITCHEN', 'FRIDGE IS EMPTY · BANDITS', 2.6, 0.5, '#201e1d', '#e9e3d6', x, 2.2, z + dir * 3.1, ry0 + Math.PI); })();
  mk('island', -6.5, DEP - 4.4, 3.0, 1.2, 80, g => { M(new THREE.BoxGeometry(3.0, 0.92, 1.2), MT.blue, 0, 0.46, 0, g, 0.012); M(new THREE.BoxGeometry(3.15, 0.07, 1.3), MT.white, 0, 0.95, 0, g, 0);
      g.userData.s = []; for (const [x, c] of [[-0.9, MT.red], [-0.2, MT.yellow], [0.7, MT.steel]]) g.userData.s.push(M(new THREE.CylinderGeometry(0.14, 0.12, 0.26, 10), c, x, 1.12, 0.1, g, 0.006));
      g.userData.s.push(M(new THREE.SphereGeometry(0.22, 10, 8), MT.green, 1.1, 1.18, -0.2, g, 0.006)); },
    B => { fling(B.g.userData.s, 3, 5); B.g.rotation.set(0, B.ry, 0.22); spark(B.x, 1, B.z, 6); });
  // BEDROOM set (east back): bed (cover) + nightstands + rug
  { const [x, z] = W(6.5, DEP - 3.2); const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.2), new THREE.MeshLambertMaterial({ map: CT(64, 64, q => { q.fillStyle = '#6a3a5a'; q.fillRect(0, 0, 64, 64); q.strokeStyle = '#d9b24a'; q.lineWidth = 3; q.strokeRect(5, 5, 54, 54); q.strokeRect(14, 14, 36, 36); }) })); rug.rotation.x = -Math.PI / 2; rug.position.set(x, 0.045, z); root.add(rug);
    for (const s of [-1.7, 1.7]) { const [nx, nz] = W(6.5 + s, DEP - 1.2), g = new THREE.Group(); g.position.set(nx, 0, nz); g.rotation.y = ry0; root.add(g); M(new THREE.BoxGeometry(0.6, 0.6, 0.5), MT.oak, 0, 0.3, 0, g, 0.01); M(new THREE.CylinderGeometry(0.04, 0.06, 0.3, 8), MT.gold, 0, 0.75, 0, g, 0); M(new THREE.CylinderGeometry(0.12, 0.2, 0.22, 10, 1, true), MT.cream, 0, 0.98, 0, g, 0.006); }
    const [sx, sz] = W(6.5, DEP - 5.6); sign('NO NAPPING', 'WE MEAN IT', 1.8, 0.45, '#f3f2f2', '#c8262c', sx, 1.0, sz - dir * 0.02, ry0 + Math.PI); }
  mk('bed', 6.5, DEP - 2.6, 2.4, 3.0, 110, g => { M(new THREE.BoxGeometry(2.3, 0.35, 2.7), MT.wood, 0, 0.2, 0.1, g, 0.012); M(new THREE.BoxGeometry(2.4, 1.3, 0.14), MT.wood, 0, 0.65, 1.42, g, 0.012); M(new THREE.BoxGeometry(2.2, 0.25, 2.6), MT.white, 0, 0.5, 0.1, g, 0.008);
      g.userData.s = []; g.userData.s.push(M(new THREE.BoxGeometry(2.25, 0.08, 1.8), MT.plum, 0, 0.66, -0.3, g, 0.006)); for (const s of [-0.55, 0.55]) g.userData.s.push(M(new THREE.BoxGeometry(0.8, 0.18, 0.45), MT.cream, s, 0.72, 1.05, g, 0.006)); },
    B => { fling(B.g.userData.s, 3, 4); B.g.rotation.set(0.2, B.ry, 0); B.g.position.y = 0.1; });
  // wallpaper partitions (the maze)
  const partTex = CT(128, 128, q => { q.fillStyle = '#2f5a4a'; q.fillRect(0, 0, 128, 128); q.fillStyle = '#d9b24a'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { q.beginPath(); q.arc(16 + i * 32, 16 + j * 32, 6, 0, 7); q.fill(); } });
  const part = (a, d, ry) => mk('partition', a, d, 0.25, 3.4, 75, g => { const pm = new THREE.MeshLambertMaterial({ map: partTex }); const p = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.6, 3.4), pm); p.position.y = 1.3; g.add(p); M(new THREE.BoxGeometry(0.3, 0.1, 3.5), MT.oak, 0, 2.65, 0, g, 0); for (const s of [-1.6, 1.6]) M(new THREE.BoxGeometry(0.5, 0.06, 0.25), MT.oak, 0, 0.03, s, g, 0);
      const fr = M(new THREE.BoxGeometry(0.06, 0.8, 1.0), MT.gold, a < 0 ? 0.13 : -0.13, 1.6, 0, g, 0.004); M(new THREE.PlaneGeometry(0.85, 0.65), MT.blue, a < 0 ? 0.17 : -0.17, 1.6, 0, g, 0).rotation.y = a < 0 ? Math.PI / 2 : -Math.PI / 2; },
    B => { B.g.rotation.set(0, B.ry, (B.x < cx ? 1 : -1) * 1.35); B.g.position.y = 0.15; }, ry);
  part(-3.2, 17, ry0); part(3.2, 17, ry0);
  // ---------- shootable decor: chandeliers + floor lamps ----------
  const chands = []; for (const [a, d] of [[-4.5, 8], [4.5, 8], [0, 16.5]]) { const [x, z] = W(a, d), g = new THREE.Group(); g.position.set(x, H - 1.6, z); root.add(g); const ch = M(new THREE.CylinderGeometry(0.012, 0.012, 1.5, 4), MT.ink, x, H - 0.8, z, root, 0);
    M(new THREE.TorusGeometry(0.55, 0.04, 6, 18), MT.gold, 0, 0, 0, g, 0).rotation.x = Math.PI / 2; M(new THREE.SphereGeometry(0.14, 10, 8), MT.gold, 0, 0.05, 0, g, 0);
    for (let i = 0; i < 6; i++) { const an = i * Math.PI / 3; M(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 6), MT.cream, Math.cos(an) * 0.55, 0.1, Math.sin(an) * 0.55, g, 0); const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.07), new THREE.MeshBasicMaterial({ color: 0xfff8e8 })); cr.position.set(Math.cos(an + 0.5) * 0.45, -0.2, Math.sin(an + 0.5) * 0.45); g.add(cr); }
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xffe2a8, transparent: true, depthWrite: false, opacity: 0.6, blending: THREE.AdditiveBlending })); gl.scale.set(2.6, 2.0, 1); gl.position.y = 0.1; g.add(gl);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ map: glowT, color: 0xffd9a0, transparent: true, depthWrite: false, opacity: 0.2, blending: THREE.AdditiveBlending })); pool.rotation.x = -Math.PI / 2; pool.position.set(x, 0.05, z); root.add(pool);
    chands.push({ g, ch, gl, pool, x, z, y0: H - 1.6, vy: 0, state: 0, sw: Math.random() * 6 }); }
  const lamps = []; for (const [a, d] of [[-10, 8.5], [10, 15], [-1.8, 7.5]]) { const [x, z] = W(a, d), g = new THREE.Group(); g.position.set(x, 0, z); root.add(g); M(new THREE.CylinderGeometry(0.22, 0.25, 0.05, 12), MT.dark, 0, 0.03, 0, g, 0); M(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 6), MT.gold, 0, 0.82, 0, g, 0);
    M(new THREE.CylinderGeometry(0.2, 0.36, 0.42, 14, 1, true), MT.cream, 0, 1.75, 0, g, 0.006); const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xffe2a8, transparent: true, depthWrite: false, opacity: 0.45, blending: THREE.AdditiveBlending })); gl.scale.set(1.2, 1.2, 1); gl.position.y = 1.6; g.add(gl);
    lamps.push({ g, gl, x, z, fall: 0, down: false, dx: Math.random() < 0.5 ? -1 : 1 }); }
  // ---------- spots ----------
  const posts = [[-5.5, 6.2], [5.5, 6.2], [-8.6, 11.5], [8.6, 11.5]].map(([a, d]) => W(a, d)), ltPost = W(0, 14.6);
  const inner = [x0 + 0.9, x1 - 0.9, Math.min(z0, z1) + 0.9, Math.max(z0, z1) - 0.9];
  // LAMPSHADE LOU: a fringed lampshade for a hat, a plum bathrobe, gold tassel
  const lt = { name: 'LAMPSHADE LOU', look: { outfit: 'robe', torso: ['#6a3a5a', '#d9b24a', '#201e1d'], gear: 'laser' }, hp: 210,
    prop(P2) { if (!P2) return; if (P2.head) { const m = new THREE.Group(); m.position.set(0, 0.32, 0); m.rotation.z = 0.12; P2.head.add(m); M(new THREE.CylinderGeometry(0.17, 0.32, 0.34, 14, 1, true), MT.cream, 0, 0, 0, m, 0.01); M(new THREE.TorusGeometry(0.32, 0.02, 4, 18), MT.gold, 0, -0.17, 0, m, 0).rotation.x = Math.PI / 2;
        for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6; M(new THREE.BoxGeometry(0.02, 0.08, 0.02), MT.gold, Math.cos(an) * 0.32, -0.22, Math.sin(an) * 0.32, m, 0); } M(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 4), MT.gold, 0, 0.22, 0, m, 0); }
      if (P2.body) { M(new THREE.BoxGeometry(0.05, 0.22, 0.05), MT.gold, 0.16, 0.8, 0.24, P2.body, 0); } } };
  const lines = ['GET OFF MY COUCH!', 'NO NAPPING ON THE MERCH!', 'THIS SOFA\'S A SLEEPER. SO ARE YOU!', 'ASSEMBLY NOT INCLUDED!', 'I\'M A LAMP. YOU CAN\'T SEE ME.', 'MIND THE COASTERS!', 'WHO LEFT THE WARDROBE OPEN?!'];
  function reset() { for (const B of bars) { B.g.rotation.set(0, B.ry, 0); B.g.position.set(B.x, 0, B.z); B.g.scale.set(1, 1, 1); }
    for (const q of debris) { root.remove(q.m); q.src.visible = true; } debris.length = 0; for (const D of doors) { D.broke = false; D.hg.rotation.y = 0; }
    for (const c of chands) { c.state = 0; c.vy = 0; c.g.position.y = c.y0; c.g.rotation.set(0, 0, 0); c.ch.visible = true; c.gl.material.opacity = 0.6; c.pool.material.opacity = 0.2; }
    for (const l of lamps) { l.down = false; l.fall = 0; l.g.rotation.set(0, 0, 0); l.gl.material.opacity = 0.45; } }
  function tick(dt, P) { root.visible = Math.hypot(P.x - cx, P.z - (z0 + z1) / 2) < 70; if (!root.visible) return;
    const pa = motes.geometry.attributes.position; for (let i = 0; i < pa.count; i++) { let y = pa.getY(i) + dt * 0.05; if (y > H - 1) y = 0.5; pa.setY(i, y); } pa.needsUpdate = true;
    for (const D of doors) if (!D.broke && !isOpen) { D.ph += dt; const k = Math.max(0, Math.sin(D.ph * 0.45) - 0.85) * 3; D.hg.rotation.y = D.s * k * 0.5; }
    for (const c of chands) { if (c.state === 0) { c.sw += dt; c.g.rotation.z = Math.sin(c.sw * 0.8) * 0.03; if (!isOpen && Math.random() < dt * 0.15) c.gl.material.opacity = 0.3; else c.gl.material.opacity += (0.6 - c.gl.material.opacity) * dt * 4; }
      else if (c.state === 1) { c.vy -= 14 * dt; c.g.position.y += c.vy * dt; c.g.rotation.z += dt * 2; if (c.g.position.y <= 0.15) { c.g.position.y = 0.15; c.g.rotation.set(0.3, 0, 0.5); c.state = 2; spark(c.x, 0.3, c.z, 14); c.pool.material.opacity = 0; c.gl.material.opacity = 0; } } }
    for (const l of lamps) if (l.down && l.fall < 1) { l.fall = Math.min(1, l.fall + dt * 3); const e = l.fall * l.fall; l.g.rotation.z = l.dx * e * 1.5; if (l.fall >= 1) spark(l.x + l.dx * 1.7, 0.2, l.z, 5); }
    for (const s of SP) { if (s.t <= 0) continue; s.t -= dt; s.v.y -= 9 * dt; s.m.position.addScaledVector(s.v, dt); if (s.m.position.y < 0.04) { s.m.position.y = 0.04; s.v.multiplyScalar(0.3); } s.m.material.opacity = Math.max(0, s.t / 0.6); if (s.t <= 0) s.m.visible = false; }
    for (const q of debris) { if (!q.v) continue; q.v.y -= 12 * dt; q.m.position.addScaledVector(q.v, dt); q.m.rotation.x += q.sp * dt; q.m.rotation.z += q.sp * 0.6 * dt; q.v.x *= 1 - dt * 1.2; q.v.z *= 1 - dt * 1.2;
      if (q.m.position.y < q.h) { q.m.position.y = q.h; q.m.rotation.x = 0; q.m.rotation.z = 0; q.v = null; continue; } const p = q.m.position; p.x = Math.max(inner[0], Math.min(inner[1], p.x)); p.z = Math.max(inner[2], Math.min(inner[3], p.z)); } }
  const hitTargets = toast => [
    ...chands.filter(c => c.state === 0).map(c => ({ x: c.x, z: c.z, r: 1.0, onHit: k => { if (k !== 'range' || c.state) return; c.state = 1; c.vy = 0; c.ch.visible = false; spark(c.x, c.y0, c.z, 6); toast(Math.random() < 0.5 ? 'TIMBER!' : 'THAT WAS CRYSTAL!', 1.2); } })),
    ...lamps.filter(l => !l.down).map(l => ({ x: l.x, z: l.z, r: 0.6, onHit: () => { if (l.down) return; l.down = true; l.fall = 0; l.gl.material.opacity = 0; } }))];
  // s158 STORES OPEN (worlds/meru2-outlet-open.js): battle damage reset, chandeliers steady, wardrobes stop creaking, GRAND REOPENING banner,
  // the floor lamp in front of the new counter moves to the front-west corner
  let isOpen = false, banOld = backBan.material.map, banNew = null, kitOld = kitBan.material.map, kitNew = null; const L3 = lamps[2], l3x = L3.x, l3z = L3.z, [l3nx, l3nz] = W(-9.8, 2.6);
  function setOpen(on) { if (on === isOpen) return; isOpen = on; if (on) reset(); for (const D of doors) D.hg.rotation.y = 0;
    L3.x = on ? l3nx : l3x; L3.z = on ? l3nz : l3z; L3.g.position.set(L3.x, 0, L3.z);
    if (on && !banNew) { banNew = banner('GRAND REOPENING', 'BARNABY IS BACK · ASSEMBLY INCLUDED', 6, 1.2, '#201e1d', '#ffd23a'); kitNew = banner('DREAM KITCHEN', 'SHOWROOM ONLY · FRIDGE IS FAKE', 2.6, 0.5, '#201e1d', '#e9e3d6'); }
    backBan.material.map = on ? banNew : banOld; backBan.rotation.z = on ? 0 : 0.04; backBan.material.needsUpdate = true; kitBan.material.map = on ? kitNew : kitOld; kitBan.material.needsUpdate = true; }
  return { key: 'furn', root, bars, posts, ltPost, inner, lt, lines, reset, tick, hitTargets, setOpen, W, ry0, dir, depth: DEP, H };
}
