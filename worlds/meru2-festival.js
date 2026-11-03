// MERU 2.0 — ARENA PATH FESTIVAL ROW (Ben): six carnival games in the three Arena Path clearings, small games near town, big ones by the arena.
// Clearing 1 (x 160..200): RING TOSS (N) · BALLOON POP (S)   Clearing 2 (x 240..280): WATER-GUN HORSE RACE (N) · SHOOTING GALLERY (S)
// Clearing 3 (x 320..360): TUG OF WAR (N) · DUNK TANK (S). Each booth is modelled on its game's own 3D booth (Balloon Pop uses the game's
// buildBooth directly; the others follow their game's geometry + colours), with its keeper fox (TALK) and a PLAY spot at the counter.
// PLAY opens the game itself (?embed=1) for now. NEXT (Ben chose "play right there on the path"): port each game's play into this scene.
// Night: festoon string bulbs across every clearing + chasing marquee bulbs round every sign. Bulbs = 1 instanced draw, glow = 1 draw.
import { PLAYER_MALE, PLAYER_FEMALE } from '../fox-kit.js?v=s673';
import { applyD, neutralD, lifeD } from '../engine/fox-poses.js?v=s648k';   // s625 jointed dunk-seat taunter
import { buildRides } from './meru2-rides.js?v=s645';
import { buildBand } from './meru2-band.js?v=s654';
import { makeNightLit } from './meru2-nightlit.js';
import { buildBooth as balloonBooth, THEMES as BP_THEMES, slotXY, TYPES as BP_TYPES } from '../minigames/carnival/balloon-pop.js';

export function buildFestival({ THREE, scene, M, toon, grad, kit, cols, touch, L, save }) {
  const root = new THREE.Group(); root.name = 'meru2Festival'; scene.add(root);
  const CT = (w, h, fn, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
  const tc = c => typeof c === 'string' ? toon(c) : c;
  const B = (w, h, d, col, x, y, z, par, o = 0.015) => M(new THREE.BoxGeometry(w, h, d), tc(col), x, y, z, par, o);
  const C = (r, h, col, x, y, z, par, o = 0.012, n = 12) => M(new THREE.CylinderGeometry(r, r, h, n), tc(col), x, y, z, par, o, r);
  const S = (r, col, x, y, z, par, o = 0.01) => M(new THREE.SphereGeometry(r, 12, 10), tc(col), x, y, z, par, o, r);
  const stripes = (a, b, n, rep) => CT(256, 64, (g, w, h) => { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * w / n, 0, w / n + 1, h); } }, rep);
  const FONT = '"Archivo", "Arial Black", Arial, sans-serif';
  const signTex = (txt, bg, fg, edge, w = 1024, h = 220) => CT(w, h, g => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = edge; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20);
    let fs = 128; g.font = `italic 900 ${fs}px ${FONT}`; while (g.measureText(txt).width > w - 90 && fs > 40) { fs -= 4; g.font = `italic 900 ${fs}px ${FONT}`; }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 18; g.strokeStyle = '#000'; g.strokeText(txt, w / 2, h / 2 + 6); g.fillStyle = fg; g.fillText(txt, w / 2, h / 2 + 4); });
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const spots = [], TALK = {}, talkers = [], keepers = [], anim = [], bulbs = [], booths = [];
  const BULB = ['#ffd23a', '#ff6b6b', '#7dd3fc', '#86efac', '#fff4d0'];
  const v3 = new THREE.Vector3();
  // a booth group at (X, Z) facing the road: ry 0 faces +z (north side of the road), PI faces -z (south side). Local +z = the player's side.
  const NL = makeNightLit(THREE);   // s35: night lighting (booth insides glow, pools, spot beams on the action)
  function place(X, Z, ry) { const g = new THREE.Group(); g.position.set(X, 0, Z); g.rotation.y = ry; root.add(g); g.updateMatrixWorld(); booths.push(g); return g; }
  const W = (g, lx, lz) => { v3.set(lx, 0, lz); g.localToWorld(v3); return [v3.x, v3.z]; };
  const footprint = (g, x0, x1, z0, z1) => { const a = W(g, x0, z0), b = W(g, x1, z1); box(Math.min(a[0], b[0]), Math.max(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[1], b[1])); };
  const bulbLocal = (g, pts, marq) => { g.updateMatrixWorld(true); pts.forEach(([x, y, z], i) => { v3.set(x, y, z); g.localToWorld(v3); bulbs.push({ p: v3.clone(), col: BULB[i % BULB.length], marq, ph: i, g }); }); };
  const signFrame = (g, cx, cy, z, w, h, step = 0.22) => { const p = []; for (let x = -w / 2; x <= w / 2 + 1e-3; x += step) { p.push([cx + x, cy + h / 2 + 0.06, z]); p.push([cx + x, cy - h / 2 - 0.06, z]); } for (let y = -h / 2 + step; y < h / 2; y += step) { p.push([cx - w / 2 - 0.06, cy + y, z]); p.push([cx + w / 2 + 0.06, cy + y, z]); } bulbLocal(g, p, true); };
  // 4-SIDED SIGN (Ben): a lit sign box on a pole above the booth roof, the name on all four faces, so it reads from any direction
  const signMats = new Map();
  function signTower(g, title, { bg = '#1a1220', fg = '#ffd23a', edge = '#e6b45a', fw = 3.0, fh = 1.1, x = 0, y = 5, z = -1.4, pole = 1.2 } = {}) {
    const k = title + bg + fg; if (!signMats.has(k)) signMats.set(k, new THREE.MeshBasicMaterial({ map: signTex(title, bg, fg, edge, 1024, 284) }));
    const T = new THREE.Group(); T.position.set(x, y, z); g.add(T); B(fw + 0.08, fh + 0.12, fw + 0.08, '#201e1d', 0, 0, 0, T, 0.02); B(fw + 0.24, 0.08, fw + 0.24, edge, 0, fh / 2 + 0.1, 0, T, 0.01); B(fw + 0.24, 0.08, fw + 0.24, edge, 0, -fh / 2 - 0.1, 0, T, 0.01);
    C(0.07, pole, '#201e1d', 0, -fh / 2 - 0.1 - pole / 2, 0, T, 0.008, 8);
    const pts = [];
    for (let f = 0; f < 4; f++) { const a = f * Math.PI / 2, nx = Math.sin(a), nz = Math.cos(a), d = fw / 2 + 0.05; const p = new THREE.Mesh(new THREE.PlaneGeometry(fw, fh), signMats.get(k)); p.position.set(nx * d, 0, nz * d); p.rotation.y = a; T.add(p);
      for (let u = -fw / 2 + 0.11; u <= fw / 2 - 0.1; u += 0.22) for (const yy of [fh / 2 + 0.17, -fh / 2 - 0.17]) pts.push([nx * (d + 0.08) + Math.cos(a) * u, y + yy, nz * (d + 0.08) - Math.sin(a) * u]); }
    bulbLocal(g, pts.map(([px, py, pz]) => [px + x, py, pz + z]), true); return T; }
  function keeper(g, key, name, role, lines, opt, lx, lz, lry = 0, r = 2.6) {
    const f = kit.makeFox({ key, crest: '', gear: 'none', mood: 'happy', outfit: 'vest', ...opt }); const P = f.userData.P; if (P && P.sword) P.sword.visible = false; if (P && P.gun) P.gun.visible = false;
    const [x, z] = W(g, lx, lz); f.position.set(x, 0, z); f.rotation.y = g.rotation.y + lry; root.add(f); ring(x, z, 0.45);
    TALK[key] = { name, role, lines: lines.map(text => ({ who: 'npc', text })) }; talkers.push({ key, obj: f, ry: f.rotation.y, r }); keepers.push(f); return f; }
  function play(g, label, url, lx = 0, lz = 1.4, r = 1.7) { const [x, z] = W(g, lx, lz); spots.push({ key: 'fest:' + label, x, z, r, prompt: 'PLAY \u00b7 ' + label, play: { label, url } }); }

  // the shared stall: striped counter, posts, back + side walls, sloped striped roof, scalloped valance, sign with a marquee
  function stall(g, { w = 4.4, d = 3.2, a, b, trim, wall, title, signBg = '#1a1220', signFg = '#ffd23a', h = 3.5, fw }) {
    const ctr = B(w, 1.0, 0.6, new THREE.MeshToonMaterial({ map: stripes(a, b, 14, [Math.round(w), 1]), gradientMap: grad }), 0, 0.5, 0.3, g, 0.02);
    B(w + 0.2, 0.08, 0.76, '#c89a62', 0, 1.04, 0.3, g);
    for (const x of [-w / 2, w / 2]) for (const z of [0.58, -d]) C(0.07, h, trim, x, h / 2, z, g, 0.01, 10);
    for (const x of [-w / 2, w / 2]) B(0.06, 1.3, d, new THREE.MeshToonMaterial({ map: stripes(b, a, 10, [Math.round(d), 1]), gradientMap: grad }), x, 0.65, -d / 2 + 0.3, g, 0.01);
    B(w, h, 0.08, wall ? wall : new THREE.MeshToonMaterial({ map: stripes(a, b, 16, [Math.round(w / 2), 1]), gradientMap: grad }), 0, h / 2, -d, g, 0);
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.3, d + 0.9), new THREE.MeshToonMaterial({ map: stripes(a, b, 16, [Math.round(w / 2), 1]), gradientMap: grad, side: THREE.DoubleSide })); roof.rotation.x = -Math.PI / 2 + 0.12; roof.position.set(0, h + 0.08, -d / 2 + 0.2); g.add(roof);
    const val = CT(1024, 160, (c, cw) => { const n = 16, sw = cw / n; for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? b : a; c.fillRect(i * sw, 0, sw + 1, 100); c.beginPath(); c.arc(i * sw + sw / 2, 100, sw / 2, 0, Math.PI); c.fill(); } c.fillStyle = trim; c.fillRect(0, 0, cw, 12); });
    const vm = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.3, 0.7), new THREE.MeshToonMaterial({ map: val, gradientMap: grad, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); vm.position.set(0, h - 0.12, 0.66); g.add(vm);
    signTower(g, title, { bg: signBg, fg: signFg, edge: trim, fw: Math.min(3.6, Math.max(3.0, w * 0.5)), y: h + 1.0, z: -d / 2 + 0.45, pole: 0.5 });
    const vb = []; for (let i = 0; i <= 18; i++) { const u = i / 18; vb.push([-w / 2 + u * w, h + 0.24 - 0.08 * Math.sin(u * Math.PI * 4) ** 2, 0.7]); } bulbLocal(g, vb, false);
    footprint(g, -w / 2 - 0.1, w / 2 + 0.1, -d - 0.1, 0.62); return ctr; }
  const plush = (g, x, y, z, c, s = 1) => { const p = new THREE.Group(); p.position.set(x, y, z); p.scale.setScalar(s); g.add(p); S(0.2, c, 0, 0.2, 0, p, 0.01); S(0.14, c, 0, 0.46, 0, p, 0.008); for (const e of [-1, 1]) M(new THREE.ConeGeometry(0.05, 0.12, 6), toon(c), e * 0.08, 0.62, 0, p, 0); S(0.04, '#ffffff', 0, 0.42, 0.12, p, 0); return p; };
  const prizeShelf = (g, x, z, w, ry, cs) => { const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = ry; g.add(s); for (const y of [1.4, 2.1]) B(w, 0.06, 0.4, '#7a4e32', 0, y, 0, s, 0.01); cs.forEach((c, i) => plush(s, -w / 2 + 0.3 + (i % 3) * (w - 0.6) / 2, i < 3 ? 1.43 : 2.13, 0, c, 0.8)); };

  // ================= CLEARING 1 · RING TOSS (Fox Ring Toss: pegs over three rounds, wind, a spinning gold peg) =================
  { const g = place(183, -13, 0); stall(g, { a: '#c42d3c', b: '#f3ecdf', trim: '#e6b45a', title: 'RING TOSS' });
    const felt = toon('#1f6b3a'), peg = toon('#f3ecdf'), pegTip = toon('#c42d3c');
    for (let t = 0; t < 3; t++) { const z = -1.0 - t * 0.6, y = 0.75 + t * 0.32; B(3.6, y, 0.6, t % 2 ? '#2a7d46' : felt, 0, y / 2, z, g, 0.012);
      for (let i = 0; i < 5; i++) { const x = -1.44 + i * 0.72; if (t === 1 && i === 2) continue; C(0.035, 0.36, peg, x, y + 0.18, z, g, 0.006, 8); C(0.045, 0.05, pegTip, x, y + 0.38, z, g, 0, 8); } }
    const turn = new THREE.Group(); turn.position.set(0, 1.07 + 0.02, -1.6); g.add(turn); C(0.24, 0.06, '#e6b45a', 0, 0, 0, turn, 0.008, 20); C(0.045, 0.5, '#ffd23a', 0, 0.28, 0, turn, 0.008, 10); S(0.07, '#ffd23a', 0, 0.56, 0, turn, 0.006);
    for (let k = 0; k < 4; k++) { const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), new THREE.MeshBasicMaterial({ color: 0xfff1a0 })); st.position.set(Math.cos(k * 1.57) * 0.2, 0.06, Math.sin(k * 1.57) * 0.2); turn.add(st); }
    anim.push(dt => { turn.rotation.y += dt * 1.6; });
    const ringG = new THREE.TorusGeometry(0.13, 0.025, 8, 20); ['#ec3013', '#38bdf8', '#ffd23a', '#22c55e', '#a78bfa', '#f472b6'].forEach((c, i) => { const r = M(ringG, toon(c), -1.6 + i * 0.13, 1.1, 0.52, g, 0); r.rotation.y = 0.3; });
    for (const x of [-1.2, 1.2]) { const r = M(ringG, toon('#ffd23a'), x, 0.72, 0.62, g, 0); r.rotation.x = 0.0; }
    prizeShelf(g, 0, -3.05, 3.6, 0, ['#f472b6', '#38bdf8', '#ffd23a', '#22c55e', '#a78bfa', '#f2741f']);
    keeper(g, 'loop', 'LOOP', 'Ring toss barker (DRAFT)', ['Step right up! Three rounds of rings.', 'Mind the wind. It pushes every ring.', 'Land one on the spinning gold peg for the top shelf!'],
      { torso: ['#c42d3c', '#f3ecdf', '#7a1d2a'], look: { ...PLAYER_FEMALE, fur: '#e8873a', furDark: '#b5531c' } }, 2.9, 0.6, -0.5);
    play(g, 'RING TOSS', 'g/fox-ring-toss/Main.dc.html?embed=1&world=meru'); }

  // ================= CLEARING 1 · BALLOON POP (the game's own buildBooth, Meru colours, ZIGGY) =================
  { const g = place(183, 13, Math.PI); const T = BP_THEMES.meru, inner = new THREE.Group(); g.add(inner);
    const K = balloonBooth({ M: (geo, mat, x, y, z, par, o, r) => M(geo, mat, x, y, z, par, o, r), toon: c => toon(c), scene: inner, grad, theme: T });
    const balloonG = new THREE.SphereGeometry(0.2, 14, 10), cols5 = ['red', 'blue', 'green', 'orange', 'purple']; const bal = [];
    for (let i = 0; i < 20; i++) { const p = slotXY(i, 0, false), ty = i === 7 ? 'gold' : i === 12 ? 'star' : cols5[(i * 3) % 5], col = (BP_TYPES[ty] || BP_TYPES.red).col;
      const b = new THREE.Mesh(balloonG, new THREE.MeshToonMaterial({ color: col, gradientMap: grad })); b.scale.set(1, 1.15, 0.9); b.position.set(p.x, p.y, -2.7); K.group.add(b); bal.push([b, p.y, i]); }
    anim.push((dt, t) => { for (const [b, y, i] of bal) b.position.y = y + Math.sin(t * 1.7 + i) * 0.025; });
    bulbLocal(g, K.bulbPts.map(([x, y, z]) => [x, y, z]), true); K.bulbs.visible = false; if (K.sign) K.sign.visible = false;
    signTower(g, 'BALLOON POP', { edge: T.trim, fw: 3.0, y: 4.65, z: -1.2, pole: 0.5 });
    footprint(g, -2.4, 2.4, -3.4, 0.7);
    keeper(g, 'ziggy', 'ZIGGY', 'Balloon Pop barker (DRAFT)', ['Step right up! Pop a balloon, win a prize!', 'Gold pays fifty! The pink star pays a hundred!', 'Bring your friends! Up to five can play!'],
      { torso: [T.a, T.b, '#1a1626'], look: { ...PLAYER_MALE, fur: '#b8642a', furDark: '#7a3a12' } }, 2.9, 0.6, 0.5);
    play(g, 'BALLOON POP', 'Carnival%20Balloon%20Pop.html?embed=1&world=meru'); { const [cx, cz] = W(g, 0, -1); spots[spots.length - 1].fest = { game: 'balloon', booth: g, group: inner, deco: bal.map(q => q[0]), x: cx, z: cz, hideR: 4 }; } }   /* s102: plays in world (walk festStart) */

  // ================= CLEARING 2 · WATER-GUN HORSE RACE (four guns, four horses, RINGO) =================
  { const g = place(226, -13, 0); const LN = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e']];
    stall(g, { w: 7, d: 3.0, a: '#c42d3c', b: '#f3e9d8', trim: '#e6b45a', title: 'WATER-GUN HORSE RACE', h: 3.8 });
    B(5.9, 2.4, 0.14, '#1f3a5f', 0, 2.3, -2.8, g, 0.02);
    const horseT = CT(128, 96, (c) => { c.fillStyle = '#f3ecdf'; c.beginPath(); c.ellipse(60, 56, 34, 18, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(84, 48); c.lineTo(110, 18); c.lineTo(122, 26); c.lineTo(100, 58); c.fill(); c.fillRect(34, 66, 7, 28); c.fillRect(74, 66, 7, 28); c.fillStyle = '#201e1d'; c.beginPath(); c.arc(112, 26, 3, 0, 7); c.fill(); c.fillRect(20, 46, 14, 5); });
    const horses = [];
    LN.forEach(([, col], i) => { const y = 3.15 - i * 0.52; B(5.5, 0.4, 0.05, i % 2 ? '#2b4f7e' : '#284a75', 0, y, -2.72, g, 0); B(5.5, 0.03, 0.06, col, 0, y - 0.2, -2.71, g, 0);
      const hm = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.38), new THREE.MeshBasicMaterial({ map: horseT, transparent: true, color: col })); hm.position.set(-2.4 + i * 0.35, y, -2.68); g.add(hm); horses.push([hm, y, i]); });
    for (let k = 0; k < 8; k++) B(0.08, 0.08, 0.04, k % 2 ? '#201e1d' : '#ffffff', 2.55, 1.3 + k * 0.28, -2.7, g, 0);
    anim.push((dt, t) => { for (const [h, y, i] of horses) { h.position.x = -2.4 + ((t * (0.18 + i * 0.03) + i * 0.4) % 4.6); h.position.y = y + Math.abs(Math.sin(t * 6 + i)) * 0.04; } });
    const tgtT = CT(128, 128, c => { for (const [r, f] of [[64, '#201e1d'], [60, '#ffffff'], [44, '#ec3013'], [28, '#ffffff'], [14, '#ffd23a']]) { c.fillStyle = f; c.beginPath(); c.arc(64, 64, r, 0, 7); c.fill(); } });
    LN.forEach(([, col], i) => { const x = -2.2 + i * 1.47; const d = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), new THREE.MeshBasicMaterial({ map: tgtT })); d.position.set(x, 1.3, -2.7); g.add(d);
      const gun = new THREE.Group(); gun.position.set(x, 1.1, 0.3); g.add(gun); C(0.04, 0.25, '#5a3a26', 0, 0.12, 0, gun, 0.006, 8); const bd = B(0.16, 0.18, 0.42, col, 0, 0.32, -0.05, gun, 0.008); C(0.03, 0.34, '#d7dde3', 0, 0.36, -0.36, gun, 0.006, 8).rotation.x = Math.PI / 2; B(0.06, 0.16, 0.08, '#201e1d', 0, 0.2, 0.06, gun, 0);
      anim.push((dt, t) => { gun.rotation.y = Math.sin(t * 0.7 + i * 1.3) * 0.12; }); });
    keeper(g, 'ringo', 'RINGO', 'Booth barker', ['Step right up! Four guns, four horses, one winner!', 'Hit the bullseye and your horse runs. Miss and it stands still!', 'Steady hands win the plush fox!', 'Try a practice squirt. Hold and drag!'],
      { torso: ['#ec3013', '#f3f2f2', '#7a1d2a'], eyes: ['#38bdf8', '#38bdf8'], look: { ...PLAYER_MALE, fur: '#d9733a', furDark: '#9a4a22' } }, 4.4, 0.6, -0.5);
    play(g, 'HORSE RACE', 'g/water-gun-horse-race/Main.dc.html?embed=1&world=meru', 0, 1.4, 2.4); }

  // ================= CLEARING 2 · SHOOTING GALLERY (four rows: ducks on water, cans, stars, bluebirds; DOT) =================
  { const g = place(226, 13, Math.PI); const T = { wall: '#151b3d', a: '#c42d3c', b: '#f6f3ee', trim: '#e6b45a' };
    const starsT = CT(256, 256, (c, w) => { c.fillStyle = T.wall; c.fillRect(0, 0, w, w); c.fillStyle = T.trim; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(Math.random() * w, Math.random() * w, 1.5 + Math.random() * 3, 0, 7); c.fill(); } }, [3, 2]);
    stall(g, { w: 5.6, d: 3.4, a: T.a, b: T.b, trim: T.trim, wall: new THREE.MeshToonMaterial({ map: starsT, gradientMap: grad }), title: 'SHOOTING GALLERY', h: 3.7 });
    const rows = []; const WR = 2.4;
    const rowBar = (y, z, col) => B(5.2, 0.12, 0.2, col, 0, y, z, g, 0.01);
    B(5.2, 0.32, 0.4, '#2f8fd8', 0, 1.1, -2.6, g, 0.01); rowBar(1.75, -2.9, '#7a4a2a'); rowBar(2.35, -3.05, '#7a4a2a');
    const duckG = new THREE.SphereGeometry(0.14, 12, 8), headG = new THREE.SphereGeometry(0.08, 10, 8), beakG = new THREE.ConeGeometry(0.035, 0.08, 6);
    const mkRow = (n, y, z, dir, spd, make) => { const items = []; for (let i = 0; i < n; i++) { const o = new THREE.Group(); g.add(o); make(o, i); items.push(o); } rows.push({ items, y, z, dir, spd, n }); };
    mkRow(5, 1.36, -2.55, 1, 0.3, (o, i) => { const gold = i === 3, c = gold ? '#ffb000' : '#ffd23a'; const b = M(duckG, toon(c), 0, 0, 0, o, 0.01); b.scale.set(1.4, 0.9, 0.8); M(headG, toon(c), 0.15, 0.13, 0, o, 0.008); const k = M(beakG, toon('#f2741f'), 0.25, 0.12, 0, o, 0); k.rotation.z = -Math.PI / 2; });
    mkRow(6, 1.94, -2.9, -1, 0.25, (o, i) => { C(0.09, 0.24, i % 3 === 2 ? '#22c55e' : '#cfd6de', 0, 0, 0, o, 0.008, 12); });
    const starShape = new THREE.Shape(); for (let q = 0; q < 10; q++) { const a = q / 10 * Math.PI * 2 + Math.PI / 2, r = q % 2 ? 0.07 : 0.17; q ? starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const starG = new THREE.ExtrudeGeometry(starShape, { depth: 0.05, bevelEnabled: false });
    mkRow(5, 2.6, -3.05, 1, 0.4, (o) => { M(starG, toon('#ffd23a'), 0, 0, 0, o, 0); });
    mkRow(4, 3.15, -3.2, -1, 0.52, (o) => { const b = S(0.12, '#38bdf8', 0, 0, 0, o, 0.008); b.scale.set(1.3, 0.8, 0.8); for (const s of [-1, 1]) { const w = B(0.16, 0.02, 0.1, '#0e7fb8', 0, 0.06, s * 0.08, o, 0); w.rotation.x = s * 0.5; } M(beakG, toon('#f2741f'), 0.17, 0, 0, o, 0).rotation.z = -Math.PI / 2; });
    anim.push((dt, t) => { for (const r of rows) r.items.forEach((o, i) => { const u = (((t * r.spd + i / r.n) % 1) + 1) % 1, x = r.dir * (u * 2 * WR - WR); o.position.set(x, r.y + (r.y < 1.5 ? Math.sin(t * 3 + i) * 0.02 : 0), r.z); o.rotation.y = r.dir < 0 ? Math.PI : 0; }); });
    for (const x of [-1.2, 1.2]) { const rf = new THREE.Group(); rf.position.set(x, 1.12, 0.32); rf.rotation.y = 0.15 * Math.sign(x); g.add(rf); B(0.1, 0.12, 0.5, '#7a4a2a', 0, 0.06, 0.1, rf, 0.006); C(0.025, 0.55, '#3a3836', 0, 0.1, -0.4, rf, 0.004, 8).rotation.x = Math.PI / 2; }
    prizeShelf(g, -2.45, -1.6, 2.2, Math.PI / 2, ['#ec3013', '#ffd23a', '#38bdf8', '#22c55e', '#a78bfa', '#f472b6']);
    keeper(g, 'dot', 'DOT', 'Booth keeper (DRAFT)', ['Step right up! Eight corks a clip. Tap a target to shoot it.', 'Ducks, cans, stars, birds. The gold bell is worth the most!', "Green fox cards are my friends. Please don't shoot them."],
      { torso: [T.a, T.b, '#1a1626'], look: { ...PLAYER_FEMALE, fur: '#e8873a', furDark: '#b5531c', tailTip: '#ffffff' } }, 3.6, 0.6, 0.5);
    play(g, 'SHOOTING GALLERY', 'Shooting%20Gallery.dc.html?embed=1&world=meru', 0, 1.4, 2.0); { const [cx, cz] = W(g, 0, -1); spots[spots.length - 1].fest = { game: 'gallery', booth: g, group: g, deco: g.children.slice(), x: cx, z: cz, hideR: 4 }; } }   /* s102: plays in world; the game builds its own screen-fitted booth, so the whole stall hides */

  // ================= CLEARING 3 · TUG OF WAR (rope over the mud pit, red vs blue, the referee) =================
  { const g = place(334, -14.5, 0);
    const mud = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 3.2), new THREE.MeshPhongMaterial({ color: 0x4a3222, shininess: 70, specular: 0x6a5a4a })); mud.position.set(0, 0.04, 0); g.add(mud);
    for (const s of [-1, 1]) B(0.16, 0.24, 3.4, '#7a5236', s * 1.38, 0.12, 0, g, 0.01); for (const s of [-1, 1]) B(2.9, 0.24, 0.16, '#7a5236', 0, 0.12, s * 1.68, g, 0.01);
    for (const [x, c] of [[-3.4, '#ec3013'], [3.4, '#38bdf8']]) B(0.12, 0.02, 2.4, c, x, 0.02, 0, g, 0);
    const rope = C(0.05, 14, '#c9a46a', 0, 0.95, 0, g, 0.008, 8); rope.rotation.z = Math.PI / 2;
    const rib = B(0.08, 0.36, 0.04, '#ffd23a', 0, 0.78, 0, g, 0); anim.push((dt, t) => { const k = Math.sin(t * 0.8) * 0.18; rope.position.x = k; rib.position.x = k; rib.rotation.x = Math.sin(t * 3) * 0.15; });
    for (const x of [-6.6, 6.6]) for (const s of [-1, 1]) { const l = B(0.08, 1.2, 0.08, '#5a3a26', x, 0.55, 0, g, 0.006); l.rotation.x = s * 0.45; }
    // s102 (Ben: "some foxes tugging on the rope in the map"): two foxes a side lean back on the rope and heave with its sway (they hide while the real game plays)
    const tuggers = [[-1.9, '#ec3013', 0.24], [-2.9, '#ec3013', -0.24], [1.9, '#38bdf8', -0.24], [2.9, '#38bdf8', 0.24]].map(([x, col, z], i) => { const tf = kit.makeFox({ key: 'tugger' + i, torso: [col, '#f3f2f2', '#201e1d'], outfit: 'tee', crest: '', gear: 'none', mood: 'determined', look: i % 2 ? { ...PLAYER_FEMALE } : { ...PLAYER_MALE } }); const P = tf.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false;
      g.add(tf); tf.position.set(x, 0, z); tf.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; const side = x < 0 ? -1 : 1, ph = i * 1.7;
      tf.userData.sitPose = () => { const t = performance.now() / 1000, heave = Math.max(0, Math.sin(t * 2.6 + (side < 0 ? 0 : Math.PI))), lean = 0.38 + heave * 0.22; tf.position.x = x + rope.position.x; P.body.rotation.x = -lean; P.body.position.y = -0.04 * heave;
        const near = z < 0 ? 0 : 1; P.arms[near].rotation.x = -1.5 + lean; P.arms[near].rotation.z = z < 0 ? 0.18 : -0.18; P.arms[1 - near].rotation.x = -1.58 + lean; P.arms[1 - near].rotation.z = z < 0 ? -0.5 : 0.5;
        const st = Math.sin(t * 5.2 + ph) * 0.18 * heave; P.legs[0].rotation.x = -0.55 + lean + st; P.legs[1].rotation.x = 0.2 + lean - st; if (tf.userData.mood !== 'determined') tf.userData.mood = 'determined'; };
      keepers.push(tf); return tf; });
    const tugDeco = g.children.slice();   /* s102: mud, rails, tapes, rope, ribbon, rope stands hide while the real game plays here (flags, sign, benches stay) */
    const flagT = c => CT(128, 192, (q, w, h) => { q.fillStyle = c; q.fillRect(0, 0, w, h); q.fillStyle = '#ffffff'; q.font = `900 52px ${FONT}`; q.textAlign = 'center'; q.fillText(c === '#ec3013' ? 'RED' : 'BLUE', w / 2, h / 2 + 18); });
    for (const [x, c] of [[-7.6, '#ec3013'], [7.6, '#38bdf8']]) { C(0.06, 4.2, '#201e1d', x, 2.1, -1.4, g, 0.006, 8); const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.5), new THREE.MeshToonMaterial({ map: flagT(c), gradientMap: grad, side: THREE.DoubleSide })); fl.position.set(x + Math.sign(-x) * 0.52, 3.3, -1.4); g.add(fl); anim.push((dt, t) => { fl.rotation.y = Math.sin(t * 1.6 + x) * 0.2; }); ring(...W(g, x, -1.4), 0.2); }
    { signTower(g, 'TUG OF WAR', { bg: '#201e1d', fg: '#ffd23a', edge: '#e6b45a', fw: 3.2, y: 4.2, z: -3.6, pole: 3.5 }); ring(...W(g, 0, -3.6), 0.2); }
    for (const s of [-1, 1]) { const bn = B(3.2, 0.4, 0.5, '#7a4e32', s * 4.6, 0.22, -2.8, g, 0.01); footprint(g, s * 4.6 - 1.6, s * 4.6 + 1.6, -3.05, -2.55); }
    footprint(g, -1.5, 1.5, -1.8, 1.8);
    keeper(g, 'tugRef', 'THE REFEREE', 'Tug of War (DRAFT)', ['Best of three, forty-five seconds a round.', 'Pull on the beat. When they heave, dig in!', 'Drag the ribbon past your tape and the mud gets them.'],
      { torso: ['#f6f3ee', '#d8d4cc', '#201e1d'], outfit: 'tee', look: { ...PLAYER_MALE, fur: '#9a6a44', furDark: '#6b4428' } }, 0, -2.6, 0, 3.2);
    play(g, 'TUG OF WAR', 'Tug%20of%20War.dc.html?embed=1&theme=hall&place=Arena%20Path', 0, 3.0, 2.2); { const [cx, cz] = W(g, 0, 0); spots[spots.length - 1].fest = { game: 'tug', booth: g, group: g, deco: tugDeco, x: cx, z: cz, hideR: 3.4 }; } }   /* s102: plays in world */

  // ================= CLEARING 3 · DUNK TANK (the game's tank + cage + seat + target + throw line, MICHAEL JAY on the seat) =================
  { const g = place(334, 12, Math.PI), k = 1.3, D = new THREE.Group(); D.scale.setScalar(k); D.position.z = 1.85 * k; g.add(D);
    const steel = toon('#c8d0da'), dark = toon('#2a2826'), red = toon('#c42d3c'), trim = toon('#e6b45a');
    const TZ0 = -6.85, TZ1 = -8.45, TZC = (TZ0 + TZ1) / 2, TD = TZ0 - TZ1, CAGE = { y: 3.75, glass: 1.35 }, WATER_Y = 1.2, SEAT_Y = 2.0;
    M(new THREE.BoxGeometry(2.6, 0.18, 1.9), dark, 0, 0.09, TZC, D, 0.02);
    const water = new THREE.Mesh(new THREE.BoxGeometry(2.24, WATER_Y - 0.18, TD - 0.06), new THREE.MeshToonMaterial({ color: '#2f9ee0', gradientMap: grad, transparent: true, opacity: 0.62, depthWrite: false })); water.position.set(0, 0.18 + (WATER_Y - 0.18) / 2, TZC); water.renderOrder = 2; D.add(water);
    const surf = new THREE.Mesh(new THREE.PlaneGeometry(2.24, TD - 0.06), new THREE.MeshToonMaterial({ color: '#8fdcff', gradientMap: grad, transparent: true, opacity: 0.75, depthWrite: false })); surf.rotation.x = -Math.PI / 2; surf.position.set(0, WATER_Y, TZC); surf.renderOrder = 3; D.add(surf);
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide });
    for (const [w, x, z, ry] of [[2.3, 0, TZ0, 0], [TD, -1.15, TZC, Math.PI / 2], [TD, 1.15, TZC, Math.PI / 2]]) { const gm = new THREE.Mesh(new THREE.PlaneGeometry(w, CAGE.glass - 0.18), glassMat); gm.position.set(x, 0.18 + (CAGE.glass - 0.18) / 2, z); gm.rotation.y = ry; gm.renderOrder = 4; D.add(gm); }
    for (const x of [-1.17, 1.17]) for (const z of [TZ0, TZ1]) M(new THREE.CylinderGeometry(0.05, 0.05, CAGE.y, 10), steel, x, CAGE.y / 2, z, D, 0.012, 0.05);
    for (const z of [TZ0, TZ1]) { M(new THREE.BoxGeometry(2.42, 0.1, 0.1), red, 0, CAGE.glass, z, D, 0.012); M(new THREE.BoxGeometry(2.42, 0.12, 0.12), red, 0, CAGE.y, z, D, 0.012); }
    for (const x of [-1.17, 1.17]) { M(new THREE.BoxGeometry(0.1, 0.1, TD), red, x, CAGE.glass, TZC, D, 0.012); M(new THREE.BoxGeometry(0.12, 0.12, TD), red, x, CAGE.y, TZC, D, 0.012); }
    { const netT = CT(128, 128, q => { q.strokeStyle = 'rgba(240,240,240,0.9)'; q.lineWidth = 3; for (let i = 0; i <= 128; i += 16) { q.beginPath(); q.moveTo(i, 0); q.lineTo(i, 128); q.stroke(); q.beginPath(); q.moveTo(0, i); q.lineTo(128, i); q.stroke(); } }, [7, 7]);
      const net = new THREE.Mesh(new THREE.PlaneGeometry(2.3, CAGE.y - CAGE.glass), new THREE.MeshBasicMaterial({ map: netT, transparent: true, depthWrite: false, opacity: 0.55 })); net.position.set(0, (CAGE.y + CAGE.glass) / 2, -6.78); net.renderOrder = 6; D.add(net);
      M(new THREE.PlaneGeometry(2.3, CAGE.y - CAGE.glass), toon('#1d2450'), 0, (CAGE.y + CAGE.glass) / 2, TZ1 - 0.02, D, 0);
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.75), new THREE.MeshBasicMaterial({ map: signTex('DUNK TANK', '#c42d3c', '#ffffff', '#ffffff', 768, 230) })); sg.position.set(0, CAGE.y + 0.55, TZ0 + 0.1); D.add(sg); M(new THREE.BoxGeometry(2.62, 0.86, 0.06), red, 0, CAGE.y + 0.55, TZ0 + 0.05, D, 0.01);
      D.updateMatrixWorld(true); signFrame(D, 0, CAGE.y + 0.55, TZ0 + 0.14, 2.5, 0.75, 0.18); }
    signTower(g, 'DUNK TANK', { bg: '#c42d3c', fg: '#ffffff', edge: '#ffffff', fw: 3.0, x: -4.4, y: 3.9, z: -4.6, pole: 3.3 }); ring(...W(g, -4.4, -4.6), 0.2);
    const seat = new THREE.Group(); seat.position.set(0, SEAT_Y, TZ1 + 0.2); D.add(seat); M(new THREE.BoxGeometry(1.1, 0.09, 0.62), toon('#c08a4a'), 0, -0.045, 0.31, seat, 0.014); M(new THREE.CylinderGeometry(0.035, 0.035, 2.3, 8), steel, 0, 0, 0, seat, 0.008).rotation.z = Math.PI / 2;
    const tgt = new THREE.Group(); tgt.position.set(1.95, 0, -6.95); D.add(tgt); M(new THREE.CylinderGeometry(0.05, 0.05, 2.05, 10), steel, 0, 1.02, 0, tgt, 0.012, 0.05); M(new THREE.BoxGeometry(0.5, 0.16, 0.4), dark, 0, 0.08, 0, tgt, 0.015);
    const tgtT = CT(256, 256, q => { for (const [r, f] of [[128, '#201e1d'], [123, '#ffffff'], [86, '#201e1d'], [82, '#c42d3c'], [46, '#201e1d'], [42, '#ffd23a']]) { q.fillStyle = f; q.beginPath(); q.arc(128, 128, r, 0, 7); q.fill(); } q.fillStyle = '#201e1d'; q.font = `900 22px ${FONT}`; q.textAlign = 'center'; q.fillText('HIT ME', 128, 34); });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.38, 40), new THREE.MeshBasicMaterial({ map: tgtT, side: THREE.DoubleSide })); disc.position.set(0, 2.05, 0.03); tgt.add(disc); M(new THREE.CylinderGeometry(0.39, 0.39, 0.04, 40), dark, 0, 2.05, 0, tgt, 0).rotation.x = Math.PI / 2;
    { const n = 12, w = 5.6 / n; const aw = ['#c42d3c', '#f3ecdf']; for (let i = 0; i < n; i++) { const x = -2.6 + w * (i + 0.5); M(new THREE.BoxGeometry(w, 0.5, 0.06), toon(aw[i % 2]), x, 4.85, -6.25, D, 0.01).rotation.x = -0.25; }
      M(new THREE.BoxGeometry(5.8, 0.1, 0.1), trim, 0.2, 5.1, -6.32, D, 0.01); for (const x of [-2.75, 3.15]) M(new THREE.CylinderGeometry(0.06, 0.06, 5.1, 8), trim, x, 2.55, -6.32, D, 0.01, 0.06); }
    for (let i = 0; i < 8; i++) M(new THREE.BoxGeometry(0.42, 0.1, 0.1), toon(i % 2 ? '#ffffff' : '#c42d3c'), -1.6 + i * 0.44, 0.92, -0.95, D, 0.008); for (const x of [-1.8, 1.8]) M(new THREE.CylinderGeometry(0.04, 0.04, 0.92, 8), steel, x, 0.46, -0.95, D, 0.008);
    { const bk = new THREE.Group(); bk.position.set(-1.7, 0, -0.4); D.add(bk); M(new THREE.CylinderGeometry(0.26, 0.2, 0.5, 16, 1, true), toon('#c42d3c', { side: THREE.DoubleSide }), 0, 0.25, 0, bk, 0.012); for (let i = 0; i < 6; i++) S(0.11, '#f3efe6', Math.cos(i * 2.4) * (i ? 0.13 : 0), 0.5 + Math.floor(i / 4) * 0.12, Math.sin(i * 2.4) * (i ? 0.13 : 0), bk, 0.006); }
    // MICHAEL JAY on the seat (the game's sitter look, sitting pose from the game)
    const mj = kit.makeFox({ key: 'michaelJay2', joints: true, torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], outfit: 'vest', crest: '', gear: 'none', mood: 'happy', look: { ...PLAYER_MALE, fur: '#e0823a', furDark: '#a8501c' } }); const MP = mj.userData.P; if (MP.sword) MP.sword.visible = false; if (MP.gun) MP.gun.visible = false;
    mj.scale.setScalar(1 / k); mj.position.set(0, SEAT_Y - 0.62, TZ1 + 0.5); D.add(mj); const sitPose = () => { if (MP.legs) { MP.legs[0].rotation.x = MP.legs[1].rotation.x = -1.45; MP.legs[0].rotation.z = 0.1; MP.legs[1].rotation.z = -0.1; } }; sitPose();
    anim.push((dt, t) => { if (MP.fore) { applyD(THREE, mj, lifeD('taunt', t), t, 1); return; }   // s625 / s633: lifeD('taunt'): dangling legs, beckoning paw, then a big wave
      if (MP.arms) MP.arms[1].rotation.x = -2.4 + Math.sin(t * 5) * 0.4; });
    TALK.michaelJay2 = { name: 'MICHAEL JAY', role: 'On the dunk seat (DRAFT)', lines: ['Is that all you\u2019ve got?', 'Dry as a desert up here!', 'You couldn\u2019t hit the tank!'].map(text => ({ who: 'npc', text })) };
    { D.updateMatrixWorld(true); const px = new THREE.Object3D(); mj.getWorldPosition(px.position); px.position.y = 0; talkers.push({ key: 'michaelJay2', obj: px, ry: 0, r: 4.2 }); } keepers.push(mj); mj.userData.sitPose = sitPose;
    footprint(g, -1.7 * k, 1.7 * k, (TZ1 + 1.85 - 0.2) * k, (TZ0 + 1.85 + 0.1) * k); { const [x, z] = W(g, 1.95 * k, (-6.95 + 1.85) * k); ring(x, z, 0.4); } { const [x, z] = W(g, -1.7 * k, (-0.4 + 1.85) * k); ring(x, z, 0.4); }
    // s35 NIGHT: three spot beams from lamp heads on the cage top onto MICHAEL JAY on the seat, the TARGET and the BALL BUCKET; the water glows
    { D.updateMatrixWorld(true); const wp = (x, y, z) => { const v = new THREE.Vector3(x, y, z); D.localToWorld(v); return [v.x, v.y, v.z]; };
      NL.lit(D, 0.32); NL.lit(surf, 0.9); NL.lit(water, 0.7);
      NL.beam(wp(0, 5.6, TZ1 + 2.6), wp(0, SEAT_Y - 0.1, TZ1 + 0.4), 1.05, '#fff1c8', 0.34);
      NL.beam(wp(1.95, 5.4, -5.3), wp(1.95, 0.05, -6.95), 0.95, '#ffd9a0', 0.3); NL.beam(wp(-1.7, 4.6, 1.0), wp(-1.7, 0.05, -0.4), 0.8, '#ffd9a0', 0.3);
      NL.pool(...wp(0, 0.04, -3), 4.2, '#7fd0ff', 0.35); }
    play(g, 'DUNK TANK', 'Meru%20Dunk%20Tank.dc.html?embed=1&world=meru', 0, 1.5, 1.8); { const [cx, cz] = W(g, 0, (-3 + 1.85) * k); spots[spots.length - 1].fest = { game: 'dunk', booth: D, group: D, deco: D.children.slice(), x: cx, z: cz, hideR: 3 }; } }   /* s102: plays in world; D is the game's own frame (scale 1.3 × the game's FOX_S 0.74 = Meru fox size) */

  // ================= FESTOON STRING BULBS along the whole row (poles between the booths, both sides) + cross strings over the path =================
  { const PX = [174, 205, 244, 307, 352], zs = 10;
    for (const x of PX) for (const s of [-1, 1]) { C(0.07, 6.3, '#201e1d', x, 3.15, s * zs, root, 0.006, 8); ring(x, s * zs, 0.2); }
    const string = (x0, z0, x1, z1, y, sag) => { const n = Math.max(6, Math.round(Math.hypot(x1 - x0, z1 - z0) / 0.9)); for (let i = 0; i <= n; i++) { const u = i / n; bulbs.push({ p: new THREE.Vector3(x0 + (x1 - x0) * u, y - Math.sin(u * Math.PI) * sag, z0 + (z1 - z0) * u), col: BULB[i % BULB.length], marq: false, ph: i }); } };
    for (let i = 0; i < PX.length - 1; i++) { const a = PX[i], b = PX[i + 1]; for (const s of [-1, 1]) string(a, s * zs, b, s * zs, 6.3, 1.0); string(a, -zs, b, zs, 6.3, 0.8); string(a, zs, b, -zs, 6.3, 0.8); }
    for (const x of PX) string(x, -zs, x, zs, 6.3, 0.6); }
  // paving pads under the booths that stand between the clearings (x 200..240)
  for (const s of [-1, 1]) B(9.5, 0.05, 7.5, '#c9b89c', 226, 0.025, s * 15.5, root, 0);
  // ================= OPEN-AIR STAGE (north) + BLEACHERS facing it across the path (south), in the clearing before the rides, x 256 =================
  let band = null, stageG = null;
  { const AX = 256, g = new THREE.Group(); g.position.set(AX, 0, -21); root.add(g); stageG = g; band = buildBand({ THREE, M, toon, grad, kit, stage: g, ring, AX, AZ: -21 });
    const st = M(new THREE.CylinderGeometry(7.2, 7.2, 0.9, 32, 1, false, -Math.PI / 2, Math.PI), toon('#c89a62'), 0, 0.45, 0, g, 0.02, 7); st.rotation.y = Math.PI;
    B(14.4, 0.9, 1.2, '#b5844e', 0, 0.45, -0.6, g, 0.02); const lip = M(new THREE.TorusGeometry(7.2, 0.07, 6, 40, Math.PI), toon('#e6b45a'), 0, 0.9, 0, g, 0); lip.rotation.x = -Math.PI / 2;
    for (let i = 0; i < 3; i++) B(3, 0.3, 0.45, '#9c7a52', 0, 0.15 + i * 0.3 - 0.0, 7.65 - i * 0.45, g, 0.01);
    const ribs = CT(512, 256, (q, w, h) => { q.fillStyle = '#f3ecdf'; q.fillRect(0, 0, w, h); for (let i = 0; i <= 8; i++) { q.fillStyle = '#c42d3c'; q.fillRect(i * w / 8 - 5, 0, 10, h); } q.fillStyle = 'rgba(0,0,0,0.06)'; for (let j = 1; j < 6; j++) q.fillRect(0, j * h / 6, w, 3); });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(7.4, 28, 12, 0, Math.PI, 0, Math.PI / 2), new THREE.MeshToonMaterial({ map: ribs, gradientMap: grad, side: THREE.DoubleSide })); shell.rotation.y = Math.PI; shell.position.y = 0.9; shell.scale.set(1, 1.05, 0.85); shell.castShadow = true; g.add(shell);
    const arch = M(new THREE.TorusGeometry(7.4, 0.14, 8, 40, Math.PI), toon('#e6b45a'), 0, 0.9, 0, g, 0.01); arch.scale.y = 1.05;
    const pts = []; for (let i = 0; i <= 26; i++) { const a = i / 26 * Math.PI; pts.push([AX + Math.cos(a) * 7.55, 0.9 + Math.sin(a) * 7.55 * 1.05, -21 + 0.05]); } pts.forEach(([x, y, z], i) => bulbs.push({ p: new THREE.Vector3(x, y, z), col: BULB[i % BULB.length], marq: true, ph: i }));
    for (const sx of [-1, 1]) { C(0.06, 3.2, '#201e1d', sx * 6.2, 2.5, 5.4, g, 0.006, 8); B(0.5, 0.5, 0.5, '#201e1d', sx * 6.2, 4.1, 5.4, g, 0.01); B(0.7, 1.0, 0.6, '#201e1d', sx * 5.4, 1.4, 4.8, g, 0.01); }
    signTower(g, 'OPEN-AIR STAGE', { bg: '#201e1d', fg: '#ffd23a', edge: '#e6b45a', fw: 3.6, y: 9.9, z: -4.6, pole: 0.8 });
    box(AX - 7.4, AX + 7.4, -27.6, -21); for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; ring(AX + Math.cos(a) * 6.4, -21 + Math.sin(a) * 6.2, 1.0); }
    // bleachers: 6 rows rising away from the path, facing the stage
    const b = new THREE.Group(); b.position.set(AX, 0, 12.5); root.add(b); const WB = 18, ROWS = touch ? 5 : 6, steel = toon('#6b6e72'), wood = toon('#c98f55');
    for (let i = 0; i < ROWS; i++) { const y = 0.45 + i * 0.45, z = 0.45 + i * 0.85; B(WB, 0.08, 0.42, wood, 0, y, z, b, 0.008); B(WB, 0.06, 0.4, wood, 0, y - 0.22, z + 0.42, b, 0.006); B(WB, 0.04, 0.38, '#5a5c60', 0, y - 0.24, z - 0.05, b, 0); }
    for (let x = -WB / 2 + 0.3; x <= WB / 2 - 0.2; x += 3) for (let i = 0; i < ROWS; i++) C(0.04, 0.45 + i * 0.45, steel, x, (0.45 + i * 0.45) / 2, 0.45 + i * 0.85 + 0.2, b, 0, 6);
    const backZ = 0.45 + (ROWS - 1) * 0.85 + 0.45, topY = 0.45 + (ROWS - 1) * 0.45;
    B(WB, 0.06, 0.06, steel, 0, topY + 0.9, backZ, b, 0); for (let x = -WB / 2; x <= WB / 2 + 0.01; x += 3) C(0.035, 0.9, steel, x, topY + 0.45, backZ, b, 0, 6);
    for (const sx of [-1, 1]) { const rl = B(0.06, 0.06, Math.hypot(backZ, topY), steel, sx * WB / 2, topY / 2 + 0.95, backZ / 2, b, 0); rl.rotation.x = -Math.atan2(topY, backZ); C(0.035, 0.95, steel, sx * WB / 2, 0.47, 0.2, b, 0, 6); }
    B(WB + 0.4, 0.05, backZ + 1, '#c9b89c', 0, 0.025, backZ / 2, b, 0);
    box(AX - WB / 2, AX + WB / 2, 12.6, 12.5 + backZ + 0.2); }
  // ================= THE TWO RIDES at x 280 (helicopter N, carousel S) =================
  const rides = buildRides({ THREE, scene, M, toon, grad, kit, cols, L, save, touch, root, bulbs, TALK, talkers, keepers, signTower });
  // s35 NIGHT: every booth glows inside (counter, walls, prizes, roof) + a warm pool at the counter and one inside; the carousel glows and
  // gets a big pool + four beams from its sign tower side; the stage gets coloured beams from its two light towers; pools at the bleachers + heli pad
  for (const g of booths) { if (g === booths.stage) continue; NL.lit(g, 0.38); g.updateMatrixWorld(true); const a = new THREE.Vector3(0, 0.04, 2.0), b = new THREE.Vector3(0, 0.04, -1.2); g.localToWorld(a); g.localToWorld(b); NL.pool(a.x, 0.04, a.z, 3.4, '#ffd9a0', 0.5); NL.pool(b.x, 0.05, b.z, 2.4, '#fff1c8', 0.45); }
  if (rides.car) { NL.lit(rides.car, 0.5); const c = rides.car.position; NL.pool(c.x, 0.05, c.z, 9.5, '#ffd9a0', 0.45);
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + Math.PI / 4; NL.beam([c.x + Math.cos(a) * 9.5, 7.5, c.z + Math.sin(a) * 9.5], [c.x + Math.cos(a) * 3.5, 0.6, c.z + Math.sin(a) * 3.5], 2.0, i % 2 ? '#ffb3d1' : '#fff1c8', 0.22, false); } }
  if (rides.pad) NL.pool(rides.pad[0], 0.05, rides.pad[1], 6, '#d6ecff', 0.4);
  if (stageG) { NL.lit(stageG, 0.3); const wp = (x, y, z) => { const v = new THREE.Vector3(x, y, z); stageG.localToWorld(v); return [v.x, v.y, v.z]; }; stageG.updateMatrixWorld(true);
    NL.beam(wp(-6.2, 4.4, 5.4), wp(-1.8, 0.95, -1.5), 1.8, '#ff7ab8', 0.3, false); NL.beam(wp(6.2, 4.4, 5.4), wp(1.8, 0.95, -1.5), 1.8, '#7dd3fc', 0.3, false); NL.beam(wp(0, 8.4, 3.5), wp(0, 0.95, -0.5), 1.6, '#fff1c8', 0.26, false);
    NL.pool(...wp(0, 0.06, 10.5), 7, '#ffd9a0', 0.35); }
  NL.done(root);
  // ---------- bulbs: one instanced draw (dim by day, lit + chasing marquees at night) + one additive glow draw at night ----------
  const bulbM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.065, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), bulbs.length), m4 = new THREE.Matrix4(), cc = new THREE.Color();
  bulbs.forEach((b, i) => { m4.makeTranslation(b.p.x, b.p.y, b.p.z); bulbM.setMatrixAt(i, m4); bulbM.setColorAt(i, cc.set(b.col)); }); bulbM.instanceColor.needsUpdate = true; root.add(bulbM);
  const glowT = CT(64, 64, (q, w) => { const r = q.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,240,200,1)'); r.addColorStop(0.3, 'rgba(255,210,140,0.45)'); r.addColorStop(1, 'rgba(255,200,120,0)'); q.fillStyle = r; q.fillRect(0, 0, w, w); });
  const gpos = new Float32Array(bulbs.length * 3), gcol = new Float32Array(bulbs.length * 3); bulbs.forEach((b, i) => { gpos.set([b.p.x, b.p.y, b.p.z], i * 3); cc.set(b.col); gcol.set([cc.r, cc.g, cc.b], i * 3); });
  const glow = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(gpos, 3)).setAttribute('color', new THREE.BufferAttribute(gcol, 3)), new THREE.PointsMaterial({ map: glowT, size: 1.1, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.visible = false; root.add(glow);
  let night = null, chaseT = 0, chaseK = 0, farT = 0, far = false;
  function setNight(on) { if (on === night) return; night = on; glow.visible = on; bulbs.forEach((b, i) => { cc.set(b.col); if (!on) cc.multiplyScalar(0.55); bulbM.setColorAt(i, cc); }); bulbM.instanceColor.needsUpdate = true; }
  setNight(false);
  let T = 0;
  function tick(dt, cam, isNight, P) { T += dt; setNight(!!isNight); NL.tick(dt, !!isNight); if (far) rides.tick(dt, P, isNight);
    if ((farT -= dt) <= 0) { farT = 0.5; const f = !cam || cam.x < 155 || cam.x > 420 || Math.abs(cam.z) > (touch ? 120 : 180); if (f !== far) { far = f; root.visible = !f; } }
    if (far) return;
    for (const f of keepers) { if (kit.animFox) kit.animFox(f, dt, 0); if (f.userData.sitPose && !(f.userData.P && f.userData.P.fore)) f.userData.sitPose(); }   // s625: keepers first, so a jointed pose (anim) lands on top
    for (const a of anim) a(dt, T);
    rides.tick(dt, P, isNight);
    if (night && (chaseT -= dt) <= 0) { chaseT = 0.16; chaseK++; let any = false; bulbs.forEach((b, i) => { if (!b.marq) return; any = true; cc.set(b.col); if ((b.ph + chaseK) % 3) cc.multiplyScalar(0.35); bulbM.setColorAt(i, cc); }); if (any) bulbM.instanceColor.needsUpdate = true; } }
  // s102 (Ben: "a weird layer over the stars" in the shooting gallery): while a booth's game plays in world, that booth's marquee bulbs + their night glow hide too
  const Z4 = new THREE.Matrix4().makeScale(0, 0, 0);
  function hideBooth(g, hide) { let n = 0; bulbs.forEach((b, i) => { if (b.g !== g) return; n++; if (hide) bulbM.setMatrixAt(i, Z4); else { m4.makeTranslation(b.p.x, b.p.y, b.p.z); bulbM.setMatrixAt(i, m4); } gpos[i * 3 + 1] = hide ? -999 : b.p.y; }); if (n) { bulbM.instanceMatrix.needsUpdate = true; glow.geometry.attributes.position.needsUpdate = true; } }
  return { root, spots, TALK, talkers, tick, setNight, hideBooth, rides, bandTick: (dt, o) => band && band.tick(dt, { ...o, visible: !far }), stats: { booths: 8, bulbs: bulbs.length }, night: NL };
}
