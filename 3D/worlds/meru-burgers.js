// MERU — Burgers [meruBurgers]: the diner. Sizzle (cook) and Michael Jay; lines verbatim from surface_meru.html
// (openBurgerTalk, openMichaelJayTalk). The 2D square has no slot for it among the six, so it stands where Sizzle says
// it does: "The Tavern let me build onto their east wall". Inside: same scene, far south, quick fade.
// "Sounds TASTY! Put me to work." runs the user's original diner game in the panel (minigames/meru/diner.html).
import { branch } from '../engine/story.js';

export const DINER = { x: 520, z: 230, w: 16, d: 13, h: 4.6, key: 'burgers', label: 'Burgers' };
DINER.exit = { x: DINER.x, z: DINER.z + DINER.d / 2 - 1.1 };
// outside, in the square's art px: flush on the tavern's east wall (tavern x1 2520), door facing the east road
export const OUTSIDE = { x0: 2524, x1: 2830, y0: 240, y1: 620, door: 2650 };
const X = v => DINER.x + v, Z = v => DINER.z + v;
export const PEOPLE = [
  { key: 'burgerCook', name: 'Sizzle', role: 'Burgers', outfit: 'vest', torso: ['#33333d', '#1a1a22', '#0a0a0e'], crest: '8', x: X(3.4), z: Z(-4.3), face: 0, mood: 'warm' },
  { key: 'michaelJay', name: 'Michael Jay', role: 'Diner', outfit: 'vest', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], crest: '8', x: X(5.7), z: Z(2.4), face: -Math.PI / 2, mood: 'neutral' },
];
// Doc Braun, at the end of the tavern bar (2D tavern, 2180 x 1640). His top option only once you have met Michael Jay.
export const BRAUN = { key: 'docBraun', name: 'Doc Braun', role: 'Tavern', outfit: 'coat', torso: ['#f6f8fb', '#e2e8f0', '#94a3b8'], crest: '8', mood: 'neutral' };
export const DYN = {
  docBraun: (flag) => branch([{ who: 'npc', text: 'What year is it?' }, { who: 'player', text: 'WHAT?! Why does everyone keep asking me that.' }, { who: 'npc', text: 'Because I appear to have mislaid one. Possibly several. Have you seen a young fox in a red bodywarmer?' }], [
    ...(flag('mjGreeted') ? [{ label: 'He is at the BURGERS diner, on the town square.', set: 'docTold', replies: ['THE DINER. Of course. Of COURSE he is at the diner \u2014 I have been standing in a TAVERN.', 'Do you have any idea how long I have been in this room? No. Neither do I. That is rather the difficulty.'] }] : []),
    { label: 'Who are you looking for?', replies: ['A young fox. Red bodywarmer. Talks fast, thinks faster, and has a habit of arriving before he has left.', 'If you see him, do not tell him anything about his own future. Nothing. Not the weather.'] },
    { label: 'Why does everyone keep asking what year it is?', replies: ['Everyone? EVERYONE? Who else has asked you that.', 'No. No, do not answer that. The less I know, the less there is to go wrong. Where was I.'] },
  ]),
  burgerCook: () => branch([{ who: 'npc', text: 'Any chance you are looking for a job? We got great burgers here, super fun to make.' }], [
    { label: 'Sounds TASTY! Put me to work.', replies: ['Apron on. Ticket rail is above the grill \u2014 read it before you touch anything.'], do: 'diner' },
    { label: 'Maybe later.', replies: ['Grill stays hot. Come back when you are hungry, or when you are broke.'] },
    { label: 'How do I make BURGERS?', replies: ['Seven things, in order, and the ticket tells you all seven. Sear the patty and FLIP it so both sides match \u2014 that is the whole of the grill.', 'Cheese goes on before it comes off the heat, or it just sits there cold. Then sauce, then dress the bun with only what the ticket asks for. Only what it asks for.', 'Chop the side, fry it GOLDEN, and slide the cup under the right tap. Four orders and then you are done.'] },
    { label: 'How did you get into the burger business?', replies: ['Cooked for the barracks. Two hundred foxes, twice a day, and not one of them ever said a word about it.', 'So I put a griddle on a cart at the ARENA gate. Sold out before the second bout. Sold out the next day before the first.', 'The Tavern let me build onto their east wall for a cut of it. Best deal either of us ever made \u2014 they get the trade, I get the wall.'] },
  ]),
  michaelJay: () => branch([{ who: 'npc', text: 'What year is it?' }], [
    { label: 'WHAT?! Why do you ask.', replies: ['NEVER MIND. By the way, if you meet a confused scientist on your travels, tell him Michael Jay is at the Diner.'], set: 'mjGreeted' },
  ]),
};

export function buildDiner(K) {
  const { THREE, scene, M, BOX, toon, BK, grad, glowing, glowSprite, DARK, roomLights, colliders, lampM, camBlockers, sign, AX, AZ, S } = K;
  const RED = toon('#c42d3c'), CHROME = toon('#cbd5e1'), CREAM = toon('#f2ead8'), ORANGE = '#f97316';
  const checker = (n) => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#1b1b22'; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(n[0], n[1]); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t; };
  const boardTex = (text, w, h, col) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = '#16161c'; g.fillRect(0, 0, w, h); g.fillStyle = col; g.font = '900 ' + Math.round(h * 0.56) + 'px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText(text, h * 0.25, h * 0.54); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };

  // ---------- outside: the diner on the tavern's east wall ----------
  const B = OUTSIDE, w = (B.x1 - B.x0) * S, d = (B.y1 - B.y0) * S, h = 4.2, f = d / 2, cx = (B.x0 + B.x1) / 2, dx = (B.door - cx) * S;
  const og = new THREE.Group(); og.position.set(AX(cx), 0, AZ((B.y0 + B.y1) / 2)); scene.add(og); camBlockers.push(og);
  colliders.push({ box: [AX(B.x0), AX(B.x1), AZ(B.y0), AZ(B.y1)] });
  M(BOX(w, h, d), CREAM, 0, h / 2, 0, og, 0.06);
  M(BOX(w + 0.06, 1.0, d + 0.06), RED, 0, 0.5, 0, og, 0.02); M(BOX(w + 0.1, 0.1, d + 0.1), CHROME, 0, 1.05, 0, og, 0);
  M(BOX(w + 0.3, 0.35, d + 0.3), toon('#1b1b22'), 0, h + 0.17, 0, og, 0.04);
  sign(og, 'BURGERS', null, 5.0, 3.45, f + 0.12, ORANGE);
  for (let i = 0; i < 9; i++) { const s = M(BOX(w / 9, 0.06, 1.2), i % 2 ? CREAM : RED, -w / 2 + (i + 0.5) * w / 9, 2.55, f + 0.55, og, 0.01); s.rotation.x = 0.32; }
  for (const sx of [-1, 1]) { const x = sx > 0 ? dx + 2.4 : dx - 2.0; if (Math.abs(x) < w / 2 - 0.8) { M(BOX(1.8, 1.2, 0.1), glowing('#ffd9a0', null, 1.0), x, 1.75, f + 0.04, og, 0.02); M(BOX(1.9, 0.08, 0.16), CHROME, x, 1.12, f + 0.08, og, 0); } }
  M(BOX(1.4, 2.3, 0.2), glowing('#ffcf7a', null, 1.05), dx, 1.15, f + 0.04, og, 0.03); M(BOX(1.6, 0.12, 0.26), CHROME, dx, 2.36, f + 0.08, og, 0);
  M(BOX(2.2, 0.04, 1.2), RED, dx, 0.03, f + 0.8, og, 0);
  const DOOR = { label: 'Burgers', x: AX(B.door), z: AZ(B.y1) + 1.4 };
  const OUT = { x: AX(B.door), z: AZ(B.y1) + 2.2, face: 0 };

  // ---------- inside ----------
  const R = DINER, T = new THREE.Group(); T.position.set(R.x, 0, R.z); scene.add(T); const W2 = R.w / 2, D2 = R.d / 2;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(R.w, R.d), new THREE.MeshToonMaterial({ map: checker([R.w / 1.6, R.d / 1.6]), gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; T.add(fl);
  const wm = BK.texMat('tile', '#f2ead8', R.w / 2.4, R.h / 2.4);
  for (const [x, z, ww, ry] of [[0, -D2, R.w, 0], [-W2, 0, R.d, Math.PI / 2], [W2, 0, R.d, -Math.PI / 2]]) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; T.add(g); const m = new THREE.Mesh(BOX(ww, R.h, 0.3), wm); m.position.y = R.h / 2; m.receiveShadow = true; g.add(m); M(BOX(ww, 1.0, 0.36), RED, 0, 0.5, 0.03, g, 0); M(BOX(ww, 0.08, 0.4), CHROME, 0, 1.04, 0.04, g, 0); M(BOX(ww, 0.3, 0.42), RED, 0, R.h - 0.15, 0.05, g, 0); }
  for (const s of [-1, 1]) { const ww = W2 - 1.5, m = new THREE.Mesh(BOX(ww, R.h, 0.3), wm); m.position.set(s * (1.5 + ww / 2), R.h / 2, D2); T.add(m); M(BOX(ww, 1.0, 0.36), RED, s * (1.5 + ww / 2), 0.5, D2 - 0.03, T, 0); } M(BOX(3.0, R.h - 2.9, 0.3), wm, 0, 2.9 + (R.h - 2.9) / 2, D2, T, 0);
  const box = (x0, x1, z0, z1, hh, mat, ol = 0.025) => { M(BOX(x1 - x0, hh, z1 - z0), mat, (x0 + x1) / 2, hh / 2, (z0 + z1) / 2, T, ol); colliders.push({ box: [R.x + x0, R.x + x1, R.z + z0, R.z + z1] }); };
  // the counter and its return shut the kitchen off from the aisle; you come round the west end
  box(-5.6, 4.6, -3.2, -2.4, 1.05, RED); M(BOX(10.3, 0.08, 0.95), CHROME, -0.5, 1.09, -2.8, T, 0.01);
  box(4.6, 5.4, -3.2, -1.0, 1.05, RED); M(BOX(0.95, 0.08, 2.3), CHROME, 5.0, 1.09, -2.1, T, 0.01);
  // kitchen line on the back wall: flat-top grill, fryer, prep, soda taps
  box(0.8, 4.4, -6.35, -5.3, 0.95, toon('#3a3a44'));
  const top = M(BOX(3.5, 0.06, 0.95), toon('#2a2a30', { emissive: new THREE.Color('#ff5a1a'), emissiveIntensity: 0.35 }), 2.6, 0.98, -5.82, T, 0); top.castShadow = false;
  for (let i = 0; i < 4; i++) M(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 14), toon('#5a3420'), 1.3 + i * 0.85, 1.04, -5.8, T, 0.006, 0.22);
  glowSprite(2.6, 1.3, -5.8, 0xff7a30, 3.0, T);
  M(BOX(3.6, 0.06, 0.06), CHROME, 2.6, 2.0, -6.2, T, 0); for (let i = 0; i < 4; i++) M(BOX(0.36, 0.5, 0.02), toon('#fbfaf5'), 1.2 + i * 0.95, 1.72, -6.18, T, 0.005);
  box(-1.4, 0.4, -6.35, -5.3, 0.95, toon('#4a4a55')); M(BOX(1.4, 0.05, 0.7), toon('#e8b84a', { emissive: new THREE.Color('#a8781a'), emissiveIntensity: 0.4 }), -0.5, 0.97, -5.82, T, 0);
  box(-4.4, -1.8, -6.35, -5.3, 0.95, CHROME); for (let i = 0; i < 5; i++) M(new THREE.SphereGeometry(0.15, 10, 6), toon('#e2a85a'), -4.0 + i * 0.5, 1.02, -5.8, T, 0.005, 0.15).scale.y = 0.55;
  box(-7.6, -5.4, -6.35, -5.3, 1.0, toon('#3a3a44')); M(BOX(2.0, 0.9, 0.5), CHROME, -6.5, 1.45, -5.9, T, 0.02);
  for (let i = 0; i < 3; i++) M(BOX(0.3, 0.4, 0.06), toon(['#c42d3c', '#f97316', '#38bdf8'][i], { emissive: new THREE.Color(['#c42d3c', '#f97316', '#38bdf8'][i]), emissiveIntensity: 0.4 }), -7.1 + i * 0.6, 1.5, -5.62, T, 0);
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.2), new THREE.MeshBasicMaterial({ map: boardTex('BURGERS', 1024, 228, ORANGE) })); m.position.set(0, 3.3, -D2 + 0.17); T.add(m); }
  // counter stools
  for (let i = 0; i < 6; i++) { const x = -4.8 + i * 1.6; M(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6), CHROME, x, 0.35, -1.8, T, 0); M(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 14), RED, x, 0.74, -1.8, T, 0.01, 0.3); colliders.push({ c: [R.x + x, R.z - 1.8, 0.32] }); }
  // two booths on the west wall
  for (const z of [0.4, 3.4]) { box(-7.85, -6.3, z - 0.55, z + 0.55, 0.78, CREAM); M(BOX(1.6, 0.06, 1.2), CHROME, -7.07, 0.8, z, T, 0); for (const s of [-1, 1]) { box(-7.85, -6.4, z + s * 1.1 - 0.3, z + s * 1.1 + 0.3, 0.5, RED); M(BOX(1.45, 0.75, 0.16), RED, -7.12, 0.85, z + s * 1.36, T, 0.02); } }
  // the one table: Michael Jay on the far stool
  { const x = 4.4, z = 2.4; M(new THREE.CylinderGeometry(0.6, 0.6, 0.07, 18), CREAM, x, 0.8, z, T, 0.01, 0.6); M(new THREE.CylinderGeometry(0.06, 0.12, 0.8, 8), CHROME, x, 0.4, z, T, 0); colliders.push({ c: [R.x + x, R.z + z, 0.65] });
    M(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 12), RED, x - 1.1, 0.6, z, T, 0.01, 0.28); M(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), CHROME, x - 1.1, 0.3, z, T, 0);
    M(new THREE.CylinderGeometry(0.1, 0.08, 0.22, 10), toon('#c42d3c'), x + 0.2, 0.94, z - 0.2, T, 0.005); }
  for (const [x, z] of [[-4, -0.5], [3.5, -0.5], [-2, 3.6], [3.5, 3.6]]) { const L = new THREE.PointLight(0xffe2b8, 0, 13, 1.5); L.position.set(R.x + x, R.h - 0.9, R.z + z); scene.add(L); roomLights.push({ L, k: 9 }); M(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4), DARK, x, R.h - 0.3, z, T, 0); M(new THREE.ConeGeometry(0.35, 0.3, 12, 1, true), RED, x, R.h - 0.7, z, T, 0.01, 0.35); M(new THREE.SphereGeometry(0.12, 8, 6), lampM, x, R.h - 0.82, z, T, 0); }
  return { group: T, DOOR, OUT };
}
