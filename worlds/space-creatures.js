// 8 GATES · SPACE MAP CREATURES (s371, s381). Families:
//   THE BELT SERPENT (engine/last-kit.js 'belt') — prowls a mine belt, COILS (tell), then LUNGES. Weak: its glowing eyes after a lunge.
//   VOID MOTH (s381, Ben: "giant ship-sized moths that shoot lasers and pulse energy round themselves") — 3D model 'voidMoth'
//     (Space Install Workshop). They hunt in PAIRS (2D). Circle you, fire pink lasers from the eyes; up close they CHARGE (red ring
//     round the moth, wings spread) and PULSE a ring of energy outwards. After a pulse it droops: WEAK (gold) for ~2 s, ×2 damage.
//   THE OCTOPUS (s592, Ben, from the 2D DEEPHAND: "blue electric tentacles that attach to the player, the head in front of the lasers so you can shoot it off,
//     a charge attack + an ink it fires that hurts when you fly through"). Own model: a deep-blue bell, glowing eyes, 8 ELECTRIC ARMS (one additive ribbon draw).
//     Stands off + circles you, spits INK blobs (each bursts into a cloud: flying through it hurts), CHARGES down a red lane; a charge that connects GRABS you:
//     the arms latch on, the head sits right in front of your guns, you are slowed + drained until you shoot it off (or it inks you and lets go). Weak (gold) after.
// Tells: a RED ring on the plane where it will hit. Drops: coins + cells. Each comes back 3 minutes after you beat it.
// s381 NESTS (worlds/space-nests.js) use spawn(fam, home, { orbit, leash, noBack }) + provoke(c).
import { creatureKit } from '../engine/creature-kit.js';
import { lastFamilies } from '../engine/last-kit.js';
import { loadTune, KEY as TUNE_KEY } from './space-battle-tune.js?v=s598o';   // s598 Space Battle Workshop tuning (live)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const DEF = {
  belt: { name: 'The Belt Serpent', hp: 260, sc: 3.4, reach: 22, dmg: 14, gold: [30, 50], drops: 2, col: '#9fb4ff' },
  vmoth: { name: 'Void Moth', hp: 150, sc: 1, reach: 26, dmg: 12, laser: 5, gold: [18, 30], drops: 1, col: '#f0abfc' },
  octo: { name: 'The Octopus', hp: 320, sc: 1, reach: 14, dmg: 16, ink: 3, drain: 4, grabHp: 40, gold: [40, 60], drops: 2, col: '#5fd4ff' },
};
export function createCreatures(X) {
  let TN = loadTune(); const reTune = () => { TN = loadTune(); for (const c of list) if (TN[c.fam]) { const f = c.hp / (c.D.hp || 1); c.D = { ...c.D, hp: TN[c.fam].hp }; c.hp = Math.max(1, Math.round(f * TN[c.fam].hp)); } };
  addEventListener('storage', e => { if (e.key === TUNE_KEY) reTune(); }); window.__8gReTune = reTune;
  const { THREE, scene, St, toon, ink, burst, toast, combat, hurt, homes, LOW, IK, LOOKS } = X;
  // s441 LANES (Ben): creatures stay OUT of each world's neighbourhood (planet + shipyard + depot + gate) so the battle music never starts there. X.keepOut = [{ x, z, r }]
  const KEEP = X.keepOut || []; const keepOut = c => { if (c.fam === 'belt') { const LS = TN.belt.leash, dx = c.x - c.home.x, dz = c.z - c.home.z, d = Math.hypot(dx, dz); if (d > LS) { c.x = c.home.x + dx / d * LS; c.z = c.home.z + dz / d * LS; } return; } for (const q of KEEP) { const dx = c.x - q.x, dz = c.z - q.z, d = Math.hypot(dx, dz); if (d < q.r) { const k2 = (q.r + 0.5) / (d || 1); c.x = q.x + dx * k2; c.z = q.z + dz * k2; if (c.vx !== undefined) { const vn = (c.vx * dx + c.vz * dz) / (d || 1); if (vn < 0) { c.vx -= vn * dx / (d || 1); c.vz -= vn * dz / (d || 1); } } } } };
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) { if (!geo.boundingSphere) geo.computeBoundingSphere(); const r = radius || geo.boundingSphere.radius || 1, o = new THREE.Mesh(geo, ink); o.scale.setScalar(1 + outline / r); m.add(o); } (parent || scene).add(m); return m; }
  const ck = creatureKit({ THREE, toon, M }); const Ls = lastFamilies({ THREE, toon, M, fk: null }); for (const id of ['belt', 'octo']) ck.register(id, Ls[id]);
  const tellM = new THREE.MeshBasicMaterial({ color: '#ec3013', transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
  const pulseM = new THREE.MeshBasicMaterial({ color: '#f0abfc', transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  // one shared baked moth: each moth clones it (shared geometry), wings flap per clone
  const mothProto = IK ? IK.build('voidMoth', LOOKS && LOOKS.voidMoth) : null;
  const list = [];
  function barMake() { const g = new THREE.Group(), bg = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: '#000', depthTest: false, transparent: true, opacity: 0.85 })), fg = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: '#ec3013', depthTest: false, transparent: true }));
    bg.scale.set(8.4, 0.9, 1); fg.scale.set(8, 0.5, 1); fg.position.z = 0.01; bg.renderOrder = 18; fg.renderOrder = 19; g.add(bg, fg); g.rotation.x = -Math.PI / 2 + 0.6; scene.add(g); return { g, fg }; }
  function mothModel() { if (!mothProto) return null; const g = mothProto.group.clone(true); g.scale.multiplyScalar(1.15);
    const wings = []; g.traverse(o => { if (o.isGroup && o.children.length === 1 && o.children[0].name === 'wing') wings.push({ p: o, s: Math.sign(o.position.x), fore: o.position.z < -0.5 }); });
    let aura = null; g.traverse(o => { if (o.isSprite && !aura) { aura = o; o.material = o.material.clone(); } }); return { g, wings, aura, ph: Math.random() * 6 }; }
  let mothN = 0;   // s598i the moths of a pair take turns: one CIRCLES, the other FLIES OVER
  function spawn(fam, home, o = {}) { const D = DEF[fam]; let g, mm = null;
    if (fam === 'vmoth') { mm = mothModel(); if (!mm) return null; g = mm.g; } else if (fam === 'octo') { mm = octoModel(); g = mm.g; } else { g = ck.build(D.name); if (!g) return null; g.scale.setScalar(D.sc); }
    const root = new THREE.Group(); root.add(g); root.position.set(home.x, -3, home.z); scene.add(root);
    const tell = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 48), tellM.clone()); tell.rotation.x = -Math.PI / 2; tell.visible = false; scene.add(tell);
    const c = { fam, D: TN[fam] ? { ...D, hp: TN[fam].hp } : D, g, mm, root, home, x: home.x + (o.dx || 0), z: home.z + (o.dz || 0), h: 0, hp: TN[fam] ? TN[fam].hp : D.hp, state: 'move', st: 0, a: o.a ?? Math.random() * 6.28, tell, bar: barMake(), dead: false, cool: 2 + Math.random() * 2, fireT: 1.5 + Math.random() * 2, vx: 0, vz: 0,
      role: o.role || (fam === 'vmoth' ? ((mothN++ % 2) ? 'strafe' : 'circle') : null), orbit: o.orbit || null, leash: o.leash || null, noBack: !!o.noBack, prov: o.prov || 0, nest: o.nest || null };
    if (fam === 'vmoth') { c.pulse = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), pulseM.clone()); c.pulse.rotation.x = -Math.PI / 2; c.pulse.visible = false; scene.add(c.pulse); }
    if (fam === 'octo') { c.tent = mm.tent; c.lane = mm.lane; c.ph = Math.random() * 6; c.grabCd = 0; if (!c.orbit) { const a = Math.random() * 6.28; c.vx = Math.cos(a) * 6; c.vz = Math.sin(a) * 6; } }
    list.push(c); return c; }
  function remove(c) { scene.remove(c.root); if (c._fl) scene.remove(c._fl); scene.remove(c.tell); scene.remove(c.bar.g); if (c.pulse) scene.remove(c.pulse); if (c.tent) { scene.remove(c.tent); scene.remove(c.lane); } const i = list.indexOf(c); if (i >= 0) list.splice(i, 1); }
  // the moths hunt in pairs (2D): two per home, half a circle apart
  const inkPuffs = [];
  const inkZones = [];
  function inkCloud(x, z, big) { const r = big ? 10 : 7; inkZones.push({ x, z, r, life: big ? 6 : 4.5 }); for (let i = 0; i < (big ? 12 : 8); i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: X.puff, color: '#0a0612', transparent: true, depthWrite: false, opacity: 0.85 })); const a = Math.random() * 6.28, r = Math.random() * 8; s.position.set(x + Math.cos(a) * r, 2 + Math.random() * 2, z + Math.sin(a) * r); s.scale.setScalar(10 + Math.random() * 8); scene.add(s); inkPuffs.push({ s, life: (big ? 5.5 : 4) + Math.random() }); } }
  const _p = new THREE.Vector3();
  const hitPoint = (c, out) => { if (c.fam === 'vmoth' || c.fam === 'octo') return out.set(c.x, 0, c.z); const U = c.g.userData; (U.weak || c.g).getWorldPosition(out); return out; };
  const weakNow = c => c.state === 'recover' || c.state === 'stagger';
  function setState(c, s) { if (s === 'die' && c.state !== 'die' && window.__spaceSnd) window.__spaceSnd('beastDie', { at: [c.x, c.z], v: 0.9, p: c.fam === 'vmoth' || c.boss ? 0.8 : 1 }); c.state = s; c.st = 0; if (c.fam !== 'vmoth' && c.fam !== 'octo') ck.enter && ck.enter(c.g, s); }
  function provoke(c, secs = 20) { c.prov = Math.max(c.prov || 0, St.t + secs); }
  // s454 HIT FLASH (Ben): a struck creature flashes (white on a normal hit, gold on a weak-spot hit), flinches (squash + a recoil away from the shot) and its health bar pops
  function hurtFX(c, x, z, w) { c._hurt = { t: 0, col: w ? '#ffd23a' : '#ffffff', dx: c.x - x, dz: c.z - z };
    if (!c._mats) { c._mats = []; c.root.traverse(o => { if ((o.isMesh || o.isSkinnedMesh) && o.material && (Array.isArray(o.material) ? o.material[0] : o.material).color && (Array.isArray(o.material) ? o.material[0] : o.material).blending !== THREE.AdditiveBlending) { const ms = Array.isArray(o.material) ? o.material : [o.material]; for (const m of ms) { if (!m.userData._own) { o.material = Array.isArray(o.material) ? o.material.map(q => q.clone()) : o.material.clone(); } } (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.userData._own = 1; m.userData._c0 = m.color.clone(); c._mats.push(m); }); } }); }
    if (!c._fl) { c._fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(c._fl); } }
  const _hc = new THREE.Color(), glowTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
  function hurtTick(c, dt) { const H = c._hurt; if (!H) return; H.t += dt; const k = Math.max(0, 1 - H.t / 0.28), s = c.fam === 'vmoth' ? 1.5 : 1;
    _hc.set(H.col); for (const m of c._mats) { m.color.copy(m.userData._c0).multiplyScalar(1 + k * 2.2).lerp(_hc.clone().multiplyScalar(2.5), k * 0.45); if (m.emissive) m.emissive.copy(_hc).multiplyScalar(k * 0.9); }   /* s454b brighten (textures / vertex colours are white-based) + emissive flash */
    c._fl.material.color.set(H.col); c._fl.material.opacity = k * 0.8; c._fl.scale.setScalar((6 + (1 - k) * 6) * s); c._fl.position.set(c.x, c.fam === 'belt' ? -2 : 0.5, c.z);
    const L = Math.hypot(H.dx, H.dz) || 1, j = Math.sin(Math.min(1, H.t / 0.22) * Math.PI) * 0.9 * s; c.root.position.x += H.dx / L * j; c.root.position.z += H.dz / L * j;
    const q = 1 + Math.sin(Math.min(1, H.t / 0.2) * Math.PI) * 0.12; c.root.scale.set((c.root.userData._s0 ??= c.root.scale.x) * q, c.root.userData._s0 / q, c.root.userData._s0 * q);
    if (c.bar) c.bar.g.scale.setScalar(1 + k * 0.35);
    if (H.t > 0.28) { for (const m of c._mats) { m.color.copy(m.userData._c0); if (m.emissive) m.emissive.setRGB(0, 0, 0); } c._fl.material.opacity = 0; c.root.scale.setScalar(c.root.userData._s0); if (c.bar) c.bar.g.scale.setScalar(1); c._hurt = null; } }
  function damage(c, n, x, z) { if (c.dead || c.state === 'die') return; const w = weakNow(c); if (c.state === 'grab' && c.grab) { c.grab.hp -= n; if (c.grab.hp <= 0) octoRelease(c, true); } hurtFX(c, x, z, w); c.hp -= n * (w ? (TN[c.fam] ? TN[c.fam].weakMul : 2) : 1); burst(x, z, w ? '#ffd23a' : '#ffffff', w ? 8 : 4, w ? 1 : 0.6); provoke(c, 25);
    if (c.nest && X.onHit) X.onHit(c);
    if (c.hp <= 0) { if (c.state === 'grab') octoRelease(c, true, true); setState(c, 'die'); c.tell.visible = false; if (c.lane) c.lane.visible = false; if (c.pulse) c.pulse.visible = false; if (c.fam === 'belt') c.dieFx = { n: -1, head: false }; else if (c.fam === 'vmoth') c.mothFx = { sp: 0 }; else if (c.fam === 'octo') c.octoFx = { pop: false, spark: 0 }; else combat.explode(c.x, c.z, true); { const coin = c.fam === 'vmoth' ? 5 : 10;   /* s598v: ONE coin always + 1 in 2 a powerup (energy / triple / speed / shield) */
        combat.drop('coin', c.x, c.z, coin); if (combat.dropPU) combat.dropPU(c.x, c.z); }
        try { X.save.addXp(40); } catch (e) {} toast(c.D.name.toUpperCase() + ' BEATEN!', 3); }
    else if (!w && c.fam !== 'vmoth' && c.fam !== 'octo' && c.state !== 'attack' && c.state !== 'windup' && Math.random() < 0.25) setState(c, 'hurt'); }
  function showBar(c, d) { const show = c.state !== 'die' && (c.hp < c.D.hp || d < 55); c.bar.g.visible = show; if (show) { c.bar.g.position.set(c.x, 6, c.z + 7); c.bar.fg.scale.x = Math.max(0.01, 8 * c.hp / c.D.hp); c.bar.fg.position.x = -4 + 4 * c.hp / c.D.hp; c.bar.fg.material.color.set(weakNow(c) ? '#ffd23a' : '#ec3013'); } }
  function turnTo(c, want, rate, dt) { let df = want - c.h; while (df > Math.PI) df -= 6.283; while (df < -Math.PI) df += 6.283; c.h += clamp(df, -rate * dt, rate * dt); }
  // s598l SERPENT DEATH (Ben: "an explosion that starts at one end of his body and a disintegration"): a chain of blasts runs from the TAIL to the HEAD;
  // each segment flashes white-hot, pops, and crumbles into embers that drift off and cool from gold to ash; the head goes last in a big blast.
  const emb = [], embTex = X.puff, EMB_MAX = LOW ? 90 : 200;
  function ember(x, y, z, col, s, v, life) { if (emb.length >= EMB_MAX) { const o = emb.shift(); scene.remove(o.sp); o.sp.material.dispose(); } const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: embTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 1 }));
    sp.position.set(x, y, z); sp.scale.setScalar(s); scene.add(sp); const a = Math.random() * 6.28, up = Math.random(); emb.push({ sp, vx: Math.cos(a) * v, vy: (up - 0.2) * v, vz: Math.sin(a) * v, life, l0: life, s0: s, c0: new THREE.Color(col) }); }
  const _w = new THREE.Vector3(), ASH = new THREE.Color('#5a6aa0'), GOLD = new THREE.Color('#ffb347');
  function beltDeath(c) { const F = c.dieFx, J = c.g.userData.joints, N = J.segs.length, per = 0.1, k = Math.floor(c.st / per); c.root.updateMatrixWorld(true);
    while (F.n < Math.min(N - 1, k)) { F.n++; const s = J.segs[N - 1 - F.n]; s.getWorldPosition(_w); const big = F.n % 4 === 3;
      ember(_w.x, _w.y, _w.z, '#ffffff', big ? 9 : 6, 0, 0.18); ember(_w.x, _w.y, _w.z, '#ffd23a', big ? 7 : 4.5, 2, 0.35);
      for (let q = 0; q < (LOW ? 4 : 8); q++) ember(_w.x + (Math.random() - 0.5), _w.y + (Math.random() - 0.5), _w.z + (Math.random() - 0.5), Math.random() < 0.5 ? '#ffb347' : '#9fb4ff', 0.8 + Math.random() * 1.2, 3 + Math.random() * 5, 1.2 + Math.random() * 1.2);
      burst(_w.x, _w.z, big ? '#ffd23a' : '#9fb4ff', big ? 10 : 5, big ? 1.3 : 0.8); s.userData._pop = c.st;
      if (big || F.n === 0) window.__spaceSnd && window.__spaceSnd('rockShot', { at: [_w.x, _w.z], v: 0.6, p: 0.6 + F.n * 0.03 }); }
    J.segs.forEach((s, i) => { const t0 = s.userData._pop; if (t0 == null || c.st < t0) return; const u = Math.min(1, (c.st - t0) / 0.22); s.scale.setScalar(u < 0.3 ? 1 + u * 1.2 : Math.max(0.001, 1.36 * (1 - (u - 0.3) / 0.7))); });
    if (!F.head && c.st > N * per + 0.15) { F.head = true; J.head.getWorldPosition(_w); combat.explode(_w.x, _w.z, true); ember(_w.x, _w.y, _w.z, '#ffffff', 16, 0, 0.25); ember(_w.x, _w.y, _w.z, '#5fe3ff', 12, 3, 0.5);
      for (let q = 0; q < (LOW ? 10 : 22); q++) ember(_w.x, _w.y, _w.z, Math.random() < 0.4 ? '#5fe3ff' : '#ffb347', 1 + Math.random() * 1.6, 6 + Math.random() * 8, 1.4 + Math.random() * 1.4); }
    if (F.head) { const u = Math.min(1, (c.st - (N * per + 0.15)) / 0.25); J.head.scale.setScalar(u < 0.3 ? 1 + u : Math.max(0.001, 1.3 * (1 - (u - 0.3) / 0.7))); }
    for (const s of J.segs) if (s.userData._pop != null && c.st >= s.userData._pop) delete s.userData._popKeep; }
  // s598p THE OCTOPUS GOES DOWN (Ben: "our noble octopus"): its arms whip out wide, crackling over-bright (0-0.9 s); then the charge drains UP every arm,
  // tip to root, each tip spitting sparks (0.9-1.6 s) while the bell swells and the eyes flare; at 1.6 s the bell BURSTS: a white flash, an electric
  // shockwave ring, a spray of cyan sparks + dark-violet ink motes; the last of it sinks and fades.
  const rings = [];
  function shock(x, z, col, R1, life) { const mm = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, LOW ? 40 : 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); mm.position.set(x, 0.5, z); scene.add(mm); rings.push({ mm, R1, life, t: 0 }); }
  function octoDeath(c, m, F) { const t = c.st, OJ1 = OJ;
    if (t < 1.6) { const sh = t < 0.9 ? 0.25 : 0.5 * (t - 0.9) / 0.7; c.root.position.set(c.x + (Math.random() - 0.5) * sh, -1.6 + (Math.random() - 0.5) * sh, c.z + (Math.random() - 0.5) * sh); const sw = t < 0.9 ? 1 : 1 + 0.35 * (t - 0.9) / 0.7; c.root.scale.set(sw, sw * (1 - 0.1 * Math.sin(t * 30)), sw);
      m.eyeM.color.set(Math.sin(t * 40) > 0 ? '#ffffff' : '#5fe3ff'); m.aura.material.opacity = 0.5 + 0.4 * Math.abs(Math.sin(t * 22)); m.aura.scale.setScalar(14 + t * 6);
      if ((F.spark -= 1) <= 0) { F.spark = LOW ? 3 : 2; const cut = m.tent.material.uniforms.uCut.value, jj = Math.max(0, Math.min(OJ1, Math.round(cut * OJ1)));
        for (let a = 0; a < m.J.length; a += (LOW ? 2 : 1)) { const p = m.J[a][jj]; ember(p.x, 0.6, p.z, Math.random() < 0.6 ? '#bff4ff' : OCOL, 0.7 + Math.random(), 2 + Math.random() * 4, 0.5 + Math.random() * 0.5); } }
      if (t > 0.9 && !F.surge) { F.surge = true; window.__spaceSnd && window.__spaceSnd('specArc', { at: [c.x, c.z], v: 0.7, p: 0.7 }); } }
    else { if (!F.pop) { F.pop = true; combat.explode(c.x, c.z, true); ember(c.x, 1, c.z, '#ffffff', 22, 0, 0.3); ember(c.x, 1, c.z, OCOL, 16, 0, 0.55); shock(c.x, c.z, '#bff4ff', 42, 0.7); shock(c.x, c.z, OCOL, 30, 0.9);
        for (let q = 0; q < (LOW ? 14 : 30); q++) ember(c.x, 1, c.z, q % 3 ? '#5fe3ff' : '#ffffff', 0.9 + Math.random() * 1.4, 8 + Math.random() * 12, 1 + Math.random() * 1.2);
        for (let q = 0; q < (LOW ? 6 : 12); q++) ember(c.x + (Math.random() - 0.5) * 4, 1, c.z + (Math.random() - 0.5) * 4, '#5a2a9a', 3 + Math.random() * 3, 2 + Math.random() * 3, 1.6 + Math.random());
        window.__spaceSnd && window.__spaceSnd('specEmp', { at: [c.x, c.z], v: 0.8 }); m.tent.visible = false; }
      const u = clamp((t - 1.6) / 0.5, 0, 1); c.root.scale.setScalar(Math.max(0.01, 1.35 * (1 - u) * (u < 0.15 ? 1 + u * 2 : 1))); c.root.position.set(c.x, -1.6 - u * 4, c.z); m.aura.material.opacity = 0.9 * (1 - u);
      if (t > 2.3) { c.dead = true; c.back = 180; c.root.visible = false; c.bar.g.visible = false; m.tent.visible = false; m.aura.scale.setScalar(14); c.root.scale.setScalar(1); } } }
  function embTick(dt) { for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.t += dt; const u = r.t / r.life; if (u >= 1) { scene.remove(r.mm); r.mm.geometry.dispose(); r.mm.material.dispose(); rings.splice(i, 1); continue; } r.mm.scale.setScalar(2 + r.R1 * (1 - (1 - u) * (1 - u))); r.mm.material.opacity = 0.95 * (1 - u); } for (let i = emb.length - 1; i >= 0; i--) { const e = emb[i]; e.life -= dt; if (e.life <= 0) { scene.remove(e.sp); e.sp.material.dispose(); emb.splice(i, 1); continue; }
      const u = 1 - e.life / e.l0; e.sp.position.x += e.vx * dt; e.sp.position.y += e.vy * dt; e.sp.position.z += e.vz * dt; e.vx *= 0.97; e.vy *= 0.97; e.vz *= 0.97;
      e.sp.scale.setScalar(e.s0 * (e.l0 < 0.6 ? 1 + u * 1.5 : 1 - u * 0.6)); e.sp.material.opacity = (1 - u) * (1 - u * 0.3); if (e.l0 >= 0.6) e.sp.material.color.copy(e.c0).lerp(u < 0.5 ? GOLD : ASH, u); } }
  // s598q VOID MOTH DEATH (Ben: all three ideas, mixed): (1) ONE LAST PULSE that fizzles: the ring swells, flickers and breaks (0-0.7 s, harmless);
  // (2) the WINGS BURN from the tips in, crumbling into glowing pink + orange ash (0.7-1.6 s), the body trembling; (3) the body bursts into a cloud of
  // GLITTERING MOTH DUST that drifts slowly, and its two EYES are the last thing to fade.
  const _bb = new THREE.Box3(), _bc = new THREE.Vector3(), _bs = new THREE.Vector3();
  function mothDeath(c, dt) { const F = c.mothFx, t = c.st, m = c.mm, D = c.D;
    const bob = -1.2 + Math.sin(St.t * 2.2 + c.a) * 0.3; c.root.position.set(c.x + (t > 0.7 ? (Math.random() - 0.5) * 0.35 : 0), bob - Math.max(0, t - 0.7) * 1.2, c.z); c.root.rotation.y = c.h + Math.PI;
    if (t < 0.7) { const u = t / 0.7; c.pulse.visible = Math.random() > u * 0.55; c.pulse.position.set(c.x, 0.3, c.z); c.pulse.scale.setScalar(2 + u * 11); c.pulse.material.opacity = 0.8 * (1 - u) * (0.5 + 0.5 * Math.random());
      if (Math.random() < 0.5) { const a = Math.random() * 6.28, r = 2 + u * 11; ember(c.x + Math.cos(a) * r, 0.4, c.z + Math.sin(a) * r, D.col, 0.6 + Math.random() * 0.6, 1, 0.35); }
      m.ph += dt * 16; for (const w of m.wings) w.p.rotation.z = w.s * (0.75 + Math.sin(m.ph) * 0.12); if (m.aura) { m.aura.material.opacity = 0.9; m.aura.scale.setScalar(20 + Math.sin(t * 40) * 4); }
      if (!F.fz) { F.fz = true; window.__spaceSnd && window.__spaceSnd('mothPulse', { at: [c.x, c.z], v: 0.6, p: 0.6 }); } return; }
    c.pulse.visible = false;
    if (t < 1.6) { const u = (t - 0.7) / 0.9; m.ph += dt * 5; c.root.updateMatrixWorld(true);
      for (const w of m.wings) { const burn = Math.max(0.02, 1 - u * (w.fore ? 1 : 1.12)); w.p.scale.set(burn, 1, burn); w.p.rotation.z = w.s * (0.6 + Math.sin(m.ph) * 0.2 - u * 0.5);
        if ((F.sp -= 1) <= 0 && burn > 0.05) { _bb.setFromObject(w.p); _bb.getCenter(_bc); _bb.getSize(_bs); const ox = _bc.x - c.x, oz = _bc.z - c.z, ol = Math.hypot(ox, oz) || 1, ex = _bc.x + ox / ol * _bs.length() * 0.35, ez = _bc.z + oz / ol * _bs.length() * 0.35;
          ember(ex, _bc.y, ez, '#fff0c8', 1.6, 0, 0.2); for (let q = 0; q < (LOW ? 2 : 4); q++) ember(ex + (Math.random() - 0.5) * 1.5, _bc.y, ez + (Math.random() - 0.5) * 1.5, Math.random() < 0.5 ? '#ff9a5a' : D.col, 0.6 + Math.random() * 0.9, 1.5 + Math.random() * 2.5, 1.2 + Math.random() * 1.2); } }
      if (F.sp <= 0) F.sp = LOW ? 2 : 1;
      if (m.aura) { m.aura.material.opacity = 0.7 * (1 - u * 0.5); m.aura.material.color.set(u > 0.5 ? '#ff9a5a' : D.col); }
      if (!F.burn) { F.burn = true; window.__spaceSnd && window.__spaceSnd('specFlak', { at: [c.x, c.z], v: 0.35, p: 0.6 }); } return; }
    if (!F.dust) { F.dust = true; c.root.visible = false; const y = c.root.position.y + 1; ember(c.x, y, c.z, '#ffffff', 10, 0, 0.25); burst(c.x, c.z, D.col, 12, 1.2);
      for (let q = 0; q < (LOW ? 40 : 90); q++) ember(c.x + (Math.random() - 0.5) * 3, y + (Math.random() - 0.5) * 2, c.z + (Math.random() - 0.5) * 3, ['#f0abfc', '#c4a8ff', '#ffffff', '#ffd6f5'][q % 4], 0.35 + Math.random() * 0.5, 0.6 + Math.random() * 2.4, 2 + Math.random() * 1.6);
      const fx = Math.sin(c.h), fz = Math.cos(c.h), sx = Math.cos(c.h), sz = -Math.sin(c.h); for (const s of [-1, 1]) ember(c.x + fx * 2.6 + sx * s * 0.9, y + 0.4, c.z + fz * 2.6 + sz * s * 0.9, '#ff5ad0', 2.2, 0, 2.6);
      window.__spaceSnd && window.__spaceSnd('beastDie', { at: [c.x, c.z], v: 0.6, p: 1.3 }); }
    if (t > 2.6) { c.dead = true; c.back = 180; c.bar.g.visible = false; for (const w of m.wings) w.p.scale.setScalar(1); } }
  // ---------- VOID MOTH ----------
  function mothStep(c, dt, d, dx, dz, near) { const t = St.t, m = c.mm, D = c.D, k = 1 - Math.exp(-dt * 1.4);
    let rate = 1, amp = 1, lift = 0.15, glow = 0.25;
    if (c.state === 'die' && c.mothFx) { mothDeath(c, dt); return; }
    if (c.state === 'die') { c.root.scale.setScalar(Math.max(0.01, 1 - c.st / 0.8)); c.root.position.y -= dt * 4; if (c.st > 0.8) { c.dead = true; c.back = 180; c.root.visible = false; c.bar.g.visible = false; } return; }
    // s598 VOID MOTH FIGHTS BETTER (Ben, tuned in Space Battle Workshop): CIRCLES you at its range, the pair SPREADS round you (one each side, never stacked),
    // DODGES sideways when your nose is on it, fires BURSTS that lead your flight, then DIVES in for the PULSE when its cooldown is up; WEAK (gold) after.
    const T = TN.vmoth; c.dir ??= (c.a > Math.PI ? 1 : -1);
    if (c.state === 'move') { let tx, tz, cap; const ready = near && !c.held && c.cool <= 0 && c.role !== 'strafe'; c.dodgeCd = (c.dodgeCd || 0) - dt;
      if (ready) { tx = St.x + St.vx * 0.3; tz = St.z + St.vz * 0.3; cap = T.diveSpd;
        if (d < T.trigger) { setState(c, 'windup'); if (!c.toldCharge) { c.toldCharge = true; toast('The moth is charging. Get clear!', 1.6); } window.__spaceSnd && window.__spaceSnd('mothCharge', { at: [c.x, c.z], v: 0.7 }); } }
      else if (near && c.role === 'strafe') {   // s598i FLY-OVER: a straight run across you firing, out past you, a wide turn, then the next pass
        const P2 = c.pass || (c.pass = { ph: 'turn', t: 0, ux: 0, uz: 0, side: Math.random() < 0.5 ? 1 : -1 }); P2.t += dt;
        if (P2.ph === 'run') { const ox = -P2.uz * P2.side * T.passOff, oz = P2.ux * P2.side * T.passOff; tx = P2.ax + P2.ux * (P2.L + T.overshoot) + ox; tz = P2.az + P2.uz * (P2.L + T.overshoot) + oz; cap = T.passSpd;
          const along = (c.x - St.x) * P2.ux + (c.z - St.z) * P2.uz; if (along > T.overshoot * 0.8 || P2.t > 6) { P2.ph = 'turn'; P2.t = 0; P2.side = -P2.side; } }
        if (P2.ph === 'turn') { const ax = c.x - St.x, az = c.z - St.z, al = Math.hypot(ax, az) || 1, a0 = Math.atan2(az, ax) + P2.side * 0.9; tx = St.x + Math.cos(a0) * T.passWide; tz = St.z + Math.sin(a0) * T.passWide; cap = T.passSpd * 0.8;
          if ((al > T.passWide * 0.85 && P2.t > 0.6) || P2.t > 4) { P2.ph = 'run'; P2.t = 0; P2.ax = c.x; P2.az = c.z; const lx = St.x + St.vx * 0.5 - c.x, lz = St.z + St.vz * 0.5 - c.z; P2.L = Math.hypot(lx, lz) || 1; P2.ux = lx / P2.L; P2.uz = lz / P2.L; } } }
      else if (near) { const cur = Math.atan2(c.z - St.z, c.x - St.x); let push = 0;
        for (const o of list) { if (o === c || o.fam !== 'vmoth' || o.role === 'strafe' || !o._near || o.dead || o.state === 'die') continue; let df = cur - Math.atan2(o.z - St.z, o.x - St.x); while (df > Math.PI) df -= 6.283; while (df < -Math.PI) df += 6.283; if (Math.abs(df) < 2.4) push += Math.sign(df || 1) * (2.4 - Math.abs(df)); }
        const aT = cur + c.dir * (T.speed / Math.max(10, T.range)) * 0.7 + push * T.flank * 0.45; tx = St.x + Math.cos(aT) * T.range; tz = St.z + Math.sin(aT) * T.range; cap = T.speed; }
      else if (c.orbit) { c.orbit.a += c.orbit.spd * dt; tx = c.home.x + Math.cos(c.orbit.a) * c.orbit.r; tz = c.home.z + Math.sin(c.orbit.a) * c.orbit.r; cap = 10; }
      else { c.a = (c.a + dt * 0.28) % 6.283; tx = c.home.x + Math.cos(c.a) * 30 + Math.sin(t * 0.7 + c.a) * 6; tz = c.home.z + Math.sin(c.a) * 22; cap = 10; }
      const wx = tx - c.x, wz = tz - c.z, wl = Math.hypot(wx, wz) || 1, ws = Math.min(cap, wl * 1.2), kk = 1 - Math.exp(-dt * T.accel);
      c.vx = lerp(c.vx, wx / wl * ws, kk); c.vz = lerp(c.vz, wz / wl * ws, kk);
      if (near && !ready && c.role !== 'strafe' && c.dodgeCd <= 0 && d < 85) { const pfx = Math.sin(St.h), pfz = -Math.cos(St.h), mx = -dx / d, mz = -dz / d;
        if (pfx * mx + pfz * mz > 0.975) { c.dodgeCd = T.dodgeCd; if (Math.random() < T.dodge) { const s = Math.random() < 0.5 ? 1 : -1; c.jx = -mz * s * T.dodgeSpd; c.jz = mx * s * T.dodgeSpd; c.jt = 0.38; c.dir = s; } } }
      if (c.jt > 0) { c.jt -= dt; const f = Math.max(0, c.jt / 0.38); c.x += c.jx * f * dt; c.z += c.jz * f * dt; }
      c.x += c.vx * dt; c.z += c.vz * dt;
      turnTo(c, near && d < 90 && !(c.role === 'strafe' && c.pass && c.pass.ph === 'turn') ? Math.atan2(dx, dz) : Math.atan2(c.vx, c.vz), c.role === 'strafe' ? 4 : 2.8, dt);
      if (near) { if (!c.met) { c.met = true; toast('VOID MOTHS! Giant wings, laser eyes.', 3); }
        c.fireT -= dt; let ang = Math.atan2(dx, dz) - c.h; while (ang > Math.PI) ang -= 6.283; while (ang < -Math.PI) ang += 6.283;
        const strafeOn = c.role === 'strafe' && c.pass && c.pass.ph === 'run'; if (c.role === 'strafe' && !strafeOn) c.fireT = Math.max(c.fireT, 0.05);
        if (strafeOn && c.fireT <= 0 && d < T.fireMax && Math.abs(ang) < 0.5) { c.fireT = T.passFire; const sd = (c._sd = -(c._sd || 0.6)), fx = Math.sin(c.h), fz = Math.cos(c.h), ax = St.x + St.vx * T.lead - c.x, az = St.z + St.vz * T.lead - c.z, L = Math.hypot(ax, az) || 1; combat.fireBolt(c.x + fx * 3 + Math.cos(c.h) * sd, c.z + fz * 3 - Math.sin(c.h) * sd, ax / L * T.boltSpd, az / L * T.boltSpd, T.laser, false, '#f0abfc'); }
        else if (!strafeOn && c.role !== 'strafe' && !ready && c.fireT <= 0 && d < T.fireMax && Math.abs(ang) < T.cone * Math.PI / 180) { c.fireT = T.fireInt * (0.85 + Math.random() * 0.3);
          for (let i = 0; i < T.burst; i++) setTimeout(() => { if (c.dead || c.state !== 'move') return; const ax = St.x + St.vx * T.lead - c.x, az = St.z + St.vz * T.lead - c.z, L = Math.hypot(ax, az) || 1, fx = Math.sin(c.h), fz = Math.cos(c.h), sd = i % 2 ? 0.6 : -0.6, sx = Math.cos(c.h) * sd, sz = -Math.sin(c.h) * sd;
            combat.fireBolt(c.x + fx * 3 + sx, c.z + fz * 3 + sz, ax / L * T.boltSpd, az / L * T.boltSpd, T.laser, false, '#f0abfc'); }, i * 120); } }
      rate = ready ? 1.8 : c.jt > 0 ? 2 : near ? 1.25 : 0.9; }
    else if (c.state === 'windup') { const u = clamp(c.st / T.windup, 0, 1); c.vx *= Math.exp(-dt * 3); c.vz *= Math.exp(-dt * 3); c.x += c.vx * dt + dx / d * T.windDrift * dt; c.z += c.vz * dt + dz / d * T.windDrift * dt; turnTo(c, Math.atan2(dx, dz), 2, dt);
      c.tell.visible = true; c.tell.position.set(c.x, 0.15, c.z); c.tell.scale.setScalar(T.pulseR * (0.35 + 0.65 * u)); c.tell.material.opacity = 0.25 + 0.5 * u; rate = 0.35; amp = 0.4; lift = 0.55; glow = 0.4 + u * 0.6 + Math.sin(t * 30) * 0.15 * u;
      if (c.st > T.windup) { setState(c, 'attack'); c.hit = false; c.tell.visible = false; c.pulse.visible = true; burst(c.x, c.z, D.col, 16, 1.4); window.__spaceSnd && window.__spaceSnd('mothPulse', { at: [c.x, c.z], v: 0.8 }); } }
    else if (c.state === 'attack') { const u = clamp(c.st / 0.5, 0, 1), R = 2 + u * (T.pulseR - 2); c.pulse.position.set(c.x, 0.3, c.z); c.pulse.scale.setScalar(R); c.pulse.material.opacity = 0.9 * (1 - u * 0.7); rate = 2; amp = 1.4; lift = -0.1; glow = 1;
      if (!c.hit && d < R + 1.5) { c.hit = true; hurt(T.pulseDmg, c.x, c.z); }
      if (c.st > 0.5) { c.pulse.visible = false; setState(c, 'recover'); } }
    else if (c.state === 'recover') { c.x += c.vx * dt * 0.3; c.z += c.vz * dt * 0.3; rate = 0.3; amp = 0.3; lift = -0.35; glow = 0.5;
      if (c.st > T.recover) { setState(c, 'move'); c.cool = T.cool * (0.85 + Math.random() * 0.3); c.dir = -c.dir; } }
    const bob = Math.sin(t * 2.2 + c.a) * 0.6 + (c.state === 'recover' ? -1.2 : 0);
    c.root.position.set(c.x, -1.2 + bob, c.z); c.root.rotation.y = c.h + Math.PI;    // model nose = -z
    m.ph += dt * 7 * ((LOOKS && LOOKS.voidMoth && LOOKS.voidMoth.flap) || 1) * rate;
    for (const w of m.wings) { const a = Math.sin(m.ph - (w.fore ? 0 : 0.5)) * 0.55 * amp + lift; w.p.rotation.z = w.s * a; }
    if (m.aura) { m.aura.material.opacity = glow * 0.85; m.aura.scale.setScalar(12 + glow * 14); m.aura.material.color.set(weakNow(c) ? '#ffd23a' : D.col); } }


  // ---------- THE OCTOPUS (s592) ----------
  const OA = 8, OJ = LOW ? 9 : 12, OLEN = 15, OCOL = '#5fd4ff';
  const elecSrc = { vertexShader: 'attribute vec2 aUV; varying vec2 vU; void main(){ vU = aUV; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float uT, uA, uCut; uniform vec3 uC; varying vec2 vU; float h(float x){ return fract(sin(x * 127.1) * 43758.5); } void main(){ if (vU.x > uCut) discard; float x = abs(vU.y * 2.0 - 1.0); float edge = smoothstep(0.08, 0.0, uCut - vU.x) * step(uCut, 0.999); float core = smoothstep(0.42, 0.0, x); float gl = 1.0 - x;' +
      ' float fl = 0.7 + 0.3 * sin(vU.x * 46.0 - uT * 34.0) + 0.35 * h(floor(vU.x * 26.0) + floor(uT * 18.0)); vec3 c = uC * gl * fl + vec3(1.0) * (core * 0.85 + edge * 1.5); float a = max(gl * gl * (1.0 - vU.x * 0.3) * uA, edge * gl); gl_FragColor = vec4(c * a, a); }' };
  function octoModel() { const g = new THREE.Group(), bodyC = '#173f8a';
    const bell = M(new THREE.SphereGeometry(3, LOW ? 14 : 20, LOW ? 10 : 14), toon(bodyC), 0, 0.6, -0.9, g, 0.07); bell.scale.set(1, 0.72, 1.3);
    const cap = M(new THREE.SphereGeometry(2.2, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#245bb8'), 0, 1.5, -1.5, g, 0); cap.scale.set(1, 0.7, 1.2);
    const eyeM = new THREE.MeshBasicMaterial({ color: '#e8fbff' }), eyes = [];
    for (const sx of [-1, 1]) { const e = M(new THREE.SphereGeometry(0.62, 12, 8), eyeM, sx * 1.35, 1.0, 1.55, g, 0.05); eyes.push(e); M(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshBasicMaterial({ color: '#0a1430' }), sx * 1.4, 1.12, 2.05, g, 0); }
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const sp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 4), new THREE.MeshBasicMaterial({ color: OCOL, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); sp.position.set(Math.cos(a) * 2.0, 1.55 + Math.sin(a * 2) * 0.2, -1.2 + Math.sin(a) * 2.3); g.add(sp); }
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: OCOL, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); aura.scale.setScalar(14); aura.position.y = 0.6; g.add(aura);
    // the 8 ELECTRIC ARMS: one ribbon mesh (flat on the play plane), rebuilt each frame from the joints
    const nV = OA * (OJ + 1) * 2, P = new Float32Array(nV * 3), UV = new Float32Array(nV * 2), idx = [];
    for (let a = 0; a < OA; a++) for (let j = 0; j <= OJ; j++) { const v = (a * (OJ + 1) + j) * 2; UV.set([j / OJ, 0, j / OJ, 1], v * 2); if (j < OJ) idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); }
    const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(P, 3)); tg.setAttribute('aUV', new THREE.BufferAttribute(UV, 2)); tg.setIndex(idx);
    const tm = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uA: { value: 1 }, uCut: { value: 1 }, uC: { value: new THREE.Color(OCOL) } }, ...elecSrc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const tent = new THREE.Mesh(tg, tm); tent.frustumCulled = false; tent.renderOrder = 6; scene.add(tent);
    const lane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: '#ec3013', transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide })); lane.rotation.x = -Math.PI / 2; lane.visible = false; scene.add(lane);
    return { g, bell, eyes, eyeM, aura, tent, lane, P, J: Array.from({ length: OA }, () => Array.from({ length: OJ + 1 }, () => new THREE.Vector3())) }; }
  const _f = new THREE.Vector3(), _r = new THREE.Vector3(), _q = new THREE.Vector3();
  function octoDraw(c, dt) { const m = c.mm, t = St.t, S = c.state, gr = S === 'grab', fx = Math.sin(c.h), fz = Math.cos(c.h), rx = fz, rz = -fx;
    const rate = S === 'charge' ? 3.2 : S === 'windup' ? 0.4 : S === 'recover' || S === 'stagger' ? 0.5 : gr ? 1.6 : 1.1; c.ph += dt * 2.4 * rate; const jet = Math.sin(c.ph);
    m.bell.scale.set(1 + jet * 0.07, 0.72 - jet * 0.05, 1.3 - jet * 0.08);
    const weak = weakNow(c); m.eyeM.color.set(weak ? '#ffd23a' : S === 'windup' || S === 'charge' ? '#ff6a4a' : '#e8fbff'); m.aura.material.color.set(weak ? '#ffd23a' : OCOL); m.aura.material.opacity = (gr ? 0.6 : 0.3) + (S === 'windup' ? 0.4 * Math.abs(Math.sin(t * 24)) : 0);
    m.tent.material.uniforms.uT.value = t; m.tent.material.uniforms.uC.value.set(weak ? '#ffd23a' : OCOL); const F = S === 'die' ? c.octoFx : null; m.tent.material.uniforms.uA.value = F ? (c.st < 0.9 ? 1.25 + 0.35 * Math.sin(t * 60) : 1) : 1; m.tent.material.uniforms.uCut.value = F ? clamp(1 - (c.st - 0.9) / 0.7, 0, 1) : 1; m.tent.visible = !c.dead;
    const y = 0.4, ship = gr ? [St.x, St.z] : null;
    for (let a = 0; a < OA; a++) { const J = m.J[a], u = a / (OA - 1) - 0.5, ra = u * 2.6, rootX = c.x + rx * Math.sin(ra) * 2.3 - fx * (1.4 + Math.cos(ra) * 0.4), rootZ = c.z + rz * Math.sin(ra) * 2.3 - fz * (1.4 + Math.cos(ra) * 0.4);
      if (ship) { // LATCHED: every arm reaches round your hull, crackling
        const ta = a / OA * Math.PI * 2 + t * 0.6, tx = ship[0] + Math.cos(ta) * 2.6, tz = ship[1] + Math.sin(ta) * 2.6, bend = (u < 0 ? -1 : 1) * (3 + Math.abs(u) * 6);
        for (let j = 0; j <= OJ; j++) { const k = j / OJ, mx = (rootX + tx) / 2 + rx * bend, mz = (rootZ + tz) / 2 + rz * bend, ia = 1 - k, px = ia * ia * rootX + 2 * ia * k * mx + k * k * tx, pz = ia * ia * rootZ + 2 * ia * k * mz + k * k * tz, jit = Math.sin(k * Math.PI) * 0.55;
          J[j].set(px + (Math.random() - 0.5) * jit, y, pz + (Math.random() - 0.5) * jit); } }
      else { const spread = F ? 1.6 + Math.sin(t * 9 + a) * 0.25 : S === 'charge' ? 0.22 : S === 'windup' ? 1.25 : 0.62 + (1 - jet) * 0.25, ang = c.h + Math.PI + u * spread * 2, dX = Math.sin(ang), dZ = Math.cos(ang), pX = Math.cos(ang), pZ = -Math.sin(ang), seg = OLEN / OJ * (S === 'windup' ? 0.75 : 1), amp = F ? 3.4 : S === 'charge' ? 0.5 : 1.8;
        for (let j = 0; j <= OJ; j++) { const k = j / OJ, wob = Math.sin(c.ph * 1.3 - j * 0.75 + a * 0.9) * amp * k; J[j].set(rootX + dX * seg * j + pX * wob, y, rootZ + dZ * seg * j + pZ * wob); } }
      for (let j = 0; j <= OJ; j++) { const p = J[j], q = J[Math.min(OJ, j + 1)], o = J[Math.max(0, j - 1)], ddx = q.x - o.x, ddz = q.z - o.z, L = Math.hypot(ddx, ddz) || 1, w = (gr ? 0.79 : 1) * TN.octo.armW * (1 - j / OJ * TN.octo.armTaper),   /* s598o thicker arms (Ben), tunable */ nx = -ddz / L * w, nz = ddx / L * w, v = (a * (OJ + 1) + j) * 2;
        m.P.set([p.x + nx, y, p.z + nz, p.x - nx, y, p.z - nz], v * 3); } }
    m.tent.geometry.attributes.position.needsUpdate = true;
    if (S === 'die' && F) octoDeath(c, m, F);   // s598p
    else if (S === 'die') { c.root.scale.setScalar(Math.max(0.01, 1 - c.st / 0.9)); c.root.position.set(c.x, -3 - c.st * 4, c.z); if (c.st > 0.9) { c.dead = true; c.back = 180; c.root.visible = false; c.bar.g.visible = false; m.tent.visible = false; } }
    else c.root.position.set(c.x, -1.6 + Math.sin(t * 1.7 + c.a) * 0.4, c.z);
    c.root.rotation.y = c.h; }
  function octoRelease(c, shotOff, quiet) { const fx = Math.sin(St.h), fz = -Math.cos(St.h); c.grab = null; c.grabCd = St.t + 12;
    if (shotOff) { c.vx = fx * 34; c.vz = fz * 34; setState(c, 'stagger'); if (!quiet) { toast('SHOT IT OFF! Hit it while it reels.', 2.4); burst(c.x, c.z, OCOL, 18, 1.4); } }
    else { inkCloud(St.x, St.z, true); c.vx = fx * 20; c.vz = fz * 20; setState(c, 'recover'); toast('It let go and INKED you. Fly out of the cloud!', 2.4); } }
  function octoStep(c, dt, d, dx, dz, near) { const D = c.D, O = TN.octo, S = c.state, snd = (k, o) => window.__spaceSnd && window.__spaceSnd(k, { at: [c.x, c.z], ...o });
    if (S === 'die') return;
    if (S === 'grab') { const G = c.grab; if (!G || St.phase !== 'free' || c.held) { octoRelease(c, false); return; }
      const nose = X.nose ? X.nose() : 3.5, fx = Math.sin(St.h), fz = -Math.cos(St.h), tx = St.x + fx * (nose + 7.5), tz = St.z + fz * (nose + 7.5), k = 1 - Math.exp(-dt * 12);
      c.x += (tx - c.x) * k; c.z += (tz - c.z) * k; turnTo(c, Math.atan2(St.x - c.x, St.z - c.z), 9, dt);
      St.vx *= Math.exp(-dt * 2.4); St.vz *= Math.exp(-dt * 2.4);
      if ((G.tick -= dt) <= 0) { G.tick = 0.8; hurt(O.drain, c.x, c.z); } if ((G.zap -= dt) <= 0) { G.zap = 1.3; snd('specArc', { v: 0.3 }); }
      if (c.st > O.grabT) octoRelease(c, false); return; }
    if (S === 'windup') { const u = clamp(c.st / O.windup, 0, 1); c.x -= c.cd[0] * dt * 4; c.z -= c.cd[1] * dt * 4; turnTo(c, Math.atan2(c.cd[0], c.cd[1]), 6, dt);
      const Lz = 64; c.lane.visible = true; c.lane.position.set(c.x + c.cd[0] * Lz / 2, 0.12, c.z + c.cd[1] * Lz / 2); c.lane.rotation.set(-Math.PI / 2, 0, -Math.atan2(c.cd[0], c.cd[1])); c.lane.scale.set(4.2 * (0.5 + 0.5 * u), Lz, 1); c.lane.material.opacity = 0.2 + 0.45 * u;
      if (c.st > O.windup) { c.lane.visible = false; setState(c, 'charge'); snd('boost', { v: 0.8 }); } return; }
    if (S === 'charge') { const sp = O.chargeSpd; c.x += c.cd[0] * sp * dt; c.z += c.cd[1] * sp * dt;
      if (!c.held && St.phase === 'free' && Math.hypot(St.x - c.x, St.z - c.z) < 6.5) { hurt(O.dmg, c.x, c.z); if (St.t > c.grabCd) { setState(c, 'grab'); c.grab = { hp: O.grabHp, tick: 0.5, zap: 0 }; snd('holster', { v: 0.9 }); toast('THE OCTOPUS HAS YOU! Shoot its head off!', 3); } else { c.vx = c.cd[0] * 20; c.vz = c.cd[1] * 20; setState(c, 'recover'); } return; }
      if (c.st > 0.75 * 78 / O.chargeSpd) { c.vx = c.cd[0] * 22; c.vz = c.cd[1] * 22; setState(c, 'recover'); inkCloud(c.x - c.cd[0] * 6, c.z - c.cd[1] * 6, false); } return; }
    if (S === 'recover' || S === 'stagger') { c.vx *= Math.exp(-dt * 1.6); c.vz *= Math.exp(-dt * 1.6); c.x += c.vx * dt; c.z += c.vz * dt; if (c.st > (S === 'stagger' ? 2.4 : 1.8)) { setState(c, 'move'); c.cool = O.cool + Math.random() * 2.5; } return; }
    // MOVE: drift, or stand off + circle you, spit ink, wind up a charge
    if (c.orbit && !near) { c.orbit.a += c.orbit.spd * dt; const tx = c.home.x + Math.cos(c.orbit.a) * c.orbit.r, tz = c.home.z + Math.sin(c.orbit.a) * c.orbit.r; c.x = lerp(c.x, tx, 1 - Math.exp(-dt * 0.8)); c.z = lerp(c.z, tz, 1 - Math.exp(-dt * 0.8)); turnTo(c, Math.atan2(tx - c.x, tz - c.z), 1.5, dt); return; }
    if (!near) { c.x += c.vx * dt; c.z += c.vz * dt; if (Math.hypot(c.x - c.home.x, c.z - c.home.z) > 260) { const a = Math.atan2(c.home.z - c.z, c.home.x - c.x) + (Math.random() - 0.5); c.vx = Math.cos(a) * 6; c.vz = Math.sin(a) * 6; } turnTo(c, Math.atan2(c.vx, c.vz), 1.2, dt); return; }
    if (!c.met) { c.met = true; toast('THE OCTOPUS! Dodge the charge, stay out of the ink. If it grabs you, shoot its head.', 3.5); window.__spaceSnd && window.__spaceSnd('serpent', { at: [c.x, c.z], v: 0.8, p: 0.6 }); }
    const ux = dx / d, uz = dz / d, side = c.a > Math.PI ? 1 : -1, rad = clamp((d - O.range) * 0.09, -1, 1.2), k = 1 - Math.exp(-dt * 1.5);
    c.vx = lerp(c.vx, (ux * rad - uz * side * 0.85) * O.speed, k); c.vz = lerp(c.vz, (uz * rad + ux * side * 0.85) * O.speed, k); c.x += c.vx * dt; c.z += c.vz * dt; turnTo(c, Math.atan2(dx, dz), 2.6, dt);
    c.fireT -= dt; if (!c.held && c.fireT <= 0 && d < 58) { c.fireT = O.inkEvery + Math.random() * 1.8; const lx = St.x + St.vx * O.inkLead - c.x, lz = St.z + St.vz * O.inkLead - c.z, L = Math.hypot(lx, lz) || 1; inkShot(c.x + Math.sin(c.h) * 3, c.z + Math.cos(c.h) * 3, lx / L * O.inkSpd, lz / L * O.inkSpd, Math.min(1.6, L / O.inkSpd)); snd('puff', { v: 0.9 }); }
    c.cool -= dt; if (!c.held && c.cool <= 0 && d < O.chargeAt) { const L = d; c.cd = [dx / L, dz / L]; setState(c, 'windup'); snd('mothCharge', { v: 0.7, p: 0.6 }); } }
  // INK: blobs that fly at you and burst into clouds; a cloud hurts while you are inside it
  const inkShots = [], inkBlobM = new THREE.SpriteMaterial({ map: glowTex, color: '#3a1a6a', transparent: true, depthWrite: false });
  function inkShot(x, z, vx, vz, life) { const s = new THREE.Sprite(inkBlobM); s.scale.setScalar(3.4); s.position.set(x, 1.2, z); scene.add(s); inkShots.push({ s, x, z, vx, vz, life }); }
  let inkT = 0, inkMet = false;
  function octoWorld(dt) { for (let i = inkShots.length - 1; i >= 0; i--) { const b = inkShots[i]; b.life -= dt; b.x += b.vx * dt; b.z += b.vz * dt; b.s.position.set(b.x, 1.2, b.z); b.s.scale.setScalar(3.4 + Math.sin(St.t * 20 + i) * 0.4);
      if (b.life <= 0 || Math.hypot(St.x - b.x, St.z - b.z) < 3.2) { inkCloud(b.x, b.z, true); burst(b.x, b.z, '#5a2a9a', 8, 0.8); scene.remove(b.s); inkShots.splice(i, 1); } }
    let inside = null; for (let i = inkZones.length - 1; i >= 0; i--) { const z = inkZones[i]; z.life -= dt; if (z.life <= 0) { inkZones.splice(i, 1); continue; } if (Math.hypot(St.x - z.x, St.z - z.z) < z.r) inside = z; }
    if (inside && St.phase === 'free') { if (!inkMet) { inkMet = true; toast('INK! It burns. Get out of the cloud.', 2.2); } St.vx *= Math.exp(-dt * 0.8); St.vz *= Math.exp(-dt * 0.8); if ((inkT -= dt) <= 0) { inkT = 0.55; hurt(TN.octo.ink, inside.x, inside.z); } } else inkT = Math.min(inkT, 0.15); }
  const octoInk = DEF.octo.ink;

  // s592: spawned here, after every model helper exists
  homes.forEach(h => { if (h.fam === 'vmoth') { spawn('vmoth', h, { a: 0 }); spawn('vmoth', h, { a: Math.PI }); } else spawn(h.fam, h); });
  return {
    spawn, remove, provoke, kill(c) { if (c && !c.dead && c.state !== 'die') damage(c, 1e6, c.x, c.z); },
    get list() { return list.filter(c => !c.dead && c.state !== 'die'); },
    threat() { return list.some(c => !c.dead && c.state !== 'die' && Math.hypot(c.x - St.x, c.z - St.z) < 50); },
    nearest(x, z, r) { let b = null, bd = r; for (const c of list) { if (c.dead || c.state === 'die') continue; hitPoint(c, _p); const d = Math.hypot(_p.x - x, _p.z - z); if (d < bd) { bd = d; b = { x: _p.x, z: _p.z }; } } return b; },
    hitShot(s) { for (const c of list) { if (c.dead || c.state === 'die') continue; hitPoint(c, _p); const R = (s.missile ? 4.5 : 3.2) + (c.fam === 'vmoth' ? 3.2 : c.fam === 'octo' ? 2.8 : 0.5);
        if ((Math.hypot(_p.x - s.m.position.x, _p.z - s.m.position.z) < R || Math.hypot(c.x - s.m.position.x, c.z - s.m.position.z) < R) && (window.__spaceSnd && window.__spaceSnd('hitBeast', { at: [c.x, c.z], v: 0.95 }), true) * 0.8) { damage(c, s.dmg || (s.missile ? 45 : 10), s.m.position.x, s.m.position.z); return true; } } return false; },
    update(dt) {
      const free = St.phase === 'free';
      for (const c of list.slice()) {
        if (c.dead) { if (c.noBack) { remove(c); continue; } if ((c.back -= dt) <= 0) { c.dead = false; c.octoFx = null; if (c.mothFx) { c.mothFx = null; for (const w of c.mm.wings) w.p.scale.setScalar(1); if (c.pulse) c.pulse.visible = false; } if (c.mm && c.mm.bell) { c.mm.tent.material.uniforms.uCut.value = 1; } if (c.dieFx) { c.dieFx = null; const J = c.g.userData.joints; J.segs.forEach(s => s.scale.setScalar(1)); J.head.scale.setScalar(1); } if (c.tent) { c.tent.visible = true; c.ph = 0; } if (TN[c.fam]) c.D = { ...c.D, hp: TN[c.fam].hp }; c.hp = c.D.hp; c.root.visible = true; c.root.scale.setScalar(1); c.x = c.home.x; c.z = c.home.z; setState(c, 'move'); } continue; }
        c.st += dt; const dx = St.x - c.x, dz = St.z - c.z, d = Math.hypot(dx, dz) || 1, safe = X.safe(St.x, St.z);
        const inLeash = !c.leash || Math.hypot(St.x - c.leash.x, St.z - c.leash.z) < c.leash.r, prov = c.prov > St.t && inLeash;
        const homeH = combat.havenAt ? combat.havenAt(c.home.x, c.home.z) : null, PH = combat.playerHaven ? combat.playerHaven() : null; c.held = !!(PH && PH !== homeH && d < 300);   // s410: defended space
        const near = free && !safe && inLeash && !c.held && (d < (c.fam === 'octo' ? 34 : c.fam === 'vmoth' ? 62 : 50) || prov);
        const lurk = c.held && c.fam !== 'belt' ? (() =>   /* s441b: belt serpents never leave their belt to lurk */ { const hx = c.x - PH.x, hz = c.z - PH.z, hd = Math.hypot(hx, hz) || 1; return [PH.x + hx / hd * (PH.r + 34), PH.z + hz / hd * (PH.r + 34)]; })() : null;   // s413: creatures LURK outside defended space
        c._near = near; if (c.fam === 'vmoth') { mothStep(c, dt, d, dx, dz, near); keepOut(c); if (lurk) { const kk = 1 - Math.exp(-dt * 1.2); c.x += (lurk[0] - c.x) * kk; c.z += (lurk[1] - c.z) * kk; } combat.pushOut && combat.pushOut(c, 4, homeH); c.root.position.x = c.x; c.root.position.z = c.z; hurtTick(c, dt); showBar(c, d); continue; }
        if (c.fam === 'octo') { octoStep(c, dt, d, dx, dz, near); if (lurk && c.state === 'move') { const kk = 1 - Math.exp(-dt * 0.9); c.x += (lurk[0] - c.x) * kk; c.z += (lurk[1] - c.z) * kk; } if (c.state !== 'grab') { if (combat.pushOut) combat.pushOut(c, 4, homeH); keepOut(c); } octoDraw(c, dt); hurtTick(c, dt); showBar(c, d); continue; }
        const dur = s => ck.dur(c.g, s) || 1;
        if (c.state === 'die') { if (c.st > dur('die')) { c.dead = true; c.back = 180; c.root.visible = false; c.bar.g.visible = false; } }
        else if (c.state === 'hurt') { if (c.st > 0.3) setState(c, 'move'); }
        else if (c.state === 'move' || c.state === 'idle') {
          if (c.orbit && !near) { c.orbit.a += c.orbit.spd * dt; const tx = c.home.x + Math.cos(c.orbit.a) * c.orbit.r, tz = c.home.z + Math.sin(c.orbit.a) * c.orbit.r; c.vx = (tx - c.x) * 0.8; c.vz = (tz - c.z) * 0.8; c.x = lerp(c.x, tx, 1 - Math.exp(-dt * 0.8)); c.z = lerp(c.z, tz, 1 - Math.exp(-dt * 0.8)); }
          else if (c.fam === 'belt') { const B = TN.belt; c.a += dt * B.roam; const ux = d > 1 ? dx / d : Math.cos(c.a), uz = d > 1 ? dz / d : Math.sin(c.a), tx = near ? St.x - ux * B.follow : c.home.x + Math.cos(c.a) * 18, tz = near ? St.z - uz * B.follow : c.home.z + Math.sin(c.a) * 12; c.x = lerp(c.x, tx, 1 - Math.exp(-dt * (near ? B.chase : 0.4))); c.z = lerp(c.z, tz, 1 - Math.exp(-dt * (near ? B.chase : 0.4))); }
          else { if (!near) { c.x += c.vx * dt; c.z += c.vz * dt; if (Math.hypot(c.x - c.home.x, c.z - c.home.z) > 260) { const a = Math.atan2(c.home.z - c.z, c.home.x - c.x) + (Math.random() - 0.5); c.vx = Math.cos(a) * 6; c.vz = Math.sin(a) * 6; } } else { c.x = lerp(c.x, St.x - dx / d * 9, 1 - Math.exp(-dt * 0.7)); c.z = lerp(c.z, St.z - dz / d * 9, 1 - Math.exp(-dt * 0.7)); } }
          c.cool -= dt;
          const BT = c.fam === 'belt' ? TN.belt : null; if (near && !c.held && c.cool <= 0 && d < (BT ? BT.reach : c.D.reach + 8)) { setState(c, 'windup'); const ld = BT ? BT.lead : 0.6; c.tx = St.x + St.vx * ld; c.tz = St.z + St.vz * ld; if (!c.met) { c.met = true; toast(c.D.name.toUpperCase() + '!', 2.4); } } }
        else if (c.state === 'windup') { const k = clamp(c.st / dur('windup'), 0, 1); c.tell.visible = true; const R = c.fam === 'octo' ? 12 : c.fam === 'belt' ? TN.belt.hitR * 0.92 : 6; c.tell.position.set(c.tx, 0.15, c.tz); c.tell.scale.setScalar(R * (0.4 + 0.6 * k)); c.tell.material.opacity = 0.25 + 0.5 * k;
          if (c.fam !== 'octo') { const at = c.fam === 'belt' ? TN.belt.aimTrack : 1.2; c.tx = lerp(c.tx, St.x, dt * at); c.tz = lerp(c.tz, St.z, dt * at); }
          if (c.st > dur('windup')) { setState(c, 'attack'); c.ax = c.x; c.az = c.z; c.hit = false; } }
        else if (c.state === 'attack') { const k = clamp(c.st / dur('attack'), 0, 1);
          if (c.fam !== 'octo') { c.x = lerp(c.ax, c.tx, k * k * (3 - 2 * k)); c.z = lerp(c.az, c.tz, k * k * (3 - 2 * k)); }
          if (!c.hit && k > (c.fam === 'octo' ? 0.45 : 0.6)) { c.hit = true; c.tell.visible = false; const R = c.fam === 'octo' ? 12 : c.fam === 'belt' ? TN.belt.hitR : 6.5; if (!c.held && Math.hypot(St.x - c.tx, St.z - c.tz) < R) hurt(c.fam === 'belt' ? TN.belt.dmg : c.D.dmg, c.tx, c.tz); burst(c.tx, c.tz, c.D.col, 14, 1.4); }
          if (c.st > dur('attack')) { setState(c, 'recover'); if (c.fam === 'octo') inkCloud(c.x, c.z); } }
        else if (c.state === 'recover') { const BT2 = c.fam === 'belt' ? TN.belt : null; if (c.st > dur('recover') + (BT2 ? BT2.weakT : 0.6)) { setState(c, 'move'); c.cool = BT2 ? BT2.cool + Math.random() * BT2.coolRand : 1.5 + Math.random() * 1.5; } }
        const want = (near || c.state !== 'move') ? Math.atan2(dx, dz) : Math.atan2(c.vx || Math.cos(c.a + 1.57), c.vz || Math.sin(c.a + 1.57)); turnTo(c, want, 2.5, dt);
        if (lurk && (c.state === 'move' || c.state === 'idle')) { const kk = 1 - Math.exp(-dt * 0.9); c.x += (lurk[0] - c.x) * kk; c.z += (lurk[1] - c.z) * kk; }
        if (combat.pushOut) combat.pushOut(c, 4, homeH); keepOut(c);
        c.root.position.set(c.x, -3, c.z); c.root.rotation.y = c.h;
        ck.animate(c.g, c.state === 'move' && !near ? 'move' : c.state, c.st, dt, { speed: 1 }); if (c.g.userData.events) c.g.userData.events.length = 0;
        if (c.dieFx) beltDeath(c);
        const U = c.g.userData; if (U.weakMat) U.weakMat.emissive && U.weakMat.emissive.set(weakNow(c) ? '#ffd23a' : (U.weakBase || '#ffffff'));
        hurtTick(c, dt); showBar(c, d);
      }
      // s598 NEVER STACKED (Ben): every live creature keeps apart (moths: tuned KEEP APART); the grabbing octopus is left alone
      { const A = list.filter(c => !c.dead && c.state !== 'die' && c.state !== 'grab' && Math.abs(c.x - St.x) + Math.abs(c.z - St.z) < 400);
        for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) { const p = A[i], q = A[j], sep = p.fam === 'vmoth' && q.fam === 'vmoth' ? TN.vmoth.sep : Math.max(p.fam === 'vmoth' ? TN.vmoth.sep * 0.8 : 8, q.fam === 'vmoth' ? TN.vmoth.sep * 0.8 : 8);
          let ex = q.x - p.x, ez = q.z - p.z, dd = Math.hypot(ex, ez); if (dd >= sep) continue; if (dd < 0.01) { ex = Math.cos(i + j); ez = Math.sin(i + j); dd = 1; } const k = (sep - dd) / 2 / dd * Math.min(1, dt * 10); p.x -= ex * k; p.z -= ez * k; q.x += ex * k; q.z += ez * k; } }
      embTick(dt);
      if (mothProto) mothProto.tick(dt, 0);
      octoWorld(dt);
      for (let i = inkPuffs.length - 1; i >= 0; i--) { const p = inkPuffs[i]; p.life -= dt; p.s.material.opacity = clamp(p.life / 2, 0, 0.85); p.s.material.rotation += dt * 0.2; if (p.life <= 0) { scene.remove(p.s); p.s.material.dispose(); inkPuffs.splice(i, 1); } }
    },
  };
}
