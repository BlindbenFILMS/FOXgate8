import { applyD, endPose, lifeD } from '../engine/fox-poses.js?v=s648k';   // s630 jointed barracks life
// MERU 2.0 — s97 BARRACKS DELUXE PART C2 (Ben's LOOK list): the barracks comes alive. Built + ticked inside worlds/meru2-barracks-jobs.js as LF.
// HIGH WINDOWS (3 per long wall, z -436 / -424 / -413, y 6..8.4) + SUN SHAFTS (east windows in the morning, west in the afternoon, angle follows the hour) + DUST MOTES in the shafts.
// THE GUARDS' DAY (one pool, placed by the hour; all hidden while a job or the spar bout runs):
//   0600 REVEILLE (bugle) · 0630-0900 MORNING DRILL (4 march in place at the drill spot) · 1200-1300 + 1800-1930 MESS (seated at the long tables)
//   1400-1800 SPARRING (Ash vs Brick in the circle, swords, clangs) · 2200 LIGHTS OUT (bugle, chandeliers snuffed, the Captain's desk lantern) · 2200-0600 FLINT / ASH / BRICK ASLEEP + SNORING.
// BANNERS IN THE DRAUGHT: 6 hanging banners over the side aisles (x ±12) ripple; a gust when someone comes through the door.
// SHIFT ROSTER board (south wall, east of the door): the real times above, the row that is on NOW in red.
export function brkLife(X) {
  const { THREE, G, kit, LM, CT, box, cyl, touch, hour, tone, noise, toast, camera } = X;
  const INK = '#201e1d', RED = '#ec3013', WHITE = '#f3f2f2', GOLD = '#e6b45a', NAVY = '#1f2650', BRED = '#a8323e', IRON = '#3d3b3a';
  const hr = () => { const h = hour ? hour() : 12; return ((h % 24) + 24) % 24; };
  const WX = 39.38, WZ = [-436, -424, -413], WY0 = 6.0, WY1 = 8.4, WW = 1.4;
  // ================= HIGH WINDOWS (inside + outside panes) =================
  const paneIn = new THREE.MeshBasicMaterial({ color: '#fff1cc' }), paneOut = new THREE.MeshBasicMaterial({ color: '#3a4656' });
  const SIDE = { E: [], W: [] }, pg = new THREE.PlaneGeometry(WW, WY1 - WY0);
  for (const s of [-1, 1]) for (const z of WZ) { const sd = s > 0 ? 'E' : 'W';
    const a = new THREE.Mesh(pg, paneIn); a.position.set(s * WX, (WY0 + WY1) / 2, z); a.rotation.y = -s * Math.PI / 2; G.add(a); SIDE[sd].push(a);
    const b = new THREE.Mesh(pg, paneOut); b.position.set(s * 40.02, (WY0 + WY1) / 2, z); b.rotation.y = s * Math.PI / 2; G.add(b);
    for (const xx of [s * (WX - 0.02), s * 40.04]) { const parts = [box(G, 0.06, WY1 - WY0 + 0.16, 0.08, INK, xx, (WY0 + WY1) / 2, z), box(G, 0.06, 0.08, WW + 0.16, INK, xx, WY0 - 0.04, z), box(G, 0.06, 0.08, WW + 0.16, INK, xx, WY1 + 0.04, z),
      box(G, 0.06, 0.06, WW, INK, xx, (WY0 + WY1) / 2 + 0.4, z)]; for (const e of [-1, 1]) parts.push(box(G, 0.06, WY1 - WY0 + 0.16, 0.08, INK, xx, (WY0 + WY1) / 2, z + e * (WW / 2 + 0.04))); if (Math.abs(xx) < 40) SIDE[sd].push(...parts); }
    box(G, 0.34, 0.1, WW + 0.2, '#8a7f70', s * (WX - 0.15), WY0 - 0.1, z); }
  // ================= SUN SHAFTS (one prism per window) + MOTES =================
  const shaftM = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const mkShafts = s => { const g = new THREE.BufferGeometry(), pos = new Float32Array(WZ.length * 8 * 3), col = new Float32Array(WZ.length * 8 * 3), idx = [];
    WZ.forEach((_, i) => { const o = i * 8; for (let k = 0; k < 8; k++) { const fl = k >= 4, c = fl ? [0.42, 0.33, 0.18] : [0.55, 0.46, 0.3]; col.set(c, (o + k) * 3); }
      // 0..3 window (y0z0, y0z1, y1z0, y1z1) · 4..7 floor (same order)
      idx.push(o + 2, o + 3, o + 7, o + 2, o + 7, o + 6, o + 0, o + 1, o + 5, o + 0, o + 5, o + 4, o + 0, o + 2, o + 6, o + 0, o + 6, o + 4, o + 1, o + 3, o + 7, o + 1, o + 7, o + 5, o + 4, o + 5, o + 7, o + 4, o + 7, o + 6); });
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx); const m = new THREE.Mesh(g, shaftM.clone()); m.frustumCulled = false; m.renderOrder = 3; m.visible = false; m.userData.s = s; G.add(m); return m; };
  const SH = { E: mkShafts(1), W: mkShafts(-1) };
  const setShaft = (m, tanE) => { const s = m.userData.s, p = m.geometry.attributes.position.array, dir = -s, x0 = s * (WX - 0.05);
    WZ.forEach((z, i) => { const o = i * 24, z0 = z - WW / 2, z1 = z + WW / 2; const W = [[WY0, z0], [WY0, z1], [WY1, z0], [WY1, z1]];
      W.forEach(([y, zz], k) => { p[o + k * 3] = x0; p[o + k * 3 + 1] = y; p[o + k * 3 + 2] = zz; const fx = x0 + dir * (y - 0.09) / tanE; p[o + (k + 4) * 3] = Math.max(-39.3, Math.min(39.3, fx)); p[o + (k + 4) * 3 + 1] = 0.09; p[o + (k + 4) * 3 + 2] = zz; }); });
    m.geometry.attributes.position.needsUpdate = true; m.userData.t = tanE; };
  const sunNow = h => { // which windows + elevation + strength
    if (h >= 7 && h < 11.5) return { side: 'E', e: 15 + (h - 7) / 4.5 * 40, k: Math.min(1, (h - 7) / 1) }; if (h >= 12.5 && h < 18) return { side: 'W', e: 55 - (h - 12.5) / 5.5 * 40, k: Math.min(1, (18 - h) / 1) };
    if (h >= 11.5 && h < 12.5) return { side: h < 12 ? 'E' : 'W', e: 58, k: 0.4 }; return null; };
  const dotT = CT(32, 32, (g, w) => { const r = g.createRadialGradient(16, 16, 1, 16, 16, 15); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const NM = touch ? 40 : 90, mPos = new Float32Array(NM * 3), MOTE = [...Array(NM)].map(() => ({ i: Math.random() * 3 | 0, s: Math.random(), u: Math.random(), v: Math.random(), ph: Math.random() * 7 }));
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({ map: dotT, size: 0.07, color: '#fff3d0', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); motes.frustumCulled = false; motes.visible = false; G.add(motes);
  // ================= BANNERS IN THE DRAUGHT =================
  const banT = (bg, em) => CT(128, 296, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = bg; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h); g.lineTo(w / 2, h - 46); g.lineTo(0, h); g.closePath(); g.fill();
    g.fillStyle = GOLD; g.fillRect(0, 0, w, 12); g.fillRect(8, 12, 6, h - 40); g.fillRect(w - 14, 12, 6, h - 40); g.fillRect(34, 70, 60, 60); g.fillStyle = em; g.fillRect(46, 82, 36, 36); g.fillStyle = GOLD; g.font = '900 30px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', w / 2, 101); });
  const BT = [banT(BRED, NAVY), banT(NAVY, BRED)], BH = 3.0, BANS = [];
  [[-12, -432], [12, -432], [-12, -421], [12, -421], [-12, -410], [12, -410]].forEach(([x, z], i) => { const g = new THREE.PlaneGeometry(1.3, BH, 2, 10); g.translate(0, -BH / 2, 0);
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: BT[(i + (i >> 1)) % 2], side: THREE.DoubleSide, alphaTest: 0.5 })), hg = new THREE.Group(); hg.position.set(x, 8.85, z); hg.add(m); G.add(hg);
    box(G, 1.5, 0.06, 0.06, IRON, x, 8.88, z); box(G, 0.03, 0.15, 0.03, IRON, x, 8.95, z);
    BANS.push({ m, hg, base: Float32Array.from(g.attributes.position.array), ph: i * 1.3 }); });
  let gust = 0;
  // ================= SHIFT ROSTER (south wall, east of the door) =================
  const ROWS = [['0600', 'REVEILLE', 'THE BUGLE', 6, 6.5], ['0630 - 0900', 'MORNING DRILL', 'FLINT · ASH · BRICK · PIP', 6.5, 9], ['1200 - 1300', 'MESS · LUNCH', 'ALL HANDS', 12, 13], ['1400 - 1800', 'SPARRING', 'ASH v BRICK · THE CIRCLE', 14, 18],
    ['1800 - 1930', 'MESS · DINNER', 'ALL HANDS', 18, 19.5], ['2200', 'LIGHTS OUT', 'THE BUGLE', 22, 22.5], ['2200 - 0600', 'BUNKS', 'FLINT · ASH · BRICK', 22, 30], ['2200 - 0600', 'NIGHT WATCH', 'THE GUARD CAPTAIN', 22, 30]];
  const rowOn = (r, h) => { const hh = h < 6 ? h + 24 : h; return hh >= r[3] && hh < r[4]; };
  const rosT = CT(512, 384, () => {}), rosC = rosT.userData.c;
  const drawRoster = h => { const g = rosC.getContext('2d'), w = rosC.width, H = rosC.height; g.fillStyle = WHITE; g.fillRect(0, 0, w, H); g.fillStyle = INK; g.fillRect(0, 0, w, 52); g.fillStyle = RED; g.fillRect(0, 52, w, 4);
    g.fillStyle = WHITE; g.font = '900 26px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('SHIFT ROSTER', 16, 27); g.font = '700 16px Archivo, sans-serif'; g.textAlign = 'right'; g.fillText('MERU BARRACKS', w - 16, 28); g.textAlign = 'left';
    const rh = 40; ROWS.forEach((r, i) => { const y = 62 + i * rh, on = rowOn(r, h); if (on) { g.fillStyle = RED; g.fillRect(0, y, w, rh - 2); } g.fillStyle = on ? WHITE : INK; g.font = '900 17px Archivo, sans-serif'; g.fillText(r[0], 14, y + rh / 2 - 1);
      g.font = '900 18px Archivo, sans-serif'; g.fillText(r[1], 140, y + rh / 2 - 8); g.font = '600 13px Archivo, sans-serif'; g.fillText(r[2], 140, y + rh / 2 + 10); if (on) { g.font = '900 15px Archivo, sans-serif'; g.textAlign = 'right'; g.fillText('NOW', w - 14, y + rh / 2 - 1); g.textAlign = 'left'; }
      if (!on && i < ROWS.length - 1) { g.fillStyle = INK; g.fillRect(14, y + rh - 2, w - 28, 2); } }); rosT.needsUpdate = true; };
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), new THREE.MeshBasicMaterial({ map: rosT, color: 0xeeeeee })); m.position.set(11, 2.4, -400.66); m.rotation.y = Math.PI; G.add(m); box(G, 2.56, 1.96, 0.04, INK, 11, 2.4, -400.62); }
  let rosKey = '';
  // ================= LIGHTS OUT: snuff caps over the chandelier candles + the Captain's desk lantern =================
  const capG = new THREE.SphereGeometry(0.09, 6, 4), caps = new THREE.InstancedMesh(capG, new THREE.MeshBasicMaterial({ color: '#2a2622' }), 48); { const mt = new THREE.Matrix4(); let n = 0;
    for (const x of [-24, 0, 24]) for (const z of [-428, -414]) for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; mt.makeTranslation(x + Math.cos(a) * 1.3, 6.45, z + Math.sin(a) * 1.3); caps.setMatrixAt(n++, mt); } caps.visible = false; G.add(caps); }
  const lant = new THREE.Group(); lant.position.set(-12.85, 0.83, -419.7); G.add(lant); box(lant, 0.18, 0.02, 0.18, IRON, 0, 0.01, 0); box(lant, 0.14, 0.2, 0.14, '#ffd27a', 0, 0.12, 0); box(lant, 0.18, 0.02, 0.18, IRON, 0, 0.23, 0); cyl(lant, 0.01, 0.01, 0.08, IRON, 0, 0.28, 0, 4);
  const lGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotT, color: '#ffc46a', transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending })); lGlow.scale.setScalar(1.6); lGlow.position.set(-12.85, 0.95, -419.7); G.add(lGlow);
  const lightsOut = () => { const h = hr(); return h >= 22 || h < 6; };
  // ================= THE GUARDS (lazy) =================
  const LOOK = { flint: [['#52525b', BRED, NAVY], { fur: '#8a8a8a', furDark: '#5a5a5a', muzzle: '#e8e8e8' }, 1], ash: [['#6b7280', NAVY, '#111827'], { fur: '#b8b0a6', furDark: '#857b70', muzzle: '#f2ede6' }, 0.97],
    brick: [['#7a808c', BRED, '#23272f'], { fur: '#a8452a', furDark: '#7a2e1a' }, 1.1], pip: [['#a9b1b9', NAVY, '#27272a'], {}, 0.92], rook: [['#52525b', NAVY, '#09090b'], { fur: '#5a4a3a', furDark: '#3a2e22' }, 1.02], moss: [['#7a808c', BRED, NAVY], { fur: '#c9a46a', furDark: '#9a7a46' }, 1] };
  const FX = {}, mk = (k, sword) => { const id = k + (sword ? 'S' : ''); if (FX[id]) return FX[id]; const [torso, look, sc] = LOOK[k];
    const f = kit.makeFox({ joints: true, key: 'brkLife_' + id, torso, crest: 'M', outfit: 'armor', mood: sword ? 'determined' : 'neutral', look, ...(sword ? { gear: 'sword' } : {}) }); f.scale.setScalar(sc); f.visible = false; f.userData.ph = Math.random() * 9; G.add(f); return (FX[id] = f); };
  const reset = f => { if (f.parent !== G) G.add(f); f.rotation.set(0, 0, 0); const P = f.userData.P; if (P && f.userData._lifeJ) { f.userData._lifeJ = 0; endPose(f); } if (P) { P.legs.forEach(l => l.rotation.set(0, 0, 0)); P.arms.forEach(a => a.rotation.set(0, 0, 0)); } };
  const BEDS = [['flint', -25.2], ['ash', -21.6], ['brick', -18]].map(([k, x]) => { const h = new THREE.Group(); h.position.set(x, 0.88, -436.75); h.rotation.x = -Math.PI / 2; G.add(h); h.visible = false;
    const bl = box(G, 0.96, 0.12, 1.25, '#2b3570', x, 1.02, -437.0); bl.visible = false; return { k, x, h, bl, zz: [] }; });
  const zT = CT(64, 64, (g, w) => { g.fillStyle = WHITE; g.strokeStyle = INK; g.lineWidth = 6; g.font = '900 48px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeText('Z', w / 2, w / 2 + 2); g.fillText('Z', w / 2, w / 2 + 2); });
  BEDS.forEach(b => { for (let i = 0; i < 3; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zT, transparent: true, depthWrite: false })); s.visible = false; s.userData.t = i / 3; G.add(s); b.zz.push(s); } b.snore = 1 + Math.random() * 3; });
  const SQUAD = [['flint', 12.5], ['ash', 14.5], ['brick', 16.5], ['pip', 18.5]];
  const SEATS = [['flint', 8.05, -420.15, -1], ['ash', 5.95, -418.7, 1], ['brick', 8.05, -417.25, -1], ['pip', 5.95, -415.8, 1], ['rook', -8.05, -418.7, 1], ['moss', -8.05, -415.8, 1]].slice(0, touch ? 4 : 6);
  const SPAR = [['ash', 23.1, -424.0], ['brick', 25.0, -422.1]];
  const slotOf = h => (h >= 22 || h < 6 ? 'sleep' : h >= 6.5 && h < 9 ? 'drill' : (h >= 12 && h < 13) || (h >= 18 && h < 19.5) ? 'mess' : h >= 14 && h < 18 ? 'spar' : null);
  let slot = undefined, shown = [];
  function place(s) { slot = s; Object.values(FX).forEach(f => { reset(f); f.visible = false; }); BEDS.forEach(b => { b.h.visible = false; b.bl.visible = false; b.zz.forEach(z => { z.visible = false; }); }); shown = [];
    if (s === 'sleep') BEDS.forEach(b => { const f = mk(b.k); b.h.add(f); f.position.set(0, 0, 0); f.rotation.set(0, 0, 0); f.visible = true; b.h.visible = true; b.bl.visible = true; b.zz.forEach(z => { z.visible = true; }); shown.push({ f, kind: 'sleep', b }); });
    if (s === 'drill') SQUAD.forEach(([k, x]) => { const f = mk(k); f.position.set(x, 0.06, -410); f.rotation.y = 0; f.visible = true; shown.push({ f, kind: 'drill' }); });
    if (s === 'mess') SEATS.forEach(([k, x, z, d]) => { const f = mk(k); f.position.set(x, 0.06, z); f.rotation.y = d * Math.PI / 2; f.visible = true; shown.push({ f, kind: 'sit' }); });
    if (s === 'spar') { const [a, b] = SPAR, ang = Math.atan2(b[1] - a[1], b[2] - a[2]); SPAR.forEach(([k, x, z], i) => { const f = mk(k, true); f.position.set(x, 0.06, z); f.rotation.y = i ? ang + Math.PI : ang; f.userData.home = [x, z]; f.visible = true; shown.push({ f, kind: 'spar', i, ang: i ? ang + Math.PI : ang }); }); } }
  // ================= bugle =================
  const bugle = notes => notes.forEach(([n, at, len]) => { tone(n, 0.045, len, 'triangle', at); tone(n * 2, 0.012, len * 0.9, 'square', at); });
  const REV = [[392, 0, 0.16], [523, 0.18, 0.16], [659, 0.36, 0.16], [523, 0.54, 0.16], [659, 0.72, 0.16], [784, 0.9, 0.5], [659, 1.45, 0.16], [523, 1.63, 0.16], [392, 1.81, 0.16], [523, 1.99, 0.6]];
  const TAPS = [[392, 0, 0.35], [392, 0.45, 0.2], [523, 0.7, 1.1], [392, 2.0, 0.35], [523, 2.45, 0.2], [659, 2.7, 1.1], [392, 4.0, 0.25], [523, 4.3, 0.25], [659, 4.6, 0.6], [523, 5.3, 0.25], [659, 5.6, 0.25], [784, 5.9, 1.4]];
  let lastHi = null;
  // ================= per frame =================
  let hT = 0, beat = 0, sunK = '';
  function tick(dt, P, o) { const h = hr(), t = performance.now() / 1000, hi = Math.floor(h);
    if (lastHi != null && hi !== lastHi && o.near < 70) { if (hi === 6) { bugle(REV); toast('REVEILLE \u00b7 0600 \u00b7 UP AND AT THEM', 2.6); } if (hi === 22) { bugle(TAPS); toast('LIGHTS OUT \u00b7 2200 \u00b7 QUIET IN THE BUNKS', 2.8); } } lastHi = hi;
    if (!G.visible) return; const hide = o.busy || o.sp, want = hide ? null : slotOf(h);
    if ((hT -= dt) <= 0) { hT = 1.5; const lo = lightsOut(); caps.visible = lo; lGlow.visible = lo; lant.children[1].material = LM(lo ? '#ffd27a' : '#c9b48a');
      paneIn.color.set(h >= 7 && h < 18 ? '#fff1cc' : (h >= 6 && h < 7) || (h >= 18 && h < 19.5) ? '#ffb070' : '#1d2742'); paneOut.color.set(h >= 7 && h < 18 ? '#3a4656' : lo ? '#2a2e3a' : '#ffcf7a');
      const rk = ROWS.map(r => rowOn(r, h) ? 1 : 0).join(''); if (rk !== rosKey) { rosKey = rk; drawRoster(h); } }
    if (want !== slot) place(want);
    // windows cut away with the wall (barracks.js hides the wall between the camera and you)
    const cam = camera && camera.position, act = o.inR; if (cam) { const e = !(act && cam.x > 39), w = !(act && cam.x < -39); SIDE.E.forEach(m => { m.visible = e; }); SIDE.W.forEach(m => { m.visible = w; }); }
    // sun shafts + motes (only while you are in the hall)
    const sn = act ? sunNow(h) : null; SH.E.visible = !!sn && sn.side === 'E'; SH.W.visible = !!sn && sn.side === 'W'; motes.visible = !!sn;
    if (sn) { const m = SH[sn.side], tn = Math.tan(sn.e * Math.PI / 180); if (!m.userData.t || Math.abs(m.userData.t - tn) > 0.01) setShaft(m, tn); m.material.opacity = 0.32 * sn.k; motes.material.opacity = 0.75 * sn.k;
      const s = m.userData.s, x0 = s * (WX - 0.05); MOTE.forEach((q, i) => { q.s = (q.s + dt * 0.012) % 1; const y = WY0 + (WY1 - WY0) * q.v, z = WZ[q.i] - WW / 2 + WW * q.u;
        mPos[i * 3] = x0 - s * q.s * (y - 0.09) / tn + Math.sin(t * 0.3 + q.ph) * 0.15; mPos[i * 3 + 1] = y + (0.09 - y) * q.s + Math.sin(t * 0.4 + q.ph * 2) * 0.12; mPos[i * 3 + 2] = z + Math.cos(t * 0.25 + q.ph) * 0.15; }); mg.attributes.position.needsUpdate = true; }
    // banners: ripple, a gust when someone walks through the door
    if (Math.abs(P.x) < 2.6 && P.z > -402.5 && P.z < -398.5) gust = 1; gust = Math.max(0, gust - dt * 0.35);
    if (act || o.near < 30) { const amp = 0.05 + gust * 0.3; BANS.forEach(B => { const p = B.m.geometry.attributes.position.array, b = B.base; for (let i = 0; i < p.length; i += 3) { const d = -b[i + 1] / BH; p[i + 2] = b[i + 2] + amp * Math.pow(d, 1.3) * Math.sin(t * (1.6 + gust) - d * 4.5 + B.ph + b[i] * 0.8); }
      B.m.geometry.attributes.position.needsUpdate = true; B.hg.rotation.x = Math.sin(t * 0.7 + B.ph) * (0.02 + gust * 0.12); }); }
    if (!act || !shown.length) return;
    // the guards
    const dS = (x, z) => Math.hypot(P.x - x, P.z - z); beat += dt;
    for (const s of shown) { const f = s.f, u = f.userData, Q = u.P;
      if (s.kind === 'sleep') { u.blink = 9; u.blinkT = 0.07 + dt; kit.animFox(f, dt, 0, false); if (Q && Q.fore) { applyD(THREE, f, lifeD('sleep', t, { ph: u.ph }), t, 1); u._lifeJ = 1; } else if (Q) { Q.arms[0].rotation.x = 0.1; Q.arms[1].rotation.x = 0.1; } s.b.h.position.y = 0.88 + Math.sin(t * 1.4 + u.ph) * 0.012;
        s.b.zz.forEach(z => { z.userData.t = (z.userData.t + dt * 0.28) % 1; const k = z.userData.t; z.position.set(s.b.x + 0.15 + Math.sin(k * 5 + u.ph) * 0.12, 1.3 + k * 1.1, -437.9); z.scale.setScalar(0.12 + k * 0.22); z.material.opacity = Math.sin(k * Math.PI); });
        if ((s.b.snore -= dt) <= 0) { s.b.snore = 3.6 + Math.random() * 1.2; if (dS(s.b.x, -437) < 9) { tone(78 + Math.random() * 10, 0.035, 1.0, 'sawtooth'); tone(58, 0.03, 0.9, 'triangle', 0.08); noise(0.5, 0.008, 1800); } } continue; }
      if (s.kind === 'drill') { kit.animFox(f, dt, 2.2, false); if (Q && Q.fore) { const D = lifeD('march', u.phase / 7); D.l = null; applyD(THREE, f, { ...D, l: [[0, 0.05, 0.02], [0, 0.05, 0.02]] }, t, 0.85); u._lifeJ = 1; continue; } if (Q) { Q.arms.forEach((a, k) => { a.rotation.x = Math.sin(u.phase + k * Math.PI) * 0.5; }); } continue; }
      if (s.kind === 'sit') { kit.animFox(f, dt, 0, false); if (Q && Q.fore) { applyD(THREE, f, lifeD('sitEat', t, { ph: u.ph }), t, 1); u._lifeJ = 1; continue; } if (Q) { Q.legs.forEach(l => { l.rotation.x = -1.45; }); if (!Q.fore && Q.hero && Q.body) Q.body.position.y = -Q.hero.dL; const k = (t + u.ph) % 3.2, up = k > 2.2 ? Math.sin((k - 2.2) * Math.PI) : 0; Q.arms[1].rotation.x = -0.8 - up * 1.0; Q.arms[0].rotation.x = -0.6; Q.arms[0].rotation.z = -0.25; }
        if (Q && Q.head) Q.head.rotation.y = Math.sin(t * 0.35 + u.ph) * 0.4; continue; }
      if (s.kind === 'spar') { const cyc = 2.4, k = ((t + (s.i ? cyc / 2 : 0)) % cyc) / cyc, atk = k < 0.45, a = atk ? Math.sin(k / 0.45 * Math.PI) : 0, [hx, hz] = u.home;
        f.position.set(hx + Math.sin(s.ang) * a * 0.35, 0.06, hz + Math.cos(s.ang) * a * 0.35); kit.animFox(f, dt, a > 0.1 ? 1.2 : 0, false);
        if (Q && Q.fore) { applyD(THREE, f, lifeD('swing', t, { k: atk ? 1 - k / 0.45 : 0 }), t, 1); u._lifeJ = 1; } else if (Q) { Q.arms[1].rotation.x = atk ? -2.5 + k / 0.45 * 2.0 : -1.3 + Math.sin(t * 3 + s.i) * 0.08; Q.arms[1].rotation.z = 0.2; Q.legs[0].rotation.x = -0.35; Q.legs[1].rotation.x = 0.3; }
        if (s.i === 0) { const cl = Math.floor((t % cyc) / (cyc / 2)); if (cl !== s.cl) { s.cl = cl; if (dS(24, -422) < 16) { tone(2350, 0.035, 0.4, 'triangle', 0.3); tone(3120, 0.02, 0.3, 'triangle', 0.3); noise(0.1, 0.025, 4000); } } } } }
    if (slot === 'drill' && beat > 0.6) { beat = 0; if (dS(15.5, -410) < 14) tone(100, 0.05, 0.14, 'sine'); } }
  return { tick, lightsOut, slot: () => slot, _place: place };
}
