// s715 UNIQUE FACES (Ben: make every shop keeper + towns fox look unique, the way the planet leaders were done).
// One table keyed by fox key. fox-kit makeFox merges it over the fox's own look (so the SAME face shows in the shop AND on the street:
// roster foxes are made as 'rs_' + key). Only face + build + mood live here; colours, outfits, hats + props stay in each shop file.
// Look keys (fox-kit): headWidth, cheeks, jawTuck, snoutLength, eyeSize, eyeY, eyeTilt (+ = sharp / sly, − = soft / droopy), pupil,
// browWeight, browColor, lashes, scar, headTuft (hair), earHeight, earWidth, fluffSize, bodyScale. mood = the resting face.
// NOSE RULE (s715c): snoutLength never under 0.5, or the muzzle swallows the nose (Mr. Penny + Granny Crust lost theirs at 0.46 / 0.44).
// ROUND 1: the roster (shop keepers, guards, police, fire crew). Next rounds: every other keeper, then the named towns foxes.
export const UNIQUE_FACES = {
  // ---- shop keepers ----
  mrPenny: { eyes: ['#3a2a18', '#3a2a18'], look: { elder: 1, fur: '#c9875a', furDark: '#8a5a3a', muzzle: '#f6f1ea', snout: '#ece4da', chin: '#ffffff', fluff: '#ffffff', headWidth: 1.08, cheeks: 1.25, snoutLength: 0.5, eyeSize: 1.1, browWeight: 7, browColor: '#f3f2f2' }, mood: 'warm' },   // round, kindly old grocer
  grannyCrust: { eyes: ['#5a3a20', '#5a3a20'], look: { elder: 1, fur: '#b9aea4', furDark: '#857a70', muzzle: '#f6f1ea', snout: '#ece4da', chin: '#ffffff', fluff: '#ffffff', headWidth: 1.06, cheeks: 1.35, snoutLength: 0.5, eyeSize: 0.95, eyeY: 86, browWeight: 5, browColor: '#ffffff', earHeight: 0.72, headTuft: 1.4 }, mood: 'warm' },   // soft round baker, droopy ears
  snipBarber: { eyes: ['#3f7a52', '#3f7a52'], look: { fur: '#6b625b', furDark: '#3a3430', muzzle: '#ece5db', snout: '#ddd2c4', chin: '#f4efe8', fluff: '#f4efe8', headWidth: 0.94, snoutLength: 0.62, jawTuck: 0.24, eyeTilt: 0.12, browWeight: 8 }, mood: 'neutral' },   // sharp, narrow, precise
  laceShoes: { eyes: ['#2e86b8', '#2e86b8'], look: { fur: '#e0662a', furDark: '#9a3a12', muzzle: '#fff1e0', snout: '#ffe2c8', chin: '#fff6ec', fluff: '#fff6ec', lashes: 1, eyeSize: 1.35, eyeTilt: -0.06, earHeight: 0.95, fluffSize: 1.2, snoutLength: 0.5 }, mood: 'curious' },   // tall ears, big soft eyes
  bean: { eyes: ['#7a4a2a', '#7a4a2a'], look: { fur: '#7a4a2a', furDark: '#4e2c18', muzzle: '#e8c9a6', snout: '#d9b08a', chin: '#f4ece0', fluff: '#f4ece0', eyeTilt: 0.1, browWeight: 9, cheeks: 1.15 }, mood: 'smug' },   // the cheeky twin (heavy brows)
  cocoa: { eyes: ['#7a4a2a', '#7a4a2a'], look: { fur: '#7a4a2a', furDark: '#4e2c18', muzzle: '#e8c9a6', snout: '#d9b08a', chin: '#f4ece0', fluff: '#f4ece0', eyeTilt: -0.08, browWeight: 4, lashes: 1, eyeSize: 1.4 }, mood: 'happy' },   // the sweet twin (soft brows, lashes)
  reelBait: { eyes: ['#3a5a2a', '#3a5a2a'], look: { fur: '#d9a86c', furDark: '#a8763e', muzzle: '#f6ead8', snout: '#efe0c8', chin: '#fff8ee', fluff: '#fff8ee', eyeSize: 0.95, eyeTilt: -0.1, browWeight: 9, snoutLength: 0.56, jawTuck: 0.3 }, mood: 'neutral' },   // weathered squint of a fisherman
  gearsHobby: { eyes: ['#3a5a7a', '#3a5a7a'], look: { fur: '#9a958e', furDark: '#6b665f', muzzle: '#ece7df', snout: '#ddd6cc', chin: '#f3f0ea', fluff: '#f3f0ea', leg: '#4a3a2c', boot: '#3a2a1c', headWidth: 1.04, earWidth: 1.0, eyeSize: 1.25, browWeight: 6, headTuft: 1.7 }, mood: 'curious' },   // wild tinkerer hair, wide ears
  birdieGolf: { eyes: ['#3a6a3a', '#3a6a3a'], look: { fur: '#d9813a', furDark: '#a85a22', muzzle: '#fbeee0', snout: '#f3e2cf', chin: '#ffffff', fluff: '#ffffff', snoutLength: 0.5, earHeight: 0.9, eyeSize: 1.4, jawTuck: 0.3, bodyScale: 0.97 }, mood: 'happy' },   // sporty, bright-eyed, slim
  stampsPost: { eyes: ['#3a2a18', '#3a2a18'], look: { elder: 1, fur: '#a7adb3', furDark: '#70767c', muzzle: '#f6f1ea', snout: '#ece4da', chin: '#ffffff', fluff: '#ffffff', headWidth: 0.96, snoutLength: 0.6, eyeSize: 0.9, browWeight: 10, browColor: '#ffffff' }, mood: 'neutral' },   // stern old postmaster, bushy white brows
  boltGas: { eyes: ['#3a2a1a', '#3a2a1a'], look: { fur: '#b5522a', furDark: '#7f3618', muzzle: '#f6e2cc', snout: '#f0d8bc', chin: '#fff4e6', fluff: '#fff4e6', headWidth: 1.12, cheeks: 1.3, jawTuck: 0.2, eyeSize: 1.1, browWeight: 9 }, mood: 'happy' },   // big square-jawed mechanic
  mamaKeys: { eyes: ['#3a2a1a', '#3a2a1a'], look: { fur: '#9a9490', furDark: '#6f6a66', muzzle: '#f2ece6', snout: '#ece4dc', chin: '#ffffff', fluff: '#ffffff', lashes: 1, headWidth: 1.1, cheeks: 1.4, eyeSize: 1.2, eyeY: 84 }, mood: 'warm' },   // big warm motel mum
  quillMuseum: { eyes: ['#5a3a1a', '#5a3a1a'], look: { fur: '#c98a4a', furDark: '#9a6430', muzzle: '#f3dcc0', snout: '#ecd2b2', chin: '#fff4e6', fluff: '#fff4e6', lashes: 1, blush: 0.28, headWidth: 0.9, snoutLength: 0.6, earHeight: 0.95, eyeSize: 1.0, eyeY: 90, browWeight: 4 }, mood: 'curious' },   // long-snouted scholar, high eyes
  drLimber: { eyes: ['#3f7a52', '#3f7a52'], look: { fur: '#d9a066', furDark: '#8a5a2b', muzzle: '#f6ead8', snout: '#efe0c8', chin: '#fbf3e6', fluff: '#fbf3e6', headWidth: 0.94, snoutLength: 0.56, eyeSize: 1.15, bodyScale: 1.04 }, mood: 'warm' },   // tall + lean, calm
  bigTallRock: { eyes: ['#3a2a1a', '#3a2a1a'], look: { fur: '#7a4a2a', furDark: '#4a2a14', muzzle: '#f1e2cf', snout: '#e8d4bc', chin: '#f6ece0', fluff: '#f6ece0', headWidth: 1.15, cheeks: 1.2, jawTuck: 0.22, eyeSize: 1.0, browWeight: 8 }, mood: 'happy' },   // gentle giant
  sirPercy: { eyes: ['#3a2a1a', '#3a2a1a'], look: { fur: '#c8c4c0', furDark: '#8f8a86', muzzle: '#f4f0ec', snout: '#ece6e0', chin: '#ffffff', fluff: '#ffffff', snoutLength: 0.62, eyeTilt: -0.12, earHeight: 0.9, browWeight: 7, browColor: '#f3f2f2' }, mood: 'smug' },   // posh droopy-lidded aristocrat
  // ---- Meru Guards + Barracks Road ----
  guardFlint: { eyes: ['#3a2a1a', '#3a2a1a'], look: { armorAccent: '#c9a227', fur: '#8a5a3a', furDark: '#5a3a22', muzzle: '#efe2d2', snout: '#e2d2bf', chin: '#f6efe6', fluff: '#f6efe6', headWidth: 1.06, jawTuck: 0.2, eyeTilt: 0.18, browWeight: 10 }, mood: 'determined' },   // the stern one
  guardAsh: { eyes: ['#3a5a7a', '#3a5a7a'], look: { armorAccent: '#c9a227', fur: '#b8b2aa', furDark: '#7e7870', muzzle: '#f4f1ec', snout: '#e9e4dd', chin: '#ffffff', fluff: '#ffffff', snoutLength: 0.5, eyeSize: 1.4, browWeight: 5 }, mood: 'neutral' },   // the young recruit
  guardBrick: { eyes: ['#3a2a1a', '#3a2a1a'], look: { armorAccent: '#c9a227', fur: '#b0452a', furDark: '#742a16', muzzle: '#f4dcc6', snout: '#ecd0b6', chin: '#fbeee2', fluff: '#fbeee2', headWidth: 1.16, cheeks: 1.35, eyeSize: 0.95, browWeight: 9, bodyScale: 1.08 }, mood: 'neutral' },   // the big one
  sgtBiscuit: { eyes: ['#3a2a18', '#3a2a18'], look: { elder: 1, fur: '#8f8a82', furDark: '#55514b', muzzle: '#f3f2f2', snout: '#ece4da', chin: '#ffffff', fluff: '#ffffff', browWeight: 11, browColor: '#e7e5e4', scar: 1, eyeTilt: 0.1 }, mood: 'determined' },   // old sergeant, scar
  dotDiesel: { eyes: ['#3a2a1a', '#3a2a1a'], look: { fur: '#a39a90', furDark: '#6b635b', muzzle: '#f3f2f2', snout: '#ece8e2', chin: '#ffffff', fluff: '#ffffff', lashes: 1, cheeks: 1.2, eyeSize: 1.3, headTuft: 1.3 }, mood: 'happy' },   // cheery motor-pool mechanic
  // ---- Meru Police ----
  officerRusty: { eyes: ['#3a2a1a', '#3a2a1a'], look: { fur: '#c2602a', furDark: '#86401a', muzzle: '#f8e6d2', snout: '#f0d8bf', chin: '#fff6ec', fluff: '#fff6ec', headWidth: 1.08, cheeks: 1.3, eyeSize: 1.15, browWeight: 7 }, mood: 'happy' },   // round friendly beat cop
  officerVixen: { eyes: ['#2e6a3a', '#2e6a3a'], look: { fur: '#e8582a', furDark: '#a8361a', muzzle: '#fff0e2', snout: '#ffe0c8', chin: '#fff8f0', fluff: '#fff8f0', lashes: 1, snoutLength: 0.58, eyeTilt: 0.16, eyeSize: 1.25 }, mood: 'determined' },   // sharp-eyed detective type
  // ---- Meru Fire ----
  chiefEmber: { eyes: ['#3a2a1a', '#3a2a1a'], look: { fur: '#a8401f', furDark: '#6e2410', muzzle: '#f2d8c2', snout: '#e8cbb0', chin: '#f8ece0', fluff: '#f8ece0', headWidth: 1.08, jawTuck: 0.24, browWeight: 9, scar: 1 }, mood: 'determined' },   // weathered chief, burn scar
  spritz: { eyes: ['#2e86b8', '#2e86b8'], look: { fur: '#f2902a', furDark: '#b8601a', muzzle: '#fff4e2', snout: '#ffe6c6', chin: '#fffaf0', fluff: '#fffaf0', snoutLength: 0.5, eyeSize: 1.55, earHeight: 0.95 }, mood: 'excited' },   // eager young hose fox
};

// ---------- s717 ROUNDS 2 + 3: face TYPES (a base) + per-fox tweaks + mood. Face shape only: these foxes keep their shop file's colours. ----------
const TY = {
  round: { headWidth: 1.1, cheeks: 1.3, eyeSize: 1.15 }, sharp: { headWidth: 0.94, snoutLength: 0.6, jawTuck: 0.24, eyeTilt: 0.12, browWeight: 8 },
  elder: { eyeSize: 0.95, eyeY: 86, browWeight: 8, browColor: '#f3f2f2', earHeight: 0.76 }, young: { eyeSize: 1.5, snoutLength: 0.5, earHeight: 0.92, browWeight: 4 },
  big: { headWidth: 1.14, cheeks: 1.25, jawTuck: 0.22, browWeight: 9, bodyScale: 1.06 }, slim: { headWidth: 0.95, snoutLength: 0.56, bodyScale: 0.97 },
  droopy: { eyeTilt: -0.12, earHeight: 0.74, eyeSize: 1.05 }, scholar: { snoutLength: 0.6, eyeY: 90, eyeSize: 1.0, browWeight: 4, earHeight: 0.92 },
  tough: { headWidth: 1.06, jawTuck: 0.2, eyeTilt: 0.16, browWeight: 10 }, sweet: { eyeSize: 1.4, eyeTilt: -0.06, lashes: 1, browWeight: 4 },
  sly: { eyeTilt: 0.2, snoutLength: 0.58, pupil: 0.7, browWeight: 7 }, wild: { headTuft: 1.8, earWidth: 1.0, eyeSize: 1.3 } };
const F = (type, tweak = {}, mood = 'happy') => ({ look: { ...TY[type], ...tweak }, mood });
Object.assign(UNIQUE_FACES, {
  // ROUND 2 · shop keepers
  bramKeeper: F('big', { scar: 1, browWeight: 11 }, 'stern'), flora: F('sweet', { headTuft: 1.3, fluffSize: 1.2 }, 'warm'), madameStitch: F('sharp', { lashes: 1, eyeTilt: -0.04, snoutLength: 0.62 }, 'proud'),
  bhAce: F('tough', { scar: 1, headWidth: 1.1 }, 'smug'), fisherman: F('elder', { eyeTilt: -0.1, cheeks: 1.2 }, 'warm'), fisherwoman: F('round', { lashes: 1, eyeTilt: -0.05 }, 'warm'),
  mbrSizzle: F('big', { cheeks: 1.45, eyeSize: 1.2 }, 'excited'), mbrBun: F('young', { cheeks: 1.2, headTuft: 1.3 }, 'happy'), mgrPlum: F('round', { eyeY: 84, browWeight: 6 }, 'warm'),
  hwTilly: F('elder', { headWidth: 1.04, browWeight: 9 }, 'neutral'), hwFern: F('young', { lashes: 1, eyeTilt: 0.06 }, 'curious'), patchHosp: F('scholar', { headWidth: 0.98 }, 'warm'), honeyHosp: F('sweet', { cheeks: 1.2 }, 'warm'),
  mftOra: F('sly', { lashes: 1, eyeSize: 1.35, eyeY: 84 }, 'smug'), mftLumi: F('sweet', { eyeSize: 1.55, headTuft: 1.4 }, 'curious'), lnMott: F('round', { headTuft: 0.6, browWeight: 8 }, 'happy'), lnMech: F('tough', { headTuft: 1.2 }, 'neutral'),
  mrsSage: F('elder', { snoutLength: 0.6, eyeY: 90 }, 'curious'), mrsSandy: F('young', { headTuft: 1.5 }, 'excited'), rangerMoss: F('tough', { headTuft: 1.4, eyeTilt: 0.06 }, 'determined'),
  outletSkip: F('slim', { earHeight: 0.92, eyeSize: 1.4 }, 'excited'), outletPatch: F('round', { headTuft: 1.6, eyeSize: 1.3 }, 'excited'), outletOllie: F('elder', { headTuft: 1.6, eyeSize: 1.1 }, 'curious'),
  outletBarnaby: F('elder', { cheeks: 1.3, eyeTilt: -0.08 }, 'warm'), outletMagpieScoop: F('sly', { eyeTilt: 0.24 }, 'smug'), apKeep: F('round', { browWeight: 7 }, 'warm'),
  aptDoorman: F('tough', { eyeTilt: 0.04 }, 'neutral'), daptManager: F('sharp', { lashes: 1 }, 'proud'), gaptManager: F('round', { eyeTilt: -0.06 }, 'warm'), laptManager: F('slim', { browWeight: 6 }, 'neutral'), saptManager: F('sharp', {}, 'smug'),
  woodMaster: F('elder', { headWidth: 1.08, browWeight: 11 }, 'neutral'), woodApprentice: F('young', { headTuft: 1.6 }, 'excited'), galleryOwner: F('sharp', { eyeTilt: -0.1 }, 'smug'),
  radioDJ: F('wild', { eyeTilt: 0.08 }, 'excited'), radioTech: F('scholar', { headTuft: 1.3 }, 'neutral'), tvAnchor: F('slim', { jawTuck: 0.26, browWeight: 6 }, 'proud'), tvWeather: F('sweet', { eyeSize: 1.5 }, 'excited'),
  paperReporter: F('sharp', { headTuft: 1.3 }, 'curious'), paperSeller: F('young', { cheeks: 1.15 }, 'happy'), tabReporter: F('sly', { headTuft: 1.4 }, 'smug'),
  casSteward: F('sharp', { browColor: '#f3f2f2' }, 'proud'), casLibrarian: F('scholar', { lashes: 1 }, 'curious'), casDuchess: F('sharp', { lashes: 1, eyeTilt: -0.1 }, 'proud'),
  csBoss: F('big', { eyeTilt: 0.18, scar: 1 }, 'smug'), csVelvet: F('sly', { lashes: 1 }, 'smug'), tvKeep: F('round', { cheeks: 1.4, browWeight: 8 }, 'warm'), tvZiggy: F('wild', { eyeTilt: 0.1 }, 'excited'),
  dumpForeman: F('big', { browWeight: 11, eyeTilt: 0.1 }, 'stern'), farmRusty: F('elder', { cheeks: 1.25 }, 'warm'), farmMaizy: F('sweet', { headTuft: 1.4 }, 'happy'), farmGus: F('big', { eyeTilt: -0.08 }, 'warm'),
  aviaryFalconer: F('sharp', { eyeTilt: 0.16 }, 'determined'), mpoSpade: F('tough', { headWidth: 1.1 }, 'neutral'), marlo: F('wild', { cheeks: 1.15 }, 'happy'), fountainPainter: F('wild', { lashes: 1 }, 'curious'),
  policeChief: F('big', { browWeight: 11, browColor: '#e7e5e4' }, 'stern'), royalPilot: F('slim', { eyeTilt: 0.08 }, 'determined'), robMorris: F('tough', { headTuft: 1.2 }, 'determined'),
  railSkate: F('young', { headTuft: 1.8, eyeTilt: 0.06 }, 'excited'), bankManager: F('sharp', { browColor: '#f3f2f2' }, 'neutral'), rentalClerk2: F('slim', {}, 'happy'), ferryCrew: F('tough', { cheeks: 1.15 }, 'happy'),
  // ROUND 3 · named towns folk + crews
  tvBarP: F('round', { headTuft: 1.2 }), tvBarK: F('slim', { lashes: 1 }), tvRegular: F('droopy', { cheeks: 1.3 }, 'sleepy'), tvMilo: F('young', {}, 'curious'), csCash: F('slim', { eyeSize: 1.3 }), csWinnie: F('sweet', { cheeks: 1.2 }, 'excited'), csSus: F('sly', {}, 'nervous'), csLoser: F('droopy', {}, 'sad'),
  casClerk: F('scholar'), casDiner: F('round', {}, 'warm'), casPainter: F('wild', {}, 'curious'), casRider: F('tough', {}, 'determined'), mfEngineer: F('scholar', { headTuft: 1.4 }, 'curious'), mfDirector: F('sharp', {}, 'proud'),
  paperPress: F('big', {}, 'neutral'), tabIntern: F('young', { eyeSize: 1.55 }, 'nervous'), buzzGossip: F('sly', { lashes: 1 }, 'smug'), buzzCeleb: F('sharp', { lashes: 1, eyeTilt: -0.06 }, 'proud'), buzzGuard: F('big', { eyeTilt: 0.14 }, 'stern'),
  tvCamera: F('tough', { headTuft: 1.2 }, 'neutral'), galleryPainter: F('wild', { lashes: 1 }, 'curious'), gallerySculptor: F('big', { headTuft: 1.5 }, 'neutral'), gaptGardener: F('elder', { cheeks: 1.2 }, 'warm'),
  laptHush: F('droopy', { eyeSize: 0.95 }, 'sleepy'), saptVolt: F('wild', { eyeSize: 1.4 }, 'excited'), daptGilt: F('sharp', {}, 'smug'), daptJuggler: F('young', { headTuft: 1.6 }, 'excited'),
  pepperBoss: F('big', { eyeTilt: 0.2, scar: 1 }, 'smug'), pepperClerk: F('slim', {}, 'nervous'), saltBoss: F('sly', { headWidth: 1.08 }, 'smug'), saltConsigliere: F('elder', { eyeTilt: 0.12 }, 'neutral'), saltClerk: F('slim', {}, 'nervous'),
  vaxCEO: F('sharp', { jawTuck: 0.22 }, 'smug'), vaxSales: F('round', { eyeSize: 1.3 }, 'excited'), vaxWorker: F('tough', {}, 'neutral'), mrsThief: F('sly', { eyeTilt: 0.26 }, 'smug'), mrsDigger: F('tough', { headTuft: 1.3 }, 'neutral'),
  lnJudgeB: F('elder', { browWeight: 10 }, 'stern'), lnKid: F('young', { eyeSize: 1.6, bodyScale: 0.9 }, 'excited'), bankKid: F('young', { eyeSize: 1.6, bodyScale: 0.9 }, 'curious'), benchGrumble: F('droopy', { browWeight: 10, browColor: '#e7e5e4' }, 'stern'),
  michaelJay2: F('wild', {}, 'excited'), fireRescueFox: F('young', {}, 'determined'), tinyRock: F('young', { cheeks: 1.2 }, 'excited'), apRoofG: F('elder', {}, 'warm'), apRoofL: F('sweet', {}, 'happy'),
});
UNIQUE_FACES.dotGas = UNIQUE_FACES.dotDiesel;   // her shop file calls her dotGas
export const uniqueFace = key => (key && (UNIQUE_FACES[key] || UNIQUE_FACES[String(key).replace(/^rs_/, '')])) || null;
