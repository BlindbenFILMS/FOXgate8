// MERU 2.0 — s155 THE OUTLETS STORES OPEN (Ben's picks, s155): a store the repair crew fixed OPENS THE NEXT GAME DAY with its ORIGINAL OWNER back
// behind a new counter: shop shelf (buy) + 2 jobs (rings + NOW HIRING) + a one-time prize when both jobs are cleared. Gelato = Magpie (beaten) scoops
// as payback, with FOX Gelato rebuilt behind the real counter (to come). Built so far: 1 SPORTING GOODS (SKIP STRIDE · RESTOCK THE BALL CAGES · FIT THE SHOES ·
// prize STRIDE TRACKSUIT) · 4 ELECTRONICS (s157: OLLIE OHM) · 5 FURNITURE (s158: BARNABY BUTTONS · STAGE A ROOM SET · DELIVER THROUGH THE DOOR · prize VELVET LOUNGE ROBE) · 2 FUNNY T-SHIRTS (s156: PATCH PUNLEY · SCREEN-PRINT PRESS · DRESS THE MANNEQUINS · tees sold as outfits · prize KING MIGHT... NOT! TEE). Interior rules (CLAUDE.md): open walkway door → counter, NOW HIRING by the door, menu YES, PUT ME TO WORK! first / GOODBYE last,
// boxes ≤ 20 words, shopKit (keeper idle / wave / look-at, browsers, chime, sun + dust, clock, BEST board, badge). Stat outOpen { fix, met, jobs, prize, hi }.
// Test: ?start=sportopen · __open.open('sport') · __open.begin('balls') · __open.finish() · __open.reset().
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
// s159 3 GELATO = MAGPIE (beaten, court-ordered) scoops as payback behind the REAL case: WORK THE CASE (the 3D FOX Gelato shift, minigames/16-fox-gelato Main.dc.html?embed=1&start=work&keeper=magpie
// in the hire panel, result back by postMessage foxGelato:done) + STOCK THE CASE (drag each tub to its label) · prize MAGPIE'S WHITE SUIT. All 5 open → Dozer's GOLDEN OUTLET KEY.
export function buildOutletOpen({ THREE, scene, kit, cols, save, touch, sayTo, wear, camera, hour = () => 12, isMuted = () => false, L, openPlay = null }) {
  const BLD = (L && L.BUILDINGS) || [];
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const day = () => save.stat('meru2Day', 1);
  const O0 = () => ({ fix: {}, met: {}, jobs: {}, prize: {}, hi: {} });
  const OS = () => { const o = save.stat('outOpen', null); return o && typeof o === 'object' ? { ...O0(), ...o } : O0(); }, setOS = o => save.setStat('outOpen', o);
  const repaired = k => { const r = save.stat('outRepair', null); return !!(r && r.done && r.done[k]); };
  // ================= the stores (one entry each; tees / elec / furn / gelato come next) =================
  const TRACK = { outfit: 'vest', torso: ['#2f7d4a', '#f3f2f2', '#1d4a2c'], name: 'STRIDE TRACKSUIT' };
  const DEFS = [{ key: 'sport', unit: 0, name: 'SPORTING GOODS', color: '#2f7d5a', prefix: 'osp', board: "SKIP'S BEST",
    keeper: { key: 'outletSkip', name: 'Skip Stride', role: 'Sporting Goods', outfit: 'vest', torso: ['#2f7d4a', '#f3f2f2', '#1d4a2c'], look: { fur: '#c98a4a', furDark: '#8a5a2c' }, mood: 'happy', prop: 'headband' },
    games: [{ k: 'balls', name: 'RESTOCK THE BALLS', color: '#e8742a', ring: [-4.3, 3.6] }, { k: 'shoes', name: 'FIT THE SHOES', color: '#2e86b8', ring: [3.5, 18.1] }],
    stock: [{ key: 'sportsDrink', label: 'SPORTS DRINK', price: 8, note: '+25 HP' }, { key: 'proteinBar', label: 'PROTEIN BAR', price: 14, note: '+45 HP' }],
    prize: { outfit: TRACK, line: 'Both jobs done. Take my old STRIDE TRACKSUIT. It ran four marathons. Wash it first.' },
    lines: { first: 'Skip Stride. My shop, my shelves, back at last. Thanks to you, champ.',
      hi: ['Morning, champ! Stretch first. Always stretch first.', 'Champ! Work or shop? Both count as cardio.', 'Back again! The balls stayed in their cages all night. Mostly.'],
      where: 'Ran the coast marathon. Came home to bandits in my tents. Longest race of my life.',
      shop: 'Fuel for the road, champ.', bought: 'Good pick. Sip it, do not gulp it.', broke: 'Short on gold, champ. Jog back when you have more.',
      bye: 'Hydrate, champ!', jobs: { balls: 'Customers emptied the cages again. Drag each ball into its own cage.', shoes: 'Read the foot on the board. Hand them the right sport and size.' },
      done: { balls: 'Every ball home. That is a shop record, champ.', shoes: 'Happy feet, happy foxes. You have the eye, champ.' }, star3: ' Three stars. Gold medal!' } },
    // s156 2 FUNNY T-SHIRTS = PATCH PUNLEY (owner, loud yellow vest, tape measure round the neck, calls you KIDDO)
    { key: 'tees', unit: 1, name: 'FUNNY T-SHIRTS', color: '#c8262c', prefix: 'otz', board: "PATCH'S BEST",
    keeper: { key: 'outletPatch', name: 'Patch Punley', role: 'Funny T-Shirts', outfit: 'vest', torso: ['#ffd23a', '#ec3013', '#201e1d'], look: { fur: '#d9773a', furDark: '#9a4a20' }, mood: 'happy', prop: 'tape' },
    games: [{ k: 'press', name: 'SCREEN-PRINT PRESS', color: '#c8262c', ring: [-3.4, 16.2] }, { k: 'dress', name: 'DRESS THE MANNEQUINS', color: '#2e86b8', ring: [4.2, 6.8] }],
    stock: [{ key: 'teeMeru', label: 'I \u2665 MERU TEE', price: 20, note: 'WEAR IT', outfit: { outfit: 'vest', torso: ['#f3f2f2', '#ec3013', '#c9c4bc'], name: 'I \u2665 MERU TEE' } },
      { key: 'teeRobot', label: 'ROBOTS ARE ALIVE TEE', price: 25, note: 'WEAR IT', outfit: { outfit: 'vest', torso: ['#8a9096', '#201e1d', '#5e6368'], name: 'ROBOTS ARE ALIVE TEE' } },
      { key: 'teeIron', label: 'IRON FOX TEE', price: 25, note: 'WEAR IT', outfit: { outfit: 'vest', torso: ['#c8262c', '#f3f2f2', '#8a1a1e'], name: 'IRON FOX TEE' } }],
    prize: { outfit: { outfit: 'vest', torso: ['#201e1d', '#ffd23a', '#141312'], name: 'KING MIGHT... NOT! TEE' }, line: 'Both jobs done. This KING MIGHT... NOT! tee is banned. Take it. Wear it far from the castle.' },
    lines: { first: 'Patch Punley! Funny T-Shirts is back. The bandits left. Their jokes were terrible, kiddo.',
      hi: ['Kiddo! Back for a laugh or a shift?', 'Hey kiddo. New shirt idea: I SURVIVED THE OUTLETS. Too soon?', 'Kiddo! The mannequins missed you. They said nothing, as usual.'],
      where: 'Hiding at my mum\'s. The bandits wore my stock. One wore IRON FOX upside down.',
      shop: 'Wear your joke, kiddo.', bought: 'Looks great on you. The joke, I mean. Also the shirt.', broke: 'Short on gold, kiddo. And that is no joke.',
      bye: 'Stay funny, kiddo!', jobs: { press: 'Orders are piling up. Pick the screen, pick the ink, pull the squeegee all the way.', dress: 'The window needs new looks. Read each card and dress the mannequin to match.' },
      done: { press: 'Crisp prints, no smudges. You have the touch, kiddo.', dress: 'Best window on the strip. Foxes are stopping to stare, kiddo.' }, star3: ' Three stars. No joke!' } },
    // s157 4 ELECTRONICS = OLLIE OHM (old repair fox, teal shop coat, a magnifier loupe on a headband, calls you SPARKY)
    { key: 'elec', unit: 3, name: 'ELECTRONICS', color: '#2c6f74', prefix: 'oel', board: "OLLIE'S BEST",
    keeper: { key: 'outletOllie', name: 'Ollie Ohm', role: 'Electronics', outfit: 'coat', torso: ['#2c6f74', '#f3f2f2', '#1d4a4e'], look: { fur: '#a9a39b', furDark: '#6e6862' }, mood: 'happy', prop: 'loupe' },
    games: [{ k: 'tune', name: 'TUNE THE TV WALL', color: '#2e86b8', ring: [-5, 18.4] }, { k: 'fix', name: 'FIX A TV', color: '#e8742a', ring: [8.2, 7.4] }],
    browse: [[-3.6, 10, -6, 10], [3.6, 10, 6, 10], [-7.2, 16.4, -8.8, 16.4], [-2.6, 18.6, -2.6, 21.5], [7.6, 15.6, 7.6, 18]],
    stock: [{ key: 'chargeCell', label: 'CHARGE CELL', price: 12, note: '+35 HP' }, { key: 'megaCell', label: 'MEGA CELL', price: 22, note: '+70 HP' }],
    prize: { outfit: { outfit: 'coat', torso: ['#2c6f74', '#ffd23a', '#1d4a4e'], name: "OLLIE'S SHOP COAT" }, line: 'Both jobs done. Take my old SHOP COAT. Pockets full of fuses. Mostly.' },
    lines: { first: 'Ollie Ohm. Forty years fixing sets. The bandits broke more in a week. Thanks, sparky.',
      hi: ['Sparky! Every screen is on. I keep checking.', 'Hey sparky. Tried turning it off and on again?', 'Sparky! Vinnie left his goggles. I use them as a paperweight.'],
      where: 'Hid in my cousin\'s attic. Heard the news on a tiny radio. Bad signal, worse news.',
      shop: 'Power for your gear, sparky.', bought: 'Fully charged. Like you, sparky.', broke: 'Low on gold, sparky. Come back with a full battery.',
      bye: 'Stay charged, sparky!', jobs: { tune: 'The wall is all static. Pick a channel, tap its screens. Follow the plan.', fix: 'Repairs are piling up. Read the chart, pick the part, plug it in, power on.' },
      done: { tune: 'Every screen on the right channel. The wall looks like a showroom again.', fix: 'Four sets fixed, four happy foxes. Steady paws, sparky.' }, star3: ' Three stars. High definition!' } },
    // s158 5 FURNITURE = BARNABY BUTTONS (old brown fox, plum + gold waistcoat, a pencil behind the ear, calls you BUTTERCUP)
    { key: 'furn', unit: 4, name: 'FURNITURE', color: '#6a3a5a', prefix: 'ofu', board: "BARNABY'S BEST",
    keeper: { key: 'outletBarnaby', name: 'Barnaby Buttons', role: 'Furniture', outfit: 'vest', torso: ['#6a3a5a', '#d9b24a', '#3e2236'], look: { fur: '#8a5a3a', furDark: '#5a3a22' }, mood: 'happy', prop: 'pencil' },
    games: [{ k: 'stage', name: 'STAGE A ROOM SET', color: '#2e86b8', ring: [6.5, 15.0] }, { k: 'deliver', name: 'DELIVER THROUGH THE DOOR', color: '#e8742a', ring: [-3.2, 3.0] }],
    browse: [[-3.8, 6.8, -5.5, 4.8], [3.8, 6.8, 5.5, 4.8], [-6.5, 15.4, -6.5, 17.6], [-8.6, 12.2, -8.6, 10], [9.4, 13.4, 10, 15]],
    stock: [{ key: 'travelPillow', label: 'TRAVEL PILLOW', price: 10, note: '+30 HP' }, { key: 'napBlanket', label: 'CATNAP BLANKET', price: 20, note: '+60 HP' }],
    prize: { outfit: { outfit: 'robe', torso: ['#6a3a5a', '#d9b24a', '#3e2236'], name: 'VELVET LOUNGE ROBE' }, line: 'Both jobs done. Take this VELVET LOUNGE ROBE. Softest thing in the shop. After the mattresses.' },
    lines: { first: 'Barnaby Buttons. Forty years selling sofas. Bandits slept on every one. Thank you, buttercup.',
      hi: ['Buttercup! Sit anywhere. Except the display bed. Lou drooled on it.', 'Morning, buttercup. Fresh polish, fresh stock, no bandits.', 'Buttercup! Lou left his lampshade. It sells better than the lamps.'],
      where: 'Stayed with my sister. Lumpy couch. Worst week of my life, buttercup.',
      shop: 'Rest is the best medicine, buttercup.', bought: 'Sweet dreams in a bag. Use it well.', broke: 'Short on gold, buttercup. Window shopping is free.',
      bye: 'Rest easy, buttercup!', jobs: { stage: 'Customers want room sets. Read the brief. Drag each piece onto its outline, right colour.', deliver: 'Deliveries today. Slide it through, turn it to fit. Mind the paint, buttercup.' },
      done: { stage: 'Three rooms, perfectly staged. Foxes keep asking to move in.', deliver: 'Not a scratch on the walls. You were born to lift, buttercup.' }, star3: ' Three stars. Five-star comfort!' } },
    // s159 3 GELATO = MAGPIE (beaten; the court says scoop or jail). Scoops behind the REAL gelato case from the fight; pink apron over the white suit, white fedora, gold eyes, calls you HERO
    { key: 'gelato', unit: 2, name: 'GELATO', color: '#b8456a', prefix: 'oge', board: "MAGPIE'S BEST", noCounter: true, keeperAt: [0, 16.9], talkAt: [0, 14.2], payAt: 14.83,
    keeper: { key: 'outletMagpieScoop', name: 'Magpie', role: 'Gelato (payback)', outfit: 'suit', torso: ['#e8e6e1', '#1d1d22', '#ec3013'], look: { fur: '#3a3d44', furDark: '#1f2126', muzzle: '#f3f2f2', chin: '#f3f2f2' }, eyes: ['#ffd23a', '#ffd23a'], mood: 'angry', prop: 'apron', scale: 1.12 },
    games: [{ k: 'shift', name: 'WORK THE CASE', color: '#b8456a', ring: [-2.8, 13.5], play: 'minigames/16-fox-gelato/project/Main.dc.html?embed=1&start=work&keeper=magpie' }, { k: 'stock', name: 'STOCK THE CASE', color: '#2e86b8', ring: [8.3, 6.6] }],
    browse: [[-5.2, 13.6, -5.2, 16], [4.8, 13.6, 4.8, 16], [-5.5, 5.7, -5.5, 4.2], [5.5, 5.7, 5.5, 4.2], [-8.4, 6.6, -10, 6.6]],
    stock: [{ key: 'gelatoScoop', label: 'SINGLE SCOOP', price: 9, note: '+30 HP' }, { key: 'gelatoTower', label: 'TRIPLE TOWER', price: 18, note: '+65 HP' }],
    prize: { outfit: { outfit: 'suit', torso: ['#e8e6e1', '#1d1d22', '#ec3013'], name: "MAGPIE'S WHITE SUIT" }, line: 'Both jobs done. Take my WHITE SUIT. I cannot scoop in it. Keep the gelato off it.' },
    lines: { first: 'Magpie. Yes, THE Magpie. The judge said scoop or jail. I picked scoop, hero.',
      hi: ['Hero. Welcome to FOX Gelato. I am legally required to smile.', 'You again. One scoop or two? Two. Everyone says two.', 'Hero! The pistachio is back. Nobody touches it. Except customers, apparently.'],
      where: 'Behind bars, then behind this case. Same view, colder paws. Payback, the judge calls it.',
      shop: 'Cold comfort, hero. Pick one.', bought: 'Eat it fast. It melts. Like my empire.', broke: 'No gold? Ha. I know that feeling now, hero.',
      bye: 'Come back soon. The judge reads my reviews.', short: 'Three served is the minimum, hero. Even I manage three. Mostly.',
      jobs: { shift: 'The queue is out the door. Carve, stack, drizzle, serve. Three minutes. Go, hero.', stock: 'The case is empty. Drag each tub to its label. The colours are the clue.' },
      done: { shift: 'Fine. That was a good shift. Tell nobody I said that.', stock: 'Every tub in its place. Even the pistachio. Especially the pistachio.' }, star3: ' Three stars. Ugh. Better than me.' } }];
  // ================= sound + toast =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.4) => { toastTxt = t; toastT = s; };
  let ac = null; const AC = () => (ac = ac || new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted()) return; try { const a = AC(), t = a.currentTime + at, o = a.createOscillator(), gn = a.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(a.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, blip = () => tone(880, 0.04, 0.08, 'square'), thud = () => tone(120, 0.08, 0.15, 'triangle');
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const lam = c => new THREE.MeshLambertMaterial({ color: c });
  // ================= mount one store (once its battle def is loaded) =================
  const ST = [];
  function mount(D) { const O = window.__outlets, S2 = O && O.STORES && O.STORES.find(q => q.key === D.key), def = S2 && S2.def, b = BLD.find(q => q.kind === 'outlet' && q.unit === D.unit); if (!def || !def.W || !b) return null;
    const W = def.W, ry0 = def.ry0, G = new THREE.Group(); G.name = 'outletOpen_' + D.key; G.visible = false; scene.add(G); const C = [];
    const box = (a, d, w, h, dd, mat, y = 0, col = true) => { const [x, z] = W(a, d), m = new THREE.Mesh(new THREE.BoxGeometry(w, h, dd), mat); m.position.set(x, y + h / 2, z); m.rotation.y = ry0; G.add(m); if (col) { const c = { f: [x - w / 2 - 0.1, x + w / 2 + 0.1, z - dd / 2 - 0.1, z + dd / 2 + 0.1], on: false }; cols.push(c); C.push(c); } return m; };
    const plane = (tex, a, d, y, w, h, back) => { const [x, z] = W(a, d), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.y = ry0 + (back ? Math.PI : 0); G.add(m); return m; };
    const look = (a0, d0, a1, d1) => { const [x0, z0] = W(a0, d0), [x1, z1] = W(a1, d1); return Math.atan2(x1 - x0, z1 - z0); };
    // ---- the counter, a drinks fridge, the shoe wall + fitting bench (Sporting Goods dressing) ----
    const cream = lam('#e9e3d6'), ink = lam(INK), green = lam(D.color), wood = lam('#8b6a48');
    if (!D.noCounter) { box(0, 8.4, 3.6, 1.0, 0.8, green); box(0, 8.4, 3.8, 0.07, 0.95, cream, 1.0, false); box(1.1, 8.4, 0.5, 0.32, 0.4, ink, 1.07, false); }
    { const t = CT(512, 96, (g, w, h) => { g.fillStyle = D.color; g.fillRect(0, 0, w, h); g.fillStyle = YEL; g.fillRect(0, 0, 12, h); g.fillStyle = '#fff'; g.font = '900 52px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('PAY HERE', 30, h / 2 + 2); }); plane(t, 0, D.payAt || 7.99, 0.62, 2.6, 0.48, true); }
    if (D.key === 'sport') {
      const fr = box(-2.8, 9.6, 1.1, 2.1, 0.7, lam('#d9dde0')); const gl = CT(128, 256, (g, w, h) => { g.fillStyle = '#bfe6ff'; g.fillRect(0, 0, w, h); for (let r = 0; r < 4; r++) { g.fillStyle = '#e8eef2'; g.fillRect(6, 40 + r * 56, w - 12, 4); for (let i = 0; i < 4; i++) { g.fillStyle = ['#38bdf8', '#ffd23a', '#ec3013', '#7cff9b'][(i + r) % 4]; g.fillRect(12 + i * 28, 14 + r * 56, 18, 26); } } });
      plane(gl, -2.8, 9.24, 1.1, 0.9, 1.8, true).material = new THREE.MeshBasicMaterial({ map: gl, transparent: true, opacity: 0.92 });
      const DR = Math.abs(def.depth) - 0.35; box(3.5, DR, 4.4, 3.0, 0.3, cream, 0, true);
      for (let r = 0; r < 3; r++) { box(3.5, DR - 0.25, 4.2, 0.06, 0.32, wood, 0.7 + r * 0.8, false); for (let i = 0; i < 6; i++) { const c = ['#ec3013', '#2e86b8', '#2f7d5a', '#ffd23a', '#201e1d', '#f3f2f2'][(i + r * 2) % 6]; box(1.6 + i * 0.75, DR - 0.3, 0.52, 0.12, 0.22, lam('#f3f2f2'), 0.76 + r * 0.8, false); box(1.6 + i * 0.75, DR - 0.3, 0.5, 0.16, 0.2, lam(c), 0.88 + r * 0.8, false); } }
      { const t = CT(512, 96, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = YEL; g.font = '900 54px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('SHOES \u00b7 ALL SIZES', 20, h / 2 + 2); }); plane(t, 3.5, DR - 0.17, 3.3, 3.6, 0.68, true); }
      box(3.5, DR - 2.2, 2.2, 0.45, 0.55, wood); box(5.6, DR - 2.4, 0.5, 0.06, 1.6, lam('#c9a06a'), 0.02, false);
      { const t = CT(256, 512, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = INK; for (let s = 4; s <= 12; s++) { const y = h - 20 - (s - 2) * (h - 40) / 10; g.fillRect(0, y, 70, 4); g.font = '900 34px Archivo, sans-serif'; g.fillText(String(s), 88, y + 12); } }); const [x, z] = W(5.6, DR - 2.4), m = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 1.5), new THREE.MeshBasicMaterial({ map: t })); m.rotation.set(-Math.PI / 2, 0, ry0); m.position.set(x, 0.09, z); G.add(m); } }
    if (D.key === 'tees') {   // a JOKE OF THE DAY chalkboard by the counter + fresh folded stacks on it
      box(-2.9, 9.3, 0.9, 0.06, 0.5, wood, 0, false); for (const s of [-0.35, 0.35]) box(-2.9 + s, 9.3, 0.06, 1.7, 0.06, wood, 0, false);
      { const t = CT(256, 320, (g, w, h) => { g.fillStyle = '#2b3a33'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a07a52'; g.lineWidth = 14; g.strokeRect(0, 0, w, h); g.fillStyle = YEL; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'top'; g.fillText('JOKE OF', 20, 22); g.fillText('THE DAY', 20, 54);
        g.fillStyle = '#f3f2f2'; g.font = '800 22px Archivo, sans-serif'; ['WHAT DID THE', 'TEE SAY TO', 'THE HANGER?', '', 'THANKS FOR', 'HANGING OUT.'].forEach((l, i) => g.fillText(l, 20, 104 + i * 32)); }); plane(t, -2.9, 9.0, 1.15, 0.8, 1.0, true); }
      const sc = ['#ec3013', '#ffd23a', '#2e86b8', '#f3f2f2', '#3f9a5e']; for (let i = 0; i < 5; i++) box(-1.3, 8.4, 0.42, 0.07, 0.34, lam(sc[i]), 1.07 + i * 0.075, false); for (let i = 0; i < 3; i++) box(-0.7, 8.4, 0.42, 0.07, 0.34, lam(sc[4 - i]), 1.07 + i * 0.075, false); }
    if (D.key === 'elec') {   // REPAIR BENCH on the east wall + the TROUBLESHOOT chart over it, a CHANNEL GUIDE by the TV wall, a little TV + radio on the counter
      const wpl = (tex, a, d, y, w, h, ry) => { const [x, z] = W(a, d), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
      box(10.2, 7.4, 1.2, 0.95, 2.6, wood); box(10.2, 7.4, 1.3, 0.06, 2.7, lam('#5a4a3a'), 0.95, false);
      box(10.3, 6.9, 0.7, 0.55, 0.9, ink, 1.01, false); box(9.94, 6.9, 0.03, 0.42, 0.72, lam('#3f9a5e'), 1.07, false); for (let i = 0; i < 3; i++) box(9.92, 6.65 + i * 0.25, 0.02, 0.06, 0.08, lam(['#ffd23a', '#ec3013', '#2e86b8'][i]), 1.2 + (i % 2) * 0.12, false);
      box(10.3, 8.2, 0.24, 0.06, 0.24, lam('#8a9096'), 1.01, false); box(10.3, 8.2, 0.04, 0.55, 0.04, lam('#8a9096'), 1.07, false); box(10.0, 8.2, 0.5, 0.14, 0.22, lam(YEL), 1.55, false);
      { const t = CT(512, 384, (g, w, h) => { g.fillStyle = PAPER; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.fillRect(0, 0, w, 74); g.fillStyle = YEL; g.font = '900 38px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('TROUBLESHOOT', 18, 38);
        [['FUZZY', 'ANTENNA', '#8a9096'], ['NO SOUND', 'SPEAKER', INK], ['NO PICTURE', 'CABLE', '#2e86b8'], ['WON\'T TURN ON', 'FUSE', YEL], ['FLICKERS', 'CORD', RED]].forEach(([a2, b2, c2], i) => { const y = 108 + i * 58; g.fillStyle = INK; g.font = '900 30px Archivo, sans-serif'; g.fillText(a2, 18, y, 260); g.fillStyle = c2; g.fillRect(300, y - 18, 30, 36); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(300, y - 18, 30, 36); g.fillStyle = INK; g.fillText(b2, 342, y, 160); }); });
        wpl(t, 10.86, 7.4, 2.7, 2.2, 1.65, -Math.PI / 2); }
      { const t = CT(384, 512, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = YEL; g.font = '900 40px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('CHANNEL GUIDE', 18, 46, w - 36);
        [['1', 'NEWS', '#2e5f8a'], ['2', 'CARTOONS', YEL], ['3', 'WEATHER', '#38bdf8'], ['4', 'SPORTS', '#2f7d5a'], ['5', 'COOKING', '#e8742a']].forEach(([n, nm, c2], i) => { const y = 120 + i * 80; g.fillStyle = c2; g.fillRect(18, y - 30, 60, 60); g.fillStyle = c2 === YEL || c2 === '#38bdf8' ? INK : '#ffffff'; g.font = '900 40px Archivo, sans-serif'; g.fillText(n, 36, y + 2); g.fillStyle = '#f3f2f2'; g.fillText(nm, 96, y + 2, w - 110); }); });
        wpl(t, -10.86, 19.6, 3.0, 1.5, 2.0, Math.PI / 2); }
      box(-1.2, 8.4, 0.62, 0.42, 0.3, ink, 1.07, false); { const t = CT(64, 40, (g, w, h) => { g.fillStyle = '#ffd23a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(w / 2, h / 2, 13, 0, 7); g.fill(); g.fillStyle = INK; g.fillRect(24, 14, 4, 4); g.fillRect(36, 14, 4, 4); g.fillRect(24, 25, 16, 3); }); plane(t, -1.2, 8.24, 1.28, 0.52, 0.32, true); }
      box(-0.6, 8.4, 0.4, 0.22, 0.18, lam('#7a5236'), 1.07, false); }
    if (D.key === 'furn') {   // a FABRIC SWATCH stand by the counter + a hand truck with a boxed armchair by the door (the delivery job)
      box(2.9, 9.3, 0.9, 0.06, 0.5, wood, 0, false); for (const s of [-0.35, 0.35]) box(2.9 + s, 9.3, 0.06, 1.7, 0.06, wood, 0, false);
      { const t = CT(256, 320, (g, w, h) => { g.fillStyle = PAPER; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.fillRect(0, 0, w, 64); g.fillStyle = YEL; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('PICK A FABRIC', 14, 34, w - 28);
        ['#3f7a52', '#6a3a5a', '#d9b24a', '#2e5f8a', '#c8262c', '#e9e3d6'].forEach((c, i) => { const x = 14 + (i % 3) * 78, y = 84 + Math.floor(i / 3) * 112; g.fillStyle = c; g.fillRect(x, y, 68, 96); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x, y, 68, 96); }); }); plane(t, 2.9, 9.0, 1.15, 0.8, 1.0, true); }
      box(-5.2, 1.6, 0.8, 0.06, 0.55, ink, 0.04, false); for (const s of [-0.34, 0.34]) box(-5.2 + s, 1.95, 0.06, 1.5, 0.06, lam('#8a9096'), 0.04, false); box(-5.2, 1.65, 0.8, 1.0, 0.8, lam('#c9a06a'), 0.1, true);
      { const t = CT(256, 160, (g, w, h) => { g.fillStyle = '#c9a06a'; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.font = '900 40px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('DELIVERY', 14, 52, w - 28); g.font = '800 26px Archivo, sans-serif'; g.fillText('THIS WAY UP ↑', 14, 112, w - 28); }); plane(t, -5.2, 1.24, 0.6, 0.72, 0.45, true); } }
    if (D.key === 'gelato') {   // a COURT ORDER notice on a stand by the case + a tip jar on the case
      box(2.6, 13.4, 0.9, 0.06, 0.5, wood, 0, false); for (const s of [-0.35, 0.35]) box(2.6 + s, 13.4, 0.06, 1.7, 0.06, wood, 0, false);
      { const t = CT(256, 320, (g, w, h) => { g.fillStyle = PAPER; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.fillRect(0, 0, w, 64); g.fillStyle = YEL; g.font = '900 32px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('COURT ORDER', 14, 34, w - 28);
        g.fillStyle = INK; g.font = '800 24px Archivo, sans-serif'; ['MAGPIE WILL', 'SCOOP GELATO', 'UNTIL FURTHER', 'NOTICE.', '', 'SMILING IS', 'REQUIRED.'].forEach((l, i) => g.fillText(l, 14, 96 + i * 32, w - 28)); g.fillStyle = RED; g.fillRect(0, h - 10, w, 10); }); plane(t, 2.6, 13.1, 1.15, 0.8, 1.0, true); }
      { const [x, z] = W(1.6, 15.2), j = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.26, 12), new THREE.MeshBasicMaterial({ color: 0xcfefff, transparent: true, opacity: 0.5 })); j.position.set(x, 1.15, z); G.add(j); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12), lam('#d9b24a')); c.position.set(x, 1.06, z); G.add(c); }
      { const t = CT(256, 64, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = YEL; g.font = '900 26px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('TIPS (FOR MY LAWYER)', 10, h / 2 + 1, w - 20); }); plane(t, 1.6, 14.84, 0.92, 0.9, 0.22, true); } }
    // ---- keeper ----
    const KD = D.keeper, kf = kit.makeFox({ key: KD.key, name: KD.name, outfit: KD.outfit, torso: KD.torso, look: KD.look, ...(KD.eyes ? { eyes: KD.eyes } : {}), crest: '', mood: KD.mood }); const KP = kf.userData.P; if (KD.scale) kf.scale.multiplyScalar(KD.scale);
    if (KP) { if (KP.sword) KP.sword.visible = false; if (KP.gun) KP.gun.visible = false; if (KD.prop === 'tape' && KP.body) { for (const sx of [-0.17, 0.17]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.012), lam(YEL)); t.position.set(sx, 1.1, 0.2); t.rotation.z = sx * 0.3; KP.body.add(t); } } if (KD.prop === 'pencil' && KP.head) { const pc = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.3, 6), lam(YEL)); pc.position.set(0.24, 0.1, 0.02); pc.rotation.set(0.2, 0, 1.25); KP.head.add(pc); const er = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.05, 6), lam('#f39ab0')); er.position.set(0.1, 0.0, 0); pc.add(er); er.position.set(0, 0.17, 0); }
      if (KD.prop === 'loupe' && KP.head) { const hb = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.035, 6, 18), lam(INK)); hb.rotation.x = Math.PI / 2; hb.position.y = 0.14; KP.head.add(hb); const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 10), lam('#8a9096')); lp.rotation.x = Math.PI / 2; lp.position.set(0.1, 0.1, 0.27); KP.head.add(lp); const gl = new THREE.Mesh(new THREE.CircleGeometry(0.055, 12), new THREE.MeshBasicMaterial({ color: 0xbfe6ff })); gl.position.set(0.1, 0.1, 0.335); KP.head.add(gl); }
      if (KD.prop === 'apron') { if (KP.body) { const ap = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.58, 0.02), lam('#f2a7b8')); ap.position.set(0, 0.95, 0.21); KP.body.add(ap); const st = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.03), lam('#f3f2f2')); st.position.set(0, 1.2, 0.21); KP.body.add(st); }
        if (KP.head) { const h = new THREE.Group(); h.position.set(0, 0.3, -0.02); KP.head.add(h); const wm = lam('#f3f2f2'), br = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 18), wm), cr = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.24, 14), wm), bd = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.06, 14), lam(INK)); cr.position.y = 0.13; bd.position.y = 0.04; h.add(br, cr, bd); } }
      if (KD.prop === 'headband' && KP.head) { const hb = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.045, 6, 18), lam('#f3f2f2')); hb.rotation.x = Math.PI / 2; hb.position.y = 0.12; KP.head.add(hb); const st = new THREE.Mesh(new THREE.TorusGeometry(0.272, 0.02, 4, 18), lam(RED)); st.rotation.x = Math.PI / 2; st.position.y = 0.12; KP.head.add(st); } }
    const [kx, kz] = W(...(D.keeperAt || [0, 9.4])), kRy = ry0 + Math.PI; kf.position.set(kx, 0, kz); kf.rotation.y = kRy; G.add(kf);
    // ---- the shop kit ----
    const RM = { X0: b.f[0] + 0.3, X1: b.f[1] - 0.3, Z0: b.f[2] + 0.3, Z1: b.f[3] - 0.3 };
    const lampPts = [[-5, 5], [5, 5], [-5, 12], [5, 12], [-5, 18], [5, 18]].map(([a, d]) => { const [x, z] = W(a, d); return [x, def.H - 0.7, z]; });
    const sun = [[-6, 2.2], [6, 2.2]].map(([a, d]) => { const [x, z] = W(a, d); return { x, z, w: 3.4, d: 2.2, ry: ry0 }; });
    const browse = (D.browse || [[-3.6, 9.5, -6, 9.5], [3.6, 9.5, 6, 9.5], [-7.8, 15, -9.4, 15], [5.6, 15.5, 7.6, 15.5], [3.5, 19.4, 3.5, 21]]).map(([a, d, a2, d2]) => { const [x, z] = W(a, d); return [x, z, look(a, d, a2, d2)]; });
    const [hx, hz] = W(2.7, 1.3), [bx, bz] = W(-4.6, 0.32), [cx2, cz2] = W(5, Math.abs(def.depth) - 0.32);
    const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: D.prefix, color: D.color, room: RM, door: W(0, 0.9), keeper: kf, keeperRy: kRy,
      games: D.games.map(g => ({ k: g.k, name: g.name, color: g.color })), board: { x: bx, y: 3.1, z: bz, ry: ry0, w: 1.6 }, boardTitle: D.board, hiring: { x: hx, z: hz, ry: ry0 }, hiringLine: 'WALK UP \u00b7 START WORK',
      sun, lamps: lampPts, browse, clock: { x: cx2, y: 3.4, z: cz2, ry: ry0 + Math.PI } });
    const rings = D.games.map(g => { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.84, 32), ringM); m.rotation.x = -Math.PI / 2; const [x, z] = W(g.ring[0], g.ring[1]); m.position.set(x, 0.06, z); G.add(m); return { g, m, x, z }; });
    const s = { D, def, b, G, C, K, kf, rings, W, open: false, talkAt: W(...(D.talkAt || [0, 7.3])) }; ST.push(s); return s; }
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringDone = new THREE.MeshBasicMaterial({ color: '#7cff9b', transparent: true, opacity: 0.6, depthWrite: false });
  // ================= open / closed =================
  function wantOpen(k) { if (!repaired(k)) return false; const o = OS(); if (o.fix[k] == null) { o.fix[k] = day(); setOS(o); } return day() > o.fix[k]; }
  function setOpen(s, on) { if (s.open === on) return; s.open = on; s.G.visible = on; if (s.b) { if (s.b.label0 == null) s.b.label0 = s.b.label; s.b.label = on ? 'Meru Outlets \u00b7 ' + s.D.name : s.b.label0; } for (const c of s.C) c.on = on; try { s.def.setOpen && s.def.setOpen(on); } catch (e) {} if (on) try { window.__crew && window.__crew.markOpen && window.__crew.markOpen(s.D.key); } catch (e) {} }
  const inside = (s, P, m = 0) => P.x > s.b.f[0] + 0.3 - m && P.x < s.b.f[1] - 0.3 + m && P.z > s.b.f[2] + 0.3 - m && P.z < s.b.f[3] - 0.3 + m && (P.y || 0) < 3;
  // ================= the job panel (same frame as the repair crew's) =================
  const stopEv = el => { for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'touchstart', 'touchmove']) el.addEventListener(ev, e => e.stopPropagation(), { passive: true }); };
  const PANEL = document.createElement('div'); PANEL.style.cssText = 'position:fixed;z-index:34;display:none;flex-direction:column;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;box-sizing:border-box;overflow:hidden;-webkit-user-select:none;user-select:none;touch-action:none';
  document.body.appendChild(PANEL); stopEv(PANEL);
  const fitPanel = () => { const Wd = innerWidth, H = innerHeight, short = H < 520, side = short ? Math.max(8, Math.min(180, (Wd - 320) / 2)) : 8, w = Math.min(640, Wd - side * 2); Object.assign(PANEL.style, { left: Math.round((Wd - w) / 2) + 'px', width: Math.round(w) + 'px', top: (short ? 8 : 56) + 'px', bottom: (short ? 8 : 80) + 'px' }); };
  addEventListener('resize', () => { if (PANEL.style.display !== 'none') fitPanel(); });
  const pulse = el => { if (!el) return; try { el.animate([{ outline: '4px solid #ffd23a' }, { outline: '8px solid rgba(255,210,58,0)' }], { duration: 700, iterations: 3 }); } catch (e) {} };
  let busy = null, J = null, introT = 0, cur = null;
  const setTip = (msg, bad) => { const t = PANEL.querySelector('[data-tip]'); if (t) { t.textContent = msg; t.style.background = bad ? RED : INK; t.style.color = bad ? '#ffffff' : YEL; } };
  const missOne = msg => { if (!J) return; J.miss++; nope(); setTip(msg, true); };
  const fitCv = cv => { if (!cv) return null; const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g, w, h }; };
  function openPanel(title, tip) { fitPanel();
    PANEL.innerHTML = '<div style="display:flex;align-items:center;gap:10px;background:' + cur.D.color + ';color:#fff;padding:0 0 0 12px;font-weight:900;font-size:14px;flex:none;min-height:46px"><span style="flex:1;min-width:0;padding:6px 0;line-height:1.2">' + title + '</span><span style="white-space:nowrap">' + cur.D.name + '</span><button data-stop style="align-self:stretch;min-width:72px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 13px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">STOP</button></div>'
      + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;padding:8px;box-sizing:border-box"><canvas data-cv style="flex:1 1 0;min-height:0;width:100%;display:block;touch-action:none;background:#2a2826"></canvas></div>'
      + '<div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:14px;padding:9px 12px;line-height:1.25">' + tip + '</div>';
    PANEL.style.display = 'flex'; PANEL.querySelector('[data-stop]').onclick = () => quit(); J.cv = PANEL.querySelector('[data-cv]'); }
  const hidePanel = () => { PANEL.style.display = 'none'; PANEL.innerHTML = ''; };
  const ptOf = e => { const r = J.cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; };
  function bindCv(down, move, up) { const cv = J.cv; cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; J.down = true; down && down(ptOf(e)); }; cv.onpointermove = e => { if (move) move(ptOf(e), J.down); }; cv.onpointerup = cv.onpointercancel = e => { const was = J.down; J.down = false; if (up && was) up(ptOf(e)); }; }
  const done1 = () => { if (!J || J.over) return; J.over = true; setTimeout(finishJob, 800); };
  const txt = (g, t, x, y, size, col = '#fff', wt = 900) => { g.fillStyle = col; g.font = wt + ' ' + size + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(t, x, y); };
  const fitT = (g, t, max, size, wt = 900) => { let s = size; g.font = wt + ' ' + s + 'px Archivo, sans-serif'; while (g.measureText(t).width > max && s > 9) { s -= 1; g.font = wt + ' ' + s + 'px Archivo, sans-serif'; } return s; };
  const GD = {};
  // ---------- SPORT 1 · RESTOCK THE BALLS: drag each ball into the cage of its sport (2 rounds: 3 cages + 8 balls, 4 cages + 10 balls) ----------
  const BT = { basket: { name: 'BASKETBALL', col: '#e8742a' }, soccer: { name: 'SOCCER', col: '#f3f2f2' }, tennis: { name: 'TENNIS', col: '#cfe04a' }, volley: { name: 'VOLLEYBALL', col: '#ffd23a' } };
  function drawBall(g, x, y, r, k) { g.save(); g.translate(x, y); g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = BT[k].col; g.fill(); g.clip(); g.lineWidth = Math.max(2, r * 0.1);
    if (k === 'basket') { g.strokeStyle = INK; g.beginPath(); g.moveTo(-r, 0); g.lineTo(r, 0); g.moveTo(0, -r); g.lineTo(0, r); g.stroke(); g.beginPath(); g.arc(-r * 1.25, 0, r * 0.85, -1, 1); g.stroke(); g.beginPath(); g.arc(r * 1.25, 0, r * 0.85, Math.PI - 1, Math.PI + 1); g.stroke(); }
    else if (k === 'soccer') { g.fillStyle = INK; const pent = (cx, cy, s) => { g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; g.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s); } g.fill(); }; pent(0, 0, r * 0.36); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; pent(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95, r * 0.3); } }
    else if (k === 'tennis') { g.strokeStyle = '#fbfbf7'; g.lineWidth = Math.max(2, r * 0.14); g.beginPath(); g.arc(-r * 1.1, 0, r * 0.8, -1.1, 1.1); g.stroke(); g.beginPath(); g.arc(r * 1.1, 0, r * 0.8, Math.PI - 1.1, Math.PI + 1.1); g.stroke(); }
    else { g.fillStyle = '#2e86b8'; g.beginPath(); g.arc(-r * 0.4, -r * 1.1, r * 1.1, 0, 7); g.fill(); g.fillStyle = '#fbfbf7'; g.beginPath(); g.arc(r * 0.9, r * 0.7, r * 0.9, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = Math.max(1.5, r * 0.06); g.beginPath(); g.arc(0, 0, r * 0.98, 0, 7); g.stroke(); }
    g.restore(); g.beginPath(); g.arc(x, y, r, 0, 7); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); }
  GD.balls = { tip: 'ROUND 1 / 2 \u00b7 DRAG EACH BALL INTO ITS CAGE',
    begin() { J.round = 0; this.setup(); bindCv(p => this.down(p), (p, d) => { if (d && J.held) { J.held.x = clamp(p.x / p.w, 0.04, 0.96); J.held.y = clamp(p.y / p.h, 0.04, 0.96); } }, p => this.up(p)); },
    setup() { J.cages = J.round ? ['basket', 'soccer', 'tennis', 'volley'] : ['basket', 'soccer', 'tennis']; shuffle(J.cages); const n = J.round ? 10 : 8, kinds = [];
      for (let i = 0; i < n; i++) kinds.push(J.cages[i % J.cages.length]); shuffle(kinds); J.balls = kinds.map((k, i) => { const hx = 0.1 + (i % 5) * 0.2 + rnd(-0.04, 0.04), hy = 0.62 + Math.floor(i / 5) * 0.17 + rnd(-0.03, 0.03); return { k, x: hx, y: hy, hx, hy, in: -1, back: 0 }; }); J.held = null; J.inN = 0; J.fl = null; },
    geom(w, h) { const n = J.cages.length; return { cw: w / n, top: h * 0.05, bot: h * 0.42, r: clamp(Math.min(w, h) * 0.058, 16, 30) }; },
    down(p) { if (J.over) return; const { r } = this.geom(p.w, p.h); let best = null, bd = 1e9; for (const b of J.balls) { if (b.in >= 0) continue; const d = Math.hypot(b.x * p.w - p.x, b.y * p.h - p.y); if (d < Math.max(r * 1.7, 30) && d < bd) { bd = d; best = b; } } if (best) { J.held = best; best.back = 0; blip(); } },
    up(p) { const b = J.held; J.held = null; if (!b || J.over) return; const G2 = this.geom(p.w, p.h);
      if (p.y < G2.bot + G2.r) { const ci = clamp(Math.floor(p.x / G2.cw), 0, J.cages.length - 1); if (J.cages[ci] === b.k) { b.in = ci; J.inN++; thud(); J.fl = { ci, t: 0.4, ok: true };
          if (J.inN >= J.balls.length) { J.round++; if (J.round >= 2) { setTip('EVERY BALL HOME!'); ding(); done1(); } else { ding(); setTip('ROUND 2 / 2 \u00b7 A NEW CAGE: VOLLEYBALL'); setTimeout(() => { if (J && J.g === 'balls') this.setup(); }, 700); } } }
        else { J.fl = { ci, t: 0.4, ok: false }; missOne('THAT CAGE IS ' + BT[J.cages[ci]].name + ' \u00b7 THIS IS ' + BT[b.k].name); b.back = 1; } }
      else { b.y = Math.max(b.y, 0.52); b.hx = b.x; b.hy = b.y; } },
    tick(dt) { for (const b of J.balls) if (b.back > 0) { b.back = Math.max(0, b.back - dt * 3); b.x += (b.hx - b.x) * Math.min(1, dt * 10); b.y += (b.hy - b.y) * Math.min(1, dt * 10); } if (J.fl && (J.fl.t -= dt) <= 0) J.fl = null; },
    draw(g, w, h) { g.fillStyle = '#6f6a63'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { g.fillStyle = (i + j) % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.06)'; g.fillRect(i * w / 6, j * h / 6, w / 6 + 1, h / 6 + 1); }
      const { cw, top, bot, r } = this.geom(w, h);
      J.cages.forEach((k, i) => { const x0 = i * cw + 6, x1 = (i + 1) * cw - 6; g.fillStyle = J.fl && J.fl.ci === i ? (J.fl.ok ? 'rgba(124,255,155,.35)' : 'rgba(236,48,19,.45)') : 'rgba(32,30,29,.35)'; g.fillRect(x0, top, x1 - x0, bot - top);
        g.strokeStyle = '#9aa0a6'; g.lineWidth = 2; for (let x = x0; x <= x1; x += 12) { g.beginPath(); g.moveTo(x, top + 30); g.lineTo(x, bot); g.stroke(); } g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x0, top, x1 - x0, bot - top);
        g.fillStyle = BT[k].col === '#f3f2f2' ? '#f3f2f2' : BT[k].col; g.fillRect(x0, top, x1 - x0, 30); const fs = fitT(g, BT[k].name, x1 - x0 - 12, 15); txt(g, BT[k].name, x0 + 6, top + 16, fs, INK);
        const inn = J.balls.filter(b => b.in === i); inn.forEach((b, j) => { const col = j % 3, row = Math.floor(j / 3); drawBall(g, x0 + (x1 - x0) * (0.22 + col * 0.28), bot - r * 0.9 - row * r * 1.7, r * 0.8, b.k); }); });
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, h * 0.5, w, 3); txt(g, J.balls.filter(b => b.in < 0).length + ' TO GO', 10, h * 0.5 + 18, 15, PAPER);
      for (const b of J.balls) if (b.in < 0 && b !== J.held) drawBall(g, b.x * w, b.y * h, r, b.k); if (J.held) drawBall(g, J.held.x * w, J.held.y * h, r * 1.15, J.held.k); } };
  // ---------- SPORT 2 · FIT THE SHOES: read the foot on the size board, tap the box with the right sport + size (5 customers) ----------
  const SHOE = { run: { name: 'RUNNING', col: '#ec3013', for: ['A 10K RACE', 'MORNING JOGS', 'THE BEACH RUN'] }, hike: { name: 'HIKING', col: '#7a5236', for: ['A TRAIL HIKE', 'THE MOUNTAIN PATH', 'CAMPING'] }, kick: { name: 'SOCCER', col: '#2f7d5a', for: ['SUNDAY LEAGUE', 'FIVE-A-SIDE', 'PENALTY PRACTICE'] } };
  const WHO = ['KIA', 'OTTO', 'FLICK', 'PELL', 'MARLA', 'YUZU', 'MOCHI'];
  GD.shoes = { tip: 'FOX 1 / 5 \u00b7 READ THE FOOT, PICK SPORT + SIZE',
    begin() { J.n = 0; J.who = shuffle(WHO.slice()); this.next(); bindCv(p => this.tap(p)); },
    next() { const kinds = Object.keys(SHOE), k = pick(kinds), sz = 4 + Math.floor(Math.random() * 8); J.c = { k, sz, for: pick(SHOE[k].for), name: J.who[J.n % J.who.length] };
      const ops = [{ k, sz }, { k, sz: sz + (sz >= 11 ? -1 : 1) }, { k: pick(kinds.filter(q => q !== k)), sz }, { k: pick(kinds.filter(q => q !== k)), sz: clamp(sz + pick([-2, -1, 1, 2]), 4, 11) }];
      J.ops = shuffle(ops.filter((o, i) => ops.findIndex(q => q.k === o.k && q.sz === o.sz) === i)); while (J.ops.length < 4) J.ops.push({ k: pick(kinds), sz: clamp(sz + pick([-3, 3]), 4, 11) }); J.fl = null; J.wait = 0; },
    geom(w, h) { const land = w > h * 1.15; return land ? { land, top: [0, 0, w * 0.5, h], ops: [w * 0.5, 0, w * 0.5, h] } : { land, top: [0, 0, w, h * 0.5], ops: [0, h * 0.5, w, h * 0.5] }; },
    boxes(w, h) { const { ops: [x, y, bw, bh] } = this.geom(w, h), pad = 8, cw = (bw - pad * 3) / 2, ch = (bh - pad * 3) / 2; return J.ops.map((o, i) => ({ o, i, x: x + pad + (i % 2) * (cw + pad), y: y + pad + Math.floor(i / 2) * (ch + pad), w: cw, h: ch })); },
    tap(p) { if (J.over || J.wait > 0) return; const B = this.boxes(p.w, p.h).find(q => p.x > q.x && p.x < q.x + q.w && p.y > q.y && p.y < q.y + q.h); if (!B) return; const o = B.o, c = J.c;
      if (o.k === c.k && o.sz === c.sz) { ding(); J.fl = { i: B.i, ok: true }; J.n++; J.wait = 0.8; setTip(c.name + ': PERFECT FIT!'); if (J.n >= 5) { done1(); return; } setTimeout(() => { if (J && J.g === 'shoes') { this.next(); setTip('FOX ' + (J.n + 1) + ' / 5 \u00b7 READ THE FOOT, PICK SPORT + SIZE'); } }, 800); }
      else { J.fl = { i: B.i, ok: false }; J.wait = 0.4; missOne(o.k !== c.k ? 'WRONG SPORT \u00b7 ' + c.for + ' NEEDS ' + SHOE[c.k].name : o.sz < c.sz ? 'TOO TIGHT \u00b7 SIZE ' + o.sz + ' PINCHES' : 'TOO BIG \u00b7 SIZE ' + o.sz + ' FLOPS'); } },
    tick(dt) { if (J.wait > 0) J.wait -= dt; },
    draw(g, w, h) { g.fillStyle = '#dfe7e0'; g.fillRect(0, 0, w, h); const { top: [tx, ty, tw, th] } = this.geom(w, h), c = J.c;
      // order card
      const cardW = tw * 0.5 - 12; g.fillStyle = INK; g.fillRect(tx + 8, ty + 8, cardW, 30); txt(g, c.name, tx + 16, ty + 24, fitT(g, c.name, cardW - 16, 16), YEL); g.fillStyle = PAPER; g.fillRect(tx + 8, ty + 38, cardW, th - 54); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(tx + 8, ty + 8, cardW, th - 24);
      txt(g, 'SHOES FOR', tx + 16, ty + 56, 13, INK, 800); const lines = c.for.split(' '), half = Math.ceil(lines.length / 2), L1 = lines.slice(0, half).join(' '), L2 = lines.slice(half).join(' '), fs = Math.min(fitT(g, L1, cardW - 20, 24), fitT(g, L2 || L1, cardW - 20, 24)); txt(g, L1, tx + 16, ty + 84, fs, INK); if (L2) txt(g, L2, tx + 16, ty + 84 + fs * 1.15, fs, INK);
      txt(g, 'SIZE? READ THE BOARD', tx + 16, ty + th - 30, fitT(g, 'SIZE? READ THE BOARD', cardW - 20, 12, 800), '#5a5654', 800);
      // size board + foot
      const rx = tx + tw * 0.5 + 6, rw = tw * 0.5 - 14, ry0 = ty + 14, ry1 = ty + th - 14, ys = s => ry1 - (s - 2) / 10 * (ry1 - ry0); g.fillStyle = '#c9a06a'; g.fillRect(rx, ry0, rw, ry1 - ry0); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(rx, ry0, rw, ry1 - ry0);
      for (let s = 4; s <= 12; s++) { const y = ys(s); g.fillStyle = INK; g.fillRect(rx, y - 1, rw * 0.22, 3); txt(g, String(s), rx + rw * 0.25, y, clamp((ry1 - ry0) / 14, 10, 18), INK); }
      const fx = rx + rw * 0.68, toe = ys(c.sz) + 2, heel = ry1 - 4, fl = heel - toe, fw = Math.min(rw * 0.42, fl * 0.42); g.fillStyle = '#e9b98a'; g.beginPath(); g.ellipse(fx, toe + fl * 0.42, fw * 0.5, fl * 0.42, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(fx, heel - fl * 0.2, fw * 0.36, fl * 0.2, 0, 0, 7); g.fill();
      g.fillStyle = '#b97a52'; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(fx - fw * 0.36 + i * fw * 0.24, toe + fw * 0.12 + (i === 0 || i === 3 ? fw * 0.1 : 0), fw * 0.1, fw * 0.12, 0, 0, 7); g.fill(); } g.beginPath(); g.ellipse(fx, toe + fl * 0.45, fw * 0.24, fl * 0.14, 0, 0, 7); g.fill();
      g.strokeStyle = RED; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(rx + rw * 0.22, toe); g.lineTo(rx + rw, toe); g.stroke(); g.setLineDash([]);
      // shoe boxes
      for (const B of this.boxes(w, h)) { const S = SHOE[B.o.k], fl2 = J.fl && J.fl.i === B.i; g.fillStyle = fl2 ? (J.fl.ok ? '#7cff9b' : RED) : PAPER; g.fillRect(B.x, B.y, B.w, B.h); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(B.x, B.y, B.w, B.h); g.fillStyle = S.col; g.fillRect(B.x, B.y, B.w, Math.min(30, B.h * 0.24));
        txt(g, S.name, B.x + 8, B.y + Math.min(15, B.h * 0.12), fitT(g, S.name, B.w - 16, 15), '#fff');
        const sx = B.x + B.w * 0.1, sy = B.y + B.h * 0.62, sw = B.w * 0.5, sh = B.h * 0.22; g.fillStyle = S.col; g.beginPath(); g.moveTo(sx, sy + sh); g.lineTo(sx, sy + sh * 0.2); g.lineTo(sx + sw * 0.35, sy); g.lineTo(sx + sw * 0.6, sy + sh * 0.45); g.lineTo(sx + sw, sy + sh * 0.6); g.lineTo(sx + sw, sy + sh); g.closePath(); g.fill(); g.fillStyle = INK; g.fillRect(sx - 2, sy + sh, sw + 4, Math.max(4, sh * 0.2));
        if (B.o.k === 'kick') for (let i = 0; i < 3; i++) g.fillRect(sx + sw * (0.15 + i * 0.32), sy + sh + Math.max(4, sh * 0.2), 5, 5);
        const fs2 = clamp(B.h * 0.3, 16, 40); txt(g, String(B.o.sz), B.x + B.w * 0.66, B.y + B.h * 0.66, fs2, INK); txt(g, 'SIZE', B.x + B.w * 0.66, B.y + B.h * 0.66 - fs2 * 0.75, clamp(fs2 * 0.32, 10, 13), '#5a5654', 800); } } };
  // ---------- shared T-shirt drawing (Funny T-Shirts jobs) ----------
  const TEE = { super: { col: '#2e5f8a', ink: '#ffd23a', l: ['SUPER', 'FOX'], name: 'SUPER FOX' }, meru: { col: '#f3f2f2', ink: '#ec3013', l: ['I \u2665', 'MERU'], name: 'I \u2665 MERU' }, iron: { col: '#c8262c', ink: '#f3f2f2', l: ['IRON', 'FOX'], name: 'IRON FOX' },
    robot: { col: '#8a9096', ink: '#201e1d', l: ['ROBOTS', 'ARE', 'ALIVE'], name: 'ROBOTS ARE ALIVE' }, king: { col: '#201e1d', ink: '#ffd23a', l: ['KING', 'MIGHT...', 'NOT!'], name: 'KING MIGHT... NOT!' },
    nap: { col: '#3f9a5e', ink: '#f3f2f2', l: ['NAP', 'CHAMP'], name: 'NAP CHAMP' }, gelato: { col: '#f3b6c8', ink: '#201e1d', l: ['GOT', 'GELATO?'], name: 'GOT GELATO?' } };
  function drawTee(g, cx, cy, w, col, lines, ink, frac = 1) { const s = w / 256; g.save(); g.translate(cx - 128 * s, cy - 131 * s); g.scale(s, s);
    if (col) { g.beginPath(); g.moveTo(84, 18); g.quadraticCurveTo(128, 46, 172, 18); g.lineTo(246, 58); g.lineTo(220, 112); g.lineTo(192, 98); g.lineTo(192, 244); g.lineTo(64, 244); g.lineTo(64, 98); g.lineTo(36, 112); g.lineTo(10, 58); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
    if (lines && frac > 0) { g.save(); g.beginPath(); g.rect(0, 0, 64 + 128 * frac, 256); g.clip(); g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; const n = lines.length, fs = n > 2 ? 30 : 40, y0 = 160 - (n - 1) * fs * 0.55;
      lines.forEach((t, i) => { g.font = '900 ' + fs + 'px Archivo, sans-serif'; g.fillText(t, 128, y0 + i * fs * 1.1, 118); }); g.restore(); }
    g.restore(); }
  const inR = (p, r) => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
  const cell = (g, r, fill, fl, sel) => { g.fillStyle = fl ? (fl.ok ? '#7cff9b' : RED) : fill; g.fillRect(r.x, r.y, r.w, r.h); g.strokeStyle = sel ? '#2f9a4a' : INK; g.lineWidth = sel ? 5 : 3; g.strokeRect(r.x, r.y, r.w, r.h); };
  const ctext = (g, t, x, y, size, col) => { g.save(); g.textAlign = 'center'; txt(g, t, x, y, size, col); g.restore(); };
  const grid = (x, y, w, h, n, row, pad = 8) => Array.from({ length: n }, (_, i) => row ? { x: x + pad + i * (w - pad) / n, y: y + pad, w: (w - pad) / n - pad, h: h - pad * 2 } : { x: x + pad, y: y + pad + i * (h - pad) / n, w: w - pad * 2, h: (h - pad) / n - pad });
  // ---------- TEES 1 · SCREEN-PRINT PRESS: per order pick the SCREEN (slogan), the INK, then PULL the squeegee all the way across in one go (4 shirts) ----------
  const INK_C = { RED: '#ec3013', YELLOW: '#ffd23a', BLUE: '#2e86b8', WHITE: '#f3f2f2', BLACK: '#201e1d' }, BLANK = { WHITE: '#f3f2f2', BLACK: '#201e1d', RED: '#c8262c', BLUE: '#2e5f8a', GREY: '#8a9096' };
  GD.press = { tip: 'SHIRT 1 / 4 \u00b7 PICK THE SCREEN FROM THE ORDER',
    begin() { J.n = 0; J.who = shuffle(WHO.slice()); this.next(); bindCv(p => this.down(p), (p, d) => this.move(p, d), p => this.up(p)); },
    next() { const sl = pick(Object.keys(TEE)), sh = pick(Object.keys(BLANK)), ink = pick(Object.keys(INK_C).filter(k => k !== sh && !(k === 'WHITE' && sh === 'GREY')));
      J.o = { sl, sh, ink, who: J.who[J.n % J.who.length] }; J.scr = shuffle([sl, ...shuffle(Object.keys(TEE).filter(k => k !== sl)).slice(0, 2)]); J.inks = shuffle([ink, ...shuffle(Object.keys(INK_C).filter(k => k !== ink)).slice(0, 3)]);
      J.step = 0; J.cov = 0; J.pull = false; J.fl = null; J.wait = 0; J.btns = []; setTip('SHIRT ' + (J.n + 1) + ' / 4 \u00b7 PICK THE SCREEN FROM THE ORDER'); },
    geom(w, h) { const land = w > h * 1.15; return land ? { land, card: [0, 0, w * 0.56, h * 0.26], bed: [0, h * 0.26, w * 0.56, h * 0.74], opt: [w * 0.56, 0, w * 0.44, h] } : { land, card: [0, 0, w, h * 0.2], bed: [0, h * 0.2, w, h * 0.44], opt: [0, h * 0.64, w, h * 0.36] }; },
    frame(w, h) { const [x, y, bw, bh] = this.geom(w, h).bed, tw = Math.min(bw * 0.7, bh * 0.95), cx = x + bw / 2, cy = y + bh / 2; return { tw, cx, cy, fx: cx - tw * 0.27, fy: cy - tw * 0.13, fw: tw * 0.54, fh: tw * 0.5 }; },
    down(p) { if (J.over || J.wait > 0) return; if (J.step < 2) { const B = J.btns.find(q => inR(p, q.r)); if (!B) return;
        if (J.step === 0) { if (B.k === J.o.sl) { J.step = 1; blip(); J.fl = { k: B.k, ok: true, t: 0.25 }; setTip('NOW PICK THE INK FROM THE ORDER'); } else { J.fl = { k: B.k, ok: false, t: 0.4 }; missOne('WRONG SCREEN \u00b7 THE ORDER SAYS ' + TEE[J.o.sl].name); } }
        else if (B.k === J.o.ink) { J.step = 2; blip(); J.fl = null; setTip('PULL THE SQUEEGEE \u2192 ALL THE WAY ACROSS'); } else { J.fl = { k: B.k, ok: false, t: 0.4 }; missOne('WRONG INK \u00b7 THE ORDER SAYS ' + J.o.ink); } return; }
      if (J.step === 2) { const F = this.frame(p.w, p.h); if (p.y < F.fy - 50 || p.y > F.fy + F.fh + 50) return; if (p.x > F.fx + F.fw * 0.35) { missOne('START AT THE LEFT EDGE OF THE SCREEN'); return; } J.pull = true; J.cov = 0; this.move(p, true); } },
    move(p, d) { if (J.step !== 2 || !J.pull || !d) return; const F = this.frame(p.w, p.h), f = clamp((p.x - F.fx) / F.fw, 0, 1); if (f > J.cov) J.cov = f;
      if (J.cov >= 0.96) { J.cov = 1; J.pull = false; J.step = 3; ding(); J.n++; J.wait = 1; setTip(J.o.who + ': CRISP PRINT!'); if (J.n >= 4) { done1(); return; } setTimeout(() => { if (J && J.g === 'press') this.next(); }, 1000); } },
    up() { if (J.step !== 2 || !J.pull) return; J.pull = false; if (J.cov < 0.96) { J.cov = 0; missOne('PATCHY! PULL ALL THE WAY ACROSS IN ONE GO'); } },
    tick(dt) { if (J.wait > 0) J.wait -= dt; if (J.fl && (J.fl.t -= dt) <= 0) J.fl = null; },
    draw(g, w, h) { const G2 = this.geom(w, h), o = J.o, F = this.frame(w, h); g.fillStyle = '#3a3634'; g.fillRect(0, 0, w, h);
      const [cx0, cy0, cw, ch] = G2.card; g.fillStyle = PAPER; g.fillRect(cx0 + 8, cy0 + 8, cw - 16, ch - 12); g.fillStyle = INK; g.fillRect(cx0 + 8, cy0 + 8, 10, ch - 12); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(cx0 + 8, cy0 + 8, cw - 16, ch - 12);
      const lh = (ch - 20) / 3, fs = clamp(lh * 0.62, 11, 22), sw = clamp(lh * 0.7, 12, 22), L1 = 'ORDER \u00b7 ' + o.who + ' \u00b7 ' + Math.min(4, J.n + (J.step > 2 ? 0 : 1)) + ' / 4', L2 = (J.step > 0 ? '\u2713 ' : '') + 'SCREEN: ' + TEE[o.sl].name, L3 = (J.step > 1 ? '\u2713 ' : '') + 'INK: ' + o.ink + ' ON A ' + o.sh + ' TEE';
      txt(g, L1, cx0 + 26, cy0 + 10 + lh * 0.5, fitT(g, L1, cw - 44, fs * 0.8, 800), '#5a5654', 800); txt(g, L2, cx0 + 26, cy0 + 10 + lh * 1.5, fitT(g, L2, cw - 44, fs), INK);
      g.fillStyle = INK_C[o.ink]; g.fillRect(cx0 + 26, cy0 + 10 + lh * 2.5 - sw / 2, sw, sw); g.strokeStyle = INK; g.strokeRect(cx0 + 26, cy0 + 10 + lh * 2.5 - sw / 2, sw, sw); txt(g, L3, cx0 + 34 + sw, cy0 + 10 + lh * 2.5, fitT(g, L3, cw - 52 - sw, fs), INK);
      const [bx, by, bw, bh] = G2.bed; g.fillStyle = '#55504c'; g.fillRect(bx + 8, by + 4, bw - 16, bh - 8); g.fillStyle = '#2a2826'; g.fillRect(F.cx - F.tw * 0.32, by + 4, F.tw * 0.64, bh - 8);
      drawTee(g, F.cx, F.cy, F.tw, BLANK[o.sh], J.step >= 2 ? TEE[o.sl].l : null, INK_C[o.ink], J.step >= 3 ? 1 : J.step === 2 ? J.cov : 0);
      if (J.step >= 1 && J.step < 3) { g.fillStyle = 'rgba(230,240,255,0.18)'; g.fillRect(F.fx, F.fy, F.fw, F.fh); g.strokeStyle = '#c9a06a'; g.lineWidth = 7; g.strokeRect(F.fx, F.fy, F.fw, F.fh); drawTee(g, F.cx, F.cy, F.tw, null, TEE[o.sl].l, 'rgba(255,255,255,0.45)', 1); }
      if (J.step === 2) { const x = F.fx + J.cov * F.fw; g.fillStyle = INK; g.fillRect(x - 5, F.fy - 12, 10, F.fh + 24); g.fillStyle = YEL; g.fillRect(x - 16, F.fy - 34, 32, 24); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x - 16, F.fy - 34, 32, 24); if (!J.pull && J.cov === 0) txt(g, 'PULL \u2192', F.fx + F.fw + 14, F.cy, clamp(F.tw * 0.08, 14, 26), YEL); }
      const [ox, oy, ow, oh] = G2.opt, head = 30; J.btns = [];
      if (J.step < 2) { const ks = J.step === 0 ? J.scr : J.inks, T2 = J.step === 0 ? 'PICK THE SCREEN' : 'PICK THE INK'; txt(g, T2, ox + 12, oy + head / 2 + 4, 15, YEL);
        grid(ox, oy + head, ow, oh - head, ks.length, !G2.land).forEach((r, i) => { const k = ks[i], fl = J.fl && J.fl.k === k ? J.fl : null; J.btns.push({ k, r });
          if (J.step === 0) { cell(g, r, '#dfe4e8', fl); g.strokeStyle = '#c9a06a'; g.lineWidth = 5; g.strokeRect(r.x + 6, r.y + 6, r.w - 12, r.h - 12); const L = TEE[k].l, fs2 = Math.min(r.h * 0.7 / L.length, ...L.map(t => fitT(g, t, r.w - 28, 30))); L.forEach((t, j) => ctext(g, t, r.x + r.w / 2, r.y + r.h / 2 + (j - (L.length - 1) / 2) * fs2 * 1.1, fs2, INK)); }
          else { cell(g, r, INK_C[k], fl); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(r.x + 3, r.y + 3, r.w - 6, Math.min(14, r.h * 0.2)); ctext(g, k, r.x + r.w / 2, r.y + r.h / 2, fitT(g, k, r.w - 16, 22), k === 'WHITE' || k === 'YELLOW' ? INK : '#ffffff'); } }); }
      else { const m = J.step === 2 ? ['DRAG THE SQUEEGEE', 'LEFT \u2192 RIGHT', 'IN ONE PULL'] : ['CRISP PRINT!']; m.forEach((t, j) => txt(g, t, ox + 14, oy + oh / 2 + (j - (m.length - 1) / 2) * 30, fitT(g, t, ow - 28, 24), j ? PAPER : YEL)); } } };
  // ---------- TEES 2 · DRESS THE MANNEQUINS: read the window card (hat + tee + bottom), tap the matching piece in each row (4 windows; 3 then 4 choices per row) ----------
  const HAT = { cap: 'BALL CAP', sun: 'SUN HAT', beanie: 'BEANIE', crown: 'PAPER CROWN' }, BOT = { shorts: 'SHORTS', jeans: 'JEANS', skirt: 'SKIRT', track: 'TRACK PANTS' }, DTEE = ['super', 'meru', 'iron', 'robot', 'king'];
  const LOOKS = [{ name: 'BEACH DAY', hat: 'sun', tee: 'meru', bot: 'shorts' }, { name: 'GAME NIGHT', hat: 'cap', tee: 'super', bot: 'track' }, { name: 'WINTER SALE', hat: 'beanie', tee: 'iron', bot: 'jeans' }, { name: 'ROYAL ROAST', hat: 'crown', tee: 'king', bot: 'skirt' },
    { name: 'ROBOT RAVE', hat: 'beanie', tee: 'robot', bot: 'skirt' }, { name: 'PARK JOG', hat: 'cap', tee: 'iron', bot: 'shorts' }, { name: 'MOVIE DATE', hat: 'crown', tee: 'super', bot: 'jeans' }];
  function drawHat(g, k, cx, ht, u) { g.lineWidth = 2; g.strokeStyle = INK;
    if (k === 'cap') { g.fillStyle = '#ec3013'; g.beginPath(); g.arc(cx, ht, u * 0.95, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); g.fillRect(cx, ht - u * 0.12, u * 1.6, u * 0.24); g.strokeRect(cx, ht - u * 0.12, u * 1.6, u * 0.24); }
    else if (k === 'sun') { g.fillStyle = '#e8c86a'; g.beginPath(); g.ellipse(cx, ht, u * 1.7, u * 0.3, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(cx, ht - u * 0.05, u * 0.85, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#ec3013'; g.fillRect(cx - u * 0.85, ht - u * 0.32, u * 1.7, u * 0.22); }
    else if (k === 'beanie') { g.fillStyle = '#2e86b8'; g.beginPath(); g.arc(cx, ht + u * 0.1, u * 1.0, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#1d5a80'; g.fillRect(cx - u, ht - u * 0.1, u * 2, u * 0.34); g.strokeRect(cx - u, ht - u * 0.1, u * 2, u * 0.34); g.fillStyle = PAPER; g.beginPath(); g.arc(cx, ht - u * 0.95, u * 0.3, 0, 7); g.fill(); g.stroke(); }
    else { g.fillStyle = YEL; g.beginPath(); g.moveTo(cx - u * 0.95, ht + u * 0.15); g.lineTo(cx - u * 0.95, ht - u * 0.8); g.lineTo(cx - u * 0.48, ht - u * 0.3); g.lineTo(cx, ht - u * 0.95); g.lineTo(cx + u * 0.48, ht - u * 0.3); g.lineTo(cx + u * 0.95, ht - u * 0.8); g.lineTo(cx + u * 0.95, ht + u * 0.15); g.closePath(); g.fill(); g.stroke(); } }
  function drawBot(g, k, cx, y0, u, y1) { g.lineWidth = 2; g.strokeStyle = INK; const legs = (len, col) => { for (const s of [-1, 1]) { g.fillStyle = col; g.fillRect(cx + (s < 0 ? -1.1 * u : 0.08 * u), y0, 1.02 * u, len); g.strokeRect(cx + (s < 0 ? -1.1 * u : 0.08 * u), y0, 1.02 * u, len); } g.fillStyle = col; g.fillRect(cx - 1.1 * u, y0, 2.2 * u, u * 0.5); g.strokeRect(cx - 1.1 * u, y0, 2.2 * u, u * 0.5); };
    if (k === 'shorts') legs(u * 1.5, '#e8742a'); else if (k === 'jeans') { legs(y1 - y0, '#3b5f9a'); g.strokeStyle = '#e8c86a'; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(cx - 0.6 * u, y0 + u * 0.6); g.lineTo(cx - 0.6 * u, y1 - 4); g.moveTo(cx + 0.6 * u, y0 + u * 0.6); g.lineTo(cx + 0.6 * u, y1 - 4); g.stroke(); g.setLineDash([]); }
    else if (k === 'track') { legs(y1 - y0, '#201e1d'); g.fillStyle = PAPER; g.fillRect(cx - 1.1 * u + 2, y0 + u * 0.5, u * 0.14, y1 - y0 - u * 0.6); g.fillRect(cx + 1.1 * u - 2 - u * 0.14, y0 + u * 0.5, u * 0.14, y1 - y0 - u * 0.6); }
    else { g.fillStyle = '#b04a8a'; g.beginPath(); g.moveTo(cx - 1.1 * u, y0); g.lineTo(cx + 1.1 * u, y0); g.lineTo(cx + 1.7 * u, y0 + 1.9 * u); g.lineTo(cx - 1.7 * u, y0 + 1.9 * u); g.closePath(); g.fill(); g.stroke(); } }
  GD.dress = { tip: 'WINDOW 1 / 4 \u00b7 READ THE CARD, DRESS THE MANNEQUIN',
    begin() { J.n = 0; J.looks = shuffle(LOOKS.slice()); this.next(); bindCv(p => this.tap(p)); },
    next() { const L = J.looks[J.n], m = J.n < 2 ? 3 : 4, opts = (all, k) => shuffle([k, ...shuffle(all.filter(q => q !== k)).slice(0, m - 1)]);
      J.L = L; J.rows = [{ s: 'hat', label: 'HAT', ops: opts(Object.keys(HAT), L.hat) }, { s: 'tee', label: 'TEE', ops: opts(DTEE, L.tee) }, { s: 'bot', label: 'BOTTOM', ops: opts(Object.keys(BOT), L.bot) }]; J.on = {}; J.fl = null; J.wait = 0; J.btns = []; },
    nameOf: (s, k) => (s === 'hat' ? HAT[k] : s === 'bot' ? BOT[k] : TEE[k].name),
    tap(p) { if (J.over || J.wait > 0) return; const B = J.btns.find(q => inR(p, q.r)); if (!B || J.on[B.s] === B.k) return; const want = J.L[B.s];
      if (B.k === want) { J.on[B.s] = B.k; blip(); J.fl = { s: B.s, k: B.k, ok: true, t: 0.3 };
        if (['hat', 'tee', 'bot'].every(s => J.on[s])) { ding(); J.n++; J.wait = 1; setTip('WINDOW ' + J.n + ' DONE \u00b7 LOOKING SHARP!'); if (J.n >= 4) { done1(); return; }
          setTimeout(() => { if (J && J.g === 'dress') { this.next(); setTip('WINDOW ' + (J.n + 1) + ' / 4 \u00b7 READ THE CARD, DRESS THE MANNEQUIN'); } }, 1000); } }
      else { J.fl = { s: B.s, k: B.k, ok: false, t: 0.4 }; missOne('NOT THAT ONE \u00b7 THE CARD SAYS ' + this.nameOf(B.s, want)); } },
    tick(dt) { if (J.wait > 0) J.wait -= dt; if (J.fl && (J.fl.t -= dt) <= 0) J.fl = null; },
    draw(g, w, h) { g.fillStyle = '#e9e0d2'; g.fillRect(0, 0, w, h); const land = w > h * 1.15, top = land ? [0, 0, w * 0.5, h] : [0, 0, w, h * 0.44], rows = land ? [w * 0.5, 0, w * 0.5, h] : [0, h * 0.44, w, h * 0.56], L = J.L;
      // window card
      const [tx, ty, tw, th] = top, cw = tw * 0.52; g.fillStyle = PAPER; g.fillRect(tx + 8, ty + 8, cw - 8, th - 16); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(tx + 8, ty + 8, cw - 8, th - 16); g.fillStyle = INK; g.fillRect(tx + 8, ty + 8, cw - 8, 30);
      const W1 = 'WINDOW ' + Math.min(4, J.n + (J.wait > 0 ? 0 : 1)) + ' / 4'; txt(g, W1, tx + 16, ty + 24, fitT(g, W1, cw - 24, 15), YEL); const lh = (th - 54) / 4; txt(g, L.name, tx + 16, ty + 40 + lh * 0.55, fitT(g, L.name, cw - 26, clamp(lh * 0.6, 13, 26)), RED);
      [['HAT', 'hat'], ['TEE', 'tee'], ['BOTTOM', 'bot']].forEach(([lab, s], i) => { const t = (J.on[s] ? '\u2713 ' : '') + this.nameOf(s, L[s]), y = ty + 40 + lh * (1.5 + i); txt(g, lab, tx + 16, y - lh * 0.26, clamp(lh * 0.22, 9, 12), '#5a5654', 800); txt(g, t, tx + 16, y + lh * 0.1, fitT(g, t, cw - 26, clamp(lh * 0.4, 11, 20)), J.on[s] ? '#2f7d4a' : INK); });
      // the mannequin
      const mx = tx + cw + 4, mw = tw - cw - 8, my = ty + 8, mh = th - 16, u = Math.min(mh * 0.092, mw / 5), cx = mx + mw / 2, base = my + mh - 6, hy = my + mh * 0.04 + 1.6 * u, s = 4.4 * u / 256, teeCy = hy + 0.95 * u + 113 * s, waist = teeCy + 100 * s, ankle = base - 0.6 * u;
      g.fillStyle = '#d6cbb8'; g.fillRect(mx, my, mw, mh); g.fillStyle = '#3d3b3a'; g.beginPath(); g.ellipse(cx, base - 4, u * 1.4, u * 0.3, 0, 0, 7); g.fill(); g.fillRect(cx - 2, ankle, 4, base - ankle);
      g.fillStyle = '#f1ece4'; g.strokeStyle = INK; g.lineWidth = 2; for (const sx of [-1.0, 0.15]) { g.fillRect(cx + sx * u, waist, 0.85 * u, ankle - waist); g.strokeRect(cx + sx * u, waist, 0.85 * u, ankle - waist); }
      if (J.on.bot) drawBot(g, J.on.bot, cx, waist - 2, u, ankle);
      const T2 = J.on.tee && TEE[J.on.tee]; drawTee(g, cx, teeCy, 4.4 * u, T2 ? T2.col : '#f1ece4', T2 ? T2.l : null, T2 ? T2.ink : INK);
      g.fillStyle = '#f1ece4'; g.beginPath(); g.ellipse(cx, hy, 0.8 * u, 1.0 * u, 0, 0, 7); g.fill(); g.stroke(); if (J.on.hat) drawHat(g, J.on.hat, cx, hy - 0.7 * u, u);
      // the rows of pieces
      const [rx, ry, rw, rh] = rows, lab = land ? 0 : 64; J.btns = [];
      J.rows.forEach((R, i) => { const y = ry + i * rh / 3, hh = rh / 3; if (land) txt(g, R.label, rx + 10, y + 12, 12, INK, 800); else txt(g, R.label, rx + 10, y + hh / 2, fitT(g, R.label, lab - 14, 13), INK, 800);
        grid(rx + lab, y + (land ? 18 : 0), rw - lab, hh - (land ? 18 : 0), R.ops.length, true, 6).forEach((r, j) => { const k = R.ops[j], fl = J.fl && J.fl.s === R.s && J.fl.k === k ? J.fl : null; J.btns.push({ s: R.s, k, r }); cell(g, r, PAPER, fl, J.on[R.s] === k);
          const cx2 = r.x + r.w / 2, ph = r.h - 20, uu = Math.min(ph / 3.2, r.w / 4); if (R.s === 'hat') drawHat(g, k, cx2, r.y + ph * 0.7, uu); else if (R.s === 'tee') { const TT = TEE[k]; drawTee(g, cx2, r.y + ph / 2 + 4, Math.min(ph * 1.05, r.w - 8), TT.col, TT.l, TT.ink); } else drawBot(g, k, cx2, r.y + 6, uu * 0.85, r.y + ph);
          const nm = this.nameOf(R.s, k); ctext(g, nm, cx2, r.y + r.h - 9, fitT(g, nm, r.w - 8, 11, 800), INK); }); }); } };
  // ---------- shared TV channels (Electronics jobs) ----------
  const CH = { 1: { name: 'NEWS', col: '#2e5f8a' }, 2: { name: 'CARTOONS', col: '#ffd23a' }, 3: { name: 'WEATHER', col: '#38bdf8' }, 4: { name: 'SPORTS', col: '#2f7d5a' }, 5: { name: 'COOKING', col: '#e8742a' } };
  const chInk = k => (k == 2 || k == 3 ? INK : '#ffffff');
  function drawStatic(g, x, y, w, h) { g.fillStyle = '#3c3c3c'; g.fillRect(x, y, w, h); const n = Math.min(160, Math.round(w * h / 90)); for (let i = 0; i < n; i++) { const v = 60 + Math.floor(Math.random() * 190); g.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; g.fillRect(x + Math.random() * (w - 4), y + Math.random() * (h - 3), 2 + Math.random() * 6, 2); } }
  function drawCh(g, k, x, y, w, h, label) { const u = Math.min(w, h * 1.4), cx = x + w / 2, cy = y + h * (label ? 0.4 : 0.5), s = u * 0.22; g.fillStyle = CH[k].col; g.fillRect(x, y, w, h); g.lineWidth = Math.max(2, u * 0.03); g.strokeStyle = INK;
    if (k == 1) { g.fillStyle = '#c98a4a'; g.beginPath(); g.arc(cx, cy - s * 0.5, s * 0.55, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#f3f2f2'; g.fillRect(cx - s * 1.6, cy + s * 0.2, s * 3.2, s * 0.8); g.strokeRect(cx - s * 1.6, cy + s * 0.2, s * 3.2, s * 0.8); }
    else if (k == 2) { g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(cx, cy, s, 0, 7); g.fill(); g.stroke(); g.fillStyle = INK; g.fillRect(cx - s * 0.45, cy - s * 0.4, s * 0.22, s * 0.3); g.fillRect(cx + s * 0.23, cy - s * 0.4, s * 0.22, s * 0.3); g.beginPath(); g.arc(cx, cy + s * 0.05, s * 0.55, 0.3, Math.PI - 0.3); g.stroke(); }
    else if (k == 3) { g.fillStyle = YEL; g.beginPath(); g.arc(cx - s * 0.5, cy - s * 0.3, s * 0.7, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#f3f2f2'; for (const [dx, dy, r] of [[0, 0.35, 0.55], [0.6, 0.25, 0.65], [1.1, 0.45, 0.45]]) { g.beginPath(); g.arc(cx + dx * s, cy + dy * s, r * s, 0, 7); g.fill(); } }
    else if (k == 4) { g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(cx, cy, s, 0, 7); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; g.lineTo(cx + Math.cos(a) * s * 0.42, cy + Math.sin(a) * s * 0.42); } g.fill(); }
    else { g.fillStyle = INK; g.fillRect(cx - s, cy - s * 0.2, s * 2, s * 1.1); g.fillRect(cx - s * 1.3, cy - s * 0.35, s * 2.6, s * 0.22); g.strokeStyle = '#f3f2f2'; for (const dx of [-0.5, 0, 0.5]) { g.beginPath(); g.moveTo(cx + dx * s, cy - s * 0.55); g.quadraticCurveTo(cx + dx * s + s * 0.25, cy - s * 0.85, cx + dx * s, cy - s * 1.15); g.stroke(); } }
    if (label) { const bh = h * 0.24; g.fillStyle = INK; g.fillRect(x, y + h - bh, w, bh); const t = 'CH ' + k + ' \u00b7 ' + CH[k].name; txt(g, t, x + 6, y + h - bh / 2, fitT(g, t, w - 12, Math.min(18, bh * 0.7)), '#ffffff'); } }
  // ---------- ELEC 1 · TUNE THE TV WALL: pick a channel, tap the screens the PLAN gives it (3 walls: 2x2 / 3x2 / 3x3) ----------
  const TUNE_R = [{ c: 2, r: 2, n: 2 }, { c: 3, r: 2, n: 3 }, { c: 3, r: 3, n: 4 }];
  GD.tune = { tip: 'WALL 1 / 3 \u00b7 PICK A CHANNEL, THEN TAP ITS SCREENS',
    begin() { J.round = 0; this.setup(); bindCv(p => this.tap(p)); },
    setup() { const R = TUNE_R[J.round], chs = shuffle([1, 2, 3, 4, 5]).slice(0, R.n), plan = []; for (let i = 0; i < R.c * R.r; i++) plan.push(chs[i % R.n]); shuffle(plan);
      J.R = R; J.plan = plan; J.set = plan.map(() => 0); J.sel = 0; J.fl = null; J.wait = 0; J.btns = []; J.tvs = []; setTip('WALL ' + (J.round + 1) + ' / 3 \u00b7 PICK A CHANNEL, THEN TAP ITS SCREENS'); },
    geom(w, h) { const land = w > h * 1.15; return land ? { land, plan: [0, 0, w * 0.36, h * 0.4], btn: [0, h * 0.4, w * 0.36, h * 0.6], wall: [w * 0.36, 0, w * 0.64, h] } : { land, plan: [0, 0, w, h * 0.26], wall: [0, h * 0.26, w, h * 0.48], btn: [0, h * 0.74, w, h * 0.26] }; },
    tap(p) { if (J.over || J.wait > 0) return; const B = J.btns.find(q => inR(p, q.r)); if (B) { J.sel = B.k; blip(); setTip('CH ' + B.k + ' \u00b7 ' + CH[B.k].name + ' \u00b7 NOW TAP ITS SCREENS'); return; }
      const T = J.tvs.find(q => inR(p, q.r)); if (!T || J.set[T.i]) return; if (!J.sel) { setTip('PICK A CHANNEL FIRST', true); nope(); return; }
      if (J.plan[T.i] === J.sel) { J.set[T.i] = J.sel; tone(1046, 0.04, 0.15); J.fl = { i: T.i, ok: true, t: 0.3 };
        if (J.set.every(v => v)) { J.round++; ding(); J.wait = 1; if (J.round >= TUNE_R.length) { setTip('THE WHOLE WALL IS TUNED!'); done1(); return; } setTip('WALL ' + J.round + ' TUNED!'); setTimeout(() => { if (J && J.g === 'tune') this.setup(); }, 1000); } }
      else { J.fl = { i: T.i, ok: false, t: 0.4 }; missOne('THE PLAN SAYS CH ' + J.plan[T.i] + ' \u00b7 ' + CH[J.plan[T.i]].name + ' THERE'); } },
    tick(dt) { if (J.wait > 0) J.wait -= dt; if (J.fl && (J.fl.t -= dt) <= 0) J.fl = null; },
    draw(g, w, h) { const G2 = this.geom(w, h), R = J.R; g.fillStyle = '#2a2b2e'; g.fillRect(0, 0, w, h);
      const [px, py, pw, ph] = G2.plan; g.fillStyle = PAPER; g.fillRect(px + 8, py + 8, pw - 16, ph - 12); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(px + 8, py + 8, pw - 16, ph - 12); g.fillStyle = INK; g.fillRect(px + 8, py + 8, pw - 16, 28);
      const T1 = 'THE PLAN \u00b7 WALL ' + Math.min(3, J.round + 1) + ' / 3'; txt(g, T1, px + 16, py + 22, fitT(g, T1, pw - 32, 15), YEL);
      { const ax = px + 16, ay = py + 42, aw = pw - 32, ah = ph - 54, cw = Math.min(aw / R.c, ah / R.r * 1.5), ch = cw / 1.5, ox = ax, oy = ay + (ah - ch * R.r) / 2;
        for (let i = 0; i < J.plan.length; i++) { const k = J.plan[i], x = ox + (i % R.c) * cw, y = oy + Math.floor(i / R.c) * ch; g.fillStyle = CH[k].col; g.fillRect(x + 2, y + 2, cw - 4, ch - 4); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x + 2, y + 2, cw - 4, ch - 4);
          ctext(g, J.set[i] ? '\u2713' : String(k), x + cw / 2, y + ch / 2, clamp(ch * 0.55, 11, 30), chInk(k)); } }
      const [wx, wy, ww, wh] = G2.wall, pad = 8, cw = (ww - pad) / R.c, chh = (wh - pad) / R.r, tw = Math.min(cw - pad, (chh - pad) * 1.55), th = tw / 1.55, ox = wx + (ww - (tw + pad) * R.c + pad) / 2, oy = wy + (wh - (th + pad) * R.r + pad) / 2; J.tvs = [];
      g.fillStyle = '#1c1d20'; g.fillRect(wx + 4, wy + 4, ww - 8, wh - 8);
      for (let i = 0; i < J.plan.length; i++) { const x = ox + (i % R.c) * (tw + pad), y = oy + Math.floor(i / R.c) * (th + pad), r = { x, y, w: tw, h: th }; J.tvs.push({ i, r }); g.fillStyle = '#0c0d0f'; g.fillRect(x, y, tw, th); const inn = Math.max(4, tw * 0.05);
        if (J.set[i]) drawCh(g, J.set[i], x + inn, y + inn, tw - inn * 2, th - inn * 2, th > 70); else { drawStatic(g, x + inn, y + inn, tw - inn * 2, th - inn * 2); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x + inn, y + th / 2 - 12, tw - inn * 2, 24); ctext(g, 'NO SIGNAL', x + tw / 2, y + th / 2, fitT(g, 'NO SIGNAL', tw - inn * 4, 15), '#ffffff'); }
        if (J.fl && J.fl.i === i) { g.strokeStyle = J.fl.ok ? '#7cff9b' : RED; g.lineWidth = 6; g.strokeRect(x - 2, y - 2, tw + 4, th + 4); } }
      const [bx, by, bw, bh] = G2.btn; J.btns = []; const ks = [1, 2, 3, 4, 5];
      const cells = G2.land ? ks.map((k, i) => { const cw2 = (bw - 24) / 2, ch2 = (bh - 32) / 3; return { x: bx + 8 + (i % 2) * (cw2 + 8), y: by + 8 + Math.floor(i / 2) * (ch2 + 8), w: i === 4 ? cw2 * 2 + 8 : cw2, h: ch2 }; }) : grid(bx, by, bw, bh, 5, true, 6);
      ks.forEach((k, i) => { const r = cells[i], sel = J.sel === k; J.btns.push({ k, r }); g.fillStyle = CH[k].col; g.fillRect(r.x, r.y, r.w, r.h); g.strokeStyle = sel ? '#ffffff' : INK; g.lineWidth = sel ? 6 : 3; g.strokeRect(r.x, r.y, r.w, r.h);
        const big = G2.land ? r.h * 0.5 : Math.min(r.w * 0.5, r.h * 0.34); ctext(g, String(k), r.x + r.w / 2, r.y + r.h * (G2.land ? 0.36 : 0.36), clamp(big, 14, 40), chInk(k)); ctext(g, CH[k].name, r.x + r.w / 2, r.y + r.h * (G2.land ? 0.78 : 0.78), fitT(g, CH[k].name, r.w - 8, 14), chInk(k)); }); } };
  // ---------- ELEC 2 · FIX A TV: read the complaint, find it on the TROUBLESHOOT chart, pick the part, drag it into the glowing slot, POWER ON (4 sets) ----------
  const PART = { ant: { name: 'ANTENNA', col: '#8a9096' }, spk: { name: 'SPEAKER', col: '#201e1d' }, cab: { name: 'CABLE', col: '#2e86b8' }, fuse: { name: 'FUSE', col: '#ffd23a' }, cord: { name: 'CORD', col: '#ec3013' } };
  const SYM = [{ s: 'FUZZY', p: 'ant', say: 'IS ALL FUZZY' }, { s: 'NO SOUND', p: 'spk', say: 'HAS NO SOUND' }, { s: 'NO PICTURE', p: 'cab', say: 'HAS NO PICTURE' }, { s: 'WON\'T TURN ON', p: 'fuse', say: 'WON\'T TURN ON' }, { s: 'FLICKERS', p: 'cord', say: 'FLICKERS' }];
  const SLOT = { ant: [0.5, 0.16], spk: [0.17, 0.5], cab: [0.5, 0.5], fuse: [0.83, 0.78], cord: [0.2, 0.82] };
  function drawPart(g, k, cx, cy, u) { g.lineWidth = Math.max(2, u * 0.08); g.strokeStyle = INK;
    if (k === 'ant') { g.strokeStyle = '#8a9096'; g.lineWidth = Math.max(3, u * 0.1); g.beginPath(); g.moveTo(cx, cy + u * 0.3); g.lineTo(cx - u * 0.5, cy - u * 0.55); g.moveTo(cx, cy + u * 0.3); g.lineTo(cx + u * 0.5, cy - u * 0.55); g.stroke(); g.fillStyle = INK; g.fillRect(cx - u * 0.3, cy + u * 0.25, u * 0.6, u * 0.25); }
    else if (k === 'spk') { g.fillStyle = INK; g.fillRect(cx - u * 0.45, cy - u * 0.5, u * 0.9, u); g.fillStyle = '#8a9096'; g.beginPath(); g.arc(cx, cy + u * 0.08, u * 0.3, 0, 7); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(cx, cy + u * 0.08, u * 0.1, 0, 7); g.fill(); g.fillStyle = '#8a9096'; g.beginPath(); g.arc(cx, cy - u * 0.32, u * 0.1, 0, 7); g.fill(); }
    else if (k === 'cab') { g.fillStyle = '#2e86b8'; g.fillRect(cx - u * 0.5, cy - u * 0.12, u, u * 0.24); g.strokeRect(cx - u * 0.5, cy - u * 0.12, u, u * 0.24); g.fillStyle = INK; g.fillRect(cx - u * 0.62, cy - u * 0.2, u * 0.18, u * 0.4); g.fillRect(cx + u * 0.44, cy - u * 0.2, u * 0.18, u * 0.4); }
    else if (k === 'fuse') { g.fillStyle = 'rgba(220,240,255,.9)'; g.fillRect(cx - u * 0.36, cy - u * 0.15, u * 0.72, u * 0.3); g.strokeRect(cx - u * 0.36, cy - u * 0.15, u * 0.72, u * 0.3); g.fillStyle = YEL; g.fillRect(cx - u * 0.5, cy - u * 0.18, u * 0.16, u * 0.36); g.fillRect(cx + u * 0.34, cy - u * 0.18, u * 0.16, u * 0.36); g.beginPath(); g.moveTo(cx - u * 0.34, cy); g.lineTo(cx + u * 0.34, cy); g.stroke(); }
    else { g.strokeStyle = RED; g.lineWidth = Math.max(3, u * 0.1); g.beginPath(); g.moveTo(cx - u * 0.55, cy + u * 0.3); g.quadraticCurveTo(cx - u * 0.1, cy - u * 0.5, cx + u * 0.15, cy); g.stroke(); g.fillStyle = INK; g.fillRect(cx + u * 0.1, cy - u * 0.2, u * 0.32, u * 0.4); g.fillStyle = '#c9c4bc'; g.fillRect(cx + u * 0.42, cy - u * 0.14, u * 0.16, u * 0.07); g.fillRect(cx + u * 0.42, cy + u * 0.07, u * 0.16, u * 0.07); } }
  GD.fix = { tip: 'SET 1 / 4 \u00b7 READ THE COMPLAINT, CHECK THE CHART',
    begin() { J.n = 0; J.who = shuffle(WHO.slice()); J.syms = shuffle(SYM.slice()); this.next(); bindCv(p => this.down(p), (p, d) => { if (d && J.drag) { J.drag.x = p.x; J.drag.y = p.y; } }, p => this.up(p)); },
    next() { const S = J.syms[J.n % J.syms.length]; J.S = S; J.who1 = J.who[J.n % J.who.length]; J.ops = shuffle([S.p, ...shuffle(Object.keys(PART).filter(k => k !== S.p)).slice(0, 3)]); J.step = 0; J.drag = null; J.fl = null; J.wait = 0; J.btns = []; J.ch = 1 + Math.floor(Math.random() * 5);
      setTip('SET ' + (J.n + 1) + ' / 4 \u00b7 READ THE COMPLAINT, CHECK THE CHART'); },
    geom(w, h) { const land = w > h * 1.15; return land ? { land, card: [0, 0, w * 0.5, h * 0.3], chart: [0, h * 0.3, w * 0.5, h * 0.7], tv: [w * 0.5, 0, w * 0.5, h * 0.62], bot: [w * 0.5, h * 0.62, w * 0.5, h * 0.38] }
      : { land, card: [0, 0, w, h * 0.14], chart: [0, h * 0.14, w, h * 0.24], tv: [0, h * 0.38, w, h * 0.36], bot: [0, h * 0.74, w, h * 0.26] }; },
    tvBox(w, h) { const [x, y, bw, bh] = this.geom(w, h).tv, tw = Math.min(bw - 24, (bh - 20) * 1.45), th = tw / 1.45; return { x: x + (bw - tw) / 2, y: y + (bh - th) / 2, w: tw, h: th }; },
    slot(w, h) { const T = this.tvBox(w, h), s = SLOT[J.S.p]; return { x: T.x + T.w * s[0], y: T.y + T.h * s[1], r: Math.max(30, T.h * 0.16) }; },
    src(w, h) { const [x, y, bw, bh] = this.geom(w, h).bot; return { x: x + bw / 2, y: y + bh * 0.48 }; },
    down(p) { if (J.over || J.wait > 0) return; const S = J.S;
      if (J.step === 0) { const B = J.btns.find(q => inR(p, q.r)); if (!B) return; if (B.k === S.p) { J.step = 1; blip(); J.fl = null; setTip('DRAG THE ' + PART[S.p].name + ' INTO THE GLOWING SLOT'); } else { J.fl = { k: B.k, t: 0.4 }; missOne('THE CHART SAYS ' + S.s + ' = ' + PART[S.p].name); } return; }
      if (J.step === 1) { const o = this.src(p.w, p.h); if (Math.hypot(p.x - o.x, p.y - o.y) < 60) { J.drag = { x: p.x, y: p.y }; blip(); } return; }
      if (J.step === 2) { const B = J.btns.find(q => inR(p, q.r)); if (!B) return; J.step = 3; ding(); J.n++; J.wait = 1.1; setTip(J.who1 + ': IT WORKS! THANK YOU!'); if (J.n >= 4) { done1(); return; } setTimeout(() => { if (J && J.g === 'fix') this.next(); }, 1100); } },
    up(p) { if (J.step !== 1 || !J.drag) return; const sl = this.slot(p.w, p.h), d = Math.hypot(J.drag.x - sl.x, J.drag.y - sl.y); J.drag = null;
      if (d < sl.r * 1.4) { J.step = 2; thud(); setTip('CLOSE IT UP \u00b7 TAP POWER ON'); } else setTip('DROP IT ON THE GLOWING SLOT IN THE TV', true); },
    tick(dt) { if (J.wait > 0) J.wait -= dt; if (J.fl && (J.fl.t -= dt) <= 0) J.fl = null; },
    draw(g, w, h) { const G2 = this.geom(w, h), S = J.S, T = this.tvBox(w, h), t = performance.now() / 1000; g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.06)'; g.fillRect(0, i * h / 8, w, h / 8); }
      // the complaint card
      const [cx0, cy0, cw, ch] = G2.card; g.fillStyle = PAPER; g.fillRect(cx0 + 8, cy0 + 8, cw - 16, ch - 12); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(cx0 + 8, cy0 + 8, cw - 16, ch - 12); g.fillStyle = INK; g.fillRect(cx0 + 8, cy0 + 8, 10, ch - 12);
      const L1 = 'REPAIR ' + Math.min(4, J.n + (J.step > 2 ? 0 : 1)) + ' / 4 \u00b7 ' + J.who1 + ' SAYS:', L2 = '\u201cMY TV ' + S.say + '\u201d', lh = (ch - 16) / 2;
      txt(g, L1, cx0 + 26, cy0 + 8 + lh * 0.55, fitT(g, L1, cw - 44, clamp(lh * 0.42, 11, 16), 800), '#5a5654', 800); txt(g, L2, cx0 + 26, cy0 + 8 + lh * 1.4, fitT(g, L2, cw - 44, clamp(lh * 0.62, 13, 26)), INK);
      // the TROUBLESHOOT chart (same as on the shop wall)
      const [hx, hy, hw, hh] = G2.chart; g.fillStyle = PAPER; g.fillRect(hx + 8, hy + 4, hw - 16, hh - 8); g.strokeStyle = INK; g.strokeRect(hx + 8, hy + 4, hw - 16, hh - 8); const rh = (hh - 12) / (SYM.length + 1);
      g.fillStyle = INK; g.fillRect(hx + 8, hy + 4, hw - 16, rh); txt(g, 'TROUBLESHOOT', hx + 16, hy + 4 + rh / 2, fitT(g, 'TROUBLESHOOT', hw - 32, clamp(rh * 0.6, 11, 18)), YEL);
      SYM.forEach((q, i) => { const y = hy + 4 + rh * (i + 1.5), hit = J.step > 0 && q === S, fs = clamp(rh * 0.56, 10, 18); if (hit) { g.fillStyle = 'rgba(124,255,155,.45)'; g.fillRect(hx + 9, y - rh / 2, hw - 18, rh); }
        txt(g, q.s, hx + 16, y, fitT(g, q.s, hw * 0.55 - 20, fs), INK); const px2 = hx + hw * 0.56; g.fillStyle = PART[q.p].col; g.fillRect(px2, y - rh * 0.3, rh * 0.6, rh * 0.6); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(px2, y - rh * 0.3, rh * 0.6, rh * 0.6); txt(g, PART[q.p].name, px2 + rh * 0.8, y, fitT(g, PART[q.p].name, hx + hw - 16 - px2 - rh * 0.8, fs), INK); });
      // the TV: the symptom on the front (step 0), the open back (step 1-2), working again (step 3)
      g.fillStyle = INK; g.fillRect(T.x - 6, T.y - 6, T.w + 12, T.h + 12); const inn = T.w * 0.04, sx = T.x + inn, sy = T.y + inn, sw = T.w - inn * 2, sh = T.h - inn * 2;
      if (J.step === 1 || J.step === 2) { g.fillStyle = '#2f4a3a'; g.fillRect(T.x, T.y, T.w, T.h); g.strokeStyle = 'rgba(124,255,155,.35)'; g.lineWidth = 2; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(T.x + 6, T.y + i * T.h / 6); g.lineTo(T.x + T.w - 6, T.y + i * T.h / 6); g.stroke(); }
        const u = T.h * 0.22; for (const k of Object.keys(SLOT)) { const [fx, fy] = SLOT[k], px = T.x + T.w * fx, py = T.y + T.h * fy; if (k !== S.p || J.step === 2) drawPart(g, k, px, py, u); }
        if (J.step === 1) { const sl = this.slot(w, h), a = 0.5 + 0.5 * Math.sin(t * 6); g.strokeStyle = 'rgba(255,210,58,' + (0.5 + a * 0.5) + ')'; g.lineWidth = 4; g.setLineDash([6, 5]); g.strokeRect(sl.x - sl.r, sl.y - sl.r * 0.8, sl.r * 2, sl.r * 1.6); g.setLineDash([]); }
        txt(g, 'BACK PANEL OFF', T.x + 8, T.y + T.h - 12, fitT(g, 'BACK PANEL OFF', T.w * 0.5, 12, 800), '#7cff9b', 800); }
      else { const fixed = J.step === 3, p = S.p;
        if (fixed || p === 'spk') drawCh(g, J.ch, sx, sy, sw, sh, sh > 70); else if (p === 'ant') { drawCh(g, J.ch, sx, sy, sw, sh, false); g.globalAlpha = 0.75; drawStatic(g, sx, sy, sw, sh); g.globalAlpha = 1; } else if (p === 'cord') { if (Math.sin(t * 23) + Math.sin(t * 9) > 0.2) drawCh(g, J.ch, sx, sy, sw, sh, false); else { g.fillStyle = '#0c0d0f'; g.fillRect(sx, sy, sw, sh); } } else { g.fillStyle = '#0c0d0f'; g.fillRect(sx, sy, sw, sh); if (p === 'cab') ctext(g, '\u266a SOUND ONLY \u266a', sx + sw / 2, sy + sh / 2, fitT(g, '\u266a SOUND ONLY \u266a', sw - 20, 18), '#8a9096'); }
        if (!fixed && p === 'spk') { const ux = sx + sw - 46, uy = sy + 10; g.fillStyle = INK; g.fillRect(ux, uy, 36, 30); g.fillStyle = '#ffffff'; g.fillRect(ux + 6, uy + 10, 8, 10); g.beginPath(); g.moveTo(ux + 14, uy + 10); g.lineTo(ux + 22, uy + 4); g.lineTo(ux + 22, uy + 26); g.lineTo(ux + 14, uy + 20); g.fill(); g.strokeStyle = RED; g.lineWidth = 3; g.beginPath(); g.moveTo(ux + 4, uy + 28); g.lineTo(ux + 32, uy + 2); g.stroke(); }
        g.fillStyle = fixed || (p !== 'fuse') ? '#7cff9b' : '#3a3a38'; if (!fixed && p === 'fuse') g.fillStyle = '#3a3a38'; g.fillRect(T.x + T.w - 16, T.y + T.h + 1, 8, 4); if (fixed) ctext(g, 'FIXED!', T.x + T.w / 2, T.y - 20 > 0 ? T.y + T.h / 2 : T.y + T.h / 2, clamp(T.h * 0.2, 18, 40), '#ffffff'); }
      // the bottom: part choices (step 0) · the part to drag (step 1) · POWER ON (step 2)
      const [bx, by, bw, bh] = G2.bot; J.btns = [];
      if (J.step === 0) { const cells = G2.land ? [0, 1, 2, 3].map(i => { const cw2 = (bw - 24) / 2, ch2 = (bh - 24) / 2; return { x: bx + 8 + (i % 2) * (cw2 + 8), y: by + 8 + Math.floor(i / 2) * (ch2 + 8), w: cw2, h: ch2 }; }) : grid(bx, by, bw, bh, 4, true, 6);
        J.ops.forEach((k, i) => { const r = cells[i], fl = J.fl && J.fl.k === k ? { ok: false } : null; J.btns.push({ k, r }); cell(g, r, PAPER, fl); const u = Math.min(r.w * 0.5, r.h * 0.42); drawPart(g, k, r.x + (G2.land ? r.w * 0.24 : r.w / 2), r.y + (G2.land ? r.h / 2 : r.h * 0.4), u);
          if (G2.land) txt(g, PART[k].name, r.x + r.w * 0.46, r.y + r.h / 2, fitT(g, PART[k].name, r.w * 0.5, 15), INK); else ctext(g, PART[k].name, r.x + r.w / 2, r.y + r.h - 12, fitT(g, PART[k].name, r.w - 8, 14), INK); }); }
      else if (J.step === 1) { const o = this.src(w, h), u = Math.min(bh * 0.4, 60); if (!J.drag) { g.strokeStyle = YEL; g.lineWidth = 3; g.strokeRect(o.x - u, o.y - u * 0.8, u * 2, u * 1.6); drawPart(g, S.p, o.x, o.y, u); txt(g, 'DRAG \u2191', o.x + u + 10, o.y, 16, YEL); } else drawPart(g, S.p, J.drag.x, J.drag.y, Math.min(T.h * 0.26, 64)); }
      else if (J.step === 2) { const r = { x: bx + 12, y: by + 10, w: bw - 24, h: bh - 20 }; J.btns.push({ k: 'pwr', r }); g.fillStyle = RED; g.fillRect(r.x, r.y, r.w, r.h); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(r.x, r.y, r.w, r.h); txt(g, 'POWER ON', r.x + 16, r.y + r.h / 2, fitT(g, 'POWER ON', r.w - 32, 30), '#ffffff'); }
      else txt(g, 'NEXT SET COMING\u2026', bx + 14, by + bh / 2, 18, YEL); } };
  // ---------- shared top-down furniture drawing (Furniture jobs) ----------
  const FCOL = { GREEN: '#3f7a52', PLUM: '#6a3a5a', GOLD: '#d9b24a', BLUE: '#2e5f8a', RED: '#c8262c' };
  const FNAME = { sofa: 'SOFA', rug: 'RUG', lamp: 'LAMP', bed: 'BED', night: 'NIGHTSTAND', ward: 'WARDROBE', desk: 'DESK', chair: 'CHAIR', shelf: 'BOOKCASE', plant: 'PLANT' };
  function drawFurn(g, k, col, x, y, w, h) { g.save(); g.lineWidth = 2; g.strokeStyle = INK; const mn = Math.min(w, h), cx = x + w / 2, cy = y + h / 2;
    const R = (a, b, c, d, f) => { g.fillStyle = f; g.fillRect(a, b, c, d); g.strokeRect(a, b, c, d); }, dk = (a, b, c, d) => { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(a, b, c, d); g.strokeRect(a, b, c, d); }, C = (a, b, r, f) => { g.fillStyle = f; g.beginPath(); g.arc(a, b, r, 0, 7); g.fill(); g.stroke(); };
    if (k === 'sofa') { R(x, y, w, h, col); dk(x, y, w, h * 0.3); dk(x, y, w * 0.12, h); dk(x + w * 0.88, y, w * 0.12, h); g.beginPath(); g.moveTo(cx, y + h * 0.3); g.lineTo(cx, y + h); g.stroke(); }
    else if (k === 'rug') { R(x, y, w, h, col); g.strokeStyle = '#f3e7c8'; g.lineWidth = Math.max(2, mn * 0.06); g.strokeRect(x + mn * 0.12, y + mn * 0.12, w - mn * 0.24, h - mn * 0.24); g.strokeRect(x + mn * 0.26, y + mn * 0.26, w - mn * 0.52, h - mn * 0.52); }
    else if (k === 'lamp') { C(cx, cy, mn * 0.46, col); C(cx, cy, mn * 0.22, '#fff3c8'); }
    else if (k === 'bed') { R(x, y, w, h, '#f3f2f2'); R(x, y + h * 0.3, w, h * 0.7, col); R(x, y, w, h * 0.07, INK); R(x + w * 0.1, y + h * 0.11, w * 0.36, h * 0.14, '#ffffff'); R(x + w * 0.54, y + h * 0.11, w * 0.36, h * 0.14, '#ffffff'); }
    else if (k === 'night') { R(x, y, w, h, col); C(cx, cy, mn * 0.24, '#fff3c8'); }
    else if (k === 'ward') { R(x, y, w, h, col); g.beginPath(); if (h > w) { g.moveTo(x, cy); g.lineTo(x + w, cy); } else { g.moveTo(cx, y); g.lineTo(cx, y + h); } g.stroke(); g.fillStyle = '#d9b24a'; const kn = Math.max(3, mn * 0.1); if (h > w) { g.fillRect(x + w * 0.15, cy - kn * 1.5, kn, kn); g.fillRect(x + w * 0.15, cy + kn * 0.5, kn, kn); } else { g.fillRect(cx - kn * 1.5, y + h * 0.7, kn, kn); g.fillRect(cx + kn * 0.5, y + h * 0.7, kn, kn); } }
    else if (k === 'desk') { R(x, y, w, h, col); R(x + w * 0.1, y + h * 0.2, w * 0.22, h * 0.55, '#f3f2f2'); C(x + w * 0.82, cy, mn * 0.2, '#fff3c8'); }
    else if (k === 'chair') { R(x + w * 0.1, y + h * 0.28, w * 0.8, h * 0.66, col); R(x + w * 0.1, y + h * 0.06, w * 0.8, h * 0.22, col); dk(x + w * 0.1, y + h * 0.06, w * 0.8, h * 0.22); }
    else if (k === 'shelf') { R(x, y, w, h, col); const n = 9, BK = ['#ec3013', '#ffd23a', '#2e86b8', '#f3f2f2', '#3f9a5e']; for (let i = 0; i < n; i++) { g.fillStyle = BK[i % 5]; if (w >= h) g.fillRect(x + w * 0.05 + i * w * 0.1, y + h * 0.2, w * 0.07, h * 0.6); else g.fillRect(x + w * 0.2, y + h * 0.05 + i * h * 0.1, w * 0.6, h * 0.07); } g.strokeRect(x, y, w, h); }
    else if (k === 'plant') { g.fillStyle = '#3f9a5e'; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g.beginPath(); g.ellipse(cx + Math.cos(a) * mn * 0.24, cy + Math.sin(a) * mn * 0.24, mn * 0.22, mn * 0.12, a, 0, 7); g.fill(); g.stroke(); } C(cx, cy, mn * 0.18, col); }
    g.restore(); }
  // ---------- FURN 1 · STAGE A ROOM SET: read the brief (piece + colour), drag each piece from the tray onto its outline (3 rooms: 3 / 4 / 4 pieces, each in 2 colours) ----------
  const ROOMS = [{ name: 'LIVING ROOM', s: [['sofa', 0.25, 0.06, 0.5, 0.22], ['lamp', 0.06, 0.06, 0.14, 0.18], ['rug', 0.28, 0.4, 0.44, 0.32]] },
    { name: 'BEDROOM', s: [['bed', 0.34, 0.05, 0.32, 0.52], ['night', 0.12, 0.05, 0.16, 0.18], ['ward', 0.82, 0.28, 0.14, 0.44], ['rug', 0.3, 0.66, 0.4, 0.24]] },
    { name: 'STUDY', s: [['desk', 0.08, 0.06, 0.44, 0.2], ['chair', 0.22, 0.32, 0.16, 0.2], ['shelf', 0.6, 0.05, 0.34, 0.15], ['plant', 0.8, 0.68, 0.14, 0.22]] }];
  GD.stage = { tip: 'ROOM 1 / 3 \u00b7 DRAG EACH PIECE ONTO ITS OUTLINE',
    begin() { J.round = 0; J.who = shuffle(WHO.slice()); this.setup(); bindCv(p => this.down(p), (p, d) => { if (d && J.held) { J.held.px = p.x; J.held.py = p.y; } }, p => this.up(p)); },
    setup() { const R = ROOMS[J.round], ck = Object.keys(FCOL); J.R = R; J.slots = R.s.map(([k, x, y, w, h]) => ({ k, x, y, w, h, col: pick(ck), done: false })); const pcs = [];
      J.slots.forEach(s => { pcs.push({ k: s.k, col: s.col }); pcs.push({ k: s.k, col: pick(ck.filter(c => c !== s.col)) }); }); J.pcs = shuffle(pcs); J.held = null; J.fl = null; J.wait = 0; J.who1 = J.who[J.round % J.who.length];
      setTip('ROOM ' + (J.round + 1) + ' / 3 \u00b7 DRAG EACH PIECE ONTO ITS OUTLINE'); },
    geom(w, h) { const land = w > h * 1.15, G2 = land ? { land, card: [0, 0, w * 0.5, h * 0.34], plan: [0, h * 0.34, w * 0.5, h * 0.66], tray: [w * 0.5, 0, w * 0.5, h] } : { land, card: [0, 0, w, h * 0.2], plan: [0, h * 0.2, w, h * 0.42], tray: [0, h * 0.62, w, h * 0.38] };
      const [px, py, pw, ph] = G2.plan, rw = Math.min(pw - 24, (ph - 20) * 1.4), rh = rw / 1.4; G2.room = { x: px + (pw - rw) / 2, y: py + (ph - rh) / 2 - 2, w: rw, h: rh }; return G2; },
    slotR(G2, s) { const r = G2.room; return { x: r.x + s.x * r.w, y: r.y + s.y * r.h, w: s.w * r.w, h: s.h * r.h }; },
    cells(G2) { const [x, y, w, h] = G2.tray, n = J.pcs.length, cols = G2.land ? 2 : (w < 420 ? 3 : 4), rows = Math.ceil(n / cols), pad = 6, cw = (w - pad * (cols + 1)) / cols, ch = (h - pad * (rows + 1)) / rows;
      return J.pcs.map((p, i) => ({ p, r: { x: x + pad + (i % cols) * (cw + pad), y: y + pad + Math.floor(i / cols) * (ch + pad), w: cw, h: ch } })); },
    down(p) { if (J.over || J.wait > 0) return; const G2 = this.geom(p.w, p.h), C2 = this.cells(G2).find(c => !c.p.done && inR(p, c.r)); if (!C2) return;
      if (J.slots.some(s => s.done && s.k === C2.p.k)) { setTip('THE ' + FNAME[C2.p.k] + ' IS ALREADY IN', true); nope(); return; } J.held = C2.p; C2.p.px = p.x; C2.p.py = p.y; blip(); },
    up(p) { const pc = J.held; J.held = null; if (!pc || J.over) return; const G2 = this.geom(p.w, p.h), S = J.slots.find(s => { const r = this.slotR(G2, s); return !s.done && p.x > r.x - 14 && p.x < r.x + r.w + 14 && p.y > r.y - 14 && p.y < r.y + r.h + 14; }); if (!S) return;
      if (S.k !== pc.k) { J.fl = { s: S, ok: false, t: 0.4 }; missOne('THAT SPOT IS FOR THE ' + FNAME[S.k]); return; }
      if (S.col !== pc.col) { J.fl = { s: S, ok: false, t: 0.4 }; missOne('THE BRIEF SAYS A ' + S.col + ' ' + FNAME[S.k]); return; }
      S.done = true; pc.done = true; thud(); J.fl = { s: S, ok: true, t: 0.35 }; setTip(S.col + ' ' + FNAME[S.k] + ' \u00b7 IN PLACE');
      if (J.slots.every(s => s.done)) { J.round++; ding(); J.wait = 1.1; if (J.round >= ROOMS.length) { setTip('THREE ROOMS STAGED!'); done1(); return; } setTip(J.who1 + ' LOVES IT!'); setTimeout(() => { if (J && J.g === 'stage') this.setup(); }, 1100); } },
    tick(dt) { if (J.wait > 0) J.wait -= dt; if (J.fl && (J.fl.t -= dt) <= 0) J.fl = null; },
    draw(g, w, h) { const G2 = this.geom(w, h); g.fillStyle = '#4a3f38'; g.fillRect(0, 0, w, h);
      const [cx0, cy0, cw, ch] = G2.card, hd = Math.min(30, ch * 0.3); g.fillStyle = PAPER; g.fillRect(cx0 + 8, cy0 + 8, cw - 16, ch - 12); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(cx0 + 8, cy0 + 8, cw - 16, ch - 12); g.fillStyle = INK; g.fillRect(cx0 + 8, cy0 + 8, cw - 16, hd);
      const T1 = 'THE BRIEF \u00b7 ' + J.who1 + '\u2019S ' + J.R.name + ' \u00b7 ' + Math.min(3, J.round + (J.wait > 0 ? 0 : 1)) + ' / 3'; txt(g, T1, cx0 + 16, cy0 + 8 + hd / 2, fitT(g, T1, cw - 32, 15), YEL);
      const rows = Math.ceil(J.slots.length / 2), lh = (ch - hd - 18) / rows, colW = (cw - 32) / 2;
      J.slots.forEach((s, i) => { const x = cx0 + 16 + (i % 2) * colW, y = cy0 + 8 + hd + 4 + lh * (Math.floor(i / 2) + 0.5), sw = clamp(lh * 0.62, 12, 24); g.fillStyle = FCOL[s.col]; g.fillRect(x, y - sw / 2, sw, sw); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x, y - sw / 2, sw, sw);
        const t = (s.done ? '\u2713 ' : '') + s.col + ' ' + FNAME[s.k]; txt(g, t, x + sw + 8, y, fitT(g, t, colW - sw - 14, clamp(lh * 0.5, 11, 18)), s.done ? '#2f7d4a' : INK); });
      const r = G2.room, wt = 6; g.fillStyle = '#c9a06a'; g.fillRect(r.x, r.y, r.w, r.h); g.strokeStyle = 'rgba(90,60,30,.35)'; g.lineWidth = 1; for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(r.x, r.y + i * r.h / 10); g.lineTo(r.x + r.w, r.y + i * r.h / 10); g.stroke(); }
      g.fillStyle = INK; g.fillRect(r.x - wt, r.y - wt, r.w + wt * 2, wt); g.fillRect(r.x - wt, r.y, wt, r.h + wt); g.fillRect(r.x + r.w, r.y, wt, r.h + wt); g.fillRect(r.x - wt, r.y + r.h, r.w * 0.4 + wt, wt); g.fillRect(r.x + r.w * 0.6, r.y + r.h, r.w * 0.4 + wt, wt);
      g.fillStyle = '#bfe6ff'; g.fillRect(r.x + r.w * 0.4, r.y - wt, r.w * 0.2, wt); ctext(g, 'DOOR', r.x + r.w / 2, r.y + r.h - 9, 11, '#5a3a1a');
      J.slots.forEach(s => { const q = this.slotR(G2, s), fl = J.fl && J.fl.s === s ? J.fl : null; if (s.done) drawFurn(g, s.k, FCOL[s.col], q.x, q.y, q.w, q.h);
        else { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(q.x, q.y, q.w, q.h); g.strokeStyle = INK; g.lineWidth = 2; g.setLineDash([6, 4]); g.strokeRect(q.x, q.y, q.w, q.h); g.setLineDash([]); ctext(g, FNAME[s.k], q.x + q.w / 2, q.y + q.h / 2, fitT(g, FNAME[s.k], q.w - 6, 14), INK); }
        if (fl) { g.strokeStyle = fl.ok ? '#7cff9b' : RED; g.lineWidth = 5; g.strokeRect(q.x - 3, q.y - 3, q.w + 6, q.h + 6); } });
      for (const C2 of this.cells(G2)) { const p = C2.p, rr = C2.r; if (p.done) continue; g.globalAlpha = J.slots.some(s => s.done && s.k === p.k) ? 0.35 : 1; cell(g, rr, PAPER, null);
        const lab = p.col + ' ' + FNAME[p.k], lb = Math.min(20, rr.h * 0.24), aw = rr.w - 16, ah = rr.h - lb - 14, sl = J.slots.find(s => s.k === p.k), ar = sl ? (sl.w * G2.room.w) / (sl.h * G2.room.h) : 1; let fw = aw, fh = fw / ar; if (fh > ah) { fh = ah; fw = fh * ar; }
        if (p !== J.held) drawFurn(g, p.k, FCOL[p.col], rr.x + (rr.w - fw) / 2, rr.y + 6 + (ah - fh) / 2, fw, fh); ctext(g, lab, rr.x + rr.w / 2, rr.y + rr.h - lb / 2 - 4, fitT(g, lab, rr.w - 10, Math.max(10, lb * 0.8)), INK); g.globalAlpha = 1; }
      if (J.held) { const p = J.held, sl = J.slots.find(s => s.k === p.k), q = this.slotR(G2, sl); g.globalAlpha = 0.9; drawFurn(g, p.k, FCOL[p.col], p.px - q.w / 2, p.py - q.h / 2, q.w, q.h); g.globalAlpha = 1; } } };
  // ---------- FURN 2 · DELIVER THROUGH THE DOOR: a top-down floor plan; drag anywhere to slide the piece, TURN buttons rotate it 15°; get it fully into the room (3 deliveries). Pushing into a wall = SCUFF (a miss, once per 1.2 s) ----------
  const DAW = 10, DAH = 12;
  const DLV = [{ k: 'shelf', name: 'BOOKCASE', to: 'STUDY', L: 4, T: 0.8, x: 5, y: 9.6, a: 0, walls: [[0, 6, 4, 0.6], [6, 6, 4, 0.6]], tg: [0, 0, 10, 6], truck: [0, 8.6, 10, 3.4] },
    { k: 'sofa', name: 'SOFA', to: 'LIVING ROOM', L: 3, T: 1.1, x: 1.5, y: 9.6, a: Math.PI / 2, walls: [[3, 0, 0.6, 1.2], [3, 4.4, 0.6, 7.6]], tg: [3.6, 0, 6.4, 12], truck: [0, 9.6, 3, 2.4] },
    { k: 'ward', name: 'WARDROBE', to: 'BEDROOM', L: 2.4, T: 1, x: 3, y: 9.6, a: 0, walls: [[0, 7, 6.6, 0.6], [8, 7, 2, 0.6], [3.6, 0, 0.6, 1.6], [3.6, 3, 0.6, 4]], tg: [0, 0, 3.6, 7], truck: [0, 8.6, 10, 3.4] }];
  GD.deliver = { tip: 'DELIVERY 1 / 3 \u00b7 DRAG TO SLIDE \u00b7 TURN TO FIT',
    begin() { J.n = 0; this.next(); bindCv(p => this.down(p), (p, d) => this.move(p, d), () => { J.drag = null; }); },
    next() { const D2 = DLV[J.n]; J.D = D2; J.it = { x: D2.x, y: D2.y, a: D2.a, L: D2.L, T: D2.T, k: D2.k, col: pick(Object.keys(FCOL)) }; J.scT = 0; J.bump = 0; J.wait = 0; J.drag = null; J.btns = [];
      setTip('DELIVERY ' + (J.n + 1) + ' / 3 \u00b7 DRAG TO SLIDE \u00b7 TURN TO FIT'); },
    geom(w, h) { const land = w > h * 1.15, top = 34; return land ? { land, plan: [0, top, w * 0.76, h - top], btn: [w * 0.76, top, w * 0.24, h - top] } : { land, plan: [0, top, w, h * 0.82 - top], btn: [0, h * 0.82, w, h * 0.18] }; },
    area(w, h) { const [px, py, pw, ph] = this.geom(w, h).plan, s = Math.min((pw - 16) / DAW, (ph - 12) / DAH); return { s, ox: px + (pw - DAW * s) / 2, oy: py + (ph - DAH * s) / 2 }; },
    hits(x, y, a) { const I = J.it, c = Math.cos(a), sn = Math.sin(a), L2 = I.L / 2, T2 = I.T / 2, WL = J.D.walls, pts = [];
      for (let i = 0; i <= 10; i++) { const lx = -L2 + i * I.L / 10; pts.push([lx, -T2], [lx, T2]); } for (let i = 1; i < 4; i++) { const ly = -T2 + i * I.T / 4; pts.push([-L2, ly], [L2, ly]); }
      for (const [lx, ly] of pts) { const px = x + lx * c - ly * sn, py = y + lx * sn + ly * c; if (px < 0 || px > DAW || py < 0 || py > DAH) return true; for (const [wx, wy, ww, wh] of WL) if (px > wx && px < wx + ww && py > wy && py < wy + wh) return true; }
      for (const [wx, wy, ww, wh] of WL) for (const [qx, qy] of [[wx, wy], [wx + ww, wy], [wx, wy + wh], [wx + ww, wy + wh]]) { const dx = qx - x, dy = qy - y, lx = dx * c + dy * sn, ly = -dx * sn + dy * c; if (Math.abs(lx) < L2 && Math.abs(ly) < T2) return true; }
      return false; },
    corners(I) { const c = Math.cos(I.a), sn = Math.sin(I.a); return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => [I.x + u * I.L / 2 * c - v * I.T / 2 * sn, I.y + u * I.L / 2 * sn + v * I.T / 2 * c]); },
    down(p) { if (J.over || J.wait > 0) return; const B = J.btns.find(q => inR(p, q.r)); if (B) { this.turn(B.d); return; } const [px, py, pw, ph] = this.geom(p.w, p.h).plan; if (p.x > px && p.x < px + pw && p.y > py && p.y < py + ph) J.drag = { x: p.x, y: p.y }; },
    move(p, d) { if (!d || !J.drag || J.over || J.wait > 0) return; const A = this.area(p.w, p.h), dx = (p.x - J.drag.x) / A.s, dy = (p.y - J.drag.y) / A.s; J.drag = { x: p.x, y: p.y }; this.slide(dx, dy); },
    slide(dx, dy) { const I = J.it, n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 0.12)); let blocked = 0;
      for (let i = 0; i < n; i++) { const sx = dx / n, sy = dy / n; if (!this.hits(I.x + sx, I.y + sy, I.a)) { I.x += sx; I.y += sy; } else if (sx && !this.hits(I.x + sx, I.y, I.a)) I.x += sx; else if (sy && !this.hits(I.x, I.y + sy, I.a)) I.y += sy; else blocked += Math.hypot(sx, sy); }
      if (blocked > 0.05) { J.bump = 0.25; if (J.scT <= 0) { J.scT = 1.2; missOne('SCUFF! MIND THE PAINT \u00b7 TURN IT TO FIT'); } } this.check(); },
    turn(dir) { const I = J.it, na = I.a + dir * Math.PI / 12;
      for (const [ox, oy] of [[0, 0], [0.15, 0], [-0.15, 0], [0, 0.15], [0, -0.15], [0.3, 0], [-0.3, 0], [0, 0.3], [0, -0.3]]) if (!this.hits(I.x + ox, I.y + oy, na)) { I.x += ox; I.y += oy; I.a = na; blip(); setTip('DELIVERY ' + (J.n + 1) + ' / 3 \u00b7 ' + J.D.name + ' \u2192 ' + J.D.to); this.check(); return; }
      J.bump = 0.25; nope(); setTip('NO ROOM TO TURN HERE \u00b7 SLIDE IT FIRST', true); },
    check() { const [tx, ty, tw, th] = J.D.tg; if (!this.corners(J.it).every(([x, y]) => x >= tx && x <= tx + tw && y >= ty && y <= ty + th)) return;
      J.n++; ding(); J.wait = 1.1; J.drag = null; setTip(J.D.name + ' DELIVERED \u00b7 NOT A SCRATCH!'); if (J.n >= DLV.length) { done1(); return; } setTimeout(() => { if (J && J.g === 'deliver') this.next(); }, 1100); },
    tick(dt) { if (J.wait > 0) J.wait -= dt; J.scT -= dt; J.bump -= dt; },
    draw(g, w, h) { const G2 = this.geom(w, h), A = this.area(w, h), D2 = J.D, I = J.it, s = A.s, X = v => A.ox + v * s, Y = v => A.oy + v * s; g.fillStyle = '#3a3634'; g.fillRect(0, 0, w, h);
      g.fillStyle = INK; g.fillRect(0, 0, w, 34); const T1 = 'DELIVERY ' + Math.min(3, J.n + (J.wait > 0 ? 0 : 1)) + ' / 3 \u00b7 ' + D2.name + ' \u2192 ' + D2.to; txt(g, T1, 12, 17, fitT(g, T1, w - 24, 16), YEL);
      g.fillStyle = '#e2d6bc'; g.fillRect(X(0), Y(0), DAW * s, DAH * s);
      const [tx, ty, tw, th] = D2.tg; g.fillStyle = '#cfe8cf'; g.fillRect(X(tx), Y(ty), tw * s, th * s); g.strokeStyle = '#2f7d4a'; g.lineWidth = 3; g.setLineDash([8, 6]); g.strokeRect(X(tx) + 3, Y(ty) + 3, tw * s - 6, th * s - 6); g.setLineDash([]);
      txt(g, D2.to, X(tx) + 10, Y(ty) + 16, fitT(g, D2.to, tw * s - 20, 16), '#2f7d4a'); txt(g, 'PUT IT HERE', X(tx) + 10, Y(ty) + 36, fitT(g, 'PUT IT HERE', tw * s - 20, 13, 800), '#2f7d4a', 800);
      const [kx, ky, kw, kh] = D2.truck; g.fillStyle = '#8a9096'; g.fillRect(X(kx), Y(ky), kw * s, kh * s); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 6; g.save(); g.beginPath(); g.rect(X(kx), Y(ky), kw * s, kh * s); g.clip(); for (let i = -10; i < 30; i++) { g.beginPath(); g.moveTo(X(kx) + i * 18, Y(ky)); g.lineTo(X(kx) + i * 18 + kh * s, Y(ky) + kh * s); g.stroke(); } g.restore();
      txt(g, 'TRUCK', X(kx) + 8, Y(ky + kh) - 12, 13, '#ffffff');
      g.fillStyle = INK; for (const [wx, wy, ww, wh] of D2.walls) g.fillRect(X(wx), Y(wy), ww * s, wh * s); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(X(0), Y(0), DAW * s, DAH * s);
      g.save(); g.translate(X(I.x), Y(I.y)); g.rotate(I.a); drawFurn(g, I.k, FCOL[I.col], -I.L * s / 2, -I.T * s / 2, I.L * s, I.T * s); if (J.bump > 0) { g.strokeStyle = RED; g.lineWidth = 4; g.strokeRect(-I.L * s / 2 - 2, -I.T * s / 2 - 2, I.L * s + 4, I.T * s + 4); } g.restore();
      const [bx, by, bw, bh] = G2.btn, pad = 8; J.btns = G2.land ? [{ d: -1, r: { x: bx + pad, y: by + pad, w: bw - pad * 2, h: (bh - pad * 3) / 2 } }, { d: 1, r: { x: bx + pad, y: by + pad * 2 + (bh - pad * 3) / 2, w: bw - pad * 2, h: (bh - pad * 3) / 2 } }]
        : [{ d: -1, r: { x: bx + pad, y: by + pad, w: (bw - pad * 3) / 2, h: bh - pad * 2 } }, { d: 1, r: { x: bx + pad * 2 + (bw - pad * 3) / 2, y: by + pad, w: (bw - pad * 3) / 2, h: bh - pad * 2 } }];
      for (const B of J.btns) { cell(g, B.r, PAPER, null); const ar = B.d < 0 ? '\u21ba' : '\u21bb', t = B.d < 0 ? 'TURN LEFT' : 'TURN RIGHT', fs = fitT(g, t, B.r.w - 24, 20);
        if (B.r.h > 74) { const as = Math.min(40, B.r.h * 0.34); txt(g, ar, B.r.x + 12, B.r.y + B.r.h / 2 - fs * 0.7, as, INK); txt(g, t, B.r.x + 12, B.r.y + B.r.h / 2 + as * 0.55, fs, INK); } else txt(g, ar + ' ' + t, B.r.x + 12, B.r.y + B.r.h / 2, fitT(g, ar + ' ' + t, B.r.w - 24, 20), INK); } } };
  // ---------- GELATO 2 · STOCK THE CASE: drag each tub (colour + garnish, no name) to the slot with its flavour LABEL (2 rounds: 5 tubs, then all 8) ----------
  const FL = { straw: { name: 'STRAWBERRY', col: '#f0a0b0', g: 'berry' }, pist: { name: 'PISTACHIO', col: '#b9cf8a', g: 'nut' }, mint: { name: 'MINT CHIP', col: '#a8e0c8', g: 'chips' }, choc: { name: 'CHOCOLATE', col: '#6b4430', g: 'square' },
    lemon: { name: 'LEMON', col: '#ffe27a', g: 'slice' }, van: { name: 'VANILLA', col: '#f3ead2', g: 'pod' }, blue: { name: 'BLUEBERRY', col: '#aaa6e8', g: 'dots' }, mango: { name: 'MANGO', col: '#f6b04a', g: 'cube' } };
  function drawTub(g, x, y, r, k) { const f = FL[k], h = r * 1.3, s = r * 0.22, gy = y - h * 0.48; g.lineWidth = 2; g.strokeStyle = INK;
    g.fillStyle = '#c9ced3'; g.fillRect(x - r, y - h * 0.2, r * 2, h * 0.75); g.strokeRect(x - r, y - h * 0.2, r * 2, h * 0.75);
    g.fillStyle = f.col; g.beginPath(); g.ellipse(x, y - h * 0.2, r * 0.98, r * 0.62, 0, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
    if (f.g === 'berry') { g.fillStyle = '#c42d3c'; g.beginPath(); g.moveTo(x - s, gy - s * 0.6); g.lineTo(x + s, gy - s * 0.6); g.lineTo(x, gy + s * 1.1); g.closePath(); g.fill(); g.fillStyle = '#3f9a5e'; g.fillRect(x - s * 0.7, gy - s, s * 1.4, s * 0.45); }
    else if (f.g === 'nut') { g.fillStyle = '#5f7a2a'; g.beginPath(); g.ellipse(x, gy, s * 1.1, s * 0.7, 0.4, 0, 7); g.fill(); g.stroke(); }
    else if (f.g === 'chips') { g.fillStyle = '#3a2416'; for (let i = 0; i < 5; i++) g.fillRect(x - r * 0.6 + i * r * 0.28, gy + (i % 2) * s * 0.8 - s * 0.3, s * 0.6, s * 0.6); }
    else if (f.g === 'square') { g.fillStyle = '#2a1a10'; g.fillRect(x - s, gy - s, s * 2, s * 2); g.strokeStyle = '#c9a06a'; g.lineWidth = 1.5; g.strokeRect(x - s, gy - s, s * 2, s * 2); g.beginPath(); g.moveTo(x, gy - s); g.lineTo(x, gy + s); g.moveTo(x - s, gy); g.lineTo(x + s, gy); g.stroke(); }
    else if (f.g === 'slice') { g.fillStyle = '#fff6b0'; g.beginPath(); g.arc(x, gy + s * 0.4, s * 1.2, Math.PI, 0); g.closePath(); g.fill(); g.strokeStyle = '#d9a800'; g.lineWidth = 2; g.stroke(); }
    else if (f.g === 'pod') { g.strokeStyle = '#2a1c12'; g.lineWidth = Math.max(2, s * 0.5); g.beginPath(); g.moveTo(x - s * 1.6, gy + s * 0.4); g.quadraticCurveTo(x, gy - s, x + s * 1.6, gy + s * 0.2); g.stroke(); }
    else if (f.g === 'dots') { g.fillStyle = '#3a3a8a'; for (const [dx, dy] of [[-0.5, 0], [0.5, 0.1], [0, -0.5], [0.1, 0.5]]) { g.beginPath(); g.arc(x + dx * s * 2, gy + dy * s * 2, s * 0.55, 0, 7); g.fill(); } }
    else { g.fillStyle = '#f9c66a'; g.strokeStyle = '#b86a10'; g.lineWidth = 1.5; for (const [dx, dy] of [[-1.2, -0.5], [0.2, -0.2]]) { g.fillRect(x + dx * s, gy + dy * s, s, s); g.strokeRect(x + dx * s, gy + dy * s, s, s); } }
    g.lineWidth = 2; g.strokeStyle = INK; }
  GD.stock = { tip: 'ROUND 1 / 2 \u00b7 DRAG EACH TUB TO ITS LABEL',
    begin() { J.round = 0; this.setup(); bindCv(p => this.down(p), (p, d) => { if (d && J.held) { J.held.x = clamp(p.x / p.w, 0.04, 0.96); J.held.y = clamp(p.y / p.h, 0.04, 0.96); } }, p => this.up(p)); },
    setup() { J.slots = J.round ? shuffle(Object.keys(FL)) : shuffle(['straw', 'pist', 'mint', 'choc', 'lemon']); const kinds = shuffle(J.slots.slice());
      J.tubs = kinds.map((k, i) => ({ k, i, x: 0.5, y: 0.7, hx: 0.5, hy: 0.7, in: -1, back: 0 })); J.lay = null; J.held = null; J.inN = 0; J.fl = null; },
    lay(w, h) { const tall = h > w * 1.25; if (J.lay === tall) return; J.lay = tall; const n = J.tubs.length, per = tall ? 3 : (n > 5 ? 4 : 5), dy = tall ? (n > 6 ? 0.13 : 0.16) : 0.18, y0 = tall ? 0.63 : 0.66;
      for (const b of J.tubs) { if (b.in >= 0) continue; b.hx = (b.i % per + 0.5) / per + rnd(-0.02, 0.02); b.hy = y0 + Math.floor(b.i / per) * dy + rnd(-0.015, 0.015); if (b !== J.held) { b.x = b.hx; b.y = b.hy; } } },
    geom(w, h) { const n = J.slots.length, rows = (n > 5 && w / n < 80) || (h > w * 1.25 && w / n < 90) ? 2 : 1, cols = Math.ceil(n / rows), top = h * 0.04, bot = h * 0.46, sw = w / cols, sh = (bot - top) / rows;
      return { rows, cols, top, bot, sw, sh, r: clamp(Math.min(sw * 0.34, sh * 0.3, Math.min(w, h) * (h > w * 1.25 ? 0.1 : 0.075)), 18, 40) }; },
    slotAt(G2, x, y) { if (y < G2.top || y > G2.bot) return -1; const c = clamp(Math.floor(x / G2.sw), 0, G2.cols - 1), r2 = clamp(Math.floor((y - G2.top) / G2.sh), 0, G2.rows - 1), i = r2 * G2.cols + c; return i < J.slots.length ? i : -1; },
    down(p) { if (J.over) return; const { r } = this.geom(p.w, p.h); let best = null, bd = 1e9; for (const b of J.tubs) { if (b.in >= 0) continue; const d = Math.hypot(b.x * p.w - p.x, b.y * p.h - p.y); if (d < Math.max(r * 1.8, 32) && d < bd) { bd = d; best = b; } } if (best) { J.held = best; best.back = 0; blip(); } },
    up(p) { const b = J.held; J.held = null; if (!b || J.over) return; const G2 = this.geom(p.w, p.h);
      if (p.y < G2.bot + G2.r * 0.5) { const i = this.slotAt(G2, p.x, Math.min(p.y, G2.bot - 1)); if (i < 0 || J.tubs.some(q => q.in === i)) { b.back = 1; return; }
        if (J.slots[i] === b.k) { b.in = i; J.inN++; thud(); J.fl = { i, t: 0.4, ok: true };
          if (J.inN >= J.tubs.length) { J.round++; if (J.round >= 2) { setTip('THE CASE IS FULL!'); ding(); done1(); } else { ding(); setTip('ROUND 2 / 2 \u00b7 THREE NEW FLAVOURS'); setTimeout(() => { if (J && J.g === 'stock') this.setup(); }, 700); } } }
        else { J.fl = { i, t: 0.4, ok: false }; missOne('THAT LABEL SAYS ' + FL[J.slots[i]].name + ' \u00b7 THIS TUB IS ' + FL[b.k].name); b.back = 1; } }
      else { b.y = Math.max(b.y, 0.56); b.hx = b.x; b.hy = b.y; } },
    tick(dt) { for (const b of J.tubs) if (b.back > 0) { b.back = Math.max(0, b.back - dt * 3); b.x += (b.hx - b.x) * Math.min(1, dt * 10); b.y += (b.hy - b.y) * Math.min(1, dt * 10); } if (J.fl && (J.fl.t -= dt) <= 0) J.fl = null; },
    draw(g, w, h) { this.lay(w, h); g.fillStyle = '#f6e3e8'; g.fillRect(0, 0, w, h); const G2 = this.geom(w, h), { top, bot, sw, sh, r } = G2;
      g.fillStyle = PAPER; g.fillRect(2, top - 4, w - 4, bot - top + 8); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(2, top - 4, w - 4, bot - top + 8);
      J.slots.forEach((k, i) => { const c = i % G2.cols, rw = Math.floor(i / G2.cols), x0 = c * sw + 6, y0 = top + rw * sh + 4, x1 = x0 + sw - 12, y1 = y0 + sh - 8, lh = Math.min(26, (y1 - y0) * 0.3);
        g.fillStyle = J.fl && J.fl.i === i ? (J.fl.ok ? 'rgba(124,255,155,.55)' : 'rgba(236,48,19,.5)') : '#cfe3ea'; g.fillRect(x0, y0, x1 - x0, y1 - y0 - lh); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
        g.fillStyle = INK; g.fillRect(x0, y1 - lh, x1 - x0, lh); txt(g, FL[k].name, x0 + 5, y1 - lh / 2, fitT(g, FL[k].name, x1 - x0 - 10, Math.min(15, lh * 0.7)), YEL);
        const t2 = J.tubs.find(q => q.in === i); if (t2) drawTub(g, (x0 + x1) / 2, y0 + (y1 - lh - y0) * 0.62, Math.min(r, (x1 - x0) * 0.4), t2.k); });
      txt(g, J.tubs.filter(b => b.in < 0).length + ' TO GO', 10, h * 0.52, 15, INK);
      for (const b of J.tubs) if (b.in < 0 && b !== J.held) drawTub(g, b.x * w, b.y * h, r, b.k); if (J.held) drawTub(g, J.held.x * w, J.held.y * h, r * 1.15, J.held.k); } };
  // ================= run a job =================
  const stars = () => (J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1);
  const tgt = s => ({ key: 'outletKeeper_' + s.D.key, name: s.D.keeper.name, role: s.D.keeper.role, obj: s.kf, ry: s.kf.rotation.y, r: 5 });
  const ln = s => text => ({ who: s.D.keeper.name, role: s.D.keeper.role, text });
  function startJob(s, k) { if (busy) return; const gm = s.D.games.find(g => g.k === k); if (!gm || (!GD[k] && !gm.play)) return; cur = s; busy = 'intro'; introT = 0; sayTo(tgt(s), [ln(s)(s.D.lines.jobs[k])], () => begin(k)); }
  function begin(k) { if (busy !== 'intro' || !cur) return; const gm = cur.D.games.find(g => g.k === k), D2 = GD[k];
    if (gm && gm.play) { if (!openPlay) { busy = null; toast('THE CASE IS CLOSED TODAY', 2); return; } J = { g: k, play: true, miss: 0, t: 0, slept: false }; playRes = null; busy = 'play'; ding(); openPlay(cur.D.name + ' \u00b7 ' + gm.name, gm.play); return; } J = { g: k, miss: 0, idle: 0, hinted: false, over: false }; busy = 'job'; ding(); openPanel(gm.name + ' \u00b7 ' + cur.D.keeper.name.toUpperCase(), D2.tip); D2.begin(); }
  function finishJob(stO, payO) { if (!J || busy !== 'job' || !cur) return; const s = cur, k = J.g, st = stO || stars(), o = OS(), jobs = { ...(o.jobs[s.D.key] || {}) }, first = !jobs[k], bonus = payO != null ? (first ? 10 + st * 5 : 0) : 0, gold = payO != null ? payO + bonus : first ? 10 + st * 5 : 5; hidePanel(); J = null;
    save.addGold(payO != null ? bonus : gold); coin(); try { save.addXp && save.addXp(first ? 15 : 4); } catch (e) {} jobs[k] = true; o.jobs = { ...o.jobs, [s.D.key]: jobs }; setOS(o); s.K.finish(k, st, gold, first); busy = 'end';
    const allNow = s.D.games.every(g => jobs[g.k]), prizeNow = allNow && !o.prize[s.D.key];
    sayTo(tgt(s), [ln(s)(s.D.lines.done[k] + (st === 3 ? s.D.lines.star3 : ''))], () => { busy = null; if (prizeNow) givePrize(s); });
    setTimeout(() => { if (busy === 'end') busy = null; }, 30000); }
  function givePrize(s) { const o = OS(); if (o.prize[s.D.key]) return; o.prize = { ...o.prize, [s.D.key]: true }; setOS(o); const P2 = s.D.prize;
    sayTo(tgt(s), [ln(s)(P2.line)], () => { try { if (P2.outfit) { const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === P2.outfit.name)) save.setStat('tailorOutfits', [...list, P2.outfit]); save.setOutfit(P2.outfit); wear && wear(P2.outfit); } save.addGold(30); } catch (e) {}
      ding(); toast(P2.outfit.name + ' \u00b7 WORN + IN THE TAILOR\u2019S WARDROBE \u00b7 +30 GOLD', 4); }); }
  // the 3D shift ran in the hire panel (its own save writes reach this page through the storage event); here: stars, board, first-clear bonus, prize
  let playRes = null; addEventListener('message', e => { const d = e.data; if (d && d.type === 'foxGelato:done' && busy === 'play') playRes = d; });
  function finishPlay(r) { const s = cur; if (!s) { J = null; busy = null; return; } if ((r.served || 0) < 3) { J = null; busy = 'end'; sayTo(tgt(s), [ln(s)(s.D.lines.short || 'Not quite. Try again.')], () => { busy = null; }); return; }
    const st = r.avg >= 2.5 ? 3 : r.avg >= 1.8 ? 2 : 1; busy = 'job'; finishJob(st, r.total || 0); }
  function quit() { if (busy === 'intro') { busy = null; return; } if (busy !== 'job') return; hidePanel(); J = null; busy = null; toast('JOB STOPPED \u00b7 COME BACK ANY TIME', 2); }
  // ================= keeper menu + shop =================
  function menu(s) { const L2 = s.D.lines, o = OS(), T = tgt(s), l = ln(s), first = !o.met[s.D.key]; if (first) { o.met = { ...o.met, [s.D.key]: true }; setOS(o); }
    const n = o.hi[s.D.key] || 0; if (!first) { o.hi = { ...o.hi, [s.D.key]: n + 1 }; setOS(o); }
    const jobs = o.jobs[s.D.key] || {}, nextK = (s.D.games.find(g => !jobs[g.k]) || s.D.games[n % s.D.games.length]).k;
    sayTo(T, [{ ...l(first ? L2.first : L2.hi[n % L2.hi.length]), choices: [{ text: CHOICE_WORK, pick: () => startJob(s, nextK) }, { text: 'BROWSE THE SHELVES', pick: () => shop(s) },
      { text: 'WHERE WERE YOU?', pick: () => sayTo(tgt(s), [l(L2.where)]) }, { text: CHOICE_BYE, bye: true, pick: () => sayTo(tgt(s), [l(L2.bye)]) }] }]); }
  function shop(s) { const l = ln(s);
    sayTo(tgt(s), [{ ...l(s.D.lines.shop + ' You have ' + save.data.gold + ' G.'), choices: [...(window.__8G_ITEMS ? window.__8G_ITEMS.stock(s.D.stock, 'Meru Outlets') : s.D.stock).map(it => ({ text: it.label + ' \u00b7 ' + it.price + ' G \u00b7 ' + it.note, pick: () => buy(s, it) })), { text: CHOICE_BYE, bye: true, pick: () => sayTo(tgt(s), [l(s.D.lines.bye)]) }] }]); }
  function buy(s, it) { const l = ln(s);
    if (it.outfit) { const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : [], owned = list.some(x => x.name === it.outfit.name);
      if (!owned && !save.spend(it.price)) { nope(); sayTo(tgt(s), [l(s.D.lines.broke)]); return; } try { if (!owned) save.setStat('tailorOutfits', [...list, it.outfit]); save.setOutfit(it.outfit); wear && wear(it.outfit); } catch (e) {}
      coin(); toast(it.outfit.name + (owned ? ' \u00b7 ALREADY YOURS \u00b7 WORN' : ' \u00b7 WORN + IN THE TAILOR\u2019S WARDROBE \u00b7 \u2212' + it.price + ' G'), 2.8); sayTo(tgt(s), [l(s.D.lines.bought)], () => shop(s)); return; }
    if (!save.spend(it.price)) { nope(); sayTo(tgt(s), [l(s.D.lines.broke)]); return; } save.give(it.key); coin(); toast(it.label + ' \u00b7 IN YOUR BAG \u00b7 \u2212' + it.price + ' G', 2.4); sayTo(tgt(s), [l(s.D.lines.bought)], () => shop(s)); }
  // ================= talk + prompt =================
  const dist = (P, x, z) => Math.hypot(P.x - x, P.z - z);
  const here = P => ST.find(s => s.open && inside(s, P));
  const ringAt = (s, P) => s.rings.find(r => dist(P, r.x, r.z) < 1.05);
  const atKeeper = (s, P) => dist(P, s.talkAt[0], s.talkAt[1]) < 1.9 || dist(P, s.kf.position.x, s.kf.position.z) < 2.2;
  function prompt(P) { if (busy || !P) return null; const s = here(P); if (!s) return null; const r = ringAt(s, P), jobs = OS().jobs[s.D.key] || {};
    if (r) return (jobs[r.g.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.g.name; if (s.K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; if (atKeeper(s, P)) return 'TALK \u00b7 ' + s.D.keeper.name.toUpperCase(); return null; }
  function talk(P) { if (busy === 'job') return true; if (busy || !P) return false; const s = here(P); if (!s) return false; const r = ringAt(s, P);
    if (r) { startJob(s, r.g.k); return true; } if (s.K.atHiring(P)) { const jobs = OS().jobs[s.D.key] || {}; startJob(s, (s.D.games.find(g => !jobs[g.k]) || s.D.games[0]).k); return true; }
    if (atKeeper(s, P)) { tone(1320, 0.05, 0.5); menu(s); return true; } return false; }
  const HEAL = { sportsDrink: 25, proteinBar: 45, chargeCell: 35, megaCell: 70, travelPillow: 30, napBlanket: 60 };
  function useItem() { return false; }   // the healing items live in worlds/meru2-mart.js HEALS (one place for every snack)
  // ================= per frame =================
  let mountT = 0, openT = 0;
  function tick(dt, P) { if (!P) return; if (toastT > 0) toastT -= dt; const t = performance.now() / 1000;
    if ((mountT -= dt) <= 0) { mountT = 1; for (const D of DEFS) if (!ST.some(s => s.D === D)) try { mount(D); } catch (e) { console.warn('outlet open ' + D.key + ': ' + (e && e.stack || e)); } }
    if ((openT -= dt) <= 0) { openT = 0.5; for (const s of ST) setOpen(s, wantOpen(s.D.key)); }
    const jobsAll = OS().jobs;
    for (const s of ST) { if (!s.open) continue; const near = dist(P, (s.b.f[0] + s.b.f[1]) / 2, (s.b.f[2] + s.b.f[3]) / 2); s.G.visible = near < 80; if (near > 80) continue; const inShop = inside(s, P);
      s.K.tick(dt, P, { inShop, busy: busy === 'job' && cur === s, near: inShop ? 0 : near });
      const jobs = jobsAll[s.D.key] || {}; s.rings.forEach((r, i) => { r.m.visible = inShop && !busy; r.m.material = jobs[r.g.k] ? ringDone : ringM; r.m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + i)); }); }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if (busy === 'play' && J) { J.t += dt; if (window.__m2sleep) J.slept = true; else if (playRes || J.slept || J.t > 4) { const r = playRes; playRes = null; if (r) finishPlay(r); else { J = null; busy = null; toast('SHIFT STOPPED \u00b7 COME BACK ANY TIME', 2); } } }
    if (ST.length === DEFS.length && ST.every(s => s.open) && !save.flag('outletsAllOpen')) { try { save.setFlag('outletsAllOpen'); } catch (e) {} ding(); toast('ALL 5 OUTLETS STORES ARE OPEN \u00b7 DOZER WANTS A WORD', 4.5); }
    if (busy === 'job' && J) { const D2 = GD[J.g]; try { J.idle += dt; D2.tick && D2.tick(dt); if (J && busy === 'job') { const C2 = fitCv(J.cv); if (C2) D2.draw(C2.g, C2.w, C2.h); if (J.idle > 3 && !J.hinted) { J.hinted = true; pulse(J.cv); } } } catch (e) { console.warn('open job: ' + (e && e.stack || e)); quit(); } } }
  const API = { prompt, talk, tick, camFix() {}, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), toast: () => (toastT > 0 ? toastTxt : ''), ST, GD, HEAL,
    open: k => { const o = OS(); o.fix = { ...o.fix, [k]: day() - 1 }; setOS(o); const r = save.stat('outRepair', null) || {}; save.setStat('outRepair', { ...r, done: { ...(r.done || {}), [k]: true } }); openT = 0; },
    begin: k => { const s = ST.find(q => q.D.games.some(g => g.k === k)); if (!s) return; cur = s; busy = 'intro'; begin(k); }, finish: () => { if (J) { J.miss = 0; finishJob(); } },
    allOpen: () => ST.length === DEFS.length && ST.every(s => s.open), reset: () => { setOS(null); for (const s of ST) setOpen(s, false); openT = 0; }, dispose() { PANEL.remove(); } };
  window.__open = API; return API;
}
