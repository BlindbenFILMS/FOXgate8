// MERU 2.0 — s77 TOWN ROSTER (Ben): who lives where, who works where, and when they are out on the streets.
// Every entry: key · name · role · work (shop / post) · home (CRESTVIEW HOUSE or LAKESIDE TOWER + flat number) · shift [start, end] (hours) ·
// look (the keeper's own look, copied from their shop file) · stops = shops they pop into on the way (am = before work, pm = after work, lunch).
// Uniformed (guards, police, fire) also have WALK-THROUGHS: fixed times their beat crosses a shop (in the front door, round, out again), staggered.
// First user: the Meru Market (worlds/meru2-grocery-jobs.js) — its browsing customers ARE these foxes. Other shops can opt in with the same call.
// FIRE STATION: built s107 by the lake (worlds/meru2-fire.js). Chief Ember + Spritz (hose fox) live in town; Axle + Rung stand at the station only (no flats yet).
// Later (TOWN LIFE PLAN): the same schedule drives real walkers on the streets + the keepers locking up and walking home.
const RED = '#ec3013', INK = '#201e1d', WHITE = '#f3f2f2', NAVY = '#24344d', GOLD = '#c9a227';
export const HOMES = { crest: 'Crestview House', lake: 'Lakeside Tower', barracks: 'Barracks bunk room' };   // flats 101-105 + 201-205; x04 on floor 2 = the PENTHOUSE (the player rents it) so nobody lives in 204
const S = (key, name, role, work, home, shift, look, stops = []) => ({ key, name, role, work, home, shift, look, stops });
export const ROSTER = [
  // ---- shop keepers (looks from their shop files) ----
  S('mrPenny', 'Mr. Penny', 'Minimart keeper', 'Minimart', 'crest 101', [8, 18], { torso: [RED, WHITE, INK], outfit: 'vest', look: { elder: 1, fur: '#c9875a', furDark: '#8a5a3a', muzzle: '#f6f1ea' } }, ['am']),
  S('grannyCrust', 'Granny Crust', 'Pie Shop baker', 'Pie Shop', 'crest 102', [7, 15], { torso: ['#c2456a', WHITE, '#7a2340'], outfit: 'dress', look: { elder: 1, fur: '#b9aea4', furDark: '#857a70', muzzle: '#f6f1ea' } }, ['pm']),
  S('snipBarber', 'Snip', 'Barber', 'Barber Shop', 'lake 101', [9, 17], { torso: [WHITE, INK, '#111111'], outfit: 'vest', look: { fur: '#6b625b', furDark: '#3a3430', muzzle: '#ece5db' } }, ['pm']),
  S('laceShoes', 'Lace', 'Fox Feet Shoes', 'Fox Feet Shoes', 'lake 102', [9, 18], { torso: ['#2e4a6b', '#f3f2f2', '#16263c'], outfit: 'coat' }, ['lunch']),
  S('bean', 'Bean', "Foxes' Chocolates", "Foxes' Chocolates", 'crest 103', [10, 19], { torso: ['#7a2a3a', '#5e1f2c', '#3d141c'], outfit: 'vest' }, ['am']),
  S('cocoa', 'Cocoa', "Foxes' Chocolates", "Foxes' Chocolates", 'crest 103', [10, 19], { torso: ['#f6f3ec', '#e6e0d4', '#c9c2b4'], outfit: 'coat' }, ['pm']),
  S('reelBait', 'Reel', 'Bait + Tackle', 'Bait Shop', 'lake 103', [6, 16], { torso: ['#6b7a2a', WHITE, '#3f4a20'], outfit: 'vest', look: { fur: '#d9a86c', furDark: '#a8763e', muzzle: '#f6ead8' }, hat: ['cap', '#6b7a2a'] }, ['pm']),
  S('gearsHobby', 'Gears', 'Hobby Shop', 'Hobby Shop', 'lake 105', [10, 18], { torso: ['#7a5638', '#e9dcc3', '#4a3424'], outfit: 'coat', look: { fur: '#9a958e', furDark: '#6b665f', muzzle: '#ece7df' } }, ['am']),
  S('birdieGolf', 'Birdie', 'Minigolf', 'Minigolf', 'crest 105', [10, 20], { torso: [WHITE, '#2f7a4a', INK], outfit: 'vest', look: { fur: '#d9813a', furDark: '#a85a22', muzzle: '#fbeee0' }, hat: ['cap', WHITE] }, ['lunch']),
  S('stampsPost', 'Stamps', 'Post Office', 'Post Office', 'crest 201', [8, 17], { torso: [NAVY, GOLD, INK], outfit: 'coat', look: { elder: 1, fur: '#a7adb3', furDark: '#70767c', muzzle: '#f6f1ea' }, hat: ['cap', NAVY] }, ['pm']),
  S('boltGas', 'Bolt', 'Gas Station', 'Gas Station', 'lake 201', [6, 14], { torso: ['#2e4a6b', '#243b56', '#1a2a3e'], outfit: 'vest', hat: ['cap', RED] }, ['pm']),
  S('mamaKeys', 'Mama Keys', 'Meru Motel', 'Meru Motel', 'crest 202', [8, 20], { torso: ['#b9a6d9', '#9a80c0', '#7a62a0'], outfit: 'coat', look: { fur: '#9a9490', furDark: '#6f6a66', muzzle: '#f2ece6', lashes: 1 } }, ['lunch']),
  S('quillMuseum', 'Prof. Quill', 'Museum curator', 'Meru Museum', 'crest 203', [10, 18], { torso: ['#4f6b4a', '#e6b45a', '#2e3f2a'], outfit: 'coat', look: { fur: '#c98a4a', furDark: '#9a6430', muzzle: '#f3dcc0', lashes: 1 } }, ['am']),
  S('drLimber', 'Dr. Limber', 'Chiropractor', 'Chiropractor', 'lake 202', [9, 17], { torso: [WHITE, '#3f9a5e', '#cfcac3'], outfit: 'robe', look: { fur: '#d9a066', furDark: '#8a5a2b', muzzle: '#f6ead8' } }, ['pm']),
  S('bigTallRock', 'Big Tall', 'Rock Wall', 'Rock Wall', 'lake 203', [11, 21], { torso: ['#5a6b7a', '#e2e6ea', '#2f3a44'], outfit: 'tee', look: { fur: '#7a4a2a', furDark: '#4a2a14', muzzle: '#f1e2cf' } }, ['am']),
  S('sirPercy', 'Sir Percy', 'Country Club', 'Country Club', 'lake 205', [10, 22], { torso: [NAVY, '#24405e', '#1a2e44'], outfit: 'suit', look: { fur: '#c8c4c0', furDark: '#8f8a86', muzzle: '#f4f0ec' }, hat: ['cap', WHITE] }, ['lunch']),
  // ---- MERU GUARDS (Barracks; they wear armour) ----
  S('guardFlint', 'Guard Flint', 'Meru Guard', 'Barracks', 'barracks 1', [6, 18], { torso: ['#5a6470', '#3a424c', '#22282e'], outfit: 'armor', hat: ['helm', '#8a949c'] }),
  S('guardAsh', 'Guard Ash', 'Meru Guard', 'Barracks', 'barracks 2', [6, 18], { torso: ['#5a6470', '#3a424c', '#22282e'], outfit: 'armor', hat: ['helm', '#8a949c'] }),
  S('guardBrick', 'Guard Brick', 'Meru Guard', 'Barracks', 'barracks 3', [14, 22],   /* s97: in his bunk 2200-0600 (barracks lights out) */ { torso: ['#7a3a2a', '#5a2a1e', '#3a1a12'], outfit: 'armor', hat: ['helm', '#8a949c'] }),
  // ---- BARRACKS ROAD SHOPS (s97, Ben: yes; both ex-army, still bunk at the barracks) ----
  S('sgtBiscuit', 'Sgt. Biscuit', 'Barracks Minimart', 'Barracks Minimart', 'barracks 4', [5, 22], { torso: ['#4f5d2f', '#d9cfae', '#2f3a1f'], outfit: 'vest', look: { elder: 1 } }, ['lunch']),
  S('dotDiesel', 'Dot Diesel', 'Motor Pool Gas', 'Barracks Gas', 'barracks 5', [6, 18], { torso: ['#4f5d2f', '#3f4a25', '#2a3218'], outfit: 'vest', look: { fur: '#a39a90', furDark: '#6b635b', muzzle: '#f3f2f2', lashes: 1 }, hat: ['cap', '#ffd23a'] }, ['pm']),
  // ---- MERU POLICE (Police station on Civic Row) ----
  S('officerRusty', 'Officer Rusty', 'Meru Police', 'Police', 'crest 104', [7, 17], { torso: [NAVY, '#1a2a3e', '#0f1a28'], outfit: 'suit', hat: ['police', NAVY] }),
  S('officerVixen', 'Officer Vixen', 'Meru Police', 'Police', 'lake 104', [12, 22], { torso: [NAVY, '#1a2a3e', '#0f1a28'], outfit: 'suit', look: { lashes: 1 }, hat: ['police', NAVY] }),
  // ---- MERU FIRE CREW (Meru Fire Station by the lake, s107) ----
  S('chiefEmber', 'Chief Ember', 'Fire Chief', 'fireStation', 'crest 205', [8, 20], { torso: ['#c42d3c', '#ffd23a', '#7f1d1d'], outfit: 'coat', hat: ['fire', RED] }, ['lunch']),
  S('spritz', 'Spritz', 'Hose Fox', 'fireStation', 'lake 203'   /* flatmate of Big Tall */, [8, 20], { torso: ['#c42d3c', '#ffd23a', '#7f1d1d'], outfit: 'coat', hat: ['fire', '#ffd23a'] })
];
// staggered beats through each shop: [hour, roster key] — they walk in, take one look round, and leave (no shopping)
export const BEATS = { police: [[7.4, 'officerRusty'], [8.8, 'guardFlint'], [10.1, 'chiefEmber'], [11.7, 'guardAsh'], [12.2, 'officerVixen'], [13.9, 'spritz'], [15.3, 'guardBrick'], [16.6, 'officerRusty'], [18.0, 'officerVixen'], [19.6, 'guardFlint'], [21.2, 'officerVixen']], bank: [[9.2, 'officerRusty'], [10.6, 'guardAsh'], [12.4, 'officerVixen'], [14.1, 'guardFlint'], [15.7, 'officerRusty'], [17.2, 'guardBrick']], armory: [[8.0, 'guardFlint'], [9.1, 'chiefEmber'], [10.2, 'officerRusty'], [11.4, 'guardAsh'], [12.5, 'spritz'], [13.6, 'officerVixen'], [14.8, 'guardFlint'], [15.9, 'guardBrick'], [17.1, 'officerRusty'], [18.2, 'chiefEmber'], [19.3, 'officerVixen'], [20.4, 'guardBrick'], [21.6, 'guardAsh']], market: [[8.3, 'officerRusty'], [9.6, 'guardFlint'], [11.1, 'spritz'], [12.9, 'officerVixen'], [14.4, 'guardAsh'], [16.2, 'officerRusty'], [16.9, 'spritz'], [18.4, 'guardBrick'], [20.6, 'officerVixen'], [21.4, 'guardBrick']] };
const inWin = (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b);
// who is due in a shop at hour h: browsers (their stop window) + walk-throughs (a 0.35 h window from the beat time)
export function dueAt(shop, h) {
  const out = [];
  for (const r of ROSTER) { const [s, e] = r.shift; for (const w of r.stops) { const win = w === 'am' ? [s - 0.9, s - 0.3] : w === 'pm' ? [e + 0.15, e + 0.75] : [12.2, 13.1]; if (inWin(h, (win[0] + 24) % 24, (win[1] + 24) % 24)) out.push({ r, kind: 'browse', why: w === 'am' ? 'ON THE WAY TO WORK' : w === 'pm' ? 'ON THE WAY HOME' : 'ON LUNCH' }); } }
  for (const [t, k] of BEATS[shop] || []) if (inWin(h, t, (t + 0.35) % 24)) { const r = ROSTER.find(q => q.key === k); if (r) out.push({ r, kind: 'through', why: 'ON THE BEAT' }); }
  return out;
}
export const workLabel = r => (r.work === 'fireStation' ? 'MERU FIRE' : r.work.toUpperCase());
// the hats the uniforms need (keepers' own hats stay in their shop files)
export function dressFox(THREE, f, hat) {
  const P = f.userData && f.userData.P; if (!P || !P.head || !hat) return; const [k, c] = hat, LM = col => new THREE.MeshLambertMaterial({ color: col }), g = new THREE.Group();
  const m = (geo, col, x, y, z) => { const o = new THREE.Mesh(geo, LM(col)); o.position.set(x, y, z); g.add(o); return o; };
  if (k === 'cap') { m(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 14), c, 0, 0.32, 0); const b = m(new THREE.BoxGeometry(0.3, 0.02, 0.18), c, 0, 0.27, 0.2); b.rotation.x = 0.15; }
  else if (k === 'police') { m(new THREE.CylinderGeometry(0.25, 0.21, 0.14, 16), c, 0, 0.34, 0); m(new THREE.CylinderGeometry(0.215, 0.215, 0.04, 16), INK, 0, 0.29, 0); const b = m(new THREE.BoxGeometry(0.3, 0.02, 0.16), INK, 0, 0.27, 0.2); b.rotation.x = 0.2; m(new THREE.BoxGeometry(0.07, 0.07, 0.02), GOLD, 0, 0.35, 0.24); }
  else if (k === 'fire') { const d = m(new THREE.SphereGeometry(0.24, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), c, 0, 0.26, 0); d.scale.set(1, 0.85, 1.1); const br = m(new THREE.CylinderGeometry(0.34, 0.36, 0.025, 18), c, 0, 0.26, 0.05); br.scale.set(1, 1, 1.25); m(new THREE.BoxGeometry(0.1, 0.12, 0.02), GOLD, 0, 0.38, 0.24); }
  else if (k === 'helm') { const d = m(new THREE.SphereGeometry(0.25, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), c, 0, 0.24, 0); d.scale.set(1, 0.95, 1.05); m(new THREE.BoxGeometry(0.04, 0.16, 0.36), RED, 0, 0.42, 0); }
  g.traverse(o => { o.renderOrder = 2; }); P.head.add(g);
  if (P.sword) P.sword.visible = k === 'helm'; if (P.gun) P.gun.visible = false;
}
// one fox per roster entry, made the first time they are needed (phone budget: the shop keeps at most `cap` of them)
export function rosterFoxes({ THREE, kit, cap = 6 }) {
  const made = new Map();
  return function fox(r, parent) { if (made.has(r.key)) return made.get(r.key);
    if (made.size >= cap) { for (const [k, f] of made) if (!f.visible) { f.parent && f.parent.remove(f); made.delete(k); break; } }
    const L = r.look, f = kit.makeFox({ key: 'rs_' + r.key, torso: L.torso, outfit: L.outfit, mood: 'happy', look: L.look }); dressFox(THREE, f, L.hat); f.visible = false; f.userData.roster = r; parent.add(f); made.set(r.key, f); return f; };
}
