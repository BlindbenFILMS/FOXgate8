// MERU 2.0 — s152 OUTLETS STORE 2: FUNNY T-SHIRTS (unit 2, north side; worlds/meru2-outlets.js runs the fight). Trashed joke-shirt shop.
// Cover (all breakable): 2 FOLDED-SHIRT TABLES by the door (flip, shirts fly), 2 TALL SHELVES of stacks (tip, stacks spill), the SCREEN-PRINT
// PRESS mid-floor (arms droop, ink spill), the CHANGING ROOMS on the back wall (curtains drop; bandits hide in them). MANNEQUINS fall when hit.
// Slogan shirts on the walls (shoot them: they swing): I ♥ MERU · KING MIGHT... NOT! (3 lines, crown) · ROBOTS ARE ALIVE · SUPER FOX · IRON FOX.
// Lieutenant: MANNY QUINN (mannequin armour, blank plastic face, price tag), key 2 of 4.
export function buildTees({ THREE, M, toon, scene, b, touch }) {
  const [x0, x1, z0, z1] = b.f, dir = b.face === 'N' ? 1 : -1, ZF = b.face === 'N' ? z0 : z1, cx = (x0 + x1) / 2, H = (b.sty && b.sty.h) || 7, DEP = Math.abs(z1 - z0);
  const W = (a, d) => [cx + a, ZF + dir * d];
  const root = new THREE.Group(); root.name = 'outletTees'; scene.add(root);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const T = h => toon(h), MT = { ink: T('#201e1d'), steel: T('#8a9096'), dark: T('#3d3b3a'), wood: T('#a07a52'), cream: T('#e9e3d6'), plastic: T('#f1ece4'), red: T('#c8262c'), yellow: T('#ffd23a'), blue: T('#2e5f8a'), curtain: T('#8a2a24'), green: T('#3f7a52') };
  const ry0 = dir > 0 ? 0 : Math.PI, shirtCols = ['#ec3013', '#ffd23a', '#2e86b8', '#f3f2f2', '#201e1d', '#3f9a5e', '#e8742a'];
  // floor: worn wood boards, lint + dropped tags
  { const t = CT(256, 256, (g, w, h) => { g.fillStyle = '#7a5e44'; g.fillRect(0, 0, w, h); for (let j = 0; j < 8; j++) { g.fillStyle = j % 2 ? 'rgba(255,240,220,0.05)' : 'rgba(0,0,0,0.08)'; g.fillRect(0, j * 32, w, 32); g.fillStyle = 'rgba(20,14,10,0.35)'; g.fillRect(0, j * 32, w, 1.5); g.fillRect(((j * 97) % w), j * 32, 1.5, 32); }
      for (let i = 0; i < 700; i++) { g.fillStyle = Math.random() < 0.6 ? 'rgba(30,22,16,0.14)' : 'rgba(255,248,236,0.08)'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 2); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); const fl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 - 0.8, DEP - 0.8), new THREE.MeshLambertMaterial({ map: t })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0.035, (z0 + z1) / 2); root.add(fl); }
  // tubes (2 dead + flicker) + glow pools
  const glowT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const tubes = []; for (const [a, d, dead] of [[-5, 5, 0], [5, 5, 0], [-5, 12, 1], [5, 12, 0], [-5, 18, 0], [5, 18, 1]]) { const [x, z] = W(a, d), m = new THREE.MeshBasicMaterial({ color: dead ? 0x3a3a38 : 0xfff4e2 }); const tb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.18), m); tb.position.set(x, H - 0.55, z); tb.rotation.y = ry0; root.add(tb);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xfff0d8, transparent: true, depthWrite: false, opacity: dead ? 0 : 0.55, blending: THREE.AdditiveBlending })); s.position.set(x, H - 0.7, z); s.scale.set(4, 1.6, 1); root.add(s);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), new THREE.MeshBasicMaterial({ map: glowT, color: 0xffe6c4, transparent: true, depthWrite: false, opacity: dead ? 0 : 0.18, blending: THREE.AdditiveBlending })); pool.rotation.x = -Math.PI / 2; pool.position.set(x, 0.05, z); root.add(pool);
    tubes.push({ m, s, pool, dead, t: Math.random() * 5, k: 1 }); }
  // lint in the air (coloured fluff, drifts down)
  const NL = touch ? 40 : 90, lint = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: NL * 3 }, (_, i) => i % 3 === 0 ? x0 + 1 + Math.random() * (x1 - x0 - 2) : i % 3 === 1 ? 0.5 + Math.random() * (H - 1.5) : Math.min(z0, z1) + 1 + Math.random() * (DEP - 2)), 3)), new THREE.PointsMaterial({ color: 0xffe0e8, size: 0.06, transparent: true, opacity: 0.55, depthWrite: false }));
  root.add(lint);
  // signs
  const banner = (txt, sub, w, h, col, bg) => CT(512, Math.round(512 * h / w), (g, cw, ch) => { g.fillStyle = bg; g.fillRect(0, 0, cw, ch); g.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 40; i++) g.fillRect(Math.random() * cw, Math.random() * ch, 30, 2); g.fillStyle = col; g.font = '900 ' + Math.round(ch * 0.42) + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 18, ch * 0.4, cw - 36); if (sub) { g.font = '800 ' + Math.round(ch * 0.2) + 'px Archivo, sans-serif'; g.fillText(sub, 20, ch * 0.78, cw - 40); } });
  { const [x, z] = W(0, 0.4), p = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.1), new THREE.MeshLambertMaterial({ map: banner('FUNNY T-SHIRTS', 'WEAR YOUR JOKE', 7, 1.1, '#201e1d', '#ffd23a') })); p.position.set(x, 5.2, z); p.rotation.y = ry0; root.add(p); }
  let backBan = null; { const [x, z] = W(-5.6, DEP - 0.42), p = backBan = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.2), new THREE.MeshLambertMaterial({ map: banner('ALL SALES FINAL', 'JOKES NOT INCLUDED · NO REFUNDS', 5.6, 1.2, '#f3f2f2', '#8a2a24') })); p.position.set(x, 5.4, z); p.rotation.set(0, ry0 + Math.PI, -0.05); root.add(p); }
  // ---------- slogan shirts (canvas: shirt silhouette + slogan) ----------
  const shirtTex = (bg, ink, draw) => CT(256, 256, (g, w) => { g.fillStyle = bg; g.strokeStyle = '#201e1d'; g.lineWidth = 6; g.beginPath(); g.moveTo(84, 18); g.quadraticCurveTo(128, 46, 172, 18); g.lineTo(246, 58); g.lineTo(220, 112); g.lineTo(192, 98); g.lineTo(192, 244); g.lineTo(64, 244); g.lineTo(64, 98); g.lineTo(36, 112); g.lineTo(10, 58); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; draw(g, w); });
  const txt = (g, s, y, px) => { g.font = '900 ' + px + 'px Archivo, sans-serif'; g.fillText(s, 128, y, 120); };
  const heart = (g, x, y, r) => { g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.4, y - r * 0.2, x - r * 0.6, y - r * 1.1, x, y - r * 0.4); g.bezierCurveTo(x + r * 0.6, y - r * 1.1, x + r * 1.4, y - r * 0.2, x, y + r * 0.9); g.fill(); };
  const SLOGANS = [
    { a: -10.92, d: 6, side: 'W', tex: shirtTex('#f3f2f2', '#201e1d', g => { txt(g, 'I', 128, 40); g.fillStyle = '#ec3013'; heart(g, 128, 168, 20); g.fillStyle = '#201e1d'; txt(g, 'MERU', 214, 32); }) },
    { a: -10.92, d: 13, side: 'W', tex: shirtTex('#2e5f8a', '#ffd23a', g => { txt(g, 'SUPER', 140, 34); txt(g, 'FOX', 184, 46); }) },
    { a: 0, d: DEP - 0.42, side: 'B', big: 1, tex: shirtTex('#201e1d', '#ffd23a', g => { g.beginPath(); g.moveTo(98, 108); g.lineTo(104, 82); g.lineTo(116, 98); g.lineTo(128, 76); g.lineTo(140, 98); g.lineTo(152, 82); g.lineTo(158, 108); g.closePath(); g.fill(); g.fillStyle = '#f3f2f2'; txt(g, 'KING', 136, 28); txt(g, 'MIGHT...', 172, 28); g.fillStyle = '#ec3013'; txt(g, 'NOT!', 212, 36); }) },
    { a: 10.92, d: 6, side: 'E', tex: shirtTex('#8a9096', '#201e1d', g => { txt(g, 'ROBOTS', 132, 30); txt(g, 'ARE', 168, 26); g.fillStyle = '#ec3013'; txt(g, 'ALIVE', 206, 32); }) },
    { a: 10.92, d: 13, side: 'E', tex: shirtTex('#c8262c', '#f3f2f2', g => { txt(g, 'IRON', 140, 38); txt(g, 'FOX', 186, 44); }) }];
  const wallShirts = SLOGANS.map(S => { const [x, z] = W(S.a, S.d), s = S.big ? 3 : 2.3, g = new THREE.Group(); g.position.set(x, 3.6 + (S.big ? 0.2 : 0), z); g.rotation.y = S.side === 'W' ? Math.PI / 2 : S.side === 'E' ? -Math.PI / 2 : ry0 + Math.PI; root.add(g);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshLambertMaterial({ map: S.tex, transparent: true, alphaTest: 0.1 })); p.position.set(0, -s / 2 + 0.1, 0.03); g.add(p);
    M(new THREE.BoxGeometry(s * 0.7, 0.05, 0.05), MT.dark, 0, 0.05, 0.05, g, 0); return { g, x, z, hit: 0 }; });
  // ---------- breakable cover ----------
  const bars = [], debris = [];
  const mk = (kind, a, d, w, dd, hp, build, onBreak) => { const [x, z] = W(a, d), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry0; root.add(g); build(g); const B = { g, x, z, w, d: dd, ry: ry0, hp, kind, onBreak: () => onBreak(B) }; bars.push(B); return B; };
  // fling: copy each mesh in list into a flying debris piece (originals hidden; reset shows them again)
  const fling = (list, up = 3, out = 5) => { for (const m of list) { const w = new THREE.Vector3(); m.getWorldPosition(w); const c = m.clone(); c.position.copy(w); c.rotation.set(0, Math.random() * 3, 0); root.add(c); m.visible = false;
      debris.push({ m: c, src: m, v: new THREE.Vector3((Math.random() - 0.5) * out, up * (0.6 + Math.random() * 0.8), (Math.random() - 0.5) * out), sp: (Math.random() - 0.5) * 10, h: ((m.geometry && m.geometry.parameters.height) || 0.1) / 2 }); } };
  const stack = (g, x, y, z, n, out) => { for (let i = 0; i < n; i++) { const s = M(new THREE.BoxGeometry(0.42, 0.07, 0.34), T(shirtCols[Math.floor(Math.random() * shirtCols.length)]), x + (Math.random() - 0.5) * 0.03, y + 0.035 + i * 0.075, z, g, 0.004); out.push(s); } };
  // folded-shirt tables: broken = flips on its side, shirts fly
  const table = (a, d) => mk('table', a, d, 2.4, 1.4, 55, g => { M(new THREE.BoxGeometry(2.4, 0.08, 1.4), MT.wood, 0, 0.86, 0, g, 0.015); for (const sx of [-1.1, 1.1]) for (const sz of [-0.6, 0.6]) M(new THREE.BoxGeometry(0.08, 0.84, 0.08), MT.dark, sx, 0.42, sz, g, 0);
      g.userData.s = []; for (const sx of [-0.8, -0.27, 0.27, 0.8]) for (const sz of [-0.32, 0.32]) stack(g, sx, 0.9, sz, touch ? 2 : 3 + Math.floor(Math.random() * 2), g.userData.s);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.35), new THREE.MeshLambertMaterial({ map: banner('2 FOR 1', 'IF YOU LAUGH', 0.9, 0.35, '#201e1d', '#ffd23a') })); sign.position.set(0, 0.7, 0.72); g.add(sign); },
    B => { fling(B.g.userData.s, 4, 6); B.g.rotation.z = 1.45; B.g.position.y = 0.7; });
  table(-5.5, 4.5); table(5.5, 4.5);
  // tall shelves: broken = tips over, stacks spill
  const shelf = (a, d) => mk('shelf', a, d, 3.2, 0.9, 85, g => { for (const sx of [-1.55, 1.55]) M(new THREE.BoxGeometry(0.08, 2.5, 0.85), MT.steel, sx, 1.25, 0, g, 0.01); M(new THREE.BoxGeometry(3.2, 2.5, 0.05), MT.cream, 0, 1.25, -0.42, g, 0);
      g.userData.s = []; for (const y of [0.15, 0.8, 1.45, 2.1]) { M(new THREE.BoxGeometry(3.1, 0.05, 0.85), MT.steel, 0, y, 0, g, 0); for (const sx of [-1.1, -0.37, 0.37, 1.1]) if (Math.random() < 0.85) stack(g, sx, y + 0.03, 0.05, touch ? 2 : 2 + Math.floor(Math.random() * 3), g.userData.s); } },
    B => { fling(B.g.userData.s.filter((_, i) => i % 2 === 0), 1.5, 4); B.g.rotation.x = 1.35; B.g.position.y = 0.45; });
  shelf(-6, 10.5); shelf(6, 10.5);
  // screen-print press: octopus carousel (6 arms + boards); broken = arms droop, ink puddle
  const inkM = new THREE.MeshBasicMaterial({ color: 0xc8262c, transparent: true, opacity: 0.85, depthWrite: false });
  const press = mk('press', 0, 14, 3.4, 3.4, 110, g => { M(new THREE.CylinderGeometry(0.5, 0.7, 0.3, 12), MT.dark, 0, 0.15, 0, g, 0.015); M(new THREE.CylinderGeometry(0.13, 0.13, 1.5, 8), MT.steel, 0, 0.9, 0, g, 0.01); M(new THREE.CylinderGeometry(0.32, 0.32, 0.25, 12), MT.red, 0, 1.6, 0, g, 0.01);
      g.userData.arms = []; for (let i = 0; i < 6; i++) { const arm = new THREE.Group(); arm.position.set(0, 1.55, 0); arm.rotation.y = i * Math.PI / 3; g.add(arm); M(new THREE.BoxGeometry(0.08, 0.08, 1.4), MT.steel, 0, 0, 0.75, arm, 0);
        M(new THREE.BoxGeometry(0.55, 0.05, 0.7), i % 2 ? MT.ink : MT.cream, 0, -0.05, 1.5, arm, 0.006); const fr = M(new THREE.BoxGeometry(0.6, 0.06, 0.06), i % 3 ? MT.yellow : MT.blue, 0, 0.12, 1.85, arm, 0); g.userData.arms.push(arm); }
      const pd = new THREE.Mesh(new THREE.CircleGeometry(1.3, 18), inkM); pd.rotation.x = -Math.PI / 2; pd.position.y = 0.04; pd.scale.setScalar(0.01); pd.visible = false; g.add(pd); g.userData.pd = pd;
      const can = M(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 10), MT.red, 0.9, 0.15, -0.8, g, 0.01); g.userData.can = can; },
    B => { for (const [i, a] of B.g.userData.arms.entries()) a.rotation.x = 0.35 + (i % 2) * 0.25; B.g.userData.pd.visible = true; B.g.userData.pdT = 0; B.g.userData.can.rotation.z = Math.PI / 2; B.g.userData.can.position.y = 0.16; });
  // changing rooms on the back wall (east half): 3 booths, curtains sway; broken = rod falls, curtains drop
  const curtains = [];
  const booths = mk('booths', 6, DEP - 1.3, 6.2, 2.2, 120, g => { for (const sx of [-3.05, -1.02, 1.02, 3.05]) M(new THREE.BoxGeometry(0.08, 2.4, 2.1), MT.cream, sx, 1.2, 0, g, 0.01); M(new THREE.BoxGeometry(6.2, 0.06, 2.1), MT.cream, 0, 2.43, 0, g, 0);
      const rod = new THREE.Group(); rod.position.set(0, 2.25, 1.05); g.add(rod); g.userData.rod = rod; M(new THREE.CylinderGeometry(0.03, 0.03, 6.1, 6), MT.steel, 0, 0, 0, rod, 0).rotation.z = Math.PI / 2;
      for (const sx of [-2.03, 0, 2.03]) { const c = new THREE.Group(); c.position.set(sx, 0, 0); rod.add(c); const cl = M(new THREE.BoxGeometry(1.9, 2.0, 0.05), MT.curtain, 0, -1.02, 0, c, 0.008); curtains.push({ c, cl, ph: Math.random() * 6 }); }
      const tag = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.42), new THREE.MeshLambertMaterial({ map: banner('FITTING ROOMS', 'OCCUPIED (BY BANDITS)', 2.6, 0.42, '#f3f2f2', '#201e1d') })); tag.position.set(0, 2.72, 1.08); g.add(tag); g.userData.tag = tag; },
    B => { const r = B.g.userData.rod; r.rotation.z = 0.32; r.position.y = 1.6; for (const c of curtains) { c.cl.scale.y = 0.35; c.cl.position.y = -0.4; c.down = true; } });
  // ---------- decor: clothes rails, counter + register, mannequins ----------
  { for (const d of [7.5, 15.5]) { const [x, z] = W(-9.9, d), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry0 + Math.PI / 2; root.add(g);
      for (const s of [-1.6, 1.6]) M(new THREE.BoxGeometry(0.06, 1.7, 0.06), MT.steel, s, 0.85, 0, g, 0); const r = M(new THREE.CylinderGeometry(0.025, 0.025, 3.3, 6), MT.steel, 0, 1.68, 0, g, 0); r.rotation.z = Math.PI / 2;
      for (let i = 0; i < (touch ? 7 : 11); i++) { const sh = M(new THREE.BoxGeometry(0.06, 0.8, 0.62), T(shirtCols[i % 7]), -1.45 + i * (2.9 / ((touch ? 7 : 11) - 1)), 1.22, 0, g, 0.005); sh.rotation.z = (Math.random() - 0.5) * 0.15; } } }
  { const [x, z] = W(-6.5, DEP - 1.6), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry0; root.add(g); M(new THREE.BoxGeometry(3.4, 1.05, 0.9), MT.ink, 0, 0.52, 0, g, 0.015); M(new THREE.BoxGeometry(3.5, 0.06, 1.0), MT.yellow, 0, 1.07, 0, g, 0);
    M(new THREE.BoxGeometry(0.5, 0.3, 0.4), MT.dark, -0.9, 1.25, 0, g, 0.01); M(new THREE.BoxGeometry(0.5, 0.08, 0.32), MT.red, -0.9, 1.08, 0.3, g, 0).rotation.x = 0.6; for (let i = 0; i < 4; i++) M(new THREE.BoxGeometry(0.42, 0.07, 0.34), T(shirtCols[i]), 0.8, 1.13 + i * 0.075, 0, g, 0.004); }
  const mannequins = []; for (const [a, d, col] of [[-2.7, 7.5, '#ec3013'], [2.7, 7.5, '#2e86b8'], [-8.6, 3.2, '#ffd23a'], [8.8, 16.5, '#3f9a5e']]) { const [x, z] = W(a, d), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry0 + (Math.random() - 0.5) * 0.8; root.add(g);
    M(new THREE.CylinderGeometry(0.3, 0.32, 0.05, 14), MT.dark, 0, 0.03, 0, g, 0); M(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), MT.steel, 0, 0.5, 0, g, 0);
    const legs = M(new THREE.BoxGeometry(0.38, 0.5, 0.22), MT.plastic, 0, 0.98, 0, g, 0.008); const tor = M(new THREE.BoxGeometry(0.52, 0.62, 0.28), T(col), 0, 1.53, 0, g, 0.01); for (const s of [-0.34, 0.34]) { const arm = M(new THREE.BoxGeometry(0.12, 0.55, 0.12), MT.plastic, s, 1.48, 0, g, 0.006); arm.rotation.z = s * 0.25; }
    M(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 8), MT.plastic, 0, 1.9, 0, g, 0); const hd = M(new THREE.SphereGeometry(0.17, 12, 10), MT.plastic, 0, 2.06, 0, g, 0.008); hd.scale.y = 1.25;
    mannequins.push({ g, x, z, fall: 0, down: false, ry: g.rotation.y, dirX: Math.random() < 0.5 ? -1 : 1 }); }
  // ---------- spots ----------
  const posts = [[-5.5, 6], [5.5, 6], [-6, 12], [6, DEP - 3.2]].map(([a, d]) => W(a, d)), ltPost = W(0, 16.3);
  const inner = [x0 + 0.9, x1 - 0.9, Math.min(z0, z1) + 0.9, Math.max(z0, z1) - 0.9];
  // MANNY QUINN: mannequin armour (white plastic plates + shoulder caps), blank egg face mask, a dangling price tag
  const lt = { name: 'MANNY QUINN', look: { outfit: 'vest', torso: ['#201e1d', '#ffd23a', '#f1ece4'], gear: 'laser' }, hp: 190,
    prop(P2) { if (!P2) return; if (P2.head) { const m = new THREE.Group(); m.position.set(0, 0.02, 0.17); P2.head.add(m); const e = M(new THREE.SphereGeometry(0.2, 14, 10), MT.plastic, 0, 0, 0, m, 0.01); e.scale.set(1, 1.15, 0.55);
        const tg = M(new THREE.BoxGeometry(0.12, 0.07, 0.01), MT.yellow, 0.2, -0.05, 0.02, m, 0.004); tg.rotation.z = -0.4; M(new THREE.BoxGeometry(0.01, 0.12, 0.01), MT.ink, 0.15, 0.03, 0.02, m, 0).rotation.z = 0.6; }
      if (P2.body) { M(new THREE.BoxGeometry(0.62, 0.5, 0.12), MT.plastic, 0, 1.05, 0.2, P2.body, 0.01); for (const s of [-0.36, 0.36]) M(new THREE.SphereGeometry(0.16, 10, 8), MT.plastic, s, 1.3, 0, P2.body, 0.01); M(new THREE.BoxGeometry(0.64, 0.06, 0.13), MT.red, 0, 0.86, 0.2, P2.body, 0); } } };
  const lines = ['NO SHOOTING THE MERCH!', 'WHO PUT ME IN A SIZE SMALL?!', 'HEY, THAT ONE\'S MY SIZE!', 'IRON FOX? MORE LIKE IRONED FOX!', 'FITTING ROOM\'S TAKEN, PAL!', 'I\'M NOT A DUMMY! ...OK, A LITTLE.', 'THIS SHIRT SAYS I SURVIVED. FOR NOW!'];
  const sorry = ['SORRY, MA\'AM!', 'MANNEQUIN DOWN!', 'OOPS. NOT A BANDIT.', 'SHE HAD IT COMING.'];
  function reset() { for (const B of bars) { B.g.rotation.set(0, B.ry, 0); B.g.position.set(B.x, 0, B.z); B.g.scale.set(1, 1, 1); }
    for (const q of debris) { root.remove(q.m); q.src.visible = true; } debris.length = 0;
    for (const a of press.g.userData.arms) a.rotation.x = 0; Object.assign(press.g.userData.pd, { visible: false }); press.g.userData.pd.scale.setScalar(0.01); press.g.userData.can.rotation.z = 0; press.g.userData.can.position.y = 0.15;
    const r = booths.g.userData.rod; r.rotation.z = 0; r.position.y = 2.25; for (const c of curtains) { c.cl.scale.y = 1; c.cl.position.y = -1.02; c.down = false; }
    for (const m of mannequins) { m.down = false; m.fall = 0; m.g.rotation.set(0, m.ry, 0); m.g.position.y = 0; } for (const w of wallShirts) w.hit = 0; }
  function tick(dt, P) { root.visible = Math.hypot(P.x - cx, P.z - (z0 + z1) / 2) < 70; if (!root.visible) return;
    for (const t of tubes) { if (t.dead) { t.t -= dt; if (t.t <= 0) { t.t = 2 + Math.random() * 6; t.k = 0.6; } t.k = Math.max(0, t.k - dt * 3); const on = t.k > 0 && Math.random() < 0.6; t.m.color.setHex(on ? 0xfff4e2 : 0x3a3a38); t.s.material.opacity = on ? 0.45 : 0; t.pool.material.opacity = on ? 0.14 : 0; }
      else if (Math.random() < dt * 0.2) { t.m.color.setHex(0x5a5a58); t.s.material.opacity = 0.1; setTimeout(() => { t.m.color.setHex(0xfff4e2); t.s.material.opacity = 0.55; }, 70 + Math.random() * 120); } }
    const pa = lint.geometry.attributes.position, tn = performance.now() / 1000; for (let i = 0; i < pa.count; i++) { let y = pa.getY(i) - dt * 0.07; if (y < 0.3) y = H - 1; pa.setY(i, y); pa.setX(i, pa.getX(i) + Math.sin(tn + i) * dt * 0.05); } pa.needsUpdate = true;
    for (const c of curtains) if (!c.down) { c.ph += dt; c.c.rotation.x = Math.sin(c.ph * 1.3) * 0.035; }
    for (const q of debris) { if (!q.v) continue; q.v.y -= 12 * dt; q.m.position.addScaledVector(q.v, dt); q.m.rotation.x += q.sp * dt; q.m.rotation.z += q.sp * 0.7 * dt; q.v.x *= 1 - dt * 1.2; q.v.z *= 1 - dt * 1.2;
      if (q.m.position.y < q.h) { q.m.position.y = q.h; q.m.rotation.x = 0; q.m.rotation.z = 0; q.v = null; continue; } const p = q.m.position; p.x = Math.max(inner[0], Math.min(inner[1], p.x)); p.z = Math.max(inner[2], Math.min(inner[3], p.z)); }
    const pd = press.g.userData.pd; if (pd.visible && pd.scale.x < 1) pd.scale.setScalar(Math.min(1, pd.scale.x + dt * 0.6));
    for (const m of mannequins) if (m.down && m.fall < 1) { m.fall = Math.min(1, m.fall + dt * 3); const e = m.fall * m.fall; m.g.rotation.set(0, m.ry, 0); m.g.rotateZ(m.dirX * e * 1.52); m.g.position.y = e * 0.12; }
    for (const w of wallShirts) if (w.hit > 0) { w.hit -= dt; w.g.rotation.z = Math.sin(w.hit * 22) * 0.18 * w.hit; } else w.g.rotation.z = 0; }
  const hitTargets = toast => [
    ...mannequins.filter(m => !m.down).map(m => ({ x: m.x, z: m.z, r: 0.6, onHit: () => { if (m.down) return; m.down = true; m.fall = 0; if (Math.random() < 0.6) toast(sorry[Math.floor(Math.random() * sorry.length)], 1.2); } })),
    ...wallShirts.map(w => ({ x: w.x, z: w.z, r: 1.0, onHit: k => { if (k !== 'range') return; w.hit = 0.8; } }))];
  // s156 STORES OPEN (worlds/meru2-outlet-open.js): every tube on, battle damage reset, GRAND REOPENING banner, the fitting rooms bandit-free
  for (const t of tubes) t.dead0 = t.dead; let isOpen = false, banOld = backBan.material.map, banNew = null, tagOld = booths.g.userData.tag.material.map, tagNew = null;
  function setOpen(on) { if (on === isOpen) return; isOpen = on; if (on) reset(); for (const t of tubes) { t.dead = on ? 0 : t.dead0; t.m.color.setHex(t.dead ? 0x3a3a38 : 0xfff4e2); t.s.material.opacity = t.dead ? 0 : 0.55; t.pool.material.opacity = t.dead ? 0 : 0.18; }
    if (on && !banNew) { banNew = banner('GRAND REOPENING', 'PATCH IS BACK · JOKES INCLUDED', 5.6, 1.2, '#201e1d', '#ffd23a'); tagNew = banner('FITTING ROOMS', 'NOW BANDIT-FREE', 2.6, 0.42, '#f3f2f2', '#201e1d'); }
    backBan.material.map = on ? banNew : banOld; backBan.rotation.z = on ? 0 : -0.05; backBan.material.needsUpdate = true; const tg = booths.g.userData.tag; tg.material.map = on ? tagNew : tagOld; tg.material.needsUpdate = true; }
  return { key: 'tees', root, bars, posts, ltPost, inner, lt, lines, reset, tick, hitTargets, setOpen, W, ry0, dir, depth: DEP, H };
}
