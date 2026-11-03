// 8 GATES — CHESS CLUB [chessClub]. A small club room (any building, any world): one table, a 3D board, foxes at the table.
// Modes: VS FOX (Pip · ROOKIE, Hope · CLUB, Noble · MASTER), PASS & PLAY (two on one phone), ONLINE (room of up to 5: 2 play, 3 watch and
// take the next game, winner stays on). Tap a piece, tap a square (or drag). Rules + CPU live in ./chess-rules.js (CPU runs in a Worker).
// MERGE: createChessClub({ container, onState }) stands alone. buildParlor(ctx) builds just the room + table into any scene/origin so a world's
// building can reuse the interior. Save keys: everything under 'chessClub.*' (stats in engine/save.js; resume + prefs in localStorage).
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../../fox-kit.js';
import { CAST, castKit, loadCastRigs } from '../../engine/cast.js';
import { crestTex, canvasTex, FONT } from '../../engine/textures.js';
import { save } from '../../engine/save.js';
import { Chess, think, LEVELS, sqName, sqIndex, colorOf, PIECE_NAMES } from './chess-rules.js';
import { createChessAudio } from './chess-audio.js';

export const CHESS = { key: 'chessClub', name: 'CHESS CLUB', room: 'chessClub', maxRoom: 5 };
const RESUME_KEY = 'chessClub.resume', PREFS_KEY = 'chessClub.prefs';
// Opponents + rewards + lines: DRAFT for Ben (no chess in the 2D game files).
export const OPPONENTS = [
  { level: 0, id: 'rookie', tag: 'ROOKIE', name: 'PIP', who: 'Club kid · learning', gold: 5, xp: 10,
    lines: { hello: ['Hi! I just learned how the horse moves.', 'Go easy on me, okay?'], take: ['Got one!', 'Yum, a piece!'], lost: ['Oops.', 'Hey, I liked that one!'], check: ['Check! Is that how you say it?'], win: ['I WON? I won!'], lose: ['Good game! Again?'], draw: ['A tie! That counts as a win, right?'] } },
  { level: 1, id: 'club', tag: 'CLUB', name: 'HOPE', who: 'Plays by feel · calls every move', gold: 15, xp: 25,
    lines: { hello: ['Call your moves out loud if you like. I keep the whole board in my head.', 'Ready when you are.'], take: ['I felt that one coming.', 'Thank you, I will take that.'], lost: ['Nice. I heard that one.', 'Fair trade.'], check: ['Check. Mind your king.'], win: ['Good fight. Want a rematch?'], lose: ['Well played. You earned that.'], draw: ['Even. I like even.'] } },
  { level: 2, id: 'master', tag: 'MASTER', name: 'NOBLE', who: 'Club champion', gold: 40, xp: 60,
    lines: { hello: ['Sit. Show me what you have.', 'The board does not lie.'], take: ['Mine.', 'Predictable.'], lost: ['Hm. Bold.', 'You saw that? Good.'], check: ['Check.'], win: ['Again. You are close.'], lose: ['...Well played. Very well played.'], draw: ['A draw. Respectable.'] } }];
const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PINK', '#f472b6']];
export const REACTS = ['NICE', 'WOW', 'OOF', 'GG'];

// ---------------- small helpers (copied, so this game has no shared-file edits) ----------------
const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const smooth = t => t * t * (3 - 2 * t), pick = a => a[Math.floor(Math.random() * a.length)];
function makeGradient() { const d = new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }
function glowTexture() { return canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }); }
function mergeGeos(list) {   // tiny mergeGeometries: positions + normals only
  const parts = list.map(g => (g.index ? g.toNonIndexed() : g)); let n = 0; parts.forEach(g => n += g.attributes.position.count);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  for (const g of parts) { if (!g.attributes.normal) g.computeVertexNormals(); pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return out;
}
function inflate(geo, t) {   // outline hull: push every vertex out along its smoothed normal
  const g = geo.clone(), p = g.attributes.position, key = i => `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`, acc = new Map(), nm = g.attributes.normal;
  for (let i = 0; i < p.count; i++) { const k = key(i), a = acc.get(k) || [0, 0, 0]; a[0] += nm.getX(i); a[1] += nm.getY(i); a[2] += nm.getZ(i); acc.set(k, a); }
  const out = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { const a = acc.get(key(i)), l = Math.hypot(a[0], a[1], a[2]) || 1; out[i * 3] = p.getX(i) + a[0] / l * t; out[i * 3 + 1] = p.getY(i) + a[1] / l * t; out[i * 3 + 2] = p.getZ(i) + a[2] / l * t; }
  g.setAttribute('position', new THREE.BufferAttribute(out, 3)); return g;
}

// ---------------- sizes (fox units: a standing fox is ~2.8 tall, hips at 0.75) ----------------
export const S = 0.15;                 // one square
const BORDER = 0.07, HALF = 4 * S, TABLE_Y = 0.95, BOARD_Y = TABLE_Y + 0.045, SEAT_Z = 1.2;
const BOARD_LOOK = new THREE.Vector3(0, BOARD_Y, 0);
const sqPos = (i, y = BOARD_Y) => new THREE.Vector3(((i & 7) - 3.5) * S, y, ((i >> 3) - 3.5) * S);

// ---------------- the room (exported for worlds) ----------------
// ctx: { toon, M, scene?, origin? } → { group, lamp }
export function buildParlor({ toon, M, scene, origin }) {
  const G = new THREE.Group(); if (origin) G.position.copy(origin); (scene || M.scene).add(G);
  const W = 7.2, D = 7.2, H = 3.4;
  const planks = canvasTex(512, 512, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#8a5a3a', '#94623f', '#7f5335', '#8f5e3c'][i % 4]; g.fillRect(0, i * 64, 512, 64); g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(0, i * 64, 512, 3); const off = (i * 197) % 512; g.fillRect(off, i * 64, 3, 64); g.fillStyle = 'rgba(255,255,255,0.05)'; for (let k = 0; k < 6; k++) g.fillRect(rr(0, 512), i * 64 + rr(8, 56), rr(40, 140), 2); } }, [5, 5]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshToonMaterial({ map: planks, gradientMap: toon.grad })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; G.add(floor);
  const wallTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#2f4a45'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.05)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 12, h); g.fillStyle = '#6b4329'; g.fillRect(0, h * 0.68, w, h * 0.32); g.fillStyle = '#e6b45a'; g.fillRect(0, h * 0.66, w, 6); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 0; x < w; x += 64) g.fillRect(x, h * 0.7, 3, h * 0.3); }, [3, 1]);
  const wallMat = new THREE.MeshToonMaterial({ map: wallTex, gradientMap: toon.grad });
  for (const [x, z, ry] of [[0, -D / 2, 0], [0, D / 2, Math.PI], [-W / 2, 0, Math.PI / 2], [W / 2, 0, -Math.PI / 2]]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat); w.position.set(x, H / 2, z); w.rotation.y = ry; G.add(w); }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), toon('#1d2b29')); ceil.rotation.x = Math.PI / 2; ceil.position.y = H; G.add(ceil);
  // rug
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.3, 48), new THREE.MeshToonMaterial({ gradientMap: toon.grad, map: canvasTex(512, 512, (g, w) => { const c = w / 2; [['#7a1d2a', 256], ['#e6b45a', 236], ['#9c2a36', 226], ['#1f2a44', 150], ['#e6b45a', 142], ['#7a1d2a', 134]].forEach(([col, r]) => { g.fillStyle = col; g.beginPath(); g.arc(c, c, r, 0, 7); g.fill(); }); g.strokeStyle = '#e6b45a'; g.lineWidth = 6; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * 150, c + Math.sin(a) * 150); g.lineTo(c + Math.cos(a) * 226, c + Math.sin(a) * 226); g.stroke(); } }) }));
  rug.rotation.x = -Math.PI / 2; rug.position.y = 0.006; rug.receiveShadow = true; G.add(rug);
  // the table: round-cornered top, pedestal, foot
  const wood = toon('#5a3520'), woodL = toon('#7a4a2c'), brass = toon('#e6b45a');
  M(new THREE.BoxGeometry(1.75, 0.07, 1.55), wood, 0, TABLE_Y - 0.035, 0, G, 0.02);
  M(new THREE.BoxGeometry(1.6, 0.06, 1.4), woodL, 0, TABLE_Y - 0.09, 0, G, 0);
  M(new THREE.CylinderGeometry(0.12, 0.16, TABLE_Y - 0.12, 12), wood, 0, (TABLE_Y - 0.12) / 2, 0, G, 0.02, 0.14);
  M(new THREE.CylinderGeometry(0.5, 0.56, 0.06, 20), wood, 0, 0.03, 0, G, 0.02, 0.5);
  // stools on both sides
  for (const z of [SEAT_Z, -SEAT_Z]) { M(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 18), toon('#9c2a36'), 0, 0.56, z, G, 0.02, 0.3); M(new THREE.CylinderGeometry(0.05, 0.07, 0.52, 8), brass, 0, 0.26, z, G, 0.015, 0.06); M(new THREE.CylinderGeometry(0.22, 0.24, 0.04, 14), brass, 0, 0.02, z, G, 0.015, 0.22); }
  // pendant lamp
  const shade = M(new THREE.CylinderGeometry(0.42, 0.5, 0.12, 24), toon('#2f6b4f'), 0, H - 0.06, 0, G, 0.02, 0.45);   // a flush ceiling lamp (never in the camera's way)
  const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.02, 24), new THREE.MeshBasicMaterial({ color: 0xfff1c8 })); bulb.position.set(0, H - 0.13, 0); G.add(bulb);
  const lamp = new THREE.PointLight(0xffe2b0, 2.6, 7, 1.2); lamp.position.set(0, H - 0.5, 0); G.add(lamp);
  // window with night/day glow, bookshelf, a sign, a plant, a wall clock
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), new THREE.MeshBasicMaterial({ map: canvasTex(256, 192, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1b2350'); gr.addColorStop(1, '#5a4a8a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; for (let i = 0; i < 26; i++) g.fillRect(rr(0, w), rr(0, h * 0.7), 2, 2); g.fillStyle = '#ffe9b0'; g.beginPath(); g.arc(w * 0.75, h * 0.25, 16, 0, 7); g.fill(); g.fillStyle = '#141a33'; g.fillRect(0, h * 0.78, w, h); }) }));
  win.position.set(-W / 2 + 0.01, 1.85, -0.6); win.rotation.y = Math.PI / 2; G.add(win);
  for (const [y, z, w, h] of [[1.85, -0.6, 0.08, 1.32], [1.85, -0.6 - 0.84, 0.08, 1.32], [1.85, -0.6 + 0.84, 0.08, 1.32]]) M(new THREE.BoxGeometry(0.08, h, w), wood, -W / 2 + 0.04, y, z, G, 0.01);
  M(new THREE.BoxGeometry(0.08, 0.08, 1.76), wood, -W / 2 + 0.04, 2.48, -0.6, G, 0.01); M(new THREE.BoxGeometry(0.14, 0.08, 1.76), wood, -W / 2 + 0.06, 1.24, -0.6, G, 0.01);
  const shelf = new THREE.Group(); shelf.position.set(1.9, 0, -D / 2 + 0.3); shelf.rotation.y = Math.PI / 2; G.add(shelf);
  M(new THREE.BoxGeometry(0.5, 2.2, 1.6), wood, 0, 1.1, 0, shelf, 0.02);
  const bookCols = ['#c42d3c', '#e6b45a', '#38bdf8', '#22c55e', '#f3f2f2', '#7c3aed', '#ec3013'];
  for (let r = 0; r < 4; r++) { M(new THREE.BoxGeometry(0.46, 0.03, 1.5), woodL, -0.03, 0.3 + r * 0.5, 0, shelf, 0); let z = -0.68; while (z < 0.62) { const w = rr(0.06, 0.12), h = rr(0.26, 0.4); const bk = M(new THREE.BoxGeometry(0.3, h, w), toon(pick(bookCols)), -0.08, 0.32 + r * 0.5 + h / 2, z + w / 2, shelf, 0); bk.rotation.x = rr(-0.05, 0.05); z += w + 0.01; } }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.5), new THREE.MeshBasicMaterial({ map: canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#141a33'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e6b45a'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#f6e7c8'; g.font = `900 64px ${FONT}`; g.textBaseline = 'middle'; g.fillText('CHESS CLUB', 30, h / 2 + 4); g.fillStyle = '#ec3013'; g.fillRect(w - 86, 30, 54, 68); g.fillStyle = '#fff'; g.font = `900 52px ${FONT}`; g.fillText('8', w - 74, h / 2 + 4); }) }));
  sign.position.set(0, 2.75, -D / 2 + 0.02); G.add(sign);
  const pot = new THREE.Group(); pot.position.set(-W / 2 + 0.6, 0, D / 2 - 0.7); G.add(pot);
  M(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 14), toon('#c2410c'), 0, 0.2, 0, pot, 0.02, 0.2);
  for (let i = 0; i < 6; i++) M(new THREE.SphereGeometry(rr(0.16, 0.24), 10, 8), toon(pick(['#2f6b2a', '#3f8a35', '#2a5a26'])), rr(-0.15, 0.15), rr(0.55, 1.0), rr(-0.15, 0.15), pot, 0.015, 0.2);
  const clock = M(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 24), toon('#f6e7c8'), -1.8, 2.3, -D / 2 + 0.04, G, 0.02, 0.28); clock.rotation.x = Math.PI / 2;
  for (const [l, a] of [[0.18, 0.4], [0.24, 2.2]]) { const hnd = M(new THREE.BoxGeometry(0.025, l, 0.01), toon('#141a33'), -1.8 + Math.sin(a) * l / 2, 2.3 + Math.cos(a) * l / 2, -D / 2 + 0.075, G, 0); hnd.rotation.z = -a; }
  // second (decor) table by the shelf, set for a game
  M(new THREE.BoxGeometry(0.9, 0.05, 0.9), wood, -2.6, 0.75, -2.6, G, 0.02); M(new THREE.CylinderGeometry(0.07, 0.1, 0.72, 8), wood, -2.6, 0.37, -2.6, G, 0.015, 0.08);
  return { group: G, lamp, shade, bulb, W, D, H };
}

// ---------------- the pieces ----------------
function pieceGeos() {
  const lathe = (pts, seg = 20) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
  const base = (r = 0.056) => [[0, 0], [r, 0], [r, 0.014], [r * 0.86, 0.024], [r * 0.9, 0.034], [r * 0.66, 0.044]];
  const sph = (r, y, sy = 1) => { const g = new THREE.SphereGeometry(r, 14, 10); g.scale(1, sy, 1); g.translate(0, y, 0); return g; };
  const box = (w, h, d, x, y, z) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return g; };
  const G = {};
  G.p = mergeGeos([lathe([...base(0.05), [0.026, 0.09], [0.04, 0.1], [0.04, 0.107], [0.02, 0.113], [0, 0.113]]), sph(0.034, 0.138)]);
  G.r = mergeGeos([lathe([...base(0.056), [0.04, 0.13], [0.052, 0.14], [0.052, 0.19], [0, 0.19]]), ...[0, 1, 2, 3].map(i => { const a = i * Math.PI / 2 + Math.PI / 4, g = box(0.03, 0.03, 0.03, Math.cos(a) * 0.04, 0.205, Math.sin(a) * 0.04); return g; })]);
  G.b = mergeGeos([lathe([...base(0.054), [0.026, 0.12], [0.044, 0.128], [0.044, 0.136], [0.022, 0.142], [0, 0.142]]), sph(0.036, 0.19, 1.45), sph(0.014, 0.25)]);
  G.q = mergeGeos([lathe([...base(0.058), [0.03, 0.16], [0.05, 0.17], [0.05, 0.178], [0.034, 0.186], [0.054, 0.236], [0.03, 0.236], [0, 0.22]]), ...Array.from({ length: 8 }, (_, i) => sph(0.012, 0.242, 1).translate(Math.cos(i * Math.PI / 4) * 0.046, 0, Math.sin(i * Math.PI / 4) * 0.046)), sph(0.022, 0.25)]);
  G.k = mergeGeos([lathe([...base(0.06), [0.032, 0.17], [0.052, 0.18], [0.052, 0.188], [0.034, 0.196], [0.048, 0.24], [0, 0.248]]), box(0.018, 0.07, 0.018, 0, 0.28, 0), box(0.056, 0.018, 0.018, 0, 0.29, 0)]);
  { const sh = new THREE.Shape(); const P = [[-0.04, 0], [0.042, 0], [0.036, 0.05], [0.03, 0.09], [0.058, 0.1], [0.07, 0.125], [0.062, 0.14], [0.03, 0.15], [0.018, 0.19], [0.0, 0.2], [-0.012, 0.21], [-0.022, 0.19], [-0.042, 0.16], [-0.05, 0.1], [-0.04, 0.05]];
    sh.moveTo(P[0][0], P[0][1]); P.slice(1).forEach(([x, y]) => sh.lineTo(x, y)); sh.closePath();
    const head = new THREE.ExtrudeGeometry(sh, { depth: 0.046, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 2, curveSegments: 4 }); head.translate(0, 0.04, -0.023); head.rotateY(-Math.PI / 2); head.deleteAttribute('uv');
    G.n = mergeGeos([lathe(base(0.056)), head]); }
  for (const k in G) { G[k].computeBoundingBox(); G[k].userData.out = inflate(G[k], 0.0055); }
  // gold details: each piece type gets its own marks so the types read at a glance, on both colours
  const ring = (r, y, tube = 0.0065) => { const g = new THREE.TorusGeometry(r, tube, 6, 24); g.rotateX(Math.PI / 2); g.translate(0, y, 0); return g; };
  const A = {   // the top of each piece is its name tag: pawn plain, rook gold battlements, knight gold eye + mane, bishop gold slit + ball, queen gold crown, king gold cross
    p: mergeGeos([ring(0.0405, 0.1035, 0.004)]),
    r: mergeGeos([ring(0.053, 0.19, 0.007), ...[0, 1, 2, 3].map(i => { const a = i * Math.PI / 2 + Math.PI / 4; return box(0.032, 0.032, 0.032, Math.cos(a) * 0.04, 0.206, Math.sin(a) * 0.04); })]),
    n: mergeGeos([sph(0.012, 0.196).translate(0.031, 0, 0.018), sph(0.012, 0.196).translate(-0.031, 0, 0.018), box(0.016, 0.07, 0.02, 0, 0.19, -0.035).rotateX(0)]),
    b: mergeGeos([sph(0.018, 0.258), box(0.009, 0.045, 0.078, 0, 0.205, 0)]),
    q: mergeGeos([...Array.from({ length: 8 }, (_, i) => sph(0.0145, 0.246, 1).translate(Math.cos(i * Math.PI / 4) * 0.047, 0, Math.sin(i * Math.PI / 4) * 0.047)), sph(0.025, 0.256)]),
    k: mergeGeos([box(0.024, 0.09, 0.024, 0, 0.292, 0), box(0.072, 0.024, 0.024, 0, 0.302, 0)]),
  };
  return { G, A };
}
const PSCALE = 1.12, PIECE_H = { p: 0.17 * PSCALE, n: 0.25 * PSCALE, b: 0.27 * PSCALE, r: 0.22 * PSCALE, q: 0.28 * PSCALE, k: 0.34 * PSCALE };

// ================================================================================================
export async function createChessClub({ container, onState = () => {}, opts = {} } = {}) {
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch || devicePixelRatio < 2 }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.75 : 2)); renderer.setSize(CW(), CH());
  renderer.shadowMap.enabled = !touch; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#141a20'); const camera = new THREE.PerspectiveCamera(42, CW() / CH(), 0.05, 60);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); }; toon.grad = grad;
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  M.scene = scene;
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  scene.add(new THREE.HemisphereLight(0xfff1dd, 0x3a2a2a, 1.1)); const sun = new THREE.DirectionalLight(0xfff0d8, 1.25); sun.position.set(-3, 6, 2); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 }); scene.add(sun);
  const room = buildParlor({ toon, M, scene });
  // polish: a cool rim light from behind each seat so silhouettes separate from the walls, a warm pool of lamp light on the table, dust in the light
  const rim = new THREE.DirectionalLight(0x9fc4ff, 0.55); rim.position.set(2, 3.5, -5); scene.add(rim); const rim2 = new THREE.DirectionalLight(0xffd9a8, 0.35); rim2.position.set(-2, 3, 5); scene.add(rim2);
  const pool1 = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: glowTex, color: 0xffc77a, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })); pool1.position.y = 0.012; scene.add(pool1);
  const dust = (() => { const n = 70, g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), seed = []; for (let i = 0; i < n; i++) { seed.push([rr(-1.3, 1.3), rr(0.9, 3.1), rr(-1.3, 1.3), rr(0, 6)]); }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex, color: 0xffe6b8, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(pts);
    return { pts, seed, step(t) { for (let i = 0; i < n; i++) { const [x, y, z, ph] = seed[i]; pos[i * 3] = x + Math.sin(t * 0.13 + ph) * 0.25; pos[i * 3 + 1] = y + Math.sin(t * 0.09 + ph * 2) * 0.2; pos[i * 3 + 2] = z + Math.cos(t * 0.11 + ph) * 0.25; } g.attributes.position.needsUpdate = true; } }; })();
  // a thought bubble over a fox that is thinking
  const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false, transparent: true, map: (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; })() })); bubble.scale.set(0.5, 0.25, 1); bubble.renderOrder = 45; bubble.visible = false; scene.add(bubble);
  function drawBubble(k) { const c = bubble.material.map.userData.c, g = c.getContext('2d'); g.clearRect(0, 0, 256, 128); g.fillStyle = '#fbf4e4'; g.strokeStyle = '#1a1626'; g.lineWidth = 7; g.beginPath(); g.ellipse(128, 56, 112, 46, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(70, 112, 10, 0, 7); g.fill(); g.stroke();
    for (let i = 0; i < 3; i++) { g.fillStyle = i === k ? '#ec3013' : '#1a1626'; g.beginPath(); g.arc(80 + i * 48, 56, 13, 0, 7); g.fill(); } bubble.material.map.needsUpdate = true; }

  // ---------- board: one canvas texture holds the squares, labels and every highlight ----------
  const BPX = 1024, bCan = document.createElement('canvas'); bCan.width = bCan.height = BPX; const bg = bCan.getContext('2d'), bTex = new THREE.CanvasTexture(bCan); bTex.colorSpace = THREE.SRGBColorSpace; bTex.anisotropy = 8;
  const FULL = 2 * HALF + 2 * BORDER, PX = BPX / FULL, SQ = S * PX, OFF = BORDER * PX;
  M(new THREE.BoxGeometry(FULL + 0.02, 0.045, FULL + 0.02), toon('#3a2214'), 0, TABLE_Y + 0.0225, 0, scene, 0.012);
  const boardTop = new THREE.Mesh(new THREE.PlaneGeometry(FULL, FULL), new THREE.MeshToonMaterial({ map: bTex, gradientMap: grad })); boardTop.rotation.x = -Math.PI / 2; boardTop.position.y = BOARD_Y + 0.0005; boardTop.receiveShadow = !touch; scene.add(boardTop);
  const THEMES = { wood: ['#ecd3a6', '#a8703f', '#3a2214', '#e6b45a'], contrast: ['#ffffff', '#3b6ea8', '#0b1020', '#ffd23a'] };

  // ---------- state ----------
  let prefs = { sound: true, music: true, icons: false, speak: false, theme: 'wood', autoFlip: true, view: 'play', color: 'w', level: 1, tc: 'none' };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')); } catch (e) {}
  const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {} };
  let chess = new Chess(), phase = 'menu', mode = 'cpu', level = prefs.level, myColor = 'w', practice = false, over = null, sel = -1, targets = [], hint = null, promoAsk = null;
  let cpuBusy = false, cpuTok = 0, hintBusy = false, anims = [], say = null, toast = null, live = '', povColor = 'w', clocks = null, safe = { top: 0, bottom: 0, left: 0, right: 0 };
  let started = 0, cursor = -1, flash = null, topple = null, lastTick = -1;   // first move made (local clocks start then) · keyboard cursor square

  // ---------- pieces ----------
  // pieces: a brighter toon ramp so neither colour sinks into the board; black pieces get a light rim so their shapes read on dark squares
  const pGrad = (() => { const d = new Uint8Array([150, 150, 150, 255, 210, 210, 210, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
  const { G: GEOS, A: ACCENT } = pieceGeos(), pool = {}, onBoard = new Map(), trays = { w: [], b: [] };   // trays[c] = pieces captured BY colour c
  const PMAT = { w: new THREE.MeshToonMaterial({ color: '#f6ecd8', gradientMap: pGrad }), b: new THREE.MeshToonMaterial({ color: '#4a4058', gradientMap: pGrad, emissive: '#1a1424' }) };
  const POUT = { w: outlineMat, b: new THREE.MeshBasicMaterial({ color: 0xf1e2c0, side: THREE.BackSide }) };
  const GOLD = { w: new THREE.MeshToonMaterial({ color: '#c8901e', gradientMap: pGrad }), b: new THREE.MeshToonMaterial({ color: '#ffcc4d', gradientMap: pGrad, emissive: '#5a3a00' }) };
  const shadowTex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 4, 32, 32, 31); r.addColorStop(0, 'rgba(20,10,0,0.55)'); r.addColorStop(0.6, 'rgba(20,10,0,0.25)'); r.addColorStop(1, 'rgba(20,10,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }), shadowGeo = new THREE.PlaneGeometry(0.15, 0.15).rotateX(-Math.PI / 2);
  const GLYPH3 = { p: '\u265F', n: '\u265E', b: '\u265D', r: '\u265C', q: '\u265B', k: '\u265A' }, iconTex = {};
  function iconFor(letter) { if (iconTex[letter]) return iconTex[letter]; const c = colorOf(letter);
    iconTex[letter] = new THREE.SpriteMaterial({ depthTest: false, transparent: true, map: canvasTex(128, 128, (g) => { g.fillStyle = c === 'w' ? '#fbf4e4' : '#231d2c'; g.strokeStyle = c === 'w' ? '#231d2c' : '#ffcc4d'; g.lineWidth = 8; g.beginPath(); g.arc(64, 64, 56, 0, 7); g.fill(); g.stroke(); g.fillStyle = c === 'w' ? '#231d2c' : '#fbf4e4'; g.font = '82px "DejaVu Sans", "Segoe UI Symbol", "Apple Symbols", serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(GLYPH3[letter.toLowerCase()] + '\uFE0E', 64, 70); }) }); return iconTex[letter]; }
  function makePiece(letter) { const c = colorOf(letter), t = letter.toLowerCase(), g = new THREE.Group(), body = new THREE.Group(); g.add(body); body.scale.setScalar(PSCALE);
    const m = new THREE.Mesh(GEOS[t], PMAT[c]); m.castShadow = !touch; body.add(m); body.add(new THREE.Mesh(GEOS[t].userData.out, POUT[c])); body.add(new THREE.Mesh(ACCENT[t], GOLD[c]));
    if (t === 'n') body.rotation.y = c === 'w' ? -2.1 : 1.04;   /* knights stand side-on so the horse profile reads from either chair */
    const sh = new THREE.Mesh(shadowGeo, shadowMat); sh.position.y = 0.002; sh.renderOrder = 1; g.add(sh);
    const ic = new THREE.Sprite(iconFor(letter)); ic.scale.setScalar(0.085); ic.position.y = PIECE_H[t] + 0.07; ic.renderOrder = 40; ic.visible = false; g.add(ic);
    g.userData = { letter, body, sh, ic }; scene.add(g); return g; }
  function takePiece(letter) { const L = pool[letter] || (pool[letter] = []); const p = L.find(o => !o.visible) || (L.push(makePiece(letter)), L[L.length - 1]); p.visible = true; p.scale.setScalar(1); p.userData.body.rotation.z = 0; p.userData.body.position.set(0, 0, 0); p.userData.body.scale.setScalar(PSCALE); p.userData.spin = 0; p.userData.pop = 0; return p; }
  const trayPos = (c, i) => { const side = c === 'w' ? 1 : -1, col = Math.floor(i / 8), row = i % 8; return V3(side * (HALF + BORDER + 0.07 + col * 0.09), TABLE_Y, side * (HALF - 0.05 - row * 0.1)); };   // on the capturer's right
  function syncPieces() {   // place every piece from chess.b, captured ones into the trays (no animation)
    anims = []; for (const L of Object.values(pool)) L.forEach(p => p.visible = false); onBoard.clear(); trays.w = []; trays.b = [];
    chess.b.forEach((pc, i) => { if (!pc) return; const o = takePiece(pc); o.position.copy(sqPos(i)); onBoard.set(i, o); });
    for (const h of chess.history) if (h.cap) { const by = h.color, o = takePiece(h.cap); o.position.copy(trayPos(by, trays[by].length)); o.scale.setScalar(0.8); trays[by].push(o); }
  }
  function flushAnims() { for (const a of anims) { if (a.fin) continue; a.o.position.copy(a.b); if (a.scl) a.o.scale.setScalar(a.scl); a.fin = true; a.done && a.done(); } anims = []; }
  function animMove(m) {   // m: a played move record
    flushAnims(); const o = onBoard.get(m.from); if (!o) { syncPieces(); return; }
    const capSq = m.flag === 'ep' ? m.to + (m.color === 'w' ? 8 : -8) : m.to, victim = m.cap ? onBoard.get(capSq) : null;
    onBoard.delete(m.from); if (victim) onBoard.delete(capSq); onBoard.set(m.to, o);
    const dur = 0.32, hop = m.piece.toLowerCase() === 'n' ? 0.18 : 0.06;
    anims.push({ o, a: o.position.clone(), b: sqPos(m.to), t: 0, dur, hop, done: () => { const t = m.piece.toLowerCase(), pan = clamp(((m.to & 7) - 3.5) / 5, -0.7, 0.7);
      if (m.promo) { o.visible = false; const np = takePiece(m.promo); np.position.copy(sqPos(m.to)); onBoard.set(m.to, np); np.userData.pop = 1; puff(sqPos(m.to, BOARD_Y + 0.1), 0xffd23a, 8); sfx('promote'); }
      if (m.cap) { sfx('cap', { t, pan }); puff(sqPos(m.to, BOARD_Y + 0.03), 0xf6e7c8, 4); } else if (m.flag === 'K' || m.flag === 'Q') sfx('castle'); else sfx('move', { t, pan }); } });
    if (victim) { const by = m.color, dst = trayPos(by, trays[by].length); trays[by].push(victim); victim.userData.spin = rr(-9, 9); anims.push({ o: victim, a: victim.position.clone(), b: dst, t: -dur * 0.7, dur: 0.5, hop: 0.38, scl: 0.8, done: () => { victim.userData.spin = 0; victim.userData.body.rotation.z = 0; audio.sfx('tray'); } }); }
    if (m.flag === 'K' || m.flag === 'Q') { const rf = m.flag === 'K' ? m.to + 1 : m.to - 2, rt = m.flag === 'K' ? m.to - 1 : m.to + 1, ro = onBoard.get(rf); if (ro) { onBoard.delete(rf); onBoard.set(rt, ro); anims.push({ o: ro, a: ro.position.clone(), b: sqPos(rt), t: -0.12, dur: 0.3, hop: 0.12 }); } }
  }

  // ---------- puffs + sound + speech ----------
  const sparks = []; for (let i = 0; i < 18; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.12); scene.add(s); sparks.push({ s, life: 0, v: V3() }); } let spI = 0;
  function puff(p, col = 0xffffff, n = 3) { for (let i = 0; i < n; i++) { const k = sparks[spI = (spI + 1) % sparks.length]; k.s.position.copy(p); k.s.material.color.setHex(col); k.life = 1; k.v.set(rr(-0.4, 0.4), rr(0.4, 0.9), rr(-0.4, 0.4)); } }
  const urlMusic = !/[?&]music=0/.test(location.search), urlSfx = !/[?&]sfx=0/.test(location.search);
  const audio = createChessAudio({ sound: prefs.sound && urlSfx, music: prefs.music && urlMusic });
  const ac = () => audio.unlock();
  const unlockAll = () => audio.unlock(); document.addEventListener('pointerdown', unlockAll, true); document.addEventListener('keydown', unlockAll, true);
  const uiClick = e => { if (e.target && e.target.closest && e.target.closest('button')) audio.sfx('ui'); }; document.addEventListener('click', uiClick, true);
  const buzz = ms => { try { if (mode !== 'demo' && navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(ms); } catch (e) {} };
  function sfx(k, o) { const map = { cap: 'capture', sel: 'pick' }; audio.sfx(map[k] || k, o); if (k === 'move') buzz(8); else if (k === 'cap' || k === 'capture') buzz([10, 30, 14]); else if (k === 'check') buzz(25); }
  const COLOR_WORD = { w: 'White', b: 'Black' };
  function describe(h) {   // spoken / screen-reader words for a move
    if (!h) return ''; const who = COLOR_WORD[h.color] + ' ';
    if (h.flag === 'K') return who + 'castles king side' + (h.san.includes('#') ? ', checkmate' : h.san.includes('+') ? ', check' : '');
    if (h.flag === 'Q') return who + 'castles queen side' + (h.san.includes('#') ? ', checkmate' : h.san.includes('+') ? ', check' : '');
    let s = who + PIECE_NAMES[h.piece.toLowerCase()] + ' ' + sqName(h.from) + (h.cap ? ' takes ' + PIECE_NAMES[h.cap.toLowerCase()] + ' on ' : ' to ') + sqName(h.to);
    if (h.promo) s += ', becomes a ' + PIECE_NAMES[h.promo.toLowerCase()]; if (h.flag === 'ep') s += ', en passant';
    return s + (h.san.includes('#') ? ', checkmate' : h.san.includes('+') ? ', check' : '');
  }
  function speak(text) { if (!prefs.speak || !text || !window.speechSynthesis) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.05; u.onstart = () => audio.duck(true); u.onend = u.onerror = () => audio.duck(false); speechSynthesis.speak(u); } catch (e) {} }

  // ---------- board drawing ----------
  function drawBoard() {
    const [L, D, FR, ACC] = THEMES[prefs.theme] || THEMES.wood, flip = povColor === 'b';
    bg.fillStyle = FR; bg.fillRect(0, 0, BPX, BPX);
    for (let i = 0; i < 64; i++) { const f = i & 7, r = i >> 3; bg.fillStyle = (f + r) & 1 ? D : L; bg.fillRect(OFF + f * SQ, OFF + r * SQ, SQ + 0.5, SQ + 0.5); }
    if (prefs.theme === 'wood') { if (!drawBoard.grain) { const gc = document.createElement('canvas'); gc.width = gc.height = BPX; const gg = gc.getContext('2d'); for (let i = 0; i < 64; i++) { const f = i & 7, r = i >> 3, x0 = OFF + f * SQ, y0 = OFF + r * SQ, hor = (f + r) & 1; gg.save(); gg.beginPath(); gg.rect(x0, y0, SQ, SQ); gg.clip(); for (let k = 0; k < 16; k++) { gg.strokeStyle = `rgba(${hor ? '40,20,0' : '90,50,10'},${rr(0.04, 0.12)})`; gg.lineWidth = rr(1, 3); gg.beginPath(); const o = rr(0, SQ); if (hor) { gg.moveTo(x0, y0 + o); gg.bezierCurveTo(x0 + SQ * 0.3, y0 + o + rr(-6, 6), x0 + SQ * 0.7, y0 + o + rr(-6, 6), x0 + SQ, y0 + o + rr(-3, 3)); } else { gg.moveTo(x0 + o, y0); gg.bezierCurveTo(x0 + o + rr(-6, 6), y0 + SQ * 0.3, x0 + o + rr(-6, 6), y0 + SQ * 0.7, x0 + o + rr(-3, 3), y0 + SQ); } gg.stroke(); } gg.restore(); } drawBoard.grain = gc; } bg.drawImage(drawBoard.grain, 0, 0); }
    bg.strokeStyle = ACC; bg.lineWidth = 5; bg.strokeRect(OFF - 9, OFF - 9, 8 * SQ + 18, 8 * SQ + 18); bg.lineWidth = 1.5; bg.strokeRect(OFF - 3, OFF - 3, 8 * SQ + 6, 8 * SQ + 6);
    const fillSq = (i, col, a) => { bg.globalAlpha = a; bg.fillStyle = col; bg.fillRect(OFF + (i & 7) * SQ, OFF + (i >> 3) * SQ, SQ, SQ); bg.globalAlpha = 1; };
    const last = chess.history[chess.history.length - 1];
    if (last) { fillSq(last.from, '#ffd23a', 0.32); fillSq(last.to, '#ffd23a', 0.45); }
    if (sel >= 0) { fillSq(sel, '#ffd23a', 0.75); }
    if (hint) { fillSq(hint.from, '#38bdf8', 0.55); fillSq(hint.to, '#38bdf8', 0.55); const a = [OFF + ((hint.from & 7) + 0.5) * SQ, OFF + ((hint.from >> 3) + 0.5) * SQ], b = [OFF + ((hint.to & 7) + 0.5) * SQ, OFF + ((hint.to >> 3) + 0.5) * SQ]; bg.strokeStyle = 'rgba(14,90,160,0.85)'; bg.lineWidth = SQ * 0.16; bg.lineCap = 'round'; bg.beginPath(); bg.moveTo(...a); bg.lineTo(...b); bg.stroke(); }
    if (chess.inCheck() && !over) { const k = chess.kings[chess.turn], cx = OFF + ((k & 7) + 0.5) * SQ, cy = OFF + ((k >> 3) + 0.5) * SQ, g = bg.createRadialGradient(cx, cy, 2, cx, cy, SQ * 0.7); g.addColorStop(0, 'rgba(236,48,19,1)'); g.addColorStop(1, 'rgba(236,48,19,0)'); bg.fillStyle = g; bg.fillRect(cx - SQ / 2, cy - SQ / 2, SQ, SQ); }
    if (cursor >= 0) { bg.strokeStyle = '#38bdf8'; bg.lineWidth = SQ * 0.08; bg.strokeRect(OFF + (cursor & 7) * SQ + SQ * 0.06, OFF + (cursor >> 3) * SQ + SQ * 0.06, SQ * 0.88, SQ * 0.88); }
    for (const m of targets) { const cx = OFF + ((m.to & 7) + 0.5) * SQ, cy = OFF + ((m.to >> 3) + 0.5) * SQ; bg.fillStyle = 'rgba(20,16,30,0.5)'; bg.strokeStyle = 'rgba(20,16,30,0.55)'; if (m.cap) { bg.lineWidth = SQ * 0.09; bg.beginPath(); bg.arc(cx, cy, SQ * 0.42, 0, 7); bg.stroke(); } else { bg.beginPath(); bg.arc(cx, cy, SQ * 0.17, 0, 7); bg.fill(); } }
    // coordinates on the frame, readable from the viewer's side
    bg.fillStyle = ACC; bg.font = `800 ${Math.round(OFF * 0.62)}px ${FONT}`; bg.textAlign = 'center'; bg.textBaseline = 'middle';
    const txt = (s, x, y) => { bg.save(); bg.translate(x, y); if (flip) bg.rotate(Math.PI); bg.fillText(s, 0, 0); bg.restore(); };
    for (let f = 0; f < 8; f++) { txt('abcdefgh'[f], OFF + (f + 0.5) * SQ, flip ? OFF / 2 : BPX - OFF / 2); }
    for (let r = 0; r < 8; r++) { txt(String(8 - r), flip ? BPX - OFF / 2 : OFF / 2, OFF + (r + 0.5) * SQ); }
    bTex.needsUpdate = true;
  }

  // ---------- foxes ----------
  let rigs = {}; try { rigs = await loadCastRigs(); } catch (e) {}
  const CK = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs), foxes = {};
  const FOXDEF = {
    player: () => kit.makeFox({ ...CAST.player, gear: 'none' }),
    pip: () => kit.makeFox({ key: 'pip', torso: ['#ffd23a', '#fff7d6', '#b45309'], crest: '8', look: { ...PLAYER_FEMALE, bodyScale: (PLAYER_FEMALE.bodyScale || 1) * 0.86 }, outfit: 'vest', eyes: ['#22c55e', '#22c55e'], mood: 'excited' }),
    hope: () => kit.makeFox({ ...CAST.hope }), noble: () => CK.make('noble'),   // Hope sits, so her cane rests against the table (prop below)
  };
  NET_COLS.forEach(([n, col], i) => FOXDEF['net' + i] = () => kit.makeFox({ key: 'net' + i, torso: [col, '#f3f2f2', '#201e1d'], crest: '8', look: i % 2 ? PLAYER_FEMALE : PLAYER_MALE, outfit: 'vest', eyes: ['#38bdf8', '#38bdf8'], mood: 'happy' }));
  function fox(id) { if (!foxes[id]) { const f = FOXDEF[id](); f.visible = false; f.userData.id = id; f.userData.lookAt = BOARD_LOOK; foxes[id] = f; } return foxes[id]; }
  const cane = new THREE.Group(); { M(new THREE.CylinderGeometry(0.022, 0.022, 1.25, 8), toon('#f8fafc'), 0, 0.62, 0, cane, 0.01, 0.022); M(new THREE.CylinderGeometry(0.0225, 0.0225, 0.2, 8), toon('#dc2626'), 0, 0.12, 0, cane, 0.01, 0.0225); M(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8), toon('#1f2937'), 0, 1.2, 0, cane, 0.01, 0.03); cane.rotation.z = -0.32; scene.add(cane); cane.visible = false; }
  let seated = { w: null, b: null }, standing = [];   // fox ids
  function placeFoxes() {
    for (const f of Object.values(foxes)) f.visible = false;
    cane.visible = false;
    for (const c of ['w', 'b']) { const id = seated[c]; if (!id) continue; const f = fox(id), z = c === 'w' ? SEAT_Z : -SEAT_Z, chair = !!f.userData.chair; f.visible = !(phase === 'play' && c === povColor);   /* your own fox would sit between you and the board */ f.position.set(0, chair ? 0 : -0.14, chair ? z * 1.12 : z); f.rotation.y = c === 'w' ? Math.PI : 0; f.userData.sit = !chair; f.userData.seat = c;
      if (id === 'hope') { cane.visible = true; cane.position.set(0.78, 0, z * 0.62); } }
    standing.forEach((id, i) => { const f = fox(id); f.visible = true; f.userData.sit = false; f.userData.seat = null; f.position.set(-1.55, 0, [0, -0.85, 0.85][i] || 0); f.rotation.y = Math.atan2(-f.position.x, -f.position.z); });
  }
  const oppOf = () => OPPONENTS[level] || OPPONENTS[1];
  const cpuFoxId = () => ['pip', 'hope', 'noble'][level] || 'hope';
  function foxOn(c) { const id = seated[c]; return id ? fox(id) : null; }
  function mood(c, m, secs = 2.4) { const f = foxOn(c); if (!f) return; f.userData.mood = m; f.userData.moodT = secs; if (m === 'excited') f.userData.hop = 1; }
  function talk(c, text, who) { const f = foxOn(c); if (f) f.userData.say = { text, t: 0 }; say = { who: who || '', text, t: Math.max(2.6, text.length * 0.07), col: c }; emit(); }
  function oppLine(k) { const O = oppOf(); const L = O.lines[k]; if (L) talk(cpuColor(), pick(L), O.name); }

  // ---------- camera ----------
  const fitCam = new THREE.PerspectiveCamera(42, 1, 0.05, 60), _p = V3(); let camGoal = { pos: V3(4, 2, 0), look: V3(0, BOARD_Y, 0) }, camLook = V3(0, BOARD_Y, 0), orbitT = 0, camSnap = true;
  function fitShot(pts, el, yaw) {
    const W = CW(), H = CH(); fitCam.aspect = W / H; fitCam.fov = W / H < 0.75 ? 46 : 40; fitCam.updateProjectionMatrix(); const m = 0.04;
    const yT = 1 - 2 * safe.top / H - m, yB = -1 + 2 * safe.bottom / H + m, xR = 1 - 2 * safe.right / W - m, xL = -1 + 2 * safe.left / W + m, sx = (xL + xR) / 2, sy = (yT + yB) / 2;
    const dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), -Math.cos(yaw) * Math.cos(el)), tgt = V3(); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / pts.length);
    const bounds = d => { fitCam.position.copy(tgt).addScaledVector(dir, d); fitCam.lookAt(tgt); fitCam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitCam); if (_p.z > 1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
    const fits = d => { const b = bounds(d); return b && b.x0 >= xL && b.x1 <= xR && b.y0 >= yB && b.y1 <= yT; };
    let d = 3; for (let it = 0; it < 4; it++) { let lo = 0.3, hi = 30; for (let k = 0; k < 20; k++) { const md = (lo + hi) / 2; if (fits(md)) hi = md; else lo = md; } d = hi; const b = bounds(d); if (!b) break;
      const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, th = Math.tan(fitCam.fov * Math.PI / 360) * d, right = V3().setFromMatrixColumn(fitCam.matrixWorld, 0), up = V3().setFromMatrixColumn(fitCam.matrixWorld, 1);
      tgt.addScaledVector(right, (cx - sx) * th * fitCam.aspect).addScaledVector(up, (cy - sy) * th); }
    return { pos: tgt.clone().addScaledVector(dir, d), look: tgt };
  }
  const VIEWS = ['play', 'top', 'table'];
  function aimCamera() {
    const port = CH() > CW(), yaw = povColor === 'w' ? Math.PI : 0, e = HALF + BORDER, pts = [];
    for (const [x, z] of [[-e, -e], [e, -e], [-e, e], [e, e]]) { pts.push(V3(x, BOARD_Y, z)); }
    let el;
    if (phase === 'menu') { return; }
    if (prefs.view === 'top') el = 1.5; else if (prefs.view === 'table') { el = 0.62; const s = povColor === 'w' ? -1 : 1; pts.push(V3(-0.5, 2.3, s * SEAT_Z), V3(0.5, 2.3, s * SEAT_Z)); } else { el = port ? 1.12 : 0.98; pts.push(V3(-e, BOARD_Y + 0.3, -e * (povColor === 'w' ? 1 : -1)), V3(e, BOARD_Y + 0.3, -e * (povColor === 'w' ? 1 : -1))); }
    camGoal = fitShot(pts, el, yaw); placeFoxes();
  }

  // ---------- who moves ----------
  const cpuColor = () => mode === 'demo' ? chess.turn : (myColor === 'w' ? 'b' : 'w');
  function humanCanMove() {
    if (phase !== 'play' || over || promoAsk) return false;
    if (mode === 'cpu') return chess.turn === myColor && !cpuBusy;
    if (mode === 'local') return true;
    if (mode === 'net') return !!NET.room && NET.seatOf(NET.me) === chess.turn && NET.state && NET.state.live;
    return false;
  }
  function clearSel() { sel = -1; targets = []; }

  // ---------- making moves ----------
  function playMove(req, fromNet = false) {
    const h = chess.move(req); if (!h) { sfx('bad'); return null; }
    clearSel(); hint = null; started = 1; animMove(h); live = describe(h); speak(live);
    if (clocks && clocks.inc) clocks[h.color] += clocks.inc * 1000;
    afterMove(h, fromNet); return h;
  }
  function afterMove(h, fromNet) {
    const st = chess.status(); drawBoard();
    if (st.check && !st.over) flash = { txt: 'CHECK', col: '#ec3013', t: 1.3 };
    audio.mood(st.over ? 'over' : st.check ? 'tense' : 'play');
    if (mode === 'cpu') { if (h.cap) { if (h.color === myColor) { mood(cpuColor(), 'sad'); mood(myColor, 'happy'); if (Math.random() < 0.5) oppLine('lost'); } else { mood(cpuColor(), 'happy'); if (Math.random() < 0.5) oppLine('take'); } } if (st.check && !st.over) { setTimeout(() => sfx('check'), 260); mood(chess.turn, 'surprised'); if (h.color === cpuColor()) oppLine('check'); } }
    else if (st.check && !st.over) setTimeout(() => sfx('check'), 260);
    if (mode === 'local' && prefs.autoFlip && !st.over) { povColor = chess.turn; setTimeout(() => { aimCamera(); drawBoard(); }, 450); }
    if (mode === 'demo') demoAfter(h, st);
    if (st.over) { if (mode === 'demo') demoEnd(st); else if (mode === 'net') { if (NET.isHost()) NET.hostFinish(st.result, st.reason); } else finish(st.result, st.reason); }
    else if (mode === 'cpu' && chess.turn === cpuColor()) cpuGo();
    else if (mode === 'demo') { const tok = demoTok; setTimeout(() => { if (mode === 'demo' && phase === 'play' && tok === demoTok) cpuGo(); }, demo && demo.tip ? 3600 : 1700); }   /* time to read the caption */
    if (mode === 'cpu' || mode === 'local') storeResume();
    emit();
  }
  function tryMove(from, to) {
    const cand = chess.moves(from).filter(m => m.to === to); if (!cand.length) return false;
    if (cand.some(m => m.promo)) { promoAsk = { from, to, color: chess.turn }; clearSel(); drawBoard(); emit(); return true; }
    if (mode === 'net') { const ply = chess.history.length; if (!NET.isHost()) playMove({ from, to }, true); NET.request({ k: 'move', uci: sqName(from) + sqName(to), ply }); return true; }
    playMove({ from, to }); return true;
  }

  // ---------- CPU (Worker, main-thread fallback) ----------
  let worker = null, wTok = 0, wCb = new Map(); try { worker = new Worker(new URL('./chess-rules.js', import.meta.url), { type: 'module' }); worker.onmessage = e => { const cb = wCb.get(e.data.id); wCb.delete(e.data.id); cb && cb(e.data.m); }; worker.onerror = () => { worker = null; }; } catch (e) { worker = null; }
  function ask(lvl, cb) { const id = ++wTok, hist = []; for (const [k, n] of chess.reps) for (let i = 0; i < n; i++) hist.push(k); if (worker) { wCb.set(id, cb); worker.postMessage({ id, fen: chess.fen(), hist, level: lvl }); setTimeout(() => { if (wCb.has(id)) { wCb.delete(id); const r = think(chess, lvl); cb(r && { from: r.from, to: r.to, promo: r.promo }); } }, 6000); } else setTimeout(() => { const r = think(chess, lvl); cb(r && { from: r.from, to: r.to, promo: r.promo }); }, 30); }
  function cpuGo() {
    cpuBusy = true; const tok = ++cpuTok, t0 = performance.now(), f = foxOn(cpuColor()); if (f) f.userData.mood = 'curious'; emit();
    ask(level, m => { const wait = Math.max(0, 650 + rr(0, 500) - (performance.now() - t0)); setTimeout(() => { if (tok !== cpuTok || phase !== 'play' || over) return; cpuBusy = false; const ff = foxOn(cpuColor()); if (ff) ff.userData.mood = ff.userData.base; if (m) playMove(m); else emit(); }, wait); });
  }

  // ---------- end of game ----------
  function finish(result, reason, extra = {}) {
    if (over) return; const winner = result === '1-0' ? 'w' : result === '0-1' ? 'b' : null; over = { result, reason, winner, ...extra }; clearSel(); cpuTok++; cpuBusy = false;
    let title = winner ? (COLOR_WORD[winner] + ' wins') : 'Draw', sub = reason.charAt(0).toUpperCase() + reason.slice(1), gold = 0, xp = 0, rec = null;
    if (mode === 'cpu') {
      const O = oppOf(), you = winner === myColor ? 'w' : winner ? 'l' : 'd';
      title = you === 'w' ? 'You win' : you === 'l' ? O.name + ' wins' : 'Draw';
      if (!practice) { gold = you === 'w' ? O.gold : you === 'd' ? Math.ceil(O.gold / 3) : 0; xp = you === 'w' ? O.xp : you === 'd' ? Math.ceil(O.xp / 2) : chess.history.length >= 20 ? 3 : 0; try { if (gold) save.addGold(gold); if (xp) save.addXp(xp); const k = 'chessClub.' + O.id + '.' + you; save.setStat(k, save.stat(k) + 1); if (you === 'w') save.setFlag('chessClub.beat.' + O.id); save.setStat('chessClub.games', save.stat('chessClub.games') + 1); } catch (e) {} }
      if (you === 'w') { mood(myColor, 'excited', 4); mood(cpuColor(), 'sad', 4); oppLine('lose'); sfx('win'); } else if (you === 'l') { mood(cpuColor(), 'excited', 4); mood(myColor, 'sad', 4); oppLine('win'); sfx('lose'); } else { oppLine('draw'); sfx('draw'); }
      rec = { you };
    } else { if (winner) { mood(winner, 'excited', 4); mood(winner === 'w' ? 'b' : 'w', 'sad', 4); } sfx(winner ? 'win' : 'draw');
      if (mode === 'net' && NET.seatOf(NET.me)) { const mine = NET.seatOf(NET.me), you = winner === mine ? 'w' : winner ? 'l' : 'd'; title = you === 'w' ? 'You win' : you === 'l' ? 'You lose' : 'Draw'; xp = you === 'w' ? 10 : 3; try { save.addXp(xp); const k = 'chessClub.online.' + you; save.setStat(k, save.stat(k) + 1); } catch (e) {} }
    }
    over.title = title; over.sub = sub + (practice && mode === 'cpu' ? ' · practice game (undo or hint used) · no gold' : ''); over.gold = gold; over.xp = xp; over.rec = rec;
    if (winner || /resigned|time/.test(reason)) { const loseC = winner ? (winner === 'w' ? 'b' : 'w') : null, ks = loseC ? chess.kings[loseC] : -1, ko = onBoard.get(ks); if (ko) topple = { o: ko, t: 0, dir: loseC === 'w' ? -1 : 1 }; }
    audio.mood('over'); if (winner) flash = { txt: reason === 'checkmate' ? 'CHECKMATE' : title.toUpperCase(), col: '#ffd23a', t: 1.8 };
    if (mode === 'cpu') { const O = oppOf(); let w = 0, l = 0, d = 0; try { w = save.stat('chessClub.' + O.id + '.w'); l = save.stat('chessClub.' + O.id + '.l'); d = save.stat('chessClub.' + O.id + '.d'); } catch (e) {} over.record = 'vs ' + O.name + ': ' + w + 'W ' + l + 'L ' + d + 'D'; }
    toParent({ action: 'result', mode, result, reason, gold, xp, opponent: mode === 'cpu' ? oppOf().id : null });
    live = title + '. ' + sub + '.'; speak(live); clearResume(); drawBoard(); emit();
  }

  // ---------- resume ----------
  function storeResume() { if (mode !== 'cpu' && mode !== 'local') return; if (over || !chess.history.length) return clearResume(); try { localStorage.setItem(RESUME_KEY, JSON.stringify({ mode, level, myColor, practice, moves: chess.history.map(h => sqName(h.from) + sqName(h.to) + (h.promo || '').toLowerCase()) })); } catch (e) {} }
  function clearResume() { try { localStorage.removeItem(RESUME_KEY); } catch (e) {} }
  function loadResume() { try { return JSON.parse(localStorage.getItem(RESUME_KEY) || 'null'); } catch (e) { return null; } }
  function replay(moves) { chess = new Chess(); for (const u of moves) { if (!chess.move({ from: u.slice(0, 2), to: u.slice(2, 4), promo: u[4] })) break; } }

  // ---------- DEMO: two foxes play while captions teach the moves ----------
  let demo = null, demoTok = 0, demoSeen = new Set();
  const NAMEOF = { w: 'HOPE', b: 'NOBLE' };
  const TIPS = {
    first: 'White always moves first, then the sides take turns, one move each.',
    p: 'Pawns step straight ahead: two squares on their first move, then one. They capture one square diagonally.',
    n: 'Knights jump in an L: two squares one way, one to the side. They are the only piece that hops over others.',
    b: 'Bishops slide diagonally as far as the path is clear. Each one stays on its own colour all game.',
    r: 'Rooks slide in straight lines, up, down and sideways.',
    q: 'The queen is the strongest piece: she moves like a rook and a bishop together.',
    k: 'The king steps one square in any direction. Lose him and you lose the game, so keep him safe.',
    cap: 'A capture: the piece lands on an enemy and takes it off the board. Captured pieces wait beside the board.',
    castle: 'Castling: the king steps two squares toward a rook, and the rook jumps over him. Once a game, a safe home for the king.',
    check: 'Check! The king is attacked. The other side must get out of check right away: move, block, or capture.',
    promo: 'Promotion: a pawn reached the far side and became a queen.',
    ep: 'En passant: a pawn that rushes two squares past an enemy pawn can be taken as if it moved one.',
  };
  function demoAfter(h, st) {
    if (!demo) return; let tip = null; const t = h.piece.toLowerCase();
    const want = k => { if (demoSeen.has(k)) return false; demoSeen.add(k); return true; };
    if (chess.history.length === 1 && want('first')) tip = TIPS.first;
    else if ((h.flag === 'K' || h.flag === 'Q') && want('castle')) tip = TIPS.castle;
    else if (h.promo && want('promo')) tip = TIPS.promo;
    else if (h.flag === 'ep' && want('ep')) tip = TIPS.ep;
    else if (st.check && !st.over && want('check')) tip = TIPS.check;
    else if (h.cap && want('cap')) tip = TIPS.cap;
    else if (want(t)) tip = TIPS[t];
    demo = { key: NAMEOF[h.color] + ' · ' + h.san, cap: tip || describe(h) + '.', n: chess.history.length };
    demo.tip = !!tip; if (tip) speak(tip);
    if (chess.history.length >= 140 && !st.over) { demo.cap = 'A long game. Setting up a fresh demo.'; const tok = demoTok; demoTok++; setTimeout(() => { if (mode === 'demo' && phase === 'play') begin('demo'); }, 3500); }
  }
  function demoEnd(st) {
    const tok = ++demoTok, winner = st.result === '1-0' ? 'w' : st.result === '0-1' ? 'b' : null; cpuTok++; cpuBusy = false;
    demo = { key: winner ? NAMEOF[winner] + ' WINS' : 'DRAW', cap: (st.reason === 'checkmate' ? 'Checkmate: the king is attacked and has no escape. ' : st.reason.charAt(0).toUpperCase() + st.reason.slice(1) + '. ') + 'A new demo starts in a moment, or tap TAKE OVER / EXIT DEMO.', n: chess.history.length };
    if (winner) { const ko = onBoard.get(chess.kings[winner === 'w' ? 'b' : 'w']); if (ko) topple = { o: ko, t: 0, dir: winner === 'w' ? 1 : -1 }; mood(winner, 'excited', 4); mood(winner === 'w' ? 'b' : 'w', 'sad', 4); flash = { txt: st.reason === 'checkmate' ? 'CHECKMATE' : 'GAME OVER', col: '#ffd23a', t: 1.8 }; sfx('win'); } else sfx('draw');
    audio.mood('over'); speak(demo.cap); emit();
    setTimeout(() => { if (mode === 'demo' && tok === demoTok && phase === 'play') begin('demo'); }, 9000);
  }
  function takeOver() {
    if (mode !== 'demo' || phase !== 'play') return; if (chess.status().over) { begin('cpu', { level: prefs.level, color: prefs.color }); return; }
    flushAnims(); cpuTok++; cpuBusy = false; demoTok++; demo = null; mode = 'cpu'; level = prefs.level; myColor = chess.turn; practice = true;
    seated = myColor === 'w' ? { w: 'player', b: cpuFoxId() } : { w: cpuFoxId(), b: 'player' }; povColor = myColor; placeFoxes(); aimCamera(); drawBoard(); audio.mood('play');
    live = 'You play ' + COLOR_WORD[myColor] + ' from here against ' + oppOf().name + '. A practice game: no gold.'; speak(live); flash = { txt: 'YOUR MOVE', col: '#22c55e', t: 1.2 }; storeResume(); emit();
  }

  // ---------- starting games ----------
  function begin(m, o = {}) {
    NET.leave(true); mode = m; over = null; promoAsk = null; hint = null; practice = !!o.practice; clearSel(); cpuTok++; cpuBusy = false; say = null; started = 0;
    if (m === 'demo') { level = 1; myColor = null; seated = { w: 'hope', b: 'noble' }; povColor = 'w'; clocks = null; demoTok++; demoSeen = new Set(); demo = { key: 'DEMO', cap: 'Hope plays White, Noble plays Black. Watch how the pieces move. Tap the board or TAKE OVER to play from here.', n: 0 }; }
    else if (m === 'cpu') { level = o.level ?? prefs.level; myColor = o.color || prefs.color; if (myColor === 'random') myColor = Math.random() < 0.5 ? 'w' : 'b'; seated = myColor === 'w' ? { w: 'player', b: cpuFoxId() } : { w: cpuFoxId(), b: 'player' }; povColor = myColor; clocks = null; }
    else { myColor = 'w'; seated = { w: 'player', b: 'net1' }; povColor = 'w'; const tc = o.tc || prefs.tc; clocks = tc && tc !== 'none' ? { w: +tc * 60000, b: +tc * 60000, inc: 0 } : null; }
    standing = []; chess = new Chess(); if (o.moves) replay(o.moves); if (m === 'local' && prefs.autoFlip) povColor = chess.turn;
    phase = 'play'; topple = null; syncPieces(); placeFoxes(); drawBoard(); aimCamera(); camSnap = false; audio.sfx('start'); audio.mood('play');
    if (m === 'cpu') { if (!o.moves) setTimeout(() => oppLine('hello'), 500); if (chess.turn === cpuColor()) setTimeout(cpuGo, 700); }
    if (m === 'demo') { const tok = demoTok; setTimeout(() => { if (mode === 'demo' && tok === demoTok && phase === 'play') cpuGo(); }, 3200); } else demo = null;
    const st = chess.status(); if (st.over) finish(st.result, st.reason);
    live = m === 'demo' ? demo.cap : m === 'cpu' ? 'New game against ' + oppOf().name + '. You play ' + COLOR_WORD[myColor] + '.' : 'Pass and play. White moves first.'; speak(live); storeResume(); emit();
  }
  function toMenu() { cpuTok++; cpuBusy = false; demo = null; demoTok++; NET.leave(); phase = 'menu'; topple = null; audio.mood('menu'); over = null; promoAsk = null; clearSel(); hint = null; say = null; mode = 'cpu'; seated = { w: null, b: ['pip', 'hope', 'noble'][prefs.level] || 'hope' }; standing = []; chess = new Chess(); syncPieces(); placeFoxes(); drawBoard(); emit(); }

  // ================= ONLINE (room of up to 5 · host-authoritative · engine/duel-net.js, else a same-device test channel) =================
  const NET = (() => {
    const N = { room: null, me: null, tr: null, members: {}, state: null, msg: '', status: '', copied: false, tok: 0, timer: 0, lastSeen: {}, reacts: [] };
    const now = () => performance.now();
    function list() { if (!N.room) return []; const all = Object.entries(N.members).map(([id, m]) => ({ id, ...m })); all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, CHESS.maxRoom); }
    N.list = list; N.isHost = () => { const L = list(); return !!L.length && L[0].id === N.me; };
    N.seatOf = id => !N.state ? null : N.state.seats.w === id ? 'w' : N.state.seats.b === id ? 'b' : null;
    N.slotOf = id => { const i = list().findIndex(m => m.id === id); return i < 0 ? 0 : i; };
    N.nameOf = id => id === N.me ? 'YOU' : (NET_COLS[N.slotOf(id)] || NET_COLS[0])[0];
    const send = (t, d, to) => { if (N.tr) try { N.tr.send(t, d, to); } catch (e) {} };
    function fresh() { return { seq: 0, seats: { w: null, b: null }, moves: [], live: false, result: null, reason: '', queue: [], tc: prefs.tc || 'none', clk: null, stamp: 0 }; }
    async function connect(code) {
      code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { N.msg = 'Type the 4-letter room code from your friend.'; emit(); return; }
      N.leave(true); const tok = ++N.tok; N.room = code; N.members = {}; N.lastSeen = {}; N.state = fresh(); N.status = 'connecting'; N.msg = ''; N.j = Date.now(); phase = 'room'; mode = 'net'; emit();
      const handlers = { game: CHESS.key, code, onJoin: id => hello(id), onLeave: id => gone(id), onMsg: (t, d, id) => recv(t, d, id), onStatus: s => { N.status = s; emit(); } };
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
    function hello(to) { if (!N.tr) return; send('hi', { v: 1, j: N.j }, to); if (N.isHost() && N.state) send('st', N.state, to); }
    function recv(t, d, id) {
      if (!N.room || !d) return; const known = !!N.lastSeen[id]; N.lastSeen[id] = now();
      if (t === 'hi') { N.members[id] = { j: +d.j || Date.now() };
        if (!N.settled && N.members[id].j >= N.j) { N.j = N.members[id].j + 1; N.members[N.me].j = N.j; send('hi', { v: 1, j: N.j }); }   /* a joiner always sorts after the people already here (phone clocks differ) */ if (!known) setTimeout(() => hello(id), 0); if (N.isHost()) { trim(); send('st', N.state, id); } emit(); return; }
      if (!N.members[id]) N.members[id] = { j: Date.now() };
      if (t === 'st') { if (!N.isHostId(id)) return; if (!N.state || d.seq >= N.state.seq) { N.state = d; N.rx = now(); sync(); } return; }
      if (t === 'rq') { if (N.isHost()) handle(d, id); return; }
      if (t === 'rx') { react(id, d.w); return; }
      if (t === 'bye') gone(id);
    }
    N.isHostId = id => { const L = list(); return !!L.length && L[0].id === id; };
    function gone(id) { if (!N.members[id] || id === N.me) return; delete N.members[id]; delete N.lastSeen[id]; if (N.isHost()) { const s = N.state, c = s.seats.w === id ? 'w' : s.seats.b === id ? 'b' : null; s.queue = s.queue.filter(q => q !== id); if (c) { s.seats[c] = null; if (s.live) { s.live = false; s.result = c === 'w' ? '0-1' : '1-0'; s.reason = COLOR_WORD[c] + ' left the room'; } } bump(); } emit(); }
    function tick() { if (!N.tr) return; send('hi', { v: 1, j: N.j }); const t = now(); for (const id of Object.keys(N.lastSeen)) if (t - N.lastSeen[id] > 20000) gone(id);
      const s = N.state; if (N.isHost() && s && s.live && s.clk) { const left = s.clk[s.turnC] - (Date.now() - s.stamp); if (left <= 0) { s.clk[s.turnC] = 0; s.live = false; s.result = s.turnC === 'w' ? '0-1' : '1-0'; s.reason = COLOR_WORD[s.turnC] + ' ran out of time'; bump(); } } emit(); }
    function trim() { const ids = list().map(m => m.id), s = N.state; for (const c of ['w', 'b']) if (s.seats[c] && !ids.includes(s.seats[c]) && !N.members[s.seats[c]]) s.seats[c] = null; s.queue = s.queue.filter(q => ids.includes(q)); }
    function bump() { const s = N.state; s.seq++; send('st', s); sync(); }
    // host: apply a request from `id` (also used for the host's own actions)
    function handle(d, id) {
      const s = N.state; if (!s) return; const seat = s.seats.w === id ? 'w' : s.seats.b === id ? 'b' : null;
      if (d.k === 'sit' && (d.c === 'w' || d.c === 'b') && !s.live && !s.seats[d.c] && !seat) { s.seats[d.c] = id; s.queue = s.queue.filter(q => q !== id); }
      else if (d.k === 'stand' && seat && !s.live) { s.seats[seat] = null; }
      else if (d.k === 'queue' && !seat && !s.queue.includes(id)) s.queue.push(id);
      else if (d.k === 'tc' && id === N.me && !s.live) s.tc = ['none', '10', '5', '3'].includes(d.v) ? d.v : 'none';
      else if (d.k === 'start' && !s.live && s.seats.w && s.seats.b && (seat || id === N.me)) {
        if (s.result) rotate(s); s.moves = []; s.result = null; s.reason = ''; s.live = true; s.turnC = 'w'; s.clk = s.tc !== 'none' ? { w: +s.tc * 60000, b: +s.tc * 60000 } : null; s.stamp = Date.now(); s.game = (s.game || 0) + 1; }
      else if (d.k === 'move' && s.live && seat && d.ply === s.moves.length) {
        const c = new Chess(); for (const u of s.moves) c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promo: u[4] }); if (c.turn !== seat) return;
        const h = c.move({ from: d.uci.slice(0, 2), to: d.uci.slice(2, 4), promo: d.uci[4] }); if (!h) { send('st', s, id); return; }
        if (s.clk) { s.clk[seat] = Math.max(0, s.clk[seat] - (Date.now() - s.stamp)); } s.stamp = Date.now(); s.turnC = c.turn;
        s.moves.push(d.uci); const st = c.status(); if (st.over) { s.live = false; s.result = st.result; s.reason = st.reason; } }
      else if (d.k === 'resign' && s.live && seat) { s.live = false; s.result = seat === 'w' ? '0-1' : '1-0'; s.reason = COLOR_WORD[seat] + ' resigned'; }
      else return;
      bump();
    }
    function rotate(s) {   // winner stays on: the loser goes to the back of the line, the next fox in line sits down; colours swap
      const winC = s.result === '1-0' ? 'w' : s.result === '0-1' ? 'b' : null, w = s.seats.w, b = s.seats.b;
      if (s.queue.length) { const loserC = winC ? (winC === 'w' ? 'b' : 'w') : 'w', stay = s.seats[loserC === 'w' ? 'b' : 'w'], out = s.seats[loserC], next = s.queue.shift(); if (out) s.queue.push(out); s.seats = { w: next, b: stay }; }
      else s.seats = { w: b, b: w };
    }
    N.request = d => { if (N.isHost()) handle(d, N.me); else send('rq', d); };
    N.hostFinish = () => {};  // the host's handle() already ends the game in its state; sync() shows it
    function react(id, w) { if (!REACTS.includes(w)) return; N.reacts.push({ who: N.nameOf(id), w, t: 2.4, col: (NET_COLS[N.slotOf(id)] || NET_COLS[0])[1] }); if (N.reacts.length > 3) N.reacts.shift(); const c = N.seatOf(id); if (c) { mood(c, w === 'OOF' ? 'surprised' : 'happy', 1.6); } else { const f = foxes['net' + N.slotOf(id)]; if (f) { f.userData.hop = 1; } } audio.sfx(w === 'WOW' ? 'ooh' : w === 'OOF' ? 'oof' : 'clap'); emit(); }
    N.react = w => { send('rx', { w }); react(N.me, w); };
    // make the local board/game follow the shared state
    function sync() {
      const s = N.state; if (!s) return; const L = list();
      const want = s.moves, have = chess.history.map(h => sqName(h.from) + sqName(h.to) + (h.promo || '').toLowerCase());
      const same = want.length >= have.length && have.every((u, i) => u === want[i]);
      if (same && want.length === have.length + 1) { mode = 'net'; playMove({ from: want[want.length - 1].slice(0, 2), to: want[want.length - 1].slice(2, 4), promo: want[want.length - 1][4] }, true); }
      else if (!same || want.length !== have.length) { replay(want); syncPieces(); }
      clocks = s.clk ? { w: s.clk.w, b: s.clk.b, at: performance.now(), turnC: s.turnC } : null;
      const mine = N.seatOf(N.me); povColor = mine || 'w';
      seated = { w: s.seats.w ? 'net' + N.slotOf(s.seats.w) : null, b: s.seats.b ? 'net' + N.slotOf(s.seats.b) : null };
      standing = L.filter(m => m.id !== s.seats.w && m.id !== s.seats.b).slice(0, 3).map(m => 'net' + N.slotOf(m.id));
      if (s.live) { phase = 'play'; over = null; } else if (s.result && s.game) { if (!over || over.game !== s.game) { over = null; phase = 'play'; finish(s.result, s.reason, { game: s.game }); } }
      else if (phase === 'play' && !s.live && !s.result) phase = 'room';
      placeFoxes(); drawBoard(); aimCamera(); emit();
    }
    N.leave = (quiet) => { N.tok++; clearInterval(N.timer); if (N.tr) { send('bye', {}); try { N.tr.leave(); } catch (e) {} } N.tr = null; N.room = null; N.members = {}; N.state = null; N.reacts = []; try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {} if (!quiet) emit(); };
    N.connect = code => { N.settled = false; return connect(code); }; N.create = () => { N.settled = true; const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 4; i++) c += A[Math.floor(Math.random() * A.length)]; connect(c).then(() => { N.settled = true; }); };
    return N;
  })();

  // ---------- input: tap a piece then a square, or drag ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(V3(0, 1, 0), -BOARD_Y), hit = V3();
  function squareAt(e) { const bb = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - bb.left) / bb.width) * 2 - 1, -((e.clientY - bb.top) / bb.height) * 2 + 1); ray.setFromCamera(ndc, camera);
    // prefer a piece the ray actually hits (tall pieces lean over the square behind them)
    const objs = [...onBoard.entries()]; let best = null, bd = 9; for (const [i, o] of objs) { const h = PIECE_H[o.userData.letter.toLowerCase()], c = o.position.clone(); c.y += h / 2; const d = ray.ray.distanceSqToPoint(c); if (d < (S * 0.38) ** 2 && (!best || ray.ray.origin.distanceTo(c) < bd)) { best = i; bd = ray.ray.origin.distanceTo(c); } }
    if (!ray.ray.intersectPlane(plane, hit)) return { sq: best ?? -1, p: null }; const f = Math.floor((hit.x + HALF) / S), r = Math.floor((hit.z + HALF) / S);
    const sq = f >= 0 && f < 8 && r >= 0 && r < 8 ? r * 8 + f : -1;
    if (sel >= 0 && targets.some(m => m.to === sq)) return { sq };                  // a legal target under the finger wins
    if (best != null && colorOf(chess.b[best]) === chess.turn && !(sq >= 0 && colorOf(chess.b[sq]) === chess.turn)) return { sq: best };
    return { sq }; }
  let down = null, drag = null;
  function select(i) { sel = i; targets = chess.moves(i); sfx('sel'); drawBoard(); }
  function tap(i) {
    if (mode === 'demo' && phase === 'play') { takeOver(); return; }
    if (!humanCanMove() || i < 0) { if (i >= 0 && phase === 'play' && !over) { const pc = chess.b[i]; if (pc && prefs.speak) speak(COLOR_WORD[colorOf(pc)] + ' ' + PIECE_NAMES[pc.toLowerCase()] + ' on ' + sqName(i)); } return; }
    if (sel >= 0 && targets.some(m => m.to === i)) { tryMove(sel, i); return; }
    const pc = chess.b[i];
    if (pc && colorOf(pc) === chess.turn) { if (sel === i) { clearSel(); drawBoard(); } else select(i); if (prefs.speak) speak(PIECE_NAMES[pc.toLowerCase()] + ' ' + sqName(i) + ', ' + (targets.length ? targets.length + ' moves' : 'no moves')); }
    else { if (prefs.speak) speak(pc ? COLOR_WORD[colorOf(pc)] + ' ' + PIECE_NAMES[pc.toLowerCase()] + ' on ' + sqName(i) : sqName(i) + ' empty'); clearSel(); drawBoard(); }
    emit();
  }
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { ac(); if (e.button > 0) return; const s = squareAt(e); down = { x: e.clientX, y: e.clientY, sq: s.sq, id: e.pointerId }; });
  el.addEventListener('pointermove', e => { if (!down || e.pointerId !== down.id) return; const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (!drag && Math.hypot(dx, dy) > 10 && humanCanMove() && (flushAnims(), true) && down.sq >= 0 && chess.b[down.sq] && colorOf(chess.b[down.sq]) === chess.turn) { const o = onBoard.get(down.sq); if (o) { if (sel !== down.sq) select(down.sq); drag = { o, from: down.sq }; try { el.setPointerCapture(e.pointerId); } catch (er) {} } }
    if (drag) { const r = el.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const pl = new THREE.Plane(V3(0, 1, 0), -(BOARD_Y + 0.12)); if (ray.ray.intersectPlane(pl, hit)) drag.o.position.set(clamp(hit.x, -HALF - 0.1, HALF + 0.1), BOARD_Y + 0.12, clamp(hit.z, -HALF - 0.1, HALF + 0.1)); } });
  const up = e => { if (!down || e.pointerId !== down.id) return; const d = down; down = null;
    if (drag) { const g = drag; drag = null; const f = Math.floor((g.o.position.x + HALF) / S), r = Math.floor((g.o.position.z + HALF) / S), to = f >= 0 && f < 8 && r >= 0 && r < 8 ? r * 8 + f : -1;
      if (to >= 0 && targets.some(m => m.to === to)) { g.o.position.copy(sqPos(g.from)); tryMove(g.from, to); } else { anims.push({ o: g.o, a: g.o.position.clone(), b: sqPos(g.from), t: 0, dur: 0.18, hop: 0 }); } return; }
    if (e.type === 'pointercancel') return; tap(d.sq); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  // keyboard play (desktop + screen readers): arrows move a cursor, Enter/Space picks
  const onKey = e => { if (phase !== 'play' || /INPUT|TEXTAREA/.test((e.target && e.target.tagName) || '')) return; const k = e.key; if (!/^Arrow|^Enter$|^ $|^Escape$/.test(k)) return;
    if (cursor < 0) cursor = povColor === 'w' ? 52 : 11; const fl = povColor === 'b' ? -1 : 1; let f = cursor & 7, r = cursor >> 3;
    if (k === 'ArrowLeft') f -= fl; else if (k === 'ArrowRight') f += fl; else if (k === 'ArrowUp') r -= fl; else if (k === 'ArrowDown') r += fl; else if (k === 'Escape') { clearSel(); drawBoard(); emit(); return; } else { e.preventDefault(); tap(cursor); return; }
    e.preventDefault(); cursor = clamp(r, 0, 7) * 8 + clamp(f, 0, 7); const pc = chess.b[cursor]; live = sqName(cursor) + (pc ? ', ' + COLOR_WORD[colorOf(pc)] + ' ' + PIECE_NAMES[pc.toLowerCase()] : ', empty'); speak(live); drawBoard(); emit(); };
  addEventListener('keydown', onKey);

  // ---------- HUD state for the page ----------
  let lastEmit = 0;
  function clockMs(c) { if (!clocks) return null; if (mode === 'net') { let v = clocks[c]; if (NET.state && NET.state.live && clocks.turnC === c) v -= performance.now() - clocks.at; return Math.max(0, v); } return Math.max(0, clocks[c]); }
  const fmt = ms => ms == null ? '' : (ms >= 60000 ? Math.floor(ms / 60000) + ':' + String(Math.floor(ms / 1000) % 60).padStart(2, '0') : Math.floor(ms / 1000) % 60 + '.' + Math.floor(ms / 100) % 10);
  const GLYPH = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }, VAL = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  function capsOf(c) { const L = chess.history.filter(h => h.color === c && h.cap).map(h => h.cap.toLowerCase()).sort((a, b) => VAL[b] - VAL[a]); return L.map(t => GLYPH[t] + '︎').join(''); }
  function side(c) {
    const net = mode === 'net' && NET.state, id = net ? NET.state.seats[c] : null;
    let name, sub, col = c === 'w' ? '#f2e8d4' : '#3b3347';
    if (mode === 'demo') { name = NAMEOF[c]; sub = 'DEMO · ' + COLOR_WORD[c].toUpperCase(); }
    else if (mode === 'cpu') { if (c === myColor) { name = 'YOU'; sub = COLOR_WORD[c].toUpperCase(); } else { const O = oppOf(); name = O.name; sub = O.tag + ' · ' + COLOR_WORD[c].toUpperCase(); } }
    else if (net) { name = id ? NET.nameOf(id) : 'EMPTY SEAT'; sub = COLOR_WORD[c].toUpperCase(); if (id) col = (NET_COLS[NET.slotOf(id)] || NET_COLS[0])[1]; }
    else { name = COLOR_WORD[c].toUpperCase(); sub = 'PASS & PLAY'; }
    const adv = chess.material(c) - chess.material(c === 'w' ? 'b' : 'w');
    return { c, name, sub, col, caps: capsOf(c), adv: adv > 0 ? '+' + adv : '', clock: fmt(clockMs(c)), clockOn: !!clocks, low: clocks ? clockMs(c) < 20000 : false, active: phase === 'play' && !over && chess.turn === c, thinking: (mode === 'cpu' || mode === 'demo') && cpuBusy && c === cpuColor() };
  }
  function statusTxt() {
    if (over) return String(over.title || 'GAME OVER').toUpperCase(); if (promoAsk) return 'PICK A PIECE';
    const st = chess.inCheck() ? ' · CHECK' : '';
    if (mode === 'demo') return 'DEMO · ' + (demo && /WINS|DRAW/.test(demo.key) ? demo.key : NAMEOF[chess.turn] + (cpuBusy ? ' IS THINKING' : ' TO MOVE')) + st;
    if (mode === 'cpu') return (chess.turn === myColor ? 'YOUR MOVE' : oppOf().name + ' IS THINKING') + st;
    if (mode === 'local') return COLOR_WORD[chess.turn].toUpperCase() + ' TO MOVE' + st;
    if (mode === 'net') { const s = NET.state; if (!s || !s.live) return 'WAITING'; const mine = NET.seatOf(NET.me); return (mine === chess.turn ? 'YOUR MOVE' : mine ? 'THEIR MOVE' : COLOR_WORD[chess.turn].toUpperCase() + ' TO MOVE · WATCHING') + st; }
    return '';
  }
  function emit() {
    lastEmit = performance.now(); const top = povColor === 'w' ? 'b' : 'w', H = chess.history, pairs = [];
    for (let i = 0; i < H.length; i += 2) pairs.push({ n: i / 2 + 1, w: H[i].san, b: H[i + 1] ? H[i + 1].san : '' });
    const R = loadResume(), N = NET.state, L = NET.list(), mine = NET.seatOf(NET.me);
    const rec = OPPONENTS.map(O => { let w = 0, l = 0, d = 0; try { w = save.stat('chessClub.' + O.id + '.w'); l = save.stat('chessClub.' + O.id + '.l'); d = save.stat('chessClub.' + O.id + '.d'); } catch (e) {} return { level: O.level, name: O.name, tag: O.tag, who: O.who, gold: O.gold, rec: w + 'W ' + l + 'L ' + d + 'D', beat: w > 0 }; });
    onState({
      demo: demo ? { key: demo.key, cap: demo.cap, n: demo.n } : null,
      phase, mode, level, myColor, turn: chess.turn, pov: povColor, view: prefs.view, prefs: { ...prefs },
      top: side(top), bottom: side(povColor), status: statusTxt(), check: chess.inCheck() && !over,
      moves: pairs, ply: H.length, last: H.length ? H[H.length - 1].san : '', live,
      say: say ? { who: say.who, text: say.text } : null, promo: promoAsk ? { color: promoAsk.color } : null,
      flash: flash ? { txt: flash.txt, col: flash.col } : null,
      over: over ? { record: over.record || '', title: over.title, sub: over.sub, gold: over.gold, xp: over.xp, winner: over.winner, result: over.result } : null,
      canUndo: phase === 'play' && !over && (mode === 'cpu' ? H.length > 0 : mode === 'local' ? H.length > 0 : false), canHint: mode === 'cpu' && phase === 'play' && !over && chess.turn === myColor && !cpuBusy, hintBusy, practice,
      thinking: cpuBusy, opponents: rec, resume: R && R.moves && R.moves.length ? { mode: R.mode, label: R.mode === 'cpu' ? 'VS ' + ((OPPONENTS[R.level] || OPPONENTS[1]).name) + ' · MOVE ' + (Math.floor(R.moves.length / 2) + 1) : 'PASS & PLAY · MOVE ' + (Math.floor(R.moves.length / 2) + 1) } : null,
      gold: (() => { try { return save.data.gold; } catch (e) { return 0; } })(),
      net: NET.room ? { code: NET.room, status: NET.status, host: NET.isHost(), me: NET.me, msg: NET.msg, copied: NET.copied, mine, live: !!(N && N.live), result: N ? N.result : null, tc: N ? N.tc : 'none', canStart: !!(N && !N.live && N.seats.w && N.seats.b && (mine || NET.isHost())),
        seats: ['w', 'b'].map(c => ({ c, id: N ? N.seats[c] : null, name: N && N.seats[c] ? NET.nameOf(N.seats[c]) : 'OPEN', col: N && N.seats[c] ? (NET_COLS[NET.slotOf(N.seats[c])] || NET_COLS[0])[1] : '#3a3836', mine: !!(N && N.seats[c] === NET.me), open: !!(N && !N.seats[c]) })),
        people: L.map((m, i) => ({ id: m.id, name: NET.nameOf(m.id), col: NET_COLS[i][1], seat: N ? (N.seats.w === m.id ? 'WHITE' : N.seats.b === m.id ? 'BLACK' : N.queue.includes(m.id) ? 'NEXT · ' + (N.queue.indexOf(m.id) + 1) : 'WATCHING') : '', host: i === 0, me: m.id === NET.me })),
        count: L.length, max: CHESS.maxRoom, inQueue: !!(N && N.queue.includes(NET.me)), reacts: NET.reacts.map(r => ({ who: r.who, w: r.w, col: r.col })) } : null,
    });
  }

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, alive = true, frame = 0;
  function loop() {
    if (!alive) return; raf = requestAnimationFrame(loop); const rawDt = Math.min(0.25, clock.getDelta()), dt = Math.min(0.05, rawDt); frame++;
    // piece animations
    for (const a of anims) { a.t += rawDt; const k = clamp(a.t / a.dur, 0, 1), e = smooth(k); a.o.position.lerpVectors(a.a, a.b, e); a.o.position.y = a.a.y + (a.b.y - a.a.y) * e + Math.sin(k * Math.PI) * a.hop; if (a.scl) a.o.scale.setScalar(1 + (a.scl - 1) * e); if (k >= 1 && !a.fin) { a.fin = true; a.done && a.done(); } }
    if (anims.length && anims.every(a => a.fin)) { anims = []; emit(); }
    // piece polish: selected piece floats, captured pieces tumble, promoted pieces pop, shadows stay on the board, icons for TOP view
    const t = clock.elapsedTime, iconsOn = prefs.icons || prefs.view === 'top', onSet = new Set(onBoard.values());
    for (const L of Object.values(pool)) for (const o of L) { if (!o.visible) continue; const u = o.userData, lift = onBoard.get(sel) === o && !drag ? 0.035 + Math.sin(t * 5) * 0.012 : 0;
      u.body.position.y = damp(u.body.position.y, lift, 14, dt); if (u.spin) u.body.rotation.z += u.spin * rawDt; if (u.pop > 0) { u.pop = Math.max(0, u.pop - dt * 2.5); u.body.scale.setScalar(PSCALE * (1 + Math.sin(u.pop * Math.PI) * 0.35)); }
      const air = o.position.y - (o.position.y < TABLE_Y + 0.02 ? TABLE_Y : BOARD_Y); u.sh.position.y = 0.002 - Math.max(0, air) - u.body.position.y * 0; u.sh.scale.setScalar(clamp(1 - (air + u.body.position.y) * 2.5, 0.4, 1)); u.ic.visible = iconsOn && onSet.has(o); }
    if (topple) { topple.t = Math.min(1, topple.t + rawDt * 1.4); const e = topple.t < 0.7 ? smooth(topple.t / 0.7) : 1 + Math.sin((topple.t - 0.7) / 0.3 * Math.PI) * 0.06; topple.o.userData.body.rotation.z = topple.dir * e * Math.PI / 2 * 0.98; topple.o.userData.body.position.x = topple.dir * -e * 0.02; if (topple.t >= 1 && !topple.thud) { topple.thud = true; audio.sfx('move', { t: 'k' }); } }
    if (flash) { flash.t -= rawDt; if (flash.t <= 0) { flash = null; emit(); } }
    dust.step(t);
    // thought bubble over a thinking fox
    { const thinking = (mode === 'cpu' || mode === 'demo') && cpuBusy && phase === 'play', f = thinking ? foxOn(cpuColor()) : null; bubble.visible = !!(f && f.visible); if (bubble.visible) { bubble.position.set(f.position.x + 0.55, 2.85, f.position.z); const k = Math.floor(t * 3) % 3; if (k !== bubble.userData.k) { bubble.userData.k = k; drawBubble(k); } } }
    // clock ticks in the last ten seconds
    if (clocks && phase === 'play' && !over) { const c = chess.turn, ms = clockMs(c); if (ms != null && ms < 10000 && ms > 0) { const sec = Math.ceil(ms / 1000); if (sec !== lastTick) { lastTick = sec; audio.sfx('tick', { hi: sec <= 3 }); } } }
    // foxes
    const menuish = phase === 'menu' || (phase === 'room' && !(NET.state && NET.state.live));
    for (const f of Object.values(foxes)) { if (!f.visible) continue; const u = f.userData; if (menuish) { u.lookAt = u.lookAt === BOARD_LOOK ? camera.position.clone() : (u.lookAt || camera.position.clone()); u.lookAt.copy(camera.position); } else if (u.lookAt !== BOARD_LOOK) u.lookAt = BOARD_LOOK; if (u.moodT > 0) { u.moodT -= dt; if (u.moodT <= 0) u.mood = u.base; } kit.animFox(f, dt, 0);
      if (u.sit) { const P = u.P; P.legs.forEach(l => l.rotation.x = -1.25); P.arms.forEach((a, i) => { a.rotation.x = -1.05 + (u.talking && i ? Math.sin(u.phase * 2.2) * 0.2 : 0); a.rotation.z = i ? 0.25 : -0.25; }); P.body.position.y = u.hopY * 0.5; } }
    // sparks
    for (const k of sparks) { if (k.life <= 0) continue; k.life -= dt * 1.6; k.s.position.addScaledVector(k.v, dt); k.v.y -= dt * 1.5; k.s.material.opacity = Math.max(0, k.life); }
    // talk + reactions timers
    if (say) { say.t -= dt; if (say.t <= 0) { say = null; emit(); } }
    if (NET.reacts.length) { NET.reacts.forEach(r => r.t -= dt); const n = NET.reacts.length; NET.reacts = NET.reacts.filter(r => r.t > 0); if (n !== NET.reacts.length) emit(); }
    // local clocks
    if (clocks && mode === 'local' && phase === 'play' && !over && started && !anims.length) { clocks[chess.turn] -= dt * 1000; if (clocks[chess.turn] <= 0) { clocks[chess.turn] = 0; const loser = chess.turn; finish(loser === 'w' ? '0-1' : '1-0', COLOR_WORD[loser] + ' ran out of time'); } }
    if (clocks && performance.now() - lastEmit > 200) emit();
    // camera
    if (phase === 'menu' || phase === 'room' && !(NET.state && NET.state.live)) { orbitT += dt * 0.25; if (frame % 3 === 0 || camSnap) {   // a slow sway around the table, framed into the part of the screen the menu leaves free
        const W = CW(), H = CH(), yaw = Math.PI * 0.86 + Math.sin(orbitT * 0.35) * 0.18, visH = Math.max(0.2, (H - safe.top - safe.bottom) / H), visW = Math.max(0.3, (W - safe.left - safe.right) / W);
        const dist = 3.2, el = 0.22, th = Math.tan(camera.fov * Math.PI / 360), asp = W / H;
        const ny = 1 - (safe.top + H - safe.bottom) / H, nx = (safe.left + W - safe.right) / W - 1, look = V3(0, 1.55, -0.9), dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), -Math.cos(yaw) * Math.cos(el)), right = V3(Math.cos(yaw), 0, Math.sin(yaw));
        look.y -= ny * dist * th * 0.8; look.addScaledVector(right, nx * dist * th * asp);
        camGoal = { pos: V3(0, 1.5, -0.9).addScaledVector(dir, dist), look }; } }   /* pitch, not pan: the table lifts into the free strip */
    { const menuCam = phase === 'menu' || (phase === 'room' && !(NET.state && NET.state.live)), port = CH() > CW(), fv = menuCam ? (port ? 78 : 52) : (port ? 46 : 40); if (Math.abs(camera.fov - fv) > 0.05) { camera.fov = damp(camera.fov, fv, 4, dt); camera.updateProjectionMatrix(); } }
    const k = camSnap ? 1 : 1 - Math.exp(-4 * dt); camSnap = false; camera.position.lerp(camGoal.pos, k); camLook.lerp(camGoal.look, k); camera.lookAt(camLook);
    room.shade.visible = room.bulb.visible = camera.position.y < room.H - 0.25;   // TOP view looks down through the ceiling
    if (touch && !anims.length && !drag && !topple && sel < 0 && (frame & 1)) return;   // ~30 fps when nothing moves on phones
    if (document.hidden) return;
    renderer.render(scene, camera);
  }
  function resize() { const W = CW(), H = CH(); renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); aimCamera(); }
  const ro = new ResizeObserver(resize); ro.observe(container); addEventListener('resize', resize);

  // ---------- boot ----------
  seated = { w: null, b: ['pip', 'hope', 'noble'][prefs.level] || 'hope' }; syncPieces(); placeFoxes(); drawBoard(); resize(); loop(); emit();
  setTimeout(() => { if (phase === 'menu') { const O = OPPONENTS[prefs.level] || OPPONENTS[1]; talk('b', 'Fancy a game? Take the empty seat.', O.name); } }, 900);

  // ---------- talking to a world that opens this in a panel (?embed=1) ----------
  function toParent(msg) { try { if (parent && parent !== window) parent.postMessage({ type: '8gates:minigame', game: CHESS.key, ...msg }, '*'); } catch (e) {} }
  const onMsg = e => { const d = e.data; if (!d || d.type !== '8gates:minigame' || (d.game && d.game !== CHESS.key)) return;
    if (d.action === 'pause') { audio.suspend(true); } else if (d.action === 'resume') { audio.suspend(false); } else if (d.action === 'mute') { audio.setSound(false); audio.setMusic(false); } else if (d.action === 'unmute') { audio.setSound(prefs.sound); audio.setMusic(prefs.music); } else if (d.action === 'music') { audio.setMusic(!!d.on && prefs.music); } };
  addEventListener('message', onMsg);
  const onVis = () => { audio.suspend(document.hidden); }; document.addEventListener('visibilitychange', onVis);
  setTimeout(() => toParent({ action: 'ready' }), 0);

  // ---------- API (the page calls these) ----------
  const api = {
    hud: () => ({ phase, mode }), CHESS, OPPONENTS,
    setSafe(s) { const n = { top: Math.round(s.top || 0), bottom: Math.round(s.bottom || 0), left: Math.round(s.left || 0), right: Math.round(s.right || 0) }; if (Object.keys(n).some(k => Math.abs(n[k] - safe[k]) > 3)) { safe = n; aimCamera(); } },
    playCpu(lv = prefs.level, color = prefs.color) { prefs.level = lv; prefs.color = color; savePrefs(); begin('cpu', { level: lv, color }); },
    playLocal(tc = prefs.tc) { prefs.tc = tc; savePrefs(); begin('local', { tc }); },
    resume() { const R = loadResume(); if (!R) return; if (R.mode === 'cpu') begin('cpu', { level: R.level, color: R.myColor, moves: R.moves, practice: R.practice }); else begin('local', { moves: R.moves }); },
    rematch() { if (mode === 'cpu') begin('cpu', { level, color: myColor === 'w' ? 'b' : 'w' }); else if (mode === 'local') begin('local', {}); else if (mode === 'net') NET.request({ k: 'start' }); },
    menu: toMenu,
    demo() { begin('demo'); }, takeOver,
    previewOpponent(lv) { if (phase !== 'menu') return; const id = ['pip', 'hope', 'noble'][lv] || 'hope'; if (seated.b === id) return; seated = { w: null, b: id }; placeFoxes(); const O = OPPONENTS[lv]; if (O) talk('b', pick(O.lines.hello), O.name); },
    promote(t) { if (!promoAsk) return; const p = promoAsk; promoAsk = null; t = String(t).toLowerCase(); const req = { from: p.from, to: p.to, promo: t }; if (mode === 'net') { const ply = chess.history.length; if (!NET.isHost()) playMove(req, true); NET.request({ k: 'move', uci: sqName(p.from) + sqName(p.to) + t, ply }); } else playMove(req); },
    cancelPromo() { promoAsk = null; drawBoard(); emit(); },
    undo() { if (over || phase !== 'play') return; flushAnims(); if (mode === 'cpu') { cpuTok++; cpuBusy = false; if (!chess.history.length) return; chess.undo(); while (chess.history.length && chess.turn !== myColor) chess.undo(); practice = true; if (chess.turn !== myColor) setTimeout(cpuGo, 300); } else if (mode === 'local') { if (!chess.history.length) return; chess.undo(); if (prefs.autoFlip) povColor = chess.turn; aimCamera(); } else return; hint = null; clearSel(); syncPieces(); drawBoard(); storeResume(); live = 'Move taken back.'; speak(live); emit(); },
    hint() { if (hintBusy || mode !== 'cpu' || chess.turn !== myColor || over) return; hintBusy = true; practice = true; emit(); ask('hint', m => { hintBusy = false; if (m && chess.turn === myColor) { hint = { from: m.from, to: m.to }; live = 'Hint: ' + PIECE_NAMES[chess.b[m.from].toLowerCase()] + ' ' + sqName(m.from) + ' to ' + sqName(m.to); speak(live); drawBoard(); } emit(); }); },
    resign() { if (phase !== 'play' || over || mode === 'demo') return; if (mode === 'net') { NET.request({ k: 'resign' }); return; } const loser = mode === 'cpu' ? myColor : chess.turn; finish(loser === 'w' ? '0-1' : '1-0', COLOR_WORD[loser] + ' resigned'); },
    cycleView() { prefs.view = VIEWS[(VIEWS.indexOf(prefs.view) + 1) % VIEWS.length]; savePrefs(); aimCamera(); emit(); },
    flip() { povColor = povColor === 'w' ? 'b' : 'w'; if (mode === 'local') { prefs.autoFlip = false; savePrefs(); } placeFoxes(); aimCamera(); drawBoard(); emit(); },
    setPref(k, v) { prefs[k] = v; savePrefs(); if (k === 'sound') audio.setSound(v); if (k === 'music') { audio.unlock(); audio.setMusic(v); } if (k === 'theme') drawBoard(); if (k === 'speak' && v) speak('Speaking moves on.'); if (k === 'autoFlip' && v && mode === 'local') { povColor = chess.turn; aimCamera(); drawBoard(); } emit(); },
    // online
    netCreate: () => NET.create(), netJoin: code => NET.connect(code), netLeave: () => { NET.leave(); toMenu(); },
    netSit: c => NET.request({ k: 'sit', c }), netStand: () => NET.request({ k: 'stand' }), netQueue: () => NET.request({ k: 'queue' }), netStart: () => NET.request({ k: 'start' }), netClock: v => { prefs.tc = v; savePrefs(); NET.request({ k: 'tc', v }); }, netReact: w => NET.react(w),
    netShareURL() { if (!NET.room) return ''; try { const u = new URL(location.href); u.searchParams.delete('embed'); u.searchParams.delete('phone'); u.searchParams.set('room', NET.room); return u.href; } catch (e) { return ''; } },
    netCopied(v) { NET.copied = v; emit(); }, netOpenRoom() { if (NET.room && !(NET.state && NET.state.live)) { phase = 'room'; emit(); } },
    // demo/testing
    debug: { get foxes() { return Object.entries(foxes).map(([k, f]) => [k, f.visible, f.position.toArray().map(v => +v.toFixed(2))]); }, get cam() { return [camera.position.toArray(), camGoal.pos.toArray(), camGoal.look.toArray(), safe]; }, get chess() { return chess; }, playMove, tap, NET, get phase() { return phase; }, screen(n) { const v = sqPos(typeof n === 'string' ? sqIndex(n) : n).project(camera), r = el.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; } },
    destroy() { alive = false; audio.setMusic(false); removeEventListener('message', onMsg); document.removeEventListener('visibilitychange', onVis); document.removeEventListener('pointerdown', unlockAll, true); document.removeEventListener('keydown', unlockAll, true); document.removeEventListener('click', uiClick, true); cancelAnimationFrame(raf); NET.leave(true); ro.disconnect(); removeEventListener('resize', resize); removeEventListener('keydown', onKey); try { worker && worker.terminate(); } catch (e) {} renderer.dispose(); renderer.domElement.remove(); },
  };
  const rm = /[?&]room=([A-Za-z0-9]{4})/.exec(location.search); if (rm) setTimeout(() => NET.connect(rm[1]), 300);
  else if (/[?&]demo=1/.test(location.search)) setTimeout(() => begin('demo'), 600);
  return api;
}
