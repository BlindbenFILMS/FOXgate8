// MERU 2.0 — s141 SPIRE OFFICES JOBS [meruOffices] ("4. LOBBY JOBS", Ben's picks s138): jobs IN PLACE on the 3 office floors (the s106c lift floors):
// FLOOR 1 LAWYER: FIND THE CLAUSE · FILE THE PAPERS · FLOOR 2 ACCOUNTANT: ADD IT UP · SPOT THE ERROR · FLOOR 3 DENTIST: HOLD THE LIGHT · BRUSH · FLOSS ·
// CALM THE PATIENT. Prizes: OFFICE BLAZER (1st clear) · per floor GOLDEN GAVEL / GOLDEN ABACUS / GOLDEN TOOTH · all 8 = 60 G + the Accountant's VAX fees
// scene · relic THE GOLDEN QUILL (3 stars on all 8). Stats prefix ofh. Made from the woodshop kit.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildOffices({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, clusters, renderer, go, groundH = () => 0 }) {
  const F = [1, 2, 3].map(n => clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'officeFloor' + n)); if (F.some(r => !r)) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, RH = 4.2;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
  const VCM = new THREE.MeshLambertMaterial({ vertexColors: true });
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(1, 1, 1)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } g.dispose(); };
    return { box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 10, rx = 0, rz = 0, ry = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, ry, rx, rz),
      tor: (r, t, hex, x, y, z, rx = 0, ry = 0) => put(new THREE.TorusGeometry(r, t, 6, 16), x, y, z, hex, ry, rx),
      sph: (r, hex, x, y, z) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex),
      mesh(parent) { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); const m = new THREE.Mesh(g0, VCM); m.userData.noCull = true; parent.add(m); return m; } }; };
  const plate = (txt, w, h, bg, fg, bar) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); if (bar) { g.fillStyle = bar; g.fillRect(0, 0, Math.max(8, W * 0.03), H); } g.fillStyle = fg; g.textBaseline = 'middle'; let s = Math.round(H * 0.6); g.font = '900 ' + s + 'px Archivo, sans-serif'; while (g.measureText(txt).width > W * 0.86 && s > 10) { s -= 2; g.font = '900 ' + s + 'px Archivo, sans-serif'; } g.fillText(txt, bar ? W * 0.07 : W * 0.06, H / 2 + 2); });
  const planeT = (tex, w, h, x, y, z, ry, parent, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat || new THREE.MeshBasicMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.set(0, ry, 0); m.userData.noCull = true; parent.add(m); return m; };
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', CREAM = '#e7e4dc', STEEL = '#9aa0a6', BLACK = '#26292d', BLUE = '#2e86b8', GRN = '#2f7d5a', NAVY = '#334155', GOLD = '#d7ad52', OAK = '#a77b4f', PINE = '#c9a27a', DKW = '#5a3d26', WAL = '#7a5236', GUM = '#e88a94', TOOTH = '#fbf7ee', ACC = NAVY;
  const FG = F.map((R, i) => { const g = new THREE.Group(); g.name = 'officeJobs' + (i + 1); g.position.set(R.ox, LY, LZ); scene.add(g); g.visible = false; return g; });
  const rectL = (a, b, c, d, fi) => cols.push({ f: [F[fi].ox + a, F[fi].ox + b, LZ + c, LZ + d], y0: LY - 3, y1: LY + 12 }), circL = (x, z, r, fi) => cols.push({ c: [F[fi].ox + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  const toW = (x, y, z, fi) => V(F[fi].ox + x, LY + y, LZ + z), toF = (P, fi) => ({ x: P.x - F[fi].ox, y: (P.y || 0) - LY, z: P.z - LZ });
  const inFloor = (P, fi) => !!P && Math.abs(P.x - F[fi].ox) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8, floorOf = P => [0, 1, 2].find(i => inFloor(P, i)) ?? -1;
  const today = () => save.stat('meru2Day', 1), done = () => save.stat('ofhDone', null) || {};
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n), pick1 = a => a[Math.floor(Math.random() * a.length)];
  const LOOKS = [['#2e4a6b', '#e7e4dc', '#16263c'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#5d6f82', '#e7e4dc', '#334155'], ['#4f7d3a', '#e2d2b4', '#2a3d20'], ['#7a1d2a', '#f3f2f2', '#3d1218'], ['#e07a1f', '#f3f2f2', '#7a3d1a']];
  // ================= the stations (lift on the left wall → keeper's desk at x 5 stays clear) =================
  const PROPS = [0, 1, 2].map(fi => { const R = mk(), b = R.box, c = R.cyl, s = R.sph, G = FG[fi];
    if (fi === 0) { b(1.8, 0.08, 0.9, OAK, -4.6, 0.8, -6.4); for (const dx of [-0.8, 0.8]) for (const dz of [-0.35, 0.35]) b(0.07, 0.8, 0.07, DKW, -4.6 + dx, 0.4, -6.4 + dz); for (let k = 0; k < 5; k++) b(0.3, 0.012, 0.4, PAPER, -5.1 + k * 0.05, 0.85 + k * 0.012, -6.4, k * 0.1); b(0.2, 0.3, 0.2, GRN, -3.9, 0.99, -6.6); rectL(-5.6, -3.6, -6.9, -5.9, 0);
      b(0.06, 1.0, 0.06, INK, -4.6, 1.3, -6.86);
      for (let k = 0; k < 4; k++) { b(0.8, 1.4, 0.7, STEEL, -4.5 + k * 0.9, 0.7, 9.45); for (let r = 0; r < 3; r++) { b(0.6, 0.03, 0.02, INK, -4.5 + k * 0.9, 0.35 + r * 0.42, 9.09); b(0.18, 0.05, 0.03, PAPER, -4.5 + k * 0.9, 0.48 + r * 0.42, 9.09); } } rectL(-5.0, -1.3, 9.0, 10, 0);
      b(0.5, 0.06, 0.4, BLACK, 4.9, 1.16, -1.5); }
    if (fi === 1) { b(1.8, 0.08, 0.9, PINE, -4.6, 0.8, 6.6); for (const dx of [-0.8, 0.8]) for (const dz of [-0.35, 0.35]) b(0.07, 0.8, 0.07, WAL, -4.6 + dx, 0.4, 6.6 + dz); b(0.5, 0.16, 0.4, '#3d3b3a', -4.9, 0.92, 6.6); for (let k = 0; k < 6; k++) b(0.06, 0.03, 0.06, PAPER, -5.05 + (k % 3) * 0.12, 1.01, 6.52 + Math.floor(k / 3) * 0.12); b(0.03, 0.4, 0.2, PAPER, -4.65, 1.06, 6.6, 0, 0, 0.3); rectL(-5.6, -3.6, 6.1, 7.1, 1);
      b(0.06, 1.0, 0.06, INK, -4.6, 1.3, 7.06);
      b(0.5, 1.1, 0.4, WAL, 1.6, 0.55, 7.2); b(0.9, 0.06, 0.6, PAPER, 1.6, 1.15, 7.2, 0, -0.25); b(0.02, 0.07, 0.6, INK, 1.6, 1.17, 7.2, 0, -0.25); rectL(1.2, 2.0, 6.9, 7.5, 1); b(0.06, 1.0, 0.06, INK, 1.6, 1.6, 7.46); }
    if (fi === 2) { b(0.7, 0.8, 0.5, PAPER, 2.6, 0.4, -6.4); b(0.6, 0.04, 0.4, STEEL, 2.6, 0.82, -6.4); for (const [dx, cl] of [[-0.2, STEEL], [0, BLUE], [0.2, STEEL]]) b(0.04, 0.02, 0.25, cl, 2.6 + dx, 0.85, -6.4); c(0.06, 0.06, 0.12, '#7cc7e8', 2.42, 0.9, -6.25, 8); rectL(2.25, 2.95, -6.65, -6.15, 2);
      b(0.4, 0.5, 0.4, TOOTH, -1.8, 0.25, -8.6); s(0.16, '#ffffff', -1.8, 0.62, -8.6); }
    R.mesh(G);
    const plates = fi === 0 ? [['FIND THE CLAUSE', -4.6, 2.0, -6.84, 0], ['FILE THE PAPERS', -3.1, 2.6, 9.83, Math.PI]] : fi === 1 ? [['ADD IT UP', -4.6, 2.0, 7.04, Math.PI], ['SPOT THE ERROR', 1.6, 2.3, 7.44, Math.PI]] : [['HOLD THE LIGHT \u00b7 BRUSH \u00b7 FLOSS \u00b7 CALM', 0.5, 3.0, -9.83, 0]];
    for (const [t, x, y, z, ry] of plates) planeT(plate(t, t.length > 20 ? 768 : 384, 96, INK, PAPER, RED), t.length > 20 ? 3.6 : 1.5, t.length > 20 ? 0.44 : 0.36, x, y, z, ry, G);
    return R; });
  const prize = [0, 1, 2].map(fi => { const g = new THREE.Group(), S = mk();
    if (fi === 0) { S.cyl(0.05, 0.05, 0.16, GOLD, 0, 0.05, 0, 10, 0, Math.PI / 2); S.cyl(0.012, 0.012, 0.22, WAL, 0.02, 0.05, 0.1, 6, Math.PI / 2); S.cyl(0.07, 0.07, 0.03, DKW, 0, -0.02, -0.18, 12); }
    else if (fi === 1) { S.box(0.3, 0.02, 0.2, GOLD, 0, 0, 0); S.box(0.02, 0.2, 0.2, GOLD, -0.14, 0.1, 0); S.box(0.02, 0.2, 0.2, GOLD, 0.14, 0.1, 0); for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) S.sph(0.025, r === 1 ? RED : INK, -0.08 + k * 0.05 + (r % 2) * 0.02, 0.05 + r * 0.05, 0); }
    else { S.sph(0.08, GOLD, 0, 0.1, 0); S.box(0.05, 0.1, 0.05, GOLD, -0.04, 0.02, 0); S.box(0.05, 0.1, 0.05, GOLD, 0.04, 0.02, 0); }
    S.mesh(g); g.position.set(5.0, 1.2, 1.4); FG[fi].add(g); g.visible = false; return g; });
  const quill = new THREE.Group(); { const S = mk(); S.cyl(0.006, 0.02, 0.4, GOLD, 0, 0.18, 0, 6, 0.3); S.box(0.08, 0.26, 0.012, '#f3e6c0', 0.03, 0.26, 0.05, 0, 0.3); S.cyl(0.05, 0.05, 0.05, INK, 0, 0, 0, 10); S.mesh(quill); } quill.position.set(5.0, 1.15, -1.0); FG[1].add(quill); quill.visible = false;
  // ================= FOXES: the three keepers (replace the floors' quiet keepers) =================
  const KP0 = [6.6, 0, -Math.PI / 2], KEEP = [['officeLawyer', 'Lawyer', 'FLOOR 1 \u00b7 LAWYER', 'suit', ['#334155', '#f3f2f2', '#1e293b']], ['officeAccountant', 'Accountant', 'FLOOR 2 \u00b7 ACCOUNTANT', 'suit', ['#5d6f82', '#f3f2f2', '#334155']], ['officeDentist', 'Dentist', 'FLOOR 3 \u00b7 DENTIST', 'coat', ['#f3f2f2', '#2e86b8', '#9aa0a6']]];
  const keepers = F.map((R, fi) => { const old = R.keeper; if (old && old.parent) old.parent.remove(old); R.keeper = null; const [key, name, role, outfit, torso] = KEEP[fi];
    const f = kit.makeFox({ key, name, torso, outfit, mood: 'warm' }); f.position.set(KP0[0], 0, KP0[1]); f.rotation.y = KP0[2]; f.userData.noCull = true; f.userData.rosterShop = 'SPIRE OFFICES'; f.userData.rosterRole = 'keeper'; FG[fi].add(f); return f; });
  const GAMES = [{ k: 'clause', name: 'Find the Clause', fi: 0, color: NAVY }, { k: 'file', name: 'File the Papers', fi: 0, color: STEEL }, { k: 'add', name: 'Add It Up', fi: 1, color: GOLD }, { k: 'ledger', name: 'Spot the Error', fi: 1, color: RED },
    { k: 'light', name: 'Hold the Light', fi: 2, color: YEL }, { k: 'brush', name: 'Brush', fi: 2, color: BLUE }, { k: 'floss', name: 'Floss', fi: 2, color: GRN }, { k: 'calm', name: 'Calm the Patient', fi: 2, color: GUM }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), FGAMES = [0, 1, 2].map(fi => GAMES.filter(q => q.fi === fi));
  const RINGS = { clause: [-4.6, -4.8], file: [-3.1, 7.6], add: [-4.6, 5.0], ledger: [1.6, 5.6], light: [2.2, -4.4], brush: [-1.2, -4.4], floss: [-1.6, -6.8], calm: [0.5, -2.9] };
  const lampsOn = () => { const h = hour(); return h >= 19 || h < 7; };
  const K = [0, 1, 2].map(fi => shopKit({ THREE, G: FG[fi], scene, kit, save, camera, touch, hour, isMuted, prefix: 'ofh', color: [NAVY, '#5d6f82', BLUE][fi], boardTitle: ['Lawyer board', 'Accountant board', 'Dentist board'][fi], room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [-7.8, -2], keeper: keepers[fi], keeperRy: KP0[2], games: FGAMES[fi], toWorld: v => v.add(FG[fi].position),
    board: { x: fi === 0 ? 1.6 : -3.2, y: 2.4, z: 9.83, ry: Math.PI, w: 1.4 }, hiring: { x: -4.6, z: 2.4, ry: Math.PI / 2 }, hiringLine: FGAMES[fi].map(q => q.name.toUpperCase()).join(' \u00b7 '), sun: [{ x: -2, z: 4, w: 2.4, d: 1.6 }, { x: 2, z: -3, w: 2.4, d: 1.6 }],
    lamps: [[0, RH - 1.3, -5], [0, RH - 1.3, 0], [0, RH - 1.3, 5]], lampsOn, browse: fi === 2 ? [] : [[-6.4, 5.2, Math.PI]], looks: [LOOKS[fi + 1]], clock: { x: 3.4, y: 3.1, z: 9.83, ry: Math.PI } }));
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringMeshes = {};
  for (const k in RINGS) { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(RINGS[k][0], 0.03, RINGS[k][1]); FG[GN[k].fi].add(m); ringMeshes[k] = m; }
  // ================= KIT: sound, toast, fade, card, panel, arrow =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const AC = () => (ac = ac || new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { const a = AC(), t = a.currentTime + at, o = a.createOscillator(), gn = a.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(a.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, blip = () => tone(880, 0.04, 0.08, 'square');
  const liftDing = () => { tone(1046, 0.06, 0.6); tone(1318, 0.05, 0.7, 'sine', 0.18); };
  let veil = null, fading = false; const fade = fn => { if (fading) { setTimeout(() => fade(fn), 380); return; } fading = true; if (!veil) { veil = document.createElement('div'); Object.assign(veil.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity .28s', zIndex: '40' }); document.body.appendChild(veil); }
    void veil.offsetWidth; veil.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { veil.style.opacity = '0'; fading = false; }, 160); } }, 300); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,270px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(36vw, 250px)' : 'min(58vw, 270px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + ACC + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = (next, stopBtn) => '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span>' + (stopBtn ? '<button data-stop style="pointer-events:auto;min-height:44px;min-width:64px;padding:0 12px;text-align:left;background:#f3f2f2;color:#201e1d;border:2px solid #f3f2f2;border-radius:0;font:900 12px Archivo,sans-serif;cursor:pointer">STOP</button>' : '') + '</div>';
  const steps = items => '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">' + items.map(([t, ok]) => '<span style="padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;line-height:1.3;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffd23a' : '#201e1d') + '">' + (ok ? '\u2713 ' : '') + t + '</span>').join('') + '</div>';
  const tipH = (who, t) => '<div style="margin-top:6px;font-size:12px;font-weight:800;line-height:1.3"><span style="color:' + RED + ';font-weight:900">' + who + ' \u00b7 </span>' + t + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; const b = card.querySelector('[data-stop]'); if (b) b.onclick = e => { e.stopPropagation(); quit(); }; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const stopEv = el => { for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'touchstart', 'touchmove']) el.addEventListener(ev, e => e.stopPropagation(), { passive: true }); };
  const PANEL = document.createElement('div'); PANEL.style.cssText = 'position:fixed;z-index:34;display:none;flex-direction:column;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;box-sizing:border-box;overflow:hidden;-webkit-user-select:none;user-select:none;touch-action:none';
  document.body.appendChild(PANEL); stopEv(PANEL);
  const sideM = () => { const W = innerWidth, H = innerHeight; return H < 520 ? Math.max(8, Math.min(180, (W - 320) / 2)) : 8; };
  const fitPanel = () => { const W = innerWidth, H = innerHeight, short = H < 520, side = sideM(), w = Math.min(640, W - side * 2); Object.assign(PANEL.style, { left: Math.round((W - w) / 2) + 'px', width: Math.round(w) + 'px', top: (short ? 8 : 56) + 'px', bottom: (short ? 8 : 80) + 'px' }); };
  const panelHead = (l, r) => '<div style="display:flex;align-items:center;gap:10px;background:' + ACC + ';color:#fff;padding:0 0 0 12px;font-weight:900;font-size:14px;flex:none;min-height:46px"><span data-h style="flex:1;min-width:0;padding:6px 0;line-height:1.2;text-wrap:balance">' + l + '</span><span style="white-space:nowrap">' + r + '</span><button data-stop style="align-self:stretch;min-width:72px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 13px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">STOP</button></div>';
  const tipBar = t => '<div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:13px;padding:8px 12px">' + t + '</div>';
  const showPanel = (html, onStop) => { fitPanel(); PANEL.innerHTML = html; PANEL.style.display = 'flex'; const b = PANEL.querySelector('[data-stop]'); if (b) b.onclick = () => (onStop ? onStop() : quit()); };
  const hidePanel = () => { PANEL.style.display = 'none'; PANEL.innerHTML = ''; };
  addEventListener('resize', () => { if (PANEL.style.display !== 'none' && J && GD[J.g] && GD[J.g].draw ) { fitPanel(); GD[J.g].draw(); } });
  const shake = el => { try { el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 }); } catch (e) {} };
  const pulse = el => { if (!el) return; el.style.outline = '4px solid #ffd23a'; try { el.animate([{ outlineColor: '#ffd23a', outlineWidth: '4px' }, { outlineColor: 'rgba(255,210,58,0)', outlineWidth: '8px' }], { duration: 700, iterations: 3 }); } catch (e) {} };
  const BTN = 'min-width:0;min-height:56px;padding:6px 10px;text-align:left;background:#fff;color:#201e1d;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;line-height:1.15;cursor:pointer;outline:0 solid transparent';
  const timeRow = '<div data-time style="height:8px;background:#201e1d;width:100%;flex:none"></div>';
  const ARW = document.createElement('div'); ARW.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;background:#201e1d;color:#ffd23a;font-weight:900;font-size:15px;padding:6px 10px;border:2px solid #ffd23a;white-space:nowrap;transform:translate(-50%,-100%)';
  document.body.appendChild(ARW); const tmp = V();
  function arrowTo(w, label) { if (!w) { ARW.style.display = 'none'; return; } tmp.copy(w).project(camera); let x = (tmp.x + 1) / 2 * innerWidth, y = (1 - tmp.y) / 2 * innerHeight; const behind = tmp.z > 1; if (behind) { x = innerWidth - x; y = innerHeight - y; }
    const m = 120, mr = innerWidth < 600 ? 130 : 270, mt = innerHeight < 520 ? 60 : 130, mb = innerHeight < 520 ? 70 : 250, off = behind || x < m || x > innerWidth - mr || y < mt || y > innerHeight - mb, cx = innerWidth / 2, cy = innerHeight / 2;
    let ar = '\u25bc'; if (off) { const a = Math.atan2(y - cy, x - cx); x = clamp(x, m, innerWidth - mr); y = clamp(y, mt, innerHeight - mb); ar = '<span style="display:inline-block;transform:rotate(' + (a * 180 / Math.PI + 90).toFixed(0) + 'deg)">\u25b2</span>'; }
    ARW.style.display = 'block'; ARW.style.left = Math.round(x) + 'px'; ARW.style.top = Math.round(y) + 'px'; const h = ar + ' ' + label; if (ARW._h !== h) { ARW._h = h; ARW.innerHTML = h; } }
  // ================= state =================
  let busy = null, J = null, lastP = null, lastFox = null, snapK = false, endClear = 0;
  const addGold = n => { n = Math.max(0, Math.round(n)); if (!J) return 0; J.gold += n; save.addGold(n); coin(); return n; };
  const missOne = (msg, s = 1.8) => { if (!J) return; J.miss++; nope(); toast(msg, s); const tip = PANEL.style.display !== 'none' && PANEL.querySelector('[data-tip]'); if (tip) { tip.textContent = msg; tip.style.background = '#ec3013'; tip.style.color = '#ffffff'; } };
  const okTip = msg => { const tip = PANEL.querySelector('[data-tip]'); if (tip) { tip.textContent = msg; tip.style.background = '#201e1d'; tip.style.color = '#ffd23a'; } };
  const timeBar = (el, f, warn) => { if (!el) return; el.style.width = (clamp(f, 0, 1) * 100).toFixed(1) + '%'; el.style.background = warn ? RED : INK; };
  const ln = (who, role) => text => ({ who, role, text });
  const goRoom = (x, z, yaw, fi = 0) => go(F[fi].ox + x, LY, LZ + z, yaw);
  const turnTo = (f, want, dt, k = 4) => { let d = want - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * k); };
  const armUp = (f, side, rz, rx = 0) => { const A = f && f.userData && f.userData.P && f.userData.P.arms; if (A && A[side]) { A[side].rotation.z = rz; A[side].rotation.x = rx; } };
  const GD = {};
  // a quick "round" engine for the panel jobs: list, ci, cueT, wait, draw, next, tick with timer + hint after 3 s
  const roundTick = (D, dt, T, missMsg, hintSel) => { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / T, J.cueT < 3); if (J.cueT <= 0) { missOne(missMsg); D.next(); } }
    if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; const s = hintSel(); if (s) pulse(PANEL.querySelector(s)); } };
  const roundNext = (D, g, T) => { if (!J || J.g !== g) return; J.ci++; J.cueT = T; J.wait = 0.3; if (J.ci >= J.list.length) { addGold(6); D.draw(); setTimeout(finishGame, 800); return; } D.draw(); };
  const wrongBtn = (el, msg) => { missOne(msg); shake(el); el.disabled = true; el.style.opacity = '0.4'; };
  const goodBtn = el => { el.style.background = '#201e1d'; el.style.color = '#ffd23a'; };
  const nOf = () => Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, goldR = () => (J.gold ? J.gold + ' G' : 'SPIRE OFFICES');
  const body = inner => '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto">' + inner + '</div>';
  const wide = () => innerWidth > innerHeight * 1.1;

  const fitCv = cv => { if (!cv) return null; const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g, w, h }; };
  const cvTag = asp => '<canvas data-cv style="width:100%;display:block;touch-action:none;background:#e7e4dc;' + (wide() ? 'flex:1;min-height:100px' : 'aspect-ratio:' + asp + ';flex:none') + '"></canvas>';
  const bigBtn = t => '<button data-go style="' + BTN + ';flex:none;min-height:' + (wide() ? 56 : 72) + 'px;font-size:22px;background:#ec3013;color:#fff;touch-action:none">' + t + '</button>';
  const doneMsg = t => '<div style="font-size:22px;font-weight:900">' + t + '</div>';
  const keyAct = fn => { const kd = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) fn(); } }; addEventListener('keydown', kd, true); J.off = () => removeEventListener('keydown', kd, true); };
  const drag = (cv, onDown, onMove) => { if (!cv) return; cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; onDown(e); }; cv.onpointermove = e => { if (J && J.down) onMove(e); }; cv.onpointerup = cv.onpointercancel = () => { if (J) J.down = null; }; };
  const grain = (g, x0, y0, w, h, base, seed = 1) => { g.fillStyle = base; g.fillRect(x0, y0, w, h); g.strokeStyle = 'rgba(122,82,54,.4)'; g.lineWidth = 1.5; for (let k = 0; k < 6; k++) { const yy = y0 + h * (0.1 + k * 0.16); g.beginPath(); g.moveTo(x0, yy); for (let x = x0; x <= x0 + w; x += 16) g.lineTo(x, yy + Math.sin(x * 0.025 + k * 1.7 + seed) * 2.5); g.stroke(); } };
  const thunk = () => { tone(140, 0.09, 0.12, 'square'); tone(90, 0.07, 0.2, 'triangle', 0.02); };

  const CX = () => F[J ? J.fi : 0].ox;
  const T_K = fi => ({ key: KEEP[fi][0], name: KEEP[fi][1], role: KEEP[fi][2], obj: keepers[fi], ry: KP0[2], r: 6 }), kLn = fi => ln(KEEP[fi][1], KEEP[fi][2]);
  const listBtns = (items, attr) => '<div style="display:flex;flex-direction:column;gap:6px">' + items.map((t, i) => '<button ' + attr + '="' + i + '" style="' + BTN + ';min-height:48px;font-size:14px">' + t + '</button>').join('') + '</div>';
  const card2 = (kick, big, small, stamp) => '<div style="border:2px solid #201e1d;background:#fff;padding:10px 12px;display:flex;flex-direction:column;gap:4px;position:relative;flex:none"><span style="font-size:11px;font-weight:900;color:#ec3013">' + kick + '</span><span style="font-size:24px;font-weight:900;line-height:1.1">' + big + '</span>' + (small ? '<span style="font-size:13px;font-weight:800">' + small + '</span>' : '') + (stamp ? '<span style="position:absolute;right:10px;top:10px;border:3px solid #ec3013;color:#ec3013;font-weight:900;font-size:15px;padding:2px 6px;transform:rotate(-8deg)">' + stamp + '</span>' : '') + '</div>';
  // ---------- 1 FIND THE CLAUSE (lawyer): the client asks, tap the clause that answers it ----------
  const CONTRACTS = { 'FLAT RENTAL \u00b7 PEPPER PROPERTIES': [['PETS', 'One small pet is allowed. No snakes.'], ['RENT', 'Rent is due on the first day of each month.'], ['NOISE', 'No loud music after ten at night.'], ['REPAIRS', 'The landlord fixes the roof and the pipes.'], ['LEAVING', 'Give one month of notice before moving out.'], ['GUESTS', 'Guests may stay up to three nights.'], ['PAINT', 'Walls may only be painted white.'], ['KEYS', 'A lost key costs 20 gold to replace.']],
    'JOB CONTRACT \u00b7 VAX': [['PAY', 'Pay is 40 gold a week, paid on Fridays.'], ['HOURS', 'Work starts at nine and ends at five.'], ['HOLIDAY', 'Staff get ten days off each year.'], ['UNIFORM', 'The green VAX tie must be worn at all times.'], ['LUNCH', 'Lunch is one hour, at noon.'], ['LATE', 'Three late days in a month means a warning.'], ['SECRETS', 'Staff may not talk about VAX products in public.'], ['SICK', 'Sick days need a note from the dentist or the doctor.']],
    'BOAT SALE \u00b7 JON\u2019S BOATWORKS': [['PRICE', 'The price is 300 gold, half now, half later.'], ['DELIVERY', 'The boat goes to the jetty in one week.'], ['REFUND', 'Money back within three days if it sinks.'], ['REPAIRS', 'Free repairs for the first month.'], ['PAINT', 'The buyer picks the colour of the hull.'], ['NAME', 'The buyer may name the boat. Nothing rude.'], ['SAILS', 'Sails are sold separately.'], ['ENGINE', 'The engine is checked before delivery.']] };
  const QS = { PETS: 'CAN I KEEP MY HAMSTER?', RENT: 'WHEN DO I PAY THE RENT?', NOISE: 'CAN I PLAY DRUMS AT MIDNIGHT?', REPAIRS: 'WHO FIXES A LEAK?', LEAVING: 'HOW DO I MOVE OUT?', GUESTS: 'CAN MY COUSIN STAY A WEEK?', PAINT: 'CAN I CHOOSE THE COLOUR?', KEYS: 'I LOST MY KEY. NOW WHAT?', PAY: 'HOW MUCH DO I EARN?', HOURS: 'WHEN CAN I GO HOME?', HOLIDAY: 'HOW MANY DAYS OFF DO I GET?', UNIFORM: 'DO I HAVE TO WEAR THE TIE?', LUNCH: 'WHEN IS LUNCH?', LATE: 'WHAT IF I AM LATE?', SECRETS: 'CAN I TELL MY FRIENDS ABOUT WORK?', SICK: 'WHAT IF I AM ILL?', PRICE: 'HOW MUCH IS THE BOAT?', DELIVERY: 'WHEN DO I GET THE BOAT?', REFUND: 'WHAT IF IT SINKS?', NAME: 'CAN I CALL IT SIR FLOATS-A-LOT?', SAILS: 'DOES IT COME WITH SAILS?', ENGINE: 'IS THE ENGINE OK?' };
  const CLIENTS = ['MRS. FENNEC', 'OTTO', 'A SALT COUSIN', 'PELL', 'A PEPPER TENANT', 'MARLA'];
  const CLT = 14;
  GD.clause = { panel: true, shot: () => [toW(-4.6, 0.9, -6.4, 0), 2.4, 1.6, 0.6, 2.0, 0, 5],
    begin() { goRoom(-4.6, -4.8, Math.PI, 0); const types = Object.keys(CONTRACTS); J.list = CLIENTS.map((who, i) => { const ty = types[i % types.length], all = CONTRACTS[ty], cl = shuffle(pickN(all, 6)), ans = pick1(cl); return { who, ty, cl, ans: cl.indexOf(ans), q: QS[ans[0]] }; }); J.ci = 0; J.cueT = CLT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('FIND THE CLAUSE', goldR()) + body(doneMsg('SIX CLIENTS ANSWERED')) + tipBar('BILLED BY THE MINUTE')); return; }
      showPanel(panelHead('FIND THE CLAUSE \u00b7 CLIENT ' + nOf(), goldR()) + body('<div style="background:#201e1d;color:#f3f2f2;padding:8px 10px;font-weight:900;font-size:15px;flex:none"><span style="color:#ffd23a">' + c.who + ' \u00b7 </span>' + c.q + '</div><div style="font-size:11px;font-weight:900;color:#ec3013">' + c.ty + '</div>' + timeRow + listBtns(c.cl.map((x, i) => (i + 1) + '. ' + x[1]), 'data-c')) + tipBar('TAP THE CLAUSE THAT ANSWERS THE CLIENT'));
      PANEL.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => this.tap(+b.dataset.c, b); }); J.idle = 0; J.hinted = false; },
    tap(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; if (i !== c.ans) { wrongBtn(el, 'NOT THAT ONE \u00b7 READ THE QUESTION AGAIN'); return; } goodBtn(el); addGold(3); ding(); okTip('CLAUSE ' + (i + 1) + ' \u00b7 THE CLIENT IS HAPPY'); J.wait = 0.9; setTimeout(() => this.next(), 800); },
    next() { roundNext(this, 'clause', CLT); },
    tick(dt) { roundTick(this, dt, CLT, 'TOO SLOW \u00b7 THE CLIENT LEFT', () => '[data-c="' + J.list[J.ci].ans + '"]'); } };
  // ---------- 2 FILE THE PAPERS (lawyer): each file goes in its drawer by the first letter; URGENT ones go in the IN-TRAY ----------
  const NAMES = ['KIA', 'PELL', 'OTTO', 'MARLA', 'FENNEC', 'BRINE', 'JALAPE\u00d1O', 'BARNACLE', 'COGSWORTH', 'GLOSSA', 'PENN', 'FLICK', 'BRAUN', 'STERLING', 'CORAL', 'SPRITZ', 'ZEST', 'HOLLY', 'QUILL', 'TAM', 'ROOK', 'YUKI', 'DUNE', 'IVY', 'LARK', 'NOOK', 'ACE', 'WREN'];
  const DRAWERS = [['A \u2013 F', 'ABCDEF'], ['G \u2013 L', 'GHIJKL'], ['M \u2013 R', 'MNOPQR'], ['S \u2013 Z', 'STUVWXYZ'], ['IN-TRAY \u00b7 URGENT', '']], CASES = ['RENT DISPUTE', 'BOAT SALE', 'NOISY NEIGHBOUR', 'LOST PARCEL', 'JOB CONTRACT', 'FENCE ARGUMENT', 'WILL + TESTAMENT', 'PARKING TICKET'];
  const FLN = 12;
  GD.file = { panel: true, shot: () => [toW(-3.1, 0.8, 9.4, 0), 3.6, 1.8, 0.4, 2.4, Math.PI, 5],
    begin() { goRoom(-3.1, 7.6, 0, 0); J.list = shuffle(NAMES).slice(0, FLN).map((n, i) => { const urg = i >= 5 && Math.random() < 0.35; return { n, cs: pick1(CASES), urg, ans: urg ? 4 : DRAWERS.findIndex(d => d[1].includes(n[0])), T: Math.max(3.5, 6.5 - i * 0.3) }; }); J.ci = 0; J.cueT = J.list[0].T; J.wait = 0.4; snapK = true;
      const kd = e => { if (!J || J.g !== 'file') return; const m = /^Digit([1-5])$/.exec(e.code); if (m) { e.preventDefault(); e.stopPropagation(); this.tap(+m[1] - 1, PANEL.querySelector('[data-d="' + (+m[1] - 1) + '"]')); } }; addEventListener('keydown', kd, true); J.off = () => removeEventListener('keydown', kd, true); this.draw(); },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('FILE THE PAPERS', goldR()) + body(doneMsg('EVERY FILE IN ITS PLACE')) + tipBar('THE CLERK WEEPS WITH JOY')); return; }
      showPanel(panelHead('FILE THE PAPERS \u00b7 ' + nOf(), goldR()) + body(card2('CASE FILE \u00b7 ' + c.cs, c.n, 'CLIENT NAME \u00b7 FILE BY THE FIRST LETTER', c.urg ? 'URGENT' : '') + timeRow + '<div style="display:grid;grid-template-columns:repeat(' + (wide() ? 5 : 2) + ',minmax(0,1fr));gap:6px">' + DRAWERS.map((d, i) => '<button data-d="' + i + '" style="' + BTN + (i === 4 ? ';background:#ec3013;color:#fff' + (wide() ? '' : ';grid-column:1 / -1') : '') + '">' + (i + 1) + ' \u00b7 ' + d[0] + '</button>').join('') + '</div>') + tipBar('PICK THE DRAWER \u00b7 RED URGENT STAMP = IN-TRAY'));
      PANEL.querySelectorAll('[data-d]').forEach(b => { b.onclick = () => this.tap(+b.dataset.d, b); }); J.idle = 0; J.hinted = false; },
    tap(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0 || !el) return; J.idle = 0; if (i !== c.ans) { missOne(c.urg ? 'IT WAS URGENT \u00b7 IN-TRAY' : 'WRONG DRAWER \u00b7 ' + c.n[0] + ' GOES IN ' + DRAWERS[c.ans][0]); shake(el); } else { addGold(2); thunkS(); okTip('FILED'); }
      J.wait = 0.4; setTimeout(() => this.next(), 300); },
    next() { if (!J || J.g !== 'file') return; const n = J.list[J.ci + 1]; roundNext(this, 'file', n ? n.T : 4); },
    tick(dt) { roundTick(this, dt, J.list[Math.min(J.ci, J.list.length - 1)].T, 'TOO SLOW \u00b7 THE PILE GREW', () => '[data-d="' + J.list[J.ci].ans + '"]'); } };
  const thunkS = () => { tone(260, 0.06, 0.1, 'square'); tone(160, 0.05, 0.15, 'triangle', 0.03); };
  // ---------- 3 ADD IT UP (accountant): pick the right total for each receipt ----------
  const ITEMS = ['PAPER CLIPS', 'COFFEE', 'DESK LAMP', 'STAPLER', 'INK', 'PENCILS', 'CHAIR', 'LIFT REPAIR', 'PLANT', 'BISCUITS', 'TONER', 'CALCULATOR', 'STAMPS', 'FILE BOXES'];
  const ADT = 15, ADN = 6;
  GD.add = { panel: true, shot: () => [toW(-4.6, 0.9, 6.6, 1), 2.4, 1.6, 0.6, 2.0, Math.PI, 5],
    begin() { goRoom(-4.6, 5.0, 0, 1); J.list = [...Array(ADN)].map((_, i) => { const n = 3 + Math.floor(i / 2), lines = pickN(ITEMS, n).map(t => [t, i < 2 ? 5 * Math.floor(rnd(1, 12)) : Math.floor(rnd(3, 60))]), tot = lines.reduce((a, l) => a + l[1], 0);
      const sw = String(tot).length > 1 ? +String(tot).split('').reverse().join('') : tot + 20, opts = new Set([tot]); for (const v of shuffle([tot + 10, tot - 10, tot + 1, tot - 1, sw, tot + 5])) if (opts.size < 4 && v > 0 && v !== tot) opts.add(v); return { lines, tot, opts: shuffle([...opts]) }; }); J.ci = 0; J.cueT = ADT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('ADD IT UP', goldR()) + body(doneMsg('EVERY RECEIPT ADDS UP')) + tipBar('TO THE PENNY')); return; }
      const rc = '<div style="border:2px solid #201e1d;background:#fff;padding:8px 12px;font:800 15px Archivo,sans-serif;display:flex;flex-direction:column;gap:3px;flex:none">' + c.lines.map(([t, v]) => '<div style="display:flex;justify-content:space-between;gap:10px"><span>' + t + '</span><span>' + v + ' G</span></div>').join('') + '<div style="border-top:2px dashed #201e1d;margin-top:4px;padding-top:4px;display:flex;justify-content:space-between;font-weight:900"><span>TOTAL</span><span style="color:#ec3013">? G</span></div></div>';
      showPanel(panelHead('ADD IT UP \u00b7 RECEIPT ' + nOf(), goldR()) + body((wide() ? '<div style="display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:8px;align-items:start">' + rc + '<div style="display:grid;grid-template-columns:minmax(0,1fr);gap:6px">' : rc + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px">') + c.opts.map(v => '<button data-v="' + v + '" style="' + BTN + ';font-size:20px">' + v + ' G</button>').join('') + '</div>' + (wide() ? '</div>' : '') + timeRow) + tipBar('ADD THE LINES \u00b7 TAP THE RIGHT TOTAL'));
      PANEL.querySelectorAll('[data-v]').forEach(b => { b.onclick = () => this.tap(+b.dataset.v, b); }); J.idle = 0; J.hinted = false; },
    tap(v, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; if (v !== c.tot) { wrongBtn(el, 'NOT QUITE \u00b7 ADD IT AGAIN'); return; } goodBtn(el); addGold(3); ding(); okTip(c.tot + ' G \u00b7 CORRECT'); J.wait = 0.8; setTimeout(() => this.next(), 700); },
    next() { roundNext(this, 'add', ADT); },
    tick(dt) { roundTick(this, dt, ADT, 'TOO SLOW \u00b7 THE CLIENT IS TAPPING THE DESK', () => '[data-v="' + J.list[J.ci].tot + '"]'); } };
  // ---------- 4 SPOT THE ERROR (accountant): one balance in the ledger is wrong; tap that row ----------
  const LGT = 18, LGN = 6, LDESC = ['SALES', 'RENT', 'WAGES', 'LUNCH', 'REPAIRS', 'A REFUND', 'POSTAGE', 'NEW CHAIRS', 'TIPS', 'GIFT FROM VAX', 'LIFT FEES', 'FLOWERS'];
  GD.ledger = { panel: true, shot: () => [toW(1.6, 1.2, 7.2, 1), 2.0, 1.4, 0.5, 1.8, Math.PI, 5],
    begin() { goRoom(1.6, 5.6, 0, 1); J.list = [...Array(LGN)].map((_, i) => { let bal = 100 + 10 * Math.floor(rnd(0, 20)); const start = bal, rows = [], bad = 1 + Math.floor(Math.random() * 5);
        for (let r = 0; r < 6; r++) { const amt = (i < 2 ? 10 : 1) * Math.floor(rnd(i < 2 ? 1 : 5, i < 2 ? 9 : 90)), inn = Math.random() < 0.5 || bal - amt < 20; bal += inn ? amt : -amt; let shown = bal; if (r === bad) { shown = bal + pick1(i < 3 ? [10, -10, 100, -100] : [1, -1, 9, -9, 10, -10]); bal = shown; } rows.push({ d: pick1(LDESC), inn, amt, bal: shown }); }
        return { start, rows, bad }; }); J.ci = 0; J.cueT = LGT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('SPOT THE ERROR', goldR()) + body(doneMsg('THE BOOKS BALANCE')) + tipBar('SUSPICIOUSLY TIDY')); return; }
      const cell = 'padding:6px 8px;border-bottom:2px solid #201e1d;font-weight:800;font-size:14px';
      showPanel(panelHead('SPOT THE ERROR \u00b7 LEDGER ' + nOf(), goldR()) + body('<div style="display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);border:2px solid #201e1d;background:#fff;flex:none"><span style="' + cell + ';background:#201e1d;color:#ffd23a">ITEM</span><span style="' + cell + ';background:#201e1d;color:#ffd23a">IN</span><span style="' + cell + ';background:#201e1d;color:#ffd23a">OUT</span><span style="' + cell + ';background:#201e1d;color:#ffd23a">BALANCE</span><span style="' + cell + '">START</span><span style="' + cell + '"></span><span style="' + cell + '"></span><span style="' + cell + '">' + c.start + '</span></div>'
        + '<div style="display:flex;flex-direction:column;gap:4px">' + c.rows.map((r, i) => '<button data-r="' + i + '" style="' + BTN + ';min-height:44px;padding:0;display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);align-items:center;font-size:14px"><span style="padding:0 8px">' + r.d + '</span><span style="padding:0 8px;color:#2f7d5a">' + (r.inn ? '+' + r.amt : '') + '</span><span style="padding:0 8px;color:#ec3013">' + (r.inn ? '' : '\u2212' + r.amt) + '</span><span style="padding:0 8px">' + r.bal + '</span></button>').join('') + '</div>' + timeRow) + tipBar('ONE BALANCE IS WRONG \u00b7 TAP ITS ROW'));
      PANEL.querySelectorAll('[data-r]').forEach(b => { b.onclick = () => this.tap(+b.dataset.r, b); }); J.idle = 0; J.hinted = false; },
    tap(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; if (i !== c.bad) { wrongBtn(el, 'THAT ROW ADDS UP \u00b7 CHECK EACH ONE FROM THE TOP'); return; } goodBtn(el); addGold(4); ding(); okTip('FOUND IT \u00b7 FIXED IN RED INK'); J.wait = 0.9; setTimeout(() => this.next(), 800); },
    next() { roundNext(this, 'ledger', LGT); },
    tick(dt) { roundTick(this, dt, LGT, 'TOO SLOW \u00b7 THE AUDIT STARTED', () => '[data-r="' + J.list[J.ci].bad + '"]'); } };
  // ---------- mouth drawing (dentist jobs) ----------
  const teethPos = () => { const out = []; for (let k = 0; k < 8; k++) { const u = (k - 3.5) / 3.5; out.push({ x: 0.5 + u * 0.3, y: 0.36 + 0.07 * u * u, top: 1 }); } for (let k = 0; k < 8; k++) { const u = (k - 3.5) / 3.5; out.push({ x: 0.5 + u * 0.27, y: 0.66 - 0.07 * u * u, top: 0 }); } return out; };
  const TP = teethPos();
  const drawMouth = (g, w, h, hi) => { const s = Math.min(w, h * 1.4), X = u => (w - s) / 2 + u * s, Y = v => (h - s / 1.4) / 2 + v * s / 1.4; g.fillStyle = '#e07a1f'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7a1d2a'; g.beginPath(); g.ellipse(X(0.5), Y(0.51), s * 0.4, s / 1.4 * 0.3, 0, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#201e1d'; g.stroke();
    g.fillStyle = GUM; g.beginPath(); g.ellipse(X(0.5), Y(0.3), s * 0.36, s / 1.4 * 0.07, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(X(0.5), Y(0.72), s * 0.33, s / 1.4 * 0.06, 0, 0, 7); g.fill();
    g.fillStyle = '#d94f6a'; g.beginPath(); g.ellipse(X(0.5), Y(0.56), s * 0.16, s / 1.4 * 0.06, 0, 0, 7); g.fill();
    TP.forEach((t, i) => { const tw = s * 0.07, th = s / 1.4 * 0.11; g.fillStyle = i === hi ? '#fff6c8' : TOOTH; g.fillRect(X(t.x) - tw / 2, Y(t.y) - th / 2, tw, th); g.strokeStyle = '#201e1d'; g.lineWidth = 1.5; g.strokeRect(X(t.x) - tw / 2, Y(t.y) - th / 2, tw, th); });
    return { X, Y, s }; };
  // ---------- 5 HOLD THE LIGHT: keep the beam on the tooth the dentist is working on ----------
  const LTN = 5, LTT = 12, LTHOLD = 3;
  GD.light = { panel: true, shot: () => [toW(0.5, 1.0, -5.6, 2), 2.4, 1.6, 0.6, 2.0, 0, 5],
    begin() { goRoom(2.2, -4.4, -2.5, 2); J.list = [...Array(LTN)].map((_, i) => ({ t: Math.floor(Math.random() * 16), sp: 0.3 + i * 0.25 })); J.ci = 0; J.cueT = LTT; J.wait = 0.4; J.lit = 0; J.dark = 0; J.lp = null; J.on = false; J.ph = 0; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; showPanel(panelHead('HOLD THE LIGHT \u00b7 TOOTH ' + nOf(), goldR()) + body(c ? cvTag('7/5') + timeRow : doneMsg('THE DENTIST SAW EVERYTHING')) + tipBar('DRAG THE LIGHT ONTO THE YELLOW RING \u00b7 HOLD IT THERE'));
      const cv = PANEL.querySelector('[data-cv]'); if (cv) { const mv = e => { const r = cv.getBoundingClientRect(); J.lp = { x: e.clientX - r.left, y: e.clientY - r.top }; J.on = true; J.idle = 0; }; drag(cv, mv, mv); } },
    target(w, h) { const c = J.list[J.ci], q = this.M || { X: u => u * w, Y: v => v * h, s: w }, t = TP[c.t], ox = Math.sin(J.ph * 1.3) * 0.05 * Math.min(1, c.sp), oy = Math.cos(J.ph * 0.9) * 0.03 * Math.min(1, c.sp); return { x: q.X(t.x + ox), y: q.Y(t.y + oy), r: q.s * 0.07 }; },
    tick(dt) { const c = J.list[J.ci]; if (c && J.wait <= 0) { J.ph += dt * c.sp * 2; const f = fitCv(PANEL.querySelector('[data-cv]')); if (f && J.on && J.lp) { const T = this.target(f.w, f.h), d = Math.hypot(J.lp.x - T.x, J.lp.y - T.y); if (d < T.r * 1.5) { J.lit += dt; J.dark = Math.max(0, J.dark - dt); if (Math.random() < 0.05) tone(1200, 0.01, 0.05, 'triangle'); } else { J.dark += dt; if (J.dark > 1.6) { J.dark = 0; missOne('TOO DARK \u00b7 THE DENTIST CANNOT SEE'); } } }
        if (J.lit >= LTHOLD) { addGold(3); ding(); okTip('GOT IT \u00b7 NEXT TOOTH'); J.lit = 0; J.dark = 0; J.wait = 0.6; setTimeout(() => this.next(), 500); } }
      roundTick(this, dt, LTT, 'TOO SLOW \u00b7 THE PATIENT YAWNED', () => '[data-cv]'); this.render(); },
    next() { if (!J || J.g !== 'light') return; J.lit = 0; J.dark = 0; roundNext(this, 'light', LTT); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f; this.M = drawMouth(g, w, h, c.t); const T = this.target(w, h);
      g.strokeStyle = YEL; g.lineWidth = 4; g.beginPath(); g.arc(T.x, T.y, T.r * 1.5, 0, 7); g.stroke(); g.fillStyle = STEEL; g.beginPath(); g.arc(T.x + T.r * 2.2, T.y - T.r * 1.6, T.r * 0.6, 0, 7); g.fill(); g.fillRect(T.x + T.r * 2.4, T.y - T.r * 1.6, T.r * 3, 4);
      g.fillStyle = 'rgba(0,0,0,' + (0.35 + Math.min(0.3, J.dark * 0.2)) + ')'; g.fillRect(0, 0, w, h);
      if (J.lp) { const R = T.r * 2.2, gr = g.createRadialGradient(J.lp.x, J.lp.y, 0, J.lp.x, J.lp.y, R); gr.addColorStop(0, 'rgba(255,250,220,.75)'); gr.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = gr; g.fillRect(J.lp.x - R, J.lp.y - R, R * 2, R * 2); }
      const mw = w * 0.3; g.fillStyle = PAPER; g.fillRect(8, 8, mw, 12); g.fillStyle = '#7cff9b'; g.fillRect(8, 8, mw * Math.min(1, J.lit / LTHOLD), 12); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(8, 8, mw, 12);
      if (!J.on) { g.fillStyle = YEL; g.font = '900 ' + Math.round(Math.max(13, h * 0.06)) + 'px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText('TOUCH + DRAG THE LIGHT', 8, h - 12); } } };
  // ---------- 6 BRUSH: brush the plaque off every tooth; scrubbing the gums hurts ----------
  const BRN = 4, BRT = 20;
  GD.brush = { panel: true, shot: () => [toW(0.5, 1.0, -5.6, 2), 2.4, 1.6, 0.6, 2.0, 0, 5],
    begin() { goRoom(-1.2, -4.4, 2.5, 2); J.list = [...Array(BRN)].map((_, i) => ({ sp: [...Array(6 + i * 2)].map(() => ({ k: Math.floor(Math.random() * 8), y: rnd(0.25, 0.85), hp: 1 })) })); J.ci = 0; J.cueT = BRT; J.wait = 0.4; J.down = null; J.gum = 0; J.ouchT = 0; snapK = true; this.draw(); },
    lay(w, h) { const tw = w / 9, x0 = (w - tw * 8) / 2, gy = h * 0.08, gh = h * 0.18, ty = gy + gh, th = h * 0.66; return { tw, x0, gy, gh, ty, th }; },
    draw() { const c = J.list[J.ci]; showPanel(panelHead('BRUSH \u00b7 MOUTH ' + nOf(), goldR()) + body(c ? cvTag('16/9') + timeRow : doneMsg('SPARKLING FANGS')) + tipBar('SCRUB THE YELLOW OFF THE TEETH \u00b7 KEEP OFF THE PINK GUMS'));
      const cv = PANEL.querySelector('[data-cv]'); if (cv) drag(cv, e => { const r = cv.getBoundingClientRect(); J.down = { x: e.clientX - r.left, y: e.clientY - r.top }; }, e => { const r = cv.getBoundingClientRect(), p = { x: e.clientX - r.left, y: e.clientY - r.top }; this.scrub(J.down, p, r.width, r.height); if (J) J.down = p; }); },
    scrub(a, b, w, h) { const c = J.list[J.ci]; if (!c || J.wait > 0 || !a) return; J.idle = 0; const q = this.lay(w, h), d = Math.hypot(b.x - a.x, b.y - a.y);
      if (b.y < q.ty && b.y > q.gy) { J.gum += d / h; if (J.gum > 0.6 && J.ouchT <= 0) { J.gum = 0; J.ouchT = 1; missOne('OUCH \u00b7 MIND THE GUMS'); } }
      for (const s of c.sp) { if (s.hp <= 0) continue; const sx = q.x0 + (s.k + 0.5) * q.tw, sy = q.ty + s.y * q.th; if (Math.hypot(b.x - sx, b.y - sy) < q.tw * 0.45) { s.hp -= d / h * 2.2; if (s.hp <= 0) tone(1600, 0.03, 0.06, 'triangle'); } }
      if (Math.random() < 0.25) tone(2600 + Math.random() * 600, 0.005, 0.04, 'sawtooth');
      if (c.sp.every(s => s.hp <= 0)) { addGold(4); ding(); okTip('SPARKLING'); J.wait = 0.9; J.down = null; setTimeout(() => this.next(), 700); } },
    next() { if (!J || J.g !== 'brush') return; J.down = null; J.gum = 0; roundNext(this, 'brush', BRT); },
    tick(dt) { J.ouchT -= dt; J.gum = Math.max(0, J.gum - dt * 0.3); roundTick(this, dt, BRT, 'TOO SLOW \u00b7 THE MINT WORE OFF', () => '[data-cv]'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, q = this.lay(w, h); g.fillStyle = '#7a1d2a'; g.fillRect(0, 0, w, h); g.fillStyle = GUM; g.fillRect(0, q.gy, w, q.gh + 6);
      for (let k = 0; k < 8; k++) { const x = q.x0 + k * q.tw; g.fillStyle = TOOTH; g.fillRect(x + 3, q.ty, q.tw - 6, q.th); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x + 3, q.ty, q.tw - 6, q.th); }
      for (const s of c.sp) { if (s.hp <= 0) continue; g.globalAlpha = 0.3 + 0.7 * s.hp; g.fillStyle = '#d9b44a'; g.beginPath(); g.arc(q.x0 + (s.k + 0.5) * q.tw, q.ty + s.y * q.th, q.tw * 0.28, 0, 7); g.fill(); g.globalAlpha = 1; }
      if (J.ouchT > 0) { g.fillStyle = 'rgba(236,48,19,' + (J.ouchT * 0.4) + ')'; g.fillRect(0, q.gy, w, q.gh + 6); }
      if (J.down) { g.fillStyle = BLUE; g.fillRect(J.down.x - 4, J.down.y, 8, h * 0.4); g.fillStyle = PAPER; g.fillRect(J.down.x - 14, J.down.y - 10, 28, 12); g.strokeStyle = INK; g.strokeRect(J.down.x - 14, J.down.y - 10, 28, 12); }
      g.fillStyle = PAPER; g.font = '900 ' + Math.round(Math.max(12, h * 0.06)) + 'px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText('PLAQUE ' + c.sp.filter(s => s.hp > 0).length, 8, h - 8); } };
  // ---------- 7 FLOSS: hold to slide the floss down the gap, let go in the green; too deep hurts ----------
  const FSN = 8, FST = 10;
  GD.floss = { panel: true, shot: () => [toW(0.5, 1.0, -5.6, 2), 2.4, 1.6, 0.6, 2.0, 0, 5],
    begin() { goRoom(-1.6, -6.8, 2.0, 2); J.list = [...Array(FSN)].map((_, i) => ({ gc: rnd(0.55, 0.72), gw: 0.2 - i * 0.012, sp: 0.5 + i * 0.07 })); J.ci = 0; J.cueT = FST; J.wait = 0.4; J.dep = 0; J.hold = false; snapK = true;
      const kd = e => { if (!J || J.g !== 'floss' || (e.code !== 'Space' && e.code !== 'Enter')) return; e.preventDefault(); e.stopPropagation(); if (e.type === 'keydown') { if (!e.repeat) this.press(); } else this.release(); };
      addEventListener('keydown', kd, true); addEventListener('keyup', kd, true); J.off = () => { removeEventListener('keydown', kd, true); removeEventListener('keyup', kd, true); }; this.draw(); },
    draw() { const c = J.list[J.ci]; showPanel(panelHead('FLOSS \u00b7 GAP ' + nOf(), goldR()) + body(c ? cvTag('16/9') + timeRow + '<button data-hold style="' + BTN + ';flex:none;min-height:' + (wide() ? 56 : 72) + 'px;font-size:22px;background:#ec3013;color:#fff;touch-action:none">HOLD TO FLOSS</button>' : doneMsg('NOT A CRUMB LEFT')) + tipBar('HOLD = DOWN \u00b7 LET GO IN THE GREEN \u00b7 RED = THE GUM'));
      const b = PANEL.querySelector('[data-hold]'), cv = PANEL.querySelector('[data-cv]'); for (const el of [b, cv]) if (el) { el.onpointerdown = e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) {} this.press(); }; el.onpointerup = el.onpointercancel = () => this.release(); } J.idle = 0; J.hinted = false; },
    press() { if (!J || J.wait > 0 || !J.list[J.ci]) return; J.idle = 0; J.hold = true; },
    release() { const c = J && J.list[J.ci]; if (!c || !J.hold) return; J.hold = false; if (J.wait > 0) return; const d = J.dep;
      if (Math.abs(d - c.gc) <= c.gw / 2) { addGold(3); tone(1300, 0.04, 0.12, 'triangle'); okTip('CLEAN GAP'); J.wait = 0.6; setTimeout(() => this.next(), 500); } else { okTip(d < c.gc ? 'NOT ALL THE WAY \u00b7 TRY AGAIN' : 'TOO FAR \u00b7 TRY AGAIN'); J.dep = 0; } },
    next() { if (!J || J.g !== 'floss') return; J.dep = 0; J.hold = false; roundNext(this, 'floss', FST); },
    tick(dt) { const c = J.list[J.ci]; if (c && J.wait <= 0) { if (J.hold) { J.dep += dt * c.sp; if (J.dep >= 0.94) { J.dep = 0; J.hold = false; missOne('OUCH \u00b7 TOO DEEP, THAT IS THE GUM'); } } else J.dep = Math.max(0, J.dep - dt * 0.6); }
      roundTick(this, dt, FST, 'TOO SLOW \u00b7 THE PATIENT CLOSED THEIR MOUTH', () => '[data-hold]'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, tw = w * 0.11, n = 5, x0 = w * 0.06, ty = h * 0.1, th = h * 0.62, gy = ty + th;
      g.fillStyle = '#7a1d2a'; g.fillRect(0, 0, w, h); g.fillStyle = GUM; g.fillRect(0, gy, w * 0.7, h - gy);
      for (let k = 0; k < n; k++) { const x = x0 + k * (tw + 6); g.fillStyle = TOOTH; g.fillRect(x, ty, tw, th + 4); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x, ty, tw, th + 4); }
      const gx = x0 + 2 * (tw + 6) + tw + 3, fy = ty + (h * 0.88 - ty) * J.dep; g.fillStyle = YEL; g.fillRect(gx - 2, ty - 8, 4, 8); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.moveTo(gx - 30, ty - 20); g.lineTo(gx, fy); g.lineTo(gx + 30, ty - 20); g.stroke();
      const mx = w * 0.78, mw = w * 0.1, m0 = h * 0.06, mh = h * 0.88, Yv = v => m0 + mh * v; g.fillStyle = PAPER; g.fillRect(mx, m0, mw, mh); g.fillStyle = RED; g.fillRect(mx, Yv(0.94), mw, mh * 0.06); g.fillStyle = '#7cff9b'; g.fillRect(mx, Yv(c.gc - c.gw / 2), mw, mh * c.gw); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(mx, m0, mw, mh);
      g.fillStyle = YEL; g.fillRect(mx - 8, Yv(J.dep) - 3, mw + 16, 6); g.fillStyle = INK; g.fillRect(mx - 8, Yv(J.dep) - 1, mw + 16, 2); } };
  // ---------- 8 CALM THE PATIENT: pick the kind answer; the worry meter falls ----------
  const WORRIES = [['WILL IT HURT?', 'Just a tickle. I will tell you before each step.', 'Oh, a LOT. Hold on to the chair.', 'Did you see the weather today?'],
    ['I HEAR THE DRILL!', 'That is only the polisher. It hums, that is all.', 'That is the big drill. It is for you.', 'Drills are made of metal.'],
    ['WHAT IS THAT SMELL?', 'Mint. Fresh mint, for your fangs.', 'Smoke. Something is burning. Probably fine.', 'I had fish for lunch.'],
    ['MY PAW IS SHAKING.', 'Squeeze this soft ball. Breathe in, breathe out.', 'Stop shaking or the dentist will slip.', 'Paws are for walking.'],
    ['HOW LONG WILL IT TAKE?', 'Two minutes. Count the ceiling tiles with me.', 'Hours. Maybe days.', 'Time is a funny thing.'],
    ['CAN I HAVE A BREAK?', 'Of course. Raise a paw any time and we stop.', 'No breaks. Open wide.', 'The lift has brakes. Ha.'],
    ['I WANT TO GO HOME.', 'Nearly done. Then a sticker, and home.', 'Nobody leaves the chair.', 'Home is where the den is.'],
    ['WHAT IS THAT TOOL?', 'A tiny mirror, to see your back teeth.', 'You do not want to know.', 'It is shiny, is it not?'],
    ['IS MY TOOTH BAD?', 'It is fine. A good brush and it will shine.', 'It might fall out today.', 'Teeth are bones. Sort of.']];
  const CMT = 10, CMN = 8;
  GD.calm = { panel: true, shot: () => [toW(0.5, 1.0, -5.6, 2), 2.4, 1.6, 0.6, 2.0, 0, 5],
    begin() { goRoom(0.5, -2.9, Math.PI, 2); J.list = pickN(WORRIES, CMN).map(([q, good, bad, odd]) => ({ q, opts: shuffle([[good, 1], [bad, 0], [odd, 2]]) })); J.ci = 0; J.cueT = CMT; J.wait = 0.4; J.worry = 50; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('CALM THE PATIENT', goldR()) + body(doneMsg('CALM AS A LAKE')) + tipBar('THEY ASKED TO COME BACK. ON PURPOSE.')); return; }
      const wv = clamp(J.worry, 0, 100);
      showPanel(panelHead('CALM THE PATIENT \u00b7 ' + nOf(), goldR()) + body('<div style="display:flex;flex-direction:column;gap:4px;flex:none"><span style="font-size:11px;font-weight:900">WORRY ' + Math.round(wv) + '%</span><div style="height:12px;border:2px solid #201e1d;background:#fff"><div style="height:100%;width:' + wv + '%;background:' + (wv > 60 ? '#ec3013' : '#ffd23a') + '"></div></div></div><div style="background:#201e1d;color:#f3f2f2;padding:10px 12px;font-weight:900;font-size:18px;flex:none"><span style="color:#ffd23a">PATIENT \u00b7 </span>' + c.q + '</div>' + timeRow + listBtns(c.opts.map(o => o[0]), 'data-o')) + tipBar('PICK THE KIND, TRUE ANSWER'));
      PANEL.querySelectorAll('[data-o]').forEach(b => { b.onclick = () => this.tap(+b.dataset.o, b); }); J.idle = 0; J.hinted = false; },
    tap(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; const k = c.opts[i][1];
      if (k !== 1) { J.worry += 25; missOne(k === 0 ? 'EEK \u00b7 THAT MADE IT WORSE' : 'HUH? \u00b7 THAT DID NOT HELP'); shake(el); el.disabled = true; el.style.opacity = '0.4'; return; }
      J.worry -= 15; goodBtn(el); addGold(3); ding(); okTip('THE PATIENT SMILED'); J.wait = 0.9; setTimeout(() => this.next(), 800); },
    next() { roundNext(this, 'calm', CMT); },
    tick(dt) { const before = J.ci; roundTick(this, dt, CMT, 'TOO SLOW \u00b7 THE PATIENT PANICKED', () => '[data-o="' + J.list[J.ci].opts.findIndex(o => o[1] === 1) + '"]'); if (J && J.ci !== before && J.wait === 0.3) J.worry += 15; } };
  // ================= PRIZES =================
  const SUIT = { outfit: 'suit', torso: ['#334155', '#f3f2f2', '#1e293b'], name: 'OFFICE BLAZER' };
  const FPRIZE = [['ofhGavel', 'goldGavel', 'GOLDEN GAVEL'], ['ofhAbacus', 'goldAbacus', 'GOLDEN ABACUS'], ['ofhTooth', 'goldTooth', 'GOLDEN TOOTH']];
  const GIFT = { suit: 'An OFFICE BLAZER, your size. Wear it on every floor. The Tailor has a copy.', p0: 'Both law jobs done. The GOLDEN GAVEL is yours. No charge. This once.', p1: 'Both counting jobs done. The GOLDEN ABACUS. Every bead accounted for.', p2: 'All four chair jobs. The GOLDEN TOOTH. Not from a patient. Promise.', all: 'All eight jobs in the Spire. 60 gold from the three of us. The accountant wants a word.' };
  function giveGift(fi) { save.setStat('ofhClears', save.stat('ofhClears', 0) + 1); const d = done(), out = [];
    if (!save.stat('ofhSuit', false)) { save.setStat('ofhSuit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) save.setStat('tailorOutfits', [...list, SUIT]); save.setOutfit(SUIT); wear && wear(SUIT); out.push('suit'); }
    const [sk, item] = FPRIZE[fi]; if (FGAMES[fi].every(q => d[q.k]) && !save.stat(sk, false)) { save.setStat(sk, true); save.give(item); out.push('p' + fi); }
    if (GAMES.every(q => d[q.k]) && !save.stat('ofhAll', false)) { save.setStat('ofhAll', true); save.addGold(60); out.push('all'); } return out; }
  const allThree = () => GAMES.every(q => K[0].stars(q.k) >= 3);
  function quillCheck(fi = 1) { if (!allThree() || save.stat('ofhQuill', false)) return false; save.setStat('ofhQuill', true); save.addRelic('goldenQuill'); quill.visible = true; ding();
    sayTo(T_K(fi), [kLn(fi)('Three stars on all eight jobs. THE GOLDEN QUILL is yours. It signed Meru\u2019s first law.')], () => toast('RELIC \u00b7 THE GOLDEN QUILL', 2.6)); return true; }
  function useItem(id) { const P = { goldGavel: 'THE GOLDEN GAVEL \u00b7 FLOOR 1 \u00b7 CASE CLOSED', goldAbacus: 'THE GOLDEN ABACUS \u00b7 FLOOR 2 \u00b7 IT ADDS UP', goldTooth: 'THE GOLDEN TOOTH \u00b7 FLOOR 3 \u00b7 SHINY' }; if (P[id] && save.count(id)) { toast(P[id], 2.4); return true; } return false; }
  // ================= run a job =================
  const INTRO = { clause: 'Find the clause. The client asks; you tap the clause that answers. Six clients.', file: 'File the papers by the first letter. Red URGENT stamp goes in the in-tray.',
    add: 'Add it up. Add the receipt, tap the right total. Six receipts.', ledger: 'One balance in each ledger is wrong. Check from the top and tap that row.',
    light: 'Hold the light. Drag it onto the yellow ring and keep it there.', brush: 'Brush. Scrub the yellow off. Stay off the pink gums.',
    floss: 'Floss. Hold to slide it down, let go in the green. Red is the gum.', calm: 'Calm the patient. Pick the kind, true answer every time.' };
  const DONE = { clause: 'Six happy clients. One even paid.', file: 'Every file in its drawer. My clerk is weeping. Happy tears.', add: 'Every receipt adds up. To the penny.', ledger: 'Six ledgers, six errors found. In red ink. Lovely.',
    light: 'I saw every tooth. You have steady paws.', brush: 'Sparkling. I can see myself in those fangs.', floss: 'Not a crumb left. The gums thank you.', calm: 'Calm as a lake. They asked to come back.' };
  const nextOf = fi => { const d = done(), L0 = FGAMES[fi], n = L0.find(q => !d[q.k]); return (n || L0.slice().sort((a, b) => K[0].stars(a.k) - K[0].stars(b.k))[0]).k; };
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; const fi = GN[g].fi; sayTo(T_K(fi), [kLn(fi)(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('ofhVisits', save.stat('ofhVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], t: 0, fi: GN[g].fi }; busy = 'job'; ding(); fade(() => GD[g].begin()); }
  let endFi = 0;
  function finishGame() { if (!J || busy !== 'job') return; const g = J.g, fi = J.fi, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K[0].stars(g), gold = J.gold; J.off && J.off(); J.off = null;
    const d = { ...done() }; d[g] = true; save.setStat('ofhDone', d); save.setStat('ofhLast', { g, s: stars, d: today() }); const gifts = giveGift(fi); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none';
    const say = () => { const L1 = [kLn(fi)(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; for (const k of gifts) L1.push(kLn(fi)(GIFT[k])); K[fi].finish(g, stars, gold, first); for (let k = 0; k < 4; k++) tone(1200 + k * 200, 0.02, 0.06, 'triangle', k * 0.06);
      sayTo(T_K(fi), L1, () => { if (busy === 'end') { busy = null; J = null; } quillCheck(fi); }); };
    fade(() => { cleanup(); goRoom(3.4, 0, Math.PI / 2, fi); endFi = fi; snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 40000); }
  function cleanup() { if (J) { J.off && J.off(); J.off = null; J.down = null; } hidePanel(); hideCard(); ARW.style.display = 'none'; keepers.forEach(f => { f.position.set(KP0[0], 0, KP0[1]); f.rotation.y = KP0[2]; }); }
  function stop() { cleanup(); busy = null; J = null; }
  function quit() { if (busy === 'intro') { busy = null; return; } if (!J || busy === 'end') return; stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  // ================= camera (job shots) =================
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !fading && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.08; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on || snapK) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(snapK ? camT.pos : cam.position); } snapK = false; const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.set(clamp(camCur.pos.x, CX() - 9.5, CX() + 9.5), clamp(camCur.pos.y, LY + 0.6, LY + RH - 0.3), clamp(camCur.pos.z, LZ - 9.5, LZ + 9.5)); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }

  // ================= talk + prompt =================
  const nearL = (p, x, z, r) => Math.hypot(p.x - x, p.z - z) < r;
  const ringAt = (p, fi) => FGAMES[fi].find(q => nearL(p, RINGS[q.k][0], RINGS[q.k][1], 1.05));
  const nearK = p => nearL(p, 3.6, 0, 2.0);
  const sceneReady = () => save.stat('ofhAll', false) && !save.stat('ofhScene', false);
  function prompt(P) { if (busy) return null; const fi = floorOf(P); if (fi < 0) return null; const p = toF(P, fi), r = ringAt(p, fi); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K[fi].atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearK(p)) return 'TALK \u00b7 ' + KEEP[fi][1].toUpperCase() + (fi === 1 && sceneReady() ? ' \u00b7 A WORD' : ''); return null; }
  const talkN = [0, 1, 2].map(fi => save.stat('ofhTalked' + (fi + 1), 0));
  const HI = [['Back again? Your first sentence is free. Choose it carefully.', 'The Salts on Monday, the Peppers on Tuesday. Wednesday I lie down.', 'My clerk filed the stapler again.'],
    ['Back again. That is another visit. I wrote it down.', 'Numbers never lie. People do. Numbers just sit there.', 'I balanced the lift fees. The lift owes me two.'],
    ['Back again? Still brushing? I can tell. I can always tell.', 'Open wide. Oh, you are not a patient. Sorry. Habit.', 'The nurse says floss. I say floss. Everyone floss.']];
  const FIRST = ['Lawyer, floor one. Two jobs: find the clause, file the papers. This greeting was free.', 'Accountant, floor two. Two jobs: add it up, spot the error. I have counted them.', 'Dentist, floor three. Four jobs at the chair: light, brush, floss, calm. Open wide.'];
  const ASK = [['WHO ARE YOUR CLIENTS?', 'The Salts and the Peppers. Different days. Different doors. Same coffee.'], ['WHO KEEPS THE BOOKS?', 'VAX, the Fleet, half the town. The Salt books are very tidy. Suspiciously tidy.'], ['DOES IT HURT?', 'Only the bill. That is the accountant\u2019s fault, one floor down.']];
  function kMenu(fi) { const first = !talkN[fi]; talkN[fi]++; save.setStat('ofhTalked' + (fi + 1), talkN[fi]); if (quillCheck(fi)) return; const T = T_K(fi), lnF = kLn(fi);
    const ch = [{ text: CHOICE_WORK, pick: () => startGame(nextOf(fi)) }, { text: 'PICK A JOB', pick: () => sayTo(T, [{ ...lnF('Which one?'), choices: [...FGAMES[fi].map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) }];
    if (fi === 1 && sceneReady()) ch.push({ text: 'YOU WANTED A WORD?', pick: () => sceneFees() });
    ch.push({ text: ASK[fi][0], pick: () => sayTo(T, [lnF(ASK[fi][1])]) });
    if (fi === 1 && save.stat('ofhScene', false)) ch.push({ text: 'THE VAX PAYMENTS?', pick: () => sayTo(T, [lnF('Same day, same amount, to the lawyer, for both families. VAX pays both sides.')]) });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T, [lnF(['Goodbye. That one was free too.', 'Goodbye. That is one goodbye. Noted.', 'Goodbye. Floss on the way down.'][fi])]) });
    sayTo(T, [{ ...lnF(first ? FIRST[fi] : fi === 1 && sceneReady() ? 'There you are. All eight jobs. Sit. I found something.' : HI[fi][(talkN[fi] - 2) % HI[fi].length]), choices: ch }]); }
  function sceneFees() { busy = 'scene'; save.setStat('ofhScene', true); const T = T_K(1), lnF = kLn(1);
    const end = () => { busy = null; save.setStat('storyOfficeFees', true); toast('STORY \u00b7 VAX PAYS BOTH FAMILIES\u2019 LAWYER', 2.6); quillCheck(1); };
    sayTo(T, [lnF('Clauses found, files filed, sums right, teeth shining. You are good with details.'), { ...lnF('So am I. The lawyer upstairs works for the Salts AND the Peppers.'), choices: [
      { text: 'WHO PAYS THE BILLS?', pick: () => sayTo(T, [lnF('VAX. Both families. Same day, same amount. Somebody wants them fighting.')], end) },
      { text: 'I WILL LOOK INTO IT.', pick: () => sayTo(T, [lnF('Quietly. VAX pays me too. Every bill, both families, signed VAX.')], end) }] }]); }
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'scene') return true; if (busy) return false; const fi = floorOf(P); if (fi < 0) return false; const p = toF(P, fi);
    const r = ringAt(p, fi); if (r) { startGame(r.k); return true; } if (K[fi].atHiring(p)) { ding(); startGame(nextOf(fi)); return true; }
    if (nearK(p)) { tone(1320, 0.05, 0.5); kMenu(fi); return true; } return false; }
  // ================= per frame =================
  const SPN = /[?&]spawn=office([123])(&|$)/.exec(location.search); let dayCheck = 0, spawned = !SPN, spawnT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt;
    if (!spawned && P && (spawnT += dt) > 0.8) { spawned = true; goRoom(-6.4, -2, Math.PI / 2, +SPN[1] - 1); }
    const fi = floorOf(P); FG.forEach((g, i) => { g.visible = fi === i || (busy === 'job' && !!J && J.fi === i); });
    if ((dayCheck -= dt) <= 0) { dayCheck = 0.5; FPRIZE.forEach(([sk], i) => { prize[i].visible = !!save.stat(sk, false); }); quill.visible = !!save.stat('ofhQuill', false); }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if (busy === 'job' && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('office job: ' + (e && e.stack || e)); stop(); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && !fading && J.list && J.ci < J.list.length) GD[J.g].draw();
    for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; if (!busy) m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
    for (let i = 0; i < 3; i++) K[i].tick(dt, P ? toF(P, i) : { x: 99, z: 99 }, { inShop: fi === i, busy: !!busy, near: 0, talking: false, clear: endClear > 0 && endFi === i ? [3.4, 0, 2.6] : null }); }
  const API = { groups: FG, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, floors: F, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading }),
    spawn: { office1: [F[0].ox - 6.4, LZ - 2, Math.PI / 2, LY], office2: [F[1].ox - 6.4, LZ - 2, Math.PI / 2, LY], office3: [F[2].ox - 6.4, LZ - 2, Math.PI / 2, LY] }, finish: () => finishGame(), scene: sceneFees, keepers, to: fi => fade(() => goRoom(-6.4, -2, Math.PI / 2, fi)),
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    dispose() { card.remove(); PANEL.remove(); ARW.remove(); K.forEach(k => k.dispose()); } };
  window.__offices = API; return API;
}
