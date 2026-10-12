// MERU 2.0 — DEMO TOUR (fly view): a cinematic camera that visits every area in turn. Each stop = a slow camera move
// (from -> to, looking at a target), ~8 s, then cuts to the next. Uses the blockout's driver hook, so the orbit camera,
// labels and walk mode are untouched; stop() hands the camera back to the orbit view at the last place.
// Stop data: from [x, y, z], to [x, y, z], look [x, y, z] (optional look2 to pan), night = blend to night for that stop,
// follow: 'train' = chase the moving train. inside: true = an interior stop (eye height, no terrain lift), dur = its own length in s.
export const TOUR = [
  { key: 'start', label: 'Fountain Plaza', cap: 'The start: fountain, flower ring, street trees, Tavern + Bank to the north', from: [6, 3.2, 44], to: [4, 3.6, 24], look: [0, 4, -40] },
  { key: 'fountain', label: 'The Fountain', cap: 'Jets, lawn edging, benches, lamps', from: [18, 2.4, 14], to: [-16, 2.6, 16], look: [0, 2.5, 0] },
  { key: 'market', label: 'Market Plaza', cap: 'Promenade, Item Shop, Armory, lawns + flower beds', from: [-52, 3, 22], to: [-112, 3.4, 22], look: [-100, 3, -20], look2: [-140, 3, -20] },
  { key: 'lanes', label: 'Lanes Court', cap: 'Meru Lanes, Burgers, Car Rental + the rental lot', from: [52, 3, -22], to: [118, 3.4, -22], look: [100, 4, 20], look2: [140, 3, 30] },
  { key: 'civic', label: 'Civic Row', cap: 'Bank, Police, Casino, Tavern', from: [40, 4, -44], to: [-50, 4, -44], look: [0, 6, -90], look2: [-60, 6, -90] },
  { key: 'inItem', label: 'Inside · Item Shop', cap: "Kia's shelves: batteries, energy cells, chocolates, amber, potions · gondolas, the glass case, window displays", inside: true, dur: 11, from: [-28, 2.5, 61.2], to: [-28, 2.0, 66.8], look: [-30, 1.5, 75.5], look2: [-27, 1.4, 72] },
  { key: 'inArmory', label: 'Inside · Armory', cap: "Bram's wall of swords, halberds and shields · armour stands · the forge glowing in the corner", inside: true, dur: 11, from: [21.2, 2.6, 61.6], to: [33.5, 2.4, 63.6], look: [26, 2.2, 75.5], look2: [36.2, 1.2, 74.4] },
  { key: 'inFortune', label: 'Inside · Fortune Teller', cap: "Ora's tent: the round rug, star tapestry, crystal ball, tarot cards, lanterns and candles", inside: true, dur: 11, from: [-76.6, 2.2, -49.0], to: [-79.2, 1.75, -53.6], look: [-80, 1.4, -58], look2: [-80, 1.25, -56.6] },
  { key: 'inLanes', label: 'Inside · Meru Lanes', cap: 'Dash bowls lane one · six lanes, score screens, settees, ball racks, snack bar, pool + arcade', inside: true, dur: 12, from: [117.2, 2.3, -29.2], to: [124.4, 1.6, -34.4], look: [136, 0.8, -35], look2: [142.5, 0.4, -36] },
  { key: 'inCasino', label: 'Inside · Casino', cap: 'Red runner, crystal chandeliers, slot machines, poker tables, the wheel, the cashier cage', inside: true, dur: 12, from: [-106.6, 2.6, 0.6], to: [-127, 3.2, 1.2], look: [-148, 1.6, -3], look2: [-118, 3, 24] },
  { key: 'inPolice', label: 'Inside · Police', cap: 'Front desk, waiting seats, notice board · through the steel door to the jail hall, the guard and the two cells', inside: true, dur: 12, from: [-86, 2.4, -81.4], to: [-86, 2.1, -97.5], look: [-86, 1.6, -92], look2: [-99, 1.4, -120] },
  { key: 'inBank', label: 'Inside · Bank', cap: 'Marble hall, columns, chandeliers, the teller counter · the open vault, gold bars and deposit boxes', inside: true, dur: 12, from: [86, 2.6, -81.2], to: [97.5, 2.4, -97.2], look: [84, 2, -101], look2: [97, 1.2, -119] },
  { key: 'inCrest', label: 'Inside · Crestview House', cap: 'Checker marble lobby, the fireplace and sofas, chandeliers, the realtor desk, the brass lift', inside: true, dur: 11, from: [-63, 2.5, 89], to: [-72, 2.3, 94], look: [-75, 1.4, 106], look2: [-70, 1.4, 82] },
  { key: 'inLakeT', label: 'Inside · Lakeside Tower', cap: 'Terrazzo lobby, the gas fire, pendant lights, the realtor desk, the steel lift', inside: true, dur: 11, from: [103, 2.5, 121], to: [112, 2.3, 116], look: [117, 1.4, 101], look2: [112, 1.4, 128] },
  { key: 'inStation', label: 'Inside · Town Square Station', cap: 'The ticket office and its clerk, ticket machines, the DEPARTURES board, the loop map, benches, the clock', inside: true, dur: 11, from: [3, 2.4, 114], to: [6, 2.2, 128], look: [-10, 1.6, 122], look2: [19, 3, 122] },
  { key: 'inRental', label: 'Inside · Car Rental', cap: 'The rental desk and clerk, the key board, waiting chairs', inside: true, dur: 9, from: [129.5, 2.2, 27.5], to: [121, 2.2, 29], look: [125, 1.3, 36.5], look2: [125, 1.3, 36.5] },
  { key: 'inBarracks', label: 'Inside · Barracks', cap: 'The drill hall: the runner to King Might on the dais, bunks, mess tables, the sparring circle, archery butts', inside: true, dur: 12, from: [0, 2.6, -402], to: [6, 3.2, -414], look: [0, 2, -437], look2: [26, 1.4, -428] },
  { key: 'south', label: 'South Gardens', cap: 'Crestview House, Lakeside Tower, Town Square Station', from: [50, 5, 48], to: [-40, 5, 52], look: [20, 8, 110], look2: [-40, 8, 110] },
  { key: 'traffic', label: 'Ring Road', cap: 'Traffic: sedans, hatchbacks, SUVs, vans, taxis; kerbs, bus stops, crossings', from: [174, 2.2, -100], to: [174, 2.4, -20], look: [160, 1, 40] },
  { key: 'train', label: 'The Train', cap: 'Four walkable cars on a 6-stop loop', follow: 'train' },
  { key: 'castlePath', label: 'Castle Path', cap: 'Stone walls, braziers, banners, pines, the castle gate', from: [3, 3, -150], to: [3, 3.4, -285], look: [0, 6, -330] },
  { key: 'barracks', label: 'Barracks', cap: "Tread's Tank Works, Tank Range, Planet Defense gate", from: [60, 40, -290], to: [150, 40, -300], look: [140, 0, -400] },
  { key: 'arenaPath', label: 'Arena Path', cap: 'Torches, stalls, bunting over the clearings', from: [165, 3, 2], to: [330, 3.4, 2], look: [400, 6, 0] },
  { key: 'arena', label: 'Meru Arena', cap: 'The arena gate', from: [330, 22, -60], to: [340, 22, 50], look: [405, 4, 0] },
  { key: 'skate', label: 'Skate Park', cap: 'Bowl, half-pipe, rails, floodlights', from: [-160, 12, 46], to: [-160, 12, -44], look: [-205, 0, 0] },
  { key: 'ruinsPath', label: 'Ruins Path', cap: 'Violet lanterns, broken columns, the two old arches', from: [-245, 3, 4], to: [-380, 3.4, 4], look: [-440, 4, 0] },
  { key: 'ruins', label: 'The Ruins', cap: 'Cave mouth + the Ruins Hills', from: [-370, 25, -40], to: [-370, 25, 40], look: [-430, 3, 0] },
  { key: 'lakePath', label: 'Lake Path', cap: 'Hedges, lanterns, THE LAKE arch, boardwalk', from: [2, 3, 150], to: [2, 3, 222], look: [0, 2, 270] },
  { key: 'lake', label: 'The Lake', cap: "Speedboat Bay, Jon's Boatworks, School for the Blind, jetties", from: [90, 14, 212], to: [-120, 14, 212], look: [0, 0, 300], look2: [-180, 0, 250] },
  { key: 'pearl', label: 'Pearl Island', cap: 'Beach, palms, the deep pond, the ferry', from: [140, 35, 250], to: [260, 35, 255], look: [200, 6, 350] },
  { key: 'falls', label: 'Meru Falls', cap: 'Waterfall, plunge pool, overlook deck', from: [-320, 18, 280], to: [-320, 18, 350], look: [-385, 14, 320] },
  { key: 'ridge', label: 'Castle Ridge', cap: 'Lantern trail + the lookout', from: [-120, 45, -320], to: [-180, 45, -330], look: [-210, 20, -410] },
  { key: 'hillPark', label: 'Hill Park', cap: 'Summit with the skyline view', from: [200, 34, -120], to: [280, 34, -130], look: [240, 18, -180] },
  { key: 'night', label: 'Meru at Night', cap: 'Lit windows, neon, street lamps, beacons', night: true, from: [230, 40, -160], to: [180, 30, -120], look: [0, 10, 0] },
];

export function createTour(g, { onStop = () => {}, onProgress = () => {}, onEnd = () => {}, onTick = () => {} } = {}) {
  const { THREE, camera } = g.K, DUR = 8.5, ease = t => t * t * (3 - 2 * t), v = new THREE.Vector3(), look = new THREE.Vector3();
  let i = 0, t = 0, paused = false, on = false, nightWas = false;
  const safeY = (x, y, z, s) => { if (s && s.inside) return y; const h = g.heights && g.heights.terrainAt ? g.heights.terrainAt(x, z) || 0 : 0; return Math.max(y, h + 2.2); };
  function show(k) { i = (k + TOUR.length) % TOUR.length; t = 0; const s = TOUR[i]; g.setNight(!!s.night); onStop({ i, n: TOUR.length, label: s.label, cap: s.cap, paused }); }
  function drive(dt) {
    if (!paused) t += dt; onTick(dt); const s = TOUR[i], D = s.dur || DUR, u = ease(Math.min(1, t / D));
    if (s.follow === 'train') { const F = g.train.carF[0], yaw = F.yaw, fx = Math.sin(yaw), fz = Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw), y = 8.2;
      const side = 14 - u * 6, ahead = 18 - u * 26; v.set(F.x + fx * ahead + rx * side, y + 4.5, F.z + fz * ahead + rz * side); look.set(F.x + fx * 4, y + 1.6, F.z + fz * 4); }
    else { v.set(s.from[0] + (s.to[0] - s.from[0]) * u, s.from[1] + (s.to[1] - s.from[1]) * u, s.from[2] + (s.to[2] - s.from[2]) * u); v.y = safeY(v.x, v.y, v.z, s);
      const l2 = s.look2 || s.look; look.set(s.look[0] + (l2[0] - s.look[0]) * u, s.look[1] + (l2[1] - s.look[1]) * u, s.look[2] + (l2[2] - s.look[2]) * u); }
    camera.position.copy(v); camera.lookAt(look); onProgress(Math.min(1, t / D));
    if (t >= D) { if (i === TOUR.length - 1) { stop(); onEnd(); } else show(i + 1); } }
  let ringsWas = true; function start(k = 0) { nightWas = g.time() > 0.5; ringsWas = g.K.scene && g.spk ? true : true; try { g.show('rings', false); } catch (e) {} on = true; paused = false; g.setDriver(drive); show(k); }
  function stop() { if (!on) return; on = false; g.setDriver(null); const C = g.orbit; C.goal = null; C.tx = look.x; C.tz = look.z; const dx = camera.position.x - look.x, dz = camera.position.z - look.z, d = Math.max(60, Math.hypot(dx, dz, camera.position.y - look.y)); C.yaw = Math.atan2(dx, dz); C.dist = d; C.pitch = 0.6; g.setNight(nightWas); try { g.show('rings', ringsWas); } catch (e) {} }
  return { start, stop, next: () => show(i + 1), prev: () => show(i - 1), go: k => show(k), pause(p = !paused) { paused = p; onStop({ i, n: TOUR.length, label: TOUR[i].label, cap: TOUR[i].cap, paused }); }, get on() { return on; }, stops: TOUR.map(s => s.label) };
}
