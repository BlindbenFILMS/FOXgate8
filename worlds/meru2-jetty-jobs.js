// MERU 2.0 — s92 BOAT HOUSE DELUXE PART B: THE FISHERMAN's JETTY JOBS (Speedboat Bay jetty [meruSpeedboatBay] + the Lake [meruLake] shore).
// Built + ticked by worlds/meru2-boat-jobs.js (its API delegates here, so meru2-walk.js needs no new wiring). THE FISHERMAN (2D boat hire +
// his 2D lines) stands by his BOAT HIRE hut east of the boathouse (96, 232): NOW HIRING, his BEST board, a door bell. 7 JOBS (yellow rings):
// FIX THE ENGINE (turn the nut off, swap the bent prop for the match, tighten, yank the cord) · SET THE BUOY LINE (throw 5 buoys, aim upwind) ·
// WINCH UP THE BOAT (hold to wind, let go on the waves) · BAIL THE LEAKY BOAT (plug the leaks, scoop the water) · RESCUE A SWIMMER (throw the
// ring, hold to pull in) · UNTANGLE THE NETS (at the Fisherwoman's spot: tug the knots, sort the catch) · PILOT INTO THE SLIP (steer a dinghy
// into the lit slip). Plus the SHORE PATH (planks + lanterns) from Reel's jetty to the hut, and the Fisherwoman talks (her 2D lines).
import { applyD, endPose, swimD } from '../engine/fox-poses.js?v=s648k';   // s621 jointed swimmers
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { PLAYER_FEMALE } from '../fox-kit.js';
const CUST = [{ name: 'KIA', torso: ['#38bdf8', '#e0f2fe', '#0369a1'] }, { name: 'OTTO', torso: ['#7a8a3a', '#e8e2c8', '#4a5420'] }, { name: 'FLICK', torso: ['#ffd23a', '#201e1d', '#a16207'] },
  { name: 'MARLA', torso: ['#f472b6', '#fce7f3', '#9d174d'], f: 1 }, { name: 'MICHAEL JAY', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'] }, { name: 'PELL', torso: ['#1f2937', '#e6b45a', '#111827'] }];
export function buildJettyJobs({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted, ground, onFinish, prizeLine, freeRent }) {   // s93: onFinish / prizeLine / freeRent = part C prizes (worlds/meru2-boat-prize.js)
  const mutedQ = () => { try { return !!(isMuted && isMuted()); } catch (e) { return true; } };
  const gAt = (x, z, y = 0) => { try { const h = ground ? ground(x, z, y) : 0; return Number.isFinite(h) ? h : 0; } catch (e) { return 0; } };
  const G = new THREE.Group(); G.name = 'jettyJobs'; scene.add(G); const GE = new THREE.Group(), GW = new THREE.Group(), GP = new THREE.Group(); G.add(GE, GW, GP);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), PI = Math.PI;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const plane = (par, w, h, tex, x, y, z, ry = 0, extra = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, ...extra })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const ringC = (x, z, r) => cols.push({ c: [x, z, r] }), boxC = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', NAVY = '#2e4a6b', ORANGE = '#f97316', WOOD = '#9a7550', WOODD = '#6e5236', STEEL = '#8a8f96', BROWN = '#7a5c38', WATER = '#3f86c4';
  const DECK = 0.9, FISH = [96, 232], FW = [-20, 236];
  const label = (txt, w, h, bg = INK, fg = '#ffffff', bar = RED) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); if (bar) { g.fillStyle = bar; g.fillRect(0, 0, 10, H); } g.fillStyle = fg; g.font = '900 ' + Math.round(H * 0.5) + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, bar ? 22 : 12, H / 2 + 2); });
  // ---------- sites: groups lifted to the ground height on the first tick (the walk's ground() is not ready while the town builds) ----------
  const SITES = {}, site = (k, par, x, z, y) => { const g = new THREE.Group(); g.userData.at = [x, z, y]; par.add(g); SITES[k] = g; return g; };
  const eng = site('eng', GE, 91, 236.5), wch = site('winch', GE, 86, 238.2), nts = site('nets', GW, -15.6, 236.5), hut = site('hut', GE, 97, 232), fws = site('fw', GW, FW[0], FW[1], 2);
  const wv = (s, x, y, z) => V(x, s.position.y + y, z);
  // ================= THE FISHERMAN + his BOAT HIRE hut =================
  const fisher = kit.makeFox({ key: 'fisherman', torso: ['#d4b896', '#b8956a', '#7a5c38'], crest: '8', outfit: 'vest', mood: 'warm' }), FRY = -PI / 2;
  fisher.position.set(FISH[0], 0, FISH[1]); fisher.rotation.y = FRY; hut.add(fisher); ringC(FISH[0], FISH[1], 0.45);
  { const P0 = fisher.userData && fisher.userData.P; if (P0 && P0.head) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.27, 0.14, 14), LM('#8a7a4a')); h.position.set(0, 0.3, 0); P0.head.add(h); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 14), LM(BROWN)); b.position.set(0, 0.25, 0); P0.head.add(b); } }
  const kT = { key: 'bjFisher', name: 'The Fisherman', role: 'BOAT HIRE', obj: fisher, ry: FRY, r: 6 }, ln = text => ({ who: 'fisherman', role: 'BOAT HIRE', text }), me = text => ({ who: 'player', text });
  { box(hut, 3.0, 0.12, 5.0, WOODD, 98.6, 0.06, 232); box(hut, 0.12, 2.9, 5.0, WOOD, 99.95, 1.45, 232); for (const z of [229.56, 234.44]) box(hut, 2.8, 2.9, 0.12, WOOD, 98.6, 1.45, z);
    box(hut, 3.5, 0.1, 5.5, RED, 98.6, 3.0, 232).rotation.z = 0.12; box(hut, 0.5, 1.0, 3.2, WOODD, 97.5, 0.5, 232); box(hut, 0.56, 0.06, 3.3, WOOD, 97.5, 1.03, 232);
    plane(hut, 2.6, 0.36, label('BOAT HIRE \u00b7 JETTY JOBS', 512, 72), 97.23, 0.66, 232, -PI / 2); plane(hut, 3.0, 0.42, label('THE FISHERMAN', 512, 72, WHITE, INK, RED), 97.08, 2.62, 232, -PI / 2);
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 6, 14), LM('#c9b48a')); coil.rotation.x = PI / 2; coil.position.set(97.5, 1.09, 231.0); hut.add(coil);
    for (const [z, r] of [[233.6, 0.18], [233.9, 0.26]]) { const o = box(hut, 0.07, 2.1, 0.07, WOOD, 99.6, 1.05, z); o.rotation.x = r; box(hut, 0.03, 0.5, 0.18, WOOD, 99.6, 0.25, z - 0.08 - r); }
    boxC(97.2, 100.1, 229.4, 234.6); }
  // ================= THE FISHERWOMAN (her 2D lines) =================
  const fw = kit.makeFox({ key: 'fisherwoman', torso: ['#99d6c8', '#5fa89a', '#2d6b60'], crest: '8', outfit: 'vest', mood: 'happy', look: PLAYER_FEMALE }), FWRY = PI / 2 + 0.5;
  fw.position.set(FW[0], 0, FW[1]); fw.rotation.y = FWRY; fws.add(fw); ringC(FW[0], FW[1], 0.45);
  const wT = { key: 'bjFisherwoman', name: 'Fisherwoman', role: 'THE LAKE', obj: fw, ry: FWRY, r: 6 }, lnW = text => ({ who: 'fisherwoman', role: 'THE LAKE', text });
  const FW_STORY = [lnW('You just missed it!'), me('What did I miss?'), lnW('PRINCE MAX was diving for HULL PEARLS.'), lnW('He woke the sea monster. NELLY!'), me('He is okay? What\u2019s up with the pearls and the sea monster?'), lnW('Prince Max fled fast.'), lnW('Said he was off to the TAVERN. Calm his nerves.')];
  // ================= JOB GEOMETRY (persistent) =================
  // ---- engine stand (shore, west of the hut) ----
  const MX = 91, MZ = 237.2, CRX = 92.6, BINX = 89.5, HUB = V(0, 0.32, -0.22);
  for (const sx of [-0.55, 0.55]) box(eng, 0.08, 0.95, 0.5, WOOD, MX + sx, 0.47, MZ); box(eng, 1.3, 0.1, 0.12, WOOD, MX, 0.95, MZ);
  const MOT = new THREE.Group(); MOT.position.set(MX, 0, MZ); eng.add(MOT);
  box(MOT, 0.44, 0.42, 0.56, RED, 0, 1.36, 0.04); box(MOT, 0.46, 0.06, 0.58, INK, 0, 1.16, 0.04); box(MOT, 0.12, 0.78, 0.15, INK, 0, 0.76, 0.02); box(MOT, 0.2, 0.16, 0.2, '#5a5654', 0, 1.02, 0);
  cyl(MOT, 0.07, 0.05, 0.42, INK, 0, 0.32, 0.02).rotation.x = PI / 2; box(MOT, 0.03, 0.22, 0.2, INK, 0, 0.2, 0.08);
  const HANDLE = box(MOT, 0.16, 0.04, 0.04, YEL, 0, 1.5, -0.27), CORD = box(MOT, 0.012, 0.01, 0.012, INK, 0, 1.5, -0.27);
  const bladeG = new THREE.BoxGeometry(0.06, 0.2, 0.014); bladeG.translate(0, 0.11, 0);
  const mkProp = (n, c, bent) => { const g = new THREE.Group(); cyl(g, 0.045, 0.045, 0.08, INK, 0, 0, 0, 8).rotation.x = PI / 2; for (let i = 0; i < n; i++) { const b = new THREE.Mesh(bladeG, LM(c)); b.rotation.z = i / n * PI * 2; b.rotation.y = 0.45; if (bent && i === 0) { b.rotation.x = 0.8; b.scale.y = 0.75; } g.add(b); } return g; };
  const PROP0 = mkProp(3, '#c9cdd2'); PROP0.position.copy(HUB); MOT.add(PROP0);
  box(eng, 0.86, 0.36, 0.46, WOOD, CRX, 0.18, MZ - 0.2); plane(eng, 0.8, 0.16, label('NEW PROPS', 256, 52, YEL, INK, null), CRX, 0.22, MZ - 0.44, PI);
  cyl(eng, 0.26, 0.22, 0.62, '#5a5654', BINX, 0.31, MZ - 0.2, 14); plane(eng, 0.42, 0.14, label('SCRAP', 160, 52, INK, '#ffffff', null), BINX, 0.42, MZ - 0.47, PI);
  ringC(MX, MZ, 0.7); ringC(CRX, MZ - 0.2, 0.45); ringC(BINX, MZ - 0.2, 0.3);
  // ---- winch + launch ramp (shore, east of the jetty); the ramp itself is laid on the first tick ----
  const WX = 86, RZ0 = 239, RZ1 = 257, RY1 = -0.7, WZTOP = 243, WZLOW = 254.5; let RY0 = 0;
  let RP = null; const rampY = z => { const k = (clamp(z, RZ0, RZ1) - RZ0) / (RZ1 - RZ0); if (!RP) return RY0 + k * (RY1 - RY0); const f = k * (RP.length - 1), i = Math.min(RP.length - 2, Math.floor(f)); return RP[i] + (RP[i + 1] - RP[i]) * (f - i); };   // RP: the laid ramp profile (never under the sand)
  box(wch, 0.2, 0.9, 0.2, NAVY, WX, 0.45, 238.4); const drum = cyl(wch, 0.12, 0.12, 0.36, '#5a5654', WX, 0.8, 238.4); drum.rotation.z = PI / 2;
  const CRANK = new THREE.Group(); CRANK.position.set(WX + 0.22, 0.8, 238.4); wch.add(CRANK); box(CRANK, 0.03, 0.26, 0.03, INK, 0, 0.12, 0); box(CRANK, 0.12, 0.05, 0.05, RED, 0.06, 0.24, 0); ringC(WX, 238.4, 0.3);
  const ropeM = LM('#c9b48a'), ropeG = new THREE.CylinderGeometry(0.02, 0.02, 1, 5); ropeG.translate(0, 0.5, 0); ropeG.rotateX(PI / 2);
  const mkRope = par => { const m = new THREE.Mesh(ropeG, ropeM); par.add(m); return m; }, stretch = (m, a, b) => { m.position.copy(a); m.scale.set(1, 1, Math.max(0.01, a.distanceTo(b))); m.lookAt(b); };
  const mkDinghy = c => { const g = new THREE.Group(), W = 1.15, H = 0.42; box(g, W, 0.08, 2.2, '#a07a52', 0, 0.12, -0.1);
    for (const sx of [-1, 1]) { box(g, 0.08, H, 2.2, c, sx * W / 2, 0.3, -0.1); box(g, 0.09, 0.07, 2.2, RED, sx * W / 2, 0.44, -0.1); } box(g, W, H, 0.08, c, 0, 0.3, -1.2);
    const sh = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(0, 0.75)]), bg = new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: false }); bg.rotateX(PI / 2); const bw = new THREE.Mesh(bg, LM(c)); bw.position.set(0, 0.51, 1.0); g.add(bw);
    box(g, W - 0.1, 0.06, 0.32, '#a07a52', 0, 0.36, 0.15); box(g, W - 0.1, 0.06, 0.28, '#a07a52', 0, 0.36, -0.85); box(g, 0.24, 0.3, 0.26, INK, 0, 0.62, -1.36); box(g, 0.08, 0.5, 0.1, INK, 0, 0.25, -1.4); return g; };
  const WD = mkDinghy('#e8e2c8'); WD.rotation.y = PI; GE.add(WD); const wRope = mkRope(GE); let wdZ = WZLOW;
  const FOAM = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.5), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8, depthWrite: false })); FOAM.rotation.x = -PI / 2; FOAM.visible = false; GE.add(FOAM);
  // ---- the leaky rowboat (west side of the jetty) ----
  const RBX = 69.4, RBZ = 252.5, RB = mkDinghy(NAVY); RB.position.set(RBX, 0.02, RBZ); GE.add(RB);
  const RBW = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.02, 2.1), new THREE.MeshLambertMaterial({ color: WATER, transparent: true, opacity: 0.85 })); RBW.position.set(0, 0.2, -0.12); RB.add(RBW);
  stretch(mkRope(GE), V(70.1, 0.5, 253.6), V(72.0, DECK + 0.1, 254.2));
  // ---- buoy line markers + the kept line, the wind flag on the jetty end ----
  const BT = [[78, 276], [81.5, 279.5], [85, 283], [88.5, 286.5], [92, 290]];
  const buoyS = new THREE.SphereGeometry(0.28, 12, 8), buoyB = new THREE.CylinderGeometry(0.285, 0.285, 0.09, 12);
  const mkBuoy = c => { const g = new THREE.Group(), s = new THREE.Mesh(buoyS, LM(c)); s.position.y = 0.1; g.add(s); const b = new THREE.Mesh(buoyB, LM(WHITE)); b.position.y = 0.12; g.add(b); box(g, 0.03, 0.5, 0.03, INK, 0, 0.55, 0); box(g, 0.02, 0.12, 0.18, c, 0, 0.72, 0.09); return g; };
  const KEEPB = BT.map(([x, z], i) => { const b = mkBuoy(i % 2 ? WHITE : RED); b.position.set(x, 0, z); b.visible = false; GE.add(b); return b; });
  const FLAG = new THREE.Group(); FLAG.position.set(77.55, DECK, 267.5); GE.add(FLAG); box(FLAG, 0.05, 2.3, 0.05, INK, 0, 1.15, 0);
  const FLAGP = plane(FLAG, 0.8, 0.42, label('WIND', 160, 84, RED, '#ffffff', null), 0.42, 2.05, 0); let flagW = [-1.5, 0];
  // ---- the three SLIPS on the jetty end (south face z 268) + the pilot dinghy ----
  const SC = [64.2, 68.6, 73.0], SZF = 268.0, POSTS = [];
  const postTop = [];
  SC.forEach((c, i) => { for (const sx of [-1.45, 1.45]) { const x = c + sx, z = 270.4; cyl(GE, 0.14, 0.14, 2.0, WHITE, x, 0.4, z, 10); postTop.push(cyl(GE, 0.15, 0.15, 0.3, RED, x, 1.25, z, 10)); POSTS.push([x, z]); }
    plane(GE, 0.5, 0.5, CT(64, 64, (g, W) => { g.fillStyle = YEL; g.fillRect(0, 0, W, W); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, W - 6); g.fillStyle = INK; g.font = '900 44px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), 32, 35); }), c, DECK - 0.32, SZF + 0.04); });
  const PBD = mkDinghy(WHITE); GE.add(PBD); const PB_REST = [SC[1], SZF + 1.55, PI];
  // ---- the nets frame, tray, bins (the Fisherwoman's spot) ----
  const NZ = 238.6, TRZ = 236.0, BZ = 237.1, BINS = { keep: -17.25, junk: -15.6, back: -13.95 };
  for (const x of [-16.95, -14.25]) box(nts, 0.1, 2.7, 0.1, WOOD, x, 1.35, NZ); box(nts, 2.9, 0.1, 0.1, WOOD, -15.6, 2.62, NZ);
  const netT = CT(256, 160, (g, W, H) => { g.strokeStyle = '#d8c79a'; g.lineWidth = 3; for (let i = -16; i < 32; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16 + H, H); g.stroke(); g.beginPath(); g.moveTo(i * 16, H); g.lineTo(i * 16 + H, 0); g.stroke(); } g.fillStyle = ORANGE; for (let i = 0; i < 6; i++) g.fillRect(14 + i * 44, 0, 14, 10); });
  const NET = plane(nts, 2.6, 1.6, netT, -15.6, 1.75, NZ, PI, { transparent: true, alphaTest: 0.3 });
  box(nts, 1.1, 0.06, 0.62, WOOD, -15.6, 0.8, TRZ); for (const sx of [-0.48, 0.48]) for (const sz of [-0.24, 0.24]) box(nts, 0.06, 0.8, 0.06, WOODD, -15.6 + sx, 0.4, TRZ + sz);
  plane(nts, 0.62, 0.09, CT(256, 36, (g, W, H) => { g.fillStyle = YEL; g.fillRect(0, 0, W, H); g.fillStyle = INK; for (let i = 0; i <= 50; i += 5) g.fillRect(i / 50 * (W - 8) + 3, 0, 2, i % 10 ? 10 : 16); g.fillStyle = RED; g.fillRect(30 / 50 * (W - 8) + 1, 0, 6, H); g.fillStyle = INK; g.font = '900 16px Archivo, sans-serif'; g.fillText('30 CM', 30 / 50 * (W - 8) + 10, H - 4); }), -15.6, 0.835, TRZ + 0.24, 0).rotation.x = -PI / 2;
  box(nts, 0.72, 0.45, 0.5, WOOD, BINS.keep, 0.23, BZ); cyl(nts, 0.26, 0.22, 0.55, '#5a5654', BINS.junk, 0.28, BZ, 14); cyl(nts, 0.25, 0.2, 0.42, '#2e86b8', BINS.back, 0.21, BZ, 14);
  plane(nts, 0.66, 0.2, label('KEEP 30+', 256, 76, '#2f7a4a', '#ffffff', null), BINS.keep, 0.3, BZ - 0.26, PI); plane(nts, 0.5, 0.17, label('JUNK', 192, 64, INK, '#ffffff', null), BINS.junk, 0.42, BZ - 0.27, PI); plane(nts, 0.5, 0.17, label('BACK IN', 192, 64, '#2e86b8', '#ffffff', null), BINS.back, 0.33, BZ - 0.26, PI);
  boxC(-17.7, -13.5, BZ - 0.3, BZ + 0.3); boxC(-16.2, -15.0, TRZ - 0.32, TRZ + 0.32); ringC(-16.95, NZ, 0.15); ringC(-14.25, NZ, 0.15);
  // ================= rings =================
  const RINGS = { engine: [MX, 235.4, 'eng'], buoys: [75.6, 266.3, DECK], winch: [WX, 237.0, 'winch'], bail: [73.0, RBZ, DECK], rescue: [77.1, 259.5, DECK], nets: [-15.6, 234.9, 'nets'], pilot: [64.6, 266.3, DECK] };
  const FACE = { engine: [MX, MZ], buoys: [80, 276], winch: [WX, 246], bail: [RBX, RBZ], rescue: [86, 263], nets: [-15.6, NZ], pilot: [SC[0], 275] };
  const ringY = k => { const r = RINGS[k]; return typeof r[2] === 'string' ? SITES[r[2]].position.y : r[2]; };
  for (const k in RINGS) { const [x, z, y] = RINGS[k], par = typeof y === 'string' ? SITES[y] : GE, yy = typeof y === 'string' ? 0 : y; const r1 = cyl(par, 0.5, 0.5, 0.012, YEL, x, 0.085 + yy, z, 22), r2 = cyl(par, 0.42, 0.42, 0.014, INK, x, 0.087 + yy, z, 22); r1.renderOrder = r2.renderOrder = 1; }
  // ================= shop kit: keeper life, NOW HIRING, BEST board, bell =================
  const GAMES = [{ k: 'engine', name: 'Fix the Engine', color: RED }, { k: 'buoys', name: 'Set the Buoy Line', color: '#c9a227' }, { k: 'winch', name: 'Winch Up the Boat', color: STEEL },
    { k: 'bail', name: 'Bail the Leaky Boat', color: '#2e86b8' }, { k: 'rescue', name: 'Rescue a Swimmer', color: ORANGE }, { k: 'nets', name: 'Untangle the Nets', color: '#a07a52' }, { k: 'pilot', name: 'Pilot Into the Slip', color: NAVY }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q])), pre = 'bj';
  const K = shopKit({ THREE, G: hut, scene, kit, save, camera, touch, hour, isMuted: mutedQ, prefix: pre, color: BROWN, boardTitle: "Fisherman's best", room: { X0: 96, X1: 96, Z0: 232, Z1: 232 }, door: FISH, keeper: fisher, keeperRy: FRY, games: GAMES,
    board: { x: 99.86, y: 1.95, z: 232, ry: -PI / 2, w: 1.0 }, hiring: { x: 93.2, y: 0, z: 230.4, ry: PI }, hiringLine: 'JETTY JOBS \u00b7 WALK UP', browse: [], slots: 0 }); ringC(93.2, 230.4, 0.35);
  // ================= state, sound, card UI (same look as the boathouse jobs) =================
  let toastTxt = '', toastT = 0, talked = 0, talkedW = 0, busy = null, J = null, thanks = null, lastP = null, placed = false;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at0 = 0) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at0, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (mutedQ()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, bf = ac.createBuffer(1, n, ac.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = bf; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), splash = () => noise(0.35, 0.05, 900), click = () => tone(1800, 0.02, 0.04, 'square');
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + BROWN + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span></div>';
  const lst = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + items.map(([sw, t, r, ok]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (r ? ' \u00b7 ' + r : '') + '</span>').join('') + '</div>' : items.map(a => row(...a)).join('');
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>', big = t => '<div style="font-size:20px;font-weight:900;margin-top:4px;letter-spacing:0.5px">' + t + '</div>';
  const gauge = (v, lo, hi, red) => '<div style="position:relative;height:18px;border:2px solid #201e1d;background:#ffffff;margin-top:6px"><div style="position:absolute;top:0;bottom:0;left:' + (lo * 100).toFixed(1) + '%;width:' + ((hi - lo) * 100).toFixed(1) + '%;background:' + (red ? '#f6c9bf' : '#9fd7a8') + '"></div><div style="position:absolute;top:0;bottom:0;left:0;width:' + clamp(v * 100, 0, 100).toFixed(1) + '%;background:' + (v > hi && !red ? '#ec3013' : '#201e1d') + ';opacity:0.85"></div></div>';
  const setCard = (k, html) => { if (k === cardKey) return; cardKey = k; card.innerHTML = html; card.style.display = 'block'; }, hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const windTxt = wx => (Math.abs(wx) < 0.05 ? 'NO WIND' : 'WIND ' + (wx < 0 ? '\u2192' : '\u2190') + ' ' + Math.abs(wx).toFixed(1) + ' M');   // the cameras look south: screen right = west (-x)
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null }, keys = { l: 0, r: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && !!J;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const KL = k => k === 'a' || k === 'A' || k === 'ArrowLeft', KR = k => k === 'd' || k === 'D' || k === 'ArrowRight';
  addEventListener('keydown', e => { if (!(jobOn() && J.g === 'pilot')) return; if (KL(e.key)) keys.l = 1; if (KR(e.key)) keys.r = 1; }, true);
  addEventListener('keyup', e => { if (KL(e.key)) keys.l = 0; if (KR(e.key)) keys.r = 0; }, true);
  const tmp = V(), TAPR = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = V();
  const hitPl = pl => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); return rc.ray.intersectPlane(pl, hitP) ? hitP.clone() : null; };
  const waterPl = new THREE.Plane(V(0, 1, 0), 0);
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const Fq of J.flies.slice()) { Fq.t += dt / Fq.dur; const k = Math.min(1, Fq.t), e = k * k * (3 - 2 * k); Fq.obj.position.lerpVectors(Fq.from, Fq.to, e); Fq.obj.position.y += Math.sin(k * PI) * Fq.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(Fq), 1); Fq.then && Fq.then(); if (!J) return; } } }
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt + bg] || (tagTex[txt + bg] = CT(128, 96, (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = '900 ' + (txt.length > 4 ? 30 : txt.length > 2 ? 40 : 60) + 'px Archivo, sans-serif'; g.fillText(txt, W2 / 2, H / 2 + 3); }));
  const tagSprite = (txt, bg = '#ffffff', fg = INK, s = 0.5) => { if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: false })); sp.scale.set(s, s * 0.75, 1); sp.renderOrder = 6; return sp; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (after, t = 1.0) => { J.pause = t; J.after = after; };
  const done = () => save.stat(pre + 'Done', null) || {};
  const custFox = {}, getCust = i => { if (custFox[i]) return custFox[i]; const C = CUST[i], f = kit.makeFox({ key: 'bjCust' + i, joints: true, torso: C.torso, outfit: 'vest', mood: 'worried', look: C.f ? PLAYER_FEMALE : undefined }); f.visible = false; G.add(f); return (custFox[i] = f); };
  // ================= JOB 1: FIX THE ENGINE — undo the nut (turn ↺), bent prop to scrap, pick the match, tighten (turn ↻), yank the cord =================
  const E_STEPS = [['undo', 'UNDO THE NUT'], ['off', 'BENT PROP OFF'], ['pick', 'PICK THE MATCH'], ['tight', 'TIGHTEN THE NUT'], ['pull', 'PULL START']];
  const hubW = () => wv(eng, MX, HUB.y, MZ + HUB.z), nutW = () => wv(eng, MX, HUB.y, MZ + HUB.z - 0.06), handleW = () => wv(eng, MX, 1.5, MZ - 0.27);
  const G1 = {
    begin() { J.n0 = Math.random() < 0.5 ? 3 : 4; PROP0.visible = false; J.old = own(mkProp(J.n0, '#8a8680', true)); J.old.position.copy(hubW());
      J.nut = own(new THREE.Group()); const nm = cyl(J.nut, 0.04, 0.04, 0.06, '#c9a227', 0, 0, 0, 6); nm.rotation.x = PI / 2; J.nut.position.copy(nutW());
      J.opts = shuffle([2, 3, 4]).map((n, i) => { const p = own(mkProp(n, '#d8dde2')); p.position.copy(wv(eng, CRX - 0.27 + i * 0.27, 0.38, MZ - 0.2)); p.rotation.x = -PI / 2; return { p, n }; });
      J.ph = 'undo'; J.acc = 0; J.la = null; toast('TURN ROUND THE NUT \u21ba TO UNDO IT', 2.6); },
    want() { return J.ph === 'undo' ? -1 : 1; },
    press() { J.la = null; if (J.flies.length) return;
      if (J.ph === 'off') { if (dist(scrW(J.old.position)) > TAPR() * 1.8) return; pop(); J.ph = 'wait'; fly(J.old, wv(eng, BINX, 0.75, MZ - 0.2), 0.5, 0.4, () => { J.old.visible = false; noise(0.15, 0.04, 1500); addGold(1); J.ph = 'pick'; toast('PICK THE MATCH \u00b7 ' + J.n0 + ' BLADES LIKE THE OLD ONE', 2.4); }); return; }
      if (J.ph === 'pick') { let best = null, bd = TAPR() * 1.4; for (const o of J.opts) { const d = dist(scrW(o.p.position)); if (d < bd) { bd = d; best = o; } } if (!best) return;
        if (best.n !== J.n0) { miss('THAT ONE HAS ' + best.n + ' BLADES \u00b7 THE OLD ONE HAD ' + J.n0, 1.8); return; }
        pop(); J.ph = 'wait'; J.newP = best.p; best.p.rotation.x = 0; fly(best.p, hubW(), 0.55, 0.35, () => { addGold(2); click(); J.nut.position.copy(nutW()).add(V(0, 0, -0.12)); J.nut.visible = true; J.acc = 0; J.ph = 'tight'; toast('NOW TURN THE NUT \u21bb TO TIGHTEN', 2.2); }); return; }
      if (J.ph === 'pull') { if (dist(scrW(handleW())) > TAPR() * 1.8) return; J.pl = { y: ptr.y, t: J.t }; } },
    drag() { if (!ptr.down) return;
      if (J.ph === 'undo' || J.ph === 'tight') { const c = scrW(J.nut.position), dx = ptr.x - c[0], dy = ptr.y - c[1]; if (Math.hypot(dx, dy) < 10 || Math.hypot(dx, dy) > 320) { J.la = null; return; } const a = Math.atan2(dy, dx);
        if (J.la != null) { const da = wrapA(a - J.la); J.acc += da; if ((J.tk = (J.tk || 0) + Math.abs(da)) > 0.5) { J.tk = 0; click(); } } J.la = a; const w = this.want(), prog = J.acc * w / (PI * 4);
        J.nut.rotation.z = -J.acc; if (J.ph === 'undo') J.nut.position.copy(nutW()).add(V(0, 0, -0.1 * clamp(prog, 0, 1))); else J.nut.position.copy(nutW()).add(V(0, 0, -0.12 * (1 - clamp(prog, 0, 1))));
        if (prog < -0.3) { miss(J.ph === 'undo' ? 'WRONG WAY \u00b7 TURN IT \u21ba TO UNDO' : 'WRONG WAY \u00b7 TURN IT \u21bb TO TIGHTEN', 1.8); J.acc = 0; return; }
        if (prog >= 1) { J.la = null; addGold(2); ding(); if (J.ph === 'undo') { J.ph = 'wait'; fly(J.nut, wv(eng, MX + 0.4, 0.98, MZ - 0.1), 0.4, 0.2, () => { J.ph = 'off'; toast('TAP THE BENT PROP \u00b7 OFF IT COMES', 2.2); }); }
          else { J.ph = 'pull'; toast('GRAB THE YELLOW CORD \u00b7 PULL DOWN FAST', 2.4); } } return; }
      if (J.ph === 'pull' && J.pl) { const dy = ptr.y - J.pl.y, need = 80 * Math.max(1, Math.min(innerWidth, innerHeight) / 700); HANDLE.position.y = 1.5 - clamp(dy / need, 0, 1) * 0.3; CORD.scale.y = 1 + clamp(dy / need, 0, 1) * 30; CORD.position.y = 1.5 - clamp(dy / need, 0, 1) * 0.15;
        if (dy >= need) { if (J.t - J.pl.t < 0.7) { J.ph = 'run'; J.run = 1.8; J.pl = null; tone(90, 0.06, 1.6, 'sawtooth'); tone(135, 0.04, 1.6, 'sawtooth'); toast('VROOM \u00b7 SHE RUNS', 1.6); } else { J.pl = null; tone(70, 0.05, 0.3, 'sawtooth'); toast('TOO SLOW \u00b7 YANK IT HARD', 1.4); } } } },
    release() { J.la = null; if (J.ph === 'pull') J.pl = null; },
    tick(dt) { if (J.ph !== 'pull' || !J.pl) { HANDLE.position.y += (1.5 - HANDLE.position.y) * Math.min(1, dt * 10); CORD.scale.y = 1 + (HANDLE.position.y < 1.49 ? (1.5 - HANDLE.position.y) * 100 : 0); CORD.position.y = (1.5 + HANDLE.position.y) / 2; }
      if (J.ph === 'run') { J.newP.rotation.z += dt * 42; MOT.position.x = MX + Math.sin(J.t * 60) * 0.006; J.run -= dt; if (J.run <= 0) { J.ph = 'end'; MOT.position.x = MX; addGold(6); ding(); NEXT(finishGame, 0.5); } } },
    card() { const i = E_STEPS.findIndex(s => s[0] === (J.ph === 'wait' ? J.lastPh : J.ph)); if (J.ph !== 'wait') J.lastPh = J.ph; const cur = i < 0 ? E_STEPS.length : i, prog = (J.ph === 'undo' || J.ph === 'tight') ? Math.round(clamp(J.acc * this.want() / (PI * 4), 0, 1) * 100) + '%' : '';
      const head2 = { undo: 'TURN ROUND THE NUT \u21ba', off: 'TAP THE BENT PROP', pick: 'TAP THE ' + J.n0 + '-BLADE PROP', tight: 'TURN ROUND THE NUT \u21bb', pull: 'PULL THE CORD DOWN', run: 'SHE RUNS', end: 'SHE RUNS', wait: '\u2026' }[J.ph];
      return [head2, lab('OLD PROP: ' + J.n0 + ' BLADES') + lst(E_STEPS.map(([k, t], j) => [RED, t, j < cur ? '\u2713' : j === cur ? prog || '\u2190' : '', j < cur])), J.ph + '_' + prog]; },
    hint() { return J.ph === 'undo' ? [J.nut.position.clone(), 'TURN \u21ba'] : J.ph === 'tight' ? [J.nut.position.clone(), 'TURN \u21bb'] : J.ph === 'off' ? [J.old.position.clone(), 'TAP'] : J.ph === 'pick' ? [J.opts.find(o => o.n === J.n0).p.position.clone(), 'TAP'] : J.ph === 'pull' ? [handleW(), 'PULL \u2193'] : null; },
    shot() { return [wv(eng, MX + 0.3, 0.8, MZ - 0.1), 3.2, 1.9, 0.32, 2.3, PI, 3.9]; },
    end() { PROP0.visible = true; MOT.position.x = MX; HANDLE.position.y = 1.5; CORD.scale.y = 1; CORD.position.y = 1.5; } };
  // ================= JOB 2: SET THE BUOY LINE — tap the water to throw; the wind carries it, so aim upwind of the yellow ring =================
  const HAND = V(75.6, DECK + 1.25, 266.6);
  const G2 = {
    begin() { J.i = 0; KEEPB.forEach(b => { b.visible = false; }); J.mk = BT.map(([x, z]) => { const m = own(new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 6, 28), LM(YEL))); m.rotation.x = PI / 2; m.position.set(x, 0.06, z); return m; });
      J.num = own(tagSprite('1', YEL, INK, 0.6)); this.wind(); this.mark(); toast('TAP THE WATER TO THROW \u00b7 THE WIND CARRIES IT', 2.8); },
    wind() { J.w = (Math.random() < 0.5 ? -1 : 1) * rnd(1.0, 2.2); flagW = [J.w, 0]; },
    mark() { J.mk.forEach((m, i) => { m.visible = i >= J.i; m.material = LM(i === J.i ? YEL : '#d6d2cb'); }); if (J.i < BT.length) { J.num.material.map = tagFor(String(J.i + 1), YEL, INK); J.num.position.set(BT[J.i][0], 1.4, BT[J.i][1]); } J.num.visible = J.i < BT.length; },
    press() { if (J.flies.length || J.i >= BT.length) return; const p = hitPl(waterPl); if (!p || p.z < 269) return; const land = V(p.x + J.w, 0, p.z), b = own(mkBuoy(J.i % 2 ? WHITE : RED)); b.position.copy(HAND); noise(0.12, 0.03, 4000);
      fly(b, land, 0.85, 3.2, () => { const [tx, tz] = BT[J.i], d = Math.hypot(land.x - tx, land.z - tz); splash();
        if (d < 1.3) { addGold(3); ding(); fly(b, V(tx, 0, tz), 0.3, 0, () => {}); toast('BUOY ' + (J.i + 1) + ' SET', 1.1); J.i++; G2.mark(); if (J.i >= BT.length) { const d0 = { ...done(), buoys: true }; save.setStat(pre + 'Done', d0); NEXT(finishGame, 1.0); } else G2.wind(); }
        else { miss('OFF BY ' + d.toFixed(1) + ' M \u00b7 AIM UPWIND', 1.8); fly(b, V(land.x, -0.9, land.z), 0.6, 0, () => { b.visible = false; }); } }); },
    tick() { for (const o of J.objs) if (o.isGroup && o.position.y <= 0.01 && o.position.y > -0.05 && !J.flies.some(f => f.obj === o)) o.position.y = Math.sin(J.t * 1.8 + o.position.x) * 0.05; },
    card() { return ['TAP THE WATER \u00b7 AIM UPWIND', big(windTxt(J.w)) + lab('BUOY ' + Math.min(5, J.i + 1) + ' / 5') + lst(BT.map((_, i) => [i % 2 ? WHITE : RED, 'BUOY ' + (i + 1), i < J.i ? '\u2713' : '', i < J.i])), 'b' + J.i + '_' + J.w.toFixed(1)]; },
    hint() { return J.i < BT.length ? [V(BT[J.i][0] - J.w, 0, BT[J.i][1]), 'TAP'] : null; },
    shot() { return [V(84.5, 0, 281.5), 21, 10, 0.45, 10, PI, 24]; },
    end() { KEEPB.forEach(b => { b.visible = !!done().buoys; }); } };
  // ================= JOB 3: WINCH UP THE BOAT — hold to wind it up the ramp; let go when a wave comes in =================
  const G3 = {
    begin() { J.z = WZLOW; J.ten = 0; J.wv = rnd(2.2, 3.2); J.warn = false; J.surge = 0; J.hold = false; J.mile = 0; toast('HOLD TO WIND \u00b7 LET GO WHEN A WAVE COMES', 2.8); },
    press() { J.hold = true; }, release() { J.hold = false; },
    tick(dt) { J.wv -= dt; if (!J.warn && J.wv < 1.0 && J.surge <= 0) { J.warn = true; tone(440, 0.04, 0.2, 'triangle'); tone(440, 0.04, 0.2, 'triangle', 0.25); }
      if (J.wv <= 0) { J.surge = 0.7; J.warn = false; J.wv = rnd(2.4, 3.8); splash(); }
      if (J.surge > 0) { J.surge -= dt; if (J.hold) { J.ten += dt * 3.2; if (J.ten >= 1) { miss('LINE SLIPPED \u00b7 LET GO ON THE WAVES', 1.8); J.z = Math.min(WZLOW, J.z + 2.2); J.ten = 0; J.hold = false; ptr.down = false; } } else { J.z = Math.min(WZLOW, J.z + dt * 0.5); J.ten = Math.max(0, J.ten - dt); } }
      else if (J.hold) { J.z -= dt * 1.5; J.ten += (0.45 - J.ten) * Math.min(1, dt * 4); CRANK.rotation.x -= dt * 9; if ((J.ck = (J.ck || 0) + dt) > 0.12) { J.ck = 0; click(); } } else J.ten = Math.max(0, J.ten - dt * 1.5);
      const m = Math.floor((WZLOW - J.z) / 3); if (m > J.mile) { J.mile = m; addGold(1); }
      wdZ = J.z; const fz = J.warn ? 258 - (1 - J.wv) * 4 : J.surge > 0 ? 254 - (0.7 - J.surge) * 8 : 0; FOAM.visible = !!fz && fz > wdZ - 1; FOAM.position.set(WX, 0.06, fz);
      if (J.z <= WZTOP) { wdZ = WZTOP; J.hold = false; FOAM.visible = false; addGold(5); ding(); toast('UP AND TIED OFF', 1.4); const d0 = { ...done(), winch: true }; save.setStat(pre + 'Done', d0); NEXT(finishGame, 0.9); } },
    card() { const wave = J.warn || J.surge > 0, pr = (WZLOW - J.z) / (WZLOW - WZTOP);
      return [wave ? 'WAVE! LET GO' : J.hold ? 'WINDING\u2026' : 'HOLD TO WIND', big(wave ? '<span style="color:#ec3013">WAVE! LET GO</span>' : 'CALM \u00b7 WIND IN') + lab('UP THE RAMP') + gauge(pr, 1, 1) + lab('LINE TENSION') + gauge(J.ten, 0.75, 1, true), 'w' + Math.round(pr * 20) + '_' + Math.round(J.ten * 10) + wave + J.hold]; },
    hint() { return J.hold || J.warn || J.surge > 0 ? null : [V(WX, rampY(J.z) + 0.6, J.z - 1.4), 'HOLD']; },
    shot() { return [V(WX, 0.4, 249), 7, 5, 0.45, 7, PI + 0.55, 13]; },
    end() { FOAM.visible = false; wdZ = done().winch ? WZTOP : WZLOW; } };
  // ================= JOB 4: BAIL THE LEAKY BOAT — tap a leak to plug it, tap the water to scoop it out =================
  const LEAKC = [[-0.3, -0.7], [0.3, -0.25], [-0.25, 0.3], [0.28, 0.65], [0, -0.95], [-0.05, 0.05]];
  const G4 = {
    begin() { J.lv = 0.25; J.leaks = []; J.cands = shuffle(LEAKC.slice()).slice(0, 4); J.nextL = 0.4; J.bk = own(new THREE.Group()); cyl(J.bk, 0.13, 0.1, 0.2, '#c0c4c8', 0, 0, 0, 10); J.bk.visible = false; toast('TAP A LEAK TO PLUG IT \u00b7 TAP THE WATER TO BAIL', 2.8); },
    lp(l) { RB.updateMatrixWorld(true); return RB.localToWorld(V(l.x, RBW.position.y + 0.02, l.z)); },
    press() { let best = null, bd = TAPR() * 1.3; for (const l of J.leaks) { if (l.plug) continue; const d = dist(scrW(this.lp(l))); if (d < bd) { bd = d; best = l; } }
      if (best) { best.plug = true; best.sp.visible = false; best.cork.visible = true; addGold(2); tone(520, 0.05, 0.15, 'triangle'); toast('PLUGGED', 0.8); return; }
      const wy = RB.position.y + RBW.position.y, p = hitPl(new THREE.Plane(V(0, 1, 0), -wy)); if (!p || Math.abs(p.x - RBX) > 0.62 || Math.abs(p.z - RBZ + 0.1) > 1.15) return;
      J.lv = Math.max(0, J.lv - 0.07); splash(); J.bk.visible = true; J.bk.position.set(p.x, wy, p.z); if ((J.sc = (J.sc || 0) + 1) % 4 === 0) addGold(1); fly(J.bk, V(RBX + 1.3, DECK + 0.5, p.z), 0.22, 0.25, () => { if (J) J.bk.visible = false; }); },
    tick(dt) { J.nextL -= dt; if (J.leaks.length < 4 && J.nextL <= 0) { const [x, z] = J.cands[J.leaks.length], l = { x, z, plug: false }; l.sp = own(tagSprite('LEAK', '#e0f2fe', '#0369a1', 0.34)); l.cork = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.09, 8), LM('#a07a52')); l.cork.visible = false; RB.add(l.cork); l.cork.position.set(x, 0.2, z); J.objs.push(l.cork); J.leaks.push(l); J.nextL = 3.2; tone(300, 0.04, 0.3); }
      const open = J.leaks.filter(l => !l.plug).length; J.lv += open * 0.05 * dt;
      if (J.lv >= 1) { miss('SHE IS SWAMPED \u00b7 PLUG AND BAIL FASTER', 2); J.lv = 0.55; }
      RBW.position.y = 0.16 + J.lv * 0.32; RB.position.y = 0.02 - J.lv * 0.12; for (const l of J.leaks) if (!l.plug) { l.sp.position.copy(this.lp(l)); l.sp.position.y += 0.18 + Math.abs(Math.sin(J.t * 5 + l.x * 9)) * 0.06; } for (const l of J.leaks) l.cork.position.y = RBW.position.y + 0.03;
      if (J.leaks.length >= 4 && !open && J.lv <= 0.05 && !J.pause) { J.lv = 0; addGold(5); ding(); toast('DRY AS A BONE', 1.4); NEXT(finishGame, 0.9); } },
    card() { const open = J.leaks.filter(l => !l.plug).length, plugged = J.leaks.length - open;
      return [open ? 'TAP THE LEAKS' : 'TAP THE WATER \u00b7 BAIL', lab('WATER IN THE BOAT') + gauge(J.lv, 0.75, 1, true) + lst([['#0369a1', 'LEAKS OPEN', String(open), !open], ['#a07a52', 'PLUGGED', plugged + ' / 4', plugged >= 4]]), 'l' + open + '_' + plugged + '_' + Math.round(J.lv * 20)]; },
    hint() { const l = J.leaks.find(q => !q.plug); return l ? [this.lp(l), 'TAP'] : J.lv > 0.05 ? [V(RBX, RB.position.y + RBW.position.y, RBZ), 'BAIL'] : null; },
    shot() { return [V(RBX, 0.3, RBZ), 3.0, 3.6, 0.95, 3.2, PI / 2, 6]; },
    end() { RBW.position.y = 0.2; RB.position.y = 0.02; } };
  // ================= JOB 5: RESCUE A SWIMMER — tap the water by them to throw the ring, then hold to pull them in =================
  const PULLTO = V(78.7, 0, 259.5), RHAND = V(77.6, DECK + 1.1, 259.5);
  const G5 = {
    begin() { J.order = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3); J.i = 0; J.lb = own(new THREE.Group()); const t = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.09, 8, 18), LM(ORANGE)); t.rotation.x = PI / 2; J.lb.add(t); for (let i = 0; i < 4; i++) { const w = box(J.lb, 0.1, 0.19, 0.2, WHITE, Math.cos(i * PI / 2) * 0.3, 0, Math.sin(i * PI / 2) * 0.3); w.rotation.y = -i * PI / 2; }
      J.rope = own(new THREE.Mesh(ropeG, ropeM)); this.next(); toast('TAP THE WATER BY THE SWIMMER \u00b7 THROW THE RING', 2.8); },
    next() { Object.values(custFox).forEach(f => { f.visible = false; }); const f = getCust(J.order[J.i]); const r = 7 + J.i * 2.5, a = rnd(-0.6, 0.6); J.sw = { f, x: PULLTO.x + Math.cos(a) * r + 2, z: PULLTO.z + 3 + Math.sin(a) * r, vx: 0, vz: 0 }; f.visible = true; f.rotation.set(0, -PI / 2, 0); J.ph = 'aim'; J.lb.position.copy(RHAND); J.hold = false; },
    press() { if (J.ph === 'pull') { J.hold = true; return; } if (J.ph !== 'aim' || J.flies.length) return; const p = hitPl(waterPl); if (!p || p.x < 79) return; noise(0.12, 0.03, 4000); J.ph = 'fly';
      fly(J.lb, V(p.x, 0.05, p.z), 0.75, 2.6, () => { splash(); const d = Math.hypot(p.x - J.sw.x, p.z - J.sw.z); if (d < 1.6) { J.ph = 'pull'; pop(); addGold(2); toast(CUST[J.order[J.i]].name + ' HAS IT \u00b7 HOLD TO PULL', 1.8); }
        else { miss('MISSED \u00b7 THROW IT RIGHT BY THEM', 1.6); J.ph = 'back'; fly(J.lb, RHAND, 0.5, 0.6, () => { J.ph = 'aim'; }); } }); },
    release() { J.hold = false; },
    tick(dt) { const s = J.sw, f = s.f, A = f.userData.P && f.userData.P.arms;
      if (J.ph === 'aim' || J.ph === 'fly' || J.ph === 'back') { s.vx += (Math.random() - 0.5) * dt * 0.8; s.vz += (Math.random() - 0.5) * dt * 0.8; s.vx = clamp(s.vx, -0.3, 0.3); s.vz = clamp(s.vz, -0.3, 0.3); s.x = clamp(s.x + s.vx * dt, 82.5, 93); s.z = clamp(s.z + s.vz * dt, 255.5, 272); }
      if (J.ph === 'pull') { const dx = PULLTO.x - J.lb.position.x, dz = PULLTO.z - J.lb.position.z, d = Math.hypot(dx, dz); if (J.hold) { const st = Math.min(d, 2.0 * dt); J.lb.position.x += dx / d * st; J.lb.position.z += dz / d * st; if ((J.ck = (J.ck || 0) + dt) > 0.3) { J.ck = 0; noise(0.08, 0.02, 2500); } } else { J.lb.position.x -= dx / d * 0.3 * dt; J.lb.position.z -= dz / d * 0.3 * dt; }
        s.x = J.lb.position.x + 0.45; s.z = J.lb.position.z; J.lb.position.y = 0.05 + Math.sin(J.t * 2) * 0.04;
        if (d < 0.7) { J.ph = 'saved'; addGold(5); ding(); f.position.set(77.3, DECK, 261.2); f.rotation.set(0, Math.atan2(J.P.x - 77.3, J.P.z - 261.2), 0); toast(CUST[J.order[J.i]].name + ': "THANK YOU!"', 1.6); J.lb.position.copy(RHAND);
          NEXT(() => { J.i++; if (J.i >= 3) finishGame(); else G5.next(); }, 1.3); } }
      if (J.ph !== 'saved') { f.position.set(s.x, -0.95 + Math.sin(J.t * 2 + s.x) * 0.06, s.z); f.rotation.y = Math.atan2(RHAND.x - s.x, RHAND.z - s.z); }
      kit.animFox(f, dt, 0, false); if (f.userData.P && f.userData.P.fore) { if (J.ph === 'saved') { if (f.userData._swimJ) { endPose(f); f.userData._swimJ = 0; } }
        else { const D = swimD({ mode: 'help', ph: J.t / 1.2 }); if (J.ph === 'pull') { D.a = [[0.1, 0.14, 0.5], [0.1, 0.14, 0.5]]; D.pole = [[0.8, -0.4, 0], [0.8, -0.4, 0]]; D.g = [1, 1]; D.palm = [[-1, 0, 0], [-1, 0, 0]]; D.mood = 'determined'; D.mp = { press: 0.6 }; D.head = [-0.1, 0, 0]; } applyD(THREE, f, D, J.t, 1); f.userData._swimJ = 1; } }
      else if (A && J.ph !== 'saved' && J.ph !== 'pull') { A[1].rotation.x = -2.7; A[1].rotation.z = 0.35 + Math.sin(J.t * 9) * 0.4; } if (A && J.ph === 'pull') { A[0].rotation.x = A[1].rotation.x = -1.4; }
      const showR = J.ph === 'pull' || J.ph === 'fly' || J.ph === 'back'; J.rope.visible = showR; if (showR) stretch(J.rope, RHAND, J.lb.position); },
    card() { return [J.ph === 'pull' ? (J.hold ? 'PULLING\u2026' : 'HOLD TO PULL') : 'TAP THE WATER BY THEM', lab('SWIMMER ' + Math.min(3, J.i + 1) + ' / 3 \u00b7 ' + CUST[J.order[Math.min(2, J.i)]].name) + lst([0, 1, 2].map(i => [ORANGE, CUST[J.order[i]].name, i < J.i ? '\u2713' : '', i < J.i])), 'r' + J.i + J.ph + J.hold]; },
    hint() { return J.ph === 'aim' ? [V(J.sw.x, 0, J.sw.z), 'TAP'] : J.ph === 'pull' && !J.hold ? [J.lb.position.clone(), 'HOLD'] : null; },
    shot() { return [V(85.5, 0, 263.5), 14, 9, 0.78, 9, -PI / 2, 18]; },
    end() { Object.values(custFox).forEach(f => { f.visible = false; }); } };
  // ================= JOB 6: UNTANGLE THE NETS — tap each knot three times; then sort the catch: KEEP 30 CM+, small ones BACK IN, JUNK =================
  const SPEC = [['TROUT', '#8a9a6a'], ['PERCH', '#c9a227'], ['CARP', '#a0703a'], ['BASS', '#5a7a5a']], JUNK = ['BOOT', 'CAN', 'WEED'];
  const fishG = new THREE.SphereGeometry(1, 10, 6), tailG = new THREE.ConeGeometry(1, 1, 3); tailG.rotateZ(-PI / 2);
  const mkItem = it => { const g = new THREE.Group(); if (it.cm) { const L2 = 0.12 + it.cm / 100; const b = new THREE.Mesh(fishG, LM(it.c)); b.scale.set(L2 / 2, L2 * 0.07, L2 * 0.17); g.add(b); const t = new THREE.Mesh(tailG, LM(it.c)); t.scale.set(L2 * 0.22, L2 * 0.03, L2 * 0.16); t.position.x = -L2 / 2 - L2 * 0.08; g.add(t); }
    else if (it.j === 'BOOT') { box(g, 0.14, 0.1, 0.3, '#5a4a3a', 0, 0.05, 0); box(g, 0.14, 0.24, 0.12, '#5a4a3a', 0, 0.17, -0.09); } else if (it.j === 'CAN') { cyl(g, 0.05, 0.05, 0.14, STEEL, 0, 0.05, 0, 10).rotation.z = PI / 2; } else { for (let i = 0; i < 3; i++) box(g, 0.04, 0.02, 0.3, '#3f7a3a', -0.06 + i * 0.06, 0.02, 0).rotation.y = (i - 1) * 0.4; }
    return g; };
  const knotT = CT(64, 64, (g, W) => { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(32, 32, 24, 0, 7); g.stroke(); g.strokeStyle = RED; g.lineWidth = 5; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(28 + i * 3, 30 + (i % 2) * 4, 9 + i * 3, i, i + 4.5); g.stroke(); } });
  const binW = k => wv(nts, BINS[k], 0.45, BZ), trayW = () => wv(nts, -15.6, 0.86, TRZ);
  const G6 = {
    begin() { J.ph = 'knots'; J.k = []; for (let i = 0; i < 7; i++) { let x, y, n = 0; do { x = rnd(-16.6, -14.6); y = rnd(1.1, 2.35); } while (J.k.some(k => Math.hypot(k.x - x, k.y - y) < 0.38) && ++n < 40);
        const s = own(new THREE.Sprite(new THREE.SpriteMaterial({ map: knotT, depthTest: false }))); s.renderOrder = 6; const sc = touch ? 0.36 : 0.3; s.scale.set(sc, sc, 1); s.position.copy(wv(nts, x, y, NZ - 0.08)); J.k.push({ x, y, h: 3, s, sc }); }
      const fish = shuffle([rnd(14, 26), rnd(14, 26), rnd(33, 48), rnd(33, 48), Math.random() < 0.5 ? rnd(14, 26) : rnd(33, 48), rnd(33, 48)]).map(cm => { const s = SPEC[Math.random() * SPEC.length | 0]; return { cm: Math.round(cm), c: s[1], n: s[0] }; });
      J.items = shuffle([...fish, { j: JUNK[Math.random() * 3 | 0] }, { j: JUNK[Math.random() * 3 | 0] }]); J.ii = 0; toast('TAP EACH RED KNOT \u00b7 THREE TUGS UNDOES IT', 2.6); },
    press() { if (J.flies.length) return;
      if (J.ph === 'knots') { let best = null, bd = TAPR() * 1.2; for (const k of J.k) { if (k.h <= 0) continue; const d = dist(scrW(k.s.position)); if (d < bd) { bd = d; best = k; } } if (!best) return;
        best.h--; noise(0.08, 0.03, 2000); NET.position.z = NZ + 0.04; setTimeout(() => { NET.position.z = NZ; }, 90); best.s.scale.setScalar(best.sc * (0.45 + best.h * 0.18)); best.s.scale.z = 1;
        if (best.h <= 0) { best.s.visible = false; pop(); addGold(1); if (J.k.every(k => k.h <= 0)) { ding(); toast('CLEAR \u00b7 NOW SORT THE CATCH', 1.6); NEXT(() => { J.ph = 'sort'; G6.item(); toast('KEEP 30 CM+ \u00b7 SMALL ONES BACK IN \u00b7 JUNK IN THE BIN', 2.8); }, 0.8); } } return; }
      if (J.ph === 'sort' && J.cur) { let best = null, bd = TAPR() * 2; for (const k in BINS) { const d = dist(scrW(binW(k))); if (d < bd) { bd = d; best = k; } } if (!best) return;
        const it = J.items[J.ii], want = it.j ? 'junk' : it.cm >= 30 ? 'keep' : 'back';
        if (best !== want) { miss(it.j ? 'JUNK GOES IN THE BIN' : best === 'junk' ? 'THAT IS A FISH \u00b7 NOT JUNK' : it.cm >= 30 ? it.cm + ' CM \u00b7 30 OR MORE: KEEP IT' : it.cm + ' CM \u00b7 UNDER 30 GOES BACK IN', 1.8); return; }
        const o = J.cur, tg = J.tag; J.cur = null; tg.visible = false; addGold(1); pop(); fly(o, binW(best).add(V(0, 0.15, 0)), 0.4, 0.4, () => { o.visible = false; if (best === 'back') splash(); J.ii++; if (J.ii >= J.items.length) { ding(); NEXT(finishGame, 0.7); } else G6.item(); }); } },
    item() { const it = J.items[J.ii]; J.cur = own(mkItem(it)); J.cur.position.copy(trayW()); J.cur.rotation.y = rnd(-0.3, 0.3); if (J.tag) J.tag.visible = false; J.tag = own(tagSprite(it.j || it.cm + ' CM', it.j ? '#d6d2cb' : '#ffffff', INK, 0.42)); J.tag.position.copy(trayW()).add(V(0, 0.42, 0)); },
    card() { if (J.ph === 'knots') { const n = J.k.filter(k => k.h > 0).length; return ['TAP THE RED KNOTS', lst([[RED, 'KNOTS', n + ' LEFT', !n]]), 'k' + n + '_' + J.k.reduce((a, k) => a + k.h, 0)]; }
      const it = J.items[Math.min(J.ii, J.items.length - 1)]; return ['TAP THE RIGHT BIN', big(it.j ? it.j : it.n + ' \u00b7 ' + it.cm + ' CM') + lab('CATCH ' + Math.min(J.items.length, J.ii + 1) + ' / ' + J.items.length) + lst([['#2f7a4a', 'KEEP', '30 CM+', false], ['#2e86b8', 'BACK IN', 'UNDER 30', false], [INK, 'JUNK', 'BIN', false]]), 's' + J.ii]; },
    hint() { if (J.ph === 'knots') { const k = J.k.find(q => q.h > 0); return k ? [k.s.position.clone(), 'TAP'] : null; } const it = J.cur && J.items[J.ii]; return it ? [binW(it.j ? 'junk' : it.cm >= 30 ? 'keep' : 'back'), 'TAP'] : null; },
    shot() { return J.ph === 'knots' ? [wv(nts, -15.6, 1.75, NZ), 3.2, 2.2, 0.15, 2.6, PI, 4.6] : [wv(nts, -15.6, 0.55, (TRZ + BZ) / 2 + 0.2), 4.4, 2.2, 0.82, 3.4, PI, 5.6]; },
    end() { NET.position.z = NZ; } };
  // ================= JOB 7: PILOT INTO THE SLIP — the dinghy runs on its own; hold the LEFT or RIGHT side (A / D) to steer into the lit slip =================
  const pilotOn = () => busy === 'job' && J && J.g === 'pilot';
  const G7 = {
    begin() { J.i = 0; J.slots = shuffle([0, 1, 2]); J.arrow = own(tagSprite('IN', YEL, INK, 0.6)); this.reset(); toast('HOLD LEFT OR RIGHT TO STEER \u00b7 INTO THE LIT SLIP', 2.8); },
    reset() { J.b = { x: 68 + rnd(-3, 3), z: 297, yaw: PI, v: 0, stun: 0 }; J.w = (Math.random() < 0.5 ? -1 : 1) * rnd(0.25, 0.45); flagW = [J.w * 4, 0]; const c = SC[J.slots[J.i]]; J.arrow.position.set(c, 2.3, 269.6);
      postTop.forEach((m, i) => { m.material = LM((i >> 1) === J.slots[J.i] ? YEL : RED); }); },
    bump(t) { miss(t, 1.6); noise(0.2, 0.06, 400); const b = J.b; b.x -= Math.sin(b.yaw) * 2.4; b.z -= Math.cos(b.yaw) * 2.4; b.v = 0; b.stun = 0.7; },
    tick(dt) { const b = J.b; if (b.done) return; let s = keys.l - keys.r; if (ptr.down) s += ptr.x < innerWidth / 2 ? 1 : -1; s = clamp(s, -1, 1);
      b.yaw += s * 1.15 * dt; const vt = b.stun > 0 ? 0 : b.z < 277 ? 1.3 : 2.6; b.stun -= dt; b.v += (vt - b.v) * Math.min(1, dt * 2);
      b.x += Math.sin(b.yaw) * b.v * dt + J.w * dt * (b.z < 273 ? 0.4 : 1); b.z += Math.cos(b.yaw) * b.v * dt;
      if ((J.pt = (J.pt || 0) + dt) > 0.22) { J.pt = 0; tone(85 + b.v * 10, 0.012, 0.18, 'sawtooth'); }
      const bx = b.x + Math.sin(b.yaw) * 1.6, bz = b.z + Math.cos(b.yaw) * 1.6;
      for (const [px, pz] of POSTS) if (Math.hypot(bx - px, bz - pz) < 0.4 || Math.hypot(b.x - px, b.z - pz) < 0.7) { this.bump('BUMP \u00b7 EASY ON THE POSTS'); return; }
      if (b.x < 54 || b.x > 88 || b.z > 306 || (bz < 262 && (bx < 62 || bx > 78))) { miss('OUT OF THE LANE \u00b7 BACK TO THE START', 1.8); this.reset(); return; }
      if (bz <= SZF + 0.35 && bx > 61.5 && bx < 78.5) { const n = J.slots[J.i], c = SC[n];
        if (Math.abs(bx - c) < 0.85 && Math.abs(wrapA(b.yaw - PI)) < 0.5) { b.done = true; b.x = c; b.z = SZF + 1.55; b.yaw = PI; addGold(5); ding(); toast('SNUG IN SLIP ' + (n + 1), 1.4); NEXT(() => { J.i++; if (J.i >= 3) finishGame(); else G7.reset(); }, 1.2); }
        else { const k = SC.findIndex(q => Math.abs(bx - q) < 1.2); this.bump(k >= 0 && k !== n ? 'WRONG SLIP \u00b7 THE LIT ONE IS ' + (n + 1) : 'BUMP \u00b7 LINE UP WITH SLIP ' + (n + 1)); } } },
    card() { return [touch ? 'HOLD LEFT / RIGHT SIDE' : 'HOLD A / D \u00b7 OR CLICK SIDES', big('SLIP ' + (J.slots[Math.min(2, J.i)] + 1)) + lab(windTxt(-J.w * 4).replace('WIND', 'CROSSWIND')) + lst([0, 1, 2].map(i => [NAVY, 'BOAT ' + (i + 1), i < J.i ? '\u2713' : '', i < J.i])), 'p' + J.i]; },
    hint() { return null; },
    end() { postTop.forEach(m => { m.material = LM(RED); }); } };
  const GD = { engine: G1, buoys: G2, winch: G3, bail: G4, rescue: G5, nets: G6, pilot: G7 };
  // ================= run a game =================
  function startGame(g, P) { if (busy || !GD[g]) return; J = { g, miss: 0, gold: 0, objs: [], flies: [], t: 0, pause: 0, P }; busy = 'job'; keys.l = keys.r = 0; const R = RINGS[g];
    if (P && R) { Object.assign(P, { x: R[0], z: R[1], sp: 0, vy: 0 }); P.y = ringY(g); const f = FACE[g]; P.yaw = Math.atan2(f[0] - R[0], f[1] - R[1]); } GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(8); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat(pre + 'Done', d); save.setStat('bjClears', save.stat('bjClears', 0) + 1); K.finish(g, stars, gold, first); stop();
    const pz = (onFinish && onFinish(g)) || {}; thanks = { g, gold, gf: pz.gf }; toast(GN[g].name.toUpperCase() + ' DONE \u00b7 +' + gold + ' GOLD' + (pz.lucky ? ' \u00b7 +' + pz.lucky + ' LUCKY FLOAT' : '') + (pz.gf && prizeLine ? ' \u00b7 PRIZE: ' + prizeLine(pz.gf, 'fish')[1] : ''), pz.gf ? 4 : 2.6); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) J.objs.forEach(o => o.parent && o.parent.remove(o)); busy = null; J = null; ptr.down = false; hideCard(); }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g], c = g.card && g.card(); if (!c) { hideCard(); return; }
    setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? Math.floor(J.gold) + ' G' : 'FISHERMAN') + foot(c[0]) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; if (J.flies.length) flyTick(dt); if (!J) return; const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return; drawCard(); }
  // ---------- camera ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null, snapK = false; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const on = busy === 'job' && J; if (!on) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; }
    if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); } const port = (cam.aspect || 1) < 1;
    if (port) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    if (J.g === 'pilot') { const b = J.b, fx = Math.sin(b.yaw), fz = Math.cos(b.yaw), d = port ? 10 : 8, h = port ? 6.5 : 4.6; camT.pos.set(b.x - fx * d, h, b.z - fz * d); camT.look.set(b.x + fx * 4, 0.5, b.z + fz * 4); }
    else fitCam(GD[J.g].shot());
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = snapK ? 1 : Math.min(1, dt * 3.2); snapK = false; camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.y = Math.max(camCur.pos.y, 0.7); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.830-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- first tick: lift the sites to the ground, lay the ramp + the SHORE PATH (planks + lanterns + two fingerposts) ----------
  const lampPts = []; let LAMP = null;
  function place() { placed = true; for (const k in SITES) { const [x, z, y = 0] = SITES[k].userData.at; SITES[k].position.y = gAt(x, z, y); }
    RY0 = gAt(WX, RZ0) + 0.06; { const N = 12, ZS = [...Array(N + 1)].map((_, i) => RZ0 + (RZ1 - RZ0) * i / N); RP = ZS.map((z, i) => Math.max(RY0 + (RY1 - RY0) * i / N, Math.max(...[-1.4, 0, 1.4].map(dx => gAt(WX + dx, z))) + 0.06));
      for (let i = 1; i < RP.length; i++) RP[i] = Math.min(RP[i], RP[i - 1]);
      for (let i = 0; i < N; i++) { const za = ZS[i], zb = ZS[i + 1], ya = RP[i], yb = RP[i + 1], len = Math.hypot(zb - za, ya - yb) + 0.02, rx = Math.atan2(ya - yb, zb - za), m = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.3, len), LM('#9a958e')); m.position.set(WX, (ya + yb) / 2 - 0.15, (za + zb) / 2); m.rotation.x = rx; GE.add(m);
        for (const sx of [-2.05, 2.05]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, len), LM(INK)); e.position.set(WX + sx, (ya + yb) / 2 + 0.03, (za + zb) / 2); e.rotation.x = rx; GE.add(e); } } }
    wdZ = done().winch ? WZTOP : WZLOW; KEEPB.forEach(b => { b.visible = !!done().buoys; });
    const segs = [[-19.4, -3.4], [3.4, 95.2]], Z = 229.0, pl = [];
    const hit = (x, z, hw, hd) => cols.some(c => c.c ? c.c[2] < 1.2 && Math.abs(c.c[0] - x) < hw + c.c[2] && Math.abs(c.c[1] - z) < hd + c.c[2] : false);   // the beach sets' loungers + umbrellas: the path steps round them
    for (const [a, b] of segs) for (let x = a; x < b - 0.01; x += 2) { const w = Math.min(2, b - x), cx = x + w / 2, z = [Z, Z - 1.2, Z - 2.4, Z - 3.6].find(zz => !hit(cx, zz, w / 2 + 0.6, 1.0)) ?? Z; pl.push([cx, gAt(cx, z) + 0.02, w, z]); }
    for (let i = 1; i < pl.length - 1; i++) if (pl[i][3] === Z && pl[i - 1][3] < Z && pl[i + 1][3] < Z) pl[i][3] = Math.max(pl[i - 1][3], pl[i + 1][3]);
    const plM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.06, 1.8), LM('#a8865c'), pl.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion();
    pl.forEach(([x, y, w, z], i) => { mm.compose(V(x, y, z), q, V(w - 0.04, 1, 1)); plM.setMatrixAt(i, mm); }); GP.add(plM);
    for (let i = 1; i < pl.length; i++) { const [x0, , w0, z0] = pl[i - 1], [x1, y1, , z1] = pl[i]; if (z0 === z1 || Math.abs(x1 - x0) > 2.1) continue; const zz = (z0 + z1) / 2, d = Math.abs(z1 - z0); const j = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, d + 0.2), LM('#a8865c')); j.position.set(x0 + w0 / 2, y1 - 0.005, zz); GP.add(j); }
    const LX = [-16, -8, 8, 18, 28, 38, 51, 60, 68, 82, 92.5].filter(x => !(x > 71 && x < 79) && !hit(x, 230.3, 0.5, 0.5));
    const poM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.06, 1.8, 6), LM(INK), LX.length), hdM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.24, 0.3, 0.24), LM('#ffd38a'), LX.length), capM = new THREE.InstancedMesh(new THREE.ConeGeometry(0.2, 0.16, 4), LM(INK), LX.length);
    LX.forEach((x, i) => { const z = 230.3, y = gAt(x, z); mm.compose(V(x, y + 0.9, z), q, V(1, 1, 1)); poM.setMatrixAt(i, mm); mm.compose(V(x, y + 1.95, z), q, V(1, 1, 1)); hdM.setMatrixAt(i, mm); mm.compose(V(x, y + 2.18, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, PI / 4, 0)), V(1, 1, 1)); capM.setMatrixAt(i, mm); lampPts.push(x, y + 1.95, z); ringC(x, z, 0.15); });
    GP.add(poM, hdM, capM);
    const glowT = CT(32, 32, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, W, W); });
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lampPts), 3)); LAMP = new THREE.Points(lg, new THREE.PointsMaterial({ map: glowT, size: 1.6, color: '#ffd38a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); LAMP.frustumCulled = false; LAMP.visible = false; GP.add(LAMP);
    const arrowT = (t, right) => CT(384, 64, (g, W, H) => { g.fillStyle = WHITE; g.beginPath(); if (right) { g.moveTo(0, 0); g.lineTo(W - 34, 0); g.lineTo(W, H / 2); g.lineTo(W - 34, H); g.lineTo(0, H); } else { g.moveTo(34, 0); g.lineTo(W, 0); g.lineTo(W, H); g.lineTo(34, H); g.lineTo(0, H / 2); } g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
      g.fillStyle = INK; g.font = '900 28px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(t, right ? 14 : 46, H / 2 + 2); });
    const aE = arrowT('BOAT HIRE \u00b7 JETTY JOBS', true), aW = arrowT('FISHERWOMAN \u00b7 REEL\u2019S', false);
    for (const x of [4.4, -4.4, 58.6]) { const z = 230.4, y = gAt(x, z); box(GP, 0.1, 2.4, 0.1, INK, x, y + 1.2, z); ringC(x, z, 0.15);
      const e = plane(GP, 1.5, 0.25, aE, x + 0.72, y + 2.05, z, 0); const w = plane(GP, 1.5, 0.25, aW, x - 0.72, y + 1.7, z, 0); e.material.side = w.material.side = THREE.DoubleSide; } }
  // ---------- places, talk + prompt ----------
  const ringAt = P => { for (const k in RINGS) { const [x, z] = RINGS[k]; if (Math.hypot(P.x - x, P.z - z) < 1.05 && Math.abs((P.y || 0) - ringY(k)) < 1.2) return GN[k]; } return null; };
  const nearF = P => Math.hypot(P.x - FISH[0], P.z - FISH[1]) < 2.6, nearW = P => Math.hypot(P.x - FW[0], P.z - FW[1]) < 2.6 && Math.abs((P.y || 0) - fws.position.y) < 1.5;
  const offFoot = P => P.boat || P.swim || P.ferry || P.car;
  function prompt(P) { if (busy || offFoot(P)) return null; const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(P)) return 'NOW HIRING \u00b7 JETTY JOBS'; if (nearF(P)) return 'TALK \u00b7 FISHERMAN'; if (nearW(P)) return 'TALK \u00b7 FISHERWOMAN'; return null; }
  const nextJob = () => { const d = done(); return (GAMES.find(q => !d[q.k]) || GAMES.slice().sort((a, c) => K.stars(a.k) - K.stars(c.k))[0]).k; };
  const rented = () => !!save.stat('m2BoatRented', false);
  const pearls = () => sayTo(kT, [ln('HULL PEARLS are the strongest material in the known universe.'), ln('They are also the POOP of our own SEA MONSTER!'), me('Wow. I knew poop could fertilise crops. I did not know it covered our starships!'),
    ln(rented() ? 'Yup, it is interesting! She is all yours, friend \u2014 the boat is waiting at the dock.' : 'Yup, it is interesting! By the way \u2014 do you want to rent the boat?')]);
  const rent = () => { if (freeRent && freeRent()) { save.setStat('m2BoatRented', true); sayTo(kT, [ln('Free for you, forever. Ace says so. She is at the dock.')]); return; } if (rented()) { sayTo(kT, [ln('She is already yours, friend. Waiting for you at the dock.')]); return; }
    sayTo(kT, [ln('Course you can. Let me find the paperwork.'), { ...ln('RENT the boat for 1 GOLD?'), choices: [{ text: 'YES', pick: () => { const paid = !!(save.spend && save.spend(1)); save.setStat('m2BoatRented', true); tone(1200, 0.04, 0.2);
      sayTo(kT, [ln(paid ? 'One gold. She is yours.' : '\u2026you have not got a coin on you, have you. Take her anyway \u2014 bring me one when you are richer.')]); } }, { text: 'NO', pick: () => sayTo(kT, [ln('Suit yourself. She will be here when you are ready.')]) }] }]); };
  const sub = () => sayTo(kT, [{ ...ln('Jetty jobs. Pick one, friend.'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => { if (!busy) startGame(q.k, lastP); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const HELLO = ['FREE FISHING here. And DIVE for HULL PEARLS. If you are brave enough to face NELLY.', 'Back on the jetty? Plenty to do.', 'Tide is in. Jobs are waiting, friend.', 'The lake keeps me busy. Want to help?'];
  const menu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(), lastP); } }, { text: 'JETTY JOBS', pick: () => sub() }, { text: 'WHAT ARE HULL PEARLS?', pick: () => pearls() }, { text: 'RENT BOAT', pick: () => rent() }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    let open = first ? HELLO[0] : HELLO[1 + (talked % 3)]; if (thanks) { open = thanks.gf && prizeLine ? prizeLine(thanks.gf, 'fish')[0] : 'Tidy work, friend. ' + Math.floor(thanks.gold) + ' gold. Again?'; thanks = null; } sayTo(kT, [{ ...ln(open), choices: ch }]); };
  const talkFW = () => { if (!talkedW++) { sayTo(wT, FW_STORY); return; }
    sayTo(wT, [{ ...lnW(done().nets ? 'Nets are tangled again. Nelly, I bet. Give me a hand?' : 'My nets are one big knot. Give me a hand?'), choices: [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame('nets', lastP); } }, { text: 'WHAT DID I MISS?', pick: () => sayTo(wT, FW_STORY) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); };
  function talk(P) { lastP = P; if (busy) return true; if (offFoot(P)) return false; const r = ringAt(P); if (r) { startGame(r.k, P); return true; }
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (nearF(P)) { tone(880, 0.05, 0.4); menu(!talked++); return true; } if (nearW(P)) { tone(990, 0.05, 0.4); talkFW(); return true; } return false; }
  function quit() { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  // ---------- per frame ----------
  const turnTo = (o, a, k) => { o.rotation.y += wrapA(a - o.rotation.y) * Math.min(1, k); };
  function tick(dt, P, fox) { if (!placed) place(); const t = performance.now() / 1000; lastP = P; toastT -= dt;
    const dE = Math.hypot(P.x - 80, P.z - 250), dW = Math.hypot(P.x + 16, P.z - 238); GE.visible = dE < (touch ? 90 : 140); GW.visible = dW < (touch ? 60 : 100);
    if (LAMP) { const h = hour(), n = h >= 19.5 || h < 6.5; LAMP.visible = n; }
    if (busy === 'job' && J) { const R = RINGS[J.g]; if (Math.hypot(P.x - R[0], P.z - R[1]) > 3) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (busy === 'job' && J) jobTick(dt, P);
    if (pilotOn() && fox) { const b = J.b; fox.position.set(b.x - Math.sin(b.yaw) * 0.3, 0.2 + Math.sin(t * 1.6) * 0.03, b.z - Math.cos(b.yaw) * 0.3); fox.rotation.y = b.yaw; }
    else if (busy === 'job' && J && fox && (J.g === 'engine' || J.g === 'nets' || J.g === 'bail' || J.g === 'winch' || camera.position.distanceTo(fox.position) < 2.8)) fox.visible = false;   // close-up jobs: never let the player fill the lens
    hintTick(t);
    if (GE.visible) { K.tick(dt, P, { inShop: Math.hypot(P.x - FISH[0], P.z - FISH[1]) < 7 && !offFoot(P), busy: !!busy, near: Math.hypot(P.x - FISH[0], P.z - FISH[1]), talking: false });
      const b = pilotOn() ? J.b : { x: PB_REST[0], z: PB_REST[1], yaw: PB_REST[2] }; PBD.position.set(b.x, 0.04 + Math.sin(t * 1.5 + 1) * 0.04, b.z); PBD.rotation.set(Math.sin(t * 1.2) * 0.02, b.yaw, Math.sin(t * 1.4) * 0.03);
      const wy = Math.max(0.05 + Math.sin(t * 1.6) * 0.04 + (J && J.g === 'winch' && J.surge > 0 ? 0.12 : 0), rampY(wdZ) + 0.12); WD.position.set(WX, wy, wdZ); WD.rotation.x = rampY(wdZ) + 0.12 > 0.05 ? Math.atan2(rampY(wdZ - 1) - rampY(wdZ + 1), 2) : Math.sin(t * 1.3) * 0.02;
      stretch(wRope, wv(wch, WX, 0.8, 238.4), V(WX, wy + 0.4, wdZ - 1.6));
      if (!(J && J.g === 'bail')) { RB.position.y = 0.02 + Math.sin(t * 1.4) * 0.035; RB.rotation.z = Math.sin(t * 1.1) * 0.03; }
      KEEPB.forEach((b2, i) => { if (b2.visible) b2.position.y = Math.sin(t * 1.7 + i) * 0.05; });
      FLAG.rotation.y += wrapA(Math.atan2(-flagW[1], flagW[0]) - FLAG.rotation.y) * Math.min(1, dt * 2); FLAGP.rotation.y = Math.sin(t * 7) * 0.12; }
    if (GW.visible) { const d = Math.hypot(P.x - FW[0], P.z - FW[1]); turnTo(fw, d < 6 ? Math.atan2(P.x - FW[0], P.z - FW[1]) : FWRY, dt * 3); kit.animFox(fw, dt, 0, false); } }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), GD, RINGS, fisher, fw, ringY,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    snap() { snapK = true; }, _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (busy === 'job' && J && lastP) jobTick(dt, lastP); }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), card, keys,
    dispose() { card.remove(); HINT.remove(); K.dispose(); } };
  window.__jettyJobs = API; return API;
}
