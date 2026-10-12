// 8 GATES — LUXOR · MOTO [luxorMotoSchool] + [luxorVolcanoRun] + [luxorCinderPit]. Night street circuit + the volcano, on the shared driving engine (vehicle-lab.js, opts.course, lock 'moto').
// One scene, two maps laid out the way Luxor is: the CITY (Town Square + its clockwise BIKE TRACK + four avenues) at ANCHOR.city, the VOLCANO PLAINS 560 m south at ANCHOR.volcano
// (the volcano is visible from the city). Interiors-style: you move between the maps with a fade (teleport), like every other world.
// MOTO SCHOOL (city, coach BIG PAPPA): 1 gates · 2 drift the ring · 3 whoops · 4 big double · 5 backflip · 6 scatter gun (Furnace Chargers + Ventmaws beside the West Avenue) · 7 berms · 8 nitro straight · 9 mud pit.
// VOLCANO RUN (3 laps round the cone, two lava jumps, a lava bridge) vs CINDER (big rival), WICK and SABE. Win it = the CINDER CUP (flag motoCup + item cinderCup, for Home).
// CINDER PIT (trick contest, 60 s): kickers over a lava pool, a drop deck and a wall.
// Buttons: 1 SCATTER GUN (engine) · 2 NITRO on the ground (engine) / SPIN in the air (tap 360, hold = keep spinning) · 3 HOP on the ground (engine) / BACKFLIP in the air (hold = keep flipping). Let go before you land.
// Crash = lose 3 seconds and the combo, keep riding (lava too: you are put back on the track).
// MERGE INTO LUXOR: everything is placed from ANCHOR + local coords. The placeholder city blocks (makeMotoRun({ placeholders:false })) are only massing; the real Luxor buildings replace them.
// Keep the avenues 18 m wide and the square ring clear and the lessons keep working.
import { save } from '../../engine/save.js';
import { creatureKit } from '../../engine/creature-kit.js';

export const LUXOR_MOTO = { name: 'LUXOR MOTO', rooms: { school: 'luxorTownSquare', race: 'luxorVolcanoPlains', contest: 'luxorVolcanoPlains' }, anchors: { city: { x: 0, z: 0 }, volcano: { x: 0, z: -560 } }, page: 'Luxor Moto.dc.html' };
export const TROPHY_SCORE = 2500;
export const PLACES = [
  { id: 'school', name: 'MOTO SCHOOL', room: 'luxorTownSquare', map: 'city', built: true, target: 420, goal: '9 lessons with BIG PAPPA', line: 'BIG PAPPA runs you round Luxor at night: gates, drifting the square, whoops, the big double, backflips, the scatter gun, berms, the nitro straight and the mud pit.' },
  { id: 'race', name: 'VOLCANO RUN', room: 'luxorVolcanoPlains', map: 'volcano', built: true, target: 3, goal: '3 laps vs CINDER, WICK, SABE', line: 'Three laps round the volcano, two lava jumps. Beat CINDER and the Run bikers to take the CINDER CUP home.' },
  { id: 'contest', name: 'CINDER PIT', room: 'luxorVolcanoPlains', map: 'volcano', built: true, target: 60, goal: 'Best trick run in 60 s', line: 'Sixty seconds in the Cinder Pit: kickers over a lava pool, the drop deck and the wall. Chain spins and flips. ' + TROPHY_SCORE + ' is a champion score.' }];
const LESSONS = [
  { id: 'gates', name: 'THROTTLE + STEER', need: 6, unit: 'GATES', start: [0, 36, 0], quest: 'Ride through the 6 cone gates', radio: 'Throttle is the stick. Steer through my cones, all six. Don\'t make me watch you crash.', tip: 'Ease off before each gate, then open her up.' },
  { id: 'drift', name: 'DRIFT THE RING', need: 2, unit: 'DRIFTS', start: [10, -26, -Math.PI / 2], quest: 'Two drift boosts on the square ring', radio: 'The bike track round the square. Fast, full lock, keep the throttle on: she slides. Hold it and she boosts you. Twice.', tip: 'Over 45 km/h, stick hard left or right AND forward, hold it most of a second.' },
  { id: 'whoops', name: 'WHOOPS', need: 1, unit: 'RUN', start: [34, 0, Math.PI / 2], quest: 'Out of the whoops above 45 km/h', radio: 'Whoops. Bumps in a row. Stay on the gas and skim them. Come out over forty-five.', tip: 'Full throttle into the bumps and do not let go.' },
  { id: 'double', name: 'THE BIG DOUBLE', need: 1, unit: 'JUMP', start: [72, 0, Math.PI / 2], quest: 'Clear the big double', radio: 'The big double. Short is a crash. Full speed, hit 2 for nitro on the run-up if you need it.', tip: 'Nitro (2) on the run-up, hold the stick forward, land past the gap.' },
  { id: 'flip', name: 'BACKFLIP', need: 2, unit: 'FLIPS', start: [118, 0, Math.PI / 2], quest: 'Land 2 backflips', radio: 'In the air, tap 3 and she goes over backwards. Let go and she finishes. Land two. Wheels down, kid.', tip: 'Tap 3 right after the lip. Hold 3 = more flips, but let go in time.' },
  { id: 'gun', name: 'SCATTER GUN', need: 6, unit: 'BOTS', start: [-36, 0, -Math.PI / 2], quest: 'Scatter 6 bots beside the West Avenue', radio: 'Furnace Chargers and Ventmaws in the lots off the avenue. Tap 1, the scatter gun finds the nearest. Six. Keep moving.', tip: 'Ride near the edge of the avenue and tap 1 at anything in front of you. Hold 1 on desktop for a full blast.' },
  { id: 'berms', name: 'BERMS', need: 3, unit: 'BERMS', start: [26, -90, Math.PI], quest: 'Ride high round the 3 berms', radio: 'Berms. Ride the bank, not the inside. Three. The bank carries you if you trust it.', tip: 'Stay on the throttle into the bank and let it turn you.' },
  { id: 'nitro', name: 'NITRO STRAIGHT', need: 1, unit: 'TRAP', start: [0, 104, 0], quest: 'Over 100 km/h in the speed trap', radio: 'The North Avenue straight. Hit 2 for nitro and go through my speed trap over a hundred.', tip: 'Full throttle first, nitro (2) halfway down, stay straight.' },
  { id: 'mud', name: 'MUD PIT', need: 1, unit: 'RUN', start: [0, -36, Math.PI], quest: 'Through the mud without stopping', radio: 'Mud. Let off and she sinks. Keep the throttle pinned all the way through.', tip: 'Do not let go of the stick in the mud. Not once.' }];
const SPINS = [['360', 120], ['720', 260], ['1080', 450], ['1440', 700], ['THE 8 GATES', 1000]], FLIPS = [['BACKFLIP', 200], ['DOUBLE BACKFLIP', 500], ['TRIPLE BACKFLIP', 900]];
const PASS = ['Hm. Fine.', 'That is a drift. About time.', 'You skimmed them. Good.', 'Cleared it. Breathe.', 'Two flips. My knees hurt watching.', 'Scrap metal. Good shooting.', 'Better on the banks than I thought.', 'A hundred. Now you are riding.', 'Through the mud. You are done here, kid. Go race.'];
const CRASHES = ['Wheels DOWN, kid!', 'Let go of the button before you land.', 'Get up. The volcano does not wait.', 'I crashed more than you. Once.'];
const TAU = Math.PI * 2;
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

export function makeMotoRun(cfg = {}) { return X => motoRun(X, cfg); }
export function motoRun(X, cfg = {}) {
  const { THREE, scene, M, toon, rr, clamp, damp } = X;
  const tmp = new THREE.Vector3(), V2 = (x, y) => new THREE.Vector2(x, y), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const ink = toon('#201e1d'), red = toon('#ec3013'), white = toon('#f3f2f2'), gold = toon('#e6b45a'), iron = toon('#3a3836'), steel = toon('#8a8f96'), basalt = toon('#2e2826');
  const AC = { ...LUXOR_MOTO.anchors.city, ...(cfg.city || {}) }, AV = { ...LUXOR_MOTO.anchors.volcano, ...(cfg.volcano || {}) }, touch = X.touch, ck = creatureKit({ THREE, toon, M }), PH = cfg.placeholders !== false;
  const cx = x => AC.x + x, cz = z => AC.z + z, vx = x => AV.x + x, vz = z => AV.z + z;
  X.camera.far = 1100; X.camera.updateProjectionMatrix(); let BRIDGE = null;

  // ---------- perpetual ember-lit night ----------
  scene.background = CT(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0d0b1c'); gr.addColorStop(0.5, '#2a1230'); gr.addColorStop(0.8, '#6a1f22'); gr.addColorStop(1, '#b0401e'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(0x2a1418, 120, 900);
  scene.traverse(o => { if (o.isHemisphereLight) { o.color.set('#b8a4d8'); o.groundColor.set('#5a2a1e'); o.intensity = 0.95; } });
  X.sun.color.set('#ff9a6a'); X.sun.intensity = 1.35;
  const speck = (g, w, h, n, cols) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3); } };
  const ashT = CT(512, 512, (g, w, h) => { g.fillStyle = '#3a2b28'; g.fillRect(0, 0, w, h); speck(g, w, h, 4500, ['rgba(20,14,12,0.4)', 'rgba(110,70,55,0.3)', 'rgba(200,90,40,0.12)']); }); ashT.wrapS = ashT.wrapT = THREE.RepeatWrapping; ashT.repeat.set(90, 90);
  { const gr = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshToonMaterial({ map: ashT, gradientMap: X.grad })); gr.rotation.x = -Math.PI / 2; gr.position.set(AC.x, 0, (AC.z + AV.z) / 2); gr.receiveShadow = true; scene.add(gr); }
  const cobT = CT(256, 256, (g, w, h) => { g.fillStyle = '#7a2e22'; g.fillRect(0, 0, w, h); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = ['#8e3626', '#6e2a1f', '#9a4030', '#7d3022'][(x * 3 + y * 5) % 4]; g.fillRect(x * 32 + (y % 2) * 16 + 2, y * 32 + 2, 28, 28); } }); cobT.wrapS = cobT.wrapT = THREE.RepeatWrapping;
  const asphT = CT(256, 256, (g, w, h) => { g.fillStyle = '#2b2a2e'; g.fillRect(0, 0, w, h); speck(g, w, h, 2400, ['rgba(0,0,0,0.35)', 'rgba(120,115,120,0.25)']); }); asphT.wrapS = asphT.wrapT = THREE.RepeatWrapping;
  function slab(tex, x, z, w, d, rep, y = 0.012) { const t = tex.clone(); t.needsUpdate = true; t.repeat.set(w / rep, d / rep); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshToonMaterial({ map: t, gradientMap: X.grad })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; scene.add(m); return m; }
  const plankT = CT(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#5a4a42', '#4e4038', '#64534a', '#483a33'][i % 4]; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, i * 32, w, 2); g.fillStyle = '#9aa0a8'; g.fillRect(10, i * 32 + 14, 4, 4); g.fillRect(w - 14, i * 32 + 14, 4, 4); } }); plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping; plankT.repeat.set(0.35, 0.35);
  const rampM = new THREE.MeshToonMaterial({ map: plankT, gradientMap: X.grad }), rampBox = toon('#4e4038');
  const glowMat = (c, o = 0.85) => new THREE.SpriteMaterial({ map: X.glowTex, color: c, transparent: true, depthWrite: false, opacity: o, blending: THREE.AdditiveBlending });

  // ---------- terrain shapes ----------
  const shapes = [], boxes = [], fields = [];
  const prof = (S, u) => { if (u < 0) return null; if (u < S.L) { const q = Math.sqrt(S.R * S.R - u * u); return [S.R - q, u / Math.max(q, 0.05)]; } if (u <= S.L + S.deck) return [S.H, 0]; return null; };
  function quarter(S) { S.kind = 'q'; S.L = Math.sqrt(S.R * S.R - (S.R - S.H) ** 2); S.nx = Math.sin(S.phi); S.nz = Math.cos(S.phi); shapes.push(S);
    const pts = [V2(0, 0)]; for (let i = 1; i <= 14; i++) { const u = S.L * i / 14; pts.push(V2(u, S.R - Math.sqrt(S.R * S.R - u * u))); } if (S.deck > 0) pts.push(V2(S.L + S.deck, S.H)); pts.push(V2(S.L + S.deck, 0));
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: S.len, bevelEnabled: false, curveSegments: 1 }); geo.translate(0, 0, -S.len / 2);
    const g = new THREE.Group(); g.position.set(S.o.x, 0, S.o.z); g.rotation.y = S.phi - Math.PI / 2; scene.add(g); M(geo, rampM, 0, 0, 0, g, 0.03);
    if (S.vert) { const cp = M(new THREE.CylinderGeometry(0.08, 0.08, S.len, 8), steel, S.L, S.H, 0, g, 0.012); cp.rotation.x = Math.PI / 2; } else M(new THREE.BoxGeometry(0.14, 0.05, S.len + 0.02), red, S.L - 0.07, S.H + 0.015, 0, g, 0);
    return S; }
  function berm(S) { S.kind = 'b'; S.L = Math.sqrt(S.R * S.R - (S.R - S.H) ** 2); shapes.push(S); const ro = S.r0 + S.L + S.deck, NA = 30, prf = [[S.r0 - 0.3, 0]];
    for (let i = 0; i <= 10; i++) { const u = S.L * i / 10; prf.push([S.r0 + u, S.R - Math.sqrt(S.R * S.R - u * u)]); } prf.push([ro, S.H]); prf.push([ro, 0]);
    const pos = [], idx = [], uv = [], np = prf.length; for (let i = 0; i <= NA; i++) { const a = S.ac - S.hw + 2 * S.hw * i / NA, tp = sstep(0, 0.5, S.hw - Math.abs(a - S.ac)); prf.forEach(([r, h], j) => { pos.push(S.cx + Math.sin(a) * r, h * tp + 0.01, S.cz + Math.cos(a) * r); uv.push(i * 0.4, j * 0.3); }); }
    for (let i = 0; i < NA; i++) for (let j = 0; j < np - 1; j++) { const a = i * np + j, b = a + np; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const t = asphT.clone(); t.needsUpdate = true; const m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ map: t, gradientMap: X.grad, side: THREE.DoubleSide })); m.receiveShadow = true; scene.add(m); return S; }
  function surfAt(x, z) { let best = null;
    for (const S of shapes) { let u, nx, nz, tp = 1;
      if (S.kind === 'q') { const dx = x - S.o.x, dz = z - S.o.z; u = dx * S.nx + dz * S.nz; const v = dx * S.nz - dz * S.nx; if (Math.abs(v) > S.len / 2) continue; nx = S.nx; nz = S.nz; }
      else { const dx = x - S.cx, dz = z - S.cz, r = Math.hypot(dx, dz) || 1e-3, a = Math.atan2(dx, dz), d = Math.abs(wrap(a - S.ac)); if (d > S.hw) continue; tp = sstep(0, 0.5, S.hw - d); u = r - S.r0; nx = dx / r; nz = dz / r; }
      const p = prof(S, u); if (!p) continue; const h = p[0] * tp; if (!best || h > best.h) best = { S, u, h, tan: p[1] * tp, nx, nz }; }
    return best; }
  function addBox(x0, x1, z0, z1, h, mat = rampBox, vis = true) { const B = { x0, x1, z0, z1, h }; boxes.push(B); if (vis) M(new THREE.BoxGeometry(x1 - x0, h, z1 - z0), mat, (x0 + x1) / 2, h / 2, (z0 + z1) / 2, null, 0.02); return B; }
  function groundH(x, z, h0) { let h = h0; const s = surfAt(x, z); if (s && s.h > h) h = s.h; for (const B of boxes) if (x > B.x0 && x < B.x1 && z > B.z0 && z < B.z1 && B.h > h) h = B.h; for (const f of fields) { const v = f(x, z); if (v > h) h = v; } return h; }
  // kicker + gap + landing ramp, laid along a heading
  function jump(x, z, yaw, w, R, H, gap, land) { const fx = Math.sin(yaw), fz = Math.cos(yaw), k = quarter({ o: { x, z }, phi: yaw, len: w, R, H, deck: 0, kick: true });
    const top = k.L + gap, lo = top + land; X.addRamp({ x: x + fx * lo, z: z + fz * lo, yaw: yaw + Math.PI, w, l: land, h: H, top: 0 }, '#4e4038');
    k.gapA = k.L; k.gapB = top; k.fx = fx; k.fz = fz; return k; }

  // ================= THE CITY (Town Square + avenues) =================
  slab(cobT, cx(0), cz(0), 70, 70, 4); for (const [x, z, w, d] of [[0, 117, 18, 170], [0, -117, 18, 170], [117, 0, 170, 18], [-117, 0, 170, 18]]) slab(asphT, cx(x), cz(z), w, d, 6, 0.013);
  // the clockwise BIKE TRACK ringing the square: a red/white kerbed lane
  const kerbT = CT(128, 32, g => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#f3f2f2' : '#ec3013'; g.fillRect(i * 32, 0, 32, 32); } }); kerbT.wrapS = THREE.RepeatWrapping;
  for (const [x, z, w, d] of [[0, 26, 62, 10], [0, -26, 62, 10], [26, 0, 10, 42], [-26, 0, 10, 42]]) { slab(asphT, cx(x), cz(z), w, d, 6, 0.016); }
  for (const s of [-1, 1]) for (const [w, d, x, z] of [[62, 0.5, 0, 31], [62, 0.5, 0, 21], [0.5, 42, 31, 0], [0.5, 42, 21, 0]].map(([w, d, x, z]) => w > d ? [w, d, x, z * s] : [w, d, x * s, z])) { const t = kerbT.clone(); t.needsUpdate = true; t.repeat.set(Math.max(w, d) / 2, 1); const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(w, d), 0.5), new THREE.MeshBasicMaterial({ map: t })); m.rotation.set(-Math.PI / 2, 0, w > d ? 0 : Math.PI / 2); m.position.set(cx(x), 0.02, cz(z)); scene.add(m); }
  { const lineM = new THREE.MeshBasicMaterial({ color: 0xffd23a }); for (const [x, z, w, d] of [[9.4, 117, 0.35, 164], [-9.4, 117, 0.35, 164], [9.4, -117, 0.35, 164], [-9.4, -117, 0.35, 164], [117, 9.4, 164, 0.35], [117, -9.4, 164, 0.35], [-117, 9.4, 164, 0.35], [-117, -9.4, 164, 0.35]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lineM); m.rotation.x = -Math.PI / 2; m.position.set(cx(x), 0.03, cz(z)); scene.add(m); }
    { const segs = []; for (let t = 37; t <= 198; t += 6) for (const dir of [-1, 1]) { segs.push([0, dir * t, 0]); segs.push([dir * t, 0, 1]); }
      const dm = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.45, 3), new THREE.MeshBasicMaterial({ color: 0xffffff }), segs.length), o2 = new THREE.Object3D();
      segs.forEach(([x, z, horiz], i) => { o2.position.set(cx(x), 0.032, cz(z)); o2.rotation.set(-Math.PI / 2, 0, horiz ? Math.PI / 2 : 0); o2.updateMatrix(); dm.setMatrixAt(i, o2.matrix); }); scene.add(dm); }
    const pts = []; for (let t = 40; t <= 196; t += 13) for (const sg of [-1, 1]) for (const ax of [0, 1]) for (const dir of [-1, 1]) pts.push(ax ? [dir * t, sg * 10.8] : [sg * 10.8, dir * t]);
    const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 4.2, 6), toon('#2e2826'), pts.length), head = new THREE.InstancedMesh(new THREE.BoxGeometry(0.6, 0.45, 0.6), new THREE.MeshBasicMaterial({ color: 0xffc04a }), pts.length), o = new THREE.Object3D();
    pts.forEach(([x, z], i) => { o.position.set(cx(x), 2.1, cz(z)); o.updateMatrix(); pole.setMatrixAt(i, o.matrix); o.position.y = 4.4; o.updateMatrix(); head.setMatrixAt(i, o.matrix); }); scene.add(pole, head); }
  // centre: IRON TRANSPORT PAD + CINDER CUP stand
  { const pad = M(new THREE.CylinderGeometry(7, 7.4, 0.3, 32), iron, cx(0), 0.15, cz(0), null, 0.03, 7); const ring = new THREE.Mesh(new THREE.RingGeometry(5.6, 6.2, 40), new THREE.MeshBasicMaterial({ color: 0xff6a1a })); ring.rotation.x = -Math.PI / 2; ring.position.set(cx(0), 0.32, cz(0)); scene.add(ring); pad.userData.ring = ring;
    M(new THREE.BoxGeometry(1.4, 1.6, 1.4), basalt, cx(10), 0.8, cz(10), null, 0.02); M(new THREE.CylinderGeometry(0.3, 0.45, 0.9, 12), gold, cx(10), 2.05, cz(10), null, 0.015); M(new THREE.TorusGeometry(0.42, 0.07, 6, 16), gold, cx(10), 2.4, cz(10), null, 0);
    boxes.push({ x0: cx(-7), x1: cx(7), z0: cz(-7), z1: cz(7), h: 0.3 }); }
  const BLOCKS = [];
  function block(x, z, w, d, h, sign, col = '#4a2a26', pyramid = false) { if (!PH) return; const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); BLOCKS.push(g); M(new THREE.BoxGeometry(w, h, d), toon(col), 0, h / 2, 0, g, 0.03);
    const wt = CT(128, 256, (c, W, Hh) => { c.fillStyle = '#1a0f10'; c.fillRect(0, 0, W, Hh); for (let y = 8; y < Hh - 8; y += 22) for (let xx = 8; xx < W - 8; xx += 20) { c.fillStyle = Math.random() < 0.45 ? ['#ffb35a', '#ff8a3a', '#ffd88a'][Math.floor(Math.random() * 3)] : '#2a1a1a'; c.fillRect(xx, y, 12, 14); } }); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(Math.max(1, w / 8), Math.max(1, h / 14));
    for (const [px, pz, ry, ww] of [[0, d / 2 + 0.02, 0, w], [0, -d / 2 - 0.02, Math.PI, w], [w / 2 + 0.02, 0, Math.PI / 2, d], [-w / 2 - 0.02, 0, -Math.PI / 2, d]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(ww * 0.9, h * 0.85), new THREE.MeshBasicMaterial({ map: wt })); p.position.set(px, h * 0.5, pz); p.rotation.y = ry; g.add(p); }
    if (pyramid) M(new THREE.ConeGeometry(Math.max(w, d) * 0.72, h * 0.6, 4), toon('#5a2a22'), 0, h + h * 0.3, 0, g, 0.03).rotation.y = Math.PI / 4;
    else for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.6, 1.6, 0.6), iron, sx * (w / 2 - 0.4), h + 0.8, d / 2 - 0.4, g, 0.01);
    if (sign) { const cols = ['#ff2d55', '#38bdf8', '#ffd23a', '#a3e635', '#f472b6']; const col = cols[sign.length % cols.length]; const t = CT(512, 128, (c, W, Hh) => { c.clearRect(0, 0, W, Hh); c.font = '900 84px Archivo, sans-serif'; c.textBaseline = 'middle'; c.textAlign = 'center'; c.shadowColor = col; c.shadowBlur = 24; c.strokeStyle = col; c.lineWidth = 8; c.strokeText(sign, W / 2, Hh / 2 + 4); c.fillStyle = '#fff'; c.fillText(sign, W / 2, Hh / 2 + 4); });
      const facing = Math.atan2(-x + AC.x, -z + AC.z), sw = Math.min(w, 12); const s = new THREE.Mesh(new THREE.PlaneGeometry(sw, sw / 4), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false })); const nx = Math.sin(facing), nz = Math.cos(facing), hx = Math.abs(nx) > Math.abs(nz) ? Math.sign(nx) * (w / 2 + 0.1) : 0, hz = Math.abs(nz) >= Math.abs(nx) ? Math.sign(nz) * (d / 2 + 0.1) : 0; s.position.set(hx, h * 0.72, hz); s.rotation.y = Math.atan2(hx, hz); g.add(s); const gs = new THREE.Sprite(glowMat(new THREE.Color(col).getHex(), 0.35)); gs.position.set(hx * 1.05, h * 0.72, hz * 1.05); gs.scale.set(sw * 1.4, sw * 0.6, 1); g.add(gs); } }
  // the square's shops (brief: Tavern, Deli, Bike Shop, Item Shop, Armory) and the avenues' blocks
  [[-40, 44, 'TAVERN'], [40, 44, 'DELI'], [-40, -44, 'BIKES'], [40, -44, 'ITEMS'], [-44, 18, 'ARMORY']].forEach(([x, z, s]) => block(cx(x), cz(z), 14, 14, 12, s, '#5a2e28'));
  { const signs = ['PIT', 'CINDER', 'RUN', 'LUXOR', 'GYM', 'ZOO', 'FORGE', 'L', 'EMBER', 'BOX']; let k = 0; for (const s of [-1, 1]) for (let d = 62; d <= 200; d += 18) { const h = rr(9, 22), py = Math.random() < 0.25; block(cx(s * 20), cz(d), 14, 14, h, Math.random() < 0.5 ? signs[k++ % signs.length] : '', '#4a2a26', py); if (!(s > 0 && d > 72 && d < 176)) block(cx(s * 20), cz(-d), 14, 14, h * rr(0.8, 1.1), Math.random() < 0.4 ? signs[k++ % signs.length] : '', '#4a2a26', py); if (d > 150 || d < 120 || s < 0) block(cx(d), cz(s * 20), 14, 14, rr(9, 20), Math.random() < 0.5 ? signs[k++ % signs.length] : '', '#4a2a26', Math.random() < 0.25); block(cx(-d), cz(s * 30), 12, 12, rr(9, 20), '', '#4a2a26', Math.random() < 0.3); } }
  // city walls (the map edge) + street lamps on every avenue
  const LAMPS = [];
  function lamp(x, z, sx = 1, col = 0xffb35a) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); M(new THREE.CylinderGeometry(0.1, 0.13, 5.2, 6), iron, 0, 2.6, 0, g, 0); M(new THREE.BoxGeometry(0.9, 0.2, 0.4), iron, -sx * 0.4, 5.2, 0, g, 0); const s = new THREE.Sprite(glowMat(col)); s.position.set(-sx * 0.6, 5.0, 0); s.scale.setScalar(3.2); g.add(s); LAMPS.push([x, z]); }
  for (let d = 40; d <= 196; d += 16) { lamp(cx(-10.5), cz(d), -1); lamp(cx(10.5), cz(d), 1); lamp(cx(-10.5), cz(-d), -1); lamp(cx(10.5), cz(-d), 1); lamp(cx(d), cz(-10.5), 1); lamp(cx(d), cz(10.5), -1); lamp(cx(-d), cz(-10.5), 1); lamp(cx(-d), cz(10.5), -1); }
  for (const [x, z] of [[-33, -33], [33, -33], [-33, 33], [33, 33], [-33, 0], [33, 0], [0, 33], [0, -33]]) lamp(cx(x), cz(z), 1, 0xff6a3a);
  const CITYB = { x0: cx(-205), x1: cx(205), z0: cz(-205), z1: cz(205) };
  const SOLIDS = [];   // [x0,x1,z0,z1] blocks you bounce off
  BLOCKS.forEach(g => { const p = g.position; const w = g.children[0].geometry.parameters; SOLIDS.push([p.x - w.width / 2, p.x + w.width / 2, p.z - w.depth / 2, p.z + w.depth / 2]); });
  const roadOK = (x, z) => { const lx = x - AC.x, lz = z - AC.z; return (Math.abs(lx) < 35 && Math.abs(lz) < 35) || (Math.abs(lx) < 10.5 && Math.abs(lz) < 205) || (Math.abs(lz) < 10.5 && Math.abs(lx) < 205); };
  const offTrack = (x, z) => { const th = Math.atan2(x - AV.x, z - AV.z); return Math.abs(Math.hypot(x - AV.x, z - AV.z) - TR(th)) > TW / 2 + 1.5; };
  // L1 cones
  const GATES = [], coneGeo = new THREE.ConeGeometry(0.34, 0.9, 12), coneM = toon('#ff7a1a');
  for (let k = 0; k < 6; k++) { const gx = cx(k % 2 ? 4 : -4), gz = cz(46 + k * 9), G0 = { x: gx, z: gz, done: false }; for (const sx of [-2.4, 2.4]) { M(coneGeo, coneM, gx + sx, 0.45, gz, null, 0.015); M(new THREE.CylinderGeometry(0.21, 0.26, 0.14, 12), white, gx + sx, 0.5, gz, null, 0); }
    const ln = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 0.18), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.85 })); ln.rotation.x = -Math.PI / 2; ln.position.set(gx, 0.03, gz); scene.add(ln); G0.ln = ln; GATES.push(G0); }
  // L3 whoops (East Avenue)
  const WH = { x0: cx(44), x1: cx(76), z0: cz(-8), z1: cz(8) }; fields.push((x, z) => x > WH.x0 && x < WH.x1 && z > WH.z0 && z < WH.z1 ? 0.55 * Math.sin(Math.PI * (x - WH.x0) / 3.2) ** 2 : 0);
  for (let x = WH.x0 + 1.6; x < WH.x1; x += 3.2) { const m = M(new THREE.CylinderGeometry(0.9, 0.9, 16, 14, 1, false, 0, Math.PI), toon('#4a3a33'), x, -0.35, cz(0), null, 0.02); m.rotation.set(Math.PI / 2, 0, Math.PI / 2); m.scale.set(1, 1, 1); }
  // L4 the big double, L5 the backflip kicker (East Avenue)
  const DBL = jump(cx(88), cz(0), Math.PI / 2, 14, 7, 1.8, 11, 10), FLK = jump(cx(140), cz(0), Math.PI / 2, 14, 7, 1.8, 6, 12);
  // L6 bots in the lots off the West Avenue
  const CREAT = [], proj = [];
  const KIND = { charger: { name: 'FURNACE CHARGER', hp: 40, r: 1.8, h: 3, pts: 70 }, vent: { name: 'VENTMAW', hp: 30, r: 1.4, h: 2.2, pts: 70 } };
  function spawnC(kind, x, z, side) { const D = KIND[kind]; const g = ck.build(kind === 'charger' ? 'Furnace Charger' : 'Ventmaw') || new THREE.Group(); g.scale.multiplyScalar(kind === 'charger' ? 1.6 : 1.5); ck.enter(g, 'idle'); g.position.set(x, 0, z); scene.add(g);
    const o = { kind, custom: true, noRespawn: true, g, sq: g, x, z, hx: x, hz: z, side, r: D.r, h: D.h, hp: D.hp, max: D.hp, D, st: 'idle', t: 0, cd: rr(1.5, 3), face: 0, back: 0 }; o.onHit = () => { o.flash = 0.15; }; X.props.push(o); CREAT.push(o); return o; }
  [['charger', -56, 13.5, 1], ['vent', -74, -13.5, -1], ['charger', -92, -13.5, -1], ['vent', -110, 13.5, 1], ['charger', -128, 13.5, 1], ['vent', -146, -13.5, -1], ['vent', -160, 13.5, 1]].forEach(([k, x, z, s]) => spawnC(k, cx(x), cz(z), s));
  for (const s of [-1, 1]) slab(asphT, cx(-101), cz(s * 18), 138, 14, 6, 0.011);
  // L7 berms (lot south-east of the square)
  slab(asphT, cx(48), cz(-124), 64, 84, 6, 0.011);
  const BERMS = [berm({ cx: cx(33.5), cz: cz(-150), ac: Math.PI, hw: Math.PI / 2 + 0.25, r0: 5.6, R: 4.4, H: 1.8, deck: 0.8 }), berm({ cx: cx(48.5), cz: cz(-90), ac: 0, hw: Math.PI / 2 + 0.25, r0: 5.6, R: 4.4, H: 1.8, deck: 0.8 }), berm({ cx: cx(63.5), cz: cz(-150), ac: Math.PI, hw: Math.PI / 2 + 0.25, r0: 5.6, R: 4.4, H: 1.8, deck: 0.8 })];
  // L8 speed trap (North Avenue), L9 mud pit (South Avenue)
  const TRAP = { z0: cz(170), z1: cz(180) }; for (const z of [TRAP.z0, TRAP.z1]) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(18, 0.4), new THREE.MeshBasicMaterial({ color: 0x38bdf8 })); ln.rotation.x = -Math.PI / 2; ln.position.set(cx(0), 0.03, z); scene.add(ln); } for (const sx of [-9.5, 9.5]) { M(new THREE.BoxGeometry(0.4, 5, 0.4), iron, cx(sx), 2.5, TRAP.z0, null, 0.01); M(new THREE.BoxGeometry(0.4, 5, 0.4), iron, cx(sx), 2.5, TRAP.z1, null, 0.01); }
  M(new THREE.BoxGeometry(19.4, 0.5, 10.4), iron, cx(0), 5.2, (TRAP.z0 + TRAP.z1) / 2, null, 0.02);
  const MUD = { x0: cx(-9), x1: cx(9), z0: cz(-78), z1: cz(-46) }; { const mt = CT(256, 256, (g, w, h) => { g.fillStyle = '#3b2a1c'; g.fillRect(0, 0, w, h); speck(g, w, h, 1500, ['rgba(20,12,6,0.5)', 'rgba(110,80,50,0.35)']); for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(140,110,80,0.18)'; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 30, 6 + Math.random() * 14, Math.random() * 3, 0, 7); g.fill(); } }); mt.wrapS = mt.wrapT = THREE.RepeatWrapping; mt.repeat.set(3, 5); const m = new THREE.Mesh(new THREE.PlaneGeometry(18, 32), new THREE.MeshToonMaterial({ map: mt, gradientMap: X.grad })); m.rotation.x = -Math.PI / 2; m.position.set(cx(0), 0.025, (MUD.z0 + MUD.z1) / 2); scene.add(m); }
  // painted lesson numbers
  function label(n, s, x, z, yaw) { const t = CT(1024, 256, (g) => { g.fillStyle = '#ec3013'; g.fillRect(0, 30, 200, 196); g.fillStyle = '#f3f2f2'; g.font = '900 170px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(n, 50, 136); g.font = '900 112px Archivo, sans-serif'; g.fillText(s, 236, 136); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); m.rotation.set(-Math.PI / 2, 0, Math.PI + yaw); m.position.set(x, 0.035, z); scene.add(m); }
  LESSONS.forEach((L, i) => { const [x, z, yaw] = L.start; label(String(i + 1), L.name.split(' ')[0], cx(x) + Math.sin(yaw) * 5, cz(z) + Math.cos(yaw) * 5, yaw); });

  // ================= THE VOLCANO PLAINS =================
  const VR = 112, VH = 92; // cone
  { const coneT = CT(256, 512, (g, w, h) => { g.fillStyle = '#2a201e'; g.fillRect(0, 0, w, h); speck(g, w, h, 3000, ['rgba(0,0,0,0.4)', 'rgba(90,60,50,0.3)']); for (let i = 0; i < 6; i++) { const x = Math.random() * w; g.strokeStyle = 'rgba(255,110,30,0.9)'; g.lineWidth = 3 + Math.random() * 4; g.beginPath(); g.moveTo(x, 0); for (let y = 0; y < h * 0.7; y += 20) g.lineTo(x + Math.sin(y * 0.05 + i) * 10, y); g.stroke(); } }); coneT.wrapS = THREE.RepeatWrapping; coneT.repeat.set(4, 1);
    M(new THREE.CylinderGeometry(20, VR, VH, 28, 1, true), new THREE.MeshToonMaterial({ map: coneT, gradientMap: X.grad, side: THREE.DoubleSide }), vx(0), VH / 2, vz(0), null, 0);
    const lp = new THREE.Mesh(new THREE.CircleGeometry(19, 28), new THREE.MeshBasicMaterial({ color: 0xff6a1a, fog: false })); lp.rotation.x = -Math.PI / 2; lp.position.set(vx(0), VH - 4, vz(0)); scene.add(lp);
    const gl = new THREE.Sprite(glowMat(0xff5a1a, 0.9)); gl.material.fog = false; gl.position.set(vx(0), VH + 6, vz(0)); gl.scale.setScalar(110); scene.add(gl); }
  const SMOKE = []; for (let i = 0; i < (touch ? 10 : 18); i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: X.glowTex, color: 0x3a2a2a, transparent: true, depthWrite: false, opacity: 0.5 })); s.scale.setScalar(30); scene.add(s); SMOKE.push({ s, t: i / 18 }); }
  // the race line round the cone (clockwise from the north): r(θ), θ = atan2(dx, dz)
  const TR = th => 150 + 14 * Math.sin(3 * th + 0.6), TP = th => ({ x: vx(Math.sin(th) * TR(th)), z: vz(Math.cos(th) * TR(th)) });
  const TT = th => { const a = TP(th - 0.002), b = TP(th + 0.002), l = Math.hypot(b.x - a.x, b.z - a.z); return { x: (b.x - a.x) / l, z: (b.z - a.z) / l }; };
  const TW = 16;
  { const N = 220, pos = [], idx = [], uv = []; for (let i = 0; i <= N; i++) { const th = i / N * TAU, p = TP(th), t = TT(th), nx = t.z, nz = -t.x; pos.push(p.x - nx * TW / 2, 0.014, p.z - nz * TW / 2, p.x + nx * TW / 2, 0.014, p.z + nz * TW / 2); uv.push(0, i * 1.2, 1, i * 1.2); } for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const tt = CT(128, 128, (g, w, h) => { g.fillStyle = '#5a3a2c'; g.fillRect(0, 0, w, h); speck(g, w, h, 900, ['rgba(20,10,6,0.45)', 'rgba(150,100,70,0.3)']); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 6, h); g.fillRect(w - 6, 0, 6, h); g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, 6, h / 2); g.fillRect(w - 6, h / 2, 6, h / 2); }); tt.wrapT = THREE.RepeatWrapping;
    const m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ map: tt, gradientMap: X.grad, side: THREE.DoubleSide })); m.receiveShadow = true; scene.add(m); }
  // ---- COURSE READABILITY (Ben: hard to see where you're going, hard to stay on) ----
  { const ribbon = (off, w, mat, y) => { const N = 240, pos = [], idx = []; for (let i = 0; i <= N; i++) { const th = i / N * TAU, p = TP(th), t = TT(th), nx = t.z, nz = -t.x; pos.push(p.x - nx * (off - w / 2), y, p.z - nz * (off - w / 2), p.x - nx * (off + w / 2), y, p.z - nz * (off + w / 2)); if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); const m = new THREE.Mesh(g, mat); scene.add(m); return m; };
    const edgeM = new THREE.MeshBasicMaterial({ color: 0xffd23a, side: THREE.DoubleSide }), kerbA = new THREE.MeshBasicMaterial({ color: 0xec3013, side: THREE.DoubleSide }), kerbB = new THREE.MeshBasicMaterial({ color: 0xf3f2f2, side: THREE.DoubleSide });
    for (const sg of [-1, 1]) { ribbon(sg * (TW / 2 - 0.4), 0.45, edgeM, 0.035); ribbon(sg * (TW / 2 + 0.75), 1.3, kerbA, 0.03); }
    // white dashes down the middle
    { const N = 150, geo = new THREE.PlaneGeometry(0.5, 3.4), dash = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), N), o = new THREE.Object3D(); for (let i = 0; i < N; i++) { const th = i / N * TAU, p = TP(th), t = TT(th); o.position.set(p.x, 0.045, p.z); o.rotation.set(-Math.PI / 2, 0, Math.atan2(t.x, t.z)); o.updateMatrix(); dash.setMatrixAt(i, o.matrix); } scene.add(dash); }
    // painted arrows on the track (the way you race) + lantern posts both sides
    { const arT = CT(128, 128, g => { g.clearRect(0, 0, 128, 128); g.fillStyle = '#ffd23a'; for (let k = 0; k < 2; k++) { const y = 18 + k * 50; g.beginPath(); g.moveTo(64, y); g.lineTo(116, y + 40); g.lineTo(96, y + 40); g.lineTo(64, y + 16); g.lineTo(32, y + 40); g.lineTo(12, y + 40); g.closePath(); g.fill(); } });
      const N = 36, geo = new THREE.PlaneGeometry(5.4, 5.4), ar = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ map: arT, transparent: true, depthWrite: false }), N), o = new THREE.Object3D(); for (let i = 0; i < N; i++) { const th = (i + 0.5) / N * TAU, p = TP(th), t = TT(th); o.position.set(p.x, 0.04, p.z); o.rotation.set(-Math.PI / 2, 0, Math.PI + Math.atan2(t.x, t.z)); o.updateMatrix(); ar.setMatrixAt(i, o.matrix); } scene.add(ar); }
    // roadside CHEVRON boards on the outside of the bend, pointing the way it turns
    { const chT = CT(256, 128, g => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#ffd23a'; for (let k = 0; k < 3; k++) { const x = 30 + k * 72; g.beginPath(); g.moveTo(x, 14); g.lineTo(x + 46, 64); g.lineTo(x, 114); g.lineTo(x + 22, 114); g.lineTo(x + 68, 64); g.lineTo(x + 22, 14); g.closePath(); g.fill(); } g.strokeStyle = '#ffd23a'; g.lineWidth = 8; g.strokeRect(4, 4, 248, 120); });
      const chM = new THREE.MeshBasicMaterial({ map: chT, side: THREE.DoubleSide }), N = 28, geo = new THREE.PlaneGeometry(3.2, 1.6), post = toon('#2e2826');
      for (let i = 0; i < N; i++) { const th = (i + 0.25) / N * TAU, p = TP(th), t = TT(th), nx = t.z, nz = -t.x, cxv = AV.x - p.x, czv = AV.z - p.z, inSide = Math.sign(cxv * nx + czv * nz) || 1, off = inSide * (TW / 2 + 4.5), x = p.x - nx * off, z = p.z - nz * off;
        const b = new THREE.Mesh(geo, chM); b.position.set(x, 2.2, z); b.rotation.y = Math.atan2(-t.x, -t.z); const side = Math.sign(cxv * (-t.z) + czv * t.x) || 1; if (side < 0) b.scale.x = -1; scene.add(b); M(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 5), post, x, 0.8, z, null, 0); } }
    { const N = touch ? 44 : 64, pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 3.6, 6), toon('#2e2826'), N * 2), head = new THREE.InstancedMesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), new THREE.MeshBasicMaterial({ color: 0xffc04a }), N * 2), o = new THREE.Object3D(); let k = 0;
      for (let i = 0; i < N; i++) for (const sg of [-1, 1]) { const th = i / N * TAU + (sg > 0 ? 0 : TAU / N / 2), p = TP(th), t = TT(th), nx = t.z, nz = -t.x, off = sg * (TW / 2 + 2.6); o.position.set(p.x - nx * off, 1.8, p.z - nz * off); o.rotation.set(0, 0, 0); o.updateMatrix(); pole.setMatrixAt(k, o.matrix); o.position.y = 3.8; o.updateMatrix(); head.setMatrixAt(k, o.matrix); k++; }
      scene.add(pole, head); } }
  // lava rivers (radial, from the cone), crossed by the track twice: kicker over each, a stone LAVA BRIDGE on the second
  const lavaT = CT(128, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#ff3a0a'); gr.addColorStop(0.5, '#ffb02a'); gr.addColorStop(1, '#ff3a0a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${80 + Math.random() * 60},20,10,0.6)`; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 6 + Math.random() * 18, 3 + Math.random() * 6, Math.random(), 0, 7); g.fill(); } }); lavaT.wrapS = lavaT.wrapT = THREE.RepeatWrapping;
  const RIVERS = [{ th: Math.PI * 0.55, w: 9 }, { th: Math.PI * 1.32, w: 9 }], LAVAS = [];
  for (const R0 of RIVERS) { const L = 190, r0 = VR - 6, mid = r0 + L / 2, t = lavaT.clone(); t.needsUpdate = true; t.repeat.set(1, L / 18); const m = new THREE.Mesh(new THREE.PlaneGeometry(R0.w, L), new THREE.MeshBasicMaterial({ map: t })); m.rotation.set(-Math.PI / 2, 0, R0.th + Math.PI); m.position.set(vx(Math.sin(R0.th) * mid), 0.03, vz(Math.cos(R0.th) * mid)); scene.add(m); R0.tex = t; R0.r0 = r0; R0.r1 = r0 + L;
    const s = new THREE.Sprite(glowMat(0xff6a1a, 0.4)); s.position.set(vx(Math.sin(R0.th) * TR(R0.th)), 1.5, vz(Math.cos(R0.th) * TR(R0.th))); s.scale.set(26, 8, 1); scene.add(s);
    LAVAS.push((x, z) => { const dx = x - AV.x, dz = z - AV.z, r = Math.hypot(dx, dz); if (r < R0.r0 || r > R0.r1) return false; const a = Math.atan2(dx, dz); return Math.abs(wrap(a - R0.th)) * r < R0.w / 2; });
    const th0 = R0.th - (R0.w / 2 + 7.3) / TR(R0.th), p = TP(th0), tg = TT(th0); R0.kick = jump(p.x, p.z, Math.atan2(tg.x, tg.z), TW, 8, 2.0, R0.w + 4, 12); }
  { const R0 = RIVERS[1], r = TR(R0.th) + 26, x = vx(Math.sin(R0.th) * r), z = vz(Math.cos(R0.th) * r), tg = TT(R0.th), yaw = Math.atan2(tg.x, tg.z), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; scene.add(g);
    M(new THREE.BoxGeometry(6, 0.14, R0.w + 8), basalt, 0, 0.07, 0, g, 0.03); for (const sx of [-1, 1]) for (let k = -2; k <= 2; k++) M(new THREE.BoxGeometry(0.4, 0.9, 0.4), iron, sx * 2.8, 1, k * 2.4, g, 0.01);
    BRIDGE = { x, z, yaw, w: 6, l: R0.w + 8 }; }
  // braziers along the race line (path readability) + start / finish gantry
  const BRAZ = []; for (let i = 0; i < 40; i++) { const th = i / 40 * TAU; if (RIVERS.some(R0 => Math.abs(wrap(th - R0.th)) < 0.14)) continue; const p = TP(th), t = TT(th); for (const sd of [-1, 1]) { const x = p.x + t.z * sd * (TW / 2 + 2.2), z = p.z - t.x * sd * (TW / 2 + 2.2); const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); M(new THREE.CylinderGeometry(0.1, 0.16, 1.6, 6), iron, 0, 0.8, 0, g, 0); M(new THREE.CylinderGeometry(0.5, 0.25, 0.4, 8), iron, 0, 1.75, 0, g, 0.01); const s = new THREE.Sprite(glowMat(0xff7a2a)); s.position.y = 2.2; s.scale.setScalar(2.2); g.add(s); BRAZ.push({ s, k: rr(0, 6) }); LAMPS.push([x, z]); } }
  const START = TP(0), STT = TT(0);
  { const g = new THREE.Group(); g.position.set(START.x, 0, START.z); g.rotation.y = Math.atan2(STT.x, STT.z); scene.add(g); for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.8, 8, 0.8), iron, sx * (TW / 2 + 1), 4, 0, g, 0.02); M(new THREE.BoxGeometry(TW + 3, 1.4, 0.8), red, 0, 8, 0, g, 0.02);
    const ct = CT(256, 32, (c, W) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#201e1d' : '#f3f2f2'; c.fillRect(i * 16, j * 16, 16, 16); } }); const f = new THREE.Mesh(new THREE.PlaneGeometry(TW, 1.6), new THREE.MeshBasicMaterial({ map: ct })); f.rotation.x = -Math.PI / 2; f.position.y = 0.03; g.add(f); }
  // CINDER PIT (contest): north of the race line, between the track and the city
  const CP = { x: vx(0), z: vz(232) }; slab(asphT, CP.x, CP.z, 76, 56, 6, 0.012);
  const PITJ = [jump(CP.x - 16, CP.z - 22, 0, 10, 7, 2.2, 7, 10), jump(CP.x + 16, CP.z - 22, 0, 10, 7, 2.2, 7, 10)];
  for (const k of PITJ) { const lx = k.o.x, lz = k.o.z + k.L + 3.5; const m = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24), new THREE.MeshBasicMaterial({ map: lavaT })); m.rotation.x = -Math.PI / 2; m.position.set(lx, 0.03, lz); scene.add(m); LAVAS.push((x, z) => Math.hypot(x - lx, z - lz) < 3.2); }
  X.addRamp({ x: CP.x, z: CP.z - 10, yaw: 0, w: 7, l: 8, h: 2.6, top: 0 }, '#4e4038'); addBox(CP.x - 3.5, CP.x + 3.5, CP.z - 2, CP.z + 4, 2.6, rampM);
  const PITWALL = quarter({ o: { x: CP.x, z: CP.z + 18 }, phi: 0, len: 40, R: 4.6, H: 2.6, deck: 2.4, vert: true });
  for (let i = 0; i < 10; i++) { const x = CP.x - 36 + i * 8; for (const z of [CP.z - 28, CP.z + 28]) lamp(x, z, 1, 0xff6a3a); }
  // a few Ventmaws + Chargers off the volcano track too (score in the race / contest)
  [['vent', 0.2, 1], ['charger', 0.95, -1], ['vent', 1.7, 1], ['charger', 2.4, -1], ['vent', 3.4, 1], ['charger', 4.2, -1], ['vent', 5.3, 1]].forEach(([k, th, sd]) => { const p = TP(th), t = TT(th); spawnC(k, p.x + t.z * sd * (TW / 2 + 9), p.z - t.x * sd * (TW / 2 + 9), 0).track = { th, sd }; });

  // ---------- BIG PAPPA (gruff old champion: grey fur, scar, medal) ----------
  const PAPPA_LOOK = { ...X.CAST.player.look, fur: '#8a8580', furDark: '#5f5a55', muzzle: '#d6d0c8', chin: '#d6d0c8', tailMid: '#8a8580', tailBase: '#6f6a65', paw: '#8a8580', leg: '#201e1d', boot: '#201e1d', headScale: 1.1, bodyScale: 1.15 };
  function makePappa(x, z) { const f = X.kit.makeFox({ ...X.CAST.player, look: PAPPA_LOOK, torso: ['#201e1d', '#3a3836', '#ec3013'], outfit: 'coat', crest: '', gear: 'none', eyes: ['#f59e0b', '#f59e0b'], mood: 'determined' }); const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false;
    const md = new THREE.Group(); md.position.set(0, 1.14, 0.34); P.body.add(md); M(new THREE.BoxGeometry(0.08, 0.2, 0.02), red, 0, 0.12, 0, md, 0); M(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16), gold, 0, 0, 0.01, md, 0.008).rotation.x = Math.PI / 2;
    const sc = new THREE.Group(); sc.position.set(0.16, 1.62, 0.36); P.body.add(sc); M(new THREE.BoxGeometry(0.03, 0.2, 0.02), toon('#b34a3a'), 0, 0, 0, sc, 0).rotation.z = 0.5;
    f.scale.multiplyScalar(1.12); f.position.set(x, 0, z); scene.add(f); SOLIDS.push([x - 0.6, x + 0.6, z - 0.6, z + 0.6]); return f; }
  const PAPPAS = [makePappa(cx(-6), cz(40)), makePappa(START.x - STT.z * (TW / 2 + 4), START.z + STT.x * (TW / 2 + 4))];
  const bubCv = document.createElement('canvas'); bubCv.width = 768; bubCv.height = 160; const bubTex = new THREE.CanvasTexture(bubCv); bubTex.colorSpace = THREE.SRGBColorSpace;
  const bubs = PAPPAS.map(p => { const b = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubTex, transparent: true, depthTest: false })); b.scale.set(5.4, 1.12, 1); b.position.set(p.position.x, 3.9, p.position.z); b.renderOrder = 9; scene.add(b); return b; }); let bubText = '';
  function pappaSay(s) { if (s === bubText) return; bubText = s; const g = bubCv.getContext('2d'); g.clearRect(0, 0, 768, 160); g.font = '800 40px Archivo, sans-serif'; const w = Math.min(760, g.measureText(s).width + 56); g.fillStyle = '#f3f2f2'; g.fillRect(4, 4, w, 108); g.strokeStyle = '#201e1d'; g.lineWidth = 6; g.strokeRect(4, 4, w, 108); g.beginPath(); g.moveTo(40, 112); g.lineTo(70, 150); g.lineTo(90, 112); g.closePath(); g.fillStyle = '#f3f2f2'; g.fill(); g.stroke(); g.fillStyle = '#201e1d'; g.textBaseline = 'middle'; g.fillText(s, 32, 60, w - 50); bubTex.needsUpdate = true; }
  pappaSay('Read the sheet, kid.');

  // ---------- rivals: CINDER (big rival), WICK, SABE ----------
  const RIV = [{ name: 'CINDER', col: '#201e1d', acc: '#ec3013', skill: 1.0, lane: 0, fur: '#d9451c' }, { name: 'WICK', col: '#38bdf8', acc: '#f3f2f2', skill: 0.92, lane: -4.5, fur: '#c9772e' }, { name: 'SABE', col: '#a3e635', acc: '#201e1d', skill: 0.9, lane: 4.5, fur: '#a8692e' }].map(R0 => {
    const g = X.makeVeh('moto'), SV = g.userData.V, s = (SV.spec && SV.spec.scale) || 1; g.scale.setScalar(s); const tm = new Map(); g.traverse(m => { if (m.isMesh && m.material && m.material.color && m.material !== X.outlineMat) { if (!tm.has(m.material)) { const nm = m.material.clone(); const hx = nm.color.getHexString(); if (hx === 'ec3013') nm.color.set(R0.col); tm.set(m.material, nm); } m.material = tm.get(m.material); } });
    const f = X.kit.makeFox({ ...X.CAST.player, look: { ...X.CAST.player.look, fur: R0.fur, tailMid: R0.fur, paw: R0.fur }, torso: [R0.col, R0.acc, '#201e1d'], outfit: 'armor', crest: '', gear: 'none', mood: 'determined' }); const FP = f.userData.P; if (FP.sword) FP.sword.visible = false; if (FP.gun) FP.gun.visible = false; f.scale.multiplyScalar(1 / s); (SV.seatParent || SV.body).add(f); f.position.copy(SV.seatLocal || SV.seat); if (FP.legs) FP.legs.forEach(l => l.rotation.x = -1.1); if (FP.arms) FP.arms.forEach(a => a.rotation.x = -1.2); if (FP.body) FP.body.rotation.x = 0.4;
    const tg = CT(256, 64, (c, W, H) => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, W, H); c.fillStyle = R0.col === '#201e1d' ? '#ec3013' : R0.col; c.fillRect(0, 0, 12, H); c.fillStyle = '#fff'; c.font = '900 40px Archivo, sans-serif'; c.textBaseline = 'middle'; c.fillText(R0.name, 24, H / 2 + 2); }); const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tg, depthTest: false })); tag.scale.set(3.2, 0.8, 1); tag.position.y = 3.4 / s; tag.renderOrder = 8; g.add(tag);
    scene.add(g); return { ...R0, g, SV, prog: 0, v: 0, y: 0, vy: 0, done: null }; });

  // ---------- chalk sheet ----------
  const boardCv = document.createElement('canvas'); boardCv.width = 1600; boardCv.height = 900; const boardCvP = document.createElement('canvas'); boardCvP.width = 900; boardCvP.height = 1600;
  function drawBoard(g, P = false) {
    const W = P ? 900 : 1600, H = P ? 1600 : 900, J = (n = 1.6) => (Math.random() - 0.5) * n * 2;
    g.fillStyle = '#5a3a2a'; g.fillRect(0, 0, W, H); const x0 = 34, y0 = 34, w = W - 68, h = H - 98; g.fillStyle = '#1f2b27'; g.fillRect(x0, y0, w, h);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.beginPath(); g.ellipse(x0 + Math.random() * w, y0 + Math.random() * h, 60 + Math.random() * 200, 20 + Math.random() * 60, Math.random() * 3, 0, 7); g.fill(); }
    const CH = '#f2f1e8', YL = '#f5e08a', RD = '#ff9a8a', BL = '#9fd8f5', GR = '#b6e3a0', HF = '"Caveat", "Segoe Print", "Bradley Hand", cursive';
    const txt = (s, x, y, size, col = CH, wt = 800, fam = 'Archivo, sans-serif') => { g.font = `${wt} ${size}px ${fam}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.fillStyle = col; g.globalAlpha = 0.92; g.fillText(s, x, y); g.globalAlpha = 0.28; g.fillText(s, x + 1.6, y + 1.2); g.globalAlpha = 1; };
    const hw = (s, x, y, size, col = YL) => txt(String(s).toUpperCase(), x, y, size, col, 700, HF);
    const ln = (pts, col = CH, wd = 5, close) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = 0.9; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + J(), y + J()) : g.moveTo(x + J(), y + J())); if (close) g.closePath(); g.stroke(); g.globalAlpha = 1; };
    const circ = (x, y, r, col = CH, wd = 5) => { g.strokeStyle = col; g.lineWidth = wd; g.globalAlpha = 0.9; g.beginPath(); g.arc(x + J(), y + J(), r, 0, TAU); g.stroke(); g.globalAlpha = 1; };
    const arrow = (x1, y1, x2, y2, col = YL) => { ln([[x1, y1], [(x1 + x2) / 2 + 12, (y1 + y2) / 2 - 10], [x2, y2]], col, 4); const a = Math.atan2(y2 - y1, x2 - x1); ln([[x2 - Math.cos(a - 0.5) * 22, y2 - Math.sin(a - 0.5) * 22], [x2, y2], [x2 - Math.cos(a + 0.5) * 22, y2 - Math.sin(a + 0.5) * 22]], col, 4); };
    txt('LUXOR MOTO', 86, 150, P ? 100 : 112, CH, 900); txt('BIG PAPPA  ·  SCHOOL  ·  VOLCANO RUN  ·  CINDER PIT', 90, 202, P ? 23 : 30, YL, 800); ln([[88, 226], [P ? 800 : 880, 222]], CH, 4);
    g.save(); if (P) { g.translate(-560, 170); g.scale(0.92, 0.92); } else g.translate(0, 40);
    { for (const [x, y] of [[990, 380], [1400, 380]]) { circ(x, y, 74, CH, 8); circ(x, y, 26, CH, 4); }
      ln([[990, 380], [1110, 290], [1300, 290], [1400, 380]], CH, 7); ln([[1090, 300], [1150, 240], [1290, 250], [1320, 290]], CH, 6); ln([[1110, 290], [1060, 250], [1000, 255]], CH, 6); ln([[1300, 260], [1340, 200], [1380, 196]], CH, 6); ln([[1160, 330], [1220, 330], [1220, 370], [1160, 370]], CH, 4, true); ln([[1020, 330], [960, 310]], CH, 5); circ(1352, 236, 12, RD, 4);
      hw('1  Scatter gun', 1380, 186, 36, BL); arrow(1420, 200, 1362, 232, BL);
      hw('2  Nitro  ·  air: spin', 880, 470, 34, '#7dd3fc'); hw('3  Hop  ·  air: backflip', 880, 512, 34, YL); arrow(920, 410, 950, 350, YL);
      hw('Tap in the air = one trick', 880, 566, 32, CH); hw('Hold = keep going: double, triple', 880, 604, 32, YL); hw('Let go before you land!', 880, 650, 36, RD); }
    g.restore();
    g.save(); if (P) { g.translate(-10, 500); g.scale(1.1, 1.1); }
    const rows = [['STICK', 'WASD', 'Throttle + steer  ·  hard turn = drift', CH], ['1', 'J', 'Scatter gun  ·  bots beside the road', BL], ['2', 'K', 'Nitro  ·  in the air = 360 spins', '#7dd3fc'], ['3', 'SPACE', 'Hop  ·  in the air = backflip', YL], ['EYE', 'HOLD TO LOOK  ·  TAP = POV', 'Look around', CH]];
    rows.forEach(([k, kb, d, col], i) => { const y = 300 + i * (P ? 100 : 86), cx2 = 150, cy = y - 14;
      if (k === 'STICK') { circ(cx2, cy, 31, CH, 4); g.globalAlpha = 0.5; g.fillStyle = CH; g.beginPath(); g.arc(cx2 + 6, cy - 9, 14, 0, 7); g.fill(); g.globalAlpha = 1; circ(cx2 + 6, cy - 9, 14, CH, 4); }
      else if (k === 'EYE') { circ(cx2, cy, 30, CH, 4); ln([[cx2 - 19, cy], [cx2 - 9, cy - 8], [cx2, cy - 10], [cx2 + 9, cy - 8], [cx2 + 19, cy], [cx2 + 9, cy + 8], [cx2, cy + 10], [cx2 - 9, cy + 8]], CH, 3, true); g.fillStyle = CH; g.beginPath(); g.arc(cx2, cy, 4, 0, 7); g.fill(); }
      else { g.globalAlpha = 0.9; g.strokeStyle = col; g.lineWidth = 9; g.beginPath(); g.arc(cx2, cy, 30, 0, 7); g.stroke(); g.globalAlpha = 1; circ(cx2, cy, 22, CH, 2); g.font = '900 34px Archivo, sans-serif'; g.textAlign = 'center'; g.fillStyle = CH; g.fillText(k, cx2, cy + 12); g.textAlign = 'left'; }
      txt(kb, 230, y - 24, 18, '#b9c4bf', 800); txt(d, 230, y + 4, 30, CH, 700); });
    g.restore();
    const strip = ['1 GATES  2 DRIFT  3 WHOOPS', '4 DOUBLE  5 FLIP  6 GUN', '7 BERMS  8 NITRO  9 MUD'];
    if (P) { strip.forEach((l, i) => hw(l, 90, H - 236 + i * 46, 40, YL)); hw('CRASH = +3 S', 90, H - 92, 36, GR); } else { strip.forEach((l, i) => hw(l, 880, 728 + i * 34, 30, YL)); hw('CRASH = +3 S', 90, 772, 34, GR); }
    g.fillStyle = '#3e2618'; g.fillRect(0, H - 64, W, 64); g.fillStyle = '#5a3a2a'; g.fillRect(0, H - 64, W, 10); for (let k = 0; k < 4; k++) { g.fillStyle = ['#f2f1e8', '#f5e08a', '#ff9a8a', '#f2f1e8'][k]; g.fillRect(260 + k * 120, H - 48, 70, 16); }
    for (let i = 0; i < 5000; i++) { g.fillStyle = 'rgba(31,43,39,0.55)'; g.fillRect(x0 + Math.random() * w, y0 + Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
  const paintBoards = () => { drawBoard(boardCv.getContext('2d')); drawBoard(boardCvP.getContext('2d'), true); course.boardURL = boardCv.toDataURL('image/jpeg', 0.9); course.boardURLP = boardCvP.toDataURL('image/jpeg', 0.9); course.onPaint && course.onPaint(); };
  try { if (!document.getElementById('font-caveat')) { const lk = document.createElement('link'); lk.id = 'font-caveat'; lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap'; document.head.appendChild(lk); } } catch (e) {}

  // ---------- driving synth loop (until Ben uploads MP3s): low saw bass + gated pads, 120 bpm ----------
  const MU = { next: 0, step: 0, bus: null }, ROOTS = [40, 40, 43, 38], mf = n => 440 * Math.pow(2, (n - 69) / 12);
  function env(c, node, t, a, peak, d) { const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(peak, t + a); gn.gain.exponentialRampToValueAtTime(0.0001, t + a + d); node.connect(gn); gn.connect(MU.bus); }
  function noise(c, t, type, f, peak, d) { const s = c.createBufferSource(); s.buffer = X.audio.noise; const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; s.connect(b); env(c, b, t, 0.003, peak, d); s.start(t, Math.random()); s.stop(t + d + 0.05); }
  function musicStep() { const a = X.audio, c = a.ctx; if (!c || !a.master || !a.noise) return;
    if (!MU.bus) { MU.bus = c.createGain(); MU.bus.gain.value = 0.45; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; MU.bus.connect(lp); lp.connect(a.master); }
    const spb = 60 / 120 / 4; if (MU.next < c.currentTime) MU.next = c.currentTime + 0.05;
    while (MU.next < c.currentTime + 0.25) { const s = MU.step, b = s % 16, rt = ROOTS[Math.floor(s / 16) % 4], t = MU.next;
      if (b % 2 === 0) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mf(rt + (b === 6 || b === 14 ? 12 : 0)); env(c, o, t, 0.005, 0.045, spb * 1.6); o.start(t); o.stop(t + spb * 2); }
      if (b === 0 || b === 8) [12, 19, 24].forEach(iv => { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = mf(rt + iv); env(c, o, t, 0.01, 0.012, spb * 3); o.start(t); o.stop(t + spb * 4); });
      if (b % 4 === 0) { const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.2); env(c, o, t, 0.004, 0.2, 0.22); o.start(t); o.stop(t + 0.3); }
      if (b === 4 || b === 12) noise(c, t, 'bandpass', 1800, 0.07, 0.14); noise(c, t, 'highpass', 7500, b % 2 ? 0.01 : 0.018, 0.04);
      MU.step++; MU.next += spb; } }

  // ---------- state ----------
  const G = { phase: 'ready', board: true, place: 'school', t: 0, pen: 0, pts: 0, les: 0, cnt: 0, nextT: 0, count: 0, banner: '', bannerT: 0, radio: '', radioT: 0, flash: null, flashT: 0, done: null, crashes: 0, bestTrick: null, bestCombo: 0, bestComboN: 0, spin: 0, stuckT: 0, cp: [0, 36, 0], ending: 0, bail: null, thr: 0, kos: 0, bonkT: 0, bermOn: null, bermT: 0, mud: null, whoop: null, prevDrift: 0, lapT: 0, lapBest: 0, prog: 0, thPrev: 0, rank: 1, lastSafe: null };
  const CB = { n: 0, pot: 0, idle: 0 };
  let T = null, A = null, P = null;
  const banner = (s, t = 3) => { G.banner = s; G.bannerT = t; }, radio = (s, t = 6) => { G.radio = s; G.radioT = t; }, flash = (txt, col = '#ffd23a', t = 1.6) => { G.flash = { txt, col }; G.flashT = t; };
  const PL = () => PLACES.find(p => p.id === G.place), LID = () => LESSONS[G.les].id, inSchool = id => G.place === 'school' && LID() === id;
  const fmtT = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') + '.' + Math.floor((s % 1) * 10);
  const C = () => X.C, Vv = () => X.V, onVolcano = () => G.place !== 'school';
  const thOf = (x, z) => Math.atan2(x - AV.x, z - AV.z);
  function snapP() { const c = C(); P = { x: c.x, z: c.z, y: c.y, g: c.ground }; }
  function tp(x, z, yaw = 0) { const c = C(); X.place(x, z, yaw); c.flipT = null; c.spinT = null; c.slip = 0; c.nitro = 0; const V = Vv(); if (V && V.body) V.body.rotation.z = 0; T = null; A = null; G.spin = 0; G.bail = null; G.bermOn = null; G.mud = null; G.whoop = null; snapP(); }
  function resetRun() { G.t = 0; G.pen = 0; G.pts = 0; G.crashes = 0; G.kos = 0; G.bestTrick = null; G.bestCombo = 0; G.bestComboN = 0; G.done = null; G.flash = null; G.banner = ''; G.radio = ''; G.nextT = 0; G.ending = 0; G.lapT = 0; G.lapBest = 0; G.lap = 0; G.prog = 0; G.finishT = 0; CB.n = CB.pot = CB.idle = 0; GATES.forEach(g => { g.done = false; g.ln.material.color.setHex(0xffd23a); }); BERMS.forEach(b => b.done = false); RIV.forEach(R0 => { R0.prog = -0.004 * (1 + RIV.indexOf(R0)); R0.v = 0; R0.done = null; R0.y = 0; R0.vy = 0; }); }

  // ---------- moves, combos, crashes ----------
  function addMove(name, pts) { const c = C(); CB.n++; CB.pot += pts; CB.idle = 0; X.popup(tmp.set(c.x, c.y + 3.2, c.z), name + ' +' + pts, '#ffd23a'); if (!G.bestTrick || pts > G.bestTrick.pts) G.bestTrick = { name, pts }; X.audio.tone(880 + CB.n * 110, 0.08, 0.04, 'triangle', 1.4); }
  function bank() { if (!CB.n) return; const v = CB.pot * CB.n, n = CB.n; G.pts += v; if (v > G.bestCombo) { G.bestCombo = v; G.bestComboN = n; } if (n >= 2) { flash('COMBO ×' + n + ' · +' + v, '#ffd23a', 1.8); X.audio.tone(660, 0.1, 0.05, 'square', 1.5); } CB.n = CB.pot = CB.idle = 0; }
  function crash(why = 'CRASH') { if (G.bail) return; const c = C(); G.bail = { t: 0 }; c.speed *= 0.1; c.nitro = 0; T = null; G.spin = 0; CB.n = CB.pot = CB.idle = 0; G.crashes++;
    if (G.place === 'school') G.pen += 3; else if (G.place === 'contest') G.t += 3;
    flash(why + (G.place === 'race' ? '' : G.place === 'school' ? ' · +3 S' : ' · −3 S'), '#ec3013', 1.8); X.St.shake = Math.max(X.St.shake, 0.5); X.puff(tmp.set(c.x, c.y + 0.4, c.z), 0x6b5a50, 14, 3, 1, 0.8); X.audio.burst(0.35, 380, 0.28); X.audio.tone(140, 0.3, 0.05, 'sawtooth', 0.5); if (Math.random() < 0.5 && !DM.on) radio(CRASHES[Math.floor(Math.random() * CRASHES.length)], 3); }
  function bonk(why) { if (G.bonkT > 0 || G.bail || G.phase !== 'run') return; G.bonkT = 1.2; const c = C(); c.speed *= 0.5; X.St.shake = Math.max(X.St.shake, 0.35); X.popup(tmp.set(c.x, c.y + 2.8, c.z), why, '#ec3013'); X.audio.burst(0.2, 600, 0.2); }
  function startTrick(kind, held) { T = { kind, rot: 0, held, target: held ? 0 : TAU, base: C().pitch }; X.audio.burst(0.06, 1500, 0.1); }
  function releaseTrick() { if (!T || !T.held) return; T.held = false; T.target = Math.max(1, Math.ceil(T.rot / TAU - 0.15)) * TAU; }
  function completeTrick() { const lvl = Math.round(T.target / TAU), L = T.kind === 'flip' ? FLIPS : SPINS, [nm, p0] = L[Math.min(lvl, L.length) - 1]; const c = C(); c.pitch = T.base; T = null; G.spin = 0; if (A) { A.tricks++; A.flips = (A.flips || 0) + (L === FLIPS ? lvl : 0); } addMove(nm, p0); }
  function airBtn(kind, down) { if (down) { if (!T) startTrick(kind, true); } else if (T && T.held && T.kind === kind) releaseTrick(); }

  // ---------- places + lessons ----------
  function lesEnter(i, quiet) { G.les = i; G.cnt = 0; G.stuckT = 0; const L = LESSONS[i]; G.cp = [cx(L.start[0]), cz(L.start[1]), L.start[2]]; tp(...G.cp); if (!quiet) { banner('LESSON ' + (i + 1) + ' · ' + L.name, 3); radio(L.radio, 8); } pappaSay(L.name + '. Go.'); }
  function lesCount() { if (G.place !== 'school' || G.nextT || DM.on || G.phase !== 'run') return; G.cnt++; G.stuckT = 0; X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.4); if (G.cnt >= LESSONS[G.les].need) lesPass(); }
  function lesPass() { bank(); G.pts += 200; flash('LESSON ' + (G.les + 1) + ' PASSED · +200', '#ffd23a', 2.2); radio(PASS[G.les] || PASS[0], 4); pappaSay(PASS[G.les] || 'Good.'); G.nextT = 2.2; }
  function raceStart() { const t = STT; G.cp = [START.x - t.x * 8, START.z - t.z * 8, Math.atan2(t.x, t.z)]; tp(...G.cp); G.thPrev = thOf(C().x, C().z); G.prog = 0; G.lap = 0; G.lapT = 0; RIV.forEach(R0 => { R0.prog = -0.006 - 0.004 * RIV.indexOf(R0); R0.v = 0; R0.done = null; }); }
  function finish() { if (DM.on || G.phase === 'done') return; if (!G.bail) bank(); const pd = PL(), id = G.place; let total, rows, title, grade, gold, trophy = false, has = false, nb = false, best;
    try { has = save.flag('motoCup'); } catch (e) {}
    if (id === 'school') { const tt = G.t + G.pen, tb = Math.max(0, Math.round((pd.target - tt) * 4)); total = Math.round(G.pts + tb); grade = total >= 3800 ? 'S' : total >= 3000 ? 'A' : total >= 2200 ? 'B' : total >= 1400 ? 'C' : 'D'; title = 'Moto school passed';
      rows = [['Time', fmtT(tt) + ' / target ' + fmtT(pd.target).slice(0, -2)], ['Lessons passed', '9 / 9'], ['Crashes', G.crashes + (G.pen ? ' (+' + G.pen + ' s)' : '')], ['Best combo', G.bestCombo ? G.bestCombo + ' (×' + G.bestComboN + ')' : '—'], ['Best trick', G.bestTrick ? G.bestTrick.name : '—'], ['Time bonus', '+' + tb]]; try { save.setFlag('motoSchool'); } catch (e) {} }
    else if (id === 'race') { const pos = G.rank; total = Math.round([1500, 1000, 700, 400][pos - 1] + G.pts); grade = ['S', 'B', 'C', 'D'][pos - 1]; title = pos === 1 ? 'You won the Volcano Run' : 'Finished P' + pos;
      if (pos === 1 && !has) { try { save.setFlag('motoCup'); save.give('cinderCup', 1); } catch (e) {} trophy = true; has = true; }
      rows = [['Position', 'P' + pos + ' / 4'], ['Race time', fmtT(G.t)], ['Best lap', G.lapBest ? fmtT(G.lapBest) : '—'], ['Crashes', String(G.crashes)], ['Tricks + bots', '+' + Math.round(G.pts)], ['CINDER CUP', trophy ? 'WON · GOES HOME' : has ? 'ON YOUR SHELF' : 'WIN THE RACE']]; }
    else { total = Math.round(G.pts); grade = total >= 3600 ? 'S' : total >= TROPHY_SCORE ? 'A' : total >= 1500 ? 'B' : total >= 800 ? 'C' : 'D'; title = total >= TROPHY_SCORE ? 'Champion run' : 'Contest over'; try { if (total >= TROPHY_SCORE) save.setFlag('motoTrickKing'); } catch (e) {}
      rows = [['Time', '1:00'], ['Crashes', String(G.crashes)], ['Best combo', G.bestCombo ? G.bestCombo + ' (×' + G.bestComboN + ')' : '—'], ['Best trick', G.bestTrick ? G.bestTrick.name : '—']]; }
    const key = 'luxor.moto.' + id + '.best'; try { nb = save.best(key, total); best = save.stat(key, total); gold = Math.round(total / 100); save.addGold && save.addGold(gold); } catch (e) { best = total; }
    G.done = { id, name: pd.name, title, next: id === 'school' ? 'race' : id === 'race' ? 'contest' : null, total, grade, newBest: nb, best, gold, rows, trophy };
    G.phase = 'done'; X.setPaused(true); X.drive(0, 0);
    radio(id === 'school' ? 'You can ride, kid. Now go race the volcano.' : id === 'race' ? (G.rank === 1 ? 'You beat Cinder. Take the Cup home. Do not let it go to your head.' : 'P' + G.rank + '. Cinder is laughing. Again.') : 'Not bad tricks. I did a triple in \'79.', 8); pappaSay(id === 'race' && G.rank === 1 ? 'Champion.' : 'Again.'); }
  function rollOut(id = G.place) { X.audio.init && X.audio.init(); DM.on = false; resetRun(); G.place = PLACES.some(p => p.id === id) ? id : 'school'; G.board = false; G.phase = 'count'; G.count = 3.2; X.setPaused(false);
    if (G.place === 'school') lesEnter(0, true); else if (G.place === 'race') raceStart(); else { G.cp = [CP.x, CP.z - 34, 0]; tp(...G.cp); }
    banner(G.place === 'school' ? 'MOTO SCHOOL · LESSON 1' : G.place === 'race' ? 'VOLCANO RUN · 3 LAPS' : 'CINDER PIT · 60 S', 3); }

  // ---------- guidance ----------
  function nextGoal() { const c = C();
    if (G.place === 'race') { const th = thOf(c.x, c.z) + 0.22, p = TP(th); return { x: p.x, z: p.z, label: 'TRACK' }; }
    if (G.place !== 'school' || G.nextT) return null; const id = LID();
    if (id === 'gates') { const g = GATES.find(q => !q.done); return g ? { x: g.x, z: g.z, label: 'GATE ' + (GATES.indexOf(g) + 1) } : null; }
    if (id === 'drift') return null;
    if (id === 'whoops') return c.x < WH.x0 ? { x: WH.x0, z: cz(0), label: 'WHOOPS' } : null;
    if (id === 'double') return { x: DBL.o.x, z: DBL.o.z, label: 'THE DOUBLE' };
    if (id === 'flip') return { x: FLK.o.x, z: FLK.o.z, label: 'KICKER' };
    if (id === 'gun') { let b = null, bd = 1e9; for (const o of CREAT) { if (o.dead || o.track) continue; const d = Math.hypot(o.x - c.x, o.z - c.z); if (d < bd) { bd = d; b = o; } } return b ? { x: b.x, z: b.z, label: b.D.name } : null; }
    if (id === 'berms') { const b = BERMS.find(q => !q.done); return b ? { x: b.cx, z: b.cz + Math.cos(b.ac) * 7, label: 'BERM ' + (BERMS.indexOf(b) + 1) } : null; }
    if (id === 'nitro') return { x: cx(0), z: TRAP.z0, label: 'SPEED TRAP' };
    if (id === 'mud') return c.z > MUD.z1 ? { x: cx(0), z: MUD.z1, label: 'MUD PIT' } : { x: cx(0), z: MUD.z0 - 4, label: 'OUT' };
    return null; }

  // ---------- creatures + rivals ----------
  function onSmash(o) { if (!CREAT.includes(o)) return; o.st = 'die'; o.t = 0; G.kos++; ck.enter(o.g, 'die'); X.puff(tmp.set(o.x, 1, o.z), 0xff7a2a, 14, 3, 1.2, 0.8, true); addMove(o.D.name.split(' ').pop() + ' DOWN', o.D.pts); if (inSchool('gun') && !o.track) lesCount(); o.back = 18; }
  function updCreatures(dt) { const c = C(), live = G.phase === 'run';
    for (const o of CREAT) { o.t += dt; const dx = c.x - o.x, dz = c.z - o.z, d = Math.hypot(dx, dz);
      if (o.dead) { if (o.st === 'die') { ck.animate(o.g, 'die', o.t, dt); if (o.t > 1.6) { o.g.visible = false; o.st = 'gone'; } } o.back -= dt; if (o.back <= 0 && d > 30) { o.dead = false; o.hp = o.max; o.st = 'idle'; o.t = 0; o.g.visible = true; o.x = o.hx; o.z = o.hz; o.g.position.set(o.x, 0, o.z); ck.enter(o.g, 'idle'); } continue; }
      if (d > 120) continue; o.face = o.face + clamp(wrap(Math.atan2(dx, dz) - o.face), -3 * dt, 3 * dt); o.g.rotation.y = o.face;
      if (o.kind === 'charger') { // charges at you but stops at the kerb (they stay off the road)
        if (o.st === 'idle' && live && d < 26 && o.cd <= 0) { o.st = 'windup'; o.t = 0; ck.enter(o.g, 'windup'); }
        o.cd -= dt; if (o.st === 'windup') { ck.animate(o.g, 'windup', o.t, dt); if (o.t > 0.7) { o.st = 'attack'; o.t = 0; ck.enter(o.g, 'attack'); } }
        else if (o.st === 'attack') { ck.animate(o.g, 'attack', o.t, dt); const sp = 14 * dt, nx = o.x + Math.sin(o.face) * sp, nz = o.z + Math.cos(o.face) * sp; const ok = o.track ? offTrack(nx, nz) && Math.hypot(nx - o.hx, nz - o.hz) < 8 : !roadOK(nx, nz) && Math.hypot(nx - o.hx, nz - o.hz) < 8; if (ok) { o.x = nx; o.z = nz; } if (d < 2.6) { bonk('RAMMED!'); o.st = 'back'; o.t = 0; } if (o.t > 1.2) { o.st = 'back'; o.t = 0; } }
        else if (o.st === 'back') { ck.animate(o.g, 'move', o.t, dt); o.x = damp(o.x, o.hx, 2, dt); o.z = damp(o.z, o.hz, 2, dt); if (o.t > 2) { o.st = 'idle'; o.cd = rr(1.5, 3); ck.enter(o.g, 'idle'); } }
        else ck.animate(o.g, 'idle', o.t, dt); o.g.position.set(o.x, 0, o.z); }
      else { if (o.st === 'idle' && live && d < 34 && d > 5 && o.cd <= 0) { o.st = 'windup'; o.t = 0; ck.enter(o.g, 'windup'); } o.cd -= dt;
        if (o.st === 'windup') { ck.animate(o.g, 'windup', o.t, dt); if (o.t > 1.0) { o.st = 'idle'; o.t = 0; o.cd = rr(2.4, 3.6); ck.enter(o.g, 'idle'); lob(o); } } else ck.animate(o.g, 'idle', o.t, dt); }
      if (o.flash > 0) { o.flash -= dt; o.g.scale.setScalar((o.kind === 'charger' ? 1.6 : 1.5) * (1 + o.flash * 0.5)); } }
    for (let i = proj.length - 1; i >= 0; i--) { const p = proj[i]; p.life -= dt; p.v.y -= 18 * dt; p.m.position.addScaledVector(p.v, dt);
      if (p.m.position.distanceTo(tmp.set(c.x, c.y + 1, c.z)) < 1.6) { bonk('SCORCHED!'); p.life = 0; } if (p.m.position.y < 0.1 || p.life <= 0) { if (p.m.position.y < 0.15) X.puff(p.m.position, 0xff6a1a, 4, 1.5, 0.7, 0.4, true); scene.remove(p.m); proj.splice(i, 1); } } }
  const blobGeo = new THREE.SphereGeometry(0.35, 10, 8), blobM = new THREE.MeshBasicMaterial({ color: 0xff7a1a });
  function lob(o) { const c = C(), tt = 1.1, tx = c.x + Math.sin(c.yaw) * c.speed * tt * 0.8, tz = c.z + Math.cos(c.yaw) * c.speed * tt * 0.8, m = new THREE.Mesh(blobGeo, blobM); m.position.set(o.x, 2.2, o.z); m.add(Object.assign(new THREE.Sprite(glowMat(0xff6a1a, 0.8)), {})); m.children[0].scale.setScalar(2); scene.add(m);
    proj.push({ m, v: V3((tx - o.x) / tt, (c.y + 1 - 2.2 + 9 * tt * tt) / tt, (tz - o.z) / tt), life: 2.2 }); X.audio.tone(200, 0.3, 0.05, 'sawtooth', 0.5); }
  function updRivals(dt) { const c = C(), race = G.place === 'race';
    for (const R0 of RIV) { R0.g.visible = race; if (!race) continue; if (G.phase !== 'run' || R0.done) { const th = R0.prog * TAU, p = TP(th), t = TT(th); R0.g.position.set(p.x + t.z * R0.lane, 0, p.z - t.x * R0.lane); R0.g.rotation.set(0, Math.atan2(t.x, t.z), 0); continue; }
      const th = R0.prog * TAU, r = TR(th), gap = G.prog - R0.prog, rubber = clamp(1 + gap * 2.5, 0.86, 1.12), want = 25.5 * R0.skill * rubber; R0.v = damp(R0.v, want, 1.2, dt);
      R0.prog += R0.v * dt / (TAU * r); const nth = R0.prog * TAU, p = TP(nth), t = TT(nth), yaw = Math.atan2(t.x, t.z), x = p.x + t.z * R0.lane, z = p.z - t.x * R0.lane;
      let y = 0; for (const RV of RIVERS) { const d = wrap(nth - RV.th) * r, k = RV.kick, d0 = -(RV.w / 2 + 7.3), a = d0 + k.L, b = a + (k.gapB - k.L) + 12; if (d > d0 && d < b) { if (d < a) { const p0 = prof(k, d - d0); y = p0 ? p0[0] : 0; } else { const u = (d - a) / (b - a); y = Math.max(0, k.H * (1 - u) + Math.sin(u * Math.PI) * 3.5); } } }
      R0.g.position.set(x, y, z); R0.g.rotation.set(-Math.max(-0.3, Math.min(0.3, (y - (R0.y || 0)) / Math.max(dt, 1e-3) * 0.02)), yaw, 0); R0.y = y;
      const SVw = R0.SV.wheels || []; SVw.forEach(w => { if (w.sp) w.sp.rotation.x += R0.v * dt / 0.4; });
      const dd = Math.hypot(c.x - x, c.z - z); if (dd < 2.2 && Math.abs(c.y - y) < 1.5) { c.x = x + (c.x - x) / (dd || 1) * 2.2; c.z = z + (c.z - z) / (dd || 1) * 2.2; c.speed *= 0.9; R0.v *= 0.95; }
      if (R0.prog >= 3 && !R0.done) { R0.done = G.t; } } }

  // scatter gun assist: the spread finds the nearest bot in front (20 m, ±60°)
  function gunAssist() { const c = C(), fx = Math.sin(c.yaw), fz = Math.cos(c.yaw); let b = null, bs = 1e9; for (const o of CREAT) { if (o.dead) continue; const dx = o.x - c.x, dz = o.z - c.z, d = Math.hypot(dx, dz); if (d > 22 || d < 1) continue; if ((dx * fx + dz * fz) / d < 0.5) continue; if (d < bs) { bs = d; b = o; } } if (!b) return; setTimeout(() => { if (!b.dead) { X.damage(b, 16, 'shot'); X.puff(tmp.set(b.x, 1.4, b.z), 0xffd23a, 5, 3, 0.7, 0.3, true); } }, 90); }
  // ---------- per-frame ----------
  function update(dt, thr) {
    musicStep(); const c = C(), V = Vv(); if (!V) return; G.thr = thr;
    for (const R0 of RIVERS) R0.tex.offset.y -= dt * 0.08; for (const b of BRAZ) b.s.scale.setScalar(2 + Math.sin(G.t * 9 + b.k) * 0.25);
    for (const S of SMOKE) { S.t = (S.t + dt * 0.02) % 1; S.s.position.set(vx(Math.sin(S.t * 40) * 10 * S.t), VH + S.t * 140, vz(Math.cos(S.t * 37) * 10 * S.t)); S.s.scale.setScalar(20 + S.t * 90); S.s.material.opacity = 0.5 * (1 - S.t); }
    PAPPAS.forEach((p, i) => { p.rotation.y = damp(p.rotation.y, p.rotation.y + wrap(Math.atan2(c.x - p.position.x, c.z - p.position.z) - p.rotation.y), 3, Math.max(dt, 1 / 120)); });
    if (!dt) { if (!P) snapP(); updRivals(0); return; }
    updCreatures(dt); updRivals(dt); G.bonkT = Math.max(0, G.bonkT - dt);
    if (DM.on) demoStep(dt);
    G.bannerT -= dt; if (G.bannerT <= 0) G.banner = ''; G.radioT -= dt; if (G.radioT <= 0) G.radio = ''; G.flashT -= dt; if (G.flashT <= 0) G.flash = null;
    if (G.phase === 'count') { G.count -= dt; const s = G.cp; c.x = s[0]; c.z = s[1]; c.speed = 0; if (G.count <= 0) { G.phase = 'run'; G.count = 0; banner('GO!', 1); X.audio.tone(880, 0.3, 0.06, 'square', 1.5); radio(G.place === 'school' ? LESSONS[0].radio : G.place === 'race' ? 'Three laps. Two lava jumps. Cinder does not brake. Neither do you.' : 'Sixty seconds, kid. Spins on 2, flips on 3. Show me.', 7); } else { const n = Math.ceil(G.count); if (n !== G.lastN) { G.lastN = n; if (n <= 3) X.audio.tone(440, 0.15, 0.05, 'square', 1); } } snapP(); return; }
    if (G.phase !== 'run') { snapP(); return; }
    if (!P) snapP();
    G.t += dt; if (G.place === 'school' && !G.nextT) { G.stuckT += dt; if (G.stuckT > 24) { G.stuckT = 0; radio(LESSONS[G.les].tip, 6); } }
    if (G.nextT > 0) { G.nextT -= dt; if (G.nextT <= 0) { G.nextT = 0; if (G.les + 1 < LESSONS.length) lesEnter(G.les + 1); else finish(); } }
    // walls you cannot ride up, buildings, the cone, the map edge
    const gh = X.groundH(c.x, c.z);
    if (gh - P.y > (P.g ? 0.5 : 0.7)) { c.x = P.x; c.z = P.z; c.y = P.y; c.ground = P.g; const was = Math.abs(c.speed); c.speed *= P.g ? -0.25 : 0; if (was > 3) { X.audio.burst(0.12, 700, 0.14); X.St.shake = Math.max(X.St.shake, 0.2); } }
    for (const [x0, x1, z0, z1] of SOLIDS) if (c.x > x0 - 0.8 && c.x < x1 + 0.8 && c.z > z0 - 0.8 && c.z < z1 + 0.8) { c.x = P.x; c.z = P.z; if (Math.abs(c.speed) > 6) crash('WALL'); else c.speed *= -0.3; break; }
    { const dx = c.x - AV.x, dz = c.z - AV.z, r = Math.hypot(dx, dz); if (r < VR + 2 && r > 1) { c.x = AV.x + dx / r * (VR + 2); c.z = AV.z + dz / r * (VR + 2); c.speed *= 0.5; } }
    if (G.place === 'race' && onVolcano() && c.ground) { const dx = c.x - AV.x, dz = c.z - AV.z, r = Math.hypot(dx, dz), th = Math.atan2(dx, dz), R = TR(th), off = r - R, lim = TW / 2 - 0.4;
      if (Math.abs(off) > lim) { c.speed *= Math.exp(-1.1 * dt); if (Math.random() < dt * 12 && Math.abs(c.speed) > 4) X.puff(tmp.set(c.x, c.y + 0.3, c.z), 0x6b5a50, 1); const t = TT(th), ty = Math.atan2(t.x, t.z); c.yaw += clamp(wrap(ty - c.yaw), -0.6, 0.6) * dt * 1.6; if (!G.offWarnT || G.t - G.offWarnT > 3) { G.offWarnT = G.t; flash('BACK ON THE TRACK', '#ffd23a', 1); } }
      const wall = TW / 2 + 4; if (Math.abs(off) > wall) { const k = (R + Math.sign(off) * wall) / r; c.x = AV.x + dx * k; c.z = AV.z + dz * k; c.speed *= 0.96; } }
    if (G.place === 'school' && !onVolcano() && c.ground && !roadOK(c.x, c.z)) c.speed *= Math.exp(-0.7 * dt);
    if (!onVolcano()) { c.x = clamp(c.x, CITYB.x0, CITYB.x1); c.z = clamp(c.z, CITYB.z0, CITYB.z1); } else { const dx = c.x - AV.x, dz = c.z - AV.z, r = Math.hypot(dx, dz), RM = 300; if (r > RM) { c.x = AV.x + dx / r * RM; c.z = AV.z + dz / r * RM; c.speed *= 0.6; } }
    const fx = Math.sin(c.yaw), fz = Math.cos(c.yaw);
    if (c.ground && Math.abs(thr) < 0.05 && !G.bail) c.speed *= Math.exp(1.2 * dt) * Math.exp(-0.45 * dt);
    // lava: crash and back on the track
    if (c.ground && c.y < 0.3 && LAVAS.some(f => f(c.x, c.z)) && !(BRIDGE && Math.abs((c.x - BRIDGE.x) * Math.cos(BRIDGE.yaw) - (c.z - BRIDGE.z) * Math.sin(BRIDGE.yaw)) < 3.2 && Math.hypot(c.x - BRIDGE.x, c.z - BRIDGE.z) < 9)) { crash('IN THE LAVA'); let back = G.cp; { const th = thOf(c.x, c.z), R0 = RIVERS.reduce((a, b) => Math.abs(wrap(th - b.th)) < Math.abs(wrap(th - a.th)) ? b : a); if (Math.hypot(c.x - CP.x, c.z - CP.z) > 50 && Math.abs(wrap(th - R0.th)) < 0.3) { const th2 = R0.th + (R0.w / 2 + 26) / TR(R0.th), p = TP(th2), tg = TT(th2); back = [p.x, p.z, Math.atan2(tg.x, tg.z)]; } else if (G.place === 'contest') back = [CP.x, CP.z - 34, 0]; } tp(...back); G.bail = { t: 0.5 }; if (G.place === 'race') G.thPrev = thOf(C().x, C().z); snapP(); return; }
    if (c.ground && !G.bail && G.place !== 'school') { G.safeT = (G.safeT || 0) + dt; if (G.safeT > 1) { G.safeT = 0; if (!LAVAS.some(f => f(c.x - fx * 6, c.z - fz * 6))) G.lastSafe = [c.x - fx * 3, c.z - fz * 3, c.yaw]; } }
    // mud pit: let off and you sink
    { const inMud = c.ground && c.x > MUD.x0 && c.x < MUD.x1 && c.z > MUD.z0 && c.z < MUD.z1; if (inMud) { if (thr < 0.5) c.speed *= Math.exp(-2.4 * dt); else c.speed = Math.min(c.speed, 15); if (Math.random() < 0.5) X.puff(tmp.set(c.x - fx, 0.3, c.z - fz), 0x3b2a1c, 1, 2, 0.7, 0.5); if (!G.mud) G.mud = { min: 99 }; G.mud.min = Math.min(G.mud.min, Math.abs(c.speed)); }
      else if (G.mud) { const m = G.mud; G.mud = null; if (c.z < MUD.z0 && P.z >= MUD.z0 - 1) { if (m.min > 2) { addMove('MUD PIT', 150); if (inSchool('mud')) lesCount(); } else if (inSchool('mud')) flash('STUCK · KEEP THE THROTTLE ON', '#ffffff', 1.8); } } }
    // whoops
    { const inW = c.x > WH.x0 && c.x < WH.x1 && Math.abs(c.z - cz(0)) < 8; if (inW) { if (!G.whoop) G.whoop = { t: 0 }; G.whoop.t += dt; if (thr < 0.5 && c.ground) c.speed *= Math.exp(-1.4 * dt); } else if (G.whoop) { const w = G.whoop; G.whoop = null; if (c.x >= WH.x1 && P.x < WH.x1 + 1) { const kmh = Math.abs(c.speed) * 3.6; if (kmh >= 45) { addMove('WHOOPS ' + Math.round(kmh) + ' KM/H', 120); if (inSchool('whoops')) lesCount(); } else if (inSchool('whoops')) flash(Math.round(kmh) + ' KM/H · NEED 45', '#ffffff', 1.6); } } }
    // transitions: gravity, coping launch, kicker launch, berm assist
    const s = c.ground ? surfAt(c.x, c.z) : null;
    if (s) { const dot = fx * s.nx + fz * s.nz;
      if (s.u > 0 && s.u < s.S.L) { c.speed -= 9.8 * Math.sin(Math.atan(s.tan)) * dot * dt * (s.S.kind === 'b' ? 0.25 : 0.8); if (c.speed < 0.6 && dot > 0.2 && s.S.kind === 'q') { c.yaw += Math.PI; c.speed = 0.9; } }
      if (s.S.vert && dot > 0.35 && c.speed > 5 && s.u > s.S.L - Math.max(0.4, Math.abs(c.speed) * dt * 1.6) && s.u < s.S.L + 0.6) { const back = s.u - (s.S.L - 0.2); c.x -= s.nx * back; c.z -= s.nz * back; c.y = prof(s.S, s.S.L - 0.2)[0];
        const vy = Math.min(16, c.speed * 0.95) * Math.max(0.6, dot); A = { t: 0, vert: true, tricks: 0, spd: Math.min(c.speed, 20), nx: s.nx, nz: s.nz, dur: 2 * vy / 24, y0: c.y, peak: c.y }; c.ground = false; c.vy = vy; c.y += 0.05; c.airT = 0; c.speed = 0; c.yaw += Math.PI; G.vslip = -Math.PI; X.audio.burst(0.12, 1300, 0.12); }
      else if (s.S.kick && dot > 0.3 && c.speed > 3 && s.u > s.S.L - Math.max(0.15, Math.abs(c.speed) * dt * 1.6)) { const ang = Math.atan(prof(s.S, s.S.L - 0.01)[1]); c.ground = false; c.vy = c.speed * Math.sin(ang) * 0.95; c.speed *= 0.6 + Math.cos(ang) * 0.4; c.y += 0.04; c.airT = 0; A = { t: 0, vert: false, tricks: 0, kick: s.S, y0: c.y, peak: c.y, sx: c.x, sz: c.z }; X.audio.burst(0.1, 1100, 0.12); }
      if (s.S.kind === 'b' && s.u > 0) { const tA = Math.atan2(s.nz, -s.nx), tB = tA + Math.PI, want = Math.abs(wrap(tA - c.yaw)) < Math.abs(wrap(tB - c.yaw)) ? tA : tB; if (Math.abs(c.steer) < 0.7) c.yaw += clamp(wrap(want - c.yaw), -3 * dt, 3 * dt); if (s.u > s.S.L * 0.85) { const k = s.u - s.S.L * 0.85; c.x -= s.nx * k * Math.min(1, 6 * dt); c.z -= s.nz * k * Math.min(1, 6 * dt); } } }
    { const b = s && s.S.kind === 'b' ? s.S : null; if (b && c.y > 0.4) { if (G.bermOn !== b) { G.bermOn = b; G.bermT = 0; } G.bermT += dt; } else if (G.bermOn && (!s || s.S !== G.bermOn)) { const bb = G.bermOn; G.bermOn = null; if (G.bermT > 0.5) { addMove('BERM', 60); c.speed = Math.min(27, c.speed + 2); if (!bb.done) { bb.done = true; if (inSchool('berms')) lesCount(); } } } }
    // takeoff / landing
    if (P.g && !c.ground && !A) A = { t: 0, vert: false, tricks: 0, kick: null, y0: Math.max(P.y, c.y), peak: c.y };
    if (A && !c.ground) { A.t += dt; A.peak = Math.max(A.peak, c.y); if (A.vert) { const p = A.t / A.dur; G.vslip = -Math.PI * (1 - sstep(0, 0.8, p)); c.pitch = 0; c.x -= A.nx * 0.6 * dt; c.z -= A.nz * 0.6 * dt; } }
    if (!P.g && c.ground && A) { const a = A; A = null;
      if (T && !T.held && T.target - T.rot < TAU * 0.3) completeTrick();
      if (T) crash(); else {
        if (a.vert) { c.speed = a.spd * 0.95; addMove('AIR ' + Math.max(0, a.peak - a.y0).toFixed(1) + ' M', Math.round(60 + (a.peak - a.y0) * 20)); }
        else if (a.kick) { const k = a.kick, u = (c.x - k.o.x) * k.fx + (c.z - k.o.z) * k.fz; if (u > k.gapA + 0.5 && u < k.gapB - 0.5 && c.y < 0.3) crash('CASED IT'); else { addMove(a.t > 1 ? 'BIG AIR' : 'AIR', a.t > 1 ? 90 : 50); if (k === DBL && inSchool('double')) lesCount(); if (inSchool('flip') && (a.flips || 0) > 0) { for (let i = 0; i < a.flips; i++) lesCount(); } } }
        else if (a.t > 0.9) addMove('BIG AIR', 50); if (!a.kick && inSchool('flip') && (a.flips || 0) > 0) for (let i = 0; i < a.flips; i++) lesCount(); }
      G.vslip = 0; }
    if (c.ground && A && !A.vert) A = null;
    // tricks
    if (T) { const rate = T.kind === 'flip' ? TAU / 0.55 : TAU / 0.45; if (T.held || T.rot < T.target) T.rot += dt * rate; if (!T.held && T.rot >= T.target) completeTrick(); else if (T.kind === 'flip') { c.pitch = T.base + T.rot; G.spin = 0; } else G.spin = T.rot; }
    if (G.bail) { G.bail.t += dt; const t = G.bail.t; V.body.rotation.z = -Math.sin(Math.min(1, t / 0.25) * Math.PI / 2) * 1.1 * (t < 0.7 ? 1 : Math.max(0, 1 - (t - 0.7) / 0.3)); c.speed = damp(c.speed, 0, 4, dt); if (t >= 1.2) { G.bail = null; V.body.rotation.z = 0; } }
    G.vslip = A && A.vert ? G.vslip : damp(G.vslip || 0, 0, 6, dt); c.slip = (G.vslip || 0) + G.spin;
    // engine events: drift boost, nitro
    if (G.prevDrift > 0.8 && !(c.drift > 0)) { addMove('DRIFT', 80); if (inSchool('drift') && Math.abs(c.x - AC.x) < 36 && Math.abs(c.z - AC.z) < 36) lesCount(); } G.prevDrift = c.drift || 0;
    const busy = !c.ground || T || (c.drift > 0); if (CB.n && !busy) { CB.idle += dt; if (CB.idle > 1.6) bank(); }
    // gates, speed trap
    for (const g of GATES) if (!g.done && P.z < g.z && c.z >= g.z && Math.abs(c.x - g.x) < 2.4) { g.done = true; g.ln.material.color.setHex(0x22c55e); X.popup(tmp.set(g.x, 2.4, g.z), 'GATE', '#22c55e'); if (inSchool('gates')) lesCount(); }
    if (P.z < TRAP.z1 && c.z >= TRAP.z1 && Math.abs(c.x - AC.x) < 9.5) { const kmh = Math.abs(c.speed) * 3.6; flash('SPEED TRAP · ' + Math.round(kmh) + ' KM/H', kmh >= 100 ? '#22c55e' : '#ffffff', 2); if (kmh >= 100) { addMove('100 CLUB', 150); if (inSchool('nitro')) lesCount(); } else if (inSchool('nitro')) radio(Math.round(kmh) + '? My nan rides faster. Nitro on 2, kid.', 4); }
    // race laps + ranking
    if (G.place === 'race') { const th = thOf(c.x, c.z); let d = wrap(th - G.thPrev); if (Math.abs(d) < 0.5) G.prog += d / TAU; G.thPrev = th; G.lapT += dt;
      const lap = Math.floor(G.prog + 1e-6); if (lap > (G.lap || 0)) { G.lap = lap; if (G.lapT > 5 && (!G.lapBest || G.lapT < G.lapBest)) G.lapBest = G.lapT; if (lap < 3) { banner(lap === 2 ? 'FINAL LAP' : 'LAP ' + (lap + 1) + ' / 3', 2.4); X.audio.tone(990, 0.2, 0.05, 'square', 1.2); } G.lapT = 0; }
      G.rank = 1 + RIV.filter(R0 => (R0.done != null ? 3 : R0.prog) > G.prog).length;
      if (G.prog >= 3) { G.finishT += dt; if (G.finishT > 0.01 && !G.ending) { G.ending = 1; flash(G.rank === 1 ? 'YOU WIN!' : 'FINISHED P' + G.rank, G.rank === 1 ? '#ffd23a' : '#ffffff', 2.4); } if (c.ground || G.finishT > 2) finish(); } }
    if (G.place === 'contest' && G.t >= 60) { if (!G.ending) { flash('TIME!', '#ffd23a', 2); X.audio.tone(330, 0.5, 0.06, 'square', 0.6); } G.ending += dt; if ((c.ground && !T) || G.ending > 2.5) finish(); }
    snapP(); }

  // ---------- HUD ----------
  const _pv = new THREE.Vector3();
  function hud() { const pd = PL(), live = G.phase === 'run', c = C(); let goal = null;
    if (live && !DM.on) { const n = nextGoal(); if (n) { const dd = Math.hypot(c.x - n.x, c.z - n.z); if (dd > 7) { _pv.set(n.x, 1, n.z).project(X.camera); goal = { nx: _pv.x, ny: _pv.y, behind: _pv.z > 1, label: n.label, dist: Math.round(dd) }; } } }
    const bests = PLACES.map(p => { try { return save.stat('luxor.moto.' + p.id + '.best', 0); } catch (e) { return 0; } });
    const id = G.place, sch = id === 'school', L = LESSONS[G.les], left = Math.max(0, 60 - G.t), kmh = Math.round(Math.abs(c.speed) * 3.6);
    let trickTxt = kmh + ' KM/H', trickCol = '#7dd3fc';
    if (G.bail) { trickTxt = 'CRASH'; trickCol = '#ec3013'; } else if (T) { const L2 = T.kind === 'flip' ? FLIPS : SPINS, lv = Math.min(L2.length, Math.max(1, T.held ? Math.ceil(T.rot / TAU + 0.001) : Math.round(T.target / TAU))); trickTxt = (T.held ? 'LET GO · ' : '') + L2[lv - 1][0]; trickCol = '#ffd23a'; }
    else if (!c.ground) { trickTxt = 'AIR · 2 SPIN · 3 FLIP'; trickCol = '#ffd23a'; } else if (c.drift > 0) { trickTxt = c.drift > 0.8 ? 'DRIFT · READY' : 'DRIFTING'; trickCol = '#ffd23a'; } else if (c.nitro > 0) { trickTxt = 'NITRO · ' + kmh + ' KM/H'; trickCol = '#38bdf8'; }
    const progress = sch ? (G.nextT ? 'LESSON ' + (G.les + 1) + ' PASSED' : (G.les + 1) + ' · ' + L.name + ' · ' + G.cnt + ' / ' + L.need + ' ' + L.unit) : id === 'race' ? 'LAP ' + Math.min(3, (G.lap || 0) + 1) + ' / 3 · P' + G.rank + ' / 4' : 'BEST COMBO ' + (G.bestCombo || 0);
    return { state: G.phase === 'ready' ? 'ready' : 'run', phase: G.phase, board: G.board, done: G.done, place: id, placeName: pd.name, room: pd.room, target: pd.target,
      time: fmtT(sch ? G.t + G.pen : id === 'race' ? G.t : left), over: sch && G.t + G.pen > pd.target, low: id === 'contest' && left < 10,
      targetLbl: sch ? 'TARGET' : id === 'race' ? 'POSITION' : 'CHAMPION', targetTxt: sch ? fmtT(pd.target).slice(0, -2) + '.0' : id === 'race' ? 'P' + G.rank + ' / 4' : String(TROPHY_SCORE),
      pts: Math.round(G.pts), comboN: CB.n, comboPot: CB.pot, comboK: CB.n ? Math.max(0, 1 - CB.idle / 1.6) : 0, progress,
      les: sch ? G.les + (G.nextT ? 1 : 0) : 0, lesOf: LESSONS.length, banner: G.banner, radio: G.radio, radioWho: 'BIG PAPPA', flash: G.flash, count: G.phase === 'count' ? Math.ceil(G.count) : null, goal, bests, trickTxt, trickCol,
      bestTrick: G.bestTrick ? G.bestTrick.name : '—', quest: sch ? 'Lesson ' + (G.les + 1) + ': ' + L.quest : pd.goal, crashes: G.crashes,
      demo: DM.on ? { cap: DM.cap, key: (DEMO[DM.i] || {}).key || '', n: DM.i + 1, of: DEMO.length } : null }; }

  // ---------- DEMO ----------
  const DM = { on: false, i: 0, t: 0, dt: 0, cap: '', f: {} };
  const steerTo = (tx, tz, th = 1) => { const c = C(), d = wrap(Math.atan2(tx - c.x, tz - c.z) - c.yaw); X.drive(th, clamp(-d * 2.5, -1, 1)); };
  const tap = n => { X.press(n, true); X.press(n, false); };
  const go = (les, x, z, yaw, sp) => { G.place = 'school'; G.phase = 'run'; lesEnter(les, true); tp(cx(x), cz(z), yaw); C().speed = sp; DM.f = {}; };
  const DEMO = [
    { d: 4.4, key: 'STICK', cap: 'STICK = THROTTLE + STEER. WEAVE THROUGH THE CONE GATES', on() { resetRun(); go(0, 0, 38, 0, 8); }, tick() { const g = GATES.find(q => !q.done) || GATES[5]; steerTo(g.x, g.z + 1.5, 0.8); } },
    { d: 4.4, key: 'STICK', cap: 'FAST + FULL LOCK + THROTTLE = DRIFT. HOLD IT AND IT BOOSTS YOU', on() { go(1, 10, -26, -Math.PI / 2, 16); }, tick() { const c = C(); if (c.x > cx(-20)) X.drive(1, 0); else X.drive(1, 1); } },
    { d: 4.4, key: '2', cap: 'TAP 2 FOR NITRO. CLEAR THE BIG DOUBLE', on() { go(3, 72, 0, Math.PI / 2, 18); }, tick() { X.drive(1, 0); if (DM.t > 0.3 && !DM.f.a) { DM.f.a = 1; tap(2); } } },
    { d: 4.6, key: '3', cap: 'IN THE AIR, TAP 3 = BACKFLIP. HOLD 3 = MORE FLIPS. LET GO BEFORE YOU LAND', on() { go(4, 118, 0, Math.PI / 2, 22); }, tick() { const c = C(); X.drive(1, 0); if (!c.ground && A && A.kick && !DM.f.a) { DM.f.a = 1; tap(3); } } },
    { d: 4, key: '2', cap: 'IN THE AIR, 2 = SPIN. 360, HOLD FOR 720 AND UP', on() { go(4, 118, 0, Math.PI / 2, 22); }, tick() { const c = C(); X.drive(1, 0); if (!c.ground && A && A.kick && !DM.f.a) { DM.f.a = 1; tap(2); } } },
    { d: 4.2, key: '1', cap: 'TAP 1: THE SCATTER GUN FINDS THE NEAREST BOT. THEY STAY OFF THE ROAD', on() { go(5, -40, 6, -Math.PI / 2, 10); }, tick() { X.drive(0.6, 0); if (DM.t > 0.8 && !DM.f.a) { DM.f.a = 1; tap(1); } if (DM.t > 1.8 && !DM.f.b) { DM.f.b = 1; tap(1); } if (DM.t > 2.8 && !DM.f.c) { DM.f.c = 1; tap(1); } } },
    { d: 3.6, key: '!', cap: 'MUD AND WHOOPS: KEEP THE THROTTLE ON. LAVA = CRASH, +3 S, BACK ON TRACK', on() { go(8, 0, -36, Math.PI, 12); }, tick() { X.drive(1, 0); } },
    { d: 3.6, key: 'GO', cap: 'THEN THE VOLCANO RUN (3 LAPS VS CINDER) AND THE CINDER PIT TRICK CONTEST', on() { G.place = 'race'; G.phase = 'run'; raceStart(); C().speed = 0; }, tick() { X.drive(0, 0); } }];
  function demoStep(dt) { const s = DEMO[DM.i]; DM.dt = dt; DM.t += dt; if (s.tick) s.tick(dt); G.radio = ''; if (DM.t >= s.d) { DM.i++; DM.t = 0; if (DM.i >= DEMO.length) return demoStop(); const n = DEMO[DM.i]; DM.cap = n.cap; n.on && n.on(); } }
  function demoStart() { X.audio.init && X.audio.init(); DM.on = true; DM.i = 0; DM.t = 0; DM.cap = DEMO[0].cap; G.board = false; G.done = null; X.setPaused(false); DEMO[0].on(); }
  function demoStop() { DM.on = false; DM.cap = ''; X.drive(0, 0); resetRun(); G.place = 'school'; G.phase = 'ready'; tp(cx(0), cz(36), 0); G.board = true; X.setPaused(true); }

  // ---------- API ----------
  const course = {
    start: { x: cx(0), z: cz(36), yaw: 0 }, stick: true, groundH, update, hud, onSmash, boardURL: '', boardURLP: '',
    press(n, down) { if (G.board || G.done || G.phase !== 'run') return true; if (G.bail) return true; const c = C(); if (n === 1 && down) gunAssist(); if ((n === 2 || n === 3) && (!c.ground || (T && !down))) { airBtn(n === 3 ? 'flip' : 'spin', down); return true; } return false; },
    map: () => ({ b: [['Pappa', PAPPAS[0].position.x, PAPPAS[0].position.z]], l: LAMPS, t: [], e: [...CREAT.filter(o => !o.dead).map(o => [o.x, o.z]), ...(G.place === 'race' ? RIV.map(R0 => [R0.g.position.x, R0.g.position.z]) : [])], r: Array.from({ length: 48 }, (_, i) => { const p = TP(i / 48 * TAU); return [p.x, p.z]; }), rc: true, q: (() => { const n = G.phase === 'run' && nextGoal(); return n ? [n.x, n.z, n.label] : null; })(), g: (() => { const n = G.phase === 'run' && nextGoal(); return n ? [n.x, n.z] : null; })() }),
    reset() { if (G.phase !== 'run' || DM.on) return; tp(...(G.place === 'school' ? G.cp : G.lastSafe || G.cp)); if (G.place === 'race') G.thPrev = thOf(C().x, C().z); flash('BACK ON TRACK', '#ffffff', 1.2); },
    rollOut, demoStart, demoStop, finish, say: s => flash(s, '#ffffff', 2),
    openBoard() { if (DM.on) return; G.board = true; X.setPaused(true); if (G.phase === 'done') G.done = null; },
    closeBoard() { G.board = false; if (G.phase === 'run' || G.phase === 'count') X.setPaused(false); },
    preview() {},
    _les(i) { G.board = false; X.setPaused(false); G.place = 'school'; G.phase = 'run'; lesEnter(i); }, _dbg: () => ({ A: A ? { kick: !!A.kick, flips: A.flips || 0, t: +A.t.toFixed(2) } : null, T: T ? T.kind + ':' + T.rot.toFixed(1) + '/' + T.target.toFixed(1) : null, phase: G.phase, place: G.place, les: G.les, cnt: G.cnt, pts: G.pts, combo: CB.n, x: +C().x.toFixed(2), z: +C().z.toFixed(2), y: +C().y.toFixed(2), sp: +C().speed.toFixed(2), yaw: C().yaw, ground: C().ground, trick: T ? +T.rot.toFixed(2) : null, pen: G.pen, kos: G.kos, prog: +G.prog.toFixed(3), rank: G.rank, riv: RIV.map(R0 => +R0.prog.toFixed(3)), drift: C().drift || 0 }) };
  X.setPaused(true);
  setTimeout(paintBoards, 30); setTimeout(() => document.fonts && document.fonts.load('700 50px "Caveat"').then(() => paintBoards()).catch(() => {}), 1500);
  return course;
}
