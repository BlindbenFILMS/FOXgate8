// MERU NEWS (s646 → s647 → s648). Sterling Gloss reads the news: on the load screen (startNewsCast) and on every in-world TV (newsFeed / newsTVs).
// s648 (Ben): SHOT LIST, loops: WIDE 5 s (backdrop = MERU NEWS) → CLOSE-UP 3 s → zoom back out: the backdrop becomes a SCREEN playing the
// PLAYER SCOUT ('ship') + the CARGO SHIP ('hullCargo', worlds/space-installs.js) lifting off the PLAYER PLANET pad → fade → both flying in space.
// Longer read (≈ 1 min, each story has lines[]); paws rest on the desk, one-paw gesture on key words, a tap on the paper, a shuffle between stories.
// HEADLINES FOLLOW THE STORY (s647): NEWS[] entries take when: { flag | stat, not } read from 8gates.save.v1; pickNews() = newest true first.
// Voice: MERU/vo/news-<id>.mp3 if present (Runway ML), else the device voice line by line. ?sound=0 / muted = silent lip-sync.
// s648 NOTE: rebuilt after the s647 file was overwritten by mistake; same exports + behaviour, new shot list.
import { NEWS, pickNews } from './news-data.js?v=s652'; export { NEWS, pickNews };   // s652: stories live in engine/news-data.js
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit, PLAYER_MALE } from '../fox-kit.js';
import { applyD, talkD } from './fox-poses.js?v=s648k';
import { installKit, loadLooks } from '../worlds/space-installs.js';
// STERLING GLOSS = the Meru TV studio anchor (key tvAnchor). Suit jacket + sleeves come from torso[1] (s647b).
export const ANCHOR = { key: 'tvAnchor', name: 'Sterling Gloss', joints: true, outfit: 'suit', torso: ['#f3f2f2', '#2e4a6b', '#16263c'], crest: '', gear: 'none', mood: 'happy', look: { ...PLAYER_MALE, fur: '#d9772f', furDark: '#9a4a1c' } };
const SH = { wide: 5, close: 3, zoom: 1.4, show: 11 }, CYCLE = SH.wide + SH.close + SH.zoom + SH.show;
// ---------------- the studio (shared by the load screen + the TVs) ----------------
function makeCast(renderer, list, { muted = false, silent = false, shotAt = null, small = false, t0 = null, prog = null } = {}) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#201e1d'); const cam = new THREE.PerspectiveCamera(32, 4 / 3, 0.1, 50);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a6560, 1.5)); const key = new THREE.DirectionalLight(0xfff1dc, 1.7); key.position.set(2.5, 4, 4); scene.add(key);
  const grad = makeGradient(), cache = new Map(), toon = (c, x) => { const k = c + (x ? JSON.stringify(x) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...x })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  const M = (geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) { geo.computeBoundingBox(); const s = new THREE.Vector3(); geo.boundingBox.getSize(s); const o = new THREE.Mesh(geo, outlineMat); if (radius) o.scale.setScalar(1 + outline / radius); else o.scale.set(1 + 2 * outline / Math.max(s.x, 0.01), 1 + 2 * outline / Math.max(s.y, 0.01), 1 + 2 * outline / Math.max(s.z, 0.01)); m.add(o); } (parent || scene).add(m); return m; };
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: true });
  const ctex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  // backdrop: MERU NEWS logo ↔ the SCREEN (render target of the ship scene), white frame, a LIVE tag on the screen
  const logoT = ctex(1024, 512, (g) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, 1024, 512); g.fillStyle = '#c92a10'; for (let x = 0; x < 1024; x += 64) g.fillRect(x, 0, 2, 512); g.fillStyle = '#f3f2f2'; g.font = '900 104px Archivo, sans-serif'; g.fillText('MERU', 500, 236); g.fillText('NEWS', 500, 340); g.fillRect(500, 362, 290, 8); });
  const RT = new THREE.WebGLRenderTarget(small ? 512 : 1024, small ? 256 : 512); RT.texture.colorSpace = THREE.SRGBColorSpace;
  const backMat = new THREE.MeshBasicMaterial({ map: logoT }), back = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 3.9), backMat); back.position.set(0.1, 1.9, -1.6); scene.add(back);
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(7.92, 4.02), new THREE.MeshBasicMaterial({ color: 0xf3f2f2 })); frame.position.set(0.1, 1.9, -1.62); scene.add(frame);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 7), new THREE.MeshBasicMaterial({ color: 0xa82410 })); wall.position.set(0.1, 1.9, -1.66); scene.add(wall);   // s648: studio wall, so wide (16:9) TV frames never show a black strip
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.24), new THREE.MeshBasicMaterial({ map: ctex(512, 64, g => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, 512, 64); g.fillStyle = '#f3f2f2'; g.font = '900 34px Archivo, sans-serif'; g.fillText('LIVE \u00b7 PLAYER PLANET PAD', 18, 44); }) }));
  // s648b (Ben): the ships play PICTURE-IN-PICTURE in the top-right of the backdrop, over the MERU NEWS lettering (the backdrop itself stays)
  const plainT = ctex(1024, 512, g => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, 1024, 512); g.fillStyle = '#c92a10'; for (let x = 0; x < 1024; x += 64) g.fillRect(x, 0, 2, 512); });
  const pipF = new THREE.Mesh(new THREE.PlaneGeometry(3.12, 1.62), new THREE.MeshBasicMaterial({ color: 0xf3f2f2 })); pipF.position.set(1.6, 2.35, -1.585); scene.add(pipF);
  // s648c REAL FOOTAGE (Ben): the lift-off is 54 frames filmed in Player Planet (the real pad, scout + cargo ship) = MERU/news/pp-launch-atlas.jpg
  // (8 x 7 grid of 512x256, 10 fps = 5.4 s); the space part is still the live scene with the same ship models. No atlas = the stand-in planet.
  const FILM = { cols: 8, rows: 7, n: 54, fps: 10, tex: null }; new THREE.TextureLoader().load(new URL('../MERU/news/pp-launch-atlas.jpg', import.meta.url).href, tx => { tx.colorSpace = THREE.SRGBColorSpace; tx.repeat.set(1 / FILM.cols, 1 / FILM.rows); FILM.tex = tx; }, undefined, () => {});
  const pipMat = new THREE.MeshBasicMaterial({ map: RT.texture }), pip = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.5), pipMat); pip.position.set(1.6, 2.35, -1.58); scene.add(pip); pip.visible = pipF.visible = false;
  tag.scale.setScalar(0.7); tag.position.set(0.1 + 0.67 + 0.1, 2.97, -1.575); tag.visible = false; scene.add(tag);
  // desk (front reads STERLING GLOSS) + the anchor
  M(new THREE.BoxGeometry(3.6, 0.9, 0.7), toon('#201e1d'), 0, 0.45, 0.62, null, 0.03); M(new THREE.BoxGeometry(3.62, 0.12, 0.72), toon('#ec3013'), 0, 0.72, 0.62, null, 0);
  M(new THREE.BoxGeometry(3.7, 0.05, 0.8), toon('#3a3836'), 0, 0.92, 0.6, null, 0.02);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.22), new THREE.MeshBasicMaterial({ map: ctex(512, 64, g => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, 512, 64); g.fillStyle = '#f3f2f2'; g.font = '900 40px Archivo, sans-serif'; g.fillText('STERLING GLOSS', 14, 46); }) })); plate.position.set(-0.75, 0.52, 0.975);   /* s648f (Ben): no name on the desk */
  // s648g (Ben: "what is in front of him?"): it's his SCRIPT. Now a clear flat stack of printed sheets (lines of text), slightly fanned
  const paperT = ctex(256, 192, (g, W, H) => { g.fillStyle = '#f7f6f2'; g.fillRect(0, 0, W, H); g.fillStyle = '#ec3013'; g.fillRect(18, 16, 90, 12); g.fillStyle = '#5a5654'; for (let y = 44; y < H - 14; y += 15) g.fillRect(18, y, W - 36 - (y % 45 === 14 ? 60 : 0), 5); });
  const paper = new THREE.Group(); paper.position.set(-0.68, 0.948, 0.5); scene.add(paper);
  for (let i = 0; i < 3; i++) { const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.22), new THREE.MeshBasicMaterial({ map: paperT, color: i === 2 ? 0xffffff : 0xe2e0da })); sh.rotation.x = -Math.PI / 2; sh.rotation.z = (i - 1) * 0.06; sh.position.y = i * 0.003; paper.add(sh); }
  const fox = kit.makeFox({ ...ANCHOR }); scene.add(fox);
  { const PL = fox.userData.P && fox.userData.P.legs; if (PL) PL.forEach(l => { l.visible = false; }); }   /* s648g: his bent knees poked up over the desk like a white lump (Ben thought it was a microphone); the desk hides the legs anyway */
  // ---- the SCREEN scene: player planet pad → lift off → fade → space ----
  const S2 = new THREE.Scene(), C2 = new THREE.PerspectiveCamera(42, 2, 0.1, 4000), SKY = new THREE.Color('#9fd0f5'), VOID = new THREE.Color('#05060d');
  S2.add(new THREE.HemisphereLight(0xdfefff, 0x5a6b3a, 1.6)); const sun = new THREE.DirectionalLight(0xfff0d0, 2); sun.position.set(-30, 60, 40); S2.add(sun);
  let IK = null, LK = {}; try { IK = installKit(THREE, { low: true }); LK = loadLooks(); } catch (e) { console.warn('news ships', e); }
  const norm = (inst, len) => { const b = new THREE.Box3().setFromObject(inst.group), s = new THREE.Vector3(); b.getSize(s); inst.group.scale.multiplyScalar(len / Math.max(s.x, s.z, 0.01)); return inst; };
  const mk = (t, len) => { try { return IK ? norm(IK.build(t, LK[t] || {}), len) : null; } catch (e) { console.warn('news ship ' + t, e); return null; } };
  const scout = mk('ship', 6), cargo = mk('hullCargo', 11);
  const ground = new THREE.Group(); S2.add(ground); const gm = c => new THREE.MeshLambertMaterial({ color: c });
  const pl = (w, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), gm(c)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); ground.add(m); };
  pl(600, 600, '#6f9a4a', 0, 0, 0); pl(600, 40, '#e6d3a1', 0, 0.02, 60); pl(600, 400, '#2f7fc4', 0, 0.01, 280);
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.4, 40), gm('#9a958f')); pad.position.y = 0.2; ground.add(pad);
  const ring = new THREE.Mesh(new THREE.RingGeometry(11, 12, 40), new THREE.MeshBasicMaterial({ color: 0xffd23a })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.42; ground.add(ring);
  const hall = new THREE.Mesh(new THREE.BoxGeometry(22, 9, 14), gm('#d8c3a0')); hall.position.set(-34, 4.5, -18); ground.add(hall); const roof = new THREE.Mesh(new THREE.BoxGeometry(24, 1.2, 16), gm('#7a3b22')); roof.position.set(-34, 9.6, -18); ground.add(roof);
  for (let i = 0; i < 18; i++) { const tr = new THREE.Mesh(new THREE.ConeGeometry(2.4, 8, 7), gm(i % 2 ? '#2f5d2b' : '#3a6e33')); tr.position.set(40 + (i % 6) * 7, 4, -40 + Math.floor(i / 6) * 9); ground.add(tr); }
  const mtn = new THREE.Mesh(new THREE.ConeGeometry(60, 70, 6), gm('#7c7f86')); mtn.position.set(-140, 30, -160); ground.add(mtn);
  const space = new THREE.Group(); S2.add(space); space.visible = false;
  { const N = small ? 400 : 900, p = new Float32Array(N * 3), v = new THREE.Vector3(); for (let i = 0; i < N; i++) { v.randomDirection().multiplyScalar(900 + Math.random() * 600); p.set([v.x, v.y, v.z], i * 3); } const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(p, 3)); space.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false }))); }
  const planet = new THREE.Mesh(new THREE.SphereGeometry(260, 48, 32), new THREE.MeshLambertMaterial({ color: '#4f8f5a', emissive: '#10243a' })); planet.position.set(-120, -330, -420); space.add(planet);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(268, 48, 32), new THREE.MeshBasicMaterial({ color: 0x7fc4ff, transparent: true, opacity: 0.18, side: THREE.BackSide })); halo.position.copy(planet.position); space.add(halo);
  // s648d SPACE CLOSE-UPS (Ben: "show the ships flying through space close up"): speed dust streaking past, a warm sun + nebula glow, a bigger planet,
  // two cuts: (1) tight chase on the SCOUT, the camera slowly swinging round it, the cargo ship behind; (2) the CARGO SHIP sliding past the lens.
  const DUST = 140, dP = new Float32Array(DUST * 6), dG = new THREE.BufferGeometry(); dG.setAttribute('position', new THREE.BufferAttribute(dP, 3)); const dust = new THREE.LineSegments(dG, new THREE.LineBasicMaterial({ color: 0xcfe3ff, transparent: true, opacity: 0.7 })); dust.frustumCulled = false; space.add(dust);
  const dSeed = Array.from({ length: DUST }, () => [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 34, Math.random() * 140]);
  const glowT = ctex(128, 128, (g2, W, H) => { const r = g2.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,220,160,0.8)'); r.addColorStop(1, 'rgba(255,160,80,0)'); g2.fillStyle = r; g2.fillRect(0, 0, W, H); });
  const sunS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, depthWrite: false })); sunS.scale.setScalar(380); sunS.position.set(700, 260, -1400); space.add(sunS);
  for (const [c, x, y, z, sc] of [['#5a2a8a', -900, 300, -1600, 1400], ['#1f4a8a', 500, -200, -1700, 1200]]) { const n = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: c, transparent: true, opacity: 0.45, depthWrite: false })); n.scale.setScalar(sc); n.position.set(x, y, z); space.add(n); }
  planet.scale.setScalar(1.6); halo.scale.setScalar(1.6); planet.position.set(-260, -520, -700); halo.position.copy(planet.position);
  const flame = () => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.6, 3.2, 10), new THREE.MeshBasicMaterial({ color: 0xffc46a, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = Math.PI; return m; };
  const ships = []; for (const [inst, off, delay, len, fs] of [[scout, [6, 0, 0], 0, 6, 1], [cargo, [-9, 0, 4], 1.2, 11, 2]]) if (inst) { S2.add(inst.group); const f = flame(); f.scale.setScalar(fs); inst.group.add(f); ships.push({ i: inst, f, off, delay, len }); }
  const fadeQ = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthTest: false })); fadeQ.renderOrder = 99; fadeQ.position.z = -1; C2.add(fadeQ); S2.add(C2);
  const V0 = new THREE.Vector3();
  function screen(st) { const lift = st < 5.4, k = lift ? st : st - 5.4; ground.visible = lift; space.visible = !lift; S2.background = lift ? SKY : VOID;
    for (const s of ships) { const G = s.i.group, tt = Math.max(0, k - (lift ? s.delay : 0));
      if (lift) { const up = Math.max(0, tt - 0.6); G.position.set(s.off[0], 1 + up * up * 3.2, s.off[2] - up * up * 1.4); G.rotation.set(-Math.min(0.5, up * 0.18), 0.35, 0); s.f.visible = tt > 0.3; s.f.rotation.set(Math.PI, 0, 0); s.f.position.set(0, -0.5, 0); s.f.scale.y = (s.len > 8 ? 2 : 1) * (1 + Math.sin(st * 40) * 0.2); }
      else { const so = s.len > 8 ? [-9, 0.5, 2] : [0, 0, 0]; G.position.set(so[0] + Math.sin(k * 0.8 + s.delay) * 0.5, so[1] + Math.sin(k * 1.1 + s.delay) * 0.4, -k * 22 + so[2]); G.rotation.set(0, Math.PI, Math.sin(k * 0.9 + s.delay) * 0.12); s.f.visible = true; s.f.rotation.set(-Math.PI / 2, 0, 0); s.f.position.set(0, 0, s.len * 0.55); }
      try { s.i.tick && s.i.tick(1 / 60, V0); } catch (e) {} }
    if (lift) { const hy = Math.min(40, 3 + st * st * 1.5); C2.position.set(20, 7 + hy * 0.8, 24); C2.lookAt(-9, hy, 0); }
    else { const sc = ships[0] ? ships[0].i.group.position : V0, cg = ships[1] ? ships[1].i.group.position : sc;
      // s648e ONE LONG SHOT of BOTH ships flying together (Ben): the camera rides alongside the pair, slowly swinging from a front 3/4 round to the side
      const mx = (sc.x + cg.x) / 2, my = (sc.y + cg.y) / 2, mz = (sc.z + cg.z) / 2, a = 0.55 - k * 0.09, r = 15.5; C2.position.set(mx + Math.sin(a) * r, my + 3 - k * 0.12, mz + Math.cos(a) * r); C2.lookAt(mx, my + 0.5, mz - 1);
      for (let i = 0; i < DUST; i++) { const d = dSeed[i], z = C2.position.z - 140 + ((d[2] + k * 90) % 140), x = C2.position.x + d[0], y = C2.position.y + d[1]; dP.set([x, y, z, x, y, z - 4.5], i * 6); } dG.attributes.position.needsUpdate = true; }
    const fd = st > 4.6 && st < 6.2 ? 1 - Math.abs(st - 5.4) / 0.8 : st > SH.show - 0.6 ? (st - (SH.show - 0.6)) / 0.6 : st < 0.4 ? 1 - st / 0.4 : 0; fadeQ.material.opacity = Math.max(0, Math.min(1, fd));
    renderer.setRenderTarget(RT); renderer.render(S2, C2); renderer.setRenderTarget(null); }
  // ---- camera: WIDE → CLOSE-UP → zoom out to the screen ----
  const SHOTS = { wide: [[0.05, 1.7, 5.6], [0.05, 1.35, 0]], close: [[-0.55, 2.0, 4.4], [-0.72, 1.74, 0]], show: [[0.45, 1.8, 6.5], [0.45, 1.55, 0]] };
  const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k), ez = k => k * k * (3 - 2 * k);
  let t = shotAt ?? t0 ?? 0;
  function shot(ct, first) { let P, Lk; const w = SH.wide, c = w + SH.close, z = c + SH.zoom;
    if (ct < w) { const k = first ? 1 : ez(Math.min(1, ct / 0.8)); P = lerp3(SHOTS.show[0], SHOTS.wide[0], k); Lk = lerp3(SHOTS.show[1], SHOTS.wide[1], k); }
    else if (ct < c) { const k = ez(Math.min(1, (ct - w) / 0.9)); P = lerp3(SHOTS.wide[0], SHOTS.close[0], k); Lk = lerp3(SHOTS.wide[1], SHOTS.close[1], k); }
    else if (ct < z) { const k = ez((ct - c) / SH.zoom); P = lerp3(SHOTS.close[0], SHOTS.show[0], k); Lk = lerp3(SHOTS.close[1], SHOTS.show[1], k); }
    else { P = SHOTS.show[0]; Lk = SHOTS.show[1]; }
    cam.position.set(P[0] + Math.sin(t * 0.4) * 0.03, P[1], P[2]); cam.lookAt(Lk[0], Lk[1], Lk[2]); }
  // ---- voice: one Runway file per story (MERU/vo/news-<id>.mp3), else the device voice line by line ----
  const L = []; list.forEach(n => (n.lines && n.lines.length ? n.lines : [n.text]).forEach((x, i) => L.push({ text: x, id: n.id, first: i === 0 })));
  let li = 0, talking = 0, sayT = 0, dur = 4, audio = null, stopped = false, curText = '', shuffleT = 0, timers = [];
  const later = (f, ms) => timers.push(setTimeout(f, ms));
  const startTalk = (text, d) => { curText = text; dur = d || Math.max(2.5, text.length * 0.068); talking = 1; sayT = 0; fox.userData.say = { text, t: 0 }; fox.userData.talkStyle = { rate: 1, amp: 1 }; };
  const voice = () => { const S = window.speechSynthesis; if (!S) return null; const V = S.getVoices(); return V.find(v => /en[-_](GB|US)/i.test(v.lang) && /male|daniel|david|alex|google uk english male/i.test(v.name)) || V.find(v => /^en/i.test(v.lang)) || null; };
  const gap = () => (li % L.length === 0 ? 3500 : L[li % L.length].first ? 1600 : 650);
  const nextLine = () => { if (stopped) return; const ln = L[li % L.length]; li++; if (ln.first && li > 1) shuffleT = 1.2; const S = window.speechSynthesis, text = ln.text;
    if (silent || !S || muted) { startTalk(text); later(nextLine, dur * 1000 + gap()); return; }
    try { const u = new SpeechSynthesisUtterance(text); u.rate = 1.02; u.pitch = 0.95; const v = voice(); if (v) u.voice = v; let started = false;
      u.onstart = () => { started = true; startTalk(text); }; u.onend = () => { talking = 0; later(nextLine, gap()); }; S.speak(u);
      later(() => { if (!started && !stopped) { S.cancel(); startTalk(text); later(nextLine, dur * 1000 + gap()); } }, 1500); } catch (e) { startTalk(text); later(nextLine, dur * 1000 + gap()); } };
  const tryMp3 = () => { if (stopped) return; if (silent || muted || list.length !== 1) { nextLine(); return; } const n = list[0], url = new URL('../MERU/vo/news-' + n.id + '.mp3', import.meta.url).href, all = L.map(x => x.text).join(' ');
    audio = new Audio(url); audio.volume = 0.95; audio.onloadedmetadata = () => { audio.play().then(() => { startTalk(all, audio.duration); audio.onended = () => { talking = 0; later(() => { if (!stopped && audio) { audio.currentTime = 0; audio.play().then(() => startTalk(all, audio.duration)).catch(() => {}); } }, 3500); }; }).catch(() => { audio = null; nextLine(); }); };
    audio.onerror = () => { audio = null; nextLine(); }; };
  if (prog) {} else if (shotAt == null) later(tryMp3, 700); else startTalk(L[Math.min(1, L.length - 1)].text);   /* s650 prog = the Runway programme drives the talking (progTalk) */
  // ---- body: paws on the desk, one-paw gesture on key words, a tap on the paper, a shuffle between stories ----
  let progI = -1, progRated = false; const U = fox.userData;
  function progTalk(pt) { const vt = pt - prog.intro, S = prog.sentences; let i = -1; if (vt >= 0 && vt < prog.voice) for (let k = 0; k < S.length; k++) if (vt >= S[k].t0 && vt < S[k].t1 + 0.15) { i = k; break; }
    if (i !== progI) { progI = i; progRated = false; if (i >= 0) { curText = S[i].text; talking = 1; sayT = 0; U.say = { text: S[i].text, t: 0 }; U.talkStyle = { rate: 1, amp: 1 }; } else { talking = 0; U.say = null; if (pt < prog.intro + 0.1 || vt > prog.voice) shuffleT = shuffleT > 0 ? shuffleT : 0; } }
    if (i >= 0) { sayT = vt - S[i].t0; const tl = U.say && U.say.tl; if (tl && !progRated) { const last = tl[tl.length - 1], end = last ? last.t0 + last.d : 1; U.talkStyle.rate = end / Math.max(0.3, S[i].t1 - S[i].t0); progRated = true; }
      const e = prog.env[Math.min(prog.env.length - 1, Math.max(0, Math.round(vt * (prog.envHz || 50))))] || 0; U.talkStyle.amp = 0.35 + 1.1 * Math.min(1, e * 1.6); }
    if (pt < prog.intro && pt > prog.intro - 1.3 && shuffleT <= 0) shuffleT = 1.2; }
  const KEYW = /(new|four|crystal|king|first|cargo|safe|strange|families|breaking)/i;
  const anchorD = () => { const D = talkD({ t: sayT, text: talking ? curText : '', mood: talking ? 'proud' : 'happy', line: 'n' + li });
    D.a = [[0.2, -0.42, 0.34], [0.2, -0.42, 0.34]]; D.palm = [[0.1, -1, 0.1], [0.1, -1, 0.1]]; D.g = [0.45, 0.45]; D.pole = [[0.6, -1, -0.2], [0.6, -1, -0.2]]; D.spread = 0.3; D.pt = [0, 0];
    if (shuffleT > 0) { const s = Math.sin((1 - shuffleT / 1.2) * Math.PI); D.a = [[0.1, -0.38 + 0.1 * s, 0.38], [0.1, -0.38 + 0.1 * s, 0.38]]; D.palm = [[1, 0, 0.2], [1, 0, 0.2]]; D.g = [0.75, 0.75]; D.head = [0.25, 0, 0]; }
    else if (talking) { const ph = (sayT % 3.6) / 3.6, ges = KEYW.test(curText) ? Math.sin(Math.min(1, Math.max(0, (ph - 0.15) / 0.5)) * Math.PI) : 0;
      D.a[0] = [0.24, -0.42 + 0.26 * ges, 0.34 + 0.1 * ges]; D.palm[0] = [0.1 - 0.5 * ges, -1 + 1.3 * ges, 0.1 + 0.6 * ges]; D.g[0] = 0.45 - 0.35 * ges; D.spread = 0.3 + 0.6 * ges;
      const tap = (sayT % 5.2) > 4.6 ? Math.abs(Math.sin(sayT * 14)) : 0; D.a[1] = [0.16, -0.42 + 0.05 * tap, 0.36]; D.g[1] = 0.7; D.pt[1] = tap > 0 ? 1 : 0; }
    else { D.head = [0.05, 0.12 * Math.sin(t * 0.5), 0]; D.mood = 'happy'; }
    D.l = [[0.03, 0.44, 0.2], [0.03, 0.44, 0.2]]; D.lpole = [[0, 0.3, 1], [0, 0.3, 1]]; D.lean = 0.1; return D; };
  let lastScreen = -1;
  return { cam, ticker: list.map(n => n.text).join('   \u2022   ') + '   \u2022   MERU NEWS', kicker: list[0].kicker || 'MERU NEWS',
    // s650 RUNWAY PROGRAMME: pt = seconds into intro sting → voice → outro sting; each sentence starts at its measured time (MERU/vo/news-<id>.json)
    // and its visemes are stretched to fit; the mouth opens with the voice's loudness (env, 50 Hz); quiet during the stings (paper shuffle, smile)
    frame(dt, fps, pt) { if (shotAt != null) dt = 0; t += dt; if (shuffleT > 0) shuffleT -= dt;
      if (prog && pt != null) progTalk(pt);
      else if (talking) { sayT += dt || 1 / 60; if (sayT > dur + 0.2 && !audio) { talking = 0; fox.userData.say = null; } }
      const ct = t % CYCLE, showT = ct - (SH.wide + SH.close), onScreen = showT > 0.25; pip.visible = pipF.visible = tag.visible = onScreen; backMat.map = onScreen ? plainT : logoT;
      if (onScreen) { const st = (showT - 0.25) * (SH.show / (SH.show + SH.zoom - 0.25));
        if (FILM.tex && st < 5.4) { const f = Math.min(FILM.n - 1, Math.floor(st * FILM.fps)); FILM.tex.offset.set((f % FILM.cols) / FILM.cols, 1 - (Math.floor(f / FILM.cols) + 1) / FILM.rows); pipMat.map = FILM.tex; const fd = st < 0.4 ? 1 - st / 0.4 : st > 4.6 ? (st - 4.6) / 0.8 : 0; pipMat.color.setScalar(1 - Math.min(1, fd)); }
        else { pipMat.map = RT.texture; pipMat.color.setScalar(1); if (!fps || t - lastScreen > 1 / fps) { lastScreen = t; screen(st); } } }
      kit.animFox(fox, dt, 0, false); applyD(THREE, fox, anchorD(), t, 1); fox.position.set(-0.75, 0.12, 0); paper.rotation.y = Math.sin(t * 0.3) * 0.03 + (shuffleT > 0 ? Math.sin(shuffleT * 9) * 0.05 : 0);
      shot(ct, t < CYCLE); renderer.render(scene, cam); },
    stop() { stopped = true; timers.forEach(clearTimeout); if (!silent) { try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} } if (audio) { audio.pause(); audio = null; }
      RT.dispose(); scene.traverse(o => { if (o.geometry) o.geometry.dispose(); }); S2.traverse(o => { if (o.geometry) o.geometry.dispose(); }); } };
}
// ---------------- LOAD SCREEN: startNewsCast(el, itemOrList, { muted, shotAt }) → { stop() } ----------------
export async function startNewsCast(el, item = pickNews(), opts = {}) {
  const list = Array.isArray(item) ? item : [item];
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(1.5, devicePixelRatio)); el.appendChild(renderer.domElement); renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  const C = makeCast(renderer, list, opts);
  const A = 4 / 3, fit = () => { const W = el.clientWidth || 4, H = el.clientHeight || 3, w = Math.min(W, H * A), h = w / A; renderer.setSize(w, h, false); Object.assign(renderer.domElement.style, { width: w + 'px', height: h + 'px', left: (W - w) / 2 + 'px', top: (H - h) / 2 + 'px', inset: 'auto' }); C.cam.aspect = A; C.cam.fov = 32; C.cam.updateProjectionMatrix(); };   /* s648f (Ben): every screen shows the WHOLE shot, same 4:3 shape (letterboxed), nothing cut off */
  fit(); const ro = new ResizeObserver(fit); ro.observe(el);
  const clock = new THREE.Clock(); let raf = 0, stopped = false; const loop = () => { if (stopped) return; raf = requestAnimationFrame(loop); C.frame(Math.min(0.05, clock.getDelta())); }; loop();
  return { stop() { stopped = true; cancelAnimationFrame(raf); ro.disconnect(); C.stop(); renderer.dispose(); renderer.domElement.remove(); } };
}
// ---------------- IN-WORLD TV: newsFeed({ w, h }) → { draw(g, W, H, dt), stop() } (silent, 10 fps, small) ----------------
export function newsFeed({ w = 320, h = 180, fps = 10 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(w, h, false);
  const C = makeCast(renderer, pickNews(), { silent: true, small: true }); C.cam.aspect = w / h; C.cam.fov = 32; C.cam.updateProjectionMatrix(); renderer.setViewport(0, 0, w, h);
  let acc = 0, tx = 0;
  return { draw(g, W, H, dt) { acc += dt; tx += dt; if (acc < 1 / fps) return false; renderer.setSize(w, h, false); C.cam.aspect = w / h; C.cam.updateProjectionMatrix(); C.frame(acc, 2); acc = 0;
      g.drawImage(renderer.domElement, 0, 0, W, H); const bh = Math.round(H * 0.16); g.fillStyle = '#f3f2f2'; g.fillRect(0, H - bh, W, bh); g.font = '900 ' + Math.round(bh * 0.55) + 'px Archivo, sans-serif'; g.textBaseline = 'middle';
      const kw = g.measureText(C.kicker).width + bh * 0.8, msg = C.ticker + '      ', mw = g.measureText(msg).width, x0 = kw - ((tx * 40) % mw);
      g.save(); g.beginPath(); g.rect(kw, H - bh, W - kw, bh); g.clip(); g.fillStyle = '#201e1d'; for (let x = x0; x < W; x += mw) g.fillText(msg, x, H - bh / 2); g.restore();
      g.fillStyle = '#ec3013'; g.fillRect(0, H - bh, kw, bh); g.fillStyle = '#f3f2f2'; g.fillText(C.kicker, bh * 0.4, H - bh / 2); return true; },
    stop() { C.stop(); renderer.dispose(); } };
}
// ---------------- the TVs in the world: newsTVs({ scene, screens: [{ tex, when }] }) → { tick(dt) } ----------------
// Runs ONE shared feed only while a TV mesh was drawn in the last 0.5 s (onBeforeRender); frees it after 8 s off-screen.
export function newsTVs({ scene, screens }) {
  const S = screens.filter(s => s && s.tex).map(s => ({ ...s, seen: -9, hooked: false })); let feed = null, off = 0, scanT = 0, now = 0;
  const hook = () => { for (const s of S) { if (s.hooked) continue; scene.traverse(o => { const m = o.material; if (o.isMesh && m && (m.map === s.tex || (Array.isArray(m) && m.some(x => x.map === s.tex)))) { const prev = o.onBeforeRender; o.onBeforeRender = function (...a) { s.seen = now; if (prev) prev.apply(this, a); }; s.hooked = true; } }); } };
  return { tick(dt) { now += dt; if ((scanT -= dt) <= 0) { scanT = 2; hook(); }
      const live = S.filter(s => now - s.seen < 0.5 && (!s.when || s.when()));
      if (!live.length) { if (feed && (off += dt) > 8) { feed.stop(); feed = null; } return; } off = 0;
      if (!feed) { try { feed = newsFeed({ w: 320, h: 180 }); } catch (e) { console.warn('news feed', e); return; } }
      const cv = s => { const c = (s.tex.userData && s.tex.userData.c) || s.tex.image; return c && c.getContext ? c : null; }, c0 = cv(live[0]); if (!c0 || !feed.draw(c0.getContext('2d'), c0.width, c0.height, dt)) return; live[0].tex.needsUpdate = true;
      for (const s of live.slice(1)) { const c = cv(s); if (!c) continue; c.getContext('2d').drawImage(c0, 0, 0, c.width, c.height); s.tex.needsUpdate = true; } },
    stop() { if (feed) feed.stop(); feed = null; } };
}
// ---------------- s649 VIDEO (Ben: "export it + load it as a streaming video"): the live render stutters while Meru builds; a video plays smooth ----
// recordNewsVideo({ w, h, fps, onProgress }) → Blob (mp4 if the browser can, else webm). One seamless loop (one CYCLE, starting as the 2nd loop
// does, so the end flows into the start). Silent: the device voice can't be recorded; the Runway voice gets muxed in later.
// Saved per story: MERU/news/news-<id>.mp4 (project, all devices) + IndexedDB 'meru-news' (this browser, at once).
export const CYCLE_S = CYCLE;
export async function loadProgramme(id) { try { const r = await fetch(new URL('../MERU/vo/news-' + id + '.json', import.meta.url).href); return r.ok ? await r.json() : null; } catch (e) { return null; } }
export async function recordNewsVideo({ w = 960, h = 720, fps = 30, list = pickNews(), onProgress = () => {} } = {}) {
  const P = list.length === 1 ? await loadProgramme(list[0].id) : null; if (P) return recordProgramme({ w, h, fps, list, P, onProgress });
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(w, h, false);
  const C = makeCast(renderer, list, { silent: true, t0: CYCLE }); C.cam.aspect = w / h; C.cam.fov = 32; C.cam.updateProjectionMatrix();
  const types = ['video/mp4;codecs=avc1.42E01F', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'], type = types.find(x => window.MediaRecorder && MediaRecorder.isTypeSupported(x));
  if (!type) throw new Error('this browser cannot record video');
  C.frame(0); const st = cv.captureStream(0), tr = st.getVideoTracks()[0], rec = new MediaRecorder(st, { mimeType: type, videoBitsPerSecond: 1800000 }), parts = [];
  rec.ondataavailable = e => { if (e.data && e.data.size) parts.push(e.data); }; const done = new Promise(r => { rec.onstop = r; }); rec.start(500);
  const N = Math.round(CYCLE * fps), T0 = performance.now();
  for (let i = 0; i < N; i++) { C.frame(1 / fps); tr.requestFrame && tr.requestFrame(); onProgress((i + 1) / N); const due = T0 + (i + 1) * 1000 / fps, wait = due - performance.now(); await new Promise(r => setTimeout(r, Math.max(0, wait))); }
  rec.stop(); await done; C.stop(); renderer.dispose(); return new Blob(parts, { type: type.split(';')[0] }); }
const IDB = () => new Promise((res, rej) => { const q = indexedDB.open('meru-news', 1); q.onupgradeneeded = () => q.result.createObjectStore('v'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
export async function storeNewsVideo(id, blob) { const db = await IDB(); await new Promise((r, j) => { const x = db.transaction('v', 'readwrite'); x.objectStore('v').put(blob, id); x.oncomplete = r; x.onerror = () => j(x.error); }); }
export async function loadNewsVideo(id) { // project file first (every device), then this browser's recording
  for (const ext of ['mp4', 'webm']) { const url = new URL('../MERU/news/news-' + id + '.' + ext, import.meta.url).href; try { const r = await fetch(url, { method: 'HEAD' }); const len = r.headers.get('content-length'), ct = r.headers.get('content-type') || ''; if (r.ok && (len ? +len > 1000 : /video|octet/.test(ct) || !ct)) return url;   /* s650c: the project server sends no content-length on HEAD */ } catch (e) {} }
  try { const db = await IDB(); const b = await new Promise(r => { const g = db.transaction('v').objectStore('v').get(id); g.onsuccess = () => r(g.result); g.onerror = () => r(null); }); if (b) return URL.createObjectURL(b); } catch (e) {}
  return null; }
// playNewsVideo(el, url) → { stop() }: muted, looping, inline (phones), cover-fit in the 4:3 square
export function playNewsVideo(el, url, { muted = false } = {}) { const v = document.createElement('video'); v.src = url; v.muted = true;   /* starts muted (autoplay rule); the first tap / key turns the sound on (s650) */
  const unmute = () => { if (!muted) { v.muted = false; v.volume = 0.95; v.play().catch(() => {}); } off(); }, off = () => { removeEventListener('pointerdown', unmute, true); removeEventListener('keydown', unmute, true); }; addEventListener('pointerdown', unmute, true); addEventListener('keydown', unmute, true); v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
  v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#201e1d'; el.appendChild(v); v.play().catch(() => {});
  return { video: v, stop() { off(); v.pause(); v.removeAttribute('src'); v.load(); v.remove(); if (url.startsWith('blob:')) URL.revokeObjectURL(url); } }; }
// s650 the Runway programme as ONE video WITH SOUND: intro sting (logo + paper shuffle) → Sterling's voice (lip-synced) → outro sting (smile). ≈ 46 s.
async function recordProgramme({ w, h, fps, list, P, onProgress }) {
  const AC = new AudioContext(), dec = async n => AC.decodeAudioData(await (await fetch(new URL('../MERU/vo/' + n + '.mp3', import.meta.url).href)).arrayBuffer());
  const [aI, aV, aO] = await Promise.all([dec('news-intro'), dec('news-' + P.id), dec('news-outro')]); const total = P.intro + P.voice + P.outro;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(w, h, false);
  const C = makeCast(renderer, list, { silent: true, prog: P }); C.cam.aspect = w / h; C.cam.fov = 32; C.cam.updateProjectionMatrix();
  const types = ['video/mp4;codecs=avc1.42E01F,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'], type = types.find(x => window.MediaRecorder && MediaRecorder.isTypeSupported(x));
  if (!type) throw new Error('this browser cannot record video');
  C.frame(0, 0, 0); const vs = cv.captureStream(0), vt = vs.getVideoTracks()[0], dst = AC.createMediaStreamDestination();
  const st = new MediaStream([vt, ...dst.stream.getAudioTracks()]), rec = new MediaRecorder(st, { mimeType: type, videoBitsPerSecond: 1300000, audioBitsPerSecond: 96000 }), parts = [];
  rec.ondataavailable = e => { if (e.data && e.data.size) parts.push(e.data); }; const done = new Promise(r => { rec.onstop = r; });
  await AC.resume(); rec.start(500); const T0 = AC.currentTime + 0.15, play = (b, at) => { const s = AC.createBufferSource(); s.buffer = b; s.connect(dst); s.start(T0 + at); };
  play(aI, 0); play(aV, P.intro); play(aO, P.intro + P.voice);
  let last = 0; while (true) { const pt = AC.currentTime - T0; if (pt >= total + 0.2) break; if (pt >= 0) { C.frame(Math.max(0, pt - last), 0, pt); last = pt; vt.requestFrame && vt.requestFrame(); onProgress(Math.min(1, pt / total)); } await new Promise(r => setTimeout(r, 1000 / fps)); }
  rec.stop(); await done; C.stop(); renderer.dispose(); AC.close(); return new Blob(parts, { type: type.split(';')[0] }); }
