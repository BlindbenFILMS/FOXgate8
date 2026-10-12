import { plantTrees, plantShrubs, plantTufts, plantFlowers } from './meru2-flora.js';
// MERU 2.0 — step 2: TOWN SQUARE CITY CENTRE (outsides). Called by meru2-blockout.js.
// Every Town Square building as a real shell (4 walls + a top) with a facade texture (windows light up at night), a GOLD light-up
// frame round 4 × 4.5 m automatic sliding glass doors (2.5 m sensor, chime), a shop sign over every door, NOW HIRING signs,
// and the CUTAWAY: inside a building (or when the camera is), the top and the walls between camera and player fade out.
// Plus the plaza: fountain, trees, benches, city lamps with light pools, crosswalks, cars on the ring road (roads only).
// Old stone kept for Meru history: Tavern, Fortune Teller, Bank. Phone budget: merged static meshes, instanced lamps/trees/cars.
export function buildCity({ THREE, scene, camera, toon, grad, CT, L, touch, avoid = () => false }) {
  const STY = {
    tavern: { s: 'stone', base: '#b9a27e', h: 9, roof: 'hip', roofC: '#7a4a33', awn: '#7a4a33' },
    casino: { s: 'glass', base: '#2a2236', gl: ['#7b5fa3', '#2e2244'], h: 14, neon: 'neonP', roofC: '#201e1d', finC: '#1c1824' },
    bowling: { s: 'panel', base: '#c94c3a', h: 10, neon: 'neonB', pin: true, roofC: '#3d3b3a' },
    itemshop: { s: 'brick', base: '#9b4b37', h: 7, awn: '#ec3013', goods: 'shop' },
    armory: { s: 'panel', base: '#6b737b', h: 7, awn: '#201e1d', goods: 'arms' },
    fortune: { s: 'stone', base: '#a99579', h: 7, dome: '#5b3f7a' },
    burgers: { s: 'brick', base: '#b0623f', h: 7, awn: '#ec3013', goods: 'food' },
    police: { s: 'panel', base: '#2e4a6b', h: 12, bar: true },
    bank: { s: 'stone', base: '#ece6d8', h: 16, cols: true },
    carRental: { s: 'glass', base: '#56636e', h: 7, awn: '#ec3013' },
    crest: { s: 'glass', base: '#4f5c66', h: 34, crown: true, balc: true },
    lake: { s: 'glass', base: '#43525e', h: 46, crown: true, balc: true },
    stationTown: { s: 'glass', base: '#56636e', h: 8, canopy: true, sign: ['#ec3013', '#ffffff'] },
    // step 5: the lakeside buildings
    blindSchool: { s: 'stone', base: '#e8d9b8', h: 9, roof: 'hip', roofC: '#2e4a6b', awn: '#ffd23a' },
    boatworks: { s: 'panel', base: '#8b6a48', h: 9, awn: '#2e4a6b', roofC: '#3d3b3a', goods: 'tools' },
    boathouse: { s: 'panel', base: '#f3f2f2', h: 8, awn: '#ec3013', roofC: '#2e4a6b', goods: 'shop' },
    // step 7: the Barracks yard workshops
    tankWorks: { s: 'panel', base: '#6c7166', h: 9, awn: '#ffd23a', roofC: '#3d3b3a' },
    tankRange: { s: 'panel', base: '#7a7a63', h: 9, awn: '#ec3013', roofC: '#3d3b3a' },
  };
  const keys = new Set(Object.keys(STY)), RECT = [-170, 170, -150, 160];
  const T = 0.4, DW = 4, DH = 4.5, GAP = DW / 2 + 0.45, CW = 3, CH = 3.5, TU = 4 * CW, TV = 4 * CH, SIDES = ['N', 'S', 'W', 'E'];
  const FACE = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const E = new THREE.Euler(), Q = new THREE.Quaternion(), M4 = new THREE.Matrix4(), V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), ONE = V(1, 1, 1);
  const Box = (a, b, c) => new THREE.BoxGeometry(a, b, c), Cyl = (a, b, h, n = 12) => new THREE.CylinderGeometry(a, b, h, n);
  function piece(geo, x, y, z, ry = 0, rx = 0, col) { const g = geo.index ? geo.toNonIndexed() : geo; if (g !== geo) geo.dispose(); E.set(rx, ry, 0, 'YXZ'); M4.compose(V(x, y, z), Q.setFromEuler(E), ONE); g.applyMatrix4(M4);
    if (col) { const c = new THREE.Color(col), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); } return g; }
  function merge(list) { let n = 0; for (const g of list) n += g.attributes.position.count; const hasC = list.every(g => g.attributes.color);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = hasC ? new Float32Array(n * 3) : null; let o = 0;
    for (const g of list) { const c = g.attributes.position.count; pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2); if (col) col.set(g.attributes.color.array, o * 3); o += c; g.dispose(); }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); if (col) G.setAttribute('color', new THREE.BufferAttribute(col, 3)); G.computeBoundingSphere(); return G; }
  const root = new THREE.Group(); scene.add(root);
  const MAT = { gold: new THREE.MeshBasicMaterial({ color: 0xffc64a }), neonP: new THREE.MeshBasicMaterial({ color: 0xb8407f }), neonB: new THREE.MeshBasicMaterial({ color: 0x3a8fa8 }) };
  const NEON = { neonP: [0xb8407f, 0xff3fb4], neonB: [0x3a8fa8, 0x52e3ff] }, matFor = k => MAT[k] || (MAT[k] = k.startsWith('awn:') ? awnMat(k.slice(4)) : toon(k));
  const awnMat = c => { const t = CT(64, 16, (g, w, hh) => { g.fillStyle = '#f1ece2'; g.fillRect(0, 0, w, hh); g.fillStyle = c; g.fillRect(0, 0, w / 2, hh); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return new THREE.MeshLambertMaterial({ map: t }); };
  let api_street = null; const bins = {}, D = (k, geo, x, y, z, ry = 0, rx = 0) => (bins[k] || (bins[k] = [])).push(piece(geo, x, y, z, ry, rx));
  const colliders = [], doors = [], blds = [], facMats = [], signMats = [], neonMats = [], blink = [], pools = [], glowP = [], bladeMats = [], bladeGlow = [];
  const BLADE = ['#ff3fb4', '#52e3ff', '#ffd23a', '#7dff6a', '#ff6a3a', '#b98bff']; let nBlade = 0;
  const glass = new THREE.MeshPhongMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.3, shininess: 120, specular: 0xffffff, depthWrite: false });

  // step 10 pass 1: window shapes per material as [x, y-from-top, w, h] fractions of a 3 × 3.5 m cell (shared by the texture and the 3D trims)
  const WIN = { glass: [0.04, 0.03, 0.92, 0.8], panel: [0.07, 0.12, 0.86, 0.7], brick: [0.1, 0.12, 0.8, 0.74], stone: [0.2, 0.11, 0.6, 0.72] };
  const TRIM = { stone: '#efe7d6', brick: '#e6dfd2', panel: '#2c3036' }, LOD = touch ? 90 : 160;
  const shade = (hex, k) => '#' + new THREE.Color(hex).offsetHSL(0, 0, k).getHexString(), IC = new THREE.Color(), inst = [], goodsMats = [];
  // ---------- facade textures: a 4 × 4 cell tile (cell = 3 m × 3.5 m), per material (brick, stone, metal panel, glass curtain wall); windows light up at night ----------
  const TS = touch ? 256 : 512, c4 = TS / 4, px = Math.max(1, TS / 256), R = (a, b) => a + Math.random() * (b - a);
  function facade(S) { const st = S.s, [fx, fy, fw, fh] = WIN[st], lit = [], blind = [];
    for (let i = 0; i < 16; i++) { lit.push(Math.random() < 0.62 ? (Math.random() < 0.7 ? '#ffd28a' : '#cfe0ff') : '#05070a'); blind.push(Math.random() < 0.45 ? R(0.15, 0.6) : 0); }
    const shape = (g, i, j) => { const x = i * c4 + fx * c4, y = j * c4 + fy * c4, ww = fw * c4, hh = fh * c4; g.beginPath();
      if (st === 'stone') { const r = ww / 2; g.moveTo(x, y + hh); g.lineTo(x, y + r); g.arc(x + r, y + r, r, Math.PI, 0); g.lineTo(x + ww, y + hh); g.closePath(); } else g.rect(x, y, ww, hh); };
    const map = CT(TS, TS, g => {
      if (st === 'brick') { g.fillStyle = '#b9ae9f'; g.fillRect(0, 0, TS, TS); const bh = TS / 70, bl = TS / 24, j = Math.max(1, TS / 512);
        for (let y = 0, r = 0; y < TS - 0.5; y += bh, r++) for (let x = r % 2 ? -bl / 2 : 0; x < TS; x += bl) { g.fillStyle = shade(S.base, R(-0.07, 0.05)); g.fillRect(x + j, y + j, bl - j * 1.6, bh - j * 1.6); } }
      else if (st === 'stone') { g.fillStyle = shade(S.base, -0.12); g.fillRect(0, 0, TS, TS); const rh = TS / 28, j = Math.max(1, TS / 400);
        for (let y = 0; y < TS - 0.5; y += rh) for (let x = -R(0, TS / 12); x < TS;) { const bl = TS * R(0.7, 1.5) / 12; g.fillStyle = shade(S.base, R(-0.05, 0.04)); g.fillRect(x + j, y + j, bl - j * 2, rh - j * 2); x += bl; } }
      else if (st === 'panel') { g.fillStyle = S.base; g.fillRect(0, 0, TS, TS); const pw = c4 / 2;
        for (let y = 0; y < TS; y += pw) for (let x = 0; x < TS; x += pw) { g.fillStyle = shade(S.base, R(-0.035, 0.035)); g.fillRect(x, y, pw, pw); g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x, y + pw - 2 * px, pw, 2 * px); g.fillRect(x + pw - 2 * px, y, 2 * px, pw); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x, y, pw, px); }
        g.fillStyle = 'rgba(0,0,0,0.14)'; for (let j = 0; j < 4; j++) g.fillRect(0, j * c4 + c4 * 0.9, TS, c4 * 0.1); }
      else { g.fillStyle = S.base; g.fillRect(0, 0, TS, TS); }
      for (let i = 0, n = TS * 3; i < n; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'; g.fillRect(Math.random() * TS, Math.random() * TS, px * 2, px * 2); }
      const gc = S.gl || (st === 'glass' ? ['#c4dcea', '#4f7a96'] : ['#7d929e', '#1f2b33']);
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const k = j * 4 + i, wx = i * c4 + fx * c4, wy = j * c4 + fy * c4, ww = fw * c4, wh = fh * c4;
        if (st !== 'glass') { const sg = g.createLinearGradient(0, wy + wh, 0, wy + wh + c4 * 0.4); sg.addColorStop(0, 'rgba(30,24,18,0.16)'); sg.addColorStop(1, 'rgba(30,24,18,0)'); g.fillStyle = sg; g.fillRect(wx + ww * 0.1, wy + wh, ww * 0.8, c4 * 0.4); }
        g.save(); shape(g, i, j); g.clip(); const tint = R(-0.06, 0.06), gr = g.createLinearGradient(wx, wy, wx + ww * 0.4, wy + wh); gr.addColorStop(0, shade(gc[0], tint)); gr.addColorStop(1, shade(gc[1], tint)); g.fillStyle = gr; g.fillRect(wx, wy, ww, wh);
        g.fillStyle = 'rgba(255,255,255,0.14)'; g.beginPath(); g.moveTo(wx + ww * 0.15, wy); g.lineTo(wx + ww * 0.45, wy); g.lineTo(wx + ww * 0.05, wy + wh); g.lineTo(wx - ww * 0.25, wy + wh); g.fill();
        if (blind[k] && st !== 'glass') { g.fillStyle = '#d9d2c3'; g.fillRect(wx, wy, ww, wh * blind[k]); g.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = wy; y < wy + wh * blind[k]; y += 3 * px) g.fillRect(wx, y, ww, px); }
        g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(wx, wy, ww, c4 * 0.04); g.fillRect(wx, wy, c4 * 0.03, wh);
        if (st === 'glass') { g.fillStyle = 'rgba(20,26,32,0.55)'; g.fillRect(wx + ww / 2 - px, wy, 2 * px, wh); }
        g.restore(); }
      if (st === 'glass') for (let j = 0; j < 4; j++) { g.fillStyle = shade(S.base, -0.04); g.fillRect(0, j * c4 + c4 * 0.84, TS, c4 * 0.16); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, j * c4 + c4 * 0.84, TS, px); } });
    const em = CT(TS, TS, g => { g.fillStyle = '#000'; g.fillRect(0, 0, TS, TS); for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const k = j * 4 + i; g.fillStyle = lit[k]; shape(g, i, j); g.fill();
      if (blind[k] && lit[k] !== '#05070a' && st !== 'glass') { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(i * c4 + fx * c4, j * c4 + fy * c4, fw * c4, fh * c4 * blind[k]); } } });
    for (const t of [map, em]) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return st === 'glass' ? new THREE.MeshPhongMaterial({ map, emissiveMap: em, emissive: 0x000000, shininess: 70, specular: 0x6a7c8c }) : new THREE.MeshLambertMaterial({ map, emissiveMap: em, emissive: 0x000000 }); }
  // wall UVs from world position, so the window grid lines up with the 3D trims (cell grid starts at each building's corner, centred)
  const worldUV = (g, along, o) => { const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, ((along ? p.getX(i) : p.getZ(i)) - o) / TU, p.getY(i) / TV); return g; };
  // goods behind the shop windows (one 256 px tile per kind)
  const goodsCache = {}, goodsTex = kind => goodsCache[kind] || (goodsCache[kind] = CT(256, 256, (g, w, hh) => {
    const pal = { shop: ['#ec3013', '#ffd23a', '#2e8bd8', '#16a34a', '#f3f2f2', '#b8407f'], arms: ['#b9c0c8', '#7a828b', '#8a5a34', '#c9a24a', '#5b6570'], food: ['#e0a040', '#7a3f1e', '#ffd23a', '#16a34a', '#ec3013'], tools: ['#ffd23a', '#2e4a6b', '#ec3013', '#7a828b', '#8a5a34'] }[kind];
    g.fillStyle = kind === 'food' ? '#efe4cf' : '#2a2724'; g.fillRect(0, 0, w, hh); const wm = g.createRadialGradient(w / 2, 20, 10, w / 2, 80, 220); wm.addColorStop(0, 'rgba(255,230,180,0.35)'); wm.addColorStop(1, 'rgba(255,230,180,0)'); g.fillStyle = wm; g.fillRect(0, 0, w, hh);
    if (kind === 'food') { g.fillStyle = '#201e1d'; g.fillRect(20, 14, w - 40, 70); for (let i = 0; i < 4; i++) { g.fillStyle = '#f3f2f2'; g.fillRect(34, 26 + i * 14, 60 + Math.random() * 80, 6); g.fillStyle = '#ffd23a'; g.fillRect(w - 70, 26 + i * 14, 30, 6); }
      g.fillStyle = '#8a5a34'; g.fillRect(0, 170, w, 86); g.fillStyle = '#6b4428'; g.fillRect(0, 170, w, 8);
      for (let i = 0; i < 5; i++) { const x = 30 + i * 48, y = 155; g.fillStyle = '#e0a040'; g.beginPath(); g.ellipse(x, y, 18, 10, 0, Math.PI, 0); g.fill(); g.fillStyle = '#7a3f1e'; g.fillRect(x - 18, y, 36, 6); g.fillStyle = '#16a34a'; g.fillRect(x - 19, y - 1, 38, 2); g.fillStyle = '#e0a040'; g.fillRect(x - 17, y + 6, 34, 5); } }
    else for (let sh = 0; sh < 3; sh++) { const y = 80 + sh * 66; g.fillStyle = '#6b6058'; g.fillRect(0, y, w, 7);
      for (let x = 8; x < w - 14;) { const iw = kind === 'arms' ? 10 + Math.random() * 8 : 14 + Math.random() * 22, ih = kind === 'arms' ? 40 + Math.random() * 18 : 18 + Math.random() * 34; g.fillStyle = pal[Math.random() * pal.length | 0];
        if (kind === 'arms' && Math.random() < 0.4) { g.beginPath(); g.arc(x + 14, y - 20, 16, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.arc(x + 14, y - 20, 7, 0, 7); g.fill(); x += 34; continue; }
        if (kind === 'shop' && Math.random() < 0.35) { g.fillRect(x, y - ih, 10, ih); g.fillRect(x + 3, y - ih - 8, 4, 8); x += 16; continue; }
        g.fillRect(x, y - ih, iw, ih); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x, y - ih, iw, 3); x += iw + 3 + Math.random() * 4; } }
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.moveTo(40, 0); g.lineTo(110, 0); g.lineTo(30, hh); g.lineTo(-40, hh); g.fill(); }));
  const signTex = (txt, bg, fg) => CT(512, 112, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = bg === '#ec3013' ? '#201e1d' : '#ec3013'; g.fillRect(0, 0, 16, h); g.fillStyle = fg; g.font = '900 60px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 36, h / 2 + 3, w - 56); });
  const hireTex = CT(256, 96, (g, w, h) => { g.fillStyle = '#16a34a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = '900 38px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('NOW', 18, 30); g.fillText('HIRING', 18, 70); g.fillStyle = '#ffd23a'; g.fillRect(w - 50, 22, 30, 52); g.fillStyle = '#16a34a'; g.beginPath(); g.moveTo(w - 42, 32); g.lineTo(w - 26, 48); g.lineTo(w - 42, 64); g.fill(); });
  const hireMat = new THREE.MeshBasicMaterial({ map: hireTex }); signMats.push(hireMat);
  const part = () => ({ meshes: [], mats: [], a: 1 });
  const glassMat = new THREE.MeshPhongMaterial({ color: 0xa9cbe0, transparent: true, opacity: 0.22, shininess: 90, specular: 0xffffff, side: THREE.DoubleSide, depthWrite: false });
  const addPart = (p, mesh) => { p.meshes.push(mesh); const ms = Array.isArray(mesh.material) ? mesh.material : [mesh.material]; for (const m of ms) if (!p.mats.includes(m)) p.mats.push(m); if (!touch && !(mesh.material instanceof THREE.MeshBasicMaterial)) mesh.castShadow = mesh.receiveShadow = true; root.add(mesh); };

  // ---------- the buildings ----------
  // art pass: MURALS + GRAFFITI on the solid walls (no see-through windows). One 1024 atlas: 4 murals (1024 x 192 rows) + 4 tags (512 x 128); alphaTest, no blending
  const artTex = CT(1024, 1024, (g) => {
    const row = (r, fn) => { g.save(); g.translate(0, r * 192); g.beginPath(); g.rect(0, 0, 1024, 192); g.clip(); fn(); g.restore(); };
    row(0, () => { const q = g.createLinearGradient(0, 0, 0, 140); q.addColorStop(0, '#ffd23a'); q.addColorStop(1, '#ec3013'); g.fillStyle = q; g.fillRect(0, 0, 1024, 192); g.fillStyle = '#fff1c8'; g.beginPath(); g.arc(700, 118, 70, 0, 7); g.fill();
      let x = 250; for (let i = 0; x < 1024; i++) { const tw = 34 + (i * 37) % 40, th = 50 + (i * 53) % 80; g.fillStyle = '#201e1d'; g.fillRect(x, 140 - th, tw, th); g.fillStyle = '#ffd23a'; for (let yy = 140 - th + 8; yy < 132; yy += 12) for (let xx = x + 6; xx < x + tw - 6; xx += 10) if ((xx * 7 + yy * 3) % 5 < 2) g.fillRect(xx, yy, 4, 5); x += tw + 6; }
      g.fillStyle = '#2e4a6b'; g.fillRect(0, 140, 1024, 52); g.strokeStyle = '#f3f2f2'; g.lineWidth = 3; for (let yy = 152; yy < 192; yy += 12) { g.beginPath(); for (let xx = 0; xx <= 1024; xx += 16) g.lineTo(xx, yy + Math.sin(xx * 0.05 + yy) * 3); g.stroke(); }
      g.fillStyle = '#f3f2f2'; g.font = 'italic 900 118px Archivo, sans-serif'; g.textBaseline = 'alphabetic'; g.fillText('MERU', 22, 128); });
    row(1, () => { g.fillStyle = '#1b2350'; g.fillRect(0, 0, 1024, 192); g.fillStyle = '#a8323e'; g.fillRect(0, 0, 1024, 26); g.fillRect(0, 166, 1024, 26); g.fillStyle = '#e6b45a'; g.fillRect(0, 26, 1024, 5); g.fillRect(0, 161, 1024, 5);
      g.textAlign = 'center'; g.textBaseline = 'middle'; for (let i = 0; i < 6; i++) { const x = 90 + i * 170; g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(x, 96, 52, 0, 7); g.fill(); g.fillStyle = '#151b3d'; g.beginPath(); g.arc(x, 96, 42, 0, 7); g.fill();
        g.fillStyle = '#ffffff'; g.font = '900 58px Archivo, sans-serif'; g.fillText('M', x, 99); }
      g.textAlign = 'left'; g.textBaseline = 'alphabetic'; });
    row(2, () => { g.fillStyle = '#3f9a5e'; g.fillRect(0, 0, 1024, 192); g.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 60; i++) g.fillRect((i * 173) % 1024, (i * 71) % 192, 4, 4);
      for (let i = 0; i < 4; i++) { const x = 60 + i * 260, s = i % 2 ? 0.8 : 1; g.save(); g.translate(x + 90, 100); g.scale(s, s);
        g.fillStyle = '#e9772c'; g.beginPath(); g.moveTo(-80, -70); g.lineTo(-40, -20); g.lineTo(40, -20); g.lineTo(80, -70); g.lineTo(70, 10); g.lineTo(0, 80); g.lineTo(-70, 10); g.closePath(); g.fill();
        g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(-74, -60); g.lineTo(-50, -26); g.lineTo(-66, -14); g.fill(); g.beginPath(); g.moveTo(74, -60); g.lineTo(50, -26); g.lineTo(66, -14); g.fill();
        g.fillStyle = '#f3f2f2'; g.beginPath(); g.moveTo(-70, 10); g.lineTo(0, 80); g.lineTo(-10, 20); g.closePath(); g.fill(); g.beginPath(); g.moveTo(70, 10); g.lineTo(0, 80); g.lineTo(10, 20); g.closePath(); g.fill();
        g.fillStyle = '#201e1d'; g.fillRect(-30, -4, 14, 14); g.fillRect(16, -4, 14, 14); g.beginPath(); g.arc(0, 66, 9, 0, 7); g.fill(); g.restore(); } });
    row(3, () => { g.fillStyle = '#9fd6ff'; g.fillRect(0, 0, 1024, 192); g.fillStyle = '#2e86b8'; g.fillRect(0, 120, 1024, 72); g.strokeStyle = '#d6f1ff'; g.lineWidth = 3; for (let x = 0; x < 1024; x += 40) { g.beginPath(); g.moveTo(x, 140 + (x % 80 ? 12 : 30)); g.lineTo(x + 24, 140 + (x % 80 ? 12 : 30)); g.stroke(); }
      g.fillStyle = '#ead9a6'; g.beginPath(); g.ellipse(640, 124, 170, 26, 0, Math.PI, 0); g.fill(); g.fillStyle = '#3f9a5e'; g.beginPath(); g.ellipse(640, 112, 110, 42, 0, Math.PI, 0); g.fill();
      g.strokeStyle = '#7a5c38'; g.lineWidth = 8; g.beginPath(); g.moveTo(690, 100); g.quadraticCurveTo(700, 60, 720, 34); g.stroke(); g.fillStyle = '#2f7a43'; for (let a = 0; a < 6; a++) { g.save(); g.translate(720, 34); g.rotate(a * 1.05); g.beginPath(); g.ellipse(26, 0, 30, 7, 0, 0, 7); g.fill(); g.restore(); }
      g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(880, 70, 44, 0, 7); g.fill(); g.fillStyle = '#dfe6ec'; g.beginPath(); g.arc(894, 84, 30, 0, 7); g.fill();
      g.fillStyle = '#ec3013'; g.beginPath(); g.moveTo(300, 150); g.lineTo(430, 150); g.lineTo(410, 168); g.lineTo(310, 168); g.closePath(); g.fill(); g.fillStyle = '#f3f2f2'; g.fillRect(350, 136, 34, 14);
      g.fillStyle = '#201e1d'; g.font = '900 54px Archivo, sans-serif'; g.fillText('PEARL ISLAND', 24, 72); });
    const TAGS = [['MERU', '#ec3013', '#ffd23a'], ['MERU', '#1b2350', '#e6b45a'], ['SKATE', '#c084fc', '#7cff9b'], ['ARENA', '#ffd23a', '#e9772c']];
    TAGS.forEach(([t, a, b2], i) => { const x0 = (i % 2) * 512, y0 = 768 + (i / 2 | 0) * 128; g.save(); g.beginPath(); g.rect(x0, y0, 512, 128); g.clip(); g.translate(x0 + 256, y0 + 66); g.rotate(-0.06);
      g.font = 'italic 900 84px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; const tw = Math.min(440, g.measureText(t).width); g.scale(Math.min(1, 440 / g.measureText(t).width), 1);
      const q = g.createLinearGradient(0, -34, 0, 34); q.addColorStop(0, b2); q.addColorStop(0.55, a); q.addColorStop(1, a);
      g.fillStyle = a; for (let k = 0; k < 7; k++) { const dx = -tw / 2 + 20 + ((k * 97) % Math.max(1, tw - 40)); g.fillRect(dx, 20, 5, 18 + (k * 13) % 22); g.beginPath(); g.arc(dx + 2.5, 38 + (k * 13) % 22, 4, 0, 7); g.fill(); }
      g.strokeStyle = '#201e1d'; g.lineWidth = 16; g.strokeText(t, 0, 0); g.strokeStyle = '#f3f2f2'; g.lineWidth = 6; g.strokeText(t, 0, 0); g.fillStyle = q; g.fillText(t, 0, 0);
      g.fillStyle = '#ffffff'; for (let k = 0; k < 5; k++) g.fillRect(-tw / 2 + 30 + k * tw / 5, -26, 10, 4); g.restore(); }); });
  const artMat = new THREE.MeshLambertMaterial({ map: artTex, alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }); let artN = { mural: 0, tag: 0 };
  for (const b of L.BUILDINGS) { if (!keys.has(b.key)) continue; const S = STY[b.key], [x0, x1, z0, z1] = b.f, w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, h = S.h, h1 = h > 9 ? 7 : h;
    const fac = facade(S), bd = { b, x0, x1, z0, z1, h, cut: { N: part(), S: part(), W: part(), E: part(), top: part() } }; blds.push(bd);
    // step 10: 3D window trims, glass fins, balconies, shop windows (instanced after the loop; tracked per cutaway part + distance)
    const offX = (w % 3) / 2, offZ = (d % 3) / 2, trimC = S.trim || TRIM[S.s], goodsCells = [], RY = { N: Math.PI, S: 0, W: -Math.PI / 2, E: Math.PI / 2 };
    const onWall = (side, a, y, out) => side === 'N' ? [a, y, z0 - out] : side === 'S' ? [a, y, z1 + out] : side === 'W' ? [x0 - out, y, a] : [x1 + out, y, a];
    const put = (t, side, pk, p, sy = 1, c) => { M4.compose(V(...p), Q.setFromEuler(E.set(0, RY[side], 0)), V(1, sy, 1)); inst.push({ t, bd, pk, m: M4.clone(), c, on: true }); };
    const detail = (side, along, a0, a1, gaps) => { const st = S.s, [, fy, , fh] = WIN[st], o = along ? x0 + offX : z0 + offZ, nC = Math.floor((a1 - o) / 3 + 1e-6), nearDoor = a => gaps.some(u => Math.abs(u - a) < GAP + 1.4);
      if (st === 'glass') { for (let i = 0; i <= nC; i++) { const a = o + 3 * i; if (a < a0 + 0.2 || a > a1 - 0.2) continue; const lo = gaps.some(u => Math.abs(u - a) < GAP + 0.2) ? DH + 0.5 : 0; put('fin', side, side, onWall(side, a, lo, 0), h1 - lo, S.finC); if (h > h1) put('fin', side, 'top', onWall(side, a, h1, 0), h - h1, S.finC); }
        if (S.balc) for (let i = 1; i < nC; i += 3) for (let k = 2; 3.5 * k + 1.3 < h - 0.5; k++) put('bal', side, 'top', onWall(side, o + 3 * i + 1.5, 3.5 * k, 0)); return; }
      for (let i = 0; i < nC; i++) { const a = o + 3 * i + 1.5, dn = nearDoor(a);
        for (let k = 0; 3.5 * k + 3.5 * (1 - fy) + 0.35 < h; k++) { const yc = 3.5 * k + 3.5 * (1 - fy - fh / 2), pk = yc < h1 ? side : 'top'; if (k <= 1 && dn) continue; if (bd.art === 'mural' && side === bd.artSide && yc < h1) continue;
          if (k === 0 && S.goods && side === b.face && side === noWin) { put('shop', side, side, onWall(side, a, 0, 0), 1, '#201e1d'); goodsCells.push([side, a]); continue; }
          put(st, side, pk, onWall(side, a, yc, 0), 1, trimC);
          if (k >= 1 && (st === 'brick' || st === 'stone')) { const hk = ((Math.round(a * 7) + k * 13 + blds.length * 5) % 10 + 10) % 10, sy = 3.5 * k + 3.5 * (1 - fy - fh);   /* exterior polish: window boxes + shutters (alternate rhythm per building) */
            if (hk < 6) put('wbox', side, pk, onWall(side, a, sy, 0), 1, ['#ec3013', '#f472b6', '#facc15', '#c084fc', '#f3f2f2', '#fb923c'][hk]);
            if (st === 'brick' && (blds.length % 3) !== 1) put('shut', side, pk, onWall(side, a, yc, 0), 1, ['#2e4a6b', '#3f7a52', '#7a2a3a'][blds.length % 3]); } } } };
    bd.sv = (sd, x, z) => sd === 'N' ? z - z0 : sd === 'S' ? z1 - z : sd === 'W' ? x - x0 : x1 - x;
    const dl = [[b.door, b.face], ...(b.door2 ? [[b.door2, b.face2]] : [])];
    // step 10b: REAL see-through windows on the ground storey (0..h1) of 3 sides; the wall opposite the front door stays solid (counter wall)
    const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' }, noWin = dl.some(([, f]) => f === OPP[b.face]) ? null : OPP[b.face];
    bd.artSide = noWin; bd.art = !noWin || S.s === 'glass' ? null : ['mural', 'tag', null, 'tag', 'mural', 'tag'][blds.length % 6];
    const artWall = (side, a0, a1) => { const len = a1 - a0, list = [], cell = (pg, u0, u1, v0, v1) => { const uv = pg.attributes.uv; for (let q = 0; q < uv.count; q++) uv.setXY(q, u0 + uv.getX(q) * (u1 - u0), 1 - (v1 - uv.getY(q) * (v1 - v0))); return pg; };
      if (bd.art === 'mural' && len >= 8) { const H = h1 - 1.3, L = Math.min(len - 2, H * 5.33, 30), s = (L / H) / 5.333, k = artN.mural++ % 4, u0 = ((blds.length * 0.37) % 1) * (1 - s);
        list.push(piece(cell(new THREE.PlaneGeometry(L, H), u0, u0 + s, k * 192 / 1024, (k + 1) * 192 / 1024), ...onWall(side, (a0 + a1) / 2, 0.8 + H / 2, 0.06), RY[side])); }
      else { const n = len > 14 ? 2 : 1, tw = Math.min(4.2, len - 1); for (let i = 0; i < n; i++) { const k = artN.tag++ % 4, cu = (k % 2) * 0.5, cv = 0.75 + (k / 2 | 0) * 0.125, a = a0 + len * (n === 1 ? 0.5 : i ? 0.72 : 0.28);
        list.push(piece(cell(new THREE.PlaneGeometry(tw, tw / 4), cu, cu + 0.5, cv, cv + 0.125), ...onWall(side, a, 1.0 + (i % 2) * 0.35 + tw / 8, 0.06), RY[side])); } }
      if (list.length) { const m = new THREE.Mesh(merge(list), artMat); root.add(m); bd.cut[side].meshes.push(m); } };
    const segW = (side, along, s0, s1, out, gl, gaps) => { if (s1 - s0 < 0.05) return; const st = S.s, [fx, fy, fw, fh] = WIN[st], o = along ? x0 + offX : z0 + offZ, holes = [];
      colliders.push({ f: side === 'N' ? [s0, s1, z0, z0 + T] : side === 'S' ? [s0, s1, z1 - T, z1] : side === 'W' ? [x0, x0 + T, s0, s1] : [x1 - T, x1, s0, s1] });
      for (let i = Math.floor((s0 - o) / 3) - 1; o + 3 * i < s1; i++) { const a = o + 3 * i, hs = a + fx * 3, he = a + (fx + fw) * 3; if (hs < s0 + 0.12 || he > s1 - 0.12) continue; if (st !== 'glass' && gaps.some(u => Math.abs(u - a - 1.5) < GAP + 1.4)) continue;
        for (let k = 0; ; k++) { const yl = 3.5 * k + 3.5 * (1 - fy - fh), yh = 3.5 * k + 3.5 * (1 - fy) - (st === 'stone' ? fw * 1.5 : 0); if (yh > h1 - 0.15 || (st !== 'glass' && 3.5 * k + 3.5 * (1 - fy) + 0.35 >= h)) break; holes.push([hs, he, yl, yh]); } }
      const ys = [...new Set([0, h1, ...holes.flatMap(q => [q[2], q[3]])])].sort((p, q) => p - q);
      for (let j = 0; j < ys.length - 1; j++) { const ya = ys[j], yb = ys[j + 1], act = holes.filter(q => q[2] <= ya + 1e-6 && q[3] >= yb - 1e-6).sort((p, q) => p[0] - q[0]); let c = s0; for (const q of act) { seg(side, c, q[0], ya, yb, out, false); c = q[1]; } seg(side, c, s1, ya, yb, out, false); }
      for (const [hs, he, yl, yh] of holes) { const a = (hs + he) / 2, y = (yl + yh) / 2, pg = new THREE.PlaneGeometry(he - hs, yh - yl);
        gl.push(side === 'N' ? piece(pg, a, y, z0 + T / 2) : side === 'S' ? piece(pg, a, y, z1 - T / 2) : side === 'W' ? piece(pg, x0 + T / 2, y, a, Math.PI / 2) : piece(pg, x1 - T / 2, y, a, Math.PI / 2)); } };
    const seg = (side, s0, s1, y0, y1, out, collide) => { const along = side === 'N' || side === 'S', len = s1 - s0; if (len < 0.05 || y1 - y0 < 0.05) return; const a = (s0 + s1) / 2, g = Box(len, y1 - y0, T), yc = (y0 + y1) / 2;
      out.push(worldUV(side === 'N' ? piece(g, a, yc, z0 + T / 2) : side === 'S' ? piece(g, a, yc, z1 - T / 2) : side === 'W' ? piece(g, x0 + T / 2, yc, a, Math.PI / 2) : piece(g, x1 - T / 2, yc, a, Math.PI / 2), along, along ? x0 + offX : z0 + offZ));
      if (collide) colliders.push({ f: side === 'N' ? [s0, s1, z0, z0 + T] : side === 'S' ? [s0, s1, z1 - T, z1] : side === 'W' ? [x0, x0 + T, s0, s1] : [x1 - T, x1, s0, s1] }); };
    for (const side of SIDES) { const along = side === 'N' || side === 'S', a0 = along ? x0 : z0, a1 = along ? x1 : z1, out = [];
      const gaps = dl.filter(([, f]) => f === side).map(([p]) => along ? p[0] : p[1]).sort((p, q) => p - q), w1 = along ? a1 : a1 - T; let a = along ? a0 : a0 + T;   /* flicker pass: E/W walls stop inside the N/S walls, no doubled corner faces */
      const gl = [], wall = (p, q) => side === noWin ? seg(side, p, q, 0, h1, out, true) : segW(side, along, p, q, out, gl, gaps);
      for (const u of gaps) { wall(a, u - GAP); seg(side, u - GAP, u + GAP, DH + 0.45, h1, out, false); a = u + GAP; } wall(a, w1);
      const m = fac.clone(); facMats.push(m); addPart(bd.cut[side], new THREE.Mesh(merge(out), m));
      if (gl.length) { const gm = new THREE.Mesh(merge(gl), glassMat); gm.renderOrder = 2; root.add(gm); bd.cut[side].meshes.push(gm); } detail(side, along, a0, a1, gaps); if (side === noWin && bd.art) artWall(side, a0, a1);
      if (S.s === 'stone' || S.s === 'brick') { let s0 = a0; for (const u of [...gaps, null]) { const e = u === null ? a1 : u - GAP; if (e - s0 > 0.3) D(S.s === 'stone' ? '#9c907c' : '#6e5a4e', along ? Box(e - s0, 0.6, 0.14) : Box(0.14, 0.6, e - s0), ...onWall(side, (s0 + e) / 2, 0.3, 0.07)); if (u !== null) s0 = u + GAP; } } }
    if (goodsCells.length) { const gm = new THREE.MeshBasicMaterial({ map: goodsTex(S.goods), color: 0xa0a0a0 }); goodsMats.push(gm); addPart(bd.cut[b.face], new THREE.Mesh(merge(goodsCells.map(([sd, a]) => piece(new THREE.PlaneGeometry(2.5, 2.45), ...onWall(sd, a, 1.725, 0.05), RY[sd]))), gm)); }
    // the top: upper storeys + roof (all fade together when you are inside)
    if (h > h1) { const out = []; for (const side of SIDES) { const along = side === 'N' || side === 'S'; seg(side, along ? x0 : z0, along ? x1 : z1, h1, h, out, false); } const m = fac.clone(); facMats.push(m); addPart(bd.cut.top, new THREE.Mesh(merge(out), m)); }
    { const rp = [], C = (geo, x, y, z, col, ry = 0, rx = 0) => rp.push(piece(geo, x, y, z, ry, rx, col));
      if (S.canopy) C(Box(w + 6, 0.8, d + 6), cx, h + 0.4, cz, '#ec3013'); else C(Box(w - 0.2, 0.4, d - 0.2), cx, h + 0.2, cz, S.roofC || '#4a4745');
      if (!S.roof && !S.dome && !S.canopy) { const pc = S.s === 'glass' ? '#c9ced3' : S.base, ph = S.crown ? 2.2 : 0.9; C(Box(w, ph, 0.3), cx, h + ph / 2, z0 + 0.15, pc); C(Box(w, ph, 0.3), cx, h + ph / 2, z1 - 0.15, pc); C(Box(0.3, ph, d), x0 + 0.15, h + ph / 2, cz, pc); C(Box(0.3, ph, d), x1 - 0.15, h + ph / 2, cz, pc);
        const cp = '#d9d6d0', yy = h + ph + 0.06; C(Box(w + 0.1, 0.12, 0.42), cx, yy, z0 + 0.15, cp); C(Box(w + 0.1, 0.12, 0.42), cx, yy, z1 - 0.15, cp); C(Box(0.42, 0.12, d), x0 + 0.15, yy, cz, cp); C(Box(0.42, 0.12, d), x1 - 0.15, yy, cz, cp); }
      const flat = !S.roof && !S.dome && !S.canopy, glassy = S.s === 'glass', tc0 = glassy ? '#b8bec4' : trimC;
      const ringC = (y, hh, out, col) => { C(Box(w + 2 * out, hh, out), cx, y, z0 - out / 2, col); C(Box(w + 2 * out, hh, out), cx, y, z1 + out / 2, col); C(Box(out, hh, d), x0 - out / 2, y, cz, col); C(Box(out, hh, d), x1 + out / 2, y, cz, col); };
      if (!S.canopy) { ringC(h - 0.22, 0.45, glassy ? 0.14 : 0.32, tc0); if (h > h1) ringC(h1, glassy ? 0.2 : 0.26, glassy ? 0.1 : 0.2, tc0); }
      if (!glassy && !S.canopy) { const fy0 = WIN[S.s][1]; let kl = 0; while (3.5 * (kl + 1) + 3.5 * (1 - fy0) + 0.35 < h) kl++; const yA = 3.5 * kl + 3.5; if (h - yA > 0.3) ringC((yA + h) / 2, h - yA, 0.06, shade(S.base, -0.02)); }
      if (S.crown) { C(Cyl(0.12, 0.12, 9, 6), cx, h + 8.9, cz, '#c9ced3'); C(Cyl(0.08, 0.08, 4, 6), cx + 3, h + 6.4, cz - 2, '#c9ced3'); }
      if (S.roof === 'hip') { const g = new THREE.ConeGeometry(1, 4.5, 4); g.rotateY(Math.PI / 4); g.scale((w / 2 + 0.6) / 0.7071, 1, (d / 2 + 0.6) / 0.7071); C(g, cx, h + 0.4 + 2.25, cz, S.roofC);
        for (const [fx2, fz2] of [[0.28, 0.3], [0.72, 0.65]]) { C(Box(1.3, 3.2, 1.3), x0 + w * fx2, h + 3.2, z0 + d * fz2, shade(S.base, -0.12)); C(Box(1.55, 0.25, 1.55), x0 + w * fx2, h + 4.9, z0 + d * fz2, '#6e655a'); } }
      if (S.dome) { C(new THREE.SphereGeometry(Math.min(w, d) * 0.38, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), cx, h + 0.4, cz, S.dome); C(Cyl(0.08, 0.2, 1.6, 6), cx, h + 0.4 + Math.min(w, d) * 0.38 + 0.7, cz, '#ffc64a'); }
      if (S.pin) { const pr = [[0, 0], [0.9, 0.3], [1.25, 2], [0.85, 3.6], [0.58, 4.4], [0.9, 5.6], [0.62, 6.6], [0.001, 6.95]].map(([r, y]) => new THREE.Vector2(r, y)); C(new THREE.LatheGeometry(pr, 16), x0 + 7, h + 0.4, cz, '#f3f2f2'); C(Cyl(0.63, 0.66, 0.4, 16), x0 + 7, h + 0.4 + 4.55, cz, '#ec3013'); }
      if (S.bar) C(Box(5, 0.5, 1.2), cx, h + 0.65, z1 - 3, '#201e1d');
      if (flat) { const yR = h + 0.4, spots = S.pin ? [[x0 + 7, cz, 2]] : S.bar ? [[cx, z1 - 3, 3]] : [], cr = S.crown ? Math.max(w, d) * 0.3 : 0;
        const spot = r => { for (let t = 0; t < 30; t++) { const x = x0 + 2 + r + Math.random() * (w - 4 - 2 * r), z = z0 + 2 + r + Math.random() * (d - 4 - 2 * r); if (!spots.some(([a, b2, q]) => Math.hypot(a - x, b2 - z) < r + q) && Math.hypot(x - cx, z - cz) >= cr) { spots.push([x, z, r]); return [x, z]; } } return null; };
        for (let i = 0, n = Math.min(6, Math.max(1, Math.round(w * d / 220))); i < n; i++) { const q = spot(1.3); if (!q) continue; const r = Math.random() < 0.5 ? 0 : Math.PI / 2; C(Box(1.9, 1.1, 1.3), q[0], yR + 0.55, q[1], '#aeb3b8', r); C(Box(1.95, 0.08, 1.35), q[0], yR + 1.12, q[1], '#8e9399', r); C(Cyl(0.48, 0.48, 0.06, 12), q[0], yR + 1.18, q[1], '#2f3338'); }
        for (let i = 0; i < 3; i++) { const q = spot(0.5); if (!q) continue; C(Cyl(0.16, 0.16, 1.2, 8), q[0], yR + 0.6, q[1], '#8d9298'); C(Cyl(0.32, 0.26, 0.2, 8), q[0], yR + 1.25, q[1], '#6f747a'); }
        if (h >= 12 && !S.crown) { const q = spot(1.8); if (q) { for (const [lx, lz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) C(Box(0.14, 1.6, 0.14), q[0] + lx, yR + 0.8, q[1] + lz, '#3b3f44'); C(Cyl(1.25, 1.25, 2.2, 14), q[0], yR + 2.7, q[1], '#8a6b4c'); C(new THREE.ConeGeometry(1.35, 0.7, 14), q[0], yR + 4.15, q[1], '#5b4634'); } }
        if (S.crown) { const pw = w * 0.42, pd = d * 0.42; C(Box(pw, 4, pd), cx, yR + 2, cz, '#8b9096'); C(Box(pw + 0.4, 0.3, pd + 0.4), cx, yR + 4.15, cz, '#c9ced3'); for (let i = 0; i < 4; i++) C(Box(0.5, 1.6, 0.5), cx - pw / 2 + 1 + i * (pw - 2) / 3, yR + 5, cz - pd / 2 + 1, '#6f747a'); } }
      addPart(bd.cut.top, new THREE.Mesh(merge(rp), new THREE.MeshLambertMaterial({ vertexColors: true }))); }
    if (S.neon) { const np = [], y = h - 0.35; np.push(piece(Box(w + 0.3, 0.28, 0.14), cx, y, z0 - 0.11), piece(Box(w + 0.3, 0.28, 0.14), cx, y, z1 + 0.11), piece(Box(0.14, 0.28, d + 0.3), x0 - 0.11, y, cz), piece(Box(0.14, 0.28, d + 0.3), x1 + 0.11, y, cz));   /* flicker pass: neon stands 4 cm proud of the facade trims */
      for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) np.push(piece(Box(0.24, h - 1, 0.24), px + (px === x0 ? -0.12 : 0.12), h / 2, pz + (pz === z0 ? -0.12 : 0.12)));
      const m = MAT[S.neon].clone(); neonMats.push([m, ...NEON[S.neon]]); addPart(bd.cut.top, new THREE.Mesh(merge(np), m)); }
    if (S.bar) { for (const [k, c, off] of [['r', 0xff2a2a, -1.2], ['b', 0x2a6bff, 1.2]]) { const m = new THREE.MeshBasicMaterial({ color: c }), me = new THREE.Mesh(Box(1.6, 0.5, 0.9), m); me.position.set(cx + off, h + 1.15, z1 - 3); addPart(bd.cut.top, me); blink.push([m, c, k]); } }
    // step 9: shop-window light spills onto the pavement round the ground floor at night
    for (let u = x0 + 2.5; u < x1 - 1; u += 5) for (const zz of [z0 - 2, z1 + 2]) pools.push([u, 0, zz, 6]);
    for (let u = z0 + 2.5; u < z1 - 1; u += 5) for (const xx of [x0 - 2, x1 + 2]) pools.push([xx, 0, u, 6]);
    // interior floor (the room itself is step 3)
    { const fl = b.room ? b.room.floor : 'stone'; D({ wood: '#b08b5e', rug: '#8f6aa8', stone: '#d8d2c8', grit: '#c9b48a' }[fl] || '#d8d2c8', new THREE.PlaneGeometry(w - 0.8, d - 0.8), cx, 0.04, cz, 0, -Math.PI / 2); }
    // doors: gold light-up frame, two sliding glass leaves (pocket into the wall), sign, mat, light pool; NOW HIRING sign by the first door
    const smat = new THREE.MeshBasicMaterial({ map: signTex(b.label.toUpperCase(), (S.sign || ['#201e1d'])[0], (S.sign || [0, '#ffffff'])[1]), color: 0xe8e8e8 }); signMats.push(smat);
    dl.forEach(([p, face], di) => { const F = FACE[face], ry = Math.atan2(F[0], F[1]), cs = Math.cos(ry), sn = Math.sin(ry), dx = p[0], dz = p[1];
      const W = (lx, ly, lz) => [dx + lx * cs + lz * sn, ly, dz - lx * sn + lz * cs], inv = (wx, wz) => (wx - dx) * cs - (wz - dz) * sn;
      const ends = face === 'N' || face === 'S' ? [inv(x0, dz), inv(x1, dz)] : [inv(dx, z0), inv(dx, z1)], lo = Math.min(...ends), hi = Math.max(...ends);
      for (const sx of [-1, 1]) D('gold', Box(0.45, DH + 0.45, 0.4), ...W(sx * (DW / 2 + 0.22), (DH + 0.45) / 2, 0.2), ry); D('gold', Box(DW + 0.9, 0.45, 0.4), ...W(0, DH + 0.22, 0.2), ry);
      D('#201e1d', Box(DW + 0.9, 0.04, 2.4), ...W(0, 0.02, 1.2), ry);
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(DW + 0.9, 1.1), smat); sg.position.set(...W(0, DH + 1.1, 0.42)); sg.rotation.y = ry; root.add(sg);
      const g = new THREE.Group(); g.position.set(dx, 0, dz); g.rotation.y = ry; root.add(g);
      const leaf = sx => { const m = new THREE.Mesh(Box(DW / 2, DH, 0.06), glass); m.position.set(sx * DW / 4, DH / 2, -T / 2); g.add(m); return m; };
      const along = face === 'N' || face === 'S', wz = face === 'N' ? [z0, z0 + T] : face === 'S' ? [z1 - T, z1] : null, wx = face === 'W' ? [x0, x0 + T] : face === 'E' ? [x1 - T, x1] : null;
      const blk = { f: along ? [dx - GAP, dx + GAP, wz[0], wz[1]] : [wx[0], wx[1], dz - GAP, dz + GAP], on: true }; colliders.push(blk);
      doors.push({ b, x: dx, z: dz, l: leaf(-1), r: leaf(1), open: 0, was: false, blk });
      pools.push([...W(0, 0, 2.6), 8]); glowP.push(W(0, DH + 0.25, 0.7));
      // step 9: neon BLADE SIGN projecting from the wall beside the first door (stacked letters, both faces, lit at night)
      if (di === 0) { const bx = -(DW / 2 + 2.6) > lo + 0.8 ? -(DW / 2 + 2.6) : !b.hiring && DW / 2 + 2.6 < hi - 0.8 ? DW / 2 + 2.6 : null;
        if (bx !== null && h >= 6) { const words = b.label.toUpperCase().split(/\s+/).filter(t => !['THE', 'MERU', 'OF', '&'].includes(t)), word = (words[0] || b.label.toUpperCase()).slice(0, 8), n = word.length;
          const col = S.s === 'stone' ? '#ffb347' : BLADE[nBlade++ % BLADE.length], top = Math.min(h - 0.6, 11), bh = Math.min(top - (S.awn ? 4.9 : 3.2), n * 0.8 + 0.5), y0 = top - bh, cell = bh / (n + 0.6), bw = 1.25;
          if (cell > 0.45) { const tex = CT(96 * bw / cell | 0, 96 * (n + 0.6) | 0, (g, w, hh) => { g.fillStyle = '#151317'; g.fillRect(0, 0, w, hh); g.strokeStyle = col; g.lineWidth = 3; g.strokeRect(5, 5, w - 10, hh - 10); g.font = '900 64px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = col; g.shadowBlur = 14; g.fillStyle = col; for (let i = 0; i < n; i++) g.fillText(word[i], w / 2, 96 * (i + 0.8)); g.shadowBlur = 0; g.fillStyle = '#ffffff'; g.globalAlpha = 0.55; g.font = '900 40px Archivo, sans-serif'; for (let i = 0; i < n; i++) g.fillText(word[i], w / 2, 96 * (i + 0.8)); });
            const bm = new THREE.MeshBasicMaterial({ map: tex, color: 0x8a8a8a }); bladeMats.push(bm);
            const ink = toon('#201e1d'), blade = new THREE.Group(); blade.position.set(...W(bx, y0 + bh / 2, 0.25 + bw / 2)); blade.rotation.y = ry;
            const back = new THREE.Mesh(Box(0.2, bh, bw), ink); blade.add(back); for (const s of [1, -1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), bm); pl.rotation.y = s * Math.PI / 2; pl.position.x = s * 0.13; blade.add(pl); }
            const arm = new THREE.Mesh(Box(0.08, 0.08, bw + 0.3), ink); arm.position.set(0, bh / 2 + 0.12, -0.1); blade.add(arm);
            root.add(blade); blade.updateMatrix(); for (const c of [...blade.children]) { c.applyMatrix4(blade.matrix); addPart(bd.cut[face], c); } root.remove(blade);   // overlap audit: bake the blade transform (the faces used to land at the world origin)
            bladeGlow.push([...W(bx, y0 + bh / 2, 0.25 + bw / 2), new THREE.Color(col)]); } } }
      if (b.hiring && di === 0) { const s = new THREE.Group(); s.position.set(DW / 2 + 2.2, 0, 1.2); g.add(s); const post = new THREE.Mesh(Box(0.15, 1.6, 0.15), matFor('#201e1d')); post.position.y = 0.8; s.add(post); const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.82), hireMat); pl.position.y = 2.0; s.add(pl); const bk = pl.clone(); bk.rotation.y = Math.PI; s.add(bk); }
      if (S.awn) for (const [s0, s1] of [[lo + 0.8, -3.3], [3.3, hi - 0.8]]) if (s1 - s0 > 2) { const ln = s1 - s0, sU = gg => { const uv = gg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * ln / 1.2); return gg; };
        D('awn:' + S.awn, sU(Box(ln, 0.08, 2)), ...W((s0 + s1) / 2, 4.4, 1), ry, 0.22); D('awn:' + S.awn, sU(Box(ln, 0.4, 0.05)), ...W((s0 + s1) / 2, 3.98, 1.98), ry); }
      if (S.cols && di === 0) { for (let lx = lo + 2.5; lx < hi - 2; lx += 5.5) { if (Math.abs(lx) < 4) continue; const q = W(lx, 3.5, 1.9); D('#e6dfcf', Cyl(0.7, 0.8, 7, 12), ...q); colliders.push({ c: [q[0], q[2], 0.8] }); }
        D('#ece6d8', Box(hi - lo - 1, 1.2, 3.8), ...W((lo + hi) / 2, 7.6, 1.7), ry);
        { const pw = hi - lo - 1, sh = new THREE.Shape(); sh.moveTo(-pw / 2, 0); sh.lineTo(pw / 2, 0); sh.lineTo(0, 2.4); sh.closePath(); const pg = new THREE.ExtrudeGeometry(sh, { depth: 3.6, bevelEnabled: false }); pg.translate(0, 0, -1.8); D('#ece6d8', pg, ...W((lo + hi) / 2, 8.2, 1.7), ry); } D('#cfc6b4', Box(hi - lo - 1, 0.25, 3.8), ...W((lo + hi) / 2, 0.125, 1.7), ry); } }); }

  // ---------- step 10: instanced facade detail (one draw per kind); hidden with the cutaway and beyond LOD metres ----------
  const trimGeo = t => { const out = [], P = (geo, x, y, z, c) => out.push(piece(geo, x, y, z, 0, 0, c));
    if (t === 'fin') return Box(0.14, 1, 0.36).translate(0, 0.5, 0.18);
    if (t === 'wbox') { P(Box(1.9, 0.3, 0.32), 0, -0.12, 0.2, '#5a3d26'); P(Box(1.94, 0.04, 0.36), 0, 0.04, 0.2, '#3d2a1c'); for (let i = 0; i < 7; i++) { const s = new THREE.IcosahedronGeometry(0.15, 0); s.scale(1, 0.8, 1); P(s, -0.78 + i * 0.26, 0.12 + (i % 2) * 0.05, 0.2 + ((i * 3) % 3 - 1) * 0.05, '#3f7a35'); } for (let i = 0; i < 6; i++) P(new THREE.IcosahedronGeometry(0.07, 0), -0.65 + i * 0.26, 0.24 + (i % 2) * 0.04, 0.28, '#ffffff'); return merge(out); }
    if (t === 'shut') { const [, , fw1, fh1] = WIN.brick, WW1 = fw1 * 3, HH1 = fh1 * 3.5; for (const sx of [-1, 1]) { P(Box(0.36, HH1 + 0.1, 0.05), sx * (WW1 / 2 + 0.26), 0, 0.12, '#ffffff'); for (let j = 0; j < 9; j++) P(Box(0.28, 0.03, 0.03), sx * (WW1 / 2 + 0.26), -HH1 / 2 + 0.15 + j * (HH1 - 0.3) / 8, 0.16, '#d9d9d9'); } return merge(out); }
    if (t === 'bal') { P(Box(2.7, 0.16, 1.3), 0, 0.08, 0.65, '#e4e1da'); P(Box(2.6, 0.9, 0.04), 0, 0.62, 1.27, '#a9c4d4'); P(Box(2.72, 0.07, 0.09), 0, 1.11, 1.28, '#2a2e33'); for (const sx of [-1, 1]) P(Box(0.06, 1.0, 1.3), sx * 1.33, 0.62, 0.65, '#2a2e33'); return merge(out); }
    if (t === 'shop') { const fw = 2.62, fh = 2.55, y = 0.45; P(Box(fw + 0.2, 0.14, 0.14), 0, y + fh + 0.07, 0.07); P(Box(0.12, fh, 0.14), -fw / 2 - 0.06, y + fh / 2, 0.07); P(Box(0.12, fh, 0.14), fw / 2 + 0.06, y + fh / 2, 0.07); P(Box(fw + 0.2, 0.5, 0.16), 0, 0.25, 0.08); P(Box(0.06, fh, 0.08), 0, y + fh / 2, 0.08); return merge(out); }
    const [, , fw0, fh0] = WIN[t], WW = fw0 * 3, HH = fh0 * 3.5;
    if (t === 'stone') { const rh = HH - WW / 2; P(Box(WW + 0.36, 0.14, 0.3), 0, -HH / 2 - 0.07, 0.15); for (const sx of [-1, 1]) P(Box(0.14, rh, 0.12), sx * (WW / 2 + 0.07), -HH / 2 + rh / 2, 0.06);
      P(new THREE.TorusGeometry(WW / 2 + 0.07, 0.07, 4, 10, Math.PI), 0, HH / 2 - WW / 2, 0.06); P(Box(0.26, 0.4, 0.16), 0, HH / 2 + 0.02, 0.08); P(Box(WW + 0.5, 0.1, 0.22), 0, HH / 2 + 0.3, 0.11); return merge(out); }
    for (const sx of [-1, 1]) P(Box(0.08, HH, 0.1), sx * (WW / 2 + 0.04), 0, 0.05); P(Box(WW + 0.16, 0.08, 0.1), 0, HH / 2 + 0.04, 0.05); P(Box(0.05, HH, 0.05), 0, 0, 0.025);
    if (t === 'brick') { P(Box(WW, 0.05, 0.05), 0, HH / 2 - 0.6, 0.025); P(Box(WW + 0.4, 0.26, 0.12), 0, HH / 2 + 0.2, 0.06); } P(Box(WW + 0.3, 0.1, 0.28), 0, -HH / 2 - 0.05, 0.14); return merge(out); };
  const Z0 = new THREE.Matrix4().makeScale(0, 0, 0), instN = {};
  for (const t of ['panel', 'brick', 'stone', 'shop', 'fin', 'bal', 'wbox', 'shut']) { const list = inst.filter(r => r.t === t); if (!list.length) continue;
    const mesh = new THREE.InstancedMesh(trimGeo(t), new THREE.MeshLambertMaterial(t === 'bal' || t === 'wbox' ? { vertexColors: true } : { color: 0xffffff }), list.length);
    if (t === 'wbox') { const col = mesh.geometry.attributes.color, P = mesh.geometry.attributes.position; mesh.material.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <color_vertex>', '#include <color_vertex>\n#ifdef USE_INSTANCING_COLOR\n if (color.r > 0.99 && color.g > 0.99 && color.b > 0.99) vColor.rgb = instanceColor.rgb; else vColor.rgb = color.rgb;\n#endif'); }; }
    list.forEach((r, i) => { mesh.setMatrixAt(i, r.m); if (t !== 'bal') mesh.setColorAt(i, IC.set(r.c || '#c3c9cf')); r.mesh = mesh; r.i = i; (r.bd.inst || (r.bd.inst = [])).push(r); });
    mesh.frustumCulled = false; if (!touch) mesh.receiveShadow = true; instN[t] = list.length; root.add(mesh); }
  const syncBd = bd => { for (const r of bd.inst || []) { const on = !bd.far && bd.cut[r.pk].a > 0.01; if (on !== r.on) { r.on = on; r.mesh.setMatrixAt(r.i, on ? r.m : Z0); r.mesh.instanceMatrix.needsUpdate = true; } } };

  // ---------- helpers for placing street things ----------
  const segD = (x, z, p) => { let m = 1e9; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)); m = Math.min(m, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return m; };
  const roadD = (x, z) => Math.min(...L.ROADS.map(r => segD(x, z, r.p) - r.w / 2)), pathD = (x, z) => Math.min(...L.PATHS.map(p => segD(x, z, p.p)));
  const inB = (x, z, m) => L.BUILDINGS.some(b => (x > b.f[0] - m && x < b.f[1] + m && z > b.f[2] - m && z < b.f[3] + m) || (b.lot && x > b.lot.r[0] - m && x < b.lot.r[1] + m && z > b.lot.r[2] - m && z < b.lot.r[3] + m));
  const inRect = (x, z) => x > RECT[0] && x < RECT[1] && z > RECT[2] && z < RECT[3];

  // ---------- fountain (Fountain Plaza centre) · art polish: lathe-turned stone, mosaic floor + coins, live water (ripple shader, particle jets, spill curtain) ----------
  const lathe = (pts, n = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n);
  D('#d9cdb4', lathe([[7.95, 0], [7.95, 0.16], [7.62, 0.24], [7.56, 0.8], [7.78, 0.86], [7.84, 1.0], [7.66, 1.08], [6.98, 1.08], [6.9, 0.98], [6.86, 0.3]]), 0, 0, 0);
  D('#e6dcc6', lathe([[1.6, 0.28], [1.6, 0.55], [1.25, 0.72], [0.92, 1.15], [1.08, 1.6], [0.82, 2.2], [0.68, 2.75], [0.95, 3.0], [1.4, 3.18], [2.5, 3.42], [3.02, 3.52], [3.12, 3.74], [3.0, 3.8], [2.86, 3.72], [2.8, 3.55], [0, 3.5]], 40), 0, 0, 0);
  D('#d9cdb4', lathe([[0.55, 3.6], [0.48, 3.95], [0.3, 4.25], [0.44, 4.5], [0.66, 4.64], [0.6, 4.8], [0.28, 4.94], [0.2, 5.12], [0, 5.16]], 20), 0, 0, 0);
  D('#9a7438', new THREE.TorusGeometry(3.08, 0.05, 6, 48), 0, 3.75, 0, 0, Math.PI / 2); D('#9a7438', new THREE.TorusGeometry(0.62, 0.05, 6, 20), 0, 4.72, 0, 0, Math.PI / 2);
  for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2, sx = Math.sin(an), sz = Math.cos(an); D('#6e5530', Cyl(0.05, 0.09, 0.26, 8), sx * 7.3, 1.2, sz * 7.3, an, -0.5); D('#6e5530', new THREE.SphereGeometry(0.13, 8, 6), sx * 7.34, 1.1, sz * 7.34); }
  const mosaic = CT(256, 256, (g, w, h) => { g.fillStyle = '#123f4c'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 6) for (let x = 0; x < w; x += 6) { const r = Math.random(); g.fillStyle = r < 0.5 ? '#1a5566' : r < 0.8 ? '#16495a' : r < 0.95 ? '#22677a' : '#2c7d8c'; g.fillRect(x + 0.5, y + 0.5, 5, 5); }
    const c = w / 2; g.strokeStyle = '#c9a24a'; g.lineWidth = 3; for (const rr of [118, 104]) { g.beginPath(); g.arc(c, c, rr, 0, 7); g.stroke(); }
    g.fillStyle = '#c9a24a'; for (let k = 0; k < 8; k++) { const an = k / 8 * Math.PI * 2; g.save(); g.translate(c + Math.cos(an) * 80, c + Math.sin(an) * 80); g.rotate(an + Math.PI / 2); g.fillRect(-9, -10, 4, 18); g.fillRect(5, -10, 4, 18); g.beginPath(); g.arc(0, -10, 9, Math.PI, 0); g.lineWidth = 4; g.strokeStyle = '#c9a24a'; g.stroke(); g.restore(); }
    g.beginPath(); for (let k = 0; k < 16; k++) { const an = k / 16 * Math.PI * 2, rr = k % 2 ? 18 : 46; g.lineTo(c + Math.cos(an) * rr, c + Math.sin(an) * rr); } g.closePath(); g.fill(); });
  const basinFloor = new THREE.Mesh(new THREE.CircleGeometry(6.9, 48), new THREE.MeshLambertMaterial({ map: mosaic })); basinFloor.rotation.x = -Math.PI / 2; basinFloor.position.y = 0.3; root.add(basinFloor);
  { const cs = []; for (let i = 0; i < (touch ? 30 : 60); i++) { const an = Math.random() * 6.283, rr = 3.7 + Math.random() * 3; cs.push(piece(Cyl(0.08, 0.08, 0.02, 8), Math.sin(an) * rr, 0.31 + Math.random() * 0.01, Math.cos(an) * rr, Math.random() * 3, (Math.random() - 0.5) * 0.3)); }
    root.add(new THREE.Mesh(merge(cs), new THREE.MeshPhongMaterial({ color: 0xd9a93a, shininess: 90, specular: 0xfff0c0 }))); }
  const fU = { uT: { value: 0 }, uNight: { value: 0 }, uScale: { value: 800 } };
  const waterMat = new THREE.ShaderMaterial({ uniforms: fU, transparent: true, depthWrite: false,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: 'uniform float uT, uNight; varying vec3 vW;' +
      'void main(){ vec2 p = vW.xz; float r = length(p); vec2 g = vec2(0.); float foam = 0.;' +
      ' if (vW.y < 2.) { float d = r - 3.42; if (d > 0.) { float k = exp(-d * 0.6); g += p / max(r, .01) * cos(d * 10. - uT * 8.) * k * 0.22; foam += smoothstep(0.35, 0., d) * 0.8; }' +
      '  for (int i = 0; i < 10; i++) { float a = float(i) * 0.6283185; vec2 q = p - vec2(sin(a), cos(a)) * 4.1; float dd = length(q) + 0.001; float k = exp(-dd * 1.4); g += q / dd * cos(dd * 16. - uT * 10. - float(i)) * k * 0.3; foam += smoothstep(0.55, 0., dd) * (0.55 + 0.45 * sin(uT * 17. + float(i) * 2.3)); }' +
      '  foam += smoothstep(6.6, 6.9, r) * 0.35; }' +
      ' else { float d = r; g += p / max(r, .01) * cos(d * 9. - uT * 7.) * 0.18 * smoothstep(0., 0.6, d); foam += smoothstep(2.2, 2.85, r) * 0.45 + smoothstep(0.7, 0.2, r) * 0.5; }' +
      ' g += 0.06 * vec2(sin(p.x * 3.1 + uT * 1.7) + sin(p.y * 2.3 - uT * 1.3), cos(p.y * 3.7 + uT * 1.9) + cos(p.x * 2.9 - uT * 1.1));' +
      ' vec3 n = normalize(vec3(-g.x, 1., -g.y)); vec3 v = normalize(cameraPosition - vW); float fr = pow(1. - max(dot(n, v), 0.), 3.);' +
      ' vec3 deep = mix(vec3(0.1, 0.42, 0.52), vec3(0.03, 0.1, 0.2), uNight); vec3 sky = mix(vec3(0.82, 0.92, 1.), vec3(0.1, 0.14, 0.28), uNight);' +
      ' float sp = pow(max(dot(n, normalize(normalize(vec3(0.4, 0.8, 0.3)) + v)), 0.), 90.) * (1. - uNight * 0.75);' +
      ' float ca = pow(0.5 + 0.5 * sin(p.x * 5. + sin(p.y * 4. + uT) * 1.5 + uT * 1.2) * sin(p.y * 5.3 + sin(p.x * 3.7 - uT) * 1.5 - uT), 3.);' +
      ' foam = clamp(foam, 0., 1.); vec3 col = deep + ca * 0.16 + fr * sky * 0.7 + sp + foam * vec3(0.85, 0.93, 0.97);' +
      ' col += uNight * vec3(0.08, 0.42, 0.58) * (0.55 + ca * 0.8) * smoothstep(7., 3., r);' +
      ' gl_FragColor = vec4(col, clamp(0.5 + fr * 0.4 + foam * 0.45 + sp, 0., 0.96)); }' });
  root.add(new THREE.Mesh(merge([piece(new THREE.CircleGeometry(6.9, 48), 0, 0.93, 0, 0, -Math.PI / 2), piece(new THREE.CircleGeometry(2.86, 32), 0, 3.66, 0, 0, -Math.PI / 2)]), waterMat));
  // spill curtain: the upper bowl overflows all round its lip in a falling sheet (streaks scroll down)
  const cPts = []; for (let k = 0; k <= 10; k++) { const t = k / 10; cPts.push([3.14 + 0.38 * t + 0.06 * Math.sqrt(t), 3.74 - 2.81 * t * t]); }
  const curtain = new THREE.Mesh(lathe(cPts, 56), new THREE.ShaderMaterial({ uniforms: fU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform float uT, uNight; varying vec2 vU; void main(){ float x = vU.x * 56.; float st = 0.5 + 0.5 * sin(x * 11. + sin(x * 1.7) * 4.); float fl = fract(vU.y * 2.5 - uT * 1.8 + sin(x * 3.1) * 0.2); float br = smoothstep(0.6, 1., fl) * 0.6;' +
      ' float a = (0.18 + 0.32 * st + br) * smoothstep(0., 0.06, vU.y) * (0.6 + 0.4 * smoothstep(1., 0.7, vU.y)); vec3 c = mix(vec3(0.82, 0.93, 1.), vec3(0.45, 0.85, 1.), uNight) + br * 0.2; gl_FragColor = vec4(c, a * 0.75); }' }));
  root.add(curtain);
  // jets as water drops on real arcs (one Points draw, motion in the vertex shader): centre plume + crown, 10 rim jets, splashes where they land
  const PN = touch ? 0.5 : 1, pO = [], pV = [], pD = [], RN = Math.random, addP = (o, v, life, s) => { pO.push(...o); pV.push(...v); pD.push(RN(), life, s, 0); };
  for (let i = 0; i < 460 * PN; i++) { const an = RN() * 6.283, core = i % 3 === 0, hr = core ? RN() * 0.18 : 0.3 + RN() * 1.0, vy = core ? 8.4 + RN() * 0.7 : 7.4 + RN() * 1.3, T = (vy + Math.sqrt(vy * vy + 19.6 * 1.47)) / 9.8; addP([Math.sin(an) * 0.08, 5.16, Math.cos(an) * 0.08], [Math.sin(an) * hr, vy, Math.cos(an) * hr], T, core ? 0.17 : 0.12); }
  for (let j = 0; j < 10; j++) { const an = j / 10 * Math.PI * 2, sx = Math.sin(an), sz = Math.cos(an);
    for (let i = 0; i < 52 * PN; i++) { const T = 1.04 + RN() * 0.1, h = (7.35 - 4.1 - (RN() - 0.5) * 0.4) / T, lat = (RN() - 0.5) * 0.12; addP([sx * 7.35, 1.3, sz * 7.35], [-sx * h + sz * lat, (0.93 - 1.3 + 4.9 * T * T) / T, -sz * h - sx * lat], T, i % 4 ? 0.09 : 0.13); }
    for (let i = 0; i < 16 * PN; i++) { const vy = 1 + RN() * 1.6, b = RN() * 6.283, h = RN() * 0.7; addP([sx * 4.1, 0.95, sz * 4.1], [Math.sin(b) * h, vy, Math.cos(b) * h], 2 * vy / 9.8, 0.07); } }
  for (let i = 0; i < 70 * PN; i++) { const an = RN() * 6.283, rr = 3.45 + RN() * 0.2, vy = 0.6 + RN() * 1, h = 0.2 + RN() * 0.5; addP([Math.sin(an) * rr, 0.95, Math.cos(an) * rr], [Math.sin(an) * h, vy, Math.cos(an) * h], 2 * vy / 9.8, 0.08); }
  for (let i = 0; i < 50 * PN; i++) { const an = RN() * 6.283, rr = 0.4 + RN() * 2, vy = 0.6 + RN() * 1.1, b = RN() * 6.283; addP([Math.sin(an) * rr, 3.68, Math.cos(an) * rr], [Math.sin(b) * 0.4, vy, Math.cos(b) * 0.4], 2 * vy / 9.8, 0.07); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pO, 3)); pg.setAttribute('aV', new THREE.Float32BufferAttribute(pV, 3)); pg.setAttribute('aD', new THREE.Float32BufferAttribute(pD, 4));
  const spray = new THREE.Points(pg, new THREE.ShaderMaterial({ uniforms: fU, transparent: true, depthWrite: false,
    vertexShader: 'uniform float uT, uScale; attribute vec3 aV; attribute vec4 aD; varying float vA; void main(){ float tt = fract(uT / aD.y + aD.x) * aD.y; float u = tt / aD.y; vec3 p = position + aV * tt + vec3(0., -4.9 * tt * tt, 0.);' +
      ' vA = smoothstep(0., 0.06, u) * (1. - smoothstep(0.8, 1., u)); vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = max(aD.z * uScale / -mv.z, 1.5); }',
    fragmentShader: 'uniform float uNight; varying float vA; void main(){ vec2 c = gl_PointCoord - 0.5; float d = dot(c, c); if (d > 0.25) discard; vec3 col = mix(vec3(0.93, 0.97, 1.), vec3(0.6, 0.92, 1.), uNight); gl_FragColor = vec4(col, vA * 0.85 * (1. - d * 3.)); }' }));
  spray.frustumCulled = false; root.add(spray);
  colliders.push({ c: [0, 0, 7.9] }); pools.push([0, 0, 0, 24]);

  // ---------- city lamps (instanced) with glow + light pools at night ----------
  const lampP = [], okLamp = (x, z) => inRect(x, z) && !avoid(x, z, 1) && !inB(x, z, 1.5) && roadD(x, z) > 1.5 && Math.hypot(x, z) > 15 && segD(x, z, [...L.TRAIN.line, L.TRAIN.line[0]]) > 6 && !lampP.some(([a, b]) => Math.hypot(a - x, b - z) < 6);
  for (const P of L.PATHS) for (let k = 0; k < P.p.length - 1; k++) { const [ax, az] = P.p[k], [bx, bz] = P.p[k + 1], len = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / len, nz = (bx - ax) / len;
    for (let t = 16, n = 0; t < len; t += 32, n++) { const x = ax + (bx - ax) * t / len, z = az + (bz - az) * t / len; for (const s of [n % 2 ? 1 : -1]) { const q = [x + nx * 5 * s, z + nz * 5 * s, Math.atan2(-nz, nx)]; if (okLamp(q[0], q[1])) lampP.push(q); } } }
  for (const q of [[-44, -39], [44, -39], [-44, 39], [44, 39]]) if (okLamp(...q)) lampP.push(q);
  const XING = [[160, 0, 'z'], [-160, 0, 'z'], [0, 150, 'x'], [0, -140, 'x']], nearX = (x, z) => XING.some(([a, b]) => Math.hypot(x - a, z - b) < 11);
  for (let x = -150; x <= 150; x += 50) for (const z of [-148, 158]) if (!nearX(x, z) && okLamp(x, z)) lampP.push([x, z, Math.PI / 2]);
  for (let z = -125; z <= 140; z += 50) for (const x of [-168, 168]) if (!nearX(x, z) && okLamp(x, z)) lampP.push([x, z, 0]);
  // step 9: twin-arm city lamp (post, base, two arms, two flat heads); the arms reach out over the path / road
  const lampG = merge([piece(Cyl(0.11, 0.16, 6.2, 6), 0, 3.1, 0), piece(Cyl(0.3, 0.36, 0.7, 8), 0, 0.35, 0), piece(Box(3, 0.12, 0.12), 0, 6.1, 0), piece(Box(0.95, 0.18, 0.5), -1.5, 6.02, 0), piece(Box(0.95, 0.18, 0.5), 1.5, 6.02, 0), piece(Cyl(0.16, 0.16, 0.3, 6), 0, 6.3, 0)]), lensMat = new THREE.MeshBasicMaterial({ color: 0xd9d6cf });
  const lampI = new THREE.InstancedMesh(lampG, matFor('#201e1d'), lampP.length), lensI = new THREE.InstancedMesh(merge([piece(Box(0.8, 0.04, 0.38), -1.5, 5.92, 0), piece(Box(0.8, 0.04, 0.38), 1.5, 5.92, 0)]), lensMat, lampP.length);
  lampP.forEach(([x, z, r = 0], i) => { M4.compose(V(x, 0, z), Q.setFromEuler(E.set(0, r, 0)), ONE); lampI.setMatrixAt(i, M4); lensI.setMatrixAt(i, M4); colliders.push({ c: [x, z, 0.3] }); const cx = Math.cos(r) * 1.5, cz = -Math.sin(r) * 1.5; pools.push([x + cx, 0, z + cz, 9], [x - cx, 0, z - cz, 9]); glowP.push([x + cx, 5.8, z + cz], [x - cx, 5.8, z - cz]); });
  root.add(lampI, lensI);
  // exterior polish: HANGING FLOWER BASKETS on every plaza + promenade lamp (chains, a coir basket, a mound of trailing flowers), 3 draws
  { const pl = lampP.filter(([x, z]) => L.surfaceAt(x, z) === 'stone'), BC = ['#ec3013', '#f472b6', '#facc15', '#c084fc', '#fb923c'];
    const chainI = new THREE.InstancedMesh(merge([-0.12, 0.12].map(o => piece(Cyl(0.012, 0.012, 0.55, 3), o, -0.28, 0))), matFor('#201e1d'), pl.length * 2);
    const basketI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.32, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).translate(0, -0.55, 0), matFor('#6b4a2c'), pl.length * 2);
    const bloomG = new THREE.IcosahedronGeometry(0.27, 0); bloomG.scale(1, 0.6, 1); bloomG.translate(0, -0.42, 0); const leafG = new THREE.IcosahedronGeometry(0.4, 0); leafG.scale(1, 0.8, 1); leafG.translate(0, -0.66, 0); const leafI = new THREE.InstancedMesh(leafG, matFor('#3f7a35'), lampP.length * 2);
    const bloomI = new THREE.InstancedMesh(bloomG, new THREE.MeshLambertMaterial({ color: 0xffffff }), pl.length * 2), cc = new THREE.Color(); let n = 0;
    pl.forEach(([x, z, r = 0]) => { for (const s of [-1, 1]) { const ax = x + Math.cos(r) * 0.85 * s, az = z - Math.sin(r) * 0.85 * s; M4.compose(V(ax, 6.04, az), Q.setFromEuler(E.set(0, r, 0)), ONE); chainI.setMatrixAt(n, M4); basketI.setMatrixAt(n, M4); bloomI.setMatrixAt(n, M4); leafI.setMatrixAt(n, M4); bloomI.setColorAt(n, cc.set(BC[(n + Math.round(x)) % BC.length])); n++; } });
    chainI.count = basketI.count = bloomI.count = leafI.count = n; root.add(chainI, basketI, leafI, bloomI); }
  const radial = (r, gc, a) => CT(64, 64, (g, w) => { const q = g.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, `rgba(${gc},${a})`); q.addColorStop(r, `rgba(${gc},${a * 0.35})`); q.addColorStop(1, `rgba(${gc},0)`); g.fillStyle = q; g.fillRect(0, 0, w, w); });
  const glowPts = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(glowP.flat(), 3)), new THREE.PointsMaterial({ map: radial(0.25, '255,226,165', 1), size: 4.5, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  const poolI = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: radial(0.5, '255,214,150', 0.55), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2 }), pools.length);
  pools.forEach(([x, y, z, s], i) => { M4.compose(V(x, 0.06, z), Q.identity(), V(s, 1, s)); poolI.setMatrixAt(i, M4); }); glowPts.visible = poolI.visible = false; root.add(glowPts, poolI);
  const bladePts = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(bladeGlow.flatMap(g => g.slice(0, 3)), 3)).setAttribute('color', new THREE.Float32BufferAttribute(bladeGlow.flatMap(g => [g[3].r * 0.5, g[3].g * 0.5, g[3].b * 0.5]), 3)), new THREE.PointsMaterial({ map: radial(0.3, '255,255,255', 1), size: 7, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); bladePts.visible = false; root.add(bladePts);

  // ---------- trees + benches (instanced) ----------
  const trees = [], okTree = (x, z) => inRect(x, z) && !avoid(x, z, 3) && L.surfaceAt(x, z) === 'grass' && !inB(x, z, 3) && roadD(x, z) > 3 && pathD(x, z) > 5 && segD(x, z, [...L.TRAIN.line, L.TRAIN.line[0]]) > 8 && !(Math.abs(x) < 14 && Math.abs(z) < 14) && !lampP.some(([a, b]) => Math.hypot(a - x, b - z) < 3) && !trees.some(([a, b]) => Math.hypot(a - x, b - z) < 10);
  for (let x = -140; x <= 140; x += 26) for (const z of [-19, 19]) if (Math.abs(x) > 50 && okTree(x, z)) trees.push([x, z]);
  for (let i = 0, N = touch ? 40 : 70; i < 5000 && trees.length < N; i++) { const x = RECT[0] + Math.random() * (RECT[1] - RECT[0]), z = RECT[2] + Math.random() * (RECT[3] - RECT[2]); if (okTree(x, z)) trees.push([x, z]); }
  const tc = new THREE.Color(); trees.forEach(([x, z]) => colliders.push({ c: [x, z, 0.4] }));   // planted in pass 3 (meru2-flora.js) below the street block
  const benchP = []; for (let x = 55; x <= 140; x += 16) for (const sx of [-1, 1]) for (const z of [-13, 13]) if (!inB(sx * x, z, 1)) if (!avoid(sx * x, z, 1)) benchP.push([sx * x, z, z < 0 ? 0 : Math.PI]);
  for (const a of [0.785, 2.356, 3.927, 5.498]) benchP.push([Math.sin(a) * 11, Math.cos(a) * 11, a + Math.PI]);
  // art polish: slatted park bench: 4 seat slats + 3 back slats on a raked back, cast-iron ends (leg, scroll arm), a centre rail
  const benchG = (() => { const p = [], W = ['#a77b4f', '#8f6640'], IR = '#24282c';
    for (let k = 0; k < 4; k++) p.push(piece(Box(2.1, 0.05, 0.12), 0, 0.47, 0.2 - k * 0.14, 0, 0, W[k % 2]));
    for (let k = 0; k < 3; k++) p.push(piece(Box(2.1, 0.11, 0.04), 0, 0.64 + k * 0.15, -0.3 - k * 0.035, 0, -0.22, W[(k + 1) % 2]));
    for (const sx of [-0.98, 0.98]) { p.push(piece(Box(0.07, 0.45, 0.07), sx, 0.22, 0.22, 0, 0, IR), piece(Box(0.07, 0.92, 0.07), sx, 0.46, -0.3, 0, -0.12, IR), piece(Box(0.07, 0.06, 0.58), sx, 0.43, -0.03, 0, 0, IR),
      piece(Box(0.07, 0.05, 0.5), sx, 0.68, -0.02, 0, 0, IR), piece(Cyl(0.04, 0.04, 0.24, 6), sx, 0.56, 0.22, 0, 0, IR), piece(new THREE.SphereGeometry(0.05, 6, 4), sx, 0.69, 0.24, 0, 0, IR), piece(Box(0.12, 0.03, 0.12), sx, 0.015, 0.22, 0, 0, IR)); }
    p.push(piece(Box(1.9, 0.05, 0.05), 0, 0.42, -0.02, 0, 0, IR), piece(Box(0.06, 0.4, 0.06), 0, 0.22, -0.05, 0, 0, IR)); return merge(p); })();
  const benchI = new THREE.InstancedMesh(benchG, new THREE.MeshToonMaterial({ gradientMap: grad, vertexColors: true }), benchP.length); benchP.forEach(([x, z, r], i) => { M4.compose(V(x, 0, z), Q.setFromEuler(E.set(0, r, 0)), ONE); benchI.setMatrixAt(i, M4); }); root.add(benchI);

  // ---------- crosswalks where the foot paths cross the ring road ----------
  for (const [x, z, dir] of XING) for (let k = 0; k < 9; k++) { const o = -5.4 + k * 1.35; if (dir === 'z') D('#f3f2f2', Box(0.7, 0.03, 4), x + o, 0.03, z); else D('#f3f2f2', Box(4, 0.03, 0.7), x, 0.03, z + o); }

  // ---------- step 10 pass 2 · STREET LEVEL: kerbs, drains, manholes, bollards, bins, planters, bike racks, bus stops, wall grime, posters ----------
  { const inst2 = (geo, list, col) => { if (!list.length) return null; const im = new THREE.InstancedMesh(geo, new THREE.MeshToonMaterial({ gradientMap: grad, vertexColors: true, ...(col ? { color: col } : {}) }), list.length);
      list.forEach(([x, z, r = 0, y = 0], i) => { M4.compose(V(x, y, z), Q.setFromEuler(E.set(0, r, 0)), ONE); im.setMatrixAt(i, M4); }); if (!touch) im.castShadow = true; im.receiveShadow = true; root.add(im); return im; };
    const ring = L.ROADS[0], RW = ring.w / 2;
    // raised KERBS both sides of the ring road (gaps at the crosswalks + the side roads), a GUTTER line + DRAINS every 24 m, MANHOLES in the lanes
    const drains = [], holes = [], sideRoad = (x, z) => L.ROADS.slice(1).some(r => segD(x, z, r.p) < r.w / 2 + 1.2);
    for (let i = 0; i < ring.p.length - 1; i++) { const [ax, az] = ring.p[i], [bx, bz] = ring.p[i + 1], len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len, nx = -uz, nz = ux, ry = Math.atan2(ux, uz);
      for (const sd of [-1, 1]) { let run = null; const flush = t1 => { if (run == null || t1 - run < 0.6) { run = null; return; } const tm = (run + t1) / 2, x = ax + ux * tm + nx * (RW + 0.18) * sd, z = az + uz * tm + nz * (RW + 0.18) * sd; D('#c9c4bb', Box(0.36, 0.16, t1 - run), x, 0.08, z, ry); D('#9a958d', Box(0.25, 0.012, t1 - run), x - nx * 0.32 * sd, 0.025, z - nz * 0.32 * sd, ry); run = null; };
        for (let t = 0; t <= len; t += 1) { const x = ax + ux * t + nx * (RW + 0.18) * sd, z = az + uz * t + nz * (RW + 0.18) * sd, gap = nearX(x, z) && Math.min(...XING.map(([a, b]) => Math.hypot(x - a, z - b))) < 3.4 || sideRoad(x, z) || inB(x, z, 0.2); if (gap) flush(t); else if (run == null) run = t; }
        flush(len);
        for (let t = 12; t < len - 6; t += 24) { const x = ax + ux * t + nx * (RW - 0.35) * sd, z = az + uz * t + nz * (RW - 0.35) * sd; if (!nearX(x, z) && !sideRoad(x, z)) drains.push([x, z, ry]); } }
      for (let t = 30; t < len - 10; t += 60) holes.push([ax + ux * t + nx * 3 * (i % 2 ? 1 : -1), az + uz * t + nz * 3 * (i % 2 ? 1 : -1), ry]); }
    inst2(merge([piece(Box(0.46, 0.04, 0.94), 0, 0.04, 0, 0, 0, '#5a5752'), piece(Box(0.42, 0.02, 0.9), 0, 0.065, 0, 0, 0, '#3a3836'), ...[-0.3, -0.15, 0, 0.15, 0.3].map(o => piece(Box(0.3, 0.025, 0.05), 0, 0.08, o, 0, 0, '#1c1b1a'))]), drains);
    inst2(merge([piece(Cyl(0.42, 0.42, 0.03, 18), 0, 0.03, 0, 0, 0, '#4a4744'), piece(new THREE.TorusGeometry(0.36, 0.035, 4, 18).rotateX(Math.PI / 2), 0, 0.04, 0, 0, 0, '#2e2c2a'), piece(Box(0.5, 0.012, 0.05), 0, 0.048, 0, 0, 0, '#2e2c2a'), piece(Box(0.05, 0.012, 0.5), 0, 0.048, 0, 0, 0, '#2e2c2a')]), holes);
    // BOLLARDS at both ends of every crosswalk (stop the cars short of the zebra in the eye), red reflective band
    const bol = []; for (const [x, z, dir] of XING) for (const sd of [-1, 1]) for (const o of [-2.6, -1.3, 1.3, 2.6]) bol.push(dir === 'z' ? [x + sd * (RW + 0.9), z + o] : [x + o, z + sd * (RW + 0.9)]);
    inst2(merge([piece(Cyl(0.11, 0.13, 0.95, 10), 0, 0.475, 0, 0, 0, '#2c3036'), piece(Cyl(0.115, 0.115, 0.1, 10), 0, 0.78, 0, 0, 0, '#ec3013'), piece(new THREE.SphereGeometry(0.11, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0, 0.95, 0, 0, 0, '#2c3036')]), bol);
    bol.forEach(([x, z]) => colliders.push({ c: [x, z, 0.15] }));
    // BINS beside every second bench and a few lamps, off the path line
    const binP = []; benchP.forEach(([x, z, r], i) => { if (i % 2) return; const bx = x + Math.cos(r) * 1.6, bz = z - Math.sin(r) * 1.6; if (!inB(bx, bz, 0.6) && !avoid(bx, bz, 0.6)) binP.push([bx, bz, r]); });
    inst2(merge([piece(Cyl(0.3, 0.26, 0.9, 12), 0, 0.45, 0, 0, 0, '#2e4a6b'), piece(Cyl(0.33, 0.33, 0.08, 12), 0, 0.94, 0, 0, 0, '#201e1d'), piece(Box(0.22, 0.12, 0.02), 0, 0.6, 0.29, 0, 0, '#f3f2f2'), piece(Cyl(0.06, 0.06, 0.08, 6), 0, 0.03, 0, 0, 0, '#201e1d')]), binP);
    binP.forEach(([x, z]) => colliders.push({ c: [x, z, 0.35] }));
    // PLANTERS: square concrete boxes with a clipped shrub, flanking the four plaza paths where they leave the square + beside every shop door
    const plP = []; for (const [a, b] of [[24, 6], [24, -6], [-24, 6], [-24, -6], [6, 24], [-6, 24], [6, -24], [-6, -24]]) if (!inB(a, b, 1) && !avoid(a, b, 1)) plP.push([a, b]);
    for (const b of L.BUILDINGS) { if (!b.door || !b.room || !inRect(b.door[0], b.door[1]) || b.open) continue; const [fx, fz] = FACE[b.face] || [0, 1], tx = -fz, tz = fx; for (const sd of [-1, 1]) { const x = b.door[0] + fx * 1.3 + tx * 3.6 * sd, z = b.door[1] + fz * 1.3 + tz * 3.6 * sd; if (!inB(x, z, 0.4) && roadD(x, z) > 1 && !avoid(x, z, 0.8) && !plP.some(([p, q]) => Math.hypot(p - x, q - z) < 2)) plP.push([x, z]); } }
    inst2(merge([piece(Box(1.1, 0.6, 1.1), 0, 0.3, 0, 0, 0, '#bdb7ad'), piece(Box(1.18, 0.08, 1.18), 0, 0.62, 0, 0, 0, '#d8d3ca'), piece(Box(0.96, 0.04, 0.96), 0, 0.64, 0, 0, 0, '#4a3b2c'), piece(new THREE.IcosahedronGeometry(0.5, 0), 0, 1.0, 0, 0, 0, '#4f8a3c'), piece(new THREE.IcosahedronGeometry(0.34, 0), 0.22, 1.25, 0.1, 0.6, 0, '#5f9e46')]), plP);
    plP.forEach(([x, z]) => colliders.push({ f: [x - 0.6, x + 0.6, z - 0.6, z + 0.6] }));
    // BIKE RACKS (3 hoops) by the station + the plaza corners
    const bkP = []; for (const [x, z, r] of [[-8, 106, 0], [8, 106, 0], [30, 30, Math.PI / 4], [-30, -30, Math.PI / 4]]) if (!inB(x, z, 0.8) && !avoid(x, z, 1)) bkP.push([x, z, r]);
    inst2(merge([-0.8, 0, 0.8].map(o => piece(new THREE.TorusGeometry(0.38, 0.035, 5, 14, Math.PI), o, 0.02, 0, Math.PI / 2, 0, '#9aa0a6')).concat([piece(Box(2.0, 0.04, 0.12), 0, 0.02, 0, 0, 0, '#5b5f66')])), bkP);
    bkP.forEach(([x, z, r]) => colliders.push({ f: [x - 1.1, x + 1.1, z - 0.4, z + 0.4] }));
    // BUS STOPS on the outer kerb of the ring road: shelter (roof, glass back, bench), a pole with the stop flag; one each side, clear of crossings + lamps
    const bsP = []; for (const [x, z, r] of [[-80, -148.6, 0], [80, 158.6, Math.PI], [-168.6, -70, Math.PI / 2], [168.6, 80, -Math.PI / 2]]) if (!inB(x, z, 2) && !avoid(x, z, 2)) bsP.push([x, z, r]);
    const glassBack = new THREE.MeshPhongMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.35, shininess: 100, depthWrite: false }), bsGlass = new THREE.InstancedMesh(new THREE.PlaneGeometry(3.6, 1.9).translate(0, 1.35, -0.62), glassBack, Math.max(1, bsP.length)); bsGlass.count = bsP.length;
    const bsI = inst2(merge([piece(Box(4.0, 0.1, 1.5), 0, 2.45, 0, 0, 0, '#201e1d'), piece(Box(4.04, 0.16, 0.06), 0, 2.38, 0.74, 0, 0, '#ec3013'), ...[-1.9, 1.9].map(o => piece(Box(0.1, 2.4, 0.1), o, 1.2, -0.62, 0, 0, '#2c3036')), ...[-1.9, 1.9].map(o => piece(Box(0.08, 2.4, 0.08), o, 1.2, 0.62, 0, 0, '#2c3036')), piece(Box(2.6, 0.08, 0.45), 0, 0.5, -0.38, 0, 0, '#a77b4f'), piece(Box(0.08, 0.5, 0.4), -1.2, 0.25, -0.38, 0, 0, '#201e1d'), piece(Box(0.08, 0.5, 0.4), 1.2, 0.25, -0.38, 0, 0, '#201e1d'),
      piece(Cyl(0.05, 0.05, 2.9, 8), 2.5, 1.45, 0.4, 0, 0, '#2c3036'), piece(Box(0.06, 0.6, 0.6), 2.5, 2.7, 0.4, 0, 0, '#ec3013'), piece(Box(0.065, 0.36, 0.42), 2.5, 2.72, 0.4, 0, 0, '#f3f2f2')]), bsP);
    bsP.forEach(([x, z, r], i) => { M4.compose(V(x, 0, z), Q.setFromEuler(E.set(0, r, 0)), ONE); bsGlass.setMatrixAt(i, M4); const c = Math.cos(r), sn = Math.sin(r), w = Math.abs(c) * 2.1 + Math.abs(sn) * 0.8, d = Math.abs(sn) * 2.1 + Math.abs(c) * 0.8; colliders.push({ f: [x - w, x + w, z - d, z + d], y1: 2.4 }); });
    bsGlass.renderOrder = 2; root.add(bsGlass);
    // WALL GRIME at the base of every Town Square wall (a soft dark band, 1 draw) + POSTERS on the blank side walls (existing names only)
    const grimeT = CT(16, 64, (g, w, h) => { const q = g.createLinearGradient(0, 0, 0, h); q.addColorStop(0, 'rgba(40,32,24,0)'); q.addColorStop(1, 'rgba(40,32,24,0.42)'); g.fillStyle = q; g.fillRect(0, 0, w, h); });
    const grime = []; for (const bd of blds) { if (bd.x1 - bd.x0 > 70 || !inRect((bd.x0 + bd.x1) / 2, (bd.z0 + bd.z1) / 2)) continue; for (const sd of SIDES) { const horiz = sd === 'N' || sd === 'S', ln = horiz ? bd.x1 - bd.x0 : bd.z1 - bd.z0, o = 0.03; const x = sd === 'W' ? bd.x0 - o : sd === 'E' ? bd.x1 + o : (bd.x0 + bd.x1) / 2, z = sd === 'N' ? bd.z0 - o : sd === 'S' ? bd.z1 + o : (bd.z0 + bd.z1) / 2;
      grime.push(piece(new THREE.PlaneGeometry(ln, 0.9), x, 0.45, z, sd === 'N' ? Math.PI : sd === 'S' ? 0 : sd === 'W' ? -Math.PI / 2 : Math.PI / 2)); } }
    if (grime.length) { const gm = new THREE.Mesh(merge(grime), new THREE.MeshBasicMaterial({ map: grimeT, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 })); gm.renderOrder = 1; root.add(gm); }
    const NAMES = ['MERU ARENA', "KING MIGHT'S BIRTHDAY", 'SPEEDBOAT BAY', 'TANK RANGE', 'PEARL ISLAND', 'SKATE PARK'], PCOL = ['#ec3013', '#2e4a6b', '#ffd23a', '#201e1d', '#3f9a5e', '#f3f2f2'];
    const posterT = CT(512, 256, (g, w, h) => { NAMES.forEach((n, i) => { const x = (i % 3) * 170 + 4, y = (i / 3 | 0) * 128 + 4, bw = 162, bh = 120; g.fillStyle = PCOL[i]; g.fillRect(x, y, bw, bh); const ink = PCOL[i] === '#f3f2f2' || PCOL[i] === '#ffd23a' ? '#201e1d' : '#f3f2f2'; g.fillStyle = ink; g.fillRect(x + 10, y + 10, 40, 6); g.font = '900 20px Archivo, sans-serif'; g.textBaseline = 'top';
      const words = n.split(' '); let ly = y + bh - 14 - words.length * 22; for (const wd of words) { g.fillText(wd, x + 10, ly); ly += 22; } }); });
    const posters = []; let pi = 0; for (const bd of blds) { if (!inRect((bd.x0 + bd.x1) / 2, (bd.z0 + bd.z1) / 2) || bd.x1 - bd.x0 > 70) continue; for (const sd of SIDES) { if (sd === bd.b.face || sd === bd.b.face2 || (bd.art && sd === bd.artSide)) continue; const horiz = sd === 'N' || sd === 'S', ln = horiz ? bd.x1 - bd.x0 : bd.z1 - bd.z0; if (ln < 10 || pi > 40) continue;
      for (const f of [-0.25, 0.25]) { const k = pi++ % 6, along = f * ln * 0.6, o = 0.05, x = sd === 'W' ? bd.x0 - o : sd === 'E' ? bd.x1 + o : (bd.x0 + bd.x1) / 2 + along, z = sd === 'N' ? bd.z0 - o : sd === 'S' ? bd.z1 + o : (bd.z0 + bd.z1) / 2 + along;
        const pg = new THREE.PlaneGeometry(1.1, 0.82), uv = pg.attributes.uv; for (let q = 0; q < uv.count; q++) uv.setXY(q, ((k % 3) * 170 + 4 + uv.getX(q) * 162) / 512, 1 - ((k / 3 | 0) * 128 + 4 + (1 - uv.getY(q)) * 120) / 256);
        posters.push(piece(pg, x, 1.6, z, sd === 'N' ? Math.PI : sd === 'S' ? 0 : sd === 'W' ? -Math.PI / 2 : Math.PI / 2)); } } }
    if (posters.length) { const pm = new THREE.Mesh(merge(posters), new THREE.MeshLambertMaterial({ map: posterT, polygonOffset: true, polygonOffsetFactor: -2 })); root.add(pm); }
    api_street = { drains: drains.length, manholes: holes.length, bollards: bol.length, bins: binP.length, planters: plP.length, racks: bkP.length, busStops: bsP.length, posters: posters.length, murals: artN.mural, tags: artN.tag }; }

  // ---------- step 10 pass 3 · TREES AND PARKS (worlds/meru2-flora.js): 5 tree types with wind, street trees in grates, lawn edging, flower beds + the fountain flower ring, shrubs, grass tufts ----------
  let api_parks = null;
  { const blocked = (x, z, r) => colliders.some(q => q.c ? Math.hypot(q.c[0] - x, q.c[1] - z) < q.c[2] + r : q.f ? x > q.f[0] - r && x < q.f[1] + r && z > q.f[2] - r && z < q.f[3] + r : false);
    const rh = (x, z) => { const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return s - Math.floor(s); };
    // STREET TREES IN GRATES on the paved promenades + Fountain Plaza corners: iron grate, frame, black guard hoop
    const cand = []; for (let x = 63; x <= 135; x += 16) for (const sx of [-1, 1]) for (const z of [-12.5, 12.5]) cand.push([sx * x, z]);
    for (const [p, q] of [[36, 27], [27, 34]]) for (const sx of [-1, 1]) for (const sz of [-1, 1]) cand.push([sx * p, sz * q]);
    const gOK = cand.filter(([x, z]) => L.surfaceAt(x, z) === 'stone' && !inB(x, z, 2) && !avoid(x, z, 2) && pathD(x, z) > 3 && roadD(x, z) > 2 && !blocked(x, z, 1.4) && !lampP.some(([p, q]) => Math.hypot(p - x, q - z) < 3));
    for (const [x, z] of gOK) { D('#2b2a29', Box(1.7, 0.04, 1.7), x, 0.02, z); for (const s of [-1, 1]) { D('#8d8a85', Box(1.8, 0.06, 0.1), x, 0.03, z + s * 0.85); D('#8d8a85', Box(0.1, 0.06, 1.8), x + s * 0.85, 0.03, z); }
      for (let k = 0; k < 4; k++) { const an = k * Math.PI / 2 + 0.785; D('#201e1d', Cyl(0.025, 0.025, 1.2, 4), x + Math.sin(an) * 0.42, 0.6, z + Math.cos(an) * 0.42); } D('#201e1d', new THREE.TorusGeometry(0.42, 0.025, 4, 16), x, 1.15, z, 0, Math.PI / 2); colliders.push({ c: [x, z, 0.5] }); }
    const kindOf = (x, z) => { if (Math.abs(Math.abs(z) - 19) < 0.01) return 'lime'; const r = rh(x, z); return r < 0.4 ? 'broad' : r < 0.6 ? 'birch' : r < 0.8 ? 'poplar' : 'lime'; };
    const allT = trees.map(([x, z]) => [x, 0, z, 0.85 + rh(z, x) * 0.4, kindOf(x, z)]).concat(gOK.map(([x, z]) => [x, 0, z, 0.78 + rh(z, x) * 0.14, 'lime']));
    // LAWN EDGING: a low concrete kerb wherever grass meets paving (gaps for paths + roads)
    const edges = [[-45, 45, -40, 40], [45, 150, -15, 15], [-150, -45, -15, 15], [-12, 12, -12, 12]], edgeG = []; let nEdge = 0;
    for (const [x0, x1, z0, z1] of edges) for (const [ax, az, bx, bz, nx, nz] of [[x0, z0, x1, z0, 0, -1], [x0, z1, x1, z1, 0, 1], [x0, z0, x0, z1, -1, 0], [x1, z0, x1, z1, 1, 0]]) {
      const len = Math.hypot(bx - ax, bz - az); for (let t = 0.5; t < len; t += 1) { const x = ax + (bx - ax) * t / len, z = az + (bz - az) * t / len, si = L.surfaceAt(x - nx * 0.4, z - nz * 0.4), so = L.surfaceAt(x + nx * 0.4, z + nz * 0.4);
        if (si === so || (si !== 'grass' && so !== 'grass') || pathD(x, z) < 2.6 || roadD(x, z) < 0.5 || inB(x, z, 0.2) || avoid(x, z, 0.3) || Math.hypot(x, z) < 7.8) continue;
        D('#cfc8bb', Box(nx ? 0.16 : 1.0, 0.12, nx ? 1.0 : 0.16), x, 0.06, z); nEdge++; const g = so === 'grass' ? 1 : -1; if (nEdge % 2) edgeG.push([x + nx * 0.35 * g, z + nz * 0.35 * g]); } }
    // FLOWER BEDS: oval soil beds with a stone edge, two colours each, on the plaza lawns
    const beds = [], fl = [], flc = [], FC = [['#ec3013', '#facc15'], ['#f472b6', '#f3f2f2'], ['#c084fc', '#facc15'], ['#fb923c', '#f3f2f2']];
    const bedOK = (x, z) => inRect(x, z) && L.surfaceAt(x, z) === 'grass' && !inB(x, z, 4) && !avoid(x, z, 4) && pathD(x, z) > 6 && roadD(x, z) > 4 && segD(x, z, [...L.TRAIN.line, L.TRAIN.line[0]]) > 7 && !allT.some(t => Math.hypot(t[0] - x, t[2] - z) < 5) && !blocked(x, z, 3.5) && !beds.some(([p, q]) => Math.hypot(p - x, q - z) < 14);
    for (let i = 0; i < 3000 && beds.length < (touch ? 4 : 7); i++) { const x = (Math.random() < 0.5 ? -1 : 1) * (50 + Math.random() * 95), z = (Math.random() < 0.5 ? -1 : 1) * (21 + Math.random() * 17); if (bedOK(x, z)) beds.push([x, z, Math.random() < 0.5 ? 0 : Math.PI / 2]); }
    beds.forEach(([x, z, r], bi) => { D('#4a3b2c', Cyl(1, 1, 0.14, 28).scale(3.2, 1, 1.8), x, 0.07, z, r); D('#cfc8bb', new THREE.TorusGeometry(1, 0.06, 4, 36).rotateX(Math.PI / 2).scale(3.25, 1, 1.85), x, 0.12, z, r);
      colliders.push({ f: r ? [x - 1.8, x + 1.8, z - 3.2, z + 3.2] : [x - 3.2, x + 3.2, z - 1.8, z + 1.8] }); const cs = FC[bi % FC.length], co = Math.cos(r), sn = Math.sin(r);
      for (let u = -2.8; u <= 2.8; u += 0.55) for (let v = -1.4; v <= 1.4; v += 0.5) { if ((u / 3) ** 2 + (v / 1.6) ** 2 > 0.85) continue; const ring = (u / 3) ** 2 + (v / 1.6) ** 2 > 0.4; fl.push([x + u * co + v * sn, 0.12, z - u * sn + v * co, 0.9 + Math.random() * 0.3]); flc.push(cs[ring ? 1 : 0]); } });
    // FOUNTAIN FLOWER RING on the lawn round the basin (gaps for the paths + the four benches)
    for (const [rr, cc] of [[9.2, '#ec3013'], [9.9, '#facc15']]) for (let an = 0; an < Math.PI * 2; an += 0.62 / rr) { const x = Math.sin(an) * rr, z = Math.cos(an) * rr; if (Math.abs(x) < 3 || Math.abs(z) < 3 || blocked(x, z, 0.5) || avoid(x, z, 0.5)) continue; fl.push([x, 0, z, 0.9 + Math.random() * 0.25]); flc.push(cc); }
    // SHRUBS: round some trees + along the grass side of the buildings (not by doors)
    const shr = [], shrOK = (x, z) => inRect(x, z) && L.surfaceAt(x, z) === 'grass' && !inB(x, z, 0.6) && pathD(x, z) > 3.2 && roadD(x, z) > 1.2 && !avoid(x, z, 1) && !blocked(x, z, 1.25) && !shr.some(s => Math.hypot(s[0] - x, s[2] - z) < 1.4);
    allT.forEach(([x, , z]) => { if (rh(x + 1, z) < 0.45) for (let k = 0; k < 2; k++) { const an = Math.random() * 6.28, r = 1.6 + Math.random() * 1.2, sx = x + Math.sin(an) * r, sz = z + Math.cos(an) * r; if (shrOK(sx, sz)) shr.push([sx, 0, sz, 0.7 + Math.random() * 0.5]); } });
    for (const b of L.BUILDINGS) { if (!inRect((b.f[0] + b.f[1]) / 2, (b.f[2] + b.f[3]) / 2)) continue; const [x0, x1, z0, z1] = b.f;
      for (const [ax, az, bx, bz] of [[x0 - 1.3, z0 - 1.3, x1 + 1.3, z0 - 1.3], [x0 - 1.3, z1 + 1.3, x1 + 1.3, z1 + 1.3], [x0 - 1.3, z0, x0 - 1.3, z1], [x1 + 1.3, z0, x1 + 1.3, z1]]) { const len = Math.hypot(bx - ax, bz - az);
        for (let t = 1.3; t < len; t += 2.6) { const x = ax + (bx - ax) * t / len, z = az + (bz - az) * t / len; if (Math.random() < 0.55 && !(b.door && Math.hypot(x - b.door[0], z - b.door[1]) < 5) && shrOK(x, z)) shr.push([x, 0, z, 0.75 + Math.random() * 0.4]); } } }
    shr.forEach(([x, , z, s]) => colliders.push({ c: [x, z, 0.5 * s] }));
    // GRASS TUFTS: clustered at tree feet, along the lawn edges and round the beds, plus a light scatter
    const tf = [], tOK = (x, z) => L.surfaceAt(x, z) === 'grass' && !inB(x, z, 0.3) && roadD(x, z) > 0.6 && pathD(x, z) > 2.8 && Math.hypot(x, z) > 7.8, NT = touch ? 500 : 1500;
    for (const [x, , z] of allT) for (let k = 0; k < 8; k++) { const an = Math.random() * 6.28, r = 0.5 + Math.random() * 2.6, px = x + Math.sin(an) * r, pz = z + Math.cos(an) * r; if (tOK(px, pz)) tf.push([px, 0, pz, 0.7 + Math.random() * 0.6]); }
    for (const [x, z] of edgeG) if (tf.length < NT * 0.7 && tOK(x, z)) tf.push([x, 0, z, 0.6 + Math.random() * 0.5]);
    for (const [x, z] of beds) for (let k = 0; k < 10; k++) { const an = Math.random() * 6.28, px = x + Math.sin(an) * 4.1, pz = z + Math.cos(an) * 2.6; if (tOK(px, pz)) tf.push([px, 0, pz, 0.8 + Math.random() * 0.5]); }
    for (let i = 0; i < 20000 && tf.length < NT; i++) { const x = RECT[0] + Math.random() * (RECT[1] - RECT[0]), z = RECT[2] + Math.random() * (RECT[3] - RECT[2]); if (tOK(x, z)) tf.push([x, 0, z, 0.6 + Math.random() * 0.8]); }
    root.add(plantTrees(allT, { shadow: !touch }).group, plantShrubs(shr), plantTufts(tf.slice(0, NT)), plantFlowers(fl, i => flc[i]));
    api_parks = { trees: allT.length, grate: gOK.length, kinds: allT.reduce((o, t) => (o[t[4]] = (o[t[4]] || 0) + 1, o), {}), shrubs: shr.length, tufts: Math.min(tf.length, NT), flowers: fl.length, beds: beds.length, bedsAt: beds.map(([x, z]) => [Math.round(x), Math.round(z)]), edging: nEdge }; }

  // ---------- merge the static bins ----------
  for (const k in bins) { const m = new THREE.Mesh(merge(bins[k]), matFor(k)); if (!touch && !(m.material instanceof THREE.MeshBasicMaterial)) m.castShadow = m.receiveShadow = true; root.add(m); }

  // ---------- cars on the ring road (two lanes, right-hand traffic); they stop for the player and for the car ahead ----------
  const lanes = [[[-157, -137], [157, -137], [157, 147], [-157, 147]], [[-163, -143], [-163, 153], [163, 153], [163, -143]]].map(p => { const seg = []; let s = 0; for (let i = 0; i < 4; i++) { const a = p[i], b = p[(i + 1) % 4], len = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push({ a, b, len, s0: s }); s += len; } return { seg, len: s }; });
  const at = (ln, s) => { s = ((s % ln.len) + ln.len) % ln.len; for (const g of ln.seg) if (s <= g.s0 + g.len) { const u = (s - g.s0) / g.len; return [g.a[0] + (g.b[0] - g.a[0]) * u, g.a[1] + (g.b[1] - g.a[1]) * u]; } return ln.seg[0].a; };
  const carG = merge([piece(Box(2, 0.8, 4.4), 0, 0.75, 0, 0, 0, '#ffffff'), piece(Box(1.75, 0.7, 2.3), 0, 1.5, -0.25, 0, 0, '#2a3540'), piece(Box(1.95, 0.55, 3.4), 0, 0.32, 0, 0, 0, '#151515'),
    piece(Box(0.45, 0.2, 0.06), -0.6, 0.85, 2.21, 0, 0, '#fff3c0'), piece(Box(0.45, 0.2, 0.06), 0.6, 0.85, 2.21, 0, 0, '#fff3c0'), piece(Box(0.45, 0.2, 0.06), -0.6, 0.85, -2.21, 0, 0, '#ff4030'), piece(Box(0.45, 0.2, 0.06), 0.6, 0.85, -2.21, 0, 0, '#ff4030')]);
  const per = touch ? 4 : 6, parked = [[1, 26], [3, 26], [4, 26]], NC = per * 2 + parked.length, PAL = ['#ec3013', '#f3f2f2', '#201e1d', '#5c6670', '#2e4a6b', '#e0b23a', '#8fb3cc', '#3d6b4a'];
  const carI = new THREE.InstancedMesh(carG, new THREE.MeshToonMaterial({ gradientMap: grad, vertexColors: true }), NC); if (!touch) carI.castShadow = true; root.add(carI);
  const cars = []; lanes.forEach((ln, li) => { for (let i = 0; i < per; i++) cars.push({ ln, s: ln.len * (i + Math.random() * 0.4) / per, v: 8 }); });
  // step 10 pass 4: FIVE SHAPED CAR MODELS (sedan, hatchback, SUV, van, taxi): bevelled side-profile body, glass on the slopes + sides, wheels in dark wells,
  // bumpers, grille, lights, mirrors, plate. One instanced draw per model; only the white body vertices take the car's paint colour. carI stays as the
  // invisible matrix holder for the night lamps + beams (scaled to each model's length).
  const CAR_MODELS = [
    { len: 4.4, w: 1.78, body: [[-2.2, 0.32], [2.2, 0.32], [2.22, 0.62], [2.12, 0.9], [1.0, 1.02], [0.3, 1.5], [-0.8, 1.54], [-1.55, 1.08], [-2.18, 0.98], [-2.24, 0.62]], fg: [[1.0, 1.02], [0.3, 1.5]], rg: [[-0.8, 1.54], [-1.55, 1.08]],
      side: [[[0.85, 1.06], [0.3, 1.44], [-0.15, 1.47], [-0.15, 1.06]], [[-0.3, 1.06], [-0.3, 1.47], [-0.75, 1.48], [-1.35, 1.08]]], wr: 0.34, wz: 1.38, hl: 0.72, tl: 0.85, top: 1.54 },
    { len: 3.8, w: 1.74, body: [[-1.9, 0.32], [1.9, 0.32], [1.93, 0.62], [1.85, 0.88], [0.85, 1.0], [0.2, 1.5], [-1.45, 1.53], [-1.85, 1.1], [-1.93, 0.62]], fg: [[0.85, 1.0], [0.2, 1.5]], rg: [[-1.45, 1.53], [-1.85, 1.1]],
      side: [[[0.72, 1.04], [0.2, 1.44], [-0.35, 1.46], [-0.35, 1.04]], [[-0.5, 1.04], [-0.5, 1.46], [-1.38, 1.47], [-1.7, 1.1]]], wr: 0.32, wz: 1.2, hl: 0.72, tl: 0.92, top: 1.53 },
    { len: 4.6, w: 1.86, body: [[-2.3, 0.45], [2.3, 0.45], [2.34, 0.8], [2.25, 1.12], [1.25, 1.22], [0.6, 1.85], [-2.15, 1.88], [-2.3, 1.3], [-2.34, 0.8]], fg: [[1.25, 1.22], [0.6, 1.85]], rg: [[-2.15, 1.88], [-2.3, 1.3]],
      side: [[[1.1, 1.26], [0.6, 1.78], [0.0, 1.8], [0.0, 1.26]], [[-0.15, 1.26], [-0.15, 1.8], [-1.2, 1.81], [-1.2, 1.26]], [[-1.35, 1.26], [-1.35, 1.81], [-2.05, 1.82], [-2.15, 1.32]]], wr: 0.42, wz: 1.45, hl: 0.95, tl: 1.1, top: 1.88 },
    { len: 4.9, w: 1.86, body: [[-2.45, 0.4], [2.45, 0.4], [2.5, 0.75], [2.4, 1.1], [1.9, 1.18], [1.3, 2.2], [-2.4, 2.25], [-2.48, 0.75]], fg: [[1.9, 1.18], [1.3, 2.2]], rg: null,
      side: [[[1.75, 1.22], [1.3, 2.0], [0.75, 2.02], [0.75, 1.22]]], wr: 0.38, wz: 1.6, hl: 0.9, tl: 1.0, top: 2.25 },
  ]; CAR_MODELS.push({ ...CAR_MODELS[0], taxi: true });
  const carModelG = ({ len, w, body, fg, rg, side, wr, wz, hl, tl, top, taxi }) => { const P = [], paint = taxi ? '#f2c230' : '#ffffff', bt = 0.05, GL = '#1d2730', X = w / 2 + bt, fz = len / 2 + bt;
    const eg = new THREE.ExtrudeGeometry(new THREE.Shape(body.map(([u, v]) => new THREE.Vector2(u, v))), { depth: w, bevelEnabled: true, bevelThickness: bt, bevelSize: bt, bevelSegments: 2, curveSegments: 1 }); eg.translate(0, 0, -w / 2); eg.rotateY(-Math.PI / 2); P.push(piece(eg, 0, 0, 0, 0, 0, paint));
    for (const e of [fg, rg]) { if (!e) continue; const [[u0, v0], [u1, v1]] = e, du = u1 - u0, dv = v1 - v0, l = Math.hypot(du, dv), nu = dv / l, nv = -du / l; P.push(piece(Box(w - 0.1, 0.02, l * 0.88), 0, (v0 + v1) / 2 + nv * (bt + 0.012), (u0 + u1) / 2 + nu * (bt + 0.012), 0, Math.atan2(-dv, du), GL)); }
    for (const poly of side) for (const sd of [-1, 1]) { const g = new THREE.ExtrudeGeometry(new THREE.Shape(poly.map(([u, v]) => new THREE.Vector2(u, v))), { depth: 0.02, bevelEnabled: false }); g.rotateY(-Math.PI / 2); P.push(piece(g, sd > 0 ? X + 0.025 : -X - 0.005, 0, 0, 0, 0, GL)); }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { P.push(piece(Cyl(wr + 0.07, wr + 0.07, 0.01, 14).rotateZ(Math.PI / 2), sx * (X + 0.004), wr, sz * wz, 0, 0, '#141414'), piece(Cyl(wr, wr, 0.24, 14).rotateZ(Math.PI / 2), sx * (X - 0.08), wr, sz * wz, 0, 0, '#1b1b1b'), piece(Cyl(wr * 0.58, wr * 0.58, 0.02, 10).rotateZ(Math.PI / 2), sx * (X + 0.05), wr, sz * wz, 0, 0, '#b8bcc0')); }
    for (const s of [-1, 1]) { P.push(piece(Box(w + 0.16, 0.2, 0.2), 0, body[0][1] + 0.12, s * (fz + 0.02), 0, 0, '#2a2a2a')); for (const sx of [-1, 1]) P.push(piece(Box(0.42, 0.15, 0.05), sx * (w / 2 - 0.3), s > 0 ? hl : tl, s * (fz + 0.005), 0, 0, s > 0 ? '#fff3c0' : '#d8261a')); }
    P.push(piece(Box(0.8, 0.15, 0.04), 0, hl - 0.13, fz + 0.01, 0, 0, '#111111'), piece(Box(0.52, 0.12, 0.02), 0, body[0][1] + 0.12, fz + 0.13, 0, 0, '#f3f2f2'), piece(Box(0.52, 0.12, 0.02), 0, tl - 0.25, -fz - 0.02, 0, 0, '#f3f2f2'));
    for (const sx of [-1, 1]) P.push(piece(Box(0.18, 0.11, 0.08), sx * (X + 0.09), fg[0][1] + 0.08, fg[0][0] - 0.12, 0, 0, paint));
    if (taxi) { P.push(piece(Box(0.7, 0.22, 0.3), 0, top + bt + 0.11, -0.3, 0, 0, '#f3f2f2')); for (const sx of [-1, 1]) P.push(piece(Box(0.02, 0.1, len * 0.62), sx * (X + 0.012), 0.86, 0, 0, 0, '#201e1d')); }
    return merge(P); };
  const carMat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 70, specular: 0x5a5a5a });
  carMat.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <color_vertex>', 'vColor = vec3(1.0);\n#ifdef USE_COLOR\n vColor *= color;\n#endif\n#ifdef USE_INSTANCING_COLOR\n vColor.xyz = mix(vColor.xyz, vColor.xyz * instanceColor.xyz, step(2.97, color.r + color.g + color.b));\n#endif'); }; carMat.customProgramCacheKey = () => 'carpaint';
  const carModelOf = i => i % 5 === 4 ? 4 : [0, 1, 2, 0, 3, 1, 0, 2][i % 8], carSlot = [], carCount = CAR_MODELS.map(() => 0);
  for (let i = 0; i < NC; i++) { const m = i < cars.length ? carModelOf(i) : [0, 1, 2][i % 3]; carSlot.push([m, carCount[m]++]); }
  const carMI = CAR_MODELS.map((d, m) => { const im = new THREE.InstancedMesh(carModelG(d), carMat, Math.max(1, carCount[m])); im.count = carCount[m]; if (!touch) im.castShadow = true; im.receiveShadow = true; root.add(im); return im; });
  const S4 = new THREE.Matrix4(), carScale = V(1, 1, 1);
  const setCar = (i, m4) => { const [m, k] = carSlot[i]; carMI[m].setMatrixAt(k, m4); carScale.set(CAR_MODELS[m].w / 1.78, 1, CAR_MODELS[m].len / 4.4); S4.copy(m4).scale(carScale); carI.setMatrixAt(i, S4); };
  const setCarColor = (i, col) => { const [m, k] = carSlot[i]; carMI[m].setColorAt(k, tc.set(col)); }; carI.visible = false; carI.castShadow = false;
  cars.forEach((c, i) => setCarColor(i, PAL[i % PAL.length]));
  // step 9: night car lights (bright lamps + a headlight beam on the road), sharing the cars' instance matrices
  const carLampI = new THREE.InstancedMesh(merge([piece(Box(0.5, 0.24, 0.05), -0.6, 0.85, 2.24, 0, 0, '#fff6d0'), piece(Box(0.5, 0.24, 0.05), 0.6, 0.85, 2.24, 0, 0, '#fff6d0'), piece(Box(0.5, 0.24, 0.05), -0.6, 0.85, -2.24, 0, 0, '#ff2a1a'), piece(Box(0.5, 0.24, 0.05), 0.6, 0.85, -2.24, 0, 0, '#ff2a1a')]), new THREE.MeshBasicMaterial({ vertexColors: true }), NC);
  const beamTex = CT(64, 128, (g, w, h) => { const r = g.createLinearGradient(0, 0, 0, h); r.addColorStop(0, 'rgba(255,240,200,0.55)'); r.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = r; g.beginPath(); g.moveTo(w * 0.3, 0); g.lineTo(w * 0.7, 0); g.lineTo(w, h); g.lineTo(0, h); g.fill(); });
  const carBeamI = new THREE.InstancedMesh(new THREE.PlaneGeometry(3.4, 10).rotateX(-Math.PI / 2).translate(0, 0.07, 7.2), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2 }), NC);
  carLampI.instanceMatrix = carBeamI.instanceMatrix = carI.instanceMatrix; carLampI.count = carBeamI.count = cars.length; carLampI.visible = carBeamI.visible = false; carLampI.frustumCulled = carBeamI.frustumCulled = false; root.add(carLampI, carBeamI);
  { const lot = L.BUILDINGS.find(b => b.lot); parked.forEach(([bay, z], j) => { const i = cars.length + j, r = lot ? lot.lot.r : [134, 156, 22, 44], x = r[0] + (r[1] - r[0]) * (bay + 0.5) / 6; M4.compose(V(x, 0, z), Q.setFromEuler(E.set(0, Math.PI, 0)), ONE); setCar(i, M4); setCarColor(i, PAL[(j * 3 + 1) % PAL.length]); }); }

  // ---------- night ----------
  let night = false;
  function setNight(on) { night = on; for (const m of facMats) m.emissive.set(on ? 0xffffff : 0x000000); for (const m of signMats) m.color.set(on ? 0xffffff : 0xe8e8e8); MAT.gold.color.set(on ? 0xffd86b : 0xffc64a);
    for (const [m, dd, n] of neonMats) m.color.set(on ? n : dd); lensMat.color.set(on ? 0xfff1c4 : 0xd9d6cf); glowPts.visible = poolI.visible = on;
    carLampI.visible = carBeamI.visible = on; fU.uNight.value = on ? 1 : 0; for (const m of bladeMats) m.color.set(on ? 0xffffff : 0x8a8a8a); bladePts.visible = on; for (const m of goodsMats) m.color.set(on ? 0xffffff : 0xa0a0a0); }

  // ---------- per frame: doors, cutaway fades, fountain, cars, police lights ----------
  const fade = (p, tg, dt, bd) => { const a = clamp(p.a + clamp(tg - p.a, -dt * 4, dt * 4), 0, 1); if (a === p.a) return; const was = p.a > 0.01; p.a = a; for (const m of p.mats) { m.opacity = a; m.transparent = a < 0.999; } for (const me of p.meshes) me.visible = a > 0.01; if (was !== a > 0.01 && bd) syncBd(bd); };
  let lodT = 0;
  function tick(dt, now) { const p = api.player, cam = camera.position;
    if ((lodT -= dt) <= 0) { lodT = 0.3; for (const bd of blds) { const dx = Math.max(bd.x0 - cam.x, 0, cam.x - bd.x1), dz = Math.max(bd.z0 - cam.z, 0, cam.z - bd.z1), far = Math.hypot(dx, dz, Math.max(0, cam.y - bd.h - 30)) > LOD; if (far !== !!bd.far) { bd.far = far; syncBd(bd); } } }
    for (const d of doors) { const near = !!p && p.y < 2 && Math.hypot(p.x - d.x, p.z - d.z) < 2.5; if (near && !d.was && d.open < 0.3 && api.onChime) api.onChime(d.b); d.was = near; d.open = clamp(d.open + (near ? 3 : -1.6) * dt, 0, 1); const e = d.open * d.open * (3 - 2 * d.open); d.l.position.x = -(1 + e * 2.05); d.r.position.x = 1 + e * 2.05; d.blk.on = d.open < 0.6; }
    let ins = null; if (p) for (const bd of blds) if (p.y < bd.h && p.x > bd.x0 && p.x < bd.x1 && p.z > bd.z0 && p.z < bd.z1) { ins = bd; break; } api.inside = ins ? ins.b : null;
    for (const bd of blds) { const cIn = cam.x > bd.x0 && cam.x < bd.x1 && cam.z > bd.z0 && cam.z < bd.z1 && cam.y < bd.h + 1, act = !!p && (ins === bd || cIn);
      for (const sd of SIDES) { let tg = 1; if (act && (bd.sv(sd, p.x, p.z) > 0) !== (bd.sv(sd, cam.x, cam.z) > 0)) tg = 0; fade(bd.cut[sd], tg, dt, bd); } fade(bd.cut.top, act ? 0 : 1, dt, bd); }
    { fU.uT.value = (now / 1000) % 1000; const cv = document.querySelector('canvas'); fU.uScale.value = (cv ? cv.height : innerHeight) / (2 * Math.tan(camera.fov * Math.PI / 360)); const fd = Math.hypot(cam.x, cam.z) < 170; spray.visible = curtain.visible = fd; }
    for (const [m, c, k] of blink) { const on = night ? ((now / 260 | 0) % 2 === 0) === (k === 'r') : false; m.color.set(on ? c : 0x3a3a44); }
    for (let i = 0; i < cars.length; i++) { const c = cars[i]; let tg = 11, gap = 1e9; for (const o of cars) if (o !== c && o.ln === c.ln) { const g = ((o.s - c.s) % c.ln.len + c.ln.len) % c.ln.len; if (g > 0 && g < gap) gap = g; }
      if (gap < 16) tg = Math.min(tg, Math.max(0, (gap - 8) * 1.4)); const a = at(c.ln, c.s - 3), b2 = at(c.ln, c.s + 3), x = (a[0] + b2[0]) / 2, z = (a[1] + b2[1]) / 2, fx = b2[0] - a[0], fz = b2[1] - a[1], fl = Math.hypot(fx, fz) || 1;
      if (p && p.y < 2) { const rx = p.x - x, rz = p.z - z, fw = (rx * fx + rz * fz) / fl, lat = Math.abs((rx * fz - rz * fx) / fl); if (fw > 0 && fw < 9 && lat < 2.6) tg = 0; }
      c.v += clamp(tg - c.v, -12 * dt, 4 * dt); c.s += c.v * dt; M4.compose(V(x, 0, z), Q.setFromEuler(E.set(0, Math.atan2(fx, fz), 0)), ONE); setCar(i, M4); }
    carI.instanceMatrix.needsUpdate = true; for (const im of carMI) im.instanceMatrix.needsUpdate = true; }

  const api = { keys, colliders, props: [...benchP.map(([x, z]) => ({ c: [x, z, 1.2] })), ...lampP.map(([x, z]) => ({ c: [x, z, 0.4] }))], rect: RECT, covers: inRect, heightOf: k => STY[k] ? STY[k].h : 7, player: null, inside: null, onChime: null, setNight, tick,
    stats: { street: api_street, parks: api_parks, buildings: blds.length, doors: doors.length, lamps: lampP.length, trees: trees.length, cars: cars.length, blades: bladeMats.length, trims: inst.length, trimKinds: instN } };
  window.__meru2City = api;   // test hook
  return api;
}
