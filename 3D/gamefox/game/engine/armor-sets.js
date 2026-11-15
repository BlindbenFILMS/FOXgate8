// ARMOR SETS (s608, Armor Workshop.dc.html): every armour set the player, Hope and Noble can wear.
// A set = the base armour colours (torso, rebuilt into the fox) + add-on parts strapped onto the fox's own groups so they move with it.
// Ben's edits are saved live in localStorage 'armor.sets.v1'; every page reads loadArmorSets(). Never delete a built-in id.
import { dressMantis, dressBee, dressFly, dressLizard, dressEagle, dressBear, dressGorilla, dressAlien, trimCuffs, SPECIES_PARTS } from './species-armor.js?v=s738b';
import { crestCanvas, crestURL } from './armor-crests.js?v=s730';
export { crestURL };
export { SPECIES_PARTS };
export const ARMOR_KEY = 'armor.sets.v1';
export const PARTS = [
  ['chest', 'CHEST PLATE'], ['shoulders', 'SHOULDERS'], ['helmet', 'HELMET'], ['gloves', 'GAUNTLETS'],
  ['belt', 'BELT'], ['boots', 'BOOTS'], ['cape', 'CAPE'], ['crest', 'CREST ON THE CHEST']];
const P0 = (on, col, s = 1) => ({ on, col, s, y: 0, z: 0 });
// s608 part STYLES: the same part can be built a different way (p.style). First = the default.
export const STYLES = { helmet: [['helm', 'HELMET'], ['circlet', 'CRYSTAL CIRCLET'], ['cone', 'CONE HELM'], ['miner', 'HARD HAT + LAMP'], ['ranger', 'LEAF HAT'], ['wrap', 'DESERT WRAP'], ['furhood', 'FUR HOOD + GOGGLES'], ['shell', 'SHELL HELM'], ['eva', 'EVA BUBBLE HELMET'], ['fishbowl', 'FISHBOWL DIVE HELMET']], shoulders: [['pauldron', 'PAULDRONS'], ['mantle', 'MANTLE'], ['scales', 'SCALE CAPS'], ['pads', 'TYRE PADS'], ['leaves', 'LEAF PAULDRONS'], ['brass', 'BRASS DISCS'], ['furcollar', 'FUR COLLAR'], ['rope', 'ROPE + SHELL'], ['evapack', 'LIFE-SUPPORT PACK'], ['scuba', 'TWIN AIR TANKS']], chest: [['plate', 'PLATE'], ['tabard', 'TABARD'], ['lamellar', 'LAMELLAR'], ['bib', 'COVERALL BIB'], ['bark', 'BARK MAIL'], ['brigandine', 'BRIGANDINE'], ['parka', 'QUILTED PARKA'], ['sash', 'SEA SASH'], ['evachest', 'EVA CHEST UNIT'], ['wetsuit', 'WETSUIT']] };
export const fullHelm = set => !!set.parts.helmet.on;   // both helmet styles cover the head top now (s608: the circlet got a cap)
export const ARMOR_DEFAULTS = {
  a8: { id: 'a8', name: '8 ARMOUR', from: 'Worn by Ben, Hope and Noble', world: 'player', armor: 20, kg: 8, torso: ['#ffffff', '#e7edf4', '#6b7d93'],
    parts: { chest: P0(false, '#ffffff'), shoulders: P0(false, '#e7edf4'), helmet: P0(false, '#ffffff'), gloves: P0(false, '#6b7d93'), belt: P0(false, '#6b7d93'), boots: P0(false, '#6b7d93'), cape: P0(false, '#ec3013'), crest: P0(true, '#ffffff') } },
  reinf: { id: 'reinf', name: 'REINFORCED ARMOR', from: 'Heavy plate · Bram, Meru Armory', world: 'meru', armor: 40, kg: 18, torso: ['#eeeff2', '#a3cdff', '#3a434f'],   // s608 Ben's colours + fit
    parts: { chest: { on: true, col: '#81afe4', s: 1.1, y: 0.2, z: 0.01 }, shoulders: { on: true, col: '#4698fb', s: 1.35, y: 0, z: 0 }, helmet: { on: true, col: '#87b7ee', s: 1, y: 0, z: 0 }, gloves: { on: true, col: '#428fec', s: 1.4, y: 0.08, z: 0 }, belt: P0(false, '#83b2e7'), boots: { on: true, col: '#4391f0', s: 1.2, y: 0, z: 0 }, cape: P0(false, '#3a434f'), crest: P0(true, '#ffffff') } },
  // s608 MERU ROYAL ARMOR (Ben, his fit saved): navy + gold, bought piece by piece (10-40 G) at Bram's Armory + the Castle Barracks; full set = +2 % ARMOUR
  meru: { id: 'meru', name: 'MERU ROYAL ARMOR', from: 'Bram, Meru Armory · Castle Barracks', world: 'meru', armor: 30, kg: 12, torso: ['#2f3f7a', '#1f2a5c', '#121838'],
    price: { helmet: 25, chest: 40, shoulders: 30, gloves: 20, boots: 15 },
    parts: { chest: { on: true, col: '#2a3a72', s: 1.05, y: 0.15, z: 0.01 }, shoulders: { on: true, col: '#d9a93e', s: 1.35, y: -0.04, z: 0 }, helmet: { on: true, col: '#24336a', s: 1, y: 0, z: 0 }, gloves: { on: true, col: '#d9a93e', s: 1.2, y: 0.06, z: 0 },
      belt: P0(false, '#d9a93e'), boots: { on: true, col: '#bc9234', s: 1.15, y: 0, z: 0 }, cape: P0(false, '#2f3f7a'), crest: P0(true, '#ffffff') } },
  // s608 LUXOR BASALT PLATE (brief: Luxor Armory stands "Basalt Plate", keeper Garrow): red stone + black basalt + ember glow, militant. Heavier + pricier than Meru.
  luxor: { id: 'luxor', name: 'LUXOR BASALT PLATE', from: 'Garrow, Luxor Armory · Luxor Barracks', world: 'luxor', accent: '#ff6a2a', armor: 38, kg: 15, torso: ['#3a3436', '#2a2426', '#161213'],
    price: { helmet: 32, chest: 48, shoulders: 38, gloves: 26, boots: 20 },
    parts: { chest: { on: true, col: '#8a2a1e', s: 1.08, y: 0.15, z: 0.01 }, shoulders: { on: true, col: '#2a2426', s: 1.45, y: -0.04, z: 0 }, helmet: { on: true, col: '#2a2426', s: 1, y: 0, z: 0 }, gloves: { on: true, col: '#8a2a1e', s: 1.25, y: 0.06, z: 0 },
      belt: P0(false, '#ff6a2a'), boots: { on: true, col: '#2a2426', s: 1.2, y: 0, z: 0 }, cape: { on: true, col: '#8a2a1e', s: 1, y: 0, z: 0 }, crest: P0(true, '#ffffff') } },
  // s608 GAYA CRYSTAL VESTMENT (brief: church order, white sacred robes, gold trim, lilac + violet banners, cold blue crystal): light, a holy guard's plate. Bree, Gaya Armory.
  gaya: { id: 'gaya', name: 'GAYA CRYSTAL VESTMENT', from: 'Bree, Gaya Armory · Gaya Barracks', world: 'gaya', accent: '#9fe6ff', armor: 26, kg: 9, torso: ['#9a6ad6', '#6e40b0', '#3a1f6a'],
    price: { helmet: 22, chest: 36, shoulders: 28, gloves: 18, boots: 14 },
    parts: { chest: { on: true, col: '#f1e9ff', s: 1, y: 0, z: 0, style: 'tabard' }, shoulders: { on: true, col: '#f1e9ff', s: 1, y: 0, z: 0, style: 'mantle' }, helmet: { on: true, col: '#d9b24a', s: 1, y: 0, z: 0, style: 'circlet' }, gloves: { on: true, col: '#5a2f9a', s: 1.1, y: 0.06, z: 0 },
      belt: P0(true, '#d9b24a'), boots: { on: true, col: '#c9a8f0', s: 1.1, y: 0, z: 0 }, cape: { on: true, col: '#4a2488', s: 1.1, y: 0, z: 0 }, crest: P0(true, '#ffffff') } },
  // s608 UR LAMELLAR (brief: terracotta + clay brick, brass tokens, Sumerian): rows of brass scales, a pointed cone helm with a lapis band. Ur Armory.
  ur: { id: 'ur', name: 'UR LAMELLAR', from: 'Ur Armory · Ur Barracks', world: 'ur', accent: '#3a6fd0', armor: 32, kg: 13, torso: ['#c8643a', '#9a4526', '#5a2814'],
    price: { helmet: 24, chest: 42, shoulders: 30, gloves: 20, boots: 16 },
    parts: { chest: { on: true, col: '#c9a04a', s: 1, y: 0, z: 0, style: 'lamellar' }, shoulders: { on: true, col: '#c9a04a', s: 1, y: 0, z: 0, style: 'scales' }, helmet: { on: true, col: '#c9a04a', s: 1, y: 0, z: 0, style: 'cone' }, gloves: { on: true, col: '#9a4526', s: 1.1, y: 0.06, z: 0 },
      belt: P0(true, '#3a6fd0'), boots: { on: true, col: '#5a2814', s: 1.1, y: 0, z: 0 }, cape: P0(false, '#9a4526'), crest: P0(true, '#ffffff') } },
  // s608 ZION PLATED COVERALLS (brief: Dorkin's Zion Armory sells "Plated Coveralls"; yellow + gold, brass, gold panners, monster trucks, oil derricks)
  zion: { id: 'zion', name: 'ZION PLATED COVERALLS', from: 'Dorkin, Zion Armory · Zion Barracks', world: 'zion', accent: '#ffd23a', armor: 34, kg: 14, torso: ['#d9a93e', '#a87a24', '#5a3e14'],
    price: { helmet: 24, chest: 40, shoulders: 30, gloves: 22, boots: 18 },
    parts: { chest: { on: true, col: '#6a4422', s: 1, y: 0, z: 0, style: 'bib' }, shoulders: { on: true, col: '#2a2826', s: 1, y: 0, z: 0, style: 'pads' }, helmet: { on: true, col: '#f0c020', s: 1, y: 0, z: 0, style: 'miner' }, gloves: { on: true, col: '#6a4422', s: 1.2, y: 0.06, z: 0 },
      belt: P0(true, '#c9902a'), boots: { on: true, col: '#2a2826', s: 1.2, y: 0, z: 0 }, cape: P0(false, '#a87a24'), crest: P0(true, '#ffffff') } },
  // s608 NEBO BARK MAIL (brief: Brindle's Nebo Armory sells "bark mail"; green + gold forest, woven wood, moss, lanterns, honey). Light, a ranger's kit.
  nebo: { id: 'nebo', name: 'NEBO BARK MAIL', from: 'Brindle, Nebo Armory · the Lodge', world: 'nebo', accent: '#f2c84a', armor: 24, kg: 8, torso: ['#4f7a3a', '#34552a', '#1f3418'],
    price: { helmet: 20, chest: 34, shoulders: 26, gloves: 16, boots: 14 },
    parts: { chest: { on: true, col: '#6b4a2c', s: 1, y: 0, z: 0, style: 'bark' }, shoulders: { on: true, col: '#5f9a3a', s: 1, y: 0, z: 0, style: 'leaves' }, helmet: { on: true, col: '#3f6a2e', s: 1, y: 0, z: 0, style: 'ranger' }, gloves: { on: true, col: '#6b4a2c', s: 1.1, y: 0.06, z: 0 },
      belt: P0(true, '#d9a93e'), boots: { on: true, col: '#4a3420', s: 1.15, y: 0, z: 0 }, cape: { on: true, col: '#2f5a26', s: 1.05, y: 0, z: 0 }, crest: P0(true, '#ffffff') } },
  // s608 KUFA BRIGANDINE (brief: Zohra's Kufa Armory sells "brigandine"; desert caravan, sandstone, brass over steel, canvas, water is currency). Light, sun-proof.
  kufa: { id: 'kufa', name: 'KUFA BRIGANDINE', from: 'Zohra, Kufa Armory · Kufa Barracks', world: 'kufa', accent: '#2ab0c8', armor: 28, kg: 10, torso: ['#e6d2a8', '#c8a46a', '#7a5a30'],
    price: { helmet: 20, chest: 38, shoulders: 28, gloves: 18, boots: 16 },
    parts: { chest: { on: true, col: '#b8562e', s: 1, y: 0, z: 0, style: 'brigandine' }, shoulders: { on: true, col: '#d9a93e', s: 1, y: 0, z: 0, style: 'brass' }, helmet: { on: true, col: '#efe2c4', s: 1, y: 0, z: 0, style: 'wrap' }, gloves: { on: true, col: '#7a5a30', s: 1.1, y: 0.06, z: 0 },
      belt: P0(true, '#2ab0c8'), boots: { on: true, col: '#8a6a3a', s: 1.15, y: 0, z: 0 }, cape: { on: true, col: '#d8c49a', s: 1.1, y: 0, z: 0 }, crest: P0(true, '#ffffff') } },
  // s608 SHASTA SNOW RANGER (Shasta = the old Home planet, a snow world: ski lodge, slopes, the rink, the Snow Fort). Warm, quilted, fur-lined; Bree's Armory.
  shasta: { id: 'shasta', name: 'SHASTA SNOW RANGER', from: 'Bree, Shasta Armory · Shasta Barracks', world: 'shasta', accent: '#8fd8ff', armor: 32, kg: 13, torso: ['#e9f2f8', '#9fb8cc', '#3a4f66'],
    price: { helmet: 24, chest: 42, shoulders: 30, gloves: 20, boots: 18 },
    parts: { chest: { on: true, col: '#2f5f9a', s: 1, y: 0, z: 0, style: 'parka' }, shoulders: { on: true, col: '#f4efe6', s: 1, y: 0, z: 0, style: 'furcollar' }, helmet: { on: true, col: '#2f5f9a', s: 1, y: 0, z: 0, style: 'furhood' }, gloves: { on: true, col: '#d8402a', s: 1.25, y: 0.06, z: 0 },
      belt: P0(false, '#3a4f66'), boots: { on: true, col: '#3a4f66', s: 1.3, y: 0, z: 0 }, cape: P0(false, '#2f5f9a'), crest: P0(true, '#ffffff') } },
  // s608 JIDDA TIDE GUARD (brief: lagoon islands, turquoise water, boats + piers, sun-bleached timber, surf wax + netting, cyan trims; Jarl's Armory)
  jidda: { id: 'jidda', name: 'JIDDA TIDE GUARD', from: 'Jarl, Jidda Armory · Jidda Barracks', world: 'jidda', accent: '#ff7f6e', armor: 26, kg: 9, torso: ['#fbf4ea', '#bfe3dc', '#1d5a6e'],   // s608 palette: pearl, seafoam, deep sea + coral trim
    price: { helmet: 22, chest: 36, shoulders: 26, gloves: 16, boots: 14 },
    parts: { chest: { on: true, col: '#1f8a9a', s: 1, y: 0, z: 0, style: 'sash' }, shoulders: { on: true, col: '#e8d2a6', s: 1, y: 0, z: 0, style: 'rope' }, helmet: { on: true, col: '#fff1e6', s: 1, y: 0, z: 0, style: 'shell' }, gloves: { on: true, col: '#1d5a6e', s: 1.05, y: 0.06, z: 0 },
      belt: P0(false, '#e8d2a6'), boots: { on: true, col: '#e8d2a6', s: 1.1, y: 0, z: 0 }, cape: P0(false, '#1f8a9a'), crest: P0(true, '#ffffff') } },
  // s608 EVA SUIT (Ben): a pressure suit for going OUTSIDE in space (hull walks, the space map, docking). Space only. Bulky white + safety orange.
  eva: { id: 'eva', name: 'EVA PRESSURE SUIT', from: 'Deep Space Fox · the airlock locker', world: 'dsf', space: true, accent: '#c9ced6', armor: 22, kg: 16, torso: ['#f4f5f7', '#d4d8de', '#7a828c'],
    price: { helmet: 40, chest: 50, shoulders: 45, gloves: 20, boots: 25 },
    parts: { chest: { on: true, col: '#f4f5f7', s: 1, y: 0, z: 0, style: 'evachest' }, shoulders: { on: true, col: '#e8ebef', s: 1, y: 0, z: 0, style: 'evapack' }, helmet: { on: true, col: '#f4f5f7', s: 1, y: 0, z: 0, style: 'eva' }, gloves: { on: true, col: '#ff8a2a', s: 1.3, y: 0.06, z: 0 },
      belt: P0(true, '#7a828c'), boots: { on: true, col: '#e8ebef', s: 1.4, y: 0, z: 0 }, cape: P0(false, '#f4f5f7'), crest: P0(true, '#ffffff') } },
  // s608 MERU DIVE KIT: the suit from THE DEEP (minigames/jidda/deep-dive.js: brass fishbowl helmet, twin yellow tanks, red trunks), as a set to polish
  dive: { id: 'dive', name: 'MERU DIVE KIT', from: 'Jib\u2019s boat · Meru Lake (dive for pearls)', world: 'meru', water: true, accent: '#ffd23a', armor: 8, kg: 7, torso: ['#1f2a3a', '#16202e', '#0c121c'],
    price: { helmet: 30, chest: 25, shoulders: 30, gloves: 10, boots: 15 },
    parts: { chest: { on: true, col: '#1f2a3a', s: 1, y: 0, z: 0, style: 'wetsuit' }, shoulders: { on: true, col: '#ffd23a', s: 1, y: 0, z: 0, style: 'scuba' }, helmet: { on: true, col: '#d9a64a', s: 1, y: 0, z: 0, style: 'fishbowl' }, gloves: { on: true, col: '#1f2a3a', s: 1.1, y: 0.06, z: 0 },
      belt: P0(true, '#ec3013'), boots: { on: true, col: '#ffd23a', s: 1, y: 0, z: 0 }, cape: P0(false, '#1f2a3a'), crest: P0(true, '#ffffff') } },
  // s729 AVATAR ARMOUR: the MANTIS's own set (its default; the 8 ARMOUR can be worn instead). species = only shown + built for that avatar
  mantis: { id: 'mantis', name: 'MANTIS CARAPACE', species: 'mantis', from: 'Player Planet · the Mantis starts in it', world: 'player', gem: 'mantis', armor: 22, kg: 6, torso: ['#2f6d4a', '#e9e1bf', '#1c2b22'], trim: '#e9e1bf', accent: '#5fbf7f', glow: '#f5a524', legColor: '#24583b',
    parts: { chest: P0(true, '#2f6d4a'), shoulders: P0(true, '#2f6d4a'), helmet: P0(true, '#2f6d4a'), gloves: P0(true, '#24583b'), belt: P0(true, '#2f6d4a'), boots: P0(true, '#24583b'), cape: P0(true, '#2f6d4a'), crest: P0(true, '#ffffff') } },
  // s731 BEE: HIVEGUARD AMBERPLATE, dark lacquer + gold honeycomb + glowing honey
  bee: { id: 'bee', name: 'HIVEGUARD AMBERPLATE', species: 'bee', from: 'Player Planet · the Bee starts in it', world: 'player', gem: 'bee', armor: 20, kg: 5, torso: ['#3a2614', '#5a3a1a', '#1a120a'], trim: '#e0a82e', accent: '#ffb020', glow: '#ffb020', legColor: '#1c1a18',
    parts: { chest: P0(true, '#e0a82e'), shoulders: P0(true, '#e0a82e'), helmet: P0(true, '#e0a82e'), gloves: P0(true, '#f3e3b0'), belt: P0(true, '#e0a82e'), boots: P0(true, '#2a1d12'), cape: P0(true, '#e0a82e'), crest: P0(true, '#ffffff') } },
  // s732 FLY: SKYRACER FLIGHT RIG, gunmetal + iridescent shell, leather, brass, red racing stripe
  fly: { id: 'fly', name: 'SKYRACER FLIGHT RIG', species: 'fly', from: 'Player Planet · the Fly starts in it', world: 'player', gem: 'fly', armor: 16, kg: 4, torso: ['#3b4a5a', '#2a3340', '#151a22'], trim: '#d9a93e', accent: '#3fe0d0', glow: '#3fe0d0', glow2: '#8a5ae0', stripe: '#c0261c', legColor: '#2b2d33',
    parts: { chest: P0(true, '#6b3f22'), shoulders: P0(true, '#3fe0d0'), helmet: P0(true, '#6b3f22'), gloves: P0(true, '#6b3f22'), belt: P0(true, '#4a2c18'), boots: P0(true, '#5a3420'), cape: P0(true, '#c0261c'), crest: P0(true, '#ffffff') } },
  // s733 LIZARD: SUNSTONE SENTINEL, carved sandstone + terracotta, turquoise inlay, beaten copper, fret weave
  lizard: { id: 'lizard', name: 'SUNSTONE SENTINEL', species: 'lizard', from: 'Player Planet · the Lizard starts in it', world: 'player', gem: 'lizard', armor: 24, kg: 7, torso: ['#d9b382', '#b5552e', '#3a2418'], trim: '#c87533', accent: '#2ec4b6', glow: '#2ec4b6', legColor: '#5a2a18',
    parts: { chest: P0(true, '#d9b382'), shoulders: P0(true, '#d9b382'), helmet: P0(true, '#c87533'), gloves: P0(true, '#c87533'), belt: P0(true, '#c87533'), boots: P0(true, '#d9b382'), cape: P0(true, '#ffffff'), crest: P0(true, '#ffffff') } },
  // s734 GRYPHON: STORM AERIE PLATE, steel feathers + crimson enamel + electric-blue lightning
  eagle: { id: 'eagle', name: 'STORM AERIE PLATE', species: 'eagle', from: 'Player Planet · the Gryphon starts in it', world: 'player', gem: 'eagle', armor: 26, kg: 8, torso: ['#c3ccd6', '#8e1b2a', '#2a2228'], trim: '#c3ccd6', accent: '#9fe8ff', glow: '#9fe8ff', legColor: '#2a2228',
    parts: { chest: P0(true, '#9aa6b4'), shoulders: P0(true, '#c3ccd6'), helmet: P0(true, '#c3ccd6'), gloves: P0(true, '#c3ccd6'), belt: P0(true, '#c3ccd6'), boots: P0(true, '#c3ccd6'), cape: P0(true, '#c3ccd6'), crest: P0(true, '#ffffff') } },
  // s736 BEAR: IRONWOOD BULWARK, dark oak planks + blackened iron + a green rune + cream fur
  bear: { id: 'bear', name: 'IRONWOOD BULWARK', species: 'bear', from: 'Player Planet · the Bear starts in it', world: 'player', gem: 'bear', armor: 30, kg: 12, torso: ['#4a3322', '#3a3d42', '#24160c'], trim: '#3a3d42', accent: '#8a8f96', glow: '#7cf2a0', fur: '#e8e0d0', legColor: '#2a1c12',
    parts: { chest: P0(true, '#a8743f'), shoulders: P0(true, '#5a3c24'), helmet: P0(true, '#3a3d42'), gloves: P0(true, '#6b4326'), belt: P0(true, '#3a2414'), boots: P0(true, '#7a5434'), cape: P0(true, '#5a4636'), crest: P0(true, '#ffffff') } },
  // s737 GORILLA: TITAN EXO-FRAME, graphite + safety yellow + hazard stripes + orange reactor glow
  gorilla: { id: 'gorilla', name: 'TITAN EXO-FRAME', species: 'gorilla', from: 'Player Planet · the Gorilla starts in it', world: 'player', gem: 'gorilla', armor: 32, kg: 14, torso: ['#3a3e45', '#2a2d33', '#16181b'], trim: '#f2b705', accent: '#f2b705', glow: '#ff7a1a', legColor: '#1c1d20',
    parts: { chest: P0(true, '#3a3e45'), shoulders: P0(true, '#f2b705'), helmet: P0(true, '#3a3e45'), gloves: P0(true, '#3a3e45'), belt: P0(true, '#2a2d33'), boots: P0(true, '#3a3e45'), cape: P0(true, '#3a3e45'), crest: P0(true, '#ffffff') } },
  // s738 GREY ALIEN: ORBITAL WARDEN, pearl ceramic + violet glass + glowing cyan circuits, floating parts
  alien: { id: 'alien', name: 'ORBITAL WARDEN', species: 'alien', from: 'Player Planet · the Grey Alien starts in it', world: 'player', gem: 'alien', armor: 18, kg: 3, torso: ['#e9e6f2', '#5a3d8f', '#1a1626'], trim: '#c9ccd8', accent: '#4ff0ff', glow: '#4ff0ff', legColor: '#2a2440',
    parts: { chest: P0(true, '#e9e6f2'), shoulders: P0(true, '#e9e6f2'), helmet: P0(true, '#e9e6f2'), gloves: P0(true, '#e9e6f2'), belt: P0(true, '#c9ccd8'), boots: P0(true, '#e9e6f2'), cape: P0(true, '#7a4ad8'), crest: P0(true, '#ffffff') } },
};
const clone = o => JSON.parse(JSON.stringify(o));
// s608 BEN'S SAVED FITS (Ben: "save all the armors"): every set as he tuned it in the Armor Workshop, laid over the code defaults above.
// RESET in the workshop goes back to these. New edits still save to localStorage armor.sets.v1 / armor.human.v1 and win over these.
const BEN_FIT = {"a8":{"parts":{}},"reinf":{"torso":["#eeeff2","#a3cdff","#3a434f"],"parts":{"chest":{"on":true,"col":"#81afe4","s":1.1,"y":0.2,"z":0.01},"shoulders":{"on":true,"col":"#4698fb","s":1.35,"y":0,"z":0},"helmet":{"on":true,"col":"#87b7ee","s":0.95,"y":0.06,"z":0.02},"gloves":{"on":true,"col":"#428fec","s":1.4,"y":0.08,"z":0},"belt":{"on":false,"col":"#83b2e7","s":1,"y":0,"z":0},"boots":{"on":true,"col":"#4391f0","s":1.2,"y":0,"z":0},"cape":{"on":true,"col":"#3a434f","s":1,"y":0.2,"z":-0.01}}},"meru":{"parts":{"shoulders":{"on":true,"col":"#d9a93e","s":1.6,"y":-0.04,"z":0},"boots":{"on":true,"col":"#bc9234","s":1.15,"y":0,"z":0},"chest":{"on":true,"col":"#2a3a72","s":0.9,"y":0.15,"z":0.01,"style":"brigandine"},"cape":{"on":true,"col":"#2f3f7a","s":1,"y":0.2,"z":0}}},"gaya":{"parts":{"chest":{"on":true,"col":"#f1e9ff","s":0.75,"y":0.2,"z":0.02,"style":"tabard"},"shoulders":{"on":true,"col":"#c9a8f0","s":1.4,"y":-0.01,"z":0.05,"style":"pauldron"},"helmet":{"on":true,"col":"#d9b24a","s":1.1,"y":-0.07,"z":0,"style":"circlet"},"belt":{"on":true,"col":"#d9b24a","s":0.85,"y":0,"z":0},"cape":{"on":true,"col":"#4a2488","s":1.1,"y":0.2,"z":-0.01},"gloves":{"on":true,"col":"#5a2f9a","s":1.3,"y":0.15,"z":0},"boots":{"on":true,"col":"#c9a8f0","s":1.1,"y":0,"z":-0.02}}},"ur":{"parts":{"chest":{"on":true,"col":"#c9a04a","s":0.9,"y":-0.03,"z":0,"style":"lamellar"},"shoulders":{"on":true,"col":"#c9a04a","s":1.4,"y":-0.02,"z":0,"style":"scales"},"helmet":{"on":true,"col":"#c9a04a","s":0.95,"y":0.06,"z":0,"style":"helm"},"gloves":{"on":true,"col":"#9a4526","s":1.5,"y":0.19,"z":0},"boots":{"on":true,"col":"#5a2814","s":1.1,"y":0,"z":-0.02},"cape":{"on":true,"col":"#9a4526","s":1,"y":0.2,"z":-0.01}}},"zion":{"parts":{"chest":{"on":true,"col":"#6a4422","s":1,"y":0,"z":-0.05,"style":"bib"},"belt":{"on":true,"col":"#c9902a","s":0.85,"y":0.2,"z":0},"cape":{"on":true,"col":"#a87a24","s":1,"y":0.2,"z":-0.02}}},"nebo":{"parts":{"chest":{"on":true,"col":"#6b4a2c","s":0.95,"y":0.18,"z":0,"style":"bark"},"helmet":{"on":true,"col":"#3f6a2e","s":0.9,"y":0,"z":0.04,"style":"ranger"},"shoulders":{"on":true,"col":"#5f9a3a","s":1.8,"y":-0.2,"z":0.15,"style":"leaves"},"gloves":{"on":true,"col":"#43ea6d","s":1.25,"y":0.1,"z":0},"cape":{"on":true,"col":"#2f5a26","s":1.3,"y":0.2,"z":0}}},"kufa":{"parts":{"chest":{"on":true,"col":"#b8562e","s":0.95,"y":0.05,"z":0,"style":"brigandine"},"shoulders":{"on":true,"col":"#d9a93e","s":1,"y":-0.15,"z":0,"style":"brass"},"helmet":{"on":true,"col":"#efe2c4","s":0.9,"y":0.03,"z":0,"style":"wrap"},"gloves":{"on":true,"col":"#7a5a30","s":1.1,"y":-0.03,"z":0},"cape":{"on":true,"col":"#d8c49a","s":1.1,"y":0.2,"z":0}}},"shasta":{"parts":{"chest":{"on":true,"col":"#2f5f9a","s":0.8,"y":0.2,"z":0,"style":"parka"},"shoulders":{"on":true,"col":"#f4efe6","s":1.15,"y":0.18,"z":0.03,"style":"furcollar"},"helmet":{"on":true,"col":"#2f5f9a","s":0.8,"y":0.05,"z":0.05,"style":"furhood"},"gloves":{"on":true,"col":"#74c5eb","s":1.25,"y":0.1,"z":0},"boots":{"on":true,"col":"#3a4f66","s":1.3,"y":0,"z":0.03},"cape":{"on":true,"col":"#2f5f9a","s":1,"y":0.2,"z":-0.04}}},"jidda":{"accent":"#2ad4d0","torso":["#243dff","#7fd0d8","#1f6a80"],"parts":{"chest":{"on":true,"col":"#1f6a80","s":0.85,"y":0.17,"z":0,"style":"sash"},"shoulders":{"on":true,"col":"#99e0ff","s":1.05,"y":-0.01,"z":0,"style":"rope"},"helmet":{"on":true,"col":"#f2d9c4","s":0.95,"y":0.03,"z":0.03,"style":"shell"},"gloves":{"on":true,"col":"#d1d1d1","s":1.25,"y":0.1,"z":0},"belt":{"on":false,"col":"#e8d6b0","s":1,"y":0,"z":0},"boots":{"on":true,"col":"#0074f0","s":1.1,"y":0,"z":0},"cape":{"on":true,"col":"#1f6a80","s":1,"y":0.2,"z":-0.07}}},"eva":{"parts":{"chest":{"on":true,"col":"#f4f5f7","s":1.05,"y":0,"z":-0.02,"style":"evachest"},"shoulders":{"on":true,"col":"#e8ebef","s":1.15,"y":-0.05,"z":0.01,"style":"evapack"},"helmet":{"on":true,"col":"#f4f5f7","s":0.8,"y":-0.02,"z":0,"style":"eva"},"gloves":{"on":true,"col":"#80fff6","s":1.3,"y":0.16,"z":0},"belt":{"on":false,"col":"#7a828c","s":1,"y":0,"z":-0.03}}},"dive":{"parts":{"helmet":{"on":true,"col":"#d9a64a","s":0.7,"y":-0.01,"z":0,"style":"fishbowl"},"belt":{"on":true,"col":"#ec3013","s":1,"y":0.2,"z":0}}},"luxor":{"parts":{"chest":{"on":true,"col":"#8a2a1e","s":0.9,"y":0.2,"z":0.01,"style":"brigandine"},"helmet":{"on":true,"col":"#2a2426","s":0.95,"y":-0.03,"z":0.03,"style":"cone"},"gloves":{"on":true,"col":"#fe3116","s":1.25,"y":0.1,"z":0},"cape":{"on":true,"col":"#8a2a1e","s":1,"y":0.2,"z":0}}}};
const BEN_HUMAN = {"kyoto":{"yoroi":{"swords":false}},"vegas":{"vegas":{"fit":{"shades":{"style":"aviator","col2":"#2a2a3a","s":1.4,"y":-0.03},"hat":{"s":1,"y":-0.09}}}},"vsuit":{"vegas":{"fit":{"hat":{"col":"#1b1f3a","s":1.15,"y":-0.09},"suit":{"col2":"#0c0c12","s":1.05,"y":0.005},"tie":{"style":"bow","s":1,"z":-0.005},"shades":{"style":"round","col2":"#2a2a3a"},"watch":{"z":0.01,"s":1.2,"y":-0.045},"square":{"y":0.145}}}}};
const mergeDeep = (a, b) => { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') mergeDeep(a[k], b[k]); else a[k] = b[k]; } return a; };
for (const [id, f] of Object.entries(BEN_FIT)) if (ARMOR_DEFAULTS[id]) mergeDeep(ARMOR_DEFAULTS[id], JSON.parse(JSON.stringify(f)));
export function loadArmorSets() {
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(ARMOR_KEY) || '{}') || {}; } catch (e) {}
  const out = {}; for (const [id, d] of Object.entries(ARMOR_DEFAULTS)) { const s = (saved.sets || {})[id] || {}; out[id] = { ...clone(d), ...s, parts: Object.fromEntries(PARTS.map(([k]) => [k, { ...d.parts[k], ...((s.parts || {})[k] || {}) }])) }; }
  for (const [id, s] of Object.entries(saved.sets || {})) if (!out[id] && s && s.parts) out[id] = { ...clone(ARMOR_DEFAULTS.a8), ...s, id, parts: Object.fromEntries(PARTS.map(([k]) => [k, { ...ARMOR_DEFAULTS.a8.parts[k], ...(s.parts[k] || {}) }])), custom: true };
  return out;
}
// s729 what each avatar species wears (its own set by default, '8 ARMOUR' a8 can be equipped instead): localStorage avatar.armor.v1
export const SPECIES_DEFAULT = { mantis: 'mantis', bee: 'bee', fly: 'fly', lizard: 'lizard', eagle: 'eagle', bear: 'bear', gorilla: 'gorilla', alien: 'alien' };
export const AVATAR_SPECIES = [['mantis', 'MANTIS · AVATAR'], ['bee', 'BEE · AVATAR'], ['fly', 'FLY · AVATAR'], ['lizard', 'LIZARD · AVATAR'], ['eagle', 'GRYPHON · AVATAR'], ['bear', 'BEAR · AVATAR'], ['gorilla', 'GORILLA · AVATAR'], ['alien', 'GREY ALIEN · AVATAR']];   // s731 the Armor Workshop WHO buttons
export function avatarArmorId(sp) { try { const o = JSON.parse(localStorage.getItem('avatar.armor.v1') || '{}'); if (o[sp]) return o[sp]; } catch (e) {} return SPECIES_DEFAULT[sp] || null; }
export function setAvatarArmor(sp, id) { try { const o = JSON.parse(localStorage.getItem('avatar.armor.v1') || '{}'); o[sp] = id; localStorage.setItem('avatar.armor.v1', JSON.stringify(o)); } catch (e) {} }
export const setsFor = (sets, sp) => Object.values(sets).filter(s => sp ? (!s.species || s.species === sp) && (s.species === sp || s.id === 'a8') : !s.species);
export function saveArmorSets(sets) { try { localStorage.setItem(ARMOR_KEY, JSON.stringify({ sets })); } catch (e) {} }
// fox make() options for a set (base colours; the crest stays the fox's own)
// a helmet tucks the head tufts away (the fox is merged, so they can't be hidden after it is built): pass the wearer's look
// set.accent = the glow trim colour of the armour (the fox look's armorAccent, blue by default)
export const armorOutfit = (set, look) => ({ outfit: 'armor', torso: set.torso.slice(), ...(set.legColor ? { legColor: set.legColor } : {}), ...(look && (fullHelm(set) || set.accent) ? { look: { ...look, ...(fullHelm(set) ? { headTuft: 0 } : {}), ...(set.accent ? { armorAccent: set.accent } : {}) } } : {}) });
// strap the add-on parts onto a fox made with armorOutfit(set). Safe to call again: removes the old parts first.
export function dressArmor({ THREE, M, toon }, fox, set) {
  const u = fox.userData, P = u.P; if (!P || !P.body) return;
  (u.armorAdd || []).forEach(o => o.parent && o.parent.remove(o)); u.armorAdd = []; u.cape = null; u.armorFx = null;
  const add = (parent, o) => { parent.add(o); u.armorAdd.push(o); return o; }, pt = set.parts;
  const G = (parent, p, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y + (p.y || 0), z + (p.z || 0)); g.scale.setScalar(p.s || 1); return add(parent, g); };
  // the crest decal: find it by its emissive map, hide it when the part is off
  { const em = crestCanvas(set.emblem || set.id); P.body.traverse(o => { const mt = o.isMesh && o.material, ud = o.userData;   // s730 each unique set's own crest (armor-crests.js); the 8 ARMOUR keeps its 8
    if (!(mt && ((mt.emissiveMap && mt.map === mt.emissiveMap) || ud.crest || ud.crestMat0))) return;   /* s730 the s149 decal is MeshBasic with userData.crest */ o.visible = !!pt.crest.on;
    if (!ud.crestMat0) ud.crestMat0 = mt; if (em) { if (!ud.crestEm || ud.crestEmId !== em) { const tx = new THREE.CanvasTexture(em); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; const m2 = ud.crestMat0.clone(); m2.map = tx; if (m2.emissiveMap) m2.emissiveMap = tx; ud.crestEm = m2; ud.crestEmId = em; } o.material = ud.crestEm; } else o.material = ud.crestMat0; }); }
  P.body.children.forEach(o => { const gp = o.isMesh && o.geometry && o.geometry.type === 'BoxGeometry' && o.geometry.parameters; if (gp && gp.width === 0.17 && gp.height === 0.2) o.visible = !set.species; });   // s735 Ben: no fox-kit fauld tabs under the belt on the unique avatar sets
  if (set.species && (u.mantis || u.bee || u.fly || u.lizard || u.eagle || u.bear || u.gorilla || u.alien)) trimCuffs({ toon }, fox, set);   // s731 cuffs + knee guards in the set's trim, not white
  if (set.species === 'mantis' && u.mantis) { dressMantis({ THREE, M, toon }, fox, set, add, G); return; }
  if (set.species === 'bee' && u.bee) { dressBee({ THREE, M, toon }, fox, set, add, G); return; }   // s731
  if (set.species === 'fly' && u.fly) { dressFly({ THREE, M, toon }, fox, set, add, G); return; }   // s732
  if (set.species === 'lizard' && u.lizard) { dressLizard({ THREE, M, toon }, fox, set, add, G); return; }   // s733
  if (set.species === 'eagle' && u.eagle) { dressEagle({ THREE, M, toon }, fox, set, add, G); return; }   // s734 gryphon
  if (set.species === 'bear' && u.bear) { dressBear({ THREE, M, toon }, fox, set, add, G); return; }   // s736
  if (set.species === 'gorilla' && u.gorilla) { dressGorilla({ THREE, M, toon }, fox, set, add, G); return; }   // s737
  if (set.species === 'alien' && u.alien) { dressAlien({ THREE, M, toon }, fox, set, add, G); return; }   // s738   // s729 species set: its own parts
  if (set.species) return;   // a species set on another body: base colours only
  const grad0 = () => toon('#ffffff').gradientMap;
  const gold0 = toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.25 });
  const crys = c => new THREE.MeshToonMaterial({ color: c, emissive: new THREE.Color(c), emissiveIntensity: 0.6, flatShading: true });
  const brass = toon('#d9a93e', { emissive: new THREE.Color('#4a3008'), emissiveIntensity: 0.2 });
  const fur = c => toon(c || '#f4efe6');
  if (pt.chest.on && pt.chest.style === 'wetsuit') {   // a sleek neoprene wetsuit: panels down the sides in the accent, a zip at the back, a knee-length leg, red trunks band
    const lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0, g = G(P.body, pt.chest, 0, lift0, 0), m = toon(pt.chest.col), acc = toon(set.accent || '#ffd23a');
    for (const s of [-1, 1]) { const st = M(new THREE.BoxGeometry(0.035, 0.62, 0.05), acc, s * 0.33, 0.82, 0, g, 0.006); st.rotation.z = s * 0.06; }
    M(new THREE.BoxGeometry(0.03, 0.55, 0.02), toon('#c9ced6'), 0, 0.85, -0.36, g, 0.004);
    M(new THREE.SphereGeometry(0.022, 8, 6), toon('#c9ced6'), 0, 1.13, -0.34, g, 0);
    for (const leg of P.legs || []) { const lg = new THREE.Group(); leg.add(lg); u.armorAdd.push(lg); M(new THREE.CylinderGeometry(leg.parent && leg.parent.parent && leg.parent.parent.userData && leg.parent.parent.userData.P && leg.parent.parent.userData.P.foot ? 0.158 : 0.1, leg.parent && leg.parent.parent && leg.parent.parent.userData && leg.parent.parent.userData.P && leg.parent.parent.userData.P.foot ? 0.13 : 0.095, 0.24, 16), m, 0, -0.12, 0, lg, 0.012, 0.158); }   // s662y wider over the new jointed thigh
    if (P.tail) { const tm = P.tail.children.find(o => o.isMesh); if (tm) { tm.geometry.computeBoundingBox(); const bb = tm.geometry.boundingBox; const b2 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 16), acc); b2.position.set(0, (bb.min.y + bb.max.y) / 2, bb.max.z - 0.08); add(P.tail, b2); } } }
  else if (pt.chest.on && pt.chest.style === 'evachest') {   // a hard chest unit: control panel with lit buttons, a hose loop up to the helmet ring, orange bands, the mission patch
    const lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0, g = G(P.body, pt.chest, 0, lift0, 0), m = toon(pt.chest.col), dk = toon('#7a828c'), org = toon(set.accent || '#ff8a2a');
    for (const y of [0.54, 0.86]) { const b2 = M(new THREE.TorusGeometry(0.34, 0.022, 8, 34), org, 0, y, 0, g, 0); b2.rotation.x = Math.PI / 2; b2.scale.set(1.05, 1.14, 1); }
    const box = M(new THREE.BoxGeometry(0.3, 0.17, 0.08), m, 0, 0.66, 0.37, g, 0.012); box.rotation.x = -0.08;
    M(new THREE.BoxGeometry(0.24, 0.11, 0.01), dk, 0, 0.67, 0.415, g, 0).rotation.x = -0.08;
    [['#ff3b2a', -0.07], ['#38f070', 0], ['#38bdf8', 0.07]].forEach(([c, x]) => M(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 10), new THREE.MeshBasicMaterial({ color: c }), x, 0.69, 0.422, g, 0).rotation.x = Math.PI / 2 - 0.08);
    for (let i = 0; i < 4; i++) M(new THREE.BoxGeometry(0.03, 0.008, 0.006), new THREE.MeshBasicMaterial({ color: '#b8f5ff' }), -0.075 + i * 0.05, 0.645, 0.422, g, 0);
    for (const s of [-1, 1]) { const curve = new THREE.CatmullRomCurve3([[s * 0.12, 0.7, 0.4], [s * 0.2, 0.85, 0.38], [s * 0.16, 1.05, 0.34], [s * 0.1, 1.2, 0.2]].map(q => new THREE.Vector3(...q)));
      M(new THREE.TubeGeometry(curve, 16, 0.022, 8), dk, 0, 0, 0, g, 0.006); } }
  else if (pt.chest.on && pt.chest.style === 'sash') {   // s608 polished: a wide sailor sash wrapped at the waist (teal with two pearl stripes), a big knot + two tails on the hip, a coral charm, a cork-float net over the back
    const lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0, g = G(P.body, pt.chest, 0, lift0 - 0.04, 0), m = toon(pt.chest.col, { side: THREE.DoubleSide }), pearl = toon('#fbf4ea'), coralM = toon(set.accent || '#ff7f6e');
    const band = M(new THREE.CylinderGeometry(0.37, 0.36, 0.26, 36, 1, true), m, 0, 0.58, 0, g, 0.012); band.scale.set(1.05, 1, 1.14);
    for (const y of [0.5, 0.66]) { const st = M(new THREE.TorusGeometry(0.368, 0.013, 6, 40), pearl, 0, y, 0, g, 0); st.rotation.x = Math.PI / 2; st.scale.set(1.05, 1.14, 1); }
    const kn = new THREE.Group(); kn.position.set(0.31, 0.6, 0.25); kn.rotation.set(0, 0.85, -0.15); g.add(kn);
    M(new THREE.SphereGeometry(0.06, 12, 10), m, 0, 0, 0, kn, 0.008).scale.set(1.1, 0.85, 0.75);
    for (const s of [-1, 1]) { const tl = new THREE.Group(); tl.position.set(s * 0.03, -0.03, 0); tl.rotation.z = s * 0.22; kn.add(tl);
      const tg = new THREE.PlaneGeometry(0.07, 0.24, 1, 4); tg.translate(0, -0.12, 0); const p = tg.attributes.position; for (let k = 0; k < p.count; k++) p.setZ(k, Math.sin(-p.getY(k) * 9) * 0.012);
      M(tg, m, 0, 0, 0, tl, 0); M(new THREE.BoxGeometry(0.072, 0.012, 0.006), pearl, 0, -0.2, 0.003, tl, 0); }
    const co = new THREE.Group(); co.position.set(-0.2, 0.5, 0.385); g.add(co);
    M(new THREE.CylinderGeometry(0.012, 0.016, 0.1, 6), coralM, 0, 0, 0, co, 0.004); for (const [x, y, rz] of [[-0.03, 0.04, 0.7], [0.03, 0.05, -0.6], [0, 0.07, 0]]) M(new THREE.CylinderGeometry(0.008, 0.011, 0.07, 5), coralM, x, y, 0, co, 0.003).rotation.z = rz;
    // net: a canvas rope mesh with cork floats along the top
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x2 = cv.getContext('2d'); x2.strokeStyle = '#e8d2a6'; x2.lineWidth = 5;
    for (let k = -128; k <= 256; k += 32) { x2.beginPath(); x2.moveTo(k, 0); x2.lineTo(k + 128, 128); x2.stroke(); x2.beginPath(); x2.moveTo(k + 128, 0); x2.lineTo(k, 128); x2.stroke(); }
    const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(2, 1.6);
    const ng = new THREE.CylinderGeometry(0.37, 0.4, 0.4, 20, 1, true, Math.PI * 0.62, Math.PI * 0.76); const net = new THREE.Mesh(ng, new THREE.MeshBasicMaterial({ map: tx, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide })); net.position.y = 0.92; net.scale.set(1.05, 1, 1.12); g.add(net);
    for (let k = 0; k < 5; k++) { const a = Math.PI * 0.68 + k * (Math.PI * 0.64 / 4); M(new THREE.SphereGeometry(0.03, 8, 6), toon('#c98a4a'), Math.sin(a) * 0.39 * 1.05, 1.12, Math.cos(a) * 0.4 * 1.12, g, 0.005).scale.set(1, 0.7, 1); } }
  else if (pt.chest.on && pt.chest.style === 'parka') {   // a puffy quilted parka round the belly: stacked rolls, a zip down the front with a red pull
    const g = G(P.body, pt.chest, 0, 0, 0), m = toon(pt.chest.col), dk = toon('#' + new THREE.Color(pt.chest.col).multiplyScalar(0.8).getHexString());
    [[0.5, 0.345], [0.6, 0.36], [0.7, 0.365], [0.8, 0.35]].forEach(([y, r], k) => { const ro = M(new THREE.TorusGeometry(r, 0.055, 10, 32), k % 2 ? m : dk, 0, y, 0, g, 0.01); ro.rotation.x = Math.PI / 2; ro.scale.set(1.04, 1.14, 1); });
    M(new THREE.BoxGeometry(0.03, 0.38, 0.02), toon('#c9d6e0'), 0, 0.65, 0.42, g, 0.006);
    M(new THREE.BoxGeometry(0.035, 0.06, 0.02), toon('#d8402a'), 0.03, 0.83, 0.43, g, 0.006);
    const hem = M(new THREE.TorusGeometry(0.36, 0.05, 8, 32), fur(), 0, 0.45, 0, g, 0.01); hem.rotation.x = Math.PI / 2; hem.scale.set(1.05, 1.15, 1); }
  else if (pt.chest.on && pt.chest.style === 'brigandine') {   // a cloth-covered jerkin over the belly, rows of brass rivets, a water flask on the hip
    const g = G(P.body, pt.chest, 0, 0, 0), m = toon(pt.chest.col);
    const prof = [[0.33, 0.48], [0.345, 0.58], [0.35, 0.7], [0.34, 0.82], [0.33, 0.86]].map(([x, y]) => new THREE.Vector2(x, y)), jk = M(new THREE.LatheGeometry(prof, 30), m, 0, 0, 0, g, 0.014); jk.scale.set(1.06, 1, 1.14);
    for (const y of [0.53, 0.63, 0.73, 0.82]) for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; M(new THREE.SphereGeometry(0.016, 6, 4), brass, Math.sin(a) * 0.35 * 1.07, y, Math.cos(a) * 0.35 * 1.15, g, 0); }
    const fl = new THREE.Group(); fl.position.set(-0.36, 0.5, 0.1); fl.rotation.z = 0.12; g.add(fl);
    M(new THREE.SphereGeometry(0.075, 12, 10), toon('#8a6a3a'), 0, 0, 0, fl, 0.01).scale.set(0.75, 1, 0.55); M(new THREE.CylinderGeometry(0.02, 0.025, 0.05, 8), brass, 0, 0.09, 0, fl, 0.006);
    M(new THREE.CylinderGeometry(0.024, 0.024, 0.02, 8), toon('#2ab0c8'), 0, 0.12, 0, fl, 0); }
  else if (pt.chest.on && pt.chest.style === 'bark') {   // overlapping bark plates round the belly with woven straps + a little lantern on the belt
    const g = G(P.body, pt.chest, 0, 0, 0), m = toon(pt.chest.col), dk = toon('#' + new THREE.Color(pt.chest.col).multiplyScalar(0.7).getHexString()), moss = toon('#6f9a3a');
    [[0.55, 0.33, 14], [0.66, 0.325, 14], [0.77, 0.335, 13]].forEach(([y, r, n], ri) => { for (let i = 0; i < n; i++) { const a = (i + (ri % 2) * 0.5) * (Math.PI * 2 / n);
      const pl = M(new THREE.BoxGeometry(0.11, 0.13, 0.03), (i + ri) % 3 ? m : dk, Math.sin(a) * r * 1.06, y, Math.cos(a) * r * 1.13, g, 0.008); pl.rotation.set(-0.2, a, (i % 2 ? 0.06 : -0.06));
      if ((i + ri * 2) % 5 === 0) { const mo = M(new THREE.SphereGeometry(0.03, 6, 4), moss, Math.sin(a) * r * 1.15, y + 0.06, Math.cos(a) * r * 1.22, g, 0); mo.scale.set(1.4, 0.5, 1); } } });
    for (const s of [-1, 1]) { const st = M(new THREE.BoxGeometry(0.05, 0.5, 0.02), toon('#a8844a'), s * 0.12, 1.0, 0.3, g, 0.006); st.rotation.set(-0.4, 0, -s * 0.35); }
    const ln = new THREE.Group(); ln.position.set(0.27, 0.5, 0.24); g.add(ln);
    M(new THREE.CylinderGeometry(0.035, 0.035, 0.07, 6), new THREE.MeshBasicMaterial({ color: '#ffd76a' }), 0, 0, 0, ln, 0.008); M(new THREE.ConeGeometry(0.045, 0.035, 6), dk, 0, 0.052, 0, ln, 0.006); M(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 6), dk, 0, -0.04, 0, ln, 0); }
  else if (pt.chest.on && pt.chest.style === 'bib') {   // a work-coverall bib on the belly with a riveted brass plate; two straps run up beside the crest and over the shoulders
    const g = G(P.body, pt.chest, 0, 0, 0), m = toon(pt.chest.col);
    const bib = M(new THREE.BoxGeometry(0.4, 0.27, 0.04), m, 0, 0.74, 0.335, g, 0.012); bib.rotation.x = -0.12;
    const pl = M(new THREE.BoxGeometry(0.2, 0.12, 0.02), brass, 0, 0.75, 0.36, g, 0.008); pl.rotation.x = -0.12;
    for (const [x, y] of [[-0.08, 0.8], [0.08, 0.8], [-0.08, 0.7], [0.08, 0.7]]) M(new THREE.SphereGeometry(0.014, 6, 4), toon('#5a3e14'), x, y, 0.372, g, 0);
    for (const s of [-1, 1]) { const st = M(new THREE.BoxGeometry(0.06, 0.42, 0.025), m, s * 0.17, 1.03, 0.3, g, 0.008); st.rotation.set(-0.42, 0, s * 0.08);
      M(new THREE.BoxGeometry(0.06, 0.4, 0.025), m, s * 0.17, 1.0, -0.3, g, 0.008).rotation.set(0.4, 0, -s * 0.08);
      M(new THREE.TorusGeometry(0.03, 0.01, 6, 12), brass, s * 0.17, 0.86, 0.35, g, 0); } }
  else if (pt.chest.on && pt.chest.style === 'lamellar') {   // rows of overlapping brass scales wrapped round the chest
    const g = G(P.body, pt.chest, 0, 0, 0), m = toon(pt.chest.col), dk = toon('#' + new THREE.Color(pt.chest.col).multiplyScalar(0.72).getHexString());
    const rows = [[0.5, 0.33], [0.6, 0.325], [0.7, 0.32], [0.8, 0.34]], n = 18;   // a Sumerian scale kilt, all the way round below the crest
    rows.forEach(([y, r], ri) => { for (let i = 0; i < n; i++) { const a = (i + (ri % 2) * 0.5) * (Math.PI * 2 / n);
      const sc = M(new THREE.BoxGeometry(0.075, 0.11, 0.018), i % 2 ? m : dk, Math.sin(a) * r * 1.05, y, Math.cos(a) * r * 1.12, g, 0.006); sc.rotation.set(-0.18, a, 0); } }); }
  else if (pt.chest.on && pt.chest.style === 'tabard') {   // a long sacred tabard hanging from the belt, gold-edged, a crystal on it
    const g = G(P.body, pt.chest, 0, 0.66, 0.3), m = toon(pt.chest.col, { side: THREE.DoubleSide }); g.rotation.x = 0.08;
    M(new THREE.BoxGeometry(0.3, 0.5, 0.025), m, 0, -0.25, 0.01, g, 0.012);
    for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.025, 0.5, 0.03), gold0, s * 0.15, -0.25, 0.012, g, 0);
    M(new THREE.BoxGeometry(0.33, 0.03, 0.03), gold0, 0, -0.5, 0.012, g, 0);
    const c = M(new THREE.OctahedronGeometry(0.05, 0), crys(set.accent || '#9fe6ff'), 0, -0.2, 0.03, g, 0.01); c.scale.set(0.8, 1.3, 0.5); }
  else if (pt.chest.on) { const g = G(P.body, pt.chest, 0, 0.97, 0.27), m = toon(pt.chest.col);
    const pl = M(new THREE.SphereGeometry(0.3, 20, 12, -Math.PI * 0.42, Math.PI * 0.84, Math.PI * 0.22, Math.PI * 0.42), m, 0, 0, -0.2, g, 0.02); pl.scale.set(1.12, 1.2, 0.9);
    M(new THREE.BoxGeometry(0.05, 0.3, 0.05), toon('#e6b45a'), 0, -0.02, 0.085, g, 0.012); }
  if (pt.shoulders.on && pt.shoulders.style === 'scuba') {   // twin yellow air tanks on a black harness, valves on top, a hose over the shoulder to the helmet
    const lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0, g = G(P.body, pt.shoulders, 0, 1.02 + lift0, -0.42), y = toon(pt.shoulders.col), ink = toon('#201e1d'), steel = toon('#94a3b8');
    for (const sx of [-0.17, 0.17]) { M(new THREE.CylinderGeometry(0.15, 0.15, 0.78, 16), y, sx, 0, 0, g, 0.022, 0.15); M(new THREE.SphereGeometry(0.15, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), y, sx, 0.39, 0, g, 0.01, 0.15); M(new THREE.SphereGeometry(0.15, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), y, sx, -0.39, 0, g, 0.01, 0.15);
      M(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 8), steel, sx, 0.56, 0, g, 0.006); M(new THREE.TorusGeometry(0.05, 0.014, 5, 12), toon('#ec3013'), sx, 0.62, 0, g, 0).rotation.x = Math.PI / 2; }
    for (const yy of [0.2, -0.22]) M(new THREE.BoxGeometry(0.52, 0.07, 0.34), ink, 0, yy, 0.02, g, 0.006);
    for (const s of [-1, 1]) { const st = M(new THREE.BoxGeometry(0.06, 0.62, 0.025), ink, s * 0.2, -0.1, 0.62, g, 0.004); st.rotation.x = -0.12; }
    const hose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0.17, 0.6, 0], [0.25, 0.75, 0.25], [0.18, 0.72, 0.5]].map(q => new THREE.Vector3(...q))), 14, 0.03, 6), ink); g.add(hose); }
  else if (pt.shoulders.on && pt.shoulders.style === 'evapack') {   // a life-support backpack (two tanks + a beacon) and padded shoulder rings
    const lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0, g = G(P.body, pt.shoulders, 0, lift0, 0), m = toon(pt.shoulders.col), dk = toon('#7a828c'), org = toon(set.accent || '#ff8a2a');
    const pk = M(new THREE.BoxGeometry(0.5, 0.56, 0.2), m, 0, 0.88, -0.44, g, 0.014); pk.rotation.x = 0.06;
    for (const s of [-1, 1]) { M(new THREE.CylinderGeometry(0.075, 0.075, 0.46, 16), toon('#d4d8de'), s * 0.15, 0.88, -0.57, g, 0.01, 0.075); M(new THREE.SphereGeometry(0.075, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#d4d8de'), s * 0.15, 1.11, -0.57, g, 0.008, 0.075); }
    M(new THREE.BoxGeometry(0.42, 0.05, 0.22), org, 0, 0.64, -0.44, g, 0.006);
    const bc = M(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 10), new THREE.MeshBasicMaterial({ color: '#ff3b2a' }), 0.18, 1.2, -0.46, g, 0.004); u.evaBeacon = bc;
    [-1, 1].forEach(sd => { const sg = G(P.body, pt.shoulders, sd * 0.36, 1.17 + lift0, 0); sg.rotation.z = -sd * 0.42;
      const d = M(new THREE.SphereGeometry(0.2, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, -0.02, 0, sg, 0.014, 0.2); d.scale.set(1.02, 0.72, 1.06);
      const r2 = M(new THREE.TorusGeometry(0.2, 0.024, 8, 26), dk, 0, -0.03, 0, sg, 0); r2.rotation.x = Math.PI / 2; }); }
  else if (pt.shoulders.on && pt.shoulders.style === 'rope') {   // s608 polished: a big ribbed scallop shell on each shoulder, sitting on a coil of ship's rope
    const shellGeo = (R, n, base, coral) => { const sg = new THREE.SphereGeometry(R, 40, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), p = sg.attributes.position, cols = [];
      for (let k = 0; k < p.count; k++) { let x = p.getX(k), y = p.getY(k), z = p.getZ(k); const az = Math.atan2(x, z), w = Math.cos(az * n), lo = Math.min(1, (R - y) / R * 2.2), f = 1 + 0.08 * w * lo;
        x *= f; z *= f; if (y < R * 0.2) y += R * 0.12 * w * (1 - y / (R * 0.2)); p.setXYZ(k, x, y, z); const c = base.clone().lerp(coral, Math.max(0, w) * 0.8 * lo); cols.push(c.r, c.g, c.b); }
      sg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); sg.computeVertexNormals(); return sg; };
    const sb = new THREE.Color('#fff4ea'), sc = new THREE.Color('#ff8a76'), smat = new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: grad0() });
    const lift0 = P.arms && P.arms[0] ? P.arms[0].position.y - 1.12 : 0;   // same frame as the base armour's pauldrons (body, ±0.36, 1.17 + lift, tilted)
    [-1, 1].forEach(sd => { const g0 = G(P.body, pt.shoulders, sd * 0.36, 1.17 + lift0, 0); g0.rotation.z = -sd * 0.42; const m = toon(pt.shoulders.col);
      const coil = M(new THREE.TorusGeometry(0.21, 0.032, 8, 26), m, 0, -0.06, 0, g0, 0.008); coil.rotation.x = Math.PI / 2;
      const coil2 = M(new THREE.TorusGeometry(0.19, 0.028, 8, 26), m, 0, -0.1, 0, g0, 0.008); coil2.rotation.x = Math.PI / 2;
      const sh = M(shellGeo(0.235, 11, sb, sc), smat, 0, -0.04, 0, g0, 0.012); sh.scale.set(1.02, 0.78, 1.08);
      M(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshToonMaterial({ color: '#f6fbff', emissive: new THREE.Color('#bfe3dc'), emissiveIntensity: 0.3, gradientMap: grad0() }), 0, 0.15, 0, g0, 0.005); }); }
  else if (pt.shoulders.on && pt.shoulders.style === 'furcollar') {   // s608 polished (Ben: "melted marshmallow"): a FUR RUFF of tufts pointing out + down in two layers over a darker root, on quilted shoulder pads
    const g = G(P.body, pt.shoulders, 0, 1.3, 0), base = new THREE.Color(pt.shoulders.col || '#f4efe6'), m1 = toon('#' + base.getHexString()), m2 = toon('#' + base.clone().multiplyScalar(0.88).getHexString()), m3 = toon('#' + base.clone().multiplyScalar(0.7).getHexString());
    const pc = set.parts.chest.on ? set.parts.chest.col : '#2f5f9a', padM = toon(pc), seamM = toon('#' + new THREE.Color(pc).multiplyScalar(0.78).getHexString());
    for (const sx of [-1, 1]) { const sp = M(new THREE.SphereGeometry(0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), padM, sx * 0.44, -0.12, 0, g, 0.012, 0.16); sp.scale.set(1.12, 0.78, 1.1);
      for (let q = 0; q < 3; q++) { const qr = M(new THREE.TorusGeometry(0.165 - q * 0.045, 0.011, 5, 20), seamM, sx * 0.44, -0.1 + q * 0.035, 0, g, 0); qr.rotation.x = Math.PI / 2; qr.scale.set(1.12, 1.1, 1); } }
    const root = M(new THREE.TorusGeometry(0.26, 0.055, 8, 28), m3, 0, 0, 0, g, 0.006); root.rotation.x = Math.PI / 2; root.scale.set(1.16, 1, 1);
    let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280), up = new THREE.Vector3(0, 1, 0);
    [[24, 0.28, 0.03, 0.15, m1, 0.15], [20, 0.33, -0.04, 0.14, m2, -0.25]].forEach(([n, rr, y, len, mat, lift2], ri) => { for (let i = 0; i < n; i++) { const a = (i + ri * 0.5) / n * Math.PI * 2;
      if (Math.cos(a) > 0.86) continue;
      const x = Math.sin(a) * rr * 1.16, z = Math.cos(a) * rr, tf = M(new THREE.ConeGeometry(0.04 + rnd() * 0.016, len * (0.85 + rnd() * 0.35), 6), mat, x, y, z, g, 0.004);
      tf.quaternion.setFromUnitVectors(up, new THREE.Vector3(x, lift2 + (rnd() - 0.5) * 0.2, z).normalize()); } });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.25; if (Math.cos(a) > 0.86) continue; const tf = M(new THREE.ConeGeometry(0.033, 0.1, 5), m1, Math.sin(a) * 0.21 * 1.14, 0.06, Math.cos(a) * 0.21, g, 0.003); tf.quaternion.setFromUnitVectors(up, new THREE.Vector3(Math.sin(a) * 0.4, 1, Math.cos(a) * 0.4).normalize()); } }
  else if (pt.shoulders.on && pt.shoulders.style === 'brass') {   // a big polished brass disc on each shoulder with a turquoise boss, a cloth drape under it
    (P.arms || []).forEach((arm, ai) => { const sd = ai ? 1 : -1, g0 = G(arm, pt.shoulders, 0, 0.1, 0), m = toon(pt.shoulders.col, { emissive: new THREE.Color('#4a3008'), emissiveIntensity: 0.2 }), g = new THREE.Group(); g.rotation.set(0.55, 0, -sd * 0.6); g.position.set(sd * 0.03, 0, 0.03); g0.add(g);
      const dr = M(new THREE.SphereGeometry(0.16, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), toon(set.parts.cape.on ? set.parts.cape.col : '#d8c49a'), 0, -0.04, 0, g0, 0.012, 0.15); dr.scale.set(1.1, 0.95, 1.1);
      const disc = M(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 24), m, 0, 0.12, 0, g, 0.01);
      const ring = M(new THREE.TorusGeometry(0.12, 0.014, 6, 20), m, 0, 0.14, 0, g, 0); ring.rotation.x = Math.PI / 2;
      M(new THREE.SphereGeometry(0.035, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), toon('#2ab0c8', { emissive: new THREE.Color('#0a4a58'), emissiveIntensity: 0.4 }), 0, 0.137, 0, g, 0.006); }); }
  else if (pt.shoulders.on && pt.shoulders.style === 'leaves') {   // three big leaves layered over each shoulder, a gold acorn on top
    for (const arm of P.arms || []) { const g = G(arm, pt.shoulders, 0, 0.11, 0), m = toon(pt.shoulders.col, { side: THREE.DoubleSide }), m2 = toon('#' + new THREE.Color(pt.shoulders.col).multiplyScalar(0.75).getHexString(), { side: THREE.DoubleSide });
      const leaf = (mat, ry, rx, len) => { const s = new THREE.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(0.1, len * 0.45, 0, len); s.quadraticCurveTo(-0.1, len * 0.45, 0, 0); const lf = M(new THREE.ShapeGeometry(s, 6), mat, 0, 0, 0, g, 0); lf.rotation.set(rx, ry, 0); return lf; };
      leaf(m, 0, -0.9, 0.34); leaf(m2, 1.25, -0.85, 0.3); leaf(m2, -1.25, -0.85, 0.3); leaf(m, Math.PI, -0.9, 0.3); leaf(m, Math.PI * 0.6, -0.95, 0.26); leaf(m, -Math.PI * 0.6, -0.95, 0.26);
      M(new THREE.SphereGeometry(0.035, 8, 6), toon('#d9a93e'), 0, 0.03, 0, g, 0.006); M(new THREE.CylinderGeometry(0.03, 0.036, 0.02, 8), toon('#6b4a2c'), 0, 0.06, 0, g, 0); } }
  else if (pt.shoulders.on && pt.shoulders.style === 'pads') {   // thick rubber shoulder pads with a tyre-tread ring and a brass rivet
    for (const arm of P.arms || []) { const g = G(arm, pt.shoulders, 0, 0.03, 0), m = toon(pt.shoulders.col);
      const d = M(new THREE.SphereGeometry(0.14, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), m, 0, 0.01, 0, g, 0.015, 0.14); d.scale.set(1.1, 0.95, 1.15);
      const ring = M(new THREE.TorusGeometry(0.14, 0.04, 8, 18), m, 0, 0.0, 0, g, 0.01); ring.rotation.x = Math.PI / 2; ring.scale.set(1.08, 1.12, 1);
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; M(new THREE.BoxGeometry(0.025, 0.06, 0.02), toon('#4a4644'), Math.cos(a) * 0.178, 0, Math.sin(a) * 0.185, g, 0).rotation.y = -a; }
      M(new THREE.SphereGeometry(0.028, 8, 6), brass, 0, 0.14, 0, g, 0); } }
  else if (pt.shoulders.on && pt.shoulders.style === 'scales') {   // three stacked brass scale caps on each arm
    for (const arm of P.arms || []) { const g = G(arm, pt.shoulders, 0, 0.02, 0), m = toon(pt.shoulders.col);
      [[0.04, 0.14], [-0.04, 0.135], [-0.12, 0.125]].forEach(([y, r]) => { const c = M(new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), m, 0, y, 0, g, 0.012, r); c.scale.set(1.1, 0.7, 1.05); }); } }
  else if (pt.shoulders.on && pt.shoulders.style === 'mantle') {   // a layered round mantle over both shoulders, gold edge
    const g = G(P.body, pt.shoulders, 0, 1.36, 0.01), m = toon(pt.shoulders.col, { side: THREE.DoubleSide });
    const a = M(new THREE.CylinderGeometry(0.2, 0.54, 0.22, 32, 1, false), m, 0, 0, 0, g, 0.015); a.scale.z = 0.78;
    const b2 = M(new THREE.CylinderGeometry(0.19, 0.38, 0.12, 28, 1, false), toon(set.parts.cape.on ? set.parts.cape.col : pt.shoulders.col, { side: THREE.DoubleSide }), 0, 0.1, 0, g, 0.012); b2.scale.z = 0.82;
    for (const s of [-1, 1]) { const c = M(new THREE.OctahedronGeometry(0.045, 0), crys(set.accent || '#9fe6ff'), s * 0.3, -0.03, 0.34, g, 0.008); c.scale.set(0.7, 1.2, 0.6); } }
  else if (pt.shoulders.on) for (const arm of P.arms || []) { const g = G(arm, pt.shoulders, 0, 0.03, 0), m = toon(pt.shoulders.col);
    const d = M(new THREE.SphereGeometry(0.13, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), m, 0, 0, 0, g, 0.015, 0.13); d.scale.set(1.15, 0.95, 1.1);
    const r = M(new THREE.TorusGeometry(0.125, 0.018, 6, 20), toon('#e6b45a'), 0, 0.005, 0, g, 0); r.rotation.x = Math.PI / 2; }
  if (P.head) P.head.children.forEach(o => { const p = o.isMesh && o.geometry.type === 'ConeGeometry' && o.geometry.parameters; if (p && p.radialSegments === 6 && Math.abs(p.radius - 0.06) < 0.001) { if (o.userData.tuftVis == null) o.userData.tuftVis = o.visible; o.visible = pt.helmet.on ? false : o.userData.tuftVis; } });   // head tufts tuck under the helmet
  if (P.hair) P.hair.forEach(h => { if (h.userData.vis0 == null) h.userData.vis0 = h.visible; h.visible = pt.helmet.on ? false : h.userData.vis0; });   // s609i hair locks too
  if (pt.helmet.on && P.head && pt.helmet.style === 'fishbowl') {   // the brass FISHBOWL dive helmet from THE DEEP: glass bowl, brass collar with 6 bolts, a valve at the back, a shine
    const g = G(P.head, pt.helmet, 0, 0.08, 0.1), brass = toon(pt.helmet.col, { emissive: new THREE.Color('#4a3008'), emissiveIntensity: 0.2 });
    const glass = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 24), new THREE.MeshPhongMaterial({ color: '#d8f4ff', transparent: true, opacity: 0.16, shininess: 110, specular: new THREE.Color('#ffffff'), depthWrite: false, side: THREE.DoubleSide })); glass.renderOrder = 5; g.add(glass);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false })); shine.scale.set(1, 0.55, 0.3); shine.position.set(-0.36, 0.42, 0.55); shine.renderOrder = 6; g.add(shine);
    M(new THREE.TorusGeometry(0.62, 0.1, 8, 28), brass, 0, -0.66, 0, g, 0.02, 0.72).rotation.x = Math.PI / 2;
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; M(new THREE.SphereGeometry(0.06, 8, 6), brass, Math.cos(a) * 0.62, -0.58, Math.sin(a) * 0.62, g, 0); }
    const valve = M(new THREE.CylinderGeometry(0.09, 0.09, 0.22, 10), brass, 0, -0.5, -0.72, g, 0.012); valve.rotation.x = Math.PI / 2; }
  else if (pt.helmet.on && P.head && pt.helmet.style === 'eva') {   // a sealed bubble helmet over the whole head (ears inside), a metal neck ring, a gold sun visor up top, lamps either side
    let sk = null; P.head.children.forEach(o => { if (sk || !o.isMesh) return; const gg = o.geometry; if (!gg.boundingSphere) gg.computeBoundingSphere(); const r = gg.boundingSphere.radius; if (r > 0.33 && r < 0.5) sk = o; });
    const g = G(P.head, pt.helmet, 0, 0.1, 0.04), R2 = 0.74, dk = toon('#7a828c');
    const glass = new THREE.Mesh(new THREE.SphereGeometry(R2, 40, 28), new THREE.MeshPhongMaterial({ color: '#dff4ff', transparent: true, opacity: 0.12, shininess: 120, specular: new THREE.Color('#ffffff'), depthWrite: false, side: THREE.DoubleSide }));
    glass.renderOrder = 5; g.add(glass);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(R2 * 1.002, 24, 12, -0.9, 0.7, 0.55, 0.5), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide })); shine.renderOrder = 6; g.add(shine);
    const ring = M(new THREE.TorusGeometry(R2 * 0.66, 0.07, 10, 36), toon(pt.helmet.col), 0, -R2 * 0.74, 0, g, 0.01); ring.rotation.x = Math.PI / 2;
    const ring2 = M(new THREE.TorusGeometry(R2 * 0.68, 0.025, 6, 36), toon('#ff8a2a'), 0, -R2 * 0.68, 0, g, 0); ring2.rotation.x = Math.PI / 2;
    const vis = new THREE.Mesh(new THREE.SphereGeometry(R2 * 1.01, 32, 14, -1.1, 2.2, 0.12, 0.62), new THREE.MeshToonMaterial({ color: '#e6b45a', emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.3, gradientMap: grad0(), transparent: true, opacity: 0.85, side: THREE.DoubleSide })); vis.renderOrder = 6; g.add(vis);
    for (const s of [-1, 1]) { const lp = new THREE.Group(); lp.position.set(s * R2 * 0.8, -R2 * 0.3, R2 * 0.32); lp.rotation.y = s * 0.7; g.add(lp);
      M(new THREE.BoxGeometry(0.09, 0.09, 0.08), toon(pt.helmet.col), 0, 0, 0, lp, 0.008); const ln = new THREE.Mesh(new THREE.CircleGeometry(0.03, 14), new THREE.MeshBasicMaterial({ color: '#fff6c8' })); ln.position.z = 0.042; lp.add(ln); }
    M(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 6), dk, R2 * 0.55, R2 * 0.75, -R2 * 0.2, g, 0).rotation.z = -0.3; }
  else if (pt.helmet.on && P.head && pt.helmet.style === 'shell') {   // s608 polished: a scallop-shell helm, ribs fanning back from the brow, a wavy rim, the back drops over the nape; pearl + sea-glass fin
    let sk = null; P.head.children.forEach(o => { if (sk || !o.isMesh) return; const gg = o.geometry; if (!gg.boundingSphere) gg.computeBoundingSphere(); const r = gg.boundingSphere.radius; if (r > 0.33 && r < 0.5) sk = o; });
    const sx = sk ? sk.scale.x : 1, sy = sk ? sk.scale.y : 1, base = new THREE.Color(pt.helmet.col), coral = new THREE.Color('#ff6f5e');
    const g = G(P.head, pt.helmet, 0, -0.05, 0.02); g.rotation.x = -0.2; const fit = new THREE.Group(); fit.scale.set(sx * 1.09, sy * 1.02, 1.11); g.add(fit);
    const N = 14;   // ribs
    { const hg = new THREE.SphereGeometry(0.42, 56, 18, 0, Math.PI * 2, 0, Math.PI * 0.4), hp = hg.attributes.position, cols = [];
      for (let k = 0; k < hp.count; k++) { let x = hp.getX(k), y = hp.getY(k), z = hp.getZ(k); const az = Math.atan2(x, z), wave = Math.cos(az * N), rib = Math.pow(Math.abs(wave), 0.6) * Math.sign(wave), lo = Math.min(1, (0.42 - y) * 3.2);
        const f = 1 + 0.07 * rib * lo; x *= f; z *= f;
        if (y < 0.2) y += 0.02 * Math.cos(az * N) * Math.min(1, (0.2 - y) * 8);   // the wavy, scalloped rim
        if (z < -0.12 && y < 0.3) y -= (0.3 - y) * ((-z - 0.12) / 0.3) * 0.75;   // drop over the nape (back only)
        hp.setXYZ(k, x, y, z); const c = base.clone().lerp(coral, Math.max(0, rib) * 0.9 * Math.min(1, lo * 1.4)); cols.push(c.r, c.g, c.b); }
      hg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); hg.computeVertexNormals();
      M(hg, new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: grad0() }), 0, 0, 0, fit, 0.016); }
    // the hinge "ears" of a scallop at the brow + a pearl in them
    { const rim = M(new THREE.TorusGeometry(0.405, 0.022, 6, 32, Math.PI * 1.05), toon('#' + coral.getHexString()), 0, 0.165, 0, fit, 0); rim.rotation.set(Math.PI / 2, 0, -Math.PI * 0.025); }   // the brow band, front half only
    M(new THREE.SphereGeometry(0.05, 14, 12), new THREE.MeshToonMaterial({ color: '#f6fbff', emissive: new THREE.Color('#5fd6c8'), emissiveIntensity: 0.25, gradientMap: grad0() }), 0, 0.2, 0.4, fit, 0.006);
    const fin = new THREE.Shape(); fin.moveTo(0.06, 0); fin.quadraticCurveTo(0.08, 0.2, -0.14, 0.28); fin.quadraticCurveTo(-0.1, 0.12, -0.3, 0.0); fin.lineTo(0.06, 0);
    const fm = new THREE.Mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 1 }), new THREE.MeshToonMaterial({ color: '#5fd6c8', emissive: new THREE.Color('#2aa89c'), emissiveIntensity: 0.35, transparent: true, opacity: 0.9 }));
    fm.position.set(-0.025, 0.38, 0.02); fm.rotation.y = Math.PI / 2; fit.add(fm); }
  else if (pt.helmet.on && P.head && pt.helmet.style === 'furhood') {   // a quilted snow hood with a fur rim round the face, ski goggles pushed up on the brow, a pom-pom
    let sk = null; P.head.children.forEach(o => { if (sk || !o.isMesh) return; const gg = o.geometry; if (!gg.boundingSphere) gg.computeBoundingSphere(); const r = gg.boundingSphere.radius; if (r > 0.33 && r < 0.5) sk = o; });
    const sx = sk ? sk.scale.x : 1, sy = sk ? sk.scale.y : 1, m = toon(pt.helmet.col, { side: THREE.DoubleSide }), g = G(P.head, pt.helmet, 0, -0.04, 0.0); g.rotation.x = -0.16;
    const fit = new THREE.Group(); fit.scale.set(sx * 1.1, sy * 1.04, 1.12); g.add(fit);
    { const hg = new THREE.SphereGeometry(0.42, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), hp = hg.attributes.position;   // the back of the hood drops down over the nape
      for (let k = 0; k < hp.count; k++) { const z = hp.getZ(k), y = hp.getY(k); if (z < 0 && y < 0.3) hp.setY(k, y - (0.3 - y) * (-z / 0.42) * 1.1); } hg.computeVertexNormals(); M(hg, m, 0, 0, 0, fit, 0.016); }
    for (const y of [0.22, 0.31]) { const q = M(new THREE.TorusGeometry(Math.sqrt(0.43 * 0.43 - y * y) + 0.006, 0.014, 6, 30), toon('#' + new THREE.Color(pt.helmet.col).multiplyScalar(0.8).getHexString()), 0, y, 0, fit, 0); q.rotation.x = Math.PI / 2; }
    const rim = M(new THREE.TorusGeometry(0.38, 0.06, 8, 28), fur(), 0, 0.12, 0.05, fit, 0.01); rim.rotation.set(Math.PI / 2 - 0.25, 0, 0); rim.scale.set(1.05, 1, 1);
    const gog = new THREE.Group(); gog.position.set(0, 0.31, 0.33); gog.rotation.x = -0.85; fit.add(gog);
    const strap = M(new THREE.TorusGeometry(0.31, 0.02, 6, 30), toon('#2a2826'), 0, 0, -0.29, gog, 0); strap.rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) { M(new THREE.CylinderGeometry(0.085, 0.085, 0.04, 18), toon('#2a2826'), s * 0.1, 0, 0, gog, 0.008).rotation.x = Math.PI / 2;
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.07, 18), new THREE.MeshToonMaterial({ color: '#ffb84a', emissive: new THREE.Color('#ff8a2a'), emissiveIntensity: 0.35 })); lens.position.set(s * 0.1, 0, 0.022); gog.add(lens); }
    M(new THREE.SphereGeometry(0.075, 10, 8), fur(), 0, 0.45, -0.06, fit, 0.01, 0.075); }
  else if (pt.helmet.on && P.head && pt.helmet.style === 'wrap') {   // a wound desert head-wrap with a brass band and a turquoise stone, a sun tail down the back; ears come through
    let sk = null; P.head.children.forEach(o => { if (sk || !o.isMesh) return; const gg = o.geometry; if (!gg.boundingSphere) gg.computeBoundingSphere(); const r = gg.boundingSphere.radius; if (r > 0.33 && r < 0.5) sk = o; });
    const sx = sk ? sk.scale.x : 1, sy = sk ? sk.scale.y : 1, m = toon(pt.helmet.col, { side: THREE.DoubleSide }), m2 = toon('#' + new THREE.Color(pt.helmet.col).multiplyScalar(0.84).getHexString(), { side: THREE.DoubleSide });
    const g = G(P.head, pt.helmet, 0, -0.04, 0.01); g.rotation.x = -0.18; const fit = new THREE.Group(); fit.scale.set(sx * 1.08, sy * 1.02, 1.1); g.add(fit);
    M(new THREE.SphereGeometry(0.42, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.4), m, 0, 0, 0, fit, 0.016, 0.42);
    for (let k = 0; k < 4; k++) { const y = 0.14 + k * 0.065, r = Math.sqrt(Math.max(0.01, 0.42 * 0.42 - y * y)) + 0.01, tw = M(new THREE.TorusGeometry(r, 0.028, 6, 30), k % 2 ? m : m2, 0, y, 0, fit, 0); tw.rotation.set(Math.PI / 2, 0, 0); }
    { const nape = M(new THREE.CylinderGeometry(0.42, 0.41, 0.26, 24, 1, true, Math.PI * 0.55, Math.PI * 0.9), toon(pt.helmet.col, { side: THREE.DoubleSide }), 0, 0.06, 0, fit, 0.01); }
    const band = M(new THREE.TorusGeometry(0.4, 0.022, 6, 32), brass, 0, 0.13, 0, fit, 0); band.rotation.x = Math.PI / 2;
    M(new THREE.OctahedronGeometry(0.045, 0), crys('#2ab0c8'), 0, 0.2, 0.39, fit, 0.008).scale.set(1, 1.2, 0.5);
    const tail = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.55, 2, 6), m); tail.position.set(0.05, -0.12, -0.4); tail.rotation.set(0.18, 0, 0.06); fit.add(tail);
    { const p = tail.geometry.attributes.position; for (let k = 0; k < p.count; k++) p.setZ(k, -Math.pow(0.3 - p.getY(k), 2) * 0.5); tail.geometry.computeVertexNormals(); } }
  else if (pt.helmet.on && P.head && pt.helmet.style === 'ranger') {   // s608 LEAF HAT (Ben loves it): big leaves wrapped round the head like a forest cap, a curled stem on top, short leaves at the front so the eyes stay clear
    let sk = null; P.head.children.forEach(o => { if (sk || !o.isMesh) return; const gg = o.geometry; if (!gg.boundingSphere) gg.computeBoundingSphere(); const r = gg.boundingSphere.radius; if (r > 0.33 && r < 0.5) sk = o; });
    const sx = sk ? sk.scale.x : 1, sy = sk ? sk.scale.y : 1, g = G(P.head, pt.helmet, 0, -0.01, -0.03); g.rotation.x = -0.14;
    const fit = new THREE.Group(); fit.scale.set(sx * 1.06, sy * 1.02, 1.08); g.add(fit);
    const base = new THREE.Color(pt.helmet.col), cA = base.clone(), cB = base.clone().multiplyScalar(0.78), cL = base.clone().lerp(new THREE.Color('#b8d86a'), 0.35), vein = base.clone().multiplyScalar(0.55);
    const mat = c => new THREE.MeshToonMaterial({ color: c, gradientMap: grad0(), side: THREE.DoubleSide });
    // a leaf shape wrapped onto a sphere of radius R: x = across, y = along. Cupped in the middle, the tip flares out.
    const leafGeo = (R, L, w, flare, ph0 = 0.06) => { const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(w * 0.9, L * 0.18, w, L * 0.55, 0, L); s.bezierCurveTo(-w, L * 0.55, -w * 0.9, L * 0.18, 0, 0);
      const geo = new THREE.ShapeGeometry(s, 10), p = geo.attributes.position;
      for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k), f = y / L, phi = ph0 + y / R, cup = 0.022 * (1 - Math.min(1, (2 * x / w) ** 2)), r = R + cup + flare * f * f * f, az = x / (R * Math.sin(Math.max(phi, 0.12)));
        p.setXYZ(k, r * Math.sin(phi) * Math.sin(az), r * Math.cos(phi), r * Math.sin(phi) * Math.cos(az)); }
      geo.computeVertexNormals(); return geo; };
    const veinGeo = (R, L) => leafGeo(R + 0.004, L * 0.92, 0.014, 0, 0.08);
    const ring = (n, R, len, wid, col, off, flareF) => { for (let k = 0; k < n; k++) { const a = (k + off) / n * Math.PI * 2, fr = Math.cos(a), L = len(fr), piv = new THREE.Group(); piv.rotation.y = a; fit.add(piv);
      const lf = new THREE.Mesh(leafGeo(R, L, wid, flareF(fr)), mat(col(k))); piv.add(lf); const v = new THREE.Mesh(veinGeo(R + 0.003, L), mat(vein)); piv.add(v); } };
    // a green cap under the leaves so no fur shows through the gaps (back reaches lower than the front)
    { const capG = new THREE.SphereGeometry(0.445, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), cp = capG.attributes.position;
      for (let k = 0; k < cp.count; k++) { const z = cp.getZ(k), y = cp.getY(k); if (z < 0 && y < 0.3) cp.setY(k, y - (0.3 - y) * (-z / 0.445) * 0.9); } capG.computeVertexNormals();
      fit.add(new THREE.Mesh(capG, mat(cB))); }
    // under layer: long leaves round the back + sides, short over the face
    ring(9, 0.455, fr => fr > 0.55 ? 0.36 : 0.7 - Math.max(0, fr) * 0.22, 0.17, k => k % 2 ? cB : cA, 0.5, fr => fr > 0.55 ? 0.05 : 0.07);
    // top layer: shorter, lighter leaves between them
    ring(7, 0.47, fr => fr > 0.6 ? 0.28 : 0.48, 0.14, k => k % 2 ? cL : cA, 0, fr => fr > 0.6 ? 0.06 : 0.05);
    // the crown: a curled stem with two sprouts
    const curve = new THREE.CatmullRomCurve3([[0, 0.46, 0], [0.01, 0.54, -0.02], [0.04, 0.61, -0.05], [0.09, 0.64, -0.04], [0.11, 0.61, 0.0]].map(q => new THREE.Vector3(...q)));
    fit.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.016, 6), mat(new THREE.Color('#6b4a2c'))));
    for (const [rx, rz, ry] of [[-0.5, 0.6, 0.3], [-0.4, -0.7, -0.5]]) { const s = new THREE.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(0.045, 0.06, 0, 0.12); s.quadraticCurveTo(-0.045, 0.06, 0, 0);
      const sp = new THREE.Mesh(new THREE.ShapeGeometry(s, 6), mat(cL)); sp.position.set(0.015, 0.56, -0.025); sp.rotation.set(rx, ry, rz); fit.add(sp); }
    // a gold acorn pin above the brow
    const acorn = new THREE.Group(); acorn.position.set(0.13, 0.36, 0.32); acorn.rotation.set(-0.6, 0, -0.3); fit.add(acorn);
    M(new THREE.SphereGeometry(0.032, 10, 8), toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.3 }), 0, -0.012, 0, acorn, 0.006).scale.set(1, 1.25, 1);
    M(new THREE.SphereGeometry(0.036, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), toon('#8a5a2c'), 0, 0.006, 0, acorn, 0.006); }
  else if (pt.helmet.on && P.head && pt.helmet.style === 'miner') {   // a yellow hard hat with a wide brim, a centre ridge and a headlamp that glows
    let sk = null; P.head.children.forEach(o => { if (sk || !o.isMesh) return; const gg = o.geometry; if (!gg.boundingSphere) gg.computeBoundingSphere(); const r = gg.boundingSphere.radius; if (r > 0.33 && r < 0.5) sk = o; });
    const sx = sk ? sk.scale.x : 1, sy = sk ? sk.scale.y : 1, m = toon(pt.helmet.col), g = G(P.head, pt.helmet, 0, -0.05, 0.03); g.rotation.x = -0.2;
    const fit = new THREE.Group(); fit.scale.set(sx * 1.09, sy * 1.02, 1.12); g.add(fit);
    const TH = Math.PI * 0.36; M(new THREE.SphereGeometry(0.4, 28, 14, 0, Math.PI * 2, 0, TH), m, 0, 0, 0, fit, 0.018, 0.4);
    const ry = 0.4 * Math.cos(TH), rr2 = 0.4 * Math.sin(TH);
    const brim = M(new THREE.CylinderGeometry(rr2 + 0.09, rr2 + 0.11, 0.025, 32), m, 0, ry, 0.03, fit, 0.012); brim.scale.z = 1.15;
    const ridge = M(new THREE.TorusGeometry(0.405, 0.03, 6, 24, Math.PI * 0.62), m, 0, 0, 0, fit, 0.01); ridge.rotation.set(0, Math.PI / 2, Math.PI * 0.19);
    const lamp = new THREE.Group(); lamp.position.set(0, ry + 0.1, 0.38); lamp.rotation.x = 0.35; fit.add(lamp);
    M(new THREE.CylinderGeometry(0.06, 0.07, 0.07, 14), toon('#2a2826'), 0, 0, 0, lamp, 0.01).rotation.x = Math.PI / 2;
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), new THREE.MeshBasicMaterial({ color: '#fff6c8' })); lens.position.z = 0.037; lamp.add(lens);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.11, 18), new THREE.MeshBasicMaterial({ color: '#ffe27a', transparent: true, opacity: 0.35, depthWrite: false })); glow.position.z = 0.04; lamp.add(glow); }
  else if (pt.helmet.on && P.head && pt.helmet.style === 'cone') {   // a pointed brass cone helm with a lapis band and a small neck guard
    let sk = null; P.head.children.forEach(o => { if (sk || !o.isMesh) return; const gg = o.geometry; if (!gg.boundingSphere) gg.computeBoundingSphere(); const r = gg.boundingSphere.radius; if (r > 0.33 && r < 0.5) sk = o; });
    const sx = sk ? sk.scale.x : 1, sy = sk ? sk.scale.y : 1, m = toon(pt.helmet.col), g = G(P.head, pt.helmet, 0, 0.08, 0.0); g.rotation.x = -0.26;
    const fit = new THREE.Group(); fit.scale.set(sx * 1.08, sy, 1.1); g.add(fit);
    const prof = [[0.4, 0.06], [0.405, 0.14], [0.37, 0.24], [0.29, 0.36], [0.18, 0.47], [0.07, 0.56], [0.012, 0.62], [0, 0.63]].map(([x, y]) => new THREE.Vector2(x, y));
    M(new THREE.LatheGeometry(prof, 28), m, 0, 0, 0, fit, 0.018);
    const band = M(new THREE.TorusGeometry(0.405, 0.035, 8, 36), toon(set.accent || '#3a6fd0'), 0, 0.1, 0, fit, 0); band.rotation.x = Math.PI / 2;
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; M(new THREE.SphereGeometry(0.018, 6, 4), toon('#e6b45a'), Math.sin(a) * 0.43, 0.1, Math.cos(a) * 0.43, fit, 0); }
    const ng = M(new THREE.CylinderGeometry(0.41, 0.44, 0.12, 24, 1, true, Math.PI * 0.55, Math.PI * 0.9), toon(pt.helmet.col, { side: THREE.DoubleSide }), 0, 0.02, 0, fit, 0.01); ng.rotation.y = Math.PI; }
  else if (pt.helmet.on && P.head && pt.helmet.style === 'circlet') {   // a gold circlet on the brow with a rising crystal: the ears + hair stay free
    let sk = null; P.head.children.forEach(o => { if (sk || !o.isMesh) return; const gg = o.geometry; if (!gg.boundingSphere) gg.computeBoundingSphere(); const r = gg.boundingSphere.radius; if (r > 0.33 && r < 0.5) sk = o; });
    const sx = sk ? sk.scale.x : 1, sy = sk ? sk.scale.y : 1;
    { const cg = G(P.head, pt.helmet, 0, -0.07, 0.04); cg.rotation.x = -0.22; const fit = new THREE.Group(); fit.scale.set(sx * 1.08, sy * 1.0, 1.1); cg.add(fit);   // the cap: a violet dome under the circlet
      const capM = toon(set.torso[1] || '#6e40b0'), TH = Math.PI * 0.34;
      M(new THREE.SphereGeometry(0.4, 28, 14, 0, Math.PI * 2, 0, TH), capM, 0, 0, 0, fit, 0.018, 0.4);
      const ridge = M(new THREE.TorusGeometry(0.412, 0.022, 6, 24, Math.PI * 0.6), gold0, 0, 0, 0, fit, 0); ridge.rotation.set(0, Math.PI / 2, Math.PI * 0.2);
      const knob = M(new THREE.OctahedronGeometry(0.05, 0), crys(set.accent || '#9fe6ff'), 0, 0.42, -0.02, fit, 0.008); knob.scale.set(0.8, 1.4, 0.8); }
    const g = G(P.head, pt.helmet, 0, 0.15, 0.02); g.rotation.x = -0.32;
    const band = M(new THREE.TorusGeometry(0.345, 0.03, 8, 40), toon(pt.helmet.col, { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.25 }), 0, 0, 0, g, 0); band.rotation.x = Math.PI / 2; band.scale.set(sx * 1.04, 1.08, 1);
    const cr = M(new THREE.OctahedronGeometry(0.07, 0), crys(set.accent || '#9fe6ff'), 0, 0.08, 0.35, g, 0.01); cr.scale.set(0.7, 1.7, 0.5);
    for (const s of [-1, 1]) { const c = M(new THREE.OctahedronGeometry(0.04, 0), crys(set.accent || '#9fe6ff'), s * 0.13, 0.04, 0.33, g, 0.008); c.scale.set(0.7, 1.3, 0.5); c.rotation.z = s * 0.35; } }
  else if (pt.helmet.on && P.head) {   // s608 fitted to the fox's own skull: snug cap, front edge above the eyes, lower at the back, ears come out over it
    let sk = null; P.head.children.forEach(o => { if (sk || !o.isMesh) return; const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); const r = g.boundingSphere.radius; if (r > 0.33 && r < 0.5) sk = o; });
    const sx = sk ? sk.scale.x : 1, sy = sk ? sk.scale.y : 1, R0 = 0.4, m = toon(pt.helmet.col), gold = toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.25 });
    const g = G(P.head, pt.helmet, 0, -0.07, 0.04); g.rotation.x = -0.22;
    const fit = new THREE.Group(); fit.scale.set(sx * 1.09, sy * 1.01, 1.12); g.add(fit);
    const TH = Math.PI * 0.36, cap = M(new THREE.SphereGeometry(R0, 28, 14, 0, Math.PI * 2, 0, TH), m, 0, 0, 0, fit, 0.018, R0);
    const ry = R0 * Math.cos(TH), rr2 = R0 * Math.sin(TH);
    const rim = M(new THREE.TorusGeometry(rr2, 0.024, 8, 40), gold, 0, ry, 0, fit, 0); rim.rotation.x = Math.PI / 2;
    const ridge = M(new THREE.TorusGeometry(R0 + 0.012, 0.028, 6, 24, Math.PI * 0.62), m, 0, 0, 0, fit, 0.01); ridge.rotation.set(0, Math.PI / 2, Math.PI * 0.19);
    const brow = M(new THREE.TorusGeometry(rr2 + 0.01, 0.034, 8, 20, Math.PI * 0.5), gold, 0, ry - 0.005, 0, fit, 0); brow.rotation.set(Math.PI / 2, 0, Math.PI * 0.25);
  }
  if (pt.gloves.on && set.space) for (const arm of P.arms || []) {   // s608 EVA GLOVES: a sealed glove over the whole paw, a ribbed cuff + a metal wrist ring
    const g = G(arm, pt.gloves, 0, -0.32, 0), m = toon(pt.gloves.col), dk = toon('#7a828c'), wh = toon('#f4f5f7');
    M(new THREE.CylinderGeometry(0.09, 0.08, 0.16, 14), m, 0, 0.02, 0, g, 0.015, 0.09);
    for (const y of [0.07, 0.02, -0.03]) M(new THREE.TorusGeometry(0.088, 0.01, 5, 16), toon('#' + new THREE.Color(pt.gloves.col).multiplyScalar(0.8).getHexString()), 0, y, 0, g, 0).rotation.x = Math.PI / 2;
    const wr = M(new THREE.TorusGeometry(0.084, 0.02, 6, 18), dk, 0, 0.1, 0, g, 0); wr.rotation.x = Math.PI / 2;
    // the sealed GLOVE over the paw: fixed to the fox's paw fist (fox-kit pawFist: arm y -0.4, z +0.01), so Ben's cuff can move up the arm without moving the glove
    const sd = arm.position.x >= 0 ? 1 : -1, hg = new THREE.Group(); hg.position.set(0, -0.4, 0.01); arm.add(hg); u.armorAdd.push(hg);
    const gl = toon(set.torso[0] || '#f4f5f7'), gr = toon(pt.gloves.col);
    const palm = M(new THREE.SphereGeometry(0.1, 16, 12), gl, 0, 0.005, -0.01, hg, 0.014, 0.1); palm.scale.set(1.06, 1.06, 0.97);
    for (let k2 = 0; k2 < 4; k2++) { const x = (k2 - 1.5) * 0.042; M(new THREE.SphereGeometry(0.034, 10, 8), gl, x, -0.025, 0.072, hg, 0.007, 0.034); M(new THREE.SphereGeometry(0.03, 8, 6), gl, x * 0.95, -0.07, 0.05, hg, 0.006, 0.03); }
    const th = M(new THREE.CapsuleGeometry(0.03, 0.055, 4, 8), gl, -sd * 0.055, -0.01, 0.075, hg, 0.006); th.rotation.set(0.2, 0, sd * 0.6);
    const ring = M(new THREE.TorusGeometry(0.098, 0.022, 6, 18), gr, 0, 0.08, 0, hg, 0); ring.rotation.x = Math.PI / 2;
    M(new THREE.CylinderGeometry(0.098, 0.1, 0.08, 14), gl, 0, 0.12, 0, hg, 0.01, 0.1); }
  else if (pt.gloves.on) for (const arm of P.arms || []) { const g = G(arm, pt.gloves, 0, -0.32, 0), m = toon(pt.gloves.col);
    M(new THREE.CylinderGeometry(0.085, 0.07, 0.14, 12), m, 0, 0, 0, g, 0.015, 0.085); M(new THREE.TorusGeometry(0.083, 0.012, 6, 16), toon('#e6b45a'), 0, 0.07, 0, g, 0).rotation.x = Math.PI / 2; }
  if (set.space && P.tail) {   // s608 EVA TAIL SLEEVE: the suit carries on down the tail, ribbed bands, a cap on the tip
    const tm = P.tail.children.find(o => o.isMesh); if (tm) { const wh = toon(set.torso[0]), dk = toon('#7a828c'), org = toon('#ff8a2a');
      const sl = new THREE.Mesh(tm.geometry, wh); sl.position.copy(tm.position); sl.rotation.copy(tm.rotation); sl.scale.copy(tm.scale).multiplyScalar(1.07); add(P.tail, sl);
      const ol = new THREE.Mesh(tm.geometry, new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide })); ol.scale.setScalar(1.03); sl.add(ol);
      tm.geometry.computeBoundingBox(); const bb = tm.geometry.boundingBox, len = bb.max.z - bb.min.z || 0.6;
      for (let k = 0; k < 3; k++) { const z = bb.max.z - len * (0.18 + k * 0.22), r = 0.09 + (k === 1 ? 0.02 : 0); const b2 = new THREE.Mesh(new THREE.TorusGeometry(r, 0.016, 6, 18), k === 1 ? org : dk); b2.position.set(0, (bb.min.y + bb.max.y) / 2, z); sl.add(b2); } } }
  if (pt.belt.on) { const g = G(P.body, pt.belt, 0, 0.64, 0), m = toon(pt.belt.col);
    const b = M(new THREE.TorusGeometry(0.29, 0.035, 8, 32), m, 0, 0, 0, g, 0.012); b.rotation.x = Math.PI / 2; b.scale.set(1, 1.1, 1);
    M(new THREE.BoxGeometry(0.11, 0.09, 0.04), toon('#e6b45a'), 0, 0, 0.32, g, 0.012); }
  if (pt.boots.on && set.water) for (const leg of P.legs || []) {   // swim FINS
    const g = G(leg, pt.boots, 0, -0.42, 0.06), m = toon(pt.boots.col, { side: THREE.DoubleSide });
    M(new THREE.CylinderGeometry(0.1, 0.11, 0.12, 12), toon('#201e1d'), 0, 0.04, -0.04, g, 0.01, 0.1);
    const fs = new THREE.Shape(); fs.moveTo(-0.1, 0); fs.lineTo(0.1, 0); fs.lineTo(0.17, 0.42); fs.quadraticCurveTo(0, 0.36, -0.17, 0.42); fs.lineTo(-0.1, 0);
    const fin = M(new THREE.ExtrudeGeometry(fs, { depth: 0.02, bevelEnabled: false }), m, 0, -0.03, 0.02, g, 0.006); fin.rotation.x = Math.PI / 2 - 0.15; }
  else if (pt.boots.on) for (const leg of P.legs || []) { const g = G(leg, pt.boots, 0, -0.3, 0.01), m = toon(pt.boots.col);
    M(new THREE.CylinderGeometry(0.12, 0.11, 0.16, 12), m, 0, 0, 0, g, 0.015, 0.12); M(new THREE.BoxGeometry(0.08, 0.1, 0.05), m, 0, 0.02, 0.12, g, 0.012); }
  if (pt.cape.on) { const g = G(P.body, pt.cape, 0, 1.2, -0.3), m = toon(pt.cape.col, { side: THREE.DoubleSide });
    const geo = new THREE.PlaneGeometry(0.62, 0.95, 4, 8); geo.translate(0, -0.475, 0); const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i); pos.setZ(i, -Math.abs(x) * 0.25 + y * 0.12); pos.setX(i, x * (1 - y * 0.35)); } geo.computeVertexNormals();
    const c = M(geo, m, 0, 0, 0, g, 0); u.cape = { mesh: c, base: Float32Array.from(pos.array) };
    M(new THREE.CylinderGeometry(0.035, 0.035, 0.66, 8), toon('#e6b45a'), 0, 0, 0, g, 0).rotation.z = Math.PI / 2; }
}
// a cape that sways: call each frame
export function tickArmor(fox, t) { const fx = fox && fox.userData.armorFx; if (fx) for (const f of fx) f(t);   // s732 animated armour parts (fly scarf + jets)
 const bc = fox && fox.userData.evaBeacon; if (bc) bc.visible = (t % 1.4) < 0.25; const c = fox && fox.userData.cape; if (!c) return; const p = c.mesh.geometry.attributes.position, a = p.array, B = c.base;
  for (let i = 0; i < p.count; i++) { const k = i * 3, d = -B[k + 1]; a[k + 2] = B[k + 2] - d * 0.08 * (1 + Math.sin(t * 2.2 + d * 3)) ; a[k] = B[k] + Math.sin(t * 1.7 + d * 4) * 0.015 * d; } p.needsUpdate = true; }

// ---------- s608 HUMAN ARMOUR (Kyoto only): Ben in human form (the sumo). Built from engine/human-kit.js cfg.yoroi, piece by piece. ----------
// The look comes from the Human Workshop (localStorage 8gates.humans.v1), starting in his SUMO STREET CLOTHES (preset bensumoClothes1).
// This armour + its KYOTO GEMS stay in Kyoto: they can't leave the Kyoto map (kyotoOnly).
export const HUMAN_KEY = 'armor.human.v1';
export const HUMAN_LOOKS = [['kateClothes', 'KATE · STREET CLOTHES'], ['katesumo', 'KATE · ONNA-ZUMO'], ['bensumoClothes1', 'SUMO STREET CLOTHES'], ['bensumo', 'MAWASHI'], ['benjinbei', 'JINBEI'], ['benhappi', 'HAPPI'], ['bensamue', 'SAMUE']];
export const YOROI_PARTS = [['kabuto', 'KABUTO (HELMET)', 'helmet'], ['do', 'DO (CHEST)', 'chest'], ['sode', 'SODE (SHOULDERS)', 'shoulders'], ['kote', 'KOTE (SLEEVES)', 'gloves'], ['suneate', 'SUNEATE (SHINS)', 'boots'], ['kusazuri', 'KUSAZURI (SKIRT PLATES)', null], ['swords', 'KATANA + WAKIZASHI', null]];
export const VEGAS_PARTS = [['hat', 'FEDORA', 'helmet'], ['shades', 'AVIATOR SHADES', null], ['jacket', 'STAGE JACKET', 'chest'], ['cape', 'RHINESTONE CAPE', 'shoulders'], ['wraps', 'FIGHT WRAPS', 'gloves'], ['kicks', 'HIGH-TOPS', 'boots'], ['belt', 'CHAMPION BELT', null], ['chain', 'GOLD CHAIN', null], ['suit', 'DINNER JACKET', 'chest'], ['tie', 'TIE', 'shoulders'], ['square', 'POCKET SQUARE', null], ['watch', 'GOLD WATCH', 'gloves'], ['shoes', 'OXFORDS', 'boots']];
export const VEGAS_COLS = { hat: '#2a2826', shades: '#e6b45a', jacket: '#f3f2f2', cape: '#f3f2f2', wraps: '#ec3013', kicks: '#f3f2f2', belt: '#2a1a12', chain: '#e6b45a', suit: '#1b1f3a', tie: '#0c0c12', square: '#e6b45a', watch: '#e6b45a', shoes: '#121216' };
export const VEGAS_STYLES = { shades: [['aviator', 'AVIATOR'], ['round', 'ROUND'], ['star', 'STAR'], ['visor', 'VISOR']], tie: [['bow', 'BOW TIE'], ['tie', 'TIE'], ['open', 'OPEN COLLAR']] };
export const HUMAN_DEFAULTS_ARMOR = {
  street: { id: 'street', name: 'STREET CLOTHES', from: 'What Ben arrives in', world: 'kyoto', kyotoOnly: true, armor: 4, kg: 2, look: 'bensumoClothes1', yoroi: null },
  kyoto: { id: 'kyoto', name: 'KYOTO O-YOROI', from: 'The Kyoto Armourer · Samurai Barracks', world: 'kyoto', kyotoOnly: true, armor: 36, kg: 16, look: 'bensumoClothes1',
    price: { helmet: 30, chest: 46, shoulders: 32, gloves: 22, boots: 18 },
    yoroi: { kabuto: true, do: true, sode: true, kote: true, suneate: true, kusazuri: true, swords: true, lacquer: '#7a1c1c', lace: '#e6b45a', cloth: '#1f2a44' } },
  // s608 EARTH · LAS VEGAS: the Strip after dark. A headliner's rhinestone stage jacket + cape, a heavyweight champion belt, fedora + aviators, fight wraps, high-tops.
  vegas: { id: 'vegas', name: 'VEGAS HEADLINER', from: 'The Strip · Earth', world: 'earth', earthOnly: true, armor: 28, kg: 9, look: 'bensumoClothes1',
    price: { helmet: 28, chest: 52, shoulders: 34, gloves: 18, boots: 24 },
    vegas: { list: ['hat', 'shades', 'jacket', 'cape', 'wraps', 'kicks', 'belt', 'chain'], hat: true, shades: true, jacket: true, cape: true, wraps: true, kicks: true, belt: true, chain: true, main: '#f3f2f2', gold: '#e6b45a', trim: '#ec3013', hatCol: '#2a2826', fit: { shades: { style: 'aviator', col2: '#2a2a3a' } } } },
  // s608 EARTH · THE SUIT: a niiiice midnight dinner suit for the Strip. Black satin peak lapels, bow tie, gold pocket square + watch, polished oxfords, a trilby.
  vsuit: { id: 'vsuit', name: 'VEGAS HIGH ROLLER', from: 'The tailor on the Strip · Earth', world: 'earth', earthOnly: true, armor: 18, kg: 6, look: 'bensumoClothes1',
    price: { helmet: 30, chest: 90, shoulders: 25, gloves: 40, boots: 35 },
    vegas: { list: ['hat', 'shades', 'suit', 'tie', 'square', 'watch', 'shoes', 'chain'], hat: true, shades: false, suit: true, tie: true, square: true, watch: true, shoes: true, chain: false, gold: '#e6b45a', trim: '#0c0c12', shirt: '#f6f3ec',
      fit: { hat: { col: '#1b1f3a' }, suit: { col2: '#0c0c12' }, tie: { style: 'bow' }, shades: { style: 'round', col2: '#2a2a3a' } } } } };
let _benH = false; function benHuman() { if (_benH) return; _benH = true; for (const [id, f] of Object.entries(BEN_HUMAN)) if (HUMAN_DEFAULTS_ARMOR[id]) mergeDeep(HUMAN_DEFAULTS_ARMOR[id], JSON.parse(JSON.stringify(f))); }
export function loadHumanArmor() { benHuman(); let s = {}; try { s = JSON.parse(localStorage.getItem(HUMAN_KEY) || '{}') || {}; } catch (e) {}
  const out = {}; for (const [id, d] of Object.entries(HUMAN_DEFAULTS_ARMOR)) out[id] = { ...clone(d), ...(s[id] || {}), yoroi: d.yoroi ? { ...d.yoroi, ...((s[id] || {}).yoroi || {}) } : null, vegas: d.vegas ? { ...d.vegas, ...((s[id] || {}).vegas || {}) } : null }; return out; }
export function saveHumanArmor(sets) { try { localStorage.setItem(HUMAN_KEY, JSON.stringify(sets)); } catch (e) {} }
// the human-kit cfg for a set: the look from the Human Workshop (saved edits win), then the yoroi pieces
export function humanCfg(PRESETS, set, lookId) { let store = {}; try { store = JSON.parse(localStorage.getItem('8gates.humans.v1') || '{}') || {}; } catch (e) {}
  const id = lookId || set.look || 'bensumoClothes1', base = { ...(store[id] || PRESETS[id] || PRESETS.bensumo) };
  const out = { ...base }; if (set.yoroi) Object.assign(out, { pads: !!set.yoroi.sode, helmet: false, yoroi: { ...set.yoroi } }); if (set.vegas) { out.vegas = { ...set.vegas }; if (set.vegas.jacket) out.pads = false;
    if (set.vegas.suit) { const sc = ((set.vegas.fit || {}).suit || {}).col || '#1b1f3a'; Object.assign(out, { outfit: 'casual', top: set.vegas.shirt || '#f6f3ec', bottom: sc, accent: sc, apron: false, pads: false, sandals: !set.vegas.shoes, crest: !!base.fem, theme8: !!base.fem }); } } return out; }
