// MERU 2.0 — s153b OUTLETS STORE 3: GELATO = MAGPIE'S HIDEOUT (unit 3, south side; worlds/meru2-outlets.js runs the fight). Opens with all 4 keys.
// Wrecked pastel parlour, freezers humming, frost on the floor. Cover (all breakable): the long GELATO CASE across the room (glass shatters, tubs spill),
// 2 CHEST FREEZERS (lid flies, frost cloud), 2 UPRIGHT FREEZERS by the walls (doors burst, frost), a wall of stacked TUB CRATES, the café TABLES.
// Decor you can shoot: the GIANT CONE sign over the counter (spins + drops its scoop), 3 hanging FLAVOUR BOARDS (swing). Melting puddles grow.
// Boss: MAGPIE (white suit + white fedora, gold eyes), 420 HP, bursts of 3. Half HP: "YOU'RE MELTING MY BUSINESS!" + 2 more bandits burst out of the back.
export function buildGelato({ THREE, M, toon, scene, b, touch }) {
  const [x0, x1, z0, z1] = b.f, dir = b.face === 'N' ? 1 : -1, ZF = b.face === 'N' ? z0 : z1, cx = (x0 + x1) / 2, H = (b.sty && b.sty.h) || 7, DEP = Math.abs(z1 - z0);
  const W = (a, d) => [cx + a, ZF + dir * d];
  const root = new THREE.Group(); root.name = 'outletGelato'; scene.add(root);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const T = h => toon(h), MT = { ink: T('#201e1d'), steel: T('#b9bec4'), dark: T('#3d3b3a'), white: T('#f3f2f2'), cream: T('#f1e6cf'), pink: T('#f2a7b8'), mint: T('#a8e0c8'), lemon: T('#ffe27a'), choc: T('#6b4430'), straw: T('#e85a70'), pist: T('#b7d27a'), red: T('#c8262c'), yellow: T('#ffd23a'), cone: T('#d9a45a'), wood: T('#a07a52') };
  const flav = [MT.pink, MT.mint, MT.lemon, MT.choc, MT.straw, MT.pist, MT.cream];
  const ry0 = dir > 0 ? 0 : Math.PI;
  // floor: pink + white checks, scuffed, sticky
  { const t = CT(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#e9d3d6' : '#f3f2f2'; g.fillRect(i * 32, j * 32, 32, 32); }
      for (let i = 0; i < 700; i++) { g.fillStyle = Math.random() < 0.6 ? 'rgba(60,40,40,0.1)' : 'rgba(255,255,255,0.1)'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 2); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); const fl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 - 0.8, DEP - 0.8), new THREE.MeshLambertMaterial({ map: t })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0.035, (z0 + z1) / 2); root.add(fl); }
  const glowT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  // cool tubes (1 dead) + glow pools
  const tubes = []; for (const [a, d, dead] of [[-5, 5, 0], [5, 5, 0], [-5, 12, 0], [5, 12, 1], [-5, 18, 0], [5, 18, 0]]) { const [x, z] = W(a, d), m = new THREE.MeshBasicMaterial({ color: dead ? 0x3a3a38 : 0xeafcff }); const tb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.18), m); tb.position.set(x, H - 0.55, z); tb.rotation.y = ry0; root.add(tb);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xdaf6ff, transparent: true, depthWrite: false, opacity: dead ? 0 : 0.5, blending: THREE.AdditiveBlending })); s.position.set(x, H - 0.7, z); s.scale.set(4, 1.6, 1); root.add(s);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), new THREE.MeshBasicMaterial({ map: glowT, color: 0xcff2ff, transparent: true, depthWrite: false, opacity: dead ? 0 : 0.16, blending: THREE.AdditiveBlending })); pool.rotation.x = -Math.PI / 2; pool.position.set(x, 0.05, z); root.add(pool);
    tubes.push({ m, s, pool, dead, t: Math.random() * 5, k: 1 }); }
  // frost puffs (cold fog sprites) + sparkle pool
  const fogT = CT(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(240,250,255,0.9)'); r.addColorStop(1, 'rgba(240,250,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const FOG = [], NF = touch ? 14 : 28; for (let i = 0; i < NF; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: fogT, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; root.add(s); FOG.push({ s, t: 0, v: new THREE.Vector3() }); }
  let fI = 0; const frost = (x, y, z, n = 6) => { for (let i = 0; i < n; i++) { const f = FOG[fI++ % NF]; f.s.position.set(x + (Math.random() - 0.5) * 0.8, y, z + (Math.random() - 0.5) * 0.8); f.v.set((Math.random() - 0.5) * 1.2, 0.2 + Math.random() * 0.4, (Math.random() - 0.5) * 1.2); f.t = 1.6 + Math.random(); f.s.visible = true; f.s.scale.setScalar(0.6); } };
  const SP = [], spG = new THREE.BoxGeometry(0.05, 0.05, 0.05), NS = touch ? 20 : 40;
  for (let i = 0; i < NS; i++) { const m = new THREE.Mesh(spG, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })); m.visible = false; root.add(m); SP.push({ m, v: new THREE.Vector3(), t: 0 }); }
  let spI = 0; const spark = (x, y, z, n = 8, col = 0xdff6ff) => { for (let i = 0; i < n; i++) { const s = SP[spI++ % NS]; s.m.position.set(x, y, z); s.m.material.color.setHex(Math.random() < 0.4 ? 0xffffff : col); s.v.set((Math.random() - 0.5) * 4, 1 + Math.random() * 2.5, (Math.random() - 0.5) * 4); s.t = 0.5 + Math.random() * 0.4; s.m.visible = true; } };
  const banner = (txt, sub, w, h, col, bg) => CT(512, Math.round(512 * h / w), (g, cw, ch) => { g.fillStyle = bg; g.fillRect(0, 0, cw, ch); g.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 40; i++) g.fillRect(Math.random() * cw, Math.random() * ch, 30, 2); g.fillStyle = col; g.font = '900 ' + Math.round(ch * 0.42) + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 18, ch * 0.4, cw - 36); if (sub) { g.font = '800 ' + Math.round(ch * 0.2) + 'px Archivo, sans-serif'; g.fillText(sub, 20, ch * 0.78, cw - 40); } });
  const sign = (txt, sub, w, h, col, bg, x, y, z, ry, rz = 0) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: banner(txt, sub, w, h, col, bg) })); p.position.set(x, y, z); p.rotation.set(0, ry, rz); root.add(p); return p; };
  { const [x, z] = W(0, 0.4); sign('FOX GELATO', 'SCOOPED WITH LOVE', 7, 1.1, '#201e1d', '#f2a7b8', x, 5.2, z, ry0); }
  const closedSign = (() => { const [x, z] = W(-10.92, 12); return sign('CLOSED FOR A', '"PRIVATE MEETING" · MGMT', 4.6, 1.0, '#f3f2f2', '#201e1d', x, 4.4, z, Math.PI / 2, 0.05); })();
  // ---------- breakable cover ----------
  const bars = [], debris = [];
  const mk = (kind, a, d, w, dd, hp, build, onBreak, ry = ry0) => { const [x, z] = W(a, d), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); build(g); const B = { g, x, z, w, d: dd, ry, hp, kind, onBreak: () => onBreak(B) }; bars.push(B); return B; };
  const fling = (list, up = 3, out = 5) => { for (const m of list) { const w = new THREE.Vector3(); m.getWorldPosition(w); const c = m.clone(); c.position.copy(w); c.rotation.set(0, Math.random() * 3, 0); root.add(c); m.visible = false;
      debris.push({ m: c, src: m, v: new THREE.Vector3((Math.random() - 0.5) * out, up * (0.6 + Math.random() * 0.8), (Math.random() - 0.5) * out), sp: (Math.random() - 0.5) * 8, h: ((m.geometry && m.geometry.parameters.height) || 0.2) / 2 }); } };
  const glassM = new THREE.MeshBasicMaterial({ color: 0xcfefff, transparent: true, opacity: 0.32, depthWrite: false });
  // the long gelato case (two halves so it breaks in pieces) — the counter line across the back third
  const caseHalf = a => mk('case', a, 15.5, 6.4, 1.3, 100, g => { M(new THREE.BoxGeometry(6.4, 0.95, 1.2), MT.white, 0, 0.48, 0, g, 0.015); M(new THREE.BoxGeometry(6.5, 0.08, 1.3), MT.pink, 0, 0.98, 0, g, 0);
      const gl = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.5, 0.9), glassM); gl.position.set(0, 1.27, 0.1); gl.rotation.x = -0.18; g.add(gl); g.userData.gl = gl;
      g.userData.s = []; for (let i = 0; i < 8; i++) { const tub = M(new THREE.BoxGeometry(0.66, 0.16, 0.5), flav[(i + (a > 0 ? 3 : 0)) % 7], -2.75 + i * 0.79, 1.08, 0.05, g, 0.005); const sc = M(new THREE.SphereGeometry(0.2, 10, 8), tub.material, -2.75 + i * 0.79, 1.18, 0.05, g, 0.004); sc.scale.y = 0.6; g.userData.s.push(tub, sc); } },
    B => { B.g.userData.gl.visible = false; spark(B.x, 1.3, B.z, 14); fling(B.g.userData.s.filter((_, i) => i % 2), 3, 4); B.g.rotation.set(0, B.ry, 0.06); frost(B.x, 1.1, B.z, 4); B.melt = 1; });
  const cases = [caseHalf(-3.3), caseHalf(3.3)];
  // chest freezers mid-floor: lid flies, frost cloud
  const chest = (a, d) => mk('chest', a, d, 2.0, 1.0, 80, g => { M(new THREE.BoxGeometry(2.0, 0.9, 1.0), MT.white, 0, 0.45, 0, g, 0.015); M(new THREE.BoxGeometry(2.0, 0.08, 0.04), MT.dark, 0, 0.62, 0.51, g, 0);
      const lid = M(new THREE.BoxGeometry(2.0, 0.1, 1.0), MT.steel, 0, 0.95, 0, g, 0.01); g.userData.s = [lid]; const st = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.34), new THREE.MeshLambertMaterial({ map: banner('KEEP FROZEN', 'BOSS\'S STASH', 1.3, 0.34, '#201e1d', '#a8e0c8') })); st.position.set(0, 0.42, 0.51); g.add(st); },
    B => { fling(B.g.userData.s, 5, 3); frost(B.x, 1, B.z, 8); });
  chest(-6, 9); chest(6, 9);
  // upright freezers on the walls: doors burst open
  const upright = (a, d, ry) => mk('upright', a, d, 1.0, 1.4, 90, g => { M(new THREE.BoxGeometry(0.9, 2.3, 1.3), MT.white, 0, 1.15, 0, g, 0.015); const hg = new THREE.Group(); hg.position.set(0.47, 0, 0.62); g.add(hg); g.userData.hg = hg;
      const dr = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.1, 1.2), glassM); dr.position.set(0, 1.15, -0.62); hg.add(dr); for (let k = 0; k < 4; k++) for (let i = 0; i < 3; i++) M(new THREE.BoxGeometry(0.4, 0.3, 0.3), flav[(k + i) % 7], 0.05, 0.4 + k * 0.5, -0.4 + i * 0.4, g, 0.004); },
    B => { B.g.userData.hg.rotation.y = 1.7; frost(B.x, 1.4, B.z, 6); spark(B.x, 1.5, B.z, 6); }, ry);
  upright(-10, 6.5, ry0 + Math.PI / 2); upright(10, 6.5, ry0 - Math.PI / 2);
  // stacked tub crates (behind the counter, west): cold storage
  mk('crates', -7.5, DEP - 2.4, 2.6, 1.4, 90, g => { g.userData.s = []; for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) g.userData.s.push(M(new THREE.CylinderGeometry(0.36, 0.36, 0.6, 12), flav[(i * 3 + k) % 7], -0.85 + i * 0.85, 0.3 + k * 0.62, (k % 2) * 0.15, g, 0.008)); },
    B => { fling(B.g.userData.s.slice(3), 2, 4); });
  // café tables (2 by the door): chairs + table tip
  const cafe = (a, d) => mk('cafe', a, d, 1.6, 1.6, 45, g => { M(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 16), MT.pink, 0, 0.78, 0, g, 0.01); M(new THREE.CylinderGeometry(0.05, 0.05, 0.75, 6), MT.steel, 0, 0.39, 0, g, 0); M(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 12), MT.steel, 0, 0.02, 0, g, 0);
      g.userData.s = []; for (const s of [-1, 1]) { const ch = new THREE.Group(); ch.position.set(s * 0.8, 0, 0); g.add(ch); M(new THREE.BoxGeometry(0.42, 0.04, 0.42), MT.mint, 0, 0.46, 0, ch, 0.006); M(new THREE.BoxGeometry(0.04, 0.5, 0.4), MT.steel, s * 0.2, 0.72, 0, ch, 0); for (const q of [-0.17, 0.17]) M(new THREE.BoxGeometry(0.03, 0.45, 0.03), MT.steel, q, 0.22, q, ch, 0); g.userData.s.push(ch); }
      const cup = M(new THREE.CylinderGeometry(0.1, 0.07, 0.14, 10), MT.white, 0.15, 0.88, 0.1, g, 0.004); g.userData.s.push(cup); },
    B => { fling(B.g.userData.s, 3, 4); B.g.rotation.set(0, B.ry, 1.4); B.g.position.y = 0.4; });
  cafe(-5.5, 4.2); cafe(5.5, 4.2);
  // ---------- decor: back counter + machines, giant cone, flavour boards, puddles ----------
  { const [x, z] = W(2, DEP - 0.9), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry0 + Math.PI; root.add(g); M(new THREE.BoxGeometry(8, 0.95, 0.7), MT.pink, 0, 0.48, 0, g, 0.012); M(new THREE.BoxGeometry(8.1, 0.06, 0.76), MT.white, 0, 0.97, 0, g, 0);
    for (const s of [-2.6, 0.2]) { M(new THREE.BoxGeometry(1.1, 1.1, 0.6), MT.steel, s, 1.55, 0, g, 0.01); M(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8), MT.dark, s, 1.0, 0.2, g, 0); }
    M(new THREE.BoxGeometry(0.5, 0.35, 0.4), MT.dark, 2.8, 1.18, 0, g, 0.008); for (let i = 0; i < 5; i++) { const c = M(new THREE.ConeGeometry(0.08, 0.22, 8), MT.cone, 1.6 + i * 0.16, 1.1, 0.15, g, 0); c.rotation.x = Math.PI; } }
  const giant = (() => { const [x, z] = W(0, DEP - 0.5), g = new THREE.Group(); g.position.set(x, H - 2.6, z + dir * -0.4); root.add(g); const cn = M(new THREE.ConeGeometry(0.5, 1.4, 12), MT.cone, 0, 0, 0, g, 0.012); cn.rotation.x = Math.PI;
    const sc = M(new THREE.SphereGeometry(0.55, 14, 10), MT.pink, 0, 0.82, 0, g, 0.012); const sc2 = M(new THREE.SphereGeometry(0.45, 14, 10), MT.mint, 0.05, 1.45, 0, g, 0.01);
    return { g, x, z, sc2, sc2y: 1.45, spin: 0, drop: 0, vy: 0, gone: false }; })();
  const boards = []; for (const [a, name, c] of [[-6, 'PISTACHIO', '#b7d27a'], [-3, 'STRAWBERRY', '#e85a70'], [6.2, 'MINT CHIP', '#a8e0c8']]) { const [x, z] = W(a, DEP - 0.6), g = new THREE.Group(); g.position.set(x, 3.6, z); g.rotation.y = ry0 + Math.PI; root.add(g);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.7), new THREE.MeshLambertMaterial({ map: banner(name, 'SOLD OUT · BANDITS ATE IT', 2.2, 0.7, '#201e1d', c) })); p.position.y = -0.4; g.add(p); boards.push({ g, x, z, hit: 0, p, name, c }); }
  const puddles = []; for (const [a, d, c] of [[-2, 12, '#f2a7b8'], [3, 11, '#a8e0c8'], [-8, 15, '#6b4430'], [7.5, 18, '#ffe27a']]) { const [x, z] = W(a, d), m = new THREE.Mesh(new THREE.CircleGeometry(0.7, 16), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.8, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.045, z); m.scale.setScalar(0.4 + Math.random() * 0.4); root.add(m); puddles.push({ m, s0: m.scale.x }); }
  // ---------- spots: Magpie behind the counter line; the shooters at the freezers ----------
  const posts = [[-6, 10.6], [6, 10.6], [-10, 8.2], [10, 8.2]].map(([a, d]) => W(a, d)), ltPost = W(0, 17.6);
  const inner = [x0 + 0.9, x1 - 0.9, Math.min(z0, z1) + 0.9, Math.max(z0, z1) - 0.9];
  const lt = { name: 'MAGPIE', hp: 420, scale: 1.12, look: { outfit: 'suit', torso: ['#e8e6e1', '#1d1d22', '#ec3013'], look: { fur: '#3a3d44', furDark: '#1f2126', muzzle: '#f3f2f2', chin: '#f3f2f2' }, eyes: ['#ffd23a', '#ffd23a'], gear: 'laser' },
    prop(P2) { if (!P2 || !P2.head) return; const h = new THREE.Group(); h.position.set(0, 0.3, -0.02); P2.head.add(h); M(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 18), MT.white, 0, 0, 0, h, 0.008); M(new THREE.CylinderGeometry(0.2, 0.23, 0.24, 14), MT.white, 0, 0.13, 0, h, 0.008); M(new THREE.CylinderGeometry(0.235, 0.235, 0.06, 14), MT.ink, 0, 0.04, 0, h, 0); } };
  const lines = ['MAGPIE: YOU BROKE MY KEYS? I MEAN... MY GUYS?', 'MAGPIE: THIS IS A PRIVATE MEETING!', 'BANDIT: BOSS, THE MINT CHIP IS MELTING!', 'MAGPIE: NOBODY TOUCHES THE PISTACHIO.', 'BANDIT: IT\'S COLD BACK HERE, BOSS!', 'MAGPIE: ONE SCOOP OR TWO? TWO LASERS!'];
  function half(toast) { toast('MAGPIE: YOU\'RE MELTING MY BUSINESS! BOYS, OUT HERE!', 3); for (const c of cases) frost(c.x, 1, c.z, 3); }
  function reset() { for (const B of bars) { B.g.rotation.set(0, B.ry, 0); B.g.position.set(B.x, 0, B.z); B.g.scale.set(1, 1, 1); B.melt = 0; if (B.g.userData.gl) B.g.userData.gl.visible = true; if (B.g.userData.hg) B.g.userData.hg.rotation.y = 0; }
    for (const q of debris) { root.remove(q.m); q.src.visible = true; } debris.length = 0; for (const p of puddles) p.m.scale.setScalar(p.s0);
    Object.assign(giant, { spin: 0, drop: 0, vy: 0, gone: false }); giant.sc2.position.set(0.05, giant.sc2y, 0); giant.g.rotation.set(0, 0, 0); for (const bd of boards) bd.hit = 0; }
  let fogT0 = 0;
  function tick(dt, P) { root.visible = Math.hypot(P.x - cx, P.z - (z0 + z1) / 2) < 70; if (!root.visible) return;
    for (const t of tubes) { if (t.dead) { t.t -= dt; if (t.t <= 0) { t.t = 2 + Math.random() * 6; t.k = 0.6; } t.k = Math.max(0, t.k - dt * 3); const on = t.k > 0 && Math.random() < 0.6; t.m.color.setHex(on ? 0xeafcff : 0x3a3a38); t.s.material.opacity = on ? 0.45 : 0; t.pool.material.opacity = on ? 0.14 : 0; } }
    fogT0 -= dt; if (fogT0 <= 0) { fogT0 = touch ? 1.6 : 0.9; const B2 = bars.filter(B => (B.kind === 'chest' || B.kind === 'upright') && !B.broken); if (B2.length) { const B = B2[Math.floor(Math.random() * B2.length)]; frost(B.x, 0.95, B.z, 1); } }
    for (const f of FOG) { if (f.t <= 0) continue; f.t -= dt; f.s.position.addScaledVector(f.v, dt); f.v.multiplyScalar(1 - dt * 0.8); f.s.scale.setScalar(f.s.scale.x + dt * 0.9); f.s.material.opacity = Math.min(0.45, f.t * 0.3); if (f.t <= 0) f.s.visible = false; }
    for (const s of SP) { if (s.t <= 0) continue; s.t -= dt; s.v.y -= 9 * dt; s.m.position.addScaledVector(s.v, dt); if (s.m.position.y < 0.04) { s.m.position.y = 0.04; s.v.multiplyScalar(0.3); } s.m.material.opacity = Math.max(0, s.t / 0.6); if (s.t <= 0) s.m.visible = false; }
    if (!isOpen) for (const p of puddles) if (p.m.scale.x < p.s0 * 2.2) p.m.scale.setScalar(p.m.scale.x + dt * (cases.some(c => c.broken) ? 0.04 : 0.006));
    if (giant.spin > 0) { giant.spin -= dt; giant.g.rotation.y += dt * 12 * giant.spin; }
    if (giant.drop === 1) { giant.vy -= 12 * dt; giant.sc2.position.y += giant.vy * dt; const floorY = -(H - 2.6) + 0.35; if (giant.sc2.position.y <= floorY) { giant.sc2.position.y = floorY; giant.drop = 2; const w = new THREE.Vector3(); giant.sc2.getWorldPosition(w); spark(w.x, 0.3, w.z, 10, 0xa8e0c8); } }
    for (const bd of boards) if (bd.hit > 0) { bd.hit -= dt; bd.g.rotation.z = Math.sin(bd.hit * 20) * 0.2 * bd.hit; } else bd.g.rotation.z = 0;
    for (const q of debris) { if (!q.v) continue; q.v.y -= 12 * dt; q.m.position.addScaledVector(q.v, dt); q.m.rotation.x += q.sp * dt; q.m.rotation.z += q.sp * 0.6 * dt; q.v.x *= 1 - dt * 1.2; q.v.z *= 1 - dt * 1.2;
      if (q.m.position.y < q.h) { q.m.position.y = q.h; q.m.rotation.x = 0; q.m.rotation.z = 0; q.v = null; continue; } const p = q.m.position; p.x = Math.max(inner[0], Math.min(inner[1], p.x)); p.z = Math.max(inner[2], Math.min(inner[3], p.z)); } }
  // s159 STORES OPEN: Magpie scoops as payback. Damage reset, every tube on, puddles mopped, boards BACK IN STOCK, the side notice → UNDER NEW MANAGEMENT
  let isOpen = false, closedOld = null, closedNew = null;
  function setOpen(on) { if (on === isOpen) return; isOpen = on; if (on) reset(); closedOld = closedOld || closedSign.material.map;
    if (on && !closedNew) { closedNew = banner('UNDER NEW MANAGEMENT', 'COURT ORDER \u00b7 MAGPIE SCOOPS', 4.6, 1.0, '#201e1d', '#f2a7b8'); for (const bd of boards) bd.nw = banner(bd.name, 'BACK IN STOCK \u00b7 SCOOP AWAY', 2.2, 0.7, '#201e1d', bd.c); }
    closedSign.material.map = on ? closedNew : closedOld; closedSign.rotation.z = on ? 0 : 0.05; closedSign.material.needsUpdate = true;
    for (const bd of boards) { bd.old = bd.old || bd.p.material.map; bd.p.material.map = on ? bd.nw : bd.old; bd.p.material.needsUpdate = true; }
    for (const t of tubes) { if (t.dead0 == null) t.dead0 = t.dead; t.dead = on ? 0 : t.dead0; t.m.color.setHex(t.dead ? 0x3a3a38 : 0xeafcff); t.s.material.opacity = t.dead ? 0 : 0.5; t.pool.material.opacity = t.dead ? 0 : 0.16; }
    for (const p of puddles) p.m.visible = !on; }
  const hitTargets = toast => [
    { x: giant.x, z: giant.z, r: 1.2, onHit: k => { if (k !== 'range') return; giant.spin = 1; if (!giant.drop) { giant.drop = 1; giant.vy = 0; toast('SCOOP DROP!', 1.2); } } },
    ...boards.map(bd => ({ x: bd.x, z: bd.z, r: 1.1, onHit: k => { if (k !== 'range') return; bd.hit = 0.8; } }))];
  return { key: 'gelato', root, bars, posts, ltPost, inner, lt, lines, reset, tick, hitTargets, half, boss: true, setOpen, W, ry0, dir, depth: DEP, H };
}
