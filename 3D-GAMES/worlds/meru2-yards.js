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
import { PLAYER_MALE } from '../fox-kit.js';
import { buildHangar } from '../minigames/meru/range-hangar.js';
export function buildYards({ THREE, scene, M, toon, grad, kit, cols, L, save, touch, audio = () => null }) {
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
  const park = new THREE.Group(); scene.add(park); groups.push({ g: park, cx: -205, cz: -3, r: 260 });
  const bw = SP.bowl, pp = SP.pipe, fn = SP.fun, st = SP.stairs;
  bw.L = Math.sqrt(bw.R ** 2 - (bw.R - bw.H) ** 2); bw.ro = bw.r0 + bw.L + bw.deck; pp.L = Math.sqrt(pp.R ** 2 - (pp.R - pp.H) ** 2);
  const curve = (S, u) => S.R - Math.sqrt(Math.max(0, S.R * S.R - u * u));
  function bowlH(x, z) { const r = Math.hypot(x - bw.cx, z - bw.cz); if (r < bw.r0) return 0; const u = r - bw.r0; if (u < bw.L) return curve(bw, u); if (u < bw.L + bw.deck) return bw.H; const rz = z - (bw.cz + bw.ro); if (Math.abs(x - bw.cx) < 2 && rz >= -1 && rz < bw.ramp) return bw.H * (1 - Math.max(0, rz) / bw.ramp); return null; }
  function pipeH(x, z) { if (x < pp.x0 || x > pp.x1) return null; const dz = Math.abs(z - pp.cz); if (dz < pp.flat) return 0; const u = dz - pp.flat; if (u < pp.L) return curve(pp, u); if (u < pp.L + pp.deck) return pp.H; return null; }
  function funH(x, z) { const ax = fn.hw - Math.abs(x - fn.cx), az = fn.hd - Math.abs(z - fn.cz); if (ax < 0 || az < 0) return null; return fn.h * Math.min(1, ax / (fn.hw * 0.4), az / (fn.hd * 0.4)); }
  function stairH(x, z) { if (x < st.x0 || x > st.x1 || z < st.z0 || z > st.z1) return null; const i = Math.floor((z - st.z0) / st.run); return st.rise * Math.min(st.steps, i + 1); }
  const boxes = [...SP.ledges, SP.pad];
  const segD = (x, z, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, u = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1); return Math.hypot(x - ax - dx * u, z - az - dz * u); };
  const PR = [SP.rect[0] - 2, SP.rect[1] + 1, SP.rect[2] - 2, SP.rect[3] + 2];
  function parkH(x, z) { if (x < PR[0] || x > PR[1] || z < PR[2] || z > PR[3]) return null; let h = null; const t = v => { if (v != null && (h == null || v > h)) h = v; };
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
      glow(hx + Math.sin(a) * 0.3, 10.8, hz + Math.cos(a) * 0.3, 5, 0xfff2d0, park); pool(x + Math.sin(a) * 12, z + Math.cos(a) * 12, 26, park); } }
  // TONY (look from the Skate Park game) by the street section, his board rack, the free board
  const RACK = { x: SP.rack[0], z: SP.rack[1] };
  { const T = L.SPEAKERS.find(s => s.key === 'tony'), [tx, tz] = T ? T.at : [-190, -20];
    const TONY_LOOK = { ...PLAYER_MALE, fur: '#f4f7fa', furDark: '#c9d3dc', muzzle: '#ffffff', chin: '#ffffff', snout: '#eef3f7', paw: '#e9eef2', tailBase: '#dfe6ec', tailMid: '#f4f7fa', tailTip: '#ffffff', ear: '#3b4654', earInner: '#c7a1b4', fluff: '#ffffff', leg: '#3a3836', boot: '#201e1d' };
    fox('tony', { look: TONY_LOOK, torso: ['#ec3013', '#201e1d', '#f3f2f2'], outfit: 'vest', crest: '', gear: 'none', eyes: ['#7dd3fc', '#7dd3fc'], mood: 'neutral' }, tx, tz, 0, park);
    const hire = L.BUILDINGS.find(b => b.key === 'skateGate'); spots.push({ key: 'tonySkate', x: tx, z: tz + 1.4, r: 2.2, prompt: 'PLAY \u00b7 SKATE PARK', play: { label: 'SKATE PARK', url: hire.hiring.url } });
    B(3, 0.1, 0.5, '#201e1d', RACK.x, 0.05, RACK.z, 0, 0.01, park); for (const s of [-1.45, 1.45]) B(0.1, 1.5, 0.5, '#201e1d', RACK.x + s, 0.75, RACK.z, 0, 0.01, park); B(3, 0.08, 0.08, '#201e1d', RACK.x, 1.45, RACK.z - 0.22, 0, 0, park);
    ['#ec3013', '#38bdf8', '#ffd23a', '#22c55e'].forEach((c, i) => { const d = B(0.32, 1.25, 0.04, c, RACK.x - 1.05 + i * 0.7, 0.8, RACK.z + 0.1, 0, 0.01, park); d.rotation.x = -0.18; }); box(RACK.x - 1.55, RACK.x + 1.55, RACK.z - 0.3, RACK.z + 0.3); }
  const BSC = 1.6, board = VK.make('skate'), BV = board.userData.V; board.scale.setScalar(BSC); board.rotation.order = 'YXZ'; scene.add(board);
  const SK = { on: false, x: RACK.x + 2.4, z: RACK.z + 1.6, y: 0, yaw: 0.4, speed: 0, vy: 0, air: false, vert: false, flip: 0, tricks: 0, whack: 0, pts: 0, roll: null };
  const placeBoard = () => { board.position.set(SK.x, SK.y, SK.z); board.rotation.set(0, SK.yaw, 0); BV.deck.rotation.z = SK.flip > 0 ? (1 - SK.flip / 0.45) * Math.PI * 2 : 0; BV.body.rotation.y = SK.whack > 0 ? (1 - SK.whack / 0.4) * Math.PI * 2 : 0; };
  placeBoard();

  // =============================== TANK WORKS + TANK RANGE ===============================
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
    const tr = L.SPEAKERS.find(s => s.key === 'tread'), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, ttx = cx + (tr ? tr.at.x : 0), ttz = cz + (tr ? tr.at.z : -6);
    fox('tread', { look: PLAYER_MALE, torso: ['#4b5563', '#e5e7eb', '#1f2937'], outfit: 'armor', gear: 'none', mood: 'happy' }, ttx, ttz, -Math.PI / 2, g);
    spots.push({ key: 'tankJob', x: ttx - 1.4, z: ttz, r: 2.2, prompt: 'PUT ME TO WORK \u00b7 TANK WORKS JOB', play: { label: b.label.toUpperCase(), url: b.hiring.url } }); }
  // TANK RANGE hangar (f 150..200 × -440..-405, door S at x 175): the game's hangar + blackboards, crates, target rack
  { const { b, g } = room('tankRange'), [x0, x1, z0, z1] = b.f, cx = (x0 + x1) / 2;
    // the game's own hangar + both chalk blackboards (minigames/meru/range-hangar.js), back wall on the shell's north wall, boards by the door
    const H = buildHangar({ THREE, M, toon, glowTex, scene: g, origin: { x: cx, z: z0 + 119 }, mounted: true });
    for (const Bd of H.BOARDS) { const p = H.world(Bd.x, Bd.z), dx = Math.cos(Bd.yaw) * 2.6, dz = -Math.sin(Bd.yaw) * 2.6; for (const k of [-1, 0, 1]) ring(p.x + dx * k, p.z + dz * k, 0.9); }
    for (const sx of [-1, 1]) { const r = H.world(sx * 15, -106); box(r.x - 0.6, r.x + 0.6, r.z - 1.8, r.z + 1.8); const d = H.world(sx * 13.5, -113); box(d.x - 0.5, d.x + 0.5, d.z - 1.6, d.z + 1.6); }
    { const p = H.world(0, -90); spots.push({ key: 'rangePlay', x: p.x, z: p.z, r: 2.6, prompt: 'PLAY \u00b7 TANK RANGE', play: { label: 'TANK RANGE', url: b.hiring.url } }); }
    for (const [x, z] of [[x0 + 3, z0 + 3], [x0 + 4.4, z0 + 3], [x0 + 3.7, z0 + 3, 1], [x1 - 3, z0 + 3], [x1 - 4.4, z0 + 3]]) B(1.3, 0.9, 1.1, '#5b6b3a', x, 0.45, z, 0.1, 0.02, g); box(x0 + 2, x0 + 5.2, z0 + 2.3, z0 + 3.7); box(x1 - 5.2, x1 - 2, z0 + 2.3, z0 + 3.7);
    for (let i = 0; i < 4; i++) { const x = x1 - 2, z = z1 - 9 + i * 1.6; rod(x, 0, z, x, 1.6, z, 0.04, ink, g); C(0.55, 0.06, i % 2 ? '#f3f2f2' : '#ec3013', x, 1.9, z, 0.01, g, 16).rotation.z = Math.PI / 2; } box(x1 - 2.6, x1 - 1.4, z1 - 9.6, z1 - 3.6); }
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
    shots.push({ m, vx: Math.sin(a) * sp, vz: Math.cos(a) * sp, t: life, kind, puffT: 0 }); const f = glow(m.position.x, 2.0, m.position.z, kind === 'cannon' ? 5 : 2.5, 0xffc060); f.visible = true; f.userData.fade = 0.18; if (kind === 'cannon') TK.rec = 1; boom2(c, kind === 'cannon' ? 0.35 : 0.15, kind === 'cannon' ? 140 : 600); }
  function boom2(c, v, f) { if (!c) return; const n = c.createBufferSource(), bf = c.createBuffer(1, c.sampleRate * 0.6, c.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3; n.buffer = bf; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = f * 4; const gn = c.createGain(); gn.gain.value = v; n.connect(lp); lp.connect(gn); gn.connect(c.destination); n.start(); }
  function engine(on) { const c = audio(); if (on && c && !TK.eng) { const o = c.createOscillator(), lp = c.createBiquadFilter(), gn = c.createGain(); o.type = 'sawtooth'; o.frequency.value = 38; lp.type = 'lowpass'; lp.frequency.value = 260; gn.gain.value = 0.035; o.connect(lp); lp.connect(gn); gn.connect(c.destination); o.start(); TK.eng = { o, gn }; } if (!on && TK.eng) { try { TK.eng.o.stop(); } catch (e) {} TK.eng = null; } }
  function rollSnd(on, k = 0) { const c = audio(); if (on && c && !SK.roll) { const n = c.createBufferSource(), bf = c.createBuffer(1, c.sampleRate, c.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; n.buffer = bf; n.loop = true; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = 0.8; const gn = c.createGain(); gn.gain.value = 0; n.connect(bp); bp.connect(gn); gn.connect(c.destination); n.start(); SK.roll = { n, gn }; } if (SK.roll) { if (!on) { try { SK.roll.n.stop(); } catch (e) {} SK.roll = null; } else SK.roll.gn.gain.value = k; } }

  // =============================== riding ===============================
  let toast = '', toastT = 0; const say = (t, s = 2.2) => { toast = t; toastT = s; };
  const TRICKS = [['KICKFLIP', 100], ['DOUBLE KICKFLIP', 220], ['360 TRE FLIP', 400]];
  function skate(dt, ix, iy, P, gnd, blocked) { const S = SK, BD = SP.board;
    if (!S.air) { if (iy > 0.1) S.speed += BD.push * iy * dt * (S.speed < 0 ? 2 : 1); else if (iy < -0.1) S.speed = damp(S.speed, 0, 3 * -iy, dt); else S.speed = damp(S.speed, 0, 0.22, dt);
      S.yaw -= ix * 2.6 * dt * clamp(Math.abs(S.speed) / 2, 0.35, 1) * (S.speed < -0.2 ? -1 : 1);
      const sy = Math.sin(S.yaw), cy = Math.cos(S.yaw), gr = clamp((gnd(P.x + sy * 0.3, P.z + cy * 0.3).h - gnd(P.x - sy * 0.3, P.z - cy * 0.3).h) / 0.6, -2, 2); S.speed -= 9.8 * Math.sin(Math.atan(gr)) * dt; }
    S.speed = clamp(S.speed, -BD.max, BD.max);
    const ds = S.speed * dt, nx = P.x + Math.sin(S.yaw) * ds, nz = P.z + Math.cos(S.yaw) * ds, g1 = gnd(nx, nz);
    if (g1.water) { S.speed = 0; return 'water'; }
    if (blocked(nx, nz, 0.5)) { if (Math.abs(S.speed) > 3) boom2(audio(), 0.08, 500); S.speed *= -0.35; }
    else if (!S.air) { const h0 = P.y, h1 = g1.h, sl = (h1 - h0) / Math.max(Math.abs(ds), 1e-3);
      if (h1 - h0 > 0.6) { S.speed *= -0.35; }
      else { P.x = nx; P.z = nz;
        if (sl > 1.3 && Math.abs(S.speed) > 3.5) { S.air = true; S.vert = true; S.vy = Math.abs(S.speed) * 0.9; S.speed = Math.sign(S.speed) * 0.25; P.y = h1 + 0.05; }
        else if (h1 < h0 - 0.35) { S.air = true; S.vy = 0; S.vert = false; } else P.y = h1; } }
    else { P.x = nx; P.z = nz; }
    if (S.air) { S.vy -= 22 * dt; P.y += S.vy * dt; const gh = gnd(P.x, P.z).h; if (P.y <= gh) { P.y = gh; S.air = false;
        if (S.flip > 0.06) { S.speed *= 0.3; S.tricks = 0; say('BAIL'); boom2(audio(), 0.1, 400); }
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
    if (T.eng) { T.eng.o.frequency.value = 38 + Math.abs(T.speed) * 5; T.eng.gn.gain.value = 0.03 + Math.abs(T.speed) * 0.003; } }
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
    if (isNight !== night) { night = isNight; for (const s of glows) if (!s.userData.fade) s.visible = night; for (const p of pools) p.visible = night; }
    cullT -= dt; if (cullT <= 0) { cullT = 0.5; for (const r of groups) r.g.visible = Math.hypot(P.x - r.cx, P.z - r.cz) < r.r; board.visible = Math.hypot(P.x - SK.x, P.z - SK.z) < 200; tankG.visible = Math.hypot(P.x - TK.x, P.z - TK.z) < 260; }
    for (const o of outs) { if (!o.f.parent.visible) continue; const d = Math.hypot(P.x - o.x, P.z - o.z), want = d < 6 ? Math.atan2(P.x - o.x, P.z - o.z) : o.yaw0; o.f.rotation.y += Math.atan2(Math.sin(want - o.f.rotation.y), Math.cos(want - o.f.rotation.y)) * Math.min(1, dt * 4); kit.animFox(o.f, dt, 0, false); }
    { const open = passed(); gateCol.on = !open; boom.rotation.x = damp(boom.rotation.x, open ? -1.35 : 0, 3, dt); lamp.material.color.set(open ? 0x22c55e : 0xff3a20); }
    if (TK.tcd) TK.tcd = Math.max(0, TK.tcd - dt); if (!TK.on) { TK.rec = Math.max(0, TK.rec - dt * 3); placeTank(); }
    flagT += dt; if (yard.userData.flag) yard.userData.flag.rotation.y = Math.sin(flagT * 2.2) * 0.25;
    for (let i = shots.length - 1; i >= 0; i--) { const s = shots[i]; s.t -= dt; s.m.position.x += s.vx * dt; s.m.position.z += s.vz * dt; s.m.position.y = Math.max(0.4, s.m.position.y - dt * (s.kind === 'cannon' ? 1.2 : 0.3));
      if (s.t <= 0) { const f = glow(s.m.position.x, 1.2, s.m.position.z, s.kind === 'cannon' ? 9 : 5, 0xffa040); f.visible = true; f.userData.fade = 0.5; boom2(audio(), s.kind === 'cannon' ? 0.25 : 0.14, 160); scene.remove(s.m); shots.splice(i, 1); } }
    for (let i = glows.length - 1; i >= 0; i--) { const g = glows[i]; if (!g.userData.fade) continue; g.userData.fade -= dt; g.material.opacity = clamp(g.userData.fade * 4, 0, 1); g.scale.multiplyScalar(1 + dt * 2); if (g.userData.fade <= 0) { g.parent && g.parent.remove(g); glows.splice(i, 1); } }
    if (!SK.on && SK.roll) rollSnd(false); toastT -= dt; }
  return { spots, keys, groundAt: (x, z) => parkH(x, z), tick, skate, tankDrive, prompt, talk, off, btn, passed, board: SK, tank: TK,
    toast: () => (toastT > 0 ? toast : ''), skateLift: () => 0.17 * BSC + 0.04, stats: { groups: groups.length } };
}
