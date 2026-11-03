// 8 GATES · SPACE MAP · THE CABIN (s599, Ben: "the BRIDGE button takes the player to their cockpit to walk around, back to the pilot seat
// to fly again. For the SCOUT: sitting in the cockpit with an option to FLY SHIP"). The ship holds station while you are in here.
// Walk-in hulls (shuttle / cruiser / gunner / flagship) reuse the dock walk's interiors (space-dockwalk interior(type, api)): the cast fox
// walks inside the parked ship (stick / WASD, nose = up), the camera sits on the open +x side (the same side the dock walk cuts away),
// hotspots work (bunk, galley, holo...), and anywhere in the COCKPIT / BRIDGE the prompt is FLY SHIP. The SCOUT has one seat: the camera
// swings round the canopy to the seated pilot fox (ship-pilot.js shows him on close-ups) and the page shows a FLY SHIP button.
export function createCabin({ THREE, WALK, getShip, toast, snd, data = () => ({}) }) {
  // s599d SCOUT COCKPIT (Ben: "instruments of a cockpit, the windshield fully see-through, a COMPUTER screen"): while in the pilot POV the
  // hull is hidden (nothing blocks the glass) and a camera-locked cockpit is drawn: the dash, the canopy frame, two dials (speed, fuel),
  // switch banks and the NAV COMPUTER (live: hull, energy, fuel, heading, speed, course, nearest contact). Sized to the screen every frame.
  const PIT = { g: null, key: '', scr: null, sctx: null, stex: null, dials: [], t: 0 };
  const mat = (c2, o) => new THREE.MeshBasicMaterial({ color: c2, transparent: o != null, opacity: o ?? 1, depthWrite: o == null, toneMapped: false });
  function canvasTex(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return { cv, x: cv.getContext('2d'), tx }; }
  function buildPit(camera) { const asp = camera.aspect, key = asp.toFixed(2); if (PIT.g && PIT.key === key) return; if (PIT.g) { PIT.g.parent && PIT.g.parent.remove(PIT.g); PIT.g.traverse(o => { o.geometry && o.geometry.dispose(); }); }
    const g = new THREE.Group(), d = 0.5, hh = Math.tan(camera.fov * Math.PI / 360) * d, hw = hh * asp, wide = asp > 1.1, B = (w, h, dd, m, x, y, z, rx = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, dd), m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); g.add(o); return o; };
    const dark = mat('#1c1f26'), mid = mat('#2c313b'), edge = mat('#7fd0ff'), red = mat('#ec3013'), amber = mat('#ffd23a'), green = mat('#6ee7b7');
    const dashH = hh * (wide ? 0.36 : 0.32), dashY = -hh + dashH / 2 + hh * 0.1, top = dashY + dashH / 2;
    B(hw * 2.2, hh * 0.12, 0.06, mid, 0, -hh + hh * 0.04, -d + 0.004);
    B(hw * 2.2, dashH, 0.06, dark, 0, dashY, -d, 0); B(hw * 2.2, hh * 0.012, 0.004, edge, 0, top, -d + 0.032);
    // canopy frame: top bow + two pillars (thin, so the glass stays clear)
    B(hw * 2.2, hh * 0.05, 0.02, mid, 0, hh * 0.985, -d); for (const s of [-1, 1]) B(hh * 0.035, hh * 2.2, 0.02, mid, s * hw * 0.985, 0, -d, 0, s * 0.18);
    // NAV COMPUTER
    const sw = Math.min(hw * (wide ? 0.46 : 1.2), hh * 0.8), sh = sw * 0.6; PIT.scr = canvasTex(512, 308); const scr = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), new THREE.MeshBasicMaterial({ map: PIT.scr.tx, toneMapped: false }));
    const sy = top + sh * 0.42; scr.position.set(0, sy, -d + 0.05); scr.rotation.x = -0.12; g.add(scr); B(sw * 1.06, sh * 1.1, 0.008, mid, 0, sy, -d + 0.044, -0.12); B(sw * 0.2, sh * 0.5, 0.01, mid, 0, top, -d + 0.04);
    // dials + switch banks either side (landscape has room; portrait gets small ones)
    PIT.dials = []; const dr = Math.min(hh * 0.15, (hw - sw / 2) * 0.42); if (dr > hh * 0.05) for (const [s, kind] of [[-1, 'SPEED'], [1, 'FUEL']]) { const ct = canvasTex(128, 128), m = new THREE.Mesh(new THREE.CircleGeometry(dr, 32), new THREE.MeshBasicMaterial({ map: ct.tx, toneMapped: false })); m.position.set(s * (sw / 2 + dr * 1.5), dashY + dashH * 0.05, -d + 0.034); m.rotation.x = 0; g.add(m); PIT.dials.push({ ...ct, kind }); }
    PIT.lamps = []; const lw = Math.max(0.004, hw * 0.035); for (const s of [-1, 1]) for (let i = 0; i < (wide ? 6 : 3); i++) { const m = B(lw, lw * 0.6, 0.004, [red, amber, green, edge][(i + (s > 0 ? 2 : 0)) % 4], s * (hw * 0.92 - i * lw * 1.6), dashY - dashH * 0.25, -d + 0.033, 0); PIT.lamps.push(m); }
    // aim ring in the glass
    const ring = new THREE.Mesh(new THREE.RingGeometry(hh * 0.045, hh * 0.05, 40), mat('#7fd0ff', 0.55)); ring.position.set(0, hh * 0.05, -d); g.add(ring); const dot = new THREE.Mesh(new THREE.CircleGeometry(hh * 0.006, 12), mat('#7fd0ff', 0.8)); dot.position.copy(ring.position); g.add(dot);
    g.traverse(o => { if (o.isMesh) { o.renderOrder = 10; o.frustumCulled = false; } }); PIT.g = g; PIT.key = key; }
  function drawPit(dt) { PIT.t += dt; if ((PIT.dt = (PIT.dt || 0) - dt) > 0) return; PIT.dt = 0.2; const D = data(), x = PIT.scr.x, W = 512, H = 308;
    x.fillStyle = '#0b1016'; x.fillRect(0, 0, W, H); x.strokeStyle = '#7fd0ff'; x.lineWidth = 4; x.strokeRect(4, 4, W - 8, H - 8); x.fillStyle = '#7fd0ff'; x.font = '800 26px Archivo, sans-serif'; x.fillText('NAV COMPUTER', 22, 42); x.fillStyle = '#ffd23a'; x.textAlign = 'right'; x.fillText(String(Math.round(D.heading ?? 0)).padStart(3, '0') + '°', W - 22, 42); x.textAlign = 'left';
    const bar = (lab, v, col, y) => { x.fillStyle = '#a8a29e'; x.font = '700 20px Archivo, sans-serif'; x.fillText(lab, 22, y); x.fillStyle = '#000'; x.fillRect(130, y - 16, 250, 16); x.fillStyle = col; x.fillRect(130, y - 16, 250 * Math.max(0, Math.min(1, v / 100)), 16); x.fillStyle = '#f3f2f2'; x.font = '800 20px Archivo, sans-serif'; x.fillText(Math.round(v) + '', 396, y); };
    bar('HULL', D.hp ?? 100, '#f3f2f2', 92); bar('ENERGY', D.en ?? 100, '#7fd0ff', 126); bar('FUEL', D.fuel ?? 100, (D.fuel ?? 100) < 25 ? '#ec3013' : '#6ee7b7', 160);
    x.fillStyle = '#f3f2f2'; x.font = '800 22px Archivo, sans-serif'; x.fillText(D.course ? 'COURSE · ' + D.course : 'NO COURSE SET', 22, 210); x.fillStyle = '#a8a29e'; x.font = '700 19px Archivo, sans-serif'; x.fillText(D.course ? (D.courseD || 0) + 'u ahead' : 'Set one on the BRIDGE star map', 22, 238);
    x.fillStyle = D.threat ? '#ff4a2e' : '#6ee7b7'; x.font = '800 20px Archivo, sans-serif'; x.fillText(D.threat ? 'CONTACT · ' + D.threat : 'SPACE CLEAR', 22, 276); if (Math.sin(PIT.t * 6) > 0) { x.fillStyle = '#7fd0ff'; x.fillRect(W - 40, H - 40, 14, 14); } PIT.scr.tx.needsUpdate = true;
    for (const dl of PIT.dials) { const c2 = dl.x, v = dl.kind === 'SPEED' ? Math.min(1, (D.speed || 0) / 50) : Math.min(1, (D.fuel ?? 100) / 100); c2.clearRect(0, 0, 128, 128); c2.fillStyle = '#0b1016'; c2.beginPath(); c2.arc(64, 64, 62, 0, 7); c2.fill(); c2.strokeStyle = '#3a4048'; c2.lineWidth = 6; c2.stroke();
      c2.strokeStyle = dl.kind === 'SPEED' ? '#7fd0ff' : '#6ee7b7'; c2.lineWidth = 8; c2.beginPath(); c2.arc(64, 64, 48, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * v)); c2.stroke(); c2.fillStyle = '#f3f2f2'; c2.font = '800 15px Archivo, sans-serif'; c2.textAlign = 'center'; c2.fillText(dl.kind, 64, 70); c2.font = '800 20px Archivo, sans-serif'; c2.fillText(dl.kind === 'SPEED' ? Math.round(D.speed || 0) + '' : Math.round(D.fuel ?? 100) + '%', 64, 96); dl.tx.needsUpdate = true; }
    (PIT.lamps || []).forEach((m, i) => { m.visible = Math.sin(PIT.t * (1 + i * 0.37) + i) > -0.5; }); }
  const C = { on: false, scout: false, R: null, x: 0, z: 0, f: 0, sp: 0, prompt: null, near: null, t: 0, wpm: 1 };
  const _v = new THREE.Vector3(), _l = new THREE.Vector3(), _c = new THREE.Vector3(), _w = new THREE.Vector3(), camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
  let snap = true;
  function place() { const R = C.R; _l.set(C.x, R.surf(C.x, C.z, 0) ?? 0, C.z); R.g.localToWorld(_l); return _l; }
  async function enter(type) { const S = getShip(); if (!S) return false; C.t = 0; snap = true; C.prompt = 'Fly ship'; C.near = null;
    const R = WALK.interior ? WALK.interior(type, S.api) : null;
    if (!R) { C.on = true; C.scout = true; C.R = null; C.hid = S.group; S.group.visible = false; snd && snd('holster'); return true; }
    if (R.g.parent !== S.group) S.group.add(R.g); R.g.scale.setScalar(R.k / R.Sb); R.g.position.set(0, S.api.dims.floor, 0); R.g.visible = true; if (S.api.plug) S.api.plug.visible = false;
    const body = S.group.children[0]; C.body = body; if (body) body.visible = false; R.CEIL.forEach(m => { m.visible = false; });
    const fox = await WALK.ensureFox(); S.group.updateMatrixWorld(true); R.g.getWorldScale(_w); C.wpm = _w.x; fox.scale.setScalar((fox.userData._b0 || 1) * C.wpm); fox.visible = true;
    // start in the cockpit: walk forward from mid-ship until the zone says cockpit / bridge (or the nose stops us)
    C.x = 0; C.z = 0; C.f = Math.PI; for (let z = 0; z > -(R.hdF || R.hd); z -= 0.25) { if (R.blocked(0, z)) break; C.z = z; R.PL.x = 0; R.PL.z = z; R.PL.gy = 0; const Z = R.zoneOf && R.zoneOf(); if (Z === 'cockpit' || Z === 'bridge') { C.z = z + 0.6; break; } }
    if (!C.lamp) { C.lamp = new THREE.PointLight(0xfff1d8, 2.2, 1, 1.6); C.fill = new THREE.HemisphereLight(0xdde8ff, 0x3a3230, 0.7); } C.lamp.distance = 14 * C.wpm; let root = S.group; while (root.parent) root = root.parent; root.add(C.lamp); root.add(C.fill);   /* s599 lights inside (the dock walk strips the interior's own) */
    C.R = R; C.on = true; C.scout = false; snd && snd('holster'); return true; }
  function exit() { if (!C.on) return; const S = getShip(), R = C.R; C.on = false; C.prompt = null; if (C.cam0 && C.camRef) { C.camRef.near = C.cam0.near; C.camRef.fov = C.cam0.fov; C.camRef.updateProjectionMatrix(); } C.cam0 = null; C.ly = 0; C.lp = -0.12; if (C.hid) { C.hid.visible = true; C.hid = null; } if (C.lamp && C.lamp.parent) { C.lamp.parent.remove(C.lamp); C.fill.parent.remove(C.fill); } if (PIT.g && PIT.g.parent) PIT.g.parent.remove(PIT.g);
    if (R) { R.g.visible = false; if (C.body) C.body.visible = true; R.CEIL.forEach(m => { m.visible = true; }); R.CUT.forEach(q => { q.m.visible = true; }); if (S && S.api.plug) S.api.plug.visible = true; if (WALK.fox) WALK.fox.visible = false; }
    C.R = null; snd && snd('undock'); }
  // every frame while on. s599b (Ben: "walk just like when docked"): the same feel as the dock walk: the stick moves you on SCREEN
  // (camera-relative), the fox turns to face where it goes, 4.2 world units a second at dock scale, the camera on the ship's +x side at the
  // interior's own nav distance (R.nav.D / up), walls on the near side cut away, ceilings hidden. The ramp stays shut (only the floor inside).
  const _r = new THREE.Vector3(), _f = new THREE.Vector3(), _inv = new THREE.Matrix4(); let stepT = 0;
  function tick(dt, ix, iz) { if (!C.on) return; C.t += dt; const R = C.R; if (!R) { C.ly = Math.max(-1.4, Math.min(1.4, (C.ly || 0) - ix * dt * 1.6)); C.lp = Math.max(-0.7, Math.min(0.5, (C.lp ?? -0.12) - iz * dt * 1.2)); return; } const fox = WALK.fox; if (!fox) return;
    const mag = Math.min(1, Math.hypot(ix, iz)), V2 = 4.2 / 0.68 * C.wpm; C.sp += (mag * V2 - C.sp) * (1 - Math.exp(-dt * 8));
    if (mag > 0.1) { _f.copy(camLook).sub(camPos).setY(0); if (_f.lengthSq() < 1e-6) _f.set(0, 0, -1); _f.normalize(); _r.set(-_f.z, 0, _f.x); const wx = _r.x * ix - _f.x * iz, wz = _r.z * ix - _f.z * iz, th = Math.atan2(wx, wz); let df = th - fox.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); fox.rotation.y += df * Math.min(1, dt * 10); }
    if (C.sp > 0.001) { const S = getShip(); S.group.updateMatrixWorld(true); _inv.copy(R.g.matrixWorld).invert(); const dx = Math.sin(fox.rotation.y) * C.sp * dt, dz = Math.cos(fox.rotation.y) * C.sp * dt;
      const tryAt = (x, z) => { _l.set(x, fox.position.y, z).applyMatrix4(_inv); return R.blocked(_l.x, _l.z) || _l.z > R.hd - 0.6 ? null : [_l.x, _l.z]; };   /* the ramp is shut: nothing past the stern wall */
      const g = tryAt(fox.position.x + dx, fox.position.z + dz) || tryAt(fox.position.x + dx, fox.position.z) || tryAt(fox.position.x, fox.position.z + dz); if (g) { C.x = g[0]; C.z = g[1]; } }
    R.PL.x = C.x; R.PL.z = C.z; R.PL.gy = 0; fox.position.copy(place()); if (C.lamp) C.lamp.position.set(fox.position.x, fox.position.y + 2.4 * C.wpm, fox.position.z); if (WALK.animFox) WALK.animFox(fox, dt, C.sp);
    if (C.sp > 0.4 * C.wpm && (stepT -= dt * C.sp / (3.2 * C.wpm)) <= 0) { stepT = 0.34; window.__spaceSnd && window.__spaceSnd('step'); }
    for (const q of R.CUT) q.m.visible = q.x < C.x + 0.5; for (const a of R.anims || []) a(dt, C.t);
    const Z = R.zoneOf && R.zoneOf(), nr = R.near && R.near(), ck = (Z === 'cockpit' || Z === 'bridge') && (!nr || /PILOT|CAPTAIN/.test(nr.label));
    C.near = ck ? null : nr; C.prompt = ck ? 'Fly ship' : nr ? (nr.text || 'Use ' + nr.label) : null; }
  // camera: walk-ins = exactly the dock walk's inside camera; scout = close on the canopy
  function cam(camera, dt) { if (!C.on) return; const S = getShip(); if (!S) return; const k = snap ? 1 : 1 - Math.exp(-dt * 5); snap = false;
    if (C.R) { const R = C.R, fox = WALK.fox; if (!fox) return; S.group.updateMatrixWorld(true); _v.set(1, 0, 0).transformDirection(S.group.matrixWorld); const nv = R.nav || {}, Dr = (nv.D || 7) * C.wpm, Up = (nv.up || R.h + 2) * C.wpm;
      _c.copy(fox.position); _c.y += 0.45 * C.wpm; _l.set(fox.position.x + _v.x * Dr, fox.position.y + Up, fox.position.z + _v.z * Dr); }
    else {   /* s599c (Ben): the SCOUT = POV from the pilot's seat: the eye at the pilot's head, looking down the nose; the stick looks around */
      const root = S.group.children[0] || S.group, P = S.api && S.api.pilot; S.group.updateMatrixWorld(true);
      C.camRef = camera; if (!C.cam0) { C.cam0 = { near: camera.near, fov: camera.fov }; camera.near = 0.005; camera.fov = 72; camera.updateProjectionMatrix(); }
      const ex = P ? P.x : 0, ey = P ? P.y + (P.h || 0.3) * 0.88 : 0.45, ez = P ? P.z + 0.02 : -0.4;
      _c.set(ex, ey, ez); root.localToWorld(_c); const ly = C.ly || 0, lp = C.lp ?? -0.12; _v.set(ex - Math.sin(ly) * Math.cos(lp), ey + Math.sin(lp), ez - Math.cos(ly) * Math.cos(lp)); root.localToWorld(_v);
      camera.position.copy(_c); camera.lookAt(_v); camPos.copy(_c); camLook.copy(_v); camera.updateMatrixWorld(true);
      buildPit(camera); if (!PIT.g.parent) { let o = S.group; while (o.parent) o = o.parent; o.add(PIT.g); } PIT.g.position.copy(camera.position); PIT.g.quaternion.copy(camera.quaternion); drawPit(dt); return; }
    camPos.lerp(_l, k); camLook.lerp(_c, k); if (k === 1) { camPos.copy(_l); camLook.copy(_c); } camera.position.copy(camPos); camera.lookAt(camLook); }
  function talk() { if (!C.on) return 'none'; if (C.prompt === 'Fly ship') return 'fly'; if (C.near && C.near.act) { C.near.act(); return 'act'; } return 'none'; }
  return { C, enter, exit, tick, cam, talk };
}
