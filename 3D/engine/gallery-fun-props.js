// Blind Canvas gallery: FUN PROPS (27 Oct). The one file to edit to add props to the gallery.
// The game calls buildFunProps() once while the gallery loads, and tick(dt, t) every frame.
// Nothing else needs changing: collision, merging and phone culling are wired up in gallery-game.js.
//
// HOW A PROP WORKS
//   1. Build it as a THREE.Group whose feet stand on y = 0 (its own floor), facing +z.
//   2. Put it in the world with put(group, x, z, { ry, y, solid, size, moving, inside }).
//        - y: leave it out and the prop sits on whatever floor is under (x, z) (the building, the plaza or the park lawn).
//        - solid: true (default) makes a box players can't walk through. size = [w, h, d] of that box (else measured).
//        - moving: true for anything you animate in tick() (it is then never merged into the static batches).
//        - inside: a CAMPUS rect name ('why', 'amb', 'amb2', 'cinema') = only drawn while the camera is inside that building.
//   3. Animate it in tick(dt, t) (dt = seconds since last frame, t = seconds since start). Keep it cheap: phones!
//
// PHONE BUDGET (please keep): share materials between props, no real-time lights or shadows, textures 512 px or less
// (canvas textures through lean() from gallery-texmem.js), under ~40 meshes per prop, and no props in walkways
// (keep 3 m clear in front of art, screens and doors). See STYLE.md for colours: ink #1d1c1b, red #ec3013, white #eceae6.
import * as THREE from '../vendor/three/three.module.js';
import { lean } from './gallery-texmem.js';

export function buildFunProps({ floorAt, CAMPUS }) {
  const group = new THREE.Group();   // everything still: merged into a few draw calls after loading
  const moving = new THREE.Group();  // everything animated: left as is
  const col = [];                    // invisible boxes players bump into
  const inside = [];                 // [object, CAMPUS rect name]: drawn only while the camera is inside that building
  const tickers = [];                // functions (dt, t) called every frame

  function put(obj, x, z, o = {}) {
    const y = o.y ?? floorAt(x, z);
    obj.position.set(x, y, z); obj.rotation.y = o.ry || 0;
    if (o.moving) obj.traverse(m => { m.userData.dyn = true; });
    (o.moving ? moving : group).add(obj);
    if (o.inside) inside.push([obj, o.inside]);
    if (o.solid !== false) {
      let [w, h, d] = o.size || [0, 0, 0];
      if (!o.size) { obj.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(obj), s = b.getSize(new THREE.Vector3()); w = s.x; h = s.y; d = s.z; }
      const box = new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.2, w), Math.max(0.2, h), Math.max(0.2, d)));
      box.position.set(x, y + h / 2, z); box.rotation.y = o.size ? (o.ry || 0) : 0; box.updateMatrixWorld(true); col.push(box);
    }
    return obj;
  }

  // shared materials (reuse these so props batch together)
  const M = {
    ink: new THREE.MeshLambertMaterial({ color: 0x1d1c1b }),
    red: new THREE.MeshLambertMaterial({ color: 0xec3013 }),
    white: new THREE.MeshLambertMaterial({ color: 0xeceae6 }),
    oak: new THREE.MeshLambertMaterial({ color: 0xb98a5a }),
    gold: new THREE.MeshLambertMaterial({ color: 0xc9a14a }),
  };

  // ---------------------------------------------------------------- PROPS GO HERE
  // (27 Oct) TALKING CHESS: two chess tables at the end of the walk north of the WHY House (-6, 53), with a TALKING CHESS sign
  // facing the walk. Playing is engine/gallery-chess.js; this part only builds the tables and draws the pieces.
  const chess = buildChessCorner({ put, M, moving, floorAt });
  // Example (commented out): a red ball that bobs on the welcome plaza, beside the start.
  //   const ball = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 14), M.red);
  //   const holder = new THREE.Group(); ball.position.y = 0.4; holder.add(ball);
  //   put(holder, 4.5, 3.5, { moving: true, size: [0.8, 0.8, 0.8] });
  //   tickers.push((dt, t) => { ball.position.y = 0.4 + Math.abs(Math.sin(t * 2.2)) * 0.5; });

  return { group, moving, col, inside, chess, tick: (dt, t) => { for (const f of tickers) f(dt, t); } };
}

// ================================================================ TALKING CHESS corner
// Board: index 0 = a8 ... 63 = h1 (chess-rules.js). White sits on the table's -z side (the south stool, towards the walk).
const SQ = 0.085, BOARD = 0.9, BORDER = (BOARD - 8 * SQ) / 2, TOP_Y = 0.74, BOARD_Y = 0.757, SEAT_Z = 0.8;
const CHESS_SPOT = { tables: [[-8.6, 54.6], [-2.6, 55.2]], sign: [-6.0, 51.4] };   // (28 Oct, Ben) moved to the end of the empty walk north of the WHY House
const BRAILLE = [[1], [1, 2], [1, 4], [1, 4, 5], [1, 5], [1, 2, 4], [1, 2, 4, 5], [1, 2, 5]];   // a..h (and 1..8: braille digits are the letters a..i)
const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
const fontsReady = () => (document.fonts && document.fonts.load ? Promise.race([document.fonts.load('800 64px Archivo'), new Promise(r => setTimeout(r, 2500))]).catch(() => {}) : Promise.resolve());

// a tiny geometry merge (position / normal / uv), so each piece type is one shape
function mergeGeo(list) {
  const pos = [], nor = [], uv = [], idx = []; let off = 0;
  for (const g of list) { const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0); }
    if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(g.index.getX(i) + off); else for (let i = 0; i < p.count; i++) idx.push(i + off);
    off += p.count; g.dispose(); }
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); G.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); G.setIndex(idx); return G;
}
function pieceGeos() {
  const base = [[0, 0], [30, 0], [30, 6], [24, 10]];
  const lathe = pts => new THREE.LatheGeometry(base.concat(pts).map(([r, y]) => new THREE.Vector2(r * 0.001, y * 0.001)), 12);
  const boxAt = (w, h, d, x, y, z, rx = 0) => { const b = new THREE.BoxGeometry(w, h, d); if (rx) b.rotateX(rx); b.translate(x, y, z); return b; };
  return {
    p: lathe([[13, 16], [10, 38], [17, 42], [10, 46], [15, 52], [16, 60], [12, 68], [6, 72], [0, 73]]),
    r: lathe([[18, 16], [15, 58], [21, 61], [21, 78], [14, 78], [14, 73], [0, 73]]),
    n: mergeGeo([lathe([[17, 16], [13, 38], [17, 44], [0, 44]]), boxAt(0.026, 0.05, 0.034, 0, 0.066, -0.002, -0.25), boxAt(0.022, 0.022, 0.036, 0, 0.078, 0.022, 0.35), boxAt(0.008, 0.016, 0.008, 0.008, 0.098, -0.008), boxAt(0.008, 0.016, 0.008, -0.008, 0.098, -0.008)]),
    b: lathe([[16, 16], [11, 56], [18, 60], [11, 64], [15, 72], [14, 84], [9, 94], [4, 100], [5, 104], [0, 107]]),
    q: lathe([[18, 16], [11, 70], [20, 74], [12, 78], [20, 98], [14, 100], [8, 104], [8, 110], [0, 112]]),
    k: mergeGeo([lathe([[18, 16], [12, 76], [21, 80], [13, 84], [19, 102], [10, 108], [0, 108]]), boxAt(0.009, 0.034, 0.009, 0, 0.124, 0), boxAt(0.026, 0.009, 0.009, 0, 0.128, 0)]),
  };
}
// the board picture, drawn the way white sees it (rank 8 at the top, file A on the left); big ink border with white letters
function drawBoard() {
  const N = 512, B = N * BORDER / BOARD, S = (N - 2 * B) / 8, cv = document.createElement('canvas'); cv.width = cv.height = N; const c = cv.getContext('2d');
  c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, N, N);
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) { c.fillStyle = (r + f) & 1 ? '#8c5c3b' : '#e6d6b8'; c.fillRect(B + f * S, B + r * S, S + 0.5, S + 0.5); }
  c.strokeStyle = '#ec3013'; c.lineWidth = 3; c.strokeRect(B - 1.5, B - 1.5, 8 * S + 3, 8 * S + 3);
  c.fillStyle = '#f3f2f2'; c.font = `800 ${Math.round(B * 0.42)}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const txt = (s, x, y, flip) => { c.save(); c.translate(x, y); if (flip) c.rotate(Math.PI); c.fillText(s, 0, 0); c.restore(); };
  for (let i = 0; i < 8; i++) { const m = B + (i + 0.5) * S, F = 'ABCDEFGH'[i], R = String(8 - i);
    txt(F, m, N - B * 0.24, false); txt(F, m, B * 0.24, true);      // files: white's near edge (bottom) and black's (top, upside down)
    txt(R, B * 0.24, m, false); txt(R, N - B * 0.24, m, true); }   // ranks: white's left, black's left
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return lean(t);
}
function drawSign() {
  const W = 512, H = 352, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#ec3013'; c.fillRect(28, 30, 72, 12); c.fillRect(0, H - 14, W, 14);
  c.fillStyle = '#f3f2f2'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.font = `800 104px ${FONT}`; { const fs = Math.min(104, Math.floor(104 * (W - 48) / c.measureText('TALKING').width)); c.font = `800 ${fs}px ${FONT}`; } c.fillText('TALKING', 24, 146); c.font = `800 104px ${FONT}`; c.fillText('CHESS', 24, 240);
  c.font = `800 30px ${FONT}`; c.fillText('Sit at a table to play', 28, 288);
  c.fillStyle = '#ff9783'; c.font = `700 22px ${FONT}`; c.fillText('VS COMPUTER OR FRIEND · READ ALOUD', 28, 322);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return lean(t);
}
function buildChessCorner({ put, M, moving, floorAt }) {
  const boardMat = new THREE.MeshLambertMaterial({ color: 0x8c5c3b }), signMat = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
  fontsReady().then(() => { boardMat.map = drawBoard(); boardMat.color.set(0xffffff); boardMat.needsUpdate = true; signMat.map = drawSign(); signMat.color.set(0xffffff); signMat.needsUpdate = true; });
  const mesh = (geo, mat, x, y, z, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const cyl = (r0, r1, h, seg = 16) => new THREE.CylinderGeometry(r0, r1, h, seg);
  // ---- the sign, facing the walk (south)
  { const g = new THREE.Group();
    for (const x of [-0.9, 0.9]) mesh(new THREE.BoxGeometry(0.08, 2.5, 0.08), M.ink, x, 1.25, 0, g);
    mesh(new THREE.BoxGeometry(1.96, 1.36, 0.06), M.ink, 0, 1.78, 0, g);
    mesh(new THREE.PlaneGeometry(1.9, 1.306), signMat, 0, 1.78, 0.031, g);
    const [x, z] = CHESS_SPOT.sign; put(g, x, z, { ry: Math.PI, size: [2.0, 2.5, 0.25] }); }
  // ---- the tables + stools (still: merged by the game)
  const tables = CHESS_SPOT.tables.map(([x, z], i) => {
    const g = new THREE.Group(), ry = 0;
    mesh(new THREE.BoxGeometry(1.0, 0.05, 1.0), M.oak, 0, TOP_Y - 0.025, 0, g);
    mesh(cyl(0.07, 0.09, TOP_Y - 0.08), M.ink, 0, (TOP_Y - 0.05) / 2, 0, g);
    mesh(cyl(0.34, 0.37, 0.04, 20), M.ink, 0, 0.02, 0, g);
    mesh(new THREE.BoxGeometry(BOARD, 0.016, BOARD), M.ink, 0, TOP_Y + 0.008, 0, g);
    const top = new THREE.PlaneGeometry(BOARD, BOARD); top.rotateX(-Math.PI / 2); top.rotateY(Math.PI); mesh(top, boardMat, 0, BOARD_Y, 0, g);
    for (const sz of [-SEAT_Z, SEAT_Z]) {
      mesh(cyl(0.21, 0.21, 0.06, 18), M.oak, 0, 0.47, sz, g);
      mesh(cyl(0.215, 0.215, 0.016, 18), sz < 0 ? M.white : M.ink, 0, 0.445, sz, g);   // a white band on white's stool, ink on black's
      mesh(cyl(0.035, 0.035, 0.44, 8), M.ink, 0, 0.22, sz, g);
      mesh(cyl(0.18, 0.2, 0.03, 16), M.ink, 0, 0.015, sz, g); }
    const y = floorAt(x, z);
    put(g, x, z, { ry, y, size: [1.0, TOP_Y + 0.04, 1.0] });
    const name = 'Chess table ' + (i + 1);
    const seat = (side, lz) => ({ x: x + Math.sin(ry) * lz, z: z + Math.cos(ry) * lz, ry, len: 0.9, top: y + 0.5, name: name + (side === 'w' ? ', white side' : ', black side'),
      look: [x, y + BOARD_Y, z], pitch: 0.72, camDist: 1.05, chess: i, side });
    return { id: i, name, x, y, z, ry, sq: SQ, boardY: BOARD_Y, seats: { w: seat('w', -SEAT_Z), b: seat('b', SEAT_Z) }, m: new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry), new THREE.Vector3(1, 1, 1)) };
  });
  // ---- moving parts, instanced across both tables: 6 piece shapes, the braille dots, the red square marks
  const PER = 18, NT = tables.length, geos = pieceGeos(), pieceMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const inst = {}, zero = new THREE.Matrix4().makeScale(0, 0, 0);
  const addInst = (geo, mat, n) => { const im = new THREE.InstancedMesh(geo, mat, n); im.frustumCulled = false; im.userData.dyn = true; for (let i = 0; i < n; i++) im.setMatrixAt(i, zero); moving.add(im); return im; };
  for (const k of 'prnbqk') { inst[k] = addInst(geos[k], pieceMat, PER * NT); inst[k].setColorAt(0, new THREE.Color(1, 1, 1)); }
  const local = (sq, y = BOARD_Y) => new THREE.Vector3((3.5 - (sq & 7)) * SQ, y, (3.5 - (sq >> 3)) * SQ);   // file A on white's left (+x), rank 8 far from white (+z)
  // braille dots on the border: files on both near edges, ranks on both left edges, each read the right way up from its own seat
  { const dots = [];
    const uv = (u, v) => [(BOARD / 2 - u) * 1, (BOARD / 2 - v) * 1];   // board-picture metres (u right, v down, white's view) to table x, z
    const cell = (pat, uc, vc, flip) => { for (const n of pat) { const cx = n > 3 ? 1 : 0, ry = (n - 1) % 3, s = flip ? -1 : 1; dots.push(uv(uc + s * (cx - 0.5) * 0.016, vc + s * (ry - 1) * 0.016)); } };
    const inner = BORDER * 0.72;
    for (let i = 0; i < 8; i++) { const m = BORDER + (i + 0.5) * SQ;
      cell(BRAILLE[i], m, BOARD - inner, false); cell(BRAILLE[i], m, inner, true);
      cell(BRAILLE[7 - i], inner, m, false); cell(BRAILLE[7 - i], BOARD - inner, m, true); }
    const dg = new THREE.SphereGeometry(0.0055, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), im = addInst(dg, M.white, dots.length * NT), o = new THREE.Matrix4();
    tables.forEach((t, ti) => dots.forEach(([dx, dz], j) => { o.makeTranslation(dx, BOARD_Y, dz); im.setMatrixAt(ti * dots.length + j, o.premultiply(t.m)); }));
    im.instanceMatrix.needsUpdate = true; }
  const marks = addInst(new THREE.BoxGeometry(SQ * 0.94, 0.003, SQ * 0.94), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.6, depthWrite: false }), 3 * NT);
  const dotsT = addInst(new THREE.CylinderGeometry(0.017, 0.017, 0.006, 14), new THREE.MeshBasicMaterial({ color: 0xec3013 }), 28 * NT);   // where the picked piece can go
  const WHITE = new THREE.Color('#f4f1ea'), BLACK = new THREE.Color('#2a2826'), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1), tmp = new THREE.Matrix4();
  for (const t of tables) {
    t.setBoard = (b, lift = -1) => {   // lift: the picked-up piece floats a little
      const used = {}; for (const k of 'prnbqk') used[k] = 0;
      for (let sq = 0; sq < 64; sq++) { const p = b[sq]; if (!p) continue; const k = p.toLowerCase(), w = p < 'a', n = used[k]++; if (n >= PER) continue;
        q.setFromAxisAngle(up, w ? 0 : Math.PI); tmp.compose(local(sq, BOARD_Y + (sq === lift ? 0.04 : 0)), q, one).premultiply(t.m);
        inst[k].setMatrixAt(t.id * PER + n, tmp); inst[k].setColorAt(t.id * PER + n, w ? WHITE : BLACK); }
      for (const k of 'prnbqk') { for (let n = used[k]; n < PER; n++) inst[k].setMatrixAt(t.id * PER + n, zero); inst[k].instanceMatrix.needsUpdate = true; if (inst[k].instanceColor) inst[k].instanceColor.needsUpdate = true; }
    };
    // red marks: the square you picked, and the last move's from + to
    t.mark = ({ sel = -1, from = -1, to = -1 } = {}) => {
      [sel, from, to].forEach((sq, j) => marks.setMatrixAt(t.id * 3 + j, sq < 0 ? zero : tmp.makeTranslation(local(sq, BOARD_Y + 0.002)).premultiply(t.m)));
      marks.instanceMatrix.needsUpdate = true; };
    t.targets = (list = []) => { for (let j = 0; j < 28; j++) dotsT.setMatrixAt(t.id * 28 + j, j < list.length ? tmp.makeTranslation(local(list[j], BOARD_Y + 0.004)).premultiply(t.m) : zero); dotsT.instanceMatrix.needsUpdate = true; };
  }
  const START = [...'rnbqkbnrpppppppp', ...Array(32).fill(''), ...'PPPPPPPPRNBQKBNR'];
  for (const t of tables) { t.setBoard(START); t.mark(); }
  // (29 Oct, phones) the pieces were drawn from everywhere (no culling: 9 instanced draws even from inside the museum). They now
  // carry one bounding sphere round both tables, so they are only skipped when the tables are off screen: nothing seen changes.
  { const c = new THREE.Vector3(); for (const t of tables) c.add(new THREE.Vector3(t.x, t.y, t.z)); c.divideScalar(Math.max(1, NT));
    let r = 0; for (const t of tables) r = Math.max(r, c.distanceTo(new THREE.Vector3(t.x, t.y, t.z)));
    const bs = new THREE.Sphere(c, r + 1.5);
    moving.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(moving.matrixWorld).invert();
    for (const im of [...Object.values(inst), marks, dotsT]) { im.boundingSphere = bs.clone().applyMatrix4(inv); im.frustumCulled = true; }
    moving.children.forEach(im => { if (im.isInstancedMesh && !im.frustumCulled && im.geometry && im.geometry.parameters && im.geometry.parameters.radius === 0.0055) { im.boundingSphere = bs.clone().applyMatrix4(inv); im.frustumCulled = true; } }); }   // the braille dots
  return { tables };
}
