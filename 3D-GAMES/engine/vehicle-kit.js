// 8 GATES — VEHICLES. Models + driving specs. vehicleKit({ THREE, M, toon }).make(key) → Group with userData.V:
//   { spec, wheels: [{ g, r, front, side }], steer: [groups], seat: Vector3 (rider root, vehicle space), turret, barrel, muzzle, exhaust, body (sprung part) }
// Ben's order + weapons (one vehicle per message, full polish): 1 tank (ROCKET LAUNCHER) · 2 moto (scatter gun) · 3 truck (fireballs like the staff)
// · 4 racecar (battering ram) · 5 mech (Noble's MECH WALKER, smashes with big arms) · 6 boat · 7 bike (laser). These live in the test workshop.
export const VEHICLES = {
  tank: { name: 'TANK', built: true, max: 11, rev: 5, accel: 7, turn: 1.5, pivot: true, grip: 1, jump: 0, r: 2.6, cam: [11, 0.44], btn: ['ROCKETS', 'CANNON', 'TURBO'], line: 'Turns on the spot. 1 rocket, hold 1 = 4-rocket salvo (blast + 3 s of fire). 2 main cannon. 3 turbo. The turret aims itself.' },
  moto: { name: 'MOTORCYCLE', built: true, scale: 1.3, max: 27, rev: 4, accel: 17, turn: 2.6, grip: 0.9, jump: 7, lean: 0.8, r: 0.9, cam: [6.8, 0.28], btn: ['SCATTER', 'NITRO', 'HOP·FLIP'], line: '1 scatter gun (5 short beams, hold = 9-beam blast that shoves cars). 2 nitro wheelie. 3 hop, 3 again in the air = backflip. Turn hard at speed to drift: hold it for a DRIFT BOOST.' },
  truck: { name: 'MONSTER TRUCK', built: true, max: 19, rev: 6, accel: 10, turn: 1.9, grip: 0.8, jump: 0, r: 2.1, crush: true, cam: [10.5, 0.38], btn: ['FIRE', 'OIL', 'NITRO'], line: 'Drives over cars and flattens them. 1 fireball from the roof cannon (explodes like the staff), 2 drop an oil slick (10 s, walkers slip and fall), 3 nitro. No jumping.' },
  skate: { name: 'SKATEBOARD', built: true, scale: 2.5, max: 13, rev: 3, accel: 8, turn: 3.0, grip: 1, jump: 7, lean: 0.35, r: 1.2, cam: [7.2, 0.32], btn: ['WHACK', 'TRICK', 'OLLIE'], line: 'Push to roll. 1 BOARD WHACK (pop the board up and swing it round: hits all round). 2 TRICK: in the air = kickflip (land it for points), on the ground = manual. 3 OLLIE. Land on a yellow rail to GRIND.' },
  jetski: { name: 'JET SKI', built: true, water: true, scale: 1.56, max: 24, rev: 4, accel: 14, turn: 2.7, grip: 0.85, jump: 6.5, lean: 0.55, r: 1.1, cam: [7.5, 0.3], btn: ['HOSE', 'TRICK', 'HOP'], line: 'Lives in the lake (corner of the yard). Carves, bounces on waves, leaves a wake. 1 WATER CANNON (hold = stream: soaks walkers, shoves cars, puts out fires). 2 TRICK: air = barrel roll, water = spin-out splash. 3 hop. Hit the floating kicker for big air.' },
  surf: { name: 'SURFBOARD', built: true, water: true, scale: 1.75, max: 19, rev: 1, accel: 5, turn: 3.1, grip: 0.8, jump: 6, lean: 0.75, r: 0.8, cam: [6.5, 0.35], btn: ['CARVE', 'TRICK', 'HOP'], line: 'Paddle out into the lake and catch the swell that rolls across it every few seconds. Ride the face for speed + points. 1 CARVE = cutback that throws a spray wall (soaks anyone near). 2 TRICK: air = 360, water = hold to HANG TEN. 3 hop (higher off a wave crest).' },
  chute: { name: 'PARACHUTE', built: true, fly: true, scale: 1, max: 6, rev: 1, accel: 4, turn: 1.4, grip: 1, jump: 0, lean: 0.6, r: 0.8, cam: [10, 0.3], btn: ['BALLOON', 'TRICK', 'PULL · FLARE'], line: 'Jump from 45 m. Freefall, then 3 = PULL the chute (auto-pulls at 7 m). Steer down onto the red TARGET: dead centre +100. Hold 3 just before touchdown = FLARE. 1 water balloons, 2 tap = swing, hold = spiral. On the ground, 3 = jump again.' },
  glider: { name: 'HANG GLIDER', built: true, fly: true, scale: 1, max: 18, rev: 1, accel: 4, turn: 2.6, grip: 1, jump: 0, lean: 0.15, r: 0.8, cam: [12, 0.3], btn: ['BALLOON', 'TRICK', 'TOW · FLARE'], line: 'Starts on the LAUNCH HILL: run off the red lip (or 3 = tow launch). Fast and agile: banks hard, carves tight turns. Stick forward = dive for speed, back = slow and float. Ride the THERMALS to climb. 1 water balloons, 2 tap = WINGOVER, hold = SPIRAL. Hold 3 in the air = FLARE to land.' },
  pogo: { name: 'POGO STICK', built: true, scale: 1, max: 7, rev: 2, accel: 9, turn: 3, grip: 1, jump: 0, lean: 0, r: 0.5, cam: [6, 0.3], btn: ['STOMP', 'FLIP', 'SUPER'], line: 'Never stops bouncing. Stick = hop around. 1 STOMP: slam down, the shockwave knocks over everyone nearby and smashes crates. 2 BACKFLIP in the air (+60; land it or wipe out). Hold 3 to wind up, release = SUPER BOING (up to 3x higher). Land on heads = HEAD BOUNCE.' },
  heli: { name: 'HELICOPTER', built: true, fly: true, pivot: true, scale: 1.4, max: 22, rev: 8, accel: 10, turn: 1.7, grip: 1, jump: 0, lean: 0.32, r: 3.0, cam: [16, 0.36], btn: ['GUN', 'MISSILE', 'UP'], line: 'Flies. Stick: forward/back + turn. Hold 3 = climb (let go = hover), tap 3 = land. 1 chin minigun (hold = auto), 2 homing missiles from the stub wings. Low flying blows dust and pushes walkers.' },
  racecar: { name: 'RACECAR', built: true, max: 36, rev: 6, accel: 21, turn: 2.35, grip: 1, jump: 0, r: 1.25, cam: [7.2, 0.24], btn: ['RAM', 'LASER', 'NITRO'], line: 'Fastest thing in the yard. 1 BATTERING RAM punch (hold 1 = RAM CHARGE, launches anything in front). 2 twin lasers (hold to keep firing). 3 nitro, hold 3 = handbrake drift (release for a boost). Laps on the red ring are timed.' }, mech: { name: "NOBLE'S MECH WALKER", built: true, walker: true, pivot: true, max: 8, rev: 3.5, accel: 6, turn: 1.5, grip: 1, jump: 0, r: 2.1, cam: [14, 0.38], btn: ['SMASH', 'LASERS', 'THRUST'], line: 'Noble pilots it from his chair. 1 punch combo: left, right, UPPERCUT (launches). Hold 1 = arm SPIN (hits all round). 2 TWIN LASER TURRET on the roof (aims itself, hold to keep firing). 3 thruster leap.' }, boat: { name: 'SPEEDBOAT', built: false }, bike: { name: 'MOUNTAIN BIKE', built: true, scale: 1.3, max: 15, rev: 3, accel: 11, turn: 3.2, grip: 1, jump: 7.5, lean: 0.7, r: 0.8, cam: [6.2, 0.3], btn: ['LASER', 'TRICK', 'HOP'], line: 'Pedal power: nimble, sharp turns, big air. 1 handlebar LASER (hold = charged beam that pierces). 2 TRICK: in the air = 360 spin, on the ground = wheelie. 3 bunny hop (higher when you pedal hard).' },
};
export function vehicleKit({ THREE, M, toon }) {
  const outlineMat = () => (outlineMat.m = outlineMat.m || new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide }));
  const ink = toon('#201e1d'), tyre = toon('#1f2023'), steel = toon('#9ca3af'), chrome = toon('#e5e7eb');
  const lit = c => new THREE.MeshBasicMaterial({ color: c });
  function wheel(parent, r, w, x, y, z, rim = steel, spokes = 0, tread = 0) {
    const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); const sp = new THREE.Group(); g.add(sp);
    const t = M(new THREE.CylinderGeometry(r, r, w, 22), tyre, 0, 0, 0, sp, 0.03, r); t.rotation.z = Math.PI / 2;
    const h = M(new THREE.CylinderGeometry(r * 0.55, r * 0.55, w + 0.02, 16), rim, 0, 0, 0, sp, 0); h.rotation.z = Math.PI / 2;
    for (let i = 0; i < spokes; i++) { const s = M(new THREE.BoxGeometry(w * 0.3, r * 1.0, 0.03), rim, Math.sign(x || 1) * w * 0.4, 0, 0, sp, 0); s.rotation.x = i / spokes * Math.PI; }
    for (let i = 0; i < tread; i++) { const q = i / tread * Math.PI * 2, b = M(new THREE.BoxGeometry(w * 1.02, r * 0.12, r * 0.22), tyre, 0, Math.cos(q) * r, Math.sin(q) * r, sp, 0); b.rotation.x = -q; }
    return { g, sp, r };
  }
  function trackTex() { const c = document.createElement('canvas'); c.width = 64; c.height = 32; const g = c.getContext('2d'); g.fillStyle = '#1f2023'; g.fillRect(0, 0, 64, 32); g.fillStyle = '#4b5563'; g.fillRect(4, 0, 18, 32); g.fillStyle = '#2f3237'; g.fillRect(36, 0, 6, 32); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
  function tank() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body };
    const olive = toon('#5b6b3a'), oliveD = toon('#3f4a28'), sand = toon('#b8a77a');
    M(new THREE.BoxGeometry(2.7, 0.75, 4.4), olive, 0, 1.0, 0, body, 0.04);
    M(new THREE.BoxGeometry(2.5, 0.35, 1.0), oliveD, 0, 0.75, 2.45, body, 0.03).rotation.x = -0.5;
    M(new THREE.BoxGeometry(2.6, 0.08, 4.2), sand, 0, 1.4, 0, body, 0);
    for (const s of [-1, 1]) {
      const tm = new THREE.MeshToonMaterial({ map: trackTex(), gradientMap: ink.gradientMap }); tm.map.repeat.set(7, 1); (V.trackMats = V.trackMats || []).push(tm);
      M(new THREE.BoxGeometry(0.62, 0.95, 4.9), tm, s * 1.5, 0.55, 0, body, 0.03);
      M(new THREE.BoxGeometry(0.08, 0.42, 4.3), olive, s * 1.83, 0.82, 0, body, 0.015);
      M(new THREE.BoxGeometry(0.66, 0.1, 4.6), olive, s * 1.5, 1.08, 0, body, 0.02);
      for (let i = 0; i < 6; i++) V.wheels.push({ ...wheel(body, 0.3, 0.5, s * 1.5, 0.38, -1.9 + i * 0.76, toon('#4b5563')), side: s });
      for (const z of [-2.1, -0.7, 0.7, 2.1]) M(new THREE.BoxGeometry(0.06, 0.1, 0.3), olive, s * 1.36, 1.2, z, body, 0);
    }
    const turret = new THREE.Group(); turret.position.set(0, 1.42, -0.2); body.add(turret); V.turret = turret;
    M(new THREE.CylinderGeometry(1.0, 1.15, 0.6, 20), olive, 0, 0.3, 0, turret, 0.035, 1.15);
    M(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16), oliveD, -0.35, 0.66, -0.2, turret, 0.02, 0.42);
    const mant = new THREE.Group(); mant.position.set(0, 0.32, 0.9); turret.add(mant); V.barrel = mant;
    M(new THREE.BoxGeometry(0.5, 0.42, 0.4), oliveD, 0, 0, 0, mant, 0.025);
    const b = M(new THREE.CylinderGeometry(0.11, 0.13, 2.6, 12), olive, 0, 0, 1.4, mant, 0.02, 0.13); b.rotation.x = Math.PI / 2;
    M(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 12), oliveD, 0, 0, 2.6, mant, 0.02, 0.17).rotation.x = Math.PI / 2;
    const mz = new THREE.Object3D(); mz.position.set(0, 0, 2.8); mant.add(mz); V.muzzle = mz;
    // ROCKET LAUNCHER: a 4-tube pod on the turret's right cheek, pitches up to fire
    const pod = new THREE.Group(); pod.position.set(1.12, 0.42, 0.05); turret.add(pod); V.pod = pod; V.podMuzzles = []; V.podTubes = [];
    M(new THREE.BoxGeometry(0.62, 0.62, 1.05), oliveD, 0, 0, 0, pod, 0.03); M(new THREE.BoxGeometry(0.64, 0.08, 1.07), toon('#ec3013'), 0, 0.2, 0, pod, 0);
    M(new THREE.BoxGeometry(0.14, 0.3, 0.5), olive, -0.38, -0.1, -0.1, pod, 0.015);
    for (const [x, y] of [[-0.14, 0.13], [0.14, 0.13], [-0.14, -0.15], [0.14, -0.15]]) { const t = M(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 14), ink, x, y, 0.53, pod, 0); t.rotation.x = Math.PI / 2; const tip = M(new THREE.ConeGeometry(0.075, 0.16, 12), toon('#ec3013'), x, y, 0.5, pod, 0.008); tip.rotation.x = Math.PI / 2; V.podTubes.push(tip); const mz = new THREE.Object3D(); mz.position.set(x, y, 0.7); pod.add(mz); V.podMuzzles.push(mz); }
    // antenna whip (4 links) + headlights
    V.antenna = []; { let p = turret; const base = new THREE.Group(); base.position.set(-0.75, 0.6, -0.65); turret.add(base); p = base; for (let i = 0; i < 4; i++) { const g = new THREE.Group(); g.position.y = i ? 0.42 : 0; p.add(g); M(new THREE.CylinderGeometry(0.018 - i * 0.003, 0.02 - i * 0.003, 0.44, 5), ink, 0, 0.21, 0, g, 0); V.antenna.push(g); p = g; } M(new THREE.SphereGeometry(0.04, 8, 6), toon('#ec3013'), 0, 0.44, 0, p, 0); }
    for (const sx of [-1, 1]) { M(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 14), oliveD, sx * 0.95, 1.25, 2.2, body, 0.012, 0.12).rotation.x = Math.PI / 2; const hl = M(new THREE.CircleGeometry(0.09, 14), lit('#fff7cc'), sx * 0.95, 1.25, 2.26, body, 0); }
    const mg = new THREE.Group(); mg.position.set(0.45, 0.7, 0.2); turret.add(mg); const mb = M(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), ink, 0, 0, 0.35, mg, 0.01); mb.rotation.x = Math.PI / 2; const mz2 = new THREE.Object3D(); mz2.position.set(0, 0, 0.75); mg.add(mz2); V.muzzle2 = mz2;
    const ex = new THREE.Object3D(); ex.position.set(0.8, 1.2, -2.3); body.add(ex); V.exhaust = ex;
    V.seat = new THREE.Vector3(-0.35, 1.42 + 0.66 - 0.95, -0.4); V.seatParent = turret; V.seatLocal = new THREE.Vector3(-0.35, 0.66 - 1.05, -0.2); V.pose = 'hatch';
    root.userData.V = V; return root;
  }
  function moto() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body };
    const red = toon('#ec3013'), dark = toon('#2a2826');
    V.wheels.push({ ...wheel(body, 0.38, 0.16, 0, 0.38, -0.78, chrome, 6), side: 0 });
    const fork = new THREE.Group(); fork.position.set(0, 0.95, 0.62); body.add(fork); V.steer.push(fork);
    const fw = wheel(fork, 0.38, 0.14, 0, -0.57, 0.18, chrome, 6); V.wheels.push({ ...fw, side: 0, front: true });
    for (const s of [-1, 1]) { const f = M(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8), chrome, s * 0.1, -0.25, 0.08, fork, 0.008); f.rotation.x = 0.25; }
    const bar = M(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8), ink, 0, 0.12, -0.05, fork, 0.008); bar.rotation.z = Math.PI / 2;
    for (const s of [-1, 1]) M(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 8), dark, s * 0.36, 0.12, -0.05, fork, 0.008).rotation.z = Math.PI / 2;
    M(new THREE.SphereGeometry(0.12, 12, 10), chrome, 0, -0.05, 0.16, fork, 0.012, 0.12); M(new THREE.CircleGeometry(0.09, 14), lit('#fff7cc'), 0, -0.05, 0.28, fork, 0);
    M(new THREE.SphereGeometry(0.26, 14, 10), red, 0, 0.9, 0.25, body, 0.02, 0.26).scale.set(0.95, 0.75, 1.35);
    M(new THREE.BoxGeometry(0.28, 0.12, 0.7), dark, 0, 0.86, -0.32, body, 0.015);
    M(new THREE.BoxGeometry(0.34, 0.36, 0.5), toon('#4b5563'), 0, 0.5, 0.05, body, 0.02);
    const fr = M(new THREE.CylinderGeometry(0.045, 0.045, 1.25, 8), red, 0, 0.62, -0.1, body, 0.01); fr.rotation.x = Math.PI / 2 - 0.35;
    const sw = M(new THREE.CylinderGeometry(0.035, 0.035, 0.85, 8), chrome, 0.12, 0.5, -0.45, body, 0.008); sw.rotation.x = Math.PI / 2 + 0.35;
    const pipe = M(new THREE.CylinderGeometry(0.06, 0.07, 0.8, 10), chrome, 0.2, 0.36, -0.55, body, 0.01); pipe.rotation.x = Math.PI / 2 + 0.12;
    M(new THREE.BoxGeometry(0.2, 0.05, 0.3), red, 0, 0.84, -0.72, body, 0.01);
    const ex = new THREE.Object3D(); ex.position.set(0.2, 0.32, -0.98); body.add(ex); V.exhaust = ex;
    // SCATTER GUN: a 5-barrel fan block under the headlight, swivels toward the target
    const gun = new THREE.Group(); gun.position.set(0, 0.62, 0.62); body.add(gun); V.gun = gun;
    M(new THREE.BoxGeometry(0.36, 0.14, 0.34), toon('#334155'), 0, 0, 0.05, gun, 0.012); M(new THREE.BoxGeometry(0.38, 0.03, 0.36), toon('#ec3013'), 0, 0.08, 0.05, gun, 0);
    for (let i = -2; i <= 2; i++) { const b = M(new THREE.CylinderGeometry(0.022, 0.022, 0.32, 6), chrome, i * 0.065, 0, 0.32, gun, 0.006); b.rotation.x = Math.PI / 2; b.rotation.z = 0; b.rotation.y = i * 0.08; }
    const gm = new THREE.Object3D(); gm.position.set(0, 0, 0.5); gun.add(gm); V.muzzle = gm;
    M(new THREE.BoxGeometry(0.16, 0.06, 0.04), lit('#ff2a1a'), 0, 0.85, -0.88, body, 0.006); V.tail = new THREE.Object3D(); V.tail.position.set(0, 0.85, -0.92); body.add(V.tail);
    M(new THREE.BoxGeometry(0.2, 0.14, 0.02), toon('#f3f2f2'), 0, 0.68, -0.93, body, 0.006); V.head = new THREE.Object3D(); V.head.position.set(0, 0.9, 0.95); body.add(V.head);
    V.seat = new THREE.Vector3(0, 0.28, -0.28); V.pose = 'moto'; root.userData.V = V; return root;
  }
  // HOT-ROD FLAMES: classic licks that start at the nose and stream back, yellow core → orange → red, with a pinstripe outline,
  // painted on a canvas the size of the body side so they read as paint, not a sticker.
  function flameTex(flip) {
    const W = 1024, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = '#ec3013'; g.fillRect(0, 0, W, H);
    // bold hot-rod licks: each tongue is a fat teardrop from the nose (right) sweeping back (left) with an S-curve to a sharp tip
    const T = [[0.2, 0.42, 0.06, 0.42], [0.38, 0.7, 0.22, 0.5], [0.56, 0.95, 0.46, 0.52], [0.72, 0.66, 0.8, 0.46], [0.86, 0.38, 0.97, 0.36]];   // [rootY, reach (×W), tipY, thickness (×H)]
    const tongue = (ry, reach, ty, th, sc) => { const x0 = W * 1.02, tx = W * (1 - reach * sc), half = H * th * 0.5 * sc, mx = (x0 + tx) / 2, wob = (ty - ry) * H;
      g.moveTo(x0, H * ry - half); g.bezierCurveTo(mx + W * 0.1, H * ry - half * 1.2, mx - W * 0.05, H * ty - half * 0.2 - wob * 0.3, tx, H * ty);
      g.bezierCurveTo(mx - W * 0.02, H * ty + half * 0.9 - wob * 0.2, mx + W * 0.12, H * ry + half * 1.1, x0, H * ry + half); g.closePath(); };
    const all = sc => { g.beginPath(); T.forEach(t => tongue(...t, sc)); };
    g.lineJoin = 'round'; all(1); g.lineWidth = 16; g.strokeStyle = '#201e1d'; g.stroke(); all(1); g.lineWidth = 7; g.strokeStyle = '#7dd3fc'; g.stroke();
    const gr = g.createLinearGradient(W, 0, W * 0.15, 0); gr.addColorStop(0, '#ffe14a'); gr.addColorStop(0.3, '#ffc21a'); gr.addColorStop(0.6, '#ff8a1a'); gr.addColorStop(0.9, '#ff5a1a'); gr.addColorStop(1, '#f2401a');
    all(1); g.fillStyle = gr; g.fill();
    const g2 = g.createLinearGradient(W, 0, W * 0.45, 0); g2.addColorStop(0, 'rgba(255,250,210,0.9)'); g2.addColorStop(0.5, 'rgba(255,230,120,0.45)'); g2.addColorStop(1, 'rgba(255,210,58,0)'); all(0.55); g.fillStyle = g2; g.fill();
    const sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(255,255,255,0.3)'); sh.addColorStop(0.16, 'rgba(255,255,255,0)'); sh.addColorStop(0.75, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.2)'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
    g.fillStyle = '#201e1d'; g.beginPath(); g.arc(W * 0.12, H * 0.5, 60, 0, 7); g.fill(); g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(W * 0.12, H * 0.5, 51, 0, 7); g.fill();
    g.fillStyle = '#201e1d'; g.font = '900 84px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', W * 0.12, H * 0.54);
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; if (flip) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; } return t; }
  function flameHood() {   // flames on the hood too, licking back from the grille
    const W = 512, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.fillStyle = '#ec3013'; g.fillRect(0, 0, W, H);
    const xs = [0.12, 0.3, 0.5, 0.7, 0.88], len = [0.55, 0.78, 0.92, 0.72, 0.5];
    function path(sc) { g.beginPath(); g.moveTo(0, H); xs.forEach((x, i) => { const tip = H * (1 - len[i] * sc), w = W * 0.1; g.bezierCurveTo(W * x - w, H * 0.75, W * x - w * 0.2 + (i % 2 ? 20 : -20), tip + H * 0.2, W * x + (i % 2 ? 30 : -30) * sc, tip); g.bezierCurveTo(W * x + w * 0.4, tip + H * 0.25, W * x + w, H * 0.8, W * (x + 0.09), H * 0.92); }); g.lineTo(W, H); g.closePath(); }
    path(1); g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.stroke(); path(1); g.lineWidth = 5; g.strokeStyle = '#7dd3fc'; g.stroke();
    const gr = g.createLinearGradient(0, H, 0, 0); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.3, '#ffd23a'); gr.addColorStop(0.6, '#ff8a1a'); gr.addColorStop(1, '#ec3013'); path(1); g.fillStyle = gr; g.fill();
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; }
  function truck() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body, sprung: true };
    const red = toon('#ec3013'), redD = toon('#b91c1c'), white = toon('#f3f2f2'), dark = toon('#2a2826'), yel = toon('#e6b45a');
    const glass = new THREE.MeshBasicMaterial({ color: 0xa5d8ea, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
    const tb = (a, b, r = 0.05, mat = ink, parent = body) => { const d = new THREE.Vector3().subVectors(b, a), m = M(new THREE.CylinderGeometry(r, r, d.length(), 8), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, parent, 0.01); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
    // WHEELS: tall, fat, deep chevron lugs, chrome dish rims with bolts, axles + coilovers
    for (const [z, front] of [[1.6, true], [-1.6, false]]) {
      for (const s of [-1, 1]) {
        const g = new THREE.Group(); g.position.set(s * 1.5, 0, z); root.add(g); const sp = new THREE.Group(); sp.position.y = 0.98; g.add(sp); const r = 0.98, w = 0.95;
        const t = M(new THREE.CylinderGeometry(r * 0.93, r * 0.93, w, 26), tyre, 0, 0, 0, sp, 0.035, r); t.rotation.z = Math.PI / 2;
        const sw = M(new THREE.TorusGeometry(r * 0.78, r * 0.17, 8, 26), tyre, 0, 0, 0, sp, 0); sw.rotation.y = Math.PI / 2; sw.scale.z = 2.6;
        for (let i = 0; i < 18; i++) { const q = i / 18 * Math.PI * 2; for (const h of [-1, 1]) { const l = M(new THREE.BoxGeometry(w * 0.46, 0.13, 0.24), tyre, h * w * 0.25, Math.cos(q) * r * 0.97, Math.sin(q) * r * 0.97, sp, 0); l.rotation.x = -q; l.rotation.y = h * 0.35 * (i % 2 ? 1 : -1); } }
        const dish = M(new THREE.CylinderGeometry(r * 0.48, r * 0.42, 0.12, 18), chrome, s * w * 0.46, 0, 0, sp, 0.012, r * 0.48); dish.rotation.z = Math.PI / 2;
        M(new THREE.CylinderGeometry(r * 0.16, r * 0.16, 0.16, 12), dark, s * w * 0.5, 0, 0, sp, 0.008).rotation.z = Math.PI / 2;
        for (let i = 0; i < 8; i++) { const q = i / 8 * Math.PI * 2; M(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 6), steel, s * w * 0.5, Math.cos(q) * r * 0.3, Math.sin(q) * r * 0.3, sp, 0).rotation.z = Math.PI / 2; }
        if (front) V.steer.push(g); V.wheels.push({ g, sp, r, side: s, front, holder: g });
        // coilover from the hub up to the frame
        const top = V3(s * 0.85, 2.2, z), hub = V3(s * 1.05, 1.0, z); tb(hub, top, 0.07, steel); for (let k = 0; k < 6; k++) { const ring = M(new THREE.TorusGeometry(0.13, 0.03, 6, 14), yel, 0, 0, 0, body, 0); ring.position.lerpVectors(hub, top, 0.3 + k * 0.1); ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3().subVectors(top, hub).normalize()); }
        tb(V3(s * 0.3, 1.0, z), V3(s * 1.0, 1.0, z), 0.09, dark);
      }
      M(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12), dark, 0, 1.0, z, body, 0.012).rotation.z = Math.PI / 2;
    }
    // CHASSIS: ladder frame + skid plate + driveshaft
    for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.14, 0.22, 4.6), dark, s * 0.62, 1.55, 0, body, 0.015);
    for (const z of [-1.9, -0.6, 0.6, 1.9]) M(new THREE.BoxGeometry(1.4, 0.14, 0.14), dark, 0, 1.55, z, body, 0.012);
    tb(V3(0, 1.0, 1.6), V3(0, 1.3, -1.6), 0.07, steel);
    M(new THREE.BoxGeometry(1.3, 0.08, 1.0), steel, 0, 1.28, 2.2, body, 0.012).rotation.x = 0.35;
    // BODY: pickup with a hood, cab and bed, flared arches, flames
    const bodyY = 1.95;
    M(new THREE.BoxGeometry(2.5, 0.62, 1.7), red, 0, bodyY + 0.31, 1.45, body, 0.04);                        // hood block
    const hoodTop = M(new THREE.BoxGeometry(2.4, 0.18, 1.6), red, 0, bodyY + 0.68, 1.4, body, 0.03); hoodTop.rotation.x = 0.08;
    M(new THREE.BoxGeometry(1.0, 0.22, 0.8), dark, 0, bodyY + 0.85, 1.3, body, 0.02);                       // blower scoop
    for (const sx of [-0.25, 0.25]) M(new THREE.CylinderGeometry(0.13, 0.15, 0.25, 12), chrome, sx, bodyY + 1.05, 1.3, body, 0.01, 0.15);
    M(new THREE.BoxGeometry(2.3, 0.45, 0.12), chrome, 0, bodyY + 0.3, 2.32, body, 0.012);                    // grille
    for (let i = 0; i < 6; i++) M(new THREE.BoxGeometry(0.06, 0.36, 0.04), dark, -0.75 + i * 0.3, bodyY + 0.3, 2.39, body, 0);
    for (const sx of [-0.95, 0.95]) { M(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 14), chrome, sx, bodyY + 0.32, 2.37, body, 0.01).rotation.x = Math.PI / 2; M(new THREE.CircleGeometry(0.12, 14), lit('#fff7cc'), sx, bodyY + 0.32, 2.42, body, 0); }
    M(new THREE.BoxGeometry(2.6, 0.2, 0.22), dark, 0, bodyY - 0.05, 2.35, body, 0.015);                       // bumper
    // cab: posts + roof + glass so the driver shows
    const cz0 = -0.2, cz1 = 0.7, cy0 = bodyY + 0.62, cy1 = bodyY + 1.45;
    M(new THREE.BoxGeometry(2.5, 0.62, 1.4), red, 0, bodyY + 0.31, (cz0 + cz1) / 2 - 0.1, body, 0.04);
    M(new THREE.BoxGeometry(2.25, 0.1, 1.1), red, 0, cy1, (cz0 + cz1) / 2 - 0.15, body, 0.03);
    for (const sx of [-1.1, 1.1]) { tb(V3(sx, cy0, cz1), V3(sx, cy1, cz1 - 0.25), 0.06, red); tb(V3(sx, cy0, cz0 - 0.65), V3(sx, cy1, cz0 - 0.65), 0.06, red); }
    const ws = M(new THREE.PlaneGeometry(2.15, 0.85), glass, 0, (cy0 + cy1) / 2, cz1 - 0.12, body, 0); ws.rotation.x = -0.3;
    for (const sx of [-1.12, 1.12]) { const sg = M(new THREE.PlaneGeometry(1.15, 0.75), glass, sx, (cy0 + cy1) / 2, cz0 - 0.1, body, 0); sg.rotation.y = Math.PI / 2; }
    M(new THREE.PlaneGeometry(2.15, 0.75), glass, 0, (cy0 + cy1) / 2, cz0 - 0.66, body, 0);
    // light bar on the roof
    M(new THREE.BoxGeometry(1.8, 0.16, 0.2), dark, 0, cy1 + 0.14, cz1 - 0.35, body, 0.012);
    for (let i = 0; i < 5; i++) M(new THREE.CircleGeometry(0.07, 12), lit('#fff7cc'), -0.72 + i * 0.36, cy1 + 0.14, cz1 - 0.24, body, 0);
    // bed with walls
    M(new THREE.BoxGeometry(2.5, 0.25, 1.6), red, 0, bodyY + 0.12, -1.6, body, 0.03);
    for (const sx of [-1.18, 1.18]) M(new THREE.BoxGeometry(0.14, 0.55, 1.6), red, sx, bodyY + 0.5, -1.6, body, 0.025);
    M(new THREE.BoxGeometry(2.5, 0.55, 0.12), white, 0, bodyY + 0.5, -2.38, body, 0.02);
    for (const sx of [-0.95, 0.95]) M(new THREE.BoxGeometry(0.3, 0.14, 0.05), lit('#ff2a1a'), sx, bodyY + 0.62, -2.45, body, 0);
    // fender flares over each wheel
    for (const z of [1.6, -1.6]) for (const sx of [-1, 1]) { const f = M(new THREE.TorusGeometry(1.1, 0.12, 6, 18, Math.PI), dark, sx * 1.33, 1.0, z, body, 0.012); f.rotation.y = Math.PI / 2; f.scale.set(1, 1, 1.3); }
    // flames + 8 decal on both sides
    for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 0.6), new THREE.MeshToonMaterial({ map: flameTex(sx < 0), gradientMap: ink.gradientMap, emissive: 0xffffff, emissiveIntensity: 0.18, emissiveMap: null, polygonOffset: true, polygonOffsetFactor: -2 })); m.material.emissiveMap = m.material.map; m.position.set(sx * 1.257, bodyY + 0.31, 0.83); m.rotation.y = sx * Math.PI / 2; body.add(m); }
    { const hm = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.5), new THREE.MeshToonMaterial({ map: flameHood(), gradientMap: ink.gradientMap, polygonOffset: true, polygonOffsetFactor: -2 })); hm.rotation.order = 'YXZ'; hm.rotation.set(-Math.PI / 2 + 0.08, Math.PI, 0); hm.position.set(0, bodyY + 0.775, 1.42); body.add(hm); }
    // twin chrome stacks behind the cab
    for (const sx of [-0.9, 0.9]) { M(new THREE.CylinderGeometry(0.09, 0.09, 1.3, 10), chrome, sx, bodyY + 1.0, cz0 - 0.82, body, 0.01, 0.09); M(new THREE.CylinderGeometry(0.11, 0.09, 0.14, 10), dark, sx, bodyY + 1.68, cz0 - 0.82, body, 0.008); }
    const ex = new THREE.Object3D(); ex.position.set(0.9, bodyY + 1.75, cz0 - 0.82); body.add(ex); V.exhaust = ex; const ex2 = new THREE.Object3D(); ex2.position.set(-0.9, bodyY + 1.75, cz0 - 0.82); body.add(ex2); V.exhaust2 = ex2;
    // FIREBALL CANNON on the roof
    const fc = new THREE.Group(); fc.position.set(0, cy1 + 0.18, cz0 + 0.15); body.add(fc); V.fcan = fc;
    M(new THREE.CylinderGeometry(0.32, 0.36, 0.14, 16), dark, 0, 0, 0, fc, 0.01, 0.36);
    const drum = M(new THREE.CylinderGeometry(0.21, 0.21, 0.75, 14), yel, 0, 0.24, 0.1, fc, 0.015, 0.21); drum.rotation.x = Math.PI / 2;
    for (const z of [-0.12, 0.3]) { const b2 = M(new THREE.TorusGeometry(0.22, 0.025, 6, 16), dark, 0, 0.24, z, fc, 0); }
    const bell = M(new THREE.CylinderGeometry(0.24, 0.14, 0.36, 16, 1, true), red, 0, 0.24, 0.65, fc, 0.012); bell.rotation.x = -Math.PI / 2; bell.material = redD.clone(); bell.material.side = THREE.DoubleSide;
    const fm = new THREE.Object3D(); fm.position.set(0, 0.24, 0.88); fc.add(fm); V.muzzle = fm;
    // OIL TANK in the bed
    const ot = M(new THREE.CylinderGeometry(0.4, 0.4, 1.7, 16), toon('#201e1d'), 0, bodyY + 0.65, -1.55, body, 0.02, 0.4); ot.rotation.z = Math.PI / 2;
    for (const sx of [-0.55, 0, 0.55]) { const b2 = M(new THREE.TorusGeometry(0.41, 0.035, 6, 18), yel, sx, bodyY + 0.65, -1.55, body, 0); b2.rotation.y = Math.PI / 2; }
    M(new THREE.BoxGeometry(0.5, 0.08, 0.3), yel, 0, bodyY + 1.06, -1.55, body, 0); tb(V3(0, bodyY + 0.3, -2.0), V3(0, bodyY - 0.35, -2.42), 0.06, steel);
    const oz = new THREE.Object3D(); oz.position.set(0, bodyY - 0.4, -2.45); body.add(oz); V.oilNozzle = oz;
    V.seat = new THREE.Vector3(0, bodyY - 0.62, 0.1); V.pose = 'car'; root.userData.V = V; return root;
  }
  function liveryTex(flip) { const W = 1024, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, W, H); g.fillStyle = '#ec3013'; g.beginPath(); g.moveTo(W, 0); g.lineTo(W * 0.42, 0); g.lineTo(W * 0.3, H); g.lineTo(W, H); g.fill();
    g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(W * 0.4, 0); g.lineTo(W * 0.36, 0); g.lineTo(W * 0.24, H); g.lineTo(W * 0.28, H); g.fill(); g.fillRect(0, H * 0.82, W, H * 0.18);
    g.fillStyle = '#7dd3fc'; g.fillRect(0, H * 0.78, W, H * 0.04);
    g.fillStyle = '#201e1d'; g.beginPath(); g.arc(W * 0.16, H * 0.42, 74, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(W * 0.16, H * 0.42, 64, 0, 7); g.fill();
    g.fillStyle = '#201e1d'; g.font = '900 110px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', W * 0.16, H * 0.46);
    g.fillStyle = '#ffffff'; g.font = '900 64px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText('GATES', W * 0.52, H * 0.44);
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; if (flip) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; } return t; }
  function racecar() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body };
    const white = toon('#f3f2f2'), red = toon('#ec3013'), dark = toon('#201e1d'), carbon = toon('#2a2826'), blue = toon('#7dd3fc');
    const tb = (a, b, r = 0.03, mat = dark) => { const d = new THREE.Vector3().subVectors(b, a), m = M(new THREE.CylinderGeometry(r, r, d.length(), 8), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, body, 0.008); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
    // slick tyres: fat, red-striped sidewalls, wishbones to the tub
    for (const [z, front, r, w] of [[1.55, true, 0.42, 0.42], [-1.45, false, 0.5, 0.56]]) for (const s of [-1, 1]) {
      const g = new THREE.Group(); g.position.set(s * 1.0, r, z); root.add(g); const sp = new THREE.Group(); g.add(sp);
      const t = M(new THREE.CylinderGeometry(r, r, w, 26), tyre, 0, 0, 0, sp, 0.025, r); t.rotation.z = Math.PI / 2;
      const st = M(new THREE.TorusGeometry(r * 0.72, 0.022, 6, 26), red, s * w * 0.51, 0, 0, sp, 0); st.rotation.y = Math.PI / 2;
      const rim = M(new THREE.CylinderGeometry(r * 0.55, r * 0.55, w + 0.02, 18), carbon, 0, 0, 0, sp, 0); rim.rotation.z = Math.PI / 2;
      for (let i = 0; i < 5; i++) { const q = i / 5 * Math.PI * 2, b = M(new THREE.BoxGeometry(0.03, r * 0.9, 0.06), toon('#cbd5e1'), s * (w * 0.5 + 0.012), 0, 0, sp, 0); b.rotation.x = q; }
      M(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 8), red, s * (w * 0.5 + 0.03), 0, 0, sp, 0).rotation.z = Math.PI / 2;
      if (front) V.steer.push(g); V.wheels.push({ g, sp, r, side: s, front });
      for (const dy of [-0.08, 0.1]) tb(V3(s * 0.38, r + dy, z + 0.12), V3(s * (1.0 - w * 0.5), r + dy * 0.5, z), 0.022);
    }
    // tub, nose, sidepods, engine cover + shark fin
    M(new THREE.BoxGeometry(0.8, 0.42, 2.7), white, 0, 0.52, -0.1, body, 0.025);
    const nose = M(new THREE.CylinderGeometry(0.16, 0.36, 1.5, 4, 1), red, 0, 0.52, 1.95, body, 0.02); nose.rotation.set(Math.PI / 2, Math.PI / 4, 0); nose.scale.set(1.6, 1, 0.8);
    for (const s of [-1, 1]) { M(new THREE.BoxGeometry(0.42, 0.36, 1.5), white, s * 0.6, 0.46, -0.45, body, 0.022);
      const lv = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.36), new THREE.MeshToonMaterial({ map: liveryTex(s < 0), gradientMap: ink.gradientMap, polygonOffset: true, polygonOffsetFactor: -2 })); lv.position.set(s * 0.812, 0.46, -0.45); lv.rotation.y = s * Math.PI / 2; body.add(lv);
      const intake = M(new THREE.BoxGeometry(0.36, 0.22, 0.06), dark, s * 0.6, 0.5, 0.31, body, 0); }
    const cover = M(new THREE.CylinderGeometry(0.22, 0.4, 1.4, 4, 1), white, 0, 0.72, -0.95, body, 0.02); cover.rotation.set(-Math.PI / 2, Math.PI / 4, 0); cover.scale.set(1.3, 1, 0.9);
    M(new THREE.BoxGeometry(0.03, 0.42, 1.1), red, 0, 1.0, -1.15, body, 0.008);
    M(new THREE.BoxGeometry(0.3, 0.26, 0.3), dark, 0, 1.0, -0.25, body, 0.012);                                             // airbox
    // cockpit + halo
    M(new THREE.BoxGeometry(0.62, 0.1, 0.9), dark, 0, 0.76, 0.28, body, 0.01);
    tb(V3(-0.32, 0.76, -0.15), V3(-0.25, 1.08, 0.2), 0.035, carbon); tb(V3(0.32, 0.76, -0.15), V3(0.25, 1.08, 0.2), 0.035, carbon); tb(V3(-0.25, 1.08, 0.2), V3(0.25, 1.08, 0.2), 0.035, carbon); tb(V3(0, 1.08, 0.2), V3(0, 0.8, 0.78), 0.035, carbon);
    // rear wing: endplates + two elements + DRS flap, red/white
    for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.04, 0.55, 0.6), red, s * 0.85, 1.05, -2.05, body, 0.01);
    M(new THREE.BoxGeometry(1.7, 0.05, 0.42), dark, 0, 1.2, -2.05, body, 0.01); const flap = new THREE.Group(); flap.position.set(0, 1.27, -2.18); body.add(flap); M(new THREE.BoxGeometry(1.68, 0.04, 0.22), white, 0, 0, 0.1, flap, 0.008); V.flap = flap;
    for (const s of [-1, 1]) tb(V3(s * 0.2, 0.75, -1.7), V3(s * 0.2, 1.18, -2.0), 0.03);
    const bl = M(new THREE.BoxGeometry(0.25, 0.07, 0.03), new THREE.MeshBasicMaterial({ color: 0xff2a1a }), 0, 0.62, -2.06, body, 0); V.brake = bl;
    // front wing under the ram
    M(new THREE.BoxGeometry(2.1, 0.04, 0.42), dark, 0, 0.22, 2.35, body, 0.01); M(new THREE.BoxGeometry(2.0, 0.035, 0.2), red, 0, 0.28, 2.25, body, 0.008);
    for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.04, 0.2, 0.46), white, s * 1.05, 0.28, 2.35, body, 0.008);
    // diffuser + twin exhaust
    M(new THREE.BoxGeometry(1.2, 0.18, 0.3), carbon, 0, 0.22, -2.0, body, 0.01);
    for (const s of [-0.1, 0.1]) M(new THREE.CylinderGeometry(0.05, 0.06, 0.25, 10), toon('#9ca3af'), s, 0.6, -1.78, body, 0.006).rotation.x = Math.PI / 2 - 0.3;
    const ex = new THREE.Object3D(); ex.position.set(0, 0.62, -1.95); body.add(ex); V.exhaust = ex;
    // BATTERING RAM: hydraulic piston out of the nose with a heavy steel head and spikes
    const ram = new THREE.Group(); ram.position.set(0, 0.5, 2.55); body.add(ram); V.ram = ram;
    const sleeve = M(new THREE.CylinderGeometry(0.15, 0.15, 0.5, 14), carbon, 0, 0, -0.15, body, 0.012); sleeve.position.set(0, 0.5, 2.45); sleeve.rotation.x = Math.PI / 2;
    const rod = M(new THREE.CylinderGeometry(0.09, 0.09, 1.0, 12), chrome, 0, 0, -0.35, ram, 0.008); rod.rotation.x = Math.PI / 2; V.rod = rod;
    const head = new THREE.Group(); head.position.z = 0.25; ram.add(head); V.ramHead = head;
    M(new THREE.BoxGeometry(1.25, 0.55, 0.22), toon('#64748b'), 0, 0, 0, head, 0.025); M(new THREE.BoxGeometry(1.29, 0.1, 0.24), toon('#e6b45a'), 0, 0.22, 0, head, 0); M(new THREE.BoxGeometry(1.29, 0.1, 0.24), toon('#e6b45a'), 0, -0.22, 0, head, 0);
    for (const [x, y] of [[-0.4, 0.1], [0, 0.1], [0.4, 0.1], [-0.2, -0.1], [0.2, -0.1]]) { const sp = M(new THREE.ConeGeometry(0.07, 0.24, 8), toon('#e5e7eb'), x, y, 0.22, head, 0.008); sp.rotation.x = Math.PI / 2; }
    for (const s of [-1, 1]) { const p = M(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), toon('#e6b45a'), s * 0.32, 0.12, -0.25, ram, 0.006); p.rotation.x = Math.PI / 2; }
    // TWIN LASERS on the sidepod leading edges
    V.lasers = []; for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * 0.6, 0.62, 0.36); body.add(g); const b = M(new THREE.CylinderGeometry(0.045, 0.055, 0.5, 10), dark, 0, 0, 0.2, g, 0.008); b.rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 10), blue, 0, 0, 0.44, g, 0).rotation.x = Math.PI / 2; const mz = new THREE.Object3D(); mz.position.set(0, 0, 0.5); g.add(mz); V.lasers.push(mz); }
    V.seat = new THREE.Vector3(0, 0.06, 0.12); V.pose = 'race'; root.userData.V = V; return root;
  }
  function mech() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body, legs: [], arms: [] };
    const white = toon('#e7edf4'), ink2 = toon('#1e293b'), grey = toon('#64748b'), glowM = new THREE.MeshToonMaterial({ color: '#7dd3fc', gradientMap: ink.gradientMap, emissive: new THREE.Color('#7dd3fc'), emissiveIntensity: 1.6 }), redL = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    V.glowM = glowM;
    const pelvis = new THREE.Group(); pelvis.position.y = 2.6; body.add(pelvis); V.pelvis = pelvis;
    const rb = (w, h, d, r = 0.08) => { const sh = new THREE.Shape(), x = -w / 2, y = -h / 2; sh.moveTo(x + r, y); sh.lineTo(x + w - r, y); sh.quadraticCurveTo(x + w, y, x + w, y + r); sh.lineTo(x + w, y + h - r); sh.quadraticCurveTo(x + w, y + h, x + w - r, y + h); sh.lineTo(x + r, y + h); sh.quadraticCurveTo(x, y + h, x, y + h - r); sh.lineTo(x, y + r); sh.quadraticCurveTo(x, y, x + r, y); const g = new THREE.ExtrudeGeometry(sh, { depth: d - r * 2, bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.6, bevelSegments: 2, curveSegments: 3 }); g.translate(0, 0, -(d - r * 2) / 2); return g; };
    const panel = (parent, w, h, x, y, z, ry = 0) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.55, depthWrite: false })); p.position.set(x, y, z); p.rotation.y = ry; parent.add(p); const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)), new THREE.LineBasicMaterial({ color: 0x334155 })); e.position.copy(p.position); e.rotation.y = ry; parent.add(e); };
    const hazard = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 32; const g = c.getContext('2d'); g.fillStyle = '#e6b45a'; g.fillRect(0, 0, 128, 32); g.fillStyle = '#1e293b'; for (let i = -2; i < 10; i++) { g.beginPath(); g.moveTo(i * 16, 32); g.lineTo(i * 16 + 8, 32); g.lineTo(i * 16 + 24, 0); g.lineTo(i * 16 + 16, 0); g.fill(); } return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }); })();
    M(rb(1.8, 0.6, 1.2, 0.12), ink2, 0, 0, 0, pelvis, 0.03); M(new THREE.CylinderGeometry(0.45, 0.5, 0.35, 16), grey, 0, 0.32, 0, pelvis, 0.02, 0.5);
    for (const s of [-1, 1]) { const ar = M(rb(0.5, 0.42, 1.0, 0.08), white, s * 0.62, -0.05, 0.12, pelvis, 0.02); ar.rotation.z = s * 0.15; }
    { const hz = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.12), hazard); hz.position.set(0, -0.22, 0.61); pelvis.add(hz); }
    // LEGS: hip → thigh → knee → shin → ankle → big foot with toes
    for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(s * 0.95, -0.1, 0); pelvis.add(hip);
      M(new THREE.SphereGeometry(0.34, 14, 10), grey, 0, 0, 0, hip, 0.02, 0.34);
      M(rb(0.58, 1.25, 0.7, 0.12), white, 0, -0.62, 0, hip, 0.03); M(new THREE.BoxGeometry(0.6, 0.08, 0.72), glowM, 0, -0.35, 0, hip, 0); panel(hip, 0.36, 0.5, 0, -0.75, 0.355);
      const pist = M(new THREE.CylinderGeometry(0.05, 0.05, 1, 8), chrome, 0, 0, 0, hip, 0.008); const pistS = M(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), grey, 0, 0, 0, hip, 0.008);
      const knee = new THREE.Group(); knee.position.y = -1.25; hip.add(knee); M(new THREE.SphereGeometry(0.3, 12, 10), ink2, 0, 0, 0, knee, 0.02, 0.3);
      const kp = M(rb(0.5, 0.5, 0.26, 0.1), white, 0, 0.05, 0.3, knee, 0.02); kp.rotation.x = -0.2; M(new THREE.CircleGeometry(0.08, 14), glowM, 0, 0.05, 0.44, knee, 0);
      M(rb(0.5, 1.15, 0.6, 0.12), white, 0, -0.6, -0.05, knee, 0.03); for (let k = 0; k < 3; k++) M(new THREE.BoxGeometry(0.34, 0.05, 0.02), ink2, 0, -0.42 - k * 0.12, 0.26, knee, 0);
      for (let k = 0; k < 2; k++) M(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), grey, s * 0.31, -0.55, -0.15 + k * 0.2, knee, 0.008);
      const hipA = new THREE.Object3D(); hipA.position.set(0, -0.25, -0.38); hip.add(hipA); const shinA = new THREE.Object3D(); shinA.position.set(0, -0.35, -0.36); knee.add(shinA);
      const ankle = new THREE.Group(); ankle.position.y = -1.15; knee.add(ankle); M(new THREE.SphereGeometry(0.22, 10, 8), ink2, 0, 0, 0, ankle, 0.015, 0.22);
      M(rb(0.86, 0.3, 1.3, 0.1), ink2, 0, -0.2, 0.22, ankle, 0.03); M(rb(0.7, 0.14, 1.0, 0.05), white, 0, -0.02, 0.2, ankle, 0.015);
      for (const tx of [-0.27, 0.27]) { M(rb(0.3, 0.22, 0.44, 0.06), grey, tx, -0.24, 0.98, ankle, 0.02); const cl = M(new THREE.ConeGeometry(0.07, 0.2, 6), toon('#cbd5e1'), tx, -0.3, 1.25, ankle, 0.006); cl.rotation.x = Math.PI / 2; }
      M(rb(0.32, 0.22, 0.38, 0.06), grey, 0, -0.24, -0.5, ankle, 0.02);
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.08), hazard); stripe.position.set(0, -0.2, 0.88); ankle.add(stripe);
      V.legs.push({ s, hip, knee, ankle, pist, pistS, hipA, shinA });
    }
    // TORSO / COCKPIT: open glass front so Noble shows in his chair, 8 crest, eye lights, back thrusters
    const torso = new THREE.Group(); torso.position.y = 0.4; pelvis.add(torso); V.torso = torso;
    M(new THREE.BoxGeometry(2.4, 0.3, 1.9), ink2, 0, 0.15, 0, torso, 0.03);                       // cockpit floor
    // all-round glass canopy: Noble shows from every side. Corner posts + a lower white tub; roof ring on top.
    M(rb(2.6, 0.7, 2.1, 0.16), white, 0, 0.6, -0.05, torso, 0.035);                                  // lower tub (below the glass)
    panel(torso, 0.9, 0.34, -0.7, 0.62, 1.02); panel(torso, 0.9, 0.34, 0.7, 0.62, 1.02);
    for (let k = 0; k < 4; k++) for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.02, 0.36, 0.08), ink2, s * 1.31, 0.6, -0.5 + k * 0.18, torso, 0);
    { const il = new THREE.PointLight(0x7dd3fc, 1.2, 3.5, 2); il.position.set(0, 2.4, 0.2); torso.add(il); V.cabLight = il; }
    M(new THREE.BoxGeometry(1.0, 0.08, 0.3), glowM, 0, 1.0, 0.7, torso, 0);                           // dash glow
    for (const [x, c] of [[-0.3, '#a3e635'], [0, '#ffd23a'], [0.3, '#ec3013']]) M(new THREE.BoxGeometry(0.08, 0.05, 0.03), new THREE.MeshBasicMaterial({ color: c }), x, 1.04, 0.86, torso, 0);
    const gm = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide });
    const gl = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.75, 1.85), gm); gl.position.set(0, 1.78, -0.05); torso.add(gl);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(gl.geometry), new THREE.LineBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.55 })); edge.position.copy(gl.position); torso.add(edge);
    for (const [x, z] of [[-1.15, 0.88], [1.15, 0.88], [-1.15, -0.98], [1.15, -0.98]]) M(new THREE.BoxGeometry(0.14, 1.8, 0.14), white, x, 1.78, z, torso, 0.012);
    M(rb(2.6, 0.32, 2.1, 0.14), white, 0, 2.8, -0.05, torso, 0.035);                                 // roof
    { const ant = M(new THREE.CylinderGeometry(0.02, 0.025, 0.9, 6), ink2, -0.95, 3.35, -0.75, torso, 0.006); const tip = M(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0xdc2626 }), -0.95, 3.82, -0.75, torso, 0); V.antTip = tip; }
    for (const s of [-1, 1]) { const pipe = M(new THREE.TorusGeometry(0.42, 0.045, 6, 14, Math.PI), grey, s * 0.55, 2.0, -1.12, torso, 0.008); pipe.rotation.y = Math.PI / 2; pipe.rotation.z = Math.PI / 2; }
    M(new THREE.BoxGeometry(1.4, 0.06, 0.06), glowM, 0, 2.72, 0.97, torso, 0);
    for (const ex of [-0.45, 0.45]) M(new THREE.BoxGeometry(0.3, 0.1, 0.05), redL, ex, 2.8, 0.96, torso, 0);
    for (const s of [-1, 1]) M(new THREE.BoxGeometry(2.52, 0.06, 0.06), glowM, 0, 0.92, s * 1.0 - 0.05, torso, 0);
    // TWIN LASER TURRET on the roof: ring base, yawing head, two barrels with glowing tips
    const tur = new THREE.Group(); tur.position.set(0, 2.95, -0.15); torso.add(tur); V.turret = tur;
    M(new THREE.CylinderGeometry(0.55, 0.65, 0.18, 20), ink2, 0, 0, 0, tur, 0.02, 0.65); M(new THREE.TorusGeometry(0.6, 0.04, 6, 24), glowM, 0, 0.06, 0, tur, 0).rotation.x = Math.PI / 2;
    const head = new THREE.Group(); head.position.y = 0.3; tur.add(head); V.turHead = head;
    M(new THREE.BoxGeometry(0.8, 0.36, 0.7), white, 0, 0, 0, head, 0.02); M(new THREE.BoxGeometry(0.82, 0.06, 0.72), glowM, 0, 0.12, 0, head, 0);
    V.turMuzzles = []; V.turBarrels = []; for (const s of [-1, 1]) { const bg = new THREE.Group(); bg.position.set(s * 0.24, 0, 0.3); head.add(bg); const b = M(new THREE.CylinderGeometry(0.07, 0.085, 0.9, 12), grey, 0, 0, 0.45, bg, 0.012); b.rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 12), ink2, 0, 0, 0.88, bg, 0.008).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 10), glowM, 0, 0, 0.95, bg, 0).rotation.x = Math.PI / 2; const mz = new THREE.Object3D(); mz.position.set(0, 0, 1.0); bg.add(mz); V.turMuzzles.push(mz); V.turBarrels.push(bg); }
    // SHOULDER BRACES: metal that rises up the sides of the glass to meet each shoulder
    for (const s of [-1, 1]) {
      const br = M(rb(0.38, 1.3, 1.15, 0.1), white, s * 1.34, 1.15, 0, torso, 0.025);
      const wedge = M(new THREE.BoxGeometry(0.3, 0.7, 0.8), grey, s * 1.42, 1.75, 0, torso, 0.02); wedge.rotation.z = s * -0.35;
      M(new THREE.BoxGeometry(0.36, 0.08, 1.12), glowM, s * 1.33, 0.75, 0, torso, 0);
      for (const z of [-0.3, 0.3]) M(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 8), grey, s * 1.5, 1.2, z, torso, 0).rotation.z = Math.PI / 2;
    }
    M(new THREE.BoxGeometry(2.0, 0.42, 0.25), white, 0, 0.75, 0.9, torso, 0.025);                   // dash
    const crest = document.createElement('canvas'); crest.width = crest.height = 128; { const g = crest.getContext('2d'); g.fillStyle = '#1e293b'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.fillStyle = '#7dd3fc'; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill(); g.fillStyle = '#1e293b'; g.font = '900 86px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 64, 70); }
    const cm = new THREE.Mesh(new THREE.CircleGeometry(0.26, 24), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(crest) })); cm.position.set(0, 0.66, 1.035); torso.add(cm);
    V.thrusters = []; for (const s of [-0.6, 0.6]) { M(new THREE.CylinderGeometry(0.22, 0.3, 0.6, 14), grey, s, 0.6, -1.25, torso, 0.02, 0.3); const n = new THREE.Object3D(); n.position.set(s, 0.25, -1.25); torso.add(n); V.thrusters.push(n); }
    // ARMS: shoulder pod → upper arm → elbow → forearm → huge fist with knuckles
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(s * 1.72, 1.7, 0); torso.add(sh); M(new THREE.SphereGeometry(0.52, 16, 12), ink2, 0, 0, 0, sh, 0.03, 0.52);
      const pad = M(rb(1.0, 0.5, 1.05, 0.16), white, s * 0.08, 0.32, 0, sh, 0.03); pad.rotation.z = s * -0.25; M(new THREE.BoxGeometry(1.02, 0.07, 1.07), glowM, s * 0.08, 0.12, 0, sh, 0).rotation.z = s * -0.25;
      { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'); g.fillStyle = '#1e293b'; g.font = '900 54px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 32, 36); const d8 = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.36), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true })); d8.position.set(s * 0.6, 0.3, 0); d8.rotation.y = s * Math.PI / 2; d8.rotation.x = 0; sh.add(d8); }
      M(rb(0.56, 1.2, 0.62, 0.12), grey, 0, -0.75, 0, sh, 0.025); const bp = M(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8), chrome, s * 0.34, -0.75, 0.12, sh, 0.006);
      const el = new THREE.Group(); el.position.y = -1.35; sh.add(el); M(new THREE.SphereGeometry(0.34, 12, 10), ink2, 0, 0, 0, el, 0.02, 0.34);
      M(rb(0.82, 1.3, 0.86, 0.16), white, 0, -0.7, 0, el, 0.03); M(new THREE.BoxGeometry(0.84, 0.08, 0.88), glowM, 0, -0.35, 0, el, 0); panel(el, 0.4, 0.6, 0, -0.8, 0.44);
      for (let k = 0; k < 3; k++) M(new THREE.BoxGeometry(0.02, 0.4, 0.06), ink2, s * 0.42, -0.85, -0.18 + k * 0.18, el, 0);
      const fist = new THREE.Group(); fist.position.y = -1.5; el.add(fist); M(rb(1.05, 0.95, 1.05, 0.14), ink2, 0, -0.2, 0, fist, 0.035);
      M(rb(0.9, 0.18, 0.9, 0.06), white, 0, 0.25, 0, fist, 0.015);
      for (let k = 0; k < 4; k++) { M(rb(0.2, 0.24, 0.3, 0.05), grey, -0.33 + k * 0.22, -0.64, 0.22, fist, 0.012); M(new THREE.BoxGeometry(0.12, 0.04, 0.04), chrome, -0.33 + k * 0.22, -0.62, 0.38, fist, 0); }
      M(new THREE.BoxGeometry(0.24, 0.5, 0.28), grey, s * -0.55, -0.2, 0.25, fist, 0.012);
      const tip = new THREE.Object3D(); tip.position.y = -0.7; fist.add(tip); V.arms.push({ s, sh, el, fist, tip });
    }
    V.seat = new THREE.Vector3(0, 0.3, 0.1); V.seatParent = torso; V.seatLocal = new THREE.Vector3(0, 0.22, 0.05); V.pose = 'noble';
    const ex = new THREE.Object3D(); ex.position.set(0, 3.5, -1.2); body.add(ex); V.exhaust = ex;
    root.userData.V = V; return root;
  }
  function bike() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body };
    const red = toon('#ec3013'), white = toon('#f3f2f2'), dark = toon('#201e1d'), alu = toon('#cbd5e1'), gold = toon('#e6b45a');
    const tb = (a, b, r = 0.03, mat = red, parent = body) => { const d = new THREE.Vector3().subVectors(b, a), m = M(new THREE.CylinderGeometry(r, r, d.length(), 8), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, parent, 0.008); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z), R0 = 0.36;
    function mtbWheel(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); const sp = new THREE.Group(); g.add(sp);
      const t = M(new THREE.TorusGeometry(R0 - 0.045, 0.05, 8, 28), tyre, 0, 0, 0, sp, 0.012); t.rotation.y = Math.PI / 2;
      for (let i = 0; i < 24; i++) { const q = i / 24 * Math.PI * 2; for (const h of [-1, 1]) { const k = M(new THREE.BoxGeometry(0.035, 0.04, 0.05), tyre, h * 0.03, Math.cos(q) * (R0 - 0.0), Math.sin(q) * (R0 - 0.0), sp, 0); k.rotation.x = -q; } }
      const rim = M(new THREE.TorusGeometry(R0 - 0.1, 0.014, 6, 28), dark, 0, 0, 0, sp, 0); rim.rotation.y = Math.PI / 2;
      for (let i = 0; i < 16; i++) { const q = i / 16 * Math.PI * 2, sx = (i % 2 ? 1 : -1) * 0.025; const sk = M(new THREE.CylinderGeometry(0.004, 0.004, R0 - 0.11, 4), alu, sx, Math.cos(q) * (R0 - 0.11) / 2, Math.sin(q) * (R0 - 0.11) / 2, sp, 0); sk.rotation.x = q; }
      M(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 10), dark, 0, 0, 0, sp, 0.004).rotation.z = Math.PI / 2;
      const disc = M(new THREE.CylinderGeometry(0.09, 0.09, 0.006, 18), alu, 0.05, 0, 0, sp, 0); disc.rotation.z = Math.PI / 2;
      return { g, sp, r: R0 }; }
    const rw = mtbWheel(body, 0, R0, -0.55); V.wheels.push({ ...rw, side: 0 });
    // frame (enduro-style: sloping top tube, fat down tube) + 8 decal
    const BB = V3(0, 0.36, -0.08), HT0 = V3(0, 0.78, 0.42), HT1 = V3(0, 0.9, 0.38), ST = V3(0, 0.92, -0.2), RA = V3(0, R0, -0.55);
    tb(BB, HT0, 0.045); tb(ST, HT1, 0.035); tb(BB, ST, 0.035); tb(V3(0.05, BB.y, BB.z), V3(0.05, RA.y, RA.z), 0.018, white); tb(V3(-0.05, BB.y, BB.z), V3(-0.05, RA.y, RA.z), 0.018, white);
    tb(V3(0.05, ST.y - 0.12, ST.z), V3(0.05, RA.y, RA.z), 0.016, white); tb(V3(-0.05, ST.y - 0.12, ST.z), V3(-0.05, RA.y, RA.z), 0.016, white);
    tb(HT0, HT1, 0.05, dark);
    // rear shock: spring between the top tube and the seat stays
    const shock = tb(V3(0, 0.82, 0.05), V3(0, 0.62, -0.28), 0.03, gold); for (let k = 0; k < 5; k++) { const c = M(new THREE.TorusGeometry(0.035, 0.008, 4, 10), gold, 0, 0.8 - k * 0.04, 0.02 - k * 0.07, body, 0); c.rotation.x = 0.9; }
    { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 48; const g = cv.getContext('2d'); g.fillStyle = '#ffffff'; g.font = '900 36px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('8 GATES', 8, 26); const tex = new THREE.CanvasTexture(cv);
      for (const sx of [-1, 1]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.08), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); d.position.set(sx * 0.047, 0.58, 0.17); d.rotation.set(-0.73 * -1, sx * Math.PI / 2, 0); d.rotation.order = 'YXZ'; d.rotation.set(sx * 0.73, sx * Math.PI / 2, 0); body.add(d); } }
    // drivetrain: chainring + crank + pedals (spin with the pedal stroke), chain, cassette
    const crank = new THREE.Group(); crank.position.copy(BB); body.add(crank); V.crank = crank;
    const ring = M(new THREE.TorusGeometry(0.1, 0.012, 4, 22), dark, 0.07, 0, 0, crank, 0); ring.rotation.y = Math.PI / 2;
    for (const s of [-1, 1]) { const arm = new THREE.Group(); arm.position.x = s * 0.09; arm.rotation.x = s > 0 ? 0 : Math.PI; crank.add(arm); M(new THREE.BoxGeometry(0.025, 0.17, 0.035), alu, 0, -0.085, 0, arm, 0.004); const pedal = M(new THREE.BoxGeometry(0.1, 0.022, 0.08), dark, s * 0.05, -0.17, 0, arm, 0.004); V['pedal' + (s > 0 ? 'R' : 'L')] = pedal; }
    M(new THREE.TorusGeometry(0.055, 0.01, 4, 16), dark, 0.07, RA.y, RA.z, body, 0).rotation.y = Math.PI / 2;
    tb(V3(0.075, BB.y + 0.1, BB.z), V3(0.075, RA.y + 0.055, RA.z), 0.007, dark); tb(V3(0.075, BB.y - 0.1, BB.z), V3(0.075, RA.y - 0.055, RA.z), 0.007, dark);
    // seat + dropper post
    tb(ST, V3(0, 1.0, -0.24), 0.02, dark); M(new THREE.BoxGeometry(0.1, 0.04, 0.26), dark, 0, 1.02, -0.24, body, 0.008);
    // FRONT: suspension fork (stanchions + lowers), bars, grips, LASER lamp
    const fork = new THREE.Group(); fork.position.copy(HT1); body.add(fork); V.steer.push(fork);
    for (const s of [-1, 1]) { tb(V3(s * 0.06, 0, 0), V3(s * 0.06, -0.3, 0.06), 0.022, toon('#e6b45a'), fork); tb(V3(s * 0.06, -0.3, 0.06), V3(s * 0.06, -0.54, 0.13), 0.03, dark, fork); }
    M(new THREE.BoxGeometry(0.16, 0.05, 0.06), dark, 0, -0.01, 0, fork, 0.006);
    const fw = mtbWheel(fork, 0, R0 - HT1.y + 0.0, 0.2); fw.g.position.set(0, R0 - HT1.y, 0.19); V.wheels.push({ ...fw, side: 0, front: true });
    tb(V3(0, 0.02, -0.02), V3(0, 0.1, 0.06), 0.022, dark, fork);
    const bar = M(new THREE.CylinderGeometry(0.016, 0.016, 0.72, 8), dark, 0, 0.1, 0.06, fork, 0.006); bar.rotation.z = Math.PI / 2; bar.rotation.y = 0;
    for (const s of [-1, 1]) M(new THREE.CylinderGeometry(0.024, 0.024, 0.1, 8), red, s * 0.32, 0.1, 0.06, fork, 0.006).rotation.z = Math.PI / 2;
    const lz = new THREE.Group(); lz.position.set(0, 0.06, 0.12); fork.add(lz); V.lzHead = lz;
    const lb = M(new THREE.CylinderGeometry(0.045, 0.055, 0.2, 12), dark, 0, 0, 0.06, lz, 0.008); lb.rotation.x = Math.PI / 2; M(new THREE.TorusGeometry(0.05, 0.012, 6, 14), toon('#7dd3fc'), 0, 0, 0.16, lz, 0);
    const lens = M(new THREE.CircleGeometry(0.04, 14), new THREE.MeshBasicMaterial({ color: 0xbaf2ff }), 0, 0, 0.165, lz, 0); V.lens = lens;
    const mz = new THREE.Object3D(); mz.position.set(0, 0, 0.2); lz.add(mz); V.muzzle = mz;
    const ex = new THREE.Object3D(); ex.position.set(0, 0.3, -0.7); body.add(ex); V.exhaust = ex;
    V.seat = new THREE.Vector3(0, 0.38, -0.2); V.pose = 'bike'; root.userData.V = V; return root;
  }
  function skate() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body };
    const deck = new THREE.Group(); deck.position.y = 0.17; body.add(deck); V.deck = deck;
    // TRADITIONAL POPSICLE DECK: rounded nose + tail, concave, kicks that curve up, maple ply edge, black grip on top, graphic underneath
    const W = 0.4, L = 1.07, Rr = W / 2, TH = 0.03, KICK0 = 0.33;
    const outline = () => { const sh = new THREE.Shape(), e = L / 2 - Rr; sh.moveTo(-W / 2, -e); for (let z = -e + 0.05; z < e - 0.001; z += 0.05) sh.lineTo(-W / 2, z); sh.lineTo(-W / 2, e); sh.absarc(0, e, Rr, Math.PI, 0, true); for (let z = e - 0.05; z > -e + 0.001; z -= 0.05) sh.lineTo(W / 2, z); sh.lineTo(W / 2, -e); sh.absarc(0, -e, Rr, 0, Math.PI, true); return sh; };
    const bend = (g, cc = 0) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), az = Math.abs(z); let y = p.getY(i) + x * x * cc; if (az > KICK0) y += (az - KICK0) * (az - KICK0) * 2.2; p.setY(i, y); } p.needsUpdate = true; g.computeVertexNormals(); return g; };
    const toXZ = (g) => { g.rotateX(Math.PI / 2); return g; };   // shape XY → length along z, thickness along y
    const ply = toon('#d9b26a'), plyDark = toon('#8a6a3a');
    const core = new THREE.ExtrudeGeometry(outline(), { depth: TH, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2, curveSegments: 18 }); toXZ(core); core.translate(0, -TH / 2, 0);
    // subdivide along z for a smooth bend: rebuild with more points by tessellating via a plane-based approach
    const seg = (shapeGeo) => shapeGeo;
    bend(core); const coreM = new THREE.Mesh(core, [ply, plyDark]); coreM.castShadow = true; deck.add(coreM);
    { const o = new THREE.Mesh(core, outlineMat()); o.scale.set(1.04, 1.25, 1.012); deck.add(o); }
    // grip tape (top) and graphic (bottom) as high-res shape sheets so the bend reads smoothly
    const sheet = (y, mat) => { const g = new THREE.ShapeGeometry(outline(), 24); toXZ(g); const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) { uv.setXY(i, (p.getX(i) + W / 2) / W, (p.getZ(i) + L / 2) / L); p.setY(i, y); }
      // densify: split long triangles by bending per-vertex (ShapeGeometry is sparse, so add a grid sheet instead)
      const grid = new THREE.PlaneGeometry(W, L, 6, 30); grid.rotateX(-Math.PI / 2); const gp = grid.attributes.position, gu = grid.attributes.uv; const keep = [];
      for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), z = gp.getZ(i), dz = Math.max(0, Math.abs(z) - (L / 2 - Rr)); const lim = dz > 0 ? Math.sqrt(Math.max(0, Rr * Rr - dz * dz)) : W / 2; gp.setX(i, Math.max(-lim, Math.min(lim, x)) * 0.985); gp.setY(i, y); gu.setXY(i, (gp.getX(i) + W / 2) / W, (z + L / 2) / L); }
      bend(grid, y > 0 ? 0.45 : 0.15); const m = new THREE.Mesh(grid, mat); deck.add(m); return m; };
    const gripTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#1c1b1a'; g.fillRect(0, 0, 64, 256); for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? '#2a2826' : '#121110'; g.fillRect(Math.random() * 64, Math.random() * 256, 1, 1); } g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 2; g.beginPath(); g.moveTo(4, 60); g.lineTo(60, 60); g.moveTo(4, 196); g.lineTo(60, 196); g.stroke(); return new THREE.CanvasTexture(c); })();
    sheet(TH / 2 + 0.01, new THREE.MeshToonMaterial({ map: gripTex, gradientMap: ink.gradientMap }));
    const artTex = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 512; const g = c.getContext('2d'); g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, 128, 512);
      g.fillStyle = '#ec3013'; g.fillRect(0, 0, 128, 150); g.fillRect(0, 362, 128, 150); g.fillStyle = '#201e1d'; g.fillRect(0, 150, 128, 10); g.fillRect(0, 352, 128, 10);
      g.fillStyle = '#201e1d'; g.beginPath(); g.arc(64, 256, 52, 0, 7); g.fill(); g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(64, 256, 44, 0, 7); g.fill(); g.fillStyle = '#201e1d'; g.font = '900 72px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 64, 262);
      g.save(); g.translate(64, 80); g.rotate(-Math.PI / 2); g.fillStyle = '#f3f2f2'; g.font = '900 34px Archivo, sans-serif'; g.fillText('GATES', 0, 0); g.restore(); return new THREE.CanvasTexture(c); })();
    const art = sheet(-TH / 2 - 0.01, new THREE.MeshToonMaterial({ map: artTex, gradientMap: ink.gradientMap, side: THREE.BackSide }));
    // TRUCKS: baseplate, kingpin, bushings, hanger, axle; WHEELS: rounded urethane with bearings
    const alu = toon('#cbd5e1'), aluD = toon('#94a3b8'), bush = toon('#e6b45a'), wheelM = toon('#f3f2f2'), bearing = toon('#475569');
    const wheelProfile = []; { const r = 0.07, w = 0.055; for (let i = 0; i <= 8; i++) { const t = i / 8, y = -w / 2 + w * t, bulge = Math.sin(t * Math.PI) * 0.012; wheelProfile.push(new THREE.Vector2(r - 0.012 + bulge, y)); } wheelProfile.unshift(new THREE.Vector2(0.025, -w / 2)); wheelProfile.push(new THREE.Vector2(0.025, w / 2)); }
    const wheelGeo = new THREE.LatheGeometry(wheelProfile, 20); wheelGeo.rotateZ(Math.PI / 2);
    for (const z of [0.31, -0.31]) {
      const tk = new THREE.Group(); tk.position.set(0, -0.005, z); deck.add(tk); V.steer.push(tk);
      M(new THREE.BoxGeometry(0.13, 0.016, 0.16), aluD, 0, -TH / 2 - 0.02, 0, tk, 0.004);                                   // baseplate
      for (const bx of [-0.045, 0.045]) for (const bz of [-0.055, 0.055]) M(new THREE.CylinderGeometry(0.008, 0.008, 0.012, 6), toon('#201e1d'), bx, TH / 2 + 0.018, bz, tk, 0);   // bolts on top
      M(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 8), alu, 0, -0.04, Math.sign(z) * -0.02, tk, 0.003);             // kingpin
      for (const by of [-0.03, -0.055]) M(new THREE.CylinderGeometry(0.024, 0.024, 0.018, 10), bush, 0, by, Math.sign(z) * -0.02, tk, 0.003);
      const hanger = M(new THREE.CylinderGeometry(0.03, 0.022, 0.26, 10), alu, 0, -0.075, 0, tk, 0.006); hanger.rotation.z = Math.PI / 2;
      M(new THREE.BoxGeometry(0.06, 0.05, 0.05), alu, 0, -0.06, 0, tk, 0.005);
      const ax = M(new THREE.CylinderGeometry(0.008, 0.008, 0.4, 6), toon('#64748b'), 0, -0.075, 0, tk, 0); ax.rotation.z = Math.PI / 2;
      for (const sx of [-1, 1]) { const g = new THREE.Group(); g.position.set(sx * 0.17, -0.075, 0); tk.add(g); const sp = new THREE.Group(); g.add(sp);
        M(wheelGeo, wheelM, 0, 0, 0, sp, 0.006); const br = M(new THREE.CylinderGeometry(0.022, 0.022, 0.058, 12), bearing, 0, 0, 0, sp, 0); br.rotation.z = Math.PI / 2;
        const st = M(new THREE.TorusGeometry(0.05, 0.004, 4, 16), toon('#ec3013'), sx * 0.029, 0, 0, sp, 0); st.rotation.y = Math.PI / 2; V.wheels.push({ g, sp, r: 0.07, side: sx }); }
    }
    const ex = new THREE.Object3D(); ex.position.set(0, 0.1, -0.55); body.add(ex); V.exhaust = ex;
    V.seat = new THREE.Vector3(0, 0.2, 0); V.seatParent = deck; V.seatLocal = new THREE.Vector3(0, TH / 2 + 0.02, 0.02); V.pose = 'skate'; root.userData.V = V; return root;
  }
  function heli() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body };
    const red = toon('#ec3013'), white = toon('#f3f2f2'), dark = toon('#201e1d'), grey = toon('#64748b'), steelT = toon('#cbd5e1');
    const tb = (a, b, r = 0.04, mat = dark) => { const d = new THREE.Vector3().subVectors(b, a), m = M(new THREE.CylinderGeometry(r, r, d.length(), 8), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, body, 0.008); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z), Y = 1.25;
    // skids
    for (const s of [-1, 1]) { const sk = M(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 10), dark, s * 0.85, 0.08, 0.1, body, 0.01); sk.rotation.x = Math.PI / 2; const tip = M(new THREE.TorusGeometry(0.2, 0.06, 6, 10, Math.PI / 2), dark, s * 0.85, 0.28, 1.7, body, 0.008); tip.rotation.y = Math.PI / 2; tip.rotation.z = Math.PI;
      for (const z of [-0.6, 0.8]) tb(V3(s * 0.85, 0.08, z), V3(s * 0.5, Y - 0.35, z), 0.045); }
    // FUSELAGE: rounded pod with the whole front upper quarter open for a curved WINDSCREEN + chin window, so the pilot shows
    const FS = [0.95, 0.85, 1.6], FC = [0, Y, 0.1], WIN = 1.3, TOP = 0.74 * Math.PI, F = Math.PI / 2;
    const shell = (g, mat, out = 0.04) => { const m = M(g, mat, FC[0], FC[1], FC[2], body, out, 1); m.scale.set(...FS); return m; };
    const hullMat = red.clone(); hullMat.side = THREE.DoubleSide;
    shell(new THREE.SphereGeometry(1, 28, 18, F + WIN, Math.PI * 2 - WIN * 2, 0, TOP), hullMat);                       // upper shell, front cut away
    shell(new THREE.SphereGeometry(1, 28, 8, 0, Math.PI * 2, TOP, Math.PI - TOP), red);                                // belly (closed)
    const belt = shell(new THREE.SphereGeometry(1.008, 28, 3, F + WIN, Math.PI * 2 - WIN * 2, Math.PI * 0.5, Math.PI * 0.08), white, 0);   // white stripe round the sides
    const glassM = new THREE.MeshBasicMaterial({ color: 0x9fe3ff, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide });
    const ws = new THREE.Mesh(new THREE.SphereGeometry(0.995, 20, 14, F - WIN, WIN * 2, 0.08, TOP - 0.08), glassM); ws.position.set(...FC); ws.scale.set(...FS); body.add(ws);
    // glints on the glass
    for (const [ph, th, w] of [[F - 0.35, 0.9, 0.06], [F - 0.2, 1.05, 0.035]]) { const gl = new THREE.Mesh(new THREE.SphereGeometry(0.998, 6, 10, ph, w, th - 0.35, 0.7), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide })); gl.position.set(...FC); gl.scale.set(...FS); body.add(gl); }
    // window frame: rim around the opening + centre post + a cross bar
    { const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, phi = F - WIN + t * WIN * 2; pts.push(new THREE.Vector3(-Math.cos(phi) * Math.sin(TOP), Math.cos(TOP), Math.sin(phi) * Math.sin(TOP))); }
      for (let i = 0; i <= 18; i++) { const th = TOP - i / 18 * (TOP - 0.08); pts.push(new THREE.Vector3(-Math.cos(F + WIN) * Math.sin(th), Math.cos(th), Math.sin(F + WIN) * Math.sin(th))); }
      const rimL = []; for (let i = 0; i <= 18; i++) { const th = 0.08 + i / 18 * (TOP - 0.08); rimL.push(new THREE.Vector3(-Math.cos(F - WIN) * Math.sin(th), Math.cos(th), Math.sin(F - WIN) * Math.sin(th))); }
      const post = []; for (let i = 0; i <= 18; i++) { const th = 0.08 + i / 18 * (TOP - 0.08); post.push(new THREE.Vector3(0, Math.cos(th), Math.sin(th))); }
      const bar = []; for (let i = 0; i <= 16; i++) { const phi = F - WIN + i / 16 * WIN * 2, th = 1.72; bar.push(new THREE.Vector3(-Math.cos(phi) * Math.sin(th), Math.cos(th), Math.sin(phi) * Math.sin(th))); }
      for (const P of [pts, rimL, post, bar]) { const curve = new THREE.CatmullRomCurve3(P.map(p => p.clone())); const g = new THREE.TubeGeometry(curve, P.length * 2, 0.035, 6, false); const m = M(g, dark, FC[0], FC[1], FC[2], body, 0); m.scale.set(...FS); } }
    // cockpit interior: floor, seat with headrest, glowing dash, cyclic stick, pedals
    M(new THREE.BoxGeometry(1.3, 0.06, 1.6), dark, 0, Y - 0.62, 0.45, body, 0);
    M(new THREE.BoxGeometry(0.62, 0.12, 0.55), toon('#334155'), 0, Y - 0.4, 0.1, body, 0.01); M(new THREE.BoxGeometry(0.62, 0.85, 0.12), toon('#334155'), 0, Y + 0.02, -0.18, body, 0.01); M(new THREE.BoxGeometry(0.34, 0.24, 0.1), toon('#334155'), 0, Y + 0.55, -0.18, body, 0.008);
    const dash = M(new THREE.BoxGeometry(1.05, 0.22, 0.32), dark, 0, Y - 0.15, 1.2, body, 0.01); dash.rotation.x = -0.35;
    { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#0b0a0a'; g.fillRect(0, 0, 256, 64); for (const [x, col] of [[30, '#7dd3fc'], [80, '#a3e635'], [176, '#ffd23a'], [226, '#7dd3fc']]) { g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.arc(x, 32, 18, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x, 32); g.lineTo(x + 12, 22); g.stroke(); } g.fillStyle = '#7dd3fc'; g.fillRect(108, 14, 40, 36); g.fillStyle = '#0b0a0a'; g.fillRect(112, 18, 32, 28); g.fillStyle = '#a3e635'; g.fillRect(116, 30, 24, 3);
      const pn = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.25), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })); pn.position.set(0, Y - 0.08, 1.04); pn.rotation.x = -0.35 - Math.PI; pn.rotation.set(-0.35, Math.PI, 0); body.add(pn); V.dashPanel = pn; }
    { const st = M(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 6), dark, 0, Y - 0.38, 0.62, body, 0.004); st.rotation.x = 0.25; M(new THREE.SphereGeometry(0.045, 8, 6), red, 0, Y - 0.13, 0.68, body, 0); }
    // side doors with small windows + handles
    for (const s of [-1, 1]) { const dw = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), glassM); dw.position.set(s * 0.93, Y + 0.15, -0.35); dw.rotation.y = s * Math.PI / 2; dw.scale.y = 0.75; body.add(dw);
      M(new THREE.BoxGeometry(0.02, 0.05, 0.2), steelT, s * 0.94, Y - 0.12, -0.1, body, 0); }
    // searchlight under the nose: a soft cone when low
    { const sl = M(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 12), dark, 0.45, Y - 0.78, 1.0, body, 0.006); const lens = M(new THREE.CircleGeometry(0.085, 12), new THREE.MeshBasicMaterial({ color: 0xfff7cc }), 0.45, Y - 0.845, 1.0, body, 0); lens.rotation.x = Math.PI / 2;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff7cc, transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); cone.position.set(0.45, Y - 0.85 - 2, 1.2); body.add(cone); V.beam = cone; }
    // rotor mast detail: swashplate + pitch links
    M(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 14), steelT, 0, Y + 1.12, -0.3, body, 0.006); for (let i = 0; i < 4; i++) { const q = i / 4 * Math.PI * 2; M(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 4), steelT, Math.cos(q) * 0.16, Y + 1.25, -0.3 + Math.sin(q) * 0.16, body, 0); }
    M(new THREE.BoxGeometry(1.2, 0.5, 1.4), red, 0, Y + 0.65, -0.35, body, 0.03);                                // engine hump
    for (const s of [-1, 1]) { const ix = M(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 12), grey, s * 0.42, Y + 0.72, -0.15, body, 0.012, 0.18); ix.rotation.x = Math.PI / 2; M(new THREE.CircleGeometry(0.13, 12), dark, s * 0.42, Y + 0.72, 0.105, body, 0); }
    for (const s of [-1, 1]) { const ep = M(new THREE.CylinderGeometry(0.11, 0.13, 0.3, 10), grey, s * 0.35, Y + 0.72, -1.1, body, 0.01); ep.rotation.x = -Math.PI / 2 + 0.4; }
    // tail boom, fin with an 8, horizontal stabiliser, tail rotor
    const boom = M(new THREE.CylinderGeometry(0.12, 0.32, 3.2, 12), red, 0, Y + 0.25, -2.6, body, 0.025, 0.32); boom.rotation.x = Math.PI / 2 + 0.06;
    M(new THREE.BoxGeometry(1.3, 0.05, 0.4), white, 0, Y + 0.25, -3.6, body, 0.01);
    const fin = M(new THREE.BoxGeometry(0.06, 0.9, 0.6), red, 0, Y + 0.65, -4.05, body, 0.012); fin.rotation.x = -0.35;
    { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill(); g.fillStyle = '#201e1d'; g.font = '900 46px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 32, 35); const t = new THREE.CanvasTexture(c);
      for (const s of [-1, 1]) { const d8 = new THREE.Mesh(new THREE.CircleGeometry(0.22, 18), new THREE.MeshBasicMaterial({ map: t })); d8.position.set(s * 0.035, Y + 0.65, -4.05); d8.rotation.y = s * Math.PI / 2; body.add(d8); } }
    const tr = new THREE.Group(); tr.position.set(0.12, Y + 0.75, -4.2); body.add(tr); V.tailRotor = tr; M(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8), grey, 0, 0, 0, tr, 0.006).rotation.z = Math.PI / 2;
    for (let i = 0; i < 2; i++) { const bl = M(new THREE.BoxGeometry(0.03, 0.9, 0.1), white, 0.05, 0, 0, tr, 0.006); bl.rotation.x = i * Math.PI / 2; }
    const tdisc = new THREE.Mesh(new THREE.CircleGeometry(0.46, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); tdisc.rotation.y = Math.PI / 2; tdisc.position.x = 0.07; tr.add(tdisc); V.tailDisc = tdisc;
    // main rotor: mast, hub, 4 blades, blur disc
    tb(V3(0, Y + 0.9, -0.3), V3(0, Y + 1.35, -0.3), 0.07, grey);
    const rot = new THREE.Group(); rot.position.set(0, Y + 1.38, -0.3); body.add(rot); V.rotor = rot; M(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 12), dark, 0, 0, 0, rot, 0.01, 0.2);
    for (let i = 0; i < 4; i++) { const bl = new THREE.Group(); bl.rotation.y = i * Math.PI / 2; rot.add(bl); const m = M(new THREE.BoxGeometry(0.28, 0.035, 3.0), dark, 0, 0, 1.6, bl, 0.008); m.rotation.z = 0.06; M(new THREE.BoxGeometry(0.29, 0.037, 0.3), red, 0, 0.001, 2.95, bl, 0); }
    const disc = new THREE.Mesh(new THREE.CircleGeometry(3.1, 40), new THREE.MeshBasicMaterial({ color: 0x201e1d, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); disc.rotation.x = -Math.PI / 2; disc.position.set(0, Y + 1.39, -0.3); body.add(disc); V.rotorDisc = disc;
    // stub wings + missile pods
    V.podMuzzles = []; V.podTubes = [];
    for (const s of [-1, 1]) { M(new THREE.BoxGeometry(1.1, 0.07, 0.5), white, s * 1.25, Y - 0.05, -0.25, body, 0.012);
      const pod = M(new THREE.CylinderGeometry(0.16, 0.16, 0.9, 12), grey, s * 1.6, Y - 0.25, -0.2, body, 0.012, 0.16); pod.rotation.x = Math.PI / 2;
      for (const dy of [-0.06, 0.06]) { const t = M(new THREE.ConeGeometry(0.05, 0.14, 8), red, s * 1.6 + (dy > 0 ? 0.06 : -0.06), Y - 0.25 + dy, 0.28, body, 0.006); t.rotation.x = Math.PI / 2; V.podTubes.push(t); const mz = new THREE.Object3D(); mz.position.set(s * 1.6, Y - 0.25 + dy, 0.4); body.add(mz); V.podMuzzles.push(mz); } }
    // chin minigun turret
    const gun = new THREE.Group(); gun.position.set(0, Y - 0.72, 1.15); body.add(gun); V.gun = gun; M(new THREE.SphereGeometry(0.2, 12, 10), dark, 0, 0, 0, gun, 0.01, 0.2);
    const barrels = new THREE.Group(); barrels.position.z = 0.2; gun.add(barrels); V.barrels = barrels; for (let i = 0; i < 6; i++) { const q = i / 6 * Math.PI * 2, b = M(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 6), steelT, Math.cos(q) * 0.06, Math.sin(q) * 0.06, 0.32, barrels, 0.004); b.rotation.x = Math.PI / 2; }
    const mz = new THREE.Object3D(); mz.position.set(0, 0, 0.7); barrels.add(mz); V.muzzle = mz;
    // lights: red (left) + green (right) nav, white strobe on the tail
    for (const [x, c] of [[-1.82, 0xdc2626], [1.82, 0x22c55e]]) M(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: c }), x, Y - 0.05, -0.25, body, 0);
    V.strobe = M(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0, Y + 1.1, -4.3, body, 0);
    const ex = new THREE.Object3D(); ex.position.set(0, Y + 0.7, -1.1); body.add(ex); V.exhaust = ex;
    V.seat = new THREE.Vector3(0, Y - 0.62, 0.22); V.pose = 'car'; root.userData.V = V; return root;
  }
  function jetski() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body };
    const red = toon('#ec3013'), white = toon('#f3f2f2'), dark = toon('#201e1d'), blue = toon('#7dd3fc'), grey = toon('#64748b');
    // hull: pointed nose, flat stern, sponsons; lathe-free: two stacked rounded boxes + a nose cone
    const hull = M(new THREE.BoxGeometry(0.95, 0.38, 2.1), white, 0, 0.22, -0.15, body, 0.03); const noseShape = new THREE.Shape(); noseShape.moveTo(-0.475, 0); noseShape.lineTo(0.475, 0); noseShape.quadraticCurveTo(0.47, 0.55, 0, 1.0); noseShape.quadraticCurveTo(-0.47, 0.55, -0.475, 0);
    const noseG = (depth) => { const g = new THREE.ExtrudeGeometry(noseShape, { depth, bevelEnabled: false, curveSegments: 10 }); g.rotateX(Math.PI / 2); return g; };
    const noseGrp = new THREE.Group(); noseGrp.position.set(0, 0, 0.9); noseGrp.rotation.x = -0.06; body.add(noseGrp);
    M(noseG(0.27), white, 0, 0.41, 0, noseGrp, 0.03);
    M(new THREE.BoxGeometry(0.97, 0.12, 2.12), red, 0, 0.08, -0.15, body, 0.012); const nr = M(noseG(0.12), red, 0, 0.14, 0, noseGrp, 0.012); nr.scale.set(1.02, 1, 1.01);
    // deck: red cowl over the engine, seat, footwells
    const cowl = M(new THREE.SphereGeometry(0.42, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), red, 0, 0.38, 0.62, body, 0.02, 0.42); cowl.scale.set(1, 0.7, 1.5);
    M(new THREE.BoxGeometry(0.42, 0.2, 1.05), dark, 0, 0.5, -0.35, body, 0.015); M(new THREE.BoxGeometry(0.44, 0.04, 1.07), red, 0, 0.6, -0.35, body, 0);
    for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.22, 0.04, 1.1), toon('#cbd5e1'), sx * 0.34, 0.42, -0.3, body, 0);
    // 8 GATES decal on both sides
    { const c = document.createElement('canvas'); c.width = 256; c.height = 48; const g = c.getContext('2d'); g.fillStyle = '#ec3013'; g.font = '900 38px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('8 GATES', 6, 26); g.fillStyle = '#201e1d'; g.fillRect(190, 10, 60, 30); g.fillStyle = '#7dd3fc'; g.fillRect(196, 16, 48, 18); const t = new THREE.CanvasTexture(c);
      for (const sx of [-1, 1]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.19), new THREE.MeshBasicMaterial({ map: t, transparent: true })); d.position.set(sx * 0.48, 0.26, 0.15); d.rotation.y = sx * Math.PI / 2; body.add(d); } }
    // STEERING NECK: rises out of the cowl and sweeps back toward the rider, bars at chest height so the rider leans forward onto them
    const col = new THREE.Group(); col.position.set(0, 0.5, 0.68); body.add(col); V.steer.push(col);
    const neck = new THREE.Group(); neck.rotation.x = -0.42; col.add(neck);
    M(new THREE.BoxGeometry(0.26, 0.2, 0.3), red, 0, 0.05, 0, neck, 0.01);                                   // base shroud
    M(new THREE.BoxGeometry(0.2, 0.55, 0.18), red, 0, 0.36, 0, neck, 0.012);                                  // neck
    M(new THREE.BoxGeometry(0.22, 0.06, 0.2), white, 0, 0.3, 0, neck, 0.004);
    M(new THREE.BoxGeometry(0.2, 0.08, 0.2), red, 0, 0.62, 0, neck, 0.008);                                   // top cap
    const pod = M(new THREE.BoxGeometry(0.22, 0.1, 0.12), dark, 0, 0.66, 0.08, neck, 0.006); pod.rotation.x = 0.5; // gauge pod
    M(new THREE.PlaneGeometry(0.14, 0.06), new THREE.MeshBasicMaterial({ color: 0x7dd3fc }), 0, 0.7, 0.13, neck, 0).rotation.x = -0.4;
    // swept-back handlebar: centre clamp + two angled halves + red grips + mirrors
    const barY = 0.66, V3 = (x, y, z) => new THREE.Vector3(x, y, z);
    const tb = (p, q, r, mat) => { const d = new THREE.Vector3().subVectors(q, p), m = M(new THREE.CylinderGeometry(r, r, d.length(), 8), mat, (p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2, neck, 0.006); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
    M(new THREE.BoxGeometry(0.12, 0.06, 0.08), toon('#cbd5e1'), 0, barY, -0.02, neck, 0.004);
    for (const sx of [-1, 1]) { tb(V3(0, barY, -0.02), V3(sx * 0.3, barY + 0.03, -0.12), 0.02, dark); tb(V3(sx * 0.3, barY + 0.03, -0.12), V3(sx * 0.44, barY + 0.04, -0.16), 0.032, red);
      M(new THREE.BoxGeometry(0.03, 0.03, 0.06), dark, sx * 0.26, barY + 0.03, -0.06, neck, 0); // brake/throttle lever
      tb(V3(sx * 0.2, barY, -0.06), V3(sx * 0.26, barY + 0.16, -0.02), 0.008, dark); M(new THREE.BoxGeometry(0.1, 0.06, 0.02), dark, sx * 0.27, barY + 0.19, -0.02, neck, 0.004); }
    const pad = M(new THREE.BoxGeometry(0.22, 0.05, 0.07), toon('#201e1d'), 0, barY + 0.04, -0.02, neck, 0.004);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.2), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide })); scr.position.set(0, 0.74, 0.15); scr.rotation.x = -0.35; neck.add(scr);
    // jet nozzle + water cannon on the nose
    const nz = M(new THREE.CylinderGeometry(0.1, 0.14, 0.25, 12), grey, 0, 0.12, -1.3, body, 0.01, 0.14); nz.rotation.x = Math.PI / 2; const jet = new THREE.Object3D(); jet.position.set(0, 0.12, -1.45); body.add(jet); V.jet = jet;
    const can = new THREE.Group(); can.position.set(0, 0.5, 1.15); body.add(can); V.cannon = can; const cb = M(new THREE.CylinderGeometry(0.06, 0.08, 0.4, 10), toon('#e6b45a'), 0, 0, 0.15, can, 0.006); cb.rotation.x = Math.PI / 2; M(new THREE.TorusGeometry(0.07, 0.015, 6, 12), blue, 0, 0, 0.36, can, 0);
    const mz = new THREE.Object3D(); mz.position.set(0, 0, 0.42); can.add(mz); V.muzzle = mz;
    const ex = new THREE.Object3D(); ex.position.set(0, 0.2, -1.3); body.add(ex); V.exhaust = ex;
    V.seat = new THREE.Vector3(0, 0.35, -0.4); V.pose = 'ski'; root.userData.V = V; return root;
  }
  function surf() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body };
    const red = toon('#ec3013'), white = toon('#f3f2f2'), dark = toon('#201e1d');
    // board outline: rounded pointed nose, squash tail; thin extrude with a slight rocker made by two tilted halves
    const L0 = 1.15, W0 = 0.3, sh = new THREE.Shape(); sh.moveTo(-0.14, -L0 + 0.02); sh.quadraticCurveTo(-W0, -0.6, -W0, 0.05); sh.quadraticCurveTo(-0.27, 0.8, 0, L0); sh.quadraticCurveTo(0.27, 0.8, W0, 0.05); sh.quadraticCurveTo(W0, -0.6, 0.14, -L0 + 0.02); sh.lineTo(-0.14, -L0 + 0.02);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 14 }); g.rotateX(-Math.PI / 2); g.translate(0, 0.06, 0);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const z = -p.getZ(i); p.setY(i, p.getY(i) + Math.pow(Math.max(0, z - 0.4) / 0.75, 2) * 0.16 + Math.pow(Math.max(0, -z - 0.7) / 0.45, 2) * 0.04); } g.computeVertexNormals();
    const deck = M(g, white, 0, 0, 0, body, 0.012); deck.scale.z = -1;
    // stripe + 8 decal + traction pad, on a canvas laid on the deck
    { const c = document.createElement('canvas'); c.width = 128; c.height = 512; const x = c.getContext('2d'); x.fillStyle = '#ec3013'; x.fillRect(58, 0, 12, 512); x.fillRect(0, 300, 128, 10); x.fillStyle = '#201e1d'; x.fillRect(14, 420, 100, 80);
      x.fillStyle = '#ec3013'; x.beginPath(); x.arc(64, 160, 40, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = '900 56px Archivo, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('8', 64, 163);
      const t = new THREE.CanvasTexture(c); const top = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.9), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); top.rotation.x = -Math.PI / 2; top.position.set(0, 0.142, -0.02); body.add(top); V.decal = top; }
    // red rails underneath + three fins + leash
    const rail = M(g.clone(), red, 0, -0.03, 0, body, 0); rail.scale.set(1.03, 0.5, -1.02);
    for (const [x, z, h] of [[0, -0.95, 0.2], [-0.17, -0.82, 0.14], [0.17, -0.82, 0.14]]) { const f = M(new THREE.BoxGeometry(0.02, h, 0.16), dark, x, -h / 2 + 0.01, z, body, 0.004); f.rotation.x = 0.25; }
    const leash = M(new THREE.TorusGeometry(0.1, 0.008, 4, 14, Math.PI * 1.3), dark, 0.05, 0.16, -1.05, body, 0); leash.rotation.x = Math.PI / 2;
    const ex = new THREE.Object3D(); ex.position.set(0, 0.1, -1.1); body.add(ex); V.exhaust = ex; V.jet = ex;
    V.seat = new THREE.Vector3(0, 0.15, 0); V.pose = 'surf'; root.userData.V = V; return root;
  }
  function chute() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body };
    const red = toon('#ec3013'), white = toon('#f3f2f2'), dark = toon('#201e1d'), grey = toon('#64748b');
    // harness: seat board, back protector, red speed-bag pod over the legs, carabiners
    M(new THREE.BoxGeometry(0.5, 0.08, 0.45), dark, 0, 0.42, 0, body, 0.008);
    const back = M(new THREE.BoxGeometry(0.5, 0.7, 0.16), dark, 0, 0.75, -0.25, body, 0.01); back.rotation.x = -0.25;
    const pod = M(new THREE.CapsuleGeometry(0.22, 0.6, 4, 10), red, 0, 0.42, 0.45, body, 0.012); pod.rotation.x = Math.PI / 2 - 0.15; pod.scale.set(1.1, 1, 0.75);
    M(new THREE.BoxGeometry(0.3, 0.12, 0.25), grey, 0, 0.28, -0.12, body, 0.006); // reserve
    for (const sx of [-1, 1]) M(new THREE.TorusGeometry(0.05, 0.012, 4, 10), toon('#e6b45a'), sx * 0.28, 1.05, 0, body, 0);
    // ROUND CANOPY: 12 alternating red/white gores, vent cap with the 8, lines to the rim
    const wing = new THREE.Group(); wing.position.set(0, 1.05, 0); body.add(wing); V.wing = wing;
    const H = 5.4, Rs = 3.3, th = 1.15, rimY = H - Rs + Rs * Math.cos(th), rimR = Rs * Math.sin(th), G = 12, linePts = [];
    // canopy texture in polar space: player 8 crest in the middle, red/white hypnotic spiral from the crest rim to the canopy edge
    const ctex = (() => { const N = 512, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), im = g.createImageData(N, N), r0 = 0.24, turns = 3.2;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const dx = (x + 0.5) / N * 2 - 1, dy = (y + 0.5) / N * 2 - 1, r = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), k = (y * N + x) * 4;
        const ph = ((r - r0) / (1 - r0)) * turns + ang / (Math.PI * 2); const f = ph - Math.floor(ph), edge = Math.min(Math.abs(f - 0.5), f, 1 - f);
        let col = f < 0.5 ? [14, 127, 184] : [243, 242, 242]; if (edge < 0.025) col = [32, 30, 29];
        im.data[k] = col[0]; im.data[k + 1] = col[1]; im.data[k + 2] = col[2]; im.data[k + 3] = 255; }
      g.putImageData(im, 0, 0); g.strokeStyle = '#201e1d'; g.lineWidth = 6; g.beginPath(); g.arc(N / 2, N / 2, N / 2 - 3, 0, 7); g.stroke();
      // crest (same design as the armour medallion), scaled into the centre
      const cx = N / 2, R = r0 * N / 2, sc = R / 126; g.save(); g.translate(cx, cx); g.scale(sc, sc); g.translate(-128, -128);
      g.fillStyle = '#201e1d'; g.beginPath(); g.arc(128, 128, 132, 0, 7); g.fill();
      g.fillStyle = '#0e7fb8'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill(); g.fillStyle = '#7dd3fc'; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(128, 128, 106, 0, 7); g.fill(); g.fillStyle = '#0b1430'; g.beginPath(); g.arc(128, 128, 90, 0, 7); g.fill();
      g.strokeStyle = '#ffffff'; g.globalAlpha = 0.35; g.lineWidth = 3; g.beginPath(); g.arc(128, 128, 80, 0, 7); g.stroke(); g.globalAlpha = 1;
      g.lineCap = 'round'; const eight = () => { g.beginPath(); g.ellipse(128, 92, 30, 28, 0, 0, 7); g.moveTo(164, 166); g.ellipse(128, 166, 36, 32, 0, 0, 7); };
      g.strokeStyle = '#7dd3fc'; g.lineWidth = 25; eight(); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 18; eight(); g.stroke();
      g.fillStyle = '#05070f'; g.beginPath(); g.ellipse(128, 92, 19, 17, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(128, 166, 24, 21, 0, 0, 7); g.fill(); g.restore();
      const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; })();
    const cg = new THREE.SphereGeometry(Rs, 48, 14, 0, Math.PI * 2, 0, th); { const p = cg.attributes.position, uv = cg.attributes.uv; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), pol = Math.acos(Math.max(-1, Math.min(1, y / Rs))) / th, az = Math.atan2(z, x); uv.setXY(i, 0.5 + Math.cos(az) * pol * 0.5, 0.5 - Math.sin(az) * pol * 0.5); } uv.needsUpdate = true; }
    const canopy = new THREE.Mesh(cg, new THREE.MeshToonMaterial({ map: ctex, gradientMap: toon('#fff').gradientMap, side: THREE.DoubleSide })); canopy.position.y = H - Rs; canopy.castShadow = true; wing.add(canopy); V.canopy = canopy;
    for (let i = 0; i < G; i++) { const q = i / G * Math.PI * 2; linePts.push(0, 0, 0, Math.sin(q) * rimR, rimY, Math.cos(q) * rimR); }
    const rim = M(new THREE.TorusGeometry(rimR, 0.03, 4, 36), dark, 0, rimY, 0, wing, 0); rim.rotation.x = Math.PI / 2;
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3)); wing.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x3a3836 })));
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(new Array(12).fill(0), 3)); const brakes = new THREE.LineSegments(bg, new THREE.LineBasicMaterial({ color: 0xec3013 })); wing.add(brakes); V.brakes = brakes;
    V.tipL = new THREE.Object3D(); V.tipL.position.set(-rimR, rimY, 0); V.tipR = new THREE.Object3D(); V.tipR.position.set(rimR, rimY, 0);
    const pack = M(new THREE.BoxGeometry(0.42, 0.42, 0.2), red, 0, 0.8, -0.38, body, 0.008); V.pack = pack;
    V.cells = []; V.wingH = H;
    const ex = new THREE.Object3D(); ex.position.set(0, 0.3, -0.4); body.add(ex); V.exhaust = ex;
    const mz = new THREE.Object3D(); mz.position.set(0, 0.2, 0.2); body.add(mz); V.muzzle = mz;
    V.seat = new THREE.Vector3(0, 0.42, 0.02); V.pose = 'glide'; root.userData.V = V; return root;
  }
  function hang() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body, cells: [] };
    const red = toon('#ec3013'), white = toon('#f3f2f2'), dark = toon('#201e1d'), alu = toon('#cbd5e1');
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z), tb = (p, q, r = 0.03, mat = dark, parent = body) => { const d = new THREE.Vector3().subVectors(q, p), m = M(new THREE.CylinderGeometry(r, r, d.length(), 8), mat, (p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2, parent, 0.006); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
    const wing = new THREE.Group(); wing.position.set(0, 2.55, 0); body.add(wing); V.wing = wing;
    // SAIL: curved delta built from a grid so it can billow (camber between the tubes) + droop toward the tips (anhedral)
    const NZ = 2.0, TX = 5.4, TZ = -1.25, ROOT = -1.55;
    const edgeZ = u => NZ + (TZ - NZ) * u, trailZ = u => ROOT + (TZ - 0.15 - ROOT) * u - Math.sin(u * Math.PI) * 0.35; // scalloped trailing edge
    const sailH = (u, v) => -u * u * 0.35 + Math.sin(v * Math.PI) * (0.32 - u * 0.2) * (1 - u * 0.4);              // u spanwise 0..1, v chordwise 0..1
    const ptAt = (sx, u, v) => new THREE.Vector3(sx * TX * u, sailH(u, v), edgeZ(u) + (trailZ(u) - edgeZ(u)) * v);
    const NU = 14, NV = 6;
    function sailMesh(sx, tex) { const pos = [], uv = [], idx = [];
      for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) { const u = i / NU, v = j / NV, p = ptAt(sx, u, v); pos.push(p.x, p.y, p.z); uv.push(0.5 + sx * u * 0.5, 1 - v); }
      for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const a2 = i * (NV + 1) + j, b2 = a2 + NV + 1; if (sx > 0) idx.push(a2, b2, a2 + 1, b2, b2 + 1, a2 + 1); else idx.push(a2, a2 + 1, b2, b2, a2 + 1, b2 + 1); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ map: tex, gradientMap: toon('#fff').gradientMap, side: THREE.DoubleSide })); m.castShadow = true; wing.add(m); return m; }
    // EAGLE livery painted in (span u, chord v) space: one canvas covers both halves (x = 0.5 ± u/2, y = v)
    const eagle = (() => { const W = 1024, Hh = 512, c = document.createElement('canvas'); c.width = W; c.height = Hh; const g = c.getContext('2d');
      const X = (sx, u) => W * (0.5 + sx * u * 0.5), Y = v => Hh * v, ink = '#201e1d';
      { const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#3a2412'); gr.addColorStop(0.25, '#7a4a24'); gr.addColorStop(0.5, '#8d5629'); gr.addColorStop(0.75, '#7a4a24'); gr.addColorStop(1, '#3a2412'); g.fillStyle = gr; g.fillRect(0, 0, W, Hh); }
      for (const sx of [-1, 1]) { g.fillStyle = '#f3f2f2'; g.beginPath(); g.moveTo(X(sx, 0.62), Hh); g.lineTo(X(sx, 1), Y(0.35)); g.lineTo(X(sx, 1), Hh); g.closePath(); g.fill(); }
      const feather = (x, y, w, h, ang, fill, edge) => { g.save(); g.translate(x, y); g.rotate(ang); g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(-w / 2, h - w / 2); g.quadraticCurveTo(-w / 2, h, 0, h + w * 0.15); g.quadraticCurveTo(w / 2, h, w / 2, h - w / 2); g.lineTo(w / 2, 0); g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 3; g.strokeStyle = ink; g.stroke(); if (edge) { g.strokeStyle = edge; g.lineWidth = 2; g.beginPath(); g.moveTo(0, h * 0.1); g.lineTo(0, h * 0.85); g.stroke(); } g.restore(); };
      for (const sx of [-1, 1]) {
        // flight feathers: secondaries along the back, long dark primaries fanning out like fingers at the tips
        for (let k = 0; k < 11; k++) { const u = 0.1 + k / 10 * 0.56; feather(X(sx, u), Y(0.55), 56, Y(0.47), sx * -0.03, k % 2 ? '#4a2c15' : '#563318', '#7a5a3a'); }
        for (let k = 0; k < 6; k++) { const u = 0.7 + k * 0.058, len = 0.6 + k * 0.05, ang = sx * -(0.15 + k * 0.13); feather(X(sx, u), Y(0.42), 34, Y(len), ang, '#2a1a10', '#8a7a68');
          g.save(); g.translate(X(sx, u), Y(0.42)); g.rotate(ang); g.fillStyle = '#c9934a'; g.fillRect(-14, Y(len) - 26, 28, 6); g.restore(); }
        // greater coverts: one row of shorter rounded feathers over the flight feathers
        for (let k = 0; k < 16; k++) { const u = 0.08 + k / 15 * 0.86; feather(X(sx, u), Y(0.4), 50, Y(0.24), sx * -0.04, k % 2 ? '#8a5530' : '#7d4b28', '#a4703f'); }
        // lesser coverts: small scallops in rows toward the leading edge, lighter golden-brown
        for (let r = 0; r < 3; r++) for (let k = 0; k < 20; k++) { const u = 0.06 + (k + (r % 2) * 0.5) / 19.5 * 0.9, v = 0.06 + r * 0.1; g.beginPath(); g.ellipse(X(sx, u), Y(v + 0.06), 24, 22, 0, 0, Math.PI); g.fillStyle = ['#b07a3e', '#9c6835', '#8a5a2e'][r]; g.fill(); g.lineWidth = 2.5; g.strokeStyle = ink; g.stroke(); }
        // golden leading-edge band
        g.fillStyle = '#c9934a'; g.fillRect(X(sx, 0) + (sx < 0 ? -W / 2 : 0), 0, W / 2, Y(0.06)); }
      // white tail fan at the centre back
      for (let k = -4; k <= 4; k++) feather(W / 2 + k * 18, Y(0.62), 34, Y(0.36), -k * 0.07, '#f3f2f2', '#c9c4bf');
      g.strokeStyle = 'rgba(32,30,29,0.35)'; g.lineWidth = 5; for (const v of [0.8, 0.9]) { g.beginPath(); g.moveTo(W / 2 - 95, Y(v)); g.quadraticCurveTo(W / 2, Y(v + 0.03), W / 2 + 95, Y(v)); g.stroke(); } g.strokeStyle = ink;
      // white head + neck ruff at the nose, hooked yellow beak, fierce eyes
      g.fillStyle = '#f3f2f2'; g.strokeStyle = ink; g.lineWidth = 4;
      g.beginPath(); g.ellipse(W / 2, Y(0.2), 80, Y(0.22), 0, 0, Math.PI * 2); g.fill(); g.stroke();
      for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(W / 2 + k * 22 - 14, Y(0.36)); g.lineTo(W / 2 + k * 22, Y(0.46)); g.lineTo(W / 2 + k * 22 + 14, Y(0.36)); g.closePath(); g.fillStyle = '#f3f2f2'; g.fill(); g.lineWidth = 2.5; g.stroke(); }
      g.beginPath(); g.moveTo(W / 2 - 34, Y(0.13)); g.quadraticCurveTo(W / 2 - 30, Y(0.0), W / 2, Y(-0.01)); g.quadraticCurveTo(W / 2 + 30, Y(0.0), W / 2 + 34, Y(0.13)); g.quadraticCurveTo(W / 2 + 10, Y(0.07), W / 2, Y(0.1)); g.quadraticCurveTo(W / 2 - 10, Y(0.07), W / 2 - 34, Y(0.13)); g.fillStyle = '#ffc21a'; g.fill(); g.lineWidth = 3.5; g.stroke();
      g.beginPath(); g.moveTo(W / 2 - 18, Y(0.04)); g.quadraticCurveTo(W / 2, Y(0.075), W / 2 + 18, Y(0.04)); g.lineWidth = 2.5; g.stroke(); for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(W / 2 + sx * 12, Y(0.05), 4, 2.5, 0, 0, 7); g.fillStyle = ink; g.fill(); }
      for (const sx of [-1, 1]) { const ex = W / 2 + sx * 42, ey = Y(0.16); g.beginPath(); g.ellipse(ex, ey, 15, 11, sx * 0.3, 0, Math.PI * 2); g.fillStyle = '#ffc21a'; g.fill(); g.lineWidth = 3; g.stroke(); g.beginPath(); g.arc(ex + sx * 2, ey, 6, 0, 7); g.fillStyle = ink; g.fill();
        g.beginPath(); g.moveTo(ex - sx * 24, ey - 6); g.lineTo(ex + sx * 22, ey - 20); g.lineWidth = 7; g.strokeStyle = '#3a3836'; g.stroke(); g.strokeStyle = ink; }
      const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; })();
    V.sails = [sailMesh(1, eagle), sailMesh(-1, eagle)];
    // battens (ribs) across the sail
    const tb2 = (p, q, r, mat) => { const d = new THREE.Vector3().subVectors(q, p), m = M(new THREE.CylinderGeometry(r, r, d.length(), 6), mat, (p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2, wing, 0); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
    for (const sx of [-1, 1]) for (let k = 1; k <= 5; k++) { const u = k / 6.2; let prev = ptAt(sx, u, 0.04); for (let j = 1; j <= 4; j++) { const p = ptAt(sx, u, 0.04 + j * 0.24); p.y += 0.012; tb2(prev, p, 0.01, toon('#3d2412')); prev = p; } }
    // leading-edge tubes follow the drooping edge; fairings at the tips
    for (const sx of [-1, 1]) { let prev = ptAt(sx, 0, 0); for (let i = 1; i <= 8; i++) { const p = ptAt(sx, i / 8, 0); tb(prev, p, 0.05, alu, wing); prev = p; } const tip = ptAt(sx, 1, 0.5); const f = M(new THREE.BoxGeometry(0.06, 0.28, 0.9), white, tip.x + sx * 0.02, tip.y + 0.06, tip.z + 0.1, wing, 0.008); f.rotation.z = sx * 0.25; }
    // nose cone + keel + crossbar + king post + rigging
    const nose = M(new THREE.ConeGeometry(0.09, 0.3, 10), red, 0, 0.02, NZ + 0.12, wing, 0.006); nose.rotation.x = Math.PI / 2;
    tb(new THREE.Vector3(0, -0.04, NZ), new THREE.Vector3(0, -0.04, ROOT - 0.15), 0.04, alu, wing);
    const xl = ptAt(-1, 0.45, 0.32), xr = ptAt(1, 0.45, 0.32); xl.y -= 0.05; xr.y -= 0.05; tb(xl, xr, 0.035, alu, wing);
    tb(new THREE.Vector3(0, 0, 0.1), new THREE.Vector3(0, 0.95, 0.1), 0.03, dark, wing); M(new THREE.SphereGeometry(0.05, 8, 6), red, 0, 0.97, 0.1, wing, 0);
    const wl = []; const KP = [0, 0.95, 0.1]; for (const p of [ptAt(1, 1, 0.02), ptAt(-1, 1, 0.02), ptAt(1, 0.55, 0.1), ptAt(-1, 0.55, 0.1)]) wl.push(...KP, p.x, p.y, p.z); wl.push(...KP, 0, 0, NZ, ...KP, 0, 0, ROOT);
    // A-frame + control bar
    const bar = [new THREE.Vector3(-0.75, -1.45, 0.55), new THREE.Vector3(0.75, -1.45, 0.55)]; for (const bb of bar) { tb(new THREE.Vector3(0, -0.05, 0.15), bb, 0.03, dark, wing); const tp = ptAt(Math.sign(bb.x), 1, 0.02); wl.push(bb.x, bb.y, bb.z, tp.x, tp.y, tp.z, bb.x, bb.y, bb.z, 0, 0, NZ * 0.95, bb.x, bb.y, bb.z, 0, 0, ROOT); }
    tb(bar[0], bar[1], 0.035, alu, wing); for (const sx of [-1, 1]) M(new THREE.CylinderGeometry(0.045, 0.045, 0.24, 8), red, sx * 0.45, -1.45, 0.55, wing, 0.004).rotation.z = Math.PI / 2;
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(wl, 3)); wing.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x3a3836 })));
    // 8 decal on top of each wing half + streamers at the tips
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; { const g = cv.getContext('2d'); g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.fillStyle = '#201e1d'; g.font = '900 100px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 64, 70); }
    const e8m = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, side: THREE.DoubleSide });
    V.streamers = []; for (const sx of [-1, 1]) { const tp = ptAt(sx, 1, 1); const st = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 1.0), new THREE.MeshBasicMaterial({ color: 0xffd23a, side: THREE.DoubleSide })); st.geometry.translate(0, -0.5, 0); st.rotation.x = Math.PI / 2; st.position.set(tp.x, tp.y, tp.z); wing.add(st); V.streamers.push(st); }
    // hang strap + pod harness (red) follows the pilot
    V.strap = tb(V3(0, 2.55, 0.15), V3(0, 1.45, 0), 0.015, dark);
    const ex = new THREE.Object3D(); ex.position.set(0, 0.5, -0.4); body.add(ex); V.exhaust = ex;
    const mz = new THREE.Object3D(); mz.position.set(0, 0.5, 0.2); body.add(mz); V.muzzle = mz;
    V.seat = new THREE.Vector3(0, 0.05, 0.1); V.pose = 'hang'; root.userData.V = V; return root;
  }
  function pogo() {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const V = { wheels: [], steer: [], body };
    const red = toon('#ec3013'), dark = toon('#201e1d'), alu = toon('#cbd5e1'), gold = toon('#e6b45a'), white = toon('#f3f2f2');
    // fixed lower: rubber foot + piston + exposed coil spring
    M(new THREE.CylinderGeometry(0.06, 0.075, 0.1, 12), dark, 0, 0.05, 0, body, 0.008);
    M(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 10), alu, 0, 0.38, 0, body, 0.006);
    M(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), dark, 0, 0.1, 0, body, 0.004);
    const pts = []; for (let i = 0; i <= 140; i++) { const t = i / 140, a = t * Math.PI * 2 * 8; pts.push(new THREE.Vector3(Math.cos(a) * 0.055, t * 0.32, Math.sin(a) * 0.055)); }
    const spring = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 280, 0.011, 6), gold); spring.position.y = 0.11; spring.castShadow = true; body.add(spring); V.spring = spring;
    // moving upper: housing tube, foot pegs, handlebar with grips, 8 badge
    const up = new THREE.Group(); body.add(up); V.upper = up;
    M(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 14), dark, 0, 0.44, 0, up, 0.006);
    M(new THREE.CylinderGeometry(0.045, 0.045, 0.66, 12), red, 0, 0.79, 0, up, 0.01, 0.045);
    M(new THREE.BoxGeometry(0.1, 0.07, 0.1), dark, 0, 0.46, 0, up, 0.006);
    for (const sx of [-1, 1]) { M(new THREE.BoxGeometry(0.16, 0.035, 0.09), dark, sx * 0.13, 0.46, -0.01, up, 0.006); M(new THREE.BoxGeometry(0.14, 0.012, 0.08), toon('#3a3836'), sx * 0.13, 0.482, -0.01, up, 0); }
    const HBY = 1.12; const hb = M(new THREE.CylinderGeometry(0.025, 0.025, 0.62, 10), dark, 0, HBY, 0, up, 0.006); hb.rotation.z = Math.PI / 2;
    M(new THREE.BoxGeometry(0.1, 0.08, 0.08), dark, 0, HBY, 0, up, 0.006);
    for (const sx of [-1, 1]) { M(new THREE.CylinderGeometry(0.036, 0.036, 0.13, 10), red, sx * 0.27, HBY, 0, up, 0.005).rotation.z = Math.PI / 2; M(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 10), dark, sx * 0.345, HBY, 0, up, 0).rotation.z = Math.PI / 2; }
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; { const g = cv.getContext('2d'); g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#201e1d'; g.stroke(); g.fillStyle = '#201e1d'; g.font = '900 92px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 64, 70); }
    const badge = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) })); badge.position.set(0, 0.92, 0.047); up.add(badge);
    for (const y of [0.68, 1.04]) M(new THREE.CylinderGeometry(0.048, 0.048, 0.03, 12), white, 0, y, 0, up, 0);
    const ex = new THREE.Object3D(); ex.position.set(0, 0.1, 0); body.add(ex); V.exhaust = ex;
    V.seatParent = up; V.seatLocal = new THREE.Vector3(0, 0.49, -0.2); V.seat = V.seatLocal.clone(); V.pose = 'pogo'; root.userData.V = V; return root;
  }
  function make(key) { const g = key === 'tank' ? tank() : key === 'moto' ? moto() : key === 'racecar' ? racecar() : key === 'mech' ? mech() : key === 'bike' ? bike() : key === 'skate' ? skate() : key === 'heli' ? heli() : key === 'jetski' ? jetski() : key === 'surf' ? surf() : key === 'pogo' ? pogo() : key === 'glider' ? hang() : key === 'chute' ? chute() : truck(); g.userData.V.spec = VEHICLES[key]; g.userData.V.key = key; return g; }
  return { make };
}
