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
const GLASS_FS = `
  uniform float uNight; uniform float uT; varying vec2 vP; varying vec3 vW;
  #include <fog_pars_fragment>
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
  void main() {
    float r = length(vP), a = atan(vP.y, vP.x);
    float edge = clamp((r - ${IRIS.toFixed(2)}) / 9.0, 0.0, 1.0);   // 0 at the iris, 1 out at the frame
    // frit: a hex grid of small ceramic dots, bigger towards the frame
    vec2 g = vP * 3.2; g.x += step(1.0, mod(floor(g.y), 2.0)) * 0.5;
    float d = length(fract(g) - 0.5), dotR = mix(0.12, 0.34, smoothstep(0.15, 1.0, edge));
    float frit = 1.0 - smoothstep(dotR - 0.04, dotR, d);
    // steel mullions: radial every 30 degrees, and two rings
    float ang = abs(fract(a / 0.5236 + 0.5) - 0.5) * 0.5236 * r;
    float mull = 1.0 - smoothstep(0.03, 0.07, ang);
    mull = max(mull, 1.0 - smoothstep(0.03, 0.07, abs(r - 9.4)));
    mull = max(mull, 1.0 - smoothstep(0.03, 0.08, abs(r - ${(IRIS + 0.12).toFixed(2)})));
    // faint veins drifting in from the edge (very subtle: it should read as glass first)
    float v = abs(noise(vec2(a * 6.0, r * 0.35)) - 0.5);
    float vein = (1.0 - smoothstep(0.0, 0.025, v)) * smoothstep(0.35, 1.0, edge) * 0.55;
    // limbus: the white is a touch shadowed right next to the iris
    float limb = 1.0 - smoothstep(0.0, 0.18, edge);
    vec3 white = mix(vec3(0.95, 0.96, 0.97), vec3(0.78, 0.82, 0.88), limb * 0.6);
    vec3 col = mix(white, vec3(0.86, 0.36, 0.38), vein);
    col = mix(col, vec3(1.0), frit * 0.55);
    col = mix(col, vec3(0.93, 0.93, 0.92), mull);
    float alpha = 0.34 + frit * 0.3 + vein * 0.25 + mull * 0.6 + limb * 0.12;
    vec3 Vd = normalize(cameraPosition - vW); alpha += (1.0 - abs(Vd.x)) * 0.15;   // seen at a slant, glass looks more solid
    col *= mix(1.0, 0.42, uNight); col += uNight * vec3(0.32, 0.27, 0.18) * (frit * 0.6 + 0.2);   // at night: lit from inside, warm
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.92));
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
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uNight: { value: 0 }, uT: { value: 0 } }]) });
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
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, Y0 + 3.0, 14), steel); post.position.set(0, (Y0 - 3.0) / 2, z); g.add(post);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.8, 20), new THREE.MeshLambertMaterial({ color: 0xd8d2c8 })); foot.position.set(0, -2.75, z); g.add(foot);
    }
    out.sign = g;
  }
  return { update(t, night) { for (const m of out.mats) { m.uniforms.uT.value = t; m.uniforms.uNight.value = night; } if (out.glint) out.glint.material.opacity = 0.8 - night * 0.45; }, ...out };
}
