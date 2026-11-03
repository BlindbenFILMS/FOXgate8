// 8 GATES — JIDDA · INNER TUBE ("INTERTUBE") [new: jidda inner tube] — solo against the clock, host + heat sheet: JIB (surf shop).
// 3 STAGES, each with a BOSS: (1) OUT IN THE WAVES [jTubeWaves] → SHARK · (2) WHITE-WATER RIVER [jTubeRapids] → RAPIDS PIRATE · (3) LAZY RIVER [jTubeLazy] → WATER-GUN KING.
// Buttons (Game HUD vehicle="tube"): 1 RACKET (swat, bat back what is thrown) · 2 DASH · 3 DUCK (flip under; HOP at the lip of a drop) · 4 ITEM (patch kits refill AIR).
// The tube itself (model, pose, physics, air) is the shared engine/tube-kit.js; this file adds the courses, enemies, bosses and scoring.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, pick, clamp, damp, makeGradient, glowTexture, Ambience, smooth } from '../../village-game.js';
import { crestTex, canvasTex } from '../../meru-game.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../../fox-kit.js';
import { castKit } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { tubeKit, TUBE } from '../../engine/tube-kit.js';

export const TUBE_RUN = { name: 'INNER TUBE', room: 'jTubeRun', unlockKey: 'jidda.tube.unlocked', bestKey: n => 'jidda.tube.best.s' + n };
export const STAGES = [
  { n: 1, name: 'OUT IN THE WAVES', room: 'jTubeWaves', boss: 'SHARK', target: 120, line: 'Paddle out, duck the whitewater, beat the shark at the outer buoy, then ride the whitewater back to the sand.' },
  { n: 2, name: 'WHITE-WATER RIVER', room: 'jTubeRapids', boss: 'RAPIDS PIRATE', target: 110, line: 'Rapids, drops, rocks and eddies. Pirates on rafts and Corsairs on the banks throw darts: bat them back.' },
  { n: 3, name: 'LAZY RIVER', room: 'jTubeLazy', boss: 'WATER-GUN KING', target: 130, line: 'Slow and crowded. Kids with water guns, flamingos on the deck. The King waits in the wave pool.' }];
const sstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, k) => a + (b - a) * k;

export async function createTubeRun({ container, onState = () => {} }) {
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CHh = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.5 : 2)); renderer.setSize(CW(), CHh());
  renderer.shadowMap.enabled = !touch; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), SKY = new THREE.Color(0xbfe6f2); scene.background = SKY.clone(); scene.fog = new THREE.Fog(SKY, 160, 700);
  const camera = new THREE.PerspectiveCamera(58, CW() / CHh(), 0.1, 2400);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  let WORLD = null;
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = !touch; m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || WORLD || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp }), cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }), TK = tubeKit({ THREE, M, toon, kit });
  const audio = new Ambience();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x5f9fb4, 1.05));
  const sun = new THREE.DirectionalLight(0xfff2da, 2.0); sun.castShadow = !touch; if (!touch) { sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 80 }); sun.shadow.bias = -0.0005; } scene.add(sun, sun.target);
  const ink = toon('#201e1d'), white = toon('#f3f2f2'), red = toon('#ec3013'), wood = toon('#b58a5a'), yel = toon('#ffd23a');

  // ---------- FX ----------
  const SPN = touch ? 60 : 110, sprays = []; let spI = 0;
  for (let i = 0; i < SPN; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0 })); m.visible = false; scene.add(m); sprays.push({ m, v: V3(), life: 0, max: 1, s: 1 }); }
  function spray(p, n, spd, size = 1, life = 0.9, col = 0xffffff) { for (let k = 0; k < n; k++) { const s = sprays[spI = (spI + 1) % SPN]; s.m.position.copy(p); s.m.position.x += rr(-0.4, 0.4); s.m.position.z += rr(-0.4, 0.4); s.v.set(rr(-1, 1) * spd * 0.5, rr(0.5, 1.2) * spd, rr(-1, 1) * spd * 0.5); s.life = s.max = life * rr(0.7, 1.2); s.s = size * rr(0.7, 1.3); s.m.material.color.setHex(col); s.m.visible = true; } }
  function fxStep(dt) { for (const s of sprays) { if (s.life <= 0) continue; s.life -= dt; if (s.life <= 0) { s.m.visible = false; continue; } s.v.y -= 9 * dt; s.m.position.addScaledVector(s.v, dt); const u = 1 - s.life / s.max; s.m.material.opacity = 0.85 * (1 - u); s.m.scale.setScalar(s.s * (0.6 + u * 1.4)); } }
  const signTex = (txt, bg, fg) => canvasTex(256, 96, g => { g.fillStyle = bg; g.fillRect(0, 0, 256, 96); g.strokeStyle = '#201e1d'; g.lineWidth = 8; g.strokeRect(4, 4, 248, 88); g.fillStyle = fg; let fs = 52; g.font = '900 ' + fs + 'px Archivo, sans-serif'; const tw = g.measureText(txt).width; if (tw > 220) { fs = Math.floor(fs * 220 / tw); g.font = '900 ' + fs + 'px Archivo, sans-serif'; } g.textBaseline = 'middle'; g.fillText(txt, 18, 52); });
  const STX = {}; const stx = (t, bg = '#ffd23a', fg = '#201e1d') => STX[t + bg] || (STX[t + bg] = signTex(t, bg, fg));
  const bangTex = canvasTex(64, 64, g => { g.fillStyle = '#ec3013'; g.fillRect(4, 4, 56, 56); g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.strokeRect(6, 6, 52, 52); g.fillStyle = '#fff'; g.font = '900 46px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', 32, 35); });
  const mkBang = (parent, y) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bangTex, transparent: true, depthWrite: false, depthTest: false })); s.scale.set(0.9, 0.9, 1); s.position.y = y; s.visible = false; s.renderOrder = 5; parent.add(s); return s; };
  // blinking post signs: { sp, a, b, blink() }
  const signs = [];
  function postSign(x, y, z, a, b, blink, w = 3.4) { const pole = M(new THREE.CylinderGeometry(0.08, 0.08, 3, 6), ink, x, y + 1.5, z, null, 0); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: a, transparent: true, depthWrite: false })); sp.scale.set(w, w * 0.375, 1); sp.position.set(x, y + 3.6, z); WORLD.add(sp); signs.push({ sp, a, b, blink }); return sp; }

  // ---------- SHARED PICKUPS: the 8 TOKENS, coins, patch kits, power-ups ----------
  const tokTex = canvasTex(128, 128, g => { g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#a8792e'; g.stroke(); g.fillStyle = '#201e1d'; g.font = '900 78px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 64, 68); });
  const tokMat = new THREE.MeshToonMaterial({ map: tokTex, gradientMap: grad, emissive: new THREE.Color('#6a4500'), emissiveIntensity: 0.45 }), tokEdge = toon('#c8922e');
  const tokGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.18, 20), coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 14);
  const PW = { x2: ['2X', '#ec3013', 'DOUBLE POINTS · 8 S'], mag: ['M', '#ffd23a', 'MAGNET · COINS + TOKENS COME TO YOU'], pump: ['P', '#38bdf8', 'PUMP · AIR +30 · NO LEAKS FOR 6 S'] };
  const pwTex = k => canvasTex(128, 128, g => { g.fillStyle = PW[k][1]; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#ffffff'; g.stroke(); g.fillStyle = k === 'mag' ? '#201e1d' : '#ffffff'; g.font = '900 ' + (k === 'x2' ? 58 : 72) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(PW[k][0], 64, 68); });
  const PWT = { x2: pwTex('x2'), mag: pwTex('mag'), pump: pwTex('pump') };
  const patchTex = canvasTex(128, 128, g => { g.fillStyle = '#f3f2f2'; g.fillRect(8, 8, 112, 112); g.strokeStyle = '#201e1d'; g.lineWidth = 8; g.strokeRect(8, 8, 112, 112); g.fillStyle = '#ec3013'; g.fillRect(52, 24, 24, 80); g.fillRect(24, 52, 80, 24); });
  const items = [];
  function addItem(kind, x, y, z, k) { let g; if (kind === 'tok') { g = new THREE.Group(); const c = new THREE.Mesh(tokGeo, [tokEdge, tokMat, tokMat]); c.rotation.x = Math.PI / 2; addOutline(c, 0.05); g.add(c); }
    else if (kind === 'coin') { g = new THREE.Group(); const c = new THREE.Mesh(coinGeo, [tokEdge, tokMat, tokMat]); c.rotation.x = Math.PI / 2; g.add(c); }
    else { g = new THREE.Sprite(new THREE.SpriteMaterial({ map: kind === 'patch' ? patchTex : PWT[k], transparent: true, depthWrite: false })); g.scale.set(1.7, 1.7, 1); const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: kind === 'patch' ? '#ffffff' : PW[k][1], transparent: true, depthWrite: false, opacity: 0.55 })); halo.scale.set(1.9, 1.9, 1); g.add(halo); }
    g.position.set(x, y, z); WORLD.add(g); items.push({ kind, k, g, x, y, z, on: true, pull: 0 }); }

  // ---------- THE PLAYER (cast) IN THE TUBE ----------
  const ben = TK.make(cast.make('player', { gear: 'none' }), { color: '#ec3013' }); scene.add(ben.root);
  const jib = kit.makeFox({ key: 'jib', torso: ['#fff4e2', '#38bdf8', '#1e6f9a'], outfit: 'vest', look: { ...PLAYER_MALE, fur: '#e8b277', furDark: '#8a5a2b', tailMid: '#f3e2c4', tailTip: '#ffffff', armorAccent: '#38bdf8' }, mood: 'neutral' }); jib.scale.setScalar(1.3); scene.add(jib);

  // ---------- GAME STATE ----------
  const G = { phase: 'ready', board: true, stage: 1, ST: null, t: 0, pts: 0, tok: 0, coins: 0, swats: 0, batted: 0, hits: 0, count: 0, banner: '', bannerT: 0, radio: '', radioWho: 'JIB', radioT: 0, flash: null, flashT: 0, flashId: 0, done: null, boss: null, home: false, pw: {}, hint: 0, popT: 0 };
  const say = (s, t = 2.4) => { G.banner = s; G.bannerT = t; };
  const radio = (s, who = 'JIB', t = 6) => { G.radio = s; G.radioWho = who; G.radioT = t; };
  const flash = (txt, col = '#ffd23a') => { G.flash = { txt, col, id: ++G.flashId }; G.flashT = 1.6; };
  const award = (name, v, col) => { const x = G.pw.x2 > 0 ? 2 : 1; v = Math.round(v * x); G.pts += v; flash(name + '  +' + v, col); audio.tone(880 + Math.min(900, v), 0.12, 0.04, 'triangle', 1.4); return v; };
  const chest = () => V3(ben.x, ben.y + ben.h * 0.35, ben.z);

  // ---------- PATHS (rivers): centreline, level, half-width, flow ----------
  function makePath(ctrl, drops = [], step = 2) {
    const curve = new THREE.CatmullRomCurve3(ctrl.map(c => V3(c[0], 0, c[1])), false, 'centripetal'), L = curve.getLength(), n = Math.max(4, Math.round(L / step)), S = [], N = ctrl.length - 1;
    for (let i = 0; i <= n; i++) { const u = i / n, t = curve.getUtoTmapping(u), p = curve.getPoint(t), tg = curve.getTangent(t), q = t * N, k = Math.min(Math.floor(q), N - 1), fr = q - k, c0 = ctrl[k], c1 = ctrl[k + 1], s = u * L;
      let lv = lerp(c0[2], c1[2], fr); for (const d of drops) lv -= d.h * sstep(d.s, d.s + 3.2, s);
      S.push({ s, x: p.x, z: p.z, tx: tg.x, tz: tg.z, lv, w: lerp(c0[3], c1[3], sstep(0, 1, fr)), f: lerp(c0[4], c1[4], fr) }); }
    return { S, L, n, drops }; }
  function locate(PA, x, z, hint) { const S = PA.S; let bi = hint ?? 0, bd = 1e12; const a = hint == null ? 0 : Math.max(0, hint - 60), b = hint == null ? S.length - 1 : Math.min(S.length - 1, hint + 60);
    for (let i = a; i <= b; i++) { const d = (S[i].x - x) ** 2 + (S[i].z - z) ** 2; if (d < bd) { bd = d; bi = i; } }
    const p = S[bi], dx = x - p.x, dz = z - p.z, along = dx * p.tx + dz * p.tz; return { i: bi, p, s: p.s + along, off: dx * p.tz - dz * p.tx }; }
  const atS = (PA, s) => { const f = clamp(s / PA.L * PA.n, 0, PA.n), i = Math.floor(f), j = Math.min(PA.n, i + 1), a = PA.S[i], b = PA.S[j], k = f - i; return { x: lerp(a.x, b.x, k), z: lerp(a.z, b.z, k), lv: lerp(a.lv, b.lv, k), w: lerp(a.w, b.w, k), f: lerp(a.f, b.f, k), tx: a.tx, tz: a.tz }; };
  const ptAt = (PA, s, off) => { const p = atS(PA, s); return { x: p.x + p.tz * off, z: p.z - p.tx * off, lv: p.lv, p }; };
  // water ribbon (animated) + banks (static) + trees/poles lining both sides
  function riverMeshes(PA, look) {
    const S = PA.S, cols = touch ? 6 : 8, rows = S.length, geo = new THREE.BufferGeometry(), pos = new Float32Array(rows * cols * 3), col = new Float32Array(rows * cols * 3), idx = [];
    for (let i = 0; i < rows; i++) for (let c = 0; c < cols; c++) { const p = S[i], u = c / (cols - 1) * 2 - 1, off = u * (p.w + 0.8), k = (i * cols + c) * 3; pos[k] = p.x + p.tz * off; pos[k + 1] = p.lv; pos[k + 2] = p.z - p.tx * off; }
    for (let i = 0; i < rows - 1; i++) for (let c = 0; c < cols - 1; c++) { const a = i * cols + c, b = a + 1, d = a + cols, e = d + 1; idx.push(a, d, b, b, d, e); }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const water = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad, side: THREE.DoubleSide })); water.frustumCulled = false; WORLD.add(water);
    const OFF = look.bank.off, HT = look.bank.h, CL = look.bank.c.map(c => new THREE.Color(c));
    for (const sd of [-1, 1]) { const bg = new THREE.BufferGeometry(), nc = OFF.length, bp = new Float32Array(rows * nc * 3), bc = new Float32Array(rows * nc * 3), bi = [];
      for (let i = 0; i < rows; i++) for (let c = 0; c < nc; c++) { const p = S[i], off = sd * (p.w + OFF[c]), k = (i * nc + c) * 3, cc = CL[c]; bp[k] = p.x + p.tz * off; bp[k + 1] = p.lv + HT[c]; bp[k + 2] = p.z - p.tx * off; bc[k] = cc.r; bc[k + 1] = cc.g; bc[k + 2] = cc.b; }
      for (let i = 0; i < rows - 1; i++) for (let c = 0; c < nc - 1; c++) { const a = i * nc + c, b = a + 1, d = a + nc, e = d + 1; if (sd > 0) bi.push(a, d, b, b, d, e); else bi.push(a, b, d, b, e, d); }
      bg.setAttribute('position', new THREE.BufferAttribute(bp, 3)); bg.setAttribute('color', new THREE.BufferAttribute(bc, 3)); bg.setIndex(bi); bg.computeVertexNormals();
      const bm = new THREE.Mesh(bg, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad, side: THREE.DoubleSide })); bm.receiveShadow = !touch; WORLD.add(bm); }
    // lining: trees (river) or lamp posts + palms (lazy river), every few metres on both sides
    const lin = []; for (let s = 6; s < PA.L - 4; s += look.every) for (const sd of [-1, 1]) { const p = atS(PA, s), off = sd * (p.w + look.lineOff + rr(-0.5, 0.8)); lin.push([p.x + p.tz * off, p.lv + look.lineY, p.z - p.tx * off]); }
    const tr = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.3, 3, 6), toon(look.trunk), lin.length), cr = new THREE.InstancedMesh(look.crownGeo, toon(look.crown), lin.length), dm = new THREE.Object3D();
    lin.forEach(([x, y, z], i) => { dm.position.set(x, y + 1.5, z); dm.rotation.set(0, rr(0, 6), 0); dm.scale.setScalar(1); dm.updateMatrix(); tr.setMatrixAt(i, dm.matrix); dm.position.y = y + look.crownY; dm.scale.setScalar(rr(0.85, 1.2)); dm.updateMatrix(); cr.setMatrixAt(i, dm.matrix); });
    tr.castShadow = cr.castShadow = !touch; WORLD.add(tr, cr);
    let lmin = 1e9; S.forEach(p => lmin = Math.min(lmin, p.lv)); const gp = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), toon(look.ground)); gp.rotation.x = -Math.PI / 2; gp.position.y = lmin + look.groundY; WORLD.add(gp);
    const calm = new THREE.Color(look.calm), rap = new THREE.Color(look.rapid), foam = new THREE.Color('#f4fbfb'), tc = new THREE.Color();
    return { water, geo, cols, update(hint) { const P = geo.attributes.position.array, C = geo.attributes.color.array, i0 = Math.max(0, hint - 50), i1 = Math.min(rows - 1, hint + 110);
      for (let i = i0; i <= i1; i++) { const p = S[i], slope = i > 0 ? S[i - 1].lv - p.lv : 0, fk = sstep(4, 10, p.f);
        for (let c = 0; c < cols; c++) { const u = c / (cols - 1) * 2 - 1, k = (i * cols + c) * 3, x = P[k], z = P[k + 2];
          P[k + 1] = p.lv + (0.05 + p.f * 0.014) * Math.sin(x * 0.7 + TT * 2.1 + p.s * 0.5) + 0.04 * Math.sin(z * 0.9 - TT * 1.7);
          const st = Math.sin(p.s * 0.55 - TT * p.f * 0.9 + u * 2.3 + Math.sin(p.s * 0.13) * 2);
          tc.copy(calm).lerp(rap, fk); const fm = Math.max(st > 0.72 ? (st - 0.72) * 3.6 * (0.25 + fk) : 0, slope > 0.35 ? 0.9 : 0, Math.abs(u) > 0.86 ? 0.35 : 0); if (fm > 0) tc.lerp(foam, Math.min(1, fm));
          C[k] = tc.r; C[k + 1] = tc.g; C[k + 2] = tc.b; } }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; } }; }
  function poolMesh(A, look) { const m = new THREE.Mesh(new THREE.CircleGeometry(A.r + 1.5, 40), toon(look.calm)); m.rotation.x = -Math.PI / 2; m.position.set(A.x, A.lv - 0.02, A.z); WORLD.add(m);
    const rim = new THREE.Mesh(new THREE.RingGeometry(A.r + 1.2, A.r + 9, 40, 1), toon(look.rim)); rim.rotation.x = -Math.PI / 2; rim.position.set(A.x, A.lv + 0.5, A.z); WORLD.add(rim);
    const fence = new THREE.Mesh(new THREE.TorusGeometry(A.r, 0.12, 6, 48), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0 })); fence.rotation.x = -Math.PI / 2; fence.position.set(A.x, A.lv + 0.15, A.z); WORLD.add(fence); A.fence = fence; return m; }

  // ---------- ENEMIES ----------
  const ents = [], projs = [];
  const foxLook = (fur, dark, acc) => ({ ...PLAYER_MALE, fur, furDark: dark, tailBase: dark, tailMid: fur, tailTip: '#f3e2c4', armorAccent: acc });
  function pirateFox(key, sc = 1.25, torso = ['#f3f2f2', '#ec3013', '#7a1a0c']) { const f = kit.makeFox({ key, torso, outfit: 'vest', look: foxLook(pick(['#8a5a2b', '#5b4636', '#c2410c']), '#3a2a1e', '#ec3013'), mood: 'smug' }); f.scale.setScalar(sc); f.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(f); f.userData.h = b.max.y - b.min.y; return f; }
  function hat(f, kind) { const h = f.userData.h / f.scale.x, g = new THREE.Group(); g.position.y = h * 0.93; f.add(g); if (kind === 'bandana') { M(new THREE.SphereGeometry(0.2, 10, 6, 0, 6.3, 0, 1.4), red, 0, 0, 0, g, 0.02); M(new THREE.ConeGeometry(0.06, 0.2, 4), red, 0, -0.05, -0.2, g, 0).rotation.x = -1.2; } else if (kind === 'crown') { M(new THREE.CylinderGeometry(0.2, 0.17, 0.16, 8, 1, true), yel, 0, 0.04, 0, g, 0.02); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; M(new THREE.ConeGeometry(0.04, 0.1, 4), yel, Math.cos(a) * 0.18, 0.16, Math.sin(a) * 0.18, g, 0); } } else if (kind === 'tricorn') { M(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 3), ink, 0, 0, 0, g, 0.02); M(new THREE.SphereGeometry(0.17, 10, 6, 0, 6.3, 0, 1.4), ink, 0, 0, 0, g, 0); } return g; }
  function waterGun(parent, h, big) { const g = new THREE.Group(), k = big ? 2.2 : 1; M(new THREE.BoxGeometry(0.12 * k, 0.14 * k, 0.5 * k), toon(big ? '#ffd23a' : pick(['#5ec97e', '#f472b6', '#38bdf8'])), 0, 0, 0.2 * k, g, 0.015); M(new THREE.CylinderGeometry(0.1 * k, 0.1 * k, 0.24 * k, 8), toon('#38bdf8'), 0, 0.17 * k, 0.05 * k, g, 0.015); g.position.set(0.18 * h, h * 0.5, 0.25 * h); parent.add(g); return g; }
  const BUILD = {
    crab(e) { const g = new THREE.Group(), c = toon('#e8552a'); M(new THREE.SphereGeometry(0.55, 12, 8), c, 0, 0.3, 0, g, 0.04).scale.set(1.2, 0.55, 0.9); for (const s of [-1, 1]) { const cl = new THREE.Group(); cl.position.set(s * 0.6, 0.35, 0.45); g.add(cl); M(new THREE.SphereGeometry(0.22, 8, 6), c, 0, 0, 0.12, cl, 0.03).scale.set(1, 0.7, 1.3); e[s < 0 ? 'cl_1' : 'cl1'] = cl; for (let l = 0; l < 3; l++) M(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 4), c, s * 0.6, 0.15, -0.25 + l * 0.22, g, 0).rotation.z = s * 1.0; M(new THREE.SphereGeometry(0.07, 6, 4), ink, s * 0.18, 0.6, 0.4, g, 0); } e.r = 0.9; return g; },
    turtle(e) { const g = new THREE.Group(); M(new THREE.SphereGeometry(0.8, 12, 8, 0, 6.3, 0, 1.5), toon('#3f8f3a'), 0, 0, 0, g, 0.04).scale.set(1, 0.6, 1.15); const hd = new THREE.Group(); hd.position.set(0, 0.1, 0.95); g.add(hd); M(new THREE.SphereGeometry(0.28, 10, 8), toon('#7fb069'), 0, 0, 0, hd, 0.03); e.jaw = M(new THREE.BoxGeometry(0.3, 0.07, 0.3), toon('#5c7a3a'), 0, -0.12, 0.12, hd, 0); for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.05, 6, 4), ink, s * 0.12, 0.1, 0.2, hd, 0); e.r = 1.0; return g; },
    flamingo(e) { const g = new THREE.Group(), pk = toon('#f49ac1'); M(new THREE.SphereGeometry(0.5, 10, 8), pk, 0, 1.9, 0, g, 0.03).scale.set(1, 0.7, 1.4); const nk = new THREE.Group(); nk.position.set(0, 2.1, 0.45); g.add(nk); M(new THREE.CylinderGeometry(0.07, 0.09, 1.2, 6), pk, 0, 0.5, 0.05, nk, 0.02).rotation.x = 0.3; M(new THREE.SphereGeometry(0.17, 8, 6), pk, 0, 1.1, 0.25, nk, 0.02); M(new THREE.ConeGeometry(0.06, 0.3, 5), ink, 0, 1.05, 0.48, nk, 0).rotation.x = 1.9; e.neck = nk; for (const s of [-0.12, 0.12]) M(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 4), toon('#e0648f'), s, 0.9, 0, g, 0); e.r = 1.0; return g; },
    fin(e) { const g = new THREE.Group(), gr = toon('#6b7c88'); const fin = M(new THREE.ConeGeometry(0.5, 1.2, 4), gr, 0, 0.5, 0, g, 0.03); fin.scale.set(0.25, 1, 1); fin.rotation.x = -0.25; const body = M(new THREE.CapsuleGeometry(0.55, 2.2, 4, 10), gr, 0, -0.5, 0, g, 0.04); body.rotation.x = Math.PI / 2; e.body = body; M(new THREE.ConeGeometry(0.5, 0.9, 4), gr, 0, -0.5, -1.9, g, 0.03).rotation.x = -Math.PI / 2; e.r = 1.1; return g; },
    raft(e) { const g = new THREE.Group(); for (let i = 0; i < 5; i++) M(new THREE.CylinderGeometry(0.22, 0.22, 3.2, 8), wood, -0.9 + i * 0.45, 0.12, 0, g, 0.02).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 5), ink, -0.8, 1.7, -1.1, g, 0); const fl = M(new THREE.PlaneGeometry(1.2, 0.8), ink, -0.2, 3.0, -1.1, g, 0); fl.material = new THREE.MeshBasicMaterial({ color: 0x201e1d, side: THREE.DoubleSide }); const f = pirateFox('pirate' + ents.length); hat(f, 'bandana'); f.position.set(0.3, 0.3, 0.2); g.add(f); e.fox = f; e.r = 2.0; e.hp = 2; return g; },
    corsair(e) { const g = new THREE.Group(), f = pirateFox('corsair' + ents.length, 1.35, ['#2b2a33', '#18161a', '#e0b43a']); hat(f, 'tricorn'); g.add(f); e.fox = f; e.r = 1.0; return g; },
    kid(e) { const g = new THREE.Group(), f = kit.makeFox({ key: 'kid' + ents.length, torso: [pick(['#f472b6', '#38bdf8', '#5ec97e', '#ffd23a']), '#f3f2f2', '#201e1d'], outfit: 'vest', look: foxLook(pick(['#f07a2a', '#e8b277', '#d9772b']), '#8a5a2b', '#38bdf8'), mood: 'smug' }); f.scale.setScalar(0.85); f.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(f); f.userData.h = b.max.y - b.min.y; g.add(f); e.fox = f; e.gun = waterGun(f, (b.max.y - b.min.y) / 0.85); e.r = 0.9; return g; },
    tuber(e) { const g = new THREE.Group(), c = pick(['#ffd23a', '#38bdf8', '#5ec97e', '#f472b6', '#f3f2f2']); M(new THREE.TorusGeometry(0.85, 0.36, 8, 20), toon(c), 0, 0.25, 0, g, 0.03, 1.2).rotation.x = Math.PI / 2; const fu = toon(pick(['#f07a2a', '#e8b277', '#8a5a2b', '#f3e2c4'])); M(new THREE.CapsuleGeometry(0.32, 0.5, 3, 8), toon(pick(['#ec3013', '#201e1d', '#7dd3fc'])), 0, 0.75, -0.1, g, 0.03).rotation.x = -0.4; M(new THREE.SphereGeometry(0.3, 10, 8), fu, 0, 1.35, -0.25, g, 0.03); for (const s of [-1, 1]) M(new THREE.ConeGeometry(0.1, 0.26, 4), fu, s * 0.16, 1.62, -0.25, g, 0); M(new THREE.ConeGeometry(0.1, 0.24, 5), fu, 0, 1.3, 0.05, g, 0).rotation.x = Math.PI / 2; e.r = 1.3; return g; } };
  function addEnt(kind, o) { const e = { kind, hp: 1, st: 'idle', t: 0, cd: rr(0.6, 2.2), dead: false, r: 1, y: 0, yaw: 0, ...o }; if (o.s != null && G.ST && G.ST.PA) { const q = ptAt(G.ST.PA, o.s, o.off || 0); e.x = q.x; e.z = q.z; e.y = q.lv; } e.g = BUILD[kind](e); e.bang = mkBang(e.g, kind === 'flamingo' ? 3.6 : kind === 'raft' || kind === 'corsair' || kind === 'kid' ? 3.4 : 2); WORLD.add(e.g); ents.push(e); return e; }
  function knock(e, why, pts) { e.dead = true; e.bang.visible = false; const dx = e.x - ben.x, dz = e.z - ben.z, d = Math.hypot(dx, dz) || 1; e.fly = { vx: dx / d * 9, vy: 8, vz: dz / d * 9, spin: rr(6, 12) }; G.swats++; if (pts) award(why, pts); spray(V3(e.x, e.y + 0.6, e.z), 12, 4, 1.2, 0.7); audio.burst(0.25, 900, 0.18); audio.tone(300, 0.12, 0.06, 'square', 2.2); }
  // throw something at Ben in an arc (lands where he will be)
  const projGeo = { dart: new THREE.ConeGeometry(0.09, 0.7, 5), barrel: new THREE.CylinderGeometry(0.45, 0.45, 0.9, 10), balloon: new THREE.SphereGeometry(0.35, 10, 8) };
  function throwAt(owner, kind, from, T = 1.0, aimOff = 0) { const c = chest(), tx = c.x + ben.vx * T * 0.75 + aimOff * Math.cos(ben.yaw), tz = c.z + ben.vz * T * 0.75 - aimOff * Math.sin(ben.yaw), g = kind === 'drop' ? 4 : 12;
    let m; if (kind === 'drop') { m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x7dd3fc, transparent: true, depthWrite: false })); m.scale.setScalar(0.6); }
    else { m = new THREE.Mesh(projGeo[kind], kind === 'dart' ? red : kind === 'barrel' ? wood : toon(pick(['#f472b6', '#38bdf8', '#ffd23a', '#5ec97e']))); if (kind !== 'dart') addOutline(m, 0.03); }
    m.position.copy(from); scene.add(m); const p = { kind, m, p: from.clone(), v: V3((tx - from.x) / T, (c.y - from.y) / T + 0.5 * g * T, (tz - from.z) / T), g, owner, t: 0, batted: false, alive: true, dmg: { dart: 7, barrel: 12, balloon: 6, drop: 0.6 }[kind] }; projs.push(p); return p; }
  function projStep(dt) { const c = chest();
    for (const p of projs) { if (!p.alive) continue; p.t += dt;
      if (p.batted) { const o = p.owner, tp = o.boss ? V3(o.x, o.y + 1.6, o.z) : V3(o.x, (o.y || 0) + 1.4, o.z), dir = tp.sub(p.p); const d = dir.length(); if (d < 1.6 || p.t > 1.6) { p.alive = false; hitOwner(o, p); continue; } p.v.lerp(dir.normalize().multiplyScalar(26), Math.min(1, dt * 8)); p.p.addScaledVector(p.v, dt); }
      else { p.v.y -= p.g * dt; p.p.addScaledVector(p.v, dt); if (p.p.distanceTo(c) < (p.kind === 'barrel' ? 1.5 : 1.15)) { p.alive = false; if (p.kind === 'drop') { if (ben.duckT <= 0) { ben.vx += p.v.x * 0.05; ben.vz += p.v.z * 0.05; G.soak = (G.soak || 0) + p.dmg; if (G.soak >= 3) { G.soak = 0; if (TK.hurt(ben, 3)) { flash('SQUIRTED', '#7dd3fc'); G.hits++; } } } } else if (TK.hurt(ben, p.dmg)) { G.hits++; flash(p.kind === 'dart' ? 'DART · AIR LEAKING' : p.kind === 'barrel' ? 'BARREL · OOF' : 'SPLAT', '#ec3013'); audio.tone(1800, 0.4, 0.05, 'sawtooth', 0.4); spray(c, 10, 3, 1, 0.6, p.kind === 'balloon' ? 0x7dd3fc : 0xffffff); } else if (ben.duckT > 0) flash('UNDER IT', '#ffffff'); continue; }
        if (p.p.y < levelAt(p.p.x, p.p.z) - 0.6 || p.t > 4) { p.alive = false; spray(p.p, 4, 2, 0.8, 0.5); continue; } }
      p.m.position.copy(p.p); if (p.kind === 'dart') p.m.quaternion.setFromUnitVectors(V3(0, 1, 0), p.v.clone().normalize()); else if (p.kind !== 'drop') { p.m.rotation.x += dt * 6; p.m.rotation.z += dt * 4; } }
    for (let i = projs.length - 1; i >= 0; i--) if (!projs[i].alive) { scene.remove(projs[i].m); projs.splice(i, 1); } }
  function batCheck() { const c = chest(); let n = 0; for (const p of projs) { if (!p.alive || p.batted || p.kind === 'drop' || !p.owner) continue; if (p.p.distanceTo(c) < TUBE.REACH + 0.6) { p.batted = true; p.t = 0; n++; G.batted++; award(p.kind === 'barrel' ? 'BARREL BATTED BACK' : p.kind === 'balloon' ? 'BALLOON BATTED BACK' : 'DART BATTED BACK', 80, '#ffd23a'); audio.tone(1200, 0.08, 0.07, 'square', 0.6); spray(p.p, 8, 3, 0.8, 0.4, 0xffd23a); } } return n; }
  function hitOwner(o, p) { spray(p.p, 14, 4, 1.4, 0.7, p.kind === 'balloon' ? 0x7dd3fc : 0xffffff); audio.burst(0.3, 700, 0.2);
    if (o.boss) return bossHit(o, p.kind);
    if (o.dead) return;
    if (o.kind === 'raft') { o.hp--; if (o.hp <= 0) { o.dead = true; o.sink = 0; o.bang.visible = false; award('RAFT SUNK', 200, '#7dd3fc'); G.swats++; } else flash('PIRATE HIT', '#ffffff'); }
    else knock(o, o.kind === 'corsair' ? 'CORSAIR IN THE DRINK' : 'RETURN TO SENDER', 150); }
  function entStep(e, dt) {
    const dx = ben.x - e.x, dz = ben.z - e.z, d = Math.hypot(dx, dz);
    if (e.fly) { const F = e.fly; e.x += F.vx * dt; e.z += F.vz * dt; e.y += F.vy * dt; F.vy -= 18 * dt; e.g.rotation.x += F.spin * dt; e.g.position.set(e.x, e.y, e.z); if (e.y < levelAt(e.x, e.z) - 3) { e.fly = null; e.g.visible = false; e.gone = true; } return; }
    if (e.sink != null) { e.sink += dt; e.g.position.y = e.y - e.sink * 1.2; e.g.rotation.z = e.sink * 0.4; if (e.sink > 2.5) { e.g.visible = false; e.gone = true; } return; }
    if (e.dead || e.gone) return;
    if (d > 90) { e.g.visible = false; return; } e.g.visible = true;
    e.t += dt; e.cd -= dt; const face = Math.atan2(dx, dz); if (e.fox && d < 50) kit.animFox(e.fox, dt, 0, false);
    const lvl = levelAt(e.x, e.z);
    if (e.kind === 'crab') { if (e.st === 'idle') { e.y = e.onBank ? e.y0 : lvl; if (d < 8) e.st = 'run'; } else if (e.st === 'run') { const sp = 3.4 * dt; e.x += dx / d * sp; e.z += dz / d * sp; e.y = Math.max(lvl, e.y - dt * 3); e.yaw = face; if (d < 1.7) { e.st = 'tell'; e.t = 0; } if (d > 16) e.st = 'idle'; } else if (e.st === 'tell') { e.bang.visible = true; e.cl1.rotation.x = e.cl_1.rotation.x = -0.9; if (e.t > 0.45) { e.bang.visible = false; e.cl1.rotation.x = e.cl_1.rotation.x = 0; if (d < 2.3 && TK.hurt(ben, 6)) { G.hits++; flash('PINCHED · AIR LEAKING', '#ec3013'); } e.st = 'back'; e.t = 0; } } else if (e.st === 'back') { e.x -= dx / d * 3 * dt; e.z -= dz / d * 3 * dt; if (e.t > 0.8) e.st = 'run'; }
      e.g.rotation.y = e.yaw; e.g.position.set(e.x, e.y + Math.abs(Math.sin(e.t * 12)) * 0.05, e.z); }
    else if (e.kind === 'turtle') { const fl = flowAt(e.x, e.z); e.x += fl.x * 0.35 * dt; e.z += fl.z * 0.35 * dt; e.yaw = damp(e.yaw, face, 2, dt); e.y = lvl;
      if (e.st === 'idle' && d < 2.6 && e.cd <= 0) { e.st = 'tell'; e.t = 0; } if (e.st === 'tell') { e.bang.visible = true; e.jaw.rotation.x = 0.6; if (e.t > 0.5) { e.bang.visible = false; e.jaw.rotation.x = 0; if (d < 2.6 && TK.hurt(ben, 8)) { G.hits++; flash('SNAPPED · AIR LEAKING', '#ec3013'); } e.st = 'idle'; e.cd = 1.6; } }
      e.g.rotation.y = e.yaw; e.g.position.set(e.x, e.y + Math.sin(e.t * 2) * 0.05, e.z); }
    else if (e.kind === 'flamingo') { e.g.rotation.y = damp(e.g.rotation.y, face, 3, dt);
      if (e.st === 'idle' && d < 3.0 && e.cd <= 0) { e.st = 'tell'; e.t = 0; } if (e.st === 'tell') { e.bang.visible = true; e.neck.rotation.x = -0.5; if (e.t > 0.45) { e.bang.visible = false; e.neck.rotation.x = 0.9; if (d < 3.2 && TK.hurt(ben, 5)) { G.hits++; flash('PECKED · AIR LEAKING', '#ec3013'); } e.st = 'rec'; e.t = 0; } } else if (e.st === 'rec' && e.t > 0.4) { e.neck.rotation.x = 0; e.st = 'idle'; e.cd = 1.4; }
      e.g.position.set(e.x, e.y, e.z); }
    else if (e.kind === 'fin') { if (e.st === 'idle') { e.a = (e.a || 0) + dt * 0.8; e.x = lerp(e.x, e.hx + Math.cos(e.a) * 6, dt * 2); e.z = lerp(e.z, e.hz + Math.sin(e.a) * 6, dt * 2); e.yaw = e.a + Math.PI; if (d < 8.5 && e.cd <= 0) { e.st = 'tell'; e.t = 0; } }
      else if (e.st === 'tell') { e.bang.visible = true; e.yaw = face; if (e.t > 0.7) { e.bang.visible = false; e.st = 'lunge'; e.t = 0; e.lx = dx / d; e.lz = dz / d; } }
      else if (e.st === 'lunge') { e.x += e.lx * 16 * dt; e.z += e.lz * 16 * dt; if (d < 2.0 && !e.res) { e.res = true; if (ben.duckT > 0) flash('IT WENT UNDER YOU', '#ffffff'); else if (TK.hurt(ben, 12)) { G.hits++; flash('SHARK BITE · AIR LEAKING', '#ec3013'); audio.tone(160, 0.4, 0.08, 'sawtooth', 0.6); } } if (e.t > 0.6) { e.st = 'idle'; e.cd = 2.6; e.res = false; } }
      e.y = lvl; e.body.position.y = e.st === 'lunge' ? 0 : -0.7; e.g.rotation.y = e.yaw; e.g.position.set(e.x, e.y, e.z); if (Math.random() < 0.3) spray(V3(e.x, e.y + 0.1, e.z), 1, 1.2, 0.6, 0.4); }
    else if (e.kind === 'raft' || e.kind === 'tuber' || (e.kind === 'kid' && e.drift)) { // drift down the path, holding a lane
      const PA = G.ST.PA; e.s += (e.kind === 'raft' ? 0.55 : 0.9) * atS(PA, e.s).f * dt; if (e.s > PA.L - 3) { if (e.kind === 'raft') e.s = PA.L - 3; else e.s = 4; } const q = ptAt(PA, e.s, e.off); e.x = q.x; e.z = q.z; e.y = q.lv;
      if (e.kind === 'tuber' || e.kind === 'kid') { if (d < e.r + ben.R + ben.r && !e.bumpT) { e.bumpT = 0.8; const k = 4 / (d || 1); ben.vx += dx * k; ben.vz += dz * k; ben.spin += rr(-3, 3); ben.wob = 0.8; e.off = clamp(e.off - Math.sign(dx * q.p.tz - dz * q.p.tx) * 1.2, -q.p.w + 1.5, q.p.w - 1.5); flash(pick(['BUMP!', 'SORRY!', 'WATCH IT!']), '#ffffff'); audio.burst(0.2, 500, 0.12); } e.bumpT = Math.max(0, (e.bumpT || 0) - dt); e.g.rotation.y += dt * 0.3; }
      else e.g.rotation.y = damp(e.g.rotation.y, face, 2, dt);
      e.g.position.set(e.x, e.y + Math.sin(TT * 2 + e.s) * 0.05, e.z); }
    if ((e.kind === 'raft' || e.kind === 'corsair') && !e.dead) { // throw darts
      if (e.kind === 'corsair') { e.g.rotation.y = face; e.g.position.set(e.x, e.y, e.z); }
      if (e.st === 'idle' && d < 28 && d > 4 && e.cd <= 0) { e.st = 'tell'; e.t = 0; } if (e.st === 'tell') { e.bang.visible = true; if (e.fox.userData.P) e.fox.userData.P.arms[1].rotation.x = -2.6; if (e.t > 0.6) { e.bang.visible = false; throwAt(e, 'dart', V3(e.x, e.y + 2.2, e.z), clamp(d / 18, 0.8, 1.3)); e.st = 'idle'; e.cd = rr(2.4, 3.2); audio.tone(900, 0.1, 0.03, 'triangle', 0.5); } } }
    if (e.kind === 'kid' && !e.dead) { if (!e.drift) { e.g.position.set(e.x, e.y, e.z); } e.g.rotation.y = face;
      if (e.st === 'idle' && d < 13 && e.cd <= 0) { e.st = 'tell'; e.t = 0; } if (e.st === 'tell') { e.bang.visible = true; if (e.t > 0.5) { e.bang.visible = false; e.st = 'squirt'; e.t = 0; } } if (e.st === 'squirt') { e.sq = (e.sq || 0) - dt; if (e.sq <= 0) { e.sq = 0.07; throwAt(e, 'drop', V3(e.x + Math.sin(face) * 0.6, e.y + 1.0, e.z + Math.cos(face) * 0.6), clamp(d / 16, 0.4, 0.9)); } if (e.t > 1.3) { e.st = 'idle'; e.cd = rr(2.2, 3.4); } } }
 }
  function swatCheck() { const c = chest(); let hit = 0; for (const e of ents) { if (e.dead || e.gone) continue; const d = Math.hypot(e.x - c.x, e.z - c.z); if (d > TUBE.REACH + e.r * 0.6) continue;
      if (e.kind === 'crab') { knock(e, 'CRAB SWATTED', 50); hit++; } else if (e.kind === 'turtle') { knock(e, 'TURTLE SWATTED', 60); hit++; } else if (e.kind === 'flamingo') { knock(e, 'FLAMINGO SHOOED', 50); e.fly.vy = 10; hit++; } else if (e.kind === 'fin' && e.st !== 'idle') { knock(e, 'SHARK BONKED', 120); hit++; }
      else if (e.kind === 'raft') { e.hp--; hit++; if (e.hp <= 0) { e.dead = true; e.sink = 0; e.bang.visible = false; award('RAFT SUNK', 200, '#7dd3fc'); G.swats++; } else flash('WHACK', '#ffffff'); }
      else if (e.kind === 'kid') { knock(e, 'SPLASHED BACK', 30); hit++; } else if (e.kind === 'tuber') { e.off = clamp(e.off + rr(-3, 3), -4, 4); flash('SPUN', '#ffffff'); } }
    if (hit) audio.tone(260, 0.1, 0.07, 'square', 1.8); return hit; }

  // ---------- BOSSES ----------
  let ringMark = null;
  function bossBuild(kind, A) { const B = { boss: true, kind, x: A.x, z: A.z + 8, y: A.lv, hp: kind === 'shark' ? 4 : kind === 'pirate' ? 5 : 6, st: 'intro', t: 0, cd: 2, ang: 0, n: 0 }; B.max = B.hp; const g = new THREE.Group(); B.g = g; WORLD.add(g);
    if (kind === 'shark') { const gr = toon('#5f707c'); B.body = new THREE.Group(); g.add(B.body); const bd = M(new THREE.CapsuleGeometry(1.1, 4.4, 6, 12), gr, 0, 0, 0, B.body, 0.06); bd.rotation.x = Math.PI / 2; M(new THREE.CapsuleGeometry(0.95, 3.6, 6, 12), white, 0, -0.35, 0.2, B.body, 0).rotation.x = Math.PI / 2; const fin = M(new THREE.ConeGeometry(0.9, 2.2, 4), gr, 0, 1.6, -0.3, B.body, 0.04); fin.scale.set(0.25, 1, 1); fin.rotation.x = -0.3; M(new THREE.ConeGeometry(0.9, 1.8, 4), gr, 0, 0.4, -3.6, B.body, 0.04).rotation.x = -Math.PI / 2 + 0.3; for (const s of [-1, 1]) { M(new THREE.SphereGeometry(0.14, 8, 6), ink, s * 0.65, 0.35, 2.4, B.body, 0); const pf = M(new THREE.ConeGeometry(0.5, 1.4, 4), gr, s * 1.2, -0.4, 0.6, B.body, 0.03); pf.rotation.z = s * 1.7; pf.scale.set(0.3, 1, 1); } B.jaw = M(new THREE.BoxGeometry(1.2, 0.18, 1.0), toon('#8a2a20'), 0, -0.25, 2.5, B.body, 0); B.r = 2.2; }
    else if (kind === 'pirate') { for (let i = 0; i < 7; i++) M(new THREE.CylinderGeometry(0.3, 0.3, 5, 8), wood, -1.8 + i * 0.6, 0.15, 0, g, 0.03).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.1, 0.1, 6, 6), ink, 0, 3, -1.8, g, 0); const sail = M(new THREE.PlaneGeometry(3, 2.4), ink, 0, 4.2, -1.75, g, 0); sail.material = new THREE.MeshBasicMaterial({ map: canvasTex(256, 200, x => { x.fillStyle = '#201e1d'; x.fillRect(0, 0, 256, 200); x.fillStyle = '#f3f2f2'; x.beginPath(); x.arc(128, 86, 40, 0, 7); x.fill(); x.fillStyle = '#201e1d'; x.fillRect(104, 76, 16, 14); x.fillRect(136, 76, 16, 14); x.strokeStyle = '#f3f2f2'; x.lineWidth = 14; x.beginPath(); x.moveTo(70, 140); x.lineTo(186, 180); x.moveTo(186, 140); x.lineTo(70, 180); x.stroke(); }), side: THREE.DoubleSide }); for (const [bx, bz] of [[1.4, -1.2], [1.8, 0.4], [-1.6, 1.2]]) M(new THREE.CylinderGeometry(0.45, 0.45, 0.9, 10), wood, bx, 0.75, bz, g, 0.03); const f = pirateFox('rapidsPirate', 1.9, ['#f3f2f2', '#201e1d', '#ec3013']); hat(f, 'tricorn'); f.position.set(0, 0.3, 0.4); g.add(f); B.fox = f; B.r = 3; }
    else { M(new THREE.TorusGeometry(2.4, 0.8, 10, 26), yel, 0, 0.3, 0, g, 0.05, 3.2).rotation.x = Math.PI / 2; M(new THREE.BoxGeometry(1.8, 0.4, 1.6), red, 0, 0.9, -0.2, g, 0.04); M(new THREE.BoxGeometry(1.8, 2.2, 0.3), red, 0, 2.0, -1.0, g, 0.04); M(new THREE.SphereGeometry(0.25, 8, 6), yel, -0.8, 3.2, -1.0, g, 0); M(new THREE.SphereGeometry(0.25, 8, 6), yel, 0.8, 3.2, -1.0, g, 0); const f = kit.makeFox({ key: 'gunKing', torso: ['#ffd23a', '#ec3013', '#7a1a0c'], outfit: 'royal', look: foxLook('#f07a2a', '#8a3a10', '#ffd23a'), mood: 'smug' }); f.scale.setScalar(1.7); f.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(f); f.userData.h = b.max.y - b.min.y; hat(f, 'crown'); f.position.set(0, 0.7, -0.2); g.add(f); B.fox = f; B.cannon = waterGun(f, f.userData.h / 1.7, true); B.r = 3.2;
      B.beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fe0ff, transparent: true, opacity: 0.75 })); B.beam.visible = false; scene.add(B.beam); }
    B.bang = mkBang(g, kind === 'shark' ? 3 : 5.5); return B; }
  function bossHit(B, how) { if (B.hp <= 0) return; B.hp--; G.bossHits = (G.bossHits || 0) + 1; award(B.kind === 'shark' ? 'SHARK BONKED' : B.kind === 'pirate' ? 'PIRATE HIT' : 'THE KING GOT SOAKED', 150, '#ffd23a'); audio.tone(220, 0.25, 0.08, 'square', 0.7); spray(V3(B.x, B.y + 1.5, B.z), 20, 5, 1.6, 0.8);
    if (B.hp <= 0) { B.st = 'beaten'; B.t = 0; B.bang.visible = false; if (B.beam) B.beam.visible = false; if (ringMark) ringMark.visible = false; award(STAGES[G.stage - 1].boss + ' BEATEN', 1000, '#5ec97e'); say(STAGES[G.stage - 1].boss + ' BEATEN', 2.6); }
    else { B.st = 'stun'; B.t = 0; } }
  function bossStep(B, dt) { const A = G.ST.arena, dx = ben.x - B.x, dz = ben.z - B.z, d = Math.hypot(dx, dz) || 1, face = Math.atan2(dx, dz); B.t += dt; B.cd -= dt; const rage = 1 - B.hp / B.max; if (B.st === 'gone') return;
    if (B.st === 'beaten') { if (B.kind === 'shark') { B.z += 10 * dt; B.y -= dt * 0.8; B.body.rotation.x = 0.3; } else if (B.kind === 'pirate') { B.y -= dt * 0.9; B.g.rotation.z = Math.min(0.6, B.t * 0.3); } else { B.g.rotation.y += dt * 6; B.y -= dt * 0.4; } B.g.position.set(B.x, B.y, B.z); if (B.t > 2.6) { B.g.visible = false; B.st = 'gone'; bossDone(); } return; }
    if (B.kind === 'shark') { B.body.rotation.x = 0;
      if (B.st === 'intro' || B.st === 'circle') { B.ang += dt * (0.8 + rage * 0.5); const tx = ben.x + Math.cos(B.ang) * 10, tz = ben.z + Math.sin(B.ang) * 10, mx = tx - B.x, mz = tz - B.z, md = Math.hypot(mx, mz) || 1, sp = Math.min(md, 11 * dt); B.x += mx / md * sp; B.z += mz / md * sp; B.yaw = Math.atan2(mx, mz); B.y = levelAt(B.x, B.z) - 1.35; if (B.cd <= 0) { B.st = 'tell'; B.t = 0; B.tx = ben.x; B.tz = ben.z; } }
      else if (B.st === 'tell') { B.yaw = face; B.bang.visible = true; B.tx = lerp(B.tx, ben.x, dt * 2); B.tz = lerp(B.tz, ben.z, dt * 2); ringMark.visible = true; ringMark.position.set(B.tx, levelAt(B.tx, B.tz) + 0.1, B.tz); ringMark.scale.setScalar(1 + 0.3 * Math.sin(B.t * 18)); if (B.t > 0.9 - rage * 0.25) { B.bang.visible = false; ringMark.visible = false; B.st = 'lunge'; B.t = 0; const lx = B.tx - B.x, lz = B.tz - B.z, ld = Math.hypot(lx, lz) || 1; B.lx = lx / ld; B.lz = lz / ld; B.res = false; } }
      else if (B.st === 'lunge') { B.x += B.lx * 24 * dt; B.z += B.lz * 24 * dt; B.y = levelAt(B.x, B.z) - 0.6 + Math.sin(Math.min(1, B.t / 0.55) * Math.PI) * 0.9; B.jaw.rotation.x = 0.5; if (d < 3.4 && !B.res && TK.swingLive(ben)) { B.res = true; B.jaw.rotation.x = 0; bossHit(B, 'racket'); B.vy = 9; return; } if (d < 2.2 && !B.res) { B.res = true; if (ben.duckT > 0) { flash('IT WENT UNDER YOU', '#ffffff'); award('DUCKED THE SHARK', 60); } else if (TK.hurt(ben, 18)) { G.hits++; flash('SHARK BITE · AIR LEAKING', '#ec3013'); audio.tone(140, 0.5, 0.09, 'sawtooth', 0.5); } } if (B.t > 0.75) { B.st = 'circle'; B.cd = rr(2.2, 3.2) - rage; B.jaw.rotation.x = 0; } }
      else if (B.st === 'stun') { B.vy -= 18 * dt; B.y += B.vy * dt; B.x -= B.lx * 6 * dt; B.z -= B.lz * 6 * dt; B.body.rotation.x = -B.t * 3; if (B.t > 1.3) { B.st = 'circle'; B.cd = 2; } }
      B.x = clamp(B.x, A.x - A.r - 6, A.x + A.r + 6); B.z = clamp(B.z, A.z - A.r - 6, A.z + A.r + 6); B.g.rotation.y = B.yaw; B.g.position.set(B.x, B.y, B.z); if (Math.random() < 0.5) spray(V3(B.x, levelAt(B.x, B.z) + 0.1, B.z), 1, 1.5, 0.8, 0.4); return; }
    // the pirate + the king keep to the far side of the arena and throw
    const pa = Math.atan2(ben.z - A.z, ben.x - A.x) + Math.PI + Math.sin(TT * 0.5) * 0.6, rr0 = B.kind === 'pirate' ? A.r * 0.6 : A.r * 0.35; B.x = lerp(B.x, A.x + Math.cos(pa) * rr0, dt * 0.7); B.z = lerp(B.z, A.z + Math.sin(pa) * rr0, dt * 0.7); B.y = A.lv + Math.sin(TT * 1.6) * 0.08; B.g.rotation.y = damp(B.g.rotation.y, face, 2, dt);
    const P = B.fox && B.fox.userData.P;
    if (B.st === 'stun') { B.g.rotation.z = Math.sin(B.t * 20) * 0.08 * (1 - B.t); if (B.t > 1) { B.st = 'idle'; B.cd = 1.2; B.g.rotation.z = 0; } }
    else if (B.st === 'intro' || B.st === 'idle') { if (B.cd <= 0) { B.n++; B.st = B.kind === 'king' && B.n % 3 === 0 ? 'beamTell' : 'tell'; B.t = 0; } }
    else if (B.st === 'tell') { B.bang.visible = true; if (P) P.arms[1].rotation.x = -2.6; if (B.t > 0.7 - rage * 0.2) { B.bang.visible = false; const from = V3(B.x, B.y + 3, B.z);
        if (B.kind === 'pirate') { if (B.n % 2) throwAt(B, 'barrel', from, 1.5); else { for (const o of [-3, 0, 3]) throwAt(B, 'dart', from, 1.1, o); } }
        else { if (B.n % 3 === 2) { for (const o of [-3, 0, 3]) throwAt(B, 'balloon', from, 1.3, o); } else throwAt(B, 'balloon', from, 1.25); }
        audio.tone(500, 0.15, 0.05, 'triangle', 0.6); B.st = 'idle'; B.cd = rr(1.8, 2.4) - rage * 0.7; } }
    else if (B.st === 'beamTell') { B.bang.visible = true; B.b0 = face - 1.1; if (B.t > 0.8) { B.bang.visible = false; B.st = 'beam'; B.t = 0; say('DUCK! (3)', 1.6); } }
    else if (B.st === 'beam') { const u = B.t / 2.2, ang = B.b0 + 2.2 * u, len = A.r * 1.9, from = V3(B.x, B.y + 2.6, B.z), dir = V3(Math.sin(ang), -0.06, Math.cos(ang)); B.beam.visible = true; B.beam.scale.set(1, len, 1); B.beam.position.copy(from).addScaledVector(dir, len / 2); B.beam.quaternion.setFromUnitVectors(V3(0, 1, 0), dir);
      const pd = Math.atan2(Math.sin(face - ang), Math.cos(face - ang)); if (Math.abs(pd) < 0.14 && d < len) { if (ben.duckT <= 0 && TK.hurt(ben, 8)) { G.hits++; ben.vx += Math.sin(ang) * 8; ben.vz += Math.cos(ang) * 8; flash('BLASTED · AIR LEAKING', '#ec3013'); } else if (ben.duckT > 0 && !B.ducked) { B.ducked = true; award('DUCKED THE CANNON', 80); } }
      if (Math.random() < 0.6) spray(from.clone().addScaledVector(dir, len * Math.random()), 1, 2, 1, 0.5, 0x9fe0ff); if (u >= 1) { B.beam.visible = false; B.st = 'idle'; B.cd = 1.6; B.ducked = false; } }
    B.g.position.set(B.x, B.y, B.z); if (B.fox) kit.animFox(B.fox, dt, 0, false); if (P && B.st === 'tell') P.arms[1].rotation.x = -2.6; }

  // ---------- STAGE 1: OUT IN THE WAVES (the break: sea grid + rolling sets) ----------
  const chop = (x, z, t) => 0.12 * Math.sin(x * 0.21 + t * 1.3) + 0.08 * Math.sin(z * 0.27 - t * 1.1) + 0.05 * Math.sin((x + z) * 0.5 + t * 2.1);
  const bands = [];
  const bandH = (b, z) => { const d = z - b.z; if (b.kind === 'swell') return b.A * Math.exp(-((d / 4.4) ** 2)); return b.A * (0.75 * Math.exp(-((d / 2.2) ** 2)) + (d > 0 ? 0.3 * Math.exp(-((d / 7) ** 2)) : 0)); };
  function seaLevel(x, z) { let y = chop(x, z, TT); for (const b of bands) { const d = z - b.z; if (d > -12 && d < 18) y += bandH(b, z); } return y; }
  function buildWaves(ST) {
    const look = { calm: '#25afc4', rim: '#ead7a4' }; scene.background.set('#bfe6f2'); scene.fog.color.set('#bfe6f2');
    const NX = touch ? 30 : 46, NZ = touch ? 60 : 92, geo = new THREE.PlaneGeometry(90, 184, NX, NZ); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, 84); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
    const sea = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad })); sea.frustumCulled = false; sea.receiveShadow = !touch; WORLD.add(sea);
    const far = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), toon('#0c6a93')); far.rotation.x = -Math.PI / 2; far.position.y = -0.3; WORLD.add(far);
    const sandT = canvasTex(256, 256, g => { g.fillStyle = '#ead7a4'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(160,130,80,0.14)' : 'rgba(255,255,255,0.18)'; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); } }); sandT.wrapS = sandT.wrapT = THREE.RepeatWrapping; sandT.repeat.set(20, 10);
    const isl = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 16), new THREE.MeshToonMaterial({ map: sandT, gradientMap: grad })); isl.scale.set(150, 6, 62); isl.position.set(0, -4.2, -46); isl.receiveShadow = !touch; WORLD.add(isl);
    const gY = (x, z) => { const qx = x / 150, qz = (z + 46) / 62, r = 1 - qx * qx - qz * qz; return r <= 0 ? -5 : -4.2 + 6 * Math.sqrt(r); };
    // JIB's surf shop on the sand + the finish flags + palms
    { const sx = -14, sz = -12, y0 = gY(sx, sz); for (const [a, b] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) M(new THREE.BoxGeometry(0.3, 3.4, 0.3), wood, sx + a, y0 + 1.7, sz + b, null, 0.03); M(new THREE.BoxGeometry(7, 0.3, 5), toon('#38bdf8'), sx, y0 + 3.5, sz, null, 0.04); M(new THREE.BoxGeometry(6.4, 1.1, 0.3), white, sx, y0 + 1, sz + 2.1, null, 0.03);
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.3), new THREE.MeshBasicMaterial({ map: canvasTex(512, 112, g => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, 512, 112); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 14, 112); g.fillStyle = '#ffd23a'; g.font = '900 60px Archivo, sans-serif'; g.fillText("JIB'S SURF SHOP", 34, 78); }) })); sg.position.set(sx, y0 + 4.4, sz + 2.55); WORLD.add(sg);
      ['#ec3013', '#ffd23a', '#38bdf8', '#f3f2f2'].forEach((c, i) => { const t = M(new THREE.TorusGeometry(0.7, 0.3, 8, 18), toon(c), sx - 2 + i * 1.4, y0 + 1, sz + 2.6, null, 0.03, 1); t.rotation.y = 0.2; });
      jib.position.set(sx + 4.5, y0, sz + 3); jib.rotation.y = 0.5; }
    for (const s of [-1, 1]) { M(new THREE.CylinderGeometry(0.12, 0.12, 5, 6), ink, s * 6, gY(s * 6, -0.5) + 2.5, -0.5, null, 0); const fl = M(new THREE.PlaneGeometry(1.6, 1), red, s * 6 + 0.8, gY(s * 6, -0.5) + 4.4, -0.5, null, 0); fl.material = new THREE.MeshBasicMaterial({ color: 0xec3013, side: THREE.DoubleSide }); }
    for (const ry of [0, Math.PI]) { const fin = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.4), new THREE.MeshBasicMaterial({ map: signTex('FINISH', '#ffffff', '#201e1d'), transparent: true })); fin.position.set(0, gY(0, -0.5) + 5.2, -0.5); fin.rotation.y = ry; WORLD.add(fin); }
    const palm = (x, z, h = 9) => { const y0 = gY(x, z), g = new THREE.Group(); g.position.set(x, y0, z); g.rotation.z = rr(-0.18, 0.18); WORLD.add(g); for (let k = 0; k < 5; k++) M(new THREE.CylinderGeometry(0.32 - k * 0.03, 0.36 - k * 0.03, h / 5, 7), toon('#8a6238'), Math.sin(k * 0.4) * 0.3, h / 10 + k * h / 5, 0, g, 0.03); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28, lf = M(new THREE.ConeGeometry(0.7, 5, 4), toon(k % 2 ? '#3f8f3a' : '#5ec97e'), Math.cos(a) * 2, h - 0.6, Math.sin(a) * 2, g, 0.03); lf.scale.set(1, 1, 0.35); lf.rotation.order = 'YXZ'; lf.rotation.set(0, -a, -1.5); } };
    for (const [x, z] of [[-30, -18], [-44, -24], [18, -16], [32, -22], [50, -14], [-60, -12]]) palm(x, z, rr(8, 11));
    // lane buoys every 12 m (yellow left, red right) so you always see the course out and back
    for (let z = 12; z < 140; z += 12) for (const s of [-1, 1]) { const g = new THREE.Group(); M(new THREE.SphereGeometry(0.45, 10, 8), s < 0 ? yel : red, 0, 0.2, 0, g, 0.03); M(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 5), ink, 0, 0.9, 0, g, 0); g.position.set(s * 22, 0, z); WORLD.add(g); ST.bobs.push(g); }
    const A = ST.arena = { x: 0, z: 150, r: 17, lv: 0 };
    { const g = new THREE.Group(); M(new THREE.SphereGeometry(1.0, 12, 10), red, 0, 0.3, 0, g, 0.05); M(new THREE.CylinderGeometry(0.1, 0.1, 3, 6), ink, 0, 1.8, 0, g, 0); g.position.set(0, 0, A.z + A.r + 2); WORLD.add(g); ST.bobs.push(g); postSign(0, 0, A.z + A.r + 2, stx('OUTER BUOY'), stx('SHARK!', '#ec3013', '#ffffff'), () => G.boss && G.phase === 'boss'); }
    for (const s of [-1, 1]) postSign(s * 24, 0, 86, stx('SET!', '#ffffff', '#ec3013'), stx('SET!', '#ec3013', '#ffffff'), () => bands.some(b => b.kind === 'swell' && b.z - b.brk < 22));
    const fence = new THREE.Mesh(new THREE.TorusGeometry(A.r, 0.12, 6, 48), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0 })); fence.rotation.x = -Math.PI / 2; fence.position.set(A.x, 0.2, A.z); WORLD.add(fence); A.fence = fence;
    const deep = new THREE.Color('#0c6a93'), face = new THREE.Color('#25afc4'), glow = new THREE.Color('#86e6df'), foam = new THREE.Color('#f4fbfb'), shallow = new THREE.Color('#48c9c6'), tc = new THREE.Color();
    ST.update = dt => { // the sets: 3 swells, a gap; they break at ~85 m and roll in as whitewater
      ST.setT -= dt; if (ST.setT <= 0) { if (ST.setLeft > 0) { bands.push({ z: 178, pz: 178, kind: 'swell', A: 0.8, brk: rr(80, 90) }); ST.setLeft--; ST.setT = ST.setLeft ? 4.2 : 4.2 + rr(6, 9); } else { ST.setLeft = 3; ST.setT = 0.01; } }
      for (const b of [...bands]) { b.pz = b.z; b.z -= 6.5 * dt; if (b.kind === 'swell') { b.A = 0.8 + 1.5 * sstep(178, b.brk + 4, b.z); if (b.z <= b.brk) { b.kind = 'foam'; b.A = 1.25; onBreak(b); } } else b.A = 1.25 * sstep(-2, 40, b.z) + 0.05;
        if (b.kind === 'foam' && Math.random() < (touch ? 0.6 : 1)) spray(V3(rr(-40, 40), 0.6, b.z + rr(-0.5, 1.5)), 1, 2.5, 1.6, 0.8);
        if (G.phase === 'run' || G.phase === 'boss') { if (b.pz > ben.z && b.z <= ben.z) bandHit(b); }
        if (b.z < -4) bands.splice(bands.indexOf(b), 1); }
      if (ST.rideT > 0) { ST.rideT -= dt; ben.vz = Math.min(ben.vz, -10); ST.rideP += dt * 45; if (Math.random() < 0.6) spray(V3(ben.x, ben.y + 0.3, ben.z - 0.5), 2, 3, 1.1, 0.6); if (ST.rideT <= 0) { award('RODE THE WHITEWATER', ST.rideP, '#7dd3fc'); ST.rideP = 0; ben.boost = 0; } }
      const p = geo.attributes.position, c = geo.attributes.color; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); let y = chop(x, z, TT) - 0.06, sw = 0, fm = 0; for (const b of bands) { const d = z - b.z; if (d < -12 || d > 18) continue; const h = bandH(b, z); y += h; if (b.kind === 'swell') sw = Math.max(sw, h / 2.3); else fm = Math.max(fm, (d > -2.6 && d < 9 ? 1 - Math.max(0, d) / 9 : 0) * Math.min(1, b.A * 1.2)); }
        p.setY(i, y); tc.copy(deep).lerp(shallow, sstep(40, -4, z)).lerp(face, Math.min(1, sw * 1.2)).lerp(glow, sstep(0.6, 1, sw) * 0.6); if (fm > 0) tc.lerp(foam, Math.min(1, fm * (0.75 + 0.25 * Math.sin(x * 0.9 + z * 1.7 + TT * 3)))); c.setXYZ(i, tc.r, tc.g, tc.b); }
      p.needsUpdate = true; c.needsUpdate = true; geo.computeVertexNormals(); };
    function onBreak(b) { audio.burst(1.0, 500, 0.16); for (let k = 0; k < (touch ? 10 : 18); k++) spray(V3(rr(-40, 40), 1.2, b.z), 1, 4, 2, 0.9);
      if ((G.phase === 'run' || G.phase === 'boss') && Math.abs(ben.z - b.z) < 5) { if (ben.duckT > 0) award('UNDER THE LIP', 100, '#7dd3fc'); else if (TK.hurt(ben, 10)) { G.hits++; ben.vz -= 8; flash('POUNDED BY THE LIP · AIR LEAKING', '#ec3013'); audio.tone(200, 0.4, 0.06, 'sawtooth', 0.5); } } }
    function bandHit(b) { if (b.kind !== 'foam' || b.A < 0.25) return;
      if (G.home) { const sx = STK.x + kx(), sy = STK.y + ky(), w = stickWorld(sx, sy); if (w.z < -0.3 || ben.vz < -2) { ST.rideT = 2.8; ST.rideP = ST.rideP || 0; ben.boost = 5; ben.vz -= 6; say('RIDING THE WHITEWATER', 1.4); spray(V3(ben.x, ben.y, ben.z), 12, 4, 1.4, 0.8); } else { ben.vz -= 5; flash('PUSHED IN', '#ffffff'); } }
      else if (ben.duckT > 0) { award('DUCKED THE WHITEWATER', 40, '#7dd3fc'); spray(V3(ben.x, ben.y + 0.5, ben.z), 10, 3, 1.2, 0.6); }
      else { ben.vz -= 9; ben.wob = 1; ben.spin += rr(-4, 4); flash('WASHED BACK · DUCK IT (3)', '#ffffff'); spray(V3(ben.x, ben.y + 0.5, ben.z), 14, 4, 1.4, 0.8); audio.burst(0.6, 700, 0.18); if (!ST.washTip) { ST.washTip = true; radio('Tap 3 just before the white hits you. The tube goes over your head and it rolls past.'); } } }
    ST.setT = 1.5; ST.setLeft = 3; ST.rideT = 0; ST.rideP = 0;
    ST.level = (x, z) => seaLevel(x, z); ST.flow = () => ({ x: 0, z: 0 });
    ST.bound = () => { if (G.phase === 'boss') { const lim = A.r - ben.R - ben.r, dx = ben.x - A.x, dz = ben.z - A.z, ad = Math.hypot(dx, dz); if (ad > lim) { ben.x = A.x + dx / ad * lim; ben.z = A.z + dz / ad * lim; const vn = (ben.vx * dx + ben.vz * dz) / ad; if (vn > 0) { ben.vx -= dx / ad * vn * 1.4; ben.vz -= dz / ad * vn * 1.4; } } } ben.x = clamp(ben.x, -40, 40); if (ben.z < 0.5) { ben.z = 0.5; ben.vz = Math.max(0, ben.vz); } if (ben.z > 172) { ben.z = 172; ben.vz = Math.min(0, ben.vz); } };
    ST.start = { x: 0, z: 3, yaw: 0 }; ST.goal = () => G.home ? { x: 0, z: 1, label: 'BEACH' } : { x: 0, z: A.z, label: 'OUTER BUOY' };
    ST.travel = () => G.home ? { x: 0, z: -1 } : { x: 0, z: 1 };
    ST.finished = () => G.home && ben.z <= 3;
    // enemies: two small sharks out back, flamingos in the shallows (they get you on the way in)
    addEnt('fin', { x: -8, z: 55, hx: -8, hz: 55 }); addEnt('fin', { x: 10, z: 108, hx: 10, hz: 108 });
    for (const [x, z] of [[-7, 9], [6, 13], [-3, 18], [9, 6]]) addEnt('flamingo', { x, z, y: -0.4 });
    // the 8 TOKENS (out and back), coins (some up where a swell lifts you), patch kits, power-ups
    [[-6, 20], [7, 38], [-10, 57], [5, 74], [-4, 98], [9, 120], [-13, 34], [12, 64]].forEach(([x, z]) => addItem('tok', x, 1.2, z));
    for (const [x0, z0, hi] of [[0, 28, 0], [-12, 46, 1], [10, 90, 1], [-6, 112, 0], [4, 128, 1], [-14, 70, 0]]) for (let j = 0; j < 6; j++) addItem('coin', x0 + j * 1.4, hi ? 1.9 + Math.sin(j / 5 * Math.PI) * 0.4 : 0.9, z0 + j * 1.6);
    addItem('patch', -16, 1.2, 50); addItem('patch', 15, 1.2, 100); addItem('patch', 0, 1.2, 25); addItem('pw', 14, 1.6, 44, 'x2'); addItem('pw', -9, 1.6, 86, 'mag'); addItem('pw', 6, 1.6, 132, 'pump'); }

  // ---------- STAGE 2: WHITE-WATER RIVER ----------
  function buildRiver(ST) {
    scene.background.set('#cfe8e0'); scene.fog.color.set('#cfe8e0');
    const drops = [{ s: 140, h: 3 }, { s: 268, h: 3.5 }, { s: 372, h: 4 }];
    const PA = ST.PA = makePath([[0, 0, 40, 9, 5], [4, 40, 38, 9, 7], [-10, 80, 36, 8, 9], [-22, 120, 33, 9, 8], [-8, 160, 29, 10, 6], [16, 195, 25, 8, 10], [26, 235, 21, 9, 9], [12, 275, 17, 11, 5], [-8, 310, 13, 8, 10], [-14, 350, 9, 9, 9], [0, 390, 5, 10, 7], [8, 420, 3, 12, 4]], drops);
    const look = { calm: '#2f9fb8', rapid: '#7fd3dd', rim: '#8d7f6c', ground: '#5c9a43', groundY: -6, every: 8, lineOff: 4.5, lineY: 2.2, trunk: '#6b4a2a', crown: '#2f6f3a', crownGeo: new THREE.ConeGeometry(1.6, 4.4, 7), crownY: 4.4, bank: { off: [-1.4, 0.4, 2.6, 7, 20], h: [-1.0, 0.7, 2.2, 6, 12], c: ['#5a4e40', '#8d7f6c', '#9c8f7c', '#5c9a43', '#4f8a3a'] } };
    ST.river = riverMeshes(PA, look);
    const end = PA.S[PA.n], A = ST.arena = { x: end.x + end.tx * 16, z: end.z + end.tz * 16, r: 19, lv: end.lv }; poolMesh(A, look);
    // rocks (bounce, scrape the tube), eddies (spin you), drop signs
    ST.rocks = []; for (let s = 30; s < PA.L - 15; s += rr(14, 22)) { if (drops.some(d => Math.abs(d.s - s) < 9)) continue; const p = atS(PA, s), off = rr(-p.w + 2.2, p.w - 2.2), r = rr(0.9, 1.6), q = ptAt(PA, s, off); const m = M(new THREE.DodecahedronGeometry(r, 0), toon(pick(['#8d8478', '#7d7468', '#9c9488'])), q.x, q.lv + r * 0.3, q.z, null, 0.05); m.rotation.set(rr(0, 3), rr(0, 3), 0); m.scale.y = 0.75; ST.rocks.push({ x: q.x, z: q.z, r }); }
    for (const d of drops) { for (const sd of [-1, 1]) { const q = ptAt(PA, d.s + 0.5, sd * (atS(PA, d.s).w - 0.8)); M(new THREE.DodecahedronGeometry(1.4, 0), toon('#7d7468'), q.x, q.lv, q.z, null, 0.05); } const sq = ptAt(PA, d.s - 14, atS(PA, d.s - 14).w + 1.6); postSign(sq.x, sq.lv + 0.7, sq.z, stx('DROP'), stx('HOP · 3', '#ec3013', '#ffffff'), () => { const s = G.loc ? G.loc.s : 0; return d.s - s > 0 && d.s - s < 34; }); }
    ST.eddies = []; for (const [s, sd] of [[110, 1], [248, -1], [330, 1]]) { const p = atS(PA, s), q = ptAt(PA, s, sd * (p.w - 3)); ST.eddies.push({ x: q.x, z: q.z, r: 4.2, lv: q.lv }); const rg = new THREE.Mesh(new THREE.RingGeometry(2.5, 4.1, 24), new THREE.MeshBasicMaterial({ color: 0xf4fbfb, transparent: true, opacity: 0.45, side: THREE.DoubleSide })); rg.rotation.x = -Math.PI / 2; rg.position.set(q.x, q.lv + 0.12, q.z); WORLD.add(rg); ST.bobs.push(rg); rg.userData.spin = true; const sq = ptAt(PA, s - 8, sd * (p.w + 1.6)); postSign(sq.x, sq.lv + 0.7, sq.z, stx('EDDY', '#ffffff', '#201e1d'), stx('EDDY', '#ffd23a', '#201e1d'), () => G.loc && Math.abs(G.loc.s - s) < 24); }
    { const q = ptAt(PA, PA.L - 6, end.w + 2); postSign(q.x, q.lv + 0.6, q.z, stx('BOSS', '#ec3013', '#ffffff'), stx('PIRATE!', '#201e1d', '#ffd23a'), () => G.phase === 'boss'); }
    // enemies along the river
    for (const s of [60, 172, 292, 352]) addEnt('raft', { s, off: rr(-3, 3) });
    for (const [s, sd] of [[95, -1], [205, 1], [315, -1], [362, 1]]) { const p = atS(PA, s), q = ptAt(PA, s, sd * (p.w + 1.4)); addEnt('corsair', { x: q.x, z: q.z, y: q.lv + 0.6 }); }
    for (const s of [46, 128, 232, 302]) { const p = atS(PA, s), q = ptAt(PA, s, rr(-p.w + 3, p.w - 3)); addEnt('turtle', { x: q.x, z: q.z }); }
    ST.rocks.filter((r, i) => i % 5 === 2).forEach(r => addEnt('crab', { x: r.x, z: r.z, y0: atS(PA, locate(PA, r.x, r.z).s).lv + 0.9, onBank: true }));
    // tokens + coins + kits + power-ups along the river; coin arcs over each drop (HOP to reach them)
    [20, 70, 118, 182, 226, 290, 340, 398].forEach((s, i) => { const p = atS(PA, s), q = ptAt(PA, s, (i % 2 ? 1 : -1) * (p.w - 3)); addItem('tok', q.x, q.lv + 1.2, q.z); });
    for (const d of drops) { const lv0 = atS(PA, d.s - 1).lv; for (let j = 0; j < 6; j++) { const s = d.s + 1 + j * 2.2, q = ptAt(PA, s, 0); addItem('coin', q.x, lv0 + 1.0 + Math.sin(j / 5 * Math.PI) * 1.2 - j * 0.35, q.z); } }
    for (const s of [36, 196, 318]) for (let j = 0; j < 6; j++) { const q = ptAt(PA, s + j * 2, Math.sin(j) * 2); addItem('coin', q.x, q.lv + 0.9, q.z); }
    [[85, 'patch'], [215, 'patch'], [335, 'patch'], [152, 'x2'], [258, 'mag'], [384, 'pump']].forEach(([s, k]) => { const q = ptAt(PA, s, rr(-3, 3)); if (k === 'patch') addItem('patch', q.x, q.lv + 1.2, q.z); else addItem('pw', q.x, q.lv + 1.6, q.z, k); });
    riverCommon(ST, PA); }
  function riverCommon(ST, PA) {
    const A = ST.arena;
    ST.level = (x, z) => { const ad = Math.hypot(x - A.x, z - A.z); if (ad < A.r + 1.5) return A.lv + chop(x, z, TT) * 0.6; const L = locate(PA, x, z, G.loc ? G.loc.i : null); return atS(PA, clamp(L.s, 0, PA.L)).lv + chop(x, z, TT) * 0.4; };
    ST.flow = (x, z) => { const ad = Math.hypot(x - A.x, z - A.z); if (ad < A.r + 1) return { x: -(z - A.z) / (ad || 1) * 0.8, z: (x - A.x) / (ad || 1) * 0.8 }; const L = locate(PA, x, z, G.loc ? G.loc.i : null), p = L.p; let fx = p.tx * p.f, fz = p.tz * p.f;
      for (const e of ST.eddies || []) { const dx = x - e.x, dz = z - e.z, d = Math.hypot(dx, dz); if (d < e.r) { const k = 1 - d / e.r; fx = lerp(fx, -dz / (d || 1) * 5 - dx * 0.4, k); fz = lerp(fz, dx / (d || 1) * 5 - dz * 0.4, k); } } return { x: fx, z: fz }; };
    ST.bound = () => { const L = G.loc = locate(PA, ben.x, ben.z, G.loc ? G.loc.i : null), ad = Math.hypot(ben.x - A.x, ben.z - A.z), inA = ad < A.r - 0.5;
      if (G.phase === 'boss' || (G.locked)) { const lim = A.r - ben.R - ben.r; if (ad > lim) { const k = lim / ad; ben.x = A.x + (ben.x - A.x) * k; ben.z = A.z + (ben.z - A.z) * k; const nx = (ben.x - A.x) / lim, nz = (ben.z - A.z) / lim, vn = ben.vx * nx + ben.vz * nz; if (vn > 0) { ben.vx -= vn * nx * 1.4; ben.vz -= vn * nz * 1.4; } } return; }
      if (inA) return; const p = L.p, wm = p.w - ben.R - ben.r * 0.5; if (Math.abs(L.off) > wm) { const ex = L.off - Math.sign(L.off) * wm; ben.x -= p.tz * ex; ben.z += p.tx * ex; const vn = (ben.vx * p.tz - ben.vz * p.tx) * Math.sign(L.off); if (vn > 0) { ben.vx -= p.tz * Math.sign(L.off) * vn * 1.3; ben.vz += p.tx * Math.sign(L.off) * vn * 1.3; ben.wob = 0.5; } }
      if (L.s < 0.5) { ben.x += p.tx * (0.5 - L.s); ben.z += p.tz * (0.5 - L.s); }
      for (const r of ST.rocks || []) { const dx = ben.x - r.x, dz = ben.z - r.z, d = Math.hypot(dx, dz), m = r.r + ben.R; if (d < m && d > 0.01) { ben.x = r.x + dx / d * m; ben.z = r.z + dz / d * m; const vn = (ben.vx * dx + ben.vz * dz) / d; if (vn < 0) { ben.vx -= dx / d * vn * 1.5; ben.vz -= dz / d * vn * 1.5; } ben.spin += rr(-3, 3); if (Math.abs(vn) > 4 && TK.hurt(ben, 4)) { G.hits++; flash('SCRAPED A ROCK · AIR LEAKING', '#ec3013'); audio.burst(0.2, 400, 0.18); } } }
      for (const e of ST.eddies || []) if (Math.hypot(ben.x - e.x, ben.z - e.z) < e.r) { ben.spin += 2.4 * (1 / 60); if (!e.in) { e.in = true; flash('EDDY · PADDLE OUT', '#ffffff'); } } else if (e.in) { e.in = false; award('ESCAPED THE EDDY', 40); } };
    ST.start = { x: PA.S[1].x, z: PA.S[1].z, yaw: Math.atan2(PA.S[1].tx, PA.S[1].tz) }; jib.position.set(PA.S[2].x + PA.S[2].tz * (PA.S[2].w + 2), PA.S[2].lv + 0.7, PA.S[2].z - PA.S[2].tx * (PA.S[2].w + 2)); jib.rotation.y = Math.atan2(-PA.S[2].tz, PA.S[2].tx);
    ST.goal = () => ({ x: A.x, z: A.z, label: STAGES[G.stage - 1].boss });
    ST.travel = () => { if (G.phase === 'boss' && G.boss) { const dx = G.boss.x - ben.x, dz = G.boss.z - ben.z, d = Math.hypot(dx, dz) || 1; return { x: dx / d, z: dz / d }; } const L = G.loc || locate(PA, ben.x, ben.z), q = atS(PA, clamp(L.s + 8, 0, PA.L)); return { x: q.tx, z: q.tz }; };
    ST.update = () => { if (ST.river) ST.river.update(G.loc ? G.loc.i : 0); };
    ST.finished = () => false; }

  // ---------- STAGE 3: LAZY RIVER (a water park loop → the wave pool) ----------
  function buildLazy(ST) {
    scene.background.set('#c9ecf7'); scene.fog.color.set('#c9ecf7');
    const ctrl = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 1.8 - Math.PI / 2, wig = Math.sin(i * 1.7) * 6; ctrl.push([Math.cos(a) * (72 + wig), Math.sin(a) * (48 + wig) + 48, 0, 6.5 + Math.sin(i * 2.3) * 0.8, 2.4]); } { const a = Math.PI * 1.3 + 0.08; ctrl.push([Math.cos(a) * 92, Math.sin(a) * 64 + 48, 0, 7, 2.4]); }
    const PA = ST.PA = makePath(ctrl, []);
    const look = { calm: '#3cc4d6', rapid: '#5fd6e2', rim: '#e9dfcf', ground: '#7fc06a', groundY: -0.1, every: 9, lineOff: 3.6, lineY: 0.55, trunk: '#9aa0a8', crown: '#ffd23a', crownGeo: new THREE.SphereGeometry(0.45, 8, 6), crownY: 3.2, bank: { off: [-1.0, 0.1, 0.9, 6, 14], h: [-0.8, 0.5, 0.55, 0.5, 0.45], c: ['#7fd3dd', '#f3f2f2', '#e9dfcf', '#e3d6c2', '#7fc06a'] } };
    ST.river = riverMeshes(PA, look);
    const end = PA.S[PA.n], A = ST.arena = { x: end.x + end.tx * 18, z: end.z + end.tz * 18, r: 21, lv: 0 }; poolMesh(A, look);
    // park dressing: palms + umbrellas + loungers inside the loop and on the deck
    const palmG = (x, z, h = 8) => { const g = new THREE.Group(); g.position.set(x, -0.1, z); WORLD.add(g); for (let k = 0; k < 4; k++) M(new THREE.CylinderGeometry(0.3 - k * 0.03, 0.34 - k * 0.03, h / 4, 7), toon('#8a6238'), Math.sin(k * 0.4) * 0.3, h / 8 + k * h / 4, 0, g, 0.03); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28, lf = M(new THREE.ConeGeometry(0.7, 4.4, 4), toon(k % 2 ? '#3f8f3a' : '#5ec97e'), Math.cos(a) * 1.8, h - 0.5, Math.sin(a) * 1.8, g, 0.03); lf.scale.set(1, 1, 0.35); lf.rotation.order = 'YXZ'; lf.rotation.set(0, -a, -1.5); } };
    for (let i = 0; i < (touch ? 7 : 12); i++) { const a = rr(0, 6.28), q = rr(0.1, 0.55); palmG(Math.cos(a) * 72 * q, Math.sin(a) * 48 * q + 48, rr(7, 10)); }
    for (let i = 0; i < (touch ? 8 : 14); i++) { const s = rr(10, PA.L - 10), sd = Math.random() < 0.5 ? -1 : 1, p = atS(PA, s), q = ptAt(PA, s, sd * (p.w + rr(5, 9))), c = pick(['#ec3013', '#ffd23a', '#38bdf8', '#f3f2f2']); M(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 5), ink, q.x, 1.75, q.z, null, 0); M(new THREE.ConeGeometry(1.6, 0.7, 10), toon(c), q.x, 3.1, q.z, null, 0.03); M(new THREE.BoxGeometry(0.8, 0.25, 1.9), white, q.x + 1.2, 0.7, q.z, null, 0.02); }
    { const sl = canvasTex(512, 112, g => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, 512, 112); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 14, 112); g.fillStyle = '#ffffff'; g.font = '900 58px Archivo, sans-serif'; g.fillText('JIDDA LAZY RIVER', 32, 76); }); const q = ptAt(PA, 8, 0); for (const sd of [-1, 1]) { const qq = ptAt(PA, 8, sd * (atS(PA, 8).w + 1)); M(new THREE.BoxGeometry(0.4, 5, 0.4), red, qq.x, 2.9, qq.z, null, 0.03); } const b = new THREE.Mesh(new THREE.PlaneGeometry(15, 2.2), new THREE.MeshBasicMaterial({ map: sl, side: THREE.DoubleSide })); b.position.set(q.x, 5.4, q.z); b.rotation.y = Math.atan2(PA.S[4].tx, PA.S[4].tz); WORLD.add(b); }
    { const q = ptAt(PA, PA.L - 8, end.w + 1.8); postSign(q.x, 0.5, q.z, stx('WAVE POOL', '#38bdf8', '#201e1d'), stx('THE KING!', '#ec3013', '#ffffff'), () => G.phase === 'boss'); }
    for (const s of [60, 150, 240]) { const p = atS(PA, s), q = ptAt(PA, s, p.w + 1.6); postSign(q.x, 0.5, q.z, stx('SQUIRT ZONE', '#ffffff', '#201e1d'), stx('DUCK · 3', '#38bdf8', '#201e1d'), () => G.loc && Math.abs(G.loc.s - s - 12) < 18); }
    // the crowd: tubers drifting, kids with water guns (bank + in tubes), flamingos on the deck, turtles, crabs
    for (let i = 0; i < (touch ? 10 : 14); i++) addEnt('tuber', { s: 20 + i * (PA.L - 40) / 14 + rr(-4, 4), off: rr(-3.5, 3.5) });
    for (const [s, sd] of [[70, 1], [118, -1], [162, 1], [205, -1], [252, 1], [300, -1]]) { const p = atS(PA, s), q = ptAt(PA, s, sd * (p.w + 1.2)); addEnt('kid', { x: q.x, z: q.z, y: 0.55 }); }
    for (const s of [95, 185, 275]) { const k = addEnt('kid', { s, off: rr(-2, 2), drift: true }); const t = M(new THREE.TorusGeometry(0.8, 0.32, 8, 18), toon(pick(['#38bdf8', '#5ec97e', '#f472b6'])), 0, 0.2, 0, k.g, 0.03, 1.1); t.rotation.x = Math.PI / 2; k.fox.position.y = -0.3; }
    for (const [s, sd] of [[40, -1], [135, 1], [228, -1], [318, 1]]) { const p = atS(PA, s), q = ptAt(PA, s, sd * (p.w + 0.6)); addEnt('flamingo', { x: q.x, z: q.z, y: 0.1 }); }
    for (const s of [52, 172, 262]) { const q = ptAt(PA, s, rr(-3, 3)); addEnt('turtle', { x: q.x, z: q.z }); }
    for (const s of [110, 220]) { const p = atS(PA, s), q = ptAt(PA, s, -(p.w + 0.4)); addEnt('crab', { x: q.x, z: q.z, y0: 0.55, onBank: true }); }
    [16, 58, 104, 146, 196, 238, 284, 326].forEach((s, i) => { const p = atS(PA, s), q = ptAt(PA, s, (i % 2 ? 1 : -1) * (p.w - 2)); addItem('tok', q.x, 1.2, q.z); });
    for (const s of [30, 90, 176, 214, 300]) for (let j = 0; j < 6; j++) { const q = ptAt(PA, s + j * 2, Math.sin(j * 0.9) * 2.5); addItem('coin', q.x, 0.9, q.z); }
    [[80, 'patch'], [190, 'patch'], [290, 'patch'], [125, 'x2'], [232, 'mag'], [312, 'pump']].forEach(([s, k]) => { const q = ptAt(PA, s, rr(-2.5, 2.5)); if (k === 'patch') addItem('patch', q.x, 1.2, q.z); else addItem('pw', q.x, 1.6, q.z, k); });
    ST.rocks = []; ST.eddies = []; riverCommon(ST, PA); }

  // ---------- stage lifecycle ----------
  function clearStage() { if (WORLD) { scene.remove(WORLD); WORLD.traverse(o => { if (o.geometry && !Object.values(projGeo).includes(o.geometry) && o.geometry !== tokGeo && o.geometry !== coinGeo) o.geometry.dispose(); }); } ents.length = 0; items.length = 0; signs.length = 0; bands.length = 0; projs.forEach(p => scene.remove(p.m)); projs.length = 0; if (G.boss && G.boss.beam) scene.remove(G.boss.beam); G.boss = null;
    WORLD = new THREE.Group(); scene.add(WORLD); ringMark = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.1, 24), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false })); ringMark.rotation.x = -Math.PI / 2; ringMark.visible = false; WORLD.add(ringMark); }
  function buildStage(n) { clearStage(); const ST = { n, bobs: [], PA: null, arena: null }; G.ST = ST; G.loc = null; if (n === 1) buildWaves(ST); else if (n === 2) buildRiver(ST); else buildLazy(ST); return ST; }
  const levelAt = (x, z) => G.ST ? G.ST.level(x, z) : 0, flowAt = (x, z) => G.ST ? G.ST.flow(x, z) : { x: 0, z: 0 };
  function placeBen() { const s = G.ST.start; Object.assign(ben, { x: s.x, z: s.z, vx: 0, vz: 0, vy: 0, yaw: s.yaw, spin: 0, air: TUBE.AIR, mode: 'water', duckT: 0, duckCd: 0, swingT: 0, swingCd: 0, dashCd: 0, inv: 0, wob: 0, boost: 0, shield: 0 }); ben.root.scale.setScalar(1); ben.root.visible = true; ben.y = levelAt(s.x, s.z); G.loc = null; if (G.ST.PA) G.loc = locate(G.ST.PA, ben.x, ben.z); cam.cut = true; }
  function rollOut(n) { audioOn(); n = clamp(n || G.stage, 1, 3); G.stage = n; buildStage(n); Object.assign(G, { board: false, done: null, phase: 'count', count: 3.2, t: 0, pts: 0, tok: 0, coins: 0, swats: 0, batted: 0, hits: 0, home: false, pw: {}, locked: false, bossHits: 0, popT: 0, flash: null }); placeBen(); PAUSE = false;
    const st = STAGES[n - 1]; say('STAGE ' + n + ' · ' + st.name, 3); radio(n === 1 ? 'Out to the red buoy and back. White coming at you: tap 3 and it rolls over the tube. Shark at the buoy, so keep the racket ready.' : n === 2 ? 'Drops, rocks, eddies, and pirates who throw darts. Swing as a dart arrives and it goes back to them. Tap 3 at the lip of a drop for air.' : 'It is slow and it is crowded. The kids have water guns, so duck the spray. The King is in the wave pool.', 'JIB', 8); emit(); }
  function bossStart() { const A = G.ST.arena; G.phase = 'boss'; G.locked = true; const kind = G.stage === 1 ? 'shark' : G.stage === 2 ? 'pirate' : 'king'; G.boss = bossBuild(kind, A); if (kind === 'shark') { G.boss.x = A.x + 8; G.boss.z = A.z + 6; } else { const a = Math.atan2(ben.z - A.z, ben.x - A.x) + Math.PI; G.boss.x = A.x + Math.cos(a) * A.r * 0.6; G.boss.z = A.z + Math.sin(a) * A.r * 0.6; }
    A.fence.material.opacity = 0.9; say('BOSS · ' + STAGES[G.stage - 1].boss, 2.6); audio.tone(110, 0.8, 0.08, 'sawtooth', 1.5);
    radio(kind === 'shark' ? 'Fin! When it turns at you, a red ring shows where it is going. Swing as it gets there and bonk its nose. Or duck and it goes under.' : kind === 'pirate' ? 'That is the RAPIDS PIRATE. Bat his barrels back at him. Five should sink that raft.' : 'The WATER-GUN KING. Bat his balloons back. When he swings the big cannon round, DUCK.', 'JIB', 8); }
  function bossDone() { G.locked = false; G.ST.arena.fence.material.opacity = 0; G.phase = 'run'; if (G.stage === 1) { G.home = true; say('RIDE IT IN', 2.6); radio('Shark gone. Head for the sand. Point the stick at the beach as the white reaches you and you will ride it.', 'JIB', 7); } else finish(); }
  function finish() { const st = STAGES[G.stage - 1], tb = Math.max(0, Math.round((st.target - G.t) * 15)), ab = Math.round(ben.air * 4), total = Math.round(G.pts + tb + ab);
    let nb = false, best = total; try { nb = save.best(TUBE_RUN.bestKey(G.stage), total); best = save.stat(TUBE_RUN.bestKey(G.stage), total); save.setStat(TUBE_RUN.unlockKey, Math.max(save.stat(TUBE_RUN.unlockKey, 1), Math.min(3, G.stage + 1))); if (G.stage === 3) save.setFlag('tubeWon'); save.addGold && save.addGold(Math.round(total / 100)); } catch (e) {}
    const grade = total >= 6500 ? 'S' : total >= 5000 ? 'A' : total >= 3500 ? 'B' : total >= 2200 ? 'C' : 'D';
    G.done = { win: true, stage: G.stage, name: st.name, time: G.t, target: st.target, tok: G.tok, coins: G.coins, swats: G.swats, batted: G.batted, hits: G.hits, air: Math.round(ben.air), pts: Math.round(G.pts), tb, ab, total, grade, newBest: nb, best, gold: Math.round(total / 100), next: G.stage < 3 };
    G.phase = 'done'; audio.tone(660, 0.3, 0.06, 'triangle', 1.5); setTimeout(() => audio.tone(990, 0.4, 0.06, 'triangle', 1.2), 180);
    radio(G.stage === 3 ? 'All three. The tube held. I will put your name on the board under the surf ones.' : 'Through. ' + (G.stage === 1 ? 'The river is next, and the river does not wait for you.' : 'One more, and it is the slow one. Do not let that fool you.'), 'JIB', 8); }
  function popTube() { G.phase = 'pop'; G.popT = 0; say('POPPED!', 2.4); flash('THE TUBE POPPED', '#ec3013'); audio.tone(1400, 0.9, 0.08, 'sawtooth', 0.2); spray(V3(ben.x, ben.y + 0.5, ben.z), 30, 6, 2, 1.2); }

  // ---------- CAMERA ----------
  const VIEWS = ['BEHIND', 'HIGH', 'LOW'];
  const cam = { vi: 0, pos: V3(0, 10, -10), look: V3(0, 0, 10), cut: true, yawOff: 0, pitchOff: 0, drag: false, zoom: 1, dir: V3(0, 0, 1), tp: V3(), tl: V3() };
  function camStep(dt) { const port = CHh() > CW() * 1.05, Z = cam.zoom * (port ? 1.4 : 1), tp = cam.tp, tl = cam.tl;
    if (G.phase === 'ready' || !G.ST) { const s = G.ST ? G.ST.start : { x: 0, z: 0 }, a = TT * 0.08; tp.set(s.x + Math.cos(a) * 30, (G.ST ? levelAt(s.x, s.z) : 0) + 14, s.z + 20 + Math.sin(a) * 30); tl.set(s.x, levelAt(s.x, s.z) + 1, s.z + 20); }
    else { const tv = G.ST.travel(), d = cam.dir; d.x = damp(d.x, tv.x, 2.2, dt); d.z = damp(d.z, tv.z, 2.2, dt); const dl = Math.hypot(d.x, d.z) || 1, fx = d.x / dl, fz = d.z / dl, v = VIEWS[cam.vi];
      const dist = (v === 'HIGH' ? 13 : v === 'LOW' ? 6.5 : 9.5) * Z, hgt = (v === 'HIGH' ? 12 : v === 'LOW' ? 1.7 : 4.6) * Z, by = G.phase === 'pop' ? ben.y : ben.y;
      tp.set(ben.x - fx * dist, by + hgt, ben.z - fz * dist); tl.set(ben.x + fx * 6, by + (v === 'LOW' ? 1.8 : 0.8), ben.z + fz * 6);
      if (G.phase === 'boss' && G.boss) { tl.lerp(V3(G.boss.x, G.boss.y + 1, G.boss.z), 0.25); } }
    if (cam.yawOff || cam.pitchOff) { const dx = tp.x - tl.x, dz = tp.z - tl.z, r = Math.hypot(dx, dz), a = Math.atan2(dx, dz) + cam.yawOff; tp.x = tl.x + Math.sin(a) * r; tp.z = tl.z + Math.cos(a) * r; tp.y += cam.pitchOff * r; }
    if (!cam.drag) { cam.yawOff = damp(cam.yawOff, 0, 3, dt); cam.pitchOff = damp(cam.pitchOff, 0, 3, dt); }
    if (cam.cut) { cam.pos.copy(tp); cam.look.copy(tl); cam.cut = false; } else { cam.pos.lerp(tp, Math.min(1, dt * 4)); cam.look.lerp(tl, Math.min(1, dt * 6)); }
    cam.pos.y = Math.max(cam.pos.y, levelAt(cam.pos.x, cam.pos.z) + 0.9); camera.position.copy(cam.pos); camera.lookAt(cam.look); camera.fov = damp(camera.fov, port ? 64 : 58, 4, dt); camera.updateProjectionMatrix();
    sun.position.set(cam.look.x + 20, cam.look.y + 40, cam.look.z - 30); sun.target.position.copy(cam.look); }
  const stickWorld = (sx, sy) => { const fx = cam.look.x - cam.pos.x, fz = cam.look.z - cam.pos.z, l = Math.hypot(fx, fz) || 1, ux = fx / l, uz = fz / l; return { x: ux * sy - uz * sx, z: uz * sy + ux * sx }; };

  // ---------- INPUT ----------
  const keys = new Set(), STK = { x: 0, y: 0 }; let PAUSE = false;
  const kx = () => (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0), ky = () => (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
  const onKD = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if (keys.has(e.code)) return; keys.add(e.code); if (e.code === 'Digit1' || e.code === 'KeyJ') press(1); if (e.code === 'Digit2' || e.code === 'KeyK') press(2); if (e.code === 'Space') { e.preventDefault(); press(3); } };
  const onKU = e => keys.delete(e.code); addEventListener('keydown', onKD); addEventListener('keyup', onKU);
  function press(n) { audioOn(); if (G.board || PAUSE || !(G.phase === 'run' || G.phase === 'boss')) return; const sx = STK.x + kx(), sy = STK.y + ky(), w = stickWorld(sx, sy);
    if (n === 1) { if (TK.swing(ben)) { audio.burst(0.12, 2600, 0.06); G.swingPend = 0.06; } }
    else if (n === 2) { if (TK.dash(ben, w.x, w.z)) { audio.burst(0.3, 1400, 0.12); spray(V3(ben.x, ben.y + 0.2, ben.z), 10, 3, 1.2, 0.6); } }
    else { const PA = G.ST.PA, s = G.loc ? G.loc.s : 0, nearDrop = PA && PA.drops.some(d => d.s - s > -1 && d.s - s < 7); if (nearDrop && ben.mode === 'water') { ben.hopReq = 0.7; say('HOP', 0.8); } else if (TK.duck(ben)) { audio.burst(0.4, 600, 0.14); spray(V3(ben.x, ben.y + 0.4, ben.z), 12, 3, 1.2, 0.7); } } }
  function useItem(id) { if (!(G.phase === 'run' || G.phase === 'boss')) return 'Save it for the water'; const full = ['patchKit', 'repairKit'].includes(id), add = full ? 100 : { erToGo: 30, healingCharges: 30, splint: 50, amber: 20 }[id];
    if (id === 'energyPod') { try { save.take(id); } catch (e) {} ben.dashCd = 0; flash('DASH RECHARGED', '#38bdf8'); return; }
    if (!add) { flash('SAVE IT FOR THE BEACH', '#ffffff'); return; } if (ben.air >= TUBE.AIR) { flash('AIR IS FULL', '#ffffff'); return; } try { save.take(id); } catch (e) {} ben.air = Math.min(TUBE.AIR, ben.air + add); flash('PATCHED · AIR ' + Math.round(ben.air), '#5ec97e'); audio.tone(700, 0.3, 0.05, 'triangle', 1.6); }

  // ---------- MAIN STEP ----------
  let TT = 0;
  function itemsStep(dt) { const c = chest(), mag = G.pw.mag > 0;
    for (const it of items) { if (!it.on) continue; const base = G.stage === 1 ? 0 : 0; const y = it.y + base + Math.sin(TT * 3 + it.x) * 0.12; it.g.position.set(it.x, y, it.z); if (it.kind === 'tok' || it.kind === 'coin') it.g.rotation.y += dt * (it.kind === 'tok' ? 3 : 5);
      const d = Math.hypot(c.x - it.x, c.y - y, c.z - it.z); if (mag && (it.kind === 'coin' || it.kind === 'tok') && d < 12) { it.x = lerp(it.x, c.x, dt * 4); it.z = lerp(it.z, c.z, dt * 4); it.y = lerp(it.y, c.y, dt * 4); }
      if (d < (it.kind === 'tok' ? 2.4 : 1.9)) { it.on = false; it.g.visible = false;
        if (it.kind === 'tok') { G.tok++; award('TOKEN ' + G.tok + ' / 8', 60, '#e6b45a'); spray(V3(it.x, y, it.z), 8, 3, 1, 0.6, 0xffd23a); if (G.tok === 8) setTimeout(() => award('ALL 8 TOKENS', 400, '#e6b45a'), 500); }
        else if (it.kind === 'coin') { G.coins++; G.pts += 25 * (G.pw.x2 > 0 ? 2 : 1); audio.tone(1500 + (G.coins % 6) * 120, 0.08, 0.04, 'triangle', 1.3); spray(V3(it.x, y, it.z), 3, 2, 0.6, 0.4, 0xffd23a); if (G.coins % 6 === 0) flash('COIN SPREE +' + 150 * (G.pw.x2 > 0 ? 2 : 1), '#e6b45a'); }
        else if (it.kind === 'patch') { ben.air = Math.min(TUBE.AIR, ben.air + 40); flash('PATCH KIT · AIR +40', '#5ec97e'); audio.tone(700, 0.3, 0.05, 'triangle', 1.6); }
        else { flash(PW[it.k][2], PW[it.k][1]); audio.tone(520, 0.4, 0.06, 'square', 2.4); if (it.k === 'x2') G.pw.x2 = 8; if (it.k === 'mag') G.pw.mag = 8; if (it.k === 'pump') { G.pw.pump = 6; ben.air = Math.min(TUBE.AIR, ben.air + 30); } } } } }
  function step(dt) { TT += dt;
    const ST = G.ST; if (!ST) return;
    if (ST.update) ST.update(dt);
    for (const b of ST.bobs) { if (b.userData.spin) { b.rotation.z += dt * 1.6; continue; } b.position.y = levelAt(b.position.x, b.position.z); b.rotation.z = Math.sin(TT * 1.7 + b.position.z) * 0.1; }
    for (const s of signs) { const on = s.blink(); s.sp.material.map = on && Math.sin(TT * 10) > 0 ? s.b : s.a; }
    for (const e of ents) entStep(e, dt);
    if (G.phase === 'count') { G.count -= dt; if (G.count <= 0) { G.phase = 'run'; say('GO!', 1.2); audio.tone(990, 0.3, 0.08, 'square', 1.2); } else if (Math.ceil(G.count) !== Math.ceil(G.count + dt)) audio.tone(520, 0.15, 0.06, 'square', 1); }
    const live = G.phase === 'run' || G.phase === 'boss';
    if (live) G.t += dt;
    for (const k in G.pw) G.pw[k] = Math.max(0, G.pw[k] - dt); ben.shield = G.pw.pump || 0;
    if (G.phase !== 'pop') { const sx = live ? STK.x + kx() : 0, sy = live ? STK.y + ky() : 0, w = stickWorld(sx, sy), m = Math.min(1, Math.hypot(w.x, w.z)), fl = flowAt(ben.x, ben.z);
      TK.step(ben, dt, { ax: w.x * (m > 0 ? m / Math.hypot(w.x, w.z) : 0), az: w.z * (m > 0 ? m / Math.hypot(w.x, w.z) : 0), fx: G.phase === 'count' ? 0 : fl.x, fz: G.phase === 'count' ? 0 : fl.z, level: levelAt(ben.x, ben.z) });
      if (G.phase === 'count') { ben.vx = ben.vz = 0; const s = ST.start; ben.x = s.x; ben.z = s.z; }
      ST.bound(); ben.lvl = levelAt(ben.x, ben.z);
      if (ben.landed) { if (ben.hopped) award('BIG AIR', 120 + Math.round(ben.landed * 12), '#7dd3fc'); else flash('SPLASH', '#ffffff'); spray(V3(ben.x, ben.y, ben.z), 18, 5, 1.6, 0.9); audio.burst(0.4, 800, 0.16); ben.landed = 0; ben.hopped = false; }
      if (G.swingPend != null) { G.swingPend -= dt; if (G.swingPend <= 0) { G.swingPend = null; const h = swatCheck() + batCheck(); if (!h) audio.tone(400, 0.06, 0.02, 'triangle', 1.2); } } else if (TK.swingLive(ben) && ben.swingT > TUBE.SWING_T * 0.4) batCheck();
      if (ben.paddle > 0.3 && Math.random() < 0.25) spray(V3(ben.x + Math.cos(ben.yaw) * ben.R * 1.2 * (Math.random() < 0.5 ? -1 : 1), ben.y + 0.1, ben.z - Math.sin(ben.yaw) * ben.R), 1, 1.4, 0.6, 0.4); }
    TK.pose(ben, dt, TT);
    if (G.phase === 'pop') { G.popT += dt; const k = Math.max(0.05, 1 - G.popT * 1.5); ben.ring.scale.set(1, k, 1); ben.y = levelAt(ben.x, ben.z) - Math.min(1, G.popT) * ben.h * 0.4; ben.root.position.y = ben.y; if (G.popT > 2.2) { const st = STAGES[G.stage - 1]; G.done = { win: false, stage: G.stage, name: st.name, time: G.t, target: st.target, tok: G.tok, coins: G.coins, swats: G.swats, batted: G.batted, hits: G.hits, air: 0, pts: Math.round(G.pts), tb: 0, ab: 0, total: Math.round(G.pts), grade: '-', newBest: false, best: save.stat ? save.stat(TUBE_RUN.bestKey(G.stage), 0) : 0, next: false }; G.phase = 'done'; } }
    else ben.ring.scale.set(1, 1, 1);
    if (live) { itemsStep(dt); projStep(dt);
      if (G.phase === 'run' && !G.home && ST.arena && !(G.boss && G.boss.st === 'beaten') && Math.hypot(ben.x - ST.arena.x, ben.z - ST.arena.z) < ST.arena.r - 2 && !ST.bossDone) { ST.bossDone = true; bossStart(); }
      if (ST.finished()) finish(); if (ben.air <= 0 && G.phase !== 'done') popTube(); }
    if (G.boss) bossStep(G.boss, dt);
    if (G.stage === 1 || (G.ST && G.ST.n === 1)) { kit.animFox(jib, dt, 0, false); } else kit.animFox(jib, dt, 0, false);
    fxStep(dt);
    G.bannerT = Math.max(0, G.bannerT - dt); if (G.bannerT <= 0) G.banner = ''; G.radioT = Math.max(0, G.radioT - dt); if (G.radioT <= 0) G.radio = ''; G.flashT = Math.max(0, G.flashT - dt); if (G.flashT <= 0) G.flash = null;
    camStep(dt); }
  let last = performance.now(), raf = 0, hudT = 0, miniC = null, miniT = 0;
  function frame(now) { raf = requestAnimationFrame(frame); const rdt = Math.min(0.05, (now - last) / 1000); last = now; if (!PAUSE) step(rdt); renderer.render(scene, camera); hudT -= rdt; if (hudT <= 0) { hudT = 0.1; emit(); } miniT -= rdt; if (miniT <= 0 && miniC) { miniT = 0.25; drawMini(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  let audioReady = false; function audioOn() { if (audioReady) return; audioReady = true; try { audio.init(); } catch (e) {} }

  // ---------- HUD ----------
  const _pv = V3();
  const fmtT = t => { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };
  function hud() { const st = STAGES[G.stage - 1], live = G.phase === 'run' || G.phase === 'boss';
    let goal = null; if (live && G.ST && G.phase !== 'boss') { const gq = G.ST.goal(), dd = Math.hypot(ben.x - gq.x, ben.z - gq.z); if (dd > 10) { _pv.set(gq.x, levelAt(gq.x, gq.z) + 1, gq.z).project(camera); goal = { nx: _pv.x, ny: _pv.y, behind: _pv.z > 1, label: gq.label, dist: Math.round(dd) }; } }
    let unlocked = 1; try { unlocked = save.stat(TUBE_RUN.unlockKey, 1); } catch (e) {}
    const bests = [1, 2, 3].map(n => { try { return save.stat(TUBE_RUN.bestKey(n), 0); } catch (e) { return 0; } });
    return { state: G.phase === 'ready' ? 'ready' : 'run', phase: G.phase, board: G.board, done: G.done, stage: G.stage, stageName: st.name, target: st.target, time: fmtT(G.t), tSec: G.t, over: G.t > st.target,
      air: Math.round(ben.air), shield: ben.shield > 0, tok: G.tok, coins: G.coins, pts: Math.round(G.pts), banner: G.banner, radio: G.radio, radioWho: G.radioWho, flash: G.flash, count: G.phase === 'count' ? Math.ceil(G.count) : null,
      boss: G.boss && G.phase === 'boss' ? { name: st.boss, hp: G.boss.hp, max: G.boss.max } : null, view: VIEWS[cam.vi], pw: Object.keys(G.pw).filter(k => G.pw[k] > 0)[0] || null, goal, unlocked, bests, dash: ben.dashCd > 0 ? 1 - ben.dashCd / TUBE.DASH_CD : 1, duckReady: ben.duckCd <= 0,
      quest: G.phase === 'boss' ? 'Beat the ' + st.boss : G.home ? 'Ride the whitewater back to the beach' : st.line }; }
  function emit() { onState({ course: hud() }); }
  function drawMini() { const c = miniC; if (!c.isConnected) { miniC = null; return; } const dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr); if (!w || !h || !G.ST) return; if (c.width !== w) c.width = w; if (c.height !== h) c.height = h;
    const x = c.getContext('2d'), pts = G.ST.PA ? G.ST.PA.S.map(p => [p.x, p.z]) : [[0, 0], [0, 170]], A = G.ST.arena; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const [px, pz] of [...pts, [A.x - A.r, A.z - A.r], [A.x + A.r, A.z + A.r]]) { x0 = Math.min(x0, px); x1 = Math.max(x1, px); z0 = Math.min(z0, pz); z1 = Math.max(z1, pz); }
    const k = Math.min(w / (x1 - x0 + 40), h / (z1 - z0 + 40)), X = px => w / 2 - (px - (x0 + x1) / 2) * k, Y = pz => h / 2 - (pz - (z0 + z1) / 2) * k;
    x.fillStyle = G.stage === 1 ? '#0c6a93' : '#5c9a43'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3cc4d6'; x.lineWidth = (G.stage === 1 ? 60 : 14) * k; x.lineCap = 'round'; x.beginPath(); pts.forEach(([px, pz], i) => i ? x.lineTo(X(px), Y(pz)) : x.moveTo(X(px), Y(pz))); x.stroke();
    x.fillStyle = '#3cc4d6'; x.beginPath(); x.arc(X(A.x), Y(A.z), A.r * k, 0, 7); x.fill(); x.strokeStyle = '#ffd23a'; x.lineWidth = 2 * dpr; x.stroke();
    for (const e of ents) if (!e.dead && !e.gone && e.kind !== 'tuber') { x.fillStyle = '#ec3013'; x.fillRect(X(e.x) - 2 * dpr, Y(e.z) - 2 * dpr, 4 * dpr, 4 * dpr); }
    for (const it of items) if (it.on && it.kind === 'tok') { x.fillStyle = '#e6b45a'; x.beginPath(); x.arc(X(it.x), Y(it.z), 3 * dpr, 0, 7); x.fill(); }
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(X(ben.x), Y(ben.z), 5 * dpr, 0, 7); x.fill(); x.fillStyle = '#ec3013'; x.beginPath(); x.arc(X(ben.x), Y(ben.z), 3 * dpr, 0, 7); x.fill(); }

  // ---------- JIB'S HEAT SHEET (chalkboard) ----------
  function drawBoard(g, P) { const W0 = P ? 900 : 1600, H0 = P ? 1600 : 900, J = (n = 1.6) => (Math.random() - 0.5) * n * 2;
    g.fillStyle = '#7a4f2a'; g.fillRect(0, 0, W0, H0); const x0 = 34, y0 = 34, w = W0 - 68, h = H0 - 98; g.fillStyle = '#1f2b27'; g.fillRect(x0, y0, w, h);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.beginPath(); g.ellipse(x0 + Math.random() * w, y0 + Math.random() * h, 60 + Math.random() * 200, 20 + Math.random() * 60, Math.random() * 3, 0, 7); g.fill(); }
    const CH = '#f2f1e8', YL = '#f5e08a', RD = '#ff9a8a', BLU = '#9fd8f5', HF = '"Caveat", "Segoe Print", "Bradley Hand", cursive';
    const txt = (s, x, y, size, col = CH, wt = 800, fam = 'Archivo, sans-serif') => { g.font = `${wt} ${size}px ${fam}`; g.fillStyle = col; g.globalAlpha = 0.92; g.fillText(s, x, y); g.globalAlpha = 0.28; g.fillText(s, x + 1.6, y - 1.2); g.globalAlpha = 1; };
    const ln = (pts, col = CH, wd = 5) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.globalAlpha = 0.9; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + J(), y + J()) : g.moveTo(x + J(), y + J())); g.stroke(); g.globalAlpha = 1; };
    const fit = (s, size, maxW, wt = 800, fam = 'Archivo, sans-serif') => { g.font = `${wt} ${size}px ${fam}`; const tw = g.measureText(s).width; return tw > maxW ? Math.floor(size * maxW / tw) : size; };
    const L = 86, T1 = 'INNER TUBE'; txt(T1, L, 160, fit(T1, 120, W0 - 2 * L, 900), CH, 900); txt("JIDDA  ·  JIB'S SURF SHOP  ·  AGAINST THE CLOCK", L + 4, 214, fit("JIDDA  ·  JIB'S SURF SHOP  ·  AGAINST THE CLOCK", 30, W0 - 2 * L), YL); ln([[L, 238], [W0 - L, 234]], CH, 4);
    const rows = [['STICK', 'WASD', 'Paddle with your arms', CH], ['1', 'J', 'Racket: swat, and bat back darts, barrels, balloons', RD], ['2', 'K', 'Dash: a hard double stroke', BLU], ['3', 'SPACE', 'Duck under it · hop at the lip of a drop', YL], ['4', 'ITEM', 'Patch kit: air back up', '#a8e6a1']];
    const colW = P ? W0 - 2 * L : 760, ry0 = P ? 330 : 320, rh = P ? 112 : 100;
    rows.forEach(([k, kb, d, col], i) => { const y = ry0 + i * rh, cx = L + 34, cy = y - 14; g.globalAlpha = 0.9; g.strokeStyle = col; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, 30, 0, 7); g.stroke(); g.globalAlpha = 1; g.font = `900 ${k.length > 1 ? 18 : 32}px Archivo, sans-serif`; g.textAlign = 'center'; g.fillStyle = CH; g.fillText(k, cx, cy + (k.length > 1 ? 7 : 11)); g.textAlign = 'left'; txt(kb, cx + 60, y - 24, 18, '#b9c4bf', 800); txt(d, cx + 60, y + 6, fit(d, 30, colW - 100, 700), CH, 700); });
    const sx = P ? L : 900, sy = P ? ry0 + 5 * rh + 30 : 300, sw = P ? W0 - 2 * L : W0 - 900 - L;
    txt('THREE STAGES · A BOSS EACH', sx, sy, fit('THREE STAGES · A BOSS EACH', 30, sw), YL);
    STAGES.forEach((s, i) => { const y = sy + 70 + i * (P ? 120 : 110); txt(String(s.n), sx, y + 10, 56, i === 0 ? BLU : i === 1 ? RD : YL, 900); txt(s.name, sx + 60, y - 6, fit(s.name, 34, sw - 60, 900), CH, 900); g.font = `700 32px ${HF}`; txt('BOSS · ' + s.boss, sx + 60, y + 32, fit('BOSS · ' + s.boss, 32, sw - 60, 700, HF), RD, 700, HF); });
    { const s = 'Grab the 8 tokens · keep your air · beat the clock'; const sz = fit(s.toUpperCase(), 44, W0 - 2 * L, 700, HF); txt(s.toUpperCase(), L, H0 - 110, sz, YL, 700, HF); }
    g.fillStyle = '#5e3c1f'; g.fillRect(0, H0 - 64, W0, 64); g.fillStyle = '#7a4f2a'; g.fillRect(0, H0 - 64, W0, 10); for (let k = 0; k < 4; k++) { g.fillStyle = ['#f2f1e8', '#f5e08a', '#ff9a8a', '#9fd8f5'][k]; g.fillRect(260 + k * 120, H0 - 48, 70, 16); }
    for (let i = 0; i < 4000; i++) { g.fillStyle = 'rgba(31,43,39,0.55)'; g.fillRect(x0 + Math.random() * w, y0 + Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
  const boardCv = document.createElement('canvas'); boardCv.width = 1600; boardCv.height = 900; const boardCvP = document.createElement('canvas'); boardCvP.width = 900; boardCvP.height = 1600;
  const paintBoards = () => { drawBoard(boardCv.getContext('2d')); drawBoard(boardCvP.getContext('2d'), true); course.boardURL = boardCv.toDataURL('image/jpeg', 0.9); course.boardURLP = boardCvP.toDataURL('image/jpeg', 0.9); emit(); };
  try { if (!document.getElementById('font-caveat')) { const lk = document.createElement('link'); lk.id = 'font-caveat'; lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap'; document.head.appendChild(lk); } } catch (e) {}

  // ---------- API (Game HUD engine contract + the page's course hooks) ----------
  const course = { boardURL: '', boardURLP: '', hud, say, rollOut, useItem,
    openBoard() { G.board = true; PAUSE = true; if (G.phase === 'done') G.done = null; emit(); }, closeBoard() { G.board = false; PAUSE = false; emit(); }, preview(n) { if (G.phase === 'ready') { G.stage = n; buildStage(n); placeBen(); emit(); } },
    _skipTo(k) { if (k === 'boss') { const A = G.ST.arena; ben.x = A.x; ben.z = A.z - A.r + 4; ben.vx = ben.vz = 0; G.loc = G.ST.PA ? locate(G.ST.PA, ben.x, ben.z) : null; cam.cut = true; } if (k === 'home') { G.home = true; ben.z = 30; } },
    _beat() { if (G.boss) { G.boss.hp = 1; bossHit(G.boss, 'x'); } }, _air(n) { ben.air = n; }, _dbg: () => ({ phase: G.phase, x: ben.x, z: ben.z, y: ben.y, air: ben.air, s: G.loc && G.loc.s, ents: ents.length, items: items.length, boss: G.boss && { st: G.boss.st, hp: G.boss.hp } }) };
  const api = { course: () => course,
    start() { rollOut(G.stage); }, talk() {}, choose() {}, closeDialog() {}, nextLine() {}, clearToast() {}, closeWheel() {}, skipTime() {}, cycleWeather() {}, useItem, setHudPad() {},
    toggleSound() { audio.setMuted(!audio.muted); return audio.muted; },
    melee() { press(1); }, range() { press(2); }, jump() { press(3); },
    setPaused(v) { PAUSE = !!v || G.board; }, setStick(x, y) { STK.x = x; STK.y = y; },
    eyeLook(dx, dy) { cam.drag = true; cam.yawOff -= dx * 0.006; cam.pitchOff = clamp(cam.pitchOff - dy * 0.004, -0.4, 0.9); }, eyeRelease() { cam.drag = false; }, togglePov() { cam.vi = (cam.vi + 1) % VIEWS.length; flash('VIEW · ' + VIEWS[cam.vi], '#ffffff'); return cam.vi !== 0; },
    lookBy(dx, dy) { api.eyeLook(dx, dy); }, zoomBy(k) { cam.zoom = clamp(cam.zoom * k, 0.6, 1.8); }, getCam() { return { dist: cam.zoom * 10, pitch: cam.pitchOff }; }, setCam(d, p) { if (d != null) cam.zoom = clamp(d / 10, 0.6, 1.8); if (p != null) cam.pitchOff = p; },
    mapData() { return { p: [ben.x, ben.z, ben.yaw], indoor: false, b: [], f: [], e: ents.filter(e => !e.dead && !e.gone && e.kind !== 'tuber').map(e => [e.x, e.z]), q: null }; }, setMinimap(c) { miniC = c || null; },
    reset() {}, _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); emit(); },
    destroy() { cancelAnimationFrame(raf); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('resize', onRs); ro.disconnect(); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  buildStage(1); placeBen(); G.phase = 'ready';
  setTimeout(paintBoards, 30); setTimeout(paintBoards, 1400);
  raf = requestAnimationFrame(frame);
  return api;
}
