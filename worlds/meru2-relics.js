// MERU 2.0 — s142 RELIC TRADE [meruRelicGarden / Lakeside / Spire / Deco] (cluster plan step 5): the 4 relic stores BUY + SELL 6 trade relics at their own
// PRICE OF THE DAY (seeded by meru2Day + store + relic). Buy low in one cluster, sell high in another. Each store: a PRICE BOARD on the left wall, the dealer's
// trade counter (TRADE · TODAY'S PRICES), and one job: APPRAISE (real or fake) from YES, PUT ME TO WORK! / NOW HIRING. Prizes: DEALER'S LOUPE (1st appraisal clear,
// item relicLoupe: +10% when you sell) · relic DEALER'S SEAL (3 stars + 500 G of trade profit). Trade relics are items tr_*. Stats prefix rtd.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildRelicTrade({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, clusters, renderer, go, groundH = () => 0 }) {
  const KEYS = ['relicGarden', 'relicLakeside', 'relicSpire', 'relicDeco'], NAMES = ['GARDEN ISLAND', 'LAKESIDE', 'SPIRE', 'DECO'];
  const F = KEYS.map(k => clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === k)); if (F.some(r => !r)) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, RH = 5.6;
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
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', CREAM = '#e7e4dc', STEEL = '#9aa0a6', BLACK = '#26292d', BLUE = '#2e86b8', GRN = '#2f7d5a', NAVY = '#334155', GOLD = '#d7ad52', OAK = '#a77b4f', PINE = '#c9a27a', DKW = '#3d2a1c', WAL = '#7a5236', ACC = DKW;
  const FG = F.map((R, i) => { const g = new THREE.Group(); g.name = 'relicTrade' + i; g.position.set(R.ox, LY, LZ); scene.add(g); g.visible = false; return g; });
  const toW = (x, y, z, fi) => V(F[fi].ox + x, LY + y, LZ + z), toF = (P, fi) => ({ x: P.x - F[fi].ox, y: (P.y || 0) - LY, z: P.z - LZ });
  const inFloor = (P, fi) => !!P && Math.abs(P.x - F[fi].ox) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8, floorOf = P => [0, 1, 2, 3].find(i => inFloor(P, i)) ?? -1;
  const today = () => save.stat('meru2Day', 1);
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n), pick1 = a => a[Math.floor(Math.random() * a.length)];
  // ================= the 6 trade relics + the price of the day =================
  const TR = [{ id: 'tr_coin', name: 'OLD MERU COIN', base: 40, col: GOLD, mark: 'M' }, { id: 'tr_fox', name: 'CLAY FOX', base: 60, col: '#c97a3a', mark: 'F' }, { id: 'tr_bell', name: 'BRONZE BELL', base: 90, col: '#b0793a', mark: 'B' },
    { id: 'tr_jade', name: 'JADE CHARM', base: 120, col: GRN, mark: 'J' }, { id: 'tr_map', name: 'STAR MAP', base: 160, col: '#2e4a6b', mark: 'S' }, { id: 'tr_shard', name: 'GATE SHARD', base: 220, col: '#7c4dc4', mark: '8' }];
  const BIAS = [1.18, 1.0, 1.05, 0.86], SWING = [0.35, 0.6, 0.25, 0.4], MAXH = 5;   // island pays most · lakeside swings with the tide · spire steady · deco cheap
  const hash = (a, b, c) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const midP = (si, ti, d = today()) => TR[ti].base * BIAS[si] * (1 - SWING[si] / 2 + SWING[si] * hash(d, si + 1, ti + 7));
  const r5 = v => Math.max(5, Math.round(v / 5) * 5), buyP = (si, ti) => r5(midP(si, ti) * 1.08), sellP = (si, ti) => r5(midP(si, ti) * 0.92 * (save.count('relicLoupe') ? 1.1 : 1));
  const seen = () => save.stat('rtdSeen', null) || {};
  const markSeen = si => { const s = { ...seen() }; s[si] = { d: today(), p: TR.map((_, ti) => sellP(si, ti)) }; save.setStat('rtdSeen', s); };
  const glyph = (t, s = 34) => { const c = t.col, k = t.id; const sh = k === 'tr_coin' ? '<circle cx="20" cy="20" r="14" fill="' + c + '" stroke="#201e1d" stroke-width="3"/><text x="20" y="26" font-size="16" font-weight="900" text-anchor="middle" fill="#201e1d">8</text>'
      : k === 'tr_fox' ? '<path d="M8 34 L10 8 L18 16 L22 16 L30 8 L32 34 Z" fill="' + c + '" stroke="#201e1d" stroke-width="3"/>'
      : k === 'tr_bell' ? '<path d="M10 30 Q10 10 20 8 Q30 10 30 30 Z" fill="' + c + '" stroke="#201e1d" stroke-width="3"/><rect x="6" y="30" width="28" height="4" fill="#201e1d"/>'
      : k === 'tr_jade' ? '<path d="M20 5 L33 20 L20 35 L7 20 Z" fill="' + c + '" stroke="#201e1d" stroke-width="3"/>'
      : k === 'tr_map' ? '<rect x="6" y="8" width="28" height="24" fill="' + c + '" stroke="#201e1d" stroke-width="3"/><circle cx="14" cy="16" r="2" fill="#ffd23a"/><circle cx="25" cy="22" r="2" fill="#ffd23a"/><circle cx="18" cy="26" r="2" fill="#ffd23a"/>'
      : '<path d="M14 4 L30 12 L26 36 L10 28 Z" fill="' + c + '" stroke="#201e1d" stroke-width="3"/>';
    return '<svg viewBox="0 0 40 40" style="width:' + s + 'px;height:' + s + 'px;flex:none" aria-hidden="true" font-family="Archivo, sans-serif">' + sh + '</svg>'; };
  // ================= per store: the PRICE BOARD (left wall), a trade counter mat by the desk =================
  const LOOKS = [['#2e4a6b', '#e7e4dc', '#16263c'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#5d6f82', '#e7e4dc', '#334155'], ['#4f7d3a', '#e2d2b4', '#2a3d20']];
  const boards = F.map((R, si) => { const t = CT(512, 400, () => {}); const m = planeT(t, 2.8, 2.2, -9.83, 2.8, -3.2, Math.PI / 2, FG[si]); const S = mk(); S.box(0.06, 2.4, 3.0, INK, -9.88, 2.8, -3.2); S.box(0.5, 0.9, 0.5, WAL, -3.0, 0.45, -4.4); S.box(0.56, 0.05, 0.56, PAPER, -3.0, 0.92, -4.4); S.box(0.2, 0.12, 0.14, STEEL, -3.0, 1.0, -4.4); S.cyl(0.05, 0.05, 0.06, BLUE, -3.0, 1.1, -4.4, 10, Math.PI / 2); S.mesh(FG[si]);
    cols.push({ f: [R.ox - 3.3, R.ox - 2.7, LZ - 4.7, LZ - 4.1], y0: LY - 3, y1: LY + 12 }); planeT(plate('APPRAISE \u00b7 REAL OR FAKE', 512, 96, INK, PAPER, GOLD), 1.5, 0.28, -3.0, 1.6, -4.13, 0, FG[si]); return { t, d: -1 }; });
  const drawBoard = si => { const B = boards[si], d = today(); if (B.d === d) return; B.d = d; const g = B.t.userData.c.getContext('2d'), W = 512, H = 400; g.fillStyle = PAPER; g.fillRect(0, 0, W, H); g.fillStyle = DKW; g.fillRect(0, 0, W, 64); g.fillStyle = '#ffffff'; g.font = '900 30px Archivo, sans-serif'; g.fillText(NAMES[si] + ' \u00b7 DAY ' + d, 18, 44);
    g.fillStyle = INK; g.font = '900 18px Archivo, sans-serif'; g.fillText('WE SELL', 300, 92); g.fillText('WE BUY', 410, 92);
    TR.forEach((t, ti) => { const y = 124 + ti * 46; g.fillStyle = INK; g.fillRect(0, y - 26, W, 2); g.fillStyle = t.col; g.fillRect(18, y - 16, 20, 20); g.fillStyle = INK; g.font = '900 22px Archivo, sans-serif'; g.fillText(t.name, 50, y); g.fillText(buyP(si, ti) + ' G', 300, y); g.fillStyle = GRN; g.fillText(sellP(si, ti) + ' G', 410, y); });
    B.t.needsUpdate = true; };
  const appraisers = [];
  const K = F.map((R, si) => shopKit({ THREE, G: FG[si], scene, kit, save, camera, touch, hour, isMuted, prefix: 'rtd', color: DKW, boardTitle: NAMES[si] + ' relics', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], keeper: R.keeper || null, keeperRy: 0, games: [{ k: 'appraise', name: 'Appraise', color: GOLD }], toWorld: v => v.add(FG[si].position),
    board: { x: -3.4, y: 2.5, z: 9.83, ry: Math.PI, w: 1.4 }, hiring: { x: 2.8, z: 8.2, ry: 0 }, hiringLine: 'APPRAISE \u00b7 REAL OR FAKE', sun: [{ x: 0, z: 7.4, w: 2.4, d: 2.0 }, { x: -3, z: 4.4, w: 2.4, d: 1.6 }],
    lamps: [[0, 4.4, -6], [0, 4.4, 0], [0, 4.4, 5]], lampsOn: () => { const h = hour(); return h >= 19 || h < 7; }, browse: [[-6.6, 1.2, Math.PI / 2], [6.6, 1.2, -Math.PI / 2]], looks: [LOOKS[si]], clock: { x: 3.6, y: 3.4, z: 9.83, ry: Math.PI } }));
  const RING = [-3.0, -3.0];
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), rings = FG.map(G => { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(RING[0], 0.03, RING[1]); G.add(m); return m; });
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
  const nOf = () => Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, goldR = () => (J.gold ? J.gold + ' G' : 'RELICS');
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
  const T_K = si => ({ key: KEYS[si], name: 'Relic Dealer', role: NAMES[si] + ' RELICS', obj: F[si].keeper || FG[si], r: 6 }), kLn = si => ln('Relic Dealer', NAMES[si] + ' RELICS');
  // ---------- APPRAISE: is the maker's mark on the piece the same as the reference card? ----------
  const APN = 8, APT = 9;
  const markOf = t => ({ letter: t.mark, dots: 3 + (t.base % 4), col: t.col, ring: t.base > 100 });
  const fakeMark = m => { const k = pick1(['letter', 'dots', 'col', 'ring']), f = { ...m }; if (k === 'letter') f.letter = pick1(['W', 'N', 'E', 'R', '3', 'P'].filter(x => x !== m.letter)); else if (k === 'dots') f.dots = m.dots + pick1([-1, 1]); else if (k === 'col') f.col = pick1([RED, BLUE, YEL, '#9aa0a6'].filter(c => c !== m.col)); else f.ring = !m.ring; return [f, { letter: 'WRONG LETTER', dots: 'WRONG NUMBER OF DOTS', col: 'WRONG COLOUR', ring: 'THE RING IS WRONG' }[k]]; };
  const drawMark = (g, w, h, m) => { g.fillStyle = '#e9e1cf'; g.fillRect(0, 0, w, h); const r = Math.min(w, h) * 0.36, cx = w / 2, cy = h * 0.46; g.fillStyle = m.col; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    if (m.ring) { g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r * 0.78, 0, 7); g.stroke(); } g.fillStyle = INK; g.font = '900 ' + Math.round(r * 0.9) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(m.letter, cx, cy + 2);
    for (let i = 0; i < m.dots; i++) { const x = cx + (i - (m.dots - 1) / 2) * r * 0.32; g.beginPath(); g.arc(x, cy + r + h * 0.07, Math.max(3, r * 0.08), 0, 7); g.fill(); } g.textAlign = 'left'; g.textBaseline = 'alphabetic'; };
  GD.appraise = { panel: true, shot: () => [toW(-3.0, 1.0, -4.4, J.fi), 1.8, 1.4, 0.5, 1.8, 0, 5],
    begin() { goRoom(RING[0], RING[1], Math.PI, J.fi); J.list = [...Array(APN)].map(() => { const t = pick1(TR), m = markOf(t), fake = Math.random() < 0.5, [fm, why] = fakeMark(m); return { t, m, shown: fake ? fm : m, fake, why }; }); J.ci = 0; J.cueT = APT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('APPRAISE', goldR()) + body(doneMsg('EVERY PIECE CHECKED')) + tipBar('THE DEALER NODS. ONCE.')); return; }
      const cvs = (k, lab) => '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;font-weight:900;color:' + (k === 'r' ? '#ec3013' : '#201e1d') + '">' + lab + '</span><canvas data-mk="' + k + '" style="width:100%;aspect-ratio:1/1;display:block;max-height:' + (wide() ? 150 : 220) + 'px;object-fit:contain"></canvas></div>';
      showPanel(panelHead('APPRAISE \u00b7 ' + c.t.name + ' \u00b7 ' + nOf(), goldR()) + body('<div style="display:flex;gap:8px;flex:none">' + cvs('r', 'REFERENCE CARD \u00b7 THE REAL MARK') + cvs('p', 'THE PIECE ON THE COUNTER') + '</div>' + timeRow + '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px;flex:none"><button data-a="real" style="' + BTN + ';font-size:20px">REAL</button><button data-a="fake" style="' + BTN + ';font-size:20px;background:#ec3013;color:#fff">FAKE</button></div>') + tipBar('CHECK THE LETTER, THE DOTS, THE COLOUR AND THE RING'));
      for (const cv of PANEL.querySelectorAll('[data-mk]')) { const f = fitCv(cv); if (f) drawMark(f.g, f.w, f.h, cv.dataset.mk === 'r' ? c.m : c.shown); }
      PANEL.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => this.tap(b.dataset.a === 'fake', b); }); J.idle = 0; J.hinted = false; },
    tap(saysFake, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0;
      if (saysFake !== c.fake) { missOne(c.fake ? 'IT WAS A FAKE \u00b7 ' + c.why : 'IT WAS REAL \u00b7 EVERY MARK MATCHED'); shake(el); } else { addGold(3); goodBtn(el); ding(); okTip(c.fake ? 'FAKE \u00b7 ' + c.why : 'REAL \u00b7 WELL SPOTTED'); }
      J.wait = 0.9; setTimeout(() => this.next(), 800); },
    next() { if (!J || J.g !== 'appraise') return; roundNext(this, 'appraise', APT); },
    tick(dt) { roundTick(this, dt, APT, 'TOO SLOW \u00b7 THE SELLER WALKED OUT', () => '[data-a="' + (J.list[J.ci].fake ? 'fake' : 'real') + '"]'); } };
  // ================= TRADE (the dealer's counter) =================
  let TS = -1;
  const owned = () => TR.reduce((a, t) => a + save.count(t.id), 0);
  function tipFor(si) { const d = today(), ti = Math.floor(hash(d, 99 + si, 3) * TR.length), best = [0, 1, 2, 3].filter(i => i !== si).sort((a, b) => sellP(b, ti) - sellP(a, ti))[0]; return { ti, best }; }
  function openTrade(si) { busy = 'trade'; TS = si; markSeen(si); drawTrade(); }
  function drawTrade(msg) { const si = TS, gold = save.addGold(0), s = seen(), d = today(), W2 = wide(), tp = tipFor(si);
    const bestSeen = ti => { let b = null; for (const k in s) { if (+k === si || !s[k] || s[k].d !== d) continue; const v = s[k].p[ti]; if (!b || v > b.v) b = { v, at: NAMES[k] }; } return b; };
    const rows = TR.map((t, ti) => { const n = save.count(t.id), bp = buyP(si, ti), sp = sellP(si, ti), bs = bestSeen(ti);
      return '<div style="display:grid;grid-template-columns:' + (W2 ? 'minmax(0,2.2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,0.8fr) 80px 80px' : 'minmax(0,1fr) 72px 72px') + ';gap:6px;align-items:center;border-bottom:2px solid #201e1d;padding:4px 0">'
        + '<div style="display:flex;gap:8px;align-items:center;min-width:0">' + glyph(t, W2 ? 30 : 34) + '<div style="min-width:0;line-height:1.2"><div style="font-weight:900;font-size:14px">' + t.name + '</div><div style="font-size:11px;font-weight:800">YOU HAVE ' + n + (W2 ? '' : ' \u00b7 BUY ' + bp + ' \u00b7 SELL ' + sp) + (bs ? ' \u00b7 SEEN ' + bs.v + ' AT ' + bs.at : '') + '</div></div></div>'
        + (W2 ? '<div style="font-weight:900">' + bp + ' G</div><div style="font-weight:900;color:#2f7d5a">' + sp + ' G</div><div style="font-weight:900">' + n + ' / ' + MAXH + '</div>' : '')
        + '<button data-b="' + ti + '" style="' + BTN + ';min-height:48px;font-size:13px' + (n >= MAXH ? ';opacity:.45" disabled' : '"') + '>BUY' + (W2 ? '' : '<br>' + bp) + '</button><button data-s="' + ti + '" style="' + BTN + ';min-height:48px;font-size:13px;background:#201e1d;color:#ffd23a' + (n ? '"' : ';opacity:.45" disabled') + '>SELL' + (W2 ? '' : '<br>' + sp) + '</button></div>'; }).join('');
    const hd = W2 ? '<div style="display:grid;grid-template-columns:minmax(0,2.2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,0.8fr) 80px 80px;gap:6px;font-size:11px;font-weight:900;color:#ec3013;flex:none"><span>RELIC</span><span>WE SELL</span><span>WE BUY</span><span>YOURS</span><span></span><span></span></div>' : '';
    showPanel(panelHead('RELIC TRADE \u00b7 ' + NAMES[si] + ' \u00b7 DAY ' + d, (gold != null ? gold + ' G' : '')) + body('<div style="background:#201e1d;color:#f3f2f2;padding:8px 10px;font-weight:900;font-size:13px;line-height:1.3;flex:none"><span style="color:#ffd23a">DEALER \u00b7 </span>' + (msg || 'Word is, ' + NAMES[tp.best] + ' pays well for the ' + TR[tp.ti].name + ' today.') + '</div>' + hd + rows) + tipBar('BUY LOW HERE \u00b7 SELL HIGH IN ANOTHER CLUSTER \u00b7 PRICES CHANGE EVERY DAY'), () => closeTrade());
    PANEL.querySelectorAll('[data-b]').forEach(b => { b.onclick = () => buy(+b.dataset.b, b); }); PANEL.querySelectorAll('[data-s]').forEach(b => { b.onclick = () => sell(+b.dataset.s, b); });
    const st = PANEL.querySelector('[data-stop]'); if (st) st.textContent = 'DONE'; }
  function buy(ti, el) { const si = TS, p = buyP(si, ti), t = TR[ti]; if (save.count(t.id) >= MAXH) { shake(el); return; } if (!save.spend(p)) { nope(); shake(el); drawTrade('Not enough gold. Sell something first.'); return; }
    save.give(t.id); save.setStat('rtdSpent', save.stat('rtdSpent', 0) + p); save.setStat('rtdTrades', save.stat('rtdTrades', 0) + 1); coin(); drawTrade('One ' + t.name + ', ' + p + ' G. Mind the corners.'); }
  function sell(ti, el) { const si = TS, p = sellP(si, ti), t = TR[ti]; if (!save.take(t.id)) { shake(el); return; } save.addGold(p); save.setStat('rtdEarned', save.stat('rtdEarned', 0) + p); save.setStat('rtdTrades', save.stat('rtdTrades', 0) + 1); coin();
    const profit = save.stat('rtdEarned', 0) - save.stat('rtdSpent', 0); save.setStat('rtdBest', Math.max(save.stat('rtdBest', 0), profit)); drawTrade(p + ' G for the ' + t.name + '. A pleasure.'); sealCheck(si); }
  function closeTrade() { hidePanel(); if (busy === 'trade') busy = null; TS = -1; }
  // ================= prizes =================
  function sealCheck(si) { if (save.stat('rtdSeal', false) || K[0].stars('appraise') < 3 || save.stat('rtdBest', 0) < 500) return false; save.setStat('rtdSeal', true); save.addRelic('dealerSeal'); ding(); closeTrade();
    sayTo(T_K(si), [kLn(si)('500 gold of profit and a perfect eye. Take the DEALER\u2019S SEAL. Every store will know you.')], () => toast('RELIC \u00b7 THE DEALER\u2019S SEAL', 2.6)); return true; }
  function useItem(id) { if (id === 'relicLoupe' && save.count('relicLoupe')) { toast('DEALER\u2019S LOUPE \u00b7 +10% WHEN YOU SELL A RELIC', 2.4); return true; } const t = TR.find(q => q.id === id); if (t && save.count(id)) { toast(t.name + ' \u00b7 SELL IT AT A RELIC STORE', 2.4); return true; } return false; }
  // ================= run the job =================
  let introT = 0; function startGame(g, si) { if (busy) return; busy = 'intro'; introT = 0; sayTo(T_K(si), [kLn(si)('Appraise for me. Compare each mark with the card. REAL or FAKE. Eight pieces.')], () => begin(g, si)); }
  function begin(g, si) { if (busy !== 'intro') return; save.setStat('rtdVisits', save.stat('rtdVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], t: 0, fi: si }; busy = 'job'; ding(); fade(() => GD[g].begin()); }
  let endFi = 0;
  function finishGame() { if (!J || busy !== 'job') return; const g = J.g, fi = J.fi, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K[0].stars(g), gold = J.gold; J.off && J.off(); J.off = null;
    save.setStat('rtdClears', save.stat('rtdClears', 0) + 1); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none'; let gift = false; if (!save.stat('rtdLoupe', false)) { save.setStat('rtdLoupe', true); save.give('relicLoupe'); gift = true; }
    const say = () => { const L1 = [kLn(fi)((stars === 3 ? 'Not one fooled you. Three stars.' : 'Not bad. The fakes are getting better, mind.'))]; if (gift) L1.push(kLn(fi)('Take my old DEALER\u2019S LOUPE. Ten per cent more when you sell. Any store.')); K[fi].finish(g, stars, gold, first); for (const k of K) k.redraw();
      sayTo(T_K(fi), L1, () => { if (busy === 'end') { busy = null; J = null; } sealCheck(fi); }); };
    fade(() => { cleanup(); goRoom(0, -4.4, Math.PI, fi); endFi = fi; snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 40000); }
  function cleanup() { if (J) { J.off && J.off(); J.off = null; } hidePanel(); hideCard(); ARW.style.display = 'none'; }
  function stop() { cleanup(); busy = null; J = null; }
  function quit() { if (busy === 'trade') { closeTrade(); return; } if (busy === 'intro') { busy = null; return; } if (!J || busy === 'end') return; stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
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
  const nearL = (p, x, z, r) => Math.hypot(p.x - x, p.z - z) < r, nearK = p => nearL(p, 0, -5, 2.4), atRing = p => nearL(p, RING[0], RING[1], 1.05), atBoard = p => p.x < -7.6 && Math.abs(p.z + 3.2) < 1.8;
  function prompt(P) { if (busy) return null; const si = floorOf(P); if (si < 0) return null; const p = toF(P, si); if (atRing(p)) return (K[0].stars('appraise') ? '\u2713 ' : '') + 'START \u00b7 APPRAISE';
    if (K[si].atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearK(p)) return 'TALK \u00b7 RELIC DEALER \u00b7 TRADE'; if (atBoard(p)) return 'PRICE BOARD \u00b7 DAY ' + today(); return null; }
  const HI = [['Garden Island Relics. The island pays best. Usually.', 'Back already? Island prices are up. They are always up.'], ['Lakeside Relics. Prices move with the tide. Mind the puddle.', 'Back? The tide turned. So did my prices.'],
    ['Spire Relics. Scanned and steady. My prices hardly move.', 'Back again? The tower lights say: fair prices today.'], ['Deco Relics. Cheap today. Cheap most days. No questions.', 'Back again? Deco prices are low. Buy here, sell elsewhere.']];
  const talkN = [0, 0, 0, 0];
  function kMenu(si) { const T = T_K(si), lnF = kLn(si), n = talkN[si]++;
    sayTo(T, [{ ...lnF(HI[si][Math.min(n, 1)]), choices: [{ text: CHOICE_WORK, pick: () => startGame('appraise', si) }, { text: 'TRADE \u00b7 TODAY\u2019S PRICES', pick: () => openTrade(si) },
      { text: 'HOW DO RELICS WORK?', pick: () => sayTo(T, [lnF('Each store sets its own price, new every day. Buy low here, sell high elsewhere.')]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'trade') return true; if (busy) return false; const si = floorOf(P); if (si < 0) return false; const p = toF(P, si);
    if (atRing(p)) { startGame('appraise', si); return true; } if (K[si].atHiring(p)) { ding(); startGame('appraise', si); return true; }
    if (nearK(p)) { tone(1320, 0.05, 0.5); kMenu(si); return true; } if (atBoard(p)) { drawBoard(si); toast('PRICES CHANGE EVERY DAY \u00b7 T = +1 HOUR', 2.4); return true; } return false; }
  // ================= per frame =================
  const SPN = /[?&]spawn=relic([1-4])(&|$)/.exec(location.search); let spawned = !SPN, spawnT = 0, dayCheck = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt;
    if (!spawned && P && (spawnT += dt) > 0.8) { spawned = true; goRoom(0, 7.6, Math.PI, +SPN[1] - 1); }
    const si = floorOf(P); FG.forEach((g, i) => { g.visible = si === i || (busy === 'job' && !!J && J.fi === i); });
    if ((dayCheck -= dt) <= 0) { dayCheck = 1; if (si >= 0) drawBoard(si); }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if (busy === 'trade' && (si !== TS || PANEL.style.display === 'none')) closeTrade();
    if (busy === 'job' && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('relic job: ' + (e && e.stack || e)); stop(); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && !fading && J.list && J.ci < J.list.length) GD[J.g].draw();
    for (const m of rings) { m.visible = !busy; if (!busy) m.scale.setScalar(1 + 0.06 * Math.sin(t * 3)); }
    for (let i = 0; i < 4; i++) K[i].tick(dt, P ? toF(P, i) : { x: 99, z: 99 }, { inShop: si === i, busy: !!busy, near: 0, talking: false, clear: endClear > 0 && endFi === i ? [0, -4.4, 2.6] : null }); }
  const API = { groups: FG, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' || busy === 'trade' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, TR, stores: F, price: (si, ti) => ({ buy: buyP(si, ti), sell: sellP(si, ti) }), trade: openTrade, close: closeTrade,
    start: si => startGame('appraise', si), _begin: (si = 0) => { busy = 'intro'; begin('appraise', si); }, _state: () => ({ busy, g: J && J.g, fading, TS }), finish: () => finishGame(), to: si => fade(() => goRoom(0, 7.6, Math.PI, si)),
    spawn: Object.fromEntries(F.map((R, i) => ['relic' + (i + 1), [R.ox, LZ + 7.6, Math.PI, LY]])),
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); }, dispose() { card.remove(); PANEL.remove(); ARW.remove(); K.forEach(k => k.dispose()); } };
  window.__relics = API; return API;
}
