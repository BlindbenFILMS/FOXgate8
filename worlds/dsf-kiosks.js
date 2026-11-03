// DEEP SPACE FOX · the five KIOSKS on the Main Ring (s353): walk-up counters, no fade-in rooms.
// Each kiosk gets a glowing BUY pad on the floor beside its front (walk onto it = menu), a keeper with topics, and a small live detail.
// Frame: kiosk group sits at pol(R.kiosk, θ), rotation.y = π − θ·D, local +z faces out to the promenade.
export const KIOSK_ITEMS = { honeyroot: 'Honeyroot Stick', firewrap: 'Firewrap', jiddaTea: 'Jidda Tea', healthPill: 'Health Pill', prayerBeads: 'Gayan Prayer Beads', gayaChart: 'Gayan Star Chart' };
const EAT = { honeyroot: 'Sweet, hot, sticky. Pav was right.', firewrap: 'Spicy! Your ears go warm.', jiddaTea: 'It has seen better decades. You still want more.', healthPill: 'You feel steadier.' };
const NEWS = [
  ['FLEET GOES QUIET', 'Machine Fleet stops answering hails. Pearl Sail says nothing.'],
  ['LOADERS TALK BACK', 'Bay Four loaders froze mid-lift. Witnesses heard "a voice not their own".'],
  ['UNIT-9 WALKS OUT', 'Militia liaison left mid-watch. No order on file.'],
  ['GATE ACTIVITY UP', 'Ops logs three openings in one shift. Captain Benny: "Watching it."'],
  ['DRONE SAYS SORRY', 'A crated sentry drone apologised to its handler. Twice.'],
];
const VISION = ['A machine stands at a fork. It chooses.', 'Two lights share one lamp. Neither goes out.', 'A voice speaks through a robot. It is not the robot.'];

export function setupKiosks({ K, ST, KIOSKS, R, D, pol, addNpc, save, ITEM_LABELS }) {
  const { THREE, M, toon, basic, glowSprite, LOW } = K;
  Object.assign(ITEM_LABELS, KIOSK_ITEMS);
  const anims = [], spots = [], keepers = {}, clk = { t: 0 }; anims.push(dt => { clk.t += dt; });
  const kk = key => KIOSKS.find(k => k.key === key);
  const world = (k, lx, lz) => { const [x0, z0] = pol(R.kiosk, k.th), ry = Math.PI - k.th * D; return [x0 + lx * Math.cos(ry) + lz * Math.sin(ry), z0 - lx * Math.sin(ry) + lz * Math.cos(ry)]; };
  const face = k => Math.PI - k.th * D; // local +z, out to the promenade
  const frontZ = k => k.d / 2 + k.front;
  const G = key => ST.kioskG[key];
  const buy = (X, id, price, msg) => { if (!X.save.spend(price)) { X.toast('Not enough gold. ' + price + ' G.'); X.audio.tone(140, 0.25, 0.05, 'square'); return false; } X.save.give(id); X.audio.tone(988, 0.12, 0.05, 'square'); setTimeout(() => X.audio.tone(1318, 0.2, 0.04, 'square'), 90); X.toast(msg || (KIOSK_ITEMS[id] || ITEM_LABELS[id] || id) + ' added to your bag.'); return true; };
  const gold = X => 'IN YOUR POCKET ' + (X.save.data.gold || 0) + ' G';
  const bump = s => save.setStat(s, ((save.data.stats || {})[s] || 0) + 1);

  // the BUY pad: a pulsing floor ring + a big flat label, beside the kiosk front
  function pad(k, run) {
    const lx = -(k.w / 2 - 1.2), lz = frontZ(k) + 1.2, [x, z] = world(k, lx, lz), g = new THREE.Group(); g.position.set(x, 0.03, z); g.rotation.y = face(k); K.scene.add(g);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.3, 40), basic(k.trim, 0.9, true)); ring.rotation.x = -Math.PI / 2; g.add(ring);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1.05, 40), basic(k.trim, 0.16, true)); disc.rotation.x = -Math.PI / 2; g.add(disc);
    const lab = ST.signPlane('BUY', 1.5, 0.6, { fg: '#0e0d0c', bg: k.trim }, g, 0, 0.02, 1.85); lab.rotation.set(-Math.PI / 2, 0, Math.PI);
    anims.push((dt, t) => { ring.material.opacity = 0.55 + 0.35 * Math.sin(t * 3 + k.th); });
    spots.push({ key: 'kiosk_' + k.key, x, z, r: 1.4, run });
  }
  function keeperAt(key, npcKey, extra) { const k = kk(key), [x, z] = world(k, 0, frontZ(k) + 1.8); const n = addNpc(npcKey, [x, z], { face: face(k), keeper: true }); if (extra) Object.assign(n, extra); keepers[key] = n; return n; }

  // ---------- PAV'S HONEYROOT (θ45) · Old Pav, hot food ----------
  { const k = kk('dsfPavs'), g = G(k.key), puffs = [];
    for (let i = 0; i < (LOW ? 3 : 6); i++) puffs.push(glowSprite(0, 2, -0.6, 0xffffff, 0.8, 0, g));
    let burst = -9; anims.push(() => { const u = clk.t - burst; puffs.forEach((p, i) => { if (u > 1.6) { p.material.opacity = 0; return; } const a = i / puffs.length * 6.283; p.position.set(-2.5 + (i % 3) * 2.5 + Math.cos(a) * u * 0.4, 2 + u * 2.4, -0.6 + Math.sin(a) * u * 0.3); p.scale.setScalar(0.8 + u * 1.6); p.material.opacity = 0.5 * (1 - u / 1.6); }); });
        pad(k, X => pavMenu(X));
    function pavMenu(X) { X.prompt("PAV'S HONEYROOT", 'Hot food · ' + gold(X), [['HONEYROOT · ON THE HOUSE', () => takeRoot(X)], ['FIREWRAP · 6 G', () => { if (buy(X, 'firewrap', 6, 'Firewrap, hot off the grill.')) steam(X); }], ['JIDDA TEA · 5 G', () => { if (buy(X, 'jiddaTea', 5, 'A cup of Jidda tea. Old, but good.')) steam(X); }], ['NOT NOW', null]]); }
    function steam(X) { burst = clk.t; X.audio.tone(220, 0.5, 0.03, 'sawtooth', 0.5); }
    function takeRoot(X) { X.save.give('honeyroot'); steam(X); bump('dsfHoneyrootTaken');
      if (!X.save.flag('dsfPavTook')) { X.save.setFlag('dsfPavTook'); X.note('YOU TOOK IT', 'Old Pav blinks. "Now I need a new joke, STEWARD."'); } else X.toast('Honeyroot stick, on the house. Pav grins.'); }
    K.pavMenu = pavMenu; }

  // ---------- STATION 8 NEWS (θ135) · Anchor Sola ----------
  { const k = kk('dsfNews'), g = G(k.key); let tick = null;
    g.traverse(o => { if (!tick && o.isMesh && o.material && o.material.map && o.material.map.wrapS === THREE.RepeatWrapping && o.material.map.image && o.material.map.image.getContext) tick = o.material.map; });
    const draw = text => { if (!tick) return; const c = tick.image.getContext('2d'), w = tick.image.width, h = tick.image.height; c.fillStyle = '#0a0a12'; c.fillRect(0, 0, w, h); c.font = '800 54px Archivo, sans-serif'; c.fillStyle = '#f3f2f2'; c.textBaseline = 'middle'; c.fillText(text, 10, h / 2); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 10); tick.needsUpdate = true; };
    const base = 'FREIGHTER IN LIGHT, OUT HEAVY  ·  GATE ACTIVITY UP  ·  MACHINE FLEET SIGHTED NEAR PYLON 3  ·  ';
    let live = 0; anims.push(dt => { if (live > 0) { live -= dt; if (live <= 0) draw(base); } });
    const cam = glowSprite(k.w / 2 - 0.4, 4.3, k.d / 2 - 0.4, 0xff2010, 0, 0, g); anims.push((dt, t) => { cam.material.opacity = live > 0 ? 0.9 : 0; cam.scale.setScalar(live > 0 ? 3 + Math.sin(t * 8) * 0.4 : 0.01); });
    function newsMenu(X) { X.prompt('STATION 8 NEWS', 'On air · ' + gold(X), [["TODAY'S PAPER · 1 G", () => paper(X), (X.save.data.gold || 0) < 1], ['GO ON AIR', () => onAir(X)], ['NOT NOW', null]]); }
    function paper(X) { if (!X.save.spend(1)) return; const n = ((save.data.stats || {}).dsfPapers || 0) % NEWS.length; bump('dsfPapers'); X.audio.tone(660, 0.1, 0.04, 'square'); X.note(NEWS[n][0], NEWS[n][1]); }
    function onAir(X) { draw('LIVE  ·  STEWARD BEN ON THE MAIN RING  ·  SAY HELLO, STATION  ·  LIVE  ·  STEWARD BEN ON THE MAIN RING  ·  '); live = 12; X.audio.tone(880, 0.3, 0.05, 'sine'); setTimeout(() => X.audio.tone(1175, 0.4, 0.04, 'sine'), 200);
      if (!X.save.flag('dsfOnAir')) { X.save.setFlag('dsfOnAir'); X.note('YOU ARE ON AIR', 'Your face is on every screen on the ring. Wave!'); } else X.toast('Live again. The ticker shouts your name.'); }
    pad(k, newsMenu);
    keeperAt(k.key, 'dsfAnchor', { name: 'ANCHOR SOLA', role: 'Station 8 News (DRAFT name)', greeting: 'Got a story, STEWARD? I have a camera.', lines: [{ who: 'npc', text: 'STEWARD! Station 8 News. If it happens on the ring, it runs on my ticker.' }],
      topics: [{ label: 'Buy a paper', replies: [{ who: 'npc', text: 'One gold. Fresh every shift.' }], act: () => newsMenu(K.X()) },
        { label: 'Put me on air', replies: [{ who: 'npc', text: 'Stand still. Smile. You are live.' }], act: () => onAir(K.X()) },
        { label: 'Any big story?', replies: [{ who: 'npc', text: 'The Fleet went quiet all at once. Robots do not all get shy together.' }, { who: 'npc', text: 'Someone is talking for them. I want that name.' }] }] }); }

  // ---------- VOR'S EXCHANGE (θ225) · Tessa Vor ----------
  { const k = kk('dsfVorKiosk');
    function vorMenu(X) { const roots = X.save.count('honeyroot'); X.prompt("VOR'S EXCHANGE", 'Items · ' + gold(X), [['HEALTH PILL · 25 G', () => buy(X, 'healthPill', 25)], ['ENERGY POD · 30 G', () => buy(X, 'energyPod', 30)], ['HONEYROOT · 4 G', () => buy(X, 'honeyroot', 4)], ['SELL HONEYROOT · +2 G' + (roots ? ' (' + roots + ')' : ''), () => { if (X.save.take('honeyroot')) { X.save.addGold(2); X.audio.tone(1318, 0.15, 0.04, 'square'); X.toast('Tessa pays 2 G. "Pav gave you that, did he?"'); } }, !roots], ['NOT NOW', null]]); }
    pad(k, vorMenu);
    K.vorMenu = vorMenu; }

  // ---------- SPARK & BOLT (θ262) · Spark + BOLT, a Fleet bot unplugged before the hack ----------
  { const k = kk('dsfSparkBolt'), g = G(k.key), [bx, bz] = world(k, 2.2, frontZ(k) + 1.4);
    const bolt = new THREE.Group(); bolt.position.set(bx, 1.5, bz); bolt.rotation.y = face(k); K.scene.add(bolt);
    M(new THREE.BoxGeometry(0.55, 0.45, 0.45), toon('#c8ccd2'), 0, 0, 0, bolt, 0.03);
    M(new THREE.BoxGeometry(0.42, 0.14, 0.05), toon('#1a1c22'), 0, 0.05, 0.24, bolt, 0);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), basic('#5fe3ff')); eye.position.set(0, 0.05, 0.27); bolt.add(eye);
    const eg = glowSprite(0, 0.05, 0.3, 0x5fe3ff, 0.5, 0.7, bolt);
    M(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 5), toon('#555'), 0, 0.37, 0, bolt, 0); const tip = glowSprite(0, 0.55, 0, 0xff3a1a, 0.3, 0.9, bolt);
    for (const s of [-1, 1]) { const p = M(new THREE.BoxGeometry(0.3, 0.04, 0.16), toon('#ff4a3a'), s * 0.42, 0.05, 0, bolt, 0); p.rotation.z = s * 0.2; }
    ST.obs.push({ x: bx, z: bz, r: 0.6 });
    let zap = -9; const flash = glowSprite(0, 4.1, 0, 0xff3a1a, 0, 0, g);
    anims.push((dt, t) => { bolt.position.y = 1.5 + Math.sin(t * 2.2) * 0.08; bolt.rotation.y = face(k) + Math.sin(t * 0.7) * 0.5; tip.material.opacity = (t % 1.1) < 0.12 ? 1 : 0.25; const u = clk.t - zap; flash.material.opacity = u < 0.6 ? 1 - u / 0.6 : 0; flash.scale.setScalar(u < 0.6 ? 2 + u * 8 : 0.01); });
    const test = X => { zap = clk.t; X.audio.tone(1800, 0.08, 0.05, 'square'); setTimeout(() => X.audio.tone(600, 0.25, 0.05, 'sawtooth', -2), 60); bump('dsfSparkTests'); X.toast('ZAP! Bolt beeps. "Clean shot, STEWARD."'); };
    function sparkMenu(X) { X.prompt('SPARK & BOLT', 'Special weapons · ' + gold(X), [['TEST FIRE · FREE', () => test(X)], ['CHARGE CELL · 20 G', () => buy(X, 'chargeCell', 20)], ['WEAPON MODS · LATER', null, true], ['NOT NOW', null]]); }
    pad(k, sparkMenu);
    keeperAt(k.key, 'dsfSpark', { name: 'SPARK', role: 'Spark & Bolt (DRAFT name)', greeting: 'Bolt missed you, STEWARD. So did I.', lines: [{ who: 'npc', text: 'STEWARD! Special weapons. I build them, Bolt tests them.' }],
      topics: [{ label: 'Show me what you sell', replies: [{ who: 'npc', text: 'Charge cells now. Mods once the yards send parts.' }], act: () => sparkMenu(K.X()) },
        { label: 'Who is Bolt?', replies: [{ who: 'npc', text: 'Fleet-built. I unplugged him from the Fleet link to fix his eye.' }, { who: 'npc', text: 'That night the rest went strange. Bolt stayed Bolt.' }] },
        { label: 'Can Bolt talk?', replies: [{ who: 'npc', text: 'Beep. STEWARD. My friends hear a voice. I do not. Find it?' }], act: () => { if (!save.flag('dsfBoltHeard')) { save.setFlag('dsfBoltHeard'); K.X().note('BOLT IS STILL BOLT', 'Unplugged from the Fleet link, Bolt never heard the voice.'); } } }] });
 }

  // ---------- GAYAN CURIOS (θ315) · Old Mira ----------
  { const k = kk('dsfCurios'), g = G(k.key); let look = -9;
    const fl = glowSprite(0, 2.9, 0, 0xffd27a, 0, 0, g);
    anims.push(() => { const u = clk.t - look; fl.material.opacity = u < 2 ? 0.9 * (1 - u / 2) : 0; fl.scale.setScalar(u < 2 ? 2.5 + u * 3 : 0.01); });
    const gaze = X => { look = clk.t; X.audio.tone(392, 1.4, 0.04, 'sine'); setTimeout(() => X.audio.tone(587, 1.2, 0.03, 'sine'), 400); const n = ((save.data.stats || {}).dsfOrb || 0) % VISION.length; bump('dsfOrb'); X.note('THE ORB SHOWS', VISION[n]); };
    function curiosMenu(X) { X.prompt('GAYAN CURIOS', 'Relics · curios · ' + gold(X), [['LOOK INTO THE ORB · FREE', () => gaze(X)], ['PRAYER BEADS · 12 G', () => buy(X, 'prayerBeads', 12)], ['GAYAN STAR CHART · 15 G', () => buy(X, 'gayaChart', 15)], ['NOT NOW', null]]); }
    pad(k, curiosMenu);
    keeperAt(k.key, 'dsfCurio', { name: 'OLD MIRA', role: 'Gayan Curios (DRAFT name)', greeting: 'The orb asked after you, STEWARD.', lines: [{ who: 'npc', text: 'STEWARD. Everything here came up from Gaya. Some of it remembers.' }],
      topics: [{ label: 'Show me your curios', replies: [{ who: 'npc', text: 'Beads for calm, charts for wandering.' }], act: () => curiosMenu(K.X()) },
        { label: 'What is the orb?', replies: [{ who: 'npc', text: 'Temple glass. It shows what is true, not what is easy.' }], act: () => gaze(K.X()) },
        { label: 'Seen any robots?', replies: [{ who: 'npc', text: 'A Fleet bot stood by my dome last week. It looked lost, not angry.' }] }] }); }

  // topics for the two ring keepers already on the map (2D lines kept)
  function wire(list) {
    const pav = list.find(n => n.key === 'walkVendor'), tessa = list.find(n => n.key === 'ringMerchant');
    if (pav) Object.assign(pav, { greeting: 'STEWARD. Honeyroot? On the house.', topics: [{ label: 'Something hot', replies: [{ who: 'npc', text: 'Honeyroot, firewrap, tea. Pick.' }], act: () => K.pavMenu(K.X()) },
      { label: 'Where does honeyroot come from?', replies: [{ who: 'npc', text: 'Grower Moss, second bed in Hydroponics. Best on the station.' }] }] });
    if (tessa) Object.assign(tessa, { greeting: 'Back for the tea, STEWARD?', topics: [{ label: 'Show me your stock', replies: [{ who: 'npc', text: 'Pills, pods, honeyroot. I buy honeyroot back too.' }], act: () => K.vorMenu(K.X()) },
      { label: 'How is trade?', replies: [{ who: 'npc', text: 'Slow. Fleet freighters used to run my crates. Now they drift past.' }] }] });
  }
  const WORK = { dsfAnchor: 'RING REPORTER: chase stories round the ring. Sola trains you once the station map is done.', dsfSpark: 'BENCH HAND: sort parts, test cells. Spark takes you on once the station map is done.', dsfCurio: 'DUSTING THE RELICS: gentle paws only. Mira takes you on once the station map is done.', walkVendor: 'GRILL HAND: honeyroot never stops. Pav takes you on once the station map is done.', ringMerchant: 'CRATE RUNNER: carry stock from Bay Four. Tessa takes you on once the station map is done.' };
  function use(id, X) { if (!EAT[id]) return false; X.save.take(id); X.audio.tone(523, 0.15, 0.04, 'sine'); setTimeout(() => X.audio.tone(784, 0.2, 0.03, 'sine'), 100); X.toast(EAT[id]); return true; }
  return { anims, spots, wire, WORK, use };
}
