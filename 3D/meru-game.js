import * as THREE from './vendor/three/three.module.js';
import { rnd, rr, pick, clamp, smooth, lerp, damp, vnoise, fbm, paletteAt, makeGradient, glowTexture, dotTexture, Ambience } from './village-game.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE, KING_MIGHT } from './fox-kit.js';
import { canvasTex, FONT, emblemTex, crestTex, signTex, bannerTex, cobbleTex, plazaTex, asphaltTex } from './engine/textures.js';
import { CP, IN, RU, CV, LK, AP, SH, LN, FT, BG, MW, S, MH, AX, AZ, SRC_Y, toArt, BUILDINGS, ARENA_C, EXITS, FOXES, DIALOGUE, PAVED, inPaved, outsideDist, heightAt, ZONES, INTERIORS, zoneAt, QUEST, TALK } from './worlds/meru.js';
import { save } from './engine/save.js';
import { createWorldKit, phoneBudget } from './engine/meru-kit.js';
import { createBuildingKit } from './engine/building-kit.js';
import { Conversation, questBanner, branch, treeFromLinear } from './engine/story.js';
import { createCombat } from './engine/combat.js';

// ---------- main ----------
export async function createGame({ container, minimap, options = {}, onState = () => {}, onNavigate = () => {}, onPlayGame = () => {} }) {
  const opts = { timeScale: 2, startHour: 19.5, outlines: true, quality: 'high', followCam: true, ...options };
  const WALK = await (await fetch(new URL('./meru-town-walk.json', import.meta.url))).json();
  CP.setWalk(await (await fetch(new URL('./worlds/meru-castlepath-walk.json', import.meta.url))).json());
  { const [a, b] = await Promise.all(['./worlds/meruruins-walk.json', './worlds/merudesert-walk.json'].map(async p => (await fetch(new URL(p, import.meta.url))).json())); RU.setWalk(a, b); { const lnD = await (await fetch(new URL('./worlds/meru-lanes-dialogue.json', import.meta.url))).json(); Object.assign(DIALOGUE, lnD); for (const k in lnD) TALK[k] = treeFromLinear(lnD[k]); } { const apD = await (await fetch(new URL('./worlds/meru-arenapath-dialogue.json', import.meta.url))).json(); AP.setDialogue(apD); Object.assign(DIALOGUE, apD); for (const k in apD) TALK[k] = treeFromLinear(apD[k]); } LK.setWater(await (await fetch(new URL('./worlds/merulake-water.json', import.meta.url))).json()); }
  const mapImg = new Image(); mapImg.src = new URL('./meru-town-map.png', import.meta.url).href;
  try { await document.fonts.load(`900 40px Archivo`); } catch (e) {}

  const BOAT = { on: false };
  function walkableAt(X, Z) {
    const [ax, ay] = toArt(X, Z), sy = ay / SRC_Y;
    if (ay > 1620 && LK.inZone(ax, ay)) return BOAT.on ? LK.boatable(ax, ay) : LK.walkable(ax, ay);
    if (BOAT.on) return false;
    if (ax < 0 && RU.inZone(ax, ay)) return RU.walkable(ax, ay);
    if (ay < 0 && CP.inZone(ax, ay)) return CP.walkable(ax, ay);
    if (AP.inZone(X, Z)) return X < 95;
    if (ax < 0 || ax > 2879 || sy < 0 || sy > 2879) return false;
    let lo = 0, hi = WALK.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (WALK[m].y <= sy) lo = m; else hi = m - 1; }
    for (const [a, b] of WALK[lo].s) if (ax >= a && ax <= b) return true; return false;
  }

  const K = createWorldKit({ container, opts });
  const { W, H, renderer, scene, camera, grad, glowTex, dotTex, toon, outlineMat, addOutline, M, BOX, glowMats, glowing, flames, glows, pointLights, glowSprite, hemi, sun, skyU, sky, starMat, stars } = K;

  // terrain
  const tg = new THREE.PlaneGeometry(480, 280, 300, 180); tg.rotateX(-Math.PI / 2); tg.translate(-70, 0, 0); const SAND1 = new THREE.Color('#e3c690'), SAND2 = new THREE.Color('#d2ad74');
  const pos = tg.attributes.position, cols = new Float32Array(pos.count * 3), tc = new THREE.Color();
  const G1 = new THREE.Color('#6aa64e'), G2 = new THREE.Color('#4f8d45'), G3 = new THREE.Color('#3b7343'), RK = new THREE.Color('#a9a390');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = heightAt(x, z); pos.setY(i, h);
    tc.copy(G1).lerp(G2, smooth(0.35, 0.65, fbm(x * 0.07 + 9, z * 0.07))).lerp(G3, smooth(4, 14, h)).lerp(RK, smooth(18, 30, h));
    { const sd = RU.sandAt(x, z); if (sd > 0) tc.lerp(SAND2.clone().lerp(SAND1, smooth(0.3, 0.7, fbm(x * 0.05, z * 0.05))), sd * (1 - smooth(10, 26, h) * 0.6)); }
    cols.set([tc.r, tc.g, tc.b], i * 3);
  }
  tg.setAttribute('color', new THREE.BufferAttribute(cols, 3)); tg.computeVertexNormals();
  const terrain = new THREE.Mesh(tg, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad })); terrain.receiveShadow = terrain.castShadow = true; scene.add(terrain);

  // paving
  const slab = (x0, x1, y0, y1, mat, top, rep) => { const w = (x1 - x0) * S, d = (y1 - y0) * S; const m = new THREE.Mesh(BOX(w, top, d), mat); m.position.set(AX((x0 + x1) / 2), top / 2, AZ((y0 + y1) / 2)); m.receiveShadow = true; scene.add(m); return m; };
  const plazaM = new THREE.MeshToonMaterial({ map: plazaTex([1, 1]), gradientMap: grad });
  plazaM.map.repeat.set(2220 / 360, 760 / 360); slab(330, 2550, 430, 1190, plazaM, 0.06);
  const plazaM2 = plazaM.clone(); plazaM2.map = plazaM.map.clone(); plazaM2.map.repeat.set(2120 / 360, 280 / 360); plazaM2.map.needsUpdate = true; slab(430, 2550, 1190, 1470, plazaM2, 0.06);
  const asph = (x0, x1, y0, y1) => { const m = new THREE.MeshToonMaterial({ map: asphaltTex([(x1 - x0) / 240, (y1 - y0) / 240]), gradientMap: grad }); return slab(x0, x1, y0, y1, m, 0.09); };
  asph(364, 2516, 750, 870); asph(1380, 1500, 460, 1160);
  const cob = (x0, x1, y0, y1) => { const m = new THREE.MeshToonMaterial({ map: cobbleTex([(x1 - x0) / 150, (y1 - y0) / 150]), gradientMap: grad }); return slab(x0, x1, y0, y1, m, 0.07); };
  cob(1290, 1590, -40, 430); cob(1290, 1590, 1190, 1640); cob(-1100, 330, 660, 960); cob(2550, 4760, 660, 960);
  const laneMark = toon('#e7e3f2');
  for (const [ax, ay] of [[436, 810], [1060, 810], [1820, 810], [2440, 810], [1440, 540], [1440, 1100]]) { const d = new THREE.Mesh(BOX(0.5, 0.02, 0.5), laneMark); d.rotation.y = Math.PI / 4; d.position.set(AX(ax), 0.1, AZ(ay)); scene.add(d); }
  const emb = emblemTex();
  const medallion = (ax, ay, r) => { const g = new THREE.Group(); g.position.set(AX(ax), 0, AZ(ay)); scene.add(g); M(new THREE.CylinderGeometry(r, r, 0.14, 48), toon('#c42d3c'), 0, 0.07, 0, g, 0); const top = new THREE.Mesh(new THREE.CircleGeometry(r * 0.98, 48), new THREE.MeshToonMaterial({ map: emb, gradientMap: grad, emissive: 0xffffff, emissiveMap: emb, emissiveIntensity: 0 })); glowMats.push({ m: top.material, k: 0.35 }); top.rotation.x = -Math.PI / 2; top.position.y = 0.145; top.receiveShadow = true; g.add(top); };
  medallion(1440, 810, 110 * S); medallion(1440, 214, 76 * S); medallion(1440, 1400, 76 * S); medallion(164, 810, 76 * S); medallion(2716, 810, 76 * S);

  // ---------- buildings ----------
  const colliders = [], camBlockers = [], camRay = new THREE.Raycaster(), camDir = new THREE.Vector3(), camFrom = new THREE.Vector3();
  const NAVY = '#1f2650', GOLD = toon('#e0a84a'), DARK = toon('#1b1830'), WOOD = toon('#6b4a35'), STEEL = toon('#8a94a8'), WHITE = toon('#f2f0ea');
  const bannerT = bannerTex(), bannerM = new THREE.MeshToonMaterial({ map: bannerT, gradientMap: grad, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  const banner = (g, x, y, z) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.8), bannerM); p.position.set(x, y, z); p.castShadow = true; g.add(p); M(BOX(1.05, 0.08, 0.08), GOLD, x, y + 0.92, z, g, 0); };
  const sign = (g, text, glyph, w, y, z, accent) => { const t = signTex(text, glyph, accent); const m = M(BOX(w, w / 4, 0.18), [DARK, DARK, DARK, DARK, glowing(0, t, 1.3), DARK], 0, y, z, g, 0.04); return m; };
  const windowM = glowing('#ffb85a', null, 1.5), lampM = glowing('#ffd38a', null, 2.2), crystalM = glowing('#58d8ff', null, 1.8), neonM = glowing('#9fe6ff', null, 1.4);
  const bulbs = (g, w, h, y, z) => { const n = Math.floor(w / 0.32); for (let i = 0; i <= n; i++) for (const yy of [y - h / 2 - 0.12, y + h / 2 + 0.12]) M(new THREE.SphereGeometry(0.07, 6, 4), lampM, -w / 2 + i * w / n, yy, z, g, 0); };
  function prism(w, h, d) { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; }
  const BLD = [];
  function place(b) {
    const g = new THREE.Group(); const cx = b.r ? b.cx : (b.x0 + b.x1) / 2, cy = b.r ? b.cy : (b.y0 + b.y1) / 2;
    g.position.set(AX(cx), 0, AZ(cy)); if (b.face === 'N') g.rotation.y = Math.PI; scene.add(g); camBlockers.push(g);
    const w = b.r ? 0 : (b.x1 - b.x0) * S, d = b.r ? 0 : (b.y1 - b.y0) * S;
    const dx = (b.door - cx) * S * (b.face === 'S' ? 1 : -1);
    if (!b.r) colliders.push({ box: [AX(b.x0), AX(b.x1), AZ(b.y0), AZ(b.y1)] });
    const rec = { g, w, d, dx, f: d / 2, b }; BLD.push(rec); return rec;
  }
  // casino
  { const { g, w, d, dx, f } = place(BUILDINGS[0]); const h = 6.5;
    M(BOX(w, h, d), toon(NAVY), 0, h / 2, 0, g, 0.06);
    for (const [x, z, ww, dd] of [[0, d / 2, w + 0.3, 0.3], [0, -d / 2, w + 0.3, 0.3], [w / 2, 0, 0.3, d], [-w / 2, 0, 0.3, d]]) M(BOX(ww, 0.6, dd), GOLD, x, h + 0.3, z, g, 0.03);
    M(BOX(w - 1, 0.1, d - 1), toon('#2a3266'), 0, h + 0.05, 0, g, 0); M(BOX(0.12, 0.12, d - 1.2), GOLD, 0, h + 0.12, 0, g, 0); M(BOX(w - 1.2, 0.12, 0.12), GOLD, 0, h + 0.12, -d * 0.1, g, 0);
    const dia = M(new THREE.OctahedronGeometry(1.1, 0), glowing('#f0a830', null, 1.2), -w * 0.33, h + 1.6, -d * 0.25, g, 0.05); dia.scale.set(1, 1.2, 0.35); dia.userData.spin = 1; flames.push({ spin: dia });
    sign(g, 'CASINO', (c, x, y, a) => { c.fillStyle = '#f6e7c8'; c.beginPath(); c.roundRect(x, y - 24, 48, 48, 8); c.fill(); c.fillStyle = '#141a33'; [[14, 14], [34, 34], [24, 24]].forEach(([u, v]) => { c.beginPath(); c.arc(x + u, y - 24 + v, 5, 0, 7); c.fill(); }); c.fillStyle = a; c.beginPath(); c.arc(x + 80, y, 16, 0, 7); c.fill(); }, 6, 3.5, f + 0.12);
    bulbs(g, 6, 1.5, 3.5, f + 0.24);
    M(BOX(2.6, 2.4, 0.2), glowing('#ffcf7a', null, 1.1), dx, 1.2, f + 0.05, g, 0.04); M(BOX(0.12, 2.4, 0.26), GOLD, dx, 1.2, f + 0.08, g, 0);
    M(BOX(3.2, 0.04, 1.6), toon('#c0283a'), dx, 0.09, f + 1.0, g, 0);
    banner(g, -w / 2 + 1.2, 3.6, f + 0.06); banner(g, -w / 2 + 2.4, 3.6, f + 0.06);
    for (const sx of [-1, 1]) { M(BOX(0.9, 0.6, 0.9), toon('#3a2e40'), dx + sx * 2.2, 0.3, f + 0.6, g, 0.03); M(new THREE.IcosahedronGeometry(0.5, 1), toon('#3f8a46'), dx + sx * 2.2, 0.95, f + 0.6, g, 0.03, 0.5); }
  }
  // tavern
  { const { g, w, d, dx, f } = place(BUILDINGS[1]); const h = 4.6;
    M(BOX(w, h, d), toon('#5a3d2c'), 0, h / 2, 0, g, 0.06);
    for (let i = 0; i <= 6; i++) M(BOX(0.22, h, 0.22), toon('#2e2018'), -w / 2 + i * w / 6, h / 2, f + 0.02, g, 0);
    M(BOX(w + 0.2, 0.25, 0.3), toon('#2e2018'), 0, h * 0.62, f + 0.05, g, 0);
    const roof = M(prism(d + 1.2, 3.2, w + 0.8), toon('#3b2a3a'), 0, h, 0, g, 0); roof.rotation.y = Math.PI / 2;
    const ro = new THREE.Mesh(roof.geometry, outlineMat); ro.scale.set(1.02, 1.03, 1.01); roof.add(ro);
    const ch = M(BOX(0.9, 2.2, 0.9), toon('#7a5446'), w * 0.3, h + 2.0, -d * 0.15, g, 0.04); flames.push({ smokeFrom: ch });
    sign(g, 'TAVERN', (c, x, y, a) => { c.fillStyle = '#f6e7c8'; c.fillRect(x, y - 22, 34, 44); c.strokeStyle = '#f6e7c8'; c.lineWidth = 7; c.beginPath(); c.arc(x + 38, y, 12, -1.3, 1.3); c.stroke(); c.fillStyle = '#ffffff'; c.fillRect(x - 2, y - 30, 38, 10); }, 4.4, h * 0.62 + 1.0, f + 0.2);
    M(BOX(2.0, 2.5, 0.2), WOOD, dx, 1.25, f + 0.05, g, 0.04);
    for (const sx of [-1, 1]) { M(BOX(1.1, 1.0, 0.1), windowM, dx + sx * 3.2, 2.0, f + 0.06, g, 0.03); M(BOX(0.25, 0.35, 0.25), lampM, dx + sx * 1.5, 2.9, f + 0.3, g, 0.03); glowSprite(dx + sx * 1.5, 2.9, f + 0.4, 0xffb060, 2.2, g); }
    banner(g, -w / 2 + 0.8, 3.0, f + 0.14); banner(g, w / 2 - 0.8, 3.0, f + 0.14);
    for (const [x, z] of [[w / 2 - 2.6, f + 0.9], [w / 2 - 1.6, f + 1.4], [w / 2 - 3.4, f + 1.6]]) { M(new THREE.CylinderGeometry(0.42, 0.38, 0.95, 14), toon('#7a5236'), x, 0.48, z, g, 0.03, 0.42); M(new THREE.TorusGeometry(0.42, 0.03, 4, 16), DARK, x, 0.7, z, g, 0).rotation.x = Math.PI / 2; colliders.push({ c: [g.position.x + x, g.position.z + z, 0.5] }); }
  }
  // item shop
  { const { g, w, d, dx, f } = place(BUILDINGS[2]); const h = 4.2;
    M(BOX(w, h, d), toon('#1d3b3a'), 0, h / 2, 0, g, 0.06);
    M(BOX(w + 0.3, 0.35, d + 0.3), toon('#14302e'), 0, h + 0.17, 0, g, 0.04);
    for (let i = 0; i < 9; i++) { const s = M(BOX(w / 9, 0.08, 1.8), toon(i % 2 ? '#f2f0ea' : '#3f9a5e'), -w / 2 + (i + 0.5) * w / 9, h - 0.6, f + 0.8, g, 0.02); s.rotation.x = 0.35; }
    sign(g, 'SHOP', (c, x, y) => { c.fillStyle = '#7ef0b0'; c.beginPath(); c.moveTo(x + 10, y - 26); c.lineTo(x + 22, y - 26); c.lineTo(x + 22, y - 8); c.lineTo(x + 34, y + 22); c.lineTo(x - 2, y + 22); c.lineTo(x + 10, y - 8); c.closePath(); c.fill(); }, 3.6, h + 0.75, f + 0.22, '#4ade80');
    M(BOX(1.8, 2.3, 0.2), toon('#2d5a50'), dx, 1.15, f + 0.05, g, 0.04);
    for (const sx of [-1, 1]) { M(BOX(1.2, 1.2, 0.2), toon('#2a2438'), sx * (w / 2 - 0.9), h + 0.9, f - 0.3, g, 0.04); for (let k = 0; k < 4; k++) M(new THREE.SphereGeometry(0.16, 8, 6), toon(pick(['#ff8a3a', '#9ad04a', '#ec3013'])), sx * (w / 2 - 0.9) + (k % 2 - 0.5) * 0.4, h + 0.9 + (k > 1 ? 0.22 : -0.18), f - 0.18, g, 0); banner(g, sx * (w / 2 - 0.7), 2.3, f + 0.06); M(BOX(0.9, 0.9, 0.08), windowM, sx * 1.6, 1.7, f + 0.05, g, 0.03); }
  }
  // fortune teller (round tent)
  { const b = BUILDINGS[5], { g, dx } = place(b), r = b.r * S, h = 3.6;
    const starsT = canvasTex(512, 128, (c) => { c.fillStyle = '#2a2458'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#e8e2ff'; for (let i = 0; i < 60; i++) { c.beginPath(); c.arc(rr(0, 512), rr(0, 128), rr(1, 3), 0, 7); c.fill(); } c.fillStyle = '#f0c96a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(40 + i * 85, 64, 12, 0.6, 5.7); c.fill(); } });
    M(new THREE.CylinderGeometry(r, r, h, 40), new THREE.MeshToonMaterial({ map: starsT, gradientMap: grad }), 0, h / 2, 0, g, 0.06, r);
    M(new THREE.ConeGeometry(r + 0.5, 3.2, 40), toon('#3d2f7a'), 0, h + 1.6, 0, g, 0.06, r + 0.5);
    M(new THREE.TorusGeometry(r + 0.25, 0.1, 6, 40), GOLD, 0, h + 0.05, 0, g, 0).rotation.x = Math.PI / 2;
    const orb = M(new THREE.SphereGeometry(0.55, 24, 16), crystalM, 0, h + 3.55, 0, g, 0.04, 0.55); glowSprite(0, h + 3.55, 0, 0x7fd8ff, 4, g); flames.push({ bob: orb, y: h + 3.55 });
    const t = signTex('FORTUNE TELLER', null, '#c084fc');
    M(BOX(3.6, 0.8, 0.14), [DARK, DARK, DARK, DARK, glowing(0, t, 1.3), DARK], dx, h + 0.55, r + 0.2, g, 0.03);
    M(BOX(1.4, 2.3, 0.3), toon('#160f2e'), dx, 1.15, r - 0.05, g, 0.03);
    colliders.push({ c: [AX(b.cx), AZ(b.cy), r + 0.1] });
  }
  // bowling
  { const { g, w, d, dx, f } = place(BUILDINGS[3]); const h = 4.8;
    M(BOX(w, h, d), toon('#22284a'), 0, h / 2, 0, g, 0.06);
    M(BOX(w + 0.3, 0.4, d + 0.3), toon('#161b36'), 0, h + 0.2, 0, g, 0.04);
    sign(g, 'BOWLING', (c, x, y) => { c.fillStyle = '#f6e7c8'; c.beginPath(); c.ellipse(x + 16, y - 14, 9, 12, 0, 0, 7); c.ellipse(x + 16, y + 12, 14, 16, 0, 0, 7); c.fill(); c.fillStyle = '#ec3013'; c.fillRect(x + 6, y - 3, 20, 5); }, 4.2, h - 0.8, f + 0.12, '#c0995c');
    for (const sx of [-1, 1]) { M(BOX(2.2, 2.6, 0.12), neonM, sx * 1.6, 1.6, f + 0.04, g, 0.04); M(BOX(2.3, 0.1, 0.16), toon('#ec3013'), sx * 1.6, 0.3, f + 0.08, g, 0); }
    M(BOX(1.4, 2.3, 0.2), toon('#3a4170'), dx, 1.15, f + 0.03, g, 0.03);
    const pts = [[0, 0], [0.55, 0], [0.75, 0.7], [0.62, 1.5], [0.32, 2.1], [0.3, 2.5], [0.45, 2.95], [0.32, 3.35], [0, 3.45]].map(([x, y]) => new THREE.Vector2(x, y));
    const pin = M(new THREE.LatheGeometry(pts, 24), WHITE, -w * 0.25, h + 0.4, -d * 0.1, g, 0.05, 0.75);
    M(new THREE.CylinderGeometry(0.33, 0.33, 0.14, 24), toon('#ec3013'), 0, 2.25, 0, pin, 0); M(new THREE.CylinderGeometry(0.32, 0.31, 0.1, 24), toon('#ec3013'), 0, 2.48, 0, pin, 0);
  }
  // armory
  { const { g, w, d, dx, f } = place(BUILDINGS[4]); const h = 4.4;
    M(BOX(w, h, d), toon('#38404f'), 0, h / 2, 0, g, 0.06);
    for (const sx of [-1, 1]) { const x1 = M(BOX(0.2, Math.hypot(w / 2.4, h * 0.8), 0.12), toon('#5a4030'), sx * w / 4, h / 2, f + 0.04, g, 0); x1.rotation.z = Math.atan2(h * 0.8, w / 2.4); const x2 = M(BOX(0.2, Math.hypot(w / 2.4, h * 0.8), 0.12), toon('#5a4030'), sx * w / 4, h / 2, f + 0.05, g, 0); x2.rotation.z = -Math.atan2(h * 0.8, w / 2.4); }
    const roof = M(prism(d + 1, 2.4, w + 0.6), toon('#6f7a8c'), 0, h, 0, g, 0); roof.rotation.y = Math.PI / 2; const ro = new THREE.Mesh(roof.geometry, outlineMat); ro.scale.set(1.02, 1.03, 1.01); roof.add(ro);
    sign(g, 'ARMORY', (c, x, y, a) => { c.strokeStyle = '#f6e7c8'; c.lineWidth = 7; c.beginPath(); c.moveTo(x, y - 24); c.lineTo(x + 46, y + 24); c.moveTo(x + 46, y - 24); c.lineTo(x, y + 24); c.stroke(); }, 4.2, h - 1.1, f + 0.16, '#94a3b8');
    M(BOX(1.8, 2.4, 0.2), toon('#2a2230'), dx, 1.2, f + 0.05, g, 0.04);
    const sh = M(new THREE.CylinderGeometry(0.9, 0.9, 0.16, 28), STEEL, -w * 0.32, 2.6, f + 0.12, g, 0.04, 0.9); sh.rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16), GOLD, 0, 0.05, 0, sh, 0);
    banner(g, w * 0.08, 2.4, f + 0.14); banner(g, w * 0.24, 2.4, f + 0.14);
    M(BOX(1.2, 0.4, 0.5), toon('#2f3340'), dx - 2.4, 0.55, f + 1.0, g, 0.03); M(BOX(0.6, 0.35, 0.4), toon('#2f3340'), dx - 2.4, 0.18, f + 1.0, g, 0.03);
    colliders.push({ c: [g.position.x - (dx - 2.4), g.position.z - (f + 1.0), 0.8] });
  }

  // ---------- polish pass: masonry, trims, windows, doors, roofs, lights ----------
  const BK = createBuildingKit(K, { DARK, STEEL, lampM, windowM });
  const { texMat, sconce, sideWindow, planter, dress } = BK;
  dress(BLD[0], { h: 6.5, wall: 'brick', base: '#273061', trim: '#e0a84a', accent: '#c42d3c', stone: '#3a3a58', flat: true, noCornice: true });
  dress(BLD[1], { h: 4.6, wall: 'plank', base: '#6a4732', trim: '#2e2018', accent: '#ffb85a', stone: '#6b6280', shutter: '#3f6b4a', roofMesh: BLD[1].g.children.find(c => c.geometry && c.geometry.type === 'ExtrudeGeometry'), roofColor: '#4a3248' });
  dress(BLD[2], { h: 4.2, wall: 'tile', base: '#24504d', trim: '#e6e1d3', accent: '#4ade80', stone: '#4a4560', shutter: '#3f9a5e', flat: true });
  dress(BLD[4], { h: 4.8, wall: 'panel', base: '#2a315a', trim: '#c0995c', accent: '#ec3013', stone: '#3a3a58', flat: true });
  dress(BLD[5], { h: 4.4, wall: 'stone', base: '#4a5263', trim: '#6b7280', accent: '#c42d3c', stone: '#3a3a4a', shutter: '#5a1d1d', roofMesh: BLD[5].g.children.find(c => c.geometry && c.geometry.type === 'ExtrudeGeometry'), roofColor: '#7a8696' });
  // fortune teller tent: bunting, lanterns, rug
  { const rec = BLD[3], r = rec.b.r * S, gg = rec.g;
    for (let i = 0; i < 16; i++) { const a2 = i / 16 * Math.PI * 2; const fl = M(new THREE.ConeGeometry(0.16, 0.36, 3), toon(i % 3 === 0 ? '#e6b45a' : i % 3 === 1 ? '#c084fc' : '#f2f0ea'), Math.sin(a2) * (r + 0.32), 3.5, Math.cos(a2) * (r + 0.32), gg, 0.01); fl.rotation.set(Math.PI, a2, 0); }
    for (const s of [-1, 1]) { const x = rec.dx + s * 1.5; M(new THREE.CylinderGeometry(0.05, 0.06, 2.6, 8), DARK, x, 1.3, r + 0.8, gg, 0.012, 0.06); M(new THREE.SphereGeometry(0.22, 12, 8), toon('#c084fc', { emissive: new THREE.Color('#c084fc'), emissiveIntensity: 1.4 }), x, 2.7, r + 0.8, gg, 0.015, 0.22); glowSprite(x, 2.7, r + 0.8, 0xc084fc, 2.2, gg); }
    M(new THREE.CylinderGeometry(1.2, 1.2, 0.03, 32), toon('#5b2a7a'), rec.dx, 0.03, r + 1.1, gg, 0); M(new THREE.TorusGeometry(1.1, 0.04, 6, 32), toon('#e6b45a'), rec.dx, 0.05, r + 1.1, gg, 0).rotation.x = Math.PI / 2;
  }
  // props
  for (const [ax, ay] of [[1080, 560], [1800, 560], [1080, 1060], [1800, 1060]]) {
    const x = AX(ax), z = AZ(ay); const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    M(new THREE.CylinderGeometry(0.35, 0.5, 0.9, 12), toon('#4a4560'), 0, 0.45, 0, g, 0.03, 0.5);
    M(new THREE.CylinderGeometry(0.75, 0.45, 0.4, 16), toon('#5c5675'), 0, 1.1, 0, g, 0.04, 0.75);
    const fl = M(new THREE.ConeGeometry(0.42, 1.0, 8), glowing('#ff9a3a', null, 2.4), 0, 1.75, 0, g, 0); fl.castShadow = false;
    const fi = M(new THREE.ConeGeometry(0.22, 0.6, 8), glowing('#ffe28a', null, 2.4), 0, 1.6, 0, g, 0); fi.castShadow = false;
    flames.push({ fl, fi, ph: rnd() * 10 }); glowSprite(0, 1.8, 0, 0xff9a40, 4.5, g);
    const L = new THREE.PointLight(0xff9a50, 0, 14, 2); L.position.set(x, 2.2, z); scene.add(L); pointLights.push({ L, k: 16 });
    colliders.push({ c: [x, z, 0.85] });
  }
  for (const [ax, ay] of [[1270, 436], [1610, 436], [330, 640], [330, 976], [2550, 640], [2550, 976], [1270, 1180], [1610, 1180]]) {
    const x = AX(ax), z = AZ(ay); M(BOX(0.4, 0.5, 0.4), toon('#3a3a58'), x, 0.25, z, null, 0.03);
    const c = M(new THREE.OctahedronGeometry(0.28, 0), crystalM, x, 0.95, z, null, 0.03, 0.28); c.scale.y = 1.5; flames.push({ spin: c }); glowSprite(x, 0.95, z, 0x58d8ff, 2.2);
    colliders.push({ c: [x, z, 0.35] });
  }
  for (const [ax, ay] of [[1190, 994], [1690, 994]]) { const x = AX(ax), z = AZ(ay); M(BOX(2.2, 0.12, 0.6), WOOD, x, 0.5, z, null, 0.03); M(BOX(2.2, 0.5, 0.1), WOOD, x, 0.8, z + 0.28, null, 0.03); for (const sx of [-1, 1]) M(BOX(0.12, 0.5, 0.5), DARK, x + sx * 0.95, 0.25, z, null, 0); colliders.push({ box: [x - 1.1, x + 1.1, z - 0.35, z + 0.4] }); }
  const torchSpots = [[300, 420], [90, 630], [230, 990], [300, 1200], [2864, 420], [2790, 630], [2650, 990], [2580, 1200], [1260, 140], [1616, 300], [1260, 1480], [1616, 1330], [960, 1250]];
  for (const [ax, ay] of torchSpots) { const x = AX(ax), z = AZ(ay); M(new THREE.CylinderGeometry(0.07, 0.1, 2.2, 8), DARK, x, 1.1, z, null, 0.03, 0.1); M(BOX(0.34, 0.4, 0.34), lampM, x, 2.4, z, null, 0.03); M(new THREE.ConeGeometry(0.3, 0.25, 4), DARK, x, 2.72, z, null, 0).rotation.y = Math.PI / 4; glowSprite(x, 2.4, z, 0xffb060, 2.6); colliders.push({ c: [x, z, 0.25] }); }
  // north gate: banner poles + string lights
  const gp = [[1240, 250], [1640, 250]].map(([ax, ay]) => { const x = AX(ax), z = AZ(ay); M(new THREE.CylinderGeometry(0.1, 0.12, 4.6, 10), DARK, x, 2.3, z, null, 0.03, 0.12); M(new THREE.SphereGeometry(0.18, 10, 8), GOLD, x, 4.7, z, null, 0.02, 0.18); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.6), bannerM); p.position.set(x, 3.4, z + 0.12); scene.add(p); colliders.push({ c: [x, z, 0.25] }); return new THREE.Vector3(x, 4.5, z); });
  for (let i = 0; i <= 20; i++) { const t = i / 20, p = gp[0].clone().lerp(gp[1], t); p.y -= Math.sin(t * Math.PI) * 1.0; const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), lampM); b.position.copy(p); scene.add(b); if (i % 4 === 2) glowSprite(p.x, p.y, p.z, 0xffc070, 1.2); }
  // road-end gate signs
  for (const e of EXITS) {
    const outward = e.ay < 100 ? [0, -1] : e.ay > 1500 ? [0, 1] : e.ax < 100 ? [-1, 0] : [1, 0];
    const x = AX(e.ax) + outward[0] * 3, z = AZ(e.ay) + outward[1] * 3; const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(-outward[0], -outward[1]); scene.add(g); camBlockers.push(g);
    for (const sx of [-1, 1]) M(BOX(0.4, 4.2, 0.4), toon('#3a3a58'), sx * 4.6, 2.1, 0, g, 0.04);
    M(BOX(9.8, 0.5, 0.5), toon('#3a3a58'), 0, 4.3, 0, g, 0.04);
    const t = signTex(e.label.toUpperCase(), null, '#e6b45a'); M(BOX(4.4, 1.1, 0.16), [DARK, DARK, DARK, DARK, glowing(0, t, 1.2), DARK], 0, 3.4, 0.18, g, 0.03);
  }

  const cpRoot = CP.buildCastlePath({ THREE, scene, M, BOX, toon, grad, glowing, glowSprite, BK, colliders, camBlockers, flames, bannerM, emblemTex, signTex, cobbleTex, plazaTex, lampM, DARK, GOLD, WOOD, crystalM });
  const apFx = AP.buildArenaPath({ THREE, scene, M, BOX, toon, BK, colliders, signTex, glowing, DARK, WOOD, bannerM });
  const lakeFx = LK.buildLake({ THREE, scene, M, BOX, toon, grad, glowing, glowSprite, BK, colliders, flames, signTex, DARK, WOOD, heightAt });
  const ruinsFx = RU.buildRuins({ THREE, scene, M, BOX, toon, grad, glowing, glowSprite, BK, colliders, camBlockers, flames, emblemTex, signTex, cobbleTex, plazaTex, lampM, DARK, GOLD, WOOD, crystalM, heightAt, pointLights, windowM });
  // ---- Meru Arena, directly east of the east gate ----
  { const A = new THREE.Group(); A.position.set(ARENA_C.x, 0, ARENA_C.z); scene.add(A);
    const archT = canvasTex(1024, 256, (c) => { c.fillStyle = '#3b3f52'; c.fillRect(0, 0, 1024, 256); c.fillStyle = '#2a2d3c'; for (let y = 0; y < 256; y += 32) for (let x = (y / 32) % 2 * 32; x < 1024; x += 64) c.fillRect(x, y, 62, 30); c.fillStyle = '#141626'; for (let i = 0; i < 16; i++) { const x = i * 64 + 12; c.beginPath(); c.moveTo(x, 230); c.lineTo(x, 120); c.arc(x + 20, 120, 20, Math.PI, 0); c.lineTo(x + 40, 230); c.fill(); } c.fillStyle = '#c42d3c'; c.fillRect(0, 0, 1024, 14); c.fillStyle = '#e6b45a'; c.fillRect(0, 14, 1024, 6); }, [4, 1]);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(ARENA_C.r, ARENA_C.r + 1.5, 13, 64, 1, true), new THREE.MeshToonMaterial({ map: archT, gradientMap: grad, side: THREE.DoubleSide })); wall.position.y = 6.5; wall.castShadow = wall.receiveShadow = true; A.add(wall); camBlockers.push(A);
    M(new THREE.TorusGeometry(ARENA_C.r + 0.2, 0.5, 8, 64), toon('#2a2d3c'), 0, 13.1, 0, A, 0.04).rotation.x = Math.PI / 2;
    for (let i = 0; i < 24; i++) { const a2 = i / 24 * Math.PI * 2; M(new THREE.BoxGeometry(1.4, 1.4, 1.2), toon('#3b3f52'), Math.sin(a2) * ARENA_C.r, 14, Math.cos(a2) * ARENA_C.r, A, 0.03).rotation.y = a2; }
    for (let i = 0; i < 8; i++) { const a2 = i / 8 * Math.PI * 2 + 0.2; const pole = M(new THREE.CylinderGeometry(0.12, 0.12, 5, 8), DARK, Math.sin(a2) * ARENA_C.r, 16.5, Math.cos(a2) * ARENA_C.r, A, 0.02, 0.12); const fl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.2), toon(i % 2 ? '#c42d3c' : '#f2f0ea', { side: THREE.DoubleSide })); fl.position.set(1.1, 1.8, 0); pole.add(fl); flames.push({ flag: fl, ph: i }); }
    const gx = -ARENA_C.r; const gate = new THREE.Group(); gate.position.set(gx - 0.6, 0, 0); gate.rotation.y = Math.PI / 2; A.add(gate);
    for (const sx of [-1, 1]) M(BOX(2, 10, 3), toon('#262b52'), sx * 3.6, 5, 0, gate, 0.05);
    M(BOX(9.2, 2.4, 3), toon('#262b52'), 0, 9.6, 0, gate, 0.05); M(BOX(5.2, 8.4, 0.3), toon('#0b0d1c'), 0, 4.2, 0.8, gate, 0);
    const st = signTex('MERU ARENA', null, '#e6b45a'); M(BOX(6, 1.5, 0.2), [DARK, DARK, DARK, DARK, glowing(0, st, 1.3), DARK], 0, 9.6, -1.62, gate, 0.03).rotation.y = Math.PI;
    for (const sx of [-1, 1]) { const c2 = M(new THREE.OctahedronGeometry(0.35, 0), crystalM, sx * 3.6, 10.7, -1.4, gate, 0.03, 0.35); c2.scale.y = 1.5; glowSprite(sx * 3.6, 10.7, -1.4, 0x58d8ff, 3, gate); flames.push({ spin: c2 }); }
    const embA = new THREE.Mesh(new THREE.CircleGeometry(1.3, 40), new THREE.MeshToonMaterial({ map: emb, gradientMap: grad, emissive: 0xffffff, emissiveMap: emb, emissiveIntensity: 0.4 })); embA.position.set(0, 11.9, -1.55); embA.rotation.y = Math.PI; gate.add(embA);
    cob(3980, 4380, 660, 960);
    colliders.push({ c: [ARENA_C.x, ARENA_C.z, ARENA_C.r + 1] });
  }
  // trees
  const rounds = [], roundCols = [], pines = [], trunks = [];
  const greens = ['#4f9a44', '#5aa84a', '#3f8a46', '#6db54c', '#478f3f'].map(c => new THREE.Color(c)), blossom = ['#ffb7cf', '#f7a6c4'].map(c => new THREE.Color(c));
  for (let i = 0; i < 4000 && trunks.length < 360; i++) {
    const X = rr(-150, 150), Z = rr(-125, 125); const [ax, ay] = toArt(X, Z);
    if (inPaved(ax, ay, 110)) continue; if (Math.hypot(X - ARENA_C.x, Z - ARENA_C.z) < ARENA_C.r + 6) continue;
    const cpz = ay < 0 && CP.inZone(ax, ay); if (cpz && !CP.treeOK(ax, ay)) continue;
    const lkz = ay > 1620 && LK.inZone(ax, ay); if (lkz && !LK.treeOK(ax, ay)) continue;
    const ruz = (ax < 0 && RU.inZone(ax, ay)) || lkz; if (ax < 0 && RU.inZone(ax, ay) && !RU.treeOK(ax, ay)) continue; if (!ruz && RU.sandAt(X, Z) > 0.6) continue;
    const d = outsideDist(X, Z), inside = d === 0 || cpz || ruz;
    if (inside && rnd() > 0.35) continue;
    if (!inside && Math.min(Math.abs(X), Math.abs(Z)) < 7) continue;
    if (!inside && rnd() > 0.25 + smooth(0, 25, d) * 0.75) continue;
    if (torchSpots.some(([tx, ty]) => Math.hypot(tx - ax, ty - ay) < 90)) continue;
    const y = heightAt(X, Z), s = rr(0.8, 1.35);
    if (!inside && (y > 6 || d > 45) && rnd() < 0.7) pines.push({ X, y, Z, s });
    else { rounds.push({ X, y: y + 2.6 * s, Z, s, sy: s * rr(0.9, 1.2) }); roundCols.push(inside && rnd() < 0.3 ? pick(blossom) : pick(greens)); }
    trunks.push({ X, y: y + 0.9 * s, Z, s }); if (inside) colliders.push({ c: [X, Z, 0.45 * s] });
  }
  const dummy = new THREE.Object3D();
  function instanced(geo, mat, list, oGeo, colsArr) {
    const im = new THREE.InstancedMesh(geo, mat, list.length); im.castShadow = im.receiveShadow = true;
    list.forEach((t, i) => { dummy.position.set(t.X, t.y, t.Z); dummy.rotation.set(0, i * 2.4, 0); dummy.scale.set(t.s, t.sy ?? t.s, t.s); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); if (colsArr) im.setColorAt(i, colsArr[i]); });
    scene.add(im); if (oGeo) { const om = new THREE.InstancedMesh(oGeo, outlineMat, list.length); for (let i = 0; i < list.length; i++) { im.getMatrixAt(i, dummy.matrix); om.setMatrixAt(i, dummy.matrix); } scene.add(om); } return im;
  }
  instanced(new THREE.CylinderGeometry(0.22, 0.32, 1.8, 7), toon('#7a5236'), trunks, new THREE.CylinderGeometry(0.27, 0.37, 1.85, 7));
  instanced(new THREE.IcosahedronGeometry(1.6, 1), toon('#ffffff'), rounds, new THREE.IcosahedronGeometry(1.68, 1), roundCols);
  const pA = new THREE.ConeGeometry(1.6, 2.8, 7); pA.translate(0, 2.6, 0); const pB = new THREE.ConeGeometry(1.15, 2.3, 7); pB.translate(0, 4.1, 0);
  const pAO = new THREE.ConeGeometry(1.68, 2.9, 7); pAO.translate(0, 2.58, 0); const pBO = new THREE.ConeGeometry(1.22, 2.4, 7); pBO.translate(0, 4.08, 0);
  instanced(pA, toon('#2f6e4a'), pines, pAO); instanced(pB, toon('#3a7f52'), pines, pBO);
  const tufts = [], tuftCols = [], tg2 = new THREE.ConeGeometry(0.08, 0.4, 3); tg2.translate(0, 0.2, 0);
  for (let i = 0; i < 12000 && tufts.length < 3500; i++) { const X = rr(-110, 110), Z = rr(-90, 90), [ax, ay] = toArt(X, Z); if (inPaved(ax, ay, 20) || RU.sandAt(X, Z) > 0.4) continue; const y = heightAt(X, Z); if (y > 14) continue; tufts.push({ X, y, Z, s: rr(0.7, 1.4) }); tuftCols.push(pick(['#4a8a3a', '#6aa848', '#7fbf50', '#3f7a3a']).length ? new THREE.Color(pick(['#4a8a3a', '#6aa848', '#7fbf50', '#3f7a3a'])) : null); }
  instanced(tg2, toon('#ffffff'), tufts, null, tuftCols).castShadow = false;
  const flowers = [], flCols = [], FC = ['#ffffff', '#ffd04a', '#ff8fb0', '#b9a0ff'].map(c => new THREE.Color(c));
  for (let i = 0; i < 8000 && flowers.length < 1400; i++) { const X = rr(-90, 90), Z = rr(-70, 70), [ax, ay] = toArt(X, Z); if (inPaved(ax, ay, 30) || RU.sandAt(X, Z) > 0.4) continue; const y = heightAt(X, Z); if (y > 10) continue; flowers.push({ X, y: y + 0.22, Z, s: rr(0.7, 1.2) }); flCols.push(pick(FC)); }
  instanced(new THREE.IcosahedronGeometry(0.1, 0), toon('#ffffff'), flowers, null, flCols).castShadow = false;

  // clouds, fireflies, rain, smoke
  const clouds = [], cloudMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad, emissive: new THREE.Color(0x8a8f9a), emissiveIntensity: 0.6 });
  for (let i = 0; i < 16; i++) { const g = new THREE.Group(), n = 4 + Math.floor(rnd() * 4); for (let k = 0; k < n; k++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(3, 6), 1), cloudMat); m.position.set(k * 4 - n * 2, rr(-1, 1.5), rr(-2, 2)); m.scale.y = 0.7; g.add(m); } g.position.set(rr(-260, 260), rr(55, 85), rr(-260, 260)); g.userData.v = rr(1.5, 3.5); scene.add(g); clouds.push(g); }
  const ffN = 140, ffGeo = new THREE.BufferGeometry(), ffBase = [];
  for (let i = 0; i < ffN; i++) { const X = rr(-60, 60), Z = rr(-45, 45); ffBase.push([X, heightAt(X, Z) + rr(0.5, 2.5), Z, rr(0, 10)]); }
  ffGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(ffN * 3), 3));
  const ffMat = new THREE.PointsMaterial({ color: 0xfff08a, map: glowTex, size: 0.6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.Points(ffGeo, ffMat));
  const rainN = 1600, rainArr = new Float32Array(rainN * 6), rainGeo = new THREE.BufferGeometry();
  for (let i = 0; i < rainN; i++) { const x = rr(-40, 40), y = rr(0, 40), z = rr(-40, 40); rainArr.set([x, y, z, x - 0.15, y - 0.9, z], i * 6); }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainArr, 3));
  const rainMat = new THREE.LineBasicMaterial({ color: 0xc6d3e0, transparent: true, opacity: 0 }); const rain = new THREE.LineSegments(rainGeo, rainMat); rain.frustumCulled = false; scene.add(rain);
  const smoke = []; flames.filter(f => f.smokeFrom).forEach(f => { for (let k = 0; k < 6; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); smoke.push({ s, ch: f.smokeFrom, t: k / 6 }); } });
  const embers = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xffb060, map: dotTex, size: 0.08, transparent: true, depthWrite: false, alphaTest: 0.1, blending: THREE.AdditiveBlending }));
  const embArr = new Float32Array(4 * 30 * 3), embSeed = Array.from({ length: 120 }, () => [rr(0, 1), rr(-0.3, 0.3), rr(-0.3, 0.3)]);
  embers.geometry.setAttribute('position', new THREE.BufferAttribute(embArr, 3)); scene.add(embers);
  const brazierPos = [[1080, 560], [1800, 560], [1080, 1060], [1800, 1060]].map(([a, b]) => [AX(a), AZ(b)]);

  const { makeFox, animFox, MOOD, moodOf } = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const EYES = { hope: ['#f472b6', '#2dd4bf'], noble: ['#dc2626', '#dc2626'], ulric: ['#65a30d', '#65a30d'], grand: ['#a78bfa', '#a78bfa'], james: ['#16a34a', '#16a34a'], lucius: ['#eab308', '#eab308'], jon: ['#d97706', '#d97706'] };
  const MOODS = { hope: 'happy', noble: 'determined', ulric: 'stern', grand: 'stern', james: 'stern', lucius: 'smug', jon: 'warm' };
  const player = makeFox({ torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', mood: 'warm', look: PLAYER_MALE, outfit: 'armor', gear: 'both' });
  const playerLook = new THREE.Vector3();
  const Pl = { x: AX(1440), z: AZ(1010), y: 0, vy: 0, vx: 0, vz: 0, face: Math.PI, ground: true, stepT: 0 };
  let spawnEast = false; try { spawnEast = sessionStorage.getItem('meru.spawn') === 'east'; sessionStorage.removeItem('meru.spawn'); } catch (e) {}
  if (spawnEast) { Pl.x = AX(4560); Pl.z = AZ(810); Pl.face = -Math.PI / 2; }
  const npcs = FOXES.map(f => {
    const c = makeFox({ ...f, eyes: EYES[f.key] || f.eyes, mood: MOODS[f.key] || (MOODS[f.key] = f.mood), look: f.look || (f.female ? PLAYER_FEMALE : PLAYER_MALE) }); const n = { ...f, c, speedNow: 0, wait: rr(0, 2), seg: 0, dir: 1, lookV: new THREE.Vector3() };
    if (f.stand) { n.x = AX(f.stand[0]); n.z = AZ(f.stand[1] * SRC_Y); n.face = f.face != null ? f.face : n.x > 0 ? -Math.PI / 2 : Math.PI / 2; }
    else { n.pts = f.path.map(([sx, sy]) => [AX(sx), AZ(sy * SRC_Y)]); n.x = n.pts[0][0]; n.z = n.pts[0][1]; n.face = 0; n.seg = 1; }
    return n;
  });
  // ===== THE TAVERN INTERIOR — same scene, far south of the map, entered with a fade (no loading) =====
  const TAV = { x: 0, z: 230, w: 26, d: 20, h: 6 };
  const JUKE = { group: null, neon: [], light: null, glow: null, ring: null, open: false, playing: -1, audio: null, synth: null, err: null, beat: 0 };
  const tavLights = [];
  { const T = new THREE.Group(); T.position.set(TAV.x, 0, TAV.z); scene.add(T); camBlockers.push(T);
    const W2 = TAV.w / 2, D2 = TAV.d / 2;
    const floorM = texMat('plank', '#7a5236', TAV.w / 2.4, TAV.d / 2.4);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(TAV.w, TAV.d), floorM); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; T.add(fl);
    const wallM = texMat('plank', '#5a3d2c', 4, 1.4), plaster = toon('#d9c7a8'), beam = toon('#2e2018');
    for (const [x, z, w, ry] of [[0, -D2, TAV.w, 0], [0, D2, TAV.w, Math.PI], [-W2, 0, TAV.d, Math.PI / 2], [W2, 0, TAV.d, -Math.PI / 2]]) {
      const wg = new THREE.Group(); wg.position.set(x, 0, z); wg.rotation.y = ry; T.add(wg);
      const lower = new THREE.Mesh(new THREE.BoxGeometry(w, 1.6, 0.3), wallM); lower.position.set(0, 0.8, 0); lower.receiveShadow = true; wg.add(lower);
      const upper = new THREE.Mesh(new THREE.BoxGeometry(w, TAV.h - 1.6, 0.3), plaster); upper.position.set(0, 1.6 + (TAV.h - 1.6) / 2, 0); upper.receiveShadow = true; wg.add(upper);
      M(BOX(w, 0.14, 0.4), beam, 0, 1.62, 0.05, wg, 0); M(BOX(w, 0.3, 0.42), beam, 0, TAV.h - 0.15, 0.05, wg, 0);
      for (let i = 0; i <= Math.floor(w / 3); i++) M(BOX(0.3, TAV.h - 1.6, 0.36), beam, -w / 2 + i * w / Math.floor(w / 3), 1.6 + (TAV.h - 1.6) / 2, 0.04, wg, 0);
    }
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(TAV.w + 0.6, 0.3, TAV.d + 0.6), toon('#3a2a22')); ceil.position.y = TAV.h + 0.15; ceil.castShadow = true; T.add(ceil);
    for (let i = -3; i <= 3; i++) M(BOX(0.35, 0.35, TAV.d), beam, i * 3.7, TAV.h - 0.18, 0, T, 0.02);
    const glowWin = glowing('#ffcf8a', null, 1.4);
    for (const z of [-6.5, -2, 2, 6.5]) for (const s of [-1, 1]) { M(BOX(0.12, 1.2, 1.1), beam, s * (W2 - 0.17), 2.7, z, T, 0); M(BOX(0.08, 1.0, 0.9), glowWin, s * (W2 - 0.2), 2.7, z, T, 0); }
    // the bar
    M(BOX(13, 1.15, 1.1), toon('#6b4a35'), -2, 0.58, -D2 + 2.4, T, 0.04); M(BOX(13.3, 0.12, 1.35), toon('#3a2618'), -2, 1.2, -D2 + 2.4, T, 0.02);
    M(BOX(13, 0.14, 0.12), toon('#e0a84a'), -2, 0.15, -D2 + 1.86, T, 0);
    for (let i = 0; i < 8; i++) { const sx = -7.4 + i * 1.55; M(new THREE.CylinderGeometry(0.28, 0.24, 0.12, 14), toon('#c42d3c'), sx, 0.95, -D2 + 3.35, T, 0.015, 0.28); M(new THREE.CylinderGeometry(0.05, 0.07, 0.9, 8), DARK, sx, 0.45, -D2 + 3.35, T, 0.01, 0.07); colliders.push({ c: [TAV.x + sx, TAV.z - D2 + 3.35, 0.3] }); }
    for (let i = 0; i < 6; i++) { const tx2 = -6.2 + i * 1.3; M(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8), toon('#e0a84a'), tx2, 1.5, -D2 + 2.1, T, 0.01, 0.05); M(BOX(0.12, 0.18, 0.12), toon('#c42d3c'), tx2, 1.78, -D2 + 2.1, T, 0.01); }
    colliders.push({ box: [TAV.x - 8.6, TAV.x + 4.6, TAV.z - D2 + 1.8, TAV.z - D2 + 3.0] });
    // shelves of bottles behind the bar
    const bottleCols = ['#3f9a5e', '#c42d3c', '#e0a84a', '#38bdf8', '#7c3aed', '#ffffff'];
    for (let r = 0; r < 3; r++) { M(BOX(12.4, 0.1, 0.5), beam, -2, 1.9 + r * 0.8, -D2 + 0.45, T, 0.012); for (let i = 0; i < 20; i++) { const col = pick(bottleCols); M(new THREE.CylinderGeometry(0.07, 0.09, 0.42 + rr(-0.06, 0.08), 8), toon(col, { emissive: new THREE.Color(col), emissiveIntensity: 0.35 }), -7.8 + i * 0.6 + rr(-0.1, 0.1), 2.18 + r * 0.8, -D2 + 0.45, T, 0.01, 0.09); } }
    // barrels
    for (const [x, z, s2] of [[9.6, -D2 + 1.0, 1], [10.6, -D2 + 1.0, 1], [10.1, -D2 + 1.0, 1.0], [11.4, -D2 + 1.4, 1]]) { const y0 = x === 10.1 ? 1.45 : 0.5; const b = M(new THREE.CylinderGeometry(0.48, 0.44, 0.95, 16), toon('#7a5236'), x, y0, z, T, 0.03, 0.48); for (const yy of [-0.3, 0.3]) M(new THREE.TorusGeometry(0.47, 0.03, 4, 18), DARK, 0, yy, 0, b, 0).rotation.x = Math.PI / 2; }
    colliders.push({ box: [TAV.x + 9.0, TAV.x + 12.2, TAV.z - D2, TAV.z - D2 + 2.0] });
    // tables, chairs, mugs, candles
    for (const [x, z] of [[-8, 2], [-3.5, 3.2], [1.5, 1.5], [6, 2.4], [-7.5, 7], [-2, 7.5], [3.5, 6.5], [8.5, 7.8]]) {
      M(new THREE.CylinderGeometry(0.85, 0.85, 0.1, 20), toon('#7a5236'), x, 0.95, z, T, 0.025, 0.85); M(new THREE.CylinderGeometry(0.1, 0.16, 0.9, 10), beam, x, 0.45, z, T, 0.015, 0.16);
      for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.4; const cx = x + Math.sin(a) * 1.25, cz = z + Math.cos(a) * 1.25; M(BOX(0.5, 0.08, 0.5), toon('#6b4a35'), cx, 0.55, cz, T, 0.015); M(BOX(0.5, 0.6, 0.08), toon('#6b4a35'), cx + Math.sin(a) * 0.22, 0.85, cz + Math.cos(a) * 0.22, T, 0.015).rotation.y = a; for (const [ox, oz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) M(BOX(0.06, 0.5, 0.06), beam, cx + ox, 0.27, cz + oz, T, 0); }
      for (let k = 0; k < 2; k++) { const a = rr(0, 6.28); const mg = M(new THREE.CylinderGeometry(0.09, 0.08, 0.2, 10), toon('#e0a84a'), x + Math.sin(a) * 0.45, 1.1, z + Math.cos(a) * 0.45, T, 0.01, 0.09); M(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 10), toon('#fff7e0'), 0, 0.1, 0, mg, 0); }
      M(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 8), toon('#f7f1e6'), x, 1.08, z, T, 0); const fl2 = M(new THREE.ConeGeometry(0.035, 0.09, 6), lampM, x, 1.21, z, T, 0); flames.push({ candle: fl2, ph: rr(0, 9) }); glowSprite(x, 1.22, z, 0xffb060, 0.7, T);
      colliders.push({ c: [TAV.x + x, TAV.z + z, 1.0] });
    }
    // fireplace on the west wall
    const fp = new THREE.Group(); fp.position.set(-W2 + 0.45, 0, -1.6); fp.rotation.y = Math.PI / 2; T.add(fp);
    M(BOX(3.0, 2.4, 0.9), toon('#6b6280'), 0, 1.2, 0, fp, 0.04); M(BOX(1.8, 1.3, 0.7), toon('#120c0a'), 0, 0.75, 0.2, fp, 0); M(BOX(3.4, 0.25, 1.1), beam, 0, 2.5, 0.05, fp, 0.02); M(BOX(1.6, 2.6, 0.7), toon('#5c5675'), 0, 3.7, -0.1, fp, 0.03);
    const fire1 = M(new THREE.ConeGeometry(0.42, 0.9, 8), glowing('#ff8a3a', null, 2.6), -0.2, 0.55, 0.35, fp, 0), fire2 = M(new THREE.ConeGeometry(0.3, 0.7, 8), glowing('#ffd38a', null, 2.6), 0.25, 0.48, 0.38, fp, 0);
    fire1.castShadow = fire2.castShadow = false; flames.push({ fl: fire1, fi: fire2, ph: 1 }); glowSprite(0, 0.7, 0.55, 0xff8a3a, 3.2, fp);
    for (const sx of [-0.45, 0.45]) M(new THREE.CylinderGeometry(0.09, 0.09, 1.2, 8), toon('#5a3d2c'), sx * 0.6, 0.18, 0.4, fp, 0).rotation.z = Math.PI / 2 + sx;
    const fireL = new THREE.PointLight(0xff8a3a, 22, 12, 1.6); fireL.position.set(TAV.x - W2 + 1.6, 1.2, TAV.z - 1.6); scene.add(fireL); tavLights.push({ L: fireL, k: 22, flick: 1 });
    colliders.push({ box: [TAV.x - W2, TAV.x - W2 + 1.1, TAV.z - 3.2, TAV.z] });
    M(new THREE.CylinderGeometry(1.6, 1.6, 0.03, 32), toon('#7a1d2a'), -W2 + 2.6, 0.02, -1.6, T, 0); M(new THREE.TorusGeometry(1.5, 0.05, 6, 32), toon('#e0a84a'), -W2 + 2.6, 0.04, -1.6, T, 0).rotation.x = Math.PI / 2;
    // jukebox on the east wall
    const jb = new THREE.Group(); jb.position.set(W2 - 0.95, 0, 5); jb.rotation.y = -Math.PI / 2; jb.scale.setScalar(1.55); T.add(jb); JUKE.group = jb;
    M(BOX(1.3, 1.6, 0.7), toon('#3a2a52'), 0, 0.8, 0, jb, 0.03); const arch = M(new THREE.CylinderGeometry(0.65, 0.65, 0.7, 24, 1, false, -Math.PI / 2, Math.PI), toon('#3a2a52'), 0, 1.6, 0, jb, 0.03); arch.rotation.x = Math.PI / 2; arch.rotation.z = Math.PI / 2;
    const jbGlow = glowing('#ff6bd5', null, 1.8); const jbArc = M(new THREE.TorusGeometry(0.52, 0.06, 6, 24, Math.PI), jbGlow, 0, 1.6, 0.37, jb, 0); M(BOX(0.9, 0.5, 0.06), glowing('#5fe3ff', null, 1.4), 0, 0.95, 0.36, jb, 0); flames.push({ juke: jbGlow, ph: 0 });
    colliders.push({ box: [TAV.x + W2 - 1.7, TAV.x + W2, TAV.z + 3.9, TAV.z + 6.1] });
    { const neon = [glowing('#ff3bd4', null, 2.2), glowing('#38bdf8', null, 2.2), glowing('#ffd23a', null, 2.2)]; JUKE.neon = neon;
      for (let k = 0; k < 3; k++) { const t2 = M(new THREE.TorusGeometry(0.62 + k * 0.09, 0.025, 6, 32, Math.PI), neon[k], 0, 1.6, 0.36 + k * 0.01, jb, 0); }
      for (const sx of [-1, 1]) { M(BOX(0.06, 1.5, 0.06), neon[1], sx * 0.68, 0.78, 0.36, jb, 0); }
      M(BOX(1.1, 0.18, 0.06), neon[2], 0, 0.15, 0.36, jb, 0);
      const st = signTex('JUKEBOX', null, '#ff3bd4'); M(BOX(1.3, 0.33, 0.06), [DARK, DARK, DARK, DARK, glowing(0, st, 1.5), DARK], 0, 2.55, 0.1, jb, 0.01);
      JUKE.light = new THREE.PointLight(0xff3bd4, 0, 9, 1.6); JUKE.light.position.set(TAV.x + W2 - 2.4, 2.2, TAV.z + 5); scene.add(JUKE.light);
      JUKE.glow = glowSprite(0, 1.2, 0.8, 0xff6be0, 4.5, jb);
      const ringM = new THREE.MeshBasicMaterial({ color: 0xff3bd4, transparent: true, opacity: 0.7, depthWrite: false }); JUKE.ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 40), ringM); JUKE.ring.rotation.x = -Math.PI / 2; JUKE.ring.position.set(TAV.x + W2 - 3.0, 0.03, TAV.z + 5); scene.add(JUKE.ring); }
    // hanging lanterns + the warm lights
    for (const [x, z] of [[-7, -3], [0, -3], [6, -2], [-6, 5], [1, 5.5], [8, 5.5]]) { M(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 4), DARK, x, TAV.h - 0.6, z, T, 0); M(BOX(0.36, 0.44, 0.36), lampM, x, TAV.h - 1.3, z, T, 0.02); glowSprite(x, TAV.h - 1.3, z, 0xffb060, 2.6, T); const L = new THREE.PointLight(0xffb060, 14, 11, 1.6); L.position.set(TAV.x + x, TAV.h - 1.5, TAV.z + z); scene.add(L); tavLights.push({ L, k: 14 }); }
    // banners, notice board, exit door
    for (const x of [-10.5, 10.5]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.0), bannerM); p.position.set(x, 3.0, -D2 + 0.17); T.add(p); }
    const nb = M(BOX(2.0, 1.3, 0.1), toon('#6b4a35'), 9, 2.6, D2 - 0.2, T, 0.02); nb.rotation.y = Math.PI; for (let i = 0; i < 5; i++) { const pp = M(BOX(0.4, 0.5, 0.02), toon(pick(['#f7f1e6', '#fff3c4', '#e6e1d3'])), rr(-0.7, 0.7), rr(-0.35, 0.35), 0.06, nb, 0); pp.rotation.z = rr(-0.15, 0.15); }
    const dr = new THREE.Group(); dr.position.set(0, 0, D2 - 0.18); dr.rotation.y = Math.PI; T.add(dr);
    M(BOX(2.2, 2.6, 0.12), toon('#3a2618'), 0, 1.3, 0, dr, 0.02); M(BOX(2.6, 0.3, 0.2), beam, 0, 2.75, 0, dr, 0.02); M(new THREE.SphereGeometry(0.07, 8, 6), toon('#e0a84a'), 0.75, 1.25, 0.1, dr, 0);
    const et = signTex('TO THE SQUARE', null, '#e0a84a'); M(BOX(2.2, 0.55, 0.08), [DARK, DARK, DARK, DARK, glowing(0, et, 1.3), DARK], 0, 3.3, 0.06, dr, 0.02);
    M(BOX(2.4, 0.03, 1.2), toon('#7a1d2a'), 0, 0.02, D2 - 1.0, T, 0);
  }
  Object.assign(DIALOGUE, {
    barkeep: [{ who: 'npc', text: 'Welcome in, Fox Soldier. Sit anywhere that is not on fire.' }, { who: 'player', text: 'Busy night?' }, { who: 'npc', text: 'Every pilot on Meru is in for the King\'s birthday. I have poured more ale today than the lake holds.' }, { who: 'npc', text: 'The jukebox only plays one song. Nobody has ever asked me to fix it.' }],
    patron1: [{ who: 'npc', text: 'You flew in for the tournament? Me too. Well, for the free ale.' }, { who: 'npc', text: 'If you beat the Warden, the first round is on me.' }],
    patron2: [{ who: 'npc', text: 'Psst. They say there is a Casino on Meru. Right across the square.' }, { who: 'player', text: 'It has a giant sign that says CASINO.' }, { who: 'npc', text: 'Exactly. Nobody would ever think to look there.' }],
  });
  // ---- dart board on the east wall + oche ----
  const DART = { x: TAV.x + TAV.w / 2 - 0.22, y: 2.0, z: TAV.z - 3.5, oche: TAV.x + TAV.w / 2 - 5.6, R: 0.5 };
  const SEG = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  const boardTex = canvasTex(512, 512, (c) => {
    const C = 256, Rr = 250; c.fillStyle = '#111'; c.beginPath(); c.arc(C, C, Rr, 0, 7); c.fill();
    const ring = (r0, r1, colA, colB) => { for (let i = 0; i < 20; i++) { const a0 = -Math.PI / 2 + (i - 0.5) * Math.PI / 10, a1 = a0 + Math.PI / 10; c.fillStyle = i % 2 ? colB : colA; c.beginPath(); c.arc(C, C, r1, a0, a1); c.arc(C, C, r0, a1, a0, true); c.closePath(); c.fill(); } };
    const S = Rr * 0.8 / DART.R; // board units → px
    ring(0, 0.5 * S, '#1a1a1a', '#f1e6c8'); ring(0.29 * S, 0.32 * S, '#c42d3c', '#2f8a4a'); ring(0.47 * S, 0.5 * S, '#c42d3c', '#2f8a4a');
    c.fillStyle = '#2f8a4a'; c.beginPath(); c.arc(C, C, 0.09 * S, 0, 7); c.fill(); c.fillStyle = '#c42d3c'; c.beginPath(); c.arc(C, C, 0.04 * S, 0, 7); c.fill();
    c.strokeStyle = '#cbd5e1'; c.lineWidth = 1.5; for (let i = 0; i < 20; i++) { const a = -Math.PI / 2 + (i - 0.5) * Math.PI / 10; c.beginPath(); c.moveTo(C + Math.cos(a) * 0.09 * S, C + Math.sin(a) * 0.09 * S); c.lineTo(C + Math.cos(a) * 0.5 * S, C + Math.sin(a) * 0.5 * S); c.stroke(); }
    c.fillStyle = '#f3f2f2'; c.font = '800 26px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; SEG.forEach((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 10; c.fillText(String(n), C + Math.cos(a) * 0.57 * S, C + Math.sin(a) * 0.57 * S); });
  });
  { const db = new THREE.Group(); db.position.set(DART.x, DART.y, DART.z); db.rotation.y = -Math.PI / 2; scene.add(db);
    M(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 40), toon('#3a2618'), 0, 0, -0.04, db, 0.02, 0.85).rotation.x = Math.PI / 2;
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.66, 64), new THREE.MeshToonMaterial({ map: boardTex, gradientMap: grad })); face.position.z = 0.01; db.add(face);
    M(new THREE.TorusGeometry(0.66, 0.035, 8, 48), toon('#cbd5e1'), 0, 0, 0.01, db, 0);
    const sg = signTex('DARTS', null, '#c42d3c'); M(BOX(1.4, 0.36, 0.06), [DARK, DARK, DARK, DARK, glowing(0, sg, 1.2), DARK], 0, 1.05, 0, db, 0.012);
    glowSprite(0, 1.4, 0.4, 0xffd38a, 1.6, db); const L = new THREE.PointLight(0xffd8a0, 8, 5, 1.6); L.position.set(DART.x - 1.2, DART.y + 1.2, DART.z); scene.add(L); tavLights.push({ L, k: 8 });
    const ocheM = M(BOX(0.1, 0.03, 1.4), toon('#e0a84a'), DART.oche, 0.02, DART.z, null, 0);
    for (let k = 0; k < 2; k++) M(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), toon('#e0a84a'), DART.oche + 0.4, 1.1, DART.z - 1.5 + k * 3, null, 0);
    // a chalk scoreboard
    const sb = M(BOX(1.1, 1.3, 0.06), toon('#1c2a22'), 0, 0, 0, null, 0.02); sb.position.set(DART.x - 0.05, 2.2, DART.z - 1.9); sb.rotation.y = -Math.PI / 2;
  }
  { const ringM = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.85, depthWrite: false }); const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 40), ringM); ring.rotation.x = -Math.PI / 2; ring.position.set(DART.oche - 0.4, 0.03, DART.z); scene.add(ring); flames.push({ dartRing: ring, ph: 0 }); }
  const dartAim = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xec3013, transparent: true, depthTest: false, opacity: 0 })); dartAim.scale.setScalar(0.18); dartAim.renderOrder = 8; scene.add(dartAim);
  const thrownDarts = [];
  function makeDartMesh() { const d = new THREE.Group(); M(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 6), toon('#cbd5e1'), 0, 0, 0.07, d, 0).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.022, 0.018, 0.12, 8), toon('#1e293b'), 0, 0, 0.18, d, 0).rotation.x = Math.PI / 2; for (let k = 0; k < 3; k++) { const f = M(BOX(0.003, 0.06, 0.08), toon('#38bdf8'), 0, 0, 0.27, d, 0); f.rotation.z = k * Math.PI / 3; } scene.add(d); return d; }
  function dartScore(u, v) { const r = Math.hypot(u, v); if (r < 0.04) return [50, 'BULLSEYE']; if (r < 0.09) return [25, 'OUTER BULL']; if (r > 0.5) return [0, 'MISS'];
    let a = Math.atan2(u, v); const idx = ((Math.round(a / (Math.PI / 10)) % 20) + 20) % 20, n = SEG[idx];
    if (r > 0.29 && r < 0.32) return [n * 3, 'TRIPLE ' + n]; if (r > 0.47) return [n * 2, 'DOUBLE ' + n]; return [n, String(n)]; }
  // ===== DARTS: the tavern's own rules (drifting sight + timed power bar), played on the real board =====
  const PERFECT = 0.72;
  const chalkCv = document.createElement('canvas'); chalkCv.width = 256; chalkCv.height = 300; const chalkTex = new THREE.CanvasTexture(chalkCv); chalkTex.colorSpace = THREE.SRGBColorSpace;
  { const sbm = scene.children.find(o => o.isMesh && o.geometry && o.geometry.parameters && o.geometry.parameters.width === 1.1 && o.geometry.parameters.height === 1.3); if (sbm) { const face = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.2), new THREE.MeshBasicMaterial({ map: chalkTex, transparent: true })); face.position.set(0, 0, 0.035); sbm.add(face); } }
  function drawChalk(D) { const c = chalkCv.getContext('2d'); c.clearRect(0, 0, 256, 300); c.fillStyle = 'rgba(255,255,255,0.92)'; c.font = '700 30px Archivo, Arial'; c.textAlign = 'left'; c.fillText('DARTS', 22, 44); c.fillRect(22, 56, 212, 3);
    c.font = '600 24px Archivo, Arial'; (D ? D.log : []).forEach((l, i) => c.fillText((i + 1) + '.  ' + l.label + '  ' + l.pts, 22, 98 + i * 40)); c.fillRect(22, 222, 212, 2);
    c.font = '800 30px Archivo, Arial'; c.fillText('TOTAL ' + (D ? D.score : 0), 22, 262); c.font = '600 18px Archivo, Arial'; c.fillText('BEST ' + (save.stat('meru.darts.best')), 22, 290); chalkTex.needsUpdate = true; }
  let chalkInit = false;
  const dartPops = [];
  function dartPop(text, color, big) { const t = canvasTex(512, 128, (c) => { c.font = '900 ' + (big ? 72 : 64) + 'px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 12; c.strokeStyle = '#201e1d'; c.strokeText(text, 256, 64); c.fillStyle = color; c.fillText(text, 256, 64); });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.scale.set(big ? 2.6 : 1.6, big ? 0.65 : 0.4, 1); s.position.set(DART.x - 0.3, DART.y + 0.95, DART.z); s.renderOrder = 12; scene.add(s); dartPops.push({ s, t: 0, big }); }
  const sparkGeoD = new THREE.BufferGeometry(), sparkArrD = new Float32Array(90 * 3).fill(-999), sparkVD = Array.from({ length: 90 }, () => ({ v: new THREE.Vector3(), life: 0, c: 0 }));
  sparkGeoD.setAttribute('position', new THREE.BufferAttribute(sparkArrD, 3)); const sparksD = new THREE.Points(sparkGeoD, new THREE.PointsMaterial({ color: 0xffd38a, map: dotTex, size: 0.06, transparent: true, depthWrite: false, alphaTest: 0.1, blending: THREE.AdditiveBlending })); sparksD.frustumCulled = false; scene.add(sparksD);
  function dartSparks(p, n, sp = 2.2) { for (let k = 0; k < n; k++) { const i = (St.sparkI = ((St.sparkI || 0) + 1) % 90), s = sparkVD[i]; s.life = rr(0.3, 0.7); s.v.set(rr(-1.4, -0.2), rr(-0.6, 1.4), rr(-1, 1)).normalize().multiplyScalar(rr(0.5, 1) * sp); sparkArrD.set([p.x, p.y, p.z], i * 3); } }
  function dartsPress() {
    const D = St.darts;
    if (!D) {
      thrownDarts.forEach(d => scene.remove(d)); thrownDarts.length = 0;
      const start = () => { St.darts = { phase: 'aim', n: 0, score: 0, t: 0, p: 0, pdir: 1, log: [], hold: 0 }; drawChalk(St.darts); audio.tone(520, 0.1, 0.04, 'triangle', 1.3); };
      const intro = [{ name: 'The Tavern presents', role: 'Darts', text: 'DARTS — three darts, a perfect 180. Double bull is 50.' }];
      if (!St.dartTut) { St.dartTut = true; intro.push({ name: 'Follow the sight', role: 'How to play · 1 of 2', text: 'The red sight drifts across the board on its own. Wherever it is when you throw is where the dart goes — so watch it, and pick your moment.' }, { name: 'Time the power', role: 'How to play · 2 of 2', text: 'The bar on the right rises and falls. TAP ANYWHERE to lock it and throw. Stop it near the white line for a clean throw — too little and the dart drops low.' }); }
      St.dialog = { npc: null, at: [Pl.x, Pl.z], lines: intro, i: 0, chars: 0, then: start }; audio.blip(); return;
    }
    if (D.phase !== 'aim') return;
    // LOCK: the sight and the bar are where they are
    D.phase = 'wind'; D.wind = 0; D.lock = { u: D.u, v: D.v, p: D.p }; audio.burst(0.05, 2400, 0.06);
  }
  function releaseDart(D) {
    const { u, v, p } = D.lock, err = p - PERFECT;
    const du = rr(-1, 1) * Math.abs(err) * 0.16, dv = err * 0.55 + rr(-0.01, 0.01);
    const fu = u + du, fv = v + dv;
    const dm = makeDartMesh(); player.updateMatrixWorld(true);
    const from = new THREE.Vector3(); player.userData.P.arms[1].getWorldPosition(from); from.y += 0.25;
    const to = new THREE.Vector3(DART.x - 0.02, DART.y + fv, DART.z - fu);
    D.fly = { dm, from, to, t: 0, u: fu, v: fv, clean: Math.abs(err) < 0.06 }; D.phase = 'fly'; audio.burst(0.1, 3200, 0.1); audio.tone(300, 0.25, 0.02, 'sine', 2.2);
  }
  function landDart(D) {
    const F = D.fly; F.dm.position.copy(F.to); F.dm.position.x -= 0.1; thrownDarts.push(F.dm);
    const [pts, label] = dartScore(F.u, F.v); D.score += pts; D.n++; D.log.push({ label, pts }); drawChalk(D);
    const hit = new THREE.Vector3(DART.x - 0.05, F.to.y, F.to.z);
    audio.burst(0.06, 900, 0.18); audio.tone(pts >= 50 ? 1200 : pts >= 30 ? 980 : pts ? 700 : 180, 0.14, 0.05, pts ? 'triangle' : 'square', pts >= 50 ? 1.5 : 1);
    if (pts) dartSparks(hit, pts >= 50 ? 40 : /TRIPLE/.test(label) ? 30 : 12, pts >= 50 ? 3 : 2.2);
    dartPop(label === 'MISS' ? 'MISS' : label + (F.clean ? ' · CLEAN' : ''), pts >= 50 ? '#ffd76a' : /TRIPLE/.test(label) ? '#5fe3ff' : /DOUBLE/.test(label) ? '#ec3013' : pts ? '#f3f2f2' : '#9b9797');
    if (pts >= 25 || /TRIPLE/.test(label)) { player.userData.hop = 1; npcs.forEach(n => { if (inTav(n.x, n.z)) n.c.userData.hop = 1; }); }
    D.phase = 'landed'; D.hold = 0.85; St.tavCheer = pts >= 25 || /TRIPLE/.test(label) ? 1 : 0;
  }
  function updateDarts(dt) {
    if (!chalkInit) { chalkInit = true; drawChalk(null); }
    for (let i = dartPops.length - 1; i >= 0; i--) { const p = dartPops[i]; p.t += dt; p.s.position.y += dt * 0.5; p.s.material.opacity = 1 - smooth(p.big ? 1.6 : 0.8, p.big ? 2.4 : 1.3, p.t); if (p.t > (p.big ? 2.4 : 1.3)) { scene.remove(p.s); p.s.material.map.dispose(); dartPops.splice(i, 1); } }
    for (let i = 0; i < 90; i++) { const s = sparkVD[i]; if (s.life <= 0) continue; s.life -= dt; s.v.y -= 6 * dt; sparkArrD[i * 3] += s.v.x * dt; sparkArrD[i * 3 + 1] += s.v.y * dt; sparkArrD[i * 3 + 2] += s.v.z * dt; if (s.life <= 0) sparkArrD[i * 3 + 1] = -999; } sparkGeoD.attributes.position.needsUpdate = true;
    const D = St.darts; if (!D) { dartAim.material.opacity = 0; return; }
    if (Math.hypot(DART.oche - 0.4 - Pl.x, DART.z - Pl.z) > 3.4) { St.darts = null; dartAim.material.opacity = 0; return; }
    D.t += dt; const wob = 0.3 * (1 - Math.min(0.5, D.n * 0.06));
    if (D.phase === 'aim') {
      D.u = Math.sin(D.t * 1.9) * wob + Math.sin(D.t * 4.7) * 0.05; D.v = Math.sin(D.t * 2.6 + 1) * wob * 0.9 + Math.cos(D.t * 3.9) * 0.05;
      D.p += D.pdir * dt * 1.15; if (D.p > 1) { D.p = 1; D.pdir = -1; } if (D.p < 0) { D.p = 0; D.pdir = 1; }
    }
    const show = D.phase === 'aim' ? D : D.lock || D; dartAim.position.set(DART.x - 0.04, DART.y + (show.v || 0), DART.z - (show.u || 0)); dartAim.material.opacity = D.phase === 'aim' ? 0.95 : D.phase === 'wind' ? 0.6 : 0; dartAim.scale.setScalar(0.16 + Math.sin(St.t * 8) * 0.015);
    // the fox: arm draws back with the bar, snaps forward on release
    const arm = player.userData.P.arms[1]; Pl.face = Math.PI / 2; player.rotation.y = Pl.face;
    if (D.phase === 'aim') { arm.rotation.set(-1.5 - D.p * 0.9, 0, 0.2); }
    if (D.phase === 'wind') { D.wind += dt; arm.rotation.set(lerp(-1.5 - D.lock.p * 0.9, -2.6, smooth(0, 0.14, D.wind)), 0, 0.2); if (D.wind > 0.16) releaseDart(D); }
    if (D.phase === 'fly') { const F = D.fly; F.t += dt / 0.42; const k = Math.min(1, F.t); arm.rotation.set(lerp(-2.6, -0.9, smooth(0, 0.25, k)), 0, 0.2);
      F.dm.position.lerpVectors(F.from, F.to, k); F.dm.position.y += Math.sin(k * Math.PI) * 0.28; F.dm.lookAt(F.to.x - 1, F.to.y, F.to.z); F.dm.rotateY(Math.PI); F.dm.rotateZ(k * 8);
      if (k >= 1) landDart(D); }
    if (D.phase === 'landed') { D.hold -= dt; if (D.hold <= 0) {
      if (D.n < 3) { D.phase = 'aim'; D.t = rr(0, 6); }
      else { const total = D.score, best = Math.max(save.stat('meru.darts.best'), total); save.best('meru.darts.best', best); drawChalk(D);
        const ton80 = D.log.every(l => l.label === 'TRIPLE 20'); if (ton80) { dartPop('ONE HUNDRED AND EIGHTY!', '#ffd76a', true); dartSparks(new THREE.Vector3(DART.x - 0.2, DART.y, DART.z), 90, 4); player.userData.hop = 1; }
        const say = ton80 ? 'ONE HUNDRED AND EIGHTY! Mott drops a glass. The whole tavern is on its feet.' : total >= 100 ? 'A ton! The whole tavern cheers.' : total >= 60 ? 'Not bad at all. Mott nods.' : 'Mott pretends not to see.';
        St.darts = null; dartAim.material.opacity = 0;
        St.dialog = { npc: null, at: [Pl.x, Pl.z], lines: [{ name: 'Mott', role: 'Keeps score', text: D.log.map(l => l.label).join(' · ') + ' — ' + total + ' points. ' + say }, { name: 'Darts', role: 'Best tonight · ' + best, text: 'Step back to the line and press E to throw again.' }], i: 0, chars: 0 }; audio.blip(); } }
    }
  }
  const SONGS = [
    { n: 'A1', genre: 'COUNTRY', title: 'SPACE HORSE', file: 'JUKEBOX-COUNTRY.mp3', bpm: 104, col: '#ffd23a' },
    { n: 'A2', genre: 'JAZZ', title: 'FLY ME PAST THE MOON', file: 'JUKEBOX-FLY-ME-PAST-THE-MOON.mp3', bpm: 92, col: '#38bdf8' },
    { n: 'A3', genre: 'OPERA', title: 'PHANTOM OF THE UNIVERSE', file: 'JUKEBOX-PHANTOM.mp3', bpm: 70, col: '#c084fc' },
    { n: 'A4', genre: 'ROCKABILLY', title: 'SPACE FOX', file: 'JUKEBOX-SPACE-FOX.mp3', bpm: 160, col: '#ec3013' },
    { n: 'A5', genre: 'ROCK & ROLL', title: 'BLAST OFF', file: 'JUKEBOX-ROCK-AND-ROLL.mp3', bpm: 150, col: '#ff3bd4' },
  ];
  const JPOS = () => [TAV.x + TAV.w / 2 - 3.0, TAV.z + 5];
  function stopSong() { if (JUKE.audio) { JUKE.audio.pause(); JUKE.audio.src = ''; JUKE.audio = null; } if (JUKE.synth) { clearInterval(JUKE.synth.iv); JUKE.synth.out.disconnect(); JUKE.synth = null; } JUKE.playing = -1; }
  function synthSong(s) { // a stand-in groove in the song's style, so the box is never silent
    audio.init(); const ctx = audio.ctx; if (!ctx) return; const out = ctx.createGain(); out.gain.value = 0; out.connect(audio.master);
    const roots = { COUNTRY: [196, 247, 294, 247], JAZZ: [174.6, 233, 196, 261.6], OPERA: [220, 174.6, 196, 164.8], ROCKABILLY: [164.8, 220, 246.9, 220], 'ROCK & ROLL': [196, 261.6, 293.7, 261.6] }[s.genre];
    const beatDur = 60 / s.bpm; let step = 0; const next = { t: ctx.currentTime + 0.05 };
    const note = (f, t, d, type, v) => { const o = ctx.createOscillator(), gg = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(v, t + 0.01); gg.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(gg); gg.connect(out); o.start(t); o.stop(t + d + 0.05); };
    const hat = (t, v) => { const b = ctx.createBufferSource(); b.buffer = audio.noise; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000; const gg = ctx.createGain(); gg.gain.setValueAtTime(v, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); b.connect(f); f.connect(gg); gg.connect(out); b.start(t, Math.random()); b.stop(t + 0.06); };
    const iv = setInterval(() => { while (next.t < ctx.currentTime + 0.25) { const bar = Math.floor(step / 8) % 4, r = roots[bar], b8 = step % 8, t = next.t;
        if (b8 % 2 === 0) note(r / 2, t, beatDur * 0.9, 'triangle', 0.22);
        if (s.genre === 'OPERA') { if (b8 === 0) [1, 1.26, 1.5].forEach(m => note(r * m, t, beatDur * 3.5, 'sine', 0.06)); if (b8 % 2 === 0) note(r * 2 * (b8 === 4 ? 1.5 : 1.26), t, beatDur * 1.6, 'sine', 0.08); }
        else { if (b8 === 2 || b8 === 6) [1, 1.26, 1.5].forEach(m => note(r * m, t, beatDur * 0.35, s.genre === 'JAZZ' ? 'sine' : 'square', 0.035)); hat(t, s.genre === 'JAZZ' ? 0.05 : 0.08); if (b8 === 0 || b8 === 4) note(70, t, 0.12, 'sine', 0.35); if (s.genre !== 'COUNTRY' && Math.random() < 0.35) note(r * 2 * [1, 1.12, 1.26, 1.5, 1.68][Math.floor(Math.random() * 5)], t, beatDur * 0.4, 'triangle', 0.05); }
        next.t += beatDur / 2; step++; } }, 60);
    JUKE.synth = { iv, out };
  }
  function playSong(i) {
    stopSong(); const s = SONGS[i]; if (!s) return; JUKE.playing = i; JUKE.err = null; JUKE.beat = 0;
    const a = new Audio(); a.loop = true; a.volume = 0; a.src = 'MERU/MUSIC/JUKEBOX/' + s.file; JUKE.audio = a;
    a.addEventListener('error', () => { if (JUKE.audio === a) { JUKE.audio = null; JUKE.err = 'synth'; synthSong(s); } }, { once: true });
    a.play().catch(() => { if (JUKE.audio === a && !JUKE.synth) { JUKE.audio = null; JUKE.err = 'synth'; synthSong(s); } });
    audio.tone(1320, 0.06, 0.04, 'square'); setTimeout(() => audio.tone(990, 0.08, 0.04, 'square'), 70);
  }
  const notes = []; const noteTex = canvasTex(64, 64, (c) => { c.fillStyle = '#fff'; c.font = '900 52px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('\u266A', 32, 34); });
  function updateJuke(dt) {
    const [jx, jz] = JPOS(), dist = Math.hypot(Pl.x - jx, Pl.z - jz), here = St.indoor;
    const vol = here && JUKE.playing >= 0 ? clamp(1 - (dist - 2) / 18, 0.12, 1) * (St.muted ? 0 : 1) : 0;
    if (JUKE.audio) JUKE.audio.volume = damp(JUKE.audio.volume, vol * 0.8, 4, dt);
    if (JUKE.synth && audio.ctx) JUKE.synth.out.gain.setTargetAtTime(vol * 0.9, audio.ctx.currentTime, 0.2);
    if (!here && JUKE.playing >= 0 && JUKE.audio && JUKE.audio.volume < 0.01) { /* keeps its place: resumes when you come back in */ }
    const s = SONGS[JUKE.playing], playing = !!s; JUKE.beat += dt * (s ? s.bpm / 60 : 0.5);
    const pulse = playing ? Math.pow(0.5 + 0.5 * Math.cos(JUKE.beat * Math.PI * 2), 3) : 0.5 + 0.5 * Math.sin(St.t * 2);
    JUKE.neon.forEach((m, k) => { m.emissiveIntensity = (playing ? 1.4 + pulse * 2.2 : 1.1 + pulse * 0.6); m.emissive.setHSL(((St.t * (playing ? 0.25 : 0.06)) + k * 0.33) % 1, 0.95, 0.6); m.color.copy(m.emissive); });
    if (JUKE.light) { JUKE.light.visible = here; JUKE.light.intensity = playing ? 6 + pulse * 10 : 3; JUKE.light.color.setHSL((St.t * 0.25) % 1, 0.9, 0.6); }
    if (JUKE.glow) { JUKE.glow.material.opacity = playing ? 0.35 + pulse * 0.45 : 0.3; JUKE.glow.scale.setScalar(playing ? 4.2 + pulse * 1.4 : 4); }
    if (JUKE.group) JUKE.group.scale.setScalar(1.55 * (1 + (playing ? pulse * 0.02 : 0)));
    if (JUKE.ring) { JUKE.ring.material.opacity = JUKE.open ? 0.2 : 0.45 + 0.35 * Math.sin(St.t * 3); JUKE.ring.scale.setScalar(1 + 0.06 * Math.sin(St.t * 3)); }
    if (playing && here && Math.random() < dt * (s.bpm / 40)) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: noteTex, color: new THREE.Color(s.col), transparent: true, depthWrite: false })); sp.scale.setScalar(rr(0.28, 0.42)); sp.position.set(jx + 1.6 + rr(-0.4, 0.2), 3.2, jz + rr(-0.8, 0.8)); scene.add(sp); notes.push({ sp, t: 0, vx: rr(-0.5, -0.1), vz: rr(-0.25, 0.25), ph: rr(0, 6) }); }
    for (let i = notes.length - 1; i >= 0; i--) { const n = notes[i]; n.t += dt; n.sp.position.x += n.vx * dt; n.sp.position.z += (n.vz + Math.sin(n.t * 3 + n.ph) * 0.3) * dt; n.sp.position.y += dt * 0.7; n.sp.material.opacity = 1 - smooth(1.6, 2.6, n.t); if (n.t > 2.6) { scene.remove(n.sp); n.sp.material.dispose(); notes.splice(i, 1); } }
    // tavern foxes bob to the beat
    if (playing && here) npcs.forEach(n => { if (inTav(n.x, n.z)) { n.c.userData.P.body.position.y = Math.abs(Math.sin(JUKE.beat * Math.PI)) * 0.06; n.c.userData.P.head.rotation.z = Math.sin(JUKE.beat * Math.PI) * 0.1; } });
    if (JUKE.open && dist > 4) JUKE.open = false;
  }
  // ===== THE CASINO — same scene, east of the tavern; machines open the file's own casino games =====
  const CAS = { x: 70, z: 230, w: 28, d: 22, h: 7 };
  const casLights = [], CAS_GAMES = [], TVS = [];
  { const T = new THREE.Group(); T.position.set(CAS.x, 0, CAS.z); scene.add(T); camBlockers.push(T);
    const W2 = CAS.w / 2, D2 = CAS.d / 2, gold = toon('#e0a84a', { emissive: new THREE.Color('#6a4a10'), emissiveIntensity: 0.3 }), navy = toon('#1b2147'), velvet = toon('#7a1d2a');
    const carpet = canvasTex(256, 256, (c) => { c.fillStyle = '#5a0f1c'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#d9a64a'; c.lineWidth = 4; for (let i = -1; i < 3; i++) { c.beginPath(); c.moveTo(i * 128, 0); c.lineTo(i * 128 + 128, 128); c.lineTo(i * 128, 256); c.stroke(); c.beginPath(); c.moveTo(i * 128 + 128, 0); c.lineTo(i * 128, 128); c.lineTo(i * 128 + 128, 256); c.stroke(); } c.fillStyle = '#d9a64a'; for (const [x, y] of [[0, 0], [128, 128], [256, 0], [0, 256], [256, 256]]) { c.beginPath(); c.arc(x, y, 10, 0, 7); c.fill(); } }, [CAS.w / 3, CAS.d / 3]);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(CAS.w, CAS.d), new THREE.MeshToonMaterial({ map: carpet, gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; T.add(fl);
    const panel = texMat('panel', '#232a5a', 5, 1.6);
    for (const [x, z, w, ry] of [[0, -D2, CAS.w, 0], [0, D2, CAS.w, Math.PI], [-W2, 0, CAS.d, Math.PI / 2], [W2, 0, CAS.d, -Math.PI / 2]]) { const wg = new THREE.Group(); wg.position.set(x, 0, z); wg.rotation.y = ry; T.add(wg);
      const wm = new THREE.Mesh(new THREE.BoxGeometry(w, CAS.h, 0.3), panel); wm.position.y = CAS.h / 2; wm.receiveShadow = true; wg.add(wm);
      M(BOX(w, 0.18, 0.4), gold, 0, 1.1, 0.05, wg, 0); M(BOX(w, 0.3, 0.42), gold, 0, CAS.h - 0.15, 0.05, wg, 0); M(BOX(w, 1.0, 0.34), velvet, 0, 0.5, 0.02, wg, 0); }
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(CAS.w + 0.6, 0.3, CAS.d + 0.6), toon('#12142c')); ceil.position.y = CAS.h + 0.15; T.add(ceil);
    // chandeliers
    for (const [x, z] of [[-7, -3], [7, -3], [0, 4]]) { M(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 4), gold, x, CAS.h - 0.7, z, T, 0); for (const [r, y] of [[1.0, CAS.h - 1.5], [0.6, CAS.h - 1.2]]) { M(new THREE.TorusGeometry(r, 0.05, 6, 28), gold, x, y, z, T, 0).rotation.x = Math.PI / 2; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; M(new THREE.SphereGeometry(0.07, 6, 4), lampM, x + Math.cos(a) * r, y - 0.08, z + Math.sin(a) * r, T, 0); } } glowSprite(x, CAS.h - 1.4, z, 0xffd38a, 4.5, T); const L = new THREE.PointLight(0xffd8a0, 26, 16, 1.5); L.position.set(CAS.x + x, CAS.h - 1.6, CAS.z + z); scene.add(L); casLights.push({ L, k: 26 }); }
    // big neon sign on the back wall
    const cs = signTex('CASINO', (c, x, y, a) => { c.fillStyle = a; c.beginPath(); c.arc(x + 22, y, 18, 0, 7); c.fill(); }, '#ffd23a'); M(BOX(7, 1.75, 0.15), [DARK, DARK, DARK, DARK, glowing(0, cs, 1.6), DARK], 0, CAS.h - 1.3, -D2 + 0.3, T, 0.03);
    const station = (key, label, x, z, face) => { CAS_GAMES.push({ key, label, x: CAS.x + x, z: CAS.z + z, face }); const ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.92, 40), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.7, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(CAS.x + x, 0.03, CAS.z + z); scene.add(ring); flames.push({ casRing: ring, ph: x }); };
    // slot machines: a bank of three per game along the west wall
    const reelsT = (syms, col) => canvasTex(256, 128, (c) => { c.fillStyle = '#fff8ec'; c.fillRect(0, 0, 256, 128); c.font = '900 64px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; syms.forEach((s, i) => { c.fillStyle = col[i % col.length]; c.fillText(s, 43 + i * 85, 66); }); c.fillStyle = '#201e1d'; c.fillRect(84, 0, 4, 128); c.fillRect(169, 0, 4, 128); });
    const slotDef = [['slotFox', '1LINE FOX SLOT', ['7', '\u2605', '7'], '#ec3013'], ['slot1', '1LINE SLOT', ['\u2666', '7', '\u2666'], '#38bdf8'], ['slot3', '3LINE SLOT', ['\u2605', '\u2605', '\u2605'], '#ffd23a']];
    slotDef.forEach(([key, label, syms, col], row) => { const z0 = -6 + row * 5.2;
      for (let k = -1; k <= 1; k++) { const sm = new THREE.Group(); sm.position.set(-W2 + 1.1, 0, z0 + k * 1.35); sm.rotation.y = Math.PI / 2; T.add(sm);
        M(BOX(1.15, 1.9, 0.9), navy, 0, 0.95, 0, sm, 0.03); M(BOX(1.2, 0.5, 0.95), toon(col), 0, 2.1, 0, sm, 0.03); M(BOX(1.25, 0.12, 1.0), gold, 0, 1.86, 0, sm, 0.012);
        const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.48), new THREE.MeshToonMaterial({ map: reelsT(syms, ['#ec3013', '#201e1d', '#2f8a4a']), gradientMap: grad, emissive: 0xffffff, emissiveMap: reelsT(syms, ['#ec3013', '#201e1d', '#2f8a4a']), emissiveIntensity: 0.5 })); scr.position.set(0, 1.35, 0.46); sm.add(scr);
        M(BOX(1.0, 0.1, 0.35), gold, 0, 0.98, 0.5, sm, 0.012); for (let b = -1; b <= 1; b++) M(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 10), glowing(b ? '#38bdf8' : '#ec3013', null, 1.6), b * 0.25, 1.06, 0.55, sm, 0).rotation.x = Math.PI / 2;
        const arm = M(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), STEEL, 0.62, 1.5, 0.1, sm, 0.01); M(new THREE.SphereGeometry(0.08, 10, 8), toon('#ec3013'), 0, 0.32, 0, arm, 0.01);
        const top = M(new THREE.SphereGeometry(0.16, 12, 8), glowing(col, null, 2), 0, 2.48, 0, sm, 0.01); flames.push({ slotTop: top, ph: row * 2 + k });
        const lt = signTex(label.replace('1LINE ', '1-LINE ').replace('3LINE ', '3-LINE '), null, col); M(BOX(1.1, 0.28, 0.04), [DARK, DARK, DARK, DARK, glowing(0, lt, 1.4), DARK], 0, 2.1, 0.5, sm, 0); }
      colliders.push({ box: [CAS.x - W2, CAS.x - W2 + 1.7, CAS.z + z0 - 2.1, CAS.z + z0 + 2.1] });
      station(key, label, -W2 + 2.6, z0, -Math.PI / 2); });
    // the treasure wheel on the back wall
    const segs = ['10', '50', '5', '100', '20', '2x', '10', 'JACKPOT', '25', '5', '50', 'LOSE'];
    const wheelT = canvasTex(512, 512, (c) => { const C = 256, n = segs.length; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2 - Math.PI / 2, a1 = a0 + Math.PI * 2 / n; c.fillStyle = i % 2 ? '#c42d3c' : '#f2f0ea'; if (segs[i] === 'JACKPOT') c.fillStyle = '#e0a84a'; if (segs[i] === 'LOSE') c.fillStyle = '#201e1d'; c.beginPath(); c.moveTo(C, C); c.arc(C, C, 250, a0, a1); c.closePath(); c.fill();
      c.save(); c.translate(C, C); c.rotate(a0 + Math.PI / n); c.fillStyle = segs[i] === 'LOSE' || i % 2 ? '#fff' : '#201e1d'; c.font = '900 ' + (segs[i].length > 4 ? 26 : 38) + 'px Arial'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText(segs[i], 230, 0); c.restore(); } c.fillStyle = '#e0a84a'; c.beginPath(); c.arc(C, C, 40, 0, 7); c.fill(); });
    const wheel = new THREE.Group(); wheel.position.set(0, 3.4, -D2 + 0.55); T.add(wheel);
    M(new THREE.CylinderGeometry(2.55, 2.55, 0.25, 48), gold, 0, 0, -0.1, wheel, 0.03, 2.55).rotation.x = Math.PI / 2;
    const disc = new THREE.Mesh(new THREE.CircleGeometry(2.4, 64), new THREE.MeshToonMaterial({ map: wheelT, gradientMap: grad, emissive: 0xffffff, emissiveMap: wheelT, emissiveIntensity: 0.3 })); disc.position.z = 0.05; wheel.add(disc); flames.push({ wheelDisc: disc });
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; const b = M(new THREE.SphereGeometry(0.09, 8, 6), lampM, Math.cos(a) * 2.55, Math.sin(a) * 2.55, 0.1, wheel, 0); flames.push({ chase: b, ph: k }); }
    const ptr = M(new THREE.ConeGeometry(0.25, 0.6, 3), toon('#ec3013'), 0, 2.85, 0.25, wheel, 0.02); ptr.rotation.z = Math.PI;
    M(BOX(4.8, 0.9, 1.2), navy, 0, 0.45, -D2 + 1.2, T, 0.03); M(BOX(5.0, 0.1, 1.35), gold, 0, 0.92, -D2 + 1.2, T, 0.012);
    colliders.push({ box: [CAS.x - 2.6, CAS.x + 2.6, CAS.z - D2, CAS.z - D2 + 2.0] });
    station('wheel', 'TREASURE WHEEL', 0, -D2 + 3.3, 0);
    // two card tables with a dealer each
    const table = (key, label, x, z, felt) => { const tg = new THREE.Group(); tg.position.set(x, 0, z); T.add(tg);
      const top = M(new THREE.CylinderGeometry(1.7, 1.7, 0.14, 40), toon(felt), 0, 0.98, 0, tg, 0.03, 1.7); top.scale.z = 0.62; const rim = M(new THREE.TorusGeometry(1.7, 0.09, 8, 40), toon('#6b4a35'), 0, 1.06, 0, tg, 0); rim.rotation.x = Math.PI / 2; rim.scale.y = 0.62;
      M(new THREE.CylinderGeometry(0.25, 0.4, 0.9, 12), DARK, 0, 0.45, 0, tg, 0.02, 0.4);
      for (let k = 0; k < 5; k++) { const cd = M(BOX(0.22, 0.01, 0.32), toon('#f7f1e6'), -0.6 + k * 0.3, 1.07, 0.15, tg, 0.004); cd.rotation.y = rr(-0.15, 0.15); }
      for (const [cx, cz, col] of [[0.9, -0.2, '#ec3013'], [1.05, 0.1, '#38bdf8'], [-1.0, -0.15, '#ffd23a']]) for (let k = 0; k < 4; k++) M(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 12), toon(col), cx, 1.09 + k * 0.03, cz, tg, 0);
      for (const a of [-0.8, 0, 0.8]) { const sx = Math.sin(a) * 2.3, sz = Math.cos(a) * 1.55; M(new THREE.CylinderGeometry(0.28, 0.24, 0.12, 14), velvet, sx, 0.62, sz, tg, 0.012, 0.28); M(new THREE.CylinderGeometry(0.05, 0.07, 0.6, 8), gold, sx, 0.3, sz, tg, 0); }
      const lt = signTex(label, null, '#e0a84a'); const sgn = M(BOX(2.6, 0.55, 0.06), [DARK, DARK, DARK, DARK, glowing(0, lt, 1.4), DARK], 0, 2.9, -1.5, tg, 0.012);
      const L = new THREE.PointLight(0xfff2d0, 10, 6, 1.6); L.position.set(CAS.x + x, 3.2, CAS.z + z); scene.add(L); casLights.push({ L, k: 10 });
      colliders.push({ c: [CAS.x + x, CAS.z + z, 1.9] });
      station(key, label, x, z + 2.4, Math.PI); return tg; };
    table('poker5', '5 CARD POKER', -5.2, -0.5, '#1f6b45'); table('pokerTexas', "TEXAS HOLD'EM", 5.2, -0.5, '#1e4f7a');
    for (let k = 0; k < 6; k++) { const z = 8 - k * 3.1; for (const sx of [-1.6, 1.6]) { M(new THREE.CylinderGeometry(0.06, 0.08, 0.9, 8), gold, sx, 0.45, z, T, 0.01, 0.08); M(new THREE.SphereGeometry(0.09, 8, 6), gold, sx, 0.95, z, T, 0); } }
    M(BOX(2.6, 0.02, 17), toon('#e0a84a'), 0, 0.012, -0.2, T, 0); M(BOX(2.3, 0.025, 16.8), toon('#7a1d2a'), 0, 0.016, -0.2, T, 0);
    // cashier cage against the east wall, with the cashier behind it
    { const cz = 5.0, cx = W2 - 1.9; M(BOX(1.1, 1.2, 4.6), toon('#6b4a35'), cx, 0.6, cz, T, 0.03); M(BOX(1.3, 0.1, 4.8), gold, cx, 1.24, cz, T, 0.012);
      for (let k = 0; k < 9; k++) M(new THREE.CylinderGeometry(0.025, 0.025, 1.7, 5), gold, cx - 0.45, 2.1, cz - 2.2 + k * 0.55, T, 0);
      M(BOX(0.12, 0.12, 4.6), gold, cx - 0.45, 2.95, cz, T, 0); for (const s of [-1, 1]) M(BOX(1.9, 3.0, 0.12), toon('#3a2618'), W2 - 0.95, 1.5, cz + s * 2.35, T, 0.02);
      M(BOX(0.7, 0.3, 0.6), toon('#e0a84a'), cx - 0.55, 1.42, cz, T, 0.01); M(BOX(1.85, 0.12, 4.8), toon('#3a2618'), W2 - 0.95, 3.05, cz, T, 0.02);
      for (let k = 0; k < 6; k++) M(new THREE.CylinderGeometry(0.1, 0.1, 0.05 + k * 0.03, 12), toon('#e0a84a'), cx - 0.2, 1.3 + k * 0.025, cz + 1.4, T, 0);
      const cs2 = signTex('CASHIER', null, '#e0a84a'); const sg = M(BOX(2.4, 0.5, 0.06), [DARK, DARK, DARK, DARK, glowing(0, cs2, 1.3), DARK], W2 - 0.2, 3.6, cz, T, 0.01); sg.rotation.y = -Math.PI / 2;
      colliders.push({ box: [CAS.x + W2 - 2.5, CAS.x + W2, CAS.z + cz - 2.5, CAS.z + cz + 2.5] }); }
    // TV screens: either side of the wheel, and on the free stretches of the slot wall
    const tvSet = (x, y, z, ry, w, h, sport) => { const tg = new THREE.Group(); tg.position.set(x, y, z); tg.rotation.y = ry; T.add(tg);
      M(BOX(w + 0.25, h + 0.25, 0.18), toon('#0f0f12'), 0, 0, 0, tg, 0.02); const cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round(512 * h / w); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex })); scr.position.z = 0.1; tg.add(scr);
      M(BOX(0.6, 0.1, 0.1), toon('#ec3013', { emissive: new THREE.Color('#ec3013'), emissiveIntensity: 1.2 }), w / 2 - 0.4, -h / 2 - 0.05, 0.1, tg, 0);
      TVS.push({ cv, tex, sport, t: rr(0, 10) }); };
    tvSet(-8.2, 4.1, -D2 + 0.22, 0, 4.2, 2.36, 'boxing'); tvSet(8.2, 4.1, -D2 + 0.22, 0, 4.2, 2.36, 'horses');
    tvSet(-W2 + 0.22, 3.6, -9.1, Math.PI / 2, 3.1, 1.74, 'baseball'); tvSet(-W2 + 0.22, 3.6, 8.6, Math.PI / 2, 3.1, 1.74, 'soccer');
    const dr = new THREE.Group(); dr.position.set(0, 0, D2 - 0.18); dr.rotation.y = Math.PI; T.add(dr);
    M(BOX(2.6, 3.0, 0.12), toon('#3a2618'), 0, 1.5, 0, dr, 0.02); M(BOX(3.0, 0.32, 0.2), gold, 0, 3.1, 0, dr, 0.02);
    const et = signTex('TO THE SQUARE', null, '#e0a84a'); M(BOX(2.4, 0.6, 0.08), [DARK, DARK, DARK, DARK, glowing(0, et, 1.3), DARK], 0, 3.7, 0.06, dr, 0.02);
    M(BOX(2.6, 0.03, 1.2), velvet, 0, 0.02, D2 - 1.0, T, 0);
  }
  // ---- the broadcasts: cartoon fox athletes, drawn live ----
  function drawFoxAth(c, x, y, s, jersey, face = 1, pose = 0) {
    c.save(); c.translate(x, y); c.scale(face * s, s);
    c.fillStyle = '#f07a2a'; c.beginPath(); c.moveTo(-14, 6); c.quadraticCurveTo(-30, 0 + pose * 4, -26, -14); c.quadraticCurveTo(-18, -2, -10, 4); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(-26, -13, 4, 0, 7); c.fill();
    c.fillStyle = '#1e293b'; c.fillRect(-9, 14, 6, 14 + pose * 3); c.fillRect(3, 14, 6, 14 - pose * 3);
    c.fillStyle = jersey; c.beginPath(); c.roundRect(-12, -10, 24, 26, 6); c.fill();
    c.fillStyle = '#f07a2a'; c.beginPath(); c.arc(0, -20, 12, 0, 7); c.fill();
    c.beginPath(); c.moveTo(-11, -26); c.lineTo(-7, -40); c.lineTo(-2, -29); c.fill(); c.beginPath(); c.moveTo(11, -26); c.lineTo(7, -40); c.lineTo(2, -29); c.fill();
    c.fillStyle = '#fdba74'; c.beginPath(); c.ellipse(4, -15, 7, 5, 0, 0, 7); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(10, -16, 2, 0, 7); c.fill(); c.beginPath(); c.arc(4, -23, 1.8, 0, 7); c.fill();
    c.restore(); }
  function drawTV(tv, dt) {
    tv.t += dt; const c = tv.cv.getContext('2d'), W = tv.cv.width, H = tv.cv.height, t = tv.t;
    if (tv.sport === 'boxing') { c.fillStyle = '#1a1030'; c.fillRect(0, 0, W, H); for (let i = 0; i < 60; i++) { c.fillStyle = ['#ec3013', '#38bdf8', '#ffd23a', '#f3f2f2'][i % 4]; c.globalAlpha = 0.5; c.beginPath(); c.arc((i * 37) % W, 40 + (i % 3) * 14 + Math.sin(t * 6 + i) * 2, 6, 0, 7); c.fill(); } c.globalAlpha = 1;
      c.fillStyle = '#2a4f8a'; c.fillRect(30, H * 0.55, W - 60, H * 0.4); c.strokeStyle = '#ec3013'; c.lineWidth = 4; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(30, H * 0.35 + k * 18); c.lineTo(W - 30, H * 0.35 + k * 18); c.stroke(); }
      const b = Math.sin(t * 5) * 6, p1 = Math.max(0, Math.sin(t * 3)), p2 = Math.max(0, Math.sin(t * 3 + 2)); drawFoxAth(c, W / 2 - 50 + p1 * 20, H * 0.62 + b, 2.2, '#ec3013', 1, p1); drawFoxAth(c, W / 2 + 50 - p2 * 20, H * 0.62 - b, 2.2, '#38bdf8', -1, p2);
      c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(W / 2 - 18 + p1 * 34, H * 0.5, 9, 0, 7); c.fill(); c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(W / 2 + 18 - p2 * 34, H * 0.5 + 4, 9, 0, 7); c.fill(); }
    if (tv.sport === 'horses') { c.fillStyle = '#7ec8f0'; c.fillRect(0, 0, W, H * 0.4); c.fillStyle = '#5aa84a'; c.fillRect(0, H * 0.4, W, H * 0.6); c.fillStyle = '#c99a5a'; c.fillRect(0, H * 0.52, W, H * 0.42);
      c.strokeStyle = '#fff'; c.lineWidth = 3; for (let i = 0; i < 12; i++) { const x = ((i * 70 - t * 260) % (W + 70) + W + 70) % (W + 70) - 35; c.beginPath(); c.moveTo(x, H * 0.48); c.lineTo(x, H * 0.54); c.stroke(); } c.beginPath(); c.moveTo(0, H * 0.48); c.lineTo(W, H * 0.48); c.stroke();
      ['#ec3013', '#38bdf8', '#ffd23a', '#7c3aed'].forEach((col, k) => { const x = 120 + k * 70 + Math.sin(t * 0.7 + k * 1.7) * 40, y = H * 0.6 + k * 22, gal = Math.sin(t * 14 + k); c.fillStyle = ['#6b4a35', '#2a1a10', '#d9b26a', '#f3f2f2'][k]; c.beginPath(); c.ellipse(x, y, 34, 14, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(x + 30, y - 12, 12, 8, -0.6, 0, 7); c.fill(); c.fillRect(x - 24 + gal * 6, y + 8, 5, 18); c.fillRect(x + 18 - gal * 6, y + 8, 5, 18); drawFoxAth(c, x - 2, y - 28, 0.9, col, 1, gal * 0.5); }); }
    if (tv.sport === 'baseball') { c.fillStyle = '#3f8a46'; c.fillRect(0, 0, W, H); c.fillStyle = '#c99a5a'; c.beginPath(); c.moveTo(W / 2, H * 0.2); c.lineTo(W * 0.8, H * 0.55); c.lineTo(W / 2, H * 0.92); c.lineTo(W * 0.2, H * 0.55); c.closePath(); c.fill(); c.fillStyle = '#5aa84a'; c.beginPath(); c.moveTo(W / 2, H * 0.32); c.lineTo(W * 0.68, H * 0.55); c.lineTo(W / 2, H * 0.78); c.lineTo(W * 0.32, H * 0.55); c.closePath(); c.fill();
      const ph = (t % 3) / 3; drawFoxAth(c, W / 2, H * 0.5, 1.4, '#38bdf8', -1, ph < 0.3 ? ph * 3 : 0); drawFoxAth(c, W * 0.42, H * 0.84, 1.6, '#ec3013', 1, ph > 0.5 && ph < 0.6 ? 1 : 0);
      c.strokeStyle = '#6b4a35'; c.lineWidth = 6; c.beginPath(); const sw = ph > 0.5 && ph < 0.65 ? -1.2 : 0.6; c.moveTo(W * 0.44, H * 0.8); c.lineTo(W * 0.44 + Math.cos(sw) * 40, H * 0.8 - Math.sin(sw) * 40); c.stroke();
      let bx, by; if (ph < 0.55) { const k = Math.max(0, (ph - 0.3) / 0.25); bx = lerp(W / 2, W * 0.46, k); by = lerp(H * 0.48, H * 0.78, k); } else { const k = (ph - 0.55) / 0.45; bx = lerp(W * 0.46, W * 0.95, k); by = H * 0.78 - Math.sin(k * Math.PI) * H * 0.7; } c.fillStyle = '#fff'; c.beginPath(); c.arc(bx, by, 5, 0, 7); c.fill(); }
    if (tv.sport === 'soccer') { c.fillStyle = '#3f8a46'; c.fillRect(0, 0, W, H); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#469c4e' : '#3f8a46'; c.fillRect(i * W / 8, 0, W / 8, H); } c.strokeStyle = '#fff'; c.lineWidth = 3; c.strokeRect(16, 16, W - 32, H - 32); c.beginPath(); c.moveTo(W / 2, 16); c.lineTo(W / 2, H - 16); c.stroke(); c.beginPath(); c.arc(W / 2, H / 2, 40, 0, 7); c.stroke(); c.strokeRect(W - 70, H / 2 - 45, 54, 90);
      const bx = W / 2 + Math.sin(t * 0.9) * W * 0.32, by = H / 2 + Math.sin(t * 1.7) * H * 0.25;
      [['#ec3013', -0.1], ['#ec3013', 0.25], ['#38bdf8', 0.1], ['#38bdf8', -0.3], ['#ec3013', 0.45]].forEach(([col, o], k) => { const x = bx + Math.sin(t * 1.3 + k * 2) * 70 + o * 60, y = by + Math.cos(t * 1.1 + k) * 40, run = Math.sin(t * 12 + k); drawFoxAth(c, x, y, 1.0, col, Math.cos(t * 0.9) > 0 ? 1 : -1, run); });
      c.fillStyle = '#fff'; c.beginPath(); c.arc(bx, by + 18, 6, 0, 7); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(bx + 1, by + 17, 2, 0, 7); c.fill(); }
    // broadcast bug + score strip
    c.fillStyle = 'rgba(0,0,0,0.65)'; c.fillRect(0, H - 34, W, 34); c.fillStyle = '#ec3013'; c.fillRect(0, H - 34, 92, 34); c.fillStyle = '#fff'; c.font = '800 18px Archivo, Arial'; c.textBaseline = 'middle'; c.fillText('FOX TV', 12, H - 17);
    c.font = '700 16px Archivo, Arial'; c.fillText({ boxing: 'BOXING · ROUND ' + (1 + Math.floor(t / 20) % 12) + ' · REDTAIL vs. BLUEFUR', horses: 'MERU DERBY · LAP ' + (1 + Math.floor(t / 15) % 3) + ' · RUSTY BOLT LEADS', baseball: 'BASEBALL · TOP 7 · DENS 3, TAILS ' + (2 + Math.floor(t / 9) % 2), soccer: 'SOCCER · ' + (12 + Math.floor(t) % 78) + "' · MERU 1–1 GAYA" }[tv.sport], 104, H - 17);
    c.fillStyle = '#ec3013'; c.beginPath(); c.arc(W - 22, 22, 7 + Math.sin(t * 4), 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '800 14px Archivo, Arial'; c.fillText('LIVE', W - 66, 23);
    tv.tex.needsUpdate = true; }
  const roomLights = [];
  const inGroups = IN.buildInteriors({ THREE, scene, M, BOX, toon, grad, glowing, glowSprite, BK, colliders, camBlockers, flames, bannerM, emblemTex, signTex, lampM, DARK, GOLD, WOOD, crystalM, roomLights });
  const caveK = { THREE, scene, M, BOX, toon, grad, glowing, glowSprite, BK, flames, emblemTex, DARK, GOLD, WOOD, roomLights }; const caveFx = CV.buildCaves(caveK);
  const shopGroups = SH.buildShops({ THREE, scene, M, BOX, toon, BK, glowSprite, DARK, WOOD, GOLD, roomLights, colliders, lampM });
  const lanesG = LN.buildLanes({ THREE, scene, M, BOX, toon, BK, DARK, WOOD, GOLD, roomLights, colliders, lampM, glowing });
  const tentFx = FT.buildTent({ THREE, scene, M, toon, glowing, glowSprite, roomLights, colliders, GOLD, WOOD }); const dinerFx = BG.buildDiner({ THREE, scene, M, BOX, toon, BK, grad, glowing, glowSprite, DARK, roomLights, colliders, lampM, camBlockers, sign, AX, AZ, S }); const ORA_LINES = await (await fetch(new URL('./worlds/meru-ora.json', import.meta.url))).json();
  const ROOMS = { fortune: FT.TENT, bowling: LN.LANES, tavern: TAV, casino: CAS, barracks: IN.BAR, throneroom: IN.THR, cave: CV.CAVE, itemshop: SH.ROOMS.itemshop, armory: SH.ROOMS.armory, burgers: BG.DINER };
  const SHOP_OUT = k => { if (k === 'burgers') return dinerFx.OUT; const b = BUILDINGS[(SH.ROOMS[k] || (k === 'fortune' ? FT.TENT : LN.LANES)).b]; if (b.r) return { x: AX(b.door), z: AZ(b.cy - b.r) - 2.2, face: Math.PI }; return { x: AX(b.door), z: AZ(b.face === 'N' ? b.y0 : b.y1) + (b.face === 'N' ? -2.2 : 2.2), face: b.face === 'N' ? Math.PI : 0 }; };
  const roomGroup = R => scene.children.find(o => o.isGroup && o.position.x === R.x && o.position.z === R.z);
  const ROOM_G = { tavern: roomGroup(TAV), casino: roomGroup(CAS), barracks: inGroups.barracks, throneroom: inGroups.throneroom, cave: caveFx.group, itemshop: shopGroups.itemshop, armory: shopGroups.armory, bowling: lanesG, fortune: tentFx.group, burgers: dinerFx.group };
  const BAR_OUT = { x: CP.cx(2560), z: CP.cz(2047) }, THR_OUT = { x: CP.cx(876), z: CP.cz(1080) };
  const CAS_EXIT = { x: CAS.x, z: CAS.z + CAS.d / 2 - 1.1 }, CAS_DOOR_OUT = (() => { const b = BUILDINGS[0]; return { x: AX(b.door), z: AZ(b.y1) + 2.2 }; })();
  const TAV_EXIT = { x: TAV.x, z: TAV.z + TAV.d / 2 - 1.1 }, TAV_DOOR_OUT = (() => { const b = BUILDINGS[1]; return { x: AX(b.door), z: AZ(b.y1) + 2.2 }; })();
  const marker = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), new THREE.MeshBasicMaterial({ color: 0xec3013 })); marker.scale.y = 1.6; scene.add(marker);
  for (const p of [
    { key: 'barkeep', name: 'Mott', role: 'Barkeep', outfit: 'vest', torso: ['#f7f1e6', '#7a5236', '#3a2618'], crest: 'M', x: TAV.x - 2.5, z: TAV.z - TAV.d / 2 + 1.5, face: 0, mood: 'warm' },
    { key: 'patron1', name: 'Wren', role: 'Pilot', outfit: 'coat', female: true, torso: ['#cfe9ff', '#4c86b4', '#1e3a8a'], crest: 'J', x: TAV.x + 1.5, z: TAV.z + 2.9, face: Math.PI, mood: 'happy' },
    { key: 'patron2', name: 'Bram', role: 'Trader', outfit: 'suit', torso: ['#fde68a', '#b45309', '#78350f'], crest: 'U', x: TAV.x - 8, z: TAV.z + 3.3, face: Math.PI, mood: 'smug' },
  ]) { const c = makeFox({ ...p, look: p.female ? PLAYER_FEMALE : PLAYER_MALE }); npcs.push({ ...p, c, speedNow: 0, wait: 0, lookV: new THREE.Vector3(), stand: [0, 0] }); MOODS[p.key] = p.mood; }
  for (const p of [
    { key: 'dealer5', name: 'Vex', role: 'Dealer · 5 Card', outfit: 'suit', torso: ['#f7f1e6', '#201e1d', '#0f0f12'], crest: 'L', x: CAS.x - 5.2, z: CAS.z - 1.9, face: 0, mood: 'smug' },
    { key: 'dealerTx', name: 'Rook', role: "Dealer · Hold'em", outfit: 'suit', torso: ['#f7f1e6', '#7a1d2a', '#3a0a10'], crest: 'L', x: CAS.x + 5.2, z: CAS.z - 1.9, face: 0, mood: 'warm' },
    { key: 'cashier', name: 'Penny', role: 'Cashier', outfit: 'vest', female: true, torso: ['#f7f1e6', '#1f6b45', '#0f3a26'], crest: 'M', x: CAS.x + CAS.w / 2 - 0.9, z: CAS.z + 5.0, face: -Math.PI / 2, mood: 'warm' },
    { key: 'croupier', name: 'Lady Fortune', role: 'Wheel host', outfit: 'dress', female: true, torso: ['#fff7e0', '#e0a84a', '#8a6a2a'], crest: 'M', x: CAS.x + 3.0, z: CAS.z - CAS.d / 2 + 2.6, face: 0, mood: 'happy' },
  ]) { const c = makeFox({ ...p, look: p.female ? PLAYER_FEMALE : PLAYER_MALE }); npcs.push({ ...p, c, speedNow: 0, wait: 0, lookV: new THREE.Vector3(), stand: [0, 0] }); MOODS[p.key] = p.mood; }
  Object.assign(DIALOGUE, {
    dealer5: [{ who: 'npc', text: 'Five cards, one draw. Hold what you like, throw away the rest.' }, { who: 'npc', text: 'Step up to the ring at my table when you are ready.' }],
    dealerTx: [{ who: 'npc', text: "Two in your paw, five on the felt. Best hand of seven wins." }, { who: 'npc', text: 'The ring in front of the table, whenever you like.' }],
    cashier: [{ who: 'npc', text: 'Chips in, chips out. Mind the bars, they are real gold.' }, { who: 'player', text: 'Real gold?' }, { who: 'npc', text: 'Paint. But please do not tell the King.' }],
    croupier: [{ who: 'npc', text: 'Round and round she goes! Step on the gold ring and give the Treasure Wheel a spin.' }],
  });
  for (const p of IN.PEOPLE) { const c = makeFox({ ...p, look: p.king ? KING_MIGHT : p.female ? PLAYER_FEMALE : PLAYER_MALE }); const n = { ...p, c, speedNow: 0, wait: 0, lookV: new THREE.Vector3(), stand: [0, 0] }; if (p.pts) { n.pts = p.pts; n.x = p.pts[0][0]; n.z = p.pts[0][1]; n.seg = 1; n.wait = 2; } npcs.push(n); MOODS[p.key] = p.mood; }
  const mkNpc = p => { const c = makeFox({ ...p, look: p.female ? PLAYER_FEMALE : PLAYER_MALE }); const n = { ...p, c, speedNow: 0, wait: 0, lookV: new THREE.Vector3(), stand: [0, 0] }; npcs.push(n); MOODS[p.key] = p.mood; return n; };
  const bandits = CV.BANDITS.map(mkNpc); SH.KEEPERS.forEach(mkNpc); LN.PEOPLE.forEach(mkNpc); BG.PEOPLE.forEach(mkNpc); mkNpc({ ...BG.BRAUN, x: TAV.x + 3.8, z: TAV.z - TAV.d / 2 + 4.2, face: -Math.PI * 0.75 }); mkNpc(FT.ORA);
  // the Arena Path meeting (2D checkArenaPathMeeting): Michelle and Max wait on the road until you have heard them out
  const MEET = await (await fetch(new URL('./worlds/meru-meet.json', import.meta.url))).json();
  let meetMi = null, meetMx = null, meetRun = false;
  if (!save.flag('arenaMeetDone')) { meetMi = mkNpc({ key: 'pathMichelle', name: 'Michelle', role: 'Princess', outfit: 'dress', female: true, torso: ['#3a4a75', '#22304f', '#0e1730'], crest: 'M', x: 52, z: 1.6, face: -Math.PI / 2, mood: 'smug' }); meetMx = mkNpc({ key: 'pathMax', name: 'Max', role: 'Prince', outfit: 'armor', torso: ['#3a4a75', '#22304f', '#0e1730'], crest: 'M', gear: 'sword', x: 54.5, z: 3.0, face: -Math.PI / 2, mood: 'happy' }); meetMi.hold = meetMx.hold = true; }
  function checkMeet() { if (!meetMi || meetRun || St.dialog || St.indoor || save.flag('arenaMeetDone')) return; if (Math.hypot(Pl.x - meetMi.x, Pl.z - meetMi.z) > 7) return; meetRun = true;
    const who = l => l.npc === 'pathMax' ? meetMx : meetMi;
    St.dialog = { npc: meetMi, lines: MEET.map(l => l.who === 'player' ? { name: 'You', role: 'Fox', text: l.text, you: true, mood: moodOf(l.text, 'warm', true) } : { name: who(l).name, role: who(l).role, text: l.text, spk: who(l).c, mood: moodOf(l.text, who(l).mood, false) }), i: 0, chars: 0, choices: null,
      then: () => { save.setFlag('arenaMeetDone'); meetMx.runWest = true; meetMx.hold = false; setTimeout(() => { meetMi.c.visible = false; meetMi.gone = true; }, 1500); } }; audio.blip(); }
  let maxNpc = null; function addMax() { if (maxNpc) { maxNpc.follow = false; maxNpc.x = IN.MAX.x; maxNpc.z = IN.MAX.z; maxNpc.face = IN.MAX.face; maxNpc.c.userData.mood = 'happy'; return maxNpc; } const p = IN.MAX; const c = makeFox({ ...p, look: PLAYER_MALE }); maxNpc = { ...p, c, speedNow: 0, wait: 0, lookV: new THREE.Vector3(), stand: [0, 0] }; npcs.push(maxNpc); MOODS.max = p.mood; return maxNpc; }
  if (save.flag('maxHome')) addMax(); else { maxNpc = mkNpc(CV.MAX_CAGED); if (save.flag('maxFreed')) { maxNpc.x = CV.MAX_FREE.x; maxNpc.z = CV.MAX_FREE.z; maxNpc.c.userData.mood = 'happy'; } if (save.flag('maxFollowing')) { maxNpc.follow = true; maxNpc.x = Pl.x - 1.5; maxNpc.z = Pl.z; } }
  if (save.flag('maxFreed') || save.flag('maxHome')) { caveK.cageBars.visible = false; }
  for (let i = 0; i < 2; i++) if (save.flag('caveChest' + i)) caveK.chestLids[i].rotation.x = -1.9;
  const doors = BUILDINGS.map(b => { const out = b.face === 'S' ? 1 : -1; const edge = b.r ? b.cy - out * b.r : (b.face === 'S' ? b.y1 : b.y0); return { label: b.label, x: AX(b.door), z: AZ(edge) + out * 1.4 }; }); doors.push(dinerFx.DOOR);

  // ---------- state, input ----------
  const St = { time: ((opts.startHour % 24) + 24) % 24, weather: 'clear', wRain: 0, wFog: 0, mode: 'attract', yaw: spawnEast ? Math.PI / 2 : 0, pitch: 0.38, dist: 8.5, dialog: null, near: null, muted: false, t: 0, asked: {}, wheel: false, toast: null, zone: null };
  const audio = new Ambience();
  const pal = { top: new THREE.Color(), hor: new THREE.Color(), fog: new THREE.Color(), light: new THREE.Color(), hs: new THREE.Color(), hg: new THREE.Color() };
  const keys = new Set(), input = { jx: 0, jy: 0, jump: false };
  const camPos = new THREE.Vector3(30, 18, 30), camLook = new THREE.Vector3(), grey = new THREE.Color(), fogWhite = new THREE.Color();
  const onKeyDown = e => { if (St.playing) return; if (St.dialog && St.dialog.choices && /^Digit[1-9]$/.test(e.code)) { api.choose(+e.code.slice(5) - 1); return; } if (St.wheel && e.code === 'Escape') { St.wheel = false; return; } if (JUKE.open && /^Digit[1-5]$/.test(e.code)) { playSong(+e.code.slice(5) - 1); return; } if (JUKE.open && (e.code === 'Escape' || e.code === 'Digit0')) { JUKE.open = false; return; } if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || St.mode !== 'play') return; keys.add(e.code); if (!St.dialog && !St.darts && !JUKE.open) { if (e.code === 'Digit1') api.melee(); else if (e.code === 'Digit2') api.range(); else if (e.code === 'Digit3') input.jump = true; else if (e.code === 'Digit4') api.item(); } if (e.code === 'Space') { input.jump = true; e.preventDefault(); } if (e.code === 'KeyE' || e.code === 'Enter') api.talk(); if (e.code === 'Escape') St.dialog = null; if (/Arrow/.test(e.code)) e.preventDefault(); };
  const onKeyUp = e => keys.delete(e.code), onBlur = () => keys.clear();
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); window.addEventListener('blur', onBlur);
  const fade = document.createElement('div'); fade.style.cssText = 'position:absolute;inset:0;background:#0b0a12;opacity:0;pointer-events:none;transition:opacity .28s ease;z-index:5'; container.appendChild(fade);
  function goTo(x, z, face, indoor) { if (St.moving2) return; St.moving2 = true; fade.style.opacity = '1'; audio.tone(indoor ? 330 : 440, 0.18, 0.04, 'triangle', indoor ? 0.8 : 1.25);
    setTimeout(() => { if (!indoor) { stopSong(); JUKE.open = false; } Pl.x = x; Pl.z = z; Pl.vx = Pl.vz = 0; Pl.face = face; if (maxNpc && maxNpc.follow) { maxNpc.x = x - Math.sin(face) * 1.6; maxNpc.z = z - Math.cos(face) * 1.6; maxNpc.trail = []; } St.yaw = face + Math.PI; St.indoor = indoor; St.dialog = null; camPos.set(x - Math.sin(face) * (indoor ? 3.5 : 6), indoor ? 3 : 4, z - Math.cos(face) * (indoor ? 3.5 : 6)); St.pitch = indoor ? 0.28 : 0.38; camLook.set(x, 1.5, z); St.camD = 4; setTimeout(() => { fade.style.opacity = '0'; St.moving2 = false; }, 60); }, 300); }
  const el = renderer.domElement, ptrs = new Map();
  const joyBase = document.createElement('div'), joyKnob = document.createElement('div');
  joyBase.style.cssText = 'position:absolute;width:112px;height:112px;border:2px solid #f3f2f2;background:rgba(32,30,29,.25);transform:translate(-50%,-50%);display:none;pointer-events:none;';
  joyKnob.style.cssText = 'position:absolute;width:44px;height:44px;background:#ec3013;transform:translate(-50%,-50%);display:none;pointer-events:none;';
  container.append(joyBase, joyKnob);
  el.addEventListener('pointerdown', e => {
    if (St.mode === 'play' && St.darts && !St.dialog && (e.pointerType !== 'mouse' || e.button === 0)) { e.preventDefault(); dartsPress(); return; } if (St.mode !== 'play') return; el.setPointerCapture(e.pointerId); const r = el.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top; const joy = e.pointerType === 'touch' && lx < r.width * 0.45 && ![...ptrs.values()].some(p => p.joy); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, ox: lx, oy: ly, joy }); if (joy) { joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.left = joyKnob.style.left = lx + 'px'; joyBase.style.top = joyKnob.style.top = ly + 'px'; } });
  el.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if (!p) return; if (p.joy) { const r = el.getBoundingClientRect(); let dx = e.clientX - r.left - p.ox, dy = e.clientY - r.top - p.oy; const l = Math.hypot(dx, dy); if (l > 50) { dx *= 50 / l; dy *= 50 / l; } input.jx = dx / 50; input.jy = -dy / 50; joyKnob.style.left = p.ox + dx + 'px'; joyKnob.style.top = p.oy + dy + 'px'; } else { const k = e.pointerType === 'touch' ? 0.008 : 0.005; St.dragT = 1.2; St.yaw -= (e.clientX - p.x) * k; St.pitch = clamp(St.pitch + (e.clientY - p.y) * k * 0.8, -0.05, 1.25); } p.x = e.clientX; p.y = e.clientY; });
  const endPtr = e => { const p = ptrs.get(e.pointerId); if (p && p.joy) { input.jx = input.jy = 0; joyBase.style.display = joyKnob.style.display = 'none'; } ptrs.delete(e.pointerId); };
  el.addEventListener('pointerup', endPtr); el.addEventListener('pointercancel', endPtr);
  el.addEventListener('wheel', e => { if (St.mode !== 'play') return; St.dist = clamp(St.dist + e.deltaY * 0.01, 4, 18); e.preventDefault(); }, { passive: false });
  el.addEventListener('contextmenu', e => e.preventDefault());
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); }); ro.observe(container);

  // collisions: the 2D game's own walk map, then props
  const PR = 0.34;
  const RM = () => ROOMS[St.room] || TAV;
  const inRoom = (Rm, x, z) => Math.abs(x - Rm.x) < Rm.w / 2 - 0.55 && Math.abs(z - Rm.z) < Rm.d / 2 - 0.55;
  const inTav = (x, z) => inRoom(TAV, x, z) || inRoom(CAS, x, z);
  phoneBudget(scene, opts);
  const free = (x, z) => St.indoor ? (RM().walk ? RM().walk(x, z) : inRoom(RM(), x, z)) : (walkableAt(x, z) && walkableAt(x + PR, z) && walkableAt(x - PR, z) && walkableAt(x, z + PR) && walkableAt(x, z - PR));
  function pushProps(o, r) {
    for (const c of colliders) {
      if (c.c) { const [cx, cz, cr] = c.c, dx = o.x - cx, dz = o.z - cz, d = Math.hypot(dx, dz), m = cr + r; if (d < m && d > 1e-5) { o.x = cx + dx / d * m; o.z = cz + dz / d * m; } }
      else if (c.box) { const [x0, x1, z0, z1] = c.box; const qx = clamp(o.x, x0, x1), qz = clamp(o.z, z0, z1), ex = o.x - qx, ez = o.z - qz, d = Math.hypot(ex, ez); if (d > 0 && d < r) { o.x = qx + ex / d * r; o.z = qz + ez / d * r; } }
    }
  }
  function moveWithWalls(o, nx, nz, r) {
    const ox = o.x, oz = o.z;
    if (free(nx, nz)) { o.x = nx; o.z = nz; } else if (free(nx, oz)) o.x = nx; else if (free(ox, nz)) o.z = nz;
    const bx = o.x, bz = o.z; pushProps(o, r); if (!free(o.x, o.z)) { o.x = bx; o.z = bz; }
  }

  const CB = createCombat({ THREE, scene, audio, move: (o, nx, nz, r) => { const ox = o.x, oz = o.z; if (free(nx, nz)) { o.x = nx; o.z = nz; } else if (free(nx, oz)) o.x = nx; else if (free(ox, nz)) o.z = nz; } });
  bandits.forEach(n => CB.add(n, n.fight)); if (save.flag('banditsDown')) CB.foes.forEach(f => { f.down = true; f.hp = 0; f.n.c.rotation.x = -Math.PI / 2; });
  const banditsDown = () => bandits.every(b => b.ctl.down), banditsActive = () => bandits.some(b => b.ctl.hostile && !b.ctl.down);
  const critters = CV.CRITTERS.map(p => { const m = CV.makeCritter({ THREE, scene, M, toon }, p); const n = { key: p.key, x: p.x, z: p.z, face: 0, c: m.c, speedNow: 0 }; const f = CB.add(n, m.opts); f.anim = (dt, spd) => m.anim(f.t, spd); return n; });
  const critterGroup = new THREE.Group(); scene.add(critterGroup); critters.forEach(n => critterGroup.add(n.c));
  // minimap
  let mapCanvas = null, mapCtx = null;
  const css = (v, f) => (getComputedStyle(document.documentElement).getPropertyValue(v) || '').trim() || f;
  function drawMap() {
    if (!mapCtx) return; const cw = mapCanvas.width, ch = mapCanvas.height, half = 16, ppm = 1440 / MW;
    const [ax, ay] = toArt(Pl.x, Pl.z); mapCtx.fillStyle = '#1d2a22'; mapCtx.fillRect(0, 0, cw, ch);
    if (St.indoor) { const s2 = cw / (TAV.w + 2), ox = cw / 2 - TAV.w / 2 * s2, oz = ch / 2 - TAV.d / 2 * s2, P2 = (x, z) => [ox + (x - TAV.x + TAV.w / 2) * s2, oz + (z - TAV.z + TAV.d / 2) * s2];
      mapCtx.fillStyle = '#b08a62'; mapCtx.fillRect(ox, oz, TAV.w * s2, TAV.d * s2); mapCtx.fillStyle = '#5a3d2c'; let [bx, bz] = P2(TAV.x - 8.5, TAV.z - TAV.d / 2 + 1.8); mapCtx.fillRect(bx, bz, 13 * s2, 1.2 * s2); mapCtx.fillStyle = '#c42d3c'; { const [dbx, dbz] = P2(TAV.x + TAV.w / 2 - 0.4, TAV.z - 3.5); mapCtx.beginPath(); mapCtx.arc(dbx, dbz, 0.6 * s2, 0, 7); mapCtx.fill(); }
      mapCtx.fillStyle = '#7a5236'; for (const [x, z] of [[-8, 2], [-3.5, 3.2], [1.5, 1.5], [6, 2.4], [-7.5, 7], [-2, 7.5], [3.5, 6.5], [8.5, 7.8]]) { const [px, pz] = P2(TAV.x + x, TAV.z + z); mapCtx.beginPath(); mapCtx.arc(px, pz, 0.85 * s2, 0, 7); mapCtx.fill(); }
      mapCtx.fillStyle = '#ff8a3a'; [bx, bz] = P2(TAV.x - TAV.w / 2, TAV.z - 3.2); mapCtx.fillRect(bx, bz, 1.0 * s2, 3.2 * s2);
      mapCtx.fillStyle = '#c42d3c'; [bx, bz] = P2(TAV.x - 1.1, TAV.z + TAV.d / 2 - 0.4); mapCtx.fillRect(bx, bz, 2.2 * s2, 0.4 * s2);
      const toM2 = (x, z) => P2(x, z), dpr2 = devicePixelRatio; for (const n of npcs) { if (!inTav(n.x, n.z)) continue; const [x, y] = toM2(n.x, n.z); mapCtx.fillStyle = '#201e1d'; mapCtx.strokeStyle = '#f3f2f2'; mapCtx.lineWidth = 2 * dpr2; mapCtx.beginPath(); mapCtx.arc(x, y, 4 * dpr2, 0, 7); mapCtx.fill(); mapCtx.stroke(); }
      const [px, pz] = toM2(Pl.x, Pl.z); mapCtx.save(); mapCtx.translate(px, pz); mapCtx.rotate(-Pl.face); const s3 = 7 * dpr2; mapCtx.fillStyle = '#ec3013'; mapCtx.strokeStyle = '#f3f2f2'; mapCtx.lineWidth = 2 * dpr2; mapCtx.beginPath(); mapCtx.moveTo(0, s3 * 1.3); mapCtx.lineTo(s3 * 0.9, -s3); mapCtx.lineTo(-s3 * 0.9, -s3); mapCtx.closePath(); mapCtx.fill(); mapCtx.stroke(); mapCtx.restore(); return; }
    if (mapImg.complete && mapImg.naturalWidth) mapCtx.drawImage(mapImg, ax / 2 - half * ppm, ay / 2 - half * ppm, half * 2 * ppm, half * 2 * ppm, 0, 0, cw, ch);
    const sc = cw / (half * 2), toM = (x, z) => [cw / 2 + (x - Pl.x) * sc, ch / 2 + (z - Pl.z) * sc], dpr = devicePixelRatio, bg = css('--color-bg', '#f3f2f2'), ink = css('--color-text', '#201e1d'), acc = css('--color-accent', '#ec3013');
    for (const n of npcs) { const [x, y] = toM(n.x, n.z); mapCtx.fillStyle = ink; mapCtx.strokeStyle = bg; mapCtx.lineWidth = 2 * dpr; mapCtx.beginPath(); mapCtx.arc(x, y, 4 * dpr, 0, 7); mapCtx.fill(); mapCtx.stroke(); }
    mapCtx.save(); mapCtx.translate(cw / 2, ch / 2); mapCtx.rotate(-Pl.face); const s = 7 * dpr; mapCtx.fillStyle = acc; mapCtx.strokeStyle = bg; mapCtx.lineWidth = 2 * dpr; mapCtx.beginPath(); mapCtx.moveTo(0, s * 1.3); mapCtx.lineTo(s * 0.9, -s); mapCtx.lineTo(-s * 0.9, -s); mapCtx.closePath(); mapCtx.fill(); mapCtx.stroke(); mapCtx.restore();
  }

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, lastHud = '', hudT = 0;
  const sunDir = new THREE.Vector3(), moonDir = new THREE.Vector3(), lightDir = new THREE.Vector3(), v3 = new THREE.Vector3();
  const nearest = () => { if (meetMi && !save.flag('arenaMeetDone') && Math.hypot(meetMi.x - Pl.x, meetMi.z - Pl.z) < 7.5) return null; if (!St.indoor && Math.hypot(LK.ASHORE.x - Pl.x, LK.ASHORE.z - Pl.z) < 1.7) return null; let best = null, bd = 3.2; for (const n of npcs) { if (n.ctl && (n.ctl.down || n.ctl.hostile)) continue; if (n.follow) continue; const d = Math.hypot(n.x - Pl.x, n.z - Pl.z); if (d < bd) { bd = d; best = n; } } return best; };
  const nearSpot = () => {
    if (St.indoor && St.room === 'barracks') { if (Math.hypot(IN.BAR_EXIT.x - Pl.x, IN.BAR_EXIT.z - Pl.z) < 2.4) return { kind: 'exit', text: 'Leave', label: '', out: 'barracks' }; for (const s of IN.BAR_SPOTS) if (Math.hypot(s.x - Pl.x, s.z - Pl.z) < (s.bunk ? 1.4 : 1.8)) return s.bunk ? { kind: 'use', text: 'Rest on the bunk', label: '', bunk: true } : s.range ? { kind: 'use', text: 'Step up to the range', label: '', range: true } : { kind: 'use', text: 'Step into the circle', label: '', spar: true }; return null; }
    if (St.indoor && St.room === 'cave') { if (Math.hypot(CV.EXIT_SPOT.x - Pl.x, CV.EXIT_SPOT.z - Pl.z) < 2.4) return { kind: 'exit', text: 'Leave', label: '', out: 'cave' };
      if (CV.state.rubble > 0 && Math.hypot(RUB.x - Pl.x, RUB.z - Pl.z) < 3.4) return { kind: 'use', text: 'Blast the cave-in with 2 RANGE', label: '', rubble: true };
      if (!['called', 'parley', 'fight'].includes(St.camp)) for (let i = 0; i < 2; i++) if (!save.flag('caveChest' + i) && Math.hypot(CV.CHESTS[i].x - Pl.x, CV.CHESTS[i].z - Pl.z) < 1.6) return { kind: 'use', text: 'Open the chest', label: '', chest: i };
      return null; }
    if (St.indoor && St.room === 'fortune') { tentFx.update(St.t); return Math.hypot(FT.TENT.exit.x - Pl.x, FT.TENT.exit.z - Pl.z) < 2.0 ? { kind: 'exit', text: 'Leave', label: '', out: 'shop' } : null; }
    if (St.indoor && St.room === 'bowling') { if (Math.hypot(LN.LANES.exit.x - Pl.x, LN.LANES.exit.z - Pl.z) < 2.2) return { kind: 'exit', text: 'Leave', label: '', out: 'shop' }; for (const b of LN.BOWL_SPOTS) if (Math.hypot(b.x - Pl.x, b.z - Pl.z) < 1.6) return { kind: 'use', text: 'Bowl on lane ' + b.lane, label: '', bowl: true }; return null; }
    if (St.indoor && St.room === 'burgers') return Math.hypot(BG.DINER.exit.x - Pl.x, BG.DINER.exit.z - Pl.z) < 2.2 ? { kind: 'exit', text: 'Leave', label: '', out: 'shop' } : null;
    if (St.indoor && SH.ROOMS[St.room]) { const E = SH.ROOMS[St.room].exit; return Math.hypot(E.x - Pl.x, E.z - Pl.z) < 2.2 ? { kind: 'exit', text: 'Leave', label: '', out: 'shop' } : null; }
    if (St.indoor && St.room === 'throneroom') { if (Math.hypot(IN.THR_EXIT.x - Pl.x, IN.THR_EXIT.z - Pl.z) < 2.4) return { kind: 'exit', text: 'Leave', label: '', out: 'throneroom' }; return null; }
    if (St.indoor && St.room === 'casino') { for (const s of CAS_GAMES) if (Math.hypot(s.x - Pl.x, s.z - Pl.z) < 1.4) return { kind: 'game', label: s.label, game: s.key }; return Math.hypot(CAS_EXIT.x - Pl.x, CAS_EXIT.z - Pl.z) < 2.2 ? { kind: 'exit', label: 'Town Square', cas: 'out' } : null; }
    if (St.indoor) { { const [jx, jz] = JPOS(); if (Math.hypot(jx - Pl.x, jz - Pl.z) < 2.6) return { kind: 'juke', label: 'jukebox', juke: true }; } if (Math.hypot(DART.oche - 0.4 - Pl.x, DART.z - Pl.z) < 2.6) return { kind: 'darts', label: 'darts', darts: true }; return Math.hypot(TAV_EXIT.x - Pl.x, TAV_EXIT.z - Pl.z) < 2.2 ? { kind: 'exit', label: 'Town Square', tav: 'out' } : null; } for (const d of doors) if (Math.hypot(d.x - Pl.x, d.z - Pl.z) < 2.4) return { kind: 'door', label: d.label, tav: d.label === 'Tavern' ? 'in' : null, cas: d.label === 'Casino' ? 'in' : null }; if (BOAT.on) { if (Math.hypot(LK.MOOR.x - Pl.x, LK.MOOR.z - Pl.z) < 3.2) return { kind: 'use', text: 'Step ashore', label: '', ashore: true }; for (const d of LK.DIVES) if (Math.hypot(d.x - Pl.x, d.z - Pl.z) < d.r) return { kind: 'use', text: 'DIVE for PEARLS', label: '', dive: true }; return null; }
    for (const p of LK.SPOTS) if (Math.hypot(p.x - Pl.x, p.z - Pl.z) < p.r) return { kind: 'use', text: p.gate === 'board' && !save.flag('boatRented') ? 'The boat (talk to the Fisherman)' : p.text, label: '', lake: p.gate };
    for (const p of [...CP.SPOTS, ...RU.SPOTS]) if (Math.hypot(p.x - Pl.x, p.z - Pl.z) < p.r) return { kind: 'door', label: p.label, gate: p.gate, toast: p.toast }; for (const e of EXITS) if (!e.open && Math.hypot(AX(e.ax) - Pl.x, AZ(e.ay) - Pl.z) < (e.go ? 5 : 3.5)) return { kind: 'exit', label: e.label, go: e.go }; return null; };

  function update(dt) {
    St.t += dt; St.time = (St.time + dt * opts.timeScale / 60) % 24;
    St.wRain = damp(St.wRain, St.weather === 'rain' ? 1 : 0, 0.8, dt); St.wFog = damp(St.wFog, St.weather === 'fog' ? 1 : 0, 0.8, dt);
    const h = St.time; paletteAt(h, pal);
    const sa = (h - 6) / 13 * Math.PI; sunDir.set(Math.cos(sa), Math.sin(sa) * 0.9, 0.38).normalize();
    const mh = ((h - 19 + 24) % 24) / 11 * Math.PI; moonDir.set(-Math.cos(mh), Math.sin(mh) * 0.85, -0.3).normalize();
    lightDir.copy(sunDir.y > -0.02 ? sunDir : moonDir); lightDir.y = Math.max(lightDir.y, 0.18); lightDir.normalize();
    const rk = St.wRain, fk = St.wFog;
    for (const k of ['top', 'hor', 'fog']) { const c = pal[k], l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11; grey.setRGB(l, l, l * 1.06); c.lerp(grey, rk * 0.7); }
    pal.hor.lerp(pal.fog, fk * 0.8); pal.top.lerp(pal.fog, fk * 0.6); fogWhite.set('#dfe3e6').multiplyScalar(0.25 + 0.75 * (1 - pal.glow)); pal.fog.lerp(fogWhite, fk * 0.35);
    skyU.top.value.copy(pal.top); skyU.hor.value.copy(pal.hor); skyU.bottom.value.copy(pal.fog); skyU.sunDir.value.copy(sunDir); skyU.moonDir.value.copy(moonDir); skyU.sunCol.value.copy(pal.light);
    skyU.sunVis.value = smooth(-0.08, 0.05, sunDir.y) * (1 - 0.85 * Math.max(rk, fk)); skyU.moonVis.value = smooth(-0.05, 0.1, moonDir.y) * pal.glow * (1 - 0.85 * Math.max(rk, fk));
    scene.fog.color.copy(pal.fog); scene.fog.density = 0.006 + 0.026 * fk + 0.008 * rk;
    sun.color.copy(pal.light); sun.intensity = pal.li * (1 - 0.65 * rk - 0.45 * fk); hemi.color.copy(pal.hs); hemi.groundColor.copy(pal.hg); hemi.intensity = pal.hi * (1 + 0.15 * rk);
    const glow = Math.max(pal.glow, rk * 0.45, fk * 0.3) * 0.8 + 0.2;
    glowMats.forEach(g => g.m.emissiveIntensity = glow * g.k); glows.forEach(s => s.material.opacity = glow * 0.8);
    pointLights.forEach(p => p.L.intensity = glow * p.k * (0.85 + 0.15 * Math.sin(St.t * 13 + p.k)));
    starMat.opacity = smooth(0.5, 0.95, pal.glow) * (1 - Math.max(rk, fk)); ffMat.opacity = smooth(0.6, 1, pal.glow) * (1 - rk) * (0.7 + 0.3 * Math.sin(St.t * 3)); rainMat.opacity = rk * 0.55;
    cloudMat.color.setRGB(1, 1, 1).lerp(pal.hor, 0.35).lerp(grey, rk * 0.6); cloudMat.emissive.copy(pal.hs).multiplyScalar(0.5);

    if (St.mode === 'play') {
      let ix = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + input.jx;
      let iy = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) + input.jy;
      const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
      const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw), rx = Math.cos(St.yaw), rz = -Math.sin(St.yaw);
      const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || Math.hypot(input.jx, input.jy) > 0.92;
      const spd = (BOAT.on ? 6.5 : run ? 8.5 : 4.8) * Math.min(1, Math.hypot(ix, iy));
      let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix; const ml = Math.hypot(mx, mz); if (ml > 0) { mx /= ml; mz /= ml; }
      Pl.vx = damp(Pl.vx, mx * spd, 12, dt); Pl.vz = damp(Pl.vz, mz * spd, 12, dt);
      moveWithWalls(Pl, Pl.x + Pl.vx * dt, Pl.z + Pl.vz * dt, 0.42);
      for (const n of npcs) { const dx = Pl.x - n.x, dz = Pl.z - n.z, d = Math.hypot(dx, dz), m = n.chair ? 1.0 : 0.8; if (d < m && d > 1e-3) moveWithWalls(Pl, n.x + dx / d * m, n.z + dz / d * m, 0.42); }
      const hs = Math.hypot(Pl.vx, Pl.vz); if (hs > 0.3) { let df = Math.atan2(Pl.vx, Pl.vz) - Pl.face; df = Math.atan2(Math.sin(df), Math.cos(df)); Pl.face += df * Math.min(1, dt * 12); }
      St.dragT = (St.dragT || 0) - dt;
      if (opts.followCam && hs > 0.6 && St.dragT <= 0 && !St.dialog) { let dy = (Pl.face + Math.PI) - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, dt * 2.2 * Math.min(1, hs / 4)); }
      const gy = St.indoor ? 0 : BOAT.on ? LK.WATER_Y + 0.35 : Math.max(0.06, heightAt(Pl.x, Pl.z));
      if (input.jump && Pl.ground && !BOAT.on) { Pl.vy = 8.4; Pl.ground = false; audio.tone(420, 0.12, 0.04, 'triangle', 1.8); } input.jump = false;
      Pl.vy -= 24 * dt; Pl.y += Pl.vy * dt; if (Pl.y <= gy) { if (!Pl.ground && Pl.vy < -6) audio.burst(0.1, 500, 0.18); Pl.y = gy; Pl.vy = 0; Pl.ground = true; } else if (Pl.y - gy > 0.15) Pl.ground = false;
      if (Pl.ground && hs > 1) { Pl.stepT -= dt * hs; if (Pl.stepT < 0) { Pl.stepT = 2.2; audio.step(); } }
      player.userData.mood = Pl.ground ? 'warm' : 'excited'; player.position.set(Pl.x, Pl.y, Pl.z); player.rotation.y = Pl.face; animFox(player, dt, BOAT.on ? 0 : hs, !Pl.ground && !BOAT.on); if (BOAT.on) { const P2 = player.userData.P; P2.legs[0].rotation.x = P2.legs[1].rotation.x = -1.4; P2.arms[0].rotation.x = P2.arms[1].rotation.x = -0.9 + Math.sin(St.t * 5) * 0.4 * Math.min(1, hs / 3); }
    } else { player.position.set(Pl.x, 0.06, Pl.z); player.rotation.y = Pl.face; animFox(player, dt, 0); }

    ruinsFx.update(Pl.x, Pl.z, St.indoor); cull(); checkMeet(); if (apFx.root.visible) apFx.update(dt); if (lakeFx.root.visible) lakeFx.update(dt, BOAT.on, Pl.x, Pl.z, Pl.face);
    if (St.indoor && St.room === 'cave') { caveFx.update(dt, Pl.x, Pl.z); const r = CB.update(dt, Pl, player); CB.pose(player);
      if (r.playerDown && !St.moving2) knockedDown();
      if (banditsActive() && St.camp !== 'fight' && !St.dialog) { St.camp = 'fight'; CB.engage(bandits.map(b => b.key)); }
      if (St.camp === 'fight' && banditsDown()) { St.camp = 'down'; save.setFlag('banditsDown'); toast('The crew is down. Get Max out.'); audio.tone(520, 0.4, 0.05, 'triangle', 1.6); }
      if (St.camp === 'idle' && !St.dialog && !St.moving2 && !save.flag('maxFreed')) { const s = bn('snag'); if (!s.ctl.down && Math.hypot(Pl.x - s.x, Pl.z - s.z) < 7) callOut(s); } }
    if (St.lock) { const lk = St.lock; lk.pos += lk.dir * lk.speed * dt; if (lk.pos > 1) { lk.pos = 1; lk.dir = -1; } if (lk.pos < 0) { lk.pos = 0; lk.dir = 1; } }
    if (maxNpc && !maxNpc.follow && save.flag('maxFollowing') && !save.flag('maxHome')) { maxNpc.follow = true; maxNpc.trail = []; }
    const nr = nearest(); St.near = St.dialog ? null : nr; St.spot = St.dialog || nr ? null : nearSpot();
    if (St.indoor && St.mode === 'play' && !St.dialog && !St.playing && !St.moving2 && nr) { const amb = St.room === 'burgers' && nr.key === 'michaelJay' ? ['mjGreeted', 2.6] : St.room === 'tavern' && nr.key === 'docBraun' ? ['docGreeted', 2.2] : null; if (amb && !save.flag(amb[0]) && Math.hypot(nr.x - Pl.x, nr.z - Pl.z) < amb[1]) { save.setFlag(amb[0]); api.talk(); } }
    [player, ...npcs.map(n => n.c)].forEach(c => { c.userData.talking = false; c.userData.lineMood = null; });
    if (St.dialog && St.dialog.npc) { const d = St.dialog, ln = d.lines[d.i], spk = ln.you ? player : ln.spk ? ln.spk : ln.who === 'max' && maxNpc ? maxNpc.c : d.npc.c; spk.userData.talking = d.chars < ln.text.length; spk.userData.lineMood = ln.mood; if (!ln.you) d.npc.c.userData.lineMood = ln.mood; }
    { let lk = null, bd = 5; for (const n of npcs) { const dd = Math.hypot(n.x - Pl.x, n.z - Pl.z); if (dd < bd) { bd = dd; lk = n; } } player.userData.lookAt = lk && St.mode === 'play' ? playerLook.set(lk.x, 1.5, lk.z) : null; }
    for (const n of npcs) {
      if (n.gone) { n.c.visible = false; continue; }
      if (n.runWest) { n.x -= 7 * dt; n.face = -Math.PI / 2; n.c.position.set(n.x, 0.06, n.z); n.c.rotation.y = n.face; animFox(n.c, dt, 7); if (n.x < 30) { n.gone = true; } continue; }
      if (n.ctl) { animFox(n.c, dt, n.ctl.down ? 0 : n.speedNow || 0); if (!n.ctl.hostile && !n.ctl.down) { const dd = Math.hypot(Pl.x - n.x, Pl.z - n.z); n.c.userData.lookAt = St.mode === 'play' && dd < 7 ? n.lookV.set(Pl.x, Pl.y + 1.6, Pl.z) : null; if ((St.dialog && St.dialog.npc === n) || dd < 3) { let df = Math.atan2(Pl.x - n.x, Pl.z - n.z) - n.face; df = Math.atan2(Math.sin(df), Math.cos(df)); n.face += df * Math.min(1, dt * 6); } } else n.c.userData.lookAt = null; continue; }
      if (n.follow) { const tr = n.trail || (n.trail = []); const hd = tr[tr.length - 1]; if (!hd || Math.hypot(Pl.x - hd[0], Pl.z - hd[1]) > 0.3) tr.push([Pl.x, Pl.z]); if (tr.length > 80) tr.shift();
        let acc = 0, tg = tr[0] || [Pl.x, Pl.z]; for (let i = tr.length - 1; i > 0; i--) { acc += Math.hypot(tr[i][0] - tr[i - 1][0], tr[i][1] - tr[i - 1][1]); if (acc >= 1.8) { tg = tr[i - 1]; break; } }
        const fdx = tg[0] - n.x, fdz = tg[1] - n.z, fd = Math.hypot(fdx, fdz); let fs = 0; if (fd > 0.15 && Math.hypot(Pl.x - n.x, Pl.z - n.z) > 1.4) { fs = Math.min(fd * 4, 7.5); n.x += fdx / fd * Math.min(fd, fs * dt); n.z += fdz / fd * Math.min(fd, fs * dt); n.face = Math.atan2(fdx, fdz); }
        if (Math.hypot(Pl.x - n.x, Pl.z - n.z) > 12) { n.x = Pl.x - Math.sin(Pl.face) * 1.6; n.z = Pl.z - Math.cos(Pl.face) * 1.6; n.trail = []; }
        n.speedNow = damp(n.speedNow, fs, 8, dt); n.c.position.set(n.x, St.indoor ? 0.06 : Math.max(0.06, heightAt(n.x, n.z)), n.z); n.c.rotation.y = n.face; n.c.userData.lookAt = null; animFox(n.c, dt, n.speedNow); continue; }
      const dpl = Math.hypot(Pl.x - n.x, Pl.z - n.z), engaged = St.mode === 'play' && ((St.dialog && St.dialog.npc === n) || dpl < 3.2);
      let spd = 0, tf = n.face;
      if (engaged) tf = Math.atan2(Pl.x - n.x, Pl.z - n.z);
      else if (n.pts) {
        const [tx, tz] = n.pts[n.seg], dx = tx - n.x, dz = tz - n.z, d = Math.hypot(dx, dz);
        if (d < 0.2) { n.wait -= dt; if (n.wait < 0) { n.seg = n.seg === 1 ? 0 : 1; n.wait = rr(1.5, 4); } }
        else { spd = n.speed * 1.1; n.x += dx / d * Math.min(d, spd * dt); n.z += dz / d * Math.min(d, spd * dt); tf = Math.atan2(dx, dz); }
      }
      let df = tf - n.face; df = Math.atan2(Math.sin(df), Math.cos(df)); n.face += df * Math.min(1, dt * 6);
      n.c.userData.lookAt = St.mode === 'play' && dpl < 7 ? n.lookV.set(Pl.x, Pl.y + 1.6, Pl.z) : null; n.speedNow = damp(n.speedNow, spd, 8, dt); n.c.position.set(n.x, n.x < -42 && Math.abs(n.z) < 140 ? Math.max(0.06, heightAt(n.x, n.z)) : 0.06, n.z); n.c.rotation.y = n.face; animFox(n.c, dt, n.speedNow);
    }
    const mk = St.mode === 'play' ? (St.dialog ? St.dialog.npc : St.near) : null;
    marker.visible = !!mk; if (mk) { marker.position.set(mk.x, 2.45 + (mk.chair ? 0.28 : 0) + Math.sin(St.t * 4) * 0.08, mk.z); marker.rotation.y += dt * 2.5; }
    if (St.dialog) { const d = St.dialog; d.chars = Math.min(d.lines[d.i].text.length, d.chars + dt * 45); if (d.npc && Math.hypot(Pl.x - d.npc.x, Pl.z - d.npc.z) > 6) St.dialog = null; if (!d.npc && d.at && Math.hypot(Pl.x - d.at[0], Pl.z - d.at[1]) > 5) St.dialog = null; }

    // world animation
    for (const f of flames) {
      if (f.fl) { const k = 1 + Math.sin(St.t * 11 + f.ph) * 0.12 + Math.sin(St.t * 23 + f.ph) * 0.06; f.fl.scale.set(1, k, 1); f.fi.scale.set(1, 2 - k, 1); f.fl.rotation.y += dt * 2; }
      if (f.spin) f.spin.rotation.y += dt * 0.9;
      if (f.casRing) { f.casRing.material.opacity = 0.5 + 0.35 * Math.sin(St.t * 3 + f.ph); }
      if (f.wheelDisc) f.wheelDisc.rotation.z += dt * 0.35;
      if (f.chase) f.chase.material = ((Math.floor(St.t * 8) + f.ph) % 3 === 0) ? lampM : DARK;
      if (f.slotTop) f.slotTop.scale.setScalar(1 + 0.25 * Math.max(0, Math.sin(St.t * 6 + f.ph)));
      if (f.dartRing) { f.dartRing.material.opacity = St.darts ? 0.25 : 0.55 + 0.35 * Math.sin(St.t * 3); f.dartRing.scale.setScalar(1 + 0.06 * Math.sin(St.t * 3)); }
      if (f.candle) f.candle.scale.set(1, 1 + Math.sin(St.t * 14 + f.ph) * 0.2, 1);
      if (f.juke) f.juke.emissive.setHSL((St.t * 0.15) % 1, 0.9, 0.6);
      if (f.flag) f.flag.rotation.y = Math.sin(St.t * 2 + f.ph) * 0.35;
      if (f.bob) f.bob.position.y = f.y + Math.sin(St.t * 1.6) * 0.12;
    }
    for (let i = 0; i < 120; i++) { const s = embSeed[i], b = brazierPos[i % 4], t = (St.t * 0.35 + s[0]) % 1; embArr.set([b[0] + s[1] + Math.sin(t * 9 + i) * 0.15, 1.8 + t * 2.4, b[1] + s[2]], i * 3); }
    embers.geometry.attributes.position.needsUpdate = true; embers.material.opacity = 0.9 * (1 - rk);
    clouds.forEach(c => { c.position.x += c.userData.v * dt; if (c.position.x > 280) c.position.x = -280; });
    const fpos = ffGeo.attributes.position; ffBase.forEach(([x, y, z, ph], i) => fpos.setXYZ(i, x + Math.sin(St.t * 0.5 + ph) * 1.5, y + Math.sin(St.t * 0.9 + ph * 2) * 0.5, z + Math.cos(St.t * 0.4 + ph) * 1.5)); fpos.needsUpdate = true;
    if (rk > 0.01) { rain.position.set(camera.position.x, camera.position.y - 20, camera.position.z); for (let i = 0; i < rainN; i++) { const o = i * 6; let y = rainArr[o + 1] - dt * 32; if (y < 0) y += 40; rainArr[o + 1] = y; rainArr[o + 4] = y - 0.9; } rainGeo.attributes.position.needsUpdate = true; }
    smoke.forEach(p => { p.t = (p.t + dt * 0.12) % 1; p.ch.getWorldPosition(v3); p.s.position.set(v3.x + Math.sin(p.t * 6) * 0.6 * p.t, v3.y + 1.2 + p.t * 5, v3.z + p.t * 1.5); p.s.scale.setScalar(0.9 + p.t * 2.8); p.s.material.opacity = Math.sin(p.t * Math.PI) * 0.4 * (1 - rk * 0.6); p.s.material.color.copy(pal.hor).lerp(fogWhite.set('#ffffff'), 0.6); });

    if (St.mode === 'play') {
      const tx = Pl.x, ty = Pl.y + 1.5, tz = Pl.z;
      v3.set(tx + Math.sin(St.yaw) * Math.cos(St.pitch) * St.dist, ty + Math.sin(St.pitch) * St.dist, tz + Math.cos(St.yaw) * Math.cos(St.pitch) * St.dist);
      if (St.darts) { const F = St.darts.fly; if (St.darts.phase === 'fly' && F) { v3.set(F.dm.position.x - 1.3, F.dm.position.y + 0.35, F.dm.position.z + 0.75); } else v3.set(Pl.x + 0.6, 2.35, Pl.z + 1.9); St.yaw = -Math.PI / 2; }
      else if (St.indoor) { const dd = Math.min(St.dist, 5.2); v3.set(tx + Math.sin(St.yaw) * Math.cos(St.pitch) * dd, ty + Math.sin(St.pitch) * dd, tz + Math.cos(St.yaw) * Math.cos(St.pitch) * dd); const Rm = RM(); v3.x = clamp(v3.x, Rm.x - Rm.w / 2 + 0.5, Rm.x + Rm.w / 2 - 0.5); v3.z = clamp(v3.z, Rm.z - Rm.d / 2 + 0.5, Rm.z + Rm.d / 2 - 0.5); v3.y = clamp(v3.y, 1.2, Rm.h - 0.5); if (Rm.camOK) for (let i = 0; i < 12 && !Rm.camOK(v3.x, v3.z); i++) { v3.x += (tx - v3.x) * 0.25; v3.z += (tz - v3.z) * 0.25; } }
      const gh = St.indoor ? 0.8 : heightAt(v3.x, v3.z) + 0.6; if (v3.y < gh) v3.y = gh;
      camFrom.set(tx, ty, tz); camDir.subVectors(v3, camFrom); const want = camDir.length(); camDir.normalize();
      camRay.set(camFrom, camDir); camRay.camera = camera; camRay.far = want + 0.4;
      const hit = camRay.intersectObjects(camBlockers, true).find(i => i.object.material !== outlineMat && !i.object.isSprite);
      const allowed = hit ? Math.max(1.2, hit.distance - 0.45) : want;
      St.camD = allowed < (St.camD ?? want) ? allowed : damp(St.camD ?? want, allowed, 3, dt);
      if (!St.darts) v3.copy(camFrom).addScaledVector(camDir, St.camD);
      const kc = hit ? 30 : 10;
      camPos.x = damp(camPos.x, v3.x, kc, dt); camPos.y = damp(camPos.y, v3.y, kc, dt); camPos.z = damp(camPos.z, v3.z, kc, dt);
      const DF = St.darts && St.darts.phase === 'fly' && St.darts.fly; const lkx = St.darts ? (DF ? lerp(DF.dm.position.x, DART.x, 0.5) : DART.x) : tx, lky = St.darts ? DART.y : ty, lkz = St.darts ? DART.z : tz;
      camLook.x = damp(camLook.x, lkx, 14, dt); camLook.y = damp(camLook.y, lky, 14, dt); camLook.z = damp(camLook.z, lkz, 14, dt);
    } else { const a = St.t * 0.045 + 1.2; camPos.set(Math.cos(a) * 40, 20 + Math.sin(St.t * 0.1) * 2, Math.sin(a) * 34); camLook.set(0, 2, 0); }
    camera.position.copy(camPos); camera.lookAt(camLook); sky.position.copy(camera.position); stars.position.copy(camera.position);
    const sc = St.mode === 'play' ? player.position : camLook; sun.target.position.copy(sc); sun.position.copy(sc).addScaledVector(lightDir, 110);
    audio.update(dt, St.indoor ? { day: 0, night: 0, rain: 0, fog: 0, fountainDist: 999 } : { day: smooth(-0.05, 0.2, sunDir.y), night: pal.glow, rain: rk, fog: fk, fountainDist: 999 });
    updateDarts(dt); updateJuke(dt);
    if (St.indoor && St.room === 'casino') { St.tvT = (St.tvT || 0) + dt; if (St.tvT > 1 / 20) { TVS.forEach(tv => drawTV(tv, St.tvT)); St.tvT = 0; } }
    casLights.forEach(t => { t.L.visible = St.indoor && St.room === 'casino'; t.L.intensity = t.k; });
    { const Rm = St.indoor ? RM() : null; roomLights.forEach(t => { const on = !!Rm && (St.room === 'barracks' || St.room === 'throneroom' || St.room === 'cave' || St.room === 'itemshop' || St.room === 'armory' || St.room === 'bowling' || St.room === 'fortune' || St.room === 'burgers') && Math.abs(t.L.position.x - Rm.x) < Rm.w; t.L.visible = on; t.L.intensity = t.k; }); }
    tavLights.forEach(t => { t.L.visible = St.indoor && St.room !== 'casino'; t.L.intensity = t.k * (t.flick ? 0.8 + 0.25 * Math.sin(St.t * 11) + 0.1 * Math.sin(St.t * 23) : 1); });
    drawMap();

    hudT -= dt;
    if (hudT < 0) {
      hudT = 0.05; const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
      const period = h < 5 ? 'Night' : h < 7 ? 'Dawn' : h < 11 ? 'Morning' : h < 14 ? 'Midday' : h < 17.5 ? 'Afternoon' : h < 19.3 ? 'Evening' : h < 20.6 ? 'Dusk' : 'Night';
      const d = St.dialog, ln = d && d.lines[d.i];
      if (St.toast) { St.toast.t -= 0.05; if (St.toast.t <= 0) St.toast = null; }
      let zoneLabel; if (St.indoor) { const I = INTERIORS[St.room] || INTERIORS.tavern; zoneLabel = I.label; if (St.zone !== I.key) { St.zone = I.key; save.where('meru', I.key); } } else { const z = ruinsFx.inOffice(Pl.x, Pl.z) ? { key: 'meruPermitOffice', label: 'Permit Office' } : zoneAt(...toArt(Pl.x, Pl.z)); zoneLabel = z.label; if (St.zone !== z.key) { St.zone = z.key; save.where('meru', z.key); } }
      const qb = questBanner(QUEST, r => save.test(r));
      const DD = St.darts; const dartsHud = DD ? { power: Math.round((DD.phase === 'aim' ? DD.p : (DD.lock ? DD.lock.p : DD.p)) * 100), perfect: Math.round(PERFECT * 100), n: Math.min(3, DD.n + (DD.phase === 'aim' || DD.phase === 'wind' ? 1 : 0)), score: DD.score, best: save.stat('meru.darts.best') } : null;
      const hud = { juke: { open: JUKE.open, playing: JUKE.playing, title: JUKE.playing >= 0 ? SONGS[JUKE.playing].title : null, genre: JUKE.playing >= 0 ? SONGS[JUKE.playing].genre : null, synth: JUKE.err === 'synth', here: !!St.indoor }, darts: dartsHud, place: 'Meru · ' + zoneLabel, zone: St.zone, quest: { title: qb.title, text: qb.text, done: qb.done }, toast: St.toast ? St.toast.text : null, gold: save.data.gold, fight: St.indoor && St.room === 'cave' && (St.camp === 'fight' || CB.hud().foes > 0 || CB.P.hp < CB.P.max) ? CB.hud() : null, lock: St.lock ? { pins: St.lock.pins, set: St.lock.set, pos: St.lock.pos, zone: St.lock.zone, msg: St.lock.msg } : null, wheel: St.wheel ? { items: Object.entries(save.data.items).map(([id, n]) => ({ id, n, label: itemName(id) })) } : null, clock: String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), period, weather: { clear: 'Clear', fog: 'Fog', rain: 'Rain' }[St.weather], muted: St.muted,
        prompt: St.mode === 'play' && St.near ? 'Talk to ' + St.near.name : St.mode === 'play' && St.spot ? (St.spot.text ? St.spot.text : St.spot.game ? 'Play ' : St.spot.cas === 'out' ? 'Back to the ' : St.spot.juke ? (JUKE.open ? 'Close the ' : 'Play the ') : St.spot.darts ? (St.darts ? 'Throw dart ' + (St.darts.n + 1) + ' of 3' : 'Play ') : St.spot.tav === 'out' ? 'Back to the ' : St.spot.go ? 'Enter ' : St.spot.kind === 'door' ? 'Enter the ' : 'Take the ') + (St.spot.darts && St.darts ? '' : St.spot.label) : null,
        dialog: d ? { name: ln.name, role: ln.role, text: ln.text.slice(0, Math.floor(d.chars)), step: d.i + 1, total: d.lines.length, done: d.chars >= ln.text.length, you: ln.you, more: !!d.conv, choices: d.choices ? d.choices.map(c => ({ text: c.text, asked: c.asked, bye: c.bye })) : null } : null };
      const key = JSON.stringify(hud); if (key !== lastHud) { lastHud = key; onState(hud); }
    }
  }
  // phone budget: draw only the room you are in, the zones near you, and foxes within sight
  let cullK = 0, lastIndoor = null;
  function cull() {
    if (cullK++ % 8 && lastIndoor === St.indoor) return; const ind = St.indoor;
    if (ind !== lastIndoor) { camera.far = ind ? 60 : 1200; camera.updateProjectionMatrix(); lastIndoor = ind; }
    for (const k in ROOM_G) if (ROOM_G[k]) ROOM_G[k].visible = ind && St.room === k; critterGroup.visible = ind && St.room === 'cave';
    cpRoot.visible = !ind && Pl.z < CP.cz(2880) + 50;
    ruinsFx.rootR.visible = !ind && Pl.x < 25; lakeFx.root.visible = !ind && Pl.z > 8; apFx.root.visible = !ind && Pl.x > 10; ruinsFx.rootD.visible = !ind && Pl.x < -70;
    const Rm = ind ? RM() : null;
    for (const n of npcs) if (!n.gone) n.c.visible = ind ? inRoom(Rm, n.x, n.z) || Math.hypot(n.x - Pl.x, n.z - Pl.z) < 20 : n.z < 150 && Math.hypot(n.x - Pl.x, n.z - Pl.z) < 55;
  }
  function frame() { raf = requestAnimationFrame(frame); try { update(Math.min(clock.getDelta(), 0.05)); } catch (e) { window.__townErr = String(e && e.stack || e); if (!frame.err) { frame.err = 1; console.error('town update failed: ' + (e && e.message) + ' @ ' + String(e && e.stack).split('\n').slice(0, 3).join(' | ')); } } renderer.render(scene, camera); }
  frame();

  const lineFor = (n, l) => l.who === 'max' ? { name: 'Max', role: 'Prince', text: l.text, mood: 'warm', who: 'max' } : l.who === 'player' ? { name: 'You', role: 'Fox', text: l.text, you: true, mood: l.mood || moodOf(l.text, 'warm', true) } : { name: n.name, role: n.role, text: l.text, mood: l.mood || moodOf(l.text, MOODS[n.key], false) };
  function convNext(d) { const o = d.conv.options(); if (o === 'lines') { d.lines = d.conv.lines().map(l => lineFor(d.npc, l)); d.i = 0; d.chars = 0; audio.blip(); return true; } if (o) { d.choices = o; d.chars = d.lines[d.i].text.length; audio.blip(); return true; } return false; }
  const RUB = CV.at(0.5, 0.099); St.camp = save.flag('banditsDown') ? 'down' : save.flag('banditsJoined') ? 'gang' : (save.flag('ringJob') || save.flag('ransomNamed')) ? 'joined' : 'idle';
  const chestsOpen = () => (save.flag('caveChest0') ? 1 : 0) + (save.flag('caveChest1') ? 1 : 0);
  function caveTree(n) {
    if (n.key === 'rook' && !banditsDown() && !save.flag('maxFreed')) { if (save.flag('ringJob') && save.flag('hasSageRing')) return branch(CV.RING_HANDOVER); if (save.flag('ringJob')) return branch(CV.ROOK_RING); if (save.flag('ransomNamed')) return branch(CV.ROOK_RANSOM); }
    if (n.key !== 'max' || save.flag('maxHome')) return null;
    if (save.flag('maxFollowing')) return branch([{ who: 'npc', text: 'Right behind you. Lead the way!' }]);
    if (save.flag('maxFreed')) return CV.READY(chestsOpen()); if (!banditsDown() && !save.flag('banditsJoined')) return branch(CV.MAX_BUSY); return CV.RESCUE(); }
  function openChest(i) { save.setFlag('caveChest' + i); const h = CV.HAUL[i]; save.addGold(h.gold); save.addRelic(h.relic); caveK.chestLids[i].rotation.x = -1.9; save.addXp(25); toast('+' + h.gold + ' GOLD · ' + h.name); audio.tone(660, 0.3, 0.05, 'triangle', 1.5); }
  function sayAs(n, lines, then) { n.c.userData.hop = 1; St.dialog = { npc: n, lines: lines.map(l => lineFor(n, l)), i: 0, chars: 0, choices: null, then }; audio.blip(); }
  function treeAs(n, tree, then) { const conv = new Conversation(tree, { test: r => save.test(r), set: f => save.setFlag(f), act: a => talkAction(a), asked: new Set() }); const ls = conv.lines(); St.dialog = { npc: n, conv, lines: ls.map(l => lineFor(n, l)), i: 0, chars: 0, choices: null, then }; audio.blip(); }
  const bn = k => bandits.find(b => b.key === k);
  function callOut(g) { St.camp = 'called'; audio.tone(300, 0.2, 0.05, 'square', 0.8); sayAs(g, CV.CALL_OUT, () => { goTo(CV.MARCH.player.x, CV.MARCH.player.z, 0, true);
    setTimeout(() => { for (const k of ['rook', 'vix', 'snag']) { const b = bn(k), p = CV.MARCH[k]; b.x = p.x; b.z = p.z; b.face = Math.atan2(CV.MARCH.player.x - p.x, CV.MARCH.player.z - p.z); } }, 320);
    setTimeout(() => { St.camp = 'parley'; treeAs(bn('rook'), CV.PARLEY()); }, 520); }); }
  function freeMax() { save.setFlag('maxFreed'); caveK.cageBars.visible = false; maxNpc.x = CV.MAX_FREE.x; maxNpc.z = CV.MAX_FREE.z; maxNpc.c.userData.mood = 'happy'; toast('The lock pops open!'); audio.tone(880, 0.3, 0.05, 'triangle', 1.5); setTimeout(() => treeAs(maxNpc, CV.FREED(chestsOpen())), 600); }
  function knockedDown() { toast('Knocked down. You come round by the river.'); CB.reset(save.flag('banditsDown') ? f => f.critter : null); if (!save.flag('banditsDown')) St.camp = save.flag('banditsJoined') ? 'gang' : (save.flag('ringJob') || save.flag('ransomNamed')) ? 'joined' : 'idle'; goTo(CV.at(0.5, 0.26).x, CV.at(0.5, 0.26).z, 0, true); }
  function talkAction(a) { const d = St.dialog; if (!d) return;
    if (a === 'fight') { d.then = () => { St.camp = 'fight'; CB.engage(); toast('Fight! 1 MELEE · 2 RANGE'); }; }
    if (a === 'release') { d.then = () => { St.camp = save.flag('ringJob') ? 'joined' : 'ransom'; const s = bn('snag'); s.x = s.ctl.home[0]; s.z = s.ctl.home[1]; s.face = s.ctl.home[2]; Pl.z = CV.RELEASE_Z; }; }
    if (a === 'lock') { d.then = () => { St.lock = { pins: 3, set: 0, pos: 0.06, dir: 1, speed: 0.43, zone: 0.42, msg: 'PRESS when the pick is in the GREEN.' }; }; }
    if (a === 'dig') { d.then = () => { toast('EXCAVATION PERMIT'); St.playing = 'duneglass'; onPlayGame('duneglass', 'Dig site', 'minigames/meru/duneglass.html', 'Meru Desert'); }; }
    if (a === 'relics') d.then = () => relicCounter(d.npc);
    if (a && a.startsWith('sell:')) { const k = a.slice(5), r = CV.RELICS[k]; if (r && save.dropRelic(k)) { save.addGold(r.value); toast('+' + r.value + ' GOLD · sold ' + r.name); d.then = () => { if (save.data.relics.some(x => CV.RELICS[x])) relicCounter(d.npc); }; } }
    if (a && a.startsWith('buy:')) { const [, shop, key] = a.split(':'); const line = SH.buy(save, shop, key); if (line) toast('-' + line.price + ' GOLD · ' + line.label); d.then = () => treeAs(d.npc, SH.counter(d.npc, save)); }
    if (a === 'diner') d.then = () => { St.playing = 'diner'; onPlayGame('diner', 'Burgers', 'minigames/meru/diner.html', 'Burgers'); };
    if (a === 'shopAgain') d.then = () => treeAs(d.npc, SH.counter(d.npc, save));
    if (a === 'shopTalk') d.then = () => treeAs(d.npc, TALK[d.npc.key]);
    if (a === 'offer') { d.then = () => treeAs(d.npc, LK.RENTAL(save.data.gold >= 1)); }
    if (a === 'pay1') { save.spend(1); toast('-1 GOLD · The boat is yours'); }
    if (a === 'steal') { const caught = Math.random() < 0.3; if (caught) toast('Caught! The Sage pulls his hand away. Try again later.'); else { save.setFlag('hasSageRing'); toast('BLACK STONE RING · Take it to the bandit camp'); } } }
  function relicCounter(n) { const own = save.data.relics.filter(k => CV.RELICS[k]); if (!own.length) return;
    treeAs(n, branch([{ who: 'npc', text: 'Let me see what you have.' }, { who: 'npc', text: 'Your purse: ' + save.data.gold + ' gold.' }], [...own.map(k => ({ label: CV.RELICS[k].name + ' — ' + CV.RELICS[k].value + 'g', replies: [CV.RELICS[k].remark], do: 'sell:' + k })), { label: '← Keep them for now', replies: ['As you like. The offer does not expire.'] }])); }
  function ringHandover() { save.setFlag('banditsJoined'); save.setFlag('hasSageRing', false); St.camp = 'gang'; freeMax(); setTimeout(() => toast('WELCOMED INTO THE GANG'), 2400); }

  function castleGate(s) {
    if (s.gate === 'cave') { St.room = 'cave'; goTo(CV.ENTRY.x, CV.ENTRY.z, 0, true); return; }
    if (s.toast) { toast(s.toast); return; }
    if (s.gate === 'barracks') { St.room = 'barracks'; goTo(IN.BAR_EXIT.x, IN.BAR_EXIT.z - 4.5, Math.PI, true); return; }
    const g1 = npcs.find(n => n.key === 'castleGuard1'), ls = CP.castleDoorLines(f => save.flag(f));
    if (!ls) { enterThrone(false); return; }
    g1.c.userData.hop = 1; St.dialog = { npc: g1, lines: ls.map(l => l.who === 'max' ? { name: 'Max', role: 'Prince', text: l.text, mood: 'warm' } : lineFor(g1, l)), i: 0, chars: 0, choices: null, then: save.flag('maxFollowing') ? () => enterThrone(true) : null }; audio.blip();
  }
  function enterThrone(audience) {
    St.room = 'throneroom'; goTo(IN.THR_EXIT.x, IN.THR_EXIT.z - 4.5, Math.PI, true);
    if (!audience) return;
    save.setFlag('maxHome'); save.setFlag('maxFollowing', false); const mx = addMax(); const king = npcs.find(n => n.key === 'mike');
    setTimeout(() => { Pl.x = IN.KING_SPOT.x; Pl.z = IN.KING_SPOT.z + 4.2; Pl.face = Math.PI; St.yaw = 0; toast('Max made it home!');
      St.dialog = { npc: king, lines: IN.audienceLines().map(l => l.who === 'max' ? { name: 'Max', role: 'Prince', text: l.text, mood: 'warm', who: 'max' } : lineFor(king, l)), i: 0, chars: 0, choices: null, then: () => { IN.grantGifts(save); toast('+5 HEALING CHARGES · +150 GOLD · FLAGSHIP · BIG LASER GUN'); } }; }, 700);
  }
  function cAttack(kind) {
    { let tf = null, bd = kind === 'melee' ? 4 : 14; for (const f of CB.foes) { if (f.down || !f.hostile) continue; const d = Math.hypot(f.n.x - Pl.x, f.n.z - Pl.z); if (d < bd) { bd = d; tf = f; } } if (tf) { Pl.face = Math.atan2(tf.n.x - Pl.x, tf.n.z - Pl.z); } }
    const hit = CV.state.rubble > 0 ? [{ x: RUB.x, z: RUB.z, r: 1.2, onHit: k => { if (k !== 'range') { toast('Stone will not yield to the blade. Use 2 RANGE.'); return; } if (!save.flag('tournamentWon')) { toast('The rocks hold. Come back after the tournament.'); return; } CV.state.rubble--; audio.burst(0.2, 300, 0.25); toast(CV.state.rubble > 0 ? 'The cave-in cracks.' : 'The way is clear.'); } }] : [];
    CB.attack(kind, Pl, player, { laserDmg: save.flag('bigLaser') ? 30 : 15, meleeDmg: 30, hit }); }
  const toast = text => { St.toast = { text, t: 2.4 }; audio.blip(); };
  const itemName = id => SH.ITEM_LABELS[id] || String(id).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());
  const api = window.__8G_GAME = {
    start() { St.mode = 'play'; audio.init(); audio.setMuted(St.muted); camPos.set(Pl.x, 10, Pl.z + 14); },
    talk() {
      if (St.mode !== 'play') return; if (St.lock) { const lk = St.lock; if (Math.abs(lk.pos - 0.5) < lk.zone / 2) { lk.set++; lk.msg = 'Pin ' + lk.set + ' of ' + lk.pins + ' set.'; audio.tone(700 + lk.set * 120, 0.12, 0.05, 'triangle', 1.2); if (lk.set >= lk.pins) { St.lock = null; freeMax(); } } else { lk.msg = 'PRESS when the pick is in the GREEN.'; audio.tone(160, 0.12, 0.05, 'square', 0.7); } return; } const d = St.dialog;
      if (d) { if (d.choices) return; const L = d.lines[d.i].text.length; if (d.chars < L) d.chars = L; else if (d.i < d.lines.length - 1) { d.i++; d.chars = 0; audio.blip(); const ln = d.lines[d.i]; if (d.npc && ln.mood === 'excited') (ln.you ? player : d.npc.c).userData.hop = 1; } else if (d.conv && convNext(d)) {} else { const th = St.dialog.then; St.dialog = null; if (th) th(); } return; }
      const n = nearest();
      if (n) { n.c.userData.hop = 1; const asked = St.asked[n.key] || (St.asked[n.key] = new Set()); if (n.key === 'fisherwoman') save.setFlag('maxTavernLead'); if (n.key === 'michaelJay') save.setFlag('mjGreeted'); if (n.key === 'docBraun') save.setFlag('docGreeted'); if (save.flag('maxTavernLead') && St.indoor && St.room === 'tavern') save.setFlag('maxTavernAsked');
        const ringNow = n.key === 'rook' && save.flag('ringJob') && save.flag('hasSageRing') && !save.flag('maxFreed'); const dyn = (n.key === 'ora' ? branch(ORA_LINES[FT.oraIndex(f => save.flag(f))]) : null) || (n.shop ? SH.counter(n, save) : null) || (BG.DYN[n.key] ? BG.DYN[n.key](f => save.flag(f)) : null) || caveTree(n) || (RU.DYN[n.key] ? RU.DYN[n.key](f => save.flag(f), save) : LK.DYN[n.key] ? LK.DYN[n.key](f => save.flag(f), save) : null); const conv = new Conversation(dyn || TALK[n.key] || { start: 'root', nodes: { root: { lines: [] } } }, { test: r => save.test(r), set: f => save.setFlag(f), act: a => talkAction(a), asked: dyn ? new Set() : asked }); const ls = conv.lines(); const d = St.dialog = { npc: n, conv, lines: ls.length ? ls.map(l => lineFor(n, l)) : [{ name: n.name, role: n.role, text: '', mood: MOODS[n.key] }], i: 0, chars: 0, choices: null, then: ringNow ? ringHandover : null }; if (!ls.length) convNext(d); audio.blip(); return; }
      const s = nearSpot();
      if (s && s.darts) { dartsPress(); return; }
      if (s && s.juke) { JUKE.open = !JUKE.open; audio.blip(); return; }
      if (s && s.game) { St.playing = s.game; onPlayGame(s.game, s.label); audio.blip(); return; }
      if (s && s.cas === 'in') { St.room = 'casino'; goTo(CAS_EXIT.x, CAS_EXIT.z - 2.6, Math.PI, true); return; }
      if (s && s.cas === 'out') { goTo(CAS_DOOR_OUT.x, CAS_DOOR_OUT.z, 0, false); return; }
      if (s && s.tav === 'in') { St.room = 'tavern'; goTo(TAV_EXIT.x, TAV_EXIT.z - 2.6, Math.PI, true); return; }
      if (s && s.tav === 'out') { goTo(TAV_DOOR_OUT.x, TAV_DOOR_OUT.z, 0, false); return; }
      if (s && s.gate) { castleGate(s); return; }
      if (s && s.lake === 'fish') { St.playing = 'fishing'; onPlayGame('fishing', 'Fishing', 'minigames/meru/fishing.html', 'Meru Lake'); return; }
      if (s && s.lake === 'board') { if (!save.flag('boatRented')) { toast('Rent the boat from the Fisherman first.'); return; } BOAT.on = true; Pl.x = LK.MOOR.x; Pl.z = LK.MOOR.z; Pl.face = LK.MOOR.face; St.yaw = Pl.face + Math.PI; toast('Aboard. Steer back to the jetty to step ashore.'); audio.tone(300, 0.2, 0.04, 'sine', 1.3); return; }
      if (s && s.ashore) { BOAT.on = false; Pl.x = LK.ASHORE.x; Pl.z = LK.ASHORE.z; lakeFx.boat.position.set(LK.MOOR.x, LK.WATER_Y, LK.MOOR.z); lakeFx.boat.rotation.set(0, LK.MOOR.face, 0); audio.tone(300, 0.2, 0.04, 'sine', 1.3); return; }
      if (s && s.dive) { St.playing = 'diving'; onPlayGame('diving', 'Dive for pearls', 'minigames/meru/diving.html', 'Meru Lake'); return; }
      if (s && s.bowl) { St.playing = 'tenpin'; onPlayGame('tenpin', 'Ten-pin bowling', 'minigames/meru/tenpin.html', 'Meru Lanes'); return; }
      if (s && s.kind === 'door' && s.label === 'Fortune Teller') { St.room = 'fortune'; goTo(FT.TENT.exit.x, FT.TENT.exit.z - 1.8, Math.PI, true); return; }
      if (s && s.kind === 'door' && s.label === 'Burgers') { St.room = 'burgers'; goTo(BG.DINER.exit.x, BG.DINER.exit.z - 2.4, Math.PI, true); return; }
      if (s && s.kind === 'door' && s.label === 'Meru Lanes') { St.room = 'bowling'; goTo(LN.LANES.exit.x, LN.LANES.exit.z - 2.4, Math.PI, true); return; }
      if (s && s.out === 'shop') { const o = SHOP_OUT(St.room); goTo(o.x, o.z, o.face, false); return; }
      if (s && s.kind === 'door' && /^(Item Shop|Armory)$/.test(s.label)) { const k = s.label === 'Armory' ? 'armory' : 'itemshop'; St.room = k; goTo(SH.ROOMS[k].exit.x, SH.ROOMS[k].exit.z - 2.4, Math.PI, true); return; }
      if (s && s.out === 'cave') { goTo(RU.dx(1440), RU.dz(1880), 0, false); return; }
      if (s && s.rubble) { toast('Stand back and fire: 2 RANGE.'); return; }
      if (s && s.chest != null) { openChest(s.chest); return; }
      if (s && s.out === 'barracks') { goTo(BAR_OUT.x, BAR_OUT.z, -Math.PI / 2, false); return; }
      if (s && s.out === 'throneroom') { goTo(THR_OUT.x, THR_OUT.z, 0, false); return; }
      if (s && s.bunk) { toast('Rested. You are fit to serve the King again.'); audio.tone(520, 0.3, 0.05, 'sine', 1.5); return; }
      if (s && (s.range || s.spar)) { toast(s.range ? 'The range opens with the shared combat engine (next build step).' : 'Sparring opens with the shared combat engine (next build step).'); return; }
      if (s && s.go) { try { sessionStorage.setItem('meru.from', 'town'); } catch (e) {} onNavigate(s.go); return; }
      if (s) { St.dialog = { npc: null, at: [Pl.x, Pl.z], lines: [{ name: s.label, role: s.kind === 'door' ? 'Interior' : 'Exit', text: s.kind === 'door' ? `The ${s.label} interior hasn't been built in 3D yet. Only the square is so far.` : `The road to ${s.label} hasn't been built in 3D yet.` }], i: 0, chars: 0 }; audio.blip(); }
    },
    jump() { input.jump = true; },
    choose(k) { const d = St.dialog; if (!d || !d.choices) return; const o = d.choices[k]; if (!o) return; const ls = d.conv.choose(o.i); d.choices = null; if (!ls) { const th = d.then; St.dialog = null; audio.blip(); if (th) th(); return; } d.lines = ls.map(l => lineFor(d.npc, l)); d.i = 0; d.chars = 0; audio.blip(); },
    melee() { if (St.mode !== 'play' || St.dialog || St.lock) return; if (St.indoor && St.room === 'cave') { cAttack('melee'); return; } toast('Weapons stay holstered in town.'); },
    range() { if (St.mode !== 'play' || St.dialog || St.lock) return; if (St.indoor && St.room === 'cave') { cAttack('range'); return; } toast('Weapons stay holstered in town.'); },
    item() { if (St.mode !== 'play' || St.dialog) return; St.wheel = !St.wheel; audio.blip(); },
    closeWheel() { St.wheel = false; },
    useItem(id) { St.wheel = false; if (id === 'erToGo' || id === 'healingCharges' || id === 'splint') { if (CB.P.hp >= CB.P.max) { toast('You are already at full health.'); return; } save.take(id); CB.P.hp = Math.min(CB.P.max, CB.P.hp + (id === 'splint' ? 60 : 40)); toast(itemName(id) + ': +' + (id === 'splint' ? 60 : 40) + ' health'); audio.tone(660, 0.25, 0.05, 'sine', 1.5); return; } if (id === 'amber' || id === 'chocolates') { save.take(id); toast(itemName(id) + ': delicious.'); return; } toast(itemName(id) + ': nothing to use it on here.'); },
    warp(where) { if (where === 'burgers') { St.room = 'burgers'; goTo(BG.DINER.exit.x, BG.DINER.exit.z - 2.4, Math.PI, true); return; } if (where === 'fortune') { St.room = 'fortune'; goTo(FT.TENT.exit.x, FT.TENT.exit.z - 1.8, Math.PI, true); return; } if (where === 'bowling') { St.room = 'bowling'; goTo(LN.LANES.exit.x, LN.LANES.exit.z - 2.4, Math.PI, true); return; } if (where === 'itemshop' || where === 'armory') { St.room = where; goTo(SH.ROOMS[where].exit.x, SH.ROOMS[where].exit.z - 2.4, Math.PI, true); return; } if (where === 'arenapath') { goTo(46, 0, Math.PI / 2, false); return; } if (where === 'boat') { save.setFlag('boatRented'); goTo(LK.ASHORE.x, LK.ASHORE.z - 0.6, Math.PI, false); setTimeout(() => api.talk(), 700); return; } if (where === 'lake') { goTo(LK.lx(1710), LK.lz(1300), Math.PI, false); return; } if (where === 'beach') { goTo(LK.lx(840), LK.lz(500), 0, false); return; } if (where === 'rescue') { save.setFlag('tournamentWon'); CV.state.rubble = 0; CB.foes.forEach(f => { f.down = true; f.hp = 0; }); St.camp = 'down'; save.setFlag('banditsDown'); St.room = 'cave'; goTo(CV.at(0.5, 0.922).x, CV.at(0.5, 0.922).z, 0, true); return; } if (where === 'cave' || where === 'camp') { St.room = 'cave'; const p = where === 'camp' ? CV.at(0.5, 0.70) : CV.ENTRY; goTo(p.x, p.z, 0, true); if (where === 'camp') { save.setFlag('tournamentWon'); CV.state.rubble = 0; } return; } if (where === 'ruins') { goTo(RU.rx(1900), RU.rz(1440), -Math.PI / 2, false); return; } if (where === 'museum') { goTo(RU.rx(1400), RU.rz(2050), 0, false); return; } if (where === 'desert') { goTo(RU.dx(1800), RU.dz(2150), Math.PI, false); return; } if (where === 'permit') { goTo(RU.dx(2367), RU.dz(760), Math.PI, false); return; } if (where === 'barracks' || where === 'throneroom') { St.room = where; const E = where === 'barracks' ? IN.BAR_EXIT : IN.THR_EXIT; goTo(E.x, E.z - 4.5, Math.PI, true); return; } if (where === 'audience') { save.setFlag('tournamentWon'); save.setFlag('maxFollowing'); enterThrone(true); return; } if (where === 'castle') { St.room = null; goTo(CP.cx(876), CP.cz(1250), Math.PI, false); return; } if (where === 'castleSouth') { goTo(CP.cx(876), CP.cz(2700), Math.PI, false); return; } if (where === 'casino' || where === 'tavern') { St.room = where; const E = where === 'casino' ? CAS_EXIT : TAV_EXIT; goTo(E.x, E.z - 2.6, Math.PI, true); } },
    gameClosed() { St.playing = null; },
    playSong(i) { playSong(i); }, stopSong() { stopSong(); }, closeJuke() { JUKE.open = false; },
    songs: SONGS.map(s => ({ n: s.n, genre: s.genre, title: s.title, col: s.col })),
    cycleWeather() { St.weather = { clear: 'fog', fog: 'rain', rain: 'clear' }[St.weather]; },
    skipTime(hrs = 3) { St.time = (St.time + hrs) % 24; },
    toggleSound() { St.muted = !St.muted; audio.init(); audio.setMuted(St.muted); },
    setMinimap(c) { mapCanvas = c; if (!c) { mapCtx = null; return; } const r = c.getBoundingClientRect(); c.width = Math.round((r.width || 168) * devicePixelRatio); c.height = Math.round((r.height || 168) * devicePixelRatio); mapCtx = c.getContext('2d'); },
    setOptions(o) {
      if (o.timeScale != null) opts.timeScale = o.timeScale; if (o.followCam != null) opts.followCam = !!o.followCam; if (o.outlines != null) outlineMat.visible = !!o.outlines;
      if (o.startHour != null && o.startHour !== opts.startHour) { opts.startHour = o.startHour; St.time = o.startHour % 24; }
      if (o.quality && o.quality !== opts.quality) { opts.quality = o.quality; renderer.setPixelRatio(Math.min(devicePixelRatio, o.quality === 'low' ? 1 : 2)); renderer.shadowMap.enabled = o.quality !== 'low'; scene.traverse(m => { if (m.material) [].concat(m.material).forEach(x => x.needsUpdate = true); }); }
    },
    destroy() { stopSong(); cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur); audio.dispose(); renderer.dispose(); el.remove(); joyBase.remove(); joyKnob.remove(); },
  };
  if (minimap) api.setMinimap(minimap);
  return api;
}

export { canvasTex, emblemTex, crestTex, bannerTex, signTex, FONT };
