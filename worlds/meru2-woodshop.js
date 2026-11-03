// MERU 2.0 — s138 WOODSHOP JOBS [meruWoodshop] ("4. LOBBY JOBS": Ben's picks s138: Woodshop first, jobs IN PLACE in the woodshop (no new room) ·
// 6 jobs given by the MASTER CARPENTER: MEASURE + SAW · SAND IT SMOOTH · NAIL IT · BUILD A CHAIR · CARVE A FOX · PAINT + VARNISH ·
// building-themed prizes: CARPENTER APRON (1st clear) · OAK CHAIR (2 jobs, item woodChair) · GOLDEN HAMMER (all 6, item goldHammer, + 60 G) + the
// Master's VAX crates scene · relic HEARTWOOD KNOT (3 stars on all)). Stats prefix wsh. Made from the worlds/meru2-mfhq.js kit.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildWoodshop({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, clusters, renderer, go, groundH = () => 0 }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'woodshop'); if (!LR) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, OX = LR.ox, RH = 4.6;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', CREAM = '#e7e4dc', STEEL = '#9aa0a6', BLACK = '#26292d', BLUE = '#2e86b8', GRN = '#2f7d5a', OAK = '#a77b4f', PINE = '#c9a27a', DKW = '#5a3d26', WAL = '#7a5236', ACC = WAL;
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
  const rectL = (a, b, c, d) => cols.push({ f: [OX + a, OX + b, LZ + c, LZ + d], y0: LY - 3, y1: LY + 12 }), circL = (x, z, r) => cols.push({ c: [OX + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  const G = new THREE.Group(); G.name = 'woodshopJobs'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const toW = (x, y, z) => V(OX + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ });
  const today = () => save.stat('meru2Day', 1), done = () => save.stat('wshDone', null) || {};
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n), pick1 = a => a[Math.floor(Math.random() * a.length)];
  const LOOKS = [['#2e4a6b', '#e7e4dc', '#16263c'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#5d6f82', '#e7e4dc', '#334155'], ['#4f7d3a', '#e2d2b4', '#2a3d20'], ['#7a1d2a', '#f3f2f2', '#3d1218'], ['#e07a1f', '#f3f2f2', '#7a3d1a']];
  // ================= the stations (inside the existing woodshop lobby: walkway door → desk stays clear) =================
  const R0 = mk(), { box, cyl, sph } = R0;
  for (const [x, z, r] of [[-5.6, 2.1, 0.7], [5.6, 2.1, 0.7], [-7.6, -3.2, 0.5], [7.5, 4.4, 0.6], [6.6, -1.9, 0.5], [-6.2, 6.3, 0.5]]) cyl(r, r * 1.1, 0.03, '#e2cfa6', x, 0.015, z, 10);
  box(2.6, 0.06, 0.36, PINE, -5.6, 1.0, 1.2); box(2.4, 0.012, 0.07, PAPER, -5.6, 1.036, 1.04); box(0.03, 0.02, 0.36, RED, -5.2, 1.04, 1.2); box(0.55, 0.16, 0.02, STEEL, -6.4, 1.12, 1.32, 0, 0, 0.25); box(0.16, 0.12, 0.05, '#7a1d2a', -6.75, 1.2, 1.32);
  box(2.6, 0.06, 0.4, PINE, 5.6, 1.0, 1.2); box(0.26, 0.08, 0.14, RED, 6.1, 1.07, 1.2); for (const [x, z] of [[4.9, 1.1], [5.3, 1.3], [5.7, 1.1]]) box(0.14, 0.012, 0.1, DKW, x, 1.035, z);
  box(1.3, 0.12, 2.6, OAK, -8.9, 0.86, -3.2); for (const z of [-4.3, -2.1]) for (const x of [-9.4, -8.4]) box(0.12, 0.8, 0.12, DKW, x, 0.4, z); box(1.1, 0.05, 2.4, DKW, -8.9, 0.25, -3.2); rectL(-9.7, -8.2, -4.5, -1.9);
  box(0.6, 0.24, 0.5, PINE, -8.8, 1.04, -3.2); for (let k = 0; k < 4; k++) cyl(0.03, 0.03, 0.02, STEEL, -8.95 + (k % 2) * 0.28, 1.17, -3.35 + Math.floor(k / 2) * 0.3, 8); box(0.05, 0.05, 0.42, DKW, -8.55, 0.95, -2.4, 0.5); box(0.16, 0.08, 0.07, BLACK, -8.45, 0.96, -2.22, 0.5);
  box(0.04, 1.3, 2.6, '#d6c3a0', -9.82, 2.35, -3.2); for (const [z, y, w, h, c] of [[-4.1, 2.5, 0.08, 0.5, DKW], [-3.7, 2.4, 0.5, 0.14, STEEL], [-3.1, 2.55, 0.06, 0.6, WAL], [-2.6, 2.3, 0.4, 0.3, STEEL], [-2.2, 2.6, 0.08, 0.4, RED]]) box(0.05, h, w, c, -9.78, y, z);
  cyl(0.25, 0.3, 0.9, DKW, 8.6, 0.45, 4.2, 10); box(0.5, 0.6, 0.5, PINE, 8.6, 1.2, 4.2); circL(8.6, 4.2, 0.45);
  box(0.5, 0.06, 1.4, OAK, 9.6, 1.3, 5.8); box(0.14, 0.1, 1.2, DKW, 9.75, 1.22, 5.8); rectL(9.3, 10, 5.0, 6.6);
  for (const [z, s] of [[5.4, 1], [6.1, 0.8]]) { box(0.14 * s, 0.18 * s, 0.24 * s, PINE, 9.6, 1.42 + 0.09 * s, z); sph(0.09 * s, PINE, 9.6, 1.6 + 0.12 * s, z + 0.08 * s); for (const dz of [-0.05, 0.05]) box(0.03 * s, 0.08 * s, 0.03 * s, PINE, 9.6, 1.7 + 0.15 * s, z + 0.08 * s + dz); box(0.06 * s, 0.06 * s, 0.22 * s, DKW, 9.6, 1.38 + 0.06 * s, z - 0.2 * s); }
  box(2.2, 0.14, 1.4, DKW, -6.2, 0.07, 7.4); for (let k = 0; k < 4; k++) box(0.06, 0.06, 0.8, PINE, -7.0 + k * 0.12, 0.18, 7.3); box(0.5, 0.04, 0.5, PINE, -6.2, 0.17, 7.6); box(0.5, 0.5, 0.04, PINE, -6.4, 0.4, 7.0, 0.2);
  box(0.5, 0.05, 0.5, PINE, -5.5, 0.55, 7.4); for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) box(0.05, 0.5, 0.05, OAK, -5.5 + dx, 0.27, 7.4 + dz); rectL(-7.3, -5.1, 6.7, 8.1);
  box(2.6, 0.012, 2.0, CREAM, 6.2, 0.012, 7.4); box(0.5, 0.05, 0.5, RED, 6.0, 0.55, 7.4); for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) box(0.05, 0.5, 0.05, RED, 6.0 + dx, 0.27, 7.4 + dz);
  for (const [x, z, c] of [[7.0, 7.0, BLUE], [7.25, 7.3, GRN], [7.0, 7.6, '#d7ad52']]) { cyl(0.12, 0.12, 0.2, c, x, 0.11, z, 10); cyl(0.125, 0.125, 0.02, STEEL, x, 0.22, z, 10); } box(0.05, 0.03, 0.3, DKW, 6.7, 0.03, 6.8, 0.6); box(0.08, 0.05, 0.08, '#f3f2f2', 6.6, 0.04, 6.68, 0.6); rectL(5.6, 7.5, 6.8, 8.0);
  for (const x of [5.9, 7.3]) { box(0.08, 0.7, 0.6, DKW, x, 0.35, -3.0); box(0.1, 0.08, 0.7, OAK, x, 0.72, -3.0); } box(2.0, 0.05, 0.3, PINE, 6.6, 0.79, -3.0); rectL(5.6, 7.6, -3.4, -2.6);
  R0.mesh(G);
  planeT(plate('MEASURE + SAW', 384, 96, INK, PAPER, RED), 1.6, 0.38, -5.6, 3.1, 1.2, 0, G); planeT(plate('SAND IT SMOOTH', 384, 96, INK, PAPER, RED), 1.6, 0.38, 5.6, 3.1, 1.2, 0, G);
  planeT(plate('NAIL IT', 384, 96, INK, PAPER, RED), 1.4, 0.36, -9.83, 3.4, -3.2, Math.PI / 2, G); planeT(plate('CARVE A FOX', 384, 96, INK, PAPER, RED), 1.4, 0.36, 9.83, 3.2, 4.2, -Math.PI / 2, G);
  planeT(plate('BUILD A CHAIR', 384, 96, INK, PAPER, RED), 1.6, 0.38, -6.2, 3.2, 9.83, Math.PI, G); planeT(plate('PAINT + VARNISH', 384, 96, INK, PAPER, RED), 1.6, 0.38, 6.2, 3.2, 9.83, Math.PI, G);
  const hammer = new THREE.Group(); { const S = mk(); S.box(0.3, 0.04, 0.2, DKW, 0, 0.02, 0); S.box(0.04, 0.3, 0.04, '#d7ad52', 0, 0.19, 0); S.box(0.22, 0.07, 0.07, '#d7ad52', 0, 0.36, 0); S.mesh(hammer); } hammer.position.set(2.2, 1.13, -6.0); hammer.rotation.y = 0.4; G.add(hammer); hammer.visible = false;
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.07, 0.025, 40, 6), new THREE.MeshLambertMaterial({ color: '#8b5a2b', emissive: '#d7ad52', emissiveIntensity: 0.35 })); knot.position.set(-2.2, 1.3, -6.0); knot.userData.noCull = true; G.add(knot); knot.visible = false;
  // ================= FOXES: the Master Carpenter (replaces the lobby's quiet keeper) + the apprentice =================
  const old = LR.keeper; if (old && old.parent) old.parent.remove(old); LR.keeper = null;
  const LW0 = [0, -7.4, 0], AP0 = [6.6, -2.2, Math.PI];
  const keeper = kit.makeFox({ key: 'woodMaster', name: 'Master Carpenter', torso: ['#d6c3a0', '#7a5236', '#3d2a1c'], outfit: 'vest', mood: 'warm' }); keeper.position.set(LW0[0], 0, LW0[1]); keeper.rotation.y = LW0[2]; keeper.userData.noCull = true; keeper.userData.rosterShop = 'WOODSHOP'; keeper.userData.rosterRole = 'keeper'; G.add(keeper);
  const appr = kit.makeFox({ key: 'woodApprentice', name: 'Apprentice', torso: ['#e07a1f', '#d6c3a0', '#7a3d1a'], outfit: 'vest', mood: 'neutral' }); appr.position.set(AP0[0], 0, AP0[1]); appr.rotation.y = AP0[2]; appr.userData.noCull = true; appr.userData.rosterShop = 'WOODSHOP'; G.add(appr); circL(AP0[0], AP0[1], 0.45);
  const GAMES = [{ k: 'saw', name: 'Measure + Saw', color: RED }, { k: 'sand', name: 'Sand It Smooth', color: PINE }, { k: 'nail', name: 'Nail It', color: STEEL }, { k: 'chair', name: 'Build a Chair', color: OAK }, { k: 'carve', name: 'Carve a Fox', color: '#d7ad52' }, { k: 'paint', name: 'Paint + Varnish', color: BLUE }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { saw: [-5.6, 2.9], sand: [5.6, 2.9], nail: [-7.0, -3.2], chair: [-6.2, 5.5], carve: [7.0, 4.2], paint: [6.2, 5.5] };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'wsh', color: WAL, boardTitle: 'Woodshop board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], keeper, keeperRy: 0, games: GAMES, toWorld: v => v.add(G.position),
    board: { x: -3.4, y: 2.5, z: 9.83, ry: Math.PI, w: 1.5 }, hiring: { x: 2.8, z: 8.2, ry: 0 }, hiringLine: 'SAW \u00b7 SAND \u00b7 NAIL \u00b7 BUILD \u00b7 CARVE \u00b7 PAINT', sun: [{ x: 0, z: 7.4, w: 2.4, d: 2.0 }, { x: -3, z: 4, w: 2.4, d: 1.6 }, { x: 3, z: -2, w: 2.4, d: 1.6 }],
    lamps: [[0, RH - 1.5, -6], [0, RH - 1.5, -0.5], [0, RH - 1.5, 5]], lampsOn: () => { const h = hour(); return h >= 19 || h < 7; },
    browse: [[-2.6, 4.2, -Math.PI / 2], [2.6, -2.6, Math.PI / 2], [-3.0, -2.0, Math.PI]], looks: [LOOKS[1], LOOKS[3], LOOKS[4]], clock: { x: 3.6, y: 3.4, z: 9.83, ry: Math.PI } });
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
  const goRoom = (x, z, yaw) => go(OX + x, LY, LZ + z, yaw);
  const turnTo = (f, want, dt, k = 4) => { let d = want - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * k); };
  const armUp = (f, side, rz, rx = 0) => { const A = f && f.userData && f.userData.P && f.userData.P.arms; if (A && A[side]) { A[side].rotation.z = rz; A[side].rotation.x = rx; } };
  const GD = {};
  // a quick "round" engine for the panel jobs: list, ci, cueT, wait, draw, next, tick with timer + hint after 3 s
  const roundTick = (D, dt, T, missMsg, hintSel) => { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / T, J.cueT < 3); if (J.cueT <= 0) { missOne(missMsg); D.next(); } }
    if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; const s = hintSel(); if (s) pulse(PANEL.querySelector(s)); } };
  const roundNext = (D, g, T) => { if (!J || J.g !== g) return; J.ci++; J.cueT = T; J.wait = 0.3; if (J.ci >= J.list.length) { addGold(6); D.draw(); setTimeout(finishGame, 800); return; } D.draw(); };
  const wrongBtn = (el, msg) => { missOne(msg); shake(el); el.disabled = true; el.style.opacity = '0.4'; };
  const goodBtn = el => { el.style.background = '#201e1d'; el.style.color = '#ffd23a'; };
  const nOf = () => Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, goldR = () => (J.gold ? J.gold + ' G' : 'WOODSHOP');
  const body = inner => '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto">' + inner + '</div>';
  const wide = () => innerWidth > innerHeight * 1.1;
  const T_LW = { key: 'woodMaster', name: 'Master Carpenter', role: 'WOODSHOP', obj: keeper, ry: LW0[2], r: 6 }, lwLn = ln('Master Carpenter', 'WOODSHOP');
  const fitCv = cv => { if (!cv) return null; const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g, w, h }; };
  const cvTag = asp => '<canvas data-cv style="width:100%;display:block;touch-action:none;background:#3d2a1c;' + (wide() ? 'flex:1;min-height:100px' : 'aspect-ratio:' + asp + ';flex:none') + '"></canvas>';
  const bigBtn = t => '<button data-go style="' + BTN + ';flex:none;min-height:' + (wide() ? 56 : 72) + 'px;font-size:22px;background:#ec3013;color:#fff;touch-action:none">' + t + '</button>';
  const doneMsg = t => '<div style="font-size:22px;font-weight:900">' + t + '</div>';
  const keyAct = fn => { const kd = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) fn(); } }; addEventListener('keydown', kd, true); J.off = () => removeEventListener('keydown', kd, true); };
  const drag = (cv, onDown, onMove) => { if (!cv) return; cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; onDown(e); }; cv.onpointermove = e => { if (J && J.down) onMove(e); }; cv.onpointerup = cv.onpointercancel = () => { if (J) J.down = null; }; };
  const grain = (g, x0, y0, w, h, base, seed = 1) => { g.fillStyle = base; g.fillRect(x0, y0, w, h); g.strokeStyle = 'rgba(122,82,54,.4)'; g.lineWidth = 1.5; for (let k = 0; k < 6; k++) { const yy = y0 + h * (0.1 + k * 0.16); g.beginPath(); g.moveTo(x0, yy); for (let x = x0; x <= x0 + w; x += 16) g.lineTo(x, yy + Math.sin(x * 0.025 + k * 1.7 + seed) * 2.5); g.stroke(); } };
  const thunk = () => { tone(140, 0.09, 0.12, 'square'); tone(90, 0.07, 0.2, 'triangle', 0.02); };
  // ---------- 1 MEASURE + SAW: the saw slides along the plank; tap CUT on the red mark ----------
  const SWN = 6;
  GD.saw = { panel: true, shot: () => [toW(-5.6, 1.0, 1.2), 3.2, 1.8, 0.55, 2.4, 0, 5],
    begin() { goRoom(-5.6, 2.9, Math.PI); J.list = [...Array(SWN)].map((_, i) => ({ mark: Math.round(rnd(18, 82)), sp: 0.4 + i * 0.1 })); J.ci = 0; J.pos = 0.05; J.dir = 1; J.wait = 0.5; J.cut = null; snapK = true; keyAct(() => this.cut()); this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('MEASURE + SAW \u00b7 PLANK ' + nOf(), goldR()) + body(c ? '<div style="font-size:15px;font-weight:900">CUT AT <span style="color:#ec3013">' + c.mark + ' CM</span></div>' + cvTag('16/7') + timeRow + bigBtn('CUT') : doneMsg('ALL PLANKS CUT')) + tipBar('TAP CUT WHEN THE SAW IS ON THE RED MARK'));
      for (const s of ['[data-go]', '[data-cv]']) { const el = PANEL.querySelector(s); if (el) el.onpointerdown = e => { e.preventDefault(); this.cut(); }; } },
    cut() { const c = J.list[J.ci]; if (!c || J.wait > 0 || J.cut) return; const at = J.pos * 100, d = Math.abs(at - c.mark); J.cut = { at, t: 0.9 }; tone(320, 0.05, 0.25, 'sawtooth'); tone(260, 0.05, 0.25, 'sawtooth', 0.12);
      if (d <= 1.5) { addGold(4); okTip('PERFECT CUT'); } else if (d <= 4) { addGold(2); okTip('GOOD CUT \u00b7 ' + Math.round(d) + ' CM OFF'); } else missOne('OFF THE LINE BY ' + Math.round(d) + ' CM'); },
    tick(dt) { const c = J.list[J.ci]; if (!c) return;
      if (J.wait > 0) J.wait -= dt; else if (J.cut) { J.cut.t -= dt; if (J.cut.t <= 0) { J.cut = null; J.ci++; J.wait = 0.4; J.pos = 0.05; J.dir = 1; if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 700); return; } this.draw(); } }
      else { J.pos += J.dir * c.sp * dt; if (J.pos > 0.97) { J.pos = 0.97; J.dir = -1; } if (J.pos < 0.03) { J.pos = 0.03; J.dir = 1; } }
      timeBar(PANEL.querySelector('[data-time]'), 1 - J.ci / J.list.length, false); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, x0 = w * 0.05, x1 = w * 0.95, X = v => x0 + (x1 - x0) * v / 100, py = h * 0.42, ph = h * 0.34;
      g.fillStyle = '#3d2a1c'; g.fillRect(0, 0, w, h); g.fillStyle = PAPER; g.fillRect(x0, h * 0.1, x1 - x0, h * 0.22); g.fillStyle = INK; g.font = '900 ' + Math.round(h * 0.085) + 'px Archivo, sans-serif'; g.textAlign = 'center';
      for (let k = 0; k <= 100; k += 5) { const x = X(k), L = k % 10 ? 0.05 : 0.09; g.fillRect(x - 0.75, h * 0.32 - h * L, 1.5, h * L); if (k % 20 === 0 && k > 0 && k < 100) g.fillText(String(k), x, h * 0.2); }
      grain(g, x0, py, x1 - x0, ph, PINE, J.ci);
      const mx = X(c.mark); g.fillStyle = RED; g.fillRect(mx - 1.5, py - 3, 3, ph + 6); g.beginPath(); g.moveTo(mx, py - 2); g.lineTo(mx - 8, py - 14); g.lineTo(mx + 8, py - 14); g.fill();
      const sx = X(J.cut ? J.cut.at : J.pos * 100); g.fillStyle = J.cut ? YEL : PAPER; g.fillRect(sx - 2, py - h * 0.05, 4, ph + h * 0.1); g.fillStyle = STEEL; for (let y = py; y < py + ph; y += 6) { g.beginPath(); g.moveTo(sx + 2, y); g.lineTo(sx + 7, y + 3); g.lineTo(sx + 2, y + 6); g.fill(); }
      g.fillStyle = '#7a1d2a'; g.fillRect(sx - 10, py + ph + h * 0.05, 20, h * 0.1);
      if (J.cut) { const d = Math.abs(J.cut.at - c.mark); g.fillStyle = d <= 4 ? YEL : RED; g.fillText(d <= 1.5 ? 'PERFECT' : Math.round(d) + ' CM OFF', w / 2, h * 0.98); } } };
  // ---------- 2 SAND IT SMOOTH: rub the rough spots side to side (with the grain); up and down scratches ----------
  const SDN = 4, SDT = 20;
  GD.sand = { panel: true, shot: () => [toW(5.6, 1.0, 1.2), 3.2, 1.8, 0.55, 2.4, 0, 5],
    begin() { goRoom(5.6, 2.9, Math.PI); J.list = [...Array(SDN)].map((_, i) => ({ sp: [...Array(5 + i)].map(() => ({ x: rnd(0.08, 0.92), y: rnd(0.2, 0.8), r: rnd(0.07, 0.1), hp: 1 })), scr: [] })); J.ci = 0; J.cueT = SDT; J.wait = 0.4; J.down = null; J.bad = 0; J.A = 2.6; snapK = true; this.draw(); },
    rect(w, h) { return { x0: w * 0.04, y0: h * 0.08, pw: w * 0.92, ph: h * 0.84 }; },
    uv(cv, e) { const r = cv.getBoundingClientRect(), q = this.rect(r.width, r.height); J.A = q.pw / q.ph; return { u: (e.clientX - r.left - q.x0) / q.pw, v: (e.clientY - r.top - q.y0) / q.ph }; },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('SAND IT SMOOTH \u00b7 PLANK ' + nOf(), goldR()) + body(c ? cvTag('16/8') + timeRow : doneMsg('SMOOTH AS GLASS')) + tipBar('RUB THE DARK SPOTS SIDE TO SIDE \u2194 \u00b7 UP AND DOWN SCRATCHES'));
      const cv = PANEL.querySelector('[data-cv]'); drag(cv, e => { J.down = this.uv(cv, e); }, e => { const p = this.uv(cv, e); this.rub(J.down, p); if (J) J.down = p; }); },
    rub(a, b) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; const dx = (b.u - a.u) * J.A, dy = b.v - a.v; let over = false;
      for (const s of c.sp) { if (s.hp <= 0) continue; if (Math.hypot((b.u - s.x) * J.A, b.v - s.y) < s.r + 0.05) { over = true; if (Math.abs(dx) > Math.abs(dy) * 0.8) { s.hp -= Math.abs(dx) * 2.0; if (s.hp <= 0) tone(1200, 0.03, 0.08, 'triangle'); } } }
      if (Math.random() < 0.25) tone(2400 + Math.random() * 800, 0.006, 0.05, 'sawtooth');
      if (over && Math.abs(dy) > Math.abs(dx) * 1.3) { J.bad += Math.abs(dy); if (J.bad > 0.45) { J.bad = 0; c.scr.push([b.u, b.v]); missOne('SCRATCH \u00b7 SAND SIDE TO SIDE, WITH THE GRAIN'); } }
      if (c.sp.every(s => s.hp <= 0)) { addGold(4); ding(); okTip('SMOOTH AS GLASS'); J.wait = 0.9; J.down = null; setTimeout(() => this.next(), 700); } },
    next() { J.down = null; J.bad = 0; roundNext(this, 'sand', SDT); },
    tick(dt) { roundTick(this, dt, SDT, 'TOO SLOW \u00b7 THE VARNISH IS WAITING', () => '[data-cv]'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, q = this.rect(w, h); g.fillStyle = '#3d2a1c'; g.fillRect(0, 0, w, h); grain(g, q.x0, q.y0, q.pw, q.ph, PINE, J.ci * 3);
      for (const s of c.sp) { if (s.hp <= 0) continue; const cx = q.x0 + s.x * q.pw, cy = q.y0 + s.y * q.ph, r = s.r * q.ph; g.globalAlpha = 0.25 + 0.65 * s.hp; g.fillStyle = '#7a5236'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.fillStyle = '#3d2a1c'; for (let k = 0; k < 14; k++) { const a = k * 2.4 + s.x * 9, rr = r * ((k * 37 % 10) / 11); g.fillRect(cx + Math.cos(a) * rr - 1.5, cy + Math.sin(a) * rr - 1.5, 3, 3); } g.globalAlpha = 1; }
      g.strokeStyle = '#3d2a1c'; g.lineWidth = 2; for (const [u, v] of c.scr) { const x = q.x0 + u * q.pw, y = q.y0 + v * q.ph; for (const dx of [-4, 0, 4]) { g.beginPath(); g.moveTo(x + dx, y - 16); g.lineTo(x + dx + 2, y + 16); g.stroke(); } }
      g.fillStyle = INK; g.font = '900 ' + Math.round(Math.max(12, h * 0.06)) + 'px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText('ROUGH SPOTS ' + c.sp.filter(s => s.hp > 0).length, q.x0 + 8, q.y0 + h * 0.08);
      if (J.down) { const x = q.x0 + J.down.u * q.pw, y = q.y0 + J.down.v * q.ph; g.fillStyle = RED; g.fillRect(x - 26, y - 14, 52, 28); g.fillStyle = '#d6c3a0'; g.fillRect(x - 26, y + 10, 52, 5); } } };
  // ---------- 3 NAIL IT: tap HAMMER with the needle in the green; red = bent nail; 3 good hits per nail ----------
  const NLN = 6, NLT = 10;
  GD.nail = { panel: true, shot: () => [toW(-8.8, 1.1, -3.2), 2.4, 1.6, 0.6, 2.0, Math.PI / 2, 5],
    begin() { goRoom(-7.0, -3.2, -Math.PI / 2); J.list = [...Array(NLN)].map((_, i) => ({ sink: 0, gw: 0.24 - i * 0.022, gc: rnd(0.45, 0.75), sp: 0.55 + i * 0.09, bent: false })); J.ci = 0; J.cueT = NLT; J.wait = 0.4; J.ph = 0; J.m = 0; J.hitT = 0; snapK = true; keyAct(() => this.hit()); this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('NAIL IT \u00b7 NAIL ' + nOf(), goldR()) + body(c ? cvTag('4/3') + timeRow + bigBtn('HAMMER') : doneMsg('EVERY NAIL FLUSH')) + tipBar('HIT IN THE GREEN \u00b7 RED = TOO HARD, THE NAIL BENDS'));
      for (const s of ['[data-go]', '[data-cv]']) { const el = PANEL.querySelector(s); if (el) el.onpointerdown = e => { e.preventDefault(); this.hit(); }; } J.idle = 0; J.hinted = false; },
    hit() { const c = J.list[J.ci]; if (!c || J.wait > 0 || c.bent || c.sink >= 1) return; J.idle = 0; J.hitT = 0.16; const v = J.m;
      if (v > 0.9) { c.bent = true; tone(180, 0.08, 0.3, 'sawtooth'); missOne('TOO HARD \u00b7 THE NAIL BENT'); J.wait = 0.8; setTimeout(() => this.next(), 700); return; }
      if (Math.abs(v - c.gc) <= c.gw / 2) { thunk(); c.sink = Math.min(1, c.sink + 1 / 3 + 0.001); if (c.sink >= 1) { addGold(3); okTip('FLUSH'); J.wait = 0.7; setTimeout(() => this.next(), 600); } else { c.gc = rnd(0.42, 0.78); okTip('GOOD HIT \u00b7 ' + Math.round(c.sink * 3) + ' / 3'); } return; }
      tone(400, 0.03, 0.08, 'triangle'); okTip('TOO SOFT \u00b7 HIT IN THE GREEN'); },
    next() { roundNext(this, 'nail', NLT); },
    tick(dt) { const c = J.list[J.ci]; if (c && J.wait <= 0) { J.ph += dt * c.sp * Math.PI * 2; J.m = 0.5 - 0.5 * Math.cos(J.ph); } J.hitT -= dt; roundTick(this, dt, NLT, 'TOO SLOW \u00b7 THE GLUE DRIED', () => '[data-go]'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f; g.fillStyle = '#3d2a1c'; g.fillRect(0, 0, w, h);
      const bx0 = w * 0.06, bw = w * 0.66, by = h * 0.62; grain(g, bx0, by, bw, h * 0.3, OAK, 2);
      J.list.forEach((n, i) => { if (i >= J.ci) return; const x = bx0 + bw * (0.12 + i * 0.15); g.fillStyle = n.bent ? RED : STEEL; g.fillRect(x - 9, by - 3, 18, 4); });
      const nx = bx0 + bw * 0.62, L = h * 0.34, top = by - L * (1 - c.sink); g.strokeStyle = STEEL; g.lineWidth = 6; g.beginPath(); g.moveTo(nx, by);
      if (c.bent) { g.lineTo(nx, by - L * 0.5); g.lineTo(nx + L * 0.4, by - L * 0.75); g.stroke(); } else { g.lineTo(nx, top); g.stroke(); g.fillStyle = STEEL; g.fillRect(nx - 14, top - 5, 28, 6); }
      const hy = c.bent ? by - L * 0.85 : top - 6, up = J.hitT > 0 ? 0 : h * 0.16; g.save(); g.translate(nx - 22, hy - up); g.rotate(J.hitT > 0 ? 0 : -0.5); g.fillStyle = BLACK; g.fillRect(-20, -26, 44, 24); g.fillStyle = DKW; g.fillRect(-60, -18, 50, 9); g.restore();
      const mx = w * 0.8, mw = w * 0.12, m0 = h * 0.08, mh = h * 0.84, Y = v => m0 + mh * (1 - v); g.fillStyle = PAPER; g.fillRect(mx, m0, mw, mh); g.fillStyle = RED; g.fillRect(mx, m0, mw, mh * 0.1); g.fillStyle = '#7cff9b'; g.fillRect(mx, Y(c.gc + c.gw / 2), mw, mh * c.gw); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(mx, m0, mw, mh);
      g.fillStyle = YEL; g.fillRect(mx - 8, Y(J.m) - 3, mw + 16, 6); g.fillStyle = INK; g.fillRect(mx - 8, Y(J.m) - 1, mw + 16, 2);
      g.fillStyle = PAPER; g.font = '900 ' + Math.round(Math.max(12, h * 0.06)) + 'px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText('HITS ' + Math.round(c.sink * 3) + ' / 3', bx0, h * 0.12); } };
  // ---------- 4 BUILD A CHAIR: match each blueprint picture to its part name, left to right ----------
  const CHT = 20, BLD = [['STOOL', ['legs', 'rungs', 'seat']], ['CHAIR', ['legs', 'rungs', 'seat', 'back']], ['TABLE', ['legs', 'apron', 'top', 'varnish']], ['BOOKSHELF', ['sides', 'shelves', 'panel', 'feet']], ['BED', ['frame', 'legs', 'slats', 'headboard', 'mattress']]];
  const PN = { legs: 'LEGS', rungs: 'RUNGS', seat: 'SEAT', back: 'BACKREST', apron: 'APRON', top: 'TABLE TOP', varnish: 'VARNISH', sides: 'SIDE BOARDS', shelves: 'SHELVES', panel: 'BACK PANEL', feet: 'FEET', frame: 'BED FRAME', slats: 'SLATS', headboard: 'HEADBOARD', mattress: 'MATTRESS' };
  const PG = { legs: '<rect x="6" y="8" width="5" height="28"/><rect x="29" y="8" width="5" height="28"/><rect x="14" y="12" width="4" height="22" opacity=".45"/><rect x="22" y="12" width="4" height="22" opacity=".45"/>',
    rungs: '<rect x="4" y="16" width="32" height="4"/><rect x="4" y="27" width="32" height="4"/>', seat: '<rect x="3" y="16" width="34" height="9"/>',
    back: '<rect x="8" y="3" width="4" height="34"/><rect x="28" y="3" width="4" height="34"/><rect x="8" y="5" width="24" height="5"/><rect x="8" y="15" width="24" height="5"/>',
    apron: '<rect x="3" y="12" width="34" height="6"/><rect x="3" y="12" width="3" height="14"/><rect x="34" y="12" width="3" height="14"/>', top: '<rect x="1" y="15" width="38" height="7"/>',
    varnish: '<rect x="12" y="12" width="16" height="22"/><rect x="15" y="6" width="10" height="7"/><rect x="14" y="18" width="12" height="8" fill="#d7ad52"/>',
    sides: '<rect x="5" y="2" width="8" height="36"/><rect x="27" y="2" width="8" height="36"/>', shelves: '<rect x="4" y="7" width="32" height="4"/><rect x="4" y="18" width="32" height="4"/><rect x="4" y="29" width="32" height="4"/>',
    panel: '<rect x="6" y="3" width="28" height="34" fill="none" stroke="#201e1d" stroke-width="3"/><path d="M6 14h28M6 25h28" stroke="#201e1d" stroke-width="1.5"/>', feet: '<rect x="4" y="27" width="9" height="9"/><rect x="27" y="27" width="9" height="9"/><rect x="4" y="22" width="32" height="3" opacity=".3"/>',
    frame: '<rect x="4" y="10" width="32" height="20" fill="none" stroke="#201e1d" stroke-width="4"/>', slats: '<rect x="7" y="9" width="3" height="22"/><rect x="14" y="9" width="3" height="22"/><rect x="21" y="9" width="3" height="22"/><rect x="28" y="9" width="3" height="22"/>',
    headboard: '<path d="M4 36V16q16-14 32 0v20h-5V19q-11-8-22 0v17z"/>', mattress: '<rect x="2" y="14" width="36" height="13" rx="4"/><path d="M8 20h24" stroke="#f3f2f2" stroke-width="2"/>' };
  const pGlyph = (k, s = 34) => '<svg viewBox="0 0 40 40" style="width:' + s + 'px;height:' + s + 'px;flex:none" fill="#201e1d" aria-hidden="true">' + PG[k] + '</svg>';
  GD.chair = { panel: true, shot: () => [toW(-6.0, 0.5, 7.4), 2.8, 1.6, 0.6, 2.2, Math.PI, 5],
    begin() { goRoom(-6.2, 5.5, 0); J.list = BLD.map(([n, steps]) => ({ n, steps, tray: shuffle([...steps, ...pickN(Object.keys(PN).filter(k => !steps.includes(k)), 2)]) })); J.ci = 0; J.si = 0; J.cueT = CHT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('BUILD A CHAIR', goldR()) + body(doneMsg('FIVE PIECES BUILT')) + tipBar('IT ALL STANDS UP')); return; }
      const bp = '<div style="display:flex;gap:6px;flex-wrap:wrap;background:#2e5a8a;padding:8px;border:2px solid #201e1d">' + c.steps.map((k, i) => { const dn = i < J.si, cur = i === J.si;
        return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 6px;background:' + (dn ? '#201e1d' : '#f3f2f2') + ';border:' + (cur ? '3px solid #ffd23a' : '2px dashed #f3f2f2') + ';color:' + (dn ? '#ffd23a' : '#201e1d') + ';font-weight:900;font-size:11px;min-width:48px">' + (dn ? '\u2713 ' + PN[k] : (i + 1) + '') + (dn ? '' : pGlyph(k)) + '</div>'; }).join('') + '</div>';
      showPanel(panelHead('BUILD A ' + c.n + ' \u00b7 ' + nOf(), goldR()) + body('<div style="font-size:11px;font-weight:900;color:#ec3013">BLUEPRINT \u00b7 STEP ' + Math.min(J.si + 1, c.steps.length) + ': WHICH PART IS THE YELLOW PICTURE?</div>' + bp + timeRow
        + '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">' + c.tray.map(k => '<button data-k="' + k + '" style="' + BTN + (c.steps.indexOf(k) > -1 && c.steps.indexOf(k) < J.si ? ';opacity:.35' : '') + '">' + PN[k] + '</button>').join('') + '</div>') + tipBar('MATCH THE PICTURES LEFT TO RIGHT \u00b7 TWO PARTS ARE SPARES'));
      PANEL.querySelectorAll('[data-k]').forEach(b => { b.onclick = () => this.tap(b.dataset.k, b); }); J.idle = 0; J.hinted = false; },
    tap(k, el) { const c = J.list[J.ci]; if (!c || J.wait > 0 || J.si >= c.steps.length) return; J.idle = 0;
      if (k !== c.steps[J.si]) { missOne(c.steps.indexOf(k) > J.si ? 'NOT YET \u00b7 THAT PART COMES LATER' : 'WRONG PART \u00b7 LOOK AT PICTURE ' + (J.si + 1)); shake(el); return; }
      J.si++; thunk(); if (J.si >= c.steps.length) { addGold(5); ding(); this.draw(); okTip('THE ' + c.n + ' STANDS UP'); J.wait = 1.0; setTimeout(() => this.next(), 900); return; } this.draw(); },
    next() { J.si = 0; roundNext(this, 'chair', CHT); },
    tick(dt) { roundTick(this, dt, CHT, 'TOO SLOW \u00b7 THE GLUE SET', () => { const c = J.list[J.ci]; return '[data-k="' + c.steps[J.si] + '"]'; }); } };
  // ---------- 5 CARVE A FOX: trace the pencil outline; slip off it and you chip the wood ----------
  const CVT = 35, SHAPES = [['FOX HEAD', [[0.5, 0.88], [0.24, 0.62], [0.26, 0.36], [0.18, 0.1], [0.4, 0.28], [0.5, 0.3], [0.6, 0.28], [0.82, 0.1], [0.74, 0.36], [0.76, 0.62]]],
    ['FOX TAIL', [[0.2, 0.86], [0.17, 0.6], [0.28, 0.36], [0.48, 0.18], [0.74, 0.13], [0.86, 0.26], [0.7, 0.34], [0.55, 0.44], [0.46, 0.64], [0.42, 0.86]]],
    ['SITTING FOX', [[0.34, 0.9], [0.31, 0.62], [0.27, 0.42], [0.29, 0.26], [0.25, 0.08], [0.38, 0.17], [0.46, 0.17], [0.52, 0.05], [0.55, 0.24], [0.5, 0.4], [0.58, 0.6], [0.7, 0.72], [0.86, 0.68], [0.88, 0.82], [0.7, 0.9]]]];
  const samplePath = pts => { const out = [], P = [...pts, pts[0]]; for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.012)); for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } return out; };
  GD.carve = { panel: true, shot: () => [toW(8.6, 1.2, 4.2), 2.2, 1.8, 0.3, 2.0, -Math.PI / 2, 5],
    begin() { goRoom(7.0, 4.2, Math.PI / 2); J.list = SHAPES.map(([n, p]) => { const pts = samplePath(p); return { n, pts, cut: new Uint8Array(pts.length), chips: [] }; }); J.ci = 0; J.cueT = CVT; J.wait = 0.4; J.down = null; J.offD = 0; J.slipT = 0; snapK = true; this.draw(); },
    sq(w, h) { const s = Math.min(w, h) * 0.92; return { s, x0: (w - s) / 2, y0: (h - s) / 2 }; },
    uv(cv, e) { const r = cv.getBoundingClientRect(), q = this.sq(r.width, r.height); return { u: (e.clientX - r.left - q.x0) / q.s, v: (e.clientY - r.top - q.y0) / q.s }; },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead((c ? 'CARVE A ' + c.n : 'CARVE A FOX') + ' \u00b7 ' + nOf(), goldR()) + body(c ? cvTag('1/1') + timeRow : doneMsg('THREE FOXES IN THE WOOD')) + tipBar('DRAG ALONG THE PENCIL LINE \u00b7 STAY ON IT'));
      const cv = PANEL.querySelector('[data-cv]'); drag(cv, e => { const p = this.uv(cv, e); J.down = p; this.carve(p, null); }, e => { const p = this.uv(cv, e); this.carve(p, J.down); if (J) J.down = p; }); },
    carve(p, prev) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; const steps = prev ? Math.max(1, Math.ceil(Math.hypot(p.u - prev.u, p.v - prev.v) / 0.01)) : 1; let best = 9;
      for (let s = 1; s <= steps; s++) { const u = prev ? prev.u + (p.u - prev.u) * s / steps : p.u, v = prev ? prev.v + (p.v - prev.v) * s / steps : p.v; for (let i = 0; i < c.pts.length; i++) { const d = Math.hypot(c.pts[i][0] - u, c.pts[i][1] - v); if (d < best) best = d; if (d < 0.045) c.cut[i] = 1; } }
      if (prev && best > 0.07) { J.offD += Math.hypot(p.u - prev.u, p.v - prev.v); if (J.offD > 0.06 && J.slipT <= 0) { J.offD = 0; J.slipT = 0.8; c.chips.push([p.u, p.v]); tone(220, 0.06, 0.15, 'square'); missOne('SLIPPED \u00b7 STAY ON THE PENCIL LINE'); } } else if (best <= 0.07) J.offD = 0;
      if (Math.random() < 0.3) tone(1800 + Math.random() * 900, 0.008, 0.04, 'square');
      let n = 0; for (const x of c.cut) n += x; if (n >= c.pts.length * 0.9) { c.cut.fill(1); addGold(5); ding(); okTip('A FINE ' + c.n); J.wait = 1.0; J.down = null; setTimeout(() => this.next(), 900); } },
    next() { J.down = null; J.offD = 0; roundNext(this, 'carve', CVT); },
    tick(dt) { J.slipT -= dt; roundTick(this, dt, CVT, 'TOO SLOW \u00b7 THE MASTER TOOK THE CHISEL BACK', () => '[data-cv]'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, q = this.sq(w, h), X = u => q.x0 + u * q.s, Y = v => q.y0 + v * q.s;
      g.fillStyle = '#3d2a1c'; g.fillRect(0, 0, w, h); grain(g, q.x0, q.y0, q.s, q.s, PINE, 5);
      g.setLineDash([6, 5]); g.strokeStyle = '#5f6469'; g.lineWidth = 2; g.beginPath(); c.pts.forEach(([u, v], i) => (i ? g.lineTo(X(u), Y(v)) : g.moveTo(X(u), Y(v)))); g.closePath(); g.stroke(); g.setLineDash([]);
      g.strokeStyle = DKW; g.lineWidth = Math.max(5, q.s * 0.022); g.lineCap = 'round'; for (let i = 0; i < c.pts.length; i++) { const j = (i + 1) % c.pts.length; if (c.cut[i] && c.cut[j]) { g.beginPath(); g.moveTo(X(c.pts[i][0]), Y(c.pts[i][1])); g.lineTo(X(c.pts[j][0]), Y(c.pts[j][1])); g.stroke(); } }
      if (!c.cut.some(x => x)) { g.fillStyle = RED; g.beginPath(); g.arc(X(c.pts[0][0]), Y(c.pts[0][1]), 9, 0, 7); g.fill(); }
      g.strokeStyle = RED; g.lineWidth = 3; for (const [u, v] of c.chips) { g.beginPath(); g.moveTo(X(u) - 7, Y(v) - 7); g.lineTo(X(u) + 7, Y(v) + 7); g.moveTo(X(u) + 7, Y(v) - 7); g.lineTo(X(u) - 7, Y(v) + 7); g.stroke(); }
      let n = 0; for (const x of c.cut) n += x; g.fillStyle = INK; g.font = '900 ' + Math.round(Math.max(12, q.s * 0.05)) + 'px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText(Math.round(n / c.pts.length * 100) + '%', q.x0 + 8, q.y0 + q.s * 0.07);
      if (J.down) { g.fillStyle = STEEL; g.beginPath(); g.arc(X(J.down.u), Y(J.down.v), 6, 0, 7); g.fill(); } } };
  // ---------- 6 PAINT + VARNISH: cover the wood, keep the brush moving (it drips), stay off the floor ----------
  const PTW = 24, PTH = 16, PNT = 25, ITEMS = [['STOOL', '#ec3013', [[5, 4, 14, 3], [6, 7, 2, 8], [16, 7, 2, 8], [11, 7, 2, 8]]], ['CHAIR', '#2e86b8', [[7, 0, 2, 16], [15, 0, 2, 16], [9, 1, 6, 2], [9, 5, 6, 2], [5, 9, 14, 3], [5, 12, 2, 4], [17, 12, 2, 4]]], ['TOY BOX', '#2f7d5a', [[3, 2, 18, 3], [4, 5, 16, 10]]]];
  const maskOf = rs => { const m = new Uint8Array(PTW * PTH); for (const [x, y, w, h] of rs) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) m[j * PTW + i] = 1; return m; };
  GD.paint = { panel: true, shot: () => [toW(6.0, 0.5, 7.4), 2.8, 1.6, 0.6, 2.2, Math.PI, 5],
    begin() { goRoom(6.2, 5.5, 0); J.list = ITEMS.flatMap(([n, col, rs]) => ['paint', 'varnish'].map(coat => ({ n, col, coat, mask: maskOf(rs), th: new Float32Array(PTW * PTH), drips: [] }))); J.list.forEach(c => { c.tot = c.mask.reduce((a, b) => a + b, 0); }); J.ci = 0; J.cueT = PNT; J.wait = 0.4; J.down = null; J.mess = 0; J.dripT = 0; snapK = true; this.draw(); },
    grid(w, h) { const cs = Math.min(w / (PTW + 2), h / (PTH + 2)); return { cs, ox: (w - PTW * cs) / 2, oy: (h - PTH * cs) / 2 }; },
    cell(cv, e) { const r = cv.getBoundingClientRect(), q = this.grid(r.width, r.height); return { x: (e.clientX - r.left - q.ox) / q.cs, y: (e.clientY - r.top - q.oy) / q.cs }; },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead((c ? 'PAINT + VARNISH \u00b7 ' + c.n + ' \u00b7 ' + (c.coat === 'paint' ? 'COAT 1 PAINT' : 'COAT 2 VARNISH') : 'PAINT + VARNISH'), goldR()) + body(c ? cvTag('3/2') + timeRow : doneMsg('PAINTED AND VARNISHED')) + tipBar('DRAG TO COVER ALL THE WOOD \u00b7 KEEP MOVING OR IT DRIPS'));
      const cv = PANEL.querySelector('[data-cv]'); drag(cv, e => { J.down = this.cell(cv, e); }, e => { const p = this.cell(cv, e); this.stroke(J.down, p); if (J) J.down = p; }); },
    dab(x, y, k) { const c = J.list[J.ci]; for (let j = Math.floor(y - 2); j <= y + 2; j++) for (let i = Math.floor(x - 2); i <= x + 2; i++) { if (i < 0 || j < 0 || i >= PTW || j >= PTH || !c.mask[j * PTW + i]) continue; const d = Math.hypot(i + 0.5 - x, j + 0.5 - y); if (d < 1.9) c.th[j * PTW + i] += k * (1 - d / 2.1); } },
    stroke(a, b) { const c = J.list[J.ci]; if (!c || J.wait > 0 || !a) return; J.idle = 0; const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.5)); for (let s = 1; s <= n; s++) this.dab(a.x + (b.x - a.x) * s / n, a.y + (b.y - a.y) * s / n, 0.3); },
    tick(dt) { const c = J.list[J.ci]; J.dripT -= dt;
      if (c && J.down && J.wait <= 0) { const { x, y } = J.down, ix = Math.floor(x), iy = Math.floor(y), inside = ix >= 0 && iy >= 0 && ix < PTW && iy < PTH && c.mask[iy * PTW + ix]; this.dab(x, y, dt * 2.6);
        if (!inside) { J.mess += dt; if (J.mess > 0.5) { J.mess = 0; missOne('PAINT ON THE FLOOR \u00b7 STAY ON THE WOOD'); } } else J.mess = Math.max(0, J.mess - dt);
        for (let i = 0; i < c.th.length; i++) if (c.th[i] > 2.4) { c.th[i] = 1.2; if (J.dripT <= 0) { J.dripT = 1; c.drips.push([i % PTW, Math.floor(i / PTW)]); missOne('A DRIP \u00b7 KEEP THE BRUSH MOVING'); } }
        let n = 0; for (let i = 0; i < c.th.length; i++) if (c.mask[i] && c.th[i] >= 0.6) n++; if (n >= c.tot * 0.95) { addGold(4); ding(); okTip(c.coat === 'paint' ? 'PAINTED \u00b7 NOW THE VARNISH' : 'A SHINE YOU CAN SEE YOUR FACE IN'); J.wait = 0.9; J.down = null; setTimeout(() => this.next(), 800); } }
      roundTick(this, dt, PNT, 'TOO SLOW \u00b7 THE PAINT DRIED IN THE TIN', () => '[data-cv]'); this.render(); },
    next() { J.down = null; J.mess = 0; roundNext(this, 'paint', PNT); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, q = this.grid(w, h); g.fillStyle = CREAM; g.fillRect(0, 0, w, h); let n = 0;
      for (let j = 0; j < PTH; j++) for (let i = 0; i < PTW; i++) { const k = j * PTW + i; if (!c.mask[k]) continue; const x = q.ox + i * q.cs, y = q.oy + j * q.cs, a = Math.min(1, c.th[k] / 0.6); if (a >= 1) n++;
        g.fillStyle = c.coat === 'paint' ? PINE : c.col; g.fillRect(x, y, q.cs + 0.5, q.cs + 0.5); if (a > 0) { g.globalAlpha = a; g.fillStyle = c.coat === 'paint' ? c.col : 'rgba(255,226,160,0.55)'; g.fillRect(x, y, q.cs + 0.5, q.cs + 0.5); if (c.coat === 'varnish' && (i + j) % 5 === 0) { g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x + q.cs * 0.2, y + q.cs * 0.2, q.cs * 0.25, q.cs * 0.6); } g.globalAlpha = 1; } }
      g.fillStyle = c.coat === 'paint' ? c.col : '#d7ad52'; for (const [i, j] of c.drips) { const x = q.ox + (i + 0.5) * q.cs, y = q.oy + (j + 1) * q.cs; g.beginPath(); g.moveTo(x - q.cs * 0.3, y); g.lineTo(x + q.cs * 0.3, y); g.lineTo(x, y + q.cs * 1.4); g.fill(); }
      g.fillStyle = INK; g.font = '900 ' + Math.round(Math.max(12, h * 0.055)) + 'px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText(Math.round(n / c.tot * 100) + '% \u00b7 ' + (c.coat === 'paint' ? 'PAINT' : 'VARNISH'), 8, h * 0.07);
      if (J.down) { const x = q.ox + J.down.x * q.cs, y = q.oy + J.down.y * q.cs; g.fillStyle = DKW; g.fillRect(x - 3, y - q.cs * 3, 6, q.cs * 2); g.fillStyle = c.coat === 'paint' ? c.col : '#d7ad52'; g.fillRect(x - q.cs * 0.9, y - q.cs, q.cs * 1.8, q.cs); } } };
  // ================= PRIZES (building-themed) =================
  const SUIT = { outfit: 'vest', torso: ['#d6c3a0', '#7a5236', '#3d2a1c'], name: 'CARPENTER APRON' };
  const GIFT = { suit: 'A CARPENTER APRON, your size. Pockets for pencils. The Tailor has a copy.', chair: 'Your own OAK CHAIR, built from your planks. Take it home.', trophy: 'All six. The GOLDEN HAMMER is yours, with 60 gold. Sit a minute. I need a word.' };
  function giveGift() { save.setStat('wshClears', save.stat('wshClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('wshSuit', false)) { save.setStat('wshSuit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) save.setStat('tailorOutfits', [...list, SUIT]); save.setOutfit(SUIT); wear && wear(SUIT); return 'suit'; }
    if (nd >= 2 && !save.stat('wshChair', false)) { save.setStat('wshChair', true); save.give('woodChair'); return 'chair'; }
    if (nd >= GAMES.length && !save.stat('wshAll', false)) { save.setStat('wshAll', true); save.give('goldHammer'); save.addGold(60); return 'trophy'; } return null; }
  const allThree = () => GAMES.every(q => K.stars(q.k) >= 3);
  function knotCheck(then) { if (!allThree() || save.stat('wshKnot', false)) { then && then(); return false; } save.setStat('wshKnot', true); save.addRelic('heartwoodKnot'); knot.visible = true; ding();
    sayTo(T_LW, [lwLn('Three stars on every job. Take the HEARTWOOD KNOT. The oldest tree in Meru grew it.')], () => { toast('RELIC \u00b7 HEARTWOOD KNOT', 2.6); then && then(); }); return true; }
  function useItem(id) { if (id === 'woodChair' && save.count('woodChair')) { toast('YOUR OAK CHAIR \u00b7 IT WAITS FOR YOUR HOME', 2.4); return true; } if (id === 'goldHammer' && save.count('goldHammer')) { toast('THE GOLDEN HAMMER \u00b7 SIX FOR SIX AT THE WOODSHOP', 2.4); return true; } return false; }
  // ================= run a job =================
  const INTRO = { saw: 'Measure and saw. Tap CUT when the saw sits on the red mark. Six planks.', sand: 'Sand it smooth. Rub the rough spots side to side. Up and down scratches.', nail: 'Nail it. Hit in the green. Too hard bends the nail. Three good hits each.',
    chair: 'Build it. Match each blueprint picture to its part, left to right. Five pieces.', carve: 'Carve a fox. Trace the pencil line. Slip off it and you chip the wood.', paint: 'Paint, then varnish. Cover all the wood. Keep the brush moving or it drips.' };
  const DONE = { saw: 'Six straight cuts. The plank pile thanks you.', sand: 'Smooth as a frozen pond. Feel that.', nail: 'Flush and straight. Well, nearly all of them.', chair: 'All five stand up. More than most furniture manages.', carve: 'Three foxes in the wood. One looks like me.', paint: 'Painted and varnished. No drips on my floor. Good.' };
  const nextOf = () => { const d = done(), n = GAMES.find(q => !d[q.k]); return (n || GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; sayTo(T_LW, [lwLn(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('wshVisits', save.stat('wshVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], t: 0 }; busy = 'job'; ding(); fade(() => GD[g].begin()); }
  function finishGame() { if (!J || busy !== 'job') return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold; J.off && J.off(); J.off = null;
    const d = { ...done() }; d[g] = true; save.setStat('wshDone', d); save.setStat('wshLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none';
    const say = () => { const L1 = [lwLn(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift) L1.push(lwLn(GIFT[gift])); K.finish(g, stars, gold, first); for (let k = 0; k < 4; k++) tone(1200 + k * 200, 0.02, 0.06, 'triangle', k * 0.06);
      sayTo(T_LW, L1, () => { if (busy === 'end') { busy = null; J = null; } knotCheck(); }); };
    fade(() => { cleanup(); goRoom(0, -4.4, Math.PI); snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 40000); }
  function cleanup() { if (J) { J.off && J.off(); J.off = null; J.down = null; } hidePanel(); hideCard(); ARW.style.display = 'none'; keeper.position.set(LW0[0], 0, LW0[1]); keeper.rotation.y = LW0[2]; }
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
    camCur.pos.set(clamp(camCur.pos.x, OX - 9.5, OX + 9.5), clamp(camCur.pos.y, LY + 0.6, LY + RH - 0.3), clamp(camCur.pos.z, LZ - 9.5, LZ + 9.5)); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ================= talk + prompt =================
  const inRoom = P => !!P && Math.abs(P.x - OX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const nearL = (p, x, z, r) => Math.hypot(p.x - x, p.z - z) < r;
  const ringAt = p => GAMES.find(q => nearL(p, RINGS[q.k][0], RINGS[q.k][1], 1.05));
  const nearK = p => nearL(p, 0, -5, 2.4), nearAp = p => nearL(p, AP0[0], AP0[1] + 0.4, 1.6);
  const sceneReady = () => save.stat('wshAll', false) && !save.stat('wshScene', false);
  function prompt(P) { if (busy || !inRoom(P)) return null; const p = toL(P), r = ringAt(p); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearK(p)) return sceneReady() ? 'TALK \u00b7 MASTER CARPENTER \u00b7 A WORD' : 'TALK \u00b7 MASTER CARPENTER'; if (nearAp(p)) return 'TALK \u00b7 APPRENTICE'; return null; }
  let talkL = save.stat('wshTalked', 0), talkA = 0;
  const WM_HI = ['Back again? Grab an apron. The sawdust will not sweep itself.', 'Good oak, good pine, good glue. That is the whole trade.', 'The apprentice is still sanding that plank. Day five.'];
  function kMenu() { const first = !talkL; talkL++; save.setStat('wshTalked', talkL); if (knotCheck()) return;
    const ch = [{ text: CHOICE_WORK, pick: () => startGame(nextOf()) }, { text: 'PICK A JOB', pick: () => sayTo(T_LW, [{ ...lwLn('Which bench?'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) }];
    if (sceneReady()) ch.push({ text: 'YOU WANTED A WORD?', pick: () => sceneCrates() });
    ch.push({ text: 'WHAT DO YOU MAKE?', pick: () => sayTo(T_LW, [lwLn('Doors for the Deco, frames for the Gallery, and crates for VAX.')]) });
    if (save.stat('wshScene', false)) ch.push({ text: 'THE VAX CRATES?', pick: () => sayTo(T_LW, [lwLn('Fifty crates, false bottoms. They came back empty, smelling of machine oil.')]) });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T_LW, [lwLn('Goodbye. Mind the saw on your way out.')]) });
    sayTo(T_LW, [{ ...lwLn(first ? 'Master Carpenter. Six jobs at the benches. Measure twice, cut once, sweep forever.' : sceneReady() ? 'There you are. Six for six. Sit a minute.' : WM_HI[(talkL - 2) % WM_HI.length]), choices: ch }]); }
  function sceneCrates() { busy = 'scene'; save.setStat('wshScene', true);
    const end = () => { busy = null; save.setStat('storyWoodCrates', true); toast('STORY \u00b7 VAX ORDERED SECRET CRATES', 2.6); knotCheck(); };
    sayTo(T_LW, [lwLn('You saw straight, sand true and carve like you mean it. Well done.'), { ...lwLn('Last month VAX ordered fifty crates. False bottoms, secret latches. Paid in gold.'), choices: [
      { text: 'WHAT GOES IN A FALSE BOTTOM?', pick: () => sayTo(T_LW, [lwLn('Nothing honest. They came back empty, smelling of machine oil.')], end) },
      { text: 'I WILL LOOK INTO IT.', pick: () => sayTo(T_LW, [lwLn('Quietly, please. VAX pays my rent. Keep the golden hammer.')], end) }] }]); }
  const AP_LINES = ['Sanding. Still sanding. Is it smooth yet? It is never smooth.', 'The Master says I will carve a fox one day. Today: plank.', 'Do not tell the Master. I glued my paw to the bench. Twice.'];
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'scene') return true; if (busy) return false; if (!inRoom(P)) return false; const p = toL(P);
    const r = ringAt(p); if (r) { startGame(r.k); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf()); return true; }
    if (nearK(p)) { tone(1320, 0.05, 0.5); kMenu(); return true; }
    if (nearAp(p)) { sayTo({ key: 'woodApprentice', name: 'Apprentice', role: 'WOODSHOP', obj: appr, r: 4 }, [{ who: 'Apprentice', role: 'WOODSHOP', text: AP_LINES[talkA++ % AP_LINES.length] }]); return true; }
    return false; }
  // ================= per frame =================
  let dayCheck = 0, spawned = !/[?&]spawn=woodshop/.test(location.search), spawnT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt;
    if (!spawned && P && (spawnT += dt) > 0.8) { spawned = true; goRoom(0, 7.6, Math.PI); }
    const inR = inRoom(P); G.visible = inR || busy === 'job';
    if ((dayCheck -= dt) <= 0) { dayCheck = 0.5; if (inR) { hammer.visible = !!save.stat('wshAll', false); knot.visible = !!save.stat('wshKnot', false); } }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if (busy === 'job' && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('woodshop job: ' + (e && e.stack || e)); stop(); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && !fading && J.list && J.ci < J.list.length) GD[J.g].draw();
    if (G.visible) { knot.rotation.y += dt * 0.8; for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
      const p = toL(P); kit.animFox(appr, dt, 0, false); if (!busy && nearL(p, appr.position.x, appr.position.z, 3.5)) turnTo(appr, Math.atan2(p.x - appr.position.x, p.z - appr.position.z), dt, 3); else { turnTo(appr, AP0[2], dt, 2); armUp(appr, 1, 0.4 + Math.sin(t * 7) * 0.25, -1.1); } }
    K.tick(dt, toL(P), { inShop: inR, busy: !!busy, near: 0, talking: false, clear: endClear > 0 ? [0, -4.4, 2.6] : null }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading }),
    spawn: { woodshop: [OX, LZ + 7.6, Math.PI, LY] }, finish: () => finishGame(), scene: sceneCrates, keeper, appr,
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    dispose() { card.remove(); PANEL.remove(); ARW.remove(); K.dispose(); } };
  window.__wood = API; return API;
}
