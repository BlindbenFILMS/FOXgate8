// 8 GATES · SPACE TRADE (s374): the 2D TRADE table verbatim (names, lines, prices per world; '8g' = SHASTA now). Buy low, sell high.
// s599 BUILDING GOODS (Ben): GAYA TIMBER · MERU STONE · ZION METAL (mat = the Player Planet stock key t / s / m). UNLOAD them at your planet's
// Build Board: 1 crate = MAT_PER_CRATE units of planet stock (worlds/player-build.js).
export const MAT_PER_CRATE = 10;
// Price = gold per crate. DSF buys + sells everything at the average + 10 %. Hold = 10 crates (2D scout).
export const GOODS = [
 {
  "key": "zion_salt",
  "name": "ZION SALT",
  "home": "zion",
  "d": "Pan-dried flats, cut in slabs. Every galley in the nine wants it.",
  "p": {
   "shasta": 8,
   "luxor": 8,
   "ur": 5,
   "gaya": 10,
   "meru": 5,
   "zion": 3,
   "nebo": 7,
   "kufa": 6,
   "jidda": 5
  },
  "farm": "food"
 },
 {
  "key": "gaya_grain",
  "name": "GAYA GRAIN",
  "home": "gaya",
  "d": "Hard red wheat off the terraces. Keeps for a year in vacuum.",
  "p": {
   "shasta": 7,
   "luxor": 11,
   "ur": 9,
   "gaya": 3,
   "meru": 6,
   "zion": 8,
   "nebo": 7,
   "kufa": 7,
   "jidda": 8
  },
  "farm": "food"
 },
 {
  "key": "foundry_steel",
  "name": "FOUNDRY STEEL",
  "home": "shasta",
  "d": "Your own mills. Plate, beam and rod, stamped with the eight gates.",
  "p": {
   "shasta": 4,
   "luxor": 8,
   "ur": 9,
   "gaya": 9,
   "meru": 9,
   "zion": 10,
   "nebo": 16,
   "kufa": 12,
   "jidda": 14
  },
  "mat": "st"
 },
 {
  "key": "kufa_copper",
  "name": "KUFA COPPER",
  "home": "kufa",
  "d": "Drawn wire and sheet. Half the wiring in the nine started here.",
  "p": {
   "shasta": 15,
   "luxor": 12,
   "ur": 14,
   "gaya": 11,
   "meru": 9,
   "zion": 17,
   "nebo": 9,
   "kufa": 5,
   "jidda": 9
  },
  "mat": "cu"
 },
 {
  "key": "nebo_ink",
  "name": "NEBO INK",
  "home": "nebo",
  "d": "Lampblack and resin. The scribes will not write with anything else.",
  "p": {
   "shasta": 12,
   "luxor": 9,
   "ur": 11,
   "gaya": 8,
   "meru": 26,
   "zion": 29,
   "nebo": 3,
   "kufa": 11,
   "jidda": 26
  },
  "lux": true
 },
 {
  "key": "prism_glass",
  "name": "PRISM GLASS",
  "home": "luxor",
  "d": "Drawn in low orbit, flawless. Optics, ports and lenses.",
  "p": {
   "shasta": 13,
   "luxor": 7,
   "ur": 14,
   "gaya": 18,
   "meru": 14,
   "zion": 18,
   "nebo": 20,
   "kufa": 24,
   "jidda": 20
  },
  "mat": "gl"
 },
 {
  "key": "jidda_spice",
  "name": "JIDDA SPICE",
  "home": "jidda",
  "d": "Sacks off the port road, sealed hot. Worth more the further it travels.",
  "p": {
   "shasta": 28,
   "luxor": 31,
   "ur": 9,
   "gaya": 11,
   "meru": 8,
   "zion": 10,
   "nebo": 28,
   "kufa": 9,
   "jidda": 4
  },
  "lux": true
 },
 {
  "key": "ur_amber",
  "name": "UR AMBER",
  "home": "ur",
  "d": "Cut from beds older than the gates. Nobody has ever found a second seam.",
  "p": {
   "shasta": 12,
   "luxor": 9,
   "ur": 5,
   "gaya": 32,
   "meru": 10,
   "zion": 12,
   "nebo": 29,
   "kufa": 32,
   "jidda": 13
  },
  "lux": true
 },
 {
  "key": "meru_incense",
  "name": "MERU INCENSE",
  "home": "meru",
  "d": "Burned at the high shrines. The smoke is said to steady a gate.",
  "p": {
   "shasta": 27,
   "luxor": 11,
   "ur": 27,
   "gaya": 10,
   "meru": 4,
   "zion": 9,
   "nebo": 11,
   "kufa": 8,
   "jidda": 27
  },
  "lux": true
 },
 {
  "key": "gaya_timber",
  "name": "GAYA TIMBER",
  "home": "gaya",
  "d": "Terrace-grown hardwood, cut and dried. Every new world builds with it.",
  "mat": "t",
  "p": {
   "shasta": 11,
   "luxor": 13,
   "ur": 12,
   "gaya": 4,
   "meru": 10,
   "zion": 13,
   "nebo": 10,
   "kufa": 12,
   "jidda": 11
  },
  "limit": true
 },
 {
  "key": "meru_stone",
  "name": "MERU STONE",
  "home": "meru",
  "d": "Grey castle stone from the Meru quarries. Squared, stacked, ready to lay.",
  "mat": "s",
  "p": {
   "shasta": 9,
   "luxor": 9,
   "ur": 10,
   "gaya": 10,
   "meru": 3,
   "zion": 11,
   "nebo": 12,
   "kufa": 9,
   "jidda": 12
  },
  "limit": true
 },
 {
  "key": "zion_metal",
  "name": "ZION METAL",
  "home": "zion",
  "d": "Bars smelted on the salt flats. Beams, bolts and plate for building.",
  "mat": "m",
  "p": {
   "shasta": 12,
   "luxor": 14,
   "ur": 13,
   "gaya": 15,
   "meru": 13,
   "zion": 5,
   "nebo": 16,
   "kufa": 14,
   "jidda": 15
  },
  "limit": true
 },
 {
  "key": "nebo_bees",
  "name": "NEBO BEES",
  "home": "nebo",
  "d": "A live hive, queen and all. Makes honey on your planet. They will not breed: buy every hive.",
  "farm": "bees",
  "limited": true,
  "p": {
   "shasta": 110,
   "luxor": 120,
   "ur": 115,
   "gaya": 100,
   "meru": 105,
   "zion": 120,
   "nebo": 60,
   "kufa": 115,
   "jidda": 110
  }
 },
 {
  "key": "ur_clay",
  "name": "UR CLAY",
  "home": "ur",
  "mat": "cl",
  "d": "River clay off the canyon floor. A kiln turns it into brick.",
  "p": {
   "shasta": 9,
   "luxor": 10,
   "ur": 3,
   "gaya": 9,
   "meru": 11,
   "zion": 8,
   "nebo": 9,
   "kufa": 7,
   "jidda": 9
  }
 },
 {
  "key": "jidda_lime",
  "name": "JIDDA LIME",
  "home": "jidda",
  "mat": "li",
  "d": "Burnt shell and beach sand. Mix it for concrete: harbours and sea walls.",
  "p": {
   "shasta": 10,
   "luxor": 13,
   "ur": 8,
   "gaya": 10,
   "meru": 7,
   "zion": 9,
   "nebo": 11,
   "kufa": 8,
   "jidda": 3
  }
 },
 {
  "key": "nebo_rope",
  "name": "NEBO ROPE + SAILCLOTH",
  "home": "nebo",
  "mat": "ro",
  "d": "Hemp rope and woven sail off the water ring. Docks, rafts, tents.",
  "p": {
   "shasta": 11,
   "luxor": 8,
   "ur": 10,
   "gaya": 12,
   "meru": 9,
   "zion": 14,
   "nebo": 4,
   "kufa": 14,
   "jidda": 12
  }
 },
 {
  "key": "shasta_ice_core",
  "name": "SHASTA ICE CORE",
  "home": "shasta",
  "mat": "ic",
  "d": "Glacier ice cut in cores, packed cold. Coolant for power plants and refineries.",
  "p": {
   "shasta": 6,
   "luxor": 21,
   "ur": 14,
   "gaya": 16,
   "meru": 18,
   "zion": 21,
   "nebo": 17,
   "kufa": 14,
   "jidda": 18,
   "myard": 30
  }
 },
 {
  "key": "nebo_honey",
  "name": "NEBO HONEY",
  "home": "nebo",
  "farm": "food",
  "d": "Wild honey in sealed pots. It never spoils.",
  "p": {
   "shasta": 12,
   "luxor": 13,
   "ur": 10,
   "gaya": 12,
   "meru": 9,
   "zion": 15,
   "nebo": 4,
   "kufa": 10,
   "jidda": 12
  }
 },
 {
  "key": "gaya_goat",
  "name": "GAYA GOATS",
  "home": "gaya",
  "farm": "goats",
  "limited": true,
  "d": "Two hardy terrace goats. Milk and cheese. They breed in a goat shed.",
  "p": {
   "shasta": 60,
   "luxor": 67,
   "ur": 59,
   "gaya": 30,
   "meru": 58,
   "zion": 60,
   "nebo": 62,
   "kufa": 59,
   "jidda": 64
  }
 },
 {
  "key": "shasta_sheep",
  "name": "SHASTA WOOL SHEEP",
  "home": "shasta",
  "farm": "sheep",
  "limited": true,
  "d": "Thick-fleeced mountain sheep. Wool for rope and cloth. They breed in a fold.",
  "p": {
   "shasta": 30,
   "luxor": 58,
   "ur": 60,
   "gaya": 62,
   "meru": 59,
   "zion": 67,
   "nebo": 58,
   "kufa": 60,
   "jidda": 64
  }
 },
 {
  "key": "kufa_camel",
  "name": "KUFA CAMELS",
  "home": "kufa",
  "farm": "camels",
  "limited": true,
  "d": "Pack camels. Every camel speeds up building on your planet. They breed in a pen.",
  "p": {
   "shasta": 90,
   "luxor": 85,
   "ur": 82,
   "gaya": 84,
   "meru": 86,
   "zion": 83,
   "nebo": 90,
   "kufa": 45,
   "jidda": 84
  }
 },
 {
  "key": "machine_parts",
  "name": "MACHINE PARTS",
  "home": "myard",
  "d": "Clean parts from the freed Machine Fleet. Shared, not taken. Rare everywhere else.",
  "fleet": true,
  "p": {
   "myard": 18,
   "shasta": 44,
   "luxor": 46,
   "ur": 48,
   "gaya": 46,
   "meru": 40,
   "zion": 44,
   "nebo": 50,
   "kufa": 46,
   "jidda": 48
  }
 },
 {
  "key": "babel_tile",
  "name": "BABEL TILE",
  "home": "p2",
  "mat": "ti",
  "rival": true,
  "d": "Glazed blue tiles, fired in the tower kilns. A finish for fine buildings.",
  "p": {
   "p2": 6,
   "shasta": 12,
   "luxor": 19,
   "ur": 12,
   "gaya": 12,
   "meru": 18,
   "zion": 12,
   "nebo": 12,
   "kufa": 12,
   "jidda": 12
  }
 },
 {
  "key": "delos_marble",
  "name": "DELOS MARBLE",
  "home": "p3",
  "mat": "ma",
  "rival": true,
  "d": "White island marble in squared blocks. Monuments, plazas, arenas.",
  "p": {
   "p3": 7,
   "shasta": 13,
   "luxor": 13,
   "ur": 13,
   "gaya": 22,
   "meru": 13,
   "zion": 20,
   "nebo": 13,
   "kufa": 13,
   "jidda": 13
  }
 },
 {
  "key": "aksum_coffee",
  "name": "AKSUM COFFEE",
  "home": "p4",
  "lux": true,
  "rival": true,
  "d": "Roasted beans in sealed sacks. Every galley in the galaxy wants it.",
  "p": {
   "p4": 4,
   "shasta": 30,
   "luxor": 9,
   "ur": 9,
   "gaya": 9,
   "meru": 9,
   "zion": 9,
   "nebo": 32,
   "kufa": 9,
   "jidda": 30
  }
 },
 {
  "key": "ephraim_brick",
  "name": "EPHRAIM BRICK",
  "home": "p1",
  "exportOnly": true,
  "export": "br",
  "per": 10,
  "d": "Kiln-fired brick from your own planet. Builders on the busy worlds pay well.",
  "p": {
   "p1": 4,
   "shasta": 20,
   "luxor": 15,
   "ur": 13,
   "gaya": 16,
   "meru": 20,
   "zion": 12,
   "nebo": 22,
   "kufa": 13,
   "jidda": 16
  }
 },
 {
  "key": "raw_crystal",
  "name": "RAW CRYSTAL",
  "home": "p1",
  "exportOnly": true,
  "export": "c",
  "per": 2,
  "d": "Cut from your crystal cave. The rarest thing in the galaxy: it powers everything.",
  "p": {
   "p1": 20,
   "shasta": 28,
   "luxor": 43,
   "ur": 29,
   "gaya": 32,
   "meru": 30,
   "zion": 43,
   "nebo": 31,
   "kufa": 29,
   "jidda": 42
  }
 },
 {
  "key": "ephraim_cloth",
  "name": "EPHRAIM CLOTH",
  "home": "p1",
  "exportOnly": true,
  "export": "ro",
  "per": 5,
  "d": "Rope and sailcloth woven from your own sheep. Sailors and tent-makers want it.",
  "p": {
   "p1": 4,
   "shasta": 9,
   "luxor": 12,
   "ur": 10,
   "gaya": 13,
   "meru": 11,
   "zion": 9,
   "nebo": 17,
   "kufa": 10,
   "jidda": 15
  }
 },
 {
  "key": "ephraim_wool",
  "name": "EPHRAIM WOOL",
  "home": "p1",
  "exportOnly": true,
  "export": "wool",
  "per": 5,
  "d": "Raw fleece from your own Shasta sheep. Weavers on the cold worlds pay for it.",
  "p": {
   "p1": 3,
   "shasta": 8,
   "luxor": 12,
   "ur": 10,
   "gaya": 9,
   "meru": 11,
   "zion": 10,
   "nebo": 13,
   "kufa": 14,
   "jidda": 12
  }
 },
 {
  "key": "ephraim_produce",
  "name": "EPHRAIM PRODUCE",
  "home": "p1",
  "exportOnly": true,
  "export": "f",
  "per": 12,
  "d": "Honey, goat cheese and greenhouse crops from your farms, packed in one crate.",
  "p": {
   "p1": 3,
   "shasta": 14,
   "luxor": 11,
   "ur": 10,
   "gaya": 8,
   "meru": 12,
   "zion": 13,
   "nebo": 9,
   "kufa": 16,
   "jidda": 15
  }
 }
];
// s382 FRONTIER GOODS (2D FRONTIER_TRADE, verbatim): never sold at a dock, only LOADED at a surveyed frontier world (its seam holds
// 8 crates, one more every 45 s, 2D SEAM_MAX / SEAM_GROW). Every dock buys them.
export const FRONTIER_GOODS = [
 {
  "key": "beta1_good",
  "name": "ICE PEARL",
  "home": "beta1",
  "frontier": true,
  "d": "Dredged from under the ice. Whatever grows them is still down there.",
  "p": {
   "shasta": 42,
   "luxor": 47,
   "ur": 45,
   "gaya": 42,
   "meru": 40,
   "zion": 52,
   "nebo": 63,
   "kufa": 48,
   "jidda": 48
  }
 },
 {
  "key": "beta2_good",
  "name": "REAVER BULLION",
  "home": "beta2",
  "frontier": true,
  "d": "Stamped bars, no mint mark. The black hulls were sitting on it.",
  "p": {
   "shasta": 77,
   "luxor": 62,
   "ur": 62,
   "gaya": 60,
   "meru": 58,
   "zion": 63,
   "nebo": 63,
   "kufa": 67,
   "jidda": 60
  }
 },
 {
  "key": "beta3_good",
  "name": "STAR IRON",
  "home": "beta3",
  "frontier": true,
  "d": "Core metal off an airless world. It takes an edge nothing else will hold.",
  "p": {
   "shasta": 65,
   "luxor": 77,
   "ur": 73,
   "gaya": 67,
   "meru": 73,
   "zion": 75,
   "nebo": 67,
   "kufa": 93,
   "jidda": 67
  }
 },
 {
  "key": "beta4_good",
  "name": "RAW STARSTONE",
  "home": "beta4",
  "frontier": true,
  "d": "Cut straight out of the open seam. Uncut, unregistered, unrepeatable.",
  "p": {
   "shasta": 100,
   "luxor": 95,
   "ur": 97,
   "gaya": 125,
   "meru": 100,
   "zion": 82,
   "nebo": 90,
   "kufa": 97,
   "jidda": 87
  }
 },
 {
  "key": "earth_good",
  "name": "EARTH SEED",
  "home": "earth",
  "frontier": true,
  "d": "Living stock off the green world. There is no second source anywhere.",
  "p": {
   "shasta": 112,
   "luxor": 115,
   "ur": 113,
   "gaya": 108,
   "meru": 152,
   "zion": 127,
   "nebo": 108,
   "kufa": 125,
   "jidda": 115
  }
 }
];
GOODS.push(...FRONTIER_GOODS);
export const SEAM_MAX = 8, SEAM_GROW_S = 45;
export const HOLD_CAP = 10;
export function priceAt(g, key) { if (g.p[key] != null) return g.p[key]; const v = Object.values(g.p); return Math.round(v.reduce((a, b) => a + b, 0) / v.length * 1.1); }
