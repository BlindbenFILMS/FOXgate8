// MERU 2.0 — s151 THE OUTLETS AMBUSH (Ben: "walking past them can become a real battle of bandits on both sides" · Godfather-style cover).
// Units 1 / 3 / 5 south of the Barracks Road, 2 + 4 north (layout TOWN2). Walk onto the strip on foot → AMBUSH: the gang bursts out of all 5 doors,
// shooters run to cover (parked cars, crates, dumpsters, road wrecks) and pop up to shoot, then duck back; rushers come at you. Every barrier BREAKS
// (shoot it or hit it) and a bandit behind a broken one has nowhere to hide. STOP next to a barrier = you CROUCH (shots can't hit you) until you
// move or fire. Gang down → MAGPIE (the gang boss, white fedora) on unit 3's roof lookout; at half HP he jumps down into the street.
// Win → the Outlets are freed (flag outletsFreed: unit 3 opens later) + gold + XP, quiet for the rest of the day. Down in the fight → you wake at Meru Hospital.
// Medium difficulty. Phone: 8 bandits (desktop 10). Uses the shared light combat (engine/combat.js, f.cover = can't be targeted while ducked).
export function buildOutlets({ THREE, scene, M, toon, kit, CB, cols, save, touch, L = {} }) {
  const STRIP = [166, 296, -352, -268], DOORS = [[183, -294, 1], [231, -294, 1], [279, -294, 1], [207, -326, -1], [255, -326, -1]];   // [x, z, side: +1 south / -1 north]
  const ROOF = [227, 10.3, -288];   // unit 3's lookout platform (worlds/meru2-town2.js u === 2)
  const day = () => { const d = new Date(); return d.getFullYear() * 1000 + Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); };
  const st = (k, v) => { try { return save ? save.stat(k, v) : v; } catch (e) { return v; } };
  const quietToday = () => st('outletsWonDay', 0) === day();
  // ---- toast + boss bar (Modernist: ink, 2px rules, flush left) ----
  const tst = document.createElement('div'); tst.style.cssText = 'position:fixed;left:50%;top:96px;transform:translateX(-50%);z-index:40;background:#201e1d;color:#f3f2f2;border:2px solid #ec3013;font:800 14px Archivo,sans-serif;letter-spacing:.06em;padding:8px 14px;display:none;pointer-events:none;white-space:normal;width:max-content;max-width:min(92vw,560px);box-sizing:border-box;line-height:1.3;text-align:left;text-wrap:pretty'; document.body.appendChild(tst); let tstT = 0;
  const TQ = [], toast = (t, s = 2.4) => { tst.textContent = t; tst.style.display = 'block'; tstT = s; };
  // s160 polish: queued lines (Magpie speaks before / after his fights; the info toast follows)
  const qtoast = (t, s = 3) => { if (tstT > 0) TQ.push([t, s]); else toast(t, s); }, say = (t, s = 3.2) => qtoast('MAGPIE: ' + t, s);
  const bar = document.createElement('div'); bar.style.cssText = 'position:fixed;left:50%;top:max(56px, calc(env(safe-area-inset-top) + 48px));transform:translateX(-50%);z-index:39;width:min(360px,70vw);background:#201e1d;border:2px solid #f3f2f2;display:none;pointer-events:none;font:800 11px Archivo,sans-serif;letter-spacing:.14em;color:#f3f2f2';
  bar.innerHTML = '<div style="padding:5px 10px;border-bottom:2px solid #3a3836;display:flex;justify-content:space-between;gap:8px"><span data-t>MAGPIE · OUTLETS BOSS</span><span data-n></span></div><div style="height:10px;background:#000"><div data-f style="height:100%;width:100%;background:#ec3013"></div></div>';
  document.body.appendChild(bar); const barF = bar.querySelector('[data-f]'), barN = bar.querySelector('[data-n]'), barName = bar.querySelector('[data-t]');
  // ---- barriers: parked cars, crates, a dumpster on both forecourts + three wrecks across the road ----
  const root = new THREE.Group(); root.name = 'meruOutlets'; scene.add(root);
  const C = (h) => toon(h), MAT = { red: C('#8a2a24'), blue: C('#2e4a6b'), olive: C('#4f5d2f'), cream: C('#c9b48a'), ink: C('#201e1d'), glass: C('#3a4a58'), rust: C('#6b4a35'), wood: C('#8b6a48'), green: C('#2f5a3a'), tyre: C('#151414'), burnt: C('#2a2624') };
  const B = [];
  const car = (x, z, ry, col) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); M(new THREE.BoxGeometry(4.2, 0.9, 1.9), col, 0, 0.75, 0, g, 0.03); M(new THREE.BoxGeometry(2.3, 0.7, 1.7), MAT.glass, -0.2, 1.5, 0, g, 0.025);
    for (const a of [-1.35, 1.35]) for (const b of [-0.9, 0.9]) { const w = M(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 10), MAT.tyre, a, 0.36, b, g, 0.01); w.rotation.x = Math.PI / 2; }
    return { g, x, z, w: 4.2, d: 1.9, ry, hp: 140, kind: 'car' }; };
  const crate = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = 0.2; root.add(g); M(new THREE.BoxGeometry(1.3, 1.1, 1.3), MAT.wood, -0.7, 0.55, 0, g, 0.025); M(new THREE.BoxGeometry(1.2, 1.0, 1.2), MAT.wood, 0.7, 0.5, 0.1, g, 0.025); M(new THREE.BoxGeometry(1.1, 0.9, 1.1), MAT.rust, 0, 1.5, 0, g, 0.02);
    return { g, x, z, w: 2.7, d: 1.4, ry: 0.2, hp: 60, kind: 'crate' }; };
  const dump = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g); M(new THREE.BoxGeometry(2.8, 1.4, 1.5), MAT.green, 0, 0.7, 0, g, 0.03); M(new THREE.BoxGeometry(2.9, 0.12, 1.6), MAT.ink, 0, 1.46, 0, g, 0.01);
    return { g, x, z, w: 2.8, d: 1.5, ry: 0, hp: 100, kind: 'dump' }; };
  // south forecourts (z -294..-301.7): bandits hide on the shop side (z +), north forecourts (z -318.3..-326): bandits on the shop side (z -)
  B.push(crate(177, -297.6), car(207, -298.4, 0.08, MAT.red), dump(231, -297.4), car(255, -298.4, -0.06, MAT.blue), crate(287, -297.6));
  B.push(car(184, -322, -0.05, MAT.olive), crate(207, -322.6), car(231, -322, 0.07, MAT.cream), crate(255, -322.6), car(279, -322, -0.04, MAT.red));
  B.push(car(195, -309.5, 0.5, MAT.burnt), car(243, -310.5, -0.45, MAT.burnt), car(271, -309, 0.35, MAT.burnt));   // road wrecks: cover for you in the crossfire
  const colOf = b => { const hw = b.w / 2 + 0.1, hd = b.d / 2 + 0.1, c = Math.abs(Math.cos(b.ry)), s = Math.abs(Math.sin(b.ry)), ex = hw * c + hd * s, ez = hw * s + hd * c; return { f: [b.x - ex, b.x + ex, b.z - ez, b.z + ez] }; };
  B.forEach((b, i) => { b.i = i; b.side = b.z > -304 ? 1 : b.z < -316 ? -1 : 0; b.hp0 = b.hp; b.col = colOf(b); cols.push(b.col);
    b.cover = b.side ? [b.x, b.z + b.side * (b.d / 2 + 0.9)] : null; b.broken = false; b.g.traverse(q => { if (q.isMesh) q.userData.m0 = q.material; }); });
  const boxD = (b, x, z) => { const dx = x - b.x, dz = z - b.z, c = Math.cos(-b.ry), s = Math.sin(-b.ry), lx = dx * c + dz * s, lz = -dx * s + dz * c; return Math.hypot(Math.max(0, Math.abs(lx) - b.w / 2), Math.max(0, Math.abs(lz) - b.d / 2)); };
  const sparks = [], sparkM = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthWrite: false });
  const spark = (x, y, z, n = 6, col) => { for (let k = 0; k < n; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 3), sparkM.clone()); if (col) m.material.color.setHex(col); m.position.set(x, y, z); scene.add(m); sparks.push({ m, v: new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4), t: 0.6 }); } };
  const BROKE = { car: 'CAR WRECKED · NO COVER THERE', dump: 'DUMPSTER BUSTED', crate: 'CRATES SMASHED', tent: 'TENT FLATTENED', cage: 'BALLS EVERYWHERE!', rack: 'KAYAKS DOWN!', gym: 'GYM KIT TOPPLED' };
  function hitBarrier(b, kind) { if (b.broken) return; b.hp -= kind === 'melee' ? 35 : 18; b.shake = 0.2; spark(b.x, 1.1, b.z, 5);
    if (b.hp <= 0) { b.broken = true; b.col.on = false; spark(b.x, 1, b.z, 14, 0x9a948d); toast(BROKE[b.kind] || 'COVER DESTROYED', 1.6);
      if (b.onBreak) b.onBreak(); else if (b.kind === 'car') { b.g.rotation.z = 0.22; b.g.position.y = -0.25; b.g.traverse(q => { if (q.isMesh && q.material !== MAT.tyre && q.material.side !== THREE.BackSide) q.material = MAT.burnt; }); } else b.g.visible = false; } }
  function resetBarriers() { for (const b of B) { b.hp = b.hp0; b.broken = false; b.col.on = true; b.g.visible = true; b.g.rotation.z = 0; b.g.position.y = 0; b.g.traverse(q => { if (q.isMesh && q.userData.m0) q.material = q.userData.m0; }); } }
  // ---- the gang ----
  const fedora = (head, crown, band) => { const g = new THREE.Group(); g.position.set(0, 0.3, 0); head.add(g); M(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 16), crown, 0, 0, 0, g, 0.01); M(new THREE.CylinderGeometry(0.17, 0.19, 0.2, 14), crown, 0, 0.11, 0, g, 0.01); M(new THREE.CylinderGeometry(0.195, 0.195, 0.05, 14), band, 0, 0.04, 0, g, 0); return g; };
  const N = touch ? 8 : 10, nShoot = touch ? 6 : 7, gang = [];
  const OPT = { shoot: { hp: 50, dmg: 9, speed: 3.0, cd: 2.0, wind: 0.7, ranged: true, reach: 34 }, rush: { hp: 60, dmg: 8, speed: 3.4, cd: 1.5, wind: 0.5 } };
  function makeGang() { for (let i = 0; i < N; i++) { const role = i < nShoot ? 'shoot' : 'rush', f0 = kit.makeFox({ key: 'outletBandit' + i, name: 'Outlets Bandit', outfit: i % 3 ? 'vest' : 'coat', torso: [['#2b2b30', '#171719', '#08080a'], ['#3a2f2a', '#201a17', '#0d0b0a'], ['#2e3440', '#1b1f27', '#0b0d10']][i % 3], crest: '', gear: role === 'shoot' ? 'laser' : 'sword', mood: 'stern' });
      scene.add(f0); f0.visible = false; const P2 = f0.userData.P; if (P2 && P2.head) fedora(P2.head, MAT.ink, toon(i % 2 ? '#ec3013' : '#5a5654'));
      const n = { key: 'outletBandit' + i, x: 0, z: 0, face: 0, c: f0, speedNow: 0 }, f = CB.add(n, OPT[role]); f.solo = true; f.down = true; f.state = 'down';
      const e = { n, f, role, ph: 'off', t: 0, b: null, yOff: 0 };
      f.anim = (dt, spd) => { kit.animFox(f0, dt, spd); f0.position.y = e.yOff; if (e.ph === 'duck' && P2 && P2.legs) { P2.legs.forEach((l, k) => { l.rotation.x = k ? 0.35 : -1.35; }); } };
      gang.push(e); } }
  // Magpie: tall grey fox in a white suit + white fedora, gold eyes, the gang's laser
  let boss = null;
  function makeBoss() { const f0 = kit.makeFox({ key: 'outletMagpie', name: 'Magpie', outfit: 'suit', torso: ['#e8e6e1', '#1d1d22', '#ec3013'], look: { fur: '#3a3d44', furDark: '#1f2126', muzzle: '#f3f2f2', chin: '#f3f2f2' }, eyes: ['#ffd23a', '#ffd23a'], crest: '', gear: 'laser', mood: 'angry' });
    f0.scale.multiplyScalar(1.22); scene.add(f0); f0.visible = false; const P2 = f0.userData.P; if (P2 && P2.head) fedora(P2.head, toon('#f3f2f2'), MAT.ink);
    const n = { key: 'outletMagpie', x: ROOF[0], z: ROOF[2], face: 0, c: f0, speedNow: 0 }, f = CB.add(n, { hp: 420, dmg: 12, speed: 3.2, cd: 1.2, wind: 0.55, ranged: true, reach: 34 }); f.solo = true; f.down = true; f.state = 'down';
    boss = { n, f, ph: 'off', t: 0, yOff: 0, shots: 0, jumpFrom: null };
    f.anim = (dt, spd) => { kit.animFox(f0, dt, spd); f0.position.y = boss.yOff; }; }
  // ---- battle state ----
  let S = 'idle', outT = 0, lost = false, wonT = 0, coverMsg = false;
  const inStrip = (x, z, m = 0) => x > STRIP[0] - m && x < STRIP[1] + m && z > STRIP[2] - m && z < STRIP[3] + m;
  function startAmbush(P) { if (!gang.length) makeGang(); if (!boss) makeBoss(); resetBarriers(); S = 'ambush'; coverMsg = false;
    const free = B.filter(b => b.side), used = new Set();
    gang.forEach((e, i) => { const d = DOORS[i % DOORS.length], { n, f } = e; n.x = d[0] + (Math.random() - 0.5) * 2; n.z = d[1] + d[2] * -1.2; n.face = d[2] > 0 ? Math.PI : 0;
      Object.assign(f, { down: false, hp: f.max, hostile: false, state: 'idle', t: 0, cover: false }); n.c.visible = true; n.c.rotation.x = 0; e.yOff = 0;
      if (e.role === 'shoot') { const opts = free.filter(b => !used.has(b) && b.side === d[2]); const pick = (opts.length ? opts : free.filter(b => !used.has(b))).sort((a, b2) => Math.hypot(a.x - d[0], a.z - d[1]) - Math.hypot(b2.x - d[0], b2.z - d[1]))[0] || free[i % free.length]; used.add(pick); e.b = pick; e.ph = 'run'; }
      else { e.ph = 'rush'; f.hostile = true; f.state = 'chase'; f.t = -0.8 - i * 0.4; } });
    toast('AMBUSH! THE OUTLETS GANG · STOP BY COVER TO CROUCH', 3.2); }
  function startBoss() { S = 'boss'; const { n, f } = boss; n.x = ROOF[0]; n.z = ROOF[2]; boss.yOff = ROOF[1]; Object.assign(f, { down: false, hp: f.max, hostile: false, state: 'idle', t: 0, cover: true, reach: 34, cd: 1.2 }); n.c.visible = true; n.c.rotation.x = 0; boss.ph = 'duck'; boss.t = 0.8; boss.jumpFrom = null;
    bar.style.display = 'block'; barName.textContent = 'MAGPIE · OUTLETS BOSS'; TQ.length = 0; toast('MAGPIE IS ON THE ROOF OF UNIT 3!', 2.4); say('You shop at MY outlets? Then you pay MY prices.'); spark(ROOF[0], ROOF[1] + 1, ROOF[2], 12, 0xffffff); }
  function endBattle(hide = true) { S = 'idle'; bar.style.display = 'none'; for (const e of gang) { Object.assign(e.f, { down: true, hostile: false, state: 'down', cover: false }); if (hide) e.n.c.visible = false; e.ph = 'off'; }
    if (boss) { Object.assign(boss.f, { down: true, hostile: false, state: 'down', cover: false }); if (hide) boss.n.c.visible = false; boss.ph = 'off'; } }
  function win() { S = 'won'; wonT = 0; bar.style.display = 'none'; const first = !st('outletsFreedFlag', false);
    try { save.setStat('outletsWonDay', day()); save.setStat('outletsWins', st('outletsWins', 0) + 1); if (first) { save.setStat('outletsFreedFlag', true); save.setFlag && save.setFlag('outletsFreed'); } save.addGold(first ? 120 : 60); save.addXp && save.addXp(first ? 150 : 60); } catch (e) {}
    toast(first ? 'THE OUTLETS ARE FREE · UNIT 3 WILL OPEN · +120 GOLD · +150 XP' : 'OUTLETS CLEARED FOR TODAY · +60 GOLD · +60 XP', 4); }
  // ================= s151c THE STORES (Ben): street won = Magpie ran into GELATO (unit 3) and locked it; each other store is its own indoor fight
  // (any order) with a LIEUTENANT who drops 1 of the 4 keys. 1 Sporting Goods · 2 Funny T-shirts · 3 Gelato · 4 Electronics · 5 Furniture.
  // Built so far: SPORTING GOODS (worlds/meru2-outlet-sport.js) · FUNNY T-SHIRTS (worlds/meru2-outlet-tees.js) · ELECTRONICS (worlds/meru2-outlet-elec.js) · FURNITURE (worlds/meru2-outlet-furn.js) · GELATO = Magpie's hideout (worlds/meru2-outlet-gelato.js, def.boss: no key, sets prog.magpie; def.half = taunt + 2 more bandits). Progress = stat outletsProg { street, cleared: { key: true }, keys: [store keys], magpie }.
  const PK = 'outletsProg', prog = () => { const p = st(PK, null); return p && typeof p === 'object' ? { street: !!p.street, cleared: p.cleared || {}, keys: p.keys || [], magpie: !!p.magpie } : { street: false, cleared: {}, keys: [], magpie: false }; };
  const setProg = p => { try { save.setStat(PK, p); } catch (e) {} };
  const STORES = [{ unit: 0, key: 'sport', name: 'SPORTING GOODS', file: './meru2-outlet-sport.js', fn: 'buildSport' }, { unit: 1, key: 'tees', name: 'FUNNY T-SHIRTS', file: './meru2-outlet-tees.js', fn: 'buildTees' }, { unit: 2, key: 'gelato', name: 'GELATO', file: './meru2-outlet-gelato.js?v=g2', fn: 'buildGelato' }, { unit: 3, key: 'elec', name: 'ELECTRONICS', file: './meru2-outlet-elec.js?v=e2', fn: 'buildElec' }, { unit: 4, key: 'furn', name: 'FURNITURE', file: './meru2-outlet-furn.js?v=f2', fn: 'buildFurn' }];
  const KEYS = [], keyMat = new THREE.MeshBasicMaterial({ color: 0xffd23a });
  function dropKey(s, x, z, quiet) { if (KEYS.some(k => k.s === s)) return; const g = new THREE.Group(); g.position.set(x, 0.9, z); scene.add(g); M(new THREE.TorusGeometry(0.18, 0.05, 6, 14), keyMat, 0, 0.2, 0, g, 0); M(new THREE.BoxGeometry(0.06, 0.42, 0.06), keyMat, 0, -0.1, 0, g, 0); M(new THREE.BoxGeometry(0.15, 0.05, 0.06), keyMat, 0.08, -0.24, 0, g, 0); M(new THREE.BoxGeometry(0.12, 0.05, 0.06), keyMat, 0.07, -0.13, 0, g, 0);
    KEYS.push({ s, g, x, z }); if (!quiet) { spark(x, 1, z, 12); toast(s.def.lt.name + ' DROPPED A KEY!', 2); } }
  function tickKeys(dt, P) { for (let i = KEYS.length - 1; i >= 0; i--) { const k = KEYS[i]; k.g.rotation.y += dt * 2.4; k.g.position.y = 0.9 + Math.sin(performance.now() / 300) * 0.12;
      if (Math.hypot(P.x - k.x, P.z - k.z) < 1.3 && (P.y || 0) < 2) { scene.remove(k.g); KEYS.splice(i, 1); const pg = prog(); if (!pg.keys.includes(k.s.key)) pg.keys.push(k.s.key); setProg(pg); spark(k.x, 1, k.z, 16); toast(pg.keys.length >= 4 ? 'ALL 4 KEYS · MAGPIE\'S GELATO DOOR' : 'KEY ' + pg.keys.length + ' OF 4 · MAGPIE\'S GELATO DOOR', 3); } } }
  for (const s of STORES) { s.b = (L.BUILDINGS || []).find(b => b.kind === 'outlet' && b.unit === s.unit); if (!s.file || !s.b) continue;
    import(s.file + '?v=o7').then(m => { try { const D = m[s.fn]({ THREE, M, toon, scene, b: s.b, touch }); for (const b of D.bars) { b.hp0 = b.hp; b.broken = false; b.col = colOf(b); cols.push(b.col); } s.def = D;
      const pg = prog(); if (pg.cleared[s.key] && !pg.keys.includes(s.key) && !D.boss) dropKey(s, D.ltPost[0], D.ltPost[1], true); } catch (e) { console.warn('outlet store', s.key, e); } }); }
  const inStore = (s, x, z, m = 0) => !!s.b && x > s.b.f[0] + 0.4 - m && x < s.b.f[1] - 0.4 + m && z > s.b.f[2] + 0.4 - m && z < s.b.f[3] - 0.4 + m;
  const lockFn = b => { if (!b || b.kind !== 'outlet') return false; const pg = prog(), s = STORES.find(q => q.unit === b.unit); if (!pg.street || !s) return true; if (s.key === 'gelato') return !(s.def && (pg.keys.length >= 4 || pg.magpie)); return !s.def; };
  function lockTick(P) { const C = window.__meru2City; if (C && C.locked !== C._olk) { const prev = C.locked; C._olk = b => lockFn(b) || (prev ? !!prev(b) : false); C.locked = C._olk; }
    for (const s of STORES) { if (!s.b) continue; const d = Math.hypot(P.x - s.b.door[0], P.z - s.b.door[1]); if (d < 2.8 && (P.y || 0) < 2) { if (!s.bump && lockFn(s.b)) { s.bump = true; const pg = prog();
          toast(!pg.street ? 'BOARDED UP · BANDIT TERRITORY' : s.key === 'gelato' ? (pg.keys.length >= 4 ? 'THE KEYS FIT · MAGPIE\'S FIGHT IS COMING SOON' : 'LOCKED · MAGPIE IS INSIDE · KEYS ' + pg.keys.length + ' / 4') : s.name + ' · BOARDED UP · COMING SOON', 2.6); } } else if (d > 4) s.bump = false; } }
  function streetWon() { const pg = prog(); pg.street = true; setProg(pg); try { save.addGold(40); save.addXp && save.addXp(60); } catch (e) {}
    if (boss) { Object.assign(boss.f, { down: true, hostile: false, state: 'down', cover: false }); boss.n.c.visible = false; boss.ph = 'off'; } bar.style.display = 'none'; S = 'won'; wonT = 0;
    TQ.length = 0; tstT = 0; say('You will never get in! My four lieutenants hold the keys!'); qtoast('MAGPIE LOCKED HIMSELF IN THE GELATO SHOP! · HIS 4 LIEUTENANTS HOLD THE KEYS', 4.5); }
  // ---- one store fight ----
  let SF = null;
  function makeLT(s) { const D = s.def.lt, f0 = kit.makeFox({ key: 'outletLT_' + s.key, name: D.name, crest: '', mood: 'angry', ...D.look }); f0.scale.multiplyScalar(D.scale || 1.1); scene.add(f0); f0.visible = false; const P2 = f0.userData.P; if (P2 && P2.sword) P2.sword.visible = false; if (D.prop) D.prop(P2);
    const n = { key: 'outletLT_' + s.key, x: 0, z: 0, face: 0, c: f0, speedNow: 0 }, f = CB.add(n, { hp: D.hp || 180, dmg: D.dmg || 10, speed: 3.2, cd: 1.3, wind: 0.55, ranged: true, reach: 30 }); f.solo = true; f.down = true; f.state = 'down';
    const e = { n, f, role: 'lt', ph: 'off', t: 0, b: null, yOff: 0 }; f.anim = (dt, spd) => { kit.animFox(f0, dt, spd); f0.position.y = e.yOff; if (e.ph === 'duck' && e.b && P2 && P2.legs) P2.legs.forEach((l, k) => { l.rotation.x = k ? 0.35 : -1.35; }); }; s.ltE = e; }
  const nearestBar = (s, x, z) => s.def.bars.filter(b => !b.broken).sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z))[0] || null;
  const coverPt = (b, P, s) => { const dx = b.x - P.x, dz = b.z - P.z, d = Math.hypot(dx, dz) || 1, r = Math.max(b.w, b.d) / 2 + 0.75, I = s.def.inner; return [Math.max(I[0], Math.min(I[1], b.x + dx / d * r)), Math.max(I[2], Math.min(I[3], b.z + dz / d * r))]; };
  function placeE(e, [x, z], s) { const { n, f } = e; n.x = x; n.z = z; Object.assign(f, { down: false, hp: f.max, hostile: false, state: 'idle', t: 0, cover: true }); n.c.visible = true; n.c.rotation.x = 0; e.yOff = -0.35; e.ph = 'duck'; e.t = 0.8 + Math.random() * 1.5; e.b = nearestBar(s, x, z); e.keyDone = false; }
  function storeCheck(P, active) { if (!active) return; const pg = prog(); for (const s of STORES) if (s.def && !pg.cleared[s.key] && inStore(s, P.x, P.z)) { startStore(s); return; } }
  function startStore(s) { if (!gang.length) makeGang(); if (!s.ltE) makeLT(s); s.def.reset(); for (const b of s.def.bars) { b.hp = b.hp0; b.broken = false; b.col.on = true; }
    S = 'store'; coverMsg = false; const sh = gang.filter(e => e.role === 'shoot').slice(0, touch ? 3 : 4); sh.forEach((e, i) => placeE(e, s.def.posts[i % s.def.posts.length], s)); placeE(s.ltE, s.def.ltPost, s);
    SF = { s, outT: 0, barkT: 4, list: [...sh, s.ltE] }; bar.style.display = 'block'; barName.textContent = s.def.lt.name + ' · ' + s.name; toast(s.def.boss ? 'MAGPIE\'S HIDEOUT · ' + SF.list.length + ' BANDITS · TAKE HIM DOWN' : s.name + ' · ' + SF.list.length + ' BANDITS · ' + s.def.lt.name + ' HAS A KEY', 3); if (s.def.boss) say(prog().magpie ? 'You again? I just mopped in here!' : 'Four keys? Fine. Nobody leaves my parlour without a brain freeze.'); }
  function endStore(silent) { if (!SF) return; for (const e of SF.list) { Object.assign(e.f, { down: true, hostile: false, state: 'down', cover: false }); e.n.c.visible = false; e.ph = 'off'; } bar.style.display = 'none'; if (!silent) toast('YOU LEFT · THE BANDITS REGROUP', 2.2); SF = null; S = 'idle'; }
  function storeTick(dt, P, active) { const s = SF.s; SF.outT = inStore(s, P.x, P.z, 2.5) ? 0 : SF.outT + dt; if (!active || SF.outT > 2.5) { endStore(!active); return; }
    SF.barkT -= dt; if (SF.barkT <= 0) { SF.barkT = 6 + Math.random() * 6; const Ls = s.def.lines; if (Ls && Ls.length) toast('BANDIT: ' + Ls[Math.floor(Math.random() * Ls.length)], 2); }
    for (const e of SF.list) { const { n, f } = e; if (f.down) { if (e.role === 'lt' && !e.keyDone) { e.keyDone = true; if (!s.def.boss) dropKey(s, n.x, n.z); } continue; } e.t -= dt; if (e.b && e.b.broken) e.b = nearestBar(s, n.x, n.z);
      if (e.ph === 'duck') { f.cover = !!e.b; f.hostile = false; f.state = 'idle'; e.yOff = e.b ? -0.35 : 0; towards(n, P.x, P.z);
        if (e.b) { const [qx, qz] = coverPt(e.b, P, s), dx = qx - n.x, dz = qz - n.z, d = Math.hypot(dx, dz); if (d > 0.05) { const k = Math.min(d, 3.6 * dt); n.x += dx / d * k; n.z += dz / d * k; } }
        if (!e.b || e.t <= 0) { e.ph = 'peek'; e.t = e.role === 'lt' ? 3.2 : 2.6; f.cover = false; f.hostile = true; f.state = 'chase'; f.t = f.cd - (0.2 + Math.random() * 0.4); e.shot = 0; e.was = 'chase'; } }
      else if (e.ph === 'peek') { f.cover = false; e.yOff = 0; if (e.was === 'wind' && f.state === 'chase') e.shot++; e.was = f.state; if (e.shot >= (e.role === 'lt' ? 3 : 1) || e.t <= 0) { if (e.b) { e.ph = 'duck'; e.t = (e.role === 'lt' ? 0.9 : 1.1) + Math.random() * 1.4; } else { e.t = 2.6; e.shot = 0; } } } }
    const lf = s.ltE.f; barF.style.width = Math.max(0, lf.hp / lf.max * 100) + '%'; barN.textContent = Math.max(0, Math.ceil(lf.hp)) + ' / ' + lf.max;
    if (s.def.half && !SF.half && !lf.down && lf.hp < lf.max * 0.5) { SF.half = true; s.def.half(toast); gang.filter(e => e.role === 'shoot' && !SF.list.includes(e)).slice(0, 2).forEach((e, i) => { placeE(e, s.def.posts[(i + 2) % s.def.posts.length], s); e.ph = 'peek'; e.t = 1.5; SF.list.push(e); }); }
    if (SF.list.every(e => e.f.down) && s.def.boss) { const pg = prog(), first = !pg.magpie; pg.cleared[s.key] = true; pg.magpie = true; setProg(pg); try { save.addGold(first ? 150 : 40); save.addXp && save.addXp(first ? 200 : 50); if (first && save.setFlag) save.setFlag('magpieDown'); } catch (e) {} bar.style.display = 'none'; TQ.length = 0; tstT = 0; say(first ? 'Okay, okay! I give up! The outlets are yours. Just leave the gelato.' : 'Again?! My hat cost more than this shop!', 3.6); qtoast(first ? 'MAGPIE IS DOWN · THE OUTLETS ARE FREE · +150 GOLD · +200 XP' : 'MAGPIE DOWN AGAIN · +40 GOLD', 4.5); SF = null; S = 'idle'; return; }
    if (SF.list.every(e => e.f.down)) { if (!s.ltE.keyDone) { s.ltE.keyDone = true; dropKey(s, s.ltE.n.x, s.ltE.n.z); } const pg = prog(); pg.cleared[s.key] = true; setProg(pg); try { save.addGold(30); save.addXp && save.addXp(40); } catch (e) {} bar.style.display = 'none'; toast(s.name + ' CLEARED · +30 GOLD · GRAB THE KEY', 3.2); SF = null; S = 'idle'; } }
  // ---- player crouch (stop next to a barrier; move or fire to pop up) ----
  const PC = { lx: 0, lz: 0, still: 0, fireT: 0, on: false };
  const nearCover = P => (S === 'store' && SF ? SF.s.def.bars : B).some(b => !b.broken && boxD(b, P.x, P.z) < 1.25);
  function onFire() { PC.fireT = 0.9; PC.on = false; }
  function pose(fox) { if (!PC.on || !fox) return; fox.position.y -= 0.42; const P2 = fox.userData.P; if (P2 && P2.legs) P2.legs.forEach((l, k) => { l.rotation.x = k ? 0.35 : -1.35; }); }
  // ---- tick (before CB.update) ----
  const towards = (n, x, z) => { n.face = Math.atan2(x - n.x, z - n.z); };
  function tick(dt, P, active) {
    if (tstT > 0 && (tstT -= dt) <= 0) { if (TQ.length) toast(...TQ.shift()); else tst.style.display = 'none'; }
    for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.t -= dt; s.v.y -= 9 * dt; s.m.position.addScaledVector(s.v, dt); s.m.material.opacity = Math.max(0, s.t / 0.6); if (s.t <= 0) { scene.remove(s.m); s.m.material.dispose(); sparks.splice(i, 1); } }
    lockTick(P); tickKeys(dt, P); for (const s of STORES) if (s.def) { s.def.tick(dt, P); for (const b of s.def.bars) if (b.shake > 0) { b.shake -= dt; b.g.position.x = b.x + Math.sin(b.shake * 90) * 0.05; if (b.shake <= 0) b.g.position.x = b.x; } }
    for (const b of B) if (b.shake > 0) { b.shake -= dt; b.g.position.x = b.x + Math.sin(b.shake * 90) * 0.06 * (b.shake / 0.2); if (b.shake <= 0) b.g.position.x = b.x; }
    root.visible = Math.hypot(P.x - 231, P.z + 310) < 220;
    const here = inStrip(P.x, P.z), fighting = S === 'ambush' || S === 'boss';
    // crouch
    const mv = Math.hypot(P.x - PC.lx, P.z - PC.lz); PC.lx = P.x; PC.lz = P.z; PC.still = mv < 0.015 ? PC.still + dt : 0; PC.fireT = Math.max(0, PC.fireT - dt);
    PC.on = (fighting || S === 'store') && active && PC.still > 0.25 && PC.fireT <= 0 && (P.y || 0) < 0.6 && nearCover(P);
    if (PC.on) { CB.P.inv = Math.max(CB.P.inv, 0.2); if (!coverMsg) { coverMsg = true; toast('IN COVER · MOVE OR FIRE TO POP UP', 2.2); } }
    if (S === 'won') { wonT += dt; if (wonT > 2.5) endBattle(false); return; }
    if (S === 'idle') { const pg = prog(); if (!pg.street) { if (here && active && !quietToday()) startAmbush(P); } else storeCheck(P, active); return; }
    if (S === 'store') { if (SF) storeTick(dt, P, active); else S = 'idle'; return; }
    // leave the fight (walk away / go inside) → the gang goes back in
    outT = here || inStrip(P.x, P.z, 30) ? 0 : outT + dt; if (!active || outT > 3) { endBattle(); if (!active) return; toast('YOU LEFT THE OUTLETS · THE GANG WENT BACK IN', 2.4); return; }
    if (S === 'ambush') {
      for (const e of gang) { const { n, f } = e; if (f.down) continue; e.t -= dt;
        if (e.ph === 'run') { const [cx, cz] = e.b.cover, dx = cx - n.x, dz = cz - n.z, d = Math.hypot(dx, dz); f.hostile = false; f.state = 'idle'; if (d > 0.3) { const s = Math.min(d, 4.2 * dt); n.x += dx / d * s; n.z += dz / d * s; n.face = Math.atan2(dx, dz); n.speedNow = 4.2; } else { e.ph = 'duck'; e.t = 0.6 + Math.random() * 1.2; } }
        else if (e.ph === 'duck') { f.cover = !e.b.broken; f.hostile = false; f.state = 'idle'; e.yOff = -0.35; towards(n, P.x, P.z); const [cx, cz] = e.b.cover; n.x += (cx - n.x) * Math.min(1, dt * 4); n.z += (cz - n.z) * Math.min(1, dt * 4);
          if (e.b.broken || e.t <= 0) { e.ph = 'peek'; e.t = 2.6; f.cover = false; f.hostile = true; f.state = 'chase'; f.t = f.cd - (0.2 + Math.random() * 0.4); e.shot = false; } }
        else if (e.ph === 'peek') { f.cover = false; e.yOff = 0; if (f.state === 'wind') e.shot = true; if ((e.shot && f.state === 'chase') || e.t <= 0) { if (!e.b.broken) { e.ph = 'duck'; e.t = 1.1 + Math.random() * 1.6; } else { e.t = 2.6; e.shot = false; } } }
        else if (e.ph === 'rush') { f.hostile = true; } }
      if (gang.every(e => e.f.down)) startBoss(); }
    if (S === 'boss' && boss) { const { n, f } = boss; boss.t -= dt; barF.style.width = Math.max(0, f.hp / f.max * 100) + '%'; barN.textContent = Math.max(0, Math.ceil(f.hp)) + ' / ' + f.max;
      if (f.down) { win(); return; }
      if (boss.ph === 'duck') { f.cover = true; f.hostile = false; f.state = 'idle'; towards(n, P.x, P.z); boss.yOff = ROOF[1] - 0.55; if (boss.t <= 0) { boss.ph = 'peek'; boss.t = 3.2; f.cover = false; f.hostile = true; f.state = 'chase'; f.t = f.cd - 0.3; boss.shots = 0; boss.was = 'chase'; } }
      else if (boss.ph === 'peek') { boss.yOff = ROOF[1]; f.cover = false; if (boss.was === 'wind' && f.state === 'chase') boss.shots++; boss.was = f.state;
        if (f.hp < f.max * 0.5) { boss.ph = 'jump'; boss.t = 0; boss.jumpFrom = [n.x, n.z]; f.cover = true; f.hostile = false; f.state = 'idle'; TQ.length = 0; say('Not the suit! Boys, hold them off!', 2.2); qtoast('MAGPIE JUMPS DOWN · HE\'S RUNNING!', 2); }
        else if (boss.shots >= 3 || boss.t <= 0) { boss.ph = 'duck'; boss.t = 1.4 + Math.random(); } }
      else if (boss.ph === 'jump') { boss.t += dt; const u = Math.min(1, boss.t / 0.9), [x0, z0] = boss.jumpFrom; n.x = x0 + (231 - x0) * u; n.z = z0 + (-300.5 - z0) * u; boss.yOff = ROOF[1] * (1 - u) + Math.sin(Math.PI * u) * 2.2; f.cover = true;
        if (u >= 1) { boss.yOff = 0; boss.ph = 'flee'; f.cover = true; f.hostile = false; f.state = 'idle'; spark(n.x, 0.2, n.z, 16, 0x9a948d); } }
      else if (boss.ph === 'flee') { const G2 = STORES[2].b, tx = G2 ? G2.door[0] : 231, tz = G2 ? G2.door[1] + 2.4 : -291.6, dx = tx - n.x, dz = tz - n.z, d = Math.hypot(dx, dz); f.cover = true; f.hostile = false; f.state = 'idle'; n.face = Math.atan2(dx, dz); n.speedNow = 5;
        if (d > 0.3) { const k = Math.min(d, 5.2 * dt); n.x += dx / d * k; n.z += dz / d * k; } else { streetWon(); return; } }
      else if (boss.ph === 'street') { boss.yOff = 0; f.cover = false; f.hostile = true; } }
  }
  // CB.attack extra targets: every standing barrier (shots that miss a ducked bandit hit his cover)
  const barHits = list => list.filter(b => !b.broken).sort((a, b) => Math.hypot(b.x - PC.lx, b.z - PC.lz) - Math.hypot(a.x - PC.lx, a.z - PC.lz)).map(b => ({ x: b.x, z: b.z, r: Math.max(b.w, b.d) / 2, onHit: k => hitBarrier(b, k) }));
  const hits = () => S === 'store' && SF ? [...SF.s.def.hitTargets(toast), ...barHits(SF.s.def.bars)] : (S === 'ambush' || S === 'boss') ? B.filter(b => !b.broken).sort((a, b) => Math.hypot(b.x - PC.lx, b.z - PC.lz) - Math.hypot(a.x - PC.lx, a.z - PC.lz)).map(b => ({ x: b.x, z: b.z, r: Math.max(b.w, b.d) / 2, onHit: k => hitBarrier(b, k) })) : [];
  function playerDown() { const f = S === 'ambush' || S === 'boss' || S === 'store'; if (f) { lost = true; if (S === 'store') endStore(true); else endBattle(); } return f; }
  window.__outlets = { STORES, prog, setProg, street: () => { const pg = prog(); pg.street = true; setProg(pg); endBattle(); }, reset: () => { setProg(null); endBattle(); }, B, gang, get S() { return S; }, get boss() { return boss; }, start: () => startAmbush({}), boss2: () => { if (!gang.length) makeGang(); if (!boss) makeBoss(); for (const e of gang) { e.f.down = true; e.n.c.visible = false; } startBoss(); }, PC };
  return { tick, hits, onFire, pose, playerDown, fighting: () => S === 'ambush' || S === 'boss' || S === 'store', crouched: () => PC.on };
}
