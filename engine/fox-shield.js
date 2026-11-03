// s193 FOX SHIELD (Ben: "start out with a shield · react to where it was hit · a little pulse when hit"; modelled on the 2D Space map's SCREEN).
// A bubble he stands INSIDE: a breathing cyan rim, a dark casing at the very edge so it reads on light AND dark floors. A hit lights + bulges the
// SECTION that was struck (it stays where it was hit, spreads a little, beats like glass giving and springing back), a white bloom at the contact
// point, sparks that SKID along the surface. Bank 100 · 1.2 per damage point · refills only after 3 quiet seconds (full in ~28 s) · empty = SCREEN
// DOWN (shockwave + a breath of safety) · relights at half a bank (SCREEN UP) · below 22% it gutters. Shows when danger is near or it is struck.
//   const SH = foxShield({ THREE }, fox, { threat: () => bool, say: (txt, colour) => {}, visible: () => bool })
//   fox.userData.shield = SH → combat.js / Pearl hurt() call SH.absorb(dmg, fromX, fromZ) first (true = the shield took it) · SH.update(dt) every frame
import { SFX } from './fighter-sfx.js?v=s695c';
const MAX = 100, PER_DMG = 1.2, RESTRIKE = 0.5, REGEN = MAX / 28, LOCK = 3, LOW = 0.22, NH = 6;
const VS = `uniform vec4 uHit[${NH}]; uniform float uMag[${NH}]; varying vec3 vN; varying vec3 vO;
float env(float t) { return smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.75, 1.0, t)); }
void main() { vec3 n = normalize(normal); float disp = 0.0;
  for (int i = 0; i < ${NH}; i++) { float t = uHit[i].w; if (t >= 1.0) continue; float d = dot(n, normalize(uHit[i].xyz));
    float k = smoothstep(0.72, 0.985, d), beat = 0.6 + 0.4 * sin(t * 26.0); disp += 0.07 * k * env(t) * beat * min(1.3, uMag[i]); }
  vO = n; vec3 p = position * (1.0 + disp); vN = normalize(normalMatrix * n); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
const FS = `uniform float uDeep; uniform float uTime; uniform float uVis; uniform float uPulse; uniform float uGut; uniform vec4 uHit[${NH}]; uniform float uMag[${NH}]; varying vec3 vN; varying vec3 vO;
float h3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x) { vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y), mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
float env(float t) { return smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.75, 1.0, t)); }
// lightning: thin cores + glow where drifting noise crosses its middle; one field crawls, one SNAPS 14x a second
float arcs(vec3 p, float t, out float glow) { float tq = floor(t * 14.0) / 14.0;
  float a = abs((n3(p * 3.0 + vec3(0.0, t * 2.2, t * 0.7)) + 0.5 * n3(p * 7.0 - vec3(t * 3.1, 0.0, t))) / 1.5 - 0.5);
  float b = abs(n3(p * 4.6 + vec3(tq * 9.0, -tq * 7.0, 3.7)) - 0.5);
  glow = (1.0 - smoothstep(0.0, 0.07, a)) * 0.45 + (1.0 - smoothstep(0.0, 0.055, b)) * 0.35;
  return (1.0 - smoothstep(0.0, 0.011, a)) + 0.9 * (1.0 - smoothstep(0.0, 0.009, b)); }
void main() { vec3 o = normalize(vO); float f = 1.0 - abs(normalize(vN).z);
  vec3 cyan = vec3(0.12, 0.80, 0.95), hot = vec3(0.92, 1.0, 1.0), ink = vec3(0.024, 0.086, 0.133), elec = vec3(0.10, 0.55, 1.0);
  // s193h THE STRUCK SECTION ONLY: energy POURS IN to support it (bolts converging on the spot), it pulses and holds, then settles. The rest stays calm.
  float zone = 0.0, core = 0.0, flow = 0.0, redF = 0.0, edgeF = 0.0, veinF = 0.0, waveF = 0.0, latF = 0.0;
  for (int i = 0; i < ${NH}; i++) { float t = uHit[i].w; if (t >= 1.0) continue; float m = min(1.4, uMag[i]); float ang = acos(clamp(dot(o, normalize(uHit[i].xyz)), -1.0, 1.0)), e = env(t);
    if (uDeep > 1.01) ang /= (0.8 + 0.3 * m);   /* s598z12 a heavier hit marks a bigger patch */
    float pulse = mix(0.65 + 0.35 * sin(t * 26.0), 0.12 + 0.88 * (0.5 + 0.5 * cos(t * 18.85)), step(1.01, uDeep));   /* s598z3 deep mode: 3 slow strong beats */
    zone = max(zone, (1.0 - smoothstep(0.25 - 0.05 * step(1.01, uDeep), 0.75 - 0.2 * step(1.01, uDeep), ang)) * e * pulse * m * uDeep);   /* s598z11 deep: a tighter, more directional patch */
    edgeF = max(edgeF, smoothstep(0.32, 0.46, ang) * (1.0 - smoothstep(0.5, 0.62, ang)) * e * pulse * min(1.4, uMag[i]) * step(1.01, uDeep));   /* s598z8 a crisp glowing RIM round the hit patch */
    redF = max(redF, (1.0 - smoothstep(0.0, 0.2, t)) * (1.0 - smoothstep(0.0, 0.55, ang)) * step(1.01, uDeep));   /* s598z4 a RED FLASH at the impact point, the first moment */
    core = max(core, (1.0 - smoothstep(0.0, 0.16 + 0.05 * pulse, ang)) * e * m);
    float ring = fract(ang * 5.5 + t * 6.0), streak = (1.0 - smoothstep(0.0, 0.12, ring)) * smoothstep(0.42, 0.62, n3(o * 9.0 + vec3(floor(t * 16.0) * 3.3)));
    flow = max(flow, streak * (1.0 - smoothstep(0.35, 1.25, ang)) * smoothstep(0.08, 0.2, ang) * e * m);
    if (uDeep > 1.01) {   /* s598z9 (Ben): ELECTRICITY runs from all over the shield INTO the hit, and the hit patch itself crackles */
      float tq = floor(t * 20.0), sp = ang * 3.2 - t * 9.0;
      float lane = 1.0 - smoothstep(0.0, 0.05 + 0.03 * (1.0 - e), abs(n3(vec3(o.x * 7.0 + tq * 1.3, o.y * 7.0, o.z * 7.0 - tq * 0.7) + vec3(sp)) - 0.5));
      flow = max(flow, lane * smoothstep(0.1, 0.3, ang) * (1.0 - smoothstep(0.55, 1.0, ang)) * e * m * 0.8 * (0.35 + 0.65 * pulse));   /* lanes surge on each beat */   /* s598z11: lanes stay close round the hit */
      float vein = 1.0 - smoothstep(0.0, 0.045, abs(n3(o * 16.0 + vec3(tq * 2.1, -tq * 1.7, tq)) - 0.5));
      float wr = t * 2.6; waveF = max(waveF, (1.0 - smoothstep(0.0, 0.06, abs(ang - wr))) * (1.0 - t) * (1.0 - t) * (1.0 - smoothstep(0.6, 1.2, ang)) * m * 0.8);   /* s598z10 a thin energy RIPPLE spreads out across the shield from the hit */
      vec3 q = o * 9.0; float gx = abs(fract(q.x + q.y * 0.5) - 0.5), gy = abs(fract(q.y * 0.866 + q.z * 0.5) - 0.5), gz = abs(fract(q.z + q.x * 0.5) - 0.5);
      latF = max(latF, (1.0 - smoothstep(0.0, 0.045, min(gx, min(gy, gz)))) * (1.0 - smoothstep(0.25, 0.6, ang)) * e * 0.6 * m);   /* the shield's PANEL LATTICE lights up round the hit */
      zone = max(zone, (1.0 - smoothstep(0.0, 0.5, ang)) * smoothstep(0.45, 0.75, t) * (1.0 - smoothstep(0.75, 1.0, t)) * 0.35 * m);   /* a soft AFTERGLOW as the patch heals */
      veinF = max(veinF, vein * (1.0 - smoothstep(0.22, 0.48, ang)) * e * (0.55 + 0.45 * pulse) * m); } }
  float body = smoothstep(0.42, 0.62, f), fil = smoothstep(0.70, 0.75, f) * (1.0 - smoothstep(0.80, 0.85, f)), cas = smoothstep(0.86, 0.92, f);
  vec3 col = mix(cyan, hot, fil * 0.9); col = mix(col, ink, cas);
  float a = (0.16 + 0.1 * f + body * 0.75) * uPulse * uGut; a = max(a, cas * 0.9 * uGut);
  float flick = 0.7 + 0.3 * step(0.3, fract(sin(floor(uTime * 20.0) * 43.7) * 917.3));
  float pop = smoothstep(0.62, 0.8, n3(o * 1.6 + vec3(floor(uTime * 3.0) * 7.1)));
  float gl; float c0 = arcs(o, uTime, gl); float amp = flick * uGut * (0.55 + 0.45 * f) * (1.0 + pop * 1.4 + zone * 4.0);
  col = mix(col, elec, clamp(gl * amp, 0.0, 0.8)); a = max(a, clamp(gl * amp * 0.75, 0.0, 0.85));
  col = mix(col, hot, clamp(c0 * amp, 0.0, 1.0)); a = max(a, clamp(c0 * amp, 0.0, 1.0));
  vec3 deep = mix(vec3(0.0, 0.45, 1.0), vec3(0.10, 0.62, 0.92), step(1.01, uDeep));   /* s598z7 deep mode: a slightly deeper shade of the shield's own cyan (Ben: too blue) */
  float dk = step(1.01, uDeep); col = mix(col, deep, clamp(zone * (0.8 + dk * 0.2), 0.0, 0.92)); a = max(a, clamp(zone * (0.9 - dk * 0.55), 0.0, 0.95 - dk * 0.55));   /* s598z8 deep mode: a see-through tinted patch (the ship stays visible) ... */
  col = mix(col, elec, clamp(latF * 0.8, 0.0, 0.8)); a = max(a, clamp(latF * 0.55, 0.0, 0.55));
  col = mix(col, hot, clamp(waveF * 0.9, 0.0, 0.9)); a = max(a, clamp(waveF * 0.6, 0.0, 0.7));
  col = mix(col, mix(elec, hot, 0.6), clamp(veinF * 1.4, 0.0, 1.0)); a = max(a, clamp(veinF * 1.1, 0.0, 0.9));   /* crackling veins inside the patch */
  col = mix(col, hot, clamp(edgeF * 0.9, 0.0, 0.9)); a = max(a, clamp(edgeF * 0.85, 0.0, 0.85));   /* ... with a bright pulsing rim that shows the direction */   // the supported patch thickens to deep electric blue
  col = mix(col, hot, clamp(flow * 1.2, 0.0, 1.0)); a = max(a, clamp(flow, 0.0, 1.0));           // bolts rushing IN to the spot
  col = mix(col, vec3(1.0), clamp(core, 0.0, 1.0)); a = max(a, clamp(core, 0.0, 1.0));           // the white-hot contact point, pulsing
  a += pow(n3(o * 10.0 + vec3(0.0, uTime * 7.0, 0.0)), 7.0) * 0.5 * (0.4 + f);
  gl_FragColor = vec4(col, clamp(a * uVis, 0.0, 1.0)); }`;
export function foxShield({ THREE }, fox, o = {}) {
  const U = { uDeep: { value: o.hitDeep || 1 }, uTime: { value: 0 }, uHit: { value: Array.from({ length: NH }, () => new THREE.Vector4(0, 1, 0, 1)) }, uMag: { value: new Array(NH).fill(0) }, uVis: { value: 0 }, uPulse: { value: 1 }, uGut: { value: 1 } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false });
  const TALL = !!(fox.userData && fox.userData.P && fox.userData.P.mapY);   /* s693 the jointed TALL hero build: a taller bubble so the ears stay inside */
  let R = o.r ?? (TALL ? 1.05 : 0.95), H = o.h ?? (TALL ? 1.62 : 1.3), CY = o.cy ?? (TALL ? 1.4 : 1.12), RZ = null;   // s566 let: resize() for the space fleet
  const bub = new THREE.Mesh(new THREE.SphereGeometry(1, o.lite ? 24 : 36, o.lite ? 16 : 24), mat); bub.scale.set(R, H, R); bub.position.y = CY; bub.renderOrder = 6; bub.frustumCulled = false; fox.add(bub);
  const sg = new THREE.SphereGeometry(0.04, 5, 4), sm = new THREE.MeshBasicMaterial({ color: 0x8ff0ff, transparent: true, depthWrite: false }), sparks = [];
  for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(sg, sm.clone()); m.visible = false; m.renderOrder = 7; fox.add(m); sparks.push({ m, v: new THREE.Vector3(), life: 0 }); }
  // s205 SHIELD BAR under his feet (Ben): a flat bar on the ground, dark casing + cyan fill (red when low, grey + blinking when down); shown when not full or just hit
  const barG = new THREE.Group(); barG.renderOrder = 8; fox.add(barG);   // s205b: VERTICAL, standing beside his body inside the bubble
  const BW = 1.5, bk = new THREE.Mesh(new THREE.PlaneGeometry(0.165, BW + 0.08), new THREE.MeshBasicMaterial({ color: 0x06141f, transparent: true, opacity: 0.85, depthWrite: false, depthTest: false })); bk.renderOrder = 8; barG.add(bk);
  const fgGeo = new THREE.PlaneGeometry(0.105, BW); fgGeo.translate(0, BW / 2, 0); const fg = new THREE.Mesh(fgGeo, new THREE.MeshBasicMaterial({ color: 0x4fdff2, transparent: true, depthWrite: false, depthTest: false })); fg.renderOrder = 9; fg.position.set(0, -BW / 2, 0.002); barG.add(fg);
  const tick = new THREE.Mesh(new THREE.PlaneGeometry(0.195, 0.03), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false, depthTest: false })); tick.renderOrder = 10; tick.position.set(0, -BW / 2 + BW * RESTRIKE, 0.004); barG.add(tick);
  const S = { pool: MAX, up: true, lock: 9, vis: 0, flash: 0, boom: 0, t: 0, hitT: 9, hits: [], safe: 0 }, _v = new THREE.Vector3(), _w = new THREE.Vector3();
  const say = (t, c) => { try { o.say && o.say(t, c); } catch (e) {} };
  const SH = {
    get pct() { return S.pool / MAX; }, get up() { return S.up; }, get safe() { return S.safe > 0; },
    disable(on) { S.off = !!on; if (on) { S.pool = 0; S.up = false; } },   /* s606 SHIP DAMAGE: a broken screen stays down until repaired */
    absorb(dmg, fx, fz, fy) { if (S.off) return false; if (S.safe > 0) return true; if (!S.up || S.pool <= 0) return false;
      S.pool = Math.max(0, S.pool - dmg * PER_DMG); S.lock = 0; S.hitT = 0; S.vis = 1; S.flash = Math.min(1.2, S.flash + 0.45 + dmg / 40);
      // the bearing of the blow, in the fox's own space (he can turn while it ripples: the mark stays on the bubble where it landed)
      fox.updateMatrixWorld(true); bub.getWorldPosition(_w); _v.set(fx ?? _w.x, fy ?? _w.y, fz ?? _w.z + 1).sub(_w); if (_v.lengthSq() < 1e-4) _v.set(0, 0, 1); _v.y *= 0.4;
      const q = fox.getWorldQuaternion(new THREE.Quaternion()).invert(); _v.applyQuaternion(q).normalize(); _v.x /= R; _v.y /= H; _v.z /= R; _v.normalize();
      S.hits.push({ d: _v.clone(), t: 0, mag: Math.min(1.7, 0.55 + dmg / 13) }); if (S.hits.length > NH) S.hits.shift();
      // sparks thrown ALONG the surface, a little outward: a shot skidding off something hard and curved
      const p0 = new THREE.Vector3(_v.x * R, _v.y * H + CY, _v.z * R), tan = new THREE.Vector3().crossVectors(_v, new THREE.Vector3(0, 1, 0)); if (tan.lengthSq() < 0.01) tan.set(1, 0, 0); tan.normalize();
      const DK = (o.hitDeep || 1) > 1.01, SK = DK ? Math.max(1, R / 0.7) : 1; let n = 0; for (const s of sparks) { if (s.life > 0) continue; if (n++ >= (DK ? 14 : 9)) break; const side = Math.random() < 0.5 ? 1 : -1, sp = (1.4 + Math.random() * 3.2) * (DK ? SK * 0.7 : 1); s.m.scale.setScalar(DK ? SK * 1.4 : 1);
        s.m.position.copy(p0); s.v.copy(tan).multiplyScalar(sp * side).addScaledVector(_v, 0.4 + Math.random() * 1.2); s.v.y += (Math.random() - 0.3) * 1.5; s.life = 0.45; s.m.visible = true; s.m.material.color.set(n % 3 ? 0x4fdff2 : 0xdffbff); }
      SFX.play('shield', { v: 0.6 + Math.min(0.6, dmg / 25) }); say(String(Math.round(dmg)), '#4fdff2');
      if (S.pool <= 0) SH.collapse(); return true; },
    collapse() { S.up = false; S.boom = 1; S.hits.length = 0; S.safe = 0.6; SFX.play('shieldDown'); say('SCREEN DOWN', '#f87171'); },
    restore() { if (S.off) return; S.pool = MAX; S.lock = 9; if (!S.up) { S.up = true; S.flash = 0.8; SFX.play('shieldUp'); say('SCREEN UP', '#4fdff2'); } S.hitT = 0; S.vis = 1; },   // s205 a SHIELD CELL pickup refills it at once
    update(dt) { S.t += dt; U.uTime.value = S.t; S.lock += dt; S.hitT += dt; S.safe = Math.max(0, S.safe - dt);
      if (S.off) S.pool = 0; else if (S.lock > LOCK && S.pool < MAX) S.pool = Math.min(MAX, S.pool + REGEN * dt);
      if (!S.up && S.pool >= MAX * RESTRIKE) { S.up = true; S.flash = Math.max(S.flash, 0.8); SFX.play('shieldUp'); say('SCREEN UP', '#4fdff2'); }
      let threat = false; try { threat = o.threat ? !!o.threat() : false; } catch (e) {}
      const want = (threat || S.hitT < 1.2) ? 1 : (o.idleVis ?? 0); S.vis += (want - S.vis) * Math.min(1, dt * (want > S.vis ? 7 : 2.7));
      S.flash = Math.max(0, S.flash - dt * 2.7);
      for (let i = S.hits.length - 1; i >= 0; i--) { S.hits[i].t += dt * 1.1; if (S.hits[i].t >= 1) S.hits.splice(i, 1); }
      for (let i = 0; i < NH; i++) { const h = S.hits[i]; if (h) { U.uHit.value[i].set(h.d.x, h.d.y, h.d.z, h.t); U.uMag.value[i] = h.mag; } else U.uHit.value[i].w = 1; }
      for (const s of sparks) { if (s.life <= 0) continue; s.life -= dt; s.m.position.addScaledVector(s.v, dt); s.v.multiplyScalar(1 - dt * 3); s.m.material.opacity = Math.max(0, s.life / 0.45); if (s.life <= 0) s.m.visible = false; }
      let shown = true; try { shown = o.visible ? !!o.visible() : true; } catch (e) {}
      { const pc = S.pool / MAX; fg.scale.y = Math.max(0.001, pc); fg.material.color.set(!S.up ? 0x6b7680 : pc < LOW ? 0xff4d4d : 0x4fdff2); fg.material.opacity = !S.up ? 0.5 + 0.5 * (Math.floor(S.t * 4) % 2) : 1;
        { const cy = o.barYaw ? o.barYaw() : 0, ly = cy - fox.rotation.y, sx = R * 0.74; barG.rotation.set(0, ly, 0); barG.position.set(Math.cos(ly) * sx, CY, -Math.sin(ly) * sx); }   /* stands up beside him (screen-right of his body), facing the camera */ barG.visible = shown && S.up && S.vis > 0.05 && (o.barAlways || pc < 0.999 || S.hitT < 2); }   // s205f: only while the shield is UP   // flat on the ground, always faces the camera's way
      if (S.boom > 0) { S.boom = Math.max(0, S.boom - dt * 2.7); const k = 1 + (1 - S.boom) * 1.6; bub.scale.set(R * k, H * k, (RZ ?? R) * k); U.uVis.value = S.boom; U.uPulse.value = 1; bub.visible = shown; return; }
      bub.scale.set(R, H, RZ ?? R);
      const pct = S.pool / MAX; U.uGut.value = pct < LOW ? 0.55 + Math.random() * 0.45 : 1;
      U.uPulse.value = 0.8 + Math.sin(S.t * 3.3) * 0.2; U.uVis.value = S.up ? S.vis : 0; bub.visible = shown && S.up && S.vis > 0.02; },
    resize(r, h, cy, rz) { R = r; H = h; RZ = rz ?? null; if (cy != null) CY = cy; bub.position.y = CY; bub.scale.set(R, H, RZ ?? R); },   // s566c rz = an ELLIPSOID (long hulls); without it the old round bubble   // s566 (space fleet: fit round a bigger ship)
    reattach() { fox.add(bub); for (const s of sparks) fox.add(s.m); fox.userData.shield = SH; },   // after an outfit swap rebuilt the fox
    dispose() { fox.remove(bub); bub.geometry.dispose(); mat.dispose(); for (const s of sparks) fox.remove(s.m); },
  };
  fox.userData.shield = SH; return SH;
}
