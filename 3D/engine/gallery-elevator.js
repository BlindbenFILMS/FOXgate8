// Blind Canvas gallery: the lift to the eye platform over the music room.
// Above the music room the ceiling opens in the shape of an eye, and the iris floats in it: a ring floor at 14.81 m with the pupil
// (an open hole) in the middle. Its tall rim and the tube round the pupil are carved away (gallery-remodel.js CARVES), so the ring
// is an open walkway: a curved stained-glass rail round its outer edge to lean on and look down into the room, and a glass rail
// round the pupil with a gate where the lift arrives.
// The lift: a round platform on the music room floor right under the pupil. Stand on it: "TAKE THE ELEVATOR TO FLOOR 2". It rises
// through the pupil and stops level with the ring; step off, walk round, step back on and ride it down. While it's away, the gate
// in the pupil rail holds you back (no falling down the hole).
import * as THREE from '../vendor/three/three.module.js';
import { stainedGlass, irisGlass } from './gallery-stained.js';

export const LIFT = { x: -205.6, z: -0.5, y0: -3.24, y1: 14.81, r: 1.95, hole: 2.05, ringIn: 2.05, ringOut: 6.25, gateA: 0 };   // gate faces +x (toward the music room's entrance side)

export function buildElevator({ scene, resolveImg = u => u }) {
  const L = LIFT, g = new THREE.Group(); scene.add(g); const col = [];
  const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), blue = new THREE.MeshBasicMaterial({ color: 0x15309a }), steel = new THREE.MeshLambertMaterial({ color: 0x9aa0a6 });
  // ---- two lift platforms, each an ink deck with a glowing blue edge and a lettered ring round the Ora logo:
  // the floor 1 lift rests on the music room floor; the floor 2 lift rests in the pupil, level with the glass ring
  const mkPlat = (y, label) => {
    const plat = new THREE.Group(); plat.position.set(L.x, y, L.z); g.add(plat);
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(L.r, L.r, 0.14, 40), ink); deck.position.y = -0.07; plat.add(deck);
    const edge = new THREE.Mesh(new THREE.TorusGeometry(L.r - 0.04, 0.05, 8, 48), new THREE.MeshBasicMaterial({ color: 0x5fa8ff })); edge.rotation.x = Math.PI / 2; edge.position.y = 0.01; plat.add(edge);
    const topT = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 512; const c = cv.getContext('2d');
      c.fillStyle = '#1d1c1b'; c.beginPath(); c.arc(256, 256, 256, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#2f62ff'; c.lineWidth = 14; c.beginPath(); c.arc(256, 256, 228, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#fff'; c.font = '800 34px Archivo, Arimo, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      const txt = label.repeat(2); for (let i = 0; i < txt.length; i++) { const a = -Math.PI / 2 + i / txt.length * Math.PI * 2; c.save(); c.translate(256 + Math.cos(a) * 190, 256 + Math.sin(a) * 190); c.rotate(a + Math.PI / 2); c.fillText(txt[i], 0, 0); c.restore(); }
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      // the pupil: the Ora logo (our sponsor), white on the black deck
      const img = new Image(); img.onload = () => { const sx = 120, sy = 40, sw = 272, sh = 215, k = 300 / sw; c.save(); c.beginPath(); c.arc(256, 256, 168, 0, Math.PI * 2); c.clip(); c.globalCompositeOperation = 'lighten'; c.drawImage(img, sx, sy, sw, sh, 256 - sw * k / 2, 256 - sh * k / 2 + 4, sw * k, sh * k); c.restore(); t.needsUpdate = true; };
      img.src = resolveImg('gallery/img/ora_card_16x9_black_269773142.webp');
      return t; })();
    const face = new THREE.Mesh(new THREE.CircleGeometry(L.r - 0.1, 40), new THREE.MeshBasicMaterial({ map: topT })); face.rotation.x = -Math.PI / 2; face.position.y = 0.006; plat.add(face);
    return { g: plat, y, home: y, target: y, idle: 0 };
  };
  const LO = mkPlat(L.y0, 'ELEVATOR · FLOOR 2 · THE EYE · '), UP = mkPlat(L.y1, 'ELEVATOR · FLOOR 1 · MUSIC ROOM · ');
  // ---- the ring floor itself, now stained glass like the facade's eye (the model's teal ring is carved away: CARVES), with a
  // slim ink fascia at its inner and outer edges, and a flat collision ring to walk on
  { const fy = L.y1 + 0.02;
    const glass = new THREE.Mesh(new THREE.RingGeometry(L.ringIn, L.ringOut + 0.05, 96, 1), irisGlass({ cx: L.x, cz: L.z, rIn: L.ringIn, rOut: L.ringOut + 0.05 }));
    glass.rotation.x = -Math.PI / 2; glass.position.set(L.x, fy, L.z); glass.renderOrder = 3; g.add(glass);
    for (const [r, h] of [[L.ringIn, 0.3], [L.ringOut + 0.05, 0.36]]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 96, 1, true), new THREE.MeshLambertMaterial({ color: 0x1d1c1b, side: THREE.DoubleSide })); f.position.set(L.x, fy - h / 2 + 0.01, L.z); g.add(f); }
    const walk = new THREE.Mesh(new THREE.RingGeometry(L.ringIn, L.ringOut + 0.05, 48, 1)); walk.rotation.x = -Math.PI / 2; walk.position.set(L.x, fy, L.z); walk.updateMatrixWorld(true); col.push(walk);
  }
  // a light column marking the shaft, faint, from the floor up through the pupil
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(L.r, L.r, L.y1 - L.y0, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x6aa0ff, transparent: true, opacity: 0.06, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  shaft.position.set(L.x, (L.y0 + L.y1) / 2, L.z); g.add(shaft);
  // ---- rails on the ring: outer (stained glass, wrapped round) and round the pupil, with a gate gap
  const railRing = (r, from, to, glassCell) => {
    const seg = to - from, h = 1.05;
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h - 0.08, 64, 1, true, from, seg), stainedGlass({ cell: glassCell, y0: L.y1, y1: L.y1 + h, plane: 'cyl', cyl: [L.x, L.z, r] }));
    glass.position.set(L.x, L.y1 + (h - 0.08) / 2 + 0.02, L.z); glass.renderOrder = 4; g.add(glass);
    const rail = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 6, 64, seg), blue); rail.rotation.x = Math.PI / 2; rail.rotation.z = Math.PI / 2 - from - seg;   // torus arcs run from +x toward +z; cylinder arcs from +z
    rail.position.set(L.x, L.y1 + h, L.z); g.add(rail);
    const n = Math.max(2, Math.round(seg * r / 1.6));
    for (let i = 0; i <= n; i++) { const a = from + seg * i / n, px = L.x + Math.sin(a) * r, pz = L.z + Math.cos(a) * r; const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, h, 0.07), ink); post.position.set(px, L.y1 + h / 2, pz); g.add(post); }
    // collision: short boxes round the arc (a solid rail you can't step through)
    const m = Math.max(4, Math.round(seg * r / 0.6));
    for (let i = 0; i < m; i++) { const a = from + seg * (i + 0.5) / m, b = new THREE.Mesh(new THREE.BoxGeometry(seg * r / m + 0.05, h, 0.12)); b.position.set(L.x + Math.sin(a) * r, L.y1 + h / 2, L.z + Math.cos(a) * r); b.rotation.y = a; b.updateMatrixWorld(true); col.push(b); }
  };
  railRing(L.ringOut, Math.PI / 2 + 0.26, Math.PI / 2 + Math.PI * 2 - 0.26, 0.5);   // open toward +x, where the skywalk from the 2nd floor arrives
  const GATE = 0.62;   // half-angle of the gate (rad) at the pupil rail
  railRing(L.ringIn + 0.15, L.gateA + Math.PI / 2 + GATE, L.gateA + Math.PI / 2 + Math.PI * 2 - GATE, 0.35);   // CylinderGeometry angle 0 = +z; the gate faces +x
  // the gate itself: a pair of slim glass leaves that close when the lift isn't up
  const leafM = new THREE.MeshBasicMaterial({ color: 0x9fc4ff, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide });
  const gate = new THREE.Mesh(new THREE.CylinderGeometry(L.ringIn + 0.15, L.ringIn + 0.15, 0.95, 24, 1, true, L.gateA + Math.PI / 2 - GATE, GATE * 2), leafM); gate.position.set(L.x, L.y1 + 0.5, L.z); g.add(gate);
  const gateBar = new THREE.Mesh(new THREE.TorusGeometry(L.ringIn + 0.15, 0.03, 6, 24, GATE * 2), blue); gateBar.rotation.x = Math.PI / 2; gateBar.rotation.z = Math.PI / 2 - (L.gateA + Math.PI / 2 - GATE) - GATE * 2; gateBar.position.set(L.x, L.y1 + 0.98, L.z); g.add(gateBar);
  // a floor marker in the music room round the lift
  // a wood-inlay eye in the music room floor round the lift (marquetry, not paint): a sunburst of teal-stained wood for the iris,
  // a narrow ebonised navy limbal band, bleached maple for the white with its grain running the length of the eye, thin dark
  // stringing between them; solid at the lift, fading into the oak floor toward the corners of the almond. Its long axis runs
  // along z, like the eye-shaped opening in the ceiling above.
  {
    const EL = 12.0, EH = 6.2;   // half-length (z) and half-height (x) of the almond
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, fog: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uC: { value: new THREE.Vector2(L.x, L.z) }, uL: { value: EL }, uH: { value: EH }, uR: { value: L.r } }]),
      vertexShader: `varying vec3 vW;
        #include <fog_pars_vertex>
        void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `uniform vec2 uC; uniform float uL; uniform float uH; uniform float uR; varying vec3 vW;
        #include <fog_pars_fragment>
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
        float grain(vec2 p) {   // p.x along the grain, p.y across it
          float n = noise(vec2(p.x * 0.35, p.y * 2.2)) * 0.6 + noise(vec2(p.x * 0.9, p.y * 7.0)) * 0.3;
          float lines = sin((p.y + n * 0.9) * 38.0) * 0.5 + 0.5; return clamp(0.82 + n * 0.22 - pow(lines, 6.0) * 0.12, 0.0, 1.2);
        }
        void main() {
          vec2 P = vec2(vW.z - uC.y, vW.x - uC.x);   // (along the eye, across it)
          float r = length(P), a = atan(P.y, P.x);
          // almond: inside two circles of radius R centred d either side across the eye
          float d = (uL * uL - uH * uH) / (2.0 * uH), R = d + uH;
          float alm = (max(length(P - vec2(0.0, -d)), length(P - vec2(0.0, d))) - d) / uH;   // 0 at the centre, 1 on the almond's edge
          if (alm > 1.0 || r < uR - 0.02) discard;   // (the lift's own deck covers the middle)
          float rIris = uR + 1.25, rLimb = rIris + 0.3;
          vec3 col; float al;
          if (r < rIris) {                                  // iris: a sunburst veneer, teal-stained, each wedge a different leaf
            float wedges = 24.0, w = floor((a / 6.2832 + 0.5) * wedges), fa = fract((a / 6.2832 + 0.5) * wedges);
            float g = grain(vec2(r * 2.2 + hash(vec2(w, 1.0)) * 9.0, fa * 1.6 + w));
            col = vec3(0.13, 0.42, 0.43) * (0.85 + hash(vec2(w, 3.0)) * 0.22) * g;
            col *= mix(0.86, 1.0, smoothstep(0.0, 0.05, min(fa, 1.0 - fa) * 6.2832 / wedges * r));   // the seams between leaves
            al = 1.0;
          } else if (r < rLimb) {                           // limbal ring: ebonised navy, grain running round
            col = vec3(0.07, 0.10, 0.22) * grain(vec2(a * 4.0, r * 6.0)); al = 1.0;
          } else {                                          // the white: bleached maple, grain along the eye, fading out to the oak
            float plank = floor(P.y / 0.42);
            col = vec3(0.83, 0.77, 0.66) * grain(vec2(P.x * 0.6 + hash(vec2(plank, 2.0)) * 20.0, P.y * 2.4)) * (0.95 + hash(vec2(plank, 5.0)) * 0.08);
            col *= mix(0.9, 1.0, smoothstep(0.0, 0.025, abs(fract(P.y / 0.42) - 0.5) - 0.47 + 0.025));     // fine plank joints
            al = 1.0 - smoothstep(0.62, 1.0, alm);   // solid round the iris, fading into the oak toward the edge
          }
          // stringing: thin dark inlay lines round the lift, between iris and limbus, and round the white
          float s1 = abs(r - (uR + 0.06)), s2 = abs(r - rIris), s3 = abs(r - rLimb);
          float str = 1.0 - smoothstep(0.012, 0.03, min(min(s1, s2), s3));
          col = mix(col, vec3(0.05, 0.04, 0.04), str * 0.9);
          col *= 0.86;   // satin, not glossy: sits in with the oak's lighting
          gl_FragColor = vec4(col, al);
          #include <fog_fragment>
        }` });
    const inlay = new THREE.Mesh(new THREE.PlaneGeometry(2 * EH + 0.4, 2 * EL + 0.4), mat);
    inlay.rotation.x = -Math.PI / 2; inlay.position.set(L.x, L.y0 + 0.008, L.z); inlay.renderOrder = 2; g.add(inlay);
  }
  g.updateMatrixWorld(true);

  // ---- motion. Two platforms share the shaft:
  //  · from floor 1: the floor 1 lift rises to the ring; the floor 2 lift (resting in the pupil) first lifts CLR metres up out
  //    of the way, and settles back into the pupil as the floor 1 lift goes home.
  //  · from floor 2: the floor 2 lift sinks through the pupil and sets down right on top of the floor 1 lift, then goes back up.
  //  Each returns home on its own a few seconds after its rider steps off.
  const CLR = 3.0, TH = 0.14, WAIT = 2.5, ON = (P, v) => Math.abs(P.y - v) < 0.02 && Math.abs(P.target - v) < 0.02;
  const moving = P => Math.abs(P.y - P.target) > 0.01;
  const atTop = P => ON(P, L.y1), loDown = () => ON(LO, L.y0), upDown = () => ON(UP, L.y0 + TH);
  let rider = null;
  const step = (P, dt) => { if (!moving(P)) return; const d = P.target - P.y, sp = Math.min(4.2, 0.6 + Math.abs(d) * 1.6) * Math.sign(d); P.y += Math.abs(sp * dt) > Math.abs(d) ? d : sp * dt; };
  const pickRider = Pl => { if (Math.hypot(Pl.x - L.x, Pl.z - L.z) > L.r - 0.15) return null; let best = null; for (const P of [LO, UP]) if (Pl.y > P.y - 0.35 && Pl.y < P.y + 1.0 && (!best || P.y > best.y)) best = P; return best; };
  function tick(dt, Pl) {
    const was = LO.y + UP.y * 7;
    step(LO, dt); step(UP, dt);
    if (UP.y < LO.y + TH) UP.y = LO.y + TH;   // the floor 2 lift always stays above the floor 1 lift
    LO.g.position.y = LO.y; UP.g.position.y = UP.y; LO.g.updateMatrixWorld(); UP.g.updateMatrixWorld();
    rider = pickRider(Pl);
    // going home: a few seconds after the rider steps off
    if (atTop(LO) && rider !== LO) { if ((LO.idle += dt) > WAIT) LO.target = L.y0; } else LO.idle = 0;
    if (upDown() && rider !== UP) { if ((UP.idle += dt) > WAIT) UP.target = L.y1; } else UP.idle = 0;
    // the floor 2 lift, parked up out of the way, settles back into the pupil once the floor 1 lift has gone
    if (Math.abs(UP.target - (L.y1 + CLR)) < 0.01 && LO.target === L.y0 && LO.y < L.y1 - 0.5) UP.target = L.y1;
    const topped = atTop(LO) || atTop(UP);
    gate.visible = gateBar.visible = !topped;
    if (rider) { Pl.y = rider.y; Pl.vy = 0; Pl.ground = true; }   // stand on the platform wherever it is
    // the pupil: with no lift in it, the gate holds you back from the hole
    else if (Pl.y > L.y1 - 0.6 && Pl.y < L.y1 + 2 && !topped) {
      const dx = Pl.x - L.x, dz = Pl.z - L.z, d = Math.hypot(dx, dz), lim = L.ringIn + 0.45;
      if (d < lim) { const k = lim / Math.max(d, 1e-3); Pl.x = L.x + dx * k; Pl.z = L.z + dz * k; }
    }
    return was !== LO.y + UP.y * 7;
  }
  // what the visitor can do here
  function near(Pl) {
    const dh = Math.hypot(Pl.x - L.x, Pl.z - L.z), wait = { kind: 'elevator', item: null, label: 'One moment…', busy: true };
    if (rider) {
      if (moving(rider)) return { kind: 'elevator', item: null, label: rider.target > rider.y ? 'Going up to floor 2…' : 'Going down to floor 1…', busy: true };
      if (rider === LO) return { kind: 'elevator', item: 'go', label: loDown() ? 'Take the elevator to floor 2' : 'Take the elevator down' };
      if (upDown()) return { kind: 'elevator', item: 'go', label: 'Take the elevator up to floor 2' };
      if (atTop(UP) && loDown()) return { kind: 'elevator', item: 'go', label: 'Take the elevator down to floor 1' };
      return wait;
    }
    if (Math.abs(Pl.y - L.y0) < 1.5 && dh < L.r + 2.2 && !loDown() && !upDown() && !moving(LO)) return { kind: 'elevator', item: 'call1', label: 'Call the elevator' };
    if (Math.abs(Pl.y - L.y1) < 1.5 && dh < L.ringIn + 2.0 && upDown() && loDown()) return { kind: 'elevator', item: 'call2', label: 'Call the elevator up' };
    return null;
  }
  function act(n) {
    if (!n || n.busy) return;
    if (n.item === 'call1') { LO.target = L.y0; return; }
    if (n.item === 'call2') { UP.target = L.y1; return; }
    if (rider === LO) { if (loDown()) { LO.target = L.y1; UP.target = L.y1 + CLR; } else LO.target = L.y0; }
    else if (rider === UP) { if (upDown()) UP.target = L.y1; else if (atTop(UP) && loDown()) UP.target = L.y0 + TH; }
  }
  return { group: g, col, tick, near, act, state: { LO, UP }, moving: () => !!rider && moving(rider), riding: () => !!rider };
}
