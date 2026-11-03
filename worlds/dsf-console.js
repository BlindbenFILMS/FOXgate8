// CONSOLE GAMES (s354): Ben's DSF minigames played IN the station, no load screen. The fox walks up to the console,
// the camera flies in until the game surface fills the phone (portrait turns the view 90° so the long side of the plot
// runs down the screen), taps raycast onto the surface, LEAVE flies back out. One kit, every console game uses it.
// A game: { W, H, surface: { c: Vector3, u: Vector3, v: Vector3, n: Vector3, w, h }, stand: { x, z, face, y },
//   begin(), tick(dt, t), down(gx, gy), move(gx, gy), up(), hud() -> { stats, hint, card }, cardPick(i), end() }
export function makeConsoleKit({ THREE, camera, el, St, P, audio, W, H, damp, smooth, onClose }) {
  let G = null, fly = 0, out = false, walk = null;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3(), plane = new THREE.Plane();
  const camFrom = new THREE.Vector3(), lookFrom = new THREE.Vector3(), camTo = new THREE.Vector3(), lookTo = new THREE.Vector3(), upTo = new THREE.Vector3(), upFrom = new THREE.Vector3(0, 1, 0), tmp = new THREE.Vector3();
  const BAR = () => (Math.min(W(), H()) < 520 ? 52 : 60) + 10 + (Math.min(W(), H()) < 520 && W() < H() ? 46 : 0);
  const camSm = new THREE.Vector3(), lookSm = new THREE.Vector3(), upSm = new THREE.Vector3(); let snap = true, fovSm = 58;
  function pose() {
    if (G.camPose) return G.camPose(camTo, lookTo, upTo, W(), H(), BAR());
    const S = G.surface, portrait = W() / H() < 0.95 && S.turn !== false, a = W() / H();
    // s363 upright portrait (S.turn === false): the game may name the part of the board to fit, G.frame() -> [x0, y0, x1, y1] in game units
    const fr = a < 0.95 && !portrait && G.frame ? G.frame() : null, sw = fr ? (fr[2] - fr[0]) / G.W * S.w : S.w, shh = fr ? (fr[3] - fr[1]) / G.H * S.h : S.h;
    const C = tmp.copy(S.c); if (fr) C.addScaledVector(S.u, ((fr[0] + fr[2]) / 2 / G.W - 0.5) * S.w).addScaledVector(S.v, ((fr[1] + fr[3]) / 2 / G.H - 0.5) * S.h);
    const Ws = portrait ? shh : sw, Hs = portrait ? sw : shh, bar = BAR(), padB = a < 0.95 ? 18 : 12;
    const fracH = (H() - bar - padB) / H(), fracW = (W() - 20) / W();
    // fit at 50 degrees; under a low ceiling (S.maxD) open the lens instead of backing off (a flat surface seen square-on does not distort)
    let tf = Math.tan(25 * Math.PI / 180), d = Math.max(Hs / 2 / tf / fracH, Ws / 2 / (tf * a) / fracW) * 1.08;
    if (S.maxD && d > S.maxD) { tf *= d / S.maxD; d = S.maxD; }
    const fov = Math.min(104, Math.atan(tf) * 360 / Math.PI);
    upTo.copy(portrait ? S.u : S.v).multiplyScalar(portrait ? 1 : -1);
    const shift = ((bar - padB) / 2) / (H() / 2) * d * tf, tilt = 0.16 * Math.min(1, 50 / fov);
    lookTo.copy(C).addScaledVector(upTo, shift);
    camTo.copy(C).addScaledVector(S.n, d * Math.cos(tilt)).addScaledVector(upTo, -d * Math.sin(tilt) + shift);
    return fov; }
  function local(e) { const r = el.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
    const S = G.surface; plane.setFromNormalAndCoplanarPoint(S.n, S.c); if (!ray.ray.intersectPlane(plane, hit)) return null; tmp.copy(hit).sub(S.c);
    return { x: (tmp.dot(S.u) / S.w + 0.5) * G.W, y: (tmp.dot(S.v) / S.h + 0.5) * G.H }; }
  const live = () => G && !out && fly > 0.85 && !St.prompt;
  let pid = null;
  el.addEventListener('pointerdown', e => { if (!live()) return; const p = local(e); if (!p) return; pid = e.pointerId; try { el.setPointerCapture(e.pointerId); } catch (er) {} G.down(p.x, p.y); });
  el.addEventListener('pointermove', e => { if (!live() || e.pointerId !== pid) return; const p = local(e); if (p) G.move(p.x, p.y); });
  const up = e => { if (!G || e.pointerId !== pid) return; pid = null; G.up(); }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  return {
    get on() { return !!G; }, get fly() { return G ? fly : 0; }, get game() { return G; },
    open(game, cam, look) { if (G) return; G = game; out = false; fly = 0; camFrom.copy(cam); lookFrom.copy(look); upFrom.set(0, 1, 0);
      walk = { x0: P.x, z0: P.z, f0: P.face, t: 0 }; snap = true; St.game = true; audio.tone(220, 0.6, 0.04, 'sine', 2); setTimeout(() => audio.tone(880, 0.3, 0.03, 'triangle'), 380); G.begin(); },
    close() { if (!G || out) return; out = true; audio.tone(660, 0.4, 0.035, 'sine', 0.5); G.end(); },
    // returns true while it owns the camera
    tick(dt, t, camPos, camLook) { if (!G) return false;
      const S = G.stand; if (walk && walk.t < 1) { walk.t = Math.min(1, walk.t + dt / 0.7); const k = smooth(0, 1, walk.t); P.x = walk.x0 + (S.x - walk.x0) * k; P.z = walk.z0 + (S.z - walk.z0) * k; let df = S.face - walk.f0; df = Math.atan2(Math.sin(df), Math.cos(df)); P.face = walk.f0 + df * k; }
      fly = out ? Math.max(0, fly - dt / 0.8) : Math.min(1, fly + dt / 1.1); const k = smooth(0, 1, fly), fov0 = pose();
      // the target eases when the game changes its frame (stage changes, phone turned) instead of jumping
      if (snap) { camSm.copy(camTo); lookSm.copy(lookTo); upSm.copy(upTo); fovSm = fov0; snap = false; } else { const e = 1 - Math.exp(-dt * 5); camSm.lerp(camTo, e); lookSm.lerp(lookTo, e); upSm.lerp(upTo, e).normalize(); fovSm += (fov0 - fovSm) * e; }
      const fov = fovSm; upTo.copy(upSm);
      camPos.lerpVectors(camFrom, camSm, k); camLook.lerpVectors(lookFrom, lookSm, k);
      // arc the camera up and over on the way in so it never cuts through the console
      camPos.y += Math.sin(k * Math.PI) * 0.6; if (G.surface.maxY) camPos.y = Math.min(camPos.y, G.surface.maxY); camera.up.lerpVectors(upFrom, upTo, k).normalize();
      const f = 58 + (fov - 58) * k; if (Math.abs(camera.fov - f) > 0.01) { camera.fov = f; camera.updateProjectionMatrix(); }
      G.tick(dt, t, fly);
      if (out && fly <= 0) { camera.up.set(0, 1, 0); const g = G; G = null; St.game = false; St.snapCam = false; onClose && onClose(g); return false; }
      return true; },
    hud() { if (!G) return null; const h = G.hud(); return { title: G.title, where: G.where, ready: fly > 0.85 && !out, ...h }; },
    pick(i) { if (G && !out && G.cardPick(i) === 'leave') this.close(); },
  };
}
