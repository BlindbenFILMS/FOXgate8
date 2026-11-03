// 8 GATES — KITSUNE ORB. Ben (sumo) and the Empress are fox kitsune in human form: they can collapse into a shimmering plasma orb and back.
// const K = kitsuneOrb({ THREE }); scene.add(K.group); K.attach(fig, 'blue' | 'violet'); K.toOrb() / K.toHuman(); each frame K.update(dt, camera).
// Sequence (toOrb): the body shimmers with sparks → shrinks into the chest → a blinding bright point → settles to a half-transparent plasma orb with orbiting fox-fire wisps.
export const ORB_PALETTES = {
  blue: { a: [0.49, 0.83, 0.99], b: [0.11, 0.3, 0.85], c: [0.04, 0.08, 0.3], glow: 0x7dd3fc },
  violet: { a: [0.91, 0.47, 0.98], b: [0.55, 0.13, 0.75], c: [0.18, 0.03, 0.25], glow: 0xe879f9 } };

export function kitsuneOrb({ THREE }) {
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), ss = t => t * t * (3 - 2 * t), cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const glowT = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), rg = g.createRadialGradient(64, 64, 0, 64, 64, 64); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.22, 'rgba(255,255,255,0.75)'); rg.addColorStop(0.5, 'rgba(255,255,255,0.22)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const starT = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.translate(64, 64); for (const [w, l, a] of [[5, 62, 0], [5, 62, Math.PI / 2], [3, 40, Math.PI / 4], [3, 40, -Math.PI / 4]]) { g.save(); g.rotate(a); const lg = g.createLinearGradient(0, -l, 0, l); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,1)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = lg; g.beginPath(); g.moveTo(0, -l); g.lineTo(w, 0); g.lineTo(0, l); g.lineTo(-w, 0); g.closePath(); g.fill(); g.restore(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const U = { hDir: { value: [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0)] }, hAge: { value: [9, 9, 9] }, hTouch: { value: [0, 0, 0] }, time: { value: 0 }, op: { value: 0 }, flash: { value: 0 }, ca: { value: new THREE.Vector3() }, cb: { value: new THREE.Vector3() }, cc: { value: new THREE.Vector3() } };
  const NOISE = `vec3 hash3(vec3 p){p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));return -1.0+2.0*fract(sin(p)*43758.5453);}
    float noise(vec3 p){vec3 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);return mix(mix(mix(dot(hash3(i),f),dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z);}
    float fbm(vec3 p){float s=0.0,a=0.5;for(int i=0;i<4;i++){s+=a*noise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=0.5;}return s;}`;
  const plasmaM = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: 'uniform vec3 hDir[3]; uniform float hAge[3]; uniform float hTouch[3]; varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vP = position; vec3 n0 = normalize(position); float b = 0.0; for (int i = 0; i < 3; i++) { float d = acos(clamp(dot(n0, normalize(hDir[i])), -1.0, 1.0)); b += hTouch[i] * exp(-d * d / 0.06) * 0.07 + exp(-pow((d - hAge[i] * 1.6) / 0.14, 2.0)) * exp(-hAge[i] * 2.5) * 0.035; } vec3 pos = position * (1.0 + b); vec4 mv = modelViewMatrix * vec4(pos,1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float time, op, flash; uniform vec3 ca, cb, cc; uniform vec3 hDir[3]; uniform float hAge[3]; uniform float hTouch[3]; varying vec3 vN; varying vec3 vV; varying vec3 vP;\n' + NOISE + `
      void main(){ vec3 p = normalize(vP) * 1.6; float t = time;
        float w = fbm(p * 1.4 + vec3(0.0, t * 0.35, t * 0.2));
        float n = fbm(p * 2.2 + vec3(w * 1.6, -t * 0.5, t * 0.3));
        float fil = 1.0 - smoothstep(0.0, 0.09, abs(n));                    // thin plasma filaments where the noise crosses zero
        float fil2 = 1.0 - smoothstep(0.0, 0.05, abs(fbm(p * 3.6 - vec3(t * 0.7, 0.0, w))));
        float fr = 1.0 - abs(dot(normalize(vN), normalize(vV))); float rim = pow(fr, 2.2);
        float cells = 0.5 + 0.5 * fbm(p * 1.1 - vec3(0.0, t * 0.25, 0.0));
        float hit = 0.0, wave = 0.0; vec3 n0 = normalize(vP); for (int i = 0; i < 3; i++) { float d = acos(clamp(dot(n0, normalize(hDir[i])), -1.0, 1.0)); hit += hTouch[i] * (exp(-d * d / 0.02) + 0.45 * exp(-d * d / 0.12)); float ag = hAge[i]; wave += exp(-pow((d - ag * 1.6) / 0.11, 2.0)) * exp(-ag * 1.8) * (0.8 + 0.6 * fil); }
        fil = clamp(fil + wave * 0.8 + hit * 0.5, 0.0, 1.0);
        vec3 col = mix(cc, cb, cells * 0.8 + rim * 0.4); col = mix(col, ca, clamp(fil * 0.9 + rim * 0.55, 0.0, 1.0)); col = mix(col, vec3(1.0), clamp(fil2 * 0.6 + flash, 0.0, 1.0));
        col = mix(col, vec3(1.0), clamp(hit * 0.85 + wave * 0.5, 0.0, 1.0)); col = mix(col, ca, clamp(wave * 0.4, 0.0, 1.0));
        float a = (0.22 + rim * 0.6 + fil * 0.45 + fil2 * 0.3 + cells * 0.12 + flash * 0.6) * op + (hit * 0.9 + wave * 0.55) * min(1.0, op * 2.2);
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0)); }` });
  const coreM = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float time, op, flash; uniform vec3 ca, cb; varying vec3 vN; varying vec3 vV; void main(){ float f = abs(dot(normalize(vN), normalize(vV))); float c = pow(f, 3.0); float pulse = 0.85 + 0.15 * sin(time * 5.0); gl_FragColor = vec4(mix(ca, vec3(1.0), c * 0.7 + flash * 0.3), (c * 0.75 * pulse + flash * c) * op); }' });
  const group = new THREE.Group(); group.visible = false;
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), plasmaM); shell.renderOrder = 20; group.add(shell);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 20), coreM); core.renderOrder = 19; group.add(core);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); halo.renderOrder = 18; group.add(halo);
  const point = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); point.renderOrder = 22; group.add(point);
  const star = new THREE.Sprite(new THREE.SpriteMaterial({ map: starT, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); star.renderOrder = 23; group.add(star);
  const light = new THREE.PointLight(0x7dd3fc, 0, 6, 2); group.add(light);
  // heart light: a deep blue core that stays still in the centre and pulses (lub-dub)
  const heartM = new THREE.MeshBasicMaterial({ color: 0xa8d4ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }), heart = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), heartM); heart.renderOrder = 21; group.add(heart);
  const heartG = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0x6aa8ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); heartG.renderOrder = 21; group.add(heartG);
  const heartC = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0xe6f2ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); heartC.renderOrder = 22; group.add(heartC);
  const heartL = new THREE.PointLight(0x8ac0ff, 0, 3, 2); group.add(heartL);
  // each pulse stretches the heart into a fresh random oval (random axis + aspect), then it shrinks back to a sphere
  const HP = { n: -1, from: new THREE.Quaternion(), q: new THREE.Quaternion(), ax: [1, 1, 1] }, rndOval = () => { const u = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(); HP.q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), u).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI)); const long = 1.5 + Math.random() * 0.9, mid = 0.75 + Math.random() * 0.45, thin = 0.55 + Math.random() * 0.3; HP.ax = [mid, long, thin]; };
  // kitsune-bi: three fox-fire wisps with fading trails orbiting the orb
  const wisps = [0, 1, 2].map(i => { const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); head.renderOrder = 21; group.add(head); const trail = []; for (let q = 0; q < 10; q++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.renderOrder = 21; group.add(s); trail.push(s); } return { head, trail, ph: i / 3 * Math.PI * 2, tilt: 0.5 + i * 0.6, hist: [], rp: i * 2.1, rs: 1.3 + i * 0.37, was: false }; });
  // sparks that fly off the body while it dissolves (world space, separate group)
  const sparkG = new THREE.Group(); const sparks = []; for (let i = 0; i < 60; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.renderOrder = 24; sparkG.add(s); sparks.push({ s, life: 0, v: V3(), p: V3() }); } group.add(sparkG);
  let fig = null, pal = ORB_PALETTES.blue, R = 0.315, S = { phase: 'human', t: 0, time: 0 }, chest = V3(), sparkI = 0, hum = 0;
  const setPal = name => { pal = ORB_PALETTES[name] || ORB_PALETTES.blue; U.ca.value.set(...pal.a); U.cb.value.set(...pal.b); U.cc.value.set(...pal.c); halo.material.color.setHex(pal.glow); light.color.setHex(pal.glow); wisps.forEach(w => { w.head.material.color.setHex(pal.glow); w.trail.forEach(s => s.material.color.setHex(pal.glow)); }); sparks.forEach((s, i) => s.s.material.color.setHex(i % 3 ? pal.glow : 0xffffff)); };
  setPal('blue');
  function chestPoint() { if (!fig) return V3(); const L = fig.userData.H.L; return V3(0, L.hipY + L.torsoL * 0.62, 0); }
  function attach(f, palName) { fig = f; R = Math.max(0.225, fig.userData.H.L.H * 0.1575); setPal(palName || 'blue'); if (S.phase !== 'human') { S.phase = 'human'; restore(); } }
  function restore() { if (!fig) return; fig.scale.setScalar(1); fig.userData.orbY = 0; fig.position.y = fig.userData.baseY || 0; fig.visible = true; group.visible = false; }
  const spark = (p, spd = 1) => { const q = sparks[sparkI = (sparkI + 1) % sparks.length]; q.p.copy(p); q.v.set((Math.random() - 0.5) * 1.6, Math.random() * 1.4 + 0.3, (Math.random() - 0.5) * 1.6).multiplyScalar(spd); q.life = 0.6 + Math.random() * 0.5; q.sz = 0.04 + Math.random() * 0.06; };
  function toOrb() { if (!fig || S.phase === 'orb' || S.phase === 'in') return; S.phase = 'in'; S.t = 0; chest.copy(chestPoint()); group.visible = true; }
  function toHuman() { if (!fig || S.phase === 'human' || S.phase === 'out') return; S.phase = 'out'; S.t = 0; fig.visible = true; }
  // timings (s): IN 0–0.7 shimmer · 0.7–1.3 shrink into the chest · 1.3–1.6 bright point · 1.6–2.4 settle to half-transparent orb.  OUT 0–0.35 flare · 0.35–1.0 grow back
  function update(dt, camera) { S.time += dt; U.time.value = S.time; if (!fig) return; S.t += dt; const t = S.t, base = fig.userData.baseY || 0;
    let figS = 1, shellS = 0, op = 0, fl = 0, pt = 0, glow = 0, bob = 0;
    if (S.phase === 'in') { if (t < 0.7) { figS = 1 + Math.sin(t * 60) * 0.006; if (Math.random() < 0.9) spark(fig.localToWorld(V3((Math.random() - 0.5) * 0.7, Math.random() * fig.userData.H.L.H, (Math.random() - 0.5) * 0.4)), 0.4); glow = t / 0.7 * 0.4; }
      else if (t < 1.3) { const u = ss((t - 0.7) / 0.6); figS = 1 - u; shellS = u * 0.55; op = u * 0.7; glow = 0.4 + u * 0.4; if (Math.random() < 0.8) spark(fig.localToWorld(chest.clone()), 1.2); }
      else if (t < 1.6) { const u = (t - 1.3) / 0.3; figS = 0; shellS = 0.55 + u * 0.55; pt = Math.sin(u * Math.PI); fl = pt; op = 0.7 + u * 0.3; glow = 0.8 + pt; if (u < 0.3) for (let i = 0; i < 3; i++) spark(fig.localToWorld(chest.clone()), 2.2); }
      else if (t < 2.4) { const u = ss((t - 1.6) / 0.8); figS = 0; shellS = 1.1 - u * 0.1; op = 1 - u * 0.65; fl = (1 - u) * 0.3; glow = 0.8 - u * 0.3; }
      else { S.phase = 'orb'; S.t = 0; } }
    if (S.phase === 'orb') { figS = 0; hum = Math.sin(S.time * 2.3) * 0.5 + Math.sin(S.time * 5.1) * 0.25; shellS = 1 + hum * 0.03; op = 0.35 + hum * 0.04; glow = 0.5 + hum * 0.08; fl = Math.max(0, Math.sin(S.time * 1.7) - 0.92) * 4; bob = Math.sin(S.time * 1.4) * 0.06; }
    if (S.phase === 'out') { if (t < 0.35) { const u = t / 0.35; figS = 0; shellS = 1 + u * 0.3; op = 0.35 + u * 0.65; pt = u; fl = u; glow = 0.5 + u; }
      else if (t < 1.0) { const u = ss((t - 0.35) / 0.65); figS = u; shellS = 1.3 * (1 - u); op = 1 - u; pt = 1 - u; fl = (1 - u) * 0.6; glow = 1.5 * (1 - u); if (Math.random() < 0.7) spark(fig.localToWorld(chest.clone()), 1); }
      else { S.phase = 'human'; restore(); return; } }
    // the figure scales around its chest so it collapses into the orb's centre
    const s = Math.max(0.0001, figS); fig.scale.setScalar(s); fig.visible = figS > 0.002; fig.userData.orbY = chest.y * (1 - s);
    const cw = V3(fig.position.x, base + chest.y, fig.position.z);
    group.position.copy(cw); group.position.y += bob * (S.phase === 'orb' ? 1 : 0); group.visible = S.phase !== 'human';
    shell.scale.setScalar(R * shellS); core.scale.setScalar(R * shellS * (0.9 + hum * 0.05)); U.op.value = op; U.flash.value = fl;
    halo.scale.setScalar(R * (2.6 + glow * 1.2)); halo.material.opacity = cl(glow * 0.3);
    point.scale.setScalar(R * (0.3 + pt * 5)); point.material.opacity = cl(pt * 1.1); star.scale.setScalar(R * (1 + pt * 7)); star.material.opacity = cl(pt); star.material.rotation = S.time * 0.6;
    light.intensity = glow * 2.2;
    { const hOn = S.phase === 'orb' ? 1 : S.phase === 'in' && t > 1.5 ? ss((t - 1.5) / 0.6) : S.phase === 'out' && t < 0.35 ? 1 - t / 0.35 : 0, b = (S.time * 1.1) % 1, beat = Math.exp(-(((b - 0.1) / 0.06) ** 2)) + 0.6 * Math.exp(-(((b - 0.3) / 0.06) ** 2)), p = 0.55 + 0.45 * beat;
      const pn = Math.floor(S.time * 0.75), pu = (S.time * 0.75) % 1; if (pn !== HP.n) { HP.n = pn; rndOval(); } const sw = Math.pow(Math.sin(pu * Math.PI), 1.6), base = R * (0.15 + 0.03 * beat);
      heart.position.set(0, 0, 0); heart.quaternion.copy(HP.q); heart.scale.set(base * (1 + (HP.ax[0] - 1) * sw), base * (1 + (HP.ax[1] - 1) * sw), base * (1 + (HP.ax[2] - 1) * sw)); heartM.opacity = hOn * (0.7 + 0.25 * beat);
      heartG.scale.setScalar(R * (0.6 + 0.35 * beat + 0.25 * sw)); heartG.material.opacity = hOn * p * 0.65; heartC.scale.setScalar(R * (0.16 + 0.08 * beat)); heartC.material.opacity = hOn * (0.35 + 0.45 * beat); heartL.intensity = hOn * (0.4 + 1.2 * beat); }
    const wOn = S.phase === 'orb' ? 1 : S.phase === 'in' && t > 1.6 ? ss((t - 1.6) / 0.8) : S.phase === 'out' && t < 0.35 ? 1 - t / 0.35 : 0;
    const Rs = R * Math.max(0.0001, shellS); wisps.forEach((w, i) => { w.ph += dt * (2.0 + i * 0.45); w.rp += dt * w.rs; w.tilt += dt * 0.13 * (i % 2 ? 1 : -1); const k = 0.5 + 0.43 * Math.pow(0.5 + 0.5 * Math.sin(w.rp), 1.6), r = Rs * k, lp = V3(Math.cos(w.ph) * r, Math.sin(w.ph * 1.7 + i) * r * 0.45, Math.sin(w.ph) * r).applyAxisAngle(V3(1, 0, 0), w.tilt).applyAxisAngle(V3(0, 1, 0), i * 2.09);
      const touch = wOn * cl((k - 0.8) / 0.1); U.hTouch.value[i] = touch; if (k > 0.86 && !w.was && wOn > 0.3) { w.was = true; U.hAge.value[i] = 0; U.hDir.value[i].copy(lp).normalize(); } if (k < 0.8) w.was = false; if (touch > 0.01) U.hDir.value[i].lerp(lp.clone().normalize(), 0.5).normalize(); U.hAge.value[i] += dt;
      w.head.position.copy(lp); w.head.scale.setScalar(R * 0.26 * (0.85 + 0.15 * Math.sin(S.time * 9 + i)) * (1 + touch * 0.5)); w.head.material.opacity = 0.95 * wOn;
      w.hist.unshift(lp.clone()); if (w.hist.length > 22) w.hist.pop(); w.trail.forEach((s2, q) => { const h = w.hist[Math.min(w.hist.length - 1, (q + 1) * 2)]; s2.position.copy(h); s2.scale.setScalar(R * 0.2 * (1 - q / 11)); s2.material.opacity = 0.55 * (1 - q / 10) * wOn; }); });
    for (const q of sparks) { if (q.life <= 0) { q.s.material.opacity = 0; continue; } q.life -= dt; q.v.y += dt * 0.6; q.p.addScaledVector(q.v, dt); q.s.position.copy(group.worldToLocal(q.p.clone())); q.s.scale.setScalar(q.sz * (q.life * 2)); q.s.material.opacity = cl(q.life * 1.6); }

  }
  return { group, attach, toOrb, toHuman, update, setPalette: setPal, get phase() { return S.phase; }, get isOrb() { return S.phase === 'orb' || S.phase === 'in'; } };
}
