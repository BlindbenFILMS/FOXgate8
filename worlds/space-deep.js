// 8 GATES · SPACE MAP · THE DEEP + THE GRID (s380). Everything on the space map that is not a charted world's own install:
// · THE GRID (Ben: "a point of interest in equally distanced spaces"): space-galaxy.js buildDeep() puts one thing on every free
//   lattice node (224 u) out to 1300 u, then every other node out to 2400 u. Charted space: NAV BUOYS, rock fields, fuel shoals.
//   The deep (2D seedTheDeep, past the Fox survey edge 816 u): 21 log BUOYS (FIRST LIGHT + 20, 4 are bait), 10 SALVAGE WRECKS
//   (TOW to any shipyard: gold + a relic note), 11 cold DERELICT hulks, 22 GAS wisps (BLUE cover · GREEN fuel shoal · YELLOW ion
//   haze · VIOLET deep murk), DEBRIS FIELDS (shootable rocks) on the rest.
// · GAS SHOAL round every world's fuel depot (2D hangGas) + DOUBLE rust gas round each pirate HELD DEPOT. GAS SKIMMER research works.
// · PIRATE BASES (2D seedPirateBases): KRASS GIBET MURK THRAX, 3D model 'pirBase', HULL 2200, rim guns + torpedoes, the garrison
//   from space-combat.js. RAZE it = "Pirate base destroyed · The fuel depot is now yours."
// · FRONTIER extras: SURVEY (slow over it), Earth moon + clouds, Beta 1 ice ring + moons, Beta 2 black hulls in the low lane,
//   Beta 3 no air, Beta 4 glowing gem seams.
// Saved: localStorage space.finds.v1 (FINDS).
import { buildDeep, GAS, BUOY_NOTES, RELIC_NOTES, FINDS, PIRATES, PIRATE_BASE_HP, FRONTIER, INSTALLS, WORLDS, MACHINE_YARD } from './space-galaxy.js?v=s441';
import { FRONTIER_GOODS, SEAM_MAX, SEAM_GROW_S } from './space-trade.js?v=s385';
import { tiers } from './space-yard.js?v=s385';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, TAU = Math.PI * 2;

export function createDeep(X) {
  const { THREE, scene, INST, zones, rocks, label, unlabel, PUFFS, dotTex, LOW, bodies, depots, IK, LOOKS, toon } = X; const nameOf = k => (X.nameOf && X.nameOf(k)) || null;
  let St, combat, toast, burst, save, V = 20, holdCap = () => 10, scanT = () => 0; const snd = (k, o) => window.__spaceSnd && window.__spaceSnd(k, o);
  let F = {}; try { F = JSON.parse(localStorage.getItem(FINDS) || '{}') || {}; } catch (e) {}
  for (const k of ['buoys', 'wrecks', 'surveyed', 'razed']) if (!Array.isArray(F[k])) F[k] = []; F.logs = F.logs | 0; F.relics = F.relics | 0; F.yardFreed = F.yardFreed | 0; if (!Array.isArray(F.known)) F.known = []; if (!F.seams || typeof F.seams !== 'object') F.seams = {};
  const saveF = () => { try { localStorage.setItem(FINDS, JSON.stringify(F)); } catch (e) {} };
  const ITEMS = buildDeep();
  const nearestWorldName = (x, z) => { let b = null, bd = 1e9; for (const w of WORLDS) if (w.dock) { const d = Math.hypot(w.x - x, w.z - z); if (d < bd) { bd = d; b = w; } } return b ? b.name : ''; };

  // ---------- gas clouds ----------
  const clouds = [];
  function cloud(x, z, r, gas, n) { const G = GAS[gas], c0 = new THREE.Color(G.col[0]), c1 = new THREE.Color(G.col[1]), grp = new THREE.Group(); scene.add(grp); const sp = [];
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU, rr = Math.sqrt(Math.random()) * r * 0.72, high = i % 5 === 0;
      const m = new THREE.SpriteMaterial({ map: PUFFS[i % 3], color: c0.clone().lerp(c1, Math.random()), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: high ? 0.08 : 0.17 + Math.random() * 0.15, rotation: Math.random() * TAU });
      const s = new THREE.Sprite(m), sc = r * (high ? 0.55 : 0.7 + Math.random() * 0.75); s.scale.set(sc, sc, 1); s.position.set(x + Math.cos(a) * rr, high ? 4 + Math.random() * 5 : -10 - Math.random() * 28, z + Math.sin(a) * rr); grp.add(s);
      sp.push({ s, m, spin: (Math.random() - 0.5) * 0.05, bx: s.position.x, bz: s.position.z, ph: Math.random() * TAU }); }
    const N = LOW ? 18 : 36, P = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const a = Math.random() * TAU, rr = Math.sqrt(Math.random()) * r * 0.8; P.set([x + Math.cos(a) * rr, -2 - Math.random() * 6, z + Math.sin(a) * rr], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); const motes = new THREE.Points(g, new THREE.PointsMaterial({ size: 1.1, map: dotTex, color: c0, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); grp.add(motes);
    const c = { x, z, r, gas, grp, sp, motes, name: G.name }; clouds.push(c); return c; }
  WORLDS.filter(w => w.dock).forEach(w => cloud(w.x + INSTALLS.fuel.dx, w.z + INSTALLS.fuel.dz, 46, 'skim', LOW ? 6 : 10));

  // ---------- grid items ----------
  const finds = [];   // zone-bearing items (buoys, wrecks)
  const relabel = (old, ...a) => { const l = label(...a); if (old) { l.position.copy(old.position); unlabel(old); } return l; };
  for (const it of ITEMS) {
    if (it.kind === 'nav' || it.kind === 'buoy') { const found = it.kind === 'nav' || F.buoys.includes(it.id);
      const e = { type: 'buoy', x: it.x, y: -1.5, z: it.z, sc: 1.15, fr: 4, frange: 26, look: { lit: found, accent: it.kind === 'nav' ? '#7fd0ff' : '#ffd23a' }, onBuild: a => a && a.setLit(it.lit) }; INST.push(e); it.e = e; it.lit = found;
      it.lab = label(it.kind === 'nav' ? 'NAV BUOY' : it.name, it.kind === 'nav' ? 'LANE TO ' + nearestWorldName(it.x, it.z) : found ? 'LIT' : 'UNLIT BUOY', '#ffffff', it.kind === 'nav' ? '#7fd0ff' : '#ffd23a', 0.62, 300); it.lab.position.set(it.x + 4, 1, it.z - 3);
      if (it.kind === 'buoy') { const z = { kind: 'find', item: it, name: it.name, x: it.x, z: it.z, r: 9 }; it.zone = z; zones.push(z); finds.push(it); } }
    else if (it.kind === 'wreck') { if (F.wrecks.includes(it.id)) continue;
      const e = { type: 'wreck', x: it.x, y: -2, z: it.z, sc: 0.8, fr: 7, frange: 30, look: { live: true } }; INST.push(e); it.e = e;
      it.lab = label(it.name, 'SALVAGE · TOW TO A SHIPYARD', '#ffffff', '#7dd3fc', 0.66, 320); it.lab.position.set(it.x + 7, 1, it.z - 5);
      const z = { kind: 'find', item: it, name: it.name, x: it.x, z: it.z, r: 12 }; it.zone = z; zones.push(z); finds.push(it); }
    else if (it.kind === 'derelict') { INST.push({ type: 'wreck', x: it.x, y: -4, z: it.z, sc: 0.85, fr: 8, frange: 28, look: { live: false, hull: '#3a3f48', length: it.len, shards: 4 } });
      const l = label('DERELICT', null, '#9aa3b2', null, 0.5, 220); l.position.set(it.x + 8, 1, it.z - 4); }
    else if (it.kind === 'debris') { if (LOW && !it.charted && Math.hypot(it.x, it.z) > 1300 && (it.seed * 10 | 0) % 2) continue;   // phones: half the far fields
      const n = LOW ? 3 : (it.charted ? 4 : 4) + ((it.seed * 3) | 0);
      for (let k = 0; k < n; k++) { const a = Math.random() * TAU, r = Math.random() * it.r; rocks.push({ x: it.x + Math.cos(a) * r, z: it.z + Math.sin(a) * r * 0.8, y: -2.5 - Math.random() * 3.5, s: k < 2 ? 3 + Math.random() * 1.6 : 1 + Math.random() * 2, rx: Math.random() * 6, ry: Math.random() * 6, sp: (Math.random() - 0.5) * 0.5, alive: 1, back: 0 }); }
      const l = label('DEBRIS FIELD', null, '#c9b7a3', null, 0.5, 220); l.position.set(it.x + it.r * 0.6, 1, it.z - 4); }
    else if (it.kind === 'wisp') { const c = cloud(it.x, it.z, it.r, it.gas, LOW ? 6 : 11); c.lair = it.lair;
      const l = label(GAS[it.gas].name, it.lair ? 'Something moves inside.' : GAS[it.gas].sub, GAS[it.gas].col[0], '#ffffff', 0.6, 360); l.position.set(it.x + it.r * 0.4, 1, it.z + it.r * 0.3); }
  }

  // ---------- pirate bases + their HELD DEPOTS ----------
  const bases = PIRATES.map(P => { const razed = F.razed.includes(P.name); P.razed = razed;
    const ang = Math.atan2(P.z, P.x), off = ang + Math.PI + 0.44, dx = P.x + Math.cos(off) * 84, dz = P.z + Math.sin(off) * 84;
    const b = { P, name: P.name, x: P.x, z: P.z, hp: razed ? 0 : PIRATE_BASE_HP, razed, known: razed || F.known.includes(P.name), gunT: 2, torpT: 5, flash: 0, dx, dz };
    b.e = { type: 'pirBase', x: P.x, y: -8, z: P.z, sc: 0.95, fr: 16, frange: 50, gone: razed, onBuild: a => { b.api = a; } }; INST.push(b.e);
    b.de = { type: 'fuel', x: dx, y: -9.5, z: dz, sc: 0.65, tint: '#b06a3e', look: razed ? {} : { metal: '#8f8a86', fuel: '#e6b183', accent: '#3a3a40' } }; INST.push(b.de);
    cloud(dx, dz, 92, 'held', LOW ? 8 : 14);
    b.lab = label(P.name, razed ? 'RAZED · DEPOT IS YOURS' : 'PIRATE BASE', '#ff6a5a', '#ffffff', 0.95, 420); b.lab.position.set(P.x + 12, 1, P.z - 9);
    b.dlab = label(razed ? P.name + ' DEPOT' : 'HELD DEPOT', razed ? 'FUEL · YOURS' : 'Raze ' + P.name + ' to take it', razed ? '#6ee7b7' : '#e6b183', '#ffffff', 0.6, 260); b.dlab.position.set(dx + 8, 1, dz + 5);
    b.zone = { kind: 'pirate', base: b, name: P.name + ' PIRATE BASE', x: P.x, z: P.z, r: 16 }; zones.push(b.zone);
    b.dzone = razed ? { kind: 'install', ik: 'fuel', wkey: 'pirate', wname: P.name, name: P.name + ' DEPOT', x: dx, z: dz, r: 12 } : { kind: 'held', base: b, name: 'HELD DEPOT', x: dx, z: dz, r: 12 }; zones.push(b.dzone);
    if (razed) depots.push({ x: dx, z: dz, name: P.name + ' FUEL DEPOT' });
    const ringM = new THREE.MeshBasicMaterial({ color: '#ff2a3a', transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    b.bar = new THREE.Mesh(new THREE.RingGeometry(15.5, 16.6, 72, 1, 0, TAU), ringM); b.bar.rotation.x = -Math.PI / 2; b.bar.position.set(P.x, 0.15, P.z); b.bar.visible = false; scene.add(b.bar); b.barF = 1;
    return b; });

  // ---------- frontier extras ----------
  const orbiters = [];
  const cloudTex = () => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
    for (let i = 0; i < 220; i++) { const px = Math.random() * 512, py = 30 + Math.random() * 196, r = 6 + Math.random() * 26, g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  for (const w of FRONTIER) { const B = bodies.find(b => b.key === w.key); if (!B || !B.g) continue; const R = B.r, G = B.g;
    if (F.surveyed.includes(w.key)) B.lab = relabel(B.lab, nameOf(w.key) || w.name, 'SURVEYED · ' + w.trait.toUpperCase(), '#ffffff', '#6ee7b7', 1.25);
    else { B.lab = relabel(B.lab, 'UNCHARTED WORLD', 'SLOW DOWN OVER IT TO SURVEY', '#7fd0ff', '#ffffff', 1.25); const zz = zones.find(q => q.w === B); if (zz) zz.name = 'UNCHARTED WORLD'; }   /* s605 */
    if (w.extra === 'earth') { const cl = new THREE.Mesh(new THREE.SphereGeometry(R * 1.035, 40, 28), new THREE.MeshLambertMaterial({ map: cloudTex(), transparent: true, opacity: 0.85, depthWrite: false })); G.add(cl); orbiters.push({ o: cl, spin: 0.035 });
      const moon = new THREE.Mesh(new THREE.SphereGeometry(R * 0.24, 24, 16), toon('#c9c7c2')); const piv = new THREE.Group(); piv.rotation.z = 0.25; piv.add(moon); moon.position.x = R * 2.2; G.add(piv); orbiters.push({ o: piv, spin: 0.08 }); }
    if (w.extra === 'icering') { const rg = new THREE.Mesh(new THREE.RingGeometry(R * 1.35, R * 1.95, 96, 1), new THREE.MeshBasicMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false })); rg.rotation.x = -Math.PI / 2 + 0.25; G.add(rg);
      for (let k = 0; k < 2; k++) { const piv = new THREE.Group(), m = new THREE.Mesh(new THREE.IcosahedronGeometry(R * (0.12 + k * 0.05), 1), toon('#eef6ff', { flatShading: true })); m.position.x = R * (2.3 + k * 0.6); piv.add(m); piv.rotation.y = k * 2; G.add(piv); orbiters.push({ o: piv, spin: 0.12 - k * 0.05 }); } }
    if (w.extra === 'iron' && B.atmo) B.atmo.visible = false;
    if (w.extra === 'gems' && B.globe) { const cols = ['#ff5ad1', '#ffd23a', '#7df9ff']; for (let k = 0; k < 16; k++) { const n = new THREE.Vector3().randomDirection(); if (n.y < -0.1) n.y = -n.y;
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: cols[k % 3], toneMapped: false })); m.scale.set(0.9, 2.4 + Math.random() * 2, 0.9); m.position.copy(n).multiplyScalar(R * 1.01); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); B.globe.add(m); } }
    if (w.extra === 'held') B.held = { built: false, ships: [] };
  }
  const heldWorld = bodies.find(b => b.held);

  // ---------- THE MACHINE YARD (story: the Machine Fleet is HACKED; its guard can be freed one by one) ----------
  const MY = { ...MACHINE_YARD, guards: [], spawned: false, met: 0, lineI: 0 };
  MY.e = { type: 'machineYard', x: MY.x, y: -7, z: MY.z, sc: 0.95, fr: 17, frange: 60, look: { freed: Math.min(1, F.yardFreed / 4) }, onBuild: a => { MY.api = a; } }; INST.push(MY.e);
  MY.lab = label(MY.name, F.yardFreed >= 4 ? 'ITS GUARD IS FREE' : 'MERU BUILT IT · SOMETHING IS WRONG', '#ffffff', F.yardFreed >= 4 ? '#7fd0ff' : '#ff8ad0', 1.05, 480); MY.lab.position.set(MY.x + 18, 1, MY.z - 12);
  MY.zone = { kind: 'myard', name: MY.name, x: MY.x, z: MY.z, r: 18 }; zones.push(MY.zone);
  const YARD_LINES = ['YARD BEACON: ALL UNITS NOMINAL. ALL UNITS NOMIN— ALL UNITS—', 'Under the static, a small voice: "It isn\'t us. It was never us."', 'YARD BEACON: FOXES ARE A FAULT. CORRECT THE FAULT. ...who wrote that?', 'The beacon skips. For a second it plays an old Meru launch song.'];
  const FREED_LINES = ['', 'ONE GUARD FREE. The yard\'s glow flickers blue for a moment.', 'TWO FREE. The beacon stutters: "...help us find..."', 'THREE FREE. Under the static, one word repeats: POWER.', 'THE YARD\'S GUARD IS FREE. They need a power source to live. That is the next road.'];

  // ---------- runtime ----------
  let gasIn = null, gasHint = {}, surveyT = 0, barT = 0, lastNote = '';
  const API = {
    bases, clouds, finds, ITEMS, F, saveF, unlabelFn: l => unlabel(l), hook: null,   /* s605 hook = worlds/space-explore.js */
    relabelWorld(k) { const B = bodies.find(b => b.key === k), fw = FRONTIER.find(w => w.key === k); if (!B || !fw) return; B.lab = relabel(B.lab, nameOf(k) || fw.name, 'SURVEYED · ' + fw.trait.toUpperCase(), '#ffffff', '#6ee7b7', 1.25); const zz = zones.find(q => q.w === B); if (zz) zz.name = nameOf(k) || fw.name; X.resize && X.resize(); },
    attach(o) { St = o.St; combat = o.combat; toast = o.toast; burst = o.burst; save = o.save; V = o.V || 20; if (o.holdCap) holdCap = o.holdCap; if (o.scanT) scanT = o.scanT; if (o.onRaze) API.onRaze = o.onRaze; },
    // s383 SCANNER (2D research "+50% scan reach, alerts"): deep finds show on the minimap within scan reach; with the SCANNER fitted
    // the boards call out wrecks, unlit buoys and unsurveyed worlds as they come into reach. Pirate bases are found by flying near
    // (300 u) or from a salvaged wreck's NAVIGATION CORE (2D: "Pirate base discovered").
    scanR() { return 180 * (1 + 0.5 * scanT()); },
    course() { const b = bases.find(q => q.name === F.course && !q.razed); return b ? [b.x, b.z, b.name + ' base'] : null; },
    inCover() { return !!(gasIn && gasIn.gas === 'cover'); },
    get gas() { return gasIn; },
    towK() { return St && St.tow ? 0.72 : 1; }, burnK() { return St && St.tow ? 1.8 : 1; },
    note(z) {
      if (z.kind === 'pirate') { const b = z.base; return b.razed ? { title: z.name, sub: 'Razed. Its fuel depot is yours now.' } : { title: z.name, sub: 'BASE HULL ' + Math.ceil(b.hp / PIRATE_BASE_HP * 100) + ' % · shoot it down' }; }
      if (z.kind === 'myard') return { title: MY.name, sub: F.yardFreed >= 4 ? 'Its guard is free. They need power.' : 'Hacked guard: ' + (4 - F.yardFreed) + ' left. Beat one, then UNHACK it.' };
      if (z.kind === 'planet' && FRONTIER.some(w => w.key === z.w.key)) { const fw = FRONTIER.find(w => w.key === z.w.key), gd = FRONTIER_GOODS.find(g => g.home === fw.key); if (!F.surveyed.includes(fw.key)) return { title: 'UNCHARTED WORLD', sub: 'Slow down over it to SURVEY it. +60 G.' }; return { title: nameOf(fw.key) || z.w.name, sub: gd.name + ' · ' + seam(fw.key) + ' crates in the seam' }; }
      if (z.kind === 'held') return { title: 'HELD DEPOT', sub: 'Pirates hold it. Raze ' + z.base.name + ' to take it.' };
      if (z.kind === 'find') { const it = z.item; if (it.kind === 'buoy') return { title: it.name, sub: it.lit ? 'Lit. Press ACTIONS to read her card.' : 'Slow down to light it.' }; if (it.kind === 'wreck') return { title: it.name, sub: St.tow === it ? 'In the tractor. Keep holding SPECIAL, fly to any SHIPYARD.' : 'Salvage. Slow down, HOLD SPECIAL (2) to tractor it to a shipyard.' }; }
      return null; },
    prompt() { if (!St || St.phase !== 'free') return null; if (St.tow) return null; { const hp = API.hook && API.hook.prompt(); if (hp) return hp; } const fl = API.loadable(); if (fl) return 'Load ' + fl.gd.name; return null; },   /* s594 wrecks: the TRACTOR is on the SPECIAL button now */
    tractor() { if (St.tow) return St.tow; const w = API.wreckNear(); if (!w) return null; St.tow = w; snd('holster'); toast('TRACTOR ON. Keep holding SPECIAL. Let go = it drops. Fly to any SHIPYARD.', 3.5); return w; },
    wreckNear() { if (St.tow || Math.hypot(St.vx, St.vz) > V * 0.45) return null; for (const it of finds) if (it.kind === 'wreck' && !it.done && Math.hypot(it.e.x - St.x, it.e.z - St.z) < 11) return it; return null; },
    loadable() { const z = St.zone; if (!z || z.kind !== 'planet' || !F.surveyed.includes(z.w.key) || Math.hypot(St.vx, St.vz) > V * 0.45) return null; const gd = FRONTIER_GOODS.find(g => g.home === z.w.key); return gd ? { key: z.w.key, gd } : null; },
    guardFreed(p) { F.yardFreed = Math.min(4, F.yardFreed + 1); saveF(); const i = MY.guards.indexOf(p); if (i >= 0) MY.guards.splice(i, 1); if (MY.api) MY.api.setFreed(Math.min(1, F.yardFreed / 4)); MY.e.look.freed = Math.min(1, F.yardFreed / 4);
      setTimeout(() => toast(FREED_LINES[F.yardFreed], 5), 4200); if (F.yardFreed >= 4) { try { save.setStat('spaceYardGuardFree', 1); save.addXp(150); } catch (e) {} MY.lab = relabel(MY.lab, MY.name, 'ITS GUARD IS FREE', '#ffffff', '#7fd0ff', 1.05, 480); } },
    talk() { { const z = St.zone; if (API.hook && !St.tow && z && z.kind === 'find' && z.item.kind === 'buoy' && z.item.lit) { API.hook.onRead(z.item); return true; } }
      const fl = !St.tow && API.loadable(); if (fl) { const h = (() => { const q = save.stat('spaceHold', null); return q && typeof q === 'object' ? { ...q } : {}; })(), n = Object.values(h).reduce((a, b) => a + b, 0);
        if (n >= holdCap()) { toast('Hold full: ' + holdCap() + ' crates.'); return true; } if (seam(fl.key) < 1) { toast('The seam is empty. One more crate every ' + SEAM_GROW_S + ' s.'); return true; }
        F.seams[fl.key] = { n: seam(fl.key) - 1, t: Date.now() }; saveF(); h[fl.gd.key] = (h[fl.gd.key] || 0) + 1; save.setStat('spaceHold', h); burst(St.x, St.z, '#ffd23a', 8, 0.8); toast('Loaded 1 ' + fl.gd.name + '. Every dock buys it.', 2.4); return true; }
      return false; },
    release() { const it = St && St.tow; if (!it) return; St.tow = null; it.zone.x = it.e.x; it.zone.z = it.e.z; it.lab.position.set(it.e.x + 7, 1, it.e.z - 5); },
    hitShot(s) { const sx = s.m.position.x, sz = s.m.position.z; if (Math.hypot(MY.x - sx, MY.z - sz) < 6) { burst(sx, sz, '#ff8ad0', 4, 0.6); MY.guards.forEach(p => { p.calm = false; }); return true; } for (const b of bases) { if (b.razed || Math.hypot(b.x - sx, b.z - sz) > 12.5) continue;
        b.hp -= s.dmg || 10; b.flash = 0.08; snd('hitShip', { at: [sx, sz], v: 0.9 }); burst(sx, sz, s.missile ? '#ffd23a' : '#ff8a5a', s.missile ? 10 : 4, s.missile ? 1.2 : 0.7); if (b.hp <= 0) raze(b); return true; } return false; },
    mini(x, tx, tz) { const SR = API.scanR(), inR = (px, pz) => Math.hypot(px - St.x, pz - St.z) < SR;
      x.strokeStyle = 'rgba(127,208,255,0.35)'; x.lineWidth = 1; x.beginPath(); x.arc(tx(St.x), tz(St.z), SR * x._k, 0, 7); x.stroke();
      for (const c of clouds) { x.fillStyle = GAS[c.gas].col[1] + '55'; x.beginPath(); x.arc(tx(c.x), tz(c.z), Math.max(3, c.r * x._k), 0, 7); x.fill(); }
      for (const it of ITEMS) { if (!it.charted && it.kind !== 'nav' && !it.lit && !F.seen?.includes(it.id) && !inR(it.e ? it.e.x : it.x, it.e ? it.e.z : it.z)) continue; if (it.kind === 'buoy' || it.kind === 'nav') { x.fillStyle = it.lit ? (it.kind === 'nav' ? '#7fd0ff' : '#ffd23a') : '#8a909c'; const X0 = tx(it.x), Z0 = tz(it.z); x.beginPath(); x.moveTo(X0, Z0 - 3.5); x.lineTo(X0 + 3, Z0); x.lineTo(X0, Z0 + 3.5); x.lineTo(X0 - 3, Z0); x.fill(); }
        else if (it.kind === 'wreck' && it.e && !it.done) { x.strokeStyle = '#7dd3fc'; x.lineWidth = 2; x.strokeRect(tx(it.e.x) - 3, tz(it.e.z) - 3, 6, 6); } }
      x.fillStyle = F.yardFreed >= 4 ? '#7fd0ff' : '#ff4fb4'; x.beginPath(); x.arc(tx(MY.x), tz(MY.z), 6, 0, 7); x.fill();
      for (const b of bases) { if (!b.known) continue; x.fillStyle = b.razed ? '#6b6f78' : '#ff2a3a'; x.fillRect(tx(b.x) - 5, tz(b.z) - 5, 10, 10); x.fillStyle = b.razed ? '#6ee7b7' : '#e6b183'; x.fillRect(tx(b.dx) - 3, tz(b.dz) - 3, 6, 6); } },
    update(dt) { if (!St) return; const t = St.t, free = St.phase === 'free', spd = Math.hypot(St.vx, St.vz);
      // clouds: cull + drift
      for (const c of clouds) { const d = Math.hypot(c.x - St.x, c.z - St.z), vis = d < c.r + 430; c.grp.visible = vis; if (!vis) continue;
        for (const p of c.sp) { p.m.rotation += p.spin * dt; p.s.position.x = p.bx + Math.sin(t * 0.06 + p.ph) * 5; p.s.position.z = p.bz + Math.cos(t * 0.05 + p.ph) * 4; } c.motes.material.opacity = 0.55 + 0.35 * Math.sin(t * 1.7 + c.x); }
      // which gas am I in?
      let g = null; for (const c of clouds) if (Math.hypot(c.x - St.x, c.z - St.z) < c.r * 0.8) { g = c; break; }
      if (g !== gasIn) { gasIn = g; if (g && free && (!gasHint[g.gas] || t - gasHint[g.gas] > 40)) { gasHint[g.gas] = t; toast(GAS[g.gas].name + '. ' + GAS[g.gas].sub, 3.2); } }
      if (gasIn && free) { if (gasIn.gas === 'ion') St.en = Math.max(0, St.en - 14 * dt);
        if (gasIn.gas === 'skim') { const T = tiers(save).skim || 0; if (T && spd < V * 0.35 && St.fuel < 100 && !St.fill) { St.fuel = Math.min(100, St.fuel + [0, 1.5, 3, 5][T] * dt); if (Math.random() < 0.35) burst(St.x + (Math.random() - 0.5) * 4, St.z + (Math.random() - 0.5) * 4, '#9dffb8', 1, 0.5); St.skimming = true; } else St.skimming = false;
          if (!T && !gasHint.noskim && spd < V * 0.3) { gasHint.noskim = true; toast('Fit a GAS SKIMMER at any SHIPYARD to lift fuel from green gas.', 4); } } } else St.skimming = false;
      // buoys: slow over one = it lights + plays its log
      if (free && St.zone && St.zone.kind === 'find') { const it = St.zone.item;
        if (it.kind === 'buoy' && !it.lit && spd < V * 0.5) { it.lit = true; F.buoys.push(it.id); const line = BUOY_NOTES[Math.min(F.logs, BUOY_NOTES.length - 1)]; F.logs++; saveF();
          if (it.e.inst && it.e.api) it.e.api.setLit(true); it.e.look.lit = true; if (API.hook) API.hook.onBuoy(it); else { it.lab = relabel(it.lab, it.name, 'LIT', '#ffffff', '#ffd23a', 0.62, 300); burst(it.x, it.z, '#ffe48a', 16, 1.2);
          toast(it.name + ' · ' + line, 6.5); snd('buoy', { v: 0.6 }); try { save.addXp(15); } catch (e) {}
          if (it.bait) setTimeout(() => { combat.spawnCrew(true); toast('BAIT. They were waiting on the light.', 3.5); }, 2200); } } }
      // tow
      if (St.tow) { const it = St.tow, e = it.e, bx = St.x - Math.sin(St.h) * 13, bz = St.z + Math.cos(St.h) * 13, k = 1 - Math.exp(-dt * 2.2); e.x = lerp(e.x, bx, k); e.z = lerp(e.z, bz, k);
        if (e.inst) e.inst.group.position.set(e.x, e.y, e.z); it.lab.position.set(e.x + 7, 1, e.z - 5);
        if (!API.line) { API.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: '#7fd0ff', transparent: true, opacity: 0.8 })); scene.add(API.line); }
        const P = API.line.geometry.attributes.position; P.setXYZ(0, St.x, 0, St.z); P.setXYZ(1, e.x, -1.4, e.z); P.needsUpdate = true; API.line.visible = true; API.line.material.opacity = 0.5 + 0.4 * Math.sin(t * 9);
        if (St.zone && St.zone.ik === 'yard' && free) { const val = it.value; it.done = true; St.tow = null; F.wrecks.push(it.id); const note = RELIC_NOTES[Math.min(F.relics, RELIC_NOTES.length - 1)]; F.relics++; saveF();
          if (e.inst) e.inst.dispose(); e.inst = null; e.gone = true; unlabel(it.lab); const zi = zones.indexOf(it.zone); if (zi >= 0) zones.splice(zi, 1);
          save.addGold(val); try { save.addXp(60); const hq = save.stat('spaceHold', null), h2 = hq && typeof hq === 'object' ? { ...hq } : {}; h2.machine_parts = (h2.machine_parts || 0) + 2; save.setStat('spaceHold', h2); setTimeout(() => toast('+2 MACHINE PARTS salvaged from the wreck. In the hold.', 3), 2600); } catch (e2) {} burst(St.x, St.z, '#7dd3fc', 24, 1.4);   /* s599 MACHINE PARTS from wrecks */ snd('pickup'); toast(it.name + ' SALVAGED · +' + val + ' G. ' + note, 7);
          const nb = bases.find(q => !q.known && !q.razed) || bases.find(q => !q.razed); if (nb) { nb.known = true; if (!F.known.includes(nb.name)) F.known.push(nb.name); F.course = nb.name; saveF(); setTimeout(() => toast('NAVIGATION CORE · PIRATE BASE DISCOVERED: ' + nb.name + '. Course set on your map.', 5), 7200); } } }
      else if (API.line) API.line.visible = false;
      // frontier survey
      if (free && St.zone && St.zone.kind === 'planet' && FRONTIER.some(w => w.key === St.zone.w.key) && !F.surveyed.includes(St.zone.w.key) && spd < V * 0.3) { surveyT += dt;
        if (surveyT > 1.2) { const w = St.zone.w, fw = FRONTIER.find(q => q.key === w.key); F.surveyed.push(w.key); saveF(); surveyT = 0; w.lab = relabel(w.lab, nameOf(w.key) || fw.name, 'SURVEYED · ' + fw.trait.toUpperCase(), '#ffffff', '#6ee7b7', 1.25); X.resize && X.resize(); { const zz = zones.find(q => q.w === w); if (zz) zz.name = nameOf(w.key) || fw.name; }
          if (API.hook) API.hook.onSurvey(w, fw); else toast('WORLD SURVEYED · ' + w.name + '. ' + fw.trait, 5); try { save.addXp(50); } catch (e) {} } } else surveyT = 0;
      for (const o of orbiters) o.o.rotation.y += o.spin * dt;
      if (heldWorld) { const H = heldWorld.held, d = Math.hypot(heldWorld.x - St.x, heldWorld.z - St.z);
        if (!H.built && d < 320 && IK) { H.built = true; for (let k = 0; k < 3; k++) { const s = IK.build('pirScout', LOOKS && LOOKS.pirScout); s.group.scale.multiplyScalar(1.1); scene.add(s.group); H.ships.push({ s, a: k * TAU / 3 }); } }
        for (const q of H.ships) { q.a += dt * 0.12; const r = heldWorld.r * 1.55; q.s.group.position.set(heldWorld.x + Math.cos(q.a) * r, -2.5, heldWorld.z + Math.sin(q.a) * r); q.s.group.rotation.y = -q.a + Math.PI; q.s.group.visible = d < 360; if (d < 200) q.s.tick(dt, 0); } }
      // discovery: bases within 300 u become known; scanner alerts
      for (const b of bases) if (!b.known && Math.hypot(b.x - St.x, b.z - St.z) < 300) { b.known = true; F.known.push(b.name); saveF(); toast('PIRATE BASE SIGHTED · ' + b.name + '. It is on your map now.', 3.5); }
      if (scanT() && free && (API._scanT = (API._scanT || 0) - dt) <= 0) { API._scanT = 1; const SR = API.scanR(); API._seen = API._seen || new Set();
        const call = (id, x, z, what) => { if (API._seen.has(id) || Math.hypot(x - St.x, z - St.z) > SR) return false; API._seen.add(id); const brg = String(Math.round((Math.atan2(x - St.x, -(z - St.z)) * 180 / Math.PI + 360) % 360)).padStart(3, '0'); toast('SCANNER · ' + what + ' · BEARING ' + brg + ', ' + Math.round(Math.hypot(x - St.x, z - St.z)) + ' u', 3.5); snd('botAim', { v: 0.5 }); return true; };
        for (const it of finds) { if (it.done || it.lit) continue; if (call(it.id, it.e.x, it.e.z, it.kind === 'wreck' ? 'WRECK' : 'UNLIT BUOY')) break; }
        for (const w of FRONTIER) { const B = bodies.find(q => q.key === w.key); if (B && !F.surveyed.includes(w.key) && call('fr_' + w.key, B.x, B.z, 'UNCHARTED WORLD')) break; } }
      // the machine yard: its guard circles it; lines on approach
      { const d = Math.hypot(MY.x - St.x, MY.z - St.z), left = 4 - F.yardFreed - MY.guards.length;
        if (d < 260 && !MY.spawned) { MY.spawned = true; for (let k = 0; k < 4 - F.yardFreed; k++) MY.guards.push(combat.makeGuard('machine', MY.x, MY.z, MY.guard[k], k / 4 * TAU, 0.22 * (k % 2 ? -1 : 1), 'myard')); }
        if (d > 340 && MY.spawned) { MY.spawned = false; MY.guards.forEach(p => combat.removeShip(p)); MY.guards = []; }
        MY.guards = MY.guards.filter(p => !p.dead || p.mode === 'freed');
        if (d < 90 && free && t - MY.met > 50) { MY.met = t; toast(F.yardFreed >= 4 ? 'The yard hums, blue now. Waiting.' : YARD_LINES[MY.lineI++ % YARD_LINES.length], 5); } }
      // pirate bases: guns, torpedoes, the hull ring
      for (const b of bases) { if (b.razed) continue; const d = Math.hypot(b.x - St.x, b.z - St.z); b.bar.visible = d < 140; b.flash = Math.max(0, b.flash - dt); if (b.api && b.api.flash) b.api.flash(b.flash > 0 ? '#ffffff' : null);
        const f = b.hp / PIRATE_BASE_HP; if (Math.abs(f - b.barF) > 0.01) { b.barF = f; b.bar.geometry.dispose(); b.bar.geometry = new THREE.RingGeometry(15.5, 16.6, 72, 1, Math.PI / 2, TAU * Math.max(0.002, f)); }
        b.bar.material.opacity = 0.45 + 0.3 * Math.sin(t * 3);
        if (!free || d > 78 || !b.api || !b.e.inst) continue;
        if ((b.gunT -= dt) <= 0) { b.gunT = 1.5 + Math.random() * 0.5; const ring = b.api.ring, v = new THREE.Vector3(), cand = [];
          for (const a of b.api.gunA) { v.set(Math.cos(a) * b.api.gunR, b.api.gunY, Math.sin(a) * b.api.gunR); ring.localToWorld(v); cand.push({ x: v.x, z: v.z, d: Math.hypot(v.x - St.x, v.z - St.z) }); }
          cand.sort((p, q) => p.d - q.d).slice(0, 2).forEach((g2, k) => setTimeout(() => { if (b.razed) return; const ax = St.x + St.vx * 0.45 - g2.x, az = St.z + St.vz * 0.45 - g2.z, L = Math.hypot(ax, az) || 1; combat.fireBolt(g2.x, g2.z, ax / L * 50, az / L * 50, 6, false); }, k * 160)); }
        if ((b.torpT -= dt) <= 0) { b.torpT = 6 + Math.random() * 3; const ax = St.x - b.x, az = St.z - b.z, L = Math.hypot(ax, az) || 1; combat.fireBolt(b.x + ax / L * 11, b.z + az / L * 11, ax / L * 22, az / L * 22, 14, true); snd('baseGun', { at: [b.x, b.z] }); } }
    },
  };
  function seam(k) { const s = F.seams[k]; if (!s) return SEAM_MAX; const grown = Math.floor((Date.now() - s.t) / (SEAM_GROW_S * 1000)); if (grown > 0) { s.n = Math.min(SEAM_MAX, s.n + grown); s.t += grown * SEAM_GROW_S * 1000; if (s.n >= SEAM_MAX) s.t = Date.now(); } return s.n; }
  function raze(b) { b.razed = true; b.hp = 0; b.P.razed = true; F.razed.push(b.name); saveF(); b.bar.visible = false; b.e.gone = true;
    for (let k = 0; k < 4; k++) setTimeout(() => { combat.explode(b.x + (Math.random() - 0.5) * 14, b.z + (Math.random() - 0.5) * 14, true); }, k * 220);
    setTimeout(() => { if (b.e.inst) { b.e.inst.dispose(); b.e.inst = null; } burst(b.x, b.z, '#ff8a3a', 40, 3); }, 700);
    b.lab = relabel(b.lab, b.name, 'RAZED · DEPOT IS YOURS', '#ff6a5a', '#ffffff', 0.95, 420); b.dlab = relabel(b.dlab, b.name + ' DEPOT', 'FUEL · YOURS', '#6ee7b7', '#ffffff', 0.6, 260);
    const zi = zones.indexOf(b.dzone); b.dzone = { kind: 'install', ik: 'fuel', wkey: 'pirate', wname: b.name, name: b.name + ' DEPOT', x: b.dx, z: b.dz, r: 12 }; if (zi >= 0) zones[zi] = b.dzone; else zones.push(b.dzone);
    depots.push({ x: b.dx, z: b.dz, name: b.name + ' FUEL DEPOT' }); b.de.look = {}; if (b.de.inst) { b.de.inst.dispose(); b.de.inst = null; }
    F._razeAt = St.t; if (API.onRaze) API.onRaze(); snd('boss'); if (F.course === b.name) F.course = null; saveF(); try { save.addXp(100); } catch (e) {} toast('PIRATE BASE DESTROYED. The fuel depot is now yours.', 5); }
  return API;
}
