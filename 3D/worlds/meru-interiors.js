// MERU — interiors behind the Castle Path doors: Barracks [meruBarracks] and Throne Room [meruThroneroom].
// Same scene as the map, far south (like the Tavern and Casino); entered with the quick fade.
// Laid out from the 2D scenes (ref/meruBarracks.*, ref/meruThroneroom.*). People and lines from surface_meru.html.

// ---------- BARRACKS: 2D 2880x2880, inner walls 360..2520 → 27 m square ----------
export const BAR = { x: 140, z: 230, w: 27, d: 27, h: 6.5, key: 'barracks' };
const bx = px => BAR.x + (px - 1440) / 80, bz = py => BAR.z + (py - 1440) / 80, bw = p => p / 80;
export const BAR_EXIT = { x: bx(1440), z: bz(2470) };
export const BAR_SPOTS = [
  ...[540, 760, 980, 1200].flatMap(py => [{ x: bx(700), z: bz(py), bunk: true }, { x: bx(2180), z: bz(py), bunk: true }]),
  { x: bx(760), z: bz(1800), range: true }, { x: bx(800), z: bz(2050), spar: true },
];

// ---------- THRONE ROOM: 2D 2430x4290, inner 388..2042 x 422..3932 → 18.4 m x 39 m ----------
export const THR = { x: 210, z: 230, w: 18.4, d: 39, h: 11, key: 'throneroom' };
const tx = px => THR.x + (px - 1215) / 90, tz = py => THR.z + (py - 2177) / 90, tw = p => p / 90;
export const THR_EXIT = { x: tx(1215), z: tz(3860) };
export const KING_SPOT = { x: tx(1215), z: tz(930) };

export const PEOPLE = [
  { key: 'barracksGuardCaptain', name: 'Guard Captain', role: 'Barracks', outfit: 'armor', torso: ['#52525b', '#27272a', '#09090b'], crest: 'M', gear: 'sword', x: bx(1471), z: bz(900), face: 0, mood: 'stern', pts: [[bx(1440), bz(920)], [bx(1440), bz(1380)]], speed: 1.0 },
  { key: 'barracksMasterOfArms', name: 'Master of Arms', role: 'Barracks', outfit: 'armor', torso: ['#1e3a8a', '#1e3a8a', '#172554'], crest: 'M', gear: 'sword', x: bx(1080), z: bz(1830), face: -Math.PI / 2, mood: 'determined' },
  { key: 'mike', name: 'King Might', role: 'King of Meru', outfit: 'armor', king: true, torso: ['#7a808c', '#474d59', '#23272f'], crest: 'M', crown: true, eyes: ['#e6b45a', '#e6b45a'], x: KING_SPOT.x, z: KING_SPOT.z, face: 0, mood: 'warm' },
];
export const MAX = { key: 'max', name: 'Max', role: 'Prince', outfit: 'armor', torso: ['#3a4a75', '#22304f', '#0e1730'], crest: 'M', x: KING_SPOT.x - 1.6, z: KING_SPOT.z + 0.6, face: 0, mood: 'happy' };

export const DIALOGUE = {
  barracksGuardCaptain: [{ who: 'player', text: 'Captain. What is this place?' }, { who: 'npc', text: 'The King\u0027s barracks. Bunks, board and a floor to bleed on \u2014 everything a fox needs to be made useful.' }, { who: 'npc', text: 'The King\u0027s orders come through me. When one has your name on it you will hear it from me, not off a board.' }, { who: 'player', text: 'And the rest of the room?' }, { who: 'npc', text: 'RANGE is down the west end \u2014 put a few in the gold, it costs you nothing. The circle past it is for SPARRING, and the MASTER OF ARMS is always willing.' }, { who: 'npc', text: 'Take a BUNK if you are carrying wounds. You are no use to the King half-dead and proud of it.' }],
  barracksMasterOfArms: [{ who: 'player', text: 'They say you train the King\u0027s guard.' }, { who: 'npc', text: 'I train whoever walks in. You included, if you have the stomach for the circle.' }, { who: 'player', text: 'What should I be working on?' }, { who: 'npc', text: 'Four things, and everyone favours the wrong one. ATTACK is what your blade takes off them. DEFENSE is what you shrug off.' }, { who: 'npc', text: 'SPEED is the one nobody respects \u2014 it is your feet, your reach, and how often a blow finds nothing but air where you were.' }, { who: 'npc', text: 'SMARTS is what your scanner tells you and what a clever fox can talk their way into. Sharp enough and doors open that never open for a big arm.' }, { who: 'player', text: 'And which do YOU favour?' }, { who: 'npc', text: 'The one my opponent has neglected. Step in the circle and I will tell you which of yours that is.' }],
  mike: [{ who: 'player', text: 'Uncle Might, how did you manage to wake the 8 active gates?' }, { who: 'npc', text: 'Decades of isolation, my child. The centre gate was broken beyond any repair.' }, { who: 'npc', text: 'But I harvested its GODrock matrices for the frequency. That frequency woke the other eight. It is my gift to our species.' }, { who: 'player', text: 'What is your wish for the galaxy as you turn 200?' }, { who: 'npc', text: 'Peace, child. True, lasting stability. I terraformed seven frozen rocks so our kind could flourish.' }, { who: 'npc', text: 'Do not let petty rivalries tear it down.' }],
};
// startCastleAudience, verbatim (nm = the player's name; the 2D default is FOX SOLDIER)
export function audienceLines(nm = 'FOX SOLDIER') {
  return [{ who: 'npc', text: 'MAX. They say you were taken by bandits? And that they hold a base in our own kingdom!' }, { who: 'max', text: 'YES, Father. But my cousin saved me. I was searching for the perfect present for you.' }, { who: 'npc', text: 'You being safe is gift enough for me.' }, { who: 'npc', text: nm + ', THANK YOU. Please accept this gift of HEALING CHARGES.' }, { who: 'player', text: 'You are too generous, my King.' }, { who: 'npc', text: 'There is more! I gathered the family here to give each of you... your own planetary defence FLAGSHIP.' }, { who: 'player', text: 'MY KING! The timing could not be better. I have been rushing to tell you.' }, { who: 'player', text: 'The MACHINE FLEET malfunctioned and attacked us! On our way to your party!' }, { who: 'npc', text: 'YES. The Meru Travel Gate is damaged. We cannot reach the whole Machine Fleet at once.' }, { who: 'npc', text: 'Some ships have been malfunctioning.' }, { who: 'max', text: 'At first we thought someone had broken into the system. Feeding the Machine Fleet false commands.' }, { who: 'npc', text: 'That is impossible, son. You know this.' }, { who: 'max', text: 'Yes, Father. Your computer system could never be broken into. I know.' }, { who: 'npc', text: 'As I was saying. Each planet now gets its own defending ship. Fully equipped. It stays with your planet, always.' }, { who: 'player', text: 'It carries ALL the newest weapons? Even ones I have no science to make?' }, { who: 'npc', text: 'Yes. Every weapon I have ever created. Which is why it only works inside your own borders.' }, { who: 'player', text: 'Your wisdom bought us a hundred years of peace. Thank you, my King.' }, { who: 'npc', text: 'And through all this excitement, I have not forgotten. Your VALOUR. Your victory at the tournament today.' }, { who: 'npc', text: 'Your PRIZE is a BIG LASER GUN! And go and talk to your cousins tonight.' }, { who: 'npc', text: 'Who knows when this room will hold us all again.' }];
}
// grantCastleGifts
export function grantGifts(save) {
  save.give('healingCharges', 5); save.addGold(150); if (!save.count('planetaryDefenceFlagship')) save.give('planetaryDefenceFlagship'); if (!save.flag('bigLaser')) { save.setFlag('bigLaser'); save.give('bigLaserGun'); }
  save.setFlag('castleAudienceDone');
}

// ---------- build ----------
export function buildInteriors(K) {
  const { THREE, scene, M, BOX, toon, grad, glowing, glowSprite, BK, colliders, camBlockers, flames, bannerM, emblemTex, signTex, lampM, DARK, GOLD, WOOD, crystalM, roomLights } = K;
  const plainWall = (T, R, wallM, trimM) => { const W2 = R.w / 2, D2 = R.d / 2;
    for (const [x, z, w, ry] of [[0, -D2, R.w, 0], [-W2, 0, R.d, Math.PI / 2], [W2, 0, R.d, -Math.PI / 2]]) { const wg = new THREE.Group(); wg.position.set(x, 0, z); wg.rotation.y = ry; T.add(wg); const m = new THREE.Mesh(BOX(w, R.h, 0.4), wallM); m.position.y = R.h / 2; m.receiveShadow = true; wg.add(m); M(BOX(w, 0.3, 0.5), trimM, 0, 0.15, 0.05, wg, 0); M(BOX(w, 0.35, 0.55), trimM, 0, R.h - 0.18, 0.05, wg, 0); }
    // front wall with a door gap (3.4 m)
    for (const s of [-1, 1]) { const ww = W2 - 1.7, m = new THREE.Mesh(BOX(ww, R.h, 0.4), wallM); m.position.set(s * (1.7 + ww / 2), R.h / 2, D2); T.add(m); }
    M(BOX(3.4, R.h - 3.6, 0.4), wallM, 0, 3.6 + (R.h - 3.6) / 2, D2, T, 0); M(BOX(3.8, 0.35, 0.6), GOLD, 0, 3.55, D2, T, 0.02);
    for (const s of [-1, 1]) { M(BOX(1.65, 3.4, 0.12), DARK, s * 0.85, 1.7, D2 + 0.25, T, 0.02); M(new THREE.TorusGeometry(0.16, 0.035, 6, 14), GOLD, s * 0.35, 1.7, D2 + 0.18, T, 0); }
  };
  const light = (x, y, z, col, k, dist = 9) => { const L = new THREE.PointLight(col, 0, dist, 1.6); L.position.set(x, y, z); scene.add(L); roomLights.push({ L, k }); return L; };
  const brazier = (T, x, z, ox, oz) => { const g = new THREE.Group(); g.position.set(x, 0, z); T.add(g); M(new THREE.CylinderGeometry(0.28, 0.4, 0.8, 10), toon('#3a3f6b'), 0, 0.4, 0, g, 0.03, 0.4); M(new THREE.CylinderGeometry(0.62, 0.38, 0.32, 12), toon('#4a4f78'), 0, 0.95, 0, g, 0.03, 0.62);
    const fl = M(new THREE.ConeGeometry(0.34, 0.85, 8), glowing('#ff9a3a', null, 2.4), 0, 1.5, 0, g, 0); fl.castShadow = false; const fi = M(new THREE.ConeGeometry(0.18, 0.5, 8), glowing('#ffe28a', null, 2.4), 0, 1.38, 0, g, 0); fi.castShadow = false;
    flames.push({ fl, fi, ph: Math.random() * 10 }); glowSprite(0, 1.55, 0, 0xff9a40, 3.6, g); colliders.push({ c: [ox + x, oz + z, 0.65] }); };
  const torch = (T, x, y, z, ry) => BK.sconce(T, x, y, z, ry);
  const box = (T, ox, oz, x0, x1, z0, z1, h, mat, out = 0.03) => { M(BOX(x1 - x0, h, z1 - z0), mat, (x0 + x1) / 2, h / 2, (z0 + z1) / 2, T, out); colliders.push({ box: [ox + x0, ox + x1, oz + z0, oz + z1] }); };
  const disc = (T, x, y, z, r, rx = -Math.PI / 2) => { const t = emblemTex(); const d = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshToonMaterial({ map: t, gradientMap: grad })); d.rotation.x = rx; d.position.set(x, y, z); T.add(d); return d; };

  const groups = {};
  // ===== BARRACKS =====
  { const R = BAR, T = new THREE.Group(); groups.barracks = T; T.position.set(R.x, 0, R.z); scene.add(T); camBlockers.push(T); const L = p => (p - 1440) / 80, ox = R.x, oz = R.z;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(R.w, R.d), BK.texMat('stone', '#6a6f99', R.w / 2.6, R.d / 2.6)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; T.add(floor);
    const wallM = BK.texMat('brick', '#2c3058', R.w / 2.4, R.h / 2.4), trimM = toon('#1b1f3f');
    plainWall(T, R, wallM, trimM);
    // north half: bunks on both sides, lockers along the north wall, two rugs, the Captain's desk
    const red = toon('#a8323e'), redT = toon('#c7a35a'), navy = toon('#1f2650'), sheet = toon('#e7e5ef');
    for (const [a, b] of [[828, 1120], [1760, 2050]]) { const rug = new THREE.Mesh(BOX(bw(b - a), 0.04, bw(820)), red); rug.position.set(L((a + b) / 2), 0.02, L(930)); T.add(rug); const tr = new THREE.Mesh(BOX(bw(b - a) - 0.4, 0.045, bw(820) - 0.4), toon('#8e2733')); tr.position.copy(rug.position); tr.position.y = 0.025; T.add(tr); }
    for (const py of [540, 760, 980, 1200]) for (const [x0, x1, hx] of [[380, 760, 380], [2120, 2500, 2500]]) {
      const cx2 = L((x0 + x1) / 2), cz2 = L(py), len = bw(x1 - x0);
      box(T, ox, oz, L(x0), L(x1), cz2 - 0.75, cz2 + 0.75, 0.5, navy); M(BOX(len - 0.2, 0.2, 1.3), sheet, cx2, 0.6, cz2, T, 0.015); M(BOX(0.5, 0.18, 1.0), toon('#ffffff'), L(hx) + (hx < 1440 ? 0.5 : -0.5), 0.78, cz2, T, 0.01); M(BOX(0.25, 1.0, 1.5), navy, L(hx) + (hx < 1440 ? 0.1 : -0.1), 0.5, cz2, T, 0.02);
      M(BOX(0.55, 0.65, 0.55), toon('#2a315a'), L(hx < 1440 ? x1 : x0) + (hx < 1440 ? 0.35 : -0.35), 0.33, cz2 - 0.4, T, 0.02);
    }
    for (const [a, b] of [[370, 1150], [1730, 2510]]) { box(T, ox, oz, L(a), L(b), L(362), L(462), 2.2, toon('#1f2650')); for (let x = a + 78; x < b; x += 156) M(BOX(0.08, 1.9, 0.03), DARK, L(x), 1.1, L(462) + 0.01, T, 0); }
    box(T, ox, oz, L(1310), L(1630), L(660), L(860), 0.95, toon('#26306b')); M(BOX(bw(320) + 0.2, 0.08, bw(200) + 0.2), toon('#3a4580'), L(1470), 0.99, L(760), T, 0.015);
    M(BOX(0.5, 0.04, 0.6), toon('#f4f1ec'), L(1380), 1.04, L(740), T, 0); M(new THREE.CylinderGeometry(0.12, 0.14, 0.3, 10), lampM, L(1590), 1.18, L(700), T, 0.01); glowSprite(L(1590), 1.3, L(700), 0xffc070, 1.4, T); box(T, ox, oz, L(1395), L(1545), L(560), L(640), 1.1, toon('#141838'));
    { const b = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.0), bannerM); b.position.set(0, 4.6, -R.d / 2 + 0.22); T.add(b); }
    brazier(T, L(1180), L(940), ox, oz); brazier(T, L(1700), L(940), ox, oz);
    // centre runner from the desk to the door, the M seal
    const run = new THREE.Mesh(BOX(bw(176), 0.03, bw(1780)), red); run.position.set(0, 0.02, L(1770)); T.add(run);
    { const g = new THREE.Group(); g.position.set(0, 0.04, L(1760)); T.add(g); M(new THREE.CylinderGeometry(bw(150), bw(150), 0.05, 40), toon('#a8323e'), 0, 0, 0, g, 0); disc(g, 0, 0.03, 0, bw(110)); M(new THREE.TorusGeometry(bw(112), 0.05, 6, 40), GOLD, 0, 0.04, 0, g, 0).rotation.x = Math.PI / 2; }
    // partition walls: north/south split with the hall gap; corridor walls with openings into each wing
    const partM = BK.texMat('brick', '#2c3058', 4, 1.2);
    box(T, ox, oz, L(360), L(1230), L(1440), L(1550), 3.2, partM); box(T, ox, oz, L(1650), L(2520), L(1440), L(1550), 3.2, partM);
    for (const [a, b] of [[1160, 1280], [1600, 1720]]) { box(T, ox, oz, L(a), L(b), L(1550), L(1760), 3.2, partM); box(T, ox, oz, L(a), L(b), L(2060), L(2520), 3.2, partM); }
    for (const [x, z] of [[1000, 1500], [1880, 1500], [1272, 2140], [1608, 2100]]) torch(T, L(x), 2.4, L(z) + 0.3, 0);
    // WEST WING: range (two targets), training dummies, the sparring circle, a bench, the weapon rack
    for (const px of [640, 880]) { const g = new THREE.Group(); g.position.set(L(px), 0, L(1610)); T.add(g); M(BOX(0.12, 1.6, 0.12), WOOD, -0.5, 0.8, 0, g, 0.01); M(BOX(0.12, 1.6, 0.12), WOOD, 0.5, 0.8, 0, g, 0.01);
      const rings = ['#f4f1ec', '#1b1830', '#38bdf8', '#c42d3c', '#e6b45a']; rings.forEach((c, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.62 - i * 0.12, 0.62 - i * 0.12, 0.08 + i * 0.005, 24), toon(c)); m.rotation.x = Math.PI / 2; m.position.set(0, 1.5, 0.05 + i * 0.006); g.add(m); }); colliders.push({ c: [ox + L(px), oz + L(1610), 0.6] }); }
    M(BOX(4.4, 0.03, 0.08), toon('#f4f1ec'), L(760), 0.02, L(1920), T, 0);
    for (const py of [1760, 2020, 2280]) { const g = new THREE.Group(); g.position.set(L(430), 0, L(py)); T.add(g); M(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), WOOD, 0, 0.5, 0, g, 0.01); M(new THREE.CylinderGeometry(0.3, 0.26, 0.8, 10), toon('#c7a35a'), 0, 1.3, 0, g, 0.02, 0.3); M(new THREE.SphereGeometry(0.22, 10, 8), toon('#c7a35a'), 0, 1.9, 0, g, 0.02, 0.22); M(BOX(0.9, 0.12, 0.12), WOOD, 0, 1.45, 0, g, 0.01); colliders.push({ c: [ox + L(430), oz + L(py), 0.4] }); }
    { const ring = new THREE.Mesh(new THREE.RingGeometry(bw(225), bw(240), 48), toon('#e7e5ef')); ring.rotation.x = -Math.PI / 2; ring.position.set(L(800), 0.03, L(2050)); T.add(ring); const pad = new THREE.Mesh(new THREE.PlaneGeometry(bw(480), bw(440)), toon('#7d82ab')); pad.rotation.x = -Math.PI / 2; pad.position.set(L(800), 0.015, L(2050)); T.add(pad); }
    box(T, ox, oz, L(1085), L(1150), L(2160), L(2340), 0.5, WOOD);
    box(T, ox, oz, L(560), L(1000), L(2420), L(2500), 1.7, toon('#1f2650')); for (let x = 600; x < 1000; x += 70) { M(BOX(0.05, 1.4, 0.05), toon('#cbd5e1'), L(x), 1.0, L(2410), T, 0); M(BOX(0.2, 0.05, 0.05), GOLD, L(x), 0.45, L(2410), T, 0); }
    // EAST WING: sword wall, shields, the workbench, crates, barrels
    box(T, ox, oz, L(1840), L(2520), L(1580), L(1650), 2.2, toon('#1f2650'));
    for (let x = 1880; x < 2380; x += 62) { M(BOX(0.06, 1.3, 0.04), toon('#e7edf4'), L(x), 1.4, L(1655), T, 0.008); M(BOX(0.24, 0.05, 0.06), GOLD, L(x), 0.78, L(1655), T, 0); }
    for (const x of [2410, 2450, 2490]) M(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 5), WOOD, L(x), 1.1, L(1660), T, 0);
    for (const py of [1760, 1960, 2160]) { M(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 20), toon('#2a315a'), L(2500), 1.6, L(py), T, 0.02, 0.42).rotation.z = Math.PI / 2; disc(T, L(2500) - 0.06, 1.6, L(py), 0.24, 0).rotation.y = -Math.PI / 2; }
    box(T, ox, oz, L(2080), L(2420), L(1930), L(2030), 0.95, toon('#26306b')); M(BOX(0.9, 0.04, 0.06), toon('#e7edf4'), L(2250), 1.0, L(1980), T, 0);
    box(T, ox, oz, L(1810), L(1950), L(2320), L(2460), 0.9, WOOD); box(T, ox, oz, L(1975), L(2115), L(2320), L(2460), 0.9, WOOD); M(BOX(0.6, 0.6, 0.6), WOOD, L(1880), 1.2, L(2390), T, 0.02);
    for (const [x, z] of [[2270, 2400], [2390, 2440]]) { M(new THREE.CylinderGeometry(0.42, 0.42, 1.0, 14), toon('#2a315a'), L(x), 0.5, L(z), T, 0.02, 0.42); colliders.push({ c: [ox + L(x), oz + L(z), 0.45] }); }
    // door crystals + lights (only on inside, phone budget)
    for (const px of [1260, 1620]) { const c = M(new THREE.OctahedronGeometry(0.22, 0), crystalM, L(px), 1.0, L(2556) - 0.6, T, 0.02, 0.22); c.scale.y = 1.5; flames.push({ spin: c }); }
    for (const [x, z] of [[1440, 900], [800, 1900], [2150, 1900], [1440, 2200]]) light(ox + L(x), 4.2, oz + L(z), 0xffd6a0, 9, 14);
  }

  // ===== THRONE ROOM =====
  { const R = THR, T = new THREE.Group(); groups.throneroom = T; T.position.set(R.x, 0, R.z); scene.add(T); camBlockers.push(T); const LX = p => (p - 1215) / 90, LZ = p => (p - 2177) / 90, ox = R.x, oz = R.z;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(R.w, R.d), BK.texMat('tile', '#7d82b0', R.w / 1.8, R.d / 1.8)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; T.add(floor);
    const wallM = BK.texMat('stone', '#2f3460', R.w / 2.6, R.h / 2.6), trimM = toon('#1b1f3f'); plainWall(T, R, wallM, trimM);
    // tall windows down both long walls
    const winM = glowing('#cfe3ff', null, 1.1);
    for (const py of [1285, 1758, 2230, 2703, 3175, 3648]) for (const s of [-1, 1]) { const x = s * (R.w / 2 - 0.21); M(BOX(0.1, 3.2, 1.0), winM, x, 4.2, LZ(py), T, 0); M(BOX(0.16, 3.5, 0.14), trimM, x, 4.2, LZ(py), T, 0); M(BOX(0.25, 0.2, 1.3), trimM, x, 2.5, LZ(py), T, 0.01); }
    // dais with two steps, the throne, the great banner, braziers, statues, crossed spears
    const daisM = toon('#c9c7dc'); box(T, ox, oz, LX(634), LX(1796), LZ(422), LZ(844), 0.5, daisM, 0.02); M(BOX(tw(1162), 0.25, 0.5), daisM, 0, 0.125, LZ(844) + 0.25, T, 0.02); M(BOX(tw(1300), 0.12, 0.5), daisM, 0, 0.06, LZ(844) + 0.75, T, 0.02);
    colliders.pop(); colliders.push({ box: [ox + LX(634), ox + LX(1796), oz + LZ(422), oz + LZ(700)] });
    { const g = new THREE.Group(); g.position.set(0, 0.5, LZ(560)); T.add(g); const red2 = toon('#a8323e'); M(BOX(1.8, 0.6, 1.3), toon('#26306b'), 0, 0.3, 0, g, 0.03); M(BOX(1.5, 0.22, 1.1), red2, 0, 0.7, 0.05, g, 0.02); M(BOX(1.8, 2.4, 0.3), toon('#26306b'), 0, 1.2, -0.55, g, 0.03); M(BOX(1.4, 1.9, 0.08), red2, 0, 1.45, -0.38, g, 0.01);
      for (const s of [-1, 1]) { M(BOX(0.25, 0.9, 1.2), toon('#26306b'), s * 0.95, 0.75, 0, g, 0.02); M(new THREE.SphereGeometry(0.16, 10, 8), GOLD, s * 0.95, 1.25, 0.5, g, 0.01, 0.16); }
      M(new THREE.SphereGeometry(0.2, 10, 8), GOLD, 0, 2.55, -0.55, g, 0.01, 0.2); }
    { const b = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 6.0), bannerM); b.position.set(0, 6.6, -R.d / 2 + 0.25); T.add(b); M(BOX(3.6, 0.15, 0.15), GOLD, 0, 9.65, -R.d / 2 + 0.28, T, 0); }
    for (const [x, z] of [[870, 690], [1566, 690]]) { const g = new THREE.Group(); g.position.y = 0.5; T.add(g); brazier(g, LX(x), LZ(z), ox, oz); }
    for (const px of [479, 1947]) { const g = new THREE.Group(); g.position.set(LX(px), 0, LZ(641)); T.add(g); M(BOX(1.1, 1.0, 1.1), toon('#3a3f6b'), 0, 0.5, 0, g, 0.03); M(new THREE.SphereGeometry(0.42, 10, 8), toon('#5a5f86'), 0, 1.45, 0, g, 0.03, 0.42); for (const s of [-1, 1]) M(new THREE.ConeGeometry(0.14, 0.42, 4), toon('#5a5f86'), s * 0.24, 1.95, 0, g, 0.02); colliders.push({ box: [ox + LX(px) - 0.6, ox + LX(px) + 0.6, oz + LZ(641) - 0.6, oz + LZ(641) + 0.6] }); }
    for (const px of [658, 1772]) for (const s of [-1, 1]) { const sp = M(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 5), WOOD, LX(px), 7.2, -R.d / 2 + 0.3, T, 0); sp.rotation.z = s * 0.6; M(new THREE.ConeGeometry(0.08, 0.3, 5), toon('#cbd5e1'), LX(px) + Math.sin(s * -0.6) * 1.2, 7.2 + Math.cos(0.6) * 1.2, -R.d / 2 + 0.3, T, 0).rotation.z = s * 0.6; }
    // the long red carpet + the seal
    const red = toon('#a8323e'), carpet = new THREE.Mesh(BOX(tw(506), 0.03, tw(3260)), red); carpet.position.set(0, 0.02, LZ(668 + 1630)); T.add(carpet);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(BOX(0.08, 0.035, tw(3260)), toon('#c7a35a')); e.position.set(s * (tw(253) - 0.1), 0.025, carpet.position.z); T.add(e); }
    { const g = new THREE.Group(); g.position.set(0, 0.045, LZ(2244)); T.add(g); M(new THREE.CylinderGeometry(tw(190), tw(190), 0.05, 48), toon('#a8323e'), 0, 0, 0, g, 0); disc(g, 0, 0.03, 0, tw(130)); M(new THREE.TorusGeometry(tw(132), 0.06, 6, 48), GOLD, 0, 0.04, 0, g, 0).rotation.x = Math.PI / 2; }
    // pillars, pennants, side braziers, torches on pillars
    for (const py of [1053, 1519, 1991, 2464, 2936, 3409]) for (const px of [776, 1647]) { const x = LX(px), z = LZ(py); M(BOX(1.5, 0.5, 1.5), toon('#1b1f3f'), x, 0.25, z, T, 0.02); M(new THREE.CylinderGeometry(0.5, 0.55, R.h - 1, 12), BK.texMat('stone', '#3a3f6b', 1, 3), x, R.h / 2, z, T, 0.03, 0.55); M(BOX(1.3, 0.4, 1.3), toon('#1b1f3f'), x, R.h - 0.6, z, T, 0.02); colliders.push({ c: [ox + x, oz + z, 0.75] }); torch(T, x + (px < 1215 ? 0.56 : -0.56), 2.6, z, px < 1215 ? Math.PI / 2 : -Math.PI / 2); }
    for (const py of [1286, 2228, 3172]) for (const px of [776, 1647]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 2.4), bannerM); b.position.set(LX(px), 5.2, LZ(py)); b.rotation.y = Math.PI / 2; T.add(b); }
    for (const py of [1282, 2228, 3172]) for (const px of [567, 1856]) brazier(T, LX(px), LZ(py), ox, oz);
    for (const [x, z] of [[705, 3577], [1725, 3577]]) brazier(T, LX(x), LZ(z), ox, oz);
    for (const px of [837, 1586]) box(T, ox, oz, LX(px) - 0.4, LX(px) + 0.4, LZ(3500), LZ(3660), 0.5, toon('#5a5f86'));
    for (const px of [930, 1500]) { const c = M(new THREE.OctahedronGeometry(0.22, 0), crystalM, LX(px), 1.0, LZ(3990) - 0.8, T, 0.02, 0.22); c.scale.y = 1.5; flames.push({ spin: c }); }
    for (const py of [900, 1900, 2900, 3600]) light(ox, 6.5, oz + LZ(py), 0xffd2a0, 10, 16);
  }
  return groups;
}
