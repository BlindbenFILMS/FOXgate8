import { applyPose, endPose, applyD, lifeD } from '../engine/fox-poses.js?v=s648k';   // s622 jointed guard salute
// MERU 2.0 — s113 CASTLE DELUXE PART C2 (Ben's LIFE / LOOK list, s97). Built + ticked inside worlds/meru2-castle-jobs.js as LF.
// THE KING'S DAY (after Max is home; before that the King keeps his spot by the throne):
//   0700-0800 up and about · 0800-1200 COURT on the throne, petitioners queue on the carpet and bow · 1200-1400 COUNCIL at the head of the council table
//   1400-1830 AUDIENCES (standing by the throne, courtiers stroll, a visitor at the gallery) · 1830-2100 ROYAL DINNER (council room: diners, dishes,
//   a lute player + a drummer, a juggling JESTER, a quiet tune) · 2100-2200 by the throne, a courtier warms paws at the brazier · 2200-0700 the King DOZES on the throne (Z's).
// PRINCE MAX (once home) wanders hall → library → treasury door → council door, stops, looks at you; sits at council + dinner; in bed at night.
// CHANGING OF THE GUARD at the gate at 0600 / 1400 / 2200 (relief pair marches out of the keep, salute, the old pair marches in).
// ROSE WINDOW over the hall door: stained glass by the hour, a coloured SUN SHAFT + floor patch 0900-1700 with motes; the side windows throw stained patches
// (east in the morning, west in the afternoon) and go dark at night. CANDLES: chandeliers lit 1800-0700 (flames + warm pools), capped by day.
// FIRES: council fireplace, dais braziers, courtyard braziers flicker; crackle near the fireplace. FLAGS ripple in the wind on every tower.
// THE KING'S DAY board inside the hall door (the row that is on NOW in red). Everything hides / goes home while a castle job runs (release()).
export function casLife(X) {
  const { THREE, G, scene, kit, LM, CT, box, cyl, touch, hour, tone, noise, toast, camera, save, castle, IX, IZ, IY, OY, C } = X;
  const INK = '#201e1d', RED = '#ec3013', WHITE = '#f3f2f2', GOLD = '#e6b45a', NAVY = '#1f2650', IRON = '#3d3b3a';
  const hr = () => { const h = hour ? hour() : 12; return ((h % 24) + 24) % 24; };
  const PI = Math.PI, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), WX = lx => IX + lx, WZ = lz => IZ + lz;
  const king = castle.king || null, max = castle.max || null, sentries = castle.sentries || [], flags = castle.flags || [];
  const K0 = king ? { p: king.position.clone(), ry: king.rotation.y } : null, M0 = max ? { p: max.position.clone(), ry: max.rotation.y } : null;
  const dotT = CT(32, 32, (g, w) => { const r = g.createRadialGradient(16, 16, 1, 16, 16, 15); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const addM = (opts) => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, ...opts });
  // ================= ROSE WINDOW (hall south wall, over the door) =================
  const RZ = WZ(19.6), RY = 8.6, RR = 1.7, RN = 24;
  const roseT = CT(256, 256, (g, w) => { const c = w / 2, R = 120, COL = ['#c8243a', '#2a4aa8', '#e6b42a', '#2e8a4a'];
    g.fillStyle = '#1a1820'; g.fillRect(0, 0, w, w); for (let i = 0; i < 12; i++) { const a0 = i / 12 * PI * 2, a1 = (i + 1) / 12 * PI * 2; g.fillStyle = COL[i % 4]; g.beginPath(); g.arc(c, c, R, a0, a1); g.arc(c, c, R * 0.55, a1, a0, true); g.closePath(); g.fill(); }
    for (let i = 0; i < 6; i++) { const a0 = i / 6 * PI * 2 + 0.26, a1 = (i + 1) / 6 * PI * 2 + 0.26; g.fillStyle = COL[(i + 2) % 4]; g.beginPath(); g.arc(c, c, R * 0.55, a0, a1); g.arc(c, c, R * 0.22, a1, a0, true); g.closePath(); g.fill(); }
    g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(c, c, R * 0.22, 0, 7); g.fill(); g.strokeStyle = '#1a1820'; g.lineWidth = 5; for (const r of [R, R * 0.55, R * 0.22]) { g.beginPath(); g.arc(c, c, r, 0, 7); g.stroke(); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * R * 0.22, c + Math.sin(a) * R * 0.22); g.lineTo(c + Math.cos(a) * R, c + Math.sin(a) * R); g.stroke(); } });
  const roseM = new THREE.MeshBasicMaterial({ map: roseT, color: 0xffffff });
  { const m = new THREE.Mesh(new THREE.CircleGeometry(RR, 32), roseM); m.position.set(WX(0), RY, RZ - 0.02); m.rotation.y = PI; G.add(m);
    const fr = new THREE.Mesh(new THREE.RingGeometry(RR, RR + 0.28, 32), LM('#bdb6cc')); fr.position.set(WX(0), RY, RZ - 0.04); fr.rotation.y = PI; G.add(fr);
    box(G, 0.12, 2 * RR, 0.06, '#1a1820', WX(0), RY, RZ - 0.05); box(G, 2 * RR, 0.12, 0.06, '#1a1820', WX(0), RY, RZ - 0.05); }
  // rose shaft (projected rim) + floor patch (projected fan) + motes
  const RCOL = [[0.55, 0.12, 0.16], [0.14, 0.24, 0.55], [0.6, 0.48, 0.14], [0.16, 0.42, 0.22]];
  const shG = new THREE.BufferGeometry(), shP = new Float32Array(RN * 2 * 3), shC = new Float32Array(RN * 2 * 3), shI = [];
  for (let i = 0; i < RN; i++) { const c = RCOL[(i >> 1) % 4]; shC.set(c, i * 3); shC.set(c.map(v => v * 0.45), (RN + i) * 3); const n = (i + 1) % RN; shI.push(i, n, RN + n, i, RN + n, RN + i); }
  shG.setAttribute('position', new THREE.BufferAttribute(shP, 3)); shG.setAttribute('color', new THREE.BufferAttribute(shC, 3)); shG.setIndex(shI);
  const shaft = new THREE.Mesh(shG, addM({ vertexColors: true, opacity: 0, side: THREE.DoubleSide })); shaft.frustumCulled = false; shaft.renderOrder = 3; shaft.visible = false; G.add(shaft);
  const ptG = new THREE.BufferGeometry(), ptP = new Float32Array((RN + 2) * 3), ptU = new Float32Array((RN + 2) * 2), ptI = [];
  ptU.set([0.5, 0.5], 0); for (let i = 0; i <= RN; i++) { const a = i / RN * PI * 2; ptU.set([0.5 + 0.5 * Math.cos(a), 0.5 + 0.5 * Math.sin(a)], (i + 1) * 2); if (i < RN) ptI.push(0, i + 1, i + 2); }
  ptG.setAttribute('position', new THREE.BufferAttribute(ptP, 3)); ptG.setAttribute('uv', new THREE.BufferAttribute(ptU, 2)); ptG.setIndex(ptI);
  const patch = new THREE.Mesh(ptG, addM({ map: roseT, opacity: 0, side: THREE.DoubleSide })); patch.frustumCulled = false; patch.renderOrder = 2; patch.visible = false; G.add(patch);
  let sun = null; // { dx, dz, tn }
  const proj = (px, py, s) => { const L = (RY + py - 0.05) / s.tn; return [WX(px) + s.dx * L, 0.05, RZ + s.dz * L]; };
  const setRose = s => { for (let i = 0; i < RN; i++) { const a = i / RN * PI * 2, px = Math.cos(a) * RR, py = Math.sin(a) * RR; shP.set([WX(px), RY + py, RZ - 0.05], i * 3); shP.set(proj(px, py, s), (RN + i) * 3); }
    shG.attributes.position.needsUpdate = true; ptP.set(proj(0, 0, s), 0); for (let i = 0; i <= RN; i++) { const a = i / RN * PI * 2; ptP.set(proj(-Math.cos(a) * RR, Math.sin(a) * RR, s), (i + 1) * 3); } ptG.attributes.position.needsUpdate = true; };
  const NM = touch ? 36 : 80, mPos = new Float32Array(NM * 3), MOTE = [...Array(NM)].map(() => ({ a: Math.random() * 7, r: Math.sqrt(Math.random()) * RR, s: Math.random(), ph: Math.random() * 7 }));
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({ map: dotT, size: 0.07, color: '#fff3d0', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); motes.frustumCulled = false; motes.visible = false; G.add(motes);
  // ================= SIDE WINDOWS: stained floor patches by day, dark panes at night =================
  const SWIN = { E: [-15, 1.5, 16].map(z => [9.6, z]), W: [-15, 3, 13].map(z => [-9.6, z]) };
  const stT = CT(64, 128, (g, w, h) => { const COL = ['#2a4aa8', '#c8243a', '#e6b42a', '#2e8a4a']; for (let i = 0; i < 3; i++) for (let j = 0; j < 6; j++) { g.fillStyle = COL[(i + j) % 4]; g.fillRect(i * w / 3, j * h / 6, w / 3, h / 6); } g.strokeStyle = '#000'; g.lineWidth = 3; for (let i = 0; i <= 3; i++) { g.beginPath(); g.moveTo(i * w / 3, 0); g.lineTo(i * w / 3, h); g.stroke(); } for (let j = 0; j <= 6; j++) { g.beginPath(); g.moveTo(0, j * h / 6); g.lineTo(w, j * h / 6); g.stroke(); } });
  const sideM = addM({ map: stT, opacity: 0, side: THREE.DoubleSide }), SP = { E: [], W: [] };
  for (const sd of ['E', 'W']) for (const [x, z] of SWIN[sd]) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3)); g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), 2)); g.setIndex([0, 1, 3, 0, 3, 2]);
    const m = new THREE.Mesh(g, sideM); m.frustumCulled = false; m.renderOrder = 2; m.visible = false; m.userData.w = [x, z]; G.add(m); SP[sd].push(m); }
  const setSide = (sd, tn) => SP[sd].forEach(m => { const [x, z] = m.userData.w, s = sd === 'E' ? -1 : 1, p = m.geometry.attributes.position.array, fx = y => WX(clamp(x + s * y / tn, -9.6, 9.6));
    p.set([fx(4.1), 0.05, WZ(z - 0.65), fx(4.1), 0.05, WZ(z + 0.65), fx(8.1), 0.05, WZ(z - 0.65), fx(8.1), 0.05, WZ(z + 0.65)]); m.geometry.attributes.position.needsUpdate = true; });
  const nightM = new THREE.MeshBasicMaterial({ color: '#1d2742', transparent: true, opacity: 0 }), NIGHT = [];
  for (const sd of ['E', 'W']) for (const [x0, z] of SWIN[sd]) { const x = Math.sign(x0) * 9.62, ry = x > 0 ? -PI / 2 : PI / 2;
    const a = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 4.0), nightM); a.position.set(WX(x), 6.1, WZ(z)); a.rotation.y = ry; G.add(a); const b = new THREE.Mesh(new THREE.CircleGeometry(0.65, 14, 0, PI), nightM); b.position.set(WX(x), 8.1, WZ(z)); b.rotation.y = ry; G.add(b); NIGHT.push(a, b); }
  const sideSun = h => { if (h >= 7 && h < 11.5) return { sd: 'E', e: 15 + (h - 7) / 4.5 * 40, k: Math.min(1, h - 7) }; if (h >= 12.5 && h < 18) return { sd: 'W', e: 55 - (h - 12.5) / 5.5 * 40, k: Math.min(1, 18 - h) }; return null; };
  // ================= CANDLES (castle.js chandeliers): caps by day, flames + warm pools at night =================
  const CHS = [[0, -6, 8, 1.6, 10], [0, 6, 8, 1.6, 10], [-17.5, -6.5, 5, 1.2, 8], [20, -7, 5, 1.4, 10], [16, 10, 4.2, 1.0, 8]], CP = [];
  CHS.forEach(([lx, lz, y, r, n]) => { for (let i = 0; i < n; i++) { const a = i / n * PI * 2; CP.push([WX(lx + Math.cos(a) * r), y + 0.27, WZ(lz + Math.sin(a) * r)]); } });
  const caps = new THREE.InstancedMesh(new THREE.SphereGeometry(0.085, 6, 4), LM('#efe8d6'), CP.length); { const mt = new THREE.Matrix4(); CP.forEach((p, i) => { mt.makeTranslation(p[0], p[1] - 0.01, p[2]); caps.setMatrixAt(i, mt); }); } G.add(caps);
  const flP = new Float32Array(CP.length * 3), flG = new THREE.BufferGeometry(); flG.setAttribute('position', new THREE.BufferAttribute(flP, 3));
  const flames = new THREE.Points(flG, new THREE.PointsMaterial({ map: dotT, size: 0.2, color: '#ffc45a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); flames.frustumCulled = false; G.add(flames);
  const HALO = CHS.map(([lx, lz, y, r]) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotT, color: '#ffb860', transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(r * 3.2); s.position.set(WX(lx), y + 0.3, WZ(lz)); G.add(s);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2), addM({ map: dotT, color: '#ffb860', opacity: 0.2 })); p.scale.setScalar(r * 4.5); p.position.set(WX(lx), 0.04, WZ(lz)); p.renderOrder = 2; G.add(p); return [s, p]; });
  const candlesLit = h => h >= 18 || h < 7;
  // ================= FIRES =================
  const FL = [], fM = [addM({ color: '#ff6a1a', opacity: 0.85 }), addM({ color: '#ffd23a', opacity: 0.9 })], cone = new THREE.ConeGeometry(0.16, 0.5, 7); cone.translate(0, 0.25, 0);
  const flame = (par, x, y, z, s) => { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); par.add(g); [[0, 0, 1, 0], [-0.1, 0.03, 0.7, 0], [0.1, -0.03, 0.75, 0], [0, 0, 0.55, 1]].forEach(([dx, dz, k, m]) => { const c = new THREE.Mesh(cone, fM[m]); c.position.set(dx, 0, dz); c.scale.setScalar(k); g.add(c); });
    g.userData.ph = Math.random() * 9; g.userData.s = s; FL.push(g); return g; };
  for (const dx of [-0.5, 0, 0.5]) flame(G, WX(20 + dx), 0.04, WZ(-0.92), dx ? 0.75 : 1);
  const hearth = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2), addM({ map: dotT, color: '#ff9a4a', opacity: 0.28 })); hearth.scale.set(4.5, 1, 3.2); hearth.position.set(WX(20), 0.045, WZ(-2)); hearth.renderOrder = 2; G.add(hearth);
  for (const s of [-1, 1]) flame(G, WX(s * 5.4), 1.45, WZ(-12.4), 0.85);
  const GO = new THREE.Group(); GO.name = 'castleLifeOut'; scene.add(GO); const KX1 = C.keep[1], DZ = C.keepDoor[1], OFL = [];
  for (const z of [DZ - 5.4, DZ + 5.4]) OFL.push(flame(GO, KX1 + 2.2, OY + 1.4, z, 0.9));
  // ================= FLAGS: segmented cloth that ripples =================
  const FLG = flags.map((g, k) => { const [cl, gd] = g.children, P0 = cl.geometry.parameters, P1 = gd.geometry.parameters, w = P0.width;
    cl.geometry.dispose(); cl.geometry = new THREE.BoxGeometry(w, P0.height, P0.depth, 10, 1, 1).translate(w / 2, 0, 0); gd.geometry.dispose(); gd.geometry = new THREE.BoxGeometry(P1.width, P1.height, P1.depth, 3, 1, 1).translate(w / 2, 0, 0);
    return { g, w, ph: k * 1.7, parts: [cl, gd].map(m => ({ m, b: Float32Array.from(m.geometry.attributes.position.array) })) }; });
  // ================= THE KING'S DAY board (hall, inside the door, east) =================
  const ROWS = [['0700 - 0800', 'THE KING WAKES', 'THE HALL', 7, 8], ['0800 - 1200', 'COURT', 'THE THRONE \u00b7 PETITIONS', 8, 12], ['1200 - 1400', 'COUNCIL', 'COUNCIL ROOM', 12, 14], ['1400 - 1830', 'AUDIENCES', 'THE HALL \u00b7 COURTIERS', 14, 18.5],
    ['1830 - 2100', 'ROYAL DINNER', 'COUNCIL ROOM \u00b7 MUSIC \u00b7 JESTER', 18.5, 21], ['0600 \u00b7 1400 \u00b7 2200', 'CHANGING OF THE GUARD', 'THE GATE', -1, -1], ['2200 - 0700', 'THE KING DOZES', 'THE THRONE', 22, 31]];
  const rowOn = (r, h) => { const hh = h < 7 ? h + 24 : h; if (r[3] < 0) return [6, 14, 22].some(q => h >= q && h < q + 0.5); return hh >= r[3] && hh < r[4]; };
  const bdT = CT(512, 384, () => {}), bdC = bdT.userData.c;
  const drawBoard = h => { const g = bdC.getContext('2d'), w = bdC.width, H = bdC.height; g.fillStyle = WHITE; g.fillRect(0, 0, w, H); g.fillStyle = INK; g.fillRect(0, 0, w, 52); g.fillStyle = RED; g.fillRect(0, 52, w, 4);
    g.fillStyle = WHITE; g.font = '900 26px Archivo, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('THE KING\u2019S DAY', 16, 27); g.font = '700 16px Archivo, sans-serif'; g.textAlign = 'right'; g.fillText('MERU CASTLE', w - 16, 28); g.textAlign = 'left';
    const rh = 46; ROWS.forEach((r, i) => { const y = 60 + i * rh, on = rowOn(r, h); if (on) { g.fillStyle = RED; g.fillRect(0, y, w, rh - 2); } g.fillStyle = on ? WHITE : INK; g.font = '900 15px Archivo, sans-serif'; g.fillText(r[0], 14, y + rh / 2 - 1);
      g.font = '900 18px Archivo, sans-serif'; g.fillText(r[1], 176, y + rh / 2 - 9); g.font = '600 13px Archivo, sans-serif'; g.fillText(r[2], 176, y + rh / 2 + 10); if (on) { g.font = '900 15px Archivo, sans-serif'; g.textAlign = 'right'; g.fillText('NOW', w - 14, y + rh / 2 - 1); g.textAlign = 'left'; }
      if (!on && i < ROWS.length - 1) { g.fillStyle = INK; g.fillRect(14, y + rh - 2, w - 28, 2); } }); bdT.needsUpdate = true; };
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.65), new THREE.MeshBasicMaterial({ map: bdT, color: 0xeeeeee })); m.position.set(WX(7.4), 2.4, WZ(19.64)); m.rotation.y = PI; G.add(m); box(G, 2.36, 1.81, 0.04, INK, WX(7.4), 2.4, WZ(19.68)); }
  let bdKey = '';
  // ================= PEOPLE =================
  const LOOKS = { rose: [['#a8323e', '#e6b45a', '#3a0d12'], 'dress', {}], hugo: [['#2f4a6a', '#c0c4cc', '#151c22'], 'coat', { fur: '#8a8a8a', furDark: '#5a5a5a', muzzle: '#e8e8e8' }], oak: [['#2f7a4a', '#e6b45a', '#1e3a26'], 'coat', { fur: '#8a5a32', furDark: '#5a3a1e' }],
    tide: [['#2e5a8a', '#f3efe2', '#15222e'], 'dress', { fur: '#e8e0d6', furDark: '#b8ac9e', muzzle: '#ffffff' }], c1: [['#5e3a96', '#e6b45a', '#211a2b'], 'coat', {}], c2: [['#2e8a8a', '#f3efe2', '#103a3a'], 'dress', { fur: '#c9a46a', furDark: '#9a7a46' }],
    c3: [['#a8323e', '#f3efe2', '#3a0d12'], 'coat', { fur: '#5a4a3a', furDark: '#3a2e22' }], p0: [['#8a6a2a', '#5a4a2a', '#2a2010'], 'vest', {}], p1: [['#2e5a7a', '#c9a46a', '#15222e'], 'coat', { fur: '#b8b0a6', furDark: '#857b70' }],
    p2: [['#f3efe2', '#c9a46a', '#6b4a32'], 'vest', { fur: '#e0a060', furDark: '#a86a30' }], p3: [['#6b2a5a', '#e6b45a', '#2a1022'], 'robe', {}], p4: [['#52525b', '#3d2a1c', '#111111'], 'vest', { fur: '#5a4a3a', furDark: '#3a2e22' }],
    lute: [['#2f7a4a', '#ffd23a', '#1e3a26'], 'vest', { fur: '#c9a46a', furDark: '#9a7a46' }], drum: [['#1f2650', '#ec3013', '#0a0e22'], 'vest', {}], jest: [['#ffd23a', '#ec3013', '#1f2650'], 'robe', { fur: '#e0a060', furDark: '#a86a30' }] };
  const FX = {}, mk = k => { if (FX[k]) return FX[k]; const [torso, outfit, look] = LOOKS[k]; const f = kit.makeFox({ joints: true, key: 'casLife_' + k, torso, crest: 'M', outfit, gear: 'none', mood: 'warm', look }); f.visible = false; f.userData.ph = Math.random() * 9; G.add(f);
    if (k === 'jest') { const H = f.userData.P && f.userData.P.head; if (H) for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.44, 8), LM(s > 0 ? '#ffd23a' : '#ec3013')); c.position.set(s * 0.17, 0.36, 0); c.rotation.z = -s * 1.0; H.add(c); const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), LM(GOLD)); b.position.set(s * 0.37, 0.48, 0); H.add(b); } }
    if (k === 'lute' && f.userData.P) { const g = new THREE.Group(); g.position.set(0.04, 1.0, 0.3); g.rotation.z = 0.9; const bd = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), LM('#8a5a2a')); bd.scale.set(1, 1.2, 0.45); g.add(bd); const nk = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.03), LM('#4a2e18')); nk.position.y = 0.38; g.add(nk); f.userData.P.body.add(g); }
    if (k === 'drum' && f.userData.P) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.26, 14), LM('#a8323e')); d.position.set(0, 0.82, 0.34); f.userData.P.body.add(d); const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.02, 14), LM('#efe8d6')); hd.position.set(0, 0.96, 0.34); f.userData.P.body.add(hd); }
    return (FX[k] = f); };
  const balls = [0, 1, 2].map(i => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), LM(['#ec3013', '#ffd23a', '#2a4aa8'][i])); b.visible = false; G.add(b); return b; });
  const dishes = new THREE.Group(); dishes.visible = false; G.add(dishes);
  { const T = 0.86; for (const [x, z] of [[16, -6.0], [18, -8.0], [20, -6.0], [22, -8.0], [24, -6.0], [25.3, -7]]) { cyl(dishes, 0.19, 0.17, 0.03, '#f3efe2', WX(x), T + 0.015, WZ(z), 14); cyl(dishes, 0.05, 0.04, 0.2, GOLD, WX(x + 0.35), T + 0.1, WZ(z), 8); }
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), LM('#8a4a1e')); r.scale.y = 0.6; r.position.set(WX(20), T + 0.12, WZ(-7)); dishes.add(r); cyl(dishes, 0.4, 0.36, 0.04, GOLD, WX(20), T + 0.02, WZ(-7), 16);
    cyl(dishes, 0.24, 0.22, 0.1, '#d6a04a', WX(17.6), T + 0.05, WZ(-7), 14); cyl(dishes, 0.2, 0.2, 0.08, '#c8243a', WX(22.4), T + 0.04, WZ(-7), 14); }
  const zT = CT(64, 64, (g, w) => { g.fillStyle = WHITE; g.strokeStyle = INK; g.lineWidth = 6; g.font = '900 48px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeText('Z', w / 2, w / 2 + 2); g.fillText('Z', w / 2, w / 2 + 2); });
  const ZZ = [0, 1, 2].map(i => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zT, transparent: true, depthWrite: false })); s.visible = false; s.userData.t = i / 3; scene.add(s); return s; });
  const resetPose = f => { f.rotation.x = 0; f.rotation.z = 0; const P = f.userData.P; if (P && (f.userData._salJ || f.userData._lifeJ)) { f.userData._salJ = 0; f.userData._lifeJ = 0; endPose(f); } if (P) { P.legs.forEach(l => l.rotation.set(0, 0, 0)); P.arms.forEach(a => a.rotation.set(0, 0, 0)); P.body.rotation.x = 0; if (P.head) P.head.rotation.set(0, 0, 0); } };
  const turn = (f, a, k) => { let d = a - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, k); };
  // actors: { f, kind, path:[[wx,wz,wait,ry]], v, y, ... }  (G children use world x/z + floor-relative y; the King + Max live in the scene at IY + y)
  let A = [];
  const act = (f, o) => { const a = { f, kind: 'stand', path: [], v: 1.3, wait: 0, y: 0, sc: f.parent === G ? 0 : IY, ...o }; f.visible = true; f.userData.ownAnim = true; f.userData.lifeHide = false; resetPose(f); A.push(a); return a; };
  const at = (a, lx, lz, ry, y = a.y) => { a.f.position.set(WX(lx), a.sc + y, WZ(lz)); if (ry != null) a.f.rotation.y = ry; a.y = y; };
  const SEATY = 0.17, THRONE = [0, -18.45, 0.78], HEAD = [26.5, -7, 0.22];
  const SEATS = { rose: [18, -8.95, 0], hugo: [22, -8.95, 0], oak: [20, -5.05, PI], max: [16, -5.05, PI], tide: [24, -5.05, PI] };
  const MAXP = [[-2.4, -12.5, 3], [-2.5, -4, 1], [-8, -6, 2], [-11.5, -5, 0], [-15, -1, 4], [-11.5, -5, 0], [-8, -6, 0], [2.5, 4, 1], [2.5, 12.5, 2], [8, 10, 1], [12, 10, 4], [8, 10, 0], [8, -7, 1], [11.8, -7, 4], [8, -7, 0], [-2.5, -4, 2]];
  const PQ = [-10.6, -9.0, -7.4, -5.8], DOOR = [0, 18.6];
  const slotOf = h => (h >= 22 || h < 7 ? 'night' : h < 8 ? 'morn' : h < 12 ? 'court' : h < 14 ? 'council' : h < 18.5 ? 'aud' : h < 21 ? 'dinner' : 'eve');
  const story = () => !!save.flag('maxHome') && !save.flag('maxFollowing');
  let force = null, slot, hidden = false, Q = [], qT = 0, pPool = ['p0', 'p1', 'p2', 'p3', 'p4'], spk = 0, spkT = 0;
  function homeKing() { if (!king || !K0) return; king.position.copy(K0.p); king.rotation.y = K0.ry; king.userData.ownAnim = false; resetPose(king); }
  function homeMax() { if (!max || !M0) return; max.position.copy(M0.p); max.rotation.y = M0.ry; max.userData.ownAnim = false; max.userData.lifeHide = false; resetPose(max); }
  function clear() { for (const a of A) { a.f.userData.ownAnim = false; resetPose(a.f); if (a.f.parent === G) a.f.visible = false; } A = []; Q = []; balls.forEach(b => { b.visible = false; }); dishes.visible = false; ZZ.forEach(z => { z.visible = false; }); homeKing(); homeMax(); }
  function place(s) { clear(); slot = s; if (s == null) return; const st = story(), few = touch;
    if (st && king) { const k = act(king, { kind: 'king' }); if (s === 'court' || s === 'night') { k.kind = s === 'night' ? 'doze' : 'throne'; at(k, THRONE[0], THRONE[1], 0, THRONE[2]); } else if (s === 'council' || s === 'dinner') { k.kind = 'sit'; at(k, HEAD[0], HEAD[1], -PI / 2, HEAD[2]); } else { at(k, K0.p.x - IX, K0.p.z - IZ, K0.ry, K0.p.y - IY); }
      if (s === 'night') ZZ.forEach(z => { z.visible = true; }); }
    if (st && max) { if (s === 'night') { max.userData.lifeHide = true; max.visible = false; } else if (s === 'council' || s === 'dinner') { const m = act(max, { kind: 'sit' }); const [x, z, ry] = SEATS.max; at(m, x, z, ry, SEATY); } else { const m = act(max, { kind: 'max', i: 0, v: 1.1 }); at(m, MAXP[0][0], MAXP[0][1], 0, 0.6); m.path = [[WX(MAXP[1][0]), WZ(MAXP[1][1]), MAXP[1][2]]]; m.i = 1; } }
    if (s === 'court') { pPool = ['p0', 'p1', 'p2', 'p3', 'p4']; for (let i = 0; i < (few ? 2 : 3); i++) { const a = act(mk(pPool.shift()), { kind: 'pet', q: i }); at(a, 0, PQ[i], PI, 0); Q.push(a); } qT = 14; }
    if (s === 'council' || s === 'dinner') { for (const k of ['rose', 'hugo', 'oak', ...(s === 'dinner' ? ['tide'] : [])]) { const a = act(mk(k), { kind: 'sit', who: k }); const [x, z, ry] = SEATS[k]; at(a, x, z, ry, SEATY); } spk = 0; spkT = 3.5; }
    if (s === 'dinner') { dishes.visible = true; at(act(mk('lute'), { kind: 'lute' }), 28.3, -11.6, Math.atan2(-8.3, 4.6), 0); at(act(mk('drum'), { kind: 'drum' }), 28.3, -2.4, Math.atan2(-8.3, -4.6), 0);
      const j = act(mk('jest'), { kind: 'jest', v: 0.9 }); at(j, 16, -11.6, PI / 2, 0); j.path = [[WX(24), WZ(-11.6), 3]]; balls.forEach(b => { b.visible = true; }); }
    if (s === 'aud' || (s === 'court' && !few)) { const c1 = act(mk('c1'), { kind: 'walk', loop: [[-8, -12, 3, -PI / 2], [-8, 3, 4, -PI / 2], [-8, 12, 3, -PI / 2], [-8, 3, 2, -PI / 2]], li: 0, v: 0.8 }); at(c1, -8, -12, 0, 0);
      if (!few || s === 'aud') { const g = act(mk('c2'), { kind: 'gallery' }); at(g, -8.3, -14.6, -PI / 2, 0); } }
    if (s === 'aud' && !few) { const c3 = act(mk('c3'), { kind: 'walk', loop: [[8, -12, 3, PI / 2], [8, 1.5, 4, PI / 2], [8, 6, 3, PI], [8, 1.5, 2, PI / 2]], li: 0, v: 0.75 }); at(c3, 8, 6, PI, 0); }
    if (s === 'eve') { const a = act(mk('c3'), { kind: 'warm' }); at(a, -4.1, -11.2, Math.atan2(-1.3, -1.2), 0); } }
  function release() { hidden = true; clear(); slot = undefined; }
  // walk an actor along its path; returns true when idle
  const stepA = (a, dt) => { const f = a.f; if (a.wait > 0) { a.wait -= dt; kit.animFox(f, dt, 0, false); return a.wait <= 0 && !a.path.length; }
    if (!a.path.length) { kit.animFox(f, dt, 0, false); return true; } const [tx, tz, wt, ry] = a.path[0], dx = tx - f.position.x, dz = tz - f.position.z, d = Math.hypot(dx, dz);
    if (d < 0.06) { a.path.shift(); a.wait = wt || 0; if (ry != null) a.face = ry; else a.face = null; kit.animFox(f, dt, 0, false); return false; }
    const m = Math.min(d, a.v * dt); f.position.x += dx / d * m; f.position.z += dz / d * m; turn(f, Math.atan2(dx, dz), dt * 8); kit.animFox(f, dt, a.v, false); return false; };
  // ================= CHANGING OF THE GUARD =================
  const GL = { torso: ['#1e3a8a', '#1e3a8a', '#172554'], gear: 'sword', mood: 'stern' };
  const relief = [0, 1].map(i => { const f = kit.makeFox({ key: 'casLife_relief' + i, joints: true, torso: GL.torso, crest: 'M', gear: 'sword', outfit: 'armor', mood: 'stern' }); f.visible = false; GO.add(f); return f; });
  const S0 = sentries.map(f => ({ p: f.position.clone(), ry: f.rotation.y }));
  let GC = null;
  function guardChange(silent) { if (GC || sentries.length < 2) return; const h = Math.round(hr()) % 24; if (!silent) toast('CHANGING OF THE GUARD \u00b7 ' + String(h).padStart(2, '0') + '00', 2.6);
    const kd = [KX1 + 2.4, DZ], gx = S0[0].p.x;
    GC = { t: 0, ph: 'in', m: relief.map((f, i) => { const s = Math.sign(S0[i].p.z - DZ) || (i ? 1 : -1); f.position.set(kd[0], OY, kd[1] + s * 0.7); f.rotation.y = PI / 2; f.visible = true; resetPose(f);
      return { f, v: 1.5, wait: 0, path: [[gx - 3.5, DZ + s * 0.7], [gx - 1.7, S0[i].p.z, 0, PI / 2]], s }; }) }; }
  function guardTick(dt, t, near) { if (!GC) return; GC.t += dt; const beat = Math.floor(GC.t / 0.45); if (beat !== GC.b) { GC.b = beat; if (near < 60 && GC.ph !== 'salute') tone(92, 0.045, 0.1, 'sine'); }
    const march = a => { const done = stepA(a, dt); const Q2 = a.f.userData.P; if (Q2 && !done) { if (Q2.fore) { applyD(THREE, a.f, lifeD('march', t), t, 1); a.f.userData._lifeJ = 1; } else { Q2.arms[0].rotation.x *= 0.4; Q2.arms[1].rotation.x *= 0.4; } } if (done && a.face != null) turn(a.f, a.face, dt * 6); return done; };
    if (GC.ph === 'in') { const d = GC.m.map(march); if (d.every(Boolean)) { GC.ph = 'salute'; GC.t = 0; if (near < 70) { tone(523, 0.03, 0.2, 'triangle'); tone(784, 0.03, 0.45, 'triangle', 0.22); } } return; }
    if (GC.ph === 'salute') { [...GC.m.map(a => a.f), ...sentries].forEach(f => { f.userData.ownAnim = true; kit.animFox(f, dt, 0, false); const Q2 = f.userData.P; if (Q2 && Q2.fore) { applyPose(THREE, f, 'salute', Math.min(GC.t, 1.6), Math.min(1, GC.t * 3)); f.userData._salJ = 1; } else if (Q2) { Q2.arms[1].rotation.x = -2.5; Q2.arms[1].rotation.z = 0.5; } }); GC.m.forEach(a => turn(a.f, a.f.position.z < DZ ? 0 : PI, dt * 6)); sentries.forEach(f => turn(f, f.position.z < DZ ? 0 : PI, dt * 6));
      if (GC.t > 2.4) { GC.ph = 'swap'; GC.t = 0; GC.o = sentries.map((f, i) => { resetPose(f); const s = Math.sign(f.position.z - DZ) || 1; return { f, v: 1.5, wait: 0, path: [[f.position.x - 1.7, DZ + s * 0.7], [KX1 + 2.4, DZ + s * 0.7]] }; });
        GC.m.forEach((a, i) => { resetPose(a.f); a.path = [[S0[i].p.x, S0[i].p.z, 0, S0[i].ry]]; }); } return; }
    if (GC.ph === 'swap') { const a = GC.m.map(march), b = GC.o.map(march); GC.o.forEach(o => { if (!o.path.length) { o.f.visible = false; o.f.userData.lifeHide = true; } });
      if (a.every(Boolean) && b.every(Boolean)) { sentries.forEach((f, i) => { f.position.copy(S0[i].p); f.rotation.y = S0[i].ry; f.visible = true; f.userData.ownAnim = false; f.userData.lifeHide = false; resetPose(f); }); relief.forEach(f => { f.visible = false; }); GC = null; } } }
  // ================= music at dinner =================
  const TUNE = [294, 330, 349, 392, 440, 392, 349, 330, 294, 262, 294, 330, 349, 330, 294, 0]; let mT = 0, mI = 0;
  // ================= per frame =================
  let hT = 0, lastHi = null, crk = 0, wasIn = false;
  function tick(dt, P, o) { const h = hr(), t = performance.now() / 1000, hi = Math.floor(h), ink = o.ink, lx = P.x - IX, lz = P.z - IZ;
    const near = ink ? 999 : Math.hypot(P.x - (C.r[0] + C.r[1]) / 2, P.z - (C.r[2] + C.r[3]) / 2) + Math.max(0, Math.abs((P.y || 0) - OY) - 6) * 10;
    if (lastHi != null && hi !== lastHi && (hi === 6 || hi === 14 || hi === 22) && near < 140 && !o.busy) guardChange(near > 90); lastHi = hi;
    // the King + Max + crowd (only rebuilt when the slot changes; everything goes home while a job runs)
    const want = o.busy ? null : (force || slotOf(h)) + (story() ? '+' : '');
    if (o.busy) { if (slot !== undefined || A.length) release(); } else if (want !== slot || hidden) { hidden = false; place(want && want.replace('+', '')); slot = want; }
    if (ink && !o.busy) { for (const a of A) { const f = a.f, u = f.userData, Q2 = u.P; if (!f.visible && a.kind !== 'king') continue;
        if (a.kind === 'sit' || a.kind === 'throne' || a.kind === 'doze') { kit.animFox(f, dt, 0, false);
          if (Q2 && Q2.fore) { let kind = a.kind; if (kind === 'sit' && slot && /^(council|dinner)/.test(slot)) { const sp = A.filter(q => q.kind === 'sit'), S2 = sp[spk % Math.max(1, sp.length)]; if (S2 === a) kind = 'sitTalk'; else if (/^dinner/.test(slot)) kind = (u.ph || 0) % 2 > 1 ? 'sitEat' : 'sitDrink'; }
            const D = lifeD(kind, t, { ph: u.ph || 0 }); if (kind === 'sit' && slot && /^(council|dinner)/.test(slot)) { const sp = A.filter(q => q.kind === 'sit'), S2 = sp[spk % Math.max(1, sp.length)]; if (S2 && S2 !== a) { let r = Math.atan2(S2.f.position.x - f.position.x, S2.f.position.z - f.position.z) - f.rotation.y; r = Math.atan2(Math.sin(r), Math.cos(r)); D.head[1] = clamp(r, -0.9, 0.9); } }
            applyD(THREE, f, D, t, 1); u._lifeJ = 1; if (a.kind === 'doze') ZZ.forEach(z => { z.userData.t = (z.userData.t + dt * 0.25) % 1; const k = z.userData.t; z.position.set(f.position.x + 0.2 + Math.sin(k * 5) * 0.12, f.position.y + 1.6 + k * 1.1, f.position.z + 0.1); z.scale.setScalar(0.14 + k * 0.24); z.material.opacity = Math.sin(k * PI); }); continue; }
          if (Q2) { Q2.legs.forEach(l => { l.rotation.x = -1.45; }); Q2.arms[0].rotation.x = -0.55; Q2.arms[1].rotation.x = -0.55; if (!Q2.fore && Q2.hero && Q2.body) Q2.body.position.y = -Q2.hero.dL; }   /* s718 unjointed sitters: drop the tall build's extra hip height so they sit on the seat */
          if (a.kind === 'doze') { u.blink = 9; u.blinkT = 0.07 + dt; if (Q2 && Q2.head) Q2.head.rotation.x = 0.32 + Math.sin(t * 1.2) * 0.04; ZZ.forEach(z => { z.userData.t = (z.userData.t + dt * 0.25) % 1; const k = z.userData.t; z.position.set(f.position.x + 0.2 + Math.sin(k * 5) * 0.12, f.position.y + 1.6 + k * 1.1, f.position.z + 0.1); z.scale.setScalar(0.14 + k * 0.24); z.material.opacity = Math.sin(k * PI); }); }
          else if (Q2 && Q2.head && slot && /^(council|dinner)/.test(slot)) { const sp = A.filter(q => q.kind === 'sit'); const S = sp[spk % Math.max(1, sp.length)]; if (S === a) { Q2.arms[1].rotation.x = -1.1 + Math.sin(t * 5) * 0.3; Q2.head.rotation.y = Math.sin(t * 0.8) * 0.3; } else if (S) { let r = Math.atan2(S.f.position.x - f.position.x, S.f.position.z - f.position.z) - f.rotation.y; r = Math.atan2(Math.sin(r), Math.cos(r)); Q2.head.rotation.y += (clamp(r, -0.9, 0.9) - Q2.head.rotation.y) * Math.min(1, dt * 4); } }
          else if (a.kind === 'throne' && Q2 && Q2.head) { Q2.head.rotation.x = Math.max(0, Math.sin(t * 0.9)) * 0.12; }
          continue; }
        if (a.kind === 'king') { kit.animFox(f, dt, 0, false); const d = Math.hypot(P.x - f.position.x, P.z - f.position.z); turn(f, d < 5 ? Math.atan2(P.x - f.position.x, P.z - f.position.z) : K0.ry, dt * 3); continue; }
        if (a.kind === 'max') { const idle = stepA(a, dt); if (idle) { const d = Math.hypot(P.x - f.position.x, P.z - f.position.z); if (d < 3.5) turn(f, Math.atan2(P.x - f.position.x, P.z - f.position.z), dt * 4); if (!a.path.length && a.wait <= 0) { a.i = (a.i + 1) % MAXP.length; const n = MAXP[a.i]; a.path = [[WX(n[0]), WZ(n[1]), n[2]]]; } }
          f.position.y = IY + (f.position.z < WZ(-13.3) && Math.abs(f.position.x - IX) < 4.6 ? 0.6 : 0); continue; }
        if (a.kind === 'pet') { const idle = stepA(a, dt); if (idle && a.q === 0 && Q2 && Q2.fore) { applyD(THREE, f, lifeD('pet', t), t, Math.min(1, ((qT % 5) / 5) * 6)); u._lifeJ = 1; } else if (u._lifeJ && !idle) { u._lifeJ = 0; endPose(f); } if (idle && a.q === 0 && Q2 && !Q2.fore) { const k = (qT % 5) / 5; Q2.body.rotation.x = k > 0.75 ? Math.sin((k - 0.75) / 0.25 * PI) * 0.5 : 0; if (k < 0.6) { Q2.arms[1].rotation.x = -0.9 + Math.sin(t * 4) * 0.3; Q2.arms[1].rotation.z = 0.3; } } if (idle && a.q != null) turn(f, PI, dt * 5);
          if (a.leaving && !a.path.length && a.wait <= 0) { f.visible = false; f.userData.ownAnim = false; pPool.push(a.key); A.splice(A.indexOf(a), 1); } continue; }
        if (a.kind === 'walk') { const idle = stepA(a, dt); if (idle && a.face != null) turn(f, a.face, dt * 3); if (idle && a.wait <= 0 && !a.path.length) { const n = a.loop[a.li]; a.li = (a.li + 1) % a.loop.length; a.path = [[WX(n[0]), WZ(n[1]), n[2], n[3]]]; } continue; }
        if (a.kind === 'gallery') { kit.animFox(f, dt, 0, false); if (Q2 && Q2.head) Q2.head.rotation.y = Math.sin(t * 0.25 + u.ph) * 0.7; continue; }
        if (a.kind === 'warm') { kit.animFox(f, dt, 0, false); if (Q2 && Q2.fore) { applyD(THREE, f, lifeD('warm', t, { ph: u.ph || 0 }), t, 1); u._lifeJ = 1; continue; } if (Q2) { Q2.arms.forEach((ar, k) => { ar.rotation.x = -1.2 + Math.sin(t * 2 + k) * 0.08; }); } continue; }
        if (a.kind === 'lute') { kit.animFox(f, dt, 0, false); if (Q2 && Q2.fore) { applyD(THREE, f, lifeD('lute', t), t, 1); u._lifeJ = 1; continue; } if (Q2) { Q2.arms[1].rotation.x = -0.9 + Math.sin(t * 15) * 0.15; Q2.arms[0].rotation.x = -1.3; Q2.arms[0].rotation.z = -0.5; if (Q2.head) Q2.head.rotation.z = Math.sin(t * 2.2) * 0.1; } continue; }
        if (a.kind === 'drum') { kit.animFox(f, dt, 0, false); if (Q2 && Q2.fore) { applyD(THREE, f, lifeD('drum', t), t, 1); u._lifeJ = 1; continue; } if (Q2) Q2.arms.forEach((ar, k) => { ar.rotation.x = -0.9 - Math.max(0, Math.sin(t * 7.2 + k * PI)) * 0.5; }); continue; }
        if (a.kind === 'jest') { const idle = stepA(a, dt); if (idle && !a.path.length && a.wait <= 0) { const toE = f.position.x < WX(20); a.path = [[WX(toE ? 24 : 16), WZ(-11.6), 3]]; } if (idle) turn(f, 0, dt * 4);
          const ry = f.rotation.y, rx = Math.cos(ry), rz = -Math.sin(ry), fx = Math.sin(ry) * 0.3, fz = Math.cos(ry) * 0.3;
          balls.forEach((b, i) => { const ph = t * 4.4 + i * PI * 2 / 3, l = Math.cos(ph) * 0.3, y = 1.35 + Math.abs(Math.sin(ph)) * 0.75; b.position.set(f.position.x + fx + rx * l, y, f.position.z + fz + rz * l); });
          if (Q2 && Q2.fore) { applyD(THREE, f, lifeD('juggle', t), t, 1); u._lifeJ = 1; }   // s630 the juggler: paws toss + catch, eyes up on the balls
          else if (Q2) { Q2.arms[0].rotation.x = -1.1 + Math.sin(t * 8.8) * 0.25; Q2.arms[1].rotation.x = -1.1 - Math.sin(t * 8.8) * 0.25; } continue; } }
      if (slot && slot.startsWith('court')) { qT -= dt; if (qT <= 0 && Q.length) { qT = 15; const fr = Q.shift(); fr.q = null; fr.leaving = true; fr.key = Object.keys(FX).find(k => FX[k] === fr.f); resetPose(fr.f); fr.path = [[WX(1.9), WZ(-10.0)], [WX(1.9), WZ(16.5)], [WX(DOOR[0]), WZ(DOOR[1])]];
          Q.forEach((a, i) => { a.q = i; a.path = [[WX(0), WZ(PQ[i])]]; }); if (pPool.length && Q.length < (touch ? 2 : 3)) { const a = act(mk(pPool.shift()), { kind: 'pet', q: Q.length }); at(a, DOOR[0], DOOR[1], PI, 0); a.path = [[WX(0), WZ(PQ[Q.length])]]; Q.push(a); } } }
      if ((spkT -= dt) <= 0) { spkT = 3 + Math.random() * 2; spk++; }
      // dinner music in the council room
      const inC = lx > 10 && lx < 30 && lz > -14 && lz < 0; if (slot && slot.startsWith('dinner') && inC && (mT -= dt) <= 0) { mT = 0.3; const n = TUNE[mI++ % TUNE.length]; if (n) tone(n, 0.018, 0.26, 'triangle'); if (mI % 2) tone(110, 0.025, 0.12, 'sine'); }
      // crackle by the fireplace
      if (inC && Math.hypot(lx - 20, lz + 0.4) < 7 && (crk -= dt) <= 0) { crk = 0.25 + Math.random() * 0.9; noise(0.05, 0.012, 2500); } }
    // board, panes, caps (every 1.5 s)
    if ((hT -= dt) <= 0) { hT = 1.5; const k = ROWS.map(r => rowOn(r, h) ? 1 : 0).join(''); if (k !== bdKey) { bdKey = k; drawBoard(h); }
      const lit = candlesLit(h); caps.visible = !lit; flames.visible = lit; HALO.forEach(([s, p]) => { s.visible = p.visible = lit; });
      roseM.color.set(h >= 8 && h < 17.5 ? '#ffffff' : (h >= 6.5 && h < 8) || (h >= 17.5 && h < 19.5) ? '#d89a6a' : '#2a2e48');
      const dusk = (h >= 6 && h < 7) || (h >= 18 && h < 19.5), night = h >= 19.5 || h < 6; nightM.opacity = night ? 1 : dusk ? 0.5 : 0; nightM.color.set(night ? '#1d2742' : '#ffb070'); NIGHT.forEach(m => { m.visible = night || dusk; }); hearth.material.opacity = h >= 18 || h < 7 ? 0.4 : 0.22; }
    if (ink) { // sun through the rose + the side windows
      const rs = h >= 9 && h < 17 ? { e: (22 + 38 * Math.sin(PI * (h - 9) / 8)) * PI / 180, a: (h - 13) * 0.06, k: Math.min(1, h - 9, 17 - h) } : null; shaft.visible = patch.visible = motes.visible = !!rs;
      if (rs) { const key = Math.round(h * 20); if (!sun || sun.key !== key) { sun = { dx: Math.sin(rs.a), dz: -Math.cos(rs.a), tn: Math.tan(rs.e), key }; setRose(sun); } shaft.material.opacity = 0.3 * rs.k; patch.material.opacity = 0.55 * rs.k; motes.material.opacity = 0.7 * rs.k;
        MOTE.forEach((q, i) => { q.s = (q.s + dt * 0.01) % 1; const px = Math.cos(q.a) * q.r, py = Math.sin(q.a) * q.r, p = proj(px, py, sun), wx = WX(px), wy = RY + py;
          mPos[i * 3] = wx + (p[0] - wx) * q.s + Math.sin(t * 0.3 + q.ph) * 0.12; mPos[i * 3 + 1] = wy + (p[1] - wy) * q.s + Math.sin(t * 0.4 + q.ph * 2) * 0.1; mPos[i * 3 + 2] = RZ + (p[2] - RZ) * q.s + Math.cos(t * 0.25 + q.ph) * 0.12; }); mg.attributes.position.needsUpdate = true; }
      const ss = sideSun(h); SP.E.forEach(m => { m.visible = !!ss && ss.sd === 'E'; }); SP.W.forEach(m => { m.visible = !!ss && ss.sd === 'W'; });
      if (ss) { const tn = Math.tan(ss.e * PI / 180), key = ss.sd + Math.round(tn * 100); if (sideM.userData.key !== key) { sideM.userData.key = key; setSide(ss.sd, tn); } sideM.opacity = 0.3 * ss.k; }
      if (flames.visible) { CP.forEach((p, i) => { flP[i * 3] = p[0] + Math.sin(t * 9 + i) * 0.01; flP[i * 3 + 1] = p[1] + 0.05 + Math.sin(t * 13 + i * 2.3) * 0.015; flP[i * 3 + 2] = p[2]; }); flG.attributes.position.needsUpdate = true; flames.material.size = 0.18 + Math.sin(t * 11) * 0.02; }
      if (!wasIn) sun = null; }
    wasIn = ink;
    // fires flicker (inside: keep fires · outside: courtyard braziers near the castle)
    GO.visible = !ink; const fl = (g, i) => { const u = g.userData, s = u.s; g.scale.set(s * (0.9 + Math.sin(t * 7 + u.ph) * 0.08), s * (0.85 + Math.abs(Math.sin(t * 9.3 + u.ph * 2)) * 0.35), s); g.rotation.y = t * 0.6 + i; };
    if (ink) FL.forEach((g, i) => { if (g.parent === G) fl(g, i); }); else if (near < 95) OFL.forEach(fl);
    // flags ripple (outside, near)
    if (!ink && near < 170) { const wind = 0.6 + 0.4 * Math.sin(t * 0.13) + Math.max(0, Math.sin(t * 0.37)) * 0.3; FLG.forEach(F => { for (const q of F.parts) { const p = q.m.geometry.attributes.position.array, b = q.b; for (let i = 0; i < p.length; i += 3) { const u = Math.max(0, b[i] / F.w); p[i + 2] = b[i + 2] + 0.22 * F.w * wind * Math.pow(u, 1.2) * Math.sin(t * (5 + wind * 2) - u * 5.5 + F.ph) * 0.35; p[i + 1] = b[i + 1] - u * u * 0.08 * (1.2 - wind); } q.m.geometry.attributes.position.needsUpdate = true; } }); }
    guardTick(dt, t, near); }
  return { tick, release, slot: () => slot, _place: s => { force = s || null; hidden = true; }, _guard: () => guardChange(false), actors: () => A };
}
