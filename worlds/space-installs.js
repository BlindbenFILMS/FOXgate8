// 8 GATES · SPACE INSTALLS (s376b, Ben: "polish them, sleek and futuristic, less boxy"). The space map's 5 builds, 3D from scratch:
// SHIPYARD · FUEL DEPOT · MINING PLATFORM · STARGATE · WORLD DOCK (the long straight gantry above each world, Meru's dock shape).
// Edited in "Space Install Workshop.dc.html" → localStorage 'space.installs.v1' = { yard:{...}, fuel:{...}, ... }.
// Look: curved shapes (lathe profiles, swept tubes, arcs, capsules, rounded boxes), pearl hulls, graphite, glow strips in the accent,
// toon shading + a cool fresnel RIM on every edge + ink outline pushed along the normals.
// Phone budget: each model's static parts are BAKED into 1 toon mesh + 1 ink shell + 1 glow mesh; all its lights = 1 Points draw.
// Moving parts (crane, rotors, rings) are their own small baked meshes. Units = space-map units (ship half-length 3, planet r 24).
// Previous versions: backup/space/space-installs.s376a.js (boxy) · s376b.js (sleek, before the traffic + flow polish).
// s377e: ship = no flame cones, engine TRAIL (kit.trail) instead.
// s376c POLISH: baked fake-AO, traffic (drones / tanker / ore hauler / dock shuttles), FLOW dots in pipes + beams, gate ripples + chevron chase, a gentle float.
// s380: + PIRATE BASE · DEEP SPACE FOX (station outside) · NAV BUOY · SALVAGE WRECK (+ cold derelict hulks).
export const TYPES = ['ship', 'pirScout', 'pirCruiser', 'pirGunner', 'machScout', 'machCruiser', 'machGunner', 'merScout', 'merShuttle', 'merCruiser', 'merGunner', 'merFlagship', 'yard', 'fuel', 'mine', 'gate', 'dock', 'pirBase', 'dsf', 'buoy', 'wreck', 'voidMoth', 'machineYard', 'kufaStation', 'shastaStation', 'luxorStation', 'urStation', 'gayaStation', 'zionStation', 'neboStation', 'jiddaStation', 'homeStation', 'hullCargo', 'hullShuttle', 'hullCorvette', 'hullGunship', 'hullFlagWalk'];
// s419 THE PLAYER HULLS (2D HULLS: scout 100 G · fighter 200 · gunner 300 · cruiser 500 · flagship 800 · colony ship 1000). The scout = 'ship'.
export const HULL_TYPES = ['ship'];   // s589 (Ben): the non-walk-in hulls (fighter, gunner, cruiser, flagship, colony) are OFF the roster; the fleet = the SCOUT you start with + the walk-in ships. (Their builders stay in this file, unused.)
export const OLD_HULLS = ['hullFighter', 'hullGunner', 'hullCruiser', 'hullFlagship', 'hullColony'];
export const HULL_KEY = 'space.hull.v1';
// the hull you fly: the biggest hull with FLY THIS HULL on in the workshop (else the scout). Flight scale keeps the 2D size ladder (scout 138 … colony 176).
// s565 THE FLEET (Ben: "the player can have up to three ships; SWITCH FOX switches between them"): your flying hull + the walk-in GUNNER / FLAGSHIP when FLY THIS HULL is ticked for them. Max 3.
export const WALK_FLY = ['hullShuttle', 'hullCorvette', 'hullGunship', 'hullFlagWalk'];   // s566d (Ben): the fleet = the SCOUT (the player ship) + the WALK-IN ships
export function flyRoster(looks) { const L = looks || loadLooks(); return ['ship', ...WALK_FLY.filter(t => L[t] && L[t].fly)].slice(0, 3); }
export function flyingHull(looks) { const L = looks || loadLooks(); for (let i = HULL_TYPES.length - 1; i > 0; i--) if (L[HULL_TYPES[i]] && L[HULL_TYPES[i]].fly) return HULL_TYPES[i]; return 'ship'; }
export const HULL_FLY_SCALE = { ship: 1.12, hullFighter: 1.12, hullGunner: 1.08, hullCruiser: 1.0, hullFlagship: 0.92, hullColony: 0.95 };
export const INFO = {
  pirScout: { name: 'PIRATE SCOUT', role: 's590: YOUR starting scout, stolen + rebuilt: black hull, red slit canopy, every glow gone red, salvaged plates bolted down the left side, the right side stripped to its ribs, a primer wing patch, a crossbones plate where the 8 was, skull nose art, red tally marks, ram prongs, a jagged dorsal fin, dirty smoke. Weak but quick.' },
  pirCruiser: { name: 'PIRATE CRUISER', role: 's590: the walk-in CRUISER, stolen: same deep rounded hull, nacelles + wings, but black + red, the ramp door plated shut, dim red glass, plates bolted down the right side, the left stripped, crossbones on the roof, skull nose art, ram prongs, a jagged fin, a turret that tracks you. The crew leader (replaces the old fighter).' },
  pirGunner: { name: 'PIRATE GUNNER', role: 's590: the walk-in GUNNER, stolen: the broad armoured hull, gun sponsons, chin guns + the big turret (tracks you), all black + red, door plated shut, plates bolted down the left side, the right stripped, a sawtooth nose spine, crossbones, skull art, ram prongs. Slow, tough, fires long bursts.' },
  merScout: { name: 'MERU SCOUT', role: 's595: your starting scout in MERU colours (royal silver hull, gold trim + glow) with the gold M crest on a navy plate instead of the 8. Flies Meru\'s patrols on the Space Map.' },
  merShuttle: { name: 'MERU SHUTTLE', role: 's595: the walk-in SHUTTLE in MERU colours (royal silver hull, gold trim + glow) with the gold M crest on a navy plate instead of the 8. Flies Meru\'s patrols on the Space Map.' },
  merCruiser: { name: 'MERU CRUISER', role: 's595: the walk-in CRUISER in MERU colours (royal silver hull, gold trim + glow) with the gold M crest on a navy plate instead of the 8. Flies Meru\'s patrols on the Space Map.' },
  merGunner: { name: 'MERU GUNNER', role: 's595: the walk-in GUNNER in MERU colours (royal silver hull, gold trim + glow) with the gold M crest on a navy plate instead of the 8. Flies Meru\'s patrols on the Space Map.' },
  merFlagship: { name: 'MERU FLAGSHIP', role: 's595: the walk-in FLAGSHIP in MERU colours (royal silver hull, gold trim + glow) with the gold M crest on a navy plate instead of the 8. Flies Meru\'s patrols on the Space Map.' },
  machScout: { name: 'MACHINE SCOUT', role: 's591: YOUR scout, HACKED: pink hull + glow, the 8 crest overwritten with an F (the real 8 flickers through now and then), a parasite HACK SPIKE clamped on the back with cables into both sides, pink glitch pixels on the plates. PREVIEW FREED = your own scout again.' },
  machCruiser: { name: 'MACHINE CRUISER', role: 's591: the walk-in CRUISER, HACKED: pink, the F crest (the 8 flickers through), a hack spike on the nose with cables down both flanks, glitch pixels, its turret tracks you. Freed = your cruiser colours + the 8.' },
  machGunner: { name: 'MACHINE GUNNER', role: 's591: the walk-in GUNNER, HACKED: pink, the F crest (the 8 flickers through), a hack spike + cables, glitch pixels, the big turret tracks you. Tough. Freed = your gunner colours + the 8.' },
  ship: { name: 'PLAYER SHIP', role: 'The 8g scout from the 2D game, now 3D: an arrow hull with a violet spine, a bubble canopy, swept wings, canted tail fins, twin gun pods and twin engines. Front = north on the map.' },
  yard: { name: 'SHIPYARD', role: 'A cradle of curved ribs round a sleek hull being built, a gantry arch that slides along and welds, a control pod with solar wings, cargo pods. Fly over it: RESEARCH UPGRADES.' },
  fuel: { name: 'FUEL DEPOT', role: 'A tall vase tower, glowing fuel spheres on a ring, swept refuel arms with nozzles, blade radiators, a flare stack, a spinning crown. Fly over it: REFUEL.' },
  mine: { name: 'MINING PLATFORM', role: 'A round deck gripping an asteroid with curved claw legs: spinning drill, capsule silos, a dome hab, a swinging crane. The belt rocks round it break for ore.' },
  gate: { name: 'STARGATE', role: 'A smooth ring with curved clamp segments, chevron lights, a swirling horizon and two engine nacelles. Lies flat so you fly over / through it.' },
  pirBase: { name: 'PIRATE BASE', role: 'KRASS, GIBET, MURK, THRAX. A black faceted fortress: a red X on the tower, a slowly turning ring of hooked blade arms, gun turrets on the rim, red seams. 2200 hull: shoot it down and its HELD DEPOT is yours.' },
  dsf: { name: 'DEEP SPACE FOX', role: 'Meru\'s station, a frontier outpost, armed: WEAPON PLATFORMS with sweeping twin-gun turrets on the ring top + bottom and point-defence guns on the hub. A spindle with a saucer hub and an ops tower, the turning habitat wheel on spokes: rows of lit windows, raised hull plating + ribs, airlock docking ports with ships berthed, running lights chasing round the rim, solar wings, a dish, an amber deflector glow under the core, and CARGO BAY FOUR on its arm with the blue force-field door.' },
  buoy: { name: 'NAV BUOY', role: 'The markers somebody laid into the deep, each with one log line. Slim beacon, a ring, small fins, a lamp on top. Fly over it slowly: it LIGHTS and plays its log. Some are bait.' },
  wreck: { name: 'SALVAGE WRECK', role: 'A snapped hull, older than the nine: ribs through the plating, a torn engine bell, shards turning round it. LIVE = salvage (sky-blue glow from inside, TOW it to a shipyard). Off = a cold derelict hulk.' },
  homeStation: { name: 'HOME STATION (PLAYER PLANET)', role: 'Built on the Deep Space Fox design, smallest of all. A young frontier outpost: an OCTAGON timber-and-panel ring on 4 spokes, palm-thatch pods, SOLAR WINGS (the planet starts on solar), a crystal lantern spire, a little landing ring. Warm teal + red.' },
  shastaStation: { name: 'SHASTA STATION', role: 'Built on the Deep Space Fox design (hub, ring on spokes, a top piece). Snow world: a HEXAGONAL faceted ice ring, crystal shards on its corners, timber lodge pods (Clubhouse 8), a frosted crystal spire on the hub, blue frost light.' },
  luxorStation: { name: 'LUXOR STATION', role: 'Built on the DSF design. Desert world of the Pyramid: a SQUARE sandstone ring set like a compass, obelisk pods on its corners, a stepped pyramid on the hub with a glowing gold capstone, a slow ring of gold sun-mirrors.' },
  urStation: { name: 'UR STATION', role: 'Built on the DSF design. Canyon world: TWO terraced rings at different heights, each broken into arcs like canyon walls, rust stone + amber windows, cave-mouth pods, floating canyon rocks, a tall rust watchtower on the hub.' },
  gayaStation: { name: 'GAYA STATION', role: 'Built on the DSF design. Terrace world: two stacked rings with HANGING GARDENS on top, violet glow, small temple pods with curved roofs, a temple roof on the hub where the FIRST FLAME burns.' },
  zionStation: { name: 'ZION STATION', role: 'Built on the DSF design. Salt world: a wide flat HEXAGONAL ring over a white salt-pan deck, salt-crystal clusters on its corners, yellow hazard stripes, a squat tower with a big yellow searchlight, gold sparkle.' },
  neboStation: { name: 'NEBO STATION', role: 'Built on the DSF design. Ocean world: the ring wrapped in a shimmering WATER torus, glider-wing spokes, water-drop pods hanging below, a lighthouse on the hub with a turning beam.' },
  jiddaStation: { name: 'JIDDA STATION', role: 'Built on the DSF design. Jungle world: green glass SOLAR PETALS round the ring, bright surfboard spokes, tiki-hut pods, a segmented green-banded spire with solar fins, warm torchlight. Lance dish on top, turrets on the ring.' },
  hullFighter: { name: 'FIGHTER (PLAYER)', role: 'Your 8g FIGHTER (2D rank 2, 200 G), grown out of the scout: stretched into a dart, wings swept hard back, two LONG blade cannons down the wing roots, canards at the nose, an afterburner ring.' },
  hullGunner: { name: 'GUNNER (PLAYER)', role: 'Your 8g GUNNER (2D rank 3, 300 G), grown out of the scout: broadened into a heavy wedge with stub wings, a twin-barrel TURRET on the back, armour sponsons on both sides, a third engine.' },
  hullCruiser: { name: 'CRUISER (PLAYER)', role: 'Your 8g CRUISER (2D rank 4, 500 G), grown out of the scout: drawn out long, a raised bridge with a window band, two engine NACELLES on swept pylons, rows of lit windows, four engines.' },
  hullFlagship: { name: 'FLAGSHIP (PLAYER)', role: 'Your 8g FLAGSHIP (2D rank 5, 800 G), the scout grown huge: a stepped COMMAND TOWER on its back, a second wide wing deck below with four turrets, a hangar glow, five engines.' },
  hullColony: { name: 'COLONY SHIP', role: 'The 2D COLONY SHIP (1000 G): the scout nose leads a long town: a spine, a glowing GREENHOUSE dome, two habitat rings, cargo pods + tanks, two tail engines. You do not steer a town fast.' },
  hullFlagWalk: { name: 'FLAGSHIP (WALK-IN)', role: 'Walk-in ship #4 (s563, Ben): 20 % bigger than the gunner (hull scale 9.5, ~54 m). s563c: a compact ROUNDED ARROWHEAD hull (one smooth flattened shell, broad rounded prow), two nacelles hugging the rear flanks, a forward battery of 4 cannons in the prow rim, a MANNED GUN TURRET on a dorsal mound, 4 shoulder turrets, a canopy band over the bridge, portholes, 5 engines, the 8 crest. Inside: item shop, turret ladder, galley tavern (darts + arcade cabinet), captain\u2019s quarters, guest room, bunk room, bridge.' },
  hullGunship: { name: 'GUNNER (WALK-IN)', role: 'Walk-in ship #3 (s562, Ben): 10 % bigger than the corvette, its own shape: a broad flat ARMOURED hull with sharp chines, heavy GUN SPONSONS on both flanks (twin cannons + an engine each), a chin pod with 4 guns, twin canted tail fins, 4 engines and a manned SPINNING TURRET on the roof (glass dome, a seat inside, twin heavy barrels). 14 guns. Inside: the gun deck with the turret ladder, mess + galley, ammo racks, captain\'s office + quarters, a 6-berth bunk room and the bridge.' },
  hullCorvette: { name: 'CRUISER (WALK-IN)', role: 'Walk-in ship #2 (s559, Ben): 25 % bigger than the shuttle, sleek + rounded (a deep rounded hull, a long tapered nose with a wraparound canopy, swept nacelles high on curved pylons, a swept tail fin) and MORE GUNS: a twin dorsal turret, twin chin cannons and the wing-tip guns. Inside: a big cockpit with a holo table, the captain\u2019s office with a bed closet at the back, a bunk room, and a kitchen that doubles as the meeting room.' },
  hullShuttle: { name: 'SHUTTLE (WALK-IN)', role: 'The first of the new WALK-IN ships (s550, Ben: Star Trek style): a compact box-hull shuttle with a wide slanted windscreen, a brow visor, two warp NACELLES on short pylons (red bussard tips, a blue glow strip), a roof sensor spine, impulse glow over a rear door and a short ramp. Inside (Player Planet): a 2-seat cockpit, a bunk room with one bunk bed and a kitchenette with a table.' },
  hullCargo: { name: 'CARGO SHIP', role: 'The colony freighter (s543, Ben): a big hold on four landing legs, a bridge up front with a window band, a bubble canopy on the nose, two cargo pods on pylons with engines, stub wings + canted fins, a REAR RAMP that lowers to the ground so the crew can load and unload. RAMP OPEN = preview the ramp. Inside: the cargo hold + a door to the cockpit (Player Planet).' },
  kufaStation: { name: 'KUFA STATION', role: 'Kufa\'s own station (the interior is built: Deep Space Fox → the Vole → Kufa Station). THE GARDEN under a copper-ribbed glass dome in the middle, the RING deck with a copper rail + lamps, four CATWALKS out over open space to the pods: IMPORT / EXPORT, CREW FOR HIRE, MAPS & CHARTS, RELIC EXCHANGE, OPERATIONS, and BERTH 2 with the Vole docked. Armed like DSF: twin-gun turrets on the ring deck + 2 FLAK launchers (Kufa\'s speciality) on the Operations roof. Lit pod windows, copper plating, chasing lights, nav strobes, a warm halo.' },
  machineYard: { name: 'THE MACHINE YARD', role: 'Built by Meru\'s yards, broken by their gate (2D). A pearl fabricator tower in a snapped ring, three arms building a pink Machine Fleet scout, a big glowing F. The hack glows pink; now and then it FLICKERS blue: the real machines breaking through. FREED = all blue.' },
  voidMoth: { name: 'VOID MOTH', role: 'A giant moth as big as your ship (2D VOIDMOTH, the Lantern House beast). Furry violet body, two glowing eyes that fire pink lasers, four big wings with glowing eyespots and edges. It flutters, then PULSES a ring of energy round itself.' },
  dock: { name: 'WORLD DOCK', role: 'The long straight gantry floating above each world (Meru dock shape): a sleek spine with pods, a saucer hub, landing pads, the teleport pad west, the berth ring east, a beam down.' },
};
export const KEY = 'space.installs.v2';   // v2 = the s376b sleek pass (v1 held the boxy defaults)
const R = (k, label, min, max, step, def) => ({ k, label, kind: 'range', min, max, step, def });
const C = (k, label, def) => ({ k, label, kind: 'color', def });
const Bo = (k, label, def) => ({ k, label, kind: 'bool', def });
export const PARAMS = {
  pirScout: [C('armour', 'ARMOUR', '#2a2b31'), C('trim', 'RED TRIM', '#6a1a1e'), C('wing', 'RED WINGS', '#b3201a'), C('glow', 'RED GLOW', '#ff2a3a'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  pirCruiser: [C('armour', 'ARMOUR', '#2a2b31'), C('trim', 'RED TRIM', '#6a1a1e'), C('wing', 'RED WINGS', '#b3201a'), C('glow', 'RED GLOW', '#ff2a3a'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  pirGunner: [C('armour', 'ARMOUR', '#2a2b31'), C('trim', 'RED TRIM', '#6a1a1e'), C('wing', 'RED WINGS', '#b3201a'), C('glow', 'RED GLOW', '#ff2a3a'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  merScout: [C('hull', 'MERU HULL', '#e4e6ea'), C('trim', 'MERU TRIM', '#b8901c'), C('glow', 'MERU GLOW', '#ffd36a'), C('crest', 'M CREST', '#ffd36a'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  merShuttle: [C('hull', 'MERU HULL', '#e4e6ea'), C('trim', 'MERU TRIM', '#b8901c'), C('glow', 'MERU GLOW', '#ffd36a'), C('crest', 'M CREST', '#ffd36a'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  merCruiser: [C('hull', 'MERU HULL', '#e4e6ea'), C('trim', 'MERU TRIM', '#b8901c'), C('glow', 'MERU GLOW', '#ffd36a'), C('crest', 'M CREST', '#ffd36a'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  merGunner: [C('hull', 'MERU HULL', '#e4e6ea'), C('trim', 'MERU TRIM', '#b8901c'), C('glow', 'MERU GLOW', '#ffd36a'), C('crest', 'M CREST', '#ffd36a'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  merFlagship: [C('hull', 'MERU HULL', '#e4e6ea'), C('trim', 'MERU TRIM', '#b8901c'), C('glow', 'MERU GLOW', '#ffd36a'), C('crest', 'M CREST', '#ffd36a'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  machScout: [Bo('freed', 'PREVIEW FREED', false), C('pink', 'HACKED HULL', '#f6a3d6'), C('pinkDark', 'HACKED TRIM', '#9c2468'), C('glow', 'HACKED GLOW', '#ff4fb4'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  machCruiser: [Bo('freed', 'PREVIEW FREED', false), C('pink', 'HACKED HULL', '#f6a3d6'), C('pinkDark', 'HACKED TRIM', '#9c2468'), C('glow', 'HACKED GLOW', '#ff4fb4'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  machGunner: [Bo('freed', 'PREVIEW FREED', false), C('pink', 'HACKED HULL', '#f6a3d6'), C('pinkDark', 'HACKED TRIM', '#9c2468'), C('glow', 'HACKED GLOW', '#ff4fb4'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  ship: [R('wingSpan', 'WING SPAN', 0.8, 1.35, 0.05, 1), R('sweep', 'WING SWEEP', 0, 1, 0.05, 0.5), R('finCant', 'TAIL FIN TILT °', 0, 70, 1, 38), Bo('pods', 'GUN PODS', true), Bo('emblem', '8 CREST', true), R('crestSize', 'CREST SIZE', 0.35, 0.62, 0.01, 0.6), C('crestGlow', 'CREST PULSE COLOUR', '#5fd4ff'), R('pulse', 'PULSE SPEED', 0, 3, 0.1, 1.2),
    C('hull', 'HULL', '#f3f5fa'), C('accent', 'SPINE + WINGS', '#4b4d86'), C('canopy', 'CANOPY', '#7fd0ff'), C('engine', 'TRAIL COLOUR', '#7fd0ff'), R('trailLen', 'TRAIL LENGTH', 0.4, 3, 0.05, 1), R('trailWidth', 'TRAIL WIDTH', 0.5, 3, 0.05, 1), R('thrust', 'PREVIEW THRUST', 0, 2.2, 0.1, 0.8), Bo('boost', 'PREVIEW BOOST', false), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  yard: [R('length', 'DOCK LENGTH', 20, 40, 1, 28), R('bays', 'CRADLE RIBS', 4, 10, 1, 7), Bo('ship', 'HULL IN THE DOCK', true), R('progress', 'HULL BUILT %', 0, 100, 5, 60),
    Bo('crane', 'GANTRY + WELDING', true), R('wings', 'SOLAR WINGS', 0, 3, 1, 2), C('frame', 'FRAME', '#8a93a3'), C('hull', 'HULL', '#e8ecf2'), Bo('worldTint', 'ACCENT = WORLD COLOUR', true), C('accent', 'ACCENT', '#7dd3fc'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  fuel: [R('tanks', 'TANKS', 2, 6, 1, 3), R('arms', 'REFUEL ARMS', 0, 4, 1, 2), R('fins', 'RADIATOR BLADES', 0, 6, 1, 4), Bo('flare', 'FLARE STACK', true), Bo('crown', 'SPINNING CROWN', true),
    C('metal', 'METAL', '#dfe3ea'), C('fuel', 'FUEL GLOW', '#6ee7b7'), Bo('worldTint', 'BANDS = WORLD COLOUR', false), C('accent', 'BANDS', '#ec3013'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  mine: [R('rock', 'ASTEROID SIZE', 6, 14, 0.5, 9), R('silos', 'SILOS', 1, 3, 1, 2), Bo('drill', 'DRILL RIG', true), Bo('crane', 'SWINGING CRANE', true), Bo('thrusters', 'LEG THRUSTERS', true),
    C('rockCol', 'ROCK', '#7d7064'), C('deck', 'DECK', '#d4d8e0'), C('ore', 'ORE GLOW', '#f59e0b'), Bo('worldTint', 'SILOS = WORLD COLOUR', false), C('accent', 'SILOS', '#f59e0b'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  gate: [R('radius', 'RING RADIUS', 7, 14, 0.5, 10), R('segs', 'SEGMENTS', 6, 16, 1, 9), R('tilt', 'TILT TO CAMERA °', 0, 60, 1, 18), R('spin', 'RING SPIN', 0, 1, 0.05, 0.25), Bo('active', 'HORIZON ON', true), Bo('pylons', 'ENGINE NACELLES', true),
    C('ring', 'RING', '#3a4a6a'), C('collar', 'COLLAR', '#dfe3ea'), Bo('worldTint', 'GLOW = WORLD COLOUR', false), C('accent', 'GLOW', '#93c5fd'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  pirBase: [R('blades', 'BLADE ARMS', 3, 10, 1, 6), R('guns', 'GUN TURRETS', 0, 6, 1, 3), R('spin', 'RING SPIN', 0, 1, 0.05, 0.2), Bo('xcrest', 'RED X CREST', true), C('hull', 'HULL', '#2a2b33'), C('accent', 'PLATES', '#121217'), C('glow', 'RED GLOW', '#ff2a3a'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  dsf: [R('wheel', 'WHEEL RADIUS', 12, 24, 0.5, 18), R('tube', 'RING THICKNESS', 1.3, 3, 0.05, 2.0), R('cmdRing', 'COMMAND RING SIZE', 2.2, 5.5, 0.1, 3.6), R('mast', 'DISH MAST HEIGHT', 0.5, 6, 0.1, 1.6), Bo('weapons', 'WEAPON PLATFORMS', true), R('turrets', 'RING TURRETS', 0, 8, 1, 6), R('spokes', 'SPOKES', 3, 6, 1, 4), R('spin', 'WHEEL SPIN', 0, 1, 0.05, 0.18), R('solar', 'SOLAR WINGS', 0, 4, 1, 2), Bo('windows', 'WINDOW BANDS', true), Bo('plating', 'HULL PLATING', true), R('ports', 'DOCKING PORTS', 0, 12, 1, 8), Bo('docked', 'SHIPS AT THE PORTS', true), Bo('chase', 'CHASING RUNNING LIGHTS', true), Bo('dish', 'DISH', true), Bo('hangar', 'CARGO BAY FOUR', true), C('hull', 'HULL', '#e8ecf2'), C('accent', 'ACCENT', '#ec3013'), C('field', 'FORCE FIELD', '#7fd0ff'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  buoy: [Bo('lit', 'PREVIEW LIT', false), C('hull', 'HULL', '#cfd5df'), C('accent', 'RING', '#ffd23a'), C('lamp', 'LAMP (LIT)', '#ffe48a'), R('size', 'SIZE', 0.6, 1.8, 0.05, 1)],
  wreck: [Bo('live', 'SALVAGE (GLOWS)', true), R('length', 'HULL LENGTH', 10, 24, 0.5, 14), R('shards', 'SHARDS', 0, 14, 1, 9), C('hull', 'HULL', '#5a6270'), C('glow', 'INNER GLOW', '#7dd3fc'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  homeStation: [R('spin', 'RING SPIN', 0, 1, 0.05, 0.2), C('hull', 'HULL', '#e8dcc0'), C('accent', 'ACCENT', '#2cc4c4'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  shastaStation: [R('spin', 'RING SPIN', 0, 1, 0.05, 0.15), C('hull', 'HULL', '#f4f7fc'), C('accent', 'ACCENT', '#7fd0ff'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  luxorStation: [R('spin', 'RING SPIN', 0, 1, 0.05, 0.15), C('hull', 'HULL', '#d9a866'), C('accent', 'ACCENT', '#ffc94a'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  urStation: [R('spin', 'RING SPIN', 0, 1, 0.05, 0.15), C('hull', 'HULL', '#c98a5a'), C('accent', 'ACCENT', '#e8963a'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  gayaStation: [R('spin', 'RING SPIN', 0, 1, 0.05, 0.15), C('hull', 'HULL', '#ece6f5'), C('accent', 'ACCENT', '#a97bdd'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  zionStation: [R('spin', 'RING SPIN', 0, 1, 0.05, 0.15), C('hull', 'HULL', '#f6f2e4'), C('accent', 'ACCENT', '#e8cf4a'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  neboStation: [R('spin', 'RING SPIN', 0, 1, 0.05, 0.15), C('hull', 'HULL', '#e8f4ff'), C('accent', 'ACCENT', '#5aa6e8'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  jiddaStation: [R('spin', 'RING SPIN', 0, 1, 0.05, 0.15), C('hull', 'HULL', '#f0e6cf'), C('accent', 'ACCENT', '#5ec97e'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  hullFighter: [Bo('fly', 'FLY THIS HULL', false), C('hull', 'HULL', '#f3f5fa'), C('accent', 'ACCENT', '#4b4d86'), C('glow', 'GLOW', '#7fd0ff'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  hullGunner: [Bo('fly', 'FLY THIS HULL', false), C('hull', 'HULL', '#eef1f6'), C('accent', 'ACCENT', '#4b4d86'), C('glow', 'GLOW', '#7fd0ff'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  hullCruiser: [Bo('fly', 'FLY THIS HULL', false), C('hull', 'HULL', '#eef1f6'), C('accent', 'ACCENT', '#4b4d86'), C('glow', 'GLOW', '#7fd0ff'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  hullFlagship: [Bo('fly', 'FLY THIS HULL', false), C('hull', 'HULL', '#f3f5fa'), C('accent', 'ACCENT', '#4b4d86'), C('glow', 'GLOW', '#7fd0ff'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  hullColony: [Bo('fly', 'FLY THIS HULL', false), C('hull', 'HULL', '#eef1f6'), C('accent', 'ACCENT', '#5ec97e'), C('glow', 'GLOW', '#9dffb8'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  hullShuttle: [Bo('fly', 'FLY THIS HULL (FLEET)', false), R('ramp', 'RAMP OPEN', 0, 1, 0.05, 1), R('trailLen', 'TRAIL LENGTH', 0.4, 3, 0.05, 1), R('trailWidth', 'TRAIL SIZE', 0.5, 4, 0.05, 1.1), { k: 'wingShape', label: 'WING SHAPE', kind: 'choice', options: ['swept', 'delta', 'straight', 'forward', 'none'], def: 'swept' }, R('wingSpan', 'WING SPAN', 0.5, 1.8, 0.05, 1), R('wingSize', 'WING SIZE', 0.6, 1.5, 0.05, 1), R('wingY', 'WING HEIGHT', -0.4, 1, 0.05, 0), Bo('emblem', '8 CREST', true), R('crestSize', 'CREST SIZE', 0.5, 0.9, 0.01, 0.88), C('crestGlow', 'CREST PULSE COLOUR', '#5fd4ff'), R('pulse', 'PULSE SPEED', 0, 3, 0.1, 1.2), Bo('worldTint', 'STRIPE = WORLD COLOUR', false), C('hull', 'HULL', '#f3f5fa'), C('accent', 'SPINE + WINGS', '#4b4d86'), C('edge', 'WING EDGE GLOW', '#7fd0ff'), C('glow', 'NACELLE GLOW', '#7fd0ff'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  hullCorvette: [Bo('fly', 'FLY THIS HULL (FLEET)', false), R('ramp', 'RAMP OPEN', 0, 1, 0.05, 1), R('trailLen', 'TRAIL LENGTH', 0.4, 3, 0.05, 1.15), R('trailWidth', 'TRAIL SIZE', 0.5, 4, 0.05, 1.3), { k: 'wingShape', label: 'WING SHAPE', kind: 'choice', options: ['swept', 'delta', 'straight', 'forward', 'none'], def: 'swept' }, R('wingSpan', 'WING SPAN', 0.5, 1.8, 0.05, 1), R('wingSize', 'WING SIZE', 0.6, 1.5, 0.05, 1.1), R('wingY', 'WING HEIGHT', -0.4, 1, 0.05, 0), Bo('emblem', '8 CREST', true), R('crestSize', 'CREST SIZE', 0.5, 0.95, 0.01, 0.9), C('crestGlow', 'CREST PULSE COLOUR', '#5fd4ff'), R('pulse', 'PULSE SPEED', 0, 3, 0.1, 1.2), Bo('worldTint', 'STRIPE = WORLD COLOUR', false), C('hull', 'HULL', '#f3f5fa'), C('accent', 'SPINE + WINGS', '#4b4d86'), C('edge', 'WING EDGE GLOW', '#7fd0ff'), C('glow', 'NACELLE GLOW', '#7fd0ff'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  hullFlagWalk: [Bo('fly', 'FLY THIS HULL (FLEET)', false), R('ramp', 'RAMP OPEN', 0, 1, 0.05, 1), R('trailLen', 'TRAIL LENGTH', 0.4, 3, 0.05, 1.5), R('trailWidth', 'TRAIL SIZE', 0.5, 4, 0.05, 2.2), { k: 'wings', label: 'WINGS', kind: 'choice', options: ['none', 'swept', 'delta', 'straight', 'forward'], def: 'none' }, R('wingSpan', 'WING SPAN', 0.4, 1.4, 0.05, 0.6), R('wingSize', 'WING SIZE', 0.5, 1.3, 0.05, 0.75), R('wingY', 'WING HEIGHT', -0.4, 1, 0.05, 0), Bo('emblem', '8 CREST', true), R('crestSize', 'CREST SIZE', 0.5, 1.05, 0.01, 1.0), C('crestGlow', 'CREST PULSE COLOUR', '#5fd4ff'), R('pulse', 'PULSE SPEED', 0, 3, 0.1, 1.2), Bo('worldTint', 'STRIPE = WORLD COLOUR', false), C('hull', 'HULL', '#f3f5fa'), C('accent', 'RIM + STRIPES', '#4b4d86'), C('edge', 'WING EDGE GLOW', '#7fd0ff'), C('glow', 'ENGINE GLOW', '#7fd0ff'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  hullGunship: [Bo('fly', 'FLY THIS HULL (FLEET)', false), R('ramp', 'RAMP OPEN', 0, 1, 0.05, 1), R('trailLen', 'TRAIL LENGTH', 0.4, 3, 0.05, 1.35), R('trailWidth', 'TRAIL SIZE', 0.5, 4, 0.05, 1.8), { k: 'wingShape', label: 'WING SHAPE', kind: 'choice', options: ['swept', 'delta', 'straight', 'forward', 'none'], def: 'straight' }, R('wingSpan', 'WING SPAN', 0.5, 1.8, 0.05, 0.85), R('wingSize', 'WING SIZE', 0.6, 1.5, 0.05, 0.9), R('wingY', 'WING HEIGHT', -0.4, 1, 0.05, 0), Bo('emblem', '8 CREST', true), R('crestSize', 'CREST SIZE', 0.5, 1.0, 0.01, 0.98), C('crestGlow', 'CREST PULSE COLOUR', '#5fd4ff'), R('pulse', 'PULSE SPEED', 0, 3, 0.1, 1.2), Bo('worldTint', 'STRIPE = WORLD COLOUR', false), C('hull', 'HULL', '#f3f5fa'), C('accent', 'SPINE + WINGS', '#4b4d86'), C('edge', 'WING EDGE GLOW', '#7fd0ff'), C('glow', 'ENGINE GLOW', '#7fd0ff'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  hullCargo: [R('ramp', 'RAMP OPEN', 0, 1, 0.05, 1), Bo('worldTint', 'STRIPE = WORLD COLOUR', true), C('hull', 'HULL', '#e8ecf2'), C('accent', 'STRIPE (WORLD OFF)', '#ec3013'), C('glow', 'ENGINE GLOW', '#7fd0ff'), C('canopy', 'CANOPY', '#7fd0ff'), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)],
  kufaStation: [R('dome', 'DOME RADIUS', 5, 10, 0.5, 7.5), R('pods', 'POD DISTANCE', 18, 30, 0.5, 24), Bo('vole', 'THE VOLE AT BERTH 2', true), Bo('windows', 'WINDOW BANDS', true), Bo('plating', 'COPPER PLATING', true), Bo('chase', 'CHASING RUNNING LIGHTS', true), Bo('weapons', 'WEAPON PLATFORMS', true), R('turrets', 'RING TURRETS', 0, 8, 1, 4), C('copper', 'COPPER', '#c07a42'), C('hull', 'HULL', '#e7dccd'), C('glass', 'DOME GLASS', '#9fe8ff'), C('garden', 'GARDEN', '#5ec97e'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  machineYard: [R('freed', 'FREED (0 = HACKED)', 0, 1, 0.05, 0), R('ring', 'RING RADIUS', 10, 18, 0.5, 14), Bo('build', 'SCOUT ON THE CRADLE', true), C('hull', 'HULL', '#d9dde4'), C('hack', 'HACK GLOW', '#ff4fb4'), C('real', 'REAL GLOW', '#7fd0ff'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  voidMoth: [R('span', 'WING SPAN', 0.8, 1.4, 0.05, 1), R('flap', 'FLAP SPEED', 0.4, 2, 0.05, 1), Bo('charge', 'PREVIEW PULSE CHARGE', false), C('body', 'BODY', '#2a1a40'), C('wing', 'WINGS', '#7e22ce'), C('glow', 'GLOW', '#f0abfc'), C('eyes', 'EYES', '#7df9ff'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
  dock: [R('length', 'GANTRY LENGTH', 36, 90, 1, 64), R('modules', 'PODS', 2, 10, 1, 6), Bo('spurs', 'NORTH + SOUTH SPURS', true), R('spurLen', 'SPUR LENGTH', 4, 14, 0.5, 8), Bo('ring', 'BERTH RING (EAST)', true), Bo('pad', 'TELEPORT PAD (WEST)', true),
    Bo('beam', 'ELEVATOR BEAM DOWN', true), R('solar', 'SOLAR ARRAYS', 0, 3, 1, 2), C('hull', 'HULL', '#e8ecf2'), Bo('worldTint', 'ACCENT = WORLD COLOUR', true), C('accent', 'ACCENT', '#b9bec7'), R('size', 'SIZE', 0.6, 1.6, 0.05, 1)],
};
// s596 WORLD FLEETS (Ben: "ships for each world with their own colours and slightly different from each other"). Same builders as the MERU FLEET (tintTo + a crest letter on a plate + big wings),
// each world its own colours, WING SHAPE, span + size, and one small MOTIF (worldKit) so a patrol reads as that world at a glance. Meru keeps merShip exactly.
export const WORLD_STYLE = {
  shasta: { pre: 'sha', name: 'SHASTA', letter: 'S', hull: '#f6f9fc', trim: '#3f78ad', glow: '#a8e6ff', crest: '#e8f6ff', plate: ['#6d92bb', '#2c4c74', '#13233a'], wing: 'delta', span: 1.25, size: 1.4, scout: [1.2, 1.0], motif: 'twinFin', look: 'snow white, glacier-blue trim, ice glow, DELTA wings, twin canted ice fins' },
  luxor: { pre: 'lux', name: 'LUXOR', letter: 'L', hull: '#efe0c0', trim: '#b3352a', glow: '#ff8a5c', crest: '#ffd9a0', plate: ['#a0463a', '#5e1f18', '#2c0d0a'], wing: 'forward', span: 1.3, size: 1.4, scout: [1.25, 0.15], motif: 'spike', look: 'sandstone, temple red, FORWARD-swept wings, an obelisk spike on the nose' },
  ur: { pre: 'ur', name: 'UR', letter: 'U', hull: '#ecdcc6', trim: '#c2621a', glow: '#ffb347', crest: '#ffe0b0', plate: ['#a46a3a', '#5c3414', '#2a1608'], wing: 'straight', span: 1.4, size: 1.35, scout: [1.35, 0.3], motif: 'antenna', look: 'canyon clay, copper orange, long STRAIGHT wings, a radio mast with a crossbar' },
  gaya: { pre: 'gay', name: 'GAYA', letter: 'G', hull: '#f1ecf8', trim: '#6a44a6', glow: '#cfa8ff', crest: '#f0e2ff', plate: ['#7f62b0', '#3e2770', '#1c1036'], wing: 'swept', span: 1.5, size: 1.3, scout: [1.35, 0.6], motif: 'tips', look: 'lavender white, violet, WIDE swept wings, glowing fins on the wing tips' },
  zion: { pre: 'zio', name: 'ZION', letter: 'Z', hull: '#f7f3e4', trim: '#3a3a40', glow: '#ffe23a', crest: '#ffe23a', plate: ['#54545c', '#2a2a30', '#121216'], wing: 'delta', span: 1.1, size: 1.25, scout: [1.05, 0.85], motif: 'stripe', look: 'salt white, charcoal, yellow glow, short DELTA wings, twin racing stripes' },
  nebo: { pre: 'neb', name: 'NEBO', letter: 'N', hull: '#e8f2f8', trim: '#1f6a92', glow: '#5ff2e2', crest: '#d8fff9', plate: ['#3f86a6', '#1a4a66', '#0a2232'], wing: 'swept', span: 1.2, size: 1.5, scout: [1.15, 0.9], motif: 'fin', look: 'sea-foam white, ocean blue, teal glow, deep swept wings, one tall shark fin' },
  kufa: { pre: 'kuf', name: 'KUFA', letter: 'K', hull: '#ebdfcc', trim: '#8c5a2c', glow: '#ffa860', crest: '#ffd8a8', plate: ['#9a6a40', '#563416', '#281608'], wing: 'straight', span: 1.15, size: 1.5, scout: [1.0, 0.35], motif: 'pods', look: 'dune sand, copper, broad STRAIGHT wings, twin copper fuel pods' },
  jidda: { pre: 'jid', name: 'JIDDA', letter: 'J', hull: '#eef6ea', trim: '#2c8a4c', glow: '#7dff9e', crest: '#e0ffe8', plate: ['#4f9a68', '#1f5a34', '#0c2a18'], wing: 'forward', span: 1.45, size: 1.3, scout: [1.3, 0.05], motif: 'canards', look: 'leaf white, jungle green, big FORWARD wings, canards on the nose + a keel' },
};
const FLEET_KINDS = [['Scout', 'ship', 'SCOUT'], ['Shuttle', 'hullShuttle', 'SHUTTLE'], ['Cruiser', 'hullCorvette', 'CRUISER'], ['Gunner', 'hullGunship', 'GUNNER'], ['Flagship', 'hullFlagWalk', 'FLAGSHIP']];
export const FLEET_BASE = {}, FLEET_WORLD = {};   // fleet type → the player hull it is built on / its world
for (const [k, b] of FLEET_KINDS) { FLEET_BASE['mer' + k] = b; FLEET_WORLD['mer' + k] = 'meru'; }
{ const add = []; for (const [w, S] of Object.entries(WORLD_STYLE)) for (const [k, b, nm] of FLEET_KINDS) { const t = S.pre + k; add.push(t); FLEET_BASE[t] = b; FLEET_WORLD[t] = w;
    INFO[t] = { name: S.name + ' ' + nm, role: 's596: ' + (b === 'ship' ? 'your starting scout' : 'the walk-in ' + nm) + ' in ' + S.name + ' colours: ' + S.look + '. The ' + S.letter + ' crest on its plate. ' + (k === 'Cruiser' ? 'Leads ' + S.name + '\'s patrol.' : k === 'Scout' ? 'Two of them fly ' + S.name + '\'s patrol.' : 'Part of ' + S.name + '\'s fleet.') };
    PARAMS[t] = [C('hull', S.name + ' HULL', S.hull), C('trim', S.name + ' TRIM', S.trim), C('glow', S.name + ' GLOW', S.glow), C('crest', S.letter + ' CREST', S.crest), R('size', 'SIZE', 0.7, 1.4, 0.05, 1)]; }
  TYPES.splice(TYPES.indexOf('merFlagship') + 1, 0, ...add); }
export const FLEET_PRE = { meru: 'mer', ...Object.fromEntries(Object.entries(WORLD_STYLE).map(([w, S]) => [w, S.pre])) };
export const defaults = t => Object.fromEntries(PARAMS[t].map(p => [p.k, p.def]));
export function loadLooks() { let j = {}; try { j = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {} const o = {}; for (const t of TYPES) o[t] = { ...defaults(t), ...(j[t] || {}) }; return o; }
export function saveLooks(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

export function installKit(THREE, opts = {}) {
  const low = !!opts.low, inkOn = opts.outlines !== false;
  const grad = opts.grad || (() => { const t = [70, 150, 215, 255], d = new Uint8Array(16); t.forEach((v, i) => d.set([v, v, v, 255], i * 4)); const tx = new THREE.DataTexture(d, 4, 1); tx.minFilter = tx.magFilter = THREE.NearestFilter; tx.needsUpdate = true; return tx; })();
  const body = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad });
  body.onBeforeCompile = sh => { sh.uniforms.uRim = { value: new THREE.Color(opts.rim || '#a9d4ff') };
    sh.fragmentShader = 'uniform vec3 uRim;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n{ float fr = 1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0); gl_FragColor.rgb += uRim * (pow(fr, 3.0) * 0.55 + step(0.86, fr) * 0.12); }'); };
  const MAT = { body, ink: new THREE.MeshBasicMaterial({ color: 0x05060c, side: THREE.BackSide }), glow: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }) };
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.22, 'rgba(255,255,255,0.8)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const SEG = n => Math.max(4, Math.round(low ? n * 0.55 : n));
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), UP = V3(0, 1, 0);
  const mat4 = (p = [0, 0, 0], r = [0, 0, 0], s = 1) => { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] || 0, r[1] || 0, r[2] || 0)); return new THREE.Matrix4().compose(V3(...p), q, Array.isArray(s) ? V3(...s) : V3(s, s, s)); };
  let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const TAU = Math.PI * 2, HP = Math.PI / 2;
  let TINT = null;   // s590: a colour filter applied while baking (pirate hulls: everything that glows → enemy red)

  // rounded box: subdivided box, corners pushed onto spheres of radius r (smooth normals → clean ink + rim)
  function roundedBox(w, h, d, r) {
    const k = low ? 2 : 3, hw = w / 2, hh = h / 2, hd = d / 2; r = Math.min(r, hw, hh, hd) * 0.999;
    const g = new THREE.BoxGeometry(w, h, d, 2 * k, 2 * k, 2 * k), P = g.attributes.position, N = g.attributes.normal, p = V3(), n = V3(), inn = V3();
    const remap = (v, hv) => { const f = Math.abs(v) / hv, i = Math.round(f * k); if (i === 0) return 0; return Math.sign(v) * ((hv - r) + r * ((i - 1) / Math.max(1, k - 1))); };
    for (let i = 0; i < P.count; i++) { p.set(remap(P.getX(i), hw), remap(P.getY(i), hh), remap(P.getZ(i), hd));
      inn.set(Math.max(-(hw - r), Math.min(hw - r, p.x)), Math.max(-(hh - r), Math.min(hh - r, p.y)), Math.max(-(hd - r), Math.min(hd - r, p.z)));
      n.subVectors(p, inn); const L = n.length(); if (L > 1e-5) { n.divideScalar(L); p.copy(inn).addScaledVector(n, r); } else n.fromBufferAttribute(N, i);
      P.setXYZ(i, p.x, p.y, p.z); N.setXYZ(i, n.x, n.y, n.z); }
    return g;
  }
  // BAKER: collect parts, then one mesh per material.
  function baker() {
    const L = { body: [], glow: [], ink: [] }, col = new THREE.Color();
    const push = (arr, g, c, ao) => { const n = g.attributes.position.count, e = { p: g.attributes.position.array, n: g.attributes.normal.array }, NN = e.n;
      if (c) { col.set(c); if (TINT) TINT(col, arr === L.glow); const a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const k = ao ? 0.7 + 0.3 * (NN[i * 3 + 1] * 0.5 + 0.5) : 1; a[i * 3] = col.r * k; a[i * 3 + 1] = col.g * k; a[i * 3 + 2] = col.b * k; } e.c = a; } arr.push(e); };
    const add = (geo, c, m, o = {}) => {
      let g = geo.index ? geo.toNonIndexed() : geo.clone(); for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
      if (o.flat) { g.deleteAttribute('normal'); g.computeVertexNormals(); } else if (!g.attributes.normal) g.computeVertexNormals();
      if (m) g.applyMatrix4(m);
      const out = o.out ?? 0.06;
      if (inkOn && !o.glow && out > 0) { const gi = g.clone(), P = gi.attributes.position, N = gi.attributes.normal;
        if (o.flat) { gi.computeBoundingBox(); const bb = gi.boundingBox, sz = bb.getSize(V3()), cn = bb.getCenter(V3()), f = v => v > 0.001 ? (v + 2 * out) / v : 1; gi.translate(-cn.x, -cn.y, -cn.z); gi.scale(f(sz.x), f(sz.y), f(sz.z)); gi.translate(cn.x, cn.y, cn.z); }
        else for (let i = 0; i < P.count; i++) P.setXYZ(i, P.getX(i) + N.getX(i) * out, P.getY(i) + N.getY(i) * out, P.getZ(i) + N.getZ(i) * out);
        push(L.ink, gi); }
      push(o.glow ? L.glow : L.body, g, c, !o.glow); geo.dispose();
    };
    const B = {
      add,
      rbox: (w, h, d, r, c, p, rot, o) => add(roundedBox(w, h, d, r), c, mat4(p, rot), o),
      box: (w, h, d, c, p, rot, o) => add(new THREE.BoxGeometry(w, h, d), c, mat4(p, rot), o),
      cyl: (r1, r2, h, c, p, rot, o = {}) => add(new THREE.CylinderGeometry(r1, r2, h, SEG(o.seg || 16), 1, !!o.open), c, mat4(p, rot, o.s || 1), o),
      sph: (rad, c, p, s = 1, o = {}) => add(new THREE.SphereGeometry(rad, SEG(o.seg || 14), SEG((o.seg || 14) * 0.65), 0, TAU, o.t0 || 0, o.t1 || Math.PI), c, mat4(p, o.rot, s), o),
      cap: (r, len, c, p, rot, o = {}) => add(new THREE.CapsuleGeometry(r, len, SEG(o.cs || 5), SEG(o.seg || 14)), c, mat4(p, rot, o.s || 1), o),
      tor: (Rr, r, c, p, rot, o = {}) => { const g = new THREE.TorusGeometry(Rr, r, SEG(o.tube || 10), SEG(o.seg || 40), o.arc || TAU); if (o.a0) g.rotateZ(o.a0); add(g, c, mat4(p, rot, o.s || 1), o); },
      // lathe round Y. pts = [[r, y], ...] (r ≥ 0). o.phi0 / o.phi for arcs.
      lathe: (pts, c, p, rot, o = {}) => add(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y)), SEG(o.seg || 28), o.phi0 || 0, o.phi || TAU), c, mat4(p, rot, o.s || 1), o),
      // swept tube through points (smooth curve)
      tube: (pts, rad, c, o = {}) => { const cv = new THREE.CatmullRomCurve3(pts.map(q => V3(...q)), !!o.closed, 'centripetal'); add(new THREE.TubeGeometry(cv, SEG(o.seg || Math.max(8, pts.length * 6)), rad, SEG(o.rseg || 8), !!o.closed), c, null, o);
        if (o.caps !== false && !o.closed) for (const q of [pts[0], pts[pts.length - 1]]) add(new THREE.SphereGeometry(rad, SEG(8), SEG(6)), c, mat4(q), o); },
      // extruded flat shape (XY), thickness along z, bevelled edges
      ext: (shape, depth, c, p, rot, o = {}) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: o.bev ?? 0.06, bevelSize: o.bev ?? 0.06, bevelSegments: low ? 1 : 2, curveSegments: SEG(10) }); g.translate(0, 0, -depth / 2); add(g, c, mat4(p, rot, o.s || 1), o); },
      bake(name) {
        const G = new THREE.Group(); G.name = name || 'baked';
        const mk = (arr, mat, withC) => { if (!arr.length) return; let n = 0; for (const e of arr) n += e.p.length; const P = new Float32Array(n), N = new Float32Array(n), Cc = withC ? new Float32Array(n) : null; let o = 0;
          for (const e of arr) { P.set(e.p, o); N.set(e.n, o); if (Cc) Cc.set(e.c, o); o += e.p.length; }
          const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(N, 3)); if (Cc) g.setAttribute('color', new THREE.BufferAttribute(Cc, 3));
          g.computeBoundingSphere(); G.add(new THREE.Mesh(g, mat)); };
        mk(L.body, MAT.body, true); mk(L.ink, MAT.ink, false); mk(L.glow, B.glowMat || MAT.glow, true); G.userData.glow = G.children.find(m => m.material === (B.glowMat || MAT.glow)); return G;
      },
    };
    return B;
  }
  // LIGHTS: one Points draw per model. blink: 0 steady, else Hz.
  function lights() { const list = []; return { list, add: (p, c, s = 1.2, blink = 0, ph = Math.random() * 6) => list.push({ p, c: (q => (TINT && TINT(q, true), q))(new THREE.Color(c)), s, blink, ph }),
    make() { if (!list.length) return null; const n = list.length, P = new Float32Array(n * 3), Cc = new Float32Array(n * 3), S = new Float32Array(n);
      list.forEach((l, i) => { P.set(l.p, i * 3); Cc.set([l.c.r, l.c.g, l.c.b], i * 3); S[i] = l.s; });
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(Cc, 3)); g.setAttribute('size', new THREE.BufferAttribute(S, 1));
      const m = new THREE.ShaderMaterial({ uniforms: { map: { value: glowTex }, scale: { value: 420 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
        vertexShader: 'attribute float size; varying vec3 vC; uniform float scale; void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * scale / -mv.z; gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform sampler2D map; varying vec3 vC; void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(vC * t.a, t.a); }' });
      const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.userData.tick = (t, ws) => { const a = g.attributes.color.array; let dirty = false;
        list.forEach((l, i) => { if (!l.blink) return; const k = 0.2 + 0.8 * Math.max(0, Math.sin(t * l.blink * 6.283 + l.ph)) ** 2; a[i * 3] = l.c.r * k; a[i * 3 + 1] = l.c.g * k; a[i * 3 + 2] = l.c.b * k; dirty = true; });
        if (dirty) g.attributes.color.needsUpdate = true; if (ws) m.uniforms.scale.value = ws; };
      return pts; } };
  }
  // FLOW: dots running along curves (fuel in pipes, ore up a chute, sparks round a rim). One Points draw.
  function flow(paths, c, per = 6, speed = 0.4, size = 0.9, closed = false) { const curves = paths.map(p => new THREE.CatmullRomCurve3(p.map(q => V3(...q)), closed, 'centripetal')), LT = lights();
    for (let i = 0; i < curves.length * per; i++) LT.add([0, 0, 0], c, size * (0.7 + Math.random() * 0.6), 0); const pts = LT.make(), P = pts.geometry.attributes.position, tmp = V3(), ph = curves.map(() => Math.random());
    pts.userData.flow = t => { let i = 0; curves.forEach((cv, ci) => { for (let k = 0; k < per; k++, i++) { cv.getPointAt(((t * speed + k / per + ph[ci]) % 1 + 1) % 1, tmp); P.setXYZ(i, tmp.x, tmp.y, tmp.z); } }); P.needsUpdate = true; };
    pts.userData.flow(0); return pts; }
  // s571 GLASS: a baker whose glow mesh is its own transparent material (api.glass), so a cockpit can turn see-through for the pilot fox (engine/ship-pilot.js)
  function glassBaker() { const b = baker(); b.glowMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, transparent: true, opacity: 1 }); return b; }
  // s572 MANNED MINI TURRET (Ben: "a mini gun turret on the shuttle + corvette, with TURRET functionality like the gunner + flagship"): the gunner's
  // manned turret (ring base, glass dome, red seat + console, twin barrels on a pitch cradle) at scale TS. Pushes its 2 barrel guns LAST (space-map drops the last 2 for the lasers).
  // Returns the same api.turret as the gunner (eye, muzzles, dome, setBarrel, aim, release, fire, yaw, pitch, manned) + the baked parts for ink.
  function mannedTurret(body, anim, LT, guns, o) { const { TY, TZ, TS, A, HD, G, EDGE, LIFT } = o, tur = new THREE.Group(), pit = new THREE.Group(); tur.position.set(0, TY, TZ); tur.scale.setScalar(TS); body.add(tur); pit.position.y = 0.17; tur.add(pit);
    const T2 = baker(); T2.lathe([[0, 0], [0.54, 0], [0.56, 0.06], [0.5, 0.13], [0, 0.13]], GRAPH, [0, 0, 0], 0, { seg: 28 }); T2.tor(0.555, 0.022, A, [0, 0.07, 0], [HP, 0, 0], { seg: 28, tube: 3, out: 0 }); T2.tor(0.375, 0.018, HD, [0, 0.13, 0], [HP, 0, 0], { seg: 28, tube: 3, out: 0 });
    T2.tor(0.372, 0.011, HD, [0, 0.13, 0.04], 0, { seg: 28, tube: 3, out: 0 });
    T2.rbox(0.17, 0.05, 0.16, 0.02, '#ec3013', [0, 0.2, 0.07]); T2.rbox(0.17, 0.2, 0.04, 0.02, '#ec3013', [0, 0.31, 0.16]); T2.cyl(0.03, 0.04, 0.07, GRAPH2, [0, 0.16, 0.07], 0, { seg: 8 }); T2.rbox(0.22, 0.04, 0.07, 0.02, GRAPH2, [0, 0.15, -0.11]); T2.box(0.1, 0.025, 0.006, '#5dffa0', [0, 0.17, -0.143], [-0.6, 0, 0], { glow: true, out: 0 });
    const tb = T2.bake('miniTurret'); tur.add(tb);
    const P3 = baker(); for (const s2 of [-1, 1]) { const x = s2 * 0.42; P3.cyl(0.08, 0.08, 0.18, HD, [x, 0, 0], [0, 0, HP], { seg: 12 }); P3.rbox(0.13, 0.13, 0.45, 0.04, HD, [x, 0, -0.18]); P3.box(0.02, 0.03, 0.36, G, [x + s2 * 0.07, 0.02, -0.18], 0, { glow: true }); P3.cyl(0.04, 0.05, 0.9, '#cfd4de', [x, 0, -0.8], [HP, 0, 0], { seg: 10, out: 0.015 }); P3.tor(0.055, 0.015, A, [x, 0, -0.5], 0, { seg: 12, tube: 3, out: 0 }); P3.cyl(0.055, 0.045, 0.07, GRAPH2, [x, 0, -1.27], [HP, 0, 0], { seg: 10 }); P3.cyl(0.032, 0.032, 0.02, EDGE, [x, 0, -1.31], [HP, 0, 0], { glow: true, seg: 10 }); }
    const pb = P3.bake('miniTurretGuns'); pit.add(pb);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.37, SEG(28), SEG(12), 0, TAU, 0, HP), new THREE.MeshBasicMaterial({ color: '#9fdcff', transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); dome.position.y = 0.13; tur.add(dome);
    const eye = new THREE.Object3D(); eye.position.set(0, 0.355, 0.03); tur.add(eye); const muzzles = [], flash = [];
    for (const s2 of [-1, 1]) { const m = new THREE.Object3D(); m.position.set(s2 * 0.42, 0, -1.34); pit.add(m); muzzles.push(m); const f = spark('#ffe08a', 0.01); f.position.copy(m.position); pit.add(f); f.material.opacity = 0; flash.push(f); guns.push([s2 * 0.42 * TS, TY + 0.17 * TS - LIFT, TZ - 1.34 * TS]); }
    LT.add([0, TY + 0.53 * TS, TZ], RED, 0.3, 1.2);
    let manned = false, yaw = 0, pitch = 0.1; const fl = [0, 0];
    anim.push((t, dt) => { const d = dt || 0.016; if (!manned) { yaw = Math.sin(t * 0.37) * 0.8; pitch = 0.1 + Math.sin(t * 0.5) * 0.06; } tur.rotation.y = yaw; pit.rotation.x = pitch; for (let i = 0; i < 2; i++) { fl[i] = Math.max(0, fl[i] - d * 9); flash[i].scale.setScalar(0.02 + fl[i] * 0.7); flash[i].material.opacity = fl[i]; } pb.position.z = (fl[0] + fl[1]) * 0.03; });
    const api = { eye, muzzles, dome, setBarrel(k) { pb.scale.z = k; muzzles.forEach(m => { m.position.z = -1.34 * k; }); flash.forEach((f, i) => { f.position.copy(muzzles[i].position); }); }, get yaw() { return yaw; }, get pitch() { return pitch; }, get manned() { return manned; }, aim(y, p) { manned = true; yaw = y; pitch = Math.max(-0.12, Math.min(1.25, p)); }, release() { manned = false; }, fire(i) { fl[i % 2] = 1; } };
    return { api, tb, pb }; }
  // s575 REAR THRUSTERS (Ben: "the shuttle + corvette need back thrusters"): two bell nozzles on the rear corners flanking the ramp door, each an api.engines marker
  // (so the Space Map trail + TRAIL LENGTH / SIZE sliders work) + a glow sprite that swells with thrust and boost.
  function rearThrusters(B, body, anim, engines, o) { const { X, Y, Z, R, A, HD, G } = o, gl = [];
    for (const s2 of [-1, 1]) { const x = s2 * X; B.rbox(R * 2.5, R * 2.5, 0.34, 0.05, HD, [x, Y, Z - 0.1]); B.lathe([[R * 0.6, 0], [R, 0.12], [R * 1.05, R * 1.3], [R * 0.7, R * 1.5]], GRAPH2, [x, Y, Z], [HP, 0, 0], { seg: 14 });
      B.cyl(R * 0.62, R * 0.62, 0.02, G, [x, Y, Z + R * 1.5], [HP, 0, 0], { glow: true, seg: 12 }); B.tor(R * 1.02, 0.02, A, [x, Y, Z + 0.12], 0, { seg: 16, tube: 3, out: 0 });
      const m = new THREE.Object3D(); m.position.set(x, Y, Z + R * 1.6); body.add(m); engines.push(m); const sp = spark(G, R * 2.5); sp.position.copy(m.position); body.add(sp); gl.push(sp); }
    return gl; }
  // SHUTTLE: a small craft for traffic (drones, tankers, ore haulers). Front = +x.
  function shuttle(hull, acc, sc = 1, big = false) { const B = baker(); const L0 = big ? 2.6 : 1.5, r = big ? 0.75 : 0.5;
    B.cap(r, L0, hull, [0, 0, 0], [0, 0, HP], { seg: 12, s: [1, 0.8, 1] }); B.sph(r * 0.6, GLASS, [L0 * 0.55, r * 0.35, 0], [1.4, 0.6, 0.95], { glow: true, seg: 10 });
    B.tor(r * 1.02, 0.07, acc, [-L0 * 0.1, 0, 0], [0, HP, 0], { seg: 16, tube: 4, s: [1, 0.8, 1], out: 0.025 });
    for (const z of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(-L0 * 0.55, 0); sh.quadraticCurveTo(-L0 * 0.7, r * 1.6, -L0 * 0.85, r * 2.1); sh.lineTo(-L0 * 0.6, r * 2.1); sh.quadraticCurveTo(-L0 * 0.2, r * 0.8, 0, 0); B.ext(sh, 0.08, acc, [L0 * 0.05, 0, z * r * 0.6], [z * HP, 0, 0], { bev: 0.04 }); }
    if (big) for (const z of [-1, 1]) B.cap(0.42, 1.4, '#c9b48a', [-0.1, -r * 0.7, z * r * 0.9], [0, 0, HP], { seg: 10 });
    B.cyl(r * 0.6, r * 0.6, 0.05, CYAN, [-L0 / 2 - r - 0.02, 0, 0], [0, 0, HP], { glow: true, seg: 12 });
    const g = B.bake('shuttle'), e = spark(CYAN, big ? 2.6 : 1.7); e.position.x = -L0 / 2 - r - 0.35; g.add(e); const nav = spark(RED, 0.8); nav.position.set(0, r * 0.8, 0); g.add(nav); g.scale.setScalar(sc);
    g.userData.tick = t => { e.scale.setScalar((big ? 2.6 : 1.7) * (0.85 + Math.sin(t * 31) * 0.15)); nav.material.opacity = Math.sin(t * 5) > 0.6 ? 1 : 0.1; }; return g; }
  const fly = (obj, fn, bank = 0.35) => { let lastH = 0; return t => { const p = fn(t), q = fn(t + 0.06); obj.position.set(p[0], p[1], p[2]); const h = Math.atan2(-(q[2] - p[2]), q[0] - p[0]); let dh = h - lastH; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); lastH = h;
    obj.rotation.set(0, h, 0); obj.rotateX(Math.max(-0.6, Math.min(0.6, -dh * 12 * bank))); obj.rotateZ(Math.atan2(q[1] - p[1], Math.hypot(q[0] - p[0], q[2] - p[2]))); if (obj.userData.tick) obj.userData.tick(t); }; };
  const ripple = (Rr, c) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, SEG(48)), glowMat(c, 0.6)); m.rotation.x = -HP; return m; };
  const glowMat = (c, o = 0.8) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide });
  const spark = (c, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.setScalar(s); return sp; };
  const shade = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };
  const mix = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
  const GRAPH = '#2b2f3b', GRAPH2 = '#3b4150', GLASS = '#9fe8ff', WIN = '#ffe7a3', RED = '#ff4a2e', GREEN = '#5dffa0', AMBER = '#ffb340', CYAN = '#7df9ff', PANEL = '#1d3557';
  const solarPanel = (B, w, d, p, rot) => { B.box(w, 0.14, d, PANEL, p, rot, { out: 0.04 }); const n = Math.max(2, Math.round(w / 1.2)); for (let i = 1; i < n; i++) B.box(0.06, 0.04, d * 0.94, '#5d84b8', [p[0] + (i / n - 0.5) * w * Math.cos(rot ? rot[2] || 0 : 0), p[1] + 0.09 + (i / n - 0.5) * w * Math.sin(rot ? rot[2] || 0 : 0), p[2]], rot, { out: 0 }); };

  // ---------------------------------------------------------------- SHIPYARD
  function yard(L, acc) {
    const B = baker(), LT = lights(), anim = [], len = L.length, x0 = -len / 2, x1 = len / 2, Rc = 5.2, yC = 5.6, gap = 0.7 * Math.PI, FR = L.frame, FRD = shade(L.frame, 0.6);
    const top = [Math.cos(HP + gap / 2) * Rc, yC + Math.sin(HP + gap / 2) * Rc], bot = [Math.cos(HP + Math.PI + 0.7) * Rc, yC + Math.sin(HP + Math.PI + 0.7) * Rc];
    // cradle ribs (C-arcs open at the top) + their glow inner edge
    const n = L.bays; for (let i = 0; i < n; i++) { const x = x0 + 1 + ((len - 2) * i) / (n - 1);
      B.tor(Rc, 0.34, FR, [x, yC, 0], [0, HP, 0], { a0: HP + gap / 2, arc: TAU - gap, seg: 36, tube: 8 });
      B.tor(Rc - 0.34, 0.07, acc, [x, yC, 0], [0, HP, 0], { a0: HP + gap / 2 + 0.1, arc: TAU - gap - 0.2, seg: 30, tube: 4, glow: true });
      for (const s of [-1, 1]) { B.sph(0.55, GRAPH2, [x, top[1], s * -top[0]], 1, { seg: 9 }); LT.add([x, top[1] + 0.7, s * -top[0]], i % 2 ? AMBER : acc, 1.1, i % 2 ? 0.7 : 0, i); } }
    for (const s of [-1, 1]) { B.tube([[x0, top[1], s * -top[0]], [x1, top[1], s * -top[0]]], 0.3, FR, { seg: 2, rseg: 10 }); B.tube([[x0 + 0.6, bot[1], s * -bot[0]], [x1 - 0.6, bot[1], s * -bot[0]]], 0.42, FRD, { seg: 2, rseg: 10 }); }
    // keel: a sleek rounded spine under the cradle with glow strips
    B.rbox(len + 1.2, 0.8, 2.4, 0.38, GRAPH, [0, yC - Rc - 0.35, 0]); for (const s of [-1, 1]) B.cyl(0.07, 0.07, len, acc, [0, yC - Rc - 0.3, s * 1.22], [0, 0, HP], { glow: true, seg: 6 });
    for (let x = x0 + 1.5; x < x1; x += 3) LT.add([x, yC - Rc - 0.3, 1.35], '#d6f4ff', 0.55, 0);
    // the hull being built: lathe from the stern, plated up to progress, ribs + stringers past it
    if (L.ship) { const hl = len * 0.74, hr = 2.4, hx0 = -hl / 2, pr = L.progress / 100, sq = 0.8;
      const rad = u => hr * (u < 0.12 ? 0.74 + 0.26 * Math.sin((u / 0.12) * HP) : u < 0.58 ? 1 : Math.max(0.05, Math.pow(Math.cos(((u - 0.58) / 0.42) * HP), 0.75)));
      const prof = (a, b, st = 0.025) => { const p = []; for (let u = a; u < b + 1e-6; u += st) p.push([rad(Math.min(u, b)), Math.min(u, b) * hl]); return p; };
      const hullAt = (pts, c, o) => B.lathe(pts, c, [hx0, yC, 0], [0, 0, -HP], { seg: 28, s: [sq, 1, 1], ...o });
      if (pr > 0.01) { const pts = prof(0, pr); if (pr >= 0.999) pts.push([0, hl]); hullAt(pts, L.hull);
        if (pr > 0.3) hullAt(prof(0.3, Math.min(pr, 0.36)).map(([r, y]) => [r + 0.04, y]), acc, { out: 0.03 });
        if (pr > 0.7) { B.sph(1, GLASS, [hx0 + hl * 0.76, yC + hr * sq * 0.78, 0], [1.9, 0.42, 0.75], { glow: true }); }
        if (pr > 0.45) for (const s of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(hl * 0.3, 0); sh.quadraticCurveTo(hl * 0.12, 1.6, -hl * 0.04, 3); sh.lineTo(-hl * 0.1, 3); sh.quadraticCurveTo(-hl * 0.04, 1.2, 0, 0);
          B.ext(sh, 0.12, L.hull, [hx0 + hl * 0.16, yC - 0.4, s * hr * 0.92], [s * HP, 0, 0], { bev: 0.08 }); B.cyl(0.06, 0.06, 3, acc, [hx0 + hl * 0.14, yC - 0.4, s * (hr * 0.92 + 1.5)], [HP, 0, 0], { glow: true, seg: 6 }); } }
      for (let u = Math.max(pr, 0.02) + 0.05; u < 0.98; u += 1.5 / hl) B.tor(rad(u), 0.1, FR, [hx0 + u * hl, yC, 0], [0, HP, 0], { seg: 24, tube: 5, s: [1, sq, 1], out: 0.035 });
      if (pr < 0.96) for (const a of [HP, HP + 2.1, HP - 2.1]) { const pts = []; for (let u = Math.max(pr, 0.02); u <= 0.985; u += 0.06) pts.push([hx0 + u * hl, yC + Math.sin(a) * rad(u) * sq, Math.cos(a) * rad(u)]); if (pts.length > 1) B.tube(pts, 0.09, FR, { rseg: 5, out: 0.03 }); }
      // engines at the stern
      for (const s of [-1, 1]) { B.lathe([[0, 0], [0.75, 0.1], [0.9, 0.9], [0.8, 2.8], [0.5, 3.4], [0, 3.5]], GRAPH2, [hx0 + 2.2, yC - 0.2, s * hr * 0.72], [0, 0, HP], { seg: 16 });
        B.cyl(0.62, 0.62, 0.1, CYAN, [hx0 - 1.28, yC - 0.2, s * hr * 0.72], [0, 0, HP], { glow: true, seg: 16 }); LT.add([hx0 - 1.6, yC - 0.2, s * hr * 0.72], CYAN, 2.6, 0); }
      for (let i = 0; i < 6; i++) { const u = 0.1 + i * 0.075; if (u < pr) LT.add([hx0 + u * hl, yC + 0.4, rad(u) + 0.05], WIN, 0.6, 0); }
      // docking clamps from the lower spines to the hull belly
      for (const x of [hx0 + hl * 0.22, hx0 + hl * 0.56]) for (const s of [-1, 1]) B.tube([[x, bot[1], s * -bot[0]], [x, yC - hr * sq - 0.4, s * 1.6], [x, yC - hr * sq * 0.6, s * 0.9]], 0.2, FRD, { rseg: 6 }); }
    // control pod + solar wings (north side, -z)
    const pz = -Rc - 4.2, py = yC - 1.2; B.cap(1.5, 4.2, L.hull, [0, py, pz], [0, 0, HP], { seg: 18 }); B.cap(0.32, 3.6, GLASS, [0, py + 1.2, pz + 0.35], [0, 0, HP], { glow: true, s: [1, 1, 0.7] });
    B.tor(1.53, 0.12, acc, [1.2, py, pz], [0, HP, 0], { seg: 24, tube: 5, out: 0.03 }); B.tor(1.53, 0.12, acc, [-1.2, py, pz], [0, HP, 0], { seg: 24, tube: 5, out: 0.03 });
    B.tube([[0, py, pz + 1.4], [0, py + 0.4, pz + 2.8], [0, bot[1] + 0.4, -bot[0] - 0.3]], 0.38, GRAPH2, { rseg: 10 });
    B.cyl(0.06, 0.06, 2.6, GRAPH, [1.6, py + 2.6, pz], 0, { out: 0.025, seg: 6 }); B.sph(0.75, L.hull, [1.6, py + 3.9, pz], [1, 0.3, 1], { t1: HP }); LT.add([1.6, py + 4.3, pz], RED, 1.3, 0.5);
    for (let i = 0; i < L.wings; i++) for (const s of [-1, 1]) { const x = s * (5 + i * 3.6); B.tube([[s * 2.6, py, pz], [x, py + 0.3, pz]], 0.14, FRD, { seg: 2, rseg: 6 }); solarPanel(B, 3.2, 3.6, [x, py + 0.3, pz], [0, 0, s * 0.18]); }
    // cargo pad (south side, +z): round pad + capsule pods
    const cz = Rc + 4.2, cx = x1 - 6, cy = yC - Rc - 0.2; B.lathe([[0, -0.4], [4.6, -0.4], [5, -0.1], [5, 0.1], [4.7, 0.3], [0, 0.3]], GRAPH2, [cx, cy, cz], 0, { seg: 36 });
    B.tor(4.9, 0.08, acc, [cx, cy + 0.12, cz], [HP, 0, 0], { glow: true, seg: 36, tube: 4 }); B.tube([[cx - 3, cy, cz - 3.8], [cx - 4, cy, Rc - 1]], 0.4, GRAPH2, { seg: 2 });
    seed = 31; for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.3, c = [acc, '#e8ecf2', '#c9b48a'][i % 3]; B.cap(0.75, 1.6, c, [cx + Math.cos(a) * 2.6, cy + 1.1, cz + Math.sin(a) * 2.6], [HP, a, 0], { seg: 12 }); }
    for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; LT.add([cx + Math.cos(a) * 5, cy + 0.4, cz + Math.sin(a) * 5], GREEN, 0.9, 1.1, k); }
    const root = new THREE.Group(); root.add(B.bake('yard'));
    if (L.crane) { const Cb = baker(), ag = gap + 0.5;
      Cb.tor(Rc + 0.55, 0.42, acc, [0, yC, 0], [0, HP, 0], { a0: HP - ag / 2, arc: ag, seg: 20, tube: 8 });
      for (const s of [-1, 1]) Cb.rbox(1.4, 1.2, 1.6, 0.4, GRAPH, [0, top[1] + 0.3, s * -top[0] * 1.05], 0);
      Cb.rbox(1.6, 0.9, 1.4, 0.35, GRAPH, [0, yC + Rc + 0.6, 0], 0); Cb.lathe([[0, 0], [0.45, 0], [0.3, -2.3], [0.12, -2.9], [0, -3]], L.hull, [0, yC + Rc + 0.2, 0], 0, { seg: 12 });
      Cb.sph(0.18, CYAN, [0, yC + Rc - 2.9, 0], 1, { glow: true, seg: 8 });
      const cg = Cb.bake('gantry'), sp = spark('#bfe8ff', 1); sp.position.set(0, yC + Rc - 3.1, 0); cg.add(sp);
      const pivot = new THREE.Group(); pivot.add(cg); root.add(pivot);
      // s447 (Ben): BIGGER WELD SPARKS to match the welding sound: a bigger flash + a shower of 24 sparks that spray out and fall
      const NS = low ? 14 : 24, sg = new THREE.BufferGeometry(), spos = new Float32Array(NS * 3), svel = []; for (let q = 0; q < NS; q++) svel.push([0, 0, 0, 9]); sg.setAttribute('position', new THREE.BufferAttribute(spos, 3));
      const shower = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.55, map: glowTex, color: '#ffd9a0', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); shower.position.copy(sp.position); cg.add(shower); let lastT = 0;
      anim.push(t => { const dt2 = Math.min(0.05, Math.max(0, t - lastT)); lastT = t; pivot.position.x = Math.sin(t * 0.18) * (len * 0.62) / 2; const w = Math.sin(t * 23) * Math.sin(t * 7.3), on = w > 0.2; sp.scale.setScalar(on ? 2.4 + w * 4.5 : 0.01);
        for (let q = 0; q < NS; q++) { const v = svel[q]; v[3] += dt2; if (v[3] > 0.7 && on && Math.random() < 0.5) { const a = Math.random() * TAU, sp2 = 3 + Math.random() * 6; v[0] = Math.cos(a) * sp2; v[1] = 1 + Math.random() * 4; v[2] = Math.sin(a) * sp2; v[3] = 0; spos[q * 3] = spos[q * 3 + 1] = spos[q * 3 + 2] = 0; }
          if (v[3] <= 0.7) { v[1] -= 14 * dt2; spos[q * 3] += v[0] * dt2; spos[q * 3 + 1] += v[1] * dt2; spos[q * 3 + 2] += v[2] * dt2; } else spos[q * 3 + 1] = -999; }
        sg.attributes.position.needsUpdate = true; window.__spaceWeld && window.__spaceWeld(on, root); }); }
    for (let k = 0; k < 2; k++) { const d = shuttle('#eef1f6', acc, 0.75); root.add(d); const ph = k * Math.PI, rx = len * 0.36, rz = 3.4;
      anim.push(fly(d, t => { const a = t * 0.32 + ph; return [Math.cos(a) * rx, yC + 3.4 + Math.sin(a * 2) * 0.6, Math.sin(a) * rz * (k ? 1 : -1)]; })); }
    if (L.crane) { const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.9, 2.3, SEG(12), 1, true), glowMat('#9fe8ff', 0.28)); tb.position.set(0, yC + Rc - 4.1, 0); root.children[1].children[0].add(tb);
      const sp = flow([[[0, yC + Rc - 3.1, 0], [0.6, yC + Rc - 3.8, 0.4], [1.2, yC + Rc - 5.4, 0.9]], [[0, yC + Rc - 3.1, 0], [-0.5, yC + Rc - 3.9, -0.3], [-1.1, yC + Rc - 5.6, -0.8]]], '#fff3c4', 4, 1.6, 0.5); root.children[1].children[0].add(sp); anim.push(t => sp.userData.flow(t)); }
    return { root, LT, anim, hit: Math.max(len * 0.55, Rc + 8) };
  }
  // ---------------------------------------------------------------- FUEL DEPOT
  function fuel(L, acc) {
    const B = baker(), LT = lights(), anim = [], M = L.metal, MD = mix(L.metal, GRAPH, 0.55), F = L.fuel, Rt = 7.6, rt = 2.5, hH = 8.4;
    // vase tower
    B.lathe([[0, 0], [2.8, 0], [3.3, 0.35], [3.3, 0.95], [2.3, 1.7], [1.6, 3.1], [1.55, 4.0], [2.1, 5.0], [2.5, 5.8], [2.4, 6.5], [1.7, 7.3], [0.9, 7.9], [0.55, 8.5], [0, 8.6]], M, [0, 0, 0], 0, { seg: 32 });
    B.tor(3.32, 0.16, acc, [0, 0.65, 0], [HP, 0, 0], { seg: 40, tube: 6, out: 0.03 }); B.tor(2.52, 0.14, acc, [0, 6.05, 0], [HP, 0, 0], { seg: 40, tube: 6, out: 0.03 });
    B.tor(1.62, 0.13, F, [0, 3.6, 0], [HP, 0, 0], { glow: true, seg: 32, tube: 5 }); B.tor(2.12, 0.09, GLASS, [0, 5.05, 0], [HP, 0, 0], { glow: true, seg: 32, tube: 4 });
    // ring the tanks sit on + spokes
    B.tor(Rt, 0.42, MD, [0, 0.3, 0], [HP, 0, 0], { seg: 56, tube: 10 }); B.tor(Rt, 0.07, F, [0, 0.72, 0], [HP, 0, 0], { glow: true, seg: 56, tube: 4 });
    const n = L.tanks; for (let i = 0; i < n; i++) { const a = (i / n) * TAU + HP, cx = Math.cos(a), cz = Math.sin(a), x = cx * Rt, z = cz * Rt, ty = rt + 0.55;
      B.tube([[cx * 3.1, 0.4, cz * 3.1], [x - cx * rt * 0.9, 0.35, z - cz * rt * 0.9]], 0.3, MD, { seg: 2 });
      B.sph(rt, M, [x, ty, z], 1, { seg: 24 }); B.tor(rt * 1.005, 0.32, F, [x, ty, z], [HP, 0, 0], { glow: true, seg: 32, tube: 8 });
      for (const dy of [-0.85, 0.85]) B.tor(Math.sqrt(rt * rt - (rt * 0.5) ** 2) * 1.01, 0.07, acc, [x, ty + dy * rt * 0.58, z], [HP, 0, 0], { seg: 28, tube: 4, out: 0.025 });
      B.lathe([[0, 0], [rt * 0.7, 0.05], [rt * 0.55, 0.6], [0, 0.6]], GRAPH2, [x, 0.25, z], 0, { seg: 18 });
      B.tube([[cx * 2.2, 5.2, cz * 2.2], [cx * 4.8, 5.6, cz * 4.8], [x - cx * rt * 0.4, ty + rt * 0.75, z - cz * rt * 0.4]], 0.26, MD, { rseg: 8 });
      LT.add([x, ty + rt + 0.35, z], F, 1.3, 0.4, i); }
    for (let i = 0; i < L.fins; i++) { const a = (i / Math.max(1, L.fins)) * TAU + Math.PI / n, cx = Math.cos(a), cz = Math.sin(a);
      const sh = new THREE.Shape(); sh.moveTo(0, -0.5); sh.lineTo(3.4, -0.32); sh.quadraticCurveTo(4.6, 0, 3.4, 0.32); sh.lineTo(0, 0.5); sh.closePath();
      B.ext(sh, 0.12, '#47536a', [cx * 1.9, 6.9, cz * 1.9], [HP, -a, 0], { bev: 0.07 }); B.tube([[cx * 2.4, 6.92, cz * 2.4], [cx * 5.1, 6.92, cz * 5.1]], 0.05, F, { glow: true, seg: 2, rseg: 4, caps: false }); }
    for (let i = 0; i < L.arms; i++) { const a = (i / Math.max(1, L.arms)) * TAU + Math.PI / n + 0.5, cx = Math.cos(a), cz = Math.sin(a), e = 12;
      B.tube([[cx * 2.6, 1.9, cz * 2.6], [cx * 6.5, 3.4, cz * 6.5], [cx * 10, 2.6, cz * 10], [cx * e, 1.6, cz * e]], 0.36, M, { rseg: 10 });
      B.lathe([[0.25, -0.3], [0.45, 0], [0.85, 0.5], [0.95, 0.75], [0.75, 0.75], [0.4, 0.35], [0, 0.35]], GRAPH2, [cx * e, 1.55, cz * e], 0, { seg: 16 });
      B.cyl(0.72, 0.72, 0.06, GREEN, [cx * e, 2.2, cz * e], 0, { glow: true, seg: 16 }); LT.add([cx * e, 2.6, cz * e], GREEN, 1.5, 1.1, i * 2); }
    let flame = null; if (L.flare) { const fx = -5.2, fz = -4.6;
      B.lathe([[0, 0], [0.85, 0], [0.55, 0.8], [0.42, 9], [0.62, 10.2], [0.5, 10.6], [0, 10.6]], M, [fx, 0, fz], 0, { seg: 14 }); B.tube([[-2.1, 2.6, -1.6], [-3.6, 2.9, -3.2], [fx, 2.6, fz]], 0.22, MD, { rseg: 6 });
      for (let k = 0; k < 3; k++) B.tor(0.47, 0.06, k % 2 ? '#f3f2f2' : RED, [fx, 8.4 + k * 0.45, fz], [HP, 0, 0], { seg: 14, tube: 4, out: 0 });
      flame = new THREE.Group(); flame.position.set(fx, 10.7, fz); const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.6, 10, 1, true), glowMat('#ffb340', 0.85)); f1.position.y = 1.3; const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.6, 8, 1, true), glowMat('#fff3c4', 0.9)); f2.position.y = 0.8;
      const s = spark('#ff8a3a', 5); s.material.opacity = 0.6; s.position.y = 1.4; flame.add(f1, f2, s);
      anim.push(t => { flame.scale.set(1, 1 + Math.sin(t * 17) * 0.08 + Math.sin(t * 5.3) * 0.12, 1); f1.rotation.y = t * 3; s.material.opacity = 0.45 + Math.sin(t * 11) * 0.12; }); }
    const root = new THREE.Group(); root.add(B.bake('fuel')); if (flame) root.add(flame);
    if (L.crown) { const Cb = baker(); Cb.tor(2.3, 0.14, M, [0, 0, 0], [HP, 0, 0], { seg: 32, tube: 6 });
      for (let k = 0; k < 3; k++) { const a = (k / 3) * TAU; Cb.cap(0.32, 0.9, acc, [Math.cos(a) * 2.3, 0, Math.sin(a) * 2.3], [HP, -a, 0], { seg: 10 }); Cb.tube([[0, 0, 0], [Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2]], 0.08, MD, { seg: 2, rseg: 5, caps: false }); }
      Cb.sph(0.35, CYAN, [0, 0.1, 0], 1, { glow: true, seg: 10 });
      const cg = Cb.bake('crown'); cg.position.y = hH + 0.7; root.add(cg); anim.push((t, dt) => { cg.rotation.y += dt * 1.4; cg.position.y = hH + 0.7 + Math.sin(t * 1.2) * 0.12; }); LT.add([0, hH + 1.8, 0], RED, 1.2, 0.6); }
    { const paths = []; for (let i = 0; i < n; i++) { const a = (i / n) * TAU + HP, cx = Math.cos(a), cz = Math.sin(a), x = cx * Rt, z = cz * Rt; paths.push([[x - cx * rt * 0.4, rt + 0.55 + rt * 0.75, z - cz * rt * 0.4], [cx * 4.8, 5.6, cz * 4.8], [cx * 2.2, 5.2, cz * 2.2]]); }
      for (let i = 0; i < L.arms; i++) { const a = (i / Math.max(1, L.arms)) * TAU + Math.PI / n + 0.5, cx = Math.cos(a), cz = Math.sin(a); paths.push([[cx * 2.6, 1.9, cz * 2.6], [cx * 6.5, 3.4, cz * 6.5], [cx * 10, 2.6, cz * 10], [cx * 12, 1.6, cz * 12]]); }
      const fl = flow(paths, F, 5, 0.35, 0.75); root.add(fl); anim.push(t => fl.userData.flow(t)); }
    { const gm = root.children[0].userData.glow; if (gm) { gm.material = gm.material.clone(); const base = gm.material.color.clone(); anim.push(t => gm.material.color.copy(base).multiplyScalar(0.8 + 0.2 * Math.sin(t * 2.4))); } }
    if (L.arms > 0) { const tk = shuttle('#e8ecf2', acc, 0.9, true); root.add(tk); const a0 = Math.PI / n + 0.5, cx = Math.cos(a0), cz = Math.sin(a0);
      anim.push(fly(tk, t => { const c = (t * 0.045) % 1; if (c < 0.55) { const a = a0 + 0.35 + (c / 0.55) * TAU * 0.9; return [Math.cos(a) * 19, 4.5 + Math.sin(c * 20) * 0.5, Math.sin(a) * 19]; }
        const k = (c - 0.55) / 0.45, a = a0 + 0.35 + TAU * 0.9, sx = Math.cos(a) * 19, sz = Math.sin(a) * 19, hx = cx * 14.6, hz = cz * 14.6, e = k < 0.35 ? k / 0.35 : k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3, ee = e * e * (3 - 2 * e);
        const ex = Math.cos(a0 + 0.35) * 19, ez = Math.sin(a0 + 0.35) * 19, from = k < 0.5 ? [sx, sz] : [ex, ez]; return [from[0] + (hx - from[0]) * ee, 4.5 - ee * 2.4, from[1] + (hz - from[1]) * ee]; })); }
    return { root, LT, anim, hit: 13 };
  }
  // ---------------------------------------------------------------- MINING PLATFORM
  function mine(L, acc) {
    const B = baker(), LT = lights(), anim = [], r = L.rock, D = L.deck, DD = mix(L.deck, GRAPH, 0.6);
    seed = 77; const rg = new THREE.IcosahedronGeometry(r, low ? 2 : 3), P = rg.attributes.position, v = V3();
    const bump = (x, y, z) => 1 + 0.15 * Math.sin(x * 0.55 + 1.3) * Math.cos(z * 0.5) + 0.08 * Math.sin(y * 1.3 + x * 0.4) + 0.05 * Math.sin(z * 1.9 + y) - 0.12 * Math.max(0, Math.cos(x * 0.8 + 2) * Math.cos(z * 0.7 - 1)) ** 6;
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const k = bump(v.x, v.y, v.z); P.setXYZ(i, v.x * k, v.y * k * 0.6, v.z * k); }
    B.add(rg, L.rockCol, mat4([0, -r * 0.35, 0]), { flat: true, out: 0.14 });
    for (let i = 0; i < 11; i++) { const a = rnd() * TAU, e = -0.4 + rnd() * 0.8, x = Math.cos(a) * r * 0.9 * Math.cos(e), z = Math.sin(a) * r * 0.9 * Math.cos(e), y = -r * 0.35 + Math.sin(e) * r * 0.5;
      B.add(new THREE.OctahedronGeometry(0.45 + rnd() * 0.55, 0), L.ore, mat4([x, y, z], [rnd() * 3, rnd() * 3, 0], [1, 1.6, 1]), { glow: true }); }
    const dy = r * 0.42 + 2.2, dr = r * 0.62;
    B.lathe([[0, -1.1], [dr * 0.55, -1.0], [dr * 0.92, -0.45], [dr, -0.1], [dr, 0.2], [dr * 0.94, 0.38], [0, 0.38]], D, [0, dy, 0], 0, { seg: 40 });
    B.tor(dr * 1.002, 0.08, acc, [0, dy + 0.05, 0], [HP, 0, 0], { glow: true, seg: 48, tube: 4 }); B.lathe([[0, 0], [dr * 0.6, 0], [dr * 0.6, 0.04], [0, 0.04]], DD, [0, dy + 0.39, 0], 0, { seg: 32, out: 0 });
    for (let k = 0; k < 4; k++) { const a = k * HP + Math.PI / 4, cx = Math.cos(a), cz = Math.sin(a);
      B.tube([[cx * dr * 0.8, dy - 0.3, cz * dr * 0.8], [cx * dr * 1.22, dy - 1.4, cz * dr * 1.22], [cx * dr * 1.25, dy - 3.4, cz * dr * 1.25], [cx * dr * 1.02, dy - 5.6, cz * dr * 1.02]], 0.42, DD, { rseg: 10, seg: 20 });
      B.tor(0.5, 0.12, acc, [cx * dr * 1.24, dy - 2.4, cz * dr * 1.24], [HP, 0, 0], { seg: 14, tube: 4, out: 0.03 });
      if (L.thrusters) { B.lathe([[0, 0], [0.42, 0], [0.62, -0.7], [0.5, -0.75], [0, -0.3]], GRAPH, [cx * (dr * 1.22 + 0.6), dy - 1.4, cz * (dr * 1.22 + 0.6)], [0, 0, 0], { seg: 12 }); LT.add([cx * (dr * 1.22 + 0.6), dy - 2.4, cz * (dr * 1.22 + 0.6)], '#ffb36b', 2.2, 0); } }
    for (let i = 0; i < L.silos; i++) { const a = Math.PI * 1.1 + i * 0.62, x = Math.cos(a) * dr * 0.55, z = Math.sin(a) * dr * 0.55;
      B.cap(1.05, 2.6, acc, [x, dy + 2.3, z], 0, { seg: 16 }); B.tor(1.07, 0.12, GRAPH, [x, dy + 1.6, z], [HP, 0, 0], { seg: 20, tube: 4, out: 0.03 }); B.tor(1.06, 0.06, L.ore, [x, dy + 2.9, z], [HP, 0, 0], { glow: true, seg: 20, tube: 4 }); }
    const hx = dr * 0.08, hz = dr * 0.52;
    B.sph(1.9, '#eef1f6', [hx, dy + 0.38, hz], 1, { t1: HP, seg: 24 }); B.tor(1.82, 0.13, GLASS, [hx, dy + 0.95, hz], [HP, 0, 0], { glow: true, seg: 28, tube: 4 });
    B.cyl(0.07, 0.07, 1.8, GRAPH, [hx + 0.9, dy + 2.4, hz - 0.5], 0, { out: 0.025, seg: 6 }); B.lathe([[0, 0], [0.4, 0.06], [0.9, 0.3], [0.95, 0.34], [0, 0.12]], '#eef1f6', [hx + 0.9, dy + 3.3, hz - 0.5], [0.5, 0, 0.4], { seg: 16 });
    LT.add([hx - 1.4, dy + 1.7, hz], RED, 1.1, 0.5);
    const root = new THREE.Group(); root.add(B.bake('mine'));
    if (L.drill) { const dx = dr * 0.42, dz = -dr * 0.05, top = dy + 6; const T = baker();
      for (let k = 0; k < 3; k++) { const a = (k / 3) * TAU + 0.4; T.tube([[dx + Math.cos(a) * 1.7, dy + 0.3, dz + Math.sin(a) * 1.7], [dx + Math.cos(a) * 1.1, dy + 3.4, dz + Math.sin(a) * 1.1], [dx + Math.cos(a) * 0.5, top, dz + Math.sin(a) * 0.5]], 0.17, DD, { rseg: 6 }); }
      T.lathe([[0, 0], [0.9, 0], [1, 0.4], [0.7, 0.9], [0, 0.95]], acc, [dx, top - 0.2, dz], 0, { seg: 16 }); T.tor(1.2, 0.1, L.ore, [dx, dy + 0.5, dz], [HP, 0, 0], { glow: true, seg: 20, tube: 4 });
      T.tube([[dx - 1, dy + 0.6, dz], [dx - 2.5, dy + 2.2, dz - 1], [Math.cos(Math.PI * 1.1) * dr * 0.55 + 1, dy + 3, Math.sin(Math.PI * 1.1) * dr * 0.55]], 0.3, GRAPH2, { rseg: 8 });
      root.add(T.bake('derrick'));
      const S = baker(); S.cyl(0.3, 0.3, 5.6, '#a8b1c0', [0, -2.8, 0], 0, { seg: 10 }); S.lathe([[0, 0], [0.75, 0.2], [0.55, 1.2], [0, 1.9]], '#e8ecf2', [0, -5.6, 0], [Math.PI, 0, 0], { seg: 14 });
      for (let k = 0; k < 6; k++) S.tor(0.5 - k * 0.03, 0.07, GRAPH, [0, -1 - k * 0.75, 0], [HP, 0, k * 0.2], { seg: 14, tube: 4, out: 0.02 });
      const bit = S.bake('bit'); bit.position.set(dx, top - 0.3, dz); root.add(bit); const dust = spark(L.ore, 3); dust.position.set(dx, dy - 4.4, dz); root.add(dust);
      anim.push((t, dt) => { bit.rotation.y += dt * 7; const d = Math.sin(t * 0.6) * 0.5 + 0.5; bit.position.y = top - 0.3 - d * 1.2; dust.scale.setScalar(2 + d * 2.5 + Math.sin(t * 19) * 0.4); });
      LT.add([dx, top + 1, dz], RED, 1, 0.5); }
    if (L.crane) { // s414 DELUXE MINING ARM (Ben: "it goes through things, polish the movement"): a real articulated arm (turret yaw + shoulder + elbow by
      // 2-link IK, hydraulic pistons, a cable + 3-finger claw that swings on its cable). Its WORK CYCLE never passes through the hab, the drill or
      // the silos: reach OUT over the deck edge → dip → lower the claw to the rock → grab an ore chunk → reel in → lift HIGH → swing (the way that
      // clears the hab) over the nearest silo → lower → release (the chunk drops in, the silo flashes) → back to rest. ~14 s, eased, with cable sway.
      const bx = -dr * 0.62, bz = dr * 0.5, cgY = dy + 0.38, SH = 0.75, A = 3.8, Bl = 3.4, CG = '#2b2f3b';
      const cg = new THREE.Group(); cg.position.set(bx, cgY, bz); root.add(cg);
      { const Tb = baker(); Tb.lathe([[0, 0], [1.0, 0], [1.05, 0.25], [0.8, 0.45], [0, 0.5]], DD, [0, 0, 0], 0, { seg: 20 }); Tb.tor(0.95, 0.06, acc, [0, 0.3, 0], [HP, 0, 0], { glow: true, seg: 20, tube: 3 }); cg.add(Tb.bake('craneBase')); }
      const yawG = new THREE.Group(); yawG.position.y = 0.5; cg.add(yawG);
      { const Tt = baker(); Tt.rbox(1.3, 0.9, 1.1, 0.25, GRAPH, [0, 0.45, 0]); Tt.cyl(0.36, 0.36, 1.3, DD, [0, SH, 0], [HP, 0, 0], { seg: 12 }); Tt.rbox(0.5, 0.35, 0.6, 0.1, acc, [-0.5, 0.95, 0]); Tt.box(0.05, 0.2, 0.42, GLASS, [0.66, 0.55, 0], 0, { glow: true }); yawG.add(Tt.bake('turret')); }
      const rod = (r, c) => { const U = baker(); U.cyl(r, r, 1, c, [0, 0.5, 0], 0, { seg: 8, out: 0.02 }); return U.bake('rod'); };
      const boom = new THREE.Group(); boom.position.y = SH; yawG.add(boom);
      { const Bb = baker(); Bb.rbox(A + 0.5, 0.44, 0.5, 0.18, acc, [A / 2 - 0.05, 0, 0]); Bb.box(A * 0.8, 0.06, 0.52, GRAPH2, [A / 2, 0.23, 0], 0, { out: 0 }); Bb.rbox(0.9, 0.7, 0.75, 0.15, GRAPH, [-0.7, 0, 0]); Bb.cyl(0.3, 0.3, 0.62, DD, [A, 0, 0], [HP, 0, 0], { seg: 12 }); Bb.box(A * 0.55, 0.05, 0.08, L.ore, [A * 0.5, 0, 0.26], 0, { glow: true }); boom.add(Bb.bake('boom')); }
      const fore = new THREE.Group(); yawG.add(fore);
      { const Fb = baker(); Fb.rbox(Bl + 0.3, 0.32, 0.38, 0.14, mix(D, '#ffffff', 0.1), [Bl / 2, 0, 0], 0); Fb.cyl(0.22, 0.22, 0.46, GRAPH, [Bl, 0, 0], [HP, 0, 0], { seg: 12 }); Fb.box(Bl * 0.6, 0.05, 0.06, acc, [Bl * 0.45, 0.17, 0], 0, { glow: true }); fore.add(Fb.bake('forearm')); }
      const tipLamp = spark(AMBER, 0.8); fore.add(tipLamp); tipLamp.position.set(Bl, 0.3, 0);
      const pA = rod(0.13, DD), pAr = rod(0.08, GRAPH2), pB = rod(0.11, DD), pBr = rod(0.07, GRAPH2); [pA, pAr, pB, pBr].forEach(m => yawG.add(m));
      const cp = new THREE.Group(); yawG.add(cp); const cable = rod(0.03, CG); cable.rotation.x = Math.PI; cp.add(cable);
      const claw = new THREE.Group(); cp.add(claw); const fingers = [];
      { const Ch = baker(); Ch.cyl(0.3, 0.22, 0.3, GRAPH, [0, -0.15, 0], 0, { seg: 12 }); Ch.tor(0.3, 0.04, acc, [0, -0.02, 0], [HP, 0, 0], { glow: true, seg: 14, tube: 3 }); claw.add(Ch.bake('clawHub'));
        const Fg = baker(); Fg.rbox(0.09, 0.6, 0.14, 0.04, GRAPH2, [0, -0.3, 0]); Fg.rbox(0.09, 0.22, 0.12, 0.04, GRAPH2, [-0.08, -0.62, 0], [0, 0, -0.7]); const fg = Fg.bake('finger');
        for (let q = 0; q < 3; q++) { const a = q / 3 * TAU, pv = new THREE.Group(); pv.position.set(Math.cos(a) * 0.24, -0.25, Math.sin(a) * 0.24); pv.rotation.y = -a; const f = fg.clone(true); pv.add(f); claw.add(pv); fingers.push(f); } }
      const chunk = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), new THREE.MeshBasicMaterial({ color: L.ore, toneMapped: false })); chunk.position.y = -0.62; chunk.visible = false; claw.add(chunk);
      const dust = spark(L.ore, 0.1); dust.material.opacity = 0; claw.add(dust); dust.position.y = -0.7;
      const drop = new THREE.Mesh(chunk.geometry, chunk.material); drop.visible = false; yawG.add(drop); const flash = spark(L.ore, 1); flash.material.opacity = 0; yawG.add(flash);
      // s415 (Ben): the ORE SILO HATCH opens as the arm brings the ore and closes after it drops in: a collar on the silo top + 2 hinged lids + an ore glow inside
      const hsa = Math.PI * 1.1, hsx = Math.cos(hsa) * dr * 0.55, hsz = Math.sin(hsa) * dr * 0.55, hatch = new THREE.Group(); hatch.position.set(hsx, dy + 4.5, hsz); root.add(hatch);
      { const Hc = baker(); Hc.cyl(0.86, 0.9, 0.45, GRAPH, [0, 0, 0], 0, { seg: 20 }); Hc.tor(0.88, 0.05, acc, [0, 0.2, 0], [HP, 0, 0], { glow: true, seg: 22, tube: 3 }); Hc.cyl(0.66, 0.66, 0.05, '#14161b', [0, 0.2, 0], 0, { seg: 18, out: 0 }); hatch.add(Hc.bake('hatchCollar')); }
      const inner = new THREE.Mesh(new THREE.CircleGeometry(0.62, 18), new THREE.MeshBasicMaterial({ color: L.ore, transparent: true, opacity: 0, toneMapped: false })); inner.rotation.x = -HP; inner.position.y = 0.21; hatch.add(inner);
      const lids = [0, 1].map(q => { const Hl = baker(); Hl.add(new THREE.CylinderGeometry(0.7, 0.7, 0.09, 14, 1, false, q ? Math.PI : 0, Math.PI), q ? DD : D, mat4([q ? 0.7 : -0.7, 0, 0]), { out: 0.02 }); Hl.box(0.08, 0.06, 1.0, acc, [q ? 0.08 : -0.08, 0.06, 0], 0, { glow: true }); const pv = new THREE.Group(); pv.position.set(q ? -0.7 : 0.7, 0.27, 0); pv.add(Hl.bake('lid')); hatch.add(pv); return { pv, sg: q ? 1 : -1 }; });
      let hatchK = 0;
      // the work cycle (angles: world direction in the deck plane; h / y: tip offset from the base)
      const pi2 = TAU, wrap = v => ((v % pi2) + pi2) % pi2, phO = Math.atan2(bz, bx);
      const sa = Math.PI * 1.1, sx = Math.cos(sa) * dr * 0.55, sz = Math.sin(sa) * dr * 0.55, phS0 = Math.atan2(sz - bz, sx - bx), hS = Math.hypot(sx - bx, sz - bz), siloTop = dy + 4.65 - cgY;
      const phH = Math.atan2(hz - bz, hx - bx), d1 = wrap(phS0 - phO), phS = wrap(phH - phO) < d1 ? phO - (pi2 - d1) : phO + d1;   // swing the way that does NOT pass over the hab
      const REST = { f: phO - 0.35, h: 2.4, y: 4.3, c: 0.7, g: 0.7 };
      const KF = [[1.2, {}], [1.3, { f: phO, h: 3.5, y: 2.6 }], [0.9, { h: 3.75, y: -0.9 }], [1.3, { c: 4.7 }], [0.5, { g: 0.12 }, 'grab'], [0.4, {}], [1.3, { c: 0.8 }], [1.1, { h: 3.3, y: 4.5 }], [1.9, { f: phS, h: hS, y: siloTop + 1.65 }], [0.6, { c: 0.95 }], [0.4, { g: 0.7 }, 'drop'], [0.5, { c: 0.7 }], [1.8, { ...REST }]];
      const keys = []; { let cur = { ...REST }, tt = 0; for (const [d, p, ev] of KF) { const nx = { ...cur, ...p }; keys.push({ t0: tt, d, a: cur, b: nx, ev }); cur = nx; tt += d; } keys.T = tt; }
      const ease = u => u * u * (3 - 2 * u); let lastI = -1, prevF = REST.f, tilt = 0, tiltV = 0, roll = 0, rollV = 0, prevH = REST.h, dropT = -1, flashT = -1, dustT = -1;
      const place = (m, x0, y0, x1, y1, k = 1) => { const dx2 = x1 - x0, dy2 = y1 - y0, l2 = Math.hypot(dx2, dy2); m.position.set(x0, y0, 0); m.rotation.set(0, 0, Math.atan2(dy2, dx2) - HP); m.scale.set(1, Math.max(0.01, l2 * k), 1); };
      anim.push((t, dt) => { const tau = t % keys.T; let i = keys.findIndex(k => tau >= k.t0 && tau < k.t0 + k.d); if (i < 0) i = keys.length - 1; const K = keys[i], u = ease(Math.min(1, (tau - K.t0) / K.d));
        if (i !== lastI) { const P = keys[(i + keys.length - 1) % keys.length]; if (P.ev === 'grab') { chunk.visible = true; dustT = 0; } if (P.ev === 'drop') { chunk.visible = false; dropT = 0; } lastI = i;
          /* s447 the sound follows the arm: a servo whir for each move (length = that move), a clunk on grab, the hatch, the ore drop */ const mv = ['f', 'h', 'y', 'c'].some(q => Math.abs((K.b[q] ?? 0) - (K.a[q] ?? 0)) > 0.3); if (window.__spaceArm) { if (mv) window.__spaceArm('move', root, K.d); if (P.ev === 'grab') window.__spaceArm('grab', root); if (i === 8) window.__spaceArm('hatch', root); if (P.ev === 'drop') window.__spaceArm('drop', root); } }
        const S2 = {}; for (const k of ['f', 'h', 'y', 'c', 'g']) S2[k] = K.a[k] + (K.b[k] - K.a[k]) * u;
        yawG.rotation.y = -S2.f;
        // 2-link IK in the arm plane (shoulder at (0, SH) in yawG): elbow-up
        const tx = S2.h, ty = S2.y - 0.5, ex0 = tx, ey0 = ty - SH, dd = Math.min(A + Bl - 0.02, Math.max(Math.abs(A - Bl) + 0.02, Math.hypot(ex0, ey0)));
        const a1 = Math.atan2(ey0, ex0) + Math.acos((A * A + dd * dd - Bl * Bl) / (2 * A * dd)), elx = Math.cos(a1) * A, ely = SH + Math.sin(a1) * A, a2 = Math.atan2(ty - ely, tx - elx);
        boom.rotation.z = a1; fore.position.set(elx, ely, 0); fore.rotation.z = a2; const tipX = elx + Math.cos(a2) * Bl, tipY = ely + Math.sin(a2) * Bl;
        place(pA, 0.6, SH - 0.38, Math.cos(a1) * 1.5, SH + Math.sin(a1) * 1.5, 0.55); place(pAr, 0.6, SH - 0.38, Math.cos(a1) * 1.5, SH + Math.sin(a1) * 1.5);
        const bpx = Math.cos(a1) * 2.6, bpy = SH + Math.sin(a1) * 2.6, fpx = elx + Math.cos(a2) * 0.9, fpy = ely + Math.sin(a2) * 0.9; place(pB, bpx, bpy, fpx, fpy, 0.55); place(pBr, bpx, bpy, fpx, fpy);
        // cable sway: a damped pendulum driven by the swing (yaw) + the reach (h)
        const w = dt > 0 ? (S2.f - prevF) / dt : 0, vh = dt > 0 ? (S2.h - prevH) / dt : 0; prevF = S2.f; prevH = S2.h;
        tiltV += ((-w * S2.h * 0.16 - tilt) * 14 - tiltV * 3.2) * dt; tilt += tiltV * dt; rollV += ((vh * 0.14 - roll) * 14 - rollV * 3.2) * dt; roll += rollV * dt;
        cp.position.set(tipX, tipY - 0.2, 0); cp.rotation.set(tilt, 0, roll); cable.scale.y = S2.c; claw.position.y = -S2.c;
        for (const f of fingers) f.rotation.z = S2.g; claw.rotation.y += dt * (K.ev === 'grab' || i === 3 ? 0.6 : 0.15);
        tipLamp.material.opacity = Math.sin(t * 5) > 0.3 ? 1 : 0.25;
        if (dustT >= 0) { dustT += dt; dust.material.opacity = Math.max(0, 0.9 - dustT * 1.6); dust.scale.setScalar(0.5 + dustT * 4); if (dustT > 0.6) dustT = -1; }
        if (dropT >= 0) { dropT += dt; const y0 = tipY - 0.2 - S2.c - 0.62, yy = y0 - 9 * dropT * dropT; drop.visible = yy > siloTop - 0.5 - 0.5; drop.position.set(tipX, yy, 0); drop.rotation.y += dt * 6; if (!drop.visible) { dropT = -1; flashT = 0; } }
        { const want = (i === 8 && u > 0.55) || i === 9 || i === 10 || i === 11 || (i === 12 && u < 0.2) ? 1 : 0; hatchK += (want - hatchK) * Math.min(1, dt * (want ? 4 : 3)); for (const l of lids) l.pv.rotation.z = l.sg * hatchK * 1.8; inner.material.opacity = hatchK * (0.7 + 0.3 * Math.sin(t * 9)); }
        if (flashT >= 0) { flashT += dt; flash.position.set(tipX, siloTop - 0.45, 0); flash.material.opacity = Math.max(0, 1 - flashT * 1.8); flash.scale.setScalar(1 + flashT * 5); if (flashT > 0.6) flashT = -1; } }); }
    if (L.drill) { const dx = dr * 0.42, dz = -dr * 0.05, sx = Math.cos(Math.PI * 1.1) * dr * 0.55 + 1, sz = Math.sin(Math.PI * 1.1) * dr * 0.55; const fl = flow([[[dx - 1, dy + 0.6, dz], [dx - 2.5, dy + 2.2, dz - 1], [sx, dy + 3, sz]]], L.ore, 7, 0.5, 0.8); root.add(fl); anim.push(t => fl.userData.flow(t)); }
    { const Db = baker(); seed = 91; for (let i = 0; i < (low ? 7 : 12); i++) { const a = (i / (low ? 7 : 12)) * TAU + rnd() * 0.4, rr = r * 1.35 + rnd() * 3, g = new THREE.IcosahedronGeometry(0.35 + rnd() * 0.7, 0); Db.add(g, i % 4 ? L.rockCol : L.ore, mat4([Math.cos(a) * rr, -r * 0.2 + (rnd() - 0.5) * 3, Math.sin(a) * rr], [rnd() * 3, rnd() * 3, 0]), i % 4 ? { flat: true, out: 0.06 } : { glow: true }); }
      const dg = Db.bake('debris'); root.add(dg); anim.push((t, dt) => { dg.rotation.y += dt * 0.06; }); }
    { const hv = shuttle(L.deck, acc, 0.85, true); root.add(hv); anim.push(fly(hv, t => { const a = t * 0.16; return [Math.cos(a) * (r * 2.1), dy + 1.5 + Math.sin(a * 3) * 1.2, Math.sin(a) * (r * 1.7)]; })); }
    return { root, LT, anim, hit: r * 1.2 };
  }
  // ---------------------------------------------------------------- STARGATE
  function gate(L, acc) {
    const B = baker(), LT = lights(), anim = [], Rr = L.radius, n = L.segs, RG = L.ring, CO = L.collar;
    const ringProf = (R0, w, h, k = 20) => { const p = []; for (let i = 0; i <= k; i++) { const t = (i / k) * TAU, c = Math.cos(t), s = Math.sin(t); p.push([R0 + w * c, h * s * (1 + 0.25 * c)]); } return p; };
    B.lathe(ringProf(Rr + 0.35, 1.05, 0.62), shade(RG, 0.85), [0, 0, 0], 0, { seg: 64 });
    B.tor(Rr - 0.62, 0.16, acc, [0, 0, 0], [HP, 0, 0], { glow: true, seg: 64, tube: 6 });
    B.lathe(ringProf(Rr + 2.35, 0.38, 0.3, 14), CO, [0, 0, 0], 0, { seg: 64 });
    if (L.pylons) for (const s of [-1, 1]) { const x = s * (Rr + 4.4);
      B.tube([[s * (Rr + 2.4), 0, -0.8], [s * (Rr + 3.4), 0.2, -0.4], [x, 0, 0]], 0.36, CO, { rseg: 8 }); B.tube([[s * (Rr + 2.4), 0, 0.8], [s * (Rr + 3.4), 0.2, 0.4], [x, 0, 0]], 0.36, CO, { rseg: 8 });
      B.lathe([[0, 0], [0.6, 0.15], [1.05, 1], [1.1, 2.8], [0.85, 4.2], [0.95, 4.4], [0.4, 4.5], [0, 4.4]], CO, [x, 0, 2.2], [-HP, 0, 0], { seg: 18 });
      B.tor(1.08, 0.12, acc, [x, 0, 0.6], [0, 0, 0], { seg: 20, tube: 4, out: 0.03 }); B.cyl(0.72, 0.72, 0.06, CYAN, [x, 0, -2.25], [HP, 0, 0], { glow: true, seg: 16 });
      LT.add([x, 0, -2.7], acc, 3.2, 0); LT.add([x, 1.2, 0.4], RED, 1.1, 0.7, s); }
    const R2 = baker(), arc = TAU / n;
    for (let i = 0; i < n; i++) { const a0 = i * arc + arc * 0.12, al = arc * 0.76;
      R2.lathe(ringProf(Rr + 1.15, 0.55, 0.85, 14).map(([r, y]) => [r, y]), RG, [0, 0, 0], 0, { phi0: a0, phi: al, seg: 10 });
      R2.lathe([[Rr + 0.95, 0.9], [Rr + 1.55, 0.9], [Rr + 1.55, 1.0], [Rr + 0.95, 1.0]], acc, [0, 0, 0], 0, { phi0: a0 + al * 0.3, phi: al * 0.4, seg: 4, glow: true });
      const am = a0 + al / 2; LT.add([Math.sin(am) * (Rr + 1.25), 1.1, Math.cos(am) * (Rr + 1.25)], acc, 1.4, 0.45, -(i / n) * TAU * 0.9); }
    const ring = R2.bake('ring');
    const tilt = new THREE.Group(); tilt.rotation.x = (L.tilt * Math.PI) / 180; tilt.add(B.bake('gate')); tilt.add(ring); tilt.position.y = 1;
    const lp = LT.make(); if (lp) tilt.add(lp);
    if (L.active) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), hx = '#' + new THREE.Color(acc).getHexString();
      const rg = g.createRadialGradient(128, 128, 8, 128, 128, 128); rg.addColorStop(0, 'rgba(255,255,255,0.95)'); rg.addColorStop(0.3, hx + 'cc'); rg.addColorStop(0.8, hx + '55'); rg.addColorStop(1, hx + '00'); g.fillStyle = rg; g.fillRect(0, 0, 256, 256);
      g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,255,255,0.32)'; g.lineWidth = 5; for (let k = 0; k < 4; k++) { g.beginPath(); for (let s = 0; s < 120; s++) { const tt = s / 120, a = k * HP + tt * 7, rr = 8 + tt * 116; g.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr); } g.stroke(); }
      const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; const hm = new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
      const disc = new THREE.Mesh(new THREE.CircleGeometry(Rr - 0.6, SEG(48)), hm); disc.rotation.x = -HP; tilt.add(disc);
      const disc2 = new THREE.Mesh(disc.geometry, hm.clone()); disc2.material.opacity = 0.5; disc2.rotation.x = -HP; disc2.position.y = 0.05; disc2.scale.setScalar(0.7); tilt.add(disc2);
      anim.push((t, dt) => { disc.rotation.z -= dt * 0.9; disc2.rotation.z += dt * 1.5; hm.opacity = 0.75 + Math.sin(t * 2.2) * 0.15; }); }
    anim.push((t, dt) => { ring.rotation.y += dt * L.spin * 0.6; });
    if (L.active) { const rps = [0, 1, 2].map(() => { const m = ripple(Rr, acc); tilt.add(m); return m; }); anim.push(t => rps.forEach((m, k) => { const u = (t * 0.33 + k / 3) % 1; m.scale.setScalar(0.5 + u * (Rr - 1.1)); m.position.y = 0.1; m.material.opacity = 0.55 * (1 - u) * Math.min(1, u * 5); }));
      const rim = []; for (let k = 0; k < 16; k++) { const a = (k / 16) * TAU; rim.push([Math.sin(a) * (Rr - 0.7), 0.25, Math.cos(a) * (Rr - 0.7)]); } const sp = flow([rim, rim.map(([x, y, z]) => [x * 0.98, -0.2, z * 0.98])], '#ffffff', 6, 0.12, 0.7, true); tilt.add(sp); anim.push(t => sp.userData.flow(t)); }
    const root = new THREE.Group(); root.add(tilt);
    return { root, pts: lp, anim, hit: Rr + 4 };
  }
  // ---------------------------------------------------------------- WORLD DOCK (long straight gantry)
  function dock(L, acc) {
    const B = baker(), LT = lights(), anim = [], len = L.length, x0 = -len / 2, x1 = len / 2, H = L.hull, HD = mix(L.hull, GRAPH, 0.55);
    B.lathe([[0, 0], [0.7, 0.15], [1.25, 1.3], [1.3, len / 2], [1.25, len - 1.3], [0.7, len - 0.15], [0, len]], H, [x0, 0, 0], [0, 0, -HP], { seg: 22, s: [0.8, 1, 1.15] });
    for (const s of [-1, 1]) { B.cyl(0.08, 0.08, len - 3, acc, [0, 0.15, s * 1.5], [0, 0, HP], { glow: true, seg: 6 }); B.cyl(0.13, 0.13, len - 2.4, HD, [0, -0.85, s * 1.1], [0, 0, HP], { seg: 8 }); }
    for (let x = x0 + 2, i = 0; x < x1 - 1; x += 2.5, i++) LT.add([x, 0.15, 1.6], i % 4 === 0 ? WIN : '#d6f4ff', 0.5, 0);
    const nm = L.modules, span = len - 16; for (let i = 0; i < nm; i++) { const x = x0 + 8 + (span * (i + 0.5)) / nm; if (Math.abs(x) < 5) continue; const big = i % 3 === 1, rr = big ? 1.05 : 0.85, w = Math.max(1, Math.min(span / nm - 2.4, big ? 3.6 : 2.6));
      B.cap(rr, w, i % 2 ? acc : '#f3f5f8', [x, 1.05 + rr * 0.6, 0], [0, 0, HP], { seg: 16 }); B.cap(0.18, w * 0.9, GLASS, [x, 1.05 + rr * 0.6 + rr * 0.15, rr * 0.92], [0, 0, HP], { glow: true, seg: 6, s: [1, 1, 0.6] });
      B.tor(rr * 1.02, 0.07, GRAPH, [x - w / 2, 1.05 + rr * 0.6, 0], [0, HP, 0], { seg: 18, tube: 4, out: 0.02 }); B.tor(rr * 1.02, 0.07, GRAPH, [x + w / 2, 1.05 + rr * 0.6, 0], [0, HP, 0], { seg: 18, tube: 4, out: 0.02 }); }
    // saucer hub
    B.lathe([[0, -1.4], [2.4, -1.2], [3.9, -0.35], [4.1, 0.1], [3.6, 0.6], [2.6, 1.3], [1.6, 2.1], [1.0, 2.5], [0, 2.6]], H, [0, 0, 0], 0, { seg: 40 });
    B.tor(4.02, 0.14, acc, [0, -0.05, 0], [HP, 0, 0], { seg: 48, tube: 6, out: 0.03 }); B.tor(2.95, 0.1, GLASS, [0, 1.05, 0], [HP, 0, 0], { glow: true, seg: 40, tube: 4 });
    B.cyl(0.07, 0.07, 3, GRAPH, [0.4, 3.9, 0], 0, { out: 0.025, seg: 6 }); B.sph(0.6, H, [-0.6, 2.85, 0.3], [1, 0.4, 1], { t1: HP }); LT.add([0.4, 5.5, 0], RED, 1.4, 0.5);
    for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; LT.add([Math.cos(a) * 4.15, 0.1, Math.sin(a) * 4.15], k % 2 ? acc : '#d6f4ff', 0.7, k % 2 ? 0.6 : 0, k); }
    if (L.spurs) for (const s of [-1, 1]) { const e = 3.6 + L.spurLen, pc = s * (e + 2);
      B.lathe([[0.95, 0], [0.75, 0.6], [0.6, L.spurLen * 0.5], [0.75, L.spurLen], [1.0, L.spurLen + 0.3]], H, [0, -0.1, s * 3.4], [s * HP, 0, 0], { seg: 16 });
      B.lathe([[0, -0.5], [2.4, -0.45], [2.8, -0.1], [2.8, 0.15], [2.55, 0.3], [0, 0.3]], HD, [0, -0.1, pc], 0, { seg: 32 });
      B.cyl(1.9, 1.9, 0.06, s < 0 ? '#ffd23a' : GREEN, [0, 0.24, pc], 0, { glow: true, seg: 28 }); B.lathe([[1.3, 0.27], [1.55, 0.27], [1.55, 0.29], [1.3, 0.29]], GRAPH, [0, 0, pc], 0, { seg: 28, out: 0 });
      for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; LT.add([Math.cos(a) * 2.85, 0.3, pc + Math.sin(a) * 2.85], s < 0 ? RED : GREEN, 1, 0.8, k * 0.5); } }
    for (let i = 0; i < L.solar; i++) for (const s of [-1, 1]) { const x = (i % 2 ? 1 : -1) * (8 + Math.floor(i / 2) * 10);
      B.tube([[x, -0.3, s * 1.4], [x, -0.1, s * 4], [x, 0, s * 6.4]], 0.14, HD, { rseg: 6 }); solarPanel(B, 5, 4.2, [x, 0, s * 8.6], [0, 0, 0]); }
    if (L.pad) { const px = x0 - 3.2;
      B.lathe([[0, -0.6], [2.6, -0.55], [3.1, -0.15], [3.1, 0.2], [2.8, 0.38], [0, 0.38]], HD, [px, 0, 0], 0, { seg: 36 }); B.tube([[x0 - 0.2, 0, 0], [px + 2.8, 0, 0]], 0.6, H, { seg: 2 });
      B.cyl(2.2, 2.2, 0.06, CYAN, [px, 0.42, 0], 0, { glow: true, seg: 32 }); B.tor(2.5, 0.1, acc, [px, 0.42, 0], [HP, 0, 0], { seg: 36, tube: 4, out: 0.03 });
      for (let k = 0; k < 3; k++) { const a = (k / 3) * TAU + 0.5, cx = Math.cos(a), cz = Math.sin(a); B.tube([[px + cx * 2.8, 0.3, cz * 2.8], [px + cx * 3.1, 1.6, cz * 3.1], [px + cx * 2.4, 2.8, cz * 2.4]], 0.14, H, { rseg: 6 });
        B.sph(0.22, CYAN, [px + cx * 2.4, 2.9, cz * 2.4], 1, { glow: true, seg: 8 }); LT.add([px + cx * 2.4, 2.9, cz * 2.4], CYAN, 1.2, 1, k); } }
    else { LT.add([x0 - 0.4, 0.3, 0], RED, 1.4, 0.7); }
    if (L.ring) { const cx = x1 + 6; B.lathe([[4.3, -0.5], [5, -0.6], [5.4, -0.2], [5.4, 0.25], [4.95, 0.55], [4.3, 0.45]], H, [cx, 0, 0], 0, { seg: 48 });
      B.tor(5.42, 0.09, acc, [cx, 0.02, 0], [HP, 0, 0], { glow: true, seg: 48, tube: 4 });
      for (const s of [-1, 1]) B.tube([[x1 - 0.8, 0, s * 0.9], [x1 + 0.4, 0, s * 2.6], [cx - 4.1, 0, s * 2.1]], 0.34, HD, { rseg: 8 });
      for (let k = 0; k < 4; k++) { const a = k * HP + Math.PI / 4; B.lathe([[4.1, -0.45], [4.6, -0.45], [4.6, 0.55], [4.1, 0.55]], GRAPH, [cx, 0, 0], 0, { phi0: a - 0.2, phi: 0.4, seg: 4 }); LT.add([cx + Math.sin(a) * 4.3, 0.75, Math.cos(a) * 4.3], GREEN, 1.3, 0.8, k * 0.7); } }
    else { LT.add([x1 + 0.4, 0.3, 0], GREEN, 1.4, 0.7); }
    const root = new THREE.Group(); root.add(B.bake('dock'));
    if (L.beam) { const c = document.createElement('canvas'); c.width = 4; c.height = 128; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 4, 128);
      const tx = new THREE.CanvasTexture(c); tx.wrapT = THREE.RepeatWrapping; const bm = new THREE.MeshBasicMaterial({ map: tx, color: CYAN, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
      const bl = 26, beam = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 2.6, bl, SEG(16), 1, true), bm); beam.position.set(0, -bl / 2 - 1.3, 0); root.add(beam);
      anim.push(t => { bm.opacity = 0.55 + Math.sin(t * 3) * 0.15; }); }
    for (let k = 0; k < 2; k++) { const sh = shuttle(k ? '#f3f5f8' : acc, k ? acc : '#f3f5f8', 0.95); root.add(sh); const ph = k * 0.5, lane = k ? 5.6 : -5.6, y = 2.2 + k * 0.8;
      anim.push(fly(sh, t => { const c = ((t * 0.035 + ph) % 1), u = c < 0.5 ? c * 2 : 2 - c * 2, e = u * u * (3 - 2 * u), xa = x1 + (L.ring ? 6 : 1), xb = x0 - (L.pad ? 3.2 : 1); const x = xa + (xb - xa) * e, side = c < 0.5 ? 1 : -1;
        return [x, y + Math.sin(e * Math.PI) * 1.5, lane * side * Math.sin(Math.min(1, e * 6, (1 - e) * 6) * HP)]; })); }
    if (L.beam) { const ps = []; for (let k = 0; k < 4; k++) { const a = k * HP; ps.push([[Math.cos(a) * 2.2, -25, Math.sin(a) * 2.2], [Math.cos(a + 0.8) * 1.6, -12, Math.sin(a + 0.8) * 1.6], [Math.cos(a + 1.6) * 1.1, -1.4, Math.sin(a + 1.6) * 1.1]]); }
      const fl = flow(ps, '#c9fbff', 5, 0.18, 0.9); root.add(fl); anim.push(t => fl.userData.flow(t)); }
    return { root, LT, anim, hit: len / 2 + 8 };
  }

  // ---------------------------------------------------------------- PLAYER SHIP (the 2D '8g' scout). Nose = -z, tail = +z, ~5 u long.
  function ship(L, acc) {
    const B = baker(), LT = lights(), anim = [], H = L.hull, HD = mix(L.hull, '#828b9e', 0.5), A = acc, AL = mix(acc, '#ffffff', 0.28), INKV = '#231d3c', zt = 2.3, zn = -2.65, len = zt - zn; let CG = null;
    // fuselage: lathe along the ship axis, flattened. local z of the lathe → world y.
    const fus = [[0.36, 0], [0.58, 0.18], [0.7, 0.75], [0.72, 1.6], [0.62, 2.6], [0.44, 3.4], [0.24, 4.15], [0.08, 4.7], [0, len]];
    const along = (pts, c, sq, o = {}) => B.lathe(pts, c, [0, 0, zt], [-HP, 0, 0], { seg: 26, s: [1, 1, sq], ...o });
    along(fus, H, 0.52); along(fus.slice(1, 7).map(([r, y]) => [r + 0.035, y]), A, 0.52, { phi0: -0.55, phi: 1.1, out: 0.03 });
    along(fus.slice(1, 6).map(([r, y]) => [r + 0.07, y]), AL, 0.52, { phi0: -0.14, phi: 0.28, out: 0 });
    // belly keel + chin intake
    B.cap(0.22, 2.2, HD, [0, -0.32, 0.2], [HP, 0, 0], { seg: 10, s: [1.6, 1, 1] });
    // canopy
    if (L.slit) { B.sph(1, GRAPH, [0, 0.27, -0.85], [0.3, 0.2, 0.95], { seg: 18 }); B.cap(0.05, 0.75, L.canopy, [0, 0.47, -0.85], [HP, 0, 0], { glow: true, seg: 8, s: [2.2, 1, 1] }); } else { // s425 POLISHED WINDSHIELD (Ben): a hull-coloured frame lip, deep tinted glass with a gradient (dark at the base, bright at the crown),
      // a centre frame bar + a cross brace, a pilot silhouette inside, and a moving glint that sweeps over the glass
      B.sph(1.06, HD, [0, 0.27, -0.85], [0.32, 0.12, 0.99], { seg: 22 });   // frame lip / seat
      CG = glassBaker(); CG.sph(1, mix(L.canopy, '#0e2a44', 0.55), [0, 0.3, -0.85], [0.3, 0.215, 0.95], { glow: true, seg: 22 }); // tinted glass body (s571: its own see-through material)
      CG.sph(1, mix(L.canopy, '#ffffff', 0.15), [0, 0.312, -0.85], [0.27, 0.21, 0.88], { glow: true, seg: 22, t1: Math.PI * 0.42 }); // bright crown of the glass
      B.sph(1, '#141821', [0, 0.27, -0.8], [0.25, 0.09, 0.62], { seg: 16, out: 0 }); B.box(0.17, 0.12, 0.04, '#2a2e3a', [0, 0.37, -0.57], [-0.25, 0, 0], { out: 0 }); // s571 the cockpit tub + seat back
      B.box(0.035, 0.03, 1.55, H, [0, 0.515, -0.85], [0, 0, 0], { out: 0.01 }); B.tor(0.29, 0.018, H, [0, 0.33, -0.6], [0, 0, 0], { seg: 18, tube: 3, arc: Math.PI, a0: 0, s: [1, 0.72, 1] });
      B.box(0.16, 0.03, 0.05, '#2a2e3a', [0, 0.35, -1.0], [0.4, 0, 0], { out: 0 }); B.box(0.05, 0.015, 0.03, '#ff8a3a', [0, 0.37, -0.99], 0, { glow: true }); }
    LT.add([0, 0.52, -1.25], '#e9fbff', 0.5, 0);
    // wings (flat shape in x/z: shape x = span out, shape y = world z), two-tone + leading-edge glow, slight dihedral
    const span = 1.85 * L.wingSpan, sw = 0.25 + L.sweep * 0.6;
    for (const sd of [-1, 1]) {
      const wsh = (k, inset) => { const sh = new THREE.Shape(), p = (x, z) => [sd * (0.55 + x * k), z]; const a = p(0, -0.35 + inset), b = p(span * 0.55, -0.05 + sw * 0.55 + inset * 0.6), c = p(span, 0.45 + sw), d = p(span * 1.0, 1.05 + sw * 0.6 - inset), e = p(span * 0.62, 1.15 - inset), f = p(0, 0.95 - inset);
        sh.moveTo(...a); sh.quadraticCurveTo(sd * (0.55 + span * 0.28 * k), -0.3 + sw * 0.2 + inset, ...b); sh.quadraticCurveTo(sd * (0.55 + span * 0.9 * k), 0.12 + sw * 0.9, ...c); sh.lineTo(...d); sh.quadraticCurveTo(sd * (0.55 + span * 0.8 * k), 1.2 - inset, ...e); sh.lineTo(...f); sh.closePath(); return sh; };
      const mk = (sh, th, c, y, o) => { const g = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: true, bevelThickness: th * 0.5, bevelSize: 0.035, bevelSegments: low ? 1 : 2, curveSegments: SEG(10) }); g.translate(0, 0, -th / 2); g.rotateX(HP); g.rotateZ(sd * 0.09); g.translate(0, y, 0); B.add(g, c, null, o); };
      mk(wsh(1, 0), 0.07, L.wingCol || H, -0.05); mk(wsh(0.86, 0.12), 0.05, A, 0.005, { out: 0.02 });
      const lead = []; for (let k = 0; k <= 6; k++) { const u = k / 6; lead.push([sd * (0.6 + span * 0.95 * u), -0.04 + sd * 0.09 * sd * (0.6 + span * u) * 0.09, -0.32 + (0.45 + sw + 0.32) * Math.pow(u, 1.3) - 0.05]); }
      B.tube(lead, 0.03, L.edge || CYAN, { glow: true, rseg: 4, caps: false });
      // wingtip pod + nav light
      const tx = sd * (0.55 + span), tz = 0.75 + sw * 0.8; B.cap(0.09, 0.75, HD, [tx, -0.02, tz], [HP, 0, 0], { seg: 8 }); LT.add([tx + sd * 0.05, 0.02, tz - 0.45], L.edge ? L.edge : sd < 0 ? RED : GREEN, 0.75, 0.9, sd < 0 ? 0 : 1.7);
      // canted tail fin
      { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0, 1.05); sh.quadraticCurveTo(0.35, 1.05, 0.72, 1.45); sh.lineTo(0.78, 1.3); sh.quadraticCurveTo(0.55, 0.6, 0.48, 0); sh.closePath();
        const g = new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: low ? 1 : 2, curveSegments: SEG(8) }); g.translate(0, 0, -0.025);
        g.rotateY(-HP); g.rotateZ(sd * (L.finCant * Math.PI / 180)); g.translate(sd * 0.32, 0.12, 1.4); B.add(g, '#1c2a52', null, { out: 0.03 });   // s423 (Ben): tail fins further back; s424 dark blue
        const tip = new THREE.Vector3(0, 0.72 + 0.05, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), sd * (L.finCant * Math.PI / 180)); LT.add([sd * 0.32 + tip.x * 1.9, 0.12 + tip.y * 1.9, 2.82], '#ffffff', 0.55, 1.3, sd); }
    }
    // polish: cyan glow line along each hull side, light panels on the wings (the 2D art's two plates), a dorsal ridge to the tail
    for (const sd of [-1, 1]) { B.tube(fus.slice(1, 7).map(([r, y]) => [sd * (r + 0.012), 0.03, zt - y]), 0.022, L.edge || CYAN, { glow: true, rseg: 4, caps: false });
      for (let k = 0; k < 2; k++) { const x = sd * (0.55 + span * (0.38 + k * 0.2)), z = 0.25 + sw * (0.35 + k * 0.25) + k * 0.12; B.rbox(span * 0.16, 0.03, 0.26, 0.012, '#c4cad8', [x, 0.03 + Math.abs(x) * 0.09, z], [0, 0, sd * 0.09], { out: 0.015 }); } }
    B.tube([[0, 0.38, 1.25], [0, 0.34, 1.75], [0, 0.22, 2.15]], 0.05, A, { rseg: 6, out: 0.02 });
    // gun pods + twin barrels (where the lasers fire from)
    const guns = [];
    if (L.pods) for (const sd of [-1, 1]) { const px = sd * 1.15; B.cap(0.2, 0.55, H, [px, 0.02, -0.4], [HP, 0, 0], { seg: 12, s: [1, 0.8, 1] }); B.tor(0.2, 0.04, A, [px, 0.02, -0.4], [0, 0, 0], { seg: 14, tube: 4, s: [1, 0.8, 1], out: 0.02 });
      B.tube([[sd * 0.72, -0.02, -0.25], [px, 0.02, -0.4]], 0.07, HD, { seg: 2, rseg: 6, caps: false });
      for (const dx of [-0.07, 0.07]) { B.cyl(0.045, 0.05, 0.7, '#cfd4de', [px + dx, 0.06, -0.95], [HP, 0, 0], { seg: 8, out: 0.025 }); B.cyl(0.035, 0.035, 0.02, CYAN, [px + dx, 0.06, -1.31], [HP, 0, 0], { glow: true, seg: 8 }); guns.push([px + dx, 0.06, -1.35]); } }
    else guns.push([-0.3, 0, -1.6], [0.3, 0, -1.6]);
    // engines: twin bells at the tail
    const eng = [];
    for (const sd of [-1, 1]) { const ex = sd * 0.27, ez = zt - 0.02; B.lathe([[0.17, 0], [0.24, 0.05], [0.27, 0.32], [0.2, 0.42], [0, 0.42]], HD, [ex, 0.0, ez + 0.38], [HP, 0, 0], { seg: 14 });
      B.cyl(0.16, 0.16, 0.02, L.engine, [ex, 0, ez + 0.38], [HP, 0, 0], { glow: true, seg: 14 }); eng.push([ex, 0, ez + 0.4]); }
    const root = new THREE.Group(); root.add(B.bake('ship')); if (CG) root.add(CG.bake('canopyGlass'));
    if (!L.slit) { const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.55), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); gl.rotation.set(-HP + 0.18, 0, 0.5); root.add(gl);
      anim.push(t => { const k = (t * 0.22) % 1, u = Math.min(1, k / 0.35); gl.position.set(-0.22 + u * 0.44, 0.49 - Math.abs(u - 0.5) * 0.06, -1.05 + u * 0.4); gl.material.opacity = k < 0.35 ? Math.sin(u * Math.PI) * 0.75 : 0; }); }
    // THE 8 CREST (s377b, Ben: "as big as we can + the colour round the 8 pulses"): a raised round plate on the back, between canopy and fins.
    if (L.emblem) { const Rc = L.crestSize, cz = 0.5, cy = 0.41, P = baker();
      P.lathe([[0, -0.22], [Rc * 0.9, -0.2], [Rc + 0.035, -0.01], [Rc + 0.02, 0.045], [Rc * 0.9, 0.06], [0, 0.06]], H, [0, cy, cz], 0, { seg: 40, out: 0.035 });
      P.tor(Rc + 0.028, 0.022, A, [0, cy + 0.02, cz], [HP, 0, 0], { seg: 40, tube: 4, out: 0 }); root.add(P.bake('crestPlate'));
      const N = 256, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), h = N / 2;
      const pc = L.crestPlate || ['#8fa8c8', '#44618c', '#1c2a42'], rg = g.createRadialGradient(h * 0.9, h * 0.76, 4, h, h, h * 0.9); rg.addColorStop(0, pc[0]); rg.addColorStop(0.62, pc[1]); rg.addColorStop(1, pc[2]);
      g.beginPath(); g.arc(h, h, h * 0.9, 0, TAU); g.fillStyle = rg; g.fill();
      g.lineWidth = N * 0.035; g.strokeStyle = '#231d3c'; g.stroke();
      g.font = '900 ' + Math.round(N * 0.74) + 'px Archivo, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineJoin = 'round'; g.lineWidth = N * 0.06; g.strokeStyle = '#141a2c'; g.strokeText(L.crestText || '8', h, h * 1.07); g.fillStyle = L.crestInk || '#ffffff'; g.fillText(L.crestText || '8', h, h * 1.07);
      const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
      const decal = new THREE.Mesh(new THREE.CircleGeometry(Rc * 0.86, SEG(40)), new THREE.MeshBasicMaterial({ map: tx, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 }));
      decal.rotation.x = -HP; decal.position.set(0, cy + 0.066, cz); root.add(decal);
      // s421 (Ben: "make this circle the pulse; at the peak invert the 8"): an INVERTED crest (the plate lit in the pulse colour, the 8 dark) laid
      // over it, faded in with the pulse, so the whole circle breathes and the 8 swaps light ↔ dark at the peak
      const c2 = document.createElement('canvas'); c2.width = c2.height = N; const g2 = c2.getContext('2d'), glowC = new THREE.Color(L.crestGlow), hi = '#' + glowC.clone().lerp(new THREE.Color('#ffffff'), 0.35).getHexString();
      const rg2 = g2.createRadialGradient(h * 0.9, h * 0.76, 4, h, h, h * 0.9); rg2.addColorStop(0, '#ffffff'); rg2.addColorStop(0.45, hi); rg2.addColorStop(1, '#' + glowC.getHexString());
      g2.beginPath(); g2.arc(h, h, h * 0.9, 0, TAU); g2.fillStyle = rg2; g2.fill(); g2.lineWidth = N * 0.035; g2.strokeStyle = '#231d3c'; g2.stroke();
      g2.font = g.font; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineJoin = 'round'; g2.lineWidth = N * 0.06; g2.strokeStyle = '#ffffff'; g2.strokeText(L.crestText || '8', h, h * 1.07); g2.fillStyle = '#141a2c'; g2.fillText(L.crestText || '8', h, h * 1.07);
      const tx2 = new THREE.CanvasTexture(c2); tx2.colorSpace = THREE.SRGBColorSpace; tx2.anisotropy = 4;
      const invM = new THREE.MeshBasicMaterial({ map: tx2, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, toneMapped: false }), inv = new THREE.Mesh(decal.geometry, invM); inv.rotation.x = -HP; inv.position.set(0, cy + 0.068, cz); root.add(inv);
      // the pulsing colour round the 8: a glow ring on the plate rim + a soft halo just outside it
      const ringM = glowMat(L.crestGlow, 0.9), ring = new THREE.Mesh(new THREE.RingGeometry(Rc * 0.8, Rc * 0.99, SEG(48)), ringM); ring.rotation.x = -HP; ring.position.set(0, cy + 0.07, cz); ring.visible = false;   // s422 (Ben): no pulsing stroke / halo round the circle; the pulse lives only INSIDE it
      const haloM = glowMat(L.crestGlow, 0), halo = new THREE.Object3D();
      const base = new THREE.Color(L.crestGlow);
      anim.push(t => { const k = 0.5 + 0.5 * Math.sin(t * L.pulse * TAU * 0.5), e = k * k * (3 - 2 * k);
        invM.opacity = e; }); }
    // s377e (Ben: "just the particle trail"): no flame cones. Engine markers for the trail + a nozzle glow that brightens with thrust.
    const engines = eng.map(p => { const o = new THREE.Object3D(); o.position.set(p[0], p[1], p[2] + 0.05); root.add(o); return o; });
    const nz = eng.map(p => { const sp = spark(L.engine, 0.6); sp.position.set(p[0], p[1], p[2] + 0.06); root.add(sp); return sp; });
    let thr = L.thrust, boost = L.boost;
    anim.push(t => { nz.forEach((sp, i) => { sp.material.color.set(boost ? '#ffd23a' : L.engine); sp.scale.setScalar(0.45 + thr * 0.35 + Math.sin(t * 41 + i * 2) * 0.04); }); });
    return { root, LT, anim, hit: 3, api: { guns, engines, look: L, glass: CG ? CG.glowMat : null, pilot: CG ? { x: 0, y: 0.31, z: -0.66, h: 0.205 } : null, setThrust(v, b) { thr = v; boost = !!b; }, get thrust() { return thr; }, get boost() { return boost; } } };
  }

  // ENGINE TRAIL (s377e): one Points draw. Each particle: white-hot at birth → the trail colour → a deep violet smoke, growing + slowing,
  // with a few bright sparks. Emits along the segment since last frame so there are no gaps at speed. Boost = gold → orange, longer + denser.
  function trail(o = {}) { const MAX = o.max || (low ? 320 : 640), P = new Float32Array(MAX * 3), V = new Float32Array(MAX * 3), A = new Float32Array(MAX * 4), life = new Float32Array(MAX), dur = new Float32Array(MAX), sz = new Float32Array(MAX), kind = new Float32Array(MAX);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aData', new THREE.BufferAttribute(A, 4)); g.setDrawRange(0, MAX);
    const U = { map: { value: glowTex }, scale: { value: 420 }, cHot: { value: new THREE.Color('#ffffff') }, cMid: { value: new THREE.Color(o.color || '#7fd0ff') }, cEnd: { value: new THREE.Color('#3b2a7a') },
      bHot: { value: new THREE.Color('#fff6d8') }, bMid: { value: new THREE.Color('#ffd23a') }, bEnd: { value: new THREE.Color('#ff5a1f') } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'attribute vec4 aData; varying float vT; varying float vB; varying float vK; uniform float scale; void main(){ vT = aData.x; vB = aData.z; vK = aData.w; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = aData.y * scale / -mv.z; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform sampler2D map; uniform vec3 cHot, cMid, cEnd, bHot, bMid, bEnd; varying float vT; varying float vB; varying float vK; void main(){ if (vT >= 1.0) discard; vec4 t = texture2D(map, gl_PointCoord);' +
        ' vec3 h = mix(cHot, bHot, vB), m = mix(cMid, bMid, vB), e = mix(cEnd, bEnd, vB); vec3 c = vT < 0.18 ? mix(h, m, vT / 0.18) : mix(m, e, smoothstep(0.18, 1.0, vT));' +
        ' float a = (1.0 - smoothstep(0.25, 1.0, vT)) * (vK > 0.5 ? 1.5 : 0.62 - vT * 0.25) * min(1.0, vT * 25.0 + 0.5); gl_FragColor = vec4(c * t.a * a, t.a * a); }' });
    const pts = new THREE.Points(g, mat); pts.frustumCulled = false; for (let i = 0; i < MAX; i++) A[i * 4] = 1;
    let head = 0; const last = new Map(), tmp = V3();
    const api = { points: pts, length: 1, width: 1,
      setColor(c) { U.cMid.value.set(c); },
      // from = Object3D (engine marker) · back = world unit vector out of the nozzle · carry = ship velocity · thr 0..2.2 · dt
      emit(from, back, carry, thr, boost, dt) { from.getWorldPosition(tmp); const k = last.get(from) || tmp.clone(); last.set(from, tmp.clone());
        const rate = (22 + thr * 120) * (boost ? 1.6 : 1) * (low ? 0.6 : 1); let n = rate * dt + Math.random(); n = Math.min(18, Math.floor(n)); if (thr < 0.05) n = Math.random() < 0.3 ? 1 : 0;
        for (let j = 0; j < n; j++) { const i = head; head = (head + 1) % MAX; const u = (j + Math.random()) / Math.max(1, n);
          P[i * 3] = k.x + (tmp.x - k.x) * u; P[i * 3 + 1] = k.y + (tmp.y - k.y) * u; P[i * 3 + 2] = k.z + (tmp.z - k.z) * u;
          const sp = (5 + thr * 7) * (boost ? 1.35 : 1), jit = 0.9 * api.width; V[i * 3] = back.x * sp + carry.x * 0.25 + (Math.random() - 0.5) * jit; V[i * 3 + 1] = (Math.random() - 0.5) * jit * 0.4; V[i * 3 + 2] = back.z * sp + carry.z * 0.25 + (Math.random() - 0.5) * jit;
          const spark = Math.random() < 0.08; kind[i] = spark ? 1 : 0; life[i] = 0; dur[i] = (spark ? 0.35 : 0.55 + thr * 0.22) * api.length * (boost ? 1.5 : 1) * (0.8 + Math.random() * 0.4);
          sz[i] = (spark ? 0.42 : 0.95 + thr * 0.3) * api.width * (boost ? 1.25 : 1) * (0.85 + Math.random() * 0.3); A[i * 4] = 0; A[i * 4 + 1] = sz[i] * 0.5; A[i * 4 + 2] = boost ? 1 : 0; A[i * 4 + 3] = kind[i]; } },
      update(dt, ws, drift) { if (ws) U.scale.value = ws; const drag = Math.exp(-dt * 2.6), dx = drift ? drift.x * dt : 0, dz = drift ? drift.z * dt : 0;
        for (let i = 0; i < MAX; i++) { if (A[i * 4] >= 1) continue; life[i] += dt; const t = life[i] / dur[i]; if (t >= 1) { A[i * 4] = 1; continue; }
          V[i * 3] *= drag; V[i * 3 + 1] *= drag; V[i * 3 + 2] *= drag; P[i * 3] += V[i * 3] * dt; P[i * 3 + 1] += V[i * 3 + 1] * dt; P[i * 3 + 2] += V[i * 3 + 2] * dt + dz; P[i * 3] += dx;
          A[i * 4] = t; A[i * 4 + 1] = sz[i] * (kind[i] ? 1 - t * 0.6 : 0.45 + Math.sqrt(t) * 2.4); }
        g.attributes.position.needsUpdate = true; g.attributes.aData.needsUpdate = true; },
      reset() { for (let i = 0; i < MAX; i++) A[i * 4] = 1; last.clear(); },
      dispose() { g.dispose(); mat.dispose(); pts.removeFromParent(); } };
    return api; }

  // ---------------------------------------------------------------- PIRATES + MACHINE FLEET (s379). Nose = -z. Each returns api.flash(colour|null)
  // (an additive glow over the hull for hits / glitches) and, for the gunner, api.aim(angle) for the turret.
  const flashOver = (root, r, c0) => { const sp = spark(c0 || '#ffffff', r); sp.material.opacity = 0; sp.position.y = 0.5; root.add(sp); return c => { if (!c) { sp.material.opacity = 0; return; } sp.material.color.set(c); sp.material.opacity = 0.85; }; };
  // ---------------------------------------------------------------- s590 PIRATE SHIP REDESIGN (Ben): SCOUT / CRUISER / GUNNER built ON the player's scout ('ship'), the walk-in
  // CRUISER (hullCorvette) and the walk-in GUNNER (hullGunship), so each reads as a stolen + rebuilt copy. Every baked colour goes through pirTint (blue / cyan / green / amber glow →
  // enemy red, canopy glass → dim red, blue paint → maroon, light greys → gunmetal); the ramp is gone (door plated shut); the 8 crest → a crossbones plate; + pirKit: salvaged plates
  // bolted on at angles down ONE side (the other stripped to its ribs + an exposed red conduit), a mismatched primer wing patch, skull nose art, red tally marks, ram prongs,
  // a jagged fin and a dirty smoke trail (one shader Points, animates on every clone). Phone: the kit is one bake + one decal draw + one smoke draw.
  const pirTint = G => { const R = new THREE.Color(G), hsl = {}; return (col, glow) => { col.getHSL(hsl); const red = (hsl.h < 0.04 || hsl.h > 0.95) && hsl.s > 0.45;
    if (glow) { if (red) return; if (hsl.s < 0.15) { if (hsl.l > 0.6) col.lerp(R, 0.5); return; } const l = hsl.l; col.copy(R); if (l < 0.35) col.multiplyScalar(0.28 + l); return; }
    if (red) return; if (hsl.s > 0.25) { col.setHSL(0.99, Math.min(0.5, hsl.s * 0.55), Math.min(0.24, hsl.l * 0.5)); return; } if (hsl.l > 0.5) col.multiplyScalar(0.5); }; };
  let skullTex = null;
  const skullArt = () => { if (skullTex) return skullTex; const N = 256, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), h = N / 2, W = '#f3f2f2', K = '#0c0c0f';
    g.fillStyle = K; g.beginPath(); g.arc(h, h, h * 0.96, 0, TAU); g.fill(); g.lineWidth = N * 0.045; g.strokeStyle = '#ff2a3a'; g.stroke();
    g.strokeStyle = W; g.fillStyle = W; g.lineCap = 'round'; g.lineWidth = N * 0.075;
    for (const s2 of [-1, 1]) { const x0 = h - s2 * N * 0.3, y0 = h + N * 0.32, x1 = h + s2 * N * 0.3, y1 = h - N * 0.02; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      for (const [x, y, dx, dy] of [[x0, y0, s2, 1], [x1, y1, -s2, -1]]) for (const k of [-1, 1]) { g.beginPath(); g.arc(x + dx * N * 0.02 + k * N * 0.035, y + dy * N * 0.02 + k * s2 * N * 0.035, N * 0.045, 0, TAU); g.fill(); } }
    g.beginPath(); g.arc(h, h - N * 0.08, N * 0.24, 0, TAU); g.fill(); g.fillRect(h - N * 0.14, h + N * 0.04, N * 0.28, N * 0.18);
    g.fillStyle = K; for (const s2 of [-1, 1]) { g.beginPath(); g.ellipse(h + s2 * N * 0.1, h - N * 0.08, N * 0.07, N * 0.08, s2 * 0.3, 0, TAU); g.fill(); }
    g.fillStyle = '#ff2a3a'; for (const s2 of [-1, 1]) { g.beginPath(); g.arc(h + s2 * N * 0.1, h - N * 0.07, N * 0.025, 0, TAU); g.fill(); }
    g.fillStyle = K; g.beginPath(); g.moveTo(h, h + N * 0.0); g.lineTo(h - N * 0.035, h + N * 0.07); g.lineTo(h + N * 0.035, h + N * 0.07); g.closePath(); g.fill();
    for (let k = -2; k <= 2; k++) g.fillRect(h + k * N * 0.05 - N * 0.008, h + N * 0.12, N * 0.016, N * 0.1);
    skullTex = new THREE.CanvasTexture(c); skullTex.colorSpace = THREE.SRGBColorSpace; skullTex.anisotropy = 4; return skullTex; };
  function pirKit(root, o) {
    root.updateMatrixWorld(true); const hulls = []; root.traverse(m => { if (m.isMesh && m.material === MAT.body && m.visible) hulls.push(m); });
    const bb = new THREE.Box3(); hulls.forEach(m => bb.expandByObject(m));
    const rc = new THREE.Raycaster(), nm = new THREE.Matrix3(), Z = V3(0, 0, 1), Y = V3(0, 1, 0);
    const hit = (p, d) => { rc.set(V3(...p), V3(...d).normalize()); const h = rc.intersectObjects(hulls, false)[0]; if (!h || !h.face) return null; nm.getNormalMatrix(h.object.matrixWorld); const n = h.face.normal.clone().applyMatrix3(nm).normalize(); if (n.dot(rc.ray.direction) > 0) n.negate(); return { p: h.point.clone(), n }; };
    const frame = (h, spin = 0) => { const q = new THREE.Quaternion().setFromUnitVectors(Z, h.n).multiply(new THREE.Quaternion().setFromAxisAngle(Z, spin)); return { q, at: (x, y, z) => V3(x, y, z).applyQuaternion(q).add(h.p) }; };
    const B = baker(), G = o.glow, S = o.sc || 1, DEC = [], M4 = (p, q, s3) => new THREE.Matrix4().compose(p, q, s3 || V3(1, 1, 1)); seed = o.seed || 7;
    const MIS = ['#3a3b42', '#4b3a32', '#454a3a', '#1c1d22', '#5a2a26'];
    const plate = (h, w, ht, th, c, spin, bolts = true) => { const F = frame(h, spin); B.add(new THREE.BoxGeometry(w, ht, th), c, M4(F.at(0, 0, th / 2 + 0.006), F.q), { out: 0.018 });
      if (bolts) for (const [bx, by] of [[-0.4, 0.32], [0.4, -0.32], [0.4, 0.32], [-0.4, -0.32]]) B.add(new THREE.SphereGeometry(0.024 * S, 5, 3), '#8d9099', M4(F.at(bx * w, by * ht, th + 0.006), F.q, V3(1, 1, 0.6)), { out: 0 }); return F; };
    const spike = (h, len) => B.add(new THREE.ConeGeometry(0.055 * S, len, 4), GRAPH2, M4(h.p.clone().addScaledVector(h.n, len * 0.45), new THREE.Quaternion().setFromUnitVectors(Y, h.n)), { out: 0.015 });
    const tally = (h, n) => { const F = frame(h, 0); for (let k = 0; k < n; k++) { const g5 = k % 5 === 4; B.add(new THREE.BoxGeometry(0.035 * S, 0.26 * S, 0.012), G, M4(F.at(g5 ? (k - 2) * 0.075 * S - 0.15 * S : (k - (k / 5 | 0)) * 0.075 * S, 0, 0.012), F.q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(Z, g5 ? 1.1 : 0)), g5 ? V3(1, 1.45, 1) : V3(1, 1, 1)), { glow: true }); } };
    const sd = o.side;
    // ARMOURED side: salvaged plates at angles, mismatched colours, bolts, a few spikes
    { const A = o.arm; for (let i = 0; i < A.n; i++) A.ys.forEach((y, j) => { const z = A.z0 + (A.z1 - A.z0) * (i + 0.5 * (j % 2)) / A.n, h = hit([sd * A.x0, y, z], [-sd, 0, 0]); if (!h) return;
      plate(h, (0.42 + rnd() * 0.34) * S, (0.22 + rnd() * 0.16) * S, 0.045 * S, MIS[(i * 2 + j) % MIS.length], (rnd() - 0.5) * 0.7); if ((i + j) % 3 === 1) spike(h, 0.32 * S); }); }
    // STRIPPED side: bare ribs, dark missing panels, an exposed conduit with a red glow line
    { const X2 = o.strip, pipe = []; for (let i = 0; i <= X2.n; i++) { const z = X2.z0 + (X2.z1 - X2.z0) * i / X2.n, h = hit([-sd * X2.x0, X2.y, z], [sd, 0, 0]); if (!h) continue; const F = frame(h, HP);
        B.add(new THREE.BoxGeometry(0.5 * S, 0.06 * S, 0.06 * S), '#17181c', M4(F.at(0, 0, 0.03 * S), F.q), { out: 0.015 }); pipe.push(h.p.clone().addScaledVector(h.n, 0.09 * S).add(V3(0, -0.12 * S, 0)));
        if (i < X2.n && i % 2 === 0) { const h2 = hit([-sd * X2.x0, X2.y + 0.04, z + (X2.z1 - X2.z0) / X2.n * 0.5], [sd, 0, 0]); if (h2) { const F2 = frame(h2, 0.1); B.add(new THREE.BoxGeometry(0.34 * S, 0.24 * S, 0.012), '#08080a', M4(F2.at(0, 0, 0.008), F2.q), { out: 0 }); } } }
      if (pipe.length > 2) { B.tube(pipe.map(v => [v.x, v.y, v.z]), 0.035 * S, '#3a2622', { rseg: 5, caps: false }); B.tube(pipe.map(v => [v.x, v.y + 0.055 * S, v.z]), 0.014 * S, G, { glow: true, rseg: 4, caps: false }); }
      if (o.sideTally) { const h = hit([-sd * X2.x0, o.sideTally[0], o.sideTally[1]], [sd, 0, 0]); if (h) tally(h, 7); } }
    // a mismatched PRIMER patch bolted over one wing
    if (o.wing) { const h = hit([o.wing[0], 6, o.wing[1]], [0, -1, 0]); if (h) plate(h, 0.75 * S, 0.5 * S, 0.035 * S, '#4f5440', 0.45); }
    // CROSSBONES PLATE where the 8 crest was + tally marks on the roof
    if (o.crest) { const h = hit([0, 6, o.crest[0]], [0, -1, 0]); if (h) { const R0 = o.crest[1], q = new THREE.Quaternion().setFromUnitVectors(Y, h.n); B.add(new THREE.CylinderGeometry(R0, R0 * 1.04, 0.07, SEG(28)), '#141418', M4(h.p.clone().addScaledVector(h.n, 0.03), q), { out: 0.025 });
      B.add(new THREE.TorusGeometry(R0 * 1.0, 0.02, 4, SEG(28)), G, M4(h.p.clone().addScaledVector(h.n, 0.07), new THREE.Quaternion().setFromUnitVectors(Z, h.n)), { glow: true }); DEC.push({ p: h.p, n: h.n, r: R0 * 0.94, up: 0.075 }); } }
    if (o.tally) { const h = hit([o.tally[0], 6, o.tally[1]], [0, -1, 0]); if (h) tally(h, 6); }
    // SKULL NOSE ART: a flat dark panel on each side of the nose with the skull decal
    if (o.noseArt) for (const s2 of [-1, 1]) { const h = hit([s2 * 4, o.noseArt[0], o.noseArt[1]], [-s2, 0, 0]); if (!h) continue; const r0 = o.noseArt[2] * S; plate(h, r0 * 2.3, r0 * 2.3, 0.03 * S, '#101013', 0, false); DEC.push({ p: h.p, n: h.n, r: r0, up: 0.045 * S }); }
    if (o.noseTop != null) { const h = hit([0, 6, o.noseTop], [0, -1, 0]); if (h) DEC.push({ p: h.p, n: h.n, r: 0.2 * S, up: 0.025 }); }
    // RAM PRONGS out of the nose (4-sided, jagged)
    if (o.ram) { const R2 = o.ram, h = hit([0, R2.y, bb.min.z - 3], [0, 0, 1]), z0 = h ? h.p.z : bb.min.z;
      for (const [x, dy, k, sp] of [[0, 0, 1, 0], [-R2.x, -0.06, 0.62, 0.28], [R2.x, -0.06, 0.62, -0.28]]) { const L2 = R2.len * k * S, dir = V3(0, 0, -1).applyAxisAngle(Y, sp), base = V3(x, R2.y + dy, z0 + 0.18 * S);
        B.add(new THREE.ConeGeometry(0.075 * S * (k < 1 ? 0.8 : 1), L2, 4), GRAPH2, M4(base.clone().addScaledVector(dir, L2 / 2), new THREE.Quaternion().setFromUnitVectors(Y, dir)), { out: 0.018 });
        B.add(new THREE.TorusGeometry(0.075 * S, 0.016 * S, 3, 8), G, M4(base.clone().addScaledVector(dir, 0.05), new THREE.Quaternion().setFromUnitVectors(Z, dir)), { glow: true }); } }
    // a JAGGED (sawtooth) FIN, leaning off-centre
    if (o.fin) { const [fx, fz, len, ht, lean] = o.fin, h = hit([fx, 6, fz], [0, -1, 0]); if (h) { const L3 = len * S, H3 = ht * S, sh = new THREE.Shape(), P = [[0, 0], [L3, 0], [L3 * 0.88, H3 * 0.22], [L3 * 0.76, H3 * 0.16], [L3 * 0.6, H3 * 0.52], [L3 * 0.48, H3 * 0.4], [L3 * 0.3, H3 * 0.82], [L3 * 0.18, H3 * 0.66], [-L3 * 0.1, H3]];
      P.forEach(([u, v], i) => i ? sh.lineTo(u, v) : sh.moveTo(u, v)); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.05 * S, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1, curveSegments: 1 });
      g.translate(0, -0.04, -0.025 * S); g.rotateY(HP); g.rotateZ(lean || 0); g.translate(h.p.x, h.p.y, h.p.z); B.add(g, o.trim || '#3a1416', null, { out: 0.02 }); } }
    // PLATED-SHUT DOOR (walk-ins): a primer plate + crossed bars over the old ramp door
    if (o.door) { const D = o.door, c = V3(0, D.y0 + D.h / 2, D.z + 0.04); B.add(new THREE.BoxGeometry(D.w + 0.12, D.h + 0.1, 0.05), '#3e3a34', M4(c, new THREE.Quaternion()), { out: 0.02 });
      for (const s2 of [-1, 1]) B.add(new THREE.BoxGeometry(0.07, Math.hypot(D.w, D.h) * 1.02, 0.04), '#17181c', M4(c.clone().add(V3(0, 0, 0.04)), new THREE.Quaternion().setFromAxisAngle(Z, s2 * Math.atan2(D.w, D.h))), { out: 0.012 });
      B.add(new THREE.BoxGeometry(D.w + 0.1, 0.04, 0.02), G, M4(c.clone().add(V3(0, D.h / 2 + 0.1, 0.02)), new THREE.Quaternion()), { glow: true }); }
    const grp = new THREE.Group(); grp.name = 'pirateKit'; grp.add(B.bake('pirateKit'));
    if (DEC.length) { const pos = [], uv = []; for (const d of DEC) { const pg = new THREE.PlaneGeometry(d.r * 2, d.r * 2).toNonIndexed(); pg.applyMatrix4(M4(d.p.clone().addScaledVector(d.n, d.up || 0.02), new THREE.Quaternion().setFromUnitVectors(Z, d.n))); pos.push(...pg.attributes.position.array); uv.push(...pg.attributes.uv.array); pg.dispose(); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      grp.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: skullArt(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false }))); }
    // DIRTY SMOKE behind each engine: ember red at the nozzle → grey-black puffs (normal blending), driven by one uniform so every clone animates
    const E = (o.engines || []).map(e => e.isObject3D ? e.getWorldPosition(V3()) : V3(...e)), per = low ? 8 : 14;
    if (E.length) { const n = E.length * per, P = new Float32Array(n * 3), D = new Float32Array(n * 2); E.forEach((e, i) => { for (let k = 0; k < per; k++) { const j = i * per + k; P.set([e.x, e.y, e.z], j * 3); D[j * 2] = k / per + rnd() * 0.04; D[j * 2 + 1] = rnd(); } });
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aD', new THREE.BufferAttribute(D, 2));
      const U = { uT: { value: 0 }, map: { value: glowTex }, scale: { value: 420 }, len: { value: (o.smokeLen || 3.2) * S }, cHot: { value: new THREE.Color(G) } };
      const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
        vertexShader: 'attribute vec2 aD; uniform float uT, scale, len; varying float vT; void main(){ float t = fract(uT * 0.55 + aD.x); vT = t; vec3 p = position; p.z += t * len; p.x += (aD.y - 0.5) * t * 0.9; p.y += t * t * 0.45 + (fract(aD.y * 7.3) - 0.5) * t * 0.5; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = (0.3 + t * 1.5) * scale / -mv.z; gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform sampler2D map; uniform vec3 cHot; varying float vT; void main(){ vec4 t = texture2D(map, gl_PointCoord); vec3 c = mix(cHot, vec3(0.12, 0.11, 0.11), smoothstep(0.0, 0.28, vT)); float a = t.a * (1.0 - vT) * 0.55; gl_FragColor = vec4(c, a); }' });
      const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.userData.tick = (t, ws) => { U.uT.value = t; if (ws) U.scale.value = ws; }; grp.add(pts); }
    return { grp, bb };
  }
  // finish a pirate: kit on, re-centred on its hull (combat + scope treat the model centre as the ship centre), gun spots shifted to match
  function pirFinish(r, root, o) { const K = pirKit(root, o); root.add(K.grp); const cz = (K.bb.min.z + K.bb.max.z) / 2, wrap = new THREE.Group(); root.position.z = -cz; wrap.add(root);
    const guns = ((r.api && r.api.guns) || []).map(g => [g[0], g[1], g[2] - cz]);
    return { root: wrap, pts: r.pts, anim: r.anim, hit: r.hit, api: { guns, engines: r.api && r.api.engines, flash: flashOver(wrap, o.flashR || 8) } }; }
  function pirScout(L) { TINT = pirTint(L.glow); let r; try { r = ship({ ...defaults('ship'), hull: L.armour, accent: L.trim, canopy: L.glow, engine: L.glow, edge: L.glow, slit: true, emblem: false, pods: true, wingSpan: 1.3, sweep: -1.5, finCant: 30, wingCol: L.wing }, L.trim);   /* s590b (Ben): red wings, bigger than yours, swept FORWARD */ r.pts = r.LT.make(); } finally { TINT = null; }
    if (r.pts) r.root.add(r.pts);
    const f = pirFinish(r, r.root, { glow: L.glow, trim: L.trim, side: -1, sc: 0.8, seed: 11, flashR: 7,
      arm: { x0: 0.9, ys: [0.13], z0: -1.5, z1: 1.5, n: 4 }, strip: { x0: 0.9, y: 0.1, z0: -1.4, z1: 1.4, n: 4 }, sideTally: [0.12, -0.15],
      wing: [1.6, 0.1], crest: [0.5, 0.42], tally: [-1.05, 0.3], noseArt: [0.04, -1.75, 0.15], ram: { y: 0, len: 0.95, x: 0.22 }, fin: [0, 2.2, 1.0, 0.5, 0.12], engines: r.api.engines, smokeLen: 3 });
    f.hit = 3; return f; }
  function pirWalk(T, L, o) { TINT = pirTint(L.glow); let r; try { r = (T === 'hullCorvette' ? hullCorvette : hullGunship)({ ...defaults(T), hull: L.armour, accent: L.trim, edge: L.glow, glow: L.glow, crestGlow: L.glow, emblem: false, ramp: 0, worldTint: false, fly: false, wingShape: 'forward', wingCol: L.wing, ...(o.wings || {}) }, L.trim); } finally { TINT = null; }
    const root = r.root, rp = root.getObjectByName('ramp'); if (rp && rp.parent) rp.parent.removeFromParent(); const pl = root.getObjectByName('plug'); if (pl) pl.removeFromParent();
    const tb = root.getObjectByName('turret') || root.getObjectByName('miniTurret'); if (tb) { tb.name = 'turretBase'; const tur = tb.parent; tur.name = 'turret';   // combat turns the WHOLE turret (base + barrels) at you
      tur.traverse(m => { if (m.isMesh && m.material && m.material.isMeshBasicMaterial && !m.material.vertexColors && !m.material.map) m.visible = false; if (m.isSprite && m.material.opacity === 0) m.visible = false; }); }
    const d = r.api.dims; return pirFinish(r, root, { ...o, glow: L.glow, trim: L.trim, engines: r.api.engines, door: { y0: d.floor, h: d.doorH, w: d.doorW * 2, z: d.hinge } }); }
  function pirCruiser(L) { return pirWalk('hullCorvette', L, { side: 1, sc: 1, seed: 23, flashR: 8,
    arm: { x0: 1.45, ys: [0.62, 0.92], z0: -2.2, z1: 1.3, n: 5 }, strip: { x0: 1.45, y: 0.72, z0: -2.0, z1: 1.2, n: 5 }, sideTally: [0.95, -1.4],
    wings: { wingSpan: 1.35, wingSize: 1.5 }, wing: [-1.9, 0.3], crest: [-0.6, 0.55], tally: [-0.62, -1.75], noseArt: [0.6, -2.65, 0.2], ram: { y: 0.42, len: 1.0, x: 0.3 }, fin: [0.75, 0.4, 1.3, 0.5, -0.3], smokeLen: 3.6 }); }
  function pirGunner(L) { return pirWalk('hullGunship', L, { side: -1, sc: 1.1, seed: 37, flashR: 10,
    arm: { x0: 1.6, ys: [0.95, 1.2], z0: -2.2, z1: 1.2, n: 5 }, strip: { x0: 1.6, y: 1.05, z0: -2.0, z1: 1.2, n: 5 }, sideTally: [1.25, -1.7],
    wings: { wingSpan: 1.3, wingSize: 1.5 }, wing: [2.3, -0.6], crest: [-1.15, 0.6], tally: [0.72, -1.95], noseArt: [0.72, -2.75, 0.2], ram: { y: 0.52, len: 1.0, x: 0.36 }, fin: [0, -1.85, 0.62, 0.36, 0], smokeLen: 4 }); }


  // ---------------------------------------------------------------- s591 THE MACHINE FLEET (Ben: "like the pirates"): SCOUT / CRUISER / GUNNER built on YOUR scout + the walk-in
  // CRUISER + GUNNER (the fleet the foxes built, HACKED, story: victims, not villains). Hacked: everything re-read in the hack pink (tintTo), the 8 crest overwritten by an F
  // with the REAL 8 flickering through every few seconds, a parasite HACK SPIKE clamped on the hull with cables into both flanks, pink glitch pixels. No smoke, no plates:
  // the hull itself is still clean + whole. L.freed = your own ship again (player colours + the 8 crest), same centre so the freed swap does not jump.
  const tintTo = G => { const R0 = new THREE.Color(G), hsl = {}, tg = {}; R0.getHSL(tg); return (col, glow) => { col.getHSL(hsl); const near = hsl.s > 0.3 && Math.abs(((hsl.h - tg.h + 1.5) % 1) - 0.5) < 0.07;
    if (glow) { if (near) return; if (hsl.s < 0.15) { if (hsl.l > 0.6) col.lerp(R0, 0.5); return; } const l = hsl.l; col.copy(R0); if (l < 0.35) col.multiplyScalar(0.3 + l); return; }
    if (near) return; if (hsl.s > 0.25) col.setHSL(tg.h, Math.min(0.55, hsl.s * 0.7), Math.min(0.32, hsl.l * 0.6)); }; };
  const glyphTex = (ch, plate, ink, edge) => { const N = 256, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), h = N / 2, rg = g.createRadialGradient(h * 0.9, h * 0.76, 4, h, h, h * 0.9);
    rg.addColorStop(0, plate[0]); rg.addColorStop(0.62, plate[1]); rg.addColorStop(1, plate[2]); g.beginPath(); g.arc(h, h, h * 0.9, 0, TAU); g.fillStyle = rg; g.fill(); g.lineWidth = N * 0.035; g.strokeStyle = edge; g.stroke();
    g.font = '900 ' + Math.round(N * 0.74) + 'px Archivo, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = N * 0.06; g.strokeStyle = '#140610'; g.strokeText(ch, h, h * 1.07); g.fillStyle = ink; g.fillText(ch, h, h * 1.07);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  function hullRays(root) { root.updateMatrixWorld(true); const hulls = []; root.traverse(m => { if (m.isMesh && m.material === MAT.body && m.visible) hulls.push(m); }); const bb = new THREE.Box3(); hulls.forEach(m => bb.expandByObject(m));
    const rc = new THREE.Raycaster(), nm = new THREE.Matrix3(); return { bb, hit(p, d) { rc.set(V3(...p), V3(...d).normalize()); const h = rc.intersectObjects(hulls, false)[0]; if (!h || !h.face) return null; nm.getNormalMatrix(h.object.matrixWorld); const n = h.face.normal.clone().applyMatrix3(nm).normalize(); if (n.dot(rc.ray.direction) > 0) n.negate(); return { p: h.point.clone(), n }; } }; }
  function machKit(root, anim, o) { const HR = hullRays(root), B = baker(), G = o.glow, S = o.sc || 1, Z = V3(0, 0, 1), Y = V3(0, 1, 0), M4 = (p, q, s3) => new THREE.Matrix4().compose(p, q, s3 || V3(1, 1, 1)), grp = new THREE.Group(); grp.name = 'hackKit'; seed = o.seed || 5;
    // the F CREST (the hack's mark) + the REAL 8 under it, flickering through
    { const h = HR.hit([0, 6, o.crest[0]], [0, -1, 0]); if (h) { const R0 = o.crest[1], q = new THREE.Quaternion().setFromUnitVectors(Y, h.n), qz = new THREE.Quaternion().setFromUnitVectors(Z, h.n);
      B.add(new THREE.CylinderGeometry(R0 * 1.04, R0 * 1.08, 0.07, SEG(32)), o.trim, M4(h.p.clone().addScaledVector(h.n, 0.03), q), { out: 0.025 }); B.add(new THREE.TorusGeometry(R0 * 1.03, 0.02, 4, SEG(32)), G, M4(h.p.clone().addScaledVector(h.n, 0.07), qz), { glow: true });
      const dg = new THREE.CircleGeometry(R0 * 0.94, SEG(40)), mF = new THREE.MeshBasicMaterial({ map: glyphTex('F', ['#4a1838', '#2a0c20', '#140610'], G, '#140610'), transparent: true, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false }),
        m8 = new THREE.MeshBasicMaterial({ map: glyphTex('8', ['#8fa8c8', '#44618c', '#1c2a42'], '#ffffff', '#231d3c'), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, toneMapped: false });
      for (const [m, up] of [[mF, 0.075], [m8, 0.078]]) { const d = new THREE.Mesh(dg, m); d.quaternion.copy(qz); d.position.copy(h.p).addScaledVector(h.n, up); grp.add(d); }
      const per = o.flick || 6.5; anim.push(t => { const k = t % per, on = k > per - 0.7 && Math.floor(k * 18) % 3 !== 0; m8.opacity = on ? 0.95 : 0; }); } }
    // the HACK SPIKE: a dark parasite box clamped on with claws, a pink dome, three antennae, cables into both flanks
    { const [sx, sz] = o.spike, h = HR.hit([sx, 6, sz], [0, -1, 0]); if (h) { const q = new THREE.Quaternion().setFromUnitVectors(Y, h.n), at = (x, y, z) => V3(x * S, y * S, z * S).applyQuaternion(q).add(h.p);
      B.add(new THREE.BoxGeometry(0.46 * S, 0.22 * S, 0.62 * S), '#1a0f18', M4(at(0, 0.11, 0), q), { out: 0.02 }); B.add(new THREE.BoxGeometry(0.5 * S, 0.03 * S, 0.66 * S), G, M4(at(0, 0.05, 0), q), { glow: true });
      B.add(new THREE.SphereGeometry(0.15 * S, SEG(12), SEG(6), 0, TAU, 0, HP), G, M4(at(0, 0.22, 0.08), q), { glow: true });
      for (const [x, z, ln] of [[-0.14, -0.2, 0.55], [0.15, -0.16, 0.4], [0.02, 0.24, 0.7]]) { B.add(new THREE.CylinderGeometry(0.012 * S, 0.02 * S, ln * S, 5), '#2b2f3b', M4(at(x, 0.22 + ln / 2, z), q), { out: 0.01 }); B.add(new THREE.SphereGeometry(0.035 * S, 6, 4), G, M4(at(x, 0.22 + ln, z), q), { glow: true }); }
      for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B.add(new THREE.BoxGeometry(0.05 * S, 0.05 * S, 0.3 * S), '#2b2f3b', M4(at(x * 0.28, 0.04, z * 0.33), q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(z * 0.5, x * 0.6, 0)))), { out: 0.012 });
      const top = at(0, 0.12, 0.31); for (const s2 of [-1, 1]) { const e = HR.hit([s2 * o.cable[0], o.cable[1], o.cable[2]], [-s2, 0, 0]); if (!e) continue; const end = e.p.clone().addScaledVector(e.n, 0.04), mid = top.clone().lerp(end, 0.5).add(V3(0, 0.25 * S, 0));
        const pts = [top, mid, end].map(v => [v.x, v.y, v.z]); B.tube(pts, 0.03 * S, '#1a0f18', { rseg: 5, caps: true }); B.tube(pts.map(p => [p[0], p[1] + 0.035 * S, p[2]]), 0.012 * S, G, { glow: true, rseg: 4, caps: false });
        B.add(new THREE.BoxGeometry(0.16 * S, 0.12 * S, 0.05 * S), '#1a0f18', M4(end, new THREE.Quaternion().setFromUnitVectors(Z, e.n)), { out: 0.012 }); } } }
    // GLITCH PIXELS: little clusters of pink squares on the plates (corrupted panels)
    { const P = o.pix; for (let i = 0; i < P.n; i++) { const x = (rnd() * 2 - 1) * P.w, z = P.z0 + rnd() * (P.z1 - P.z0), side = rnd() < 0.4, h = side ? HR.hit([(x < 0 ? -1 : 1) * 4, P.y, z], [x < 0 ? 1 : -1, 0, 0]) : HR.hit([x, 6, z], [0, -1, 0]); if (!h) continue;
      const q = new THREE.Quaternion().setFromUnitVectors(Z, h.n), tx = V3(1, 0, 0).applyQuaternion(q), ty = V3(0, 1, 0).applyQuaternion(q), u = 0.06 * S;
      for (const [a, b2, k] of [[0, 0, 1], [1, 0, 0.7], [0, -1, 0.85], [2, 1, 0.5], [-1, 1, 0.6]]) { if (rnd() < 0.25) continue; B.add(new THREE.BoxGeometry(u * k, u * k, 0.012), G, M4(h.p.clone().addScaledVector(tx, a * u * 1.15).addScaledVector(ty, b2 * u * 1.15).addScaledVector(h.n, 0.012), q), { glow: true }); } } }
    grp.add(B.bake('hackKit')); root.add(grp); return HR.bb; }
  function machShip(T, L, o) { const fr = !!L.freed; let r; TINT = fr ? null : tintTo(L.glow);
    try { if (T === 'ship') { const sd = defaults('ship'); r = ship(fr ? sd : { ...sd, hull: L.pink, accent: L.pinkDark, canopy: L.glow, engine: L.glow, edge: L.glow, emblem: false }, fr ? sd.accent : L.pinkDark); r.pts = r.LT.make(); if (r.pts) r.root.add(r.pts); }
      else r = (T === 'hullCorvette' ? hullCorvette : hullGunship)({ ...defaults(T), ramp: 0, fly: false, worldTint: false, ...(fr ? {} : { hull: L.pink, accent: L.pinkDark, edge: L.glow, glow: L.glow, crestGlow: L.glow, emblem: false }), ...(o.wings || {}) }, fr ? undefined : L.pinkDark); } finally { TINT = null; }
    const root = r.root, rp = root.getObjectByName('ramp'); if (rp && rp.parent) rp.parent.removeFromParent();
    const tb = root.getObjectByName('turret') || root.getObjectByName('miniTurret'); if (tb) { tb.name = 'turretBase'; tb.parent.name = 'turret'; tb.parent.traverse(m => { if (m.isSprite && m.material.opacity === 0) m.visible = false; }); }
    const bb = fr ? hullRays(root).bb : machKit(root, r.anim, { ...o, glow: L.glow, trim: L.pinkDark }), cz = (bb.min.z + bb.max.z) / 2, wrap = new THREE.Group(); root.position.z = -cz; wrap.add(root);
    return { root: wrap, pts: r.pts, anim: r.anim, hit: r.hit, api: { guns: ((r.api && r.api.guns) || []).map(g => [g[0], g[1], g[2] - cz]), engines: r.api && r.api.engines, flash: flashOver(wrap, o.flashR || 8) } }; }
  function machScout(L) { return machShip('ship', L, { sc: 0.8, seed: 13, flashR: 7, crest: [0.5, 0.5], spike: [0, 1.5], cable: [0.9, 0.1, 1.2], pix: { n: 6, w: 1.8, y: 0.1, z0: -1.6, z1: 1.6 } }); }
  function machCruiser(L) { return machShip('hullCorvette', L, { wings: { wingSpan: 1.35, wingSize: 1.5 }, sc: 1, seed: 29, flashR: 8, crest: [-0.6, 0.72], spike: [0, -1.75], cable: [1.45, 0.8, -1.6], pix: { n: 8, w: 1.0, y: 0.8, z0: -2.2, z1: 1.3 }, flick: 7 }); }
  function machGunner(L) { return machShip('hullGunship', L, { wings: { wingSpan: 1.3, wingSize: 1.5 }, sc: 1.1, seed: 41, flashR: 10, crest: [-1.15, 0.8], spike: [0, -2.1], cable: [1.6, 1.0, -1.9], pix: { n: 9, w: 1.1, y: 1.0, z0: -2.3, z1: 1.4 }, flick: 7.5 }); }


  // ---------------------------------------------------------------- s595 THE MERU FLEET (Ben): your ships in MERU colours (royal silver, gold trim + glow) with an M crest on a navy plate.
  // Built on the same builders (ship + the 4 walk-ins) through tintTo(gold), so every cyan glow reads gold and the blue paint reads deep gold-bronze. Ramp closed. Re-centred on the hull.
  // s595b (Ben): BIG WINGS on every Meru ship so they read bigger (gold, swept; the flagship gets its optional wings switched on)
  const MER_WINGS = { ship: { wingSpan: 1.3, sweep: 0.75 }, hullShuttle: { wingShape: 'swept', wingSpan: 1.35, wingSize: 1.45 }, hullCorvette: { wingShape: 'swept', wingSpan: 1.35, wingSize: 1.5 }, hullGunship: { wingShape: 'swept', wingSpan: 1.25, wingSize: 1.45 }, hullFlagWalk: { wings: 'swept', wingSpan: 1.15, wingSize: 1.35 } };
  function merShip(T, L) { const crest = { crestText: 'M', crestInk: L.crest, crestPlate: ['#3a4f86', '#1c2a5a', '#0c1430'], crestGlow: L.glow, wingCol: L.trim, ...MER_WINGS[T] }; let r; TINT = tintTo(L.glow);
    try { if (T === 'ship') { r = ship({ ...defaults('ship'), hull: L.hull, accent: L.trim, engine: L.glow, edge: L.glow, ...crest }, L.trim); r.pts = r.LT.make(); if (r.pts) r.root.add(r.pts); }
      else r = ({ hullShuttle, hullCorvette, hullGunship, hullFlagWalk })[T]({ ...defaults(T), ramp: 0, fly: false, worldTint: false, hull: L.hull, accent: L.trim, edge: L.glow, glow: L.glow, ...crest }, L.trim); } finally { TINT = null; }
    const root = r.root, pl = root.getObjectByName('plug'); const bb = hullRays(root).bb, cz = (bb.min.z + bb.max.z) / 2, wrap = new THREE.Group(); root.position.z = -cz; wrap.add(root);
    return { root: wrap, pts: r.pts, anim: r.anim, hit: r.hit, api: { guns: ((r.api && r.api.guns) || []).map(g => [g[0], g[1], g[2] - cz]), engines: r.api && r.api.engines, flash: flashOver(wrap, 8) } }; }
  // s596 WORLD FLEETS: worldShip = merShip with that world's colours, crest letter, wing shape + one motif (worldKit)
  function worldKit(root, r, mo, L) { const HR = hullRays(root), bb = HR.bb, B = baker(), sz = bb.getSize(V3()), cn = bb.getCenter(V3());
    const eng = r.api && r.api.engines, zOf = e => e.z ?? e[2], ez = eng && eng.length ? eng.reduce((a, e) => a + zOf(e), 0) / eng.length : cn.z + 1, dir = ez > cn.z ? -1 : 1;   // dir = the nose side
    const u = sz.z / 4.6, front = dir > 0 ? bb.max.z : bb.min.z, rz = f => cn.z - dir * f * sz.z, top0 = (x, z) => HR.hit([x, bb.max.y + 3, z], [0, -1, 0]), G = L.glow, Tr = L.trim;
    const top = (x, z) => { for (let k = 1; k > 0.05; k *= 0.7) { const h = top0(x * k, z); if (h) return h; } return null; };   // s596b: step inward until it lands on the hull (scout fuselage is narrow)
    const finG = (pts, th) => { const sh = new THREE.Shape(); pts.forEach(([a, b], i) => i ? sh.lineTo(a * u, b * u) : sh.moveTo(a * u, b * u)); const g = new THREE.ExtrudeGeometry(sh, { depth: th * u, bevelEnabled: true, bevelThickness: th * u * 0.3, bevelSize: th * u * 0.3, bevelSegments: 1, curveSegments: 4 }); g.translate(0, 0, -th * u / 2); g.rotateY(dir < 0 ? -HP : HP); return g; };
    const back = (z, k) => z - dir * k * u;   // k units toward the tail
    const fin = (x, y, z, pts, th, cant, tip) => { B.add(finG(pts, th), Tr, mat4([x, y, z], [0, 0, cant || 0]), { out: 0.025 }); if (tip) { const [a, b] = tip; B.add(new THREE.BoxGeometry(th * u * 1.6, 0.06 * u, 0.42 * u), G, mat4([x - Math.sin(cant || 0) * b * u, y + Math.cos(cant || 0) * b * u, back(z, a)], [0, 0, cant || 0]), { glow: true }); } };
    if (mo === 'fin') { const h = top(0, rz(0.26)); if (h) fin(0, h.p.y - 0.05, h.p.z, [[-0.5, 0], [0.55, 0], [0.8, 1.35], [0.35, 1.35]], 0.08, 0, [0.58, 1.33]); }
    if (mo === 'twinFin' || (mo === 'tips' && !(r.api && r.api.guns && r.api.guns.some(g => Math.abs(g[0]) > 0.3)))) for (const s2 of [-1, 1]) { const x = s2 * Math.max(0.18, sz.x * 0.09), h = top(x, rz(0.28)); if (h) fin(h.p.x, h.p.y - 0.04, h.p.z, [[-0.35, 0], [0.45, 0], [0.62, 0.95], [0.3, 0.95]], 0.07, -s2 * 0.42, [0.46, 0.93]); }
    if (mo === 'tips') for (const g of r.api.guns || []) { if (Math.abs(g[0]) <= 0.3) continue; fin(g[0], g[1] + 0.04 * u, back(g[2], 0.55), [[-0.25, 0], [0.35, 0], [0.45, 0.55], [0.1, 0.55]], 0.06, 0, [0.28, 0.53]); }
    if (mo === 'spike') { let h = HR.hit([0, cn.y, front + dir * 4], [0, 0, -dir]); if (!h) h = HR.hit([0, bb.min.y + sz.y * 0.35, front + dir * 4], [0, 0, -dir]);
      if (h) { const p = h.p.clone().addScaledVector(V3(0, 0, dir), -0.04 * u), cg = new THREE.ConeGeometry(0.13 * u, 1.0 * u, 4); cg.rotateY(Math.PI / 4); cg.translate(0, 0.5 * u, 0); B.add(cg, Tr, mat4([p.x, p.y, p.z], [dir * HP, 0, 0]), { out: 0.02, flat: true });
        B.add(new THREE.TorusGeometry(0.15 * u, 0.03 * u, 4, SEG(16)), G, mat4([p.x, p.y, p.z + dir * 0.05 * u]), { glow: true }); B.add(new THREE.SphereGeometry(0.05 * u, 6, 4), G, mat4([p.x, p.y, p.z + dir * 1.0 * u]), { glow: true }); } }
    if (mo === 'antenna') { const h = top(0, rz(0.14)); if (h) { const y = h.p.y - 0.03; B.add(new THREE.CylinderGeometry(0.025 * u, 0.04 * u, 1.0 * u, 6), '#cfd4de', mat4([0, y + 0.5 * u, h.p.z]), { out: 0.012 });
      B.add(new THREE.BoxGeometry(0.6 * u, 0.035 * u, 0.035 * u), Tr, mat4([0, y + 0.7 * u, h.p.z]), { out: 0.012 }); for (const s2 of [-1, 1]) B.add(new THREE.SphereGeometry(0.045 * u, 6, 4), G, mat4([s2 * 0.3 * u, y + 0.7 * u, h.p.z]), { glow: true });
      B.add(new THREE.SphereGeometry(0.075 * u, 8, 6), G, mat4([0, y + 1.02 * u, h.p.z]), { glow: true }); B.add(new THREE.CylinderGeometry(0.12 * u, 0.15 * u, 0.06 * u, 10), Tr, mat4([0, y + 0.02 * u, h.p.z]), { out: 0.012 }); } }
    if (mo === 'stripe') for (const s2 of [-1, 1]) { const pts = []; for (let i = 0; i <= 7; i++) { const h = top(s2 * 0.2 * u, rz(-0.36 + i * 0.1)); if (h) pts.push([h.p.x, h.p.y + 0.03 * u, h.p.z]); } if (pts.length >= 3) B.tube(pts, 0.04 * u, G, { glow: true, rseg: 4, caps: false }); }
    if (mo === 'pods') for (const s2 of [-1, 1]) { const x = s2 * Math.max(0.3 * u, sz.x * 0.13), h = top(x, rz(0.12)); if (!h) continue; const y = h.p.y + 0.1 * u, z = h.p.z; B.add(new THREE.CapsuleGeometry(0.13 * u, 0.85 * u, SEG(4), SEG(10)), Tr, mat4([h.p.x, y, z], [HP, 0, 0]), { out: 0.02 });
      B.add(new THREE.CylinderGeometry(0.14 * u, 0.14 * u, 0.06 * u, SEG(10)), '#cfd4de', mat4([h.p.x, y, back(z, -0.2)], [HP, 0, 0]), { out: 0.01 }); B.add(new THREE.SphereGeometry(0.09 * u, 8, 6), G, mat4([h.p.x, y, back(z, 0.55)]), { glow: true }); }
    if (mo === 'canards') { for (const s2 of [-1, 1]) { const z = rz(-0.3), h = HR.hit([s2 * (sz.x / 2 + 3), cn.y, z], [-s2, 0, 0]); if (!h) continue; const sh = new THREE.Shape(); [[0, 0], [0.75, 0.3], [0.75, 0.5], [0, 0.65]].forEach(([a, b], i) => i ? sh.lineTo(s2 * a * u, b * u) : sh.moveTo(s2 * a * u, b * u));
        const g = new THREE.ExtrudeGeometry(sh, { depth: 0.05 * u, bevelEnabled: true, bevelThickness: 0.015 * u, bevelSize: 0.015 * u, bevelSegments: 1 }); g.translate(0, 0, -0.025 * u); g.rotateX(dir < 0 ? HP : -HP); B.add(g, Tr, mat4([h.p.x - s2 * 0.05 * u, h.p.y, h.p.z]), { out: 0.02 });
        B.add(new THREE.BoxGeometry(0.06 * u, 0.04 * u, 0.22 * u), G, mat4([h.p.x + s2 * 0.72 * u, h.p.y, back(h.p.z, 0.4)]), { glow: true }); }
      const k = HR.hit([0, bb.min.y - 3, rz(0.25)], [0, 1, 0]); if (k) fin(0, k.p.y + 0.04, k.p.z, [[-0.4, 0], [0.5, 0], [0.62, -0.75], [0.25, -0.75]], 0.07, 0, null); }
    root.add(B.bake('worldKit')); }
  // pale paints (hull, light panels) + the world's own hull / trim stay as picked; only the player's blues + cyans turn into the world colour
  const wTint = (G, keep) => { const f = tintTo(G), h = {}, ks = new Set(keep.map(c => new THREE.Color(c).getHexString())); return (col, glow) => { if (ks.has(col.getHexString())) return; if (!glow) { col.getHSL(h); if (h.l > 0.72) return; } f(col, glow); }; };
  function worldShip(T, L, W) { const S = WORLD_STYLE[W], wg = T === 'ship' ? { wingSpan: S.scout[0], sweep: S.scout[1] } : T === 'hullFlagWalk' ? { wings: S.wing, wingSpan: Math.min(1.4, S.span * 0.85), wingSize: Math.min(1.3, S.size * 0.9) } : { wingShape: S.wing, wingSpan: S.span * (T === 'hullGunship' ? 0.93 : 1), wingSize: S.size };
    const crest = { crestText: S.letter, crestInk: L.crest, crestPlate: S.plate, crestGlow: L.glow, wingCol: L.trim, ...wg }; let r; TINT = wTint(L.glow, [L.hull, L.trim]);
    try { if (T === 'ship') { r = ship({ ...defaults('ship'), hull: L.hull, accent: L.trim, engine: L.glow, edge: L.glow, ...crest }, L.trim); r.pts = r.LT.make(); if (r.pts) r.root.add(r.pts); }
      else r = ({ hullShuttle, hullCorvette, hullGunship, hullFlagWalk })[T]({ ...defaults(T), ramp: 0, fly: false, worldTint: false, hull: L.hull, accent: L.trim, edge: L.glow, glow: L.glow, ...crest }, L.trim); } finally { TINT = null; }
    const root = r.root; try { worldKit(root, r, S.motif, L); } catch (e) { console.warn('worldKit', W, e); }
    const bb = hullRays(root).bb, cz = (bb.min.z + bb.max.z) / 2, wrap = new THREE.Group(); root.position.z = -cz; wrap.add(root);
    return { root: wrap, pts: r.pts, anim: r.anim, hit: r.hit, api: { guns: ((r.api && r.api.guns) || []).map(g => [g[0], g[1], g[2] - cz]), engines: r.api && r.api.engines, flash: flashOver(wrap, T === 'hullFlagWalk' ? 10 : 8) } }; }
  const merScout = L => merShip('ship', L), merShuttle = L => merShip('hullShuttle', L), merCruiser = L => merShip('hullCorvette', L), merGunner = L => merShip('hullGunship', L), merFlagship = L => merShip('hullFlagWalk', L);

  // ---------------------------------------------------------------- s380 PIRATE BASE (2D PIRATE_PORTS: KRASS GIBET MURK THRAX)
  function pirBase(L) {
    const B = baker(), LT = lights(), anim = [], H = L.hull, A = L.accent, G = L.glow;
    B.lathe([[0, -3.4], [2.6, -2.8], [5.2, -0.9], [6, 0], [5.4, 0.7], [3.8, 1.5], [2.4, 2.2], [0, 2.4]], H, [0, 0, 0], 0, { seg: 6, flat: true, out: 0.08 });
    B.tor(6.02, 0.13, G, [0, 0, 0], [HP, 0, 0], { glow: true, seg: 36, tube: 4 }); B.tor(3.9, 0.08, G, [0, 1.52, 0], [HP, 0, 0], { glow: true, seg: 30, tube: 4 });
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + TAU / 12; B.rbox(2.2, 0.3, 1.6, 0.1, A, [Math.cos(a) * 4.3, 1.2, Math.sin(a) * 4.3], [0, -a, -0.38], { out: 0.03 }); LT.add([Math.cos(a) * 5.75, 0.35, Math.sin(a) * 5.75], AMBER, 0.8, 0); }
    B.cyl(1.4, 2.0, 2.6, A, [0, 3.4, 0], 0, { seg: 6, flat: true }); B.cyl(1.7, 1.4, 0.45, H, [0, 4.92, 0], 0, { seg: 6, flat: true }); B.cyl(1.47, 1.47, 0.22, G, [0, 4.25, 0], 0, { glow: true, seg: 6, open: true });
    if (L.xcrest) for (const s of [-1, 1]) B.box(3.4, 0.12, 0.44, G, [0, 5.2, 0], [0, s * 0.785, 0], { glow: true });
    B.cyl(0.1, 0.14, 3.2, GRAPH2, [1.05, 6.6, 0], 0, { seg: 6 }); LT.add([1.05, 8.3, 0], G, 1.8, 0.8);
    B.cyl(1.5, 0, 3.6, A, [0, -5.1, 0], 0, { seg: 6, flat: true }); LT.add([0, -6.9, 0], G, 1.5, 0.5);
    const R2 = baker(), n = L.blades, gunA = [];
    R2.tor(9, 0.42, H, [0, 0, 0], [HP, 0, 0], { seg: 48, tube: 8 }); R2.tor(9, 0.12, G, [0, 0.42, 0], [HP, 0, 0], { glow: true, seg: 48, tube: 4 });
    const W = (u, v, a) => [u * Math.cos(a) - v * Math.sin(a), u * Math.sin(a) + v * Math.cos(a)];
    for (let i = 0; i < n; i++) { const a = i / n * TAU;
      R2.tube([[Math.cos(a) * 5.7, 0, Math.sin(a) * 5.7], [Math.cos(a) * 9, 0, Math.sin(a) * 9]], 0.24, A, { rseg: 6 });
      const uv = [[8.4, -1.1], [11, -0.9], [13.3, 0.15], [14.4, 1.7], [12.4, 0.75], [10.2, 0.62], [8.4, 0.95]], sh = new THREE.Shape();
      uv.forEach(([u, v], k) => { const [x, z] = W(u, v, a); k ? sh.lineTo(x, -z) : sh.moveTo(x, -z); }); sh.closePath(); R2.ext(sh, 0.45, A, [0, 0, 0], [-HP, 0, 0], { bev: 0.08 });
      R2.tube([[8.8, -1.05], [11, -0.85], [13.2, 0.2], [14.2, 1.55]].map(([u, v]) => { const [x, z] = W(u, v, a); return [x, 0.34, z]; }), 0.07, G, { glow: true, rseg: 4, caps: false });
      const [tx, tz] = W(14.4, 1.7, a); LT.add([tx, 0.2, tz], G, 1.3, 0.6, i); }
    for (let i = 0; i < L.guns; i++) { const a = (i + 0.5) / L.guns * TAU, cx = Math.cos(a), sz = Math.sin(a), tx = -sz, tz = cx; gunA.push(a);
      R2.lathe([[0, 0], [0.95, 0], [1, 0.3], [0.62, 0.78], [0, 0.82]], GRAPH, [cx * 9, 0.36, sz * 9], 0, { seg: 12 });
      for (const s of [-1, 1]) R2.cyl(0.1, 0.13, 2.1, GRAPH2, [cx * 10.1 + tx * s * 0.26, 0.8, sz * 10.1 + tz * s * 0.26], [0, -a, -HP], { seg: 8, out: 0.025 });
      R2.cyl(0.28, 0.28, 0.04, G, [cx * 9, 1.2, sz * 9], 0, { glow: true, seg: 10 }); }
    const ring = R2.bake('baseRing'), root = new THREE.Group(); root.add(B.bake('pirBase')); root.add(ring);
    const rim = []; for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; rim.push([Math.cos(a) * 9, 0.55, Math.sin(a) * 9]); } const sp = flow([rim], G, 10, 0.05, 0.8, true); ring.add(sp);
    const sh = shuttle('#2e2f37', G, 1.1); root.add(sh); const fl = fly(sh, t => [Math.cos(t * 0.22) * 18, 1.6 + Math.sin(t * 0.5) * 0.8, Math.sin(t * 0.22) * 18]);
    anim.push((t, dt) => { ring.rotation.y += dt * L.spin * 0.5; sp.userData.flow(t); fl(t); });
    return { root, LT, anim, hit: 14, api: { ring, gunA, gunR: 11.2, gunY: 0.8, flash: flashOver(root, 26) } };
  }
  // ---------------------------------------------------------------- s380 DEEP SPACE FOX (the station from outside)
  const _q0 = new THREE.Quaternion();
  function dsf(L, acc) {
    const DSF_API = { turrets: [] }, B = baker(), LT = lights(), anim = [], Rw = L.wheel, H = L.hull, HD = mix(H, GRAPH, 0.5), TB = L.tube || 2.0, TY = 1.35;   // s391 (Ben): bigger ring, thicker north to south
    B.lathe([[0, -7.5], [0.8, -7.2], [1.3, -5.8], [1.6, -3], [2.6, -1.4], [4.8, -0.7], [5.8, 0], [4.8, 0.7], [2.6, 1.3], [1.5, 2.4], [1.3, 4.2], [0.9, 5.2], [0, 5.4]], H, [0, 0, 0], 0, { seg: 28 });
    B.tor(5.8, 0.17, acc, [0, 0, 0], [HP, 0, 0], { seg: 40, tube: 6, out: 0.03 }); B.tor(2.7, 0.08, CYAN, [0, -1.42, 0], [HP, 0, 0], { glow: true, seg: 24, tube: 4 });
    B.tor(1.55, 0.07, acc, [0, 3.2, 0], [HP, 0, 0], { glow: true, seg: 20, tube: 4 });
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; LT.add([Math.cos(a) * 5.2, 0.48, Math.sin(a) * 5.2], WIN, 0.7, 0); }
    LT.add([0, 5.9, 0], RED, 1.8, 0.7); LT.add([0, -7.8, 0], CYAN, 1.6, 0);
    for (let k = 0; k < L.solar; k++) { const a = k / Math.max(1, L.solar) * Math.PI + 0.4;
      for (const s of [0, Math.PI]) { const b = a + s, cx = Math.cos(b), sz = Math.sin(b);
        B.tube([[cx * 1.4, 3.4, sz * 1.4], [cx * (Rw + 5.5), 3.4 + TB * 0.6, sz * (Rw + 5.5)]], 0.13, GRAPH2, { rseg: 6 });
        for (const d of [Rw - 3.2, Rw + 3.4]) B.box(3.8, 0.12, 2.4, PANEL, [cx * d, 3.4 + TB * 0.6, sz * d], [0, -b, 0], { out: 0.04 });
        LT.add([cx * (Rw + 5.7), 3.45 + TB * 0.6, sz * (Rw + 5.7)], s ? GREEN : RED, 1.1, 0.6, k); } }
    if (L.hangar) { // s401 CARGO BAY FOUR (Ben: "I like it but it's too boxy"): a sleek capsule hangar on a curved, ribbed arm; a flared mouth with the blue force-field door
      const X0 = Rw + TB + 6.8, Y0 = -3.6, HL = 6.4;
      B.tube([[1.3, -3.2, 0], [Rw * 0.45, -3.9, 0], [Rw * 0.85, -4.0, 0], [X0 - HL / 2 - 0.4, Y0, 0]], 0.42, HD, { rseg: 10 });   // the arm: a smooth swept pipe
      for (let k = 1; k <= 5; k++) { const u = k / 6, x = 1.3 + u * (X0 - HL / 2 - 1.7); B.tor(0.55, 0.08, k % 2 ? acc : GRAPH2, [x, -3.2 - Math.sin(u * Math.PI) * 0.8 + (u > 0.8 ? (Y0 + 3.2) * (u - 0.8) * 5 * 0 : 0), 0], [0, HP, 0], { seg: 14, tube: 4, out: 0.02 }); }
      B.cap(1.65, HL - 3.3, H, [X0, Y0, 0], [0, 0, HP], { seg: 22, s: [1, 1, 1.25] });   // the hangar: a capsule, wider than tall
      B.tor(1.7, 0.12, acc, [X0 - HL * 0.18, Y0, 0], [0, HP, 0], { seg: 28, tube: 5, s: [1, 1, 1.25], out: 0.02 }); B.tor(1.7, 0.09, GRAPH2, [X0 + HL * 0.12, Y0, 0], [0, HP, 0], { seg: 28, tube: 4, s: [1, 1, 1.25], out: 0.02 });
      B.lathe([[1.15, 0], [1.9, 0.5], [2.15, 1.0], [2.1, 1.12], [1.45, 0.75], [1.05, 0.55]], HD, [X0 + HL / 2 - 0.9, Y0, 0], [0, 0, -HP], { seg: 28, s: [1, 1, 1.25] });   // flared mouth
      B.cyl(1.45, 1.45, 0.04, L.field, [X0 + HL / 2 + 0.05, Y0, 0], [0, 0, HP], { glow: true, seg: 28, s: [1, 1, 1.25] });   // the force-field door
      for (let k = 0; k < 6; k++) B.box(0.05, 0.22, 0.5, WIN, [X0 - HL * 0.3 + k * 0.62, Y0 + 1.45, 1.3], [0.55, 0, 0], { glow: true });   // a row of bay windows on the side
      B.rbox(1.6, 0.4, 1.2, 0.18, GRAPH2, [X0 - 0.5, Y0 + 1.7, 0], 0); B.cyl(0.05, 0.05, 1.1, GRAPH2, [X0 - 0.5, Y0 + 2.4, 0], 0, { seg: 4 }); LT.add([X0 - 0.5, Y0 + 3.0, 0], RED, 1.0, 0.8);
      B.cyl(0.7, 0.4, 0.9, HD, [X0 - HL / 2 + 0.8, Y0 - 1.75, 0], 0, { seg: 12 }); LT.add([X0 - HL / 2 + 0.8, Y0 - 2.3, 0], AMBER, 0.9, 0);
      LT.add([X0 + HL / 2 + 0.4, Y0, 0], L.field, 3.4, 0); LT.add([X0 + HL / 2 + 0.2, Y0 + 1.8, 1.9], RED, 0.9, 1); LT.add([X0 + HL / 2 + 0.2, Y0 + 1.8, -1.9], GREEN, 0.9, 1, 2); }
    const Wb = baker(), n = L.spokes, spk = [];
    Wb.tor(Rw, TB, H, [0, 0, 0], [HP, 0, 0], { seg: 72, tube: 14, s: [1, 1, TY] }); Wb.tor(Rw + TB * 0.71, 0.12, WIN, [0, TB * TY * 0.7, 0], [HP, 0, 0], { glow: true, seg: 72, tube: 4 }); Wb.tor(Rw - TB * 0.71, 0.09, CYAN, [0, TB * TY * 0.7, 0], [HP, 0, 0], { glow: true, seg: 72, tube: 4 });
    for (let i = 0; i < n; i++) { const a = i / n * TAU + 0.3, cx = Math.cos(a), sz = Math.sin(a); Wb.tube([[cx * 5.9, 0, sz * 5.9], [cx * (Rw - TB * 0.9), 0, sz * (Rw - TB * 0.9)]], 0.42, H, { rseg: 8 }); spk.push([[cx * 6, 0.45, sz * 6], [cx * (Rw - TB), 0.45, sz * (Rw - TB)]]); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, cx = Math.cos(a), sz = Math.sin(a); Wb.rbox(3.6, TB * TY * 1.25, 2.4, 0.5, HD, [cx * (Rw + TB * 1.05), 0, sz * (Rw + TB * 1.05)], [0, -a - HP, 0]); Wb.box(2.8, 0.12, 0.3, acc, [cx * (Rw + TB * 1.05), TB * TY * 0.64, sz * (Rw + TB * 1.05)], [0, -a - HP, 0], { out: 0 }); }
    const wheel = Wb.bake('wheel'), lifts = flow(spk, CYAN, 3, 0.25, 0.8); wheel.add(lifts);
    const root = new THREE.Group(); root.add(B.bake('dsf')); root.add(wheel);
    if (L.dish) { // s395 (Ben): a TALLER dish mast; the dish ROTATES, and to fire the lance it SPINS UP and swings onto the ship it is firing at
      const MH = L.mast ?? 1.6, M = baker(); M.cyl(0.32, 0.55, MH, HD, [0, MH / 2, 0], 0, { seg: 12 }); M.tor(0.6, 0.08, acc, [0, MH * 0.35, 0], [HP, 0, 0], { glow: true, seg: 16, tube: 4 }); M.tor(0.48, 0.07, acc, [0, MH * 0.75, 0], [HP, 0, 0], { glow: true, seg: 16, tube: 4 }); M.cyl(0.75, 0.6, 0.4, H, [0, MH, 0], 0, { seg: 14 });
      const mast = M.bake('mast'); mast.position.y = 6.7; root.add(mast);
      const Y = baker(); for (const sd of [-1, 1]) Y.rbox(0.25, 1.3, 0.5, 0.1, GRAPH2, [sd * 1.05, 0.65, 0], 0, { out: 0.02 }); Y.cyl(0.55, 0.55, 0.3, HD, [0, 0.15, 0], 0, { seg: 12 }); const yoke = Y.bake('yoke');
      const D = baker();
      // s398 (Ben: "the dish looks too flat"): a deep PARABOLIC BOWL: outer shell (dark, ribbed), a raised rim lip, the inner face in 4 bands shading light at the rim to dark in the throat, a feed horn at the centre
      { const prof = [], N2 = 10; for (let k = 0; k <= N2; k++) { const u = k / N2, r = 0.45 + u * 1.95; prof.push([r, 0.05 + u * u * 1.1]); }
        D.lathe([[0.45, -0.25], [1.2, -0.2], [2.0, 0.25], [2.45, 0.9], [2.48, 1.18]], '#9aa3b2', [0, 0, 0], 0, { seg: 32 });   // back shell
        for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, pts = []; for (let m = 0; m <= 4; m++) { const u = m / 4, r = 0.55 + u * 1.9; pts.push([Math.cos(a) * r, -0.2 + u * u * 1.35, Math.sin(a) * r]); } D.tube(pts, 0.05, GRAPH2, { rseg: 3, caps: false }); }   // ribs on the back
        const bands = ['#5d6675', '#8a93a3', '#b8c0cc', '#e2e7ee']; for (let b = 0; b < 4; b++) { const p = prof.slice(Math.floor(b * N2 / 4), Math.floor((b + 1) * N2 / 4) + 1).map(([r, y]) => [r, y + 0.02]); D.lathe(p.slice().reverse(), bands[b], [0, 0, 0], 0, { seg: 32, out: 0 }); }   // reversed profile = normals face INTO the bowl (the side you look at)
        D.tor(2.42, 0.09, '#f3f5fa', [0, 1.17, 0], [HP, 0, 0], { seg: 40, tube: 5, out: 0.03 }); D.tor(2.42, 0.05, '#ff2a2a', [0, 1.24, 0], [HP, 0, 0], { glow: true, seg: 36, tube: 3 });
        D.lathe([[0, 0], [0.42, 0.02], [0.5, 0.3], [0.34, 0.42], [0, 0.44]], GRAPH, [0, 0, 0], 0, { seg: 16 }); }
      D.cyl(0.08, 0.08, 1.8, GRAPH2, [0, 1.0, 0], 0, { seg: 6 });
      // the 3 struts are their own mesh so they can HEAT UP: black → dull red → glowing red, from the rim toward the beam (shader by distance along the strut)
      const heatU = { uH: { value: 0 } }, strutMat = new THREE.ShaderMaterial({ uniforms: heatU, vertexShader: 'attribute float aU; varying float vU; void main(){ vU = aU; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform float uH; varying float vU; void main(){ float h = clamp(uH * 1.35 - vU * 0.6, 0.0, 1.0); vec3 c = mix(vec3(0.07, 0.08, 0.1), vec3(0.55, 0.04, 0.02), smoothstep(0.0, 0.45, h)); c = mix(c, vec3(1.0, 0.25, 0.12), smoothstep(0.45, 0.85, h)); c = mix(c, vec3(1.0, 0.85, 0.7), smoothstep(0.9, 1.0, h)); gl_FragColor = vec4(c, 1.0); }' });
      const strutGeos = []; for (let q = 0; q < 3; q++) { const a = q / 3 * TAU, cv = new THREE.LineCurve3(new THREE.Vector3(Math.cos(a) * 2.1, 1.12, Math.sin(a) * 2.1), new THREE.Vector3(0, 1.95, 0)), g = new THREE.TubeGeometry(cv, 8, 0.055, 6, false), P = g.attributes.position, U = new Float32Array(P.count), segs = 8, rs = 7; for (let i = 0; i < P.count; i++) U[i] = Math.floor(i / rs) / segs; g.setAttribute('aU', new THREE.BufferAttribute(U, 1)); strutGeos.push(g); }
      const struts = new THREE.Group(); strutGeos.forEach(g => struts.add(new THREE.Mesh(g, strutMat))); DSF_API.heat = heatU.uH;
      // s397 (Ben): the 3 struts carry red ELECTRICITY: it starts at the dish rim and crackles in toward the centre, feeding the lance
      const ZF = new THREE.Vector3(0, 0, 1), segG = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true); segG.translate(0, 0.5, 0); segG.rotateX(HP); const NS = 9, feeds = [];
      for (let q = 0; q < 3; q++) { const a = q / 3 * TAU, p0 = new THREE.Vector3(Math.cos(a) * 2.1, 1.12, Math.sin(a) * 2.1), p1 = new THREE.Vector3(0, 1.98, 0), segs = [], g = new THREE.Group(); g.visible = false;
        const mt = glowMat('#ff3a2a', 0), cm = glowMat('#ffffff', 0);
        for (let k = 0; k < NS * 2; k++) { const m = new THREE.Mesh(segG, k < NS ? mt : cm); g.add(m); segs.push(m); } const br = [0, 1].map(() => { const m = new THREE.Mesh(segG, mt); g.add(m); return m; });
        const spark0 = spark('#ff4a3a', 0.6); g.add(spark0); feeds.push({ g, segs, br, mt, cm, p0, p1, spark: spark0, pts: Array.from({ length: NS + 1 }, () => new THREE.Vector3()) }); }
      D.tor(0.5, 0.08, '#ff2a2a', [0, 1.95, 0], [HP, 0, 0], { glow: true, seg: 16, tube: 4 }); D.sph(0.24, '#ff4a3a', [0, 2.0, 0], 1, { glow: true, seg: 10 }); D.tor(2.4, 0.06, '#ff2a2a', [0, 0.28, 0], [HP, 0, 0], { glow: true, seg: 28, tube: 3 });
      const dish = D.bake('dish'); dish.add(struts); feeds.forEach(f => dish.add(f.g)); const dp = new THREE.Group(), tilt = new THREE.Group(); dp.position.y = 6.7 + MH + 0.25; root.add(dp); dp.add(yoke); tilt.position.y = 1.1; dp.add(tilt); tilt.add(dish);
      const S2 = baker(); for (let q = 0; q < 4; q++) { const a = q / 4 * TAU; S2.box(0.9, 0.06, 0.16, '#ff4a3a', [Math.cos(a) * 1.25, 0, Math.sin(a) * 1.25], [0, -a, 0], { glow: true }); } const spinner = S2.bake('spinner'); spinner.position.y = 1.4; dish.add(spinner);
      const em = new THREE.Object3D(); em.position.set(0, 2.0, 0); dish.add(em); const glowS = spark('#ff4a3a', 1.2); glowS.position.copy(em.position); dish.add(glowS);
      DSF_API.dish = dp; DSF_API.emitter = em; DSF_API.aim = null; let lanceT = 0, lanceDur = 0, spinV = 0.15;
      DSF_API.lance = (dur, charge = 0.57) => { lanceT = 0; lanceDur = dur; DSF_API._charge = charge; };
      const _w = new THREE.Vector3();
      anim.push((t, dt) => { const firing = lanceDur > 0; if (firing) { lanceT += dt; if (lanceT > lanceDur + 1.4) lanceDur = 0; }
        const ch = DSF_API._charge || 0.57, k = firing ? Math.min(1, lanceT / ch) : 0;
        spinV += ((firing ? 14 : 1.2) - spinV) * Math.min(1, dt * (firing ? 4 : 1.5)); spinner.rotation.y += dt * spinV;
        glowS.material.opacity = firing ? (lanceT < ch ? 0.4 + 0.6 * k : 0.95) : 0.35 + 0.15 * Math.sin(t * 2);
        { const hT = firing ? (lanceT < ch ? Math.min(1, lanceT / ch) : lanceT < lanceDur ? 1 : Math.max(0, 1 - (lanceT - lanceDur) / 1.2)) : 0; heatU.uH.value += (hT - heatU.uH.value) * Math.min(1, dt * (hT > heatU.uH.value ? 6 : 1.5)); }
        { const lead = 0.45, t0 = Math.max(0, ch - lead), on = firing && lanceT > t0 && lanceT < lanceDur + 0.3, grow = on ? Math.min(1, (lanceT - t0) / lead) : 0, fade = firing && lanceT >= lanceDur ? Math.max(0, 1 - (lanceT - lanceDur) / 0.25) : 1, o = on ? fade : 0;
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
          for (const f of feeds) { f.g.visible = o > 0.01; if (!f.g.visible) continue; f.mt.opacity = 0.95 * o; f.cm.opacity = o;
            _s.subVectors(f.p1, f.p0); const L = _s.length(), dir = _s.clone().normalize(), side = new THREE.Vector3().crossVectors(dir, UP).normalize(), up2 = new THREE.Vector3().crossVectors(side, dir);
            const reach = grow, jit = 0.24;
            for (let k = 0; k <= NS; k++) { const u = k / NS * reach; _p.copy(f.p0).addScaledVector(dir, L * u); if (k > 0 && k < NS) _p.addScaledVector(side, (Math.random() - 0.5) * jit * 2).addScaledVector(up2, (Math.random() - 0.5) * jit * 2); f.pts[k].copy(_p); }
            for (let k = 0; k < NS; k++) { const A = f.pts[k], Bp = f.pts[k + 1], d = A.distanceTo(Bp); _a.subVectors(Bp, A).normalize(); for (const [m, w] of [[f.segs[k], 0.075], [f.segs[NS + k], 0.026]]) { m.visible = d > 0.001; m.position.copy(A); m.quaternion.setFromUnitVectors(ZF, _a); m.scale.set(w * (0.7 + Math.random() * 0.6), w * (0.7 + Math.random() * 0.6), d); } }
            for (let k = 0; k < 2; k++) { const br = f.br[k], i0 = 2 + ((Math.random() * (NS - 3)) | 0), A = f.pts[Math.min(i0, Math.floor(NS * reach))]; _b.copy(A).addScaledVector(side, (Math.random() - 0.5) * 0.9).addScaledVector(up2, (Math.random() - 0.5) * 0.9).addScaledVector(dir, Math.random() * 0.3); const d = A.distanceTo(_b); _a.subVectors(_b, A).normalize(); br.visible = reach > 0.25 && Math.random() < 0.7; br.position.copy(A); br.quaternion.setFromUnitVectors(ZF, _a); br.scale.set(0.035, 0.035, d); }
            f.spark.position.copy(f.pts[NS]); f.spark.material.opacity = o * (0.7 + Math.random() * 0.3); f.spark.scale.setScalar(0.5 + Math.random() * 0.5 + (grow >= 1 ? 0.6 : 0)); } } glowS.scale.setScalar(firing ? 1.4 + k * 3 + Math.sin(t * 40) * 0.3 : 1.2);
        let yawT, pitchT;
        if (DSF_API.aim && (firing || DSF_API.track)) { dp.getWorldPosition(_w); const d = DSF_API.aim.clone().sub(_w); root.getWorldQuaternion(_q0).invert(); d.applyQuaternion(_q0); yawT = Math.atan2(d.x, d.z); const el = Math.atan2(d.y, Math.hypot(d.x, d.z)); pitchT = Math.PI / 2 - el; }
        else { yawT = dp.rotation.y + dt * 0.35; pitchT = 0.55; }
        let dy = yawT - dp.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); dp.rotation.y += dy * Math.min(1, dt * (firing ? 5 : 2));
        tilt.rotation.x += (pitchT - tilt.rotation.x) * Math.min(1, dt * (firing ? 5 : 1.5)); }); }
    if (L.hangar) { const sh = shuttle(H, acc, 1.0); root.add(sh); const X = Rw + TB + 9.6; const f = fly(sh, t => { const a = (t * 0.12) % 1 * TAU; return [X + 8 - 8 * Math.cos(a), -3.4 + Math.sin(2 * a) * 0.8, 10 * Math.sin(a)]; }); anim.push(t => f(t)); }
    // s389 DETAIL PASS (Ben: windows + the details a big frontier station has). Generic outpost details, our own shape.
    { const D2 = baker(), HB = baker(), WL = lights(), PL = mix(H, '#8a7f72', 0.35);
      if (L.windows) { // window bands: rows of lit portholes round the wheel's outer face + the hub saucer, some dark
        for (const [rr, yy, n2] of [[Rw + TB * 0.985, TB * TY * 0.42, low ? 48 : 84], [Rw + TB, 0, low ? 48 : 84], [Rw + TB * 0.985, -TB * TY * 0.42, low ? 48 : 84], [Rw - TB * 0.985, TB * TY * 0.3, low ? 30 : 56], [Rw - TB * 0.985, -TB * TY * 0.3, low ? 30 : 56]]) for (let i = 0; i < n2; i++) { if ((i * 7 + (yy > 0 ? 3 : 0)) % 5 === 0) continue; const a = i / n2 * TAU; D2.box(0.07, 0.62, 0.5, WIN, [Math.cos(a) * (rr + Math.sign(rr - Rw) * 0.04), yy, Math.sin(a) * (rr + Math.sign(rr - Rw) * 0.04)], [0, -a, 0], { glow: true }); if (i % 3 === 0) WL.add([Math.cos(a) * rr, yy, Math.sin(a) * rr], WIN, 0.55, (i % 11 === 0) ? 0.07 : 0, i); }
        for (const [rr, yy, n2] of [[5.75, 0.18, 40], [4.9, -0.55, 32], [2.65, 1.5, 18], [1.6, -3.2, 14]]) for (let i = 0; i < n2; i++) { if (i % 6 === 2) continue; const a = i / n2 * TAU + 0.1; HB.box(0.06, 0.32, 0.34, WIN, [Math.cos(a) * rr, yy, Math.sin(a) * rr], [0, -a, 0], { glow: true }); } }
      if (L.plating) { // raised hull panels + ribs on the wheel, a seam band on the hub
        for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + 0.13; D2.rbox(2.4, 0.18, 1.6, 0.08, i % 3 ? PL : HD, [Math.cos(a) * Rw, TB * TY * 0.985, Math.sin(a) * Rw], [0, -a, 0], { out: 0.02 }); D2.rbox(2.4, 0.18, 1.6, 0.08, i % 3 ? HD : PL, [Math.cos(a) * Rw, -TB * TY * 0.985, Math.sin(a) * Rw], [0, -a, 0], { out: 0.02 }); }
        for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; D2.tor(TB * 1.04, 0.12, GRAPH2, [Math.cos(a) * Rw, 0, Math.sin(a) * Rw], [0, -a, 0], { seg: 18, tube: 4, out: 0.02, s: [1, TY, 1] }); }
        HB.tor(4.2, 0.12, GRAPH2, [0, 0.95, 0], [HP, 0, 0], { seg: 40, tube: 4, out: 0.02 }); HB.tor(4.2, 0.12, GRAPH2, [0, -0.95, 0], [HP, 0, 0], { seg: 40, tube: 4, out: 0.02 }); }
      const ports = []; for (let i = 0; i < L.ports; i++) { const a = (i + 0.5) / L.ports * TAU, cx = Math.cos(a), sz = Math.sin(a); // airlock collars on the outer rim
        D2.cyl(0.7, 0.8, 1.2, HD, [cx * (Rw + TB + 0.4), 0, sz * (Rw + TB + 0.4)], [0, -a, HP], { seg: 12 }); D2.tor(0.72, 0.09, acc, [cx * (Rw + TB + 1.0), 0, sz * (Rw + TB + 1.0)], [0, -a + HP, 0], { seg: 14, tube: 4, out: 0.02 });
        WL.add([cx * (Rw + TB + 1.1), 0.95, sz * (Rw + 2.35)], i % 2 ? GREEN : RED, 0.7, 0.8, i); ports.push(a); }
      // s393 WEAPON PLATFORMS: armoured pads on the ring top + bottom (between the spokes) with sweeping twin-gun turrets, + 4 point-defence guns on the hub
      const turrets = [];
      if (L.weapons) { const TH = baker(); TH.cyl(0.62, 0.72, 0.36, HD, [0, 0.18, 0], 0, { seg: 14 }); TH.sph(0.55, H, [0, 0.36, 0], [1, 0.72, 1], { seg: 12, t1: Math.PI / 2 });
        for (const sd of [-1, 1]) { TH.cyl(0.07, 0.09, 1.5, GRAPH2, [sd * 0.2, 0.5, -0.85], [HP, 0, 0], { seg: 8, out: 0.025 }); TH.cyl(0.11, 0.11, 0.18, GRAPH, [sd * 0.2, 0.5, -0.25], [HP, 0, 0], { seg: 8, out: 0.02 }); TH.cyl(0.06, 0.06, 0.03, RED, [sd * 0.2, 0.5, -1.61], [HP, 0, 0], { glow: true, seg: 8 }); }
        TH.box(0.5, 0.06, 0.1, acc, [0, 0.62, 0.1], 0, { glow: true }); const head = TH.bake('turret');
        const yTop = TB * TY * 0.985, add = (x, y, z, flip, sc, ph) => { const g = head.clone(true); g.position.set(x, y, z); if (flip) g.rotation.x = Math.PI; g.scale.setScalar(sc); turrets.push({ g, ph, base: Math.atan2(x, z) }); return g; };
        for (let i = 0; i < L.turrets; i++) { const a = (i + 0.5) / Math.max(1, L.turrets) * TAU + 0.3, cx = Math.cos(a), sz = Math.sin(a), x = cx * Rw, z = sz * Rw;
          for (const fl of low ? [false] : [false, true]) { const y = fl ? -yTop : yTop; D2.cyl(1.0, 1.15, 0.22, PL, [x, y + (fl ? -0.11 : 0.11), z], 0, { seg: 16, out: 0.02 }); D2.tor(1.08, 0.06, acc, [x, y + (fl ? -0.23 : 0.23), z], [HP, 0, 0], { seg: 18, tube: 3, out: 0 });
            wheel.add(add(x, y + (fl ? -0.22 : 0.22), z, fl, 1, i * 1.7 + (fl ? 2 : 0))); WL.add([x + cx * 1.05, y + (fl ? -0.3 : 0.3), z + sz * 1.05], RED, 0.55, 0.5, i); } }
        for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + Math.PI / 4, x = Math.cos(a) * 4.9, z = Math.sin(a) * 4.9; root.add(add(x, 0.62, z, false, 0.62, k * 2.3)); if (!low) root.add(add(x, -0.62, z, true, 0.62, k * 2.3 + 1)); }
        DSF_API.turrets = turrets.map(q => q.g); anim.push(t => { for (const q of turrets) { if (DSF_API.aim) { const p = q.g.parent.worldToLocal(q.g.parent.localToWorld(q.g.position.clone()).add(DSF_API.aim)); q.g.rotation.y = Math.atan2(p.x - q.g.position.x, p.z - q.g.position.z) + Math.PI; } else q.g.rotation.y = q.base + Math.PI + Math.sin(t * 0.32 + q.ph) * 0.9; } }); }
      // s400 TORPEDO LAUNCHERS (Ben): 4 tall launcher towers on the hub saucer under the command ring, taller than the laser turrets.
      // Torpedoes + the speciality weapons leave from these. Each tower turns to the target, its tube rack lifts, and it kicks back on firing.
      const launchers = [];
      if (L.weapons) { const LB = baker(), LH = baker();
        LB.cyl(0.75, 0.95, 0.5, HD, [0, 0.25, 0], 0, { seg: 12 }); LB.cyl(0.44, 0.56, 1.0, H, [0, 0.95, 0], 0, { seg: 10 }); LB.tor(0.5, 0.07, acc, [0, 0.75, 0], [HP, 0, 0], { glow: true, seg: 14, tube: 3 }); LB.box(0.12, 0.6, 0.12, '#ffb340', [0, 0.95, 0.51], 0, { glow: true });
        LH.rbox(1.5, 0.9, 1.9, 0.2, HD, [0, 0, 0]); for (const [x, y] of [[-0.42, 0.2], [0.42, 0.2], [0, -0.22]]) { LH.cyl(0.21, 0.24, 2.2, GRAPH, [x, y, -0.55], [HP, 0, 0], { seg: 10, out: 0.025 }); LH.tor(0.22, 0.04, '#ff7a3a', [x, y, -1.66], 0, { glow: true, seg: 12, tube: 3 }); LH.cyl(0.15, 0.15, 0.03, '#ff7a3a', [x, y, -1.64], [HP, 0, 0], { glow: true, seg: 10 }); }
        LH.box(1.2, 0.08, 0.2, acc, [0, 0.47, 0.4], 0, { glow: true }); LH.rbox(0.5, 0.3, 0.6, 0.1, PL, [0, 0.6, 0.35]);
        const base = LB.bake('launcherBase'), head = LH.bake('launcherHead');
        for (let k = 0; k < 4; k++) { const a = k / 4 * TAU, r = 4.5, g = new THREE.Group(), pitch = new THREE.Group(), hd = head.clone(true), mz = new THREE.Object3D();
          g.add(base.clone(true)); pitch.position.y = 1.75; g.add(pitch); pitch.add(hd); mz.position.set(0, 0, -1.75); hd.add(mz); g.position.set(Math.cos(a) * r, 0.8, Math.sin(a) * r); root.add(g);
          launchers.push({ g, pitch, hd, mz, a, recoil: 0, base: -a + HP }); WL.add([Math.cos(a) * r, 2.3, Math.sin(a) * r], RED, 0.7, 0.6, k); }
        DSF_API.launchers = launchers.map(q => q.mz); DSF_API.launch = i => { const q = launchers[i]; if (q) q.recoil = 1; };
        const _lw = new THREE.Vector3(), _lq = new THREE.Quaternion();
        anim.push((t, dt) => { for (const q of launchers) { let yawT, pitchT;
          if (DSF_API.aim) { q.g.getWorldPosition(_lw); const d = DSF_API.aim.clone().sub(_lw); root.getWorldQuaternion(_lq).invert(); d.applyQuaternion(_lq); yawT = Math.atan2(-d.x, -d.z); pitchT = Math.max(-0.1, Math.min(0.9, Math.atan2(d.y, Math.hypot(d.x, d.z)) + 0.25)); }
          else { yawT = q.base + Math.sin(t * 0.25 + q.a) * 0.5; pitchT = 0.35; }
          let dy = yawT - q.g.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); q.g.rotation.y += dy * Math.min(1, dt * 2.5); q.pitch.rotation.x += (pitchT - q.pitch.rotation.x) * Math.min(1, dt * 2.5);
          q.recoil = Math.max(0, q.recoil - dt * 3); q.hd.position.z = q.recoil * 0.45; } }); }
      // s402 FINAL POLISH: a soft warm glow hugging the window bands, a slow light SWEEP that runs round the wheel (like sun catching the hull),
      // the deflector under the core breathes, and a slow red beacon on top of the mast
      { const glowRing = (r, y, c, w, o) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, w, 6, low ? 64 : 120), glowMat(c, o)); m.rotation.x = HP; m.position.y = y; return m; };
        const hug = glowRing(Rw + TB * 1.02, 0, '#ffd89a', TB * TY * 0.55, 0.06); hug.scale.z = TY; wheel.add(hug);
        const sweep = new THREE.Mesh(new THREE.TorusGeometry(Rw, TB * 1.06, 10, low ? 24 : 40, 0.55), glowMat('#cfe4ff', 0.14)); sweep.rotation.x = HP; sweep.scale.z = TY; root.add(sweep);
        const defl = spark('#ffb340', 6); defl.position.y = -7.6; root.add(defl);
        anim.push(t => { sweep.rotation.z = -t * 0.35; sweep.material.opacity = 0.1 + 0.05 * Math.sin(t * 0.7); hug.material.opacity = 0.05 + 0.02 * Math.sin(t * 1.3); defl.material.opacity = 0.45 + 0.25 * Math.sin(t * 1.6); defl.scale.setScalar(5.5 + Math.sin(t * 1.6) * 1.2); }); }
      // s393 POLISH: navigation strobes at the ring's four points (white double-blink), amber under-saucer lights, a soft blue halo round the whole station
      for (let k = 0; k < 4; k++) { const a = k * HP; WL.add([Math.cos(a) * (Rw + TB), TB * TY * 0.9, Math.sin(a) * (Rw + TB)], '#ffffff', 1.3, 0.55, k * 0.5); WL.add([Math.cos(a) * (Rw + TB), -TB * TY * 0.9, Math.sin(a) * (Rw + TB)], '#ffffff', 1.3, 0.55, k * 0.5 + 0.25); }
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; LT.add([Math.cos(a) * 4.3, -0.85, Math.sin(a) * 4.3], AMBER, 0.6, 0); }
      { const halo = spark('#7fb4ff', (Rw + TB) * 2.9); halo.material.opacity = 0.1; root.add(halo); anim.push(t => { halo.material.opacity = 0.08 + 0.03 * Math.sin(t * 0.6); }); }
      const det = D2.bake('dsfDetail'); wheel.add(det); const wp = WL.make(); if (wp) wheel.add(wp);
      if (L.chase) { const ring = []; for (let k = 0; k < 40; k++) { const a = k / 40 * TAU; ring.push([Math.cos(a) * (Rw + TB * 0.72), TB * TY * 0.72, Math.sin(a) * (Rw + TB * 0.72)]); } const ch = flow([ring], '#ffd23a', 5, 0.08, 1.0, true); wheel.add(ch);
        const ring2 = []; for (let k = 0; k < 24; k++) { const a = -k / 24 * TAU; ring2.push([Math.cos(a) * 5.95, 0.05, Math.sin(a) * 5.95]); } const ch2 = flow([ring2], acc, 3, 0.12, 0.9, true); root.add(ch2); anim.push(t => { ch.userData.flow(t); ch2.userData.flow(t); }); }
      if (L.docked && ports.length) { const cols = ['#e8ecf2', '#b9bec7', '#d9a866', '#7fd0d8'], n3 = Math.min(3, ports.length);
        for (let k = 0; k < n3; k++) { const a = ports[(k * 3) % ports.length], sh2 = shuttle(cols[k % 4], k === 0 ? acc : CYAN, 1.05, k === 1); sh2.position.set(Math.cos(a) * (Rw + TB + 2.7), 0, Math.sin(a) * (Rw + TB + 2.7)); sh2.rotation.y = -a + Math.PI; wheel.add(sh2); anim.push(t => sh2.userData.tick && sh2.userData.tick(t + k)); } }
      // a hub ops tower: windowed crown + antenna mast, and a lower deflector glow under the core
      HB.lathe([[0, 5.3], [1.1, 5.35], [1.25, 6.2], [0.95, 6.6], [0, 6.7]], H, [0, 0, 0], 0, { seg: 20 }); /* s390 COMMAND CENTRE windows (Ben): a ring of big slanted panes under the dish so Ops can see out */ /* s392 (Ben): the command ring under the dish comes out much further, bigger panes */ { const CR = L.cmdRing || 3.6; HB.lathe([[1.2, 4.0], [CR * 0.8, 4.05], [CR, 4.45], [CR * 1.04, 5.0], [CR * 0.86, 5.75], [1.2, 5.85]], HD, [0, 0, 0], 0, { seg: 32 }); HB.tor(CR * 1.04, 0.1, acc, [0, 5.0, 0], [HP, 0, 0], { seg: 40, tube: 4, out: 0.02 }); HB.tor(CR * 0.9, 0.07, WIN, [0, 4.1, 0], [HP, 0, 0], { glow: true, seg: 36, tube: 4 });
        const NP = 16; for (let i = 0; i < NP; i++) { const a2 = i / NP * TAU; HB.box(0.06, 0.62, CR * 0.3, WIN, [Math.cos(a2) * CR * 1.0, 4.72, Math.sin(a2) * CR * 1.0], [0, -a2, 0.12], { glow: true }); HB.box(0.06, 0.6, CR * 0.27, WIN, [Math.cos(a2) * CR * 0.95, 5.38, Math.sin(a2) * CR * 0.95], [0, -a2, -0.55], { glow: true }); if (i % 4 === 0) LT.add([Math.cos(a2) * CR * 1.1, 5.0, Math.sin(a2) * CR * 1.1], WIN, 1.0, 0); } } HB.cyl(0.06, 0.06, 2.2, GRAPH2, [0.5, 7.6, 0], 0, { seg: 4 }); LT.add([0.5, 8.8, 0], RED, 1.2, 0.9);
      HB.cyl(1.05, 1.05, 0.05, '#ffb340', [0, -7.45, 0], 0, { glow: true, seg: 20 }); LT.add([0, -7.9, 0], '#ffb340', 2.4, 0); root.add(HB.bake('dsfHub')); }
    anim.push((t, dt) => { wheel.rotation.y += dt * L.spin * 0.5; lifts.userData.flow(t); });
    return { root, LT, anim, hit: Rw + (L.tube || 2) + 3, api: DSF_API };
  }
  // ---------------------------------------------------------------- s380 NAV BUOY (the 2D deep buoys: one log line each)
  function buoy(L) {
    const B = baker(), anim = [], H = L.hull;
    B.lathe([[0, -2.6], [0.35, -2.4], [0.7, -1.4], [0.72, -0.6], [0.5, 0.2], [0.32, 1.4], [0.22, 2.1], [0, 2.2]], H, [0, 0, 0], 0, { seg: 16 });
    B.tor(1.35, 0.11, L.accent, [0, -0.5, 0], [HP, 0, 0], { seg: 28, tube: 5, out: 0.03 });
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU, b = a + 1; B.tube([[Math.cos(a) * 0.6, -0.5, Math.sin(a) * 0.6], [Math.cos(a) * 1.35, -0.5, Math.sin(a) * 1.35]], 0.06, GRAPH2, { rseg: 4, caps: false });
      B.rbox(0.1, 1.2, 0.7, 0.04, GRAPH2, [Math.cos(b) * 0.72, -1.9, Math.sin(b) * 0.72], [0, -b, 0]); }
    B.cyl(0.26, 0.3, 0.2, GRAPH, [0, 2.2, 0], 0, { seg: 10 });
    const root = new THREE.Group(); root.add(B.bake('buoy'));
    const lampM = new THREE.MeshBasicMaterial({ color: '#8a909c', toneMapped: false }), lamp = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8), lampM); lamp.position.y = 2.6; root.add(lamp);
    const halo = spark('#ffffff', 2.4); halo.position.y = 2.6; root.add(halo); const rp = ripple(1, L.lamp); rp.position.y = -0.5; root.add(rp);
    let lit = !!L.lit, litC = new THREE.Color(L.lamp);
    anim.push(t => { const k = lit ? 0.7 + 0.3 * Math.sin(t * 3) : (Math.sin(t * 1.3) > 0.85 ? 0.7 : 0.14); if (lit) lampM.color.copy(litC); else lampM.color.set('#8a909c'); halo.material.color.copy(lit ? litC : lampM.color); halo.material.opacity = k; halo.scale.setScalar(lit ? 5 : 2.4);
      const u = (t * 0.45) % 1; rp.scale.setScalar(1 + u * (lit ? 9 : 4)); rp.material.opacity = (lit ? 0.55 : 0.18) * (1 - u); });
    return { root, anim, hit: 2.2, api: { setLit(b) { lit = !!b; } } };
  }
  // ---------------------------------------------------------------- s380 SALVAGE WRECK / DERELICT (2D drawWreck: a snapped spine, ribs, a torn bell, no livery)
  function wreck(L) {
    const B = baker(), LT = lights(), anim = [], len = L.length, Hc = L.hull, HD = shade(L.hull, 0.62), live = !!L.live;
    const aL = len * 0.56, bL = len * 0.3, ax = -len * 0.24, bx = len * 0.36, g0 = ax + aL / 2, g1 = bx - bL / 2, gm = (g0 + g1) / 2;
    B.rbox(aL, 2.0, 2.8, 0.45, Hc, [ax, 0, 0], [0.1, 0, 0.06]); B.rbox(aL * 0.7, 0.8, 1.6, 0.3, HD, [ax - len * 0.04, 1.25, 0], [0.1, 0, 0.06]);
    B.lathe([[1.35, 0], [1.1, 1.2], [0.5, 2.4], [0, 2.6]], Hc, [ax - aL / 2 + 0.1, 0, 0], [0, 0, HP], { seg: 10, flat: true });
    B.rbox(bL, 1.7, 2.5, 0.4, Hc, [bx, -0.3, 0.4], [-0.25, 0.32, -0.18]);
    for (let k = 0; k < 3; k++) { const x = g0 + (g1 - g0) * (k + 0.5) / 3; B.tor(1.3 - k * 0.08, 0.1, GRAPH2, [x, -0.05 * k, 0.1 * k], [0, HP, 0.1 * k], { arc: Math.PI * (1.4 - k * 0.2), a0: -0.3 + k * 0.4, seg: 14, tube: 4, out: 0.025 }); }
    for (const [y, z] of [[1.05, 0.6], [0.6, -1.1], [-0.8, 1.0]]) B.tube([[g0 - 0.3, y, z], [gm, y * 0.9 + 0.1, z * 1.15], [g1 + 0.2, y * 0.8 - 0.2, z * 1.3 + 0.3]], 0.07, GRAPH2, { rseg: 4, caps: false });
    for (let k = 0; k < 4; k++) B.box(0.9 + k * 0.2, 0.05, 0.7, '#14161b', [ax - aL * 0.35 + k * aL * 0.22, 1.04 + k * 0.012, (k % 2 ? 0.5 : -0.4)], [0.1, k * 0.4, 0.06], { out: 0 });
    const bell = [bx + bL / 2 + 2.2, -1.1, -1.9]; B.lathe([[0.5, 0], [0.8, 0.3], [1.2, 1.2], [1.45, 1.8], [1.5, 1.9]], HD, bell, [0.4, 0.9, -HP - 0.5], { seg: 14 });
    B.tube([[bx + bL / 2 - 0.3, -0.5, 0.2], [bx + bL / 2 + 1, -0.9, -0.8], bell], 0.09, GRAPH2, { rseg: 4 });
    if (live) { B.sph(0.9, L.glow, [gm, 0, 0], [1.4, 0.9, 1.1], { glow: true, seg: 12 }); for (let k = 0; k < 5; k++) LT.add([ax - aL * 0.4 + k * aL * 0.2, 0.2, 1.42], L.glow, 0.7, 0.3, k); }
    const root = new THREE.Group(), hull = B.bake('wreck'); root.add(hull);
    let shards = null; if (L.shards) { const S = baker(); for (let k = 0; k < L.shards; k++) { const a = rnd() * TAU, r = len * 0.42 + rnd() * len * 0.45; S.add(new THREE.DodecahedronGeometry(0.35 + rnd() * 0.7, 0), shade(Hc, 0.75 + rnd() * 0.35), mat4([Math.cos(a) * r, (rnd() - 0.5) * 1.6, Math.sin(a) * r], [rnd() * 3, rnd() * 3, 0]), { flat: true, out: 0.04 }); } shards = S.bake('shards'); root.add(shards); }
    let sp = null; if (live) { sp = spark(L.glow, len * 1.1); sp.position.set(gm, 0.4, 0); root.add(sp); }
    anim.push((t, dt) => { hull.rotation.y += dt * 0.05; if (shards) shards.rotation.y -= dt * 0.08; if (sp) { const k = 0.5 + 0.5 * Math.sin(t * TAU / 2.1); sp.material.opacity = 0.3 + 0.55 * k; sp.scale.setScalar(len * (1 + 0.25 * k)); } });
    return { root, LT, anim, hit: len * 0.5 };
  }

  // ---------------------------------------------------------------- s381 VOID MOTH (Ben: giant ship-sized moths, lasers + an energy pulse)
  function voidMoth(L) {
    const B = baker(), LT = lights(), anim = [], BD = L.body, W1 = L.wing, G = L.glow, E = L.eyes, FUR = mix(BD, '#ffffff', 0.18);
    B.cap(0.78, 1.9, BD, [0, 0, -0.25], [HP, 0, 0], { seg: 14 });
    B.lathe([[0, 0], [0.72, 0.2], [0.88, 0.9], [0.78, 1.8], [0.52, 2.7], [0.22, 3.3], [0, 3.4]], BD, [0, 0, 0.85], [HP, 0, 0], { seg: 16 });
    for (let k = 0; k < 4; k++) B.tor([0.8, 0.84, 0.72, 0.5][k], 0.06, G, [0, 0, 1.25 + k * 0.58], 0, { glow: true, seg: 18, tube: 4 });
    B.tor(0.8, 0.24, FUR, [0, 0.02, -1.05], 0, { seg: 16, tube: 6 }); B.sph(0.64, BD, [0, 0.05, -1.75], [1, 0.9, 1]);
    const eyes = []; for (const s of [-1, 1]) { const p = [s * 0.42, 0.14, -2.05]; B.sph(0.36, E, p, 1, { glow: true, seg: 12 }); LT.add([s * 0.5, 0.18, -2.3], E, 1.6, 0); eyes.push([s * 0.5, 0.18, -2.4]);
      const pts = [[s * 0.25, 0.45, -2.1], [s * 0.8, 1.15, -3.0], [s * 1.6, 1.35, -3.8], [s * 2.3, 1.05, -4.25]]; B.tube(pts, 0.05, BD, { rseg: 4 });
      for (let k = 1; k < 4; k++) { const q = pts[k]; B.tube([q, [q[0] + s * 0.35, q[1] + 0.25, q[2] + 0.2]], 0.025, FUR, { rseg: 3, caps: false }); B.tube([q, [q[0] - s * 0.1, q[1] + 0.3, q[2] - 0.15]], 0.025, FUR, { rseg: 3, caps: false }); }
      LT.add(pts[3], G, 1.2, 0.5, s); }
    const root = new THREE.Group(); root.add(B.bake('mothBody'));
    const wing = (s, fore) => { const W = baker(), k = L.span, pts = fore ? [[0, 0.4], [2.5, 1.7], [5.5, 2.0], [7.2, 1.0], [7.3, -0.3], [6.6, -1.3], [4.0, -2.2], [1.2, -1.4], [0, -0.5]] : [[0, -0.2], [2.8, -0.6], [4.6, -2.0], [4.5, -3.2], [3.9, -3.8], [2.2, -3.9], [0.6, -2.4], [0, -1.0]];
      const P = pts.map(([x, y]) => [s * x * k, y]), sh = new THREE.Shape(); P.forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y)); sh.closePath(); W.ext(sh, 0.08, W1, [0, 0, 0], [-HP, 0, 0], { bev: 0.03, out: 0.03 });
      W.tube(P.slice(1, -1).map(([x, y]) => [x, 0.09, -y]), 0.05, G, { glow: true, rseg: 3, caps: false });
      const ex = s * (fore ? 4.4 : 2.7) * k, ez = fore ? -0.2 : 2.6, rr = fore ? 1.0 : 0.75; W.cyl(rr, rr, 0.03, G, [ex, 0.09, ez], 0, { glow: true, seg: 18 }); W.cyl(rr * 0.6, rr * 0.6, 0.03, BD, [ex, 0.11, ez], 0, { seg: 16, out: 0 }); W.cyl(rr * 0.22, rr * 0.22, 0.03, E, [ex, 0.13, ez], 0, { glow: true, seg: 10 });
      for (const [vx, vz] of fore ? [[5.8, -1.4], [6.4, 0.6], [3.2, -1.8]] : [[3.8, 3.0], [2.0, 3.4]]) W.tube([[s * 0.4, 0.09, fore ? 0 : 0.6], [s * vx * k * 0.6, 0.095, vz * 0.6], [s * vx * k, 0.09, vz]], 0.03, mix(W1, G, 0.4), { rseg: 3, caps: false });
      const piv = new THREE.Group(); piv.add(W.bake('wing')); return piv; };
    const wings = []; for (const s of [-1, 1]) for (const fore of [true, false]) { const p = wing(s, fore); p.position.set(s * 0.55, 0.15, fore ? -0.9 : -0.2); root.add(p); wings.push({ p, s, fore }); }
    const aura = spark(G, 16); aura.material.opacity = 0.25; aura.position.y = -0.3; root.add(aura);
    const st = { rate: 1, amp: 1, lift: 0.15, glow: L.charge ? 1 : 0.25, weak: false }; let ph = 0;
    anim.push((t, dt) => { ph += dt * 7 * L.flap * st.rate; for (const w of wings) { const a = Math.sin(ph - (w.fore ? 0 : 0.5)) * 0.55 * st.amp + st.lift; w.p.rotation.z = w.s * a; w.p.rotation.y = -w.s * (w.fore ? 0.05 : -0.1) * Math.cos(ph); }
      const gk = L.charge ? 0.6 + 0.4 * Math.sin(t * 12) : st.glow; aura.material.opacity = gk * 0.85; aura.scale.setScalar(12 + gk * 14); aura.material.color.set(st.weak ? '#ffd23a' : G); });
    return { root, LT, anim, hit: 5, api: { eyes, set(o) { Object.assign(st, o); } } };
  }

  // ---------------------------------------------------------------- s382 THE MACHINE YARD (2D MACHINE_BERTH off Meru; story: hacked, not evil)
  function machineYard(L) {
    const B = baker(), LT = lights(), anim = [], H = L.hull, HD = mix(H, GRAPH, 0.55), Rr = L.ring, WH = '#ffffff';
    const gm = new THREE.MeshBasicMaterial({ vertexColors: true, color: L.hack, toneMapped: false }); B.glowMat = gm;
    B.lathe([[0, -6], [2.2, -5.6], [3.2, -3.5], [3.4, -0.5], [4.6, 0], [4.6, 0.8], [3.1, 1.4], [2.6, 4.5], [1.8, 6.6], [2.2, 7], [0, 7.2]], H, [0, 0, 0], 0, { seg: 8, flat: true, out: 0.08 });
    for (const y of [-3, 0.4, 3.5, 6]) B.tor(y === 0.4 ? 4.62 : y > 3 ? 2.3 : 3.42, 0.12, WH, [0, y, 0], [HP, 0, 0], { glow: true, seg: 24, tube: 4 });
    B.box(0.5, 0.2, 3.2, WH, [-0.8, 7.35, 0], 0, { glow: true }); B.box(1.9, 0.2, 0.5, WH, [0.15, 7.35, -1.35], 0, { glow: true }); B.box(1.4, 0.2, 0.5, WH, [-0.1, 7.35, 0], 0, { glow: true });
    B.tor(Rr, 0.9, H, [0, 0, 0], [HP, 0, 0], { arc: TAU * 0.8, seg: 48, tube: 10 }); B.tor(Rr, 0.14, WH, [0, 0.9, 0], [HP, 0, 0], { glow: true, arc: TAU * 0.8, seg: 48, tube: 4 });
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU * 0.8 + 0.3; B.tube([[Math.cos(a) * 4.4, 0.4, -Math.sin(a) * 4.4], [Math.cos(a) * (Rr - 0.8), 0, -Math.sin(a) * (Rr - 0.8)]], 0.28, HD, { rseg: 6 }); LT.add([Math.cos(a) * Rr, 1.1, -Math.sin(a) * Rr], L.hack, 1.2, 0.5, i); }
    const cx = Rr * 0.55, cz = Rr * 0.55; B.rbox(5.4, 0.5, 3.4, 0.2, HD, [cx, -1.6, cz], [0, -0.785, 0]);
    const arms = []; for (let i = 0; i < 3; i++) { const a = i / 3 * TAU, base = [Math.cos(a) * 3.6, 1 + i * 0.6, Math.sin(a) * 3.6], mid = [lerpA(base[0], cx, 0.5), 4 + i, lerpA(base[2], cz, 0.5)], tip = [cx + Math.cos(a) * 1.6, 0.6, cz + Math.sin(a) * 1.6];
      B.tube([base, mid, tip], 0.2, GRAPH2, { rseg: 6 }); B.sph(0.35, WH, tip, 1, { glow: true, seg: 8 }); arms.push([base, mid, tip]); LT.add(tip, L.hack, 1.4, 2.5, i); }
    const root = new THREE.Group(); root.add(B.bake('machineYard'));
    const chip = baker(); chip.glowMat = gm; chip.tor(Rr, 0.9, H, [0, 0, 0], [HP, 0, 0], { arc: TAU * 0.09, seg: 8, tube: 10 }); chip.tor(Rr, 0.14, WH, [0, 0.9, 0], [HP, 0, 0], { glow: true, arc: TAU * 0.09, seg: 8, tube: 4 }); const piece = chip.bake('snapped'); piece.rotation.y = -TAU * 0.86; root.add(piece);
    if (L.build) { const mm = machScout({ ...defaults('machScout') }), pp = mm.pts || (mm.LT && mm.LT.make()); if (pp) mm.root.add(pp); mm.root.position.set(cx, -0.6, cz); mm.root.rotation.y = 0.785; mm.root.scale.setScalar(1.05); root.add(mm.root); anim.push(...(mm.anim || [])); }
    const fl = flow(arms, L.hack, 4, 0.5, 0.8); root.add(fl);
    const hc = new THREE.Color(L.hack), rc = new THREE.Color(L.real); let freed = L.freed, flick = 0;
    anim.push((t, dt) => { fl.userData.flow(t); piece.position.set(Math.sin(t * 0.2) * 1.2 + 1.5, Math.sin(t * 0.33) * 0.6, Math.cos(t * 0.17) * 1.1 - 1); piece.rotation.z = Math.sin(t * 0.25) * 0.15;
      if (flick > 0) flick -= dt; else if (Math.random() < dt * (0.25 + freed * 1.5)) flick = 0.08 + Math.random() * 0.2;
      gm.color.copy(hc).lerp(rc, freed >= 1 ? 1 : flick > 0 ? 0.9 : freed * 0.5); });
    return { root, LT, anim, hit: Rr + 2, api: { setFreed(k) { freed = k; } } };
  }
  // ---------------------------------------------------------------- s385 KUFA STATION (outside of worlds/dsf-kufa.js: garden dome, ring, catwalks, pods)
  function kufaStation(L) {
    const B = baker(), LT = lights(), anim = [], CU = L.copper, CUD = shade(L.copper, 0.6), H = L.hull, Rd = L.dome, Rr = Rd + 4.5, PD = L.pods;
    // garden deck under the dome + the ring deck round it
    B.lathe([[0, -2.2], [Rd + 0.8, -1.6], [Rd + 1.2, -0.4], [Rd + 0.9, 0], [0, 0]], H, [0, 0, 0], 0, { seg: 36 });
    B.cyl(Rd - 0.2, Rd - 0.2, 0.16, L.garden, [0, 0.08, 0], 0, { seg: 32, out: 0 });
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4; B.rbox(1.8, 0.35, 1.0, 0.12, '#6b4a2e', [Math.cos(a) * Rd * 0.55, 0.3, Math.sin(a) * Rd * 0.55], [0, -a, 0], { out: 0.02 }); }
    for (const [x, z] of [[-Rd * 0.3, Rd * 0.15], [Rd * 0.32, -Rd * 0.2]]) { B.cyl(0.14, 0.18, 1.6, '#6b4a2e', [x, 0.9, z], 0, { seg: 6 }); B.sph(1.2, '#c88a3a', [x, 2.2, z], [1, 0.8, 1], { seg: 10 }); }
    B.cyl(1.3, 1.3, 0.06, '#3a8fd0', [0, 0.2, -Rd * 0.45], 0, { seg: 20, glow: true });
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; const pts = []; for (let k = 0; k <= 8; k++) { const u = k / 8 * HP; pts.push([Math.cos(a) * Math.cos(u) * Rd, Math.sin(u) * Rd * 0.85 + 0.1, Math.sin(a) * Math.cos(u) * Rd]); } B.tube(pts, 0.1, CU, { rseg: 5, caps: false }); }
    B.tor(Rd, 0.16, CU, [0, 0.15, 0], [HP, 0, 0], { seg: 40, tube: 5 }); B.sph(0.45, CU, [0, Rd * 0.85 + 0.15, 0], 1, { seg: 10 });
    B.lathe([[Rr - 2, -0.5], [Rr + 1.6, -0.5], [Rr + 1.8, 0], [Rr - 2, 0]], H, [0, 0, 0], 0, { seg: 48 }); B.tor(Rr + 1.6, 0.08, CU, [0, 0.55, 0], [HP, 0, 0], { seg: 48, tube: 4 });
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; B.cyl(0.05, 0.05, 0.55, CU, [Math.cos(a) * (Rr + 1.6), 0.28, Math.sin(a) * (Rr + 1.6)], 0, { seg: 4, out: 0 }); if (i % 2 === 0) { B.cyl(0.08, 0.08, 1.4, CUD, [Math.cos(a) * (Rr + 1.4), 0.7, Math.sin(a) * (Rr + 1.4)], 0, { seg: 5 }); LT.add([Math.cos(a) * (Rr + 1.4), 1.5, Math.sin(a) * (Rr + 1.4)], AMBER, 0.9, 0); } }
    // catwalks (2D dsfSpoke0/90/180/270) + the pods (dsf-kufa.js KU.pods: th / dist)
    for (let i = 0; i < 4; i++) { const a = i * HP, cx = Math.cos(a), sz = Math.sin(a); B.box(PD - Rr - 2, 0.12, 1.4, H, [cx * (Rr + 1.8 + (PD - Rr - 2) / 2), -0.3, sz * (Rr + 1.8 + (PD - Rr - 2) / 2)], [0, -a, 0], { out: 0.03 });
      for (const sd of [-1, 1]) B.tube([[cx * (Rr + 1.8) - sz * sd * 0.7, 0.3, sz * (Rr + 1.8) + cx * sd * 0.7], [cx * (PD - 3) - sz * sd * 0.7, 0.3, sz * (PD - 3) + cx * sd * 0.7]], 0.05, CU, { rseg: 3, caps: false }); }
    const PODS = [[0, 'imex'], [90, 'crew'], [180, 'charts'], [270, 'relics'], [45, 'ops'], [225, 'berth']];
    for (const [th, k] of PODS) { const a = -th * Math.PI / 180 + Math.PI / 2, cx = Math.cos(a), sz = Math.sin(a), dist = k === 'ops' ? PD + 4 : k === 'berth' ? PD : PD + 1, big = k === 'ops';
      if (th % 90) B.box(dist - Rr - 3, 0.12, 1.2, H, [cx * (Rr + 1.5 + (dist - Rr - 3) / 2), -0.3, sz * (Rr + 1.5 + (dist - Rr - 3) / 2)], [0, -a, 0], { out: 0.03 });
      if (k === 'berth') { B.tor(2.4, 0.4, H, [cx * dist, 0, sz * dist], [HP, 0, 0], { seg: 24, tube: 6 }); B.tor(2.4, 0.1, CYAN, [cx * dist, 0.42, sz * dist], [HP, 0, 0], { glow: true, seg: 24, tube: 4 }); LT.add([cx * dist, 0.6, sz * dist], GREEN, 1.4, 0.6); continue; }
      B.rbox(big ? 6 : 5, big ? 3.2 : 2.6, big ? 5 : 4, 0.8, H, [cx * dist, 0.6, sz * dist], [0, -a, 0]); B.lathe([[0, 0], [1.6, 0], [1.4, 0.7], [0, 1]], CU, [cx * dist, 1.9 + (big ? 0.3 : 0), sz * dist], 0, { seg: 14, flat: true });
      B.box(big ? 6.05 : 5.05, 0.3, big ? 5.05 : 4.05, CU, [cx * dist, 0.1, sz * dist], [0, -a, 0], { out: 0.02 });
      for (let p = -1; p <= 1; p++) LT.add([cx * (dist - (big ? 2.6 : 2.1)) - sz * p * 1.3, 0.9, sz * (dist - (big ? 2.6 : 2.1)) + cx * p * 1.3], WIN, 0.7, 0); }
    // underside: the copper keel + docking lights
    B.cyl(1.4, 0.3, 4, CUD, [0, -3.8, 0], 0, { seg: 10 }); LT.add([0, -5.9, 0], AMBER, 1.6, 0.5);
    const root = new THREE.Group(); root.add(B.bake('kufaStation'));
    // the glass dome itself (one transparent shell over the garden)
    const dome = new THREE.Mesh(new THREE.SphereGeometry(Rd, SEG(28), SEG(14), 0, TAU, 0, HP), new THREE.MeshBasicMaterial({ color: L.glass, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); dome.scale.y = 0.85; dome.position.y = 0.1; root.add(dome);
    if (L.vole) { const v = shuttle('#e8ecf2', '#ffd23a', 1.5, true), a = -225 * Math.PI / 180 + Math.PI / 2; v.position.set(Math.cos(a) * (PD + 3.2), 0.3, Math.sin(a) * (PD + 3.2)); v.rotation.y = -a + Math.PI; root.add(v); anim.push(t => v.userData.tick && v.userData.tick(t)); }
    const sp = shuttle(H, CU, 0.9); root.add(sp); const f = fly(sp, t => { const a = t * 0.15; return [Math.cos(a) * (PD + 9), 2 + Math.sin(t * 0.4), Math.sin(a) * (PD + 9)]; }); anim.push(t => f(t));
    anim.push(t => { dome.material.opacity = 0.13 + 0.04 * Math.sin(t * 0.8); });
    // s403 (Ben: "apply what we learned on DSF to Kufa Station"): windows, plating, running lights, docked traffic, polish + WEAPONS. Kufa's own speciality = FLAK.
    const API = { turrets: [], launchers: [], aim: null }, D2 = baker(), WL = lights(), PODS2 = [[0, 'imex'], [90, 'crew'], [180, 'charts'], [270, 'relics'], [45, 'ops']];
    const podAt = (th, k) => { const a = -th * Math.PI / 180 + Math.PI / 2, dist = k === 'ops' ? PD + 4 : PD + 1; return { a, dist, cx: Math.cos(a), sz: Math.sin(a), big: k === 'ops' }; };
    if (L.windows) { // big lit windows round each pod (front + sides), a porthole band round the ring deck edge, light leaking from the dome base
      for (const [th, k] of PODS2) { const P = podAt(th, k), w = P.big ? 6 : 5, d = P.big ? 5 : 4, h = P.big ? 3.2 : 2.6, rot = [0, -P.a, 0];
        for (let i = -2; i <= 2; i++) for (const side of [-1, 1]) { const ax = i * (w / 6), lz = side * (d / 2 + 0.03), x = P.cx * (P.dist + ax) - P.sz * lz, z = P.sz * (P.dist + ax) + P.cx * lz; D2.box(0.42, 0.6, 0.04, WIN, [x, 0.9, z], rot, { glow: true }); }
        for (let i = -1; i <= 1; i++) { const x = P.cx * (P.dist + d / 2 + 0.03) - P.sz * i * (w / 4), z = P.sz * (P.dist + d / 2 + 0.03) + P.cx * i * (w / 4); D2.box(0.04, 0.7, 0.9, WIN, [x, 0.9, z], rot, { glow: true }); if (i === 0) WL.add([x, 1.0, z], WIN, 0.9, 0); } }
      for (let i = 0; i < (low ? 40 : 72); i++) { if (i % 7 === 3) continue; const a = i / (low ? 40 : 72) * TAU, r = Rr + 1.82; D2.box(0.05, 0.22, 0.4, WIN, [Math.cos(a) * r, -0.25, Math.sin(a) * r], [0, -a, 0], { glow: true }); }
      for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; D2.box(0.05, 0.3, 0.55, WIN, [Math.cos(a) * (Rd + 1.22), -0.9, Math.sin(a) * (Rd + 1.22)], [0, -a, 0.35], { glow: true }); } }
    if (L.plating) { for (let i = 0; i < 16; i++) { const a = (i + 0.5) / 16 * TAU, r = Rr - 0.2; D2.rbox(2.2, 0.12, 1.4, 0.06, i % 2 ? CUD : shade(CU, 0.85), [Math.cos(a) * r, -0.52, Math.sin(a) * r], [0, -a, 0], { out: 0.015 }); }
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; D2.tube([[Math.cos(a) * 1.4, -2, Math.sin(a) * 1.4], [Math.cos(a) * (Rd + 0.9), -1.4, Math.sin(a) * (Rd + 0.9)]], 0.12, CUD, { rseg: 4, caps: false }); } }
    // weapons: twin-gun turrets on the ring deck between the catwalks, + 2 FLAK launchers on the ops pod roof (taller)
    if (L.weapons) { const TH = baker(); TH.cyl(0.55, 0.65, 0.3, CUD, [0, 0.15, 0], 0, { seg: 12 }); TH.sph(0.5, H, [0, 0.3, 0], [1, 0.72, 1], { seg: 12, t1: HP });
      for (const sd of [-1, 1]) { TH.cyl(0.06, 0.08, 1.3, GRAPH2, [sd * 0.18, 0.44, -0.75], [HP, 0, 0], { seg: 8, out: 0.02 }); TH.cyl(0.05, 0.05, 0.03, RED, [sd * 0.18, 0.44, -1.41], [HP, 0, 0], { glow: true, seg: 8 }); }
      TH.box(0.45, 0.05, 0.1, CU, [0, 0.55, 0.1], 0, { glow: true }); const head = TH.bake('kTurret'); const tur = [];
      for (let i = 0; i < L.turrets; i++) { const a = (i + 0.5) / Math.max(1, L.turrets) * TAU + Math.PI / 4 * 0, r = Rr + 0.6, x = Math.cos(a) * r, z = Math.sin(a) * r; D2.cyl(0.85, 0.95, 0.18, CUD, [x, 0.09, z], 0, { seg: 14, out: 0.015 }); const g = head.clone(true); g.position.set(x, 0.18, z); root.add(g); tur.push({ g, ph: i * 1.3, base: Math.atan2(x, z) }); WL.add([x, 0.9, z], RED, 0.5, 0.5, i); }
      const LB = baker(), LH = baker(); LB.cyl(0.6, 0.75, 0.35, CUD, [0, 0.18, 0], 0, { seg: 12 }); LB.cyl(0.36, 0.46, 0.9, H, [0, 0.8, 0], 0, { seg: 10 }); LB.tor(0.42, 0.06, CU, [0, 0.62, 0], [HP, 0, 0], { glow: true, seg: 14, tube: 3 });
      LH.rbox(1.3, 0.8, 1.6, 0.2, CUD, [0, 0, 0]); for (const [x, y] of [[-0.36, 0.18], [0.36, 0.18], [0, -0.18]]) { LH.cyl(0.18, 0.2, 1.9, GRAPH, [x, y, -0.5], [HP, 0, 0], { seg: 10, out: 0.02 }); LH.tor(0.19, 0.035, '#ffcf7a', [x, y, -1.45], 0, { glow: true, seg: 12, tube: 3 }); }
      const lb = LB.bake('kLB'), lh = LH.bake('kLH'), OP = podAt(45, 'ops'), lau = [];
      for (const sd of [-1, 1]) { const g = new THREE.Group(), pit = new THREE.Group(), hd = lh.clone(true), mz = new THREE.Object3D(); g.add(lb.clone(true)); pit.position.y = 1.45; g.add(pit); pit.add(hd); mz.position.set(0, 0, -1.5); hd.add(mz);
        g.position.set(OP.cx * OP.dist - OP.sz * sd * 1.6, 1.9 + 0.3, OP.sz * OP.dist + OP.cx * sd * 1.6); root.add(g); lau.push({ g, pit, hd, mz, recoil: 0, base: -OP.a + HP }); }
      API.turrets = tur.map(q => q.g); API.launchers = lau.map(q => q.mz); API.launch = i => { if (lau[i]) lau[i].recoil = 1; };
      const _w = new THREE.Vector3(), _q = new THREE.Quaternion();
      anim.push((t, dt) => { for (const q of tur) { if (API.aim) { q.g.getWorldPosition(_w); const d = API.aim.clone().sub(_w); root.getWorldQuaternion(_q).invert(); d.applyQuaternion(_q); q.g.rotation.y = Math.atan2(d.x, d.z) + Math.PI; } else q.g.rotation.y = q.base + Math.PI + Math.sin(t * 0.3 + q.ph) * 0.9; }
        for (const q of lau) { let yawT = q.base + Math.sin(t * 0.25) * 0.4, pitT = 0.3; if (API.aim) { q.g.getWorldPosition(_w); const d = API.aim.clone().sub(_w); root.getWorldQuaternion(_q).invert(); d.applyQuaternion(_q); yawT = Math.atan2(-d.x, -d.z); pitT = Math.max(-0.1, Math.min(0.9, Math.atan2(d.y, Math.hypot(d.x, d.z)) + 0.25)); }
          let dy = yawT - q.g.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); q.g.rotation.y += dy * Math.min(1, dt * 2.5); q.pit.rotation.x += (pitT - q.pit.rotation.x) * Math.min(1, dt * 2.5); q.recoil = Math.max(0, q.recoil - dt * 3); q.hd.position.z = q.recoil * 0.4; } }); }
    // polish: nav strobes on the 4 outer pods, chasing copper lights round the ring rail, a warm halo, a slow light sweep over the dome, the keel light breathes
    for (const [th, k] of PODS2.slice(0, 4)) { const P = podAt(th, k); WL.add([P.cx * (P.dist + 2.6), 2.2, P.sz * (P.dist + 2.6)], '#ffffff', 1.2, 0.55, th / 90 * 0.25); }
    root.add(D2.bake('kufaDetail')); const wl = WL.make(); if (wl) root.add(wl);
    if (L.chase) { const rr = []; for (let k = 0; k < 40; k++) { const a = k / 40 * TAU; rr.push([Math.cos(a) * (Rr + 1.6), 0.62, Math.sin(a) * (Rr + 1.6)]); } const ch = flow([rr], '#ffcf7a', 6, 0.07, 0.9, true); root.add(ch); anim.push(t => ch.userData.flow(t)); }
    { const halo = spark('#ffb070', (PD + 6) * 2.4); halo.material.opacity = 0.08; root.add(halo); const sw = new THREE.Mesh(new THREE.SphereGeometry(Rd * 1.01, 20, 10, 0, 0.7, 0, HP), glowMat('#ffffff', 0.08)); sw.scale.y = 0.85; sw.position.y = 0.1; root.add(sw);
      anim.push(t => { halo.material.opacity = 0.06 + 0.025 * Math.sin(t * 0.6); sw.rotation.y = -t * 0.4; sw.material.opacity = 0.06 + 0.04 * Math.sin(t * 0.9); }); }
    { const KL = lights(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; KL.add([Math.cos(a) * (Rr - 0.5), -0.75, Math.sin(a) * (Rr - 0.5)], AMBER, 0.5, 0); } const kp = KL.make(); if (kp) root.add(kp);   // s407 polish
      const keel = spark(CU, 3.6); keel.position.y = -6.1; root.add(keel); const pat = shuttle(H, CU, 0.75), pr = PD + 12; root.add(pat); const fp = fly(pat, t => { const a = -t * 0.12 + 2; return [Math.cos(a) * pr, 3 + Math.sin(t * 0.4) * 1.5, Math.sin(a) * pr]; });
      anim.push(t => { keel.material.opacity = 0.4 + 0.25 * Math.sin(t * 1.5); keel.scale.setScalar(3.2 + Math.sin(t * 1.5) * 0.6); fp(t); }); }
    stationDish(root, API, anim, Rd * 0.85 + 0.6, 1.4, CUD, CU);   // s406b: Kufa's lance dish on a mast above the dome apex
    return { root, LT, anim, hit: PD + 4, api: API };
  }
  // ---------------------------------------------------------------- s387 SHASTA STATION (ice crystal spire, lodge ring, cable car)
  function shastaSpireOld(L) {
    const B = baker(), LT = lights(), anim = [], ICE = L.ice, FR = L.frost, DK = L.deck, WD = L.wood, Hs = L.spire;
    B.lathe([[0, -3], [6, -2.4], [9.5, -1.2], [10.5, -0.2], [10.2, 0.3], [0, 0.3]], DK, [0, 0, 0], 0, { seg: 40 });
    B.lathe([[0, -3], [3.2, -4.4], [1.4, -7.5], [0, -8.4]], shade(ICE, 0.85), [0, 0, 0], 0, { seg: 7, flat: true }); LT.add([0, -8.8, 0], FR, 1.8, 0.4);
    B.lathe([[0, 0.3], [2.8, 0.4], [3.1, Hs * 0.35], [1.6, Hs * 0.8], [0, Hs]], ICE, [0, 0, 0], 0, { seg: 6, flat: true });
    B.lathe([[0, Hs * 0.18], [2.0, Hs * 0.24], [2.3, Hs * 0.5], [0.9, Hs * 0.86], [0, Hs * 0.95]], FR, [0, 0, 0], [0, 0.52, 0], { seg: 6, glow: true, flat: true, s: [0.72, 1, 0.72] });
    LT.add([0, Hs + 0.6, 0], FR, 3, 0.25);
    for (let i = 0; i < L.shards; i++) { const a = i / L.shards * TAU + 0.3, r = 5.2 + (i % 3) * 1.1, h = 3 + (i * 37 % 5), tilt = 0.25 + (i % 2) * 0.15;
      B.lathe([[0, 0], [0.9, 0.2], [1.0, h * 0.5], [0, h]], i % 2 ? ICE : shade(ICE, 0.92), [Math.cos(a) * r, 0.2, Math.sin(a) * r], [Math.sin(a) * tilt, 0, -Math.cos(a) * tilt], { seg: 5, flat: true }); LT.add([Math.cos(a) * r, h * 0.6, Math.sin(a) * r], FR, 0.9, 0.3, i); }
    // the lodge ring: timber chalets round the rim with warm windows (Clubhouse 8 lives on Shasta)
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + TAU / 16, cx = Math.cos(a) * 8.6, cz = Math.sin(a) * 8.6;
      B.rbox(2.6, 1.4, 1.8, 0.15, WD, [cx, 1.0, cz], [0, -a + HP, 0]); const sh = new THREE.Shape(); sh.moveTo(-1.6, 0); sh.lineTo(0, 1.2); sh.lineTo(1.6, 0); sh.closePath(); B.ext(sh, 2.0, DK, [cx, 1.7, cz], [0, -a + HP, 0], { bev: 0.05 });
      LT.add([Math.cos(a) * 9.55, 1.0, Math.sin(a) * 9.55], WIN, 1.1, 0); }
    // the 8 on the deck
    { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.font = '900 110px Archivo, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ec3013'; g.fillText('8', 64, 70); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
      var eight = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false })); eight.rotation.x = -HP; eight.position.set(0, 0.34, 5.0); }
    // cable car: two cables out to a docking pod, a gondola sliding along
    const podP = [17, 1.2, -4]; B.rbox(3.4, 2.2, 3.4, 0.7, DK, podP); B.tor(1.6, 0.14, FR, [podP[0] + 1.75, podP[1], podP[2]], [0, HP, 0], { glow: true, seg: 20, tube: 4 }); LT.add([podP[0] + 2, podP[1] + 1.4, podP[2]], GREEN, 1.2, 0.6);
    for (const dz of [-0.4, 0.4]) B.tube([[3, Hs * 0.32, dz], [podP[0] - 1.6, podP[1] + 1.6, podP[2] + dz]], 0.04, GRAPH2, { rseg: 3, caps: false });
    const root = new THREE.Group(); root.add(B.bake('shastaStation')); root.add(eight);
    if (L.lift) { const G = baker(); G.rbox(1.1, 0.9, 0.8, 0.2, '#ec3013', [0, -0.6, 0]); G.box(0.06, 0.6, 0.06, GRAPH2, [0, 0, 0]); G.box(0.8, 0.18, 0.62, WIN, [0, -0.5, 0], 0, { glow: true }); const gon = G.bake('gondola'); root.add(gon);
      const p0 = new THREE.Vector3(3, Hs * 0.32, 0), p1 = new THREE.Vector3(podP[0] - 1.6, podP[1] + 1.6, podP[2]); anim.push(t => { const u = 0.5 - 0.5 * Math.cos(t * 0.35); gon.position.lerpVectors(p0, p1, u); gon.rotation.z = Math.sin(t * 1.3) * 0.05; }); }
    // drifting snow round the spire
    const N = low ? 60 : 140, P = new Float32Array(N * 3), sp = []; for (let i = 0; i < N; i++) sp.push([Math.random() * TAU, 3 + Math.random() * 9, Math.random() * Hs, 0.1 + Math.random() * 0.25]);
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(P, 3)); const snow = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.35, map: glowTex, color: '#ffffff', transparent: true, depthWrite: false, opacity: 0.85 })); root.add(snow);
    anim.push((t, dt) => { for (let i = 0; i < N; i++) { const q = sp[i]; q[0] += dt * q[3] * 0.4; q[2] -= dt * q[3] * 2; if (q[2] < 0) q[2] = Hs; P[i * 3] = Math.cos(q[0]) * q[1]; P[i * 3 + 1] = q[2]; P[i * 3 + 2] = Math.sin(q[0]) * q[1]; } sg.attributes.position.needsUpdate = true; });
    return { root, LT, anim, hit: 11 };
  }
  // ---------------------------------------------------------------- s387 LUXOR STATION (floating stepped pyramid, gold eye, obelisks, sun mirrors)
  function luxorPyramidOld(L) {
    const B = baker(), LT = lights(), anim = [], ST = L.stone, GD = L.gold, n = L.steps, W0 = 16, sh = 1.3;
    for (let i = 0; i < n; i++) { const w = W0 * (1 - i / (n + 0.6)), y = i * sh; B.rbox(w, sh, w, 0.12, i % 2 ? shade(ST, 0.92) : ST, [0, y + sh / 2, 0], 0, { out: 0.05 });
      B.box(w + 0.04, 0.16, w + 0.04, i === 0 ? L.accent : GD, [0, y + sh - 0.06, 0], 0, { out: 0, glow: i === n - 1 });
      for (let k = 0; k < 4; k++) { const a = k * HP; LT.add([Math.cos(a) * (w / 2 + 0.1), y + sh * 0.6, Math.sin(a) * (w / 2 + 0.1)], AMBER, 0.8, 0.9, i + k); } }
    const top = n * sh, wc = W0 * (1 - n / (n + 0.6));
    B.cyl(0, wc * 0.72, wc * 0.9, GD, [0, top + wc * 0.45, 0], [0, Math.PI / 4, 0], { seg: 4, flat: true });
    // underside: an inverted pyramid keel
    B.cyl(W0 * 0.7, 0, 7, shade(ST, 0.7), [0, -3.5, 0], [0, Math.PI / 4, 0], { seg: 4, flat: true }); LT.add([0, -7.4, 0], GD, 2, 0.4);
    // obelisks on the four corners
    for (let k = 0; k < 4; k++) { const a = k * HP + Math.PI / 4, r = W0 * 0.62, x = Math.cos(a) * r, z = Math.sin(a) * r;
      B.cyl(0.55, 0.85, 6, ST, [x, 3.2, z], [0, Math.PI / 4, 0], { seg: 4, flat: true }); B.cyl(0, 0.6, 1, GD, [x, 6.7, z], [0, Math.PI / 4, 0], { seg: 4, flat: true }); B.rbox(2.2, 0.4, 2.2, 0.1, shade(ST, 0.8), [x, 0.2, z]); LT.add([x, 7.4, z], GD, 1.5, 0.5, k); }
    // gold landing pad off the east face
    B.box(4.5, 0.2, 1.3, ST, [W0 / 2 + 2.2, 0.4, 0], 0); B.cyl(2.6, 2.6, 0.3, ST, [W0 / 2 + 6, 0.4, 0], 0, { seg: 24 }); B.tor(2.4, 0.1, GD, [W0 / 2 + 6, 0.6, 0], [HP, 0, 0], { glow: true, seg: 24, tube: 4 }); LT.add([W0 / 2 + 6, 1, 0], GREEN, 1.2, 0.6);
    const root = new THREE.Group(); root.add(B.bake('luxorStation'));
    // the eye: a glowing gold capstone sprite that breathes
    const eye = spark(GD, 6); eye.position.y = top + wc * 0.6; root.add(eye);
    // sun mirrors: a slow ring of tilted gold panels
    const M2 = baker(); for (let i = 0; i < L.mirrors; i++) { const a = i / L.mirrors * TAU, r = W0 * 0.95; M2.box(2.4, 0.08, 1.6, GD, [Math.cos(a) * r, 4, Math.sin(a) * r], [0.5, -a, 0], { out: 0.03 }); M2.cyl(0.06, 0.06, 1.2, GRAPH2, [Math.cos(a) * r, 3.4, Math.sin(a) * r], 0, { seg: 4, out: 0 }); }
    M2.tor(W0 * 0.95, 0.12, shade(ST, 0.8), [0, 2.8, 0], [HP, 0, 0], { seg: 48, tube: 4 }); const ring = M2.bake('mirrors'); root.add(ring);
    const shp = shuttle('#e8d6b0', GD, 1.0); root.add(shp); const f = fly(shp, t => { const a = t * 0.13; return [Math.cos(a) * (W0 + 6), 3 + Math.sin(t * 0.5) * 1.2, Math.sin(a) * (W0 + 6)]; });
    anim.push((t, dt) => { ring.rotation.y += dt * 0.06; eye.material.opacity = 0.55 + 0.35 * Math.sin(t * 1.4); eye.scale.setScalar(5 + Math.sin(t * 1.4) * 1.2); f(t); });
    return { root, LT, anim, hit: W0 * 0.7 };
  }
  // ---------------------------------------------------------------- s405 WORLD STATIONS, all built on the DSF design (Ben):
  // a HUB SPINDLE + a RING on SPOKES + a TOP PIECE (+ pods, windows, lights). Each world varies the ring (round / polygon / broken arcs /
  // stacked terraces), the pods, the top and its own motif. Simpler + smaller than DSF (size rule: ≤ 67 %).
  // s406b the shared station LANCE DISH (every world station; DSF has its own bigger one): mast + deep bowl + red rim + struts + emitter
  function stationDish(root, API, anim, topY, dr, HD, A) {
    const MH = 1.1, M = baker(); M.cyl(0.24, 0.4, MH, HD, [0, MH / 2, 0], 0, { seg: 10 }); M.tor(0.42, 0.06, A, [0, MH * 0.5, 0], [HP, 0, 0], { glow: true, seg: 14, tube: 3 }); const mast = M.bake('mast'); mast.position.y = topY; root.add(mast);
    const Dd = baker(); Dd.lathe([[0.3, -0.18], [dr * 0.55, -0.12], [dr * 0.92, 0.2], [dr, 0.55], [dr * 1.01, 0.72]], '#9aa3b2', [0, 0, 0], 0, { seg: 24 });
    const bands = ['#5d6675', '#8a93a3', '#c4cbd6']; for (let b2 = 0; b2 < 3; b2++) { const p = []; for (let k = 0; k <= 3; k++) { const u = (b2 * 3 + k) / 9, r = 0.3 + u * (dr - 0.3); p.push([r, 0.04 + u * u * 0.68]); } Dd.lathe(p.slice().reverse(), bands[b2], [0, 0, 0], 0, { seg: 24, out: 0 }); }
    Dd.tor(dr, 0.06, '#f3f5fa', [0, 0.72, 0], [HP, 0, 0], { seg: 28, tube: 4, out: 0.02 }); Dd.tor(dr, 0.035, '#ff2a2a', [0, 0.76, 0], [HP, 0, 0], { glow: true, seg: 24, tube: 3 });
    for (let q = 0; q < 3; q++) { const a = q / 3 * TAU; Dd.tube([[Math.cos(a) * dr * 0.88, 0.68, Math.sin(a) * dr * 0.88], [0, 1.3, 0]], 0.035, GRAPH2, { rseg: 3, caps: false }); }
    Dd.sph(0.16, '#ff4a3a', [0, 1.34, 0], 1, { glow: true, seg: 8 }); const dish = Dd.bake('dish'), dp = new THREE.Group(), tilt = new THREE.Group(); dp.position.y = topY + MH + 0.1; tilt.position.y = 0.3; root.add(dp); dp.add(tilt); tilt.add(dish);
    const em = new THREE.Object3D(); em.position.set(0, 1.34, 0); dish.add(em); const gs = spark('#ff4a3a', 0.9); gs.position.copy(em.position); dish.add(gs);
    API.dish = dp; API.emitter = em; let lt = 0, ld = 0; API.lance = (dur, ch = 0.57) => { lt = 0; ld = dur; API._ch = ch; }; const _w = new THREE.Vector3(), _q = new THREE.Quaternion();
    anim.push((t, dt) => { const f = ld > 0; if (f) { lt += dt; if (lt > ld + 1.2) ld = 0; } const ch = API._ch || 0.57, k = f ? Math.min(1, lt / ch) : 0; gs.material.opacity = f ? 0.5 + 0.5 * k : 0.35 + 0.15 * Math.sin(t * 2); gs.scale.setScalar(f ? 1 + k * 2.4 + Math.sin(t * 40) * 0.2 : 0.9);
      let yT, pT; if (API.aim && f) { dp.getWorldPosition(_w); const d = API.aim.clone().sub(_w); root.getWorldQuaternion(_q).invert(); d.applyQuaternion(_q); yT = Math.atan2(d.x, d.z); pT = HP - Math.atan2(d.y, Math.hypot(d.x, d.z)); } else { yT = dp.rotation.y + dt * 0.35; pT = 0.5; }
      let dy = yT - dp.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); dp.rotation.y += dy * Math.min(1, dt * (f ? 5 : 2)); tilt.rotation.x += (pT - tilt.rotation.x) * Math.min(1, dt * (f ? 5 : 1.5)); });
  }
  function ringStation(L, V) {
    const B = baker(), W = baker(), LT = lights(), WL = lights(), anim = [], H = L.hull, A = L.accent, HD = mix(H, GRAPH, 0.45), WC = V.win || WIN, root = new THREE.Group(), wheelHold = [];
    // HUB: the DSF spindle + saucer, scaled per world
    const hp = V.hubProf || [[0, -5.2], [0.7, -4.8], [1.1, -3.2], [1.4, -1.3], [3.4, -0.55], [4.0, 0], [3.4, 0.55], [1.4, 1.1], [1.0, 2.2], [0, 2.5]];
    B.lathe(hp, V.hubCol || H, [0, 0, 0], 0, { seg: V.hubSeg || 24, flat: !!V.flat }); B.tor(4.0, 0.12, A, [0, 0, 0], [HP, 0, 0], { seg: 32, tube: 4, out: 0.02 });
    for (let i = 0; i < 16; i++) { if (i % 5 === 2) continue; const a = i / 16 * TAU; B.box(0.06, 0.28, 0.34, WC, [Math.cos(a) * 3.55, 0.3, Math.sin(a) * 3.55], [0, -a, 0], { glow: true }); }
    LT.add([0, -5.6, 0], A, 1.6, 0.5);
    // RINGS: [{ r, y, tube, ty, sides, rot, gaps }]
    const rings = V.rings || [{ r: 12, y: 0, tube: 1.1, ty: 1.2 }];
    for (const R of rings) { const n = R.sides || 0, tb = R.tube, ty = R.ty || 1;
      if (n) { const vx = []; for (let i = 0; i < n; i++) { const a = i / n * TAU + (R.rot || 0); vx.push([Math.cos(a) * R.r, Math.sin(a) * R.r]); }
        for (let i = 0; i < n; i++) { const [x0, z0] = vx[i], [x1, z1] = vx[(i + 1) % n], L2 = Math.hypot(x1 - x0, z1 - z0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ry = -Math.atan2(z1 - z0, x1 - x0);
          W.rbox(L2, tb * 2 * ty, tb * 2, tb * 0.6, i % 2 ? H : mix(H, A, 0.08), [mx, R.y, mz], [0, ry, 0], { flat: !!V.flat }); W.box(L2 * 0.92, 0.12, 0.2, A, [mx, R.y + tb * ty + 0.02, mz], [0, ry, 0], { out: 0 });
          const nx = Math.cos(-ry + HP), nz = Math.sin(-ry + HP), o = (mx * nx + mz * nz) > 0 ? 1 : -1; for (let k = -3; k <= 3; k++) { if ((k + i) % 4 === 0) continue; const t2 = k / 7; W.box(0.06, tb * ty * 0.7, L2 * 0.08, WC, [mx + (x1 - x0) * t2 + nx * o * (tb + 0.03), R.y, mz + (z1 - z0) * t2 + nz * o * (tb + 0.03)], [0, ry + HP, 0], { glow: true }); }
          W.sph(tb * 1.15, HD, [x0, R.y, z0], [1, ty, 1], { seg: 12, flat: !!V.flat }); }
        R.verts = vx; }
      else { const gaps = R.gaps || 0, arcs = gaps ? gaps : 1, span = gaps ? TAU / gaps * 0.82 : TAU;
        for (let g = 0; g < arcs; g++) { const a0 = g / arcs * TAU + (R.rot || 0); W.tor(R.r, tb, g % 2 && gaps ? mix(H, A, 0.12) : H, [0, R.y, 0], [HP, 0, 0], { arc: span, a0: -a0 - span, seg: gaps ? 18 : 64, tube: 12, s: [1, 1, ty] });
          if (gaps) for (const e of [a0, a0 + span]) W.sph(tb * 1.05, HD, [Math.cos(e) * R.r, R.y, Math.sin(e) * R.r], [1, ty, 1], { seg: 10 }); }
        W.tor(R.r + tb * 0.72, 0.09, WC, [0, R.y + tb * ty * 0.68, 0], [HP, 0, 0], { glow: true, seg: 64, tube: 3 });
        const nW = Math.round(R.r * 4.5); for (let i = 0; i < nW; i++) { if (i % 6 === 1) continue; const a = i / nW * TAU; if (gaps) { const u = (((a - (R.rot || 0)) % (TAU / gaps)) + TAU) % (TAU / gaps); if (u > TAU / gaps * 0.8) continue; } W.box(0.06, tb * ty * 0.62, 0.42, WC, [Math.cos(a) * (R.r + tb + 0.03), R.y, Math.sin(a) * (R.r + tb + 0.03)], [0, -a, 0], { glow: true }); } }
      // spokes from the hub to this ring
      const ns = V.spokes || 4; for (let i = 0; i < ns; i++) { const a = i / ns * TAU + (V.spokeRot || 0.3), cx = Math.cos(a), sz = Math.sin(a), rr = n ? R.r * Math.cos(Math.PI / n) : R.r;
        if (V.spoke) V.spoke(W, a, 4, rr - tb, R.y); else W.tube([[cx * 4, Math.min(R.y, 0.4), sz * 4], [cx * (rr - tb), R.y, sz * (rr - tb)]], 0.32, H, { rseg: 8 }); }
      for (let k = 0; k < 4; k++) { const a = k * HP + 0.15; WL.add([Math.cos(a) * (R.r + tb), R.y + tb * ty * 0.9, Math.sin(a) * (R.r + tb)], '#ffffff', 1.0, 0.55, k * 0.3); } }
    // pods + top + motif
    if (V.pods) V.pods({ B, W, LT, WL, rings, H, A, HD, WC, root, anim });
    if (V.top) V.top({ B, W, LT, WL, rings, H, A, HD, WC, root, anim });
    // s406 (Ben): EVERY station carries the LANCE DISH (on a mast above its top piece) + WEAPON TURRETS on its ring, like DSF but smaller
    const API = { turrets: [], launchers: [], aim: null }, topY = V.topY ?? 3.2;
    stationDish(root, API, anim, topY, V.dishR || 1.5, HD, A);
    { const TH = baker(), tc = V.turCol || HD; TH.cyl(0.5, 0.6, 0.28, tc, [0, 0.14, 0], 0, { seg: 12 }); TH.sph(0.45, H, [0, 0.28, 0], [1, 0.72, 1], { seg: 12, t1: HP });
      for (const sd of [-1, 1]) { TH.cyl(0.055, 0.07, 1.2, GRAPH2, [sd * 0.17, 0.4, -0.7], [HP, 0, 0], { seg: 8, out: 0.02 }); TH.cyl(0.045, 0.045, 0.03, RED, [sd * 0.17, 0.4, -1.31], [HP, 0, 0], { glow: true, seg: 8 }); }
      TH.box(0.42, 0.05, 0.1, A, [0, 0.5, 0.1], 0, { glow: true }); const head = TH.bake('turret'), R0 = rings[0], tur = [], nT = V.turrets ?? 4;
      for (let i = 0; i < nT; i++) { const a = (i + 0.5) / nT * TAU + (R0.rot || 0) + 0.2, rr = R0.sides ? R0.r * Math.cos(Math.PI / R0.sides) : R0.r, x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = R0.y + R0.tube * (R0.ty || 1);
        const g = head.clone(true); g.position.set(x, y, z); wheelHold.push(g); tur.push({ g, ph: i * 1.4, base: Math.atan2(x, z) }); WL.add([x, y + 0.7, z], RED, 0.45, 0.5, i); }
      API.turrets = tur.map(q => q.g); const _w = new THREE.Vector3(), _q = new THREE.Quaternion();
      anim.push(t => { for (const q of tur) { if (API.aim && q.g.parent) { q.g.getWorldPosition(_w); const d = API.aim.clone().sub(_w); q.g.parent.getWorldQuaternion(_q).invert(); d.applyQuaternion(_q); q.g.rotation.y = Math.atan2(d.x, d.z) + Math.PI; } else q.g.rotation.y = q.base + Math.PI + Math.sin(t * 0.3 + q.ph) * 0.9; } }); }
    const wheel = W.bake('wheel'); root.add(B.bake('hub')); root.add(wheel); const wp = WL.make(); if (wp) wheel.add(wp); wheelHold.forEach(g => wheel.add(g));
    if (V.extra) V.extra({ B, W, LT, rings, H, A, HD, WC, root, wheel, anim });
    // s407 POLISH (every world station): warm glow hugging the ring windows, a slow light SWEEP round the ring, panel lines on the hub,
    // docking-port collars with red / green lights + a craft berthed, amber under-hub lights, a breathing keel glow, and a shuttle on patrol
    { const R0p = rings[0], tb = R0p.tube, ty = R0p.ty || 1, rr = R0p.sides ? R0p.r * Math.cos(Math.PI / R0p.sides) : R0p.r;
      const hug = new THREE.Mesh(new THREE.TorusGeometry(R0p.sides ? rr : R0p.r, tb * 1.25, 6, low ? 48 : 96), glowMat(V.hug || '#ffd89a', 0.06)); hug.rotation.x = HP; hug.scale.z = ty; hug.position.y = R0p.y; wheel.add(hug);
      const sweep = new THREE.Mesh(new THREE.TorusGeometry(R0p.sides ? rr : R0p.r, tb * 1.3, 8, low ? 20 : 32, 0.6), glowMat('#e6f0ff', 0.12)); sweep.rotation.x = HP; sweep.scale.z = ty; sweep.position.y = R0p.y; root.add(sweep);
      const P2 = baker(), PL2 = lights(); for (let i = 0; i < 3; i++) { const a = (i + 0.25) / 3 * TAU + 0.7, cx = Math.cos(a), sz = Math.sin(a), ro = (R0p.sides ? rr : R0p.r) + tb;
        P2.cyl(0.42, 0.5, 0.8, HD, [cx * (ro + 0.3), R0p.y, sz * (ro + 0.3)], [0, -a, HP], { seg: 10 }); P2.tor(0.45, 0.06, A, [cx * (ro + 0.72), R0p.y, sz * (ro + 0.72)], [0, -a + HP, 0], { seg: 12, tube: 3, out: 0.02 });
        PL2.add([cx * (ro + 0.8), R0p.y + 0.6, sz * (ro + 0.8)], i % 2 ? GREEN : RED, 0.6, 0.8, i);
        if (i === 0) { const sh = shuttle(mix(H, '#ffffff', 0.3), A, 0.8); sh.position.set(cx * (ro + 2.2), R0p.y, sz * (ro + 2.2)); sh.rotation.y = -a + Math.PI; wheel.add(sh); anim.push(t => sh.userData.tick && sh.userData.tick(t)); } }
      wheel.add(P2.bake('ports')); const pl = PL2.make(); if (pl) wheel.add(pl);
      for (const y of [0.62, -0.62]) B.tor(3.75, 0.05, GRAPH2, [0, y, 0], [HP, 0, 0], { seg: 32, tube: 3, out: 0 });
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; LT.add([Math.cos(a) * 3.0, -0.7, Math.sin(a) * 3.0], AMBER, 0.45, 0); }
      const keel = spark(A, 3.4); keel.position.y = -5.8; root.add(keel);
      const pat = shuttle(mix(H, A, 0.25), A, 0.7), pr = (R0p.r + 6); root.add(pat); const fpat = fly(pat, t => { const a = t * 0.16 + 1; return [Math.cos(a) * pr, 1.5 + Math.sin(t * 0.5) * 1.2, Math.sin(a) * pr]; });
      anim.push(t => { sweep.rotation.z = -t * 0.32; sweep.material.opacity = 0.09 + 0.05 * Math.sin(t * 0.7); hug.material.opacity = 0.05 + 0.02 * Math.sin(t * 1.3); keel.material.opacity = 0.4 + 0.25 * Math.sin(t * 1.6); keel.scale.setScalar(3 + Math.sin(t * 1.6) * 0.6); fpat(t); }); }
    const R0 = rings[0]; if (V.chase !== false) { const rr = []; for (let k = 0; k < 36; k++) { const a = k / 36 * TAU; rr.push([Math.cos(a) * (R0.r + R0.tube * 0.7), R0.y + R0.tube * (R0.ty || 1) * 0.75, Math.sin(a) * (R0.r + R0.tube * 0.7)]); } const ch = flow([rr], V.chaseCol || A, 4, 0.07, 0.8, true); wheel.add(ch); anim.push(t => ch.userData.flow(t)); }
    { const halo = spark(V.halo || A, (R0.r + 4) * 2.6); halo.material.opacity = 0.07; root.add(halo); anim.push(t => { halo.material.opacity = 0.05 + 0.02 * Math.sin(t * 0.6); }); }
    anim.push((t, dt) => { wheel.rotation.y += dt * (L.spin ?? 0.15) * 0.5 * (V.spinDir || 1); });
    const rMax = Math.max(...rings.map(q => q.r + q.tube)); return { root, LT, anim, hit: rMax + 3, api: API };
  }
  const leafShape = (l, w) => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(w, l * 0.35, 0, l); sh.quadraticCurveTo(-w, l * 0.35, 0, 0); return sh; };
  const STV = {
    shasta: { hug: '#bfe4ff', topY: 10.6, flat: true, hubSeg: 6, win: '#cfeaff', halo: '#9fd2ff', spokes: 3, rings: [{ r: 12.5, y: 0, tube: 1.15, ty: 1.15, sides: 6, rot: Math.PI / 6 }],
      pods: ({ W, WL, rings, A }) => { const R = rings[0]; R.verts.forEach(([x, z], i) => { const h = 2.6 + (i % 3) * 0.8; W.lathe([[0, 0], [0.75, 0.2], [0.8, h * 0.55], [0, h]], i % 2 ? '#d8ecff' : '#eef6ff', [x, 0.9, z], [0, i, 0], { seg: 5, flat: true }); WL.add([x, h * 0.6 + 0.9, z], '#7fd0ff', 0.8, 0.3, i); });
        for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, x = Math.cos(a) * 10.8, z = Math.sin(a) * 10.8; W.rbox(2.0, 1.1, 1.4, 0.15, '#8a5a3a', [x, 1.75, z], [0, -a + HP, 0]); const sh = new THREE.Shape(); sh.moveTo(-1.25, 0); sh.lineTo(0, 0.95); sh.lineTo(1.25, 0); sh.closePath(); W.ext(sh, 1.5, '#f4f7fc', [x, 2.3, z], [0, -a + HP, 0], { bev: 0.04 }); WL.add([Math.cos(a) * 11.55, 1.7, Math.sin(a) * 11.55], WIN, 0.9, 0); } },
      top: ({ B, LT }) => { B.lathe([[0, 2.4], [1.8, 2.6], [2.0, 5.5], [1.0, 9], [0, 10.5]], '#d8ecff', [0, 0, 0], 0, { seg: 6, flat: true }); B.lathe([[0, 3], [1.2, 3.3], [1.35, 5.8], [0.5, 8.8], [0, 9.6]], '#7fd0ff', [0, 0, 0], [0, 0.52, 0], { seg: 6, flat: true, glow: true, s: [0.78, 1, 0.78] }); LT.add([0, 11, 0], '#7fd0ff', 2.6, 0.3); B.tor(2.1, 0.1, '#ec3013', [0, 2.6, 0], [HP, 0, 0], { seg: 6, tube: 3, out: 0.02 }); } },
    home: { topY: 7.4, win: '#ffd89a', halo: '#2cc4c4', spokes: 4, spokeRot: Math.PI / 8, chaseCol: '#ec3013', rings: [{ r: 10.5, y: 0, tube: 0.95, ty: 1.05, sides: 8, rot: Math.PI / 8 }],
      pods: ({ W, WL, rings }) => { const R = rings[0]; R.verts.forEach(([x, z], i) => { if (i % 2) { W.cyl(0.9, 1.0, 1.3, '#a07a50', [x, 1.25, z], 0, { seg: 8 }); W.cyl(0, 1.5, 1.2, '#d8b860', [x, 2.45, z], 0, { seg: 8, flat: true }); WL.add([x, 1.4, z], '#ffd89a', 0.8, 0.3, i); } else { W.rbox(1.4, 0.9, 1.4, 0.1, '#e8dcc0', [x, 1.05, z], [0, i, 0]); WL.add([x, 1.6, z], '#2cc4c4', 0.7, 0.4, i); } }); },
      top: ({ B, LT }) => { B.cyl(0.7, 1.0, 3.2, '#a07a50', [0, 3.6, 0], 0, { seg: 8 }); B.cyl(0.5, 0.5, 1.6, '#2cc4c4', [0, 5.9, 0], 0, { seg: 6, glow: true }); B.cyl(0, 0.9, 1.0, '#ec3013', [0, 7.2, 0], 0, { seg: 8, flat: true }); LT.add([0, 6, 0], '#7fe3ff', 2.4, 0.3);
        for (const sgn of [-1, 1]) { B.box(0.25, 0.25, 4.2, '#5a5a5e', [0, 4.2, sgn * 2.6], 0); B.box(2.6, 0.08, 3.6, '#1e2e5a', [0, 4.2, sgn * 5.2], [0.25, 0, 0], { out: 0.02 }); B.box(2.7, 0.04, 3.7, '#c8ccd2', [0, 4.16, sgn * 5.2], [0.25, 0, 0], { out: 0 }); } },
      extra: ({ root, anim }) => { const M2 = baker(); M2.tor(15, 0.12, '#ec3013', [0, -0.6, 0], [Math.PI / 2, 0, 0], { seg: 48, tube: 4, out: 0 }); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; M2.box(0.5, 0.5, 0.5, '#ffd23a', [Math.cos(a) * 15, -0.6, Math.sin(a) * 15], 0, { glow: true }); } const m = M2.bake('padring'); root.add(m); anim.push((t, dt) => { m.rotation.y += dt * 0.04; }); } },
    luxor: { topY: 6.4, win: '#ffd89a', halo: '#ffc94a', spokes: 4, spokeRot: 0, chaseCol: '#ffc94a', rings: [{ r: 12, y: 0, tube: 1.0, ty: 1.2, sides: 4, rot: 0 }],
      pods: ({ W, WL, rings, H }) => { rings[0].verts.forEach(([x, z], i) => { W.cyl(0.5, 0.8, 5.5, H, [x, 3.0, z], [0, Math.PI / 4, 0], { seg: 4, flat: true }); W.cyl(0, 0.55, 0.9, '#ffc94a', [x, 6.2, z], [0, Math.PI / 4, 0], { seg: 4, flat: true }); WL.add([x, 6.9, z], '#ffc94a', 1.3, 0.5, i); }); },
      top: ({ B, LT }) => { for (let i = 0; i < 4; i++) { const w = 6.4 - i * 1.4; B.rbox(w, 1.0, w, 0.08, i % 2 ? '#c99556' : '#d9a866', [0, 1.6 + i * 1.0, 0], [0, Math.PI / 4, 0], { out: 0.04 }); B.box(w + 0.04, 0.12, w + 0.04, '#ffc94a', [0, 2.06 + i * 1.0, 0], [0, Math.PI / 4, 0], { out: 0 }); }
        B.cyl(0, 1.1, 1.4, '#ffc94a', [0, 5.8, 0], [0, Math.PI / 4, 0], { seg: 4, flat: true, glow: true }); LT.add([0, 6.6, 0], '#ffc94a', 3.2, 0.25); },
      extra: ({ root, anim }) => { const M2 = baker(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; M2.box(2.0, 0.07, 1.3, '#ffc94a', [Math.cos(a) * 16, 2.4, Math.sin(a) * 16], [0.5, -a, 0], { out: 0.03 }); } const m = M2.bake('mirrors'); root.add(m); anim.push((t, dt) => { m.rotation.y -= dt * 0.05; }); } },
    ur: { topY: 8.8, turCol: '#8a5a3a', win: '#ffcf8a', halo: '#e8963a', spokes: 4, rings: [{ r: 12.5, y: 0.7, tube: 1.0, ty: 1.3, gaps: 5, rot: 0.2 }, { r: 8.8, y: -1.1, tube: 0.9, ty: 1.2, gaps: 4, rot: 0.9 }],
      pods: ({ W, WL, rings }) => { const R = rings[0]; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.2 + TAU / 5 * 0.41, x = Math.cos(a) * (R.r + 1.6), z = Math.sin(a) * (R.r + 1.6); W.sph(1.3, '#a8693e', [x, R.y, z], [1, 0.8, 1], { seg: 12, t1: Math.PI * 0.65 }); W.cyl(0.6, 0.6, 0.05, '#ffcf8a', [x + Math.cos(a) * 1.0, R.y - 0.1, z + Math.sin(a) * 1.0], [0, -a, HP], { glow: true, seg: 12 }); WL.add([x, R.y + 1, z], '#ffb340', 0.9, 0); } },
      top: ({ B, LT }) => { B.lathe([[0, 2.4], [1.5, 2.5], [1.2, 7.5], [1.6, 7.8], [1.6, 8.6], [0, 8.8]], '#a8693e', [0, 0, 0], 0, { seg: 8 }); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; B.box(0.05, 0.5, 0.36, '#ffcf8a', [Math.cos(a) * 1.62, 8.15, Math.sin(a) * 1.62], [0, -a, 0], { glow: true }); } LT.add([0, 9.4, 0], '#ff4a2e', 1.6, 0.6); },
      extra: ({ root, anim }) => { const R2 = baker(); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + 0.3, r = 16 + (i % 3) * 1.5; R2.add(new THREE.DodecahedronGeometry(0.7 + (i % 3) * 0.4, 0), '#8a5a3a', mat4([Math.cos(a) * r, (i % 2 ? 1.5 : -1.8), Math.sin(a) * r], [i, i * 2, 0]), { flat: true, out: 0.04 }); } const rk = R2.bake('rocks'); root.add(rk); anim.push((t, dt) => { rk.rotation.y += dt * 0.03; }); } },
    gaya: { hug: '#e6d6ff', topY: 6.9, dishR: 1.2, win: '#e6d6ff', halo: '#a97bdd', spokes: 3, rings: [{ r: 12, y: 0, tube: 1.1, ty: 1.1 }, { r: 8.2, y: 2.1, tube: 0.8, ty: 1.1 }],
      pods: ({ W, WL, rings }) => { for (const R of rings) W.tor(R.r, R.tube * 0.62, '#5ec97e', [0, R.y + R.tube * (R.ty || 1) * 0.82, 0], [HP, 0, 0], { seg: 64, tube: 6, s: [1, 1, 0.35], out: 0.02 });
        for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + TAU / 8, x = Math.cos(a) * 13.6, z = Math.sin(a) * 13.6; W.cyl(0.9, 1.0, 1.4, '#ece6f5', [x, 0, z], 0, { seg: 12 }); W.cyl(0.05, 1.35, 1.0, '#a97bdd', [x, 1.2, z], 0, { seg: 12 }); WL.add([x, 0.2, z], '#ffd89a', 0.9, 0); } },
      top: ({ B, LT, anim, root }) => { for (let i = 0; i < 3; i++) B.cyl(0.4 + (2 - i) * 0.5, 0.6 + (2 - i) * 0.7, 0.7, i % 2 ? '#ece6f5' : '#a97bdd', [0, 2.8 + i * 0.75, 0], 0, { seg: 8 }); B.cyl(0, 0.6, 1.2, '#a97bdd', [0, 5.3, 0], 0, { seg: 8 });
        const fl = spark('#ff9a3a', 2.4); fl.position.y = 6.3; root.add(fl); anim.push(t => { fl.scale.setScalar(2 + Math.sin(t * 9) * 0.35 + Math.sin(t * 23) * 0.2); fl.material.opacity = 0.75 + Math.sin(t * 13) * 0.2; }); LT.add([0, 6.3, 0], '#ffb340', 1.6, 0); } },
    zion: { topY: 5.8, turCol: '#c9a41a', turrets: 6, win: '#fff4c2', halo: '#e8cf4a', spokes: 6, spokeRot: 0, chaseCol: '#e8cf4a', rings: [{ r: 12.5, y: 0, tube: 0.9, ty: 0.75, sides: 6, rot: 0 }],
      pods: ({ W, WL, rings }) => { W.cyl(11.4, 11.4, 0.25, '#f6f2e4', [0, -0.35, 0], 0, { seg: 6, flat: true }); W.cyl(11.0, 11.0, 0.05, '#e7ddc0', [0, -0.2, 0], 0, { seg: 6, out: 0 });
        rings[0].verts.forEach(([x, z], i) => { for (let k = 0; k < 4; k++) W.box(0.9 + k * 0.2, 1.2 + (k % 2) * 0.9, 0.9, k % 2 ? '#ffffff' : '#efe9d6', [x + (k - 1.5) * 0.55, 1.2 + (k % 2) * 0.4, z + ((k * 7) % 3 - 1) * 0.5], [k * 0.3, k, 0.2], { flat: true, out: 0.03 }); WL.add([x, 2.8, z], '#e8cf4a', 0.9, 0.5, i); }); },
      top: ({ B, LT, root, anim }) => { B.cyl(2.0, 2.4, 2.6, '#f6f2e4', [0, 3.6, 0], 0, { seg: 12 }); for (let i = 0; i < 6; i++) B.box(0.9, 0.3, 0.05, i % 2 ? '#201e1d' : '#e8cf4a', [Math.cos(i / 6 * TAU) * 2.2, 3.6, Math.sin(i / 6 * TAU) * 2.2], [0, -i / 6 * TAU + HP, 0], { out: 0 });
        B.cyl(1.0, 0.7, 0.8, '#e8cf4a', [0, 5.3, 0], 0, { seg: 12 }); const sl = spark('#fff4c2', 4); sl.position.y = 5.6; root.add(sl); anim.push(t => { sl.material.opacity = 0.55 + 0.35 * Math.sin(t * 2.2); }); LT.add([0, 5.9, 0], '#e8cf4a', 1.8, 0); },
      extra: ({ root, anim }) => { const N = 50, P2 = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const a = Math.random() * TAU, r = 3 + Math.random() * 9; P2.set([Math.cos(a) * r, Math.random() * 1.5, Math.sin(a) * r], i * 3); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P2, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.3, map: glowTex, color: '#ffe066', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); root.add(pts); anim.push(t => { pts.material.opacity = 0.6 + 0.3 * Math.sin(t * 3.1); pts.rotation.y = t * 0.05; }); } },
    nebo: { hug: '#9fd2ff', topY: 8.8, win: '#cfeaff', halo: '#5aa6e8', spokes: 4, chaseCol: '#9fd2ff', rings: [{ r: 13, y: 0, tube: 1.1, ty: 1.15 }],
      spoke: (W, a, r0, r1, y) => { const sh = new THREE.Shape(); sh.moveTo(0, -0.25); sh.lineTo(r1 - r0, -0.15); sh.quadraticCurveTo(r1 - r0 + 0.4, 0, r1 - r0, 0.15); sh.lineTo(0, 1.4); sh.closePath(); W.ext(sh, 0.12, '#e8f4ff', [Math.cos(a) * r0, y, Math.sin(a) * r0], [-HP, -a, 0], { bev: 0.04 }); },
      pods: ({ W, WL, rings }) => { const R = rings[0]; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + TAU / 8, x = Math.cos(a) * R.r, z = Math.sin(a) * R.r; W.lathe([[0, 0], [0.9, 0.5], [1.15, 1.4], [0.7, 2.4], [0, 3.0]], '#5aa6e8', [x, -R.tube - 3.2, z], 0, { seg: 16 }); W.cyl(0.25, 0.25, 0.9, '#e8f4ff', [x, -R.tube - 0.15, z], 0, { seg: 8 }); WL.add([x, -R.tube - 2.0, z], '#cfeaff', 0.9, 0); } },
      top: ({ B, LT, root, anim }) => { B.cyl(0.8, 1.2, 5, '#ffffff', [0, 4.8, 0], 0, { seg: 12 }); for (let i = 0; i < 3; i++) B.cyl(1.02 - i * 0.1, 1.06 - i * 0.1, 0.4, '#ec3013', [0, 3.3 + i * 1.3, 0], 0, { seg: 12, out: 0 }); B.cyl(1.0, 1.0, 0.9, '#cfeaff', [0, 7.75, 0], 0, { seg: 12, glow: true }); B.cyl(0.2, 1.1, 0.6, '#5aa6e8', [0, 8.5, 0], 0, { seg: 12 });
        const bmT = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); const h = x.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.5, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = h; x.globalAlpha = 0.6; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
        const bmM = new THREE.MeshBasicMaterial({ color: '#fff3c4', map: bmT, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }); const bm = new THREE.Group(); bm.position.y = 7.75; root.add(bm);
        for (const rx of [0, HP]) { const g2 = new THREE.BufferGeometry(), L2 = 15, W2 = 2.6; g2.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, L2, -W2, 0, L2, W2, 0], 3)); g2.setAttribute('uv', new THREE.Float32BufferAttribute([0.5, 1, 0, 0, 1, 0], 2)); const m2 = new THREE.Mesh(g2, bmM); m2.rotation.x = rx; bm.add(m2); }   // s407b: a soft fan of light (two crossed planes, no outline)
        anim.push(t => { bm.rotation.y = t * 0.8; }); LT.add([0, 7.75, 0], '#fff6c8', 2.4, 0); },
      extra: ({ root, anim, rings }) => { const R = rings[0], wt = new THREE.Mesh(new THREE.TorusGeometry(R.r, R.tube * 1.5, 12, low ? 48 : 80), glowMat('#5aa6e8', 0.22)); wt.rotation.x = HP; wt.scale.z = 1.1; root.add(wt); anim.push(t => { wt.material.opacity = 0.18 + 0.06 * Math.sin(t * 1.4); wt.scale.x = wt.scale.y = 1 + Math.sin(t * 0.9) * 0.012; }); } },
    jidda: { topY: 6.2, turCol: '#8a5a3a', win: '#ffe2a8', halo: '#5ec97e', spokes: 5, chaseCol: '#ffb340', rings: [{ r: 12, y: 0, tube: 1.1, ty: 1.15 }],
      spoke: (W, a, r0, r1, y) => { const L2 = r1 - r0, cols = ['#ec3013', '#ffd23a', '#5aa6e8', '#5ec97e', '#ff8ad0']; W.cap(0.55, L2 - 1.1, cols[Math.round(a * 10) % 5], [Math.cos(a) * (r0 + L2 / 2), y + 0.2, Math.sin(a) * (r0 + L2 / 2)], [0, -a, HP], { seg: 12, s: [0.24, 1, 1] }); },
      pods: ({ W, WL, rings }) => { const R = rings[0]; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; W.ext(leafShape(3.0, 1.2), 0.06, PANEL, [Math.cos(a) * R.r, R.tube * 0.9, Math.sin(a) * R.r], [-HP + 1.15, -a + HP, 0], { bev: 0.02 }); W.tube([[Math.cos(a) * R.r, R.tube * 0.95, Math.sin(a) * R.r], [Math.cos(a) * (R.r + 0.4), R.tube * 0.95 + 2.6, Math.sin(a) * (R.r + 0.4)]], 0.04, '#5ec97e', { glow: true, rseg: 3, caps: false }); }   // s406: green solar PETALS (no leaves in space)
        for (let i = 0; i < 5; i++) { const a = (i + 0.5) / 5 * TAU + 0.3, x = Math.cos(a) * (R.r + 1.8), z = Math.sin(a) * (R.r + 1.8); W.cyl(0.9, 0.9, 1.2, '#b98a5a', [x, 0, z], 0, { seg: 10 }); W.cyl(0, 1.5, 1.1, '#d9b56a', [x, 1.15, z], 0, { seg: 10 }); WL.add([x, 0.2, z], '#ffb340', 0.9, 0.3, i); } },
      top: ({ B, LT }) => { for (let i = 0; i < 4; i++) { B.cyl(0.42 - i * 0.04, 0.46 - i * 0.04, 0.95, '#b98a5a', [0, 2.8 + i * 1.0, 0], 0, { seg: 10 }); B.tor(0.47 - i * 0.04, 0.06, '#5ec97e', [0, 2.33 + i * 1.0, 0], [HP, 0, 0], { glow: true, seg: 14, tube: 3 }); }   // s406: a segmented spire (bamboo-style) instead of a palm
        for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4; const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(2.2, 0.3); sh.lineTo(2.4, 0.8); sh.lineTo(0, 0.9); sh.closePath(); B.ext(sh, 0.06, PANEL, [Math.cos(a) * 0.4, 5.0, Math.sin(a) * 0.4], [0, -a, 0], { bev: 0.02 }); } LT.add([0, 6.4, 0], '#ffb340', 1.4, 0.5); } },
  };
  const shastaStation = L => ringStation(L, STV.shasta), luxorStation = L => ringStation(L, STV.luxor), urStation = L => ringStation(L, STV.ur), gayaStation = L => ringStation(L, STV.gaya), zionStation = L => ringStation(L, STV.zion), neboStation = L => ringStation(L, STV.nebo), jiddaStation = L => ringStation(L, STV.jidda), homeStation = L => ringStation(L, STV.home);
  // ---------------------------------------------------------------- s420 THE PLAYER HULLS, all grown OUT OF THE SCOUT (Ben: "base each ship off the player ship,
  // change the shape, be creative, keep the theme"). Each = the scout's own hull (lathe arrow, violet spine, bubble canopy, swept two-tone
  // wings with the cyan leading edge, canted fins, the pulsing 8 crest) re-proportioned + the parts that make it its class. Nose = -z.
  function grown(L, base, xs, build) { const look = { ...defaults('ship'), hull: L.hull, accent: L.accent, canopy: L.canopy || '#7fd0ff', engine: L.glow, edge: L.glow, ...base };
    const r = ship(look, look.accent), inner = r.root, outer = new THREE.Group(); outer.add(inner); inner.scale.set(xs[0], xs[1], xs[2]); if (xs[3]) inner.position.z = xs[3];
    const sc = p => [p[0] * xs[0], p[1] * xs[1], p[2] * xs[2] + (xs[3] || 0)]; const B = baker(), LT2 = lights(), anim = r.anim, G = L.glow, H = L.hull, A = L.accent, HD = mix(H, GRAPH, 0.4), engines = r.api.engines.slice(), extraG = [];
    const eng = (x, y, z, rr) => { B.lathe([[rr * 0.6, 0], [rr, 0.12], [rr * 1.05, rr * 1.3], [rr * 0.7, rr * 1.5]], GRAPH2, [x, y, z], [HP, 0, 0], { seg: 14 }); B.cyl(rr * 0.62, rr * 0.62, 0.02, G, [x, y, z + rr * 1.5], [HP, 0, 0], { glow: true, seg: 12 }); const o = new THREE.Object3D(); o.position.set(x, y, z + rr * 1.6); outer.add(o); engines.push(o); const sp = spark(G, rr * 2.5); sp.position.copy(o.position); outer.add(sp); extraG.push({ sp, rr }); };
    const info = build({ B, LT: LT2, H, A, G, HD, eng, outer, inner, sc, scoutGuns: r.api.guns.map(sc), engines }) || {};
    outer.add(B.bake('hullParts')); const lp = LT2.make(); if (lp) outer.add(lp); if (r.LT) { const p0 = r.LT.make(); if (p0) inner.add(p0); r.LT = null; }
    const api = r.api; anim.push(t => { const k = 0.35 + api.thrust * 0.5 + (api.boost ? 0.6 : 0); for (const e of extraG) { e.sp.scale.setScalar(e.rr * (2 + k * 2.4 + Math.sin(t * 30 + e.rr) * 0.2)); e.sp.material.color.set(api.boost ? '#ffd23a' : G); e.sp.material.opacity = Math.min(1, 0.4 + k * 0.5); } });
    return { root: outer, LT: null, anim, hit: info.hit || 3.5, api: { ...api, guns: info.guns || r.api.guns.map(sc), engines: info.engines || engines, look: { ...L, engine: G }, setThrust: api.setThrust, get thrust() { return api.thrust; }, get boost() { return api.boost; } } }; }
  // FIGHTER: the scout stretched into a dart, wings swept hard back, LONG blade cannons down the wing roots, canards at the nose, an afterburner ring
  function hullFighter(L) { return grown(L, { wingSpan: 1.35, sweep: 1, finCant: 62, crestSize: 0.5 }, [0.95, 0.9, 1.3], ({ B, LT, G, A, HD, eng, scoutGuns }) => {
    const guns = []; for (const s of [-1, 1]) { B.cyl(0.07, 0.09, 2.6, '#cfd4de', [s * 0.62, -0.06, -1.1], [HP, 0, 0], { seg: 8, out: 0.02 }); B.cyl(0.11, 0.11, 0.5, HD, [s * 0.62, -0.06, 0.1], [HP, 0, 0], { seg: 8, out: 0.02 }); B.cyl(0.05, 0.05, 0.03, G, [s * 0.62, -0.06, -2.41], [HP, 0, 0], { glow: true, seg: 8 }); guns.push([s * 0.62, -0.06, -2.45]);
      const c = new THREE.Shape(); c.moveTo(0, 0); c.lineTo(0.7, 0.25); c.lineTo(0.75, 0.42); c.lineTo(0, 0.4); c.closePath(); B.ext(c, 0.05, A, [s * 0.18, 0.02, -1.55], [-HP, 0, s > 0 ? 0 : Math.PI], { bev: 0.02 }); LT.add([s * 0.62, -0.06, -2.5], G, 0.7, 0.6, s); }
    B.tor(0.5, 0.05, G, [0, 0, 1.95], 0, { glow: true, seg: 24, tube: 3 }); return { hit: 3.4, guns: [guns[0], scoutGuns[0], scoutGuns[scoutGuns.length - 1], guns[1]] }; }); }
  // GUNNER: the scout broadened into a heavy wedge, short stub wings, a twin-barrel TURRET on the back, armour sponsons, a third engine
  function hullGunner(L) { return grown(L, { wingSpan: 0.85, sweep: 0.15, finCant: 18, crestSize: 0.55 }, [1.5, 1.3, 1.1], ({ B, LT, H, G, A, HD, eng, outer }) => {
    for (const s of [-1, 1]) { B.cap(0.42, 1.6, H, [s * 1.55, -0.05, 0.25], [HP, 0, 0], { seg: 14 }); B.tor(0.44, 0.05, A, [s * 1.55, -0.05, -0.5], 0, { seg: 16, tube: 3, out: 0.02 }); B.box(0.05, 0.05, 1.5, G, [s * 1.55, 0.36, 0.25], 0, { glow: true }); B.rbox(0.5, 0.18, 1.2, 0.08, HD, [s * 1.0, 0.1, 0.2], [0, s * 0.3, 0]); LT.add([s * 1.95, 0, 0.9], s > 0 ? GREEN : RED, 0.8, 0.8); }
    eng(0, 0.12, 1.55, 0.26);
    const T = baker(); T.lathe([[0, 0], [0.55, 0], [0.6, 0.14], [0.45, 0.36], [0, 0.4]], GRAPH, [0, 0, 0], 0, { seg: 18 }); for (const s of [-1, 1]) { T.cyl(0.06, 0.08, 1.4, '#cfd4de', [s * 0.16, 0.22, -0.8], [HP, 0, 0], { seg: 8, out: 0.02 }); T.cyl(0.05, 0.05, 0.03, G, [s * 0.16, 0.22, -1.51], [HP, 0, 0], { glow: true, seg: 8 }); } T.tor(0.56, 0.04, G, [0, 0.08, 0], [HP, 0, 0], { glow: true, seg: 18, tube: 3 });
    const tur = T.bake('turret'); tur.name = 'turret'; tur.position.set(0, 0.55, 0.55); outer.add(tur); return { hit: 3.8, guns: [[-0.16, 0.77, -0.95], [-1.55, -0.05, -0.75], [1.55, -0.05, -0.75], [0.16, 0.77, -0.95]] }; }); }
  // CRUISER: the scout drawn out long, a raised bridge with a window band, two engine NACELLES on swept pylons, rows of lit windows
  function hullCruiser(L) { return grown(L, { wingSpan: 0.8, sweep: 0.3, finCant: 45, crestSize: 0.55 }, [1.15, 1.15, 1.8], ({ B, LT, H, G, A, HD, eng }) => {
    B.rbox(0.9, 0.42, 1.1, 0.18, H, [0, 0.55, 0.35]); B.box(0.8, 0.1, 0.04, GLASS, [0, 0.62, -0.21], 0, { glow: true }); B.box(0.92, 0.05, 1.12, A, [0, 0.77, 0.35], 0, { out: 0 });
    for (let k = 0; k < 8; k++) for (const s of [-1, 1]) B.box(0.03, 0.08, 0.18, WIN, [s * 0.5, 0.02, -1.6 + k * 0.42], [0, s * 0.12, 0], { glow: true });
    const guns = []; for (const s of [-1, 1]) { B.tube([[s * 0.55, -0.05, 0.4], [s * 1.4, -0.12, 0.9], [s * 1.85, -0.15, 1.1]], 0.1, HD, { rseg: 6 }); B.cap(0.34, 2.4, H, [s * 1.95, -0.15, 0.6], [HP, 0, 0], { seg: 14 }); B.tor(0.36, 0.05, A, [s * 1.95, -0.15, -0.3], 0, { seg: 16, tube: 3, out: 0.02 });
      B.box(0.04, 0.04, 2.2, G, [s * 1.95, 0.2, 0.6], 0, { glow: true }); B.cyl(0.05, 0.06, 0.6, '#cfd4de', [s * 1.95, -0.15, -1.3], [HP, 0, 0], { seg: 8 }); guns.push([s * 1.95, -0.15, -1.65]); eng(s * 1.95, -0.15, 2.0, 0.28); LT.add([s * 1.95, 0.25, -0.6], s > 0 ? GREEN : RED, 0.8, 0.8); }
    return { hit: 4.4, guns: [guns[0], guns[0], guns[1], guns[1]] }; }); }
  // FLAGSHIP: the scout grown huge, a stepped COMMAND TOWER on its back, a second wide wing deck below with four turrets, a hangar glow, five engines
  function hullFlagship(L) { return grown(L, { wingSpan: 1.3, sweep: 0.55, finCant: 30, crestSize: 0.6 }, [2.0, 1.6, 2.1], ({ B, LT, H, G, A, HD, eng }) => {
    const sh = new THREE.Shape(); sh.moveTo(0, -1.6); sh.lineTo(3.6, 1.4); sh.quadraticCurveTo(3.7, 2.0, 3.1, 2.1); sh.lineTo(-3.1, 2.1); sh.quadraticCurveTo(-3.7, 2.0, -3.6, 1.4); sh.closePath(); B.ext(sh, 0.18, H, [0, -0.42, 0.9], [HP, 0, 0], { bev: 0.06 });
    for (const s of [-1, 1]) B.box(3.6, 0.04, 0.06, G, [s * 1.8, -0.31, 0.9], [0, s * 0.68, 0], { glow: true });
    for (let k = 0; k < 3; k++) { const w = 1.2 - k * 0.28; B.rbox(w, 0.42, w * 1.1, 0.12, k % 2 ? A : H, [0, 0.85 + k * 0.42, 1.2 - k * 0.12]); B.box(w * 0.9, 0.08, 0.03, k === 2 ? GLASS : WIN, [0, 0.9 + k * 0.42, 1.2 - k * 0.12 - w * 0.56], 0, { glow: true }); }
    B.cyl(0.03, 0.03, 0.9, GRAPH2, [0.25, 2.5, 1.0], 0, { seg: 4 }); LT.add([0.25, 3.0, 1.0], RED, 1.0, 0.8);
    const guns = []; for (const s of [-1, 1]) for (const z of [0.9, 2.2]) { const x = s * (z < 1 ? 1.6 : 2.4); B.lathe([[0, 0], [0.32, 0], [0.34, 0.1], [0.24, 0.22], [0, 0.24]], GRAPH, [x, -0.24, z], 0, { seg: 12 }); B.cyl(0.04, 0.05, 0.8, '#cfd4de', [x, -0.1, z - 0.45], [HP, 0, 0], { seg: 6, out: 0.02 }); guns.push([x, -0.1, z - 0.85]); }
    B.box(2.0, 0.3, 0.04, '#9fe8ff', [0, -0.3, 3.02], 0, { glow: true }); for (const x of [-1.6, 0, 1.6]) eng(x, -0.3, 2.95, 0.3); LT.add([3.6, -0.3, 2.2], GREEN, 1.0, 0.8); LT.add([-3.6, -0.3, 2.2], RED, 1.0, 0.8);
    return { hit: 6.2, guns: [guns[0], guns[1], guns[2], guns[3]] }; }); }
  // COLONY SHIP: the scout nose leads a long town: a spine, a glowing GREENHOUSE dome, two habitat rings, cargo pods, big tanks, two tail engines
  function hullColony(L) { return grown(L, { wingSpan: 0.9, sweep: 0.4, finCant: 40, crestSize: 0.5, pods: false }, [1.3, 1.3, 1.3, -2.6], ({ B, LT, H, G, A, HD, eng, engines }) => {
    B.cap(0.55, 6.0, HD, [0, 0, 1.6], [HP, 0, 0], { seg: 14 });
    B.sph(1.5, '#2f9a4e', [0, 0.25, 0.6], [1, 0.7, 1.2], { t1: HP, seg: 18 }); B.sph(1.55, G, [0, 0.25, 0.6], [1.03, 0.72, 1.23], { t1: HP, seg: 18, glow: true }); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; B.tube([[Math.cos(a) * 1.5, 0.25, 0.6 + Math.sin(a) * 1.8], [0, 1.3, 0.6]], 0.03, '#eef1f6', { rseg: 3, caps: false }); }
    for (const z of [2.6, 4.0]) { B.tor(1.8, 0.24, H, [0, 0, z], 0, { seg: 32, tube: 8 }); B.tor(1.8, 0.05, WIN, [0, 0.25, z], 0, { glow: true, seg: 32, tube: 3 }); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.4; B.tube([[Math.cos(a) * 0.55, Math.sin(a) * 0.55, z], [Math.cos(a) * 1.6, Math.sin(a) * 1.6, z]], 0.06, HD, { rseg: 4, caps: false }); } }
    for (const s of [-1, 1]) { B.cap(0.38, 1.2, A, [s * 1.0, -0.3, 3.3], [HP, 0, 0], { seg: 12 }); B.cap(0.42, 1.4, mix(A, '#ffffff', 0.35), [s * 0.9, 0.5, 3.3], [HP, 0, 0], { seg: 12 }); LT.add([s * 2.1, 0, 4.0], s > 0 ? GREEN : RED, 0.9, 0.8); }
    engines.length = 0; for (const s of [-1, 1]) eng(s * 0.45, 0, 4.7, 0.34); return { hit: 5.4 }; }); }
  // s543 CARGO SHIP (Ben): the colony freighter, big, on landing legs, with a REAR RAMP that lowers to the ground (api.setRamp(0..1)). Nose = -z, belly at y 0.95, ramp hinge at the rear (z 5).
  // s544 POLISH: the STRIPE = the world's colour (worldTint, o.tint), panel seams, a side hatch, a dish on the bridge, radiator fins, belly floodlights, braced legs, ramp rails.
  function hullCargo(L, acc) { const B = baker(), LT = lights(), root = new THREE.Group(), body = new THREE.Group(), LIFT = 0.5, anim = [], H = L.hull, A = acc || L.accent, G = L.glow, HD = mix(H, GRAPH, 0.45), POD = mix(H, '#ffffff', 0.3), SEAM = mix(H, GRAPH, 0.25), AD = mix(A, GRAPH, 0.35);
    const prof = (hole) => { const w2 = 2.1, h2 = 1.5, r = 0.55, cy = 2.45, sh = new THREE.Shape(); sh.moveTo(-w2 + r, cy - h2); sh.lineTo(w2 - r, cy - h2); sh.quadraticCurveTo(w2, cy - h2, w2, cy - h2 + r); sh.lineTo(w2, cy + h2 - r); sh.quadraticCurveTo(w2, cy + h2, w2 - r, cy + h2); sh.lineTo(-w2 + r, cy + h2); sh.quadraticCurveTo(-w2, cy + h2, -w2, cy + h2 - r); sh.lineTo(-w2, cy - h2 + r); sh.quadraticCurveTo(-w2, cy - h2, -w2 + r, cy - h2);
      if (hole) { const p = new THREE.Path(); p.moveTo(-DW, DY0); p.lineTo(-DW, DY1); p.lineTo(DW, DY1); p.lineTo(DW, DY0); p.closePath(); sh.holes.push(p); } return sh; };
    const DW = 0.735, DY0 = 1.5, DY1 = 2.53, HZ0 = -6.5, HZ1 = 5.0;
    { const ex = new THREE.ExtrudeGeometry(prof(false), { depth: HZ1 - HZ0, bevelEnabled: false, curveSegments: low ? 4 : 8 }); const P0 = ex.attributes.position, gr = ex.groups.filter(q => q.materialIndex === 1), out = []; for (const q of gr) for (let i = q.start; i < q.start + q.count; i++) out.push(P0.getX(i), P0.getY(i), P0.getZ(i) + HZ0);
      const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(out, 3)); const nr = []; for (let i = 0; i < out.length; i += 3) { const x = out[i], y = out[i + 1] - 2.45, ix = Math.max(-1.55, Math.min(1.55, x)), iy = Math.max(-0.95, Math.min(0.95, y)); let nx = x - ix, ny = y - iy; const l = Math.hypot(nx, ny) || 1; nr.push(nx / l, ny / l, 0); } sg.setAttribute('normal', new THREE.Float32BufferAttribute(nr, 3)); B.add(sg, H, null, {}); ex.dispose();
      const fc = new THREE.ShapeGeometry(prof(false), low ? 4 : 8); fc.rotateY(Math.PI); fc.translate(0, 0, HZ0); B.add(fc, H, null, { out: 0 }); const rc = new THREE.ShapeGeometry(prof(true), low ? 4 : 8); rc.translate(0, 0, HZ1); B.add(rc, H, null, { out: 0 }); }
    B.rbox(1.0, 0.45, 9.6, 0.2, HD, [0, 4.05, 0.1]); B.box(1.04, 0.06, 9.5, A, [0, 4.29, 0.1], 0, { out: 0 });
    for (const s of [-1, 1]) { B.box(0.04, 0.5, 10.6, A, [s * 2.1, 3.05, -0.6], 0, { out: 0 }); B.box(0.04, 0.1, 10.6, AD, [s * 2.1, 2.68, -0.6], 0, { out: 0 }); B.box(0.035, 0.05, 11.0, SEAM, [s * 2.1, 1.75, -0.7], 0, { out: 0 });
      for (const z of [-4.4, -1.8, 0.8, 3.2]) B.box(0.035, 2.3, 0.05, SEAM, [s * 2.1, 2.3, z], 0, { out: 0 });
      for (let k = 0; k < 6; k++) B.box(0.03, 0.3, 0.42, WIN, [s * 2.11, 2.15, -3.6 + k * 1.5], 0, { glow: true }); }
    B.rbox(0.06, 1.7, 1.1, 0.04, SEAM, [-2.12, 1.95, -2.0], 0, { out: 0 }); B.box(0.05, 0.4, 0.5, GLASS, [-2.14, 2.35, -2.0], 0, { glow: true }); B.box(0.05, 0.12, 0.12, AMBER, [-2.14, 1.6, -1.6], 0, { glow: true });
    B.sph(2.1, H, [0, 2.55, -6.1], [1, 0.78, 1.55], { seg: 20 }); B.tor(1.72, 0.07, A, [0, 2.55, -7.1], 0, { seg: 28, tube: 4, s: [1, 0.78, 1], out: 0.02 }); B.sph(1.15, L.canopy, [0, 3.25, -8.0], [1, 0.55, 1.35], { t1: HP, seg: 16 });
    B.rbox(2.8, 1.15, 3.0, 0.45, H, [0, 4.3, -4.4]); B.box(2.5, 0.3, 0.05, GLASS, [0, 4.4, -5.92], 0, { glow: true }); for (const s of [-1, 1]) B.box(0.05, 0.28, 2.2, GLASS, [s * 1.41, 4.4, -4.3], 0, { glow: true }); B.box(2.84, 0.1, 3.04, A, [0, 4.82, -4.4], 0, { out: 0 });
    B.cyl(0.04, 0.05, 0.7, GRAPH2, [-0.8, 5.2, -3.8], 0, { seg: 6 }); B.sph(0.42, '#e8ecf2', [-0.8, 5.55, -3.8], 1, { t1: HP, rot: [-0.6, 0, 0], seg: 12 }); B.cyl(0.03, 0.03, 1.1, GRAPH2, [0.6, 5.4, -4.2], 0, { seg: 4 }); LT.add([0.6, 6.0, -4.2], RED, 1.0, 0.7);
    for (let k = 0; k < 7; k++) B.box(1.6, 0.32, 0.06, GRAPH2, [0, 4.45, 1.6 + k * 0.32], 0, { out: 0.02 });
    const engs = []; for (const s of [-1, 1]) { const x = s * 2.85; B.box(0.9, 0.35, 3.2, HD, [s * 2.35, 2.0, 0.8]); B.cap(0.85, 5.2, POD, [x, 1.9, 0.8], [HP, 0, 0], { seg: 16 }); for (const z of [-1.0, 2.4]) B.tor(0.87, 0.06, A, [x, 1.9, z], 0, { seg: 18, tube: 3, out: 0.02 }); B.box(0.05, 0.05, 4.4, G, [x, 2.78, 0.8], 0, { glow: true });
      B.lathe([[0.42, 0], [0.7, 0.12], [0.74, 0.7], [0.5, 0.82]], GRAPH2, [x, 1.9, 3.9], [HP, 0, 0], { seg: 14 }); B.tor(0.66, 0.04, G, [x, 1.9, 4.6], 0, { glow: true, seg: 18, tube: 3 }); B.cyl(0.44, 0.44, 0.02, G, [x, 1.9, 4.72], [HP, 0, 0], { glow: true, seg: 14 }); engs.push([x, 1.9, 4.8]);
      const w = new THREE.Shape(); w.moveTo(0, 0); w.lineTo(s * 2.4, -0.9); w.lineTo(s * 2.6, -1.7); w.lineTo(0, -3.0); w.closePath(); B.ext(w, 0.16, H, [s * 3.5, 2.3, 2.6], [HP, 0, 0], { bev: 0.04 }); B.box(0.12, 0.2, 0.9, A, [s * 6.05, 2.3, 0.9], 0, { out: 0.02 }); LT.add([s * 6.1, 2.3, 0.4], s > 0 ? GREEN : RED, 0.9, 0.8);
      const f = new THREE.Shape(); f.moveTo(0, 0); f.lineTo(1.5, 0); f.lineTo(2.1, 1.8); f.lineTo(1.4, 1.9); f.closePath(); B.ext(f, 0.12, A, [s * 1.3, 4.1, 2.6], [0, -HP, 0], { bev: 0.03 });
      B.lathe([[0.25, 0], [0.42, 0.1], [0.44, 0.45], [0.3, 0.52]], GRAPH2, [s * 0.9, 4.2, 4.5], [HP, 0, 0], { seg: 12 }); B.cyl(0.26, 0.26, 0.02, G, [s * 0.9, 4.2, 5.03], [HP, 0, 0], { glow: true, seg: 12 }); engs.push([s * 0.9, 4.2, 5.1]);
      for (const z of [-3.4, 3.0]) { B.cyl(0.13, 0.17, 0.95 - LIFT, GRAPH2, [s * 1.55, (0.95 + LIFT) / 2, z], 0, { seg: 8 }); B.tube([[s * 1.55, LIFT + 0.12, z], [s * 2.05, 0.95, z + 0.3 * Math.sign(-z)]], 0.06, HD, { rseg: 5 }); B.cyl(0.46, 0.52, 0.14, HD, [s * 1.55, LIFT + 0.07, z], 0, { seg: 12 }); B.box(0.3, 0.05, 0.3, AMBER, [s * 1.55, 0.93, z], 0, { glow: true }); }
      for (const z of [-1.2, 1.8]) { B.box(0.3, 0.06, 0.3, '#fff3c4', [s * 1.1, 0.93, z], 0, { glow: true }); LT.add([s * 1.1, 0.85, z], '#fff3c4', 0.8, 0); }
      LT.add([s * 3.7, 2.0, -1.6], s > 0 ? GREEN : RED, 0.9, 0.8); LT.add([s * (DW + 0.06), DY0 + 0.1, 5.08], AMBER, 0.5, 1.4, s); LT.add([s * (DW + 0.06), DY1, 5.08], AMBER, 0.5, 1.4, -s); }
    for (const s of [-1, 1]) B.box(0.1, 1.18, 0.08, A, [s * (DW + 0.05), 2.07, 5.04], 0, { out: 0 }); B.box(1.67, 0.1, 0.08, A, [0, DY1 + 0.05, 5.04], 0, { out: 0 }); B.box(1.4, 0.06, 0.04, WIN, [0, DY1 + 0.16, 5.03], 0, { glow: true }); for (let k = 0; k < 7; k++) B.box(0.18, 0.05, 0.03, k % 2 ? '#201e1d' : '#ffd23a', [-0.54 + k * 0.18, DY0 - 0.06, 5.03], 0, { out: 0 });
    const HB = B.bake('cargoHull'); body.add(HB); const RL = 2.4;
    const RB = baker(); RB.rbox(DW * 2, 0.1, RL, 0.03, HD, [0, -0.05, RL / 2]); for (let k = 0; k < 14; k++) RB.box(DW * 2 - 0.1, 0.02, 0.03, GRAPH2, [0, 0.005, 0.2 + k * 0.25], 0, { out: 0 }); for (const s of [-1, 1]) { RB.box(0.05, 0.015, RL - 0.1, '#ffd23a', [s * (DW - 0.06), 0.01, RL / 2], 0, { glow: true }); RB.box(0.04, 0.16, RL - 0.1, AD, [s * (DW - 0.02), 0.06, RL / 2], 0, { out: 0.01 }); } RB.box(DW * 2, 0.08, 0.05, A, [0, -0.06, RL - 0.02], 0, { out: 0.01 });
    const RBk = RB.bake('ramp'), hinge = new THREE.Group(); hinge.position.set(0, DY0, HZ1); hinge.add(RBk); body.add(hinge);
    const OPEN = Math.asin((DY0 - LIFT) / RL); let k = L.ramp ?? 1, want = k; const set = () => { hinge.rotation.x = -HP + (HP + OPEN) * (1 - Math.pow(1 - k, 2)); }; set();
    anim.push((t, dt) => { if (Math.abs(want - k) > 1e-3) { k += Math.sign(want - k) * Math.min(Math.abs(want - k), (dt || 0.016) * 0.55); set(); } });
    const api = { thrust: 0, boost: false, guns: [], engines: engs.map(p => { const o = new THREE.Object3D(); o.position.set(...p); body.add(o); return o; }), setThrust(v) { api.thrust = v; }, setRamp(v) { want = clamp01(v); }, snapRamp(v) { k = want = clamp01(v); set(); }, get ramp() { return k; }, rampFoot: [0, 0, HZ1 + Math.cos(OPEN) * RL], dims: { floor: DY0 - LIFT, doorW: DW, doorH: DY1 - DY0, hinge: HZ1, front: HZ0, rampLen: RL, open: OPEN }, ink: [HB, RBk].map(G2 => G2.children.find(m => m.material === MAT.ink)).filter(Boolean), look: L };
    body.position.y = -LIFT; root.add(body); const pts = LT.make(); if (pts) body.add(pts); return { root, pts, anim, hit: 7.2, api }; }
  // s550 SHUTTLE (Ben): the first WALK-IN ship in the new style. Units: interior floor y 0.45, hull x ±1.0, z -1.9..1.9; at scale 4.2 the inside is 8.4 x 16 m, 4.2 m tall.
  // From inside the hull is invisible (single-sided, faces out) so the interior's own windows look out at the world; api.plug darkens the door hole when there is no interior (workshop).
  // s557b (Ben: "the same colouring as the player ship"): every colour the shuttle has NOT edited follows YOUR SHIP's saved look (hull, spine + wings, wing edge glow, crest pulse)
  function shipColours(L, T = 'hullShuttle') { let SH = {}; try { SH = JSON.parse(localStorage.getItem(KEY) || '{}').ship || {}; } catch (e) {} const sd = defaults('ship'), md = defaults(T), pick = (k, sk) => (L[k] !== md[k] ? L[k] : (SH[sk] ?? sd[sk]));
    return { ...L, hull: pick('hull', 'hull'), accent: pick('accent', 'accent'), edge: pick('edge', 'engine'), crestGlow: pick('crestGlow', 'crestGlow'), pulse: L.pulse !== md.pulse ? L.pulse : (SH.pulse ?? sd.pulse) }; }
  function hullShuttle(L0, acc0) { const L = shipColours(L0), acc = L0.worldTint && acc0 !== L0.accent ? acc0 : L.accent; const B = baker(), LT = lights(), root = new THREE.Group(), body = new THREE.Group(), LIFT = 0.12, anim = [], H = L.hull, A = acc || L.accent, AL = mix(A, '#ffffff', 0.28), EDGE = L.edge || '#7fd0ff', G = L.glow, HD = mix(H, GRAPH, 0.45), POD = mix(H, '#ffffff', 0.25), DG = mix(GLASS, '#0a1420', 0.78);
    const ENG = []; const W2 = 1.0, H2 = 0.55, CY = 0.9, RD = 0.3, HZ0 = -1.9, HZ1 = 1.9, DY0 = 0.45, DW = 0.38, DY1 = 1.15;
    const rect = (holes) => { const sh = new THREE.Shape(); sh.moveTo(-W2 + RD, CY - H2); sh.lineTo(W2 - RD, CY - H2); sh.quadraticCurveTo(W2, CY - H2, W2, CY - H2 + RD); sh.lineTo(W2, CY + H2 - RD); sh.quadraticCurveTo(W2, CY + H2, W2 - RD, CY + H2); sh.lineTo(-W2 + RD, CY + H2); sh.quadraticCurveTo(-W2, CY + H2, -W2, CY + H2 - RD); sh.lineTo(-W2, CY - H2 + RD); sh.quadraticCurveTo(-W2, CY - H2, -W2 + RD, CY - H2);
      for (const [x0, x1, y0, y1] of holes || []) { const p = new THREE.Path(); p.moveTo(x0, y0); p.lineTo(x0, y1); p.lineTo(x1, y1); p.lineTo(x1, y0); p.closePath(); sh.holes.push(p); } return sh; };
    const NL = 1.15, CSG = low ? 3 : 5, NR = low ? 6 : 10;
    const prof = u => { const w = W2 - 0.42 * u * u, yb = CY - H2 + 0.1 * u * u, yt = CY + H2 - 0.32 * Math.pow(u, 1.6), r = Math.min(RD + 0.06 * u, (yt - yb) / 2 - 0.01, w - 0.01), z = HZ0 - NL * Math.sin(u * HP); return { w, yb, yt, r, z }; };
    const ring = u => { const p = prof(u), pts = [], arc = (cx, cy, a0) => { for (let i = 0; i <= CSG; i++) { const a2 = a0 + i / CSG * HP; pts.push([cx + Math.cos(a2) * p.r, cy + Math.sin(a2) * p.r]); } }, ym = (p.yb + p.yt) / 2 + 0.06;
      arc(p.w - p.r, p.yb + p.r, -HP); pts.push([p.w, ym]); arc(p.w - p.r, p.yt - p.r, 0); arc(-(p.w - p.r), p.yt - p.r, HP); pts.push([-p.w, ym]); arc(-(p.w - p.r), p.yb + p.r, Math.PI); return { p, pts }; };
    const BAND = [CSG + 1, 3 * CSG + 4];   // ring indices of the glass band: the mid-right point → over the top → the mid-left point
    const loft = (u0, u1, i0, i1, push = 0) => { const rows = []; for (let k = 0; k <= NR; k++) { const u = u0 + (u1 - u0) * k / NR, R2 = ring(u), cyy = (R2.p.yb + R2.p.yt) / 2, row = []; const n = R2.pts.length, idx = i1 == null ? [...Array(n).keys(), 0] : Array.from({ length: i1 - i0 + 1 }, (_, j) => i0 + j); for (const j of idx) { const [x, y] = R2.pts[j % n]; row.push([x * (1 + push), cyy + (y - cyy) * (1 + push), R2.p.z]); } rows.push(row); }
      const pos = [], ind = [], m2 = rows[0].length; rows.forEach(r => r.forEach(q => pos.push(...q))); for (let k = 0; k < NR; k++) for (let j = 0; j < m2 - 1; j++) { const A0 = k * m2 + j, B0 = A0 + 1, C0 = A0 + m2, D0 = C0 + 1; ind.push(A0, C0, B0, B0, C0, D0); }
      const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setIndex(ind); gg.computeVertexNormals(); const N0 = gg.attributes.normal; let top = 0; for (let i = 0; i < N0.count; i++) if (pos[i * 3 + 1] > 1.2) { top += N0.getY(i); } if (top < 0) { ind.length = 0; for (let k = 0; k < NR; k++) for (let j = 0; j < m2 - 1; j++) { const A0 = k * m2 + j, B0 = A0 + 1, C0 = A0 + m2, D0 = C0 + 1; ind.push(A0, B0, C0, B0, D0, C0); } gg.setIndex(ind); gg.computeVertexNormals(); } return gg; };
    { const nP = ring(0).pts.length; B.add(loft(0, 1, BAND[1], BAND[0] + nP), H, null, { out: 0.05 }); B.add(loft(0, 0.28, BAND[0], BAND[1]), H, null, { out: 0.05 }); B.add(loft(0.97, 1, BAND[0], BAND[1]), H, null, { out: 0.05 }); }   // s571: a real window hole under the glass band (the pilot fox shows through)
    const GB = glassBaker(); GB.add(loft(0.28, 0.97, BAND[0], BAND[1], 0.012), DG, null, { glow: true, out: 0 }); B.add(loft(0.26, 0.28, 0, null, 0.016), A, null, { out: 0 });
    { const R1 = ring(1), sh = new THREE.Shape(); R1.pts.forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y)); const cap = new THREE.ShapeGeometry(sh); cap.rotateY(Math.PI); cap.translate(0, 0, R1.p.z); B.add(cap, H, null, { out: 0 }); B.cyl(0.16, 0.18, 0.04, G, [0, 0.66, R1.p.z - 0.01], [HP, 0, 0], { glow: true, seg: 16 }); B.tor(0.19, 0.025, A, [0, 0.66, R1.p.z - 0.01], 0, { seg: 16, tube: 3, out: 0.01 }); }
    for (const sgn of [-1, 1]) { const pts2 = []; for (let k = 0; k <= 8; k++) { const u = k / 8, p = prof(u); pts2.push([sgn * (p.w + 0.004), (p.yb + p.yt) / 2 - 0.12, p.z]); } B.tube(pts2, 0.022, A, { rseg: 4, caps: false }); }
    { const ex = new THREE.ExtrudeGeometry(rect(), { depth: HZ1 - HZ0, bevelEnabled: false, curveSegments: low ? 4 : 8 }), P0 = ex.attributes.position, out = []; for (const q of ex.groups.filter(q => q.materialIndex === 1)) for (let i = q.start; i < q.start + q.count; i++) out.push(P0.getX(i), P0.getY(i), P0.getZ(i) + HZ0);
      const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(out, 3)); const nr = []; for (let i = 0; i < out.length; i += 3) { const x = out[i], y = out[i + 1] - CY, ix = Math.max(-(W2 - RD), Math.min(W2 - RD, x)), iy = Math.max(-(H2 - RD), Math.min(H2 - RD, y)); let nx = x - ix, ny = y - iy; const l = Math.hypot(nx, ny) || 1; nr.push(nx / l, ny / l, 0); } sg.setAttribute('normal', new THREE.Float32BufferAttribute(nr, 3)); B.add(sg, H, null, {}); ex.dispose();
      const rc = new THREE.ShapeGeometry(rect([[-DW, DW, DY0, DY1]]), low ? 4 : 8); rc.translate(0, 0, HZ1); B.add(rc, H, null, { out: 0 });
      for (const s of [-1, 1]) for (const [z0, z1, y0, y1] of [[-1.62, -1.24, 0.78, 1.02], [-0.19, 0.19, 0.81, 1.05]]) B.add(new THREE.PlaneGeometry(z1 - z0, y1 - y0), DG, mat4([s * (W2 - 0.02), (y0 + y1) / 2, (z0 + z1) / 2], [0, s * HP, 0]), { glow: true, out: 0 }); }
    for (const s of [-1, 1]) { B.box(0.02, 0.16, 3.6, A, [s * (W2 + 0.005), 0.62, 0], 0, { out: 0 }); B.box(0.02, 0.04, 3.6, mix(A, GRAPH, 0.35), [s * (W2 + 0.005), 0.52, 0], 0, { out: 0 }); for (const z of [-0.9, 0.9]) B.box(0.015, 0.95, 0.03, mix(H, GRAPH, 0.25), [s * (W2 + 0.004), 0.9, z], 0, { out: 0 });
      const x = s * 1.36; B.box(0.42, 0.08, 0.8, HD, [s * 1.12, 0.6, 0.45]); B.cap(0.17, 2.0, POD, [x, 0.64, 0.4], [HP, 0, 0], { seg: 14 }); B.box(0.03, 0.07, 1.8, G, [x - s * 0.165, 0.64, 0.45], 0, { glow: true }); B.box(0.18, 0.025, 1.8, G, [x, 0.815, 0.45], 0, { glow: true });
      B.sph(0.15, '#ff5a3a', [x, 0.64, -0.78], 1, { glow: true, seg: 12 }); B.tor(0.17, 0.03, A, [x, 0.64, -0.62], 0, { seg: 16, tube: 3, out: 0.02 }); B.cyl(0.13, 0.13, 0.02, G, [x, 0.64, 1.58], [HP, 0, 0], { glow: true, seg: 12 });
      LT.add([x, 0.64, -0.95], s > 0 ? GREEN : RED, 0.5, 0.8); LT.add([s * (DW + 0.05), DY0 + 0.05, HZ1 + 0.03], AMBER, 0.35, 1.4, s);
      for (const z of [-1.3, 1.3]) { B.cyl(0.04, 0.05, 0.35 - LIFT, GRAPH2, [s * 0.7, (0.35 + LIFT) / 2, z], 0, { seg: 6 }); B.cyl(0.13, 0.15, 0.04, HD, [s * 0.7, LIFT + 0.02, z], 0, { seg: 10 }); } }
    // s557 (Ben): small swept WINGS low on the hull (the player ship's two-tone: accent with a lighter inner band + a glowing cyan leading edge) + twin GUNS on the wing tips
    // s558 (Ben): WING SHAPE (swept / delta / straight / forward / none) + WING SPAN + WING SIZE + WING HEIGHT in the workshop. Guns sit on the tips.
    const WSH = L.wingShape || 'swept', SPN = L.wingSpan ?? 1, WSZ = L.wingSize ?? 1, WY = 0.41 + (L.wingY ?? 0) * 0.35, guns = [];
    const PL = { swept: [[0, -0.25], [1.2, 0.7], [1.2, 1.08], [0, 1.3]], delta: [[0, -0.6], [1.15, 1.05], [1.15, 1.25], [0, 1.35]], straight: [[0, 0.15], [1.2, 0.3], [1.2, 0.95], [0, 1.15]], forward: [[0, 0.2], [1.2, -0.35], [1.2, 0.05], [0, 1.25]] }[WSH];
    if (PL) for (const s2 of [-1, 1]) { const pts = PL.map(([x, z]) => [x * SPN * WSZ, z * WSZ]), cz = 0.55 * (1 - WSZ), w = new THREE.Shape(); pts.forEach(([x, z], i) => i ? w.lineTo(s2 * x, z + cz) : w.moveTo(s2 * x, z + cz)); w.closePath(); B.ext(w, 0.07 * Math.min(1.3, WSZ), L.wingCol || A, [s2 * 0.97, WY, 0], [HP, 0, 0], { bev: 0.025 });
      const ins = pts.map(([x, z], i) => [x * 0.7, (i === 0 ? z + 0.35 * WSZ : z) * 0.92 + 0.06]), w2 = new THREE.Shape(); ins.forEach(([x, z], i) => i ? w2.lineTo(s2 * x, z + cz) : w2.moveTo(s2 * x, z + cz)); w2.closePath(); B.ext(w2, 0.02, AL, [s2 * 0.98, WY + 0.05 * Math.min(1.3, WSZ), 0], [HP, 0, 0], { bev: 0.01, out: 0 });
      const le0 = pts[0], le1 = pts[1]; B.tube([[s2 * (0.99 + le0[0]), WY + 0.04, le0[1] + cz], [s2 * (0.97 + le1[0]), WY + 0.04, le1[1] + cz]], 0.026, EDGE, { glow: true, rseg: 4, caps: false });
      const tipX = s2 * (0.97 + pts[1][0] + 0.03), tipZ = (pts[1][1] + pts[2][1]) / 2 + cz; B.cyl(0.06, 0.07, 0.62, HD, [tipX, WY, tipZ], [HP, 0, 0], { seg: 10 }); B.cyl(0.03, 0.035, 0.75, '#cfd4de', [tipX, WY, tipZ - 0.66], [HP, 0, 0], { seg: 8, out: 0.015 }); B.cyl(0.025, 0.025, 0.02, EDGE, [tipX, WY, tipZ - 1.04], [HP, 0, 0], { glow: true, seg: 8 }); guns.push([tipX, WY - LIFT, tipZ - 1.08]);
      LT.add([tipX, WY + 0.09, tipZ + 0.29], s2 > 0 ? GREEN : RED, 0.45, 0.8, s2); }
    else for (const s2 of [-1, 1]) { guns.push([s2 * 1.36, 0.64 - LIFT, -0.95]); }
    const WREACH = PL ? 0.97 + Math.max(...PL.map(q => q[0])) * SPN * WSZ + 0.12 : 1.56;
    B.rbox(1.1, 0.16, 2.8, 0.07, HD, [0, 1.5, 0.15]); for (const z of [-1.3, 1.5]) B.box(0.7, 0.03, 0.4, A, [0, 1.585, z], 0, { out: 0 }); for (const s2 of [-1, 1]) B.box(0.06, 0.035, 2.7, AL, [s2 * 0.5, 1.585, 0.15], 0, { out: 0 }); B.sph(0.16, GLASS, [0, 1.56, -1.05], 1, { t1: HP, seg: 12 }); B.rbox(0.5, 0.08, 0.7, 0.03, HD, [0, 1.47, -1.75]); LT.add([0, 1.72, 1.72], '#ffffff', 0.5, 0.9);
    B.box(1.2, 0.12, 0.03, G, [0, 1.3, HZ1 + 0.01], 0, { glow: true }); for (const s of [-1, 1]) B.box(0.06, DY1 - DY0 + 0.1, 0.05, A, [s * (DW + 0.04), (DY0 + DY1) / 2, HZ1 + 0.02], 0, { out: 0 }); B.box(DW * 2 + 0.14, 0.06, 0.05, A, [0, DY1 + 0.03, HZ1 + 0.02], 0, { out: 0 });
    // s554 THE 8 CREST (Ben: like the player ship): a raised round plate on the roof spine, the 8 decal, and the same breathing pulse (an inverted crest fades in + out)
    if (L.emblem !== false) { const Rc = L.crestSize ?? 0.88, cz = 0.3, cy = 1.6, P2 = baker(); P2.lathe([[0, -0.03], [Rc * 0.9, -0.02], [Rc + 0.03, 0.02], [Rc + 0.02, 0.06], [Rc * 0.9, 0.075], [0, 0.075]], H, [0, cy, cz], 0, { seg: 40, out: 0.03 }); P2.tor(Rc + 0.022, 0.018, A, [0, cy + 0.04, cz], [HP, 0, 0], { seg: 40, tube: 4, out: 0 }); body.add(P2.bake('crestPlate'));
      const N = 256, h2 = N / 2, mk = inv => { const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), rg = g.createRadialGradient(h2 * 0.9, h2 * 0.76, 4, h2, h2, h2 * 0.9), gc = new THREE.Color(L.crestGlow || '#5fd4ff');
        if (inv) { rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.45, '#' + gc.clone().lerp(new THREE.Color('#ffffff'), 0.35).getHexString()); rg.addColorStop(1, '#' + gc.getHexString()); } else { { const cp = L.crestPlate || ['#8fa8c8', '#44618c', '#1c2a42']; rg.addColorStop(0, cp[0]); rg.addColorStop(0.62, cp[1]); rg.addColorStop(1, cp[2]); } }
        g.beginPath(); g.arc(h2, h2, h2 * 0.9, 0, TAU); g.fillStyle = rg; g.fill(); g.lineWidth = N * 0.035; g.strokeStyle = '#231d3c'; g.stroke(); g.font = '900 ' + Math.round(N * 0.74) + 'px Archivo, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = N * 0.06;
        g.strokeStyle = inv ? '#ffffff' : '#141a2c'; g.strokeText(L.crestText || '8', h2, h2 * 1.07); g.fillStyle = inv ? '#141a2c' : (L.crestInk || '#ffffff'); g.fillText(L.crestText || '8', h2, h2 * 1.07); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
      const dg = new THREE.CircleGeometry(Rc * 0.86, SEG(40)), d1 = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ map: mk(false), transparent: true, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false })), d2 = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ map: mk(true), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, toneMapped: false }));
      for (const [m, y] of [[d1, 0.077], [d2, 0.079]]) { m.rotation.x = -HP; m.position.set(0, cy + y, cz); body.add(m); } anim.push(t => { const p = Math.max(0, Math.sin(t * 1.6 * (L.pulse ?? 1.2) / 1.2)); d2.material.opacity = Math.pow(p, 3) * 0.95; }); }
    B.cyl(0.3, 0.37, 0.18, HD, [0, CY + H2 + 0.07, 1.52], 0, { seg: 20 }); B.tor(0.31, 0.02, A, [0, CY + H2 + 0.15, 1.52], [HP, 0, 0], { seg: 20, tube: 3, out: 0 });   // pedestal, so the turret clears the crest plate
    const MT = mannedTurret(body, anim, LT, guns, { TY: CY + H2 + 0.16, TZ: 1.52, TS: 0.62, A, HD, G, EDGE, LIFT });   // s572 the shuttle's mini turret, on the roof behind the crest
    const RTG = rearThrusters(B, body, anim, ENG, { X: W2 - 0.24, Y: CY + 0.12, Z: HZ1, R: 0.15, A, HD, G });   // s575 the rear thrusters
    const HB = B.bake('shuttleHull'); body.add(HB); body.add(GB.bake('bandGlass')); const RL = 0.8;
    const PB = baker(); PB.add(new THREE.PlaneGeometry(DW * 2, DY1 - DY0), '#15171c', mat4([0, (DY0 + DY1) / 2, HZ1 - 0.04]), { glow: true, out: 0 }); const plug = PB.bake('plug'); body.add(plug);
    const RB = baker(); RB.rbox(DW * 2, 0.05, RL, 0.02, HD, [0, -0.025, RL / 2]); for (let k = 0; k < 5; k++) RB.box(DW * 2 - 0.06, 0.012, 0.02, GRAPH2, [0, 0.003, 0.1 + k * 0.15], 0, { out: 0 }); for (const s of [-1, 1]) RB.box(0.03, 0.01, RL - 0.06, '#ffd23a', [s * (DW - 0.04), 0.004, RL / 2], 0, { glow: true });
    const RBk = RB.bake('ramp'), hinge = new THREE.Group(); hinge.position.set(0, DY0, HZ1); hinge.add(RBk); body.add(hinge);
    const OPEN = Math.asin((DY0 - LIFT) / RL); let k = L.ramp ?? 1, want = k; const set = () => { hinge.rotation.x = -HP + (HP + OPEN) * (1 - Math.pow(1 - k, 2)); }; set();
    anim.push((t, dt) => { if (Math.abs(want - k) > 1e-3) { k += Math.sign(want - k) * Math.min(Math.abs(want - k), (dt || 0.016) * 0.8); set(); } });
    anim.push(() => { const k = 0.6 + (api.thrust || 0) * 0.9 + (api.boost ? 0.8 : 0); RTG.forEach(sp => sp.scale.setScalar(0.42 * k)); });
    const api = { thrust: 0, boost: false, guns, engines: ENG, setThrust(v) { api.thrust = v; }, setRamp(v) { want = clamp01(v); }, snapRamp(v) { k = want = clamp01(v); set(); }, get ramp() { return k; }, rampFoot: [0, 0, HZ1 + Math.cos(OPEN) * RL],
      dims: { floor: DY0 - LIFT, doorW: DW, doorH: DY1 - DY0, hinge: HZ1, front: HZ0, rampLen: RL, open: OPEN, clear: 0.35 - LIFT, turret: [0, 1.52], legs: [[-0.7, -1.3, 0.05], [0.7, -1.3, 0.05], [-0.7, 1.3, 0.05], [0.7, 1.3, 0.05]], solids: [[-WREACH, -1.0, -1.0, 1.65], [1.0, WREACH, -1.0, 1.65]], noseLen: NL, Y0: DY0 }, prof, ring, BAND, plug, turret: MT.api, ink: [HB, RBk, MT.tb, MT.pb].map(G2 => G2.children.find(m => m.material === MAT.ink)).filter(Boolean), look: L };
    body.position.y = -LIFT; root.add(body); const pts = LT.make(); if (pts) body.add(pts); return { root, pts, anim, hit: 2.6, api }; }
  function hullCorvette(L0, acc0) { const L = shipColours(L0, 'hullCorvette'), acc = L0.worldTint && acc0 !== L0.accent ? acc0 : L.accent; const B = baker(), LT = lights(), root = new THREE.Group(), body = new THREE.Group(), LIFT = 0.12, anim = [], H = L.hull, A = acc || L.accent, AL = mix(A, '#ffffff', 0.28), EDGE = L.edge || '#7fd0ff', G = L.glow, HD = mix(H, GRAPH, 0.45), POD = mix(H, '#ffffff', 0.25), DG = mix(GLASS, '#0a1420', 0.78);
    const ENG = []; const W2 = 1.05, H2 = 0.52, CY = 0.9, RD = 0.42, HZ0 = -2.4, HZ1 = 1.6, DY0 = 0.45, DW = 0.38, DY1 = 1.15;
    const rect = (holes) => { const sh = new THREE.Shape(); sh.moveTo(-W2 + RD, CY - H2); sh.lineTo(W2 - RD, CY - H2); sh.quadraticCurveTo(W2, CY - H2, W2, CY - H2 + RD); sh.lineTo(W2, CY + H2 - RD); sh.quadraticCurveTo(W2, CY + H2, W2 - RD, CY + H2); sh.lineTo(-W2 + RD, CY + H2); sh.quadraticCurveTo(-W2, CY + H2, -W2, CY + H2 - RD); sh.lineTo(-W2, CY - H2 + RD); sh.quadraticCurveTo(-W2, CY - H2, -W2 + RD, CY - H2);
      for (const [x0, x1, y0, y1] of holes || []) { const p = new THREE.Path(); p.moveTo(x0, y0); p.lineTo(x0, y1); p.lineTo(x1, y1); p.lineTo(x1, y0); p.closePath(); sh.holes.push(p); } return sh; };
    const NL = 1.4, CSG = low ? 3 : 5, NR = low ? 6 : 10;
    const prof = u => { const w = W2 - 0.55 * u * u, yb = CY - H2 + 0.1 * u * u, yt = CY + H2 - 0.32 * Math.pow(u, 1.6), r = Math.min(RD + 0.06 * u, (yt - yb) / 2 - 0.01, w - 0.01), z = HZ0 - NL * Math.sin(u * HP); return { w, yb, yt, r, z }; };
    const ring = u => { const p = prof(u), pts = [], arc = (cx, cy, a0) => { for (let i = 0; i <= CSG; i++) { const a2 = a0 + i / CSG * HP; pts.push([cx + Math.cos(a2) * p.r, cy + Math.sin(a2) * p.r]); } }, ym = (p.yb + p.yt) / 2 + 0.06;
      arc(p.w - p.r, p.yb + p.r, -HP); pts.push([p.w, ym]); arc(p.w - p.r, p.yt - p.r, 0); arc(-(p.w - p.r), p.yt - p.r, HP); pts.push([-p.w, ym]); arc(-(p.w - p.r), p.yb + p.r, Math.PI); return { p, pts }; };
    const BAND = [CSG + 1, 3 * CSG + 4];   // ring indices of the glass band: the mid-right point → over the top → the mid-left point
    const loft = (u0, u1, i0, i1, push = 0) => { const rows = []; for (let k = 0; k <= NR; k++) { const u = u0 + (u1 - u0) * k / NR, R2 = ring(u), cyy = (R2.p.yb + R2.p.yt) / 2, row = []; const n = R2.pts.length, idx = i1 == null ? [...Array(n).keys(), 0] : Array.from({ length: i1 - i0 + 1 }, (_, j) => i0 + j); for (const j of idx) { const [x, y] = R2.pts[j % n]; row.push([x * (1 + push), cyy + (y - cyy) * (1 + push), R2.p.z]); } rows.push(row); }
      const pos = [], ind = [], m2 = rows[0].length; rows.forEach(r => r.forEach(q => pos.push(...q))); for (let k = 0; k < NR; k++) for (let j = 0; j < m2 - 1; j++) { const A0 = k * m2 + j, B0 = A0 + 1, C0 = A0 + m2, D0 = C0 + 1; ind.push(A0, C0, B0, B0, C0, D0); }
      const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setIndex(ind); gg.computeVertexNormals(); const N0 = gg.attributes.normal; let top = 0; for (let i = 0; i < N0.count; i++) if (pos[i * 3 + 1] > 1.2) { top += N0.getY(i); } if (top < 0) { ind.length = 0; for (let k = 0; k < NR; k++) for (let j = 0; j < m2 - 1; j++) { const A0 = k * m2 + j, B0 = A0 + 1, C0 = A0 + m2, D0 = C0 + 1; ind.push(A0, B0, C0, B0, D0, C0); } gg.setIndex(ind); gg.computeVertexNormals(); } return gg; };
    { const nP = ring(0).pts.length; B.add(loft(0, 1, BAND[1], BAND[0] + nP), H, null, { out: 0.05 }); B.add(loft(0, 0.28, BAND[0], BAND[1]), H, null, { out: 0.05 }); B.add(loft(0.97, 1, BAND[0], BAND[1]), H, null, { out: 0.05 }); }   // s571: a real window hole under the glass band (the pilot fox shows through)
    const GB = glassBaker(); GB.add(loft(0.28, 0.97, BAND[0], BAND[1], 0.012), DG, null, { glow: true, out: 0 }); B.add(loft(0.26, 0.28, 0, null, 0.016), A, null, { out: 0 });
    { const R1 = ring(1), sh = new THREE.Shape(); R1.pts.forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y)); const cap = new THREE.ShapeGeometry(sh); cap.rotateY(Math.PI); cap.translate(0, 0, R1.p.z); B.add(cap, H, null, { out: 0 }); B.cyl(0.16, 0.18, 0.04, G, [0, 0.66, R1.p.z - 0.01], [HP, 0, 0], { glow: true, seg: 16 }); B.tor(0.19, 0.025, A, [0, 0.66, R1.p.z - 0.01], 0, { seg: 16, tube: 3, out: 0.01 }); }
    for (const sgn of [-1, 1]) { const pts2 = []; for (let k = 0; k <= 8; k++) { const u = k / 8, p = prof(u); pts2.push([sgn * (p.w + 0.004), (p.yb + p.yt) / 2 - 0.12, p.z]); } B.tube(pts2, 0.022, A, { rseg: 4, caps: false }); }
    // s561 (Ben: "make the corvette look different from the shuttle, the middle tube area"): a LOFTED, BULGING hull (a fat elliptical waist + a raised dorsal hump, back to the shuttle-family
    // section at both ends so the nose + rear door still fit), armoured SPONSONS on the lower flanks, dark CHEVRON panels, window bubbles, a dorsal RIDGE, a glowing IMPULSE DECK over the door.
    const BW = 0.24, HUMP = 0.2, NB = low ? 10 : 18, bp = t => { const k = Math.sin(Math.PI * Math.pow(t, 0.85)), z = HZ0 + (HZ1 - HZ0) * t; return { w: W2 + BW * k, yb: CY - H2 - 0.04 * k, yt: CY + H2 + HUMP * Math.pow(k, 1.3), r: RD + 0.12 * k, z }; };
    const ringOf = p => { const pts = [], arc = (cx, cy, a0) => { for (let i = 0; i <= CSG; i++) { const a2 = a0 + i / CSG * HP; pts.push([cx + Math.cos(a2) * p.r, cy + Math.sin(a2) * p.r]); } }, ym = (p.yb + p.yt) / 2 + 0.06; arc(p.w - p.r, p.yb + p.r, -HP); pts.push([p.w, ym]); arc(p.w - p.r, p.yt - p.r, 0); arc(-(p.w - p.r), p.yt - p.r, HP); pts.push([-p.w, ym]); arc(-(p.w - p.r), p.yb + p.r, Math.PI); return pts; };
    { const rows = []; for (let k = 0; k <= NB; k++) { const p = bp(k / NB), R2 = ringOf(p); rows.push([...R2, R2[0]].map(([x, y]) => [x, y, p.z])); }
      const pos = [], ind = [], m2 = rows[0].length; rows.forEach(r => r.forEach(q => pos.push(...q))); for (let k = 0; k < NB; k++) for (let j = 0; j < m2 - 1; j++) { const A0 = k * m2 + j; ind.push(A0, A0 + m2, A0 + 1, A0 + 1, A0 + m2, A0 + m2 + 1); }
      const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setIndex(ind); gg.computeVertexNormals(); { const N0 = gg.attributes.normal; let top = 0; for (let i = 0; i < N0.count; i++) if (pos[i * 3 + 1] > 1.3) top += N0.getY(i); if (top < 0) { const i2 = []; for (let q = 0; q < ind.length; q += 3) i2.push(ind[q], ind[q + 2], ind[q + 1]); gg.setIndex(i2); gg.computeVertexNormals(); } } B.add(gg, H, null, { out: 0.05 });
      const rc = new THREE.ShapeGeometry(rect([[-DW, DW, DY0, DY1]]), low ? 4 : 8); rc.translate(0, 0, HZ1); B.add(rc, H, null, { out: 0 }); }
    const wAt = t => bp(t).w, tOf = z => (z - HZ0) / (HZ1 - HZ0);
    for (const sg of [-1, 1]) { const line = (y0, off, c, rad) => { const pts = []; for (let k = 0; k <= 12; k++) { const t = 0.02 + 0.96 * k / 12, p = bp(t); pts.push([sg * (p.w + off), y0(p), p.z]); } B.tube(pts, rad, c, { rseg: 4, caps: false }); };
      line(p => (p.yb + p.yt) / 2 + 0.02, 0.012, A, 0.05); line(p => (p.yb + p.yt) / 2 - 0.09, 0.01, mix(A, GRAPH, 0.35), 0.02);
      for (const [t0, t1, yy] of [[0.12, 0.3, 1.02], [0.42, 0.62, 1.04], [0.72, 0.86, 1.0]]) { const pts = []; for (let k = 0; k <= 4; k++) { const t = t0 + (t1 - t0) * k / 4, p = bp(t); pts.push([sg * (p.w - 0.01), yy, p.z]); } B.tube(pts, 0.11, DG, { rseg: 6, caps: true }); }
      for (let k = 0; k < 4; k++) { const t = 0.18 + k * 0.18, p = bp(t), sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.22, 0.14); sh.lineTo(0.22, 0.24); sh.lineTo(0, 0.1); sh.closePath(); B.ext(sh, 0.015, mix(H, GRAPH, 0.55), [sg * (p.w + 0.004), 0.68, p.z + 0.1], [0, sg > 0 ? HP : -HP, 0], { bev: 0.004, out: 0 }); }
      B.cap(0.17, 3.0, mix(H, GRAPH, 0.18), [sg * (wAt(0.5) - 0.02), 0.5, -0.35], [HP, 0, 0], { seg: 14, s: [1, 0.75, 1] }); B.box(0.03, 0.05, 2.9, G, [sg * (wAt(0.5) + 0.13), 0.54, -0.35], 0, { glow: true }); for (const z of [-1.6, 0.9]) B.tor(0.172, 0.02, A, [sg * (wAt(0.5) - 0.02), 0.5, z], 0, { seg: 14, tube: 3, out: 0.01, s: [1, 0.75, 1] }); }
    { const rd = new THREE.Shape(); rd.moveTo(0, 0); rd.lineTo(2.6, 0); rd.lineTo(2.3, 0.14); rd.lineTo(0.5, 0.14); rd.closePath(); B.ext(rd, 0.05, A, [0, CY + H2 + HUMP - 0.02, 1.0], [0, HP, 0], { bev: 0.015 }); }
    B.rbox(1.6, 0.22, 0.42, 0.09, HD, [0, 1.25, HZ1 - 0.05]); B.box(1.42, 0.08, 0.03, '#ff6a3a', [0, 1.25, HZ1 + 0.17], 0, { glow: true }); for (const s2 of [-1, 1]) B.box(0.22, 0.12, 0.03, '#ff9a5a', [s2 * 0.6, 1.25, HZ1 + 0.185], 0, { glow: true });
    for (const s of [-1, 1]) {
      const x = s * 1.66, ny = 1.2; { const py = new THREE.Shape(); py.moveTo(0, 0); py.lineTo(s * 0.5, 0.2); py.lineTo(s * 0.5, 0.75); py.lineTo(0, 1.05); py.closePath(); B.ext(py, 0.06, HD, [s * (wAt(0.6) - 0.08), 1.0, 0.25], [HP, 0, s * 0.35], { bev: 0.02 }); } B.cap(0.15, 2.9, POD, [x, ny, 0.45], [HP, 0, 0], { seg: 16, s: [1, 0.8, 1] }); B.box(0.03, 0.06, 2.6, G, [x - s * 0.15, ny, 0.5], 0, { glow: true }); B.box(0.16, 0.02, 2.6, G, [x, ny + 0.12, 0.5], 0, { glow: true });
      B.sph(0.14, '#ff5a3a', [x, ny, -1.15], [1, 0.8, 1.3], { glow: true, seg: 12 }); B.tor(0.155, 0.028, A, [x, ny, -0.95], 0, { seg: 16, tube: 3, out: 0.02, s: [1, 0.8, 1] }); B.cyl(0.11, 0.11, 0.02, G, [x, ny, 2.06], [HP, 0, 0], { glow: true, seg: 12 });
      LT.add([x, ny, -1.35], s > 0 ? GREEN : RED, 0.5, 0.8); LT.add([s * (DW + 0.05), DY0 + 0.05, HZ1 + 0.03], AMBER, 0.35, 1.4, s);
      for (const z of [-1.8, 1.1]) { B.cyl(0.045, 0.055, 0.38 - LIFT, GRAPH2, [s * 0.75, (0.38 + LIFT) / 2, z], 0, { seg: 6 }); B.cyl(0.14, 0.16, 0.04, HD, [s * 0.75, LIFT + 0.02, z], 0, { seg: 10 }); } }
    // s557 (Ben): small swept WINGS low on the hull (the player ship's two-tone: accent with a lighter inner band + a glowing cyan leading edge) + twin GUNS on the wing tips
    // s558 (Ben): WING SHAPE (swept / delta / straight / forward / none) + WING SPAN + WING SIZE + WING HEIGHT in the workshop. Guns sit on the tips.
    const WSH = L.wingShape || 'swept', SPN = L.wingSpan ?? 1, WSZ = L.wingSize ?? 1, WY = 0.41 + (L.wingY ?? 0) * 0.35, guns = [];
    const PL = { swept: [[0, -0.25], [1.2, 0.7], [1.2, 1.08], [0, 1.3]], delta: [[0, -0.6], [1.15, 1.05], [1.15, 1.25], [0, 1.35]], straight: [[0, 0.15], [1.2, 0.3], [1.2, 0.95], [0, 1.15]], forward: [[0, 0.2], [1.2, -0.35], [1.2, 0.05], [0, 1.25]] }[WSH];
    if (PL) for (const s2 of [-1, 1]) { const pts = PL.map(([x, z]) => [x * SPN * WSZ, z * WSZ]), cz = 0.55 * (1 - WSZ), w = new THREE.Shape(); pts.forEach(([x, z], i) => i ? w.lineTo(s2 * x, z + cz) : w.moveTo(s2 * x, z + cz)); w.closePath(); B.ext(w, 0.07 * Math.min(1.3, WSZ), L.wingCol || A, [s2 * 1.2, WY, 0], [HP, 0, 0], { bev: 0.025 });
      const ins = pts.map(([x, z], i) => [x * 0.7, (i === 0 ? z + 0.35 * WSZ : z) * 0.92 + 0.06]), w2 = new THREE.Shape(); ins.forEach(([x, z], i) => i ? w2.lineTo(s2 * x, z + cz) : w2.moveTo(s2 * x, z + cz)); w2.closePath(); B.ext(w2, 0.02, AL, [s2 * 1.18, WY + 0.05 * Math.min(1.3, WSZ), 0], [HP, 0, 0], { bev: 0.01, out: 0 });
      const le0 = pts[0], le1 = pts[1]; B.tube([[s2 * (1.19 + le0[0]), WY + 0.04, le0[1] + cz], [s2 * (1.17 + le1[0]), WY + 0.04, le1[1] + cz]], 0.026, EDGE, { glow: true, rseg: 4, caps: false });
      const tipX = s2 * (1.17 + pts[1][0] + 0.03), tipZ = (pts[1][1] + pts[2][1]) / 2 + cz; B.cyl(0.06, 0.07, 0.62, HD, [tipX, WY, tipZ], [HP, 0, 0], { seg: 10 }); B.cyl(0.03, 0.035, 0.75, '#cfd4de', [tipX, WY, tipZ - 0.66], [HP, 0, 0], { seg: 8, out: 0.015 }); B.cyl(0.025, 0.025, 0.02, EDGE, [tipX, WY, tipZ - 1.04], [HP, 0, 0], { glow: true, seg: 8 }); guns.push([tipX, WY - LIFT, tipZ - 1.08]);
      LT.add([tipX, WY + 0.09, tipZ + 0.29], s2 > 0 ? GREEN : RED, 0.45, 0.8, s2); }
    else for (const s2 of [-1, 1]) { guns.push([s2 * 1.36, 0.64 - LIFT, -0.95]); }
    const WREACH = PL ? 1.2 + Math.max(...PL.map(q => q[0])) * SPN * WSZ + 0.12 : 1.56;
    B.sph(0.16, GLASS, [0, 1.5, -2.1], 1, { t1: HP, seg: 12 }); LT.add([0, 1.74, 1.35], '#ffffff', 0.5, 0.9);
    // s559 MORE GUNS: a twin dorsal TURRET behind the crest, twin CHIN cannons under the nose, the wing-tip guns (6 in all) + a swept TAIL FIN over the rear door
    // s572: the dorsal turret is now MANNED (mannedTurret, built just before the hull bake so its barrels are the last guns)
    for (const s2 of [-1, 1]) { const cz = HZ0 - 0.55; B.cyl(0.05, 0.06, 0.55, HD, [s2 * 0.32, 0.45, cz + 0.15], [HP, 0, 0], { seg: 10 }); B.cyl(0.028, 0.032, 0.6, '#cfd4de', [s2 * 0.32, 0.45, cz - 0.35], [HP, 0, 0], { seg: 8, out: 0.015 }); B.cyl(0.024, 0.024, 0.02, EDGE, [s2 * 0.32, 0.45, cz - 0.66], [HP, 0, 0], { glow: true, seg: 8 }); guns.push([s2 * 0.32, 0.45 - LIFT, cz - 0.7]); }
    // s572 (Ben): the swept tail fin behind the turret is gone
    B.box(1.2, 0.12, 0.03, G, [0, 1.3, HZ1 + 0.01], 0, { glow: true }); for (const s of [-1, 1]) B.box(0.06, DY1 - DY0 + 0.1, 0.05, A, [s * (DW + 0.04), (DY0 + DY1) / 2, HZ1 + 0.02], 0, { out: 0 }); B.box(DW * 2 + 0.14, 0.06, 0.05, A, [0, DY1 + 0.03, HZ1 + 0.02], 0, { out: 0 });
    // s554 THE 8 CREST (Ben: like the player ship): a raised round plate on the roof spine, the 8 decal, and the same breathing pulse (an inverted crest fades in + out)
    if (L.emblem !== false) { const Rc = L.crestSize ?? 0.88, cz = -0.6, cy = CY + H2 + HUMP * Math.pow(Math.sin(Math.PI * Math.pow(tOf(-0.6), 0.85)), 1.3) - 0.02, P2 = baker(); P2.lathe([[0, -0.03], [Rc * 0.9, -0.02], [Rc + 0.03, 0.02], [Rc + 0.02, 0.06], [Rc * 0.9, 0.075], [0, 0.075]], H, [0, cy, cz], 0, { seg: 40, out: 0.03 }); P2.tor(Rc + 0.022, 0.018, A, [0, cy + 0.04, cz], [HP, 0, 0], { seg: 40, tube: 4, out: 0 }); body.add(P2.bake('crestPlate'));
      const N = 256, h2 = N / 2, mk = inv => { const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), rg = g.createRadialGradient(h2 * 0.9, h2 * 0.76, 4, h2, h2, h2 * 0.9), gc = new THREE.Color(L.crestGlow || '#5fd4ff');
        if (inv) { rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.45, '#' + gc.clone().lerp(new THREE.Color('#ffffff'), 0.35).getHexString()); rg.addColorStop(1, '#' + gc.getHexString()); } else { { const cp = L.crestPlate || ['#8fa8c8', '#44618c', '#1c2a42']; rg.addColorStop(0, cp[0]); rg.addColorStop(0.62, cp[1]); rg.addColorStop(1, cp[2]); } }
        g.beginPath(); g.arc(h2, h2, h2 * 0.9, 0, TAU); g.fillStyle = rg; g.fill(); g.lineWidth = N * 0.035; g.strokeStyle = '#231d3c'; g.stroke(); g.font = '900 ' + Math.round(N * 0.74) + 'px Archivo, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = N * 0.06;
        g.strokeStyle = inv ? '#ffffff' : '#141a2c'; g.strokeText(L.crestText || '8', h2, h2 * 1.07); g.fillStyle = inv ? '#141a2c' : (L.crestInk || '#ffffff'); g.fillText(L.crestText || '8', h2, h2 * 1.07); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
      const dg = new THREE.CircleGeometry(Rc * 0.86, SEG(40)), d1 = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ map: mk(false), transparent: true, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false })), d2 = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ map: mk(true), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, toneMapped: false }));
      for (const [m, y] of [[d1, 0.077], [d2, 0.079]]) { m.rotation.x = -HP; m.position.set(0, cy + y, cz); body.add(m); } anim.push(t => { const p = Math.max(0, Math.sin(t * 1.6 * (L.pulse ?? 1.2) / 1.2)); d2.material.opacity = Math.pow(p, 3) * 0.95; }); }
    const MT = mannedTurret(body, anim, LT, guns, { TY: CY + H2 + HUMP * 0.75 - 0.02, TZ: 0.75, TS: 0.8, A, HD, G, EDGE, LIFT });
    const RTG = rearThrusters(B, body, anim, ENG, { X: W2 - 0.26, Y: CY + 0.1, Z: HZ1, R: 0.17, A, HD, G });   // s575 the rear thrusters
    const HB = B.bake('corvetteHull'); body.add(HB); body.add(GB.bake('bandGlass')); const RL = 0.8;
    const PB = baker(); PB.add(new THREE.PlaneGeometry(DW * 2, DY1 - DY0), '#15171c', mat4([0, (DY0 + DY1) / 2, HZ1 - 0.04]), { glow: true, out: 0 }); const plug = PB.bake('plug'); body.add(plug);
    const RB = baker(); RB.rbox(DW * 2, 0.05, RL, 0.02, HD, [0, -0.025, RL / 2]); for (let k = 0; k < 5; k++) RB.box(DW * 2 - 0.06, 0.012, 0.02, GRAPH2, [0, 0.003, 0.1 + k * 0.15], 0, { out: 0 }); for (const s of [-1, 1]) RB.box(0.03, 0.01, RL - 0.06, '#ffd23a', [s * (DW - 0.04), 0.004, RL / 2], 0, { glow: true });
    const RBk = RB.bake('ramp'), hinge = new THREE.Group(); hinge.position.set(0, DY0, HZ1); hinge.add(RBk); body.add(hinge);
    const OPEN = Math.asin((DY0 - LIFT) / RL); let k = L.ramp ?? 1, want = k; const set = () => { hinge.rotation.x = -HP + (HP + OPEN) * (1 - Math.pow(1 - k, 2)); }; set();
    anim.push((t, dt) => { if (Math.abs(want - k) > 1e-3) { k += Math.sign(want - k) * Math.min(Math.abs(want - k), (dt || 0.016) * 0.8); set(); } });
    anim.push(() => { const k = 0.6 + (api.thrust || 0) * 0.9 + (api.boost ? 0.8 : 0); RTG.forEach(sp => sp.scale.setScalar(0.42 * k)); });
    const api = { thrust: 0, boost: false, guns, engines: ENG, setThrust(v) { api.thrust = v; }, setRamp(v) { want = clamp01(v); }, snapRamp(v) { k = want = clamp01(v); set(); }, get ramp() { return k; }, rampFoot: [0, 0, HZ1 + Math.cos(OPEN) * RL],
      dims: { floor: DY0 - LIFT, doorW: DW, doorH: DY1 - DY0, hinge: HZ1, front: HZ0, rampLen: RL, open: OPEN, clear: 0.35 - LIFT, turret: [0, 0.75], legs: [[-0.75, -1.8, 0.05], [0.75, -1.8, 0.05], [-0.75, 1.1, 0.05], [0.75, 1.1, 0.05]], solids: [[-WREACH, -1.05, -1.4, 1.65], [1.05, WREACH, -1.4, 1.65], [-1.9, -1.05, -1.4, 2.1], [1.05, 1.9, -1.4, 2.1]], noseLen: NL, Y0: DY0 }, prof, ring, BAND, plug, turret: MT.api, ink: [HB, RBk, MT.tb, MT.pb].map(G2 => G2.children.find(m => m.material === MAT.ink)).filter(Boolean), look: L };
    body.position.y = -LIFT; root.add(body); const pts = LT.make(); if (pts) body.add(pts); return { root, pts, anim, hit: 3.3, api }; }
  // s562 THE GUNNER (walk-in ship #3, Ben): 10 % bigger than the corvette (hull scale 7.9, ~44 m), its OWN shape: a broad flat ARMOURED hull (a hard plateau section with sharp
  // chines, not the corvette's round bulge), heavy GUN SPONSONS on both flanks (twin cannons + an engine each), a chin gun pod (4 guns), twin canted tail fins, 2 main engines on
  // the stern corners and a manned SPINNING TURRET on the roof: glass dome, the gunner's seat + console inside, twin heavy barrels. api.turret.aim(yaw, pitch) turns it; eye = the seat view.
  function hullGunship(L0, acc0) { const L = shipColours(L0, 'hullGunship'), acc = L0.worldTint && acc0 !== L0.accent ? acc0 : L.accent; const B = baker(), LT = lights(), root = new THREE.Group(), body = new THREE.Group(), LIFT = 0.12, anim = [], H = L.hull, A = acc || L.accent, AL = mix(A, '#ffffff', 0.28), EDGE = L.edge || '#7fd0ff', G = L.glow, HD = mix(H, GRAPH, 0.45), POD = mix(H, '#ffffff', 0.25), DG = mix(GLASS, '#0a1420', 0.78);
    const W2 = 1.12, H2 = 0.56, CY = 0.92, RD = 0.36, HZ0 = -2.5, HZ1 = 1.75, DY0 = 0.45, DW = 0.4, DY1 = 1.17;
    const rect = (holes) => { const sh = new THREE.Shape(); sh.moveTo(-W2 + RD, CY - H2); sh.lineTo(W2 - RD, CY - H2); sh.quadraticCurveTo(W2, CY - H2, W2, CY - H2 + RD); sh.lineTo(W2, CY + H2 - RD); sh.quadraticCurveTo(W2, CY + H2, W2 - RD, CY + H2); sh.lineTo(-W2 + RD, CY + H2); sh.quadraticCurveTo(-W2, CY + H2, -W2, CY + H2 - RD); sh.lineTo(-W2, CY - H2 + RD); sh.quadraticCurveTo(-W2, CY - H2, -W2 + RD, CY - H2);
      for (const [x0, x1, y0, y1] of holes || []) { const p = new THREE.Path(); p.moveTo(x0, y0); p.lineTo(x0, y1); p.lineTo(x1, y1); p.lineTo(x1, y0); p.closePath(); sh.holes.push(p); } return sh; };
    const NL = 1.45, CSG = low ? 3 : 5, NR = low ? 6 : 10;
    const prof = u => { const w = W2 - 0.5 * u * u, yb = CY - H2 + 0.12 * u * u, yt = CY + H2 - 0.42 * Math.pow(u, 1.4), r = Math.min(RD + 0.06 * u, (yt - yb) / 2 - 0.01, w - 0.01), z = HZ0 - NL * Math.sin(u * HP); return { w, yb, yt, r, z }; };
    const ringOf = p => { const pts = [], arc = (cx, cy, a0) => { for (let i = 0; i <= CSG; i++) { const a2 = a0 + i / CSG * HP; pts.push([cx + Math.cos(a2) * p.r, cy + Math.sin(a2) * p.r]); } }, ym = (p.yb + p.yt) / 2 + 0.06; arc(p.w - p.r, p.yb + p.r, -HP); pts.push([p.w, ym]); arc(p.w - p.r, p.yt - p.r, 0); arc(-(p.w - p.r), p.yt - p.r, HP); pts.push([-p.w, ym]); arc(-(p.w - p.r), p.yb + p.r, Math.PI); return pts; };
    const ring = u => { const p = prof(u); return { p, pts: ringOf(p) }; };
    const BAND = [CSG + 1, 3 * CSG + 4];
    const mesh = (rows, flipTest) => { const pos = [], ind = [], m2 = rows[0].length, nr = rows.length - 1; rows.forEach(r => r.forEach(q => pos.push(...q))); for (let k = 0; k < nr; k++) for (let j = 0; j < m2 - 1; j++) { const A0 = k * m2 + j; ind.push(A0, A0 + m2, A0 + 1, A0 + 1, A0 + m2, A0 + m2 + 1); }
      const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setIndex(ind); gg.computeVertexNormals(); const N0 = gg.attributes.normal; let top = 0; for (let i = 0; i < N0.count; i++) if (pos[i * 3 + 1] > flipTest) top += N0.getY(i); if (top < 0) { const i2 = []; for (let q = 0; q < ind.length; q += 3) i2.push(ind[q], ind[q + 2], ind[q + 1]); gg.setIndex(i2); gg.computeVertexNormals(); } return gg; };
    const loft = (u0, u1, i0, i1, push = 0) => { const rows = []; for (let k = 0; k <= NR; k++) { const u = u0 + (u1 - u0) * k / NR, R2 = ring(u), cyy = (R2.p.yb + R2.p.yt) / 2, n = R2.pts.length, idx = i1 == null ? [...Array(n).keys(), 0] : Array.from({ length: i1 - i0 + 1 }, (_, j) => i0 + j); rows.push(idx.map(j => { const [x, y] = R2.pts[j % n]; return [x * (1 + push), cyy + (y - cyy) * (1 + push), R2.p.z]; })); } return mesh(rows, 1.2); };
    { const nP = ring(0).pts.length; B.add(loft(0, 1, BAND[1], BAND[0] + nP), H, null, { out: 0.05 }); B.add(loft(0, 0.26, BAND[0], BAND[1]), H, null, { out: 0.05 }); B.add(loft(0.97, 1, BAND[0], BAND[1]), H, null, { out: 0.05 }); }   // s571: window hole under the band
    const GB = glassBaker(); GB.add(loft(0.26, 0.97, BAND[0], BAND[1], 0.012), DG, null, { glow: true, out: 0 }); B.add(loft(0.24, 0.26, 0, null, 0.016), A, null, { out: 0 });
    { const R1 = ring(1), sh = new THREE.Shape(); R1.pts.forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y)); const cap = new THREE.ShapeGeometry(sh); cap.rotateY(Math.PI); cap.translate(0, 0, R1.p.z); B.add(cap, H, null, { out: 0 }); B.cyl(0.14, 0.16, 0.04, G, [0, 0.78, R1.p.z - 0.01], [HP, 0, 0], { glow: true, seg: 16 }); B.tor(0.17, 0.025, A, [0, 0.78, R1.p.z - 0.01], 0, { seg: 16, tube: 3, out: 0.01 }); }
    // the ARMOURED BODY: a plateau section (flat sides, tight corners) that eases back to the family section at the nose + the door
    const BW = 0.3, NB = low ? 10 : 18, sm = (a, b, x) => { const q = clamp01((x - a) / (b - a)); return q * q * (3 - 2 * q); }, kOf = t => sm(0, 0.16, t) * (1 - sm(0.82, 1, t));
    const bp = t => { const k = kOf(t), z = HZ0 + (HZ1 - HZ0) * t; return { w: W2 + BW * k, yb: CY - H2 - 0.05 * k, yt: CY + H2 + 0.09 * k, r: RD - 0.14 * k, z }; }, tOf = z => (z - HZ0) / (HZ1 - HZ0), WM = W2 + BW, ROOF = CY + H2 + 0.09;
    { const rows = []; for (let k = 0; k <= NB; k++) { const p = bp(k / NB), R2 = ringOf(p); rows.push([...R2, R2[0]].map(([x, y]) => [x, y, p.z])); } B.add(mesh(rows, 1.3), H, null, { out: 0.05 });
      const rc = new THREE.ShapeGeometry(rect([[-DW, DW, DY0, DY1]]), low ? 4 : 8); rc.translate(0, 0, HZ1); B.add(rc, H, null, { out: 0 }); }
    const zA = HZ0 + (HZ1 - HZ0) * 0.17, zB = HZ0 + (HZ1 - HZ0) * 0.81, zM = (zA + zB) / 2, LEN = zB - zA;
    for (const sg of [-1, 1]) { const line = (y0, off, c, rad) => { const pts = []; for (let k = 0; k <= 12; k++) { const p = bp(0.02 + 0.96 * k / 12); pts.push([sg * (p.w + off), y0(p), p.z]); } B.tube(pts, rad, c, { rseg: 4, caps: false }); };
      line(p => (p.yb + p.yt) / 2 + 0.12, 0.012, A, 0.045);
      B.box(0.2, 0.05, LEN, HD, [sg * (WM + 0.07), CY - 0.04, zM]); B.box(0.02, 0.035, LEN - 0.1, G, [sg * (WM + 0.175), CY - 0.04, zM], 0, { glow: true });
      for (const [t0, t1] of [[0.2, 0.36], [0.5, 0.66], [0.72, 0.8]]) { const pts = []; for (let k = 0; k <= 4; k++) { const p = bp(t0 + (t1 - t0) * k / 4); pts.push([sg * (p.w - 0.01), 1.1, p.z]); } B.tube(pts, 0.1, DG, { rseg: 6, caps: true }); }
      for (let k = 0; k < 5; k++) B.box(0.012, 0.3, 0.02, mix(H, GRAPH, 0.4), [sg * (WM + 0.004), 0.7, zA + 0.3 + k * (LEN - 0.6) / 4], 0, { out: 0 });
      B.box(0.05, 0.02, LEN - 0.2, A, [sg * 1.16, ROOF + 0.006, zM], 0, { out: 0 }); B.box(0.16, 0.015, LEN - 0.2, mix(H, GRAPH, 0.28), [sg * 1.06, ROOF + 0.004, zM], 0, { out: 0 }); }
    // the GUN SPONSONS: fat armoured pods on pylons, twin cannons out front, an engine behind
    const engines = [], extraG = [], guns = [];
    const eng = (x, y, z, rr) => { B.lathe([[rr * 0.6, 0], [rr, 0.12], [rr * 1.05, rr * 1.3], [rr * 0.7, rr * 1.5]], GRAPH2, [x, y, z], [HP, 0, 0], { seg: 14 }); B.cyl(rr * 0.62, rr * 0.62, 0.02, G, [x, y, z + rr * 1.5], [HP, 0, 0], { glow: true, seg: 12 }); B.tor(rr * 1.02, 0.02, A, [x, y, z + 0.12], 0, { seg: 16, tube: 3, out: 0 }); const o = new THREE.Object3D(); o.position.set(x, y, z + rr * 1.6); body.add(o); engines.push(o); const sp = spark(G, rr * 2.5); sp.position.copy(o.position); body.add(sp); extraG.push({ sp, rr }); };
    const SX = WM + 0.27, SY = 0.6, SZ = -0.35;
    for (const s of [-1, 1]) { const x = s * SX; B.box(0.34, 0.15, 1.7, HD, [s * (WM + 0.1), SY + 0.04, SZ]); B.cap(0.24, 2.3, POD, [x, SY, SZ], [HP, 0, 0], { seg: 16, s: [1, 0.86, 1] }); B.box(0.16, 0.02, 2.0, G, [x, SY + 0.21, SZ], 0, { glow: true }); for (const z of [SZ - 0.75, SZ + 0.75]) B.tor(0.245, 0.02, A, [x, SY, z], 0, { seg: 16, tube: 3, out: 0.01, s: [1, 0.86, 1] });
      B.box(0.03, 0.06, 1.6, A, [x + s * 0.24, SY, SZ], 0, { out: 0 }); B.rbox(0.36, 0.18, 0.3, 0.05, HD, [x, SY, SZ - 1.35]);
      for (const dx of [-0.09, 0.09]) { B.cyl(0.05, 0.06, 0.4, HD, [x + dx, SY, SZ - 1.6], [HP, 0, 0], { seg: 10 }); B.cyl(0.028, 0.034, 0.85, '#cfd4de', [x + dx, SY, SZ - 2.2], [HP, 0, 0], { seg: 8, out: 0.015 }); B.cyl(0.024, 0.024, 0.02, EDGE, [x + dx, SY, SZ - 2.63], [HP, 0, 0], { glow: true, seg: 8 }); guns.push([x + dx, SY - LIFT, SZ - 2.67]); }
      eng(x, SY, SZ + 1.32, 0.17); LT.add([x, SY + 0.24, SZ - 1.1], s > 0 ? GREEN : RED, 0.5, 0.8); LT.add([s * (DW + 0.05), DY0 + 0.05, HZ1 + 0.03], AMBER, 0.35, 1.4, s); }
    for (const s of [-1, 1]) eng(s * 0.74, 0.95, HZ1 - 0.04, 0.2);
    // the CHIN GUN POD: 4 guns slung under the nose
    { const cz = HZ0 - 0.15; B.rbox(1.3, 0.14, 0.8, 0.06, HD, [0, CY - H2 - 0.02, cz]); B.box(1.2, 0.03, 0.03, G, [0, CY - H2 - 0.02, cz - 0.41], 0, { glow: true });
      for (const x of [-0.5, -0.18, 0.18, 0.5]) { B.cyl(0.045, 0.055, 0.4, GRAPH2, [x, CY - H2 - 0.04, cz - 0.55], [HP, 0, 0], { seg: 10 }); B.cyl(0.026, 0.03, 0.62, '#cfd4de', [x, CY - H2 - 0.04, cz - 1.05], [HP, 0, 0], { seg: 8, out: 0.015 }); B.cyl(0.022, 0.022, 0.02, EDGE, [x, CY - H2 - 0.04, cz - 1.37], [HP, 0, 0], { glow: true, seg: 8 }); guns.push([x, CY - H2 - 0.04 - LIFT, cz - 1.4]); } }
    // WINGS out of the sponsons (the family's two-tone + glowing leading edge), guns on the tips
    const WSH = L.wingShape || 'straight', SPN = L.wingSpan ?? 0.85, WSZ = L.wingSize ?? 0.9, WY = SY - 0.06 + (L.wingY ?? 0) * 0.35, WR = SX + 0.18;
    const PL = { swept: [[0, -0.25], [1.2, 0.7], [1.2, 1.08], [0, 1.3]], delta: [[0, -0.6], [1.15, 1.05], [1.15, 1.25], [0, 1.35]], straight: [[0, 0.15], [1.2, 0.3], [1.2, 0.95], [0, 1.15]], forward: [[0, 0.2], [1.2, -0.35], [1.2, 0.05], [0, 1.25]] }[WSH];
    if (PL) for (const s2 of [-1, 1]) { const pts = PL.map(([x, z]) => [x * SPN * WSZ, z * WSZ - 0.9]), w = new THREE.Shape(); pts.forEach(([x, z], i) => i ? w.lineTo(s2 * x, z) : w.moveTo(s2 * x, z)); w.closePath(); B.ext(w, 0.07 * Math.min(1.3, WSZ), L.wingCol || A, [s2 * WR, WY, 0], [HP, 0, 0], { bev: 0.025 });
      const ins = pts.map(([x, z], i) => [x * 0.7, i === 0 ? z + 0.3 * WSZ : z * 0.95]), w2 = new THREE.Shape(); ins.forEach(([x, z], i) => i ? w2.lineTo(s2 * x, z) : w2.moveTo(s2 * x, z)); w2.closePath(); B.ext(w2, 0.02, AL, [s2 * (WR - 0.01), WY + 0.05 * Math.min(1.3, WSZ), 0], [HP, 0, 0], { bev: 0.01, out: 0 });
      B.tube([[s2 * (WR + pts[0][0] + 0.02), WY + 0.04, pts[0][1]], [s2 * (WR + pts[1][0]), WY + 0.04, pts[1][1]]], 0.026, EDGE, { glow: true, rseg: 4, caps: false });
      const tipX = s2 * (WR + pts[1][0] + 0.03), tipZ = (pts[1][1] + pts[2][1]) / 2; B.cyl(0.06, 0.07, 0.62, HD, [tipX, WY, tipZ], [HP, 0, 0], { seg: 10 }); B.cyl(0.03, 0.035, 0.75, '#cfd4de', [tipX, WY, tipZ - 0.66], [HP, 0, 0], { seg: 8, out: 0.015 }); B.cyl(0.025, 0.025, 0.02, EDGE, [tipX, WY, tipZ - 1.04], [HP, 0, 0], { glow: true, seg: 8 }); guns.push([tipX, WY - LIFT, tipZ - 1.08]);
      LT.add([tipX, WY + 0.09, tipZ + 0.29], s2 > 0 ? GREEN : RED, 0.45, 0.8, s2); }
    const WREACH = PL ? WR + Math.max(...PL.map(q => q[0])) * SPN * WSZ + 0.12 : SX + 0.3;
    // twin TAIL FINS canted out over the stern
    for (const s of [-1, 1]) { const tf = new THREE.Shape(); tf.moveTo(0, 0); tf.lineTo(1.0, 0); tf.lineTo(1.3, 0.58); tf.lineTo(0.95, 0.62); tf.closePath(); const fg = new THREE.ExtrudeGeometry(tf, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1, curveSegments: 2 }); fg.translate(0, 0, -0.03);
      const m = new THREE.Matrix4().makeTranslation(s * 1.0, ROOF - 0.04, 0.6).multiply(new THREE.Matrix4().makeRotationZ(-s * 0.38)).multiply(new THREE.Matrix4().makeRotationY(-HP)); B.add(fg, A, m, {}); const tip = new THREE.Vector3(0.0, 0.6, 1.2).applyMatrix4(new THREE.Matrix4().makeTranslation(s * 1.0, ROOF - 0.04, 0.6).multiply(new THREE.Matrix4().makeRotationZ(-s * 0.38)));
      B.box(0.06, 0.025, 0.4, EDGE, [tip.x, tip.y, tip.z + 0.05], 0, { glow: true }); LT.add([tip.x, tip.y + 0.04, tip.z + 0.25], '#ffffff', 0.4, 1.1, s); }
    B.box(1.2, 0.12, 0.03, G, [0, 1.32, HZ1 + 0.01], 0, { glow: true }); for (const s of [-1, 1]) B.box(0.06, DY1 - DY0 + 0.1, 0.05, A, [s * (DW + 0.04), (DY0 + DY1) / 2, HZ1 + 0.02], 0, { out: 0 }); B.box(DW * 2 + 0.14, 0.06, 0.05, A, [0, DY1 + 0.03, HZ1 + 0.02], 0, { out: 0 });
    for (const [x, z] of [[-0.8, -2.0], [0.8, -2.0], [-0.8, 1.25], [0.8, 1.25]]) { B.cyl(0.05, 0.06, 0.36 - LIFT, GRAPH2, [x, (0.36 + LIFT) / 2, z], 0, { seg: 6 }); B.cyl(0.15, 0.17, 0.04, HD, [x, LIFT + 0.02, z], 0, { seg: 10 }); }
    // THE 8 CREST (as big as the roof allows) ahead of the turret, with the breathing pulse
    if (L.emblem !== false) { const Rc = L.crestSize ?? 0.98, cz = -1.15, cy = bp(tOf(cz)).yt - 0.02, P2 = baker(); P2.lathe([[0, -0.03], [Rc * 0.9, -0.02], [Rc + 0.03, 0.02], [Rc + 0.02, 0.06], [Rc * 0.9, 0.075], [0, 0.075]], H, [0, cy, cz], 0, { seg: 40, out: 0.03 }); P2.tor(Rc + 0.022, 0.018, A, [0, cy + 0.04, cz], [HP, 0, 0], { seg: 40, tube: 4, out: 0 }); body.add(P2.bake('crestPlate'));
      const N = 256, h2 = N / 2, mk = inv => { const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), rg = g.createRadialGradient(h2 * 0.9, h2 * 0.76, 4, h2, h2, h2 * 0.9), gc = new THREE.Color(L.crestGlow || '#5fd4ff');
        if (inv) { rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.45, '#' + gc.clone().lerp(new THREE.Color('#ffffff'), 0.35).getHexString()); rg.addColorStop(1, '#' + gc.getHexString()); } else { { const cp = L.crestPlate || ['#8fa8c8', '#44618c', '#1c2a42']; rg.addColorStop(0, cp[0]); rg.addColorStop(0.62, cp[1]); rg.addColorStop(1, cp[2]); } }
        g.beginPath(); g.arc(h2, h2, h2 * 0.9, 0, TAU); g.fillStyle = rg; g.fill(); g.lineWidth = N * 0.035; g.strokeStyle = '#231d3c'; g.stroke(); g.font = '900 ' + Math.round(N * 0.74) + 'px Archivo, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = N * 0.06;
        g.strokeStyle = inv ? '#ffffff' : '#141a2c'; g.strokeText(L.crestText || '8', h2, h2 * 1.07); g.fillStyle = inv ? '#141a2c' : (L.crestInk || '#ffffff'); g.fillText(L.crestText || '8', h2, h2 * 1.07); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
      const dg = new THREE.CircleGeometry(Rc * 0.86, SEG(40)), d1 = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ map: mk(false), transparent: true, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false })), d2 = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ map: mk(true), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, toneMapped: false }));
      for (const [m, y] of [[d1, 0.077], [d2, 0.079]]) { m.rotation.x = -HP; m.position.set(0, cy + y, cz); body.add(m); } anim.push(t => { const p = Math.max(0, Math.sin(t * 1.6 * (L.pulse ?? 1.2) / 1.2)); d2.material.opacity = Math.pow(p, 3) * 0.95; }); }
    // THE MANNED TURRET: a ring base, a glass dome with a cross frame, the gunner's seat + console inside; twin heavy barrels on a pitch cradle. Yaw 0 = nose (-z).
    const TZ = 0.78, TS = 1.35, TY = bp(tOf(TZ)).yt - 0.02, tur = new THREE.Group(), pit = new THREE.Group(); tur.position.set(0, TY, TZ); tur.scale.setScalar(TS); body.add(tur); pit.position.y = 0.17; tur.add(pit);
    const T2 = baker(); T2.lathe([[0, 0], [0.54, 0], [0.56, 0.06], [0.5, 0.13], [0, 0.13]], GRAPH, [0, 0, 0], 0, { seg: 28 }); T2.tor(0.555, 0.022, A, [0, 0.07, 0], [HP, 0, 0], { seg: 28, tube: 3, out: 0 }); T2.tor(0.375, 0.018, HD, [0, 0.13, 0], [HP, 0, 0], { seg: 28, tube: 3, out: 0 });
    T2.tor(0.372, 0.011, HD, [0, 0.13, 0.04], 0, { seg: 28, tube: 3, out: 0 });
    T2.rbox(0.17, 0.05, 0.16, 0.02, '#ec3013', [0, 0.2, 0.07]); T2.rbox(0.17, 0.2, 0.04, 0.02, '#ec3013', [0, 0.31, 0.16]); T2.cyl(0.03, 0.04, 0.07, GRAPH2, [0, 0.16, 0.07], 0, { seg: 8 }); T2.rbox(0.22, 0.04, 0.07, 0.02, GRAPH2, [0, 0.15, -0.11]); T2.box(0.1, 0.025, 0.006, '#5dffa0', [0, 0.17, -0.143], [-0.6, 0, 0], { glow: true, out: 0 }); for (const s of [-1, 1]) T2.cyl(0.01, 0.012, 0.05, '#cfd4de', [s * 0.08, 0.19, -0.09], 0, { seg: 6, out: 0 });
    const tb = T2.bake('turret'); tur.add(tb);
    const P3 = baker(); for (const s2 of [-1, 1]) { const x = s2 * 0.47; P3.cyl(0.09, 0.09, 0.2, HD, [x, 0, 0], [0, 0, HP], { seg: 12 }); P3.rbox(0.15, 0.15, 0.5, 0.04, HD, [x, 0, -0.2]); P3.box(0.02, 0.03, 0.4, G, [x + s2 * 0.08, 0.02, -0.2], 0, { glow: true }); P3.cyl(0.045, 0.055, 1.0, '#cfd4de', [x, 0, -0.9], [HP, 0, 0], { seg: 10, out: 0.015 }); P3.tor(0.06, 0.016, A, [x, 0, -0.55], 0, { seg: 12, tube: 3, out: 0 }); P3.cyl(0.06, 0.05, 0.08, GRAPH2, [x, 0, -1.42], [HP, 0, 0], { seg: 10 }); P3.cyl(0.035, 0.035, 0.02, EDGE, [x, 0, -1.465], [HP, 0, 0], { glow: true, seg: 10 }); }
    const pb = P3.bake('turretGuns'); pit.add(pb);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.37, SEG(28), SEG(12), 0, TAU, 0, HP), new THREE.MeshBasicMaterial({ color: '#9fdcff', transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); dome.position.y = 0.13; tur.add(dome);
    const eye = new THREE.Object3D(); eye.position.set(0, 0.355, 0.03); tur.add(eye); const muzzles = [], flash = [];
    for (const s2 of [-1, 1]) { const o = new THREE.Object3D(); o.position.set(s2 * 0.47, 0, -1.5); pit.add(o); muzzles.push(o); const f = spark('#ffe08a', 0.01); f.position.copy(o.position); pit.add(f); f.material.opacity = 0; flash.push(f); guns.push([s2 * 0.47 * TS, TY + 0.17 * TS - LIFT, TZ - 1.5 * TS]); }
    LT.add([0, TY + 0.53 * TS, TZ], RED, 0.35, 1.2);
    let manned = false, yaw = 0, pitch = 0.1; const fl = [0, 0];
    anim.push((t, dt) => { const d = dt || 0.016; if (!manned) { yaw = Math.sin(t * 0.33) * 0.9; pitch = 0.1 + Math.sin(t * 0.5) * 0.06; } tur.rotation.y = yaw; pit.rotation.x = pitch; for (let i = 0; i < 2; i++) { fl[i] = Math.max(0, fl[i] - d * 9); flash[i].scale.setScalar(0.02 + fl[i] * 0.7); flash[i].material.opacity = fl[i]; } pb.position.z = (fl[0] + fl[1]) * 0.03; });
    const HB = B.bake('gunshipHull'); body.add(HB); body.add(GB.bake('bandGlass')); const RL = 0.8;
    const PB = baker(); PB.add(new THREE.PlaneGeometry(DW * 2, DY1 - DY0), '#15171c', mat4([0, (DY0 + DY1) / 2, HZ1 - 0.04]), { glow: true, out: 0 }); const plug = PB.bake('plug'); body.add(plug);
    const RB = baker(); RB.rbox(DW * 2, 0.05, RL, 0.02, HD, [0, -0.025, RL / 2]); for (let k = 0; k < 5; k++) RB.box(DW * 2 - 0.06, 0.012, 0.02, GRAPH2, [0, 0.003, 0.1 + k * 0.15], 0, { out: 0 }); for (const s of [-1, 1]) RB.box(0.03, 0.01, RL - 0.06, '#ffd23a', [s * (DW - 0.04), 0.004, RL / 2], 0, { glow: true });
    const RBk = RB.bake('ramp'), hinge = new THREE.Group(); hinge.position.set(0, DY0, HZ1); hinge.add(RBk); body.add(hinge);
    const OPEN = Math.asin((DY0 - LIFT) / RL); let k = L.ramp ?? 1, want = k; const set = () => { hinge.rotation.x = -HP + (HP + OPEN) * (1 - Math.pow(1 - k, 2)); }; set();
    anim.push((t, dt) => { if (Math.abs(want - k) > 1e-3) { k += Math.sign(want - k) * Math.min(Math.abs(want - k), (dt || 0.016) * 0.8); set(); } });
    const inkOf = G2 => G2.children.find(m => m.material === MAT.ink);
    const api = { thrust: 0, boost: false, guns, engines, setThrust(v) { api.thrust = v; }, setRamp(v) { want = clamp01(v); }, snapRamp(v) { k = want = clamp01(v); set(); }, get ramp() { return k; }, rampFoot: [0, 0, HZ1 + Math.cos(OPEN) * RL],
      turret: { eye, muzzles, dome, setBarrel(k) { pb.scale.z = k; muzzles.forEach(o => { o.position.z = -1.5 * k; }); flash.forEach((f, i) => { f.position.copy(muzzles[i].position); }); }, get yaw() { return yaw; }, get pitch() { return pitch; }, get manned() { return manned; }, aim(y, p) { manned = true; yaw = y; pitch = Math.max(-0.12, Math.min(1.25, p)); }, release() { manned = false; }, fire(i) { fl[i % 2] = 1; } },
      dims: { floor: DY0 - LIFT, doorW: DW, doorH: DY1 - DY0, hinge: HZ1, front: HZ0, rampLen: RL, open: OPEN, clear: 0.36 - LIFT, turret: [0, TZ], legs: [[-0.8, -2.0, 0.06], [0.8, -2.0, 0.06], [-0.8, 1.25, 0.06], [0.8, 1.25, 0.06]], solids: [[-WREACH, -WM, -1.95, 1.0], [WM, WREACH, -1.95, 1.0]], noseLen: NL, Y0: DY0 }, prof, ring, BAND, plug, ink: [HB, RBk, tb, pb].map(inkOf).filter(Boolean), look: L };
    anim.push(t => { const kk = 0.35 + api.thrust * 0.5 + (api.boost ? 0.6 : 0); for (const e of extraG) { e.sp.scale.setScalar(e.rr * (2 + kk * 2.4 + Math.sin(t * 30 + e.rr) * 0.2)); e.sp.material.color.set(api.boost ? '#ffd23a' : G); e.sp.material.opacity = Math.min(1, 0.4 + kk * 0.5); } });
    body.position.y = -LIFT; root.add(body); const pts = LT.make(); if (pts) body.add(pts); return { root, pts, anim, hit: 3.6, api }; }
  // s563 THE FLAGSHIP (WALK-IN, Ben: walk-in ship #4, 20 % bigger than the gunner, hull scale 9.5, ~54 m). Its own shape: the family nose + a long armoured plateau, a stepped
  // COMMAND TOWER aft on the roof (window band, mast, turning radar dish, beacon), a broad WING DECK through the flanks (hangar glow underneath, 4 small auto turrets), swept wings
  // off the deck edge, a SPINAL CANNON under the prow, FIVE engines (2 on the deck ends, 2 beside the ramp door, 1 high on the tower), the 8 CREST full roof width ahead of the tower.
  // s563 THE FLAGSHIP (WALK-IN, Ben: walk-in ship #4, 20 % bigger than the gunner, hull scale 9.5, ~54 m). s563c (Ben: "more of a rounded ship"): a compact ROUNDED ARROWHEAD
  // hull (one smooth flattened shell, superellipse section, broad rounded prow, widest aft of the middle), two NACELLES hugging the rear flanks, a forward battery of 4 cannons
  // in the prow rim, a dorsal mound carrying the MANNED GUN TURRET, 4 small shoulder turrets, a dark canopy band over the bridge, portholes along the rim, 5 engines, the 8 crest.
  // The family core section (prof / ring / BAND) is kept as data only: the walk-in interior builds its walls + bridge from it; the shell wraps round it.
  function hullFlagWalk(L0, acc0) { const L = shipColours(L0, 'hullFlagWalk'), acc = L0.worldTint && acc0 !== L0.accent ? acc0 : L.accent; const B = baker(), LT = lights(), root = new THREE.Group(), body = new THREE.Group(), LIFT = 0.12, anim = [], H = L.hull, A = acc || L.accent, AL = mix(A, '#ffffff', 0.28), EDGE = L.edge || '#7fd0ff', G = L.glow, HD = mix(H, GRAPH, 0.45), POD = mix(H, '#ffffff', 0.25), DG = mix(GLASS, '#0a1420', 0.78);
    const W2 = 1.2, H2 = 0.58, CY = 0.94, RD = 0.36, HZ0 = -2.5, HZ1 = 1.75, DY0 = 0.45, DW = 0.42, DY1 = 1.2;
    const rect = (holes) => { const sh = new THREE.Shape(); sh.moveTo(-W2 + RD, CY - H2); sh.lineTo(W2 - RD, CY - H2); sh.quadraticCurveTo(W2, CY - H2, W2, CY - H2 + RD); sh.lineTo(W2, CY + H2 - RD); sh.quadraticCurveTo(W2, CY + H2, W2 - RD, CY + H2); sh.lineTo(-W2 + RD, CY + H2); sh.quadraticCurveTo(-W2, CY + H2, -W2, CY + H2 - RD); sh.lineTo(-W2, CY - H2 + RD); sh.quadraticCurveTo(-W2, CY - H2, -W2 + RD, CY - H2);
      for (const [x0, x1, y0, y1] of holes || []) { const p = new THREE.Path(); p.moveTo(x0, y0); p.lineTo(x0, y1); p.lineTo(x1, y1); p.lineTo(x1, y0); p.closePath(); sh.holes.push(p); } return sh; };
    const NL = 1.0, CSG = low ? 3 : 5, NR = low ? 6 : 10;
    const prof = u => { const w = W2 - 0.75 * u * u, yb = CY - H2 + 0.12 * u * u, yt = CY + H2 - 0.42 * Math.pow(u, 1.4), r = Math.min(RD + 0.06 * u, (yt - yb) / 2 - 0.01, w - 0.01), z = HZ0 - NL * Math.sin(u * HP); return { w, yb, yt, r, z }; };
    const ringOf = p => { const pts = [], arc = (cx, cy, a0) => { for (let i = 0; i <= CSG; i++) { const a2 = a0 + i / CSG * HP; pts.push([cx + Math.cos(a2) * p.r, cy + Math.sin(a2) * p.r]); } }, ym = (p.yb + p.yt) / 2 + 0.06; arc(p.w - p.r, p.yb + p.r, -HP); pts.push([p.w, ym]); arc(p.w - p.r, p.yt - p.r, 0); arc(-(p.w - p.r), p.yt - p.r, HP); pts.push([-p.w, ym]); arc(-(p.w - p.r), p.yb + p.r, Math.PI); return pts; };
    const ring = u => { const p = prof(u); return { p, pts: ringOf(p) }; };
    const BAND = [CSG + 1, 3 * CSG + 4];
    const mesh = (rows, flipTest) => { const pos = [], ind = [], m2 = rows[0].length, nr = rows.length - 1; rows.forEach(r => r.forEach(q => pos.push(...q))); for (let k = 0; k < nr; k++) for (let j = 0; j < m2 - 1; j++) { const A0 = k * m2 + j; ind.push(A0, A0 + m2, A0 + 1, A0 + 1, A0 + m2, A0 + m2 + 1); }
      const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setIndex(ind); gg.computeVertexNormals(); const N0 = gg.attributes.normal; let top = 0; for (let i = 0; i < N0.count; i++) if (pos[i * 3 + 1] > flipTest) top += N0.getY(i); if (top < 0) { const i2 = []; for (let q = 0; q < ind.length; q += 3) i2.push(ind[q], ind[q + 2], ind[q + 1]); gg.setIndex(i2); gg.computeVertexNormals(); } return gg; };
    const loft = (u0, u1, i0, i1, push = 0) => { const rows = []; for (let k = 0; k <= NR; k++) { const u = u0 + (u1 - u0) * k / NR, R2 = ring(u), cyy = (R2.p.yb + R2.p.yt) / 2, n = R2.pts.length, idx = i1 == null ? [...Array(n).keys(), 0] : Array.from({ length: i1 - i0 + 1 }, (_, j) => i0 + j); rows.push(idx.map(j => { const [x, y] = R2.pts[j % n]; return [x * (1 + push), cyy + (y - cyy) * (1 + push), R2.p.z]; })); } return mesh(rows, 1.2); };
    // ---- THE SHELL: plan = rounded arrowhead (front rounded by a sine, widest at s 0.62, a little narrower at the stern), section = superellipse, the prow sits a touch lower
    const ZF = -4.5, ZR = HZ1, WMX = 2.45, PX = 2.4, NZ = low ? 16 : 30, NS = low ? 18 : 32, se = (c, e) => Math.sign(c) * Math.pow(Math.abs(c), e);
    const fS = s => s < 0.85 ? Math.pow(Math.sin(HP * Math.max(0, s) / 0.85), 1.05) : 1 - 0.06 * (s - 0.85) / 0.15;
    const sec = z => { const s = clamp01((z - ZF) / (ZR - ZF)), f = fS(s); return { W: WMX * f, cy: CY - 0.15 * (1 - f), ht: 0.62 * Math.sqrt(f), hbt: 0.66 * Math.pow(f, 0.4) }; };
    const topAt = (x, z) => { const q = sec(z), u = Math.min(1, Math.abs(x) / Math.max(1e-3, q.W)); return q.cy + q.ht * Math.pow(1 - Math.pow(u, PX), 1 / PX); };
    const surf = (z, th, push = 0) => { const q = sec(z), c = Math.cos(th), sn = Math.sin(th); return [q.W * (1 + push) * se(c, 2 / PX), q.cy + (sn >= 0 ? q.ht : q.hbt) * (1 + push) * se(sn, 2 / PX), z]; };
    const zAt = k => ZF + (ZR - ZF) * (0.004 + 0.996 * Math.pow(k / NZ, 1.6));
    { const rows = []; for (let k = 0; k <= NZ; k++) { const z = zAt(k), r = []; for (let j = 0; j <= NS; j++) r.push(surf(z, j / NS * TAU)); rows.push(r); } B.add(mesh(rows, 1.3), H, null, { out: 0.05 });
      const qR = sec(ZR), sh = new THREE.Shape(); for (let j = 0; j < NS; j++) { const [x, y] = surf(ZR, j / NS * TAU); j ? sh.lineTo(x, y) : sh.moveTo(x, y); } sh.closePath(); const hp = new THREE.Path(); hp.moveTo(-DW, DY0); hp.lineTo(-DW, DY1); hp.lineTo(DW, DY1); hp.lineTo(DW, DY0); hp.closePath(); sh.holes.push(hp); const rc = new THREE.ShapeGeometry(sh, 2); rc.translate(0, 0, ZR); B.add(rc, H, null, { out: 0 }); }
    // the accent RIM line all round the widest edge, belly panel, two accent stripes along the back
    for (const s of [-1, 1]) { const rim = [], st = []; for (let k = 1; k <= NZ; k++) { const z = zAt(k), q = sec(z); rim.push([s * (q.W + 0.004), q.cy, z]); if (z > -3.0) st.push([s * Math.min(0.95, q.W * 0.5), topAt(Math.min(0.95, q.W * 0.5), z) + 0.008, z]); } B.tube(rim, 0.032, A, { rseg: 4, caps: false }); if (st.length > 2) B.tube(st, 0.016, A, { rseg: 3, caps: false }); }
    { const rows = []; for (let k = 4; k <= NZ; k++) { const z = zAt(k), r = []; for (let j = 0; j <= 6; j++) r.push(surf(z, Math.PI * 1.32 + j / 6 * Math.PI * 0.36, 0.006)); rows.push(r); } B.add(mesh(rows, 9), mix(H, GRAPH, 0.3), null, { out: 0 }); }
    // the CANOPY band over the bridge + PORTHOLES along both sides
    const GB = glassBaker();
    { const rows = []; for (let k = 0; k <= 8; k++) { const z = -3.75 + 1.15 * k / 8, q = sec(z), r = []; for (let j = 0; j <= 8; j++) { const x = (j / 8 * 2 - 1) * q.W * 0.56; r.push([x, topAt(x, z) + 0.012, z]); } rows.push(r); } GB.add(mesh(rows, 0), DG, null, { glow: true, out: 0 }); }
    for (const s of [-1, 1]) for (let i = 0; i < 8; i++) { const z = -2.6 + i * 0.5, q = sec(z), q2 = sec(z + 0.05), ry = Math.atan2(q2.W - q.W, 0.05); B.box(0.03, 0.06, 0.13, DG, [s * q.W * 0.9, q.cy + q.ht * 0.5, z], [0, s * ry, 0], { glow: true, out: 0 }); }
    // the forward BATTERY: 4 cannons out of the prow rim
    const engines = [], extraG = [], guns = [], turs = [];
    for (const x of [-1.2, -0.62, 0.62, 1.2]) { let z = ZF; while (z < 0 && sec(z).W < Math.abs(x) + 0.06) z += 0.02; const y = sec(z).cy - 0.02; B.cyl(0.05, 0.06, 0.35, GRAPH2, [x, y, z + 0.05], [HP, 0, 0], { seg: 10 }); B.cyl(0.03, 0.035, 0.55, '#cfd4de', [x, y, z - 0.35], [HP, 0, 0], { seg: 8, out: 0.015 }); B.cyl(0.026, 0.026, 0.02, EDGE, [x, y, z - 0.63], [HP, 0, 0], { glow: true, seg: 8 }); guns.push([x, y - LIFT, z - 0.66]); }
    const eng = (x, y, z, rr) => { B.lathe([[rr * 0.6, 0], [rr, 0.12], [rr * 1.05, rr * 1.3], [rr * 0.7, rr * 1.5]], GRAPH2, [x, y, z], [HP, 0, 0], { seg: 14 }); B.cyl(rr * 0.62, rr * 0.62, 0.02, G, [x, y, z + rr * 1.5], [HP, 0, 0], { glow: true, seg: 12 }); B.tor(rr * 1.02, 0.02, A, [x, y, z + 0.12], 0, { seg: 16, tube: 3, out: 0 }); const o = new THREE.Object3D(); o.position.set(x, y, z + rr * 1.6); body.add(o); engines.push(o); const sp = spark(G, rr * 2.5); sp.position.copy(o.position); body.add(sp); extraG.push({ sp, rr }); };
    // two NACELLES hugging the rear flanks (rounded pods, glow strip on top, accent rings, the big engines out the back)
    for (const s of [-1, 1]) { const q = sec(0.9), x = s * (q.W - 0.12), y = q.cy; B.cap(0.24, 2.0, POD, [x, y, 0.75], [HP, 0, 0], { seg: 18, s: [1, 0.8, 1] }); B.box(0.12, 0.02, 1.9, EDGE, [x, y + 0.195, 0.75], 0, { glow: true }); for (const z of [0.0, 1.5]) B.tor(0.245, 0.02, A, [x, y, z], 0, { seg: 18, tube: 3, out: 0.01, s: [1, 0.8, 1] });
      B.rbox(0.2, 0.1, 0.5, 0.04, HD, [x, y, -0.45]); eng(x, y, 1.72, 0.21); LT.add([x, y + 0.26, -0.2], s > 0 ? GREEN : RED, 0.5, 0.8); LT.add([s * (DW + 0.05), DY0 + 0.05, HZ1 + 0.03], AMBER, 0.35, 1.4, s); }
    for (const s of [-1, 1]) eng(s * 0.78, 0.98, HZ1 - 0.04, 0.18); eng(0, 1.33, HZ1 - 0.04, 0.11);
    // 4 small SHOULDER TURRETS (they sweep on their own)
    { const T4 = baker(); T4.cyl(0.13, 0.16, 0.08, GRAPH2, [0, 0.04, 0], 0, { seg: 14 }); T4.rbox(0.2, 0.1, 0.24, 0.04, POD, [0, 0.13, 0]); T4.box(0.21, 0.02, 0.25, A, [0, 0.13, 0], 0, { out: 0 });
      for (const dx of [-0.05, 0.05]) { T4.cyl(0.018, 0.022, 0.36, '#cfd4de', [dx, 0.14, -0.3], [HP, 0, 0], { seg: 8, out: 0.012 }); T4.cyl(0.016, 0.016, 0.02, EDGE, [dx, 0.14, -0.48], [HP, 0, 0], { glow: true, seg: 8 }); }
      const tm = T4.bake('deckTurret'); [[-1, 1.38, -1.5], [1, 1.38, -1.5], [-1, 1.4, -0.15], [1, 1.4, -0.15]].forEach(([s, x, z], i) => { const q = i ? tm.clone() : tm, y = topAt(x, z) - 0.03; q.position.set(s * x, y, z); body.add(q); turs.push({ q, ph: i * 1.7, s }); guns.push([s * x, y + 0.14 - LIFT, z - 0.5]); }); }
    // optional WINGS (WING SHAPE; default none = the clean rounded hull)
    const WSH = L.wings || 'none', SPN = L.wingSpan ?? 0.6, WSZ = L.wingSize ?? 0.75, WY = CY + (L.wingY ?? 0) * 0.35, WR = WMX - 0.1;
    const PL = { swept: [[0, -0.25], [1.2, 0.7], [1.2, 1.08], [0, 1.3]], delta: [[0, -0.6], [1.15, 1.05], [1.15, 1.25], [0, 1.35]], straight: [[0, 0.15], [1.2, 0.3], [1.2, 0.95], [0, 1.15]], forward: [[0, 0.2], [1.2, -0.35], [1.2, 0.05], [0, 1.25]] }[WSH];
    if (PL) for (const s2 of [-1, 1]) { const pts = PL.map(([x, z]) => [x * SPN * WSZ, z * WSZ - 0.7]), w = new THREE.Shape(); pts.forEach(([x, z], i) => i ? w.lineTo(s2 * x, z) : w.moveTo(s2 * x, z)); w.closePath(); B.ext(w, 0.07 * Math.min(1.3, WSZ), L.wingCol || A, [s2 * WR, WY, 0], [HP, 0, 0], { bev: 0.025 });
      B.tube([[s2 * (WR + pts[0][0] + 0.02), WY + 0.04, pts[0][1]], [s2 * (WR + pts[1][0]), WY + 0.04, pts[1][1]]], 0.026, EDGE, { glow: true, rseg: 4, caps: false }); }
    // the DORSAL MOUND (the turret's base) + the door frame + 6 landing legs
    const TWZ = 0.72, MB = topAt(0, TWZ), MTOP = MB + 0.17; { const mg = new THREE.SphereGeometry(1, 22, 10, 0, TAU, 0, HP); B.add(mg, POD, new THREE.Matrix4().compose(new THREE.Vector3(0, MB - 0.03, TWZ), new THREE.Quaternion(), new THREE.Vector3(0.62, 0.2, 0.95)), { out: 0.03 }); B.tor(0.55, 0.02, A, [0, MB + 0.05, TWZ], [HP, 0, 0], { seg: 28, tube: 3, out: 0, s: [1, 1.55, 1] }); }
    for (const s of [-1, 1]) B.box(0.06, DY1 - DY0 + 0.1, 0.05, A, [s * (DW + 0.04), (DY0 + DY1) / 2, HZ1 + 0.02], 0, { out: 0 }); B.box(DW * 2 + 0.14, 0.06, 0.05, A, [0, DY1 + 0.03, HZ1 + 0.02], 0, { out: 0 });
    const LEGS = [[-0.85, -2.0], [0.85, -2.0], [-0.85, -0.35], [0.85, -0.35], [-0.85, 1.3], [0.85, 1.3]]; for (const [x, z] of LEGS) { B.cyl(0.06, 0.07, 0.36 - LIFT, GRAPH2, [x, (0.36 + LIFT) / 2, z], 0, { seg: 6 }); B.cyl(0.17, 0.19, 0.04, HD, [x, LIFT + 0.02, z], 0, { seg: 10 }); }
    const bp = t => ({ yt: topAt(0, HZ0 + (HZ1 - HZ0) * t) }), tOf = z => (z - HZ0) / (HZ1 - HZ0);
    // THE 8 CREST (as big as the roof allows) ahead of the turret, with the breathing pulse
    if (L.emblem !== false) { const Rc = L.crestSize ?? 1.0, cz = -1.65, cy = bp(tOf(cz)).yt - 0.02, P2 = baker(); P2.lathe([[0, -0.03], [Rc * 0.9, -0.02], [Rc + 0.03, 0.02], [Rc + 0.02, 0.06], [Rc * 0.9, 0.075], [0, 0.075]], H, [0, cy, cz], 0, { seg: 40, out: 0.03 }); P2.tor(Rc + 0.022, 0.018, A, [0, cy + 0.04, cz], [HP, 0, 0], { seg: 40, tube: 4, out: 0 }); body.add(P2.bake('crestPlate'));
      const N = 256, h2 = N / 2, mk = inv => { const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), rg = g.createRadialGradient(h2 * 0.9, h2 * 0.76, 4, h2, h2, h2 * 0.9), gc = new THREE.Color(L.crestGlow || '#5fd4ff');
        if (inv) { rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.45, '#' + gc.clone().lerp(new THREE.Color('#ffffff'), 0.35).getHexString()); rg.addColorStop(1, '#' + gc.getHexString()); } else { { const cp = L.crestPlate || ['#8fa8c8', '#44618c', '#1c2a42']; rg.addColorStop(0, cp[0]); rg.addColorStop(0.62, cp[1]); rg.addColorStop(1, cp[2]); } }
        g.beginPath(); g.arc(h2, h2, h2 * 0.9, 0, TAU); g.fillStyle = rg; g.fill(); g.lineWidth = N * 0.035; g.strokeStyle = '#231d3c'; g.stroke(); g.font = '900 ' + Math.round(N * 0.74) + 'px Archivo, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = N * 0.06;
        g.strokeStyle = inv ? '#ffffff' : '#141a2c'; g.strokeText(L.crestText || '8', h2, h2 * 1.07); g.fillStyle = inv ? '#141a2c' : (L.crestInk || '#ffffff'); g.fillText(L.crestText || '8', h2, h2 * 1.07); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
      const dg = new THREE.CircleGeometry(Rc * 0.86, SEG(40)), d1 = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ map: mk(false), transparent: true, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false })), d2 = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ map: mk(true), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, toneMapped: false }));
      for (const [m, y] of [[d1, 0.077], [d2, 0.079]]) { m.rotation.x = -HP; m.position.set(0, cy + y, cz); body.add(m); } anim.push(t => { const p = Math.max(0, Math.sin(t * 1.6 * (L.pulse ?? 1.2) / 1.2)); d2.material.opacity = Math.pow(p, 3) * 0.95; }); }
    // THE MANNED TURRET on the dorsal mound (same seat + dome + twin barrels as the gunner's)
    const TZ = TWZ, TS = 1.2, TY = MTOP - 0.02, tur = new THREE.Group(), pit = new THREE.Group(); tur.position.set(0, TY, TZ); tur.scale.setScalar(TS); body.add(tur); pit.position.y = 0.17; tur.add(pit);
    const T2 = baker(); T2.lathe([[0, 0], [0.54, 0], [0.56, 0.06], [0.5, 0.13], [0, 0.13]], GRAPH, [0, 0, 0], 0, { seg: 28 }); T2.tor(0.555, 0.022, A, [0, 0.07, 0], [HP, 0, 0], { seg: 28, tube: 3, out: 0 }); T2.tor(0.375, 0.018, HD, [0, 0.13, 0], [HP, 0, 0], { seg: 28, tube: 3, out: 0 });
    T2.tor(0.372, 0.011, HD, [0, 0.13, 0.04], 0, { seg: 28, tube: 3, out: 0 });
    T2.rbox(0.17, 0.05, 0.16, 0.02, '#ec3013', [0, 0.2, 0.07]); T2.rbox(0.17, 0.2, 0.04, 0.02, '#ec3013', [0, 0.31, 0.16]); T2.cyl(0.03, 0.04, 0.07, GRAPH2, [0, 0.16, 0.07], 0, { seg: 8 }); T2.rbox(0.22, 0.04, 0.07, 0.02, GRAPH2, [0, 0.15, -0.11]); T2.box(0.1, 0.025, 0.006, '#5dffa0', [0, 0.17, -0.143], [-0.6, 0, 0], { glow: true, out: 0 }); for (const s of [-1, 1]) T2.cyl(0.01, 0.012, 0.05, '#cfd4de', [s * 0.08, 0.19, -0.09], 0, { seg: 6, out: 0 });
    const tb = T2.bake('turret'); tur.add(tb);
    const P3 = baker(); for (const s2 of [-1, 1]) { const x = s2 * 0.47; P3.cyl(0.09, 0.09, 0.2, HD, [x, 0, 0], [0, 0, HP], { seg: 12 }); P3.rbox(0.15, 0.15, 0.5, 0.04, HD, [x, 0, -0.2]); P3.box(0.02, 0.03, 0.4, G, [x + s2 * 0.08, 0.02, -0.2], 0, { glow: true }); P3.cyl(0.045, 0.055, 1.0, '#cfd4de', [x, 0, -0.9], [HP, 0, 0], { seg: 10, out: 0.015 }); P3.tor(0.06, 0.016, A, [x, 0, -0.55], 0, { seg: 12, tube: 3, out: 0 }); P3.cyl(0.06, 0.05, 0.08, GRAPH2, [x, 0, -1.42], [HP, 0, 0], { seg: 10 }); P3.cyl(0.035, 0.035, 0.02, EDGE, [x, 0, -1.465], [HP, 0, 0], { glow: true, seg: 10 }); }
    const pb = P3.bake('turretGuns'); pit.add(pb);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.37, SEG(28), SEG(12), 0, TAU, 0, HP), new THREE.MeshBasicMaterial({ color: '#9fdcff', transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); dome.position.y = 0.13; tur.add(dome);
    const eye = new THREE.Object3D(); eye.position.set(0, 0.355, 0.03); tur.add(eye); const muzzles = [], flash = [];
    for (const s2 of [-1, 1]) { const o = new THREE.Object3D(); o.position.set(s2 * 0.47, 0, -1.5); pit.add(o); muzzles.push(o); const f = spark('#ffe08a', 0.01); f.position.copy(o.position); pit.add(f); f.material.opacity = 0; flash.push(f); guns.push([s2 * 0.47 * TS, TY + 0.17 * TS - LIFT, TZ - 1.5 * TS]); }
    LT.add([0, TY + 0.53 * TS, TZ], RED, 0.35, 1.2);
    let manned = false, yaw = 0, pitch = 0.1; const fl = [0, 0];
    anim.push((t, dt) => { const d = dt || 0.016; if (!manned) { yaw = Math.sin(t * 0.33) * 0.9; pitch = 0.1 + Math.sin(t * 0.5) * 0.06; } tur.rotation.y = yaw; pit.rotation.x = pitch; for (let i = 0; i < 2; i++) { fl[i] = Math.max(0, fl[i] - d * 9); flash[i].scale.setScalar(0.02 + fl[i] * 0.7); flash[i].material.opacity = fl[i]; } pb.position.z = (fl[0] + fl[1]) * 0.03; });
    anim.push((t) => { for (const T of turs) T.q.rotation.y = Math.sin(t * 0.4 + T.ph) * 0.8 + (T.s > 0 ? -0.15 : 0.15); });
    const HB = B.bake('flagWalkHull'); body.add(HB);
    { // s571 THE BRIDGE WINDOW: the shell is cut away under the canopy sheet in the fragment shader (a smooth edge that follows the shell's own plan), so the pilot fox shows through the glass
      const bm = HB.children.find(m => m.material === MAT.body); if (bm) { const m2 = MAT.body.clone(), rim = opts.rim || '#a9d4ff'; m2.onBeforeCompile = sh => { sh.uniforms.uRim = { value: new THREE.Color(rim) };
        sh.vertexShader = 'varying vec3 vLP;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvLP = position;');
        sh.fragmentShader = 'uniform vec3 uRim;\nvarying vec3 vLP;\n' + sh.fragmentShader.replace('void main() {', 'void main() {\n{ float s = clamp((vLP.z - (' + ZF.toFixed(4) + ')) / ' + (ZR - ZF).toFixed(4) + ', 0.0, 1.0); float f = s < 0.85 ? pow(sin(' + HP.toFixed(5) + ' * s / 0.85), 1.05) : 1.0 - 0.06 * (s - 0.85) / 0.15; float W = ' + WMX.toFixed(4) + ' * f; float cy = ' + CY.toFixed(4) + ' - 0.15 * (1.0 - f); if (vLP.z > -3.7 && vLP.z < -2.65 && vLP.y > cy + 0.05 && abs(vLP.x) < W * 0.54) discard; }')
          .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n{ float fr = 1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0); gl_FragColor.rgb += uRim * (pow(fr, 3.0) * 0.55 + step(0.86, fr) * 0.12); }'); }; bm.material = m2; } } body.add(GB.bake('bandGlass')); const RL = 0.8;
    const PB = baker(); PB.add(new THREE.PlaneGeometry(DW * 2, DY1 - DY0), '#15171c', mat4([0, (DY0 + DY1) / 2, HZ1 - 0.04]), { glow: true, out: 0 }); const plug = PB.bake('plug'); body.add(plug);
    const RB = baker(); RB.rbox(DW * 2, 0.05, RL, 0.02, HD, [0, -0.025, RL / 2]); for (let k = 0; k < 5; k++) RB.box(DW * 2 - 0.06, 0.012, 0.02, GRAPH2, [0, 0.003, 0.1 + k * 0.15], 0, { out: 0 }); for (const s of [-1, 1]) RB.box(0.03, 0.01, RL - 0.06, '#ffd23a', [s * (DW - 0.04), 0.004, RL / 2], 0, { glow: true });
    const RBk = RB.bake('ramp'), hinge = new THREE.Group(); hinge.position.set(0, DY0, HZ1); hinge.add(RBk); body.add(hinge);
    const OPEN = Math.asin((DY0 - LIFT) / RL); let k = L.ramp ?? 1, want = k; const set = () => { hinge.rotation.x = -HP + (HP + OPEN) * (1 - Math.pow(1 - k, 2)); }; set();
    anim.push((t, dt) => { if (Math.abs(want - k) > 1e-3) { k += Math.sign(want - k) * Math.min(Math.abs(want - k), (dt || 0.016) * 0.8); set(); } });
    const inkOf = G2 => G2.children.find(m => m.material === MAT.ink);
    const api = { thrust: 0, boost: false, guns, engines, setThrust(v) { api.thrust = v; }, setRamp(v) { want = clamp01(v); }, snapRamp(v) { k = want = clamp01(v); set(); }, get ramp() { return k; }, rampFoot: [0, 0, HZ1 + Math.cos(OPEN) * RL],
      turret: { eye, muzzles, dome, setBarrel(k) { pb.scale.z = k; muzzles.forEach(o => { o.position.z = -1.5 * k; }); flash.forEach((f, i) => { f.position.copy(muzzles[i].position); }); }, get yaw() { return yaw; }, get pitch() { return pitch; }, get manned() { return manned; }, aim(y, p) { manned = true; yaw = y; pitch = Math.max(-0.12, Math.min(1.25, p)); }, release() { manned = false; }, fire(i) { fl[i % 2] = 1; } },
      dims: { floor: DY0 - LIFT, doorW: DW, doorH: DY1 - DY0, hinge: HZ1, front: HZ0, rampLen: RL, open: OPEN, clear: 0.36 - LIFT, turret: [0, TZ], legs: LEGS.map(([x, z]) => [x, z, 0.07]), solids: [], noseLen: NL, Y0: DY0, pit: (() => { const q = sec(-3.2), w = q.W * 0.45; return { w, y0: DY0, y1: topAt(w, -3.5) - 0.03, z0: -3.55, z1: -2.6 }; })() }, prof, ring, BAND, plug, ink: [HB, RBk, tb, pb, ...turs.map(T => T.q)].map(inkOf).filter(Boolean), look: L };
    anim.push(t => { const kk = 0.35 + api.thrust * 0.5 + (api.boost ? 0.6 : 0); for (const e of extraG) { e.sp.scale.setScalar(e.rr * (2 + kk * 2.4 + Math.sin(t * 30 + e.rr) * 0.2)); e.sp.material.color.set(api.boost ? '#ffd23a' : G); e.sp.material.opacity = Math.min(1, 0.4 + kk * 0.5); } });
    body.position.y = -LIFT; root.add(body); const pts = LT.make(); if (pts) body.add(pts); return { root, pts, anim, hit: 4.2, api }; }
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const lerpA = (a, b, k) => a + (b - a) * k;
  const BUILD = { hullFlagWalk, hullGunship, hullCorvette, hullShuttle, hullCargo, hullFighter, hullGunner, hullCruiser, hullFlagship, hullColony, shastaStation, luxorStation, urStation, gayaStation, zionStation, neboStation, jiddaStation, homeStation, kufaStation, machineYard, ship, pirScout, pirCruiser, pirGunner, machScout, machCruiser, machGunner, merScout, merShuttle, merCruiser, merGunner, merFlagship, yard, fuel, mine, gate, dock, pirBase, dsf, buoy, wreck, voidMoth };
  for (const t in FLEET_WORLD) if (!BUILD[t]) BUILD[t] = L => worldShip(FLEET_BASE[t], L, FLEET_WORLD[t]);   // s596 world fleets
  function build(type, look = {}, o = {}) {
    const L = { ...defaults(type), ...look }, acc = L.worldTint && o.tint ? o.tint : L.accent;
    const r = BUILD[type](L, acc), group = new THREE.Group(); group.name = 'install_' + type; group.add(r.root);
    const pts = r.pts || (r.LT && r.LT.make()); if (pts && !r.pts) r.root.add(pts);
    group.scale.setScalar(L.size || 1); let T = 0; const ptsAll = []; group.traverse(m => { if (m.isPoints && m.userData.tick) ptsAll.push(m); }); const ph0 = Math.random() * 6;
    if (type === 'ship') group.userData.noFloat = true;
    return { group, hit: r.hit * (L.size || 1), api: r.api || null,
      tick(dt, ws) { T += dt; for (const f of r.anim) f(T, dt); for (const p of ptsAll) p.userData.tick(T, ws); if (!group.userData.noFloat) { r.root.position.y = Math.sin(T * 0.5 + ph0) * 0.18; r.root.rotation.z = Math.sin(T * 0.31 + ph0) * 0.008; } },
      stats() { let draws = 0, tris = 0; group.traverse(m => { if (m.isMesh || m.isSprite || m.isPoints) { draws++; const g = m.geometry; if (m.isMesh && g) tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } }); return { draws, tris: Math.round(tris) }; },
      dispose() { group.traverse(m => { if (m.geometry) m.geometry.dispose(); if (m.material && !Object.values(MAT).includes(m.material)) { if (m.material.map && m.material.map !== glowTex) m.material.map.dispose(); m.material.dispose(); } }); group.removeFromParent(); } };
  }
  return { build, trail, MAT, glowTex };
}
