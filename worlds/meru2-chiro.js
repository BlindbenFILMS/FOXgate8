// MERU 2.0 — s61 TOWN 2 INTERIOR 19: KIND CHIROPRACTOR [meruChiro] (f -188..-172 × 61..77, door N (-180, 61), side door E (-172, 69)).
// DR. LIMBER (Ben's pick): calm, stretchy yoga fox in a white tunic. ONE VISIT, ALL 7 STEPS (Ben): a Meru regular with an ache →
// 1 FIND THE KNOT (rub the back, WARM / HOT meter) → 2 CRACK! (tap when the ring goes green) → 3 STRAIGHTEN THE SPINE (drag the bones onto the line)
// → 4 TAIL STRETCH (drag along the dots) → 5 POSTURE CHECK at the mirror (what is off?) → 6 MASSAGE CHAIR (tap when the roller hits the sore spot)
// → 7 NECK ROLL CLASS (watch Dr. Limber, copy the moves). GENTLE: no fail. Prizes (Ben): LIMBER BALM (heal item) + the GOLDEN SPINE (Home shelf keepsake).
// s75 INTERIOR POLISH 19: shopKit (Dr. Limber = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board; badge), NOW HIRING inside the front door,
// ONE-box menu with choices, 1-box end line, work ring moved onto the door → table line, hint hand, touch radius 44, portrait lens, cameras kept inside the walls.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildChiro({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour = () => 12, isMuted = () => false }) {
  const X0 = -187.6, X1 = -172.4, Z0 = 61.4, Z1 = 76.6, CX = -180, CZ = 69, CEIL = 4.6;
  const G = new THREE.Group(); G.name = 'chiroShop'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), { put, box, cyl, sph } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const ringC = (x, z, r) => cols.push({ c: [x, z, r] }), rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] });
  const INK = '#201e1d', WH = '#f3f2f2', SAGE = '#b9cfb2', GR = '#3f9a5e', GRD = '#2f6f45', CHROME = '#c9ced3', WOOD = '#a9845a', LEATH = '#2b2b2e';
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = '900 ' + fs + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 14, H / 2 + 2); });
  const plane = (map, w, h, x, y, z, ry = 0, opt = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, ...opt })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  // ---------- floor: pale oak planks ----------
  { const t = CT(256, 256, g => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#dcc4a0', '#d3b890', '#e0caa8', '#d6bd96'][i % 4]; g.fillRect(0, i * 32, 256, 32); g.fillStyle = 'rgba(90,60,30,0.22)'; g.fillRect(0, i * 32, 256, 2); g.fillRect((i * 97) % 256, i * 32, 2, 32); g.fillRect((i * 97 + 128) % 256, i * 32, 2, 32); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 3, (Z1 - Z0) / 3); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f); }
  // ---------- walls: sage wainscot, white rail, white upper walls, green band (gaps for both doors) ----------
  const wall = (len, x, z, ry) => { box(len, 1.1, 0.05, SAGE, x, 0.55, z, ry); box(len, 0.06, 0.09, WH, x, 1.12, z, ry); box(len, CEIL - 1.15, 0.05, WH, x, 1.15 + (CEIL - 1.15) / 2, z, ry); box(len, 0.14, 0.07, GR, x, CEIL - 0.35, z, ry); };
  for (const [a, b] of [[X0, -181.4], [-178.6, X1]]) wall(b - a, (a + b) / 2, Z0 + 0.03, 0);
  for (const [a, b] of [[Z0, 67.6], [70.4, Z1]]) wall(b - a, X1 - 0.03, (a + b) / 2, Math.PI / 2);
  wall(X1 - X0, CX, Z1 - 0.03, 0); wall(Z1 - Z0, X0 + 0.03, CZ, Math.PI / 2);
  for (const x of [-181.45, -178.55]) box(0.1, 2.7, 0.14, WH, x, 1.35, Z0 + 0.06); box(3.0, 0.14, 0.14, WH, -180, 2.75, Z0 + 0.06);
  for (const z of [67.55, 70.45]) box(0.14, 2.7, 0.1, WH, X1 - 0.06, 1.35, z); box(0.14, 0.14, 3.0, WH, X1 - 0.06, 2.75, 69);
  // ---------- reception desk (north-east) + balm shelf behind it + waiting chairs (north-west) ----------
  box(2.4, 1.0, 0.7, WH, -175.4, 0.5, 63.3); box(2.5, 0.05, 0.8, WOOD, -175.4, 1.02, 63.3); box(2.4, 0.12, 0.02, GR, -175.4, 0.8, 63.66); rect(-176.65, -174.15, 62.9, 63.7);
  cyl(0.06, 0.08, 0.05, '#c9a14a', -174.6, 1.07, 63.4, 12); sph(0.05, '#c9a14a', -174.6, 1.11, 63.4, 1, 0.6, 1); cyl(0.12, 0.1, 0.12, '#b0573a', -176.2, 1.1, 63.3, 10); for (let k = 0; k < 5; k++) sph(0.09, '#4f8a3a', -176.2 + Math.cos(k * 1.3) * 0.08, 1.25 + (k % 2) * 0.06, 63.3 + Math.sin(k * 1.3) * 0.08, 1.3, 0.6, 1.3);
  for (const y of [1.3, 1.75]) { box(2.0, 0.04, 0.26, WOOD, -175.4, y, Z0 + 0.16); for (let k = 0; k < 8; k++) { cyl(0.05, 0.05, 0.14, k % 2 ? GR : WH, -176.25 + k * 0.24, y + 0.09, Z0 + 0.16, 8); cyl(0.052, 0.052, 0.03, GRD, -176.25 + k * 0.24, y + 0.17, Z0 + 0.16, 8); } }
  for (const x of [-186.4, -185.3, -184.2]) { box(0.6, 0.08, 0.56, SAGE, x, 0.61, 62.4); box(0.6, 0.6, 0.06, SAGE, x, 0.95, 62.1); for (const sx of [-0.26, 0.26]) for (const sz of [-0.22, 0.22]) box(0.03, 0.58, 0.03, INK, x + sx, 0.29, 62.4 + sz); }   /* s181 FOX SCALE (seat top 0.65, was 0.49) */
  rect(-186.75, -183.85, 61.9, 62.7); box(0.5, 0.42, 0.45, WOOD, -183.35, 0.21, 62.35); for (let k = 0; k < 3; k++) box(0.3, 0.015, 0.22, [GR, '#ec3013', WH][k], -183.35, 0.43 + k * 0.016, 62.35, k * 0.4);
  for (const [x, z] of [[-187.05, 63.3], [-187.0, 76.05], [-173.0, 62.0]]) { cyl(0.24, 0.18, 0.44, '#b0573a', x, 0.29, z, 12); for (let k = 0; k < 8; k++) sph(0.2, '#4f8a3a', x + Math.cos(k) * 0.15, 0.8 + (k % 3) * 0.2, z + Math.sin(k) * 0.15); ringC(x, z, 0.32); }
  // ---------- TREATMENT TABLE (centre; the patient lies face down, head east) + spine model on a stand ----------
  const TB = { x: -181, z: 70.5, top: 0.78 };
  for (const sx of [-1.15, 1.15]) for (const sz of [-0.3, 0.3]) cyl(0.035, 0.035, 0.6, CHROME, TB.x + sx, 0.33, TB.z + sz, 8);
  box(2.6, 0.08, 0.86, WH, TB.x, 0.64, TB.z); box(2.6, 0.1, 0.84, GR, TB.x, 0.73, TB.z); box(0.42, 0.08, 0.56, GR, TB.x + 1.52, 0.71, TB.z); cyl(0.03, 0.03, 0.5, CHROME, TB.x + 1.6, 0.42, TB.z, 6);
  rect(TB.x - 1.35, TB.x + 1.75, TB.z - 0.46, TB.z + 0.46);
  { const sx = -178.55, sz = 72.05; cyl(0.24, 0.26, 0.05, INK, sx, 0.1, sz, 14); cyl(0.025, 0.025, 1.8, CHROME, sx, 1.0, sz, 6); for (let i = 0; i < 10; i++) { box(0.12 - i * 0.004, 0.07, 0.09, WH, sx, 0.75 + i * 0.1, sz); box(0.08, 0.02, 0.07, '#ec3013', sx, 0.8 + i * 0.1, sz); }
    box(0.34, 0.14, 0.14, WH, sx, 0.66, sz); sph(0.11, WH, sx, 1.85, sz + 0.03, 1, 0.9, 1.25); for (const s of [-1, 1]) put(new THREE.ConeGeometry(0.04, 0.1, 5), sx + s * 0.06, 1.97, sz, WH); ringC(sx, sz, 0.3); }
  // ---------- POSTURE MIRROR (west wall): grid glass with a red plumb line + foot mat ----------
  const PM = { x: -186.1, z: 66 };
  { const t = CT(256, 420, (g, W, H) => { g.fillStyle = '#dfeaee'; g.fillRect(0, 0, W, H); g.strokeStyle = '#9fb4bd'; g.lineWidth = 2; for (let x = 0; x <= W; x += 21) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 21) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.fillStyle = '#ec3013'; g.fillRect(W / 2 - 2, 0, 4, H); for (let y = 42; y < H; y += 84) g.fillRect(W / 2 - 14, y, 28, 3); });
    plane(t, 1.7, 2.8, X0 + 0.09, 1.6, PM.z, Math.PI / 2); box(0.06, 2.92, 0.08, INK, X0 + 0.08, 1.6, PM.z - 0.89); box(0.06, 2.92, 0.08, INK, X0 + 0.08, 1.6, PM.z + 0.89); box(0.06, 0.08, 1.86, INK, X0 + 0.08, 3.04, PM.z); box(0.06, 0.08, 1.86, INK, X0 + 0.08, 0.16, PM.z);
    plane(label('POSTURE CHECK', GR, WH, 400, 64, 40), 1.6, 0.26, X0 + 0.09, 3.3, PM.z, Math.PI / 2); box(0.8, 0.02, 0.6, GR, PM.x, 0.08, PM.z); }
  // ---------- MASSAGE CHAIR (south-west, faces north) ----------
  const MC = { x: -185.4, z: 74.55 };
  box(0.8, 0.3, 0.7, INK, MC.x, 0.25, MC.z); box(0.7, 0.18, 0.62, LEATH, MC.x, 0.5, MC.z); box(0.8, 1.4, 0.2, LEATH, MC.x, 1.25, MC.z + 0.42, 0, 0.12); box(0.44, 0.26, 0.16, LEATH, MC.x, 2.05, MC.z + 0.55, 0, 0.12);
  for (const s of [-1, 1]) { box(0.14, 0.24, 0.66, LEATH, MC.x + s * 0.42, 0.72, MC.z + 0.02); box(0.15, 0.03, 0.4, GR, MC.x + s * 0.42, 0.85, MC.z - 0.02); box(0.04, 1.35, 0.04, GR, MC.x + s * 0.41, 1.25, MC.z + 0.31, 0, 0.12); }
  box(0.5, 0.12, 0.5, LEATH, MC.x, 0.3, MC.z - 0.56, 0, -0.6); box(0.3, 0.12, 0.05, GR, MC.x + 0.42, 0.92, MC.z - 0.2); ringC(MC.x, MC.z, 0.62);
  plane(label('MASSAGE CHAIR', WH, GR, 400, 64, 40), 1.5, 0.24, MC.x, 2.6, Z1 - 0.07, Math.PI);
  const roller = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: 0xffd23a })); roller.position.set(MC.x, 0.75, MC.z + 0.29); G.add(roller);
  // ---------- CLASS MATS (south-east): 5 mats, yoga balls, rolled mats, BREATHE plaque ----------
  const CL = { lead: [-177.4, 71.75], me: [-175.4, 73.5], pat: [-173.7, 73.5], a: [-176.5, 75.25], b: [-174.4, 75.25], c: [-178.1, 75.1] };
  for (const [k, p] of Object.entries(CL)) box(0.7, 0.02, 1.5, k === 'lead' ? GRD : k === 'me' ? GR : SAGE, p[0], 0.08, p[1] + (k === 'lead' ? 0.1 : -0.15));
  for (const [x, z, c] of [[-186.95, 70.3, '#2e86b8'], [-186.95, 69.4, '#ec3013'], [-173.0, 76.05, '#ffd23a']]) { sph(0.3, c, x, 0.38, z); ringC(x, z, 0.32); }
  for (let k = 0; k < 4; k++) cyl(0.09, 0.09, 0.66, [GR, SAGE, GRD, SAGE][k], -173.05, 0.18 + (k > 1 ? 0.17 : 0), 71.6 + (k % 2) * 0.19 + (k > 1 ? 0.09 : 0), 10, 0, Math.PI / 2);
  plane(label('BREATHE IN · BREATHE OUT', WH, GR, 720, 96, 50), 2.7, 0.36, CL.lead[0], 2.75, Z1 - 0.07, Math.PI); box(0.4, 0.5, 0.3, INK, -177.4, 0.33, 76.25); cyl(0.12, 0.12, 0.02, '#5a5654', -177.4, 0.38, 76.09, 12, Math.PI / 2);
  // ---------- south wall: FOX SPINE chart ----------
  { const t = CT(512, 704, (g, W, H) => { g.fillStyle = WH; g.fillRect(0, 0, W, H); g.fillStyle = GR; g.fillRect(0, 0, W, 84); g.fillStyle = '#fff'; g.font = '900 46px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('THE FOX SPINE', 22, 44);
      g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(2, 2, W - 4, H - 4); g.fillStyle = INK; g.lineWidth = 6;
      g.beginPath(); g.ellipse(372, 210, 46, 34, 0.1, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(400, 195); g.lineTo(462, 222); g.lineTo(398, 238); g.fill(); for (const ex of [350, 384]) { g.beginPath(); g.moveTo(ex - 14, 186); g.lineTo(ex, 140); g.lineTo(ex + 14, 186); g.fill(); }
      const sp = t => [330 - 180 * t, 232 + 100 * t - 34 * Math.sin(t * Math.PI)];
      for (let i = 0; i < 14; i++) { const [x, y] = sp(i / 13); g.fillRect(x - 7, y - 7, 14, 14); if (i > 2 && i < 10) { g.beginPath(); g.moveTo(x, y + 6); g.quadraticCurveTo(x + 22, y + 60, x - 4, y + 96); g.stroke(); } }
      g.beginPath(); g.ellipse(150, 338, 26, 18, -0.3, 0, Math.PI * 2); g.fill();
      for (const [a, b, c] of [[[300, 300], [312, 450], [300, 572]], [[158, 344], [138, 452], [168, 572]]]) { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(...c); g.stroke(); }
      for (let i = 0; i < 9; i++) { const t2 = i / 8, x = 128 - 92 * t2, y = 330 - 150 * t2 + 40 * Math.sin(t2 * 3), s = 11 - i; g.fillRect(x - s / 2, y - s / 2, s, s); }
      g.fillStyle = '#ec3013'; g.font = '900 26px Archivo, sans-serif'; g.fillText('NECK', 300, 160); g.fillText('BACK', 214, 176); g.fillText('LOW BACK', 108, 404); g.fillText('TAIL', 30, 150);
      g.fillStyle = INK; g.font = '900 28px Archivo, sans-serif'; g.fillText('BE KIND TO YOUR BACK', 22, 652); });
    plane(t, 1.5, 2.06, TB.x, 2.15, Z1 - 0.07, Math.PI); }
  // ---------- hanging sign, pendants ----------
  { const sY = 3.6, sZ = 67.4; for (const x of [CX - 0.8, CX + 0.8]) cyl(0.008, 0.008, 1.0, '#3d3b3a', x, sY + 0.6, sZ, 3); const s1 = plane(label('DR. LIMBER · KIND CHIROPRACTOR', WH, GR, 760, 96, 46), 3.2, 0.4, CX, sY, sZ + 0.01); const s2 = s1.clone(); s2.rotation.y = Math.PI; s2.position.z = sZ - 0.01; G.add(s2); }
  const bulbs = []; for (const [x, z] of [[TB.x, TB.z], [-175.4, 74], [MC.x, 73.6], [-180, 64.4], [-175.4, 63.3]]) { cyl(0.01, 0.01, 1.0, '#3d3b3a', x, CEIL - 0.4, z, 3); put(new THREE.ConeGeometry(0.24, 0.24, 12, 1, true), x, CEIL - 1.0, z, GR); bulbs.push([x, CEIL - 1.1, z]); }
  G.add(new THREE.Mesh(R0.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  { const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 8, 5), new THREE.MeshBasicMaterial({ color: 0xffe2a8 }), bulbs.length), M4 = new THREE.Matrix4(); bulbs.forEach((p, i) => { M4.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(i, M4); }); G.add(im); }
  // ================= DR. LIMBER =================
  const matC = {}; const LMc = c => matC[c] || (matC[c] = new THREE.MeshLambertMaterial({ color: c }));
  const LIMBER_LOOK = { fur: '#d9a066', furDark: '#8a5a2b', muzzle: '#f6ead8', snout: '#efe0c8', chin: '#fbf3e6', fluff: '#fbf3e6' };
  const lim = kit.makeFox({ key: 'drLimber', torso: ['#f3f2f2', '#3f9a5e', '#cfcac3'], outfit: 'robe', mood: 'happy', eyes: ['#3f7a52', '#3f7a52'], look: LIMBER_LOOK });
  lim.scale.set(0.94, 1.08, 0.94); G.add(lim);
  { const P = lim.userData && lim.userData.P; if (P && P.head) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 6, 22), LMc(GR)); b.rotation.x = Math.PI / 2 - 0.25; b.position.y = 0.12; P.head.add(b); } }
  const LPOS = { idle: [-176.4, 65.4], table: [-181.4, 68.75], mirror: [-184.3, 63.8], chair: [-186.75, 73.3], class: CL.lead };
  const limTo = k => { const p = LPOS[k]; lim.position.set(p[0], 0, p[1]); }; limTo('idle');
  const limT = { key: 'chiroLimber', obj: lim, ry: 0, r: 2.6 };
  const LB = 'Dr. Limber', ROLE = 'THE CHIROPRACTOR', lb = text => ({ who: LB, role: ROLE, text });
  // ---------- patients (Meru regulars) + the class ----------
  const CUST = [
    { name: 'KIA', forW: 'Item Shop', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], say: 'Lifting crates all day. My shoulders are rocks.', knots: [[0.16, 1.36], [-0.14, 1.18], [0.1, 0.91]], sore: 'SHOULDERS' },
    { name: 'PELL', forW: 'Crestview doorman', torso: ['#1f2937', '#e6b45a', '#111827'], say: 'Standing at the door since dawn. My lower back has opinions.', knots: [[-0.13, 0.88], [0.16, 1.04], [-0.08, 1.31]], sore: 'LOW BACK' },
    { name: 'OTTO', forW: 'Lakeside doorman', torso: ['#2f5d2a', '#e6b45a', '#1a3318'], say: 'I carry the residents\' parcels. All of them. Up stairs.', knots: [[0.14, 1.21], [-0.16, 1.37], [0, 1]], sore: 'MID BACK' },
    { name: 'MARLA', forW: 'Arena market', torso: ['#f472b6', '#fce7f3', '#9d174d'], say: 'Fruit crates. Melons are heavier than they look.', knots: [[-0.16, 1.34], [0.13, 1.14], [-0.06, 0.94]], sore: 'SHOULDERS' },
    { name: 'MICHAEL JAY', forW: 'Diner regular', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], say: 'Too long on a diner stool. Sizzle says I lean like a ketchup bottle.', knots: [[0.11, 0.89], [-0.14, 1.08], [0.16, 1.29]], sore: 'LOW BACK' },
    { name: 'THE FISHERMAN', forW: 'Lake jetty', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'], say: 'Hunched over a rod since sunrise. My neck is a question mark.', knots: [[0, 1.4], [0.16, 1.23], [-0.13, 1.05]], sore: 'NECK' },
    { name: 'FLICK', forW: 'Skate Park', torso: ['#ffd23a', '#201e1d', '#a16207'], say: 'Bailed at the park. Twice. Okay, five times.', knots: [[-0.1, 1.21], [0.14, 1], [-0.16, 1.37]], sore: 'MID BACK' }];
  const SORE = { 'LOW BACK': 1.02, 'MID BACK': 1.22, 'SHOULDERS': 1.42, 'NECK': 1.6 }, RY0 = 0.92, RY1 = 1.7;
  const custCache = {};
  const prep = f => { f.rotation.order = 'YXZ'; f.visible = false; G.add(f); const P = f.userData.P; f.userData.hz0 = P && P.head ? P.head.position.z : 0; return f; };
  const custFox = i => custCache[i] || (custCache[i] = prep(kit.makeFox({ key: 'chiroCust' + i, torso: CUST[i].torso, outfit: 'vest', mood: 'neutral' })));
  const CLASS = [['#c2456a', '#fce7f3', '#7a1f3d'], ['#2e86b8', '#e0f2fe', '#1e3a5f'], ['#e6b45a', '#fff7e0', '#8a5a12']].map((t, i) => prep(kit.makeFox({ key: 'chiroClass' + i, torso: t, outfit: 'vest', mood: 'happy' })));
  const sitPose = f => { const P = f.userData.P; if (!P) return; if (P.legs) P.legs.forEach(l => { l.rotation.x = -1.45; }); if (!P.fore && P.hero && P.body) P.body.position.y = -P.hero.dL; if (P.arms) P.arms.forEach(a => { a.rotation.x = -0.6; a.rotation.z = 0; }); if (P.body) P.body.position.y = 0; };
  // ---------- state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, lastP = null, lastFox = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine') => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1046, 0.06, 0.9); tone(1568, 0.04, 0.9); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), soft = () => tone(330, 0.04, 0.18, 'triangle'), swish = () => tone(1500 + Math.random() * 400, 0.012, 0.08, 'triangle');
  const crackS = () => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const len = 0.08, b = ac.createBuffer(1, Math.floor(ac.sampleRate * len), ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 6);
      const s = ac.createBufferSource(), gn = ac.createGain(); gn.gain.value = 0.3; s.buffer = b; s.connect(gn).connect(ac.destination); s.start(); } catch (e) {} tone(240, 0.04, 0.12, 'square'); };
  const rnd = n => Math.floor(Math.random() * n), shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
  // ---------- cards (Modernist) — LEFT, same spot as the other Town 2 shops ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  const pick = document.createElement('div'); pick.style.cssText = card.style.cssText.replace(/pointer-events:\s*none/, 'pointer-events:auto');
  const fadeEl = document.createElement('div'); fadeEl.style.cssText = 'position:fixed;inset:0;background:#201e1d;opacity:0;pointer-events:none;transition:opacity .25s;z-index:29';
  document.body.appendChild(card); document.body.appendChild(pick); document.body.appendChild(fadeEl); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; for (const el of [card, pick]) { el.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; el.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; el.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; el.style.zoom = short ? '0.85' : mid ? '0.82' : ''; } pick.style.overflowY = 'auto'; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const who = C => innerWidth > 900 && innerHeight > 700 ? '<div style="font-weight:900;font-size:15px">' + C.name + '</div><div style="font-size:12px;color:#5a5654;margin-bottom:2px">' + C.forW + '</div><div style="font-size:13px;font-style:italic;margin-bottom:6px">"' + C.say + '"</div>' : '<div style="font-weight:900;font-size:14px;margin-bottom:4px">' + C.name + ' <span style="font-weight:700;font-size:12px;color:#5a5654">' + C.forW + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span></div>';
  const meter = (f, c) => '<div style="position:relative;height:12px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:0;top:0;bottom:0;width:' + (Math.max(0, Math.min(1, f)) * 100).toFixed(1) + '%;background:' + c + '"></div></div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const btnCss = (primary, on) => 'display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;min-height:48px;padding:0 12px;margin-top:6px;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left;cursor:pointer;background:' + (primary ? '#ec3013' : on ? '#201e1d' : '#f3f2f2') + ';color:' + (primary || on ? '#ffffff' : '#201e1d');
  const showPick = (title, right, sub, opts, grid) => { pick.innerHTML = head(title, right) + '<div style="padding:8px 10px 10px">' + (sub ? '<div style="font-size:13px;font-weight:800">' + sub + '</div>' : '') + '</div>'; let body = pick.lastChild;
    if (grid) { const gd = document.createElement('div'); gd.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px'; body.appendChild(gd); body = gd; }
    opts.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = btnCss(o.primary, o.on) + (grid ? ';margin-top:0;padding:0 8px' : ''); b.innerHTML = '<span style="flex:1;min-width:0;white-space:normal">' + o.label + '</span>';
      b.addEventListener('click', e => { e.stopPropagation(); o.go(); }); b.addEventListener('pointerdown', e => e.stopPropagation()); body.appendChild(b); }); pick.style.display = 'block'; };
  const hidePick = () => { pick.style.display = 'none'; pick.innerHTML = ''; };
  // ---------- input: tap + drag on the game view (not HUD buttons or the pick card) ----------
  const ptr = { down: false, x: 0, y: 0, lx: 0, ly: 0, mv: 0, id: null, t: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && (t.closest('button,a,input,[role="button"],[aria-label]') || pick.contains(t))) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (busy !== 'job' || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = ptr.lx = e.clientX; ptr.y = ptr.ly = e.clientY; ptr.mv = 0; ptr.t = performance.now(); e.stopPropagation(); onDown(); drag(0); }, true);
  addEventListener('pointermove', e => { if (busy !== 'job' || !ptr.down || e.pointerId !== ptr.id) return; const now = performance.now(), dt = Math.min(0.1, (now - ptr.t) / 1000); ptr.t = now; ptr.x = e.clientX; ptr.y = e.clientY; ptr.mv = Math.hypot(ptr.x - ptr.lx, ptr.y - ptr.ly); ptr.lx = ptr.x; ptr.ly = ptr.y; e.stopPropagation(); drag(dt); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; if (J) J.grab = null; } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700), tmp = V();
  const scrW = w => { tmp.copy(w).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const scrL = l => scrW(J.body.localToWorld(l.clone())), dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  // ---------- overlay pieces ----------
  const ov = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, depthTest: false, transparent: true, opacity: op, side: THREE.DoubleSide });
  const dotM = ov(0xffd23a), dotCut = ov(0x3f9a5e), dotGeo = new THREE.SphereGeometry(touch ? 0.042 : 0.03, 8, 6), discGeo = new THREE.CircleGeometry(0.11, 22), ringGeo = new THREE.RingGeometry(0.07, 0.09, 24), boneGeo = new THREE.BoxGeometry(0.19, 0.06, 0.02);
  const onBack = (m, p, ro = 4) => { m.position.copy(p); m.rotation.y = Math.PI; m.renderOrder = ro; J.over.add(m); return m; };
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshLambertMaterial({ color: 0xf6ead8 })); palm.scale.set(1, 0.45, 1.3); palm.visible = false; palm.renderOrder = 6; G.add(palm);
  const pops = [];
  const burst = (p, c = 0xffd23a) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.13, 24), ov(c)); onBack(m, p, 6); pops.push({ m, t: 0 }); };
  const rc = new THREE.Raycaster();
  const isOver = o => { for (let q = o; q; q = q.parent) if (q === J.over) return true; return false; };
  function backPt(lx, ly) { const b = J.body; J.f.updateMatrixWorld(true); const o = b.localToWorld(V(lx, ly, -1.2)), d = b.localToWorld(V(lx, ly, 0.4)).sub(o).normalize(); rc.set(o, d); rc.far = 1.6;
    const h = rc.intersectObject(J.f, true).find(x => x.object.visible && x.object.isMesh && !isOver(x.object)); if (h) { const p = b.worldToLocal(h.point.clone()); p.z -= 0.015; if (p.z < -0.05) return p; } return V(lx, ly, -0.36); }
  // ================= THE VISIT =================
  const STEPS = ['knot', 'crack', 'spine', 'tail', 'mirror', 'chair', 'class'];
  const SN = { knot: 'FIND THE KNOT', crack: 'CRACK!', spine: 'STRAIGHTEN THE SPINE', tail: 'TAIL STRETCH', mirror: 'POSTURE CHECK', chair: 'MASSAGE CHAIR', class: 'NECK ROLL CLASS' };
  const stepHead = () => head('STEP ' + (STEPS.indexOf(J.step) + 1) + ' OF 7', SN[J.step]);
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const nextIdx = () => save.stat('chVisits', 0) % CUST.length;
  function layOnTable() { const f = J.f, P = J.U.P; J.pose = 'lie'; f.position.set(TB.x - 1.42, TB.top + 0.3, TB.z); f.rotation.set(Math.PI / 2, Math.PI / 2, 0); P.body.position.y = 0; f.updateMatrixWorld(true); limTo('table');
    if (!J.d0) { const T = P.tail; J.tb = T.position.clone(); T.rotation.set(0, 0, 0); f.updateMatrixWorld(true); const c = new THREE.Box3().setFromObject(T).getCenter(V()); J.body.worldToLocal(c); const d0 = c.sub(J.tb); J.d0 = d0.lengthSq() > 1e-4 ? d0.normalize() : V(0, 0.3, -1).normalize(); J.tq = new THREE.Quaternion(); } J.tdir = J.tlie = V(0, -1, -0.3).normalize(); }
  function startVisit() { const ci = nextIdx(), C = CUST[ci]; save.setStat('chVisits', save.stat('chVisits', 0) + 1);
    const f = custFox(ci), U = f.userData; f.visible = true; U.mood = U.base = 'neutral'; f.scale.set(1, 1, 1); const over = new THREE.Group(); U.P.body.add(over);
    J = { ci, C, f, U, body: U.P.body, over, step: null, sub: '', gold: 0, pause: 0, t: 0, clean: 0, mv: {}, fade: false };
    layOnTable(); busy = 'job'; hideWaiting(); nextStep(); }
  const clearOver = () => { if (!J) return; J.path = null; while (J.over.children.length) J.over.remove(J.over.children[0]); };
  function fadeTo(fn) { J.fade = true; fadeEl.style.opacity = '1'; setTimeout(() => { if (J) fn(); if (J) { J.fade = false; J.snap = true; } fadeEl.style.opacity = '0'; }, 320); }
  const BEGIN = { knot: beginKnot, crack: beginCrack, spine: beginSpine, tail: beginTail, mirror: beginMirror, chair: beginChair, class: beginClass };
  function nextStep() { clearOver(); const i = STEPS.indexOf(J.step); if (i < STEPS.length - 1) { J.step = STEPS[i + 1]; J.sub = ''; J.t0 = J.t; toast('STEP ' + (i + 2) + ' OF 7 · ' + SN[J.step], 1.8); BEGIN[J.step](); } else beginReveal(); }
  const done = (clean, line, wait = 1.3) => { if (clean) J.clean++; J.sub = 'done'; J.pause = wait; clean ? ding() : pop(); if (line) toast(line, 1.8); J.U.mood = 'happy'; };
  // ---- paths (tail): yellow dots to drag along ----
  function makePath(pts) { J.path = { pts: pts.map(p => ({ p, d: onBack(new THREE.Mesh(dotGeo, dotM), p, 5) })), i: 0, wob: 0 }; }
  function pathHit(dt) { const Pa = J.path; if (!Pa || Pa.i >= Pa.pts.length) return; const R = RAD(); let hit = -1;
    for (let j = Pa.i; j < Math.min(Pa.i + 3, Pa.pts.length); j++) if (dist(scrL(Pa.pts[j].p)) < R * 1.1) hit = j;
    if (hit >= 0) { for (let j = Pa.i; j <= hit; j++) { Pa.pts[j].d.material = dotCut; onPathPoint(j); } Pa.i = hit + 1; }
    else if (ptr.down && dt > 0) { let md = 1e9; for (let j = Math.max(0, Pa.i - 1); j < Pa.pts.length; j++) md = Math.min(md, dist(scrL(Pa.pts[j].p))); if (md > R * 2.4) Pa.wob += dt; } }
  // ---- 1 · FIND THE KNOT: rub the back; the card says COLD / WARM / HOT; the knot glows as you work it ----
  function beginKnot() { J.sub = 'knot'; J.ki = 0; J.kt = 0; J.kc = 0; J.heat = 0; J.knots = J.C.knots.map(([lx, ly]) => { const p = backPt(lx, ly), m = onBack(new THREE.Mesh(discGeo, ov(0xec3013, 0)), p); return { p, m, rub: 0, done: false, ft: 0 }; }); }
  const OOH = ['"OOOH. THERE."', '"THAT ONE. YES."', '"I FEEL TEN YEARS YOUNGER."'];
  function knotTick(dt) { const k = J.knots[J.ki]; J.kt += dt;
    J.knots.forEach(q => { if (q.done) { q.ft += dt; q.m.material.color.set(0x3f9a5e); q.m.material.opacity = Math.max(0, 0.8 - q.ft); } });
    if (k) k.m.material.opacity = Math.min(0.85, k.rub / 200 * 0.85 + (J.kt > 8 ? 0.2 + 0.12 * Math.sin(J.t * 6) : 0));
    if (!k && J.sub === 'knot') done(J.kc >= 3, 'DR. LIMBER: "ALL THREE. YOUR PAWS LISTEN WELL."');
    const n = J.knots.filter(q => q.done).length, h = J.heat, hc = h > 0.75 ? '#ec3013' : h > 0.4 ? '#ffd23a' : '#2e86b8', ht = h > 0.75 ? 'HOT' : h > 0.4 ? 'WARM' : 'COLD';
    setCard('kn' + J.sub + n + Math.round(h * 8) + (k ? Math.round(k.rub / 40) : ''), stepHead() + foot(J.sub === 'done' ? 'KNOTS GONE' : 'RUB THE BACK · FIND THE KNOT') + '<div style="padding:8px 10px 10px">' + who(J.C)
      + '<div style="display:flex;justify-content:space-between;font-weight:900;font-size:13px"><span>' + (k ? 'KNOT ' + (J.ki + 1) : 'DONE') + '</span><span style="color:' + hc + '">' + ht + '</span></div>' + meter(h, hc)
      + row('#ec3013', 'KNOTS', n + '/3', n === 3) + (k && k.rub > 0 ? meter(k.rub / 200, '#3f9a5e') : '') + '</div>'); }
  function knotDrag() { const k = J.knots[J.ki]; if (!k) return; const d = dist(scrL(k.p)); J.heat = Math.max(0, Math.min(1, 1 - d / (RAD() * 7)));
    if (ptr.down && d < RAD() * 1.6 && ptr.mv > 0) { k.rub += Math.min(40, ptr.mv); if (Math.random() < 0.25) tone(180 + Math.random() * 40, 0.015, 0.1, 'triangle'); }
    if (k.rub >= 200) { k.done = true; if (J.kt < 12) J.kc++; addGold(6); pop(); burst(k.p, 0x3f9a5e); toast(J.C.name + ': ' + OOH[J.ki], 1.4); J.ki++; J.kt = 0; J.heat = 0; } }
  // ---- 2 · CRACK!: a ring shrinks onto each vertebra; tap when it turns green ----
  function beginCrack() { J.sub = 'crack'; J.cx = 0; J.miss = 0; J.cc = 0; J.ct = 0; J.cr = [1.36, 1.2, 1.04, 0.88].map(ly => { const p = backPt(0, ly), dot = onBack(new THREE.Mesh(ringGeo, ov(0xffffff)), p), ring = onBack(new THREE.Mesh(ringGeo, ov(0xffd23a)), p, 5); dot.visible = ring.visible = false; return { p, dot, ring, done: false }; }); }
  const ringS = () => 2.6 - 2.0 * ((J.ct % 1.6) / 1.6), inWin = s => s >= 0.8 && s <= 1.25;
  function crackTick(dt) { const k = J.cr[J.cx]; J.ct += dt;
    J.cr.forEach((q, i) => { q.dot.visible = i === J.cx || q.done; if (q.done) q.dot.material.color.set(0x3f9a5e); q.ring.visible = i === J.cx; });
    if (k) { const s = ringS(); k.ring.scale.setScalar(s); k.ring.material.color.set(inWin(s) || J.miss >= 2 ? 0x3f9a5e : 0xffd23a); }
    if (!k && J.sub === 'crack') { J.U.mood = 'happy'; done(J.cc >= 3, 'DR. LIMBER: "FOUR CLEAN POPS. LISTEN TO THAT BACK SIGH."'); }
    const n = J.cr.filter(q => q.done).length;
    setCard('cr' + J.sub + n + J.miss, stepHead() + foot(J.sub === 'done' ? 'ALL POPPED' : J.miss >= 2 ? 'TAP NOW · ANY TIME' : 'TAP WHEN THE RING GOES GREEN') + '<div style="padding:8px 10px 10px">' + who(J.C) + row('#3f9a5e', 'CRACKS', n + '/4', n === 4) + '</div>'); }
  function crackTap() { const k = J.cr[J.cx]; if (!k) return; const s = ringS(); if (inWin(s) || J.miss >= 2) { crackS(); burst(k.p); k.done = true; if (!J.miss) J.cc++; addGold(J.miss ? 4 : 6); J.U.mood = 'surprised'; toast('CRACK!', 0.9); J.cx++; J.miss = 0; J.ct = 0; }
    else { J.miss++; soft(); toast(s > 1.25 ? 'TOO EARLY · WAIT FOR GREEN' : 'A LITTLE LATE · NEXT RING', 1.1); } }
  // ---- 3 · STRAIGHTEN THE SPINE: x-ray view, drag each bone onto the yellow line ----
  function beginSpine() { J.sub = 'spine'; const zc = backPt(0, 1.13).z - 0.01; onBack(new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.96), ov(0x1d2b3a, 0.6)), V(0, 1.13, zc), 4); onBack(new THREE.Mesh(new THREE.PlaneGeometry(0.016, 0.88), ov(0xffd23a)), V(0, 1.13, zc - 0.004), 5);
    const sg = Math.random() < 0.5 ? 1 : -1; J.bones = [0.1, 0.15, 0.11, -0.07, -0.12, -0.16, -0.08].map((o, i) => { const ly = 0.86 + i * 0.09, m = onBack(new THREE.Mesh(boneGeo, ov(0xf3f2f2)), V(o * sg, ly, zc - 0.012), 6); return { m, done: false }; }); J.grab = null; }
  const plane3 = new THREE.Plane(), hitP = V();
  function spineDown() { let best = null, bd = RAD() * 1.6; for (const b of J.bones) { if (b.done) continue; const d = dist(scrW(b.m.getWorldPosition(V()))); if (d < bd) { bd = d; best = b; } } J.grab = best; if (best) pop(); }
  function spineDrag() { const b = J.grab; if (!b || !ptr.down) return; const p = b.m.position, w = l => J.body.localToWorld(l);
    plane3.setFromCoplanarPoints(w(V(0, p.y, p.z)), w(V(1, p.y, p.z)), w(V(0, p.y + 1, p.z))); rc.setFromCamera(new THREE.Vector2(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1), camera);
    if (!rc.ray.intersectPlane(plane3, hitP)) return; const l = J.body.worldToLocal(hitP.clone()); p.x = Math.max(-0.22, Math.min(0.22, l.x));
    if (Math.abs(p.x) < 0.03) { p.x = 0; b.done = true; b.m.material.color.set(0x3f9a5e); J.grab = null; addGold(2); pop(); } }
  function spineTick() { const n = J.bones.filter(b => b.done).length; if (n === 7 && J.sub === 'spine') { addGold(4); done(J.t - J.t0 < 35, 'DR. LIMBER: "STRAIGHT AS A LANTERN POLE."'); }
    setCard('sp' + J.sub + n, stepHead() + foot(J.sub === 'done' ? 'ALL IN LINE' : 'DRAG EACH BONE ONTO THE LINE') + '<div style="padding:8px 10px 10px">' + who(J.C) + row('#f3f2f2', 'BONES IN LINE', n + '/7', n === 7) + '</div>'); }
  // ---- 4 · TAIL STRETCH: drag the tail up along the dots, then side to side ----
  const TAILS = [{ name: 'UP', pts: b => [...Array(7)].map((_, i) => { const t = 0.3 + i * 0.2; return b.clone().add(V(0, -Math.cos(t) * 0.9, -Math.sin(t) * 0.9)); }) },
    { name: 'SIDE TO SIDE', pts: b => [...Array(7)].map((_, i) => { const t = -0.8 + i * 0.2667; return b.clone().add(V(Math.sin(t) * 0.88, -0.15, -Math.cos(t) * 0.88)); }) }];
  function beginTail() { J.sub = 'tail'; J.tk = 0; J.tres = []; makePath(TAILS[0].pts(J.tb)); }
  function onPathPoint(j) { swish(); J.tdir = J.path.pts[j].p.clone().sub(J.tb).normalize(); }
  function tailTick() { const Pa = J.path; if (Pa && Pa.i >= Pa.pts.length && J.sub === 'tail') { const clean = Pa.wob < 0.4; J.tres[J.tk] = clean; addGold(clean ? 9 : 6); pop(); toast('TAIL ' + TAILS[J.tk].name + (clean ? ' · SMOOTH' : ' · A BIT WOBBLY'), 1.1); J.tk++;
      Pa.pts.forEach(q => J.over.remove(q.d)); J.path = null; if (J.tk >= TAILS.length) { J.tdir = J.tlie; done(J.tres.every(Boolean), J.C.name + ': "MY TAIL HAS NOT WAGGED THIS WELL IN YEARS."'); } else makePath(TAILS[J.tk].pts(J.tb)); }
    const rows = TAILS.map((s, i) => row(i === J.tk ? '#ffd23a' : '#cfcac3', s.name, i < J.tk ? (J.tres[i] ? '\u2713' : '~') : i === J.tk && J.path ? J.path.i + '/7' : '\u2014', i < J.tk)).join('');
    setCard('tl' + J.tk + (J.path ? J.path.i : 'x') + J.sub, stepHead() + foot(J.sub === 'done' ? 'STRETCHED' : 'DRAG THE TAIL ALONG THE DOTS') + '<div style="padding:8px 10px 10px">' + who(J.C) + rows + '</div>'); }
  // ---- 5 · POSTURE CHECK: the patient stands at the grid mirror; tap what is off ----
  const FAULT = { head: 'HEAD', shoulders: 'SHOULDERS', hips: 'HIPS', tail: 'TAIL' };
  const FHINT = { head: 'Look at the ears. Are they over the shoulders, or out in front?', shoulders: 'Look at the back. Is it tall, or curled like a shell?', hips: 'Look at the red line. Is the body leaning?', tail: 'Look behind them. A happy tail does not drag.' };
  const FFIX = { head: 'Chin back. Ears over the shoulders. Lovely.', shoulders: 'Tall back. Open chest. There we are.', hips: 'Level hips. The red line agrees.', tail: 'Tail up. Mood up. They go together.' };
  function standAt(x, z, yaw) { const f = J.f; J.U.P.tail.rotation.set(0, 0, 0); J.pose = 'stand'; J.yaw = yaw; f.position.set(x, 0, z); f.rotation.set(0, yaw, 0); }
  function beginMirror() { J.sub = 'wait'; fadeTo(() => { standAt(PM.x, PM.z, Math.PI / 2); limTo('mirror'); J.U.mood = 'neutral'; J.faults = shuffle(Object.keys(FAULT)).slice(0, 3); J.fi = 0; J.fa = 1; J.fm = 0; J.mc = 0; J.sub = 'mirror'; hideCard(); faultPick(); }); }
  function faultPick() { const cur = J.faults[J.fi]; showPick('STEP 5 OF 7', 'POSTURE CHECK', J.C.name + ' · ' + (J.fi + 1) + ' OF 3<div style="font-weight:700;font-size:12px;color:#5a5654;margin-top:6px">WHAT IS OFF? LOOK AT THE GRID</div>',
    Object.keys(FAULT).map(k => ({ label: FAULT[k], primary: J.fm >= 2 && k === cur, go: () => faultGo(k) })), true); }
  function faultGo(k) { const cur = J.faults[J.fi]; if (k !== cur) { J.fm++; soft(); toast('DR. LIMBER: "' + FHINT[cur] + '"', 2.6); faultPick(); return; }
    if (!J.fm) J.mc++; addGold(J.fm ? 4 : 6); ding(); toast('DR. LIMBER: "' + FFIX[k] + '"', 2.0); hidePick(); J.sub = 'fixing'; }
  function mirrorTick(dt) { if (J.sub !== 'fixing') return; J.fa = Math.max(0, J.fa - dt * 1.4); if (J.fa > 0) return; J.fi++; J.fm = 0;
    if (J.fi >= 3) { J.faults = []; done(J.mc >= 3, J.C.name + ': "I AM TALLER. I CAN SEE OVER THE COUNTER NOW."'); } else { J.fa = 1; J.sub = 'mirror'; pop(); faultPick(); } }
  function faultPose() { const P = J.U.P, k = J.sub === 'done' ? null : J.faults && J.faults[J.fi], a = J.fa || 0; if (!k) return;
    if (k === 'head') { P.head.position.z = J.U.hz0 + 0.32 * a; P.head.rotation.x = 0.5 * a; }
    if (k === 'shoulders') { P.body.rotation.x = 0.5 * a; P.arms.forEach(m => { m.rotation.x = 0.35 * a; }); }
    if (k === 'hips') J.f.rotation.z = 0.2 * a;
    if (k === 'tail') { P.tail.rotation.x = 1.3 * a; P.tail.rotation.y = 0; } }
  // ---- 6 · MASSAGE CHAIR: the roller runs up and down the back; tap when it is on the sore spot ----
  function beginChair() { J.sub = 'wait'; fadeTo(() => { const f = J.f; J.pose = 'sit'; f.position.set(MC.x, 0.1, MC.z + 0.05); f.rotation.set(0, Math.PI, 0); limTo('chair'); J.U.mood = 'neutral'; J.ry = RY0; J.rv = 0.45; J.band = SORE[J.C.sore]; J.hits = 0; J.taps = 0; J.cm = 0; J.sub = 'chair'; }); }
  function chairTick(dt) { if (J.sub === 'chair') { J.ry += J.rv * dt; if (J.ry > RY1) { J.ry = RY1; J.rv = -Math.abs(J.rv); } if (J.ry < RY0) { J.ry = RY0; J.rv = Math.abs(J.rv); } }
    roller.position.set(MC.x, J.ry || RY0, MC.z + 0.34 + ((J.ry || RY0) - 1.25) * 0.12);
    if (J.sub === 'chair' && (J.hits >= 5 || J.taps >= 14)) done(J.cm <= 2, J.C.name + ': "I COULD LIVE IN THIS CHAIR."');
    const f = (J.ry - RY0) / (RY1 - RY0), b0 = (J.band - 0.075 - RY0) / (RY1 - RY0), b1 = (J.band + 0.075 - RY0) / (RY1 - RY0), on = Math.abs(J.ry - J.band) < 0.075;
    setCard('ch' + J.sub + J.hits + Math.round(f * 50), stepHead() + foot(J.sub === 'done' ? 'RELAXED' : 'TAP WHEN THE ROLLER IS ON THE SORE SPOT') + '<div style="padding:8px 10px 10px">' + who(J.C) + row('#ffd23a', 'SORE SPOT · ' + J.C.sore, J.hits + '/5', J.hits >= 5)
      + '<div style="position:relative;height:22px;background:#cfcac3;border:2px solid #201e1d;margin:6px 0 2px"><div style="position:absolute;top:0;bottom:0;left:' + (b0 * 100).toFixed(1) + '%;width:' + ((b1 - b0) * 100).toFixed(1) + '%;background:#ffd23a"></div><div style="position:absolute;top:-2px;bottom:-2px;width:6px;margin-left:-3px;left:' + (f * 100).toFixed(1) + '%;background:' + (on ? '#3f9a5e' : '#201e1d') + '"></div></div>'
      + '<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:#5a5654"><span>LOW BACK</span><span>NECK</span></div></div>'); }
  function chairTap() { if (J.sub !== 'chair') return; J.taps++; if (Math.abs(J.ry - J.band) < 0.075) { J.hits++; addGold(3); tone(392, 0.05, 0.5); J.U.mood = 'happy'; toast(J.C.name + ': "AHHH."', 0.9); } else { J.cm++; soft(); toast(J.ry > J.band ? 'A BIT LOWER' : 'A BIT HIGHER', 0.9); } }
  // ---- 7 · NECK ROLL CLASS: watch Dr. Limber, then copy the moves (rounds of 2, 3, 4) ----
  const MOVES = ['LEFT', 'RIGHT', 'UP', 'DOWN'], ARW = { LEFT: '\u2190 LEFT', RIGHT: 'RIGHT \u2192', UP: '\u2191 UP', DOWN: '\u2193 DOWN' }, HM = { LEFT: [0, -0.42], RIGHT: [0, 0.42], UP: [-0.36, 0], DOWN: [0.4, 0] };
  function beginClass() { J.sub = 'wait'; fadeTo(() => { standAt(CL.pat[0], CL.pat[1], Math.PI); limTo('class'); lim.rotation.y = 0; CLASS.forEach((f, i) => { const p = CL[['a', 'b', 'c'][i]]; f.position.set(p[0], 0, p[1]); f.rotation.set(0, Math.PI, 0); f.visible = true; });
      if (lastP) Object.assign(lastP, { x: CL.me[0], z: CL.me[1], yaw: Math.PI, sp: 0 }); J.round = 0; J.wrong = 0; J.sub = 'class'; J.mv = {}; newRound(); }); }
  function newRound() { const n = 2 + J.round; J.seq = []; while (J.seq.length < n) { const m = MOVES[rnd(4)]; if (m !== J.seq[J.seq.length - 1]) J.seq.push(m); } J.phase = 'show'; J.sht = 0; J.shown = 0; J.cp = 0; hidePick(); }
  function copyPick() { showPick('STEP 7 OF 7', 'ROUND ' + (J.round + 1) + ' OF 3', 'YOUR TURN · ' + J.cp + ' / ' + J.seq.length + '<div style="font-weight:700;font-size:12px;color:#5a5654;margin-top:6px">COPY DR. LIMBER, IN ORDER</div>', MOVES.map(m => ({ label: ARW[m], go: () => copyGo(m) })), true); }
  function copyGo(m) { if (J.phase !== 'copy') return; const want = J.seq[J.cp]; J.mv.me = { m, t: 0.6 }; J.mv.cls = { m: want, t: 0.6 }; if (m === want) pop(); else { J.wrong++; soft(); toast('DR. LIMBER: "' + want + ', not ' + m + '. Breathe. It is fine."', 1.6); }
    J.cp++; if (J.cp >= J.seq.length) { hidePick(); addGold(J.wrong ? 4 : 6); J.round++; J.phase = J.round >= 3 ? 'roll' : 'wait'; J.sht = 0; if (J.round >= 3) toast('EVERYONE · ONE BIG NECK ROLL', 1.8); } else copyPick(); }
  function classTick(dt) { if (J.sub !== 'class') return; J.sht += dt;
    if (J.phase === 'show') { const i = Math.floor(J.sht / 1.0); if (i < J.seq.length && i >= J.shown) { J.shown = i + 1; J.mv.lim = { m: J.seq[i], t: 0.65 }; tone([523, 587, 659, 698][MOVES.indexOf(J.seq[i])], 0.05, 0.3); } if (J.sht > J.seq.length + 0.3) { J.phase = 'copy'; hideCard(); copyPick(); } }
    else if (J.phase === 'wait' && J.sht > 1.1) newRound();
    else if (J.phase === 'roll' && J.sht > 2.6) { J.phase = 'end'; done(J.wrong <= 1, 'DR. LIMBER: "BEAUTIFUL. SAME TIME TOMORROW, EVERYONE."'); }
    if (J.phase === 'show' || J.phase === 'wait') { const seen = J.seq.slice(0, J.shown).map(m => ARW[m]).join(' · ') + (J.shown < J.seq.length ? ' · ?' : '');
      setCard('cl' + J.round + J.phase + J.shown, stepHead() + foot(J.phase === 'wait' ? 'NEXT ROUND' : 'WATCH DR. LIMBER') + '<div style="padding:8px 10px 10px">' + row('#3f9a5e', 'ROUND ' + (J.round + 1) + ' OF 3', J.seq.length + ' MOVES', false) + '<div style="font-weight:900;font-size:16px;padding-top:6px">' + seen + '</div></div>'); }
    else if (J.phase === 'roll' || J.phase === 'end') setCard('clr' + J.phase, stepHead() + foot('ROLL · AND · BREATHE') + '<div style="padding:8px 10px 10px">' + row('#3f9a5e', 'CLASS DONE', J.wrong ? J.wrong + ' MIXED UP' : '\u2713', !J.wrong) + '</div>'); }
  function headMove(f, st, flip, dt, roll) { const P = f && f.userData && f.userData.P; if (!P || !P.head) return; const h = P.head;
    if (roll) { const w = J.t * 4.2; h.rotation.x = Math.cos(w) * 0.32; h.rotation.z = Math.sin(w) * 0.38; return; }
    const on = st && st.t > 0, tg = on ? HM[st.m] : [0, 0], k = Math.min(1, dt * 10); h.rotation.x += (tg[0] - h.rotation.x) * k; h.rotation.z += (tg[1] * (flip ? -1 : 1) - h.rotation.z) * k; }
  // ---- the reveal: they stand tall and pay ----
  function beginReveal() { J.step = 'reveal'; J.sub = 'wait'; fadeTo(() => { CLASS.forEach(f => { f.visible = false; }); resetHead(lastFox); standAt(TB.x, 68.4, Math.PI); limTo('idle'); J.U.mood = J.U.base = 'happy'; J.U.hop = 1; J.f.scale.set(1, 1.04, 1); J.sub = 'reveal'; J.t0 = J.t;
      if (lastP) Object.assign(lastP, { x: TB.x + 2.2, z: 67.8, yaw: Math.PI, sp: 0 }); addGold(10); tone(523, 0.05, 0.4); tone(659, 0.05, 0.5); tone(784, 0.05, 0.7);
      setCard('rv', head('ALL DONE', '+' + J.gold + ' GOLD') + '<div style="padding:8px 10px 10px">' + who(J.C) + row('#3f9a5e', 'CLEAN STEPS', J.clean + '/7', J.clean >= 5) + '<div style="font-size:13px;font-style:italic;padding-top:6px">"' + ['I can touch my toes! I have not seen them in a while.', 'Everything clicks. In a good way.', 'I feel like a brand new fox.'][J.ci % 3] + '"</div></div>'); }); }
  function giveGift(clean) { const n = save.stat('chClears', 0); save.setStat('chClears', n + 1); const nb = n === 0 ? 2 : 1 + (clean ? 1 : 0); save.give('limberBalm', nb); const out = { balm: nb, spine: false };
    if (!save.count('goldenSpine') && !save.stat('chSpine', false) && (clean || n + 1 >= 3)) { save.give('goldenSpine'); save.setStat('chSpine', true); out.spine = true; } return out; }
  function endVisit() { const gold = J.gold, nc = J.clean, clean = nc >= 5, first = !save.stat('chClears', 0), gift = giveGift(clean); save.best('chBest', gold); stop();
    toast('VISIT DONE · +' + gold + ' GOLD · LIMBER BALM' + (gift.balm > 1 ? ' \u00d7' + gift.balm : '') + (gift.spine ? ' + GOLDEN SPINE' : ''), 3.5);
    const op = ['Two centimetres taller. I measured.', 'Gentle and exact. Lovely work.', 'That back thanks you.', 'Breathe out. Well done.'][save.stat('chClears', 1) % 4]; limT.ry = lim.rotation.y;
    sayTo(limT, [lb(op + ' ' + gold + ' gold. Limber Balm' + (gift.balm > 1 ? ' \u00d7' + gift.balm : '') + ' for any ache.' + (gift.spine ? ' And a Golden Spine for your shelf!' : ''))]);
    SK.finish('visit', nc >= 6 ? 3 : nc >= 4 ? 2 : 1, gold, first); }
  function jobTick(dt) { J.t += dt; if (J.fade) return; if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0) nextStep(); return; }
    ({ knot: knotTick, crack: crackTick, spine: spineTick, tail: tailTick, mirror: mirrorTick, chair: chairTick, class: classTick })[J.step]?.(dt);
    if (J.step === 'reveal' && J.sub === 'reveal' && J.t - J.t0 > 3.2) endVisit(); }
  function onDown() { if (!J || J.pause > 0 || J.fade) return; if (J.sub === 'crack') crackTap(); else if (J.sub === 'chair') chairTap(); else if (J.sub === 'spine') spineDown(); }
  function drag(dt) { if (!J || J.pause > 0 || J.fade) return; const s = J.sub; if (s === 'knot') knotDrag(); else if (s === 'spine') spineDrag(); else if (s === 'tail') pathHit(dt);
    palm.visible = ptr.down && s === 'knot'; if (palm.visible) { rc.setFromCamera(new THREE.Vector2(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1), camera); const d = camera.position.distanceTo(J.body.localToWorld(V(0, 1.12, -0.38))) - 0.06; palm.position.copy(rc.ray.origin).addScaledVector(rc.ray.direction, d); } }
  const resetHead = f => { const h = f && f.userData && f.userData.P && f.userData.P.head; if (h) h.rotation.set(0, 0, 0); };
  function stop() { busy = null; if (J) { clearOver(); if (J.over.parent) J.over.parent.remove(J.over); const P = J.U.P; P.tail.rotation.z = 0; P.head.rotation.set(0, 0, 0); P.head.position.z = J.U.hz0; J.f.visible = false; J.f.scale.set(1, 1, 1); J.U.mood = J.U.base = 'neutral'; }
    J = null; ptr.down = false; palm.visible = false; CLASS.forEach(f => { f.visible = false; resetHead(f); }); resetHead(lastFox); resetHead(lim); limTo('idle'); roller.position.y = RY0; fadeEl.style.opacity = '0'; pops.splice(0).forEach(p => p.m.parent && p.m.parent.remove(p.m)); hideCard(); hidePick(); }
  // ---------- the next patient waits on the chairs ----------
  const hideWaiting = () => Object.values(custCache).forEach(f => { if (!J || f !== J.f) f.visible = false; });
  function showWaiting() { const f = custFox(nextIdx()); Object.values(custCache).forEach(o => { if (o !== f) o.visible = false; }); f.visible = true; f.position.set(-185.3, -0.02, 62.4); f.rotation.set(0, 0, 0); f.userData.wait = true; }
  // ---------- camera: a fixed shot per station (portrait: table steps from the head end so the back runs up the screen) ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT; else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  function view() { if (!J) return null; const port = (camera.aspect || 1) < 1, back = () => J.body.localToWorld(V(0, 1.12, -0.38));
    switch (J.step) {
      case 'knot': case 'crack': return [back(), port ? 2.6 : 5.4, port ? 4.8 : 3.4, 1.0, 5.0, port ? Math.PI / 2 : 0, 6.8];
      case 'spine': return [back(), port ? 2.2 : 4.4, port ? 4.2 : 2.8, 1.3, 4.4, port ? Math.PI / 2 : 0, 5.6];
      case 'tail': return [J.body.localToWorld(V(0, 0.7, -0.8)), 3.6, 3.0, 0.62, 4.2, 0, 6.0];
      case 'mirror': return J.pose === 'stand' ? [V(PM.x, 1.5, PM.z), 2.6, 3.6, 0.08, 4.4, 0.8, 5.2] : null;
      case 'chair': return J.pose === 'sit' ? [V(MC.x, 1.4, MC.z), 3.0, 3.2, 0.22, 4.4, 2.25, 5.2] : null;
      case 'class': return [V(-175.6, 1.6, 74.3), 6.6, 3.9, 0.5, 6.0, Math.PI, 8];
      case 'reveal': return [V(TB.x, 1.5, 68.4), 2.6, 3.6, 0.1, 4.4, Math.PI, 5.5]; } return null; }
  let lastV = null;
  let fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } }, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function camFix(cam, dt) { if (busy !== 'job' || !J) { camCur.on = false; lastV = null; lensOff(cam); return; } const v = view() || lastV; if (!v) return; lastV = v;
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
    fitCam(v); camT.pos.x = clamp(camT.pos.x, X0 + 0.35, X1 - 0.35); camT.pos.z = clamp(camT.pos.z, Z0 + 0.35, Z1 - 0.35);   // stay inside the walls (open top: height kept)
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } if (J.snap) { J.snap = false; camCur.pos.copy(camT.pos); camCur.look.copy(camT.look); }
    const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 - 0.3 && P.x < X1 + 0.3 && P.z > Z0 - 0.3 && P.z < Z1 && P.y < 2.5;
  const SPOT = { work: { x: TB.x, z: TB.z - 1.3, r: 1.0 } };   // s75: north of the table, on the line from the front door
  const RING = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.78, 32), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.9, depthWrite: false })); RING.rotation.x = -Math.PI / 2; RING.position.set(SPOT.work.x, 0.1, SPOT.work.z); RING.renderOrder = 2; G.add(RING);
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r;
  function prompt(P) { if (busy || !inShop(P)) return null; if (at(P, SPOT.work)) return 'NEXT PATIENT · 7 GENTLE STEPS'; if (SK.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, limT)) return 'TALK · DR. LIMBER'; return null; }
  const TIPS = ['A straight spine is just a happy spine standing up.', 'Noble asks me to fix his chair. I fix Noble. The chair is fine.', 'Most knots are worries with nowhere to go. We give them somewhere.',
    'Hope stretches every morning. She touches her toes with the end of her cane.', 'The class meets every hour. Everyone is welcome. Even Otto, who mostly naps.', 'Sit tall, ears over shoulders. Your neck will send you a thank-you card.'];
  const HELLO = ['Breathe in... and out. Welcome back.', 'Ah, kind paws. A back is waiting.', 'Shoulders down. Jaw soft. Hello again.', 'Good timing. Somebody is creaking.'];
  const goVisit = P => { if (busy) return; if (P) Object.assign(P, { x: SPOT.work.x, z: SPOT.work.z, sp: 0 }); startVisit(); };
  const menu = first => { limT.ry = lim.rotation.y; sayTo(limT, [{ ...lb(first ? 'Welcome. Breathe in... and out. I am Dr. Limber. Help me with a patient? Seven gentle steps.' : HELLO[talked % HELLO.length]),
    choices: [{ text: CHOICE_WORK, pick: () => goVisit(lastP) }, { text: 'A STRETCH TIP, PLEASE', pick: () => sayTo(limT, [lb(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); };
  function talk(P) { lastP = P; if (busy) return true; if (!inShop(P)) return false;
    if (at(P, SPOT.work)) { startVisit(); return true; }
    if (SK.atHiring(P)) { pop(); goVisit(P); return true; }
    if (!near(P, limT)) return false; pop(); menu(!talked++); return true; }
  const SK = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'chiro', color: GR, boardTitle: "Limber's best",
    room: { X0, X1, Z0, Z1 }, door: [-180, Z0 - 0.2], keeper: lim, keeperRy: -2.3,
    games: [{ k: 'visit', name: 'Patient visit', color: GR }], board: { x: X0 + 0.09, y: 2.6, z: 69.9, ry: Math.PI / 2, w: 1.3 },
    hiring: { x: -177.6, z: 62.0, ry: 0 }, hiringLine: '7 GENTLE STEPS', clock: { x: X1 - 0.09, y: 2.9, z: 65.2, ry: -Math.PI / 2 },
    sun: [{ x: -180, z: 62.6, w: 2.4, d: 2.6 }, { x: -173.7, z: 69, w: 2.4, d: 2.2 }], lamps: bulbs,
    browse: [[-173.4, 64.4, Math.PI], [-177.8, 71.2, 0], [-176.4, 74.8, 0], [-173.9, 72.4, Math.PI / 2]] });
  // ---------- HINT HAND: no input for 3 s → a pointer on the next target ----------
  const HAND = document.createElement('div'); HAND.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HAND.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.340l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HAND); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const HLAB = { knot: 'RUB HERE', crack: 'TAP ON GREEN', spine: 'DRAG ONTO THE LINE', tail: 'DRAG ALONG THE DOTS', chair: 'TAP ON THE YELLOW BAND' };
  const hintTick = t => { let h = null; if (performance.now() - lastIn > 3000 && busy === 'job' && J && J.pause <= 0 && !J.fade && !ptr.down && HLAB[J.sub]) {
      if (J.sub === 'tail') { const q = J.path && J.path.pts[J.path.i]; h = q ? scrL(q.p) : null; } else if (J.sub === 'chair') h = scrW(J.f.localToWorld(V(0, J.band, -0.3))); else h = API.targets()[0] || null; }
    if (!h || !(h[2] < 1)) { if (HAND.style.display !== 'none') HAND.style.display = 'none'; return; } const lab = HLAB[J.sub];
    const sc = t % 1.1 < 0.18 ? 0.82 : 1; HAND.style.display = 'block'; HAND.style.transform = 'translate(' + Math.round(h[0] - 17) + 'px,' + Math.round(h[1] - 4) + 'px) scale(' + sc + ')'; const l = HAND.lastElementChild; if (l.textContent !== lab) l.textContent = lab; };
  function quit() { stop(); toast('PATIENT SENT HOME · GOLD KEPT', 2); }
  // ---------- per frame ----------
  function tick(dt, P, fox) { const t = performance.now() / 1000, d = Math.hypot(P.x - CX, P.z - CZ); G.visible = d < (touch ? 45 : 90); toastT -= dt; lastP = P; lastFox = fox;
    if (busy === 'job' && !inShop(P)) stop(); if (busy === 'job' && fox) fox.visible = !!J && J.step === 'class' && !J.fade;
    if (!G.visible) return;
    if (busy === 'job' && J) jobTick(dt); if (!busy) showWaiting();
    for (let i = pops.length - 1; i >= 0; i--) { const q = pops[i]; q.t += dt; q.m.scale.setScalar(1 + q.t * 6); q.m.material.opacity = Math.max(0, 1 - q.t * 2.5); if (q.t > 0.4) { q.m.parent && q.m.parent.remove(q.m); pops.splice(i, 1); } }
    if (J && J.path) { const n = J.path.pts[J.path.i]; if (n) n.d.scale.setScalar(1.3 + Math.sin(t * 9) * 0.35); }
    const roll = J && J.step === 'class' && J.phase === 'roll';
    if (J && J.mv) for (const k of Object.keys(J.mv)) J.mv[k].t -= dt;
    SK.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: d, talking: !!J }); RING.visible = !busy; hintTick(t);   // s75: shop kit runs Limber's idle / wave / look-at outside a visit
    if (J) { const lk = J.step === 'class' ? 0 : Math.atan2(J.f.position.x - lim.position.x, J.f.position.z - lim.position.z);
      lim.rotation.y += Math.atan2(Math.sin(lk - lim.rotation.y), Math.cos(lk - lim.rotation.y)) * Math.min(1, dt * 3); if (J.step === 'class') headMove(lim, J.mv.lim, false, dt, roll); }
    if (J) { const f = J.f, Pp = J.U.P; kit.animFox && kit.animFox(f, dt, 0);
      if (J.pose === 'lie') { f.rotation.set(Math.PI / 2, Math.PI / 2, 0); Pp.body.position.y = 0; Pp.legs.forEach(l => { l.rotation.x = 0; }); Pp.arms.forEach(a => { a.rotation.x = 0; }); if (J.tdir) { J.tq.setFromUnitVectors(J.d0, J.tdir); Pp.tail.quaternion.copy(J.tq); } }
      else if (J.pose === 'sit') sitPose(f);
      else if (J.pose === 'stand') { f.rotation.set(0, J.yaw, 0); if (J.step === 'mirror') faultPose(); if (J.step === 'class') headMove(f, J.mv.cls, true, dt, roll); } }
    for (const f of CLASS) if (f.visible) { kit.animFox && kit.animFox(f, dt, 0); if (J && J.step === 'class') headMove(f, J.mv.cls, true, dt, roll); }
    if (J && J.step === 'class' && fox) headMove(fox, J.mv.me, true, dt, roll);
    if (!busy) for (const f of Object.values(custCache)) if (f.visible) { kit.animFox && kit.animFox(f, dt, 0); sitPose(f); } }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, startVisit, limber: lim, camera, camT, save, useItem: () => false,
    // test hooks: drive taps / drags from a script (screen coords) and jump between steps
    tap(x, y) { ptr.down = true; ptr.x = ptr.lx = x; ptr.y = ptr.ly = y; ptr.mv = 0; onDown(); drag(0); ptr.down = false; if (J) J.grab = null; },
    down(x, y) { ptr.down = true; ptr.x = ptr.lx = x; ptr.y = ptr.ly = y; ptr.mv = 0; onDown(); drag(0); },
    dragTo(x, y, dt = 0.05) { ptr.down = true; ptr.mv = Math.hypot(x - ptr.lx, y - ptr.ly); ptr.x = ptr.lx = x; ptr.y = ptr.ly = y; drag(dt); }, release() { ptr.down = false; palm.visible = false; if (J) J.grab = null; },
    targets() { if (!J) return []; if (J.sub === 'knot') return J.knots.filter(k => !k.done).slice(0, 1).map(k => scrL(k.p)); if (J.sub === 'crack') return J.cr.filter(k => !k.done).slice(0, 1).map(k => scrL(k.p));
      if (J.sub === 'spine') return J.bones.filter(b => !b.done).map(b => scrW(b.m.getWorldPosition(V()))); if (J.sub === 'tail' && J.path) return J.path.pts.map(q => scrL(q.p)); return []; },
    lineX() { return J && J.sub === 'spine' ? scrW(J.body.localToWorld(V(0, 1.13, J.bones[0].m.position.z))) : null; }, ringIn: () => J && J.sub === 'crack' ? inWin(ringS()) : false, chairOn: () => J && J.sub === 'chair' && Math.abs(J.ry - J.band) < 0.075,
    faultGo: k => faultGo(k), fault: () => J && J.faults && J.faults[J.fi], copyGo: m => copyGo(m), want: () => J && J.seq && J.seq[J.cp],
    skipTo(s) { if (!J) startVisit(); J.pause = 0; J.fade = false; hidePick(); if (['knot', 'crack', 'spine', 'tail'].includes(s)) layOnTable(); J.step = STEPS[STEPS.indexOf(s) - 1] || null; if (s === 'reveal') { J.step = 'class'; } nextStep(); },
    dispose() { card.remove(); pick.remove(); fadeEl.remove(); HAND.remove(); SK.dispose(); } };
  window.__chiro = API; return API;
}
