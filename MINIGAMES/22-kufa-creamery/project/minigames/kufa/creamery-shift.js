// 8 GATES — KUFA · THE CREAMERY [kufaCreamery]: Jamil's soft serve shift. Built on the Meru Burgers / Jidda Smoothie engine + engine/restaurant-kit.js.
// Steps follow the 2D SOFT SERVE minigame (Jamil: "Six things, and the sixth one is hurry."):
//   CUP OR CONE (tap) → FLAVOUR (tap the nozzle) → SWIRL (draw circles under the nozzle; the soft serve follows your finger, one coil per turn)
//   → SAUCE (hold the bottle over the serve while the turntable spins; slide up/down to spiral it) → TOPPING (shake the jar: wiggle a finger, or shake the phone)
//   → SERVE (flick or drag the cone to the customer) → PAY (exact change). The serve starts melting the moment it leaves the machine.
// Save keys kufa.creamery.*, flags ic.hired / ic.shift / ic.ace (2D), creameryUniform.
// MERGE INTO A WORLD: buildCreamery(ctx) builds the room at ctx.origin (+ ctx.rotY) and returns K with K.solids / K.door / K.walkable(x, z)
// (local metres) so a world's walker can walk in and around it. createCreameryShift({ container, onState }) runs it stand-alone, with a WALK mode.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST, castKit, loadCastRigs } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, registerKit, dinerUniform } from '../../engine/restaurant-kit.js';
import { creamerySound } from './creamery-audio.js';

export const CREAMERY = { name: 'THE CREAMERY · THE SHIFT', room: 'kufaCreamery', shift: 180, owner: 'JAMIL', place: 'Kufa · The Creamery' };
export const FLAVOURS = { chocolate: { name: 'CHOCOLATE', col: '#6b4423', dark: '#42280f' }, swirl: { name: 'SWIRL', col: '#f7f0dc', col2: '#6b4423', dark: '#8f5566' }, vanilla: { name: 'VANILLA', col: '#f7f0dc', dark: '#c2b490' } };
const FK = ['chocolate', 'swirl', 'vanilla'];            // nozzles, left → right as you face the machine
export const SIZES = { small: { name: 'SMALL', coils: 2, price: 2, day: 1 }, medium: { name: 'MEDIUM', coils: 3, price: 3, day: 1 }, large: { name: 'LARGE', coils: 4.5, price: 4, day: 3 } };
export const VESSELS = { cone: { name: 'CONE' }, cup: { name: 'CUP' } };
export const SAUCES = { fudge: { name: 'FUDGE', col: '#4a2c14', bottle: '#6b4423', day: 1 }, caramel: { name: 'CARAMEL', col: '#c9862f', bottle: '#dca44f', day: 1 }, berry: { name: 'BERRY', col: '#c9243a', bottle: '#e2453f', day: 2 } };
export const TOPPINGS = { sprinkles: { name: 'SPRINKLES', cols: ['#ec3013', '#f2c53d', '#4e9ad6', '#5fae5c', '#f7a8c4'], day: 1 }, chips: { name: 'CHIPS', cols: ['#3a2210', '#6b4423'], day: 1 }, berries: { name: 'BERRIES', cols: ['#c9243a', '#e2453f'], day: 2 }, nuts: { name: 'NUTS', cols: ['#c19a5e', '#a87f42'], day: 3 } };
export const UPGRADES = [
  { id: 'coldPlate', name: 'COLD PLATE', cost: 40, line: 'A frosted turntable. Serves melt 40% slower.' },
  { id: 'steady', name: 'STEADY NOZZLE', cost: 35, line: 'The swirl forgives a wobbly hand.' },
  { id: 'squeeze', name: 'SQUEEZE BOTTLES', cost: 30, line: 'Thick ribbons: sauce covers 50% faster.' },
  { id: 'shaker', name: 'BIG SHAKER', cost: 30, line: 'Every shake throws twice the topping.' },
  { id: 'fan', name: 'CEILING FAN', cost: 60, line: 'It is forty degrees out. Customers wait 20% longer.' }];
// Kufa townsfolk from the 2D world file (shops, tavern, bazaar, oasis)
const CUSTOMERS = [
  { name: 'HADI', role: 'Item shop', fur: '#fbc98a', furDark: '#dd9648', torso: ['#d8b98a', '#a8843f', '#5a4218'] },
  { name: 'ZOHRA', role: 'Armory', torso: ['#8c4a2a', '#c2963f', '#43301c'], outfit: 'coat' },
  { name: 'NASRIN', role: 'Tavern', fur: '#e8b878', furDark: '#a8762e', torso: ['#2f5d4a', '#f2e6cf', '#1f3d31'] },
  { name: 'RAFIQ', role: 'Spy shop', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#3a3836', '#6b6560', '#201e1d'], outfit: 'coat' },
  { name: 'SURA', role: 'Tavern', torso: ['#c9243a', '#f2c53d', '#7a1420'] },
  { name: 'JIBRIL', role: 'Tavern', fur: '#d9954e', furDark: '#a86a22', torso: ['#8c4a2a', '#5a2f18', '#43301c'] },
  { name: 'GHAZI', role: 'Caravan master', torso: ['#e9d3a8', '#b08850', '#5a4218'], outfit: 'robe' },
  { name: 'UMMI REYHAN', role: 'Camel pen', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#7a5a8c', '#e6d6f0', '#45305a'], outfit: 'robe' },
  { name: 'BAHRI', role: 'The Oasis', torso: ['#2f9a8f', '#e0f2f0', '#1f6a62'] },
  { name: 'QASIM', role: 'Water broker', fur: '#c96a2a', furDark: '#8f4515', torso: ['#1f3350', '#c2963f', '#16263c'], outfit: 'suit' }];
const LINES = { order: ['It is forty degrees out there!', 'Something cold. Anything cold.', 'Two coins for our own water. Worth it.', 'Quick, before I melt too.', 'The usual!', 'I walked from the bazaar for this.'], angry: ['Too slow! I am going to the oasis.', 'I will drink from the standpipe instead.'] };
const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['The coldest thing on Kufa, and it is perfect!', 'Look at that swirl. LOOK at it.', 'I am telling the whole bazaar!'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Lovely, thank you!', 'Just how I like it.', 'Cold and sweet. Perfect.'] }, neutral: { word: 'NEUTRAL', col: '#e6b45a', mood: 'neutral', lines: ['It is fine. A little sad-looking.', 'Okay. Thanks.', 'Hm. Not bad.'] }, unhappy: { word: 'UNHAPPY', col: '#ff9a8a', mood: 'sad', lines: ['This is not what I asked for...', 'It is half melted.', 'I waited for this?'] }, insulted: { word: 'INSULTED!', col: '#ec3013', mood: 'angry', lines: ['That is NOT my order!', 'Do I look like I ordered that?', 'Make it again. Properly.'] } };
const SAVE = { day: 'kufa.creamery.day', best: 'kufa.creamery.best', upg: 'kufa.creamery.upg.', stars: 'kufa.creamery.stars', bestServe: 'kufa.creamery.bestServe' };
const MAX_COILS = 6.4, MELT_S = 40;
// JAMIL: lines, topics and replies verbatim from the 2D world file (key kufaCreamer)
export const JAMIL = { name: 'JAMIL', role: 'The Creamery, Kufa',
  hello: 'Any chance you are looking for a job? We got great ICECREAM here, super fun to make.', again: 'Still hiring, by the way.',
  ace: ['There she is. Ninety and over, on my machine.', 'You can have a shift whenever you want one.'], shift: ['Back already. The apron is where you left it.'],
  how: ['Apron on. The ticket comes up on the rail and you build what it says.', 'Six things, and the sixth one is hurry.', 'The ticket tells you cup or cone. Tap the one it says — get that wrong and nothing after it counts for much.', 'Then the nozzle. Chocolate, swirl, vanilla, and the ringed one is the one they ordered.', 'Then you PULL it. Press under the nozzle and go round, and round, and keep the same circle — small is two turns, medium three, large four and a half. Wobble and it comes out looking like a rockfall.', 'Sauce across the whole of it, topping across the whole of it, and then move. It is forty degrees out that door. It starts melting the moment it leaves the machine.'],
  why: ['Everybody asks it like that. Like it is a strange thing to do here.', 'Kufa is the only town on this planet with water UNDER it. Not a river, not rain — a whole cold body of it down in the rock, and every argument this town has ever had is about who gets a share.', 'My father hauled it. Forty years, bucket by bucket, and he sold it for what a bucket of water is worth, which is nothing, because everyone has one.', 'So I freeze it. Same water. Two coins.', 'They queue. For their own water. I love this town.'],
  look: { fur: '#efa863', furDark: '#c07c2f', muzzle: '#fbe0b8', snout: '#f3c88e', chin: '#fbe0b8', earInner: '#d4879c', ear: '#3b2410' }, torso: ['#f2b7c6', '#d4879c', '#43301c'], eyes: ['#2f5d4a', '#2f5d4a'] };

// ---------------- art helpers ----------------
// A soft-serve "rope": a star-ridged tube along any path, rebuilt in place (preallocated, no garbage). Swirl = two-tone twist via vertex colours.
export function makeRope(T3, { maxPts = 260, radial = 12, grad } = {}) {
  const nV = maxPts * (radial + 1), pos = new Float32Array(nV * 3), nor = new Float32Array(nV * 3), col = new Float32Array(nV * 3), idx = [];
  for (let i = 0; i < maxPts - 1; i++) for (let j = 0; j < radial; j++) { const a = i * (radial + 1) + j, b = a + radial + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const geo = new T3.BufferGeometry(); geo.setIndex(idx); geo.setAttribute('position', new T3.BufferAttribute(pos, 3)); geo.setAttribute('normal', new T3.BufferAttribute(nor, 3)); geo.setAttribute('color', new T3.BufferAttribute(col, 3)); geo.setDrawRange(0, 0);
  geo.boundingSphere = new T3.Sphere(new T3.Vector3(0, 0.1, 0), 0.5);
  const mesh = new T3.Mesh(geo, new T3.MeshToonMaterial({ color: 0xffffff, vertexColors: true, gradientMap: grad }));
  const omat = new T3.MeshBasicMaterial({ color: 0x1a1626, side: T3.BackSide }); omat.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = vec3( position ) + normal * 0.0042;'); };
  const outline = new T3.Mesh(geo, omat); mesh.add(outline); mesh.castShadow = true; mesh.frustumCulled = outline.frustumCulled = false;
  const T = new T3.Vector3(), N = new T3.Vector3(), B = new T3.Vector3(), P = new T3.Vector3(), tmp = new T3.Vector3(), cA = new T3.Color(), cB = new T3.Color();
  // pts: [{ x, y, z, r }] (r = local thickness); colA/colB: hex; twist: 0 = one colour
  function update(pts, { rad = 0.024, colA = '#f7f0dc', colB = null } = {}) {
    const n = Math.min(pts.length, maxPts); if (n < 2) { geo.setDrawRange(0, 0); return; }
    cA.set(colA); cB.set(colB || colA); N.set(0, 0, 0);
    for (let i = 0; i < n; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)]; T.set(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z); if (T.lengthSq() < 1e-12) T.set(1, 0, 0); T.normalize();
      if (i === 0) { tmp.set(0, 1, 0); if (Math.abs(T.dot(tmp)) > 0.9) tmp.set(1, 0, 0); N.crossVectors(T, tmp).normalize(); } else { N.addScaledVector(T, -N.dot(T)); if (N.lengthSq() < 1e-8) N.set(0, 1, 0).cross(T); N.normalize(); }
      B.crossVectors(T, N); const p = pts[i], r = rad * (p.r == null ? 1 : p.r);
      for (let j = 0; j <= radial; j++) { const th = j / radial * Math.PI * 2, ridge = 1 + 0.17 * Math.cos(th * 6), c = Math.cos(th), s = Math.sin(th), k = (i * (radial + 1) + j) * 3;
        P.set(N.x * c + B.x * s, N.y * c + B.y * s, N.z * c + B.z * s); pos[k] = p.x + P.x * r * ridge; pos[k + 1] = p.y + P.y * r * ridge; pos[k + 2] = p.z + P.z * r * ridge; nor[k] = P.x; nor[k + 1] = P.y; nor[k + 2] = P.z;
        const cc = colB && ((j + Math.floor(i * 0.5)) % radial) < radial / 2 ? cB : cA; col[k] = cc.r; col[k + 1] = cc.g; col[k + 2] = cc.b; } }
    geo.attributes.position.needsUpdate = geo.attributes.normal.needsUpdate = geo.attributes.color.needsUpdate = true; geo.setDrawRange(0, (n - 1) * radial * 6); }
  return { mesh, update, clear() { geo.setDrawRange(0, 0); } };
}
export function vesselMesh(T3, toon, addOutline, CTX, grad, kind, s = 1) {
  const g = new T3.Group();
  if (kind === 'cone') { const tex = CTX(128, 128, c => { c.fillStyle = '#d9a95e'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#a8772e'; c.lineWidth = 6; for (let i = -128; i < 256; i += 26) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 128, 128); c.stroke(); c.beginPath(); c.moveTo(i + 128, 0); c.lineTo(i, 128); c.stroke(); } }); tex.wrapS = tex.wrapT = T3.RepeatWrapping; tex.repeat.set(3, 2);
    const body = new T3.Mesh(new T3.ConeGeometry(0.058 * s, 0.17 * s, 20, 1, true), new T3.MeshToonMaterial({ map: tex, gradientMap: grad, side: T3.DoubleSide })); body.rotation.x = Math.PI; body.position.y = -0.085 * s; addOutline(body, 0.005); g.add(body);
    const rim = new T3.Mesh(new T3.TorusGeometry(0.058 * s, 0.009 * s, 6, 22), toon('#c48a3f')); rim.rotation.x = Math.PI / 2; g.add(rim); g.userData.bottom = -0.17 * s; g.userData.rimR = 0.058 * s; }
  else { const tex = CTX(128, 64, c => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fbf3e2' : '#f2b7c6'; c.fillRect(i * 16, 0, 16, 64); } c.fillStyle = '#3fa889'; c.fillRect(0, 26, 128, 12); }); tex.wrapS = T3.RepeatWrapping; tex.repeat.set(2, 1);
    const body = new T3.Mesh(new T3.CylinderGeometry(0.068 * s, 0.05 * s, 0.09 * s, 22, 1, true), new T3.MeshToonMaterial({ map: tex, gradientMap: grad, side: T3.DoubleSide })); body.position.y = -0.045 * s; addOutline(body, 0.005); g.add(body);
    const bot = new T3.Mesh(new T3.CircleGeometry(0.05 * s, 20), toon('#fbf3e2')); bot.rotation.x = -Math.PI / 2; bot.position.y = -0.089 * s; g.add(bot);
    const rim = new T3.Mesh(new T3.TorusGeometry(0.068 * s, 0.006 * s, 6, 22), toon('#fbf3e2')); rim.rotation.x = Math.PI / 2; g.add(rim); g.userData.bottom = -0.09 * s; g.userData.rimR = 0.068 * s; }
  const lid = new T3.Mesh(new T3.CircleGeometry(g.userData.rimR * 0.95, 20), toon(kind === 'cone' ? '#8a5a26' : '#efe6d6')); lid.rotation.x = -Math.PI / 2; lid.position.y = -0.004; g.add(lid);
  return g;
}

// ---------------- THE CREAMERY interior ----------------
// Local metres: room 12 x 10 x 4.2, floor centre at the origin, front wall (door + window) at +z, machine wall at -z.
// Back counter + MACHINE along the back wall, the FRONT COUNTER (dress turntable, sauces, topping bins, register) in the middle,
// customers queue on the shop side. Worker gap at the right end of the front counter, so a walking fox can go behind it.
export function buildCreamery(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, grad, addOutline, origin = { x: 0, z: 0 }, rotY = 0 } = ctx, root = new T3.Group(); root.position.set(origin.x, origin.y || 0, origin.z); root.rotation.y = rotY; scene.add(root);
  const W = 12, D = 10, H = 4.2, mint = toon('#9fdcc8'), mintD = toon('#3fa889'), cream = toon('#fbf3e2'), pink = toon('#f2b7c6'), pinkD = toon('#d4879c'), brass = toon('#c2963f'), chrome = toon('#d7dde3'), ink = toon('#201e1d'), woodD = toon('#8a6a3a');
  const K = { root, W, D, H, cut: [], front: [], lamps: [], picks: [], solids: [] };
  // floor: mint + cream checks with a pink dot
  const floorT = CTX(256, 256, c => { c.fillStyle = '#fbf3e2'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#9fdcc8'; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2) c.fillRect(x * 32, y * 32, 32, 32); c.fillStyle = '#f2b7c6'; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2 === 0) c.fillRect(x * 32 + 13, y * 32 + 13, 6, 6); }); floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 2, D / 2);
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), new T3.MeshToonMaterial({ map: floorT, gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  // walls: candy stripes up top, pink wainscot, brass rail; frost on the corners (the one cold room on Kufa)
  const wallT = CTX(256, 256, c => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fbf3e2' : '#cdeee2'; c.fillRect(i * 32, 0, 32, 170); } c.fillStyle = '#f2b7c6'; c.fillRect(0, 170, 256, 86); c.fillStyle = '#e8a3b5'; for (let x = 0; x < 256; x += 32) c.fillRect(x, 176, 3, 80); c.fillStyle = '#c2963f'; c.fillRect(0, 164, 256, 8); });
  wallT.wrapS = T3.RepeatWrapping; const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: grad });
  const wall = (w, x, z, ry, front) => { const t = wallT.clone(); t.needsUpdate = true; t.repeat.set(w / 3, 1); const m = new T3.Mesh(new T3.PlaneGeometry(w, H), new T3.MeshToonMaterial({ map: t, gradientMap: grad })); m.position.set(x, H / 2, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); (front ? K.front : K.cut).push(m); return m; };
  wall(W, 0, -D / 2, 0); wall(D, -W / 2, 0, Math.PI / 2, true); wall(D, W / 2, 0, -Math.PI / 2, true);
  // front wall with the door gap (x 2.8..4.4) and the big window
  wall(W / 2 + 2.8, (-W / 2 + 2.8) / 2, D / 2, Math.PI, true); wall(W / 2 - 4.4, (4.4 + W / 2) / 2, D / 2, Math.PI, true);
  { const top = new T3.Mesh(new T3.PlaneGeometry(1.6, H - 2.7), wallM); top.position.set(3.6, 2.7 + (H - 2.7) / 2, D / 2); top.rotation.y = Math.PI; root.add(top); K.front.push(top);
    const desert = CTX(512, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#ffd27a'); g.addColorStop(0.5, '#ffe9b8'); g.addColorStop(0.62, '#e8c27a'); g.addColorStop(1, '#c9944a'); c.fillStyle = g; c.fillRect(0, 0, 512, 256);
      c.fillStyle = '#fff6d0'; c.beginPath(); c.arc(400, 60, 34, 0, 7); c.fill(); c.fillStyle = '#d9a95e'; for (const [x, w, h] of [[20, 90, 70], [130, 60, 96], [210, 110, 60], [430, 80, 84]]) { c.fillRect(x, 160 - h, w, h); c.fillStyle = '#b8863c'; c.fillRect(x + 10, 170 - h, 14, 18); c.fillRect(x + w - 26, 170 - h, 14, 18); c.fillStyle = '#d9a95e'; }
      c.fillStyle = '#7a5a3a'; c.beginPath(); c.ellipse(330, 170, 34, 12, 0, 0, 7); c.fill(); c.fillRect(306, 170, 5, 26); c.fillRect(350, 170, 5, 26); c.beginPath(); c.moveTo(356, 166); c.lineTo(372, 140); c.lineTo(380, 142); c.lineTo(366, 170); c.fill(); c.beginPath(); c.arc(318, 158, 10, 0, 7); c.fill();
      c.fillStyle = '#4f8a3a'; for (const x of [80, 270, 480]) { c.fillRect(x, 120, 5, 50); for (let i = 0; i < 5; i++) { c.save(); c.translate(x + 2, 122); c.rotate(-1.2 + i * 0.6); c.fillRect(0, -3, 34, 6); c.restore(); } } });
    const win = new T3.Mesh(new T3.PlaneGeometry(5.2, 2.0), new T3.MeshBasicMaterial({ map: desert })); win.position.set(-2.4, 1.9, D / 2 - 0.02); win.rotation.y = Math.PI; root.add(win); K.front.push(win);
    const frost = CTX(256, 128, c => { c.clearRect(0, 0, 256, 128); for (const [x, y] of [[0, 0], [256, 0], [0, 128], [256, 128]]) { const g = c.createRadialGradient(x, y, 0, x, y, 70); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 256, 128); } });
    const fr = new T3.Mesh(new T3.PlaneGeometry(5.2, 2.0), new T3.MeshBasicMaterial({ map: frost, transparent: true, depthWrite: false })); fr.position.set(-2.4, 1.9, D / 2 - 0.03); fr.rotation.y = Math.PI; root.add(fr); K.front.push(fr);
    for (const x of [-5.0, -2.4, 0.2]) K.front.push(M(new T3.BoxGeometry(0.1, 2.1, 0.1), brass, x, 1.9, D / 2 - 0.06, root, 0.01)); K.front.push(M(new T3.BoxGeometry(5.3, 0.1, 0.12), brass, -2.4, 2.92, D / 2 - 0.06, root, 0.01), M(new T3.BoxGeometry(5.3, 0.1, 0.12), brass, -2.4, 0.88, D / 2 - 0.06, root, 0.01));
    K.front.push(M(new T3.BoxGeometry(1.8, 0.12, 0.14), brass, 3.6, 2.72, D / 2 - 0.06, root, 0.01)); for (const x of [2.75, 4.45]) K.front.push(M(new T3.BoxGeometry(0.1, 2.7, 0.14), brass, x, 1.35, D / 2 - 0.06, root, 0.01));
    const mat = M(new T3.BoxGeometry(1.4, 0.02, 0.9), mintD, 3.6, 0.01, D / 2 - 0.6, root, 0); mat.receiveShadow = true; }
  K.cut.push(M(new T3.BoxGeometry(W, 0.2, D), toon('#eef8f3'), 0, H + 0.1, 0, root, 0));
  K.door = { x: 3.6, z: D / 2, w: 1.6, inside: { x: 3.4, z: D / 2 - 2.4 } };

  // ---- BACK COUNTER + THE MACHINE (three nozzles: chocolate, swirl, vanilla) ----
  const BT = 0.95; K.backTop = BT;
  M(new T3.BoxGeometry(6.4, BT, 0.9), mintD, -1.5, BT / 2, -D / 2 + 0.45, root, 0.03); M(new T3.BoxGeometry(6.5, 0.06, 0.98), cream, -1.5, BT + 0.03, -D / 2 + 0.47, root, 0.012); M(new T3.BoxGeometry(6.5, 0.04, 0.04), brass, -1.5, BT, -D / 2 + 0.96, root, 0);
  K.solids.push([-4.75, -5, 1.75, -4.0]);
  const mach = { x: -1.2, z: -4.5 }; K.machine = mach;
  { const g = new T3.Group(); g.position.set(mach.x, BT + 0.06, mach.z); root.add(g);
    M(new T3.BoxGeometry(1.36, 0.08, 0.66), chrome, 0, 0, 0, g, 0.01);                       // base
    M(new T3.BoxGeometry(1.36, 0.62, 0.3), toon('#e8f4ef'), 0, 0.34, -0.18, g, 0.015);         // back column (the bay opens in front of it)
    M(new T3.BoxGeometry(1.42, 0.66, 0.68), mint, 0, 0.98, 0, g, 0.02);                        // upper body
    M(new T3.BoxGeometry(1.3, 0.48, 0.02), chrome, 0, 0.98, 0.345, g, 0);                      // chrome front panel
    for (const x of [-0.36, 0.36]) { M(new T3.CylinderGeometry(0.22, 0.24, 0.16, 20), cream, x, 1.38, -0.05, g, 0.01, 0.24); M(new T3.CylinderGeometry(0.06, 0.06, 0.05, 12), pinkD, x, 1.48, -0.05, g, 0); }
    const plate = CTX(256, 64, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#7dd3fc'; c.font = '900 34px Archivo, Arial'; c.textBaseline = 'middle'; c.fillText('-6°', 14, 34); c.fillStyle = '#ffd23a'; c.textAlign = 'right'; c.fillText('KUFA', 242, 34); });
    const pl = new T3.Mesh(new T3.PlaneGeometry(0.5, 0.125), new T3.MeshBasicMaterial({ map: plate })); pl.position.set(0, 1.16, 0.358); g.add(pl);
    // drip tray (the vessel stands here) + nozzles + pull handles
    M(new T3.BoxGeometry(1.2, 0.04, 0.4), chrome, 0, 0.06, 0.36, g, 0.008); for (let i = 0; i < 9; i++) M(new T3.BoxGeometry(0.02, 0.005, 0.34), toon('#9aa4ad'), -0.48 + i * 0.12, 0.083, 0.36, g, 0);
    K.trayY = BT + 0.06 + 0.085; K.nozzles = []; K.levers = [];
    FK.forEach((k, i) => { const x = (i - 1) * 0.4, F = FLAVOURS[k];
      M(new T3.CylinderGeometry(0.055, 0.07, 0.12, 14), chrome, x, 0.6, 0.34, g, 0.006, 0.07);
      const tip = M(new T3.CylinderGeometry(0.035, 0.024, 0.07, 6), toon('#b7bfc2'), x, 0.51, 0.34, g, 0.005, 0.035);
      const dot = M(new T3.CylinderGeometry(0.035, 0.035, 0.02, 14), toon(k === 'swirl' ? '#c98a9c' : F.col), x, 0.86, 0.36, g, 0.004); dot.rotation.x = Math.PI / 2;
      const lv = new T3.Group(); lv.position.set(x, 0.72, 0.38); g.add(lv); M(new T3.BoxGeometry(0.035, 0.035, 0.22), ink, 0, 0, 0.11, lv, 0.004); M(new T3.SphereGeometry(0.04, 10, 8), toon(k === 'swirl' ? '#c98a9c' : k === 'chocolate' ? '#6b4423' : '#f2e6c4'), 0, 0, 0.22, lv, 0.004); K.levers.push(lv);
      const wp = new T3.Vector3(); tip.getWorldPosition(wp); root.worldToLocal(wp);
      K.nozzles.push({ k, x: mach.x + x, z: mach.z + 0.34, tipY: BT + 0.06 + 0.47 });
      const hit = new T3.Mesh(new T3.BoxGeometry(0.34, 0.5, 0.3), new T3.MeshBasicMaterial({ visible: false })); hit.position.set(x, 0.65, 0.36); g.add(hit); hit.userData.pick = 'flavour:' + k; K.picks.push(hit); });
    { const strip = new T3.Mesh(new T3.BoxGeometry(1.2, 0.02, 0.05), new T3.MeshBasicMaterial({ color: 0xfff6e0 })); strip.position.set(0, 0.64, 0.3); g.add(strip); const bay = new T3.PointLight(0xfff2e0, 1.4, 1.6, 1.5); bay.position.set(0, 0.55, 0.45); g.add(bay); }
    g.traverse(m => m.castShadow = false); K.machG = g; }
  // cone tower + cup stack (left of the machine)
  K.coneStand = { x: -3.15, z: -4.35 }; K.cupStack = { x: -2.45, z: -4.35 };
  { M(new T3.CylinderGeometry(0.14, 0.16, 0.05, 16), brass, K.coneStand.x, BT + 0.085, K.coneStand.z, root, 0.008); for (let i = 0; i < 5; i++) { const v = vesselMesh(T3, toon, addOutline, CTX, grad, 'cone'); v.position.set(K.coneStand.x, BT + 0.29 + i * 0.03, K.coneStand.z); root.add(v); }
    for (let i = 0; i < 6; i++) { const v = vesselMesh(T3, toon, addOutline, CTX, grad, 'cup'); v.position.set(K.cupStack.x, BT + 0.15 + i * 0.022, K.cupStack.z); root.add(v); }
    for (const [k, p] of [['cone', K.coneStand], ['cup', K.cupStack]]) { const hit = new T3.Mesh(new T3.BoxGeometry(0.5, 0.6, 0.5), new T3.MeshBasicMaterial({ visible: false })); hit.position.set(p.x, BT + 0.3, p.z); root.add(hit); hit.userData.pick = 'vessel:' + k; K.picks.push(hit); } }
  // water jars + the first bucket (Jamil's father hauled water for forty years)
  for (let i = 0; i < 4; i++) { const x = 0.35 + i * 0.32; M(new T3.CylinderGeometry(0.11, 0.13, 0.32, 14), toon(i % 2 ? '#c9862f' : '#b8733a'), x, BT + 0.22, -4.6, root, 0.01, 0.13); M(new T3.CylinderGeometry(0.07, 0.09, 0.08, 12), toon('#d9a95e'), x, BT + 0.42, -4.6, root, 0); }
  K.cut.push(M(new T3.CylinderGeometry(0.2, 0.15, 0.3, 16, 1, true), toon('#8a8f96', { side: T3.DoubleSide }), 4.1, 2.25, -D / 2 + 0.24, root, 0.01, 0.2)); { const h = M(new T3.TorusGeometry(0.2, 0.012, 6, 16, Math.PI), ink, 4.1, 2.4, -D / 2 + 0.24, root, 0); K.cut.push(h); }
  // signs: NOW HIRING (letters a foot high), menu board, K crest
  const hireT = CTX(512, 192, c => { c.fillStyle = '#fbf3e2'; c.fillRect(0, 0, 512, 192); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 512, 20); c.fillRect(0, 172, 512, 20); c.fillStyle = '#201e1d'; c.font = '900 78px Archivo, Arial'; c.textAlign = 'center'; c.fillText('NOW HIRING', 256, 110); c.font = '800 28px Archivo, Arial'; c.fillStyle = '#3fa889'; c.fillText('ASK JAMIL AT THE COUNTER', 256, 152); });
  { const h = new T3.Mesh(new T3.PlaneGeometry(2.2, 0.82), new T3.MeshBasicMaterial({ map: hireT })); h.position.set(-3.5, 3.15, -D / 2 + 0.03); root.add(h); K.cut.push(h); K.hiring = h; }
  const menuT = CTX(1024, 512, c => { c.fillStyle = '#2f4a44'; c.fillRect(0, 0, 1024, 512); c.fillStyle = '#f2b7c6'; c.font = '900 70px Archivo, Arial'; c.fillText('THE CREAMERY', 40, 90); c.fillStyle = '#9fdcc8'; c.font = '800 30px Archivo, Arial'; c.fillText('THE ONLY COLD ROOM ON KUFA', 44, 132);
    c.fillStyle = '#f7f6f2'; c.font = '800 40px Archivo, Arial'; [['SMALL · two turns', '2g'], ['MEDIUM · three turns', '3g'], ['LARGE · four and a half', '4g']].forEach(([a, b], i) => { c.fillText(a, 44, 210 + i * 62); c.fillText(b, 860, 210 + i * 62); });
    c.fillStyle = '#ffd23a'; c.font = '700 30px Archivo, Arial'; c.fillText('CHOCOLATE · SWIRL · VANILLA    CUP OR CONE', 44, 420); c.fillText('SAUCE + TOPPING ON EVERY ONE', 44, 466); });
  { const mb = new T3.Mesh(new T3.PlaneGeometry(3.4, 1.7), new T3.MeshBasicMaterial({ map: menuT })); mb.position.set(2.4, 3.0, -D / 2 + 0.07); root.add(mb); K.cut.push(mb, M(new T3.BoxGeometry(3.6, 1.9, 0.06), brass, 2.4, 3.0, -D / 2 + 0.01, root, 0.01)); }
  const crestT = CTX(256, 256, c => { c.fillStyle = '#c2963f'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.fillStyle = '#5a3a1a'; c.beginPath(); c.arc(128, 128, 104, 0, 7); c.fill(); c.fillStyle = '#ffe6a8'; c.font = '900 150px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('K', 128, 138); });
  { const cr = new T3.Mesh(new T3.CircleGeometry(0.45, 32), new T3.MeshBasicMaterial({ map: crestT, transparent: true })); cr.position.set(5.05, 3.25, -D / 2 + 0.03); root.add(cr); K.cut.push(cr); }

  // ---- FRONT COUNTER: turntable (dress), sauces, topping bins, register ----
  const FT = 1.0, FZ = -1.9; K.top = FT; K.fz = FZ;
  M(new T3.BoxGeometry(8.4, FT, 0.95), pink, -1.8, FT / 2, FZ, root, 0.03); M(new T3.BoxGeometry(8.5, 0.06, 1.05), cream, -1.8, FT + 0.03, FZ, root, 0.015); M(new T3.BoxGeometry(8.5, 0.06, 0.04), brass, -1.8, FT - 0.08, FZ + 0.5, root, 0);
  for (let i = 0; i < 14; i++) M(new T3.BoxGeometry(0.03, 0.8, 0.02), toon('#e8a3b5'), -5.8 + i * 0.6, 0.44, FZ + 0.48, root, 0);
  K.solids.push([-6, FZ - 0.48, 2.4, FZ + 0.48]);
  // freezer display case on the right of the worker gap (2.4..3.6 is open)
  { M(new T3.BoxGeometry(2.4, 0.9, 0.95), mintD, 4.8, 0.45, FZ, root, 0.03); const gl = new T3.Mesh(new T3.BoxGeometry(2.3, 0.36, 0.85), new T3.MeshToonMaterial({ color: '#dff4fb', gradientMap: grad, transparent: true, opacity: 0.35, depthWrite: false })); gl.position.set(4.8, 1.08, FZ); root.add(gl); M(new T3.BoxGeometry(2.4, 0.04, 0.95), chrome, 4.8, 1.27, FZ, root, 0.006);
    ['#9fdcc8', '#f2b7c6', '#6b4423', '#f7f0dc', '#f0a03a', '#b5d77a'].forEach((cc, i) => { const x = 3.95 + (i % 3) * 0.55, z = FZ - 0.18 + Math.floor(i / 3) * 0.36; M(new T3.BoxGeometry(0.46, 0.08, 0.3), chrome, x, 0.94, z, root, 0.004); const s = M(new T3.SphereGeometry(0.17, 12, 8), toon(cc), x, 0.98, z, root, 0.006); s.scale.set(1.2, 0.35, 0.8); });
    K.solids.push([3.6, FZ - 0.48, 6, FZ + 0.48]); }
  K.dress = { x: -0.45, z: FZ - 0.08 };
  { M(new T3.CylinderGeometry(0.2, 0.22, 0.05, 24), chrome, K.dress.x, FT + 0.025, K.dress.z, root, 0.008, 0.22); const tt = new T3.Group(); tt.position.set(K.dress.x, FT + 0.06, K.dress.z); root.add(tt); M(new T3.CylinderGeometry(0.18, 0.18, 0.02, 24), toon('#e8f4ef'), 0, 0, 0, tt, 0.006, 0.18);
    for (let i = 0; i < 6; i++) M(new T3.BoxGeometry(0.16, 0.004, 0.012), toon('#9aa4ad'), Math.cos(i) * 0.09, 0.012, Math.sin(i) * 0.09, tt, 0).rotation.y = -i; K.turntable = tt;
    const frost = M(new T3.CylinderGeometry(0.18, 0.18, 0.006, 24), toon('#dff4fb'), 0, 0.014, 0, tt, 0); frost.visible = false; K.coldPlate = frost; }
  K.sauces = {}; Object.keys(SAUCES).forEach((k, i) => { const x = -1.75 + i * 0.3, z = FZ - 0.26, S0 = SAUCES[k], g = new T3.Group(); g.position.set(x, FT + 0.06, z); root.add(g);
    M(new T3.CylinderGeometry(0.055, 0.06, 0.2, 14), toon(S0.bottle), 0, 0.1, 0, g, 0.006, 0.06); M(new T3.ConeGeometry(0.05, 0.08, 14), toon('#fbf3e2'), 0, 0.24, 0, g, 0.005); M(new T3.CylinderGeometry(0.008, 0.012, 0.04, 6), toon('#fbf3e2'), 0, 0.3, 0, g, 0);
    const lab = M(new T3.BoxGeometry(0.1, 0.06, 0.004), cream, 0, 0.1, 0.058, g, 0); lab.rotation.y = 0;
    const hit = new T3.Mesh(new T3.BoxGeometry(0.28, 0.44, 0.3), new T3.MeshBasicMaterial({ visible: false })); hit.position.y = 0.16; g.add(hit); hit.userData.pick = 'sauce:' + k; K.picks.push(hit); K.sauces[k] = { x, z, g }; });
  K.bins = {}; Object.keys(TOPPINGS).forEach((k, i) => { const x = 0.25 + i * 0.3, z = FZ - 0.22, TP = TOPPINGS[k];
    M(new T3.BoxGeometry(0.26, 0.1, 0.3), chrome, x, FT + 0.05, z, root, 0.006); const fill = M(new T3.BoxGeometry(0.22, 0.02, 0.26), toon(TP.cols[0]), x, FT + 0.095, z, root, 0);
    for (let j = 0; j < 7; j++) M(new T3.BoxGeometry(0.024, 0.012, 0.012), toon(TP.cols[j % TP.cols.length]), x + rr(-0.09, 0.09), FT + 0.108, z + rr(-0.1, 0.1), root, 0).rotation.y = j;
    const hit = new T3.Mesh(new T3.BoxGeometry(0.29, 0.3, 0.34), new T3.MeshBasicMaterial({ visible: false })); hit.position.set(x, FT + 0.12, z); root.add(hit); hit.userData.pick = 'topping:' + k; K.picks.push(hit); K.bins[k] = { x, z, fill }; });
  K.register = { x: 1.85, z: FZ + 0.62 };
  M(new T3.BoxGeometry(0.42, 0.3, 0.34), ink, K.register.x, FT + 0.15, K.register.z - 0.62, root, 0.01); M(new T3.BoxGeometry(0.36, 0.12, 0.04), mintD, K.register.x, FT + 0.34, K.register.z - 0.79, root, 0);
  K.pass = { z: FZ + 0.4, y: FT + 0.06 };
  K.spots = [-2.5, -0.7, 1.1].map(x => ({ x, z: FZ + 1.15 }));
  // shop floor: three round tables with pink chairs, a palm, a ceiling fan
  K.tables = [[-4.5, 1.4], [-4.5, 3.6], [-2.0, 3.4]];
  for (const [x, z] of K.tables) { M(new T3.CylinderGeometry(0.46, 0.46, 0.05, 20), cream, x, 0.76, z, root, 0.01, 0.46); M(new T3.CylinderGeometry(0.05, 0.05, 0.74, 8), brass, x, 0.38, z, root, 0); M(new T3.CylinderGeometry(0.22, 0.25, 0.03, 12), brass, x, 0.015, z, root, 0);
    for (const a of [0.4, Math.PI + 0.4]) { const cx = x + Math.cos(a) * 0.72, cz = z + Math.sin(a) * 0.72; M(new T3.CylinderGeometry(0.2, 0.2, 0.06, 14), pink, cx, 0.46, cz, root, 0.008, 0.2); M(new T3.CylinderGeometry(0.025, 0.025, 0.44, 6), brass, cx, 0.22, cz, root, 0); const bk = M(new T3.BoxGeometry(0.36, 0.34, 0.04), pinkD, cx + Math.cos(a) * 0.18, 0.66, cz + Math.sin(a) * 0.18, root, 0.008); bk.rotation.y = -a + Math.PI / 2; }
    K.solids.push([x - 0.95, z - 0.95, x + 0.95, z + 0.95]); }
  { const p = new T3.Group(); p.position.set(5.3, 0, 4.2); root.add(p); M(new T3.CylinderGeometry(0.3, 0.24, 0.5, 14), toon('#c9862f'), 0, 0.25, 0, p, 0.01); M(new T3.CylinderGeometry(0.05, 0.07, 1.4, 8), woodD, 0, 1.1, 0, p, 0.006); for (let i = 0; i < 6; i++) { const lf = M(new T3.ConeGeometry(0.12, 0.9, 4), toon('#4f9a4a'), Math.cos(i) * 0.32, 1.85, Math.sin(i) * 0.32, p, 0.006); lf.rotation.set(Math.sin(i) * 1.1, 0, -Math.cos(i) * 1.1); } K.solids.push([4.8, 3.7, 6, 5]); }
  { const fan = new T3.Group(); fan.position.set(-1.8, H - 0.45, 2.6); root.add(fan); M(new T3.CylinderGeometry(0.02, 0.02, 0.45, 6), brass, 0, 0.22, 0, fan, 0); M(new T3.CylinderGeometry(0.12, 0.12, 0.1, 12), brass, 0, 0, 0, fan, 0.006); const bl = new T3.Group(); fan.add(bl); for (let i = 0; i < 4; i++) { const b = M(new T3.BoxGeometry(0.9, 0.012, 0.16), toon('#e8d4b4'), 0, 0, 0, bl, 0.006); b.position.set(Math.cos(i * Math.PI / 2) * 0.5, -0.04, Math.sin(i * Math.PI / 2) * 0.5); b.rotation.y = -i * Math.PI / 2; } K.fan = bl; K.cut.push(fan); }
  // pendant lamps over the front counter
  for (const x of [-3.2, -1.2, 0.8]) { K.cut.push(M(new T3.CylinderGeometry(0.01, 0.01, 1.1, 4), ink, x, H - 0.55, FZ, root, 0)); const sh = M(new T3.ConeGeometry(0.3, 0.3, 14, 1, true), toon('#f2b7c6', { side: T3.DoubleSide }), x, H - 1.2, FZ, root, 0.01); K.lamps.push(sh); K.cut.push(sh); }
  // ---- polish: the big cone on the machine, neon, bunting, cacti, cornice, window light ----
  { const g = new T3.Group(); g.position.set(mach.x, BT + 2.0, mach.z - 0.02); root.add(g);
    const coneT = CTX(128, 128, c => { c.fillStyle = '#d9a95e'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#a8772e'; c.lineWidth = 7; for (let i = -128; i < 256; i += 24) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 128, 128); c.stroke(); c.beginPath(); c.moveTo(i + 128, 0); c.lineTo(i, 128); c.stroke(); } }); coneT.wrapS = coneT.wrapT = T3.RepeatWrapping; coneT.repeat.set(4, 2);
    const cone = new T3.Mesh(new T3.ConeGeometry(0.2, 0.55, 22, 1, true), new T3.MeshToonMaterial({ map: coneT, gradientMap: grad, side: T3.DoubleSide })); cone.rotation.x = Math.PI; cone.position.y = 0.0; addOutline(cone, 0.012); g.add(cone);
    const R = makeRope(T3, { maxPts: 160, grad }), pts = []; for (let a = 0; a <= 3.2 * Math.PI * 2; a += 0.16) { const c = a / (Math.PI * 2), r = 0.15 * Math.pow(Math.max(0.06, 1 - c / 3.6), 0.85); pts.push({ x: Math.cos(a) * r, y: 0.3 + c * 0.1, z: Math.sin(a) * r, r: Math.min(1, 0.6 + a) }); }
    { const Lp = pts[pts.length - 1], a0 = Math.atan2(Lp.z, Lp.x), r0 = Math.hypot(Lp.x, Lp.z); for (let i = 1; i <= 10; i++) { const k = i / 10, a = a0 + k * 2.2; pts.push({ x: Math.cos(a) * r0 * (1 - k), y: Lp.y + k * 0.12, z: Math.sin(a) * r0 * (1 - k), r: Math.max(0.15, 1 - k * 0.9) }); } }
    R.update(pts, { rad: 0.075, colA: '#f7f0dc', colB: '#f2b7c6' }); R.mesh.position.y = -0.03; g.add(R.mesh); K.bigCone = g; K.cut.push(g); }
  { const pole = M(new T3.CylinderGeometry(0.03, 0.05, 0.42, 10), brass, mach.x, BT + 1.55, mach.z - 0.02, root, 0.006); K.cut.push(pole); M(new T3.CylinderGeometry(0.12, 0.14, 0.04, 16), brass, mach.x, BT + 1.39, mach.z - 0.02, root, 0.006); }
  const neonT = CTX(512, 160, c => { c.clearRect(0, 0, 512, 160); c.font = '900 76px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff7aa8'; c.shadowBlur = 26; c.strokeStyle = '#ff9ec0'; c.lineWidth = 9; c.strokeText('SOFT SERVE', 256, 84); c.fillStyle = '#fff'; c.fillText('SOFT SERVE', 256, 84); c.shadowColor = '#7ff0d0'; c.strokeStyle = '#9ff5dd'; c.lineWidth = 5; c.beginPath(); c.moveTo(14, 20); c.lineTo(498, 20); c.moveTo(14, 146); c.lineTo(498, 146); c.stroke(); });
  { const n = new T3.Mesh(new T3.PlaneGeometry(3.0, 0.94), new T3.MeshBasicMaterial({ map: neonT, transparent: true, depthWrite: false })); n.position.set(-W / 2 + 0.04, 3.2, 1.6); n.rotation.y = Math.PI / 2; root.add(n); K.front.push(n); K.neon = n; }
  { const flagCols = ['#9fdcc8', '#f2b7c6', '#fbf3e2', '#ffd23a', '#3fa889']; for (const [z, sag] of [[0.6, 0.35], [3.0, 0.45]]) { const g = new T3.Group(); root.add(g); K.cut.push(g); const n = 22; for (let i = 0; i < n; i++) { const t = i / (n - 1), x = -W / 2 + 0.3 + t * (W - 0.6), y = H - 0.35 - Math.sin(t * Math.PI) * sag; const f = new T3.Mesh(new T3.ConeGeometry(0.13, 0.26, 3), toon(flagCols[i % flagCols.length])); f.rotation.set(Math.PI, 0, 0); f.position.set(x, y - 0.13, z); f.scale.z = 0.12; g.add(f); } const ln = new T3.Mesh(new T3.CylinderGeometry(0.006, 0.006, W - 0.6, 4), ink); ln.rotation.z = Math.PI / 2; ln.position.set(0, H - 0.35 - sag * 0.62, z); g.add(ln); } }
  for (const [x, y, z, s] of [[-5.6, FT + 0.06, FZ - 0.1, 1], [2.25, FT + 0.06, FZ + 0.25, 0.8], [5.6, 1.33, FZ, 0.9]]) { const p = new T3.Group(); p.position.set(x, y, z); p.scale.setScalar(s); root.add(p); M(new T3.CylinderGeometry(0.1, 0.08, 0.14, 12), toon('#c9862f'), 0, 0.07, 0, p, 0.008); const c = M(new T3.CapsuleGeometry(0.05, 0.16, 4, 8), toon('#4f9a4a'), 0, 0.25, 0, p, 0.008); for (const sx of [-1, 1]) { const arm = M(new T3.CapsuleGeometry(0.028, 0.07, 3, 6), toon('#4f9a4a'), sx * 0.075, 0.27, 0, p, 0.006); arm.rotation.z = sx * -0.4; } M(new T3.SphereGeometry(0.025, 8, 6), toon('#f2b7c6'), 0, 0.36, 0, p, 0); }
  for (const [w, x, z, ry] of [[W, 0, -D / 2 + 0.03, 0], [D, -W / 2 + 0.03, 0, Math.PI / 2], [D, W / 2 - 0.03, 0, -Math.PI / 2]]) { const c = M(new T3.BoxGeometry(w, 0.1, 0.06), brass, x, H - 0.05, z, root, 0); c.rotation.y = ry; (ry ? K.front : K.cut).push(c); }
  { const shaft = CTX(64, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,236,190,0.55)'); g.addColorStop(1, 'rgba(255,236,190,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); });
    for (let i = 0; i < 3; i++) { const m = new T3.Mesh(new T3.PlaneGeometry(1.4, 3.4), new T3.MeshBasicMaterial({ map: shaft, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, side: T3.DoubleSide, opacity: 0.55 })); m.position.set(-4.0 + i * 1.6, 1.4, D / 2 - 1.2); m.rotation.set(-0.62, 0.15, 0); root.add(m); K.front.push(m); }
    const patch = CTX(128, 128, c => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,230,170,0.5)'); g.addColorStop(1, 'rgba(255,230,170,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
    const sp = new T3.Mesh(new T3.PlaneGeometry(5.6, 2.6), new T3.MeshBasicMaterial({ map: patch, transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); sp.rotation.x = -Math.PI / 2; sp.position.set(-2.4, 0.015, D / 2 - 2.2); root.add(sp); }
  // soft contact shadows under the tables and the machine (a shared blob texture, also used for people)
  K.blobTex = CTX(64, 64, c => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(40,30,40,0.42)'); g.addColorStop(1, 'rgba(40,30,40,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  K.blob = (x, z, r, parent = root) => { const m = new T3.Mesh(new T3.PlaneGeometry(r * 2, r * 2), new T3.MeshBasicMaterial({ map: K.blobTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.011, z); m.renderOrder = 1; parent.add(m); return m; };
  for (const [x, z] of K.tables) K.blob(x, z, 1.05);
  K.cut.forEach(m => m.traverse(o => o.castShadow = false));
  // where people stand: Jamil behind the counter, the talk spot in front, the welcome spot
  K.keeperAt = { x: -2.2, z: FZ - 0.7 }; K.talkAt = { x: -2.2, z: FZ + 0.95 }; K.welcomeAt = { x: 1.5, z: 0.4 }; K.spawn = { x: K.door.inside.x, z: K.door.inside.z, yaw: Math.PI };
  K.bounds = [-W / 2 + 0.3, -D / 2 + 0.3, W / 2 - 0.3, D / 2 - 0.3];
  // walkable test for a world's walker (local metres, body radius r)
  K.walkable = (x, z, r = 0.3) => { if (x < -W / 2 + r || x > W / 2 - r || z < -D / 2 + r) return false; if (z > D / 2 - r && !(x > K.door.x - K.door.w / 2 + r && x < K.door.x + K.door.w / 2 - r)) return false; for (const [x0, z0, x1, z1] of K.solids) if (x > x0 - r && x < x1 + r && z > z0 - r && z < z1 + r) return false; return true; };
  K.toWorld = (x, z) => { const v = new T3.Vector3(x, 0, z); root.localToWorld(v); return v; };
  // the same tests in WORLD metres (for a world that placed the room with origin + rotY)
  K.toLocal = (x, z) => { root.updateMatrixWorld(); const v = new T3.Vector3(x, 0, z); root.worldToLocal(v); return v; };
  K.inside = (x, z, m = 0) => { const v = K.toLocal(x, z); return Math.abs(v.x) < W / 2 + m && Math.abs(v.z) < D / 2 + m; };
  K.walkableWorld = (x, z, r = 0.3) => { const v = K.toLocal(x, z); return K.walkable(v.x, v.z, r); };
  K.faceWorld = f => f + rotY;   // a local facing (0 = looking at the door, +z) turned into world facing
  K.doorWorld = () => { const o = K.toWorld(K.door.x, D / 2 + 1.4); return { x: o.x, z: o.z, face: rotY + Math.PI }; };   // stand here (outside), looking in
  return K;
}

// ---------------- the stand-alone game ----------------
export async function createCreameryShift({ container, onState = () => {} }) {
  const ST = createStage(container, { bg: '#eef8f3' }), { touch, CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  const K = buildCreamery({ THREE, M, toon, canvasTex, scene, grad, addOutline }), T = K.top, clock = new THREE.Clock(), SND = creamerySound(audio);
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  let raf = 0, PAUSE = false, hudT = 0;
  const lampGl = K.lamps.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff0e0, transparent: true, depthWrite: false, opacity: 0.3, blending: THREE.AdditiveBlending })); s.position.copy(l.position).add(V3(0, -0.2, 0)); s.scale.setScalar(0.7); scene.add(s); return s; });
  let rigs = {}; try { rigs = await loadCastRigs(); } catch (e) {}
  const CK = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs);
  const noGear = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };

  // ---------- cast ----------
  const jamil = noGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, ...JAMIL.look }, torso: JAMIL.torso, eyes: JAMIL.eyes, outfit: 'vest', crest: '', gear: 'none', mood: 'happy' })); jamil.position.set(K.keeperAt.x, 0, K.keeperAt.z); scene.add(jamil);
  const ben = noGear(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#3fa889'], crest: '', gear: 'none', mood: 'happy' })); ben.position.set(K.welcomeAt.x, 0, K.welcomeAt.z); ben.rotation.y = 0.3; scene.add(ben); const BP = ben.userData.P;
  const drawCone = (g, s) => { g.save(); g.scale(s, s); g.lineJoin = 'round'; const st = () => { g.strokeStyle = '#201e1d'; g.lineWidth = 7; g.stroke(); };
    g.fillStyle = '#d9a95e'; g.beginPath(); g.moveTo(-46, -6); g.lineTo(46, -6); g.lineTo(0, 96); g.closePath(); g.fill(); st(); g.strokeStyle = '#a8772e'; g.lineWidth = 4; for (const k of [-20, 8, 36]) { g.beginPath(); g.moveTo(-40 + k * 0.4, k + 8); g.lineTo(40 - k * 0.4, k + 8); g.stroke(); }
    const blob = (y, w, c) => { g.fillStyle = c; g.beginPath(); g.ellipse(0, y, w, 18, 0, 0, 7); g.fill(); st(); };
    blob(-14, 54, '#f7f0dc'); blob(-40, 44, '#f2b7c6'); blob(-62, 32, '#f7f0dc'); g.fillStyle = '#f2b7c6'; g.beginPath(); g.moveTo(-18, -70); g.quadraticCurveTo(0, -112, 14, -76); g.closePath(); g.fill(); st(); g.restore(); };
  const uniform = new THREE.Group(); {
    const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 104); drawCone(g, 0.78); g.restore();
      g.save(); g.translate(128, 200); g.rotate(-0.06); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(-122, -24); g.lineTo(126, -30); g.lineTo(116, 34); g.lineTo(-130, 30); g.closePath(); g.fill(); g.fillStyle = '#3fa889'; g.beginPath(); g.moveTo(-114, -18); g.lineTo(118, -24); g.lineTo(110, 26); g.lineTo(-121, 23); g.closePath(); g.fill();
        g.font = 'italic 900 40px Archivo, "Arial Black", Arial, sans-serif'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.strokeText('CREAMERY', 0, 2); g.fillStyle = '#f2b7c6'; g.fillText('CREAMERY', 0, 2); g.restore(); });
    uniform.userData.parts = dinerUniform(ST, ben, { print, printY: 1.17, stripe: '#3fa889', towelCol: '#f2b7c6' }).parts; }
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push({ m }); });
  const setUniform = on => { uniform.userData.parts.forEach(p => p.visible = on); crestSlots.forEach(s => { s.m.visible = !on; }); };
  setUniform(true);
  const custFox = CUSTOMERS.map(cu => { const f = noGear(kit.makeFox({ ...CAST.player, look: cu.fur ? { ...CAST.player.look, fur: cu.fur, furDark: cu.furDark } : CAST.player.look, torso: cu.torso, outfit: cu.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; scene.add(f); return f; });
  // two regulars enjoying a cone (they stay put; the room never looks empty)
  const regulars = [{ name: 'BASHIR', torso: ['#5a7a9a', '#e6ecf4', '#2a3a4a'], at: [-3.3, 2.5, 2.2], fl: 'swirl' }, { name: 'DAHAB', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#e2453f', '#f2c53d', '#7a1420'], at: [-3.4, 4.5, 2.6], fl: 'chocolate' }].map(r => {
    const f = noGear(kit.makeFox({ ...CAST.player, look: r.fur ? { ...CAST.player.look, fur: r.fur, furDark: r.furDark } : CAST.player.look, torso: r.torso, outfit: 'vest', crest: '', gear: 'none', mood: 'happy' })); f.position.set(r.at[0], 0, r.at[1]); f.rotation.y = r.at[2]; scene.add(f);
    const c = treat(r.fl, 'cone', 3); c.position.set(0.3, 1.0, 0.26); f.add(c); f.userData.hold = { right: true }; return f; });
  // ---- polish: a warm front fill, soft shadows under everyone, cold mist off the freezer, confetti for THRILLED ----
  { const fill = new THREE.DirectionalLight(0xffe4ec, 0.45); fill.position.set(-4, 5, 8); scene.add(fill); const rim = new THREE.DirectionalLight(0xbff5e6, 0.35); rim.position.set(5, 4, -6); scene.add(rim); }
  const blobs = []; const blobFor = (f, r = 0.42) => { const b = K.blob(0, 0, r, scene); blobs.push({ f, b }); };
  [jamil, ben, ...custFox, ...regulars].forEach(f => blobFor(f));
  const mist = []; for (let i = 0; i < 9; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xe8fbff, transparent: true, depthWrite: false, opacity: 0 })); sp.userData = { t: Math.random(), x: 3.9 + Math.random() * 1.8 }; scene.add(sp); mist.push(sp); }
  const confM = []; { const geo = new THREE.PlaneGeometry(0.05, 0.03), cols = ['#ec3013', '#ffd23a', '#9fdcc8', '#f2b7c6', '#4e9ad6', '#ffffff']; for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: cols[i % cols.length], side: THREE.DoubleSide })); m.visible = false; m.userData = { v: V3(), life: 0, spin: V3() }; scene.add(m); confM.push(m); } }
  let confI = 0; function confetti(x, y, z, n = 40) { for (let i = 0; i < n; i++) { const m = confM[confI = (confI + 1) % confM.length]; m.visible = true; m.position.set(x + rr(-0.2, 0.2), y + rr(0, 0.3), z + rr(-0.2, 0.2)); m.userData.v.set(rr(-1.4, 1.4), rr(1.6, 3.4), rr(-1.4, 1.4)); m.userData.spin.set(rr(-9, 9), rr(-9, 9), rr(-9, 9)); m.userData.life = rr(1.4, 2.2); } }
  function stepPolish(dt) { for (const { f, b } of blobs) { b.visible = f.visible && !!f.parent; if (b.visible) { b.position.x = f.position.x; b.position.z = f.position.z; } }
    for (const sp of mist) { const u = sp.userData; u.t += dt * 0.18; if (u.t > 1) { u.t = 0; u.x = 3.9 + Math.random() * 1.8; } sp.position.set(u.x + Math.sin(u.t * 6) * 0.08, 1.3 + u.t * 0.7, K.fz + Math.cos(u.t * 5) * 0.2); sp.scale.setScalar(0.35 + u.t * 0.6); sp.material.opacity = Math.sin(u.t * Math.PI) * 0.22; }
    for (const m of confM) { const u = m.userData; if (u.life <= 0) { m.visible = false; continue; } u.life -= dt; u.v.y -= 6 * dt; u.v.multiplyScalar(1 - dt * 1.2); m.position.addScaledVector(u.v, dt); m.rotation.x += u.spin.x * dt; m.rotation.y += u.spin.y * dt; if (m.position.y < 0.02) { m.position.y = 0.02; u.v.set(0, 0, 0); u.spin.set(0, 0, 0); } }
    if (K.bigCone) K.bigCone.rotation.y += dt * 0.35; if (K.neon) K.neon.material.opacity = 0.88 + Math.sin(clock.elapsedTime * 3.1) * 0.06 + (Math.random() < 0.004 ? -0.5 : 0); }
  let walker = null, heroKey = null;
  function makeWalker(key) { const old = walker; heroKey = key; walker = CK.make(key === 'hope' || key === 'noble' ? key : 'player'); walker.userData.mood = 'happy'; scene.add(walker); if (old) { const bi = blobs.findIndex(q => q.f === old); if (bi >= 0) blobs[bi].f = walker; } else if (typeof blobFor === 'function') blobFor(walker); if (old) { walker.position.copy(old.position); walker.rotation.y = old.rotation.y; walker.visible = old.visible; scene.remove(old); } else walker.visible = false; }
  const heroLS = () => { try { const v = localStorage.getItem('meru.combatHero.v1'); return v === 'hope' || v === 'noble' ? v : 'player'; } catch (e) { return 'player'; } };
  makeWalker(heroLS());

  // a finished treat (for the regulars + the 'look' in the intro)
  function treat(fl, kind, coils) { const g = new THREE.Group(), v = vesselMesh(THREE, toon, addOutline, canvasTex, grad, kind); g.add(v); const R = makeRope(THREE, { maxPts: 220, grad }), pts = []; const R0 = v.userData.rimR * 0.8;
    for (let a = 0; a <= coils * Math.PI * 2; a += 0.2) { const c = a / (Math.PI * 2); pts.push({ ...ropeAt(c, a, 1, R0), r: Math.min(1, 0.6 + a) }); } tipCurl(pts, 1);
    R.update(pts, { rad: 0.022, colA: FLAVOURS[fl].col, colB: fl === 'swirl' ? FLAVOURS.swirl.col2 : null }); g.add(R.mesh); return g; }
  function ropeAt(c, phi, rf, R0) { const r = R0 * Math.pow(Math.max(0.06, 1 - c / 7), 0.85) * rf; return { x: Math.cos(phi) * r, y: 0.012 + c * 0.03 * (1 - c * 0.018), z: Math.sin(phi) * r }; }
  function tipCurl(pts, dir) { const L = pts[pts.length - 1]; if (!L) return; const a0 = Math.atan2(L.z, L.x), r0 = Math.hypot(L.x, L.z); for (let i = 1; i <= 10; i++) { const k = i / 10, a = a0 + dir * k * 2.2, r = r0 * (1 - k); pts.push({ x: Math.cos(a) * r, y: L.y + k * 0.05 + Math.sin(k * Math.PI) * 0.008, z: Math.sin(a) * r, r: Math.max(0.12, 1 - k * 0.9) }); } }

  // ---------- cameras ----------
  const CAM = { look: V3(), from: null, to: null, t: 1, dur: 1 };
  const { SAFE, shotFor } = cameraFit(ST);
  const wideShot = () => { const port = CW() < CHh(), w = K.welcomeAt, box = [V3(w.x - 0.5, 0.05, w.z), V3(w.x + 0.5, 0.05, w.z), V3(w.x - 0.5, 2.25, w.z), V3(w.x + 0.5, 2.25, w.z), V3(w.x, 2.5, w.z)];
    return port ? shotFor('wideP', () => box, 0.1, Math.PI - 0.25, 0.1) : shotFor('wideL', () => box, 0.12, Math.PI - 0.3, 0.05); };
  const P3 = (x, z, y = T) => V3(x, y, z);
  function stepShot(key) { const port = CW() < CHh(), BT = K.backTop, n = B.noz || K.nozzles[1];
    if (key === 'machine') return shotFor('m', () => [P3(K.coneStand.x - 0.2, K.coneStand.z, BT), P3(K.coneStand.x, K.coneStand.z, BT + 0.5), P3(K.cupStack.x, K.cupStack.z, BT + 0.3), ...K.nozzles.flatMap(q => [P3(q.x, q.z, q.tipY + 0.4), P3(q.x, q.z + 0.1, K.trayY - 0.05)]), P3(K.nozzles[2].x + 0.2, K.nozzles[2].z, K.trayY)], port ? 0.5 : 0.4, Math.PI, 0.05);
    if (key === 'swirl') return shotFor('s' + n.k, () => [P3(n.x - 0.2, n.z + 0.05, K.trayY), P3(n.x + 0.2, n.z + 0.05, K.trayY), P3(n.x, n.z, n.tipY + 0.22), P3(n.x - 0.2, n.z, K.trayY + 0.45), P3(n.x + 0.2, n.z, K.trayY + 0.45)], port ? 0.5 : 0.4, Math.PI, 0.12);
    if (key === 'dress') { const h = B && B.vessel ? rimY(B.vessel, T + 0.07) : T + 0.25, top = h + (B && B.topY || 0.12); return shotFor('d' + Math.round(top * 50), () => [P3(K.dress.x - 0.2, K.dress.z, T + 0.06), P3(K.dress.x + 0.2, K.dress.z, T + 0.06), P3(K.dress.x - 0.16, K.dress.z, top + 0.2), P3(K.dress.x + 0.16, K.dress.z, top + 0.2)], port ? 0.5 : 0.4, 0, 0.1); }
    if (key === 'serve') return shotFor('v', () => [P3(K.dress.x - 0.2, K.dress.z, T), P3(K.dress.x + 0.2, K.dress.z, T + 0.6), ...K.spots.flatMap(s => [P3(s.x - 0.45, s.z, 2.25), P3(s.x + 0.45, s.z, 2.25), P3(s.x, s.z, 1.1)])], port ? 0.7 : 0.45, 0, 0.07);
    return wideShot(); }
  function glideTo(shot, dur = 1.2, arc = 0) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; CAM.arc = arc; }
  { const w = wideShot(); camera.position.copy(w.pos); CAM.look.copy(w.look); camera.lookAt(CAM.look); }
  const WCAM = { yaw: 0, pitch: 0.42, dist: 4.2, userT: 0 };

  // ---------- state ----------
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], flash: null, flashT: 0, say: '', sayT: 0, pay: null, payOut: null, next: 2.5, done: null, react: null, active: null, demo: false, musicOff: false, shakeOn: false, toast: null, toastT: 0, dialog: null, stick: { x: 0, y: 0 } };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  const availSizes = () => Object.keys(SIZES).filter(k => SIZES[k].day <= S.day), availSauces = () => Object.keys(SAUCES).filter(k => SAUCES[k].day <= S.day), availTops = () => Object.keys(TOPPINGS).filter(k => TOPPINGS[k].day <= S.day);
  const orders = [], flying = []; let idSeq = 1;
  const STEPS = ['vessel', 'flavour', 'swirl', 'sauce', 'topping', 'serve'];
  let B = null;                      // the serve being built
  const holder = new THREE.Group(); scene.add(holder); holder.visible = false;        // vessel + serve, moves machine → turntable → customer
  const serveG = new THREE.Group(); holder.add(serveG);
  const rope = makeRope(THREE, { maxPts: 260, grad }), rope2 = null; serveG.add(rope.mesh);
  const coneWire = new THREE.Group(); { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.006, 5, 18), toon('#9aa4ad')); ring.rotation.x = Math.PI / 2; ring.position.y = -0.1; coneWire.add(ring); for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.1, 4), toon('#9aa4ad')); const a = i * 2.1; l.position.set(Math.cos(a) * 0.045, -0.15, Math.sin(a) * 0.045); coneWire.add(l); } holder.add(coneWire); }
  let vesselM = null;
  // sauce blobs + topping pieces live on the serve (they turn with the turntable)
  const sauceIM = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad }), 420); sauceIM.count = 0; sauceIM.frustumCulled = false; serveG.add(sauceIM);
  const TOP_GEO = { sprinkles: new THREE.CapsuleGeometry(0.0035, 0.012, 2, 5), chips: new THREE.ConeGeometry(0.0075, 0.011, 6), berries: new THREE.SphereGeometry(0.0085, 7, 5), nuts: new THREE.DodecahedronGeometry(0.0075) };
  const topIM = {}; for (const k of Object.keys(TOPPINGS)) { const im = new THREE.InstancedMesh(TOP_GEO[k], new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad }), 90); im.count = 0; im.frustumCulled = false; serveG.add(im); topIM[k] = im; }
  const drips = []; for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.008, 7, 5), toon('#ffffff')); d.scale.set(1, 1.8, 1); d.visible = false; holder.add(d); drips.push({ m: d, t: 0, a: 0 }); }
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 18), toon('#f7f0dc')); puddle.rotation.x = -Math.PI / 2; puddle.visible = false; scene.add(puddle);
  // floating sauce bottle + shaker jar + sauce stream
  const floatBottle = new THREE.Group(); { M(new THREE.CylinderGeometry(0.05, 0.055, 0.18, 14), toon('#6b4423'), 0, 0, 0, floatBottle, 0.006, 0.055); M(new THREE.ConeGeometry(0.045, 0.07, 14), toon('#fbf3e2'), 0, -0.125, 0, floatBottle, 0.005).rotation.x = Math.PI; floatBottle.scale.setScalar(0.45); floatBottle.visible = false; scene.add(floatBottle); }
  const jar = new THREE.Group(); { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.15, 14), new THREE.MeshToonMaterial({ color: '#e6f3f1', gradientMap: grad, transparent: true, opacity: 0.55 })); jar.add(b); M(new THREE.CylinderGeometry(0.062, 0.062, 0.035, 14), toon('#d7dde3'), 0, -0.09, 0, jar, 0.005); jar.userData.fill = M(new THREE.CylinderGeometry(0.052, 0.052, 0.09, 12), toon('#ec3013'), 0, 0.02, 0, jar, 0); jar.scale.setScalar(0.6); jar.visible = false; scene.add(jar); }
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0055, 1, 6), toon('#4a2c14')); stream.visible = false; scene.add(stream);
  const nozStream = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.013, 1, 8), toon('#f7f0dc')); nozStream.visible = false; scene.add(nozStream);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = V3(), _v = V3(), UP = V3(0, 1, 0);
  const rimY = (kind, base) => base + (kind === 'cone' ? 0.19 : 0.092);

  function freshBuild() { B = { step: 'vessel', vessel: null, flavour: null, noz: null, coils: 0, pts: [], phi: 0, lastPtPhi: 0, rfS: 1, sw: null, swirl: null, sauce: null, hits: {}, sauceN: 0, cells: new Set(), miss: 0, top: null, tops: 0, mine: 0, wrong: 0, topCells: new Set(), melt: 0, melting: false, env: null, topY: 0.1, carryT: 0, fly: null };
    holder.visible = false; rope.clear(); sauceIM.count = 0; sauceIM.instanceMatrix.needsUpdate = true; for (const k in topIM) { topIM[k].count = 0; topIM[k].instanceMatrix.needsUpdate = true; } drips.forEach(d => { d.m.visible = false; d.t = 0; }); puddle.visible = false; serveG.scale.set(1, 1, 1); serveG.position.set(0, 0, 0); floatBottle.visible = jar.visible = stream.visible = nozStream.visible = false; flying.length = 0;
    if (holder.parent !== scene) { holder.parent && holder.parent.remove(holder); scene.add(holder); } holder.rotation.set(0, 0, 0); holder.scale.setScalar(1); K.levers.forEach(l => l.rotation.x = 0); }
  freshBuild();
  const activeOrder = () => orders.find(o => o.id === S.active && (o.st === 'wait' || o.st === 'walk')) || null;
  function pickActive() { const a = activeOrder(); if (a) return a; const w = orders.filter(o => o.st === 'wait' || o.st === 'walk').sort((x, y) => (x.st === 'wait' ? 0 : 1) - (y.st === 'wait' ? 0 : 1) || x.pat / x.patMax - y.pat / y.patMax)[0]; S.active = w ? w.id : null; return w || null; }

  // ---------- STEP 1 + 2: cup or cone, nozzle ----------
  function pickVessel(k) { if (!B || B.step !== 'vessel' || !work()) return; B.vessel = k; if (vesselM) holder.remove(vesselM); vesselM = vesselMesh(THREE, toon, addOutline, canvasTex, grad, k); holder.add(vesselM); coneWire.visible = k === 'cone';
    const n = K.nozzles[1]; holder.position.set(n.x, rimY(k, K.trayY) + 0.25, n.z); holder.visible = true; B.drop = { t: 0, y: rimY(k, K.trayY) }; B.step = 'flavour'; SND.sfx(k === 'cone' ? 'cone' : 'cup'); puff(n.x, K.trayY + 0.1, n.z, 0xffffff, 2);
    const o = activeOrder(); if (o && o.vessel !== k) flash('THE TICKET SAYS ' + VESSELS[o.vessel].name, '#ff9a8a', 1.2); }
  function pickFlavour(k) { if (!B || B.step !== 'flavour' || !work()) return; B.flavour = k; B.noz = K.nozzles.find(q => q.k === k); B.slide = { t: 0, from: holder.position.x, to: B.noz.x }; B.step = 'swirl'; SND.sfx('tap');
    const o = activeOrder(); if (o && o.flavour !== k) flash('THE TICKET SAYS ' + FLAVOURS[o.flavour].name, '#ff9a8a', 1.2); else flash('PULL IT · ' + (o ? SIZES[o.size].name + ' = ' + SIZES[o.size].coils + ' TURNS' : 'GO ROUND'), '#ffffff', 1.4); }

  // ---------- STEP 3: THE SWIRL ----------
  const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28];       // pentatonic run: every half turn sings the next note
  const midi = m => 440 * Math.pow(2, (m - 69) / 12);
  const wantCoils = () => { const o = activeOrder(); return o ? SIZES[o.size].coils : 3; };
  function swirlBegin(ang, rad) { if (!B || B.step !== 'swirl' || B.slide) return false; B.sw = { lastAng: ang, total: B.coils * Math.PI * 2, n: 0, sum: 0, sq: 0, rev: 0, lastDir: 0, fast: 0, w: 0, lastT: performance.now() }; B.rfS = clamp(rad, 0.6, 1.45); K.levers[FK.indexOf(B.flavour)].rotation.x = 0.7; SND.sfx('lever'); SND.pull(true, 0); return true; }
  function swirlMove(ang, rad, dtS) { const sw = B && B.sw; if (!sw) return; let d = ang - sw.lastAng; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; if (Math.abs(d) < 0.01) return; sw.lastAng = ang;
    const dir = d > 0 ? 1 : -1; if (sw.lastDir && dir !== sw.lastDir && Math.abs(d) > 0.12) { sw.rev++; flash('WOBBLE · KEEP GOING THE SAME WAY', '#e6b45a', 0.9); SND.sfx('wobble'); } sw.lastDir = dir;
    const before = B.coils; sw.total += Math.abs(d); B.coils = Math.min(MAX_COILS, sw.total / (Math.PI * 2)); B.phi += d; B.dir = dir;
    sw.w = sw.w * 0.85 + (Math.abs(d) / Math.max(0.008, dtS)) * 0.15; const fast = sw.w > 17.5; if (fast) sw.fast += dtS;
    SND.pull(true, clamp(sw.w / 14, 0, 1)); const rc = clamp(rad, 0.3, 2); sw.n++; sw.sum += rc; sw.sq += rc * rc; B.rfS = B.rfS * 0.75 + clamp(rad, 0.62, 1.42) * 0.25;
    if (Math.abs(B.phi - B.lastPtPhi) >= 0.17 || !B.pts.length) { B.lastPtPhi = B.phi; const R0 = vesselM.userData.rimR * 0.8; B.pts.push({ ...ropeAt(B.coils, B.phi, B.rfS, R0), r: Math.min(fast ? 0.7 : 1, 0.55 + B.pts.length * 0.12) }); updateRope(); }
    const want = wantCoils(); if (Math.floor(before * 2) < Math.floor(B.coils * 2)) { const i = Math.min(SCALE.length - 1, Math.floor(B.coils * 2)); SND.sfx('coil', { i }); sparkle(3); if (Math.floor(before) < Math.floor(B.coils)) buzz(12); }
    if (before < want - 0.5 && B.coils >= want - 0.5) { flash(SIZES[activeOrder() ? activeOrder().size : 'medium'].name + ' · JUST RIGHT · LET GO NOW', '#22c55e', 1.2); SND.sfx('inBand'); buzz(25); }
    if (before < want + 0.5 && B.coils >= want + 0.5) { flash('OVERFILLED · LET GO!', '#ec3013', 1.0); SND.sfx('over'); buzz([30, 40, 30]); }
    if (fast && Math.random() < 0.08) flash('TOO FAST · IT IS BREAKING UP', '#ff9a8a', 0.8);
    if (B.coils >= MAX_COILS) swirlEnd(); }
  function updateRope() { const F = FLAVOURS[B.flavour] || FLAVOURS.vanilla; rope.update(B.pts, { rad: 0.022, colA: F.col, colB: B.flavour === 'swirl' ? F.col2 : null }); }
  function swirlEnd() { const sw = B && B.sw; if (!sw) return; B.sw = null; K.levers.forEach(l => l.rotation.x = 0); SND.pull(false); SND.sfx('leverUp');
    if (B.coils < 0.35) { B.coils = 0; B.pts = []; B.phi = 0; B.lastPtPhi = 0; rope.clear(); flash('KEEP YOUR FINGER DOWN AND GO ROUND', '#ffffff', 1.6); return; }
    tipCurl(B.pts, B.dir || 1); updateRope(); SND.sfx('tip'); setTimeout(() => SND.sfx('whoosh'), 250); sparkle(10);
    const mean = sw.sum / Math.max(1, sw.n), dev = Math.sqrt(Math.max(0, sw.sq / Math.max(1, sw.n) - mean * mean)) + Math.abs(mean - 1) * 0.5;
    B.swirl = { coils: B.coils, dev, rev: sw.rev, fast: sw.fast };
    // the surface of the serve, by height (for sauce + toppings)
    let top = 0; const bins = new Array(12).fill(0); for (const p of B.pts) top = Math.max(top, p.y); B.topY = top + 0.02;
    for (const p of B.pts) { const i = clamp(Math.floor(p.y / B.topY * 12), 0, 11); bins[i] = Math.max(bins[i], Math.hypot(p.x, p.z) + 0.022 * (p.r || 1)); } for (let i = 10; i >= 0; i--) if (!bins[i]) bins[i] = bins[i + 1] || 0.03; B.env = bins;
    B.melting = true; B.step = 'carry'; B.carryT = 0; B.carryFrom = holder.position.clone(); const o = activeOrder();
    const w = o ? SIZES[o.size].coils : 3; flash(B.coils < w - 0.5 ? 'A BIT SMALL · ' + B.coils.toFixed(1) + ' TURNS' : B.coils > w + 0.6 ? 'OVERFILLED · ' + B.coils.toFixed(1) + ' TURNS' : 'BEAUTIFUL · ' + B.coils.toFixed(1) + ' TURNS', B.coils < w - 0.5 || B.coils > w + 0.6 ? '#e6b45a' : '#22c55e', 1.4);
    glideTo(stepShot('dress'), 1.0, 1.6); }
  const envR = y => { const b = B.env || [0.04]; return b[clamp(Math.floor(y / B.topY * b.length), 0, b.length - 1)]; };
  // sparkles on the overlay
  const sparks = []; function sparkle(n) { const c = ringCenter(); for (let i = 0; i < n; i++) { const a = rr(0, 6.28), sp = rr(60, 180); sparks.push({ x: c.x + Math.cos(a) * c.r, y: c.y + Math.sin(a) * c.r, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, t: 0, col: pick(['#ffd23a', '#f2b7c6', '#9fdcc8', '#ffffff']) }); } }

  // ---------- STEP 4: SAUCE (hold over the serve, the turntable spins) ----------
  function pickSauce(k) { if (!B || (B.step !== 'sauce' && B.step !== 'topping') || !work()) return; if (B.step === 'topping') { flash('SAUCE IS DONE · NOW THE TOPPING', '#ffffff', 1); return; } B.sauce = k; floatBottle.children[0].material = toon(SAUCES[k].bottle); floatBottle.visible = true; stream.material = toon(SAUCES[k].col); SND.sfx('bottle');
    const o = activeOrder(); if (o && o.sauce !== k) flash('THE TICKET SAYS ' + SAUCES[o.sauce].name, '#ff9a8a', 1.2); else flash('HOLD ON THE SERVE · SLIDE UP AND DOWN', '#ffffff', 1.4); }
  const sauceIn = { on: false, hN: 0, dxN: 0 }; let spin = 0, sauceAcc = 0;
  function sauceStep(dt) { const tt = K.turntable; stream.visible = false; SND.squeeze(!!(B.sauce && sauceIn.on)); if (!B.sauce || !sauceIn.on) { if (floatBottle.visible) { const p = holderWorld(); floatBottle.position.lerp(V3(p.x + 0.08, p.y + B.topY + 0.32, p.z - 0.12), Math.min(1, dt * 8)); floatBottle.rotation.z = damp(floatBottle.rotation.z, -0.3, 6, dt); } return; }
    const hN = sauceIn.hN, onServe = hN >= -0.45 && hN <= 1.7 && Math.abs(sauceIn.dxN) < 1.7, y = clamp(hN, 0, 1) * B.topY, lat = Math.asin(clamp(sauceIn.dxN * 0.6, -0.95, 0.95)), w = -Math.PI / 2 - lat, a = w + tt.rotation.y + holder.rotation.y;
    const p = holderWorld(), wx = p.x + Math.cos(w) * (envR(y) + 0.005), wz = p.z + Math.sin(w) * (envR(y) + 0.005), wy = p.y + y;
    floatBottle.position.lerp(V3(p.x + ((onServe ? wx : p.x - sauceIn.dxN * 0.12) - p.x) * 0.25, p.y + B.topY + 0.1, p.z + 0.03), Math.min(1, dt * 14)); floatBottle.rotation.z = damp(floatBottle.rotation.z, Math.PI * 0.85, 10, dt);
    const tip = V3(floatBottle.position.x, floatBottle.position.y - 0.065, floatBottle.position.z); const end = onServe ? V3(wx, wy, wz) : V3(tip.x, T + 0.07, tip.z); const h = Math.max(0.01, tip.y - end.y); stream.visible = true; stream.scale.set(upg('squeeze') ? 1.5 : 1, h, upg('squeeze') ? 1.5 : 1); stream.position.set((tip.x + end.x) / 2, (tip.y + end.y) / 2, (tip.z + end.z) / 2);
    if (!onServe) { B.miss += dt; if (Math.random() < dt * 4) puff(end.x, end.y, end.z, 0xffffff, 1); return; }
    sauceAcc += dt * (upg('squeeze') ? 42 : 28); while (sauceAcc >= 1) { sauceAcc -= 1; const zz = Math.sin(clock.elapsedTime * 13) * (upg('squeeze') ? 0.42 : 0.3); addBlob(a + zz + rr(-0.05, 0.05), clamp(y + Math.cos(clock.elapsedTime * 9) * B.topY * 0.08, 0, B.topY)); }
    if (Math.random() < dt * 7) SND.sfx('splat'); }
  function holderWorld() { holder.updateMatrixWorld(); return holder.getWorldPosition(V3()); }
  function addBlob(a, y) { if (sauceIM.count >= sauceIM.instanceMatrix.count) return; const r = envR(y) + 0.003, nx = Math.cos(a), nz = Math.sin(a), up = clamp((y / B.topY - 0.65) * 2, 0, 1);
    _v.set(nx * (1 - up), 0.3 + up, nz * (1 - up)).normalize(); _q.setFromUnitVectors(UP, _v); const sz = upg('squeeze') ? 1.45 : 1; _s.set(0.0125 * sz, 0.0055, 0.0125 * sz); _m.compose(V3(nx * r * (1 - up * 0.5), y + up * 0.01, nz * r * (1 - up * 0.5)), _q, _s);
    sauceIM.setMatrixAt(sauceIM.count, _m); sauceIM.setColorAt(sauceIM.count, new THREE.Color(SAUCES[B.sauce].col)); sauceIM.count++; sauceIM.instanceMatrix.needsUpdate = true; if (sauceIM.instanceColor) sauceIM.instanceColor.needsUpdate = true;
    B.hits[B.sauce] = (B.hits[B.sauce] || 0) + 1; B.sauceN++; const sec = Math.floor((((a % 6.2832) + 6.2832) % 6.2832) / 6.2832 * 8), band = clamp(Math.floor(y / B.topY * 4), 0, 3); B.cells.add(sec * 4 + band); }
  const sauceCov = () => B ? B.cells.size / 32 : 0;

  // ---------- STEP 5: TOPPING (shake the jar) ----------
  function pickTop(k) { if (!B || B.step !== 'topping' || !work()) { if (B && B.step === 'sauce') flash('SAUCE FIRST · THEN TAP DONE', '#ffffff', 1.1); return; } B.top = k; jar.visible = true; jar.userData.fill.material = toon(TOPPINGS[k].cols[0]); SND.sfx('tap');
    const o = activeOrder(); if (o && o.top !== k) flash('THE TICKET SAYS ' + TOPPINGS[o.top].name, '#ff9a8a', 1.2); else flash('SHAKE IT · WIGGLE LEFT AND RIGHT' + (S.shakeOn ? ' OR SHAKE THE PHONE' : ''), '#ffffff', 1.5); }
  const wantTops = () => { const o = activeOrder(); return o ? { small: 10, medium: 14, large: 18 }[o.size] : 14; };
  function shake(power = 1) { if (!B || B.step !== 'topping' || !B.top) return; const n = Math.max(1, Math.round((upg('shaker') ? 6 : 3) * power)); jar.userData.kick = 1; SND.sfx('shake'); buzz(6);
    const p0 = jar.position.clone().add(V3(0, -0.06, 0)); for (let i = 0; i < n; i++) { if (flying.length + B.tops > 80) break; const hN = clamp(1 - Math.pow(Math.random(), 1.7) * 0.85, 0.12, 1), y = hN * B.topY, a = -Math.PI / 2 + rr(-1.25, 1.25) + K.turntable.rotation.y, r = envR(y) * (hN > 0.85 ? rr(0.2, 0.9) : 1) + 0.004;
      flying.push({ k: B.top, from: p0.clone().add(V3(rr(-0.02, 0.02), 0, rr(-0.02, 0.02))), a, y: y + (hN > 0.85 ? 0.01 : 0), r, t: rr(-0.06, 0), dur: rr(0.18, 0.28), seed: Math.random() }); } }
  function stepFlying(dt) { for (let i = flying.length - 1; i >= 0; i--) { const f = flying[i]; f.t += dt; const k = clamp(f.t / f.dur, 0, 1); if (k < 1) continue; flying.splice(i, 1); landTop(f); }
    // draw the ones in the air as sparks over the overlay? keep it 3D: reuse puff for a tiny trail
  }
  function landTop(f) { const im = topIM[f.k]; if (im.count >= im.instanceMatrix.count) return; const nx = Math.cos(f.a), nz = Math.sin(f.a); _q.setFromEuler(new THREE.Euler(rr(0, 6), rr(0, 6), rr(0, 6))); _m.compose(V3(nx * f.r, f.y, nz * f.r), _q, _s.set(1, 1, 1)); im.setMatrixAt(im.count, _m); const cols = TOPPINGS[f.k].cols; im.setColorAt(im.count, new THREE.Color(cols[Math.floor(f.seed * cols.length)])); im.count++; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    B.tops++; const o = activeOrder(); if (o && f.k === o.top) { B.mine++; const sec = Math.floor((((f.a % 6.2832) + 6.2832) % 6.2832) / 6.2832 * 6), band = clamp(Math.floor(f.y / B.topY * 3), 0, 2); B.topCells.add(sec * 3 + band); } else B.wrong++;
    if (Math.random() < 0.35) SND.sfx('tick'); }
  const topCov = () => B ? B.topCells.size / 18 : 0;

  // ---------- STEP DONE / SERVE ----------
  function doneStep() { if (!B || !work()) return; if (B.step === 'sauce') { if (!B.sauceN) { flash('NO SAUCE YET · PICK A BOTTLE, HOLD ON THE SERVE', '#ffffff', 1.4); return; } sauceIn.on = false; floatBottle.visible = stream.visible = false; B.step = 'topping'; SND.sfx('stepDone'); flash('SAUCED · ' + Math.round(sauceCov() * 100) + '% · NOW THE TOPPING', sauceCov() >= 0.75 ? '#22c55e' : '#e6b45a', 1.3); }
    else if (B.step === 'topping') { if (!B.tops) { flash('NO TOPPING YET · PICK ONE AND SHAKE', '#ffffff', 1.4); return; } jar.visible = false; B.step = 'serve'; SND.sfx('stepDone'); const o = activeOrder(); flash(o ? 'FLICK IT UP TO ' + CUSTOMERS[o.ci].name : 'WHO IS IT FOR?', '#ffd23a', 1.6); glideTo(stepShot('serve'), 0.8); } }
  function binIt() { if (!B || !work() || B.step === 'vessel' || B.fly) return; SND.pull(false); SND.squeeze(false); puff(holderWorld().x, holderWorld().y + 0.1, holderWorld().z, 0xffffff, 5); SND.sfx('wrong'); flash('BINNED · START AGAIN', '#ffffff', 1.1); freshBuild(); glideTo(stepShot('machine'), 0.9); }
  function handOver(o) { if (!B || B.step !== 'serve' || B.fly || !o || o.st !== 'wait') return false; const from = holderWorld(); scene.attach(holder); B.fly = { t: 0, from, o }; SND.sfx('hand'); buzz(15); return true; }
  function gradeFor(o) { const sc = {}, notes = [], sw = B.swirl || { coils: 0, dev: 1, rev: 0, fast: 0 }, want = SIZES[o.size].coils, FG = upg('steady') ? 140 : 220;
    sc.Vessel = B.vessel === o.vessel ? 100 : 0; if (!sc.Vessel) notes.push('Wrong vessel — a ' + B.vessel + ' instead of a ' + o.vessel + '.');
    sc.Flavour = B.flavour === o.flavour ? 100 : 0; if (!sc.Flavour) notes.push('Wrong flavour — ' + FLAVOURS[B.flavour].name.toLowerCase() + ' instead of ' + FLAVOURS[o.flavour].name.toLowerCase() + '.');
    const size = clamp(100 - Math.abs(sw.coils - want) * 46, 0, 100), round = clamp(100 - sw.dev * FG, 0, 100), steady = clamp(100 - sw.rev * 14 - sw.fast * 30, 0, 100); sc.Swirl = Math.round(size * 0.45 + round * 0.33 + steady * 0.22);
    if (sw.coils < want - 0.6) notes.push('Too little for a ' + SIZES[o.size].name.toLowerCase() + ' — ' + sw.coils.toFixed(1) + ' coils of ' + want + '.'); else if (sw.coils > want + 0.8) notes.push('Overfilled past a ' + SIZES[o.size].name.toLowerCase() + ' — it is spilling over.');
    if (round < 55) notes.push('The swirl wobbled off the ring, so the coils came out lumpy.'); if (sw.rev > 2) notes.push('You changed direction ' + sw.rev + ' times — the coils broke up.'); if (sw.fast > 0.6) notes.push('Pulled too fast — the soft serve broke up.');
    const hitsR = B.sauceN ? (B.hits[o.sauce] || 0) / B.sauceN : 0, cov = sauceCov(); sc.Sauce = B.sauceN ? Math.round(clamp(hitsR * 30 + clamp(cov * 118, 0, 100) * 0.7 - B.miss * 6, 0, 100)) : 0;
    if (!B.sauceN) notes.push('No sauce went on at all.'); else { if (hitsR < 0.5) notes.push('Wrong sauce — ' + SAUCES[B.sauce].name.toLowerCase() + ' instead of ' + SAUCES[o.sauce].name.toLowerCase() + '.'); if (cov < 0.45) notes.push('The drizzle only caught one side — most of the serve is bare.'); else if (cov < 0.75) notes.push('Patchy drizzle, ' + Math.round(cov * 100) + '% covered.'); }
    const wt = { small: 10, medium: 14, large: 18 }[o.size], mine = B.mine, tc = topCov(), amount = clamp(100 - Math.abs(mine - wt) * (100 / wt) * 0.8, 0, 100);
    sc.Topping = B.tops ? Math.round(amount * 0.3 + clamp(tc * 118, 0, 100) * 0.44 + clamp(100 - B.wrong * 12, 0, 100) * 0.26) : 0;
    if (!B.tops) notes.push('No topping went on at all.'); else { if (B.wrong > mine) notes.push('Wrong topping — it wanted ' + TOPPINGS[o.top].name.toLowerCase() + '.'); else if (mine < wt * 0.6) notes.push('Short on ' + TOPPINGS[o.top].name.toLowerCase() + ' — ' + mine + ' of ' + wt + '.'); else if (mine > wt * 1.7) notes.push('Buried in ' + TOPPINGS[o.top].name.toLowerCase() + ' — ' + mine + ' pieces.'); if (tc < 0.5) notes.push('The topping is bunched in one spot rather than spread over the serve.'); }
    const m = B.melt; sc.Freshness = Math.round(m <= 35 ? 100 : m <= 55 ? 100 - (m - 35) * 1.9 : m >= 99 ? 6 : clamp(62 - (m - 55) * 1.3, 0, 62)); if (m > 55) notes.push(m >= 99 ? 'It melted into a puddle before it reached the counter.' : 'Badly melted — ' + Math.round(m) + '% gone and dripping down the side.'); else if (m > 35) notes.push('Softening at the edges by the time it was handed over.');
    let avg = Object.values(sc).reduce((a, b) => a + b, 0) / 6; if (!sc.Vessel) avg *= 0.6;
    return { sc, avg: Math.round(avg), note: notes[0] || 'Perfect. Not a thing wrong with it.' }; }
  function serveTo(o) { const G = gradeFor(o), pq = o.pat / o.patMax, stars = G.avg >= 86 ? 3 : G.avg >= 70 ? 2 : G.avg >= 50 ? 1 : 0;
    const level = stars === 3 ? (pq > 0.45 ? 'thrilled' : 'happy') : stars === 2 ? (G.avg >= 78 ? 'happy' : 'neutral') : stars === 1 ? 'unhappy' : 'insulted';
    if (!S.demo) { if (G.avg >= 90) save.setFlag('ic.ace'); save.best(SAVE.bestServe, G.avg); }
    if (stars === 0) { startReact(o, 'insulted', 0, null, G); holder.visible = false; freshBuild(); o.pat = Math.max(6, o.pat - 8); return; }
    o.st = 'pay'; o.stars = stars; o.tip = level === 'thrilled' ? 3 + Math.ceil(o.price * 0.5) : level === 'happy' ? 2 : level === 'neutral' ? 1 : 0; S.streak = stars === 3 ? (S.streak || 0) + 1 : 0; if (S.streak >= 2) { o.tip += S.streak - 1; setTimeout(() => flash('STREAK × ' + S.streak + ' · +' + (S.streak - 1) + 'g TIP', '#ffd23a', 1.4), 900); }
    if ((B.swirl && G.sc.Swirl >= 95)) { setTimeout(() => { flash('PERFECT SWIRL!', '#22c55e', 1.4); SND.sfx('star'); }, 400); jamil.userData.hop = 1; }
    // they take it: the cone goes into their hand and leaves with them
    coneWire.visible = false; holder.parent && holder.parent.remove(holder); const keep = holder.clone(true), rg = rope.mesh.geometry, rgc = rg.clone(); keep.traverse(m => { if (m.geometry === rg) m.geometry = rgc; }); keep.visible = true; keep.position.set(0.3, 1.0, 0.26); keep.rotation.set(0, 0, 0); keep.scale.setScalar(1); o.f.add(keep); o.f.userData.hold = { right: true }; o.cone = keep; scene.add(holder); freshBuild();
    const bill = [5, 10].find(b => b > o.price + (Math.random() < 0.35 ? 3 : 0)) || 10; startReact(o, level, stars, { oid: o.id, total: o.price, paid: bill, owed: bill - o.price, given: 0 }, G); }
  function startReact(o, level, stars, pay, G) { const R = REACT[level]; o.f.userData.mood = R.mood; o.f.userData.lineMood = R.mood; if (level === 'thrilled') { o.f.userData.hop = 1; jamil.userData.hop = 1; }
    S.react = { o, level, stars, pay, t: 0, word: R.word, col: R.col, line: pick(R.lines), who: CUSTOMERS[o.ci].name, tip: o.tip || 0, score: G.avg, note: G.note, rows: Object.entries(G.sc).map(([k, v]) => ({ k, v })) };
    SND.sfx(level); if (level === 'thrilled') { confetti(o.f.position.x, 2.0, o.f.position.z, 46); for (let i = 0; i < 10; i++) puff(o.f.position.x + rr(-0.4, 0.4), rr(1.4, 2.2), o.f.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function reactDone() { const r = S.react; S.react = null; r.o.f.userData.lineMood = null; if (r.pay) { S.pay = r.pay; payProps(r.pay); S.payOut = null; SND.sfx('drawer'); } else { glideTo(stepShot('machine'), 0.9); } }
  const REG = V3(K.register.x, T, K.register.z - 0.62), RG = registerKit(ST, REG, { open: 'CREAMERY  ·  OPEN' }), { DISH, regDisp, drawer, regDraw, coinsOut, payProps, coinDrop } = RG;
  function giveCoin(v) { const P = S.pay; if (!P) return; P.given += v; coinDrop(v); regDraw(P); SND.sfx('coin', { v }); if (P.given === P.owed) payDone(); else if (P.given > P.owed) { flash('TOO MUCH · TRY AGAIN', '#ec3013'); P.given = 0; SND.sfx('wrong'); coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; regDraw(P); } }
  function payDone() { const P = S.pay, o = orders.find(q => q.id === P.oid); S.pay = null; S.payOut = { t: 0, o }; regDraw({ ...P, given: P.owed }); if (!o) return; S.earned += o.price; S.tips += o.tip; S.served++; S.starList.push(o.stars);
    flash((o.stars === 3 ? '★★★' : o.stars === 2 ? '★★' : '★') + ' +' + (o.price + o.tip) + 'g' + (o.tip ? ' (TIP ' + o.tip + ')' : ''), '#ffd23a', 1.8); SND.sfx('register'); o.st = 'leave'; o.t = 0; if (S.active === o.id) S.active = null; if (DM.on) { DM.served++; DM.seen = {}; } setTimeout(() => { if (work() && !S.pay) glideTo(stepShot('machine'), 0.9); }, 900); }

  // ---------- customers ----------
  function newOrder(force) { const free = K.spots.findIndex((_, i) => !orders.some(o => o.spot === i && o.st !== 'gone')); if (free < 0) return; const used = orders.map(o => o.ci), pool = CUSTOMERS.map((_, i) => i).filter(i => !used.includes(i)), ci = pick(pool), d = S.day;
    const size = force ? 'medium' : pick(availSizes()), o = { id: idSeq++, ci, spot: free, vessel: force ? 'cone' : pick(['cone', 'cone', 'cup']), flavour: force ? 'swirl' : pick(FK), size, sauce: force ? 'fudge' : pick(availSauces()), top: force ? 'sprinkles' : pick(availTops()), price: SIZES[size].price, st: 'walk', f: custFox[ci], line: pick(LINES.order), t: 0 };
    o.patMax = o.pat = Math.max(46, 76 - (d - 1) * 6) * (upg('fan') ? 1.2 : 1); const f = o.f; f.visible = true; f.position.set(K.door.x, 0, K.D / 2 - 0.3); f.rotation.y = Math.PI; f.userData.mood = 'happy'; f.userData.hold = null; if (o.cone) f.remove(o.cone);
    for (const c of f.children.filter(c => c.userData.isCone)) f.remove(c); orders.push(o); if (!S.active) S.active = o.id; }
  function stepCustomers(dt, work) { for (let i = orders.length - 1; i >= 0; i--) { const o = orders[i], sp = K.spots[o.spot], f = o.f; o.t += dt; let speed = 0;
      if (o.st === 'walk') { const tx = o.t < 1.2 ? K.door.x - 0.4 : sp.x, tz = o.t < 1.2 ? 1.2 : sp.z, dx = tx - f.position.x, dz = tz - f.position.z, dd = Math.hypot(dx, dz); if (dd > 0.05) { const st = Math.min(dd, dt * 2.3); f.position.x += dx / dd * st; f.position.z += dz / dd * st; f.rotation.y = Math.atan2(dx, dz); speed = 2; } if (o.t >= 1.2 && dd < 0.06) { o.st = 'wait'; f.rotation.y = Math.PI; say(CUSTOMERS[o.ci].name + ': "' + o.line + '"', 3); SND.sfx('hello'); } }
      else if (o.st === 'wait' && work) { f.rotation.y = damp(f.rotation.y, Math.PI, 6, dt); o.pat -= DM.on ? 0 : dt; f.userData.mood = o.pat / o.patMax < 0.3 ? 'angry' : o.pat / o.patMax < 0.6 ? 'neutral' : 'happy'; if (o.pat <= 0) { o.st = 'leave'; o.t = 0; S.lost++; if (S.active === o.id) S.active = null; flash(CUSTOMERS[o.ci].name + ' LEFT · ' + pick(LINES.angry), '#ec3013', 1.8); SND.sfx('grumble'); S.streak = 0; } }
      else if (o.st === 'leave') { const tx = o.t < 1.6 ? K.door.x - 0.4 : K.door.x, tz = o.t < 1.6 ? 1.2 : K.D / 2 + 0.6, dx = tx - f.position.x, dz = tz - f.position.z, dd = Math.hypot(dx, dz); if (dd > 0.05) { const st = Math.min(dd, dt * 2.3); f.position.x += dx / dd * st; f.position.z += dz / dd * st; f.rotation.y = Math.atan2(dx, dz); speed = 2; } if (o.t > 4.2) { f.visible = false; if (o.cone) { f.remove(o.cone); o.cone = null; } f.userData.hold = null; orders.splice(i, 1); continue; } }
      kit.animFox(f, dt, speed); } }

  // ---------- shift ----------
  const work = () => S.phase === 'shift';
  function startShift(demo = false) { if (S.phase === 'shift' || S.phase === 'glide') return; musicStart();
    if (!demo && DM.on) demoStop(true); S.demo = !!demo; if (!demo) save.setFlag('ic.hired');
    S.dialog = null; payProps(null); S.payOut = null; S.react = null; S.pay = null; orders.forEach(o => { o.f.visible = false; if (o.cone) o.f.remove(o.cone); o.f.userData.hold = null; }); orders.length = 0; S.active = null; freshBuild();
    Object.assign(S, { phase: 'glide', t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 2.2, done: null, glideT: 1.3, firstForced: !!demo });
    setUniform(!!save.flag('creameryUniform') || demo); ben.visible = false; if (walker) walker.visible = false; jamil.position.set(-4.5, 0, -3.25); jamil.rotation.y = 1.0;
    K.coldPlate.visible = upg('coldPlate'); S.streak = 0; SND.sfx('shiftStart'); glideTo(stepShot('machine'), 1.3); say('JAMIL: "Cones and cups on the left, the machine in the middle, sauce and toppings on the front counter. Go!"', 6); }
  function endShift() { if (DM.on) return; S.phase = 'done'; freshBuild(); SND.sfx('shiftEnd'); SND.pull(false); SND.squeeze(false); const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = S.served >= 5 + S.day && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips;
    let newDay = false, unlock = []; try { save.addGold(total); save.best(SAVE.best, total); save.setFlag('ic.shift'); if (S.served >= 3 + S.day) { const nd = S.day + 1; save.setStat(SAVE.day, nd); newDay = true; unlock = [...Object.values(SIZES).filter(r => r.day === nd).map(r => r.name + ' SIZE'), ...Object.values(SAUCES).filter(r => r.day === nd).map(r => r.name + ' SAUCE'), ...Object.values(TOPPINGS).filter(r => r.day === nd).map(r => r.name)]; } if (!save.flag('creameryUniform') && S.served >= 3) { save.setFlag('creameryUniform'); unlock.push('CREAMERY UNIFORM (paper hat + towel)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, served: S.served, lost: S.lost, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0), gold: save.data.gold, best: save.stat(SAVE.bestServe, 0) };
    try { if (window.parent && window.parent !== window) window.parent.postMessage({ type: '8g:creamery', event: 'shiftDone', gold: total, served: S.served, stars: Math.round(avg * 10) / 10, newDay, eod }, '*'); } catch (e) {}
    if (newDay) S.day += 1; ben.visible = true; setUniform(true); ben.position.set(K.welcomeAt.x, 0, K.welcomeAt.z); ben.rotation.y = 0.3; jamil.position.set(K.keeperAt.x, 0, K.keeperAt.z); jamil.rotation.y = 0; glideTo(wideShot(), 1.4);
    say(eod ? 'JAMIL: "EMPLOYEE OF THE DAY! Ninety and over, on my machine!"' : S.served >= 3 ? 'JAMIL: "Good shift. The apron is yours tomorrow."' : 'JAMIL: "Rough one. It is forty degrees out. Tomorrow."', 6); orders.forEach(o => { if (o.st !== 'leave') { o.st = 'leave'; o.t = 0; } }); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); SND.sfx('star'); if (S.done) S.done.gold = save.data.gold; K.coldPlate.visible = upg('coldPlate'); return true; }
  function toIntro() { if (DM.on) demoStop(true); S.phase = 'intro'; S.done = null; S.dialog = null; freshBuild(); setUniform(true); ben.visible = true; if (walker) walker.visible = false; ben.position.set(K.welcomeAt.x, 0, K.welcomeAt.z); ben.rotation.y = 0.3; jamil.position.set(K.keeperAt.x, 0, K.keeperAt.z); jamil.rotation.y = 0; glideTo(wideShot(), 1); }

  // ---------- WALK MODE: the player walks in and around the creamery; talk to Jamil for a shift ----------
  function walkStart(at) { if (DM.on) demoStop(true); musicStart();
    S.phase = 'walk'; S.done = null; S.dialog = null; freshBuild(); orders.forEach(o => { o.f.visible = false; if (o.cone) { o.f.remove(o.cone); o.cone = null; } o.f.userData.hold = null; }); orders.length = 0; payProps(null); S.pay = S.react = S.payOut = null;
    ben.visible = false; if (heroLS() !== heroKey) makeWalker(heroLS()); walker.visible = true; const sp = at || K.spawn; walker.position.set(sp.x, 0, sp.z); walker.rotation.y = sp.yaw != null ? sp.yaw : Math.PI; WCAM.yaw = walker.rotation.y + Math.PI; WCAM.pitch = 0.42; WCAM.dist = 4.2;
    jamil.position.set(K.keeperAt.x, 0, K.keeperAt.z); jamil.rotation.y = 0; CAM.t = 1; CAM.from = null; save.where && save.where('kufa', CREAMERY.room);
    toast('THE CREAMERY · ' + (save.flag('ic.hired') ? 'Jamil has your apron behind the counter.' : 'Jamil is behind the counter. He is hiring.'), 3.5); }
  const keys = new Set(); let heroPollT = 0;
  function toast(t, d = 2.6) { S.toast = t; S.toastT = d; }
  function walkStep(dt) { const w = walker; let sx = S.stick.x, sy = S.stick.y; if (keys.has('KeyA') || keys.has('ArrowLeft')) sx -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) sx += 1; if (keys.has('KeyW') || keys.has('ArrowUp')) sy += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) sy -= 1;
    const m = Math.min(1, Math.hypot(sx, sy)); let speed = 0;
    if (m > 0.08 && !S.dialog) { const fx = -Math.sin(WCAM.yaw), fz = -Math.cos(WCAM.yaw), rx = Math.cos(WCAM.yaw), rz = -Math.sin(WCAM.yaw), mx = (fx * sy + rx * sx), mz = (fz * sy + rz * sx), ml = Math.hypot(mx, mz) || 1, v = 3.3 * m * dt;
      const nx = w.position.x + mx / ml * v, nz = w.position.z + mz / ml * v; if (K.walkable(nx, w.position.z)) w.position.x = nx; if (K.walkable(w.position.x, nz)) w.position.z = nz;
      w.rotation.y = dampAng(w.rotation.y, Math.atan2(mx, mz), 12, dt); speed = 3.3 * m; if (Date.now() - WCAM.userT > 1200) WCAM.yaw = dampAng(WCAM.yaw, w.rotation.y + Math.PI, 1.6 * m, dt); }
    if (speed > 0.3) { w.userData.stepT = (w.userData.stepT || 0) - dt * speed; if (w.userData.stepT <= 0) { w.userData.stepT = 1.15; SND.sfx('step', { s: Math.random() }); } }
    kit.animFox(w, dt, speed); if (w.userData.waveT > 0) { w.userData.waveT -= dt; const A = w.userData.P.arms; if (A && A[1]) A[1].rotation.set(-2.4 + Math.sin(w.userData.waveT * 18) * 0.5, 0, 0.3); }
    if (w.position.z > K.D / 2 - 0.45 && Math.abs(w.position.x - K.door.x) < K.door.w / 2) { w.position.z = K.D / 2 - 0.9; w.rotation.y = Math.PI; WCAM.yaw = 0; toast('KUFA TOWN SQUARE · the 3D square is not built yet. Back inside!', 3); SND.sfx('door'); }
    const near = nearJamil(); jamil.userData.lookAt = near || S.dialog ? V3(w.position.x, 1.6, w.position.z) : null; jamil.userData.talking = !!S.dialog && !S.dialog.choices; if (S.dialog) { const a = Math.atan2(w.position.x - jamil.position.x, w.position.z - jamil.position.z); jamil.rotation.y = dampAng(jamil.rotation.y, a, 6, dt); w.rotation.y = dampAng(w.rotation.y, a + Math.PI, 6, dt); }
    // camera: third person, stays inside the room
    const tgt = V3(w.position.x, 1.45, w.position.z), cp = Math.cos(WCAM.pitch), pos = V3(tgt.x + Math.sin(WCAM.yaw) * cp * WCAM.dist, tgt.y + Math.sin(WCAM.pitch) * WCAM.dist, tgt.z + Math.cos(WCAM.yaw) * cp * WCAM.dist);
    if (S.dialog) { const a = Math.atan2(w.position.x - jamil.position.x, w.position.z - jamil.position.z); WCAM.yaw = dampAng(WCAM.yaw, a + 0.75, 3, dt); tgt.set((w.position.x + jamil.position.x) / 2, 1.5, (w.position.z + jamil.position.z) / 2); }
    pos.x = clamp(pos.x, -K.W / 2 - 2.5, K.W / 2 + 2.5); pos.z = clamp(pos.z, -K.D / 2 + 0.25, K.D / 2 + 2.5);   // side + front walls are one-sided: from outside they vanish (cutaway)
    { const hd = Math.hypot(pos.x - tgt.x, pos.z - tgt.z); if (hd < 2) pos.y = Math.max(pos.y, tgt.y + (2 - hd) * 0.55); if (!S.dialog) tgt.add(V3(-Math.sin(WCAM.yaw) * 1.2, -0.1, -Math.cos(WCAM.yaw) * 1.2)); } pos.y = clamp(pos.y, 0.6, K.H - 0.3);
    camera.position.lerp(pos, Math.min(1, dt * 8)); CAM.look.lerp(tgt, Math.min(1, dt * 10));
    if ((heroPollT -= dt) < 0) { heroPollT = 0.5; const h = heroLS(); if (h !== heroKey) { makeWalker(h); walker.visible = true; } } }
  const dampAng = (a, b, k, dt) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * Math.min(1, k * dt); };
  const nearJamil = () => S.phase === 'walk' && walker && (Math.hypot(walker.position.x - K.talkAt.x, walker.position.z - K.talkAt.z) < 1.6 || Math.hypot(walker.position.x - jamil.position.x, walker.position.z - jamil.position.z) < 1.8);
  function talk() { if (S.phase !== 'walk') return; if (S.dialog) { nextLine(); return; } if (!nearJamil()) return; const met = save.flag('ic.met');
    const lines = save.flag('ic.ace') ? JAMIL.ace : save.flag('ic.shift') ? JAMIL.shift : met ? [JAMIL.again] : [JAMIL.hello]; save.setFlag('ic.met'); S.dialog = { lines, i: 0, choices: false, asked: S.dialog && S.dialog.asked || {} }; SND.sfx('talk'); }
  function dlgChoices() { const A = S.dialog.asked; return [{ text: 'Sounds SWEET! put me to work', act: 'work' }, { text: 'how do I make ICECREAM?', act: 'how', asked: !!A.how }, { text: 'How did you get into the icecream business?', act: 'why', asked: !!A.why }, ...(save.flag('ic.hired') ? [{ text: 'Another shift, then.', act: 'work' }] : []), { text: 'Bye.', act: 'bye', bye: true }]; }
  function nextLine() { const D = S.dialog; if (!D || D.choices) return; if (D.i < D.lines.length - 1) { D.i++; SND.sfx('ui'); } else D.choices = true; }
  function choose(i) { const D = S.dialog; if (!D) return; if (!D.choices) { nextLine(); return; } const c = dlgChoices()[i]; if (!c) return;
    if (c.act === 'work') { S.dialog = null; save.setFlag('ic.hired'); startShift(); }
    else if (c.act === 'how' || c.act === 'why') { D.asked[c.act] = true; save.setFlag('ic.' + c.act); D.lines = JAMIL[c.act]; D.i = 0; D.choices = false; }
    else S.dialog = null; }
  function dialogHud() { const D = S.dialog; if (!D) return null; return { name: JAMIL.name, role: JAMIL.role, text: D.lines[D.i], choices: D.choices ? dlgChoices() : null, required: false, step: D.i + 1, total: D.lines.length }; }

  // ---------- input ----------
  const el = renderer.domElement, ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  const local = e => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  function ringCenter() { const p = holderWorld(), s = scr(V3(p.x, p.y + 0.05 + Math.min(B.topY || 0, 0.12) * 0.5, p.z)); return { x: s.x, y: s.y, r: clamp(Math.min(CW(), CHh()) * 0.2, 62, 150) }; }
  function pickAt(p) { ndc.set(p.x / CW() * 2 - 1, -(p.y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(K.picks, false)[0]; return h ? h.object.userData.pick : null; }
  function doPick(id) { const [kind, k] = id.split(':'), st = B.step;
    if (kind === 'vessel') { if (st === 'vessel') pickVessel(k); else flash(st === 'flavour' ? 'NOW THE NOZZLE' : 'ONE AT A TIME · BIN IT TO START OVER', '#ffffff', 1); }
    else if (kind === 'flavour') { if (st === 'flavour') pickFlavour(k); else if (st === 'vessel') flash('CUP OR CONE FIRST', '#ffffff', 1); }
    else if (kind === 'sauce') { if (st === 'sauce') pickSauce(k); else if (st === 'topping') pickSauce(k); else flash(st === 'swirl' ? 'PULL THE SWIRL FIRST' : 'SAUCE COMES AFTER THE SWIRL', '#ffffff', 1); }
    else if (kind === 'topping') pickTop(k); }
  function customerAt(p) { let best = null; for (const o of orders) { if (o.st !== 'wait') continue; const f = o.f.position, a = scr(V3(f.x, 2.25, f.z)), b = scr(V3(f.x, 0.7, f.z)), hw = Math.max(36, Math.abs(scr(V3(f.x + 0.45, 1.4, f.z)).x - a.x)); if (p.x > a.x - hw && p.x < a.x + hw && p.y > a.y - 20 && p.y < b.y) best = o; } return best; }
  function updSauceIn(p) { const h = holderWorld(), b = scr(h), t = scr(V3(h.x, h.y + B.topY, h.z)), maxR = Math.max(...(B.env || [0.05])), rgt = V3().setFromMatrixColumn(camera.matrixWorld, 0), side = scr(h.clone().addScaledVector(rgt, maxR)), hw = Math.max(18, Math.abs(side.x - b.x));
    sauceIn.hN = (b.y - p.y) / Math.max(10, b.y - t.y); sauceIn.dxN = (p.x - b.x) / hw; sauceIn.on = true; }
  let PT = null; const trail = [];
  function onDown(e) { if (PT) return; audio.init && audio.init(); const p = local(e), now = performance.now(); PT = { id: e.pointerId, x: p.x, y: p.y, x0: p.x, y0: p.y, t: now, vx: 0, vy: 0, acc: 0, dir: 0, moved: 0, kind: 'none' }; try { el.setPointerCapture(e.pointerId); } catch (er) {}
    if (S.phase === 'walk') { PT.kind = 'look'; return; } if (!work() || S.react || S.pay || DM.on || !B) return;
    if (B.step === 'swirl' && !B.slide) { const c = ringCenter(), d = Math.hypot(p.x - c.x, p.y - c.y); if (d < c.r * 1.9 && swirlBegin(Math.atan2(p.y - c.y, p.x - c.x), d / c.r)) { PT.kind = 'swirl'; trail.length = 0; trail.push({ x: p.x, y: p.y, t: now }); return; } }
    const hit = pickAt(p); if (hit && !(B.step === 'serve')) { doPick(hit); PT.kind = 'tap'; return; }
    if (B.step === 'sauce') { if (B.sauce) { PT.kind = 'sauce'; updSauceIn(p); } else { PT.kind = 'spin'; flash('PICK UP A SAUCE BOTTLE FIRST', '#ffffff', 1); } return; }
    if (B.step === 'topping') { PT.kind = B.top ? 'shake' : 'spin'; if (!B.top) flash('PICK A TOPPING FIRST', '#ffffff', 1); return; }
    if (B.step === 'serve' && !B.fly) { const s = scr(holderWorld()); if (Math.hypot(p.x - s.x, p.y - s.y) < 110) { PT.kind = 'drag'; scene.attach(holder); B.dragHome = holder.position.clone(); } else PT.kind = 'serveTap'; return; }
    if (B.step === 'swirl' && !B.slide) flash('PRESS ON THE RING AND GO ROUND', '#ffffff', 1.1); }
  function onMove(e) { if (!PT || e.pointerId !== PT.id) return; const p = local(e), now = performance.now(), dts = Math.max(0.001, (now - PT.t) / 1000), dx = p.x - PT.x, dy = p.y - PT.y; PT.vx = PT.vx * 0.6 + dx / dts * 0.4; PT.vy = PT.vy * 0.6 + dy / dts * 0.4; PT.moved += Math.abs(dx) + Math.abs(dy); PT.x = p.x; PT.y = p.y; PT.t = now;
    if (PT.kind === 'look') { WCAM.yaw -= dx * 0.008; WCAM.pitch = clamp(WCAM.pitch + dy * 0.004, 0.08, 1.1); WCAM.userT = Date.now(); }
    else if (PT.kind === 'swirl') { const c = ringCenter(); swirlMove(Math.atan2(p.y - c.y, p.x - c.x), Math.hypot(p.x - c.x, p.y - c.y) / c.r, dts); trail.push({ x: p.x, y: p.y, t: now }); if (trail.length > 40) trail.shift(); if (!B.sw) PT.kind = 'none'; }
    else if (PT.kind === 'sauce') updSauceIn(p);
    else if (PT.kind === 'shake') { const sg = Math.sign(dx); if (sg && sg !== PT.dir) { if (Math.abs(PT.acc) > 16) shake(1); PT.dir = sg; PT.acc = 0; } PT.acc += dx; }
    else if (PT.kind === 'spin') spin = clamp(spin - dx * 0.03, -8, 8);
    else if (PT.kind === 'drag') { ndc.set(p.x / CW() * 2 - 1, -(p.y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const pl = new THREE.Plane(V3(0, 0, -1), B.dragHome.z), hit = V3(); if (ray.ray.intersectPlane(pl, hit)) holder.position.set(hit.x, Math.max(T + 0.2, hit.y), B.dragHome.z + Math.min(0, 0) ); } }
  function onUp(e) { if (!PT || e.pointerId !== PT.id) return; const P0 = PT; PT = null; const p = { x: P0.x, y: P0.y };
    if (P0.kind === 'swirl') { swirlEnd(); trail.length = 0; }
    else if (P0.kind === 'sauce') { sauceIn.on = false; }
    else if (P0.kind === 'shake') { if (P0.moved < 8) shake(0.45); }
    else if (P0.kind === 'drag' || P0.kind === 'serveTap') { const c = customerAt(p), flick = P0.kind === 'drag' && (P0.vy < -500 || p.y < P0.y0 - 110); let ok = false; if (c) ok = handOver(c); else if (flick) ok = handOver(activeOrder() || orders.find(o => o.st === 'wait')); if (!ok && P0.kind === 'drag') { holder.position.copy(B.dragHome); K.turntable.rotation.y = 0; K.turntable.attach(holder); holder.position.set(0, holder.position.y, 0); flash('FLICK IT UP, OR DROP IT ON THE CUSTOMER', '#ffffff', 1.3); } } }
  const onVis = () => { if (document.hidden) { PAUSE = true; try { audio.ctx && audio.ctx.suspend(); } catch (e) {} if (MUS.el) MUS.el.pause(); SND.pull(false); SND.squeeze(false); } else { PAUSE = false; clock.getDelta(); try { audio.ctx && audio.ctx.resume(); } catch (e) {} if (MUS.el && !S.musicOff) MUS.el.play().catch(() => {}); } }; document.addEventListener('visibilitychange', onVis);
  el.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
  const onKD = e => { if (/INPUT|TEXTAREA/.test((e.target && e.target.tagName) || '')) return; if (S.phase === 'walk') { if (e.code === 'KeyE' || (e.code === 'Enter' && S.dialog)) { e.preventDefault(); talk(); return; } if (e.code === 'Space') { e.preventDefault(); if (walker) { walker.userData.hop = 1; SND.sfx('hop'); } return; } if (e.code === 'Escape' && S.dialog) { S.dialog = null; return; } if (S.dialog && S.dialog.choices && /^Digit[1-9]$/.test(e.code)) { choose(+e.code.slice(5) - 1); return; } keys.add(e.code); return; }
    if (work() && B && !DM.on) { if (e.code === 'Enter' || e.code === 'KeyD') { if (B.step === 'sauce' || B.step === 'topping') doneStep(); else if (B.step === 'serve') handOver(activeOrder()); } if (e.code === 'Space' && B.step === 'topping') { e.preventDefault(); shake(1); } } };
  const onKU = e => keys.delete(e.code), onBlur = () => keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);
  // shake the phone (opt-in: iPhone asks for motion permission)
  let lastShake = 0; const onMotion = e => { const a = e.acceleration && e.acceleration.x != null ? e.acceleration : null; if (!a) return; const g = Math.hypot(a.x || 0, a.y || 0, a.z || 0), now = performance.now(); if (g > 13 && now - lastShake > 150) { lastShake = now; shake(1); } };
  async function phoneShake(on = !S.shakeOn) { if (!on) { S.shakeOn = false; removeEventListener('devicemotion', onMotion); return false; } try { if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') { const r = await DeviceMotionEvent.requestPermission(); if (r !== 'granted') { flash('MOTION NOT ALLOWED · WIGGLE YOUR FINGER INSTEAD', '#ffffff', 1.6); return false; } } } catch (er) { return false; } addEventListener('devicemotion', onMotion); S.shakeOn = true; flash('PHONE SHAKE ON · SHAKE IT!', '#22c55e', 1.4); return true; }

  // ---------- overlay: the swirl ring, your finger trail, sparkles, the flick arrow ----------
  const ov = document.createElement('canvas'); ov.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none'; container.style.position = container.style.position || 'relative'; container.appendChild(ov); const og = ov.getContext('2d');
  let ovDirty = true;
  function drawOverlay(dt) { const W = CW(), H = CHh(), dpr = Math.min(2, devicePixelRatio || 1), need = (work() && B && (B.step === 'swirl' || B.step === 'serve')) || sparks.length || trail.length > 1;
    if (ov.width !== Math.round(W * dpr) || ov.height !== Math.round(H * dpr)) { ov.width = Math.round(W * dpr); ov.height = Math.round(H * dpr); } else if (ovDirty || need) ov.width = ov.width;   // full reset: always comes back clean
    ovDirty = !!need; if (!need) return; og.setTransform(dpr, 0, 0, dpr, 0, 0);
    const t = clock.elapsedTime;
    if (work() && B && B.step === 'swirl' && !B.slide && !S.react) { const c = ringCenter(), want = wantCoils(), inB = Math.abs(B.coils - want) <= 0.5, over = B.coils > want + 0.5, col = over ? '#ec3013' : inB ? '#22c55e' : '#ffd23a';
      og.save(); og.lineWidth = 9; og.strokeStyle = 'rgba(32,30,29,0.55)'; og.beginPath(); og.arc(c.x, c.y, c.r, 0, 7); og.stroke(); og.setLineDash([14, 10]); og.lineDashOffset = -t * 40 * (B.dir || 1); og.lineWidth = 5; og.strokeStyle = col; og.beginPath(); og.arc(c.x, c.y, c.r, 0, 7); og.stroke(); og.setLineDash([]);
      // progress arc: how far through the order's size you are
      og.lineWidth = 6; og.strokeStyle = '#ffffff'; og.beginPath(); og.arc(c.x, c.y, c.r + 14, -Math.PI / 2, -Math.PI / 2 + Math.min(1, B.coils / want) * Math.PI * 2); og.stroke();
      // chevrons that run round the ring
      for (let i = 0; i < 3; i++) { const a = t * 2.2 * (B.dir || 1) + i * 2.094, x = c.x + Math.cos(a) * c.r, y = c.y + Math.sin(a) * c.r, d = (B.dir || 1); og.save(); og.translate(x, y); og.rotate(a + d * Math.PI / 2); og.fillStyle = col; og.strokeStyle = '#201e1d'; og.lineWidth = 2; og.beginPath(); og.moveTo(8, 0); og.lineTo(-6, -7); og.lineTo(-6, 7); og.closePath(); og.fill(); og.stroke(); og.restore(); }
      // the coil count, big
      og.textAlign = 'center'; og.textBaseline = 'bottom'; og.font = '900 30px Archivo, Arial, sans-serif'; og.lineWidth = 6; og.strokeStyle = '#201e1d'; const txt = B.coils.toFixed(1) + ' / ' + want; og.strokeText(txt, c.x, c.y - c.r - 22); og.fillStyle = col; og.fillText(txt, c.x, c.y - c.r - 22); og.font = '800 12px Archivo, Arial, sans-serif'; og.lineWidth = 4; og.strokeText('TURNS', c.x, c.y - c.r - 8); og.fillStyle = '#ffffff'; og.fillText('TURNS', c.x, c.y - c.r - 8);
      // idle: a glowing dot shows where to press and which way to go
      const demoF = DM.on && DM.finger; if ((!B.sw && !PT) || demoF) { const a = demoF ? DM.fingerA : t * 3, x = c.x + Math.cos(a) * c.r, y = c.y + Math.sin(a) * c.r; og.fillStyle = 'rgba(255,210,58,0.35)'; og.beginPath(); og.arc(x, y, 24 + Math.sin(t * 8) * 4, 0, 7); og.fill(); og.fillStyle = '#ffffff'; og.strokeStyle = '#201e1d'; og.lineWidth = 3; og.beginPath(); og.arc(x, y, 11, 0, 7); og.fill(); og.stroke(); }
      og.restore(); }
    if (trail.length > 1 && (B && B.sw)) { og.save(); og.lineCap = og.lineJoin = 'round'; for (let i = 1; i < trail.length; i++) { const k = i / trail.length; og.strokeStyle = 'rgba(32,30,29,' + (0.5 * k) + ')'; og.lineWidth = 12 * k + 2; og.beginPath(); og.moveTo(trail[i - 1].x, trail[i - 1].y); og.lineTo(trail[i].x, trail[i].y); og.stroke(); og.strokeStyle = 'rgba(255,255,255,' + k + ')'; og.lineWidth = 7 * k + 1; og.stroke(); } og.restore(); }
    for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 260 * dt; if (s.t > 0.7) { sparks.splice(i, 1); continue; } og.fillStyle = s.col; og.globalAlpha = 1 - s.t / 0.7; og.save(); og.translate(s.x, s.y); og.rotate(s.t * 8); og.fillRect(-4, -4, 8, 8); og.restore(); og.globalAlpha = 1; }
    if (work() && B && B.step === 'serve' && !B.fly && !S.react && !S.pay) { const o = activeOrder() || orders.find(q => q.st === 'wait'); if (o) { const a = scr(holderWorld().add(V3(0, B.topY + 0.05, 0))), b = scr(V3(o.f.position.x, 1.5, o.f.position.z)), k = (t * 1.4) % 1; og.save(); og.setLineDash([10, 9]); og.lineDashOffset = -t * 50; og.lineWidth = 5; og.strokeStyle = '#ffd23a'; const mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - 60; og.beginPath(); og.moveTo(a.x, a.y - 10); og.quadraticCurveTo(mx, my, b.x, b.y); og.stroke(); og.setLineDash([]);
      const u = k, px = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * mx + u * u * b.x, py = (1 - u) * (1 - u) * (a.y - 10) + 2 * (1 - u) * u * my + u * u * b.y; og.fillStyle = '#ffffff'; og.strokeStyle = '#201e1d'; og.lineWidth = 3; og.beginPath(); og.arc(px, py, 9, 0, 7); og.fill(); og.stroke();
      og.font = '900 15px Archivo, Arial'; og.textAlign = 'center'; og.lineWidth = 5; og.strokeText('FLICK UP', a.x, a.y + 34); og.fillStyle = '#ffd23a'; og.fillText('FLICK UP', a.x, a.y + 34); og.restore(); } } }

  // ---------- music: KUFA/KUFA-Icrecream.mp3 if it is in the folder (the 2D track for this room), else the synthesized loop in creamery-audio.js ----------
  const MUS = { el: null, tried: false };
  function musicStart() { audio.init && audio.init(); try { audio.wind && audio.wind.gain.setValueAtTime(0.0001, audio.ctx.currentTime); } catch (e) {} SND.ambience(true); if (S.musicOff) return;
    if (!MUS.tried) { MUS.tried = true; try { const a = new Audio(new URL('../../KUFA/KUFA-Icrecream.mp3', import.meta.url).href); a.loop = true; a.volume = 0.32; a.onerror = () => { MUS.el = null; SND.musicOn(!S.musicOff); }; a.addEventListener('playing', () => { if (MUS.el) SND.musicOn(false); }); MUS.el = a; a.play().catch(() => { MUS.el = null; }); } catch (e) {} }
    else if (MUS.el) MUS.el.play().catch(() => {}); }
  function musicStep() { const mood = S.phase === 'walk' || S.phase === 'intro' ? 'walk' : S.phase === 'done' ? 'done' : (S.phase === 'shift' || S.phase === 'glide') ? (CREAMERY.shift - S.t < 30 && !DM.on ? 'rush' : 'shift') : null; SND.music(audio.ctx ? mood : null); SND.musicOn(!S.musicOff && !(MUS.el && !MUS.el.paused)); SND.step(); }
  function toggleMusic() { S.musicOff = !S.musicOff; if (S.musicOff) { if (MUS.el) MUS.el.pause(); } else musicStart(); SND.sfx('ui'); return !S.musicOff; }

  // ---------- DEMO: the autopilot works two customers with captions (nothing is saved) ----------
  const DM = { on: false, wait: 0, armed: false, cap: '', key: '', seen: {}, served: 0, finger: false, fingerA: 0, t: 0 };
  const cap = (id, key, text) => { if (DM.seen[id]) return; DM.seen[id] = true; DM.cap = text; DM.key = key; };
  function demoStart() { if (S.phase === 'shift' || S.phase === 'glide') return; Object.assign(DM, { on: true, wait: 2.0, armed: false, cap: 'Jamil\'s machine: watch one serve, start to finish.', key: '', seen: {}, served: 0, finger: false, t: 0, day0: S.day }); S.day = 1; startShift(true); }
  function demoStop(silent) { if (!DM.on) return; DM.on = false; DM.finger = false; S.demo = false; S.day = DM.day0 || S.day; sauceIn.on = false; if (!silent) { orders.forEach(o => { o.f.visible = false; if (o.cone) { o.f.remove(o.cone); o.cone = null; } o.f.userData.hold = null; }); orders.length = 0; S.pay = S.react = S.payOut = null; payProps(null); S.phase = 'intro'; toIntro(); } }
  function demoStep(dt) { DM.t += dt; DM.wait -= dt; const o = activeOrder();
    if (B.step === 'swirl' && B.sw) { const want = SIZES[o ? o.size : 'medium'].coils; DM.fingerA += dt * 7.2; DM.finger = true; swirlMove(DM.fingerA, 1 + Math.sin(DM.t * 3) * 0.04, dt); if (B.coils >= want) { DM.finger = false; swirlEnd(); DM.wait = 1.2; } return; }
    if (B.step === 'sauce' && sauceIn.on) { DM.sauceT += dt; sauceIn.hN = 1.02 - (DM.sauceT / 5.5) * 1.1; sauceIn.dxN = Math.sin(DM.sauceT * 1.3) * 0.25; if (sauceCov() >= 0.82 || DM.sauceT > 6.5) { sauceIn.on = false; DM.wait = 0.8; } return; }
    if (DM.wait > 0) return;
    if (DM.served >= 2 && !S.react && !S.pay) { if (!S.payOut) { DM.cap = 'That is the job. PUT ME TO WORK when you are ready.'; DM.key = ''; DM.wait = 99; setTimeout(() => demoStop(), 2200); } return; }
    if (S.pay) { const P = S.pay, left = P.owed - P.given, c = [5, 2, 1].find(v => v <= left); cap('pay', 'PAY', 'They paid ' + P.paid + 'g for ' + P.total + 'g. Tap coins to give ' + P.owed + 'g change.'); if (c) giveCoin(c); DM.wait = 0.55; return; }
    if (S.react || !o || o.st !== 'wait') { if (!o && !S.react) DM.cap = 'Waiting for a customer…'; return; }
    const arm = (id, key, text, p) => { if (DM.armed) { DM.armed = false; DM.hint = null; return true; } cap(id, key, text); DM.hint = p ? { p, r: 0.16 } : null; DM.armed = true; DM.wait = 1.3; return false; };
    if (B.step === 'vessel') { const k = o.vessel, p = k === 'cone' ? K.coneStand : K.cupStack; if (arm('v', 'TAP', 'Step 1: CUP OR CONE. The ticket says ' + VESSELS[k].name + '. Tap it.', V3(p.x, K.backTop, p.z))) { pickVessel(k); DM.wait = 0.9; } return; }
    if (B.step === 'flavour') { const n = K.nozzles.find(q => q.k === o.flavour); if (arm('f', 'TAP', 'Step 2: THE NOZZLE. ' + FLAVOURS[o.flavour].name + ' is the one they ordered.', V3(n.x, K.trayY, n.z))) { pickFlavour(o.flavour); DM.wait = 1.0; } return; }
    if (B.step === 'swirl') { if (B.slide) return; DM.hint = null; cap('s', 'SWIRL', 'Step 3: PULL IT. Press on the ring and go round, same circle. ' + SIZES[o.size].name + ' = ' + SIZES[o.size].coils + ' turns.'); DM.fingerA = -Math.PI / 2; swirlBegin(DM.fingerA, 1); return; }
    if (B.step === 'sauce') { if (!B.sauce) { if (arm('sp', 'TAP', 'Step 4: SAUCE. Pick up the ' + SAUCES[o.sauce].name + ' bottle.', V3(K.sauces[o.sauce].x, T, K.sauces[o.sauce].z))) { pickSauce(o.sauce); DM.wait = 0.7; } return; }
      if (sauceCov() < 0.6) { cap('sh', 'HOLD', 'Hold on the serve. The turntable spins: slide from the top down and it spirals right round.'); DM.sauceT = 0; sauceIn.on = true; return; } cap('sd', 'DONE', 'Covered. Tap DONE.'); doneStep(); DM.wait = 0.9; return; }
    if (B.step === 'topping') { if (!B.top) { if (arm('tp', 'TAP', 'Step 5: TOPPING. Tap the ' + TOPPINGS[o.top].name + ' bin.', V3(K.bins[o.top].x, T, K.bins[o.top].z))) { pickTop(o.top); DM.wait = 0.6; } return; }
      if (B.mine < wantTops() && B.tops < 40) { cap('ts', 'SHAKE', 'SHAKE IT: wiggle your finger left and right (or shake the phone).'); shake(1); DM.wait = 0.24; return; } cap('td', 'DONE', 'Spread all over. DONE.'); doneStep(); DM.wait = 1.0; return; }
    if (B.step === 'serve') { if (arm('sv', 'FLICK', 'Step 6: HURRY. Flick it up to ' + CUSTOMERS[o.ci].name + ' before it melts.', null)) { handOver(o); DM.wait = 1.2; } return; } }

  // ---------- hint: the pulsing ring + one line of what to do next ----------
  const HR = hintRings(ST); let HINT = null, hintT = 0;
  function updHint(dt) { hintT += dt; HINT = null; if (!work() || !B || S.react || S.pay) { HR.place(null, hintT, dt); return; } const o = activeOrder(), ring = S.day <= 2 || S.demo;
    if (!o) HINT = { text: 'Wait for a customer at the counter' };
    else if (B.step === 'vessel') { const p = o.vessel === 'cone' ? K.coneStand : K.cupStack; HINT = { text: 'Tap the ' + (o.vessel === 'cone' ? 'CONE tower' : 'CUP stack') + ' · back left', p: ring ? V3(p.x, K.backTop, p.z) : null, r: 0.2 }; }
    else if (B.step === 'flavour') { const n = K.nozzles.find(q => q.k === o.flavour); HINT = { text: 'Tap the ' + FLAVOURS[o.flavour].name + ' nozzle', p: ring ? V3(n.x, K.trayY, n.z) : null, r: 0.16 }; }
    else if (B.step === 'swirl') HINT = { text: B.sw ? 'Keep going round · ' + SIZES[o.size].name + ' = ' + SIZES[o.size].coils + ' turns · then let go' : 'Press on the ring and go round · ' + SIZES[o.size].coils + ' turns' };
    else if (B.step === 'carry') HINT = { text: 'To the turntable…' };
    else if (B.step === 'sauce') { if (!B.sauce) { const s = K.sauces[o.sauce]; HINT = { text: 'Pick up the ' + SAUCES[o.sauce].name + ' bottle', p: ring ? V3(s.x, T, s.z) : null, r: 0.15 }; } else HINT = { text: sauceCov() >= 0.75 ? 'Covered · tap DONE' : 'Hold on the serve · slide up and down' }; }
    else if (B.step === 'topping') { if (!B.top) { const b = K.bins[o.top]; HINT = { text: 'Tap the ' + TOPPINGS[o.top].name + ' bin', p: ring ? V3(b.x, T, b.z) : null, r: 0.15 }; } else HINT = { text: topCov() >= 0.8 && B.mine >= wantTops() * 0.7 ? 'Spread all over · tap DONE' : 'Shake! Wiggle left-right' + (S.shakeOn ? ' or shake the phone' : '') }; }
    else if (B.step === 'serve') HINT = { text: 'Flick it up to ' + CUSTOMERS[o.ci].name + ', or drop it on them' };
    const h = DM.on ? DM.hint : HINT && HINT.p ? { p: HINT.p, r: HINT.r } : null; HR.place(h, hintT, dt); }

  // ---------- the frame ----------
  const flyM = []; for (let i = 0; i < 24; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 4), toon('#ffffff')); m.visible = false; scene.add(m); flyM.push(m); }
  function step(dt) { const t = clock.elapsedTime, wk = work();
    // ---- camera ----
    if (S.phase === 'walk') walkStep(dt);
    else if (S.react) { S.react.t += dt; const o = S.react.o, f = o.f.position, sh = shotFor('react' + o.spot, () => [V3(f.x - 0.75, 0.95, f.z), V3(f.x + 0.75, 0.95, f.z), V3(f.x, 2.4, f.z), V3(f.x, 1.1, f.z - 0.5)], 0.18, 0.12, 0.12); camera.position.lerp(sh.pos, Math.min(1, dt * 5)); CAM.look.lerp(sh.look, Math.min(1, dt * 5)); if (S.react.t > (DM.on ? 2.2 : 2.6)) reactDone(); }
    else if (S.pay || S.payOut) { const port = CW() < CHh(), sh = shotFor('pay', () => [V3(REG.x - 0.24, REG.y, REG.z - 0.38), V3(REG.x + 0.24, REG.y + 0.1, REG.z + 0.05), V3(DISH.x - 0.14, DISH.y, DISH.z - 0.14), V3(DISH.x + 0.14, DISH.y, DISH.z + 0.14), V3(REG.x + 0.52, REG.y, REG.z - 0.5), V3(REG.x - 0.24, REG.y + 0.5, REG.z - 0.05), V3(REG.x + 0.24, REG.y + 0.5, REG.z - 0.05)], 1.0, 0.25, 0.07); camera.position.lerp(sh.pos, Math.min(1, dt * 5)); CAM.look.lerp(sh.look, Math.min(1, dt * 5)); regDisp.scale.set(port ? 0.36 : 0.46, port ? 0.133 : 0.17, 1); }
    else if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); if (CAM.arc) camera.position.y += Math.sin(k * Math.PI) * CAM.arc; CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); }
    else if (S.phase === 'intro' || S.phase === 'done') { const w = wideShot(); camera.position.lerp(w.pos, Math.min(1, dt * 4)); CAM.look.lerp(w.look, Math.min(1, dt * 4)); }
    else if (wk || S.phase === 'glide') { const key = !B || B.step === 'vessel' || B.step === 'flavour' ? 'machine' : B.step === 'swirl' ? 'swirl' : B.step === 'serve' ? 'serve' : 'dress', w = stepShot(key), k = key === 'swirl' && B.sw ? 2 : 4; camera.position.lerp(w.pos, Math.min(1, dt * k)); CAM.look.lerp(w.look, Math.min(1, dt * k)); }
    camera.lookAt(CAM.look);
    { const hide = (wk || S.phase === 'glide') && (CAM.t > 0.35 || !CAM.from); K.cut.forEach(m => m.visible = !hide); lampGl.forEach(s => s.visible = !hide); const camIn = Math.abs(camera.position.x) < K.W / 2 - 0.05 && camera.position.z < K.D / 2 - 0.05; K.front.forEach(m => m.visible = !hide && camIn); }
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = ''; S.toastT -= dt; if (S.toastT <= 0) S.toast = null;
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    lampGl.forEach((s, i) => s.material.opacity = 0.28 + Math.sin(t * 2 + i) * 0.03);
    if (upg('fan')) K.fan.rotation.y += dt * 5;
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) S.phase = 'shift'; }
    if (wk) { const before = CREAMERY.shift - S.t; S.t += dt; const left = CREAMERY.shift - S.t; if (!DM.on && left < 10 && Math.ceil(left) < Math.ceil(before)) SND.sfx('clock'); if (S.t >= CREAMERY.shift && !DM.on) endShift(); }
    if (!B || B.step !== 'sauce') SND.squeeze(false); if (!B || !B.sw) SND.pull(false);
    // ---- the serve ----
    if (B && holder.visible) {
      if (B.drop) { B.drop.t = Math.min(1, B.drop.t + dt / 0.25); holder.position.y = B.drop.y + (1 - smooth(0, 1, B.drop.t)) * 0.25; if (B.drop.t >= 1) { B.drop = null; SND.sfx('set'); } }
      if (B.slide) { B.slide.t = Math.min(1, B.slide.t + dt / 0.35); holder.position.x = B.slide.from + (B.slide.to - B.slide.from) * smooth(0, 1, B.slide.t); if (B.slide.t >= 1) B.slide = null; }
      if (B.step === 'carry') { B.carryT = Math.min(1, B.carryT + dt / 0.9); const to = V3(K.dress.x, rimY(B.vessel, T + 0.07), K.dress.z), k = smooth(0, 1, B.carryT); holder.position.lerpVectors(B.carryFrom, to, k); holder.position.y += Math.sin(k * Math.PI) * 0.45;
        if (B.carryT >= 1) { K.turntable.rotation.y = 0; K.turntable.attach(holder); B.step = 'sauce'; SND.sfx('land'); const o = activeOrder(); flash('PICK UP THE ' + (o ? SAUCES[o.sauce].name : '') + ' BOTTLE', '#ffffff', 1.4); } }
      if (B.step === 'sauce' || B.step === 'topping') { K.turntable.rotation.y += dt * (1.8 + spin); spin = damp(spin, 0, 2.5, dt); }
      if (B.step === 'sauce') sauceStep(dt);
      if (B.step === 'topping' && jar.visible) { const p = holderWorld(); jar.position.lerp(V3(p.x + 0.02, p.y + B.topY + 0.17, p.z + 0.04), Math.min(1, dt * 10)); jar.userData.kick = Math.max(0, (jar.userData.kick || 0) - dt * 5); jar.rotation.z = Math.PI * 0.82 + Math.sin(t * 46) * 0.35 * jar.userData.kick; }
      // flying topping bits
      flyM.forEach(m => m.visible = false); flying.forEach((f, i) => { if (i >= flyM.length) return; const k = clamp(f.t / f.dur, 0, 1), m = flyM[i], to = serveG.localToWorld(V3(Math.cos(f.a) * f.r, f.y, Math.sin(f.a) * f.r)); m.position.lerpVectors(f.from, to, k); m.position.y += Math.sin(k * Math.PI) * 0.05; m.material = toon(TOPPINGS[f.k].cols[Math.floor(f.seed * TOPPINGS[f.k].cols.length)]); m.visible = k > 0; }); stepFlying(dt);
      // swirling: the lever is down and soft serve streams out of the nozzle onto your circle
      if (B.sw && B.noz && B.pts.length) { const L = B.pts[B.pts.length - 1], hp = holderWorld(), end = V3(hp.x + L.x, hp.y + L.y + 0.02, hp.z + L.z), top = V3(B.noz.x, B.noz.tipY, B.noz.z), h = Math.max(0.01, top.y - end.y); nozStream.visible = true; nozStream.material = toon(B.flavour === 'chocolate' ? FLAVOURS.chocolate.col : '#f7f0dc'); nozStream.position.set((top.x + end.x) / 2, (top.y + end.y) / 2, (top.z + end.z) / 2); nozStream.scale.set(1, h, 1); nozStream.lookAt(end); nozStream.rotateX(Math.PI / 2); } else nozStream.visible = false;
      // melting: it slumps, it drips, it puddles
      if (B.melting && B.step !== 'vessel' && !B.fly) { const before = B.melt; B.melt = Math.min(100, B.melt + dt * 100 / (MELT_S * (upg('coldPlate') ? 1.4 : 1))); if (Math.floor(before / 25) < Math.floor(B.melt / 25)) SND.sfx('drip'); }
      { const m = B.melt / 100; serveG.scale.set(1 + 0.08 * m, 1 - 0.18 * m, 1 + 0.08 * m); serveG.position.x = m * 0.006; const want = Math.floor(clamp((B.melt - 22) / 13, 0, drips.length)), bot = vesselM ? vesselM.userData.bottom : -0.17, rim = vesselM ? vesselM.userData.rimR : 0.058, cone = B.vessel === 'cone';
        drips.forEach((d, i) => { if (i >= want) { d.m.visible = false; return; } if (!d.m.visible) { d.m.visible = true; d.t = rr(0, 1); d.a = rr(0, 6.28); d.m.material = toon(B.flavour === 'chocolate' ? FLAVOURS.chocolate.col : B.flavour === 'swirl' && i % 2 ? FLAVOURS.swirl.col2 : '#f7f0dc'); } d.t += dt * 0.35; if (d.t > 1) { d.t = 0; d.a = rr(0, 6.28); } const y = bot * d.t * (cone ? 0.85 : 0.9), r = (cone ? rim * (1 - y / bot) : rim * (1 - d.t * 0.25)) + 0.006; d.m.position.set(Math.cos(d.a) * r, y, Math.sin(d.a) * r); });
        if (B.melt > 55 && (B.step === 'sauce' || B.step === 'topping' || B.step === 'serve') && holder.parent === K.turntable) { const p = holderWorld(); puddle.visible = true; puddle.position.set(p.x, T + 0.078, p.z); puddle.scale.setScalar(0.03 + (B.melt - 55) / 45 * 0.1); puddle.material = toon(B.flavour === 'chocolate' ? FLAVOURS.chocolate.col : '#f7f0dc'); } else puddle.visible = false; }
      // handing over
      if (B.fly) { const F = B.fly; F.t = Math.min(1, F.t + dt / 0.45); const f = F.o.f, to = V3(f.position.x, 1.05, f.position.z - 0.25), k = smooth(0, 1, F.t); holder.position.lerpVectors(F.from, to, k); holder.position.y += Math.sin(k * Math.PI) * 0.4; holder.rotation.y += dt * 8; if (F.t >= 1) { B.fly = null; serveTo(F.o); } } }
    else { nozStream.visible = false; flyM.forEach(m => m.visible = false); }
    // ---- people ----
    if (wk) { S.next -= dt; const maxQ = DM.on ? 1 : Math.min(3, 1 + Math.ceil(S.day / 2)); if (S.next <= 0 && orders.filter(o => o.st !== 'leave').length < maxQ && (S.t < CREAMERY.shift - 15 || DM.on)) { newOrder(S.firstForced); S.firstForced = false; S.next = DM.on ? 1.5 : Math.max(9, 18 - S.day * 1.5) * rr(0.85, 1.15); } if (!activeOrder()) pickActive(); }
    stepCustomers(dt, wk);
    const greet = S.phase === 'intro' || S.phase === 'done'; ben.rotation.y = damp(ben.rotation.y, 0.3, 4, dt); ben.userData.mood = greet ? 'excited' : 'happy'; kit.animFox(ben, dt, 0);
    if (greet && BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32);
    if (S.phase !== 'walk') { jamil.userData.lookAt = wk && B && holder.visible ? holderWorld() : greet ? ben.position.clone().setY(1.6) : null; jamil.userData.talking = S.sayT > 0 && /^JAMIL/.test(S.say); } kit.animFox(jamil, dt, 0); regulars.forEach(f => kit.animFox(f, dt, 0));
    // ---- register ----
    regDisp.visible = !!(S.pay || S.payOut); drawer.position.z = damp(drawer.position.z, REG.z - 0.05 - (S.pay ? 0.26 : 0), 10, dt);
    for (const m of coinsOut) { if (m.userData.t < 1) { m.userData.t = Math.min(1, m.userData.t + dt / 0.35); const k = m.userData.t, a = V3(drawer.position.x, drawer.position.y + 0.08, drawer.position.z); m.position.lerpVectors(a, m.userData.target, k); m.position.y += Math.sin(k * Math.PI) * 0.12; m.rotation.x = k * 6; if (k >= 1) { m.rotation.x = 0; SND.sfx('coinLand'); } } }
    if (S.payOut) { S.payOut.t += dt; const o = S.payOut.o; if (o) { const to = V3(o.f.position.x, K.pass.y + 0.03, K.pass.z); coinsOut.forEach(m => m.position.lerp(to, Math.min(1, dt * 4))); if (RG.bill()) RG.bill().position.lerp(V3(REG.x, REG.y + 0.02, REG.z - 0.2), Math.min(1, dt * 6)); } if (S.payOut.t > 1.1) { S.payOut = null; payProps(null); } }
    if (DM.on && wk) demoStep(dt);
    updHint(dt); musicStep(); stepPolish(dt); }
  let FR = 0, FRERR = ''; function frame() { raf = requestAnimationFrame(frame); FR++; const dt = Math.min(0.05, clock.getDelta()); try { if (!PAUSE) step(dt); } catch (e) { FRERR = String(e && e.stack || e); } renderer.render(scene, camera); try { drawOverlay(dt); } catch (e) { FRERR = 'OV ' + String(e && e.stack || e); } hudT -= dt; if (hudT <= 0) { hudT = 0.1; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);

  // ---------- HUD state for the page ----------
  const STEP_LABEL = { vessel: 'CUP', flavour: 'FLAVOUR', swirl: 'SWIRL', sauce: 'SAUCE', topping: 'TOPPING', serve: 'SERVE' };
  function hud() { const o = activeOrder(), ring = S.day <= 2 || S.demo, st = B ? (B.step === 'carry' ? 'sauce' : B.step) : 'vessel', si = STEPS.indexOf(st);
    const ticket = q => { const act = q.id === S.active, sz = SIZES[q.size], sw = B && B.swirl;
      return { id: q.id, name: CUSTOMERS[q.ci].name, role: CUSTOMERS[q.ci].role, active: act, waiting: q.st === 'wait', price: q.price, patW: Math.round(Math.max(0, q.pat / q.patMax) * 100) + '%', patCol: q.pat / q.patMax < 0.3 ? '#ec3013' : q.pat / q.patMax < 0.6 ? '#ffd23a' : '#22c55e',
        short: [VESSELS[q.vessel].name, sz.name[0], FLAVOURS[q.flavour].name.slice(0, 5), SAUCES[q.sauce].name.slice(0, 5), TOPPINGS[q.top].name.slice(0, 5)].join('·'),
        lines: [[VESSELS[q.vessel].name + ' · ' + sz.name, act && B.vessel === q.vessel && (!sw || Math.abs(sw.coils - sz.coils) <= 0.6)], [FLAVOURS[q.flavour].name, act && B.flavour === q.flavour], [SAUCES[q.sauce].name + ' SAUCE', act && B.sauceN > 0 && B.sauce === q.sauce], [TOPPINGS[q.top].name, act && B.mine > 0]].map(([t, ok]) => ({ t, ok: !!ok })) }; };
    const chips = !work() || !B || S.react || S.pay ? [] : st === 'vessel' ? ['cone', 'cup'].map(k => ({ id: 'vessel:' + k, label: VESSELS[k].name, col: k === 'cone' ? '#d9a95e' : '#f2b7c6', want: ring && o && o.vessel === k, on: false }))
      : st === 'flavour' ? FK.map(k => ({ id: 'flavour:' + k, label: FLAVOURS[k].name, col: k === 'swirl' ? '#c98a9c' : FLAVOURS[k].col, want: ring && o && o.flavour === k, on: B.flavour === k }))
      : st === 'sauce' && B.step === 'sauce' ? availSauces().map(k => ({ id: 'sauce:' + k, label: SAUCES[k].name, col: SAUCES[k].bottle, want: ring && o && o.sauce === k, on: B.sauce === k }))
      : st === 'topping' ? availTops().map(k => ({ id: 'topping:' + k, label: TOPPINGS[k].name, col: TOPPINGS[k].cols[0], want: ring && o && o.top === k, on: B.top === k })) : [];
    const acts = !work() || !B || S.react || S.pay || B.fly ? [] : [...(B.step === 'sauce' ? [{ id: 'done', label: 'DONE ▸', hot: sauceCov() >= 0.75 }] : []), ...(B.step === 'topping' ? [...(touch ? [{ id: 'phone', label: S.shakeOn ? 'PHONE SHAKE ON' : 'SHAKE PHONE', hot: false }] : []), { id: 'shake', label: 'SHAKE', hot: !!B.top }, { id: 'done', label: 'DONE ▸', hot: topCov() >= 0.8 }] : []), ...(B.step === 'serve' && o ? [{ id: 'hand', label: 'HAND TO ' + CUSTOMERS[o.ci].name, hot: true }] : [])];
    let meter = null; if (work() && B && !S.react && !S.pay) { const w = wantCoils(), sz = o ? SIZES[o.size].name : 'MEDIUM';
      if (B.step === 'swirl') { const c = B.coils, inB = Math.abs(c - w) <= 0.5, dev = B.sw && B.sw.n > 4 ? Math.sqrt(Math.max(0, B.sw.sq / B.sw.n - Math.pow(B.sw.sum / B.sw.n, 2))) : 0; meter = { title: sz + ' · ' + w + ' TURNS', zone: c < w - 0.5 ? 'KEEP GOING' : inB ? 'JUST RIGHT · LET GO' : 'OVERFILLED', col: c > w + 0.5 ? '#ec3013' : inB ? '#22c55e' : '#ffffff', v: c / MAX_COILS * 100, lo: (w - 0.5) / MAX_COILS * 100, hi: (w + 0.5) / MAX_COILS * 100, extra: B.sw ? (dev < 0.12 ? 'ROUND ●●●' : dev < 0.25 ? 'ROUND ●●○' : 'WOBBLY ●○○') : '' }; }
      else if (B.step === 'sauce' && B.sauce) { const cv = Math.round(sauceCov() * 100); meter = { title: SAUCES[B.sauce].name + ' · COVER IT', zone: cv + '% COVERED', col: cv >= 75 ? '#22c55e' : cv >= 45 ? '#e6b45a' : '#ffffff', v: cv, lo: 75, hi: 100, extra: '' }; }
      else if (B.step === 'topping' && B.top) { const cv = Math.round(topCov() * 100), wt = wantTops(); meter = { title: TOPPINGS[B.top].name + ' · SPREAD IT', zone: B.tops + ' ON · ' + cv + '%', col: B.mine > wt * 1.7 ? '#ec3013' : cv >= 80 ? '#22c55e' : '#ffffff', v: cv, lo: 80, hi: 100, extra: B.mine > wt * 1.7 ? 'TOO MUCH' : '' }; } }
    const sv = save.data;
    return { phase: S.phase, day: S.day, left: Math.max(0, CREAMERY.shift - S.t), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0,
      gold: sv.gold, uniform: !!save.flag('creameryUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), sizes: availSizes().map(k => SIZES[k].name), sauces: availSauces().map(k => SAUCES[k].name), tops: availTops().map(k => TOPPINGS[k].name), best: save.stat(SAVE.bestServe, 0),
      tickets: orders.filter(q => q.st === 'wait' || q.st === 'walk').sort((a, b) => a.spot - b.spot).map(ticket), step: st, steps: STEPS.map((k, i) => ({ id: k, label: STEP_LABEL[k], st: i < si ? 'done' : i === si ? 'on' : 'todo' })),
      chips, acts, meter, melt: B && B.melting && work() ? Math.round(B.melt) : null, flash: S.flash, say: S.say, hint: HINT && !S.react && !S.pay ? HINT.text : '', pay: S.pay ? { ...S.pay } : null, done: S.done, musicOn: !S.musicOff, shakeOn: S.shakeOn, touch,
      react: S.react ? { word: S.react.word, col: S.react.col, line: S.react.line, who: S.react.who, stars: S.react.stars, tip: S.react.tip, score: S.react.score, note: S.react.note, rows: S.react.rows } : null,
      demo: DM.on ? { cap: DM.cap, key: DM.key, n: DM.served, of: 2 } : null,
      walk: S.phase === 'walk' ? { prompt: !S.dialog && nearJamil() ? 'TALK · JAMIL' : null, dialog: dialogHud(), toast: S.toast, quest: save.flag('ic.hired') ? 'THE CREAMERY · Jamil has a shift for you · TALK at the counter' : 'THE CREAMERY · Jamil is hiring · TALK at the counter' } : null }; }
  function emit() { onState(hud()); }
  frame();
  const blur = () => {};
  return {
    hud, setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    startShift: () => startShift(false), endShift, toIntro, walk: () => walkStart(), takeBreak: () => walkStart({ x: 3.0, z: -0.6, yaw: Math.PI * 0.75 }), demoStart, demoStop: () => demoStop(), giveCoin, buyUpgrade, toggleMusic, phoneShake,
    selectOrder(id) { if (orders.some(o => o.id === id && (o.st === 'wait' || o.st === 'walk'))) { S.active = id; SND.sfx('ui'); } },
    chip(id) { if (!B || !work() || DM.on) return; doPick(id); }, act(id) { if (!B || !work() || DM.on) return; if (id === 'done') doneStep(); else if (id === 'shake') shake(1); else if (id === 'phone') phoneShake(); else if (id === 'hand') handOver(activeOrder()); else if (id === 'bin') binIt(); },
    binIt,
    // ---- the standard Game HUD contract (walk mode) ----
    start() {}, talk, choose, closeDialog() { S.dialog = null; }, nextLine, clearToast() { S.toast = null; },
    melee() { if (S.phase !== 'walk' || !walker) return; walker.userData.waveT = 0.7; SND.sfx('whoosh'); if (nearJamil()) toast('JAMIL: "Easy! That machine cost more than the building."', 2.6); },
    range() { if (S.phase === 'walk') toast('JAMIL: "No lasers in the cold room."', 2.2); }, jump() { if (S.phase === 'walk' && walker) { walker.userData.hop = 1; SND.sfx('hop'); } }, meleeUp() {},
    useItem() { toast('Save it for the road. You are in the only cold room on Kufa.', 2.4); }, closeWheel() {}, skipTime() {}, setHudPad() {}, setStick(x, y) { S.stick.x = x; S.stick.y = y; }, setPaused(v) { PAUSE = !!v; },
    eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy(dx = 0, dy = 0) { WCAM.yaw -= dx; WCAM.pitch = clamp(WCAM.pitch + dy, 0.08, 1.1); WCAM.userT = Date.now(); }, zoomBy(f = 1) { WCAM.dist = clamp(WCAM.dist * f, 2.2, 6.5); }, getCam() { return { dist: WCAM.dist, pitch: WCAM.pitch }; }, setCam(c = {}) { if (c.dist) WCAM.dist = clamp(c.dist, 2.2, 6.5); if (c.pitch != null) WCAM.pitch = clamp(c.pitch, 0.08, 1.1); },
    mapData() { const w = walker || ben; return { p: [w.position.x, w.position.z, w.rotation.y], b: [['MACHINE', K.machine.x, K.machine.z], ['COUNTER', K.dress.x, K.fz], ['DOOR', K.door.x, K.door.z]], f: [[jamil.position.x, jamil.position.z], ...regulars.map(f => [f.position.x, f.position.z])], e: [], q: [K.talkAt.x, K.talkAt.z, 'JAMIL'] }; },
    setMinimap() {}, toggleSound() { audio.setMuted && audio.setMuted(!audio.muted); if (MUS.el) MUS.el.muted = audio.muted; if (audio.muted) { SND.pull(false); SND.squeeze(false); } return !audio.muted; }, cycleWeather() {},
    // ---- test hooks ----
    _steer() { const w = walker.position, dx = K.talkAt.x - w.x, dz = K.talkAt.z - w.z, a = Math.atan2(dx, dz), rel = a - (WCAM.yaw + Math.PI); S.stick.x = Math.sin(rel) * -1; S.stick.y = Math.cos(rel); if (!K.walkable(w.x + Math.sin(a) * 0.4, w.z + Math.cos(a) * 0.4)) { S.stick.x = 1; S.stick.y = 0.3; } },
    _frames: () => FR + ' ' + FRERR, _cast: () => ({ ben, jamil, scene }), _fast(sec = 1) { for (let i = 0; i < sec * 30; i++) step(1 / 30); emit(); }, _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); drawOverlay(dt); emit(); }, _skip(tl) { S.t = Math.max(S.t, CREAMERY.shift - tl); }, _state: () => S, _B: () => B, _ring: () => B && B.step === 'swirl' ? ringCenter() : null, _scr: () => ({ serve: B && holder.visible ? scr(holderWorld()) : null, cust: orders.filter(o => o.st === 'wait').map(o => ({ id: o.id, ...scr(V3(o.f.position.x, 1.6, o.f.position.z)) })) }), _orders: () => orders, _K: K, _walker: () => walker, _grade: o => gradeFor(o || activeOrder()),
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); el.removeEventListener('pointerdown', onDown); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); removeEventListener('devicemotion', onMotion); document.removeEventListener('visibilitychange', onVis); SND.stopAll(); if (MUS.el) MUS.el.pause(); renderer.dispose(); renderer.domElement.remove(); ov.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
}
