// The look every world shares: renderer, toon materials + ink outlines, glow helpers, sky dome + stars.
// Lifted from meru-game.js unchanged. Usage:
//   const K = createWorldKit({ container, opts });   // opts: { quality: 'high'|'low', outlines }
//   const { renderer, scene, camera, toon, M, BOX, glowing, glowSprite, sun, hemi, skyU, starMat } = K;
// Each frame the world sets sky/sun from paletteAt(hour) (see meru-game.js update()).
import * as THREE from '../vendor/three/three.module.js';
import { rnd, rr, makeGradient, glowTexture, dotTexture } from '../village-game.js';

export function createWorldKit({ container, opts }) {
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, opts.quality === 'low' ? 1 : 2)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = opts.quality !== 'low'; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 1200);
  scene.fog = new THREE.FogExp2(0xcfe4f0, 0.006);
  const grad = makeGradient(), glowTex = glowTexture(), dotTex = dotTexture();
  const cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide }); outlineMat.visible = !!opts.outlines;
  function addOutline(mesh, t = 0.04, radius) {
    const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s);
    const o = new THREE.Mesh(g, outlineMat);
    if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01));
    mesh.add(o); return mesh;
  }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m;
  }
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const glowMats = []; // {mat, k}
  const glowing = (color, map, k = 1.6) => { const m = new THREE.MeshToonMaterial({ color: map ? 0xffffff : color, map, gradientMap: grad, emissive: new THREE.Color(map ? 0xffffff : color), emissiveMap: map || null, emissiveIntensity: 0 }); glowMats.push({ m, k }); return m; };
  const flames = [], glows = [], pointLights = [];
  function glowSprite(x, y, z, color, size, parent) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 })); s.position.set(x, y, z); s.scale.setScalar(size); (parent || scene).add(s); glows.push(s); return s; }

  // lights + sky
  const hemi = new THREE.HemisphereLight(0xd6ecff, 0x6f9a52, 1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 260 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bottom: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, moonDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunVis: { value: 1 }, moonVis: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vDir; uniform vec3 top, hor, bottom, sunDir, moonDir, sunCol; uniform float sunVis, moonVis;
      void main(){ vec3 d = normalize(vDir); float y = d.y; vec3 col = mix(hor, top, pow(smoothstep(0.0, 1.0, max(y, 0.0)), 0.55)); col = mix(col, bottom, smoothstep(0.0, -0.2, y));
        float sd = max(dot(d, sunDir), 0.0); col += sunCol * (pow(sd, 48.0) * 0.55 + pow(sd, 6.0) * 0.22) * sunVis; col = mix(col, vec3(1.0, 0.97, 0.88), smoothstep(0.9990, 0.9994, sd) * sunVis);
        float md = max(dot(d, moonDir), 0.0); col = mix(col, vec3(0.93, 0.95, 1.0), smoothstep(0.9993, 0.9996, md) * moonVis); col += vec3(0.45, 0.55, 1.0) * pow(md, 120.0) * 0.35 * moonVis;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }` }));
  scene.add(sky);
  const sp = []; for (let i = 0; i < 1000; i++) { const u = rnd() * 6.283, v = Math.acos(rr(0.05, 1)); sp.push(Math.sin(v) * Math.cos(u) * 450, Math.cos(v) * 450, Math.sin(v) * Math.sin(u) * 450); }
  const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const stars = new THREE.Points(starGeo, starMat); scene.add(stars);
  return { W, H, renderer, scene, camera, grad, glowTex, dotTex, cache, toon, outlineMat, addOutline, M, BOX, glowMats, glowing, flames, glows, pointLights, glowSprite, hemi, sun, skyU, sky, starMat, stars };
}

// Phone budget: call once after building. Small meshes stop casting shadows on 'low'.
export function phoneBudget(scene, opts, minSize = 1.2) {
  if (opts.quality !== 'low') return;
  const s = new THREE.Vector3();
  scene.traverse(o => { if (!o.isMesh || !o.castShadow) return; const gm = o.geometry; if (!gm.boundingBox) gm.computeBoundingBox(); gm.boundingBox.getSize(s); if (Math.max(s.x, s.y, s.z) < minSize) o.castShadow = false; });
}
