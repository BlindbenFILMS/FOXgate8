// 8 GATES — JIDDA · JETSKI CANAL RUN [jidda jetski]. Stand-alone minigame on the shared driving engine (vehicle-lab.js, opts.course + opts.lake with a canal-shaped water test).
// Zone frame: worlds/jidda-plan.js zones.jetski (starts in jTown's west harbour, local +z = west toward Corsair Reach).
// ONE RUN: 1 STONE ARCHES (town canals) → 2 WOOD BRIDGES → 3 ROPE BRIDGES (checkpoint gates on a CLOCK, tokens, treasure, pirates) → 4 OPEN SEA rival race → 5 the Corsair Captain's GALLEON → 6 ESCAPE to the Pirate Hideout.
// Host + blackboard: JAMOS (harbour board). The jet ski keeps its own buttons: 1 HOSE · 2 TRICK · 3 HOP.
import { save } from '../../engine/save.js';
import { creatureKit } from '../../engine/creature-kit.js';
import { corsairFamily } from '../../engine/corsair-kit.js';
import { JIDDA, toLocal, landmarks } from '../../worlds/jidda-plan.js';

export const JETSKI_RUN = { name: 'JETSKI CANAL RUN', room: 'jiddaJetski', bestKey: 'jidda.jetski.best.v1' };
// canals in the zone's local frame. hw = half width (m). Reusable by the real Jidda map.
export const WIDEN = 1.33;   // Ben, session 32: canals 33% wider
export const CANALS = [
  { k: 'basin', hw: 24, pts: [[0, -104], [0, -62]] },
  { k: 'stone', hw: 14, pts: [[0, -62], [0, 124]] },
  { k: 'wood', hw: 14, pts: [[0, 124], [-46, 168], [-60, 206], [-60, 252]] },
  { k: 'rope', hw: 12, pts: [[-60, 252], [-24, 296], [34, 318], [56, 372]] },
  { k: 'side', hw: 8, pts: [[-124, 22], [124, 22]] },
  { k: 'side', hw: 8, pts: [[-124, 82], [114, 82]] },
  { k: 'side', hw: 8, pts: [[-46, 168], [10, 176], [22, 146], [0, 124]] },
  { k: 'side', hw: 9, pts: [[-60, 206], [-140, 222], [-176, 196]] },
  { k: 'side', hw: 9, pts: [[-24, 296], [-110, 322], [-150, 378]] },
  { k: 'side', hw: 9, pts: [[34, 318], [112, 286], [142, 248]] },
];
CANALS.forEach(c => { c.hw = Math.round(c.hw * WIDEN * 10) / 10; });
export const MAIN = [[0, -62], [0, 124], [-46, 168], [-60, 206], [-60, 252], [-24, 296], [34, 318], [56, 372]];
const SEG = []; CANALS.forEach(c => { for (let i = 0; i < c.pts.length - 1; i++) SEG.push([c.pts[i][0], c.pts[i][1], c.pts[i + 1][0], c.pts[i + 1][1], c.hw]); });
const coastZ = x => 356 + 8 * Math.sin(x * 0.035) + 5 * Math.sin(x * 0.011 + 1);
const HIDE = (() => { const [x, z] = toLocal('jetski', ...JIDDA.islands.jReachHideout.at); return { x: Math.round(x), z: Math.round(z), r: 36 }; })();
export const SEA_ISLES = [{ x: HIDE.x, z: HIDE.z, r: HIDE.r, k: 'hideout' }, { x: -92, z: 470, r: 9 }, { x: 104, z: 548, r: 8 }, { x: 236, z: 628, r: 14 }, { x: -232, z: 626, r: 12 }, { x: -246, z: 420, r: 10 }, { x: 248, z: 410, r: 10 }];
function segDist(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, u = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(px - ax - dx * u, pz - az - dz * u); }
// > 0 on land (metres from the nearest water), < 0 in a canal or the sea
export function inland(x, z) { let m = 1e9; for (const s of SEG) { const d = segDist(x, z, s[0], s[1], s[2], s[3]) - s[4]; if (d < m) m = d; } return Math.min(m, coastZ(x) - z); }
const isle = (x, z, pad) => { for (const I of SEA_ISLES) if (Math.hypot(x - I.x, z - I.z) < I.r + pad) return true; return false; };
export function isWater(x, z) { return inland(x, z) < -1.3 && !isle(x, z, 1.6); }            // the course pushes you back here
const waterLoose = (x, z) => inland(x, z) < -0.1 && !isle(x, z, 0.4);                       // the engine's test (never trips before the course does)
export const JET_LAKE = { x0: -280, x1: 280, z0: -112, z1: 692, amp: 1, seg: 80, test: waterLoose };
export function heightAt(x, z) { const I = inland(x, z), town = z < 132; if (I < 0) return Math.max(-3, I * 0.35); return town ? Math.min(1.6, 0.4 + I * 1.1) : Math.min(1.5, I / 5 * 1.5) + (I > 8 ? 0.5 * (1 + Math.sin(x * 0.08) * Math.sin(z * 0.06)) * Math.min(1, (I - 8) / 6) : 0); }
// the main canal as a measured line: at(s) → point, direction, half width
const PL = []; let PATH_LEN = 0; for (let i = 0; i < MAIN.length - 1; i++) { const [ax, az] = MAIN[i], [bx, bz] = MAIN[i + 1], L = Math.hypot(bx - ax, bz - az); PL.push({ ax, az, bx, bz, L, s0: PATH_LEN, ux: (bx - ax) / L, uz: (bz - az) / L }); PATH_LEN += L; }
const hwAt = s => (s < 336 ? 14 : 12) * WIDEN, secAt = s => s < 186 ? 1 : s < 336 ? 2 : 3;
function at(s) { let p = PL[PL.length - 1]; for (const q of PL) if (s <= q.s0 + q.L) { p = q; break; } const u = s - p.s0; return { x: p.ax + p.ux * u, z: p.az + p.uz * u, ux: p.ux, uz: p.uz, hw: hwAt(s), s }; }
const side = (s, sd, off) => { const p = at(s); return { x: p.x + p.uz * sd * off, z: p.z - p.ux * sd * off, p }; };
function pathS(x, z) { let best = 1e9, bs = 0; for (const p of PL) { const u = Math.max(0, Math.min(p.L, (x - p.ax) * p.ux + (z - p.az) * p.uz)), d = Math.hypot(x - p.ax - p.ux * u, z - p.az - p.uz * u); if (d < best) { best = d; bs = p.s0 + u; } } return [bs, best]; }
const landOut = (s, sd, off, need = 3) => { let q = side(s, sd, off); for (let k = 0; k < 12 && inland(q.x, q.z) < need; k++) q = side(s, sd, off += 2); return q; };
// RIDE SCENES (Ben, polish pass): little gags on the bank that play out as you blast past, in gaps where buildings / trees thin out
export const RIDE_SCENES = [{ k: 'balloons', s: 17, sd: 1 }, { k: 'laundry', s: 52, sd: -1 }, { k: 'steak', s: 124, sd: 1 }, { k: 'waiter', s: 176, sd: -1 }, { k: 'bananas', s: 236, sd: 1 }, { k: 'hammock', s: 300, sd: -1 }, { k: 'parrot', s: 386, sd: 1 }, { k: 'kids', s: 466, sd: -1 }];
const SPOT = RIDE_SCENES.map(S => { const mk = s => { const p = at(s), off = hwAt(s) + 3, nx = p.uz * S.sd, nz = -p.ux * S.sd, x = p.x + nx * off, z = p.z + nz * off; return { ...S, s, x, z, yaw: Math.atan2(-nx, -nz), ok: inland(x, z) > 2.2 && inland(x + p.ux * 6, z + p.uz * 6) > 1.5 && inland(x - p.ux * 6, z - p.uz * 6) > 1.5 && inland(x + nx * 5, z + nz * 5) > 5 }; };
  for (const d of [0, 6, -6, 12, -12, 18, -18, 24, -24, 30, -30]) { const q = mk(S.s + d); if (q.ok) return q; } return mk(S.s); });
const nearScene = (x, z, r) => SPOT.some(q => Math.hypot(x - q.x, z - q.z) < r + 3);

export function jetskiRun(X) {
  const { THREE, scene, M, toon, rr, clamp, damp } = X, LK = JET_LAKE, touch = X.touch;
  const ck = creatureKit({ THREE, toon, M }); ck.register('corsair', corsairFamily({ THREE, toon, M, fk: X.kit }));
  const tmp = new THREE.Vector3(), V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const R = { t: 0, score: 0, tokens: 0, totalTokens: 0, kills: 0, totalBots: 0, treasure: 0, totalTreasure: 0, deaths: 0, timeUps: 0, hp: 100, hurt: 0, banner: '', bannerT: 0, state: 'ready', board: true, armed: false, done: null, down: 0, seen: new Set(), cp: null, cpI: -1, cpS: 0, clock: 40, hose: 8, hoseT: 0, hoseUse: 0, hoseHeld: false, refT: 0, race: null, tries: 0, place: 0, ramCd: 0, bumpCd: 0, phase: 'canals', sec: 1, secHit: [0, 0, 0, 0], bonus: 0, since: [], s: 0, lastW: null, tangleT: 0, prevRoll: null, spinSeen: false, ports: 0 };
  const ink = toon('#201e1d'), red = toon('#ec3013'), white = toon('#f3f2f2'), wood = toon('#8a5a32'), darkWood = toon('#5b3a22'), plank = toon('#b07a4a'), stoneM = toon('#cfc6b6'), rope = toon('#c9a26a'), goldM = toon('#e6b45a'), iron = toon('#2b2f36');
  const lineMat0 = new THREE.LineBasicMaterial({ color: 0x201e1d });
  const SPR = (mat, p, s) => { const sp = new THREE.Sprite(mat); if (p) sp.position.copy(p); if (s) sp.scale.copy(s); return sp; };
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const glow = (col, op = 0.8) => new THREE.SpriteMaterial({ map: X.glowTex, color: col, transparent: true, depthWrite: false, opacity: op, blending: THREE.AdditiveBlending });
  const banner = (s, t = 3.5) => { R.banner = s; R.bannerT = t; };
  const W = (x, z) => X.waveH(x, z, X.St.t), S = () => X.V.spec, noOut = m => { m.castShadow = false; return m; };
  X.camera.far = 1100; X.camera.updateProjectionMatrix(); X.St.zoom = 1 / 0.9;   // Ben: world 10% smaller on screen (camera pulled back), HUD unchanged
  scene.background = new THREE.Color('#bfe4ef'); scene.fog = new THREE.Fog(0xbfe4ef, 170, 540); X.sun.intensity = 2.4;

  // ---------- LAND: one heightfield over the canal islands (banks follow the canal test exactly) ----------
  { const HX0 = LK.x0, HX1 = LK.x1, HZ0 = LK.z0, HZ1 = 380, nx = touch ? 112 : 140, nz = touch ? 98 : 124;
    const hg = new THREE.PlaneGeometry(HX1 - HX0, HZ1 - HZ0, nx, nz); hg.rotateX(-Math.PI / 2); hg.translate((HX0 + HX1) / 2, 0, (HZ0 + HZ1) / 2);
    const pos = hg.attributes.position, col = new Float32Array(pos.count * 3), cc = new THREE.Color(), C0 = { bed: new THREE.Color('#c8b27a'), quay: new THREE.Color('#b3aa9b'), pave: new THREE.Color('#ddd3c2'), sand: new THREE.Color('#ecdcab'), g1: new THREE.Color('#6fae4f'), g2: new THREE.Color('#5c9a43') };
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), I = inland(x, z), town = z < 132; pos.setY(i, heightAt(x, z));
      if (I < 0) cc.copy(C0.bed); else if (town) cc.copy(I < 3 ? C0.quay : C0.pave); else if (I < 4) cc.copy(C0.sand); else cc.copy(C0.g1).lerp(C0.g2, 0.5 + 0.5 * Math.sin(x * 0.13 + z * 0.09));
      col.set([cc.r, cc.g, cc.b], i * 3); }
    hg.setAttribute('color', new THREE.BufferAttribute(col, 3)); hg.computeVertexNormals();
    const land = new THREE.Mesh(hg, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: X.grad })); land.receiveShadow = true; scene.add(land);
    const grass = toon('#6fae4f'), farSea = new THREE.MeshBasicMaterial({ color: 0x2b9bd0 });
    for (const [x0, x1, z0, z1] of [[-1400, LK.x0, -900, 340], [LK.x1, 1400, -900, 340], [LK.x0, LK.x1, -900, LK.z0]]) noOut(M(new THREE.BoxGeometry(x1 - x0, 1, z1 - z0), grass, (x0 + x1) / 2, 1.0, (z0 + z1) / 2, null, 0));
    for (const [x0, x1, z0, z1] of [[-3000, LK.x0, 330, 3000], [LK.x1, 3000, 330, 3000], [LK.x0, LK.x1, LK.z1, 3000]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), farSea); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, -0.05, (z0 + z1) / 2); scene.add(m); } }

  // ---------- TOWN (section 1): stone quays + canal houses with red roofs ----------
  { const segs = []; CANALS.forEach(c => { if (c.k === 'basin' || c.k === 'stone' || (c.k === 'side' && c.pts[0][1] > 0 && c.pts[0][1] < 100)) for (let i = 0; i < c.pts.length - 1; i++) segs.push([...c.pts[i], ...c.pts[i + 1], c.hw]); });
    const walls = []; for (const [ax, az, bx, bz, hw] of segs) { const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L; for (let t = 2.5; t < L; t += 5) for (const sd of [-1, 1]) { const x = ax + ux * t + uz * sd * (hw + 0.6), z = az + uz * t - ux * sd * (hw + 0.6); if (z > 128 || inland(x, z) < 0.3) continue; walls.push([x, z, Math.atan2(ux, uz)]); } }
    const wm = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 2.4, 5.1), toon('#a59c8e'), walls.length), o3 = new THREE.Object3D(); walls.forEach(([x, z, a], i) => { o3.position.set(x, 0.4, z); o3.rotation.set(0, a, 0); o3.updateMatrix(); wm.setMatrixAt(i, o3.matrix); }); scene.add(wm);
    const winT = CT(128, 128, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#3b4a57'; for (const [x, y] of [[18, 16], [74, 16], [18, 58], [74, 58]]) g.fillRect(x, y, 34, 26); g.fillStyle = '#5a3a22'; g.fillRect(50, 92, 28, 36); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 0, w, 6); });
    // street trees on the quays first (houses keep clear of them, so the rows break up)
    const trees = []; for (const [ax, az, bx, bz, hw] of segs) { const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L; for (let t = rr(4, 12); t < L; t += rr(14, 22)) for (const sd of [-1, 1]) { if (Math.random() < 0.35) continue; const x = ax + ux * t + uz * sd * (hw + 4.2), z = az + uz * t - ux * sd * (hw + 4.2), I = inland(x, z); if (z > 126 || I < 3 || I > 7 || nearScene(x, z, 9) || Math.hypot(x + 37, z + 76) < 12) continue; trees.push([x, z, rr(0.9, 1.3)]); } }
    { const tt = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.22, 2.6, 6).translate(0, 1.3, 0), toon('#6b4a2c'), trees.length), tc = new THREE.InstancedMesh(new THREE.SphereGeometry(1.5, 10, 8), new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: X.grad }), trees.length), TC = ['#4f8a3c', '#5f9e46', '#3f7a35'].map(c => new THREE.Color(c));
      trees.forEach(([x, z, s], i) => { const y = heightAt(x, z); o3.position.set(x, y, z); o3.rotation.set(0, 0, 0); o3.scale.setScalar(s); o3.updateMatrix(); tt.setMatrixAt(i, o3.matrix); o3.position.set(x, y + 3.4 * s, z); o3.scale.set(s, s * 0.9, s); o3.updateMatrix(); tc.setMatrixAt(i, o3.matrix); tc.setColorAt(i, TC[i % 3]); }); o3.scale.set(1, 1, 1); scene.add(tt, tc); }
    const houses = []; for (let x = -150; x <= 150; x += 9) for (let z = -104; z <= 126; z += 9) { const hx = x + rr(-2, 2), hz = z + rr(-2, 2), tower = Math.random() < 0.05, w = tower ? rr(3.4, 4.4) : rr(5, 8.5), dp = tower ? w : rr(5, 8.5), I = inland(hx, hz);
      if (I < Math.max(w, dp) / 2 + 1.8 || Math.hypot(hx + 37, hz + 76) < 16 || nearScene(hx, hz, 16) || trees.some(t => Math.hypot(t[0] - hx, t[1] - hz) < Math.max(w, dp) / 2 + 2)) continue; if (I > 22 && Math.random() > 0.3) continue; if (Math.random() < 0.14) continue;
      const gx = inland(hx + 2, hz) - inland(hx - 2, hz), gz = inland(hx, hz + 2) - inland(hx, hz - 2), near = I < 11;
      houses.push({ x: hx, z: hz, w, dp, h: tower ? rr(15, 21) : (2 + Math.floor(rr(0, 2.99))) * 3.1 + rr(0, 0.8), a: near ? Math.atan2(-gx, -gz) : Math.round(rr(0, 3)) * Math.PI / 2, flat: !tower && Math.random() < 0.3, tower, near, k: Math.floor(rr(0, 6)) }); }
    const N = Math.min(houses.length, touch ? 120 : 190), HS = houses.slice(0, N), hm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshToonMaterial({ map: winT, gradientMap: X.grad }), N);
    const PAL = ['#f2c9a0', '#f4a582', '#9fd3c7', '#f3f2f2', '#f6dc8a', '#c7d8f0'].map(c => new THREE.Color(c)), ROOF = [new THREE.Color('#c4553a'), new THREE.Color('#d9714e'), new THREE.Color('#b8452f')], AWN = ['#ec3013', '#2f6db5', '#2e8b57', '#f6c445', '#ffffff'].map(c => new THREE.Color(c)), FLW = ['#ec3013', '#f472b6', '#a78bfa', '#f6c445'].map(c => new THREE.Color(c));
    const hip = HS.filter(h => !h.flat), flat = HS.filter(h => h.flat), near = HS.filter(h => h.near && !h.tower), white0 = () => new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: X.grad });
    const rm = new THREE.InstancedMesh(new THREE.ConeGeometry(0.75, 1, 4).rotateY(Math.PI / 4), white0(), hip.length), par = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), white0(), flat.length), gar = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), toon('#5f9e46'), flat.length);
    const awn = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.12, 1.3), white0(), near.length), flw = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.32, 0.4), white0(), near.length), chim = hip.filter((h, i) => i % 3 === 0 && !h.tower), chm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.55, 1.6, 0.55), toon('#8d6e5a'), chim.length);
    const y0 = h => heightAt(h.x, h.z) - 0.3, put = (mesh, i, x, y, z, a, sx, sy, sz, tilt = 0) => { o3.rotation.order = 'YXZ'; o3.position.set(x, y, z); o3.rotation.set(tilt, a, 0); o3.scale.set(sx, sy, sz); o3.updateMatrix(); mesh.setMatrixAt(i, o3.matrix); };
    HS.forEach((h, i) => { put(hm, i, h.x, y0(h) + h.h / 2, h.z, h.a, h.w, h.h, h.dp); hm.setColorAt(i, PAL[(h.k + i) % PAL.length]); });
    hip.forEach((h, i) => { put(rm, i, h.x, y0(h) + h.h + (h.tower ? 2.5 : 1.2), h.z, h.a, h.w, h.tower ? 5 : 2.4, h.dp); rm.setColorAt(i, ROOF[i % 3]); });
    flat.forEach((h, i) => { put(par, i, h.x, y0(h) + h.h + 0.25, h.z, h.a, h.w + 0.3, 0.6, h.dp + 0.3); par.setColorAt(i, PAL[(h.k + 3) % PAL.length].clone().multiplyScalar(0.82)); put(gar, i, h.x, y0(h) + h.h + 0.5, h.z, h.a, h.w * 0.55, 0.6, h.dp * 0.55); });
    near.forEach((h, i) => { const fx = Math.sin(h.a), fz = Math.cos(h.a), d = h.dp / 2; put(awn, i, h.x + fx * (d + 0.6), y0(h) + 2.8, h.z + fz * (d + 0.6), h.a, h.w * 0.8, 1, 1, 0.35); awn.setColorAt(i, AWN[(h.k + i) % AWN.length]); put(flw, i, h.x + fx * (d + 0.2), y0(h) + 4.4, h.z + fz * (d + 0.2), h.a, h.w * 0.6, 1, 1); flw.setColorAt(i, FLW[i % FLW.length]); });
    chim.forEach((h, i) => { const c = Math.cos(h.a), s = Math.sin(h.a); put(chm, i, h.x + c * h.w * 0.25, y0(h) + h.h + 1.6, h.z - s * h.w * 0.25, h.a, 1, 1, 1); });
    o3.rotation.order = 'XYZ'; o3.rotation.set(0, 0, 0); o3.scale.set(1, 1, 1);
    hm.castShadow = !touch; scene.add(hm, rm, par, gar, awn, flw, chm);
    // bunting strung across the canal, high enough for the camera
    { const tri = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-0.3, 0), new THREE.Vector2(0.3, 0), new THREE.Vector2(0, -0.8)])), runs = [26, 90, 140, 182], per = 18, fl = new THREE.InstancedMesh(tri, new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide }), runs.length * per), BC = ['#ec3013', '#f6c445', '#38bdf8', '#f3f2f2', '#a3e635'].map(c => new THREE.Color(c)); let n = 0;
      for (const s of runs) { const p = at(s), hw = p.hw + 3, ax = p.x + p.uz * hw, az = p.z - p.ux * hw, bx = p.x - p.uz * hw, bz = p.z + p.ux * hw, ang = Math.atan2(-(bz - az), bx - ax), pts = [];
        for (const [x, z] of [[ax, az], [bx, bz]]) M(new THREE.CylinderGeometry(0.12, 0.14, 13.5, 6), ink, x, 6.6, z, null, 0);
        for (let k = 0; k <= 20; k++) { const u = k / 20; pts.push(V3(ax + (bx - ax) * u, 13 - 1.6 * 4 * u * (1 - u), az + (bz - az) * u)); } scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat0));
        for (let k = 0; k < per; k++) { const u = (k + 0.5) / per; o3.position.set(ax + (bx - ax) * u, 13 - 1.6 * 4 * u * (1 - u), az + (bz - az) * u); o3.rotation.set(0, ang, 0); o3.updateMatrix(); fl.setMatrixAt(n, o3.matrix); fl.setColorAt(n, BC[k % BC.length]); n++; } }
      o3.rotation.set(0, 0, 0); scene.add(fl); } }

  // ---------- TROPICAL ISLANDS (sections 2-3 + the sea): palms, pirate huts ----------
  const palms = [];
  for (let x = -270; x <= 270; x += 8) for (let z = 132; z <= 360; z += 8) { const px = x + rr(-3, 3), pz = z + rr(-3, 3), I = inland(px, pz); if (I > 2.5 && I < 34 && Math.random() < 0.34 && !nearScene(px, pz, 11)) palms.push([px, pz, heightAt(px, pz)]); }
  for (const I of SEA_ISLES) for (let k = 0; k < (I.k ? 14 : 2); k++) { const a = rr(0, 6.3), d = I.k ? rr(I.r * 0.75, I.r * 0.95) : rr(0, I.r * 0.4); palms.push([I.x + Math.cos(a) * d, I.z + Math.sin(a) * d, I.k ? 2 : 3]); }
  { const N = Math.min(palms.length, touch ? 130 : 220), trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.32, 1, 5).translate(0, 0.5, 0), toon('#8a6238'), N), crown = new THREE.InstancedMesh(new THREE.ConeGeometry(2.6, 1.3, 7), toon('#3f8f3a'), N), o3 = new THREE.Object3D();
    for (let i = 0; i < N; i++) { const [x, z, y] = palms[i], h = rr(5, 8), tx = rr(-0.25, 0.25), tz = rr(-0.25, 0.25); o3.position.set(x, y - 0.2, z); o3.rotation.set(tx, 0, tz); o3.scale.set(1, h, 1); o3.updateMatrix(); trunk.setMatrixAt(i, o3.matrix); const top = V3(0, h, 0).applyEuler(o3.rotation); o3.position.set(x + top.x, y + top.y, z + top.z); o3.rotation.set(Math.PI, rr(0, 3), 0); o3.scale.set(1, 1, 1); o3.updateMatrix(); crown.setMatrixAt(i, o3.matrix); }
    scene.add(trunk, crown); }
  const huts = [], HUTC = ['#9a6b3c', '#4fb3a9', '#e8806a', '#e9c46a'].map(c => new THREE.Color(c));
  { for (const [s, sd] of [[214, 1], [238, -1], [262, 1], [292, -1], [312, 1], [356, -1], [384, 1], [412, -1], [436, 1], [462, -1], [490, 1]]) { const q = landOut(s, sd, hwAt(s) + 8, 5); if (!nearScene(q.x, q.z, 15)) huts.push([q.x, q.z, heightAt(q.x, q.z), Math.atan2(q.p.ux, q.p.uz)]); }
    const N = huts.length, body = new THREE.InstancedMesh(new THREE.BoxGeometry(5, 3.4, 5), new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: X.grad }), N), thatch = new THREE.InstancedMesh(new THREE.ConeGeometry(4.4, 2.8, 6), toon('#d7b56d'), N), o3 = new THREE.Object3D();
    huts.forEach(([x, z, y, a], i) => { o3.position.set(x, y + 1.6, z); o3.rotation.set(0, a, 0); o3.updateMatrix(); body.setMatrixAt(i, o3.matrix); body.setColorAt(i, HUTC[i % 4]); o3.position.set(x, y + 4.7, z); o3.updateMatrix(); thatch.setMatrixAt(i, o3.matrix); }); scene.add(body, thatch); }

  // bank clutter: rocks at the waterline, crates + barrels by the huts
  { const rocks = []; for (let x = -270; x <= 270; x += 6) for (let z = 134; z <= 352; z += 6) { const px = x + rr(-2, 2), pz = z + rr(-2, 2), I = inland(px, pz); if (I > 0.2 && I < 2.6 && Math.random() < 0.16 && !nearScene(px, pz, 9)) rocks.push([px, pz, rr(0.5, 1.5)]); }
    const N = Math.min(rocks.length, touch ? 60 : 110), rk = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: X.grad }), N), o3 = new THREE.Object3D(), RC = ['#8d8478', '#a1978a', '#6f675d'].map(c => new THREE.Color(c));
    for (let i = 0; i < N; i++) { const [x, z, s] = rocks[i]; o3.position.set(x, heightAt(x, z) - 0.2, z); o3.rotation.set(rr(0, 3), rr(0, 3), 0); o3.scale.set(s, s * 0.7, s * 0.9); o3.updateMatrix(); rk.setMatrixAt(i, o3.matrix); rk.setColorAt(i, RC[i % 3]); } scene.add(rk);
    const cr = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), toon('#a8743f'), huts.length * 2), br = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.45, 0.45, 1.1, 10), toon('#7a4f2a'), huts.length);
    huts.forEach(([x, z, y, a], i) => { const c = Math.cos(a), s = Math.sin(a); for (let k = 0; k < 2; k++) { o3.position.set(x + c * (3.4 + k * 1.1), y + 0.5 + (k ? 0 : 0), z - s * (3.4 + k * 1.1)); o3.rotation.set(0, a + k * 0.4, 0); o3.scale.setScalar(k ? 0.8 : 1); o3.updateMatrix(); cr.setMatrixAt(i * 2 + k, o3.matrix); } o3.position.set(x - c * 3.3, y + 0.55, z + s * 3.3); o3.scale.setScalar(1); o3.updateMatrix(); br.setMatrixAt(i, o3.matrix); }); scene.add(cr, br); }

  // ---------- far landmarks from the Jidda plan (mountain, castle, lighthouses, windmills, Corsair Reach) ----------
  const spinners = [];
  { const CEN = [0, 300], haze = c => { const m = toon(c); m.fog = false; return m; };
    for (const [kind, , lx, lz, r, h, key] of landmarks('jetski')) { if (key === 'jTown' || key === 'jReachHideout') continue; const dx = lx - CEN[0], dz = lz - CEN[1], d = Math.hypot(dx, dz); const inside = lx > LK.x0 && lx < LK.x1 && lz > LK.z0 && lz < LK.z1; if (inside && inland(lx, lz) < 3) continue;
      const far = d > 520, k = far ? 520 / d : 1, x = CEN[0] + dx * k, z = CEN[1] + dz * k, g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(k); scene.add(g); const mat = c => far ? haze(c) : toon(c);
      if (kind === 'mountain') { M(new THREE.ConeGeometry(r, h, 9), mat('#7d7468'), 0, h / 2 - 4, 0, g, 0); M(new THREE.ConeGeometry(r * 0.55, h * 0.45, 8), mat('#968b7c'), r * 0.3, h * 0.2, r * 0.1, g, 0); M(new THREE.CylinderGeometry(r * 1.05, r * 1.1, 10, 12), mat('#5c9a43'), 0, 0, 0, g, 0); }
      else if (kind === 'castle') { M(new THREE.CylinderGeometry(r, r * 1.2, 10, 10), mat('#5c9a43'), 0, 2, 0, g, 0); for (const [a, b, hh] of [[-12, -6, 34], [12, -6, 30], [0, 10, 44], [-10, 12, 26]]) { M(new THREE.CylinderGeometry(4, 4.4, hh, 8), mat('#d9cfbf'), a, hh / 2 + 6, b, g, 0); M(new THREE.ConeGeometry(5, 9, 8), mat('#3c6fb4'), a, hh + 10, b, g, 0); } M(new THREE.BoxGeometry(26, 16, 22), mat('#cfc4b2'), 0, 14, 2, g, 0); }
      else if (kind === 'lighthouse') { for (let s2 = 0; s2 < 6; s2++) M(new THREE.CylinderGeometry(2.6 - s2 * 0.2, 2.8 - s2 * 0.2, 4, 10), mat(s2 % 2 ? '#ec3013' : '#f3f2f2'), 0, 2 + s2 * 4, 0, g, 0); M(new THREE.CylinderGeometry(1.8, 1.8, 2.4, 10), mat('#fff3c4'), 0, 26, 0, g, 0); g.add(SPR(glow(0xfff1c4, 0.8), V3(0, 26, 0), V3(10, 10, 1))); M(new THREE.CylinderGeometry(9, 11, 3, 10), mat('#8d8478'), 0, 0, 0, g, 0); }
      else if (kind === 'windmill') { M(new THREE.CylinderGeometry(2.4, 3.4, 13, 8), mat('#f3f2f2'), 0, 6.5, 0, g, 0); M(new THREE.ConeGeometry(3.2, 3, 8), mat('#c4553a'), 0, 14.5, 0, g, 0); const hub = new THREE.Group(); hub.position.set(0, 12, 3.2); g.add(hub); for (let b = 0; b < 4; b++) { const bl = M(new THREE.BoxGeometry(1.4, 8, 0.2), mat('#e8dcc4'), 0, 4, 0, null, 0); const arm = new THREE.Group(); arm.rotation.z = b * Math.PI / 2; arm.add(bl); hub.add(arm); } spinners.push(hub); }
      else { const m = M(new THREE.SphereGeometry(1, 16, 8), mat(r > 100 ? '#5c9a43' : '#d9c48f'), 0, -2, 0, g, 0); m.scale.set(r, Math.max(10, r * 0.12), r * 0.8); for (let p = 0; p < 6; p++) { const a = p / 6 * 6.28, pr = r * 0.5; M(new THREE.CylinderGeometry(1, 1.4, 14, 5), mat('#8a6238'), Math.cos(a) * pr, 10, Math.sin(a) * pr, g, 0); M(new THREE.ConeGeometry(7, 3, 7), mat('#3f8f3a'), Math.cos(a) * pr, 17, Math.sin(a) * pr, g, 0).rotation.x = Math.PI; } } } }

  // ---------- HARBOUR START: Jamos on the quay + the harbour board ----------
  const BD = { x: -36, z: -80 }, start = { x: 0, z: -92, yaw: 0 }; R.cp = { ...start };
  const boardCv = document.createElement('canvas'); boardCv.width = 1600; boardCv.height = 900; drawBoard(boardCv.getContext('2d'));
  const boardTex = new THREE.CanvasTexture(boardCv); boardTex.colorSpace = THREE.SRGBColorSpace; boardTex.anisotropy = 8;
  const bg = new THREE.Group(); bg.position.set(BD.x, 1.6, BD.z); bg.rotation.y = Math.PI / 2 + 0.3; scene.add(bg);
  for (const sd of [1, -1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.6), new THREE.MeshBasicMaterial({ map: boardTex })); pl.position.set(0, 3.3, 0.08 * sd); if (sd < 0) pl.rotation.y = Math.PI; bg.add(pl); }
  M(new THREE.BoxGeometry(6.8, 4.0, 0.14), toon('#7a4f2a'), 0, 3.3, 0, bg, 0.03); for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.18, 5.4, 0.18), toon('#7a4f2a'), sx * 3.0, 2.5, -0.25, bg, 0.01);
  { for (let z = -100; z <= -66; z += 6) for (const sx of [-1, 1]) M(new THREE.CylinderGeometry(0.22, 0.22, 2.8, 6), wood, sx * 31.4, 0.6, z, null, 0); for (const [x, z, c] of [[-20, -66, '#38bdf8'], [19, -98, '#a3e635'], [20, -72, '#f472b6']]) { const sk = new THREE.Group(); sk.position.set(x, 0.1, z); scene.add(sk); M(new THREE.BoxGeometry(1.8, 0.7, 4.4), toon(c), 0, 0, 0, sk, 0.02); M(new THREE.BoxGeometry(1.9, 0.14, 4.5), white, 0, 0.36, 0, sk, 0); } }
  const coinP = { x: 0.46, y: 0.925 };
  function drawBoard(g, P = false) {
    const W0 = P ? 900 : 1600, H0 = P ? 1600 : 900, J = (n = 1.6) => (Math.random() - 0.5) * n * 2;
    g.fillStyle = '#7a4f2a'; g.fillRect(0, 0, W0, H0); g.strokeStyle = 'rgba(40,24,10,0.35)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { g.beginPath(); const y = Math.random() * H0; g.moveTo(0, y); g.bezierCurveTo(W0 * 0.3, y + J(8), W0 * 0.6, y + J(8), W0, y + J(6)); g.stroke(); }
    const x0 = 34, y0 = 34, w = W0 - 68, h = H0 - 98; g.fillStyle = '#1f2b27'; g.fillRect(x0, y0, w, h);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.beginPath(); g.ellipse(x0 + Math.random() * w, y0 + Math.random() * h, 60 + Math.random() * 200, 20 + Math.random() * 60, Math.random() * 3, 0, 7); g.fill(); }
    const CH = '#f2f1e8', YL = '#f5e08a', RD = '#ff9a8a', BL = '#9fd8f5';
    const txt = (s, x, y, size, col = CH, wt = 800, fam = 'Archivo, sans-serif') => { g.font = `${wt} ${size}px ${fam}`; g.textBaseline = 'alphabetic'; g.fillStyle = col; g.globalAlpha = 0.92; g.fillText(s, x, y); g.globalAlpha = 0.28; g.fillText(s, x + 1.6, y - 1.2); g.globalAlpha = 1; };
    const HF = '"Caveat", "Segoe Print", "Bradley Hand", cursive', hw = (s, x, y, size, col = YL) => txt(String(s).toUpperCase(), x, y, size, col, 700, HF);
    const ln = (pts, col = CH, wd = 5, close) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = 0.9; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + J(), y + J()) : g.moveTo(x + J(), y + J())); if (close) g.closePath(); g.stroke(); g.globalAlpha = 1; };
    const circ = (x, y, r, col = CH, wd = 5) => { g.strokeStyle = col; g.lineWidth = wd; g.globalAlpha = 0.9; g.beginPath(); g.arc(x + J(), y + J(), r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; };
    const arrow = (x1, y1, x2, y2, col = YL) => { ln([[x1, y1], [(x1 + x2) / 2 + 12, (y1 + y2) / 2 - 10], [x2, y2]], col, 4); const a = Math.atan2(y2 - y1, x2 - x1); ln([[x2 - Math.cos(a - 0.5) * 22, y2 - Math.sin(a - 0.5) * 22], [x2, y2], [x2 - Math.cos(a + 0.5) * 22, y2 - Math.sin(a + 0.5) * 22]], col, 4); };
    const T1 = 'JETSKI CANAL RUN', T2 = 'JIDDA HARBOUR  ·  JAMOS';
    { let ts = P ? 92 : 112; g.font = `900 ${ts}px Archivo, sans-serif`; const tw = g.measureText(T1).width, cap = W0 - 86 - 70; if (tw > cap) ts = Math.floor(ts * cap / tw); if (P) { ts = Math.floor(ts * 0.9); g.font = `900 ${ts}px Archivo, sans-serif`; txt(T1, (W0 - g.measureText(T1).width) / 2, 160, ts, CH, 900); } else txt(T1, 86, 160, ts, CH, 900); }
    if (P) { g.font = '800 32px Archivo, sans-serif'; const sw = g.measureText(T2).width; txt(T2, (W0 - sw) / 2, 214, 32, YL, 800); ln([[(W0 - sw - 40) / 2, 238], [(W0 + sw + 40) / 2, 234]], CH, 4); } else { txt(T2, 90, 214, 32, YL, 800); ln([[88, 238], [760, 234]], CH, 4); }
    g.save(); if (P) { g.translate(-590, 250); g.scale(0.92, 0.92); } else g.translate(0, 90);
    // the jet ski, side view, bow to the right: hull, seat, bars, rider, hose stream off the bow
    ln([[900, 350], [1330, 350], [1460, 318], [1400, 410], [940, 410]], CH, 6, true); ln([[930, 380], [1410, 380]], RD, 5);
    ln([[1000, 350], [1020, 312], [1170, 312], [1190, 350]], CH, 5); ln([[1250, 350], [1275, 270], [1320, 266]], CH, 5);
    circ(1130, 232, 22, CH, 5); ln([[1113, 218], [1117, 192], [1129, 212]], CH, 4); ln([[1133, 212], [1145, 192], [1149, 218]], CH, 4); ln([[1130, 254], [1150, 312]], CH, 5); ln([[1140, 270], [1280, 268]], CH, 4);
    for (let k = 0; k < 4; k++) circ(1478 + k * 22, 300 - k * 6, 5 + k, BL, 4);
    for (let k = 0; k < 6; k++) ln([[860 + k * 110, 440], [890 + k * 110, 428], [920 + k * 110, 440], [950 + k * 110, 452]], BL, 3);
    hw('1  Hose', 1330, 228, 34, BL); arrow(1420, 238, 1490, 290, BL);
    hw('2  Sword', 860, 150, 34, RD); { g.strokeStyle = RD; g.lineWidth = 4; g.globalAlpha = 0.9; g.beginPath(); g.arc(1130, 232, 54, Math.PI * 1.1, Math.PI * 1.85); g.stroke(); g.globalAlpha = 1; } arrow(980, 160, 1080, 190, RD);
    hw('3  Hop', 700, 490, 40, YL); arrow(790, 455, 900, 400);
    hw('Flies off kickers!', 990, 512, 32, CH);
    g.restore();
    g.save(); if (P) { g.translate(-10, 470); g.scale(1.12, 1.12); }
    const rows = [['STICK', 'WASD', 'Steer + throttle', CH], ['1', 'J', 'Hose  ·  knock pirates off', BL], ['2', 'K', 'Sword  ·  slash pirates', RD], ['3', 'SPACE', 'Hop  ·  over nets + barrels', YL], ['EYE', 'HOLD FOR 360 VIEW AND TAP FOR POV', 'Look around', CH]];
    rows.forEach(([k, kb, d, col], i) => { const y = 330 + i * 104, cx = 150, cy = y - 14;
      if (k === 'STICK') { circ(cx, cy, 31, CH, 4); g.globalAlpha = 0.5; g.fillStyle = CH; g.beginPath(); g.arc(cx + 6, cy - 9, 14, 0, 7); g.fill(); g.globalAlpha = 1; circ(cx + 6, cy - 9, 14, CH, 4); for (const [ax, ay, rot] of [[0, -44, 0], [0, 44, Math.PI], [-44, 0, -Math.PI / 2], [44, 0, Math.PI / 2]]) { const s = Math.sin(rot), c = Math.cos(rot), Q = (px, py) => [cx + ax + px * c - py * s, cy + ay + px * s + py * c]; ln([Q(-7, 5), Q(0, -3), Q(7, 5)], CH, 3); } }
      else if (k === 'EYE') { circ(cx, cy, 30, CH, 4); ln([[cx - 19, cy], [cx - 9, cy - 8], [cx, cy - 10], [cx + 9, cy - 8], [cx + 19, cy], [cx + 9, cy + 8], [cx, cy + 10], [cx - 9, cy + 8]], CH, 3, true); g.globalAlpha = 0.9; g.fillStyle = CH; g.beginPath(); g.arc(cx, cy, 4.5, 0, 7); g.fill(); g.globalAlpha = 1; }
      else { g.globalAlpha = 0.9; g.strokeStyle = col; g.lineWidth = 9; g.beginPath(); g.arc(cx, cy, 30, 0, 7); g.stroke(); g.globalAlpha = 1; circ(cx, cy, 22, CH, 2); g.font = '900 34px Archivo, sans-serif'; g.textAlign = 'center'; g.fillStyle = CH; g.fillText(k, cx, cy + 12); g.textAlign = 'left'; }
      txt(kb, 230, y - 24, 18, '#b9c4bf', 800); txt(d, 230, y + 4, 32, CH, 700); });
    g.restore();
    { const s = 'Gates on the clock · race · showdown · hideout  ·  grab tokens'; if (P) { const s1 = 'GATES · RACE · SHOWDOWN · HIDEOUT', avail = 900 - 70 * 2; let sz = 46; g.font = `700 ${sz}px ${HF}`; let w1 = g.measureText(s1).width; if (w1 > avail) { sz = Math.floor(sz * avail / w1); g.font = `700 ${sz}px ${HF}`; w1 = g.measureText(s1).width; } hw(s1, (900 - w1) / 2, 1384, sz); g.font = `700 58px ${HF}`; const w2 = g.measureText('GRAB TOKENS').width, cw = 76, gap = 40, tot = w2 + gap + cw, x2 = (900 - tot) / 2; const mid = (1384 + 8 + 1536) / 2; hw('Grab tokens', x2, mid + 20, 58); coinP.x = (x2 + w2 + gap + cw / 2) / 900; coinP.y = mid / 1600; } else { const cap = 960, right = 1440, by = 778; let sz = 50; g.font = `700 ${sz}px ${HF}`; let wd = g.measureText(s.toUpperCase()).width; if (wd > cap) { sz = Math.floor(sz * cap / wd); g.font = `700 ${sz}px ${HF}`; wd = g.measureText(s.toUpperCase()).width; } hw(s, right - wd, by, sz); } }
    g.fillStyle = '#5e3c1f'; g.fillRect(0, H0 - 64, W0, 64); g.fillStyle = '#7a4f2a'; g.fillRect(0, H0 - 64, W0, 10); for (let k = 0; k < 4; k++) { g.fillStyle = ['#f2f1e8', '#f5e08a', '#ff9a8a', '#9fd8f5'][k]; g.fillRect(260 + k * 120, H0 - 48, 70, 16); }
    for (let i = 0; i < 5000; i++) { g.fillStyle = 'rgba(31,43,39,0.55)'; g.fillRect(x0 + Math.random() * w, y0 + Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); }
  }
  const boardCvP = document.createElement('canvas'); boardCvP.width = 900; boardCvP.height = 1600; drawBoard(boardCvP.getContext('2d'), true);
  let boardURL = boardCv.toDataURL('image/jpeg', 0.92), boardURLP = boardCvP.toDataURL('image/jpeg', 0.92);
  try { if (!document.getElementById('font-caveat')) { const lk = document.createElement('link'); lk.id = 'font-caveat'; lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap'; document.head.appendChild(lk); }
    const redo = () => { drawBoard(boardCv.getContext('2d')); drawBoard(boardCvP.getContext('2d'), true); boardTex.needsUpdate = true; boardURL = boardCv.toDataURL('image/jpeg', 0.92); boardURLP = boardCvP.toDataURL('image/jpeg', 0.92); };
    for (const ms of [300, 2500]) setTimeout(() => document.fonts.load('700 50px "Caveat"').then(fs => { if (fs && fs.length) redo(); }).catch(() => {}), ms); } catch (e) {}
  // JAMOS, Jidda's general, runs the harbour board
  const jamos = X.kit.makeFox({ ...X.CAST.player, torso: ['#93c5fd', '#1e3a8a', '#0f172a'], outfit: 'coat', crest: 'J', gear: 'none', mood: 'determined' }); jamos.position.set(BD.x - 0.6, 1.6, BD.z + 5); jamos.rotation.y = Math.PI / 2; scene.add(jamos); const JY = jamos.position.y;
  const bubCv = document.createElement('canvas'); bubCv.width = 768; bubCv.height = 160; const bubTex = new THREE.CanvasTexture(bubCv); bubTex.colorSpace = THREE.SRGBColorSpace;
  const bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubTex, transparent: true, depthTest: false })); bub.scale.set(6, 1.25, 1); bub.position.set(BD.x - 0.6, 5.4, BD.z + 5); bub.renderOrder = 9; scene.add(bub); let bubText = '';
  function say(s) { if (s === bubText) return; bubText = s; const g = bubCv.getContext('2d'); g.clearRect(0, 0, 768, 160); g.font = '800 40px Archivo, sans-serif'; const w = Math.min(760, g.measureText(s).width + 56); g.fillStyle = '#f3f2f2'; g.fillRect(4, 4, w - 8, 112); g.lineWidth = 6; g.strokeStyle = '#201e1d'; g.strokeRect(4, 4, w - 8, 112); g.beginPath(); g.moveTo(40, 116); g.lineTo(70, 116); g.lineTo(44, 150); g.closePath(); g.fillStyle = '#201e1d'; g.fill(); g.textBaseline = 'middle'; g.fillText(s, 28, 62); bubTex.needsUpdate = true; }
  say('Read the board, rider!'); let hop = 0; const cheer = () => { hop = 1; };

  // ---------- LAMPS along the main canal (lanterns in town, tiki torches in the islands) ----------
  const lanterns = [], lampSpr = [];
  for (let s = 8; s < PATH_LEN; s += 22) for (const sd of [-1, 1]) { const q = landOut(s, sd, hwAt(s) + 2.5, 0.8); lanterns.push([q.x, q.z, heightAt(q.x, q.z), secAt(s)]); }
  { const n = lanterns.length, o3 = new THREE.Object3D(), pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 4.6, 6), ink, n), cap = new THREE.InstancedMesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: X.grad }), n), cR = new THREE.Color('#ec3013'), cO = new THREE.Color('#f59e0b');
    lanterns.forEach(([x, z, y, sc], i) => { o3.position.set(x, y + 2.3, z); o3.updateMatrix(); pole.setMatrixAt(i, o3.matrix); o3.position.set(x, y + 4.7, z); o3.updateMatrix(); cap.setMatrixAt(i, o3.matrix); cap.setColorAt(i, sc === 1 ? cR : cO); const sp = SPR(glow(sc === 1 ? 0xffd98a : 0xffb347, 0.85), V3(x, y + 4.8, z), V3(2.2, 2.2, 1)); scene.add(sp); lampSpr.push({ sp, x, z }); });
    scene.add(pole, cap); }

  // ---------- BRIDGES: 1 stone arches → 2 wood → 3 rope (deck high enough for the camera to pass under) ----------
  const lineMat = new THREE.LineBasicMaterial({ color: 0x5a3a1a });
  const BRIDGES = [[37, 'stone'], [67, 'stone'], [112, 'stone', 'cut'], [167, 'stone', 'drop'], [225, 'wood', 'cut'], [275, 'wood'], [320, 'wood', 'cut'], [372, 'rope', 'cut'], [425, 'rope', 'cut'], [478, 'rope', 'drop']].map(([s, kind, job]) => {
    const p = at(s), hw = p.hw, span = hw * 2 + 10, Y = kind === 'stone' ? 7.6 : 7.2, g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = Math.atan2(p.uz, -p.ux); scene.add(g);
    const b = { s, kind, job, x: p.x, z: p.z, ux: p.ux, uz: p.uz, px: p.uz, pz: -p.ux, hw, Y, top: Y + (kind === 'stone' ? 1.2 : kind === 'wood' ? 0.5 : 0.3), g, dropped: false };
    // group local z = across the canal (span), local x = along the canal
    if (kind === 'stone') { for (const sz of [-1, 1]) M(new THREE.BoxGeometry(5.2, Y + 2, 4.4), stoneM, 0, (Y + 2) / 2 - 1, sz * (hw + 3), g, 0.03); M(new THREE.BoxGeometry(5.2, 1.2, span), stoneM, 0, Y + 0.6, 0, g, 0.03); for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.5, 1, span), toon('#b9ae9c'), sx * 2.4, Y + 1.7, 0, g, 0.02);
      for (const sx of [-2.3, 2.3]) { const a = M(new THREE.TorusGeometry(hw + 1.5, 0.7, 6, 18, Math.PI), toon('#b3a894'), sx, 0, 0, g, 0); a.rotation.y = Math.PI / 2; a.scale.set(1, (Y - 0.3) / (hw + 1.5), 1); }
      for (const sz of [-1, 1]) g.add(SPR(glow(0xffd98a, 0.8), V3(2.4, Y + 3, sz * (span / 2 - 1)), V3(2, 2, 1))); }
    else if (kind === 'wood') { for (const sz of [-1, 1]) for (const sx of [-1.8, 1.8]) M(new THREE.CylinderGeometry(0.3, 0.34, Y + 2, 6), darkWood, sx, (Y + 2) / 2 - 1, sz * (hw + 1.5), g, 0.02); M(new THREE.BoxGeometry(4.2, 0.5, span), wood, 0, Y + 0.25, 0, g, 0.03); for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.2, 0.2, span), darkWood, sx * 2, Y + 1.2, 0, g, 0); M(new THREE.BoxGeometry(4.4, 0.6, 0.6), darkWood, 0, Y - 0.4, 0, g, 0); }
    else { const geo = new THREE.BoxGeometry(3, 0.25, span, 1, 1, 14), pa = geo.attributes.position; for (let i = 0; i < pa.count; i++) { const zz = pa.getZ(i) / (span / 2); pa.setY(i, pa.getY(i) - 1.4 * (1 - zz * zz)); } geo.computeVertexNormals(); M(geo, plank, 0, Y, 0, g, 0.02);
      for (const sz of [-1, 1]) for (const sx of [-1.6, 1.6]) M(new THREE.CylinderGeometry(0.22, 0.26, Y + 4, 6), darkWood, sx, (Y + 4) / 2 - 1, sz * (span / 2 - 0.5), g, 0.01);
      for (const sx of [-1.6, 1.6]) { const pts = []; for (let k = 0; k <= 16; k++) { const zz = -span / 2 + 0.5 + k / 16 * (span - 1), q = zz / (span / 2); pts.push(V3(sx, Y + 1.3 - 1.4 * (1 - q * q) + (Math.abs(q) > 0.92 ? 1.6 : 0), zz)); } const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat); g.add(l); } b.top = Y + 0.3 - 1.4; }
    return b; });
  // monkeys sit on some bridge rails and cheer as you pass under
  const MONK = []; { const fur = toon('#7a4a26'), face = toon('#e8c9a0'); for (const bi of [1, 3, 5, 7, 8]) { const b = BRIDGES[bi], off = rr(-b.hw * 0.6, b.hw * 0.6), g = new THREE.Group(); g.position.set(b.x + b.px * off + b.ux * 2.2, b.top + 0.6, b.z + b.pz * off + b.uz * 2.2); scene.add(g); M(new THREE.SphereGeometry(0.45, 10, 8), fur, 0, 0, 0, g, 0.02); M(new THREE.SphereGeometry(0.32, 10, 8), fur, 0, 0.6, 0.05, g, 0.02); M(new THREE.SphereGeometry(0.2, 8, 6), face, 0, 0.56, 0.24, g, 0); const tail = M(new THREE.TorusGeometry(0.35, 0.06, 5, 10, 4), fur, 0, 0, -0.45, g, 0); tail.rotation.y = Math.PI / 2; const arms = []; for (const sx of [-1, 1]) { const a = new THREE.Group(); a.position.set(sx * 0.4, 0.2, 0); g.add(a); M(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 5), fur, 0, 0.3, 0, a, 0); arms.push(a); } MONK.push({ g, arms, y0: g.position.y, t: rr(0, 6), jump: 0 }); } }

  // ---------- CHECKPOINT GATES on the clock + section signs ----------
  const GATE_S = [60, 140, 200, 250, 300, 350, 400, 450, 505], NGT = GATE_S.length;
  const GTS = GATE_S.map((s, i) => { const p = at(s), w = p.hw - 1.5, g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = Math.atan2(p.ux, p.uz); scene.add(g); const glows = [];
    for (const sx of [-1, 1]) { for (let k = 0; k < 4; k++) M(new THREE.CylinderGeometry(0.34, 0.34, 1.1, 10), k % 2 ? white : red, sx * w, -0.4 + k * 1.1, 0, g, 0.012); const gl = SPR(glow(0xffd98a, 0.9), V3(sx * w, 4.4, 0), V3(2.4, 2.4, 1)); g.add(gl); glows.push(gl); }
    const t = CT(512, 128, (c, ww, hh) => { for (let a = 0; a < 32; a++) for (let b = 0; b < 2; b++) { c.fillStyle = (a + b) % 2 ? '#201e1d' : '#f3f2f2'; c.fillRect(a * 16, b * 16, 16, 16); } c.fillStyle = '#201e1d'; c.fillRect(0, 32, ww, hh - 32); c.fillStyle = '#ffd23a'; c.font = '900 70px Archivo, sans-serif'; c.textBaseline = 'middle'; c.fillText('GATE ' + (i + 1) + '  +10 S', 20, 82); });
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(w * 2, w * 2 / 4), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); pm.position.set(0, 10.5, 0); pm.rotation.y = Math.PI; g.add(pm);
    for (const sx of [-1, 1]) M(new THREE.CylinderGeometry(0.12, 0.12, 6.4, 5), ink, sx * w, 7.6, 0, g, 0);
    return { s, x: p.x, z: p.z, ux: p.ux, uz: p.uz, hw: p.hw, g, glows, done: false }; });
  function sign(n, s0, txt) { const p = at(s0), w = p.hw + 2, t = CT(1024, 256, (g, ww, hh) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, ww, hh); g.fillStyle = '#ec3013'; g.fillRect(16, 16, 224, 224); g.fillStyle = '#f3f2f2'; g.font = '900 170px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(n, 70, 136); let fs = 104; g.font = `900 ${fs}px Archivo, sans-serif`; while (g.measureText(txt).width > ww - 300 && fs > 50) { fs -= 4; g.font = `900 ${fs}px Archivo, sans-serif`; } g.fillText(txt, 272, 136); });
    const g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = Math.atan2(p.ux, p.uz) + Math.PI; scene.add(g);
    for (const sx of [-w, w]) { M(new THREE.CylinderGeometry(0.35, 0.4, 13, 8), ink, sx, 6, 0, g, 0.02); g.add(SPR(glow(0xffd98a, 0.85), V3(sx, 12.8, 0), V3(2.4, 2.4, 1))); }
    M(new THREE.BoxGeometry(w * 2 + 1, 0.7, 0.7), ink, 0, 12.4, 0, g, 0.02); const pm = new THREE.Mesh(new THREE.PlaneGeometry(12, 3), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); pm.position.set(0, 10.6, 0); g.add(pm); }
  sign('1', 14, 'STONE ARCHES'); sign('2', 190, 'WOOD BRIDGES'); sign('3', 342, 'ROPE BRIDGES'); sign('4', 498, 'OPEN SEA');

  // ---------- kickers ----------
  { const p = at(410); X.addRamp({ x: p.x + p.uz * 4, z: p.z - p.ux * 4, yaw: Math.atan2(p.ux, p.uz), w: 7, l: 6, h: 2.2, top: 0 }, '#c9a463'); }
  X.addRamp({ x: -40, z: 456, yaw: 0, w: 9, l: 6, h: 2.4, top: 0 }, '#c9a463'); X.addRamp({ x: 104, z: 470, yaw: 0.2, w: 9, l: 6, h: 2.4, top: 0 }, '#c9a463');

  // ---------- pickups: 8-tokens, treasure chests, PRESSURE barrels (hose), repair kits ----------
  const coinTex = CT(128, 128, (g) => { g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#a8792e'; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.stroke(); g.fillStyle = '#201e1d'; g.font = '900 72px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 64, 70); });
  coinTex.center.set(0.5, 0.5); coinTex.rotation = Math.PI / 2; const coinGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.16, 22); coinGeo.rotateX(Math.PI / 2); const faceM = new THREE.MeshBasicMaterial({ map: coinTex }), coinMats = [goldM, faceM, faceM];
  const bcM = [goldM.clone(), faceM.clone(), faceM.clone()]; bcM.forEach(m => { m.transparent = true; });
  const bCoins = []; for (const sd of [1, -1]) { const c = new THREE.Mesh(coinGeo, bcM); c.scale.setScalar(0.24); c.position.set((1492 / 1600 - 0.5) * 6.4 * sd, 3.3 + (0.5 - 746 / 900) * 3.6, 0.16 * sd); bg.add(c); bCoins.push(c); }
  const tokens = [];
  function token(x, y, z, kind = 'coin') { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    if (kind === 'coin') { g.add(new THREE.Mesh(coinGeo, coinMats)); g.add(SPR(glow(0xffd23a, 0.55), null, V3(2.4, 2.4, 1))); R.totalTokens++; }
    else if (kind === 'chest') { M(new THREE.BoxGeometry(1.8, 1.0, 1.2), toon('#7a4a26'), 0, 0, 0, g, 0.03); M(new THREE.BoxGeometry(1.84, 0.5, 1.24), toon('#8a5a32'), 0, 0.75, 0, g, 0.02); for (const sx of [-0.6, 0.6]) M(new THREE.BoxGeometry(0.16, 1.56, 1.26), goldM, sx, 0.25, 0, g, 0); M(new THREE.BoxGeometry(0.3, 0.3, 0.1), goldM, 0, 0.4, 0.63, g, 0); g.add(SPR(glow(0xffd23a, 0.75), null, V3(4.2, 4.2, 1))); R.totalTreasure++; }
    else if (kind === 'wrench') { const gr = toon('#22c55e'); M(new THREE.BoxGeometry(0.28, 1.3, 0.2), gr, 0, 0, 0, g, 0.02); M(new THREE.TorusGeometry(0.32, 0.12, 6, 12, 4.6), gr, 0, 0.75, 0, g, 0.02).rotation.z = -0.75; g.add(SPR(glow(0x22c55e, 0.55), null, V3(2.6, 2.6, 1))); }
    else { M(new THREE.CylinderGeometry(0.6, 0.6, 1.4, 12), toon('#38bdf8'), 0, 0, 0, g, 0.02); for (const y of [-0.4, 0.4]) M(new THREE.CylinderGeometry(0.62, 0.62, 0.14, 12), white, 0, y, 0, g, 0); g.add(SPR(glow(0x38bdf8, 0.65), null, V3(2.8, 2.8, 1))); }
    tokens.push({ g, x, y, z, kind, got: false, t: rr(0, 6), back: 0 }); }
  for (let s = 22; s < 500; s += 15) { const p = at(s), off = Math.sin(s * 0.045) * p.hw * 0.45; token(p.x + p.uz * off, 1.6, p.z - p.ux * off); }
  for (const [x, z] of [[-60, 22], [-84, 22], [-108, 22], [60, 22], [84, 22], [108, 22], [-60, 82], [-90, 82], [60, 82], [90, 82], [-100, 216], [-130, 220], [-158, 206], [-6, 174], [18, 160], [-70, 312], [-100, 326], [-132, 352], [78, 300], [104, 290], [128, 266], [24, 404], [100, 440], [-100, 440], [0, 560], [-60, 600], [60, 600]]) token(x, 1.6, z);
  token(-118, 1.4, 22, 'chest'); token(108, 1.4, 82, 'chest'); token(-170, 1.4, 199, 'chest'); token(138, 1.4, 254, 'chest');
  for (const s of [84, 232, 384]) { const p = at(s); token(p.x - p.uz * 6, 1.4, p.z + p.ux * 6, 'pressure'); } token(40, 1.4, 404, 'pressure'); token(-120, 1.4, 500, 'pressure'); token(120, 1.4, 520, 'pressure');
  token(14, 1.4, 160, 'wrench'); { const p = at(436); token(p.x + p.uz * 6, 1.4, p.z - p.ux * 6, 'wrench'); } token(-150, 1.4, 520, 'wrench');

  // ---------- flamingos in the shallows (fly off when you blast past) ----------
  const FLM = []; { const pink = toon('#f49ac1'), beak = toon('#201e1d'), leg = toon('#e57aa6');
    const spots = [[214, 1], [246, -1], [282, 1], [330, -1], [364, 1], [418, -1], [452, 1], [488, -1]].map(([s, sd]) => side(s, sd, hwAt(s) - 2));
    spots.push({ x: -92 + 11, z: 470 }, { x: 104 - 10, z: 548 + 2 });
    for (const q of spots) { const g = new THREE.Group(); g.position.set(q.x, 0, q.z); g.rotation.y = rr(0, 6.3); scene.add(g); const body = M(new THREE.SphereGeometry(0.55, 10, 8), pink, 0, 1.6, 0, g, 0.02); body.scale.set(0.8, 0.7, 1.2); const neck = new THREE.Group(); neck.position.set(0, 1.8, 0.45); g.add(neck); M(new THREE.CylinderGeometry(0.07, 0.08, 1.1, 5), pink, 0, 0.55, 0, neck, 0); M(new THREE.SphereGeometry(0.18, 8, 6), pink, 0, 1.12, 0.08, neck, 0); M(new THREE.ConeGeometry(0.06, 0.3, 5), beak, 0, 1.06, 0.3, neck, 0).rotation.x = 1.9; for (const sx of [-0.12, 0.12]) M(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 4), leg, sx, 0.75, 0, g, 0); const wings = []; for (const sx of [-1, 1]) { const wg = new THREE.Group(); wg.position.set(sx * 0.35, 1.7, 0); g.add(wg); const wm = M(new THREE.BoxGeometry(1.1, 0.06, 0.6), pink, sx * 0.55, 0, 0, wg, 0); wings.push(wg); } FLM.push({ g, neck, wings, hx: q.x, hz: q.z, t: rr(0, 6), fly: 0, back: 0 }); } }

  // ---------- RIDE SCENES: little gags on the bank, timed to play out as you pass ----------
  const SCN = [], cOptsS = touch ? { noPolish: true } : {}, PP = f => f.userData.P, cl01 = k => clamp(k, 0, 1), arc = (a, b, k, h) => a + (b - a) * k + h * 4 * k * (1 - k);
  const fox = (torso, outfit, mood, s = 1) => { const f = X.kit.makeFox({ ...X.CAST.player, torso, outfit, gear: 'none', crest: '', mood }); if (s !== 1) f.scale.multiplyScalar(s); return f; };
  const lookAtC = (g, f, dt, max = 1.3) => { const P = PP(f); if (!P || !P.head) return; const l = g.worldToLocal(tmp.set(X.C.x, g.position.y, X.C.z)); let a = Math.atan2(l.x - f.position.x, l.z - f.position.z) - f.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); P.head.rotation.y = damp(P.head.rotation.y, clamp(a, -max, max), 6, dt); };
  const wSplash = (g, lx, lz, n = 8, r = 1.8) => { const wp = g.localToWorld(tmp.set(lx, 0, lz)); X.spray(tmp.set(wp.x, 0.4, wp.z), n, 3); X.ripple(wp.x, wp.z, r, 0.7); };
  const palmAt = (g, x, z, h) => { M(new THREE.CylinderGeometry(0.2, 0.32, h, 6), toon('#8a6238'), x, h / 2, z, g, 0.01); M(new THREE.ConeGeometry(2.3, 1.2, 7), toon('#3f8f3a'), x, h + 0.2, z, g, 0.01).rotation.x = Math.PI; };
  function monkey() { const fur = toon('#7a4a26'), face = toon('#e8c9a0'), g = new THREE.Group(); M(new THREE.SphereGeometry(0.32, 10, 8), fur, 0, 0.32, 0, g, 0.02); M(new THREE.SphereGeometry(0.24, 10, 8), fur, 0, 0.75, 0.05, g, 0.02); M(new THREE.SphereGeometry(0.15, 8, 6), face, 0, 0.72, 0.2, g, 0); for (const sx of [-0.22, 0.22]) M(new THREE.SphereGeometry(0.08, 6, 5), face, sx, 0.8, 0, g, 0); const tail = M(new THREE.TorusGeometry(0.28, 0.05, 5, 10, 4), fur, 0, 0.3, -0.32, g, 0); tail.rotation.y = Math.PI / 2; const arms = []; for (const sx of [-1, 1]) { const a = new THREE.Group(); a.position.set(sx * 0.28, 0.5, 0); g.add(a); M(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 5), fur, 0, 0.22, 0, a, 0); arms.push(a); }
    return { g, anim(T, busy) { arms.forEach((a, i) => a.rotation.z = (i ? -1 : 1) * (busy ? 2.4 + Math.sin(T * 20) * 0.4 : 0.4 + Math.sin(T * 4 + i) * 0.2)); tail.rotation.z = Math.sin(T * 3) * 0.3; } }; }
  const tm = c => new THREE.MeshToonMaterial({ color: c, gradientMap: X.grad });
  const BUILD = {
    // a balloon seller waves at you with the wrong paw and loses the lot into the sky
    balloons(g) { const v = fox(['#f6c445', '#e0a92c', '#8a5a12'], 'vest', 'happy'); g.add(v);
      const cart = new THREE.Group(); cart.position.set(-1.9, 0, -0.6); g.add(cart); M(new THREE.BoxGeometry(1.6, 0.9, 1), toon('#2f6db5'), 0, 0.75, 0, cart, 0.02); M(new THREE.BoxGeometry(1.7, 0.12, 1.1), white, 0, 1.25, 0, cart, 0); for (const sx of [-0.6, 0.6]) M(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 10), ink, sx, 0.3, 0.55, cart, 0).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.04, 0.04, 2, 5), ink, 0.7, 1.8, -0.4, cart, 0); M(new THREE.ConeGeometry(0.9, 0.5, 8), toon('#ec3013'), 0.7, 2.9, -0.4, cart, 0.01);
      const cols = ['#ec3013', '#f6c445', '#38bdf8', '#a3e635', '#f472b6', '#ffffff', '#a78bfa'], B = cols.map((c, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), tm(c)); m.scale.y = 1.2; g.add(m); return { m, ox: Math.cos(i * 0.9) * 0.55, oy: 1.6 + (i % 3) * 0.45, oz: Math.sin(i * 0.9) * 0.45, x: 0, y: 0, z: 0, vy: 0, free: false }; });
      const sp = new Float32Array(B.length * 6), sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); const st = new THREE.LineSegments(sg, new THREE.LineBasicMaterial({ color: 0x201e1d })); st.frustumCulled = false; g.add(st);
      const HX = -0.45, HY = 2.0, HZ = 0.2;
      return { reset() { B.forEach(b => b.free = false); v.position.y = 0; }, upd(t, dt) { const P = PP(v), T = X.St.t; X.kit.animFox(v, dt, 0, false);
        if (t < 0) { P.arms[1].rotation.x = -2.3; P.arms[0].rotation.x = -0.3; } else if (t < 0.75) { lookAtC(g, v, dt); P.arms[1].rotation.x = -2.5; P.arms[0].rotation.x = -2.6 + Math.sin(T * 20) * 0.5; }
        else if (t < 2.1) { lookAtC(g, v, dt); v.position.y = Math.abs(Math.sin((t - 0.75) * 7)) * 0.5; P.arms.forEach(a => a.rotation.x = -3.0); if (P.head) P.head.rotation.x = -0.5; }
        else { v.position.y = 0; P.arms.forEach(a => a.rotation.x = damp(a.rotation.x, -0.2, 3, dt)); if (P.head) { P.head.rotation.x = damp(P.head.rotation.x, 0.45, 3, dt); P.head.rotation.y = damp(P.head.rotation.y, 0, 3, dt); } }
        const hy = HY + v.position.y;
        B.forEach((b, i) => { if (t >= 0.75) { if (!b.free) { b.free = true; b.x = HX + b.ox; b.y = hy + b.oy; b.z = HZ + b.oz; b.vy = 1.6 + i * 0.22; } b.y += b.vy * dt; b.x += (Math.sin(T * 1.3 + i) * 0.6 + 0.3) * dt; b.z += 0.5 * dt; } else { b.x = HX + b.ox + Math.sin(T * 1.7 + i) * 0.08; b.y = hy + b.oy + Math.sin(T * 2.1 + i) * 0.1; b.z = HZ + b.oz; }
          b.m.position.set(b.x, b.y, b.z); b.m.visible = b.y < 80; const ex = b.free ? b.x + Math.sin(T * 3 + i) * 0.25 : HX, ey = b.free ? b.y - 1.7 : hy, ez = b.free ? b.z : HZ; sp.set([b.x, b.y - 0.5, b.z, ex, ey, ez], i * 6); });
        sg.attributes.position.needsUpdate = true; } }; },
    // a gust takes one red shirt off the line and drops it in the canal
    laundry(g) { for (const sx of [-4, 4]) M(new THREE.CylinderGeometry(0.1, 0.12, 5, 6), darkWood, sx, 2.5, -0.5, g, 0); g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(-4, 4.9, -0.5), V3(0, 4.45, -0.5), V3(4, 4.9, -0.5)]), lineMat0));
      const shirtG = new THREE.PlaneGeometry(1.0, 1.1).translate(0, -0.55, 0), sockG = new THREE.PlaneGeometry(0.32, 0.75).translate(0, -0.37, 0);
      const C2 = ['#f3f2f2', '#38bdf8', '#ec3013', '#f6c445', '#a3e635', '#f472b6'].map((c, i) => { const piv = new THREE.Group(), x = -3 + i * 1.2; piv.position.set(x, 4.9 - 0.45 * (1 - Math.abs(x) / 4), -0.5); g.add(piv); piv.add(new THREE.Mesh(i % 2 ? sockG : shirtG, new THREE.MeshToonMaterial({ color: c, gradientMap: X.grad, side: THREE.DoubleSide }))); return { piv, home: piv.position.clone(), free: false, p: V3(), vy: 0 }; });
      const w = fox(['#f4a582', '#c4553a', '#7a2e1e'], 'dress', 'happy'); w.position.set(5.2, 0, -1.2); w.rotation.y = -0.5; g.add(w); M(new THREE.CylinderGeometry(0.45, 0.35, 0.45, 10), toon('#c9a26a'), 4.3, 0.22, -0.3, g, 0.01);
      const c = C2[2];
      return { reset() { C2.forEach(q => { q.free = false; q.piv.position.copy(q.home); q.piv.rotation.set(0, 0, 0); }); w.position.y = 0; }, upd(t, dt) { const T = X.St.t, P = PP(w), gust = t >= 0.35 && t < 2.2 ? 1 : 0; X.kit.animFox(w, dt, 0, false);
        C2.forEach((q, i) => { if (q.free) return; q.piv.rotation.x = -(Math.sin(T * 2 + i) * 0.12 + gust * (0.9 + Math.sin(T * 12 + i) * 0.4)); q.piv.rotation.z = Math.sin(T * 1.6 + i * 2) * 0.06; });
        if (t >= 0.75 && !c.free && t < 1) { c.free = true; c.p.copy(c.piv.position); c.vy = 2.6; }
        if (c.free) { const water = g.userData.wl; if (c.p.y > water) { c.vy -= 4 * dt; c.p.y += c.vy * dt; c.p.z += 6 * dt; c.p.x -= 1.2 * dt; c.piv.rotation.x += dt * 4; c.piv.rotation.z += dt * 3; if (c.p.y <= water) { c.p.y = water; c.piv.rotation.set(-Math.PI / 2, 0, 0); wSplash(g, c.p.x, c.p.z, 6, 2); } } else c.p.y = water + Math.sin(T * 2) * 0.05; c.piv.position.copy(c.p); }
        if (t >= 0.75 && t < 3.2) { P.arms.forEach(a => a.rotation.x = -2.8 + Math.sin(T * 12) * 0.3); w.position.y = Math.abs(Math.sin(T * 8)) * 0.3; } else { w.position.y = 0; P.arms.forEach(a => a.rotation.x = damp(a.rotation.x, -0.5, 3, dt)); } } }; },
    // the diner turns to watch the jet skis; the dog takes the steak and runs
    steak(g) { const tb = new THREE.Group(); tb.position.set(0, 0, 0.7); g.add(tb); M(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 16), white, 0, 0.9, 0, tb, 0.02); M(new THREE.CylinderGeometry(0.07, 0.1, 0.9, 6), ink, 0, 0.45, 0, tb, 0); M(new THREE.CylinderGeometry(0.34, 0.3, 0.05, 14), white, -0.1, 0.96, -0.1, tb, 0.01); const steakM = toon('#7a3b1e'), steak = M(new THREE.BoxGeometry(0.42, 0.1, 0.3), steakM, -0.1, 1.02, -0.1, tb, 0.01); M(new THREE.CylinderGeometry(0.06, 0.05, 0.22, 8), toon('#c9e7f2'), 0.35, 1.05, -0.1, tb, 0); M(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 5), ink, 0.45, 1.2, 0.3, tb, 0); M(new THREE.ConeGeometry(1.5, 0.6, 8), toon('#ec3013'), 0.45, 2.5, 0.3, tb, 0.02);
      M(new THREE.BoxGeometry(0.6, 0.08, 0.6), toon('#2f6db5'), 0, 0.55, -0.4, g, 0); M(new THREE.BoxGeometry(0.6, 0.7, 0.08), toon('#2f6db5'), 0, 0.9, -0.72, g, 0);
      const d = fox(['#9fd3c7', '#2e8b57', '#1d4d33'], 'suit', 'happy'); d.position.set(0, 0.25, -0.4); g.add(d);
      const dog = new THREE.Group(), tan = toon('#c48a4a'), dk = toon('#5b3a22'), body = new THREE.Group(); g.add(dog); dog.add(body); M(new THREE.BoxGeometry(0.42, 0.4, 0.9), tan, 0, 0.55, 0, body, 0.02); const head = new THREE.Group(); head.position.set(0, 0.85, 0.5); body.add(head); M(new THREE.BoxGeometry(0.38, 0.36, 0.4), tan, 0, 0, 0, head, 0.02); M(new THREE.BoxGeometry(0.22, 0.18, 0.22), tan, 0, -0.06, 0.28, head, 0.01); M(new THREE.SphereGeometry(0.05, 6, 5), ink, 0, -0.02, 0.4, head, 0); for (const sx of [-0.16, 0.16]) M(new THREE.BoxGeometry(0.1, 0.25, 0.14), dk, sx, 0.1, -0.05, head, 0).rotation.z = sx > 0 ? -0.3 : 0.3;
      const mouth = M(new THREE.BoxGeometry(0.42, 0.1, 0.3), steakM, 0, -0.16, 0.44, head, 0); const legs = []; for (const [lx, lz] of [[-0.14, 0.32], [0.14, 0.32], [-0.14, -0.32], [0.14, -0.32]]) { const lg = new THREE.Group(); lg.position.set(lx, 0.4, lz); body.add(lg); M(new THREE.BoxGeometry(0.1, 0.4, 0.1), tan, 0, -0.2, 0, lg, 0); legs.push(lg); } const tail = new THREE.Group(); tail.position.set(0, 0.7, -0.45); body.add(tail); M(new THREE.CylinderGeometry(0.04, 0.05, 0.45, 5), tan, 0, 0.2, 0, tail, 0).rotation.x = -0.4;
      const reset = () => { dog.position.set(1.0, 0, 0.75); dog.rotation.y = -Math.PI / 2 - 0.25; body.rotation.x = 0; steak.visible = true; mouth.visible = false; dog.visible = true; }; reset();
      return { reset, upd(t, dt) { const P = PP(d), T = X.St.t; X.kit.animFox(d, dt, 0, false); P.legs.forEach(l => l.rotation.x = -1.45);
        if (t < 2.5) { if (t >= 0 || Math.hypot(X.C.x - g.position.x, X.C.z - g.position.z) < 70) lookAtC(g, d, dt, 1.5); P.arms[1].rotation.x = t >= 0 ? -2.0 + Math.sin(T * 10) * 0.25 : -0.9; P.arms[0].rotation.x = -0.9; }
        else { if (P.head) P.head.rotation.y = damp(P.head.rotation.y, 0.2, 8, dt); P.arms.forEach(a => a.rotation.x = -2.7 + Math.sin(T * 14) * 0.15); d.position.y = 0.25 + Math.abs(Math.sin(T * 9)) * 0.1; }
        tail.rotation.z = Math.sin(T * (t > 0.9 ? 24 : 9)) * 0.6;
        if (t < 0.8) { body.rotation.x = 0; legs.forEach(l => l.rotation.x = 0); }
        else if (t < 1.3) { body.rotation.x = t < 1.15 ? -0.9 * cl01((t - 0.8) / 0.15) : -0.9 * (1 - (t - 1.15) / 0.15); if (t > 1.05) { steak.visible = false; mouth.visible = true; } }
        else if (t < 4.5) { body.rotation.x = 0; dog.rotation.y = damp(dog.rotation.y, -Math.PI / 2, 8, dt); dog.position.x -= 6.5 * dt; dog.position.y = Math.abs(Math.sin(t * 14)) * 0.12; legs.forEach((l, i) => l.rotation.x = Math.sin(t * 18 + (i % 2) * Math.PI) * 0.9); }
        else dog.visible = false; } }; },
    // a waiter looks up at the jet skis; the tower of plates goes in the canal
    waiter(g) { const wt = fox(['#f3f2f2', '#201e1d', '#201e1d'], 'suit', 'happy'); g.add(wt);
      const tray = new THREE.Group(); g.add(tray); M(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 14), toon('#cfd6dc'), 0, 0, 0, tray, 0.01); const pl = []; for (let i = 0; i < 5; i++) { const m = i === 4 ? M(new THREE.CylinderGeometry(0.24, 0.28, 0.3, 12), toon('#f49ac1'), 0, 0.53, 0, tray, 0.01) : M(new THREE.CylinderGeometry(0.32, 0.28, 0.06, 14), white, 0, 0.06 + i * 0.09, 0, tray, 0.01); pl.push({ m, home: m.position.clone(), fly: false, done: false, p: V3(), v: V3() }); }
      const tb = new THREE.Group(); tb.position.set(2.8, 0, 0.3); g.add(tb); M(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 14), white, 0, 0.85, 0, tb, 0.02); M(new THREE.CylinderGeometry(0.07, 0.1, 0.85, 6), ink, 0, 0.42, 0, tb, 0); M(new THREE.BoxGeometry(0.6, 0.08, 0.6), toon('#2e8b57'), 3.5, 0.55, 0.3, g, 0);
      const g2 = fox(['#f6dc8a', '#b8860b', '#5a3a12'], 'robe', 'happy'); g2.position.set(3.5, 0.25, 0.3); g2.rotation.y = -Math.PI / 2; g.add(g2);
      const reset = () => { wt.position.set(-1.2, 0, 0.6); wt.rotation.y = Math.PI / 2; pl.forEach(p => { p.fly = false; p.done = false; tray.add(p.m); p.m.position.copy(p.home); p.m.rotation.set(0, 0, 0); p.m.visible = true; }); }; reset();
      return { reset, upd(t, dt) { const T = X.St.t, P = PP(wt); X.kit.animFox(wt, dt, t < 0 ? 0.5 : 0, false); X.kit.animFox(g2, dt, 0, false); PP(g2).legs.forEach(l => l.rotation.x = -1.45);
        if (t < 0) { wt.position.x = -1.2 + Math.sin(T * 0.6) * 1.0; wt.rotation.y = Math.cos(T * 0.6) > 0 ? Math.PI / 2 : -Math.PI / 2; } else lookAtC(g, wt, dt, 1.4);
        const wob = t < 0 ? Math.sin(T * 3) * 0.04 : t < 1.0 ? Math.sin(t * 14) * (0.05 + t * 0.35) : 0;
        const hand = wt.localToWorld(V3(-0.42, 2.25, 0.12)); g.worldToLocal(hand); tray.position.copy(hand); tray.rotation.z = wob; tray.rotation.x = wob * 0.6;
        if (t < 1.0) { P.arms[1].rotation.x = -2.9; P.arms[0].rotation.x = t >= 0 ? -1.2 - Math.abs(wob) * 2 : -0.3; }
        else if (t < 2.5) { P.arms[0].rotation.x = -2.6 + Math.sin(T * 16) * 0.9; P.arms[1].rotation.x = -2.6 + Math.cos(T * 16) * 0.9; }
        else { P.arms[0].rotation.x = damp(P.arms[0].rotation.x, -2.5, 4, dt); P.arms[1].rotation.x = damp(P.arms[1].rotation.x, -0.4, 3, dt); if (P.head) P.head.rotation.x = 0.5; }
        pl.forEach((p, i) => { if (i < 2) return; if (t >= 1.0 + (i - 2) * 0.12 && !p.fly) { p.fly = true; p.m.getWorldPosition(p.p); g.worldToLocal(p.p); g.add(p.m); p.v.set(rr(-0.6, 0.6), 3.5 + i * 0.3, 4.4 + i * 0.5); }
          if (p.fly && !p.done) { p.v.y -= 9.8 * dt; p.p.addScaledVector(p.v, dt); p.m.position.copy(p.p); p.m.rotation.x += dt * 9; p.m.rotation.z += dt * 5; if (p.p.y < g.userData.wl) { p.done = true; p.m.visible = false; wSplash(g, p.p.x, p.p.z, 8, 1.6); } } }); } }; },
    // a monkey drops off the palm, steals the bananas, and the stall keeper shakes a fist
    bananas(g) { M(new THREE.BoxGeometry(2.6, 0.9, 1.0), toon('#9a6b3c'), 0, 0.45, 0.4, g, 0.02); for (const sx of [-1.25, 1.25]) M(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 5), darkWood, sx, 1.2, 0.85, g, 0); const aw = M(new THREE.BoxGeometry(2.9, 0.12, 1.5), toon('#ec3013'), 0, 2.45, 0.5, g, 0.02); aw.rotation.x = 0.25; const aw2 = M(new THREE.BoxGeometry(0.6, 0.13, 1.52), white, -0.6, 2.47, 0.5, g, 0); aw2.rotation.x = 0.25; const aw3 = M(new THREE.BoxGeometry(0.6, 0.13, 1.52), white, 0.6, 2.47, 0.5, g, 0); aw3.rotation.x = 0.25;
      const yel = toon('#f6d23a'), ban = () => { const b = new THREE.Group(); for (let k = 0; k < 5; k++) { const c = M(new THREE.CylinderGeometry(0.05, 0.06, 0.45, 5), yel, (k - 2) * 0.07, 0, 0, b, 0); c.rotation.z = (k - 2) * 0.18; c.rotation.x = 0.5; } return b; };
      const bunch = ban(); bunch.position.set(0.5, 1.08, 0.5); g.add(bunch); const b2 = ban(); b2.position.set(-0.7, 1.08, 0.5); g.add(b2); for (let k = 0; k < 3; k++) M(new THREE.SphereGeometry(0.16, 8, 6), toon('#7a4a26'), -0.2 + k * 0.25, 0.98, 0.7, g, 0); M(new THREE.ConeGeometry(0.16, 0.45, 7), toon('#e6b45a'), -1.05, 1.12, 0.35, g, 0);
      const v = fox(['#a3e635', '#4d7c0f', '#1a2e05'], 'vest', 'happy'); v.position.set(0, 0, -0.6); g.add(v); const PX = -3.4, PH = 6.2; palmAt(g, PX, -0.8, PH);
      const mk = monkey(); g.add(mk.g); const mB = ban(); mB.scale.setScalar(0.8); mB.position.set(0.35, 0.45, 0.25); mk.g.add(mB); const top = V3(PX + 0.35, PH - 0.5, -0.45), ctr = V3(0.5, 0.95, 0.45);
      const reset = () => { bunch.visible = true; mB.visible = false; mk.g.position.copy(top); v.position.y = 0; }; reset();
      return { reset, upd(t, dt) { const T = X.St.t, P = PP(v); X.kit.animFox(v, dt, 0, false);
        if (t < 0.5) { mk.g.position.set(top.x, top.y + Math.abs(Math.sin(T * 3)) * 0.05, top.z); if (t >= 0) { lookAtC(g, v, dt); P.arms[0].rotation.x = -2.6 + Math.sin(T * 12) * 0.4; } else P.arms[0].rotation.x = -0.3; }
        else if (t < 1.1) { const k = (t - 0.5) / 0.6; mk.g.position.set(arc(top.x, ctr.x, k, 0), arc(top.y, ctr.y, k, 1.2), arc(top.z, ctr.z, k, 0)); }
        else if (t < 1.4) { mk.g.position.copy(ctr); bunch.visible = false; mB.visible = true; }
        else if (t < 2.2) { const k = (t - 1.4) / 0.8; mk.g.position.set(arc(ctr.x, top.x, k, 0), arc(ctr.y, top.y, k, 1.5), arc(ctr.z, top.z, k, 0)); }
        else mk.g.position.set(top.x, top.y + Math.abs(Math.sin(T * 5)) * 0.08, top.z);
        mk.g.rotation.y = t > 1.1 && t < 2.2 ? -Math.PI / 2 : Math.PI / 2;
        if (t >= 1.2) { if (P.head) P.head.rotation.y = damp(P.head.rotation.y, -0.9, 6, dt); P.arms[1].rotation.x = -2.8 + Math.sin(T * 18) * 0.35; P.arms[0].rotation.x = damp(P.arms[0].rotation.x, -0.4, 4, dt); v.position.y = t < 4 ? Math.abs(Math.sin(T * 9)) * 0.2 : 0; } else v.position.y = 0;
        mk.anim(T, t > 0.5 && t < 2.2); } }; },
    // a pirate asleep in a hammock; your wake flips him out onto the sand
    hammock(g) { palmAt(g, -2.8, -0.6, 5.4); palmAt(g, 2.8, -0.6, 5.6);
      const swing = new THREE.Group(); swing.position.set(0, 2.0, -0.6); g.add(swing); const hg = new THREE.PlaneGeometry(5.2, 1.1, 10, 1), pa = hg.attributes.position; for (let i = 0; i < pa.count; i++) { const q = pa.getX(i) / 2.6; pa.setZ(i, pa.getY(i)); pa.setY(i, -0.9 * (1 - q * q)); } hg.computeVertexNormals(); swing.add(new THREE.Mesh(hg, new THREE.MeshToonMaterial({ color: '#f6c445', gradientMap: X.grad, side: THREE.DoubleSide })));
      const pr = ck.build('Corsair Cutlass', cOptsS); g.add(pr); const zT = CT(64, 64, c => { c.fillStyle = '#ffffff'; c.font = '900 54px Archivo, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Z', 32, 34); });
      const zs = [0, 1, 2].map(i => { const s2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: zT, transparent: true, depthWrite: false })); s2.scale.setScalar(0.5 + i * 0.15); g.add(s2); return s2; }), stars = [0, 1, 2, 3].map(() => { const s2 = SPR(glow(0xffd23a, 0.95), null, V3(0.5, 0.5, 1)); g.add(s2); s2.visible = false; return s2; });
      const reset = () => { swing.rotation.x = 0; pr.position.set(0.85, 1.25, -0.6); pr.rotation.set(0, 0, Math.PI / 2); pr.userData.fell = false; }; reset();
      return { reset, upd(t, dt) { const T = X.St.t; ck.animate(pr, t > 1.5 && t < 6 ? 'stagger' : 'idle', T, dt, {}); if (pr.userData.events) pr.userData.events.length = 0;
        zs.forEach((z, i) => { z.visible = t < 0.5; const k = (T * 0.5 + i / 3) % 1; z.position.set(-1.2 + k * 0.6, 2.2 + k * 1.6, -0.6); z.material.opacity = 1 - k; });
        if (t < 0) swing.rotation.x = Math.sin(T * 0.8) * 0.06; else if (t < 1.4) swing.rotation.x = Math.sin(t * 7) * Math.min(1.3, t * 1.0); else if (t < 2.2) swing.rotation.x = damp(swing.rotation.x, -Math.PI * 1.2, 6, dt); else swing.rotation.x = damp(swing.rotation.x, 0, 2, dt);
        if (t < 1.45) { const a = swing.rotation.x; pr.position.set(0.85, 2.0 - 0.75 * Math.cos(a), -0.6 + 0.75 * Math.sin(a)); pr.rotation.set(a, 0, Math.PI / 2); }
        else if (!pr.userData.fell) { pr.userData.fell = true; pr.userData.vy = 2; }
        if (pr.userData.fell) { if (t < 2.6) { pr.userData.vy -= 14 * dt; pr.position.y = Math.max(0.25, pr.position.y + pr.userData.vy * dt); pr.position.z = damp(pr.position.z, 0.8, 4, dt); pr.rotation.x = damp(pr.rotation.x, 0, 6, dt); } else { pr.position.y = damp(pr.position.y, 0, 3, dt); pr.rotation.z = damp(pr.rotation.z, 0, 2.5, dt); } }
        stars.forEach((s2, i) => { s2.visible = t > 2.8 && t < 7; const a = T * 4 + i * Math.PI / 2; s2.position.set(pr.position.x + Math.cos(a) * 0.55, pr.position.y + 2.0, pr.position.z + Math.sin(a) * 0.55); }); } }; },
    // a pirate shakes his fist at you; his parrot steals his hat and flies off with it
    parrot(g) { M(new THREE.BoxGeometry(1.4, 0.8, 1.0), toon('#7a4a26'), -1.8, 0.4, -0.2, g, 0.02); M(new THREE.BoxGeometry(1.44, 0.4, 1.04), toon('#8a5a32'), -1.8, 0.95, -0.2, g, 0.01); for (const sx of [-2.25, -1.35]) M(new THREE.BoxGeometry(0.12, 1.25, 1.06), goldM, sx, 0.6, -0.2, g, 0);
      const pir = ck.build('Corsair Gunner', cOptsS); g.add(pir); pir.position.set(0, 0, 0.4); const hat = pir.userData.hat, hp = hat ? { par: hat.parent, p: hat.position.clone(), r: hat.rotation.clone(), s: hat.scale.clone() } : null; palmAt(g, 3.0, -0.8, 5.8);
      const pt = new THREE.Group(); g.add(pt); const grn = toon('#2fb34a'); const bd = M(new THREE.SphereGeometry(0.28, 10, 8), grn, 0, 0, 0, pt, 0.02); bd.scale.set(0.8, 0.9, 1.3); M(new THREE.SphereGeometry(0.18, 8, 6), grn, 0, 0.22, 0.28, pt, 0.01); const bk = M(new THREE.ConeGeometry(0.07, 0.2, 6), toon('#f6c445'), 0, 0.18, 0.48, pt, 0); bk.rotation.x = 1.9; const tl = M(new THREE.BoxGeometry(0.16, 0.04, 0.6), toon('#2f6db5'), 0, -0.05, -0.5, pt, 0); tl.rotation.x = -0.4; const wings = []; for (const sx of [-1, 1]) { const w2 = new THREE.Group(); w2.position.set(sx * 0.2, 0.05, 0); pt.add(w2); M(new THREE.BoxGeometry(0.6, 0.04, 0.4), toon('#ec3013'), sx * 0.3, 0, 0, w2, 0); wings.push(w2); }
      const perch = V3(2.9, 5.4, -0.4);
      const reset = () => { pt.position.copy(perch); pt.rotation.set(0, Math.PI / 2, 0); if (hat && hp) { hp.par.add(hat); hat.position.copy(hp.p); hat.rotation.copy(hp.r); hat.scale.copy(hp.s); } pir.position.y = 0; }; reset();
      return { reset, upd(t, dt) { const T = X.St.t, P = PP(pir); ck.animate(pir, 'idle', T, dt, {}); if (pir.userData.events) pir.userData.events.length = 0;
        if (t < 1.3) { lookAtC(g, pir, dt, 1.4); if (P) { P.arms[1].rotation.x = -2.6 + Math.sin(T * 16) * 0.35; } }
        else if (P) { P.arms.forEach(a => a.rotation.x = -2.9); P.arms[0].rotation.z = 0.6; P.arms[1].rotation.z = -0.6; pir.position.y = t < 4 ? Math.abs(Math.sin(T * 10)) * 0.25 : 0; if (P.head) P.head.rotation.y = damp(P.head.rotation.y, 0.8, 4, dt); }
        const headW = V3(0, 2.0, 0.4);
        if (t < 0.6) { pt.position.set(perch.x, perch.y + Math.abs(Math.sin(T * 2)) * 0.04, perch.z); wings.forEach(w2 => w2.rotation.z = 0); }
        else if (t < 1.3) { const k = (t - 0.6) / 0.7; pt.position.set(arc(perch.x, headW.x, k, 0), arc(perch.y, headW.y + 0.5, k, -1.2), arc(perch.z, headW.z, k, 0)); pt.rotation.y = -Math.PI / 2; wings.forEach((w2, i) => w2.rotation.z = (i ? -1 : 1) * Math.sin(T * 30) * 0.8); }
        else { if (hat && hat.parent !== pt) { pt.attach(hat); } pt.position.x -= 2.5 * dt; pt.position.y += 3.2 * dt; pt.position.z += 2.4 * dt; pt.rotation.y = -Math.PI / 2 - 0.6; wings.forEach((w2, i) => w2.rotation.z = (i ? -1 : 1) * Math.sin(T * 30) * 0.9); pt.visible = pt.position.y < 60; } } }; },
    // three kids run off the pier and cannonball into the canal as you go by
    kids(g) { M(new THREE.BoxGeometry(2.2, 0.25, 9), plank, 0, 0.05, 4.3, g, 0.02); for (let k = 0; k < 4; k++) for (const sx of [-1, 1]) M(new THREE.CylinderGeometry(0.14, 0.14, 3.2, 6), wood, sx * 1.0, -1.4, 0.5 + k * 2.6, g, 0);
      const K = [['#38bdf8', '#0369a1', '#0c4a6e'], ['#f472b6', '#be185d', '#500724'], ['#f6c445', '#b45309', '#451a03']].map((c, i) => { const f = fox(c, 'vest', 'happy', 0.6); g.add(f); return { f, x: (i - 1) * 0.45, z0: 1.6 - i * 0.9, sp: false }; });
      const reset = () => K.forEach(k => { k.f.position.set(k.x, 0.18, k.z0); k.f.rotation.set(0, 0, 0); k.f.scale.setScalar(k.f.scale.x); k.sp = false; k.f.visible = true; }); reset();
      return { reset, upd(t, dt) { const T = X.St.t; K.forEach((k, i) => { const f = k.f, P = PP(f), ts = 0.3 + i * 0.55, u = t - ts; X.kit.animFox(f, dt, u > 0 && u < 0.5 ? 3 : 0, false);
        if (t < 0 || u < 0) { f.position.set(k.x, 0.18 + Math.abs(Math.sin(T * 6 + i)) * 0.15, k.z0); if (P) P.arms.forEach(a => a.rotation.x = -2.6 + Math.sin(T * 8 + i) * 0.3); }
        else if (u < 0.5) { f.position.set(k.x, 0.18, k.z0 + (8.6 - k.z0) * (u / 0.5)); }
        else if (u < 1.15) { const q = (u - 0.5) / 0.65; f.position.set(k.x, arc(0.18, g.userData.wl - 0.5, q, 1.5), arc(8.6, 11, q, 0)); if (i === 2) { f.rotation.x = q * Math.PI * 2; } if (P) P.arms.forEach(a => a.rotation.x = i === 2 ? -0.6 : -3.0); }
        else { if (!k.sp) { k.sp = true; wSplash(g, k.x, 11, i === 2 ? 20 : 10, i === 2 ? 4 : 2.4); } f.rotation.x = 0; f.position.set(k.x + Math.sin(T + i) * 0.2, g.userData.wl - 0.55 + Math.sin(T * 2.5 + i) * 0.08, 11 + i * 0.6); if (P) P.arms.forEach((a, j) => a.rotation.x = -2.8 + Math.sin(T * 9 + i + j) * 0.4); } }); } }; },
  };
  for (const S of SPOT) { const g = new THREE.Group(), SC = 1.25; g.position.set(S.x, heightAt(S.x, S.z) + 0.05, S.z); g.rotation.y = S.yaw; g.scale.setScalar(SC); g.userData.wl = (0.15 - g.position.y) / SC; scene.add(g); const api = BUILD[S.k](g); SCN.push({ ...S, g, t: -1, api }); }
  function updScenes(dt) { const C = X.C, vis = touch ? 150 : 220; for (const sc of SCN) { const d = Math.hypot(C.x - sc.x, C.z - sc.z); sc.g.visible = d < vis; if (!sc.g.visible) { if (sc.t >= 0 && d > 90) { sc.t = -1; sc.api.reset(); } continue; }
      if (sc.t < 0) { const ahead = (sc.x - C.x) * Math.sin(C.yaw) + (sc.z - C.z) * Math.cos(C.yaw); if (R.state === 'run' && !R.board && d < 58 && ahead > -6) sc.t = 0; } else sc.t += dt;
      sc.api.upd(sc.t, dt); if (sc.t > 9 && d > 90) { sc.t = -1; sc.api.reset(); } } }

  // ---------- PIRATES (Corsair kit foxes): cutlass on bridges, gunners in towers, skiffs, island cannons ----------
  const cOpts = touch ? { noPolish: true } : {}, EN = [], bolts = [], balls = [], FL = [];
  const tellMat = () => glow(0xff3b1f, 0.9);
  function corsair(name, parent) { const f = ck.build(name, cOpts); (parent || scene).add(f); return f; }
  for (const b of BRIDGES) if (b.job === 'cut') { const f = corsair('Corsair Cutlass'), off = rr(-0.3, 0.3) * b.hw, x = b.x + b.px * off, z = b.z + b.pz * off; f.position.set(x, b.top, z); const e = { type: 'cutlass', f, x, z, y: b.top, b, off, st: 'wait', t: 0, wet: 0, hpT: 0.55, pts: 60, label: 'CUTLASS' }; if (b.kind === 'rope') { e.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(), V3()]), lineMat); e.line.frustumCulled = false; e.line.visible = false; scene.add(e.line); } ck.enter(f, 'idle'); EN.push(e); R.totalBots++; }
  function tower(x, z) { const y = heightAt(x, z), g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); for (const [a, b2] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) M(new THREE.CylinderGeometry(0.2, 0.24, 6.4, 6), darkWood, a, 3.2, b2, g, 0.01); M(new THREE.BoxGeometry(4, 0.4, 4), wood, 0, 6.2, 0, g, 0.02); for (const [a, b2, w2, d2] of [[0, 1.9, 4, 0.15], [0, -1.9, 4, 0.15], [1.9, 0, 0.15, 4], [-1.9, 0, 0.15, 4]]) M(new THREE.BoxGeometry(w2, 0.9, d2), darkWood, a, 6.85, b2, g, 0); M(new THREE.ConeGeometry(3.4, 2.2, 6), toon('#d7b56d'), 0, 10.2, 0, g, 0.02); for (const [a, b2] of [[-1.6, -1.6], [1.6, 1.6]]) M(new THREE.CylinderGeometry(0.1, 0.1, 2.8, 4), darkWood, a, 7.8, b2, g, 0); return y + 6.4; }
  function addGun(s, sd) { const q = landOut(s, sd, hwAt(s) + 6, 3.5), y = tower(q.x, q.z), f = corsair('Corsair Gunner'); f.position.set(q.x, y, q.z); const tell = SPR(tellMat(), null, V3(1.6, 1.6, 1)); tell.visible = false; scene.add(tell); EN.push({ type: 'gunner', f, x: q.x, z: q.z, y, st: 'idle', t: 0, cd: rr(1, 2), wet: 0, hpT: 0.9, pts: 80, label: 'GUNNER', tell }); ck.enter(f, 'idle'); R.totalBots++; }
  addGun(95, 1); addGun(255, -1); addGun(400, 1);
  const ringGeo = new THREE.RingGeometry(3.6, 4.5, 28).rotateX(-Math.PI / 2);
  function addCannon(s, sd) { const q = landOut(s, sd, hwAt(s) + 5, 2.5), y = heightAt(q.x, q.z), g = new THREE.Group(); g.position.set(q.x, y, q.z); scene.add(g); M(new THREE.BoxGeometry(1.8, 0.6, 2.4), wood, 0, 0.6, 0, g, 0.02); for (const sx of [-1, 1]) M(new THREE.CylinderGeometry(0.6, 0.6, 0.25, 12), ink, sx * 1.0, 0.6, 0, g, 0.01).rotation.z = Math.PI / 2; const bar = new THREE.Group(); bar.position.set(0, 1.2, 0); g.add(bar); const br = M(new THREE.CylinderGeometry(0.34, 0.46, 2.8, 12), iron, 0, 0, 0.6, bar, 0.03); br.rotation.x = Math.PI / 2; bar.rotation.x = -0.35;
    const fuse = SPR(glow(0xffb347, 0.9), V3(0, 1.7, -0.7), V3(1.2, 1.2, 1)); g.add(fuse); const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide })); ring.visible = false; scene.add(ring);
    EN.push({ type: 'cannon', g, bar, fuse, ring, x: q.x, z: q.z, y, st: 'idle', t: 0, cd: rr(1, 2), wet: 0, hpT: 1.0, pts: 70, label: 'CANNON' }); R.totalBots++; }
  addCannon(300, 1); addCannon(445, -1);
  function addSkiff(x, z, gun, trig) { const g = new THREE.Group(); g.position.set(x, 0, z); g.visible = false; scene.add(g); const hull = new THREE.Group(); hull.scale.setScalar(1.2); g.add(hull); M(new THREE.BoxGeometry(1.8, 0.7, 4.2), toon('#7a4f2a'), 0, 0, 0, hull, 0.03); const bw = M(new THREE.BoxGeometry(1.3, 0.7, 1.3), toon('#7a4f2a'), 0, 0, 2.1, hull, 0.02); bw.rotation.y = Math.PI / 4; bw.scale.x = 0.9; M(new THREE.BoxGeometry(1.86, 0.14, 4.26), toon('#c42d3c'), 0, 0.36, 0, hull, 0);
    for (const sx of [-1, 1]) { const o = M(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 4), darkWood, sx * 1.4, 0.3, 0.1, hull, 0); o.rotation.z = sx * 1.2; } M(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 4), ink, 0, 1.4, -1.8, hull, 0); const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), new THREE.MeshBasicMaterial({ color: 0x201e1d, side: THREE.DoubleSide })); fl.position.set(0, 2.3, -1.5); hull.add(fl);
    const rider = corsair(gun ? 'Corsair Gunner' : 'Corsair Cutlass', hull); rider.scale.setScalar(1 / 1.2); rider.position.set(0, 0.25, -0.5);
    const lane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5), new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0.4, depthWrite: false })); lane.visible = false; scene.add(lane);
    const e = { type: 'skiff', g, hull, rider, lane, x, z, hx: x, hz: z, face: 0, spd: 0, st: 'off', t: 0, cd: rr(1, 2), wet: 0, hpT: 1.3, pts: 90, label: gun ? 'GUN SKIFF' : 'SKIFF', gun, trig }; EN.push(e); R.totalBots++; return e; }
  addSkiff(10, 176, false, 232); { const p = at(296); addSkiff(p.x, p.z, true, 240); } addSkiff(-84, 314, false, 384); addSkiff(92, 296, true, 392);
  const CHASE = [];
  function fireBolt(x, y, z, dmg = 6) { const p = V3(x, y, z), d = V3(X.C.x + rr(-0.8, 0.8), X.C.y + 1, X.C.z + rr(-0.8, 0.8)).sub(p).normalize(), m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3b1f })); m.position.copy(p); m.add(SPR(glow(0xff3b1f, 0.9), null, V3(1.3, 1.3, 1))); scene.add(m); bolts.push({ m, v: d.multiplyScalar(30), life: 2.4, dmg }); X.audio.tone(900, 0.07, 0.04, 'square', 0.5); X.puff(p, 0xd1d5db, 3, 1.2, 0.6, 0.5); }
  // nets across the canal: hop over them (3) or get tangled
  const netT = CT(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#6b4a2c'; g.lineWidth = 5; for (let x = 0; x <= w; x += 18) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 30, h); g.stroke(); g.beginPath(); g.moveTo(x, h); g.lineTo(x + 30, 0); g.stroke(); } g.strokeStyle = '#3a2614'; g.lineWidth = 10; g.strokeRect(4, 4, w - 8, h - 8); });
  const NETS = [268, 455].map(s => { const p = at(s), w = p.hw * 2 - 1, g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = Math.atan2(p.ux, p.uz); scene.add(g); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 5).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: netT, transparent: true, depthWrite: false, side: THREE.DoubleSide })); m.position.y = 0.12; g.add(m); for (let k = 0; k < 8; k++) M(new THREE.SphereGeometry(0.32, 8, 6), k % 2 ? white : red, -w / 2 + k / 7 * w, 0.2, k % 2 ? 2.5 : -2.5, g, 0); return { s, x: p.x, z: p.z, ux: p.ux, uz: p.uz, w, g, inside: false, hopped: false }; });

  // ---------- 4 OPEN SEA: rival race ----------
  const GATES = [[24, 394], [150, 424], [204, 506], [150, 590], [0, 576], [-150, 590], [-204, 506], [-150, 424]], NG = GATES.length, LAPS = 1;
  const gateG = GATES.map(([x, z], i) => { const [nx, nz] = GATES[(i + 1) % NG], [px, pz] = GATES[(i + NG - 1) % NG], dx = nx - px, dz = nz - pz, l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l, g = new THREE.Group(); scene.add(g); g.visible = false;
    for (const sd of [-1, 1]) { const x2 = x + uz * sd * 14, z2 = z - ux * sd * 14, p = new THREE.Group(); p.position.set(x2, 0, z2); g.add(p); for (let k = 0; k < 4; k++) M(new THREE.CylinderGeometry(0.3, 0.3, 1.1, 10), k % 2 ? white : red, 0, k * 1.1, 0, p, 0.012); g.add(SPR(glow(0xffd98a, 0.85), V3(x2, 4.8, z2), V3(2.2, 2.2, 1))); }
    if (i === 0) { const ct = CT(256, 64, (g2) => { for (let a = 0; a < 16; a++) for (let b = 0; b < 4; b++) { g2.fillStyle = (a + b) % 2 ? '#201e1d' : '#f3f2f2'; g2.fillRect(a * 16, b * 16, 16, 16); } }); const fl = new THREE.Mesh(new THREE.PlaneGeometry(28, 1.2), new THREE.MeshBasicMaterial({ map: ct, side: THREE.DoubleSide })); fl.position.set(x, 4.4, z); fl.rotation.y = Math.atan2(ux, uz) + Math.PI / 2; g.add(fl); }
    return g; });
  const nextGlow = SPR(glow(0xffd23a, 0.9), V3(0, 3, 0), V3(5, 5, 1)); nextGlow.visible = false; scene.add(nextGlow);
  const g0 = GATES[0], g1 = GATES[1], gdx = g1[0] - g0[0], gdz = g1[1] - g0[1], gl = Math.hypot(gdx, gdz), GU = [gdx / gl, gdz / gl], GYAW = Math.atan2(GU[0], GU[1]);
  const slot = (back, sd) => [g0[0] - GU[0] * back + GU[1] * sd, g0[1] - GU[1] * back - GU[0] * sd];
  const SLOTS = [slot(9, -4), slot(9, 4), slot(16, -4), slot(16, 4)];
  const RIVALS = [['JORN', '#38bdf8', 21.6], ['JIB', '#a3e635', 20.6], ['JETSAM', '#f472b6', 19.6]].map(([name, col, base], i) => {
    const g = X.vk.make('jetski'), Vv = g.userData.V; g.scale.setScalar(1.56); const tint = new Map(); g.traverse(m => { if (m.isMesh && m.material && m.material.color && m.material.color.getHexString() === 'ec3013') { if (!tint.has(m.material)) { const nm = m.material.clone(); nm.color.set(col); tint.set(m.material, nm); } m.material = tint.get(m.material); } });
    const f = X.kit.makeFox({ ...X.CAST.player, torso: [col, '#f3f2f2', '#201e1d'], outfit: 'vest', gear: 'none', crest: '', mood: 'determined' }); f.scale.multiplyScalar(1 / 1.56); f.position.copy(Vv.seat); f.position.y -= 0.1; Vv.body.add(f); const P = f.userData.P; if (P) { P.legs.forEach(l => l.rotation.x = -1.3); P.arms.forEach(a => a.rotation.x = -1.2); }
    g.visible = false; scene.add(g); return { name, g, V: Vv, base, x: 0, z: 0, yaw: GYAW, spd: 0, k: 0, off: (i - 1) * 3, done: 0, nit: 0 }; });
  const prog = (k, x, z) => { const nx = GATES[(k + 1) % NG], px = GATES[k % NG], L = Math.hypot(nx[0] - px[0], nx[1] - px[1]); return k + clamp(1 - Math.hypot(nx[0] - x, nx[1] - z) / L, 0, 1); };
  function raceGrid() { R.race = { st: 'count', c: 3.6, k: 0, fin: [], said: '' }; gateG.forEach(g => g.visible = true); RIVALS.forEach((r, i) => { const [x, z] = SLOTS[i + 1]; Object.assign(r, { x, z, yaw: GYAW, spd: 0, k: 0, done: 0 }); r.g.visible = true; }); X.place(SLOTS[0][0], SLOTS[0][1], GYAW); R.cp = { x: SLOTS[0][0], z: SLOTS[0][1], yaw: GYAW }; }
  const ord = n => n + (n === 1 ? 'ST' : n === 2 ? 'ND' : n === 3 ? 'RD' : 'TH');
  function racePlace() { const me = prog(R.race.k, X.C.x, X.C.z); return 1 + RIVALS.filter(r => r.done ? true : prog(r.k, r.x, r.z) > me).length; }

  // ---------- 5 THE GALLEON: the Corsair Captain circles; hose his 6 cannon ports shut, then ram the hull ----------
  const GC = { x: 0, z: 470, r: 58 };
  const GAL = { g: new THREE.Group(), x: GC.x, z: GC.z, yaw: 0.7, ang: 0, st: 'anchor', t: 0, ports: [], rams: 0, roll: 0, sinkY: 0, fireCd: 2, slowCd: 0 };
  { const g = GAL.g; scene.add(g); const hullM = toon('#5b3a22'), deckM = toon('#8a5a32'), trim = toon('#e0b43a');
    M(new THREE.BoxGeometry(9, 4.6, 22), hullM, 0, 0.8, 0, g, 0.05); M(new THREE.BoxGeometry(9.1, 0.45, 22.1), trim, 0, 2.5, 0, g, 0); const bow = M(new THREE.BoxGeometry(6.4, 4.6, 6.4), hullM, 0, 0.8, 11, g, 0.04); bow.rotation.y = Math.PI / 4; bow.scale.set(0.72, 1, 0.72);
    M(new THREE.BoxGeometry(8.6, 0.3, 22), deckM, 0, 3.15, 0, g, 0); M(new THREE.BoxGeometry(9, 3.2, 6), toon('#6b4a2c'), 0, 4.6, -8, g, 0.04); M(new THREE.BoxGeometry(9.2, 0.4, 6.2), trim, 0, 6.3, -8, g, 0);
    for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.3, 1.0, 16), toon('#6b4a2c'), sx * 4.3, 3.8, 2, g, 0);
    const sailT = CT(256, 256, (c, w, h) => { c.fillStyle = '#26221f'; c.fillRect(0, 0, w, h); c.fillStyle = '#f3f2f2'; c.beginPath(); c.arc(128, 110, 46, 0, 7); c.fill(); c.fillRect(100, 140, 56, 30); c.fillStyle = '#26221f'; c.beginPath(); c.arc(110, 108, 12, 0, 7); c.arc(146, 108, 12, 0, 7); c.fill(); c.fillRect(112, 150, 8, 20); c.fillRect(136, 150, 8, 20); c.strokeStyle = '#f3f2f2'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(60, 190); c.lineTo(196, 236); c.moveTo(196, 190); c.lineTo(60, 236); c.stroke(); });
    for (const [z, h, sw] of [[-2, 18, 10], [7, 15, 8.5]]) { M(new THREE.CylinderGeometry(0.32, 0.42, h, 8), toon('#4a2f1a'), 0, 3 + h / 2, z, g, 0.02); const sl = new THREE.Mesh(new THREE.PlaneGeometry(sw, sw * 0.8, 6, 1), new THREE.MeshToonMaterial({ map: sailT, gradientMap: X.grad, side: THREE.DoubleSide })); const pa = sl.geometry.attributes.position; for (let i = 0; i < pa.count; i++) { const q = pa.getX(i) / (sw / 2); pa.setZ(i, 0.9 * (1 - q * q)); } sl.position.set(0, 3 + h * 0.62, z + 0.5); g.add(sl); M(new THREE.CylinderGeometry(0.14, 0.14, sw + 1, 6), toon('#4a2f1a'), 0, 3 + h * 0.62 + sw * 0.4, z + 0.4, g, 0).rotation.z = Math.PI / 2; }
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), new THREE.MeshBasicMaterial({ map: sailT, side: THREE.DoubleSide })); flag.position.set(1.1, 21.5, -2); g.add(flag);
    for (const sd of [-1, 1]) for (const z of [-5, 0.5, 6]) { M(new THREE.BoxGeometry(0.3, 1.3, 1.5), ink, sd * 4.52, 1.9, z, g, 0); const brl = M(new THREE.CylinderGeometry(0.24, 0.3, 1.5, 8), iron, sd * 5.0, 1.9, z, g, 0); brl.rotation.z = Math.PI / 2; const hinge = new THREE.Group(); hinge.position.set(sd * 4.62, 2.58, z); g.add(hinge); M(new THREE.BoxGeometry(0.16, 1.3, 1.6), toon('#3a2614'), 0, -0.65, 0, hinge, 0.01); hinge.rotation.z = sd * 1.3; const gl2 = SPR(glow(0xff3b1f, 0.0), V3(sd * 5.8, 1.9, z), V3(2.6, 2.6, 1)); g.add(gl2);
      const lane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5), new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0.35, depthWrite: false })); lane.visible = false; scene.add(lane);
      GAL.ports.push({ sd, z, hinge, gl: gl2, lane, shut: false, wet: 0, wind: 0, cd: rr(0, 2) }); }
    GAL.cap = corsair('Corsair Captain', g); GAL.cap.position.set(0, 6.5, -8); GAL.cap.scale.setScalar(1.15); ck.enter(GAL.cap, 'idle'); }
  const portW = (pt, out) => out.set(pt.sd * 5.6, 1.9, pt.z).applyMatrix4(GAL.g.matrixWorld);
  function galLocal(x, z) { const dx = x - GAL.x, dz = z - GAL.z, c = Math.cos(GAL.yaw), s = Math.sin(GAL.yaw); return [dx * c - dz * s, dx * s + dz * c]; }
  function galWorld(lx, lz) { const c = Math.cos(GAL.yaw), s = Math.sin(GAL.yaw); return [GAL.x + lx * c + lz * s, GAL.z - lx * s + lz * c]; }

  // ---------- 6 THE PIRATE HIDEOUT (stockade island, sea gate facing the run) ----------
  const HG = { x: HIDE.x, z: HIDE.z - HIDE.r - 7 };
  { const g = new THREE.Group(); g.position.set(HIDE.x, 0, HIDE.z); scene.add(g); const sm = M(new THREE.SphereGeometry(1, 24, 10), toon('#ecdcab'), 0, -0.6, 0, g, 0); sm.scale.set(HIDE.r, 3, HIDE.r); const gm = M(new THREE.SphereGeometry(1, 20, 8), toon('#6fae4f'), 0, -0.2, 0, g, 0); gm.scale.set(HIDE.r * 0.8, 3, HIDE.r * 0.8);
    const RS = 24, logs = []; for (let a = 0; a < Math.PI * 2; a += 1.0 / RS) { const da = Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2)); if (Math.abs(da) < 0.2) continue; logs.push([Math.cos(a) * RS, Math.sin(a) * RS]); }
    const lg = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.5, 0.5, 6, 6), toon('#7a4f2a'), logs.length), lt = new THREE.InstancedMesh(new THREE.ConeGeometry(0.5, 1.1, 6), toon('#5b3a22'), logs.length), o3 = new THREE.Object3D(); logs.forEach(([x, z], i) => { o3.position.set(HIDE.x + x, 5.2, HIDE.z + z); o3.updateMatrix(); lg.setMatrixAt(i, o3.matrix); o3.position.y = 8.7; o3.updateMatrix(); lt.setMatrixAt(i, o3.matrix); }); scene.add(lg, lt);
    for (const sx of [-1, 1]) M(new THREE.BoxGeometry(1.6, 11, 1.6), toon('#4a2f1a'), sx * 5.4, 7, -RS, g, 0.03); M(new THREE.BoxGeometry(12.6, 1.4, 1.6), toon('#4a2f1a'), 0, 12.2, -RS, g, 0.03);
    const st = CT(1024, 192, (c, w, h) => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, w, h); c.fillStyle = '#f3f2f2'; c.font = '900 100px Archivo, sans-serif'; c.textBaseline = 'middle'; c.fillText('PIRATE HIDEOUT', 40, 100); c.fillStyle = '#ec3013'; c.fillRect(0, h - 14, w, 14); }); const sp = new THREE.Mesh(new THREE.PlaneGeometry(11, 2), new THREE.MeshBasicMaterial({ map: st, side: THREE.DoubleSide })); sp.position.set(0, 14.2, -RS - 0.9); g.add(sp);
    for (const [x, z] of [[-8, 4], [9, 6]]) { M(new THREE.BoxGeometry(5, 3.4, 5), toon('#9a6b3c'), x, 3.6, z, g, 0.02); M(new THREE.ConeGeometry(4.4, 2.8, 6), toon('#d7b56d'), x, 6.7, z, g, 0.02); }
    M(new THREE.BoxGeometry(4, 0.3, 16), plank, 0, 1.4, -HIDE.r + 2, g, 0.02); for (let k = 0; k < 4; k++) for (const sx of [-1.7, 1.7]) M(new THREE.CylinderGeometry(0.2, 0.2, 3, 6), wood, sx, 0.2, -HIDE.r - 5 + k * 4.5, g, 0);
    g.add(SPR(glow(0xffd98a, 0.9), V3(-5.4, 13, -RS), V3(3, 3, 1))); g.add(SPR(glow(0xffd98a, 0.9), V3(5.4, 13, -RS), V3(3, 3, 1))); }
  { const rk = toon('#8d8478'); for (const I of SEA_ISLES) if (!I.k) { const m = M(new THREE.DodecahedronGeometry(1, 0), rk, I.x, 0, I.z, null, 0.04); m.scale.set(I.r, I.r * 0.9, I.r * 0.85); m.rotation.y = I.x; } }

  // ---------- SWORD (button 2): slash anything close in front ----------
  const SW = { t: 9, cd: 0 }, swordG = new THREE.Group(); { M(new THREE.BoxGeometry(0.08, 0.05, 1.5), toon('#e5e7eb'), 0, 0, 0.85, swordG, 0.02); M(new THREE.BoxGeometry(0.42, 0.08, 0.09), goldM, 0, 0, 0.08, swordG, 0); M(new THREE.CylinderGeometry(0.045, 0.045, 0.32, 6), toon('#5b3a22'), 0, 0, -0.1, swordG, 0).rotation.x = Math.PI / 2; } swordG.rotation.order = 'YXZ';
  let swordOn = null; const mountSword = () => { const V = X.V, veh = X.veh; if (!V || !veh || swordOn === veh) return; swordOn = veh; (V.body || veh).add(swordG); const s = 1 / (veh.scale.x || 1); swordG.scale.setScalar(s * 1.25); swordG.position.copy(V.seat || V3(0, 0, 0)).add(V3(-0.45 * s, 0.95 * s, 0.25 * s)); };
  const slash = new THREE.Mesh(new THREE.RingGeometry(1.6, 4.8, 24, 1, -Math.PI / 2 - 1.25, 2.5).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); slash.renderOrder = 4; scene.add(slash);
  function swing() { if (SW.cd > 0) return; SW.cd = 0.42; SW.t = 0; X.audio.burst(0.12, 2400, 0.12); const C = X.C, fx0 = Math.sin(C.yaw), fz0 = Math.cos(C.yaw), inArc = (x, z, r) => { const dx = x - C.x, dz = z - C.z, d = Math.hypot(dx, dz); return d <= r && (d < 2.6 || (dx * fx0 + dz * fz0) / d > -0.35); }; let hits = 0;
    for (const e of EN) { if (e.dead || e.gone) continue; if (e.type === 'skiff' && e.st !== 'off' && e.st !== 'sink' && inArc(e.x, e.z, 5.6)) { e.wet += 0.7; hits++; if (e.wet >= e.hpT) { ko(e, 'SKIFF SPLIT', e.pts); e.st = 'sink'; e.t = 0; e.lane.visible = false; } else X.popup(tmp.set(e.x, 3, e.z), 'SLASH', '#ffffff'); }
      else if (e.type === 'cutlass' && (e.st === 'swim' || e.st === 'leap') && inArc(e.x, e.z, 5)) { hits++; const lp = e.st === 'leap'; ko(e, lp ? 'PARRIED' : 'DUNKED', lp ? 80 : 30); e.st = 'sinkaway'; e.t = 0; if (e.line) e.line.visible = false; e.y = W(e.x, e.z) - 1; e.f.position.set(e.x, e.y, e.z); } }
    for (const p of SD) if (p.on && !p.dead && inArc(p.x, p.z, 5.8)) { hits++; sdHit(p); }
    for (const f of FL) if (!f.dead && !f.falling && inArc(f.x, f.z, 4.5)) { f.dead = true; f.g.visible = false; X.puff(tmp.set(f.x, 1, f.z), 0x8a5a32, 10, 4, 0.5, 0.8); R.score += 10; hits++; }
    if (hits) { X.St.shake = Math.max(X.St.shake, 0.25); X.audio.tone(1500, 0.06, 0.05, 'square', 0.6); } }
  function updSword(dt) { mountSword(); SW.cd = Math.max(0, SW.cd - dt); SW.t += dt; const C = X.C, k = SW.t / 0.22;
    if (k < 1) { swordG.rotation.set(-0.12, 1.6 - k * 3.2, 0); slash.position.set(C.x, C.y + 1.3, C.z); slash.rotation.y = C.yaw; slash.material.opacity = 0.75 * (1 - k); } else { swordG.rotation.set(-1.25, damp(swordG.rotation.y, 0.25, 8, dt), 0); slash.material.opacity = 0; } }

  // ---------- 5 SHOWDOWN: pirate jet skis around the anchored galleon (sword only) ----------
  const SD = []; R.sdK = 0; const pjBg = new THREE.SpriteMaterial({ color: 0x201e1d, depthTest: false }), pjFg = new THREE.SpriteMaterial({ color: 0xec3013, depthTest: false });
  function mkPJ(big) { const sc = 1.56 * (big ? 1.25 : 1), g = X.vk.make('jetski'), Vv = g.userData.V; g.scale.setScalar(sc); const tint = new Map(); g.traverse(m => { if (m.isMesh && m.material && m.material.color) { const h = m.material.color.getHexString(), to = h === 'ec3013' ? '#201e1d' : h === 'f3f2f2' ? (big ? '#9b1c2c' : '#7a1d2a') : null; if (to) { if (!tint.has(m.material)) { const nm = m.material.clone(); nm.color.set(to); tint.set(m.material, nm); } m.material = tint.get(m.material); } } });
    const rd = ck.build(big ? 'Corsair Captain' : 'Corsair Cutlass', cOpts); rd.scale.multiplyScalar(1 / sc); rd.position.copy(Vv.seat); rd.position.y -= 0.1; Vv.body.add(rd);
    const bar = new THREE.Group(), bb = new THREE.Sprite(pjBg), bf = new THREE.Sprite(pjFg); bb.scale.set(3.1, 0.2, 1); bf.scale.set(3, 0.13, 1); bf.center.set(0, 0.5); bf.position.x = -1.5; bb.renderOrder = bf.renderOrder = 8; bar.add(bb, bf); bar.visible = false; scene.add(bar);
    g.visible = false; scene.add(g); SD.push({ g, rd, bar, bf, big, hp: big ? 6 : 3, max: big ? 6 : 3, x: 0, z: 0, face: 0, spd: 0, st: 'off', t: 0, cd: rr(1, 2), on: false, dead: false, pts: big ? 300 : 100, r: big ? 2.2 : 1.8 }); R.totalBots++; }
  for (let i = 0; i < 6; i++) mkPJ(false); mkPJ(true);
  function sdSpawn(list) { list.forEach((p, i) => { const a = i / list.length * Math.PI * 2 + rr(-0.3, 0.3); let x = 0, z = 0; for (let k = 0; k < 8; k++) { x = GC.x + Math.cos(a) * (70 - k * 7); z = GC.z + Math.sin(a) * (70 - k * 7); if (isWater(x, z)) break; } Object.assign(p, { x, z, on: true, dead: false, st: 'rise', t: 0, spd: 0, face: Math.atan2(X.C.x - x, X.C.z - z), hp: p.max }); p.g.visible = true; p.bar.visible = true; p.g.rotation.set(0, 0, 0); X.spray(tmp.set(x, 0.5, z), 14, 5); X.ripple(x, z, 4, 0.8); }); }
  function sdHit(p) { p.hp--; const dx = p.x - X.C.x, dz = p.z - X.C.z, l = Math.hypot(dx, dz) || 1; if (isWater(p.x + dx / l * 2, p.z + dz / l * 2)) { p.x += dx / l * 2; p.z += dz / l * 2; } X.puff(tmp.set(p.x, 1.5, p.z), 0xffffff, 6, 3, 0.5, 0.4);
    if (p.hp > 0) { X.popup(tmp.set(p.x, 3.4, p.z), 'SLASH', '#ffffff'); p.st = 'recover'; p.t = 0; p.spd = 4; return; }
    p.dead = true; p.st = 'die'; p.t = 0; p.bar.visible = false; R.kills++; R.sdK++; R.score += p.pts; X.popup(tmp.set(p.x, 3.6, p.z), (p.big ? 'CAPTAIN DOWN' : 'PIRATE SKI DOWN') + ' +' + p.pts, '#ffd23a'); cheer(); X.audio.tone(330, 0.16, 0.05, 'triangle', 1.2); }
  const sdNearest = () => { let b = null, bd = 1e9; for (const p of SD) if (p.on && !p.dead) { const d = Math.hypot(p.x - X.C.x, p.z - X.C.z); if (d < bd) { bd = d; b = p; } } return b; };
  function updShowdown(dt, live) { if (R.phase !== 'boss') return; const C = X.C, Sp = S(), T = X.St.t;
    for (const p of SD) { if (!p.on) continue; p.t += dt; const g = p.g;
      if (p.st === 'die') { g.position.y -= dt * 1.2; g.rotation.z += dt * 1.5; if (p.t > 1.2) { p.on = false; g.visible = false; X.spray(tmp.set(p.x, 0.6, p.z), 14, 5); X.boom(tmp.set(p.x, 1, p.z), 1.8, 0xffb347); } continue; }
      const dx = C.x - p.x, dz = C.z - p.z, d = Math.hypot(dx, dz), want = Math.atan2(dx, dz), turn = r => { const df = Math.atan2(Math.sin(want - p.face), Math.cos(want - p.face)); p.face += clamp(df, -r * dt, r * dt); }, top = p.big ? 17 : 18;
      if (p.st === 'rise') { p.spd = 0; if (p.t > 0.8) { p.st = 'chase'; p.t = 0; } }
      else if (!live) p.spd = damp(p.spd, 0, 2, dt);
      else if (p.st === 'chase') { turn(2.0); p.spd = damp(p.spd, d > 10 ? top : 8, 2, dt); p.cd -= dt; if (d < 20 && p.cd <= 0) { p.st = 'windup'; p.t = 0; p.aim = want; X.audio.tone(140, 0.6, 0.04, 'sawtooth', 2); } }
      else if (p.st === 'windup') { p.spd = damp(p.spd, 2, 4, dt); p.face = damp(p.face, p.aim, 8, dt); if (p.t > 0.9) { p.st = 'dash'; p.t = 0; p.hitP = false; } }
      else if (p.st === 'dash') { p.spd = p.big ? 23 : 25; p.face = p.aim; if (Math.random() < 0.6) X.spray(tmp.set(p.x, 0.4, p.z), 1, 3); if (!p.hitP && d < Sp.r + p.r + 0.4) { p.hitP = true; boatHit(p.big ? 14 : 9, Math.sin(p.aim) * 1.4, Math.cos(p.aim) * 1.4); C.speed *= 0.5; p.st = 'recover'; p.t = 0; } else if (p.t > 1.1) { p.st = 'recover'; p.t = 0; } }
      else if (p.st === 'recover') { p.spd = damp(p.spd, 5, 2, dt); p.face += dt * 1.4; if (p.t > 1.0) { p.st = 'chase'; p.t = 0; p.cd = rr(1.2, 2.4); } }
      const nx = p.x + Math.sin(p.face) * p.spd * dt, nz = p.z + Math.cos(p.face) * p.spd * dt; if (isWater(nx, nz) && Math.abs(nx) < 270 && nz > 372 && nz < 684) { p.x = nx; p.z = nz; } else { p.face += dt * 2.5; p.spd *= 0.9; }
      { const [lx, lz] = galLocal(p.x, p.z); if (Math.abs(lx) < 6 && lz > -13 && lz < 15.5) { const [wx, wz] = galWorld((lx < 0 ? -1 : 1) * 6, lz); p.x = wx; p.z = wz; } }
      if (d < Sp.r + p.r) { const l = d || 1, mn = Sp.r + p.r; p.x = C.x - dx / l * mn; p.z = C.z - dz / l * mn; }
      for (const q of SD) if (q !== p && q.on && !q.dead) { const ex = p.x - q.x, ez = p.z - q.z, e2 = Math.hypot(ex, ez); if (e2 < 3.6 && e2 > 0.01) { p.x += ex / e2 * (3.6 - e2) * 0.5; p.z += ez / e2 * (3.6 - e2) * 0.5; } }
      const wy = X.waveH(p.x, p.z, T); g.position.set(p.x, p.st === 'rise' ? wy - 1.5 + p.t / 0.8 * 1.55 : wy + 0.05, p.z); g.rotation.order = 'YXZ'; g.rotation.set(-clamp(p.spd / 30, 0, 1) * 0.12 + Math.sin(T * 2 + p.x) * 0.05, p.face, Math.cos(T * 1.7 + p.z) * 0.06);
      p.bar.position.set(p.x, 4.4 + (p.big ? 0.8 : 0), p.z); p.bf.scale.x = 3 * Math.max(0, p.hp / p.max);
      ck.animate(p.rd, p.st === 'windup' ? 'windup' : p.st === 'dash' ? 'attack' : 'idle', p.t, dt, {}); const P = p.rd.userData.P; if (P) P.legs.forEach(l => l.rotation.x = -1.3); if (p.rd.userData.events) p.rd.userData.events.length = 0;
      if (p.spd > 6 && Math.random() < (touch ? 0.2 : 0.45)) X.ripple(p.x - Math.sin(p.face) * 1.8, p.z - Math.cos(p.face) * 1.8, 1.8, 0.4); }
    if (R.state === 'run' && R.sdW > 0 && !SD.some(p => p.on)) { R.sdNext = (R.sdNext || 0) + dt; if (R.sdNext > 1.6) { R.sdNext = 0; if (R.sdW === 1) { R.sdW = 2; sdSpawn(SD.slice(3)); banner('WAVE 2 · THE CORSAIR CAPTAIN RIDES OUT!', 3); radio('Here comes the Captain himself! Keep slashing!'); } else { R.sdW = 0; openGate(); } } } }
  function openGate() { R.phase = 'chase'; R.chaseT = 99; R.cp = { x: X.C.x, z: X.C.z, yaw: X.C.yaw }; banner('SHOWDOWN WON! The Hideout gate is open. Ride in!', 4); radio('You beat them all! Ride into the hideout!'); X.audio.tone(523, 0.2, 0.06, 'triangle', 1); setTimeout(() => X.audio.tone(784, 0.3, 0.06, 'triangle', 1), 160); }
  function startShowdown() { R.phase = 'boss'; R.sdW = 1; R.cp = { x: GC.x, z: GC.z - 60, yaw: 0 }; sdSpawn(SD.slice(0, 3)); banner('5 · SHOWDOWN! Pirate jet skis. SWORD ONLY: press 2 when they get close', 5); radio('Pirate jet skis! The hose is no good here. Use your sword!'); X.audio.tone(220, 0.4, 0.06, 'sawtooth', 1.5); }

  // ---------- damage, KO, respawn ----------
  function boatHit(n, kx = 0, kz = 0) { if (R.state !== 'run' || R.down > 0 || R.board) return; if (R.auto) n = Math.max(1, Math.round(n * 0.4));   // demo: tougher ski so the watch-through reaches the end
    R.hp = Math.max(0, R.hp - n); R.hurt = 1; if (R.phase === 'canals') R.secHit[R.sec]++; X.St.shake = Math.max(X.St.shake, 0.3 + n * 0.02); X.popup(tmp.set(X.C.x, X.C.y + 3.5, X.C.z), '-' + n, '#ec3013'); X.audio.burst(0.2, 500, 0.25); if (kx || kz) { const nx = X.C.x + kx, nz = X.C.z + kz; if (isWater(nx, nz)) { X.C.x = nx; X.C.z = nz; } }
    if (R.hp <= 0) { R.down = 2.6; R.deaths++; X.boom(tmp.set(X.C.x, 1, X.C.z), 3); banner('KNOCKED OFF THE SKI · BACK IN 2 S', 2.6); X.C.speed = 0; } }
  function respawn(why) { const p = R.cp || start; X.place(p.x, p.z, p.yaw); R.hp = 100; R.lastW = [p.x, p.z]; let lost = 0; for (const tk of R.since) { if (!tk.got) continue; tk.got = false; tk.g.visible = true; R.tokens--; R.score -= 50; lost++; } R.since = [];
    for (const b of BRIDGES) if (b.s > R.cpS) b.dropped = false; for (const f of FL) scene.remove(f.g); FL.length = 0; for (const b of bolts) scene.remove(b.m); bolts.length = 0; for (const b of balls) scene.remove(b.m); balls.length = 0; for (const e of EN) if (e.type === 'cannon' && e.ring) e.ring.visible = false;
    if (R.phase === 'canals') R.clock = Math.max(R.clock, 25);
    if (R.phase === 'chase') for (const e of CHASE) if (!e.dead) spawnChase(e);
    banner((why === 'time' ? 'TIME UP · BACK TO GATE ' + Math.max(1, R.cpI + 1) : 'BACK IN!') + (lost ? ' · LOST ' + lost + ' TOKEN' + (lost > 1 ? 'S' : '') : ''), 2.6); }
  function ko(e, label, pts) { if (e.dead) return; e.dead = true; R.kills++; R.score += pts; X.popup(tmp.set(e.x, (e.y || 0) + 3.6, e.z), label + ' +' + pts, '#ffd23a'); cheer(); X.audio.tone(330, 0.16, 0.05, 'triangle', 1.2); setTimeout(() => X.audio.tone(495, 0.2, 0.05, 'triangle', 1.2), 90); }

  // ---------- weapons: the jet ski's own HOSE · TRICK · HOP, gated by course state ----------
  function press(n, down) { const C = X.C; if (R.state !== 'run' || R.down > 0 || R.board || (R.race && R.race.st === 'count')) return true;
    if (n === 2) { if (down) swing(); return true; }
    if (n === 1 && R.phase === 'boss') { if (down) X.popup(tmp.set(C.x, 3, C.z), 'SWORD ONLY IN THE SHOWDOWN · PRESS 2', '#ffd23a'); return true; }
    if (n === 1) { if (!down) { R.hoseHeld = false; return true; } if (R.hose <= 0) { X.popup(tmp.set(C.x, 3, C.z), 'HOSE EMPTY · GRAB A PRESSURE BARREL', '#9ca3af'); return true; } R.hose--; R.hoseT = 1.0; R.hoseUse = 0; R.hoseHeld = true; R.refT = 0; return false; }
    return false; }
  function hoseHits(dt) { const C = X.C, fx0 = Math.sin(C.yaw), fz0 = Math.cos(C.yaw), inCone = (x, z, reach = 20) => { const dx = x - C.x, dz = z - C.z, al = dx * fx0 + dz * fz0; if (al < 0 || al > reach) return false; return Math.abs(dx * fz0 - dz * fx0) < 1.8 + al * 0.14; };
    const wetFx = (x, y, z) => { if (Math.random() < 0.35) X.puff(tmp.set(x, y, z), 0x9fe3ff, 2, 2.5, 0.5, 0.4); };
    for (const e of EN) { if (e.dead || e.gone) continue; let ok = false;
      if (e.type === 'cutlass') ok = (e.st === 'wait' || e.st === 'windup' || e.st === 'swim') && inCone(e.x, e.z, e.st === 'swim' ? 14 : 22);
      else if (e.type === 'gunner') ok = inCone(e.x, e.z, 26); else if (e.type === 'cannon') ok = e.st !== 'out' && inCone(e.x, e.z, 24); else if (e.type === 'skiff') ok = e.st !== 'off' && e.st !== 'sink' && inCone(e.x, e.z, 18);
      if (!ok) continue; e.wet += dt; wetFx(e.x, (e.y || 0.5) + 1.4, e.z);
      if (e.wet >= e.hpT) { if (e.type === 'cutlass') { if (e.st === 'swim') { ko(e, 'DUNKED', 30); e.st = 'sinkaway'; e.t = 0; } else { ko(e, 'SOAKED OFF', e.pts); e.st = 'fall'; e.t = 0; e.p0 = [e.x, e.y, e.z]; const sg = Math.sign((e.b.x - C.x) * e.b.ux + (e.b.z - C.z) * e.b.uz) || 1; e.p1 = [e.x + e.b.ux * sg * 4, e.z + e.b.uz * sg * 4]; ck.enter(e.f, 'hurt'); } }
        else if (e.type === 'gunner') { ko(e, 'GUNNER DOWN', e.pts); e.st = 'fall'; e.t = 0; e.tell.visible = false; ck.enter(e.f, 'die'); }
        else if (e.type === 'cannon') { ko(e, 'FUSE OUT', e.pts); e.st = 'out'; e.fuse.visible = false; e.ring.visible = false; X.puff(tmp.set(e.x, e.y + 2, e.z), 0xcfd6dc, 8, 2, 1.2, 1.2); }
        else if (e.type === 'skiff') { ko(e, 'SKIFF SUNK', e.pts); e.st = 'sink'; e.t = 0; e.lane.visible = false; } } }
    for (const pt of GAL.ports) { if (pt.shut || GAL.st !== 'circle') continue; portW(pt, tmp); if (!inCone(tmp.x, tmp.z, 22)) continue; pt.wet += dt; wetFx(tmp.x, tmp.y, tmp.z); if (pt.wet >= 0.9) { pt.shut = true; pt.wind = 0; pt.lane.visible = false; pt.gl.material.opacity = 0; R.ports++; R.score += 80; X.popup(tmp.set(tmp.x, 5, tmp.z), 'PORT SHUT +80', '#ffd23a'); X.puff(tmp, 0xcfd6dc, 8, 2, 1, 1); banner('PORT SHUT · ' + R.ports + ' / 6', 2); X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.4); } }
    for (const f of FL) if (!f.dead && !f.falling && inCone(f.x, f.z, 18)) { f.vx += fx0 * 14 * dt; f.vz += fz0 * 14 * dt; }
    for (const fl of FLM) if (!fl.fly && inCone(fl.g.position.x, fl.g.position.z, 16)) { fl.fly = 0.001; }
  }
  function splash(r) { const C = X.C; X.ripple(C.x, C.z, r, 1); X.spray(tmp.set(C.x, 0.6, C.z), 22, 7); for (const e of EN) { if (e.dead || e.gone) continue; const d = Math.hypot(e.x - C.x, e.z - C.z); if (d > r) continue; if (e.type === 'skiff' && e.st !== 'off' && e.st !== 'sink') { ko(e, 'CAPSIZED', e.pts); e.st = 'sink'; e.t = 0; e.lane.visible = false; } else if (e.type === 'cutlass' && e.st === 'swim') { ko(e, 'DUNKED', 30); e.st = 'sinkaway'; e.t = 0; } } for (const f of FL) if (!f.dead && !f.falling) { const dx = f.x - C.x, dz = f.z - C.z, d = Math.hypot(dx, dz); if (d < r) { f.vx += dx / (d || 1) * 10; f.vz += dz / (d || 1) * 10; } } }

  // ---------- GUIDANCE: next-goal arrow, guide line, lit lamps, chevrons, wrong-way radio, off-course sea mist ----------
  function goal() { const RC = R.race;
    if (R.phase === 'canals') { const i = R.cpI + 1; if (i < NGT) return { x: GTS[i].x, z: GTS[i].z, label: 'GATE ' + (i + 1) + '/' + NGT }; return { x: GATES[0][0], z: GATES[0][1], label: 'RACE START' }; }
    if (R.phase === 'race' && RC) { if (RC.st !== 'go') return { x: GATES[0][0], z: GATES[0][1], label: RC.st === 'wait' ? 'RACE START' : 'START' }; const gi = (RC.k + 1) % NG; return { x: GATES[gi][0], z: GATES[gi][1], label: gi === 0 ? 'FINISH' : 'GATE ' + (gi + 1) + '/' + NG }; }
    if (R.phase === 'boss') { const t2 = sdNearest(); return t2 ? { x: t2.x, z: t2.z, label: t2.big ? 'CAPTAIN' : 'PIRATE SKI' } : { x: GC.x, z: GC.z, label: 'SHOWDOWN' }; }
    return { x: HG.x, z: HG.z, label: 'HIDEOUT' }; }
  const segs = (pts, closed) => { const out = []; for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) out.push([pts[i], pts[(i + 1) % pts.length]]); return out; };
  const PSEG = segs(MAIN, false), RSEG = segs(GATES, true);
  const dSeg = (S2, x, z) => { let m = 1e9; for (const [[ax, az], [bx, bz]] of S2) m = Math.min(m, segDist(x, z, ax, az, bx, bz)); return m; };
  const arrSh = new THREE.Shape([[-0.5, 1.6], [0.5, 1.6], [0.5, 0.6], [1.1, 0.6], [0, -0.8], [-1.1, 0.6], [-0.5, 0.6]].map(([a, b]) => new THREE.Vector2(a, b))), arrG = new THREE.ExtrudeGeometry(arrSh, { depth: 0.5, bevelEnabled: false }); arrG.translate(0, 0, -0.25);
  const nextArrow = new THREE.Group(); scene.add(nextArrow); M(arrG, new THREE.MeshBasicMaterial({ color: 0xffd23a }), 0, 0, 0, nextArrow, 0.06); nextArrow.add(SPR(glow(0xffd23a, 0.55), V3(0, 0.4, 0), V3(5, 5, 1))); nextArrow.scale.setScalar(2.2); nextArrow.visible = false;
  const GN = 28, gPos = new Float32Array((GN + 1) * 6), gUv = new Float32Array((GN + 1) * 4), gIdx = []; for (let i = 0; i < GN; i++) { const a = i * 2; gIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const gGeo = new THREE.BufferGeometry(); gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3)); gGeo.setAttribute('uv', new THREE.BufferAttribute(gUv, 2)); gGeo.setIndex(gIdx);
  const dashT = CT(64, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(4, 150); g.lineTo(32, 40); g.lineTo(60, 150); g.lineTo(60, 200); g.lineTo(32, 100); g.lineTo(4, 200); g.closePath(); g.fill(); }); dashT.wrapT = THREE.RepeatWrapping;
  const gMat = new THREE.MeshBasicMaterial({ map: dashT, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }), gLine = new THREE.Mesh(gGeo, gMat); gLine.frustumCulled = false; gLine.renderOrder = 3; gLine.visible = false; scene.add(gLine);
  const chevs = []; { const cT = CT(256, 256, (g) => { g.beginPath(); g.moveTo(28, 200); g.lineTo(128, 70); g.lineTo(228, 200); g.lineTo(228, 150); g.lineTo(128, 20); g.lineTo(28, 150); g.closePath(); g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.stroke(); }), cM = new THREE.MeshBasicMaterial({ map: cT, transparent: true, depthWrite: false });
    for (let s = 30; s < PATH_LEN; s += 40) { const p = at(s), g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = Math.atan2(p.ux, p.uz); scene.add(g); M(new THREE.BoxGeometry(4.4, 0.25, 4.4), white, 0, 0, 0, g, 0.02); const pl = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), cM); pl.rotation.set(-Math.PI / 2, 0, Math.PI); pl.position.y = 0.14; g.add(pl); chevs.push({ g, x: p.x, z: p.z }); } }
  function radio(s) { if (R.radioCd > 0) return; R.radio = s; R.radioT = 4.5; R.radioCd = 10; X.audio.tone(1800, 0.05, 0.04, 'square', 1); setTimeout(() => X.audio.tone(1400, 0.07, 0.04, 'square', 1), 90); }
  function guide(dt, sp) { const C = X.C, T = X.St.t, g = goal(); R.goal = g; R.radioT = Math.max(0, (R.radioT || 0) - dt); R.radioCd = Math.max(0, (R.radioCd || 0) - dt); if (R.radioT <= 0) R.radio = '';
    if (!touch || R.fr % 2) for (const ch of chevs) { ch.g.visible = R.phase === 'canals'; if (ch.g.visible) { ch.g.position.y = W(ch.x, ch.z) + 0.1; ch.g.rotation.z = Math.sin(T * 1.4 + ch.x) * 0.08; } }
    const live = R.state === 'run' && !R.board; gLine.visible = nextArrow.visible = false; if (!live) return;
    const dx = g.x - C.x, dz = g.z - C.z, gd = Math.hypot(dx, dz); R.gd = gd;
    nextArrow.visible = gd > 22; nextArrow.position.set(g.x, 10 + Math.sin(T * 3) * 0.6, g.z); nextArrow.rotation.y += dt * 1.6;
    const off = R.phase === 'canals' ? R.lat : R.phase === 'race' && R.race && R.race.st === 'go' ? dSeg(RSEG, C.x, C.z) : 0; R.offK = damp(R.offK || 0, clamp((off - 40) / 30, 0, 1), 2, dt);
    const fx0 = Math.sin(C.yaw), fz0 = Math.cos(C.yaw), dot = gd > 1 ? (fx0 * dx + fz0 * dz) / gd : 1;
    if (gd > 30 && dot < -0.25 && sp > 3 && !(R.race && R.race.st === 'count') && R.phase !== 'boss') R.wwT = (R.wwT || 0) + dt; else R.wwT = 0;
    if (gd > 12) { gLine.visible = true; const sx = C.x + fx0 * 4, sz = C.z + fz0 * 4, lx = g.x - sx, lz = g.z - sz, L = Math.hypot(lx, lz) || 1, px = lz / L * 0.8, pz = -lx / L * 0.8;
      for (let i = 0; i <= GN; i++) { const u = i / GN, x = sx + lx * u, z = sz + lz * u, y = Math.max(W(x, z), heightAt(x, z)) + 0.3, v = u * L / 4 - T * 1.5; gPos.set([x - px, y, z - pz, x + px, y, z + pz], i * 6); gUv.set([0, v, 1, v], i * 4); }
      gGeo.attributes.position.needsUpdate = true; gGeo.attributes.uv.needsUpdate = true; gMat.opacity = damp(gMat.opacity, R.race ? 0.55 : clamp(0.22 + R.offK * 0.6 + (R.wwT > 1 ? 0.4 : 0), 0, 0.9), 4, dt); }
    if (scene.fog) { scene.fog.near = 170 - R.offK * 120; scene.fog.far = 540 - R.offK * 340; }
    if (R.offK > 0.2) { X.St.shake = Math.max(X.St.shake, 0.05 * R.offK); C.speed = Math.min(C.speed, S().max * (1 - 0.2 * R.offK)); }
    if (R.wwT > 3) { if (!(R.bannerT > 0.3 && R.banner.startsWith('WRONG'))) banner('WRONG WAY · ' + g.label + ' IS BEHIND YOU', 1.2); radio(R.phase === 'race' ? 'Wrong way, rider! The buoys are behind you!' : 'Turn around, rider! ' + g.label.charAt(0) + g.label.slice(1).toLowerCase() + ' is behind you.'); }
    else if (R.offK > 0.6) { R.offT = (R.offT || 0) + dt; if (R.offT > 3) radio(R.phase === 'canals' ? 'Nice side trip. Follow the yellow line back to the canal!' : 'You are off the buoys. Follow the yellow line!'); } else R.offT = 0;
    if (R.phase === 'canals' && R.clock < 8 && R.clock > 0) radio('The clock, rider! Make the next gate!');
    R.lampT = (R.lampT || 0) - dt; if (R.lampT <= 0) { R.lampT = 0.25; const L2 = gd * gd || 1; for (const l of lampSpr) { const u = clamp(((l.x - C.x) * dx + (l.z - C.z) * dz) / L2, 0, 1), dl = Math.hypot(l.x - C.x - dx * u, l.z - C.z - dz * u), on = R.phase !== 'canals' || Math.hypot(l.x - g.x, l.z - g.z) < 60 || dl < 30; l.sp.material.opacity = on ? 0.9 : 0.15; } } }
  X.setPaused(true);

  // ---------- update ----------
  function update(dt, thr, sp, rdt) {
    const C = X.C, Sp = S(), T = X.St.t; R.fr = (R.fr || 0) + 1;
    R.bannerT = Math.max(0, R.bannerT - rdt); R.hurt = Math.max(0, R.hurt - rdt * 1.6); R.ramCd = Math.max(0, R.ramCd - dt); R.bumpCd = Math.max(0, R.bumpCd - dt);
    const live = R.state === 'run' && !R.board && R.down <= 0, counting = R.race && R.race.st === 'count';
    if (R.state === 'run' && !counting) R.t += dt;
    { R.ct = (R.ct || 0) + rdt; bCoins.forEach(c => c.rotation.y = R.ct * 2.6); const op = 0.55 + 0.45 * Math.cos(R.ct * 5.2); bcM.forEach(m => m.opacity = op); }
    for (const sp2 of spinners) sp2.rotation.z += dt * 0.8;
    // Jamos + bubble
    const dJ = Math.hypot(C.x - BD.x, C.z - BD.z); bub.visible = dJ < 45; X.kit.animFox(jamos, dt, 0, false); if (hop > 0) { hop -= dt * 1.4; jamos.position.y = JY + Math.abs(Math.sin(hop * 9)) * 0.4; jamos.userData.P.arms.forEach(a => a.rotation.x = -2.8); } else { jamos.position.y = JY; jamos.userData.P.arms.forEach(a => a.rotation.x = damp(a.rotation.x, 0, 6, dt)); }
    if (R.state === 'run') say(dJ < 16 ? 'Down the canal! Mind the bridges!' : 'Gates on the clock, rider!');
    // board: idle by the quay to read it again
    const dB = Math.hypot(C.x - (BD.x + 6), C.z - BD.z); if (dB > 18) R.armed = true; if (R.state === 'run' && R.armed && dB < 7 && sp < 5) { R.armed = false; R.board = true; X.setPaused(true); }
    if (R.down > 0) { R.down -= dt; C.speed = 0; if (Math.random() < 0.6) X.puff(tmp.set(C.x, 1.6, C.z), 0x2a2826, 1, 1.5, 1.4, 1.2); if (R.down <= 0) respawn('ko'); }
    // canal walls: slide along the bank, bounce off it head-on
    if (C.y < 3.2) { if (isWater(C.x, C.z)) R.lastW = [C.x, C.z]; else if (R.lastW) { const [lx, lz] = R.lastW; if (isWater(C.x, lz)) { C.z = lz; C.speed *= 0.985; } else if (isWater(lx, C.z)) { C.x = lx; C.speed *= 0.985; } else { C.x = lx; C.z = lz; if (Math.abs(C.speed) > 5 && R.bumpCd <= 0) { R.bumpCd = 0.5; X.St.shake = Math.max(X.St.shake, 0.25); X.audio.burst(0.15, 300, 0.2); X.spray(tmp.set(C.x, 0.5, C.z), 6, 3); if (C.speed > 17) boatHit(4); } C.speed *= -0.25; } } }
    // galleon hull is solid
    { const [lx, lz] = galLocal(C.x, C.z); if (GAL.st !== 'gone' && Math.abs(lx) < 5.4 && lz > -12 && lz < 14.5 && C.y < 5) { const sx = lx < 0 ? -1 : 1, [wx, wz] = galWorld(sx * 5.4, lz); if (GAL.st === 'list' && sp > 11 && R.ramCd <= 0) { R.ramCd = 1.2; GAL.rams++; R.score += 150; X.St.shake = Math.max(X.St.shake, 0.7); X.popup(tmp.set(C.x, 4, C.z), 'RAM ' + GAL.rams + '/3 +150', '#ec3013'); X.puff(tmp.set(C.x, 2, C.z), 0x8a5a32, 14, 5, 0.6, 0.9); X.audio.burst(0.4, 200, 0.3); C.speed = -6; GAL.hitK = 1; if (GAL.rams >= 3) sinkGalleon(); }
        else if (GAL.st === 'list' && R.ramCd <= 0 && sp > 3) { R.ramCd = 1.2; X.popup(tmp.set(C.x, 4, C.z), 'FASTER! FULL THROTTLE OR A TRICK BOOST', '#9ca3af'); }
        if (isWater(wx, wz)) { C.x = wx; C.z = wz; } C.speed *= 0.6; } }
    // HOSE: one burst per tap, stream while held (desktop), tank refills slowly
    { const on = R.hoseT > 0 || R.hoseHeld; R.hoseT -= dt; if (on) { R.hoseUse += dt; if (R.hoseHeld && R.hoseT <= 0) { if (R.hose > 0) { R.hose--; R.hoseT = 1.0; } else R.hoseHeld = false; } } if (!(R.hoseT > 0 || R.hoseHeld)) { X.holds.b1 = false; R.refT += dt; if (R.refT > 3 && R.hose < 8) { R.hose++; R.refT = 0; } } else { X.holds.b1 = live; if (live) hoseHits(dt); } }
    // TRICKS: spin-out splash flips skiffs; a landed barrel roll gives a TRICK BOOST
    if (C.spinT2 != null) { if (!R.spinSeen && live) { R.spinSeen = true; splash(8); R.score += 20; } } else R.spinSeen = false;
    if (R.prevRoll != null && C.rollT == null && C.ground && live) { if (R.prevRoll >= 0.8) { C.nitro = Math.max(C.nitro || 0, 1.6); R.score += 70; X.popup(tmp.set(C.x, 4, C.z), 'TRICK BOOST', '#38bdf8'); X.audio.tone(660, 0.3, 0.05, 'sawtooth', 2); } } R.prevRoll = C.rollT;
    if (R.tangleT > 0) { R.tangleT -= dt; C.speed = Math.min(C.speed, 6); if (Math.random() < 0.4) X.spray(tmp.set(C.x, 0.4, C.z), 1, 2); }
    // canal progress: gates, clock, sections
    const [ps, plat] = pathS(C.x, C.z); R.s = ps; R.lat = plat;
    if (R.phase === 'canals' && R.state === 'run') {
      for (let i = R.cpI + 1; i < Math.min(NGT, R.cpI + 3); i++) { const gt = GTS[i], dx = C.x - gt.x, dz = C.z - gt.z, al = dx * gt.ux + dz * gt.uz, lat = Math.abs(dx * gt.uz - dz * gt.ux); if (Math.abs(al) < 4 && lat < gt.hw + 2) { for (let j = R.cpI + 1; j <= i; j++) { GTS[j].done = true; GTS[j].glows.forEach(g2 => g2.material.color.set(0x7cff9b)); } R.cpI = i; R.cpS = gt.s; R.cp = { x: gt.x, z: gt.z, yaw: Math.atan2(gt.ux, gt.uz) }; R.since = []; R.clock = Math.min(60, R.clock + 10); X.audio.tone(990, 0.1, 0.05, 'triangle', 1.4); setTimeout(() => X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.4), 80); banner('GATE ' + (i + 1) + ' / ' + NGT + ' · +10 S', 1.8);
          if (i === NGT - 1) { endSection(3); R.phase = 'race'; R.race = { st: 'wait', k: 0 }; gateG.forEach(g2 => g2.visible = true); R.cp = { x: 30, z: 380, yaw: 0.3 }; banner('4 · OPEN SEA: RIVAL RACE · go to the chequered start buoys. Finish TOP 2', 5); radio('Out of the canals! Race Jorn, Jib and Jetsam to the start buoys!'); } break; } }
      if (R.phase === 'canals' && !R.board) { R.clock -= dt; if (R.clock <= 0) { R.timeUps++; R.clock = 0; respawn('time'); } }
      const sc = secAt(ps); if (sc > R.sec && R.cpI >= 0) { endSection(R.sec); R.sec = sc; banner(sc === 2 ? '2 · WOOD BRIDGES: pirates on the bridges. Hose them off (1)' : '3 · ROPE BRIDGES: they swing down on ropes. Keep moving!', 4); }
    }
    updEnemies(dt, sp, live);
    // floating barrels dropped from the bridges
    for (let i = FL.length - 1; i >= 0; i--) { const f = FL[i]; if (f.dead) continue; if (f.falling) { f.vy -= 20 * dt; f.y += f.vy * dt; f.g.rotation.x += dt * 5; if (f.y <= W(f.x, f.z)) { f.falling = false; X.spray(tmp.set(f.x, 0.5, f.z), 10, 5); X.ripple(f.x, f.z, 3, 0.8); f.g.rotation.x = Math.PI / 2; } }
      else { f.vx *= 1 - dt * 0.8; f.vz *= 1 - dt * 0.8; const nx = f.x + f.vx * dt, nz = f.z + f.vz * dt; if (isWater(nx, nz)) { f.x = nx; f.z = nz; } else { f.vx *= -0.5; f.vz *= -0.5; } f.y = W(f.x, f.z) + 0.1; f.g.rotation.z = Math.sin(T * 1.5 + f.x) * 0.15;
        if (Math.hypot(f.x - C.x, f.z - C.z) < Sp.r + 1.0 && C.y < f.y + 1.0 && live) { f.dead = true; f.g.visible = false; if (f.red) { X.boom(tmp.set(f.x, 1, f.z), 3, 0xff8a1a); boatHit(10); } else { X.puff(tmp.set(f.x, 1, f.z), 0x8a5a32, 10, 4, 0.5, 0.8); boatHit(5); } } }
      f.g.position.set(f.x, f.y, f.z); }
    // nets
    for (const n of NETS) { n.g.position.y = W(n.x, n.z) - 0.05; const dx = C.x - n.x, dz = C.z - n.z, al = dx * n.ux + dz * n.uz, lat = Math.abs(dx * n.uz - dz * n.ux), inside = Math.abs(al) < 2.8 && lat < n.w / 2;
      if (inside && !n.inside && live) { if (C.ground && C.y < W(C.x, C.z) + 0.8) { R.tangleT = 1.3; X.popup(tmp.set(C.x, 3, C.z), 'TANGLED! HOP THE NETS (3)', '#ec3013'); X.audio.burst(0.3, 400, 0.2); } else if (!n.hopped) { n.hopped = true; R.score += 40; X.popup(tmp.set(C.x, 4, C.z), 'HOPPED THE NET +40', '#ffd23a'); } } n.inside = inside; if (Math.abs(al) > 40) n.hopped = false; }
    // pickups
    for (const tk of tokens) { tk.t += dt; if (tk.got) { if (tk.kind === 'pressure') { tk.back -= dt; if (tk.back <= 0) { tk.got = false; tk.g.visible = true; } } continue; } if (R.fr % 2 && touch && Math.abs(tk.z - C.z) > 120) continue; tk.g.rotation.y += dt * 2.6; tk.g.position.y = tk.y + Math.sin(tk.t * 2.2) * 0.18 + (tk.y < 2 ? W(tk.x, tk.z) : 0);
      if (live && Math.hypot(tk.x - C.x, tk.z - C.z) < Sp.r + 1.0 && Math.abs(C.y + 1.2 - tk.g.position.y) < 2.6) { tk.got = true; tk.g.visible = false; X.puff(tmp.set(tk.x, tk.y, tk.z), tk.kind === 'coin' || tk.kind === 'chest' ? 0xffd23a : tk.kind === 'wrench' ? 0x22c55e : 0x38bdf8, 6, 3, 0.6, 0.4, true);
        if (tk.kind === 'coin') { R.tokens++; R.score += 50; R.since.push(tk); X.popup(tmp.set(tk.x, tk.y + 1.6, tk.z), R.tokens + ' / ' + R.totalTokens, '#e6b45a'); X.audio.tone(1320, 0.08, 0.05, 'triangle', 1.5); setTimeout(() => X.audio.tone(1760, 0.1, 0.04, 'triangle', 1.2), 70); if (R.tokens === R.totalTokens) { banner('EVERY TOKEN! +300', 3); R.score += 300; } }
        else if (tk.kind === 'chest') { R.treasure++; R.score += 150; banner('TREASURE! ' + R.treasure + ' / ' + R.totalTreasure + ' · +150', 2.5); X.audio.tone(784, 0.15, 0.05, 'triangle', 1.4); setTimeout(() => X.audio.tone(1046, 0.25, 0.05, 'triangle', 1.4), 120); }
        else if (tk.kind === 'wrench') { tk.back = 1e9; save.give('repairKit'); X.popup(tmp.set(tk.x, tk.y + 1.6, tk.z), 'REPAIR KIT +1', '#22c55e'); banner('REPAIR KIT: in your ITEMS. Use it to patch the ski', 3); X.audio.tone(660, 0.2, 0.05, 'triangle', 1.6); }
        else { tk.back = 25; R.hose = Math.min(8, R.hose + 4); X.popup(tmp.set(tk.x, tk.y + 1.6, tk.z), 'HOSE +4', '#38bdf8'); X.audio.tone(880, 0.12, 0.05, 'triangle', 1.6); } } }
    // bolts + cannonballs
    for (let i = bolts.length - 1; i >= 0; i--) { const b = bolts[i]; b.life -= dt; b.m.position.addScaledVector(b.v, dt); const p = b.m.position; let end = b.life <= 0 || p.y < 0;
      if (!end && Math.hypot(p.x - C.x, p.z - C.z) < Sp.r + 0.3 && Math.abs(p.y - C.y - 1) < 2) { boatHit(b.dmg); end = true; }
      if (end) { X.spray(p, 4, 2); scene.remove(b.m); bolts.splice(i, 1); } }
    for (let i = balls.length - 1; i >= 0; i--) { const b = balls[i]; b.t += dt; let end = false;
      if (b.arc) { const k = Math.min(1, b.t / b.dur); b.m.position.set(b.p0.x + (b.p1.x - b.p0.x) * k, b.p0.y + (b.p1.y - b.p0.y) * k + 14 * 4 * k * (1 - k), b.p0.z + (b.p1.z - b.p0.z) * k); if (k >= 1) { end = true; X.spray(tmp.set(b.p1.x, 0.6, b.p1.z), 18, 7); X.ripple(b.p1.x, b.p1.z, 5, 1); X.audio.burst(0.3, 300, 0.25); if (Math.hypot(C.x - b.p1.x, C.z - b.p1.z) < 4.8 && C.y < W(C.x, C.z) + 2.5) boatHit(14, (C.x - b.p1.x) * 0.3, (C.z - b.p1.z) * 0.3); if (b.ring) b.ring.visible = false; } }
      else { b.m.position.addScaledVector(b.v, dt); b.life -= dt; const p = b.m.position; if (Math.hypot(p.x - C.x, p.z - C.z) < 2.8 && live) { boatHit(12, b.v.x * 0.03, b.v.z * 0.03); end = true; } if (b.life <= 0) end = true; if (end) { X.spray(tmp.set(p.x, 0.5, p.z), 12, 5); X.ripple(p.x, p.z, 3, 0.8); } }
      if (end) { scene.remove(b.m); balls.splice(i, 1); } }
    // flamingos + monkeys
    for (const fl of FLM) { fl.t += dt; const g = fl.g; if (fl.fly > 0) { fl.fly += dt; g.position.y += dt * 6; g.position.x += Math.sin(g.rotation.y) * dt * 8; g.position.z += Math.cos(g.rotation.y) * dt * 8; fl.wings.forEach((w, i) => w.rotation.z = (i ? -1 : 1) * Math.sin(fl.t * 16) * 0.9); fl.neck.rotation.x = 0.9; if (fl.fly > 6) { fl.fly = 0; fl.back = 18; g.visible = false; } continue; }
      if (fl.back > 0) { fl.back -= dt; if (fl.back <= 0) { g.visible = true; g.position.set(fl.hx, 0, fl.hz); fl.neck.rotation.x = 0; fl.wings.forEach(w => w.rotation.z = 0); } continue; }
      if (Math.abs(fl.hz - C.z) > 140) continue; g.position.y = W(fl.hx, fl.hz) - 0.9; fl.neck.rotation.x = Math.max(0, Math.sin(fl.t * 0.7)) * 1.6; if (Math.hypot(fl.hx - C.x, fl.hz - C.z) < 10 && sp > 8) { fl.fly = 0.001; g.rotation.y = Math.atan2(fl.hx - C.x, fl.hz - C.z); X.audio.tone(1500, 0.08, 0.03, 'triangle', 1.6); X.spray(tmp.set(fl.hx, 0.5, fl.hz), 6, 3); } }
    for (const m of MONK) { m.t += dt; const d = Math.hypot(m.g.position.x - C.x, m.g.position.z - C.z); if (d > 120) continue; if (d < 12 && m.jump <= 0) m.jump = 1; if (m.jump > 0) { m.jump -= dt * 1.5; m.g.position.y = m.y0 + Math.abs(Math.sin(m.jump * 9)) * 0.7; m.arms.forEach(a => a.rotation.z = (a.position.x > 0 ? -1 : 1) * 2.6); } else { m.g.position.y = m.y0 + Math.abs(Math.sin(m.t * 3)) * 0.05; m.arms.forEach(a => a.rotation.z = damp(a.rotation.z, 0, 4, dt)); } m.g.rotation.y = Math.atan2(C.x - m.g.position.x, C.z - m.g.position.z); }
    updSword(dt); updShowdown(dt, live);
    if (R.auto) autopilot(dt, sp);
    updScenes(dt); updRace(dt, sp); updGalleon(dt, sp, live); updChase(dt, live);
    guide(dt, sp);
  }
  // ---------- DEMO AUTOPILOT: rides the whole run by itself (watch mode) ----------
  function autopilot(dt, sp) { const C = X.C, A = R.ap || (R.ap = { stuck: 0, tap3: 0, tap2: 0 }); if (R.state !== 'run' || R.down > 0) { X.drive(0, 0); return; }
    if (R.board) { R.board = false; X.setPaused(false); }
    let tx, tz, thr = 1, face = null; const fx0 = Math.sin(C.yaw), fz0 = Math.cos(C.yaw);
    if (R.phase === 'canals') { const [s] = pathS(C.x, C.z), p = at(Math.min(PATH_LEN, s + 24)); tx = p.x; tz = p.z; let best = null, bd = 1e9; for (const tk of tokens) { if (tk.got || tk.kind !== 'coin') continue; const dx = tk.x - C.x, dz = tk.z - C.z, al = dx * fx0 + dz * fz0, d = Math.hypot(dx, dz); if (al > 6 && al < 26 && d < bd && Math.abs(dx * fz0 - dz * fx0) < 6) { bd = d; best = tk; } } if (best) { tx = (tx + best.x * 2) / 3; tz = (tz + best.z * 2) / 3; } }
    else if (R.phase === 'race') { const RC = R.race; if (!RC || RC.st === 'count' || RC.st === 'retry') { X.drive(0, 0); return; } const g = RC.st === 'wait' ? GATES[0] : GATES[(RC.k + 1) % NG]; tx = g[0]; tz = g[1]; }
    else if (R.phase === 'boss') { const p = sdNearest(); if (p) { tx = p.x; tz = p.z; if (Math.hypot(p.x - C.x, p.z - C.z) < 5.5) X.press(2, true); } else { tx = GC.x; tz = GC.z - 40; } }
    else { tx = HG.x; tz = HG.z; }
    if (face) { tx = face[0]; tz = face[1]; }
    let df = Math.atan2(tx - C.x, tz - C.z) - C.yaw; df = Math.atan2(Math.sin(df), Math.cos(df));
    if (Math.abs(df) > 0.7 && R.phase === 'canals') thr = Math.min(thr, 0.55);
    X.drive(thr, clamp(-df * 2.6, -1, 1));
    // hose anything in front · hop the nets · spin-splash skiffs alongside
    if (R.hoseT <= 0 && R.hose > 0 && R.phase !== 'boss') { let hit = false; const inCone = (x, z, reach) => { const dx = x - C.x, dz = z - C.z, al = dx * fx0 + dz * fz0; return al > 0 && al < reach && Math.abs(dx * fz0 - dz * fx0) < 1.8 + al * 0.14; };
      for (const e of EN) if (!e.dead && !e.gone && ((e.type === 'cutlass' && (e.st === 'wait' || e.st === 'windup')) || e.type === 'gunner' || (e.type === 'cannon' && e.st !== 'out') || (e.type === 'skiff' && e.st !== 'off' && e.st !== 'sink')) && inCone(e.x, e.z, 20)) { hit = true; break; }
      if (!hit && GAL.st === 'circle') for (const pt of GAL.ports) if (!pt.shut) { portW(pt, tmp); if (inCone(tmp.x, tmp.z, 20)) { hit = true; break; } }
      if (hit) { press(1, true); R.hoseHeld = false; } }
    A.tap3 -= dt; A.tap2 -= dt;
    if (A.tap3 <= 0 && C.ground) for (const n of NETS) { const dx = n.x - C.x, dz = n.z - C.z, al = dx * fx0 + dz * fz0; if (al > 2 && al < 7 && Math.hypot(dx, dz) < n.w) { X.press(3, true); setTimeout(() => X.press(3, false), 120); A.tap3 = 1.5; break; } }
    if (A.tap2 <= 0 && C.ground) for (const e of EN) if (e.type === 'skiff' && !e.dead && e.st !== 'off' && e.st !== 'sink' && Math.hypot(e.x - C.x, e.z - C.z) < 7) { X.press(2, true); setTimeout(() => X.press(2, false), 80); A.tap2 = 2.5; break; }
    // unstick: nudge forward along the canal if it stalls
    const counting = R.race && R.race.st === 'count'; if (sp < 2 && !counting && !face) A.stuck += dt; else A.stuck = 0;
    A.pt = (A.pt || 0) + dt; if (A.pt > 3) { if (A.lp && Math.hypot(C.x - A.lp[0], C.z - A.lp[1]) < 4 && !counting && !face) A.stuck = 9; A.pt = 0; A.lp = [C.x, C.z]; }
    if (A.stuck > 2.5) { A.stuck = 0; if (R.phase === 'canals') { const [s] = pathS(C.x, C.z), p = at(Math.min(PATH_LEN, s + 10)); X.place(p.x, p.z, Math.atan2(p.ux, p.uz)); R.lastW = [p.x, p.z]; } else { const a2 = Math.atan2(tx - C.x, tz - C.z); for (const dd of [8, 14, 20]) { const nx = C.x + Math.sin(a2) * dd, nz = C.z + Math.cos(a2) * dd; if (isWater(nx, nz)) { X.place(nx, nz, a2); R.lastW = [nx, nz]; break; } } } }
  }
  function endSection(n) { if (R.seen.has('end' + n)) return; R.seen.add('end' + n); if (!R.secHit[n]) { R.bonus += 150; R.score += 150; X.popup(tmp.set(X.C.x, 5, X.C.z), 'CLEAN SECTION ' + n + ' +150', '#7cff9b'); } }
  // steering helper for boats in the canals: chase the target directly if the water line is clear, else follow the canal toward it
  function steerTo(o, tx, tz) { const mx = (o.x + tx) / 2, mz = (o.z + tz) / 2; if (isWater(mx, mz) && isWater((o.x * 3 + tx) / 4, (o.z * 3 + tz) / 4)) return [tx, tz]; const [os] = pathS(o.x, o.z), [ts] = pathS(tx, tz), p = at(clamp(os + Math.sign(ts - os) * 16, 0, PATH_LEN)); return [p.x, p.z]; }
  function moveW(o, nx, nz) { if (isWater(nx, nz)) { o.x = nx; o.z = nz; return true; } if (isWater(nx, o.z)) { o.x = nx; return false; } if (isWater(o.x, nz)) { o.z = nz; return false; } return false; }
  function updEnemies(dt, sp, live) {
    const C = X.C, Sp = S(), vis = touch ? 110 : 160;
    for (const e of EN) { if (e.gone) continue; const dx = C.x - e.x, dz = C.z - e.z, d = Math.hypot(dx, dz), want = Math.atan2(dx, dz); e.t += dt;
      if (e.type === 'cutlass') { const f = e.f; f.visible = d < vis; if (!f.visible && e.st === 'wait') continue;
        if (e.st === 'wait' || e.st === 'windup') { f.rotation.y = want; ck.animate(f, e.st === 'wait' ? 'idle' : 'windup', e.t, dt, {}); const toB = ((e.b.x - C.x) * Math.sin(C.yaw) + (e.b.z - C.z) * Math.cos(C.yaw));
          if (e.st === 'wait' && live && R.phase === 'canals' && d < 30 && toB > d * 0.4) { e.st = 'windup'; e.t = 0; ck.enter(f, 'windup'); X.audio.tone(200, 0.3, 0.04, 'sawtooth', 1.4); }
          else if (e.st === 'windup' && e.t > 0.55) { e.st = 'leap'; e.t = 0; e.p0 = [e.x, e.y, e.z]; const lead = clamp(C.speed, 0, 26) * 0.75; let tx = C.x + Math.sin(C.yaw) * lead, tz = C.z + Math.cos(C.yaw) * lead; if (!isWater(tx, tz)) { tx = C.x; tz = C.z; } e.p1 = [tx, tz]; ck.enter(f, 'attack'); X.audio.tone(320, 0.2, 0.05, 'square', 0.6); } }
        else if (e.st === 'leap') { const k = Math.min(1, e.t / 0.85), wy = W(e.p1[0], e.p1[1]); e.x = e.p0[0] + (e.p1[0] - e.p0[0]) * k; e.z = e.p0[2] + (e.p1[1] - e.p0[2]) * k; e.y = e.p0[1] + (wy - 0.4 - e.p0[1]) * k + (e.b.kind === 'rope' ? 7 : 5) * k * (1 - k); f.position.set(e.x, e.y, e.z); f.rotation.x = -k * 0.5; ck.animate(f, 'attack', Math.min(e.t * 0.5, 0.3), dt, {});
          if (e.line) { e.line.visible = true; const ap = e.line.geometry.attributes.position; ap.setXYZ(0, e.p0[0], e.b.top + 6, e.p0[2]); ap.setXYZ(1, e.x, e.y + 1.7, e.z); ap.needsUpdate = true; }
          if (k >= 1) { if (e.line) e.line.visible = false; X.spray(tmp.set(e.x, 0.5, e.z), 12, 5); X.ripple(e.x, e.z, 3, 0.8); f.rotation.x = 0; if (Math.hypot(C.x - e.x, C.z - e.z) < 3.6 && C.y < wy + 2 && live) { boatHit(12, -dx / (d || 1) * 1.2, -dz / (d || 1) * 1.2); X.popup(tmp.set(C.x, 4, C.z), 'BOARDED!', '#ec3013'); } else X.popup(tmp.set(e.x, 3, e.z), 'MISSED!', '#9ca3af'); e.st = 'swim'; e.t = 0; ck.enter(f, 'idle'); } }
        else if (e.st === 'swim') { if (d < 24 && d > 2) moveW(e, e.x + dx / d * 2.4 * dt, e.z + dz / d * 2.4 * dt); e.y = W(e.x, e.z) - 1.0; f.position.set(e.x, e.y, e.z); f.rotation.y = want; ck.animate(f, 'idle', e.t, dt, {}); if (d < Sp.r + 1.4 && sp > 6 && live) { ko(e, 'DUNKED', 30); e.st = 'sinkaway'; e.t = 0; } else if (e.t > 5) { e.st = 'sinkaway'; e.t = 0; } }
        else if (e.st === 'fall') { const k = Math.min(1, e.t / 0.9), wy = W(e.p1[0], e.p1[1]); e.x = e.p0[0] + (e.p1[0] - e.p0[0]) * k; e.z = e.p0[2] + (e.p1[1] - e.p0[2]) * k; e.y = e.p0[1] + (wy - 1 - e.p0[1]) * k * k + 2 * k * (1 - k); f.position.set(e.x, e.y, e.z); f.rotation.x = -k * 2.4; ck.animate(f, 'hurt', e.t, dt, {}); if (k >= 1) { X.spray(tmp.set(e.x, 0.5, e.z), 14, 5); X.ripple(e.x, e.z, 3, 0.8); e.st = 'sinkaway'; e.t = 0; } }
        else if (e.st === 'sinkaway') { e.y -= dt * 0.8; f.position.y = e.y; if (e.t > 1.6) { e.gone = true; f.visible = false; } }
        if (f.userData.events) f.userData.events.length = 0; continue; }
      if (e.type === 'gunner') { const f = e.f; f.visible = d < vis; if (!f.visible) continue;
        if (e.st === 'fall') { ck.animate(f, 'die', e.t, dt, {}); if (e.t > 2.2) { e.gone = true; f.visible = false; } continue; }
        f.rotation.y = want; const act = live && d < 52 && R.phase === 'canals';
        if (e.st === 'idle') { if (act) e.cd -= dt; if (e.cd <= 0) { e.st = 'windup'; e.t = 0; ck.enter(f, 'windup'); } }
        else if (e.st === 'windup') { e.tell.visible = true; e.tell.position.set(e.x + Math.sin(want) * 0.9, e.y + 1.5, e.z + Math.cos(want) * 0.9); e.tell.material.opacity = 0.4 + 0.6 * Math.abs(Math.sin(e.t * 14)); if (e.t > 1.0) { e.st = 'attack'; e.t = 0; e.tell.visible = false; ck.enter(f, 'attack'); fireBolt(e.x + Math.sin(want) * 0.9, e.y + 1.5, e.z + Math.cos(want) * 0.9); } }
        else if (e.st === 'attack') { if (e.t > 0.5) { e.st = 'recover'; e.t = 0; ck.enter(f, 'recover'); } }
        else if (e.st === 'recover') { if (e.t > 1.0) { e.st = 'idle'; e.t = 0; e.cd = rr(1.6, 2.8); ck.enter(f, 'idle'); } }
        ck.animate(f, e.st, e.t, dt, {}); if (f.userData.events) f.userData.events.length = 0; continue; }
      if (e.type === 'cannon') { if (d > vis * 1.2) continue; if (e.st === 'out') continue; e.g.rotation.y = damp(e.g.rotation.y, want, 3, dt); e.fuse.material.opacity = 0.5 + 0.5 * Math.abs(Math.sin(e.t * 9));
        if (e.st === 'idle') { if (live && d < 80 && R.phase === 'canals') e.cd -= dt; if (e.cd <= 0) { e.st = 'aim'; e.t = 0; let tx = C.x + Math.sin(C.yaw) * C.speed * 1.4, tz = C.z + Math.cos(C.yaw) * C.speed * 1.4; if (!isWater(tx, tz)) { tx = C.x; tz = C.z; } e.tgt = [tx, tz]; e.ring.position.set(tx, W(tx, tz) + 0.15, tz); e.ring.visible = true; X.audio.tone(160, 0.5, 0.04, 'sawtooth', 2); } }
        else if (e.st === 'aim') { const k = Math.min(1, e.t / 1.4); e.ring.scale.setScalar(0.4 + k * 0.7); e.ring.material.opacity = 0.35 + 0.5 * Math.abs(Math.sin(e.t * 10)); e.ring.position.y = W(e.tgt[0], e.tgt[1]) + 0.15; if (k >= 1) { e.st = 'idle'; e.cd = rr(3, 4.5); const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshToonMaterial({ color: '#201e1d', gradientMap: X.grad })); const p0 = V3(e.x + Math.sin(e.g.rotation.y) * 1.8, e.y + 1.5, e.z + Math.cos(e.g.rotation.y) * 1.8); m.position.copy(p0); scene.add(m); balls.push({ m, arc: true, p0, p1: V3(e.tgt[0], 0.3, e.tgt[1]), t: 0, dur: 1.0, ring: e.ring }); X.boom(p0, 1.2, 0xffb347); X.audio.burst(0.4, 180, 0.3); } }
        continue; }
      if (e.type === 'skiff') { const g = e.g; if (e.st === 'off') { if (R.phase === 'canals' && typeof e.trig === 'number' && R.s >= e.trig && live) spawnSkiff(e, e.hx, e.hz); else continue; }
        g.visible = d < vis + 40; const rd = e.rider;
        if (e.st === 'sink') { g.rotation.z += dt * 1.4; g.position.y -= dt * 1.0; if (e.t > 1.6) { e.gone = true; g.visible = false; X.spray(tmp.set(e.x, 0.6, e.z), 10, 4); } continue; }
        if (d > 170 && R.phase !== 'chase') { e.gone = true; g.visible = false; continue; }
        const turn = (rate, tw) => { const df = Math.atan2(Math.sin(tw - e.face), Math.cos(tw - e.face)); e.face += clamp(df, -rate * dt, rate * dt); };
        const [tx, tz] = steerTo(e, C.x, C.z), tw = Math.atan2(tx - e.x, tz - e.z), top = R.phase === 'chase' ? 20 : 18;
        if (!live) e.spd = damp(e.spd, 0, 2, dt);
        else if (e.st === 'chase') { turn(2.2, tw); e.spd = damp(e.spd, e.gun ? (d > 20 ? top : 6) : (d > 10 ? top : 9), 2, dt); e.cd -= dt;
          if (e.gun) { if (d < 40 && d > 8 && e.cd <= 0) { e.cd = rr(2.2, 3.2); fireBolt(e.x, 1.8, e.z, 6); ck.enter(rd, 'attack'); } }
          else if (d < 18 && e.cd <= 0) { e.st = 'windup'; e.t = 0; e.aim = want; X.audio.tone(140, 0.6, 0.04, 'sawtooth', 2); ck.enter(rd, 'windup'); } }
        else if (e.st === 'windup') { e.spd = damp(e.spd, 2, 4, dt); e.face = damp(e.face, e.aim, 8, dt); e.lane.visible = true; e.lane.position.set(e.x, W(e.x, e.z) + 0.3, e.z); e.lane.rotation.y = e.aim; e.lane.scale.set(2.6, 1, 22); e.lane.material.opacity = 0.2 + 0.3 * Math.sin(e.t * 16) ** 2; if (e.t > 0.75) { e.st = 'dash'; e.t = 0; e.lane.visible = false; e.hitP = false; ck.enter(rd, 'attack'); } }
        else if (e.st === 'dash') { e.spd = 24; e.face = e.aim; if (Math.random() < 0.6) X.spray(tmp.set(e.x, 0.4, e.z), 1, 3); if (!e.hitP && d < Sp.r + 2.2) { e.hitP = true; boatHit(10, Math.sin(e.aim) * 1.4, Math.cos(e.aim) * 1.4); C.speed *= 0.5; e.st = 'recover'; e.t = 0; } else if (e.t > 1.0) { e.st = 'recover'; e.t = 0; } }
        else if (e.st === 'recover') { e.spd = damp(e.spd, 5, 2, dt); turn(1.4, tw); if (e.t > 1.0) { e.st = 'chase'; e.t = 0; e.cd = rr(1.4, 2.6); ck.enter(rd, 'idle'); } }
        if (!moveW(e, e.x + Math.sin(e.face) * e.spd * dt, e.z + Math.cos(e.face) * e.spd * dt)) e.spd *= 0.9;
        if (d < Sp.r + 2.1) { if (sp > 14 && R.ramCd <= 0 && live) { R.ramCd = 0.4; ko(e, 'RAMMED', e.pts); e.st = 'sink'; e.t = 0; e.lane.visible = false; X.St.shake = Math.max(X.St.shake, 0.4); } else { const l = d || 1, mn = Sp.r + 2.1; moveW(e, C.x - dx / l * mn, C.z - dz / l * mn); } }
        for (const s2 of EN) if (s2 !== e && s2.type === 'skiff' && !s2.dead && s2.st !== 'off') { const ex = e.x - s2.x, ez = e.z - s2.z, q = Math.hypot(ex, ez); if (q < 4 && q > 0.01) moveW(e, e.x + ex / q * (4 - q) * 0.5, e.z + ez / q * (4 - q) * 0.5); }
        const wy = W(e.x, e.z); g.position.set(e.x, wy + 0.1, e.z); g.rotation.order = 'YXZ'; g.rotation.set(-clamp(e.spd / 30, 0, 1) * 0.1 + Math.sin(X.St.t * 2 + e.x) * 0.06, e.face, Math.cos(X.St.t * 1.7 + e.z) * 0.07);
        if (g.visible) { ck.animate(rd, e.st === 'windup' ? 'windup' : e.st === 'dash' ? 'attack' : 'idle', e.t, dt, {}); const P = rd.userData.P; if (P) P.legs.forEach(l => l.rotation.x = -1.4); if (rd.userData.events) rd.userData.events.length = 0; }
        if (e.spd > 6 && Math.random() < (touch ? 0.15 : 0.35)) X.ripple(e.x - Math.sin(e.face) * 2.2, e.z - Math.cos(e.face) * 2.2, 1.6, 0.4); }
    } }
  function spawnSkiff(e, x, z) { e.x = x; e.z = z; e.st = 'chase'; e.t = 0; e.spd = 0; e.face = Math.atan2(X.C.x - x, X.C.z - z); e.g.visible = true; e.g.rotation.z = 0; e.g.position.set(x, 0, z); X.spray(tmp.set(x, 0.5, z), 12, 4); X.ripple(x, z, 4, 0.8); }
  function spawnChase(e) { const C = X.C, a = Math.atan2(C.x - HG.x, C.z - HG.z), offs = [[-44, 50], [44, 50], [-70, 76], [70, 76], [0, 96]][e.ci]; for (let k = 0; k < 8; k++) { const r2 = 1 + k * 0.15, lx = offs[0] * r2, lz = offs[1] * r2, x = C.x + lx * Math.cos(a) + lz * Math.sin(a), z = C.z - lx * Math.sin(a) + lz * Math.cos(a); if (isWater(x, z) && Math.abs(x) < 270 && z > 380 && z < 680) { spawnSkiff(e, x, z); return; } } spawnSkiff(e, clamp(C.x + (e.ci - 2) * 12, -260, 260), clamp(C.z - 30, 380, 660)); }
  function updRace(dt, sp) {
    const RC = R.race; if (!RC || R.state !== 'run' || R.phase !== 'race') return; const C = X.C;
    if (RC.st === 'wait') { const ng = GATES[0]; nextGlow.visible = true; nextGlow.position.set(ng[0], 3 + Math.sin(R.t * 4) * 0.3, ng[1]); if (Math.hypot(C.x - ng[0], C.z - ng[1]) < 20) { raceGrid(); banner('RACE · 1 LAP · TOP 2 TO PASS', 3); } return; }
    if (RC.st === 'count') { RC.c -= dt; C.x = SLOTS[0][0]; C.z = SLOTS[0][1]; C.yaw = GYAW; C.speed = 0; const n = Math.ceil(RC.c), s = n > 0 && n <= 3 ? String(n) : ''; if (s && RC.said !== s) { RC.said = s; banner(s, 1); X.audio.tone(440, 0.2, 0.06, 'square', 1); } if (RC.c <= 0) { RC.st = 'go'; banner('GO!', 1.2); X.audio.tone(880, 0.4, 0.06, 'square', 1); } }
    const meP = prog(RC.k, C.x, C.z);
    for (const r of RIVALS) { if (!r.g.visible) continue; const T = X.St.t;
      if (RC.st === 'go') { const gi = (r.k + 1) % NG, [gx, gz] = GATES[gi], [nx2, nz2] = GATES[(gi + 1) % NG], pl = Math.hypot(nx2 - gx, nz2 - gz), tx = gx + (nz2 - gz) / pl * r.off, tz = gz - (nx2 - gx) / pl * r.off;
        const want = Math.atan2(tx - r.x, tz - r.z), df = Math.atan2(Math.sin(want - r.yaw), Math.cos(want - r.yaw)); r.yaw += clamp(df, -1.7 * dt, 1.7 * dt);
        const rp = prog(r.k, r.x, r.z), rub = r.done ? 0.4 : 1 + clamp((meP - rp) * 0.06, -0.14, 0.2); r.nit = Math.max(0, r.nit - dt); if (!r.done && Math.random() < dt * 0.06) r.nit = 1.6;
        const top = r.base * (R.auto ? 0.86 : 1) * rub * (r.nit > 0 ? 1.3 : 1) * (1 - Math.min(0.5, Math.abs(df) * 0.35)); r.spd = damp(r.spd, top, 1.4, dt);
        if (Math.hypot(gx - r.x, gz - r.z) < 15) { r.k++; if (!r.done && r.k >= NG * LAPS) { r.done = RC.fin.length + 1; RC.fin.push(r.name); } } }
      else r.spd = 0;
      r.x += Math.sin(r.yaw) * r.spd * dt; r.z += Math.cos(r.yaw) * r.spd * dt;
      const dx = r.x - C.x, dz = r.z - C.z, d = Math.hypot(dx, dz), mn = S().r + 1.6; if (d < mn && d > 0.01) { r.x = C.x + dx / d * mn; r.z = C.z + dz / d * mn; C.speed *= 0.96; if (sp > 6 && !(r.bumpT > T)) { r.bumpT = T + 0.6; X.audio.burst(0.15, 700, 0.15); X.St.shake = Math.max(X.St.shake, 0.2); } }
      for (const s2 of RIVALS) if (s2 !== r) { const ex = r.x - s2.x, ez = r.z - s2.z, e2 = Math.hypot(ex, ez); if (e2 < 3.4 && e2 > 0.01) { r.x += ex / e2 * (3.4 - e2) * 0.5; r.z += ez / e2 * (3.4 - e2) * 0.5; } }
      r.x = clamp(r.x, LK.x0 + 3, LK.x1 - 3); r.z = clamp(r.z, 372, LK.z1 - 3);
      const wy = X.waveH(r.x, r.z, T); r.g.position.set(r.x, wy + 0.05, r.z); r.g.rotation.order = 'YXZ'; r.g.rotation.set(-clamp(r.spd / 25, 0, 1) * 0.1 + Math.sin(T * 2 + r.off) * 0.05, r.yaw, Math.sin(T * 1.6 + r.off) * 0.08);
      if (r.spd > 8) { if (Math.random() < (touch ? 0.3 : 0.7)) X.puff(tmp.set(r.x - Math.sin(r.yaw) * 2, 0.8, r.z - Math.cos(r.yaw) * 2), 0xffffff, 1, 2 + r.spd * 0.1, 0.6, 0.5); r.rip = (r.rip || 0) - dt; if (r.rip <= 0) { r.rip = 0.2; X.ripple(r.x - Math.sin(r.yaw) * 1.8, r.z - Math.cos(r.yaw) * 1.8, 2, 0.45); } } }
    if (RC.st !== 'go') return;
    const gi = (RC.k + 1) % NG, ng = GATES[gi]; nextGlow.visible = true; nextGlow.position.set(ng[0], 3 + Math.sin(R.t * 4) * 0.3, ng[1]);
    if (Math.hypot(C.x - ng[0], C.z - ng[1]) < 16) { RC.k++; X.audio.tone(990, 0.1, 0.05, 'triangle', 1.4); }
    R.place = racePlace();
    if (RC.k >= NG * LAPS) { const place = RC.fin.length + 1; R.place = place;
      if (place <= 2) { R.score += place === 1 ? 500 : 250; nextGlow.visible = false; gateG.forEach(g => g.visible = false); RIVALS.forEach(r => r.g.visible = false); startBoss(); }
      else { R.tries++; RC.st = 'retry'; banner(ord(place) + ' PLACE · TOP 2 TO PASS · TRY AGAIN', 3.5); setTimeout(() => { if (R.state === 'run' && R.phase === 'race') raceGrid(); }, 3200); } }
  }
  function startBoss() { startShowdown(); }
  function sinkGalleon() { GAL.st = 'sink'; GAL.t = 0; R.score += 500; banner('GALLEON SUNK · +500', 3); X.boom(tmp.set(GAL.x, 3, GAL.z), 6, 0xffb347); cheer();
    setTimeout(() => { if (R.state !== 'run') return; R.phase = 'chase'; R.cp = { x: X.C.x, z: X.C.z, yaw: X.C.yaw }; for (const e of CHASE) spawnChase(e); banner('6 · ESCAPE! Make the Pirate Hideout gate. Skiffs on your tail!', 4.5); radio('Skiffs behind you! Run for the hideout gate!'); }, 1800); }
  function updGalleon(dt, sp, live) {
    const C = X.C, g = GAL.g; GAL.t += dt; GAL.hitK = Math.max(0, (GAL.hitK || 0) - dt * 2);
    if (GAL.st === 'gone') return;
    if (GAL.st === 'circle') { GAL.ang += dt * 5.5 / GC.r; GAL.x = GC.x + Math.cos(GAL.ang) * GC.r; GAL.z = GC.z + Math.sin(GAL.ang) * GC.r; GAL.yaw = Math.atan2(-Math.sin(GAL.ang), Math.cos(GAL.ang)); }
    if (GAL.st === 'list') GAL.roll = damp(GAL.roll, 0.26, 1.2, dt);
    if (GAL.st === 'sink') { GAL.roll = damp(GAL.roll, 0.9, 0.6, dt); GAL.sinkY += dt * 1.6; if (Math.random() < 0.5) X.puff(tmp.set(GAL.x + rr(-6, 6), 2, GAL.z + rr(-10, 10)), 0x2a2826, 2, 2, 1.6, 1.4); if (GAL.t > 1.2) GAL.cap.visible = false; if (GAL.t > 6) { GAL.st = 'gone'; g.visible = false; } }
    const T = X.St.t, wy = X.waveH(GAL.x, GAL.z, T); g.position.set(GAL.x + Math.sin(T * 30) * 0.2 * GAL.hitK, wy - 0.4 - GAL.sinkY, GAL.z); g.rotation.order = 'YXZ'; g.rotation.set(Math.sin(T * 0.8) * 0.03, GAL.yaw, GAL.roll + Math.sin(T * 0.6) * 0.04); g.updateMatrixWorld(true);
    if (Math.hypot(C.x - GAL.x, C.z - GAL.z) < 160) { ck.animate(GAL.cap, GAL.capSt || 'idle', GAL.t, dt, {}); if (GAL.cap.userData.events) GAL.cap.userData.events.length = 0; GAL.cap.rotation.y = Math.atan2(C.x - GAL.x, C.z - GAL.z) - GAL.yaw; }
    if (GAL.st !== 'circle') { for (const pt of GAL.ports) { pt.lane.visible = false; pt.gl.material.opacity = 0; } return; }
    for (const pt of GAL.ports) pt.hinge.rotation.z = damp(pt.hinge.rotation.z, pt.shut ? 0 : pt.sd * 1.3, 6, dt);
    if (R.ports >= 6) { GAL.st = 'list'; GAL.capSt = 'stagger'; banner('SHE IS LISTING! RAM THE HULL AT FULL SPEED (3 TIMES)', 4); radio('She is listing! Full throttle, or land a barrel roll for a boost, and RAM her!'); return; }
    GAL.fireCd -= dt; const nx = (sd) => [Math.cos(GAL.yaw) * sd, -Math.sin(GAL.yaw) * sd];
    for (const pt of GAL.ports) { if (pt.shut) continue; portW(pt, tmp); const [nxx, nzz] = nx(pt.sd), vx = C.x - tmp.x, vz = C.z - tmp.z, dn = vx * nxx + vz * nzz, lat = Math.abs(vx * nzz - vz * nxx);
      if (pt.wind > 0) { pt.wind += dt; pt.gl.material.opacity = 0.4 + 0.6 * Math.abs(Math.sin(pt.wind * 14)); pt.lane.visible = true; pt.lane.position.set(tmp.x, 0.35 + X.waveH(tmp.x, tmp.z, T), tmp.z); pt.lane.rotation.y = Math.atan2(nxx, nzz); pt.lane.scale.set(3, 1, 50); pt.lane.material.opacity = 0.15 + 0.3 * Math.sin(pt.wind * 16) ** 2;
        if (pt.wind > 1.15) { pt.wind = 0; pt.lane.visible = false; pt.gl.material.opacity = 0; const m = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), new THREE.MeshToonMaterial({ color: '#201e1d', gradientMap: X.grad })); m.position.set(tmp.x, 1.6, tmp.z); scene.add(m); balls.push({ m, v: V3(nxx * 46, 0, nzz * 46), life: 1.2, t: 0 }); X.boom(tmp.set(tmp.x + nxx, 2, tmp.z + nzz), 1.6, 0xffb347); X.audio.burst(0.4, 160, 0.3); GAL.capSt = 'idle'; } }
      else if (live && GAL.fireCd <= 0 && dn > 3 && dn < 52 && lat < 8 + dn * 0.35) { pt.wind = 0.001; GAL.fireCd = 1.3; GAL.capSt = 'windup'; GAL.t = 0; } }
  }
  function updChase(dt, live) { if (R.phase !== 'chase' || R.state !== 'run') return; const C = X.C; R.chaseT = (R.chaseT || 0) + dt; if (Math.hypot(C.x - HG.x, C.z - HG.z) < 13 && live) { if (R.chaseT >= 12) finish(); else if (!(R.bannerT > 0.3 && R.banner.startsWith('GATE'))) banner('GATE OPENS IN ' + Math.ceil(12 - R.chaseT) + ' S · HOLD OFF THE SKIFFS!', 0.6); } }
  function grade(s) { return s >= 6200 ? 'S' : s >= 4800 ? 'A' : s >= 3400 ? 'B' : 'C'; }
  function finish() { R.state = 'done'; for (const e of EN) if (e.type === 'skiff' && e.st !== 'off' && !e.dead) e.spd = 0; const tb = Math.max(0, Math.round((300 - R.t) * 3)); const total = R.score + tb - R.deaths * 150; let best = null; try { best = JSON.parse(localStorage.getItem(JETSKI_RUN.bestKey) || 'null'); } catch (e) {} const nb = !best || total > best.score; if (nb) try { localStorage.setItem(JETSKI_RUN.bestKey, JSON.stringify({ score: total, time: Math.round(R.t), grade: grade(total), place: R.place })); } catch (e) {}
    R.done = { time: Math.round(R.t), tokens: R.tokens, totalTokens: R.totalTokens, kills: R.kills, totalBots: R.totalBots, treasure: R.treasure, totalTreasure: R.totalTreasure, deaths: R.deaths, timeUps: R.timeUps, place: R.place, tries: R.tries, ports: R.ports, sd: R.sdK, sdTotal: SD.length, base: R.score, timeBonus: tb, bonus: R.bonus, total, grade: grade(total), best: nb ? total : best.score, newBest: nb };
    banner('YOU MADE THE HIDEOUT!', 3); X.audio.tone(523, 0.2, 0.06, 'triangle', 1); setTimeout(() => X.audio.tone(659, 0.2, 0.06, 'triangle', 1), 160); setTimeout(() => X.audio.tone(784, 0.4, 0.06, 'triangle', 1), 320); }
  const phaseTxt = () => R.phase === 'canals' ? 'GATE ' + Math.max(0, R.cpI + 1) + '/' + NGT : R.phase === 'race' ? (R.race && R.race.st !== 'wait' ? 'RACE · ' + ord(R.place || 4) : 'RACE') : R.phase === 'boss' ? 'SHOWDOWN ' + R.sdK + '/' + SD.length : 'GATE OPEN';
  const quest = () => R.goal && R.state === 'run' ? (R.phase === 'canals' ? 'Canals · ' : R.phase === 'race' ? 'Race · ' : R.phase === 'boss' ? 'Showdown · ' : 'Hideout · ') + R.goal.label + ' · ' + Math.round(R.gd || 0) + ' m' : 'Down the canals · gates on the clock · race · showdown · hideout';
  return {
    start, onSmash() {}, update, press, get boardURL() { return boardURL; }, get boardURLP() { return boardURLP; }, get coinP() { return coinP; },
    hud: () => ({ auto: !!R.auto, state: R.state, hp: Math.round(R.hp), tokens: R.tokens, totalTokens: R.totalTokens, kills: R.kills, totalBots: R.totalBots, treasure: R.treasure, totalTreasure: R.totalTreasure, time: Math.floor(R.t), clock: R.phase === 'canals' ? Math.max(0, Math.ceil(R.clock)) : null, score: R.score, banner: R.bannerT > 0 ? R.banner : '', phase: R.phase, phaseTxt: phaseTxt(), hurt: Math.round(R.hurt * 10) / 10, board: R.board, done: R.done, low: R.hp < 30, hose: R.hose, quest: quest(), radio: R.radio || '',
      goal: (() => { const g = R.goal; if (!g || R.state !== 'run' || R.board) return null; const v = tmp.set(g.x, 3, g.z).project(X.camera); return { nx: Math.round(v.x * 1000) / 1000, ny: Math.round(v.y * 1000) / 1000, behind: v.z > 1, dist: Math.round(R.gd || 0), label: g.label }; })() }),
    armour: () => R.hp, heal(n) { if (R.hp >= 100) return 0; const a = Math.min(100, R.hp + n) - R.hp; R.hp += a; X.popup(tmp.set(X.C.x, 3, X.C.z), 'SKI +' + Math.round(a), '#22c55e'); return a; }, say(s) { banner(s, 2.5); },
    hoseFull: () => R.hose >= 8, refill() { R.hose = 8; }, addHose(n) { R.hose = Math.min(8, R.hose + n); },
    map: () => { const nb = R.phase === 'race' && R.race && R.race.st !== 'retry' ? [['Buoy', ...GATES[R.race.st === 'go' ? (R.race.k + 1) % NG : 0]]] : []; return { b: [['Board', BD.x, BD.z], ['Hideout', HG.x, HG.z], ...nb], l: lanterns.map(l => [l[0], l[1]]), t: tokens.filter(k => !k.got && (k.kind === 'coin' || k.kind === 'chest')).map(k => [k.x, k.z]), e: [...EN.filter(e => !e.dead && !e.gone && !(e.type === 'skiff' && e.st === 'off')).map(e => [e.x, e.z]), ...RIVALS.filter(r => r.g.visible).map(r => [r.x, r.z]), ...SD.filter(p => p.on && !p.dead).map(p => [p.x, p.z])], q: R.goal ? [R.goal.x, R.goal.z, R.goal.label] : null, r: R.phase === 'race' ? GATES : MAIN, rc: R.phase === 'race', g: R.goal ? [R.goal.x, R.goal.z] : null }; },
    setAuto(v) { R.auto = !!v; if (!v) X.drive(0, 0); else if (R.state === 'ready') this.rollOut(); },
    get auto() { return !!R.auto; },
    rollOut() { R.board = false; X.setPaused(false); if (R.state === 'ready') { R.state = 'run'; banner('1 · STONE ARCHES: down the canal! Gates add time to the clock', 3.5); X.audio.init && X.audio.init(); } },
    closeBoard() { R.board = false; X.setPaused(false); },
    openBoard() { R.board = true; X.setPaused(true); },
    reset() { const p = R.cp || start; X.place(p.x, p.z, p.yaw); R.lastW = [p.x, p.z]; },
    _skipTo(k) { R.state = 'run'; R.board = false; X.setPaused(false); const go = (s) => { const p = at(s); X.place(p.x, p.z, Math.atan2(p.ux, p.uz)); R.lastW = [p.x, p.z]; };
      if (k === 'sec2') { R.cpI = 1; go(184); } else if (k === 'sec3') { R.cpI = 4; go(330); } else if (k === 'race') { R.cpI = NGT - 1; R.phase = 'race'; R.race = { st: 'wait', k: 0 }; gateG.forEach(g => g.visible = true); X.place(30, 378, 0.3); R.lastW = [30, 378]; } else if (k === 'boss') { R.cpI = NGT - 1; startBoss(); X.place(0, 420, 0); R.lastW = [0, 420]; } else if (k === 'chase') { R.cpI = NGT - 1; R.phase = 'boss'; X.place(0, 470, 0); R.lastW = [0, 470]; startShowdown(); SD.forEach(p => { if (p.on) { p.dead = true; p.on = false; p.g.visible = false; p.bar.visible = false; } }); R.sdW = 0; openGate(); } else go(0); },
    _dbg: () => { const b = new THREE.Box3().setFromObject(GAL.g); return { gal: [GAL.x, GAL.z, GAL.st, GAL.g.visible, GAL.g.position.y, GAL.g.children.length, GAL.g.parent === scene], box: [b.min.toArray().map(Math.round), b.max.toArray().map(Math.round)], C: [X.C.x, X.C.z, X.C.yaw], err: window.__vehErr || '' }; },
    _view(i, back = 15) { const S = SPOT[i], dx = Math.sin(S.yaw), dz = Math.cos(S.yaw); let x = S.x + dx * back, z = S.z + dz * back; R.state = 'run'; R.board = false; X.setPaused(false); X.place(x, z, S.yaw + Math.PI); R.lastW = [x, z]; return S.k; },
    _atS(s) { const p = at(s); R.state = 'run'; R.board = false; X.setPaused(false); X.place(p.x, p.z, Math.atan2(p.ux, p.uz)); R.lastW = [p.x, p.z]; },
    _place(x, z, yaw) { X.place(x, z, yaw); R.lastW = [x, z]; },
    _shutPorts() { for (const pt of GAL.ports) if (!pt.shut) { pt.shut = true; R.ports++; } },
  };
}
