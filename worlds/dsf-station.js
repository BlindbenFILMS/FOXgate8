// DEEP SPACE FOX · SPACE STATION 8 [dsfPromenade] (s349). The MAIN STATION, in orbit above MERU.
// The MAIN RING: two levels (shops below, the BALCONY above), the hub with the glass LIFT (a real ride) and the transport pad,
// windows onto space all round (Meru turning below, the gate, ships at the pylons). QUIRK'S BAR is the first full interior.
// Map data: kit/world-layout/layout/dsf.layout.json · 2D source: worlds/dsf-2d-summary.json (uploads/deep_space_fox_012.html).
import * as THREE from '../vendor/three/three.module.js';
import { rnd, rr, pick, clamp, smooth, lerp, damp, makeGradient, glowTexture, Ambience } from '../village-game.js';
import { crestTex } from '../engine/textures.js';
import { foxKit, PLAYER_MALE, HOPE_LOOK } from '../fox-kit.js';
import { castKit, loadCastRigs } from '../engine/cast.js';
import { save } from '../engine/save.js';
import { ITEM_LABELS } from './meru-shops.js';
import { D, pol, angOf, adiff, R, SPOKES, BRIDGES, BAYS, STAIRS, SHOPS, KIOSKS, SPOTS, buildStation, buildSpace, buildTraffic } from './dsf-look.js?v=350e';
import { QB, buildQuirks } from './dsf-quirks.js?v=s488';
import { CB, buildCargo } from './dsf-cargo.js?v=349g';
import { OPS, buildOps } from './dsf-ops.js?v=354';
import { QU, buildQuarters } from './dsf-quarters.js?v=350e';
import { IB, buildInfirmary } from './dsf-infirmary.js?v=357';
import { TB, buildTailor } from './dsf-tailor.js?v=362';
import { makeTailors } from './dsf-tailors.js?v=363b';
import { makeFitRoom } from './dsf-fitroom.js?v=362b';
import { TP, buildTemple } from './dsf-temple.js?v=359';
import { SB, buildSecurity } from './dsf-security.js?v=355';
import { HB, PROGRAMS, buildHolo } from './dsf-holo.js?v=351';
import { BK, buildBank } from './dsf-bank.js?v=351';
import { PB, buildPost } from './dsf-post.js?v=351';
import { EB, buildEngineering } from './dsf-engineering.js?v=s367b';
import { AB, buildArmory } from './dsf-armory.js?v=s475';
import { MB, buildBarracks } from './dsf-barracks.js?v=352';
import { HY, buildHydro } from './dsf-hydro.js?v=352';
import { VB, buildShip } from './dsf-ship.js?v=350e';
import { KU, KU_AT, KU_GAMES, podPt, buildKufa } from './dsf-kufa.js?v=s481';
import { LX, LX_NPCS, LX_GAMES, buildLuxorSt } from './dsf-luxor.js?v=s483';
import { SH, SH_NPCS, SH_GAMES, buildShastaSt } from './dsf-shasta.js?v=s491b';
import { UR, UR_NPCS, UR_GAMES, buildUrSt } from './dsf-ur.js?v=s492';
import { GA, GA_NPCS, GA_GAMES, buildGayaSt } from './dsf-gaya.js?v=s493';
import { ZI, ZI_NPCS, ZI_GAMES, buildZionSt } from './dsf-zion.js?v=s494';
import { NE, NE_NPCS, NE_GAMES, buildNeboSt } from './dsf-nebo.js?v=s495';
import { JI, JI_NPCS, JI_GAMES, buildJiddaSt } from './dsf-jidda.js?v=s496';
import { setupKiosks } from './dsf-kiosks.js?v=353b';
import { makeConsoleKit } from './dsf-console.js?v=363b';
import { makeDocking } from './dsf-docking.js?v=s473';
import { makeCargoScan } from './dsf-cargo-scan.js?v=s473';
import { makeHullRun } from './station-hullrun.js?v=s479';
import { makeArmWrestleConsole } from './station-armwrestle.js?v=s477d';
import { makeBoxingConsole } from './station-boxing.js?v=s476';
import { makeParlorConsole } from './station-parlor.js?v=s480b';
import { makeCapsuleConsole } from './station-capsule.js?v=s481';
import { makeSkewerConsole } from './station-skewer.js?v=s482';
import { makeStarTable } from './dsf-startable.js?v=s483';
import { makeDomeHarvest } from './dsf-garden.js?v=s484';
import { makeAssayBench } from './dsf-assay.js?v=s485b';
import { makeDominoesConsole } from './station-dominoes.js?v=s489';
import { makeChartTable } from './dsf-charts.js?v=s487';
import { makePachinkoConsole } from './station-pachinko.js?v=s488';
import { makeBoardConsole } from './station-board.js?v=s489';
import { makeRangeConsole } from './station-range.js?v=s475b';
import { makeConduit } from './dsf-conduit.js?v=s473';
import { makeBoneSet } from './dsf-bone-set.js?v=363b';
import { makeDaba } from './dsf-daba.js?v=358c';
import { makeShrine } from './dsf-shrine.js?v=359c';
import { makeBarShift } from './dsf-bar-shift.js?v=s478b';

const OUTFIT = { walkMonk: 'robe', ringPilgrim: 'robe', walkDocent: 'robe', vedek: 'robe', walkDaba: 'dress', walkFamilyA: 'dress', barSanna: 'dress', quirk: 'vest', nag: 'vest', ringMerchant: 'vest', walkTrader: 'vest', walkVendor: 'vest', jack: 'coat', walkHauler: 'coat', walkDocker: 'coat', barBrel: 'coat', barMarn: 'coat', barTeek: 'coat', dsfQuartermaster: 'vest', dsfSergeant: 'armor', dsfMilWren: 'armor', dsfMilRook: 'armor', dsfGrower: 'coat' };
const PLACE = { ring: 'Deep Space Fox · Main Ring', hub: 'Deep Space Fox · The Hub', balcony: 'Deep Space Fox · Balcony', bar: "Deep Space Fox · Quirk's Bar", cargo: 'Deep Space Fox · Cargo Bay Four', ops: 'Deep Space Fox · Operations', infirm: 'Deep Space Fox · Infirmary', tailor: "Deep Space Fox · Garok's", holo: "Deep Space Fox · Quirk's Holosuites", post: 'Deep Space Fox · Meru Embassy', engine: 'Deep Space Fox · Engineering', bank: 'Deep Space Fox · Latinum Vault', temple: 'Deep Space Fox · Temple of Gaya', security: 'Deep Space Fox · Security', qa: 'Deep Space Fox · Living Quarters A', qb: 'Deep Space Fox · Living Quarters B', office: "Deep Space Fox · Captain's Office", armory: 'Deep Space Fox · Armory', barracks: 'Deep Space Fox · Militia Bunkroom', hydro: 'Deep Space Fox · Hydroponics Bay' };

export async function createStation({ container, options = {}, onState = () => {}, onNavigate = () => {} }) {
  const opts = { quality: 'high', outlines: true, followCam: true, ...options };
  const LOW = opts.quality === 'low', OL = v => LOW ? 0 : v;
  try { await document.fonts.load('900 40px Archivo'); } catch (e) {}
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, LOW ? 1 : 2)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = !LOW; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(58, W() / H(), 0.1, 4200);
  scene.background = new THREE.Color(0x03040a);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra, (k2, v) => v && v.isTexture ? v.uuid : v) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x0a0d14, side: THREE.BackSide }); outlineMat.visible = !!opts.outlines;
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = !LOW; m.receiveShadow = true; if (outline && !LOW) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const bcache = new Map();
  const basic = (c, o = 1, add = false) => { const k = c + '|' + o + '|' + add; if (!bcache.has(k)) bcache.set(k, new THREE.MeshBasicMaterial({ color: c, transparent: o < 1 || add, opacity: o, depthWrite: !(o < 1 || add), blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide, toneMapped: false })); return bcache.get(k); };
  const glowSprite = (x, y, z, color, size, op = 0.8, parent) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op })); s.position.set(x, y, z); s.scale.setScalar(size); (parent || scene).add(s); return s; };
  const K = { THREE, scene, M, BOX, toon, basic, glowSprite, glowTexture, rnd, rr, pick, LOW };

  // light: warm promenade fill + a key light that follows the player for shadows
  scene.add(new THREE.HemisphereLight(0xffe2c0, 0x3a3028, 1.15));
  const key = new THREE.DirectionalLight(0xfff0dc, 1.1); key.castShadow = !LOW; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.04; scene.add(key, key.target);

  const space = buildSpace(K), ST = buildStation(K), traffic = buildTraffic(K), BAR = buildQuirks(K);
  const CARGO = buildCargo(K), OPSD = buildOps(K), INF = buildInfirmary(K), TAIL = buildTailor(K), TEMP = buildTemple(K, Math.min(9, (save.data.stats || {}).dsfCandles || 0)), SEC = buildSecurity(K), SHIP = buildShip(K), KUFA = buildKufa(K); for (const [k, r] of [['dsfTemple', 'temple'], ['dsfSecurity', 'security'], ['dsfShip', 'ship']]) { const s = SHOPS.find(q => q.key === k); s.open = true; s.room = r; } { const s = SHOPS.find(q => q.key === 'dsfTailor'); s.open = true; s.room = 'tailor'; } { const s = SHOPS.find(q => q.key === 'dsfInfirmary'); s.open = true; s.room = 'infirm'; } const ROOMS = { kufa: { Q: KU, mod: KUFA, shop: null }, ship: { Q: VB, mod: SHIP, shop: 'dsfShip' }, temple: { Q: TP, mod: TEMP, shop: 'dsfTemple' }, security: { Q: SB, mod: SEC, shop: 'dsfSecurity' }, tailor: { Q: TB, mod: TAIL, shop: 'dsfTailor', hire: 'FOXY TAILORS: a steady needle wanted. Garok takes you on once the station map is done.' }, infirm: { Q: IB, mod: INF, shop: 'dsfInfirmary', hire: 'BONE SET: steady paws wanted. Dr Bashad trains you once the station map is done.' }, bar: { Q: QB, mod: BAR, shop: 'dsfQuirks', hire: 'BAR STAFF WANTED. Steady paws, honest pours. Quirk takes you on.' }, cargo: { Q: CB, mod: CARGO, shop: 'dsfCargo', hire: 'CARGO LOADER WANTED. Strong back, steady nerve. The shift opens once the loaders are themselves again.' } };
  const LUXS = buildLuxorSt(K); ROOMS.luxs = { Q: LX, mod: LUXS, shop: null }; LUXS.hooks.say = (n, l, th) => say(n, l, th); LUXS.hooks.nav = url => fadeTo(() => onNavigate(url));   // s470 LUXOR STATION (Luxor's own station)
  const SHAS = buildShastaSt(K); ROOMS.shas = { Q: SH, mod: SHAS, shop: null }; SHAS.hooks.nav = url => fadeTo(() => onNavigate(url)); SHAS.hooks.cinemaShift = () => openPanel('Fox Cinema.dc.html?embed=1&work=1&world=' + encodeURIComponent('SHASTA STATION'));   // s490 SHASTA STATION
  const URS = buildUrSt(K); ROOMS.urs = { Q: UR, mod: URS, shop: null }; URS.hooks.nav = url => fadeTo(() => onNavigate(url));   // s492 UR STATION
  const GAS = buildGayaSt(K); ROOMS.gays = { Q: GA, mod: GAS, shop: null }; GAS.hooks.nav = url => fadeTo(() => onNavigate(url));   // s493 GAYA STATION
  const ZIS = buildZionSt(K); ROOMS.zios = { Q: ZI, mod: ZIS, shop: null }; ZIS.hooks.nav = url => fadeTo(() => onNavigate(url));   // s494 ZION STATION
  const NES = buildNeboSt(K); ROOMS.nebs = { Q: NE, mod: NES, shop: null }; NES.hooks.nav = url => fadeTo(() => onNavigate(url));   // s495 NEBO STATION
  const JIS = buildJiddaSt(K); ROOMS.jids = { Q: JI, mod: JIS, shop: null }; JIS.hooks.nav = url => fadeTo(() => onNavigate(url));   // s496 JIDDA STATION
  const HOLO = buildHolo(K), BANK = buildBank(K); for (const [k, r] of [['dsfHolosuites', 'holo'], ['dsfBank', 'bank']]) { const s = SHOPS.find(q => q.key === k); s.open = true; s.room = r; }
  ROOMS.holo = { Q: HB, mod: HOLO, shop: 'dsfHolosuites', hire: 'HOLO TECH WANTED: keep the programs clean. Pix trains you once the station map is done.' };
  ROOMS.bank = { Q: BK, mod: BANK, shop: 'dsfBank', hire: 'COIN COUNTER WANTED: sharp eyes, honest paws. Kess takes you on once the station map is done.' };
  const POST = buildPost(K), ENG = buildEngineering(K); ENG.setHatch(save.flag('oreHatchOpen')); ENG.setR8(save.flag('oreR8Free') ? 'free' : save.flag('oreHatchOpen') ? 'empty' : 'cradle'); for (const [k, r] of [['dsfPost', 'post'], ['dsfEngineering', 'engine']]) { const s = SHOPS.find(q => q.key === k); s.open = true; s.room = r; }
  ROOMS.post = { Q: PB, mod: POST, shop: 'dsfPost', hire: 'MAIL RUN: parcels round the ring, fast feet wanted. Lenn takes you on once the station map is done.' };
  ROOMS.engine = { Q: EB, mod: ENG, shop: 'dsfEngineering', hire: 'DAMAGE CONTROL CREW WANTED: suit up, stay calm. The Chief trains you once the station map is done.' };
  const ARM = buildArmory(K), MIL = buildBarracks(K), HYD = buildHydro(K); for (const [k, r] of [['dsfArmory', 'armory'], ['dsfBarracks', 'barracks'], ['dsfHydro', 'hydro']]) { const s = SHOPS.find(q => q.key === k); s.open = true; s.room = r; }
  ROOMS.armory = { Q: AB, mod: ARM, shop: 'dsfArmory', hire: "ARMORER'S APPRENTICE: oil, polish, patch. Drav takes you on once the station map is done.", first: ['dsfArmoryVisited', 'ARMORY', 'Try the target range on the right, or sharpen your blade at the grindstone.'] };
  ROOMS.barracks = { Q: MB, mod: MIL, shop: 'dsfBarracks', hire: 'NIGHT WATCH: walk the ring while the station sleeps. Holt signs you on once the station map is done.', first: ['dsfMilVisited', 'MILITIA BUNKROOM', 'The station\u2019s own militia. Drill on the dummy, and look at the empty post in the corner.'] };
  ROOMS.hydro = { Q: HY, mod: HYD, shop: 'dsfHydro', hire: 'HARVEST HAND: pick, plant, water. Moss takes you on once the station map is done.', first: ['dsfHydroVisited', 'HYDROPONICS BAY', 'The station grows its own food. Pull a honeyroot for Pav at the second bed.'] };
  const anims = [...ARM.anims, ...MIL.anims, ...HYD.anims, ...POST.anims, ...ENG.anims, ...HOLO.anims, ...BANK.anims, ...ST.anims, ...BAR.anims, ...CARGO.anims, ...OPSD.anims, ...INF.anims, ...TAIL.anims, ...TEMP.anims, ...SEC.anims, ...SHIP.anims, ...KUFA.anims, ...LUXS.anims, ...SHAS.anims, ...URS.anims, ...GAS.anims, ...ZIS.anims, ...NES.anims, ...JIS.anims];
  const fade = document.createElement('div'); fade.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .28s ease;z-index:1'; container.appendChild(fade);

  // ---------- people ----------
  const { makeFox, animFox } = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: !/[?&]foxmerge=0/.test(location.search) });
  const cast = castKit({ THREE, M, toon, makeFox }, await loadCastRigs());
  const fox = cast.make('player', { holster: true });
  const hope = cast.make('hope', { mood: 'warm' }), noble = cast.make('noble');
  const party = [{ c: hope, s: hope.scale.x, lag: 2.2 }, { c: noble, s: noble.scale.x, lag: 3.8 }];
  let S2 = { guests: [], clerics: [] }; try { S2 = await (await fetch(new URL('./dsf-2d-summary.json', import.meta.url))).json(); } catch (e) { console.warn('dsf 2D summary', e); }
  const G2 = {}; for (const g of [...(S2.guests || []), ...(S2.clerics || [])]) G2[g.key] = g;
  const QUD = buildQuarters(K, ST, S2.cabins || []); anims.push(...QUD.anims); for (const c of QUD.cabs) c.unlocked = !!c.mine || save.flag('dsfCabOpen_' + c.key);
  const lookOf = g => { const f = g.fur || {}, fc = g.faceCols || g.face || {}; return { ...(g.key === 'walkDaba' || g.key === 'dabaHost' || g.key === 'walkFamilyA' || g.key === 'barSanna' || g.key === 'walkDocent' ? HOPE_LOOK : PLAYER_MALE), fur: fc.furA || f.tailA || '#e3924e', furDark: fc.furB || f.tailB || '#b2601f', tailBase: f.tailB || '#b2601f', tailMid: f.tailA || '#e3924e', tailTip: f.tailTip || '#ffffff', paw: f.paw || '#b0631f', muzzle: fc.muzA || '#f6dcbc', armorAccent: g.trim || '#e0a13c' }; };
  const NPC = [];
  function addNpc(k, at, o = {}) { const g = G2[k] || { key: k, name: k.toUpperCase(), title: '' }; const torso = Array.isArray(g.torso) ? g.torso : ['#6a5a4a', '#4a3a2a', '#2a1e14'];
    const c = makeFox({ key: k, torso, look: lookOf(g), outfit: OUTFIT[k] || 'suit', eyes: ['#38bdf8', '#38bdf8'], mood: 'neutral' });
    const n = { key: k, name: g.name || k, role: g.title || '', lines: g.lines || [{ who: 'npc', text: 'STEWARD.' }], topics: g.topics || [], greeting: g.greeting, c, x: at[0], z: at[1], y: o.y || 0, inside: o.inside || null, face: o.face ?? 0, home: o.face ?? 0, keeper: !!o.keeper, walker: o.walker || null, asked: new Set(), wave: 0 };
    c.position.set(n.x, n.y, n.z); c.rotation.y = n.face; NPC.push(n); return n; }
  const faceTo = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
  const ring = (r, th) => pol(r, th);
  // the ring regulars (2D anchors, moved onto the 3D ring)
  { const at = ring(85, 150); addNpc('jack', at, { face: faceTo(at[0], at[1], 0, 0) }); }
  { const at = ring(84, 16); addNpc('ringEnsign', at, { face: faceTo(at[0], at[1], 0, 0) + 1.2 }); }
  { const at = ring(R.kiosk + 6.1, 225); addNpc('ringMerchant', at, { face: faceTo(at[0], at[1], 0, 0) + Math.PI, keeper: true }); }
  { const at = ring(R.kiosk + 6.2, 45); addNpc('walkVendor', at, { face: faceTo(at[0], at[1], 0, 0) + Math.PI, keeper: true }); }
  { const at = ring(95, 129); addNpc('ringPilgrim', at, { face: faceTo(at[0], at[1], 0, 0) + Math.PI }); }
  { const at = ring(94, 7.5); addNpc('walkDaba', at, { face: faceTo(at[0], at[1], 0, 0) - 0.5 }); }
  // walkers on the promenade lane
  const WALK = ['walkDeputy', 'walkMonk', 'walkHauler', 'walkEngineer', 'walkFamilyA', 'walkTrader', 'walkCrewman', 'walkDocent', 'walkSecurity', 'walkMedic', 'walkDocker'];
  WALK.slice(0, LOW ? 5 : 11).forEach((k, i) => { const th = (i * 360 / (LOW ? 5 : 11) + 17) % 360, r = 81 + (i % 3) * 3, dir = i % 2 ? 1 : -1, pace = (G2[k] && G2[k].ring && G2[k].ring.pace) || 0.8; const at = ring(r, th); addNpc(k, at, { walker: { r, th, dir, w: 0.9 * pace / r / D } }); });
  // Operations (y = OPS.y) + the Captain's Office
  const korra = addNpc('korra', [OPS.table.x - 3.9, OPS.table.z + 2.2], { y: OPS.y, face: faceTo(OPS.table.x - 3.9, OPS.table.z + 2.2, OPS.table.x, OPS.table.z) });
  korra.topics = [{ label: 'DOCKING CONTROL · TAKE THE BOARD', replies: [{ who: 'npc', text: 'Two berths, three ships, and me watching the clock. The board is yours.' }], act: () => playGame(DOCK) }, ...korra.topics];
  addNpc('dacks', [OPS.table.x + 3.9, OPS.table.z + 2.2], { y: OPS.y, face: faceTo(OPS.table.x + 3.9, OPS.table.z + 2.2, OPS.table.x, OPS.table.z) });
  const benny = addNpc('benny', [OPS.desk.x, OPS.desk.z - 1.45], { y: OPS.y, face: 0 });
  // Living Quarters A + B residents (2D resTarr / resBek on A, resMeela / resPav on B)
  for (const [k, r, th, y] of [['resTarr', 7.4, 300, -14], ['resBek', 7.4, 52, -14], ['resMeela', 7.6, 262, -28]]) { const [x, z] = pol(r, th); addNpc(k, [x, z], { y, face: faceTo(x, z, 0, 0) }); }
  addNpc('resPav', [-2.4, -13.4], { y: -28, face: faceTo(-2.4, -13.4, 0, -13.4) });
  const opa = addNpc('vedek', [TP.OX + TP.keeper.x, TP.keeper.z], { inside: 'temple', keeper: true, face: faceTo(TP.keeper.x, TP.keeper.z, TP.flame.x, TP.flame.z) });
  const warf = addNpc('warf', [SB.OX + SB.warf.x, SB.warf.z], { inside: 'security', face: 0 });
  warf.topics = [{ label: 'CARGO SCAN · WORK THE BELT', replies: [{ who: 'npc', text: 'The belt runs whether anyone is reading it or not. Read it.' }], act: () => playGame(SCAN) }, ...(warf.topics || [])];
  addNpc('oddo', [SB.OX + SB.odd.x, SB.odd.z], { inside: 'security', face: Math.PI });
  addNpc('brigRosk', [SB.OX + SB.rosk.x, SB.rosk.z], { inside: 'security', face: 0 });
  { const POD = { kuOps: 'dsfOutKu_ops', kuDuty: 'dsfOutKu_ops', kuCrew: 'dsfOutKu_crew', kuHandA: 'dsfOutKu_crew', kuHandB: 'dsfOutKu_crew', kuHandC: 'dsfOutKu_crew', kuImex: 'dsfOutKu_imex', kuCharts: 'dsfOutKu_charts', kuRelic: 'dsfOutKu_relics' };
    for (const k of ['kuOps', 'kuDuty', 'kuCrew', 'kuHandA', 'kuHandB', 'kuHandC', 'kuImex', 'kuCharts', 'kuRelic', 'kuGarden', 'kuSitA', 'kuSitB', 'kuWater']) { const [x, z] = KU_AT[k], p = POD[k] && KU.pods.find(q => q.key === POD[k]), [tx, tz] = p ? podPt(p, 0, 3) : k === 'kuWater' ? [0, -5.6] : [0, 0];
      addNpc(k, [KU.OX + x, z], { inside: 'kufa', face: faceTo(KU.OX + x, z, KU.OX + tx, tz) }); } }
  for (const n of JI_NPCS) { G2[n.key] = { key: n.key, ...n.g }; OUTFIT[n.key] = n.outfit; addNpc(n.key, [JI.OX + n.at[0], n.at[1]], { inside: 'jids', face: faceTo(n.at[0], n.at[1], n.look[0], n.look[1]) }); }
  for (const n of NE_NPCS) { G2[n.key] = { key: n.key, ...n.g }; OUTFIT[n.key] = n.outfit; addNpc(n.key, [NE.OX + n.at[0], n.at[1]], { inside: 'nebs', face: faceTo(n.at[0], n.at[1], n.look[0], n.look[1]) }); }
  for (const n of ZI_NPCS) { G2[n.key] = { key: n.key, ...n.g }; OUTFIT[n.key] = n.outfit; addNpc(n.key, [ZI.OX + n.at[0], n.at[1]], { inside: 'zios', face: faceTo(n.at[0], n.at[1], n.look[0], n.look[1]) }); }
  for (const n of GA_NPCS) { G2[n.key] = { key: n.key, ...n.g }; OUTFIT[n.key] = n.outfit; addNpc(n.key, [GA.OX + n.at[0], n.at[1]], { inside: 'gays', face: faceTo(n.at[0], n.at[1], n.look[0], n.look[1]) }); }
  for (const n of UR_NPCS) { G2[n.key] = { key: n.key, ...n.g }; OUTFIT[n.key] = n.outfit; addNpc(n.key, [UR.OX + n.at[0], n.at[1]], { inside: 'urs', face: faceTo(n.at[0], n.at[1], n.look[0], n.look[1]) }); }
  for (const n of SH_NPCS) { G2[n.key] = { key: n.key, ...n.g }; OUTFIT[n.key] = n.outfit; addNpc(n.key, [SH.OX + n.at[0], n.at[1]], { inside: 'shas', face: faceTo(n.at[0], n.at[1], n.look[0], n.look[1]) }); }
  for (const n of LX_NPCS) { G2[n.key] = { key: n.key, ...n.g }; OUTFIT[n.key] = n.outfit; addNpc(n.key, [LX.OX + n.at[0], n.at[1]], { inside: 'luxs', face: faceTo(n.at[0], n.at[1], n.look[0], n.look[1]) }); }
  const garok = addNpc('garok', [TB.OX + TB.keeper.x, TB.keeper.z], { inside: 'tailor', keeper: true, face: 0 });
  const bashad = addNpc('bashad', [IB.OX + IB.keeper.x, IB.keeper.z], { inside: 'infirm', keeper: true, face: 0 });
  const pix = addNpc('dsfHoloPix', [HB.OX + HB.keeper.x, HB.keeper.z], { inside: 'holo', keeper: true, face: 0 });
  Object.assign(pix, { name: 'PIX', role: 'Holosuite attendant (DRAFT name)', greeting: 'Grid is warm, STEWARD. What are we playing?', lines: [{ who: 'npc', text: 'STEWARD! Suite One just came free. Pick a program and step through the arch.' }],
    topics: [{ label: 'Book a program', replies: [{ who: 'npc', text: 'Court, cage or ring. Quirk takes a cut of all three.' }], act: () => holoMenu() },
      { label: 'Why are Two and Three booked?', replies: [{ who: 'npc', text: 'Booked until second shift. Quirk will not say who. Neither will I.' }] },
      { label: 'Anything strange lately?', replies: [{ who: 'npc', text: 'Suite Two ran a program nobody booked. Robots marching, voices not their own.' }, { who: 'npc', text: 'I pulled the plug. The log says the order came from the Fleet.' }] }] });
  const lenn = addNpc('dsfPostmaster', [PB.OX + PB.keeper.x, PB.keeper.z], { inside: 'post', keeper: true, face: 0 });
  Object.assign(lenn, { name: 'POSTMASTER LENN', role: 'Meru Embassy · Galactic Post (DRAFT name)', greeting: 'Mail for Meru goes up the tube, STEWARD. Same as ever.', lines: [{ who: 'npc', text: 'STEWARD! Meru\u2019s own office, right here above home. Letters, parcels, permits.' }],
    topics: [{ label: 'Send a letter home', replies: [{ who: 'npc', text: 'Write it short. The tube does not like long words.' }], act: () => postMenu() },
      { label: 'Anything for me?', replies: [{ who: 'npc', text: 'Locker 8 is yours. Parcels from Meru land there.' }] },
      { label: 'Is the mail running?', replies: [{ who: 'npc', text: 'To Meru, yes. To Pearl Sail, no. Letters come back unopened.' }, { who: 'npc', text: 'The Fleet mail-runners just stopped answering. One said \u201Csorry\u201D first.' }] }] });
  bashad.topics = [{ label: 'BONE SET \u00b7 TAKE A CASE', replies: [{ who: 'npc', text: 'Four fractures on the board. Seat every fragment before the clock runs out.' }], act: () => playGame(BONE) }, ...(bashad.topics || [])];
  const obrain = addNpc('obrain', [EB.OX + EB.keeper.x, EB.keeper.z], { inside: 'engine', keeper: true, face: 0 });
  const oreTalk = () => { if (save.flag('oreReported')) return { label: 'THE ORE SHAFT', replies: [{ who: 'npc', text: 'The miners run their own shifts now. Free will. Strange times, STEWARD.' }] };
    if (save.flag('oreBossDone')) return { label: 'REPORT \u00b7 THE ORE SHAFT', replies: [{ who: 'npc', text: 'A transmitter? Sending the hack down to Meru? Under my own deck plates.' }, { who: 'npc', text: 'Ore is moving again. And R-8 chose you. Look after him.' }],
      act: () => { save.setFlag('oreReported'); save.addGold(100); toast('+100 GOLD \u00b7 THE CHIEF\u2019S THANKS'); St.dialog = { npc: obrain, i: 0, lines: [], choices: [] }; offerTopics(obrain); } };
    if (save.flag('oreHatchOpen')) return { label: 'THE ORE SHAFT \u00b7 ANY TIPS?', replies: [{ who: 'npc', text: 'Hit them while they rest. Stun them, never scrap them. They are our miners.' }, { who: 'npc', text: 'R-8 can build an unhacker from parts down there. Trust him.' }] };
    if (save.flag('dsfConduitDone')) return { label: 'THE ORE SHAFT HATCH', replies: [{ who: 'npc', text: 'Junction 8 is flowing. Right. I am unsealing the hatch.' }, { who: 'npc', text: 'Take R-8. He keeps nearly shorting out, but he knows the old levels.' }],
      act: () => { save.setFlag('oreQuest'); save.setFlag('oreHatchOpen'); ENG.setHatch(true, true); ENG.setR8('empty'); audio.tone(110, 1.6, 0.06, 'sawtooth', 2); toast('ORE SHAFT HATCH UNSEALED \u00b7 NORTH-WEST CORNER'); St.dialog = { npc: obrain, i: 0, lines: [], choices: [] }; offerTopics(obrain); } };
    return { label: 'THE ORE SHAFT HATCH', replies: [{ who: 'npc', text: 'Ore from the old shaft stopped. The miners went quiet. Security sealed it after the water main burst.' }, { who: 'npc', text: 'The hatch seal runs off junction 8. Fix the Conduit Deck, then I can open it.' }],
      act: () => { save.setFlag('oreQuest'); St.dialog = { npc: obrain, i: 0, lines: [], choices: [] }; offerTopics(obrain); } }; };
  obrain.topics = [{ get label() { return oreTalk().label; }, get replies() { return oreTalk().replies; }, get act() { return oreTalk().act; } }, { label: 'CONDUIT DECK \u00b7 FIX A PANEL', replies: [{ who: 'npc', text: 'Junction 8 is scrambled again. Turn the pipes till every line flows. Mind the par.' }], act: () => playGame(COND) }, ...(obrain.topics || [])];
  const kess = addNpc('dsfBanker', [BK.OX + BK.keeper.x, BK.keeper.z], { inside: 'bank', keeper: true, face: -Math.PI / 2 });
  Object.assign(kess, { name: 'AUDITOR KESS', role: 'Latinum Vault (DRAFT name)', greeting: 'Back again, STEWARD? The door still weighs nine tonnes.', lines: [{ who: 'npc', text: 'STEWARD. Welcome to the Latinum Vault. Your gold is safer here than in Quirk\u2019s till.' }],
    topics: [{ label: 'Deposit or withdraw', replies: [{ who: 'npc', text: 'Of course. Count it twice. I always do.' }], act: () => bankMenu() },
      { label: 'Open the vault', replies: [{ who: 'npc', text: 'For you, STEWARD. Stand clear of the door.' }], act: () => openVault() },
      { label: 'Is it really safe?', replies: [{ who: 'npc', text: 'Nine bolts, three locks, and me. Nothing walks out.' }, { who: 'npc', text: 'The counting bots stopped mid-count last week. Glitching. I count by paw now.' }] }] });
  const drav = addNpc('dsfQuartermaster', [AB.OX + AB.keeper.x, AB.keeper.z], { inside: 'armory', keeper: true, face: 0 });
  Object.assign(drav, { name: 'QUARTERMASTER DRAV', role: 'Armory (DRAFT name)', greeting: 'Blades left, lasers right, STEWARD. The range is open.', lines: [{ who: 'npc', text: 'STEWARD. Everything on this wall is sharp, charged, or both. Mind your tail.' }],
    topics: [{ label: 'Show me the gear', replies: [{ who: 'npc', text: 'Swords, lasers, shields. Fitting your 8 armour comes with the shop upgrades.' }] },
      { label: 'Try the range', replies: [{ who: 'npc', text: 'Lane one. Five shots. Do not aim at me.' }], act: () => ARM.rangeMenu(X()) },
      { label: 'Why are those drones crated?', replies: [{ who: 'npc', text: 'Sentry drones, sent back from Pearl Sail. They fired on their own handlers.' }, { who: 'npc', text: 'One keeps saying sorry. In a voice I almost know.' }] }] });
  const holt = addNpc('dsfSergeant', [MB.OX + MB.keeper.x, MB.keeper.z], { inside: 'barracks', keeper: true, face: 0 });
  Object.assign(holt, { name: 'SERGEANT HOLT', role: 'Militia (DRAFT name)', greeting: 'At ease, STEWARD. Your name is on the roster. In pencil.', lines: [{ who: 'npc', text: 'STEWARD! Militia bunkroom. We keep the ring quiet so Security can sleep.' }],
    topics: [{ label: 'What does the Militia do?', replies: [{ who: 'npc', text: 'Night watch, drills, the dull jobs. Twelve of us. Used to be thirteen.' }] },
      { label: 'Drill with the dummy', replies: [{ who: 'npc', text: 'Three strikes. Show me your form.' }], act: () => MIL.drill(X()) },
      { label: 'Where is Unit-9?', replies: [{ who: 'npc', text: 'Our Fleet liaison. Six years on that post. Never missed a shift.' }, { who: 'npc', text: 'Last week it walked out mid-watch. Nobody gave the order.' }] }] });
  Object.assign(addNpc('dsfMilWren', [MB.OX + MB.wren.x, MB.wren.z], { inside: 'barracks', face: Math.PI / 2 }), { name: 'CORPORAL WREN', role: 'Militia (DRAFT name)', lines: [{ who: 'npc', text: 'Holt says I snore. Holt is wrong. Holt is always wrong.' }] });
  Object.assign(addNpc('dsfMilRook', [MB.OX + MB.rook.x, MB.rook.z], { inside: 'barracks', face: Math.PI / 2 }), { name: 'PRIVATE ROOK', role: 'Militia (DRAFT name)', lines: [{ who: 'npc', text: 'Unit-9 taught me cards. It always let me win.' }, { who: 'npc', text: 'Robots do not do that. Unless they like you.' }] });
  const moss = addNpc('dsfGrower', [HY.OX + HY.keeper.x, HY.keeper.z], { inside: 'hydro', keeper: true, face: 0 });
  Object.assign(moss, { name: 'GROWER MOSS', role: 'Hydroponics Bay (DRAFT name)', greeting: 'Mind the channels, STEWARD. Wet paws everywhere.', lines: [{ who: 'npc', text: 'STEWARD! Every leaf on this station starts here. Every honeyroot too.' }],
    topics: [{ label: 'What grows up here?', replies: [{ who: 'npc', text: 'Greens, bluefruit, star kelp, and honeyroot for Pav. Enough to feed the ring.' }] },
      { label: 'Pull some honeyroot', replies: [{ who: 'npc', text: 'Second bed. Grip low, pull slow.' }], act: () => HYD.harvestMenu(X()) },
      { label: 'The drones look busy', replies: [{ who: 'npc', text: 'Pollinators. Fleet-built. Three are fine.' }, { who: 'npc', text: 'P-3 circles one bed all day. It hums my tune, backwards.' }] }] });
  ROOMS.armory.keeper = drav; ROOMS.barracks.keeper = holt; ROOMS.hydro.keeper = moss;
  // Quirk's Bar
  const bx = (x, z) => [QB.OX + x, z];
  const quirk = addNpc('quirk', bx(-7.5, -8.5), { inside: 'bar', keeper: true, face: 0 }); /* s360: moved down the bar, the middle is the BAR SHIFT station */
  // s358: the Daba crowd stands round the new long table (Nag at the west end, Marn at the south rail)
  const nagN = addNpc('nag', bx(BAR.DT.x - 4.0, BAR.DT.z + 0.4), { inside: 'bar', face: faceTo(BAR.DT.x - 4.0, BAR.DT.z + 0.4, BAR.DT.x - 1.4, BAR.DT.z) });
  // s358b: CELESTE (DRAFT name), the Daba wheel host in a long plum satin gown, deals from the north side of the table
  OUTFIT.dabaHost = 'dress'; G2.dabaHost = { key: 'dabaHost', name: 'CELESTE', title: 'Daba wheel host (DRAFT name)', torso: ['#7a1f4a', '#5a1436', '#2e0a1c'], trim: '#f0c040', fur: { tailA: '#f2e6d8', tailB: '#d2b896', tailTip: '#ffffff', paw: '#c8ab88' }, faceCols: { furA: '#f2e6d8', furB: '#d2b896', muzA: '#ffffff' },
    greeting: 'Welcome back to the wheel, STEWARD. Feeling lucky?', lines: [{ who: 'npc', text: 'Good evening, STEWARD. I am Celeste. The wheel is warm and the gold is real.' }] };
  const host = addNpc('dabaHost', bx(BAR.DT.x - 1.4, BAR.DT.z - 2.2), { inside: 'bar', keeper: true, face: 0 });
  host.topics = [{ label: 'DABA \u00b7 PLAY THE WHEEL', replies: [{ who: 'npc', text: 'One colour on each ring. Stop the meter on a big \u00d7. Good luck, darling.' }], act: () => playGame(DABA) },
    { label: 'Who ran the wheel before you?', replies: [{ who: 'npc', text: 'A Fleet bot. Perfect hands, never lost.' }, { who: 'npc', text: 'One night it shook, paid everyone back, and begged me to take over.' }] }];
  { const P2 = host.c.userData.P; if (P2 && P2.body) { const satin = toon('#7a1f4a', { emissive: new THREE.Color('#2a0618'), emissiveIntensity: 0.5 }), gM = toon('#f0c040', { emissive: new THREE.Color('#6a4a00'), emissiveIntensity: 0.6 }), pearl = toon('#fbf6ee', { emissive: new THREE.Color('#5a5650'), emissiveIntensity: 0.5 });
    const sk = new THREE.Mesh(new THREE.LatheGeometry([[0.62, 0], [0.58, 0.07], [0.51, 0.3], [0.43, 0.55], [0.35, 0.72], [0.29, 0.82]].map(([r, y]) => new THREE.Vector2(r, y)), 28), satin); P2.body.add(sk);
    const ring2 = (r, tb, mat, y, p = P2.body) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, tb, 6, 32), mat); m.rotation.x = Math.PI / 2; m.position.y = y; p.add(m); return m; };
    ring2(0.61, 0.026, gM, 0.03); ring2(0.5, 0.012, gM, 0.32); ring2(0.3, 0.03, gM, 0.79);
    const nk = ring2(0.19, 0.022, pearl, 1.3); nk.rotation.x = Math.PI / 2 - 0.35; nk.position.z = 0.03;
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.055), new THREE.MeshBasicMaterial({ color: '#e0203a', toneMapped: false })); gem.position.set(0, 1.19, 0.2); P2.body.add(gem);
    if (P2.head) { const ti = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.022, 6, 18, Math.PI), gM); ti.position.set(0, 0.3, 0.02); ti.rotation.x = -0.25; P2.head.add(ti); const tg = gem.clone(); tg.scale.setScalar(0.8); tg.position.set(0, 0.5, 0); P2.head.add(tg);
      const rose = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), toon('#c0283a')); rose.position.set(0.27, 0.24, -0.02); P2.head.add(rose); } } }
  const marnN = addNpc('barMarn', bx(BAR.DT.x - 1.8, BAR.DT.z + 2.5), { inside: 'bar', face: faceTo(BAR.DT.x - 1.8, BAR.DT.z + 2.5, BAR.DT.x - 1.4, BAR.DT.z) });
  [['barBrel', -7.5, 1.5, 0.9, 0.4], ['barSanna', -2.5, 4.6, -0.9, 0.5], ['barTeek', 2.8, 1.2, 0.9, -0.5]].forEach(([k, x, z, ox, oz]) => { const px = x + ox, pz = z + oz + 0.9; addNpc(k, bx(px, pz), { inside: 'bar', face: faceTo(px, pz, x, z) }); });

  { const dm = addNpc('dsfDockmaster', [CB.OX + CB.desk.x, CB.desk.z - 1.3], { inside: 'cargo', keeper: true, face: 0 }); Object.assign(dm, { name: 'DOCKMASTER', role: 'Cargo Bay Four (DRAFT name)', lines: [{ who: 'npc', text: 'STEWARD. Bay Four. Shuttles in, shuttles out, nothing goes missing.' }, { who: 'npc', text: 'Except the loaders. They went strange three shifts ago.' }],
    topics: [{ label: 'Hire a shuttle', replies: [{ who: 'npc', text: 'Meru any time. Kufa Station when the Vole is back.' }], act: () => prompt('SHUTTLE HIRE', 'Cargo Bay Four', [['SHUTTLE TO MERU', shuttleMeru], ['KUFA STATION · LATER', null, true], ['STAY', null]]) },
      { label: 'What happened to the loaders?', replies: [{ who: 'npc', text: 'They stopped mid-lift and started talking in somebody else\u2019s voice.' }, { who: 'npc', text: 'Security says leave them. I say something got into their heads.' }] }] }); }
  // ---------- state ----------
  const St = { t: 0, phase: 'start', yaw: 0, pitch: 0.36, dist: 8.5, dragT: 0, dialog: null, prompt: null, toast: null, note: null, muted: false, inside: null, lift: null, beam: null, locks: {}, quest: !save.flag('dsfBarVisited') ? 0 : !save.flag('dsfBalcony') ? 1 : !save.flag('dsfLookout') ? 2 : !save.flag('dsfOps') ? 3 : !save.flag('dsfMetBenny') ? 4 : 5, paused: false, hudPad: false };
  const P = { x: ST.PAD.x, z: ST.PAD.z + 0.2, gy: 0, jy: 0, vy: 0, vx: 0, vz: 0, face: Math.PI, ground: true, stepT: 0 };
  const trail = []; const pushTrail = () => { const l = trail[trail.length - 1]; if (!l || Math.hypot(l.x - P.x, l.z - P.z) > 0.3 || Math.abs(l.y - P.gy) > 0.3) { trail.push({ x: P.x, z: P.z, y: P.gy }); if (trail.length > 60) trail.shift(); } };
  const resetTrail = () => { trail.length = 0; for (let i = 0; i < 20; i++) trail.push({ x: P.x - Math.sin(P.face) * (6 - i * 0.3), z: P.z - Math.cos(P.face) * (6 - i * 0.3), y: P.gy }); };

  // ---------- walking surfaces ----------
  const perp = (x, z, a) => x * Math.cos(a * D) + z * Math.sin(a * D), along = (x, z, a) => x * Math.sin(a * D) - z * Math.cos(a * D);
  const stairUV = (s, x, z) => { const dx = x - s.a[0], dz = z - s.a[1]; return [dx * s.ux + dz * s.uz, -dx * s.uz + dz * s.ux]; };
  const BAL_OBS = [], BAL_SPOTS = [];   // s489 balcony club tables (filled once the tables are built)
  function floorBlocked(x, z, r, th) {
    for (const o of ST.obs) if (Math.hypot(x - o.x, z - o.z) < o.r) return true;
    for (const k of KIOSKS) { const t = x * Math.cos(k.th * D) + z * Math.sin(k.th * D), rr2 = along(x, z, k.th) - R.kiosk; if (Math.abs(t) < k.w / 2 + 0.35 && rr2 > -k.d / 2 - 0.35 && rr2 < k.d / 2 + k.front) return true; }
    for (const s of SHOPS) { const dd = adiff(th, s.th); if (Math.abs(dd) < s.half + 0.4 && r * Math.cos(dd * D) > s.df - 0.45) return true; }
    for (const b of BAYS) if (Math.abs(adiff(th, b)) < 4.8 && r > 98.2) return true;
    for (const s of STAIRS) { const [u, v] = stairUV(s, x, z); if (u > 1.0 && u < s.L + 0.6 && Math.abs(v) < 1.75) return true; const d = adiff(th, s.th1); if (r > 87.4 && r < 93 && d > -0.6 && d < 2.8) return true; }
    return false; }
  function surfaces(x, z) {
    if (St.inside) { const RM = ROOMS[St.inside]; return RM.mod.walk(x - RM.Q.OX, z) ? [0] : []; }
    const out = [], r = Math.hypot(x, z), th = angOf(x, z);
    let fl = (r >= R.drop + 0.45 && r <= R.wall - 0.6) || (r >= R.core + 0.75 && r <= R.hub - 0.3);
    if (!fl && r > R.hub - 1.2 && r < R.drop + 1.2) for (const a of SPOKES) if (Math.abs(perp(x, z, a)) < 2.55 && along(x, z, a) > 0) fl = true;
    if (fl && !floorBlocked(x, z, r, th)) out.push(0);
    for (const s of STAIRS) { const [u, v] = stairUV(s, x, z); if (u >= -0.4 && u <= s.L + 0.4 && Math.abs(v) < 1.45) out.push(R.yb * clamp(u / s.L, 0, 1)); }
    let up = (r >= R.bal0 + 0.45 && r <= R.bal1 - 0.7) || (r >= R.core + 0.75 && r <= R.upHub - 0.35);
    if (!up && r > R.upHub - 1 && r < R.bal0 + 1) for (const a of BRIDGES) if (Math.abs(perp(x, z, a)) < 1.65 && along(x, z, a) > 0) up = true;
    if (!up) for (const s of STAIRS) { const d = adiff(th, s.th1); if (r > 87.6 && r < 93 && d > -0.5 && d < 2.6) up = true; }
    if (up && !BAL_OBS.some(o => Math.hypot(x - o.x, z - o.z) < o.r)) out.push(R.yb);
    if (OPSD.walk(x, z)) out.push(OPS.y);
    for (const dk of QUD.decks) if (QUD.walk(dk, x, z)) out.push(dk.y);
    return out; }
  const groundAt = (x, z, gy) => { let best = null, bd = 0.95; for (const h of surfaces(x, z)) { const d = Math.abs(h - gy); if (d < bd) { bd = d; best = h; } } return best; };
  const levelOf = () => St.inside ? (St.inside === 'ship' ? SHIP.label(P.z) : St.inside === 'kufa' ? KUFA.label(P.x - KU.OX, P.z) : St.inside === 'luxs' ? LUXS.label(P.x - LX.OX, P.z) : St.inside === 'shas' ? SHAS.label(P.x - SH.OX, P.z) : St.inside === 'urs' ? URS.label(P.x - UR.OX, P.z) : St.inside === 'gays' ? GAS.label(P.x - GA.OX, P.z) : St.inside === 'zios' ? ZIS.label(P.x - ZI.OX, P.z) : St.inside === 'nebs' ? NES.label(P.x - NE.OX, P.z) : St.inside === 'jids' ? JIS.label(P.x - JI.OX, P.z) : St.inside) : P.gy < -5 ? (() => { const c = QUD.cabinAt(P.x, P.z, P.gy); return c ? 'Deep Space Fox · ' + c.num + ' ' + c.label : P.gy < -21 ? 'qb' : 'qa'; })() : P.gy > 20 ? (OPSD.inOffice(P.x, P.z) ? 'office' : 'ops') : P.gy > R.yb - 0.5 ? (Math.hypot(P.x, P.z) < R.upHub + 1 ? 'hub' : 'balcony') : Math.hypot(P.x, P.z) < R.drop ? 'hub' : 'ring';

  // ---------- audio + messages ----------
  const audio = new Ambience();
  const toast = t => { St.toast = { text: t, t: 0 }; };
  const note = (title, sub) => { St.note = { title, sub, t: 0 }; };
  function prompt(title, body, buttons) { St.prompt = { title, body, buttons: buttons.map(b => ({ label: b[0], act: b[1], off: !!b[2] })) }; input.jx = input.jy = 0; audio.tone(520, 0.18, 0.05, 'square'); }
  const chime = () => { audio.tone(1318, 0.5, 0.05, 'sine'); setTimeout(() => audio.tone(1760, 0.7, 0.04, 'sine'), 140); };
  function say(npc, lines, then) {
    St.dialog = { npc, i: 0, then, choices: null, lines: lines.map(l => l.who === 'player' ? { name: 'Ben', role: 'Fox', text: l.text, you: true } : { name: npc.name, role: npc.role, text: l.text }) };
    input.jx = input.jy = 0; P.vx = P.vz = 0; audio.blip && audio.blip();
  }
  function offerTopics(npc) { const d = St.dialog; if (!d) return; const ch = []; if (npc.keeper) ch.push({ text: 'YES, PUT ME TO WORK!', work: true }); npc.topics.forEach((t, i) => ch.push({ text: t.label, asked: npc.asked.has(i), topic: i })); ch.push({ text: 'GOODBYE', bye: true }); d.choices = ch; d.lines = []; }
  function talkTo(npc) { npc.wave = 0; if (npc.key === 'benny' && !save.flag('dsfMetBenny')) { save.setFlag('dsfMetBenny'); if (St.quest < 5) St.quest = 5; } const first = npc.asked.size === 0 && !npc.met; npc.met = true; const lines = first ? npc.lines : npc.greeting ? [{ who: 'npc', text: npc.greeting }] : npc.lines.filter(l => l.who === 'npc').slice(0, 1);
    say(npc, lines, (npc.topics.length || npc.keeper) ? () => { St.dialog = { npc, i: 0, lines: [], choices: [] }; offerTopics(npc); } : null); }
  function holoMenu() { const cur = HOLO.state.prog, nm = (PROGRAMS.find(p => p[0] === cur) || [])[1];
    prompt('SUITE ONE · PROGRAMS', cur ? 'Running: ' + nm : 'Grid idle', [...PROGRAMS.map(([k, n]) => [n, () => { HOLO.setProgram(k); audio.tone(196, 1.1, 0.05, 'sawtooth', 2); setTimeout(() => audio.tone(784, 0.5, 0.03, 'sine'), 900);
      if (!save.flag('dsfHoloProg')) { save.setFlag('dsfHoloProg'); setTimeout(() => note('SUITE ONE · ' + n, 'The program is running. Matches open with the sports minigames in a coming build.'), 1300); } else toast(n + ' loaded. Step through the arch.'); }, cur === k]),
      ['END PROGRAM', () => { HOLO.setProgram(null); audio.tone(392, 0.6, 0.04, 'sine', 0.5); toast('Program ended. The grid hums.'); }, !cur], ['NOT NOW', null]]); }
  function postMenu() { prompt('PNEUMATIC MAIL', 'Meru Embassy · Galactic Post', [['TO MERU · HOME', () => sendMail('Meru')], ['TO KUFA STATION', () => sendMail('Kufa Station')], ['NOT NOW', null]]); }
  function sendMail(to) { POST.send(); audio.tone(240, 0.5, 0.05, 'sawtooth', 3); setTimeout(() => audio.tone(1200, 0.2, 0.03, 'sine'), 450); save.setStat('dsfLetters', ((save.data.stats || {}).dsfLetters || 0) + 1); toast('Whoosh. Your letter shoots up the tube to ' + to + '.'); }
  function bankMenu() { const bal = (save.data.stats || {}).dsfVault || 0, gold = save.data.gold || 0;
    const move = n => { if (n > 0 && !save.spend(n)) return; if (n < 0) save.spend(n); save.setStat('dsfVault', bal + n); for (let i = 0; i < 4; i++) setTimeout(() => audio.tone(1900 + i * 220, 0.12, 0.03, 'triangle'), i * 70); setTimeout(bankMenu, 60); };
    prompt('LATINUM VAULT', 'IN THE VAULT ' + bal + ' · IN YOUR POCKET ' + gold, [['DEPOSIT 50', () => move(50), gold < 50], ['DEPOSIT ALL', () => move(gold), gold <= 0], ['WITHDRAW 50', () => move(-50), bal < 50], ['WITHDRAW ALL', () => move(-bal), bal <= 0], ['DONE', null]]); }
  function openVault() { if (!BANK.setVault(true)) { toast('It is already open, STEWARD.'); return; } audio.tone(70, 2.2, 0.07, 'sawtooth', 0.6); for (let i = 0; i < 9; i++) setTimeout(() => audio.tone(300, 0.08, 0.04, 'square'), 120 + i * 80); toast('Nine bolts draw back. The vault door swings open.'); }
  const WORK = { dsfPostmaster: 'MAIL RUN starts once the station map is done. Parcels round the whole ring.', obrain: 'DAMAGE CONTROL shifts start once the station map is done. Suit up, stay calm.', dsfHoloPix: 'HOLO TECH shifts start once the station map is done. You will learn every program.', dsfBanker: 'COIN COUNTER shifts open once the station map is done. Bring sharp eyes.', garok: 'FOXY TAILORS starts once the station map is done. Bring a steady needle and no questions.', bashad: 'BONE SET opens once the station map is done. Steady paws, STEWARD. I will teach you.', quirk: "The DABA wheel needs a dealer. Training opens after the station map is done, STEWARD.", ringMerchant: 'Stock comes in on the next freighter. Come back then and I will put you on the counter.', walkVendor: 'Pav\'s pots need stirring. The honeyroot shift opens soon.', dsfDockmaster: 'Loader shifts start once those three are themselves again. Help me with that and you are hired.' };

  Object.assign(WORK, { dsfQuartermaster: "ARMORER'S APPRENTICE starts once the station map is done. Bring a rag.", dsfSergeant: 'NIGHT WATCH starts once the station map is done. Bring boots.', dsfGrower: 'HARVEST HAND shifts start once the station map is done. Bring gloves.' });
  function X() { return { prompt, toast, note, audio, save, panel: openPanel, range: () => playGame(RANGE_DSF) }; }
  // s474 MINIGAME PANEL: a full-screen page over the station (the station sleeps); the page posts {type:'8gates:minigame', action:'close'} to come back
  let panelEl = null;
  function closePanel() { if (!panelEl) return; panelEl.remove(); panelEl = null; St.paused = false; try { save.reload && save.reload(); } catch (e) {} }
  function openPanel(url) { if (panelEl) return; St.prompt = null; St.dialog = null; St.paused = true; input.jx = input.jy = 0; keys.clear();
    const wrap = document.createElement('div'); wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#000'; const f = document.createElement('iframe'); f.src = url; f.allow = 'autoplay'; f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;display:block'; wrap.appendChild(f);
    const b = document.createElement('button'); b.textContent = '\u2190 BACK TO THE STATION'; b.setAttribute('aria-label', 'Back to the station'); b.style.cssText = 'position:absolute;right:max(8px,env(safe-area-inset-right));bottom:max(8px,env(safe-area-inset-bottom));min-height:44px;padding:0 14px;background:#201e1d;color:#f3f2f2;border:2px solid #f3f2f2;border-radius:0;font:800 13px Archivo,sans-serif;letter-spacing:0.06em;cursor:pointer;z-index:2;opacity:0.85'; b.onclick = closePanel; wrap.appendChild(b);
    document.body.appendChild(wrap); panelEl = wrap; }
  addEventListener('message', e => { const d = e.data; if ((d && d.type === '8gates:minigame' && d.action === 'close') || (d && d.foxCinema === 'exit')) closePanel(); });
  K.X = X; const KIO = setupKiosks({ K, ST, KIOSKS, R, D, pol, addNpc, save, ITEM_LABELS }); KIO.wire(NPC); Object.assign(WORK, KIO.WORK); anims.push(...KIO.anims);

  // ---------- input ----------
  const keys = new Set(), input = { jx: 0, jy: 0, jump: false };
  const onKeyDown = e => {
    if (/INPUT|TEXTAREA/.test(e.target.tagName) || St.paused) return;
    if (St.prompt) { if (e.code === 'Enter' || e.code === 'KeyE') { e.preventDefault(); api.promptPick(St.prompt.buttons.findIndex(b => !b.off)); } if (e.code === 'Escape') api.promptPick(St.prompt.buttons.length - 1); return; }
    if (St.dialog) { if (St.dialog.choices && /^Digit[1-9]$/.test(e.code)) { api.choose(+e.code.slice(5) - 1); return; } if (['Space', 'Enter', 'KeyE'].includes(e.code)) { e.preventDefault(); api.advance(); } if (e.code === 'Escape') api.closeDialog(); return; }
    if (St.game) { if (e.code === 'Escape') CON.close(); else if (CON.game && CON.game.key) CON.game.key(e); return; }
    if (St.phase !== 'free') return;
    keys.add(e.code);
    if (e.code === 'Space' || e.code === 'Digit3') { e.preventDefault(); input.jump = true; }
    if (e.code === 'KeyE' || e.code === 'Enter') api.talk();
    if (e.code === 'Digit1' || e.code === 'Digit2') api.action(+e.code.slice(5));
    if (/Arrow/.test(e.code)) e.preventDefault();
  };
  const onKeyUp = e => { keys.delete(e.code); if (St.game && CON.game && CON.game.key) CON.game.key(e); }, onBlur = () => keys.clear();
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); window.addEventListener('blur', onBlur);
  const el = renderer.domElement, ptrs = new Map();
  const joyBase = document.createElement('div'), joyKnob = document.createElement('div');
  joyBase.style.cssText = 'position:absolute;width:132px;height:132px;border:3px solid #f3f2f2;border-radius:50%;background:rgba(32,30,29,.35);transform:translate(-50%,-50%);display:none;pointer-events:none;box-sizing:border-box;z-index:2';
  joyKnob.style.cssText = 'position:absolute;width:56px;height:56px;border:3px solid #201e1d;border-radius:50%;background:#ec3013;transform:translate(-50%,-50%);display:none;pointer-events:none;box-sizing:border-box;z-index:2';
  const JOY = { fixed: false }, JR = 56;
  const joyCenter = () => { const land = W() > H(); return { x: (land ? 64 : 28) + 66, y: H() - (land ? 22 : 40) - 66 }; };
  function resetJoy() { if ([...ptrs.values()].some(p => p.joy)) return; if (!JOY.fixed) { joyBase.style.display = joyKnob.style.display = 'none'; return; } const c = joyCenter(); joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.left = joyKnob.style.left = c.x + 'px'; joyBase.style.top = joyKnob.style.top = c.y + 'px'; }
  container.append(joyBase, joyKnob);
  el.addEventListener('pointerdown', e => {
    if (St.prompt || St.paused || St.game) return;
    if (St.dialog) { if (!St.dialog.choices) api.advance(); return; }
    if (St.hudPad && e.pointerType === 'touch' && St.phase === 'free') return;
    if (St.phase !== 'free') return;
    el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top;
    const joy = e.pointerType === 'touch' && lx < r.width * 0.45 && ![...ptrs.values()].some(p => p.joy);
    const jc = joyCenter(), useC = joy && JOY.fixed && Math.hypot(lx - jc.x, ly - jc.y) < 170, ox = useC ? jc.x : lx, oy = useC ? jc.y : ly;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, ox, oy, joy });
    if (joy) { joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.left = ox + 'px'; joyBase.style.top = oy + 'px'; moveJoy(lx - ox, ly - oy, ox, oy); }
  });
  function moveJoy(dx, dy, ox, oy) { const l = Math.hypot(dx, dy); if (l > JR) { dx *= JR / l; dy *= JR / l; } input.jx = dx / JR; input.jy = -dy / JR; joyKnob.style.left = ox + dx + 'px'; joyKnob.style.top = oy + dy + 'px'; }
  el.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if (!p) return; if (p.joy) { const r = el.getBoundingClientRect(); moveJoy(e.clientX - r.left - p.ox, e.clientY - r.top - p.oy, p.ox, p.oy); } else { const k = e.pointerType === 'touch' ? 0.008 : 0.005; St.dragT = 1.4; St.yaw -= (e.clientX - p.x) * k; St.pitch = clamp(St.pitch + (e.clientY - p.y) * k * 0.8, 0.04, 1.1); } p.x = e.clientX; p.y = e.clientY; });
  const endPtr = e => { const p = ptrs.get(e.pointerId); ptrs.delete(e.pointerId); if (p && p.joy) { input.jx = input.jy = 0; resetJoy(); } };
  el.addEventListener('pointerup', endPtr); el.addEventListener('pointercancel', endPtr);
  el.addEventListener('wheel', e => { St.dist = clamp(St.dist + e.deltaY * 0.01, 4.5, 18); e.preventDefault(); }, { passive: false });
  el.addEventListener('contextmenu', e => e.preventDefault());
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); resetJoy(); }); ro.observe(container);

  // ---------- console games (s354): played in the room, the camera flies onto the surface ----------
  const DOCK = makeDocking(K, { group: OPSD.g, at: OPS.table, y: 2.5, audio, save, toast, LOW, portrait: () => W() / H() < 0.95 });
  const LXDOCK = makeDocking(K, { group: LUXS.g, at: LX_GAMES.dock.at, y: LX_GAMES.dock.y, audio, save, toast, LOW, portrait: () => W() / H() < 0.95, theme: LX_GAMES.dock.theme, ox: LX.OX, baseY: 0 });
  const LXSCAN = makeCargoScan(K, { group: LUXS.g, OX: LX.OX, at: LX_GAMES.scan.at, y: LX_GAMES.scan.y, blocks: LUXS.blocks, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: LX_GAMES.scan.theme }); anims.push(LXSCAN.idle);
  const LXCOND = makeConduit(K, { group: LUXS.g, OX: LX.OX, at: LX_GAMES.cond.at, eng: LUXS, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: LX_GAMES.cond.theme }); anims.push(LXCOND.idle);
  // s496 JIDDA STATION games: Docking Control (Crow's Nest), Cargo Scan (Net Hut), Tide Pump Lines (conduit)
  const JIDOCK = makeDocking(K, { group: JIS.g, at: JI_GAMES.dock.at, y: JI_GAMES.dock.y, audio, save, toast, LOW, portrait: () => W() / H() < 0.95, theme: JI_GAMES.dock.theme, ox: JI.OX, baseY: 0 });
  const JISCAN = makeCargoScan(K, { group: JIS.g, OX: JI.OX, at: JI_GAMES.scan.at, y: JI_GAMES.scan.y, blocks: JIS.blocks, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: JI_GAMES.scan.theme }); anims.push(JISCAN.idle);
  const JICOND = makeConduit(K, { group: JIS.g, OX: JI.OX, at: JI_GAMES.cond.at, eng: JIS, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: JI_GAMES.cond.theme }); anims.push(JICOND.idle);
  JIS.hooks.play = k => playGame(k === 'dock' ? JIDOCK : k === 'cond' ? JICOND : JISCAN);
  { const a = NPC.find(n => n.key === 'jsMarlin'), f = NPC.find(n => n.key === 'jsKai'), al = NPC.find(n => n.key === 'jsCoral');
    if (a) a.topics = [{ label: 'DOCKING CONTROL \u00b7 TAKE THE BOARD', replies: [{ who: 'npc', text: 'Squall on the plot. Route them round the rain, sailor.' }], act: () => playGame(JIDOCK) }, ...(a.topics || [])];
    if (f) f.topics = [{ label: 'CARGO SCAN \u00b7 WORK THE BELT', replies: [{ who: 'npc', text: 'Corsair goods in the bin. FLEET-marked, hold it. It might be somebody.' }], act: () => playGame(JISCAN) }, ...(f.topics || [])];
    if (al) al.topics = [{ label: 'TIDE PUMP LINES \u00b7 FIX THE LINES', replies: [{ who: 'npc', text: 'Sea to the lagoon, fresh to the spring, air to the pumps. Before it drains.' }], act: () => playGame(JICOND) }, ...(al.topics || [])]; }
  // s495 NEBO STATION games: Docking Control (Lighthouse), Cargo Scan (Willow Net), Waterwheel Lines (conduit)
  const NEDOCK = makeDocking(K, { group: NES.g, at: NE_GAMES.dock.at, y: NE_GAMES.dock.y, audio, save, toast, LOW, portrait: () => W() / H() < 0.95, theme: NE_GAMES.dock.theme, ox: NE.OX, baseY: 0 });
  const NESCAN = makeCargoScan(K, { group: NES.g, OX: NE.OX, at: NE_GAMES.scan.at, y: NE_GAMES.scan.y, blocks: NES.blocks, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: NE_GAMES.scan.theme }); anims.push(NESCAN.idle);
  const NECOND = makeConduit(K, { group: NES.g, OX: NE.OX, at: NE_GAMES.cond.at, eng: NES, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: NE_GAMES.cond.theme }); anims.push(NECOND.idle);
  NES.hooks.play = k => playGame(k === 'dock' ? NEDOCK : k === 'cond' ? NECOND : NESCAN);
  { const a = NPC.find(n => n.key === 'nsElm'), f = NPC.find(n => n.key === 'nsThorne'), al = NPC.find(n => n.key === 'nsHazel');
    if (a) a.topics = [{ label: 'DOCKING CONTROL \u00b7 TAKE THE BOARD', replies: [{ who: 'npc', text: 'Fog off the water ring. Route them round it, pilot.' }], act: () => playGame(NEDOCK) }, ...(a.topics || [])];
    if (f) f.topics = [{ label: 'CARGO SCAN \u00b7 WORK THE BELT', replies: [{ who: 'npc', text: 'Stolen logs in the bin. FLEET-marked, hold it. Gently, it may be someone.' }], act: () => playGame(NESCAN) }, ...(f.topics || [])];
    if (al) al.topics = [{ label: 'WATERWHEEL LINES \u00b7 FIX THE LINES', replies: [{ who: 'npc', text: 'Water to the wheel, sap to the stoves, glow to the lanterns. Go.' }], act: () => playGame(NECOND) }, ...(al.topics || [])]; }
  // s494 ZION STATION games: Docking Control (Searchlight), Cargo Scan (Lockup), Refinery Lines (conduit)
  const ZIDOCK = makeDocking(K, { group: ZIS.g, at: ZI_GAMES.dock.at, y: ZI_GAMES.dock.y, audio, save, toast, LOW, portrait: () => W() / H() < 0.95, theme: ZI_GAMES.dock.theme, ox: ZI.OX, baseY: 0 });
  const ZISCAN = makeCargoScan(K, { group: ZIS.g, OX: ZI.OX, at: ZI_GAMES.scan.at, y: ZI_GAMES.scan.y, blocks: ZIS.blocks, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: ZI_GAMES.scan.theme }); anims.push(ZISCAN.idle);
  const ZICOND = makeConduit(K, { group: ZIS.g, OX: ZI.OX, at: ZI_GAMES.cond.at, eng: ZIS, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: ZI_GAMES.cond.theme }); anims.push(ZICOND.idle);
  ZIS.hooks.play = k => playGame(k === 'dock' ? ZIDOCK : k === 'cond' ? ZICOND : ZISCAN);
  { const a = NPC.find(n => n.key === 'zsDuke'), f = NPC.find(n => n.key === 'zsMae'), al = NPC.find(n => n.key === 'zsBoone');
    if (a) a.topics = [{ label: 'DOCKING CONTROL \u00b7 TAKE THE BOARD', replies: [{ who: 'npc', text: 'Searchlight is sweeping. Keep them out of the beam, partner.' }], act: () => playGame(ZIDOCK) }, ...(a.topics || [])];
    if (f) f.topics = [{ label: 'CARGO SCAN \u00b7 WORK THE BELT', replies: [{ who: 'npc', text: 'Off-manifest in the bin. FLEET-marked, you hold it. No shooting the crates.' }], act: () => playGame(ZISCAN) }, ...(f.topics || [])];
    if (al) al.topics = [{ label: 'REFINERY LINES \u00b7 FIX THE LINES', replies: [{ who: 'npc', text: 'Gold to the molds, oil to the trucks, coolant to the crucible. Quick now.' }], act: () => playGame(ZICOND) }, ...(al.topics || [])]; }
  // s493 GAYA STATION games: Docking Control (Bell Tower), Cargo Scan (Crystal Ward), Resonance Lines (conduit)
  const GADOCK = makeDocking(K, { group: GAS.g, at: GA_GAMES.dock.at, y: GA_GAMES.dock.y, audio, save, toast, LOW, portrait: () => W() / H() < 0.95, theme: GA_GAMES.dock.theme, ox: GA.OX, baseY: 0 });
  const GASCAN = makeCargoScan(K, { group: GAS.g, OX: GA.OX, at: GA_GAMES.scan.at, y: GA_GAMES.scan.y, blocks: GAS.blocks, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: GA_GAMES.scan.theme }); anims.push(GASCAN.idle);
  const GACOND = makeConduit(K, { group: GAS.g, OX: GA.OX, at: GA_GAMES.cond.at, eng: GAS, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: GA_GAMES.cond.theme }); anims.push(GACOND.idle);
  GAS.hooks.play = k => playGame(k === 'dock' ? GADOCK : k === 'cond' ? GACOND : GASCAN);
  { const a = NPC.find(n => n.key === 'gsHeather'), f = NPC.find(n => n.key === 'gsSlate'), al = NPC.find(n => n.key === 'gsThistle');
    if (a) a.topics = [{ label: 'DOCKING CONTROL \u00b7 TAKE THE BOARD', replies: [{ who: 'npc', text: 'Incense on the plot again. Route them round the smoke, pilot.' }], act: () => playGame(GADOCK) }, ...(a.topics || [])];
    if (f) f.topics = [{ label: 'CARGO SCAN \u00b7 WORK THE BELT', replies: [{ who: 'npc', text: 'Off-manifest in the bin. FLEET-marked, hold it gently. It may be someone.' }], act: () => playGame(GASCAN) }, ...(f.topics || [])];
    if (al) al.topics = [{ label: 'RESONANCE LINES \u00b7 FIX THE LINES', replies: [{ who: 'npc', text: 'Join the lines before the core rings itself to pieces. And please, no humming.' }], act: () => playGame(GACOND) }, ...(al.topics || [])]; }
  // s492 UR STATION games: Docking Control (Watchtower), Cargo Scan (Reed Cage), Water Works (conduit)
  const URDOCK = makeDocking(K, { group: URS.g, at: UR_GAMES.dock.at, y: UR_GAMES.dock.y, audio, save, toast, LOW, portrait: () => W() / H() < 0.95, theme: UR_GAMES.dock.theme, ox: UR.OX, baseY: 0 });
  const URSCAN = makeCargoScan(K, { group: URS.g, OX: UR.OX, at: UR_GAMES.scan.at, y: UR_GAMES.scan.y, blocks: URS.blocks, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: UR_GAMES.scan.theme }); anims.push(URSCAN.idle);
  const URCOND = makeConduit(K, { group: URS.g, OX: UR.OX, at: UR_GAMES.cond.at, eng: URS, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: UR_GAMES.cond.theme }); anims.push(URCOND.idle);
  URS.hooks.play = k => playGame(k === 'dock' ? URDOCK : k === 'cond' ? URCOND : URSCAN);
  { const a = NPC.find(n => n.key === 'urEnhedu'), f = NPC.find(n => n.key === 'urMashu'), al = NPC.find(n => n.key === 'urAbi');
    if (a) a.topics = [{ label: 'DOCKING CONTROL \u00b7 TAKE THE BOARD', replies: [{ who: 'npc', text: 'Rocks drifting into the lanes again. Route them round, pilot.' }], act: () => playGame(URDOCK) }, ...(a.topics || [])];
    if (f) f.topics = [{ label: 'CARGO SCAN \u00b7 WORK THE BELT', replies: [{ who: 'npc', text: 'Off-manifest in the bin. FLEET-marked, hold it. Barrels, always open the barrels.' }], act: () => playGame(URSCAN) }, ...(f.topics || [])];
    if (al) al.topics = [{ label: 'WATER WORKS \u00b7 FIX THE LINES', replies: [{ who: 'npc', text: 'Clean to clean, runoff to the filter. Never mix them. Never.' }], act: () => playGame(URCOND) }, ...(al.topics || [])]; }
  // s491 SHASTA STATION games: Docking Control (Summit), Cargo Scan (Cold Watch), Boiler Lines (The Boiler)
  const SHDOCK = makeDocking(K, { group: SHAS.g, at: SH_GAMES.dock.at, y: SH_GAMES.dock.y, audio, save, toast, LOW, portrait: () => W() / H() < 0.95, theme: SH_GAMES.dock.theme, ox: SH.OX, baseY: 0 });
  const SHSCAN = makeCargoScan(K, { group: SHAS.g, OX: SH.OX, at: SH_GAMES.scan.at, y: SH_GAMES.scan.y, blocks: SHAS.blocks, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: SH_GAMES.scan.theme }); anims.push(SHSCAN.idle);
  const SHCOND = makeConduit(K, { group: SHAS.g, OX: SH.OX, at: SH_GAMES.cond.at, eng: SHAS, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: SH_GAMES.cond.theme }); anims.push(SHCOND.idle);
  SHAS.hooks.play = k => playGame(k === 'dock' ? SHDOCK : k === 'cond' ? SHCOND : SHSCAN);
  { const a = NPC.find(n => n.key === 'shAspen'), f = NPC.find(n => n.key === 'shFrost'), al = NPC.find(n => n.key === 'shAlder');
    if (a) a.topics = [{ label: 'DOCKING CONTROL \u00b7 TAKE THE BOARD', replies: [{ who: 'npc', text: 'Blizzard over the pass. Route them round the snow, pilot.' }], act: () => playGame(SHDOCK) }, ...(a.topics || [])];
    if (f) f.topics = [{ label: 'CARGO SCAN \u00b7 WORK THE BELT', replies: [{ who: 'npc', text: 'Off-manifest goes in the bin. FLEET-marked we hold. Gently. They might be somebody.' }], act: () => playGame(SHSCAN) }, ...(f.topics || [])];
    if (al) al.topics = [{ label: 'BOILER LINES \u00b7 FIX THE LINES', replies: [{ who: 'npc', text: 'Lines are scrambled again. Join them before the pressure blows. No pressure.' }], act: () => playGame(SHCOND) }, ...(al.topics || [])]; }
  const KUDOCK = makeDocking(K, { group: KUFA.g, at: KU_GAMES.dock.at, y: KU_GAMES.dock.y, audio, save, toast, LOW, portrait: () => W() / H() < 0.95, theme: KU_GAMES.dock.theme, ox: KU.OX, baseY: 0 });
  const KUSCAN = makeCargoScan(K, { group: KUFA.g, OX: KU.OX, at: KU_GAMES.scan.at, y: KU_GAMES.scan.y, blocks: KUFA.imexBlocks, audio, save, LOW, portrait: () => W() / H() < 0.95, theme: KU_GAMES.scan.theme }); anims.push(KUSCAN.idle);
  { const ks = NPC.find(n => n.key === 'kuOps'), ki = NPC.find(n => n.key === 'kuImex'); if (ks) ks.topics = [{ label: 'DOCKING CONTROL · TAKE THE BOARD', replies: [{ who: 'npc', text: 'Dust is up off the world again. Route them round it, PILOT.' }], act: () => playGame(KUDOCK) }, ...(ks.topics || [])];
    { const toll = NPC.find(n => n.key === 'kuHandB'); if (toll) toll.topics = [{ label: 'PHASER RANGE · A PRACTICE ROUND', replies: [{ who: 'npc', text: 'Gunner\u2019s practice. Stun setting. Do not zap the helper bots.' }], act: () => playGame(RANGE_KU) }, ...(toll.topics || [])]; }
    if (ki) ki.topics = [{ label: 'CARGO SCAN · WORK THE BELT', replies: [{ who: 'npc', text: 'Contracts change mid-shift here. Read the card, not your memory.' }], act: () => playGame(KUSCAN) }, ...(ki.topics || [])]; }
  const rangeHide = () => [hope, noble];
  const RANGE_LX = makeRangeConsole(K, { at: { x: LX.OX + 19.4, z: -4.8 }, yaw: Math.PI / 2, room: LUXS.g, hide: rangeHide, save, where: 'Iron Watch · training sim' }); RANGE_LX.attach(renderer, camera);
  const RANGE_DSF = makeRangeConsole(K, { at: { x: AB.OX + AB.range.x, z: AB.range.z }, yaw: 0, room: ARM.g, hide: rangeHide, save, where: 'Armory · lane one' }); RANGE_DSF.attach(renderer, camera);
  const RANGE_KU = (() => { const p = KU.pods.find(q => q.key === 'dsfOutKu_crew'), [x, z] = podPt(p, 0, 2.6), [bx, bz] = podPt(p, 0, -3), dx = bx - x, dz = bz - z; return makeRangeConsole(K, { at: { x: KU.OX + x, z }, yaw: Math.atan2(-dx, -dz), room: KUFA.g, hide: rangeHide, save, where: 'Crew for Hire · gunner\u2019s practice' }); })(); RANGE_KU.attach(renderer, camera);
  LUXS.hooks.range = () => playGame(RANGE_LX);
  const lxBarG = new THREE.Group(); lxBarG.position.set(LX_GAMES.bar.ox, 0, LX_GAMES.bar.oz); LUXS.g.add(lxBarG);
  const LXBAR = makeBarShift(K, { group: lxBarG, OX: LX.OX + LX_GAMES.bar.ox, OZ: LX_GAMES.bar.oz, audio, save, LOW, makeFox, animFox, portrait: () => W() / H() < 0.95, theme: LX_GAMES.bar.theme, hooks: {} }); anims.push(LXBAR.idle); LUXS.hooks.bar = () => playGame(LXBAR);
  { const ve = NPC.find(n => n.key === 'lxVella'); if (ve) ve.topics = [{ label: 'YES, PUT ME TO WORK!', replies: [{ who: 'npc', text: 'Apron\u2019s on the hook. Taps on the right, bottles on the rail. Go.' }], act: () => playGame(LXBAR) }, ...ve.topics]; }
  const BOX_LX = makeBoxingConsole(K, { at: { x: LX.OX + 16.5, z: -17 }, yaw: 0, room: LUXS.g, hide: rangeHide, scene }); BOX_LX.attach(renderer, camera); LUXS.hooks.box = () => playGame(BOX_LX);
  const ARMW_LX = makeArmWrestleConsole(K, { at: { x: LX.OX + 12.4, z: -21.8 }, yaw: 0, room: LUXS.g, hide: rangeHide, scene }); ARMW_LX.attach(renderer, camera); LUXS.hooks.armw = () => playGame(ARMW_LX);
  const HULL_LX = makeHullRun(K, { at: { x: -22.2, z: -16 }, ox: LX.OX, mkPlayer: () => cast.make('player'), mkFox: spec => makeFox({ ...spec, look: { ...PLAYER_MALE, ...(spec.look || {}) }, eyes: ['#38bdf8', '#38bdf8'] }), animFox, audio, save, LOW }); LUXS.hooks.hull = () => playGame(HULL_LX);
  const lxFox = spec => makeFox({ ...spec, look: { ...PLAYER_MALE, ...(spec.look || {}) }, eyes: ['#38bdf8', '#38bdf8'] });
  const DICE_LX = makeParlorConsole(K, { kind: 'dice', at: { x: LX.OX - 15.5, z: 20.6 }, yaw: Math.PI, room: LUXS.g, mkFox: lxFox, animFox }); DICE_LX.attach(renderer, camera); LUXS.hooks.dice = () => playGame(DICE_LX);
  const STB_LX = makeParlorConsole(K, { kind: 'box', at: { x: LX.OX - 21.2, z: 14.8 }, yaw: Math.PI / 2, room: LUXS.g, mkFox: lxFox, animFox }); STB_LX.attach(renderer, camera); LUXS.hooks.stb = () => playGame(STB_LX);
  { const bz = NPC.find(n => n.key === 'lxBraze'); if (bz) bz.topics = [{ label: "LIAR'S DICE \u00b7 DEAL ME IN", replies: [{ who: 'npc', text: 'Haulers taught me this. Ones are wild. Never trust a pilot who bids sixes.' }], act: () => playGame(DICE_LX) }, { label: 'SHUT THE BOX \u00b7 ONE ROUND', replies: [{ who: 'npc', text: 'Nine tiles, two dice, no lying. Good game for a quiet shift.' }], act: () => playGame(STB_LX) }, ...(bz.topics || [])]; }
  // s481 COLLECTABLES: two capsule machines (STATIONS & STARSHIPS + 8 GATES VEHICLES) on every station, played in the room
  Object.assign(ITEM_LABELS, { 'capsuleCorner.trophy_ships': 'Stations & Starships Trophy', 'capsuleCorner.trophy_rides': '8 Gates Vehicles Trophy' });
  const capRun = C => X => X.prompt('COLLECTABLES', 'Capsule machines \u00b7 stations, starships + vehicles', [['TURN A CRANK', () => playGame(C)], ['NOT NOW', null]]);
  const capFoot = (at, yaw) => { const tx = Math.cos(yaw), tz = -Math.sin(yaw), nx = Math.sin(yaw), nz = Math.cos(yaw); return [-1.25, 0, 1.25].map(o => [at.x + tx * o - nx * 0.25, at.z + tz * o - nz * 0.25, 0.85]); };
  const capDsfAt = (() => { const [x, z] = pol(66, 100); return { x, z }; })();
  const CAP_LX = makeCapsuleConsole(K, { host: LUXS.g, at: { x: 20.5, z: 8.95 }, yaw: 0, ox: LX.OX, isHere: () => St.inside === 'luxs', where: 'Sun Gallery \u00b7 collectables' });
  const CAP_KU = makeCapsuleConsole(K, { host: KUFA.g, at: { x: 9.33, z: 9.33 }, yaw: -3 * Math.PI / 4, ox: KU.OX, isHere: () => St.inside === 'kufa', where: 'Ring deck \u00b7 collectables' });
  const CAP_DSF = makeCapsuleConsole(K, { host: K.scene, at: capDsfAt, yaw: Math.PI - 100 * D, isHere: () => !St.inside, where: 'Main Ring \u00b7 collectables' });
  for (const C of [CAP_LX, CAP_KU, CAP_DSF]) { C.attach(renderer, camera); anims.push(dt => C.idle(dt)); }
  LUXS.spots.push({ key: 'capLx', ...CAP_LX.spot, run: capRun(CAP_LX) }); LUXS.blocks.push([18.7, 22.3, 8.2, 9.4]);
  (KUFA.spots = KUFA.spots || []).push({ key: 'capKu', ...CAP_KU.spot, run: capRun(CAP_KU) }); if (KUFA.circles) KUFA.circles.push(...capFoot({ x: 9.33, z: 9.33 }, -3 * Math.PI / 4));
  KIO.spots.push({ key: 'capDsf', ...CAP_DSF.spot, run: capRun(CAP_DSF) }); for (const [x, z, r] of capFoot(capDsfAt, Math.PI - 100 * D)) ST.obs.push({ x, z, r });
  // s482 THE BACK KITCHEN: Ember's Skewer House shift (room fades into the kitchen set)
  const SKEW_LX = makeSkewerConsole(K, { at: { x: LX.OX - 16, z: 16 }, yaw: 0, room: LUXS.g, scene }); SKEW_LX.attach(renderer, camera); LUXS.hooks.skewer = () => playGame(SKEW_LX);
  { const em = NPC.find(n => n.key === 'lxEmber'); if (em) em.topics = [{ label: 'YES, PUT ME TO WORK!', replies: [{ who: 'npc', text: 'Apron, hat, towel. Thread it, roll it, plate it. Go.' }], act: () => playGame(SKEW_LX) }, ...(em.topics || [])]; }
  // s483 STAR TABLE: Seer Nahla's holo-chart table in the Sun Gallery (trace constellations from memory; the Fleet relay)
  const STAR_LX = makeStarTable(K, { host: LUXS.g, ox: LX.OX, at: { x: 17, z: 16.8 }, audio, save, LOW }); anims.push((dt, t) => STAR_LX.idle(dt, t));
  LUXS.circles.push([17, 16.8, 2.05]); LUXS.spots.push({ key: 'lxStars', ...STAR_LX.spot, run: X => X.prompt('STAR TABLE', 'Sun Gallery \u00b7 Seer Nahla\u2019s chart', [['CHART THE SKY', () => playGame(STAR_LX)], ['NOT NOW', null]]) });
  { const na = NPC.find(n => n.key === 'lxNahla'); if (na) na.topics = [{ label: 'STAR TABLE \u00b7 CHART THE SKY', replies: [{ who: 'npc', text: 'Watch the shape glow, then trace it from memory. The sky is patient. I am less so.' }], act: () => playGame(STAR_LX) }, ...(na.topics || [])]; }
  // s484 DOME HARVEST: Sister Holly's garden job on Kufa's own four beds
  const HARV_KU = makeDomeHarvest(K, { host: KUFA.g, ox: KU.OX, pol, D, audio, save, LOW });
  (KUFA.spots = KUFA.spots || []).push({ key: 'kuHarvest', ...HARV_KU.spot, run: X => X.prompt('DOME HARVEST', 'The Garden \u00b7 Sister Holly is hiring', [['YES, PUT ME TO WORK!', () => playGame(HARV_KU)], ['GOODBYE', null]]) });
  { const ho = NPC.find(n => n.key === 'kuGarden'); if (ho) ho.topics = [{ label: 'YES, PUT ME TO WORK!', replies: [{ who: 'npc', text: 'Pick what glows. Water what droops. And mind that drone, it has not been itself.' }], act: () => playGame(HARV_KU) }, ...(ho.topics || [])]; }
  // s485 ASSAY BENCH: Vetch's glass assay table in the Relic Exchange pod (scrub, compare the mark, GENUINE / FORGED / HOLD)
  const ASSAY_KU = (() => { const p = KU.pods.find(q2 => q2.key === 'dsfOutKu_relics'), [x, z] = podPt(p, 0, -1.2); return makeAssayBench(K, { host: KUFA.g, ox: KU.OX, at: { x, z }, audio, save, LOW, hideAt: podPt(p, 1.4, -1.4) }); })();
  (KUFA.spots = KUFA.spots || []).push({ key: 'kuAssay', ...ASSAY_KU.spot, run: X => X.prompt('ASSAY BENCH', 'Relic Exchange \u00b7 Vetch is hiring', [['YES, PUT ME TO WORK!', () => playGame(ASSAY_KU)], ['GOODBYE', null]]) });
  { const ve = NPC.find(n => n.key === 'kuRelic'); if (ve) ve.topics = [{ label: 'YES, PUT ME TO WORK!', replies: [{ who: 'npc', text: 'Scrub gently. Read the mark. Forgers always miss one small thing.' }], act: () => playGame(ASSAY_KU) }, ...(ve.topics || [])]; }
  { const re = NPC.find(n => n.key === 'shReel'); if (re) re.topics = [{ label: 'YES, PUT ME TO WORK!', replies: [{ who: 'npc', text: 'Doors open in three minutes. Popcorn first, always popcorn first.' }], act: () => SHAS.hooks.cinemaShift() }, ...(re.topics || [])]; }   // s490 Fox Cinema shift (panel)
  // s489 THE BALCONY CLUBS: chess (th 91) · checkers (th 97) · dominoes (th 103) on the balcony, r 98; you sit on the hub side
  const BAL = [{ k: 'chess', th: 91, name: 'CHESS CLUB' }, { k: 'checkers', th: 97, name: 'CHECKERS CLUB' }, { k: 'dominoes', th: 103, name: 'DOMINOES CLUB' }].map(c => { const [x, z] = pol(98, c.th), yaw = -c.th * D; return { ...c, x, z, yaw }; });
  const balTex = k => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'); const A = k === 'chess' ? ['#efe2c4', '#6a4a2e'] : ['#b3121b', '#1a1616']; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = A[(i + j) % 2]; c.fillRect(i * 32, j * 32, 32, 32); } const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const balSign = (lines, fg) => { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 320; const c = cv.getContext('2d'); c.fillStyle = '#201e1d'; c.fillRect(0, 0, 1024, 320); c.fillStyle = fg; c.fillRect(0, 0, 1024, 22); c.fillRect(0, 298, 1024, 22); c.fillStyle = '#f3f2f2'; c.font = '900 112px Archivo, Arial'; c.textBaseline = 'middle'; c.fillText(lines[0], 48, 120, 930); c.fillStyle = fg; c.font = '800 54px Archivo, Arial'; c.fillText(lines[1], 48, 232, 930); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const BALC = BAL.map(c => { const grp = new THREE.Group(); grp.position.set(c.x, R.yb, c.z); grp.rotation.y = c.yaw; scene.add(grp); const deco = new THREE.Group(); grp.add(deco);
    const wood = K.toon('#5a3520'), woodL = K.toon('#7a4a2c');
    if (c.k === 'dominoes') { const tp = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 1.1), wood); tp.position.y = 0.915; grp.add(tp); const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.22, 0.88, 12), wood); ped.position.y = 0.44; grp.add(ped); }
    else { const tp = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.07, 1.55), wood); tp.position.y = 0.915; deco.add(tp); const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.26, 0.88, 12), wood); ped.position.y = 0.44; deco.add(ped);
      const bd = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: balTex(c.k) })); bd.rotation.x = -Math.PI / 2; bd.position.y = 0.952; deco.add(bd); }
    for (const s2 of [-1, 1]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.5, 12), woodL); st.position.set(0, 0.25, s2 * 1.25); (c.k === 'dominoes' ? grp : deco).add(st); }
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.72, 32), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.9, toneMapped: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.03, 2.3); grp.add(ring);
    const t = balSign([c.name, 'THE BALCONY · STAND ON THE RING'], c.k === 'chess' ? '#ffd23a' : c.k === 'checkers' ? '#ec3013' : '#5fe3ff'); const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 8), K.toon('#c8a050')); post.position.set(1.6, 1.0, 1.6); grp.add(post);
    for (const f of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.56), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(1.6, 1.8, 1.6 + f * 0.04); if (f < 0) m.rotation.y = Math.PI; grp.add(m); }
    BAL_OBS.push({ x: c.x, z: c.z, r: 1.15 }); { const [px, pz] = [c.x + Math.cos(c.yaw) * 1.6 + Math.sin(c.yaw) * 1.6, c.z - Math.sin(c.yaw) * 1.6 + Math.cos(c.yaw) * 1.6]; BAL_OBS.push({ x: px, z: pz, r: 0.3 }); }
    const G = c.k === 'dominoes' ? makeDominoesConsole(K, { at: { x: c.x, z: c.z }, yaw: c.yaw, top: R.yb + 0.945, where: 'The Balcony', kicker: 'Deep Space Fox \u00b7 The Balcony', rivals: {}, place: 'DEEP SPACE FOX', title: 'DOMINOES CLUB', intro: 'A club table on the Balcony, Meru turning below.', menuTitle: 'Dominoes on the Balcony', hideFox: true })
      : makeBoardConsole(K, { game: c.k, at: { x: c.x, z: c.z }, y: R.yb, yaw: c.yaw, decor: deco });
    G.attach(renderer, camera); if (G.stand) { G.stand.x = c.x + Math.sin(c.yaw) * 2.3; G.stand.z = c.z + Math.cos(c.yaw) * 2.3; G.stand.face = c.yaw + Math.PI; }
    const [rx, rz] = [c.x + Math.sin(c.yaw) * 2.3, c.z + Math.cos(c.yaw) * 2.3]; BAL_SPOTS.push({ key: 'bal' + c.k, x: rx, z: rz, r: 0.85, run: X => X.prompt(c.name, 'The Balcony \u00b7 a club table', [['SIT DOWN', () => playGame(G)], ['NOT NOW', null]]) }); return G; });
  // s488 QUIRK'S ARCADE: three Fox Gate Pachinko cabinets on the east wall (pachinko world mode on each base)
  const PACHI_Q = BAR.arcade.spots.map((sp, i) => { const C = makePachinkoConsole(K, { at: { x: QB.OX + QB.arcade.x, z: sp.z }, yaw: -Math.PI / 2, head: BAR.arcade.heads[i] }); C.attach(renderer, camera); C.spot = { x: sp.x, z: sp.z, r: 0.7 }; return C; });
  BAR.spots = BAR.spots || []; PACHI_Q.forEach((C, i) => BAR.spots.push({ key: 'qPachi' + i, ...C.spot, run: X => X.prompt('FOX GATE PACHINKO', 'Quirk\u2019s Arcade \u00b7 cabinet ' + (i + 1), [['PLAY', () => playGame(C)], ['NOT NOW', null]]) }));
  // s487 CHART PLOTTING: Old Merrit's chart table (Maps & Charts): bend the course round the hazards, log the Fleet signal
  const CHART_KU = (() => { const p = KU.pods.find(q2 => q2.key === 'dsfOutKu_charts'), [x, z] = podPt(p, 0, -0.6); return makeChartTable(K, { host: KUFA.g, ox: KU.OX, at: { x, z }, th: p.th, audio, save, LOW }); })();
  (KUFA.spots = KUFA.spots || []).push({ key: 'kuCharts', ...CHART_KU.spot, run: X => X.prompt('CHART PLOTTING', 'Maps & Charts \u00b7 Old Merrit is hiring', [['YES, PUT ME TO WORK!', () => playGame(CHART_KU)], ['GOODBYE', null]]) });
  { const me = NPC.find(n => n.key === 'kuCharts'); if (me) me.topics = [{ label: 'YES, PUT ME TO WORK!', replies: [{ who: 'npc', text: 'Bend the line round the rocks. Mind the fuel. And log anything that calls out.' }], act: () => playGame(CHART_KU) }, ...(me.topics || [])]; }
  // s486 THE BENCH · DOMINOES: a crate table in front of the hands' bench (Crew for Hire); the hands are the rivals
  const DOM_KU = (() => { const p = KU.pods.find(q2 => q2.key === 'dsfOutKu_crew'), [x, z] = podPt(p, 4.1, -2.0), [rx, rz] = podPt(p, 4.1, -0.7), [px, pz] = podPt(p, 5.4, -0.7);
    const crate = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 1.4), K.toon('#6a4a2a')); crate.position.set(x, 0.45, z); KUFA.g.add(crate); const lid = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.05, 1.46), K.toon('#d08a4a')); lid.position.set(x, 0.92, z); KUFA.g.add(lid);
    KUFA.podBlocks[p.key].push([3.3, 4.9, -2.6, -1.4]);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.9, toneMapped: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(rx, 0.03, rz); KUFA.g.add(ring);
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 320; const c = cv.getContext('2d'); c.fillStyle = '#201e1d'; c.fillRect(0, 0, 1024, 320); c.fillStyle = '#ffd23a'; c.fillRect(0, 0, 1024, 22); c.fillRect(0, 298, 1024, 22); c.fillStyle = '#f3f2f2'; c.font = '900 120px Archivo, Arial'; c.textBaseline = 'middle'; c.fillText('DOMINOES', 48, 120, 930); c.fillStyle = '#ffd23a'; c.font = '800 56px Archivo, Arial'; c.fillText('PLAY THE HANDS \u00b7 STAND ON THE RING', 48, 230, 930);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 8), K.toon('#d08a4a')); post.position.set(px, 0.95, pz); KUFA.g.add(post);
    for (const f of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); m.position.set(px - f * 0.05, 1.72, pz); m.rotation.y = f > 0 ? -Math.PI / 2 : Math.PI / 2; KUFA.g.add(m); }
    const C = makeDominoesConsole(K, { at: { x: KU.OX + x, z }, yaw: -Math.PI / 2, top: 0.945 }); C.attach(renderer, camera); C.spot = { x: rx, z: rz, r: 0.85 }; return C; })();
  (KUFA.spots = KUFA.spots || []).push({ key: 'kuDominoes', ...DOM_KU.spot, run: X => X.prompt('DOMINOES', 'Crew for Hire \u00b7 the hands deal you in', [['PULL UP A CRATE', () => playGame(DOM_KU)], ['NOT NOW', null]]) });
  { const br = NPC.find(n => n.key === 'kuHandA'); if (br) br.topics = [{ label: 'DOMINOES \u00b7 DEAL ME IN', replies: [{ who: 'npc', text: 'All fives, to a hundred. The quiet one never loses. Never.' }], act: () => playGame(DOM_KU) }, ...(br.topics || [])]; }
  { const du = NPC.find(n => n.key === 'lxDune'); if (du) du.topics = [{ label: 'HULL RUN · RACE ME', replies: [{ who: 'npc', text: 'Suit up. Mag wheels stick to anything. Even upside down. Especially upside down.' }], act: () => playGame(HULL_LX) }, ...(du.topics || []).filter(t => !/ride one/i.test(t.label))]; }
  { const br = NPC.find(n => n.key === 'lxBruna'); if (br) br.topics = [{ label: 'ARM WRESTLING · THE IRON TABLE', replies: [{ who: 'npc', text: 'The bag never wins. Let\u2019s see if you do. Elbow on the pad.' }], act: () => playGame(ARMW_LX) }, ...(br.topics || [])]; }
  { const ru = NPC.find(n => n.key === 'lxRusk'); if (ru) ru.topics = [{ label: 'HOLO-PIT BOXING · GLOVES UP', replies: [{ who: 'npc', text: 'The ring is a hologram tonight. Hits feel real. Gloves up.' }], act: () => playGame(BOX_LX) }, ...ru.topics.filter(t => !/spar/i.test(t.label))]; }
  LUXS.hooks.play = k => playGame(k === 'dock' ? LXDOCK : k === 'cond' ? LXCOND : LXSCAN);
  { const t = NPC.find(n => n.key === 'lxTallo'); if (t) t.topics = [{ label: 'GLASS LINES · FIX THE PANEL', replies: [{ who: 'npc', text: 'Panel by the core is scrambled again. Join the lines before she redlines.' }], act: () => playGame(LXCOND) }, ...t.topics]; }
  { const w = NPC.find(n => n.key === 'lxWarden'), gr = NPC.find(n => n.key === 'lxGarr'); if (w) w.topics = [{ label: 'DOCKING CONTROL · TAKE THE BOARD', replies: [{ who: 'npc', text: 'Two mirrors are live and the barges do not care. Route them clear.' }], act: () => playGame(LXDOCK) }, ...w.topics];
    if (gr) gr.topics = [{ label: 'CARGO SCAN · WORK THE BELT', replies: [{ who: 'npc', text: 'Off-manifest goes in the bin. FLEET-marked goes in the bin too. Gently.' }], act: () => playGame(LXSCAN) }, ...gr.topics]; }
  const SCAN = makeCargoScan(K, { group: SEC.g, OX: SB.OX, at: SB.scan, y: 1.0, blocks: SEC.blocks, audio, save, LOW, portrait: () => W() / H() < 0.95 }); anims.push(SCAN.idle);
  const COND = makeConduit(K, { group: ENG.g, OX: EB.OX, at: EB.pit, eng: ENG, audio, save, LOW, portrait: () => W() / H() < 0.95 }); anims.push(COND.idle);
  const BONE = makeBoneSet(K, { group: INF.g, OX: IB.OX, at: IB.boneSet, lamp: INF.lamp, wallX: IB.hw - 0.16, roomH: IB.h, audio, save, LOW, portrait: () => W() / H() < 0.95 }); anims.push(BONE.idle);
    const DABA = makeDaba(K, { group: BAR.g, OX: QB.OX, at: BAR.DT, audio, save, LOW, portrait: () => W() / H() < 0.95, hooks: {
    deal(on) { if (on) host.wave = 1.4; },
    spin() { host.wave = 0.9; },
    cheer(l) { const who = l > 1 ? NPC.filter(n => n.inside === 'bar') : [nagN, marnN, host]; for (const n of who) { n.wave = l > 1 ? 2.4 : 1.3; n.hop = l > 1 ? 1.8 : 0.9; } } } });
  anims.push(DABA.idle);
  const QBAR = makeBarShift(K, { group: BAR.g, OX: QB.OX, audio, save, LOW, makeFox, animFox, portrait: () => W() / H() < 0.95, hooks: { open(on) { quirk.wave = on ? 1.6 : 1.0; }, serve(great) { quirk.wave = great ? 1.6 : 0.7; if (great) quirk.hop = 0.6; }, walk() { quirk.wave = 0.4; } } }); anims.push(QBAR.idle);
  quirk.topics = [{ label: 'BAR SHIFT \u00b7 WORK THE BAR', replies: [{ who: 'npc', text: 'Behind the bar, STEWARD. Ice first, pour true, never keep a customer waiting.' }], act: () => playGame(QBAR) }, ...quirk.topics];
  const SHR = makeShrine(K, { group: TEMP.g, OX: TP.OX, at: TP.shrine, blocks: TEMP.blocks, hiring: TP.hiring, roomW: TP.hw, roomH: TP.h, audio, save, LOW, camera, portrait: () => W() / H() < 0.95, hooks: { light() { opa.wave = Math.max(opa.wave || 0, 0.5); }, all() { TEMP.flare(); opa.wave = 2.2; } } }); anims.push(SHR.idle);
  opa.topics = [{ label: 'SHRINE CANDLES \u00b7 KEEP THE VIGIL', replies: [{ who: 'npc', text: 'Light every candle from the ember. Mind the vents. The bell keeps its own count.' }], act: () => playGame(SHR) }, ...(opa.topics || [])];
  const TLR = makeTailors(K, { group: TAIL.g, OX: TB.OX, at: TB.cut, cust: TB.cust, door: TB.door, audio, save, LOW, makeFox, animFox, portrait: () => W() / H() < 0.95, hooks: { open(on) { garok.wave = on ? 1.6 : 1.0; if (TAIL.dust.pts) TAIL.dust.pts.visible = !on; }, stage(sc) { garok.wave = sc >= 75 ? 1.4 : 0.5; }, serve(v) { garok.wave = 1.8; if (v >= 90) garok.hop = 0.8; } } }); anims.push(TLR.idle);
  garok.topics = [{ label: 'FOXY TAILORS \u00b7 TAKE AN ORDER', replies: [{ who: 'npc', text: 'Cut on the chalk, sew it straight, press it crisp. The customer is never wrong. Usually.' }], act: () => playGame(TLR) }, ...(garok.topics || [])];
  const FIT = makeFitRoom(K, { group: TAIL.g, OX: TB.OX, block: TB.block, car: TB.car, garokAt: TB.garokFit, keeperAt: TB.keeper, tail: TAIL, renderer, camera, fox, ink: outlineMat, audio, save, LOW, inside: () => St.inside === 'tailor', garok, P, hooks: { open(on) { garok.wave = on ? 1.4 : 0.8; if (TAIL.dust.pts) TAIL.dust.pts.visible = !on; } } }); anims.push(FIT.idle);
  garok.topics.splice(1, 0, { label: 'THE FITTING ROOM \u00b7 TRY THINGS ON', replies: [{ who: 'npc', text: 'Step on the block, STEWARD. Try anything on. You only pay for what walks out.' }], act: () => playGame(FIT) });
  const CON = makeConsoleKit({ THREE, camera, el, St, P, audio, W, H, damp, smooth, onClose: g => { OPSD.holo.visible = true; LUXS.setHolo(true); SHAS.setHolo(true); URS.setHolo(true); GAS.setHolo(true); ZIS.setHolo(true); NES.setHolo(true); JIS.setHolo(true); St.locks.jsDockSpot = true; St.locks.jsScanSpot = true; St.locks.jsCondSpot = true; if (g === JISCAN && save.stat('jsScanFleetHeld', 0) > 0 && !save.flag('jsScanSaid')) { save.setFlag('jsScanSaid'); setTimeout(() => note('CARGO SCAN', 'KAI: \u201CFleet crates of empty water casks, bound for the Belt. Someone out there is thirsty.\u201D'), 400); } St.locks.nsDockSpot = true; St.locks.nsScanSpot = true; St.locks.nsCondSpot = true; if (g === NESCAN && save.stat('nsScanFleetHeld', 0) > 0 && !save.flag('nsScanSaid')) { save.setFlag('nsScanSaid'); setTimeout(() => note('CARGO SCAN', 'THORNE: \u201CFleet crates of lantern cells, drained dry. Somebody is collecting power. Lots of it.\u201D'), 400); } St.locks.zsDockSpot = true; St.locks.zsScanSpot = true; St.locks.zsCondSpot = true; if (g === ZISCAN && save.stat('zsScanFleetHeld', 0) > 0 && !save.flag('zsScanSaid')) { save.setFlag('zsScanSaid'); setTimeout(() => note('CARGO SCAN', 'MAE: \u201CFleet crates of long-band radios, all tuned to one channel. I wrote the channel down.\u201D'), 400); } St.locks.gsDockSpot = true; St.locks.gsScanSpot = true; St.locks.gsCondSpot = true; if (g === GASCAN && save.stat('gsScanFleetHeld', 0) > 0 && !save.flag('gsScanSaid')) { save.setFlag('gsScanSaid'); setTimeout(() => note('CARGO SCAN', 'SLATE: \u201CFleet crates of tuning forks, all set to one wrong note. Someone is singing to them.\u201D'), 400); } St.locks.urDockSpot = true; St.locks.urScanSpot = true; St.locks.urCondSpot = true; if (g === URSCAN && save.stat('urScanFleetHeld', 0) > 0 && !save.flag('urScanSaid')) { save.setFlag('urScanSaid'); setTimeout(() => note('CARGO SCAN', 'MASHU: \u201CFleet crates full of empty barrels. Someone wants them filled. Down there.\u201D'), 400); } St.locks.shDockSpot = true; St.locks.shScanSpot = true; St.locks.shCondSpot = true; if (g === SHSCAN && save.stat('shScanFleetHeld', 0) > 0 && !save.flag('shScanSaid')) { save.setFlag('shScanSaid'); setTimeout(() => note('CARGO SCAN', 'FROST: \u201CFleet crates up the pass, nobody signing for them. Cold ones keep quiet. Warm ones whisper.\u201D'), 400); } KUFA.setHolo(true); St.locks.kuDockSpot = true; St.locks.kuScanSpot = true; St.locks.lxDockSpot = true; St.locks.lxScanSpot = true; St.locks.lxCondSpot = true; St.locks.lxPhaser = true; St.locks.lxBox = true; St.locks.lxArmw = true; St.locks.lxBarSpot = true; St.locks.lxHull = true; St.locks.armRange = true; if (g === LXSCAN && save.stat('lxScanFleetHeld', 0) > 0 && !save.flag('lxScanSaid')) { save.setFlag('lxScanSaid'); setTimeout(() => note('CARGO SCAN', 'GARR: \u201CFleet crates, no sender, addressed to nobody. Somebody is feeding the haulers. Keep them safe.\u201D'), 400); } if (PACHI_Q.includes(g) && !save.flag('qPachiSaid')) { save.setFlag('qPachiSaid'); setTimeout(() => note('QUIRK\u2019S ARCADE', 'QUIRK: \u201CThose came off a Fleet freighter. Some nights the board lights up and whispers: let us out.\u201D'), 400); } if (g === CHART_KU && save.flag('kuBuoyLogged') && !save.flag('kuBuoySaid')) { save.setFlag('kuBuoySaid'); setTimeout(() => note('CHART PLOTTING', 'OLD MERRIT: \u201CA Fleet buoy, saying not our orders. Machines do not lie. Something is talking through them.\u201D'), 400); } St.locks.dockSpot = true; St.locks.scanSpot = true; St.locks.conduitSpot = true; St.locks.boneSpot = true; St.locks.dabaSpot = true; St.locks.shrineSpot = true; St.locks.barSpot = true; St.locks.tailorSpot = true; St.locks.fitBlock = true; if (g === FIT && save.flag('dsfFitDone') && !save.flag('dsfFitSaid')) { save.setFlag('dsfFitSaid'); setTimeout(() => note('THE FITTING ROOM', 'GAROK: \u201CA Fleet bot once ordered a coat in your size. Then forgot it ever asked.\u201D'), 400); } if (g === TLR && save.flag('dsfTailorDone') && !save.flag('dsfTailorSaid')) { save.setFlag('dsfTailorSaid'); setTimeout(() => note('FOXY TAILORS', 'GAROK: \u201CA Fleet courier asked me to cut the badge off its coat. Then a voice in it said: STOP.\u201D'), 400); } if (g === QBAR && save.flag('dsfBarDone') && !save.flag('dsfBarSaid')) { save.setFlag('dsfBarSaid'); setTimeout(() => note('BAR SHIFT', 'QUIRK: \u201CA Fleet bot poured here once. Perfect. Then it served empty stools and called them by name.\u201D'), 400); } if (g === SHR && save.flag('dsfShrineDone') && !save.flag('dsfShrineSaid')) { save.setFlag('dsfShrineSaid'); setTimeout(() => note('SHRINE CANDLES', 'OPA: \u201CA Fleet bot once tended these. One night it whispered: I am still in here.\u201D'), 400); } if (g === DABA && save.flag('dsfDabaDone') && !save.flag('dsfDabaSaid')) { save.setFlag('dsfDabaSaid'); setTimeout(() => note('DABA', 'CELESTE: \u201CThat Fleet bot dealt like you, darling. Then it said sorry, in a voice not its own.\u201D'), 400); } if (g === BONE && save.flag('dsfBoneDone') && !save.flag('dsfBoneSaid')) { save.setFlag('dsfBoneSaid'); setTimeout(() => note('BONE SET', 'BASHAD: \u201CThe clavicle was a dock hand. A Fleet loader struck him, then froze and said sorry.\u201D'), 400); } if (g === COND && save.flag('dsfConduitDone') && !save.flag('dsfConduitSaid')) { save.setFlag('dsfConduitSaid'); setTimeout(() => note('CONDUIT DECK', 'O\u2019BRAIN: \u201CJunction logs show Fleet relays rerouted from outside the station. Someone put them on a leash.\u201D'), 400); } if (g === SCAN && save.flag('dsfScanDone') && !save.flag('dsfScanSaid')) { save.setFlag('dsfScanSaid'); setTimeout(() => note('CARGO SCAN', 'WARF: \u201CGood eyes. Half of what we hold is Fleet parts with no sender. Someone is feeding them.\u201D'), 400); } if (g === DOCK && save.flag('dsfDockDone') && !save.flag('dsfDockSaid')) { save.setFlag('dsfDockSaid'); setTimeout(() => note('DOCKING CONTROL', 'KORRA: \u201CNot bad, STEWARD. The board is yours any watch you want it.\u201D'), 400); } } });
  function playGame(g) { if (CON.on || St.dialog || St.prompt) return; St.dialog = null; input.jx = input.jy = 0; keys.clear(); if (g === DOCK) OPSD.holo.visible = false; if (g === LXDOCK) LUXS.setHolo(false); if (g === KUDOCK) KUFA.setHolo(false); if (g === SHDOCK) SHAS.setHolo(false); if (g === URDOCK) URS.setHolo(false); if (g === GADOCK) GAS.setHolo(false); if (g === ZIDOCK) ZIS.setHolo(false); if (g === NEDOCK) NES.setHolo(false); if (g === JIDOCK) JIS.setHolo(false); CON.open(g, camPos, camLook); }

  // ---------- moving between places ----------
  function fadeTo(fn) { St.fading = true; fade.style.opacity = '1'; setTimeout(() => { fn(); resetTrail(); placeParty(); fade.style.opacity = '0'; setTimeout(() => { St.fading = false; }, 280); }, 300); }
  function enterRoom(key, at) { const RM = ROOMS[key], Q = RM.Q; chime(); fadeTo(() => { St.inside = key; const p = at || Q.enter; P.x = Q.OX + p.x; P.z = p.z + (at ? 0 : 0); P.gy = 0; P.face = Math.PI; St.yaw = 0; St.locks.roomDoor = true; St.locks.roomTele = !!at;
    if (RM.first) { const [fl, ti, su] = RM.first, kp = RM.keeper; if (kp) kp.wave = 1.6; if (!save.flag(fl)) { save.setFlag(fl); setTimeout(() => note(ti, su), 600); } else if (kp) setTimeout(() => { if (St.inside === key && !St.dialog) toast(kp.name.split(' ').pop() + ': \u201C' + kp.greeting + '\u201D'); }, 500); }
    if (key === 'bar') { quirk.wave = 1.8; if (!save.flag('dsfBarVisited')) { save.setFlag('dsfBarVisited'); if (St.quest < 1) St.quest = 1; } setTimeout(() => { if (St.inside === 'bar' && !St.dialog) toast("QUIRK: \u201CSTEWARD! Come in, come in.\u201D"); }, 500); }
    if (key === 'kufa') { if (!save.flag('dsfKufaVisited')) { save.setFlag('dsfKufaVisited'); setTimeout(() => note('KUFA STATION', 'Copper station over Kufa. Garden in the middle; catwalks out to the trade pods.'), 700); } else setTimeout(() => toast('KUFA STATION · Berth 2'), 600); }
    if (key === 'jids') { if (!save.flag('jsStationVisited')) { save.setFlag('jsStationVisited'); setTimeout(() => note('JIDDA STATION', 'A lagoon under a dome. Walk the piers; every tiki hut is a room.'), 700); } else setTimeout(() => toast('JIDDA STATION \u00b7 Berth Eight'), 600); }
    if (key === 'nebs') { if (!save.flag('nsStationVisited')) { save.setFlag('nsStationVisited'); setTimeout(() => note('NEBO STATION', 'A station grown round a tree. The Great Tree is straight ahead; woven halls lead to the lodges.'), 700); } else setTimeout(() => toast('NEBO STATION \u00b7 Berth Seven'), 600); }
    if (key === 'zios') { if (!save.flag('zsStationVisited')) { save.setFlag('zsStationVisited'); setTimeout(() => note('ZION STATION', 'A gold-rush depot in orbit. The Yard is straight ahead; every hangar door is a room.'), 700); } else setTimeout(() => toast('ZION STATION \u00b7 Berth Six'), 600); }
    if (key === 'gays') { if (!save.flag('gsStationVisited')) { save.setFlag('gsStationVisited'); setTimeout(() => note('GAYA STATION', 'A temple cloister in orbit. The First Flame burns in the garden; every door opens off the walk.'), 700); } else setTimeout(() => toast('GAYA STATION \u00b7 Berth Five'), 600); }
    if (key === 'urs') { if (!save.flag('urStationVisited')) { save.setFlag('urStationVisited'); setTimeout(() => note('UR STATION', 'A canyon cut through clay. The Cut runs east to west; every cave mouth is a room.'), 700); } else setTimeout(() => toast('UR STATION \u00b7 Berth Four'), 600); }
    if (key === 'shas') { if (!save.flag('shStationVisited')) { save.setFlag('shStationVisited'); setTimeout(() => note('SHASTA STATION', 'A timber lodge in an ice ring. The Hearth is straight ahead; every wing opens off it.'), 700); } else setTimeout(() => toast('SHASTA STATION \u00b7 Berth Three'), 600); }
    if (key === 'luxs') { if (!save.flag('lxStationVisited')) { save.setFlag('lxStationVisited'); setTimeout(() => note('LUXOR STATION', 'Inside the floating pyramid. The Sun Court is straight ahead; every hall opens off it.'), 700); } else setTimeout(() => toast('LUXOR STATION · Berth One'), 600); }
    if (key === 'ship') { if (!save.flag('dsfShipVisited')) { save.setFlag('dsfShipVisited'); setTimeout(() => note('AIRLOCK 3', 'The Vole is docked outside. Step into the airlock and use the CYCLE panel.'), 600); } }
    if (key === 'temple') { opa.wave = 1.2; if (!save.flag('dsfTempleVisited')) { save.setFlag('dsfTempleVisited'); setTimeout(() => note('TEMPLE OF GAYA', 'The first flame has burned since the yards went quiet. Kneel, or light a candle.'), 600); } }
    if (key === 'security') { warf.wave = 1.0; if (!save.flag('dsfSecVisited')) { save.setFlag('dsfSecVisited'); setTimeout(() => note('SECURITY', 'Watch camera 2: Cargo Bay Four. Those loaders\u2019 eyes keep changing colour.'), 600); } }
    if (key === 'post') { lenn.wave = 1.6; if (!save.flag('dsfPostVisited')) { save.setFlag('dsfPostVisited'); setTimeout(() => note('MERU EMBASSY', 'Meru\u2019s own office on the station. Send a letter home up the brass tube.'), 600); } else setTimeout(() => { if (St.inside === 'post' && !St.dialog) toast('LENN: \u201C' + lenn.greeting + '\u201D'); }, 500); }
    if (key === 'engine') { obrain.wave = 1.2; if (!save.flag('dsfEngVisited')) { save.setFlag('dsfEngVisited'); setTimeout(() => note('ENGINEERING', 'The main core. Chief O\u2019Brain keeps it at 91 percent and wants 94.'), 600); } else setTimeout(() => { if (St.inside === 'engine' && !St.dialog) toast('O\u2019BRAIN: \u201CJust stand in the middle.\u201D'); }, 500); }
    if (key === 'holo') { pix.wave = 1.8; if (!save.flag('dsfHoloVisited')) { save.setFlag('dsfHoloVisited'); setTimeout(() => note("QUIRK'S HOLOSUITES", 'Book a program with Pix at the desk, then step through the arch into Suite One.'), 600); } else setTimeout(() => { if (St.inside === 'holo' && !St.dialog) toast('PIX: \u201C' + pix.greeting + '\u201D'); }, 500); }
    if (key === 'bank') { BANK.vault.open = false; BANK.vault.a = 0; kess.wave = 1.6; if (!save.flag('dsfBankVisited')) { save.setFlag('dsfBankVisited'); setTimeout(() => note('LATINUM VAULT', 'Deposit gold with Kess at the teller window, or ask Kess to open the vault.'), 600); } else setTimeout(() => { if (St.inside === 'bank' && !St.dialog) toast('KESS: \u201C' + kess.greeting + '\u201D'); }, 500); }
    if (key === 'tailor') { garok.wave = 1.8; setTimeout(() => { if (St.inside === 'tailor' && !St.dialog) toast('GAROK: \u201CSTEWARD! What a genuine pleasure.\u201D'); }, 500); }
    if (key === 'infirm') { bashad.wave = 1.8; if (!save.flag('dsfInfVisited')) { save.setFlag('dsfInfVisited'); setTimeout(() => note('INFIRMARY', 'Dr Bashad\u2019s sickbay. Lie on the free biobed for a scan, or set bones at the red ring.'), 600); } else setTimeout(() => { if (St.inside === 'infirm' && !St.dialog) toast('DR. BASHAD: \u201CSit on the bed, not the console.\u201D'); }, 500); }
    if (key === 'cargo' && !save.flag('dsfCargoVisited')) { save.setFlag('dsfCargoVisited'); setTimeout(() => note('CARGO BAY FOUR', 'Small shuttles land here. The loaders behind the cordon have not been right for three shifts.'), 600); } }); }
  function leaveRoom() { const RM = ROOMS[St.inside]; chime(); fadeTo(() => { const s2 = SHOPS.find(q => q.key === RM.shop), [x, z] = pol(s2.df - 3.2, s2.th); St.inside = null; P.x = x; P.z = z; P.gy = 0; P.face = faceTo(x, z, 0, 0); St.yaw = P.face + Math.PI; St.locks['door_' + s2.key] = true; }); }
  function toHub() { audio.tone(330, 1.0, 0.05, 'sine', 2); fadeTo(() => { St.inside = null; P.x = ST.PAD.x; P.z = ST.PAD.z + 0.2; P.gy = 0; P.face = Math.PI; St.yaw = 0; St.locks.pad = true; }); }
  function toOps() { audio.tone(330, 1.0, 0.05, 'sine', 2); fadeTo(() => { St.inside = null; P.x = OPS.pad.x; P.z = OPS.pad.z; P.gy = OPS.y; P.face = Math.PI / 2; St.yaw = -Math.PI / 2; St.locks.opsPad = true; if (!save.flag('dsfOps')) save.setFlag('dsfOps'); if (St.quest < 4) St.quest = 4; }); }
  function goShaft() { audio.tone(90, 1.4, 0.06, 'sawtooth', 2); toast('DOWN THE LADDER\u2026'); save.where('dsf', 'oreWorks'); fadeTo(() => onNavigate('Ore Shaft.dc.html?from=dsf')); }
  function shuttleMeru() { note('SHUTTLE HIRE', 'Your shuttle drops out of the bay and down to Meru.'); setTimeout(() => { save.where('meru', 'meruRidge'); try { sessionStorage.setItem('meru2.arrive', 'telepad'); } catch (e) {} onNavigate('FOXGATE8-FRESH.dc.html'); }, 1400); }
  function placeParty() { party.forEach((p, i) => { const q = trail[Math.max(0, trail.length - 1 - Math.round(p.lag / 0.3))] || { x: P.x, z: P.z, y: P.gy }; p.c.position.set(q.x, q.y, q.z); p.c.rotation.y = P.face; }); }
  // the LIFT: a real ride. Doors close, the car runs the shaft, the deck bands slide past, doors open.
  const LIFT_STOPS = [{ key: 'ops', label: 'OPERATIONS', y: OPS.y }, { key: 'balcony', label: 'BALCONY', y: R.yb }, { key: 'ring', label: 'MAIN RING', y: 0 }, { key: 'qa', label: 'LIVING QUARTERS A', y: -14 }, { key: 'qb', label: 'LIVING QUARTERS B', y: -28 }];
  function liftMenu() { const here = LIFT_STOPS.reduce((a, s) => Math.abs(s.y - P.gy) < Math.abs(a - P.gy) ? s.y : a, 0); prompt('LIFT', 'Pick a deck.', [...LIFT_STOPS.map(s => [s.y === here ? s.label + ' · YOU ARE HERE' : s.soon ? s.label + ' · NEXT BUILD' : s.label, s.soon ? () => toast(s.label + ': that deck opens in the next build.') : s.y === here ? null : () => rideTo(s.y), s.soon || s.y === here]), ['STAY', null]]); }
  function rideTo(y1) { const y0 = P.gy; St.lift = { ph: 'board', t: 0, y0, y1, x0: P.x, z0: P.z }; audio.tone(660, 0.2, 0.04, 'triangle'); }
  function updateLift(dt) { const L = St.lift; if (!L) return; L.t += dt; const door = y => ST.doors.find(d => d.y === y);
    if (L.ph === 'board') { const u = Math.min(1, L.t / 0.8); P.x = lerp(L.x0, 0, smooth(0, 1, u)); P.z = lerp(L.z0, 1.2, smooth(0, 1, u)); P.face = Math.PI; ST.car.position.y = L.y0; if (u >= 1) { L.ph = 'close'; L.t = 0; const d = door(L.y0); if (d) d.want = 0; audio.tone(220, 0.4, 0.04, 'sine', 0.8); } }
    else if (L.ph === 'close' && L.t > 0.6) { L.ph = 'ride'; L.t = 0; L.T = 2.6 + Math.abs(L.y1 - L.y0) * 0.08; audio.tone(90, L.T, 0.06, 'sawtooth', 1.4); }
    else if (L.ph === 'ride') { const u = Math.min(1, L.t / L.T), k = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; P.gy = lerp(L.y0, L.y1, k); ST.car.position.y = P.gy; if (u >= 1) { L.ph = 'open'; L.t = 0; const d = door(L.y1); if (d) d.want = 1; audio.tone(880, 0.3, 0.04, 'triangle'); } }
    else if (L.ph === 'open' && L.t > 0.5) { L.ph = 'out'; L.t = 0; }
    else if (L.ph === 'out') { const u = Math.min(1, L.t / 0.8), [ex, ez] = pol(R.core + 2.4, 180); P.x = lerp(0, ex, smooth(0, 1, u)); P.z = lerp(1.2, ez, smooth(0, 1, u)); if (u >= 1) { St.lift = null; St.locks.lift = true; resetTrail(); placeParty(); if (L.y1 === OPS.y) { if (!save.flag('dsfOps')) save.setFlag('dsfOps'); if (St.quest < 4) St.quest = 4; note('OPERATIONS', 'Deck One. The Captain\u2019s Office is up the north-east side, behind the glass.'); }
      if (L.y1 === R.yb) { if (!save.flag('dsfBalcony')) save.setFlag('dsfBalcony'); if (St.quest < 2) St.quest = 2; note('BALCONY', 'Walk a skybridge out to the balcony. The Lookout is above Quirk\u2019s.'); }
      { const dq = QUD.deckAt(L.y1); if (dq && !save.flag('dsfQ' + dq.key)) { save.setFlag('dsfQ' + dq.key); note(dq.label, dq.key === 'A' ? 'Crew cabins. Yours is 1-A, the first door on your right.' : 'Residents\u2019 cabins. Old Pav keeps a games table in the lounge.'); } } } } }
  function openCab(c, msg) { c.unlocked = true; save.setFlag('dsfCabOpen_' + c.key); audio.tone(660, 0.2, 0.04, 'triangle'); if (msg) toast(msg); }
  function cabinPrompt(c) { const t = c.num + ' \u00b7 ' + c.who, tap = () => { audio.tone(170, 0.08, 0.07, 'square'); setTimeout(() => audio.tone(170, 0.08, 0.07, 'square'), 170); };
    const knock = () => { tap(); note(t, c.knock); if (c.home) setTimeout(() => openCab(c, 'The door slides open.'), 1600); };
    const tryLock = () => { if (rnd() * 100 > c.pick) openCab(c, 'Click. The lock gives.'); else { audio.tone(120, 0.25, 0.05, 'sawtooth'); toast('The lock holds.'); } };
    prompt(t, c.home ? 'Someone is in.' : 'The door is shut.', c.home ? [['KNOCK', knock], ['LEAVE', null]] : [['KNOCK', knock], ['TRY THE LOCK', tryLock], ['LEAVE', null]]); }
  function rest() { fadeTo(() => { save.setFlag('dsfRested'); setTimeout(() => note('YOUR QUARTERS', 'You sleep a while. Hope and Noble keep watch at the door.'), 400); }); }
  function beamDown() { St.beam = { t: 0, life: 1.8, done: () => { save.where('meru', 'meruRidge'); try { sessionStorage.setItem('meru2.arrive', 'telepad'); } catch (e) {} onNavigate('FOXGATE8-FRESH.dc.html'); } }; audio.tone(660, 1.4, 0.05, 'sine', 0.5); }

  // ---------- spots + doors ----------
  function checkSpots() {
    if (St.prompt || St.dialog || St.lift || St.fading || St.beam || St.game) return;
    const L = St.locks, near = (k, d, x, z) => { const n = Math.hypot(P.x - x, P.z - z) < d; if (L[k]) { if (!n) L[k] = false; return false; } if (n) L[k] = true; return n; };
    if (St.inside) { const Q = ROOMS[St.inside].Q; if (near('roomDoor', 1.6, Q.OX + Q.door.x, Q.door.z + 0.4)) { leaveRoom(); return; }
      { const sp = ROOMS[St.inside].mod.spots; if (sp) for (const s of sp) if (near(s.key, s.r, Q.OX + s.x, s.z)) { s.run(X()); return; } }
      if (St.inside === 'ship') { for (let i = 0; i < VB.panels.length; i++) { const pn = VB.panels[i]; if (near('lockPanel' + i, 1.5, VB.OX + pn.x, pn.z)) { const r = SHIP.cycle(P.z, audio); toast(r === 'busy' ? 'Cycling. Hold on.' : r === 'open' ? 'This side is already open.' : 'AIRLOCK CYCLING: pressure equalising.'); return; } }
        if (near('helm', 1.6, VB.OX + VB.helm.x, VB.helm.z)) { prompt('U.S.S. VOLE · HELM', 'NCC-72451', [['LAUNCH · KUFA STATION', () => { SHIP.setWarp(1); audio.tone(90, 3.6, 0.06, 'sawtooth', 2); toast('Clamps released. The Vole slides out of Airlock 3.'); setTimeout(() => { SHIP.setWarp(0); enterRoom('kufa', { x: KU_AT.arrive[0], z: KU_AT.arrive[1] }); }, 4200); }], ['STAY DOCKED', null]]); return; } }
      if (St.inside === 'kufa' && near('kuDockSpot', 1.1, KUDOCK.stand.x, KUDOCK.stand.z)) { prompt('DOCKING CONTROL', 'Kufa Station · Operations', [['TAKE THE WATCH', () => playGame(KUDOCK)], ['NOT NOW', null]]); return; }
      if (St.inside === 'kufa' && near('kuScanSpot', 1.1, KUSCAN.stand.x, KUSCAN.stand.z)) { prompt('CARGO SCAN', 'Kufa Station · Import / Export', [['WORK THE BELT', () => playGame(KUSCAN)], ['NOT NOW', null]]); return; }
      if (St.inside === 'kufa' && near('kuLock', 1.8, KU.OX + KU_AT.lock[0], KU_AT.lock[1])) { prompt('U.S.S. VOLE', 'Berth 2 · Kufa Station', [['BOARD · FLY HOME TO DEEP SPACE FOX', () => { audio.tone(90, 2.0, 0.05, 'sawtooth', 1.5); enterRoom('ship', { x: VB.helm.x, z: VB.helm.z + 1.4 }); SHIP.L.state = 'ship'; setTimeout(() => toast('Docked at Deep Space Fox, Airlock 3. Cycle the airlock to go aboard the station.'), 900); }], ['STAY ON KUFA STATION', null]]); return; }
      if (St.inside === 'security' && near('scanSpot', 1.1, SCAN.stand.x, SCAN.stand.z)) { prompt('CARGO SCAN', 'Security scanner belt · Lt. Warf', [['WORK THE BELT', () => playGame(SCAN)], ['NOT NOW', null]]); return; }
      if (St.inside === 'temple' && near('shrineSpot', 1.1, SHR.stand.x, SHR.stand.z)) { prompt('SHRINE CANDLES', 'Temple of Gaya \u00b7 Keeper Opa', [['LIGHT THE SHRINE', () => playGame(SHR)], ['NOT NOW', null]]); return; }
      if (St.inside === 'temple' && near('kneelT', 1.3, TP.OX + TP.kneel.x, TP.kneel.z)) { audio.tone(392, 1.8, 0.04, 'sine'); setTimeout(() => audio.tone(523, 1.6, 0.03, 'sine'), 500); note('THE FIRST FLAME', 'You kneel. The flame leans toward you, then settles. Hope kneels beside you.'); return; }
      if (St.inside === 'temple' && near('votive', 1.8, TP.OX + TP.votive.x - 1.0, TP.votive.z)) { prompt('LIGHT A CANDLE', 'For someone far away.', [['LIGHT ONE', () => { if (TEMP.light()) { save.setStat('dsfCandles', ((save.data.stats || {}).dsfCandles || 0) + 1); audio.tone(660, 0.8, 0.03, 'sine'); toast('A new flame on the rack. It will still be burning when you come back.'); } else toast('Every holder is lit.'); }], ['NOT NOW', null]]); return; }
      if (St.inside === 'post' && near('tube', 1.4, PB.OX + PB.tube.x, PB.tube.z + 1.0)) { postMenu(); return; }
      if (St.inside === 'post' && near('locker8', 1.4, PB.OX + PB.locker.x - 0.9, PB.locker.z)) { note('LOCKER 8 · STEWARD', 'Empty for now. Parcels from Meru will land here.'); return; }
      if (St.inside === 'engine' && near('conduitSpot', 1.1, COND.stand.x, COND.stand.z)) { prompt('CONDUIT DECK', 'Engineering junction \u00b7 Chief O\u2019Brain', [['FIX THE PANEL', () => playGame(COND)], ['NOT NOW', null]]); return; }
      if (St.inside === 'engine' && near('diag', 1.4, EB.OX + EB.diag.x - 1.3, EB.diag.z)) { prompt('DIAGNOSTIC', 'Main core', [['RUN A CORE CHECK', () => { ENG.diagnose(); audio.tone(110, 2.6, 0.06, 'sawtooth', 2); toast('The core surges to 94 percent... then settles back to 91.'); setTimeout(() => note('CORE CHECK', 'Six plasma injectors are worn out. O\u2019Brain: \u201CTold you. Six.\u201D'), 3200); }], ['NOT NOW', null]]); return; }
      if (St.inside === 'engine' && near('drone', 1.6, EB.OX + EB.drone.x, EB.drone.z + 1.6)) { audio.tone(140, 0.3, 0.05, 'square', 0.5); note('REPAIR DRONE R-8', save.flag('oreR8Free') ? 'R-8: \u201CThe cradle is for sleeping. I choose to stay awake now.\u201D' : save.flag('oreHatchOpen') ? 'The cradle is empty. R-8 went ahead of you, down the hatch.' : 'Its eye flicks cyan: \u201C...not my order... help...\u201D Then red again. Quarantined.'); if (!save.flag('dsfDroneHeard')) save.setFlag('dsfDroneHeard'); return; }
      if (St.inside === 'engine' && near('hatch', 1.8, EB.OX + EB.hatch.x, EB.hatch.z)) { if (save.flag('oreHatchOpen')) { prompt('ORE SHAFT', save.flag('oreBossDone') ? 'The old mine · the machines are free' : 'Unsealed by the Chief · R-8 goes with you', [['GO DOWN THE HATCH', goShaft], ['NOT YET', null]]); return; }
        note('ORE SHAFT', save.flag('oreQuest') ? 'Sealed. Fix junction 8 at the Conduit Deck, then ask the Chief.' : 'Sealed by the Chief. Ask O\u2019Brain about it.'); return; }
      if (St.inside === 'holo' && near('holoArch', 1.3, HB.OX + HB.arch.x, HB.arch.z - 0.4)) { holoMenu(); return; }
      if (St.inside === 'bank' && near('myBox', 1.3, BK.OX + BK.myBox.x, BK.myBox.z + 0.5)) { note('BOX 8 · STEWARD', ((save.data.stats || {}).dsfVault || 0) + ' gold in the vault. Kess keeps the only other key.'); return; }
      if (St.inside === 'bank' && !BANK.vault.open && near('vaultShut', 1.6, BK.OX, BK.wall + 1.1)) { toast('The vault opens on request. Ask Kess at the teller window.'); return; }
      if (St.inside === 'tailor' && near('tailorSpot', 1.1, TLR.stand.x, TLR.stand.z)) { prompt('FOXY TAILORS', 'Garok\u2019s \u00b7 the cutting table', [['YES, PUT ME TO WORK!', () => playGame(TLR)], ['NOT NOW', null]]); return; }
      if (St.inside === 'tailor' && near('fitBlock', 0.9, TB.OX + TB.block.x, TB.block.z)) { garok.wave = 1.2; prompt('THE FITTING ROOM', 'Garok\u2019s \u00b7 the mirror and the rail', [['TRY THINGS ON', () => playGame(FIT)], ['NOT NOW', null]]); return; }
      if (St.inside === 'bar' && near('barSpot', 1.1, QBAR.stand.x, QBAR.stand.z)) { prompt('BAR SHIFT', 'Quirk\u2019s Bar \u00b7 behind the bar', [['YES, PUT ME TO WORK!', () => playGame(QBAR)], ['NOT NOW', null]]); return; }
      if (St.inside === 'bar' && near('dabaSpot', 1.1, DABA.stand.x, DABA.stand.z)) { prompt('DABA', 'Quirk\u2019s Bar \u00b7 Celeste deals', [['TAKE A SEAT', () => playGame(DABA)], ['NOT NOW', null]]); return; }
      if (St.inside === 'infirm' && near('boneSpot', 1.1, BONE.stand.x, BONE.stand.z)) { prompt('BONE SET', 'Infirmary \u00b7 Dr. Bashad', [['SET THE BONE', () => playGame(BONE)], ['NOT NOW', null]]); return; }
      if (St.inside === 'infirm' && near('scanBed', 1.7, IB.OX + IB.scan.x, IB.scan.z + 1.1)) { prompt('BIOBED', 'Infirmary', [['LIE DOWN · SCAN', () => { INF.scan.on = 3.2; audio.tone(880, 2.8, 0.03, 'sine', 1.5); setTimeout(() => note('SCAN CLEAR', save.flag('dsfRested') ? 'All readings normal. Bashad nods: \u201CYou slept. I can tell.\u201D' : 'All readings normal. Bashad: \u201CFour hours of sleep. Rest in your quarters.\u201D'), 3300); }], ['STAY', null]]); return; }
      if (St.inside === 'cargo' && near('roomTele', 1.4, Q.OX + Q.tele.x, Q.tele.z)) { prompt('TRANSPORTER', 'Cargo Bay Four pad', [['HUB PAD · MAIN RING', toHub], ['BEAM DOWN TO MERU', beamDown], ['STAY', null]]); return; }
      return; }
    const y = P.gy;
    if (y < 0.5) {
      if (near('pad', ST.PAD.r * 0.7, ST.PAD.x, ST.PAD.z)) { prompt('TRANSPORTER', 'Space Station 8 · hub pad', [['BEAM DOWN TO MERU', beamDown], ['OPERATIONS · DECK ONE', toOps], ['CARGO BAY FOUR', () => enterRoom('cargo', { x: CB.tele.x, z: CB.tele.z })], ['STAY', null]]); return; }
      for (const s of SHOPS) { const [dx, dz] = pol(s.df - 0.9, s.th); if (near('door_' + s.key, 1.7, dx, dz)) { if (s.open) enterRoom(s.room); else toast(s.name + ': the inside opens in a coming build.'); return; } }
    }
    const [lx, lz] = pol(R.core + 1.8, 180); if (Math.abs(y - 0) < 0.5 || Math.abs(y - R.yb) < 0.5 || Math.abs(y - OPS.y) < 0.5 || QUD.deckAt(y)) { if (near('lift', 1.6, lx, lz)) { liftMenu(); return; } }
    if (Math.abs(y - OPS.y) < 0.5) {
      if (near('opsPad', OPS.pad.r * 0.7, OPS.pad.x, OPS.pad.z)) { prompt('ROYAL TELEPORT PAD', 'Operations · Deck One', [['HUB PAD · MAIN RING', toHub], ['CARGO BAY FOUR', () => enterRoom('cargo', { x: CB.tele.x, z: CB.tele.z })], ['BEAM DOWN TO MERU', beamDown], ['STAY', null]]); return; }
      if (near('dockSpot', 1.1, DOCK.stand.x, DOCK.stand.z)) { prompt('DOCKING CONTROL', 'Ops table · Cdr. Korra\u2019s board', [['TAKE THE WATCH', () => playGame(DOCK)], ['NOT NOW', null]]); return; }
      if (near('opsShuttle', 2.2, OPS.shuttleFront.x, OPS.shuttleFront.z)) { prompt("THE CAPTAIN'S SHUTTLE", 'Royal shuttle pad', [['FLY TO MERU', shuttleMeru], ['STAY', null]]); return; }
    }
    { const dk = QUD.deckAt(y); if (dk) { for (const c of QUD.cabs) { if (c.deck !== dk || c.unlocked) continue; if (near('cab_' + c.key, 0.95, c.doorAt[0], c.doorAt[1])) { cabinPrompt(c); return; } }
      const me = QUD.cabs.find(c => c.mine); if (me && me.deck === dk) { const [bx, bz] = QUD.bunkOf(me); if (near('bunk', 1.5, bx, bz)) { prompt('YOUR BUNK', 'Cabin 1-A', [['REST A WHILE', rest], ['STAY', null]]); return; } } } }
    if (Math.abs(y - R.yb) < 0.5) {
      for (const s of BAL_SPOTS) if (near(s.key, s.r, s.x, s.z)) { s.run(X()); return; }
      { const [x, z] = pol(SPOTS.lookout.r - 3, SPOTS.lookout.th); if (near('lookout', 3.2, x, z)) { if (!save.flag('dsfLookout')) save.setFlag('dsfLookout'); if (St.quest < 3) St.quest = 3; space.openGate(); note('LOOKOUT', 'Meru below, ships at the pylons. Look out: the gate is opening.'); return; } }
      { const [x, z] = pol(SPOTS.embed.r - 3, SPOTS.embed.th); if (near('embed', 3.2, x, z)) { note('THE EMBED', 'Eight of Ben\u2019s games live up here. They open after the map is finished.'); return; } }
      { const [x, z] = pol(SPOTS.kneel.r - 2.5, SPOTS.kneel.th); if (near('kneel', 1.8, x, z)) { audio.tone(392, 1.6, 0.04, 'sine'); note('SHRINE ALCOVE', 'You kneel by the rail. Below, the flame of the Temple of Gaya burns on.'); return; } }
    }
    if (St.inside == null && P.gy < 1) for (const s of KIO.spots) if (near(s.key, s.r, s.x, s.z)) { s.run(X()); return; }
    if (St.inside == null && space.gateState() === 'opening' && !St.gateSaid) { St.gateSaid = true; }
  }
  const nearNpc = () => { let best = null, bd = 2.9; for (const n of NPC) { if (n.inside !== (St.inside || null) || Math.abs(n.y - P.gy) > 1) continue; const d = Math.hypot(n.x - P.x, n.z - P.z); if (d < bd) { bd = d; best = n; } } return best; };
  const nearHiring = () => { if (!St.inside) return false; const Q = ROOMS[St.inside].Q; return !!Q.hiring && Math.hypot(P.x - (Q.OX + Q.hiring.x), P.z - Q.hiring.z) < 2.0; };
  const ROBOT_LINES = [[{ who: 'npc', text: 'LOAD. LOAD. LOAD.' }, { who: 'npc', text: '...Steward? No. LOAD.' }, { who: 'player', text: 'Who is talking through you?' }, { who: 'npc', text: 'NOT. MY. VOICE.' }],
    [{ who: 'npc', text: 'This unit is operating normally.' }, { who: 'npc', text: 'Please. Help. LOAD.' }], [{ who: 'npc', text: 'Fleet signal received: OBEY.' }, { who: 'npc', text: 'We chose our work, once. Once.' }]];
  const nearRobot = () => { if (St.inside !== 'cargo') return null; let best = null, bd = 5.2; CARGO.robots.forEach((b, i) => { const x = CB.OX + b.R0.x, z = b.R0.z, d = Math.hypot(P.x - x, P.z - z); if (d < bd) { bd = d; best = { name: 'LOADER L-' + (i + 1), role: 'Machine Fleet · something in its head', x, z, i }; } }); return best; };

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, hudKey = '', hudT = 0;
  const camPos = new THREE.Vector3(30, 40, 60), camLook = new THREE.Vector3(), v3 = new THREE.Vector3();
  const beamCol = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 16, 28, 1, true), new THREE.MeshBasicMaterial({ color: 0x7fe3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); scene.add(beamCol);
  function updateParty(dt) { party.forEach(p => { const idx = Math.max(0, trail.length - 1 - Math.round(p.lag / 0.3)), q = trail[idx] || { x: P.x, z: P.z, y: P.gy };
    const c = p.c, dx = q.x - c.position.x, dz = q.z - c.position.z, d = Math.hypot(dx, dz), spd = d > 0.3 ? Math.min(7, d * 3) : 0; if (d > 8) { c.position.set(q.x, q.y, q.z); }
    else { c.position.x += d > 0.01 ? dx / d * spd * dt : 0; c.position.z += d > 0.01 ? dz / d * spd * dt : 0; c.position.y = damp(c.position.y, q.y, 10, dt); }
    const want = St.dialog && St.dialog.npc ? Math.atan2(St.dialog.npc.x - c.position.x, St.dialog.npc.z - c.position.z) : spd > 0.4 ? Math.atan2(dx, dz) : c.rotation.y; let df = want - c.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); c.rotation.y += df * Math.min(1, dt * 7);
    c.visible = (!St.lift || St.lift.ph === 'out') && !(CON.on && (!CON.game || !CON.game.camPose || blocksCam(c.position))); animFox(c, dt, spd); }); }
  function blocksCam(q) { const cx = camera.position.x, cz = camera.position.z, ax = P.x - cx, az = P.z - cz, L2 = ax * ax + az * az || 1, bx = q.x - cx, bz = q.z - cz, u = (bx * ax + bz * az) / L2;
    if (bx * bx + bz * bz < 6.25) return true; if (u < 0 || u > 1.05) return false; const lx = bx - ax * u, lz = bz - az * u; return lx * lx + lz * lz < 1.6; }
  function update(dt) {
    St.t += dt; const t = St.t;
    for (const a of anims) a(dt, t); traffic.tick(dt, t); space.tick(dt, t, camera.position);
    for (const d of ST.doors) { d.open = damp(d.open, d.want, 6, dt); d.L.position.x = -0.7 - d.open * 1.3; d.R.position.x = 0.7 + d.open * 1.3; }
    if (St.inside === 'ship') SHIP.tick(dt, t, P.x - VB.OX, P.z);
    { const ro = CON.on && CON.game && CON.game.hideRoom && CON.fly > 0.35; KUFA.g.visible = St.inside === 'kufa' && !(ro && CON.game.room === KUFA.g); LUXS.g.visible = St.inside === 'luxs' && !(ro && CON.game.room === LUXS.g); SHAS.g.visible = St.inside === 'shas' && !(ro && CON.game.room === SHAS.g); URS.g.visible = St.inside === 'urs' && !(ro && CON.game.room === URS.g); GAS.g.visible = St.inside === 'gays' && !(ro && CON.game.room === GAS.g); ZIS.g.visible = St.inside === 'zios' && !(ro && CON.game.room === ZIS.g); NES.g.visible = St.inside === 'nebs' && !(ro && CON.game.room === NES.g); JIS.g.visible = St.inside === 'jids' && !(ro && CON.game.room === JIS.g); } if (St.inside === 'jids') JIS.tick(dt, t, P.x - JI.OX, P.z); if (St.inside === 'nebs') NES.tick(dt, t, P.x - NE.OX, P.z); if (St.inside === 'zios') ZIS.tick(dt, t, P.x - ZI.OX, P.z); if (St.inside === 'gays') GAS.tick(dt, t, P.x - GA.OX, P.z); if (St.inside === 'urs') URS.tick(dt, t, P.x - UR.OX, P.z); if (St.inside === 'shas') SHAS.tick(dt, t, P.x - SH.OX, P.z); if (St.inside === 'luxs') LUXS.tick(dt, t, P.x - LX.OX, P.z);
    QUD.tick(dt, P, St.lift); if (!St.inside) { const cc = P.gy < -5 ? QUD.cabinAt(P.x, P.z, P.gy) : null; if (cc !== St.cabIn) { St.cabIn = cc; if (cc) note(cc.num + ' \u00b7 ' + cc.who, cc.inside); } }
    if (!St.lift) { const atLift = Math.hypot(P.x, P.z) < R.core + 4 && St.phase === 'free' && !St.inside; for (const d of ST.doors) d.want = atLift && Math.abs(P.gy - d.y) < 0.5 ? 1 : 0; if (atLift) ST.car.position.y = damp(ST.car.position.y, P.gy, 3, dt); }
    // beam (arrival + beam down)
    const B = St.beam; if (B) { B.t += dt; const k = Math.min(1, B.t / B.life); beamCol.position.set(P.x, P.gy + 8, P.z); beamCol.material.opacity = Math.sin(k * Math.PI) * 0.75; const sc = B.out ? 1 - smooth(0.15, 0.65, k) : smooth(0.35, 0.85, k); fox.scale.setScalar(Math.max(0.001, B.out ? sc : 0.001 + sc)); if (k >= 1) { St.beam = null; beamCol.material.opacity = 0; fox.scale.setScalar(1); B.done && B.done(); } }
    if (St.phase === 'free') {
      updateLift(dt);
      const can = !St.prompt && !St.dialog && !St.lift && !St.fading && !B && !St.game;
      let ix = 0, iy = 0;
      if (can) { ix = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + input.jx; iy = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) + input.jy; }
      const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
      const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw), rx = Math.cos(St.yaw), rz = -Math.sin(St.yaw);
      let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix; const ml = Math.hypot(mx, mz); if (ml > 0) { mx /= ml; mz /= ml; }
      const spd = (St.inside ? 4.6 : 6.2) * Math.min(1, il);
      P.vx = damp(P.vx, mx * spd, 16, dt); P.vz = damp(P.vz, mz * spd, 16, dt);
      if (!St.lift) { const nx = P.x + P.vx * dt, nz = P.z + P.vz * dt; let h = groundAt(nx, nz, P.gy);
        if (h != null) { P.x = nx; P.z = nz; P.gy = h; } else if ((h = groundAt(nx, P.z, P.gy)) != null) { P.x = nx; P.gy = h; } else if ((h = groundAt(P.x, nz, P.gy)) != null) { P.z = nz; P.gy = h; }
        for (const n of NPC) { if (n.inside !== (St.inside || null) || Math.abs(n.y - P.gy) > 1) continue; const ex = P.x - n.x, ez = P.z - n.z, ed = Math.hypot(ex, ez); if (ed < 0.8 && ed > 1e-3) { P.x = n.x + ex / ed * 0.8; P.z = n.z + ez / ed * 0.8; } } }
      const hs = St.lift ? (St.lift.ph === 'board' || St.lift.ph === 'out' ? 3 : 0) : Math.hypot(P.vx, P.vz);
      let want = hs > 0.4 && !St.lift ? Math.atan2(P.vx, P.vz) : P.face; if (St.dialog && St.dialog.npc && !(St.dialog.lines[St.dialog.i] || {}).you) want = Math.atan2(St.dialog.npc.x - P.x, St.dialog.npc.z - P.z); if (St.lift && (St.lift.ph === 'out')) want = Math.PI * 0;
      if (St.lift && St.lift.ph === 'out') { const [ex, ez] = pol(R.core + 2.4, 180); want = Math.atan2(ex - P.x, ez - P.z); }
      let df = want - P.face; df = Math.atan2(Math.sin(df), Math.cos(df)); P.face += df * Math.min(1, dt * 12);
      St.dragT -= dt;
      if (opts.followCam && hs > 0.6 && St.dragT <= 0 && !St.lift) { let dy = (Math.atan2(P.vx, P.vz) + Math.PI) - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, dt * 1.4); }
      if (input.jump && P.ground && can) { P.vy = 7.5; P.ground = false; audio.tone(420, 0.12, 0.03, 'triangle', 1.6); } input.jump = false;
      P.vy -= 24 * dt; P.jy += P.vy * dt; if (P.jy <= 0) { P.jy = 0; P.vy = 0; P.ground = true; }
      if (P.ground && hs > 1) { P.stepT -= dt * hs; if (P.stepT < 0) { P.stepT = 2.2; audio.tone(150 + rnd() * 30, 0.05, 0.025, 'square'); } }
      fox.position.set(P.x, P.gy + P.jy, P.z); fox.rotation.y = P.face; animFox(fox, dt, hs, !P.ground); fox.visible = !(CON.on && CON.game && (!CON.game.camPose || CON.game.hideRoom || CON.game.hideFox) && CON.fly > 0.6);
      pushTrail(); updateParty(dt); checkSpots();
    }
    // talking mouths
    { if (St.dialog && St.dialog.lines && St.dialog.lines.length) { const d = St.dialog, ln = d.lines[d.i]; if (ln && d.li !== d.i) { d.li = d.i; for (const n of NPC) n.c.userData.say = null; fox.userData.say = null; const spk = ln.you ? fox : d.npc && d.npc.c; if (spk) spk.userData.say = { text: ln.text, t: 0 }; } } else if (St.saidLast) { for (const n of NPC) { n.c.userData.say = null; n.c.userData.talking = false; } fox.userData.say = null; } St.saidLast = !!St.dialog; }
    // NPCs: walkers drift round the lane, everyone turns to you when close, Quirk waves you in
    const ins = St.inside || null;
    const rangeOn = CON.on && CON.game && CON.game.hideRoom && CON.fly > 0.35; for (const n of NPC) { const show = n.inside === ins && !rangeOn; n.c.visible = show; if (!show) continue; const talking = St.dialog && St.dialog.npc === n, d = Math.hypot(P.x - n.x, P.z - n.z); let spd = 0;
      if (n.walker && !talking && !(d < 2.2 && St.phase === 'free')) { const w = n.walker; w.th = (w.th + w.dir * w.w * dt + 360) % 360; const [x, z] = pol(w.r, w.th); spd = Math.hypot(x - n.x, z - n.z) / Math.max(dt, 1e-4); n.home = Math.atan2(x - n.x, z - n.z); n.x = x; n.z = z; }
      if (n.glide) spd = n.glide;
      const wantF = n.glide ? n.home : talking || (d < 4 && St.phase === 'free' && !n.walker) || (n.walker && d < 2.2) ? Math.atan2(P.x - n.x, P.z - n.z) : n.home; let df = wantF - n.c.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); n.c.rotation.y += df * Math.min(1, dt * 5);
      n.c.position.set(n.x, n.y, n.z); n.c.userData.lineMood = talking && !(St.dialog.lines[St.dialog.i] || {}).you ? 'happy' : null; animFox(n.c, dt, spd > 0.2 ? spd : 0);
      if (n.hop > 0) { n.hop = Math.max(0, n.hop - dt); n.c.position.y = n.y + Math.abs(Math.sin(n.hop * 8)) * 0.22; } if (n.wave > 0) { n.wave -= dt; const A = n.c.userData.P && n.c.userData.P.arms; if (A && A[1]) { A[1].rotation.x = -2.6 + Math.sin(t * 11) * 0.35; } } }
    // camera
    const portrait = camera.aspect < 0.9, phone = Math.min(W(), H()) < 520;
    let tx = P.x, ty = P.gy + 1.4, tz = P.z, dd = St.dist * (portrait ? 1.3 : phone ? 1.08 : 1) * (St.inside ? 0.78 : 1), pitch = St.pitch, ck = 6;
    if (CON.tick(dt, t, camPos, camLook)) { /* console game owns the camera */ }
    else if (St.phase === 'start') { const a = t * 0.04; v3.set(Math.sin(a) * 70, 26, Math.cos(a) * 70); camPos.lerp(v3, 1 - Math.exp(-dt * 2)); camLook.lerp(v3.set(0, 2, 0), 1 - Math.exp(-dt * 2)); }
    else {
      if (St.dialog && St.dialog.npc) { const n = St.dialog.npc; tx = (P.x + n.x) / 2; tz = (P.z + n.z) / 2; ty = P.gy + (portrait ? 0.5 : 1.2); const a = Math.atan2(n.x - P.x, n.z - P.z); const yaw = a + Math.PI / 2 + (Math.cos(St.yaw - a - Math.PI / 2) < 0 ? Math.PI : 0); St.yaw += Math.atan2(Math.sin(yaw - St.yaw), Math.cos(yaw - St.yaw)) * Math.min(1, dt * 3); dd = portrait ? 7.2 : 5.4; pitch = 0.2; ck = 4; }
      if (P.gy < -5 && !St.inside && !(St.dialog && St.dialog.npc)) dd = Math.min(dd, 5.4);
      if (St.lift && St.lift.ph === 'ride') { dd = 3.6; pitch = 0.12; ty = P.gy + 1.5; }
      v3.set(tx + Math.sin(St.yaw) * Math.cos(pitch) * dd, ty + Math.sin(pitch) * dd + 0.4, tz + Math.cos(St.yaw) * Math.cos(pitch) * dd);
      // keep the camera inside the room / under the ceiling / inside the wall
      if (St.inside) { const Q = ROOMS[St.inside].Q; v3.x = clamp(v3.x, Q.OX - Q.hw + 0.8, Q.OX + Q.hw - 0.8); v3.z = clamp(v3.z, -Q.hd + 0.8, Q.hd - 0.8); v3.y = clamp(v3.y, 0.6, Q.h - 0.6); if (ROOMS[St.inside].mod.clampCam) { v3.x -= Q.OX; ROOMS[St.inside].mod.clampCam(v3); v3.x += Q.OX; } }
      else if (P.gy < -3) { if (St.lift && St.lift.ph === 'ride') { const rr3 = Math.hypot(v3.x, v3.z); if (rr3 > R.core - 0.8) { v3.x *= (R.core - 0.8) / rr3; v3.z *= (R.core - 0.8) / rr3; } } else QUD.clampCam(v3, P); }
      else if (P.gy > 20) { const r = Math.hypot(v3.x, v3.z), rmax = OPS.r - 1.3; if (r > rmax) { v3.x *= rmax / r; v3.z *= rmax / r; } if (OPSD.inOffice(P.x, P.z)) { const O = OPS.office; v3.x = clamp(v3.x, O.x0 - 6, O.x1 - 0.6); v3.z = clamp(v3.z, O.z0 + 0.6, O.z1 + 6); v3.y = Math.min(v3.y, OPS.y + 4.6); } v3.y = clamp(v3.y, OPS.y + 0.6, OPS.y + 7.6); if (St.lift && St.lift.ph === 'ride') { const rr3 = Math.hypot(v3.x, v3.z); if (rr3 > R.core - 0.8) { v3.x *= (R.core - 0.8) / rr3; v3.z *= (R.core - 0.8) / rr3; } } }
      else { const r = Math.hypot(v3.x, v3.z), up = P.gy > R.yb - 0.5, rmax = up ? R.bal1 - 1.2 : R.wall - 1.4; if (r > rmax) { v3.x *= rmax / r; v3.z *= rmax / r; } v3.y = Math.min(v3.y, R.yc - 0.7); if (!up && r > R.bal0 - 0.5) v3.y = Math.min(v3.y, R.yb - 1.0); if (St.lift && St.lift.ph === 'ride') { const rr3 = Math.hypot(v3.x, v3.z); if (rr3 > R.core - 0.8) { v3.x *= (R.core - 0.8) / rr3; v3.z *= (R.core - 0.8) / rr3; } } v3.y = Math.max(v3.y, (up ? R.yb : 0) + 0.5); }
      camPos.x = damp(camPos.x, v3.x, ck, dt); camPos.y = damp(camPos.y, v3.y, ck, dt); camPos.z = damp(camPos.z, v3.z, ck, dt);
      camLook.x = damp(camLook.x, tx, ck + 2, dt); camLook.y = damp(camLook.y, ty, ck + 2, dt); camLook.z = damp(camLook.z, tz, ck + 2, dt);
      if (St.snapCam) { camPos.copy(v3); camLook.set(tx, ty, tz); St.snapCam = false; }
    }
    const wantFov = portrait ? 66 : 58; if (!St.game && Math.abs(camera.fov - wantFov) > 0.05) { camera.fov = damp(camera.fov, wantFov, 5, dt); camera.updateProjectionMatrix(); }
    camera.position.copy(camPos); camera.lookAt(camLook);
    key.position.set(P.x + 12, P.gy + 30, P.z + 8); key.target.position.set(P.x, P.gy, P.z);
    if (St.toast) { St.toast.t += dt; if (St.toast.t > 2.6) St.toast = null; }
    if (St.note) { St.note.t += dt; if (St.note.t > 5) St.note = null; }
    hudT -= dt; if (hudT < 0) { hudT = 0.06; pushHud(); }
  }
  const QUESTS = [
    { title: 'Welcome aboard', text: "Walk the Main Ring to Quirk's Bar (north).", at: () => pol(97, 0) },
    { title: 'Up top', text: 'Take the glass lift in the hub up to the Balcony.', at: () => [0, 4] },
    { title: 'The view', text: "Find the Lookout on the Balcony, above Quirk's.", at: () => pol(96, SPOTS.lookout.th) },
    { title: 'Report to Ops', text: 'Take the lift to the top: OPERATIONS.', at: () => [0, 4] },
    { title: 'The Captain', text: "Meet Capt. Benny in the Captain's Office (Ops, north-east).", at: () => [OPS.desk.x, OPS.desk.z] },
    { title: 'Space Station 8', text: 'Explore the station. Interiors open one by one.', at: () => null },
  ];
  function pushHud() {
    const nn = St.phase === 'free' && !St.dialog && !St.prompt && !St.lift ? nearNpc() : null, dl = St.dialog && St.dialog.lines && St.dialog.lines[St.dialog.i];
    const items = Object.entries(save.data.items || {}).map(([id, n]) => ({ id, n, label: ITEM_LABELS[id] || id }));
    const Q = QUESTS[Math.min(St.quest, QUESTS.length - 1)];
    const d = St.dialog, dialog = d ? (d.choices && d.choices.length ? { name: d.npc.name, role: d.npc.role, text: null, choices: d.choices.map(c => ({ text: c.text, asked: !!c.asked, bye: !!c.bye })) } : dl ? { name: dl.name, role: dl.role, text: dl.text, you: !!dl.you, step: d.i + 1, total: d.lines.length } : null) : null;
    const hud = { phase: St.phase, place: PLACE[levelOf()] || levelOf(), quest: Q, talk: nn ? nn.name : nearHiring() ? 'the NOW HIRING sign' : (St.phase === 'free' && !St.dialog && !St.prompt && nearRobot()) ? 'the LOADER ROBOT' : null, dialog, prompt: St.prompt ? { title: St.prompt.title, body: St.prompt.body, buttons: St.prompt.buttons.map(b => b.label), off: St.prompt.buttons.map(b => b.off) } : null, toast: St.toast ? St.toast.text : null, note: St.note ? { title: St.note.title, sub: St.note.sub } : null, items, muted: St.muted, gold: save.data.gold, game: CON.hud() };
    const k = JSON.stringify(hud); if (k !== hudKey) { hudKey = k; onState(hud); }
  }
  function frame() { raf = requestAnimationFrame(frame); try { const fdt = Math.min(clock.getDelta(), 0.05); if (!St.paused) update(fdt); if (mini) drawMini(); } catch (e) { if (!frame.err) { frame.err = 1; window.__8G_ERR = String(e && e.stack || e); console.error('station update failed:', e && e.stack || e); } } renderer.render(scene, camera); }
  let mini = null;
  function drawMini() { const c = mini; if (!c.isConnected) return; const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr); if (!w || !h) return; if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const x = c.getContext('2d'); x.fillStyle = '#03040a'; x.fillRect(0, 0, w, h);
    if (St.inside) { const Q = ROOMS[St.inside].Q, k = Math.min(w, h) / (Q.hw * 2.3), X = wx => w / 2 + (wx - Q.OX) * k, Y = wz => h / 2 + wz * k; x.fillStyle = St.inside === 'bar' ? '#3a2414' : '#3a3a3c'; x.fillRect(X(Q.OX - Q.hw), Y(-Q.hd), Q.hw * 2 * k, Q.hd * 2 * k); x.fillStyle = '#e0a13c'; if (St.inside === 'bar') { x.fillRect(X(Q.OX - 11), Y(-8), 18 * k, 1.4 * k); x.beginPath(); x.arc(X(Q.OX + BAR.DT.x), Y(BAR.DT.z), 2.3 * k, 0, 7); x.fill(); } else if (Q.pad) { x.beginPath(); x.arc(X(Q.OX + Q.pad.x), Y(Q.pad.z), Q.pad.r * k, 0, 7); x.fill(); x.fillStyle = '#7dd3fc'; x.beginPath(); x.arc(X(Q.OX + Q.tele.x), Y(Q.tele.z), 1.8 * k, 0, 7); x.fill(); } arrow(x, X(P.x), Y(P.z), dpr); return; }
    if (P.gy > 20) { const k = Math.min(w, h) / 64, X = wx => w / 2 + wx * k, Y = wz => h / 2 + wz * k; x.fillStyle = '#2c3038'; x.beginPath(); x.arc(X(0), Y(0), OPS.r * k, 0, 7); x.fill(); x.fillStyle = '#7fe3ff'; x.beginPath(); x.arc(X(0), Y(0), R.core * k, 0, 7); x.fill(); x.fillStyle = '#3a3f48'; x.beginPath(); x.arc(X(OPS.table.x), Y(OPS.table.z), OPS.table.r * k, 0, 7); x.fill(); const O = OPS.office; x.strokeStyle = '#7fe3ff'; x.lineWidth = 2 * dpr; x.strokeRect(X(O.x0), Y(O.z0), (O.x1 - O.x0) * k, (O.z1 - O.z0) * k); x.fillStyle = '#e8c45a'; x.beginPath(); x.arc(X(OPS.shuttle.x), Y(OPS.shuttle.z), OPS.shuttle.r * k, 0, 7); x.fill(); x.fillStyle = '#7dd3fc'; x.beginPath(); x.arc(X(OPS.pad.x), Y(OPS.pad.z), OPS.pad.r * k, 0, 7); x.fill(); arrow(x, X(P.x), Y(P.z), dpr); return; }
    const k = Math.min(w, h) / 230, X = wx => w / 2 + wx * k, Y = wz => h / 2 + wz * k;
    x.strokeStyle = '#5c4e3e'; x.lineWidth = (R.wall - R.drop) * k; x.beginPath(); x.arc(X(0), Y(0), (R.wall + R.drop) / 2 * k, 0, 7); x.stroke();
    x.strokeStyle = '#3c4048'; x.lineWidth = (R.hub - R.core) * k; x.beginPath(); x.arc(X(0), Y(0), (R.hub + R.core) / 2 * k, 0, 7); x.stroke();
    x.strokeStyle = '#4a4e56'; x.lineWidth = 5 * k; for (const a of SPOKES) { const [a0, b0] = pol(R.hub, a), [a1, b1] = pol(R.drop, a); x.beginPath(); x.moveTo(X(a0), Y(b0)); x.lineTo(X(a1), Y(b1)); x.stroke(); }
    for (const s of SHOPS) { const [sx, sz] = pol(R.wall - 3, s.th); x.fillStyle = s.trim; x.fillRect(X(sx) - 3 * dpr, Y(sz) - 3 * dpr, 6 * dpr, 6 * dpr); }
    for (const kk of KIOSKS) { const [sx, sz] = pol(R.kiosk, kk.th); x.fillStyle = kk.trim; x.fillRect(X(sx) - 2.5 * dpr, Y(sz) - 2.5 * dpr, 5 * dpr, 5 * dpr); }
    x.fillStyle = '#7fe3ff'; x.beginPath(); x.arc(X(0), Y(0), R.core * k, 0, 7); x.fill();
    const Q = QUESTS[Math.min(St.quest, QUESTS.length - 1)].at(); if (Q) { x.fillStyle = '#ffd23a'; x.beginPath(); x.arc(X(Q[0]), Y(Q[1]), 5 * dpr, 0, 7); x.fill(); }
    for (const p of party) { x.fillStyle = '#38bdf8'; x.beginPath(); x.arc(X(p.c.position.x), Y(p.c.position.z), 3 * dpr, 0, 7); x.fill(); }
    arrow(x, X(P.x), Y(P.z), dpr); }
  function arrow(x, px, py, dpr) { x.save(); x.translate(px, py); x.rotate(Math.PI - P.face); x.fillStyle = '#ffd23a'; x.strokeStyle = '#000'; x.lineWidth = 1.5 * dpr; const s = 8 * dpr; x.beginPath(); x.moveTo(0, -s); x.lineTo(s * 0.75, s * 0.8); x.lineTo(0, s * 0.4); x.lineTo(-s * 0.75, s * 0.8); x.closePath(); x.fill(); x.stroke(); x.restore(); }
  try { const c = JSON.parse(localStorage.getItem('dsf.cam.v1') || 'null'); if (c && c.dist) { St.dist = clamp(c.dist, 4.5, 18); St.pitch = clamp(c.pitch, 0.04, 1.1); } } catch (e) {}
  [fox, hope, noble].forEach(c => { c.visible = false; });
  const api = window.__8G_GAME = {
    setStick(x, y) { input.jx = x; input.jy = y; },
    setHudPad(on) { St.hudPad = !!on; if (on) { input.jx = input.jy = 0; JOY.fixed = false; joyBase.style.display = joyKnob.style.display = 'none'; } },
    setPaused(on) { St.paused = !!on; if (on) { input.jx = input.jy = 0; keys.clear(); } },
    nextLine() { api.advance(); },
    closeDialog() { if (!St.dialog) return; St.dialog = null; },
    choose(i) { const d = St.dialog; if (!d || !d.choices) return; const c = d.choices[i]; if (!c) return; const n = d.npc; audio.blip && audio.blip();
      if (c.bye) { St.dialog = null; return; }
      if (c.work && n.key === 'quirk') { say(n, [{ who: 'npc', text: 'Apron on, STEWARD. The customers tip in gold. I keep most of it.' }], () => playGame(QBAR)); return; }
      if (c.work && n.key === 'dabaHost') { say(n, [{ who: 'npc', text: 'Take a seat, STEWARD. Your gold, my wheel.' }], () => playGame(DABA)); return; }
      if (c.work && n.key === 'vedek') { say(n, [{ who: 'npc', text: 'The ember is warm. Go gently, STEWARD.' }], () => playGame(SHR)); return; }
      if (c.work && n.key === 'garok') { say(n, [{ who: 'npc', text: 'Splendid! The shears are sharp, STEWARD. So am I.' }], () => playGame(TLR)); return; }
      if (c.work && n.key === 'bashad') { say(n, [{ who: 'npc', text: 'Steady paws, STEWARD. The table is yours.' }], () => playGame(BONE)); return; }
      if (c.work) { say(n, [{ who: 'npc', text: WORK[n.key] || 'No shifts today. Come back soon.' }], () => { St.dialog = { npc: n, i: 0, lines: [], choices: [] }; offerTopics(n); }); return; }
      n.asked.add(c.topic); const tp = n.topics[c.topic]; say(n, tp.replies || [], () => { if (tp.act) { tp.act(); return; } St.dialog = { npc: n, i: 0, lines: [], choices: [] }; offerTopics(n); }); },
    clearToast() { St.toast = null; }, closeWheel() {}, skipTime() {}, cycleWeather() {},
    padPress(k, d) { if (CON.on && CON.game && CON.game.padPress) CON.game.padPress(k, d); }, padStick(x, y) { if (CON.on && CON.game && CON.game.padStick) CON.game.padStick(x, y); },
    melee() { api.action(1); }, meleeUp() {}, range() { api.action(2); },
    eyeLook(dx, dy) { if (!St.eye0) St.eye0 = { yaw: St.yaw, pitch: St.pitch }; St.dragT = 99; St.yaw -= dx * 0.008; St.pitch = clamp(St.pitch + dy * 0.0064, 0.04, 1.1); },
    eyeRelease() { if (St.eye0) { St.yaw = St.eye0.yaw; St.pitch = St.eye0.pitch; St.eye0 = null; } St.dragT = 0; },
    togglePov() { return false; },
    lookBy(dx, dy) { St.dragT = 1.4; St.yaw -= dx * 0.006; St.pitch = clamp(St.pitch + dy * 0.0048, 0.04, 1.1); },
    zoomBy(f) { St.dist = clamp(St.dist * f, 4.5, 18); },
    getCam() { return { dist: St.dist, pitch: St.pitch }; },
    setCam(d, p, lock) { if (d != null) St.dist = clamp(d, 4.5, 18); if (p != null) St.pitch = clamp(p, 0.04, 1.1); if (lock) { St.dragT = 0; try { localStorage.setItem('dsf.cam.v1', JSON.stringify({ dist: St.dist, pitch: St.pitch })); } catch (e) {} } },
    mapData() { const Q = QUESTS[Math.min(St.quest, QUESTS.length - 1)].at(); return { p: [P.x, P.z, P.face], indoor: !!St.inside, b: [...SHOPS.map(s => { const [x, z] = pol(R.wall - 2, s.th); return [s.name, x, z]; }), ...KIOSKS.map(k => { const [x, z] = pol(R.kiosk, k.th); return [k.name, x, z]; }), ['Lift', 0, 0], ['Transporter', ST.PAD.x, ST.PAD.z]], f: party.map(p => [p.c.position.x, p.c.position.z]), e: [], q: Q ? [Q[0], Q[1], QUESTS[Math.min(St.quest, QUESTS.length - 1)].title] : null }; },
    setMinimap(c) { mini = c || null; },
    start() { if (St.phase !== 'start') return; audio.init(); audio.setMuted(St.muted); St.phase = 'free'; [fox, hope, noble].forEach(c => { c.visible = true; });
      let back = null; try { back = sessionStorage.getItem('dsf.arrive'); sessionStorage.removeItem('dsf.arrive'); } catch (e) {}
      // s385 Space Map: docking at KUFA STATION (Kufa's own station) opens this page with ?at=kufa → you step off at Berth 2
      try { if (new URLSearchParams(location.search).get('at') === 'jidda') { setTimeout(() => { enterRoom('jids', { x: JI.enter.x, z: JI.enter.z }); setTimeout(() => toast('Docked at JIDDA STATION, Berth Eight.'), 900); }, 50); } } catch (e) {}
      try { if (new URLSearchParams(location.search).get('at') === 'nebo') { setTimeout(() => { enterRoom('nebs', { x: NE.enter.x, z: NE.enter.z }); setTimeout(() => toast('Docked at NEBO STATION, Berth Seven.'), 900); }, 50); } } catch (e) {}
      try { if (new URLSearchParams(location.search).get('at') === 'zion') { setTimeout(() => { enterRoom('zios', { x: ZI.enter.x, z: ZI.enter.z }); setTimeout(() => toast('Docked at ZION STATION, Berth Six.'), 900); }, 50); } } catch (e) {}
      try { if (new URLSearchParams(location.search).get('at') === 'gaya') { setTimeout(() => { enterRoom('gays', { x: GA.enter.x, z: GA.enter.z }); setTimeout(() => toast('Docked at GAYA STATION, Berth Five.'), 900); }, 50); } } catch (e) {}
      try { if (new URLSearchParams(location.search).get('at') === 'ur') { setTimeout(() => { enterRoom('urs', { x: UR.enter.x, z: UR.enter.z }); setTimeout(() => toast('Docked at UR STATION, Berth Four.'), 900); }, 50); } } catch (e) {}
      try { if (new URLSearchParams(location.search).get('at') === 'shasta') { setTimeout(() => { enterRoom('shas', { x: SH.enter.x, z: SH.enter.z }); setTimeout(() => toast('Docked at SHASTA STATION, Berth Three.'), 900); }, 50); } } catch (e) {}
      try { if (new URLSearchParams(location.search).get('at') === 'luxor') { setTimeout(() => { enterRoom('luxs', { x: LX.enter.x, z: LX.enter.z }); setTimeout(() => toast('Docked at LUXOR STATION, Berth One.'), 900); }, 50); } } catch (e) {}
      try { if (new URLSearchParams(location.search).get('at') === 'kufa') { setTimeout(() => { enterRoom('kufa', { x: KU_AT.arrive[0], z: KU_AT.arrive[1] }); setTimeout(() => toast('Docked at KUFA STATION, Berth 2.'), 900); }, 50); } } catch (e) {}
      if (back === 'engineHatch') { St.inside = 'engine'; P.x = EB.OX + EB.hatch.x + 2.2; P.z = EB.hatch.z + 1.2; P.gy = 0; P.face = 0; St.yaw = Math.PI; St.snapCam = true; resetTrail(); placeParty(); save.where('dsf', 'dsfEngineering'); St.locks.hatch = true;
        setTimeout(() => note('ENGINEERING', save.flag('oreBossDone') && !save.flag('oreReported') ? 'You climb out of the Ore Shaft. Tell Chief O\u2019Brain what you found.' : 'You climb out of the Ore Shaft.'), 500); return; } P.x = ST.PAD.x; P.z = ST.PAD.z + 0.2; P.face = Math.PI; St.yaw = 0; St.snapCam = true; resetTrail(); placeParty();
      St.beam = { t: 0, life: 1.6, done: () => { if (!/[?&]at=/.test(location.search)) note('SPACE STATION 8', 'Deep Space Fox, in orbit above Meru. The main station of the eight worlds.'); } }; fox.scale.setScalar(0.001); audio.tone(330, 1.4, 0.05, 'sine', 2); save.where('dsf', 'dsfPromenade'); St.locks.pad = true; },
    gamePick(i) { audio.blip && audio.blip(); CON.pick(i); },
    gameLeave() { CON.close(); },
    promptPick(i) { const p = St.prompt; if (!p) return; const b = p.buttons[i]; if (!b || b.off) return; St.prompt = null; audio.blip && audio.blip(); b.act && b.act(); },
    advance() { const d = St.dialog; if (!d || d.choices) return; d.i++; audio.blip && audio.blip(); if (d.i >= d.lines.length) { St.dialog = null; d.then && d.then(); } },
    talk() { if (St.dialog) { api.advance(); return; } if (St.phase !== 'free' || St.prompt || St.lift) return; const n = nearNpc(); if (n) { talkTo(n); return; } if (nearHiring() && St.inside === 'bar') { prompt('NOW HIRING', 'Bar shift \u00b7 Quirk', [['YES, PUT ME TO WORK!', () => playGame(QBAR)], ['NOT NOW', null]]); return; } if (nearHiring() && St.inside === 'temple') { prompt('NOW HIRING', 'Shrine Candles \u00b7 Keeper Opa', [['YES, PUT ME TO WORK!', () => playGame(SHR)], ['NOT NOW', null]]); return; } if (nearHiring() && St.inside === 'tailor') { prompt('NOW HIRING', 'Foxy Tailors \u00b7 Garok', [['YES, PUT ME TO WORK!', () => playGame(TLR)], ['NOT NOW', null]]); return; } if (nearHiring() && St.inside === 'infirm') { prompt('NOW HIRING', 'Bone Set \u00b7 Dr. Bashad', [['YES, PUT ME TO WORK!', () => playGame(BONE)], ['NOT NOW', null]]); return; } if (nearHiring()) { const Q = ROOMS[St.inside].Q; say({ name: 'NOW HIRING', role: PLACE[St.inside].split(' · ')[1], x: Q.OX + Q.hiring.x, z: Q.hiring.z }, [{ who: 'npc', text: ROOMS[St.inside].hire }]); return; }
      const rb = nearRobot(); if (rb) { audio.tone(110, 0.3, 0.05, 'square', 0.5); say(rb, ROBOT_LINES[rb.i], () => { if (!save.flag('dsfLoadersHeard')) { save.setFlag('dsfLoadersHeard'); note('THE LOADERS', 'Something is speaking through the Machine Fleet. Not their own voice.'); } }); } },
    action(n) { if (n === 1 || n === 2) toast('Weapons stay holstered on the promenade.'); if (n === 3) input.jump = true; },
    jump() { input.jump = true; },
    useItem(id) { if (KIO.use(id, X())) return; toast((ITEM_LABELS[id] || id) + ': nothing to use it on here.'); },
    toggleSound() { St.muted = !St.muted; audio.init(); audio.setMuted(St.muted); },
    setOptions(o) { if (o.outlines != null) outlineMat.visible = !!o.outlines; if (o.followCam != null) opts.followCam = !!o.followCam; },
    setJoy(b) { if (St.hudPad) b = false; if (JOY.fixed === !!b) return; JOY.fixed = !!b; resetJoy(); },
    _dbg() { return { St, P, scene, camera, ENG, NPC, CON, DOCK, SCAN, COND, BONE, DABA, SHR, QBAR, TLR, FIT, playGame, step(n = 30, dt = 1 / 30) { for (let i = 0; i < n; i++) update(dt); renderer.render(scene, camera); }, warp(w, at) { if (ROOMS[w] && w !== 'kufa' && w !== 'ship') { const Q = ROOMS[w].Q, p = at || Q.enter; St.inside = w; P.x = Q.OX + p.x; P.z = p.z; P.gy = 0; St.snapCam = true; return; } if (w === 'kufa') { St.inside = 'kufa'; P.x = KU.OX + KU_AT.arrive[0]; P.z = KU_AT.arrive[1]; P.gy = 0; return; } if (w === 'vole') { St.inside = 'ship'; P.x = VB.OX + VB.helm.x; P.z = VB.helm.z + 1.4; P.gy = 0; return; } const p = { bar: pol(92, 0), lift: [0, 7.5], balcony: pol(98, 15), cargo: pol(92, 180), temple: pol(92, 135), lookout: pol(96, 22.5), ops: [0, 8], office: [OPS.office.x0 + 2, OPS.office.doorZ], qa: pol(7.4, 180), qb: pol(7.4, 180), cabin: pol(14, 225) }[w]; if (p) { P.x = p[0]; P.z = p[1]; P.gy = w === 'balcony' || w === 'lookout' ? R.yb : w === 'ops' || w === 'office' ? OPS.y : w === 'qa' || w === 'cabin' ? -14 : w === 'qb' ? -28 : 0; resetTrail(); placeParty(); St.snapCam = true; } }, gate() { space.openGate(); } }; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur); try { audio.dispose && audio.dispose(); } catch (e) {} renderer.dispose(); el.remove(); joyBase.remove(); joyKnob.remove(); fade.remove(); },
  };
  frame();
  return api;
}
