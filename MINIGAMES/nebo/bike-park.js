// 8 GATES — NEBO · BIKE PARK [neboBikePark]. A slopestyle clearing off the FOREST PATH (neboForestPath), near Fern's Ranger's Cabin.
// Built on the shared driving engine (vehicle-lab.js, opts.course, lock 'bike'). Stand-alone page now; the Nebo world links in through a trail sign on the Forest Path (BIKE_PARK.entry).
// BIKE SCHOOL with BART (scrappy teen racer, teases you): 1 gates · 2 log hops · 3 berms · 4 drops · 5 wheelie line · 6 jump line + trick · 7 skinny bridge · 8 laser the woods creatures · 9 rock garden.
// THE CONTEST: best trick run in 60 s in the finish arena (big wooden kickers, a drop deck, a wall). TROPHY_SCORE wins BART's trophy (flag bikeTrophy + item bikeTrophy, for Home later).
// Buttons: 1 handlebar LASER (engine: tap bolt, hold beam) · 2 TRICK: air tap = 360, hold = keep spinning; stick pulled back = BACKFLIP; let go before you land · ground: hold = WHEELIE, tap = hop + 360 · 3 BUNNY HOP.
// Wipeout = lose 3 seconds (school clock +3, contest clock −3) and the combo, keep riding. Fun and easy: rail of help everywhere (bridge balance assist, berm boost, magnet-free).
import { save } from '../../engine/save.js';
import { creatureKit } from '../../engine/creature-kit.js';

export const BIKE_PARK = { name: 'BIKE PARK', room: 'neboBikePark', world: 'Nebo', entry: 'neboForestPath', page: 'Nebo Bike Park.dc.html' };
export const TROPHY_SCORE = 2000;
export const PLACES = [
  { id: 'school', name: 'BIKE SCHOOL', room: 'neboBikePark', built: true, target: 420, goal: '9 lessons with BART', line: 'BART shows you the park: gates, log hops, berms, drops, a wheelie line, the jump line, the skinny bridge, the creatures in the woods and the rock garden.' },
  { id: 'contest', name: 'THE CONTEST', room: 'neboBikePark', built: true, target: 60, goal: 'Best trick run in 60 s', line: 'Sixty seconds in the finish arena: big kickers, the drop deck and the wall. Chain tricks into combos. Score ' + TROPHY_SCORE + ' to win BART\'s trophy.' }];
const LESSONS = [
  { id: 'gates', name: 'PEDAL + STEER', need: 6, unit: 'GATES', start: [0, -94, 0], quest: 'Ride through the 6 flag gates', radio: 'Stick forward to pedal, steer through my flags. All six. Try not to cry.', tip: 'Go between the two flags of each gate. Slow down a bit before the turns.' },
  { id: 'logs', name: 'LOG HOPS', need: 4, unit: 'LOGS', start: [0, -54, 0], quest: 'Bunny hop the 4 logs', radio: 'Logs. Tap 3 to bunny hop just before each one. Hit one and you stop dead. Funny for me.', tip: 'Tap 3 about a bike length before the log. Pedal hard = higher hop.' },
  { id: 'berms', name: 'BERMS', need: 3, unit: 'BERMS', start: [24, -94, 0], quest: 'Ride high round the 3 berms', radio: 'Berms. Stay up on the banked turn and it throws you out faster. Three of them. Keep up, slowpoke.', tip: 'Keep pedalling into the turn and steer round with the bank. Ride high, not on the inside.' },
  { id: 'drops', name: 'DROPS', need: 2, unit: 'DROPS', start: [-40, -94, 0], quest: 'Ride off the 2 drop decks', radio: 'Up the ramp, off the deck, land on both wheels. Do not hold 2 when you land.', tip: 'Just ride off the end with speed. Let go of every button before you land.' },
  { id: 'wheelie', name: 'WHEELIE LINE', need: 1, unit: 'LINE', start: [-40, -46, 0], quest: 'Wheelie 3 s on the painted line', radio: 'Hold 2 on the ground to pull a wheelie. Keep it up for three seconds on the yellow line. I did ten at your age. Last week.', tip: 'Pedal, then hold 2 and keep holding. Stay on the yellow strip.' },
  { id: 'jumps', name: 'JUMP LINE', need: 2, unit: 'TRICKS', start: [0, -24, 0], quest: 'Land 2 tricks off the jump line', radio: 'Jump line. Hit a kicker, tap 2 in the air for a 360. Land two. Pull the stick back for a backflip if you are brave.', tip: 'Full speed at the kicker, tap 2 as you leave the lip, let go early.' },
  { id: 'skinny', name: 'SKINNY BRIDGE', need: 1, unit: 'BRIDGE', start: [40, -32, 0], quest: 'Ride the skinny bridge over the stream', radio: 'The skinny. Narrow plank over the stream. Ride it end to end. Gentle steering. Fall in and I am laughing.', tip: 'Go slow and barely touch the stick. The bridge keeps you straight if you let it.' },
  { id: 'laser', name: 'LASER WOODS', need: 6, unit: 'CREATURES', start: [-60, -12, 0], quest: 'Laser 6 creatures in the woods', radio: 'Thornbacks, Conethrowers and the Kindling loggers live in these woods. Tap 1 to laser them as you ride. Six. They throw stuff back.', tip: 'Point the bike at a creature and tap 1. Hold 1 on desktop for a beam that goes through.' },
  { id: 'rocks', name: 'ROCK GARDEN', need: 1, unit: 'RUN', start: [60, -10, 0], quest: 'Rock garden in under 8 s', radio: 'Rock garden. Rocks eat your speed. Go in fast and keep pedalling, under eight seconds. Last one, then you are almost not terrible.', tip: 'Pedal all the way in and all the way through. Slow is what kills you here.' }];
const SPINS = [['360', 120], ['720', 260], ['1080', 450], ['1440', 700], ['THE 8 GATES', 1000]], FLIPS = [['BACKFLIP', 200], ['DOUBLE BACKFLIP', 500], ['TRIPLE BACKFLIP', 900]];
const PASS = ['Fine. Lucky.', 'Okay, you can hop. Whatever.', 'That was... not bad.', 'You landed it. Shocked.', 'Huh. Nice wheelie.', 'Okay that was sick. Do not tell anyone I said that.', 'Did not fall in. Boring.', 'Six. The woods thank you.', 'Fine. You can ride. Contest next?'];
const BAILS = ['HA! Get up.', 'Let go of 2 before you land!', 'My little sister rides better.', 'That will leave a mark.'];
const TAU = Math.PI * 2;
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

export function bikePark(X) {
  const { THREE, scene, M, toon, rr, clamp, damp } = X;
  const tmp = new THREE.Vector3(), V2 = (x, y) => new THREE.Vector2(x, y), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const ink = toon('#201e1d'), red = toon('#ec3013'), white = toon('#f3f2f2'), gold = toon('#e6b45a'), woodD = toon('#6b4a2c'), steel = toon('#aab2ba');
  const PARK = { x0: -80, x1: 80, z0: -108, z1: 110 }, touch = X.touch, ck = creatureKit({ THREE, toon, M });
  X.camera.far = 600; X.camera.updateProjectionMatrix();

  // ---------- Nebo light: green-and-gold forest afternoon ----------
  scene.background = CT(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fb6d6'); gr.addColorStop(0.55, '#cfe3d0'); gr.addColorStop(0.85, '#f3e2a8'); gr.addColorStop(1, '#f6e7b8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(0xd9dcb0, 70, 300);
  scene.traverse(o => { if (o.isHemisphereLight) { o.color.set('#fff3d6'); o.groundColor.set('#4f6a33'); o.intensity = 1.05; } });
  X.sun.color.set('#ffe2a8'); X.sun.intensity = 2.1;
  const speck = (g, w, h, n, cols) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3); } };
  const grassT = CT(512, 512, (g, w, h) => { g.fillStyle = '#5e8a3a'; g.fillRect(0, 0, w, h); speck(g, w, h, 5200, ['rgba(40,70,20,0.35)', 'rgba(140,180,70,0.3)', 'rgba(230,200,90,0.18)']); for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(30,60,20,0.08)'; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 40 + Math.random() * 90, 20 + Math.random() * 50, Math.random() * 3, 0, 7); g.fill(); } });
  grassT.wrapS = grassT.wrapT = THREE.RepeatWrapping; grassT.repeat.set(60, 60);
  { const gr = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshToonMaterial({ map: grassT, gradientMap: X.grad })); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; scene.add(gr); }
  const dirtT = CT(256, 256, (g, w, h) => { g.fillStyle = '#9a7650'; g.fillRect(0, 0, w, h); speck(g, w, h, 1800, ['rgba(70,48,28,0.35)', 'rgba(200,170,120,0.3)', 'rgba(60,40,20,0.2)']); }); dirtT.wrapS = dirtT.wrapT = THREE.RepeatWrapping;
  const dirtM = new THREE.MeshToonMaterial({ map: dirtT, gradientMap: X.grad }), dirtM2 = new THREE.MeshToonMaterial({ map: dirtT, gradientMap: X.grad, side: THREE.DoubleSide });
  const plankT = CT(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#b07a45', '#a06c3b', '#bb8550', '#9c6837'][i % 4]; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(60,35,15,0.5)'; g.fillRect(0, i * 32, w, 2); for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(80,50,25,0.25)'; g.fillRect(Math.random() * w, i * 32 + 6 + Math.random() * 20, 30 + Math.random() * 60, 1.5); } g.fillStyle = '#3a2a1a'; g.fillRect(10, i * 32 + 14, 4, 4); g.fillRect(w - 14, i * 32 + 14, 4, 4); } });
  plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping; plankT.repeat.set(0.4, 0.4);
  const woodM = new THREE.MeshToonMaterial({ map: plankT, gradientMap: X.grad }), woodBox = toon('#a8743f');

  // ---------- trails (dirt ribbons) ----------
  const TRAILS = [];
  function trail(x0, z0, x1, z1, w = 7) { w = Math.round(w * 1.6); const L = Math.hypot(x1 - x0, z1 - z0), t = dirtT.clone(); t.needsUpdate = true; t.repeat.set(w / 4, L / 4); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, L), new THREE.MeshToonMaterial({ map: t, gradientMap: X.grad })); m.rotation.set(-Math.PI / 2, 0, Math.atan2(x1 - x0, z1 - z0)); m.position.set((x0 + x1) / 2, 0.012 + TRAILS.length * 0.0004, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m); TRAILS.push([x0, z0, x1, z1, w]); }
  trail(0, -104, 0, -52, 9); trail(0, -52, 0, -20, 9); trail(0, -20, 0, 48, 8); trail(-14, -100, 74, -100, 7); trail(-14, -100, -80, -100, 7);
  trail(24, -100, 24, -64, 7); trail(36, -64, 36, -88, 7); trail(48, -88, 48, -64, 7); trail(60, -64, 60, -96, 7);
  trail(-40, -100, -40, -8, 7); trail(40, -100, 40, 12, 6); trail(-60, -100, -60, 62, 7); trail(60, -96, 60, 50, 7); trail(-60, 52, -20, 54, 7); trail(60, 46, 20, 54, 7);
  const distSeg = (x, z, [x0, z0, x1, z1]) => { const dx = x1 - x0, dz = z1 - z0, L2 = dx * dx + dz * dz || 1, t = clamp(((x - x0) * dx + (z - z0) * dz) / L2, 0, 1); return Math.hypot(x - x0 - dx * t, z - z0 - dz * t); };
  const nearTrail = (x, z, pad) => TRAILS.some(s => distSeg(x, z, s) < s[4] / 2 + pad);

  // ---------- terrain shapes (engine groundH → course.groundH) ----------
  const shapes = [], boxes = [];
  const prof = (S, u) => { if (u < 0) return null; if (u < S.L) { const q = Math.sqrt(S.R * S.R - u * u); return [S.R - q, u / Math.max(q, 0.05)]; } if (u <= S.L + S.deck) return [S.H, 0]; return null; };
  function quarter(S) { S.kind = 'q'; S.L = Math.sqrt(S.R * S.R - (S.R - S.H) ** 2); S.nx = Math.sin(S.phi); S.nz = Math.cos(S.phi); shapes.push(S);
    const pts = [V2(0, 0)]; for (let i = 1; i <= 14; i++) { const u = S.L * i / 14; pts.push(V2(u, S.R - Math.sqrt(S.R * S.R - u * u))); } if (S.deck > 0) pts.push(V2(S.L + S.deck, S.H)); pts.push(V2(S.L + S.deck, 0));
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: S.len, bevelEnabled: false, curveSegments: 1 }); geo.translate(0, 0, -S.len / 2);
    const g = new THREE.Group(); g.position.set(S.o.x, 0, S.o.z); g.rotation.y = S.phi - Math.PI / 2; scene.add(g); M(geo, woodM, 0, 0, 0, g, 0.03);
    if (S.vert) { const cp = M(new THREE.CylinderGeometry(0.075, 0.075, S.len, 8), steel, S.L, S.H, 0, g, 0.012); cp.rotation.x = Math.PI / 2; } else M(new THREE.BoxGeometry(0.12, 0.04, S.len + 0.02), gold, S.L - 0.06, S.H + 0.01, 0, g, 0);
    for (const sz of [-1, 1]) for (let k = 1; k <= 2; k++) M(new THREE.BoxGeometry(0.16, S.H * k / 3, 0.16), woodD, S.L * (0.4 + k * 0.25), S.H * k / 6, sz * (S.len / 2 + 0.05), g, 0.01);
    return S; }
  // BERM: a banked sector of a ring round (cx, cz), facing angle ac (atan2(dx,dz)), half-width hw; tapers in at both ends
  function berm(S) { S.kind = 'b'; S.L = Math.sqrt(S.R * S.R - (S.R - S.H) ** 2); shapes.push(S); const ro = S.r0 + S.L + S.deck, NA = 28, prf = [[S.r0 - 0.3, 0]];
    for (let i = 0; i <= 10; i++) { const u = S.L * i / 10; prf.push([S.r0 + u, S.R - Math.sqrt(S.R * S.R - u * u)]); } prf.push([ro, S.H]); prf.push([ro, 0]);
    const pos = [], idx = [], np = prf.length; for (let i = 0; i <= NA; i++) { const a = S.ac - S.hw + 2 * S.hw * i / NA, tp = sstep(0, 0.5, S.hw - Math.abs(a - S.ac)); for (const [r, h] of prf) pos.push(S.cx + Math.sin(a) * r, h * tp + 0.01, S.cz + Math.cos(a) * r); }
    for (let i = 0; i < NA; i++) for (let j = 0; j < np - 1; j++) { const a = i * np + j, b = a + np; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const uv = []; for (let i = 0; i <= NA; i++) for (let j = 0; j < np; j++) uv.push(i * 0.35, j * 0.3); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    const m = new THREE.Mesh(geo, dirtM2); m.receiveShadow = true; scene.add(m); S.time = 0; return S; }
  function surfAt(x, z) { let best = null;
    for (const S of shapes) { let u, nx, nz, tp = 1;
      if (S.kind === 'q') { const dx = x - S.o.x, dz = z - S.o.z; u = dx * S.nx + dz * S.nz; const v = dx * S.nz - dz * S.nx; if (Math.abs(v) > S.len / 2) continue; nx = S.nx; nz = S.nz; }
      else { const dx = x - S.cx, dz = z - S.cz, r = Math.hypot(dx, dz) || 1e-3, a = Math.atan2(dx, dz), d = Math.abs(wrap(a - S.ac)); if (d > S.hw) continue; tp = sstep(0, 0.5, S.hw - d); u = r - S.r0; nx = dx / r; nz = dz / r; }
      const p = prof(S, u); if (!p) continue; const h = p[0] * tp; if (!best || h > best.h) best = { S, u, h, tan: p[1] * tp, nx, nz }; }
    return best; }
  function addBox(x0, x1, z0, z1, h, mat = woodBox, out = 0.02, vis = true) { const B = { x0, x1, z0, z1, h }; boxes.push(B); if (vis) M(new THREE.BoxGeometry(x1 - x0, h, z1 - z0), mat, (x0 + x1) / 2, h / 2, (z0 + z1) / 2, null, out); return B; }
  function groundH(x, z, h0) { let h = h0; const s = surfAt(x, z); if (s && s.h > h) h = s.h; for (const B of boxes) if (x > B.x0 && x < B.x1 && z > B.z0 && z < B.z1 && B.h > h) h = B.h; return h; }

  // L1 flag gates
  const GATES = [];
  const flagT = CT(64, 64, (g) => { g.fillStyle = '#e6b45a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#2f5d2a'; g.font = '900 46px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('N', 32, 35); });
  for (let k = 0; k < 6; k++) { const gx = k % 2 ? 3.5 : -3.5, gz = -84 + k * 5.5, G0 = { x: gx, z: gz, done: false };
    for (const sx of [-2.4, 2.4]) { M(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), white, gx + sx, 1.1, gz, null, 0.008); for (const sd of [1, -1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), new THREE.MeshBasicMaterial({ map: flagT })); f.position.set(gx + sx + (sx < 0 ? 0.42 : -0.42), 1.85, gz + sd * 0.005); if (sd < 0) f.rotation.y = Math.PI; scene.add(f); } }
    const ln = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 0.16), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.85 })); ln.rotation.x = -Math.PI / 2; ln.position.set(gx, 0.03, gz); scene.add(ln); G0.ln = ln; GATES.push(G0); }
  // L2 logs + bush walls
  const LOGS = [-46, -40, -34, -28].map(z => ({ z, done: false })); const logM = toon('#7a5232'), logEnd = toon('#d9b27a');
  for (const L0 of LOGS) { addBox(-7, 7, L0.z - 0.28, L0.z + 0.28, 0.5, null, 0, false); const lg = M(new THREE.CylinderGeometry(0.3, 0.32, 14, 12), logM, 0, 0.3, L0.z, null, 0.02, 0.3); lg.rotation.z = Math.PI / 2; for (const sx of [-7, 7]) { const e = M(new THREE.CircleGeometry(0.3, 12), logEnd, sx + Math.sign(sx) * 0.01, 0.3, L0.z, null, 0); e.rotation.y = Math.sign(sx) * Math.PI / 2; } }
  const bushM = [toon('#3f6b2a'), toon('#4f7f33')]; for (const sx of [-8.6, 8.6]) { boxes.push({ x0: sx - 0.6, x1: sx + 0.6, z0: -50, z1: -24, h: 1.1 }); for (let z = -49; z <= -25; z += 2) M(new THREE.IcosahedronGeometry(1.0, 0), bushM[(z / 2) & 1], sx, 0.7, z, null, 0.03, 1); }
  // L3 berms (serpentine)
  const BERMS = [berm({ cx: 30, cz: -64, ac: 0, hw: Math.PI / 2 + 0.25, r0: 4.2, R: 3.6, H: 1.4, deck: 0.7 }), berm({ cx: 42, cz: -88, ac: Math.PI, hw: Math.PI / 2 + 0.25, r0: 4.2, R: 3.6, H: 1.4, deck: 0.7 }), berm({ cx: 54, cz: -64, ac: 0, hw: Math.PI / 2 + 0.25, r0: 4.2, R: 3.6, H: 1.4, deck: 0.7 })];
  // L4 drop decks
  X.addRamp({ x: -40, z: -86, yaw: 0, w: 6, l: 6, h: 1.2, top: 0 }, '#a8743f'); addBox(-43, -37, -80, -74, 1.2, woodM, 0.02);
  X.addRamp({ x: -40, z: -64, yaw: 0, w: 6, l: 8, h: 2.0, top: 0 }, '#a8743f'); addBox(-43, -37, -56, -50, 2.0, woodM, 0.02);
  for (const [z, h] of [[-74, 1.2], [-50, 2.0]]) M(new THREE.BoxGeometry(6.04, 0.06, 0.2), gold, -40, h + 0.03, z - 0.1, null, 0);
  // L5 wheelie strip
  const WSTRIP = { x0: -42.5, x1: -37.5, z0: -38, z1: -14 }; { const m = new THREE.Mesh(new THREE.PlaneGeometry(5, 24), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.55, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(-40, 0.03, -26); scene.add(m); }
  // L6 jump line: kicker + tabletop + landing
  const KICKS = [];
  function tabletop(x, z0, R, H, w, table, land) { const k = quarter({ o: { x, z: z0 }, phi: 0, len: w, R, H, deck: 0, kick: true }); const lip = z0 + k.L; addBox(x - w / 2, x + w / 2, lip, lip + table, H, woodM, 0.02); X.addRamp({ x, z: lip + table + land, yaw: Math.PI, w, l: land, h: H, top: 0 }, '#a8743f'); k.landZ = lip + table; KICKS.push(k); return k; }
  const JL = [-14, 6, 26].map(z => tabletop(0, z, 3.6, 1.3, 7.5, 3.5, 5));
  // L7 skinny bridge over the stream
  const SK = { x: 40, z0: -22, z1: 2, h: 0.9, w: 0.8 };
  X.addRamp({ x: 40, z: -26, yaw: 0, w: SK.w, l: 4, h: SK.h, top: 0 }, '#a8743f'); addBox(SK.x - SK.w / 2, SK.x + SK.w / 2, SK.z0, SK.z1, SK.h, woodM, 0.015); X.addRamp({ x: 40, z: SK.z1 + 4, yaw: Math.PI, w: SK.w, l: 4, h: SK.h, top: 0 }, '#a8743f');
  for (let z = SK.z0 + 1; z < SK.z1; z += 3) for (const sx of [-0.3, 0.3]) M(new THREE.BoxGeometry(0.12, SK.h, 0.12), woodD, SK.x + sx, SK.h / 2, z, null, 0.01);
  const waterT = CT(256, 256, (g, w, h) => { g.fillStyle = '#4fa3c7'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 3; for (let i = 0; i < 30; i++) { const x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 12, y - 4, x + 24, y); g.stroke(); } }); waterT.wrapS = waterT.wrapT = THREE.RepeatWrapping; waterT.repeat.set(5, 3);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), new THREE.MeshToonMaterial({ map: waterT, gradientMap: X.grad })); water.rotation.x = -Math.PI / 2; water.position.set(40, 0.035, -11); scene.add(water);
  for (let i = 0; i < 12; i++) { const x = 29.5 + i * 1.9, z = i % 2 ? -15.8 : -6.2; M(new THREE.DodecahedronGeometry(rr(0.35, 0.7), 0), toon(i % 3 ? '#8d8a80' : '#a7a396'), x, 0.2, z + rr(-0.4, 0.4), null, 0.02, 0.5); }
  // L9 rock garden
  const ROCKS = { x: 60, z0: 0, z1: 44 }; const rockM = [toon('#8d8a80'), toon('#a7a396'), toon('#77746b')];
  for (let i = 0; i < (touch ? 40 : 54); i++) { const x = 60 + rr(-4.6, 4.6), z = rr(2, 42), s = rr(0.35, 0.7), h = rr(0.18, 0.3); boxes.push({ x0: x - s * 0.7, x1: x + s * 0.7, z0: z - s * 0.7, z1: z + s * 0.7, h, rock: true }); const r = M(new THREE.DodecahedronGeometry(s, 0), rockM[i % 3], x, h - s * 0.55, z, null, 0.02, s); r.scale.y = 0.75; r.rotation.y = rr(0, 3); }
  // FINISH ARENA (contest): big tabletops, drop deck, the wall
  const AK = [tabletop(-14, 62, 5, 2.0, 8, 4, 7), tabletop(14, 62, 5, 2.0, 8, 4, 7)];
  X.addRamp({ x: 0, z: 70, yaw: 0, w: 7, l: 8, h: 2.6, top: 0 }, '#a8743f'); addBox(-3.5, 3.5, 78, 84, 2.6, woodM, 0.02);
  const WALL = quarter({ o: { x: 0, z: 97 }, phi: 0, len: 34, R: 4.2, H: 2.4, deck: 2.5, vert: true });
  { const fl = new THREE.Mesh(new THREE.PlaneGeometry(76, 56), dirtM); dirtT.repeat.set(1, 1); fl.material = new THREE.MeshToonMaterial({ map: (() => { const t = dirtT.clone(); t.needsUpdate = true; t.repeat.set(19, 14); return t; })(), gradientMap: X.grad }); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.015, 78); fl.receiveShadow = true; scene.add(fl); }

  // ---------- trees, lanterns, bleachers, banners ----------
  const TREES = [];
  const trunkM = [toon('#6b4a2c'), toon('#5a3d24')], leafM = [toon('#3f6b2a'), toon('#557f30'), toon('#6d8f2f'), toon('#c9a33a')], mossM = toon('#6f8f3a'), pineM = [toon('#2f5d2a'), toon('#3a6b30')];
  function giant(x, z, s = 1) { const h = 13 * s, r = 1.3 * s; M(new THREE.CylinderGeometry(r * 0.75, r, h, 10), trunkM[0], x, h / 2, z, null, 0.04); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + rr(-0.2, 0.2), rt = M(new THREE.CylinderGeometry(0.15 * s, 0.45 * s, 2.6 * s, 6), trunkM[1], x + Math.sin(a) * r * 1.1, 0.5 * s, z + Math.cos(a) * r * 1.1, null, 0.02); rt.rotation.set(Math.cos(a) * 1.0, 0, -Math.sin(a) * 1.0); }
    M(new THREE.CylinderGeometry(r * 1.01, r * 1.01, 1.6 * s, 10, 1, true), mossM, x, 1.2 * s, z, null, 0);
    for (let k = 0; k < 4; k++) M(new THREE.IcosahedronGeometry(rr(3.4, 4.8) * s, 0), leafM[(k + Math.floor(x)) & 3], x + rr(-2.5, 2.5) * s, h + rr(-1, 2) * s, z + rr(-2.5, 2.5) * s, null, 0.05, 4 * s);
    TREES.push([x, z, r + 0.6]); }
  function pine(x, z, s = 1) { M(new THREE.CylinderGeometry(0.2 * s, 0.28 * s, 2 * s, 6), trunkM[0], x, s, z, null, 0.02); for (let k = 0; k < 3; k++) M(new THREE.ConeGeometry((2.4 - k * 0.6) * s, 2.8 * s, 8), pineM[k & 1], x, (2.2 + k * 1.7) * s, z, null, 0.03); TREES.push([x, z, 0.8 * s]); }
  for (let i = 0; i < (touch ? 26 : 38); i++) { const a = i / (touch ? 26 : 38) * TAU, x = Math.cos(a) * 92 * rr(0.95, 1.08), z = 2 + Math.sin(a) * 128 * rr(0.98, 1.06); giant(x, z, rr(1.1, 1.6)); }
  let placed = 0; for (let i = 0; i < 600 && placed < (touch ? 70 : 110); i++) { const x = rr(-76, 76), z = rr(-104, 106); if (nearTrail(x, z, 3.5) || (Math.abs(x) < 40 && z > 50) || (x > 16 && x < 66 && z > -98 && z < -52) || (Math.abs(x - 40) < 22 && z > -30 && z < 14) || TREES.some(([tx, tz]) => Math.hypot(tx - x, tz - z) < 5) || [...LESSONS.map(L => L.start), [0, 54]].some(([sx, sz]) => Math.abs(x - sx) < 8 && z > sz - 18 && z < sz + 2)) continue; placed++; if (Math.random() < 0.25) giant(x, z, rr(0.6, 0.9)); else pine(x, z, rr(0.8, 1.3)); }
  const lampGlow = () => new THREE.SpriteMaterial({ map: X.glowTex, color: 0xffd98a, transparent: true, depthWrite: false, opacity: 0.55, blending: THREE.AdditiveBlending }), LAMPS = [];
  function lantern(x, z) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); M(new THREE.CylinderGeometry(0.08, 0.1, 2.6, 6), woodD, 0, 1.3, 0, g, 0); M(new THREE.BoxGeometry(0.5, 0.08, 0.08), woodD, 0.22, 2.55, 0, g, 0);
    M(new THREE.BoxGeometry(0.28, 0.36, 0.28), gold, 0.42, 2.3, 0, g, 0.012); const s = new THREE.Sprite(lampGlow()); s.position.set(0.42, 2.3, 0); s.scale.setScalar(1.4); g.add(s); LAMPS.push([x, z]); }
  for (const [x0, z0, x1, z1, w] of TRAILS) { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.floor(L / 14)), ux = (x1 - x0) / L, uz = (z1 - z0) / L; for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t; for (const sd of [-1, 1]) { const lx = x + uz * sd * (w / 2 + 1.2), lz = z - ux * sd * (w / 2 + 1.2); if (!nearTrail(lx, lz, 0.4) && !LAMPS.some(([a, b]) => Math.hypot(a - lx, b - lz) < 6)) lantern(lx, lz); } } }
  const crestT = CT(256, 256, g => { g.fillStyle = '#2f5d2a'; g.beginPath(); g.arc(128, 128, 120, 0, TAU); g.fill(); g.lineWidth = 14; g.strokeStyle = '#e6b45a'; g.beginPath(); g.arc(128, 128, 100, 0, TAU); g.stroke(); g.fillStyle = '#e6b45a'; g.font = '900 150px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('N', 128, 138); });
  function arch(x, z, w, text) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); for (const sx of [-w / 2, w / 2]) { M(new THREE.CylinderGeometry(0.35, 0.42, 6, 8), trunkM[0], sx, 3, 0, g, 0.02); TREES.push([x + sx, z, 0.7]); } M(new THREE.BoxGeometry(w + 1.4, 0.6, 0.7), trunkM[1], 0, 6.1, 0, g, 0.02);
    const t = CT(1024, 192, (c, W, H) => { c.fillStyle = '#2f5d2a'; c.fillRect(0, 0, W, H); c.fillStyle = '#e6b45a'; c.fillRect(0, 0, W, 10); c.fillRect(0, H - 10, W, 10); c.font = '900 104px Archivo, sans-serif'; c.textBaseline = 'middle'; c.fillText(text, 40, H / 2 + 6); });
    for (const sd of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w, 9), 1.7), new THREE.MeshBasicMaterial({ map: t })); p.position.set(0, 5, 0.36 * sd); if (sd < 0) p.rotation.y = Math.PI; g.add(p); const c = new THREE.Mesh(new THREE.CircleGeometry(0.9, 24), new THREE.MeshBasicMaterial({ map: crestT })); c.position.set(-w / 2 + 0.2, 6.1, 0.37 * sd); if (sd < 0) c.rotation.y = Math.PI; g.add(c); } }
  arch(0, -99, 10, 'NEBO BIKE PARK'); arch(0, 50, 12, 'FINISH ARENA');
  const fans = []; for (const sx of [-1, 1]) { const bx = sx * 34; for (let k = 0; k < 3; k++) { const a = bx - sx * 1.5 + sx * k, b = bx + sx * 1.5; addBox(Math.min(a, b), Math.max(a, b), 60, 92, 0.6 + k * 0.6, woodBox, 0.02); }
    const tc = [['#38bdf8', '#e0f2fe', '#0369a1'], ['#e6b45a', '#fef3c7', '#92400e'], ['#a3e635', '#ecfccb', '#3f6212'], ['#f472b6', '#fce7f3', '#9d174d']];
    for (let i = 0; i < (touch ? 2 : 4); i++) { const f = X.kit.makeFox({ ...X.CAST.player, torso: tc[(i + (sx > 0 ? 2 : 0)) % 4], crest: '', gear: 'none', outfit: 'vest', mood: 'happy' }); f.position.set(bx + sx * 0.6, 1.8, 64 + i * 7); f.rotation.y = -sx * Math.PI / 2; scene.add(f); fans.push({ f, hop: 0 }); } }
  const cheer = () => fans.forEach(F => F.hop = Math.max(F.hop, rr(0.6, 1)));
  function label(n, s, x, z) { const t = CT(1024, 256, (g, w, h) => { g.fillStyle = '#2f5d2a'; g.fillRect(0, 30, 200, 196); g.fillStyle = '#e6b45a'; g.font = '900 170px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(n, 50, 136); g.fillStyle = '#f3f2f2'; g.font = '900 112px Archivo, sans-serif'; g.fillText(s, 236, 136); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); m.rotation.set(-Math.PI / 2, 0, Math.PI); m.position.set(x, 0.03, z); scene.add(m); }
  LESSONS.forEach((L, i) => label(String(i + 1), L.name.split(' ')[0], L.start[0], L.start[1] + 4.5));

  // ---------- creatures in the laser woods (they stay off the trail) ----------
  const CREAT = [], proj = [];
  const KIND = { thorn: { name: 'THORNBACK', hp: 36, r: 1.4, h: 2.2, pts: 60 }, cone: { name: 'CONETHROWER', hp: 24, r: 1.1, h: 1.8, pts: 60 }, logger: { name: 'KINDLING LOGGER', hp: 24, r: 1.0, h: 2.0, pts: 60 } };
  function coneModel() { const g = new THREE.Group(), b = new THREE.Group(); b.position.y = 0.2; g.add(b); const sc = [toon('#7a5232'), toon('#5e3d22')];
    for (let k = 0; k < 4; k++) M(new THREE.ConeGeometry(0.62 - k * 0.12, 0.5, 8), sc[k & 1], 0, 0.35 + k * 0.28, 0, b, 0.02).rotation.x = Math.PI;
    M(new THREE.SphereGeometry(0.5, 10, 8), sc[0], 0, 0.45, 0, b, 0.02, 0.5);
    for (const sx of [-1, 1]) { M(new THREE.SphereGeometry(0.13, 10, 8), white, sx * 0.17, 0.95, 0.38, b, 0.008, 0.13); M(new THREE.SphereGeometry(0.06, 8, 6), ink, sx * 0.17, 0.95, 0.49, b, 0); M(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 6), sc[1], sx * 0.2, 0.05, 0, g, 0.01); }
    const arm = new THREE.Group(); arm.position.set(0.5, 0.75, 0); b.add(arm); M(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), sc[1], 0, -0.2, 0, arm, 0.01); M(new THREE.ConeGeometry(0.14, 0.3, 7), sc[0], 0, -0.48, 0, arm, 0.01);
    g.scale.setScalar(1.3); g.userData.b = b; g.userData.arm = arm; return g; }
  function loggerModel() { const f = X.kit.makeFox({ ...X.CAST.player, look: { ...X.CAST.player.look, fur: '#8a5a3a', furDark: '#5e3a22', tailMid: '#8a5a3a', tailBase: '#6a4428', paw: '#8a5a3a' }, torso: ['#7a3b1f', '#3a2a1a', '#d9b27a'], outfit: 'vest', crest: '', gear: 'none', eyes: ['#f59e0b', '#f59e0b'], mood: 'angry' });
    const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; if (P.arms && P.arms[1]) { const ax = new THREE.Group(); ax.position.set(0, -0.4, 0.05); P.arms[1].add(ax); M(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 6), woodD, 0, 0, 0, ax, 0.006); M(new THREE.BoxGeometry(0.04, 0.16, 0.2), steel, 0, 0.26, 0.08, ax, 0.006); } return f; }
  function spawnC(kind, x, z) { const D = KIND[kind]; let g; if (kind === 'thorn') { g = ck.build('Thornback') || new THREE.Group(); g.scale.multiplyScalar(1.5); ck.enter(g, 'idle'); } else if (kind === 'cone') g = coneModel(); else g = loggerModel();
    g.position.set(x, 0, z); scene.add(g); const o = { kind, custom: true, noRespawn: true, g, sq: g, x, z, r: D.r, h: D.h, hp: D.hp, max: D.hp, D, home: [x, z], st: 'idle', t: 0, cd: rr(1.5, 3), face: 0, back: 0 };
    o.onHit = () => { o.flash = 0.15; o.st = o.st === 'swipe' ? o.st : 'hurt'; o.t = 0; }; X.props.push(o); CREAT.push(o); return o; }
  [['thorn', -70, 6], ['thorn', -49, 24], ['thorn', -71, 42], ['cone', -50, -2], ['cone', -70, 52], ['cone', -48, 38], ['logger', -49, 10], ['logger', -71, 24], ['logger', -50, 52]].forEach(a => spawnC(...a));
  const coneGeo = new THREE.SphereGeometry(0.22, 8, 6), logGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.7, 8);
  function throwAt(o, kind) { const c = X.C, tt = 1.0, tx = c.x + Math.sin(c.yaw) * c.speed * tt, tz = c.z + Math.cos(c.yaw) * c.speed * tt, p = V3(o.x, 1.6, o.z), v = V3((tx - o.x) / tt, (c.y + 1 - 1.6 + 9 * tt * tt) / tt, (tz - o.z) / tt);
    const m = new THREE.Mesh(kind === 'cone' ? coneGeo : logGeo, kind === 'cone' ? toon('#7a5232') : logM); m.position.copy(p); scene.add(m); proj.push({ m, v, life: 2.2, spin: kind === 'cone' ? 6 : 10 }); X.audio.tone(320, 0.12, 0.04, 'triangle', 1.6); }
  function onSmash(o) { if (!CREAT.includes(o)) return; o.st = 'die'; o.t = 0; G.kos++; if (o.kind === 'thorn') ck.enter(o.g, 'die'); X.puff(tmp.set(o.x, 1, o.z), o.kind === 'thorn' ? 0x6b4a2c : 0xb8a77a, 12, 3, 1, 0.8); X.popup(tmp.set(o.x, o.h + 1, o.z), o.D.name + ' DOWN', '#ffd23a'); addMove(o.D.name.split(' ').pop() + ' DOWN', o.D.pts); if (G.place === 'school' && LESSONS[G.les].id === 'laser') lesCount(); o.back = 20; }
  function updCreatures(dt) { const c = X.C, live = G.phase === 'run';
    for (const o of CREAT) { o.t += dt; const dx = c.x - o.x, dz = c.z - o.z, d = Math.hypot(dx, dz);
      if (o.dead) { if (o.st === 'die') { const k = Math.min(1, o.t / 0.6); if (o.kind !== 'thorn') { o.g.rotation.x = -k * 1.4; o.g.position.y = -k * 0.3; } else ck.animate(o.g, 'die', o.t, dt); if (o.t > 1.5) { o.g.visible = false; o.st = 'gone'; } } o.back -= dt; if (o.back <= 0 && d > 18) { o.dead = false; o.hp = o.max; o.st = 'idle'; o.t = 0; o.g.visible = true; o.g.rotation.set(0, o.face, 0); o.g.position.set(o.x, 0, o.z); if (o.kind === 'thorn') ck.enter(o.g, 'idle'); } continue; }
      if (d < 30) o.face = damp(o.face, o.face + wrap(Math.atan2(dx, dz) - o.face), 4, dt); o.g.rotation.y = o.face;
      if (o.kind === 'thorn') { if (o.st !== 'swipe' && d < 3.4 && live) { o.st = 'swipe'; o.t = 0; ck.enter(o.g, 'windup'); } if (o.st === 'swipe') { ck.animate(o.g, o.t < 0.6 ? 'windup' : 'attack', o.t < 0.6 ? o.t : o.t - 0.6, dt); if (o.t > 0.6 && !o.hit) { o.hit = true; if (d < 3.6) bonk('THORNED!'); } if (o.t > 1.3) { o.st = 'idle'; o.hit = false; ck.enter(o.g, 'idle'); } } else ck.animate(o.g, 'idle', o.t, dt); }
      else { const b = o.kind === 'cone' ? o.g.userData.b : null; if (b) b.position.y = 0.2 + Math.abs(Math.sin(o.t * 4)) * 0.08; else o.g.position.y = Math.abs(Math.sin(o.t * 3)) * 0.05;
        o.cd -= dt; if (live && d < 26 && d > 4 && o.cd <= 0) { o.cd = rr(2.6, 3.6); o.throwT = 0.35; } if (o.throwT > 0) { o.throwT -= dt; const arm = o.kind === 'cone' ? o.g.userData.arm : (o.g.userData.P.arms || [])[1]; if (arm) arm.rotation.x = -2.4 * Math.sin((1 - o.throwT / 0.35) * Math.PI); if (o.throwT <= 0) throwAt(o, o.kind === 'cone' ? 'cone' : 'log'); } }
      if (o.flash > 0) { o.flash -= dt; o.g.scale.setScalar((o.kind === 'thorn' ? 1.5 : o.kind === 'cone' ? 1.3 : 1) * (1 + o.flash * 0.6)); } }
    for (let i = proj.length - 1; i >= 0; i--) { const p = proj[i]; p.life -= dt; p.v.y -= 18 * dt; p.m.position.addScaledVector(p.v, dt); p.m.rotation.x += p.spin * dt; p.m.rotation.z += p.spin * 0.7 * dt;
      if (p.m.position.distanceTo(tmp.set(c.x, c.y + 1, c.z)) < 1.3) { bonk('BONK!'); p.life = 0; } if (p.m.position.y < 0.1 || p.life <= 0) { if (p.m.position.y < 0.1) X.puff(p.m.position, 0xb8a77a, 3, 1.5, 0.5, 0.4); scene.remove(p.m); proj.splice(i, 1); } } }

  // ---------- BART + chalkboard at the start ----------
  const boardCv = document.createElement('canvas'); boardCv.width = 1600; boardCv.height = 900;
  const boardCvP = document.createElement('canvas'); boardCvP.width = 900; boardCvP.height = 1600;
  const boardTex = new THREE.CanvasTexture(boardCv); boardTex.colorSpace = THREE.SRGBColorSpace; boardTex.anisotropy = 8;
  const BD = { x: -11, z: -92 }; BD.yaw = Math.atan2(0 - BD.x, -100 - BD.z);
  { const g = new THREE.Group(); g.position.set(BD.x, 0, BD.z); g.rotation.y = BD.yaw; scene.add(g); const wood = toon('#7a4f2a');
    for (const side of [1, -1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 3.15), new THREE.MeshBasicMaterial({ map: boardTex })); pl.position.set(0, 3.1, 0.08 * side); if (side < 0) pl.rotation.y = Math.PI; g.add(pl); }
    M(new THREE.BoxGeometry(6, 3.5, 0.14), wood, 0, 3.1, 0, g, 0.03); for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.16, 4.9, 0.16), wood, sx * 2.7, 2.3, -0.2, g, 0.01); M(new THREE.BoxGeometry(5.8, 0.1, 0.36), wood, 0, 1.35, 0.18, g, 0.01); TREES.push([BD.x, BD.z, 1.6]); }
  const BART_LOOK = { ...X.CAST.player.look, fur: '#c9772e', furDark: '#8f4c17', tailMid: '#c9772e', tailBase: '#a85e20', paw: '#c9772e', leg: '#1f2937', boot: '#ec3013', headScale: 1.2, legLength: 1.3 };
  const bart = X.kit.makeFox({ ...X.CAST.player, look: BART_LOOK, torso: ['#2f5d2a', '#e6b45a', '#201e1d'], outfit: 'vest', crest: '', gear: 'none', eyes: ['#22c55e', '#22c55e'], mood: 'happy' });
  const BP = bart.userData.P; if (BP.sword) BP.sword.visible = false; if (BP.gun) BP.gun.visible = false;
  { const cap = new THREE.Group(); cap.position.set(0, 1.92, -0.02); BP.body.add(cap); M(new THREE.SphereGeometry(0.3, 14, 8, 0, TAU, 0, Math.PI / 2), red, 0, 0, 0, cap, 0.012, 0.3); M(new THREE.BoxGeometry(0.34, 0.03, 0.28), red, 0, 0, -0.36, cap, 0.008); for (const sx of [-1, 1]) M(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 12), toon('#38bdf8'), sx * 0.12, 0.08, 0.27, cap, 0.008).rotation.x = Math.PI / 2; }
  const BART = { x: -6.5, z: -90, hop: 0 }; bart.position.set(BART.x, 0, BART.z); scene.add(bart); TREES.push([BART.x, BART.z, 0.8]);
  { const bk = X.makeVeh('bike'), bs = (bk.userData.V.spec && bk.userData.V.spec.scale) || 1; bk.scale.setScalar(bs); bk.position.set(-8.4, 0, -88.6); bk.rotation.set(0, 0.6, 0.18); scene.add(bk); TREES.push([-8.4, -88.6, 1]); }
  const bubCv = document.createElement('canvas'); bubCv.width = 768; bubCv.height = 160; const bubTex = new THREE.CanvasTexture(bubCv); bubTex.colorSpace = THREE.SRGBColorSpace;
  const bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubTex, transparent: true, depthTest: false })); bub.scale.set(5.4, 1.12, 1); bub.position.set(BART.x, 3.4, BART.z); bub.renderOrder = 9; scene.add(bub); let bubText = '';
  function bartSay(s) { if (s === bubText) return; bubText = s; const g = bubCv.getContext('2d'); g.clearRect(0, 0, 768, 160); g.font = '800 40px Archivo, sans-serif'; const w = Math.min(760, g.measureText(s).width + 56); g.fillStyle = '#f3f2f2'; g.fillRect(4, 4, w, 108); g.strokeStyle = '#201e1d'; g.lineWidth = 6; g.strokeRect(4, 4, w, 108); g.beginPath(); g.moveTo(40, 112); g.lineTo(70, 150); g.lineTo(90, 112); g.closePath(); g.fillStyle = '#f3f2f2'; g.fill(); g.stroke(); g.fillStyle = '#201e1d'; g.textBaseline = 'middle'; g.fillText(s, 32, 60, w - 50); bubTex.needsUpdate = true; }
  bartSay('Read the board, rookie.');

  // ---------- the chalk sheet ----------
  function drawBoard(g, P = false) {
    const W = P ? 900 : 1600, H = P ? 1600 : 900, J = (n = 1.6) => (Math.random() - 0.5) * n * 2;
    g.fillStyle = '#7a4f2a'; g.fillRect(0, 0, W, H); const x0 = 34, y0 = 34, w = W - 68, h = H - 98; g.fillStyle = '#1f2b27'; g.fillRect(x0, y0, w, h);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.beginPath(); g.ellipse(x0 + Math.random() * w, y0 + Math.random() * h, 60 + Math.random() * 200, 20 + Math.random() * 60, Math.random() * 3, 0, 7); g.fill(); }
    const CH = '#f2f1e8', YL = '#f5e08a', RD = '#ff9a8a', BL = '#9fd8f5', GR = '#b6e3a0', HF = '"Caveat", "Segoe Print", "Bradley Hand", cursive';
    const txt = (s, x, y, size, col = CH, wt = 800, fam = 'Archivo, sans-serif') => { g.font = `${wt} ${size}px ${fam}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.fillStyle = col; g.globalAlpha = 0.92; g.fillText(s, x, y); g.globalAlpha = 0.28; g.fillText(s, x + 1.6, y + 1.2); g.globalAlpha = 1; };
    const hw = (s, x, y, size, col = YL) => txt(String(s).toUpperCase(), x, y, size, col, 700, HF);
    const ln = (pts, col = CH, wd = 5, close) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = 0.9; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + J(), y + J()) : g.moveTo(x + J(), y + J())); if (close) g.closePath(); g.stroke(); g.globalAlpha = 1; };
    const circ = (x, y, r, col = CH, wd = 5) => { g.strokeStyle = col; g.lineWidth = wd; g.globalAlpha = 0.9; g.beginPath(); g.arc(x + J(), y + J(), r, 0, TAU); g.stroke(); g.globalAlpha = 1; };
    const arrow = (x1, y1, x2, y2, col = YL) => { ln([[x1, y1], [(x1 + x2) / 2 + 12, (y1 + y2) / 2 - 10], [x2, y2]], col, 4); const a = Math.atan2(y2 - y1, x2 - x1); ln([[x2 - Math.cos(a - 0.5) * 22, y2 - Math.sin(a - 0.5) * 22], [x2, y2], [x2 - Math.cos(a + 0.5) * 22, y2 - Math.sin(a + 0.5) * 22]], col, 4); };
    txt('BIKE PARK', 86, 150, P ? 104 : 112, CH, 900); txt('NEBO  ·  COACH BART  ·  9 LESSONS  +  THE CONTEST', 90, 202, P ? 24 : 30, YL, 800); ln([[88, 226], [P ? 800 : 860, 222]], CH, 4);
    // the bike, side view
    g.save(); if (P) { g.translate(-560, 170); g.scale(0.92, 0.92); } else g.translate(0, 40);
    { const RW = [1000, 380], FW = [1400, 380]; for (const [x, y] of [RW, FW]) { circ(x, y, 70, CH, 7); circ(x, y, 12, CH, 4); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI; ln([[x - Math.cos(a) * 64, y - Math.sin(a) * 64], [x + Math.cos(a) * 64, y + Math.sin(a) * 64]], CH, 2); } }
      ln([[1000, 380], [1150, 380], [1110, 250], [1000, 380]], CH, 7); ln([[1150, 380], [1330, 250], [1110, 250]], CH, 7); ln([[1330, 250], [1400, 380]], CH, 6); ln([[1310, 250], [1300, 200], [1360, 196]], CH, 6); ln([[1110, 250], [1095, 215]], CH, 6); ln([[1065, 210], [1135, 210]], CH, 9);
      circ(1150, 380, 26, CH, 4); circ(1375, 210, 14, BL, 4);
      hw('1  Laser', 1430, 200, 38, BL); arrow(1440, 214, 1392, 208, BL);
      hw('2  Trick', 860, 210, 38, RD); g.strokeStyle = RD; g.lineWidth = 4; g.globalAlpha = 0.9; g.beginPath(); g.arc(1200, 300, 230, -2.7, -1.9); g.stroke(); g.globalAlpha = 1;
      hw('3  Hop', 1170, 186, 38); arrow(1200, 196, 1200, 238, YL);
      hw('Tap 2 in the air = 360', 940, 500, 32, CH); hw('Hold 2 = keep spinning: 720, 1080...', 940, 538, 32, YL); hw('Stick back + 2 = backflip', 940, 576, 32, GR); hw('Let go before you land!', 940, 620, 36, RD); }
    g.restore();
    g.save(); if (P) { g.translate(-10, 500); g.scale(1.1, 1.1); }
    const rows = [['STICK', 'WASD', 'Pedal + steer', CH], ['1', 'J', 'Laser  ·  creatures in the woods', BL], ['2', 'K', 'Trick  ·  ground: hold = wheelie', RD], ['3', 'SPACE', 'Bunny hop  ·  logs and gaps', YL], ['EYE', 'HOLD TO LOOK  ·  TAP = POV', 'Look around', CH]];
    rows.forEach(([k, kb, d, col], i) => { const y = 300 + i * (P ? 100 : 86), cx = 150, cy = y - 14;
      if (k === 'STICK') { circ(cx, cy, 31, CH, 4); g.globalAlpha = 0.5; g.fillStyle = CH; g.beginPath(); g.arc(cx + 6, cy - 9, 14, 0, 7); g.fill(); g.globalAlpha = 1; circ(cx + 6, cy - 9, 14, CH, 4); }
      else if (k === 'EYE') { circ(cx, cy, 30, CH, 4); ln([[cx - 19, cy], [cx - 9, cy - 8], [cx, cy - 10], [cx + 9, cy - 8], [cx + 19, cy], [cx + 9, cy + 8], [cx, cy + 10], [cx - 9, cy + 8]], CH, 3, true); g.fillStyle = CH; g.beginPath(); g.arc(cx, cy, 4, 0, 7); g.fill(); }
      else { g.globalAlpha = 0.9; g.strokeStyle = col; g.lineWidth = 9; g.beginPath(); g.arc(cx, cy, 30, 0, 7); g.stroke(); g.globalAlpha = 1; circ(cx, cy, 22, CH, 2); g.font = '900 34px Archivo, sans-serif'; g.textAlign = 'center'; g.fillStyle = CH; g.fillText(k, cx, cy + 12); g.textAlign = 'left'; }
      txt(kb, 230, y - 24, 18, '#b9c4bf', 800); txt(d, 230, y + 4, P ? 30 : 30, CH, 700); });
    g.restore();
    if (P) { ['1 GATES  2 LOGS  3 BERMS', '4 DROPS  5 WHEELIE  6 JUMPS', '7 SKINNY  8 LASER  9 ROCKS'].forEach((l, i) => hw(l, 90, H - 236 + i * 46, 40, YL)); hw('WIPEOUT = +3 S', 90, H - 92, 36, GR); }
    else { ['1 GATES  2 LOGS  3 BERMS', '4 DROPS  5 WHEELIE  6 JUMPS', '7 SKINNY  8 LASER  9 ROCKS'].forEach((l, i) => hw(l, 940, 728 + i * 34, 30, YL)); hw('WIPEOUT = +3 S', 90, 772, 34, GR); }
    g.fillStyle = '#5e3c1f'; g.fillRect(0, H - 64, W, 64); g.fillStyle = '#7a4f2a'; g.fillRect(0, H - 64, W, 10); for (let k = 0; k < 4; k++) { g.fillStyle = ['#f2f1e8', '#f5e08a', '#ff9a8a', '#f2f1e8'][k]; g.fillRect(260 + k * 120, H - 48, 70, 16); }
    for (let i = 0; i < 5000; i++) { g.fillStyle = 'rgba(31,43,39,0.55)'; g.fillRect(x0 + Math.random() * w, y0 + Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
  const paintBoards = () => { drawBoard(boardCv.getContext('2d')); drawBoard(boardCvP.getContext('2d'), true); boardTex.needsUpdate = true; course.boardURL = boardCv.toDataURL('image/jpeg', 0.9); course.boardURLP = boardCvP.toDataURL('image/jpeg', 0.9); course.onPaint && course.onPaint(); };
  try { if (!document.getElementById('font-caveat')) { const lk = document.createElement('link'); lk.id = 'font-caveat'; lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap'; document.head.appendChild(lk); } } catch (e) {}

  // ---------- folk loop (synth until Ben uploads the MP3s): plucked G-major arpeggios + shaker ----------
  const MU = { next: 0, step: 0, bus: null }, CHORDS = [[55, 59, 62, 67], [52, 55, 59, 64], [48, 52, 55, 60], [50, 54, 57, 62]], mf = n => 440 * Math.pow(2, (n - 69) / 12);
  function env(c, node, t, a, peak, d) { const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(peak, t + a); gn.gain.exponentialRampToValueAtTime(0.0001, t + a + d); node.connect(gn); gn.connect(MU.bus); }
  function noise(c, t, f, peak, d) { const s = c.createBufferSource(); s.buffer = X.audio.noise; const b = c.createBiquadFilter(); b.type = 'highpass'; b.frequency.value = f; s.connect(b); env(c, b, t, 0.003, peak, d); s.start(t, Math.random()); s.stop(t + d + 0.05); }
  function musicStep() { const a = X.audio, c = a.ctx; if (!c || !a.master || !a.noise) return;
    if (!MU.bus) { MU.bus = c.createGain(); MU.bus.gain.value = 0.5; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; MU.bus.connect(lp); lp.connect(a.master); }
    const spb = 60 / 96 / 2; if (MU.next < c.currentTime) MU.next = c.currentTime + 0.05;
    while (MU.next < c.currentTime + 0.25) { const s = MU.step, b = s % 8, ch = CHORDS[Math.floor(s / 8) % 4], t = MU.next;
      const n = [0, 1, 2, 3, 2, 1, 2, 3][b], o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = mf(ch[n] + 12); env(c, o, t, 0.005, 0.035, 0.35); o.start(t); o.stop(t + 0.45);
      if (b === 0 || b === 4) { const q = c.createOscillator(); q.type = 'sine'; q.frequency.value = mf(ch[0] - 12); env(c, q, t, 0.01, 0.08, 0.5); q.start(t); q.stop(t + 0.6); }
      noise(c, t, 6000, b % 2 ? 0.012 : 0.02, 0.06); MU.step++; MU.next += spb; } }

  // ---------- state ----------
  const G = { phase: 'ready', board: true, place: 'school', t: 0, pen: 0, pts: 0, les: 0, cnt: 0, nextT: 0, count: 0, banner: '', bannerT: 0, radio: '', radioT: 0, flash: null, flashT: 0, done: null, wipes: 0, bestTrick: null, bestCombo: 0, bestComboN: 0, spin: 0, stuckT: 0, cp: [0, -96, 0], ending: 0, b2: null, autoSpin: 0, whT: 0, bail: null, thr: 0, kos: 0, bonkT: 0, bermOn: null, bermT: 0, rockT: -1, onSkinny: false };
  const CB = { n: 0, pot: 0, idle: 0 };
  let T = null, A = null, P = null;
  const banner = (s, t = 3) => { G.banner = s; G.bannerT = t; }, radio = (s, t = 6) => { G.radio = s; G.radioT = t; }, flash = (txt, col = '#ffd23a', t = 1.6) => { G.flash = { txt, col }; G.flashT = t; };
  const PL = () => PLACES.find(p => p.id === G.place), LID = () => LESSONS[G.les].id, inSchool = id => G.place === 'school' && LID() === id;
  const fmtT = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') + '.' + Math.floor((s % 1) * 10);
  const C = () => X.C, Vv = () => X.V;
  function snapP() { const c = C(); P = { x: c.x, z: c.z, y: c.y, g: c.ground }; }
  function tp(x, z, yaw = 0) { const c = C(); X.place(x, z, yaw); c.grind = null; c.wheelieHold = false; c.flipT = null; c.spinT = null; c.slip = 0; const V = Vv(); if (V && V.body) V.body.rotation.z = 0; T = null; A = null; G.spin = 0; G.bail = null; G.b2 = null; G.autoSpin = 0; G.bermOn = null; G.rockT = -1; snapP(); }
  function resetRun() { G.t = 0; G.pen = 0; G.pts = 0; G.wipes = 0; G.kos = 0; G.bestTrick = null; G.bestCombo = 0; G.bestComboN = 0; G.done = null; G.flash = null; G.banner = ''; G.radio = ''; G.nextT = 0; G.ending = 0; CB.n = CB.pot = CB.idle = 0; GATES.forEach(g => { g.done = false; g.ln.material.color.setHex(0xffd23a); }); LOGS.forEach(l => l.done = false); BERMS.forEach(b => b.done = false); }

  // ---------- moves, combos, wipeouts ----------
  function addMove(name, pts) { const c = C(); CB.n++; CB.pot += pts; CB.idle = 0; X.popup(tmp.set(c.x, c.y + 3, c.z), name + ' +' + pts, '#ffd23a'); if (!G.bestTrick || pts > G.bestTrick.pts) G.bestTrick = { name, pts }; X.audio.tone(880 + CB.n * 110, 0.08, 0.04, 'triangle', 1.4); if (G.place === 'contest' && Math.hypot(c.x, c.z - 78) < 40) cheer(); }
  function bank() { if (!CB.n) return; const v = CB.pot * CB.n, n = CB.n; G.pts += v; if (v > G.bestCombo) { G.bestCombo = v; G.bestComboN = n; } if (n >= 2) { flash('COMBO ×' + n + ' · +' + v, '#ffd23a', 1.8); X.audio.tone(660, 0.1, 0.05, 'square', 1.5); setTimeout(() => X.audio.tone(990, 0.14, 0.05, 'square', 1.5), 110); } CB.n = CB.pot = CB.idle = 0; }
  function wipeout(why = 'WIPEOUT') { if (G.bail) return; const c = C(); G.bail = { t: 0 }; c.speed *= 0.15; c.wheelieHold = false; c.flipT = null; T = null; G.spin = 0; CB.n = CB.pot = CB.idle = 0; G.wipes++;
    if (G.place === 'school') G.pen += 2; else G.t += 2;
    flash(why + ' · ' + (G.place === 'school' ? '+2 S' : '−2 S'), '#ec3013', 1.8); X.St.shake = Math.max(X.St.shake, 0.45); X.puff(tmp.set(c.x, c.y + 0.3, c.z), 0xb8a77a, 12, 2.5, 0.8, 0.7); X.audio.burst(0.3, 420, 0.25); X.audio.tone(180, 0.3, 0.05, 'sawtooth', 0.5); if (Math.random() < 0.6 && !DM.on) { radio(BAILS[Math.floor(Math.random() * BAILS.length)], 3); bartSay('HA!'); } }
  function bonk(why) { if (G.bonkT > 0 || G.bail || G.phase !== 'run') return; G.bonkT = 1; const c = C(); c.speed *= 0.65; X.St.shake = Math.max(X.St.shake, 0.3); X.popup(tmp.set(c.x, c.y + 2.6, c.z), why, '#ec3013'); X.audio.burst(0.2, 600, 0.2); }
  function startTrick(held) { T = { rot: 0, held, target: held ? 0 : TAU, back: G.thr < -0.4, vert: !!(A && A.vert) }; X.audio.burst(0.06, 1500, 0.1); }
  function releaseTrick() { if (!T || !T.held) return; T.held = false; T.target = Math.max(1, Math.ceil(T.rot / TAU - 0.15)) * TAU; }
  function completeTrick() { const lvl = Math.round(T.target / TAU), L = T.back ? FLIPS : SPINS, [nm, p0] = L[Math.min(lvl, L.length) - 1], pts = Math.round(p0 * (T.vert ? 1.5 : 1)); const c = C(); c.flipT = null; T = null; G.spin = 0; if (A) A.tricks++; addMove((A && A.vert ? 'VERT ' : '') + nm, pts); }
  function endWheelie() { const c = C(); if (!c.wheelieHold) return; c.wheelieHold = false; const t = G.whT; G.whT = 0; if (t >= 0.8) addMove('WHEELIE ' + t.toFixed(1) + ' S', Math.round(25 + t * 40)); }
  function trickBtn(down) { const c = C();
    if (down) { const air = !c.ground; G.b2 = { t0: G.t, air }; if (air && !T) startTrick(true); return; }
    const b = G.b2; G.b2 = null; if (!b) return;
    if (T && T.held) releaseTrick(); else if (c.wheelieHold) endWheelie();
    else if (!b.air && G.t - b.t0 < 0.2 && c.ground) { G.autoSpin = 0.35; X.press(3, true); X.press(3, false); } }

  // ---------- lessons ----------
  function lesEnter(i, quiet) { G.les = i; G.cnt = 0; G.dropA = G.dropB = false; G.stuckT = 0; const L = LESSONS[i]; G.cp = L.start; tp(...L.start); if (!quiet) { banner('LESSON ' + (i + 1) + ' · ' + L.name, 3); radio(L.radio, 8); } bartSay(L.name + '. Go.'); }
  function lesCount() { if (G.place !== 'school' || G.nextT || DM.on || G.phase !== 'run') return; G.cnt++; G.stuckT = 0; X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.4); if (G.cnt >= LESSONS[G.les].need) lesPass(); }
  function lesPass() { bank(); G.pts += 200; flash('LESSON ' + (G.les + 1) + ' PASSED · +200', '#ffd23a', 2.2); radio(PASS[G.les] || PASS[0], 4); bartSay(PASS[G.les] || 'Fine.'); BART.hop = 1; G.nextT = 2.2; }
  function finish() { if (DM.on || G.phase === 'done') return; if (!G.bail) bank(); const pd = PL(), sch = G.place === 'school', tt = G.t + G.pen, tb = sch ? Math.max(0, Math.round((pd.target - tt) * 4)) : 0, total = Math.round(G.pts + tb), key = 'nebo.bike.' + G.place + '.best';
    let nb = false, best = total, trophy = false, has = false; try { nb = save.best(key, total); best = save.stat(key, total); if (sch) save.setFlag('bikeSchool'); has = save.flag('bikeTrophy'); if (!sch && total >= TROPHY_SCORE && !has) { save.setFlag('bikeTrophy'); save.give('bikeTrophy', 1); trophy = true; has = true; } save.addGold && save.addGold(Math.round(total / 100)); } catch (e) {}
    const th = sch ? [3600, 2800, 2000, 1200] : [3200, TROPHY_SCORE, 1300, 700], grade = total >= th[0] ? 'S' : total >= th[1] ? 'A' : total >= th[2] ? 'B' : total >= th[3] ? 'C' : 'D';
    const rows = [['Time', fmtT(sch ? tt : Math.min(60, G.t)) + (sch ? ' / target ' + fmtT(pd.target).slice(0, -2) : '')], ...(sch ? [['Lessons passed', '9 / 9'], ['Wipeouts', G.wipes + (G.pen ? ' (+' + G.pen + ' s)' : '')]] : [['Wipeouts', String(G.wipes)]]), ['Best combo', G.bestCombo ? G.bestCombo + ' (×' + G.bestComboN + ')' : '—'], ['Best trick', G.bestTrick ? G.bestTrick.name : '—'], ...(sch ? [['Time bonus', '+' + tb]] : [['Trophy', trophy ? 'WON · GOES HOME' : has ? 'ON YOUR SHELF' : 'SCORE ' + TROPHY_SCORE]])];
    G.done = { id: G.place, name: pd.name, title: sch ? 'Bike school passed' : trophy ? 'You won the trophy' : 'Contest over', next: sch ? 'contest' : null, total, grade, newBest: nb, best, gold: Math.round(total / 100), rows, trophy };
    G.phase = 'done'; X.setPaused(true); X.drive(0, 0);
    radio(sch ? 'Okay. You can ride. Come try the contest, if you dare.' : trophy ? 'Fine. FINE. Take the trophy. I let you win.' : 'Ha. ' + TROPHY_SCORE + ' wins the trophy. Again.', 8); bartSay(sch ? 'Contest next.' : trophy ? 'I let you win.' : 'Again!'); }
  function rollOut(id = G.place) { X.audio.init && X.audio.init(); DM.on = false; resetRun(); G.place = PLACES.some(p => p.id === id) ? id : 'school'; G.board = false; G.phase = 'count'; G.count = 3.2; X.setPaused(false);
    if (G.place === 'school') lesEnter(0, true); else { G.cp = [0, 54, 0]; tp(0, 54, 0); } banner(G.place === 'school' ? 'BIKE SCHOOL · LESSON 1' : 'THE CONTEST · 60 S', 3); }

  // ---------- guidance ----------
  function nextGoal() { if (G.place !== 'school' || G.nextT) return null; const id = LID(), c = C();
    if (id === 'gates') { const g = GATES.find(q => !q.done); return g ? { x: g.x, z: g.z, label: 'GATE ' + (GATES.indexOf(g) + 1) } : null; }
    if (id === 'logs') { const l = LOGS.find(q => !q.done); return l ? { x: 0, z: l.z, label: 'LOG ' + (LOGS.indexOf(l) + 1) } : null; }
    if (id === 'berms') { const b = BERMS.find(q => !q.done); return b ? { x: b.cx, z: b.cz + Math.cos(b.ac) * 5.5, label: 'BERM ' + (BERMS.indexOf(b) + 1) } : null; }
    if (id === 'drops') return c.z < -74 ? { x: -40, z: -77, label: 'DROP 1' } : { x: -40, z: -53, label: 'DROP 2' };
    if (id === 'wheelie') return c.z < -38 ? { x: -40, z: -36, label: 'WHEELIE LINE' } : null;
    if (id === 'jumps') { const k = JL.find(q => q.o.z > c.z - 1) || JL[0]; return { x: 0, z: k.o.z + 1, label: 'KICKER' }; }
    if (id === 'skinny') return c.z < SK.z0 ? { x: SK.x, z: SK.z0 - 4, label: 'BRIDGE' } : null;
    if (id === 'laser') { let b = null, bd = 1e9; for (const o of CREAT) { if (o.dead) continue; const d = Math.hypot(o.x - c.x, o.z - c.z); if (d < bd) { bd = d; b = o; } } return b ? { x: b.x, z: b.z, label: b.D.name } : null; }
    if (id === 'rocks') return c.z < ROCKS.z0 ? { x: 60, z: ROCKS.z0, label: 'ROCK GARDEN' } : { x: 60, z: ROCKS.z1, label: 'END' };
    return null; }

  // ---------- per-frame ----------
  function update(dt, thr) {
    musicStep(); const c = C(), V = Vv(); if (!V) return; G.thr = thr;
    bart.rotation.y = damp(bart.rotation.y, Math.atan2(c.x - BART.x, c.z - BART.z), 3, Math.max(dt, 1 / 120)); BART.hop = Math.max(0, BART.hop - dt * 1.4); bart.position.y = Math.abs(Math.sin(BART.hop * Math.PI * 3)) * 0.4 * BART.hop;
    for (const F of fans) { F.hop = Math.max(0, F.hop - dt * 1.6); F.f.position.y = 1.8 + Math.abs(Math.sin(F.hop * Math.PI * 4)) * 0.35 * F.hop; }
    waterT.offset.x -= dt * 0.2;
    if (!dt) { if (!P) snapP(); return; }
    updCreatures(dt); G.bonkT = Math.max(0, G.bonkT - dt);
    if (DM.on) demoStep(dt);
    G.bannerT -= dt; if (G.bannerT <= 0) G.banner = ''; G.radioT -= dt; if (G.radioT <= 0) G.radio = ''; G.flashT -= dt; if (G.flashT <= 0) G.flash = null;
    if (G.phase === 'count') { G.count -= dt; const s = G.cp; c.x = s[0]; c.z = s[1]; c.speed = 0; if (G.count <= 0) { G.phase = 'run'; G.count = 0; banner('GO!', 1); X.audio.tone(880, 0.3, 0.06, 'square', 1.5); if (G.place === 'school') radio(LESSONS[0].radio, 8); else radio('Sixty seconds. Big kickers, the drop, the wall. Impress me. You will not.', 5); } else { const n = Math.ceil(G.count); if (n !== G.lastN) { G.lastN = n; if (n <= 3) X.audio.tone(440, 0.15, 0.05, 'square', 1); } } snapP(); return; }
    if (G.phase !== 'run') { snapP(); return; }
    if (!P) snapP();
    // EASIER + SLOWER (Ben): calmer top speed on the ground, gentle coast-down
    { const cap = G.place === 'contest' ? 11 : 10; if (c.ground) c.speed = Math.min(c.speed, cap); }
    G.t += dt; if (G.place === 'school' && !G.nextT) { G.stuckT += dt; if (G.stuckT > 22) { G.stuckT = 0; radio(LESSONS[G.les].tip, 6); } }
    if (G.nextT > 0) { G.nextT -= dt; if (G.nextT <= 0) { G.nextT = 0; if (G.les + 1 < LESSONS.length) lesEnter(G.les + 1); else finish(); } }
    // walls you cannot ride up, trees, park edge
    const gh = X.groundH(c.x, c.z);
    if (gh - P.y > (P.g ? 0.45 : 0.6)) { c.x = P.x; c.z = P.z; c.y = P.y; c.ground = P.g; const was = Math.abs(c.speed); c.speed *= P.g ? -0.25 : 0; if (was > 2 || !P.g) { X.audio.burst(0.12, 700, 0.14); X.St.shake = Math.max(X.St.shake, 0.15); if (inSchool('logs') && Math.abs(c.z - P.z) < 1 && LOGS.some(l => Math.abs(c.z - l.z) < 1.2)) flash('HOP IT · TAP 3', '#ffffff', 1.2); } }
    for (const [tx, tz, tr] of TREES) { const dx = c.x - tx, dz = c.z - tz, d = Math.hypot(dx, dz); if (d < tr + 0.5 && c.y < 4) { c.x = tx + dx / (d || 1) * (tr + 0.5); c.z = tz + dz / (d || 1) * (tr + 0.5); if (Math.abs(c.speed) > 3) { c.speed *= -0.3; X.audio.burst(0.12, 500, 0.14); } } }
    if (c.x < PARK.x0 + 1 || c.x > PARK.x1 - 1 || c.z < PARK.z0 + 1 || c.z > PARK.z1 - 1) { c.x = clamp(c.x, PARK.x0 + 1, PARK.x1 - 1); c.z = clamp(c.z, PARK.z0 + 1, PARK.z1 - 1); c.speed *= -0.3; }
    const fx = Math.sin(c.yaw), fz = Math.cos(c.yaw);
    if (c.ground && Math.abs(thr) < 0.05 && !G.bail) c.speed *= Math.exp(1.2 * dt) * Math.exp(-0.3 * dt);
    // rock garden jolts
    if (c.ground && P.g && Math.abs(gh - P.y) > 0.12 && boxes.some(B => B.rock && c.x > B.x0 - 0.3 && c.x < B.x1 + 0.3 && c.z > B.z0 - 0.3 && c.z < B.z1 + 0.3)) { c.speed *= c.speed > 8 ? 0.95 : 0.82; c.bv = (c.bv || 0) - 1.5; X.St.shake = Math.max(X.St.shake, 0.12); X.audio.burst(0.05, 600, 0.08); }
    // transitions: gravity, coping launch, kicker launch, berm boost
    const s = c.ground ? surfAt(c.x, c.z) : null;
    if (s) { const dot = fx * s.nx + fz * s.nz;
      if (s.u > 0 && s.u < s.S.L) { c.speed -= 9.8 * Math.sin(Math.atan(s.tan)) * dot * dt * (s.S.kind === 'b' ? 0.3 : 1.1); if (c.speed < 0.6 && dot > 0.2 && s.S.kind === 'q') { c.yaw += Math.PI; G.spin -= 0; c.speed = 0.9; } }
      if (s.S.vert && dot > 0.35 && c.speed > 4.5 && s.u > s.S.L - Math.max(0.4, Math.abs(c.speed) * dt * 1.6) && s.u < s.S.L + 0.6) {
        const back = s.u - (s.S.L - 0.2); c.x -= s.nx * back; c.z -= s.nz * back; c.y = prof(s.S, s.S.L - 0.2)[0];
        const vy = Math.min(14, c.speed * 1.02) * Math.max(0.6, dot); A = { t: 0, vert: true, tricks: 0, spd: c.speed, nx: s.nx, nz: s.nz, dur: 2 * vy / 24, y0: c.y, peak: c.y, kick: null };
        c.ground = false; c.vy = vy; c.y += 0.05; c.airT = 0; c.speed = 0; c.yaw += Math.PI; G.vslip = -Math.PI; endWheelie(); X.audio.burst(0.12, 1300, 0.12); }
      else if (s.S.kick && dot > 0.3 && c.speed > 2 && s.u > s.S.L - Math.max(0.15, Math.abs(c.speed) * dt * 1.6)) { const ang = Math.atan(prof(s.S, s.S.L - 0.01)[1]); c.ground = false; c.vy = c.speed * Math.sin(ang) * 0.95; c.speed *= 0.6 + Math.cos(ang) * 0.4; c.y += 0.04; c.airT = 0; A = { t: 0, vert: false, tricks: 0, kick: s.S, y0: c.y, peak: c.y }; endWheelie(); X.audio.burst(0.1, 1100, 0.12); } }
    // berm assist: the bank carries you round (turns you along it, holds you below the lip)
    if (s && s.S.kind === 'b' && s.u > 0) { const tA = Math.atan2(s.nz, -s.nx), tB = tA + Math.PI, want = Math.abs(wrap(tA - c.yaw)) < Math.abs(wrap(tB - c.yaw)) ? tA : tB; if (Math.abs(c.steer) < 0.7) c.yaw += clamp(wrap(want - c.yaw), -3.2 * dt, 3.2 * dt); if (s.u > s.S.L * 0.85) { const k = s.u - s.S.L * 0.85; c.x -= s.nx * k * Math.min(1, 6 * dt); c.z -= s.nz * k * Math.min(1, 6 * dt); } }
    // berms: ride high round the bank
    { const b = s && s.S.kind === 'b' ? s.S : null; if (b && c.y > 0.3) { if (G.bermOn !== b) { G.bermOn = b; G.bermT = 0; } G.bermT += dt; c.speed = Math.min(15, c.speed + dt * 1.2); }
      else if (G.bermOn && (!s || s.S !== G.bermOn)) { const bb = G.bermOn; G.bermOn = null; if (G.bermT > 0.6) { addMove('BERM', 50); c.speed = Math.min(15, c.speed + 1.5); if (!bb.done) { bb.done = true; if (inSchool('berms')) lesCount(); } } } }
    // skinny bridge: balance assist + fall check
    { const on = Math.abs(c.x - SK.x) < 0.7 && c.z > SK.z0 - 0.5 && c.z < SK.z1 && c.y > SK.h - 0.2; if (on && c.ground) { if (Math.abs(c.steer) < 0.6) { c.x = damp(c.x, SK.x, 3, dt); const want = Math.cos(c.yaw) >= 0 ? 0 : Math.PI; c.yaw += clamp(wrap(want - c.yaw), -2 * dt, 2 * dt); } if (!G.onSkinny) { G.onSkinny = true; G.skStart = c.z; } }
      if (G.onSkinny && c.ground && c.y < 0.3 && !on) { G.onSkinny = false; if (c.z > SK.z0 && c.z < SK.z1) { wipeout('IN THE STREAM'); tp(SK.x, SK.z0 - 6, 0); G.bail = { t: 0.6 }; snapP(); return; } }
      if (G.onSkinny && c.z >= SK.z1 && c.y > SK.h - 0.3) { G.onSkinny = false; if (G.skStart < SK.z0 + 4) { addMove('SKINNY', 150); if (inSchool('skinny')) lesCount(); } } }
    // takeoff / landing
    if (P.g && !c.ground && !A) A = { t: 0, vert: false, tricks: 0, kick: null, y0: Math.max(P.y, c.y), peak: c.y, drop: P.y > 0.9 };
    if (A && !c.ground) { A.t += dt; A.peak = Math.max(A.peak, c.y);
      if (A.vert) { const p = A.t / A.dur; G.vslip = -Math.PI * (1 - sstep(0, 0.8, p)); c.pitch = 0; c.x -= A.nx * 0.6 * dt; c.z -= A.nz * 0.6 * dt; } }
    if (!P.g && c.ground && A) { const a = A; A = null;
      if (T && !T.held && T.target - T.rot < TAU * 0.3) completeTrick();
      if (T) { const tg = T.target || Math.max(TAU, Math.round(T.rot / TAU) * TAU); if (T.rot >= tg * 0.6) { T.target = tg; T.rot = tg; completeTrick(); T = null; flash('SAVED IT!', '#22c55e', 0.8); } }
      if (T || (G.b2 && !G.b2.air && c.wheelieHold)) wipeout(); else {
        const fall = a.peak - c.y;
        if (a.vert) { c.speed = a.spd * 0.95; addMove('AIR ' + Math.max(0, a.peak - a.y0).toFixed(1) + ' M', Math.round(50 + (a.peak - a.y0) * 20)); }
        else if (a.kick && a.t > 0.35) { const onTable = c.y > 0.5 || c.z > a.kick.landZ; addMove(c.z > a.kick.landZ && c.y < a.kick.H ? 'GAP AIR' : 'TABLE AIR', c.z > a.kick.landZ ? 70 : 40); if (a.tricks > 0 && JL.includes(a.kick) && inSchool('jumps')) lesCount(); }
        else if (a.drop && fall > 0.9) { addMove('DROP ' + fall.toFixed(1) + ' M', Math.round(40 + fall * 25)); if (inSchool('drops')) { const z = c.z; if ((z > -74 && z < -64 && !G.dropA) || (z > -50 && !G.dropB)) { if (z < -64) G.dropA = true; else G.dropB = true; lesCount(); } } }
        else if (a.t > 0.9) addMove('BIG AIR', 40); }
      G.vslip = 0; }
    if (c.ground && A && !A.vert) A = null;
    // log hops
    for (const L0 of LOGS) if ((P.z < L0.z && c.z >= L0.z || P.z > L0.z && c.z <= L0.z) && Math.abs(c.x) < 7 && c.y > 0.2) { addMove('LOG HOP', 40); if (!L0.done) { L0.done = true; if (inSchool('logs')) lesCount(); } }
    // tricks
    if (G.autoSpin > 0) { G.autoSpin -= dt; if (!c.ground) { G.autoSpin = 0; if (!T) { if (!A) A = { t: 0, vert: false, tricks: 0, kick: null, y0: c.y, peak: c.y }; startTrick(false); } } }
    if (G.b2 && !G.b2.air && !c.ground && !T) { G.b2.air = true; endWheelie(); startTrick(true); }
    if (T) { const rate = T.back ? TAU / 0.62 : TAU / 0.42; if (T.held || T.rot < T.target) T.rot += dt * rate; if (!T.held && T.rot >= T.target) completeTrick(); else if (T.back) { c.flipT = (T.rot / TAU) % 1; G.spin = 0; } else { c.flipT = null; G.spin = T.rot; } }
    // wheelie
    if (G.b2 && !G.b2.air && !c.wheelieHold && c.ground && G.t - G.b2.t0 >= 0.2 && Math.abs(c.speed) > 2) { c.wheelieHold = true; G.whT = 0; }
    if (c.wheelieHold) { if (!c.ground) endWheelie(); else { G.whT += dt; if (inSchool('wheelie') && G.whT >= 3 && c.x > WSTRIP.x0 - 0.6 && c.x < WSTRIP.x1 + 0.6 && c.z > WSTRIP.z0 && c.z < WSTRIP.z1 + 2) { endWheelie(); lesCount(); } } }
    // rock garden timer
    if (Math.abs(c.x - ROCKS.x) < 6.5) { if (G.rockT < 0 && P.z < ROCKS.z0 && c.z >= ROCKS.z0) G.rockT = 0; if (G.rockT >= 0) { G.rockT += dt; if (c.z >= ROCKS.z1) { const t = G.rockT; G.rockT = -1; if (t < 8) { addMove('ROCK GARDEN ' + t.toFixed(1) + ' S', 150); if (inSchool('rocks')) lesCount(); } else { flash('TOO SLOW · ' + t.toFixed(1) + ' S', '#ffffff', 1.6); if (inSchool('rocks')) radio('Eight seconds, grandpa. Go back and go faster.', 4); } } } } else G.rockT = -1;
    // wipeout wobble
    if (G.bail) { G.bail.t += dt; const t = G.bail.t; V.body.rotation.z = -Math.sin(Math.min(1, t / 0.25) * Math.PI / 2) * 1.1 * (t < 0.7 ? 1 : Math.max(0, 1 - (t - 0.7) / 0.3)); c.speed = damp(c.speed, 0, 4, dt); if (t >= 1) { G.bail = null; V.body.rotation.z = 0; } }
    G.vslip = A && A.vert ? G.vslip : damp(G.vslip || 0, 0, 6, dt); c.slip = (G.vslip || 0) + G.spin;
    const busy = !c.ground || c.wheelieHold || T; if (CB.n && !busy) { CB.idle += dt; if (CB.idle > 1.4) bank(); }
    // gates
    for (const g of GATES) if (!g.done && P.z < g.z && c.z >= g.z && Math.abs(c.x - g.x) < 2.4) { g.done = true; g.ln.material.color.setHex(0x22c55e); X.popup(tmp.set(g.x, 2.4, g.z), 'GATE', '#22c55e'); if (inSchool('gates')) lesCount(); }
    if (G.place === 'contest' && G.t >= 60) { if (!G.ending) { flash('TIME!', '#ffd23a', 2); X.audio.tone(330, 0.5, 0.06, 'square', 0.6); } G.ending += dt; if ((c.ground && !T) || G.ending > 2.5) finish(); }
    snapP(); }

  // ---------- HUD ----------
  const _pv = new THREE.Vector3();
  function hud() { const pd = PL(), live = G.phase === 'run', c = C(); let goal = null;
    if (live && !DM.on) { const n = nextGoal(); if (n) { const dd = Math.hypot(c.x - n.x, c.z - n.z); if (dd > 7) { _pv.set(n.x, 1, n.z).project(X.camera); goal = { nx: _pv.x, ny: _pv.y, behind: _pv.z > 1, label: n.label, dist: Math.round(dd) }; } } }
    const bests = PLACES.map(p => { try { return save.stat('nebo.bike.' + p.id + '.best', 0); } catch (e) { return 0; } });
    const sch = G.place === 'school', L = LESSONS[G.les], left = Math.max(0, 60 - G.t);
    let trickTxt = 'TAP 2 · 360', trickCol = '#7dd3fc';
    if (G.bail) { trickTxt = 'WIPEOUT'; trickCol = '#ec3013'; } else if (T) { const L2 = T.back ? FLIPS : SPINS, lv = Math.min(L2.length, Math.max(1, T.held ? Math.ceil(T.rot / TAU + 0.001) : Math.round(T.target / TAU))); trickTxt = (T.held ? 'LET GO · ' : '') + L2[lv - 1][0]; trickCol = '#ffd23a'; }
    else if (c.wheelieHold) { trickTxt = 'WHEELIE ' + G.whT.toFixed(1) + ' S'; trickCol = '#7dd3fc'; } else if (!c.ground) { trickTxt = 'IN THE AIR · 2 = TRICK'; trickCol = '#ffd23a'; } else if (G.rockT >= 0) { trickTxt = 'ROCKS ' + G.rockT.toFixed(1) + ' / 8 S'; trickCol = G.rockT > 6 ? '#ec3013' : '#ffd23a'; }
    return { state: G.phase === 'ready' ? 'ready' : 'run', phase: G.phase, board: G.board, done: G.done, place: G.place, placeName: pd.name, room: pd.room, target: pd.target,
      time: fmtT(sch ? G.t + G.pen : left), over: sch && G.t + G.pen > pd.target, low: !sch && left < 10, pen: G.pen, pts: Math.round(G.pts), comboN: CB.n, comboPot: CB.pot, comboK: CB.n ? Math.max(0, 1 - CB.idle / 1.4) : 0,
      progress: sch ? (G.nextT ? 'LESSON ' + (G.les + 1) + ' PASSED' : (G.les + 1) + ' · ' + L.name + ' · ' + G.cnt + ' / ' + L.need + ' ' + L.unit) : 'BEST COMBO ' + (G.bestCombo || 0) + ' · TROPHY ' + TROPHY_SCORE,
      les: sch ? G.les + (G.nextT ? 1 : 0) : 0, lesOf: LESSONS.length, banner: G.banner, radio: G.radio, radioWho: 'BART', flash: G.flash, count: G.phase === 'count' ? Math.ceil(G.count) : null, goal, bests, trickTxt, trickCol,
      bestTrick: G.bestTrick ? G.bestTrick.name : '—', quest: sch ? 'Lesson ' + (G.les + 1) + ': ' + L.quest : 'Contest: best run in 60 s · ' + TROPHY_SCORE + ' wins the trophy', wipes: G.wipes,
      demo: DM.on ? { cap: DM.cap, key: (DEMO[DM.i] || {}).key || '', n: DM.i + 1, of: DEMO.length } : null }; }

  // ---------- DEMO ----------
  const DM = { on: false, i: 0, t: 0, dt: 0, cap: '', f: {} };
  const steerTo = (tx, tz, th = 1) => { const c = C(), d = wrap(Math.atan2(tx - c.x, tz - c.z) - c.yaw); X.drive(th, clamp(-d * 2.5, -1, 1)); };
  const tap = n => { X.press(n, true); X.press(n, false); };
  const go = (les, x, z, yaw, sp) => { G.place = 'school'; G.phase = 'run'; lesEnter(les, true); tp(x, z, yaw); C().speed = sp; DM.f = {}; X.press(2, false); };
  const DEMO = [
    { d: 4.4, key: 'STICK', cap: 'STICK FORWARD TO PEDAL, STEER THROUGH THE FLAG GATES', on() { resetRun(); go(0, 0, -90, 0, 5); }, tick() { const g = GATES.find(q => !q.done) || GATES[5]; steerTo(g.x, g.z + 1.2); } },
    { d: 3.6, key: '3', cap: 'TAP 3 TO BUNNY HOP OVER LOGS', on() { go(1, 0, -54, 0, 9); }, tick() { const c = C(); steerTo(0, -10); for (const [k, z] of [['a', -47.6], ['b', -41.6], ['c', -35.6], ['d', -29.6]]) if (c.z > z && !DM.f[k] && c.ground) { DM.f[k] = 1; tap(3); } } },
    { d: 4.4, key: 'STICK', cap: 'RIDE HIGH ROUND THE BERMS: THEY THROW YOU OUT FASTER', on() { go(2, 24, -80, 0, 11); }, tick() { const c = C(); if (c.z < -64 && c.x < 30) steerTo(24.6, -62); else steerTo(36, -80); } },
    { d: 3.8, key: '!', cap: 'RIDE OFF THE DROP. LET GO OF EVERYTHING AND LAND ON BOTH WHEELS', on() { go(3, -40, -70, 0, 11); }, tick() { steerTo(-40, -40); } },
    { d: 4, key: '2', cap: 'ON THE GROUND, HOLD 2 FOR A WHEELIE', on() { go(4, -40, -40, 0, 8); X.press(2, true); }, tick() { X.drive(0.6, 0); } },
    { d: 4.2, key: '2', cap: 'HIT A KICKER AND TAP 2 IN THE AIR FOR A 360', on() { X.press(2, false); go(5, 0, -24, 0, 13); }, tick() { const c = C(); steerTo(0, 10); if (!c.ground && A && A.kick && !DM.f.a) { DM.f.a = 1; tap(2); } } },
    { d: 4.6, key: 'HOLD 2', cap: 'HOLD 2 TO KEEP SPINNING. STICK BACK = BACKFLIP. LET GO BEFORE YOU LAND', on() { go(5, 0, -4, 0, 14); }, tick() { const c = C(); if (!DM.f.a) steerTo(0, 30); if (!c.ground && A && A.kick && !DM.f.a) { DM.f.a = 1; X.drive(-1, 0); X.press(2, true); DM.f.rel = DM.t + 0.45; } if (DM.f.a && !DM.f.b && DM.t > DM.f.rel) { DM.f.b = 1; X.press(2, false); X.drive(0.5, 0); } } },
    { d: 4, key: '1', cap: 'TAP 1 TO LASER THE CREATURES IN THE WOODS. THEY THROW STUFF BACK', on() { go(7, -60, 2, 0, 6); }, tick() { X.drive(0.5, 0); if (DM.t > 0.6 && !DM.f.a) { DM.f.a = 1; tap(1); } if (DM.t > 1.6 && !DM.f.b) { DM.f.b = 1; tap(1); } if (DM.t > 2.6 && !DM.f.c) { DM.f.c = 1; tap(1); } } },
    { d: 3.4, key: 'GO', cap: 'WIPEOUT = 3 SECONDS. CHAIN TRICKS FOR COMBOS. THE CONTEST: BEST RUN IN 60 S', on() { go(5, 0, 54, 0, 4); }, tick() { X.drive(0, 0); } }];
  function demoStep(dt) { const s = DEMO[DM.i]; DM.dt = dt; DM.t += dt; if (s.tick) s.tick(dt); G.radio = ''; if (DM.t >= s.d) { DM.i++; DM.t = 0; if (DM.i >= DEMO.length) return demoStop(); const n = DEMO[DM.i]; DM.cap = n.cap; n.on && n.on(); } }
  function demoStart() { X.audio.init && X.audio.init(); DM.on = true; DM.i = 0; DM.t = 0; DM.cap = DEMO[0].cap; G.board = false; G.done = null; X.setPaused(false); DEMO[0].on(); }
  function demoStop() { DM.on = false; DM.cap = ''; X.drive(0, 0); X.press(2, false); G.b2 = null; resetRun(); G.place = 'school'; G.phase = 'ready'; tp(0, -96, 0); G.board = true; X.setPaused(true); }

  // ---------- API ----------
  const course = {
    start: { x: 0, z: -96, yaw: 0 }, stick: true, groundH, update, hud, onSmash, boardURL: '', boardURLP: '',
    press(n, down) { if (G.board || G.done || G.phase !== 'run') return true; if (G.bail) return true; if (n === 2) { trickBtn(down); return true; } return false; },
    map: () => ({ b: [['Bart', BART.x, BART.z]], l: LAMPS, t: [], e: CREAT.filter(o => !o.dead).map(o => [o.x, o.z]), q: (() => { const n = G.phase === 'run' && nextGoal(); return n ? [n.x, n.z, n.label] : null; })(), g: (() => { const n = G.phase === 'run' && nextGoal(); return n ? [n.x, n.z] : null; })() }),
    reset() { if (G.phase !== 'run' || DM.on) return; tp(...G.cp); flash('BACK TO THE START', '#ffffff', 1.2); },
    rollOut, demoStart, demoStop, finish, say: s => flash(s, '#ffffff', 2),
    openBoard() { if (DM.on) return; G.board = true; X.setPaused(true); if (G.phase === 'done') G.done = null; },
    closeBoard() { G.board = false; if (G.phase === 'run' || G.phase === 'count') X.setPaused(false); },
    preview() {},
    _les(i) { G.board = false; X.setPaused(false); G.place = 'school'; G.phase = 'run'; lesEnter(i); }, _dbg: () => ({ phase: G.phase, les: G.les, cnt: G.cnt, pts: G.pts, combo: CB.n, x: +C().x.toFixed(2), z: +C().z.toFixed(2), yaw: C().yaw, berm: G.bermOn ? BERMS.indexOf(G.bermOn) : -1, y: +C().y.toFixed(2), sp: +C().speed.toFixed(2), ground: C().ground, vert: !!(A && A.vert), trick: T ? +T.rot.toFixed(2) : null, pen: G.pen, kos: G.kos }) };
  X.setPaused(true);
  setTimeout(paintBoards, 30); setTimeout(() => document.fonts && document.fonts.load('700 50px "Caveat"').then(() => paintBoards()).catch(() => {}), 1500);
  return course;
}
