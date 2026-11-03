// 8 GATES — DOMINOES CLUB [dominoesClub]. A porch room (any building, any world): stucco walls, shutters, string lights,
// a ceiling fan, and a felt-topped domino table with four stools.
// Modes: VS FOXES (seat any of Pip · ROOKIE, Hope · CLUB, Noble · MASTER: 2–4 at the table), PASS & PLAY (2–4 on one phone,
// tiles hidden between turns), ONLINE (room of up to 5: up to 4 play, the rest watch and take the next match), WATCH THE DEMO.
// Games: DRAW and ALL FIVES (spinner, score multiples of 5), first to 50 / 100 / 150. Your tiles sit in a big rack at the
// bottom of the screen: tap one, then tap a glowing end (or it plays itself when it only fits one way).
// Rules + CPU + the line layout: ./dominoes-rules.js. Built from the Go Club (minigame #5) code, copied so the games share no files.
// MERGE: createDominoesClub({ container, onState }) stands alone. buildParlor(ctx) builds just the room + table into any scene/origin.
// Save keys: everything under 'dominoesClub.*' (stats in engine/save.js; resume + prefs in localStorage).
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../../fox-kit.js';
import { CAST, castKit, loadCastRigs } from '../../engine/cast.js';
import { crestTex, canvasTex, FONT } from '../../engine/textures.js';
import { save } from '../../engine/save.js';
import { Dominoes, TILES, think, layoutLine, tileSVG, tileText, tileWords, pipsOf, isDouble, NUM_WORD, PIP_COL } from './dominoes-rules.js';
import { createDominoesAudio } from './dominoes-audio.js';

export const GAME = { key: 'dominoesClub', name: 'DOMINOES CLUB', room: 'dominoesClub', maxRoom: 5 };
const RESUME_KEY = 'dominoesClub.resume', PREFS_KEY = 'dominoesClub.prefs';
// Opponents + rewards + lines: DRAFT for Ben. Gold for a match win = the sum of the foxes at the table.
export const OPPONENTS = [
  { level: 0, id: 'pip', tag: 'ROOKIE', name: 'PIP', who: 'Slaps every tile down', gold: 4, xp: 10,
    lines: { hello: ['Dominoes! I love the clicky noise.', 'Sit sit sit! I shuffled already. Twice.'], score: ['Points! Did I get points?', 'Fives! I counted on my paws!'], domino: ['DOMINÓ! That means I win, right?', 'All gone! Look, empty hands!'], lostHand: ['Aw. Next one is mine.', 'You had that planned!'], draw: ['Boneyard, give me something good.', 'I need a... anything.'], pass: ['*knock knock* I pass!'], block: ['Stuck! Everybody is stuck!'], win: ['I WON THE WHOLE THING!'], lose: ['Good game! Again?'] } },
  { level: 1, id: 'hope', tag: 'CLUB', name: 'HOPE', who: 'Counts every tile by ear', gold: 10, xp: 24,
    lines: { hello: ['Pull up a stool. I will call the ends out loud.', 'Listen: the tiles tell you what is left.'], score: ['That makes fifteen. I heard it.', 'A tidy five.'], domino: ['Dominó. That is the last of mine.', 'Out. Count your pips, friends.'], lostHand: ['Nicely closed.', 'You held the right number.'], draw: ['I will take one from the yard.', 'Nothing fits. Drawing.'], pass: ['*knock knock* Pass.'], block: ['Blocked. Lightest hand wins.'], win: ['Good match. Again?'], lose: ['Well played. I never heard that coming.'] } },
  { level: 2, id: 'noble', tag: 'MASTER', name: 'NOBLE', who: 'Club champion · remembers every pass', gold: 25, xp: 55,
    lines: { hello: ['Sit. Shuffle is done. Your lead.', 'I remember every number you could not play.'], score: ['Points.', 'Twenty. Write it down.'], domino: ['Dominó.', 'Done. Count.'], lostHand: ['Hm. Lucky draw.', 'Fine.'], draw: ['Drawing.'], pass: ['*knock knock*'], block: ['Blocked. Count the pips.'], win: ['Again. You are improving.'], lose: ['...Well played. Very well played.'] } }];
const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PINK', '#f472b6']];
export const REACTS = ['NICE', 'WOW', 'OOF', 'GG'];
export const TARGETS = [50, 100, 150];

// ---------------- small helpers (copied, so this game has no shared-file edits) ----------------
const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const smooth = t => t * t * (3 - 2 * t), pick = a => a[Math.floor(Math.random() * a.length)];
function makeGradient() { const d = new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }
function glowTexture() { return canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }); }

// ---------------- sizes (fox units: a standing fox is ~2.8 tall, hips at 0.75) ----------------
const TABLE_Y = 0.95, FELT_Y = TABLE_Y + 0.002, FELT = 1.5, SEAT_D = 1.2, U = 0.052, TH = 0.022, ROW_D = 0.65;
const BOARD_LOOK = new THREE.Vector3(0, FELT_Y, 0);
// the four sides of the table, clockwise from your seat (S): turn order goes S → W → N → E
const SIDES = { S: [0, 1], W: [-1, 0], N: [0, -1], E: [1, 0] };
const SEATS_FOR = { 2: ['S', 'N'], 3: ['S', 'W', 'N'], 4: ['S', 'W', 'N', 'E'] };

// ---------------- the room (exported for worlds): a porch with stucco, shutters, string lights, a felt domino table ----------------
export function buildParlor({ toon, M, scene, origin }) {
  const G = new THREE.Group(); if (origin) G.position.copy(origin); (scene || M.scene).add(G);
  const W = 7.2, D = 7.2, H = 3.2;
  // terracotta floor tiles
  const terra = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#8a4a2c'; g.fillRect(0, 0, w, h); const n = 8, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const l = 44 + Math.random() * 10; g.fillStyle = `hsl(${16 + Math.random() * 8},${48 + Math.random() * 10}%,${l}%)`; g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); g.fillStyle = 'rgba(255,240,220,0.06)'; g.fillRect(i * s + 6, j * s + 6, s * 0.5, 4); } });
  terra.wrapS = terra.wrapT = THREE.RepeatWrapping; terra.repeat.set(3, 3);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshToonMaterial({ map: terra, gradientMap: toon.grad })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; G.add(floor);
  // stucco walls: coral above a turquoise band, with a speckle
  const stucco = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#e98a6b'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2200; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,235,215' : '120,50,30'},${Math.random() * 0.08})`; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
    g.fillStyle = '#2f8f8a'; g.fillRect(0, h * 0.72, w, h * 0.28); g.fillStyle = '#f5e6c8'; g.fillRect(0, h * 0.7, w, h * 0.025); });
  const wallMat = new THREE.MeshToonMaterial({ map: stucco, gradientMap: toon.grad });
  for (const [x, z, ry] of [[0, -D / 2, 0], [0, D / 2, Math.PI], [-W / 2, 0, Math.PI / 2], [W / 2, 0, -Math.PI / 2]]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat); w.position.set(x, H / 2, z); w.rotation.y = ry; G.add(w); }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), toon('#5a3a26')); ceil.rotation.x = Math.PI / 2; ceil.position.y = H; G.add(ceil);
  const top = new THREE.Group(); G.add(top);   // everything up near the ceiling (hidden when the camera rises above it)
  for (let i = -3; i <= 3; i++) M(new THREE.BoxGeometry(0.14, 0.16, D), toon('#6b4226'), i * 1.1, H - 0.08, 0, top, 0);   // beams
  // windows with open louvred shutters onto an evening sky
  const sky = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#26306b'); gr.addColorStop(0.55, '#c65a7a'); gr.addColorStop(1, '#ffb36b'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1f1a2e'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 16) g.lineTo(x, h * 0.86 - Math.sin(x * 0.05) * 6); g.lineTo(w, h); g.fill();
    g.strokeStyle = '#1f1a2e'; g.lineWidth = 5; g.beginPath(); g.moveTo(w * 0.7, h); g.quadraticCurveTo(w * 0.74, h * 0.6, w * 0.68, h * 0.38); g.stroke(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; g.beginPath(); g.moveTo(w * 0.68, h * 0.38); g.quadraticCurveTo(w * 0.68 + Math.cos(a) * 30, h * 0.38 + Math.sin(a) * 14 - 10, w * 0.68 + Math.cos(a) * 52, h * 0.38 + Math.sin(a) * 26 + 6); g.stroke(); }
    for (let k = 0; k < 20; k++) { g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(Math.random() * w, Math.random() * h * 0.4, 2, 2); } });
  const shutter = toon('#2f8f8a'), frame = toon('#f5e6c8');
  const windowAt = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 1.75, z); g.rotation.y = ry; G.add(g);
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.2), new THREE.MeshBasicMaterial({ map: sky })); pane.position.z = 0.01; g.add(pane);
    M(new THREE.BoxGeometry(1.24, 0.08, 0.08), frame, 0, 0.64, 0.04, g, 0.01); M(new THREE.BoxGeometry(1.3, 0.08, 0.16), frame, 0, -0.64, 0.06, g, 0.01); M(new THREE.BoxGeometry(0.06, 1.2, 0.06), frame, 0, 0, 0.04, g, 0.008);
    for (const s of [-1, 1]) { const sh = new THREE.Group(); sh.position.set(s * 0.58, 0, 0.05); sh.rotation.y = s * -1.1; g.add(sh); M(new THREE.BoxGeometry(0.56, 1.24, 0.04), shutter, s * 0.28, 0, 0, sh, 0.012);
      for (let k = 0; k < 9; k++) M(new THREE.BoxGeometry(0.48, 0.03, 0.02), toon('#257470'), s * 0.28, -0.5 + k * 0.125, 0.03, sh, 0); } };
  windowAt(-1.6, -D / 2 + 0.02, 0); windowAt(1.6, -D / 2 + 0.02, 0); windowAt(-W / 2 + 0.02, -0.6, Math.PI / 2);
  // string lights in swags across the ceiling
  const bulbs = []; const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe3a0 });
  for (const [a, b] of [[[-3.4, 2.75, -3.4], [3.4, 2.75, 3.4]], [[3.4, 2.75, -3.4], [-3.4, 2.75, 3.4]], [[-3.4, 2.7, 0], [3.4, 2.7, 0]]]) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), pts = [];
    for (let k = 0; k <= 24; k++) { const t = k / 24, p = A.clone().lerp(B, t); p.y -= Math.sin(t * Math.PI) * 0.45; pts.push(p); }
    const curve = new THREE.CatmullRomCurve3(pts); top.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.007, 4), toon('#1a1626')));
    for (let k = 1; k < 24; k += 2) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), bulbMat); b.position.copy(pts[k]).y -= 0.05; top.add(b); bulbs.push(b); } }
  // ceiling fan
  const fan = new THREE.Group(); fan.position.set(0, H - 0.45, 0); top.add(fan); M(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), toon('#3a2a1a'), 0, 0.2, 0, fan, 0.006, 0.02); M(new THREE.CylinderGeometry(0.12, 0.1, 0.12, 12), toon('#3a2a1a'), 0, 0, 0, fan, 0.01, 0.12);
  const blades = new THREE.Group(); fan.add(blades); for (let k = 0; k < 5; k++) { const b = M(new THREE.BoxGeometry(0.62, 0.012, 0.14), toon('#8a5a2c'), 0, 0, 0, blades, 0.006); b.position.set(Math.cos(k / 5 * Math.PI * 2) * 0.4, -0.02, Math.sin(k / 5 * Math.PI * 2) * 0.4); b.rotation.y = -k / 5 * Math.PI * 2; b.rotation.x = 0.12; }
  const lamp = new THREE.PointLight(0xffd59a, 1.4, 6, 1.6); lamp.position.set(0, 2.3, 0); G.add(lamp);
  const shade = M(new THREE.ConeGeometry(0.3, 0.2, 16, 1, true), toon('#c9a24a', { side: THREE.DoubleSide }), 0, 2.32, 0, G, 0.01, 0.3); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), bulbMat); bulb.position.set(0, 2.24, 0); G.add(bulb);
  M(new THREE.CylinderGeometry(0.005, 0.005, H - 2.42, 4), toon('#1a1626'), 0, (H + 2.42) / 2, 0, top, 0);
  // the domino table: wood frame, green felt, a raised lip so tiles never slide off; four stools
  const wood = toon('#6b3a1e'), woodL = toon('#8a5a2c');
  M(new THREE.BoxGeometry(1.72, 0.06, 1.72), wood, 0, TABLE_Y - 0.03, 0, G, 0.018);
  const felt = new THREE.Mesh(new THREE.PlaneGeometry(FELT, FELT), new THREE.MeshToonMaterial({ map: canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#1f6b46'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.05})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.strokeStyle = 'rgba(255,230,160,0.18)'; g.lineWidth = 3; g.strokeRect(18, 18, w - 36, h - 36); }), gradientMap: toon.grad }));
  felt.rotation.x = -Math.PI / 2; felt.position.y = FELT_Y - 0.0015; felt.receiveShadow = true; G.add(felt);
  for (const [x, z, sx, sz] of [[0, -0.8, 1.72, 0.12], [0, 0.8, 1.72, 0.12], [-0.8, 0, 0.12, 1.48], [0.8, 0, 0.12, 1.48]]) M(new THREE.BoxGeometry(sx, 0.05, sz), woodL, x, TABLE_Y + 0.02, z, G, 0.01);   // lip
  for (const [x, z] of [[-0.72, -0.72], [0.72, -0.72], [-0.72, 0.72], [0.72, 0.72]]) M(new THREE.BoxGeometry(0.08, TABLE_Y - 0.06, 0.08), wood, x, (TABLE_Y - 0.06) / 2, z, G, 0.012);
  for (const s of Object.values(SIDES)) { const x = s[0] * SEAT_D, z = s[1] * SEAT_D; M(new THREE.CylinderGeometry(0.27, 0.27, 0.07, 18), toon('#c8402a'), x, 0.56, z, G, 0.02, 0.27); M(new THREE.CylinderGeometry(0.05, 0.08, 0.52, 8), wood, x, 0.26, z, G, 0.015, 0.06); M(new THREE.TorusGeometry(0.17, 0.015, 6, 16).rotateX(Math.PI / 2), wood, x, 0.22, z, G, 0); }
  // props: potted palm, a radio on a shelf, a chalk scoreboard, a bench, a crate of mangoes
  const palm = new THREE.Group(); palm.position.set(-2.6, 0, -2.6); G.add(palm); M(new THREE.CylinderGeometry(0.3, 0.22, 0.5, 14), toon('#b4532a'), 0, 0.25, 0, palm, 0.015, 0.3);
  const trunk = [[0, 0.5, 0], [0.05, 1.1, 0.02], [0.12, 1.7, 0.05], [0.1, 2.2, 0.08]]; for (let k = 0; k < 3; k++) { const a = new THREE.Vector3(...trunk[k]), b = new THREE.Vector3(...trunk[k + 1]), m = M(new THREE.CylinderGeometry(0.06, 0.075, a.distanceTo(b), 8), toon('#7a5a32'), 0, 0, 0, palm, 0.01, 0.07); m.position.copy(a).lerp(b, 0.5); m.lookAt(b); m.rotateX(Math.PI / 2); }
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, leaf = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.24, 6, 1), toon('#2f7a3a', { side: THREE.DoubleSide })); const p = leaf.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setY(i, p.getY(i) * (1 - Math.abs(x) / 0.6)); p.setZ(i, -Math.pow(x + 0.55, 2) * 0.35); } leaf.geometry.translate(0.55, 0, 0); leaf.geometry.computeVertexNormals();
    leaf.position.set(0.1, 2.2, 0.08); leaf.rotation.set(0, a, -0.35); palm.add(leaf); }
  M(new THREE.BoxGeometry(1.2, 0.05, 0.3), woodL, 2.4, 1.5, -D / 2 + 0.16, G, 0.01);
  const radio = new THREE.Group(); radio.position.set(2.2, 1.525, -D / 2 + 0.17); G.add(radio); M(new THREE.BoxGeometry(0.5, 0.3, 0.2), toon('#8a2a2a'), 0, 0.15, 0, radio, 0.012); M(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16).rotateX(Math.PI / 2), toon('#e6d2a8'), -0.1, 0.15, 0.1, radio, 0.006, 0.09); for (let k = 0; k < 3; k++) M(new THREE.BoxGeometry(0.03, 0.03, 0.02), toon('#e6b45a'), 0.08 + k * 0.05, 0.12, 0.1, radio, 0);
  M(new THREE.CylinderGeometry(0.004, 0.004, 0.4, 4), toon('#cfcfcf'), 0.18, 0.45, 0, radio, 0).rotation.z = -0.4;
  const chalk = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), new THREE.MeshBasicMaterial({ map: canvasTex(512, 384, (g, w, h) => { g.fillStyle = '#23302a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a5a2c'; g.lineWidth = 22; g.strokeRect(0, 0, w, h); g.fillStyle = '#f2efe6'; g.font = `900 52px ${FONT}`; g.fillText('DOMINÓ', 40, 86); g.font = `700 34px ${FONT}`;
    [['PIP', 4], ['HOPE', 6], ['NOBLE', 9]].forEach(([n, k], i) => { g.fillText(n, 40, 160 + i * 66); for (let j = 0; j < k; j++) { const x = 220 + Math.floor(j / 5) * 70 + (j % 5) * 12; if (j % 5 === 4) { g.fillRect(x - 52, 140 + i * 66, 60, 4); } else g.fillRect(x, 128 + i * 66, 4, 40); } }); }) }));
  chalk.position.set(W / 2 - 0.02, 1.7, 1.2); chalk.rotation.y = -Math.PI / 2; G.add(chalk);
  M(new THREE.BoxGeometry(1.6, 0.08, 0.42), woodL, 1.9, 0.46, D / 2 - 0.4, G, 0.012); for (const x of [1.2, 2.6]) M(new THREE.BoxGeometry(0.08, 0.42, 0.36), wood, x, 0.21, D / 2 - 0.4, G, 0.01);
  const crate = new THREE.Group(); crate.position.set(-2.5, 0, 2.4); G.add(crate); M(new THREE.BoxGeometry(0.6, 0.34, 0.44), toon('#b08a52'), 0, 0.17, 0, crate, 0.012); for (let k = 0; k < 9; k++) M(new THREE.SphereGeometry(0.07, 10, 8), toon(k % 3 ? '#f2a03a' : '#d9582b'), -0.2 + (k % 3) * 0.2 + rr(-0.03, 0.03), 0.38, -0.13 + Math.floor(k / 3) * 0.13, crate, 0.008, 0.07);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.42), new THREE.MeshBasicMaterial({ map: canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#2f8f8a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f5e6c8'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#f5e6c8'; g.font = `900 60px ${FONT}`; g.textBaseline = 'middle'; g.fillText('DOMINOES', 30, h / 2 + 4); g.fillStyle = '#ec3013'; g.fillRect(w - 96, 26, 70, 76); g.fillStyle = '#fff'; [[w - 74, 46], [w - 48, 82]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); }); g.fillRect(w - 92, 62, 62, 3); }) }));
  sign.position.set(0, 2.7, -D / 2 + 0.02); G.add(sign);
  return { group: G, lamp, shade, bulb, fan: blades, bulbs, top, W, D, H };
}

// ================================================================================================
export async function createDominoesClub({ container, onState = () => {}, opts = {} } = {}) {
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch || devicePixelRatio < 2 }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.75 : 2)); renderer.setSize(CW(), CH());
  renderer.shadowMap.enabled = !touch; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1b1420'); const camera = new THREE.PerspectiveCamera(42, CW() / CH(), 0.03, 60);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); }; toon.grad = grad;
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  M.scene = scene;
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  scene.add(new THREE.HemisphereLight(0xffe9d6, 0x3a2a3a, 1.05)); const sun = new THREE.DirectionalLight(0xfff0d8, 1.2); sun.position.set(-2.5, 6, 2); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5 }); scene.add(sun);
  const room = buildParlor({ toon, M, scene });
  const rim = new THREE.DirectionalLight(0xff9fb8, 0.45); rim.position.set(2, 3.5, -5); scene.add(rim); const rim2 = new THREE.DirectionalLight(0xffd9a8, 0.35); rim2.position.set(-2, 3, 5); scene.add(rim2);
  const pool1 = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: glowTex, color: 0xffc77a, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })); pool1.position.y = 0.012; scene.add(pool1);
  const bulbGlow = room.bulbs.map(b => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd38a, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.22); s.position.copy(b.position); scene.add(s); return s; });
  const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false, transparent: true, map: (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; })() })); bubble.scale.set(0.5, 0.25, 1); bubble.renderOrder = 45; bubble.visible = false; scene.add(bubble);
  function drawBubble(k) { const c = bubble.material.map.userData.c, g = c.getContext('2d'); g.clearRect(0, 0, 256, 128); g.fillStyle = '#fbf4e4'; g.strokeStyle = '#1a1626'; g.lineWidth = 7; g.beginPath(); g.ellipse(128, 56, 112, 46, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(70, 112, 10, 0, 7); g.fill(); g.stroke();
    for (let i = 0; i < 3; i++) { g.fillStyle = i === k ? '#ec3013' : '#1a1626'; g.beginPath(); g.arc(80 + i * 48, 56, 13, 0, 7); g.fill(); } bubble.material.map.needsUpdate = true; }

  // ---------- state ----------
  let prefs = { sound: true, music: true, speak: false, theme: 'wood', colour: false, oneTap: true, autoDraw: false, privacy: true, view: 'play', mode: 'fives', target: 100, foxes: ['hope'], localN: 2 };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')); } catch (e) {}
  if (!Array.isArray(prefs.foxes) || !prefs.foxes.length) prefs.foxes = ['hope']; prefs.foxes = prefs.foxes.filter(id => OPPONENTS.some(o => o.id === id)).slice(0, 3); if (!prefs.foxes.length) prefs.foxes = ['hope'];
  if (!TARGETS.includes(prefs.target)) prefs.target = 100;
  const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {} };
  let game = new Dominoes({ n: 2, mode: prefs.mode, target: prefs.target, seed: 7 }), phase = 'menu', mode = 'cpu', seats = ['you', 'hope'], me = 0, pov = 0, practice = false, over = null;
  let sel = null, hint = null, cpuBusy = false, cpuTok = 0, anims = [], say = null, live = '', flash = null, cover = false, started = 0, cursor = -1, safe = { top: 0, bottom: 0, left: 0, right: 0 }, demo = null, demoTok = 0, demoSeen = new Set(), lastEmit = 0;

  // ---------- tiles: 28 faces you can read, and blank stand-ins for tiles nobody may see ----------
  const FACE_PX = 256, faceCans = [], faceMats = [];
  const sideMat = new THREE.MeshToonMaterial({ color: '#efe5cf', gradientMap: grad }), backTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#7a1f2b'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e6b45a'; g.lineWidth = 6; g.strokeRect(12, 12, w - 24, h - 24); g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(w / 2, h / 2, 14, 0, 7); g.fill(); g.strokeStyle = 'rgba(230,180,90,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(28, h / 2); g.lineTo(w / 2 - 22, h / 2); g.moveTo(w / 2 + 22, h / 2); g.lineTo(w - 28, h / 2); g.stroke(); });
  const backMat = new THREE.MeshToonMaterial({ map: backTex, gradientMap: grad }), blankMat = new THREE.MeshToonMaterial({ color: '#fbf6ea', gradientMap: grad });
  const PIPXY = { 0: [], 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [1, 0], [2, 0], [0, 2], [1, 2], [2, 2]] };
  function drawFace(id) { const c = faceCans[id] || (faceCans[id] = document.createElement('canvas')); c.width = FACE_PX; c.height = FACE_PX / 2; const g = c.getContext('2d'), W = FACE_PX, H = FACE_PX / 2, [a, b] = TILES[id], hc = prefs.theme === 'contrast';
    g.fillStyle = hc ? '#ffffff' : '#fbf6ea'; g.fillRect(0, 0, W, H); const sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(255,255,255,0.35)'); sh.addColorStop(1, 'rgba(120,90,50,0.12)'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
    g.fillStyle = hc ? '#000' : '#2a2230'; g.fillRect(W / 2 - 3, 12, 6, H - 24); g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(W / 2, H / 2, 8, 0, 7); g.fill(); g.strokeStyle = '#1a1626'; g.lineWidth = 2; g.stroke();
    const half = (v, x0) => { for (const [cx, cy] of PIPXY[v]) { const x = x0 + 26 + cx * 38, y = 26 + cy * 38; g.fillStyle = prefs.colour ? PIP_COL[v] : (hc ? '#000' : '#1a1626'); g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.arc(x - 3, y - 3, 4, 0, 7); g.fill(); } };
    half(a, 0); half(b, W / 2);   // pip a on the left half (the tile's -x end), b on the right
    if (!faceMats[id]) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; faceMats[id] = new THREE.MeshToonMaterial({ map: t, gradientMap: grad }); } else faceMats[id].map.needsUpdate = true; }
  for (let id = 0; id < 28; id++) drawFace(id);
  const tileGeo = new THREE.BoxGeometry(2 * U, TH, U);
  function makeTile(face) { const g = new THREE.Group(), m = new THREE.Mesh(tileGeo, [sideMat, sideMat, face, backMat, sideMat, sideMat]); m.castShadow = !touch; addOutline(m, 0.0035); g.add(m); g.userData.mesh = m; g.visible = false; scene.add(g); return g; }
  const known = TILES.map((_, id) => makeTile(faceMats[id])), blanks = TILES.map(() => makeTile(blankMat));
  known.forEach((g, id) => g.userData.id = id);
  // poses
  const Q = new THREE.Quaternion(), E = new THREE.Euler(), M4 = new THREE.Matrix4();
  const qY = th => new THREE.Quaternion().setFromEuler(E.set(0, th, 0));
  const qLine = v => { const [a] = TILES[v.id]; return v.axis === 'x' ? qY(v.neg === a ? 0 : Math.PI) : qY(v.neg === a ? -Math.PI / 2 : Math.PI / 2); };
  const qStand = s => { const X = V3(0, 1, 0), Y = V3(s[0], 0, s[1]), Z = X.clone().cross(Y); return new THREE.Quaternion().setFromRotationMatrix(M4.makeBasis(X, Y, Z)); };
  const qDown = th => new THREE.Quaternion().setFromEuler(E.set(Math.PI, th, 0, 'YXZ'));
  const qReveal = s => qY(Math.atan2(-s[1], s[0]));
  const sideOf = k => SEATS_FOR[game.n][k] || 'S', sv = k => SIDES[sideOf(k)];
  const handSlot = (k, j, c) => { const s = sv(k), t = [-s[1], s[0]], sp = Math.min(0.052, 0.95 / Math.max(1, c)), o = (j - (c - 1) / 2) * sp; return V3(s[0] * ROW_D + t[0] * o, FELT_Y + U, s[1] * ROW_D + t[1] * o); };
  const revealSlot = (k, j, c) => { const s = sv(k), t = [-s[1], s[0]], sp = Math.min(0.05, 1.15 / Math.max(1, c)), o = (j - (c - 1) / 2) * sp; return V3(s[0] * ROW_D * 0.98 + t[0] * o, FELT_Y + TH / 2, s[1] * ROW_D * 0.98 + t[1] * o); };
  const jit = (j, k = 1) => { const h = Math.sin(j * 91.7 + k * 13.1) * 43758.5; return (h - Math.floor(h)) - 0.5; };
  let boneSide = 0;   /* the boneyard sits in the far-right corner as seen by whoever was watching when the hand was dealt */
  const boneSlot = j => { const col = j % 4, row = Math.floor(j / 4) % 4, layer = Math.floor(j / 16), s = sv(boneSide), rgt = [s[1], -s[0]], a = 0.47 + col * 0.062 + jit(j) * 0.01, b = 0.46 + row * 0.112 + jit(j, 2) * 0.012; return V3(rgt[0] * a - s[0] * b, FELT_Y + TH / 2 + layer * TH, rgt[1] * a - s[1] * b); };
  const boneRot = j => { const s = sv(boneSide); return Math.atan2(s[0], s[1]) + Math.PI / 2 + jit(j, 3) * 0.25; };
  const rackPos = () => { const s = sv(Math.max(0, me)); return V3(s[0] * 0.95, FELT_Y + 0.08, s[1] * 0.95); };
  let lay = layoutLine(game.line);
  const linePos = v => V3(v.x * U, FELT_Y + TH / 2 + (v.over ? TH : 0), v.z * U);
  // blank stand-ins keep their slot (stable), so a drawn tile visibly travels from the boneyard to the drawer
  let slotMap = new Map(), freeBl = blanks.map((_, i) => i);
  function poseAll(ev = null, instant = false) {
    lay = layoutLine(game.line); const want = new Map(), kt = new Map();   // slot key → pose for blanks, id → pose for known
    const showHands = game.phase !== 'play';
    for (const [id, v] of lay.tiles) kt.set(id, { p: linePos(v), q: qLine({ ...v, id }), vis: true });
    for (let k = 0; k < game.n; k++) { const h = game.hands[k], c = h.length;
      if (showHands) { h.forEach((id, j) => { if (id >= 0) kt.set(id, { p: revealSlot(k, j, c), q: qReveal(sv(k)), vis: true }); }); continue; }
      if (k === me) { h.forEach(id => { if (id >= 0) kt.set(id, { p: rackPos(), q: qStand(sv(k)), vis: false }); }); continue; }
      for (let j = 0; j < c; j++) want.set('h' + k + '.' + j, { p: handSlot(k, j, c), q: qStand(sv(k)), vis: true }); }
    for (let j = 0; j < game.boneN; j++) want.set('b' + j, { p: boneSlot(j), q: qDown(boneRot(j)), vis: true });
    // free slots that went away; remember where they were (a played or drawn tile starts there)
    const gone = new Map(); for (const [key, bi] of slotMap) if (!want.has(key)) { gone.set(key, blanks[bi].position.clone()); blanks[bi].visible = false; slotMap.delete(key); freeBl.unshift(bi); }
    for (const [key, pose] of want) { let bi = slotMap.get(key); const fresh = bi == null; if (fresh) { bi = freeBl.shift(); slotMap.set(key, bi); } const o = blanks[bi];
      if (fresh && !o.visible) { const from = ev && ev.k === 'draw' && key.startsWith('h') ? boneSlot(game.boneN) : ev && ev.k === 'deal' ? V3(rr(-0.15, 0.15), FELT_Y + TH / 2, rr(-0.15, 0.15)) : pose.p; o.position.copy(from); o.quaternion.copy(ev && ev.k === 'deal' ? qDown(rr(0, 6)) : pose.q); }
      o.visible = true; go(o, pose, instant, ev && ev.k === 'deal' ? 0.25 + Math.random() * 0.5 : 0); }
    known.forEach((o, id) => { const pose = kt.get(id);
      if (!pose) { if (o.visible) { o.visible = false; } return; }
      if (!o.visible && pose.vis) {   // appearing: from where it really came from
        let from = null; if (ev && ev.k === 'play' && ev.id === id) from = ev.p === me ? rackPos() : (gone.get('h' + ev.p + '.' + game.hands[ev.p].length) || handSlot(ev.p, 0, 1));
        if (!from && ev && ev.k === 'end') { from = null; }
        o.position.copy(from || pose.p); o.quaternion.copy(from && ev.p !== me ? qStand(sv(ev.p)) : pose.q); }
      if (!o.visible && !pose.vis && ev && ev.k === 'draw' && ev.id === id && ev.p === me) { o.position.copy(gone.get('b' + game.boneN) || boneSlot(game.boneN)); o.quaternion.copy(qDown(0)); o.visible = true; go(o, pose, instant, 0, true); return; }
      if (!pose.vis) { o.position.copy(pose.p); o.visible = false; return; }
      o.visible = true; go(o, pose, instant, 0); });
    placeMarkers();
  }
  function go(o, pose, instant, delay = 0, hideEnd = false) {
    const d = o.position.distanceTo(pose.p), dq = o.quaternion.angleTo(pose.q); anims = anims.filter(a => a.o !== o);
    if (instant || (d < 0.002 && dq < 0.01)) { o.position.copy(pose.p); o.quaternion.copy(pose.q); if (hideEnd) o.visible = false; return; }
    anims.push({ o, a: o.position.clone(), b: pose.p.clone(), qa: o.quaternion.clone(), qb: pose.q.clone(), t: -delay, dur: clamp(0.22 + d * 0.5, 0.25, 0.6), hop: Math.min(0.12, 0.03 + d * 0.12), hideEnd, land: d > 0.05 });
  }
  function flushAnims() { for (const a of anims) { a.o.position.copy(a.b); a.o.quaternion.copy(a.qb); if (a.hideEnd) a.o.visible = false; } anims = []; }
  // glowing places the selected tile can go, and the open-end markers
  const markMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.55, depthWrite: false }), markHint = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, depthWrite: false });
  const markers = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(U * 1.6, U * 1.6).rotateX(-Math.PI / 2), markMat); m.renderOrder = 30; m.visible = false; const ring = new THREE.Mesh(new THREE.RingGeometry(U * 0.95, U * 1.15, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })); ring.position.y = 0.0005; m.add(ring); scene.add(m); return m; });
  let markArms = [];
  function placeMarkers() { markArms = []; const opts = selPlacements(); markers.forEach(m => m.visible = false); if (!opts.length || opts[0].arm === 'C') return;
    opts.forEach((o, i) => { const e = lay.ends[o.arm]; if (!e || !markers[i]) return; const m = markers[i]; m.position.set(e.x * U + e.dx * U * 0.5, FELT_Y + 0.003, e.z * U + e.dz * U * 0.5); m.material = hint && hint.id === sel && hint.arm === o.arm ? markHint : markMat; m.visible = true; markArms.push({ arm: o.arm, m }); }); }
  // floating "+15" when All Fives scores
  const popCan = document.createElement('canvas'); popCan.width = 256; popCan.height = 128; const popTex = new THREE.CanvasTexture(popCan); popTex.colorSpace = THREE.SRGBColorSpace;
  const pop = new THREE.Sprite(new THREE.SpriteMaterial({ map: popTex, transparent: true, depthTest: false })); pop.scale.set(0.36, 0.18, 1); pop.renderOrder = 40; pop.visible = false; scene.add(pop); let popT = 0;
  function popScore(txt, col = '#ffd23a') { const g = popCan.getContext('2d'); g.clearRect(0, 0, 256, 128); g.font = `900 84px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 12; g.strokeStyle = '#1a1626'; g.strokeText(txt, 128, 66); g.fillStyle = col; g.fillText(txt, 128, 66); popTex.needsUpdate = true; pop.visible = true; popT = 1.6; pop.position.set(0, FELT_Y + 0.12, 0); }

  // ---------- foxes ----------
  let rigs = {}; try { rigs = await loadCastRigs(); } catch (e) {}
  const CK = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs), foxes = {};
  const FOXDEF = {
    player: () => kit.makeFox({ ...CAST.player, gear: 'none' }),
    pip: () => kit.makeFox({ key: 'pip', torso: ['#ffd23a', '#fff7d6', '#b45309'], crest: '8', look: { ...PLAYER_FEMALE, bodyScale: (PLAYER_FEMALE.bodyScale || 1) * 0.86 }, outfit: 'vest', eyes: ['#22c55e', '#22c55e'], mood: 'excited' }),
    hope: () => kit.makeFox({ ...CAST.hope }), noble: () => CK.make('noble'),
  };
  NET_COLS.forEach(([n, col], i) => FOXDEF['net' + i] = () => kit.makeFox({ key: 'net' + i, torso: [col, '#f3f2f2', '#201e1d'], crest: '8', look: i % 2 ? PLAYER_FEMALE : PLAYER_MALE, outfit: 'vest', eyes: ['#38bdf8', '#38bdf8'], mood: 'happy' }));
  function fox(id) { if (!foxes[id]) { const f = FOXDEF[id](); f.visible = false; f.userData.id = id; f.userData.lookAt = BOARD_LOOK; foxes[id] = f; } return foxes[id]; }
  const cane = new THREE.Group(); { M(new THREE.CylinderGeometry(0.022, 0.022, 1.25, 8), toon('#f8fafc'), 0, 0.62, 0, cane, 0.01, 0.022); M(new THREE.CylinderGeometry(0.0225, 0.0225, 0.2, 8), toon('#dc2626'), 0, 0.12, 0, cane, 0.01, 0.0225); M(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8), toon('#1f2937'), 0, 1.2, 0, cane, 0.01, 0.03); cane.rotation.z = -0.32; scene.add(cane); cane.visible = false; }
  let standing = [];
  const foxIdAt = k => { const s = seats[k]; if (!s) return null; if (mode === 'cpu') return k === 0 ? 'player' : s; if (mode === 'demo') return s; if (mode === 'local') return 'net' + k; if (mode === 'net') return 'net' + NET.slotOf(s); return null; };
  function placeFoxes() {
    for (const f of Object.values(foxes)) f.visible = false; cane.visible = false;
    const menuish = phase === 'menu' || phase === 'room';
    if (phase === 'room' && NET.state) { NET.state.seats.forEach((id, k) => { if (!id) return; const f = fox('net' + NET.slotOf(id)), s = SIDES[SEATS_FOR[4][k]]; f.visible = true; f.position.set(s[0] * SEAT_D, -0.14, s[1] * SEAT_D); f.rotation.y = Math.atan2(-s[0], -s[1]); f.userData.sit = true; f.userData.seat = k; });
      standing.forEach((id, i) => { const f = fox(id); f.visible = true; f.userData.sit = false; f.position.set(-1.9, 0, [0.4, -0.5, 1.3][i] || 0); f.rotation.y = Math.atan2(-f.position.x, -f.position.z); }); return; }
    for (let k = 0; k < game.n; k++) { const id = foxIdAt(k); if (!id) continue; if (!menuish && k === pov) continue;   /* you sit where the camera is */
      if (menuish && mode === 'cpu' && k === 0) continue;
      const f = fox(id), s = sv(k), chair = !!f.userData.chair, d = chair ? SEAT_D * 1.12 : SEAT_D; f.visible = true; f.position.set(s[0] * d, chair ? 0 : -0.14, s[1] * d); f.rotation.y = Math.atan2(-s[0], -s[1]); f.userData.sit = !chair; f.userData.seat = k;
      if (id === 'hope') { cane.visible = true; const t = [-s[1], s[0]]; cane.position.set(s[0] * 0.95 + t[0] * 0.55, 0, s[1] * 0.95 + t[1] * 0.55); } }
    standing.forEach((id, i) => { const f = fox(id); f.visible = true; f.userData.sit = false; f.userData.seat = null; f.position.set(-1.9, 0, [0.4, -0.5, 1.3][i] || 0); f.rotation.y = Math.atan2(-f.position.x, -f.position.z); });
  }
  const oppById = id => OPPONENTS.find(o => o.id === id);
  function foxOn(k) { const id = foxIdAt(k); return id && foxes[id] && foxes[id].visible ? foxes[id] : null; }
  function mood(k, m, secs = 2.4) { const f = foxOn(k); if (!f) return; f.userData.mood = m; f.userData.moodT = secs; if (m === 'excited') f.userData.hop = 1; }
  function talk(k, text, who) { const f = foxOn(k); if (f) f.userData.say = { text, t: 0 }; say = { who: who || '', text, t: Math.max(2.6, text.length * 0.07) }; emit(); }
  function line(k, key, chance = 1) { if (Math.random() > chance) return; const O = (mode === 'cpu' || mode === 'demo') && oppById(seats[k]); if (!O) return; const L = O.lines[key]; if (L) talk(k, pick(L), O.name); }
  const nameOf = k => { if (k == null || k < 0) return ''; if (mode === 'cpu') return k === 0 ? 'YOU' : (oppById(seats[k]) || {}).name || 'FOX'; if (mode === 'demo') return (oppById(seats[k]) || {}).name || ''; if (mode === 'local') return 'PLAYER ' + (k + 1); if (mode === 'net') return seats[k] ? NET.nameOf(seats[k]) : 'EMPTY'; return ''; };
  const colOf = k => mode === 'net' && seats[k] ? (NET_COLS[NET.slotOf(seats[k])] || NET_COLS[0])[1] : mode === 'local' ? NET_COLS[k][1] : k === 0 && mode === 'cpu' ? '#ffffff' : ({ pip: '#ffd23a', hope: '#38bdf8', noble: '#a78bfa' })[seats[k]] || '#cfcac2';

  // ---------- sound + speech ----------
  const urlMusic = !/[?&]music=0/.test(location.search), urlSfx = !/[?&]sfx=0/.test(location.search);
  const audio = createDominoesAudio({ sound: prefs.sound && urlSfx, music: prefs.music && urlMusic });
  const unlockAll = () => audio.unlock(); document.addEventListener('pointerdown', unlockAll, true); document.addEventListener('keydown', unlockAll, true);
  const uiClick = e => { if (e.target && e.target.closest && e.target.closest('button')) audio.sfx('ui'); }; document.addEventListener('click', uiClick, true);
  const buzz = ms => { try { if (mode !== 'demo' && navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(ms); } catch (e) {} };
  function sfx(k, o) { audio.sfx(k, o); if (k === 'tile') buzz(8); else if (k === 'domino') buzz([20, 40, 30]); }
  function speak(text) { if (!prefs.speak || !text || !window.speechSynthesis) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.05; u.onstart = () => audio.duck(true); u.onend = u.onerror = () => audio.duck(false); speechSynthesis.speak(u); } catch (e) {} }
  const ARMW = { L: 'left', R: 'right', U: 'top', D: 'bottom', C: 'centre' };
  const NUMW = n => n >= 0 && n <= 20 ? ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'][n] : String(n);
  function describe(ev) { if (!ev) return ''; const who = ev.p === me && mode !== 'demo' && mode !== 'local' ? 'You' : nameOf(ev.p).charAt(0) + nameOf(ev.p).slice(1).toLowerCase();
    if (ev.k === 'play') return who + (who === 'You' ? ' play ' : ' plays ') + tileWords(ev.id) + (ev.arm === 'C' ? ' to lead' : '') + (ev.pts ? '. ' + NUMW(ev.pts) + ' points!' : game.mode === 'fives' ? '. Ends add to ' + ev.count + '.' : '.');
    if (ev.k === 'draw') return who + (who === 'You' ? ' draw' : ' draws') + (ev.id >= 0 && ev.p === me ? ' ' + tileWords(ev.id) : ' from the boneyard') + '.';
    if (ev.k === 'pass') return who + (who === 'You' ? ' pass.' : ' passes.'); return ''; }

  // ---------- camera ----------
  const fitCam = new THREE.PerspectiveCamera(42, 1, 0.05, 60), _p = V3(); let camGoal = { pos: V3(3, 2.4, 3), look: V3(0, FELT_Y, 0) }, camLook = V3(0, FELT_Y, 0), orbitT = 0, camSnap = true;
  function fitShot(pts, el, yaw) {
    const W = CW(), H = CH(); fitCam.aspect = W / H; fitCam.fov = W / H < 0.75 ? 46 : 40; fitCam.updateProjectionMatrix(); const m = 0.03;
    const yT = 1 - 2 * safe.top / H - m, yB = -1 + 2 * safe.bottom / H + m, xR = 1 - 2 * safe.right / W - m, xL = -1 + 2 * safe.left / W + m, sx = (xL + xR) / 2, sy = (yT + yB) / 2;
    const dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), -Math.cos(yaw) * Math.cos(el)), tgt = V3(); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / pts.length);
    const bounds = d => { fitCam.position.copy(tgt).addScaledVector(dir, d); fitCam.lookAt(tgt); fitCam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitCam); if (_p.z > 1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
    const fits = d => { const b = bounds(d); return b && b.x0 >= xL && b.x1 <= xR && b.y0 >= yB && b.y1 <= yT; };
    let d = 3; for (let it = 0; it < 4; it++) { let lo = 0.2, hi = 30; for (let k = 0; k < 20; k++) { const md = (lo + hi) / 2; if (fits(md)) hi = md; else lo = md; } d = hi; const b = bounds(d); if (!b) break;
      const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, th = Math.tan(fitCam.fov * Math.PI / 360) * d, right = V3().setFromMatrixColumn(fitCam.matrixWorld, 0), up = V3().setFromMatrixColumn(fitCam.matrixWorld, 1);
      tgt.addScaledVector(right, (cx - sx) * th * fitCam.aspect).addScaledVector(up, (cy - sy) * th); }
    return { pos: tgt.clone().addScaledVector(dir, d), look: tgt };
  }
  const VIEWS = ['play', 'top', 'table'], port = () => CH() > CW();
  function aimCamera() {
    if (phase === 'menu' || (phase === 'room' && !(NET.state && NET.state.live))) return;
    const s = sv(Math.max(0, pov)), yaw = Math.atan2(s[0], -s[1]), pts = [];
    if (prefs.view === 'table') { const e = 0.85; for (const [x, z] of [[-e, -e], [e, -e], [-e, e], [e, e]]) pts.push(V3(x, FELT_Y, z)); for (let k = 0; k < game.n; k++) if (k !== pov) { const q = sv(k); pts.push(V3(q[0] * SEAT_D, 2.1, q[1] * SEAT_D)); } camGoal = fitShot(pts, 0.62, yaw); return; }
    // the line plus a margin (never smaller than a comfortable minimum), so early tiles are big and the view eases out as the line grows
    let x0 = -6.5, x1 = 6.5, z0 = -5.5, z1 = 5.5; for (const v of lay.tiles.values()) { x0 = Math.min(x0, v.x - 2); x1 = Math.max(x1, v.x + 2); z0 = Math.min(z0, v.z - 2); z1 = Math.max(z1, v.z + 2); }
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) pts.push(V3(x * U, FELT_Y, z * U));
    // the other players' standing tiles (so you can count them) and the boneyard
    const pv = sv(Math.max(0, pov)); for (let k = 0; k < game.n; k++) if (k !== pov) { const q = sv(k), side = Math.abs(q[0] * pv[0] + q[1] * pv[1]) < 0.5, f = side && port() ? 0.62 : 1; pts.push(V3(q[0] * ROW_D * f, FELT_Y + 2 * U, q[1] * ROW_D * f)); }   /* in portrait the side seats' rows may run off the edges */
    camGoal = fitShot(pts, prefs.view === 'top' ? 1.5 : port() ? 1.05 : 0.86, yaw);
  }

  // ---------- who is who ----------
  const isCpuSeat = k => (mode === 'cpu' && k !== 0) || mode === 'demo';
  const humanSeat = k => mode === 'local' || (mode === 'cpu' && k === 0) || (mode === 'net' && seats[k] === NET.me);
  const myTurn = () => phase === 'play' && !over && game.phase === 'play' && game.turn === me && humanSeat(me) && !cover;
  function selPlacements() { if (sel == null || me < 0 || game.phase !== 'play' || game.turn !== me) return []; return game.legal(me).filter(m => m.id === sel); }
  const symmetric = () => game.line.lead != null && !game.line.arms.L.length && !game.line.arms.R.length && TILES[game.line.lead][0] === TILES[game.line.lead][1];

  // ---------- resume ----------
  function storeResume() { if (mode !== 'cpu' && mode !== 'local') return; if (over || game.phase === 'over') return clearResume(); try { localStorage.setItem(RESUME_KEY, JSON.stringify({ mode, cfg: game.toJSON(), seats, practice })); } catch (e) {} }
  function clearResume() { try { localStorage.removeItem(RESUME_KEY); } catch (e) {} }
  function loadResume() { try { const R = JSON.parse(localStorage.getItem(RESUME_KEY) || 'null'); return R && R.cfg && R.seats ? R : null; } catch (e) { return null; } }

  // ---------- starting ----------
  function begin(m, o = {}) {
    cpuTok++; cpuBusy = false; demoTok++; if (m !== 'net') NET.leave(true); flushAnims();
    mode = m; phase = 'play'; over = null; sel = null; hint = null; say = null; flash = null; cover = false; practice = !!o.practice; cursor = -1; demo = null; standing = [];
    if (m === 'cpu') seats = o.seats || ['you', ...(o.foxes || prefs.foxes)];
    else if (m === 'local') seats = o.seats || Array.from({ length: o.n || prefs.localN }, (_, k) => 'p' + k);
    else if (m === 'demo') seats = ['hope', 'pip', 'noble'];
    const cfg = o.cfg || { n: seats.length, mode: m === 'demo' ? 'fives' : (o.gm || prefs.mode), target: m === 'demo' ? 100 : (o.target || prefs.target), seed: (Math.random() * 1e9) >>> 0, log: [] };
    game = new Dominoes(cfg);
    me = m === 'local' ? game.turn : 0; pov = me;
    if (m === 'demo') { demoSeen = new Set(); demo = { key: 'DEMO', cap: 'Hope, Pip and Noble play ALL FIVES. Hope’s tiles are in the rack below. Tap the board or TAKE OVER to play from here.' }; }
    started = 0; placeFoxes(); audio.mood('play');
    const fresh = !(o.cfg && o.cfg.log && o.cfg.log.length);
    slotMap.clear(); freeBl = blanks.map((_, i) => i); blanks.forEach(b => b.visible = false); known.forEach(k => k.visible = false);
    if (fresh) dealAnim(); else { poseAll(null, true); }
    if (m === 'local' && prefs.privacy) cover = true;
    aimCamera(); camSnap = true;
    live = m === 'demo' ? demo.cap : (m === 'cpu' ? 'New match against ' + seats.slice(1).map(id => oppById(id).name).join(', ') : 'Pass and play, ' + game.n + ' players') + '. ' + (game.mode === 'fives' ? 'All Fives' : 'Draw dominoes') + ', first to ' + game.target + '.';
    speak(live); storeResume(); emit();
    setTimeout(() => nextTurn(), fresh ? 1500 : 300);
  }
  function dealAnim() { boneSide = Math.max(0, pov); known.forEach(k => k.visible = false); slotMap.clear(); freeBl = blanks.map((_, i) => i); blanks.forEach(b => b.visible = false); anims = []; sfx('wash'); poseAll({ k: 'deal' }); setTimeout(() => sfx('deal', { n: 7 }), 650); flash = { txt: 'HAND ' + game.handNo, col: '#ffd23a', t: 1.2 }; }
  function toMenu() { cpuTok++; cpuBusy = false; demo = null; demoTok++; NET.leave(true); phase = 'menu'; mode = 'cpu'; over = null; sel = null; hint = null; say = null; cover = false; standing = []; audio.mood('menu');
    seats = ['you', ...prefs.foxes]; game = new Dominoes({ n: seats.length, mode: prefs.mode, target: prefs.target, seed: 7 }); me = 0; pov = 0; flushAnims(); known.forEach(k => k.visible = false); blanks.forEach(b => b.visible = false); slotMap.clear(); freeBl = blanks.map((_, i) => i);
    // a few tiles on the table for the menu: a short line and the boneyard
    poseAll(null, true); placeFoxes(); emit(); }

  // ---------- turns ----------
  function nextTurn() {
    if (phase !== 'play') return;
    if (game.phase === 'hand') { handEnded(); return; }
    if (game.phase === 'over') { matchEnded(); return; }
    const k = game.turn;
    if (mode === 'local' && k !== me) { me = pov = k; sel = null; hint = null; cover = prefs.privacy; poseAll(null); placeFoxes(); aimCamera(); }
    if (isCpuSeat(k)) cpuGo();
    else if (humanSeat(k) && (mode !== 'net' || k === me)) { if (!cover) yourTurn(); }
    emit();
  }
  function yourTurn() { if (game.mustDraw(me) && prefs.autoDraw) { setTimeout(() => { if (myTurn() && game.mustDraw(me)) act({ k: 'draw' }); }, 450); return; }
    if (game.mustPass(me) && prefs.autoDraw) { setTimeout(() => { if (myTurn() && game.mustPass(me)) act({ k: 'pass' }); }, 700); return; }
    sfx('turn'); live = 'Your turn. ' + endsTxt() + (game.mustDraw(me) ? ' Nothing fits: draw.' : game.mustPass(me) ? ' Nothing fits and the boneyard is empty: pass.' : ''); speak(live); }
  const endsTxt = () => { const E = game.ends(); return E.length ? 'Ends: ' + E.map(e => e.v).join(', ') + (game.mode === 'fives' ? ' (count ' + game.count() + ').' : '.') : 'Lead any tile' + (game.mustLead != null ? ': the ' + tileWords(game.mustLead) + ' must lead.' : '.'); };
  function cpuGo() {
    const tok = ++cpuTok, k = game.turn; cpuBusy = true; emit(); const O = oppById(seats[k]) || OPPONENTS[1];
    const must = game.mustDraw(k) || game.mustPass(k), wait = must ? (game.mustDraw(k) ? 520 : 900) : (mode === 'demo' ? rr(1000, 1500) : rr(650, 1150)) + (started ? 0 : 400);
    setTimeout(() => { if (tok !== cpuTok || phase !== 'play' || game.phase !== 'play' || game.turn !== k || over) return; cpuBusy = false;
      if (game.mustDraw(k)) { act({ k: 'draw' }); return; } if (game.mustPass(k)) { act({ k: 'pass' }); return; }
      const m = think(game, k, O.level); if (m) act({ k: 'play', id: m.id, arm: m.arm }); }, wait);
  }
  // apply an action (vs fox / pass & play / demo play it here; online asks the host)
  function act(a) {
    if (mode === 'net') { NET.request({ ...a, ply: NET.ply() }); sel = null; hint = null; emit(); return true; }
    const ev = a.k === 'play' ? game.play(a.id, a.arm) : a.k === 'draw' ? game.draw() : a.k === 'pass' ? game.pass() : a.k === 'next' ? (game.next() ? { k: 'deal' } : null) : null;
    if (!ev) { sfx('bad'); return false; }
    started = 1; sel = null; hint = null; afterEvent(ev); storeResume(); return true;
  }
  function afterEvent(ev) {
    if (ev.k === 'deal') { dealAnim(); if (mode === 'local') { me = pov = game.turn; cover = prefs.privacy; placeFoxes(); } aimCamera(); emit(); setTimeout(nextTurn, 1500); return; }
    poseAll(ev); const k = ev.p, pan = clamp(sv(k)[0] * 0.6, -0.6, 0.6);
    if (ev.k === 'play') { const big = game.phase !== 'play' || ev.pts >= 20; setTimeout(() => sfx('tile', { pan, slam: big, loud: big ? 1.2 : 1 }), 260);
      if (ev.spin) setTimeout(() => sfx('spinner'), 420);
      if (ev.pts) { setTimeout(() => { sfx('score', { pts: ev.pts }); popScore('+' + ev.pts); }, 420); if (mode === 'cpu' && k === 0 && !practice) { try { save.best('dominoesClub.bestFives', ev.pts); } catch (e) {} } if (isCpuSeat(k)) { mood(k, 'happy'); line(k, 'score', 0.45); } else { for (let q = 0; q < game.n; q++) if (isCpuSeat(q)) mood(q, 'surprised', 1.4); } }
      if (game.hands[k] && game.hands[k].length === 1 && game.phase === 'play') flash = { txt: (nameOf(k) === 'YOU' ? 'YOU HAVE' : nameOf(k) + ' HAS') + ' ONE TILE', col: '#ff9a8a', t: 1.4 }; }
    else if (ev.k === 'draw') { setTimeout(() => sfx('draw', { pan }), 60); if (isCpuSeat(k)) line(k, 'draw', 0.18); }
    else if (ev.k === 'pass') { sfx('knock'); flash = { txt: nameOf(k) + ' ' + (nameOf(k) === 'YOU' ? 'PASS' : 'PASSES'), col: '#7dd3fc', t: 1.2 }; if (isCpuSeat(k)) line(k, 'pass', 0.5); }
    // tension: someone down to their last tile
    audio.mood(game.phase === 'play' && game.hands.some(h => h.length === 1) ? 'tense' : 'play');
    live = describe(ev); speak(live);
    if (mode === 'demo') demoAfter(ev);
    aimCamera(); emit();
    setTimeout(nextTurn, ev.k === 'play' ? 420 : 260);
  }
  let handCard = false, handT = 0;
  function handEnded() { if (handCard) return; const L = game.lastHand; if (!L) return;
    flushAnims(); poseAll({ k: 'end' }); sfx(L.blocked ? 'blocked' : 'domino'); popScore(L.winner != null && L.pts ? '+' + L.pts : L.blocked ? 'BLOCKED' : 'DOMINÓ!', L.blocked ? '#7dd3fc' : '#ffd23a');
    flash = { txt: L.blocked ? (L.winner == null ? 'BLOCKED · TIE' : 'BLOCKED') : 'DOMINÓ!', col: L.blocked ? '#7dd3fc' : '#ffd23a', t: 1.4 };
    if (L.winner != null) { if (isCpuSeat(L.winner)) { mood(L.winner, 'excited'); line(L.winner, L.blocked ? 'block' : 'domino'); } else { for (let q = 0; q < game.n; q++) if (isCpuSeat(q)) { mood(q, 'sad'); if (Math.random() < 0.5) line(q, 'lostHand'); } } }
    if (mode === 'cpu' && L.winner === 0 && !L.blocked) { try { save.setStat('dominoesClub.dominos', save.stat('dominoesClub.dominos') + 1); } catch (e) {} }
    live = handLine(L); speak(live); audio.mood('over');
    if (mode === 'local') { cover = false; }
    handT = performance.now(); setTimeout(() => { handCard = true; emit(); }, 1300);
    if (mode === 'demo') { const tok = demoTok; setTimeout(() => { if (mode === 'demo' && tok === demoTok && phase === 'play') { handCard = false; act({ k: 'next' }); } }, 5200); }
    emit(); }
  const handLine = L => L.winner == null ? 'Blocked, and the lightest hands tie. Nobody scores.' : (L.blocked ? 'Blocked. ' + nameOf(L.winner) + ' has the lightest hand' : nameOf(L.winner) + ' went out') + ' and scores ' + L.pts + '.';
  function nextHand() { if (game.phase !== 'hand') return; handCard = false; if (mode === 'net') { NET.request({ k: 'next', ply: NET.ply() }); return; } act({ k: 'next' }); }
  function matchEnded() {
    if (over) return; handCard = false; flushAnims(); poseAll({ k: 'end' }); const w = game.winner, youWin = humanSeat(w) && mode === 'cpu' ? w === 0 : mode === 'net' ? seats[w] === NET.me : false;
    let gold = 0, xp = 0, title = '', sub = '';
    if (mode === 'cpu') { const opp = seats.slice(1).map(oppById); title = youWin ? 'You win the match' : nameOf(w) + ' wins the match';
      if (!practice) { gold = youWin ? opp.reduce((s, o) => s + o.gold, 0) : 0; xp = youWin ? opp.reduce((s, o) => s + o.xp, 0) : 6;
        try { if (gold) save.addGold(gold); if (xp) save.addXp(xp); const k = 'dominoesClub.' + (youWin ? 'w' : 'l'); save.setStat(k, save.stat(k) + 1); save.setStat('dominoesClub.games', save.stat('dominoesClub.games') + 1); if (youWin) for (const o of opp) save.setFlag('dominoesClub.beat.' + o.id); } catch (e) {} }
      sub = practice ? 'Practice match (undo or hint used) · no gold' : youWin ? 'First to ' + game.target + '. The foxes pay up.' : 'First to ' + game.target + '. Shuffle up and go again?';
      for (let q = 1; q < game.n; q++) { mood(q, youWin ? 'sad' : q === w ? 'excited' : 'happy'); } if (isCpuSeat(w)) line(w, 'win'); else { const q = 1 + Math.floor(Math.random() * (game.n - 1)); line(q, 'lose'); } }
    else if (mode === 'net') { title = youWin ? 'You win the match' : nameOf(w) + ' wins the match'; if (seats.includes(NET.me)) { xp = youWin ? 15 : 4; try { save.addXp(xp); const k = 'dominoesClub.online.' + (youWin ? 'w' : 'l'); save.setStat(k, save.stat(k) + 1); } catch (e) {} } sub = 'First to ' + game.target + '.'; }
    else { title = nameOf(w) + ' wins the match'; sub = 'First to ' + game.target + '.'; }
    over = { winner: w, title, sub, gold, xp, scores: [...game.scores] }; flash = { txt: youWin || mode === 'local' || mode === 'demo' ? 'MATCH!' : 'MATCH OVER', col: '#ffd23a', t: 1.6 };
    audio.mood('over'); setTimeout(() => sfx(youWin || mode === 'local' || mode === 'demo' ? 'win' : 'lose'), 600);
    live = title + '. ' + game.scores.map((s, k) => nameOf(k) + ' ' + s).join(', ') + '.'; speak(live); clearResume();
    toParent({ action: 'result', mode, result: mode === 'cpu' || (mode === 'net' && seats.includes(NET.me)) ? (youWin ? 'win' : 'loss') : 'done', winner: w, youWin, scores: [...game.scores], gameMode: game.mode, target: game.target, gold, xp, opponents: mode === 'cpu' ? seats.slice(1) : null });
    if (mode === 'demo') { const tok = demoTok; setTimeout(() => { if (mode === 'demo' && tok === demoTok) begin('demo'); }, 6000); }
    emit(); }

  // ---------- your moves ----------
  function pickTile(id) {
    if (mode === 'demo' && phase === 'play') { takeOver(); return; }
    if (!myTurn()) { if (game.phase === 'play' && game.turn !== me) { sfx('bad'); flash = { txt: 'WAIT FOR ' + nameOf(game.turn), col: '#cfcac2', t: 0.9 }; emit(); } return; }
    const P = game.legal(me).filter(m => m.id === id);
    if (!P.length) { sfx('bad'); flash = { txt: game.ends().length ? 'NO MATCH · ENDS ' + game.ends().map(e => e.v).join(' · ') : 'LEAD THE ' + tileText(game.mustLead), col: '#ff9a8a', t: 1.1 }; live = tileWords(id) + ' does not fit. ' + endsTxt(); speak(live); emit(); return; }
    if (P.length === 1 || symmetric() || (prefs.oneTap && new Set(P.map(m => game.armEnd(m.arm))).size === 1 && false)) { if (prefs.oneTap || sel === id) { act({ k: 'play', id, arm: P[0].arm }); return; } }
    sel = sel === id ? null : id; if (sel != null) { sfx('pick'); live = tileWords(id) + ' fits ' + P.length + ' ends. Tap one of the glowing ends.'; speak(live); } placeMarkers(); emit();
  }
  function placeAt(arm) { const P = selPlacements().find(m => m.arm === arm); if (P) act({ k: 'play', id: P.id, arm }); }
  function undo() {
    if ((mode !== 'cpu' && mode !== 'local') || phase !== 'play' || over) return; const cfg = game.toJSON(), log = cfg.log, r = new Dominoes({ ...cfg, log: [] }), actor = [];
    for (const a of log) { actor.push(a[0] === 'n' ? -2 : r.turn); r.apply(a); }
    let i = log.length - 1, lastN = log.map(a => a[0]).lastIndexOf('n'); for (; i > lastN; i--) if (mode === 'local' || actor[i] === 0) break;
    if (i <= lastN || i < 0) { sfx('bad'); return; }
    cpuTok++; cpuBusy = false; flushAnims(); game = new Dominoes({ ...cfg, log: log.slice(0, i) }); if (mode === 'cpu') practice = true; sel = null; hint = null; handCard = false; cover = false;
    if (mode === 'local') { me = pov = game.turn; placeFoxes(); }
    poseAll(null); aimCamera(); storeResume(); live = 'Taken back. ' + endsTxt(); speak(live); emit(); setTimeout(nextTurn, 250);
  }
  function giveHint() { if (mode !== 'cpu' || !myTurn() || !game.canPlay(me)) return; const m = think(game, me, 'hint'); if (!m) return; practice = true; hint = m; sel = m.id; placeMarkers(); live = 'Hint: ' + tileWords(m.id) + (m.arm !== 'C' ? ' on the ' + game.armEnd(m.arm) : '') + '.'; speak(live); emit(); }

  // ---------- demo: Hope, Pip and Noble play; captions teach each rule the first time it happens ----------
  const TIPS = {
    lead: 'Whoever holds the highest double leads with it. In ALL FIVES a double led is the SPINNER.',
    match: 'Play a tile with a number that matches an open end. The matching halves touch.',
    double: 'Doubles lie crosswise. At an end a double counts both halves.',
    five: 'ALL FIVES: after each play, add up the open ends. A multiple of 5 scores that many points.',
    spinner: 'Both sides of the spinner are played: its top and bottom open too. Now there are four ends.',
    draw: 'Nothing fits? Draw from the boneyard until something does.',
    pass: 'Boneyard empty and nothing fits: knock twice on the table to pass.',
    domino: 'DOMINÓ! First to empty their hand scores the pips left in everyone else’s hands, rounded to 5.',
    blocked: 'Blocked: nobody can play. The lightest hand wins the others’ pips.',
  };
  function demoTip(k) { if (!demo || demoSeen.has(k)) return false; demoSeen.add(k); demo = { ...demo, key: k.toUpperCase(), cap: TIPS[k], tip: true }; speak(TIPS[k]); emit(); return true; }
  function demoAfter(ev) { if (!demo) return; demo = { ...demo, tip: false };
    if (ev.k === 'play') { if (ev.arm === 'C') demoTip('lead'); else if (ev.pts && demoTip('five')) {} else if (isDouble(ev.id) && demoTip('double')) {} else if (game.line.spin && game.line.arms.L.length && game.line.arms.R.length && !game.line.arms.U.length && !game.line.arms.D.length && demoTip('spinner')) {} else demoTip('match');
      if (game.phase === 'hand' && game.lastHand) demoTip(game.lastHand.blocked ? 'blocked' : 'domino'); }
    else if (ev.k === 'draw') demoTip('draw'); else if (ev.k === 'pass') demoTip('pass');
    if (!demo.tip) demo = { ...demo, key: nameOf(ev.p), cap: describe(ev) }; }
  function takeOver() { if (mode !== 'demo') return; const cfg = game.toJSON(); begin('cpu', { cfg, seats: ['you', 'pip', 'noble'], practice: true }); live = 'You take Hope’s seat. A practice match: no gold.'; speak(live); }

  // ================= ONLINE (room of up to 5 · host-authoritative · each player is sent only their own tiles) =================
  const NET = (() => {
    const N = { room: null, me: null, tr: null, members: {}, state: null, msg: '', status: '', copied: false, tok: 0, timer: 0, lastSeen: {}, reacts: [], G: null, curGame: -1 };
    const now = () => performance.now();
    function list() { if (!N.room) return []; const all = Object.entries(N.members).map(([id, m]) => ({ id, ...m })); all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, GAME.maxRoom); }
    N.list = list; N.isHost = () => { const L = list(); return !!L.length && L[0].id === N.me; };
    N.isHostId = id => { const L = list(); return !!L.length && L[0].id === id; };
    N.slotOf = id => { const i = list().findIndex(m => m.id === id); return i < 0 ? 0 : i; };
    N.nameOf = id => id === N.me ? 'YOU' : (NET_COLS[N.slotOf(id)] || NET_COLS[0])[0];
    N.ply = () => (N.state && N.state.view ? N.state.view.ply : 0);
    const send = (t, d, to) => { if (N.tr) try { N.tr.send(t, d, to); } catch (e) {} };
    function fresh() { return { seq: 0, seats: [null, null, null, null], players: [], gm: prefs.mode, target: prefs.target, live: false, cfg: null, result: null, queue: [], game: 0 }; }
    async function connect(code) {
      code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { N.msg = 'Type the 4-letter room code from your friend.'; emit(); return; }
      N.leave(true); const tok = ++N.tok; N.room = code; N.members = {}; N.lastSeen = {}; N.state = fresh(); N.G = null; N.curGame = -1; N.status = 'connecting'; N.msg = ''; N.j = Date.now(); phase = 'room'; mode = 'net'; over = null; say = null; cpuTok++; emit();
      const handlers = { game: GAME.key, code, onJoin: id => hello(id), onLeave: id => gone(id), onMsg: (t, d, id) => recv(t, d, id), onStatus: s => { N.status = s; emit(); } };
      let tr = null; const forceLocal = /[?&]net=local/.test(location.search);
      if (!forceLocal) { try { const mod = await import(new URL('engine/duel-net.js', document.baseURI).href); tr = await mod.connectDuel(handlers); } catch (e) { tr = null; } }
      if (!tr) tr = localChannel(handlers);
      if (tok !== N.tok) { try { tr.leave(); } catch (e) {} return; }
      N.tr = tr; N.me = tr.id; N.members[N.me] = { j: N.j }; N.settleT = setTimeout(() => N.settled = true, 2500); hello(); clearInterval(N.timer); N.timer = setInterval(tick, 1000);
      try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {}
      sync(); emit();
    }
    function localChannel({ game, code, onMsg, onStatus }) {   // same-device test channel (two tabs), status 'local'
      const id = Math.random().toString(36).slice(2, 10); let bc = null; try { bc = new BroadcastChannel('8g.' + game + '.' + code); bc.onmessage = e => { const { f, to, t, d } = e.data || {}; if (f === id || (to && to !== id)) return; onMsg(t, d, f); }; } catch (e) {}
      setTimeout(() => onStatus(bc ? 'local' : 'off'), 0); return { id, send(t, d, to) { bc && bc.postMessage({ f: id, to: to || null, t, d }); }, leave() { bc && bc.close(); } };
    }
    const seatIdx = id => N.state ? N.state.players.indexOf(id) : -1;
    const payload = id => { const s = N.state; return { ...s, view: N.G ? N.G.view(seatIdx(id)) : null }; };
    function hello(to) { if (!N.tr) return; send('hi', { v: 1, j: N.j }, to); if (N.isHost() && N.state && to) send('st', payload(to), to); }
    function broadcast() { for (const m of list()) if (m.id !== N.me) send('st', payload(m.id), m.id); N.state = payload(N.me); sync(); }
    function recv(t, d, id) {
      if (!N.room || !d) return; const known = !!N.lastSeen[id]; N.lastSeen[id] = now();
      if (t === 'hi') { N.members[id] = { j: +d.j || Date.now() };
        if (!N.settled && N.members[id].j >= N.j) { N.j = N.members[id].j + 1; N.members[N.me].j = N.j; send('hi', { v: 1, j: N.j }); }   /* a joiner always sorts after the people already here (phone clocks differ) */ if (!known) setTimeout(() => hello(id), 0); if (N.isHost()) { trim(); send('st', payload(id), id); } emit(); return; }
      if (!N.members[id]) N.members[id] = { j: Date.now() };
      if (t === 'st') { if (!N.isHostId(id)) return; if (!N.state || d.seq >= N.state.seq) { if (N.isHost()) return; N.state = d; sync(); } return; }
      if (t === 'rq') { if (N.isHost()) handle(d, id); return; }
      if (t === 'rx') { react(id, d.w); return; }
      if (t === 'bye') gone(id);
    }
    function gone(id) { if (!N.members[id] || id === N.me) return; delete N.members[id]; delete N.lastSeen[id];
      if (N.isHost()) { const s = N.state; s.queue = s.queue.filter(q => q !== id); const k = s.seats.indexOf(id); if (k >= 0) s.seats[k] = null;
        if (s.live && s.players.includes(id)) { s.live = false; s.result = { left: id, why: N.nameOf(id) + ' left the table' }; if (N.G) { N.G.phase = 'over'; N.G.winner = N.G.scores.indexOf(Math.max(...N.G.scores.filter((_, i) => s.players[i] !== id))); N.G.why = 'left'; } }
        if (!s.live) { /* the host may have changed: keep the shared game */ } bump(); } emit(); }
    function tick() { if (!N.tr) return; send('hi', { v: 1, j: N.j }); const t = now(); for (const id of Object.keys(N.lastSeen)) if (t - N.lastSeen[id] > 20000) gone(id); emit(); }
    function trim() { const ids = list().map(m => m.id), s = N.state; s.seats = s.seats.map(x => x && (ids.includes(x) || N.members[x]) ? x : null); s.queue = s.queue.filter(q => ids.includes(q)); }
    function bump() { const s = N.state; s.seq++; if (N.G) s.cfg = N.G.toJSON(); broadcast(); }
    // host: apply a request from `id` (also used for the host's own actions)
    function handle(d, id) {
      const s = N.state; if (!s) return; const seated = s.seats.indexOf(id), G = N.G, k = seatIdx(id);
      if (d.k === 'sit' && d.s >= 0 && d.s < 4 && !s.live && !s.seats[d.s] && seated < 0) { s.seats[d.s] = id; s.queue = s.queue.filter(q => q !== id); }
      else if (d.k === 'stand' && seated >= 0 && !s.live) s.seats[seated] = null;
      else if (d.k === 'queue' && seated < 0 && !s.queue.includes(id)) s.queue.push(id);
      else if (d.k === 'gm' && id === N.me && !s.live) s.gm = d.v === 'draw' ? 'draw' : 'fives';
      else if (d.k === 'target' && id === N.me && !s.live && TARGETS.includes(+d.v)) s.target = +d.v;
      else if (d.k === 'start' && !s.live && s.seats.filter(Boolean).length >= 2 && (seated >= 0 || id === N.me)) {
        if (s.result) rotate(s); s.players = s.seats.filter(Boolean); N.G = new Dominoes({ n: s.players.length, mode: s.gm, target: s.target, seed: (Math.random() * 1e9) >>> 0 }); s.live = true; s.result = null; s.game++; }
      else if (s.live && G && k >= 0 && G.turn === k && d.ply === G.log.length && ['play', 'draw', 'pass'].includes(d.k)) {
        const ev = d.k === 'play' ? G.play(d.id, d.arm) : d.k === 'draw' ? G.draw() : G.pass(); if (!ev) { send('st', payload(id), id); return; } }
      else if (d.k === 'next' && s.live && G && k >= 0 && G.phase === 'hand' && d.ply === G.log.length) G.next();
      else return;
      if (G && G.phase === 'over' && s.live) { s.live = false; s.result = { winner: s.players[G.winner], why: G.why }; }
      bump();
    }
    function rotate(s) {   // winner stays on: the lowest score gets up for the next fox in line
      if (!s.queue.length || !N.G) return; const sc = N.G.scores, lowK = sc.indexOf(Math.min(...sc)), out = s.players[lowK], si = s.seats.indexOf(out), next = s.queue.shift(); if (si >= 0) { s.seats[si] = next; s.queue.push(out); }
    }
    N.request = d => { if (N.isHost()) handle(d, N.me); else send('rq', d); };
    function react(id, w) { if (!REACTS.includes(w)) return; N.reacts.push({ who: N.nameOf(id), w, t: 2.4, col: (NET_COLS[N.slotOf(id)] || NET_COLS[0])[1] }); if (N.reacts.length > 3) N.reacts.shift(); const k = N.state ? N.state.players.indexOf(id) : -1; if (k >= 0) mood(k, w === 'OOF' ? 'surprised' : 'happy', 1.6); else { const f = foxes['net' + N.slotOf(id)]; if (f) f.userData.hop = 1; } audio.sfx(w === 'WOW' ? 'ooh' : w === 'OOF' ? 'oof' : 'clap'); emit(); }
    N.react = w => { send('rx', { w }); react(N.me, w); };
    // make the local table follow the shared state (animating one new action when it is the next step)
    function sync() {
      const s = N.state; if (!s) return; const L = list(); mode = 'net'; const v = s.view;
      if (v && s.players.length) {
        const G2 = Dominoes.fromView(v), prev = game, newGame = s.game !== N.curGame; seats = [...s.players]; me = s.players.indexOf(N.me); pov = Math.max(0, me);
        if (newGame) { N.curGame = s.game; over = null; handCard = false; game = G2; phase = 'play'; placeFoxes(); if (v.ply === 0) { dealAnim(); setTimeout(nextTurn, 1500); } else { flushAnims(); slotMap.clear(); freeBl = blanks.map((_, i) => i); blanks.forEach(b => b.visible = false); known.forEach(o => o.visible = false); poseAll(null, true); setTimeout(nextTurn, 200); } }
        else if (prev.ply != null && v.ply === prev.ply + 1 && v.handNo === prev.handNo && v.last && v.last.k !== 'deal') { game = G2; afterEvent(v.last); }
        else if (prev.ply != null && v.handNo === prev.handNo + 1) { game = G2; handCard = false; afterEvent({ k: 'deal' }); }
        else if (prev.ply !== v.ply || prev.handNo !== v.handNo) { game = G2; flushAnims(); poseAll(null, true); setTimeout(nextTurn, 100); }
        else game = G2;
        if (!s.live && s.result && game.phase !== 'over') { game.phase = 'over'; game.winner = Math.max(0, s.players.indexOf(s.result.winner)); setTimeout(nextTurn, 50); }
      } else { seats = s.seats.filter(Boolean); phase = 'room'; }
      if (!s.live && !s.result) phase = 'room';
      standing = L.filter(m => !(s.live || s.result ? s.players : s.seats).includes(m.id)).slice(0, 3).map(m => 'net' + N.slotOf(m.id));
      placeFoxes(); aimCamera(); emit();
    }
    N.leave = (quiet) => { N.tok++; clearInterval(N.timer); if (N.tr) { send('bye', {}); try { N.tr.leave(); } catch (e) {} } N.tr = null; N.room = null; N.members = {}; N.state = null; N.G = null; N.reacts = []; try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {} if (!quiet) emit(); };
    N.connect = code => { N.settled = false; return connect(code); }; N.create = () => { N.settled = true; const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 4; i++) c += A[Math.floor(Math.random() * A.length)]; connect(c).then(() => { N.settled = true; }); };
    return N;
  })();

  // ---------- input: tap a glowing end on the table (tiles are picked in the rack) ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = V3(), el = renderer.domElement;
  function tableAt(e) { const bb = el.getBoundingClientRect(); ndc.set(((e.clientX - bb.left) / bb.width) * 2 - 1, -((e.clientY - bb.top) / bb.height) * 2 + 1); ray.setFromCamera(ndc, camera);
    const pl = new THREE.Plane(V3(0, 1, 0), -FELT_Y); return ray.ray.intersectPlane(pl, hit) ? hit.clone() : null; }
  function tapTable(p) {
    if (mode === 'demo' && phase === 'play') { takeOver(); return; }
    if (cover || phase !== 'play') return;
    if (!p || !markArms.length) return; let best = null, bd = 1e9; for (const m of markArms) { const d = Math.hypot(m.m.position.x - p.x, m.m.position.z - p.z); if (d < bd) { bd = d; best = m; } }
    if (best && bd < U * 3.2) placeAt(best.arm); else if (sel != null) { sel = null; hint = null; placeMarkers(); emit(); }
  }
  let down = null;
  el.addEventListener('pointerdown', e => { audio.unlock(); if (e.button > 0) return; down = { x: e.clientX, y: e.clientY, id: e.pointerId }; if (cursor >= 0) { cursor = -1; emit(); } });
  const up = e => { if (!down || e.pointerId !== down.id) return; const d = down; down = null; if (e.type === 'pointercancel') return; if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 14) return; tapTable(tableAt(e)); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  // keyboard: ←/→ choose a tile, Enter picks it, 1–4 choose an end, D draws, P passes, Esc cancels
  const rackIds = () => me >= 0 && game.hands[me] ? sortHand(game.hands[me]) : [];
  const sortHand = h => [...h].filter(id => id >= 0).sort((a, b) => TILES[b][1] - TILES[a][1] || TILES[b][0] - TILES[a][0]);
  const onKey = e => { if (phase !== 'play' || /INPUT|TEXTAREA/.test((e.target && e.target.tagName) || '')) return; const k = e.key, R = rackIds();
    if (cover && (k === 'Enter' || k === ' ')) { e.preventDefault(); api.showTiles(); return; }
    if (k === 'd' || k === 'D') { e.preventDefault(); api.draw(); return; } if (k === 'p' || k === 'P') { e.preventDefault(); api.pass(); return; }
    if (/^[1-4]$/.test(k) && markArms[+k - 1]) { e.preventDefault(); placeAt(markArms[+k - 1].arm); return; }
    if (k === 'Escape') { sel = null; hint = null; placeMarkers(); emit(); return; }
    if (!R.length) return;
    if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); cursor = cursor < 0 ? 0 : (cursor + (k === 'ArrowRight' ? 1 : -1) + R.length) % R.length; const id = R[cursor], ok = game.legal(me).some(m => m.id === id); live = tileWords(id) + (ok ? ', fits' : ', does not fit'); speak(live); emit(); return; }
    if ((k === 'Enter' || k === ' ') && cursor >= 0) { e.preventDefault(); pickTile(R[cursor]); } };
  addEventListener('keydown', onKey);

  // ---------- what the page shows ----------
  const svgCache = new Map(); const svgOf = (id, back) => { const key = id + '|' + prefs.colour + '|' + prefs.theme + '|' + back; if (!svgCache.has(key)) svgCache.set(key, back ? tileSVG(0, 0, { back: true }) : tileSVG(TILES[id][0], TILES[id][1], { colour: prefs.colour, contrast: prefs.theme === 'contrast' })); return svgCache.get(key); };
  const dirWord = arm => { const e = lay.ends[arm]; if (!e) return ARMW[arm].toUpperCase(); const p = V3((e.x + e.dx * 0.5) * U, FELT_Y, (e.z + e.dz * 0.5) * U).project(camera), q = V3(0, FELT_Y, 0).project(camera), dx = p.x - q.x, dy = p.y - q.y; return Math.abs(dx) > Math.abs(dy) * 0.8 ? (dx < 0 ? '◀ LEFT' : 'RIGHT ▶') : (dy > 0 ? '▲ FAR' : '▼ NEAR'); };
  function statusTxt() {
    if (phase !== 'play') return '';
    if (over) return over.title.toUpperCase();
    if (game.phase === 'hand') { const L = game.lastHand; return !L ? 'HAND OVER' : L.winner == null ? 'BLOCKED · NO SCORE' : (L.blocked ? 'BLOCKED · ' : 'DOMINÓ · ') + nameOf(L.winner) + ' +' + L.pts; }
    if (cover) return 'PASS TO ' + nameOf(game.turn);
    const k = game.turn;
    if (mode === 'demo') return 'DEMO · ' + nameOf(k) + (cpuBusy ? ' IS THINKING' : '’S TURN');
    if (k === me && humanSeat(k)) { if (game.mustDraw(k)) return 'NOTHING FITS · DRAW'; if (game.mustPass(k)) return 'NOTHING FITS · PASS'; if (sel != null && selPlacements().length > 1) return 'TAP A GLOWING END'; return mode === 'local' ? nameOf(k) + ' · YOUR TURN' : 'YOUR TURN'; }
    return nameOf(k) + (cpuBusy ? ' IS THINKING' : '’S TURN') + (mode === 'net' && me < 0 ? ' · WATCHING' : '');
  }
  function emit() {
    lastEmit = performance.now(); const n = game.n, base = Math.max(0, pov), order = [...Array(n).keys()].map(i => (base + i) % n);
    const players = order.map(k => ({ k, name: nameOf(k), score: game.scores[k], tiles: game.hands[k] ? game.hands[k].length : 0, col: colOf(k), active: phase === 'play' && game.phase === 'play' && game.turn === k && !over, me: k === me && mode !== 'demo' && (mode !== 'net' || me >= 0), thinking: cpuBusy && game.turn === k, side: sideOf(k), lead: Math.max(...game.scores) > 0 && game.scores[k] === Math.max(...game.scores) }));
    const canSee = me >= 0 && phase === 'play' && (mode !== 'net' || me >= 0), legalIds = new Set(myTurn() ? game.legal(me).map(m => m.id) : []);
    const rack = canSee ? rackIds().map((id, i) => ({ id, img: svgOf(id, cover), ok: !cover && legalIds.has(id), sel: sel === id, hint: !!(hint && hint.id === id), cur: i === cursor, label: cover ? 'hidden tile' : tileWords(id) + (legalIds.has(id) ? ', fits' : '') })) : [];
    const R = loadResume(), Ns = NET.state, Lm = NET.list(), L = game.lastHand;
    const E = game.ends(), cnt = game.count();
    onState({
      phase, mode, n, players, rack, rackOwner: mode === 'demo' ? 'HOPE’S TILES' : mode === 'local' ? nameOf(me) : 'YOUR TILES', cover: cover && phase === 'play' ? { name: nameOf(game.turn) } : null,
      status: statusTxt(), myTurn: myTurn(), canDraw: myTurn() && game.mustDraw(me), canPass: myTurn() && game.mustPass(me), boneN: game.boneN, gm: game.mode, target: game.target, handNo: game.handNo,
      ends: E.map(e => e.v), count: game.mode === 'fives' && game.line.lead != null ? cnt : null, countHot: game.mode === 'fives' && cnt > 0 && cnt % 5 === 0,
      choices: selPlacements().length > 1 && !symmetric() ? selPlacements().map((m, i) => ({ arm: m.arm, n: i + 1, v: game.armEnd(m.arm), where: dirWord(m.arm), pts: game.scoreIf(m.id, m.arm) })) : [],
      sel, canUndo: (mode === 'cpu' || mode === 'local') && phase === 'play' && !over && game.phase === 'play' && game.log.length > 0 && !cpuBusy, canHint: mode === 'cpu' && myTurn() && game.canPlay(me), practice,
      hand: handCard && game.phase === 'hand' && L && !over ? { title: L.winner == null ? 'Blocked · tie' : L.blocked ? 'Blocked' : 'Dominó!', sub: handLine(L), canNext: mode !== 'net' || (me >= 0), rows: order.map(k => ({ name: nameOf(k), pips: L.pips[k], pts: k === L.winner ? '+' + L.pts : '', score: game.scores[k], win: k === L.winner, col: colOf(k) })), hand: L.hand } : null,
      over: over ? { ...over, rows: order.map(k => ({ name: nameOf(k), score: game.scores[k], win: k === over.winner, col: colOf(k) })) } : null,
      say: say ? { who: say.who, text: say.text } : null, flash: flash ? { txt: flash.txt, col: flash.col } : null, live, view: prefs.view, prefs: { ...prefs },
      demo: demo ? { key: demo.key, cap: demo.cap } : null,
      opponents: OPPONENTS.map(O => { let w = 0; try { w = save.flag('dominoesClub.beat.' + O.id) ? 1 : 0; } catch (e) {} return { id: O.id, level: O.level, name: O.name, tag: O.tag, who: O.who, gold: O.gold, on: prefs.foxes.includes(O.id), beat: !!w }; }),
      record: (() => { try { return save.stat('dominoesClub.w') + 'W ' + save.stat('dominoesClub.l') + 'L'; } catch (e) { return ''; } })(),
      resume: R && R.cfg && R.cfg.log && R.cfg.log.length ? { label: (R.mode === 'cpu' ? 'VS ' + R.seats.slice(1).map(id => (oppById(id) || {}).name).join(' · ') : 'PASS & PLAY · ' + R.seats.length) + ' · ' + (R.cfg.mode === 'fives' ? 'ALL FIVES' : 'DRAW') } : null,
      gold: (() => { try { return save.data.gold; } catch (e) { return 0; } })(),
      net: NET.room ? { code: NET.room, status: NET.status, host: NET.isHost(), me: NET.me, copied: NET.copied, live: !!(Ns && Ns.live), result: Ns ? Ns.result : null, gm: Ns ? Ns.gm : 'fives', target: Ns ? Ns.target : 100,
        mine: !!(Ns && Ns.seats.includes(NET.me)), canStart: !!(Ns && !Ns.live && Ns.seats.filter(Boolean).length >= 2 && (Ns.seats.includes(NET.me) || NET.isHost())), seatedN: Ns ? Ns.seats.filter(Boolean).length : 0,
        seats: (Ns ? Ns.seats : [null, null, null, null]).map((id, s) => ({ s, id, name: id ? NET.nameOf(id) : 'OPEN', col: id ? (NET_COLS[NET.slotOf(id)] || NET_COLS[0])[1] : '#3a3836', mine: id === NET.me, open: !id })),
        people: Lm.map((m, i) => ({ id: m.id, name: NET.nameOf(m.id), col: NET_COLS[i][1], seat: Ns ? (Ns.seats.includes(m.id) ? 'SEAT ' + (Ns.seats.indexOf(m.id) + 1) : Ns.queue.includes(m.id) ? 'NEXT · ' + (Ns.queue.indexOf(m.id) + 1) : 'WATCHING') : '', host: i === 0, me: m.id === NET.me })),
        count: Lm.length, max: GAME.maxRoom, inQueue: !!(Ns && Ns.queue.includes(NET.me)), reacts: NET.reacts.map(r => ({ who: r.who, w: r.w, col: r.col })) } : null,
    });
  }

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, alive = true, frame = 0;
  function loop() {
    if (!alive) return; raf = requestAnimationFrame(loop); const rawDt = Math.min(0.25, clock.getDelta()), dt = Math.min(0.05, rawDt), t = clock.elapsedTime; frame++;
    for (const a of anims) { a.t += rawDt; if (a.t < 0) continue; const k = clamp(a.t / a.dur, 0, 1), e = smooth(k); a.o.position.lerpVectors(a.a, a.b, e); a.o.position.y += Math.sin(k * Math.PI) * a.hop; a.o.quaternion.slerpQuaternions(a.qa, a.qb, e); if (k >= 1 && !a.done) { a.done = true; if (a.hideEnd) a.o.visible = false; } if (a.land && !a.mid && k >= 0.6) { a.mid = true; emit(); } }
    if (anims.length && anims.every(a => a.done)) { anims = []; emit(); }
    room.fan.rotation.y += dt * 2.2;
    bulbGlow.forEach((s, i) => s.material.opacity = 0.5 + Math.sin(t * 1.3 + i * 1.7) * 0.08);
    for (const m of markers) if (m.visible) { m.material.opacity = 0.35 + Math.sin(t * 6) * 0.2; m.children[0].scale.setScalar(1 + Math.sin(t * 6) * 0.08); }
    if (popT > 0) { popT -= rawDt; pop.position.y += rawDt * 0.12; pop.material.opacity = clamp(popT / 0.6, 0, 1); if (popT <= 0) pop.visible = false; }
    if (flash) { flash.t -= rawDt; if (flash.t <= 0) { flash = null; emit(); } }
    { const thinking = cpuBusy && phase === 'play' && isCpuSeat(game.turn), f = thinking ? foxOn(game.turn) : null; bubble.visible = !!(f && f.visible); if (bubble.visible) { bubble.position.set(f.position.x * 0.9, 2.75, f.position.z * 0.9); const k = Math.floor(t * 3) % 3; if (k !== bubble.userData.k) { bubble.userData.k = k; drawBubble(k); } } }
    const menuish = phase === 'menu' || (phase === 'room' && !(NET.state && NET.state.live));
    for (const f of Object.values(foxes)) { if (!f.visible) continue; const u = f.userData; if (menuish) { u.lookAt = u.lookAt === BOARD_LOOK ? camera.position.clone() : (u.lookAt || camera.position.clone()); u.lookAt.copy(camera.position); } else if (u.lookAt !== BOARD_LOOK) u.lookAt = BOARD_LOOK; if (u.moodT > 0) { u.moodT -= dt; if (u.moodT <= 0) u.mood = u.base; } kit.animFox(f, dt, 0);
      if (u.sit) { const P = u.P; P.legs.forEach(l => l.rotation.x = -1.25); P.arms.forEach((a, i) => { a.rotation.x = -1.05 + (u.talking && i ? Math.sin(u.phase * 2.2) * 0.2 : 0); a.rotation.z = i ? 0.25 : -0.25; }); P.body.position.y = u.hopY * 0.5; } }
    if (say) { say.t -= dt; if (say.t <= 0) { say = null; emit(); } }
    if (NET.reacts.length) { NET.reacts.forEach(r => r.t -= dt); const n = NET.reacts.length; NET.reacts = NET.reacts.filter(r => r.t > 0); if (n !== NET.reacts.length) emit(); }
    if (menuish) { orbitT += dt * 0.25; if (frame % 3 === 0 || camSnap) {   // a slow sway around the table, framed into the part of the screen the menu leaves free
        const W = CW(), H = CH(), yaw = Math.PI * 0.78 + Math.sin(orbitT * 0.35) * 0.2, dist = 3.5, el = 0.36, th = Math.tan(camera.fov * Math.PI / 360), asp = W / H;
        const ny = 1 - (safe.top + H - safe.bottom) / H, nx = (safe.left + W - safe.right) / W - 1, base = V3(0, 1.05, 0), look = base.clone(), dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), -Math.cos(yaw) * Math.cos(el)), right = V3(Math.cos(yaw), 0, Math.sin(yaw));
        look.y -= ny * dist * th * 0.8; look.addScaledVector(right, nx * dist * th * asp); camGoal = { pos: base.clone().addScaledVector(dir, dist), look }; } }
    { const fv = menuish ? (port() ? 74 : 50) : (port() ? 46 : 40); if (Math.abs(camera.fov - fv) > 0.05) { camera.fov = damp(camera.fov, fv, 4, dt); camera.updateProjectionMatrix(); } }
    const k = camSnap ? 1 : 1 - Math.exp(-3.5 * dt); camSnap = false; camera.position.lerp(camGoal.pos, k); camLook.lerp(camGoal.look, k); camera.lookAt(camLook);
    room.shade.visible = room.bulb.visible = camera.position.y < 2.25; room.top.visible = camera.position.y < room.H - 0.55; bulbGlow.forEach(g => g.visible = room.top.visible);
    if (touch && !anims.length && !markArms.length && !pop.visible && (frame & 1)) return;   // ~30 fps when nothing moves on phones
    if (document.hidden) return;
    renderer.render(scene, camera);
  }
  function resize() { const W = CW(), H = CH(); renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); aimCamera(); }
  const ro = new ResizeObserver(resize); ro.observe(container); addEventListener('resize', resize);

  // ---------- boot: the menu table has foxes seated, their tiles stood up and a short line already down ----------
  toMenu(); (() => { const g = new Dominoes({ n: seats.length, mode: prefs.mode, target: prefs.target, seed: 4242 }); for (let i = 0; i < 4 && g.phase === 'play'; i++) { if (g.mustDraw()) g.draw(); else { const m = think(g, g.turn, 1); if (m) g.play(m.id, m.arm); } } game = g; poseAll(null, true); })();
  resize(); loop(); emit();
  setTimeout(() => { if (phase === 'menu') { const id = prefs.foxes[0], O = oppById(id); if (O) talk(1, pick(O.lines.hello), O.name); } }, 900);

  // ---------- talking to a world that opens this in a panel (?embed=1) ----------
  function toParent(msg) { try { if (parent && parent !== window) parent.postMessage({ type: '8gates:minigame', game: GAME.key, ...msg }, '*'); } catch (e) {} }
  const onMsg = e => { const d = e.data; if (!d || d.type !== '8gates:minigame' || (d.game && d.game !== GAME.key)) return;
    if (d.action === 'pause') { audio.suspend(true); } else if (d.action === 'resume') { audio.suspend(false); } else if (d.action === 'mute') { audio.setSound(false); audio.setMusic(false); } else if (d.action === 'unmute') { audio.setSound(prefs.sound); audio.setMusic(prefs.music); } else if (d.action === 'music') { audio.setMusic(!!d.on && prefs.music); } };
  addEventListener('message', onMsg);
  const onVis = () => { audio.suspend(document.hidden); }; document.addEventListener('visibilitychange', onVis);
  setTimeout(() => toParent({ action: 'ready' }), 0);

  // ---------- API (the page calls these) ----------
  const menuTable = () => { if (phase !== 'menu') return; seats = ['you', ...prefs.foxes]; const g = new Dominoes({ n: seats.length, mode: prefs.mode, target: prefs.target, seed: 4242 }); for (let i = 0; i < 4 && g.phase === 'play'; i++) { if (g.mustDraw()) g.draw(); else { const m = think(g, g.turn, 1); if (m) g.play(m.id, m.arm); } } game = g; slotMap.clear(); freeBl = blanks.map((_, i) => i); blanks.forEach(b => b.visible = false); known.forEach(k => k.visible = false); poseAll(null, true); placeFoxes(); };
  const api = {
    hud: () => ({ phase, mode }), GAME, OPPONENTS,
    setSafe(s) { const n = { top: Math.round(s.top || 0), bottom: Math.round(s.bottom || 0), left: Math.round(s.left || 0), right: Math.round(s.right || 0) }; if (Object.keys(n).some(k => Math.abs(n[k] - safe[k]) > 3)) { safe = n; aimCamera(); } },
    toggleFox(id) { if (phase !== 'menu' || !oppById(id)) return; const on = prefs.foxes.includes(id); if (on && prefs.foxes.length === 1) return; prefs.foxes = on ? prefs.foxes.filter(x => x !== id) : OPPONENTS.map(o => o.id).filter(x => x === id || prefs.foxes.includes(x)); savePrefs(); menuTable(); if (!on) { const O = oppById(id); talk(prefs.foxes.indexOf(id) + 1, pick(O.lines.hello), O.name); } emit(); },
    setGameMode(v) { prefs.mode = v === 'draw' ? 'draw' : 'fives'; savePrefs(); emit(); }, setTarget(v) { if (TARGETS.includes(+v)) { prefs.target = +v; savePrefs(); emit(); } },
    playCpu(foxIds = prefs.foxes) { begin('cpu', { foxes: foxIds }); },
    playLocal(n = prefs.localN) { prefs.localN = clamp(+n || 2, 2, 4); savePrefs(); begin('local', { n: prefs.localN }); },
    resume() { const R = loadResume(); if (!R) return; begin(R.mode, { cfg: R.cfg, seats: R.seats, practice: R.practice }); },
    rematch() { if (mode === 'cpu') begin('cpu', { seats }); else if (mode === 'local') begin('local', { n: game.n }); else if (mode === 'net') NET.request({ k: 'start' }); },
    menu: toMenu, demo() { begin('demo'); }, takeOver,
    pickTile, placeAt, draw() { if (myTurn() && game.mustDraw(me)) act({ k: 'draw' }); }, pass() { if (myTurn() && game.mustPass(me)) act({ k: 'pass' }); }, nextHand,
    showTiles() { if (!cover) return; cover = false; sfx('pick'); yourTurn(); emit(); },
    undo, hint: giveHint,
    resign() { if (phase !== 'play' || over || mode === 'demo' || mode === 'net') return; cpuTok++; cpuBusy = false; game.phase = 'over'; game.winner = mode === 'cpu' ? 1 + game.scores.slice(1).indexOf(Math.max(...game.scores.slice(1))) : game.scores.indexOf(Math.max(...game.scores)); game.why = 'resigned'; matchEnded(); },
    cycleView() { prefs.view = VIEWS[(VIEWS.indexOf(prefs.view) + 1) % VIEWS.length]; savePrefs(); aimCamera(); emit(); },
    setPref(k, v) { prefs[k] = v; savePrefs(); if (k === 'sound') audio.setSound(v); if (k === 'music') { audio.unlock(); audio.setMusic(v); } if (k === 'colour' || k === 'theme') { for (let id = 0; id < 28; id++) drawFace(id); } if (k === 'speak' && v) speak('Speaking moves on.'); emit(); },
    // online
    netCreate: () => NET.create(), netJoin: code => NET.connect(code), netLeave: () => { NET.leave(); toMenu(); },
    netSit: s => NET.request({ k: 'sit', s }), netStand: () => NET.request({ k: 'stand' }), netQueue: () => NET.request({ k: 'queue' }), netStart: () => NET.request({ k: 'start' }), netGameMode: v => NET.request({ k: 'gm', v }), netTarget: v => NET.request({ k: 'target', v }), netReact: w => NET.react(w),
    netShareURL() { if (!NET.room) return ''; try { const u = new URL(location.href); u.searchParams.delete('embed'); u.searchParams.delete('phone'); u.searchParams.set('room', NET.room); return u.href; } catch (e) { return ''; } },
    netCopied(v) { NET.copied = v; emit(); }, netOpenRoom() { if (NET.room && !(NET.state && NET.state.live)) { phase = 'room'; over = null; placeFoxes(); emit(); } },
    // demo/testing
    debug: { get game() { return game; }, get phase() { return phase; }, get me() { return me; }, NET, act, layout: () => lay, markers: () => markArms.map(m => m.arm), cam: () => [camera.position.toArray().map(v => +v.toFixed(2)), camera.fov],
      screenOf(arm) { const m = markArms.find(x => x.arm === arm); if (!m) return null; const v = m.m.position.clone().project(camera), r = el.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; },
      load(cfg, sts) { begin(mode === 'local' ? 'local' : 'cpu', { cfg, seats: sts || seats }); } },
    destroy() { alive = false; audio.setMusic(false); removeEventListener('message', onMsg); document.removeEventListener('visibilitychange', onVis); document.removeEventListener('pointerdown', unlockAll, true); document.removeEventListener('keydown', unlockAll, true); document.removeEventListener('click', uiClick, true); cancelAnimationFrame(raf); NET.leave(true); ro.disconnect(); removeEventListener('resize', resize); removeEventListener('keydown', onKey); renderer.dispose(); renderer.domElement.remove(); },
  };
  const rm = /[?&]room=([A-Za-z0-9]{4})/.exec(location.search); if (rm) setTimeout(() => NET.connect(rm[1]), 300);
  else if (/[?&]demo=1/.test(location.search)) setTimeout(() => begin('demo'), 600);
  return api;
}
