// MERU 2.0 — s139 TOWN DUMP JOBS [meruTownDump] ("4. LOBBY JOBS", Ben's picks s138: jobs IN PLACE in the fenced dump yard ·
// 6 jobs given by the DUMP FOREMAN: SORT THE SCRAP · CRUSHER · DIG FOR RELICS · DRIVE THE TRUCK · FIX IT UP · CHASE THE SEAGULLS ·
// building-themed prizes: DUMP OVERALLS (1st clear) · SCRAP MAGNET (2 jobs, item scrapMagnet) · GOLDEN BIN (all 6, item goldBin, + 60 G) + the Foreman's
// VAX locks scene · relic RUSTED CROWN (3 stars on all)). Stats prefix tdh. Outdoors: the stations live in the yard's local frame (clusters.frames.townDump).
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildTownDump({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, clusters, renderer, go, groundH = () => 0 }) {
  const FR = clusters && clusters.frames && clusters.frames.townDump; if (!FR || !FR.D) return null;
  const DD = FR.D, CX = DD.cx, CZ = DD.cz, RY = DD.ry, CR = Math.cos(RY), SR_ = Math.sin(RY), Y0 = groundH(CX, CZ) || 0, RH = 6;
  const WL = (lx, lz) => [CX + lx * CR + lz * SR_, CZ - lx * SR_ + lz * CR];
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', CREAM = '#e7e4dc', STEEL = '#9aa0a6', BLACK = '#26292d', BLUE = '#2e86b8', GRN = '#2f7d5a', OAK = '#a77b4f', PINE = '#c9a27a', DKW = '#5a3d26', HIVIS = '#facc15', OLIVE = '#4f5d2f', DIRT = '#7a5a3a', ACC = '#4b5563';
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
  const rectL = (a, b, c, d) => { const p = [WL(a, c), WL(b, d)]; cols.push({ f: [Math.min(p[0][0], p[1][0]), Math.max(p[0][0], p[1][0]), Math.min(p[0][1], p[1][1]), Math.max(p[0][1], p[1][1])] }); }, circL = (x, z, r) => cols.push({ c: [...WL(x, z), r] });
  const G = new THREE.Group(); G.name = 'dumpJobs'; G.position.set(CX, Y0, CZ); G.rotation.y = RY; scene.add(G); G.visible = false;
  const toW = (x, y, z) => { const [wx, wz] = WL(x, z); return V(wx, Y0 + y, wz); }, toL = P => { const dx = P.x - CX, dz = P.z - CZ; return { x: dx * CR - dz * SR_, y: (P.y || 0) - Y0, z: dx * SR_ + dz * CR }; };
  const today = () => save.stat('meru2Day', 1), done = () => save.stat('tdhDone', null) || {};
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n), pick1 = a => a[Math.floor(Math.random() * a.length)];
  const LOOKS = [['#2e4a6b', '#e7e4dc', '#16263c'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#5d6f82', '#e7e4dc', '#334155'], ['#4f7d3a', '#e2d2b4', '#2a3d20'], ['#7a1d2a', '#f3f2f2', '#3d1218'], ['#e07a1f', '#f3f2f2', '#7a3d1a']];
  // ================= the stations (yard local: x across, z toward the gate at z +10; the foreman + truck stand outside it) =================
  const R0 = mk(), { box, cyl, sph } = R0;
  const SB = [['METAL', STEEL], ['GLASS', BLUE], ['PAPER', '#d6c3a0'], ['JUNK', OLIVE]];
  SB.forEach(([n, c], i) => { const x = -7.5 + i * 1.0; box(0.8, 0.9, 0.8, c, x, 0.45, 1.6); box(0.84, 0.06, 0.84, BLACK, x, 0.93, 1.6); }); box(4.4, 0.3, 0.9, BLACK, -6, 0.15, 0.4); for (let k = 0; k < 8; k++) cyl(0.08, 0.08, 0.9, STEEL, -8 + k * 0.56, 0.32, 0.4, 8, Math.PI / 2, 0, Math.PI / 2); rectL(-8.1, -3.9, -0.1, 2.05);
  box(2.6, 1.2, 2.0, '#3d4148', 6.0, 0.6, 1.2); for (const x of [4.9, 7.1]) box(0.3, 3.0, 0.3, HIVIS, x, 1.5, 1.2); box(2.6, 0.5, 2.0, '#5d636b', 6.0, 2.5, 1.2); box(2.6, 0.08, 0.1, BLACK, 6.0, 2.78, 2.2); for (let k = 0; k < 5; k++) box(0.2, 0.06, 0.04, k % 2 ? BLACK : HIVIS, 5.0 + k * 0.5, 1.22, 2.22);
  for (const [x, z, c] of [[7.6, 3.0, '#a33a2a'], [8.1, 3.4, '#2e86b8'], [7.7, 3.6, '#c9c2b0']]) box(0.5, 0.5, 0.5, c, x, 0.25, z, x); rectL(4.6, 8.4, 0.1, 3.9);
  box(0.3, 4.4, 0.3, HIVIS, 3.6, 2.2, -0.4); box(3.6, 0.24, 0.24, HIVIS, 5.2, 4.3, -0.4); cyl(0.01, 0.01, 1.6, BLACK, 6.6, 3.4, -0.4, 4); cyl(0.3, 0.3, 0.12, '#3d4148', 6.6, 2.55, -0.4, 12); circL(3.6, -0.4, 0.3);
  cyl(1.5, 1.8, 0.5, DIRT, 0, 0.2, -1.4, 14); cyl(0.9, 1.4, 0.3, '#6b4a2e', 0, 0.55, -1.4, 12); box(0.06, 1.0, 0.06, DKW, 1.2, 0.8, -0.6, 0, 0.3); box(0.24, 0.3, 0.04, STEEL, 1.35, 0.3, -0.45, 0, 0.3); circL(0, -1.4, 1.6);
  box(1.0, 0.08, 2.4, OAK, -7.3, 0.86, 7.0); for (const z of [6.0, 8.0]) for (const x of [-7.7, -6.9]) box(0.08, 0.84, 0.08, DKW, x, 0.42, z); rectL(-7.9, -6.7, 5.7, 8.3);
  box(0.4, 0.26, 0.24, '#8a5a3a', -7.3, 1.03, 6.3); box(0.1, 0.1, 0.02, BLACK, -7.3, 1.05, 6.42); cyl(0.04, 0.12, 0.4, '#c9c2b0', -7.3, 1.1, 7.0, 8); sph(0.14, YEL, -7.3, 1.34, 7.0); cyl(0.13, 0.13, 0.06, CREAM, -7.3, 0.93, 7.7, 12);
  for (const [x, z] of [[-7.6, -9.2], [7.6, 9.2]]) { box(0.16, 5.4, 0.16, BLACK, x, 2.7, z); box(0.6, 0.3, 0.3, '#3d4148', x, 5.3, z); circL(x, z, 0.25); }
  R0.mesh(G);
  const post = (txt, x, z, w = 1.6) => { const P0 = mk(); for (const s of [-1, 1]) P0.box(0.08, 2.4, 0.08, BLACK, x + s * (w / 2 - 0.1), 1.2, z); P0.mesh(G); planeT(plate(txt, 384, 96, INK, PAPER, HIVIS), w, 0.38, x, 2.25, z + 0.05, 0, G); };
  post('SORT THE SCRAP', -6, 2.3); post('CRUSHER', 6.0, 2.9, 1.4); post('DIG FOR RELICS', 0, 0.4); post('FIX IT UP', -7.3, 8.6, 1.4); post('CHASE THE GULLS', 2.6, 3.7); post('DRIVE THE TRUCK', 8.0, 11.0);
  planeT(plate('NO GULLS', 256, 96, RED, PAPER), 0.9, 0.34, 2.6, 1.6, 3.76, 0, G);
  // gulls circling over the piles (deco) + the golden bin + the crown
  const gullG = [0, 1, 2].map(i => { const g = new THREE.Group(), M = mk(); M.box(0.3, 0.1, 0.12, PAPER, 0, 0, 0); M.box(0.08, 0.05, 0.05, HIVIS, 0.18, 0, 0); M.box(0.06, 0.02, 0.5, '#c9c2b0', 0, 0.03, 0); M.mesh(g); G.add(g); return g; });
  const bin = new THREE.Group(); { const S = mk(); S.box(0.34, 0.4, 0.3, '#d7ad52', 0, 0.2, 0); S.box(0.38, 0.05, 0.34, '#d7ad52', 0, 0.43, 0); S.box(0.06, 0.12, 0.04, BLACK, 0, 0.25, 0.16); S.mesh(bin); } bin.position.set(4.6, 1.1, -5.2); G.add(bin); bin.visible = false;
  const crown = new THREE.Group(); { const S = mk(); S.cyl(0.12, 0.12, 0.08, '#8a6a3a', 0, 0, 0, 10); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; S.box(0.03, 0.08, 0.03, '#8a6a3a', Math.cos(a) * 0.11, 0.07, Math.sin(a) * 0.11); } S.sph(0.025, RED, 0, 0.02, 0.12); S.mesh(crown); } crown.position.set(3.7, 1.25, -5.2); G.add(crown); crown.visible = false;
  { const P0 = mk(); P0.box(1.4, 0.06, 0.4, OAK, 4.2, 1.0, -5.2); for (const x of [3.6, 4.8]) P0.box(0.06, 0.06, 0.4, DKW, x, 0.95, -5.2); P0.mesh(G); }
  // ================= FOXES: the Dump Foreman (replaces the quiet one outside the gate) =================
  scene.traverse(o => { if (o.userData && o.userData.foxKey === 'dumpForeman' && o.parent && o.parent !== G) o.visible = false; });
  const LW0 = [-1.5, 12.6, 0];
  const keeper = kit.makeFox({ key: 'dumpForeman', name: 'Dump Foreman', torso: ['#facc15', '#4b5563', '#1f2937'], outfit: 'vest', mood: 'warm' }); keeper.position.set(LW0[0], 0, LW0[1]); keeper.rotation.y = LW0[2]; keeper.userData.noCull = true; keeper.userData.rosterShop = 'TOWN DUMP'; keeper.userData.rosterRole = 'keeper'; G.add(keeper);
  const GAMES = [{ k: 'sort', name: 'Sort the Scrap', color: STEEL }, { k: 'crush', name: 'Crusher', color: HIVIS }, { k: 'dig', name: 'Dig for Relics', color: DIRT }, { k: 'truck', name: 'Drive the Truck', color: GRN }, { k: 'fix', name: 'Fix It Up', color: BLUE }, { k: 'gulls', name: 'Chase the Seagulls', color: PAPER }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { sort: [-6, 3.6], crush: [6.0, 4.4], dig: [0, 1.6], truck: [9.6, 12.0], fix: [-5.6, 7.0], gulls: [2.6, 5.6] };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'tdh', color: ACC, boardTitle: 'Dump board', room: { X0: -8, X1: 8, Z0: -10, Z1: 14 }, door: [0, 10.0], keeper, keeperRy: 0, games: GAMES, toWorld: v => v.applyAxisAngle(V(0, 1, 0), RY).add(G.position),
    board: { x: 5.6, y: 2.0, z: -5.36, ry: 0, w: 1.3 }, hiring: { x: 2.0, z: 12.0, ry: 0 }, hiringLine: 'SORT \u00b7 CRUSH \u00b7 DIG \u00b7 DRIVE \u00b7 FIX \u00b7 SHOO', sun: [],
    lamps: [[-7.6, 5.0, -9.2], [7.6, 5.0, 9.2]], lampsOn: () => { const h = hour(); return h >= 19 || h < 7; },
    browse: [[-2.4, -0.6, Math.PI], [3.2, -0.8, Math.PI]], looks: [LOOKS[0], LOOKS[3], LOOKS[5]], clock: { x: 3.0, y: 2.4, z: -5.36, ry: 0 } });
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringMeshes = {};
  for (const k in RINGS) { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(RINGS[k][0], 0.03, RINGS[k][1]); G.add(m); ringMeshes[k] = m; }
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
  const goRoom = (x, z, yaw) => { const [wx, wz] = WL(x, z); go(wx, Y0 + 0.05, wz, yaw + RY); };
  const turnTo = (f, want, dt, k = 4) => { let d = want - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * k); };
  const armUp = (f, side, rz, rx = 0) => { const A = f && f.userData && f.userData.P && f.userData.P.arms; if (A && A[side]) { A[side].rotation.z = rz; A[side].rotation.x = rx; } };
  const GD = {};
  // a quick "round" engine for the panel jobs: list, ci, cueT, wait, draw, next, tick with timer + hint after 3 s
  const roundTick = (D, dt, T, missMsg, hintSel) => { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / T, J.cueT < 3); if (J.cueT <= 0) { missOne(missMsg); D.next(); } }
    if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; const s = hintSel(); if (s) pulse(PANEL.querySelector(s)); } };
  const roundNext = (D, g, T) => { if (!J || J.g !== g) return; J.ci++; J.cueT = T; J.wait = 0.3; if (J.ci >= J.list.length) { addGold(6); D.draw(); setTimeout(finishGame, 800); return; } D.draw(); };
  const wrongBtn = (el, msg) => { missOne(msg); shake(el); el.disabled = true; el.style.opacity = '0.4'; };
  const goodBtn = el => { el.style.background = '#201e1d'; el.style.color = '#ffd23a'; };
  const nOf = () => Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, goldR = () => (J.gold ? J.gold + ' G' : 'TOWN DUMP');
  const body = inner => '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto">' + inner + '</div>';
  const wide = () => innerWidth > innerHeight * 1.1;
  const fitCv = cv => { if (!cv) return null; const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g, w, h }; };
  const cvTag = asp => '<canvas data-cv style="width:100%;display:block;touch-action:none;background:#3d2a1c;' + (wide() ? 'flex:1;min-height:100px' : 'aspect-ratio:' + asp + ';flex:none') + '"></canvas>';
  const bigBtn = t => '<button data-go style="' + BTN + ';flex:none;min-height:' + (wide() ? 56 : 72) + 'px;font-size:22px;background:#ec3013;color:#fff;touch-action:none">' + t + '</button>';
  const doneMsg = t => '<div style="font-size:22px;font-weight:900">' + t + '</div>';
  const keyAct = fn => { const kd = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) fn(); } }; addEventListener('keydown', kd, true); J.off = () => removeEventListener('keydown', kd, true); };
  const drag = (cv, onDown, onMove) => { if (!cv) return; cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; onDown(e); }; cv.onpointermove = e => { if (J && J.down) onMove(e); }; cv.onpointerup = cv.onpointercancel = () => { if (J) J.down = null; }; };
  const grain = (g, x0, y0, w, h, base, seed = 1) => { g.fillStyle = base; g.fillRect(x0, y0, w, h); g.strokeStyle = 'rgba(122,82,54,.4)'; g.lineWidth = 1.5; for (let k = 0; k < 6; k++) { const yy = y0 + h * (0.1 + k * 0.16); g.beginPath(); g.moveTo(x0, yy); for (let x = x0; x <= x0 + w; x += 16) g.lineTo(x, yy + Math.sin(x * 0.025 + k * 1.7 + seed) * 2.5); g.stroke(); } };
  const thunk = () => { tone(140, 0.09, 0.12, 'square'); tone(90, 0.07, 0.2, 'triangle', 0.02); };
  const T_LW = { key: 'dumpForeman', name: 'Dump Foreman', role: 'TOWN DUMP', obj: keeper, ry: LW0[2], r: 6 }, lwLn = ln('Dump Foreman', 'TOWN DUMP');
  const shotL = (x, y, z, w, h, pitch, minD, yaw) => [toW(x, y, z), w, h, pitch, minD, yaw + RY, 7];
  // ---------- 1 SORT THE SCRAP: each item to METAL / GLASS / PAPER / JUNK before the belt drops it ----------
  const SRT = { METAL: ['TIN CAN', 'RUSTY PIPE', 'BIKE CHAIN', 'OLD PAN', 'HUBCAP', 'BENT FORK'], GLASS: ['BOTTLE', 'JAM JAR', 'LIGHT BULB', 'WINDOW PANE', 'MARBLES', 'OLD MIRROR'], PAPER: ['NEWSPAPER', 'CARDBOARD', 'OLD MAP', 'BUZZ MAGAZINE', 'LETTERS', 'PAPER BAG'], JUNK: ['ODD SOCK', 'BROKEN TOY', 'CHEWED SHOE', 'MYSTERY GOO', 'GREASY PIZZA BOX', 'OLD SPONGE'] };
  const SN = 16, sT = i => 4.5 - i * 0.14;
  GD.sort = { panel: true, shot: () => shotL(-6, 0.8, 1.2, 4.4, 2.0, 0.55, 2.6, 0),
    begin() { goRoom(-6, 3.6, Math.PI); J.list = shuffle(Object.entries(SRT).flatMap(([b, a]) => a.map(n => ({ n, b })))).slice(0, SN); J.ci = 0; J.cueT = sT(0); J.wait = 0.5; snapK = true;
      const kd = e => { const k = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code); if (k >= 0) { e.preventDefault(); e.stopPropagation(); this.pick(SB[k][0], PANEL.querySelector('[data-b="' + SB[k][0] + '"]')); } }; addEventListener('keydown', kd, true); J.off = () => removeEventListener('keydown', kd, true); this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('SORT THE SCRAP \u00b7 ' + nOf(), goldR()) + body(c ? '<div style="flex:1;min-height:90px;display:flex;flex-direction:column;justify-content:center;gap:6px;border:2px solid #201e1d;background:#fff;padding:12px"><span style="font-size:11px;font-weight:900;color:#ec3013">ON THE BELT</span><span style="font-size:clamp(24px,7vw,40px);font-weight:900;line-height:1.05">' + c.n + '</span></div>' + timeRow
        + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;flex:none">' + SB.map(([n, col], i) => '<button data-b="' + n + '" style="' + BTN + ';min-height:64px;font-size:18px;border-top:10px solid ' + col + '">' + n + (touch ? '' : ' \u00b7 ' + (i + 1)) + '</button>').join('') + '</div>' : doneMsg('THE BELT IS EMPTY')) + tipBar('A GREASY PIZZA BOX IS JUNK \u00b7 IT WILL NOT RECYCLE'));
      PANEL.querySelectorAll('[data-b]').forEach(b => { b.onclick = () => this.pick(b.dataset.b, b); }); J.idle = 0; J.hinted = false; },
    pick(b, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (b === c.b) { addGold(1); tone(660 + J.ci * 20, 0.04, 0.1, 'square'); } else { missOne('WRONG BIN \u00b7 ' + c.n + ' IS ' + c.b); el && shake(el); } this.next(); },
    next() { if (!J || J.g !== 'sort') return; J.ci++; J.cueT = sT(J.ci); J.wait = 0.2; if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 700); return; } this.draw(); },
    tick(dt) { const c = J.list[J.ci]; if (!c) return; roundTick(this, dt, sT(J.ci), 'TOO SLOW \u00b7 THE ' + c.n + ' FELL OFF THE BELT', () => '[data-b="' + c.b + '"]'); } };
  // ---------- 2 CRUSHER: DROP the magnet on the car, then HOLD PRESS and let go in the green ----------
  const CRN = 5, CCOL = ['#a33a2a', '#2e86b8', '#facc15', '#4f7d3a', '#c9c2b0'];
  GD.crush = { panel: true, shot: () => shotL(6.0, 1.6, 1.2, 3.4, 2.6, 0.35, 3.0, 0),
    begin() { goRoom(6.0, 4.4, Math.PI); J.list = [...Array(CRN)].map((_, i) => ({ car: rnd(0.12, 0.6), sp: 0.38 + i * 0.09, gc: rnd(0.55, 0.78), gw: 0.22 - i * 0.025, col: CCOL[i] })); J.ci = 0; J.ph = 'drop'; J.mx = 0.05; J.dir = 1; J.pr = 0; J.hold = false; J.wait = 0.5; J.anim = 0; snapK = true;
      const isK = e => e.code === 'Space' || e.code === 'Enter', kd = e => { if (isK(e)) { e.preventDefault(); e.stopPropagation(); if (!e.repeat) this.down(); } }, ku = e => { if (isK(e)) { e.preventDefault(); e.stopPropagation(); this.up(); } };
      addEventListener('keydown', kd, true); addEventListener('keyup', ku, true); J.off = () => { removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); }; this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('CRUSHER \u00b7 CAR ' + nOf(), goldR()) + body(c ? cvTag('4/3') + timeRow + bigBtn(J.ph === 'press' ? 'HOLD TO PRESS' : 'DROP MAGNET') : doneMsg('FIVE CARS, FIVE CUBES')) + tipBar(J.ph === 'press' ? 'HOLD \u00b7 LET GO WITH THE NEEDLE IN THE GREEN' : 'DROP THE MAGNET WHEN IT IS OVER THE CAR'));
      const b = PANEL.querySelector('[data-go]'), cv = PANEL.querySelector('[data-cv]'); for (const el of [b, cv]) if (el) { el.onpointerdown = e => { e.preventDefault(); this.down(); }; el.onpointerup = el.onpointercancel = el.onpointerleave = () => this.up(); } },
    down() { const c = J.list[J.ci]; if (!c || J.wait > 0 || J.anim > 0) return; J.idle = 0;
      if (J.ph === 'drop') { if (Math.abs(J.mx - c.car) < 0.07) { tone(220, 0.06, 0.3, 'square'); J.anim = 1.0; okTip('GOT IT \u00b7 INTO THE CRUSHER'); } else { missOne('MISSED THE CAR'); tone(500, 0.04, 0.2, 'triangle'); } return; }
      J.hold = true; },
    up() { const c = J.list[J.ci]; if (!c || !J.hold) return; J.hold = false; const v = J.pr;
      if (Math.abs(v - c.gc) <= c.gw / 2) { thunk(); tone(70, 0.1, 0.5, 'sawtooth'); addGold(4); okTip('A NEAT CUBE'); J.crushed = 0.9; J.wait = 1.0; setTimeout(() => this.next(), 900); return; }
      missOne(v < c.gc ? 'NOT ENOUGH PRESSURE \u00b7 HOLD LONGER' : 'TOO MUCH \u00b7 LET GO SOONER'); J.pr = 0; },
    next() { if (!J || J.g !== 'crush') return; J.ci++; J.ph = 'drop'; J.mx = 0.05; J.dir = 1; J.pr = 0; J.crushed = 0; J.wait = 0.3; if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 700); return; } this.draw(); },
    tick(dt) { const c = J.list[J.ci]; if (!c) return; J.crushed = Math.max(0, (J.crushed || 0) - dt);
      if (J.wait > 0) J.wait -= dt; else if (J.anim > 0) { J.anim -= dt; if (J.anim <= 0) { J.ph = 'press'; J.pr = 0; this.draw(); } }
      else if (J.ph === 'drop') { J.mx += J.dir * c.sp * dt; if (J.mx > 0.68) { J.mx = 0.68; J.dir = -1; } if (J.mx < 0.04) { J.mx = 0.04; J.dir = 1; } }
      else if (J.hold) { J.pr += dt * 0.55; if (J.pr >= 1) { J.hold = false; J.pr = 0; missOne('OVERLOAD \u00b7 LET GO SOONER'); } }
      timeBar(PANEL.querySelector('[data-time]'), 1 - J.ci / J.list.length, false); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f; g.fillStyle = '#c9d6df'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a6a55'; g.fillRect(0, h * 0.8, w, h * 0.2);
      const X = v => w * 0.04 + v * w * 0.92, gy = h * 0.8, cw = w * 0.12, ch = h * 0.1, a = J.anim > 0 ? 1 - J.anim : 0, ph = J.ph;
      const kx = X(0.78), kw = w * 0.2; g.fillStyle = '#3d4148'; g.fillRect(kx, gy - h * 0.16, kw, h * 0.16); g.fillStyle = HIVIS; g.fillRect(kx, h * 0.18, w * 0.03, gy - h * 0.18); g.fillRect(kx + kw - w * 0.03, h * 0.18, w * 0.03, gy - h * 0.18);
      const plateY = h * 0.22 + (ph === 'press' ? J.pr * h * 0.32 : 0) + (J.crushed > 0 ? h * 0.3 : 0); g.fillStyle = '#5d636b'; g.fillRect(kx + w * 0.03, plateY, kw - w * 0.06, h * 0.08); g.fillStyle = BLACK; g.fillRect(kx + kw / 2 - 4, h * 0.18, 8, plateY - h * 0.18);
      g.fillStyle = BLACK; g.fillRect(0, h * 0.08, X(0.74), 6);
      let carX, carY; if (ph === 'drop' && J.anim <= 0) { carX = X(c.car); carY = gy - ch; } else if (J.anim > 0) { carX = X(c.car + (0.86 - c.car) * a); carY = gy - ch - Math.sin(a * Math.PI) * h * 0.3; } else { carX = X(0.86); carY = gy - h * 0.16 - ch; }
      const mx = ph === 'drop' && J.anim <= 0 ? X(J.mx) : carX; g.fillStyle = BLACK; g.fillRect(mx - 1, h * 0.08, 2, (J.anim > 0 ? carY : h * 0.3) - h * 0.08); g.fillStyle = RED; g.fillRect(mx - w * 0.05, (J.anim > 0 ? carY - 10 : h * 0.3), w * 0.1, 10);
      if (!(J.crushed > 0)) { const sq = ph === 'press' ? 1 - J.pr * 0.6 : 1; g.fillStyle = c.col; g.fillRect(carX - cw / 2, carY + ch * (1 - sq), cw, ch * sq); g.fillStyle = '#bcd4e6'; g.fillRect(carX - cw * 0.3, carY + ch * (1 - sq) - ch * 0.45 * sq, cw * 0.6, ch * 0.45 * sq); g.fillStyle = BLACK; for (const s of [-0.3, 0.3]) { g.beginPath(); g.arc(carX + s * cw, carY + ch, ch * 0.28, 0, 7); g.fill(); } }
      else { g.fillStyle = c.col; g.fillRect(X(0.86) - cw * 0.3, gy - h * 0.16 - cw * 0.3, cw * 0.6, cw * 0.3); }
      if (ph === 'press') { const mx2 = w * 0.06, mw = w * 0.08, m0 = h * 0.14, mh = h * 0.6, Y = v => m0 + mh * (1 - v); g.fillStyle = PAPER; g.fillRect(mx2, m0, mw, mh); g.fillStyle = '#7cff9b'; g.fillRect(mx2, Y(c.gc + c.gw / 2), mw, mh * c.gw); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(mx2, m0, mw, mh); g.fillStyle = RED; g.fillRect(mx2 - 6, Y(J.pr) - 3, mw + 12, 6); }
      g.fillStyle = INK; g.font = '900 ' + Math.round(Math.max(12, h * 0.055)) + 'px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText(ph === 'press' ? 'PRESSURE' : 'MAGNET', w * 0.04, h * 0.06 + 4); } };
  // ---------- 3 DIG FOR RELICS: every hole shows the steps to the real relic; find it in few holes ----------
  const DGR = [[5, 4], [5, 4], [6, 5], [7, 5]], DGT = 30;
  GD.dig = { panel: true, shot: () => shotL(0, 0.4, -1.4, 3.6, 2.4, 0.8, 2.6, 0),
    begin() { goRoom(0, 1.6, Math.PI); J.list = DGR.map(([n, b]) => ({ n, b, rx: Math.floor(Math.random() * n), ry: Math.floor(Math.random() * n), dug: {}, used: 0, found: false })); J.ci = 0; J.cueT = DGT; J.wait = 0.4; snapK = true; this.draw(); },
    cands(c) { const out = []; for (let y = 0; y < c.n; y++) for (let x = 0; x < c.n; x++) { if (Object.entries(c.dug).every(([k, d]) => { const [i, j] = k.split(',').map(Number); return Math.abs(i - x) + Math.abs(j - y) === d; })) out.push(x + ',' + y); } return out; },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('DIG FOR RELICS', goldR()) + body(doneMsg('FOUR REAL RELICS')) + tipBar('THE MUSEUM WILL WANT A LOOK')); return; }
      const heat = d => d === 0 ? '#d7ad52' : d === 1 ? '#ec3013' : d === 2 ? '#e07a1f' : d === 3 ? '#facc15' : '#9fc4e0', W2 = wide();
      let cells = ''; for (let y = 0; y < c.n; y++) for (let x = 0; x < c.n; x++) { const k = x + ',' + y, d = c.dug[k];
        cells += '<button data-c="' + k + '" style="min-width:0;min-height:44px;aspect-ratio:1;padding:0;border:0;border-radius:0;cursor:pointer;font:900 ' + (c.n > 6 ? 16 : 20) + 'px Archivo,sans-serif;color:#201e1d;background:' + (d == null ? 'repeating-linear-gradient(135deg,#7a5a3a 0 7px,#6b4a2e 7px 14px)' : heat(d)) + '">' + (d == null ? '' : d === 0 ? '\u2605' : d) + '</button>'; }
      const grid = '<div style="display:grid;grid-template-columns:repeat(' + c.n + ',minmax(0,1fr));gap:2px;background:#201e1d;border:2px solid #201e1d;flex:none;' + (W2 ? 'width:min(56%, ' + Math.max(150, innerHeight - (innerHeight < 520 ? 16 : 136) - 110) + 'px);align-self:flex-start' : 'width:min(100%, 46vh);align-self:center') + '">' + cells + '</div>';
      const info = '<div style="display:flex;justify-content:space-between;gap:8px;font-size:11px;font-weight:900;flex-wrap:wrap"><span style="color:#ec3013">THE NUMBER = STEPS TO THE RELIC (NO DIAGONALS)</span><span style="white-space:nowrap">HOLES ' + c.used + ' / ' + c.b + '</span></div>';
      showPanel(panelHead('DIG FOR RELICS \u00b7 PATCH ' + nOf(), goldR()) + body(W2 ? '<div style="flex:1;min-height:0;display:flex;gap:10px">' + grid + '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:8px">' + info + timeRow + '</div></div>' : info + grid + timeRow) + tipBar('1 = RIGHT NEXT TO IT \u00b7 BLUE = FAR AWAY'));
      PANEL.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => this.tap(b.dataset.c); }); J.idle = 0; J.hinted = false; },
    tap(k) { const c = J.list[J.ci]; if (!c || J.wait > 0 || c.found || c.dug[k] != null) return; J.idle = 0; const [x, y] = k.split(',').map(Number), d = Math.abs(x - c.rx) + Math.abs(y - c.ry); c.dug[k] = d; c.used++; tone(160, 0.06, 0.12, 'triangle');
      if (d === 0) { c.found = true; addGold(c.used <= c.b ? 5 : 2); ding(); this.draw(); const TRD = [['tr_coin', 'OLD MERU COIN'], ['tr_coin', 'OLD MERU COIN'], ['tr_fox', 'CLAY FOX'], ['tr_fox', 'CLAY FOX'], ['tr_bell', 'BRONZE BELL'], ['tr_jade', 'JADE CHARM']], tq = c.used <= c.b && Math.random() < 0.35 ? TRD[Math.floor(Math.random() * TRD.length)] : null; if (tq && save.count(tq[0]) < 5) { save.give(tq[0]); save.setStat('tdhTradeFinds', save.stat('tdhTradeFinds', 0) + 1); okTip('A REAL RELIC! \u00b7 ' + tq[1] + ' IN THE BAG \u00b7 SELL IT AT A RELIC STORE'); } else okTip('A REAL RELIC!'); J.wait = 1.0; setTimeout(() => this.next(), 900); return; }
      this.draw(); if (c.used >= c.b) missOne('TOO MANY HOLES \u00b7 USE THE NUMBERS'); },
    next() { roundNext(this, 'dig', DGT); },
    tick(dt) { roundTick(this, dt, DGT, 'TOO SLOW \u00b7 THE RAIN FILLED THE HOLES', () => { const c = J.list[J.ci], cs = this.cands(c).filter(k => c.dug[k] == null); return cs.length ? '[data-c="' + cs[0] + '"]' : null; }); } };
  // ---------- 4 DRIVE THE TRUCK: Lakeside Road; steer into the bins, miss the cones, cars and ducks ----------
  const TKN = 14;
  GD.truck = { panel: true, shot: () => shotL(7.0, 1.4, 14.2, 6.0, 2.6, 0.3, 4, 0),
    begin() { goRoom(9.6, 12.0, Math.PI / 2); const it = []; let t = 1.6; for (let i = 0; i < TKN; i++) { it.push({ t, lane: Math.floor(Math.random() * 3), k: 'bin' }); t += 1.1; if (i > 1 && Math.random() < 0.8) { const lanes = [0, 1, 2].filter(l => l !== it[it.length - 1].lane); it.push({ t: t - 0.55, lane: pick1(lanes), k: pick1(['cone', 'car', 'duck']) }); } t += Math.max(0.6, 1.3 - i * 0.05); }
      J.items = it.map(o => ({ ...o, y: -0.2, on: false, done: false })); J.lane = 1; J.lx = 1; J.tt = 0; J.got = 0; J.flash = 0; J.list = [0]; J.ci = 0; J.wait = 0.8; snapK = true;
      const kd = e => { const L = e.code === 'ArrowLeft' || e.code === 'KeyA', R = e.code === 'ArrowRight' || e.code === 'KeyD'; if (L || R) { e.preventDefault(); e.stopPropagation(); if (!e.repeat) this.steer(L ? -1 : 1); } }; addEventListener('keydown', kd, true); J.off = () => removeEventListener('keydown', kd, true); this.draw(); },
    draw() { const W2 = wide();
      showPanel(panelHead('DRIVE THE TRUCK \u00b7 BINS ' + J.got + ' / ' + TKN, goldR()) + body(cvTag('3/4') + timeRow + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;flex:none"><button data-l style="' + BTN + ';min-height:' + (W2 ? 56 : 72) + 'px;font-size:26px;touch-action:none">\u25c0 LEFT</button><button data-r style="' + BTN + ';min-height:' + (W2 ? 56 : 72) + 'px;font-size:26px;touch-action:none">RIGHT \u25b6</button></div>') + tipBar('BINS = PICK UP \u00b7 CONES, CARS + DUCKS = STEER AROUND'));
      const l = PANEL.querySelector('[data-l]'), r = PANEL.querySelector('[data-r]'); if (l) l.onpointerdown = e => { e.preventDefault(); this.steer(-1); }; if (r) r.onpointerdown = e => { e.preventDefault(); this.steer(1); };
      const cv = PANEL.querySelector('[data-cv]'); if (cv) cv.onpointerdown = e => { e.preventDefault(); const b = cv.getBoundingClientRect(); this.steer(e.clientX - b.left < b.width / 2 ? -1 : 1); }; },
    steer(d) { if (!J || J.g !== 'truck') return; J.idle = 0; J.lane = clamp(J.lane + d, 0, 2); tone(300, 0.02, 0.05, 'square'); },
    tick(dt) { if (J.wait > 0) { J.wait -= dt; this.render(); return; } J.tt += dt; J.lx += (J.lane - J.lx) * Math.min(1, dt * 12); J.flash -= dt; const sp = 0.42 + J.tt * 0.004;
      let left = 0; for (const o of J.items) { if (o.done) continue; left++; if (J.tt < o.t) continue; o.on = true; o.y += sp * dt;
        if (o.y > 0.74 && o.y < 0.9 && Math.abs(o.lane - J.lx) < 0.5) { o.done = true; if (o.k === 'bin') { J.got++; addGold(2); tone(900, 0.05, 0.12, 'square'); tone(1200, 0.04, 0.1, 'square', 0.06); const hh = PANEL.querySelector('[data-h]'); if (hh) hh.textContent = 'DRIVE THE TRUCK \u00b7 BINS ' + J.got + ' / ' + TKN; } else { J.flash = 0.5; missOne(o.k === 'duck' ? 'QUACK \u00b7 MIND THE DUCKS' : o.k === 'car' ? 'BUMPED A CAR' : 'HIT A CONE'); tone(120, 0.08, 0.25, 'sawtooth'); } continue; }
        if (o.y > 1.05) { o.done = true; if (o.k === 'bin') missOne('MISSED A BIN'); } }
      timeBar(PANEL.querySelector('[data-time]'), J.items.filter(o => o.done).length / J.items.length, false);
      if (!left) { J.wait = 99; addGold(6); okTip('ROUND DONE \u00b7 BACK TO THE YARD'); setTimeout(finishGame, 700); } this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')); if (!f) return; const { g, w, h } = f, rw = Math.min(w * 0.7, h * 0.62), r0 = (w - rw) / 2, LW = rw / 3, LX = l => r0 + LW * (l + 0.5), sc = (J.tt * 0.42 * h) % 40;
      g.fillStyle = '#4f7d3a'; g.fillRect(0, 0, r0, h); g.fillStyle = '#4b7fa3'; g.fillRect(r0 + rw, 0, w - r0 - rw, h); g.fillStyle = '#5d636b'; g.fillRect(r0, 0, rw, h);
      g.fillStyle = PAPER; for (const l of [1, 2]) for (let y = -40 + sc; y < h; y += 40) g.fillRect(r0 + LW * l - 2, y, 4, 20); g.fillStyle = HIVIS; g.fillRect(r0, 0, 4, h); g.fillRect(r0 + rw - 4, 0, 4, h);
      g.save(); g.translate(r0 + rw + (w - r0 - rw) / 2, h * 0.5); g.rotate(Math.PI / 2); g.fillStyle = PAPER; g.font = '900 ' + Math.round(Math.max(11, Math.min(w - r0 - rw, 40) * 0.5)) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText('LAKESIDE', 0, 0); g.restore();
      const S = LW * 0.62;
      for (const o of J.items) { if (!o.on || o.done) continue; const x = LX(o.lane), y = o.y * h;
        if (o.k === 'bin') { g.fillStyle = GRN; g.fillRect(x - S * 0.35, y - S * 0.4, S * 0.7, S * 0.8); g.fillStyle = BLACK; g.fillRect(x - S * 0.4, y - S * 0.48, S * 0.8, S * 0.12); }
        else if (o.k === 'cone') { g.fillStyle = '#e07a1f'; g.beginPath(); g.moveTo(x, y - S * 0.45); g.lineTo(x - S * 0.3, y + S * 0.35); g.lineTo(x + S * 0.3, y + S * 0.35); g.fill(); g.fillStyle = PAPER; g.fillRect(x - S * 0.18, y, S * 0.36, S * 0.08); }
        else if (o.k === 'car') { g.fillStyle = '#a33a2a'; g.fillRect(x - S * 0.4, y - S * 0.6, S * 0.8, S * 1.2); g.fillStyle = '#bcd4e6'; g.fillRect(x - S * 0.3, y - S * 0.35, S * 0.6, S * 0.3); }
        else { g.fillStyle = HIVIS; g.beginPath(); g.arc(x, y, S * 0.28, 0, 7); g.fill(); g.beginPath(); g.arc(x + S * 0.18, y - S * 0.22, S * 0.15, 0, 7); g.fill(); g.fillStyle = '#e07a1f'; g.fillRect(x + S * 0.3, y - S * 0.24, S * 0.14, S * 0.06); } }
      const tx = r0 + LW * (J.lx + 0.5), ty = h * 0.82; if (!(J.flash > 0 && Math.floor(J.flash * 16) % 2)) { g.fillStyle = '#2e5a3a'; g.fillRect(tx - S * 0.42, ty - S * 0.3, S * 0.84, S * 1.3); g.fillStyle = PAPER; g.fillRect(tx - S * 0.4, ty - S * 0.7, S * 0.8, S * 0.45); g.fillStyle = '#bcd4e6'; g.fillRect(tx - S * 0.3, ty - S * 0.62, S * 0.6, S * 0.2); }
      if (J.wait > 0 && J.tt === 0) { g.fillStyle = YEL; g.font = '900 ' + Math.round(h * 0.07) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText('READY', w / 2, h * 0.45); } } };
  // ---------- 5 FIX IT UP: read what is broken, pick the right part; fixed junk sells ----------
  const SYM = { speaker: ['NO SOUND', 'SPEAKER'], bulb: ['WILL NOT LIGHT', 'BULB'], bolt: ['WOBBLY WHEEL', 'BOLT'], chain: ['CHAIN FELL OFF', 'CHAIN'], fuse: ['NO POWER', 'FUSE'], spring: ['WILL NOT TICK', 'SPRING'], bell: ['NO RING', 'BELL'], knob: ['CANNOT TUNE IT', 'KNOB'] };
  const JUNKS = [['RADIO', ['speaker', 'fuse', 'knob']], ['BIKE', ['chain', 'bolt', 'bell']], ['LAMP', ['bulb', 'fuse']], ['CLOCK', ['spring', 'bell']], ['TOASTER', ['fuse', 'spring']], ['DOORBELL', ['bell', 'fuse', 'speaker']]], FXT = 15;
  GD.fix = { panel: true, shot: () => shotL(-7.3, 1.0, 7.0, 2.6, 1.6, 0.5, 2.2, Math.PI / 2),
    begin() { goRoom(-5.6, 7.0, -Math.PI / 2); J.list = shuffle(JUNKS).map(([n, can], i) => ({ n, f: pickN(can, 1 + Math.min(2, Math.floor(i / 2))), fixed: {} })); J.ci = 0; J.cueT = FXT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('FIX IT UP', goldR()) + body(doneMsg('SIX FIXED, SIX SOLD')) + tipBar('JUNK IS TREASURE THAT NEEDS A BOLT')); return; }
      const sy = c.f.map(k => '<span style="padding:4px 8px;border:2px solid #201e1d;font-size:14px;font-weight:900;background:' + (c.fixed[k] ? '#201e1d' : '#fff') + ';color:' + (c.fixed[k] ? '#ffd23a' : '#ec3013') + '">' + (c.fixed[k] ? '\u2713 FIXED' : SYM[k][0]) + '</span>').join('');
      showPanel(panelHead('FIX IT UP \u00b7 ' + c.n + ' \u00b7 ' + nOf(), goldR()) + body('<div style="font-size:11px;font-weight:900">WHAT IS WRONG WITH THE ' + c.n + '</div><div style="display:flex;flex-wrap:wrap;gap:6px">' + sy + '</div>' + timeRow
        + '<div style="font-size:11px;font-weight:900">THE PARTS BOX</div><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px">' + Object.keys(SYM).map(k => '<button data-p="' + k + '" style="' + BTN + ';font-size:13px">' + SYM[k][1] + '</button>').join('') + '</div>') + tipBar('ONE PART PER PROBLEM \u00b7 THEN IT SELLS'));
      PANEL.querySelectorAll('[data-p]').forEach(b => { b.onclick = () => this.part(b.dataset.p, b); }); J.idle = 0; J.hinted = false; },
    part(k, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; if (!c.f.includes(k) || c.fixed[k]) { missOne(c.fixed[k] ? 'ALREADY FIXED THAT' : 'A ' + SYM[k][1] + ' WILL NOT FIX THE ' + c.n); shake(el); return; }
      c.fixed[k] = true; thunk(); if (c.f.every(q => c.fixed[q])) { const p = 6 + c.f.length * 2; addGold(p); ding(); this.draw(); okTip('SOLD THE ' + c.n + ' FOR ' + p + ' G'); J.wait = 1.0; setTimeout(() => this.next(), 900); return; } this.draw(); },
    next() { roundNext(this, 'fix', FXT); },
    tick(dt) { roundTick(this, dt, FXT, 'TOO SLOW \u00b7 THE BUYER WALKED OFF', () => { const c = J.list[J.ci], k = c.f.find(q => !c.fixed[q]); return k ? '[data-p="' + k + '"]' : null; }); } };
  // ---------- 6 CHASE THE SEAGULLS: tap the gulls before they reach the pile; big ones need two taps ----------
  const GLD = 40;
  GD.gulls = { panel: true, shot: () => shotL(0, 2.4, -3, 6, 4, 0.2, 4, 0),
    begin() { goRoom(2.6, 5.6, Math.PI); J.gs = []; J.spawnT = 1.2; J.tt = 0; J.shoo = 0; J.list = [0]; J.ci = 0; J.wait = 0.8; J.end = false; snapK = true; this.draw(); },
    draw() { showPanel(panelHead('CHASE THE SEAGULLS \u00b7 SHOOED ' + J.shoo, goldR()) + body(cvTag('4/3') + timeRow) + tipBar('TAP A GULL TO SHOO IT \u00b7 BIG GULLS NEED TWO TAPS'));
      const cv = PANEL.querySelector('[data-cv]'); if (cv) cv.onpointerdown = e => { e.preventDefault(); const r = cv.getBoundingClientRect(); this.tap(e.clientX - r.left, e.clientY - r.top, r.width, r.height); }; },
    tap(px, py, w, h) { if (!J || J.wait > 0 || J.end) return; J.idle = 0; let best = null, bd = 1e9; for (const q of J.gs) { if (q.st !== 'in') continue; const d = Math.hypot(q.x * w - px, q.y * h - py), R = Math.max(30, (q.big ? 0.07 : 0.05) * w); if (d < R && d < bd) { bd = d; best = q; } }
      if (!best) { tone(300, 0.02, 0.05, 'triangle'); return; } best.hp--; tone(1500, 0.04, 0.08, 'square'); if (best.hp <= 0) { best.st = 'out'; best.vx = (best.x < 0.5 ? -1 : 1) * 0.5; best.vy = -0.6; J.shoo++; addGold(1); const hh = PANEL.querySelector('[data-h]'); if (hh) hh.textContent = 'CHASE THE SEAGULLS \u00b7 SHOOED ' + J.shoo; } },
    tick(dt) { if (J.wait > 0) { J.wait -= dt; this.render(); return; } if (J.end) { this.render(); return; } J.tt += dt; const k = J.tt / GLD;
      if ((J.spawnT -= dt) <= 0 && J.tt < GLD - 2) { J.spawnT = 1.6 - k * 0.8; const side = Math.floor(Math.random() * 3), big = Math.random() < 0.18 + k * 0.15; J.gs.push({ x: side === 0 ? -0.05 : side === 1 ? 1.05 : rnd(0.1, 0.9), y: side === 2 ? -0.05 : rnd(0.08, 0.45), st: 'in', hp: big ? 2 : 1, big, sp: rnd(0.11, 0.17) + k * 0.08, zig: Math.random() < 0.3 + k * 0.3 ? rnd(0.04, 0.08) : 0, ph: Math.random() * 6 }); }
      for (const q of J.gs) { if (q.st === 'in') { const dx = 0.5 - q.x, dy = 0.8 - q.y, d = Math.hypot(dx, dy) || 1; q.x += dx / d * q.sp * dt + (q.zig ? Math.cos(J.tt * 6 + q.ph) * q.zig * dt * 6 * (-dy / d) : 0); q.y += dy / d * q.sp * dt; if (d < 0.07) { q.st = 'out'; q.vx = (Math.random() < 0.5 ? -1 : 1) * 0.4; q.vy = -0.5; q.food = true; missOne('A GULL GOT A SANDWICH'); } }
        else { q.x += q.vx * dt; q.y += q.vy * dt; } }
      J.gs = J.gs.filter(q => q.y > -0.3 && q.x > -0.3 && q.x < 1.3); timeBar(PANEL.querySelector('[data-time]'), 1 - J.tt / GLD, J.tt > GLD - 5);
      if (J.tt >= GLD) { J.end = true; addGold(6); okTip('THE PILE IS SAFE'); setTimeout(finishGame, 700); } this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')); if (!f) return; const { g, w, h } = f; g.fillStyle = '#c9d6df'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a6a55'; g.fillRect(0, h * 0.86, w, h * 0.14);
      g.fillStyle = '#6b6f75'; g.beginPath(); g.ellipse(w * 0.5, h * 0.88, w * 0.2, h * 0.14, 0, Math.PI, 0); g.fill(); for (const [dx, dy, c] of [[-0.08, 0.83, '#a33a2a'], [0.05, 0.8, '#c9c2b0'], [0.12, 0.85, '#8a5a3a'], [-0.02, 0.77, HIVIS]]) { g.fillStyle = c; g.fillRect(w * (0.5 + dx) - 10, h * dy, 20, 12); }
      for (const q of J.gs) { const x = q.x * w, y = q.y * h, s = (q.big ? 0.06 : 0.042) * w, fl = Math.sin(J.tt * 14 + q.ph) * s * 0.5, dir = q.st === 'in' ? Math.sign(0.5 - q.x) || 1 : Math.sign(q.vx) || 1;
        g.fillStyle = q.hp < 2 && q.big ? '#e7e4dc' : PAPER; g.beginPath(); g.ellipse(x, y, s * 0.7, s * 0.32, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
        g.strokeStyle = '#5f6469'; g.lineWidth = Math.max(3, s * 0.18); g.beginPath(); g.moveTo(x - s * 0.9, y - fl); g.lineTo(x, y - s * 0.1); g.lineTo(x + s * 0.9, y - fl); g.stroke();
        g.fillStyle = HIVIS; g.fillRect(x + dir * s * 0.6, y - s * 0.12, dir * s * 0.35, s * 0.14); if (q.food) { g.fillStyle = '#d6c3a0'; g.fillRect(x - s * 0.2, y + s * 0.3, s * 0.4, s * 0.25); } }
      if (J.wait > 0) { g.fillStyle = INK; g.font = '900 ' + Math.round(h * 0.08) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText('HERE THEY COME', w / 2, h * 0.4); } } };
  // ================= PRIZES (building-themed) =================
  const SUIT = { outfit: 'vest', torso: ['#facc15', '#4b5563', '#1f2937'], name: 'DUMP OVERALLS' };
  const GIFT = { suit: 'DUMP OVERALLS, hi-vis, your size. The Tailor has a copy.', magnet: 'A SCRAP MAGNET for your bag. Every scrapper needs one.', trophy: 'All six. The GOLDEN BIN is yours, with 60 gold. Stay a minute. I need a word.' };
  function giveGift() { save.setStat('tdhClears', save.stat('tdhClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('tdhSuit', false)) { save.setStat('tdhSuit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) save.setStat('tailorOutfits', [...list, SUIT]); save.setOutfit(SUIT); wear && wear(SUIT); return 'suit'; }
    if (nd >= 2 && !save.stat('tdhMagnet', false)) { save.setStat('tdhMagnet', true); save.give('scrapMagnet'); return 'magnet'; }
    if (nd >= GAMES.length && !save.stat('tdhAll', false)) { save.setStat('tdhAll', true); save.give('goldBin'); save.addGold(60); return 'trophy'; } return null; }
  const allThree = () => GAMES.every(q => K.stars(q.k) >= 3);
  function crownCheck(then) { if (!allThree() || save.stat('tdhCrown', false)) { then && then(); return false; } save.setStat('tdhCrown', true); save.addRelic('rustedCrown'); crown.visible = true; ding();
    sayTo(T_LW, [lwLn('Three stars on every job. Take the RUSTED CROWN. Dug it up myself. Not a VAX fake.')], () => { toast('RELIC \u00b7 RUSTED CROWN', 2.6); then && then(); }); return true; }
  function useItem(id) { if (id === 'scrapMagnet' && save.count('scrapMagnet')) { toast('SCRAP MAGNET \u00b7 IT PICKED UP A BOTTLE CAP', 2.2); return true; } if (id === 'goldBin' && save.count('goldBin')) { toast('THE GOLDEN BIN \u00b7 SIX FOR SIX AT THE TOWN DUMP', 2.4); return true; } return false; }
  // ================= run a job =================
  const INTRO = { sort: 'Sort the scrap. Metal, glass, paper or junk. Quick, the belt does not stop.', crush: 'Crusher. Drop the magnet on the car, then hold PRESS and let go in the green.', dig: 'Dig for relics. Each hole shows the steps to the real one. Few holes.',
    truck: 'Drive the truck down Lakeside Road. Steer into the bins. Miss the cones, cars and ducks.', fix: 'Fix it up. Read what is broken, pick the right part. Fixed junk sells.', gulls: 'Chase the seagulls. Tap them before they reach the pile. Big ones need two taps.' };
  const DONE = { sort: 'Sorted. Even the greasy pizza box went in the right bin.', crush: 'Five cars, five cubes. The crusher purrs.', dig: 'Real relics, every one. The museum will want a look.', truck: 'Every bin collected. And not one duck harmed.', fix: 'Six fixed, six sold. Junk is treasure that needs a bolt.', gulls: 'Not a crumb lost. The gulls are writing complaints.' };
  const nextOf = () => { const d = done(), n = GAMES.find(q => !d[q.k]); return (n || GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; sayTo(T_LW, [lwLn(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('tdhVisits', save.stat('tdhVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], t: 0 }; busy = 'job'; ding(); fade(() => GD[g].begin()); }
  function finishGame() { if (!J || busy !== 'job') return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold; J.off && J.off(); J.off = null;
    const d = { ...done() }; d[g] = true; save.setStat('tdhDone', d); save.setStat('tdhLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none';
    const say = () => { const L1 = [lwLn(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift) L1.push(lwLn(GIFT[gift])); K.finish(g, stars, gold, first); for (let k = 0; k < 4; k++) tone(900 + k * 200, 0.02, 0.06, 'triangle', k * 0.06);
      sayTo(T_LW, L1, () => { if (busy === 'end') { busy = null; J = null; } crownCheck(); }); };
    fade(() => { cleanup(); goRoom(-1.5, 10.6, 0); snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 40000); }
  function cleanup() { if (J) { J.off && J.off(); J.off = null; J.down = null; J.hold = false; } hidePanel(); hideCard(); ARW.style.display = 'none'; keeper.position.set(LW0[0], 0, LW0[1]); keeper.rotation.y = LW0[2]; }
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
    camCur.pos.y = Math.max(camCur.pos.y, Y0 + 0.6); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ================= talk + prompt =================
  const inRoom = P => { if (!P) return false; const p = toL(P); return Math.abs(p.x) < 10.5 && p.z > -10.5 && p.z < 19 && Math.abs(p.y) < 6; };
  const nearL = (p, x, z, r) => Math.hypot(p.x - x, p.z - z) < r;
  const ringAt = p => GAMES.find(q => nearL(p, RINGS[q.k][0], RINGS[q.k][1], 1.05));
  const nearK = p => nearL(p, LW0[0], LW0[1], 2.0);
  const sceneReady = () => save.stat('tdhAll', false) && !save.stat('tdhScene', false);
  function prompt(P) { if (busy || !inRoom(P)) return null; const p = toL(P), r = ringAt(p); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearK(p)) return sceneReady() ? 'TALK \u00b7 DUMP FOREMAN \u00b7 A WORD' : 'TALK \u00b7 DUMP FOREMAN'; return null; }
  let talkL = save.stat('tdhTalked', 0);
  const HI = ['Back again? The gulls remember you. So do I.', 'Seven truck runs a day. The VAX bins are the heaviest.', 'One fox\u2019s junk is another fox\u2019s Tuesday.'];
  function kMenu() { const first = !talkL; talkL++; save.setStat('tdhTalked', talkL); if (crownCheck()) return;
    const ch = [{ text: CHOICE_WORK, pick: () => startGame(nextOf()) }, { text: 'PICK A JOB', pick: () => sayTo(T_LW, [{ ...lwLn('Which one?'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) }];
    if (sceneReady()) ch.push({ text: 'YOU WANTED A WORD?', pick: () => sceneLocks() });
    ch.push({ text: 'WHO RUNS THE DUMP?', pick: () => sayTo(T_LW, [lwLn('Salt pays for the bins. I run the yard. The gulls think they do.')]) });
    if (save.stat('tdhScene', false)) ch.push({ text: 'THE VAX LOCKS?', pick: () => sayTo(T_LW, [lwLn('Hundreds of broken VAX locks a week. Same scratch marks on every one.')]) });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T_LW, [lwLn('Goodbye. Wash your paws before you eat anything.')]) });
    sayTo(T_LW, [{ ...lwLn(first ? 'Dump Foreman. Salt runs the bins, I run the yard. Six jobs. Wear gloves.' : sceneReady() ? 'There you are. Six for six. Stay a minute.' : HI[(talkL - 2) % HI.length]), choices: ch }]); }
  function sceneLocks() { busy = 'scene'; save.setStat('tdhScene', true);
    const end = () => { busy = null; save.setStat('storyDumpLocks', true); toast('STORY \u00b7 VAX DUMPS PICKED LOCKS', 2.6); crownCheck(); };
    sayTo(T_LW, [lwLn('Six jobs. You sort, crush, dig, drive, fix and shoo. Best hand I ever had.'), { ...lwLn('Every week VAX dumps broken locks here. Hundreds. All picked open the same way.'), choices: [
      { text: 'PICKED BY WHO?', pick: () => sayTo(T_LW, [lwLn('Same marks every time. One tool. Somebody with a key to every VAX lock.')], end) },
      { text: 'I WILL LOOK INTO IT.', pick: () => sayTo(T_LW, [lwLn('Keep it quiet. Salt pays for the bins, VAX pays for the dumping.')], end) }] }]); }
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'scene') return true; if (busy) return false; if (!inRoom(P)) return false; const p = toL(P);
    const r = ringAt(p); if (r) { startGame(r.k); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf()); return true; }
    if (nearK(p)) { tone(880, 0.05, 0.4); kMenu(); return true; } return false; }
  // ================= per frame =================
  let dayCheck = 0, spawned = !/[?&]spawn=dump/.test(location.search), spawnT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt;
    if (!spawned && P && (spawnT += dt) > 0.8) { spawned = true; goRoom(0, 15, Math.PI); }
    const p = P ? toL(P) : { x: 999, z: 999, y: 0 }, near = Math.hypot(p.x, p.z - 4) < 70 && Math.abs(p.y) < 20, inR = inRoom(P); G.visible = near || busy === 'job';
    if ((dayCheck -= dt) <= 0) { dayCheck = 0.5; if (near) { bin.visible = !!save.stat('tdhAll', false); crown.visible = !!save.stat('tdhCrown', false); } }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if (busy === 'job' && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('dump job: ' + (e && e.stack || e)); stop(); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && !fading && J.list && J.ci < J.list.length) GD[J.g].draw();
    if (G.visible) { crown.rotation.y += dt * 0.8; for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy && inR; m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
      gullG.forEach((g, i) => { const a = t * (0.4 + i * 0.1) + i * 2.1; g.position.set(Math.cos(a) * (3 + i), 5 + i * 0.6 + Math.sin(t * 1.3 + i) * 0.3, -4 + Math.sin(a) * (2.4 + i * 0.5)); g.rotation.y = -a; g.children[0] && (g.children[0].rotation.x = Math.sin(t * 10 + i) * 0.25); }); }
    K.tick(dt, p, { inShop: inR, busy: !!busy, near: 0, talking: false, clear: endClear > 0 ? [-1.5, 10.6, 2.6] : null }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, frame: DD, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading }),
    finish: () => finishGame(), scene: sceneLocks, keeper, toW, toL,
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    dispose() { card.remove(); PANEL.remove(); ARW.remove(); K.dispose(); } };
  window.__dump = API; return API;
}
