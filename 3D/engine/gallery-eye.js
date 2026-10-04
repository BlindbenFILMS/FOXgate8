// Blind Canvas gallery: the eye facade and the name sign.
// The museum's front is an eye you walk into. The bridge enters through the pupil (the teal tunnel); around it:
//  • the iris: a ring of slim teal metal fins angled like a camera aperture, with a dark limbal ring;
//  • the white of the eye: lightly frosted, see-through glass filling everything out to the white frame,
//    with a ceramic frit (dots, denser towards the edges, as real facades do), thin steel mullions and faint veins;
//  • a catch-light glint, so it reads as an eye from across the lake.
// And the name: BLIND CANVAS PROJECT on a sign held up on two posts in the water in front of the museum.
import * as THREE from '../vendor/three/three.module.js';

// the opening, measured from the building (distance from the pupil centre every 7.5°, 0° = +z, 90° = up)
const C = { x: -28.4, y: 3.9, z: 0.1 };
const OUTLINE = [16.53, 18.1, 19.98, 21.06, 17.32, 14.23, 12.25, 10.92, 10, 9.38, 8.97, 8.74, 8.66, 8.74, 8.97, 9.38, 10, 10.92, 12.25, 14.23, 17.32, 18.89, 18.87, 18.33,
  16.74, 15.47, 12.86, 11.17, 9.43, 8.26, 7.47, 6.92, 8.04, 7.88, 7.54, 7.35, 7.28, 7.35, 7.54, 7.88, 8, 6.87, 7.42, 8.21, 9.37, 11.05, 12.72, 15.31];
const PUPIL = 4.75, IRIS = 6.55;

const GLASS_VS = `
  varying vec2 vP; varying vec3 vW;
  #include <fog_pars_vertex>
  void main() { vP = position.xy; vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`;
// the white of the eye as STAINED GLASS: rings of curved panels in lead came, deep cobalt and teal blues round the iris,
// light half-clear blues further out, opal and near-white panels toward the frame (a few pale gold), each with streaks and seeds;
// where the uplights from the lake strike it, the glass glows
const GLASS_FS = `
  uniform float uNight; uniform float uT; uniform vec3 uHit[4]; uniform float uLit; varying vec2 vP; varying vec3 vW;
  #include <fog_pars_fragment>
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  void main() {
    float r = length(vP), a = atan(vP.y, vP.x);
    // rings of panels; the leading waves a little so it reads hand-made
    float rw = r + 0.22 * sin(a * 7.0) + 0.12 * sin(a * 13.0 + r);
    float bandW = 1.45, kf = (rw - ${PUPIL.toFixed(2)}) / bandW, k = floor(kf), fr = fract(kf);
    float n = 9.0 + k * 5.0, af = (a / 6.2831853 + 0.5) * n + hash(vec2(k, 3.1)) + k * 0.37, seg = floor(af), fa = fract(af);
    vec2 id = vec2(k, mod(seg, n));
    float h = hash(id), h2 = hash(id + 17.3);
    // some panels split on a diagonal
    float split = step(0.55, h2), side = step(fa, fr);
    if (split > 0.5) { id += side * 41.0; h = hash(id); }
    float dR = min(fr, 1.0 - fr) * bandW, dA = min(fa, 1.0 - fa) * 6.2831853 / n * r, dD = split > 0.5 ? abs(fa - fr) * 0.7 * bandW : 9.0;
    float dl = min(min(dR, dA), dD);
    float lead = 1.0 - smoothstep(0.045, 0.085, dl);
    // colour by distance out from the iris
    float t = clamp((r - ${IRIS.toFixed(2)}) / 10.0, 0.0, 1.0);
    vec3 col; float alpha;
    if (r < ${(IRIS + 2.3).toFixed(2)}) {            // deep blues round the iris
      col = h < 0.4 ? vec3(0.07, 0.19, 0.62) : h < 0.7 ? vec3(0.10, 0.11, 0.48) : h < 0.9 ? vec3(0.04, 0.42, 0.58) : vec3(0.20, 0.34, 0.78);
      alpha = 0.66 + h2 * 0.1;
    } else {
      float pWhite = 0.18 + t * 0.5;
      if (h > 0.965) { col = vec3(0.98, 0.86, 0.55); alpha = 0.6; }                         // a rare pale gold
      else if (h < pWhite * 0.55) { col = vec3(0.97, 0.98, 1.0); alpha = 0.84; }              // opal, almost white
      else if (h < pWhite) { col = vec3(0.88, 0.93, 0.97); alpha = 0.58; }                     // frosted pale
      else if (h < pWhite + (1.0 - pWhite) * 0.6) { col = vec3(0.60, 0.80, 0.96); alpha = 0.38 + h2 * 0.12; }   // light blue, half clear
      else { col = vec3(0.32, 0.56, 0.88); alpha = 0.5; }                                      // a mid blue now and then
    }
    // inside each panel: streaks (cathedral glass), seeds, thicker toward the leading
    vec2 dir = vec2(cos(h * 6.28), sin(h * 6.28));
    float streak = noise(vec2(dot(vP, dir) * 3.0, dot(vP, vec2(-dir.y, dir.x)) * 0.4 + h * 20.0));
    col *= 0.9 + streak * 0.18;
    float seed = step(0.985, hash(floor(vP * 18.0))) * 0.12; col += seed;
    col *= mix(0.82, 1.0, smoothstep(0.0, 0.35, dl));
    // light from the uplights in the lake
    float lit = 0.0; for (int i = 0; i < 4; i++) { vec2 d = vP - uHit[i].xy; lit += exp(-dot(d, d) / (uHit[i].z * uHit[i].z)); }
    lit *= uLit;
    col += col * lit * 0.9 + vec3(0.25, 0.35, 0.45) * lit * 0.35; alpha = min(0.95, alpha + lit * 0.12);
    // lead came
    col = mix(col, vec3(0.15, 0.17, 0.2), lead); alpha = mix(alpha, 0.96, lead);
    vec3 Vd = normalize(cameraPosition - vW); alpha += (1.0 - abs(Vd.x)) * 0.1;
    // at night the hall behind lights the glass: every panel glows its own colour
    col = mix(col, col * 0.55 + col * col * 0.9 + vec3(0.06, 0.05, 0.03), uNight * (1.0 - lead));
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.96));
    #include <fog_fragment>
  }`;

function polar(i) { const a = (i / OUTLINE.length) * Math.PI * 2; return a; }

export function buildEye({ scene, lowEnd }) {
  const out = { mats: [] };
  // ------------------------------------------------ the frosted glass: the white of the eye
  {
    // smoothed outline, pushed a little past the frame so no gap shows
    const n = OUTLINE.length, sm = OUTLINE.map((v, i) => (OUTLINE[(i - 1 + n) % n] + v * 2 + OUTLINE[(i + 1) % n]) / 4 + 0.25);
    const shape = new THREE.Shape();
    const SUB = 3;   // smooth curve through the samples
    const pts = [];
    for (let i = 0; i < n * SUB; i++) {
      const t = i / SUB, i0 = Math.floor(t), f = t - i0, r = sm[i0 % n] * (1 - f) + sm[(i0 + 1) % n] * f, a = (t / n) * Math.PI * 2;
      pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));   // shape x = world z, shape y = world y
    }
    shape.setFromPoints(pts);
    const hole = new THREE.Path(); hole.absarc(0, 0, PUPIL, 0, Math.PI * 2, true); shape.holes.push(hole);
    const geo = new THREE.ShapeGeometry(shape, 48);
    const mat = new THREE.ShaderMaterial({ vertexShader: GLASS_VS, fragmentShader: GLASS_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true,
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uNight: { value: 0 }, uT: { value: 0 }, uLit: { value: 0.5 }, uHit: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] } }]) });
    const glass = new THREE.Mesh(geo, mat);
    glass.position.set(C.x, C.y, C.z); glass.rotation.y = Math.PI / 2;   // shape x -> world -z... flip below so +x(shape) = +z(world)
    glass.scale.x = -1; glass.renderOrder = 5; scene.add(glass);
    out.mats.push(mat); out.glass = glass;
  }
  // ------------------------------------------------ the iris: angled teal fins, like an aperture
  {
    const N = lowEnd ? 28 : 40, len = IRIS - PUPIL - 0.05;
    const geo = new THREE.BoxGeometry(0.07, len, 0.62); geo.translate(0, PUPIL + 0.05 + len / 2, 0);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const im = new THREE.InstancedMesh(geo, mat, N), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), col = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), a);                                 // round the pupil (in the y-z plane)
      q2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.62); q.multiply(q2);              // each blade turned, so light slips between them
      m4.compose(new THREE.Vector3(C.x + 0.18, C.y, C.z), q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, m4);
      im.setColorAt(i, col.setHSL(0.49 + (i % 3) * 0.008, 0.62, 0.36 + ((i * 7) % 5) * 0.025));
    }
    scene.add(im);
    // the limbal ring (a dark band where iris meets white) and a slim steel collar round the pupil
    const ring = (r, tube, color) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 96), new THREE.MeshLambertMaterial({ color })); m.position.set(C.x + 0.12, C.y, C.z); m.rotation.y = Math.PI / 2; scene.add(m); return m; };
    ring(IRIS + 0.06, 0.16, 0x183c45);
    ring(PUPIL + 0.02, 0.09, 0x1d1c1b);
  }
  // ------------------------------------------------ the catch-light: a soft glint high on the iris
  {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 160; const c = cv.getContext('2d');
    const gr = c.createRadialGradient(128, 80, 4, 128, 80, 120); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    c.setTransform(1, 0, 0, 0.62, 0, 30); c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(cv);
    const glint = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.3), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 }));
    glint.position.set(C.x + 0.3, C.y + 4.25, C.z - 3.3); glint.rotation.y = Math.PI / 2; glint.rotation.x = -0.35; glint.renderOrder = 6; scene.add(glint);
    out.glint = glint;
  }
  // ------------------------------------------------ the eyelid: a slim charcoal canopy over the top of the eye (it also tidies the roof beams' cut ends)
  {
    const n = OUTLINE.length, shape = new THREE.Shape(), inner = [], outer = [];
    const A0 = 12 * Math.PI / 180, A1 = 168 * Math.PI / 180, STEPS = 64;
    const rAt = a => { const t = ((a / (Math.PI * 2)) * n + n) % n, i0 = Math.floor(t), f = t - i0; return OUTLINE[i0 % n] * (1 - f) + OUTLINE[(i0 + 1) % n] * f; };
    for (let i = 0; i <= STEPS; i++) { const a = A0 + (A1 - A0) * i / STEPS, r = rAt(a), lift = Math.sin((i / STEPS) * Math.PI); inner.push([a, r + 1.3]); outer.push([a, r + 1.3 + 1.2 + 4.6 * lift]); }
    shape.moveTo(Math.cos(inner[0][0]) * inner[0][1], Math.sin(inner[0][0]) * inner[0][1]);
    for (const [a, r] of inner) shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    for (const [a, r] of outer.reverse()) shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false, curveSegments: 4 });
    const lid = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0x2b2a29 }));
    lid.position.set(-22.1, C.y, C.z); lid.rotation.y = Math.PI / 2; lid.scale.x = -1; scene.add(lid);
    // a thin red line along its lower edge (the house accent)
    const pts = inner.map(([a, r]) => new THREE.Vector3(-21.58, C.y + Math.sin(a) * (r + 0.06), C.z + Math.cos(a) * (r + 0.06)));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, 0.07, 6, false), new THREE.MeshBasicMaterial({ color: 0xec3013 })); scene.add(tube);
  }
  // ------------------------------------------------ uplights in the lake: four lamps in the water throw angled beams up at the glass,
  // and mist drifting up off the water catches the light as it passes through them
  {
    const WY = -1.6, beamV = `varying vec3 vN; varying vec3 vW; varying float vY; uniform float uL;
      void main() { vY = position.y / uL; vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`;
    const beamF = `varying vec3 vN; varying vec3 vW; varying float vY; uniform float uI;
      void main() { float f = abs(dot(normalize(vN), normalize(cameraPosition - vW))); float k = pow(f, 2.2) * pow(1.0 - vY, 0.8) * smoothstep(0.0, 0.08, vY) * uI;
        gl_FragColor = vec4(vec3(0.72, 0.88, 1.0) * k, 1.0); }`;
    // the lake only reaches the facade in two pockets either side of the bridge (z 4..10): two lamps in each
    const lamps = [[-19.0, -8.8, -9.6, 8.2], [-21.0, -5.6, -4.6, 11.4], [-21.0, 5.6, 4.8, 11.4], [-19.0, 8.8, 9.8, 8.2]];   // [lamp x, lamp z, target z, target height above the pupil]
    out.beams = []; out.hits = [];
    const lampM = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), lensM = new THREE.MeshBasicMaterial({ color: 0xe6f6ff });
    for (const [lx, lz, tz, ty] of lamps) {
      const S = new THREE.Vector3(lx, WY + 0.15, lz), T = new THREE.Vector3(C.x + 0.1, C.y + ty, tz), d = T.clone().sub(S), L = d.length(); d.normalize();
      const geo = new THREE.CylinderGeometry(2.4, 0.28, L, 28, 1, true); geo.translate(0, L / 2, 0);
      const mat = new THREE.ShaderMaterial({ vertexShader: beamV, fragmentShader: beamF, uniforms: { uL: { value: L }, uI: { value: 0.4 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const beam = new THREE.Mesh(geo, mat); beam.position.copy(S); beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); beam.renderOrder = 7; scene.add(beam);
      const lamp = new THREE.Group(); lamp.position.copy(S); lamp.quaternion.copy(beam.quaternion); scene.add(lamp);
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.5, 18), lampM); can.position.y = -0.1; lamp.add(can);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.3, 18), lensM); lens.rotation.x = -Math.PI / 2; lens.position.y = 0.16; lamp.add(lens);
      out.beams.push({ mat, S, d, L, r0: 0.28, r1: 2.4 }); out.hits.push(new THREE.Vector3(tz - C.z, ty, 3.6));
    }
    out.mats[0].uniforms.uHit.value.forEach((v, i) => v.copy(out.hits[i]));
    // mist: soft puffs rising off the water in front of the facade (not over the bridge)
    const N = lowEnd ? 70 : 150, pos = new Float32Array(N * 3), colr = new Float32Array(N * 3), P = [];
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); const gr = c.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
    const spawn = (p, fresh) => { const z = (Math.random() < 0.5 ? -1 : 1) * (4.2 + Math.random() * 5.6); p.x = -22.5 + Math.random() * 8.0; p.z = z; p.y = WY + (fresh ? Math.random() * 3.2 : Math.random() * 0.3); p.life = fresh ? Math.random() : 0; p.sp = 0.12 + Math.random() * 0.14; p.dx = (Math.random() - 0.5) * 0.12; };
    for (let i = 0; i < N; i++) { const p = {}; spawn(p, true); P.push(p); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
    const mist = new THREE.Points(geo, new THREE.PointsMaterial({ size: lowEnd ? 3.6 : 3.0, map: new THREE.CanvasTexture(cv), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: true }));
    mist.frustumCulled = false; mist.renderOrder = 8; scene.add(mist);
    const tmp = new THREE.Vector3(), q = new THREE.Vector3();
    out.mist = { tick(dt, light) {
      for (let i = 0; i < N; i++) {
        const p = P[i]; p.life += dt / 9; p.y += p.sp * dt; p.x += p.dx * dt; if (p.life >= 1 || p.y > WY + 3.6) spawn(p, false);
        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
        let k = 0; q.set(p.x, p.y, p.z);
        for (const b of out.beams) { tmp.copy(q).sub(b.S); const s = Math.max(0, Math.min(1, tmp.dot(b.d) / b.L)); tmp.copy(b.S).addScaledVector(b.d, s * b.L); const rr = b.r0 + (b.r1 - b.r0) * s; k += Math.exp(-q.distanceToSquared(tmp) / (rr * rr)) * (1 - s * 0.5); }
        const fade = Math.sin(Math.PI * Math.min(1, p.life)) * Math.min(1, (p.y - WY) / 0.6 + 0.2), v = (0.05 + 0.75 * k * light) * fade;
        colr[i * 3] = v * 0.82; colr[i * 3 + 1] = v * 0.93; colr[i * 3 + 2] = v;
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    } };
  }
  // ------------------------------------------------ the name sign, up on two posts in the water in front of the museum
  {
    const SW = 22, SH = 3.0, X = 21, Y0 = 4.4;
    const cv = document.createElement('canvas'); cv.width = 2048; cv.height = Math.round(2048 * SH / SW); const c = cv.getContext('2d');
    const draw = () => {
      c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, cv.width, cv.height); c.fillStyle = '#ec3013'; c.fillRect(0, cv.height - 18, cv.width, 18);
      c.fillStyle = '#ffffff'; c.textBaseline = 'middle'; c.textAlign = 'center';
      let fs = 200; c.font = `800 ${fs}px Archivo, Arimo, Helvetica, Arial, sans-serif`;
      while (c.measureText('BLIND CANVAS PROJECT').width > cv.width * 0.9) { fs -= 4; c.font = `800 ${fs}px Archivo, Arimo, Helvetica, Arial, sans-serif`; }
      c.fillText('BLIND CANVAS PROJECT', cv.width / 2, cv.height / 2 - 6);
      t.needsUpdate = true;
    };
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; draw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), steel = new THREE.MeshLambertMaterial({ color: 0xd9d9d6 });
    const g = new THREE.Group(); g.position.set(X, 0, 0); scene.add(g);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.4, SH + 0.2, SW + 0.2), ink); box.position.set(0, Y0 + SH / 2, 0); g.add(box);
    for (const s of [1, -1]) {   // readable from the lake and from the plaza
      const face = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: t, fog: true }));
      face.position.set(0.21 * s, Y0 + SH / 2, 0); face.rotation.y = s * Math.PI / 2; g.add(face);
    }
    for (const z of [-SW * 0.32, SW * 0.32]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, Y0, 14), steel); post.position.set(0, Y0 / 2, z); g.add(post);   // standing in the cherry garden; the walk passes under the sign
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.3, 20), new THREE.MeshLambertMaterial({ color: 0xd8d2c8 })); foot.position.set(0, 0.15, z); g.add(foot);
    }
    out.sign = g;
  }
  let lastT = null;
  return { update(t, night) {
    const dt = lastT == null ? 0 : Math.min(0.1, Math.max(0, t - lastT)); lastT = t;
    const light = 0.45 + 0.55 * night;   // the uplights read faintly by day, strongly at night
    for (const m of out.mats) { m.uniforms.uT.value = t; m.uniforms.uNight.value = night; m.uniforms.uLit.value = light * 0.8; }
    if (out.beams) for (const b of out.beams) b.mat.uniforms.uI.value = 0.38 + 0.7 * night;
    if (out.mist) out.mist.tick(dt, light);
    if (out.glint) out.glint.material.opacity = 0.8 - night * 0.45; }, ...out };
}
