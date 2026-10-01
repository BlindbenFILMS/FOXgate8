// 8 GATES 3D — SPACE: the ship, flight, the fights, the trade, the HUD. Scene and set dressing live in space-game.js.
import { mk, marks, THREE, scene, camera, renderer, WORLDS, EARTH, BODIES, STRUCTS, PORTS3, ROCKS, DSF, M, BOX, CYL, toon, glowing, glow, outlineMat, ANIM, SPIN, MOONS, GATE_MATS, grad, rocksNear, writeRock, ROCK_IM, razePort, low, touch, $, show, TAU, wrapA, QS, save } from './space-game.js';
import { rr, pick, clamp, smooth, damp, Ambience } from '../village-game.js';

// ================================================================ SHIP MODELS
function foxFighter(hullCol = '#eef2f7', acc = '#ec3013', canopy = '#7fd8ff') {
  const g = new THREE.Group(), hull = toon(hullCol), a = toon(acc), dark = toon('#3a404c');
  M(new THREE.CapsuleGeometry(1.15, 6.2, 6, 16), hull, 0, 0, 0.3, g, 0.06, 1.15).rotation.x = Math.PI / 2;
  M(new THREE.ConeGeometry(1.15, 2.6, 16), hull, 0, 0, 5.2, g, 0.06, 1.15).rotation.x = Math.PI / 2;
  M(new THREE.SphereGeometry(0.85, 16, 10, 0, TAU, 0, Math.PI / 2), glowing(canopy, 0.9), 0, 0.7, 2.0, g, 0.04, 0.85).scale.z = 1.6;
  for (const s of [-1, 1]) {
    const wing = new THREE.Shape(); wing.moveTo(0, 2.2); wing.lineTo(4.8, -1.6); wing.lineTo(4.6, -2.6); wing.lineTo(0, -2.2); wing.closePath();
    const wg = new THREE.ExtrudeGeometry(wing, { depth: 0.22, bevelEnabled: false }); const w = M(wg, a, s * 0.6, -0.15, -0.6, g, 0.05); w.rotation.set(Math.PI / 2, 0, 0); w.scale.x = s;
    M(CYL(0.42, 0.55, 2.6, 12), dark, s * 1.55, -0.1, -3.2, g, 0.04, 0.55).rotation.x = Math.PI / 2;
    M(BOX(0.12, 1.3, 1.8), a, s * 5.1, 0.35, -1.9, g, 0.03);
    M(CYL(0.12, 0.12, 2.4, 6), dark, s * 3.3, -0.25, 1.0, g, 0).rotation.x = Math.PI / 2;
  }
  M(BOX(0.14, 1.5, 2.0), a, 0, 1.05, -2.6, g, 0.04);
  const flames = [-1, 1].map(s => glow(s * 1.55, -0.1, -4.7, 0x7fd8ff, 3, g));
  g.userData.flames = flames; g.userData.engines = [-1, 1].map(s => new THREE.Vector3(s * 1.55, -0.1, -4.6));
  return g;
}
function corsair(kind) {   // the 2D map's own pirate hulls: raiders fly the fighter, gunships the gunner, aces the flagship
  const art = { raider: 'fighter', gunship: 'gunner', ace: 'flagship' }[kind];
  const g = svgShip('space/ships/pirate_' + art + '.svg', kind === 'gunship' ? 12 : kind === 'ace' ? 15 : 10, { edge: kind === 'ace' ? '#8a6a2a' : '#7a1426', nozzle: '#2a0a10', flame: 0xff6a3a, thick: 0.07, lights: [[0.12, 0.7, 0xff3a2a], [0.88, 0.7, 0xff3a2a]] });
  const halo = glow(0, 0.5, 0, kind === 'ace' ? 0xffc040 : 0xff3a2a, kind === 'ace' ? 22 : 15, g, 0.25); g.userData.halo = halo;
  return g;
}
function cruiser() {   // King Might's peacekeepers: long, grey, quiet
  const g = new THREE.Group(), hull = toon('#8a90a0'), dark = toon('#3a404c'), lit = glowing('#ffd38a', 1.4);
  M(BOX(10, 6, 60), hull, 0, 0, 0, g, 0.2); M(BOX(16, 2, 26), hull, 0, -2, -8, g, 0.15); M(BOX(6, 8, 12), dark, 0, 6, -12, g, 0.15); M(new THREE.ConeGeometry(5, 14, 4), hull, 0, 0, 37, g, 0.15).rotation.set(Math.PI / 2, Math.PI / 4, 0);
  for (let i = 0; i < 10; i++) M(BOX(0.8, 0.8, 0.8), lit, 5.1, 1, -24 + i * 5, g, 0), M(BOX(0.8, 0.8, 0.8), lit, -5.1, 1, -24 + i * 5, g, 0);
  for (const s of [-1, 1]) M(CYL(2, 2.6, 6, 12), dark, s * 6, -2, -31, g, 0.1).rotation.x = Math.PI / 2;
  const fl = [glow(-6, -2, -35, 0xffd38a, 7, g), glow(6, -2, -35, 0xffd38a, 7, g)]; g.userData.flames = fl;
  M(BOX(6, 0.4, 6), toon('#e6b45a'), 0, 3.1, 10, g, 0.05);
  return g;
}
const FLEET_OF = { player: '8g', luxor: 'l', ur: 'ur', gaya: 'ga', meru: 'meru', zion: 'zi', nebo: 'ne', kufa: 'ku', jidda: 'ji' };
function hauler(tint, k) { const g = svgShip('space/ships/' + (FLEET_OF[k] || 'meru') + '_cargo.svg', 18, { edge: tint, thick: 0.1 }); return g; }

// ================================================================ TRAILS (engine ribbons)
class Trail {   // a ribbon of the last ~0.4s of an engine's path; old points age out so it stays short at any frame rate
  constructor(color, width = 1.2, n = 26, life = 0.42) { this.n = n; this.life = life; this.pts = []; this.w = width; const g = new THREE.BufferGeometry(); this.pos = new Float32Array(n * 2 * 3); this.col = new Float32Array(n * 2 * 4); g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.col, 4)); const idx = []; for (let i = 0; i < n - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } g.setIndex(idx); this.c = new THREE.Color(color);
    this.mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); this.mesh.frustumCulled = false; scene.add(this.mesh); }
  push(p, side, k = 1) { const now = performance.now() / 1000; const last = this.pts[0]; if (!last || now - last.t > 1 / 50 || Math.hypot(p.x - last.x, p.z - last.z) > 2) this.pts.unshift({ x: p.x, y: p.y, z: p.z, sx: side.x, sz: side.z, t: now }); else { last.x = p.x; last.y = p.y; last.z = p.z; }
    while (this.pts.length > this.n || (this.pts.length > 1 && now - this.pts[this.pts.length - 1].t > this.life)) this.pts.pop(); const N = this.pts.length;
    for (let i = 0; i < this.n; i++) { const q = this.pts[Math.min(i, N - 1)], age = clamp((now - q.t) / this.life, 0, 1), w = this.w * (1 - age) * k; this.pos.set([q.x + q.sx * w, q.y, q.z + q.sz * w, q.x - q.sx * w, q.y, q.z - q.sz * w], i * 6); const a = (1 - age) * (1 - age) * 0.85 * Math.min(1, k) * (i < N ? 1 : 0); this.col.set([this.c.r, this.c.g, this.c.b, a, this.c.r, this.c.g, this.c.b, a], i * 8); }
    this.mesh.geometry.attributes.position.needsUpdate = true; this.mesh.geometry.attributes.color.needsUpdate = true; }
  clear() { this.pts.length = 0; }
  dispose() { scene.remove(this.mesh); this.mesh.geometry.dispose(); }
}


// ================================================================ SHIPS FROM THE 2D ART: the space map's own fleet drawings, given a hull
// The silhouette is traced from the drawing's alpha, extruded into a hull with a bevelled edge, and the drawing
// itself is laid on the deck, so the ship IS the 2D ship seen from above, with depth, light and an ink outline.
const SHIP_IMG = new Map();
function loadShipArt(url) { if (!SHIP_IMG.has(url)) SHIP_IMG.set(url, new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = url; })); return SHIP_IMG.get(url); }
function svgShip(url, len, o = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  g.userData.flames = []; g.userData.engines = (o.engines || [[0.5, 0.9]]).map(() => new THREE.Vector3(0, 0, -len * 0.4));
  loadShipArt(url).then(im => { if (!im) return;
    const N = 160, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'); x.drawImage(im, 0, 0, N, N); const a = x.getImageData(0, 0, N, N).data;
    const L = [], R = []; for (let y = 0; y < N; y++) { let l = -1, r = -1; for (let i = 0; i < N; i++) if (a[(y * N + i) * 4 + 3] > 40) { if (l < 0) l = i; r = i; } if (l >= 0) { L.push([l, y]); R.push([r + 1, y]); } }
    if (L.length < 4) return;
    // the outline: down the left edge, back up the right, thinned to every few rows
    const pts = [], step = 2; for (let i = 0; i < L.length; i += step) pts.push(L[i]); pts.push(L[L.length - 1]); for (let i = R.length - 1; i >= 0; i -= step) pts.push(R[i]); pts.push(R[0]);
    const k = len / N, sx = px => (N / 2 - px) * k, sz = py => (N / 2 - py) * k;   // mirrored in x so the art reads right way round from behind
    const sh = new THREE.Shape(pts.map(([px, py]) => new THREE.Vector2(sx(px), sz(py))));
    const th = len * (o.thick || 0.06), bev = len * 0.018;
    const geo = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.8, bevelSegments: 2, curveSegments: 1 });
    geo.rotateX(Math.PI / 2); geo.translate(0, th / 2 + bev, 0);   // shape y -> world +z (nose forward); the front cap faces up
    // a blended wing, not a slab: thick along the spine, thin at the wing tips, the belly swept up
    { geo.computeBoundingBox(); const hw = Math.max(-geo.boundingBox.min.x, geo.boundingBox.max.x), mid = th / 2 + bev, P0 = geo.attributes.position; for (let i = 0; i < P0.count; i++) { const f = 1 - 0.78 * Math.pow(Math.min(1, Math.abs(P0.getX(i)) / hw), 1.3), y = P0.getY(i); P0.setY(i, y > mid ? mid + (y - mid) * f + th * 0.9 * f : mid + (y - mid) * f * 0.8); } geo.computeVertexNormals(); }
    // deck UVs: straight down from above, the drawing's own square
    const P = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < P.count; i++) uv.setXY(i, 0.5 - P.getX(i) / len, 0.5 + P.getZ(i) / len);
    const tc = document.createElement('canvas'); tc.width = tc.height = low ? 512 : 1024; tc.getContext('2d').drawImage(im, 0, 0, tc.width, tc.height);
    const tex = new THREE.CanvasTexture(tc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const deck = new THREE.MeshToonMaterial({ map: tex, gradientMap: grad, emissive: new THREE.Color('#ffffff'), emissiveMap: tex, emissiveIntensity: 0.18 });
    const side = toon(o.edge || '#3a4a7a');
    // groups: ExtrudeGeometry puts caps in group 0 and walls in group 1
    const hull = new THREE.Mesh(geo, [deck, side]); body.add(hull);
    const ol = new THREE.Mesh(geo, outlineMat); ol.scale.set(1 + 0.4 / len, 1.1, 1 + 0.4 / len); ol.position.y = -0.03; body.add(ol);
    // the crest dome over the drawing's medallion, and a glass canopy
    if (o.dome) { const [u, v, r] = o.dome; const d = new THREE.Mesh(new THREE.SphereGeometry(r * len, 24, 12, 0, TAU, 0, Math.PI / 2), new THREE.MeshPhongMaterial({ color: 0x9fdcff, transparent: true, opacity: 0.16, shininess: 120, specular: 0xffffff, depthWrite: false })); d.scale.y = 0.45; d.position.set((0.5 - u) * len, th * 1.9 + bev * 2 + 0.02, (0.5 - v) * len); body.add(d);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r * len * 1.02, len * 0.007, 6, 40), glowing('#7fd8ff', 2.0)); ring.rotation.x = Math.PI / 2; ring.position.copy(d.position); body.add(ring); g.userData.ring = ring; }
    (o.raise || []).forEach(([u, v, w, d2, h, col]) => M(BOX(w * len, h * len, d2 * len), toon(col || '#3f6a9a'), (0.5 - u) * len, th + bev * 2 + h * len / 2, (0.5 - v) * len, body, 0.05));
    (o.engines || [[0.5, (L[L.length - 1][1] - 4) / N]]).forEach(([u, v], i) => { const p = new THREE.Vector3((0.5 - u) * len, th * 0.6, (0.5 - v) * len - len * 0.03); g.userData.engines[i].copy(p); const n = M(CYL(len * 0.035, len * 0.045, len * 0.08, 12), toon(o.nozzle || '#1d2238'), p.x, p.y, p.z + len * 0.02, body, 0.04); n.rotation.x = Math.PI / 2; g.userData.flames.push(glow(p.x, p.y, p.z - len * 0.02, o.flame || 0x7fd8ff, 3, g)); });
    (o.lights || []).forEach(([u, v, col], i) => { const s = glow((0.5 - u) * len, th + bev * 2, (0.5 - v) * len, col, len * 0.08, g); g.userData.nav = g.userData.nav || []; g.userData.nav.push({ s, ph: i }); });
    g.userData.ready = true;
  });
  return g;
}
const PLAYER_ART = { url: 'space/ships/8g_drone.svg', len: 16, dome: [0.5, 0.55, 0.115], engines: [[0.425, 0.8], [0.572, 0.8]], lights: [[0.06, 0.72, 0xff4a4a], [0.94, 0.72, 0x4aff8a]], edge: '#33406e' };

// ================================================================ STATE, UPGRADES, SAVE
const UPG = { hull: { n: 'Hull plating', d: '+25 hull', c: [150, 260, 420] }, shield: { n: 'Shield capacitor', d: '+25 shield, faster recharge', c: [150, 260, 420] }, laser: { n: 'Laser coils', d: '+30% laser damage', c: [200, 340, 520] }, missile: { n: 'Missile rack', d: '+1 missile', c: [220, 380, 560] }, engine: { n: 'Engine tune', d: '+12% speed and boost', c: [180, 300, 480] } };
const up = k => save.stat('space.up.' + k, 0);
const S = { inv: 0, warpT: 0, x: 0, z: 0, vx: 0, vz: 0, yaw: 0, bank: 0, hp: 100, sh: 100, shT: 0, boostE: 100, cd: 0, mis: 3, misT: 0, t: 0, tgt: null, wp: null, docked: false, dead: 0, hits: 0, kills: 0, grace: 40 };
const maxHp = () => 100 + up('hull') * 25, maxSh = () => 100 + up('shield') * 25, maxMis = () => 3 + up('missile'), spdK = () => 1 + up('engine') * 0.12, dmgK = () => 1 + up('laser') * 0.3;
S.hp = maxHp(); S.sh = maxSh(); S.mis = maxMis();
const oreOf = () => save.stat('space.ore', 0);
function addOre(n) { save.setStat('space.ore', oreOf() + n); }
// where you start: beside the world you just left, or Meru's dock
{ const from = QS.get('from'); const w = WORLDS.find(w => w.k === from) || (from === 'station' ? WORLDS[0] : null) || (from === 'earth' ? EARTH : null) || WORLDS[4];
  const st = from === 'station' ? STRUCTS.find(s => s.kind === 'dsf') : STRUCTS.find(s => s.kind === 'dock' && s.w === w);
  if (st) { S.x = st.x + 60; S.z = st.z + 10; S.yaw = Math.PI / 2; } else { S.x = w.x + w.r + 160; S.z = w.z; S.yaw = Math.PI / 2; } }
const ship = svgShip(PLAYER_ART.url, PLAYER_ART.len, PLAYER_ART); scene.add(ship);
const trails = [new Trail(0x7fd8ff, 0.9), new Trail(0x7fd8ff, 0.9)];
const shieldBubble = new THREE.Mesh(new THREE.SphereGeometry(8, 24, 16), new THREE.MeshBasicMaterial({ color: 0x7fd8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); ship.add(shieldBubble); shieldBubble.scale.set(0.9, 0.5, 1.1);

// ================================================================ AUDIO
const audio = new Ambience(); let muted = false;
const sfx = {
  laser: () => audio.tone(1300, 0.06, 0.025, 'square', -0.6),
  elaser: () => audio.tone(520, 0.07, 0.025, 'sawtooth', -0.3),
  boom: (k = 1) => { audio.burst(0.35 * k, 90, 0.35 * k); audio.tone(70, 0.4 * k, 0.08, 'sine', -0.5); },
  hit: () => audio.tone(240, 0.08, 0.05, 'square', -0.4),
  shield: () => audio.tone(880, 0.1, 0.04, 'sine', 0.3),
  pickup: () => audio.tone(1500, 0.06, 0.04, 'triangle', 0.8),
  missile: () => { audio.burst(0.25, 400, 0.15); audio.tone(300, 0.3, 0.04, 'sawtooth', 1.2); },
  lock: () => audio.tone(1900, 0.04, 0.03, 'square'),
  warp: () => { audio.tone(200, 1.2, 0.08, 'sine', 3); audio.burst(0.8, 600, 0.1); },
  alarm: () => { audio.tone(660, 0.18, 0.06, 'square'); setTimeout(() => audio.tone(520, 0.18, 0.06, 'square'), 200); },
};

// ================================================================ PROJECTILES, BLASTS, LOOT (pooled)
const boltGeo = new THREE.CapsuleGeometry(0.28, 3.2, 4, 8); boltGeo.rotateX(Math.PI / 2);
const BOLTS = [], POOL = { p: [], e: [] };
const boltMat = { p: glowing('#8ff0ff', 3), e: glowing('#ff6a3a', 3), t: glowing('#ffb04a', 3) };
function bolt(team, x, y, z, dx, dz, sp, dmg, life = 1.2, src) {
  let b = (POOL[team] || POOL.e).pop(); if (!b) { b = { m: new THREE.Mesh(boltGeo, boltMat[team] || boltMat.e), team }; scene.add(b.m); }
  b.m.visible = true; b.m.position.set(x, y, z); b.m.rotation.set(0, Math.atan2(dx, dz), 0); b.vx = dx * sp; b.vz = dz * sp; b.t = life; b.dmg = dmg; b.team = team; b.src = src; BOLTS.push(b); return b;
}
const MISS = [];
const misGeo = new THREE.CapsuleGeometry(0.35, 2.2, 4, 8); misGeo.rotateX(Math.PI / 2);
function missile(x, z, yaw, tgt) { const m = new THREE.Mesh(misGeo, toon('#e8ecf2')); m.add(new THREE.Mesh(misGeo, outlineMat)); m.children[0].scale.setScalar(1.15); m.position.set(x, 0, z); scene.add(m); const fl = glow(0, 0, -1.8, 0xffb04a, 3.2, m); const tr = new Trail(0xffc070, 0.55, 18); MISS.push({ m, x, z, yaw, v: 150, t: 4.5, tgt, tr, fl }); sfx.missile(); }
const FX = [];   // {s, t, max, kind}
function flash(x, y, z, col, size, life = 0.45, grow = 2.5) { const s = glow(x, y, z, col, size, null, 1); FX.push({ s, t: 0, life, size, grow }); return s; }
const ringGeo = new THREE.RingGeometry(0.8, 1, 48);
function shock(x, z, col, R = 30) { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0, z); scene.add(m); FX.push({ ring: m, t: 0, life: 0.6, R }); }
const DEB = []; const debGeo = new THREE.BoxGeometry(1, 1, 1);
function debris(x, z, col, n = 8, sp = 40) { for (let i = 0; i < n; i++) { const m = new THREE.Mesh(debGeo, toon(col)); const s = rr(0.4, 1.4); m.scale.set(s, s * rr(0.3, 1), s); m.position.set(x, rr(-2, 2), z); scene.add(m); const a = rr(0, TAU), v = rr(sp * 0.3, sp); DEB.push({ m, vx: Math.cos(a) * v, vy: rr(-8, 8), vz: Math.sin(a) * v, rx: rr(-5, 5), rz: rr(-5, 5), t: rr(1.2, 2.4) }); } }
function explode(x, z, k = 1, col = '#24202c') { flash(x, 0, z, 0xffd08a, 14 * k, 0.5, 4); flash(x, 0, z, 0xff6a2a, 22 * k, 0.7, 3); for (let i = 0; i < 4 * k; i++) flash(x + rr(-6, 6) * k, rr(-3, 3), z + rr(-6, 6) * k, 0xffb04a, rr(6, 12) * k, rr(0.3, 0.7)); shock(x, z, 0xffc080, 26 * k); debris(x, z, col, Math.round(8 * k)); sfx.boom(Math.min(2, k)); shake(Math.min(1.2, 0.35 * k * 40 / Math.max(40, dist(x, z, S.x, S.z) * 0.5))); }
const LOOT = []; const crGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4), oreGeo = new THREE.OctahedronGeometry(0.9, 0);
function loot(x, z, kind, n = 1) { for (let i = 0; i < n; i++) { const m = new THREE.Mesh(kind === 'ore' ? oreGeo : crGeo, kind === 'ore' ? glowing('#ffd23a', 1.6) : glowing('#7fffb0', 1.2)); m.position.set(x + rr(-3, 3), 0, z + rr(-3, 3)); scene.add(m); const a = rr(0, TAU), v = rr(5, 18); LOOT.push({ m, kind, vx: Math.cos(a) * v, vz: Math.sin(a) * v, t: 40, val: kind === 'ore' ? 1 : 5 }); } }
const dist = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

// ================================================================ FOES: corsairs, port turrets; neutrals: cruisers, haulers
const FOES = [];
const KIND = { raider: { hp: 26, sp: 150, turn: 2.4, range: 420, cone: 0.22, rof: 0.32, dmg: 5, burst: 3, cr: 18, score: 1 }, gunship: { hp: 64, sp: 100, turn: 1.5, range: 360, cone: 0.3, rof: 0.9, dmg: 4, spread: 3, cr: 35, score: 2 }, ace: { hp: 130, sp: 165, turn: 2.8, range: 460, cone: 0.2, rof: 0.22, dmg: 6, burst: 5, cr: 120, score: 4, shield: 60 } };
const ACE_NAMES = ['Captain Rook', 'Mad Sal Vane', 'The Widow Krell', 'Jax "Ninefinger"', 'Oona Black'];
let raidN = 0;
function spawnFoe(kind, x, z, port, lead) {
  const K = KIND[kind]; const g = corsair(kind); scene.add(g);
  const f = { kind, K, g, x, z, yaw: Math.atan2(S.x - x, S.z - z), v: K.sp * 0.8, hp: K.hp, max: K.hp, sh: K.shield || 0, state: 'transit', st: 0, cd: rr(0.5, 1.5), burst: 0, port, lead, off: new THREE.Vector2(rr(-30, 30), rr(-40, -10)), trail: new Trail(0xff7a3a, kind === 'gunship' ? 1.1 : 0.7, 18), flashT: 0, jink: 0, name: kind === 'ace' ? pick(ACE_NAMES) + ' of ' + port.name : (kind === 'gunship' ? 'Corsair gunship' : 'Corsair raider') };
  FOES.push(f); return f;
}
function launchRaid(port, near) {
  raidN++; const n = Math.min(5, 2 + Math.floor(raidN / 2)), ace = raidN % 3 === 0;
  const a = Math.atan2(port.x - S.x, port.z - S.z) + rr(-0.5, 0.5), d = near ? 260 : rr(720, 900);
  const cx = S.x + Math.sin(a) * d, cz = S.z + Math.cos(a) * d; let lead = null;
  for (let i = 0; i < n; i++) { const kind = ace && i === 0 ? 'ace' : (i === n - 1 && n >= 3 ? 'gunship' : 'raider'); const f = spawnFoe(kind, cx + rr(-30, 30), cz + rr(-30, 30), port, lead); if (!lead) lead = f; }
  logLine('Raid · ' + port.name + ' crew inbound', true); sfx.alarm(); RAID.on = true; RAID.port = port; RAID.t = 0; RAID.n = n; RAID.ace = ace;
}
const RAID = { on: false, next: 75, port: null, t: 0 };
// neutrals
const NEUTRAL = [];
for (let i = 0; i < 2; i++) { const g = cruiser(); scene.add(g); NEUTRAL.push({ kind: 'cruiser', g, a: i * Math.PI, R: 760, sp: 0.03, x: 0, z: 0, yaw: 0, warned: false, name: 'Machine cruiser' }); }
const DOCKS = STRUCTS.filter(s => s.kind === 'dock');
for (let i = 0; i < (low ? 5 : 9); i++) { const a = pick(DOCKS); let b = pick(DOCKS); if (b === a) b = DOCKS[(DOCKS.indexOf(a) + 1) % DOCKS.length]; const g = hauler(a.w.tint, a.w.k); scene.add(g); const t = Math.random(); NEUTRAL.push({ kind: 'hauler', g, from: a, to: b, t, x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, yaw: Math.atan2(b.x - a.x, b.z - a.z), name: a.w.n + ' hauler', tr: new Trail(0x7fd8ff, 0.8, 16) }); }

// ================================================================ DUST (the speed you can feel) and far-object culling
const DUST_N = low ? 500 : 1100, DUST_R = 160; const dustPos = new Float32Array(DUST_N * 3); for (let i = 0; i < DUST_N; i++) dustPos.set([rr(-DUST_R, DUST_R), rr(-40, 30), rr(-DUST_R, DUST_R)], i * 3);
const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xcfe0ff, size: 0.55, transparent: true, opacity: 0.55, depthWrite: false })); dust.frustumCulled = false; scene.add(dust);
function tickDust() { const p = dustPos; for (let i = 0; i < DUST_N; i++) { let x = p[i * 3] - S.x, z = p[i * 3 + 2] - S.z; if (x > DUST_R) p[i * 3] -= DUST_R * 2; else if (x < -DUST_R) p[i * 3] += DUST_R * 2; if (z > DUST_R) p[i * 3 + 2] -= DUST_R * 2; else if (z < -DUST_R) p[i * 3 + 2] += DUST_R * 2; } dustGeo.attributes.position.needsUpdate = true; }
const HIDDEN = new Set();
let cullT = 0; function cull() { const cx = camera.position.x, cz = camera.position.z; for (const s of STRUCTS) s.g.visible = Math.hypot(s.x - cx, s.z - cz) < (s.kind === 'gate' || s.kind === 'dsf' ? 2600 : 1500); for (const P of PORTS3) P.g.visible = Math.hypot(P.x - cx, P.z - cz) < 3200; for (const n of NEUTRAL) n.g.visible = Math.hypot(n.x - cx, n.z - cz) < 1800; }


// ================================================================ BEASTS: the Belt Serpent and the moth nest (the 2D map's creatures, in 3D)
const BEASTS = [];   // anything with {x, z, hp, max, dead, name, kind, hitR, hit(dmg,x,z), yaw, v}
function makeSerpent(hx, hz) {
  const n = low ? 14 : 20, segs = [], skin = toon('#2f8a7a'), belly = toon('#e8d8a8'), fin = toon('#7a3f8a');
  const head = new THREE.Group(); scene.add(head);
  M(new THREE.SphereGeometry(5, 18, 12), skin, 0, 0, 0, head, 0.12, 5).scale.set(1, 0.8, 1.5);
  const jaw = new THREE.Group(); jaw.position.set(0, -1.5, 2); head.add(jaw); M(new THREE.SphereGeometry(3.6, 14, 10), belly, 0, 0, 2.5, jaw, 0.1, 3.6).scale.set(1, 0.45, 1.4);
  for (const sx of [-1, 1]) { M(new THREE.SphereGeometry(1.0, 10, 8), glowing('#ffd23a', 2.4), sx * 2.6, 1.6, 4.2, head, 0.06, 1); M(new THREE.ConeGeometry(0.9, 5, 6), fin, sx * 2.4, 3.4, -1.5, head, 0.06).rotation.set(-0.9, 0, sx * -0.4); }
  for (let i = 0; i < 6; i++) M(new THREE.ConeGeometry(0.35, 1.4, 5), toon('#f4f1ea'), -1.6 + i * 0.64, -0.9, 6.4, head, 0).rotation.x = Math.PI;
  for (let i = 0; i < n; i++) { const r = 4.4 * (1 - i / n * 0.7), g = new THREE.Group(); scene.add(g); M(new THREE.SphereGeometry(r, 14, 10), i % 2 ? skin : toon('#277a6a'), 0, 0, 0, g, 0.1, r); if (i % 3 === 0) M(new THREE.ConeGeometry(r * 0.35, r * 1.4, 5), fin, 0, r * 0.9, 0, g, 0.04).rotation.x = -0.6; segs.push({ g, r, x: hx, z: hz - (i + 1) * 6 }); }
  const B = { kind: 'serpent', name: 'The Belt Serpent', head, jaw, segs, x: hx, z: hz, home: [hx, hz], yaw: 0, v: 60, hp: 300, max: 300, state: 'prowl', st: 0, hitR: 6, dead: false, wan: rr(0, TAU), bite: 0 };
  B.hit = (dmg, x, z) => { if (B.dead) return; const head2 = dist(x, z, B.x, B.z) < 9; B.hp -= dmg * (head2 ? 1.6 : 1); flash(x, 0, z, head2 ? 0xffd23a : 0x9fffe0, head2 ? 7 : 5, 0.2); if (B.state === 'prowl') { B.state = 'hunt'; B.st = 0; logLine('The Belt Serpent turns on you', true); sfx.alarm(); } if (B.hp <= 0) killBeast(B); };
  BEASTS.push(B); return B;
}
function serpentAI(B, dt, T) {
  B.st += dt; const d = dist(B.x, B.z, S.x, S.z), toP = Math.atan2(S.x - B.x, S.z - B.z); let want = B.yaw, sp = 60;
  const ok = started && !S.dead;
  if (B.state === 'prowl') { B.wan += dt * 0.25; const tx = B.home[0] + Math.cos(B.wan) * 220, tz = B.home[1] + Math.sin(B.wan * 1.3) * 220; want = Math.atan2(tx - B.x, tz - B.z); sp = 55; if (ok && d < 300) { B.state = 'hunt'; B.st = 0; logLine('Something big in the rocks', true); sfx.alarm(); } }
  else if (B.state === 'hunt') { want = toP; sp = d < 160 ? 120 : 175; if (d < 95 && B.st > 1 && Math.abs(wrapA(toP - B.yaw)) < 0.3) { B.state = 'lunge'; B.st = 0; } if (!ok || d > 900) { B.state = 'prowl'; } }
  else if (B.state === 'lunge') { sp = 330; if (B.st > 0.7) { B.state = 'coil'; B.st = 0; B.coilDir = Math.random() < 0.5 ? 1 : -1; } }
  else if (B.state === 'coil') { want = B.yaw + B.coilDir * 2.2 * dt * 30; sp = 120; if (B.st > 2.2) { B.state = 'hunt'; B.st = 0; } }
  const turnK = B.state === 'lunge' ? 0.9 : B.state === 'coil' ? 2.6 : 2.3; B.yaw += clamp(wrapA(want - B.yaw), -turnK * dt, turnK * dt); B.v = damp(B.v, sp, 2.2, dt);
  const ox = B.x, oz = B.z; B.x += Math.sin(B.yaw) * B.v * dt; B.z += Math.cos(B.yaw) * B.v * dt;
  for (const w of BODIES) { const dd = dist(B.x, B.z, w.x, w.z); if (dd < w.r + 40) { B.x = w.x + (B.x - w.x) / dd * (w.r + 40); B.z = w.z + (B.z - w.z) / dd * (w.r + 40); } }
  const y = Math.sin(T * 1.3) * 4; B.head.position.set(B.x, y, B.z); B.head.rotation.set(Math.sin(T * 2) * 0.1, B.yaw, Math.sin(T * 1.7) * 0.15);
  B.jaw.rotation.x = B.state === 'lunge' ? 0.7 : B.state === 'hunt' ? 0.25 + Math.sin(T * 6) * 0.1 : 0.08;
  let px = B.x, pz = B.z; B.segs.forEach((g, i) => { const gap = 5.2 * (1 - i / B.segs.length * 0.5); const dx = g.x - px, dz = g.z - pz, L = Math.hypot(dx, dz) || 1; g.x = px + dx / L * gap; g.z = pz + dz / L * gap; const sw = Math.sin(T * 3 - i * 0.6) * 0.6; g.g.position.set(g.x + Math.cos(B.yaw) * sw, Math.sin(T * 1.3 - i * 0.35) * 4, g.z - Math.sin(B.yaw) * sw); g.g.rotation.y = Math.atan2(px - g.x, pz - g.z); px = g.x; pz = g.z; });
  // the bite and the body
  if (ok) { B.bite -= dt; if (B.bite <= 0 && segHit(ox, oz, B.x, B.z, S.x, S.z, 12)) { B.bite = 1.1; hurtPlayer(B.state === 'lunge' ? 22 : 12, B.x, B.z); shake(0.8); S.vx += Math.sin(B.yaw) * 120; S.vz += Math.cos(B.yaw) * 120; }
    for (const g of B.segs) { const dd = dist(g.x, g.z, S.x, S.z); if (dd < g.r + 4) { const nx = (S.x - g.x) / dd, nz = (S.z - g.z) / dd; S.x = g.x + nx * (g.r + 4); S.z = g.z + nz * (g.r + 4); if (B.bite <= 0.6) { hurtPlayer(5, g.x, g.z); B.bite = 1.1; } } } }
}
function makeNest(hx, hz) {
  const g = new THREE.Group(); g.position.set(hx, 0, hz); scene.add(g);
  const rock = M(new THREE.DodecahedronGeometry(16, 1), toon('#4a3a52'), 0, -4, 0, g, 0.3, 16); rock.scale.set(1.2, 0.8, 1);
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; const c = M(new THREE.OctahedronGeometry(rr(2, 4), 0), glowing('#c88aff', 1.6), Math.cos(a) * 12, rr(2, 8), Math.sin(a) * 10, g, 0.06); c.scale.y = 2.4; c.rotation.z = rr(-0.4, 0.4); }
  const pods = []; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.3; pods.push(M(new THREE.SphereGeometry(2.2, 12, 8), glowing('#ffb0ff', 0.8), Math.cos(a) * 7, 6 + (i % 2) * 2, Math.sin(a) * 6, g, 0.06, 2.2)); }
  glow(0, 6, 0, 0xc88aff, 60, g, 0.4);
  const N = { kind: 'nest', name: 'Moth nest', g, x: hx, z: hz, hp: 120, max: 120, hitR: 18, dead: false, pods, moths: [], spawnT: 0, yaw: 0, v: 0 };
  N.hit = (dmg, x, z) => { if (N.dead) return; N.hp -= dmg; flash(x, 2, z, 0xe0a0ff, 7, 0.2); N.pods.forEach(p => p.scale.setScalar(1 + Math.random() * 0.2)); if (N.hp <= 0) { N.dead = true; for (let i = 0; i < 5; i++) setTimeout(() => explode(hx + rr(-12, 12), hz + rr(-12, 12), 1.1, '#4a3a52'), i * 180); loot(hx, hz, 'ore', 8); loot(hx, hz, 'cr', 8); logLine('Moth nest burned out · loot', false); N.g.traverse(o => { if (o.isMesh && o.material !== outlineMat) o.material = toon('#2a2230'); }); } };
  BEASTS.push(N); for (let i = 0; i < (low ? 7 : 10); i++) makeMoth(N); return N;
}
const wingGeo = (() => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(1.2, 1.6, 3.4, 1.4, 3.2, -0.4); sh.bezierCurveTo(2.2, -1.6, 0.8, -1.0, 0, 0); return new THREE.ShapeGeometry(sh); })();
function makeMoth(N) {
  const g = new THREE.Group(); scene.add(g); M(new THREE.CapsuleGeometry(0.45, 1.6, 4, 8), toon('#3a2a4a'), 0, 0, 0, g, 0.04).rotation.x = Math.PI / 2;
  const wm = new THREE.MeshBasicMaterial({ color: 0xd8a8ff, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
  const wings = [-1, 1].map(s => { const w = new THREE.Mesh(wingGeo, wm); w.rotation.x = -Math.PI / 2; w.scale.x = s; g.add(w); return w; });
  glow(0, 0, 0, 0xe0b0ff, 5, g, 0.6);
  const a = rr(0, TAU); const m = { kind: 'moth', name: 'Void moth', g, wings, nest: N, x: N.x + Math.cos(a) * 30, z: N.z + Math.sin(a) * 30, yaw: rr(0, TAU), v: 40, hp: 6, max: 6, hitR: 3.4, dead: false, ph: rr(0, TAU), state: 'flutter', st: 0, dart: rr(2, 4) };
  m.hit = (dmg, x, z) => { if (m.dead) return; m.hp -= dmg; if (m.hp <= 0) { m.dead = true; flash(m.x, 0, m.z, 0xe0b0ff, 10, 0.4, 3); debris(m.x, m.z, '#3a2a4a', 4, 20); loot(m.x, m.z, 'cr', 1); scene.remove(g); sfx.boom(0.3); } };
  N.moths.push(m); BEASTS.push(m); return m;
}
function mothAI(m, dt, T) {
  m.st += dt; const N = m.nest, d = dist(m.x, m.z, S.x, S.z), ok = started && !S.dead; let tx, tz, sp = 50;
  if (m.state === 'flutter') { const a = T * 0.6 + m.ph; tx = N.x + Math.cos(a) * (26 + Math.sin(T + m.ph) * 8); tz = N.z + Math.sin(a * 1.3) * 26; if (ok && dist(N.x, N.z, S.x, S.z) < 280) { m.state = 'swarm'; m.st = 0; } }
  else { const a = T * 2.2 + m.ph; tx = S.x + Math.cos(a) * 16; tz = S.z + Math.sin(a) * 16; sp = Math.hypot(S.vx, S.vz) + 90; m.dart -= dt; if (m.dart <= 0) { tx = S.x; tz = S.z; sp = 220; if (d < 4.5) { hurtPlayer(3, m.x, m.z); m.dart = rr(2.5, 4.5); } } if (!ok || dist(N.x, N.z, S.x, S.z) > 650) m.state = 'flutter'; }
  const want = Math.atan2(tx - m.x, tz - m.z); m.yaw += clamp(wrapA(want - m.yaw), -5 * dt, 5 * dt); m.v = damp(m.v, sp, 3, dt); m.x += Math.sin(m.yaw) * m.v * dt; m.z += Math.cos(m.yaw) * m.v * dt;
  m.g.position.set(m.x, Math.sin(T * 5 + m.ph) * 2, m.z); m.g.rotation.set(0, m.yaw, 0); const f = Math.sin(T * 26 + m.ph) * 0.9; m.wings[0].rotation.y = f; m.wings[1].rotation.y = -f;
}
function killBeast(B) { B.dead = true; logLine('The Belt Serpent is dead · loot', false); toast('The Belt Serpent is dead.'); for (let i = 0; i <= B.segs.length; i++) setTimeout(() => { const g = i === 0 ? B.head : B.segs[i - 1].g; const p = g.position; explode(p.x, p.z, i === 0 ? 1.8 : 0.8, '#2f8a7a'); scene.remove(g); }, i * 90); loot(B.x, B.z, 'ore', 14); loot(B.x, B.z, 'cr', 12); save.addGold(80); setTimeout(() => { if (BEASTS.includes(B)) BEASTS.splice(BEASTS.indexOf(B), 1); makeSerpent(B.home[0], B.home[1]); }, 300000); }
makeSerpent(720, 720); makeNest(-720, -700);
function beastBodies(B) { return B.kind === 'serpent' ? [{ x: B.x, z: B.z, r: B.hitR }, ...B.segs.map(g => ({ x: g.x, z: g.z, r: g.r + 0.5 }))] : [{ x: B.x, z: B.z, r: B.hitR }]; }

// ================================================================ INPUT
const keys = new Set(), joy = { x: 0, y: 0, on: false, id: null, ox: 0, oy: 0 };
let started = false, panelOpen = false, chartOpen = false;
addEventListener('keydown', e => { if (e.repeat) return; keys.add(e.code);
  if (!started) return;
  if (e.code === 'Escape') { closePanel(); closeChart(); }
  if (panelOpen || chartOpen) { if (e.code === 'KeyM') closeChart(); return; }
  if (e.code === 'KeyQ' || e.code === 'Digit2') fireMissile();
  if (e.code === 'Tab') { e.preventDefault(); cycleTarget(); }
  if (e.code === 'KeyE' || e.code === 'Enter') act();
  if (e.code === 'KeyM') openChart(); });
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('keydown', e => { if (e.code === 'Tab') e.preventDefault(); });
const J = $('joy'), K = $('knob'), KB = $('knobBase');
J.addEventListener('pointerdown', e => { joy.on = true; joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; for (const el of [K, KB]) { el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px'; show(el, true); } J.setPointerCapture(e.pointerId); });
J.addEventListener('pointermove', e => { if (!joy.on || e.pointerId !== joy.id) return; let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const l = Math.hypot(dx, dy); if (l > 64) { dx *= 64 / l; dy *= 64 / l; } joy.x = dx / 64; joy.y = -dy / 64; K.style.left = joy.ox + dx + 'px'; K.style.top = joy.oy + dy + 'px'; });
const joyEnd = () => { joy.on = false; joy.x = joy.y = 0; show(K, false); show(KB, false); }; J.addEventListener('pointerup', joyEnd); J.addEventListener('pointercancel', joyEnd);
const hold = { fire: false, boost: false };
for (const [id, k] of [['b1', 'fire'], ['b3', 'boost']]) { const b = $(id); b.addEventListener('pointerdown', e => { e.preventDefault(); hold[k] = true; b.classList.add('on'); }); const up2 = () => { hold[k] = false; b.classList.remove('on'); }; b.addEventListener('pointerup', up2); b.addEventListener('pointerleave', up2); b.addEventListener('pointercancel', up2); }
$('b2').addEventListener('pointerdown', e => { e.preventDefault(); fireMissile(); });
$('bAct').addEventListener('pointerdown', e => { e.preventDefault(); act(); }); $('pbtn').addEventListener('click', act);
$('menuBtn').onclick = () => { const m = $('menu'); show(m, m.style.display !== 'flex', 'flex'); };
$('mapBtn').onclick = () => chartOpen ? closeChart() : openChart(); $('mChart').onclick = () => { show($('menu'), false); openChart(); };
$('mGalaxy').onclick = () => location.href = 'index.html'; $('m2d').onclick = () => location.href = '../Space_world__asteroids_touch_350.html';
$('mSound').onclick = () => { muted = !muted; audio.setMuted(muted); $('mSound').textContent = muted ? 'Sound on' : 'Sound off'; };
$('ibtn').onclick = () => { started = true; audio.init(); show($('intro'), false); document.body.classList.remove('intro'); logLine('Launched · ' + nearestBody().n); };
$('pclose').onclick = closePanel; $('chartClose').onclick = closeChart;

// ================================================================ ACTIONS
function fireLasers() {
  if (S.cd > 0 || S.dead) return; S.cd = 0.13; const fx = Math.sin(S.yaw), fz = Math.cos(S.yaw), rx = Math.cos(S.yaw), rz = -Math.sin(S.yaw);
  let ax = fx, az = fz; const t = S.tgt; if (t && !t.dead) { const lp = leadPoint(S.x, S.z, t, 560); const dx = lp.x - S.x, dz = lp.z - S.z, L = Math.hypot(dx, dz); const ang = wrapA(Math.atan2(dx, dz) - S.yaw); if (Math.abs(ang) < 0.18 && L < 700) { ax = dx / L; az = dz / L; } }
  for (const s of [-1, 1]) { const x = S.x + fx * 6 + rx * s * 3.4, z = S.z + fz * 6 + rz * s * 3.4; bolt('p', x, 0, z, ax, az, 560 + forwardSpeed(), 4 * dmgK(), 1.15); }
  flash(S.x + fx * 7, 0, S.z + fz * 7, 0x9ff0ff, 4, 0.08, 1); sfx.laser();
}
function fireMissile() { if (!started || S.dead || S.mis <= 0) return; S.mis--; const t = S.tgt && !S.tgt.dead ? S.tgt : bestTarget(1.0); missile(S.x + Math.sin(S.yaw) * 6, S.z + Math.cos(S.yaw) * 6, S.yaw, t); }
function leadPoint(x, z, t, sp) { const d = dist(x, z, t.x, t.z), tt = d / sp, vx = t.v ? Math.sin(t.yaw) * t.v : 0, vz = t.v ? Math.cos(t.yaw) * t.v : 0; return { x: t.x + vx * tt, z: t.z + vz * tt }; }
function forwardSpeed() { return S.vx * Math.sin(S.yaw) + S.vz * Math.cos(S.yaw); }
function hostiles() { const L = FOES.filter(f => !f.dead); for (const B of BEASTS) if (!B.dead && dist(B.x, B.z, S.x, S.z) < 1100) L.push(B); for (const P of PORTS3) if (!P.razed) { for (const t of P.turrets) if (!t.dead && dist(P.x, P.z, S.x, S.z) < 1200) L.push(t); if (dist(P.x, P.z, S.x, S.z) < 1200) L.push(P); } return L; }
function bestTarget(cone = 0.6) { let best = null, bs = 1e9; for (const f of hostiles()) { const fx = f.x ?? f.wx, fz = f.z ?? f.wz; const d = dist(S.x, S.z, fx, fz); if (d > 1100) continue; const a = Math.abs(wrapA(Math.atan2(fx - S.x, fz - S.z) - S.yaw)); if (a > cone) continue; const s = d * (1 + a * 2); if (s < bs) { bs = s; best = f; } } return best; }
function cycleTarget() { const L = hostiles().filter(f => dist(S.x, S.z, f.x, f.z) < 1100).sort((a, b) => dist(S.x, S.z, a.x, a.z) - dist(S.x, S.z, b.x, b.z)); if (!L.length) { S.tgt = null; return; } const i = L.indexOf(S.tgt); S.tgt = L[(i + 1) % L.length]; sfx.lock(); }
let near = null;
function act() { if (!started || !near || S.dead) return; const s = near;
  if (s.kind === 'dock' || s.kind === 'dsf' || s.kind === 'earth') return land(s);
  if (s.kind === 'mine') return openTrade(s); if (s.kind === 'yard') return openYard(s); if (s.kind === 'fuel') return openRefit(s); if (s.kind === 'gate') return openGate(s); }
function land(s) { const w = s.w; const href = s.kind === 'dsf' ? 'world.html?w=station&from=orbit' : s.kind === 'earth' ? 'world.html?w=earth&from=orbit' : (w.href || ('world.html?w=' + w.k + '&from=orbit'));
  toast((s.kind === 'dsf' ? 'Docking at ' : 'Landing on ') + (s.kind === 'dsf' ? 'Deep Space Fox' : s.kind === 'earth' ? 'Earth' : w.n) + '…'); started = false; $('warp').style.background = 'radial-gradient(circle,#f3f2f2 0%,#f3f2f2 100%)'; $('warp').style.opacity = 1; setTimeout(() => { location.href = href; }, 600); }

// ---------------------------------------------------------------- panels
function openPanel(kicker, title, rows) { panelOpen = true; $('phk').textContent = kicker; $('pht').textContent = title; const box = $('prows'); box.innerHTML = '';
  for (const r of rows) { const b = document.createElement('button'); b.innerHTML = '<span>' + r.t + (r.d ? '<small>' + r.d + '</small>' : '') + '</span><em>' + (r.e || '') + '</em>'; if (r.off) b.disabled = true; b.onclick = () => { r.fn && r.fn(); }; box.appendChild(b); }
  show($('panel'), true); }
function closePanel() { panelOpen = false; show($('panel'), false); }
function openTrade(s) { const ore = oreOf(), price = 12 + (s.w.k === 'meru' ? 2 : 0);
  openPanel('MINING PLATFORM', s.w.n, [{ t: 'Sell all ore', d: ore + ' ore in the hold · ' + price + ' cr each', e: '+' + ore * price + ' CR', off: !ore, fn: () => { save.addGold(ore * price); save.setStat('space.ore', 0); sfx.pickup(); logLine('Sold ' + ore + ' ore · +' + ore * price + ' cr'); openTrade(s); } }, { t: 'Ask about the belts', d: 'Gold-flecked rocks carry ore. Shoot them open and fly through what falls out.' }, { t: 'Leave', fn: closePanel }]); }
function openYard(s) { const rows = Object.entries(UPG).map(([k, U]) => { const lv = up(k), c = U.c[lv]; return { t: U.n + ' · ' + ['I', 'II', 'III'][Math.min(lv, 2)] + (lv >= 3 ? ' (max)' : ''), d: U.d, e: lv >= 3 ? 'DONE' : c + ' CR', off: lv >= 3 || save.data.gold < c, fn: () => { if (!save.spend(c)) return; save.setStat('space.up.' + k, lv + 1); S.hp = maxHp(); S.sh = maxSh(); S.mis = maxMis(); sfx.pickup(); logLine(U.n + ' fitted'); openYard(s); } }; });
  rows.push({ t: 'Leave', fn: closePanel }); openPanel('SHIPYARD', s.w.n, rows); }
function openRefit(s) { const dmg = Math.round(maxHp() - S.hp), mis = maxMis() - S.mis, cost = Math.ceil(dmg * 0.8) + mis * 10;
  openPanel('FUEL DEPOT', s.w.n, [{ t: 'Full refit', d: (dmg ? dmg + ' hull to patch · ' : 'Hull sound · ') + (mis ? mis + ' missiles to load' : 'racks full'), e: cost ? cost + ' CR' : 'FREE', off: (!dmg && !mis) || save.data.gold < cost, fn: () => { if (cost && !save.spend(cost)) return; S.hp = maxHp(); S.sh = maxSh(); S.mis = maxMis(); sfx.pickup(); logLine('Refit done'); openRefit(s); } }, { t: 'Leave', fn: closePanel }]); }
function openGate(s) { const rows = [...WORLDS, EARTH].filter(w => w !== s.w).map(w => ({ t: w.n, d: w.tag, e: 'JUMP', fn: () => { closePanel(); jumpTo(w); } })); openPanel('STAR GATE · ' + s.w.n.toUpperCase(), 'Where to?', rows); }
function jumpTo(w) { const g = STRUCTS.find(s => s.kind === 'gate' && s.w === w); if (!g) return; sfx.warp(); const wp = $('warp'); wp.style.background = ''; wp.style.opacity = 1; S.warpT = 0.9; started = false;
  setTimeout(() => { const dx = w.x - g.x, dz = w.z - g.z, L = Math.hypot(dx, dz); S.x = g.x + dx / L * 70; S.z = g.z + dz / L * 70; S.yaw = Math.atan2(dx, dz); S.vx = Math.sin(S.yaw) * 60; S.vz = Math.cos(S.yaw) * 60; trails.forEach(t => t.clear()); camPos.set(S.x - Math.sin(S.yaw) * 40, 20, S.z - Math.cos(S.yaw) * 40); camLook.set(S.x + Math.sin(S.yaw) * 30, 0, S.z + Math.cos(S.yaw) * 30); camYaw = S.yaw; started = true; wp.style.opacity = 0; logLine('Through the gate · ' + w.n); S.grace = Math.max(S.grace, 12); }, 650); }

// ---------------------------------------------------------------- chart
const CH = $('chartc'), cx = CH.getContext('2d'); let chartPick = [];
function openChart() { chartOpen = true; show($('chart'), true); drawChart(); }
function closeChart() { chartOpen = false; show($('chart'), false); }
CH.addEventListener('pointerdown', e => { const r = CH.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let best = null, bd = 44; for (const p of chartPick) { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } } if (best) { S.wp = best.o; logLine('Course set · ' + best.n); closeChart(); } });
function drawChart() { const W = CH.width = innerWidth * Math.min(2, devicePixelRatio), H = CH.height = innerHeight * Math.min(2, devicePixelRatio), k = Math.min(2, devicePixelRatio); cx.setTransform(k, 0, 0, k, 0, 0); const w = innerWidth, h = innerHeight;
  const span = 10400, sc = Math.min(w, h) / span * 0.95, ox = w / 2 + 120 * sc, oz = h / 2 + 200 * sc, P = (x, z) => [ox + x * sc, oz + z * sc]; chartPick = [];
  cx.clearRect(0, 0, w, h); cx.strokeStyle = 'rgba(243,242,242,.08)'; cx.lineWidth = 1; for (let i = -4; i <= 4; i++) { const [a] = P(i * 1400, 0), [, b] = P(0, i * 1400); cx.beginPath(); cx.moveTo(a, 0); cx.lineTo(a, h); cx.stroke(); cx.beginPath(); cx.moveTo(0, b); cx.lineTo(w, b); cx.stroke(); }
  cx.strokeStyle = 'rgba(127,216,255,.25)'; cx.setLineDash([4, 6]); cx.beginPath(); for (const s of STRUCTS.filter(s => s.kind === 'gate')) { const [a, b] = P(s.x, s.z); cx.moveTo(a, b); const [c, d] = P(0, 0); cx.lineTo(c, d); } cx.stroke(); cx.setLineDash([]);
  for (const p of PORTS3) { const [a, b] = P(p.x, p.z); cx.strokeStyle = p.razed ? '#5a5560' : '#ec3013'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(a - 7, b - 7); cx.lineTo(a + 7, b + 7); cx.moveTo(a + 7, b - 7); cx.lineTo(a - 7, b + 7); cx.stroke(); cx.fillStyle = p.razed ? '#8a8490' : '#ff8a7a'; cx.font = '800 11px Archivo, sans-serif'; cx.fillText(p.name + (p.razed ? ' · RAZED' : ''), a + 10, b + 4); chartPick.push({ x: a, y: b, o: p, n: 'Port ' + p.name }); }
  for (const w of [...WORLDS, EARTH]) { const [a, b] = P(w.x, w.z), r = Math.max(7, w.r * sc * 1.6); cx.fillStyle = w.tint; cx.beginPath(); cx.arc(a, b, r, 0, TAU); cx.fill(); cx.strokeStyle = '#201e1d'; cx.lineWidth = 2; cx.stroke(); cx.fillStyle = '#f3f2f2'; cx.font = '800 13px Archivo, sans-serif'; cx.fillText(w.n.toUpperCase(), a + r + 5, b + 4); chartPick.push({ x: a, y: b, o: w, n: w.n }); }
  { const [a, b] = P(DSF.x, DSF.z); cx.strokeStyle = '#5fe1ff'; cx.lineWidth = 2; cx.beginPath(); cx.arc(a, b, 6, 0, TAU); cx.stroke(); cx.fillStyle = '#5fe1ff'; cx.font = '800 10px Archivo, sans-serif'; cx.fillText('DSF', a + 8, b + 3); chartPick.push({ x: a, y: b, o: STRUCTS.find(s => s.kind === 'dsf'), n: 'Deep Space Fox' }); }
  for (const f of FOES) { if (f.dead) continue; const [a, b] = P(f.x, f.z); cx.fillStyle = '#ec3013'; cx.fillRect(a - 2, b - 2, 4, 4); }
  if (S.wp) { const [a, b] = P(S.wp.x, S.wp.z), [c, d] = P(S.x, S.z); cx.strokeStyle = '#f3f2f2'; cx.setLineDash([6, 6]); cx.lineWidth = 2; cx.beginPath(); cx.moveTo(c, d); cx.lineTo(a, b); cx.stroke(); cx.setLineDash([]); }
  { const [a, b] = P(S.x, S.z); cx.save(); cx.translate(a, b); cx.rotate(-S.yaw + Math.PI); cx.fillStyle = '#ec3013'; cx.strokeStyle = '#f3f2f2'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, -11); cx.lineTo(-7, 8); cx.lineTo(7, 8); cx.closePath(); cx.fill(); cx.stroke(); cx.restore(); }
  cx.fillStyle = 'rgba(243,242,242,.7)'; cx.font = '700 12px Archivo, sans-serif'; cx.fillText('Tap a world or a port to set a course.', 16, h - 18 - (touch ? 10 : 0)); }

// ================================================================ HUD helpers
let toastT = 0; function toast(t) { $('toast').textContent = t; show($('toast'), true); toastT = 2.6; }
function logLine(t, red) { const d = document.createElement('div'); d.textContent = t; if (red) d.style.borderLeftColor = '#ec3013'; else d.style.borderLeftColor = '#2f7fd8'; const L = $('log'); L.prepend(d); while (L.children.length > 4) L.lastChild.remove(); setTimeout(() => d.remove(), 6000); }
let shakeK = 0; function shake(k) { shakeK = Math.max(shakeK, k); }
let hurtA = 0, shieldA = 0;
function hurtPlayer(dmg, fx, fz) { if (S.dead || S.inv > 0) return; S.shT = 3.2; if (S.sh > 0) { S.sh = Math.max(0, S.sh - dmg * 1.3); shieldA = 0.6; shieldBubble.material.opacity = 0.55; sfx.shield(); } else { S.hp = Math.max(0, S.hp - dmg); hurtA = 0.9; sfx.hit(); shake(0.5); } if (S.hp <= 0) die(); }
function die() { S.dead = 3.2; explode(S.x, S.z, 2.2, '#cfd5df'); ship.visible = false; logLine('Hull breached', true); toast('Towed back to Meru'); }
function respawn() { const d = STRUCTS.find(s => s.kind === 'dock' && s.w.k === 'meru'); S.x = d.x + 60; S.z = d.z; S.vx = S.vz = 0; S.yaw = Math.PI / 2; S.hp = maxHp(); S.sh = maxSh(); S.mis = maxMis(); S.dead = 0; ship.visible = true; S.grace = 20; S.inv = 3; trails.forEach(t => t.clear()); for (const f of FOES) if (!f.dead) { f.state = 'flee'; } const lost = Math.floor(save.data.gold * 0.1); if (lost) { save.spend(lost); logLine('Salvage fee · -' + lost + ' cr', true); } }
function nearestBody() { let best = null, bd = 1e9; for (const w of BODIES) { const d = dist(S.x, S.z, w.x, w.z) - w.r; if (d < bd) { bd = d; best = w; } } best.d = bd; return best; }

// ================================================================ THE LOOP
const clock = new THREE.Clock(), camPos = new THREE.Vector3(S.x - 40, 30, S.z), camLook = new THREE.Vector3(S.x, 0, S.z), V = new THREE.Vector3(), V2 = new THREE.Vector3();
const radar = $('radar').getContext('2d');
let fov = 60;
function frame() { requestAnimationFrame(frame); try { step(); } catch (e) { if (!frame.err) { frame.err = 1; console.error('space frame failed: ' + e.message + ' @ ' + String(e.stack).split('\n').slice(0, 3).join(' | ')); } } }
function step(dtO) {
  const dt = dtO || Math.min(clock.getDelta(), 0.05); S.t += dt; const T = S.t;
  const live = started && !panelOpen && !chartOpen && !S.dead;
  // ---- flight
  let thr = 0, turn = 0, boosting = false;
  if (live) {
    turn = (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) - (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0);
    thr = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 0.8 : 0);
    if (joy.on) { const l = Math.hypot(joy.x, joy.y); if (l > 0.18) { const want = Math.atan2(-joy.x, joy.y) + camYaw; const d = wrapA(want - S.yaw); turn = clamp(d * 2.6, -1, 1); thr = Math.min(1, l) * (Math.abs(d) > 2.4 ? 0.3 : 1); } }
    boosting = (keys.has('ShiftLeft') || keys.has('ShiftRight') || hold.boost) && S.boostE > 2 && thr >= 0;
    if (boosting) { thr = 1; S.boostE = Math.max(0, S.boostE - dt * 28); } else S.boostE = Math.min(100, S.boostE + dt * (thr > 0 ? 14 : 22));
    if ((keys.has('Space') || keys.has('Digit1') || hold.fire)) fireLasers();
  }
  S.cd -= dt; if (S.mis < maxMis()) { S.misT += dt; if (S.misT > 7) { S.misT = 0; S.mis++; } } else S.misT = 0;
  const turnRate = 2.3 - Math.min(0.8, Math.hypot(S.vx, S.vz) / 400);
  S.yaw += turn * dt * turnRate; S.bank = damp(S.bank, -turn * 0.6, 5, dt);
  { const acc = (boosting ? 330 : 150) * spdK(), maxV = (boosting ? 280 : 130) * spdK(); const fx = Math.sin(S.yaw), fz = Math.cos(S.yaw);
    if (thr > 0) { S.vx += fx * acc * thr * dt; S.vz += fz * acc * thr * dt; } else if (thr < 0) { S.vx = damp(S.vx, 0, 1.8, dt); S.vz = damp(S.vz, 0, 1.8, dt); }
    // grip: the sideways part of the drift bleeds off, the forward part coasts
    const fwd = S.vx * fx + S.vz * fz, sx = S.vx - fx * fwd, sz = S.vz - fz * fwd, gk = Math.exp(-dt * 2.6); S.vx = fx * fwd + sx * gk; S.vz = fz * fwd + sz * gk;
    const sp = Math.hypot(S.vx, S.vz); if (sp > maxV) { const k = damp(sp, maxV, boosting ? 2 : 1.2, dt) / sp; S.vx *= k; S.vz *= k; } if (thr === 0) { S.vx *= Math.exp(-dt * 0.25); S.vz *= Math.exp(-dt * 0.25); } }
  if (!S.dead && started) { S.x += S.vx * dt; S.z += S.vz * dt; }
  // planets, stations and rocks push you off
  for (const w of BODIES) { const d = dist(S.x, S.z, w.x, w.z), min = w.r + 16; if (d < min) { const nx = (S.x - w.x) / d, nz = (S.z - w.z) / d; S.x = w.x + nx * min; S.z = w.z + nz * min; const vn = S.vx * nx + S.vz * nz; if (vn < 0) { S.vx -= nx * vn * 1.6; S.vz -= nz * vn * 1.6; } } }
  for (const s of STRUCTS) { const d = dist(S.x, S.z, s.x, s.z), min = s.r * 0.75; if (d < min) { const nx = (S.x - s.x) / d, nz = (S.z - s.z) / d; S.x = s.x + nx * min; S.z = s.z + nz * min; const vn = S.vx * nx + S.vz * nz; if (vn < 0) { S.vx -= nx * vn * 1.4; S.vz -= nz * vn * 1.4; } } }
  if (!S.dead && started) for (const r of rocksNear(S.x, S.z)) { if (Math.abs(r.y) > r.s + 3) continue; const d = dist(S.x, S.z, r.x, r.z), min = r.s + 3.5; if (d < min) { const nx = (S.x - r.x) / d, nz = (S.z - r.z) / d; S.x = r.x + nx * min; S.z = r.z + nz * min; const vn = S.vx * nx + S.vz * nz; if (vn < -30) { hurtPlayer(Math.min(25, -vn * 0.12)); flash(S.x - nx * 4, 0, S.z - nz * 4, 0xffcf8a, 6, 0.3); } if (vn < 0) { S.vx -= nx * vn * 1.5; S.vz -= nz * vn * 1.5; } } }
  if (S.dead) { S.dead -= dt; if (S.dead <= 0) respawn(); }
  if (S.grace > 0) S.grace -= dt; if (S.inv > 0) S.inv -= dt;
  // the ship
  const spd = Math.hypot(S.vx, S.vz);
  ship.position.set(S.x, Math.sin(T * 1.6) * 0.35, S.z); ship.rotation.set(0, S.yaw, 0); ship.rotateZ(S.bank); ship.rotateX(-clamp(thr, -1, 1) * 0.05);
  ship.userData.flames.forEach(f => f.scale.setScalar((boosting ? 6 : 2.4) + spd / 60 + Math.sin(T * 40) * 0.4)); (ship.userData.nav || []).forEach(n => n.s.material.opacity = Math.sin(T * 3 + n.ph * 1.5) > 0.3 ? 1 : 0.15); if (ship.userData.ring) ship.userData.ring.material.emissiveIntensity = 1.6 + Math.sin(T * 2.4) * 0.6 + (boosting ? 1 : 0);
  shieldBubble.material.opacity = Math.max(0, shieldBubble.material.opacity - dt * 1.6);
  { ship.updateMatrixWorld(); const side = V2.set(Math.cos(S.yaw), 0, -Math.sin(S.yaw)); ship.userData.engines.forEach((e, i) => { V.copy(e).applyMatrix4(ship.matrixWorld); trails[i].w = boosting ? 1.4 : 0.8; trails[i].push(V, side, started ? clamp(spd / 120, 0.15, 1.2) : 0); }); }
  // shields recharge
  S.shT -= dt; if (S.shT <= 0) S.sh = Math.min(maxSh(), S.sh + dt * (14 + up('shield') * 5));
  // ---- the world turns
  for (const s of SPIN) s.o.rotation.y += dt * s.v;
  for (const m of MOONS) { m.a += dt * m.v; m.m.position.set(m.w.x + Math.cos(m.a) * m.R, Math.sin(m.a) * m.R * m.tilt, m.w.z + Math.sin(m.a) * m.R); m.m.rotation.y += dt * 0.2; }
  for (const a of ANIM) a.fn(T, dt);
  for (const g of GATE_MATS) g.uniforms.uT.value = T;
  // ---- rocks drift a little (only the near ones are rewritten)
  { const touched = new Set(); for (const r of rocksNear(S.x, S.z)) { r.rot.y += r.spin * dt; if (HIDDEN.has(r)) continue; writeRock(r); touched.add(r.im); touched.add(r.ol); if (r.gl) touched.add(r.gl); } touched.forEach(m => m.instanceMatrix.needsUpdate = true); }
  // ---- director: the quiet minute, then a raid every 50-90s from the nearest standing port
  if (started && !S.dead) { RAID.next -= dt; const alive = FOES.filter(f => !f.dead && f.state !== 'flee');
    if (RAID.on && !alive.length) { RAID.on = false; RAID.next = rr(50, 90); logLine('Raid broken'); }
    if (!RAID.on && RAID.next <= 0 && S.grace <= 0) { const P = PORTS3.filter(p => !p.razed).sort((a, b) => dist(a.x, a.z, S.x, S.z) - dist(b.x, b.z, S.x, S.z))[0]; if (P && dist(S.x, S.z, 0, 0) < 6000 && !(near && near.kind === 'dock')) launchRaid(P); else RAID.next = 20; }
    // come close to a standing port and its guard sorties
    for (const P of PORTS3) { if (P.razed) continue; const d = dist(P.x, P.z, S.x, S.z); if (d < 700 && (P.guardT || 0) <= T) { P.guardT = T + 70; for (let i = 0; i < 2; i++) spawnFoe('raider', P.x + rr(-40, 40), P.z + rr(-40, 40), P, null); logLine(P.name + ' guard sortie', true); sfx.alarm(); } } }
  // ---- foes
  for (const f of FOES) { if (f.dead) continue; foeAI(f, dt, T); }
  for (const B of BEASTS) { if (B.dead) continue; if (B.kind === 'serpent') serpentAI(B, dt, T); else if (B.kind === 'moth') mothAI(B, dt, T); }
  for (let i = BEASTS.length - 1; i >= 0; i--) if (BEASTS[i].dead && BEASTS[i].kind === 'moth') BEASTS.splice(i, 1);
  for (const N of BEASTS) if (N.kind === 'nest' && !N.dead && (N.spawnT -= dt) <= 0 && N.moths.filter(m => !m.dead).length < 4) { N.spawnT = 12; makeMoth(N); }
  for (let i = FOES.length - 1; i >= 0; i--) { const f = FOES[i]; if (f.dead && f.deadT < T - 0.1) { scene.remove(f.g); f.trail.dispose(); FOES.splice(i, 1); if (S.tgt === f) S.tgt = null; } }
  // port turrets
  for (const P of PORTS3) { if (P.razed) continue; const dP = dist(P.x, P.z, S.x, S.z); for (const t of P.turrets) { if (t.dead) continue; t.t.getWorldPosition(V); t.x = V.x; t.z = V.z; t.yaw = 0; t.v = 0; t.name = P.name + ' turret'; t.max = 30; if (dP < 600 && started && !S.dead) { const a = Math.atan2(S.x - V.x, S.z - V.z); t.head.rotation.y = a - P.g.rotation.y; t.cd -= dt; if (t.cd <= 0) { t.cd = rr(0.9, 1.6); const lp = leadPoint(V.x, V.z, { x: S.x, z: S.z, yaw: Math.atan2(S.vx, S.vz), v: spd }, 300); const dx = lp.x - V.x, dz = lp.z - V.z, L = Math.hypot(dx, dz); bolt('t', V.x, 0, V.z, dx / L, dz / L, 300, 7, 2.2); sfx.elaser(); } } } P.wx = P.x; P.wz = P.z; }
  // ---- neutrals
  for (const n of NEUTRAL) { if (n.kind === 'cruiser') { n.a += dt * n.sp; const x = Math.cos(n.a) * n.R, z = Math.sin(n.a) * n.R; n.yaw = Math.atan2(x - n.x, z - n.z); n.x = x; n.z = z; n.g.position.set(x, 12, z); n.g.rotation.set(0, n.yaw, 0); n.g.scale.setScalar(1.6); if (!n.warned && started && dist(x, z, S.x, S.z) < 200) { n.warned = true; logLine("King Might's peacekeepers · leave them be"); } }
    else { n.t += dt * 26 / Math.max(200, dist(n.from.x, n.from.z, n.to.x, n.to.z)); if (n.t >= 1) { n.from = n.to; let b = pick(DOCKS); if (b === n.from) b = DOCKS[(DOCKS.indexOf(b) + 2) % DOCKS.length]; n.to = b; n.t = 0; } const e = n.t, sx = n.from.x + 60, sz = n.from.z, ex = n.to.x + 60, ez = n.to.z; const mx = (sx + ex) / 2 + (ez - sz) * 0.12, mz = (sz + ez) / 2 - (ex - sx) * 0.12; const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * mx + e * e * ex, z = (1 - e) * (1 - e) * sz + 2 * (1 - e) * e * mz + e * e * ez; n.yaw = Math.atan2(x - n.x, z - n.z) || n.yaw; n.x = x; n.z = z; n.g.position.set(x, -8, z); n.g.rotation.set(0, n.yaw, Math.sin(T + n.t * 9) * 0.05); n.g.updateMatrixWorld(); V.set(0, 0, -14).applyMatrix4(n.g.matrixWorld); n.tr.push(V, V2.set(Math.cos(n.yaw), 0, -Math.sin(n.yaw)), 1); } }
  // ---- bolts
  for (let i = BOLTS.length - 1; i >= 0; i--) { const b = BOLTS[i]; b.t -= dt; const px = b.m.position.x, pz = b.m.position.z; b.m.position.x += b.vx * dt; b.m.position.z += b.vz * dt; const x = b.m.position.x, z = b.m.position.z; let hit = false;
    if (b.team === 'p') { for (const f of FOES) { if (f.dead) continue; if (segHit(px, pz, x, z, f.x, f.z, f.kind === 'gunship' ? 7 : 5.5)) { damageFoe(f, b.dmg, x, z); hit = true; break; } }
      if (!hit) for (const B of BEASTS) { if (B.dead || dist(B.x, B.z, x, z) > 160) continue; for (const q of beastBodies(B)) if (segHit(px, pz, x, z, q.x, q.z, q.r)) { B.hit(b.dmg, x, z); hit = true; break; } if (hit) break; }
      if (!hit) for (const P of PORTS3) { if (P.razed || dist(P.x, P.z, x, z) > 120) continue; for (const t of P.turrets) if (!t.dead && segHit(px, pz, x, z, t.x, t.z, 5)) { damageTurret(P, t, b.dmg, x, z); hit = true; break; } if (!hit && dist(P.x, P.z, x, z) < 46) { damagePort(P, b.dmg * 0.6, x, z); hit = true; } }
      if (!hit) for (const n of NEUTRAL) if (n.kind === 'cruiser' && dist(n.x, n.z, x, z) < 30) { flash(x, 0, z, 0xffd38a, 6, 0.2); hit = true; if (!n.shotWarn) { n.shotWarn = true; logLine('The machines ignore you. This time.', true); } break; }
      if (!hit) for (const r of rocksNear(x, z)) { if (Math.abs(r.y) > r.s + 2) continue; if (dist(r.x, r.z, x, z) < r.s + 1) { hitRock(r, b.dmg, x, z); hit = true; break; } } }
    else if (!S.dead && segHit(px, pz, x, z, S.x, S.z, 5)) { hurtPlayer(b.dmg, x, z); flash(x, 0, z, 0xff8a5a, 5, 0.2); hit = true; }
    if (hit || b.t <= 0) { b.m.visible = false; BOLTS.splice(i, 1); (POOL[b.team] || POOL.e).push(b); } }
  // ---- missiles
  for (let i = MISS.length - 1; i >= 0; i--) { const m = MISS[i]; m.t -= dt; m.v = Math.min(360, m.v + dt * 200); const t = m.tgt && !m.tgt.dead && !(m.tgt.razed) ? m.tgt : null; if (t) { const lp = leadPoint(m.x, m.z, t, m.v); const want = Math.atan2(lp.x - m.x, lp.z - m.z); m.yaw += clamp(wrapA(want - m.yaw), -3.2 * dt, 3.2 * dt); }
    m.x += Math.sin(m.yaw) * m.v * dt; m.z += Math.cos(m.yaw) * m.v * dt; m.m.position.set(m.x, 0, m.z); m.m.rotation.set(0, m.yaw, T * 8); m.m.updateMatrixWorld(); V.set(0, 0, -1.6).applyMatrix4(m.m.matrixWorld); m.tr.push(V, V2.set(Math.cos(m.yaw), 0, -Math.sin(m.yaw)), 1);
    let boom = m.t <= 0; if (t && dist(m.x, m.z, t.x, t.z) < (t.kind === 'port' ? 46 : 7)) boom = true; for (const r of rocksNear(m.x, m.z)) if (dist(r.x, r.z, m.x, m.z) < r.s + 1) { boom = true; break; }
    if (!boom) for (const B of BEASTS) { if (B.dead) continue; for (const q of beastBodies(B)) if (dist(q.x, q.z, m.x, m.z) < q.r + 2) { boom = true; break; } if (boom) break; }
    if (boom) { for (const B of BEASTS) if (!B.dead && beastBodies(B).some(q => dist(q.x, q.z, m.x, m.z) < q.r + 16)) B.hit(26, m.x, m.z); explode(m.x, m.z, 0.8, '#e8ecf2'); for (const f of FOES) if (!f.dead && dist(f.x, f.z, m.x, m.z) < 22) damageFoe(f, 26 * (f === t ? 1 : 0.5), m.x, m.z); for (const P of PORTS3) { if (P.razed) continue; for (const tu of P.turrets) if (!tu.dead && dist(tu.x, tu.z, m.x, m.z) < 18) damageTurret(P, tu, 30, m.x, m.z); if (dist(P.x, P.z, m.x, m.z) < 60) damagePort(P, 34, m.x, m.z); } for (const r of rocksNear(m.x, m.z)) if (dist(r.x, r.z, m.x, m.z) < r.s + 14) hitRock(r, 20, m.x, m.z); scene.remove(m.m); m.tr.dispose(); MISS.splice(i, 1); } }
  // ---- loot
  for (let i = LOOT.length - 1; i >= 0; i--) { const l = LOOT[i]; l.t -= dt; const d = dist(l.m.position.x, l.m.position.z, S.x, S.z); if (d < 55 && !S.dead) { const k = (1 - d / 55) * 260; l.vx += (S.x - l.m.position.x) / d * k * dt; l.vz += (S.z - l.m.position.z) / d * k * dt; } l.vx *= Math.exp(-dt * 1.5); l.vz *= Math.exp(-dt * 1.5); l.m.position.x += l.vx * dt; l.m.position.z += l.vz * dt; l.m.rotation.y += dt * 2; l.m.rotation.x += dt; l.m.position.y = Math.sin(T * 3 + i) * 0.6;
    if (d < 7 && !S.dead) { if (l.kind === 'ore') { addOre(l.val); } else { save.addGold(l.val); } sfx.pickup(); flash(l.m.position.x, 0, l.m.position.z, l.kind === 'ore' ? 0xffd23a : 0x7fffb0, 6, 0.25); scene.remove(l.m); LOOT.splice(i, 1); continue; }
    if (l.t <= 0) { scene.remove(l.m); LOOT.splice(i, 1); } }
  // ---- effects
  for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.t += dt; const u = f.t / f.life; if (f.s) { f.s.scale.setScalar(f.size * (1 + u * f.grow)); f.s.material.opacity = Math.max(0, 1 - u); } if (f.ring) { f.ring.scale.setScalar(1 + u * f.R); f.ring.material.opacity = Math.max(0, 0.9 * (1 - u)); } if (u >= 1) { if (f.s) { scene.remove(f.s); f.s.material.dispose(); } if (f.ring) { scene.remove(f.ring); f.ring.material.dispose(); } FX.splice(i, 1); } }
  for (let i = DEB.length - 1; i >= 0; i--) { const d = DEB[i]; d.t -= dt; d.m.position.x += d.vx * dt; d.m.position.y += d.vy * dt; d.m.position.z += d.vz * dt; d.m.rotation.x += d.rx * dt; d.m.rotation.z += d.rz * dt; d.vx *= Math.exp(-dt * 0.6); d.vz *= Math.exp(-dt * 0.6); if (d.t <= 0) { scene.remove(d.m); DEB.splice(i, 1); } }
  if (S.warpT > 0) S.warpT -= dt;
  // ---- target upkeep
  if (S.tgt && (S.tgt.dead || dist(S.tgt.x, S.tgt.z, S.x, S.z) > 1300)) S.tgt = null;
  if (!S.tgt && live) { const b = bestTarget(0.5); if (b) { S.tgt = b; sfx.lock(); } }
  // ---- camera: chase, looking a little ahead; FOV opens up on boost
  camYaw += wrapA(S.yaw - camYaw) * Math.min(1, dt * 3.2);
  const port = innerWidth < innerHeight, back = (28 + spd * 0.07) * (port ? 1.4 : 1), up2 = (25 + spd * 0.035) * (port ? 1.35 : 1);
  V.set(S.x - Math.sin(camYaw) * back, up2, S.z - Math.cos(camYaw) * back); camPos.lerp(V, Math.min(1, dt * 6));
  V.set(S.x + Math.sin(S.yaw) * (24 + spd * 0.1), 0, S.z + Math.cos(S.yaw) * (24 + spd * 0.1)); camLook.lerp(V, Math.min(1, dt * 7));
  if (!started && !S.warpT) { const a = T * 0.04 + 0.6, w = WORLDS[4]; camPos.set(w.x + Math.cos(a) * 520, 190, w.z + Math.sin(a) * 520); camLook.set(w.x, 0, w.z); }
  if (S.hold) { const [a, el, d] = S.hold; camPos.set(S.x + Math.sin(S.yaw + a) * d * Math.cos(el), d * Math.sin(el), S.z + Math.cos(S.yaw + a) * d * Math.cos(el)); camLook.set(S.x, 0, S.z); }
  camera.position.copy(camPos); if (shakeK > 0) { camera.position.x += rr(-1, 1) * shakeK * 2; camera.position.y += rr(-1, 1) * shakeK * 2; shakeK = Math.max(0, shakeK - dt * 2.5); } camera.lookAt(camLook);
  fov = damp(fov, (boosting ? 72 : 60) + (port ? 12 : 0), 4, dt); camera.fov = fov; camera.updateProjectionMatrix();
  if (window.__dome) window.__dome.position.copy(camera.position); for (const s of window.__stars || []) s.position.copy(camera.position);
  // ---- context: what is near
  near = null; { let bd = 1e9; for (const s of STRUCTS) { const d = dist(S.x, S.z, s.x, s.z) - s.r; if (d < 34 && d < bd) { bd = d; near = s; } } const e = EARTH; if (!near && dist(S.x, S.z, e.x, e.z) - e.r < 70) near = { kind: 'earth', w: e, x: e.x, z: e.z, name: 'Earth', label: 'EARTH' }; }
  if (dtO) return;
  // rocks between the lens and the ship step aside (scaled to nothing) until the view is clear again
  { const cx = camera.position.x, cz = camera.position.z, touched = new Set(), now = new Set(); for (const q of [[cx, cz], [(cx + S.x) / 2, (cz + S.z) / 2]]) for (const r of rocksNear(q[0], q[1])) if (r.alive && segHit(cx, cz, S.x, S.z, r.x, r.z, r.s + 2.5) && Math.abs(r.y - camera.position.y * 0.5) < r.s + 12) now.add(r);
    for (const r of HIDDEN) if (!now.has(r)) { r.alive = true; writeRock(r); touched.add(r.im); touched.add(r.ol); if (r.gl) touched.add(r.gl); HIDDEN.delete(r); }
    for (const r of now) if (!HIDDEN.has(r)) { r.alive = false; writeRock(r); r.alive = true; r.camHid = true; touched.add(r.im); touched.add(r.ol); if (r.gl) touched.add(r.gl); HIDDEN.add(r); }
    touched.forEach(m => m.instanceMatrix.needsUpdate = true); }
  tickDust(); if ((cullT -= dt) <= 0) { cullT = 0.5; cull(); }
  hud(dt, spd);
  renderer.render(scene, camera);
}
let camYaw = S.yaw;
function segHit(ax, az, bx, bz, cx, cz, r) { const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1; const t = clamp(((cx - ax) * dx + (cz - az) * dz) / L2, 0, 1); return Math.hypot(ax + dx * t - cx, az + dz * t - cz) < r; }

// ================================================================ DAMAGE
function flashFoe(f) { f.flashT = 0.12; f.g.traverse(o => { if (o.isMesh && Array.isArray(o.material)) o.material[0].emissiveIntensity = 1.4; }); if (f.g.userData.halo) f.g.userData.halo.material.opacity = 0.9; }
function damageFoe(f, dmg, x, z) { if (f.dead) return; if (f.sh > 0) { f.sh = Math.max(0, f.sh - dmg); flash(x, 0, z, 0x7fd8ff, 6, 0.2); } else { f.hp -= dmg; flash(x, 0, z, 0xffb04a, 5, 0.2); flashFoe(f); }
  f.hurtT = 1.0; if (f.state === 'transit' || f.state === 'patrol') f.state = 'attack'; if (f.hp < f.max * 0.45 && f.state === 'attack' && Math.random() < 0.5) { f.state = 'evade'; f.st = 0; }
  if (f.hp <= 0) { f.dead = true; f.deadT = S.t; explode(f.x, f.z, f.kind === 'ace' ? 2.4 : f.kind === 'gunship' ? 1.6 : 1.1, '#24202c'); save.addGold(Math.round(f.K.cr / 2)); loot(f.x, f.z, 'cr', Math.ceil(f.K.cr / 10)); if (Math.random() < 0.5) loot(f.x, f.z, 'ore', 2); S.kills++; logLine((f.kind === 'ace' ? f.name + ' down' : 'Corsair down') + ' · +' + Math.round(f.K.cr / 2) + ' cr', false); } }
function damageTurret(P, t, dmg, x, z) { t.hp -= dmg; flash(x, 0, z, 0xffb04a, 5, 0.2); if (t.hp <= 0 && !t.dead) { t.dead = true; t.t.visible = false; explode(t.x, t.z, 1, '#2a2630'); logLine(P.name + ' turret down'); } }
function damagePort(P, dmg, x, z) { const up3 = P.turrets.filter(t => !t.dead).length; P.hp -= dmg * (up3 ? 0.35 : 1); flash(x, 0, z, 0xff8a5a, 8, 0.25); if (P.hp <= 0 && !P.razed) { for (let i = 0; i < 6; i++) setTimeout(() => explode(P.x + rr(-40, 40), P.z + rr(-30, 30), 1.6, '#4a4048'), i * 220); razePort(P); save.addGold(400); loot(P.x, P.z, 'cr', 12); logLine('Port ' + P.name + ' razed · +400 cr', false); toast('Port ' + P.name + ' razed. Its raids are over.'); if (S.tgt === P) S.tgt = null; } }
function hitRock(r, dmg, x, z) { r.hp -= dmg; flash(x, r.y, z, 0xffcf8a, 4, 0.18); if (r.hp > 0) return; r.alive = false; writeRock(r); r.im.instanceMatrix.needsUpdate = true; r.ol.instanceMatrix.needsUpdate = true; if (r.gl) r.gl.instanceMatrix.needsUpdate = true; debris(r.x, r.z, '#8a8478', Math.min(10, Math.round(r.s)), 18); flash(r.x, r.y, r.z, 0xffcf8a, r.s * 2, 0.4); sfx.boom(0.4);
  if (r.ore) loot(r.x, r.z, 'ore', Math.ceil(r.s / 3)); else if (Math.random() < 0.25) loot(r.x, r.z, 'cr', 1);
  setTimeout(() => { r.alive = true; r.hp = Math.ceil(r.s / 2.5); writeRock(r); r.im.instanceMatrix.needsUpdate = true; r.ol.instanceMatrix.needsUpdate = true; if (r.gl) r.gl.instanceMatrix.needsUpdate = true; }, 60000); }

// ================================================================ CORSAIR AI — transit in formation, attack runs with lead, break off, jink, flee
function foeAI(f, dt, T) {
  const K = f.K; f.st += dt; f.cd -= dt;
  if (f.flashT > 0) { f.flashT -= dt; if (f.flashT <= 0) { f.g.traverse(o => { if (o.isMesh && Array.isArray(o.material)) o.material[0].emissiveIntensity = 0.18; }); if (f.g.userData.halo) f.g.userData.halo.material.opacity = 0.25; } }
  if (f.sh < (K.shield || 0) && (f.hurtT -= dt) < -2) f.sh = Math.min(K.shield, f.sh + dt * 8);
  const dx = S.x - f.x, dz = S.z - f.z, d = Math.hypot(dx, dz), toP = Math.atan2(dx, dz);
  let want = f.yaw, sp = K.sp, fire = false;
  const playerOK = started && !S.dead;
  if (f.state === 'transit') { if (f.lead && !f.lead.dead) { const L = f.lead, lx = L.x + Math.sin(L.yaw) * f.off.y + Math.cos(L.yaw) * f.off.x, lz = L.z + Math.cos(L.yaw) * f.off.y - Math.sin(L.yaw) * f.off.x; want = Math.atan2(lx - f.x, lz - f.z); sp = K.sp * clamp(dist(f.x, f.z, lx, lz) / 30, 0.6, 1.3); } else want = toP; if (d < 520 && playerOK) { f.state = 'attack'; f.st = 0; } if (!playerOK && d > 1600) f.state = 'flee'; }
  else if (f.state === 'attack') { const lp = leadPoint(f.x, f.z, { x: S.x, z: S.z, yaw: Math.atan2(S.vx, S.vz), v: Math.hypot(S.vx, S.vz) }, 380); want = Math.atan2(lp.x - f.x, lp.z - f.z); const off = Math.abs(wrapA(want - f.yaw)); sp = d < 120 ? K.sp * 0.7 : K.sp;
    if (off < K.cone && d < K.range && playerOK) fire = true;
    if (d < 55 || f.st > rr(4.5, 7)) { f.state = 'break'; f.st = 0; f.breakYaw = f.yaw + (Math.random() < 0.5 ? 1 : -1) * rr(1.2, 1.9); }
    if (!playerOK) f.state = 'transit'; }
  else if (f.state === 'break') { want = f.breakYaw; sp = K.sp * 1.3; if (f.st > rr(1.4, 2.2)) { f.state = 'attack'; f.st = 0; } }
  else if (f.state === 'evade') { want = f.yaw + Math.sin(f.st * 7) * 1.2; sp = K.sp * 1.15; if (f.st > 1.2) { f.state = f.hp < f.max * 0.25 && f.kind !== 'ace' ? 'flee' : 'attack'; f.st = 0; } }
  else if (f.state === 'flee') { want = f.port ? Math.atan2(f.port.x - f.x, f.port.z - f.z) : toP + Math.PI; sp = K.sp * 1.2; if (d > 1500) { f.dead = true; f.deadT = S.t; } }
  // keep off planets, rocks and each other
  for (const w of BODIES) { const dd = dist(f.x, f.z, w.x, w.z); if (dd < w.r + 70) { const away = Math.atan2(f.x - w.x, f.z - w.z); want = away + wrapA(want - away) * 0.3; } }
  for (const o of FOES) { if (o === f || o.dead) continue; const dd = dist(f.x, f.z, o.x, o.z); if (dd < 18) { const away = Math.atan2(f.x - o.x, f.z - o.z); want = want + wrapA(away - want) * 0.25; } }
  const turn = clamp(wrapA(want - f.yaw), -K.turn * dt, K.turn * dt); f.yaw += turn; f.bank = damp(f.bank || 0, -turn / dt / K.turn * 0.7, 6, dt);
  f.v = damp(f.v, sp, 2, dt); f.x += Math.sin(f.yaw) * f.v * dt; f.z += Math.cos(f.yaw) * f.v * dt;
  for (const r of rocksNear(f.x, f.z)) { const dd = dist(f.x, f.z, r.x, r.z); if (dd < r.s + 4) { f.x = r.x + (f.x - r.x) / dd * (r.s + 4); f.z = r.z + (f.z - r.z) / dd * (r.s + 4); } }
  // guns
  if (fire && f.cd <= 0) { const fx = Math.sin(f.yaw), fz = Math.cos(f.yaw); if (K.spread) { for (const s of [-0.12, 0, 0.12]) bolt('e', f.x + fx * 6, 0, f.z + fz * 6, Math.sin(f.yaw + s), Math.cos(f.yaw + s), 330, K.dmg, 1.6); f.cd = K.rof; } else { bolt('e', f.x + fx * 5, 0, f.z + fz * 5, fx, fz, 380, K.dmg, 1.4); f.burst++; f.cd = f.burst % K.burst === 0 ? K.rof * 4 : K.rof; } sfx.elaser(); }
  f.g.position.set(f.x, Math.sin(T * 1.7 + f.max) * 1.2, f.z); f.g.rotation.set(0, f.yaw, 0); f.g.rotateZ(f.bank);
  f.g.userData.flames.forEach(fl => fl.scale.setScalar(3 + f.v / 60 + Math.sin(T * 30) * 0.4)); f.g.updateMatrixWorld(); V.copy(f.g.userData.engines[0]).applyMatrix4(f.g.matrixWorld); f.trail.push(V, V2.set(Math.cos(f.yaw), 0, -Math.sin(f.yaw)), clamp(f.v / 120, 0.2, 1.2));
}

// ================================================================ HUD
const PROJ = new THREE.Vector3();
function toScreen(x, y, z) { PROJ.set(x, y, z).project(camera); return { x: (PROJ.x + 1) / 2 * innerWidth, y: (1 - PROJ.y) / 2 * innerHeight, behind: PROJ.z > 1 }; }
function hud(dt, spd) {
  const b = nearestBody(); const ins = near; const port = PORTS3.find(p => dist(p.x, p.z, S.x, S.z) < 520);
  if (port && !ins) { $('pw').textContent = port.razed ? 'SPACE · A DEAD PORT' : 'SPACE · CORSAIR PORT'; $('pc').textContent = 'Port ' + port.name; $('pd').textContent = port.razed ? 'Burned out. Its raids are over.' : 'Knock out the four turrets, then the hall. It never rebuilds.'; } else {
  $('pw').textContent = ins ? 'SPACE · ' + (ins.label || '') : b.d < 260 ? 'SPACE · IN ORBIT' : RAID.on ? 'SPACE · RAID UNDER WAY' : 'SPACE · THE NINE';
  $('pc').textContent = ins ? (ins.name || ins.w.n) : b.n; $('pd').textContent = ins ? (ins.kind === 'gate' ? 'Fly up and open the gate list.' : ins.kind === 'mine' ? 'Sell the ore you have mined.' : ins.kind === 'yard' ? 'Upgrades for credits.' : ins.kind === 'fuel' ? 'Repairs and missiles.' : ins.kind === 'dsf' ? 'The station on the edge. You are its Steward.' : b.tag) : (b.d < 260 ? b.tag : Math.round(b.d * 10) + ' km · ' + b.tag);
  }
  $('hb').style.width = (S.hp / maxHp() * 100) + '%'; $('sb').style.width = (S.sh / maxSh() * 100) + '%'; $('bb').style.width = S.boostE + '%'; S.spdShow = Math.round(spd * 3.6);
  $('cr').textContent = save.data.gold + ' CR'; $('ore').textContent = oreOf() + ' ORE · ' + S.mis + ' MSL';
  const actTxt = ins ? (ins.kind === 'dock' ? 'LAND · ' + ins.w.n : ins.kind === 'dsf' ? 'DOCK · Deep Space Fox' : ins.kind === 'earth' ? 'LAND · Earth' : ins.kind === 'mine' ? 'TRADE ORE' : ins.kind === 'yard' ? 'SHIPYARD' : ins.kind === 'fuel' ? 'REFIT' : ins.kind === 'gate' ? 'STAR GATE' : '') : '';
  const showAct = !!ins && started && !panelOpen && !chartOpen && !S.dead;
  show($('prompt'), showAct && !touch); $('ptx').textContent = actTxt; show($('bAct'), showAct, 'flex'); $('bAct').textContent = actTxt;
  const t = S.tgt; show($('target'), !!t && started); if (t) { $('tk').textContent = t.kind === 'ace' ? 'ACE' : t.kind === 'serpent' ? 'BEAST' : t.kind === 'nest' ? 'NEST' : t.kind === 'port' ? 'CORSAIR PORT' : 'TARGET · ' + Math.round(dist(S.x, S.z, t.x, t.z) * 10) + ' km'; $('tn').textContent = t.name || 'Turret'; $('tb').style.width = Math.max(0, (t.hp / (t.max || t.hpMax || 30)) * 100) + '%'; }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) show($('toast'), false); }
  hurtA = Math.max(0, hurtA - dt * 2); shieldA = Math.max(0, shieldA - dt * 2); $('hurt').style.opacity = hurtA; $('shieldfx').style.opacity = shieldA;
  drawMarks(); drawRadar();
}
function drawMarks() { mk.clearRect(0, 0, innerWidth, innerHeight); if (!started) return;
  const W = innerWidth, H = innerHeight, pad = 40;
  const arrow = (x, z, col, label, size = 10) => { const p = toScreen(x, 0, z); let sx = p.x, sy = p.y; const on = !p.behind && sx > pad && sx < W - pad && sy > pad && sy < H - pad; if (on) return p; let dx = sx - W / 2, dy = sy - H / 2; if (p.behind) { dx = -dx; dy = -dy; } const k = Math.min((W / 2 - pad) / Math.abs(dx || 1e-3), (H / 2 - pad) / Math.abs(dy || 1e-3)); sx = W / 2 + dx * k; sy = H / 2 + dy * k; const a = Math.atan2(dy, dx); mk.save(); mk.translate(sx, sy); mk.rotate(a); mk.fillStyle = col; mk.strokeStyle = '#201e1d'; mk.lineWidth = 2; mk.beginPath(); mk.moveTo(size, 0); mk.lineTo(-size * 0.7, -size * 0.75); mk.lineTo(-size * 0.7, size * 0.75); mk.closePath(); mk.fill(); mk.stroke(); mk.restore(); if (label) { mk.font = '800 11px Archivo, sans-serif'; mk.fillStyle = '#f3f2f2'; mk.textAlign = 'center'; mk.fillText(label, sx - Math.cos(a) * 22, sy - Math.sin(a) * 22 + 4); } return null; };
  for (const f of FOES) if (!f.dead) { const p = arrow(f.x, f.z, '#ec3013', null, 7); if (p && f !== S.tgt) { mk.strokeStyle = 'rgba(236,48,19,.8)'; mk.lineWidth = 2; mk.strokeRect(p.x - 9, p.y - 9, 18, 18); } }
  if (S.wp) { const dd = Math.round(dist(S.x, S.z, S.wp.x, S.wp.z) * 10); const p = arrow(S.wp.x, S.wp.z, '#f3f2f2', (S.wp.n || S.wp.name || '') + ' · ' + dd + ' km', 11); if (p) { mk.strokeStyle = '#f3f2f2'; mk.lineWidth = 2; mk.beginPath(); mk.arc(p.x, p.y, 14, 0, TAU); mk.stroke(); mk.font = '800 12px Archivo, sans-serif'; mk.fillStyle = '#f3f2f2'; mk.textAlign = 'center'; mk.fillText((S.wp.n || S.wp.name) + ' · ' + dd + ' km', p.x, p.y - 22); } if (dd < 2000) { S.wp = null; logLine('Arrived'); } }
  const t = S.tgt; if (t && !t.dead) { const p = toScreen(t.x, 0, t.z); if (!p.behind) { const s = t.kind === 'port' ? 40 : 18 + 6 * Math.sin(S.t * 6); mk.strokeStyle = '#ec3013'; mk.lineWidth = 3; for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { mk.beginPath(); mk.moveTo(p.x + a * s, p.y + b * s * 0.6); mk.lineTo(p.x + a * s, p.y + b * s); mk.lineTo(p.x + a * s * 0.6, p.y + b * s); mk.stroke(); }
      if (t.v !== undefined && t.yaw !== undefined && t.kind !== 'port') { const lp = leadPoint(S.x, S.z, t, 560 + forwardSpeed()); const q = toScreen(lp.x, 0, lp.z); if (!q.behind) { mk.strokeStyle = '#f3f2f2'; mk.lineWidth = 2; mk.beginPath(); mk.arc(q.x, q.y, 6, 0, TAU); mk.stroke(); mk.beginPath(); mk.moveTo(p.x, p.y); mk.lineTo(q.x, q.y); mk.setLineDash([3, 4]); mk.stroke(); mk.setLineDash([]); } } } else arrow(t.x, t.z, '#ec3013', 'TARGET'); }
  // the crosshair ahead of the ship
  const c = toScreen(S.x + Math.sin(S.yaw) * 180, 0, S.z + Math.cos(S.yaw) * 180); if (!c.behind && !S.dead) { mk.strokeStyle = 'rgba(243,242,242,.85)'; mk.lineWidth = 2; mk.beginPath(); mk.arc(c.x, c.y, 10, 0, TAU); mk.moveTo(c.x - 18, c.y); mk.lineTo(c.x - 12, c.y); mk.moveTo(c.x + 12, c.y); mk.lineTo(c.x + 18, c.y); mk.moveTo(c.x, c.y - 18); mk.lineTo(c.x, c.y - 12); mk.stroke(); mk.font = '800 11px Archivo, sans-serif'; mk.fillStyle = 'rgba(243,242,242,.85)'; mk.textAlign = 'center'; mk.fillText(S.spdShow + ' KM/H', c.x, c.y + 32); }
  if (S.grace > 0 && S.grace < 30 && !RAID.on) { mk.font = '800 11px Archivo, sans-serif'; mk.fillStyle = 'rgba(243,242,242,.7)'; mk.textAlign = 'center'; mk.fillText('QUIET SKIES · ' + Math.ceil(S.grace) + 's', W / 2, H - 24); } }
function drawRadar() { const c = radar, Wd = 300, R = 140, sc = R / 1600; c.clearRect(0, 0, Wd, Wd); c.save(); c.translate(Wd / 2, Wd / 2);
  c.strokeStyle = 'rgba(243,242,242,.22)'; c.lineWidth = 2; for (const r of [R * 0.33, R * 0.66]) { c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); }
  c.rotate(S.yaw + Math.PI);
  const dot = (x, z, col, r, clampIt = true) => { let px = (x - S.x) * sc, py = (z - S.z) * sc; const l = Math.hypot(px, py); if (l > R - 8) { if (!clampIt) return; px *= (R - 8) / l; py *= (R - 8) / l; } c.fillStyle = col; c.beginPath(); c.arc(-px, py, r, 0, TAU); c.fill(); };
  for (const w of BODIES) dot(w.x, w.z, w.tint, Math.max(4, w.r * sc * 2.2));
  for (const s of STRUCTS) dot(s.x, s.z, s.kind === 'gate' ? '#7fd8ff' : 'rgba(243,242,242,.6)', 2.2, false);
  for (const p of PORTS3) dot(p.x, p.z, p.razed ? '#5a5560' : '#ec3013', 5);
  for (const n of NEUTRAL) dot(n.x, n.z, n.kind === 'cruiser' ? '#e6b45a' : '#7fd8ff', n.kind === 'cruiser' ? 4 : 2, false);
  for (const f of FOES) if (!f.dead) dot(f.x, f.z, '#ff3a2a', f.kind === 'ace' ? 5 : 3.4);
  for (const B of BEASTS) if (!B.dead) dot(B.x, B.z, B.kind === 'serpent' ? '#5fe1c0' : '#d8a8ff', B.kind === 'serpent' ? 6 : B.kind === 'nest' ? 5 : 2, B.kind !== 'moth');
  for (const l of LOOT) dot(l.m.position.x, l.m.position.z, l.kind === 'ore' ? '#ffd23a' : '#7fffb0', 1.8, false);
  if (S.wp) dot(S.wp.x, S.wp.z, '#ffffff', 4);
  c.restore(); c.fillStyle = '#f3f2f2'; c.strokeStyle = '#201e1d'; c.lineWidth = 2; c.beginPath(); c.moveTo(Wd / 2, Wd / 2 - 11); c.lineTo(Wd / 2 - 8, Wd / 2 + 9); c.lineTo(Wd / 2 + 8, Wd / 2 + 9); c.closePath(); c.fill(); c.stroke(); }

// test / debug hooks
window.__8G_SPACE = {
  state: () => ({ x: S.x, z: S.z, v: Math.hypot(S.vx, S.vz), yaw: S.yaw, hp: S.hp, sh: S.sh, near: near && (near.name || near.kind), foes: FOES.filter(f => !f.dead).length, raid: RAID.on, gold: save.data.gold, ore: oreOf(), mis: S.mis, tgt: S.tgt && S.tgt.name, dead: S.dead }),
  start: () => $('ibtn').click(),
  go: (k, kind = 'dock') => { const s = STRUCTS.find(s => s.w.k === k && s.kind === kind) || STRUCTS.find(s => s.kind === kind); S.x = s.x + s.r + 20; S.z = s.z; S.yaw = -Math.PI / 2; S.vx = S.vz = 0; camYaw = S.yaw; camPos.set(S.x - Math.sin(S.yaw) * 40, 20, S.z - Math.cos(S.yaw) * 40); camLook.set(S.x + Math.sin(S.yaw) * 30, 0, S.z + Math.cos(S.yaw) * 30); trails.forEach(t => t.clear()); return s.name; },
  at: (x, z, yaw = 0) => { S.x = x; S.z = z; S.yaw = yaw; camYaw = yaw; S.vx = S.vz = 0; camPos.set(x - Math.sin(yaw) * 40, 20, z - Math.cos(yaw) * 40); camLook.set(x + Math.sin(yaw) * 30, 0, z + Math.cos(yaw) * 30); trails.forEach(t => t.clear()); },
  raid: (near2) => { const P = PORTS3.filter(p => !p.razed)[0]; S.grace = 0; launchRaid(P, near2); return FOES.length; },
  foes: () => FOES.filter(f => !f.dead).map(f => ({ k: f.kind, st: f.state, x: Math.round(f.x), z: Math.round(f.z), hp: Math.round(f.hp) })),
  fire: (n = 10) => { for (let i = 0; i < n; i++) { S.cd = 0; fireLasers(); } return BOLTS.length; },
  missile: () => fireMissile(), target: () => { cycleTarget(); return S.tgt && S.tgt.name; },
  act: () => act(), chart: () => openChart(), closeAll: () => { closePanel(); closeChart(); },
  hold: (k, v) => { hold[k] = v; }, key: (c, on) => on ? keys.add(c) : keys.delete(c),
  cam: (x, y, z, lx, ly, lz) => { camPos.set(x, y, z); camLook.set(lx, ly, lz); },
  stats: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, cam: camera.position.toArray().map(Math.round), started, warpT: S.warpT }),
  grace: v => { S.grace = v; },
  hold: (a, el, d) => { S.hold = a == null ? null : [a, el, d]; },
  beasts: () => BEASTS.filter(b => !b.dead).map(b => ({ k: b.kind, st: b.state, x: Math.round(b.x), z: Math.round(b.z), hp: Math.round(b.hp) })),
  sim: (sec, dt = 1 / 30) => { const n = Math.round(sec / dt); for (let i = 0; i < n; i++) step(dt); clock.getDelta(); return n; },
};
frame();
