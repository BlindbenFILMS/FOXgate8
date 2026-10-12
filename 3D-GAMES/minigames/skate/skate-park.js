// 8 GATES — SKATE PARK [skatePark]. A concrete park at sunset on the shared driving engine (vehicle-lab.js, opts.course, lock 'skate').
// SKATE SCHOOL with coach TONY (arctic white fox, strict ex-pro): 1 push + steer (cone gates) · 2 ollie the gaps · 3 grind a rail · 4 kicker air + trick · 5 half-pipe airs · 6 combo.
// THE CONTEST: best trick run in 60 s. TROPHY_SCORE or more wins TONY's trophy (save flag skateTrophy + item skateTrophy, for Home later).
// Buttons: 1 BOARD WHACK (engine) · 2 TRICK: tap = kickflip, HOLD = the deck keeps flipping (bigger trick); let go before you land · ground: hold 2 = MANUAL, tap 2 = ollie + kickflip · 3 OLLIE (rail = ollie out).
// Bail = lose the combo and 50 points, keep rolling. Moves within 1.4 s of each other stack into a combo, banked as pot × moves.
// Terrain: course groundH (curved quarter pipes, half-pipe, bowl, kicker, ledges, gap trenches). Coping launches straight up (vert air) and turns you round.
import { save } from '../../engine/save.js';

export const SKATE_PARK = { name: 'SKATE PARK', room: 'skatePark' };
export const TROPHY_SCORE = 2000;
export const PLACES = [
  { id: 'school', name: 'SKATE SCHOOL', room: 'skatePark', built: true, target: 300, goal: '6 lessons with TONY', line: 'Coach TONY teaches you the board: push and steer, ollie the gaps, grind a rail, catch air off the kicker, ride the half-pipe and land a combo.' },
  { id: 'contest', name: 'THE CONTEST', room: 'skatePark', built: true, target: 60, goal: 'Best trick run in 60 s', line: 'Sixty seconds, the whole park. Chain tricks into combos. Score ' + TROPHY_SCORE + ' to win TONY\'s trophy for your home.' }];
// ONLINE (up to 4 friends): slot colours (3–4 players use the colour names; 2 players = YOU / RIVAL) and the online-only outfits, unlocked by online wins.
export const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e']];
export const ONLINE_REWARDS = [[1, 'skateBadgeBronze', 'BRONZE BADGE'], [3, 'skateChampScarf', 'CHAMPION SCARF'], [5, 'skateBadgeSilver', 'SILVER BADGE'], [10, 'skateGoldArmour', 'GOLD SKATE ARMOUR'], [15, 'skateBadgeGold', 'GOLD BADGE']];
export const rankBadge = w => w >= 15 ? 'GOLD' : w >= 5 ? 'SILVER' : w >= 1 ? 'BRONZE' : '';
const ORD = ['1ST', '2ND', '3RD', '4TH'];
const LESSONS = [
  { id: 'push', name: 'PUSH + STEER', need: 6, unit: 'GATES', start: [0, -46, 0], quest: 'Weave the 6 cone gates', radio: 'Push with the stick and steer through my cones. All six gates. I am timing you.', tip: 'Go between the two cones of each gate. Let go of the stick to coast.' },
  { id: 'ollie', name: 'OLLIE THE GAPS', need: 3, unit: 'GAPS', start: [0, -12, 0], quest: 'Ollie over the 3 gaps', radio: 'Three gaps. Tap 3 to ollie just before the edge. Fall in and you do that gap again.', tip: 'Pop the ollie (3) a board length before the yellow edge. Keep your speed up.' },
  { id: 'grind', name: 'GRIND A RAIL', need: 2, unit: 'GRINDS', start: [-3.5, 18.6, 0], quest: 'Grind a yellow rail twice', radio: 'Ollie up onto a yellow rail and ride it. Two clean grinds. Tap 3 on the rail to ollie out.', tip: 'Line up with the rail, ollie (3) just before it and you lock on.' },
  { id: 'air', name: 'KICKER AIR', need: 2, unit: 'TRICKS', start: [0, 31, 0], quest: 'Kicker air + a trick, twice', radio: 'Hit the kicker fast and tap 2 in the air for a kickflip. Land it. Twice.', tip: 'Full speed at the kicker, tap 2 as soon as you leave the lip.' },
  { id: 'pipe', name: 'HALF-PIPE', need: 3, unit: 'AIRS', start: [28, -10, Math.PI / 2 - 0.3], quest: 'Fly over the coping 3 times', radio: 'Half-pipe. Ride up the wall fast and you fly over the coping. Three airs. Hold 2 for bigger flips.', tip: 'Point straight at a wall and push. Fast up the wall = air. Let go of 2 before you come down.' },
  { id: 'combo', name: 'COMBO LINE', need: 1, unit: 'COMBO', start: [0, 19, 0], quest: 'Land a 3-trick combo', radio: 'Now a combo. Three tricks in a row without stopping: grind, flip, manual, air. Do not bail.', tip: 'Grind a rail, ollie out, flip off the kicker, then hold 2 on the ground for a manual.' }];
const TRICKS = [['KICKFLIP', 100], ['DOUBLE KICKFLIP', 220], ['360 TRE FLIP', 400], ['TRIPLE TRE', 650], ['THE 8 GATES', 1000]];
const PASS = ['Acceptable.', 'Fine. Next.', 'Not terrible. Keep going.', 'Good air. Do not let it go to your head.', 'Okay. That was actually good.', 'Hm. You might be a skater.'];
const BAILS = ['Feet over the bolts!', 'Let go of 2 before you land.', 'Get up. Again.', 'Commit to it!'];
const TAU = Math.PI * 2;
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

export function skatePark(X) {
  const { THREE, scene, M, toon, rr, clamp, damp } = X;
  const tmp = new THREE.Vector3(), V2 = (x, y) => new THREE.Vector2(x, y), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const ink = toon('#201e1d'), red = toon('#ec3013'), white = toon('#f3f2f2'), steel = toon('#aab2ba'), cone = toon('#ff7a1a');
  const PARK = { x0: -44, x1: 44, z0: -62, z1: 70 }, touch = X.touch;
  X.camera.far = 900; X.camera.updateProjectionMatrix();

  // ---------- sunset sky, light, ground ----------
  scene.background = CT(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2b2350'); gr.addColorStop(0.42, '#7d3c6a'); gr.addColorStop(0.68, '#e8673a'); gr.addColorStop(0.84, '#ffad5a'); gr.addColorStop(1, '#ffd9a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(0xf0a06a, 80, 320);
  scene.traverse(o => { if (o.isHemisphereLight) { o.color.set('#ffe0c4'); o.groundColor.set('#6e4a5c'); o.intensity = 1.05; } });
  X.sun.color.set('#ffb27a'); X.sun.intensity = 2.0;
  { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: X.glowTex, color: 0xffc070, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); s.position.set(-420, 30, 260); s.scale.setScalar(220); scene.add(s);
    const d = new THREE.Mesh(new THREE.CircleGeometry(26, 40), new THREE.MeshBasicMaterial({ color: 0xffe2a6, fog: false })); d.position.set(-420, 30, 260); d.lookAt(0, 30, 0); scene.add(d); }
  const speck = (g, w, h, n, a = 0.18) => { for (let i = 0; i < n; i++) { g.fillStyle = Math.random() < 0.5 ? `rgba(50,40,36,${a})` : `rgba(255,248,236,${a * 0.6})`; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2.5, 1 + Math.random() * 2.5); } };
  const concT = CT(512, 512, (g, w, h) => { g.fillStyle = '#bdb5ab'; g.fillRect(0, 0, w, h); speck(g, w, h, 3200); for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(80,66,60,0.06)'; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 30 + Math.random() * 70, 18 + Math.random() * 40, Math.random() * 3, 0, 7); g.fill(); } g.strokeStyle = 'rgba(55,45,40,0.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 1); g.lineTo(w, 1); g.moveTo(1, 0); g.lineTo(1, h); g.stroke(); });
  concT.wrapS = concT.wrapT = THREE.RepeatWrapping; concT.repeat.set(65, 65);
  { const gr = new THREE.Mesh(new THREE.PlaneGeometry(520, 520), new THREE.MeshToonMaterial({ map: concT, gradientMap: X.grad })); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; scene.add(gr); }
  const transT = CT(256, 256, (g, w, h) => { g.fillStyle = '#d3ccc2'; g.fillRect(0, 0, w, h); speck(g, w, h, 900, 0.12); g.strokeStyle = 'rgba(70,58,52,0.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 1); g.lineTo(w, 1); g.stroke(); });
  transT.wrapS = transT.wrapT = THREE.RepeatWrapping; transT.repeat.set(0.3, 0.3);
  const transM = new THREE.MeshToonMaterial({ map: transT, gradientMap: X.grad }), transM2 = new THREE.MeshToonMaterial({ map: transT, gradientMap: X.grad, side: THREE.DoubleSide });

  // ---------- terrain shapes (read by the engine's groundH through course.groundH) ----------
  const shapes = [], trenches = [], boxes = [];
  const prof = (S, u) => { if (u < 0) return null; if (u < S.L) { const q = Math.sqrt(S.R * S.R - u * u); return [S.R - q, u / Math.max(q, 0.05)]; } if (u <= S.L + S.deck) return [S.H, 0]; return null; };
  function quarter(S) { S.kind = 'q'; S.L = Math.sqrt(S.R * S.R - (S.R - S.H) ** 2); S.nx = Math.sin(S.phi); S.nz = Math.cos(S.phi); shapes.push(S);
    const pts = [V2(0, 0)]; for (let i = 1; i <= 14; i++) { const u = S.L * i / 14; pts.push(V2(u, S.R - Math.sqrt(S.R * S.R - u * u))); } if (S.deck > 0) pts.push(V2(S.L + S.deck, S.H)); pts.push(V2(S.L + S.deck, 0));
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: S.len, bevelEnabled: false, curveSegments: 1 }); geo.translate(0, 0, -S.len / 2);
    const g = new THREE.Group(); g.position.set(S.o.x, 0, S.o.z); g.rotation.y = S.phi - Math.PI / 2; scene.add(g);
    M(geo, transM, 0, 0, 0, g, 0.03);
    if (S.vert) { const cp = M(new THREE.CylinderGeometry(0.075, 0.075, S.len, 8), steel, S.L, S.H, 0, g, 0.012); cp.rotation.x = Math.PI / 2; }
    else M(new THREE.BoxGeometry(0.1, 0.03, S.len + 0.02), red, S.L - 0.05, S.H + 0.01, 0, g, 0);
    if (S.deck > 0) M(new THREE.BoxGeometry(0.16, 0.035, S.len + 0.02), red, S.L + S.deck - 0.08, S.H + 0.018, 0, g, 0);
    return S; }
  function bowl(S) { S.kind = 'b'; S.L = Math.sqrt(S.R * S.R - (S.R - S.H) ** 2); shapes.push(S); const ro = S.r0 + S.L + S.deck;
    const pts = [V2(S.r0, 0)]; for (let i = 1; i <= 14; i++) { const u = S.L * i / 14; pts.push(V2(S.r0 + u, S.R - Math.sqrt(S.R * S.R - u * u))); } pts.push(V2(ro, S.H)); pts.push(V2(ro, 0));
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, touch ? 40 : 56), transM2); m.position.set(S.cx, 0, S.cz); m.receiveShadow = true; scene.add(m);
    const fl = new THREE.Mesh(new THREE.CircleGeometry(S.r0 + 0.05, 40), new THREE.MeshToonMaterial({ color: '#c9c1b7', gradientMap: X.grad })); fl.rotation.x = -Math.PI / 2; fl.position.set(S.cx, 0.012, S.cz); scene.add(fl);
    const cp = M(new THREE.TorusGeometry(S.r0 + S.L, 0.075, 6, 72), steel, S.cx, S.H, S.cz, null, 0); cp.rotation.x = Math.PI / 2;
    const rim = M(new THREE.TorusGeometry(ro - 0.08, 0.06, 4, 72), red, S.cx, S.H + 0.02, S.cz, null, 0); rim.rotation.x = Math.PI / 2;
    const wallO = new THREE.Mesh(new THREE.CylinderGeometry(ro + 0.02, ro + 0.02, S.H, touch ? 40 : 56, 1, true), toon('#a59d93')); wallO.position.set(S.cx, S.H / 2, S.cz); scene.add(wallO);
    return S; }
  function surfAt(x, z) { let best = null;
    for (const S of shapes) { let u, nx, nz;
      if (S.kind === 'q') { const dx = x - S.o.x, dz = z - S.o.z; u = dx * S.nx + dz * S.nz; const v = dx * S.nz - dz * S.nx; if (Math.abs(v) > S.len / 2) continue; nx = S.nx; nz = S.nz; }
      else { const dx = x - S.cx, dz = z - S.cz, r = Math.hypot(dx, dz) || 1e-3; u = r - S.r0; nx = dx / r; nz = dz / r; }
      const p = prof(S, u); if (!p) continue; if (!best || p[0] > best.h) best = { S, u, h: p[0], tan: p[1], nx, nz }; }
    return best; }
  function groundH(x, z, h0) { for (const T of trenches) if (x > T.x0 && x < T.x1 && z > T.z0 && z < T.z1) return -T.d;
    let h = h0; const s = surfAt(x, z); if (s && s.h > h) h = s.h; for (const B of boxes) if (x > B.x0 && x < B.x1 && z > B.z0 && z < B.z1 && B.h > h) h = B.h; return h; }

  // the park: main lane runs south → north (cones, gaps, rails, kicker); half-pipe on the east, bowl on the west
  const kicker = quarter({ o: { x: 0, z: 44 }, phi: 0, len: 6, R: 4, H: 1.4, deck: 0, vert: false });
  const pipeW = 3, PIPE = { x: 28, z0: -18, z1: 18 };
  quarter({ o: { x: PIPE.x - pipeW, z: 0 }, phi: -Math.PI / 2, len: 36, R: 4.2, H: 2.2, deck: 2.5, vert: true, pipe: true });
  quarter({ o: { x: PIPE.x + pipeW, z: 0 }, phi: Math.PI / 2, len: 36, R: 4.2, H: 2.2, deck: 2.5, vert: true, pipe: true });
  { const fl = new THREE.Mesh(new THREE.PlaneGeometry(pipeW * 2, 36), new THREE.MeshToonMaterial({ color: '#cbc3b9', gradientMap: X.grad })); fl.rotation.x = -Math.PI / 2; fl.position.set(PIPE.x, 0.011, 0); scene.add(fl); }
  const BOWL = bowl({ cx: -27, cz: 0, r0: 4.5, R: 4.2, H: 2.2, deck: 2.5, vert: true });
  X.addRamp({ x: -11, z: 0, yaw: -Math.PI / 2, w: 4, l: 5.3, h: 2.2, top: 0 }, '#c7bfb5');
  for (const [x0, x1] of [[-8, -7], [7, 8]]) { boxes.push({ x0, x1, z0: -6, z1: 20, h: 0.5 }); M(new THREE.BoxGeometry(1, 0.5, 26), toon('#aaa197'), (x0 + x1) / 2, 0.25, 7, null, 0.02); M(new THREE.BoxGeometry(1.04, 0.04, 26), red, (x0 + x1) / 2, 0.52, 7, null, 0); }
  const GAPS = [[-3, -1], [5, 7.6], [14, 17.2]].map(([z0, z1]) => ({ x0: -6, x1: 6, z0, z1, d: 1.4, done: false }));
  const hazT = CT(256, 32, (g, w, h) => { for (let i = -1; i < 9; i++) { g.fillStyle = i % 2 ? '#201e1d' : '#ffd23a'; g.beginPath(); g.moveTo(i * 32, h); g.lineTo(i * 32 + 32, h); g.lineTo(i * 32 + 48, 0); g.lineTo(i * 32 + 16, 0); g.fill(); } }); hazT.wrapS = THREE.RepeatWrapping; hazT.repeat.set(3, 1);
  for (const T of GAPS) { trenches.push(T); const w = T.x1 - T.x0, d = T.z1 - T.z0, cz = (T.z0 + T.z1) / 2;
    const pit = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ color: 0x14111c })); pit.rotation.x = -Math.PI / 2; pit.position.set(0, 0.016, cz); scene.add(pit);
    for (const ez of [T.z0, T.z1]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.45), new THREE.MeshBasicMaterial({ map: hazT })); e.rotation.x = -Math.PI / 2; e.position.set(0, 0.02, ez + (ez === T.z0 ? -0.22 : 0.22)); scene.add(e); } }
  const RAILS = [{ x0: -3.5, z0: 24, x1: -3.5, z1: 38, h: 0.55 }, { x0: 3.5, z0: 24, x1: 3.5, z1: 38, h: 0.55 }];
  RAILS.forEach(r => X.addRail(r, '#ffd23a'));

  // ---------- graffiti walls, skyline, lamps ----------
  const GCOL = ['#ec3013', '#ffd23a', '#38bdf8', '#f472b6', '#a3e635', '#f3f2f2', '#a78bfa'];
  const pk = a => a[Math.floor(Math.random() * a.length)];
  function graffiti(word) { return CT(1024, 256, (g, w, h) => { g.fillStyle = '#9f978d'; g.fillRect(0, 0, w, h); speck(g, w, h, 1500, 0.15);
    for (let i = 0; i < 7; i++) { g.fillStyle = pk(GCOL); g.globalAlpha = 0.75; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 40 + Math.random() * 120, 20 + Math.random() * 60, Math.random() * 3, 0, 7); g.fill(); } g.globalAlpha = 1;
    const c1 = pk(GCOL), c2 = pk(GCOL.filter(c => c !== c1)), fs = word.length > 6 ? 128 : 160; g.font = `900 italic ${fs}px Archivo, sans-serif`; g.textBaseline = 'middle'; g.lineJoin = 'round'; const tw = g.measureText(word).width, x = (w - tw) / 2 + rr(-60, 60), y = h / 2 + 8;
    g.save(); g.translate(w / 2, h / 2); g.rotate(rr(-0.06, 0.06)); g.translate(-w / 2, -h / 2);
    g.lineWidth = 34; g.strokeStyle = '#201e1d'; g.strokeText(word, x + 8, y + 8); g.strokeText(word, x, y); const gr = g.createLinearGradient(0, y - fs / 2, 0, y + fs / 2); gr.addColorStop(0, c1); gr.addColorStop(0.55, c1); gr.addColorStop(0.56, c2); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillText(word, x, y);
    g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.strokeText(word, x - 3, y - 4);
    g.fillStyle = c2; for (let i = 0; i < 10; i++) { const dx = x + Math.random() * tw; g.fillRect(dx, y + fs * 0.35, 5, 14 + Math.random() * 46); } g.restore();
    g.font = '700 italic 34px Archivo, sans-serif'; g.fillStyle = '#201e1d'; g.fillText(pk(['8 GATES', 'TONY WAS HERE', 'SKATE OR DIE', 'MERU CREW', 'NO BAILS']), rr(20, 700), rr(30, 60));
    for (let i = 0; i < 4; i++) { const sx = Math.random() * w, sy = Math.random() * h, r = 12 + Math.random() * 14; g.fillStyle = pk(GCOL); g.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, rr2 = k % 2 ? r * 0.45 : r; g.lineTo(sx + Math.cos(a) * rr2, sy + Math.sin(a) * rr2); } g.fill(); } }); }
  const WORDS = ['8 GATES', 'SKATE', 'GRIND', 'FOX', 'TONY', 'OLLIE', 'SHRED', 'MERU', 'AIR', 'FLIP', 'PIPE', 'CREW'], gTex = WORDS.map(graffiti);
  { const H = 3.4, wallM = toon('#8f877d'); let k = 0;
    const run = (ax, az, bx, bz, nx, nz) => { const L = Math.hypot(bx - ax, bz - az), n = Math.round(L / 11), yaw = Math.atan2(bx - ax, bz - az); for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = ax + (bx - ax) * u, z = az + (bz - az) * u, seg = L / n;
      const b = M(new THREE.BoxGeometry(0.6, H, seg + 0.02), wallM, x - nx * 0.3, H / 2, z - nz * 0.3, null, 0.02); b.rotation.y = yaw; b.castShadow = false;
      const p = new THREE.Mesh(new THREE.PlaneGeometry(seg, H - 0.3), new THREE.MeshToonMaterial({ map: gTex[k++ % gTex.length], gradientMap: X.grad })); p.position.set(x + nx * 0.02, H / 2 - 0.1, z + nz * 0.02); p.rotation.y = Math.atan2(nx, nz); scene.add(p);
      M(new THREE.BoxGeometry(0.7, 0.14, seg + 0.04), ink, x - nx * 0.3, H + 0.07, z - nz * 0.3, null, 0).rotation.y = yaw; } };
    run(PARK.x0, PARK.z1, PARK.x1, PARK.z1, 0, -1); run(PARK.x0, PARK.z0, PARK.x1, PARK.z0, 0, 1); run(PARK.x0, PARK.z0, PARK.x0, PARK.z1, 1, 0); run(PARK.x1, PARK.z0, PARK.x1, PARK.z1, -1, 0); }
  { const sk = [toon('#4a2f52'), toon('#5a3a5e'), toon('#3e2948')]; for (let i = 0; i < (touch ? 22 : 34); i++) { const a = i / (touch ? 22 : 34) * TAU + rr(-0.05, 0.05), d = rr(150, 230), h = rr(10, 42), w = rr(8, 18); const b = M(new THREE.BoxGeometry(w, h, w), sk[i % 3], Math.cos(a) * d, h / 2, 4 + Math.sin(a) * d, null, 0); b.castShadow = false; } }
  const lampGlow = () => new THREE.SpriteMaterial({ map: X.glowTex, color: 0xffd98a, transparent: true, depthWrite: false, opacity: 0.9, blending: THREE.AdditiveBlending });
  const LAMPS = [];
  function lamp(x, z, sx = 1) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); M(new THREE.CylinderGeometry(0.09, 0.11, 4.4, 6), ink, 0, 2.2, 0, g, 0); M(new THREE.BoxGeometry(0.7, 0.22, 0.36), ink, -sx * 0.3, 4.4, 0, g, 0);
    const s = new THREE.Sprite(lampGlow()); s.position.set(-sx * 0.4, 4.2, 0); s.scale.setScalar(2.6); g.add(s); LAMPS.push([x, z]); }
  for (let z = -56; z <= 64; z += 12) { lamp(-10, z, -1); lamp(10, z, 1); }
  for (let z = -16; z <= 16; z += 8) { lamp(PIPE.x - 10.4, z, -1); lamp(PIPE.x + 10.4, z, 1); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.2; if (Math.abs(wrap(a)) < 0.45) continue; lamp(BOWL.cx + Math.cos(a) * 12, BOWL.cz + Math.sin(a) * 12, Math.cos(a) > 0 ? 1 : -1); }

  // painted lesson numbers on the concrete
  function label(n, s, x, z, yaw = 0) { const t = CT(1024, 256, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 30, 200, 196); g.fillStyle = '#f3f2f2'; g.font = '900 170px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(n, 50, 136); g.font = '900 112px Archivo, sans-serif'; g.fillText(s, 236, 136); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); m.rotation.set(-Math.PI / 2, 0, yaw + Math.PI); m.position.set(x, 0.022, z); scene.add(m); }
  label('1', 'PUSH', 0, -40); label('2', 'OLLIE', 0, -8); label('3', 'GRIND', 0, 21.5); label('4', 'AIR', 0, 40.5); label('5', 'PIPE', PIPE.x, -22);

  // ---------- cone gates ----------
  const GATES = [], coneGeo = new THREE.ConeGeometry(0.34, 0.9, 12), bandGeo = new THREE.CylinderGeometry(0.21, 0.26, 0.14, 12);
  for (let k = 0; k < 6; k++) { const gx = k % 2 ? 3 : -3, gz = -34 + k * 5, G0 = { x: gx, z: gz, done: false, cones: [] };
    for (const sx of [-1.7, 1.7]) { const g = new THREE.Group(); g.position.set(gx + sx, 0, gz); scene.add(g); M(coneGeo, cone, 0, 0.45, 0, g, 0.015); M(bandGeo, white, 0, 0.5, 0, g, 0); M(new THREE.BoxGeometry(0.8, 0.06, 0.8), cone, 0, 0.03, 0, g, 0.01); G0.cones.push({ g, x: gx + sx, z: gz, fall: 0, dir: 1 }); }
    const ln = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.16), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.85 })); ln.rotation.x = -Math.PI / 2; ln.position.set(gx, 0.02, gz); scene.add(ln); G0.ln = ln; GATES.push(G0); }
  const allCones = GATES.flatMap(g => g.cones);
  for (const [x, z] of [[-14, -54], [-15.4, -55], [-14.6, -52.6], [15, -50], [14, -48.6]]) X.crate(x, z);

  // ---------- chalkboard + COACH TONY ----------
  const boardCv = document.createElement('canvas'); boardCv.width = 1600; boardCv.height = 900;
  const boardCvP = document.createElement('canvas'); boardCvP.width = 900; boardCvP.height = 1600;
  const boardTex = new THREE.CanvasTexture(boardCv); boardTex.colorSpace = THREE.SRGBColorSpace; boardTex.anisotropy = 8;
  const BD = { x: -12, z: -44, yaw: Math.atan2(0 - -12, -52 - -44) };
  { const g = new THREE.Group(); g.position.set(BD.x, 0, BD.z); g.rotation.y = BD.yaw; scene.add(g); const wood = toon('#7a4f2a');
    for (const side of [1, -1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 3.15), new THREE.MeshBasicMaterial({ map: boardTex })); pl.position.set(0, 3.1, 0.08 * side); if (side < 0) pl.rotation.y = Math.PI; g.add(pl); }
    M(new THREE.BoxGeometry(6, 3.5, 0.14), wood, 0, 3.1, 0, g, 0.03); for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.16, 4.9, 0.16), wood, sx * 2.7, 2.3, -0.2, g, 0.01); M(new THREE.BoxGeometry(5.8, 0.1, 0.36), wood, 0, 1.35, 0.18, g, 0.01); }
  const TONY_LOOK = { ...X.CAST.player.look, fur: '#f4f7fa', furDark: '#c9d3dc', muzzle: '#ffffff', chin: '#ffffff', snout: '#eef3f7', paw: '#e9eef2', tailBase: '#dfe6ec', tailMid: '#f4f7fa', tailTip: '#ffffff', ear: '#3b4654', earInner: '#c7a1b4', fluff: '#ffffff', leg: '#3a3836', boot: '#201e1d' };
  const tony = X.kit.makeFox({ ...X.CAST.player, look: TONY_LOOK, torso: ['#ec3013', '#201e1d', '#f3f2f2'], outfit: 'vest', crest: '', gear: 'none', eyes: ['#7dd3fc', '#7dd3fc'], mood: 'neutral' });
  const TP = tony.userData.P; if (TP.sword) TP.sword.visible = false; if (TP.gun) TP.gun.visible = false;
  (TP.legs || []).forEach(l => { M(new THREE.BoxGeometry(0.24, 0.13, 0.12), ink, 0, -0.27, 0.1, l, 0.01); M(new THREE.BoxGeometry(0.25, 0.03, 0.125), red, 0, -0.27, 0.1, l, 0); });
  if (TP.arms && TP.arms[0]) { const a = TP.arms[0]; a.rotation.x = -0.9; const cb = new THREE.Group(); cb.position.set(0, -0.36, 0.12); cb.rotation.x = 0.9; a.add(cb); M(new THREE.BoxGeometry(0.3, 0.4, 0.03), toon('#9a6b3c'), 0, 0, 0, cb, 0.012); M(new THREE.BoxGeometry(0.26, 0.32, 0.01), white, 0, -0.02, 0.02, cb, 0); M(new THREE.BoxGeometry(0.12, 0.05, 0.03), steel, 0, 0.19, 0.02, cb, 0); }
  { const sw = new THREE.Group(); sw.position.set(0, 1.12, 0.33); TP.body.add(sw); M(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 16), steel, 0, 0, 0, sw, 0.008).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), white, 0, 0, 0.004, sw, 0).rotation.x = Math.PI / 2; M(new THREE.BoxGeometry(0.03, 0.03, 0.03), red, 0, 0.09, 0, sw, 0); }
  tony.position.set(-7.6, 0, -43); scene.add(tony); const TONY = { x: -7.6, z: -43, hop: 0 };
  const bubCv = document.createElement('canvas'); bubCv.width = 768; bubCv.height = 160; const bubTex = new THREE.CanvasTexture(bubCv); bubTex.colorSpace = THREE.SRGBColorSpace;
  const bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubTex, transparent: true, depthTest: false })); bub.scale.set(5.4, 1.12, 1); bub.position.set(TONY.x, 3.5, TONY.z); bub.renderOrder = 9; scene.add(bub); let bubText = '';
  function tonySay(s) { if (s === bubText) return; bubText = s; const g = bubCv.getContext('2d'); g.clearRect(0, 0, 768, 160); g.font = '800 40px Archivo, sans-serif'; const w = Math.min(760, g.measureText(s).width + 56); g.fillStyle = '#f3f2f2'; g.fillRect(4, 4, w, 108); g.strokeStyle = '#201e1d'; g.lineWidth = 6; g.strokeRect(4, 4, w, 108); g.beginPath(); g.moveTo(40, 112); g.lineTo(70, 150); g.lineTo(90, 112); g.closePath(); g.fillStyle = '#f3f2f2'; g.fill(); g.stroke(); g.fillStyle = '#201e1d'; g.textBaseline = 'middle'; g.fillText(s, 32, 60, w - 50); bubTex.needsUpdate = true; }
  tonySay('Read the board. Then skate.');

  // ---------- the chalk sheet ----------
  function drawBoard(g, P = false) {
    const W = P ? 900 : 1600, H = P ? 1600 : 900, J = (n = 1.6) => (Math.random() - 0.5) * n * 2;
    g.fillStyle = '#7a4f2a'; g.fillRect(0, 0, W, H); const x0 = 34, y0 = 34, w = W - 68, h = H - 98; g.fillStyle = '#1f2b27'; g.fillRect(x0, y0, w, h);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.beginPath(); g.ellipse(x0 + Math.random() * w, y0 + Math.random() * h, 60 + Math.random() * 200, 20 + Math.random() * 60, Math.random() * 3, 0, 7); g.fill(); }
    const CH = '#f2f1e8', YL = '#f5e08a', RD = '#ff9a8a', BL = '#9fd8f5', HF = '"Caveat", "Segoe Print", "Bradley Hand", cursive';
    const txt = (s, x, y, size, col = CH, wt = 800, fam = 'Archivo, sans-serif') => { g.font = `${wt} ${size}px ${fam}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.fillStyle = col; g.globalAlpha = 0.92; g.fillText(s, x, y); g.globalAlpha = 0.28; g.fillText(s, x + 1.6, y + 1.2); g.globalAlpha = 1; };
    const hw = (s, x, y, size, col = YL) => txt(String(s).toUpperCase(), x, y, size, col, 700, HF);
    const ln = (pts, col = CH, wd = 5, close) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = 0.9; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + J(), y + J()) : g.moveTo(x + J(), y + J())); if (close) g.closePath(); g.stroke(); g.globalAlpha = 1; };
    const circ = (x, y, r, col = CH, wd = 5) => { g.strokeStyle = col; g.lineWidth = wd; g.globalAlpha = 0.9; g.beginPath(); g.arc(x + J(), y + J(), r, 0, TAU); g.stroke(); g.globalAlpha = 1; };
    const arrow = (x1, y1, x2, y2, col = YL) => { ln([[x1, y1], [(x1 + x2) / 2 + 12, (y1 + y2) / 2 - 10], [x2, y2]], col, 4); const a = Math.atan2(y2 - y1, x2 - x1); ln([[x2 - Math.cos(a - 0.5) * 22, y2 - Math.sin(a - 0.5) * 22], [x2, y2], [x2 - Math.cos(a + 0.5) * 22, y2 - Math.sin(a + 0.5) * 22]], col, 4); };
    txt('SKATE PARK', 86, 150, P ? 104 : 112, CH, 900); txt('COACH TONY  ·  6 LESSONS  +  THE CONTEST', 90, 202, P ? 26 : 32, YL, 800); ln([[88, 226], [P ? 800 : 820, 222]], CH, 4);
    // the board, side view
    g.save(); if (P) { g.translate(-560, 160); g.scale(0.92, 0.92); } else g.translate(0, 40);
    { const dk = []; for (let i = 0; i <= 20; i++) { const u = i / 20, x = 930 + u * 560; let y = 300; if (u < 0.12) y -= (0.12 - u) / 0.12 * 46; if (u > 0.88) y -= (u - 0.88) / 0.12 * 46; dk.push([x, y]); } ln(dk, CH, 9); ln(dk.map(([x, y]) => [x, y + 16]), CH, 4);
      for (const tx of [1040, 1380]) { ln([[tx - 40, 318], [tx + 40, 318], [tx + 22, 344], [tx - 22, 344]], CH, 5, true); for (const wx of [tx - 34, tx + 34]) { circ(wx, 362, 22, CH, 5); circ(wx, 362, 6, CH, 3); } }
      hw('3  Ollie', 1150, 196, 40); arrow(1210, 210, 1210, 268, YL);
      hw('2  Trick', 1460, 220, 38, RD); g.strokeStyle = RD; g.lineWidth = 4; g.globalAlpha = 0.9; g.beginPath(); g.arc(1480, 300, 46, -2.6, 1.9); g.stroke(); g.globalAlpha = 1; arrow(1470, 342, 1442, 330, RD);
      hw('1  Whack', 820, 300, 36, BL); arrow(900, 290, 930, 296, BL);
      hw('Tap 2 = kickflip', 940, 440, 34, CH); hw('Hold 2 = it keeps flipping:', 940, 482, 34, CH); hw('double, 360 tre flip, bigger...', 940, 524, 34, YL); hw('Let go before you land!', 940, 572, 38, RD); }
    g.restore();
    // controls drawn as the real pad
    g.save(); if (P) { g.translate(-10, 560); g.scale(1.1, 1.1); }
    const rows = [['STICK', 'WASD', 'Push + steer  ·  let go to coast', CH], ['1', 'J', 'Board whack  ·  smash the boxes', BL], ['2', 'K', 'Trick  ·  ground: hold = manual', RD], ['3', 'SPACE', 'Ollie  ·  on a rail = ollie out', YL], ['EYE', 'HOLD TO LOOK  ·  TAP = POV', 'Look around', CH]];
    rows.forEach(([k, kb, d, col], i) => { const y = 310 + i * 100, cx = 150, cy = y - 14;
      if (k === 'STICK') { circ(cx, cy, 31, CH, 4); g.globalAlpha = 0.5; g.fillStyle = CH; g.beginPath(); g.arc(cx + 6, cy - 9, 14, 0, 7); g.fill(); g.globalAlpha = 1; circ(cx + 6, cy - 9, 14, CH, 4); }
      else if (k === 'EYE') { circ(cx, cy, 30, CH, 4); ln([[cx - 19, cy], [cx - 9, cy - 8], [cx, cy - 10], [cx + 9, cy - 8], [cx + 19, cy], [cx + 9, cy + 8], [cx, cy + 10], [cx - 9, cy + 8]], CH, 3, true); g.fillStyle = CH; g.beginPath(); g.arc(cx, cy, 4, 0, 7); g.fill(); }
      else { g.globalAlpha = 0.9; g.strokeStyle = col; g.lineWidth = 9; g.beginPath(); g.arc(cx, cy, 30, 0, 7); g.stroke(); g.globalAlpha = 1; circ(cx, cy, 22, CH, 2); g.font = '900 34px Archivo, sans-serif'; g.textAlign = 'center'; g.fillStyle = CH; g.fillText(k, cx, cy + 12); g.textAlign = 'left'; }
      txt(kb, 230, y - 24, 18, '#b9c4bf', 800); txt(d, 230, y + 4, P ? 30 : 32, CH, 700); });
    g.restore();
    { const s = P ? ['1 PUSH  2 OLLIE  3 GRIND', '4 AIR  5 PIPE  6 COMBO'] : ['1 PUSH   2 OLLIE   3 GRIND   4 AIR   5 PIPE   6 COMBO']; s.forEach((l, i) => hw(l, 90, H - 120 - (s.length - 1 - i) * 52, P ? 46 : 44, YL)); }
    g.fillStyle = '#5e3c1f'; g.fillRect(0, H - 64, W, 64); g.fillStyle = '#7a4f2a'; g.fillRect(0, H - 64, W, 10); for (let k = 0; k < 4; k++) { g.fillStyle = ['#f2f1e8', '#f5e08a', '#ff9a8a', '#f2f1e8'][k]; g.fillRect(260 + k * 120, H - 48, 70, 16); }
    for (let i = 0; i < 5000; i++) { g.fillStyle = 'rgba(31,43,39,0.55)'; g.fillRect(x0 + Math.random() * w, y0 + Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
  const paintBoards = () => { drawBoard(boardCv.getContext('2d')); drawBoard(boardCvP.getContext('2d'), true); boardTex.needsUpdate = true; course.boardURL = boardCv.toDataURL('image/jpeg', 0.9); course.boardURLP = boardCvP.toDataURL('image/jpeg', 0.9); course.onPaint && course.onPaint(); };
  try { if (!document.getElementById('font-caveat')) { const lk = document.createElement('link'); lk.id = 'font-caveat'; lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap'; document.head.appendChild(lk); } } catch (e) {}

  // ---------- lo-fi loop (synth until Ben uploads the MP3s) ----------
  const MU = { next: 0, step: 0, bus: null }, CHORDS = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], mf = n => 440 * Math.pow(2, (n - 69) / 12);
  function env(c, node, t, a, peak, d) { const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(peak, t + a); gn.gain.exponentialRampToValueAtTime(0.0001, t + a + d); node.connect(gn); gn.connect(MU.bus); return gn; }
  function noise(c, t, type, f, peak, d) { const s = c.createBufferSource(); s.buffer = X.audio.noise; const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; s.connect(b); env(c, b, t, 0.003, peak, d); s.start(t, Math.random()); s.stop(t + d + 0.05); }
  function musicStep() { const a = X.audio, c = a.ctx; if (!c || !a.master || !a.noise) return;
    if (!MU.bus) { MU.bus = c.createGain(); MU.bus.gain.value = 0.55; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; MU.bus.disconnect(); MU.bus.connect(lp); lp.connect(a.master); }
    const spb = 60 / 78 / 4; if (MU.next < c.currentTime) MU.next = c.currentTime + 0.05;
    while (MU.next < c.currentTime + 0.25) { const s = MU.step, b = s % 16, ch = CHORDS[Math.floor(s / 16) % 4], t = MU.next;
      if (b === 0) ch.forEach((n, i) => { const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = mf(n); o.detune.value = rr(-8, 8); env(c, o, t + i * 0.02, 0.25, 0.022, spb * 15); o.start(t); o.stop(t + spb * 16 + 0.3); });
      if (b === 0 || b === 8) { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = mf(ch[0] - 12); env(c, o, t, 0.02, 0.07, spb * 6); o.start(t); o.stop(t + spb * 7); }
      if (b === 0 || b === 10) { const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.22); env(c, o, t, 0.004, 0.2, 0.26); o.start(t); o.stop(t + 0.32); }
      if (b === 4 || b === 12) noise(c, t, 'bandpass', 1700, 0.07, 0.16);
      if (b % 2 === 0) noise(c, t, 'highpass', 7000, b % 4 === 2 ? 0.02 : 0.012, 0.04);
      MU.step++; MU.next += spb * (b % 2 ? 0.88 : 1.12); } }

  // ---------- state ----------
  const G = { phase: 'ready', board: true, place: 'school', t: 0, pts: 0, les: 0, cnt: 0, nextT: 0, count: 0, banner: '', bannerT: 0, radio: '', radioT: 0, flash: null, flashT: 0, done: null, bails: 0, bestTrick: null, bestCombo: 0, bestComboN: 0, slipV: 0, spin: 0, stuckT: 0, cp: [0, -52, 0], ending: 0, b2: null, autoFlip: 0, manT: 0, bail: null };
  const CB = { n: 0, pot: 0, idle: 0 };
  let T = null, A = null, P = null;
  const banner = (s, t = 3) => { G.banner = s; G.bannerT = t; }, radio = (s, t = 6) => { G.radio = s; G.radioT = t; }, flash = (txt, col = '#ffd23a', t = 1.6) => { G.flash = { txt, col }; G.flashT = t; };
  const PL = () => PLACES.find(p => p.id === G.place);
  const fmtT = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') + '.' + Math.floor((s % 1) * 10);
  const C = () => X.C, Vv = () => X.V;
  function snapP() { const c = C(); P = { x: c.x, z: c.z, y: c.y, g: c.ground, grind: !!c.grind }; }
  function tp(x, z, yaw = 0) { const c = C(), V = Vv(); X.place(x, z, yaw); c.grind = null; c.manual = false; c.whackT = null; c.slip = 0; if (V && V.deck) V.deck.rotation.set(0, 0, 0); if (V && V.body) V.body.rotation.z = 0; T = null; A = null; G.slipV = 0; G.spin = 0; G.bail = null; G.b2 = null; G.autoFlip = 0; snapP(); }
  function resetRun() { G.t = 0; G.pts = 0; G.bails = 0; G.bestTrick = null; G.bestCombo = 0; G.bestComboN = 0; G.done = null; G.flash = null; G.banner = ''; G.radio = ''; G.nextT = 0; G.ending = 0; CB.n = CB.pot = CB.idle = 0; GATES.forEach(g => { g.done = false; g.ln.material.color.setHex(0xffd23a); }); GAPS.forEach(t => t.done = false); allCones.forEach(c => { c.fall = 0; c.g.rotation.set(0, 0, 0); }); }

  // ---------- moves, combos, bails ----------
  function addMove(name, pts) { const c = C(); CB.n++; CB.pot += pts; CB.idle = 0; X.popup(tmp.set(c.x, c.y + 2.8, c.z), name + ' +' + pts, '#ffd23a'); if (!G.bestTrick || pts > G.bestTrick.pts) G.bestTrick = { name, pts }; X.audio.tone(880 + CB.n * 110, 0.08, 0.04, 'triangle', 1.4); }
  function bank() { if (!CB.n) return; const v = CB.pot * CB.n, n = CB.n; G.pts += v; if (v > G.bestCombo) { G.bestCombo = v; G.bestComboN = n; } if (n >= 2) { flash('COMBO ×' + n + ' · +' + v, '#ffd23a', 1.8); X.audio.tone(660, 0.1, 0.05, 'square', 1.5); setTimeout(() => X.audio.tone(990, 0.14, 0.05, 'square', 1.5), 110); }
    CB.n = CB.pot = CB.idle = 0; if (G.place === 'school' && LESSONS[G.les].id === 'combo' && n >= 3) lesCount(); }
  function bail(why = 'BAIL', lose = 50) { if (G.bail) return; const c = C(), V = Vv(); G.bail = { t: 0 }; c.speed *= 0.15; c.manual = false; if (V && V.deck) V.deck.rotation.z = 0; T = null; G.spin = 0; CB.n = CB.pot = CB.idle = 0; const lost = Math.min(lose, G.pts); G.pts -= lost; G.bails++;
    flash(why + (lost ? ' · −' + lost : ''), '#ec3013', 1.8); X.St.shake = Math.max(X.St.shake, 0.45); X.puff(tmp.set(c.x, c.y + 0.3, c.z), 0xb8a77a, 10, 2.5, 0.8, 0.7); X.audio.burst(0.3, 420, 0.25); X.audio.tone(180, 0.3, 0.05, 'sawtooth', 0.5); if (Math.random() < 0.5 && !DM.on) radio(BAILS[Math.floor(Math.random() * BAILS.length)], 3); }
  function startTrick(held) { T = { rot: 0, held, target: held ? 0 : TAU, vert: !!(A && A.vert) }; X.audio.burst(0.06, 1500, 0.1); }
  function releaseTrick() { if (!T || !T.held) return; T.held = false; T.target = Math.max(1, Math.ceil(T.rot / TAU - 0.15)) * TAU; }
  function completeTrick() { const lvl = Math.round(T.target / TAU), [nm, p0] = TRICKS[Math.min(lvl, TRICKS.length) - 1], vert = T.vert, pts = Math.round(p0 * (vert ? 1.5 : 1)); const V = Vv(); if (V && V.deck) V.deck.rotation.z = 0; T = null; G.spin = 0; if (A) A.tricks++; addMove((vert ? 'VERT ' : '') + nm, pts); }
  function endManual() { const c = C(); if (!c.manual) return; c.manual = false; const t = G.manT; G.manT = 0; if (t >= 0.6) addMove('MANUAL ' + t.toFixed(1) + ' S', Math.round(25 + t * 40)); }
  function trickBtn(down) { const c = C();
    if (down) { const air = !c.ground && !c.grind; G.b2 = { t0: G.t, air }; if (air && !T) startTrick(true); return; }
    const b = G.b2; G.b2 = null; if (!b) return;
    if (T && T.held) releaseTrick();
    else if (c.manual) endManual();
    else if (!b.air && G.t - b.t0 < 0.2 && c.ground && !c.grind) { G.autoFlip = 0.35; X.press(3, true); X.press(3, false); } }

  // ---------- lessons ----------
  function lesEnter(i, quiet) { G.les = i; G.cnt = 0; G.stuckT = 0; const L = LESSONS[i]; G.cp = L.start; tp(...L.start); if (!quiet) { banner('LESSON ' + (i + 1) + ' · ' + L.name, 3); radio(L.radio, 8); } tonySay(L.name + '. Go.'); }
  function lesCount() { if (G.place !== 'school' || G.nextT || DM.on || G.phase !== 'run') return; G.cnt++; G.stuckT = 0; X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.4); if (G.cnt >= LESSONS[G.les].need) lesPass(); }
  function lesPass() { bank(); G.pts += 200; flash('LESSON ' + (G.les + 1) + ' PASSED · +200', '#ffd23a', 2.2); radio(PASS[G.les] || PASS[0], 4); tonySay(PASS[G.les] || 'Good.'); TONY.hop = 1; G.nextT = 2.2; }
  function finish() { if (DM.on || G.phase === 'done') return; if (!G.bail) bank(); const pd = PL(), sch = G.place === 'school', tb = sch ? Math.max(0, Math.round((pd.target - G.t) * 5)) : 0, total = Math.round(G.pts + tb), key = 'skate.park.' + G.place + '.best';
    let nb = false, best = total, trophy = false, has = false; try { nb = save.best(key, total); best = save.stat(key, total); if (sch) save.setFlag('skateSchool'); has = save.flag('skateTrophy'); if (!sch && total >= TROPHY_SCORE && !has) { save.setFlag('skateTrophy'); save.give('skateTrophy', 1); trophy = true; has = true; } save.addGold && save.addGold(Math.round(total / 100)); } catch (e) {}
    const th = sch ? [2600, 2000, 1400, 800] : [3200, TROPHY_SCORE, 1300, 700], grade = total >= th[0] ? 'S' : total >= th[1] ? 'A' : total >= th[2] ? 'B' : total >= th[3] ? 'C' : 'D';
    const rows = [['Time', fmtT(G.t) + (sch ? ' / target ' + fmtT(pd.target).slice(0, -2) : '')], ...(sch ? [['Lessons passed', '6 / 6']] : []), ['Best combo', G.bestCombo ? G.bestCombo + ' (×' + G.bestComboN + ')' : '—'], ['Best trick', G.bestTrick ? G.bestTrick.name : '—'], ['Bails', String(G.bails)], ...(sch ? [['Time bonus', '+' + tb]] : [['Trophy', trophy ? 'WON · GOES HOME' : has ? 'ON YOUR SHELF' : 'SCORE ' + TROPHY_SCORE]])];
    G.done = { id: G.place, name: pd.name, title: sch ? 'Skate school passed' : trophy ? 'You won the trophy' : 'Contest over', next: sch ? 'contest' : null, total, grade, newBest: nb, best, gold: Math.round(total / 100), rows, trophy };
    G.phase = 'done'; X.setPaused(true); X.drive(0, 0);
    radio(sch ? 'You can skate. Now show me in the contest.' : trophy ? 'Fine. You earned it. Take it home.' : 'Not enough. ' + TROPHY_SCORE + ' wins the trophy. Again.', 8); tonySay(sch ? 'Contest next.' : trophy ? 'Champion. Do not gloat.' : 'Again.'); }
  function rollOut(id = G.place) { X.audio.init && X.audio.init(); DM.on = false; resetRun(); G.place = PLACES.some(p => p.id === id) ? id : 'school'; G.board = false; G.phase = 'count'; G.count = 3.2; X.setPaused(false);
    if (G.place === 'school') lesEnter(0, true); else { G.cp = [0, -46, 0]; tp(0, -46, 0); } banner(G.place === 'school' ? 'SKATE SCHOOL · LESSON 1' : 'THE CONTEST · 60 S', 3); }

  // ---------- guidance ----------
  function nextGoal() { if (G.place === 'online') { if (NT.mode !== 'laps' || NT.fin) return null; const p = LAP_CPS[NT.cp]; return { x: p.x, z: p.z, label: p.label }; }
    if (G.place !== 'school' || G.nextT) return null; const id = LESSONS[G.les].id, c = C();
    if (id === 'push') { const g = GATES.find(q => !q.done); return g ? { x: g.x, z: g.z, label: 'GATE ' + (GATES.indexOf(g) + 1) } : null; }
    if (id === 'ollie') { const t = GAPS.find(q => !q.done); return t ? { x: 0, z: (t.z0 + t.z1) / 2, label: 'GAP ' + (GAPS.indexOf(t) + 1) } : null; }
    if (id === 'grind') { const r = RAILS.reduce((a, b) => Math.hypot(b.x0 - c.x, b.z0 - c.z) < Math.hypot(a.x0 - c.x, a.z0 - c.z) ? b : a); return { x: r.x0, z: r.z0 + 1, label: 'RAIL' }; }
    if (id === 'air') return { x: 0, z: 46, label: 'KICKER' };
    if (id === 'pipe') return Math.abs(c.x - PIPE.x) < 9 && c.z > PIPE.z0 - 2 && c.z < PIPE.z1 + 2 ? null : { x: PIPE.x, z: PIPE.z0 + 2, label: 'HALF-PIPE' };
    return null; }

  // ---------- per-frame ----------
  function update(dt, thr) {
    musicStep(); const c = C(), V = Vv(); if (!V) return;
    tony.rotation.y = damp(tony.rotation.y, Math.atan2(c.x - TONY.x, c.z - TONY.z), 3, Math.max(dt, 1 / 120)); TONY.hop = Math.max(0, TONY.hop - dt * 1.4); tony.position.y = Math.abs(Math.sin(TONY.hop * Math.PI * 3)) * 0.4 * TONY.hop;
    for (const q of allCones) if (q.fall > 0 && q.fall < 1) { q.fall = Math.min(1, q.fall + dt * 4); q.g.rotation.x = q.dir * q.fall * 1.45; q.g.position.y = q.fall * 0.25; }
    netFrame();
    if (!dt) { if (!P) snapP(); return; }
    if (DM.on) demoStep(dt);
    G.bannerT -= dt; if (G.bannerT <= 0) G.banner = ''; G.radioT -= dt; if (G.radioT <= 0) G.radio = ''; G.flashT -= dt; if (G.flashT <= 0) G.flash = null;
    if (G.phase === 'count') { G.count -= dt; const s = G.cp; c.x = s[0]; c.z = s[1]; c.speed = 0; if (G.count <= 0) { G.phase = 'run'; G.count = 0; banner('GO!', 1); X.audio.tone(880, 0.3, 0.06, 'square', 1.5); if (G.place === 'school') radio(LESSONS[0].radio, 8); else if (G.place === 'online') radio(NT.mode === 'laps' ? 'Three laps. Ride through the arches in order. Ram a rival to knock them down.' : 'Sixty seconds. Land tricks. Ram a rival to knock them down and steal their points.', 5); else radio('Sixty seconds. Chain your tricks. Do not bail.', 5); } else { const n = Math.ceil(G.count); if (n !== G.lastN) { G.lastN = n; if (n <= 3) X.audio.tone(440, 0.15, 0.05, 'square', 1); } } snapP(); return; }
    if (G.phase !== 'run') { snapP(); return; }
    if (!P) snapP();
    G.t += dt; if (G.place === 'school' && !G.nextT) { G.stuckT += dt; if (G.stuckT > 22) { G.stuckT = 0; radio(LESSONS[G.les].tip, 6); } }
    if (G.nextT > 0) { G.nextT -= dt; if (G.nextT <= 0) { G.nextT = 0; if (G.les + 1 < LESSONS.length) lesEnter(G.les + 1); else finish(); } }
    // walls: block a rise you cannot ride up, and the park edge
    const gh = X.groundH(c.x, c.z);
    if (!c.grind && gh - P.y > (P.g ? 0.45 : 0.6)) { c.x = P.x; c.z = P.z; c.y = P.y; c.ground = P.g; c.speed *= P.g ? -0.3 : 0; if (Math.abs(c.speed) > 0.5 || !P.g) { X.audio.burst(0.12, 700, 0.14); X.St.shake = Math.max(X.St.shake, 0.15); } }
    if (c.x < PARK.x0 + 0.9 || c.x > PARK.x1 - 0.9 || c.z < PARK.z0 + 0.9 || c.z > PARK.z1 - 0.9) { c.x = clamp(c.x, PARK.x0 + 0.9, PARK.x1 - 0.9); c.z = clamp(c.z, PARK.z0 + 0.9, PARK.z1 - 0.9); c.speed *= -0.3; X.audio.burst(0.12, 600, 0.14); }
    for (const q of GAPS) if (P.z < q.z0 && c.z >= q.z0) G.lastGap = q;
    if (c.y < -0.6) { bail('IN THE GAP'); const t = G.lastGap || GAPS.find(q => c.z > q.z0 - 1 && c.z < q.z1 + 1) || GAPS[0]; tp(clamp(c.x, -4, 4), t.z0 - 7, 0); G.bail = { t: 0.6 }; snapP(); return; }
    const fx = Math.sin(c.yaw), fz = Math.cos(c.yaw);
    // coasting: the engine brakes hard when the stick is let go; a board rolls on
    if (c.ground && Math.abs(thr) < 0.05 && !G.bail) c.speed *= Math.exp(1.2 * dt) * Math.exp(-0.22 * dt);
    // transitions: gravity along the slope, kick turn, coping launch, kicker launch, pipe auto-align
    const s = c.ground && !c.grind ? surfAt(c.x, c.z) : null;
    if (s) { const dot = fx * s.nx + fz * s.nz;
      if (s.u > 0 && s.u < s.S.L) { c.speed -= 9.8 * Math.sin(Math.atan(s.tan)) * dot * dt * 1.1; if (c.speed < 0.6 && dot > 0.2) { c.yaw += Math.PI; G.slipV -= Math.PI; c.speed = 0.9; } }
      if (s.S.pipe && s.u > 0.2 && Math.abs(c.steer) < 0.3) { const want = dot >= 0 ? Math.atan2(s.nx, s.nz) : Math.atan2(-s.nx, -s.nz); c.yaw += clamp(wrap(want - c.yaw), -1.6 * dt, 1.6 * dt); }
      if (s.S.vert && dot > 0.35 && c.speed > 4.5 && s.u > s.S.L - Math.max(0.4, Math.abs(c.speed) * dt * 1.6) && s.u < s.S.L + 0.6) {
        const back = s.u - (s.S.L - 0.2); c.x -= s.nx * back; c.z -= s.nz * back; c.y = prof(s.S, s.S.L - 0.2)[0];
        const vy = Math.min(14, c.speed * 1.02) * Math.max(0.6, dot); A = { t: 0, vert: true, tricks: 0, spd: c.speed, nx: s.nx, nz: s.nz, dur: 2 * vy / 24, y0: c.y, peak: c.y, kick: false };
        c.ground = false; c.vy = vy; c.y += 0.05; c.airT = 0; c.speed = 0; c.yaw += Math.PI; G.slipV = -Math.PI; endManual(); X.audio.burst(0.12, 1300, 0.12); }
      else if (s.S === kicker && dot > 0.3 && c.speed > 2 && s.u > s.S.L - Math.max(0.15, Math.abs(c.speed) * dt * 1.6)) { const ang = Math.atan(prof(kicker, kicker.L - 0.01)[1]); c.ground = false; c.vy = c.speed * Math.sin(ang) * 0.95; c.speed *= 0.6 + Math.cos(ang) * 0.4; c.y += 0.04; c.airT = 0; A = { t: 0, vert: false, tricks: 0, kick: true, y0: c.y, peak: c.y }; endManual(); X.audio.burst(0.1, 1100, 0.12); } }
    // rail magnet (phones): falling near a rail pulls you onto it
    if (!c.ground && !c.grind && c.vy < 0) for (const r of RAILS) { const dx = r.x1 - r.x0, dz = r.z1 - r.z0, L2 = dx * dx + dz * dz, t = ((c.x - r.x0) * dx + (c.z - r.z0) * dz) / L2; if (t < 0.03 || t > 0.97) continue; const px = r.x0 + dx * t, pz = r.z0 + dz * t, d = Math.hypot(c.x - px, c.z - pz); if (d < 1.4 && c.y > r.h - 0.1 && c.y < r.h + 1.1) { const k = Math.min(1, 7 * dt / Math.max(d, 1e-3)); c.x += (px - c.x) * k; c.z += (pz - c.z) * k; } }
    // takeoff / landing / grind transitions
    if (P.g && !c.ground && !c.grind && !A) { const ps = surfAt(P.x, P.z), kk = !!(ps && ps.S === kicker && ps.u > kicker.L * 0.5); A = { t: 0, vert: false, tricks: 0, kick: kk, y0: c.y, peak: c.y }; if (kk) c.vy = Math.max(c.vy, Math.abs(c.speed) * Math.sin(Math.atan(prof(kicker, kicker.L - 0.01)[1])) * 0.95); }
    if (!P.grind && c.grind) { if (T) { T = null; G.spin = 0; if (V.deck) V.deck.rotation.z = 0; } A = null; endManual(); }
    if (P.grind && !c.grind) { const gt = c.grindT || 0; if (gt >= 0.25) addMove('GRIND ' + gt.toFixed(1) + ' S', Math.round(40 + gt * 60)); if (gt >= 0.8 && G.place === 'school' && LESSONS[G.les].id === 'grind') lesCount(); if (!c.ground) A = { t: 0, vert: false, tricks: 0, kick: false, y0: c.y, peak: c.y }; }
    if (A && !c.ground && !c.grind) { A.t += dt; A.peak = Math.max(A.peak, c.y);
      if (A.vert) { const p = A.t / A.dur; G.slipV = -Math.PI * (1 - sstep(0, 0.8, p)); c.pitch = 0; c.x -= A.nx * 0.6 * dt; c.z -= A.nz * 0.6 * dt; } }
    if (!P.g && c.ground && !P.grind && A) { const a = A; A = null;
      if (T && !T.held && T.target - T.rot < TAU * 0.3) completeTrick();
      if (T) bail(); else {
        if (a.vert) { c.speed = a.spd * 0.95; const ht = Math.max(0, a.peak - a.y0); addMove('AIR ' + ht.toFixed(1) + ' M', Math.round(50 + ht * 20)); if (G.place === 'school' && LESSONS[G.les].id === 'pipe') lesCount(); }
        else if (a.kick && a.t > 0.35) { addMove('KICKER AIR', 40); if (a.tricks > 0 && G.place === 'school' && LESSONS[G.les].id === 'air') lesCount(); }
        else if (a.t > 0.9) addMove('BIG AIR', 40); }
      G.slipV = 0; }
    if (c.ground) { if (A && !A.vert) A = null; }
    // tricks
    if (G.autoFlip > 0) { G.autoFlip -= dt; if (!c.ground && !c.grind) { G.autoFlip = 0; if (!T) { if (!A) A = { t: 0, vert: false, tricks: 0, kick: false, y0: c.y, peak: c.y }; startTrick(false); } } }
    if (G.b2 && !G.b2.air && !c.ground && !c.grind && !T) { G.b2.air = true; endManual(); startTrick(true); }
    if (T) { if (T.held || T.rot < T.target) T.rot += dt * TAU / 0.32; if (!T.held && T.rot >= T.target) completeTrick(); else { V.deck.rotation.z = -T.rot; const k = Math.floor(T.rot / TAU); G.spin = k === 2 || k === 4 ? T.rot - k * TAU : 0; } }
    // manual
    if (G.b2 && !G.b2.air && !c.manual && c.ground && !c.grind && G.t - G.b2.t0 >= 0.2 && Math.abs(c.speed) > 1.5) { c.manual = true; G.manT = 0; }
    if (c.manual) { if (!c.ground || c.grind) endManual(); else G.manT += dt; }
    // bail wobble
    if (G.bail) { G.bail.t += dt; const t = G.bail.t; V.body.rotation.z = -Math.sin(Math.min(1, t / 0.25) * Math.PI / 2) * 1.1 * (t < 0.7 ? 1 : Math.max(0, 1 - (t - 0.7) / 0.3)); c.speed = damp(c.speed, 0, 4, dt); if (t >= 1) { G.bail = null; V.body.rotation.z = 0; } }
    G.slipV = A && A.vert ? G.slipV : damp(G.slipV, 0, 6, dt); c.slip = G.slipV + G.spin;
    // combo timer
    const busy = !c.ground || c.grind || c.manual || T; if (CB.n && !busy) { CB.idle += dt; if (CB.idle > 1.4) bank(); }
    // lesson 1 gates + cones, lesson 2 gaps
    for (const g of GATES) { if (!g.done && P.z < g.z && c.z >= g.z && Math.abs(c.x - g.x) < 1.7) { g.done = true; g.ln.material.color.setHex(0x22c55e); X.popup(tmp.set(g.x, 2.2, g.z), 'GATE', '#22c55e'); if (G.place === 'school' && LESSONS[G.les].id === 'push') lesCount(); else X.audio.tone(990, 0.06, 0.03, 'triangle'); }
      for (const q of g.cones) if (!q.fall && Math.hypot(c.x - q.x, c.z - q.z) < 0.7 && c.y < 0.8) { q.fall = 0.01; q.dir = c.z > q.z ? -1 : 1; X.audio.burst(0.08, 900, 0.1); } }
    for (const t of GAPS) if (P.z <= t.z1 && c.z > t.z1 && c.x > t.x0 && c.x < t.x1 && c.y > -0.2) { if (!t.done) { t.done = true; if (G.place === 'school' && LESSONS[G.les].id === 'ollie') lesCount(); } addMove('GAP', 75); }
    // contest clock
    if (G.place === 'online') { lapStep(); if (NT.mode === 'score' && G.t >= 60 && !NT.fin) { if (!G.bail) bank(); NT.fin = 60; NT.finPts = Math.round(G.pts); flash('TIME!', '#ffd23a', 2); X.audio.tone(330, 0.5, 0.06, 'square', 0.6); } }
    if (G.place === 'contest' && G.t >= 60) { if (G.t < 60 + dt * 1.5) { flash('TIME!', '#ffd23a', 2); X.audio.tone(330, 0.5, 0.06, 'square', 0.6); } G.ending += dt; if ((c.ground && !c.grind && !T) || G.ending > 2.5) finish(); }
    snapP(); }

  // ---------- HUD ----------
  const _pv = new THREE.Vector3();
  function hud() { if (G.place === 'online') return netHud(); const pd = PL(), live = G.phase === 'run', c = C(); let goal = null;
    if (live && !DM.on) { const n = nextGoal(); if (n) { const dd = Math.hypot(c.x - n.x, c.z - n.z); if (dd > 7) { _pv.set(n.x, 1, n.z).project(X.camera); goal = { nx: _pv.x, ny: _pv.y, behind: _pv.z > 1, label: n.label, dist: Math.round(dd) }; } } }
    const bests = PLACES.map(p => { try { return save.stat('skate.park.' + p.id + '.best', 0); } catch (e) { return 0; } });
    const sch = G.place === 'school', L = LESSONS[G.les], left = Math.max(0, 60 - G.t);
    let trickTxt = 'TAP 2 · KICKFLIP', trickCol = '#7dd3fc';
    if (G.bail) { trickTxt = 'BAIL'; trickCol = '#ec3013'; } else if (T) { const lv = Math.min(TRICKS.length, Math.max(1, T.held ? Math.ceil(T.rot / TAU + 0.001) : Math.round(T.target / TAU))); trickTxt = (T.held ? 'LET GO · ' : '') + TRICKS[lv - 1][0]; trickCol = '#ffd23a'; }
    else if (c.manual) { trickTxt = 'MANUAL ' + G.manT.toFixed(1) + ' S'; trickCol = '#7dd3fc'; } else if (c.grind) { trickTxt = 'GRIND · 3 = OLLIE OUT'; trickCol = '#ffd23a'; } else if (!c.ground) { trickTxt = 'IN THE AIR · 2 = TRICK'; trickCol = '#ffd23a'; }
    return { state: G.phase === 'ready' ? 'ready' : 'run', phase: G.phase, board: G.board, done: G.done, place: G.place, placeName: pd.name, room: pd.room, target: pd.target,
      time: fmtT(sch ? G.t : left), over: sch && G.t > pd.target, low: !sch && left < 10, pts: Math.round(G.pts), comboN: CB.n, comboPot: CB.pot, comboK: CB.n ? Math.max(0, 1 - CB.idle / 1.4) : 0,
      progress: sch ? (G.nextT ? 'LESSON ' + (G.les + 1) + ' PASSED' : (G.les + 1) + ' · ' + L.name + ' · ' + G.cnt + ' / ' + L.need + ' ' + L.unit) : 'BEST COMBO ' + (G.bestCombo || 0) + ' · TROPHY ' + TROPHY_SCORE,
      les: sch ? G.les + (G.nextT ? 1 : 0) : 0, banner: G.banner, radio: G.radio, radioWho: 'TONY', flash: G.flash, count: G.phase === 'count' ? Math.ceil(G.count) : null, goal, bests, trickTxt, trickCol,
      bestTrick: G.bestTrick ? G.bestTrick.name : '—', quest: sch ? 'Lesson ' + (G.les + 1) + ': ' + L.quest : 'Contest: best run in 60 s · ' + TROPHY_SCORE + ' wins the trophy', bails: G.bails, trophy: (() => { try { return save.flag('skateTrophy'); } catch (e) { return false; } })(),
      demo: DM.on ? { cap: DM.cap, key: (DEMO[DM.i] || {}).key || '', n: DM.i + 1, of: DEMO.length } : null }; }

  // ---------- DEMO ----------
  const DM = { on: false, i: 0, t: 0, dt: 0, cap: '', f: {} };
  const at = a => DM.t > a && DM.t - DM.dt <= a;
  const steerTo = (tx, tz, th = 1) => { const c = C(), d = wrap(Math.atan2(tx - c.x, tz - c.z) - c.yaw); X.drive(th, clamp(-d * 2.5, -1, 1)); };
  const tap = n => { X.press(n, true); X.press(n, false); };
  const go = (les, x, z, yaw, sp) => { G.place = 'school'; G.phase = 'run'; lesEnter(les, true); tp(x, z, yaw); C().speed = sp; DM.f = {}; X.press(2, false); };
  const DEMO = [
    { d: 4.6, key: 'STICK', cap: 'PUSH AND STEER WITH THE STICK (WASD). WEAVE THROUGH THE CONE GATES', on() { resetRun(); go(0, 0, -40, 0, 4); }, tick() { const g = GATES.find(q => !q.done) || GATES[5]; steerTo(g.x, g.z + 1.2); } },
    { d: 4.4, key: '3', cap: 'TAP 3 TO OLLIE. POP IT JUST BEFORE THE GAP', on() { go(1, 0, -11, 0, 9); }, tick() { const c = C(); steerTo(0, 40); if (c.z > -4.6 && !DM.f.a) { DM.f.a = 1; tap(3); } if (c.z > 3.3 && !DM.f.b && c.ground) { DM.f.b = 1; tap(3); } if (c.z > 11.4 && !DM.f.c && c.ground) { DM.f.c = 1; tap(3); } } },
    { d: 4.4, key: '3', cap: 'OLLIE ONTO A YELLOW RAIL TO GRIND. TAP 3 ON THE RAIL TO OLLIE OUT', on() { go(2, -3.5, 19.5, 0, 8); }, tick() { const c = C(); if (!c.grind) steerTo(-3.5, 40, 0.5); if (c.z > 21.4 && !DM.f.a) { DM.f.a = 1; tap(3); } if (c.grind && c.z > 33 && !DM.f.b) { DM.f.b = 1; tap(3); } } },
    { d: 4.2, key: '2', cap: 'HIT THE KICKER FAST AND TAP 2 IN THE AIR FOR A KICKFLIP', on() { go(3, 0, 33, 0, 12); }, tick() { const c = C(); steerTo(0, 64); if (!c.ground && A && A.kick && !DM.f.a) { DM.f.a = 1; tap(2); } } },
    { d: 5, key: 'HOLD 2', cap: 'HOLD 2 AND THE DECK KEEPS FLIPPING: A BIGGER TRICK. LET GO BEFORE YOU LAND', on() { go(4, 26.5, -4, Math.PI / 2, 12.5); }, tick() { const c = C(); X.drive(1, 0); if (!c.ground && A && A.vert && !DM.f.a) { DM.f.a = 1; X.press(2, true); DM.f.rel = DM.t + 0.5; } if (DM.f.a && !DM.f.b && DM.t > DM.f.rel) { DM.f.b = 1; X.press(2, false); } } },
    { d: 3.8, key: '!', cap: 'STILL HOLDING 2 WHEN YOU LAND = BAIL. YOU LOSE THE COMBO BUT KEEP ROLLING', on() { go(3, 0, 33, 0, 12); }, tick() { const c = C(); steerTo(0, 64); if (!c.ground && A && A.kick && !DM.f.a) { DM.f.a = 1; X.press(2, true); } } },
    { d: 3.6, key: 'GO', cap: 'CHAIN TRICKS QUICKLY FOR A COMBO. THE CONTEST: YOUR BEST RUN IN 60 S', on() { X.press(2, false); go(4, 28, -12, 0.2, 4); }, tick() { X.drive(0, 0); } }];
  function demoStep(dt) { const s = DEMO[DM.i]; DM.dt = dt; DM.t += dt; if (s.tick) s.tick(dt); G.radio = ''; if (DM.t >= s.d) { DM.i++; DM.t = 0; if (DM.i >= DEMO.length) return demoStop(); const n = DEMO[DM.i]; DM.cap = n.cap; n.on && n.on(); } }
  function demoStart() { X.audio.init && X.audio.init(); DM.on = true; DM.i = 0; DM.t = 0; DM.cap = DEMO[0].cap; G.board = false; G.done = null; X.setPaused(false); DEMO[0].on(); }
  function demoStop() { DM.on = false; DM.cap = ''; X.drive(0, 0); X.press(2, false); G.b2 = null; resetRun(); G.place = 'school'; G.phase = 'ready'; tp(0, -52, 0); G.board = true; X.setPaused(true); }

  // ---------- ONLINE: up to 4 skaters (lobby on the page, engine/duel-net.js). Each phone skates its own board and sends
  // [x, y, z, yaw, deck, flags, score, lap, cp, -, speed, pitch] 15/s; the others are ghosts damped toward it. Host (lowest id) owns knockdown verdicts and results.
  const LAPS = 3, LAP_CPS = [{ x: 0, z: 22, label: 'LANE' }, { x: 0, z: 57, label: 'KICKER' }, { x: 28, z: 24, label: 'HALF-PIPE' }, { x: 28, z: -24, label: 'PIPE EXIT' }, { x: 0, z: -40, label: 'FINISH' }];
  const NT = { on: false, mode: 'score', lap: 0, cp: 0, fin: 0 }, GH = new Map(), r2 = v => Math.round(v * 100) / 100;
  const cpGroup = new THREE.Group(); cpGroup.visible = false; scene.add(cpGroup);
  const CPA = LAP_CPS.map((p, i) => { const q = LAP_CPS[(i + LAP_CPS.length - 1) % LAP_CPS.length], g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = Math.atan2(p.x - q.x, p.z - q.z); cpGroup.add(g);
    for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.3, 4.4, 0.3), ink, sx * 4.4, 2.2, 0, g, 0.01);
    const bar = new THREE.MeshBasicMaterial({ color: 0x3a3836 }), stripe = new THREE.MeshBasicMaterial({ color: 0x3a3836, transparent: true, opacity: 0.85 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(9.1, 1.25, 0.16), bar); b.position.y = 4.1; g.add(b);
    const t = CT(512, 64, (c, w, h) => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, w, h); c.fillStyle = '#f3f2f2'; c.font = '900 40px Archivo, sans-serif'; c.textBaseline = 'middle'; c.fillText(i === LAP_CPS.length - 1 ? 'FINISH' : (i + 1) + ' · ' + p.label, 22, 34); });
    for (const s of [1, -1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 1.05), new THREE.MeshBasicMaterial({ map: t })); pl.position.set(0, 4.1, 0.09 * s); if (s < 0) pl.rotation.y = Math.PI; g.add(pl); }
    const st = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 0.5), stripe); st.rotation.x = -Math.PI / 2; st.position.y = 0.026; g.add(st);
    return { bar, stripe }; });
  function paintCps() { CPA.forEach((a, i) => { const on = NT.on && NT.mode === 'laps' && !NT.fin && i === NT.cp; a.bar.color.setHex(on ? 0xffd23a : 0x3a3836); a.stripe.color.setHex(on ? 0xffd23a : 0x3a3836); }); }
  const shade = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };
  function tintBoard(V, col) { const undo = []; if (!V || !V.deck) return () => {}; V.deck.traverse(m => { if (m.isMesh && Array.isArray(m.material)) { undo.push([m, m.material]); m.material = [toon(col), m.material[1]]; } });
    (V.wheels || []).forEach(w => { const m = w.sp.children[0]; if (m && m.isMesh) { undo.push([m, m.material]); m.material = toon(shade(col, 1.15)); } }); return () => undo.forEach(([m, mt]) => m.material = mt); }
  function mkGhost(p) { const root = X.makeVeh('skate'), V = root.userData.V; root.scale.setScalar(2.5); root.rotation.order = 'YXZ'; scene.add(root); tintBoard(V, p.col);
    const look = { ...X.CAST.player.look, fur: p.col, furDark: shade(p.col, 0.7), tailBase: shade(p.col, 0.8), tailMid: p.col };
    const f = X.kit.makeFox({ ...X.CAST.player, look, torso: [p.col, '#201e1d', '#f3f2f2'], crest: '', gear: 'none', outfit: 'vest', mood: 'determined' }), FP = f.userData.P; if (FP.sword) FP.sword.visible = false; if (FP.gun) FP.gun.visible = false;
    V.deck.add(f); f.scale.setScalar(f.scale.x / 2.5); f.position.copy(V.seatLocal); f.rotation.y = Math.PI / 2 * 0.85; (FP.legs || []).forEach((l, i) => { l.rotation.x = i ? 0.25 : -0.25; l.rotation.z = (i ? 1 : -1) * 0.12; }); (FP.arms || []).forEach((a, i) => { a.rotation.x = -0.4; a.rotation.z = (i ? 1 : -1) * 0.9; }); if (FP.body) FP.body.rotation.x = 0.12;
    const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: CT(256, 64, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.fillStyle = p.col; g.fillRect(0, 0, 20, h); g.fillStyle = '#fff'; g.font = '900 38px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(p.name, 34, 34); }), depthTest: false, transparent: true }));
    tag.scale.set(2.4, 0.6, 1); tag.renderOrder = 8; scene.add(tag);
    return { ...p, root, V, f, FP, tag, s: null, x: 0, y: 0, z: 0, yaw: 0, pitch: 0, deck: 0, lean: 0, push: 0, last: 0, ramCd: 0 }; }
  function dropGhost(g) { scene.remove(g.root); scene.remove(g.tag); }
  function ghostFrame(g, rdt) { const s = g.s; g.root.visible = g.tag.visible = !!s; if (!s) return; const k = 1 - Math.exp(-12 * rdt);
    if (Math.hypot(s[0] - g.x, s[2] - g.z) > 5) { g.x = s[0]; g.y = s[1]; g.z = s[2]; g.yaw = s[3]; } else { g.x += (s[0] - g.x) * k; g.y += (s[1] - g.y) * k; g.z += (s[2] - g.z) * k; g.yaw += wrap(s[3] - g.yaw) * k; }
    g.deck += wrap(s[4] - g.deck) * Math.min(1, k * 2); g.pitch += ((s[11] || 0) - g.pitch) * k; const bl = s[5] & 4; g.lean = damp(g.lean, bl ? -1.1 : 0, 8, rdt);
    g.root.position.set(g.x, g.y, g.z); g.root.rotation.set(-g.pitch, g.yaw, 0); g.V.deck.rotation.z = -g.deck; g.V.body.rotation.z = g.lean;
    g.V.wheels.forEach(w => w.sp.rotation.x += (s[10] || 0) * rdt / w.r);
    const pushing = (s[5] & 1) && !(s[5] & 2) && Math.abs(s[10] || 0) > 0.5 && Math.abs(s[10]) < 12; g.push += pushing ? rdt / 0.7 : 0; if (g.FP.legs && g.FP.legs[0]) g.FP.legs[0].rotation.x = -0.25 - (pushing ? Math.max(0, Math.sin(g.push * TAU)) * 0.9 : 0);
    g.tag.position.set(g.x, g.y + 3.7, g.z); }
  const nameOf = id => id === NT.me ? ((NT.players || []).length > 2 ? ((NT.players.find(p => p.id === id) || {}).name || 'YOU') : 'YOU') : ((GH.get(id) || (NT.players || []).find(p => p.id === id) || {}).name || 'RIVAL');
  const colOf = id => ((NT.players || []).find(p => p.id === id) || {}).col || '#ffffff';
  const scoreNow = () => NT.mode === 'score' && NT.fin ? NT.finPts : Math.round(G.pts);
  function myState() { const c = C(), V = Vv(), deck = V && V.deck ? ((-V.deck.rotation.z % TAU) + TAU) % TAU : 0, fl = (c.ground ? 1 : 0) | (c.grind ? 2 : 0) | (G.bail ? 4 : 0) | (c.manual ? 8 : 0) | (NT.fin ? 16 : 0);
    return [r2(c.x), r2(c.y), r2(c.z), r2(c.yaw + (c.slip || 0)), r2(deck), fl, scoreNow(), NT.lap, NT.cp, 0, r2(c.speed), r2(c.pitch || 0)]; }
  const toHost = d => { const h = NT.hostId(); if (!h || h === NT.me) netEv(d, NT.me); else NT.send('ev', d, h); };
  function netFrame() { if (!NT.on) return; const now = performance.now(), rdt = Math.min(0.1, NT.lt ? (now - NT.lt) / 1000 : 0); NT.lt = now;
    for (const g of GH.values()) ghostFrame(g, rdt);
    if (now - NT.sent > 66) { NT.sent = now; NT.send('sn', myState()); }
    if (G.phase === 'run' && !G.bail && !NT.fin && !NT.ended) ramCheck(now);
    if (NT.hostId() === NT.me) hostTick(); }
  function ramCheck(now) { const c = C(), sp = Math.abs(c.speed); if (sp < 5.5) return; const sg = Math.sign(c.speed) || 1, fx = Math.sin(c.yaw) * sg, fz = Math.cos(c.yaw) * sg;
    for (const g of GH.values()) { if (!g.s || (g.s[5] & 4) || now < g.ramCd) continue; const dx = g.x - c.x, dz = g.z - c.z, d = Math.hypot(dx, dz); if (d > 1.35 || Math.abs(g.y - c.y) > 1.2) continue; if ((dx * fx + dz * fz) / Math.max(d, 1e-3) * sp < 3.5) continue;
      g.ramCd = now + 1500; c.speed *= 0.75; X.audio.burst(0.25, 500, 0.2); X.St.shake = Math.max(X.St.shake, 0.3); X.puff(tmp.set((c.x + g.x) / 2, c.y + 0.8, (c.z + g.z) / 2), 0xffffff, 8, 2, 0.6, 0.5); toHost({ k: 'ram', v: g.id }); } }
  function netEv(d, from) { if (!d || !NT.on) return;
    if (d.k === 'ram') { if (NT.hostId() !== NT.me || NT.ended) return; const now = performance.now(); if (now < (NT.downAt[d.v] || 0)) return; NT.downAt[d.v] = now + 2500; const m = { k: 'rammed', a: from }; if (d.v === NT.me) netEv(m, NT.me); else NT.send('ev', m, d.v); return; }
    if (d.k === 'rammed') { const a = GH.get(d.a), c = C(); if (!a || G.phase !== 'run' || G.bail || NT.fin || Math.hypot(a.x - c.x, a.z - c.z) > 2.8) return;
      const steal = NT.mode === 'score' ? Math.min(Math.round(G.pts), Math.max(50, Math.round(G.pts * 0.25))) : 0; G.pts -= steal; bail('KNOCKED DOWN BY ' + a.name + (steal ? ' · −' + steal : ''), 0);
      const m = { k: 'down', a: d.a, v: NT.me, n: steal }; NT.send('ev', m); return; }
    if (d.k === 'down') { if (d.a === NT.me) { if (!NT.fin) G.pts += d.n || 0; NT.kos++; flash('KNOCKDOWN!' + (d.n ? ' · +' + d.n + ' STOLEN' : ''), '#ffd23a', 2); X.audio.tone(990, 0.12, 0.05, 'square', 1.5); setTimeout(() => X.audio.tone(1320, 0.14, 0.05, 'square', 1.5), 100); }
      else { const g = GH.get(d.v); if (g) X.popup(tmp.set(g.x, g.y + 3, g.z), nameOf(d.a) + ' KNOCKED ' + nameOf(d.v) + ' DOWN', '#ffd23a'); } return; }
    if (d.k === 'fin') { if (NT.hostId() === NT.me && NT.fins[from] == null) NT.fins[from] = d.t; return; }
    if (d.k === 'end') netResults(d.r); }
  function prog(r) { return r[4] != null ? 1e6 - r[4] : r[2] * 10 + r[3]; }
  function rankRows(rows) { return rows.sort(NT.mode === 'score' ? (a, b) => b[1] - a[1] : (a, b) => prog(b) - prog(a)); }
  function allRows() { const rows = [[NT.me, scoreNow(), NT.lap, NT.cp, NT.fin && NT.mode === 'laps' ? NT.fin : null]]; for (const g of GH.values()) rows.push([g.id, g.s ? g.s[6] : 0, g.s ? g.s[7] : 0, g.s ? g.s[8] : 0, NT.mode === 'laps' ? (NT.fins[g.id] ?? (g.s && (g.s[5] & 16) ? 1e5 : null)) : null]); return rows; }
  function hostTick() { if (NT.ended || G.phase !== 'run') return; const alive = [NT.me, ...GH.keys()];
    if (NT.mode === 'score') { if (G.t >= 61.5) netEndHost(); return; }
    const ft = alive.map(id => NT.fins[id]).filter(t => t != null); if (ft.length >= alive.length || (ft.length && G.t > Math.min(...ft) + 20) || G.t >= 180) netEndHost(); }
  function netEndHost() { if (NT.ended) return; const rows = allRows(); rows.forEach(r => { if (NT.mode === 'laps') r[4] = NT.fins[r[0]] ?? null; }); rankRows(rows); NT.send('ev', { k: 'end', r: rows }); netResults(rows); }
  function netResults(r) { if (NT.ended && G.phase === 'done') return; NT.ended = true; if (!G.bail && !NT.fin) bank();
    const i = Math.max(0, r.findIndex(x => x[0] === NT.me)), n = r.length, won = i === 0 && n >= 2, sc = NT.mode === 'score'; let wins = 0; const unlocked = [];
    try { save.setStat('skate.online.played', save.stat('skate.online.played', 0) + 1); wins = save.stat('skate.online.wins', 0); if (won) { wins++; save.setStat('skate.online.wins', wins); for (const [w, f, nm] of ONLINE_REWARDS) if (wins >= w && !save.flag(f)) { save.setFlag(f); unlocked.push(nm); } } } catch (e) {}
    const rows = r.map((x, k) => [ORD[k] + ' · ' + nameOf(x[0]) + (x[0] === NT.me && n > 2 ? ' (YOU)' : ''), sc ? String(x[1]) : x[4] != null ? fmtT(x[4]) : 'LAP ' + Math.min(LAPS, x[2] + 1) + ' / ' + LAPS]);
    rows.push(['Knockdowns', String(NT.kos)], ['Online wins', String(wins) + (rankBadge(wins) ? ' · ' + rankBadge(wins) + ' BADGE' : '')]);
    const mine = r[i] || [];
    G.done = { online: true, id: 'online', name: 'ONLINE · ' + (sc ? 'TRICK RACE' : 'LAP RACE'), title: won ? 'You win' : n < 2 ? 'Everyone left' : ORD[i] + ' place', grade: ORD[i], total: sc ? String(mine[1] || 0) : mine[4] != null ? fmtT(mine[4]) : 'DNF', totalLbl: sc ? 'POINTS' : 'TIME', sub: unlocked.length ? 'UNLOCKED · ' + unlocked.join(' · ') : won ? 'ONLINE WIN ' + wins : 'NO SERVER · FRIENDS ONLY', unlocked, rows, trophy: false, next: null, won, place: i + 1 };
    G.phase = 'done'; X.drive(0, 0); paintCps(); NT.onEnd && NT.onEnd({ won, place: i + 1 }); }
  function lapStep() { if (NT.mode !== 'laps' || NT.fin || NT.ended) return; const c = C(), p = LAP_CPS[NT.cp]; if (Math.hypot(c.x - p.x, c.z - p.z) > 7.5) return;
    const nx = LAP_CPS[(NT.cp + 1) % LAP_CPS.length]; G.cp = [p.x, p.z, Math.atan2(nx.x - p.x, nx.z - p.z)]; NT.cp++; X.audio.tone(1100, 0.08, 0.04, 'triangle', 1.4);
    if (NT.cp >= LAP_CPS.length) { NT.cp = 0; NT.lap++; if (NT.lap >= LAPS) { NT.fin = G.t; flash('FINISHED · ' + fmtT(G.t), '#22c55e', 3); X.audio.tone(660, 0.2, 0.06, 'square', 1.5); toHost({ k: 'fin', t: G.t }); } else { flash('LAP ' + (NT.lap + 1) + ' / ' + LAPS, '#ffd23a', 1.6); } }
    else X.popup(tmp.set(p.x, 3, p.z), p.label, '#ffd23a'); paintCps(); }
  function netClear() { for (const g of GH.values()) dropGhost(g); GH.clear(); if (NT.untint) { NT.untint(); NT.untint = null; } }
  function netBegin(o) { netClear(); DM.on = false; resetRun(); Object.assign(NT, { on: true, mode: o.mode === 'laps' ? 'laps' : 'score', me: o.me, send: o.send || (() => {}), hostId: o.hostId || (() => o.me), onEnd: o.onEnd, players: o.players || [], sent: 0, lt: 0, downAt: {}, fins: {}, ended: false, fin: 0, finPts: 0, lap: 0, cp: 0, kos: 0 });
    for (const p of NT.players) if (p.id !== o.me) GH.set(p.id, mkGhost(p));
    const mine = NT.players.find(p => p.id === o.me) || { slot: 0, col: '#ec3013' }; if (NT.players.length > 2) NT.untint = tintBoard(Vv(), mine.col);
    G.place = 'online'; G.board = false; G.done = null; G.phase = 'count'; G.count = clamp((o.t0 - Date.now()) / 1000, 0.5, 5); G.lastN = 0; X.setPaused(false);
    const sx = [-4.5, -1.5, 1.5, 4.5][mine.slot || 0]; G.cp = [sx, -46, 0]; tp(sx, -46, 0); cpGroup.visible = NT.mode === 'laps'; paintCps();
    banner(NT.mode === 'laps' ? 'ONLINE · LAP RACE · ' + LAPS + ' LAPS' : 'ONLINE · TRICK RACE · 60 S', 3); tonySay(NT.mode === 'laps' ? 'Three laps. Go.' : 'Sixty seconds. Go.'); }
  function netEnd() { if (!NT.on) return; netClear(); NT.on = false; cpGroup.visible = false; resetRun(); G.place = 'school'; G.phase = 'ready'; G.board = true; G.done = null; tp(0, -52, 0); X.drive(0, 0); X.setPaused(true); tonySay('Read the board. Then skate.'); }
  function netDrop(id) { const g = GH.get(id); if (!g) return; dropGhost(g); GH.delete(id); delete NT.fins[id]; if (NT.on && !GH.size && G.phase === 'run' && !NT.ended) netEndHost(); }
  function netRecv(t, d, from) { if (!NT.on || !d) return; if (t === 'sn') { const g = GH.get(from); if (g && Array.isArray(d)) { g.s = d; g.last = performance.now(); } return; } if (t === 'ev') netEv(d, from); }
  function netHud() { const c = C(), sc = NT.mode === 'score', live = G.phase === 'run'; let goal = null;
    if (live) { const n = nextGoal(); if (n) { const dd = Math.hypot(c.x - n.x, c.z - n.z); if (dd > 7) { _pv.set(n.x, 1, n.z).project(X.camera); goal = { nx: _pv.x, ny: _pv.y, behind: _pv.z > 1, label: n.label, dist: Math.round(dd) }; } } }
    const rows = rankRows(allRows()), me = rows.findIndex(r => r[0] === NT.me), place = ORD[Math.max(0, me)], left = Math.max(0, 60 - G.t);
    let trickTxt = sc ? 'RAM A RIVAL · STEAL POINTS' : 'FOLLOW THE ARCHES', trickCol = '#7dd3fc';
    if (G.bail) { trickTxt = 'DOWN'; trickCol = '#ec3013'; } else if (T) { const lv = Math.min(TRICKS.length, Math.max(1, T.held ? Math.ceil(T.rot / TAU + 0.001) : Math.round(T.target / TAU))); trickTxt = (T.held ? 'LET GO · ' : '') + TRICKS[lv - 1][0]; trickCol = '#ffd23a'; } else if (c.grind) { trickTxt = 'GRIND · 3 = OLLIE OUT'; trickCol = '#ffd23a'; }
    return { state: 'run', phase: G.phase, board: false, done: G.done, place: 'online', online: true, mode: NT.mode, placeName: sc ? 'ONLINE · TRICK RACE' : 'ONLINE · LAP RACE', room: 'skatePark', target: sc ? 60 : 0,
      time: fmtT(sc ? left : (NT.fin || G.t)), over: false, low: sc && left < 10, pts: scoreNow(), comboN: CB.n, comboPot: CB.pot, comboK: CB.n ? Math.max(0, 1 - CB.idle / 1.4) : 0,
      progress: sc ? (NT.fin ? 'TIME · WAITING FOR RESULTS' : place + ' OF ' + rows.length + ' · RAM = STEAL') : NT.fin ? 'FINISHED · ' + place + ' · WAITING' : 'LAP ' + Math.min(LAPS, NT.lap + 1) + ' / ' + LAPS + ' · ' + place + ' OF ' + rows.length,
      tgt: ['PLACE', place], les: 0, banner: G.banner, radio: G.radio, flash: G.flash, count: G.phase === 'count' ? Math.ceil(G.count) : null, goal, bests: [], trickTxt, trickCol, bestTrick: G.bestTrick ? G.bestTrick.name : '—',
      quest: (sc ? 'Trick race · highest score in 60 s' : 'Lap race · first home after ' + LAPS + ' laps') + ' · ' + place, bails: G.bails, trophy: false, demo: null,
      net: rows.map(r => ({ name: nameOf(r[0]), col: colOf(r[0]), me: r[0] === NT.me, v: sc ? String(r[1]) : r[4] != null ? 'DONE' : 'LAP ' + Math.min(LAPS, r[2] + 1) })) }; }

  // ---------- API ----------
  const course = {
    start: { x: 0, z: -52, yaw: 0 }, stick: true, groundH, update, hud, boardURL: '', boardURLP: '',
    press(n, down) { if (G.board || G.done || G.phase !== 'run') return true; if (G.bail) return true; if (n === 2) { trickBtn(down); return true; } return false; },
    map: () => ({ b: [['Tony', TONY.x, TONY.z]], l: LAMPS, t: [], e: [], q: (() => { const n = G.phase === 'run' && nextGoal(); return n ? [n.x, n.z, n.label] : null; })(), g: (() => { const n = G.phase === 'run' && nextGoal(); return n ? [n.x, n.z] : null; })() }),
    reset() { if (G.phase !== 'run' || DM.on) return; tp(...G.cp); flash(G.place === 'online' ? 'BACK TO THE LAST ARCH' : 'BACK TO THE START', '#ffffff', 1.2); },
    netBegin, netRecv, netDrop, netEnd, netOn: () => NT.on,
    rollOut, demoStart, demoStop, finish, say: s => flash(s, '#ffffff', 2),
    openBoard() { if (DM.on || NT.on) return; G.board = true; X.setPaused(true); if (G.phase === 'done') G.done = null; },
    closeBoard() { G.board = false; if (G.phase === 'run' || G.phase === 'count') X.setPaused(false); },
    preview() {},
    _tp(x, z, yaw = 0, sp = 0, pts) { tp(x, z, yaw); C().speed = sp; if (pts != null) G.pts = pts; },
    _les(i) { G.board = false; X.setPaused(false); G.place = 'school'; G.phase = 'run'; lesEnter(i); }, _dbg: () => ({ gh: [...GH.values()].map(g => [g.id, g.s && g.s.slice(0, 3), g.s && g.s[6], +g.x.toFixed(1), +g.z.toFixed(1)]), ntOn: NT.on, me: NT.me, host: NT.on && NT.hostId(), phase: G.phase, les: G.les, cnt: G.cnt, pts: G.pts, combo: CB.n, x: +C().x.toFixed(2), z: +C().z.toFixed(2), y: +C().y.toFixed(2), sp: +C().speed.toFixed(2), ground: C().ground, grind: !!C().grind, vert: !!(A && A.vert), trick: T ? +T.rot.toFixed(2) : null }) };
  X.setPaused(true);
  setTimeout(paintBoards, 30); setTimeout(() => document.fonts && document.fonts.load('700 50px "Caveat"').then(() => paintBoards()).catch(() => {}), 1500);
  return course;
}
