// MERU 2.0 — step 7: the SKATE PARK [skatePark] and TREAD'S TANK WORKS [treadTankWorks] + the TANK RANGE yard on the map.
// Built by the walk (worlds/meru2-walk.js). Data: YARDS in worlds/meru2-layout.js.
// SKATE PARK: fenced open-air concrete west of the ring road, the Ruins Path runs through it. Raised BOWL (bank ramp up to the deck),
// HALF-PIPE, FUNBOX, ledges, a manual pad, two yellow rails, a stair set with a handrail, graffiti walls, four floodlight masts.
// Every shape is a real height (walk up it, ride it). TONY by the street section (E · PLAY · SKATE PARK = the minigame) and the free
// BOARD by his rack: ride it anywhere on land (Game HUD vehicle 'skate': 1 WHACK · 2 TRICK · 3 OLLIE). Quarter pipes roll you back,
// a fast run up a lip launches you straight up and turns you round; land a trick mid-flip and you bail.
// TANK WORKS interior (tank on stands under a gantry, tread rolls, bench, pegboard, drums) with SGT. TREAD (E · PUT ME TO WORK).
// TANK RANGE hangar interior (range board = E · PLAY · TANK RANGE, benches, crates) + the outdoor range (sandbag line, targets, berm).
// The RANGE TANK outside the hangar: DRAFT rule, drive it once the range is passed (Game HUD vehicle 'tank': 1 ROCKET · 2 CANNON ·
// 3 TURBO, fireworks only, nothing breaks) inside the Barracks yard + the base road. The PLANET DEFENSE gate opens on the same rule.
import { vehicleKit } from '../engine/vehicle-kit.js';
import { WS } from '../engine/world-sfx.js?v=s713';   // s711 Runway sounds (audio/meru)
import { PLAYER_MALE } from '../fox-kit.js?v=s673';
import { applyPose, endPose, FOX_ANIMS } from '../engine/fox-poses.js?v=s648k';   // s620: Tony the coach is jointed
import { buildHangar } from '../minigames/meru/range-hangar.js';
import { buildYardDress } from './meru2-yardsdress.js';
import { shopKit } from './meru2-shopkit.js?v=s728';   // s728b also the Planet Defense bunker   // s728 Tank Range hangar is a full interior (keeper, cadets, chime, sun, lamps, clock, board)
export function buildYards({ THREE, scene, M, toon, grad, kit, cols, L, save, touch, audio = () => null, camera = null, hour = () => 12, isMuted = () => false }) {
  const Y = L.YARDS, SP = Y.skate, TY = Y.tank, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const tc = c => typeof c === 'string' ? toon(c) : c;
  const B = (w, h, d, col, x, y, z, ry = 0, o = 0.02, par) => { const m = M(new THREE.BoxGeometry(w, h, d), tc(col), x, y, z, par, o); m.rotation.y = ry; return m; };
  const C = (r, h, col, x, y, z, o = 0.02, par, n = 12) => M(new THREE.CylinderGeometry(r, r, h, n), tc(col), x, y, z, par, o);
  const box = (x0, x1, z0, z1) => { const c = { f: [x0, x1, z0, z1] }; cols.push(c); return c; }, ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const spots = [], keys = new Set(['tony', 'tread']), outs = [], groups = [], glows = [], pools = [];
  const glowTex = CT(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const glow = (x, y, z, s, col, par) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.position.set(x, y, z); sp.scale.set(s, s, 1); sp.visible = false; (par || scene).add(sp); glows.push(sp); return sp; };
  const pool = (x, z, s, par) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(s, s).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: glowTex, color: 0xffe2b0, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending })); p.position.set(x, 0.06, z); p.visible = false; (par || scene).add(p); pools.push(p); };
  const plate = (w, h, draw, par, x, y, z, ry = 0, both = true) => { const mat = new THREE.MeshBasicMaterial({ map: CT(Math.round(w * 64), Math.round(h * 64), draw) }), p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); p.position.set(x, y, z); p.rotation.y = ry; par.add(p); if (both) { const q = p.clone(); q.rotation.y = ry + Math.PI; par.add(q); } return p; };
  const fox = (key, opt, x, z, ry, par) => { const f = kit.makeFox({ key, ...opt }); f.position.set(x, 0, z); f.rotation.y = ry; par.add(f); ring(x, z, 0.45); const P = f.userData.P; if (P && P.sword) P.sword.visible = false; if (P && P.gun) P.gun.visible = false; outs.push({ f, x, z, yaw0: ry }); return f; };
  const VK = vehicleKit({ THREE, M, toon });
  const steel = toon('#9aa0a6'), ink = toon('#201e1d'), yel = toon('#ffd23a');
  const concT = CT(256, 256, (g, w, h) => { g.fillStyle = '#cbc4ba'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.09)' : 'rgba(60,50,40,0.08)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.strokeStyle = 'rgba(60,50,40,0.28)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h); });
  concT.wrapS = concT.wrapT = THREE.RepeatWrapping; concT.repeat.set(0.3, 0.3);
  const conc = new THREE.MeshToonMaterial({ gradientMap: grad, map: concT, side: THREE.DoubleSide });
  const mesh = (geo, mat, x, y, z, par, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; par.add(m); return m; };
  const rod = (ax, ay, az, bx, by, bz, r, mat, par) => { const a = new THREE.Vector3(ax, ay, az), b = new THREE.Vector3(bx, by, bz), d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; par.add(m); return m; };

  // =============================== SKATE PARK ===============================
  // s151: SP.course = the small yard is gone (Tony's Park, L.SKATEW, is the park): only Tony + his rack + the free board stand; heights come from the course (setParkH)
  let parkH = () => null; const PH = { fn: null };
  const park = new THREE.Group(); scene.add(park); groups.push({ g: park, cx: SP.course ? -237 : -205, cz: SP.course ? -60 : -3, r: 260 });
  if (!SP.course) { const bw = SP.bowl, pp = SP.pipe, fn = SP.fun, st = SP.stairs;
  bw.L = Math.sqrt(bw.R ** 2 - (bw.R - bw.H) ** 2); bw.ro = bw.r0 + bw.L + bw.deck; pp.L = Math.sqrt(pp.R ** 2 - (pp.R - pp.H) ** 2);
  const curve = (S, u) => S.R - Math.sqrt(Math.max(0, S.R * S.R - u * u));
  function bowlH(x, z) { const r = Math.hypot(x - bw.cx, z - bw.cz); if (r < bw.r0) return 0; const u = r - bw.r0; if (u < bw.L) return curve(bw, u); if (u < bw.L + bw.deck) return bw.H; const rz = z - (bw.cz + bw.ro); if (Math.abs(x - bw.cx) < 2 && rz >= -1 && rz < bw.ramp) return bw.H * (1 - Math.max(0, rz) / bw.ramp); return null; }
  function pipeH(x, z) { if (x < pp.x0 || x > pp.x1) return null; const dz = Math.abs(z - pp.cz); if (dz < pp.flat) return 0; const u = dz - pp.flat; if (u < pp.L) return curve(pp, u); if (u < pp.L + pp.deck) return pp.H; return null; }
  function funH(x, z) { const ax = fn.hw - Math.abs(x - fn.cx), az = fn.hd - Math.abs(z - fn.cz); if (ax < 0 || az < 0) return null; return fn.h * Math.min(1, ax / (fn.hw * 0.4), az / (fn.hd * 0.4)); }
  function stairH(x, z) { if (x < st.x0 || x > st.x1 || z < st.z0 || z > st.z1) return null; const i = Math.floor((z - st.z0) / st.run); return st.rise * Math.min(st.steps, i + 1); }
  const boxes = [...SP.ledges, SP.pad];
  const segD = (x, z, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, u = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1); return Math.hypot(x - ax - dx * u, z - az - dz * u); };
  const PR = [SP.rect[0] - 2, SP.rect[1] + 1, SP.rect[2] - 2, SP.rect[3] + 2];
  parkH = function (x, z) { if (x < PR[0] || x > PR[1] || z < PR[2] || z > PR[3]) return null; let h = null; const t = v => { if (v != null && (h == null || v > h)) h = v; };
    t(bowlH(x, z)); t(pipeH(x, z)); t(funH(x, z)); t(stairH(x, z)); for (const b of boxes) if (x >= b[0] && x <= b[1] && z >= b[2] && z <= b[3]) t(b[4]); for (const r of SP.rails) if (segD(x, z, r[0], r[1], r[2], r[3]) < 0.16) t(r[4]); return h; }
  // the bowl: lathe walls, floor, steel coping, a bank ramp up to its deck on the path side
  { const pts = [new THREE.Vector2(bw.r0, 0)]; for (let i = 1; i <= 16; i++) { const u = bw.L * i / 16; pts.push(new THREE.Vector2(bw.r0 + u, curve(bw, u))); } pts.push(new THREE.Vector2(bw.ro, bw.H), new THREE.Vector2(bw.ro, 0));
    mesh(new THREE.LatheGeometry(pts, touch ? 40 : 64), conc, bw.cx, 0, bw.cz, park); mesh(new THREE.CircleGeometry(bw.r0 + 0.05, 40).rotateX(-Math.PI / 2), conc, bw.cx, 0.03, bw.cz, park);
    mesh(new THREE.TorusGeometry(bw.r0 + bw.L, 0.07, 6, 64).rotateX(Math.PI / 2), steel, bw.cx, bw.H, bw.cz, park);
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(bw.ramp, 0); sh.lineTo(0, bw.H); sh.closePath(); mesh(new THREE.ExtrudeGeometry(sh, { depth: 4, bevelEnabled: false }), conc, bw.cx + 2, 0, bw.cz + bw.ro - 0.2, park, -Math.PI / 2); }
  // the half-pipe: two extruded quarters (curved face, deck, back wall), flat bottom, coping, deck rails
  { const sh = new THREE.Shape(); sh.moveTo(0, 0); for (let i = 1; i <= 16; i++) { const u = pp.L * i / 16; sh.lineTo(u, curve(pp, u)); } sh.lineTo(pp.L + pp.deck, pp.H); sh.lineTo(pp.L + pp.deck, 0); sh.closePath();
    const len = pp.x1 - pp.x0, g = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false }), mx = (pp.x0 + pp.x1) / 2;
    for (const s of [1, -1]) { mesh(g, conc, s > 0 ? pp.x1 : pp.x0, 0, pp.cz + s * pp.flat, park, s > 0 ? -Math.PI / 2 : Math.PI / 2);
      mesh(new THREE.CylinderGeometry(0.07, 0.07, len, 8).rotateZ(Math.PI / 2), steel, mx, pp.H, pp.cz + s * (pp.flat + pp.L), park);
      const rz = pp.cz + s * (pp.flat + pp.L + pp.deck - 0.12); rod(pp.x0, pp.H + 1, rz, pp.x1, pp.H + 1, rz, 0.04, ink, park); for (let x = pp.x0; x <= pp.x1 + 0.1; x += 6) rod(x, pp.H, rz, x, pp.H + 1, rz, 0.035, ink, park); }
    mesh(new THREE.PlaneGeometry(len, pp.flat * 2).rotateX(-Math.PI / 2), conc, mx, 0.03, pp.cz, park); }
  // funbox, ledges, manual pad, rails, stair set + handrail
  { const g = new THREE.CylinderGeometry(0.6, 1, 1, 4, 1); g.rotateY(Math.PI / 4); g.scale(fn.hw * Math.SQRT2, fn.h, fn.hd * Math.SQRT2); g.translate(0, fn.h / 2, 0); g.computeVertexNormals(); mesh(g, conc, fn.cx, 0, fn.cz, park);
    for (const [x0, x1, z0, z1, h] of boxes) { mesh(new THREE.BoxGeometry(x1 - x0, h, z1 - z0), conc, (x0 + x1) / 2, h / 2, (z0 + z1) / 2, park); if (h >= 0.5) mesh(new THREE.BoxGeometry(x1 - x0, 0.05, 0.08), steel, (x0 + x1) / 2, h, z0, park); }
    for (const [ax, az, bx, bz, h] of SP.rails) { rod(ax, h, az, bx, h, bz, 0.05, yel, park); for (const u of [0.08, 0.5, 0.92]) { const x = ax + (bx - ax) * u, z = az + (bz - az) * u; rod(x, 0, z, x, h, z, 0.04, yel, park); } }
    for (let i = 0; i < st.steps; i++) { const h = st.rise * (i + 1), z0 = st.z0 + st.run * i; mesh(new THREE.BoxGeometry(st.x1 - st.x0, h, st.run), conc, (st.x0 + st.x1) / 2, h / 2, z0 + st.run / 2, park); }
    const top = st.rise * st.steps, zt = st.z0 + st.run * st.steps, hx = (st.x0 + st.x1) / 2; mesh(new THREE.BoxGeometry(st.x1 - st.x0, top, st.z1 - zt), conc, hx, top / 2, (zt + st.z1) / 2, park);
    rod(hx, 0.9, st.z0 - 0.6, hx, top + 0.9, zt, 0.05, yel, park); rod(hx, 0, st.z0 - 0.6, hx, 0.9, st.z0 - 0.6, 0.04, yel, park); rod(hx, top, zt, hx, top + 0.9, zt, 0.04, yel, park); }
  // fence (chain link) with the three openings, the gate arch on the ring road side
  { const [x0, x1, z0, z1] = SP.rect, H = 2.4, link = CT(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(70,74,80,0.95)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke(); });
    link.wrapS = link.wrapT = THREE.RepeatWrapping; const lm = new THREE.MeshBasicMaterial({ map: link, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, color: 0xb0b6bc }), postP = [];
    const seg = (ax, az, bx, bz) => { const len = Math.hypot(bx - ax, bz - az); if (len < 0.5) return; const g = new THREE.PlaneGeometry(len, H), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 0.6, uv.getY(i) * H / 0.6); const m = new THREE.Mesh(g, lm); m.position.set((ax + bx) / 2, H / 2, (az + bz) / 2); m.rotation.y = Math.atan2(-(bz - az), bx - ax); park.add(m);
      rod(ax, H, az, bx, H, bz, 0.04, steel, park); for (let u = 0; u <= len + 0.01; u += 3) postP.push([ax + (bx - ax) * u / len, az + (bz - az) * u / len]); postP.push([bx, bz]);
      cols.push({ f: [Math.min(ax, bx) - 0.08, Math.max(ax, bx) + 0.08, Math.min(az, bz) - 0.08, Math.max(az, bz) + 0.08] }); };
    seg(x0, z0, x1, z0); seg(x0, z1, SP.openS[0], z1); seg(SP.openS[1], z1, x1, z1);
    seg(x0, z0, x0, SP.openW[0]); seg(x0, SP.openW[1], x0, z1); seg(x1, z0, x1, SP.openE[0]); seg(x1, SP.openE[1], x1, z1);
    const pi = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.05, H, 6), steel, postP.length), M4 = new THREE.Matrix4(); postP.forEach(([x, z], i) => { M4.makeTranslation(x, H / 2, z); pi.setMatrixAt(i, M4); }); park.add(pi);
    // gate arch: red pillars, a beam with the park sign, both faces
    const gz0 = SP.openE[0] - 0.6, gz1 = SP.openE[1] + 0.6; for (const z of [gz0, gz1]) { B(0.8, 5.2, 0.8, '#ec3013', x1, 2.6, z, 0, 0.02, park); ring(x1, z, 0.55); }
    B(0.7, 1.3, gz1 - gz0 + 0.8, '#201e1d', x1, 5.6, 0, 0, 0.02, park);
    plate(gz1 - gz0 - 0.6, 1.0, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 18, h); g.fillStyle = '#ffffff'; g.font = '900 ' + Math.round(h * 0.62) + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('SKATE PARK', 40, h * 0.54); }, park, x1 + 0.37, 5.6, 0, Math.PI / 2);
    // NOW HIRING by the gate (the walk's hotspot sits here)
    { const F = [1, 0], ang = Math.atan2(F[0], F[1]), hx = x1 + Math.cos(ang) * 4.2 + F[0] * 1.4, hz = -Math.sin(ang) * 4.2 + F[1] * 1.4; C(0.07, 1.6, '#201e1d', hx, 0.8, hz, 0.01, park, 6);
      plate(2.2, 0.82, (g, w, h) => { g.fillStyle = '#16a34a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = '900 ' + Math.round(h * 0.38) + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('NOW', 14, h * 0.3); g.fillText('HIRING', 14, h * 0.72); }, park, hx, 2.0, hz, Math.PI / 2); } }
  // graffiti walls (both faces), floodlight masts
  { const tag = (word, cols4) => (g, w, h) => { g.fillStyle = '#8f8a84'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 2, h);
      for (let i = 0; i < 6; i++) { g.fillStyle = cols4[i % 4]; g.globalAlpha = 0.55; g.beginPath(); g.arc(Math.random() * w, h * (0.3 + Math.random() * 0.5), 20 + Math.random() * 50, 0, 7); g.fill(); } g.globalAlpha = 1;
      g.font = 'italic 900 ' + Math.round(h * 0.78) + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; const tw = g.measureText(word).width, x = (w - tw) / 2; g.lineJoin = 'round';
      g.lineWidth = h * 0.16; g.strokeStyle = '#201e1d'; g.strokeText(word, x + 8, h * 0.56 + 6); g.lineWidth = h * 0.09; g.strokeStyle = '#ffffff'; g.strokeText(word, x, h * 0.56);
      const gr = g.createLinearGradient(0, h * 0.2, 0, h * 0.9); gr.addColorStop(0, cols4[0]); gr.addColorStop(1, cols4[1]); g.fillStyle = gr; g.fillText(word, x, h * 0.56);
      g.fillStyle = cols4[1]; for (let i = 0; i < 14; i++) { const dx = x + Math.random() * tw; g.fillRect(dx, h * 0.8, 4, 10 + Math.random() * h * 0.18); } };
    const wall = (x0, x1, z0, z1, word, c4) => { const len = Math.max(x1 - x0, z1 - z0), along = x1 - x0 > z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; B(along ? len : 0.4, 3.2, along ? 0.4 : len, '#8f8a84', cx, 1.6, cz, 0, 0.02, park); box(x0, x1, z0, z1);
      const ry = along ? 0 : Math.PI / 2, nx = along ? 0 : 0.21, nz = along ? 0.21 : 0, d = tag(word, c4); plate(len - 0.2, 3.0, d, park, cx + nx, 1.6, cz + nz, ry, false); plate(len - 0.2, 3.0, d, park, cx - nx, 1.6, cz - nz, ry + Math.PI, false); };
    wall(-214, -186, -48.8, -48.4, 'MERU', ['#ffd23a', '#ec3013', '#38bdf8', '#22c55e']); wall(-238.8, -238.4, -40, -14, 'SKATE', ['#38bdf8', '#2e4a6b', '#ffd23a', '#f472b6']);
    for (const [x, z] of SP.masts) { C(0.16, 11, '#3d3b3a', x, 5.5, z, 0.02, park, 8); ring(x, z, 0.35); const a = Math.atan2(-205 - x, -3 - z), hx = x + Math.sin(a) * 0.5, hz = z + Math.cos(a) * 0.5; const hd = B(1.6, 0.7, 0.4, '#201e1d', hx, 11, hz, a, 0.02, park); hd.rotation.x = 0.5;
      glow(hx + Math.sin(a) * 0.3, 10.8, hz + Math.cos(a) * 0.3, 5, 0xfff2d0, park); pool(x + Math.sin(a) * 12, z + Math.cos(a) * 12, 26, park); } } }
  else parkH = (x, z) => (PH.fn ? PH.fn(x, z) : null);
  let TONYF = null;
  // s620 TONY THE COACH (jointed): a real WAVE when you walk up, then a coach's loop while you are about (hands on hips, points out a line,
  // thinks, nods); stands easy + faces you when you are right next to him; nothing when you are far (endPose)
  // s620b the same poser drives SGT. TREAD in the Tank Works (mechanic loop: inspect a part, wipe, hips, think)
  const mkPoser = TL => { const TS = { a: null, t: 0, k: 0, i: 0, wave: 0, hi: false }; return (F, dt, d) => { if (!F.userData.P || !F.userData.P.fore) return;
    if (d < 7 && !TS.hi) { TS.hi = true; TS.wave = 2.6; } else if (d > 16) TS.hi = false;
    let name = null; if (TS.wave > 0) { TS.wave -= dt; name = 'wave'; } else if (d >= 2.6 && d < 40) name = TL[TS.i];
    if (!name || !FOX_ANIMS[name]) { TS.k = Math.max(0, TS.k - dt * 3); if (TS.a) { if (TS.k <= 0) { endPose(F); TS.a = null; } else applyPose(THREE, F, TS.a, TS.t, TS.k); } return; }
    if (name !== TS.a) { TS.a = name; TS.t = 0; } TS.t += dt;
    if (name !== 'wave' && TS.t >= FOX_ANIMS[name].dur) { TS.i = (TS.i + 1) % TL.length; TS.a = TL[TS.i]; TS.t = 0; }
    TS.k = Math.min(1, TS.k + dt * 3); applyPose(THREE, F, TS.a, TS.t, TS.k); }; };
  const tonyPose = mkPoser(['hips', 'point', 'hips', 'nod', 'think']), treadPose = mkPoser(['k_inspect', 'bar_wipe', 'hips', 'k_inspect', 'think']); let TREADF = null;
  // TONY (look from the Skate Park game) by the street section, his board rack, the free board
  const RACK = { x: SP.rack[0], z: SP.rack[1] };
  { const T = L.SPEAKERS.find(s => s.key === 'tony'), [tx, tz] = T ? T.at : [-190, -20];
    const TONY_LOOK = { ...PLAYER_MALE, fur: '#f4f7fa', furDark: '#c9d3dc', muzzle: '#ffffff', chin: '#ffffff', snout: '#eef3f7', paw: '#e9eef2', tailBase: '#dfe6ec', tailMid: '#f4f7fa', tailTip: '#ffffff', ear: '#3b4654', earInner: '#c7a1b4', fluff: '#ffffff', leg: '#3a3836', boot: '#201e1d' };
    TONYF = fox('tony', { look: TONY_LOOK, torso: ['#ec3013', '#201e1d', '#f3f2f2'], outfit: 'vest', crest: '', gear: 'none', eyes: ['#7dd3fc', '#7dd3fc'], mood: 'neutral', joints: true }, tx, tz, 0, park);
    const hire = L.BUILDINGS.find(b => b.key === 'skateGate') || { hiring: { url: 'Skate Park.dc.html?embed=1' } }; spots.push({ key: 'tonySkate', x: tx, z: tz + 1.4, r: 2.2, prompt: 'PLAY \u00b7 SKATE PARK', play: { label: 'SKATE PARK', url: hire.hiring.url } });
    B(3, 0.1, 0.5, '#201e1d', RACK.x, 0.05, RACK.z, 0, 0.01, park); for (const s of [-1.45, 1.45]) B(0.1, 1.5, 0.5, '#201e1d', RACK.x + s, 0.75, RACK.z, 0, 0.01, park); B(3, 0.08, 0.08, '#201e1d', RACK.x, 1.45, RACK.z - 0.22, 0, 0, park);
    ['#ec3013', '#38bdf8', '#ffd23a', '#22c55e'].forEach((c, i) => { const d = B(0.32, 1.25, 0.04, c, RACK.x - 1.05 + i * 0.7, 0.8, RACK.z + 0.1, 0, 0.01, park); d.rotation.x = -0.18; }); box(RACK.x - 1.55, RACK.x + 1.55, RACK.z - 0.3, RACK.z + 0.3); }
  const BSC = 1.6, board = VK.make('skate'), BV = board.userData.V; board.scale.setScalar(BSC); board.rotation.order = 'YXZ'; scene.add(board);
  const MODS = { wheelK: 1, pads: false };   // s50 Skate Shop prizes: speed wheels + knee pads
  const SK = { on: false, x: RACK.x + 2.4, z: RACK.z + 1.6, y: 0, yaw: 0.4, speed: 0, vy: 0, air: false, vert: false, flip: 0, tricks: 0, whack: 0, pts: 0, roll: null };
  const placeBoard = () => { board.position.set(SK.x, SK.y, SK.z); board.rotation.set(0, SK.yaw, 0); BV.deck.rotation.z = SK.flip > 0 ? (1 - SK.flip / 0.45) * Math.PI * 2 : 0; BV.body.rotation.y = SK.whack > 0 ? (1 - SK.whack / 0.4) * Math.PI * 2 : 0; };
  placeBoard();

  // =============================== TANK WORKS + TANK RANGE ===============================
  const TW = { K: null, box: null };   // s728l Tank Works room life
  const RG = { K: null, spin: [], box: null, sync: null, was: false };   // s728 Tank Range hangar life
  const DF = { K: null, spin: [], box: null, blip: null, link: null, mk: null, ledA: null, ledB: null, t: 0 };   // s728b Planet Defense bunker life
  const room = key => { const b = L.BUILDINGS.find(q => q.key === key), g = new THREE.Group(); scene.add(g); groups.push({ g, cx: (b.f[0] + b.f[1]) / 2, cz: (b.f[2] + b.f[3]) / 2, r: 80 }); return { b, g }; };
  const tintTank = (root, map) => root.traverse(m => { if (m.isMesh && m.material && m.material.color && map[m.material.color.getHexString()]) { m.material = m.material.clone(); m.material.color.set(map[m.material.color.getHexString()]); } });
  // TREAD'S TANK WORKS (f 70..120 × -430..-390, door W at z -410): a tank up on stands under a yellow gantry, hazard bay, bench + pegboard, tread rolls, drums
  { const { b, g } = room('tankWorks'), [x0, x1, z0, z1] = b.f, W = TY.works, [tx, tz] = W.at;
    const haz = CT(256, 256, (q, w, h) => { q.fillStyle = '#ffd23a'; q.fillRect(0, 0, w, h); q.fillStyle = '#201e1d'; for (let i = -h; i < w; i += 48) { q.beginPath(); q.moveTo(i, 0); q.lineTo(i + 24, 0); q.lineTo(i + 24 + h, h); q.lineTo(i + h, h); q.fill(); } });
    for (const [w, d, x, z] of [[14, 0.5, tx, tz - 5], [14, 0.5, tx, tz + 5], [0.5, 10, tx - 7, tz], [0.5, 10, tx + 7, tz]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: haz })); p.position.set(x, 0.06, z); g.add(p); }
    for (const [sx, sz] of [[-2, -1.2], [2, -1.2], [-2, 1.2], [2, 1.2]]) { const ax = tx + sx, az = tz + sz; B(0.6, 0.6, 0.6, '#ec3013', ax, 0.3, az, 0, 0.01, g); C(0.12, 0.3, '#9aa0a6', ax, 0.75, az, 0.01, g, 8); }
    const tank = VK.make('tank'); tank.position.set(tx, 0.85, tz); tank.rotation.y = W.yaw; g.add(tank); box(tx - 3.2, tx + 3.2, tz - 1.9, tz + 1.9);
    if (tank.userData.V && tank.userData.V.turret) tank.userData.V.turret.rotation.y = 0.6;
    for (const s of [-1, 1]) { B(0.4, 7.5, 0.4, '#ffd23a', tx + s * 5.5, 3.75, tz - 3.6, 0, 0.02, g); B(0.4, 7.5, 0.4, '#ffd23a', tx + s * 5.5, 3.75, tz + 3.6, 0, 0.02, g); B(0.4, 0.5, 7.6, '#ffd23a', tx + s * 5.5, 7.6, tz, 0, 0.02, g); ring(tx + s * 5.5, tz - 3.6, 0.35); ring(tx + s * 5.5, tz + 3.6, 0.35); }
    B(11.4, 0.6, 0.5, '#ffd23a', tx, 7.9, tz, 0, 0.02, g); B(0.8, 0.6, 0.9, '#201e1d', tx - 0.6, 7.4, tz, 0, 0.01, g); rod(tx - 0.6, 7.1, tz, tx - 0.6, 3.6, tz, 0.02, ink, g); C(0.18, 0.25, '#ec3013', tx - 0.6, 3.5, tz, 0.01, g, 8);
    // bench + pegboard on the north wall, tool silhouettes, a spare turret on a pallet, tread rolls, drums, parts shelves
    B(10, 1.0, 1.1, '#5c4430', 85, 0.5, z0 + 1.1, 0, 0.02, g); box(80, 90, z0 + 0.5, z0 + 1.7); B(10, 0.08, 1.15, '#3d3b3a', 85, 1.04, z0 + 1.1, 0, 0, g);
    plate(10, 2.6, (q, w, h) => { q.fillStyle = '#c9a86a'; q.fillRect(0, 0, w, h); q.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) q.fillRect(x, y, 3, 3); q.fillStyle = '#201e1d'; for (let i = 0; i < 11; i++) { const x = 30 + i * 56; q.fillRect(x, 30, 8, 60 + (i % 3) * 20); q.fillRect(x - 10, 30, 28, 12); } q.fillStyle = '#ec3013'; q.fillRect(0, h - 26, w, 26); }, g, 85, 2.6, z0 + 0.45, 0, false);
    B(2.4, 0.3, 2.4, '#a07a52', 84, 0.15, z1 - 6, 0, 0.01, g); C(1.0, 0.6, '#5b6b3a', 84, 0.6, z1 - 6, 0.03, g, 18); rod(84, 0.9, z1 - 6, 86.4, 0.9, z1 - 6, 0.12, toon('#3f4a28'), g); ring(84, z1 - 6, 1.4);
    for (let i = 0; i < 3; i++) { const m = C(0.9, 1.6, '#1f2023', 113, 0.9 + (i === 2 ? 1.6 : 0), z0 + 6 + (i === 2 ? 1 : i * 2), 0.02, g, 16); m.rotation.x = Math.PI / 2; } box(112, 114.8, z0 + 4, z0 + 9);
    for (const [x, z, c] of [[116, z1 - 4, '#2e4a6b'], [117.2, z1 - 4.2, '#ec3013'], [116.5, z1 - 5.3, '#2e4a6b']]) { C(0.42, 1.2, c, x, 0.6, z, 0.02, g, 12); } box(115.4, 118, z1 - 5.9, z1 - 3.4);
    for (const z of [z0 + 14, z0 + 22]) { B(0.9, 3, 5, '#3d3b3a', x1 - 1.1, 1.5, z, 0, 0.02, g); for (let y = 0.6; y < 3; y += 0.8) for (let k = -2; k <= 2; k++) B(0.6, 0.35, 0.7, ['#5b6b3a', '#9aa0a6', '#c9a86a'][(k + 9) % 3], x1 - 1.1, y, z + k * 0.95, 0, 0.01, g); box(x1 - 1.6, x1 - 0.5, z - 2.5, z + 2.5); }
    for (const [x, z] of [[85, -420], [105, -420], [85, -400], [105, -400]]) { B(3.2, 0.12, 0.5, '#f3f2f2', x, 7.0, z, 0, 0, g); glow(x, 6.8, z, 3.5, 0xffffff, g); }
    // s727i (Ben: "pretty empty"): fill the west half + walls, walkway door (x 70, z -410) → Tread kept clear (z -413..-406)
    { const LN = (w, d, x, z, c = '#ffd23a') => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: c })); p.position.set(x, 0.055, z); g.add(p); };
      LN(24, 0.25, 82, -413.4); LN(24, 0.25, 82, -406.6); for (let x = 73; x < 93; x += 3) LN(1.2, 0.25, x, -410, '#f3f2f2');   // painted walkway from the door
      // BAY 2: a stripped hull (no turret) on stands, hazard frame, engine on a stand, road wheels stacked
      const hb = [84, -423]; for (const [w, d, x, z] of [[11, 0.4, hb[0], hb[1] - 4], [11, 0.4, hb[0], hb[1] + 4], [0.4, 8, hb[0] - 5.5, hb[1]], [0.4, 8, hb[0] + 5.5, hb[1]]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: haz })); p.position.set(x, 0.06, z); g.add(p); }
      for (const [sx, sz] of [[-2, -1.2], [2, -1.2], [-2, 1.2], [2, 1.2]]) B(0.6, 0.7, 0.6, '#2e4a6b', hb[0] + sx, 0.35, hb[1] + sz, 0, 0.01, g);
      const hull = VK.make('tank'); hull.position.set(hb[0], 0.95, hb[1]); hull.rotation.y = Math.PI / 2; g.add(hull); if (hull.userData.V && hull.userData.V.turret) hull.userData.V.turret.visible = false;
      tintTank(hull, { '5b6b3a': '#8a9178', '4b5a30': '#7a8068' }); box(hb[0] - 3.3, hb[0] + 3.3, hb[1] - 2, hb[1] + 2);
      B(0.5, 0.06, 0.5, '#ffd23a', hb[0], 1.75, hb[1] - 0.3, 0, 0, g);   // open turret ring cover
      { const ex = 92, ez = -424; B(0.2, 1.1, 1.6, '#3d3b3a', ex, 0.55, ez, 0, 0.01, g); B(1.6, 1.0, 1.2, '#4b5563', ex, 1.6, ez, 0, 0.02, g); for (let k = -1; k <= 1; k++) C(0.14, 0.5, '#9aa0a6', ex + k * 0.45, 2.35, ez, 0.01, g, 8); ring(ex, ez, 1.1); }
      for (let i = 0; i < 4; i++) { const m = C(0.55, 0.32, '#1f2023', 76.5, 0.16 + i * 0.33, -426, 0.02, g, 14); m.rotation.y = i * 0.4; } C(0.2, 0.06, '#9aa0a6', 76.5, 1.48, -426, 0, g, 10); ring(76.5, -426, 0.7);
      // COMPRESSOR + hose reel by the door (north side), PALLETS of crates (south-west corner)
      B(1.4, 1.1, 0.9, '#ec3013', 72.2, 0.55, -419, 0, 0.02, g); C(0.38, 1.3, '#d9d6cf', 72.2, 0.75, -420.6, 0.02, g, 12).rotation.z = Math.PI / 2; C(0.4, 0.2, '#201e1d', 72.2, 1.5, -417.6, 0.01, g, 14).rotation.x = Math.PI / 2; box(71.3, 73.2, -421.4, -417.2);
      for (const [x, z, n] of [[74, -394, 3], [77.6, -394, 2], [74, -397.4, 1]]) { B(2.4, 0.16, 2.4, '#a07a52', x, 0.08, z, 0, 0.01, g); for (let k = 0; k < n; k++) B(2.0, 0.9, 2.0, k % 2 ? '#7a5236' : '#8b6a48', x, 0.61 + k * 0.92, z, k * 0.12, 0.02, g); box(x - 1.2, x + 1.2, z - 1.2, z + 1.2); }
      // TOOL CABINETS along the south wall, WELDING bay with curtains near the drums
      for (let i = 0; i < 5; i++) { const x = 84 + i * 1.3; B(1.2, 1.5, 0.7, '#c42d2d', x, 0.75, -390.7, 0, 0.02, g); for (let k = 0; k < 4; k++) B(1.0, 0.04, 0.02, '#e5e7eb', x, 0.35 + k * 0.32, -391.07, 0, 0, g); } box(83.3, 90.2, -391.2, -390); B(6.6, 0.06, 0.72, '#3d3b3a', 86.6, 1.53, -390.7, 0, 0, g);
      { const wx = 106, wz = -395.5; for (const [a, b2] of [[-2, 0], [2, 0]]) { B(0.06, 2.0, 2.6, '#b45309', wx + a, 1.2, wz + b2, 0, 0, g); B(0.1, 0.1, 2.7, '#3d3b3a', wx + a, 2.25, wz + b2, 0, 0, g); } B(4, 0.06, 0.06, '#3d3b3a', wx, 2.25, wz - 1.3, 0, 0, g);
        B(0.8, 0.9, 0.6, '#2e4a6b', wx, 0.45, wz + 0.4, 0, 0.02, g); for (const s of [-0.18, 0.18]) C(0.12, 1.1, '#3f7a52', wx + s, 1.45, wz + 0.4, 0.01, g, 8); B(1.6, 0.85, 1.0, '#3d3b3a', wx, 0.43, wz - 0.6, 0, 0.02, g); ring(wx, wz, 2.2); }
      // OVERHEAD CRANE: two runway beams the length of the shop + a travelling bridge with its hook over bay 2
      for (const z of [z0 + 2, z1 - 2]) B(48, 0.5, 0.4, '#ffd23a', (x0 + x1) / 2, 8.4, z, 0, 0.02, g); B(0.6, 0.5, z1 - z0 - 4, '#ffd23a', hb[0], 7.95, (z0 + z1) / 2, 0, 0.02, g); B(1.0, 0.6, 1.0, '#201e1d', hb[0], 7.5, hb[1], 0, 0.01, g); rod(hb[0], 7.2, hb[1], hb[0], 3.9, hb[1], 0.025, ink, g); C(0.16, 0.3, '#ec3013', hb[0], 3.75, hb[1], 0.01, g, 8);   // under the 9 m roof
      // WALL: big parts chart on the west wall north of the door, a NOW HIRING board by the door (starts the job, interior rule)
      plate(6, 2.4, (q, w, h) => { q.fillStyle = '#201e1d'; q.fillRect(0, 0, w, h); q.strokeStyle = '#f3f2f2'; q.lineWidth = 4; q.strokeRect(10, 10, w - 20, h - 20); q.fillStyle = '#ffd23a'; q.font = '900 44px Archivo, sans-serif'; q.textBaseline = 'top'; q.fillText('TREAD CHART', 26, 22); q.fillStyle = '#f3f2f2'; q.font = '700 26px Archivo, sans-serif'; ['HULL', 'TURRET', 'TRACKS', 'ENGINE', 'GUN'].forEach((t, i) => { q.fillText(t, 26, 86 + i * 30); q.fillStyle = i % 2 ? '#ec3013' : '#7dff6a'; q.fillRect(200, 92 + i * 30, 120 + i * 40, 14); q.fillStyle = '#f3f2f2'; }); }, g, x0 + 0.45, 3.2, -421, Math.PI / 2, false);
      plate(2.4, 1.2, (q, w, h) => { q.fillStyle = '#16a34a'; q.fillRect(0, 0, w, h); q.fillStyle = '#ffffff'; q.font = '900 72px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillText('NOW HIRING', 22, h / 2); }, g, x0 + 0.45, 1.9, -404.5, Math.PI / 2, false);
      spots.push({ key: 'tankHire', x: x0 + 1.6, z: -404.5, r: 1.8, prompt: 'NOW HIRING \u00b7 TANK WORKS JOB', play: { label: b.label.toUpperCase(), url: b.hiring.url } });
      for (const [x, z] of [[75, -420], [75, -400], [115, -420], [115, -400]]) { B(3.2, 0.12, 0.5, '#f3f2f2', x, 7.0, z, 0, 0, g); glow(x, 6.8, z, 3.5, 0xffffff, g); } }
    const tr = L.SPEAKERS.find(s => s.key === 'tread'), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, ttx = cx + (tr ? tr.at.x : 0), ttz = cz + (tr ? tr.at.z : -6);
    TREADF = fox('tread', { look: PLAYER_MALE, torso: ['#4b5563', '#e5e7eb', '#1f2937'], outfit: 'armor', gear: 'none', mood: 'happy', joints: true }, ttx, ttz, -Math.PI / 2, g);
    spots.push({ key: 'tankJob', x: ttx - 1.4, z: ttz, r: 2.2, prompt: 'PUT ME TO WORK \u00b7 TANK WORKS JOB', play: { label: b.label.toUpperCase(), url: b.hiring.url } });
    // s728l room life (shopKit, no keeper: Tread keeps his own work idles): mechanics browse by hour, door chime, door sun + motes, night lamps / corners, clock over the door
    TW.K = shopKit({ THREE, G: g, scene, kit, save, camera, touch, hour, isMuted, prefix: 'mtw', color: '#4b5563', boardTitle: 'TANK WORKS', room: { X0: x0, X1: x1, Z0: z0, Z1: z1 }, door: [70.6, -410],
      sun: [{ x: 72.6, z: -410, w: 3, d: 2.8 }], lamps: [[85, 6.8, -420], [105, 6.8, -420], [85, 6.8, -400], [105, 6.8, -400], [75, 6.8, -420], [75, 6.8, -400], [115, 6.8, -420], [115, 6.8, -400]],
      browse: [[85, -427.6, Math.PI], [86.6, -392, 0], [93.4, -424, -Math.PI / 2], [117.3, -416, Math.PI / 2], [111.2, -422.5, Math.PI / 2], [84, -418.6, Math.PI]], clock: { x: 70.45, y: 5.0, z: -410, ry: Math.PI / 2 },
      looks: [['#4b5563', '#e5e7eb', '#1f2937'], ['#5b6b3a', '#e5e7eb', '#3f4a28'], ['#c2410c', '#f3f2f2', '#431407']] }); TW.box = [x0, x1, z0, z1]; }
  // TANK RANGE hangar (f 150..200 × -440..-405, door S at x 175): the game's hangar + blackboards, crates, target rack
  { const { b, g } = room('tankRange'), [x0, x1, z0, z1] = b.f, cx = (x0 + x1) / 2;
    // the game's own hangar + both chalk blackboards (minigames/meru/range-hangar.js), back wall on the shell's north wall, boards by the door
    const H = buildHangar({ THREE, M, toon, glowTex, scene: g, origin: { x: cx, z: z0 + 119 }, mounted: true });
    for (const Bd of H.BOARDS) { const p = H.world(Bd.x, Bd.z), dx = Math.cos(Bd.yaw) * 2.6, dz = -Math.sin(Bd.yaw) * 2.6; for (const k of [-1, 0, 1]) ring(p.x + dx * k, p.z + dz * k, 0.9); }
    for (const sx of [-1, 1]) { const r = H.world(sx * 15, -106); box(r.x - 0.6, r.x + 0.6, r.z - 1.8, r.z + 1.8); const d = H.world(sx * 13.5, -113); box(d.x - 0.5, d.x + 0.5, d.z - 1.6, d.z + 1.6); }
    { const p = H.world(0, -90); spots.push({ key: 'rangePlay', x: p.x, z: p.z, r: 2.6, prompt: 'PLAY \u00b7 TANK RANGE', play: { label: 'TANK RANGE', url: b.hiring.url } }); }
    for (const [x, z] of [[x0 + 3, z0 + 3], [x0 + 4.4, z0 + 3], [x0 + 3.7, z0 + 3, 1], [x1 - 3, z0 + 3], [x1 - 4.4, z0 + 3]]) B(1.3, 0.9, 1.1, '#5b6b3a', x, 0.45, z, 0.1, 0.02, g); box(x0 + 2, x0 + 5.2, z0 + 2.3, z0 + 3.7); box(x1 - 5.2, x1 - 2, z0 + 2.3, z0 + 3.7);
    for (let i = 0; i < 4; i++) { const x = x1 - 2, z = z1 - 9 + i * 1.6; rod(x, 0, z, x, 1.6, z, 0.04, ink, g); C(0.55, 0.06, i % 2 ? '#f3f2f2' : '#ec3013', x, 1.9, z, 0.01, g, 16).rotation.z = Math.PI / 2; } box(x1 - 2.6, x1 - 1.4, z1 - 9.6, z1 - 3.6);
    // s728 FULL INTERIOR (BUILD_PLAN interiors #1, was 4.3 props / 100 m²). Walkway door (175, -405) → PLAY spot (175, -411) → training bay kept clear (x 171..179).
    const IM = (geo, col, list, par = g) => { const im = new THREE.InstancedMesh(geo, tc(col), list.length), o3 = new THREE.Object3D(); list.forEach(([x, y, z, ry = 0, rx = 0, rz = 0], i) => { o3.position.set(x, y, z); o3.rotation.set(rx, ry, rz); o3.updateMatrix(); im.setMatrixAt(i, o3.matrix); }); im.castShadow = !touch; im.receiveShadow = true; par.add(im); return im; };
    const LN = (w, d, x, z, c = '#ffd23a', ry = 0) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: c })); p.position.set(x, 0.055, z); p.rotation.y = ry; g.add(p); return p; };
    const sign = (w, h, title, sub, bg, x, y, z, ry) => plate(w, h, (q, W, Hh) => { q.fillStyle = bg; q.fillRect(0, 0, W, Hh); q.fillStyle = '#ffffff'; q.font = '900 ' + Math.round(Hh * 0.34) + 'px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillText(title, 18, Hh * 0.36); if (sub) { q.fillStyle = '#ffd23a'; q.font = '800 ' + Math.round(Hh * 0.17) + 'px Archivo, sans-serif'; q.fillText(sub, 18, Hh * 0.74); } q.fillStyle = '#201e1d'; q.fillRect(0, Hh - 8, W, 8); }, g, x, y, z, ry, false);
    // painted walkway: two yellow edge lines + white chevrons from the door to the bay
    LN(0.25, 16, 171, -413.5); LN(0.25, 16, 179, -413.5); for (let z = -407; z > -421; z -= 2.6) for (const s of [-1, 1]) LN(1.6, 0.22, 175 + s * 0.65, z, '#f3f2f2', s * 0.6);
    // TRAINING BAY: the cadets' tank on chocks (look, don't drive), tie-down rings, cones at the bay mouth, BAY 1 floor plate
    { const tk = VK.make('tank'); tk.position.set(175, 0.12, -429.5); g.add(tk); if (tk.userData.V && tk.userData.V.turret) tk.userData.V.turret.rotation.y = -0.35; tintTank(tk, { '5b6b3a': '#6f7d44' }); box(173, 177, -432.8, -426.2);
      IM(new THREE.BoxGeometry(0.5, 0.22, 0.5), '#ffd23a', [[172.6, 0.11, -432.6], [177.4, 0.11, -432.6], [172.6, 0.11, -426.4], [177.4, 0.11, -426.4]]);
      IM(new THREE.TorusGeometry(0.16, 0.035, 6, 14), '#9aa0a6', [[170.8, 0.04, -435.5, 0, Math.PI / 2], [179.2, 0.04, -435.5, 0, Math.PI / 2], [170.8, 0.04, -423.5, 0, Math.PI / 2], [179.2, 0.04, -423.5, 0, Math.PI / 2], [170.8, 0.04, -429.5, 0, Math.PI / 2], [179.2, 0.04, -429.5, 0, Math.PI / 2]]);
      const cone = [[169.8, -421.8], [180.2, -421.8], [169.8, -436.6], [180.2, -436.6]]; IM(new THREE.ConeGeometry(0.26, 0.75, 12), '#f97316', cone.map(([x, z]) => [x, 0.4, z])); IM(new THREE.CylinderGeometry(0.17, 0.2, 0.12, 12), '#f3f2f2', cone.map(([x, z]) => [x, 0.45, z])); IM(new THREE.BoxGeometry(0.6, 0.05, 0.6), '#201e1d', cone.map(([x, z]) => [x, 0.025, z])); cone.forEach(([x, z]) => ring(x, z, 0.32));
      const fp = plate(3.2, 0.8, (q, W, Hh) => { q.fillStyle = '#ffd23a'; q.fillRect(0, 0, W, Hh); q.fillStyle = '#201e1d'; q.font = '900 ' + Math.round(Hh * 0.6) + 'px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillText('BAY 1', 16, Hh * 0.54); }, g, 175, 0.06, -422.6, 0, false); fp.rotation.x = -Math.PI / 2;
      // rotating amber beacon on a post by the bay (turns while the hangar is open)
      rod(169.4, 0, -425, 169.4, 3.2, -425, 0.06, ink, g); const bc = new THREE.Group(); bc.position.set(169.4, 3.35, -425); g.add(bc); M(new THREE.CylinderGeometry(0.2, 0.22, 0.3, 12), toon('#f59e0b'), 0, 0, 0, bc, 0.01); M(new THREE.BoxGeometry(0.36, 0.14, 0.06), new THREE.MeshBasicMaterial({ color: 0xfff1a0 }), 0, 0, 0.2, bc, 0); ring(169.4, -425, 0.2); RG.spin.push([bc, 3.2, 'y']); }
    // WEST WING: cadet LOCKERS + bench, two SHELL RACKS (practice rounds), water cooler, waiting bench, ammo crates by the door, EAR DEFENDERS rack
    { const LZ = [...Array(10)].map((_, i) => -433.5 + i * 1.05); for (const z of LZ) B(0.6, 2.1, 1.0, '#6b7a5a', 150.6, 1.05, z, 0, 0.02, g); box(150.2, 151.0, -434.1, -423.5);
      IM(new THREE.BoxGeometry(0.02, 0.05, 0.6), '#3a4430', LZ.flatMap(z => [1.7, 1.8, 1.9].map(y => [150.91, y, z]))); IM(new THREE.BoxGeometry(0.02, 0.16, 0.3), '#f3f2f2', LZ.map(z => [150.91, 1.45, z])); IM(new THREE.BoxGeometry(0.03, 0.22, 0.05), '#9aa0a6', LZ.map(z => [150.92, 1.05, z + 0.36]));
      IM(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#4d5a2a', LZ.map((z, i) => [150.6, 2.1, z, i * 0.7]));
      B(0.42, 0.08, 9.6, '#7a5236', 152.2, 0.46, -428.8, 0, 0.01, g); IM(new THREE.BoxGeometry(0.36, 0.42, 0.08), '#3d3b3a', [-433, -430.2, -427.4, -424.6].map(z => [152.2, 0.21, z])); box(151.95, 152.45, -433.6, -424);
      for (const zc of [-419, -414.5]) { for (const dz of [-1.75, 1.75]) for (const dx of [-0.28, 0.28]) B(0.06, 1.9, 0.06, '#201e1d', 156.8 + dx, 0.95, zc + dz, 0, 0, g); for (const y of [0.25, 0.85, 1.45]) B(0.64, 0.05, 3.6, '#5b5f66', 156.8, y, zc, 0, 0.01, g); box(156.4, 157.2, zc - 1.9, zc + 1.9);
        const sh = []; for (const y of [0.25, 0.85, 1.45]) for (let k = 0; k < 10; k++) for (const dx of [-0.13, 0.13]) sh.push([156.8 + dx, y + 0.27, zc - 1.6 + k * 0.355]); IM(new THREE.CylinderGeometry(0.09, 0.09, 0.42, 10), '#c9a227', sh); IM(new THREE.ConeGeometry(0.09, 0.16, 10), '#ec3013', sh.map(([x, y, z]) => [x, y + 0.29, z])); }
      sign(1.6, 0.5, 'PRACTICE ROUNDS', 'PAINT ONLY · NO LIVE AMMO', '#201e1d', 156.8, 2.25, -416.75, Math.PI / 2);
      C(0.22, 1.0, '#e5e7eb', 151.2, 0.5, -409.2, 0.02, g, 14); C(0.17, 0.5, '#7dd3fc', 151.2, 1.25, -409.2, 0.01, g, 14); B(0.1, 0.06, 0.1, '#2e86b8', 151.45, 0.85, -409.2, 0, 0, g); C(0.06, 0.3, '#f3f2f2', 151.2, 0.75, -409.6, 0, g, 8); ring(151.2, -409.2, 0.35);
      B(0.42, 0.08, 3.2, '#7a5236', 153.8, 0.46, -412, 0, 0.01, g); IM(new THREE.BoxGeometry(0.36, 0.42, 0.08), '#3d3b3a', [-413.4, -410.6].map(z => [153.8, 0.21, z])); box(153.55, 154.05, -413.6, -410.4);
      const cr = [[159.6, 0.3, -407.2, 0.05], [160.8, 0.3, -407.2, -0.04], [162, 0.3, -407.2, 0.02], [159.6, 0.9, -407.2, -0.05], [160.8, 0.9, -407.2, 0.06], [162, 0.9, -407.2], [160.2, 1.5, -407.2, 0.08], [161.4, 1.5, -407.2, -0.03], [159.6, 0.3, -408.1, 0.1], [162, 0.3, -408.1]];
      IM(new THREE.BoxGeometry(1.1, 0.6, 0.75), '#4d5a2a', cr); IM(new THREE.BoxGeometry(1.12, 0.08, 0.77), '#ffd23a', cr.map(([x, y, z, r = 0]) => [x, y + 0.2, z, r])); box(158.9, 162.7, -408.6, -406.7);
      const em = [0, 1, 2, 3, 4, 5].map(i => 155.6 + i * 0.55); B(3.6, 0.08, 0.1, '#201e1d', 157, 1.62, -405.5, 0, 0, g); IM(new THREE.TorusGeometry(0.13, 0.025, 6, 12, Math.PI), '#201e1d', em.map(x => [x, 1.36, -405.6]));
      IM(new THREE.CylinderGeometry(0.08, 0.08, 0.07, 12), '#ec3013', em.flatMap(x => [[x - 0.13, 1.33, -405.6, 0, 0, Math.PI / 2], [x + 0.13, 1.33, -405.6, 0, 0, Math.PI / 2]])); sign(3.6, 0.55, 'EAR DEFENDERS ON', 'TAKE A PAIR · HANG IT BACK', '#ec3013', 157, 2.05, -405.48, Math.PI); }
    // EAST WING: fuel cans on a pallet, road wheels, a tread laid out for repair, workbench + pegboard, spare targets, a sandbag practice bunker, the safety poster
    { B(2.4, 0.15, 1.8, '#a07a52', 196.5, 0.075, -434.5, 0, 0.01, g); const cn = []; for (let i = 0; i < 6; i++) for (let k = 0; k < 3; k++) cn.push([195.5 + i * 0.38, 0.4, -435.1 + k * 0.55]); for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) cn.push([195.9 + i * 0.38, 0.9, -435.1 + k * 0.55]);
      IM(new THREE.BoxGeometry(0.18, 0.5, 0.46), '#c42d2d', cn); IM(new THREE.BoxGeometry(0.1, 0.06, 0.2), '#201e1d', cn.map(([x, y, z]) => [x, y + 0.28, z - 0.08])); box(195.2, 197.8, -435.5, -433.6);
      IM(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 16), '#1f2023', [0, 1, 2, 3, 4].map(i => [194.8, 0.15 + i * 0.31, -430.6, i * 0.5])); IM(new THREE.CylinderGeometry(0.2, 0.2, 0.32, 10), '#9aa0a6', [0, 1, 2, 3, 4].map(i => [194.8, 0.15 + i * 0.31, -430.6])); ring(194.8, -430.6, 0.7);
      const lk = [...Array(16)].map((_, i) => 192.6 + i * 0.34); IM(new THREE.BoxGeometry(0.3, 0.08, 0.9), '#3a3836', lk.map(x => [x, 0.04, -420.5])); IM(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), '#9aa0a6', lk.map(x => [x + 0.17, 0.06, -420.5, 0, Math.PI / 2]));
      B(1.0, 0.95, 5, '#5c4430', 199.4, 0.475, -421.5, 0, 0.02, g); B(1.05, 0.06, 5.05, '#3d3b3a', 199.4, 0.98, -421.5, 0, 0, g); B(0.3, 0.25, 0.25, '#2e4a6b', 199.1, 1.13, -423.4, 0, 0.01, g); box(198.85, 200, -424, -419);
      IM(new THREE.BoxGeometry(0.05, 0.03, 0.34), '#9aa0a6', [0, 1, 2, 3, 4, 5].map(i => [199.2 + (i % 2) * 0.2, 1.03, -422.4 + i * 0.45, i * 0.4]));
      plate(5, 1.8, (q, W, Hh) => { q.fillStyle = '#c9a86a'; q.fillRect(0, 0, W, Hh); q.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 8; y < Hh; y += 16) for (let x = 8; x < W; x += 16) q.fillRect(x, y, 3, 3); q.fillStyle = '#201e1d'; for (let i = 0; i < 9; i++) { const x = 24 + i * 34; q.fillRect(x, 24, 6, 40 + (i % 3) * 14); q.fillRect(x - 7, 24, 20, 9); } q.fillStyle = '#ec3013'; q.fillRect(0, Hh - 18, W, 18); }, g, 199.55, 1.95, -421.5, -Math.PI / 2, false);
      for (const [z, r] of [[-417.2, 0.12], [-416.4, 0.18], [-415.6, 0.1]]) { const d = C(0.55, 0.05, '#f3f2f2', 199.5, 0.6, z, 0.01, g, 16); d.rotation.z = Math.PI / 2 - r; } box(199.1, 200, -417.6, -415.2);
      const sb = []; for (let c = 0; c < 3; c++) for (let i = 0; i < 9 - c; i++) sb.push([189.6 + i * 0.66 + c * 0.33, 0.18 + c * 0.32, -407.8, (i % 2 ? 0.06 : -0.05)]); for (let c = 0; c < 3; c++) for (let i = 0; i < 4 - c; i++) sb.push([189.2, 0.18 + c * 0.32, -409.9 + i * 0.66 + c * 0.33, Math.PI / 2]);
      IM(new THREE.BoxGeometry(0.62, 0.3, 0.4), '#b8a77a', sb); box(188.9, 195.6, -408.1, -407.5); box(188.9, 189.5, -410.2, -407.5);
      rod(192, 0.9, -407.8, 192, 1.6, -407.8, 0.05, ink, g); B(0.2, 0.14, 0.3, '#201e1d', 192, 1.65, -407.9, 0, 0.01, g);
      sign(3.4, 1.0, 'SAFETY FIRST', 'HELMET ON · EARS ON · WALK, NEVER RUN', '#201e1d', 193.5, 2.6, -405.48, Math.PI); }
    // BRIEFING: two rows of folding chairs in front of each chalk board (the hall side)
    { const seat = [], back = [], legs = [];
      for (const Bd of H.BOARDS) { const p = H.world(Bd.x, Bd.z), nx = -Math.sin(Bd.yaw), nz = -Math.cos(Bd.yaw), tx = -nz, tz = nx, fy = Math.atan2(-nx, -nz);
        for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { const d = 3.0 + r * 1.1, u = (k - 1.5) * 0.8, x = p.x + nx * d + tx * u, z = p.z + nz * d + tz * u;
          seat.push([x, 0.46, z, fy]); back.push([x + nx * 0.2, 0.75, z + nz * 0.2, fy]); for (const [a, b2] of [[-0.18, -0.16], [0.18, -0.16], [-0.18, 0.16], [0.18, 0.16]]) legs.push([x + tx * a + nx * b2, 0.22, z + tz * a + nz * b2]); }
        box(Math.min(p.x + nx * 2.7 + tx * 1.6, p.x + nx * 4.4 - tx * 1.6) - 0.1, Math.max(p.x + nx * 2.7 - tx * 1.6, p.x + nx * 4.4 + tx * 1.6) + 0.1, Math.min(p.z + nz * 2.7 + tz * 1.6, p.z + nz * 4.4 - tz * 1.6) - 0.1, Math.max(p.z + nz * 2.7 - tz * 1.6, p.z + nz * 4.4 + tz * 1.6) + 0.1); }
      IM(new THREE.BoxGeometry(0.44, 0.05, 0.42), '#ec3013', seat); IM(new THREE.BoxGeometry(0.44, 0.34, 0.04), '#ec3013', back); IM(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 5), '#201e1d', legs); }
    // RANGE OFFICER's sign-in desk east of the walkway (radio, clipboard, logbook, desk lamp) + the officer (keeper)
    { B(2.4, 0.95, 0.8, '#3d3b3a', 182, 0.475, -413.8, 0, 0.02, g); B(2.45, 0.06, 0.85, '#5b6b3a', 182, 0.98, -413.8, 0, 0, g); box(180.8, 183.2, -414.2, -413.4);
      B(0.3, 0.02, 0.4, '#c9a86a', 181.4, 1.02, -413.7, 0.2, 0, g); B(0.26, 0.012, 0.34, '#f3f2f2', 181.4, 1.035, -413.7, 0.2, 0, g); B(0.5, 0.06, 0.34, '#2e4a6b', 182.3, 1.04, -413.7, -0.1, 0, g);
      B(0.3, 0.2, 0.16, '#201e1d', 183, 1.11, -413.9, 0, 0.01, g); rod(183.1, 1.2, -413.9, 183.1, 1.6, -413.9, 0.01, ink, g); C(0.035, 0.05, '#7dff6a', 182.9, 1.22, -413.82, 0, g, 8);
      rod(180.95, 1.0, -414.0, 180.95, 1.45, -413.9, 0.015, ink, g); C(0.09, 0.1, '#ffd23a', 180.95, 1.48, -413.8, 0.01, g, 10);
      sign(2.2, 0.6, 'RANGE OFFICER RIFF', 'SIGN IN HERE', '#5b6b3a', 182, 0.55, -413.38, 0); }
    // wing lamps (glow at night) + floor pools, two back-wall VENT FANS that turn
    for (const [x, z] of [[155, -426], [155, -412], [195, -426], [195, -412]]) { B(2.4, 0.12, 0.45, '#f3f2f2', x, 7.0, z, 0, 0, g); glow(x, 6.8, z, 3.5, 0xfff1c4, g); pool(x, z, 7, g); }
    for (const x of [156, 194]) { M(new THREE.TorusGeometry(1.0, 0.1, 6, 24), toon('#5b5f66'), x, 5.6, -439.5, g, 0.01); B(2.3, 2.3, 0.08, '#3d3b3a', x, 5.6, -439.62, 0, 0, g); const fan = new THREE.Group(); fan.position.set(x, 5.6, -439.45); g.add(fan); for (let k = 0; k < 4; k++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 0.03), toon('#9aa0a6')); bl.position.y = 0.48; const arm = new THREE.Group(); arm.rotation.z = k * Math.PI / 2; arm.add(bl); bl.rotation.y = 0.35; fan.add(arm); } M(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 10), toon('#201e1d'), 0, 0, 0, fan, 0).rotation.x = Math.PI / 2; RG.spin.push([fan, 2.4, 'z']); }
    // KEEPER: the RANGE OFFICER behind the desk (shop kit: idle, wave when you walk in, looks at you); cadets browse the lockers, rounds, tank, boards
    const RO = kit.makeFox({ key: 'rangeOfficer', name: 'Riff', look: { ...PLAYER_MALE, fur: '#b8692e', furDark: '#7a4320' }, torso: ['#5b6b3a', '#e5e7eb', '#3f4a28'], outfit: 'armor', gear: 'none', mood: 'happy', joints: true }); RO.position.set(182, 0, -415.0); RO.rotation.y = 0; g.add(RO); ring(182, -415.0, 0.45);
    { const P0 = RO.userData.P; if (P0 && P0.sword) P0.sword.visible = false; if (P0 && P0.gun) P0.gun.visible = false; }
    RO.userData.name = 'Riff'; RO.userData.title = 'Range Officer';   // s728m Ben: the Range Officer is RIFF
    RG.K = shopKit({ THREE, G: g, scene, kit, save, camera, touch, hour, isMuted, prefix: 'mtr', color: '#5b6b3a', boardTitle: 'TANK RANGE', room: { X0: x0, X1: x1, Z0: z0, Z1: z1 }, door: [175, -405.8],
      keeper: RO, keeperRy: 0, games: [{ k: 'meruTankRange', name: 'Tank Range' }], board: { x: 150.55, y: 2.4, z: -416.5, ry: Math.PI / 2, w: 1.5 }, hiring: { x: 169, z: -407.5, ry: Math.PI / 2 }, hiringLine: 'WALK UP · RANGE DUTY',
      sun: [{ x: 175, z: -408.5, w: 6, d: 5 }, { x: 165, z: -428, w: 4, d: 8 }, { x: 185, z: -428, w: 4, d: 8 }], lamps: [[175, 8, -436], [175, 8, -430.5], [175, 8, -425], [155, 6.8, -426], [155, 6.8, -412], [195, 6.8, -426], [195, 6.8, -412]],
      browse: [[152.9, -427, -Math.PI / 2], [155.9, -416.5, Math.PI / 2], [175, -424.6, Math.PI], [198.2, -421.5, Math.PI / 2], [152.1, -409.2, -Math.PI / 2], [166.2, -413.2, Math.PI]], clock: { x: 175, y: 5.4, z: -405.45, ry: Math.PI } });
    spots.push({ key: 'rangeHire', x: 169.8, z: -407.5, r: 1.2, prompt: 'NOW HIRING · TANK RANGE', play: { label: 'TANK RANGE', url: b.hiring.url } });
    RG.box = [x0, x1, z0, z1]; RG.sync = () => { try { const v = localStorage.getItem(TY.passKey); if (v == null) return; let n = Number(v); if (!isFinite(n)) { const o = JSON.parse(v); n = Number(o && (o.score ?? o.best ?? o.gold)); } if (isFinite(n) && n > 0) { if (n > save.stat('mtrBest_meruTankRange', 0)) save.setStat('mtrBest_meruTankRange', Math.round(n)); if (!save.stat('mtrStar_meruTankRange', 0)) save.setStat('mtrStar_meruTankRange', 1); RG.K.redraw(); } } catch (e) {} }; RG.sync(); }
  // s728b PLANET DEFENSE BASE command bunker [defense] (f 225..255 × -445..-415, door W at z -430, 6 m roof; BUILD_PLAN interiors #2, was 9.1 / 100 m²).
  // Walkway door → MAIN DEFENSE CONSOLE on the east wall kept clear (z -432..-428). The two techs (meru2-walk roster) stand beside it.
  // Story hint (Machine Fleet hack): the FLEET LINK screen glitches, a red blip flickers on the radar now and then.
  { const { b, g } = room('defense'), [x0, x1, z0, z1] = b.f;
    const IM = (geo, col, list) => { const im = new THREE.InstancedMesh(geo, tc(col), list.length), o3 = new THREE.Object3D(); list.forEach(([x, y, z, ry = 0, rx = 0, rz = 0], i) => { o3.position.set(x, y, z); o3.rotation.set(rx, ry, rz); o3.updateMatrix(); im.setMatrixAt(i, o3.matrix); }); im.castShadow = !touch; im.receiveShadow = true; g.add(im); return im; };
    const bas = c => new THREE.MeshBasicMaterial({ color: c });
    const scr = (w, h, draw, x, y, z, ry) => plate(w, h, draw, g, x, y, z, ry, false);
    const title = (q, W, s, col = '#7dd3fc') => { q.fillStyle = col; q.font = '900 ' + s + 'px Archivo, sans-serif'; q.textBaseline = 'top'; q.fillText(W, 16, 12); };
    // walkway: two yellow edge lines from the door to the console
    for (const z of [-432.2, -427.8]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(24, 0.22).rotateX(-Math.PI / 2), bas('#ffd23a')); p.position.set(238, 0.055, z); g.add(p); }
    // MAIN DEFENSE CONSOLE (5 segments, the outer two angled in), monitors, 3 chairs; the BIG RADAR WALL above it with a turning sweep
    { const seg = [[-434.1, 0.35, -0.35], [-432, 0, 0], [-430, 0, 0], [-428, 0, 0], [-425.9, -0.35, -0.35]];
      seg.forEach(([z, ry, dx]) => { B(1.0, 0.9, 2.0, '#3d3b3a', 252 + dx, 0.45, z, ry, 0.02, g); B(1.05, 0.06, 2.05, '#201e1d', 252 + dx, 0.93, z, ry, 0, g); });
      IM(new THREE.BoxGeometry(0.08, 0.5, 0.8), '#201e1d', seg.map(([z, ry, dx]) => [252.3 + dx, 1.25, z, ry])); IM(new THREE.PlaneGeometry(0.72, 0.42), '#38bdf8', seg.map(([z, ry, dx]) => [252.25 + dx, 1.26, z, ry - Math.PI / 2])).material = bas('#2b6f8f');
      IM(new THREE.BoxGeometry(0.3, 0.03, 0.7), '#5b5f66', seg.map(([z, ry, dx]) => [251.75 + dx, 0.97, z, ry])); IM(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 8), '#ec3013', seg.map(([z, ry, dx]) => [251.7 + dx, 0.98, z + 0.5, ry]));
      box(251.3, 252.7, -435.3, -424.7);
      const ch = [-432, -430, -428].map(z => [250.6, z]); IM(new THREE.BoxGeometry(0.5, 0.08, 0.5), '#2e4a6b', ch.map(([x, z]) => [x, 0.5, z])); IM(new THREE.BoxGeometry(0.06, 0.55, 0.48), '#2e4a6b', ch.map(([x, z]) => [x - 0.25, 0.82, z])); IM(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 6), '#201e1d', ch.map(([x, z]) => [x, 0.25, z])); IM(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 10), '#201e1d', ch.map(([x, z]) => [x, 0.03, z]));
      B(0.12, 3.8, 10.4, '#201e1d', 254.85, 3.3, -430, 0, 0, g);
      scr(10, 3.4, (q, W, Hh) => { q.fillStyle = '#06121a'; q.fillRect(0, 0, W, Hh); const cx = W / 2, cy = Hh / 2, R = Hh * 0.44; q.strokeStyle = 'rgba(125,211,252,0.55)'; q.lineWidth = 2; for (let r = 1; r <= 4; r++) { q.beginPath(); q.arc(cx, cy, R * r / 4, 0, 7); q.stroke(); } q.beginPath(); q.moveTo(cx - R, cy); q.lineTo(cx + R, cy); q.moveTo(cx, cy - R); q.lineTo(cx, cy + R); q.stroke();
        q.fillStyle = 'rgba(74,222,128,0.35)'; q.beginPath(); q.ellipse(cx - 20, cy + 6, R * 0.32, R * 0.22, 0.3, 0, 7); q.fill(); q.fillStyle = '#7dff6a'; [[0.2, -0.3], [-0.4, 0.2], [0.5, 0.35], [-0.15, -0.6]].forEach(([u, v]) => { q.beginPath(); q.arc(cx + u * R, cy + v * R, 6, 0, 7); q.fill(); });
        title(q, 'MERU SKY WATCH', 34); q.fillStyle = '#f3f2f2'; q.font = '800 22px Archivo, sans-serif'; ['SECTOR 8 · CLEAR', 'TURRETS · 4 / 4', 'SHIELD · STANDBY', 'FLEET LINK · ???'].forEach((t, i) => q.fillText(t, W - 260, 60 + i * 34)); }, 254.75, 3.3, -430, -Math.PI / 2);
      const sw = new THREE.Group(); sw.position.set(254.7, 3.3, -430); sw.rotation.y = -Math.PI / 2; g.add(sw); const arm = new THREE.Group(); sw.add(arm); const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 1.5), new THREE.MeshBasicMaterial({ color: 0x7dff6a, transparent: true, opacity: 0.85 })); ln.position.y = 0.75; arm.add(ln); DF.spin.push([arm, -1.2, 'z']);
      const blip = new THREE.Mesh(new THREE.CircleGeometry(0.09, 12), new THREE.MeshBasicMaterial({ color: 0xff3a20, transparent: true, opacity: 0 })); blip.position.set(0.9, 0.55, 0.01); sw.add(blip); DF.blip = blip;
      scr(6, 0.7, (q, W, Hh) => { q.fillStyle = '#201e1d'; q.fillRect(0, 0, W, Hh); q.fillStyle = '#ec3013'; q.fillRect(0, 0, 18, Hh); q.fillStyle = '#ffffff'; q.font = '900 ' + Math.round(Hh * 0.6) + 'px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillText('PLANET DEFENSE', 40, Hh * 0.54); }, 254.75, 5.45, -430, -Math.PI / 2); }
    // WORKSTATIONS: 2 rows × 4 desks facing the north wall screens (monitors in 3 looks, keyboards, chairs)
    { const D = []; for (const z of [-441.5, -437.5]) for (const x of [230, 235, 240, 245]) D.push([x, z]); for (const z of [-441.5, -437.5]) box(228.9, 246.1, z - 0.45, z + 0.45);
      IM(new THREE.BoxGeometry(2.0, 0.06, 0.8), '#5b5f66', D.map(([x, z]) => [x, 0.76, z])); IM(new THREE.BoxGeometry(0.06, 0.74, 0.7), '#3d3b3a', D.flatMap(([x, z]) => [[x - 0.95, 0.37, z], [x + 0.95, 0.37, z]]));
      IM(new THREE.BoxGeometry(0.8, 0.5, 0.05), '#201e1d', D.map(([x, z]) => [x, 1.12, z - 0.22])); IM(new THREE.BoxGeometry(0.06, 0.3, 0.06), '#201e1d', D.map(([x, z]) => [x, 0.88, z - 0.22])); IM(new THREE.BoxGeometry(0.5, 0.02, 0.16), '#9aa0a6', D.map(([x, z]) => [x, 0.8, z + 0.1]));
      const mon = [CT(128, 80, (q, W, Hh) => { q.fillStyle = '#06121a'; q.fillRect(0, 0, W, Hh); q.strokeStyle = '#7dff6a'; q.lineWidth = 3; q.beginPath(); for (let i = 0; i <= 16; i++) q.lineTo(i * 8, 50 + Math.sin(i * 0.9) * 16); q.stroke(); }), CT(128, 80, (q, W, Hh) => { q.fillStyle = '#0b2030'; q.fillRect(0, 0, W, Hh); q.strokeStyle = '#7dd3fc'; q.lineWidth = 2; q.beginPath(); q.arc(64, 40, 30, 0, 7); q.moveTo(34, 40); q.lineTo(94, 40); q.stroke(); q.fillStyle = '#ffd23a'; q.fillRect(70, 26, 6, 6); }), CT(128, 80, (q, W, Hh) => { q.fillStyle = '#101010'; q.fillRect(0, 0, W, Hh); q.fillStyle = '#e5e7eb'; for (let i = 0; i < 6; i++) q.fillRect(8, 8 + i * 11, 30 + (i * 37) % 80, 5); })];
      mon.forEach((t, k) => { const L2 = D.filter((_, i) => i % 3 === k).map(([x, z]) => [x, 1.12, z - 0.19]); if (L2.length) { const m = IM(new THREE.PlaneGeometry(0.72, 0.42), '#ffffff', L2); m.material = new THREE.MeshBasicMaterial({ map: t }); } });
      const C2 = D.map(([x, z]) => [x, z + 0.85]); IM(new THREE.BoxGeometry(0.5, 0.08, 0.5), '#ec3013', C2.map(([x, z]) => [x, 0.5, z])); IM(new THREE.BoxGeometry(0.48, 0.55, 0.06), '#ec3013', C2.map(([x, z]) => [x, 0.82, z + 0.25])); IM(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 6), '#201e1d', C2.map(([x, z]) => [x, 0.25, z])); IM(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 10), '#201e1d', C2.map(([x, z]) => [x, 0.03, z]));
      scr(4.4, 2.0, (q, W, Hh) => { q.fillStyle = '#06121a'; q.fillRect(0, 0, W, Hh); title(q, 'WEATHER', 30); q.fillStyle = '#ffd23a'; q.beginPath(); q.arc(90, 90, 26, 0, 7); q.fill(); q.fillStyle = '#e5e7eb'; q.font = '800 24px Archivo, sans-serif'; q.fillText('WIND 12 · CLEAR', 140, 76); }, 231, 3.0, -444.55, 0);
      DF.link = scr(4.4, 2.0, (q, W, Hh) => { q.fillStyle = '#1a0606'; q.fillRect(0, 0, W, Hh); title(q, 'FLEET LINK', 30, '#ff6a4a'); q.fillStyle = '#f3f2f2'; q.font = '800 22px Archivo, sans-serif'; ['PEARL SAIL · NO REPLY', 'SIGNAL · NOT OURS', 'RETRYING…'].forEach((t, i) => q.fillText(t, 16, 60 + i * 30)); for (let i = 0; i < 14; i++) { q.fillStyle = i % 2 ? 'rgba(255,58,32,0.5)' : 'rgba(125,211,252,0.35)'; q.fillRect(0, Math.random() * Hh, W, 2 + Math.random() * 4); } }, 238, 3.0, -444.55, 0);
      scr(4.4, 2.0, (q, W, Hh) => { q.fillStyle = '#06121a'; q.fillRect(0, 0, W, Hh); title(q, 'TURRETS', 30); for (let i = 0; i < 4; i++) { q.fillStyle = '#7dff6a'; q.fillRect(20 + i * 64, 70, 48, 48); q.fillStyle = '#06121a'; q.font = '900 28px Archivo, sans-serif'; q.fillText(String(i + 1), 36 + i * 64, 80); } }, 245, 3.0, -444.55, 0); }
    // HOLO TABLE (a lit map of Meru with floating markers that bob) + 6 stools
    { B(4.4, 0.9, 2.4, '#201e1d', 238, 0.45, -421, 0, 0.02, g); box(235.6, 240.4, -422.4, -419.6);
      const tp = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: CT(256, 134, (q, W, Hh) => { q.fillStyle = '#062a2f'; q.fillRect(0, 0, W, Hh); q.strokeStyle = 'rgba(94,234,212,0.35)'; q.lineWidth = 1; for (let x = 0; x < W; x += 16) { q.beginPath(); q.moveTo(x, 0); q.lineTo(x, Hh); q.stroke(); } for (let y = 0; y < Hh; y += 16) { q.beginPath(); q.moveTo(0, y); q.lineTo(W, y); q.stroke(); } q.fillStyle = 'rgba(56,189,248,0.6)'; q.beginPath(); q.ellipse(170, 90, 50, 26, 0.2, 0, 7); q.fill(); q.strokeStyle = '#5eead4'; q.lineWidth = 3; q.strokeRect(40, 30, 90, 60); q.beginPath(); q.moveTo(85, 10); q.lineTo(85, 124); q.moveTo(10, 60); q.lineTo(240, 60); q.stroke(); }) })); tp.position.set(238, 0.92, -421); g.add(tp);
      const mk = new THREE.Group(); g.add(mk); DF.mk = mk; [[236.5, -421.4, '#ffd23a'], [238.4, -420.6, '#7dff6a'], [239.6, -421.6, '#7dff6a'], [237.2, -420.4, '#ec3013']].forEach(([x, z, c]) => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), bas(c)); m.position.set(x, 1.2, z); m.rotation.x = Math.PI; mk.add(m); });
      const st = [[235.2, -421], [240.8, -421], [236.8, -423.1], [239.2, -423.1], [236.8, -418.9], [239.2, -418.9]]; IM(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12), '#2e4a6b', st.map(([x, z]) => [x, 0.62, z])); IM(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), '#201e1d', st.map(([x, z]) => [x, 0.3, z])); }
    // SERVER RACKS (SE corner, blinking LEDs), cadet LOCKERS + helmets on the south wall, the GENERATOR (turning flywheel), supply crates (NW)
    { const SR = [249, 250.2, 251.4, 252.6]; for (const x of SR) B(1.0, 2.2, 0.9, '#201e1d', x, 1.1, -416.2, 0, 0.02, g); box(248.4, 253.2, -416.8, -415.3);
      const ledA = [], ledB = []; SR.forEach(x => { for (let r = 0; r < 6; r++) for (let k = 0; k < 2; k++) ((r + k) % 2 ? ledA : ledB).push([x - 0.3 + k * 0.2, 0.5 + r * 0.28, -416.67]); });
      DF.ledA = IM(new THREE.BoxGeometry(0.06, 0.04, 0.02), '#ffffff', ledA); DF.ledA.material = bas('#7dff6a'); DF.ledB = IM(new THREE.BoxGeometry(0.06, 0.04, 0.02), '#ffffff', ledB); DF.ledB.material = bas('#ffb020');
      const LK = [...Array(8)].map((_, i) => 230 + i * 1.05); for (const x of LK) B(1.0, 2.1, 0.6, '#5f6b5a', x, 1.05, -415.4, 0, 0.02, g); box(229.4, 238, -415.8, -415);
      IM(new THREE.BoxGeometry(0.6, 0.05, 0.02), '#3a4430', LK.flatMap(x => [1.7, 1.8, 1.9].map(y => [x, y, -415.71]))); IM(new THREE.BoxGeometry(0.3, 0.16, 0.02), '#f3f2f2', LK.map(x => [x, 1.45, -415.71])); IM(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#cbd5e1', LK.map((x, i) => [x, 2.1, -415.4, i]));
      B(2.0, 1.3, 1.4, '#4b5563', 227.4, 0.65, -418, 0, 0.02, g); B(0.5, 0.4, 1.2, '#ffd23a', 227.4, 1.5, -418, 0, 0.01, g); box(226.3, 228.5, -418.8, -417.2);
      const fw = M(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 16), toon('#9aa0a6'), 228.5, 0.8, -418, g, 0.01); fw.rotation.z = Math.PI / 2; const spk = new THREE.Group(); spk.position.set(228.58, 0.8, -418); spk.rotation.y = Math.PI / 2; g.add(spk); B(0.8, 0.08, 0.02, '#201e1d', 0, 0, 0, 0, 0, spk); B(0.08, 0.8, 0.02, '#201e1d', 0, 0, 0, 0, 0, spk); DF.spin.push([spk, 5, 'z']);
      const cr = [[226.4, 0.35, -443.8], [227.6, 0.35, -443.8], [226.4, 0.35, -442.7], [226.4, 1.05, -443.8, 0.1], [227.6, 1.05, -443.8, -0.05]]; IM(new THREE.BoxGeometry(1.1, 0.7, 1.0), '#4d5a2a', cr); IM(new THREE.BoxGeometry(1.12, 0.08, 1.02), '#ffd23a', cr.map(([x, y, z, r = 0]) => [x, y + 0.22, z, r])); box(225.8, 228.2, -444.4, -442.1); }
    // WEST WALL: sector map with pins (north of the door), coffee station + status board (south of the door)
    { scr(5, 2.4, (q, W, Hh) => { q.fillStyle = '#e9e3d6'; q.fillRect(0, 0, W, Hh); q.fillStyle = '#201e1d'; q.fillRect(0, 0, W, 34); q.fillStyle = '#ffffff'; q.font = '900 24px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillText('MERU SECTOR MAP', 12, 18); q.fillStyle = '#8fb8cf'; q.beginPath(); q.ellipse(200, 100, 60, 34, 0.2, 0, 7); q.fill(); q.strokeStyle = '#7a5236'; q.lineWidth = 3; q.strokeRect(60, 50, 90, 70); q.beginPath(); q.moveTo(20, 90); q.lineTo(300, 90); q.moveTo(105, 40); q.lineTo(105, 150); q.stroke(); }, 225.45, 2.2, -438, Math.PI / 2);
      const pins = [[-439.6, 2.6], [-438.9, 2.0], [-437.2, 1.8], [-436.6, 2.5], [-438.2, 2.9], [-439.9, 1.6], [-437.8, 1.4], [-436.2, 1.9]]; IM(new THREE.SphereGeometry(0.05, 8, 6), '#ec3013', pins.map(([z, y]) => [225.5, y, z]));
      B(0.7, 0.95, 2.4, '#5c4430', 225.75, 0.475, -423, 0, 0.02, g); B(0.75, 0.05, 2.45, '#3d3b3a', 225.75, 0.97, -423, 0, 0, g); B(0.4, 0.5, 0.4, '#201e1d', 225.7, 1.25, -423.8, 0, 0.01, g); C(0.06, 0.08, '#ec3013', 225.95, 1.3, -423.8, 0, g, 8);
      IM(new THREE.CylinderGeometry(0.05, 0.045, 0.1, 10), '#f3f2f2', [[225.8, 1.04, -422.9], [225.7, 1.04, -422.6], [225.85, 1.04, -422.3], [225.65, 1.04, -422.0]]); C(0.2, 0.9, '#e5e7eb', 225.8, 0.45, -421.3, 0.02, g, 12); C(0.15, 0.45, '#7dd3fc', 225.8, 1.12, -421.3, 0.01, g, 12); box(225, 226.2, -424.3, -421);
      scr(2.4, 1.0, (q, W, Hh) => { q.fillStyle = '#201e1d'; q.fillRect(0, 0, W, Hh); q.fillStyle = '#7dff6a'; q.fillRect(16, 16, 22, 22); q.fillStyle = '#ffffff'; q.font = '900 26px Archivo, sans-serif'; q.textBaseline = 'top'; q.fillText('STATUS · GREEN', 50, 14); q.fillStyle = '#ffd23a'; q.font = '800 18px Archivo, sans-serif'; q.fillText('SKY CLEAR · EYES UP', 16, 46); }, 225.45, 2.4, -423, Math.PI / 2); }
    // ceiling lights (glow at night), 4 red corner beacons that turn, cable trays
    for (const [x, z] of [[232, -438], [244, -438], [232, -422], [244, -422], [240, -430], [249, -430]]) { B(2.0, 0.1, 0.5, '#f3f2f2', x, 5.75, z, 0, 0, g); glow(x, 5.55, z, 3, 0xe8f0ff, g); pool(x, z, 6, g); }
    for (const [x, z] of [[225.4, -444.6], [254.6, -444.6], [225.4, -415.4], [254.6, -415.4]]) { const bc = new THREE.Group(); bc.position.set(x, 4.8, z); g.add(bc); M(new THREE.CylinderGeometry(0.16, 0.18, 0.24, 10), toon('#ec3013'), 0, 0, 0, bc, 0.01); M(new THREE.BoxGeometry(0.3, 0.1, 0.05), bas('#ffb0a0'), 0, 0, 0.17, bc, 0); DF.spin.push([bc, 2.6, 'y']); }
    for (const z of [-433, -427]) { B(28, 0.08, 0.4, '#5b5f66', 240, 5.3, z, 0, 0, g); IM(new THREE.BoxGeometry(0.05, 0.4, 0.05), '#3d3b3a', [...Array(8)].map((_, i) => [227 + i * 3.8, 5.5, z])); }
    DF.K = shopKit({ THREE, G: g, scene, kit, save, camera, touch, hour, isMuted, prefix: 'mdf', color: '#5f6b5a', boardTitle: 'PLANET DEFENSE', room: { X0: x0, X1: x1, Z0: z0, Z1: z1 }, door: [225.8, -430],
      sun: [{ x: 227.8, z: -430, w: 3, d: 2.6 }], lamps: [[232, 5.5, -438], [244, 5.5, -438], [232, 5.5, -422], [244, 5.5, -422], [240, 5.5, -430], [249, 5.5, -430]],
      browse: [[238, -435.6, Math.PI], [238, -423.2, 0], [226.7, -438, -Math.PI / 2], [226.7, -422.6, -Math.PI / 2], [250.8, -417.7, Math.PI], [233, -416.6, Math.PI]], clock: { x: 225.45, y: 4.2, z: -430, ry: Math.PI / 2 },
      looks: [['#cbd5e1', '#64748b', '#334155'], ['#f1f5f9', '#38bdf8', '#0c4a6e'], ['#5f6b5a', '#e5e7eb', '#3f4a28']] });
    DF.box = [x0, x1, z0, z1]; }
  // the outdoor range: sandbag firing line, silhouette targets, an earth berm, the red range flag
  const yard = new THREE.Group(); scene.add(yard); groups.push({ g: yard, cx: 190, cz: -400, r: 220 });
  { const F = TY.field; for (let z = F.z[0]; z < F.z[1]; z += 1.2) { if (Math.abs(z - (F.z[0] + F.z[1]) / 2) < 3) continue; B(0.9, 0.5, 1.1, '#b8a77a', F.line, 0.25, z + 0.6, 0, 0.01, yard); B(0.9, 0.45, 1.1, '#a8976a', F.line, 0.72, z + 0.3, 0, 0.01, yard); } box(F.line - 0.5, F.line + 0.5, F.z[0], F.z[1]);
    for (const [x, z] of F.targets) { rod(x, 0, z, x, 1.2, z, 0.06, ink, yard); C(1.1, 0.12, '#f3f2f2', x, 2.1, z, 0.02, yard, 20).rotation.z = Math.PI / 2; C(0.7, 0.14, '#ec3013', x - 0.02, 2.1, z, 0, yard, 20).rotation.z = Math.PI / 2; C(0.3, 0.16, '#f3f2f2', x - 0.04, 2.1, z, 0, yard, 16).rotation.z = Math.PI / 2; ring(x, z, 0.4); }
    const [bx0, bx1, bz0, bz1] = F.berm, bg = new THREE.CylinderGeometry(0.4, 1, 1, 4, 1); bg.rotateY(Math.PI / 4); bg.scale((bx1 - bx0) / 2 * Math.SQRT2, 3, (bz1 - bz0) / 2 * Math.SQRT2); bg.translate(0, 1.5, 0); bg.computeVertexNormals(); mesh(bg, toon('#8a7a5a'), (bx0 + bx1) / 2, 0, (bz0 + bz1) / 2, yard); box(bx0, bx1, bz0, bz1);
    rod(F.line - 4, 0, F.z[0] - 4, F.line - 4, 7, F.z[0] - 4, 0.06, steel, yard); const fl = B(1.6, 1.0, 0.04, '#ec3013', F.line - 3.2, 6.4, F.z[0] - 4, 0, 0, yard); fl.userData.flag = true; yard.userData.flag = fl;
    plate(3.2, 1.0, (q, w, h) => { q.fillStyle = '#ec3013'; q.fillRect(0, 0, w, h); q.fillStyle = '#ffffff'; q.font = '900 ' + Math.round(h * 0.5) + 'px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillText('LIVE RANGE', 14, h * 0.54); }, yard, F.line - 1.5, 1.6, F.z[0] - 1.5, 0); rod(F.line - 2.8, 0, F.z[0] - 1.5, F.line - 2.8, 1.1, F.z[0] - 1.5, 0.04, ink, yard); rod(F.line - 0.2, 0, F.z[0] - 1.5, F.line - 0.2, 1.1, F.z[0] - 1.5, 0.04, ink, yard); }
  // PLANET DEFENSE gate: fence round the base, a boom gate on the west side (DRAFT: opens once the range is passed)
  const GT = TY.gate, gateCol = { f: [GT.x - 0.3, GT.x + 0.3, GT.z[0], GT.z[1]] }; cols.push(gateCol);
  const passed = () => !!(save.flag(TY.flag) || save.flag('finaleBriefed') || (() => { try { return localStorage.getItem(TY.passKey) != null; } catch (e) { return false; } })());
  let boom, lamp; { const [fx0, fx1, fz0, fz1] = GT.fence, Hf = 2.6, seg = (ax, az, bx, bz) => { const len = Math.hypot(bx - ax, bz - az); rod(ax, Hf, az, bx, Hf, bz, 0.05, steel, yard); rod(ax, Hf * 0.5, az, bx, Hf * 0.5, bz, 0.04, steel, yard); for (let u = 0; u <= len; u += 4) { const x = ax + (bx - ax) * u / len, z = az + (bz - az) * u / len; rod(x, 0, z, x, Hf, z, 0.06, ink, yard); } cols.push({ f: [Math.min(ax, bx) - 0.1, Math.max(ax, bx) + 0.1, Math.min(az, bz) - 0.1, Math.max(az, bz) + 0.1] }); };
    seg(fx0, fz0, fx0, GT.z[0]); seg(fx0, GT.z[1], fx0, fz1); seg(fx0, fz1, fx1, fz1); seg(fx1, fz0, fx1, fz1);
    B(0.7, 1.4, 0.7, '#3d3b3a', GT.x, 0.7, GT.z[0] - 0.4, 0, 0.02, yard); B(0.7, 1.4, 0.7, '#3d3b3a', GT.x, 0.7, GT.z[1] + 0.4, 0, 0.02, yard);
    boom = new THREE.Group(); boom.position.set(GT.x, 1.25, GT.z[0] - 0.4); yard.add(boom); const bt = CT(256, 32, (q, w, h) => { for (let i = 0; i < 8; i++) { q.fillStyle = i % 2 ? '#f3f2f2' : '#ec3013'; q.fillRect(i * 32, 0, 32, h); } });
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, GT.z[1] - GT.z[0] + 0.6), new THREE.MeshBasicMaterial({ map: bt })); arm.position.z = (GT.z[1] - GT.z[0] + 0.6) / 2; boom.add(arm);
    lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff3a20 })); lamp.position.set(GT.x, 1.6, GT.z[0] - 0.4); yard.add(lamp);
    plate(3.6, 0.9, (q, w, h) => { q.fillStyle = '#201e1d'; q.fillRect(0, 0, w, h); q.fillStyle = '#ec3013'; q.fillRect(0, 0, 14, h); q.fillStyle = '#ffffff'; q.font = '900 ' + Math.round(h * 0.42) + 'px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillText('PLANET DEFENSE', 26, h * 0.52); }, yard, GT.x - 0.3, 2.6, GT.z[1] + 2.6, -Math.PI / 2); rod(GT.x - 0.3, 0, GT.z[1] + 1.0, GT.x - 0.3, 2.2, GT.z[1] + 1.0, 0.05, ink, yard); rod(GT.x - 0.3, 0, GT.z[1] + 4.2, GT.x - 0.3, 2.2, GT.z[1] + 4.2, 0.05, ink, yard); }
  // the RANGE TANK (drivable on the DRAFT rule), saved where you leave it
  const R = TY.ride, tankG = VK.make('tank'), TV = tankG.userData.V; scene.add(tankG);
  const TK = { on: false, x: R.at[0], z: R.at[1], yaw: R.yaw, speed: 0, turbo: 0, cd: 0, rec: 0, eng: null };
  { const p = save.stat('meru2Tank', null); if (p && p.x != null) Object.assign(TK, { x: p.x, z: p.z, yaw: p.yaw }); }
  const tankCol = { c: [TK.x, TK.z, 3.0] }; cols.push(tankCol);
  const placeTank = () => { tankCol.c[0] = TK.x; tankCol.c[1] = TK.z; tankCol.on = !TK.on; tankG.position.set(TK.x, 0, TK.z); tankG.rotation.y = TK.yaw; if (TV && TV.turret) TV.turret.position.z = -0.2 - TK.rec * 0.25; };
  placeTank();
  const shots = []; const shotGeo = new THREE.SphereGeometry(0.2, 8, 6);
  function fire(kind) { const c = audio(); const sp = kind === 'cannon' ? 70 : 34, life = kind === 'cannon' ? 0.8 : 1.6, a = TK.yaw, m = new THREE.Mesh(shotGeo, new THREE.MeshBasicMaterial({ color: kind === 'cannon' ? 0xffe08a : 0xff6a20 })); m.position.set(TK.x + Math.sin(a) * 3.6, 2.0, TK.z + Math.cos(a) * 3.6); scene.add(m);
    shots.push({ m, vx: Math.sin(a) * sp, vz: Math.cos(a) * sp, t: life, kind, puffT: 0 }); const f = glow(m.position.x, 2.0, m.position.z, kind === 'cannon' ? 5 : 2.5, 0xffc060); f.visible = true; f.userData.fade = 0.18; if (kind === 'cannon') TK.rec = 1; if (!(kind === 'cannon' && c && WS.play('range-tank-fire', 0.9, 0.95 + Math.random() * 0.1))) boom2(c, kind === 'cannon' ? 0.35 : 0.15, kind === 'cannon' ? 140 : 600); }
  function boom2(c, v, f) { if (!c) return; const n = c.createBufferSource(), bf = c.createBuffer(1, c.sampleRate * 0.6, c.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3; n.buffer = bf; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = f * 4; const gn = c.createGain(); gn.gain.value = v; n.connect(lp); lp.connect(gn); gn.connect(c.destination); n.start(); }
  function engine(on) { if (on && !TK.eng) { TK.eng = WS.loop('range-tank-drive'); TK.eng.set(0.35, 0.85); } if (!on && TK.eng) { TK.eng.stop(); TK.eng = null; } }   // s711 recorded diesel + tracks
  function rollSnd(on, k = 0) { if (on && !SK.roll) SK.roll = WS.loop('skate-roll'); if (SK.roll) { if (!on) { SK.roll.stop(); SK.roll = null; } else SK.roll.set(k * 14, 0.75 + k * 8); } }   // s711 recorded wheels on concrete

  const dress = buildYardDress({ THREE, scene, L, toon, touch, cols, parkH });   // exterior polish round 8: skate benches + tags, tank yard apron + props

  // =============================== riding ===============================
  let toast = '', toastT = 0; const say = (t, s = 2.2) => { toast = t; toastT = s; };
  const TRICKS = [['KICKFLIP', 100], ['DOUBLE KICKFLIP', 220], ['360 TRE FLIP', 400]];
  function skate(dt, ix, iy, P, gnd, blocked) { const S = SK, BD = SP.board;
    if (!S.air) { if (iy > 0.1) S.speed += BD.push * MODS.wheelK * iy * dt * (S.speed < 0 ? 2 : 1); else if (iy < -0.1) S.speed = damp(S.speed, 0, 3 * -iy, dt); else S.speed = damp(S.speed, 0, 0.22, dt);
      S.yaw -= ix * 2.6 * dt * clamp(Math.abs(S.speed) / 2, 0.35, 1) * (S.speed < -0.2 ? -1 : 1);
      const sy = Math.sin(S.yaw), cy = Math.cos(S.yaw), gr = clamp((gnd(P.x + sy * 0.3, P.z + cy * 0.3).h - gnd(P.x - sy * 0.3, P.z - cy * 0.3).h) / 0.6, -2, 2); S.speed -= 9.8 * Math.sin(Math.atan(gr)) * dt; }
    S.speed = clamp(S.speed, -BD.max * MODS.wheelK, BD.max * MODS.wheelK);
    const ds = S.speed * dt, nx = P.x + Math.sin(S.yaw) * ds, nz = P.z + Math.cos(S.yaw) * ds, g1 = gnd(nx, nz);
    if (g1.water) { S.speed = 0; return 'water'; }
    if (blocked(nx, nz, 0.5)) { if (Math.abs(S.speed) > 3) boom2(audio(), 0.08, 500); S.speed *= -0.35; }
    else if (!S.air) { const h0 = P.y, h1 = g1.h, sl = (h1 - h0) / Math.max(Math.abs(ds), 1e-3);
      if (h1 - h0 > 0.6) { S.speed *= -0.35; }
      else { P.x = nx; P.z = nz;
        if (sl > 1.3 && Math.abs(S.speed) > 3.5) { S.air = true; S.vert = true; S.vy = Math.abs(S.speed) * 0.9; S.speed = Math.sign(S.speed) * 0.25; P.y = h1 + 0.05; }
        else if (h1 < h0 - 0.35) { S.air = true; S.vy = 0; S.vert = false; } else P.y = h1; } }
    else { P.x = nx; P.z = nz; }
    if (S.air) { S.vy -= 22 * dt; P.y += S.vy * dt; const gh = gnd(P.x, P.z).h; if (P.y <= gh) { P.y = gh; S.air = false; if (S.vy < -3 || S.flip > 0.06 || S.tricks) WS.play('skate-land', S.flip > 0.06 ? 0.9 : 0.6, S.flip > 0.06 ? 0.85 : 0.95 + Math.random() * 0.1);
        if (S.flip > 0.06) { S.speed *= MODS.pads ? 0.75 : 0.3; S.tricks = 0; say(MODS.pads ? 'BAIL · PADS SAVED YOU' : 'BAIL'); boom2(audio(), 0.1, 400); }
        else if (S.tricks) { const t = TRICKS[Math.min(TRICKS.length - 1, S.tricks - 1)]; S.pts += t[1]; say(t[0] + ' \u00b7 +' + t[1]); S.tricks = 0; }
        if (S.vert) { S.yaw += Math.PI; S.speed = Math.abs(S.vy) * 0.5 + 1.5; S.vert = false; } S.flip = 0; } }
    S.flip = Math.max(0, S.flip - dt); S.whack = Math.max(0, S.whack - dt);
    S.x = P.x; S.z = P.z; S.y = P.y; P.yaw = S.yaw; P.sp = Math.abs(S.speed); P.ground = !S.air; P.swim = false; P.vy = 0; placeBoard(); rollSnd(true, S.air ? 0 : clamp(Math.abs(S.speed) / 12, 0, 1) * 0.05); }
  function tankDrive(dt, ix, iy, P, blocked) { const T = TK; T.cd = Math.max(0, T.cd - dt); T.turbo = Math.max(0, T.turbo - dt); T.rec = Math.max(0, T.rec - dt * 3);
    T.yaw -= ix * 1.5 * dt * (iy < -0.1 && T.speed < 0 ? -1 : 1); const top = T.turbo > 0 ? R.turbo : R.max; T.speed = damp(T.speed, iy > 0 ? iy * top : iy * 5, T.turbo > 0 ? 3 : 1.6, dt);
    const nx = T.x + Math.sin(T.yaw) * T.speed * dt, nz = T.z + Math.cos(T.yaw) * T.speed * dt, lz = R.leash;
    if (nx < lz[0] || nx > lz[1] || nz < lz[2] || nz > lz[3]) { T.speed *= -0.2; if (toastT <= 0) say('THE TANK STAYS IN THE BARRACKS YARD'); }
    else if (blocked(nx, nz, 2.3)) { if (Math.abs(T.speed) > 3) boom2(audio(), 0.12, 200); T.speed *= -0.2; } else { T.x = nx; T.z = nz; }
    P.x = T.x; P.z = T.z; P.y = 0; P.yaw = T.yaw; P.sp = Math.abs(T.speed); P.ground = true; P.swim = false; P.vy = 0; placeTank();
    if (T.eng) { const k = clamp(Math.abs(T.speed) / R.max, 0, 1.4); T.eng.set(0.35 + k * 0.4, 0.82 + k * 0.3); } }
  const nearBoard = P => !SK.on && !P.tank && P.y < 3 && Math.hypot(P.x - SK.x, P.z - SK.z) < 2.2;
  const nearRack = P => !SK.on && Math.hypot(P.x - RACK.x, P.z - (RACK.z + 1.2)) < 1.8 && Math.hypot(SK.x - RACK.x, SK.z - RACK.z) > 6;
  const nearTank = P => !TK.on && !SK.on && P.y < 1 && Math.hypot(P.x - TK.x, P.z - TK.z) < 5.6;
  const nearGate = P => !passed() && Math.abs(P.x - GT.x) < 4 && P.z > GT.z[0] - 2 && P.z < GT.z[1] + 2;
  function prompt(P) { if (SK.on) return SK.air ? null : Math.abs(SK.speed) < 2.5 ? 'STEP OFF' : null; if (TK.on) return Math.abs(TK.speed) < 1.5 ? 'GET OUT' : null;
    if (nearBoard(P)) return 'SKATE \u00b7 FREE BOARD'; if (nearRack(P)) return 'FRESH BOARD'; if (nearTank(P)) return passed() ? 'DRIVE THE TANK' : 'TANK \u00b7 PASS THE TANK RANGE'; if (nearGate(P)) return 'GATE CLOSED \u00b7 PASS THE TANK RANGE'; return null; }
  function talk(P) { if (SK.on) { if (SK.air || Math.abs(SK.speed) > 2.5) return true; off(P); return true; } if (TK.on) { if (Math.abs(TK.speed) > 1.5) return true; off(P); return true; }
    if (nearBoard(P)) { SK.on = true; P.skate = true; SK.speed = 0; SK.yaw = P.yaw; SK.air = false; SK.pts = 0; P.y = SK.y; say('SKATE \u00b7 3 OLLIE \u00b7 2 TRICK \u00b7 E STEP OFF', 3); return true; }
    if (nearRack(P)) { Object.assign(SK, { x: RACK.x + 2.4, z: RACK.z + 1.6, y: 0, yaw: 0.4 }); placeBoard(); say('A FRESH BOARD BY THE RACK'); return true; }
    if (nearTank(P)) { if (!passed()) { say('PASS THE TANK RANGE FIRST \u00b7 THE HANGAR', 3); return true; } TK.on = true; P.tank = true; TK.speed = 0; engine(true); return true; }
    if (nearGate(P)) { say('PASS THE TANK RANGE TO OPEN THE GATE', 2.5); return true; } return false; }
  function off(P) { if (SK.on) { SK.on = false; P.skate = false; SK.speed = 0; SK.air = false; SK.flip = 0; SK.y = Math.max(0, P.y); placeBoard(); const a = SK.yaw + Math.PI / 2; P.x = SK.x + Math.sin(a) * 0.9; P.z = SK.z + Math.cos(a) * 0.9; rollSnd(false); if (SK.pts) say('SESSION \u00b7 ' + SK.pts + ' POINTS', 2.5); }
    if (TK.on) { TK.on = false; P.tank = false; TK.speed = 0; engine(false); const a = TK.yaw + Math.PI / 2; P.x = TK.x + Math.sin(a) * 3.8; P.z = TK.z + Math.cos(a) * 3.8; P.y = 0; save.setStat('meru2Tank', { x: TK.x, z: TK.z, yaw: TK.yaw }); } }
  const btn = { one(P) { if (SK.on) { SK.whack = 0.4; boom2(audio(), 0.05, 900); return true; } if (TK.on) { if (TK.cd <= 0) { fire('rocket'); TK.cd = 0.5; } return true; } return false; },
    two(P) { if (SK.on) { if (!SK.air) { SK.air = true; SK.vy = 6.5; P.y += 0.05; } if (SK.flip <= 0.1) { SK.flip = 0.45; SK.tricks++; } return true; } if (TK.on) { if (TK.cd <= 0) { fire('cannon'); TK.cd = 1.4; } return true; } return false; },
    three(P) { if (SK.on) { if (!SK.air) { SK.air = true; SK.vert = false; SK.vy = 6.5; P.y += 0.05; } return true; } if (TK.on) { if (TK.turbo <= 0 && !TK.tcd) { TK.turbo = R.turboT; TK.tcd = R.turboCd; } return true; } return false; } };

  // =============================== per-frame ===============================
  let night = null, cullT = 0, flagT = 0;
  function tick(dt, t, P, isNight) {
    dress.tick(isNight); if (isNight !== night) { night = isNight; for (const s of glows) if (!s.userData.fade) s.visible = night; for (const p of pools) p.visible = night; }
    cullT -= dt; if (cullT <= 0) { cullT = 0.5; for (const r of groups) r.g.visible = Math.hypot(P.x - r.cx, P.z - r.cz) < r.r; board.visible = Math.hypot(P.x - SK.x, P.z - SK.z) < 200; tankG.visible = Math.hypot(P.x - TK.x, P.z - TK.z) < 260; }
    for (const o of outs) { if (!o.f.parent.visible) continue; const d = Math.hypot(P.x - o.x, P.z - o.z), want = d < 6 ? Math.atan2(P.x - o.x, P.z - o.z) : o.yaw0; o.f.rotation.y += Math.atan2(Math.sin(want - o.f.rotation.y), Math.cos(want - o.f.rotation.y)) * Math.min(1, dt * 4); kit.animFox(o.f, dt, 0, false); }
    if (TONYF && TONYF.parent && TONYF.parent.visible) tonyPose(TONYF, dt, Math.hypot(P.x - TONYF.position.x, P.z - TONYF.position.z));
    if (TREADF && TREADF.parent && TREADF.parent.visible) { const w = TREADF.getWorldPosition(new THREE.Vector3()); treadPose(TREADF, dt, Math.hypot(P.x - w.x, P.z - w.z)); }
    if (TW.K && TW.box) { const [a0, a1, b0, b1] = TW.box, near = Math.hypot(P.x - (a0 + a1) / 2, P.z - (b0 + b1) / 2); if (near < 70) TW.K.tick(dt, P, { inShop: P.x > a0 && P.x < a1 && P.z > b0 && P.z < b1 && (P.y || 0) < 5, near }); }
    if (RG.K && RG.box) { const [a0, a1, b0, b1] = RG.box, near = Math.hypot(P.x - (a0 + a1) / 2, P.z - (b0 + b1) / 2); if (near < 70) { const inShop = P.x > a0 && P.x < a1 && P.z > b0 && P.z < b1 && (P.y || 0) < 5; if (inShop && !RG.was && RG.sync) RG.sync(); RG.was = inShop; RG.K.tick(dt, P, { inShop, near }); for (const [o, sp, ax] of RG.spin) o.rotation[ax] += sp * dt; } }
    if (DF.K && DF.box) { const [a0, a1, b0, b1] = DF.box, near = Math.hypot(P.x - (a0 + a1) / 2, P.z - (b0 + b1) / 2); if (near < 60) { const inShop = P.x > a0 && P.x < a1 && P.z > b0 && P.z < b1 && (P.y || 0) < 5; DF.K.tick(dt, P, { inShop, near }); DF.t += dt; const T = DF.t;
      for (const [o, sp, ax] of DF.spin) o.rotation[ax] += sp * dt; if (DF.mk) DF.mk.position.y = Math.sin(T * 1.6) * 0.06;
      if (DF.blip) DF.blip.material.opacity = (T % 9) > 7.6 ? (Math.sin(T * 30) > 0 ? 0.95 : 0.2) : 0;   // the unknown signal: a red blip, now and then
      if (DF.link) DF.link.visible = !((T % 5.3) > 5.0 && Math.sin(T * 40) > 0);   // FLEET LINK glitch flicker
      if (DF.ledA) { const on = Math.sin(T * 5) > 0; DF.ledA.material.color.set(on ? 0x7dff6a : 0x1f4a22); DF.ledB.material.color.set(Math.sin(T * 3.3 + 1) > 0.3 ? 0xffb020 : 0x4a3008); } } }
    { const open = passed(); gateCol.on = !open; boom.rotation.x = damp(boom.rotation.x, open ? -1.35 : 0, 3, dt); lamp.material.color.set(open ? 0x22c55e : 0xff3a20); }
    if (TK.tcd) TK.tcd = Math.max(0, TK.tcd - dt); if (!TK.on) { TK.rec = Math.max(0, TK.rec - dt * 3); placeTank(); }
    flagT += dt; if (yard.userData.flag) yard.userData.flag.rotation.y = Math.sin(flagT * 2.2) * 0.25;
    for (let i = shots.length - 1; i >= 0; i--) { const s = shots[i]; s.t -= dt; s.m.position.x += s.vx * dt; s.m.position.z += s.vz * dt; s.m.position.y = Math.max(0.4, s.m.position.y - dt * (s.kind === 'cannon' ? 1.2 : 0.3));
      if (s.t <= 0) { const f = glow(s.m.position.x, 1.2, s.m.position.z, s.kind === 'cannon' ? 9 : 5, 0xffa040); f.visible = true; f.userData.fade = 0.5; { const c2 = audio(), FT = TY.field && TY.field.targets, tg = c2 && FT && FT.some(([x, z]) => Math.hypot(s.m.position.x - x, s.m.position.z - z) < 3.5); if (!(tg && WS.play('range-target-hit', 0.8))) boom2(c2, s.kind === 'cannon' ? 0.25 : 0.14, 160); } scene.remove(s.m); shots.splice(i, 1); } }
    for (let i = glows.length - 1; i >= 0; i--) { const g = glows[i]; if (!g.userData.fade) continue; g.userData.fade -= dt; g.material.opacity = clamp(g.userData.fade * 4, 0, 1); g.scale.multiplyScalar(1 + dt * 2); if (g.userData.fade <= 0) { g.parent && g.parent.remove(g); glows.splice(i, 1); } }
    if (!SK.on && SK.roll) rollSnd(false); toastT -= dt; }
  return { spots, keys, groundAt: (x, z) => parkH(x, z), tick, skate, tankDrive, prompt, talk, off, btn, passed, board: SK, tank: TK,
    mods: MODS, boardObj: board, setParkH: f => { PH.fn = f; }, tonyFox: () => TONYF, summon(P) { off(P); Object.assign(SK, { x: P.x, z: P.z, y: P.y || 0, yaw: P.yaw, speed: 0, air: false, flip: 0, pts: 0 }); placeBoard(); SK.on = true; P.skate = true; },
    toast: () => (toastT > 0 ? toast : ''), skateLift: () => 0.17 * BSC + 0.04, stats: { groups: groups.length } };
}
