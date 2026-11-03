// s339 SUPER MOVE GRAPHICS (Ben): the look of supers 04-15 from Super Moves.dc.html. Visual only (light: additive basic materials, no lights).
//   const FX = superFx({ THREE, scene }); FX.tick(dt) each frame; FX.play(key, fox, rig) · s340: rig.superPose poses Ben's body (batch 1 polished: chain rising dash nova meteor) · keys: rising dash nova meteor skyrain cyclone seekers wave reboot dome decoy burst
export const SUPER_FX = [   // [key, name, input, number on the Super Moves page]
  ['chain', 'CHAIN LIGHTNING', '↓ ↓ + 1', '03'], ['rising', 'RISING FANG', '↓ ↑ + 1', '04'], ['dash', 'BLUR DASH', '↔ ↔ + 1', '05'], ['nova', 'NOVA RING', '↔ ↔ + 2', '06'], ['meteor', 'METEOR DROP', '↑ ↑ + 1', '07'],
  ['skyrain', 'SKY RAIN', '↑ ↑ + 2', '08'], ['cyclone', 'TAIL CYCLONE', '↑ ↔ + 1', '09'], ['seekers', 'FOXFIRE SEEKERS', '↑ ↔ + 2', '10'], ['wave', 'GROUND WAVE', '↓ ↓ + 2', '11'],
  ['reboot', 'REBOOT PULSE', '↑ ↓ + 2', '12'], ['dome', '8-CREST DOME', '↑ ↓ + 1', '13'], ['decoy', 'DECOY FOX', '↓ ↑ + 2', '14'], ['burst', '8-GATE BURST', '↓ ↓ ↓ + 1', '15'],
  ['shadow', 'SHADOW STEP', '↔ ↑ + 1', '16'], ['tether', 'WHIP TETHER', '↔ ↓ + 1', '17'], ['frost', 'FROST NOVA', '↔ ↑ + 2', '18'], ['gravity', 'GRAVITY WELL', '↔ ↓ + 2', '19'],
  ['heal', 'HEALING LIGHT', '↑ ↑ ↑ + 1', '20'], ['mirror', 'MIRROR SHOT', '↔ ↔ ↔ + 2', '21'], ['firetrail', 'FIRE TRAIL', '↔ ↔ ↔ + 1', '22']];
export function superFx({ THREE, scene, make }) {   // make(key) → a cast fox (Hope / Noble for TEAM-UP), optional
  const cast = {}; const castFox = k => { if (cast[k] !== undefined) return cast[k]; try { cast[k] = make ? make(k) : null; if (cast[k]) { cast[k].visible = false; scene.add(cast[k]); } } catch (e) { cast[k] = null; } return cast[k]; };
  const PI = Math.PI, L = [], RED = 0x1f8bff, FIRE = 0xec3013, WHITE = 0xffffff, GOLD = 0xffd23a, CYAN = 0x7fe3ff;
  const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const glow = cv(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const txtT = {}; const txt = s => txtT[s] || (txtT[s] = cv(128, 128, (g) => { g.font = '900 110px Archivo, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#201e1d'; g.strokeText(s, 64, 70); g.fillStyle = '#ffffff'; g.fillText(s, 64, 70); }));
  const mat = (c, o = 1, extra) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, ...extra });
  const add = o => { scene.add(o); return o; };
  const kill = (o, keepGeo) => { scene.remove(o); o.traverse(m => { if (m.geometry && !keepGeo) m.geometry.dispose(); if (m.material && m.material.dispose) m.material.dispose(); }); };
  const fx = (life, upd, end) => L.push({ t: 0, life, upd, end });
  const after = (s, f) => fx(s, () => {}, f);
  const fw = fox => new THREE.Vector3(Math.sin(fox.rotation.y), 0, Math.cos(fox.rotation.y));
  const sideOf = f => new THREE.Vector3(f.z, 0, -f.x);
  const at = (fox, f, s, y = 0, sd = 0) => fox.position.clone().addScaledVector(f, s).addScaledVector(sideOf(f), sd).setY(fox.position.y + y);
  function sprite(pos, s, c, life, grow = 0.8, map = glow) { const sp = add(new THREE.Sprite(new THREE.SpriteMaterial({ map, color: c, transparent: true, depthWrite: false, blending: map === glow ? THREE.AdditiveBlending : THREE.NormalBlending }))); sp.position.copy(pos);
    fx(life, k => { sp.scale.setScalar(s * (0.6 + k * grow)); sp.material.opacity = 1 - k * k; }, () => kill(sp, true)); return sp; }
  function ring(pos, r0, r1, life, c, w = 0.12) { const m = add(new THREE.Mesh(new THREE.RingGeometry(1 - w, 1, 48), mat(c))); m.rotation.x = -PI / 2; m.position.copy(pos); m.position.y += 0.03;
    fx(life, k => { m.scale.setScalar(r0 + (r1 - r0) * (1 - (1 - k) * (1 - k))); m.material.opacity = 1 - k; }, () => kill(m)); }
  function bolt(a, b, dur, c, hit, len = 0.7) { const m = add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, len), mat(c))); m.position.copy(a); m.lookAt(b);
    fx(dur, k => m.position.lerpVectors(a, b, k), () => { kill(m); hit && hit(b); }); }
  function move(fox, path, life) { const b = fox.position.clone(); fx(life, k => { const o = path(k); fox.position.set(b.x + o.x, b.y + o.y, b.z + o.z); }, () => fox.position.copy(b)); }
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  // s339 Ben's recorded super sounds (audio/supers/super-<name>.mp3); muted while the game's mute is on
  const TRIM = new Set(['chain-hop', 'shadow-out', 'shadow-in', 'shadow-strike', 'whirl']);   // s340c trimmed short clips (.wav, silence cut, faded)
  const snd = (n, rate = 1, vol = 0.9) => { try { if (window.__muteAll) return; const a = new Audio(new URL('../audio/supers/super-' + n + (TRIM.has(n) ? '.wav' : '.mp3'), import.meta.url).href); a.volume = vol; a.preservesPitch = false; a.playbackRate = rate; a.play().catch(() => {}); } catch (e) {} };
  const strike = G => { try { G && G.strike && G.strike(); } catch (e) {} };
  const shoot = G => { try { G && G.shoot && G.shoot(); } catch (e) {} };
  function jag(a, b, n = 10, amp = 0.35) { const pts = []; for (let i = 0; i <= n; i++) { const p = a.clone().lerp(b, i / n); if (i && i < n) p.add(V((Math.random() - 0.5) * amp, (Math.random() - 0.5) * amp, (Math.random() - 0.5) * amp)); pts.push(p); } return pts; }
  // s340 BODY POSES: G.superPose(dur, fn) (engine/fighter-gear.js) poses Ben's arms / legs / body on top of the walk cycle
  const cl = x => Math.max(0, Math.min(1, x)), ss = x => x * x * (3 - 2 * x), seg = (p, a, b) => cl((p - a) / (b - a)), mix = (a, b, t) => a + (b - a) * t;
  const pose = (G, dur, fn) => { try { G && G.superPose && G.superPose(dur, fn); } catch (e) {} };
  const drawSword = G => { try { G && !G.drawn && G.draw && G.draw(true, true); } catch (e) {} };
  // afterimage: a see-through copy of Ben frozen where he stands, fading out (shares his geometry, one material)
  function ghost(fox, c, life = 0.35, op = 0.3) { const m0 = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op }), grp = add(new THREE.Group()); fox.updateMatrixWorld(true);
    fox.traverse(o => { let vis = true; for (let q = o; q; q = q.parent) if (!q.visible) { vis = false; break; } if (o.isMesh && vis && o.material && !o.material.transparent && o.material.side !== THREE.BackSide) { const m = new THREE.Mesh(o.geometry, m0); o.matrixWorld.decompose(m.position, m.quaternion, m.scale); grp.add(m); } });
    fx(life, k => { m0.opacity = op * (1 - k); }, () => { scene.remove(grp); m0.dispose(); }); }
  // dust / smoke puff (normal blending so it reads on a bright floor)
  function puff(p, c, s, life, v) { const sp = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: c, transparent: true, depthWrite: false, opacity: 0.6 }))); sp.position.copy(p);
    fx(life, (k, dt) => { if (v) sp.position.addScaledVector(v, dt); sp.scale.setScalar(s * (0.5 + k)); sp.material.opacity = 0.6 * (1 - k); }, () => kill(sp, true)); }
  function dustRing(p, n = 10, r = 0.6, c = 0xb8b2aa) { for (let i = 0; i < n; i++) { const a = i / n * PI * 2; puff(p.clone().add(V(Math.cos(a) * r, 0.15, Math.sin(a) * r)), c, 0.9, 0.55, V(Math.cos(a) * 2.2, 0.4, Math.sin(a) * 2.2)); } }
  function zapLine(a, b, c, life, amp = 0.3, op = 1) { const l = add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(jag(a, b, 6, amp)), new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })));
    fx(life, k => { l.geometry.setFromPoints(jag(a, b, 6, amp)); l.material.opacity = op * (1 - k); }, () => kill(l)); }
  const MOVES = {
    // s339 SHADOW STEP (16, ↔ ↑ + 1; Ben kept Whirlwind as 01): Ben vanishes in dark smoke, reappears behind the target, strikes, smokes back
    shadow(fox, G) { const f = fw(fox), base = fox.position.clone(), yaw = fox.rotation.y, T = at(fox, f, 3.4, 0), back = T.clone().addScaledVector(f, 1.1);
      const smoke = p => { for (let i = 0; i < 9; i++) { const sp = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: i % 3 ? 0x2a2140 : 0x6b4fa8, transparent: true, depthWrite: false }))); sp.position.copy(p).add(V((Math.random() - 0.5) * 0.8, 0.3 + Math.random() * 1.6, (Math.random() - 0.5) * 0.8)); const v = V((Math.random() - 0.5) * 1.2, 0.8 + Math.random(), (Math.random() - 0.5) * 1.2);
        fx(0.6, (k, dt) => { sp.position.addScaledVector(v, dt); sp.scale.setScalar(0.6 + k * 1.4); sp.material.opacity = 0.9 * (1 - k); }, () => kill(sp, true)); } ring(p, 0.2, 1.4, 0.4, 0x6b4fa8, 0.2); };
      smoke(base); fox.visible = false; snd('shadow-out');
      const trail = add(new THREE.Mesh(new THREE.PlaneGeometry(0.06, base.distanceTo(back)), mat(0x9b7fe0, 0.8))); trail.position.copy(base.clone().lerp(back, 0.5).setY(base.y + 1)); trail.rotation.set(PI / 2, 0, -yaw); fx(0.35, k => { trail.material.opacity = 0.8 * (1 - k); trail.scale.x = 1 + k * 8; }, () => kill(trail));
      after(0.25, () => { snd('shadow-in'); fox.position.copy(back); fox.rotation.y = yaw + PI; fox.visible = true; smoke(back); sprite(back.clone().setY(back.y + 1), 1.6, 0x9b7fe0, 0.3); });
      after(0.42, () => { snd('shadow-strike'); strike(G); const p = T.clone().setY(T.y + 1.1); for (const r of [PI / 4, -PI / 4]) { const x = add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.07, 0.07), mat(WHITE))); x.position.copy(p); x.rotation.set(0, yaw + PI / 2, r); fx(0.4, k => { x.material.opacity = 1 - k; x.scale.x = 0.4 + k; }, () => kill(x)); } sprite(p, 1.6, 0x9b7fe0, 0.3); sprite(p, 0.9, WHITE, 0.2); });
      after(1.1, () => { snd('shadow-out', 1, 0.6); smoke(fox.position.clone()); fox.visible = false; });
      after(1.35, () => { snd('shadow-in', 1, 0.6); fox.position.copy(base); fox.rotation.y = yaw; fox.visible = true; smoke(base); }); },
    // s339 WHIP TETHER (17): the bullwhip lashes out to a target 5 m ahead, cracks, and yanks it to Ben (a dummy marker comes flying in)
    tether(fox, G) { const f = fw(fox), hand = at(fox, f, 0.4, 1.2, 0.3), tgt = at(fox, f, 5, 1.0), N = 18; strike(G);
      const g = new THREE.BufferGeometry().setFromPoints(Array.from({ length: N + 1 }, () => hand.clone())), whip = add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xc08a50, transparent: true })));
      const dummy = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.28), mat(RED, 0.9))); dummy.position.copy(tgt);
      fx(1.0, k => { const p = g.attributes.position, end = k < 0.3 ? hand.clone().lerp(tgt, k / 0.3) : k < 0.45 ? tgt.clone() : tgt.clone().lerp(at(fox, f, 1.1, 1.0), Math.min(1, (k - 0.45) / 0.35));
        if (k >= 0.45) dummy.position.copy(end);
        for (let i = 0; i <= N; i++) { const u = i / N, q = hand.clone().lerp(end, u); q.y += Math.sin(u * PI) * (k < 0.3 ? 0.6 * (1 - k / 0.3) : 0.15) + Math.sin(u * 12 - k * 30) * 0.05 * (1 - u); p.setXYZ(i, q.x, q.y, q.z); } p.needsUpdate = true; whip.material.opacity = k > 0.85 ? (1 - k) / 0.15 : 1; dummy.rotation.y += 0.2; },
        () => { kill(whip); kill(dummy); });
      after(0.3, () => { sprite(tgt, 1.2, WHITE, 0.2); ring(tgt.clone().setY(fox.position.y), 0.1, 0.9, 0.3, GOLD); });
      after(0.8, () => { const p = at(fox, f, 1.1, 1.0); sprite(p, 1.4, RED, 0.25); }); },
    // s339 FROST NOVA (18): a ring of ice bursts out; spikes of ice stand up round Ben for 2 s, frost mist, then shatter
    frost(fox, G) { const c = fox.position.clone(); shoot(G); ring(c, 0.3, 4.2, 0.5, 0xbfe9ff, 0.2); ring(c, 0.2, 3.2, 0.4, WHITE); sprite(c.clone().setY(c.y + 1), 3, 0xbfe9ff, 0.4);
      const ice = new THREE.MeshBasicMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0.75 }), spikes = [];
      for (let i = 0; i < 16; i++) { const a = i / 16 * PI * 2 + Math.random() * 0.2, r0 = 1.6 + Math.random() * 1.8, sp = add(new THREE.Mesh(new THREE.ConeGeometry(0.16 + Math.random() * 0.1, 0.7 + Math.random() * 0.7, 5), ice)); sp.position.set(c.x + Math.cos(a) * r0, c.y, c.z + Math.sin(a) * r0); sp.rotation.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5); sp.scale.setScalar(0.01); spikes.push({ sp, d: r0 / 4.2 * 0.25 }); }
      fx(2.4, k => { const t = k * 2.4; for (const q of spikes) { const u = Math.min(1, Math.max(0, (t - q.d) / 0.15)); q.sp.scale.setScalar(t > 2.1 ? Math.max(0.01, 1 - (t - 2.1) / 0.3) : Math.max(0.01, u)); } ice.opacity = t > 2.1 ? 0.75 * (1 - (t - 2.1) / 0.3) : 0.75; },
        () => { spikes.forEach(q => { const p = q.sp.position.clone(); scene.remove(q.sp); q.sp.geometry.dispose(); if (Math.random() < 0.5) sprite(p.setY(p.y + 0.4), 0.7, WHITE, 0.25); }); ice.dispose(); });
      for (let i = 0; i < 10; i++) after(Math.random() * 1.6, () => { const a = Math.random() * PI * 2, r1 = Math.random() * 3.5; sprite(c.clone().add(V(Math.cos(a) * r1, 0.3 + Math.random(), Math.sin(a) * r1)), 1.2, 0x9fd4ff, 0.8, 1.2); }); },
    // s339 GRAVITY WELL (19): a dark orb lobs 4 m ahead and lands; rings spiral INTO it and debris gets sucked in for 2 s, then a soft implosion pop
    gravity(fox, G) { const f = fw(fox), from = at(fox, f, 0.6, 1.3), c = at(fox, f, 4, 0.8); shoot(G);
      const orb = add(new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), new THREE.MeshBasicMaterial({ color: 0x120a24 }))), halo = add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), mat(0x7a4fe0, 0.5))); orb.position.copy(from); halo.position.copy(from);
      fx(0.4, k => { const p = from.clone().lerp(c, k); p.y += Math.sin(k * PI) * 1.2; orb.position.copy(p); halo.position.copy(p); });
      after(0.4, () => { const deb = []; for (let i = 0; i < 14; i++) { const d = add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xc9ced3, transparent: true }))); const a = Math.random() * PI * 2; deb.push({ d, a, r: 2.5 + Math.random() * 1.5, h: Math.random() * 1.6 }); }
        const rings = [0, 1, 2].map(() => { const m = add(new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 40), mat(0x9b7fe0))); m.rotation.x = -PI / 2; m.position.copy(c).setY(fox.position.y + 0.04); return m; });
        fx(2.0, (k, dt) => { halo.scale.setScalar(1 + 0.25 * Math.sin(k * 40)); rings.forEach((m, i) => { const u = (k * 2.2 + i / 3) % 1; m.scale.setScalar(3.6 * (1 - u) + 0.2); m.material.opacity = u * 0.9; });
          for (const q of deb) { q.a += dt * (2 + 3 / q.r); q.r = Math.max(0.2, q.r - dt * 1.6); q.d.position.set(c.x + Math.cos(q.a) * q.r, c.y - 0.6 + q.h * (q.r / 4), c.z + Math.sin(q.a) * q.r); q.d.material.opacity = Math.min(1, q.r); } },
          () => { rings.forEach(m => kill(m)); deb.forEach(q => kill(q.d)); kill(orb); kill(halo); sprite(c, 2.4, 0x9b7fe0, 0.35); sprite(c, 1.2, WHITE, 0.2); ring(c.clone().setY(fox.position.y), 0.2, 2.6, 0.4, 0x9b7fe0); }); }); },
    // s339 HEALING LIGHT (20): a gold column, rings rising round Ben, motes drifting in, gold + crosses floating up
    heal(fox, G) { const c = fox.position.clone(); try { G && G.powerFx && G.powerFx(0xffd23a, 1.2); } catch (e) {}
      const col = add(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 4, 24, 1, true), mat(GOLD, 0))); col.position.copy(c).setY(c.y + 2);
      fx(1.6, k => { col.material.opacity = 0.28 * Math.sin(k * PI); col.scale.set(1 + k * 0.3, 1, 1 + k * 0.3); col.position.copy(fox.position).setY(fox.position.y + 2); }, () => kill(col));
      ring(c, 0.3, 2.4, 0.7, GOLD, 0.15); sprite(c.clone().setY(c.y + 1.1), 2.6, GOLD, 0.6);
      for (let i = 0; i < 6; i++) after(0.15 + i * 0.18, () => { const a = Math.random() * PI * 2, p = fox.position.clone().add(V(Math.cos(a) * 0.7, 0.6 + Math.random() * 0.8, Math.sin(a) * 0.7)), t = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: txt('+'), color: GOLD, transparent: true, depthWrite: false }))); t.position.copy(p);
        fx(0.9, k => { t.position.y = p.y + k * 1.2; t.scale.setScalar(0.35 + k * 0.15); t.material.opacity = 1 - k * k; }, () => kill(t, true)); }); },
    // s339 MIRROR SHOT (21): one bolt that ricochets 6 times between targets + walls, a flash + ping ring at each bounce
    mirror(fox, G) { const f = fw(fox); shoot(G); const pts = [at(fox, f, 0.6, 1.2), at(fox, f, 3, 1.1, 2.2), at(fox, f, 4.5, 1.0, -2.4), at(fox, f, 6.2, 1.2, 2.0), at(fox, f, 5.0, 1.0, -0.6), at(fox, f, 7.4, 1.1, -2.6), at(fox, f, 8.6, 1.0, 1.2)];
      for (let i = 0; i < pts.length - 1; i++) after(i * 0.13, () => { const a = pts[i], b = pts[i + 1]; bolt(a.clone(), b.clone(), 0.13, i % 2 ? WHITE : 0x7fe3ff, p => { sprite(p, 1.0, 0x7fe3ff, 0.25); ring(p.clone(), 0.1, 0.6, 0.25, WHITE); }, 0.9);
        const tr = add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), new THREE.LineBasicMaterial({ color: 0x7fe3ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }))); fx(0.5, k => { tr.material.opacity = 0.6 * (1 - k); }, () => kill(tr)); }); },
    // s339 FIRE TRAIL (22): Ben dashes 4 m and a line of flames burns behind him for 2 s
    firetrail(fox, G) { const f = fw(fox), base = fox.position.clone(); strike(G); move(fox, k => (k < 0.3 ? f.clone().multiplyScalar(4 * k / 0.3) : f.clone().multiplyScalar(4)), 0.5);
      after(0.5, () => fox.position.copy(base).addScaledVector(f, 4));   // he stays where he dashed to... then the lab steps him back
      for (let i = 0; i < 14; i++) after(i * 0.02, () => { const p = base.clone().addScaledVector(f, 0.3 + i * 0.28).addScaledVector(sideOf(f), (Math.random() - 0.5) * 0.3); const fl = []; for (let j = 0; j < 2; j++) { const sp = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: j ? 0xffb23a : FIRE, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))); fl.push(sp); }
        const ph = Math.random() * 6; fx(2.2, k => { const o = Math.min(1, k * 10) * Math.min(1, (1 - k) * 4), t = k * 2.2; fl.forEach((sp, j) => { sp.position.set(p.x, p.y + 0.25 + j * 0.25 + 0.08 * Math.sin(t * 18 + ph + j), p.z); sp.scale.set(0.6 - j * 0.2, (0.9 - j * 0.25) * (1 + 0.25 * Math.sin(t * 22 + ph)), 1); sp.material.opacity = o; }); }, () => fl.forEach(sp => kill(sp, true))); });
      after(2.4, () => fox.position.copy(base)); },
    // s340 CHAIN LIGHTNING (03): Ben pulls his hand back while sparks crackle round it, then THRUSTS it forward; the bolt jumps 5 targets (forks + a flicker on each), the arm shakes with the current
    chain(fox, G) { const f = fw(fox); const src = at(fox, f, 0.75, 1.3, -0.3);
      pose(G, 1.25, (p, R) => { const c = ss(seg(p, 0, 0.16)), go = ss(seg(p, 0.16, 0.24)), r = ss(seg(p, 0.82, 1)), hold = go * (1 - r), j = Math.sin(R.t * 70) * 0.06 * hold;
        R.A[0].rotation.set(mix(0.55 * c, -1.5 + j, go) * (1 - r), 0, mix(-0.5 * c, -0.05, go) * (1 - r) - 0.12 * r);
        R.A[1].rotation.set(mix(-0.3 * c, -0.45, go) * (1 - r), 0, mix(0.4 * c, 0.75, go) * (1 - r) + 0.12 * r);
        R.B.rotation.y = mix(0.5 * c, -0.3, go) * (1 - r); R.H.rotation.z = j * 0.5; R.Lg[0].rotation.x = -0.35 * hold; R.Lg[1].rotation.x = 0.3 * hold;
        return { bx: mix(-0.12 * c, 0.14, go) * (1 - r) }; });
      for (let i = 0; i < 6; i++) after(i * 0.03, () => { const p = at(fox, f, 0.2, 1.2, -0.45); zapLine(p, p.clone().add(V((Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 0.7)), i % 2 ? WHITE : 0x7fc8ff, 0.12, 0.12); });
      after(0.06, () => sprite(at(fox, f, 0.2, 1.2, -0.45), 0.9, 0xbfe6ff, 0.18));
      const nodes = [src, at(fox, f, 2.6, 1.0, 0.9), at(fox, f, 3.8, 1.1, -1.2), at(fox, f, 5.0, 1.0, 1.4), at(fox, f, 6.2, 1.2, -0.6), at(fox, f, 7.4, 1.0, 1.0)];
      after(0.2, () => { sprite(src, 1.6, 0xbfe6ff, 0.35); sprite(src, 0.7, WHITE, 0.2); });
      for (let i = 0; i < 5; i++) after(0.2 + i * 0.14, () => { const a = nodes[i], b = nodes[i + 1]; snd('chain-hop', 1 + i * 0.05, 0.45);
        const mk = (col, op) => add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(jag(a, b)), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })));
        const ls = [mk(WHITE, 1), mk(0x7fc8ff, 0.8), mk(0x7fc8ff, 0.5)], life = 0.75 - i * 0.06;
        fx(life, k => { for (const l of ls) { l.geometry.setFromPoints(jag(a, b, 10, 0.35 + Math.random() * 0.2)); l.material.opacity = (1 - k) * (Math.random() < 0.15 ? 0.3 : 1); } }, () => ls.forEach(l => kill(l)));
        const mid = a.clone().lerp(b, 0.4 + Math.random() * 0.3); zapLine(mid, mid.clone().add(V((Math.random() - 0.5) * 1.6, -0.4 - Math.random() * 0.6, (Math.random() - 0.5) * 1.6)), 0x7fc8ff, 0.3, 0.2, 0.8);
        sprite(b, 1.6, 0xbfe6ff, 0.35); ring(b.clone().setY(fox.position.y), 0.15, 1.1, 0.35, 0x7fc8ff);
        const fl = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0x9fdcff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))); fl.position.copy(b); fl.scale.setScalar(1.1);
        fx(0.7, k => { fl.material.opacity = (1 - k) * (Math.random() < 0.5 ? 1 : 0.25); }, () => kill(fl, true));
        for (let j = 0; j < 4; j++) { const sp = add(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.25), mat(WHITE))); sp.position.copy(b); const v = V((Math.random() - 0.5) * 6, Math.random() * 4, (Math.random() - 0.5) * 6); sp.lookAt(b.clone().add(v)); fx(0.3, (k, dt) => { sp.position.addScaledVector(v, dt); sp.material.opacity = 1 - k; }, () => kill(sp)); } }); },
    // s340 RISING FANG (04): crouch, then a spinning sword uppercut straight up (knee tucked, back arched), 3 red fangs climb with him, dust at take-off, a puff on landing
    rising(fox, G) { const f = fw(fox); drawSword(G);
      move(fox, k => V(0, k < 0.2 ? 0 : Math.sin(seg(k, 0.2, 1) * PI) * 1.6, 0), 0.9);
      pose(G, 0.9, (p, R) => { const c = ss(seg(p, 0, 0.2)), u = seg(p, 0.2, 0.55), up = ss(u), dn = ss(seg(p, 0.7, 1)), air = p > 0.2 && p < 0.92 ? 1 : 0;
        R.A[1].rotation.set(p < 0.2 ? 0.6 * c : mix(0.6, -3.1, Math.pow(u, 0.5)) * (1 - dn) - 0.4 * dn, 0, 0.2 + 0.2 * up * (1 - dn));
        R.A[0].rotation.set(p < 0.2 ? 0.3 * c : mix(0.3, 0.5, up) * (1 - dn), 0, mix(-0.3 * c, -0.7, up) * (1 - dn) - 0.12 * dn);
        R.Lg[0].rotation.x = p < 0.2 ? 0.25 * c : -1.1 * air * (1 - dn); R.Lg[1].rotation.x = p < 0.2 ? -0.25 * c : 0.4 * air * (1 - dn);
        R.B.rotation.y = -PI * 2 * up; if (R.sword) R.sword.rotation.set(PI - 0.2, 0, 0);
        return { bx: p < 0.2 ? 0.28 * c : -0.22 * up * (1 - dn), lift: p < 0.2 ? -0.16 * c : -0.1 * dn * (1 - seg(p, 0.92, 1)) }; });
      after(0.17, () => { const g = fox.position.clone(); dustRing(g, 8, 0.5); ring(g, 0.2, 1.6, 0.4, WHITE, 0.15); });
      for (let n = 0; n < 3; n++) after(0.18 + n * 0.07, () => { const arc = add(new THREE.Mesh(new THREE.TorusGeometry(1.0 - n * 0.15, 0.06, 6, 40, PI), mat(n === 1 ? WHITE : RED))); arc.position.copy(at(fox, f, 0.8, 0.4)); arc.rotation.set(0, fox.rotation.y - PI / 2 + (n - 1) * 0.5, 0);
        const core = new THREE.Mesh(new THREE.TorusGeometry(1.0 - n * 0.15, 0.02, 4, 40, PI), mat(WHITE)); arc.add(core);
        fx(0.5, k => { arc.position.y = fox.position.y + 0.4 + k * 2.2; arc.scale.setScalar(0.6 + k * 0.6); arc.material.opacity = core.material.opacity = 1 - k; }, () => kill(arc)); });
      for (let i = 0; i < 6; i++) after(0.2 + i * 0.04, () => { const a = Math.random() * PI * 2, p = fox.position.clone().add(V(Math.cos(a) * 0.7, 0.4, Math.sin(a) * 0.7)); const st = add(new THREE.Mesh(new THREE.PlaneGeometry(0.04, 1.4), mat(i % 2 ? WHITE : RED, 0.8))); st.position.copy(p); st.lookAt(p.clone().add(V(Math.cos(a), 0, Math.sin(a))));
        fx(0.3, k => { st.position.y = p.y + 0.6 + k * 2; st.material.opacity = 0.8 * (1 - k); }, () => kill(st)); });
      after(0.5, () => { const p = fox.position.clone().setY(fox.position.y + 2.6); sprite(p, 1.8, WHITE, 0.25); sprite(p, 2.6, RED, 0.35); });
      after(0.9, () => { dustRing(fox.position.clone(), 6, 0.4); }); },
    // s340 BLUR DASH (05): Ben leans in hard with his arms swept back and RUSHES 3.4 m, leaving red afterimages; three crossed cuts flash along the line; the lab slides him back
    dash(fox, G) { const f = fw(fox), base = fox.position.clone(); drawSword(G);
      move(fox, k => (k < 0.1 ? f.clone().multiplyScalar(-0.15 * ss(k / 0.1)) : k < 0.32 ? f.clone().multiplyScalar(mix(-0.15, 3.4, ss(seg(k, 0.1, 0.32)))) : k < 0.7 ? f.clone().multiplyScalar(3.4) : f.clone().multiplyScalar(3.4 * (1 - ss(seg(k, 0.7, 1))))), 0.9);
      pose(G, 0.9, (p, R) => { const a = ss(seg(p, 0, 0.1)), d = ss(seg(p, 0.1, 0.16)) * (1 - ss(seg(p, 0.32, 0.4))), cut = ss(seg(p, 0.32, 0.42)) * (1 - ss(seg(p, 0.62, 0.72)));
        R.A[0].rotation.set(mix(-0.3 * a, 1.25, d) - 0.6 * cut, 0, -0.35 * d - 0.3 * cut - 0.12);
        R.A[1].rotation.set(mix(-0.3 * a, 1.25, d) + mix(0, -1.45, cut), 0, mix(0.12, 0.35, d) + mix(0, -0.4, cut) * (1 - d));
        R.Lg[0].rotation.x = -0.9 * d + 0.25 * cut; R.Lg[1].rotation.x = 0.7 * d - 0.45 * cut; R.B.rotation.y = mix(0, -0.7, cut); if (R.sword) R.sword.rotation.set(PI - 0.15, 0, 0);
        return { bx: -0.1 * a * (1 - d) + 0.5 * d + 0.12 * cut, lift: -0.12 * cut }; });
      for (let i = 0; i < 3; i++) after(0.13 + i * 0.06, () => ghost(fox, i === 2 ? 0xff8a6a : RED, 0.3, 0.38 - i * 0.08));
      after(0.1, () => { dustRing(base.clone(), 6, 0.3); });
      after(0.12, () => { for (const y of [0.6, 1.0, 1.4]) { const s2 = add(new THREE.Mesh(new THREE.PlaneGeometry(0.05, 3.4), mat(y === 1.0 ? WHITE : RED, 0.9))); s2.position.copy(base.clone().addScaledVector(f, 1.7).setY(base.y + y)); s2.rotation.set(PI / 2, 0, -fox.rotation.y); fx(0.5, k => { s2.material.opacity = 0.9 * (1 - k); s2.scale.x = 1 + k * 6; }, () => kill(s2)); } });
      [1, 2, 3].forEach((d, i) => after(0.3 + i * 0.05, () => { const p = base.clone().addScaledVector(f, d).setY(base.y + 1.1); for (const a of [PI / 4, -PI / 4]) { const x = add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.06), mat(WHITE))); x.position.copy(p); x.rotation.set(0, fox.rotation.y + PI / 2, a); fx(0.35, k => { x.material.opacity = 1 - k; x.scale.x = 0.4 + k; }, () => kill(x)); } sprite(p, 1.3, RED, 0.3); }));
      after(0.32, () => { const p = base.clone().addScaledVector(f, 3.4); puff(p.clone().setY(p.y + 0.2), 0xb8b2aa, 1.2, 0.5, f.clone().multiplyScalar(1.5)); }); },
    // s340 NOVA RING (06): Ben crosses his arms and gathers red light at his chest (motes stream in), then throws his arms wide: flash, a red shell + rings burst out, 8 bolts, a scorch ring lingers
    nova(fox, G) { const f = fw(fox), c = at(fox, f, 0.25, 1.15), C = 0.28;
      pose(G, 1.1, (p, R) => { const g = ss(seg(p, 0, 0.2)), b = ss(seg(p, 0.25, 0.33)), r = ss(seg(p, 0.75, 1)), hold = 1 - r;
        R.A[0].rotation.set(mix(-1.25 * g, -2.3, b) * hold, 0, mix(0.65 * g, -1.4, b) * hold - 0.12 * r);
        R.A[1].rotation.set(mix(-1.25 * g, -2.3, b) * hold, 0, mix(-0.65 * g, 1.4, b) * hold + 0.12 * r);
        R.Lg[0].rotation.x = mix(0.2 * g, -0.2, b) * hold; R.Lg[1].rotation.x = mix(-0.2 * g, 0.2, b) * hold; R.H.rotation.x = mix(0.35 * g, -0.3, b) * hold;
        return { bx: mix(0.25 * g, -0.22, b) * hold, lift: mix(-0.14 * g, 0.06, b) * hold }; });
      const core = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: RED, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))); core.position.copy(c);
      fx(C, k => { core.scale.setScalar(0.2 + k * 1.1); core.material.opacity = 0.6 + 0.4 * Math.sin(k * 40); }, () => kill(core, true));
      for (let i = 0; i < 12; i++) { const a = Math.random() * PI * 2, e = (Math.random() - 0.3) * 1.2, R0 = 1.6 + Math.random() * 0.8, p0 = c.clone().add(V(Math.cos(a) * R0, e, Math.sin(a) * R0)), sp = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: i % 3 ? RED : WHITE, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))); sp.scale.setScalar(0.22);
        fx(C, k => { sp.position.lerpVectors(p0, c, k * k); sp.material.opacity = k; }, () => kill(sp, true)); }
      after(C, () => { const g = at(fox, f, 0, 0); sprite(c, 3, WHITE, 0.3); sprite(c, 1.4, WHITE, 0.15);
        const sh = add(new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), mat(RED, 0.2, { wireframe: true }))); sh.position.copy(c); fx(0.4, k => { sh.scale.setScalar(0.5 + (1 - (1 - k) ** 2) * 4); sh.material.opacity = 0.5 * (1 - k); sh.rotation.y += 0.05; }, () => kill(sh));
        ring(g, 0.4, 4.8, 0.6, RED, 0.18); ring(g, 0.3, 3.6, 0.45, WHITE, 0.08); after(0.08, () => ring(g, 0.3, 5.4, 0.7, RED, 0.06));
        for (let i = 0; i < 8; i++) { const a = fox.rotation.y + i * PI / 4, to = c.clone().add(V(Math.sin(a) * 5, 0, Math.cos(a) * 5)); bolt(c.clone(), to, 0.3, i % 2 ? WHITE : RED, p => { sprite(p, 1.0, RED, 0.25); ring(p.clone().setY(g.y), 0.1, 0.7, 0.3, RED); }); }
        const sc = add(new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 48), new THREE.MeshBasicMaterial({ color: 0x201e1d, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }))); sc.rotation.x = -PI / 2; sc.position.copy(g).setY(g.y + 0.02); sc.scale.setScalar(4.6);
        fx(1.4, k => { sc.material.opacity = 0.35 * (1 - k); }, () => kill(sc)); }); },
    // s340 METEOR DROP (07): crouch, leap 3.4 m with a forward flip, hang, then a knee-drop dive with both fists overhead in a fire trail; impact = rings, cracks, rocks, dust
    meteor(fox, G) { const f = fw(fox); let tr = 0; const T = 1.05, IMP = 0.8, H = 0.95;
      move(fox, k => (k < 0.12 ? V() : k < 0.5 ? V(0, Math.sin(seg(k, 0.12, 0.5) * PI / 2) * 3.4, 0) : k < IMP ? V(0, 3.4 * (1 - seg(k, 0.5, IMP) ** 2), 0) : V()), T);
      pose(G, T, (p, R) => { const c = ss(seg(p, 0, 0.12)), fl = ss(seg(p, 0.14, 0.48)), dv = ss(seg(p, 0.5, 0.58)), hit = p >= IMP ? 1 - ss(seg(p, IMP + 0.08, 1)) : 0, air = p > 0.12 && p < IMP;
        const th = PI * 2 * fl, ab = air ? 1 : 0;
        R.A[0].rotation.set(p < 0.12 ? 0.4 * c : air ? mix(-0.8, -2.9, dv) : mix(-0.2, -0.9, hit), 0, -0.25); R.A[1].rotation.set(p < 0.12 ? 0.4 * c : air ? mix(-0.8, -2.9, dv) : mix(0, -0.9, hit), 0, 0.25);
        R.Lg[0].rotation.x = p < 0.12 ? 0.25 * c : air ? mix(-1.2 * Math.sin(fl * PI), -1.2, dv) : -0.5 * hit; R.Lg[1].rotation.x = p < 0.12 ? -0.2 * c : air ? mix(-0.6 * Math.sin(fl * PI), 0.35, dv) : 0.5 * hit;
        const flip = air ? th % (PI * 2) : 0;
        return { bx: (p < 0.12 ? 0.3 * c : 0) + flip + 0.35 * hit, pz: -Math.sin(flip) * H * ab, lift: (p < 0.12 ? -0.16 * c : 0) + (H - Math.cos(flip) * H) * ab - 0.18 * hit }; });
      after(0.11, () => { dustRing(fox.position.clone(), 8, 0.5); });
      fx(T, (k, dt) => { if (k > 0.5 && k < IMP && (tr += dt) > 0.025) { tr = 0; const p = fox.position.clone().setY(fox.position.y + 1); sprite(p, 1.1, FIRE, 0.3, 0.2); sprite(p.clone().setY(p.y + 0.6), 0.7, 0xffb23a, 0.25, 0.2); } });
      after(0.5 * T, () => { const col = add(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.05, 3.4, 12, 1, true), mat(0xffb23a, 0))); const g0 = fox.position.clone(); col.position.copy(g0).setY(g0.y + 1.7);
        fx((IMP - 0.5) * T + 0.15, k => { col.material.opacity = 0.35 * Math.sin(k * PI); col.position.x = fox.position.x; col.position.z = fox.position.z; }, () => kill(col)); });
      after(IMP * T, () => { const g = at(fox, f, 0, 0); ring(g, 0.3, 4.0, 0.6, FIRE, 0.2); ring(g, 0.2, 2.8, 0.45, WHITE); after(0.06, () => ring(g, 0.3, 5, 0.7, 0xffb23a, 0.06)); sprite(g.clone().setY(g.y + 0.4), 3.4, WHITE, 0.3); sprite(g.clone().setY(g.y + 0.6), 4, FIRE, 0.4);
        dustRing(g, 12, 0.8);
        const ck = new THREE.MeshBasicMaterial({ color: 0x201e1d, transparent: true, opacity: 0.55, depthWrite: false }), cracks = [];
        for (let i = 0; i < 9; i++) { const a = i / 9 * PI * 2 + Math.random() * 0.3, Ln = 1.2 + Math.random() * 1.4, m = add(new THREE.Mesh(new THREE.PlaneGeometry(0.07, Ln), ck)); m.rotation.set(-PI / 2, 0, -a + PI / 2); m.position.copy(g).add(V(Math.cos(a) * (0.4 + Ln / 2), 0.025, Math.sin(a) * (0.4 + Ln / 2))); cracks.push(m); }
        fx(1.6, k => { ck.opacity = 0.55 * (1 - k * k); }, () => { cracks.forEach(m => { scene.remove(m); m.geometry.dispose(); }); ck.dispose(); });
        for (let i = 0; i < 10; i++) { const a = i / 10 * PI * 2, d = add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshBasicMaterial({ color: 0x8a8580, transparent: true }))); d.position.copy(g); const v = V(Math.cos(a) * 3, 3 + Math.random() * 2, Math.sin(a) * 3);
          fx(0.7, (k, dt) => { v.y -= 12 * dt; d.position.addScaledVector(v, dt); d.rotation.x += dt * 8; d.material.opacity = 1 - k; }, () => kill(d)); } }); },
    skyrain(fox, G) { const f = fw(fox), c = at(fox, f, 3, 0); shoot(G); bolt(at(fox, f, 0.3, 1.3), at(fox, f, 0.3, 9), 0.3, WHITE);
      for (let i = 0; i < 14; i++) after(0.4 + i * 0.07, () => { const a = Math.random() * PI * 2, r = Math.sqrt(Math.random()) * 3, g = c.clone().add(V(Math.cos(a) * r, 0, Math.sin(a) * r)); bolt(g.clone().setY(g.y + 9), g, 0.22, i % 3 ? RED : WHITE, p => { ring(p, 0.1, 0.9, 0.35, RED); sprite(p.clone().setY(p.y + 0.2), 0.9, WHITE, 0.2); }, 1.1); }); },
    cyclone(fox, G) { const f = fw(fox), c = at(fox, f, 2.2, 0); strike(G); const grp = add(new THREE.Group()); grp.position.copy(c);
      // s340d Ben: the cyclone WANDERS: starts off ahead, then its heading drifts + jinks at random (speed 2.4 m/s), dust kicks up where it touches down
      let hd = Math.atan2(f.x, f.z), turn = 0, jt = 0, dt2 = 0;
      for (let i = 0; i < 7; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.35 + i * 0.2, 0.035, 4, 32, PI * 1.6), mat(i % 2 ? RED : WHITE, 0.8)); t.rotation.x = PI / 2; t.position.y = 0.15 + i * 0.36; grp.add(t); }
      const deb = []; for (let i = 0; i < 12; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xc9ced3, transparent: true })); grp.add(d); deb.push({ d, a: Math.random() * 6.28, h: Math.random() * 2.4 }); }
      fx(2.2, (k, dt) => { const o = Math.min(1, k * 8) * Math.min(1, (1 - k) * 5); grp.rotation.y += dt * 14;
        if ((jt -= dt) <= 0) { jt = 0.25 + Math.random() * 0.35; turn = (Math.random() - 0.5) * 7; } hd += turn * dt; const sp = 2.4 * Math.min(1, k * 6); grp.position.x += Math.sin(hd) * sp * dt; grp.position.z += Math.cos(hd) * sp * dt;
        if ((dt2 += dt) > 0.09 && k < 0.85) { dt2 = 0; puff(grp.position.clone().add(V((Math.random() - 0.5) * 0.8, 0.15, (Math.random() - 0.5) * 0.8)), 0xb8b2aa, 0.8, 0.5, V((Math.random() - 0.5) * 1.5, 0.6, (Math.random() - 0.5) * 1.5)); } grp.children.forEach((t, i) => { if (t.material) t.material.opacity = (t.geometry.type === 'TorusGeometry' ? 0.8 : 1) * o; });
        for (const q of deb) { q.a += dt * 6; q.h = (q.h + dt * 1.4) % 2.6; const r = 0.4 + q.h * 0.45; q.d.position.set(Math.cos(q.a) * r, q.h, Math.sin(q.a) * r); } }, () => kill(grp)); },
    seekers(fox, G) { const f = fw(fox), sd = sideOf(f), base = at(fox, f, 0, 1.3); shoot(G); const tg = [at(fox, f, 4.2, 1), at(fox, f, 3.4, 1, 1.9), at(fox, f, 3.4, 1, -1.9)];
      for (let i = 0; i < 8; i++) { const sp = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: i % 2 ? WHITE : RED, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))); sp.scale.setScalar(0.45); const a0 = i / 8 * PI * 2, T = tg[i % 3], ctl = base.clone().addScaledVector(sd, (i % 2 ? 1 : -1) * 2.2).setY(base.y + 1.2);
        fx(1.1, k => { if (k < 0.3) { const a = a0 + k * 12; sp.position.copy(base).add(V(Math.cos(a) * 0.9, Math.sin(a * 0.5) * 0.2, Math.sin(a) * 0.9)); } else { const u = (k - 0.3) / 0.7, s = sp.position.clone(); const p0 = base.clone().add(V(Math.cos(a0 + 3.6) * 0.9, 0, Math.sin(a0 + 3.6) * 0.9));
          sp.position.set((1 - u) ** 2 * p0.x + 2 * (1 - u) * u * ctl.x + u * u * T.x, (1 - u) ** 2 * p0.y + 2 * (1 - u) * u * ctl.y + u * u * T.y, (1 - u) ** 2 * p0.z + 2 * (1 - u) * u * ctl.z + u * u * T.z); if (Math.random() < 0.5) sprite(s, 0.25, RED, 0.25, 0.1); } },
          () => { kill(sp, true); sprite(T, 1.3, WHITE, 0.3); ring(T.clone().setY(fox.position.y), 0.2, 1.2, 0.4, RED); }); } },
    wave(fox, G) { const f = fw(fox); shoot(G);
      for (let i = 0; i < 10; i++) after(i * 0.06, () => { const p = at(fox, f, 0.9 + i * 0.6, 0), sp = add(new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.0, 6), mat(i % 2 ? WHITE : RED, 0.95))); sp.position.copy(p);
        fx(0.5, k => { const h = Math.sin(k * PI); sp.position.y = p.y - 0.5 + h * 0.9; sp.scale.set(1, 0.3 + h, 1); sp.material.opacity = 0.95 * (1 - k * 0.6); }, () => kill(sp)); ring(p, 0.1, 0.8, 0.35, RED); }); },
    reboot(fox) { const c = fox.position.clone().setY(fox.position.y + 1); const s = add(new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat(CYAN, 0.6, { wireframe: true }))); s.position.copy(c);
      const s2 = add(new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat(WHITE, 0.25))); s2.position.copy(c); sprite(c, 3, CYAN, 0.4);
      fx(1.4, k => { const r = 0.3 + (1 - (1 - k) ** 2) * 6; s.scale.setScalar(r); s2.scale.setScalar(r * 0.98); s.material.opacity = 0.6 * (1 - k); s2.material.opacity = 0.25 * (1 - k) * (0.5 + 0.5 * Math.sin(k * 40)); s.rotation.y += 0.04; }, () => { kill(s); kill(s2); });
      ring(fox.position.clone(), 0.2, 6.2, 1.2, WHITE, 0.06); after(0.25, () => ring(fox.position.clone(), 0.2, 5, 1.0, CYAN, 0.1)); after(0.5, () => ring(fox.position.clone(), 0.2, 4, 0.8, WHITE, 0.06)); },
    dome(fox) { const c = fox.position.clone(), g = new THREE.SphereGeometry(3.0, 32, 14, 0, PI * 2, 0, PI / 2);   // s340e Ben: bigger than the fox (r 3.0), blue
      const d = add(new THREE.Mesh(g, mat(0x7fc8ff, 0.16))), w = add(new THREE.Mesh(g, mat(RED, 0.55, { wireframe: true }))); d.position.copy(c); w.position.copy(c);
      const eight = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: txt('8'), transparent: true, depthWrite: false }))); eight.position.copy(c).setY(c.y + 3.5); eight.scale.setScalar(1.2);
      ring(c, 0.3, 3.05, 0.35, 0x7fc8ff, 0.12);
      fx(4, k => { const o = Math.min(1, k * 15) * Math.min(1, (1 - k) * 10), p = 0.75 + 0.25 * Math.sin(k * 30); d.material.opacity = 0.18 * o * p; w.material.opacity = 0.55 * o; eight.material.opacity = o; w.rotation.y += 0.01; d.position.copy(fox.position); w.position.copy(fox.position); eight.position.copy(fox.position).setY(fox.position.y + 3.5); }, () => { kill(d); kill(w, true); kill(eight, true); }); },
    decoy(fox) { const f = fw(fox), sd = sideOf(f), holo = mat(CYAN, 0.35), grp = add(new THREE.Group()); fox.updateMatrixWorld(true);
      fox.traverse(o => { if (o.isMesh && o.visible && o.material && o.material.side !== THREE.BackSide) { const m = new THREE.Mesh(o.geometry, holo); o.matrixWorld.decompose(m.position, m.quaternion, m.scale); grp.add(m); } });
      const off = sd.clone().multiplyScalar(1.7); sprite(fox.position.clone().add(off).setY(fox.position.y + 1), 2, CYAN, 0.4);
      fx(5, k => { const g = Math.random() < 0.06 ? (Math.random() - 0.5) * 0.15 : 0; grp.position.set(off.x * Math.min(1, k * 12) + g, 0, off.z * Math.min(1, k * 12)); holo.opacity = (0.28 + 0.12 * Math.sin(k * 60)) * Math.min(1, (1 - k) * 8); }, () => { scene.remove(grp); holo.dispose(); snd('decoy-off'); }); },
    burst(fox, G) { const f = fw(fox), c = at(fox, f, 1.7, 1.1);
      for (let i = 0; i < 8; i++) after(i * 0.26, () => { strike(G); snd('burst-hit', 1 + i * 0.06, 0.8); const s = add(new THREE.Group()); s.position.copy(c); s.rotation.y = fox.rotation.y; const b = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.07, 0.07), mat(i % 2 ? WHITE : RED)); b.rotation.z = i * PI / 8 + 0.3; s.add(b);
        const n = new THREE.Sprite(new THREE.SpriteMaterial({ map: txt(String(i + 1)), transparent: true, depthWrite: false })); n.position.set(0, 1.0, 0); n.scale.setScalar(0.5); s.add(n);
        fx(0.4, k => { b.scale.x = 0.3 + k; b.material.opacity = 1 - k; n.material.opacity = 1 - k * k; n.position.y = 1 + k * 0.4; }, () => kill(s)); sprite(c, 1.3, RED, 0.25); });
      after(8 * 0.26 + 0.1, () => { snd('burst-final'); sprite(c, 6, WHITE, 0.5); ring(at(fox, f, 1.7, 0), 0.5, 7, 0.8, RED, 0.18); ring(at(fox, f, 1.7, 0), 0.3, 5, 0.6, 0x7fc8ff, 0.08);
        const big = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: txt('8'), transparent: true, depthWrite: false }))); big.position.copy(c).setY(c.y + 0.8); fx(1.0, k => { big.scale.setScalar(1 + k * 2.5); big.material.opacity = 1 - k * k; }, () => kill(big, true)); }); } };
  return {
    play(key, fox, G) { const m = MOVES[key]; if (!m || !fox) return; if (key !== 'burst' && key !== 'shadow') snd(key); m(fox, G); }, sound: snd,
    tick(dt) { for (let i = L.length - 1; i >= 0; i--) { const e = L[i]; e.t += dt; const k = Math.min(1, e.t / e.life); try { e.upd(k, dt); } catch (er) {} if (k >= 1) { L.splice(i, 1); try { e.end && e.end(); } catch (er) {} } } },
    busy: () => L.length > 0 };
}
