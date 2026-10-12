// 8 GATES — JIDDA · THE BREAK [jSurfContest]. Surf contest minigame on its own wave engine (vehicle-lab's lake swell is too small for this).
// Zone frame: worlds/jidda-plan.js zones.surf (origin = the break). Local -z = toward the beach + bleachers, +z = open sea (waves roll toward -z).
// WAVE FRAME: a = along the line (the rider's down-the-line direction, world x = -a), d = distance in front of the crest toward the beach (world z = zc - d).
// One wave = a swell that stands up at Z_BREAK, then PEELS along +a (whitewater behind the peel point xp, a curling LIP just ahead of it = the tube).
// FORMAT: FREE SURF (3 waves, best two must reach SURF.target) → FINAL vs JOB (3 waves each, Job first, alternating). Five judges' cards after every wave.
// Buttons (Game HUD vehicle="surf"): 1 CARVE · 2 TRICK · 3 JUMP (3 = paddle in the lineup). Host + heat sheet: JOSS.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient, glowTexture, Ambience } from '../../village-game.js';
import { crestTex, canvasTex } from '../../meru-game.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../../fox-kit.js';
import { castKit } from '../../engine/cast.js';
import { vehicleKit } from '../../engine/vehicle-kit.js';
import { save } from '../../engine/save.js';
import { landmarks } from '../../worlds/jidda-plan.js';

export const SURF = { name: 'THE BREAK', room: 'jSurfContest', bestKey: 'jidda.surf.best.v1', target: 13 };
// the wave + ride tuning in one place (Ben: "finalise the surfing" happens here)
export const TUNE = { RS: 1.0, BOARD: 2, FOX: 2, VW: 4.6, Z_SPAWN: 122, Z_BREAK: 64, Z_SHORE: -16, SPOT: [-6, 68], TL: 13, G: 11, H: [8.4, 10.2], VP: 9.4,
  PADDLE: 1.3, NEED: 3.1, DRAG: 0.028, PUSH: 1.6, FLAT: 0.9, TURN: 3.6, TRIM: 1.4, SCORE_K: 2600, JOB: [6.1, 5.5, 6.9], JOB_PUSH: 0.75 };
const sstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));

export async function createSurfBreak({ container, onState = () => {}, opts = {} }) {
  const G0 = {}, cardMs = [];
  const T = TUNE, touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CHh = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.5 : 2)); renderer.setSize(CW(), CHh());
  renderer.shadowMap.enabled = !touch; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const SKY = 0xbfe6f2, scene = new THREE.Scene(); scene.background = new THREE.Color(SKY); scene.fog = new THREE.Fog(SKY, 220, 1000);
  const camera = new THREE.PerspectiveCamera(55, CW() / CHh(), 0.1, 2400);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = !touch; m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp }), cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }), VK = vehicleKit({ THREE, M, toon });
  const audio = new Ambience();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x5f9fb4, 1.05));
  const sun = new THREE.DirectionalLight(0xfff2da, 2.0); sun.castShadow = !touch; if (!touch) { sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 }); sun.shadow.bias = -0.0005; } scene.add(sun, sun.target);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff3c8, transparent: true, depthWrite: false, fog: false, opacity: 0.85 })); sunGlow.scale.set(260, 260, 1); scene.add(sunGlow);

  // ---------- THE SEA: near plane (chop) + far plane ----------
  const chop = (x, z, t) => 0.13 * Math.sin(x * 0.21 + t * 1.3) + 0.09 * Math.sin(z * 0.27 - t * 1.1) + 0.05 * Math.sin((x + z) * 0.5 + t * 2.1);
  const deepC = new THREE.Color('#0c6a93'), faceC = new THREE.Color('#25afc4'), glowC = new THREE.Color('#86e6df'), foamC = new THREE.Color('#f4fbfb'), shallowC = new THREE.Color('#48c9c6'), tmpC = new THREE.Color();
  const SEA_N = touch ? 40 : 56, seaGeo = new THREE.PlaneGeometry(760, 760, SEA_N, SEA_N); seaGeo.rotateX(-Math.PI / 2); seaGeo.translate(-40, 0, 150);
  { const p = seaGeo.attributes.position, col = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { const z = p.getZ(i); tmpC.copy(deepC).lerp(shallowC, sstep(40, -14, z)); col[i * 3] = tmpC.r; col[i * 3 + 1] = tmpC.g; col[i * 3 + 2] = tmpC.b; } seaGeo.setAttribute('color', new THREE.BufferAttribute(col, 3)); }
  const sea = new THREE.Mesh(seaGeo, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad })); sea.receiveShadow = !touch; scene.add(sea);
  const farSea = new THREE.Mesh(new THREE.PlaneGeometry(7000, 7000), new THREE.MeshToonMaterial({ color: deepC, gradientMap: grad })); farSea.rotation.x = -Math.PI / 2; farSea.position.y = -0.35; scene.add(farSea);

  // ---------- WAVES ----------
  const WV = [];   // active waves (max 2): { zc, H, amp, shoal, broke, xp, peelT, seed, rider, mesh }
  function colInfo(w, a, o) {
    let A = w.amp * (0.74 + 0.26 * Math.exp(-((a / 120) ** 2))), wf, foam = 0, e = 999, hollow = 1;
    if (w.broke) { e = a - w.xp;
      if (e >= 0) { const k = Math.exp(-e / 30), q = sstep(0, 2.5, w.peelT); A *= (1 - q * 0.64 * (1 - Math.exp(-e / 24))) * (1 - (1 - q) * 0.5 * (1 - Math.exp(-((a / 55) ** 2)))); wf = w.amp * (0.77 + q * (1.3 * (1 - k) - 0.02)); hollow = 1 + 0.45 + 0.1 * k * q - 0.1 * (1 - k) * q; }
      else { const b = sstep(-16, 0, e); A *= 0.2 + 0.8 * b * b; wf = w.amp * (0.75 + 0.5 * (1 - b)); foam = 1 - b * b * 0.8; hollow = 1 + 0.55 * b * b; } }
    else { const sk = sstep(T.Z_BREAK + 32, T.Z_BREAK, w.zc); A *= 0.5 + 0.5 * Math.exp(-((a / 55) ** 2)); wf = w.amp * (1.45 - 0.68 * sk); hollow = 1 + 0.45 * sk; }
    o.A = A; o.wf = Math.max(1.6, wf); o.e = e; o.foam = foam; o.hollow = hollow; return o; }
  function prof(w, o, d) { if (d >= 0) { const u = d / o.wf; return u >= 1 ? 0 : o.A * Math.pow(0.5 + 0.5 * Math.cos(Math.PI * u), o.hollow); } const wb = w.amp * 1.5 + 2, q = d / wb; return o.A * Math.exp(-q * q); }
  const CI = {}, CI2 = {};
  let TT = 0;   // world clock
  function seaH(x, z) { let y = chop(x, z, TT); for (const w of WV) { const d = w.zc - z; if (d < -w.amp * 6 - 12 || d > w.amp * 4 + 12) continue; y += prof(w, colInfo(w, -x, CI2), d); } return y; }
  const GR = { gx: 0, gz: 0 };
  function seaGrad(x, z) { const e = 0.4; GR.gx = (seaH(x + e, z) - seaH(x - e, z)) / (2 * e); GR.gz = (seaH(x, z + e) - seaH(x, z - e)) / (2 * e); return GR; }

  // wave + lip meshes (two sets, reused)
  const WC = touch ? 60 : 92, RB = 9, RF = 18, RN = 7, WR = RB + RF + RN, LC = touch ? 18 : 26, LR = 9;
  function gridGeo(cols, rows) { const g = new THREE.BufferGeometry(), n = cols * rows; g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const idx = []; for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) { const a = j * cols + i, b = a + 1, c = a + cols, d = c + 1; idx.push(a, c, b, b, c, d); } g.setIndex(idx); return g; }
  const waveMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad, side: THREE.DoubleSide });
  const lipMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad, side: THREE.DoubleSide, transparent: true, opacity: 0.93 });
  const meshSets = [0, 1].map(() => { const wm = new THREE.Mesh(gridGeo(WC, WR), waveMat), lm = new THREE.Mesh(gridGeo(LC, LR), lipMat); wm.frustumCulled = lm.frustumCulled = false; wm.receiveShadow = !touch; wm.visible = lm.visible = false; scene.add(wm, lm); return { wm, lm, used: false }; });
  function calcNormals(g, cols, rows, outward) { const p = g.attributes.position.array, n = g.attributes.normal.array, P = (i, j) => (clamp(j, 0, rows - 1) * cols + clamp(i, 0, cols - 1)) * 3;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const a = P(i + 1, j), b = P(i - 1, j), c = P(i, j + 1), d = P(i, j - 1), k = (j * cols + i) * 3;
      const ux = p[a] - p[b], uy = p[a + 1] - p[b + 1], uz = p[a + 2] - p[b + 2], vx = p[c] - p[d], vy = p[c + 1] - p[d + 1], vz = p[c + 2] - p[d + 2];
      let nx = vy * uz - vz * uy, ny = vz * ux - vx * uz, nz = vx * uy - vy * ux; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      if (outward) { if (!outward(p[k], p[k + 1], p[k + 2], nx, ny, nz)) { nx = -nx; ny = -ny; nz = -nz; } } else if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
      n[k] = nx; n[k + 1] = ny; n[k + 2] = nz; }
    g.attributes.normal.needsUpdate = true; }
  const ci = {};
  function buildWave(w) {
    const ms = w.mesh, g = ms.wm.geometry, P = g.attributes.position.array, C = g.attributes.color.array, aL = w.broke ? w.xp - 48 : -62, aR = w.broke ? w.xp + 88 : 72, wb = w.amp * 1.5 + 2, Wb = wb * 2.3, ampN = Math.max(1, w.amp);
    for (let i = 0; i < WC; i++) { const a = aL + (aR - aL) * i / (WC - 1), tp = sstep(aL, aL + 18, a) * sstep(aR, aR - 18, a); colInfo(w, a, ci); const x = -a, wf = ci.wf, front2 = 2 * w.amp + 10;
      for (let j = 0; j < WR; j++) { let d; if (j < RB) d = -Wb * Math.pow(1 - j / RB, 1.6); else if (j < RB + RF) d = (j - RB) / (RF - 1) * 1.12 * wf; else d = 1.12 * wf + Math.pow((j - RB - RF + 1) / RN, 1.4) * front2;
        const z = w.zc - d, yw = prof(w, ci, d) * tp; let y = yw + chop(x, z, TT) + 0.03;
        if (ci.foam > 0.05 && d > -1.5 && d < wf * 1.2) y += ci.foam * 0.28 * Math.sin(a * 1.3 + TT * 5) * Math.sin(d * 1.1 - TT * 3);
        const k = (j * WC + i) * 3; P[k] = x; P[k + 1] = y; P[k + 2] = z;
        const hN = yw / ampN; if (d >= 0) { tmpC.copy(deepC).lerp(faceC, sstep(0.04, 0.55, hN)).lerp(glowC, sstep(0.55, 0.95, hN) * 0.65); } else tmpC.copy(deepC).lerp(faceC, hN * 0.55);
        let fm = ci.foam * (d > -1.5 && d < wf * 1.15 ? 1 : 0) * tp * sstep(-40, -6, ci.e) * (0.55 + 0.45 * Math.sin(a * 0.9 + d * 1.7 + TT * 3)); if (w.broke && ci.e > -3 && ci.e < 16 && d > -0.9 && d < 0.1 * wf) fm = Math.max(fm, 0.85 * (1 - Math.max(0, ci.e - 2) / 14));
        if (fm > 0) tmpC.lerp(foamC, Math.min(1, fm)); tmpC.lerp(shallowC, sstep(30, -12, z) * 0.35);
        C[k] = tmpC.r; C[k + 1] = tmpC.g; C[k + 2] = tmpC.b; } }
    g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; calcNormals(g, WC, WR); ms.wm.visible = true;
    // the LIP: an arc thrown forward off the crest, fully pitched at the peel point, feathering out TL metres down the line
    const lm = ms.lm; lm.visible = w.broke && w.amp > 1.4; if (!lm.visible) return;
    const lg = lm.geometry, LP = lg.attributes.position.array, LCc = lg.attributes.color.array; w.lipC = w.lipC || [];
    for (let i = 0; i < LC; i++) { const e = -1 + (T.TL + 1) * i / (LC - 1), a = w.xp + Math.max(0, e); colInfo(w, a, ci); const A = ci.A, wf = ci.wf, kk = clamp(1 - e / T.TL, 0, 1), phiM = Math.PI * (0.12 + 0.88 * Math.pow(kk, 0.8)), Rd = 0.34 * A, x = -(w.xp + e);
      w.lipC[i] = [x, A * 0.55, w.zc - wf * 0.4];
      for (let j = 0; j < LR; j++) { const ph = phiM * j / (LR - 1), d = Rd * Math.sin(ph) + 0.8 * wf * (ph / Math.PI), y = A * (1 - 0.45 * (1 - Math.cos(ph))) + chop(x, w.zc - d, TT) + 0.04, k = (j * LC + i) * 3;
        LP[k] = x; LP[k + 1] = y; LP[k + 2] = w.zc - d; const u = j / (LR - 1); tmpC.copy(faceC).lerp(glowC, Math.min(1, u * 1.6) * 0.8).lerp(foamC, sstep(0.55, 1, u) * (0.5 + 0.5 * kk)); LCc[k] = tmpC.r; LCc[k + 1] = tmpC.g; LCc[k + 2] = tmpC.b; } }
    lg.attributes.position.needsUpdate = true; lg.attributes.color.needsUpdate = true;
    calcNormals(lg, LC, LR, (x, y, z, nx, ny, nz) => { const i = clamp(Math.round((-x - w.xp + 1) / (T.TL + 1) * (LC - 1)), 0, LC - 1), c = w.lipC[i]; return (x - c[0]) * nx + (y - c[1]) * ny + (z - c[2]) * nz > 0; }); }
  function spawnWave(H) { const ms = meshSets.find(m => !m.used); if (!ms) return null; ms.used = true; const w = { zc: T.Z_SPAWN, H, amp: 0.5, shoal: 0, broke: false, xp: 0, peelT: 0, seed: rr(0, 6), mesh: ms, rider: null, t: 0 }; WV.push(w); return w; }
  function killWave(w) { w.mesh.used = false; w.mesh.wm.visible = w.mesh.lm.visible = false; WV.splice(WV.indexOf(w), 1); }
  function waveStep(w, dt) {
    w.t += dt; w.zc -= T.VW * dt; w.shoal = sstep(T.Z_SPAWN, T.Z_BREAK + 6, w.zc); const fade = sstep(T.Z_SHORE, T.Z_SHORE + 34, w.zc); w.amp = w.H * (0.22 + 0.78 * w.shoal) * (0.12 + 0.88 * fade);
    if (!w.broke && w.zc <= T.Z_BREAK) { w.broke = true; w.peelT = 0; w.xp = 0; audio.burst(1.2, 500, 0.18); }
    if (w.broke) { w.peelT += dt; const vp = T.VP * Math.min(1, 0.35 + w.peelT / 2.5) * (1 + 0.18 * Math.sin(w.peelT * 0.9 + w.seed)); w.xp += vp * dt;
      // the lip landing in the trough: foam explosion at the peel point
      if (w.amp > 1.5 && Math.random() < (touch ? 0.5 : 0.85)) { colInfo(w, w.xp, ci); spray(V3(-(w.xp + rr(-1, 1.5)), ci.A * 0.15, w.zc - ci.wf * rr(0.6, 1.0)), 1, 3 + w.amp * 0.5, 1.6 + w.amp * 0.18, 0.9); }
      if (Math.random() < (touch ? 0.25 : 0.45)) { const e = rr(-14, -1); colInfo(w, w.xp + e, ci); spray(V3(-(w.xp + e), ci.A * 0.5 + 0.3, w.zc - ci.wf * rr(0.1, 0.9)), 1, 1.5, 1.4, 0.8); } }
    if (w.zc < T.Z_SHORE - 4) { killWave(w); return; }
    buildWave(w); }

  // ---------- FX: spray + popups ----------
  const SPN = touch ? 70 : 120, sprays = [];
  for (let i = 0; i < SPN; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0 })); m.visible = false; scene.add(m); sprays.push({ m, v: V3(), life: 0, max: 1, s: 1 }); }
  let spI = 0;
  function spray(p, n, spd, size = 1, life = 0.9, dir) { for (let k = 0; k < n; k++) { const s = sprays[spI = (spI + 1) % SPN]; s.m.position.copy(p); s.m.position.x += rr(-0.4, 0.4); s.m.position.z += rr(-0.4, 0.4); s.v.set(rr(-1, 1) * spd * 0.5, rr(0.5, 1.2) * spd, rr(-1, 1) * spd * 0.5); if (dir) s.v.addScaledVector(dir, spd); s.life = s.max = life * rr(0.7, 1.2); s.s = size * rr(0.7, 1.3); s.m.visible = true; } }
  function fxStep(dt) { for (const s of sprays) { if (s.life <= 0) continue; s.life -= dt; if (s.life <= 0) { s.m.visible = false; continue; } s.v.y -= 9 * dt; s.m.position.addScaledVector(s.v, dt); const u = 1 - s.life / s.max; s.m.material.opacity = 0.85 * (1 - u); s.m.scale.setScalar(s.s * (0.6 + u * 1.4)); } }

  // ---------- THE ISLAND: beach, BIG BLEACHERS of fox fans, judges' tower, five-board lineup, palms, flamingos ----------
  const sandT = canvasTex(256, 256, g => { g.fillStyle = '#ead7a4'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(160,130,80,0.14)' : 'rgba(255,255,255,0.18)'; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); } }); sandT.wrapS = sandT.wrapT = THREE.RepeatWrapping; sandT.repeat.set(30, 16);
  const island = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 16), new THREE.MeshToonMaterial({ map: sandT, gradientMap: grad })); island.scale.set(220, 6, 115); island.position.set(-60, -4.2, -100); island.receiveShadow = !touch; scene.add(island);
  const groundY = (x, z) => { const qx = (x + 60) / 220, qz = (z + 100) / 115, r = 1 - qx * qx - qz * qz; return r <= 0 ? -5 : -4.2 + 6 * Math.sqrt(r); };
  const BL = { x0: -138, x1: -14, z0: -25, tiers: 6, step: 2.4, rise: 1.25 };
  const white = toon('#f3f2f2'), red = toon('#ec3013'), ink = toon('#201e1d'), wood = toon('#b58a5a');
  for (let i = 0; i < BL.tiers; i++) { const z = BL.z0 - i * BL.step, top = 0.6 + (i + 1) * BL.rise, h = top + 2; M(new THREE.BoxGeometry(BL.x1 - BL.x0, h, BL.step), i % 2 ? white : toon('#e4e1dc'), (BL.x0 + BL.x1) / 2, top - h / 2, z - BL.step / 2, null, 0.05); M(new THREE.BoxGeometry(BL.x1 - BL.x0, 0.14, 0.14), red, (BL.x0 + BL.x1) / 2, top + 0.02, z - 0.05, null, 0); }
  { const zb = BL.z0 - BL.tiers * BL.step, topB = 0.6 + BL.tiers * BL.rise; M(new THREE.BoxGeometry(BL.x1 - BL.x0, 2.4, 0.4), red, (BL.x0 + BL.x1) / 2, topB + 1.2, zb, null, 0.05); for (let x = BL.x0; x <= BL.x1; x += 15.5) { M(new THREE.CylinderGeometry(0.12, 0.12, 7, 6), ink, x, topB + 3.5, zb, null, 0); const fl = M(new THREE.PlaneGeometry(2.2, 1.3), x % 2 ? red : white, x + 1.1, topB + 6.2, zb, null, 0); fl.material = fl.material.clone(); fl.material.side = THREE.DoubleSide; fl.userData.flag = true; } }
  // fans: instanced bodies, heads, ears, arms (they jump and throw their arms up when the crowd gets loud)
  const FAN_COLS = touch ? 24 : 40, fans = [], FS = 1.5;
  for (let t2 = 0; t2 < BL.tiers; t2++) for (let c = 0; c < FAN_COLS; c++) { if (Math.random() < 0.12) continue; fans.push({ x: BL.x0 + 2 + (BL.x1 - BL.x0 - 4) * (c + rr(0.1, 0.9)) / FAN_COLS, y: 0.6 + (t2 + 1) * BL.rise, z: BL.z0 - t2 * BL.step - 1.1, ph: rr(0, 6.28), f: rr(5, 8), k: rr(0.6, 1.2), yaw: rr(-0.35, 0.35) }); }
  const JUDGE0 = fans.length; for (let j = 0; j < 5; j++) fans.push({ x: -84 + j * 2.2, y: 7.2, z: -21.5, ph: j, f: 4, k: 0.2, yaw: 0, judge: true });
  const NF = fans.length, fanMat = new THREE.MeshToonMaterial({ gradientMap: grad }), mkI = (geo, n) => { const m = new THREE.InstancedMesh(geo, fanMat, n); m.frustumCulled = false; scene.add(m); return m; };
  const armGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.5, 5); armGeo.translate(0, -0.25, 0);
  const iBody = mkI(new THREE.CapsuleGeometry(0.3, 0.45, 3, 8), NF), iHead = mkI(new THREE.SphereGeometry(0.29, 10, 8), NF), iEar = mkI(new THREE.ConeGeometry(0.1, 0.26, 4), NF * 2), iArm = mkI(armGeo, NF * 2), iSnout = mkI(new THREE.ConeGeometry(0.1, 0.24, 5), NF);
  { const shirts = ['#ec3013', '#f3f2f2', '#38bdf8', '#ffd23a', '#201e1d', '#5ec97e', '#f472b6', '#e6b45a'], furs = ['#f07a2a', '#c2410c', '#e8b277', '#8a5a2b', '#f3e2c4', '#5b4636', '#d9772b'];
    for (let i = 0; i < NF; i++) { const sh = new THREE.Color(fans[i].judge ? '#201e1d' : pick(shirts)), fu = new THREE.Color(pick(furs)); iBody.setColorAt(i, sh); iHead.setColorAt(i, fu); iSnout.setColorAt(i, fu); iEar.setColorAt(i * 2, fu); iEar.setColorAt(i * 2 + 1, fu); iArm.setColorAt(i * 2, sh); iArm.setColorAt(i * 2 + 1, sh); }
    [iBody, iHead, iSnout, iEar, iArm].forEach(m => m.instanceColor.needsUpdate = true); }
  const dmy = new THREE.Object3D(), dmy2 = new THREE.Object3D();
  function crowdStep(t, E) { for (let i = 0; i < NF; i++) { const f = fans[i], ex = f.judge ? (G.cardsUp ? 0.6 : 0) : E * f.k, hop = f.judge ? 0 : Math.max(0, Math.sin(t * f.f + f.ph)) * (0.04 + ex * 0.55), y = f.y + hop;
      dmy.position.set(f.x, y + 0.55 * FS, f.z); dmy.rotation.set(0, f.yaw, 0); dmy.scale.setScalar(FS); dmy.updateMatrix(); iBody.setMatrixAt(i, dmy.matrix);
      dmy.position.y = y + 1.18 * FS; dmy.updateMatrix(); iHead.setMatrixAt(i, dmy.matrix);
      dmy2.position.set(f.x + Math.sin(f.yaw) * 0.3 * FS, y + 1.12 * FS, f.z + Math.cos(f.yaw) * 0.3 * FS); dmy2.rotation.set(Math.PI / 2, 0, 0); dmy2.rotation.y = 0; dmy2.scale.setScalar(FS); dmy2.updateMatrix(); iSnout.setMatrixAt(i, dmy2.matrix);
      for (const s of [-1, 1]) { dmy2.position.set(f.x + s * 0.17 * FS, y + 1.42 * FS, f.z); dmy2.rotation.set(0, 0, -s * 0.25); dmy2.updateMatrix(); iEar.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), dmy2.matrix);
        const lift = 0.2 + Math.min(1, ex * 1.6) * (2.3 + 0.4 * Math.sin(t * 7 + f.ph + s)); dmy2.position.set(f.x + s * 0.3 * FS, y + 0.85 * FS, f.z); dmy2.rotation.set(0, 0, s * lift); dmy2.updateMatrix(); iArm.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), dmy2.matrix); } }
    [iBody, iHead, iSnout, iEar, iArm].forEach(m => m.instanceMatrix.needsUpdate = true); }
  // judges' tower + the marquee
  { const tx = -79.6, tz = -21.5; for (const [a, b] of [[-6, -1.5], [6, -1.5], [-6, 1.5], [6, 1.5]]) M(new THREE.BoxGeometry(0.4, 6.6, 0.4), wood, tx + a, 3.3, tz + b, null, 0.03);
    M(new THREE.BoxGeometry(13, 0.4, 4), wood, tx, 6.6, tz, null, 0.04); M(new THREE.BoxGeometry(13, 1.1, 0.2), white, tx, 7.3, tz + 1.9, null, 0.03); M(new THREE.BoxGeometry(13.6, 0.3, 4.6), red, tx, 10.4, tz, null, 0.04);
    for (const a of [-6.4, 6.4]) M(new THREE.BoxGeometry(0.3, 3.6, 0.3), ink, tx + a, 8.6, tz + 2, null, 0);
    const mq = canvasTex(1024, 256, g => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, 1024, 256); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 20, 256); g.fillStyle = '#ffd23a'; g.font = '800 34px Archivo, sans-serif'; g.fillText('JIDDA LAGOON PRESENTS', 52, 58); g.fillStyle = '#ffffff'; g.font = '900 120px Archivo, sans-serif'; g.fillText('THE BREAK', 46, 170); g.fillStyle = '#7dd3fc'; g.font = '800 34px Archivo, sans-serif'; g.fillText('THREE WAVES · ONE HEAT', 52, 228); });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(13, 3.25), new THREE.MeshBasicMaterial({ map: mq })); sign.position.set(tx, 12.4, tz + 2.2); scene.add(sign); M(new THREE.BoxGeometry(13.4, 3.5, 0.2), ink, tx, 12.4, tz + 2.05, null, 0);
    for (let j = 0; j < 5; j++) { const cm = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), white); cm.position.set(-84 + j * 2.2, 7.9, tz + 0.6); cm.visible = false; scene.add(cm); cardMs.push(cm); } }
  // the five-board lineup (stuck in the sand) + palms + flamingos in the shallows
  { const cols = ['#ec3013', '#f3f2f2', '#38bdf8', '#ffd23a', '#201e1d']; cols.forEach((c, i) => { const b = M(new THREE.CapsuleGeometry(0.32, 2.6, 4, 10), toon(c), -100 - i * 1.3, groundY(-100, -21) + 1.5, -21, null, 0.03); b.scale.set(1, 1, 0.22); b.rotation.z = rr(-0.08, 0.08); });
    const palm = (x, z, h = 9) => { const y0 = groundY(x, z), g = new THREE.Group(); g.position.set(x, y0, z); g.rotation.z = rr(-0.18, 0.18); scene.add(g); for (let k = 0; k < 5; k++) M(new THREE.CylinderGeometry(0.32 - k * 0.03, 0.36 - k * 0.03, h / 5, 7), toon('#8a6238'), Math.sin(k * 0.4) * 0.3, h / 10 + k * h / 5, 0, g, 0.03); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28, lf = M(new THREE.ConeGeometry(0.7, 5, 4), toon(k % 2 ? '#3f8f3a' : '#5ec97e'), Math.cos(a) * 2, h - 0.6, Math.sin(a) * 2, g, 0.03); lf.scale.set(1, 1, 0.35); lf.rotation.order = 'YXZ'; lf.rotation.set(0, -a, -1.5); } };
    for (const [x, z] of [[10, -28], [24, -34], [40, -30], [-150, -26], [-165, -34], [-180, -24], [-4, -44], [58, -40]]) palm(x, z, rr(8, 11));
    for (const [x, z] of [[30, -10], [34, -12.5], [27, -13]]) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rr(0, 6); scene.add(g); const pk = toon('#f49ac1'); M(new THREE.SphereGeometry(0.5, 10, 8), pk, 0, 1.9, 0, g, 0.03).scale.set(1, 0.7, 1.4); M(new THREE.CylinderGeometry(0.07, 0.09, 1.2, 6), pk, 0, 2.6, 0.5, g, 0.02).rotation.x = 0.3; M(new THREE.SphereGeometry(0.17, 8, 6), pk, 0, 3.2, 0.7, g, 0.02); M(new THREE.ConeGeometry(0.06, 0.25, 5), ink, 0, 3.15, 0.92, g, 0).rotation.x = 1.9; for (const s of [-0.12, 0.12]) M(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 4), toon('#e0648f'), s, 0.9, 0, g, 0); } }
  // far scenery from the master plan (castle island, the mountain, town, lighthouses, windmills)
  const spinners = [];
  { const haze = c => { const m = toon(c).clone(); m.fog = false; return m; };
    for (const [kind, , lx, lz, r, h, key] of landmarks('surf')) { if (key === 'jSurfContest') continue; const d = Math.hypot(lx, lz), far = d > 560, k = far ? 560 / d : 1, g = new THREE.Group(); g.position.set(lx * k, 0, lz * k); g.scale.setScalar(k); scene.add(g); const mat = c => far ? haze(c) : toon(c);
      if (kind === 'mountain') { M(new THREE.ConeGeometry(r, h, 9), mat('#7d7468'), 0, h / 2 - 4, 0, g, 0); M(new THREE.ConeGeometry(r * 0.55, h * 0.45, 8), mat('#968b7c'), r * 0.3, h * 0.2, r * 0.1, g, 0); M(new THREE.CylinderGeometry(r * 1.05, r * 1.1, 10, 12), mat('#5c9a43'), 0, 0, 0, g, 0); }
      else if (kind === 'castle') { M(new THREE.CylinderGeometry(r, r * 1.2, 10, 10), mat('#5c9a43'), 0, 2, 0, g, 0); for (const [a, b, hh] of [[-12, -6, 34], [12, -6, 30], [0, 10, 44], [-10, 12, 26]]) { M(new THREE.CylinderGeometry(4, 4.4, hh, 8), mat('#d9cfbf'), a, hh / 2 + 6, b, g, 0); M(new THREE.ConeGeometry(5, 9, 8), mat('#3c6fb4'), a, hh + 10, b, g, 0); } M(new THREE.BoxGeometry(26, 16, 22), mat('#cfc4b2'), 0, 14, 2, g, 0); }
      else if (kind === 'lighthouse') { for (let s2 = 0; s2 < 6; s2++) M(new THREE.CylinderGeometry(2.6 - s2 * 0.2, 2.8 - s2 * 0.2, 4, 10), mat(s2 % 2 ? '#ec3013' : '#f3f2f2'), 0, 2 + s2 * 4, 0, g, 0.04); M(new THREE.CylinderGeometry(1.8, 1.8, 2.4, 10), mat('#fff3c4'), 0, 26, 0, g, 0); M(new THREE.CylinderGeometry(9, 11, 3, 10), mat('#8d8478'), 0, 0, 0, g, 0); }
      else if (kind === 'windmill') { M(new THREE.CylinderGeometry(2.4, 3.4, 13, 8), mat('#f3f2f2'), 0, 6.5, 0, g, 0); M(new THREE.ConeGeometry(3.2, 3, 8), mat('#c4553a'), 0, 14.5, 0, g, 0); const hub = new THREE.Group(); hub.position.set(0, 12, 3.2); g.add(hub); for (let b = 0; b < 4; b++) { const arm = new THREE.Group(); arm.rotation.z = b * Math.PI / 2; arm.add(M(new THREE.BoxGeometry(1.4, 8, 0.2), mat('#e8dcc4'), 0, 4, 0, null, 0)); hub.add(arm); } spinners.push(hub); }
      else { const m = M(new THREE.SphereGeometry(1, 16, 8), mat(r > 100 ? '#5c9a43' : '#d9c48f'), 0, -2, 0, g, 0); m.scale.set(r, Math.max(10, r * 0.12), r * 0.8); for (let p = 0; p < 6; p++) { const a = p / 6 * 6.28, pr = r * 0.5; M(new THREE.CylinderGeometry(1, 1.4, 14, 5), mat('#8a6238'), Math.cos(a) * pr, 10, Math.sin(a) * pr, g, 0); M(new THREE.ConeGeometry(7, 6, 6), mat('#3f8f3a'), Math.cos(a) * pr, 18, Math.sin(a) * pr, g, 0); } if (key === 'jTown') for (let p = 0; p < 9; p++) M(new THREE.BoxGeometry(14, rr(10, 24), 14), mat(pick(['#f3e7d3', '#d9cfbf', '#cfe9ff'])), rr(-60, 60), 8, rr(-40, 40), g, 0); } } }
  // the PEAK buoy (red) and the TAKE-OFF ring (yellow) in the lineup
  const peakBuoy = new THREE.Group(); M(new THREE.SphereGeometry(0.7, 12, 10), red, 0, 0.3, 0, peakBuoy, 0.05); M(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), ink, 0, 1.4, 0, peakBuoy, 0); M(new THREE.PlaneGeometry(1.1, 0.7), red, 0.55, 2.3, 0, peakBuoy, 0).material = new THREE.MeshBasicMaterial({ color: 0xec3013, side: THREE.DoubleSide }); scene.add(peakBuoy);
  const signTex = (txt, bg, fg) => canvasTex(256, 96, g => { g.fillStyle = bg; g.fillRect(0, 0, 256, 96); g.strokeStyle = '#201e1d'; g.lineWidth = 8; g.strokeRect(4, 4, 248, 88); g.fillStyle = fg; let fs = 52; g.font = '900 ' + fs + 'px Archivo, sans-serif'; const tw = g.measureText(txt).width; if (tw > 220) { fs = Math.floor(fs * 220 / tw); g.font = '900 ' + fs + 'px Archivo, sans-serif'; } g.textBaseline = 'middle'; g.fillText(txt, 18, 52); });
  const mkSign = (tex, w = 3.2) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); sp.scale.set(w, w * 0.375, 1); scene.add(sp); return sp; };
  const SIGN = { peak: signTex('PEAK', '#ec3013', '#ffffff'), breaking: signTex('BREAKING', '#ffffff', '#ec3013'), take: signTex('TAKE OFF', '#ffd23a', '#201e1d'), paddle: signTex('PADDLE!', '#201e1d', '#ffd23a'), waves: [1, 2, 3].map(n => signTex('WAVE ' + n + '/3', '#ffd23a', '#201e1d')) };
  const peakSign = mkSign(SIGN.peak, 3.4), takeSign = mkSign(SIGN.take, 3.4), takeBuoy = new THREE.Group(); M(new THREE.SphereGeometry(0.45, 12, 10), toon('#ffd23a'), 0, 0.2, 0, takeBuoy, 0.04); M(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), ink, 0, 1.2, 0, takeBuoy, 0); scene.add(takeBuoy);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.056, 6, 32), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthWrite: false })); ring.renderOrder = -1; ring.rotation.x = -Math.PI / 2; scene.add(ring);

  // ---------- RIDERS: Ben (the cast's player) and JOB ----------
  const RS = T.RS, AX = V3(1, 0, 0), AY = V3(0, 1, 0), AZ = V3(0, 0, 1), FLIPAX = V3(1, 0, 1).normalize();
  function makeRig(fox) { const root = new THREE.Group(), board = VK.make('surf'); board.scale.setScalar(RS * T.BOARD); root.add(board); const V = board.userData.V, holder = new THREE.Group(); holder.scale.setScalar(RS * T.FOX); holder.position.y = V.seat.y * RS * (T.BOARD - T.FOX); root.add(holder); fox.position.copy(V.seat); holder.add(fox); scene.add(root);
    const blob = new THREE.Mesh(new THREE.CircleGeometry(1.6, 16), new THREE.MeshBasicMaterial({ color: 0x063a52, transparent: true, opacity: 0.25, depthWrite: false })); blob.rotation.x = -Math.PI / 2; scene.add(blob);
    return { root, board, holder, V, fox, P: fox.userData.P, blob, mode: 'sit', a: 0, d: 0, x: 0, z: 0, y: 0, s: 0, th: -Math.PI / 2, vy: 0, vd: 0, p: 0, lean: 0, crouch: 0, hang: 0, hangT: 0, cut: null, snapT: 0, snapTo: 0, trick: null, combo: [], airT: 0, tube: 0, inTube: false, pts: 0, moves: {}, cd: 0, wipe: null, popT: 0, w: null, tilt: 0 }; }
  const ben = makeRig(cast.make('player', { gear: 'none' }));
  const jobFox = kit.makeFox({ key: 'job', torso: ['#d8f3ef', '#8fd6cc', '#3f9a8c'], outfit: 'vest', look: { ...PLAYER_MALE, fur: '#c98a4b', furDark: '#8a5a2b', tailBase: '#8a5a2b', tailMid: '#3f9a8c', tailTip: '#d8f3ef', armorAccent: '#3f9a8c' }, mood: 'smug' });
  const job = makeRig(jobFox); job.isJob = true;
  const joss = kit.makeFox({ key: 'joss', torso: ['#fff4e2', '#f0a63c', '#a85f17'], outfit: 'vest', look: { ...PLAYER_FEMALE, fur: '#f0a63c', furDark: '#c9741f', tailMid: '#ffd9a0', tailTip: '#ffffff' }, mood: 'neutral' });
  joss.scale.setScalar(RS); joss.position.set(-71, groundY(-71, -19.5), -19.5); joss.rotation.y = 0.2; scene.add(joss);
  { const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.44), white); sheet.position.set(0.25, 0.85, 0.32); sheet.rotation.x = -0.5; joss.add(sheet); }

  // pose: stance on the board (sideways, regular foot), prone paddling, the pop-up, tricks
  function pose(R, dt) { const f = R.fox, P = R.P, V = R.V; kit.animFox(f, dt, 0, false); if (R.wipe) return;
    f.rotation.set(0, 0, 0); P.body.rotation.set(0, 0, 0); f.position.set(V.seat.x, V.seat.y, V.seat.z);
    if (R.mode === 'sit') { f.rotation.x = 1.35; P.body.rotation.set(0, 0, 0); P.legs.forEach(l => { l.rotation.x = 0.1; l.rotation.z = 0; }); const pa = TT * (R.p > 0.4 ? 8 : 1.4); P.arms.forEach((a, i) => { a.rotation.x = -2.4 + Math.sin(pa + i * Math.PI) * (R.p > 0.4 ? 1.2 : 0.4); a.rotation.z = (i ? 1 : -1) * 0.25; }); f.position.set(0, V.seat.y + 0.12, -0.15); return; }
    const pk = R.mode === 'pop' ? clamp(R.popT / 0.35, 0, 1) : 1, hg = R.hang, c = clamp(R.crouch, 0, 1), tr = R.trick, u = tr ? clamp(tr.t / tr.dur, 0, 1) : 0, su = Math.sin(u * Math.PI);
    f.rotation.x = 1.35 * (1 - pk); f.rotation.y = Math.PI / 2 * 0.9 * pk * (1 - hg);
    P.legs[0].rotation.x = -0.45 - c * 0.45; P.legs[1].rotation.x = 0.45 + c * 0.2; P.legs.forEach((l, i) => l.rotation.z = (i ? 1 : -1) * 0.18 * (1 - hg));
    P.arms.forEach((a, i) => { a.rotation.x = -0.5 - hg * 0.8 - c * 0.4; a.rotation.z = (i ? 1 : -1) * (1.15 - hg * 0.6) + R.lean * 0.8; });
    P.body.rotation.x = (0.35 + c * 0.35 - hg * 0.2) * pk; P.body.rotation.z = R.lean * 0.7;
    f.position.set(0, V.seat.y - 0.18 - c * 0.16 + hg * 0.08, hg * 0.7);
    if (tr && tr.k === 'GRAB') { P.arms[0].rotation.x = 0.3 + su * 0.6; P.arms[0].rotation.z = -0.3; P.legs[0].rotation.x -= su * 0.4; f.position.y -= su * 0.12; }
    if (tr && tr.k === 'SUPERMAN') { f.position.y += su * 0.55; f.rotation.x = -1.35 * su; P.arms.forEach(a => { a.rotation.x = -2.9 * su - 0.5 * (1 - su); a.rotation.z *= 1 - su; }); P.legs.forEach(l => l.rotation.x = 0.2 * su); }
    if (R.mode === 'air' && !tr) { P.arms.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * 1.5; }); }
    if (R.stallT > 0) { P.arms[1].rotation.x = 0.5; P.arms[1].rotation.z = 1.75; }
    if (R.hangK === 'CHEATER FIVE' && hg > 0.3) { P.legs[0].rotation.x = -1.05 * hg; P.body.rotation.x += 0.35 * hg; f.position.y -= 0.12 * hg; }
    if (tr && tr.k === 'KICKFLIP') { R.board.rotation.z = u * Math.PI * 2; f.position.y += su * 0.9; } else R.board.rotation.z = 0; }

  const _b = new THREE.Matrix4(), _f = V3(), _u = V3(), _r = V3(), _q2 = new THREE.Quaternion();
  function placeRig(R, x, y, z, th, nx, ny, nz, lean = 0, spin = 0, flip = 0) {
    _u.set(nx, ny, nz).normalize(); _f.set(-Math.cos(th), 0, -Math.sin(th)); _f.addScaledVector(_u, -_f.dot(_u)).normalize(); _r.crossVectors(_u, _f).normalize(); _b.makeBasis(_r, _u, _f); R.root.quaternion.setFromRotationMatrix(_b);
    if (lean) R.root.quaternion.multiply(_q2.setFromAxisAngle(AZ, lean)); if (spin) R.root.quaternion.multiply(_q2.setFromAxisAngle(AY, spin)); if (flip) R.root.quaternion.multiply(_q2.setFromAxisAngle(FLIPAX, flip));
    R.root.position.set(x, y, z); R.blob.position.set(x, seaH(x, z) + 0.06, z); R.blob.material.opacity = R.mode === 'air' ? 0.12 : 0.22; }

  // ---------- AUDIO: the crowd + the wave ----------
  let crowdG = null;
  function audioOn() { audio.init(); if (crowdG || !audio.ctx) return; const ctx = audio.ctx, s = ctx.createBufferSource(); s.buffer = audio.noise; s.loop = true; const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 1100; b.Q.value = 0.5; crowdG = ctx.createGain(); crowdG.gain.value = 0.02; s.connect(b); b.connect(crowdG); crowdG.connect(audio.master); s.start(); }
  function cheer(v) { G.E = Math.min(1, G.E + v); if (!audio.ctx) return; const n = Math.round(1 + v * 6); for (let k = 0; k < n; k++) setTimeout(() => audio.tone(rr(1500, 2300), 0.22, 0.02 + v * 0.03, 'sine', rr(1.2, 1.5), rr(-0.6, 0.6)), k * rr(60, 140)); }
  function ooh() { G.E = Math.min(1, G.E + 0.5); G.ooh = 1.4; if (audio.ctx) { audio.tone(240, 1.1, 0.05, 'sawtooth', 0.6); audio.tone(300, 1.0, 0.03, 'triangle', 0.62); } }

  // ---------- GAME STATE ----------
  const G = G0; Object.assign(G, { phase: 'ready', board: true, round: 'free', turn: 'ben', free: [], ben: [], job: [], cards: null, cardsUp: false, E: 0, ooh: 0, banner: '', bannerT: 0, radio: '', radioWho: 'JOSS', radioT: 0, flash: null, flashId: 0, waveT: 2.5, misses: 0, done: null,
    stats: { airs: 0, tubes: 0, longTube: 0, wipeouts: 0, best: null }, jobPlan: [], skip: false });
  const say = (s, t = 2.6) => { G.banner = s; G.bannerT = t; };
  const radio = (s, who = 'JOSS', t = 6) => { G.radio = s; G.radioWho = who; G.radioT = t; };
  const flash = (txt, col = '#ffd23a') => { G.flash = { txt, col, id: ++G.flashId }; G.flashT = 1.8; };
  const best2 = l => { const s = [...l].sort((a, b) => b - a); return (s[0] || 0) + (s[1] || 0); };

  function sitAt(R, a, z) { R.mode = 'sit'; R.wipe = null; R.w = null; R.x = -a; R.z = z; R.p = 0; R.s = 0; R.th = -Math.PI / 2; R.trick = null; R.hang = 0; R.crouch = 0; R.lean = 0; R.cut = null; reattach(R); }
  function reattach(R) { if (R.fox.parent !== R.holder) { R.holder.add(R.fox); R.fox.scale.set(1, 1, 1); } R.fox.position.copy(R.V.seat); R.fox.rotation.set(0, 0, 0); }
  function placeLineup() { if (G.turn === 'ben') { sitAt(ben, -T.SPOT[0], T.SPOT[1]); if (G.round === 'final') sitAt(job, 1, 71); else sitAt(job, 16, 82); } else { sitAt(job, -T.SPOT[0], T.SPOT[1]); sitAt(ben, 18, 84); } G.waveT = 2.2; cam.cut = true; }

  // ---------- RIDING (player physics, wave frame) ----------
  function mult(R) { const e = R.w && R.w.broke ? Math.max(0, R.a - R.w.xp) : 30; return (1 + 1.4 * Math.exp(-e / 8)) * clamp(0.6 + R.s / 24, 0.7, 1.4); }
  function award(R, name, base, opt = {}) { const n = R.moves[name] || 0; R.moves[name] = n + 1; const v = Math.round(base * (opt.flat ? 1 : mult(R)) / (1 + 0.4 * n) * (R.pw && R.pw.x2 > 0 ? 2 : 1)); R.pts += v; if (!R.isJob && G.round === 'final' && job.w && job.mode === 'ride') job.gap += v / 180; if (!R.isJob) { flash(name + '  +' + v, opt.col); if (!G.stats.best || v > G.stats.best.v) G.stats.best = { n: name, v }; } else flash('JOB · ' + name, '#7dd3fc'); cheer(clamp(v / 420, 0.08, 0.9)); audio.tone(880 + Math.min(900, v), 0.12, 0.04, 'triangle', 1.4); return v; }
  function catchWave(R, w) { R.w = w; w.rider = R; R.a = -R.x; R.d = w.zc - R.z; R.mode = 'pop'; R.popT = 0; R.rideT = 0; R.th = 1.1; R.s = 5 + R.p; R.pts = 0; R.moves = {}; R.combo = []; R.tube = 0; R.inTube = false; R.late = R.d < 0.32 * colInfo(w, R.a, ci).wf; audio.burst(0.5, 1200, 0.12); if (!R.isJob) { G.misses = 0; say(R.late ? 'LATE DROP!' : 'GO!', 1.4); spawnTokens(R); R.pw = {}; R.coins = 0; spawnSprees(R); if (G.round === 'final') jobDropIn(w); } }
  const dirOf = () => { const sx = STK.x + kx(), sy = STK.y + ky(); if (Math.hypot(sx, sy) < 0.4) return 'n'; return Math.abs(sx) > Math.abs(sy) ? (sx > 0 ? 'r' : 'l') : (sy > 0 ? 'u' : 'd'); };
  // ---------- THE 8 TOKENS: gold 8-coins laid on the face along the line (high, low, on the lip, up in the air) to show where to surf ----------
  const tokTex = canvasTex(128, 128, g => { g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#a8792e'; g.stroke(); g.fillStyle = '#201e1d'; g.font = '900 78px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 64, 68); });
  const tokMat = new THREE.MeshToonMaterial({ map: tokTex, gradientMap: grad, emissive: new THREE.Color('#6a4500'), emissiveIntensity: 0.45 }), tokEdge = toon('#c8922e'), toks = [];
  for (let i = 0; i < 8; i++) { const g = new THREE.Group(), c = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.18, 20), [tokEdge, tokMat, tokMat]); c.rotation.x = Math.PI / 2; addOutline(c, 0.05); g.add(c); g.visible = false; scene.add(g); toks.push({ g, a: 0, n: 0.5, air: false, on: false }); }
  const TOK_N = [0.62, 0.36, 0.82, 0.05, 0.55, 0.24, 0.84, -1];   // -1 = up in the air off the lip
  function spawnTokens(R) { R.tok = 0; toks.forEach((t, i) => { t.a = R.a + 18 + i * 13; t.n = TOK_N[i] < 0 ? 0.1 : TOK_N[i]; t.air = TOK_N[i] < 0; t.on = true; t.g.visible = true; }); }
  function hideTokens() { toks.forEach(t => { t.on = false; t.g.visible = false; }); }
  // ---------- COIN SPREES (above the water: jump or ride high to get them) + a few POWER-UPS ----------
  const coins = [], CN = 24; for (let i = 0; i < CN; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 14), [tokEdge, tokMat, tokMat]); c.rotation.x = Math.PI / 2; const g = new THREE.Group(); g.add(c); g.visible = false; scene.add(g); coins.push({ g, a: 0, n: 0, h: 0, on: false }); }
  const PW = { x2: ['2X', '#ec3013', 'DOUBLE POINTS · 8 S'], wax: ['W', '#38bdf8', 'SURF WAX · SPEED + JOB SLIPS BACK'], mag: ['M', '#ffd23a', 'MAGNET · COINS + TOKENS COME TO YOU'] };
  const pwTex = k => canvasTex(128, 128, g => { g.fillStyle = PW[k][1]; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#ffffff'; g.stroke(); g.fillStyle = k === 'mag' ? '#201e1d' : '#ffffff'; g.font = '900 ' + (k === 'x2' ? 58 : 72) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(PW[k][0], 64, 68); });
  const pwSpr = {}; for (const k in PW) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: pwTex(k), transparent: true, depthWrite: false })); sp.scale.set(1.8, 1.8, 1); sp.visible = false; scene.add(sp); const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: PW[k][1], transparent: true, depthWrite: false, opacity: 0.6 })); halo.scale.set(2, 2, 1); sp.add(halo); pwSpr[k] = { sp, a: 0, n: 0, h: 0, on: false }; }
  function hideSprees() { coins.forEach(c => { c.on = false; c.g.visible = false; c.pull = 0; }); for (const k in pwSpr) { pwSpr[k].on = false; pwSpr[k].sp.visible = false; pwSpr[k].pull = 0; } }
  function spawnSprees(R) { hideSprees(); let ci2 = 0;
    const arcs = [[R.a + rr(30, 45), 0.12, 'air'], [R.a + rr(70, 90), 0.2, 'high']]; if (Math.random() < 0.5) arcs.push([R.a + rr(105, 120), 0.12, 'air']);
    const pk = Math.random() < 0.75 ? pick(Object.keys(PW)) : null, pArc = Math.floor(rr(0, arcs.length));
    arcs.forEach(([a0, n, kind], ai) => { for (let j = 0; j < 6 && ci2 < CN; j++, ci2++) { const u = j / 5, c = coins[ci2]; c.a = a0 + j * 2; c.n = n; c.h = kind === 'air' ? 2.2 + 2.6 * Math.sin(Math.PI * u) : 1.2 + 0.4 * Math.sin(Math.PI * u); c.on = true; c.g.visible = true; }
      if (pk && ai === pArc) { const P2 = pwSpr[pk]; P2.a = a0 + 5; P2.n = n; P2.h = kind === 'air' ? 5.6 : 2.4; P2.on = true; P2.sp.visible = true; } }); }
  function power(R, k) { R.pw = R.pw || {}; flash(PW[k][2], PW[k][1]); cheer(0.35); audio.tone(520, 0.4, 0.06, 'square', 2.4); if (k === 'x2') R.pw.x2 = 8; if (k === 'mag') R.pw.mag = 8; if (k === 'wax') { R.s = Math.min(24, R.s + 4); if (G.round === 'final' && job.w) job.gap += 5; R.pw.wax = 3; } }
  function spreeStep(R, dt) { const w = R.w; if (!w) return; const pw = R.pw || {}; for (const k in pw) pw[k] = Math.max(0, pw[k] - dt); const rad = pw.mag > 0 ? 7 : 1.9, ry = R.y + 0.9 * T.FOX;
    const grab = (o, x, y, z) => { const d = Math.hypot(R.x - x, ry - y, R.z - z); if (pw.mag > 0 && d < 12 && d > rad) o.pull = (o.pull || 0) + dt * 2; return d < rad + (o.pull || 0) * 2; };
    for (const c of coins) { if (!c.on) continue; colInfo(w, c.a, ci); const x = -c.a, z = w.zc - c.n * ci.wf, y = seaH(x, z) + c.h; c.g.position.set(x, y, z); c.g.rotation.y += dt * 5;
      if (grab(c, x, y, z)) { c.on = false; c.g.visible = false; c.pull = 0; R.coins = (R.coins || 0) + 1; G.coins = (G.coins || 0) + 1; const v = 25 * (pw.x2 > 0 ? 2 : 1); R.pts += v; audio.tone(1500 + (R.coins % 6) * 120, 0.08, 0.04, 'triangle', 1.3); spray(V3(x, y, z), 4, 2, 0.6, 0.4); if (R.coins % 6 === 0) flash('COIN SPREE +' + v * 6, '#e6b45a'); }
      else if (c.a < R.a - 8) { c.on = false; c.g.visible = false; } }
    for (const k in pwSpr) { const P2 = pwSpr[k]; if (!P2.on) continue; colInfo(w, P2.a, ci); const x = -P2.a, z = w.zc - P2.n * ci.wf, y = seaH(x, z) + P2.h + Math.sin(TT * 4) * 0.25; P2.sp.position.set(x, y, z); P2.sp.material.rotation = Math.sin(TT * 3) * 0.2;
      if (grab(P2, x, y, z)) { P2.on = false; P2.sp.visible = false; power(R, k); } else if (P2.a < R.a - 8) { P2.on = false; P2.sp.visible = false; } } }
  function tokStep(R, dt) { const w = R.w; if (!w) return; for (const t of toks) { if (!t.on) continue; colInfo(w, t.a, ci); const x = -t.a, z = w.zc - t.n * ci.wf, y = seaH(x, z) + (t.air ? 4.4 : 1.1) + Math.sin(TT * 3 + t.a) * 0.15; t.g.position.set(x, y, z); t.g.rotation.y += dt * 3;
      if (Math.hypot(R.x - x, R.y + 0.9 * T.FOX - y, R.z - z) < ((R.pw && R.pw.mag > 0) ? 7 : 2.4 + T.FOX * 0.4)) { t.on = false; t.g.visible = false; R.tok = (R.tok || 0) + 1; award(R, 'TOKEN ' + R.tok + ' / 8', 60, { flat: true, col: '#e6b45a' }); audio.tone(1320 + R.tok * 60, 0.12, 0.05, 'triangle', 1.5); spray(V3(x, y, z), 8, 3, 1, 0.6); if (R.tok === 8) award(R, 'ALL 8 TOKENS', 400, { flat: true, col: '#e6b45a' }); }
      else if (t.a < R.a - 6) { t.on = false; t.g.visible = false; } } }
  function rideStep(R, dt) {
    const w = R.w; colInfo(w, R.a, ci); const wf = ci.wf, e = w.broke ? R.a - w.xp : R.a + 4; R.x = -R.a; R.z = w.zc - R.d;
    const gr = seaGrad(R.x, R.z), gA = -gr.gx, gD = -gr.gz, steep = clamp(-gD, 0, 2.6);
    R.rideT = (R.rideT || 0) + dt; R.floatT = Math.max(0, (R.floatT || 0) - dt);
    if (R.mode === 'pop') { R.popT += dt; if (R.popT >= 0.35) { R.mode = 'ride'; if (R.late) award(R, 'LATE DROP', 150); else award(R, 'DROP', 50); } }
    // AUTO-SURF (Ben): S-turns through the middle of the face; the moves push the line high or low; the pocket is held by trimming speed
    const th0 = R.th; let tgN = 0.5 + 0.16 * Math.sin(R.rideT * 2.3);
    if (R.goal) { R.goal.t -= dt; tgN = R.goal.n; if (R.goal.t <= 0) { const g = R.goal; R.goal = null; if (g.then) g.then(); } }
    if (R.airReq > 0) { tgN = 0; R.airReq -= dt; if (R.d < 0.14 * wf && R.mode === 'ride') { R.airReq = 0; return launch(R, 5 + R.s * 0.42); } }
    if (R.cut) { R.cut.t += dt; const u = R.cut.t / 0.9; R.th = R.cut.th0 + 2.6 * Math.sin(Math.PI * Math.min(1, u)); if (u >= 1) { R.cut = null; if (e < 5) award(R, 'ROUNDHOUSE', 60); } }
    else if (R.snapT > 0) { R.snapT -= dt; R.th += clamp(wrapA(R.snapTo - R.th), -9 * dt, 9 * dt); }
    else if (R.mode === 'ride') { const tg = clamp(0.35 + (tgN - R.d / wf) * 2.6, -0.95, 1.1); R.th += clamp(wrapA(tg - R.th), -T.TURN * dt, T.TURN * dt); }
    R.th = wrapA(R.th); const turn = wrapA(R.th - th0) / Math.max(dt, 1e-3);
    const sn = Math.sin(R.th), cs = Math.cos(R.th), downhill = -(gA * cs + gD * sn);
    R.s += (T.G * downhill * 0.85 + T.PUSH * steep - T.DRAG * R.s * R.s - (steep < 0.75 ? T.FLAT * (1 - steep / 0.75) * R.s : 0) - (R.hang > 0.5 ? 1 : 0)) * dt;
    if (w.broke) { if (e > 8) R.s -= (e - 8) * 0.9 * dt; if (e < 3) R.s += (3 - e) * 1.6 * dt; }
    if (R.stallT > 0) { R.stallT -= dt; R.s -= 7 * dt; if (Math.random() < 0.7) spray(V3(R.x, R.y + 0.4, R.z), 1, 2.5, 0.9, 0.5); if (R.stallT <= 0 && !R.inTube) award(R, 'TUBE STALL', 50); }
    R.s = clamp(R.s, 1.5, 24);
    R.a += R.s * cs * dt; R.d += (R.s * sn - T.VW) * dt; R.x = -R.a; R.z = w.zc - R.d; R.y = seaH(R.x, R.z);
    R.wob = Math.max(0, (R.wob || 0) - dt * 1.5); R.lean = damp(R.lean, clamp(-turn * 0.16, -0.7, 0.7) + R.wob * Math.sin(TT * 30) * 0.5, 8, dt); R.crouch = damp(R.crouch, R.inTube || R.stallT > 0 ? 1 : R.cut || R.snapT > 0 ? 0.8 : 0.25, 6, dt);
    R.cd = Math.max(0, R.cd - dt);
    if (R.hangT > 0) { R.hangT -= dt; R.pts += dt * 60 * mult(R) * (R.inTube ? 2 : 1); if (R.hangT <= 0) award(R, R.inTube ? R.hangK + ' IN THE TUBE' : R.hangK, R.hangK === 'CHEATER FIVE' ? 55 : 40); } R.hang = damp(R.hang, R.hangT > 0 ? 1 : 0, 4, dt);
    if (R.mode === 'ride' && steep > 0.5) R.pts += dt * 6 * mult(R) * (R.s / 12) * (R.s / 12);
    if (Math.abs(turn) > 1.2 && R.s > 8 && Math.random() < 0.8) spray(V3(R.x, R.y + 0.3, R.z), 2, 3 + R.s * 0.15, 1.1, 0.7, V3(Math.sin(R.th) * Math.sign(turn), 0.4, -Math.cos(R.th) * Math.sign(turn)));
    else if (R.s > 9 && Math.random() < 0.3) spray(V3(R.x, R.y + 0.15, R.z), 1, 1.5, 0.7, 0.5);
    // the TUBE: low on the face under the pitching lip (wide window: Ben asked for easier)
    const kk = clamp(1 - e / T.TL, 0, 1), tubeOK = w.broke && e > 0.3 && e < T.TL * 0.78 && R.d > 0.14 * wf && R.d < 1.0 * wf && R.mode === 'ride';
    if (tubeOK) { if (!R.inTube) { R.inTube = true; R.tube = 0; say('IN THE TUBE', 1.2); } R.tube += dt; R.pts += dt * 45 * (1 + kk); G.E = Math.min(1, G.E + dt * 0.25); }
    else if (R.inTube) { R.inTube = false; if (e >= T.TL * 0.78 || R.d <= 0.14 * wf) { award(R, 'TUBE ' + R.tube.toFixed(1) + ' S', 120 + 150 * R.tube, { col: '#7dd3fc' }); G.stats.tubes++; G.stats.longTube = Math.max(G.stats.longTube, R.tube); spray(V3(R.x - 2, R.y + 1, R.z + 1), 14, 6, 2, 0.9, V3(-1, 0.3, 0)); } }
    if (R.mode === 'ride') {
      if (w.broke && e < -2.2) return startWipe(R, R.inTube ? 'CLOSED OUT IN THE TUBE' : 'CAUGHT BY THE WHITEWATER');
      if (w.broke && e >= 0 && e < 5 && R.d < 0.07 * wf && !R.floatT) return startWipe(R, 'OVER THE FALLS');
      if (R.d < -1.6) return endRide(R, 'KICK OUT');
      if (w.broke && e > 75) return endRide(R, 'OUTRAN THE WAVE');
      if (w.zc < T.Z_SHORE + 8) return endRide(R, 'RODE IT TO THE SAND'); }
  }
  function launch(R, vy) { R.mode = 'air'; R.vy = vy; R.airT = 0; R.vd = Math.max(R.s * Math.sin(R.th) - T.VW, -6); R.combo = []; R.trick = null; R.hang = 0; R.hangT = 0; R.inTube = false; R.goal = null; R.stallT = 0; spray(V3(R.x, R.y, R.z), 10, 4 + vy * 0.3, 1.4, 0.9); audio.burst(0.3, 1600, 0.08); }
  const TRICKS = { '360': [0.55, 180], 'RODEO FLIP': [0.8, 320], 'SUPERMAN': [0.62, 220], 'AIR REVERSE': [0.7, 260], 'KICKFLIP': [0.5, 200], 'BARREL ROLL': [0.62, 240], 'GRAB': [0.45, 120] };
  function airStep(R, dt) { const w = R.w; R.airT += dt; R.vy -= 19 * dt; R.y += R.vy * dt; R.a += R.s * Math.cos(R.th) * 0.85 * dt; R.vd = damp(R.vd, 2.2, 4, dt); R.d += R.vd * dt; R.s *= 1 - 0.05 * dt; R.x = -R.a; R.z = w.zc - R.d;
    if (R.trick) { R.trick.t += dt; if (R.trick.t >= R.trick.dur) { R.combo.push(R.trick.k); R.trick = null; } }
    const sy0 = seaH(R.x, R.z); if (R.y <= sy0 && R.vy < 0) { R.y = sy0;
      if (R.trick && R.trick.t / R.trick.dur < 0.85) return startWipe(R, 'ATE IT ON THE LANDING');
      if (R.trick) R.combo.push(R.trick.k); R.trick = null;
      const base = Math.max(60, R.airT * 140) + R.combo.reduce((s2, k) => s2 + TRICKS[k][1], 0) * (1 + 0.5 * Math.max(0, R.combo.length - 1)), name = R.combo.length ? (R.combo[0] === 'BARREL ROLL' && R.combo.length === 1 ? 'BARREL ROLL' : 'AIR ' + R.combo.join(' + ')) : 'AIR ' + R.airT.toFixed(1) + ' S';
      G.stats.airs++; spray(V3(R.x, R.y, R.z), 16, 5, 1.6, 0.9); audio.burst(0.4, 900, 0.16);
      if (R.d < -1.2) { award(R, name, base * 0.7); return endRide(R, 'FLEW OUT THE BACK'); }
      award(R, name, base); R.mode = 'ride'; R.th = 0.9; R.s *= 0.92; } }
  // MOVES = stick direction + button (neutral = what fits where you are on the face)
  function carve(R) { if (R.cd > 0 || R.mode !== 'ride') return; R.cd = 0.32; colInfo(R.w, R.a, ci); const wf = ci.wf, e = R.w.broke ? R.a - R.w.xp : 20, dir = dirOf();
    const bottomNow = () => { R.snapTo = -0.9; R.snapT = 0.25; R.s += 1.6; award(R, 'BOTTOM TURN', 70); spray(V3(R.x, R.y + 0.3, R.z), 10, 5, 1.4, 0.8); R.goal = { n: 0.35, t: 0.6 }; };
    const snapNow = () => { const lip = R.d < 0.2 * wf; R.snapTo = 1.0; R.snapT = 0.22; award(R, lip ? 'OFF THE LIP' : 'SNAP', lip ? 190 : 130); spray(V3(R.x, R.y + 0.8, R.z), lip ? 26 : 16, 7, 2, 1.1, V3(1, 0.8, 0.6)); R.goal = { n: 0.7, t: 0.5 }; };
    if (dir === 'l') { R.cut = { t: 0, th0: R.th }; R.s *= 0.93; award(R, 'CUTBACK', 160); spray(V3(R.x, R.y + 0.5, R.z), 18, 6, 1.8, 1, V3(0, 0.5, -1)); }
    else if (dir === 'd') { if (R.d > 0.7 * wf) bottomNow(); else R.goal = { n: 0.92, t: 0.45, then: bottomNow }; }
    else if (dir === 'u') { if (R.w.broke && e < 9) { R.floatT = 1.6; R.goal = { n: 0.03, t: 1.1, then: () => { award(R, 'FLOATER', 210); R.goal = { n: 0.75, t: 0.5 }; } }; say('FLOATER', 1); } else if (R.d < 0.3 * wf) snapNow(); else R.goal = { n: 0.18, t: 0.6, then: snapNow }; }
    else if (dir === 'r') { R.stallT = 1.3; say('TUBE STALL', 1); }
    else if (R.d > 0.55 * wf) bottomNow(); else if (R.d < 0.42 * wf) snapNow(); else { R.snapTo = R.th + (Math.sin(R.th) > 0 ? -0.6 : 0.6); R.snapT = 0.18; R.s += 0.8; award(R, 'CARVE', 40); spray(V3(R.x, R.y + 0.3, R.z), 8, 4, 1.2, 0.7); }
    audio.burst(0.25, 2400, 0.1); }
  function trick(R) { const dir = dirOf();
    if (R.mode === 'air') { if (R.trick) return; const k = { n: '360', u: 'RODEO FLIP', d: 'SUPERMAN', l: 'AIR REVERSE', r: 'KICKFLIP' }[dir]; R.trick = { k, t: 0, dur: TRICKS[k][0] }; audio.tone(660, 0.1, 0.04, 'triangle', 1.5); return; }
    if (R.mode !== 'ride') return; if (dir === 'l' || dir === 'r') { launch(R, 6.6); R.trick = { k: 'BARREL ROLL', t: 0, dur: TRICKS['BARREL ROLL'][0] }; return; }
    if (R.hangT > 0) { R.hangT = 0.01; return; } R.hangK = dir === 'd' ? 'CHEATER FIVE' : 'HANG TEN'; R.hangT = dir === 'd' ? 1.6 : 1.8; say(R.hangK, 1); }
  function jump(R) { if (R.mode !== 'ride') return; colInfo(R.w, R.a, ci); if (R.d < 0.35 * ci.wf && R.s * Math.sin(R.th) - T.VW < -1 && R.s > 7) launch(R, 5 + R.s * 0.42); else { R.airReq = 1.6; R.goal = null; say('GOING UP', 0.8); } }

  // ---------- WIPEOUTS: board one way, fox the other, the washing machine, pop up gasping ----------
  const QUIPS = ['THE SEA SAYS NO', 'WASHING MACHINE', 'SAND FACIAL', 'THE BOARD WENT TO THE BEACH WITHOUT YOU', 'TEN OUT OF TEN FOR EFFORT', 'NOBODY SAW THAT (EVERYBODY SAW THAT)'];
  function startWipe(R, why) { const w = R.w; R.mode = 'wipe'; R.inTube = false; R.trick = null; R.hangT = 0; R.hang = 0; R.fox.updateMatrixWorld(true); scene.attach(R.fox);
    const dx = -Math.cos(R.th), dz = -Math.sin(R.th); R.wipe = { t: 0, why, fv: V3(dx * R.s * 0.45, 6.5, dz * R.s * 0.45 - 2), spin: V3(rr(-9, 9), rr(-6, 6), rr(-9, 9)), bv: V3(dx * R.s * 0.3 + rr(-2, 2), 8, dz * R.s * 0.3), bspin: rr(6, 11), under: false };
    R.fox.userData.mood = 'surprised'; spray(V3(R.x, R.y + 0.5, R.z), 26, 6, 2, 1.2); audio.burst(0.8, 700, 0.25);
    if (!R.isJob) { G.stats.wipeouts++; say('WIPEOUT', 2.4); flash(why, '#ec3013'); ooh(); if (Math.random() < 0.6) radio(pick(['Everybody eats one. Shake it off.', 'That one had teeth. Sit further down the line next time.', 'Ooh. The judges felt that from the tower.'])); } }
  function wipeStep(R, dt) { const W2 = R.wipe; W2.t += dt; const f = R.fox, w = R.w;
    // fox: thrown, splashes down, gets tumbled shoreward under the foam, pops up
    if (!W2.under) { W2.fv.y -= 18 * dt; f.position.addScaledVector(W2.fv, dt); f.rotation.x += W2.spin.x * dt; f.rotation.y += W2.spin.y * dt; f.rotation.z += W2.spin.z * dt; const sy = seaH(f.position.x, f.position.z); if (f.position.y < sy - 0.2 && W2.fv.y < 0) { W2.under = true; W2.ut = 0; spray(f.position.clone().setY(sy), 22, 6, 2, 1.1); audio.burst(0.6, 600, 0.22); } }
    else { W2.ut += dt; const sy = seaH(f.position.x, f.position.z); f.position.z -= (W2.ut < 1.4 ? T.VW * 0.9 : 0.4) * dt;
      if (W2.ut < 1.4) { f.position.y = damp(f.position.y, sy - 1.2, 5, dt); f.rotation.x += 7 * dt; f.rotation.z += 4 * dt; if (Math.random() < 0.6) spray(V3(f.position.x + rr(-1, 1), sy + 0.1, f.position.z + rr(-1, 1)), 1, 1.5, 1, 0.6); }
      else { f.position.y = damp(f.position.y, sy - 1.1, 5, dt); f.rotation.x = damp(f.rotation.x % (Math.PI * 2), 0, 6, dt); f.rotation.z = damp(f.rotation.z % (Math.PI * 2), 0, 6, dt); f.rotation.y = damp(f.rotation.y, Math.PI, 3, dt); if (W2.ut > 1.45 && !W2.gasp) { W2.gasp = true; spray(V3(f.position.x, sy + 0.4, f.position.z), 8, 3, 1, 0.7); if (audio.ctx) audio.tone(520, 0.3, 0.05, 'square', 1.8); } } }
    kit.animFox(f, dt, 0, true);
    // board: cartwheels up on the leash, lands flat, floats
    const b = R.root; W2.bv.y -= 18 * dt; b.position.addScaledVector(W2.bv, dt); const sb = seaH(b.position.x, b.position.z); if (b.position.y < sb) { b.position.y = sb; W2.bv.set(W2.bv.x * 0.3, Math.abs(W2.bv.y) > 4 ? Math.abs(W2.bv.y) * 0.3 : 0, W2.bv.z * 0.3 - T.VW * 0.5); W2.bspin *= 0.5; } b.rotateX(W2.bspin * dt);
    R.blob.position.set(b.position.x, sb + 0.06, b.position.z);
    if (W2.t > 3.1) { if (R.counted === false) { R.counted = true; sitAt(R, -R.x, R.z); return; } endRide(R, W2.why); } }

  // ---------- JOB: a choreographed ride on the same wave (kinematic, not the demo autopilot) ----------
  const JOB_SEGS = [[0, 'drop'], [1.3, 'turns'], [3.0, 'tube'], [5.8, 'turns'], [7.4, 'air', '360'], [8.6, 'turns'], [10.2, 'snap'], [11.3, 'turns'], [12.4, 'cutback'], [13.4, 'turns'], [14.8, 'air', 'RODEO FLIP'], [16.2, 'turns'], [17.4, 'kick']];
  function jobRide(R, dt) { const w = R.w; R.jt += dt; let seg = JOB_SEGS[0]; for (const s of JOB_SEGS) if (R.jt >= s[0]) seg = s; const t = R.jt, ts = t - seg[0];
    if (seg !== R.jseg) { R.jseg = seg; if (seg[1] === 'air') { R.jAir = { t: 0, dur: 1.15, k: seg[2] }; } if (seg[1] === 'snap') award(R, 'OFF THE LIP', 190); if (seg[1] === 'cutback') award(R, 'CUTBACK', 160); if (seg[1] === 'turns' && R.jPrev === 'tube') award(R, 'TUBE ' + (3.0 - 0.2 + rr(-0.3, 0.3)).toFixed(1) + ' S', 900); R.jPrev = seg[1]; }
    let e = 5 + 2.5 * Math.sin(t * 0.8), dN = 0.5 + 0.3 * Math.sin(t * 2.1);
    if (seg[1] === 'drop') { e = 5.5 - ts * 0.6; dN = 0.12 + 0.72 * sstep(0, 1.3, ts); }
    else if (seg[1] === 'tube') { e = 2.4; dN = 0.6; } else if (seg[1] === 'air') { e = 5; dN = 0.2; } else if (seg[1] === 'snap') { dN = ts < 0.5 ? 0.12 : 0.65; } else if (seg[1] === 'cutback') { e = 11 - ts * 6; dN = 0.55; } else if (seg[1] === 'kick') { dN = -0.4 - ts * 2.2; e = 9; }
    R.je = damp(R.je ?? 5, e, 3, dt); R.jd = damp(R.jd ?? 0.2, dN, 3.5, dt); const a0 = R.a, d0 = R.d; colInfo(w, (w.broke ? w.xp : 0) + R.je, ci); R.a = (w.broke ? w.xp : 0) + R.je; R.d = R.jd * ci.wf; R.x = -R.a; R.z = w.zc - R.d;
    const va = (R.a - a0) / dt, vd = (R.d - d0) / dt + T.VW; if (dt > 0 && Math.hypot(va, vd) > 1) R.th = seg[1] === 'cutback' ? damp(R.th, ts < 0.5 ? 2.4 : 0.3, 5, dt) : damp(R.th, Math.atan2(vd, va), 6, dt); R.s = clamp(Math.hypot(va, vd), 6, 18);
    R.y = seaH(R.x, R.z); R.mode = 'ride'; R.inTube = seg[1] === 'tube'; R.crouch = damp(R.crouch, R.inTube ? 1 : 0.3, 6, dt); R.lean = damp(R.lean, Math.sin(t * 2.1) * 0.35, 6, dt);
    if (R.jAir) { const A = R.jAir; A.t += dt; const u = A.t / A.dur; R.y += 4 * 4.2 * u * (1 - u); R.mode = 'air'; R.trick = { k: A.k, t: u * A.dur, dur: A.dur * 0.9 }; if (u >= 1) { R.jAir = null; R.trick = null; award(R, 'AIR ' + A.k, 400); spray(V3(R.x, R.y, R.z), 14, 5, 1.6, 0.9); } }
    if (R.s > 8 && Math.random() < 0.4) spray(V3(R.x, R.y + 0.2, R.z), 1, 2, 0.8, 0.5);
    if (seg[1] === 'kick' && ts > 1.1 || w.zc < T.Z_SHORE + 8) endRide(R, 'KICK OUT'); }

  // ---------- FINAL: JOB DROPS IN BEHIND YOU ON THE SAME WAVE, PRESSURES, CAN STEAL IT; BUMPS = BOTH WOBBLE ----------
  function jobDropIn(w) { const J = job; reattach(J); J.w = w; J.mode = 'ride'; J.gap = 7; J.jt = 0; J.jd = 0.3; J.pts = 0; J.moves = {}; J.stole = false; J.bumpCd = 0; J.wob = 0; J.warned = false; J.trick = null; J.a = ben.a - 7; J.d = ben.d; J.x = -J.a; J.z = w.zc - J.d; flash('JOB DROPS IN BEHIND YOU', '#7dd3fc'); }
  function jobShadow(dt) { const J = job, B = ben, w = J.w; if (!w || J.mode !== 'ride') return; J.jt += dt;
    const vp = w.broke ? T.VP * Math.min(1, 0.35 + w.peelT / 2.5) * (1 + 0.18 * Math.sin(w.peelT * 0.9 + w.seed)) : 0, riding = B.mode === 'ride' || B.mode === 'air' || B.mode === 'pop', bAlong = riding ? B.s * Math.cos(B.th) * (B.mode === 'air' ? 0.85 : 1) : 0;
    if (riding) { J.gap += (bAlong - (vp + T.JOB_PUSH + 0.25 * G.ben.length)) * 0.55 * dt; J.gap = Math.min(J.gap, 14); J.a = B.a - J.gap; } else J.a += (vp + 1) * dt;
    if (w.broke) J.a = Math.max(J.a, w.xp + 1); J.jd = damp(J.jd, 0.5 + 0.22 * Math.sin(J.jt * 2.6 + 1), 3, dt); colInfo(w, J.a, ci); J.d = J.jd * ci.wf; J.x = -J.a; J.z = w.zc - J.d; J.y = seaH(J.x, J.z);
    J.th = damp(J.th, 0.3 + 0.55 * Math.cos(J.jt * 2.6 + 1), 5, dt); J.s = 12; J.wob = Math.max(0, J.wob - dt * 1.5); J.lean = damp(J.lean, Math.sin(J.jt * 2.6) * 0.3 + J.wob * Math.sin(TT * 30) * 0.5, 8, dt); J.crouch = damp(J.crouch, 0.35, 5, dt);
    if (Math.random() < 0.35) spray(V3(J.x, J.y + 0.2, J.z), 1, 2, 0.8, 0.5);
    if (!riding) return; J.bumpCd = Math.max(0, J.bumpCd - dt);
    if (Math.hypot(J.x - B.x, J.z - B.z) < 2.3 && J.bumpCd <= 0 && B.mode === 'ride') { J.bumpCd = 1.6; J.wob = 1; B.wob = 1; B.s *= 0.85; J.gap += 1.4; flash('BUMP!', '#ffffff'); audio.burst(0.3, 500, 0.2); cheer(0.25); }
    if (J.gap < 3 && !J.warned) { J.warned = true; radio('Job is right on your tail. Every move buys you room.', 'JOSS', 4); }
    if (J.gap < -1.5 && !J.stole && B.mode === 'ride') { J.stole = true; flash('JOB STOLE THE WAVE', '#7dd3fc'); radio('Too slow. My wave now.', 'JOB', 4); endRide(B, 'JOB STOLE THE WAVE'); } }
  // ---------- RIDE END → JUDGES ----------
  function mkCards(who, list, ws, why, pts) { const scores = [0, 1, 2, 3, 4].map(() => clamp(Math.round((ws + rr(-0.45, 0.45)) * 10) / 10, 0, 10)), srt = scores.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]), total = Math.round((srt[1][0] + srt[2][0] + srt[3][0]) / 3 * 100) / 100; list.push(total); return { who, n: list.length, scores, lo: srt[0][1], hi: srt[4][1], total, t: 0, why, pts }; }
  function endRide(R, why) { const w = R.w; if (w) w.rider = null; if (R.mode === 'done') return; R.mode = 'done'; R.endWhy = why; G.phase = 'cards'; hideTokens(); hideSprees(); G.cardQ = [];
    if (!R.isJob && G.round === 'final' && job.w) { const J = job, jws = clamp((G.jobPlan.shift() ?? 6) + (J.stole ? 1.0 : 0) + rr(-0.3, 0.3), 0, 9.9); J.mode = 'done'; if (J.w) J.w.rider = null; J.w = null; G.cardQ.push(mkCards('JOB', G.job, jws, J.stole ? 'STOLE THE WAVE' : 'KICK OUT', 0)); }
    let ws; if (R.isJob) ws = clamp((G.jobPlan.shift() ?? 7) + rr(-0.3, 0.3), 0, 9.9);
    else { ws = 10 * (1 - Math.exp(-R.pts / T.SCORE_K)); if (R.wipe) ws *= 0.72; else ws += 0.3; ws = clamp(ws, 0.3, 9.95); }
    if (!R.isJob && !R.wipe) { flash(why, '#ffffff'); cheer(0.4); }
    if (why === 'JOB STOLE THE WAVE') ws *= 0.85;
    const who = R.isJob ? 'job' : 'ben', list = G.round === 'free' ? G.free : G[who];
    G.cards = mkCards(R.isJob ? 'JOB' : 'BEN', list, ws, why, Math.round(R.pts)); G.cardsUp = true; G.cardsT = 0;
    cheer(clamp((G.cards.total - 3) / 8, 0.1, 1)); }
  function nextTurn() { G.cards = null; G.cardsUp = false; cardMs.forEach(c => c.visible = false);
    if (G.round === 'free') { if (G.free.length >= 3) { const b2 = best2(G.free); if (b2 >= SURF.target) { G.round = 'final'; G.turn = 'ben'; G.jobPlan = [...T.JOB].sort(() => Math.random() - 0.5); say('FINAL VS JOB', 3.4); radio('Final. JOB drops in behind you on every wave. Keep moving: if he gets past you, he steals it.', 'JOSS', 8); placeLineup(); G.phase = 'lineup'; return; } return finish(); } }
    else { if (G.ben.length >= 3) return finish(); G.turn = 'ben'; if (G.ben.length === 1) radio('Four. Nobody counts the first one because I was fourteen and the judges were embarrassed.', 'JOB', 6); }
    placeLineup(); G.phase = 'lineup'; }
  function finish() { const fin = G.round === 'final', b2 = best2(fin ? G.ben : G.free), j2 = best2(G.job), win = fin && b2 > j2;
    const pts = Math.round((fin ? best2(G.free) + b2 : b2) * 100); let nb = false; try { nb = save.best(SURF.bestKey, pts); if (win) save.setFlag('surfWon'); } catch (e) {}
    const grade = win ? (b2 >= 16.5 ? 'S' : 'A') : fin ? 'B' : b2 >= SURF.target - 2 ? 'C' : 'D';
    G.done = { fin, win, free: [...G.free], freeB2: best2(G.free), ben: [...G.ben], job: [...G.job], benB2: b2, jobB2: j2, grade, total: pts, newBest: nb, best: save.stat ? save.stat(SURF.bestKey, pts) : pts, stats: { ...G.stats } };
    G.phase = 'done'; if (win) { cheer(1); radio('That is JEST\'S heat, won by a fox who is not Jest. Nobody down here is going to complain.', 'JOSS', 9); } else if (fin) radio('Job keeps the break for another year. The sheet says you rode, though.', 'JOSS', 9); else radio('Not this time. The sheet wants two good ones.', 'JOSS', 9); }

  // ---------- CAMERA ----------
  const VIEWS = ['BEACH', 'LOW', 'BEHIND'];
  const cam = { vi: 0, pos: V3(40, 18, -40), look: V3(0, 2, 60), cut: true, yawOff: 0, pitchOff: 0, drag: false, zoom: 1, close: false, tp: V3(), tl: V3() };
  function camStep(dt) { const port = CHh() > CW() * 1.05, Z = cam.zoom * (port ? 1.45 : 1), tp = cam.tp, tl = cam.tl, subj = G.turn === 'ben' || G.phase === 'ready' ? ben : job;
    if (G.phase === 'ready') { const a = TT * 0.06; tp.set(-40 + Math.cos(a) * 70, 22, 30 + Math.sin(a) * 50); tl.set(-20, 2, 40); }
    else if (G.phase === 'cards' || G.phase === 'done') { tp.set(-62, 7.5, 16 + (port ? 14 : 0)); tl.set(-80, 7, -24); }
    else { const R = subj, rx = R.mode === 'wipe' ? R.fox.position.x : R.x, rz = R.mode === 'wipe' ? R.fox.position.z : R.z, ry = R.mode === 'wipe' ? Math.max(R.fox.position.y, 0) : R.y;
      const w = R.w || WV.find(q => q.zc > R.z - 2), amp = w ? w.amp : 3, near = R.mode === 'sit' && w ? sstep(34, 8, w.zc - R.z) : 1;
      if (R.mode === 'sit' && near < 1) { tp.set(rx - 2.5 * Z, ry + 2.2 * Z, rz - 7 * Z); tl.set(rx + 1, ry + 1.4, rz + 12); if (near > 0) { tp.lerp(V3(rx - 2 * Z, ry + (2.5 + amp * 0.35) * Z, rz - 15 * Z), near); tl.lerp(V3(rx + 0.5, ry + 1.2, rz + 1.5), near); } }
      else if (VIEWS[cam.vi] === 'LOW') { tp.set(rx - 5 * Z, Math.max(seaH(rx - 5, rz - 6.5) + 0.7, ry * 0.2 + 0.9), rz - 6.5 * Z); tl.set(rx + 0.5, ry + 1.6, rz + 1.5); }
      else if (VIEWS[cam.vi] === 'BEHIND') { tp.set(rx + 8 * Z, ry * 0.5 + 4.2 * Z, rz - 7.5 * Z); tl.set(rx - 6, ry + 1.2, rz + 1); }
      else { const dist = (cam.close ? 7 : R.inTube ? 8 : 13) * Z, lift = (R.inTube ? 1.0 : 1.3 + amp * 0.2) * (cam.close ? 0.7 : 1);
        tp.set(rx - (R.inTube ? 4 : 2), Math.max(1.4, (R.mode === 'air' ? ry * 0.6 + (w ? w.amp * 0.3 : 0) : ry * 0.35) + lift * Z), rz - dist); tl.set(rx + 0.5, ry + 1.6, rz + 2); } }
    if (cam.yawOff || cam.pitchOff) { const dx = tp.x - tl.x, dz = tp.z - tl.z, r = Math.hypot(dx, dz), a = Math.atan2(dx, dz) + cam.yawOff; tp.x = tl.x + Math.sin(a) * r; tp.z = tl.z + Math.cos(a) * r; tp.y += cam.pitchOff * r; }
    if (!cam.drag) { cam.yawOff = damp(cam.yawOff, 0, 3, dt); cam.pitchOff = damp(cam.pitchOff, 0, 3, dt); }
    if (cam.cut) { cam.pos.copy(tp); cam.look.copy(tl); cam.cut = false; } else { const k = G.phase === 'lineup' || G.phase === 'ride' ? 5 : 2.2; cam.pos.lerp(tp, Math.min(1, dt * k)); cam.look.lerp(tl, Math.min(1, dt * k * 1.4)); }
    cam.pos.y = Math.max(cam.pos.y, seaH(cam.pos.x, cam.pos.z) + (subj.mode === 'wipe' ? 4.5 : 0.8)); camera.position.copy(cam.pos); camera.lookAt(cam.look);
    camera.fov = damp(camera.fov, port ? 62 : 55, 4, dt); camera.updateProjectionMatrix();
    lipMat.opacity = subj.inTube ? 0.62 : 0.93;
    sun.position.set(cam.look.x + 20, 40, cam.look.z - 30); sun.target.position.copy(cam.look); sunGlow.position.set(cam.pos.x + 260, 220, cam.pos.z + 700); }

  // ---------- INPUT ----------
  const keys = new Set(), STK = { x: 0, y: 0 }; let PAUSE = false;
  const kx = () => (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0), ky = () => (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
  const onKD = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if (keys.has(e.code)) return; keys.add(e.code); if (e.code === 'Digit1' || e.code === 'KeyJ') press(1); if (e.code === 'Digit2' || e.code === 'KeyK') press(2); if (e.code === 'Space') { e.preventDefault(); press(3); } if (e.code === 'KeyR') api.reset(); };
  const onKU = e => keys.delete(e.code); addEventListener('keydown', onKD); addEventListener('keyup', onKU);
  function press(n) { audioOn(); if (G.board || G.phase === 'done' || PAUSE) return;
    const R = ben; if (G.turn !== 'ben') return;
    if (R.mode === 'sit') { if (n === 3) { R.p = Math.min(7, R.p + T.PADDLE); spray(V3(R.x + rr(-1, 1), R.y + 0.2, R.z), 3, 2, 0.8, 0.5); audio.burst(0.12, 1800, 0.05); } return; }
    if (n === 1) carve(R); else if (n === 2) trick(R); else if (n === 3) jump(R); }

  // ---------- MAIN STEP ----------
  function lineupStep(dt) { const me = G.turn === 'ben' ? ben : job;
    // waves come in sets: the next one rolls in after the last has passed (or after the ride + cards)
    const coming = WV.find(w => w.zc > me.z - 3 && !w.passedBy);
    if (!coming && WV.length < 2) { G.waveT -= dt; if (G.waveT <= 0) { spawnWave(rr(T.H[0], T.H[1]) * (G.round === 'final' ? 1.08 : 1)); G.waveT = 3; } }
    for (const R of [ben, job]) { if (R.mode !== 'sit') continue; const mine = R === me;
      const w = WV.find(q => q.zc > R.z - 3); let dz = 0;
      if (mine && !R.isJob) { const sx = STK.x + kx(), sy = STK.y + ky(); R.x -= sx * 2.4 * dt; R.z += sy * 2.4 * dt; R.x = clamp(R.x, -40, 30); R.z = clamp(R.z, 50, 92); }
      R.p = Math.max(0, R.p - 1.1 * dt); R.z -= R.p * 0.15 * dt;
      const face = w && w.zc - R.z < 34 ? Math.PI / 2 : -Math.PI / 2; R.th += clamp(wrapA(face - R.th), -2 * dt, 2 * dt);
      R.y = seaH(R.x, R.z);
      if (w && mine) { colInfo(w, -R.x, ci); const d = w.zc - R.z, e = w.broke ? -R.x - w.xp : 99;
        if (!R.isJob) { G.prompt = d < ci.wf + 11 && d > -1 ? { txt: 'PADDLE · TAP 3', p: Math.min(1, R.p / T.NEED) } : null;
          if (d <= ci.wf * 0.95 && d >= 0.1 * ci.wf && w.amp > 2) { if (w.broke && e < -3) { R.counted = false; R.w = w; R.a = -R.x; R.d = d; R.s = 3; R.th = 1.2; w.passedBy = true; G.prompt = null; startWipe(R, 'CAUGHT INSIDE'); radio('You sat on the wrong side of the red buoy. The yellow ring is down the line from it.'); flash('CAUGHT INSIDE · NOT COUNTED', '#ec3013'); continue; }
            if (R.p >= T.NEED) { G.prompt = null; catchWave(R, w); G.phase = 'ride'; continue; } }
          if (d < -0.6 && !w.passedBy) { w.passedBy = true; G.prompt = null; G.misses++; flash('MISSED IT', '#ffffff'); radio(G.misses >= 2 ? 'Tap 3 fast as soon as it lifts the tail. Four or five strokes.' : 'Too slow. Paddle harder when it lifts you.'); G.waveT = 2; } }
        else if (d <= 0.45 * ci.wf && d > 0) { R.p = 5; catchWave(R, w); R.jt = 0; R.jseg = null; R.je = 5; R.jd = 0.12; G.phase = 'ride'; continue; } }
      else if (w && w.zc - R.z < -0.6) w.passedBy = true; } }
  function sitPose(R) { if (R.mode !== 'sit') return; const gr = seaGrad(R.x, R.z); placeRig(R, R.x, R.y, R.z, R.th, -gr.gx, 1, -gr.gz, 0, 0, 0); }
  function riderVisual(R) { if (R.mode === 'sit' || R.mode === 'done' && !R.w) return sitPose(R); if (R.mode === 'wipe') return; if (R.mode === 'done') return sitPose(R);
    let nx = 0, ny = 1, nz = 0; if (R.mode !== 'air') { const gr = seaGrad(R.x, R.z); nx = -gr.gx; nz = -gr.gz; }
    const tr = R.trick, u = tr ? clamp(tr.t / tr.dur, 0, 1) : 0, spin = tr && tr.k === '360' ? u * Math.PI * 2 : tr && tr.k === 'AIR REVERSE' ? -u * Math.PI * 2 : 0, roll = tr && tr.k === 'BARREL ROLL' ? u * Math.PI * 2 : 0, flip = tr && tr.k === 'RODEO FLIP' ? u * Math.PI * 2 : 0;
    placeRig(R, R.x, R.y, R.z, R.th, nx, ny, nz, R.lean * 0.5 + roll, spin, flip); }
  let last = performance.now(), raf = 0, hudT = 0, miniC = null, miniT = 0;
  function step(dt) { TT += dt;
    for (const w of [...WV]) waveStep(w, dt);
    if (G.phase === 'lineup') lineupStep(dt); else if (G.phase === 'ready' && WV.length === 0) spawnWave(rr(T.H[0], T.H[1]));
    if (G.phase === 'ride') { const R = G.turn === 'ben' ? ben : job, sx = STK.x + kx(), sy = STK.y + ky();
      if (R === ben && (R.mode === 'ride' || R.mode === 'air' || R.mode === 'pop')) { tokStep(R, dt); spreeStep(R, dt); } if (G.round === 'final' && job.w) jobShadow(dt);
      if (R.isJob) { if (G.skip) { G.skip = false; endRide(R, 'SKIPPED'); } else if (R.mode !== 'done') jobRide(R, dt); }
      else if (R.mode === 'ride' || R.mode === 'pop') rideStep(R, dt, sx, sy); else if (R.mode === 'air') airStep(R, dt, sx, sy); else if (R.mode === 'wipe') wipeStep(R, dt);
      const other = R === ben ? job : ben; if (other.mode === 'sit') { other.y = seaH(other.x, other.z); } }
    else if (G.phase === 'lineup') { if (ben.mode === 'wipe') wipeStep(ben, dt); }
    if (G.phase === 'cards') { G.cardsT += dt; const c = G.cards; if (c) { c.t = G.cardsT; cardMs.forEach((m, i) => { m.visible = G.cardsT > 0.4 + i * 0.32; m.position.y = 7.9 + (m.visible ? 0.5 : 0); }); } if (G.cardsT > 4.4) { if (G.cardQ && G.cardQ.length) { G.cards = G.cardQ.shift(); G.cardsT = 0; cheer(0.3); } else nextTurn(); } for (const R of [ben, job]) if (R.mode === 'done' || R.mode === 'sit') { R.y = seaH(R.x, R.z); } }
    for (const R of [ben, job]) { if (R.mode === 'sit') R.y = seaH(R.x, R.z); riderVisual(R); pose(R, dt); }
    kit.animFox(joss, dt, 0, false);
    peakBuoy.position.set(0, seaH(0, T.Z_BREAK + 3), T.Z_BREAK + 3);
    { const near = WV.find(q => !q.broke && q.zc - T.Z_BREAK < 26), brk = WV.find(q => q.broke && q.peelT < 2.5), blink = Math.sin(TT * 10) > 0; peakSign.position.set(0, peakBuoy.position.y + 3.6, T.Z_BREAK + 3); peakSign.material.map = brk ? SIGN.breaking : SIGN.peak; peakSign.material.opacity = near && !blink ? 0.35 : 1; peakSign.visible = G.phase !== 'cards';
      const lu = G.phase === 'lineup' && G.turn === 'ben' && ben.mode === 'sit', pr = lu && G.prompt; takeBuoy.visible = takeSign.visible = lu || G.phase === 'ready'; takeBuoy.position.set(T.SPOT[0] - 2.6, seaH(T.SPOT[0] - 2.6, T.SPOT[1]), T.SPOT[1]); takeBuoy.rotation.z = Math.sin(TT * 1.7) * 0.12; takeSign.position.set(T.SPOT[0] - 2.6, takeBuoy.position.y + 3.2, T.SPOT[1]);
      const wn = Math.min(2, (G.round === 'final' ? G.ben : G.free).length); takeSign.material.map = pr ? (Math.sin(TT * 12) > 0 ? SIGN.paddle : SIGN.take) : (Math.floor(TT / 1.6) % 2 ? SIGN.waves[wn] : SIGN.take); } ring.visible = G.turn === 'ben' && (G.phase === 'lineup' || G.phase === 'ready'); ring.position.set(T.SPOT[0], seaH(T.SPOT[0], T.SPOT[1]) + 0.04, T.SPOT[1]); { const pu = 0.5 + 0.5 * Math.sin(TT * 3.2); ring.scale.setScalar(1 + 0.12 * pu); ring.material.opacity = 0.6 + 0.4 * pu; ring.material.color.setRGB(1, 0.82 + 0.18 * pu, 0.23 + 0.55 * pu); }
    { const p = seaGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, chop(p.getX(i), p.getZ(i), TT) - 0.08); p.needsUpdate = true; }
    fxStep(dt); G.E = Math.max(0, G.E - dt * 0.3); G.ooh = Math.max(0, G.ooh - dt); crowdStep(TT, G.E);
    if (crowdG) crowdG.gain.setTargetAtTime(0.02 + G.E * 0.22 + G.ooh * 0.05, audio.ctx.currentTime, 0.15);
    if (audio.water) { const w = WV.find(q => q.broke); audio.water.gain.setTargetAtTime(w ? 0.05 + Math.min(0.12, w.amp * 0.015) : 0.02, audio.ctx.currentTime, 0.4); }
    scene.children.forEach(o => { if (o.userData.flag) o.rotation.y = Math.sin(TT * 3 + o.position.x) * 0.3; }); spinners.forEach(h => h.rotation.z += dt * 0.8);
    G.bannerT = Math.max(0, G.bannerT - dt); if (G.bannerT <= 0) G.banner = ''; G.radioT = Math.max(0, G.radioT - dt); if (G.radioT <= 0) G.radio = ''; G.flashT = Math.max(0, (G.flashT || 0) - dt); if (G.flashT <= 0) G.flash = null;
    camStep(dt); }
  function frame(now) { raf = requestAnimationFrame(frame); const rdt = Math.min(0.05, (now - last) / 1000); last = now; if (!PAUSE) step(rdt); renderer.render(scene, camera); hudT -= rdt; if (hudT <= 0) { hudT = 0.1; emit(); } miniT -= rdt; if (miniT <= 0 && miniC) { miniT = 0.25; drawMini(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);

  // ---------- HUD ----------
  const _pv = V3();
  function hud() { const R = ben, w = R.w, fin = G.round === 'final', list = fin ? G.ben : G.free, e = w && w.broke ? R.a - w.xp : 99;
    let goal = null; if (G.phase === 'lineup' && G.turn === 'ben' && R.mode === 'sit') { const dd = Math.hypot(R.x - T.SPOT[0], R.z - T.SPOT[1]); if (dd > 6) { _pv.set(T.SPOT[0], 0.5, T.SPOT[1]).project(camera); goal = { nx: _pv.x, ny: _pv.y, behind: _pv.z > 1, label: 'TAKE-OFF RING', dist: Math.round(dd) }; } }
    return { state: G.phase === 'ready' ? 'ready' : 'run', phase: G.phase, board: G.board, done: G.done, banner: G.banner, radio: G.radio, radioWho: G.radioWho, flash: G.flash, prompt: G.phase === 'lineup' && G.turn === 'ben' ? G.prompt : null, cards: G.cards,
      round: G.round, turn: G.turn, waveN: Math.min(3, list.length + (G.phase === 'ride' && G.turn === 'ben' ? 1 : 0)), list: [...list], best2: best2(list), target: SURF.target, job: [...G.job], jobB2: best2(G.job),
      ridePts: G.turn === 'ben' && (R.mode === 'ride' || R.mode === 'air' || R.mode === 'pop' || R.mode === 'wipe') ? Math.round(R.pts) : null, pocket: G.turn === 'ben' && R.mode === 'ride' ? Math.round(8 * Math.exp(-Math.max(0, e) / 9)) : 0,
      view: VIEWS[cam.vi], tok: R.tok || 0, coins: R.coins || 0, pw: R.pw ? Object.keys(R.pw).filter(k => R.pw[k] > 0)[0] || null : null, tokOn: G.turn === 'ben' && (R.mode === 'ride' || R.mode === 'air' || R.mode === 'pop'), jobGap: G.round === 'final' && job.w && job.mode === 'ride' ? Math.round(job.gap) : null, speed: Math.round(R.s * 3.6), inTube: R.inTube, watching: G.turn === 'job' && G.phase === 'ride', goal, hurt: 0, hp: 100,
      quest: G.round === 'free' ? 'Free surf · best two waves ≥ ' + SURF.target.toFixed(1) + ' to make the final' : 'Final vs JOB · best two waves wins the heat' }; }
  function emit() { onState({ course: hud() }); }
  function drawMini() { const c = miniC; if (!c.isConnected) { miniC = null; return; } const dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr); if (!w || !h) return; if (c.width !== w) c.width = w; if (c.height !== h) c.height = h;
    const x = c.getContext('2d'), k = Math.min(w, h) / 260, X = wx => w / 2 + (-(wx + 50)) * k * -1, Y = wz => h * 0.62 - wz * k; x.fillStyle = '#0c6a93'; x.fillRect(0, 0, w, h); x.fillStyle = '#ead7a4'; x.beginPath(); x.ellipse(X(-60), Y(-100), 157 * k, 82 * k, 0, 0, 7); x.fill();
    x.fillStyle = '#f3f2f2'; x.fillRect(X(BL.x0), Y(BL.z0), (BL.x1 - BL.x0) * k, BL.tiers * BL.step * k); for (const wv of WV) { x.strokeStyle = wv.broke ? '#ffffff' : '#7dd3fc'; x.lineWidth = 3 * dpr; x.beginPath(); x.moveTo(X(60), Y(wv.zc)); x.lineTo(X(-130), Y(wv.zc)); x.stroke(); if (wv.broke) { x.fillStyle = '#ec3013'; x.fillRect(X(-wv.xp) - 3 * dpr, Y(wv.zc) - 3 * dpr, 6 * dpr, 6 * dpr); } }
    x.fillStyle = '#ffd23a'; x.beginPath(); x.arc(X(T.SPOT[0]), Y(T.SPOT[1]), 4 * dpr, 0, 7); x.fill(); x.fillStyle = '#7dd3fc'; x.beginPath(); x.arc(X(job.x), Y(job.z), 4 * dpr, 0, 7); x.fill(); x.fillStyle = '#ec3013'; x.beginPath(); x.arc(X(ben.x), Y(ben.z), 5 * dpr, 0, 7); x.fill(); }

  // ---------- HEAT SHEET (the board) ----------
  const coinP = { x: 0.46, y: 0.925 };
  function drawBoard(g, P = false) {
    const W0 = P ? 900 : 1600, H0 = P ? 1600 : 900, J = (n = 1.6) => (Math.random() - 0.5) * n * 2;
    g.fillStyle = '#7a4f2a'; g.fillRect(0, 0, W0, H0); g.strokeStyle = 'rgba(40,24,10,0.35)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { g.beginPath(); const y = Math.random() * H0; g.moveTo(0, y); g.bezierCurveTo(W0 * 0.3, y + J(8), W0 * 0.6, y + J(8), W0, y + J(6)); g.stroke(); }
    const x0 = 34, y0 = 34, w = W0 - 68, h = H0 - 98; g.fillStyle = '#1f2b27'; g.fillRect(x0, y0, w, h);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.beginPath(); g.ellipse(x0 + Math.random() * w, y0 + Math.random() * h, 60 + Math.random() * 200, 20 + Math.random() * 60, Math.random() * 3, 0, 7); g.fill(); }
    const CH = '#f2f1e8', YL = '#f5e08a', RD = '#ff9a8a', BLU = '#9fd8f5';
    const txt = (s, x, y, size, col = CH, wt = 800, fam = 'Archivo, sans-serif') => { g.font = `${wt} ${size}px ${fam}`; g.textBaseline = 'alphabetic'; g.fillStyle = col; g.globalAlpha = 0.92; g.fillText(s, x, y); g.globalAlpha = 0.28; g.fillText(s, x + 1.6, y - 1.2); g.globalAlpha = 1; };
    const HF = '"Caveat", "Segoe Print", "Bradley Hand", cursive', hw = (s, x, y, size, col = YL) => txt(String(s).toUpperCase(), x, y, size, col, 700, HF);
    const ln = (pts, col = CH, wd = 5, close) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = 0.9; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + J(), y + J()) : g.moveTo(x + J(), y + J())); if (close) g.closePath(); g.stroke(); g.globalAlpha = 1; };
    const circ = (x, y, r, col = CH, wd = 5) => { g.strokeStyle = col; g.lineWidth = wd; g.globalAlpha = 0.9; g.beginPath(); g.arc(x + J(), y + J(), r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; };
    const arrow = (x1, y1, x2, y2, col = YL) => { ln([[x1, y1], [(x1 + x2) / 2 + 12, (y1 + y2) / 2 - 10], [x2, y2]], col, 4); const a = Math.atan2(y2 - y1, x2 - x1); ln([[x2 - Math.cos(a - 0.5) * 22, y2 - Math.sin(a - 0.5) * 22], [x2, y2], [x2 - Math.cos(a + 0.5) * 22, y2 - Math.sin(a + 0.5) * 22]], col, 4); };
    const T1 = 'THE BREAK', T2 = 'JIDDA SURF CONTEST  ·  JOSS';
    { let ts = P ? 110 : 120; g.font = `900 ${ts}px Archivo, sans-serif`; const tw = g.measureText(T1).width, cap = W0 - 86 - 70; if (tw > cap) ts = Math.floor(ts * cap / tw); if (P) txt(T1, (W0 - g.measureText(T1).width) / 2, 160, ts, CH, 900); else txt(T1, 86, 160, ts, CH, 900); }
    if (P) { g.font = '800 32px Archivo, sans-serif'; const sw = g.measureText(T2).width; txt(T2, (W0 - sw) / 2, 214, 32, YL, 800); ln([[(W0 - sw - 40) / 2, 238], [(W0 + sw + 40) / 2, 234]], CH, 4); } else { txt(T2, 90, 214, 32, YL, 800); ln([[88, 238], [760, 234]], CH, 4); }
    g.save(); if (P) { g.translate(-610, 250); g.scale(0.94, 0.94); } else g.translate(0, 90);
    // the wave: face, curling lip, whitewater; the rider on the face; air off the lip
    ln([[840, 470], [1000, 462], [1120, 430], [1210, 360], [1262, 270], [1300, 200], [1350, 168], [1410, 176], [1452, 214], [1440, 262], [1404, 278], [1380, 252]], BLU, 6);
    ln([[1452, 214], [1490, 300], [1520, 400], [1540, 470]], BLU, 4); for (let k = 0; k < 7; k++) circ(1480 + (k % 3) * 22, 420 + Math.floor(k / 3) * 22, 9, CH, 3);
    ln([[1110, 400], [1190, 384]], CH, 6); circ(1160, 314, 18, CH, 5); ln([[1160, 332], [1150, 384]], CH, 5); ln([[1150, 350], [1120, 330]], CH, 4); ln([[1150, 350], [1186, 340]], CH, 4);
    hw('1  Carve', 860, 400, 36, RD); arrow(960, 410, 1100, 400, RD);
    hw('3  Jump', 1080, 180, 36, YL); arrow(1170, 190, 1260, 240);
    hw('2  Trick', 890, 250, 36, BLU); ln([[1040, 230], [1060, 200], [1090, 196], [1100, 226]], BLU, 4);
    hw('Stay near the curl!', 900, 540, 34, CH);
    g.restore();
    g.save(); if (P) { g.translate(-10, 470); g.scale(1.12, 1.12); }
    const rows = [['STICK', 'WASD', 'Aim the move: up · down · back · forward', CH], ['1', 'J', 'Carve: bottom turn · floater · cutback · stall', RD], ['2', 'K', 'Trick: rodeo · superman · reverse · kickflip', BLU], ['3', 'SPACE', 'Paddle in · go for air', YL], ['EYE', 'HOLD FOR 360 VIEW AND TAP FOR POV', 'Look around', CH]];
    rows.forEach(([k, kb, d, col], i) => { const y = 330 + i * 104, cx = 150, cy = y - 14;
      if (k === 'STICK') { circ(cx, cy, 31, CH, 4); g.globalAlpha = 0.5; g.fillStyle = CH; g.beginPath(); g.arc(cx + 6, cy - 9, 14, 0, 7); g.fill(); g.globalAlpha = 1; circ(cx + 6, cy - 9, 14, CH, 4); for (const [ax, ay, rot] of [[0, -44, 0], [0, 44, Math.PI], [-44, 0, -Math.PI / 2], [44, 0, Math.PI / 2]]) { const s = Math.sin(rot), c = Math.cos(rot), Q = (px, py) => [cx + ax + px * c - py * s, cy + ay + px * s + py * c]; ln([Q(-7, 5), Q(0, -3), Q(7, 5)], CH, 3); } }
      else if (k === 'EYE') { circ(cx, cy, 30, CH, 4); ln([[cx - 19, cy], [cx - 9, cy - 8], [cx, cy - 10], [cx + 9, cy - 8], [cx + 19, cy], [cx + 9, cy + 8], [cx, cy + 10], [cx - 9, cy + 8]], CH, 3, true); g.globalAlpha = 0.9; g.fillStyle = CH; g.beginPath(); g.arc(cx, cy, 4.5, 0, 7); g.fill(); g.globalAlpha = 1; }
      else { g.globalAlpha = 0.9; g.strokeStyle = col; g.lineWidth = 9; g.beginPath(); g.arc(cx, cy, 30, 0, 7); g.stroke(); g.globalAlpha = 1; circ(cx, cy, 22, CH, 2); g.font = '900 34px Archivo, sans-serif'; g.textAlign = 'center'; g.fillStyle = CH; g.fillText(k, cx, cy + 12); g.textAlign = 'left'; }
      txt(kb, 230, y - 24, 18, '#b9c4bf', 800); { let ds = 32; g.font = `700 ${ds}px Archivo, sans-serif`; const dw = g.measureText(d).width; if (dw > 590) ds = Math.floor(ds * 590 / dw); txt(d, 230, y + 4, ds, CH, 700); } });
    g.restore();
    { const s = 'Grab the 8 tokens · best two waves count · beat Job'; if (P) { const s1 = 'GRAB THE 8 TOKENS · BEST TWO COUNT', avail = 900 - 70 * 2; let sz = 46; g.font = `700 ${sz}px ${HF}`; let w1 = g.measureText(s1).width; if (w1 > avail) { sz = Math.floor(sz * avail / w1); g.font = `700 ${sz}px ${HF}`; w1 = g.measureText(s1).width; } hw(s1, (900 - w1) / 2, 1384, sz); g.font = `700 58px ${HF}`; const w2 = g.measureText('BEAT JOB').width, cw = 76, gap = 40, tot = w2 + gap + cw, x2 = (900 - tot) / 2; const mid = (1384 + 8 + 1536) / 2; hw('Beat Job', x2, mid + 20, 58); coinP.x = (x2 + w2 + gap + cw / 2) / 900; coinP.y = mid / 1600; } else { const cap = 960, right = 1440, by = 778; let sz = 50; g.font = `700 ${sz}px ${HF}`; let wd = g.measureText(s.toUpperCase()).width; if (wd > cap) { sz = Math.floor(sz * cap / wd); g.font = `700 ${sz}px ${HF}`; wd = g.measureText(s.toUpperCase()).width; } hw(s, right - wd, by, sz); } }
    g.fillStyle = '#5e3c1f'; g.fillRect(0, H0 - 64, W0, 64); g.fillStyle = '#7a4f2a'; g.fillRect(0, H0 - 64, W0, 10); for (let k = 0; k < 4; k++) { g.fillStyle = ['#f2f1e8', '#f5e08a', '#ff9a8a', '#9fd8f5'][k]; g.fillRect(260 + k * 120, H0 - 48, 70, 16); }
    for (let i = 0; i < 5000; i++) { g.fillStyle = 'rgba(31,43,39,0.55)'; g.fillRect(x0 + Math.random() * w, y0 + Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
  const boardCv = document.createElement('canvas'); boardCv.width = 1600; boardCv.height = 900; const boardCvP = document.createElement('canvas'); boardCvP.width = 900; boardCvP.height = 1600;
  const paintBoards = () => { drawBoard(boardCv.getContext('2d')); drawBoard(boardCvP.getContext('2d'), true); course.boardURL = boardCv.toDataURL('image/jpeg', 0.92); course.boardURLP = boardCvP.toDataURL('image/jpeg', 0.92); emit(); };
  try { if (!document.getElementById('font-caveat')) { const lk = document.createElement('link'); lk.id = 'font-caveat'; lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap'; document.head.appendChild(lk); } } catch (e) {}

  // ---------- API (Game HUD engine contract + the page's course hooks) ----------
  const course = { coinP, boardURL: '', boardURLP: '', hud, say,
    rollOut() { audioOn(); G.board = false; G.phase = 'lineup'; G.turn = 'ben'; G.round = 'free'; placeLineup(); radio('Sit on the yellow ring. When the swell lifts your tail, tap 3 and paddle.', 'JOSS', 8); emit(); },
    openBoard() { G.board = true; PAUSE = true; emit(); }, closeBoard() { G.board = false; PAUSE = false; emit(); }, skip() { G.skip = true; },
    _skipTo(k) { G.board = false; PAUSE = false; if (k === 'final') { G.free = [7.1, 6.2, 5.1]; G.round = 'final'; G.turn = 'ben'; G.ben = []; G.job = []; G.jobPlan = [...T.JOB]; } placeLineup(); G.phase = 'lineup'; },
    _catch() { G.board = false; PAUSE = false; G.turn = 'ben'; G.phase = 'lineup'; WV.slice().forEach(killWave); placeLineup(); const w = spawnWave(9.3); w.zc = T.SPOT[1] + 2.5; for (let i = 0; i < 3; i++) waveStep(w, 0.01); w.broke = true; w.xp = -2; ben.p = 5; catchWave(ben, w); G.phase = 'ride'; },
    _ride(sec = 2) { for (let i = 0; i < sec * 30; i++) step(1 / 30); }, _air() { if (ben.mode === 'ride') launch(ben, 11); }, _trick(k = '360') { ben.trick = { k, t: 0.25, dur: TRICKS[k][0] }; }, _wipe() { if (ben.w) startWipe(ben, 'OVER THE FALLS'); }, _cards() { if (ben.w) endRide(ben, 'KICK OUT'); }, _h: () => { const b = new THREE.Box3().setFromObject(ben.fox); return b.max.y - b.min.y; }, _press(n) { const p = PAUSE; PAUSE = false; press(n); PAUSE = p; }, _dbg: () => ({ phase: G.phase, ben: { mode: ben.mode, a: ben.a, d: ben.d, s: ben.s, th: ben.th, pts: ben.pts }, waves: WV.map(w => ({ zc: w.zc, xp: w.xp, amp: w.amp, broke: w.broke })) }) };
  const api = { course: () => course,
    start() { course.rollOut(); }, talk() {}, choose() {}, closeDialog() {}, nextLine() {}, clearToast() {}, closeWheel() {}, skipTime() {}, cycleWeather() {}, useItem() {}, setHudPad() {},
    toggleSound() { audio.setMuted(!audio.muted); return audio.muted; },
    melee() { press(1); }, range() { press(2); }, jump() { press(3); },
    setPaused(v) { PAUSE = !!v || G.board; }, setStick(x, y) { STK.x = x; STK.y = y; },
    eyeLook(dx, dy) { cam.drag = true; cam.yawOff -= dx * 0.006; cam.pitchOff = clamp(cam.pitchOff - dy * 0.004, -0.4, 0.9); }, eyeRelease() { cam.drag = false; }, togglePov() { cam.vi = (cam.vi + 1) % VIEWS.length; flash('VIEW · ' + VIEWS[cam.vi], '#ffffff'); return cam.vi !== 0; },
    lookBy(dx, dy) { api.eyeLook(dx, dy); }, zoomBy(k) { cam.zoom = clamp(cam.zoom * k, 0.6, 1.8); }, getCam() { return { dist: cam.zoom * 10, pitch: cam.pitchOff }; }, setCam(d, p) { if (d != null) cam.zoom = clamp(d / 10, 0.6, 1.8); if (p != null) cam.pitchOff = p; },
    mapData() { return { p: [ben.x, ben.z, Math.atan2(-Math.cos(ben.th), -Math.sin(ben.th))], indoor: false, b: [], f: [], e: [], q: null }; }, setMinimap(c) { miniC = c || null; },
    reset() { if (G.phase === 'lineup' && G.turn === 'ben' && ben.mode === 'sit') { sitAt(ben, -T.SPOT[0], T.SPOT[1]); cam.cut = true; flash('BACK ON THE RING', '#ffd23a'); } },
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); emit(); },
    destroy() { cancelAnimationFrame(raf); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('resize', onRs); ro.disconnect(); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  placeLineup(); G.phase = 'ready'; cam.cut = true;
  setTimeout(paintBoards, 30); setTimeout(paintBoards, 1400);
  raf = requestAnimationFrame(frame);
  return api;
}
