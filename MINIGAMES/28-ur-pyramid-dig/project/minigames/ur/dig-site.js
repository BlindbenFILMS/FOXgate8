// 8 GATES — THE PYRAMID DIG [urPyramidDig]. Ur. Ben works the College of Ur's excavation hall inside the stepped pyramid for Archivist Enhedu.
// A JOB location (Boatworks is the reference): one find at a time, no clock, scored on care. 3 finds = a day.
// Flow: Enhedu points at a grid square (A1..C2) and hands Ben a DIG CARD → Ben works the card IN ORDER → HAND IN → Enhedu reacts (THRILLED / HAPPY / OKAY / GRUMPY)
//       and pays + a College find bonus → Carter Ur-Nanshe wheels the crate out to the Pyramid Path → next square.
// Tasks, one touch gesture each:
//   DIG   swipe to scrape the soil off layer by layer. Over the find the cells glow amber: go SLOW there or you chip it (speed meter).
//   BRUSH rub back and forth over the dirt clumps on the find.
//   LIFT  press the find and drag UP, slow and steady. Too fast = it cracks and slips back.
//   SIEVE shake the sieve: swipe left-right fast. When the soil is through, tap each bead / shard to pick it out.
//   MEND  drag each shard onto the gap in the pot that is the same width.
//   READ  watch the signs light up on the tablet, then tap the same signs in the same order (Enhedu copies them for the College).
//   ROLL  drag the cylinder seal across the clay in ONE direction. Going back smudges the picture.
//   CRATE pick the right crate (TABLETS / POTTERY / GOLD / STATUES / SEALS).
// Finds: CLAY TABLET · PAINTED POT · GOLD NECKLACE · SPHINX IDOL · CYLINDER SEAL.
// WALK MODE: outside a shift Ben walks the hall with the standard Game HUD (joystick, 1 TROWEL, 2 LAMP, 3 JUMP, TALK). Tap the floor to walk there,
//   tap a person or thing to walk over and talk to it, drag to turn the camera. Talk to Enhedu → the welcome card.
// Save keys ur.dig.*, flag urDigUniform. Built on engine/restaurant-kit.js (stage, camera fit, hint rings, uniform).
// MERGE: buildDigSite(ctx) builds the walkable hall at an origin (colliders, interact spots, NPC spots, door) for any Ur building;
//        the world calls the job page from Enhedu's 'Put me to work' line, exactly like Sizzle's diner. createDigSite({ container, onState }) runs stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { digAudio } from './dig-audio.js';

export const URDIG = { name: 'THE PYRAMID DIG', room: 'urPyramidDig', perDay: 3, world: 'ur' };
export const CRATES = { tablets: { name: 'TABLETS', col: '#2f9a8f' }, pottery: { name: 'POTTERY', col: '#d8432f' }, gold: { name: 'GOLD', col: '#e6b45a' }, statues: { name: 'STATUES', col: '#8a7ab8' }, seals: { name: 'SEALS', col: '#3a5fa8' } };
const CK = Object.keys(CRATES);
export const FINDS = {
  tablet: { name: 'CLAY TABLET', crate: 'tablets', price: 16, tasks: ['dig', 'brush', 'lift', 'read', 'crate'] },
  pot: { name: 'PAINTED POT', crate: 'pottery', price: 15, tasks: ['dig', 'lift', 'sieve', 'mend', 'crate'] },
  jewel: { name: 'GOLD NECKLACE', crate: 'gold', price: 20, tasks: ['dig', 'lift', 'sieve', 'brush', 'crate'] },
  statue: { name: 'SPHINX IDOL', crate: 'statues', price: 17, tasks: ['dig', 'brush', 'lift', 'crate'] },
  seal: { name: 'CYLINDER SEAL', crate: 'seals', price: 18, tasks: ['dig', 'lift', 'brush', 'roll', 'crate'] } };
export const TASKS = { dig: { label: 'DIG', name: 'Scrape down to the find' }, brush: { label: 'BRUSH', name: 'Brush the dirt off' }, lift: { label: 'LIFT', name: 'Lift it out, slow and steady' }, sieve: { label: 'SIEVE', name: 'Shake the sieve, pick out the bits' }, mend: { label: 'MEND', name: 'Fit the shards back in' }, read: { label: 'READ', name: 'Copy the signs for the College' }, roll: { label: 'ROLL', name: 'Roll the seal across the clay' }, crate: { label: 'CRATE', name: 'Pack it in the right crate' } };
// cuneiform-style signs: wedges [x, y, angle°, length] on a 24 × 24 grid (drawn on the tablet AND as the READ buttons)
export const GLYPHS = [
  { name: 'SKY', w: [[12, 2, 90, 20], [2, 12, 0, 20], [5, 5, 45, 19], [19, 5, 135, 19]] },
  { name: 'WATER', w: [[3, 5, 0, 18], [3, 12, 0, 12], [3, 19, 0, 18]] },
  { name: 'GRAIN', w: [[12, 2, 90, 20], [4, 8, 0, 7], [4, 15, 0, 7], [14, 8, 0, 7]] },
  { name: 'FOX', w: [[3, 3, 45, 13], [21, 3, 135, 13], [12, 11, 90, 11]] },
  { name: 'KING', w: [[3, 3, 0, 18], [3, 10, 0, 18], [9, 3, 90, 19], [17, 10, 90, 12]] },
  { name: 'HOUSE', w: [[3, 3, 0, 18], [3, 3, 90, 18], [3, 21, 0, 18], [21, 3, 90, 18]] }];
const wedge = (x, y, a, l) => { const r = a * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r), px = -dy, py = dx; return [[x - px * 3, y - py * 3], [x + px * 3, y + py * 3], [x + dx * l, y + dy * l]]; };
export const glyphPath = k => GLYPHS[k].w.map(w => { const p = wedge(...w); return 'M' + p.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L') + 'Z'; }).join('');
function drawGlyph(c, k, x, y, s, col) { c.fillStyle = col; for (const w of GLYPHS[k].w) { const p = wedge(...w); c.beginPath(); c.moveTo(x + p[0][0] * s, y + p[0][1] * s); c.lineTo(x + p[1][0] * s, y + p[1][1] * s); c.lineTo(x + p[2][0] * s, y + p[2][1] * s); c.closePath(); c.fill(); } }
export const UPGRADES = [
  { id: 'brush', name: 'FINE BRUSH', cost: 35, line: 'Dirt brushes off twice as fast.' },
  { id: 'trowel', name: 'STEEL TROWEL', cost: 40, line: 'Each scrape clears a wider patch.' },
  { id: 'straps', name: 'LIFT STRAPS', cost: 30, line: 'Lift faster without cracking.' },
  { id: 'sieve', name: 'BRASS SIEVE', cost: 30, line: 'Each shake sifts twice the soil.' },
  { id: 'lamp', name: 'COLLEGE LAMP', cost: 60, line: 'The College pays a 25% bigger find bonus.' }];
const SAVE = { day: 'ur.dig.day', best: 'ur.dig.best', upg: 'ur.dig.upg.', stars: 'ur.dig.stars', finds: 'ur.dig.finds' };
const HELLO = ['Something is down there. Go gently.', 'The builders left this one for us. Take your time.', 'Soft soil here. Mind your trowel near the find.', 'I can feel it. Something good.', 'Slow hands, Ben. Old things break.'];
export const TALK = {
  enhedu: { name: 'Archivist Enhedu', role: 'College of Ur', text: 'Welcome to the dig, Ben. The College pays well for careful hands.', choices: ['Put me to work.', 'What are we digging for?', 'Goodbye.'], why: 'Tablets, pots, seals, gold. Everything the builders left before the pyramid was sealed. Every piece tells the College a little more.' },
  carter: { name: 'Carter Ur-Nanshe', role: 'Carter', text: 'I haul the finds up the Pyramid Path to the College. Pack the crates right, friend. Last week someone put a pot in with the gold!' },
  monolith: { name: 'The Monolith', role: 'Carved stone', text: 'The signs are worn smooth. Enhedu says it lists everyone who built the pyramid. Near the bottom: a fox holding a trowel.' },
  sphinx: { name: 'Sphinx Head', role: 'Stone', text: 'A stone head as big as a cart. The rest of the sphinx is still somewhere under the sand.' },
  ring: { name: 'The Old Ring', role: 'Back wall', text: 'A stone ring set into the wall, turning by itself, slow as a sundial. Nobody at the College knows what drives it.' },
  heap: { name: 'Spoil Heap', role: 'Sifted soil', text: 'Soil from the sieve. Press 1 TROWEL here: the odd coin still turns up.' },
  table: { name: 'Finds Table', role: 'Cleaning bench', text: 'Brushes, glue, a lamp and a magnifier. Every find comes up here to be cleaned and recorded.' },
  crates: { name: 'The Crates', role: 'For the College', text: 'Five crates: TABLETS, POTTERY, GOLD, STATUES, SEALS. Ur-Nanshe takes them up to the College.' } };

// ---------------- the hall (walkable interior) ----------------
const PX = 0, PZ = -1.4, PW = 6.2, PD = 3.6, PDEP = 0.75, SQW = PW / 3, SQD = PD / 2, LH = 0.15;
const SV = { x: -6.6, z: -1.2, y: 1.1 }, TB = { x: 6.2, z: -1.4 }, TOP = 0.92;
export function buildDigSite(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 }, glowTex } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const D = { root, origin, front: [], fires: [], squares: [], crates: {}, colliders: [], interact: [], PX, PZ, PW, PD, PDEP, SQW, SQD };
  const ink = toon('#201e1d'), wood = toon('#9a6a3e'), woodD = toon('#6b4426'), stone = toon('#d9c4a0'), stoneD = toon('#a8957a'), gold = toon('#e6b45a'), teal = toon('#2f9a8f'), brickD = toon('#8f4424'), soil = toon('#8a5a34');
  const tex = (w, h, f, rx = 1, ry = 1) => { const t = CTX(w, h, f); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rx, ry); return t; };
  const brick = c => { c.fillStyle = '#7a3a1e'; c.fillRect(0, 0, 256, 256); for (let r = 0; r < 16; r++) { const off = r % 2 ? 16 : 0; for (let k = -1; k < 9; k++) { c.fillStyle = ['#c4673a', '#b95e33', '#cf7444', '#a9542c'][(r * 7 + k * 3 + 8) & 3]; c.fillRect(k * 32 + off + 1, r * 16 + 1, 30, 14); } } c.fillStyle = 'rgba(60,24,10,0.22)'; for (let i = 0; i < 70; i++) c.fillRect((i * 73) % 256, (i * 41) % 256, 3, 2); };
  const wallMat = (rx, ry) => new T3.MeshToonMaterial({ map: tex(256, 256, brick, rx, ry), gradientMap: ctx.grad });
  const tiles = c => { c.fillStyle = '#b8955f'; c.fillRect(0, 0, 256, 256); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = ['#e2bf88', '#d4ab72', '#dcb680', '#cfa66c'][(x * 3 + y * 5) & 3]; c.fillRect(x * 64 + 2, y * 64 + 2, 60, 60); } c.fillStyle = 'rgba(90,50,20,0.16)'; for (let i = 0; i < 90; i++) c.fillRect((i * 53) % 256, (i * 97) % 256, 2, 2); };
  const add = (geo, mat, x, y, z, ol = 0.02, r) => M(geo, mat, x, y, z, root, ol, r);
  const box = (w, h, d, mat, x, y, z, ol = 0.015) => add(new T3.BoxGeometry(w, h, d), mat, x, y, z, ol);
  const rod = (a, b, r, mat, ol = 0.006) => { const v = new T3.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = v.length(), m = add(new T3.CylinderGeometry(r, r, L, 8), mat, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, ol); m.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), v.normalize()); return m; };
  const plane = (w, h, map, x, y, z, ry = 0, basic = true) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, h), basic ? new T3.MeshBasicMaterial({ map, transparent: true }) : new T3.MeshToonMaterial({ map, gradientMap: ctx.grad, transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
  const label = (txt, bg, fg, w = 512, h = 128, font = 72) => CTX(w, h, c => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = fg; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = fg; c.font = '900 ' + font + 'px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 4); });
  const coll = (x0, x1, z0, z1) => D.colliders.push([x0, x1, z0, z1]);
  // floor round the pit hole (top at y 0)
  const slab = (x0, x1, z0, z1) => { const m = add(new T3.BoxGeometry(x1 - x0, 0.2, z1 - z0), new T3.MeshToonMaterial({ map: tex(256, 256, tiles, (x1 - x0) / 2.4, (z1 - z0) / 2.4), gradientMap: ctx.grad }), (x0 + x1) / 2, -0.1, (z0 + z1) / 2, 0); m.castShadow = false; return m; };
  slab(-10, PX - PW / 2, -8, 8.4); slab(PX + PW / 2, 10, -8, 8.4); slab(PX - PW / 2, PX + PW / 2, PZ + PD / 2, 8.4); slab(PX - PW / 2, PX + PW / 2, -8, PZ - PD / 2);
  // walls: back + sides (planes face IN, so a camera outside sees through), dado, teal frieze, stepped corbels
  { const back = plane(20, 5.2, null, 0, 2.6, -8, 0, false); back.material = wallMat(10, 2.6); const l = plane(16.4, 5.2, null, -10, 2.6, 0.2, Math.PI / 2, false); l.material = wallMat(8.2, 2.6); const r = plane(16.4, 5.2, null, 10, 2.6, 0.2, -Math.PI / 2, false); r.material = wallMat(8.2, 2.6); D.walls = [back, l, r]; }
  const friezeT = tex(256, 32, c => { c.fillStyle = '#1f6a62'; c.fillRect(0, 0, 256, 32); c.fillStyle = '#e6b45a'; c.fillRect(0, 0, 256, 4); c.fillRect(0, 28, 256, 4); c.font = '900 22px Archivo, Arial'; c.textBaseline = 'middle'; for (let i = 0; i < 8; i++) c.fillText(i % 2 ? '◆' : 'U', i * 32 + 9, 17); }, 1, 1);
  for (const [w, x, z, ry] of [[20, 0, -7.97, 0], [16.4, -9.97, 0.2, Math.PI / 2], [16.4, 9.97, 0.2, -Math.PI / 2]]) { const t = friezeT.clone(); t.needsUpdate = true; t.repeat.set(w / 2, 1); const f = plane(w, 0.32, t, x, 2.5, z, ry); f.material.transparent = false;
    const dado = new T3.Mesh(new T3.PlaneGeometry(w, 0.8), toon('#7a3a1e')); dado.position.set(x + (ry ? Math.sign(-x) * 0.01 : 0), 0.4, z + (ry ? 0 : 0.01)); dado.rotation.y = ry; root.add(dado); }
  for (let k = 0; k < 3; k++) { const y = 3.5 + k * 0.6, d = 0.35 + k * 0.35; box(20, 0.6, d, brickD, 0, y, -8 + d / 2, 0.01); box(d, 0.6, 16.4, brickD, -10 + d / 2, y, 0.2, 0.01); box(d, 0.6, 16.4, brickD, 10 - d / 2, y, 0.2, 0.01); }
  // front: low parapet with a doorway, tall door pillars + lintel sign (front list: hidden when the camera is outside)
  box(8.7, 1.0, 0.4, wallMat(4.4, 0.5), -5.65, 0.5, 8.2, 0.02); box(8.7, 1.0, 0.4, wallMat(4.4, 0.5), 5.65, 0.5, 8.2, 0.02); box(8.7, 0.08, 0.5, stone, -5.65, 1.04, 8.2, 0.01); box(8.7, 0.08, 0.5, stone, 5.65, 1.04, 8.2, 0.01);
  coll(-10.5, -1.25, 7.85, 8.6); coll(1.25, 10.5, 7.85, 8.6);
  { const fc = root.children.length; for (const x of [-1.55, 1.55]) { box(0.6, 3.4, 0.6, wallMat(0.3, 1.7), x, 1.7, 8.2, 0.02); box(0.75, 0.2, 0.75, gold, x, 3.45, 8.2, 0.01); } box(3.8, 0.6, 0.7, brickD, 0, 3.8, 8.2, 0.02); const s = plane(3.4, 0.5, label('THE PYRAMID DIG', '#1f6a62', '#e6b45a', 1024, 150, 92), 0, 3.8, 8.56); s.material.transparent = false; D.front.push(...root.children.slice(fc)); }
  coll(-1.9, -1.2, 7.85, 8.6); coll(1.2, 1.9, 7.85, 8.6);
  D.door = { x: 0, z: 8.2, out: 10.5 };
  // ---- THE PIT: sunken trench, kerb, grid strings + stakes, square tags, mounds ----
  const strata = tex(64, 64, c => { const b = ['#6e4428', '#93603a', '#b48250', '#d2a86c']; for (let i = 0; i < 4; i++) { c.fillStyle = b[i]; c.fillRect(0, i * 16, 64, 16); } c.fillStyle = 'rgba(40,20,10,0.25)'; for (let i = 0; i < 30; i++) c.fillRect((i * 29) % 64, (i * 17) % 64, 2, 2); });
  const strM = new T3.MeshToonMaterial({ map: strata, gradientMap: ctx.grad });
  box(PW, PDEP, 0.1, strM, PX, -PDEP / 2, PZ - PD / 2 - 0.05, 0); box(PW, PDEP, 0.1, strM, PX, -PDEP / 2, PZ + PD / 2 + 0.05, 0); box(0.1, PDEP, PD, strM, PX - PW / 2 - 0.05, -PDEP / 2, PZ, 0); box(0.1, PDEP, PD, strM, PX + PW / 2 + 0.05, -PDEP / 2, PZ, 0);
  box(PW, 0.1, PD, toon('#b48250'), PX, -PDEP - 0.05, PZ, 0);
  for (const [w, d, x, z] of [[PW + 0.44, 0.22, PX, PZ - PD / 2 - 0.11], [PW + 0.44, 0.22, PX, PZ + PD / 2 + 0.11], [0.22, PD, PX - PW / 2 - 0.11, PZ], [0.22, PD, PX + PW / 2 + 0.11, PZ]]) box(w, 0.14, d, stone, x, 0.07, z, 0.012);
  coll(PX - PW / 2 - 0.3, PX + PW / 2 + 0.3, PZ - PD / 2 - 0.3, PZ + PD / 2 + 0.3);
  const twine = toon('#f4efe4');
  for (let c = 0; c <= 3; c++) for (let r = 0; r <= 2; r++) { const x = PX - PW / 2 + c * SQW, z = PZ - PD / 2 + r * SQD; if (c === 0 || c === 3 || r !== 1 || true) box(0.06, 0.34, 0.06, woodD, x, 0.17, z, 0.006); }
  { const fc = root.children.length; box(PW, 0.014, 0.014, twine, PX, 0.24, PZ, 0); for (const x of [PX - SQW / 2, PX + SQW / 2]) box(0.014, 0.014, PD, twine, x, 0.24, PZ, 0); D.twine = root.children.slice(fc); }
  box(PW, 0.014, 0.014, twine, PX, 0.24, PZ - PD / 2, 0); box(PW, 0.014, 0.014, twine, PX, 0.24, PZ + PD / 2, 0);
  ['A', 'B', 'C'].forEach((L, c) => { const t = plane(0.34, 0.22, label(L, '#fbf8ec', '#201e1d', 128, 84, 64), PX + (c - 1) * SQW, 0.24, PZ + PD / 2 + 0.23); t.rotation.x = -0.6; });
  [['1', PZ + SQD / 2], ['2', PZ - SQD / 2]].forEach(([L, z]) => { const t = plane(0.3, 0.22, label(L, '#fbf8ec', '#201e1d', 112, 84, 64), PX - PW / 2 - 0.24, 0.24, z, Math.PI / 2); t.rotation.order = 'YXZ'; t.rotation.x = -0.6; });
  const moundM = toon('#93603a'), rub = toon('#b9a586');
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { const id = 'ABC'[c] + (r ? '1' : '2'), x = PX + (c - 1) * SQW, z = PZ + (r ? SQD / 2 : -SQD / 2), hgt = 0.42 + ((c + r) % 2) * 0.12;
    const m = box(SQW - 0.3, hgt, SQD - 0.3, moundM, x, -PDEP + hgt / 2, z, 0.012); const grp = [m]; for (let i = 0; i < 3; i++) grp.push(add(new T3.DodecahedronGeometry(rr(0.06, 0.11)), rub, x + rr(-0.6, 0.6), -PDEP + hgt + 0.03, z + rr(-0.5, 0.5), 0.008)); D.squares.push({ id, x, z, mound: grp }); }
  { const lx = PX + PW / 2 - 0.35, lz = PZ + PD / 2 - 0.25; for (const dx of [-0.22, 0.22]) rod([lx + dx, -PDEP, lz - 0.35], [lx + dx, 0.7, lz + 0.15], 0.03, wood); for (let i = 1; i < 6; i++) { const k = i / 6; box(0.48, 0.03, 0.04, wood, lx, -PDEP + k * 1.45, lz - 0.35 + k * 0.5, 0.004); } }
  // ---- SIEVE: tripod, chains, swinging sieve over the spoil heap ----
  add(new T3.ConeGeometry(1.0, 0.55, 18), toon('#b48250'), SV.x, 0.275, SV.z, 0.02);
  D.tripod = []; for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + 0.3; D.tripod.push(rod([SV.x + Math.cos(a) * 1.05, 0, SV.z + Math.sin(a) * 1.05], [SV.x, 2.55, SV.z], 0.045, woodD)); }
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + 1.2; D.tripod.push(rod([SV.x, 2.5, SV.z], [SV.x + Math.cos(a) * 0.5, SV.y + 0.05, SV.z + Math.sin(a) * 0.5], 0.008, ink, 0)); }
  { const g = new T3.Group(); g.position.set(SV.x, SV.y, SV.z); root.add(g); M(new T3.TorusGeometry(0.55, 0.045, 8, 28), wood, 0, 0, 0, g, 0.01).rotation.x = Math.PI / 2;
    const netT = tex(128, 128, c => { c.clearRect(0, 0, 128, 128); c.strokeStyle = '#3a3836'; c.lineWidth = 2; for (let i = 0; i < 128; i += 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 128); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(128, i); c.stroke(); } });
    const net = new T3.Mesh(new T3.CircleGeometry(0.53, 28), new T3.MeshBasicMaterial({ map: netT, transparent: true, side: T3.DoubleSide })); net.rotation.x = -Math.PI / 2; net.position.y = -0.02; g.add(net);
    const sl = M(new T3.CylinderGeometry(0.5, 0.5, 0.16, 24), toon('#8a5a34'), 0, 0.06, 0, g, 0.01, 0.5); sl.visible = false; D.sieve = { g, x: SV.x, z: SV.z, y: SV.y, soil: sl, net }; }
  coll(SV.x - 1.2, SV.x + 1.2, SV.z - 1.2, SV.z + 1.2);
  // ---- FINDS TABLE: tray, lamp, magnifier, notebook, clay slab ----
  box(3.2, 0.08, 1.3, wood, TB.x, 0.88, TB.z, 0.015); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.1, 0.84, 0.1, woodD, TB.x + sx * 1.48, 0.42, TB.z + sz * 0.55, 0.008);
  box(0.8, 0.03, 0.62, teal, TB.x - 0.75, 0.935, TB.z - 0.05, 0.006);
  box(0.62, 0.04, 0.28, toon('#c98a5a'), TB.x + 0.75, 0.94, TB.z + 0.05, 0.008);
  { const lx = TB.x + 1.35, lz = TB.z - 0.45; add(new T3.CylinderGeometry(0.1, 0.12, 0.05, 14), ink, lx, 0.945, lz, 0.006); rod([lx, 0.96, lz], [lx - 0.05, 1.45, lz + 0.1], 0.015, ink); const sh = add(new T3.ConeGeometry(0.14, 0.16, 14, 1, true), toon('#1f6a62', { side: T3.DoubleSide }), lx - 0.12, 1.42, lz + 0.18, 0.006); sh.rotation.x = 0.6; add(new T3.SphereGeometry(0.05, 8, 6), new T3.MeshBasicMaterial({ color: 0xfff0c0 }), lx - 0.12, 1.37, lz + 0.2, 0); D.tableLamp = [lx - 0.12, 1.3, lz + 0.25]; }
  { const n = box(0.42, 0.02, 0.3, toon('#fbf8ec'), TB.x + 0.2, 0.935, TB.z - 0.45, 0.006); n.rotation.y = 0.15; box(0.012, 0.022, 0.3, ink, TB.x + 0.2, 0.94, TB.z - 0.45, 0); const mg = add(new T3.TorusGeometry(0.08, 0.012, 6, 18), gold, TB.x - 0.2, 1.05, TB.z - 0.48, 0.004); rod([TB.x - 0.2, 0.93, TB.z - 0.48], [TB.x - 0.2, 0.97, TB.z - 0.48], 0.012, ink); for (let i = 0; i < 3; i++) rod([TB.x - 1.4 + i * 0.06, 0.93, TB.z - 0.45], [TB.x - 1.4 + i * 0.05, 1.12, TB.z - 0.42], 0.012, i === 1 ? gold : wood); add(new T3.CylinderGeometry(0.06, 0.05, 0.1, 10), toon('#3a5fa8'), TB.x - 1.37, 0.98, TB.z - 0.44, 0.006); }
  coll(TB.x - 1.75, TB.x + 1.75, TB.z - 0.8, TB.z + 0.8);
  D.table = { x: TB.x, z: TB.z, top: TOP, spot: { x: TB.x - 0.75, z: TB.z - 0.05 }, slab: { x: TB.x + 0.75, z: TB.z + 0.05, w: 0.62 }, shardZ: TB.z + 0.42 };
  // ---- CRATES (five, labelled) + the carter's cart ----
  CK.forEach((k, i) => { const x = 3.0 + i * 1.2, z = 4.8, g = new T3.Group(); g.position.set(x, 0, z); root.add(g); const cw = toon('#b08250');
    M(new T3.BoxGeometry(0.9, 0.06, 0.7), cw, 0, 0.03, 0, g, 0.01); M(new T3.BoxGeometry(0.9, 0.6, 0.06), cw, 0, 0.3, -0.32, g, 0.01); M(new T3.BoxGeometry(0.9, 0.6, 0.06), cw, 0, 0.3, 0.32, g, 0.01); M(new T3.BoxGeometry(0.06, 0.6, 0.7), cw, -0.42, 0.3, 0, g, 0.01); M(new T3.BoxGeometry(0.06, 0.6, 0.7), cw, 0.42, 0.3, 0, g, 0.01);
    M(new T3.BoxGeometry(0.8, 0.06, 0.6), toon('#e8cf7a'), 0, 0.5, 0, g, 0); const lb = new T3.Mesh(new T3.PlaneGeometry(0.8, 0.22), new T3.MeshBasicMaterial({ map: label(CRATES[k].name, CRATES[k].col, '#fbf8ec', 512, 140, 74) })); lb.position.set(0, 0.36, 0.36); g.add(lb); D.crates[k] = { x, z, g }; });
  coll(2.45, 8.35, 4.35, 5.25);
  { const g = new T3.Group(); g.position.set(7.7, 0, 6.8); g.rotation.y = -Math.PI / 2; root.add(g); M(new T3.BoxGeometry(1.0, 0.36, 0.7), toon('#8a5a34'), 0, 0.55, 0, g, 0.015); for (const s of [-1, 1]) { const w = M(new T3.CylinderGeometry(0.3, 0.3, 0.06, 16), woodD, 0.1, 0.3, s * 0.4, g, 0.01, 0.3); w.rotation.x = Math.PI / 2; M(new T3.BoxGeometry(0.7, 0.05, 0.05), wood, -0.75, 0.75, s * 0.25, g, 0.006); } D.cart = g; }
  // ---- back wall: THE OLD RING (turns), MONOLITH, SPHINX HEAD, shelves ----
  { const g = new T3.Group(); g.position.set(0, 3.0, -7.8); root.add(g); M(new T3.TorusGeometry(1.45, 0.17, 10, 40), stoneD, 0, 0, 0, g, 0.02); const disc = new T3.Mesh(new T3.CircleGeometry(1.3, 36), toon('#3a2a22')); disc.position.z = -0.02; g.add(disc);
    const inner = new T3.Group(); g.add(inner); const glowM = new T3.MeshBasicMaterial({ color: 0x4fd1c5 }); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, s = new T3.Mesh(new T3.BoxGeometry(0.22, 0.08, 0.04), i % 3 ? glowM : new T3.MeshBasicMaterial({ color: 0xe6b45a })); s.position.set(Math.cos(a) * 1.02, Math.sin(a) * 1.02, 0.03); s.rotation.z = a + Math.PI / 2; inner.add(s); }
    const gem = new T3.Mesh(new T3.OctahedronGeometry(0.22), new T3.MeshBasicMaterial({ color: 0x7ee8dc })); gem.position.z = 0.1; g.add(gem); D.ring = { g, inner, gem }; }
  { const mt = CTX(128, 384, c => { c.fillStyle = '#2a2622'; c.fillRect(0, 0, 128, 384); for (let r = 0; r < 9; r++) for (let k = 0; k < 3; k++) drawGlyph(c, (r * 3 + k * 5) % 6, 12 + k * 38, 18 + r * 40, 1.2, 'rgba(200,190,170,0.55)'); });
    const m = box(0.9, 2.7, 0.4, [toon('#2a2622'), toon('#2a2622'), toon('#2a2622'), toon('#2a2622'), new T3.MeshToonMaterial({ map: mt, gradientMap: ctx.grad }), toon('#2a2622')], -3.8, 1.45, -6.9, 0.02); box(1.3, 0.12, 0.7, stoneD, -3.8, 0.06, -6.9, 0.01); coll(-4.45, -3.15, -7.4, -6.45); }
  { const g = new T3.Group(); g.position.set(-7.4, 0, -5.6); g.rotation.y = 0.55; root.add(g); const st = toon('#d9c4a0'), str = tex(64, 64, c => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#1f6a62' : '#e6b45a'; c.fillRect(0, i * 8, 64, 8); } });
    M(new T3.BoxGeometry(1.3, 0.5, 1.2), stoneD, 0, 0.25, 0, g, 0.02); M(new T3.BoxGeometry(1.0, 1.1, 0.95), st, 0, 1.05, 0.05, g, 0.02); for (const s of [-1, 1]) M(new T3.BoxGeometry(0.22, 1.25, 0.85), new T3.MeshToonMaterial({ map: str, gradientMap: ctx.grad }), s * 0.6, 0.95, 0.0, g, 0.015);
    M(new T3.BoxGeometry(1.15, 0.28, 1.0), new T3.MeshToonMaterial({ map: str, gradientMap: ctx.grad }), 0, 1.7, 0.02, g, 0.015); M(new T3.BoxGeometry(0.16, 0.3, 0.2), st, 0, 1.0, 0.58, g, 0.01); for (const s of [-1, 1]) M(new T3.BoxGeometry(0.2, 0.07, 0.04), ink, s * 0.24, 1.25, 0.53, g, 0); M(new T3.BoxGeometry(0.3, 0.05, 0.04), toon('#7a5a3a'), 0, 0.78, 0.53, g, 0);
    for (let i = 0; i < 6; i++) M(new T3.DodecahedronGeometry(rr(0.12, 0.25)), stoneD, rr(-1, 1), 0.1, rr(0.4, 1), g, 0.01); coll(-8.4, -6.4, -6.7, -4.6); }
  { const sx = 6.5, sz = -7.55; for (const x of [-1.45, 0, 1.45]) box(0.08, 2.2, 0.45, woodD, sx + x, 1.1, sz, 0.008); for (const y of [0.3, 1.0, 1.7]) box(3.0, 0.06, 0.48, wood, sx, y, sz, 0.008);
    for (let i = 0; i < 9; i++) { const y = [0.33, 1.03, 1.73][i % 3], x = sx - 1.2 + Math.floor(i / 3) * 0.95 + (i % 2) * 0.35; if (i % 2) box(0.22, 0.05, 0.16, toon('#b9784a'), x, y + 0.04, sz, 0.006); else add(new T3.LatheGeometry([[0, 0], [0.08, 0], [0.11, 0.1], [0.09, 0.2], [0.05, 0.24], [0.06, 0.27]].map(p => new T3.Vector2(...p)), 14), toon(['#c4673a', '#d9c4a0', '#2f9a8f'][i % 3]), x, y + 0.03, sz, 0.008); }
    coll(sx - 1.6, sx + 1.6, -8, -7.2); }
  // scaffold on the west wall, wheelbarrow + buckets near the sieve
  { const x0 = -9.3, z0 = 3.0; for (const dx of [0, 0.9]) for (const dz of [-1.0, 1.0]) rod([x0 + dx, 0, z0 + dz], [x0 + dx, 3.2, z0 + dz], 0.05, woodD); for (const y of [1.4, 2.8]) box(1.1, 0.06, 2.3, wood, x0 + 0.45, y, z0, 0.008); coll(-9.95, -8.25, 1.8, 4.2); }
  { const g = new T3.Group(); g.position.set(-4.6, 0, 1.9); g.rotation.y = 0.8; root.add(g); M(new T3.BoxGeometry(0.7, 0.3, 0.55), toon('#3a5fa8'), 0, 0.5, 0, g, 0.01); const w = M(new T3.CylinderGeometry(0.18, 0.18, 0.06, 14), ink, 0.45, 0.18, 0, g, 0.008, 0.18); w.rotation.x = Math.PI / 2; for (const s of [-1, 1]) M(new T3.BoxGeometry(0.8, 0.04, 0.04), wood, -0.5, 0.5, s * 0.22, g, 0.005); coll(-5.2, -4.0, 1.35, 2.45);
    for (const [x, z] of [[-5.3, 0.6], [-5.6, 0.95]]) { add(new T3.CylinderGeometry(0.16, 0.12, 0.3, 12, 1, true), toon('#a8957a', { side: T3.DoubleSide }), x, 0.15, z, 0.008, 0.16); } }
  // braziers (fire flickers in createDigSite), banners with the U crest
  const fireM = new T3.MeshBasicMaterial({ color: 0xffa23a }), fireM2 = new T3.MeshBasicMaterial({ color: 0xffe08a });
  for (const [x, z] of [[-8.6, 6.4], [8.6, 6.4], [-8.6, -6.9], [8.6, -6.9], [-2.2, -6.9], [2.2, -6.9]]) { for (let i = 0; i < 3; i++) { const a = i * 2.1; rod([x + Math.cos(a) * 0.3, 0, z + Math.sin(a) * 0.3], [x, 0.85, z], 0.025, ink); } add(new T3.CylinderGeometry(0.34, 0.2, 0.22, 16), toon('#3a3836'), x, 0.95, z, 0.012, 0.34);
    const f1 = add(new T3.ConeGeometry(0.2, 0.5, 8), fireM, x, 1.3, z, 0), f2 = add(new T3.ConeGeometry(0.11, 0.32, 8), fireM2, x, 1.22, z, 0); let sp = null; if (glowTex) { sp = new T3.Sprite(new T3.SpriteMaterial({ map: glowTex, color: 0xff9a3a, transparent: true, opacity: 0.7, depthWrite: false, blending: T3.AdditiveBlending })); sp.position.set(x, 1.3, z); sp.scale.setScalar(1.6); root.add(sp); } D.fires.push({ f1, f2, sp, ph: Math.random() * 6 }); coll(x - 0.45, x + 0.45, z - 0.45, z + 0.45); }
  const banT = CTX(128, 280, c => { c.fillStyle = '#8f2b1e'; c.fillRect(0, 0, 128, 260); c.fillStyle = '#e6b45a'; c.fillRect(0, 0, 128, 10); c.fillRect(8, 18, 112, 4); for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(i * 16, 260); c.lineTo(i * 16 + 8, 278); c.lineTo(i * 16 + 16, 260); c.fill(); } c.lineWidth = 16; c.strokeStyle = '#e6b45a'; c.lineCap = 'round'; c.beginPath(); c.moveTo(34, 70); c.lineTo(34, 150); c.arc(64, 150, 30, Math.PI, 0, true); c.lineTo(94, 70); c.stroke(); c.fillStyle = '#2f9a8f'; c.fillRect(30, 210, 68, 10); });
  for (const [x, z, ry] of [[-9.95, -4.5, Math.PI / 2], [-9.95, 5.4, Math.PI / 2], [9.95, -4.5, -Math.PI / 2], [9.95, 2.4, -Math.PI / 2], [-6.5, -7.95, 0], [3.8, -7.95, 0]]) { const b = plane(1.0, 2.2, banT, x, 3.4, z, ry); b.material.transparent = true; b.position.x += Math.sign(-x) * (ry ? 0.03 : 0); b.position.z += ry ? 0 : 0.03; }
  // sun shaft from the vent above the pit
  { const st = CTX(8, 128, c => { const gr = c.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,230,170,0)'); gr.addColorStop(0.4, 'rgba(255,230,170,0.7)'); gr.addColorStop(1, 'rgba(255,220,150,0.05)'); c.fillStyle = gr; c.fillRect(0, 0, 8, 128); });
    const sh = new T3.Mesh(new T3.CylinderGeometry(0.9, 1.6, 9, 4, 1, true), new T3.MeshBasicMaterial({ map: st, transparent: true, opacity: 0.32, blending: T3.AdditiveBlending, depthWrite: false, side: T3.DoubleSide, fog: false })); sh.position.set(0.4, 4.0, -1.6); sh.rotation.set(0.05, Math.PI / 4, 0.1); root.add(sh); D.shaft = sh; }
  // ---- polish: columns, hanging lamps, runner rug, sunlit pit floor, sand drifts ----
  const colM = toon('#e2cba0'), capM = toon('#e6b45a', { emissive: new T3.Color('#4a3010'), emissiveIntensity: 0.25 });
  for (const x of [-9.62, 9.62]) for (const z of [-5.9, -1.6, 2.6, 6.6]) { add(new T3.CylinderGeometry(0.26, 0.3, 3.3, 12), colM, x, 1.75, z, 0.015, 0.3); add(new T3.BoxGeometry(0.7, 0.18, 0.7), stoneD, x, 0.09, z, 0.01); add(new T3.CylinderGeometry(0.42, 0.28, 0.32, 12), capM, x, 3.55, z, 0.012, 0.42); add(new T3.BoxGeometry(0.9, 0.12, 0.9), capM, x, 3.76, z, 0.01); for (let k = 0; k < 3; k++) add(new T3.TorusGeometry(0.27, 0.025, 6, 16), teal, x, 0.7 + k * 1.1, z, 0).rotation.x = Math.PI / 2; }
  D.lamps = []; const lampGlow = new T3.MeshBasicMaterial({ color: 0xffd08a });
  for (const [x, z] of [[-4.6, 2.4], [4.6, 2.4], [-3.2, -5.2], [3.2, -5.2]]) { rod([x, 6.5, z], [x, 3.75, z], 0.012, ink, 0); add(new T3.CylinderGeometry(0.2, 0.12, 0.22, 10), toon('#a8792e'), x, 3.6, z, 0.01, 0.2); add(new T3.ConeGeometry(0.22, 0.2, 10), toon('#7a5a2a'), x, 3.83, z, 0.008); const gl = add(new T3.SphereGeometry(0.11, 10, 8), lampGlow, x, 3.48, z, 0); let sp = null; if (glowTex) { sp = new T3.Sprite(new T3.SpriteMaterial({ map: glowTex, color: 0xffb860, transparent: true, opacity: 0.55, depthWrite: false, blending: T3.AdditiveBlending })); sp.position.set(x, 3.48, z); sp.scale.setScalar(1.3); root.add(sp); } D.lamps.push({ gl, sp, ph: Math.random() * 6 }); }
  { const rugT = CTX(128, 512, c => { c.fillStyle = '#8f2b1e'; c.fillRect(0, 0, 128, 512); c.fillStyle = '#e6b45a'; c.fillRect(6, 0, 8, 512); c.fillRect(114, 0, 8, 512); c.fillStyle = '#1f6a62'; for (let y = 24; y < 512; y += 64) { c.beginPath(); c.moveTo(64, y); c.lineTo(84, y + 20); c.lineTo(64, y + 40); c.lineTo(44, y + 20); c.closePath(); c.fill(); } c.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 120; i++) c.fillRect((i * 37) % 128, (i * 113) % 512, 2, 2); });
    const rug = new T3.Mesh(new T3.PlaneGeometry(1.7, 6.6), new T3.MeshToonMaterial({ map: rugT, gradientMap: ctx.grad })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.008, 4.75); rug.receiveShadow = true; root.add(rug); }
  { const sandM = toon('#d9b47a'); for (const [x, z, w, d] of [[-6, -7.7, 3.2, 0.7], [5.5, -7.75, 2.4, 0.5], [-9.7, -2.6, 0.7, 2.4], [9.7, 4.5, 0.6, 2.8], [-9.7, 6.0, 0.6, 1.6], [2.4, -7.7, 1.6, 0.5]]) { const m = add(new T3.SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), sandM, x, 0, z, 0); m.scale.set(w / 2, 0.22, d / 2); m.castShadow = false; } }
  // interact spots (local), walk test
  D.interact.push({ id: 'monolith', x: -3.8, z: -6.0, r: 1.7 }, { id: 'sphinx', x: -6.6, z: -4.2, r: 1.9 }, { id: 'ring', x: 0, z: -5.6, r: 2.2 }, { id: 'heap', x: -5.0, z: -0.9, r: 1.5 }, { id: 'table', x: 6.2, z: -0.25, r: 1.4 }, { id: 'crates', x: 5.4, z: 3.75, r: 1.5 });
  D.spots = { enter: { x: 0, z: 9.6 }, walkIn: { x: 0, z: 5.8 }, ben: { x: -0.95, z: 3.6 }, enhedu: { x: 0.75, z: 3.35 }, enhIdle: { x: 1.9, z: 2.8 }, carter: { x: 8.9, z: 6.4 }, pit: { x: 2.3, z: 1.0 }, sieve: { x: -5.0, z: 0.25 }, table: { x: 8.35, z: -0.4 }, crate: { x: 8.95, z: 3.4 }, react: { x: 1.3, z: 2.4 } };
  D.walk = (x, z, r = 0.35) => { const inDoor = Math.abs(x) < 1.05 && z > 7.0 && z < 10.6; if (!inDoor && (x < -9.6 + r || x > 9.6 - r || z < -7.6 + r || z > 7.7 - r)) return false; for (const c of D.colliders) if (x > c[0] - r && x < c[1] + r && z > c[2] - r && z < c[3] + r) return false; return true; };
  return D;
}

// ---------------- finds ----------------
let SPECK = null; const soilSpeck = () => SPECK || (SPECK = canvasTex(64, 64, c => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 64, 64); for (let i = 0; i < 90; i++) { const v = 150 + Math.floor(Math.random() * 90); c.fillStyle = `rgb(${v},${v},${v})`; const r = 1 + Math.random() * 2.5; c.fillRect(Math.random() * 64, Math.random() * 64, r, r); } c.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 14; i++) c.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); }));
let FIND_ID = 1;
function makeFind(ST, D, job) {
  const { toon, addOutline, scene, V3, grad } = ST, g = new THREE.Group(); scene.add(g);
  const F = { id: FIND_ID++, type: job.type, job, g, dirt: [], bits: [], cracks: 0, chips: 0, wrong: 0, mis: 0, smudge: 0, crateWrong: 0, at: 'pit', hF: 0.12, foot: 0.25, liftP: 0, sieveLvl: 1, sieveShown: false, rollP: 0, read: null, glows: [], gaps: [], shards: [] };
  const mesh = (geo, col, x = 0, y = 0, z = 0, ol = 0.008, parent = g) => { const m = new THREE.Mesh(geo, typeof col === 'string' ? toon(col) : col); m.position.set(x, y, z); m.castShadow = true; if (ol) addOutline(m, ol); parent.add(m); return m; };
  if (job.type === 'tablet') { F.hF = 0.1; F.foot = 0.3;
    const tt = canvasTex(256, 184, c => { c.fillStyle = '#b9784a'; c.fillRect(0, 0, 256, 184); c.strokeStyle = '#7a4a2a'; c.lineWidth = 4; c.strokeRect(10, 10, 236, 164); c.beginPath(); c.moveTo(10, 92); c.lineTo(246, 92); c.stroke(); job.signs.forEach((k, i) => { const x = 18 + (i % 3) * 78 + (i >= 3 ? 39 : 0), y = i < 3 ? 22 : 106; drawGlyph(c, k, x, y, 2.4, '#4a2a16'); }); });
    const side = toon('#b06e42'), top = new THREE.MeshToonMaterial({ map: tt, gradientMap: grad }); const b = mesh(new THREE.BoxGeometry(0.52, 0.08, 0.38), [side, side, top, side, side, side], 0, 0.05, 0, 0.008); F.body = b;
    job.signs.forEach((k, i) => { const x = -0.26 + (18 + (i % 3) * 78 + (i >= 3 ? 39 : 0) + 29) / 256 * 0.52, z = -0.19 + ((i < 3 ? 22 : 106) + 29) / 184 * 0.38; const gm = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.15), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0, depthWrite: false })); gm.rotation.x = -Math.PI / 2; gm.position.set(x, 0.095, z); g.add(gm); F.glows.push(gm); });
    F.dirtSpots = () => Array.from({ length: 8 + Math.min(5, job.day) }, (_, i) => V3(rr(-0.22, 0.22), 0.095, rr(-0.15, 0.15))); }
  else if (job.type === 'pot') { F.foot = 0.26;
    const prof = [[0.001, 0], [0.12, 0], [0.17, 0.05], [0.21, 0.15], [0.215, 0.24], [0.18, 0.34], [0.11, 0.41], [0.1, 0.45], [0.13, 0.49]].map(p => new THREE.Vector2(...p));
    const band = canvasTex(64, 256, c => { c.fillStyle = '#c4673a'; c.fillRect(0, 0, 64, 256); c.fillStyle = '#201e1d'; c.fillRect(0, 60, 64, 16); c.fillRect(0, 150, 64, 8); c.fillStyle = '#f2e6c8'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(i * 16, 120); c.lineTo(i * 16 + 8, 96); c.lineTo(i * 16 + 16, 120); c.fill(); } c.fillStyle = '#2f9a8f'; c.fillRect(0, 200, 64, 10); });
    const potM = new THREE.MeshToonMaterial({ map: band, gradientMap: grad, side: THREE.DoubleSide }); const pg = new THREE.Group(); pg.rotation.z = Math.PI / 2; pg.scale.setScalar(0.55); pg.position.y = 0.12; g.add(pg); F.pot = pg; F.hF = 0.25; F.potMat = potM;
    const ws = job.gapW.slice(), front = [], D2R = Math.PI / 180; let a = -105 * D2R; ws.forEach((w, i) => { front.push({ a, w: w * D2R, size: w }); a += w * D2R; });
    const sectors = [...front, { a: 105 * D2R, w: 75 * D2R }, { a: 180 * D2R, w: 75 * D2R }];
    sectors.forEach((s, i) => { const geo = new THREE.LatheGeometry(prof, Math.max(3, Math.round(s.w / 0.2)), s.a, s.w), m = new THREE.Mesh(geo, potM); m.castShadow = true; addOutline(m, 0.006); pg.add(m);
      if (i < front.length && job.gaps.includes(i)) { m.visible = false; const ghost = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide })); pg.add(ghost); const mid = s.a + s.w / 2; F.gaps.push({ i, size: s.size, ghost, mesh: m, filled: false, ang: mid, mid: V3(Math.sin(mid) * 0.21, 0.24, Math.cos(mid) * 0.21) }); } });
    F.dirtSpots = () => Array.from({ length: 8 }, () => { const t = rr(-1.4, 1.4), y = rr(0.1, 0.4); return V3(Math.sin(t) * 0.215, y, Math.cos(t) * 0.215); }); }
  else if (job.type === 'jewel') { F.hF = 0.06; F.foot = 0.24; const gm = toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.3 });
    mesh(new THREE.TorusGeometry(0.17, 0.008, 6, 40), gm, 0, 0.03, 0, 0).rotation.x = Math.PI / 2; F.beads = [];
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, big = i === 0, b = mesh(new THREE.SphereGeometry(big ? 0.04 : 0.024, 10, 8), big ? toon('#2f9a8f') : gm, Math.cos(a) * 0.17, 0.035, Math.sin(a) * 0.17, 0.004); if (job.missing.includes(i)) b.visible = false; F.beads.push(b); }
    F.dirtSpots = () => Array.from({ length: 8 + Math.min(4, job.day) }, (_, i) => { const a = i / 10 * Math.PI * 2 + rr(-0.2, 0.2); return V3(Math.cos(a) * 0.17, 0.05, Math.sin(a) * 0.17); }); }
  else if (job.type === 'statue') { F.hF = 0.28; F.foot = 0.3; const st = toon('#d9c4a0'), stripe = canvasTex(32, 32, c => { for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#1f6a62' : '#e6b45a'; c.fillRect(0, i * 8, 32, 8); } }), sm = new THREE.MeshToonMaterial({ map: stripe, gradientMap: grad });
    const s = new THREE.Group(); s.rotation.y = 0.3; g.add(s); mesh(new THREE.BoxGeometry(0.46, 0.05, 0.2), toon('#a8957a'), 0, 0.025, 0, 0.006, s); mesh(new THREE.BoxGeometry(0.3, 0.1, 0.13), st, -0.04, 0.1, 0, 0.006, s); mesh(new THREE.BoxGeometry(0.12, 0.13, 0.12), st, 0.15, 0.17, 0, 0.006, s); mesh(new THREE.BoxGeometry(0.15, 0.06, 0.16), sm, 0.15, 0.25, 0, 0.005, s); for (const z of [-0.07, 0.07]) mesh(new THREE.BoxGeometry(0.05, 0.12, 0.03), sm, 0.13, 0.17, z, 0.004, s); for (const z of [-0.04, 0.04]) mesh(new THREE.BoxGeometry(0.12, 0.03, 0.035), st, 0.16, 0.065, z, 0.004, s);
    F.dirtSpots = () => Array.from({ length: 8 + Math.min(4, job.day) }, () => V3(rr(-0.18, 0.2), rr(0.12, 0.27), rr(-0.07, 0.07))); }
  else { F.hF = 0.08; F.foot = 0.18; const lap = canvasTex(128, 64, c => { c.fillStyle = '#2f4f9a'; c.fillRect(0, 0, 128, 64); c.strokeStyle = '#c9d6f2'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(16 + i * 32, 40, 10, Math.PI, 0); c.stroke(); c.beginPath(); c.moveTo(16 + i * 32, 30); c.lineTo(16 + i * 32, 12); c.stroke(); } c.fillStyle = '#e6b45a'; for (let i = 0; i < 9; i++) c.fillRect(i * 15, 56, 6, 4); });
    const cyl = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.17, 18), new THREE.MeshToonMaterial({ map: lap, gradientMap: grad }), 0, 0.05, 0, 0.006); cyl.rotation.x = Math.PI / 2; for (const z of [-0.09, 0.09]) { const cap = mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.015, 18), toon('#e6b45a'), 0, 0.05, z, 0.004); cap.rotation.x = Math.PI / 2; } F.seal = g;
    F.dirtSpots = () => Array.from({ length: 6 + Math.min(4, job.day) }, () => { const t = rr(-1.2, 1.2); return V3(0, 0.05 + Math.cos(t) * 0.052, rr(-0.07, 0.07)).add(V3(Math.sin(t) * 0.052, 0, 0)); }); }
  g.position.set(job.pos.x, -PDEP + 0.002, job.pos.z); g.rotation.y = job.rot;
  // dirt clumps (BRUSH)
  if (job.tasks.includes('brush')) { const dm = toon('#7a4a2a'); for (const p of F.dirtSpots()) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), dm); c.position.copy(p); c.scale.set(rr(0.8, 1.3), 0.5, rr(0.8, 1.3)); addOutline(c, 0.008, 0.05); c.userData = { hp: 1, s: c.scale.clone() }; (F.pot || g).add(c); F.dirt.push(c); } }
  // soil layers (DIG): one instanced mesh per layer
  { const NX = 8, NZ = 6, w = SQW - 0.3, d = SQD - 0.3, cw = w / NX, cd = d / NZ, L = job.layers, x0 = job.sq.x - w / 2, z0 = job.sq.z - d / 2, geo = new THREE.BoxGeometry(cw * 0.97, LH, cd * 0.97), cols = ['#d2a86c', '#b48250', '#93603a', '#6e4428'];
    const S = { NX, NZ, cw, cd, x0, z0, L, layers: [], total: NX * NZ * L, left: NX * NZ * L, colT: new Float32Array(NX * NZ), topY: -PDEP + L * LH }, mtx = new THREE.Matrix4(), col = new THREE.Color();
    for (let k = 0; k < L; k++) { const im = new THREE.InstancedMesh(geo, new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: grad, map: soilSpeck() }), NX * NZ), alive = new Uint8Array(NX * NZ).fill(1), care = new Uint8Array(NX * NZ), base = cols[Math.min(3, k + (4 - L))];
      for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) { const i = iz * NX + ix, x = x0 + (ix + 0.5) * cw, z = z0 + (iz + 0.5) * cd; const sy = k === L - 1 ? rr(0.82, 1.08) : 1; mtx.makeScale(1, sy, 1).setPosition(x, -PDEP + (k + 0.5) * LH - (1 - sy) * LH / 2, z); im.setMatrixAt(i, mtx); col.set(base).offsetHSL(rr(-0.01, 0.01), rr(-0.04, 0.04), rr(-0.07, 0.05)); im.setColorAt(i, col);
        const lx = x - job.pos.x, lz = z - job.pos.z; if (k * LH < F.hF && Math.abs(lx) < F.foot + cw * 0.4 && Math.abs(lz) < F.foot * 0.8 + cd * 0.4) care[i] = 1; }
      im.castShadow = false; im.receiveShadow = true; scene.add(im); S.layers.push({ im, alive, care, base }); }
    S.careTotal = S.layers.reduce((s, l) => s + l.care.reduce((a, b) => a + b, 0), 0); F.soil = S; }
  return F;
}

// ---------------- the stand-alone game ----------------
export async function createDigSite({ container, onState = () => {}, opts = {} }) {
  const ST = createStage(container, { bg: '#24160f' }), { CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  const SFX = digAudio(audio), wake = () => { if (audio.init) audio.init(); SFX.start(); };
  scene.fog = new THREE.Fog('#24160f', 22, 46); camera.far = 90; camera.updateProjectionMatrix();
  scene.traverse(o => { if (o.isHemisphereLight) { o.intensity = 0.95; o.color.set('#ffe6c8'); o.groundColor.set('#6a3a22'); } if (o.isDirectionalLight) { o.intensity = 1.25; o.position.set(2, 12, 5); } });
  const D = buildDigSite({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline, glowTex });
  const pitL = new THREE.PointLight(0xffc27a, 1.6, 13, 1.4); pitL.position.set(0, 3.4, -1.0); scene.add(pitL);
  const tabL = new THREE.PointLight(0xfff0c8, 1.2, 5, 1.5); tabL.position.set(...D.tableLamp); scene.add(tabL);
  const W = V3(), wp = o => o.getWorldPosition(new THREE.Vector3());
  // dust motes in the sun shaft
  const motes = []; for (let i = 0; i < 36; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe6b0, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(rr(0.04, 0.09)); s.position.set(rr(-1.2, 1.8), rr(0, 4.5), rr(-3, 0)); scene.add(s); motes.push({ s, v: rr(0.05, 0.15), ph: rr(0, 6) }); }
  // soft blob shadows under the foxes, embers off the braziers, a glint for fresh finds
  const blobT = canvasTex(64, 64, c => { const gr = c.createRadialGradient(32, 32, 2, 32, 32, 32); gr.addColorStop(0, 'rgba(30,14,6,0.55)'); gr.addColorStop(1, 'rgba(30,14,6,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); });
  const blobs = []; const blob = (obj, r = 0.55) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = 1; scene.add(m); blobs.push({ m, obj }); };
  const embers = []; for (let i = 0; i < 28; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffa040, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.07); scene.add(s); embers.push({ s, life: 0, v: V3() }); }
  const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, c => { c.clearRect(0, 0, 64, 64); const gr = c.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,230,1)'); gr.addColorStop(0.25, 'rgba(255,220,120,0.6)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); c.fillStyle = 'rgba(255,255,240,0.95)'; c.fillRect(30, 2, 4, 60); c.fillRect(2, 30, 60, 4); }), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); glint.visible = false; glint.renderOrder = 35; scene.add(glint); let glintT = 0;
  const wakeOnce = () => wake(); addEventListener('pointerdown', wakeOnce);
  // confetti for 3-star finds
  const confetti = []; { const cg = new THREE.PlaneGeometry(0.07, 0.04); for (let i = 0; i < 36; i++) { const m = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ color: ['#ffd23a', '#2f9a8f', '#ec3013', '#fbf8ec'][i % 4], side: THREE.DoubleSide })); m.visible = false; scene.add(m); confetti.push({ m, v: V3(), w: V3(), life: 0 }); } }
  function celebrate() { const p = enhedu.position; confetti.forEach(c => { c.m.position.set(p.x + rr(-0.5, 0.5), rr(2.4, 3.0), p.z + rr(-0.3, 0.5)); c.v.set(rr(-1.2, 1.2), rr(0.5, 2.2), rr(-0.6, 1.2)); c.w.set(rr(-9, 9), rr(-9, 9), rr(-9, 9)); c.life = rr(2.2, 3.2); c.m.visible = true; }); }
  // falling soil crumbs (sieve + dig)
  const crumbs = []; { const cg = new THREE.BoxGeometry(0.035, 0.035, 0.035); for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(cg, toon(['#8a5a34', '#b48250', '#6e4428'][i % 3])); m.visible = false; scene.add(m); crumbs.push({ m, v: V3(), life: 0 }); } }
  let crI = 0; const crumb = (x, y, z, n = 3, up = 1) => { for (let i = 0; i < n; i++) { const c = crumbs[crI = (crI + 1) % crumbs.length]; c.m.position.set(x + rr(-0.06, 0.06), y, z + rr(-0.06, 0.06)); c.v.set(rr(-0.6, 0.6), up * rr(0.8, 1.8), rr(-0.6, 0.6)); c.life = 1.2; c.m.visible = true; } };
  // ---------- cast ----------
  const strip = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; scene.add(f); return f; };
  const benWalk = strip(kit.makeFox({ ...CAST.player, mood: 'happy' })), BW = benWalk.userData.P;
  const ben = strip(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#e8c992', '#e8c992', '#1f6a62'], crest: '', gear: 'none', mood: 'happy' })), BP = ben.userData.P;
  const enhedu = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, elder: 1, fur: '#c98a4a', furDark: '#8a5a2a' }, torso: ['#e8c992', '#2f9a8f', '#1f6a62'], outfit: 'robe', crest: '', gear: 'none', mood: 'warm' }));
  const carter = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#9a6f4a', furDark: '#6b4a2c' }, torso: ['#c4673a', '#e8c992', '#8f4424'], outfit: 'vest', crest: '', gear: 'none', mood: 'happy' }));
  const place = (f, s, ry = 0) => { f.position.set(s.x, 0, s.z); f.rotation.y = ry; };
  const uniform = (() => { const print = canvasTex(256, 256, c => { c.clearRect(0, 0, 256, 256); c.save(); c.translate(128, 90); c.strokeStyle = '#1f6a62'; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(-38, -56); c.lineTo(-38, 10); c.arc(0, 10, 38, Math.PI, 0, true); c.lineTo(38, -56); c.stroke(); c.restore();
      c.save(); c.translate(128, 196); c.rotate(-0.05); c.fillStyle = '#1f6a62'; c.fillRect(-124, -26, 248, 52); c.font = 'italic 900 36px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#e6b45a'; c.fillText('PYRAMID DIG', 0, 2); c.restore(); });
    const U = dinerUniform(ST, ben, { print, printY: 1.17, stripe: '#1f6a62', towelCol: '#c4673a' }), hat = U.hat, hs = BP.head.scale.x || 1;
    while (hat.children.length) hat.remove(hat.children[0]); hat.scale.setScalar(hs); hat.position.y -= 0.05 * hs;
    M(new THREE.CylinderGeometry(0.46, 0.46, 0.025, 28), toon('#d9c08a'), 0, 0.0, -0.02, hat, 0.012, 0.46); M(new THREE.CylinderGeometry(0.21, 0.25, 0.2, 22), toon('#d9c08a'), 0, 0.1, -0.02, hat, 0.012, 0.25); M(new THREE.CylinderGeometry(0.255, 0.255, 0.05, 22), toon('#1f6a62'), 0, 0.04, -0.02, hat, 0, 0.255);
    return U.parts; })();
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  [benWalk, ben, enhedu, carter].forEach(f => blob(f));
  const setUniform = on => { uniform.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); }; setUniform(true);
  const lamp = new THREE.PointLight(0xfff2cc, 0, 7, 1.6); lamp.position.set(0, 1.6, 0.4); benWalk.add(lamp);
  // ---------- state ----------
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), findN: 0, earned: 0, tips: 0, starList: [], tool: null, flash: null, flashT: 0, say: '', sayT: 0, ptr: null, react: null, done: null, t: 0, phT: 0, confirm: 0, doneSeen: {}, meter: null, meterT: 0,
    dialog: null, toast: null, toastT: 0, prompt: null, near: null, heapLeft: 3, lampOn: false, kneel: 0, stick: { x: 0, y: 0 }, keys: new Set(), walkTo: null, cam: { yaw: Math.PI, pitch: 0.55, dist: 11 }, enter: 0, lastSq: '' };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; }, toast = (s, t = 2.6) => { S.toast = s; S.toastT = t; };
  let F = null; const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh(), z: v.z }; };
  const near = (p, x, y, r) => { const s = scr(p); return Math.hypot(s.x - x, s.y - y) < r * scale(); };
  // NPC walking
  const NPC = new Map([[enhedu, { to: null, face: 0, sp: 1.9 }], [carter, { to: null, face: 0, sp: 2.6 }], [ben, { to: null, face: 0, sp: 2.2 }]]);
  const goTo = (f, s, face) => { const n = NPC.get(f); n.to = { x: s.x, z: s.z }; n.face = face;
    // if the walk would pass right in front of the lens, step straight there instead (no giant face sweeping across the shot)
    if (S.phase === 'work' || S.phase === 'arrive') { const ax = f.position.x, az = f.position.z, bx = s.x - ax, bz = s.z - az, L2 = bx * bx + bz * bz || 1, cx = camera.position.x - ax, cz = camera.position.z - az, k = Math.max(0, Math.min(1, (cx * bx + cz * bz) / L2)), d = Math.hypot(cx - bx * k, cz - bz * k); if (d < 3.2) { f.position.set(s.x, 0, s.z); if (face != null) f.rotation.y = face; n.to = null; } } };
  const enhSpot = { dig: D.spots.pit, brush: null, lift: D.spots.pit, sieve: D.spots.sieve, mend: D.spots.table, read: D.spots.table, roll: D.spots.table, crate: D.spots.crate };
  const faceTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
  // tweens
  const TW = []; const tween = (obj, to, dur, o = {}) => { for (let i = TW.length - 1; i >= 0; i--) if (TW[i].obj === obj) TW.splice(i, 1); TW.push({ obj, a: obj.position.clone(), b: to.clone(), t: 0, dur, arc: o.arc || 0, s0: obj.scale.x, s1: o.scale, r0: obj.rotation.y, r1: o.ry, done: o.done }); };
  // ---------- jobs ----------
  function newJob() { const d = S.day, type = S.forceType || pick(d <= 1 ? ['tablet', 'pot', 'statue'] : d <= 2 ? ['tablet', 'pot', 'statue', 'jewel'] : Object.keys(FINDS));
    const sqs = D.squares.filter(q => q.id !== S.lastSq), sq = S.forceType ? D.squares.find(q => q.id === 'B1') : pick(sqs); S.lastSq = sq.id;
    const signs = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, 5), seqN = Math.min(5, 3 + Math.floor((d - 1) / 2)), seq = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5).slice(0, seqN);
    const gapW = [50, 70, 90].sort(() => Math.random() - 0.5), nG = d >= 3 ? 3 : 2, gaps = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, nG).sort();
    const missing = []; while (missing.length < Math.min(6, 3 + Math.floor(d / 2))) { const b = 1 + Math.floor(Math.random() * 15); if (!missing.includes(b)) missing.push(b); }
    return { type, day: d, sq, pos: { x: sq.x + rr(-0.25, 0.25), z: sq.z + rr(-0.15, 0.15) }, rot: rr(-0.4, 0.4), tasks: FINDS[type].tasks.slice(), layers: clamp(2 + Math.floor((d - 1) / 2), 2, 4), signs, seq, gapW, gaps, missing, line: pick(HELLO) }; }
  function clearFind() { if (!F) return; scene.remove(F.g); F.soil.layers.forEach(l => scene.remove(l.im)); F.bits.forEach(b => b.parent && b.parent.remove(b)); F.shards.forEach(s => s.parent && s.parent.remove(s)); if (F.imp) scene.remove(F.imp.g); F = null; D.squares.forEach(q => q.mound.forEach(m => m.visible = true)); D.sieve.soil.visible = false; }
  function nextFind() { clearFind(); const job = newJob(); F = makeFind(ST, D, job); job.sq.mound.forEach(m => m.visible = false); S.phase = 'arrive'; S.phT = 0; S.tool = null; S.confirm = 0; S.doneSeen = {}; goTo(enhedu, D.spots.pit, faceTo(D.spots.pit, job.sq)); say('ENHEDU: "Square ' + job.sq.id + '. ' + job.line + '"', 4.5); SFX.pick(0); }
  // ---------- task progress ----------
  function info(id) { if (!F) return { done: false, q: 0, prog: 0, txt: '' }; const T = F.job.tasks;
    if (id === 'dig') { const s = F.soil, careLeft = s.layers.reduce((a, l) => a + l.care.reduce((x, c, i) => x + (c && l.alive[i] ? 1 : 0), 0), 0), done = !!F.dug; return { done, q: Math.max(0.4, 1 - F.chips * 0.12), prog: done ? 1 : 1 - s.left / s.total, txt: done ? 'DONE' : Math.round((1 - s.left / s.total) * 100) + '%', careLeft }; }
    if (id === 'brush') { const a = F.dirt.filter(c => c.parent).length; return { done: !a, q: 1, left: a, prog: F.dirt.length ? 1 - a / F.dirt.length : 1, txt: a ? a + ' LEFT' : 'DONE' }; }
    if (id === 'lift') { const done = F.at !== 'pit'; return { done, q: Math.max(0.3, 1 - F.cracks * 0.2), prog: done ? 1 : F.liftP, txt: done ? 'DONE' : Math.round(F.liftP * 100) + '%' }; }
    if (id === 'sieve') { const n = F.bits.length, got = F.bits.filter(b => b.userData.got).length, done = F.sieveShown && got === n; return { done, q: 1, prog: done ? 1 : (1 - F.sieveLvl) * 0.5 + (n ? got / n : 0) * 0.5, txt: done ? 'DONE' : F.sieveLvl > 0.05 ? Math.round((1 - F.sieveLvl) * 100) + '%' : got + ' / ' + n }; }
    if (id === 'mend') { const n = F.gaps.length, f = F.gaps.filter(g => g.filled).length; return { done: f === n, q: Math.max(0.5, 1 - F.wrong * 0.12), prog: n ? f / n : 1, txt: f === n ? 'DONE' : f + ' / ' + n }; }
    if (id === 'read') { const R = F.read, n = F.job.seq.length, got = R ? R.i : 0, done = !!(R && R.ok); return { done, q: Math.max(0.4, 1 - F.mis * 0.15), prog: done ? 1 : got / n, txt: done ? 'DONE' : got + ' / ' + n }; }
    if (id === 'roll') { const done = F.rollP >= 1; return { done, q: Math.max(0.4, 1 - F.smudge * 0.15), prog: F.rollP, txt: done ? 'DONE' : Math.round(F.rollP * 100) + '%' }; }
    if (id === 'crate') { const done = F.at === 'crate'; return { done, q: Math.max(0.4, 1 - F.crateWrong * 0.3), prog: done ? 1 : 0, txt: done ? 'DONE' : 'PICK' }; }
    return { done: true, q: 1, prog: 1 }; }
  const allDone = () => F && F.job.tasks.every(t => info(t).done);
  const nextTask = () => F && F.job.tasks.find(t => !info(t).done);
  const unlocked = id => { if (!F) return false; const T = F.job.tasks, i = T.indexOf(id); return i >= 0 && T.slice(0, i).every(t => info(t).done); };
  function setTool(id) { if (S.phase !== 'work' || !F || !F.job.tasks.includes(id)) return; if (!unlocked(id)) { const nx = nextTask(); flash('FIRST · ' + TASKS[nx].label, '#e6b45a', 1.3); SFX.wrong(); return; } S.tool = id; S.userToolT = performance.now(); S.ptr = null; enter(id); }
  function enter(id) { const sp = id === 'brush' ? (F.at === 'pit' ? D.spots.pit : D.spots.table) : enhSpot[id]; if (sp) goTo(enhedu, sp, faceTo(sp, F.at === 'pit' ? F.job.sq : D.table));
    if (id === 'sieve' && !F.sieveStarted) startSieve(); if (id === 'read' && !F.read) startRead(); if (id === 'roll' && !F.imp) startRoll(); }
  function checkDone() { if (!F) return; for (const t of F.job.tasks) { const I = info(t); if (I.done && !S.doneSeen[t]) { S.doneSeen[t] = 1; if (t === 'dig' && S.flashHold) { flash(S.flashHold, '#ffd23a', 1.8); S.flashHold = null; } else flash(TASKS[t].label + ' DONE ✓', '#22c55e', 1.4); if (t !== 'dig') SFX.sparkle(); const p = wp(F.g); for (let i = 0; i < 5; i++) puff(p.x + rr(-0.3, 0.3), p.y + rr(0.1, 0.4), p.z + rr(-0.2, 0.2), 0xffe7a0, 1);
        const nx = nextTask(); if (!nx) say('ENHEDU: "Wonderful. Hand it in when you are ready."', 4); else { const was = S.tool; setTimeout(() => { if (S.phase === 'work' && S.tool === was && !S.ptr) { S.tool = nx; enter(nx); } }, 900); } } } }

  // ---------- DIG ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), _m = new THREE.Matrix4(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0), _c = new THREE.Color();
  const groundAt = (x, y, h) => { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const t = (h - ray.ray.origin.y) / ray.ray.direction.y; if (!(t > 0)) return null; return ray.ray.origin.clone().addScaledVector(ray.ray.direction, t); };
  const VT = () => 760 * scale();
  function topK(s, i) { for (let k = s.L - 1; k >= 0; k--) if (s.layers[k].alive[i]) return k; return -1; }
  function tintCare(s, i) { const k = topK(s, i); if (k < 0) return; const l = s.layers[k]; if (l.care[i]) { l.im.setColorAt(i, _c.set('#e6a04a')); l.im.instanceColor.needsUpdate = true; } }
  function digAt(x, y, speed) { const s = F.soil, p = groundAt(x, y, s.topY); if (!p) return; const r = upg('trowel') ? 1.3 : 0.85, cx = (p.x - s.x0) / s.cw - 0.5, cz = (p.z - s.z0) / s.cd - 0.5, now = S.t; let overCare = false;
    for (let iz = Math.max(0, Math.floor(cz - r)); iz <= Math.min(s.NZ - 1, Math.ceil(cz + r)); iz++) for (let ix = Math.max(0, Math.floor(cx - r)); ix <= Math.min(s.NX - 1, Math.ceil(cx + r)); ix++) { if (Math.hypot(ix - cx, iz - cz) > r) continue; const i = iz * s.NX + ix, k = topK(s, i); if (k < 0) continue; const l = s.layers[k];
      if (l.care[i]) overCare = true; if (now - s.colT[i] < 0.11) continue; s.colT[i] = now; l.alive[i] = 0; l.im.setMatrixAt(i, ZERO); l.im.instanceMatrix.needsUpdate = true; s.left--;
      const wx = s.x0 + (ix + 0.5) * s.cw, wz = s.z0 + (iz + 0.5) * s.cd; if (Math.random() < 0.5) crumb(wx, -PDEP + (k + 1) * LH, wz, 2); if (Math.random() < 0.25) puff(wx, -PDEP + (k + 1) * LH, wz, 0xc9a06a, 1);
      if (l.care[i] && speed > VT() && now - (F.chipT || -9) > 0.7) { F.chipT = now; F.chips++; flash('CHIP! SLOW DOWN OVER THE FIND', '#ec3013', 1.4); SFX.chip(); S.shake = 0.12; const cp = wp(F.g); puff(cp.x, cp.y + 0.1, cp.z, 0xffffff, 3); addCrack(); }
      tintCare(s, i); SFX.scrape(Math.min(1, speed / VT())); }
    if (overCare) { S.meter = { kind: 'dig', v: Math.min(1, speed / VT() / 1.4), zone: speed > VT() ? 'TOO FAST' : 'GENTLE' }; S.meterT = 0.5; }
    const I = info('dig'); if (!F.dug && I.careLeft === 0 && s.left / s.total < 0.3) finishDig(); }
  function finishDig() { const s = F.soil; F.dug = true; { const p = wp(F.g); glint.position.set(p.x, p.y + F.hF + 0.08, p.z); glint.visible = true; glintT = 2.6; for (let i = 0; i < 12; i++) puff(p.x + rr(-0.3, 0.3), p.y + rr(0.05, 0.3), p.z + rr(-0.25, 0.25), 0xffd23a, 1); S.flashHold = 'FOUND · ' + FINDS[F.type].name + '!'; SFX.found(); } s.layers.forEach(l => { for (let i = 0; i < l.alive.length; i++) if (l.alive[i]) { l.alive[i] = 0; l.im.setMatrixAt(i, ZERO); if (Math.random() < 0.15) crumb(s.x0 + ((i % s.NX) + 0.5) * s.cw, s.topY, s.z0 + (Math.floor(i / s.NX) + 0.5) * s.cd, 1); } l.im.instanceMatrix.needsUpdate = true; }); s.left = 0; checkDone(); }
  function addCrack() { const c = new THREE.Mesh(new THREE.BoxGeometry(rr(0.08, 0.16), 0.004, 0.012), new THREE.MeshBasicMaterial({ color: 0x2a1a10 })); c.position.set(rr(-0.08, 0.08), F.hF + 0.003, rr(-0.06, 0.06)); c.rotation.y = rr(0, 3); (F.pot || F.g).add(c); }
  // ---------- BRUSH ----------
  function brushMove(x, y, d) { let hit = false; for (const c of F.dirt) { if (!c.parent || !near(wp(c), x, y, 40)) continue; hit = true; const U = c.userData; U.hp -= d / (upg('brush') ? 70 : 140); const k = Math.max(0.15, U.hp); c.scale.set(U.s.x * k, U.s.y * k, U.s.z * k); if (Math.random() < 0.3) { const p = wp(c); puff(p.x, p.y + 0.02, p.z, 0xd8c0a0, 1); }
      if (U.hp <= 0) { const p = wp(c); c.parent.remove(c); puff(p.x, p.y + 0.05, p.z, 0xffe7a0, 2); SFX.pick(F.dirt.filter(q => !q.parent).length); } }
    if (hit && Math.random() < 0.5) SFX.brush(); checkDone(); }
  // ---------- LIFT ----------
  const pitY = () => -PDEP + 0.002, VMAX = () => (upg('straps') ? 620 : 400) * scale(), LIFTPX = () => 150 * scale();
  function liftMove(dy, dt) { if (F.at !== 'pit') return; const sp = dy / Math.max(dt, 0.008); F.liftV = F.liftV == null ? sp : F.liftV * 0.6 + sp * 0.4; if (dy > 0) F.liftP = Math.min(1, F.liftP + dy / LIFTPX());
    S.meter = { kind: 'lift', v: clamp(F.liftV / VMAX() / 1.4, 0, 1), zone: F.liftV < 25 ? 'DRAG UP' : F.liftV <= VMAX() ? 'STEADY' : 'TOO FAST' }; S.meterT = 0.4;
    if (F.liftV > VMAX() && F.liftP > 0.08) { F.cracks++; F.liftP *= 0.4; F.liftV = 0; flash('TOO FAST · IT CRACKED', '#ec3013', 1.5); SFX.crack(); S.shake = 0.2; addCrack(); const p = wp(F.g); puff(p.x, p.y, p.z, 0xffffff, 3); if (S.ptr) S.ptr.kind = null; }
    if (F.liftP >= 1) liftDone(); }
  function liftDone() { F.at = 'moving'; S.ptr = null; S.meter = null; const T = D.table.spot; if (F.pot) { F.pot.rotation.z = 0; F.pot.position.y = 0; F.pot.scale.setScalar(1); } tween(F.g, V3(T.x, TOP + 0.002, T.z), 1.0, { arc: 1.0, ry: 0, done: () => { F.at = 'table'; SFX.land(); checkDone(); } }); SFX.whoosh(); flash('UP SHE COMES!', '#22c55e', 1.2); }
  // ---------- SIEVE ----------
  function startSieve() { F.sieveStarted = true; F.sieveLvl = 1; const sv = D.sieve; sv.soil.visible = true; sv.soil.scale.y = 1;
    if (F.type === 'pot') F.gaps.forEach((gp, i) => { const sh = new THREE.Mesh(gp.mesh.geometry.clone().translate(-gp.mid.x, -gp.mid.y, -gp.mid.z), F.potMat); sh.castShadow = true; addOutline(sh, 0.006); sh.userData = { got: false, gap: gp, size: gp.size }; sh.scale.setScalar(0.6); sh.position.set(rr(-0.25, 0.25) - 0.03, 0.0, rr(-0.25, 0.25)); sh.rotation.set(-Math.PI / 2, 0, rr(0, 6)); sv.g.add(sh); F.bits.push(sh); });
    else F.job.missing.forEach(() => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.4 })); addOutline(b, 0.005, 0.03); b.userData = { got: false }; b.position.set(rr(-0.32, 0.32), 0.02, rr(-0.32, 0.32)); sv.g.add(b); F.bits.push(b); });
    F.bits.forEach(b => b.visible = false); }
  function shake(dir) { if (F.sieveLvl <= 0) return; const sv = D.sieve; F.sieveLvl = Math.max(0, F.sieveLvl - (upg('sieve') ? 0.2 : 0.1)); sv.swing = 0.28 * dir; SFX.shake();
    crumb(sv.x + rr(-0.3, 0.3), sv.y - 0.05, sv.z + rr(-0.3, 0.3), 4, -0.3); if (F.sieveLvl <= 0.35) F.bits.forEach(b => b.visible = true);
    if (F.sieveLvl <= 0) { sv.soil.visible = false; F.sieveShown = true; flash('TAP EACH ' + (F.type === 'pot' ? 'SHARD' : 'BEAD') + ' TO PICK IT OUT', '#ffd23a', 1.6); SFX.sparkle(); } }
  function pickBit(x, y) { const b = F.bits.find(q => !q.userData.got && q.visible && near(wp(q), x, y, 46)); if (!b) return false; b.userData.got = true; const p = wp(b); scene.attach(b); SFX.pick(F.bits.filter(q => q.userData.got).length); puff(p.x, p.y + 0.05, p.z, 0xffe7a0, 2);
    if (F.type === 'pot') { const i = F.shards.length; F.shards.push(b); b.rotation.set(0, -b.userData.gap.ang, 0); tween(b, V3(D.table.x - 0.45 + i * 0.36, TOP + 0.03, D.table.shardZ), 0.9, { arc: 0.9, scale: 1, done: () => { b.userData.home = b.position.clone(); checkDone(); } }); }
    else { const i = F.bits.filter(q => q.userData.got).length - 1, slot = F.job.missing[i], bead = F.beads[slot]; tween(b, wp(bead), 0.9, { arc: 0.8, done: () => { b.visible = false; bead.visible = true; checkDone(); } }); }
    return true; }
  // ---------- MEND ----------
  function mendDrop(sh, x, y) { const potP = wp(F.pot); let best = null, bd = 1e9; for (const gp of F.gaps) { if (gp.filled) continue; const s = scr(gp.mid.clone().add(potP)), d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = gp; } }
    if (!best || bd > 90 * scale()) { tween(sh, sh.userData.home, 0.35); return; }
    if (best.size !== sh.userData.size) { F.wrong++; flash(sh.userData.size > best.size ? 'TOO WIDE FOR THAT GAP' : 'TOO NARROW FOR THAT GAP', '#ec3013', 1.4); SFX.wrong(); tween(sh, sh.userData.home, 0.4); return; }
    best.filled = true; best.ghost.visible = false; scene.remove(sh); sh.visible = false; best.mesh.visible = true; best.mesh.scale.setScalar(1.25); best.pop = 0.01; SFX.snap(); puff(potP.x, potP.y + 0.3, potP.z + 0.2, 0xffe7a0, 3); checkDone(); }
  // ---------- READ ----------
  function startRead() { F.read = { phase: 'show', t: -0.6, i: 0, ok: false, lit: -1, flashI: -1, flashT: 0, flashCol: 0 }; say('ENHEDU: "Watch the signs light up, then tap the same signs in the same order."', 4.5); }
  function replayRead() { if (!F || !F.read || F.read.ok) return; F.read.phase = 'show'; F.read.t = -0.4; F.read.i = 0; }
  function pickGlyph(k) { const R = F && F.read; if (!R || R.phase !== 'input' || R.ok) return; const want = F.job.signs[F.job.seq[R.i]];
    if (k === want) { R.flashI = F.job.seq[R.i]; R.flashT = 0.5; R.flashCol = 0x22c55e; R.i++; SFX.glyph(k); if (R.i >= F.job.seq.length) { R.ok = true; flash('COPIED FOR THE COLLEGE', '#22c55e', 1.4); checkDone(); } }
    else { F.mis++; R.flashI = F.job.seq[R.i]; R.flashT = 0.6; R.flashCol = 0xec3013; flash('NOT THAT ONE · WATCH AGAIN', '#ec3013', 1.4); SFX.wrong(); setTimeout(() => replayRead(), 700); } }
  // ---------- ROLL ----------
  function startRoll() { const sl = D.table.slab, g = new THREE.Group(); g.position.set(sl.x, TOP + 0.042, sl.z); scene.add(g);
    const it = canvasTex(256, 96, c => { c.fillStyle = '#a86a40'; c.fillRect(0, 0, 256, 96); c.strokeStyle = '#6e3e20'; c.lineWidth = 6; for (let i = 0; i < 4; i++) { const x = 32 + i * 64; c.beginPath(); c.arc(x, 66, 18, Math.PI, 0); c.stroke(); c.beginPath(); c.moveTo(x, 48); c.lineTo(x, 18); c.stroke(); c.beginPath(); c.moveTo(x - 12, 26); c.lineTo(x + 12, 26); c.stroke(); } c.fillStyle = '#6e3e20'; for (let i = 0; i < 16; i++) c.fillRect(i * 16 + 4, 86, 8, 5); });
    const im = new THREE.Mesh(new THREE.PlaneGeometry(sl.w - 0.04, 0.22), new THREE.MeshBasicMaterial({ map: it, transparent: true })); im.rotation.x = -Math.PI / 2; im.scale.x = 0.001; g.add(im);
    F.imp = { g, im, tex: it, x0: -(sl.w - 0.04) / 2, w: sl.w - 0.04 }; F.g.rotation.set(0, 0, 0); tween(F.g, V3(sl.x + F.imp.x0, TOP + 0.042, sl.z), 0.6, { arc: 0.3, ry: 0 }); F.rollBack = 0; }
  function rollMove(dx) { if (F.rollP >= 1) return; const R = F.imp; if (dx > 0) { F.rollBack = 0; F.rollP = Math.min(1, F.rollP + dx / (210 * scale())); SFX.roll(F.rollP); }
    else { F.rollBack += -dx; if (F.rollBack > 22 * scale()) { F.rollBack = -1e9; F.smudge++; flash('SMUDGED · ROLL ONE WAY →', '#ec3013', 1.4); SFX.smudge(); const sm = new THREE.Mesh(new THREE.CircleGeometry(0.05, 12), new THREE.MeshBasicMaterial({ color: 0x5a2e14, transparent: true, opacity: 0.6, depthWrite: false })); sm.rotation.x = -Math.PI / 2; sm.position.set(R.x0 + R.w * F.rollP, 0.004, rr(-0.06, 0.06)); sm.scale.set(1.6, 1, 1); R.g.add(sm); } }
    const p = F.rollP; R.im.scale.x = Math.max(0.001, p); R.im.position.x = R.x0 + R.w * p / 2; R.tex.repeat.x = Math.max(0.001, p); R.tex.offset.x = 0; if (!TW.some(w => w.obj === F.g)) F.g.position.x = D.table.slab.x + R.x0 + R.w * p; F.g.children.forEach(m => { if (m.isMesh) m.rotation.y = -(R.w * p) / 0.05; });
    if (p >= 1) { checkDone(); } }
  // ---------- CRATE ----------
  function pickCrate(k) { if (!F || S.tool !== 'crate' || F.at === 'crate' || F.at === 'flying') return; if (k !== FINDS[F.type].crate) { F.crateWrong++; flash('THAT CRATE IS FOR ' + CRATES[k].name, '#ec3013', 1.5); SFX.wrong(); return; }
    const c = D.crates[k]; F.at = 'flying'; if (F.imp) F.imp.g.visible = true; tween(F.g, V3(c.x, 0.55, c.z), 1.0, { arc: 1.2, done: () => { F.at = 'crate'; puff(c.x, 0.7, c.z, 0xe8cf7a, 4); SFX.thunk(); S.shake = 0.1; checkDone(); } }); SFX.whoosh(); }

  // ---------- input ----------
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  function onDown(e) { wake(); S.lastInput = performance.now(); const { x, y } = local(e);
    if (S.phase === 'walk') { if (S.dialog) return; S.ptr = { x, y, x0: x, y0: y, t0: performance.now(), kind: 'walk', drag: false }; return; }
    if (DM.on || S.phase !== 'work' || !F) return; e.preventDefault(); const T = S.tool; S.ptr = { x, y, t: e.timeStamp || performance.now(), kind: null };
    if (T === 'dig') { if (F.dug) return; S.ptr.kind = 'dig'; digAt(x, y, 0); }
    else if (T === 'brush') { if (F.at === 'moving') return; S.ptr.kind = 'brush'; brushMove(x, y, 10); }
    else if (T === 'lift') { if (F.at !== 'pit') return; if (near(wp(F.g).add(V3(0, 0.05, 0)), x, y, 90)) { S.ptr.kind = 'lift'; F.liftV = 0; } else flash('PRESS THE FIND, THEN DRAG UP', '#ffffff', 1.2); }
    else if (T === 'sieve') { if (F.sieveShown || F.sieveLvl <= 0) { if (!pickBit(x, y)) flash('TAP A ' + (F.type === 'pot' ? 'SHARD' : 'BEAD') + ' IN THE SIEVE', '#ffffff', 1); } else { S.ptr.kind = 'shake'; S.ptr.acc = 0; S.ptr.dir = 0; } }
    else if (T === 'mend') { const sh = F.shards.find(s => s.parent && s.userData.home && near(wp(s), x, y, 50)); if (sh) { S.ptr.kind = 'mend'; S.ptr.sh = sh; SFX.click(); } else flash('DRAG A SHARD ONTO ITS GAP', '#ffffff', 1.1); }
    else if (T === 'roll') { S.ptr.kind = 'roll'; }
    else if (T === 'read') { if (F.read && F.read.phase === 'input') flash('TAP THE SIGNS BELOW', '#ffffff', 1); } }
  function onMove(e) { const P = S.ptr; if (!P || !P.kind) return; const { x, y } = local(e), d = Math.hypot(x - P.x, y - P.y), now = e.timeStamp || performance.now(), dt = Math.max(4, now - (P.t || now)) / 1000;
    if (P.kind === 'walk') { if (!P.drag && Math.hypot(x - P.x0, y - P.y0) > 10) P.drag = true; if (P.drag) api.lookBy(x - P.x, y - P.y); P.x = x; P.y = y; return; }
    if (d < 1) return;
    if (P.kind === 'dig') { const sp = d / dt; P.sp = P.sp == null ? sp : P.sp * 0.5 + sp * 0.5; const n = Math.ceil(d / 14); for (let i = 1; i <= n; i++) digAt(P.x + (x - P.x) * i / n, P.y + (y - P.y) * i / n, P.sp); }
    else if (P.kind === 'brush') brushMove(x, y, d);
    else if (P.kind === 'lift') liftMove(P.y - y, dt);
    else if (P.kind === 'shake') { const dx = x - P.x, s = Math.sign(dx); if (s && s !== P.dir && Math.abs(P.acc) > 26 * scale()) { shake(P.dir || s); P.acc = 0; } if (s && s !== P.dir) P.dir = s; P.acc += dx; }
    else if (P.kind === 'mend') { const g = groundAt(x, y, TOP + 0.12); if (g) P.sh.position.set(g.x, TOP + 0.12, g.z); }
    else if (P.kind === 'roll') rollMove(x - P.x);
    P.x = x; P.y = y; P.t = now; }
  function onUp(e) { const P = S.ptr; S.ptr = null; if (!P) return;
    if (P.kind === 'walk' && !P.drag && performance.now() - P.t0 < 450) tapWalk(P.x0, P.y0);
    if (P.kind === 'mend' && F) { const { x, y } = local(e); mendDrop(P.sh, x, y); } }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
  const KEYS = { KeyW: [0, 1], ArrowUp: [0, 1], KeyS: [0, -1], ArrowDown: [0, -1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };
  const onKD = e => { if (KEYS[e.code] && S.phase === 'walk' && !S.dialog) { S.keys.add(e.code); e.preventDefault(); } }, onKU = e => S.keys.delete(e.code), onBlur = () => S.keys.clear();
  addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);

  // ---------- WALK MODE ----------
  const people = () => [{ id: 'enhedu', f: enhedu, r: 1.6 }, { id: 'carter', f: carter, r: 1.5 }];
  function interactAt(x, z) { let best = null, bd = 1e9; for (const p of people()) { if (!p.f.visible) continue; const d = Math.hypot(p.f.position.x - x, p.f.position.z - z); if (d < p.r && d < bd) { bd = d; best = { id: p.id, x: p.f.position.x, z: p.f.position.z }; } } if (best) return best; for (const it of D.interact) { const d = Math.hypot(it.x - x, it.z - z); if (d < it.r && d < bd) { bd = d; best = it; } } return best; }
  function tapWalk(x, y) { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera);
    for (const p of people()) { if (!p.f.visible) continue; const hits = ray.intersectObject(p.f, true); if (hits.length) { S.walkTo = { x: p.f.position.x, z: p.f.position.z, talk: p.id, stop: 1.3 }; marker(p.f.position.x, p.f.position.z); return; } }
    const g = groundAt(x, y, 0); if (!g) return; const it = D.interact.find(q => Math.hypot(q.x - g.x, q.z - g.z) < 1.0); if (it) { S.walkTo = { x: it.x, z: it.z, talk: it.id, stop: 0.6 }; marker(it.x, it.z); return; }
    S.walkTo = { x: g.x, z: g.z, stop: 0.15 }; marker(g.x, g.z); SFX.click(); }
  const mark = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.32, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthWrite: false })); mark.visible = false; scene.add(mark);
  const marker = (x, z) => { mark.position.set(x, 0.03, z); mark.visible = true; mark.userData.t = 1; };
  function talkTo(id) { const T = TALK[id]; if (!T) return; S.walkTo = null; S.stick.x = S.stick.y = 0;
    if (id === 'enhedu') { enhedu.rotation.y = faceTo(enhedu.position, benWalk.position); S.dialog = { id, name: T.name, role: T.role, text: T.text, choices: T.choices.map((c, i) => ({ text: c, bye: i === 2, asked: false })) }; }
    else { if (id === 'carter') carter.rotation.y = faceTo(carter.position, benWalk.position); S.dialog = { id, name: T.name, role: T.role, text: T.text }; }
    SFX.click(); }
  function walkStep(dt) { const f = benWalk, cy = S.cam.yaw, fx = -Math.sin(cy), fz = Math.cos(cy), rx = -fz, rz = fx; let sx = S.stick.x, sy = S.stick.y; for (const k of S.keys) { sx += KEYS[k][0]; sy += KEYS[k][1]; }
    const mag = Math.hypot(sx, sy); let vx = 0, vz = 0, spd = 0;
    if (mag > 0.08 && !S.dialog) { S.walkTo = null; const m = Math.min(1, mag); vx = (fx * sy + rx * sx) / mag * m; vz = (fz * sy + rz * sx) / mag * m; spd = 3.4 * m; }
    else if (S.walkTo && !S.dialog) { const dx = S.walkTo.x - f.position.x, dz = S.walkTo.z - f.position.z, dd = Math.hypot(dx, dz); if (dd < S.walkTo.stop + 0.05) { const t = S.walkTo.talk; S.walkTo = null; if (t) talkTo(t); } else { vx = dx / dd; vz = dz / dd; spd = 3.2; } }
    if (spd > 0) { const nx = f.position.x + vx * spd * dt, nz = f.position.z + vz * spd * dt, mv = D.walk.bind(D); let moved = false; if (mv(nx, nz)) { f.position.x = nx; f.position.z = nz; moved = true; } else if (mv(nx, f.position.z)) { f.position.x = nx; moved = true; } else if (mv(f.position.x, nz)) { f.position.z = nz; moved = true; } else if (S.walkTo) S.walkTo = null;
      const want = Math.atan2(vx, vz); let da = want - f.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); f.rotation.y += da * Math.min(1, dt * 12); if (!moved) spd = 0; if (Math.random() < dt * 2.2 && spd) { SFX.step(); puff(f.position.x - vx * 0.3, 0.05, f.position.z - vz * 0.3, 0xd8c09a, 1); } }
    if (f.position.z > 9.2) { f.position.z = 9.0; toast('The Pyramid Path is outside. Come back to work any time.', 2.4); }
    kit.animFox(f, dt, spd); if (S.kneel > 0) { S.kneel -= dt; const k = Math.sin(Math.min(1, S.kneel / 0.7) * Math.PI); BW.body.position.y -= 0.28 * k; BW.arms[0].rotation.x = -1.2 * k; BW.arms[1].rotation.x = -1.0 * k; }
    // prompt
    const it = interactAt(f.position.x, f.position.z); S.near = it ? it.id : null; S.prompt = it && !S.dialog ? (it.id === 'heap' ? '1 TROWEL · SPOIL HEAP' : (it.id === 'enhedu' || it.id === 'carter' ? 'TALK · ' : 'LOOK · ') + TALK[it.id].name.toUpperCase()) : null;
    // npcs look at you when close
    for (const p of people()) { const n = NPC.get(p.f); if (n.to) continue; const d = Math.hypot(p.f.position.x - f.position.x, p.f.position.z - f.position.z); if (d < 3.2) { let da = faceTo(p.f.position, f.position) - p.f.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); p.f.rotation.y += da * Math.min(1, dt * 4); p.f.userData.mood = 'happy'; } }
    // camera follow
    const C = S.cam; let tx = f.position.x, ty = 1.0, tz = f.position.z, cx = tx + Math.sin(C.yaw) * Math.cos(C.pitch) * C.dist, cyy = ty + Math.sin(C.pitch) * C.dist, cz = tz - Math.cos(C.yaw) * Math.cos(C.pitch) * C.dist;
    const who = S.dialog && (S.dialog.id === 'enhedu' ? enhedu : S.dialog.id === 'carter' ? carter : null);
    if (who) { const key = S.dialog.id + '|' + CW() + 'x' + CHh(); if (S.talkKey !== key) { S.talkKey = key; const dx = f.position.x - who.position.x, dz = f.position.z - who.position.z, dl = Math.hypot(dx, dz) || 1, ux = dx / dl, uz = dz / dl, port = CW() < CHh(); let sh = null;
        for (const side of [1, -1, 0]) { const ang = (port ? 0.8 : 1.3) * side, ca = Math.cos(ang), sa = Math.sin(ang), vx = ux * ca - uz * sa, vz = ux * sa + uz * ca;
          if (port) { const px = who.position.x + vx * 4.8, pz = who.position.z + vz * 4.8; sh = { pos: V3(px, 1.9, pz), look: V3(who.position.x, 1.12, who.position.z) }; if (D.walk(px, pz, 0.5) || side === 0) break; continue; }
          const keep = { ...SAFE }; Object.assign(SAFE, { top: 80, bottom: 0, left: CW() * 0.5 }); const pts = []; for (const q of [who, f]) pts.push(V3(q.position.x - 0.35, 0.1, q.position.z), V3(q.position.x + 0.35, 0.1, q.position.z), V3(q.position.x, 2.15, q.position.z)); sh = fitShot(pts, 0.22, Math.atan2(vx, -vz), 0.05); Object.assign(SAFE, keep); if (D.walk(sh.pos.x, sh.pos.z, 0.5) || side === 0) break; }
        S.talkShot = sh; } cx = S.talkShot.pos.x; cyy = S.talkShot.pos.y; cz = S.talkShot.pos.z; tx = S.talkShot.look.x; ty = S.talkShot.look.y; tz = S.talkShot.look.z; } else S.talkKey = null;
    cx = clamp(cx, -9.3, 9.3); cz = clamp(cz, -7.4, 14); camera.position.x = damp(camera.position.x, cx, 6, dt); camera.position.y = damp(camera.position.y, cyy, 6, dt); camera.position.z = damp(camera.position.z, cz, 6, dt); CAM.look.set(damp(CAM.look.x, tx, 8, dt), damp(CAM.look.y, ty, 8, dt), damp(CAM.look.z, tz, 8, dt)); camera.lookAt(CAM.look); }
  function trowel() { if (S.phase !== 'walk' || S.dialog) return; S.kneel = 0.7; const f = benWalk, p = f.position.clone().add(V3(Math.sin(f.rotation.y) * 0.5, 0.05, Math.cos(f.rotation.y) * 0.5)); crumb(p.x, p.y, p.z, 4); puff(p.x, p.y, p.z, 0xc9a06a, 2); SFX.kneel();
    if (S.near === 'heap') { if (S.heapLeft > 0 && Math.random() < 0.55) { S.heapLeft--; try { save.addGold(2); } catch (e) {} toast('FOUND AN OLD COIN · +2g', 2.4); SFX.coin(); puff(p.x, p.y + 0.3, p.z, 0xffd23a, 3); } else toast(S.heapLeft > 0 ? 'Just dirt. Try again.' : 'The heap is picked clean for today.', 1.8); }
    else toast('Solid stone floor. Try the spoil heap by the sieve.', 2); }
  function toggleLamp() { if (S.phase !== 'walk') return; S.lampOn = !S.lampOn; lamp.intensity = S.lampOn ? 1.6 : 0; SFX.lamp(S.lampOn); toast(S.lampOn ? 'HEAD LAMP ON' : 'HEAD LAMP OFF', 1.2); }

  // ---------- flow ----------
  function hideNpcWalk() { NPC.forEach(n => n.to = null); }
  function toWalk() { if (DM.on) demoStop(); S.phase = 'walk'; S.done = null; S.react = null; S.dialog = null; clearFind(); const bp = ben.visible ? ben.position : D.spots.ben; ben.visible = false; benWalk.visible = true; benWalk.position.set(bp.x, 0, bp.z); if (!D.walk(bp.x, bp.z)) place(benWalk, D.spots.ben); benWalk.rotation.y = Math.PI;
    hideNpcWalk(); place(enhedu, D.spots.enhIdle, 0.4); place(carter, D.spots.carter, -2.4); carter.visible = true; D.cart.visible = true; S.cam.yaw = Math.PI; }
  function toIntro() { if (DM.on) demoStop(); S.phase = 'intro'; S.done = null; S.dialog = null; S.walkTo = null; setUniform(true); clearFind(); hideNpcWalk(); ben.visible = true; benWalk.visible = false; place(ben, D.spots.ben, 0.35); place(enhedu, D.spots.enhedu, -0.35); place(carter, D.spots.carter, -2.4); carter.visible = true; D.cart.visible = true; }
  function startDay() { if (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk') return; wake(); Object.assign(S, { findN: 0, earned: 0, tips: 0, starList: [], done: null, react: null, dialog: null }); setUniform(true); ben.visible = false; benWalk.visible = false; say('ENHEDU: "Three squares today. Each card says what the find needs, in order. Go slowly near the find."', 5); nextFind(); }
  function handIn() { if (S.phase !== 'work' || !F) return; if (!allDone() && performance.now() - S.confirm > 2500) { S.confirm = performance.now(); flash('NOT FINISHED · TAP HAND IN AGAIN TO SEND IT', '#e6b45a', 2.2); return; } finishFind(); }
  const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['Not a scratch! The College will put this in the front case.', 'Perfect. The builders would be proud of you.', 'Look at it! A museum piece.'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Careful work. Thank you, Ben.', 'Into the records it goes. Well done.', 'Good hands. The College will be pleased.'] }, okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['A few chips. It will still teach us something.', 'Hm. Slower next time, please.', 'Usable. Not your best.'] }, grumpy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad', lines: ['Half finished! The College cannot use this.', 'Oh dear. That will need a lot of glue.', 'Old things need patience, Ben.'] } };
  function finishFind() { const T = F.job.tasks, qs = T.map(t => { const I = info(t); return I.done ? I.q : I.prog * 0.4; }), q = qs.reduce((a, b) => a + b, 0) / T.length, stars = q >= 0.92 ? 3 : q >= 0.7 ? 2 : 1, level = stars === 3 ? (q >= 0.99 ? 'thrilled' : 'happy') : stars === 2 ? 'okay' : 'grumpy';
    const done = T.filter(t => info(t).done).length, pay = FINDS[F.type].price + done * 3, tip = Math.round((level === 'thrilled' ? Math.ceil(pay * 0.4) + 2 : level === 'happy' ? Math.ceil(pay * 0.2) : 0) * (upg('lamp') ? 1.25 : 1));
    S.flash = null; S.say = ''; S.earned += pay; S.tips += tip; S.starList.push(stars); const R = REACT[level]; enhedu.userData.mood = R.mood; S.react = { word: R.word, col: R.col, line: pick(R.lines), who: 'ARCHIVIST ENHEDU · ' + FINDS[F.type].name, stars, tip, pay, t: 0 };
    hideNpcWalk(); enhedu.position.set(D.spots.react.x, 0, D.spots.react.z); enhedu.rotation.y = 0.2; S.phase = 'react'; S.phT = 0; S.ptr = null; S.meter = null; try { if (!DM.on) save.setStat(SAVE.finds, save.stat(SAVE.finds, 0) + 1); } catch (e) {}
    SFX.react(level); if (stars === 3) { celebrate(); for (let i = 0; i < 10; i++) puff(enhedu.position.x + rr(-0.4, 0.4), rr(1.4, 2.4), enhedu.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function startCart() { S.phase = 'cart'; S.phT = 0; const k = FINDS[F.type].crate, c = D.crates[k]; S.cartK = k; carter.visible = true; D.cart.visible = true; carter.position.set(D.door.x + 0.6, 0, D.door.out); D.cart.position.set(D.door.x - 0.4, 0, D.door.out - 0.6); goTo(carter, { x: c.x, z: c.z - 0.9 + 0.0 + 1.8 }, Math.PI); say('CARTER UR-NANSHE: "Another one for the College! Up the Pyramid Path it goes."', 3.5); SFX.cart(); }
  function endDay() { S.phase = 'done'; clearFind(); ben.visible = true; place(ben, D.spots.ben, 0.35); hideNpcWalk(); place(enhedu, D.spots.enhedu, -0.35); place(carter, D.spots.carter, -2.4); D.cart.position.set(7.7, 0, 6.8); D.cart.rotation.y = -Math.PI / 2;
    const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.67, wage = 8 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); if (avg >= 2) { save.setStat(SAVE.day, S.day + 1); newDay = true; } if (!save.flag('urDigUniform')) { save.setFlag('urDigUniform'); setUniform(true); unlock.push('DIG KIT (wide hat, rag + Pyramid Dig tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, finds: S.starList.length, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) }; if (newDay) S.day += 1;
    SFX.dayEnd(); if (eod) celebrate(); say(eod ? 'ENHEDU: "Employee of the day! I will tell the whole College."' : avg >= 2 ? 'ENHEDU: "Good, careful work. Same time tomorrow."' : 'ENHEDU: "Slow down, Ben. The past is not in a hurry."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · BOUGHT', '#22c55e', 1.6); SFX.coin(); return true; }

  // ---------- camera ----------
  const { SAFE, shotFor, fitShot } = cameraFit(ST), CAM = { look: V3(0, 0.6, -1) };
  camera.position.set(0, 4.5, 11); camera.lookAt(CAM.look);
  const bx = (x, y, z, r, o) => { o.push(V3(x - r, y - r * 0.5, z - r), V3(x + r, y + r * 0.5, z + r)); return o; };
  function shot() { const port = CW() < CHh(), k = port ? 'P' : 'L';
    if (S.phase === 'intro' || S.phase === 'done') return shotFor('wide' + k, () => { const o = []; for (const s of [D.spots.ben, D.spots.enhedu]) o.push(V3(s.x - 0.5, 0, s.z), V3(s.x + 0.5, 0, s.z), V3(s.x, 2.4, s.z)); o.push(V3(0, 0.3, -3.2), V3(0, 4.2, -7.8)); if (!port) o.push(V3(-3, 0, -2), V3(3, 0, -2)); return o; }, 0.2, Math.PI - 0.12, port ? 0.08 : 0.05);
    if (!F) return shotFor('hall' + k, () => [V3(-6, 0, -4), V3(6, 0, -4), V3(0, 0, 5), V3(0, 3.5, -7.8)], 0.5, Math.PI, 0.05);
    const sq = F.job.sq, sqPts = (y1 = 0.15) => [V3(sq.x - SQW / 2, -PDEP, sq.z - SQD / 2), V3(sq.x + SQW / 2, -PDEP, sq.z - SQD / 2), V3(sq.x - SQW / 2, y1, sq.z + SQD / 2), V3(sq.x + SQW / 2, y1, sq.z + SQD / 2)];
    if (S.phase === 'arrive') return shotFor('arrive' + k + F.id, () => [V3(PX - PW / 2, -0.4, PZ - PD / 2), V3(PX + PW / 2, -0.4, PZ - PD / 2), V3(PX - PW / 2, 0, PZ + PD / 2), V3(PX + PW / 2, 0, PZ + PD / 2), V3(enhedu.position.x, 2.2, enhedu.position.z)], 0.7, Math.PI, 0.05);
    if (S.phase === 'react') { const f = enhedu.position; return shotFor('react' + k + F.id, () => [V3(f.x - 0.8, 0.2, f.z), V3(f.x + 0.8, 0.2, f.z), V3(f.x, 2.5, f.z)], 0.15, Math.PI - 0.3, 0.12); }
    if (S.phase === 'cart') return shotFor('cart' + k + F.id, () => [V3(2.6, 0, 4.3), V3(8.4, 0, 5.4), V3(0, 0, 9), V3(5, 2, 5)], 0.45, Math.PI - 0.15, 0.05);
    const T = S.tool || 'dig', so = F.soil, sw = so.cw * so.NX, sd = so.cd * so.NZ, fp = wp(F.g);
    // every work shot frames ONLY the thing your finger is working on
    if (T === 'dig') return shotFor('dig' + k + F.id, () => [V3(so.x0, so.topY, so.z0), V3(so.x0 + sw, so.topY, so.z0), V3(so.x0, so.topY, so.z0 + sd), V3(so.x0 + sw, so.topY, so.z0 + sd)], 1.18, Math.PI, 0.025);
    if (T === 'brush' && F.at === 'pit') return shotFor('bp' + k + F.id, () => bx(fp.x, fp.y + 0.1, fp.z, port ? 0.3 : 0.34, []), 1.1, Math.PI, 0.04);
    if (T === 'lift' && F.at === 'pit') return shotFor('lift' + k + F.id, () => [V3(F.job.pos.x - 0.38, -PDEP, F.job.pos.z), V3(F.job.pos.x + 0.38, -PDEP, F.job.pos.z), V3(F.job.pos.x, -PDEP + 1.1, F.job.pos.z), V3(F.job.pos.x, -PDEP, F.job.pos.z + 0.35)], 0.95, Math.PI, 0.05);
    if (T === 'sieve') { if (F.sieveShown) return shotFor('sv2' + k + F.id, () => bx(SV.x, SV.y, SV.z, 0.56, []), 1.25, Math.PI, 0.03); return shotFor('sv' + k + F.id, () => [V3(SV.x - 0.85, SV.y, SV.z - 0.85), V3(SV.x + 0.85, SV.y, SV.z - 0.85), V3(SV.x - 0.85, SV.y, SV.z + 0.85), V3(SV.x + 0.85, SV.y, SV.z + 0.85), V3(SV.x, SV.y + 0.25, SV.z)], 0.85, Math.PI, 0.04); }
    const tb = D.table, sp = tb.spot;
    if (T === 'mend') return shotFor('mend' + k + F.id, () => [V3(sp.x - 0.28, TOP, sp.z), V3(sp.x - 0.1, TOP + 0.5, sp.z), V3(tb.x - 0.55, TOP, tb.shardZ + 0.15), V3(tb.x + 0.35, TOP, tb.shardZ + 0.15), V3(tb.x + 0.2, TOP + 0.5, tb.shardZ)], 0.5, Math.PI, 0.04);
    if (T === 'read') return shotFor('read' + k + F.id, () => bx(sp.x, TOP + 0.05, sp.z, port ? 0.3 : 0.32, []), 1.3, Math.PI, 0.04);
    if (T === 'roll') return shotFor('roll' + k + F.id, () => [V3(tb.slab.x - 0.48, TOP + 0.04, tb.slab.z - 0.2), V3(tb.slab.x + 0.48, TOP + 0.04, tb.slab.z - 0.2), V3(tb.slab.x - 0.48, TOP + 0.04, tb.slab.z + 0.22), V3(tb.slab.x + 0.48, TOP + 0.04, tb.slab.z + 0.22), V3(tb.slab.x, TOP + 0.2, tb.slab.z)], 0.85, Math.PI, 0.07);
    if (T === 'crate') { if (F.at === 'flying' || F.at === 'crate') { const c = D.crates[FINDS[F.type].crate]; return shotFor('cr2' + k + F.id, () => bx(c.x, 0.5, c.z, 0.75, []), 0.6, Math.PI, 0.05); } return shotFor('crate' + k + F.id, () => [V3(2.55, 0, 4.45), V3(8.25, 0, 4.45), V3(2.55, 0.75, 5.15), V3(8.25, 0.75, 5.15)], port ? 0.85 : 0.55, Math.PI, 0.03); }
    return shotFor('bt' + k + F.id + T, () => bx(fp.x, fp.y + 0.1, fp.z, port ? 0.3 : 0.34, []), 1.05, Math.PI, 0.04); }

  // ---------- DEMO: autopilot digs one clay tablet (every step) with captions; nothing is saved ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {} };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.3); hand.visible = false; hand.renderOrder = 40; scene.add(hand);
  const handAt = p => { hand.visible = true; hand.position.copy(p).add(V3(0, 0.05, 0.05)); hand.scale.setScalar(0.35); };
  const cap = (id, key, text, wait = 1.9) => { if (DM.seen[id]) return 0; DM.seen[id] = 1; DM.cap = text; DM.key = key; return wait; };
  function demoAct() { if (!F) return 0.5; const T = nextTask();
    if (!T) { DM.cap = 'EVERY STEP DONE: TAP HAND IN'; DM.key = 'TAP'; hand.visible = false; if (!DM.seen.hand) { DM.seen.hand = 1; return 1.6; } handIn(); return 1; }
    if (S.tool !== T) { setTool(T); DM.cap = 'STEP ' + (F.job.tasks.indexOf(T) + 1) + ' OF ' + F.job.tasks.length + ': ' + TASKS[T].label; DM.key = 'TAP'; hand.visible = false; return 1.3; }
    if (T === 'dig') { const w = cap('dig', 'SWIPE', 'SWIPE TO SCRAPE THE SOIL OFF. AMBER = THE FIND IS RIGHT THERE: GO SLOW'); if (w) return w; const s = F.soil; let best = -1, bk = -1; for (let i = 0; i < s.NX * s.NZ; i++) { const k = topK(s, i); if (k > bk || (k === bk && Math.random() < 0.3)) { bk = k; best = i; } } if (best < 0) return 0.3; const ix = best % s.NX, iz = Math.floor(best / s.NX), p = V3(s.x0 + (ix + 0.5) * s.cw, -PDEP + (bk + 1) * LH, s.z0 + (iz + 0.5) * s.cd); handAt(p); const sp = scr(p); S.t += 0.2; digAt(sp.x, sp.y, VT() * 0.4); return 0.05; }
    if (T === 'brush') { const c = F.dirt.find(q => q.parent); if (!c) return 0.3; const w = cap('brush', 'RUB', 'RUB BACK AND FORTH OVER THE DIRT TO BRUSH IT OFF'); if (w) return w; const p = wp(c); handAt(p); const sp = scr(p); brushMove(sp.x, sp.y, 30); return 0.07; }
    if (T === 'lift') { if (F.at !== 'pit') return 0.3; const w = cap('lift', 'DRAG ↑', 'PRESS THE FIND AND DRAG UP SLOWLY. KEEP THE BAR GREEN'); if (w) return w; handAt(wp(F.g).add(V3(0, 0.1, 0))); liftMove(5 * scale(), 0.05); return 0.05; }
    if (T === 'read') { const R = F.read; if (!R || R.phase === 'show') { cap('read', 'WATCH', 'WATCH THE ORDER THE SIGNS LIGHT UP...', 0); hand.visible = false; return 0.3; } const w = cap('read2', 'TAP', 'NOW TAP THE SAME SIGNS BELOW, IN THE SAME ORDER', 1.4); if (w) return w; pickGlyph(F.job.signs[F.job.seq[R.i]]); return 0.75; }
    if (T === 'crate') { const w = cap('crate', 'PICK', 'IT IS A TABLET: PICK THE TABLETS CRATE BELOW', 2); if (w) return w; pickCrate(FINDS[F.type].crate); return 1.2; }
    return 0.5; }
  function demoStep(dt) { hand.scale.setScalar(Math.max(0.22, hand.scale.x - dt * 0.6));
    if (S.phase === 'arrive') { DM.cap = 'ENHEDU POINTS AT A SQUARE AND HANDS YOU A DIG CARD'; DM.key = ''; hand.visible = false; return; }
    if (S.phase === 'react') { DM.cap = 'ENHEDU CHECKS YOUR WORK. CAREFUL HANDS EARN STARS AND A BONUS'; DM.key = '★'; hand.visible = false; return; }
    if (S.phase === 'cart') { DM.cap = 'UR-NANSHE CARTS IT OFF. YOUR TURN: TAP PUT ME TO WORK'; DM.key = 'GO'; return; }
    if (S.phase !== 'work') return; DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct(); }
  function demoStart() { if (DM.on || (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk')) return; wake(); DM.on = true; DM.seen = {}; DM.cd = 1.4; DM.cap = 'WATCH ONE FIND AT THE PYRAMID DIG'; DM.key = ''; S.done = null; S.phase = 'intro'; DM.day0 = S.day; S.day = 2; S.forceType = 'tablet'; startDay(); S.forceType = null; }
  function demoStop() { if (!DM.on) return; DM.on = false; hand.visible = false; S.ptr = null; S.react = null; S.flash = null; S.meter = null; S.day = DM.day0; Object.assign(S, { phase: 'intro', done: null, findN: 0, earned: 0, tips: 0, starList: [], tool: null }); toIntro(); }

  // ---------- hint ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'work' || !F) return null; const T = S.tool, H = (p, text, tool = T, r = 0.18) => ({ p, text, tool, r });
    if (!T || info(T).done) { const nx = nextTask(); return nx ? { text: 'NEXT · TAP ' + TASKS[nx].label + ' BELOW', tool: nx } : { text: 'ALL DONE · TAP HAND IN', tool: 'hand' }; }
    if (T === 'dig') { const I = info('dig'); return H(V3(F.job.pos.x, F.soil.topY, F.job.pos.z), I.careLeft ? 'SWIPE TO SCRAPE · GO SLOW ON THE AMBER' : 'NEARLY THERE · CLEAR THE LAST SOIL', T, 0.5); }
    if (T === 'brush') { const c = F.dirt.find(q => q.parent); return c ? H(wp(c), 'RUB THE DIRT OFF · ' + info(T).left + ' LEFT') : null; }
    if (T === 'lift') return F.at === 'pit' ? H(wp(F.g), 'PRESS THE FIND · DRAG UP SLOWLY', T, 0.3) : null;
    if (T === 'sieve') return F.sieveShown ? (() => { const b = F.bits.find(q => !q.userData.got); return b ? H(wp(b), 'TAP EACH ' + (F.type === 'pot' ? 'SHARD' : 'BEAD') + ' TO PICK IT OUT') : null; })() : H(V3(SV.x, SV.y, SV.z), 'SWIPE LEFT-RIGHT FAST TO SHAKE', T, 0.55);
    if (T === 'mend') { const s = F.shards.find(q => q.parent && q.userData.home); return s ? H(wp(s), 'DRAG A SHARD ONTO THE GAP OF THE SAME WIDTH') : null; }
    if (T === 'read') return { text: F.read && F.read.phase === 'input' ? 'TAP THE SIGNS IN THE ORDER THEY LIT · ' + F.read.i + ' / ' + F.job.seq.length : 'WATCH THE SIGNS LIGHT UP', tool: T };
    if (T === 'roll') return H(V3(D.table.slab.x, TOP + 0.05, D.table.slab.z), 'DRAG LEFT → RIGHT ACROSS THE CLAY · ONE WAY ONLY', T, 0.25);
    if (T === 'crate') return { text: 'PICK THE RIGHT CRATE BELOW', tool: T };
    return null; }
  let HINT = null, hintT = 0;

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  function step(dt) { const t = clock.elapsedTime; S.t += dt; S.phT += dt;
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = ''; S.toastT -= dt; if (S.toastT <= 0) S.toast = null; S.meterT -= dt; if (S.meterT <= 0) S.meter = null;
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.12 + (1 - p.life) * 0.22); }
    for (const c of crumbs) { if (c.life <= 0) continue; c.life -= dt; c.v.y -= 9 * dt; c.m.position.addScaledVector(c.v, dt); if (c.m.position.y < -PDEP && c.v.y < 0 || c.life <= 0) { c.m.visible = false; c.life = 0; } }
    for (const m of motes) { m.s.position.y += m.v * dt; m.s.position.x += Math.sin(t * 0.7 + m.ph) * dt * 0.08; if (m.s.position.y > 4.6) m.s.position.y = 0; m.s.material.opacity = 0.35 + Math.sin(t * 2 + m.ph) * 0.2; }
    D.fires.forEach((f, i) => { const k = 1 + Math.sin(t * 9 + f.ph) * 0.12 + Math.sin(t * 23 + f.ph * 2) * 0.06; f.f1.scale.set(1, k, 1); f.f2.scale.set(1, 2 - k, 1); if (f.sp) f.sp.material.opacity = 0.55 + (k - 1) * 1.2; });
    for (const b of blobs) { b.m.visible = b.obj.visible; if (b.obj.visible) b.m.position.set(b.obj.position.x, 0.012, b.obj.position.z); }
    for (const e of embers) { if (e.life <= 0) { if (Math.random() < dt * 3) { const f = D.fires[Math.floor(Math.random() * D.fires.length)], p = wp(f.f1); e.s.position.set(p.x + rr(-0.12, 0.12), p.y + 0.15, p.z + rr(-0.12, 0.12)); e.v.set(rr(-0.15, 0.15), rr(0.5, 1.0), rr(-0.15, 0.15)); e.life = rr(1.0, 2.0); } else { e.s.material.opacity = 0; continue; } } e.life -= dt; e.s.position.addScaledVector(e.v, dt); e.s.position.x += Math.sin(t * 6 + e.v.x * 40) * dt * 0.1; e.s.material.opacity = Math.min(1, e.life) * 0.9; }
    D.lamps.forEach(l => { const k = 0.85 + Math.sin(t * 5 + l.ph) * 0.08 + Math.sin(t * 13 + l.ph) * 0.05; if (l.sp) l.sp.material.opacity = 0.5 * k; });
    if (glintT > 0) { glintT -= dt; glint.visible = glintT > 0; const k = Math.sin(Math.min(1, glintT / 2.6) * Math.PI); glint.scale.setScalar(0.25 + k * 0.45 + Math.sin(t * 14) * 0.05); glint.material.rotation += dt * 2; glint.material.opacity = k; if (F) { const p = wp(F.g); glint.position.set(p.x, p.y + F.hF + 0.08, p.z); } }
    pitL.intensity = 1.5 + Math.sin(t * 7) * 0.06 + Math.sin(t * 17) * 0.04; D.ring.inner.rotation.z -= dt * 0.12; D.ring.gem.rotation.y += dt * 0.8; D.ring.gem.material.color.setHSL(0.47, 0.7, 0.62 + Math.sin(t * 1.4) * 0.1);
    if (mark.visible) { mark.userData.t -= dt; mark.material.opacity = Math.max(0, mark.userData.t); mark.scale.setScalar(1 + (1 - mark.userData.t) * 0.6); if (mark.userData.t <= 0 || !S.walkTo) mark.visible = mark.userData.t > 0 && !!S.walkTo; }
    for (let i = TW.length - 1; i >= 0; i--) { const w = TW[i]; w.t += dt / w.dur; const k = smooth(0, 1, Math.min(1, w.t)); w.obj.position.lerpVectors(w.a, w.b, k); w.obj.position.y += Math.sin(k * Math.PI) * w.arc; if (w.s1 != null) w.obj.scale.setScalar(w.s0 + (w.s1 - w.s0) * k); if (w.r1 != null) w.obj.rotation.y = w.r0 + (w.r1 - w.r0) * k; if (w.t >= 1) { TW.splice(i, 1); w.done && w.done(); } }
    // npcs
    NPC.forEach((n, f) => { let spd = 0; if (n.to && f.visible) { const dx = n.to.x - f.position.x, dz = n.to.z - f.position.z, dd = Math.hypot(dx, dz); if (dd < 0.06) { n.to = null; if (n.face != null) f.rotation.y = n.face; } else { const st = Math.min(dd, n.sp * dt); f.position.x += dx / dd * st; f.position.z += dz / dd * st; let da = Math.atan2(dx, dz) - f.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); f.rotation.y += da * Math.min(1, dt * 10); spd = n.sp; } } if (f.visible) kit.animFox(f, dt, spd); });
    // sieve swing
    { const sv = D.sieve; sv.swing = (sv.swing || 0) * Math.exp(-dt * 5); sv.g.rotation.z = Math.sin(t * 22) * (sv.swing || 0) * 0.5; sv.g.position.x = SV.x + Math.sin(t * 22) * (sv.swing || 0) * 0.3; if (F && F.sieveStarted) { sv.soil.scale.y = Math.max(0.01, F.sieveLvl); sv.soil.position.y = 0.0 + 0.08 * F.sieveLvl; } }
    if (F) { // lift: settles back when you let go; pot pop
      if (F.at === 'pit') { if (!(S.ptr && S.ptr.kind === 'lift') && !DM.on && F.liftP > 0) F.liftP = Math.max(0, F.liftP - dt * 0.6); F.g.position.y = pitY() + F.liftP * 0.9; F.g.rotation.z = F.liftP > 0 && F.liftV > VMAX() * 0.8 ? Math.sin(t * 40) * 0.04 : 0; }
      for (const gp of F.gaps) if (gp.pop > 0 && gp.pop < 1) { gp.pop = Math.min(1, gp.pop + dt * 4); gp.mesh.scale.setScalar(1 + (1 - gp.pop) * 0.25); }
      if (F.read) { const R = F.read; F.glows.forEach(g => g.material.opacity = 0); if (R.phase === 'show') { R.t += dt; const per = 0.85, n = F.job.seq.length, i = Math.floor(R.t / per); if (R.t >= 0 && i < n && (R.t % per) < 0.62) { const gm = F.glows[F.job.seq[i]]; gm.material.color.setHex(0xffd23a); gm.material.opacity = 0.75; if (R.lit !== i) { R.lit = i; SFX.glyph(F.job.signs[F.job.seq[i]]); } } if (R.t > n * per + 0.2) { R.phase = 'input'; R.lit = -1; } }
        if (R.flashT > 0) { R.flashT -= dt; const gm = F.glows[R.flashI]; gm.material.color.setHex(R.flashCol); gm.material.opacity = 0.8 * Math.min(1, R.flashT * 3); } } }
    // phases
    if (S.phase === 'walk') walkStep(dt);
    else { if (S.phase === 'arrive' && S.phT > 2.4) { S.phase = 'work'; S.tool = F.job.tasks[0]; enter(S.tool); SFX.click(); }
      if (S.phase === 'react') { if (S.react) S.react.t += dt; if (S.phT > 3.0) { S.react = null; startCart(); } }
      if (S.phase === 'cart') { const cn = NPC.get(carter), c = D.crates[S.cartK]; D.cart.position.set(carter.position.x - Math.sin(carter.rotation.y) * -0.9, 0, carter.position.z + Math.cos(carter.rotation.y) * 0.9); D.cart.rotation.y = carter.rotation.y - Math.PI / 2;
        if (!cn.to && !S.cartBack) { S.cartBack = true; if (F) { F.g.visible = false; } puff(c.x, 0.8, c.z, 0xe8cf7a, 3); SFX.thunk(); goTo(carter, { x: D.door.x + 0.3, z: D.door.out + 0.5 }, 0); }
        if (S.cartBack && !cn.to) { S.cartBack = false; place(carter, D.spots.carter, -2.4); D.cart.position.set(7.7, 0, 6.8); D.cart.rotation.y = -Math.PI / 2; if (DM.on) { demoStop(); return; } S.findN++; if (S.findN >= URDIG.perDay) endDay(); else nextFind(); } }
      const greet = S.phase === 'intro' || S.phase === 'done'; if (greet && ben.visible) { ben.userData.mood = 'excited'; if (BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32); }
      const sh = shot(), r = Math.min(1, dt * (S.phase === 'work' ? 3.2 : 2.2)); camera.position.lerp(sh.pos, r); CAM.look.lerp(sh.look, r); camera.lookAt(CAM.look); }
    { const out = camera.position.z > 7.6; D.front.forEach(m => m.visible = !out); const sv = S.phase === 'work' && S.tool === 'sieve'; D.tripod.forEach(m => m.visible = !sv); const inPit = S.phase === 'work' && F && F.at === 'pit'; D.twine.forEach(m => m.visible = !inPit); }
    { const mm = ['work', 'arrive', 'react', 'cart'].includes(S.phase) ? 'work' : 'calm'; if (mm !== S.mm) { S.mm = mm; SFX.music(mm); } }
    for (const c of confetti) { if (c.life <= 0) continue; c.life -= dt; c.v.y -= 2.2 * dt; c.v.multiplyScalar(1 - dt * 1.2); c.m.position.addScaledVector(c.v, dt); c.m.rotation.x += c.w.x * dt; c.m.rotation.y += c.w.y * dt; c.m.rotation.z += c.w.z * dt; if (c.life <= 0 || c.m.position.y < 0.02) { c.m.visible = false; c.life = 0; } }
    if (S.phase === 'react' && S.react && S.react.stars >= 2) { const EP = enhedu.userData.P, k = Math.sin(S.t * 9); if (EP && EP.arms) { EP.arms[0].rotation.set(-0.3, 0, -2.6 + k * 0.3); EP.arms[1].rotation.set(-0.3, 0, 2.6 - k * 0.3); } if (S.react.stars === 3) enhedu.userData.hop = Math.max(enhedu.userData.hop || 0, (S.t % 0.6) < 0.05 ? 1 : 0); }
    if (S.shake > 0) { S.shake -= dt; const a = Math.max(0, S.shake) * 0.35; camera.position.x += rr(-a, a); camera.position.y += rr(-a, a); }
    if (DM.on) demoStep(dt); hintT += dt; HINT = DM.on ? null : nextHint(); RINGS.place(HINT && HINT.p ? HINT : null, hintT, dt); if (HINT && HINT.p && S.tool !== 'dig') RINGS.arrow.visible = false; }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  function hud() { const J = F && F.job, R = F && F.read;
    return { phase: S.phase, day: S.day, findN: S.findN, perDay: URDIG.perDay, earned: S.earned, tips: S.tips, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0,
      job: J ? { square: J.sq.id, find: FINDS[J.type].name, crate: CRATES[FINDS[J.type].crate].name, tasks: J.tasks.map((id, i) => { const I = info(id); return { id, label: TASKS[id].label, name: TASKS[id].name, done: I.done, txt: I.txt, locked: !unlocked(id) }; }) } : null,
      tool: S.tool, allDone: !!allDone(), confirm: performance.now() - S.confirm < 2500,
      glyphPick: !!(F && S.phase === 'work' && S.tool === 'read' && R && !R.ok), readShow: !!(R && R.phase === 'show'), glyphs: GLYPHS.map((g, k) => ({ k, name: g.name, d: glyphPath(k) })),
      cratePick: !!(F && S.phase === 'work' && S.tool === 'crate' && (F.at === 'table' || F.at === 'pit')), crates: CK.map(k => ({ k, name: CRATES[k].name, col: CRATES[k].col })),
      meter: S.meter, flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: !!save.flag('urDigUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), finds: save.stat(SAVE.finds, 0),
      music: SFX.musicOn, hint: HINT ? { text: HINT.text, tool: HINT.tool } : null, demo: DM.on ? { cap: DM.cap, key: DM.key } : null,
      walk: S.phase === 'walk' ? { prompt: S.prompt, toast: S.toast, lamp: S.lampOn, dialog: S.dialog ? { name: S.dialog.name, role: S.dialog.role, text: S.dialog.text, step: 1, total: 1, done: true, choices: S.dialog.choices ? S.dialog.choices.map(c => ({ text: c.text, asked: c.asked, bye: c.bye })) : undefined } : null } : null }; }
  // ---------- the Game HUD contract (walk mode) ----------
  const api = { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    setTool, handIn, startDay, demoStart, demoStop, buyUpgrade, pickGlyph, replayRead, pickCrate, hud, toIntro, toWalk, setPaused(v) { PAUSE = !!v; },
    start() {}, talk() { if (S.phase !== 'walk' || S.dialog) return; if (S.near === 'heap') { trowel(); return; } if (S.near) talkTo(S.near); }, choose(i) { const d = S.dialog; if (!d || !d.choices) return; if (d.id === 'enhedu') { if (i === 0) { S.dialog = null; toIntro(); return; } if (i === 1) { d.text = TALK.enhedu.why; d.choices[1].asked = true; SFX.click(); return; } } S.dialog = null; },
    closeDialog() { S.dialog = null; SFX.click(); }, nextLine() { if (S.dialog && !S.dialog.choices) S.dialog = null; }, clearToast() { S.toast = null; },
    melee() { trowel(); }, range() { toggleLamp(); }, jump() { if (S.phase === 'walk' && !S.dialog) { benWalk.userData.hop = 1; SFX.step(); setTimeout(() => SFX.step(), 380); } }, meleeUp() {}, useItem() { toast('Save it for outside. No snacks near the finds!', 2); }, closeWheel() {}, skipTime() {},
    setHudPad(v) { S.hudPad = !!v; }, setStick(x, y) { if (x || y) wake(); S.stick.x = x; S.stick.y = y; }, eyeLook() {}, eyeRelease() {}, togglePov() { return false; },
    lookBy(dx, dy) { S.cam.yaw -= dx * 0.006; S.cam.pitch = clamp(S.cam.pitch + dy * 0.004, 0.25, 1.2); }, zoomBy(f) { S.cam.dist = clamp(S.cam.dist * f, 4.5, 16); }, getCam() { return { dist: S.cam.dist, pitch: S.cam.pitch }; }, setCam(d, p) { if (d != null) S.cam.dist = clamp(d, 4.5, 16); if (p != null) S.cam.pitch = clamp(p, 0.25, 1.2); },
    mapData() { const f = benWalk.position; return { p: [f.x, f.z, benWalk.rotation.y], b: [['PIT', PX, PZ], ['SIEVE', SV.x, SV.z], ['FINDS TABLE', TB.x, TB.z], ['CRATES', 5.4, 4.8], ['MONOLITH', -3.8, -6.9]], f: [[enhedu.position.x, enhedu.position.z], [carter.position.x, carter.position.z]], e: [], q: [enhedu.position.x, enhedu.position.z, 'ENHEDU'] }; },
    setMinimap() {}, toggleSound() { wake(); if (audio.setMuted) audio.setMuted(!audio.muted); else audio.muted = !audio.muted; }, setMusic(v) { wake(); SFX.setMusicOn(v); }, get musicOn() { return SFX.musicOn; }, cycleWeather() {},
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _force(t) { S.forceType = t; }, _state: () => S, _dbg: () => ({ cam: camera.position.toArray().map(v => +v.toFixed(2)), look: CAM.look.toArray().map(v => +v.toFixed(2)), ben: benWalk.position.toArray().map(v => +v.toFixed(2)), enh: enhedu.position.toArray().map(v => +v.toFixed(2)) }), _find: () => F, _scr: scr, _wp: wp, _D: D,
    _auto() { return { dig() { finishDig(); }, brush() { F.dirt.forEach(c => c.parent && c.parent.remove(c)); checkDone(); }, lift() { liftDone(); F.g.position.set(D.table.spot.x, TOP + 0.002, D.table.spot.z); F.at = 'table'; TW.length = 0; checkDone(); }, sieve() { if (!F.sieveStarted) startSieve(); for (let i = 0; i < 12; i++) shake(1); TW.length = 0; F.bits.forEach(b => { if (!b.userData.got) { const x = scr(wp(b)); pickBit(x.x, x.y); } }); }, read() { if (!F.read) startRead(); F.read.phase = 'input'; F.job.seq.forEach(() => pickGlyph(F.job.signs[F.job.seq[F.read.i]])); }, roll() { if (!F.imp) startRoll(); rollMove(9999); }, mend() { F.gaps.forEach(g => { g.filled = true; g.ghost.visible = false; g.mesh.visible = true; }); F.shards.forEach(s => s.parent && s.parent.remove(s)); checkDone(); }, crate() { pickCrate(FINDS[F.type].crate); } }; },
    destroy() { SFX.destroy(); removeEventListener('pointerdown', wakeOnce); cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  // opening: Ben walks in through the door, then the welcome card (or straight to walking with opts.walk)
  toIntro(); if (opts.walk) toWalk(); else if (opts.work) { startDay(); } else { ben.position.set(D.spots.enter.x, 0, D.spots.enter.z); goTo(ben, D.spots.ben, 0.35); }
  frame();
  return api;
}
