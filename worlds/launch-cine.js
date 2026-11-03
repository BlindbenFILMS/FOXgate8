// 8 GATES · TAKE-OFF SHOT (s520, Ben: "an animation of the ship flying up and out of the atmosphere, ONE continuous camera shot into the
// space map; reusable for every planet we settle until it builds a space dock"). Planet side: the party boards, engines light, the ship lifts
// off the pad, noses up and climbs; the camera stays under + behind it the whole way while the sky turns black and the stars come out; the
// picture fades to black and the Space Map opens with ?launch=<world> (worlds/space-map.js phase 'launch' carries the same shot on:
// under + behind the ship climbing off the planet, swinging up into the map view).
// launchCine({ THREE, camera, scene, ship, pad: {x, y, z}, sky: {stars, fog}, fx: {thr, dust}, hide: [objects], audio, onDone }) → { tick(dt), done }
export function launchCine({ THREE, camera, scene, ship, pad, sky = {}, fx = {}, hide = [], audio, onDone }) {
  const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const C = { t: 0, done: false, fired: false }, look = new THREE.Vector3(), pos = new THREE.Vector3(), base = ship.position.clone(), black = new THREE.Color('#02030a'), tmp = new THREE.Color();
  const veil = document.createElement('div'); veil.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:2147482000;transition:none'; document.body.appendChild(veil);
  const rumble = () => { if (!audio) return; audio.tone(42, 1.2, 0.08, 'sawtooth', 1.6); audio.tone(66, 1.0, 0.05, 'square', 1.4); };
  let boarded = false, lit = false, lift = false, roar = 0;
  function tick(dt) { if (C.done) return true; C.t += dt; const t = C.t;
    if (!boarded && t > 1.0) { boarded = true; hide.forEach(o => { o.visible = false; }); audio && audio.tone(520, 0.12, 0.04, 'square'); }
    if (!lit && t > 1.6) { lit = true; rumble(); }
    if (!lift && t > 2.6) { lift = true; audio && audio.tone(55, 3.5, 0.09, 'sawtooth', 2.4); }
    roar -= dt; if (t > 2.6 && t < 7.5 && roar < 0) { roar = 0.5; audio && audio.tone(70 + t * 12, 0.6, 0.035, 'sawtooth', 1.3); }
    // the ship: hover up (2.6-4.2), nose up + climb, faster and faster
    const hov = ss(2.6, 4.2, t) * 10, up = Math.max(0, t - 4.2), climb = up * up * 55, nose = ss(3.8, 5.0, t) * 1.05;
    ship.position.set(base.x, base.y + hov + climb, base.z - up * up * 6); ship.rotation.x = nose; ship.rotation.z = Math.sin(t * 23) * 0.012 * (t > 1.6 && t < 5 ? 1 : 0);
    if (fx.thr) { fx.thr.material.opacity = t > 1.6 ? 0.95 : 0; fx.thr.scale.setScalar((t > 1.6 ? 5 + ss(1.6, 3, t) * 5 + ss(4.2, 7, t) * 14 : 0.01) + Math.sin(t * 40) * 0.7); }
    if (fx.dust) { fx.dust.material.opacity = ss(2.0, 2.8, t) * (1 - ss(4.2, 5.6, t)) * 0.8; fx.dust.scale.setScalar(12 + ss(2, 5, t) * 30); }
    // ONE camera move: wide side shot of the pad → drifts under + behind the ship as it rises → looks up after it into the dark
    const sx = base.x + 26, sy = base.y + 4, sz = base.z + 20, ux = base.x + 9, uz = base.z + 16, k = ss(2.2, 5.2, t);
    pos.set(sx + (ux - sx) * k, sy + (ship.position.y - 14 - sy) * k * (t > 5.2 ? 1 : ss(2.2, 5.2, t)), sz + (uz - sz) * k);
    if (t > 5.2) pos.y = Math.min(ship.position.y - 14, base.y + 4 + (t - 5.2) * 90);
    look.set(ship.position.x, ship.position.y + 2, ship.position.z - 2); camera.position.copy(pos); camera.lookAt(look);
    // the atmosphere thins: sky → black, the stars come out, the ground falls away into the dark
    const alt = ss(60, 700, ship.position.y); if (scene.background && scene.background.isColor) { tmp.copy(scene.background).lerp(black, alt); scene.background.copy(tmp); }
    if (scene.fog) { scene.fog.color.lerp(black, alt); scene.fog.near = 80 + alt * 400; scene.fog.far = 500 + alt * 1500; }
    if (sky.stars) { sky.stars.material.opacity = Math.max(sky.stars.material.opacity, alt); sky.stars.position.copy(camera.position); }
    veil.style.opacity = String(ss(7.9, 8.8, t));
    if (t > 8.9 && !C.fired) { C.fired = true; C.done = true; onDone && onDone(); setTimeout(() => veil.remove(), 4000); }
    return C.done; }
  return { tick, get t() { return C.t; }, cancel() { veil.remove(); C.done = true; } };
}

// s599 LANDING SHOT (Ben: "an animation for each player ship to land on EPHRAIM"): the reverse of the take-off. The ship (whatever hull you fly,
// the same group the take-off uses) drops out of the sky nose-down from the south, levels off, hovers on its thrusters over the LANDING PLATFORM
// and settles; one camera move from low on the ramp looking up → beside the platform. landCine({ THREE, camera, ship, sky, fx, hide, audio, onDone })
export function landCine({ THREE, camera, ship, fx = {}, hide = [], audio, onDone }) {
  const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const C = { t: 0, done: false }, base = ship.position.clone(), look = new THREE.Vector3(), pos = new THREE.Vector3(); hide.forEach(o => { o.visible = false; });
  let roar = 0, touched = false;
  function tick(dt) { if (C.done) return true; C.t += dt; const t = C.t, T = 6.4;
    const k = ss(0, 4.6, t), drop = (1 - k), hov = (1 - ss(4.6, 6.0, t)) * 6;
    ship.position.set(base.x, base.y + drop * drop * 260 + hov * (t > 4.6 ? 1 : k), base.z + drop * drop * 140); ship.rotation.x = -(1 - ss(2.6, 4.6, t)) * 0.7; ship.rotation.z = Math.sin(t * 21) * 0.01 * (t > 3 && t < 6 ? 1 : 0);
    roar -= dt; if (t < 6 && roar < 0) { roar = 0.5; audio && audio.tone(160 - t * 14, 0.6, 0.035, 'sawtooth', 1.3); }
    if (fx.thr) { fx.thr.material.opacity = t < 6.1 ? 0.95 : 0; fx.thr.scale.setScalar(t < 6.1 ? 6 + (1 - ss(4.6, 6.1, t)) * 10 + Math.sin(t * 40) * 0.7 : 0.01); }
    if (fx.dust) { fx.dust.material.opacity = ss(4.2, 5.2, t) * (1 - ss(6.0, 7.2, t)) * 0.8; fx.dust.scale.setScalar(12 + ss(4.2, 6.5, t) * 26); }
    if (!touched && t > 6.0) { touched = true; audio && audio.tone(48, 0.5, 0.09, 'sine', 1.2); }
    const m = ss(0.5, 5.8, t); const sk = ship.userData.sk || 1; pos.set(base.x + (10 + 16 * m) * sk, base.y + (3 + 4 * m) * sk, base.z - (34 - 6 * m) * sk); look.set(ship.position.x, ship.position.y + 2 * sk, ship.position.z); camera.position.copy(pos); camera.lookAt(look);
    if (t > T && !C.done) { C.done = true; ship.position.copy(base); ship.rotation.set(0, ship.rotation.y, 0); hide.forEach(o => { o.visible = true; }); onDone && onDone(); }
    return C.done; }
  return { tick, get t() { return C.t; }, cancel() { C.done = true; ship.position.copy(base); hide.forEach(o => { o.visible = true; }); } };
}
