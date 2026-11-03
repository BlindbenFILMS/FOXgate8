// GEMS (s608, GEM_PLAN.md approved: world gem +2 %, any gem +1 %, charm +3 %, crest +5 %, full set +2 %).
// Every armour piece + weapon has 2 slots: WORLD (that world's gem only) + ANY (any power-up gem). Gems are never sold, never shown on the fox.
// Gems DO have a 3D model (makeGem) for when they lie in the world before you pick them up.
// Ben's per-piece edits (Gem Workshop) → localStorage 'gems.tune.v1'. The player's gems + what sits where → save stats (gemsOwned, gemKit).
export const STATS = {
  maxhp: ['MAX HP', 'flat'], armor: ['ARMOUR'], melee: ['MELEE'], ranged: ['RANGED'], super: ['SUPER CHARGE'], tough: ['TOUGH'],
  speed: ['SPEED'], jump: ['JUMP'], swim: ['SWIM / VEHICLE'], pilot: ['PILOT'],
  gold: ['GOLD'], xp: ['XP'], energy: ['ENERGY'], heal: ['HEALING'], luck: ['LUCK'], sense: ['SENSE'],
  barter: ['BARTER'], talk: ['TALK'], friend: ['FRIENDSHIP'], craft: ['CRAFT'], fish: ['FISHING'], farm: ['FARMING'],
  stealth: ['STEALTH'], steal: ['STEAL'] };
// stats that stack into one effect (GEM_PLAN "pairs"): prices get BARTER + TALK, etc.
export const PAIRS = [['PRICES', ['barter', 'talk']], ['LOOT', ['luck', 'sense']], ['FRONT LINE', ['melee', 'tough', 'armor']], ['SHARPSHOOTER', ['ranged', 'super']],
  ['SNEAK', ['stealth', 'steal']], ['OUTDOORS', ['fish', 'farm']], ['TRAVEL', ['speed', 'jump', 'swim']], ['FRIENDS', ['talk', 'friend']], ['SPACE', ['pilot', 'energy']]];
export const PIECES = [['helmet', 'HELMET'], ['chest', 'CHEST PLATE'], ['shoulders', 'SHOULDERS'], ['gloves', 'GAUNTLETS'], ['boots', 'BOOTS'], ['melee', 'MELEE WEAPON'], ['ranged', 'RANGED WEAPON']];
export const ARMOR_PIECES = ['helmet', 'chest', 'shoulders', 'gloves', 'boots'];
const W = (helmet, chest, shoulders, gloves, boots, melee, ranged) => ({ helmet, chest, shoulders, gloves, boots, melee, ranged });
// one gem per world; per = the stat it gives in each piece (+2 % each)
export const WORLD_GEMS = {
  player: { id: 'playerGem', name: 'PLAYER GEM', world: 'player', col: '#e8742a', per: W('craft', 'maxhp', 'friend', 'farm', 'speed', 'melee', 'ranged') },
  meru: { id: 'meruGem', name: 'MERU GEM', world: 'meru', col: '#2f5fd0', per: W('xp', 'armor', 'melee', 'ranged', 'speed', 'melee', 'ranged') },
  gaya: { id: 'gayaGem', name: 'GAYA GEM', world: 'gaya', col: '#7ad1f0', per: W('energy', 'heal', 'super', 'talk', 'speed', 'melee', 'super') },   // s608: live blue crystal from the mountain vein; calm + focus
  jidda: { id: 'jiddaGem', name: 'JIDDA GEM', world: 'jidda', col: '#2ad4d0', per: W('sense', 'armor', 'swim', 'fish', 'swim', 'melee', 'ranged') },   // s608: lagoon sea-glass; the sea, surf, fishing
  kufa: { id: 'kufaGem', name: 'KUFA GEM', world: 'kufa', col: '#2ab0c8', per: W('sense', 'tough', 'stealth', 'steal', 'stealth', 'melee', 'ranged') },   // s608: oasis turquoise; caravans + the spy station (SENSE / STEALTH / STEAL)
  luxor: { id: 'luxorGem', name: 'LUXOR GEM', world: 'luxor', col: '#ff6a2a', per: W('luck', 'armor', 'gold', 'tough', 'speed', 'melee', 'luck') },   // s608: ember orange; treasure (the Pyramid) + the fighting pit
  nebo: { id: 'neboGem', name: 'NEBO GEM', world: 'nebo', col: '#f2c84a', per: W('xp', 'energy', 'jump', 'ranged', 'jump', 'speed', 'ranged') },   // s608: honey amber; the giant tree, the glider, the canopy
  ur: { id: 'urGem', name: 'UR GEM', world: 'ur', col: '#3a6fd0', per: W('friend', 'maxhp', 'tough', 'farm', 'speed', 'melee', 'ranged') },   // s608: lapis blue; animals (the zoo, the beast run, the clean lake)
  zion: { id: 'zionGem', name: 'ZION GEM', world: 'zion', col: '#ffc21a', per: W('gold', 'armor', 'swim', 'craft', 'swim', 'melee', 'ranged') },   // s608: river gold; gold panning + monster trucks (SWIM / VEHICLE)
  shasta: { id: 'shastaGem', name: 'SHASTA GEM', world: 'shasta', col: '#bfe8ff', per: W('maxhp', 'tough', 'armor', 'melee', 'jump', 'tough', 'ranged') },   // s608: glacier ice; snow + mountains
  earth: { id: 'earthGem', name: 'EARTH GEM', world: 'earth', col: '#ff3fa8', earthOnly: true, per: W('luck', 'armor', 'talk', 'melee', 'speed', 'melee', 'ranged') },   // s608: neon pink; the Strip (casino LUCK, showman TALK, the fight)
  kyoto: { id: 'kyotoGem', name: 'KYOTO GEM', world: 'kyoto', col: '#e0405e', kyotoOnly: true, per: W('sense', 'tough', 'melee', 'ranged', 'stealth', 'melee', 'ranged') },   // s608: cherry red; STAYS IN KYOTO with the human (sumo) armour
  dsf: { id: 'dsfGem', name: 'DEEP SPACE GEM', world: 'dsf', col: '#7df9ff', per: W('pilot', 'energy', 'super', 'ranged', 'speed', 'melee', 'pilot') } };   // s608: station cyan; the DSF duty suit + the EVA suit
// ANY-slot power-up gems: [id, name, stat, value, colour, where]
export const ANY_GEMS = [
  ['heartGem', 'HEART GEM', 'maxhp', 10, '#ec3013', 'The Welcome Fox, Player Planet community center, after your first task. The first gem in the game.'],
  ['shieldGem', 'SHIELD GEM', 'armor', 1, '#94a3b8', 'A Meru Arena round prize'],
  ['edgeGem', 'EDGE GEM', 'melee', 1, '#ff6a4f', 'Kyoto duel'], ['sightGem', 'SIGHT GEM', 'ranged', 1, '#38bdf8', 'Kyoto archery'],
  ['windGem', 'WIND GEM', 'speed', 1, '#c8f0ff', 'Nebo glider'], ['springGem', 'SPRING GEM', 'jump', 1, '#a3e635', 'Shasta climb'],
  ['sparkGem', 'SPARK GEM', 'energy', 1, '#facc15', 'Deep Space Fox'], ['coinGem', 'COIN GEM', 'gold', 1, '#e6b45a', 'Zion gold panning'],
  ['sageGem', 'SAGE GEM', 'xp', 1, '#c084fc', 'Gaya'], ['mendGem', 'MEND GEM', 'heal', 1, '#4fb06e', 'Meru hospital job master'],
  ['cloverGem', 'CLOVER GEM', 'luck', 1, '#22c55e', 'Hidden in the Luxor dig'], ['silverGem', 'SILVER GEM', 'barter', 1, '#e5e7eb', 'Player Planet market'],
  ['voiceGem', 'VOICE GEM', 'talk', 1, '#f472b6', 'Player Planet town hall'], ['shadowGem', 'SHADOW GEM', 'stealth', 1, '#3b3a5a', 'Kufa'],
  ['gearGem', 'GEAR GEM', 'friend', 1, '#2dd4bf', 'Machine Fleet: a freed robot\u2019s gift']];
// MERU GEM: 5 in the world, one per place (Ben). The 2 wild spots get placed in Map Workshop later.
export const MERU_GEM_PLACES = ['Meru Arena · beat the Iron Warden', 'Castle quest from King Might', 'Wild spot 1 (Map Workshop, later)', 'Wild spot 2 (Map Workshop, later)', 'Hidden in the Ruins'];
// LUXOR GEM: 5 in the world (proposal from the brief's big moments; Ben can move them)
export const LUXOR_GEM_PLACES = ['Fighting Pit · beat Lyra for the IRON BELT', 'Volcano Run · win the 3-lap bike race', 'Volcano Cave · the prize chamber', 'Pyramid Dig · the Second Chamber', 'The Furnace · hold the core for 30 seconds'];
// GAYA GEM: 5 in the world (proposal from the brief's big moments)
export const GAYA_GEM_PLACES = ['The Millstone · hold the landing', 'Mountain Cave · beat THE PAINTED GIANT', 'The Gaya Open · win the GOLDEN RACKET', 'Meditation Canyon · look through the GLASS', 'The Bathhouse · the GREAT POOL (sacred bath)'];
// UR GEM: 5 in the world (proposal from the brief; the Zoo moved to Ur, the Pyramid to Luxor)
export const UR_GEM_PLACES = ['The Gauntlet · hold the transport pad', 'Hunters Pond · beat SPECIMEN ONE', 'Toxic Lake · clean it with the SKIMMER', 'Hessa\u2019s Menagerie · the zoo keeper\u2019s thanks', 'The Lab Vault · free cage four'];
// ZION GEM: 5 in the world (proposal from the brief)
export const ZION_GEM_PLACES = ['Gold River · the Deep Bend pan, after Zada caps the derrick', 'Monster Arena · beat THE CRUSHER', 'Gang Hideout · beat RATCHET', 'Blackout · hold the core for 30 seconds', 'Gold River · all 3 panning spots done'];
// NEBO GEM: 5 in the world (proposal from the brief)
export const NEBO_GEM_PLACES = ['The Hive · hold the transport pad', 'The Climb · beat the HIVE QUEEN', 'Deep Woods · beat THE DEADFALL', 'The Wick Fort · free ROOKE from the cage', 'Tree Top · the glider run'];
export const GEM_PLACES = { meruGem: MERU_GEM_PLACES, luxorGem: LUXOR_GEM_PLACES, gayaGem: GAYA_GEM_PLACES, urGem: UR_GEM_PLACES, zionGem: ZION_GEM_PLACES, neboGem: NEBO_GEM_PLACES, earthGem: ['The Casino · the high-roller table', 'The Film Lot · finish the shoot', 'The Speedway · win the race', 'The Mob · settle the score', 'The Desert Gate · open the sealed gate'], kyotoGem: ['The Dohyo · win the sumo bout', 'Mountain Road · the archery range (all targets)', 'The Hideout · beat the men in black', 'Kyoto Castle · stop the plot', 'The Teahouse · the tea + go masters'], dsfGem: ['The Ore Shaft · free R-8', 'The Hull · the first spacewalk', 'Ops · fix the anomaly', 'Cargo Bay Four · Jack + Nag\u2019s secret', 'The Docking Ring · clear the pylons'], jiddaGem: ['The Sink · put down all 4 gates', 'The Mole Shaft · beat THE DRAIN SERPENT', 'Pirate Hideout · beat the CORSAIR CAPTAIN', 'Jidda Surf Contest · win THE BREAK', 'The Shoals · the reach hoard dig site'], shastaGem: ['The Glass · hold the transport core', 'Glow-Worm Grotto · settle THE FED ONE', 'The Snow Fort · beat THE SNOW KING', 'The Slopes · all 3 slalom runs', 'The Rink · beat IRON EIGHT'], kufaGem: ['The Convoy · hold the transport pad', 'Kufa Stadium · beat THE CISTERN WYRM', 'Caravan Road, Far Leg · break THE SIPHON', 'Station 9 · cross the laser halls unseen', 'The Berth · stop THE PLATED COAT'] };
export const WORLD_VAL = 2, SET_BONUS = { meru: ['armor', 2], luxor: ['tough', 2], gaya: ['energy', 2], ur: ['friend', 2], zion: ['swim', 2], nebo: ['jump', 2], kufa: ['stealth', 2], shasta: ['maxhp', 10], jidda: ['swim', 2], kyoto: ['melee', 2], earth: ['luck', 2], dsf: ['pilot', 2] };
const TUNE = 'gems.tune.v1';
export function loadTune() { try { return JSON.parse(localStorage.getItem(TUNE) || '{}') || {}; } catch (e) { return {}; } }
export function saveTune(t) { try { localStorage.setItem(TUNE, JSON.stringify(t)); } catch (e) {} }
// every gem by id, with Ben's tune laid over
export function allGems() { const t = loadTune(), out = {};
  for (const g of Object.values(WORLD_GEMS)) { const o = t[g.id] || {}; out[g.id] = { ...g, kind: 'world', name: o.name || g.name, per: { ...g.per, ...(o.per || {}) }, val: o.val ?? WORLD_VAL }; }
  for (const [id, name, stat, val, col, where] of ANY_GEMS) { const o = t[id] || {}; out[id] = { id, kind: 'any', name: o.name || name, stat: o.stat || stat, val: o.val ?? val, col, where }; }
  return out; }
export const fmt = (stat, v) => (v >= 0 ? '+' : '') + v + (STATS[stat] && STATS[stat][1] === 'flat' ? ' ' : ' % ') + (STATS[stat] ? STATS[stat][0] : stat);
// what one gem gives in one piece
export function gemBonus(g, piece) { if (!g) return null; return g.kind === 'world' ? [g.per[piece], g.val] : [g.stat, g.val]; }
// add up a kit: slots = { helmet: { world: id|null, any: id|null }, ... }, extras = [[stat, v], ...] (charms, crest, set bonus)
export function totals(slots, extras = []) { const G = allGems(), sum = {};
  for (const [piece, s] of Object.entries(slots || {})) for (const k of ['world', 'any']) { const b = gemBonus(G[s && s[k]], piece); if (b && b[0]) sum[b[0]] = (sum[b[0]] || 0) + b[1]; }
  for (const [st, v] of extras) sum[st] = (sum[st] || 0) + v;
  return sum; }
// ---------- the 3D gem (for the world, never on the fox) ----------
// world gems = a round brilliant cut; any gems = a smaller step cut; the HEART GEM is a heart
export function makeGem({ THREE, toon, M }, g, size = 1) {
  const root = new THREE.Group(), col = new THREE.Color(g.col);
  const mat = new THREE.MeshToonMaterial({ color: col, emissive: col.clone().multiplyScalar(0.55), flatShading: true, transparent: true, opacity: 0.94, gradientMap: toon && toon('#ffffff').gradientMap });
  let geo;
  if (g.id === 'heartGem') { const s = new THREE.Shape(); s.moveTo(0, -0.3); s.bezierCurveTo(-0.12, -0.18, -0.36, -0.02, -0.36, 0.14); s.bezierCurveTo(-0.36, 0.3, -0.18, 0.36, -0.09, 0.32); s.bezierCurveTo(-0.03, 0.29, 0, 0.24, 0, 0.2); s.bezierCurveTo(0, 0.24, 0.03, 0.29, 0.09, 0.32); s.bezierCurveTo(0.18, 0.36, 0.36, 0.3, 0.36, 0.14); s.bezierCurveTo(0.36, -0.02, 0.12, -0.18, 0, -0.3);
    geo = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.025, bevelSegments: 1, curveSegments: 8 }); geo.center(); }
  else if (g.kind === 'world') geo = new THREE.LatheGeometry([[0, -0.32], [0.3, 0.02], [0.27, 0.1], [0.16, 0.17], [0, 0.17]].map(([x, y]) => new THREE.Vector2(x, y)), 8);
  else geo = new THREE.LatheGeometry([[0, -0.22], [0.2, -0.04], [0.2, 0.04], [0.12, 0.14], [0, 0.14]].map(([x, y]) => new THREE.Vector2(x, y)), 6);
  const gem = M ? M(geo, mat, 0, 0, 0, root, 0.02) : (() => { const m = new THREE.Mesh(geo, mat); root.add(m); return m; })();
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.28, depthWrite: false }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = -0.55; root.add(glow);
  const spark = new THREE.Mesh(new THREE.OctahedronGeometry(0.035, 0), new THREE.MeshBasicMaterial({ color: '#ffffff' })); root.add(spark);
  root.scale.setScalar(size); root.userData.gem = { gem, glow, spark, t: Math.random() * 6 };
  return root; }
// bob + turn + a twinkle that runs over the facets: call each frame
export function tickGem(root, dt) { const u = root.userData.gem; if (!u) return; u.t += dt;
  u.gem.rotation.y += dt * 1.1; u.gem.position.y = Math.sin(u.t * 2) * 0.05; u.glow.material.opacity = 0.2 + Math.sin(u.t * 2) * 0.08;
  const a = u.t * 1.7; u.spark.position.set(Math.cos(a) * 0.16, 0.12 + u.gem.position.y, Math.sin(a) * 0.16); u.spark.scale.setScalar(0.6 + Math.max(0, Math.sin(u.t * 5)) * 1.2); }
