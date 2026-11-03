// MERU 2.0 — s133: ROBOT FACTORY STREET BATTLE (Ben s133; roster MERU_CLUSTER_ROSTER.md "MACHINE FLEET ROBOT FACTORY").
// Fought IN PLACE: stage 1 = the street in front of the factory door (the real Meru 2 map), then 3 rooms inside (quick fade, far under
// the map like the cluster lobbies): 2 ASSEMBLY LINE · 3 LOADING BAY · 4 BOSS ROOM (MAKER PRIME [mfFactoryBoss], the robot-builder machine).
// Robots [mfWildBot*]: WALKER (melee) · LASER BOT (cover AI: runs to cover, ducks, red !, pops out, 2 shots) · CHARGER (red lane, rolls,
// DIZZY on a wall) · SHIELD BOT (front shield, a swing knocks it open) · DRONE (flies round you, blinks, dives) · REPAIR BOT (green beam heals
// the others) · BUILDER (the spawner: builds new robots on its pad) · MINI-BOT (runs in, beeps, red ring, boom; hurts robots too) ·
// TURRET (fixed; HACK its console = it shoots robots). Cover: barriers, parked cars, crates (break), conveyors, the truck.
// Extras: 3 trapped workers in scrap cages (+25 G each), the foreman's lunchbox (loading bay → back to the foreman).
// Contract (meru2-walk.js): spots, tick(dt, P, fox), attack(kind, P, fox, k) → true when the factory took the swing, on(), hp/max/heal/foes,
// groundAt, inside, where, camFix, toast. Progress: stat factoryStage (stages cleared), flags robotFactoryCleared + mfFavour on the boss.
import { makeRoomKit } from './meru2-roomkit.js';

const INK = '#24282c', STEEL = '#6b737b', LIGHT = '#8a9099', RED = '#ec3013', EYE = '#ff3b1f', HAZ = '#facc15', BLUE = '#3fd3ff', GREEN = '#3fdc7a';
const ST = { walker: { hp: 70, spd: 3.2, R: 0.5 }, laser: { hp: 60, spd: 2.9, R: 0.55 }, charger: { hp: 80, spd: 2.4, R: 0.75 }, shield: { hp: 110, spd: 2.0, R: 0.6 },
  drone: { hp: 25, spd: 5, R: 0.45, fly: 2.6 }, repair: { hp: 50, spd: 3.2, R: 0.5, fly: 1.5 }, builder: { hp: 220, spd: 0, R: 1.3 }, exploder: { hp: 20, spd: 5.2, R: 0.4 }, turret: { hp: 200, spd: 0, R: 0.7 } };
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

export function buildFactory({ THREE, scene, kit, cols, save, L, frame, touch = false, audio = () => null, terrainAt = () => 0, go, meleeK = () => 1 }) {
  const stub = { spots: [], tick() {}, attack: () => false, on: () => false, hp: () => 100, max: () => 100, heal: n => n, foes: () => 0, groundAt: () => null, inside: () => false, where: () => null, camFix() {}, toast: () => '', stats: { off: true } };
  if (!frame || !frame.D || save.flag('robotFactoryCleared')) return stub;
  const K = makeRoomKit({ THREE, touch }), D = frame.D, BT = frame.BT || { w: 20, d: 20 }, cs = Math.cos(D.ry), sn = Math.sin(D.ry);
  const W = (lx, lz) => [D.x + lx * cs + lz * sn, D.z - lx * sn + lz * cs];
  const LOC = (x, z) => { const dx = x - D.x, dz = z - D.z; return [dx * cs - dz * sn, dx * sn + dz * cs]; };
  const FY = -220, FZ = -1800, CAP = touch ? 8 : 12, rnd = Math.random;
  const EG = new THREE.Group(); EG.name = 'meruFactoryStreet'; scene.add(EG);
  const IG = new THREE.Group(); IG.name = 'meruFactoryRooms'; IG.visible = false; scene.add(IG);
  const sb = K.Bin(), sbM = sb, rb = K.Bin(), SPOTS = [], BOXG = new THREE.BoxGeometry(1, 1, 1);
  const snd = { burst(d, f, v) { const c = audio(); if (!c) return; const b = c.createBuffer(1, Math.max(1, c.sampleRate * d | 0), c.sampleRate), a = b.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / a.length); const n = c.createBufferSource(); n.buffer = b; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; const g = c.createGain(); g.gain.value = v; n.connect(bp); bp.connect(g); g.connect(c.destination); n.start(); },
    tone(f, d, v, type = 'sine') { const c = audio(); if (!c) return; const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d + 0.02); } };

  // ---------- robot parts (merged once per part, shared by every robot) ----------
  const TP = {};
  const T = (k, fn) => { if (TP[k]) return TP[k]; const b = K.Bin(); fn(b); const g = new THREE.Group(), out = b.build(g) || {}; const ms = g.children.length ? g.children.slice() : Object.values(out); return (TP[k] = ms.map(m => [m.geometry, m.material])); };
  const mk = (list, parent) => { const g = new THREE.Group(); for (const [geo, mat] of list) g.add(new THREE.Mesh(geo, mat)); if (parent) parent.add(g); return g; };
  const LEG = () => T('leg', b => { b.box('mat', INK, 0.24, 0.72, 0.3, 0, -0.36, 0); b.box('mat', INK, 0.3, 0.12, 0.46, 0, -0.7, 0.06); });
  const WBODY = (k, body, visor) => T('wb' + k, b => { b.box('gls', body, 0.8, 0.8, 0.55, 0, 1.15, 0); b.box('glo', visor, 0.82, 0.1, 0.57, 0, 1.42, 0); for (const sx of [-0.52, 0.52]) b.box('gls', '#5d636b', 0.18, 0.7, 0.2, sx, 1.08, 0.04);
    b.box('gls', LIGHT, 0.55, 0.4, 0.48, 0, 1.8, 0); b.box('glo', EYE, 0.42, 0.09, 0.03, 0, 1.83, 0.25); b.box('mat', INK, 0.04, 0.35, 0.04, 0.18, 2.15, 0); });
  function body(t) { const g = new THREE.Group(), p = {};
    if (t === 'walker' || t === 'shield') { for (const s of [-1, 1]) { const l = mk(LEG(), g); l.position.set(s * 0.26, 0.76, 0); if (s < 0) p.lL = l; else p.lR = l; }
      p.b = mk(t === 'walker' ? WBODY('w', STEEL, RED) : WBODY('s', '#4b5563', HAZ), g);
      if (t === 'shield') { p.sh = mk(T('shield', b => { b.box('gls', '#3d3b3a', 1.3, 1.5, 0.12, 0, 0, 0); for (const y of [0.45, -0.45]) b.box('glo', RED, 1.1, 0.1, 0.02, 0, y, 0.07); b.box('mat', '#5d636b', 0.12, 1.5, 0.16, 0, 0, 0.02); }), g); p.sh.position.set(0, 1.12, 0.58); } }
    else if (t === 'laser') { mk(T('lbase', b => { for (const sx of [-0.38, 0.38]) b.cyl('mat', INK, 0.28, 0.2, sx, 0.28, 0, 10, 0, Math.PI / 2); b.box('mat', '#3d3b3a', 0.9, 0.25, 0.8, 0, 0.45, 0); }), g);
      p.b = mk(T('lbody', b => { b.box('gls', STEEL, 0.7, 0.75, 0.6, 0, 0.95, 0); b.box('glo', RED, 0.72, 0.08, 0.62, 0, 1.2, 0); b.sph('gls', LIGHT, 0.32, 0, 1.5, 0, 0.8); b.box('glo', EYE, 0.3, 0.08, 0.03, 0, 1.55, 0.27);
        b.box('mat', INK, 0.14, 0.14, 0.7, 0.45, 1.05, 0.25); b.box('glo', EYE, 0.1, 0.1, 0.06, 0.45, 1.05, 0.62); }), g); }
    else if (t === 'charger') { p.ball = mk(T('ball', b => { b.sph('gls', '#5d636b', 0.72, 0, 0, 0, 1, 12); b.tor('glo', RED, 0.73, 0.06, 0, 0, 0); b.box('mat', INK, 0.3, 0.3, 0.3, 0, 0.62, 0.3); }), g); p.ball.position.y = 0.72;
      mk(T('ccap', b => { b.box('glo', EYE, 0.7, 0.14, 0.06, 0, 0.95, 0.7); b.box('mat', INK, 0.8, 0.1, 0.1, 0, 1.06, 0.68); }), g); }
    else if (t === 'drone') p.b = mk(T('drone', b => { b.cyl('gls', '#5d636b', 0.42, 0.16, 0, 0, 0, 12); b.box('glo', EYE, 0.22, 0.08, 0.04, 0, -0.02, 0.42); b.sph('gls', LIGHT, 0.2, 0, 0.12, 0, 0.7);
      for (const a of [Math.PI / 4, -Math.PI / 4]) b.box('mat', INK, 1.3, 0.05, 0.08, 0, 0.05, 0, a); for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; b.cyl('mat', '#9aa0a6', 0.22, 0.02, Math.sin(a) * 0.62, 0.1, Math.cos(a) * 0.62, 10); } }), g);
    else if (t === 'repair') p.b = mk(T('repair', b => { b.sph('gls', '#e7e4dc', 0.45, 0, 0, 0, 0.85, 10); b.box('glo', GREEN, 0.3, 0.08, 0.03, 0, 0.02, 0.42); b.box('glo', GREEN, 0.08, 0.3, 0.03, 0, 0.02, 0.42); b.tor('glo', GREEN, 0.5, 0.03, 0, -0.1, 0, Math.PI / 2); b.box('mat', INK, 0.03, 0.4, 0.03, 0, 0.55, 0); b.sph('glo', GREEN, 0.06, 0, 0.78, 0); }), g);
    else if (t === 'builder') { mk(T('bbase', b => { for (const sx of [-0.95, 0.95]) b.box('mat', INK, 0.5, 0.6, 2.2, sx, 0.3, 0); b.box('gls', HAZ, 1.6, 1.3, 1.6, 0, 1.25, 0); b.box('mat', INK, 1.62, 0.16, 1.62, 0, 1.0, 0); b.box('glo', EYE, 1.0, 0.18, 0.04, 0, 1.6, 0.81); b.box('mat', INK, 0.25, 1.4, 0.25, 0, 2.6, -0.4);
        b.box('mat', '#3d3b3a', 1.4, 0.06, 1.4, 0, 0.03, 2.4); b.box('glo', BLUE, 1.3, 0.02, 0.06, 0, 0.07, 1.75); b.box('glo', BLUE, 1.3, 0.02, 0.06, 0, 0.07, 3.05); }), g);
      p.arm = mk(T('barm', b => { b.box('gls', HAZ, 0.22, 0.22, 2.6, 0, 0, 1.2); b.box('mat', INK, 0.03, 0.9, 0.03, 0, -0.45, 2.4); b.box('mat', INK, 0.5, 0.3, 0.3, 0, -0.95, 2.4); }), g); p.arm.position.set(0, 3.25, -0.4);
      p.fr = mk(T('bframe', b => { for (const [x, z] of [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]]) b.box('glo', BLUE, 0.06, 2.0, 0.06, x, 1.0, z); b.box('glo', BLUE, 1.16, 0.06, 1.16, 0, 2.0, 0); }), g); p.fr.position.set(0, 0, 2.4); p.fr.visible = false; }
    else if (t === 'exploder') { mk(T('ex', b => { b.box('gls', '#3d3b3a', 0.55, 0.45, 0.6, 0, 0.42, 0); b.box('glo', HAZ, 0.57, 0.08, 0.62, 0, 0.5, 0); for (const sx of [-0.3, 0.3]) for (const sz of [-0.2, 0.2]) b.cyl('mat', INK, 0.12, 0.08, sx, 0.13, sz, 8, 0, Math.PI / 2); }), g);
      p.lt = mk(T('exl', b => { b.sph('glo', EYE, 0.12, 0, 0.75, 0); }), g); }
    else if (t === 'turret') { mk(T('tpost', b => { b.cyl('mat', INK, 0.3, 1.6, 0, 0.8, 0, 10); b.box('mat', '#3d3b3a', 1.2, 0.2, 1.2, 0, 0.1, 0); }), g);
      const head = (k, eye) => T(k, b => { b.box('gls', STEEL, 0.9, 0.55, 0.9, 0, 0, 0); b.box('glo', eye, 0.92, 0.08, 0.92, 0, -0.18, 0); for (const sx of [-0.18, 0.18]) b.box('mat', INK, 0.16, 0.16, 0.9, sx, 0, 0.6); b.box('glo', eye, 0.5, 0.1, 0.03, 0, 0.12, 0.46); });
      p.hr = mk(head('thr', EYE), g); p.hb = mk(head('thb', BLUE), g); p.hr.position.y = p.hb.position.y = 1.85; p.hb.visible = false; }
    return { g, p }; }

  // ---------- fx: text, bolts, beams, puffs, telegraphs ----------
  const TXC = {};
  function txtTex(s, red) { const k = s + (red ? 1 : 0); if (TXC[k]) return TXC[k]; const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'); let fs = 60; g.font = `900 ${fs}px Archivo, Helvetica, sans-serif`; while (g.measureText(s).width > 460 && fs > 28) { fs -= 4; g.font = `900 ${fs}px Archivo, Helvetica, sans-serif`; }
    const w = Math.min(512, g.measureText(s).width + 40); g.fillStyle = red ? RED : '#f3f2f2'; g.fillRect(256 - w / 2, 16, w, 100); g.fillStyle = '#201e1d'; g.fillRect(256 - w / 2, 16, w, 8); g.fillStyle = red ? '#f3f2f2' : '#201e1d'; g.textBaseline = 'middle'; g.fillText(s, 256 - w / 2 + 20, 72);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return (TXC[k] = t); }
  const FL = []; let barkT = 0;
  function float(s, x, y, z, red, t = 1.1) { let f = FL.find(q => q.t <= 0); if (!f) { if (FL.length >= 10) f = FL.reduce((a, b) => (a.t < b.t ? a : b)); else { f = { s: new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false })), t: 0 }; f.s.renderOrder = 20; scene.add(f.s); FL.push(f); } }
    f.s.material.map = txtTex(s, red); f.s.material.needsUpdate = true; f.s.position.set(x, y, z); f.s.scale.set(2.6, 0.65, 1); f.s.visible = true; f.t = t; f.t0 = t; }
  const topY = r => baseY(r.S, r.x, r.z) + (r.fly ? r.alt + 0.8 : r.t === 'builder' ? 4.2 : 2.6);
  function bark(r, s) { if (barkT > 0) return; barkT = 0.9; float(s, r.x, topY(r), r.z, false, 1.4); }
  const boltGeo = new THREE.BoxGeometry(0.1, 0.1, 0.75), BM = { e: new THREE.MeshBasicMaterial({ color: 0xff3b1f }), a: new THREE.MeshBasicMaterial({ color: 0x3fd3ff }) }, BOLTS = [];
  function bolt(S, x, y, z, tx, ty, tz, ally, dmg = 9, spd = 14) { let b = BOLTS.find(q => !q.on); if (!b) { b = { m: new THREE.Mesh(boltGeo, BM.e) }; scene.add(b.m); BOLTS.push(b); }
    const dx = tx - x, dy = ty - y, dz = tz - z, l = Math.hypot(dx, dy, dz) || 1; Object.assign(b, { on: true, S, x, y, z, ox: x, oz: z, vx: dx / l * spd, vy: dy / l * spd, vz: dz / l * spd, ally, dmg, life: 2.2 });
    b.m.material = ally ? BM.a : BM.e; b.m.visible = true; b.m.position.set(x, y, z); b.m.lookAt(tx, ty, tz); snd.tone(ally ? 1200 : 520, 0.07, 0.03, 'square'); }
  const lineGeo = new THREE.BoxGeometry(1, 1, 1); lineGeo.translate(0, 0, 0.5);
  const TM = { red: new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0.5, depthWrite: false }), green: new THREE.MeshBasicMaterial({ color: 0x3fdc7a, transparent: true, opacity: 0.6, depthWrite: false }),
    ring: new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }) };
  const ringGeo = new THREE.RingGeometry(0.9, 1, 40); ringGeo.rotateX(-Math.PI / 2);
  const line = (m, ax, ay, az, bx, by, bz, w = 0.05, h = w) => { const l = Math.hypot(bx - ax, by - ay, bz - az) || 0.01; m.position.set(ax, ay, az); m.scale.set(w, h, l); m.lookAt(bx, by, bz); m.visible = true; };
  const telOf = r => r.tel || (r.tel = (() => { const m = new THREE.Mesh(lineGeo, TM.red); m.renderOrder = 5; scene.add(m); return m; })());
  const ringOf = r => r.ring || (r.ring = (() => { const m = new THREE.Mesh(ringGeo, TM.ring); m.renderOrder = 5; scene.add(m); return m; })());
  const beamOf = r => r.beam || (r.beam = (() => { const m = new THREE.Mesh(lineGeo, TM.green); scene.add(m); return m; })());
  const BEAMS = []; const beamMat = () => new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.95, depthWrite: false });
  function beamTo(ax, ay, az, bx, by, bz) { let b = BEAMS.find(q => q.t <= 0); if (!b) { b = { m: new THREE.Mesh(lineGeo, beamMat()), t: 0 }; scene.add(b.m); BEAMS.push(b); } line(b.m, ax, ay, az, bx, by, bz, 0.07); b.t = 0.14; }
  const puffGeo = new THREE.SphereGeometry(1, 8, 6), PUFFS = [];
  function puffAt(x, y, z, s = 1, col = 0xffa53a) { let f = PUFFS.find(q => q.t <= 0); if (!f) { if (PUFFS.length >= 16) return; f = { m: new THREE.Mesh(puffGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, depthWrite: false })), t: 0 }; scene.add(f.m); PUFFS.push(f); }
    f.m.material.color.set(col); f.m.position.set(x, y, z); f.s = s; f.t = 0.45; f.m.visible = true; }
  const slash = (() => { const m = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.05, 4, 16, Math.PI), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false })); m.rotation.x = Math.PI / 2; const g = new THREE.Group(); g.add(m); g.visible = false; scene.add(g); return { g, m, t: 0 }; })();

  // ---------- stages ----------
  const STG = [];
  const baseY = (S, x, z) => (S.room ? FY : terrainAt(x, z));
  const Stage = (i, o) => (STG[i] = { i, robots: [], props: [], cover: [], cages: [], consoles: [], cells: [], parts: [], cleared: false, engaged: false, spawnI: 0, ...o });
  const street = Stage(0, { key: 'street', title: 'STREET', room: false, par: EG, ry: D.ry, toW: (x, z) => W(x, z), inb: (x, z, m = 0) => { const [lx, lz] = LOC(x, z); return lx > -15 - m && lx < 15 + m && lz > 2.5 - m && lz < 27 + m; } });
  const ROOMDEF = [{ key: 'assembly', title: 'ASSEMBLY LINE', ox: -300, w: 34, d: 30, h: 8 }, { key: 'bay', title: 'LOADING BAY', ox: -230, w: 36, d: 30, h: 9 }, { key: 'boss', title: 'MAKER PRIME', ox: -160, w: 36, d: 32, h: 11 }];
  ROOMDEF.forEach((R, k) => Stage(k + 1, { ...R, room: true, par: IG, ry: 0, toW: (x, z) => [R.ox + x, FZ + z], inb: (x, z, m = 0) => Math.abs(x - R.ox) < R.w / 2 - 0.7 + m && Math.abs(z - FZ) < R.d / 2 - 0.7 + m }));
  const [ASM, BAY, BOSS] = [STG[1], STG[2], STG[3]];
  // things already on the street (towers, posts, the foreman's spot) block the robots too
  const near45 = (x0, x1, z0, z1) => x1 > D.x - 45 && x0 < D.x + 45 && z1 > D.z - 45 && z0 < D.z + 45;
  street.ext = [...cols.filter(c => (c.y0 == null || c.y0 < 2) && (c.c ? Math.hypot(c.c[0] - D.x, c.c[1] - D.z) < 45 : c.f && near45(...c.f))), ...((L && L.BUILDINGS) || []).filter(b => b.f && !b.open && near45(...b.f)).map(b => ({ f: b.f }))];
  const inExt = (x, z, r) => street.ext.some(c => c.on !== false && (c.c ? Math.hypot(x - c.c[0], z - c.c[1]) < c.c[2] + r : x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r));
  function free(S, x, z, rad) { if (!S.inb(x, z)) return false; for (const p of S.props) if (!p.dead && Math.hypot(x - p.x, z - p.z) < p.r + rad) return false; if (!S.room && inExt(x, z, rad)) return false; return true; }
  function prop(S, x, z, r, h, o = {}) { const c = { c: [x, z, r], ...(S.room ? { y0: FY - 3, y1: FY + 14 } : {}) }; cols.push(c); const p = { x, z, r, h, col: c, hp: o.hp || 0, max: o.hp || 0, mesh: o.mesh || null, S }; S.props.push(p); return p; }
  function chain(S, x0, z0, x1, z1, r, h) { const l = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(l / (r * 1.3))); for (let i = 0; i <= n; i++) prop(S, x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n, r, h); }
  const crateM = [new THREE.MeshLambertMaterial({ color: 0x8b6a48 }), new THREE.MeshLambertMaterial({ color: 0x7a5236 })];
  function crate(S, x, z, h, hp, ry = 0) { const g = new THREE.Group(), n = h > 1.6 ? 2 : 1; for (let k = 0; k < n; k++) { const m = new THREE.Mesh(BOXG, crateM[k % 2]), s = 1.3 - k * 0.14; m.scale.set(s, h / n, s); m.position.y = h / n * (k + 0.5); m.rotation.y = k * 0.3; g.add(m); }
    g.position.set(x, baseY(S, x, z), z); g.rotation.y = ry; S.par.add(g); return prop(S, x, z, 0.85, h, { hp, mesh: g }); }
  function hitProp(p, dmg) { if (!p.hp || p.dead) return; p.hp -= dmg; if (p.mesh) p.mesh.rotation.z = (rnd() - 0.5) * 0.08;
    if (p.hp <= 0) { p.dead = true; p.col.on = false; if (p.mesh) p.mesh.visible = false; const y = baseY(p.S, p.x, p.z); for (let k = 0; k < 3; k++) puffAt(p.x + (rnd() - 0.5), y + 0.5 + k * 0.5, p.z + (rnd() - 0.5), 0.7, 0x8b6a48); float('COVER BROKEN', p.x, y + 2.4, p.z, true); snd.burst(0.2, 500, 0.2); for (const s of p.S.cover) if (s.p === p) s.by = null; } }
  function coverSpots(S) { S.cover = []; for (const p of S.props) { if (p.h < 0.9 || p.noCover) continue; const rr = p.r + 0.85, n = Math.max(6, Math.round(Math.PI * 2 * rr / 1.3));
      for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, x = p.x + Math.sin(a) * rr, z = p.z + Math.cos(a) * rr; if (!free(S, x, z, 0.5) || S.cover.some(s => Math.hypot(s.x - x, s.z - z) < 1.0)) continue; S.cover.push({ x, z, p, by: null }); } } }
  const scrM = { r: new THREE.MeshBasicMaterial({ color: 0xff3b1f }), b: new THREE.MeshBasicMaterial({ color: 0x3fd3ff }) };
  function consoleAt(S, x, z, ry, con) { const y = baseY(S, x, z), B = S.room ? rb : sb; B.box('mat', '#3d3b3a', 0.8, 1.1, 0.55, x, y + 0.55, z, ry); B.box('glo', HAZ, 0.82, 0.08, 0.57, x, y + 0.2, z, ry);
    const scr = new THREE.Mesh(BOXG, scrM.r); scr.scale.set(0.7, 0.05, 0.45); scr.position.set(x + Math.sin(ry) * 0.05, y + 1.14, z + Math.cos(ry) * 0.05); scr.rotation.set(0.45, ry, 0, 'YXZ'); S.par.add(scr); prop(S, x, z, 0.5, 1.1).noCover = true;
    const C = { S, x, z, con, tur: null, scr, hacked: false }; C.spot = { key: 'mf:hack:' + S.i + ':' + con, x: x + Math.sin(ry) * 1.0, z: z + Math.cos(ry) * 1.0, r: 1.6, y: S.room ? [FY - 1, FY + 3] : [-3, 6], prompt: 'HACK \u00b7 TURRET CONSOLE', use: () => startHack(C) }; SPOTS.push(C.spot); S.consoles[con] = C; return C; }
  const freedList = () => { const v = save.stat('mfWorkersFreed', null); return Array.isArray(v) ? v : []; };
  function cage(S, id, x, z) { if (freedList().includes(id)) return; const y = baseY(S, x, z); const f = kit.makeFox({ key: 'mfTrapped' + id, name: 'Factory Worker', gear: 'none', crest: '', mood: 'neutral', outfit: 'vest', torso: ['#facc15', '#4b5563', '#1f2937'] }); f.position.set(x, y, z); S.par.add(f);
    const cb = K.Bin(); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; cb.box('mat', '#5d636b', 0.08, 2.1, 0.08, Math.sin(a) * 0.78, 1.05, Math.cos(a) * 0.78); } cb.box('mat', '#3d3b3a', 1.8, 0.14, 1.8, 0, 2.15, 0); cb.box('mat', '#3d3b3a', 1.8, 0.1, 1.8, 0, 0.05, 0);
    cb.box('gls', '#8a5a3a', 0.6, 0.3, 0.5, 0.3, 2.35, 0.1, 0.4); cb.box('gls', '#6b6f75', 0.7, 0.2, 0.4, -0.3, 2.32, -0.2, 1.1); cb.box('glo', RED, 0.34, 0.12, 0.04, 0, 1.6, 0.8); const g = new THREE.Group(); cb.build(g); g.position.set(x, y, z); S.par.add(g);
    const pr = prop(S, x, z, 0.9, 2.2); pr.noCover = true; S.cages.push({ id, x, z, f, g, pr, hp: 3, freed: false, t: 0 }); }
  const cellGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.42, 8), cellM = new THREE.MeshBasicMaterial({ color: 0x3fdc7a });
  function dropCell(S, x, z) { if (S.cells.length > 5) return; const m = new THREE.Mesh(cellGeo, cellM); m.position.set(x, baseY(S, x, z) + 0.5, z); S.par.add(m); S.cells.push({ m, x, z, t: 0 }); }

  // ---------- the street (local frame: lx across the face, lz out from the door) ----------
  // s727e (Ben): barricades standing on a SIDEWALK go once the factory is won (robotFactoryCleared): own bin (WG) + their props, see clearWalk()
  const wb = K.Bin(), walkProps = [], onWalkF = (x, z) => (L.ROADS || []).some(r => { const p = r.p; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); if (Math.hypot(x - ax - dx * u, z - az - dz * u) < r.w / 2 + (L.SIDEWALK || 3.3) + 0.6) return true; } return false; });
  { const S = street, ty = (x, z) => terrainAt(x, z);
    const barrier = (lx0, lx1, lz) => { const [x, z] = W((lx0 + lx1) / 2, lz), l = lx1 - lx0; if (inExt(x, z, 1)) return; const y = ty(x, z), ends = [W(lx0, lz), W(lx1, lz)], walk = onWalkF(x, z) || ends.some(e => onWalkF(e[0], e[1])), sb = walk ? wb : sbM, n0 = S.props.length; sb.box('mat', '#c9c2b0', l, 0.95, 0.62, x, y + 0.475, z, D.ry); sb.box('mat', '#a8a196', l + 0.04, 0.14, 0.7, x, y + 0.07, z, D.ry);
      for (let k = 0; k < Math.floor(l / 0.8); k++) { const [sx, sz] = W(lx0 + 0.4 + k * 0.8, lz + 0.32); sb.box('glo', k % 2 ? '#f3f2f2' : RED, 0.4, 0.14, 0.02, sx, y + 0.72, sz, D.ry); }
      const [ax, az] = W(lx0 + 0.5, lz), [bx, bz] = W(lx1 - 0.5, lz); chain(S, ax, az, bx, bz, 0.5, 1.1); if (walk) walkProps.push(...S.props.slice(n0)); };
    const car = (lx, lz, a, col) => { const ry = D.ry + a, [x, z] = W(lx, lz); if (inExt(x, z, 2)) return; const y = ty(x, z), fx = Math.sin(ry), fz = Math.cos(ry), rx = Math.cos(ry), rz = -Math.sin(ry);
      sb.box('gls', col, 1.9, 0.8, 4.3, x, y + 0.7, z, ry); sb.box('gls', col, 1.75, 0.62, 2.2, x - fx * 0.2, y + 1.4, z - fz * 0.2, ry); sb.box('gls', '#2a3038', 1.78, 0.42, 2.0, x - fx * 0.2, y + 1.42, z - fz * 0.2, ry);
      sb.box('glo', '#f3f2f2', 1.4, 0.12, 0.04, x + fx * 2.16, y + 0.82, z + fz * 2.16, ry); sb.box('glo', RED, 1.4, 0.12, 0.04, x - fx * 2.16, y + 0.82, z - fz * 2.16, ry);
      for (const s of [-1, 1]) for (const t of [-1, 1]) sb.cyl('mat', INK, 0.36, 0.28, x + rx * s * 0.9 + fx * t * 1.35, y + 0.36, z + rz * s * 0.9 + fz * t * 1.35, 10, 0, Math.PI / 2, 1, ry);
      chain(S, x - fx * 1.5, z - fz * 1.5, x + fx * 1.5, z + fz * 1.5, 0.95, 1.5); };
    barrier(-9.5, -6, 9); barrier(4.5, 8, 10); barrier(-4.5, -1, 15); barrier(8, 11.5, 16.5); barrier(-12.5, -9, 19.5);
    car(2.5, 20.5, Math.PI / 2, '#2e4a6b'); car(-7.5, 24.5, 0.35, '#7a1d2a');
    for (const [lx, lz] of [[11.5, 6], [-12.5, 12]]) { const [x, z] = W(lx, lz); if (!inExt(x, z, 1)) crate(S, x, z, 2.2, 90, D.ry); }
    for (const [lx, lz, con] of [[-13, 24, 0], [13.5, 23, 1]]) { const [x, z] = W(lx, lz); if (!inExt(x, z, 0.8)) consoleAt(S, x, z, D.ry + Math.PI, con); }
    { const [x, z] = W(12.5, 14); if (!inExt(x, z, 1)) cage(S, 's', x, z); }
    for (const [lx, lz] of [[-14, 3], [14, 3], [-14, 26], [14, 26]]) { const [x, z] = W(lx, lz), y = ty(x, z); sb.box('mat', INK, 0.12, 2.6, 0.12, x, y + 1.3, z); sb.box('glo', EYE, 0.26, 0.26, 0.26, x, y + 2.7, z); }   // warning beacons at the corners
    S.roster = [['builder', -6.5, 5], ['builder', 7, 5.5], ['turret', -3.5, 8.5, 0, { con: 0 }], ['turret', 3.5, 13, 0, { con: 1 }], ['walker', -3, 7], ['walker', 2, 8], ['walker', 9, 9, 0, { pc: 1 }], ['laser', -7, 11], ['laser', 6, 14], ['laser', -2, 17, 0, { pc: 1 }],
      ['shield', 0, 10], ['repair', -1, 6], ['exploder', 5, 6.5], ['exploder', -9, 7, 0, { pc: 1 }], ['drone', 0, 12, 0, { pc: 1 }], ['drone', -4, 9], ['drone', 4, 9]];
    S.build = ['walker', 'laser', 'exploder', 'walker', 'drone']; }

  // ---------- the rooms (shells + dressing) ----------
  const signTex = s => { const t = K.signTex(s); if (t && t.isTexture) return t; const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d'); g.fillStyle = '#201e1d'; g.fillRect(0, 0, 512, 96); g.fillStyle = RED; g.fillRect(0, 0, 18, 96); g.fillStyle = '#f3f2f2'; g.font = '800 52px Archivo, Helvetica, sans-serif'; g.textBaseline = 'middle'; g.fillText(s, 40, 50); const tt = new THREE.CanvasTexture(c); tt.colorSpace = THREE.SRGBColorSpace; return tt; };
  const LAMP = { red: new THREE.MeshBasicMaterial({ color: 0xff3b1f }), green: new THREE.MeshBasicMaterial({ color: 0x3fdc7a }) };
  function shell(S, next) { const { ox: X, w, d, h } = S, Z = FZ, Y = FY, B = (k, col, ww, hh, dd, x, y, z, ry = 0, rx = 0, rz = 0) => rb.box(k, col, ww, hh, dd, X + x, Y + y, Z + z, ry, rx, rz);
    B('mat', '#5d636b', w, 0.1, d, 0, -0.05, 0); B('mat', '#3d4148', w, 0.3, d, 0, h + 0.15, 0);
    for (const s of [-1, 1]) { B('mat', '#cbd5e1', w, h, 0.3, 0, h / 2, s * d / 2); B('mat', '#5d6f82', w, 1.2, 0.34, 0, 0.6, s * d / 2); B('mat', '#cbd5e1', 0.3, h, d, s * w / 2, h / 2, 0); B('mat', '#5d6f82', 0.34, 1.2, d, s * w / 2, 0.6, 0);
      cols.push({ f: [X - w / 2 - 0.2, X + w / 2 + 0.2, Z + s * d / 2 - 0.15, Z + s * d / 2 + 0.15], y0: Y - 3, y1: Y + 14 }); cols.push({ f: [X + s * w / 2 - 0.15, X + s * w / 2 + 0.15, Z - d / 2, Z + d / 2], y0: Y - 3, y1: Y + 14 }); }
    for (const sx of [-2.2, 2.2]) B('glo', HAZ, 0.12, 0.02, d - 2, sx, 0.012, 0);
    for (const sx of [-w / 4, w / 4]) B('glo', '#f3f2f2', 0.4, 0.06, d - 4, sx, h - 0.05, 0); for (let z = -d / 2 + 3; z < d / 2 - 1; z += 5) B('mat', INK, w, 0.3, 0.2, 0, h - 0.4, z);
    B('mat', INK, 3.6, 3.5, 0.12, 0, 1.75, d / 2 - 0.22); B('mat', '#3d4148', 3.2, 3.2, 0.06, 0, 1.6, d / 2 - 0.3); for (let k = 0; k < 8; k++) B('mat', '#5d636b', 3.2, 0.04, 0.02, 0, 0.3 + k * 0.38, d / 2 - 0.34);
    const ex = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.64), new THREE.MeshBasicMaterial({ map: signTex('BACK TO THE STREET') })); ex.position.set(X, Y + 4.0, Z + d / 2 - 0.32); ex.rotation.y = Math.PI; IG.add(ex);
    if (next) { B('mat', INK, 4.6, 4.3, 0.12, 0, 2.15, -d / 2 + 0.22); B('mat', '#3d4148', 4.2, 4.0, 0.06, 0, 2.0, -d / 2 + 0.3); for (let k = 0; k < 10; k++) B('mat', '#5d636b', 4.2, 0.05, 0.02, 0, 0.3 + k * 0.38, -d / 2 + 0.34);
      S.lamp = new THREE.Mesh(BOXG, LAMP.red); S.lamp.scale.set(0.6, 0.3, 0.1); S.lamp.position.set(X, Y + 4.7, Z - d / 2 + 0.3); IG.add(S.lamp);
      const ns = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.79), new THREE.MeshBasicMaterial({ map: signTex(next) })); ns.position.set(X, Y + 5.5, Z - d / 2 + 0.32); IG.add(ns); }
    const ts = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.12), new THREE.MeshBasicMaterial({ map: signTex('MACHINE FLEET \u00b7 ' + S.title) })); ts.position.set(X - w / 2 + 0.32, Y + h - 1.6, Z); ts.rotation.y = Math.PI / 2; IG.add(ts);
    for (const [x, z] of [[-w / 2 + 0.3, -d / 4], [w / 2 - 0.3, -d / 4], [-w / 2 + 0.3, d / 4], [w / 2 - 0.3, d / 4]]) B('glo', EYE, 0.12, 0.3, 0.3, x, h - 1.2, z);
    K.pendant && [-d / 4, d / 4].forEach(z => K.pendant(rb, X, Z + z, Y + h - 2.2, Y + h, '#5d6f82')); }
  const at = (S, x, z) => [S.ox + x, FZ + z];
  // ASSEMBLY LINE: two long conveyors (low cover) with robot arms, presses on the side walls, half-built robots riding the belts
  const beltTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#2a2d31'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#4b5563'; for (let i = 0; i < 4; i++) g.fillRect(0, i * 16, 64, 5); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 4); return t; })();
  const beltMat = new THREE.MeshLambertMaterial({ map: beltTex }), BELTITEMS = [];
  { const S = ASM; shell(S, 'LOADING BAY');
    const belt = (x, z0, z1) => { const l = z1 - z0, zc = (z0 + z1) / 2, [X, Z] = at(S, x, zc); rb.box('mat', '#3d3b3a', 2.3, 0.82, l, X, FY + 0.41, Z); for (const s of [-1, 1]) rb.box('glo', HAZ, 0.08, 0.1, l, X + s * 1.15, FY + 0.86, Z);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.0, l), beltMat); m.rotation.x = -Math.PI / 2; m.position.set(X, FY + 0.84, Z); IG.add(m);
      for (let k = 0; k < 2; k++) { const it = mk(T('bitem', b => { b.box('gls', STEEL, 0.8, 0.7, 0.55, 0, 0.35, 0); b.box('glo', RED, 0.82, 0.08, 0.57, 0, 0.6, 0); b.box('gls', LIGHT, 0.5, 0.36, 0.44, 0, 0.9, 0); }), IG); BELTITEMS.push({ g: it, X, z0: Z - l / 2 + 0.6, z1: Z + l / 2 - 0.6, u: k / 2 }); }
      chain(S, X, Z - l / 2 + 0.9, X, Z + l / 2 - 0.9, 1.05, 1.0); };
    for (const x of [-6.5, 6.5]) { belt(x, -10, -2); belt(x, 2, 10); }
    for (const [x, z] of [[-4.2, -6], [-4.2, 6], [4.2, -6], [4.2, 6]]) { const [X, Z] = at(S, x, z), s = Math.sign(x); rb.cyl('mat', INK, 0.4, 0.3, X, FY + 0.15, Z, 10); rb.box('gls', HAZ, 0.3, 1.6, 0.3, X, FY + 1.1, Z); rb.box('gls', HAZ, 1.6, 0.24, 0.24, X - s * 0.8, FY + 1.95, Z, 0, 0, s * 0.35); rb.box('mat', INK, 0.2, 0.5, 0.2, X - s * 1.55, FY + 1.6, Z); rb.box('glo', BLUE, 0.1, 0.1, 0.1, X - s * 1.55, FY + 1.3, Z); prop(S, X, Z, 0.45, 2.4); }
    for (const [x, z] of [[-15, -4], [-15, 6], [15, -4], [15, 6]]) { const [X, Z] = at(S, x, z); rb.box('gls', '#5d6f82', 2.6, 4, 3, X, FY + 2, Z); rb.box('glo', HAZ, 2.62, 0.2, 3.02, X, FY + 1.1, Z); rb.box('mat', INK, 1.6, 0.8, 2, X, FY + 4.4, Z); rb.box('glo', EYE, 0.2, 0.2, 0.2, X - Math.sign(x) * 1.32, FY + 3.4, Z); chain(S, X, Z - 1, X, Z + 1, 1.5, 4); }
    for (const [x, z] of [[-11, 1], [11, 1]]) { const [X, Z] = at(S, x, z); crate(S, X, Z, 1.2, 90); }
    { const [X, Z] = at(S, 13, 11); consoleAt(S, X, Z, -Math.PI / 2, 0); } { const [X, Z] = at(S, -13.5, 11.5); cage(S, 'a', X, Z); }
    S.roster = [['builder', -11, -11], ['builder', 11, -11], ['turret', 0, -9, 0, { con: 0 }], ['walker', -2, -4], ['walker', 2, -4], ['laser', -9, -6], ['laser', 9, -6], ['laser', 0, -12, 0, { pc: 1 }], ['shield', -1, 0], ['shield', 1, -2, 0, { pc: 1 }], ['repair', 0, -7], ['exploder', 10, 5, 0, { pc: 1 }]];
    S.build = ['laser', 'walker', 'shield', 'exploder']; S.entry = 'ASSEMBLY LINE \u00b7 THE BELTS ARE LOW COVER \u00b7 HACK THE CONSOLE'; }
  // LOADING BAY: the delivery truck (tall cover), crate stacks, pallets, shelving racks, a forklift, roller shutters; the lunchbox on a crate
  { const S = BAY; shell(S, 'MAKER PRIME');
    { const [X, Z] = at(S, -9, -2); rb.box('gls', '#e7e4dc', 3, 3.4, 10, X, FY + 2.1, Z); rb.box('glo', RED, 3.02, 0.3, 10.02, X, FY + 2.6, Z); rb.box('mat', INK, 3.1, 0.4, 10.2, X, FY + 0.3, Z); for (const z of [-3.5, 3.5]) for (const s of [-1, 1]) rb.cyl('mat', INK, 0.5, 0.4, X + s * 1.4, FY + 0.5, Z + z, 10, 0, Math.PI / 2);
      rb.box('gls', '#2e4a6b', 3, 2.6, 2.4, X, FY + 1.6, Z + 6.3); rb.box('gls', '#2a3038', 2.8, 0.9, 0.06, X, FY + 2.2, Z + 7.52); chain(S, X, Z - 4.4, X, Z + 6.6, 1.6, 3.4); }
    for (const [x, z, h, hp] of [[6, -6, 2.4, 0], [9, 5, 2.2, 90], [2, 8, 1.0, 60], [-2, -3, 1.1, 0], [13, -9, 1.1, 0]]) { const [X, Z] = at(S, x, z); if (hp) crate(S, X, Z, h, hp); else { const n = h > 1.6 ? 2 : 1; for (let k = 0; k < n; k++) rb.box('mat', k ? '#7a5236' : '#8b6a48', 1.5, h / n, 1.5, X, FY + h / n * (k + 0.5), Z, k * 0.3); prop(S, X, Z, 0.95, h); } }
    for (let z = -12; z <= 12; z += 4) { const [X, Z] = at(S, 16.6, z); for (const y of [0.1, 1.5, 2.9]) rb.box('mat', '#4b5563', 1.6, 0.1, 3.6, X, FY + y, Z); for (const s of [-1, 1]) rb.box('mat', HAZ, 0.1, 4, 0.1, X - 0.75, FY + 2, Z + s * 1.75); for (const y of [0.55, 1.95, 3.35]) rb.box('mat', ['#8b6a48', '#6b737b', '#7a5236'][(z + 12) / 4 % 3 | 0], 1.2, 0.8, 1.2, X, FY + y, Z + ((z / 4) % 2 ? 0.6 : -0.6)); prop(S, X, Z, 1.0, 4).noCover = true; }
    { const [X, Z] = at(S, 3, -11.5); rb.box('gls', HAZ, 1.3, 1.0, 2, X, FY + 0.7, Z); rb.box('mat', INK, 1.2, 1.4, 0.1, X, FY + 1.9, Z - 0.6); rb.box('mat', INK, 0.1, 2.4, 0.1, X - 0.5, FY + 1.4, Z + 1.0); rb.box('mat', INK, 0.1, 2.4, 0.1, X + 0.5, FY + 1.4, Z + 1.0); rb.box('mat', '#9aa0a6', 1.0, 0.06, 1.2, X, FY + 0.15, Z + 1.7); prop(S, X, Z + 0.3, 1.2, 1.6); }
    for (const z of [-8, 2]) { const [X, Z] = at(S, -17.8, z); rb.box('mat', '#9aa0a6', 0.1, 4.2, 5, X, FY + 2.1, Z); for (let k = 0; k < 10; k++) rb.box('mat', '#6b737b', 0.12, 0.05, 5, X + 0.05, FY + 0.3 + k * 0.4, Z); rb.box('glo', HAZ, 0.12, 0.2, 5.2, X + 0.06, FY + 4.3, Z); }
    { const [X, Z] = at(S, -15, 11); cage(S, 'b', X, Z); }
    S.lunch = (() => { if (save.flag('mfLunchbox') || save.flag('mfLunchboxBack')) return null; const [X, Z] = at(S, 13, -9), g = mk(T('lunch', b => { b.box('gls', RED, 0.5, 0.3, 0.3, 0, 0.15, 0); b.box('mat', INK, 0.3, 0.05, 0.05, 0, 0.36, 0); b.box('mat', INK, 0.04, 0.12, 0.04, -0.14, 0.3, 0); b.box('mat', INK, 0.04, 0.12, 0.04, 0.14, 0.3, 0); }), IG); g.position.set(X, FY + 1.1, Z); g.rotation.y = 0.5;
      const sp = { key: 'mf:lunch', x: X - 1.3, z: Z, r: 1.8, y: [FY - 1, FY + 3], prompt: "PICK UP \u00b7 THE FOREMAN'S LUNCHBOX", use: () => { save.setFlag('mfLunchbox'); g.visible = false; sp.r = 0; say('THE LUNCHBOX \u00b7 TAKE IT BACK TO THE FOREMAN', 3); snd.tone(880, 0.12, 0.05); } }; SPOTS.push(sp); return g; })();
    S.roster = [['builder', -14, -12], ['builder', 11.5, -12], ['charger', 0, -6], ['charger', 4, 0], ['charger', -4, 2, 0, { pc: 1 }], ['exploder', 3, -3], ['exploder', -1, 4, 0, { pc: 1 }], ['shield', 0, 2], ['shield', 6, 2, 0, { pc: 1 }], ['repair', 2, -8], ['drone', -3, -6], ['drone', 3, -6], ['laser', 8, -2, 0, { pc: 1 }]];
    S.build = ['drone', 'charger', 'drone', 'exploder']; S.entry = 'LOADING BAY \u00b7 CHARGERS ROLL DOWN THE RED LANE \u00b7 STEP OUT'; }
  // BOSS ROOM: MAKER PRIME along the back wall (2 build arms, hopper, laser eye, the core behind a grill), 4 low blocks for cover
  const BS = { armT: [4, 8], armI: 0, hopT: 7, eyeT: 5, sweep: null, ringT: 4, ring: null, drones: false, open: false, dead: false, deathT: 0 };
  { const S = BOSS; shell(S, null); const X = S.ox, Z = FZ, Y = FY;
    rb.box('gls', '#3d4148', 17, 6.5, 4.6, X, Y + 3.25, Z - 13.6); rb.box('glo', HAZ, 17.04, 0.3, 4.64, X, Y + 0.5, Z - 13.6); rb.box('mat', INK, 17.2, 0.4, 4.8, X, Y + 6.6, Z - 13.6);
    for (const s of [-1, 1]) { rb.box('gls', '#5d6f82', 2.4, 9, 3.4, X + s * 9.6, Y + 4.5, Z - 14); rb.box('glo', EYE, 0.3, 0.3, 0.3, X + s * 9.6, Y + 9.2, Z - 12.25); for (let k = 0; k < 3; k++) rb.cyl('mat', '#9aa0a6', 0.22, 6, X + s * (3 + k * 1.2), Y + 9.5, Z - 15, 8); }
    rb.box('mat', INK, 3.2, 1.6, 2.4, X, Y + 0.8, Z - 10.6); rb.box('glo', HAZ, 3.24, 0.12, 0.04, X, Y + 1.5, Z - 9.4);
    for (const s of [-1, 1]) rb.box('mat', '#3d3b3a', 2.4, 0.06, 2.4, X + s * 5.5, Y + 0.03, Z - 7.6), rb.box('glo', BLUE, 2.2, 0.02, 0.06, X + s * 5.5, Y + 0.07, Z - 6.45);
    const ms = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.5), new THREE.MeshBasicMaterial({ map: signTex('MAKER PRIME') })); ms.position.set(X, Y + 7.6, Z - 11.25); IG.add(ms);
    for (let x = -8; x <= 8; x += 1.6) prop(S, X + x, Z - 12.4, 1.1, 6.5).noCover = true;
    for (const [x, z] of [[-8, 2], [8, 2], [-4, 8], [4, 8]]) { const [bx, bz] = at(S, x, z); rb.box('mat', '#c9c2b0', 2.4, 1.2, 1.2, bx, Y + 0.6, bz); rb.box('glo', HAZ, 2.42, 0.1, 1.22, bx, Y + 1.0, bz); chain(S, bx - 0.7, bz, bx + 0.7, bz, 0.65, 1.2); }
    const part = (k, name, fn, gx, gy, gz, tx, ty, tz, r, hp) => { const g = mk(T('boss' + k, fn), IG); g.position.set(X + gx, Y + gy, Z + gz); g.userData.y0 = g.position.y; const q = { k, name, g, x: X + tx, y: ty, z: Z + tz, r, hp, max: hp, dead: false }; S.parts.push(q); return q; };
    const arm = b => { b.cyl('mat', INK, 0.8, 1.2, 0, 0.6, 0, 12); b.box('gls', HAZ, 0.5, 3.2, 0.5, 0, 2.6, 0); b.box('gls', HAZ, 0.4, 0.4, 3.2, 0, 4.1, 1.4); b.box('mat', INK, 0.3, 1.4, 0.3, 0, 3.4, 2.9); b.box('glo', BLUE, 0.4, 0.2, 0.4, 0, 2.6, 2.9); b.box('glo', EYE, 0.52, 0.12, 0.52, 0, 1.6, 0); };
    BS.armL = part('armL', 'LEFT BUILD ARM', arm, -5.5, 0, -10.6, -5.5, 2.0, -9.6, 1.4, 160); BS.armR = part('armR', 'RIGHT BUILD ARM', arm, 5.5, 0, -10.6, 5.5, 2.0, -9.6, 1.4, 160);
    BS.hop = part('hopper', 'HOPPER', b => { b.box('gls', HAZ, 3, 1.4, 2.4, 0, 0, 0); b.box('mat', INK, 3.1, 0.2, 2.5, 0, 0.75, 0); b.box('gls', '#3d3b3a', 1.2, 1.6, 1.2, 0, -1.4, 0.4); b.box('glo', EYE, 0.6, 0.14, 0.04, 0, 0.1, 1.22); }, 0, 6.8, -12.4, 0, 6.6, -10.8, 1.6, 140);
    BS.eye = part('eye', 'LASER EYE', b => { b.sph('gls', '#3d4148', 0.95, 0, 0, 0, 1, 12); b.sph('glo', EYE, 0.45, 0, 0, 0.62, 0.7, 10); b.tor('gls', '#9aa0a6', 1.0, 0.08, 0, 0, 0); }, 0, 8.8, -11.6, 0, 8.8, -10.6, 1.2, 140);
    BS.core = part('core', 'CORE', b => { b.sph('glo', EYE, 1.3, 0, 0, 0, 1, 14); }, 0, 3.0, -11.0, 0, 3.0, -9.6, 1.5, 320);
    BS.grill = mk(T('grill', b => { for (let k = -3; k <= 3; k++) b.box('mat', INK, 0.16, 3.2, 0.16, k * 0.42, 0, 0); b.box('mat', '#5d636b', 3.2, 0.2, 0.3, 0, 1.6, 0); b.box('mat', '#5d636b', 3.2, 0.2, 0.3, 0, -1.6, 0); }), IG); BS.grill.position.set(X, Y + 3.0, Z - 9.7);
    BS.sweepM = new THREE.Mesh(BOXG, new THREE.MeshBasicMaterial({ color: 0xff3b1f })); BS.sweepM.visible = false; IG.add(BS.sweepM); BS.telM = new THREE.Mesh(BOXG, TM.red); BS.telM.visible = false; IG.add(BS.telM);
    BS.ringM = new THREE.Mesh(ringGeo, TM.ring); BS.ringM.visible = false; IG.add(BS.ringM);
    S.roster = [['walker', -3, -5], ['walker', 3, -5], ['laser', -8, 0, 0, { pc: 1 }]]; S.build = []; S.boss = true; S.entry = 'MAKER PRIME \u00b7 BREAK THE 2 ARMS, THE HOPPER AND THE EYE \u00b7 JUMP THE RED LASER'; }
  for (const S of STG) coverSpots(S);
  sb.build(EG); rb.build(IG);
  const WG = new THREE.Group(); WG.name = 'factoryWalkBarricades'; EG.add(WG); wb.build(WG);
  const clearWalk = () => { WG.visible = false; for (const p of walkProps) { p.dead = true; p.noCover = true; if (p.col) p.col.on = false; } };
  if (save.flag && save.flag('robotFactoryCleared')) clearWalk();

  // ---------- robots ----------
  const live = S => S.robots.filter(r => !r.dead);
  const aliveCount = S => S.robots.filter(r => !r.dead && r.t !== 'builder' && r.t !== 'turret').length;
  function spawn(S, t, x, z, face = 0, o = {}) { const st = ST[t], { g, p } = body(t);
    const r = { t, S, x, z, face, hp: st.hp, max: st.hp, R: st.R, spd: st.spd, fly: st.fly || 0, alt: st.fly || 0, g, p, st: 'go', tt: rnd() * 1.5, cd: 1 + rnd() * 1.5, fl: 0, duck: 0, home: [x, z, face], extra: !!o.extra, open: 0, dz: 0, side: rnd() < 0.5 ? 1 : -1, reT: 0 };
    S.par.add(g); S.robots.push(r); sync(r); return r; }
  const BARM = { bg: new THREE.SpriteMaterial({ color: 0x201e1d, depthTest: false, transparent: true }), r: new THREE.SpriteMaterial({ color: 0xec3013, depthTest: false, transparent: true }), b: new THREE.SpriteMaterial({ color: 0x3fd3ff, depthTest: false, transparent: true }) };
  function bar(r) { if (!r.bar) { const bg = new THREE.Sprite(BARM.bg), fg = new THREE.Sprite(BARM.r); bg.renderOrder = 18; fg.renderOrder = 19; r.S.par.add(bg, fg); r.bar = { bg, fg }; }
    const { bg, fg } = r.bar, w = r.t === 'builder' ? 1.9 : 1.3, f = Math.max(0.02, r.hp / r.max), y = topY(r) - 0.3; bg.visible = fg.visible = !r.dead; if (r.dead) return;
    bg.scale.set(w + 0.12, 0.22, 1); bg.position.set(r.x, y, r.z); fg.material = r.ally ? BARM.b : BARM.r; fg.scale.set(w * f, 0.12, 1); fg.center.set(0.5 / f, 0.5); fg.position.set(r.x, y, r.z); }
  function sync(r) { const y = baseY(r.S, r.x, r.z) + (r.fly ? r.alt + Math.sin(r.tt * 4) * 0.1 : 0) - (r.dead ? Math.min(0.5, r.dz * 0.8) : 0); r.g.position.set(r.x, y, r.z); r.g.rotation.y = r.face; r.g.scale.setScalar(r.fl > 0 ? 1.08 : 1); if (r.t === 'laser') r.p.b.position.y = -0.55 * r.duck; if (r.t === 'builder' || r.t === 'turret') bar(r); }
  function dropMesh(r) { if (r.g.parent) r.g.parent.remove(r.g); if (r.bar) { for (const m of [r.bar.bg, r.bar.fg]) if (m.parent) m.parent.remove(m); r.bar = null; } for (const k of ['tel', 'ring', 'beam']) if (r[k]) { scene.remove(r[k]); r[k] = null; } if (r.spot) { r.spot.by = null; r.spot = null; } }
  function clearRobots(S) { for (const r of S.robots) dropMesh(r); S.robots = []; for (const c of S.cells) S.par.remove(c.m); S.cells = []; for (const s of S.cover) s.by = null; for (const b of BOLTS) if (b.S === S) { b.on = false; b.m.visible = false; } }
  function resetStage(S) { clearRobots(S); S.spawnI = 0; for (const C of S.consoles) if (C) { C.hacked = false; C.scr.material = scrM.r; C.spot.r = 1.6; }
    for (const [t, x, z, a, o = {}] of S.roster) { if (o.pc && touch) continue; const [wx, wz] = S.toW(x, z); const r = spawn(S, t, wx, wz, (a || 0) + S.ry); if (t === 'turret' && S.consoles[o.con]) S.consoles[o.con].tur = r; }
    if (S.boss) { Object.assign(BS, { armT: [4, 8], hopT: 7, eyeT: 5, ringT: 4, sweep: null, ring: null, drones: false, open: false, dead: false, deathT: 0 }); for (const q of S.parts) { q.hp = q.max; q.dead = false; q.g.visible = true; q.g.rotation.set(0, 0, 0); q.g.position.y = q.g.userData.y0; } BS.grill.position.y = FY + 3.0; BS.sweepM.visible = BS.telM.visible = BS.ringM.visible = false; } }
  function disengage(S) { S.engaged = false; hack = null; for (const r of S.robots.slice()) { if (r.dead) continue; if (r.extra) { dropMesh(r); r.gone = true; continue; } r.x = r.home[0]; r.z = r.home[1]; r.face = r.home[2]; r.hp = r.max; r.g.visible = true; r.st = 'go'; r.duck = 0; r.open = 0; r.alt = r.fly; if (r.tel) r.tel.visible = false; if (r.ring) r.ring.visible = false; if (r.beam) r.beam.visible = false; if (r.spot) { r.spot.by = null; r.spot = null; } if (r.p.fr) r.p.fr.visible = false; sync(r); } S.robots = S.robots.filter(r => !r.gone); }
  function engage(S) { if (S.engaged || S.cleared) return; S.engaged = true; if (!T0) T0 = performance.now(); if (lastP) { let nr = null, nd = 30; for (const r of S.robots) { const d = Math.hypot(r.x - lastP.x, r.z - lastP.z); if (!r.dead && r.t !== 'turret' && d < nd) { nd = d; nr = r; } } if (nr) { barkT = 0; bark(nr, 'INTRUDER DETECTED'); snd.tone(880, 0.12, 0.04, 'square'); setTimeout(() => snd.tone(660, 0.18, 0.04, 'square'), 140); } }
    if (!S.tipped) { S.tipped = true; say(S.entry || 'ROBOTS GONE WILD \u00b7 BREAK THE 2 BUILDER BOTS \u00b7 HACK A CONSOLE: ITS TURRET FIGHTS FOR YOU', 4.5); } }
  function step(r, mx, mz) { if (moveR(r, mx, mz)) return true; const s = r.side; if (moveR(r, -mz * s, mx * s)) return true; r.side = -s; return false; }
  function moveR(r, mx, mz) { const S = r.S; if (r.fly) { if (S.inb(r.x + mx, r.z + mz)) { r.x += mx; r.z += mz; return true; } return false; }
    if (!free(S, r.x, r.z, r.R * 0.8)) { r.x += mx; r.z += mz; return true; }   // spawned inside something: walk out
    if (free(S, r.x + mx, r.z + mz, r.R)) { r.x += mx; r.z += mz; return true; } if (free(S, r.x + mx, r.z, r.R)) { r.x += mx; return false; } if (free(S, r.x, r.z + mz, r.R)) { r.z += mz; return false; } return false; }
  const segD = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2)); return { d: Math.hypot(px - ax - dx * u, pz - az - dz * u), u }; };
  function blocker(S, ax, az, bx, bz, minH) { let best = null, bu = 2; for (const p of S.props) { if (p.dead || p.h < minH) continue; if (Math.hypot(p.x - ax, p.z - az) < p.r + 0.7) continue; const q = segD(p.x, p.z, ax, az, bx, bz); if (q.d < p.r * 0.9 && q.u > 0 && q.u < 1 && q.u < bu) { bu = q.u; best = p; } } return best; }
  const losClear = (S, ax, az, bx, bz, h = 1.9) => !blocker(S, ax, az, bx, bz, h);
  function pickSpot(r, P) { let best = null, bs = 1e9; for (const s of r.S.cover) { if (s.p.dead || (s.by && s.by !== r)) continue; const dpx = P.x - s.x, dpz = P.z - s.z, dp = Math.hypot(dpx, dpz); if (dp < 5.5 || dp > 15) continue;
      const vx = s.p.x - s.x, vz = s.p.z - s.z, vl = Math.hypot(vx, vz) || 1; if ((vx * dpx + vz * dpz) / (vl * dp) < 0.7) continue; const sc = Math.abs(dp - 9) + Math.hypot(s.x - r.x, s.z - r.z) * 0.4; if (sc < bs) { bs = sc; best = s; } }
    if (r.spot) r.spot.by = null; r.spot = best; if (best) best.by = r; return best; }
  const covered = (r, P) => { const s = r.spot; if (!s || s.p.dead) return false; const dpx = P.x - s.x, dpz = P.z - s.z, dp = Math.hypot(dpx, dpz) || 1, vx = s.p.x - s.x, vz = s.p.z - s.z, vl = Math.hypot(vx, vz) || 1; return (vx * dpx + vz * dpz) / (vl * dp) > 0.45 && dp > 3.5; };
  function nearestFoe(S, r, R) { let b = null, bd = R; for (const q of S.robots) { if (q.dead || q.ally || q.t === 'turret') continue; const d = Math.hypot(q.x - r.x, q.z - r.z); if (d < bd && losClear(S, r.x, r.z, q.x, q.z)) { bd = d; b = q; } } return b; }
  function gunAt(r) { const f = r.face, c = Math.cos(f), s = Math.sin(f); return [r.x + 0.45 * c + 0.62 * s, baseY(r.S, r.x, r.z) + 1.05 - 0.55 * r.duck, r.z - 0.45 * s + 0.62 * c]; }
  function killR(r, why) { if (r.dead) return; r.dead = true; r.dz = 0; const y = baseY(r.S, r.x, r.z); puffAt(r.x, y + (r.fly ? r.alt : 1), r.z, r.t === 'builder' ? 1.8 : 1.1); snd.tone(160, 0.35, 0.05, 'sawtooth'); snd.burst(0.25, 300, 0.2);
    for (const k of ['tel', 'ring', 'beam']) if (r[k]) r[k].visible = false; if (r.spot) { r.spot.by = null; r.spot = null; } if (r.p.fr) r.p.fr.visible = false; stats.down++;
    if (r.t === 'exploder') boom(r); if (r.t === 'builder') { float('BUILDER DOWN', r.x, y + 4, r.z, true, 1.6); const n = r.S.robots.filter(q => q.t === 'builder' && !q.dead).length; say(n ? 'BUILDER DOWN \u00b7 ' + n + ' LEFT' : 'NO MORE BUILDERS \u00b7 FINISH THE ROBOTS', 2.5); }
    if (r.t === 'turret' && why !== 'off') float('TURRET DOWN', r.x, y + 2.8, r.z, true);
    if (['walker', 'laser', 'shield', 'charger', 'repair'].includes(r.t) && rnd() < 0.22) dropCell(r.S, r.x, r.z); }
  function boom(r) { const S = r.S, y = baseY(S, r.x, r.z); puffAt(r.x, y + 0.6, r.z, 2.4, 0xffa53a); puffAt(r.x, y + 1.2, r.z, 1.6, 0xff3b1f); snd.burst(0.4, 180, 0.35); if (r.ring) r.ring.visible = false;
    if (lastP && Math.hypot(lastP.x - r.x, lastP.z - r.z) < 2.6 && Math.abs(lastP.y - y) < 2) hurt(22); for (const q of S.robots) if (q !== r && !q.dead && q.t !== 'turret' && Math.hypot(q.x - r.x, q.z - r.z) < 2.6) hitRobot(q, 60, r, 'boom'); for (const p of S.props) if (p.hp && !p.dead && Math.hypot(p.x - r.x, p.z - r.z) < 2.6 + p.r) hitProp(p, 60); for (const c of S.cages) if (!c.freed && Math.hypot(c.x - r.x, c.z - r.z) < 2.6) hitCage(S, c); }
  function hitRobot(r, dmg, from, kind) { if (r.dead || r.ally) return;
    if (r.t === 'shield' && r.open <= 0 && kind !== 'boom') { const dx = from.x - r.x, dz = from.z - r.z, d = Math.hypot(dx, dz) || 1; if ((Math.sin(r.face) * dx + Math.cos(r.face) * dz) / d > 0.3) {
        if (kind === 'melee') { r.open = 2.6; float('SHIELD OPEN', r.x, topY(r), r.z, true); snd.burst(0.08, 600, 0.14); } else { float('BLOCKED', r.x, topY(r), r.z); snd.tone(1600, 0.05, 0.03, 'triangle'); } return; } }
    if (r.t === 'charger' && r.st === 'dizzy') dmg *= 1.5;
    r.hp -= dmg; r.fl = 0.12; snd.burst(0.06, 1400, 0.1); puffAt(r.x + (rnd() - 0.5) * 0.4, baseY(r.S, r.x, r.z) + (r.fly ? r.alt : r.t === 'builder' ? 1.6 : 1.1), r.z + (rnd() - 0.5) * 0.4, 0.22, 0xffd23a); if (r.bar) bar(r); if (!r.S.engaged) engage(r.S);
    if (['walker', 'exploder', 'laser', 'drone'].includes(r.t) && kind !== 'ally') { const dx = r.x - from.x, dz = r.z - from.z, d = Math.hypot(dx, dz) || 1; moveR(r, dx / d * 0.35, dz / d * 0.35); }
    if (r.hp <= 0) killR(r); }
  const PH = { hp: 100, max: 100, inv: 0 }; let foxRef = null;
  function hurt(n) { if (PH.inv > 0 || done || ko) return; PH.hp = Math.max(0, PH.hp - n); PH.inv = 0.45; if (foxRef) foxRef.userData.hop = 0.7; snd.burst(0.12, 400, 0.2); flashT = 0.25; }
  const air = P => P.y - (P.y < -100 ? FY : terrainAt(P.x, P.z)) > 0.55;

  function think(r, dt, P, S) { r.tt += dt; r.fl -= dt;
    if (r.dead) { r.dz += dt; if (!r.fly) r.g.rotation.x = -Math.min(1.3, r.dz * 3); else r.alt = Math.max(0, r.alt - dt * 5); sync(r); if (r.dz > 0.9) { dropMesh(r); r.gone = true; } return; }
    const by = baseY(S, r.x, r.z), dx = P.x - r.x, dz = P.z - r.z, d = Math.hypot(dx, dz) || 0.01, want = Math.atan2(dx, dz); let spd = 0;
    const faceTo = (a, k = 8) => { r.face += Math.atan2(Math.sin(a - r.face), Math.cos(a - r.face)) * Math.min(1, dt * k); };
    if (!S.engaged) { if (r.p.arm) r.p.arm.rotation.y = Math.sin(r.tt * 0.5) * 0.4; if (r.p.lt) r.p.lt.visible = Math.floor(r.tt * 2) % 2 === 0; if (r.t === 'drone' || r.t === 'repair') r.face += dt * 0.4; else if (r.t !== 'builder') r.face = r.home[2] + Math.sin(r.tt * 0.45 + r.home[0]) * 0.6; sync(r); return; }
    switch (r.t) {
      case 'walker': case 'shield': { const sh = r.t === 'shield'; if (sh) r.open -= dt; faceTo(want, sh ? 3 : 8);
        if (r.st === 'wind') { r.p.b.rotation.x = damp(r.p.b.rotation.x, -0.35, 12, dt); if (r.tt > (sh ? 0.55 : 0.45)) { r.st = 'go'; r.tt = 0; r.cd = 1.1 + rnd() * 0.4; r.p.b.rotation.x = 0.35; if (d < 2.3) hurt(sh ? 12 : 10); snd.burst(0.05, 700, 0.12); } }
        else { r.p.b.rotation.x = damp(r.p.b.rotation.x, 0, 8, dt); r.cd -= dt; if (d > 1.6) { spd = r.spd; step(r, dx / d * spd * dt, dz / d * spd * dt); } if (d < 2.0 && r.cd <= 0) { r.st = 'wind'; r.tt = 0; } }
        if (r.p.sh) { const k = r.open > 0 ? 1 : 0; r.p.sh.position.x = damp(r.p.sh.position.x, k * 0.8, 10, dt); r.p.sh.rotation.y = damp(r.p.sh.rotation.y, k * 1.3, 10, dt); }
        break; }
      case 'laser': { faceTo(want, 6); r.reT -= dt; const popping = S.robots.filter(q => q.t === 'laser' && q.st === 'pop' && !q.dead).length; const tl = telOf(r);
        if (d < 3.2 && r.st !== 'pop') { spd = r.spd; step(r, -dx / d * spd * dt, -dz / d * spd * dt); r.duck = damp(r.duck, 0, 10, dt); tl.visible = false; break; }
        if (r.reT <= 0 || (r.st !== 'open' && (!r.spot || r.spot.p.dead))) { r.st = pickSpot(r, P) ? 'run' : 'open'; r.reT = 7 + rnd() * 3; }
        if (r.st === 'run') { const sx = r.spot.x - r.x, sz = r.spot.z - r.z, sd = Math.hypot(sx, sz); r.duck = damp(r.duck, 0, 10, dt); tl.visible = false;
          if (sd > 0.35) { spd = r.spd * 1.3; if (!step(r, sx / sd * Math.min(sd, spd * dt), sz / sd * Math.min(sd, spd * dt)) && r.tt > 4) { r.reT = 0; r.tt = 0; } } else { r.st = 'duck'; r.tt = 0; r.dur = 1.1 + rnd(); if (rnd() < 0.3) bark(r, 'TAKING COVER'); } }
        else if (r.st === 'duck' || r.st === 'tell' || r.st === 'pop') { if (!covered(r, P)) { if (rnd() < 0.5) bark(r, 'FLANKED'); r.spot.by = null; r.spot = null; r.reT = 0; tl.visible = false; break; }
          const low = r.spot.p.h < 1.7, home = r.spot;
          if (r.st !== 'pop' || low) { const hx = home.x - r.x, hz = home.z - r.z, hd = Math.hypot(hx, hz); if (hd > 0.1) moveR(r, hx / hd * Math.min(hd, 3 * dt), hz / hd * Math.min(hd, 3 * dt)); }
          if (r.st === 'duck') { tl.visible = false; r.duck = damp(r.duck, low ? 1 : 0, 10, dt); if (r.tt > r.dur && popping < 2) { r.st = 'tell'; r.tt = 0; float('!', r.x, topY(r) - 0.6, r.z, true, 0.5); } }
          else if (r.st === 'tell') { if (r.tt > 0.45) { r.st = 'pop'; r.tt = 0; r.shots = 0; if (!low) { const px = -(P.z - home.z), pz = P.x - home.x, pl = Math.hypot(px, pz) || 1; r.pp = [home.x + px / pl * 1.2 * r.side, home.z + pz / pl * 1.2 * r.side]; } else r.pp = null; } }
          else { r.duck = damp(r.duck, 0, 12, dt); if (r.pp) { const qx = r.pp[0] - r.x, qz = r.pp[1] - r.z, qd = Math.hypot(qx, qz); if (qd > 0.1) moveR(r, qx / qd * Math.min(qd, 4 * dt), qz / qd * Math.min(qd, 4 * dt)); }
            const aimW = (r.tt < 0.6) || (r.tt > 1.15 && r.tt < 1.75); if (aimW) { if (!r.aimOn) { r.aimOn = true; r.aim = [P.x, P.y + 1.0, P.z]; } const g = gunAt(r); line(tl, g[0], g[1], g[2], r.aim[0], r.aim[1], r.aim[2], 0.04); } else { tl.visible = false; if (r.aimOn) { r.aimOn = false; const g = gunAt(r); bolt(S, g[0], g[1], g[2], r.aim[0], r.aim[1], r.aim[2], false, 9); r.shots++; } }
            if (r.tt > 2.4) { r.st = 'duck'; r.tt = 0; r.dur = 1.2 + rnd(); tl.visible = false; r.aimOn = false; } } }
        else { r.duck = damp(r.duck, 0, 10, dt); if (d > 10) { spd = r.spd; step(r, dx / d * spd * dt, dz / d * spd * dt); } else if (d < 6.5) { spd = r.spd; step(r, -dx / d * spd * dt, -dz / d * spd * dt); } else { spd = r.spd * 0.5; step(r, -dz / d * spd * dt * r.side, dx / d * spd * dt * r.side); }
          r.cd -= dt; if (r.cd < 0.55) { if (!r.aimOn) { r.aimOn = true; r.aim = [P.x, P.y + 1.0, P.z]; } const g = gunAt(r); line(tl, g[0], g[1], g[2], r.aim[0], r.aim[1], r.aim[2], 0.04); }
          if (r.cd <= 0) { const g = gunAt(r); bolt(S, g[0], g[1], g[2], r.aim[0], r.aim[1], r.aim[2], false, 9); r.cd = 2.0 + rnd() * 0.6; r.aimOn = false; tl.visible = false; } }
        break; }
      case 'charger': { const tl = telOf(r); r.p.ball.rotation.x += (r.st === 'roll' ? 15 : r.st === 'dizzy' ? 0 : 2.4) * dt / 0.72;
        if (r.st === 'dizzy') { r.face += dt * 5; if (r.tt > 2.2) { r.st = 'go'; r.tt = 0; } break; }
        if (r.st === 'aim') { line(tl, r.x, by + 0.06, r.z, r.x + Math.sin(r.face) * 16, by + 0.06, r.z + Math.cos(r.face) * 16, 1.4, 0.03); if (r.tt > 0.85) { r.st = 'roll'; r.tt = 0; r.rolled = 0; r.hitP = false; tl.visible = false; snd.tone(220, 0.3, 0.05, 'sawtooth'); } break; }
        if (r.st === 'roll') { const v = 15 * dt; if (!moveR(r, Math.sin(r.face) * v, Math.cos(r.face) * v)) { r.st = 'dizzy'; r.tt = 0; float('DIZZY', r.x, by + 2.2, r.z, true); puffAt(r.x + Math.sin(r.face) * 0.8, by + 0.8, r.z + Math.cos(r.face) * 0.8, 0.6, 0xffd23a); snd.burst(0.15, 300, 0.2); break; }
          r.rolled += v; if (!r.hitP && Math.hypot(P.x - r.x, P.z - r.z) < 1.25 && !air(P)) { r.hitP = true; hurt(16); } if (r.rolled > 16) { r.st = 'cool'; r.tt = 0; } break; }
        if (r.st === 'cool') { if (r.tt > 1.0) { r.st = 'go'; r.tt = 0; } break; }
        faceTo(want, 5); r.cd -= dt; if (d > 4) { spd = r.spd; step(r, dx / d * spd * dt, dz / d * spd * dt); } if (d < 14 && r.cd <= 0 && losClear(S, r.x, r.z, P.x, P.z, 0.9)) { r.st = 'aim'; r.tt = 0; r.face = want; r.cd = 2.6; } break; }
      case 'drone': { r.ang = (r.ang ?? rnd() * 6) + dt * 0.9 * r.side;
        if (r.st === 'blink') { r.g.visible = Math.floor(r.tt * 12) % 2 === 0; if (r.tt > 0.5) { r.g.visible = true; r.st = 'dive'; r.tt = 0; r.aim = [P.x, P.z]; } }
        else if (r.st === 'dive') { const tx = r.aim[0] - r.x, tz = r.aim[1] - r.z, td = Math.hypot(tx, tz), v = 10 * dt; if (td > 0.3) { r.x += tx / td * Math.min(td, v); r.z += tz / td * Math.min(td, v); } r.alt = damp(r.alt, 0.9, 6, dt); if (!r.hitP && d < 0.95 && P.y - by < 1.8) { r.hitP = true; hurt(8); } if (td < 0.35 || r.tt > 1.4) { r.st = 'up'; r.tt = 0; } }
        else { r.alt = damp(r.alt, 2.6, 3, dt); const ox = P.x + Math.sin(r.ang) * 4.8, oz = P.z + Math.cos(r.ang) * 4.8, tx = ox - r.x, tz = oz - r.z, td = Math.hypot(tx, tz) || 1, v = Math.min(td, r.spd * dt); moveR(r, tx / td * v, tz / td * v); spd = r.spd;
          r.cd -= dt; if (r.cd <= 0 && r.st !== 'up') { r.st = 'blink'; r.tt = 0; r.cd = 3.2 + rnd() * 1.2; r.hitP = false; } else if (r.st === 'up' && r.tt > 1) r.st = 'go'; }
        faceTo(want, 6); r.p.b.rotation.z = Math.sin(r.tt * 3) * 0.12; break; }
      case 'repair': { let tgt = null, worst = 1; for (const q of S.robots) if (q !== r && !q.dead && q.t !== 'turret' && q.t !== 'repair' && q.hp < q.max && q.hp / q.max < worst && Math.hypot(q.x - r.x, q.z - r.z) < 14) { worst = q.hp / q.max; tgt = q; }
        let mx = 0, mz = 0; if (d < 6) { mx = -dx / d; mz = -dz / d; } else if (tgt) { const tx = tgt.x - r.x, tz = tgt.z - r.z, td = Math.hypot(tx, tz) || 1; if (td > 3) { mx = tx / td; mz = tz / td; } }
        if (mx || mz) { spd = r.spd; moveR(r, mx * spd * dt, mz * spd * dt); }
        const bm = beamOf(r); if (tgt && Math.hypot(tgt.x - r.x, tgt.z - r.z) < 6.5) { tgt.hp = Math.min(tgt.max, tgt.hp + 14 * dt); line(bm, r.x, by + r.alt, r.z, tgt.x, baseY(S, tgt.x, tgt.z) + (tgt.fly ? tgt.alt : 1.2), tgt.z, 0.07); if (rnd() < dt * 0.4) bark(r, 'REPAIRING'); } else bm.visible = false;
        faceTo(tgt ? Math.atan2(tgt.x - r.x, tgt.z - r.z) : want, 5); break; }
      case 'builder': { r.p.arm.rotation.y = Math.sin(r.tt * 0.9) * 0.5;
        if (r.st === 'build') { r.bt += dt; r.p.fr.visible = true; r.p.fr.scale.y = Math.max(0.05, Math.min(1, r.bt / 1.6)); r.p.arm.rotation.y = 0;
          if (r.bt > 1.6) { r.p.fr.visible = false; const px = r.x + Math.sin(r.face) * 2.4, pz = r.z + Math.cos(r.face) * 2.4, t = S.build[S.spawnI++ % S.build.length]; spawn(S, t, px, pz, r.face, { extra: true }); puffAt(px, by + 1, pz, 0.8, 0x3fd3ff); bark(r, 'BUILD COMPLETE'); r.st = 'go'; r.cd = (touch ? 10 : 8) + rnd() * 2; } }
        else { r.cd -= dt; if (r.cd <= 0 && S.build.length && aliveCount(S) < CAP) { r.st = 'build'; r.bt = 0; snd.tone(300, 0.5, 0.03, 'triangle'); } } break; }
      case 'exploder': { if (r.st === 'arm') { r.p.lt.visible = Math.floor(r.tt * 10) % 2 === 0; const rg = ringOf(r); rg.visible = true; rg.scale.set(2.6, 1, 2.6); rg.position.set(r.x, by + 0.05, r.z); if (Math.floor(r.tt * 6) !== Math.floor((r.tt - dt) * 6)) snd.tone(1400, 0.05, 0.03, 'square'); if (r.tt > 0.9) killR(r); break; }
        faceTo(want, 10); if (d > 1.6) { spd = r.spd; step(r, dx / d * spd * dt, dz / d * spd * dt); } if (d < 2.0) { r.st = 'arm'; r.tt = 0; bark(r, 'BEEP. BEEP.'); } r.p.lt.visible = Math.floor(r.tt * 3) % 2 === 0; break; }
      case 'turret': { const tgt = r.ally ? nearestFoe(S, r, 18) : (d < 18 && losClear(S, r.x, r.z, P.x, P.z) ? P : null);
        if (tgt) { faceTo(Math.atan2(tgt.x - r.x, tgt.z - r.z), 4); r.cd -= dt; if (r.cd <= 0) { r.burst = 3; r.bcd = 0; r.cd = r.ally ? 1.6 : 2.6; }
          if (r.burst > 0 && (r.bcd -= dt) <= 0) { r.burst--; r.bcd = 0.18; const mx = r.x + Math.sin(r.face) * 0.95, mz = r.z + Math.cos(r.face) * 0.95, ty = tgt === P ? P.y + 1.0 : baseY(S, tgt.x, tgt.z) + (tgt.fly ? tgt.alt : 1.0); bolt(S, mx, by + 1.85, mz, tgt.x, ty, tgt.z, !!r.ally, r.ally ? 14 : 8, 16); } } break; }
    }
    if (r.p.lL) { const k = spd > 0.1 ? Math.sin(r.tt * 9) * 0.5 : 0; r.p.lL.rotation.x = k; r.p.lR.rotation.x = -k; }
    sync(r); }
  function separate(S) { const L2 = S.robots; for (let i = 0; i < L2.length; i++) { const a = L2[i]; if (a.dead || a.fly || a.t === 'builder' || a.t === 'turret') continue; for (let j = i + 1; j < L2.length; j++) { const b = L2[j]; if (b.dead || b.fly) continue; const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), m = a.R + b.R; if (d < m && d > 1e-3) { const k = (m - d) / 2; if (b.t !== 'builder' && b.t !== 'turret') moveR(b, dx / d * k, dz / d * k); moveR(a, -dx / d * k, -dz / d * k); } } } }

  // ---------- boss: MAKER PRIME ----------
  function hitPart(S, q, dmg) { if (q.dead || BS.dead) return; if (q.k === 'core' && !BS.open) { float('SHIELDED \u00b7 BREAK THE 4 PARTS', q.x, FY + 5.2, q.z); snd.tone(1600, 0.05, 0.03, 'triangle'); return; }
    q.hp -= dmg; q.g.scale.setScalar(1.06); setTimeout(() => q.g.scale.setScalar(1), 90); snd.burst(0.06, 1100, 0.12); puffAt(q.x, FY + q.y, q.z, 0.5, 0xffd23a);
    if (q.hp <= 0) { q.dead = true; for (let k = 0; k < 3; k++) puffAt(q.x + (rnd() - 0.5) * 1.5, FY + q.y + (rnd() - 0.5), q.z, 1.4); snd.burst(0.4, 220, 0.3);
      if (q.k === 'core') { BS.dead = true; BS.deathT = 0; say('MAKER PRIME IS GOING DOWN', 3); return; }
      q.g.rotation.x = 0.5; q.g.position.y -= 0.8; float(q.name + ' DOWN', q.x, FY + q.y + 1.5, q.z, true, 1.6);
      if (q.k === 'eye') { BS.sweep = null; BS.sweepM.visible = BS.telM.visible = false; }
      const left = S.parts.filter(p => p.k !== 'core' && !p.dead).length; say(left ? q.name + ' DOWN \u00b7 ' + left + ' PARTS LEFT' : 'CORE OPEN \u00b7 HIT THE CORE \u00b7 JUMP THE SHOCK RINGS', 3); } }
  function bossTick(S, dt, P) { const X = S.ox, Z = FZ, grounded = !air(P);
    if (BS.dead) { BS.deathT += dt; if (Math.random() < dt * 8) puffAt(X + (rnd() - 0.5) * 14, FY + 1 + rnd() * 7, Z - 12 + rnd() * 2, 1 + rnd(), rnd() < 0.5 ? 0xffa53a : 0xff3b1f); if (Math.random() < dt * 4) snd.burst(0.3, 150 + rnd() * 200, 0.25); BS.core.g.visible = BS.deathT < 1.2; if (BS.deathT > 2.6 && !done) finish(); return; }
    const t = performance.now() / 1000; BS.core.g.scale.setScalar(1 + Math.sin(t * (BS.open ? 6 : 2.5)) * 0.06);
    [BS.armL, BS.armR].forEach((q, i) => { if (q.dead) return; q.g.rotation.y = Math.sin(t * 0.8 + i * 2) * 0.35; BS.armT[i] -= dt; if (BS.armT[i] <= 0 && aliveCount(S) < CAP) { BS.armT[i] = touch ? 11 : 9; const kinds = ['walker', 'exploder', 'shield', 'walker', 'laser']; const px = q.x, pz = Z - 6.6, r = spawn(S, kinds[BS.armI++ % kinds.length], px, pz, 0, { extra: true }); puffAt(px, FY + 1, pz, 0.9, 0x3fd3ff); bark(r, 'BUILD COMPLETE'); } });
    if (!BS.hop.dead) { BS.hopT -= dt; if (BS.hopT <= 0 && aliveCount(S) < CAP) { BS.hopT = 12; for (const s of [-1.4, 1.4]) { const r = spawn(S, 'exploder', X + s, Z - 8.2, 0, { extra: true }); r.st = 'go'; } puffAt(X, FY + 1.2, Z - 9, 0.8, 0x9aa0a6); snd.burst(0.2, 260, 0.2); } }
    if (!BS.eye.dead) { if (!BS.sweep) { BS.eyeT -= dt; if (BS.eyeT <= 0) { BS.sweep = { t: 0, z: Z - 8, hit: false }; BS.eyeT = 8; float('JUMP!', X, FY + 6, Z - 8, true, 1.0); } }
      else { const w = BOSS.w - 1.5, sw = BS.sweep; sw.t += dt; if (sw.t < 1.0) { BS.telM.visible = true; BS.telM.scale.set(w, 0.02, 0.5); BS.telM.position.set(X, FY + 0.03, sw.z); }
        else { BS.telM.visible = false; sw.z += 9.5 * dt; BS.sweepM.visible = true; BS.sweepM.scale.set(w, 0.16, 0.16); BS.sweepM.position.set(X, FY + 0.45, sw.z); if (!sw.hit && Math.abs(P.z - sw.z) < 0.45 && grounded && Math.abs(P.x - X) < w / 2) { sw.hit = true; hurt(14); } if (sw.z > Z + BOSS.d / 2 - 0.5) { BS.sweep = null; BS.sweepM.visible = false; } } } }
    if (!BS.open && S.parts.every(q => q.k === 'core' || q.dead)) { BS.open = true; BS.ringT = 2.5; }
    if (BS.open) { BS.grill.position.y = damp(BS.grill.position.y, FY - 1.8, 3, dt);
      if (!BS.ring) { BS.ringT -= dt; if (BS.ringT <= 0) { BS.ring = { r: 1, hit: false }; BS.ringT = 5.5; snd.tone(120, 0.6, 0.06, 'sawtooth'); } }
      else { const rg = BS.ring; rg.r += 8 * dt; BS.ringM.visible = true; BS.ringM.scale.set(rg.r, 1, rg.r); BS.ringM.position.set(BS.core.x, FY + 0.06, BS.core.z); const pd = Math.hypot(P.x - BS.core.x, P.z - BS.core.z); if (!rg.hit && Math.abs(pd - rg.r) < 0.5 && grounded) { rg.hit = true; hurt(12); } if (rg.r > 24) { BS.ring = null; BS.ringM.visible = false; } }
      if (!BS.drones && BS.core.hp < BS.core.max / 2) { BS.drones = true; for (let k = 0; k < (touch ? 3 : 4); k++) spawn(S, 'drone', X - 6 + k * 4, Z - 6, 0, { extra: true }); say('DRONE SWARM \u00b7 SHOOT THEM DOWN', 2.5); } } }

  // ---------- the player's swings + shots ----------
  let cur = null, lastP = null, T0 = 0, mCd = 0, sCd = 0, hack = null, ko = false, done = false, toastS = '', toastT = 0, flashT = 0;
  const stats = { down: 0 };
  const say = (s, t = 3) => { toastS = s; toastT = t; };
  function hitCage(S, c) { if (c.freed) return; c.hp--; c.g.rotation.y = (rnd() - 0.5) * 0.2; snd.burst(0.08, 900, 0.14); puffAt(c.x, baseY(S, c.x, c.z) + 1.4, c.z, 0.5, 0x9aa0a6);
    if (c.hp > 0) { float('CAGE ' + c.hp + ' MORE', c.x, baseY(S, c.x, c.z) + 2.8, c.z); return; }
    c.freed = true; c.g.visible = false; c.pr.col.on = false; c.pr.dead = true; c.t = 0; const l = freedList(); if (!l.includes(c.id)) save.setStat('mfWorkersFreed', [...l, c.id]); save.addGold(25); save.addXp && save.addXp(10);
    float('THANK YOU!', c.x, baseY(S, c.x, c.z) + 2.6, c.z, false, 1.6); say('WORKER FREED \u00b7 +25 G \u00b7 ' + freedList().length + ' OF 3', 3); snd.tone(660, 0.12, 0.05); setTimeout(() => snd.tone(990, 0.15, 0.05), 120); }
  function attack(kind, P, fox, k = 1) { const S = cur; if (!S || ko) return false;
    if (!S.engaged || done) { const fx = Math.sin(P.yaw), fz = Math.cos(P.yaw); for (const c of S.cages) { if (c.freed) continue; const dx = c.x - P.x, dz = c.z - P.z, d = Math.hypot(dx, dz); if (kind === 'melee' ? d < 2.4 : d < 16 && (dx * fx + dz * fz) / (d || 1) > 0.75) { if (kind === 'melee') { if (mCd > 0) return true; mCd = 0.42; } else { if (sCd > 0) return true; sCd = 0.34; beamTo(P.x + fx * 0.5, P.y + 1.15, P.z + fz * 0.5, c.x, baseY(S, c.x, c.z) + 1.2, c.z); } hitCage(S, c); return true; } } return false; } foxRef = fox; const fx = Math.sin(P.yaw), fz = Math.cos(P.yaw);
    if (kind === 'melee') { if (mCd > 0) return true; mCd = 0.42; slash.t = 0.16; slash.g.visible = true; slash.g.position.set(P.x, P.y + 1.0, P.z); slash.g.rotation.y = P.yaw; snd.burst(0.05, 1800, 0.08); const dmg = 30 * (k || 1); let any = false;
      for (const r of S.robots) { if (r.dead || r.t === 'turret' && r.ally) continue; const dx = r.x - P.x, dz = r.z - P.z, d = Math.hypot(dx, dz); if (d < 2.2 + r.R * 0.6 && (dx * fx + dz * fz) / (d || 1) > 0.2 && (!r.fly || r.alt < 2.1)) { hitRobot(r, dmg, P, 'melee'); any = true; } }
      for (const q of S.parts) if (!q.dead && q.y < 3.6 && Math.hypot(q.x - P.x, q.z - P.z) < 2.3 + q.r) { hitPart(S, q, dmg); any = true; }
      for (const c of S.cages) if (!c.freed && Math.hypot(c.x - P.x, c.z - P.z) < 2.4) { hitCage(S, c); any = true; }
      if (!any) for (const p of S.props) if (p.hp && !p.dead && Math.hypot(p.x - P.x, p.z - P.z) < 1.9 + p.r && ((p.x - P.x) * fx + (p.z - P.z) * fz) > 0) { hitProp(p, dmg); break; }
      return true; }
    if (sCd > 0) return true; sCd = 0.34; let best = null, bs = -9; const Y0 = P.y + 1.15, ax = P.x + fx * 0.5, az = P.z + fz * 0.5;
    const consider = (x, z, extra, obj) => { const dx = x - P.x, dz = z - P.z, d = Math.hypot(dx, dz); if (d > 19 || d < 0.01) return; const dot = (dx * fx + dz * fz) / d; if (dot < 0.72) return; const s = dot * 2 - d / 19 + extra; if (s > bs) { bs = s; best = obj; } };
    for (const r of S.robots) if (!r.dead && !r.ally) consider(r.x, r.z, (r.t === 'repair' ? 0.25 : 0) + (r.t === 'exploder' ? 0.15 : 0) - (r.duck > 0.5 ? 0.35 : 0), { r });
    for (const q of S.parts) if (!q.dead && !(q.k === 'core' && !BS.open)) consider(q.x, q.z, 0.2, { q });
    for (const c of S.cages) if (!c.freed) consider(c.x, c.z, -0.6, { c });
    if (best && best.r) { const r = best.r, ty = baseY(S, r.x, r.z) + (r.fly ? r.alt : 1.0), blk = r.fly ? null : blocker(S, P.x, P.z, r.x, r.z, r.duck > 0.5 ? 1.0 : 1.9);
      if (blk) { const by = baseY(S, blk.x, blk.z); beamTo(ax, Y0, az, blk.x, by + Math.min(blk.h, 1.0), blk.z); if (blk.hp) hitProp(blk, 15); else float('COVER', blk.x, by + blk.h + 0.6, blk.z); } else { beamTo(ax, Y0, az, r.x, ty, r.z); hitRobot(r, 15, P, 'range'); } }
    else if (best && best.q) { beamTo(ax, Y0, az, best.q.x, FY + best.q.y, best.q.z); hitPart(S, best.q, 15); }
    else if (best && best.c) { beamTo(ax, Y0, az, best.c.x, baseY(S, best.c.x, best.c.z) + 1.2, best.c.z); hitCage(S, best.c); }
    else { const blk = blocker(S, P.x, P.z, P.x + fx * 16, P.z + fz * 16, 0.9); if (blk) { beamTo(ax, Y0, az, blk.x, baseY(S, blk.x, blk.z) + Math.min(blk.h, 1.0), blk.z); if (blk.hp) hitProp(blk, 15); } else beamTo(ax, Y0, az, ax + fx * 16, Y0, az + fz * 16); }
    snd.tone(880, 0.08, 0.04, 'square'); return true; }
  function startHack(C) { if (done) return; if (!C.tur || C.tur.dead) { say('THAT TURRET IS BROKEN', 2); return; } if (C.hacked) { say('ALREADY HACKED \u00b7 IT FIGHTS FOR YOU', 2); return; } if (!C.S.engaged && !C.S.cleared) engage(C.S); hack = { C, t: 0 }; snd.tone(440, 0.1, 0.04, 'square'); }

  // ---------- stage flow: doors, clears, knock-outs ----------
  let veil = null, busy = false;
  const fade = fn => { if (busy) return; busy = true; if (!veil) { veil = document.createElement('div'); Object.assign(veil.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity 0.26s', zIndex: '45' }); document.body.appendChild(veil); }
    requestAnimationFrame(() => { veil.style.opacity = '1'; }); setTimeout(() => { try { fn(); } finally { setTimeout(() => { veil.style.opacity = '0'; busy = false; }, 140); } }, 290); };
  const stageN = () => save.stat('factoryStage', 0) || 0;
  const sdf = (BT && D.fx ? BT.d : BT.w) / 2 + 10, FM = W(-sdf, 6);
  const toStreet = (lx = 0, lz = 5.5, yaw = D.ry) => { const [x, z] = W(lx, lz); go(x, terrainAt(x, z) + 0.3, z, yaw); };
  function enter(i) { fade(() => { const S = STG[i]; if (cur && cur !== S && cur.room && !cur.cleared) { clearRobots(cur); cur.engaged = false; } if (!S.cleared) resetStage(S); IG.visible = true; go(S.ox, FY, FZ + S.d / 2 - 4.2, Math.PI); cur = S; if (!S.cleared) { S.engaged = false; S.tipped = false; engage(S); } }); }
  function leave(S) { fade(() => { if (!S.cleared) { clearRobots(S); if (S.boss) resetStage(S), clearRobots(S); } S.engaged = false; hack = null; IG.visible = false; toStreet(); }); }
  function stageClear(S) { S.cleared = true; S.engaged = false; hack = null; for (const r of S.robots) if (!r.dead && r.t === 'turret') { if (r.ally) { r.ally = false; r.p.hb.visible = false; r.p.hr.visible = true; } killR(r, 'off'); }
    save.setStat('factoryStage', Math.max(stageN(), S.i + 1)); if (S.lamp) S.lamp.material = LAMP.green; snd.tone(523, 0.15, 0.05); setTimeout(() => snd.tone(784, 0.25, 0.05), 150);
    say(S.room ? S.title + ' CLEAR \u00b7 THE BACK DOOR IS OPEN' : 'STREET CLEAR \u00b7 THE FACTORY DOOR IS OPEN', 3.5); if (!S.room) doorSpot.prompt = 'ENTER \u00b7 ROBOT FACTORY \u00b7 ASSEMBLY LINE'; }
  function knockOut(S) { ko = true; fade(() => { PH.hp = PH.max; PH.inv = 1.5; if (S.room) { resetStage(S); S.engaged = false; S.tipped = true; go(S.ox, FY, FZ + S.d / 2 - 4.2, Math.PI); engage(S); } else { disengage(S); toStreet(-sdf + 2.2, 8.5, D.ry - Math.PI / 2); } say('KNOCKED OUT \u00b7 THE ROBOTS RESET \u00b7 TRY AGAIN', 3.5); ko = false; }); }
  const doorSpot = { key: 'mf:door', x: W(0, 2.4)[0], z: W(0, 2.4)[1], r: 2.4, y: [-3, 6], prompt: 'ROBOT FACTORY \u00b7 TAKEN OVER', use: () => { if (done) { say('TAKEN BACK \u00b7 THE FOREMAN REOPENS THE LINE SOON', 3); return; } if (!street.cleared) { say('ROBOTS ON THE STREET \u00b7 BREAK THE BUILDER BOTS FIRST', 3); return; } enter(1); } };
  SPOTS.push(doorSpot);
  for (const S of [ASM, BAY, BOSS]) { SPOTS.push({ key: 'mf:back:' + S.i, x: S.ox, z: FZ + S.d / 2 - 1.3, r: 2.0, y: [FY - 1, FY + 3], prompt: 'LEAVE \u00b7 BACK TO THE STREET', use: () => leave(S) });
    if (!S.boss) SPOTS.push({ key: 'mf:next:' + S.i, x: S.ox, z: FZ - S.d / 2 + 1.4, r: 2.2, y: [FY - 1, FY + 3], prompt: 'NEXT \u00b7 ' + STG[S.i + 1].title, use: () => { if (!S.cleared) { say('LOCKED \u00b7 BREAK THE BUILDER BOTS + EVERY ROBOT', 2.5); return; } enter(S.i + 1); } }); }
  // progress kept between visits: the stages already cleared stay cleared
  { const n = stageN(); for (let i = 0; i < Math.min(n, 3); i++) { STG[i].cleared = true; if (STG[i].lamp) STG[i].lamp.material = LAMP.green; } if (street.cleared) doorSpot.prompt = 'ENTER \u00b7 ROBOT FACTORY \u00b7 ASSEMBLY LINE'; else resetStage(street); }
  for (const C of street.consoles) if (C && street.cleared) C.spot.r = 0;

  // ---------- strip + clear card (Modernist: ink rules, flush left, no corners) ----------
  const strip = document.createElement('div'); Object.assign(strip.style, { position: 'fixed', left: '50%', transform: 'translateX(-50%)', top: 'calc(env(safe-area-inset-top, 0px) + 56px)', width: 'min(92vw, 420px)', background: '#f3f2f2', border: '2px solid #201e1d', fontFamily: 'Archivo, Helvetica, sans-serif', color: '#201e1d', zIndex: '30', pointerEvents: 'none', display: 'none', boxSizing: 'border-box' });
  strip.innerHTML = '<div style="background:#201e1d;color:#f3f2f2;font-weight:800;font-size:11px;letter-spacing:2px;padding:4px 10px;display:flex;justify-content:space-between;gap:8px"><span data-k></span><span data-h style="color:#ffd23a"></span></div><div data-l style="font-weight:700;font-size:13px;padding:6px 10px;line-height:1.25;text-wrap:pretty"></div><div data-b style="display:none;height:10px;margin:0 10px 8px;border:2px solid #201e1d;background:#f3f2f2"><div style="height:100%;width:0;background:#ec3013"></div></div>';
  document.body.appendChild(strip);
  const vig = document.createElement('div'); Object.assign(vig.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '29', boxShadow: 'inset 0 0 90px 24px rgba(236,48,19,0.75)', opacity: '0' }); document.body.appendChild(vig);
  let topT = 0; const placeStrip = () => { const q = document.querySelector('[aria-label="Open journal"]'), bar0 = q && q.parentElement ? q.parentElement.getBoundingClientRect().bottom : 0; strip.style.top = Math.round(Math.max(bar0, 0) + (bar0 ? 38 : 56)) + 'px'; }; const sK = strip.querySelector('[data-k]'), sH = strip.querySelector('[data-h]'), sL = strip.querySelector('[data-l]'), sB = strip.querySelector('[data-b]'), sBf = sB.firstChild; let lastStrip = '';
  function syncStrip() { let show = !!(!done && cur && (cur.engaged || cur.room || hack)), k = '', l = '', b = -1, h = '';
    if (show) { const S = cur; k = S.boss ? 'MAKER PRIME \u00b7 THE FACTORY BOSS' : 'ROBOT FACTORY \u00b7 ' + (S.i + 1) + '/4 \u00b7 ' + S.title; h = 'HP ' + Math.round(PH.hp);
      if (hack) { const pct = Math.min(100, Math.round(hack.t / 2 * 100)); l = 'HACKING THE TURRET \u00b7 STAY AT THE CONSOLE \u00b7 ' + pct + '%'; b = pct / 100; }
      else if (S.boss) { const tot = S.parts.reduce((a, q) => a + q.max, 0), now = S.parts.reduce((a, q) => a + Math.max(0, q.hp), 0); b = now / tot; const left = S.parts.filter(q => q.k !== 'core' && !q.dead).map(q => q.name);
        l = BS.dead ? 'MAKER PRIME IS GOING DOWN' : BS.open ? 'CORE OPEN \u00b7 HIT THE CORE \u00b7 JUMP THE SHOCK RINGS' : 'BREAK: ' + left.join(' \u00b7 ') + (BS.eye.dead ? '' : ' \u00b7 JUMP THE RED LASER'); }
      else if (S.cleared) l = S.room ? 'CLEAR \u00b7 THE BACK DOOR IS OPEN' : 'STREET CLEAR \u00b7 ENTER THE FACTORY';
      else { const nb = S.robots.filter(r => r.t === 'builder' && !r.dead).length, n = aliveCount(S); l = nb ? 'BREAK THE BUILDER BOTS \u00b7 ' + nb + ' LEFT \u00b7 ROBOTS ' + n : 'FINISH THE ROBOTS \u00b7 ' + n + ' LEFT'; if (S.consoles.some(C => C && !C.hacked && C.tur && !C.tur.dead)) l += ' \u00b7 HACK A CONSOLE'; }
      if (save.flag('mfLunchbox') && !save.flag('mfLunchboxBack')) l += ' \u00b7 CARRYING THE LUNCHBOX'; }
    vig.style.opacity = flashT > 0 ? String(Math.min(1, flashT / 0.25)) : PH.hp < 30 && show ? String(0.25 + Math.sin(performance.now() / 180) * 0.12) : '0';
    const key = show + k + l + h + Math.round(b * 50) + (flashT > 0); if (key === lastStrip) return; lastStrip = key; if (show && (topT -= 1) <= 0) { topT = 20; placeStrip(); }
    strip.style.display = show ? 'block' : 'none'; if (!show) return; sK.textContent = k; sH.textContent = h; sH.style.color = PH.hp < 30 ? '#ec3013' : '#ffd23a'; sL.textContent = l; sB.style.display = b >= 0 ? 'block' : 'none'; if (b >= 0) sBf.style.width = Math.round(b * 100) + '%'; strip.style.borderColor = flashT > 0 ? '#ec3013' : '#201e1d'; }
  function card(rows) { const bg = document.createElement('div'); Object.assign(bg.style, { position: 'fixed', inset: '0', background: 'rgba(32,30,29,0.55)', zIndex: '44', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Archivo, Helvetica, sans-serif' });
    bg.innerHTML = '<div style="background:#f3f2f2;border:2px solid #201e1d;width:min(92vw,380px);max-height:86vh;overflow:auto;color:#201e1d"><div style="background:#ec3013;color:#f3f2f2;font-weight:800;font-size:11px;letter-spacing:2px;padding:6px 14px">MACHINE FLEET \u00b7 ROBOT FACTORY</div><div style="font-weight:900;font-size:26px;line-height:1.05;padding:14px 14px 10px">TAKEN BACK</div>'
      + rows.map(([a, b2]) => '<div style="display:flex;justify-content:space-between;gap:12px;border-top:2px solid #201e1d;padding:9px 14px;font-size:13px"><span style="font-weight:800">' + a + '</span><span style="font-weight:600;text-align:right">' + b2 + '</span></div>').join('')
      + '<button data-ok style="display:block;width:100%;min-height:48px;border:0;border-top:2px solid #201e1d;background:#201e1d;color:#f3f2f2;font:800 14px Archivo, Helvetica, sans-serif;letter-spacing:1px;text-align:left;padding:0 14px;cursor:pointer">BACK TO THE STREET</button></div>';
    document.body.appendChild(bg); const ok = bg.querySelector('[data-ok]'); ok.onclick = e => { e.stopPropagation(); bg.remove(); fade(() => { IG.visible = false; toStreet(-sdf + 2.2, 8.5, D.ry - Math.PI / 2); }); }; }
  function giveLunch() { if (!save.flag('mfLunchbox') || save.flag('mfLunchboxBack')) return false; save.setFlag('mfLunchboxBack'); save.addGold(30); save.addXp && save.addXp(10); return true; }
  function finish() { done = true; hack = null; const S = save, gold = 220, xp = 160, secs = T0 ? Math.round((performance.now() - T0) / 1000) : 0;
    S.setFlag('robotFactoryCleared'); clearWalk(); S.setFlag('mfFavour'); S.addRelic && S.addRelic('fleetCog');
    const SUIT = { outfit: 'suit', torso: ['#5d6f82', '#cbd5e1', '#ec3013'], name: 'MACHINE FLEET SUIT' }, have = S.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) S.setStat('tailorOutfits', [...list, SUIT]);
    S.addGold(gold); S.addXp && S.addXp(xp); S.setStat('factoryClears', (S.stat('factoryClears', 0) || 0) + 1); const best = S.stat('factoryBest', 0); if (secs && (!best || secs < best)) S.setStat('factoryBest', secs); S.setStat('factoryStage', 4);
    const lunch = giveLunch(); for (const st of STG) { clearRobots(st); st.engaged = false; } BS.sweepM.visible = BS.telM.visible = BS.ringM.visible = false; strip.style.display = 'none'; doorSpot.prompt = 'ROBOT FACTORY \u00b7 TAKEN BACK';
    const mm = Math.floor(secs / 60), ss = String(secs % 60).padStart(2, '0');
    card([['REWARD', '+' + gold + ' G \u00b7 +' + xp + ' XP'], ['RELIC', 'FLEET COG'], ['OUTFIT', 'MACHINE FLEET SUIT \u00b7 AT THE TAILOR'], ['FAVOUR', 'MACHINE FLEET HQ BACK ROOM'], ['WORKERS FREED', freedList().length + ' OF 3'],
      ['LUNCHBOX', S.flag('mfLunchboxBack') ? (lunch ? 'RETURNED \u00b7 +30 G' : 'RETURNED') : 'STILL IN THE LOADING BAY'], ['ROBOTS DOWN', String(stats.down)], ['TIME', secs ? mm + ':' + ss : '\u2014']]); }

  // ---------- per frame ----------
  const roomAt = (x, z, y) => { if (y < FY - 10 || y > FY + 14) return null; for (const S of [ASM, BAY, BOSS]) if (Math.abs(x - S.ox) < S.w / 2 + 0.5 && Math.abs(z - FZ) < S.d / 2 + 0.5) return S; return null; };
  let cullT = 0;
  function tick(dt, P, fox) { if (!P) return; lastP = P; if (fox) foxRef = fox; if (!dt) { syncStrip(); return; }
    mCd -= dt; sCd -= dt; PH.inv -= dt; barkT -= dt; flashT -= dt; if ((toastT -= dt) <= 0) toastS = '';
    const R = roomAt(P.x, P.z, P.y); if (R) IG.visible = true; else if (IG.visible && !busy) IG.visible = false;
    if ((cullT -= dt) <= 0) { cullT = 0.5; EG.visible = Math.hypot(P.x - D.x, P.z - D.z) < (touch ? 120 : 170); }
    let S = R; if (!R && !done) { const [lx, lz] = LOC(P.x, P.z), near = P.y > -30 && lx > -24 && lx < 24 && lz > -2 && lz < 36; if (near) S = street;
      if (street.engaged && (!near && (Math.hypot(lx, lz - 14) > 40 || P.y < -30))) disengage(street); else if (near && !street.engaged && !street.cleared && lz < 30 && Math.abs(lx) < 18 && P.y < 6) engage(street); }
    cur = S;
    for (const tex of [beltTex]) tex.offset.y -= dt * 0.35;
    if (R === ASM) for (const it of BELTITEMS) { it.u = (it.u + dt * 0.035) % 1; it.g.position.set(it.X, FY + 0.85, it.z1 - (it.z1 - it.z0) * it.u); }
    if (S && !done) {
      for (const r of S.robots) think(r, dt, P, S); S.robots = S.robots.filter(r => !r.gone); if (S.engaged) separate(S);
      if (S.boss && S.engaged) bossTick(S, dt, P);
      for (const c of S.cages) { if (c.freed) { c.t += dt; if (c.t < 2.2) { c.f.position.y = baseY(S, c.x, c.z) + Math.abs(Math.sin(c.t * 9)) * 0.25; c.f.rotation.y += dt * 4; kit.animFox(c.f, dt, 2, false); } else c.f.visible = false; } else kit.animFox(c.f, dt, 0, false); }
      for (let i = S.cells.length - 1; i >= 0; i--) { const c = S.cells[i]; c.t += dt; c.m.rotation.y += dt * 2; c.m.position.y = baseY(S, c.x, c.z) + 0.5 + Math.sin(c.t * 3) * 0.1; if (Math.hypot(P.x - c.x, P.z - c.z) < 1.1) { PH.hp = Math.min(PH.max, PH.hp + 15); float('+15 HP', c.x, c.m.position.y + 1, c.z); snd.tone(990, 0.1, 0.04); S.par.remove(c.m); S.cells.splice(i, 1); } else if (c.t > 25) { S.par.remove(c.m); S.cells.splice(i, 1); } }
      if (hack) { const sp = hack.C.spot; if (Math.hypot(P.x - sp.x, P.z - sp.z) > sp.r + 0.8 || hack.C.tur.dead) { say('HACK STOPPED \u00b7 STAY AT THE CONSOLE', 2); hack = null; } else { hack.t += dt; if (Math.floor(hack.t * 6) !== Math.floor((hack.t - dt) * 6)) snd.tone(600 + hack.t * 300, 0.04, 0.03, 'square');
        if (hack.t >= 2) { const C = hack.C; C.hacked = true; C.scr.material = scrM.b; C.tur.ally = true; C.tur.p.hr.visible = false; C.tur.p.hb.visible = true; C.tur.cd = 0.5; C.spot.r = 0; hack = null; float('HACKED', C.tur.x, baseY(S, C.tur.x, C.tur.z) + 3, C.tur.z, false, 1.6); say('TURRET HACKED \u00b7 IT SHOOTS THE ROBOTS NOW', 3); snd.tone(1320, 0.2, 0.05); } } }
      if (S.engaged && !S.cleared && !S.boss && S.robots.every(r => r.dead || r.t === 'turret')) stageClear(S);
      if (PH.hp <= 0 && !ko) knockOut(S); }
    if (!done) { for (const b of BOLTS) { if (!b.on) continue; b.life -= dt; const nx = b.x + b.vx * dt, ny = b.y + b.vy * dt, nz = b.z + b.vz * dt; let hit = b.life <= 0 || !b.S.inb(nx, nz, 3);
        if (!hit) { const by0 = baseY(b.S, nx, nz); for (const p of b.S.props) { if (p.dead || ny - by0 > p.h) continue; if (Math.hypot(p.x - b.ox, p.z - b.oz) < p.r + 1.0) continue; if (Math.hypot(nx - p.x, nz - p.z) < p.r) { hit = true; if (p.hp) hitProp(p, b.dmg); puffAt(nx, ny, nz, 0.25, b.ally ? 0x3fd3ff : 0xff3b1f); break; } } }
        if (!hit && !b.ally && Math.hypot(nx - P.x, nz - P.z) < 0.55 && Math.abs(ny - (P.y + 1.0)) < 0.95) { hit = true; hurt(b.dmg); }
        if (!hit && b.ally) for (const r of b.S.robots) if (!r.dead && !r.ally && r.t !== 'turret' && Math.hypot(nx - r.x, nz - r.z) < r.R + 0.3) { hit = true; hitRobot(r, b.dmg, { x: b.ox, z: b.oz }, 'ally'); break; }
        if (hit) { b.on = false; b.m.visible = false; } else { b.x = nx; b.y = ny; b.z = nz; b.m.position.set(nx, ny, nz); } } }
    if (!R && Math.hypot(P.x - FM[0], P.z - FM[1]) < 3.4 && P.y > -30 && giveLunch()) say("LUNCHBOX RETURNED \u00b7 THE FOREMAN IS DELIGHTED \u00b7 +30 G", 3.5);
    for (const f of FL) if (f.t > 0) { f.t -= dt; f.s.position.y += dt * 0.6; f.s.material.opacity = Math.min(1, f.t / 0.3); if (f.t <= 0) f.s.visible = false; }
    for (const f of PUFFS) if (f.t > 0) { f.t -= dt; const k = 1 - f.t / 0.45; f.m.scale.setScalar(f.s * (0.3 + k)); f.m.material.opacity = 1 - k; if (f.t <= 0) f.m.visible = false; }
    for (const b of BEAMS) if (b.t > 0) { b.t -= dt; b.m.material.opacity = 0.95 * Math.max(0, b.t / 0.14); if (b.t <= 0) b.m.visible = false; }
    if (slash.t > 0) { slash.t -= dt; slash.m.material.opacity = Math.max(0, slash.t / 0.16) * 0.8; slash.g.position.set(P.x, P.y + 1.0, P.z); if (slash.t <= 0) slash.g.visible = false; }
    syncStrip(); }
  function camFix(camera, P) { const S = roomAt(P.x, P.z, P.y); if (!S) return; const c = camera.position, m = 0.45, tx = P.x, ty = P.y + 1.4, tz = P.z, dx = c.x - tx, dy = c.y - ty, dz = c.z - tz; let t = 1;
    const bx0 = S.ox - S.w / 2 + m, bx1 = S.ox + S.w / 2 - m, bz0 = FZ - S.d / 2 + m, bz1 = FZ + S.d / 2 - m, top = FY + S.h - 0.5;
    if (dx > 0) t = Math.min(t, (bx1 - tx) / dx); else if (dx < 0) t = Math.min(t, (bx0 - tx) / dx); if (dz > 0) t = Math.min(t, (bz1 - tz) / dz); else if (dz < 0) t = Math.min(t, (bz0 - tz) / dz); if (dy > 0) t = Math.min(t, (top - ty) / dy);
    t = Math.max(0.15, Math.min(1, t)); const hd = Math.hypot(dx, dz) * t; c.set(tx + dx * t, Math.max(FY + 0.5, ty + dy * t), tz + dz * t); if (hd < 3) c.y = Math.min(top, Math.max(c.y, ty + 1.2 + (3 - hd) * 0.7)); camera.lookAt(tx, ty, tz); }
  const on = () => !done && !!cur && cur.engaged;
  return { spots: SPOTS, tick, attack, on, hp: () => Math.round(PH.hp), max: () => PH.max, heal: n => { PH.hp = Math.min(PH.max, PH.hp + n); return Math.round(PH.hp); }, foes: () => (cur ? live(cur).filter(r => r.t !== 'turret' || !r.ally).length : 0),
    groundAt: (x, z, y) => (roomAt(x, z, y) ? FY : null), inside: P => !!P && !!roomAt(P.x, P.z, P.y), where: P => { const S = P && roomAt(P.x, P.z, P.y); return S ? { key: 'meruRobotFactory', label: 'ROBOT FACTORY \u00b7 ' + S.title, music: 'civic' } : null; },
    camFix, toast: () => toastS, stages: STG, boss: BS, stats, debug: { enter, finish, street: () => street, tpStreet: () => toStreet(0, 18, D.ry + Math.PI) } };
}
