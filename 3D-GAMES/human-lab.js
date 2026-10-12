import * as THREE from './vendor/three/three.module.js';
import { makeGradient } from './village-game.js';
import { humanKit, HUMAN_DEFAULTS, randomHuman } from './engine/human-kit.js';
import { kitsuneOrb } from './engine/kitsune-orb.js';

// HUMAN WORKSHOP lab (Kyoto): one human on a studio floor or in a kyudo dojo. Poses: IDLE, WALK, KYUDO (the 8 steps, arrow flies to the mato), SHIKO (sumo stomp).
export const KYUDO_STEPS = [['ASHIBUMI', 'Footing: feet out along the line to the target, toes turned out.'], ['DOZUKURI', 'Posture: settle the body, bow resting on the left knee.'], ['YUGAMAE', 'Readying: nock the arrow, arms round in front, turn the head to the target.'], ['UCHIOKOSHI', 'Raising: lift the bow and arrow above the head.'], ['HIKIWAKE', 'Drawing apart: push the bow to the target, pull the string back.'], ['KAI', 'Full draw: the arrow sits at the cheek. Hold.'], ['HANARE', 'Release: the string goes, the bow turns in the hand.'], ['ZANSHIN', 'Remaining form: arms stay wide, eyes on the target.']];
export async function createHumanLab({ container, cfg, onState = () => {} }) {
  const touch = matchMedia('(pointer: coarse)').matches, host = () => (renderer && renderer.domElement.parentNode) || container, W = () => host().clientWidth || 1, Hh = () => host().clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.5 : 2)); renderer.setSize(W(), Hh()); renderer.shadowMap.enabled = !touch;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), grad = makeGradient(), HK = humanKit({ THREE, grad }), toon = HK.toon, V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const cam = new THREE.PerspectiveCamera(38, W() / Hh(), 0.05, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b4b0, 1.15)); const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(-3, 8, 6); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); scene.add(sun, sun.target);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  // ---------- backdrops ----------
  const BG = new THREE.Color(0xf3f2f2), SKY = new THREE.Color(0xcfe0e6); scene.background = BG; scene.fog = null;
  const STUDIO = new THREE.Group(), DOJO = new THREE.Group(); scene.add(STUDIO, DOJO);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshLambertMaterial({ color: 0xe6e4e3 })); f.rotation.x = -Math.PI / 2; f.position.x = 8; f.receiveShadow = true; STUDIO.add(f); const gr = new THREE.GridHelper(30, 60, 0xcfcac7, 0xd9d6d4); gr.position.y = 0.002; STUDIO.add(gr); }
  const plankT = CT(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#c9a06a', '#bf955f', '#d2aa74', '#b88d58'][i % 4]; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(60,36,18,0.35)'; g.fillRect(0, i * 32, w, 2); g.fillRect((i * 97) % w, i * 32, 2, 32); } }); plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping; plankT.repeat.set(3, 3);
  const shojiT = CT(256, 256, (g, w, h) => { g.fillStyle = '#f6f1e6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5a3a22'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); g.lineWidth = 3; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); } for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, i * h / 6); g.lineTo(w, i * h / 6); g.stroke(); } }); shojiT.wrapS = THREE.RepeatWrapping; shojiT.repeat.set(6, 1);
  const sandT = CT(128, 128, (g, w, h) => { g.fillStyle = '#d9c08a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = i % 2 ? 'rgba(120,90,50,0.25)' : 'rgba(255,255,255,0.2)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }); sandT.wrapS = sandT.wrapT = THREE.RepeatWrapping; sandT.repeat.set(6, 6);
  const ink = toon('#201e1d'), wood = toon('#5a3a22'), roofM = toon('#3a3836');
  { const fl = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 7), new THREE.MeshToonMaterial({ map: plankT, gradientMap: grad })); fl.position.set(2, -0.15, -0.5); fl.receiveShadow = true; DOJO.add(fl);
    const grv = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), new THREE.MeshLambertMaterial({ color: 0xbdb6aa })); grv.rotation.x = -Math.PI / 2; grv.position.set(18, -0.3, 0); DOJO.add(grv);
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshLambertMaterial({ color: 0x7a9a5a })); lawn.rotation.x = -Math.PI / 2; lawn.position.set(14, -0.28, 0); DOJO.add(lawn);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 3), new THREE.MeshToonMaterial({ map: shojiT, gradientMap: grad })); wall.position.set(2, 1.5, -3.9); DOJO.add(wall);
    for (const x of [-4, 0, 4, 8]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.6, 0.22), wood); p.position.set(x, 1.8, -3.9); DOJO.add(p); if (x === -4 || x === 8) { const p2 = p.clone(); p2.position.z = 2.9; DOJO.add(p2); } }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.3, 0.3), wood); beam.position.set(2, 3.5, 2.9); DOJO.add(beam); const beam2 = beam.clone(); beam2.position.z = -3.9; DOJO.add(beam2);
    for (const s of [0, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(13, 0.18, 4.4), roofM); r.position.set(2, 4.1 - s * 0.0, s ? 1.8 : -2.4); r.rotation.x = s ? 0.32 : -0.32; DOJO.add(r); }
    // azuchi: the sand bank under its own little roof, with three kasumi-mato
    const az = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 7), new THREE.MeshToonMaterial({ map: sandT, gradientMap: grad })); az.position.set(16.6, 1.0, 0); az.rotation.z = 0.35; DOJO.add(az);
    const ar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 7.6), roofM); ar.position.set(16.4, 3.1, 0); ar.rotation.z = 0.2; DOJO.add(ar); for (const z of [-3.6, 3.6]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3, 0.16), wood); p.position.set(16, 1.5, z); DOJO.add(p); } }
  const BACKW = DOJO.children.filter(o => o.position.z < -2);
  const matoT = CT(256, 256, (g) => { const R = [[124, '#201e1d'], [110, '#f3f2f2'], [84, '#201e1d'], [70, '#f3f2f2'], [48, '#201e1d'], [36, '#f3f2f2'], [18, '#201e1d']]; for (const [r, c] of R) { g.fillStyle = c; g.beginPath(); g.arc(128, 128, r, 0, 7); g.fill(); } });
  const MATO = []; for (const z of [-1.4, 0, 1.4]) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.36, 32), new THREE.MeshBasicMaterial({ map: matoT })); m.position.set(15.35, 0.62, z); m.rotation.y = -Math.PI / 2; scene.add(m); MATO.push(m); }
  const matoStand = new THREE.Group(); scene.add(matoStand); { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.62, 0.08), wood); p.position.set(15.4, 0.31, 0); matoStand.add(p); }
  // ---------- figure + bow + arrow ----------
  let fig = null, cfgNow = { ...HUMAN_DEFAULTS, ...(cfg || {}) };
  const BOW = new THREE.Group(); scene.add(BOW); const bowM = toon('#3a2014'), gripM = toon('#8a3a22'), bandM = toon('#e6b45a');
  const limbs = [new THREE.Mesh(new THREE.BufferGeometry(), bowM), new THREE.Mesh(new THREE.BufferGeometry(), bowM)]; limbs.forEach(m => { m.castShadow = true; BOW.add(m); });
  const gripMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.16, 10), gripM); BOW.add(gripMesh);
  const strG = new THREE.BufferGeometry().setFromPoints([V3(), V3(), V3()]), str = new THREE.Line(strG, new THREE.LineBasicMaterial({ color: 0xf3f2f2 })); BOW.add(str);
  const ARROW = new THREE.Group(); scene.add(ARROW); { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.0135, 0.0135, 1, 8), toon('#d9c08a')); s.rotation.z = -Math.PI / 2; s.position.x = 0.5; ARROW.add(s); const h = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.16, 4), toon('#8a8f96')); h.rotation.z = -Math.PI / 2; h.position.x = 1.07; h.scale.z = 0.35; ARROW.add(h);
    for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.025), new THREE.MeshBasicMaterial({ color: i ? 0x201e1d : 0xf3f2f2, side: THREE.DoubleSide })); f.position.set(0.1, 0, 0); f.rotation.x = i * Math.PI * 2 / 3; f.translateY(0.024); ARROW.add(f); } }
  let BL = { up: 1.4, lo: 0.8, flex: -1 };
  function bowGeo(flex) { if (Math.abs(flex - BL.flex) < 0.008) return; BL.flex = flex; const f = flex;
    const curve = (len, s) => new THREE.CatmullRomCurve3([V3(0, s * 0.08, 0), V3(0.035 - 0.02 * f, s * len * 0.35, 0), V3(0.0 - 0.06 * f, s * len * 0.72, 0), V3(-0.07 - 0.3 * f, s * len * (1 - 0.07 * f), 0)]);
    const cu = curve(BL.up, 1), cl = curve(BL.lo, -1); limbs[0].geometry.dispose(); limbs[1].geometry.dispose(); limbs[0].geometry = new THREE.TubeGeometry(cu, 24, 0.028, 6); limbs[1].geometry = new THREE.TubeGeometry(cl, 14, 0.028, 6); BL.tu = cu.getPoint(1); BL.tl = cl.getPoint(1); }
  function rebuild() { if (fig) { scene.remove(fig); fig.traverse(m => { if (m.isMesh && m.geometry) m.geometry.dispose(); }); } fig = HK.make(cfgNow); scene.add(fig); const k = cfgNow.height / 1.75; BL.up = 1.4 * k; BL.lo = 0.78 * k; BL.flex = -1; bowGeo(0); BOW.visible = ARROW.visible = !!cfgNow.bow; gripMesh.position.y = 0; }
  // ---------- crowd (townsfolk generator) ----------
  const CROWD = []; let crowdOn = false;
  function makeCrowd() { CROWD.forEach(c => scene.remove(c.g)); CROWD.length = 0; if (!crowdOn) return; for (let i = 0; i < 7; i++) { const g = HK.make(randomHuman()); const a = -1.1 + i * 0.37; g.position.set(Math.sin(a) * 3.2 - 0.6, 0, -Math.cos(a) * 3.2 + 0.4); g.rotation.y = Math.atan2(-g.position.x, -g.position.z); scene.add(g); CROWD.push({ g, P: HK.restPose(g), t: Math.random() * 9 }); } }
  // ---------- poses ----------
  const ST = { mode: 'idle', t: 0, step: 0, slow: false, paused: false, dojo: true, view: '3d', yaw: 0.55, pitch: 0.12, dist: 0, blend: 1, from: null, yug: 0, arrow: null };
  const lerpP = (a, b, t) => { const o = {}; for (const k in b) { const x = a[k], y = b[k]; o[k] = Array.isArray(y) ? y.map((v, i) => (x ? x[i] : v) + (v - (x ? x[i] : v)) * t) : typeof y === 'number' ? (x ?? y) + (y - (x ?? y)) * t : y; } return o; };
  const ss = t => t * t * (3 - 2 * t);
  function kyudoKeys(R, L) { const k = L.H / 1.75, sy = L.hipY + L.torsoL * 0.93, st = { fL: [0.4 * k, L.footH, -0.02], fR: [-0.4 * k, L.footH, -0.02], fYawL: 0.55, fYawR: -0.55, kL: [0.6 * k, L.hipY * 0.6, 1], kR: [-0.6 * k, L.hipY * 0.6, 1] };
    const P = (o) => ({ ...R, ...st, ...o });
    return [
      P({ hL: [0.26 * k, sy - 0.52 * k, 0.1 * k], hR: [-0.25 * k, sy - 0.52 * k, 0.1 * k], yaw: 1.1 }),
      P({ hL: [0.26 * k, sy - 0.5 * k, 0.12 * k], hR: [-0.25 * k, sy - 0.5 * k, 0.12 * k], yaw: 0, lean: 0.02 }),
      P({ hL: [0.13 * k, sy - 0.3 * k, 0.42 * k], hR: [-0.04 * k, sy - 0.28 * k, 0.38 * k], eL: [0.8 * k, sy - 0.15, 0.2], eR: [-0.8 * k, sy - 0.15, 0.2], yaw: 1.35 }),
      P({ hL: [0.2 * k, sy + 0.42 * k, 0.4 * k], hR: [-0.07 * k, sy + 0.42 * k, 0.36 * k], eL: [0.9 * k, sy + 0.15, 0.15], eR: [-0.9 * k, sy + 0.2, 0.0], yaw: 1.35 }),
      P({ hL: [0.64 * k, sy + 0.36 * k, 0.16 * k], hR: [-0.15 * k, sy + 0.38 * k, 0.14 * k], eL: [0.5 * k, sy - 0.3, -0.3], eR: [-1.1 * k, sy + 0.45 * k, -0.35 * k], yaw: 1.45 }),
      P({ hL: [0.84 * k, sy + 0.14 * k, 0.13 * k], hR: [-0.1 * k, sy + 0.15 * k, 0.12 * k], eL: [0.45 * k, sy - 0.4, -0.25], eR: [-1.4 * k, sy + 0.02 * k, -0.45 * k], yaw: 1.5, mood: 'focus' }),
      P({ hL: [0.84 * k, sy + 0.14 * k, 0.13 * k], hR: [-0.74 * k, sy + 0.12 * k, 0.0], eL: [0.45 * k, sy - 0.4, -0.25], eR: [-0.9 * k, sy + 0.1 * k, -0.7 * k], yaw: 1.5, mood: 'focus' }),
      P({ hL: [0.84 * k, sy + 0.12 * k, 0.12 * k], hR: [-0.78 * k, sy + 0.1 * k, -0.02 * k], eL: [0.45 * k, sy - 0.4, -0.25], eR: [-0.9 * k, sy + 0.1 * k, -0.7 * k], yaw: 1.5, mood: 'determined' })]; }
  const KY_DUR = [1.6, 1.4, 1.8, 1.6, 1.8, 2.2, 0.22, 2.4];
  function shikoKeys(R, L) { const k = L.H / 1.75, sq = { fL: [0.5 * k, L.footH, 0.05], fR: [-0.5 * k, L.footH, 0.05], fYawL: 0.9, fYawR: -0.9, kL: [1.2 * k, L.hipY * 0.6, 1], kR: [-1.2 * k, L.hipY * 0.6, 1], hip: [0, -0.32 * k, -0.04], lean: 0.32, hL: [0.42 * k, L.hipY * 0.55, 0.22 * k], hR: [-0.42 * k, L.hipY * 0.55, 0.22 * k], eL: [1, L.hipY, 0], eR: [-1, L.hipY, 0], mood: 'determined' };
    const lift = s => ({ ...sq, hip: [-s * 0.26 * k, -0.12 * k, 0], side: s * 0.28, lean: 0.25, [s > 0 ? 'fL' : 'fR']: [s * 0.95 * k, L.hipY * 0.95, 0.12 * k], [s > 0 ? 'kL' : 'kR']: [s * 1.5 * k, L.hipY * 1.4, 0.6], [s > 0 ? 'hL' : 'hR']: [s * 0.55 * k, L.hipY * 0.9, 0.28 * k] });
    const stomp = { ...sq, hip: [0, -0.4 * k, -0.04] };
    return [[{ ...R, ...sq }, 1.0], [{ ...R, ...lift(1) }, 0.9], [{ ...R, ...lift(1) }, 0.35], [{ ...R, ...stomp }, 0.14, 'L'], [{ ...R, ...sq }, 0.7], [{ ...R, ...lift(-1) }, 0.9], [{ ...R, ...lift(-1) }, 0.35], [{ ...R, ...stomp }, 0.14, 'R'], [{ ...R, ...sq }, 0.7]]; }
  let lastP = null, dust = [];
  function poseNow(dt) { const R = HK.restPose(fig), L = fig.userData.H.L, k = L.H / 1.75;
    if (ST.mode === 'walk') { const ph = ST.t * 5.2, s = 0.22 * k, sy = L.hipY + L.torsoL * 0.93;
      return { ...R, hip: [0, -Math.abs(Math.cos(ph)) * 0.025 * k + 0.012, 0], twist: Math.sin(ph) * 0.12, fL: [L.hipW + 0.02, L.footH + Math.max(0, -Math.sin(ph)) * 0.09 * k, Math.cos(ph) * s], fR: [-L.hipW - 0.02, L.footH + Math.max(0, Math.sin(ph)) * 0.09 * k, -Math.cos(ph) * s],
        hL: [R.hL[0], R.hL[1] + 0.03, -Math.cos(ph) * 0.2 * k + 0.05], hR: [R.hR[0], R.hR[1] + 0.03, Math.cos(ph) * 0.2 * k + 0.05], eL: [R.eL[0], sy - 0.4, -0.6], eR: [R.eR[0], sy - 0.4, -0.6], mood: null }; }
    if (ST.mode === 'kyudo') { const K = kyudoKeys(R, L); let t = ST.t, i = 0; const total = KY_DUR.reduce((a, b) => a + b, 0) + 1.2; t = t % total; while (i < 8 && t > KY_DUR[i]) { t -= KY_DUR[i]; i++; } if (i >= 8) { ST.step = 7; return K[7]; } ST.step = i; const a = i === 0 ? { ...R, ...K[0], hL: R.hL, hR: R.hR } : K[i - 1], b = K[i], tt = Math.min(1, t / (i === 6 ? 0.08 : i === 5 ? 1.0 : KY_DUR[i] * 0.85)); return lerpP(a, b, ss(tt)); }
    if (ST.mode === 'shiko') { const K = shikoKeys(R, L); const total = K.reduce((a, b) => a + b[1], 0); let t = ST.t % total, i = 0; while (t > K[i][1]) { t -= K[i][1]; i++; } const prev = K[(i + K.length - 1) % K.length][0], [b, d, stomp] = K[i]; if (stomp && !ST['st' + i + Math.floor(ST.t / total)]) { ST['st' + i + Math.floor(ST.t / total)] = 1; ST.stomp = { side: stomp, t: d }; } return lerpP(prev, b, ss(Math.min(1, t / d))); }
    if (ST.mode === 'ninja') { const sy = L.hipY + L.torsoL * 0.93, br = Math.sin(ST.t * 1.6) * 0.008; return { ...R, hip: [0, -0.2 * k + br, -0.03], lean: 0.32, yaw: 0.25, fL: [0.26 * k, L.footH, 0.2 * k], fR: [-0.24 * k, L.footH, -0.22 * k], kL: [0.9, L.hipY * 0.6, 1], kR: [-0.9, L.hipY * 0.6, 1], fYawL: 0.35, fYawR: -0.6, hR: [-0.03 * k, sy - 0.34 * k + br, 0.3 * k], eR: [-1.1, sy - 0.6, -0.2], hL: [0.04 * k, sy - 0.36 * k + br, 0.28 * k], eL: [1.1, sy - 0.6, -0.2], mood: null }; }
    if (ST.mode === 'gassho') { const sy = L.hipY + L.torsoL * 0.93, f = fig.userData.H.J.heavy ? (fig.userData.H.J.bellyR || 0.3) * 1.25 : 0.2 * k, br = Math.sin(ST.t * 0.9) * 0.006; return { ...R, hip: [0, br, 0], lean: 0.04, pitch: 0.12, hL: [0.07 * k, sy - 0.06 * k + br, f + 0.2 * k], hR: [-0.07 * k, sy - 0.06 * k + br, f + 0.2 * k], eL: [0.9, sy - 0.9, 0.15], eR: [-0.9, sy - 0.9, 0.15], mood: null }; }
    return { ...R, hip: [Math.sin(ST.t * 0.8) * 0.008, 0, 0], yaw: Math.sin(ST.t * 0.4) * 0.15, mood: null }; }
  const TK = { on: false, ts: { rate: 1, amp: 1, base: 0.25, gest: 1 }, say: null, mt: 0, mouth: 0, vis: 'a' };
  function talkPose(P, dt) { const ts = TK.ts; TK.mt += dt;
    if (TK.say) { const S2 = TK.say; S2.t += dt * ts.rate; const cps = 13, i = Math.floor(S2.t * cps), ch = (S2.text[i] || '').toLowerCase(), fr = S2.t * cps - i; let tgt = 0; TK.vis = /[ou]/.test(ch) ? 'o' : /[mbp]/.test(ch) ? 'm' : /[fv]/.test(ch) ? 'f' : 'a';
      if (/[aeiy]/.test(ch)) tgt = 0.75; else if (/[ou]/.test(ch)) tgt = 0.9; else if (/[mbp]/.test(ch)) tgt = 0; else if (/[a-z]/.test(ch)) tgt = 0.3; tgt *= ts.amp * (0.85 + 0.15 * Math.sin(fr * Math.PI)); TK.mouth += (Math.min(1, tgt) - TK.mouth) * (1 - Math.exp(-28 * dt)); S2.shown = Math.min(S2.text.length, i + 1); if (i > S2.text.length + 10) { TK.say = null; if (!TK.loop) TK.on = false; } }
    else if (TK.on) { TK.vis = 'a'; TK.mouth = Math.min(1, Math.max(0, (Math.sin(TK.mt * 13 * ts.rate) * 0.7 + Math.sin(TK.mt * 21.3 * ts.rate) * 0.35 + Math.sin(TK.mt * 3.7) * 0.3 + ts.base) * ts.amp)); }
    else TK.mouth += (0 - TK.mouth) * (1 - Math.exp(-14 * dt));
    const talking = TK.on || !!TK.say; TK.g = (TK.g || 0) + ((talking ? 1 : 0) - (TK.g || 0)) * (1 - Math.exp(-5 * dt)); const gw = TK.g, ga = ts.gest ?? 1, mt = TK.mt;
    const o = { ...P, mouth: TK.mouth, vis: TK.vis }; if (gw < 0.01) return o;
    o.pitch = (P.pitch || 0) + gw * (TK.mouth * 0.05 * ga + Math.sin(mt * 2.1) * 0.03 * ga); o.yaw = (P.yaw || 0) + gw * Math.sin(mt * 0.9) * 0.1 * ga;
    if (ST.mode === 'idle' || ST.mode === 'walk') { const L = fig.userData.H.L, k = L.H / 1.75, sy = L.hipY + L.torsoL * 0.93, f = fig.userData.H.J.heavy ? (fig.userData.H.J.bellyR || 0.3) * 1.2 : 0.2 * k, sw = Math.sin(mt * 2.2 * ts.rate);
      const gR = [-0.24 * k, sy - 0.32 * k + sw * 0.06 * ga, f + 0.16 * k * ga + sw * 0.04]; o.hR = P.hR.map((v, i) => v + (gR[i] - v) * gw * Math.min(1, ga)); o.eR = [-1.2, sy - 0.5, -0.4];
      if (ga > 1.2) { const s2 = Math.sin(mt * 2.6 + 1), gL = [0.26 * k, sy - 0.3 * k + s2 * 0.08, f + 0.14 * k + s2 * 0.04]; o.hL = P.hL.map((v, i) => v + (gL[i] - v) * gw); o.eL = [1.2, sy - 0.5, -0.4]; } }
    return o; }
  function updBowArrow(P, dt) { if (!cfgNow.bow) return; const J = fig.userData.H.J; fig.updateMatrixWorld(true); const g = J.handL.localToWorld(V3(0, -0.035, 0)), nk = J.handR.localToWorld(V3(0, -0.03, 0.02));
    const kyu = ST.mode === 'kyudo', step = kyu ? ST.step : -1; BOW.position.copy(g); if (step === 6 && ST.yug < 1) ST.yug = Math.min(1, ST.yug + dt / 0.25); if (!kyu || step < 6) ST.yug = Math.max(0, kyu && step < 6 && step > 0 ? 0 : ST.yug - dt * 2);
    BOW.rotation.set(0, ST.yug * Math.PI * 0.9, step >= 0 && step < 2 ? -0.08 : 0);
    const loc = BOW.worldToLocal(nk.clone()), drawn = kyu && step >= 2 && step <= 5, flexD = drawn ? Math.max(0, -loc.x - 0.16) : 0; bowGeo(Math.min(1, flexD / 0.7));
    const pts = strG.attributes.position; pts.setXYZ(0, BL.tu.x, BL.tu.y, 0); if (drawn) pts.setXYZ(1, loc.x, loc.y, 0); else pts.setXYZ(1, (BL.tu.x + BL.tl.x) / 2, 0, 0); pts.setXYZ(2, BL.tl.x, BL.tl.y, 0); pts.needsUpdate = true;
    if (!kyu) { ARROW.visible = false; ST.arrow = null; return; }
    if (step >= 2 && step <= 5) { ARROW.visible = true; ST.arrow = null; ARROW.position.copy(nk); const d = g.clone().sub(nk); d.y = d.y * 0.2; ARROW.quaternion.setFromUnitVectors(V3(1, 0, 0), d.normalize()); }
    else if (step >= 6) { if (!ST.arrow) { const tgt = MATO[1].position.clone().add(V3(-0.02, (Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25)); ST.arrow = { t: 0, p0: ARROW.position.clone(), p1: tgt.add(V3(0.0, 0, 0)), dur: 0.42 }; }
      const A = ST.arrow; A.t = Math.min(A.dur, A.t + dt); const u = A.t / A.dur, p = A.p0.clone().lerp(A.p1, u); p.y += Math.sin(u * Math.PI) * 0.35; const pn = A.p0.clone().lerp(A.p1, Math.min(1, u + 0.02)); pn.y += Math.sin(Math.min(1, u + 0.02) * Math.PI) * 0.35;
      if (u < 1) ARROW.quaternion.setFromUnitVectors(V3(1, 0, 0), pn.sub(p).normalize()); ARROW.position.copy(p).addScaledVector(V3(1, 0, 0).applyQuaternion(ARROW.quaternion), u >= 1 ? -0.9 : 0); ARROW.visible = true; }
    else { ARROW.visible = false; ST.arrow = null; } }
  // ---------- camera ----------
  const ptrs = new Map(), el = renderer.domElement; let pd = 0;
  el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); });
  el.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pd) ST.dist = Math.min(14, Math.max(0.6, ST.dist * pd / d)); pd = d; return; } ST.yaw -= dx * 0.008; ST.pitch = Math.min(1.2, Math.max(-0.3, ST.pitch + dy * 0.006)); ST.user = true; });
  const endP = e => { ptrs.delete(e.pointerId); pd = 0; }; el.addEventListener('pointerup', endP); el.addEventListener('pointercancel', endP);
  el.addEventListener('wheel', e => { ST.dist = Math.min(14, Math.max(0.6, ST.dist * (1 + Math.sign(e.deltaY) * 0.08))); e.preventDefault(); }, { passive: false });
  const VIEWS = { '3d': [0.55, 0.12, 1], front: [0, 0.04, 1], side: [Math.PI / 2, 0.05, 1], back: [Math.PI, 0.1, 1], face: [0.2, 0.02, 0.32], range: [-1.5, 0.1, 1.15] };
  function setView(v) { ST.view = v; const [y, p, d] = VIEWS[v] || VIEWS['3d']; ST.yaw = y; ST.pitch = p; ST.dist = d * (cfgNow.height * (v === 'face' ? 2.3 : 2.7)); }
  function frameCam() { const L = fig.userData.H.L, asp = W() / Hh(); cam.aspect = asp; cam.fov = asp < 0.8 ? 50 : 38; cam.updateProjectionMatrix();
    const tgt = ST.view === 'face' ? V3(0, L.H - L.headH * 0.5, 0) : ST.view === 'range' ? V3(3.5, 1.35, 0) : V3(0, L.H * 0.4, 0); const d = ST.dist * (asp < 0.8 && ST.view !== 'face' ? 1.35 : 1);
    if (ST.view === 'face') { const J = fig.userData.H.J; J.head.updateWorldMatrix(true, false); J.head.getWorldPosition(tgt); tgt.y += L.rH; } if (ST.tgtObj) { ST.tgtObj.updateWorldMatrix(true, false); ST.tgtObj.getWorldPosition(tgt); }
    cam.position.set(tgt.x + Math.sin(ST.yaw) * Math.cos(ST.pitch) * d, tgt.y + Math.sin(ST.pitch) * d, tgt.z + Math.cos(ST.yaw) * Math.cos(ST.pitch) * d); cam.lookAt(tgt); }
  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, curP = null;
  const dustM = new THREE.MeshBasicMaterial({ color: 0xb8a77a, transparent: true, opacity: 0.6, depthWrite: false });
  function update(dt) { dt = Math.min(dt, 0.05); if (ST.paused) dt = 0; if (ST.slow) dt *= 0.25; ST.t += dt;
    const target = poseNow(dt); if (ST.blend < 1) { ST.blend = Math.min(1, ST.blend + dt / 0.45); curP = lerpP(ST.from, target, ss(ST.blend)); } else curP = target;
    curP = talkPose(curP, dt); HK.update(fig, curP, dt); updBowArrow(curP, dt);
    if (KO.fig !== fig) { KO.fig = fig; KO.attach(fig, cfgNow.outfit === 'empress' || cfgNow.type === 'empress' ? 'violet' : 'blue'); ST.orb = false; } KO.update(dt, cam); fig.position.y = fig.userData.orbY || 0;
    if (ST.stomp) { const s = ST.stomp; ST.stomp = null; HK.kick(fig, 1.6); const J = fig.userData.H.J, p = (s.side === 'L' ? J.anL : J.anR).getWorldPosition(V3()); for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), dustM.clone()); m.position.set(p.x, 0.05, p.z); scene.add(m); dust.push({ m, v: V3((Math.random() - 0.5) * 2.5, Math.random() * 1.2, (Math.random() - 0.5) * 2.5), t: 0.8 }); } ST.shake = 0.25; }
    for (let i = dust.length - 1; i >= 0; i--) { const d = dust[i]; d.t -= dt; d.m.position.addScaledVector(d.v, dt); d.m.scale.multiplyScalar(1 + dt * 2); d.m.material.opacity = Math.max(0, d.t * 0.75); if (d.t <= 0) { scene.remove(d.m); d.m.material.dispose(); dust.splice(i, 1); } }
    if (ST.mode === 'walk' && fig.userData.H.J.belly) { const ph = ST.t * 5.2; if (Math.sin(ph) * Math.sin(ph - dt * 5.2) <= 0) HK.kick(fig, 0.4); }
    CROWD.forEach(c => { c.t += dt; const P = { ...c.P, yaw: Math.sin(c.t * 0.5) * 0.3, hip: [0, 0, 0] }; HK.update(c.g, P, dt); });
    STUDIO.visible = !ST.dojo; DOJO.visible = ST.dojo; scene.background = ST.dojo ? SKY : BG; matoStand.visible = !ST.dojo; MATO.forEach((m, i) => m.visible = ST.dojo || i === 1);
    frameCam(); { const behind = ST.dojo && cam.position.z < -3.3; BACKW.forEach(o => o.visible = !behind); } if (ST.shake > 0) { ST.shake -= dt; cam.position.y += (Math.random() - 0.5) * ST.shake * 0.08; }
    hudT -= dt; if (hudT <= 0 || dt === 0) { hudT = 0.15; onState({ mode: ST.mode, step: ST.mode === 'kyudo' ? ST.step : -1, stepName: ST.mode === 'kyudo' ? (ST.step + 1) + ' · ' + KYUDO_STEPS[ST.step][0] : '', stepNote: ST.mode === 'kyudo' ? KYUDO_STEPS[ST.step][1] : '' }); } }
  function loop() { raf = requestAnimationFrame(loop); { const h = host(), pr = renderer.getPixelRatio(); if (h !== container && h) { container = h; ro.disconnect(); ro.observe(h); } if (Math.abs(renderer.domElement.width - Math.round(W() * pr)) > 2 || Math.abs(renderer.domElement.height - Math.round(Hh() * pr)) > 2) renderer.setSize(W(), Hh()); } update(clock.getDelta()); renderer.render(scene, cam); }
  const KO = kitsuneOrb({ THREE }); scene.add(KO.group);
  rebuild(); setView('3d'); curP = HK.restPose(fig); renderer.setSize(W(), Hh()); requestAnimationFrame(() => renderer.setSize(W(), Hh())); loop();
  const ro = new ResizeObserver(() => renderer.setSize(W(), Hh())); ro.observe(container);
  const api = {
    setTalking(v) { TK.on = !!v; TK.loop = !!v; if (!v) TK.say = null; }, setTalkStyle(ts) { if (ts) TK.ts = ts; }, say(text) { TK.on = true; TK.say = { text, t: 0, shown: 0 }; }, speech() { return TK.say ? { text: TK.say.text, shown: TK.say.shown || 0 } : null; },
    set(c) { cfgNow = { ...HUMAN_DEFAULTS, ...c }; const keep = curP; rebuild(); ST.from = keep || HK.restPose(fig); ST.blend = 1; },
    setMode(m) { ST.from = curP; ST.blend = 0; ST.mode = m; ST.t = 0; ST.yug = 0; ST.arrow = null; if (m === 'kyudo' && ST.view === '3d' && !ST.user) setView('front'); },
    setView, toggle(k) { if (k === 'crowd') { crowdOn = !crowdOn; makeCrowd(); return crowdOn; } if (k === 'orb') { ST.orb = !ST.orb; if (ST.orb) KO.toOrb(); else KO.toHuman(); return ST.orb; } ST[k] = !ST[k]; return ST[k]; }, reroll() { if (crowdOn) makeCrowd(); },
    el: renderer.domElement, rebind(c) { if (!c) return; container = c; if (renderer.domElement.parentNode !== c) c.appendChild(renderer.domElement); ro.disconnect(); ro.observe(c); renderer.setSize(W(), Hh()); },
    state: () => ({ mode: ST.mode, view: ST.view, slow: ST.slow, paused: ST.paused, dojo: ST.dojo, crowd: crowdOn, orb: !!ST.orb }), orb: KO,
    _cam(y, p, d, obj) { ST.yaw = y; ST.pitch = p; if (d) ST.dist = d; ST.tgtObj = obj || null; }, _step(n = 30) { for (let i = 0; i < n; i++) update(1 / 30); renderer.render(scene, cam); }, _fig: () => fig,
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); el.remove(); } };
  window.__HUMAN_LAB = api; return api;
}
