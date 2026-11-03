// MERU 2.0 — s152b OUTLETS STORE 4: ELECTRONICS (unit 4, north side; worlds/meru2-outlets.js runs the fight). Looted, dark, lit by the TVs.
// Cover (all breakable): 2 LAPTOP TABLES by the door (flip, laptops fly), 2 AISLES of BOXED TVs (topple, boxes spill), a SPEAKER TOWER mid-floor
// (tumbles, last thump), 2 ARCADE DEMO cabinets (screen dies, sparks), the STOCKROOM cage of stolen goods (fence panel falls). Decor: TV WALL on the
// back wall (shoot a set = it shatters + sparks), SPARKING WIRES from the ceiling, a broken ELECTRONICS neon (dead letters, flicker).
// Lieutenant: VR VINNIE (VR goggles, cable over the shoulder), key 3 of 4.
export function buildElec({ THREE, M, toon, scene, b, touch }) {
  const [x0, x1, z0, z1] = b.f, dir = b.face === 'N' ? 1 : -1, ZF = b.face === 'N' ? z0 : z1, cx = (x0 + x1) / 2, H = (b.sty && b.sty.h) || 7, DEP = Math.abs(z1 - z0);
  const W = (a, d) => [cx + a, ZF + dir * d];
  const root = new THREE.Group(); root.name = 'outletElec'; scene.add(root);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h, c); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { c }; return t; };
  const T = h => toon(h), MT = { ink: T('#201e1d'), steel: T('#8a9096'), dark: T('#3d3b3a'), black: T('#18191b'), wood: T('#a07a52'), cream: T('#e9e3d6'), red: T('#c8262c'), yellow: T('#ffd23a'), blue: T('#2e5f8a'), box: T('#c9a06a'), boxW: T('#e6e1d6'), teal: T('#2c6f74') };
  const ry0 = dir > 0 ? 0 : Math.PI;
  // floor: grey carpet tiles, scuffs, cable runs
  { const t = CT(256, 256, (g, w, h) => { g.fillStyle = '#4f5257'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)'; g.fillRect(i * 64, j * 64, 64, 64); }
      for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.6 ? 'rgba(20,20,24,0.16)' : 'rgba(255,255,255,0.05)'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); const fl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 - 0.8, DEP - 0.8), new THREE.MeshLambertMaterial({ map: t })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0.035, (z0 + z1) / 2); root.add(fl); }
  // tubes: 3 dead, the rest dim + flicker (the TVs carry the light)
  const glowT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const tubes = []; for (const [a, d, dead] of [[-5, 5, 0], [5, 5, 1], [-5, 12, 1], [5, 12, 0], [-5, 18, 0], [5, 18, 1]]) { const [x, z] = W(a, d), m = new THREE.MeshBasicMaterial({ color: dead ? 0x3a3a38 : 0xdfeaff }); const tb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.18), m); tb.position.set(x, H - 0.55, z); tb.rotation.y = ry0; root.add(tb);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xcfe0ff, transparent: true, depthWrite: false, opacity: dead ? 0 : 0.42, blending: THREE.AdditiveBlending })); s.position.set(x, H - 0.7, z); s.scale.set(4, 1.6, 1); root.add(s);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), new THREE.MeshBasicMaterial({ map: glowT, color: 0xbfd4ff, transparent: true, depthWrite: false, opacity: dead ? 0 : 0.13, blending: THREE.AdditiveBlending })); pool.rotation.x = -Math.PI / 2; pool.position.set(x, 0.05, z); root.add(pool);
    tubes.push({ m, s, pool, dead, t: Math.random() * 5, k: 1 }); }
  // sparks (own small pool)
  const SP = [], spG = new THREE.BoxGeometry(0.05, 0.05, 0.05), NS = touch ? 24 : 48;
  for (let i = 0; i < NS; i++) { const m = new THREE.Mesh(spG, new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true })); m.visible = false; root.add(m); SP.push({ m, v: new THREE.Vector3(), t: 0 }); }
  let spI = 0; const spark = (x, y, z, n = 8, col = 0xffd23a) => { for (let i = 0; i < n; i++) { const s = SP[spI++ % NS]; s.m.position.set(x, y, z); s.m.material.color.setHex(Math.random() < 0.3 ? 0xffffff : col); s.v.set((Math.random() - 0.5) * 4, 1 + Math.random() * 3, (Math.random() - 0.5) * 4); s.t = 0.5 + Math.random() * 0.4; s.m.visible = true; } };
  // signs
  const banner = (txt, sub, w, h, col, bg) => CT(512, Math.round(512 * h / w), (g, cw, ch) => { g.fillStyle = bg; g.fillRect(0, 0, cw, ch); g.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 40; i++) g.fillRect(Math.random() * cw, Math.random() * ch, 30, 2); g.fillStyle = col; g.font = '900 ' + Math.round(ch * 0.42) + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 18, ch * 0.4, cw - 36); if (sub) { g.font = '800 ' + Math.round(ch * 0.2) + 'px Archivo, sans-serif'; g.fillText(sub, 20, ch * 0.78, cw - 40); } });
  { const [x, z] = W(0, 0.4), p = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.1), new THREE.MeshLambertMaterial({ map: banner('ELECTRONICS', 'PLUG IN · POWER UP', 7, 1.1, '#f3f2f2', '#2c6f74') })); p.position.set(x, 5.2, z); p.rotation.y = ry0; root.add(p); }
  let refBan = null; { const [x, z] = W(-10.92, 11), p = refBan = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.1), new THREE.MeshLambertMaterial({ map: banner('NO REFUNDS', 'ON SHATTERED SCREENS', 5, 1.1, '#201e1d', '#ffd23a') })); p.position.set(x, 4.6, z); p.rotation.set(0, Math.PI / 2, 0.04); root.add(p); }
  // broken neon on the east wall: E L E C T R O N I C S, some letters dead, some flicker
  const neon = []; { const word = 'ELECTRONICS', dead = [3, 8], flick = [1, 6, 10], [x, z] = W(10.9, 4.5), g = new THREE.Group(); g.position.set(x, 4.9, z); g.rotation.y = -Math.PI / 2; root.add(g);
    M(new THREE.BoxGeometry(7.4, 1.0, 0.06), MT.black, 0, 0, -0.02, g, 0);
    for (let i = 0; i < word.length; i++) { const t = CT(64, 96, (q, w, h) => { q.clearRect(0, 0, w, h); q.font = '900 80px Archivo, sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.strokeStyle = '#ffffff'; q.lineWidth = 5; q.strokeText(word[i], 32, 50); });
      const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, color: dead.includes(i) ? 0x403038 : 0xff4fa0, depthWrite: false }); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.9), mat); p.position.set(-3.2 + i * 0.64, 0, 0.02); g.add(p); neon.push({ mat, dead: dead.includes(i), fl: flick.includes(i), t: Math.random() * 3 }); } }
  // ---------- TV textures: one shared static + one colour-bar + one "SALE" loop (updated ~10 fps), a cracked-black for broken sets ----------
  const staticT = CT(64, 40, () => {}), barsT = CT(64, 40, (g, w, h) => { const c = ['#f3f2f2', '#ffd23a', '#2ec4c4', '#3f9a5e', '#d040c0', '#ec3013', '#2e5f8a']; c.forEach((col, i) => { g.fillStyle = col; g.fillRect(i * w / 7, 0, w / 7 + 1, h * 0.72); }); g.fillStyle = '#201e1d'; g.fillRect(0, h * 0.72, w, h); });
  const saleT = CT(128, 80, () => {}); let saleX = 0;
  const drawStatic = () => { const c = staticT.userData.c, g = c.getContext('2d'), im = g.createImageData(64, 40); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); staticT.needsUpdate = true;
    const s = saleT.userData.c.getContext('2d'); s.fillStyle = '#ec3013'; s.fillRect(0, 0, 128, 80); s.fillStyle = '#ffd23a'; s.font = '900 34px Archivo, sans-serif'; s.textBaseline = 'middle'; saleX = (saleX + 6) % 260; s.fillText('MEGA SALE · 90% OFF', 128 - saleX, 40); saleT.needsUpdate = true; };
  drawStatic();
  const scrM = [staticT, barsT, saleT].map(t => new THREE.MeshBasicMaterial({ map: t })), deadScr = new THREE.MeshBasicMaterial({ map: CT(64, 40, (g, w, h) => { g.fillStyle = '#0c0d0f'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(220,230,240,0.7)'; g.lineWidth = 1; for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(w * 0.45, h * 0.5); g.lineTo(Math.random() * w, Math.random() * h); g.stroke(); } }) });
  const tvGlow = new THREE.MeshBasicMaterial({ map: glowT, color: 0x9fc8ff, transparent: true, depthWrite: false, opacity: 0.16, blending: THREE.AdditiveBlending });
  // TV WALL on the back wall (west half): 3 rows × 4 sets; each a hit target
  const tvs = []; { const [bx, bz] = W(-5, DEP - 0.5), g = new THREE.Group(); g.position.set(bx, 0, bz); g.rotation.y = ry0 + Math.PI; root.add(g);
    M(new THREE.BoxGeometry(8.6, 0.12, 0.7), MT.dark, 0, 0.9, 0.2, g, 0.01);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const lx = -3.15 + c * 2.1, ly = 1.75 + r * 1.3; M(new THREE.BoxGeometry(1.95, 1.15, 0.14), MT.black, lx, ly, 0.05, g, 0.008);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 1.0), scrM[(r * 4 + c) % 3]); s.position.set(lx, ly, 0.13); g.add(s); const w = new THREE.Vector3(); s.getWorldPosition(w); tvs.push({ s, x: w.x, z: w.z, y: ly, mat0: s.material, broke: false }); }
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), tvGlow); gl.rotation.x = -Math.PI / 2; gl.position.set(0, 0.06, 2.2); g.add(gl); }
  // sparking wires hanging from the ceiling
  const wires = []; for (const [a, d] of [[3, 8], [-2.5, 17]]) { const [x, z] = W(a, d), wl = 1.6 + Math.random() * 0.6, g = new THREE.Group(); g.position.set(x, H - 0.1, z); root.add(g); const c = M(new THREE.CylinderGeometry(0.025, 0.025, wl, 5), MT.ink, 0, -wl / 2, 0, g, 0); const c2 = M(new THREE.CylinderGeometry(0.02, 0.02, wl * 0.8, 5), MT.red, 0.12, -wl * 0.4, 0, g, 0); c2.rotation.z = 0.15;
    wires.push({ g, x, z, y: H - 0.1 - wl, t: 1 + Math.random() * 3, ph: Math.random() * 6 }); }
  // ---------- breakable cover ----------
  const bars = [], debris = [];
  const mk = (kind, a, d, w, dd, hp, build, onBreak, ry = ry0) => { const [x, z] = W(a, d), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); build(g); const B = { g, x, z, w, d: dd, ry, hp, kind, onBreak: () => onBreak(B) }; bars.push(B); return B; };
  const fling = (list, up = 3, out = 5) => { for (const m of list) { const w = new THREE.Vector3(); m.getWorldPosition(w); const c = m.clone(); c.position.copy(w); c.rotation.set(0, Math.random() * 3, 0); root.add(c); m.visible = false;
      debris.push({ m: c, src: m, v: new THREE.Vector3((Math.random() - 0.5) * out, up * (0.6 + Math.random() * 0.8), (Math.random() - 0.5) * out), sp: (Math.random() - 0.5) * 8, h: ((m.geometry && m.geometry.parameters.height) || 0.2) / 2 }); } };
  const lapScr = new THREE.MeshBasicMaterial({ color: 0x7fc4ff });
  // laptop tables
  const lapTable = (a, d) => mk('laptops', a, d, 2.6, 1.3, 55, g => { M(new THREE.BoxGeometry(2.6, 0.08, 1.3), MT.cream, 0, 0.86, 0, g, 0.015); for (const sx of [-1.2, 1.2]) for (const sz of [-0.55, 0.55]) M(new THREE.BoxGeometry(0.07, 0.84, 0.07), MT.steel, sx, 0.42, sz, g, 0);
      g.userData.s = []; for (const sx of [-0.85, 0, 0.85]) { const lp = new THREE.Group(); lp.position.set(sx, 0.92, 0); g.add(lp); const base = M(new THREE.BoxGeometry(0.5, 0.03, 0.34), MT.dark, 0, 0, 0, lp, 0.004); const lid = new THREE.Group(); lid.position.set(0, 0.015, -0.17); lid.rotation.x = -0.25; lp.add(lid);
        M(new THREE.BoxGeometry(0.5, 0.34, 0.02), MT.dark, 0, 0.17, 0, lid, 0.004); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.28), lapScr); sc.position.set(0, 0.17, 0.012); lid.add(sc); g.userData.s.push(base); }
      const tg = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.32), new THREE.MeshLambertMaterial({ map: banner('DEMO ONLY', 'DO NOT STEAL', 0.9, 0.32, '#f3f2f2', '#c8262c') })); tg.position.set(0, 0.7, 0.66); g.add(tg); },
    B => { fling(B.g.children.filter(c => c.isGroup), 3.5, 5); B.g.rotation.z = 1.45; B.g.position.y = 0.7; spark(B.x, 0.9, B.z, 6, 0x7fc4ff); });
  lapTable(-5.5, 4.5); lapTable(5.5, 4.5);
  // aisles of boxed TVs (long axis along the depth)
  const aisle = (a, d) => mk('aisle', a, d, 1.3, 5.2, 90, g => { g.userData.s = []; for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) { const big = k === 0, bx = M(new THREE.BoxGeometry(1.15, big ? 0.85 : 0.7, 1.2), (i + k) % 3 ? MT.box : MT.boxW, (Math.random() - 0.5) * 0.06, (big ? 0.425 : 0.85 + (k - 1) * 0.72 + 0.35), -1.95 + i * 1.3, g, 0.008); bx.rotation.y = (Math.random() - 0.5) * 0.08; g.userData.s.push(bx); }
      const t = banner('4K', 'ULTRA', 0.6, 0.4, '#201e1d', '#e6e1d6'); for (const sx of [-0.59, 0.59]) for (let i = 0; i < 4; i++) { const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.4), new THREE.MeshLambertMaterial({ map: t })); lb.position.set(sx, 0.45, -1.95 + i * 1.3); lb.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2; g.add(lb); } },
    B => { fling(B.g.userData.s.filter((_, i) => i % 3 !== 0), 2, 4); B.g.rotation.z = 0.25; }, ry0 + 0);
  aisle(-6, 11.5); aisle(6, 11.5);
  // speaker tower mid-floor
  const tower = mk('speakers', 0, 14, 2.0, 1.4, 100, g => { g.userData.s = []; for (const [y, w, h] of [[0.5, 1.9, 1.0], [1.45, 1.5, 0.9], [2.25, 1.1, 0.7]]) { const bx = M(new THREE.BoxGeometry(w, h, 1.2), MT.black, 0, y, 0, g, 0.012); g.userData.s.push(bx);
        for (const sx of (w > 1.3 ? [-w / 4, w / 4] : [0])) { const cone = M(new THREE.CylinderGeometry(h * 0.32, h * 0.32, 0.04, 16), MT.dark, sx, y, 0.61, g, 0); cone.rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(h * 0.1, h * 0.1, 0.05, 10), MT.steel, sx, y, 0.62, g, 0).rotation.x = Math.PI / 2; } } g.userData.y0 = 0; },
    B => { fling(B.g.userData.s.slice(1), 2.5, 4); B.g.rotation.x = 0.3; B.g.position.y = -0.15; spark(B.x, 1, B.z, 10); });
  // arcade demo stations (west back)
  const arc = (a, d) => mk('arcade', a, d, 1.1, 1.0, 70, g => { M(new THREE.BoxGeometry(1.0, 1.9, 0.9), MT.teal, 0, 0.95, 0, g, 0.012); M(new THREE.BoxGeometry(1.02, 0.35, 0.95), MT.yellow, 0, 2.02, 0.02, g, 0.008); M(new THREE.BoxGeometry(0.9, 0.12, 0.5), MT.dark, 0, 1.12, 0.5, g, 0.008);
      for (const sx of [-0.25, 0.1, 0.28]) M(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), sx < 0 ? MT.red : MT.yellow, sx, 1.2, 0.55, g, 0);
      const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), scrM[1 + (a > 0 ? 1 : 0)]); sc.position.set(0, 1.55, 0.46); sc.rotation.x = -0.15; g.add(sc); g.userData.sc = sc; },
    B => { B.g.userData.sc.material = deadScr; B.g.rotation.z = 0.35; B.g.position.y = 0.1; spark(B.x, 1.6, B.z, 12); B.zap = 3; });
  const arcs = [arc(-8.8, 15.5), arc(-8.8, 17.4)];
  // stockroom of stolen goods (east back corner): chain-link cage, crates + SWAG bags inside
  const loot = mk('stock', 6.6, DEP - 2.4, 6.4, 3.4, 120, g => { const fM = new THREE.MeshBasicMaterial({ color: 0x9aa0a6, wireframe: true, transparent: true, opacity: 0.4 }); for (const sx of [-3.15, 3.15]) M(new THREE.BoxGeometry(0.06, 2.6, 0.06), MT.steel, sx, 1.3, 1.65, g, 0);
      const panel = new THREE.Group(); panel.position.set(0, 0, 1.65); g.add(panel); const fp = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.5, 0.02, 24, 10), fM); fp.position.y = 1.3; panel.add(fp); M(new THREE.BoxGeometry(6.3, 0.06, 0.06), MT.steel, 0, 2.6, 0, panel, 0); g.userData.panel = panel;
      for (const [x, z, s] of [[-2.2, -0.6, 1], [-1.1, -0.9, 0.8], [-2.0, 0.4, 0.7], [1.6, -0.7, 1]]) M(new THREE.BoxGeometry(s, s * 0.8, s), MT.wood, x, s * 0.4, z, g, 0.01);
      for (const [x, z] of [[0.2, 0.2], [0.8, -0.3], [2.4, 0.5]]) { const bg = M(new THREE.SphereGeometry(0.42, 10, 8), MT.black, x, 0.36, z, g, 0.01); bg.scale.set(1, 0.85, 0.9); }
      const tg = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), new THREE.MeshLambertMaterial({ map: banner('STOCKROOM', 'TOTALLY NOT STOLEN', 2.4, 0.5, '#201e1d', '#ffd23a') })); tg.position.set(0, 2.25, 1.68); g.add(tg); },
    B => { const p = B.g.userData.panel; p.rotation.x = 1.45; p.position.y = 0.1; spark(B.x, 0.6, B.z, 6, 0xffffff); });
  // ---------- spots ----------
  const posts = [[-5.5, 6], [5.5, 6], [-6, 15], [6, 15]].map(([a, d]) => W(a, d)), ltPost = W(0, 16.2);
  const inner = [x0 + 0.9, x1 - 0.9, Math.min(z0, z1) + 0.9, Math.max(z0, z1) - 0.9];
  // VR VINNIE: VR goggles (glowing visor + strap), a cable over his shoulder
  const visorM = new THREE.MeshBasicMaterial({ color: 0x4fd8ff });
  const lt = { name: 'VR VINNIE', look: { outfit: 'vest', torso: ['#2c6f74', '#201e1d', '#8a9096'], gear: 'laser' }, hp: 200,
    prop(P2) { if (!P2) return; if (P2.head) { const m = new THREE.Group(); m.position.set(0, 0.06, 0.2); P2.head.add(m); M(new THREE.BoxGeometry(0.36, 0.17, 0.16), MT.black, 0, 0, 0, m, 0.01); const v = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.1), visorM); v.position.z = 0.082; m.add(v);
        M(new THREE.BoxGeometry(0.42, 0.05, 0.4), MT.dark, 0, 0, -0.2, m, 0); M(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 4), MT.ink, 0.12, 0.17, -0.05, m, 0).rotation.z = -0.3; }
      if (P2.body) { const c = M(new THREE.TorusGeometry(0.36, 0.025, 4, 16, Math.PI * 1.2), MT.red, 0.05, 1.05, 0, P2.body, 0); c.rotation.set(0.2, Math.PI / 2, 0.9); } } };
  const lines = ['DON\'T TOUCH THE 4K!', 'TURN IT OFF AND ON AGAIN!', 'I\'M IN VR, I CAN\'T SEE YOU!', 'WHO UNPLUGGED THE ARCADE?!', 'THIS IS HIGH DEFINITION PAIN!', 'BATTERIES NOT INCLUDED!', 'NO WARRANTY ON YOUR FACE!'];
  const crack = ['SCREEN CRACKED!', 'NO SIGNAL!', 'THAT WAS A DISPLAY MODEL.', '...AND IT\'S BROKEN.'];
  function reset() { for (const B of bars) { B.g.rotation.set(0, B.ry, 0); B.g.position.set(B.x, 0, B.z); B.g.scale.set(1, 1, 1); B.zap = 0; }
    for (const q of debris) { root.remove(q.m); q.src.visible = true; } debris.length = 0;
    arcs.forEach((B, i) => { B.g.userData.sc.material = scrM[1 + i]; }); const p = loot.g.userData.panel; p.rotation.x = 0; p.position.y = 0;
    for (const t of tvs) { t.broke = false; t.s.material = t.mat0; } }
  let texT = 0;
  function tick(dt, P) { root.visible = Math.hypot(P.x - cx, P.z - (z0 + z1) / 2) < 70; if (!root.visible) return;
    texT -= dt; if (texT <= 0) { texT = touch ? 0.14 : 0.09; drawStatic(); }
    for (const t of tubes) { if (t.dead) { t.t -= dt; if (t.t <= 0) { t.t = 2 + Math.random() * 6; t.k = 0.6; } t.k = Math.max(0, t.k - dt * 3); const on = t.k > 0 && Math.random() < 0.6; t.m.color.setHex(on ? 0xdfeaff : 0x3a3a38); t.s.material.opacity = on ? 0.4 : 0; t.pool.material.opacity = on ? 0.12 : 0; }
      else if (!isOpen && Math.random() < dt * 0.3) { t.m.color.setHex(0x5a5a58); t.s.material.opacity = 0.08; setTimeout(() => { t.m.color.setHex(0xdfeaff); t.s.material.opacity = 0.42; }, 70 + Math.random() * 120); } }
    for (const n of neon) { if (n.dead) continue; if (n.fl) { n.t -= dt; if (n.t <= 0) n.t = 0.05 + Math.random() * (Math.random() < 0.2 ? 1.5 : 0.25); n.mat.color.setHex(n.t > 0.2 || Math.random() < 0.5 ? 0xff4fa0 : 0x403038); } }
    for (const w of wires) { if (isOpen) continue; w.ph += dt; w.g.rotation.z = Math.sin(w.ph * 1.1) * 0.06; w.t -= dt; if (w.t <= 0) { w.t = 1.2 + Math.random() * 3.5; spark(w.x, w.y, w.z, touch ? 4 : 7); } }
    for (const B of arcs) if (B.zap > 0) { B.zap -= dt; if (Math.random() < dt * 3) spark(B.x, 1.6, B.z, 3); }
    for (const s of SP) { if (s.t <= 0) continue; s.t -= dt; s.v.y -= 9 * dt; s.m.position.addScaledVector(s.v, dt); if (s.m.position.y < 0.04) { s.m.position.y = 0.04; s.v.multiplyScalar(0.3); } s.m.material.opacity = Math.max(0, s.t / 0.6); if (s.t <= 0) s.m.visible = false; }
    for (const q of debris) { if (!q.v) continue; q.v.y -= 12 * dt; q.m.position.addScaledVector(q.v, dt); q.m.rotation.x += q.sp * dt; q.m.rotation.z += q.sp * 0.6 * dt;
      if (q.m.position.y < q.h) { q.m.position.y = q.h; q.m.rotation.x = Math.round(q.m.rotation.x / (Math.PI / 2)) * Math.PI / 2; q.m.rotation.z = 0; q.v = null; continue; } const p = q.m.position; p.x = Math.max(inner[0], Math.min(inner[1], p.x)); p.z = Math.max(inner[2], Math.min(inner[3], p.z)); } }
  const hitTargets = toast => tvs.filter(t => !t.broke).map(t => ({ x: t.x, z: t.z, r: 1.0, onHit: k => { if (k !== 'range' || t.broke) return; t.broke = true; t.s.material = deadScr; spark(t.x, t.y, t.z, 10); if (Math.random() < 0.5) toast(crack[Math.floor(Math.random() * crack.length)], 1.2); } }));
  // s157 STORES OPEN (worlds/meru2-outlet-open.js): every tube on (no flicker), the neon fully lit, the sparking wires gone, battle damage reset, GRAND REOPENING banner
  for (const t of tubes) t.dead0 = t.dead; for (const n of neon) { n.dead0 = n.dead; n.fl0 = n.fl; }
  let isOpen = false, banOld = refBan.material.map, banNew = null;
  function setOpen(on) { if (on === isOpen) return; isOpen = on; if (on) reset();
    for (const t of tubes) { t.dead = on ? 0 : t.dead0; t.m.color.setHex(t.dead ? 0x3a3a38 : 0xdfeaff); t.s.material.opacity = t.dead ? 0 : 0.42; t.pool.material.opacity = t.dead ? 0 : 0.13; }
    for (const n of neon) { n.dead = on ? false : n.dead0; n.fl = on ? false : n.fl0; n.mat.color.setHex(n.dead ? 0x403038 : 0xff4fa0); }
    for (const w of wires) w.g.visible = !on;
    if (on && !banNew) banNew = banner('GRAND REOPENING', 'OLLIE IS BACK \u00b7 EVERY SCREEN WORKS', 5, 1.1, '#201e1d', '#ffd23a');
    refBan.material.map = on ? banNew : banOld; refBan.rotation.z = on ? 0 : 0.04; refBan.material.needsUpdate = true; }
  return { key: 'elec', root, bars, posts, ltPost, inner, lt, lines, reset, tick, hitTargets, setOpen, W, ry0, dir, depth: DEP, H };
}
