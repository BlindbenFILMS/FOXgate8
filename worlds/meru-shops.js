// MERU — the square's two shops: Item Shop [meruItemshop] (Kia) and Armory [meruArmory] (Bram).
// Same scene, far south, quick fade. Keepers, greetings, stock and prices verbatim from surface_meru.html (MERU.shopStock).
import { branch } from '../engine/story.js';
import { items as IC } from '../engine/items.js';   // ROADMAP Phase 1: names + prices come from the ITEM CATALOG

export const ROOMS = {
  itemshop: { x: 360, z: 230, w: 16, d: 13, h: 5, key: 'itemshop', label: 'Item Shop', bkey: 'meruItemshop', b: 2 },
  armory: { x: 400, z: 230, w: 18, d: 14, h: 5.5, key: 'armory', label: 'Armory', bkey: 'meruArmory', b: 4 },
};
for (const R of Object.values(ROOMS)) R.exit = { x: R.x, z: R.z + R.d / 2 - 1.1 };
export const KEEPERS = [
  { key: 'kia', name: 'Kia', role: 'Item Shop', outfit: 'vest', female: true, torso: ['#f6efe0', '#e2cba4', '#8a6a42'], crest: '8', x: ROOMS.itemshop.x, z: ROOMS.itemshop.z - 3.6, face: 0, mood: 'sad', shop: 'kia', greeting: 'Everything on these shelves mends something. Take your time.' },
  { key: 'bram', name: 'Bram', role: 'Armory', outfit: 'vest', torso: ['#cbd5e1', '#7c8794', '#3f4854'], crest: '8', x: ROOMS.armory.x, z: ROOMS.armory.z - 4.0, face: 0, mood: 'stern', shop: 'bram', greeting: 'Steel or plate. Say which and I will find it.' },
];
export const STOCK = {
  kia: [{ kind: 'item', key: 'erToGo', price: 10, label: 'Heal Beam Battery' }, { kind: 'item', key: 'energyPod', price: 10, label: 'Energy Cell' }, { kind: 'item', key: 'chocolates', price: 20, label: 'Box of Chocolates' }, { kind: 'item', key: 'amber', price: 5, label: 'Meru Amber' }, { kind: 'item', key: 'splint', price: 35, label: 'Field Splint' }],
  bram: [{ kind: 'gear', key: 'halberd', price: 50, label: 'Halberd' }, { kind: 'gear', key: 'reinforced', price: 50, label: 'Reinforced Armor' }],
};
export const ITEM_LABELS = { woolBale: 'Wool Bale', freshMilk: 'Fresh Milk', shepherdsPie: 'Shepherd\u2019s Pie', apple: 'Russet Apple', appleCider: 'Apple Cider', carrot: 'Carrot', sweetCorn: 'Sweet Corn', cornChowder: 'Corn Chowder', repairKit: 'Repair Kit', bandageRoll: 'Bandage Roll', oakBoard: 'Oak Board', plywood: 'Plywood Sheet', wireSpool: 'Wire Spool', stringLights: 'String Lights', deskLamp: 'Desk Lamp', copperPipe: 'Copper Pipe', rubberDuck: 'Rubber Duck', brickStack: 'Bricks ×10', cementBag: 'Cement Bag', paintSky: 'Wall Paint · Sky Blue', paintSun: 'Wall Paint · Sunny Yellow', pictureFrame: 'Picture Frame', seedSunflower: 'Sunflower Seeds', seedTomato: 'Tomato Seeds', pottedFern: 'Potted Fern', gardenGnome: 'Garden Gnome', policeWhistle: 'Police Whistle', goldenBadge: 'Golden Badge', coinChoc: 'Coin Chocolate', goldenPiggy: 'Golden Piggy Bank', goldIngot: 'Stamped Gold Ingot', goldenAnvil: 'Golden Anvil', goldenHelmet: 'Golden Helmet', pressCamera: 'Press Camera', goldenPress: 'Golden Press', tvMic: 'Meru TV Microphone', goldenMic: 'Golden Mic', pocketRadio: 'Pocket Radio', goldRecord: 'Gold Record', spyCamera: 'Spy Camera', vaxBadge: 'VAX Staff Badge', vaxTrophy: 'VAX Trophy', saltPin: 'Salt Family Pin', saltTrophy: 'Salt Trophy', pepperKeys: 'Pepper Family Keyring', pepperTrophy: 'Pepper Trophy', mfBadge: 'Machine Fleet Staff Badge', mfTrophy: 'Fleet Trophy', woodChair: 'Oak Chair', goldHammer: 'Golden Hammer', toolBelt: 'Tool Belt', sportsDrink: 'Sports Drink', chargeCell: 'Charge Cell', megaCell: 'Mega Cell', travelPillow: 'Travel Pillow', napBlanket: 'Catnap Blanket', gelatoScoop: 'Single Scoop', gelatoTower: 'Triple Tower', goldenOutletKey: 'Golden Outlet Key', proteinBar: 'Protein Bar', scrapMagnet: 'Scrap Magnet', goldBin: 'Golden Bin', myPainting: 'Your First Painting', goldFrame: 'Golden Frame', goldCan: 'Golden Watering Can', gaptKey: 'Flat 7 Key', goldTuba: 'Golden Tuba', laptKey: 'Flat 9G Key', goldenSpanner: 'Golden Spanner', saptKey: 'Flat 12G Key', goldenDoorknob: 'Golden Doorknob', daptKey: 'Flat 3G Key', goldGavel: 'Golden Gavel', goldAbacus: 'Golden Abacus', goldTooth: 'Golden Tooth', relicLoupe: 'Dealer\u2019s Loupe', tr_coin: 'Old Meru Coin', tr_fox: 'Clay Fox', tr_bell: 'Bronze Bell', tr_jade: 'Jade Charm', tr_map: 'Star Map', tr_shard: 'Gate Shard', goldScoop: 'Gold Scoop', goldenCart: 'Golden Cart', binoculars: 'Ranger Binoculars', goldenAcorn: 'Golden Acorn', limberBalm: 'Limber Balm', goldenSpine: 'Golden Spine', clubSandwich: 'Club Sandwich', silverCup: 'Silver Cup', pillowMint: 'Pillow Mint', goldenKey: 'Golden Room Key', goldenFlatKey: 'Golden Caretaker Key', slushie: 'Slushie', goldenNozzle: 'Golden Nozzle', firstAidKit: 'First Aid Kit', ancientCoin: 'Ancient Coin', fossil: 'Fossil', stampBook: 'Stamp Book', luckyGolfBall: 'Lucky Golf Ball', glowBalls: 'Glow Balls', grapplingHook: 'Grappling Hook', summitMedal: 'Summit Medal', bambooRod: 'Bamboo Rod', steelRod: 'Steel Rod', shinyLure: 'Shiny Lure', goldenBait: 'Golden Bait', luckyHook: 'Lucky Hook', hullPearl: 'Hull Pearl', ownBoard: 'Your Skateboard', kite: 'Kite', stickerPack: 'Sticker Pack', snackPack: 'Snack Pack', energyDrink: 'Energy Drink', loyaltyCard: 'Loyalty Card', hotPie: 'Hot Pie', goldenPieTin: 'Golden Pie Tin', flowerCrown: 'Flower Crown', healingBouquet: 'Healing Bouquet', seedPouch: 'Seed Pouch', luckyClover: 'Lucky Clover', chefHat: 'Chef Hat', cocoaCharm: 'Cocoa Charm', luckyThread: 'Lucky Thread', goldenComb: 'Golden Comb', hairTonic: 'Hair Tonic', luckyLaces: 'Lucky Laces', shoeShine: 'Shoe Shine Kit', erToGo: 'Heal Beam Battery', energyPod: 'Energy Cell', chocolates: 'Box of Chocolates', amber: 'Meru Amber', splint: 'Field Splint', healingCharges: 'Healing Charges', bigLaserGun: 'Big Laser Gun', planetaryDefenceFlagship: 'Planetary Defence Flagship', halberd: 'Halberd', reinforced: 'Reinforced Armor' };
for (const it of IC.list()) ITEM_LABELS[it.id] = it.name;
STOCK.kia = IC.stock(STOCK.kia, 'Kia · Item Shop'); STOCK.bram = IC.stock(STOCK.bram, 'Bram · Armory');
export const DIALOGUE = {
  kia: [{ who: 'player', text: 'You look deeply sorrowful tonight, Kia.' }, { who: 'npc', text: 'This galaxy is a tragedy waiting to be performed. We toast an old king...' }, { who: 'npc', text: '...while stockpiling weapons to murder each other\u0027s children. I am resigned to the fighting. It brings no joy.' }, { who: 'player', text: 'Are your combat skills as deadly as the rumors say?' }, { who: 'npc', text: 'I do what must be done for my family. Meet my ship in the void and turn around.' }, { who: 'npc', text: 'I dislike taking lives. I never miss.' }],
};
// the 2D openShop counter as a choice menu
export function counter(k, save) {
  const ch = STOCK[k.shop].map(line => { const owned = line.kind === 'gear' && save.flag('gear.' + line.key), canPay = save.data.gold >= line.price;
    return { label: line.label + ' \u2014 ' + line.price + 'g' + (owned ? ' (owned)' : canPay ? '' : ' (not enough gold)'), replies: owned ? ['You already have that one.'] : canPay ? ['Good choice. Anything else?'] : ['Come back when your purse is heavier.'], do: !owned && canPay ? 'buy:' + k.shop + ':' + line.key : 'shopAgain' }; });
  if (DIALOGUE[k.key]) ch.push({ label: 'Have a word', replies: ['Go on, then.'], do: 'shopTalk' });
  ch.push({ label: 'Leave the shop', replies: ['Suit yourself.'] });
  return branch([{ who: 'npc', text: k.greeting + ' (You have ' + save.data.gold + ' gold.)' }], ch);
}
// s76: Meru Market STAFF DISCOUNT (save stat mkDiscount) = 20 % off at Kia's counter
export const priceOf = (save, shop, line) => save && save.stat && ((shop === 'kia' && save.stat('mkDiscount', false)) || (shop === 'bram' && save.stat('arDiscount', false))) ? Math.max(1, Math.round(line.price * 0.8)) : line.price;   // s78: + Bram's staff price (arDiscount)
export function buy(save, shop, key) { const line = STOCK[shop].find(l => l.key === key); if (!line || !save.spend(priceOf(save, shop, line))) return null; if (line.kind === 'gear') { save.setFlag('gear.' + key); save.give(key); } else save.give(key); return line; }

export function buildShops(K) {
  const { THREE, scene, M, BOX, toon, BK, glowSprite, DARK, WOOD, GOLD, roomLights, colliders, lampM } = K; const groups = {};
  const shell = (R, wallKind, wallCol, floorKind, floorCol, trimCol) => { const T = new THREE.Group(); T.position.set(R.x, 0, R.z); scene.add(T); groups[R.key] = T; const W2 = R.w / 2, D2 = R.d / 2;
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(R.w, R.d), BK.texMat(floorKind, floorCol, R.w / 2, R.d / 2)); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; T.add(fl);
    const wm = BK.texMat(wallKind, wallCol, R.w / 2.4, R.h / 2.4), tm = toon(trimCol);
    for (const [x, z, w, ry] of [[0, -D2, R.w, 0], [-W2, 0, R.d, Math.PI / 2], [W2, 0, R.d, -Math.PI / 2]]) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; T.add(g); const m = new THREE.Mesh(BOX(w, R.h, 0.3), wm); m.position.y = R.h / 2; m.receiveShadow = true; g.add(m); M(BOX(w, 0.25, 0.4), tm, 0, 0.12, 0.05, g, 0); M(BOX(w, 0.3, 0.42), tm, 0, R.h - 0.15, 0.05, g, 0); }
    for (const s of [-1, 1]) { const ww = W2 - 1.5; const m = new THREE.Mesh(BOX(ww, R.h, 0.3), wm); m.position.set(s * (1.5 + ww / 2), R.h / 2, D2); T.add(m); } M(BOX(3.0, R.h - 2.9, 0.3), wm, 0, 2.9 + (R.h - 2.9) / 2, D2, T, 0);
    for (const [x, z] of [[-W2 / 2, 0], [W2 / 2, 0]]) { const L = new THREE.PointLight(0xffd9a8, 0, 14, 1.5); L.position.set(R.x + x, R.h - 0.8, R.z + z); scene.add(L); roomLights.push({ L, k: 10 }); M(new THREE.CylinderGeometry(0.25, 0.35, 0.3, 10), lampM, x, R.h - 0.5, z, T, 0.01, 0.35); }
    return T; };
  const box = (T, R, x0, x1, z0, z1, h, mat) => { M(BOX(x1 - x0, h, z1 - z0), mat, (x0 + x1) / 2, h / 2, (z0 + z1) / 2, T, 0.025); colliders.push({ box: [R.x + x0, R.x + x1, R.z + z0, R.z + z1] }); };
  // Item Shop: counter across the back, potion shelves behind Kia, crates and a sale table
  { const R = ROOMS.itemshop, T = shell(R, 'tile', '#24504d', 'plank', '#8a6440', '#e6e1d3');
    box(T, R, -4, 4, -2.8, -2.0, 1.05, toon('#3f6b4a')); M(BOX(8.2, 0.08, 1.0), toon('#e6e1d3'), 0, 1.09, -2.4, T, 0.01);
    for (let row = 0; row < 3; row++) { M(BOX(9, 0.08, 0.6), WOOD, 0, 1.4 + row * 0.9, -R.d / 2 + 0.45, T, 0.01); for (let i = 0; i < 14; i++) { const c = ['#4ade80', '#38bdf8', '#f472b6', '#facc15', '#c084fc'][(i + row) % 5]; const b = M(new THREE.CylinderGeometry(0.11, 0.13, 0.32, 8), toon(c, { emissive: new THREE.Color(c), emissiveIntensity: 0.35 }), -4.1 + i * 0.63, 1.62 + row * 0.9, -R.d / 2 + 0.45, T, 0.01); } }
    for (const [x, z] of [[-6, 3], [-5.2, 4.2], [6, 3.6]]) box(T, R, x - 0.5, x + 0.5, z - 0.5, z + 0.5, 1.0, WOOD);
    box(T, R, 3, 5.4, 1.6, 2.6, 0.85, WOOD); for (let i = 0; i < 4; i++) M(BOX(0.4, 0.3, 0.4), toon(['#a8323e', '#e6b45a', '#38bdf8', '#4ade80'][i]), 3.3 + i * 0.6, 1.0, 2.1, T, 0.01);
    for (const x of [-1.6, 1.6]) M(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 6), toon('#cbd5e1'), x, 1.25, -2.4, T, 0); }
  // Armory: weapon racks on the walls, armour stands, a forge glow, Bram's anvil
  { const R = ROOMS.armory, T = shell(R, 'brick', '#2a315a', 'stone', '#5c5675', '#c0995c');
    box(T, R, -3.5, 3.5, -3.4, -2.6, 1.0, toon('#26306b')); M(BOX(7.2, 0.08, 0.9), toon('#c0995c'), 0, 1.04, -3.0, T, 0.01);
    for (let i = 0; i < 10; i++) { const x = -4.5 + i; M(BOX(0.06, 1.6, 0.04), toon('#e7edf4'), x, 2.6, -R.d / 2 + 0.2, T, 0.01); M(BOX(0.3, 0.06, 0.06), GOLD, x, 1.8, -R.d / 2 + 0.22, T, 0); }
    for (const s of [-1, 1]) { const x = s * (R.w / 2 - 0.3); for (let i = 0; i < 3; i++) { M(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 18), toon('#2a315a'), x, 2.0, -3 + i * 2.6, T, 0.02, 0.42).rotation.z = Math.PI / 2; } }
    for (const [x, z] of [[-5.5, 2.5], [5.5, 2.5], [-5.5, -0.5]]) { const g = new THREE.Group(); g.position.set(x, 0, z); T.add(g); M(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 6), WOOD, 0, 0.7, 0, g, 0.01); M(BOX(0.7, 0.8, 0.4), toon('#8a94a8'), 0, 1.6, 0, g, 0.02); M(new THREE.SphereGeometry(0.22, 10, 8), toon('#8a94a8'), 0, 2.2, 0, g, 0.02, 0.22); colliders.push({ c: [R.x + x, R.z + z, 0.5] }); }
    box(T, R, 4.2, 6.8, -4.6, -3.0, 1.2, toon('#3a3448')); const glow = M(BOX(1.4, 0.4, 0.9), toon('#ff8a2a', { emissive: new THREE.Color('#ff6a1a'), emissiveIntensity: 1.6 }), 5.5, 1.3, -3.8, T, 0); glow.castShadow = false; glowSprite(5.5, 1.5, -3.8, 0xff7a30, 3.5, T);
    box(T, R, -1.0, 0.0, 1.0, 1.6, 0.8, toon('#3a3448')); M(BOX(1.4, 0.25, 0.5), toon('#4a4f6a'), -0.5, 0.92, 1.3, T, 0.02); }
  return groups;
}
