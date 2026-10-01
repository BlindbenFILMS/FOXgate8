import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { rnd, rr, pick, clamp, smooth, lerp, damp, makeGradient, glowTexture, dotTexture, Ambience } from './village-game.js';
import { emblemTex, crestTex, bannerTex, canvasTex, FONT } from './meru-game.js';
import { foxKit, PLAYER_MALE, KING_MIGHT } from './fox-kit.js';

// The tournament, as written in surface_meru.html: King Might briefs you, then
// wave 1 is four drones for the laser and wave 3 is four shielded robots for the
// sword. (Wave 2, the staff and the rock golems, is left out of this test.)
const KING = 'King Might';
const SCRIPT = {
  intro: [{ who: 'player', text: 'KING MIGHT \u2014 I must tell you something important!' }, { who: 'npc', text: 'First you must compete!.. You have THREE challenges.' }, { who: 'npc', text: 'The first is the lasergun. How fast can you defeat these drones?' }],
  toSword: [{ who: 'npc', text: 'You are setting records today, Fox Soldier. NEXT \u2014 swing your sword to cement your place in history.' }],
  finish: [{ who: 'npc', text: 'You have proven yourself. Better than any other FOX at this tournament.' }, { who: 'npc', text: 'Though if my son Max had competed today... I think you would have had real competition.' }, { who: 'npc', text: 'BUT \u2014 you are the clear victor here today.' }, { who: 'player', text: 'MY KING, I have to tell you something important!' }, { who: 'npc', text: 'IT can wait until tonight... We celebrate YOU at my birthday party. A place of honour beside me, in the throne room.' }, { who: 'npc', text: 'We will present you your prize tonight.' }, { who: 'player', text: 'I am honoured, my King.' }],
};
SCRIPT.toBoss = [{ who: 'npc', text: 'Splendid! But a champion of Meru must face the WARDEN.' }, { who: 'npc', text: 'Jump its shockwaves, and strike when it crashes into the wall.' }];
const TIPS = { boss: ['THE IRON WARDEN', 'JUMP THE SHOCKWAVES — HIT IT WHEN IT IS STUNNED'], laser: ['TAP TARGETS TO FIRE', 'THE LASER IS ALREADY IN YOUR HAND'], sword: ['ALL WEAPONS FREE', 'BLADE CUTS DEEPEST \u2014 THEY BLOCK WHAT THEY SEE COMING'] };
const RING = 15.5;            // sand radius
const DMG = { RAYGUN: 15, SWORD: 25 };
const COST = { RAYGUN: 5, SWORD: 0 };

export async function createArena({ container, options = {}, onState = () => {}, onNavigate = () => {} }) {
  const opts = { quality: 'high', outlines: true, followCam: true, ...options };
  try { await document.fonts.load('900 40px Archivo'); } catch (e) {}
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, opts.quality === 'low' ? 1 : 2)); renderer.setSize(W(), H());
  renderer.shadowMap.enabled = opts.quality !== 'low'; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(58, W() / H(), 0.1, 900);
  scene.fog = new THREE.FogExp2(0x1b1f45, 0.008);
  const grad = makeGradient(), glowTex = glowTexture(), dotTex = dotTexture();
  const cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x14111f, side: THREE.BackSide }); outlineMat.visible = !!opts.outlines;
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const { makeFox, animFox } = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const glowSprite = (x, y, z, color, size, op = 0.8, parent) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op })); s.position.set(x, y, z); s.scale.setScalar(size); (parent || scene).add(s); return s; };

  // ---------- light + sky (fixed twilight, like the 2D arena) ----------
  scene.add(new THREE.HemisphereLight(0x8a90d8, 0x2a2440, 0.95));
  const moon = new THREE.DirectionalLight(0xc8d0ff, 1.15); moon.position.set(-30, 60, 25); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 160 }); moon.shadow.bias = -0.0004; moon.shadow.normalBias = 0.04; scene.add(moon);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `varying vec3 vD; void main(){ float y = max(vD.y, 0.0); vec3 c = mix(vec3(0.42,0.24,0.40), vec3(0.06,0.07,0.2), pow(y, 0.5)); c = mix(c, vec3(0.1,0.1,0.25), smoothstep(0.0, -0.2, vD.y)); gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }` })); scene.add(sky);
  { const sp = []; for (let i = 0; i < 900; i++) { const u = rnd() * 6.283, v = Math.acos(rr(0.15, 1)); sp.push(Math.sin(v) * Math.cos(u) * 400, Math.cos(v) * 400, Math.sin(v) * Math.sin(u) * 400); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }))); }

  // ---------- the arena ----------
  const sandT = canvasTex(1024, 1024, (g) => {
    g.fillStyle = '#c9c6dd'; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 4000; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(60,50,110,0.07)'; g.fillRect(rnd() * 1024, rnd() * 1024, 3, 3); }
    g.strokeStyle = 'rgba(70,60,120,0.18)'; g.lineWidth = 4; g.setLineDash([18, 14]); for (const r of [180, 330]) { g.beginPath(); g.arc(512, 512, r, 0, 7); g.stroke(); }
    g.setLineDash([]); g.fillStyle = 'rgba(80,70,130,0.10)'; for (const [x, y, r] of [[340, 330, 70], [700, 640, 90], [610, 330, 50], [380, 700, 60]]) { g.beginPath(); g.ellipse(x, y, r, r * 0.55, 0.3, 0, 7); g.fill(); }
  });
  const sand = new THREE.Mesh(new THREE.CircleGeometry(RING + 0.6, 96), new THREE.MeshToonMaterial({ map: sandT, gradientMap: grad })); sand.rotation.x = -Math.PI / 2; sand.receiveShadow = true; scene.add(sand);
  const emb = emblemTex(); const med = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), new THREE.MeshToonMaterial({ map: emb, gradientMap: grad, transparent: true })); med.rotation.x = -Math.PI / 2; med.position.y = 0.02; scene.add(med);
  const lathe = (pts, mat, segs = 96) => { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), segs), mat); m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
  lathe([[RING + 0.6, 0], [RING + 1.1, 0], [RING + 1.1, 1.3], [RING + 0.6, 1.3], [RING + 0.6, 0]], toon('#2a2f55'));
  lathe([[RING + 0.55, 1.3], [RING + 1.15, 1.3], [RING + 1.15, 1.42], [RING + 0.55, 1.42]], toon('#c42d3c', { emissive: new THREE.Color('#c42d3c'), emissiveIntensity: 0.35 }));
  const TIERS = 7, T0 = RING + 1.4, TW = 1.5, TH = 0.85, tierPts = [[T0, 0]];
  for (let i = 0; i < TIERS; i++) { tierPts.push([T0 + i * TW, 1.4 + i * TH], [T0 + (i + 1) * TW, 1.4 + i * TH]); }
  tierPts.push([T0 + TIERS * TW, 0]); lathe(tierPts, toon('#2d3360'));
  for (let i = 0; i < TIERS; i++) lathe([[T0 + i * TW - 0.02, 1.4 + i * TH + 0.01], [T0 + i * TW + 0.16, 1.4 + i * TH + 0.01]], toon('#4b5390'));
  // outer square wall + towers
  const WALL = T0 + TIERS * TW + 1.5, stone = toon('#3b3f52'), stoneD = toon('#2a2d3c');
  for (const [x, z, w, d] of [[0, -WALL, WALL * 2, 1.6], [0, WALL, WALL * 2, 1.6], [-WALL, 0, 1.6, WALL * 2], [WALL, 0, 1.6, WALL * 2]]) M(BOX(w, 10, d), stone, x, 5, z, null, 0.05);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { M(BOX(5, 13, 5), stoneD, sx * WALL, 6.5, sz * WALL, null, 0.06); M(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 16), toon('#4b5390'), sx * WALL, 13.15, sz * WALL, null, 0.03, 0.9); }
  for (let i = -6; i <= 6; i++) for (const [ax, az, rot] of [[i * 3, -WALL, 0], [i * 3, WALL, 0], [-WALL, i * 3, 1], [WALL, i * 3, 1]]) M(BOX(rot ? 1.6 : 1.4, 1, rot ? 1.4 : 1.6), stone, ax, 10.5, az, null, 0.03);
  // royal box (north) with the striped awning, and the gate (south)
  const roy = new THREE.Group(); roy.position.set(0, 0, -(RING + 4.2)); scene.add(roy);
  M(BOX(9, 3.0, 6), toon('#262b52'), 0, 1.5, 0, roy, 0.05); M(BOX(9.2, 0.2, 6.2), toon('#e6b45a'), 0, 3.05, 0, roy, 0.02);
  for (let k = 0; k < 12; k++) { const s = M(BOX(0.78, 0.08, 4.2), toon(k % 2 ? '#f2f0ea' : '#c42d3c'), -4.3 + k * 0.78, 6.6, 0.4, roy, 0.02); s.rotation.x = -0.28; }
  for (const sx of [-1, 1]) { M(BOX(0.22, 3.6, 0.22), toon('#e6b45a'), sx * 4.3, 4.9, 2.4, roy, 0.02); M(BOX(0.22, 3.6, 0.22), toon('#e6b45a'), sx * 4.3, 4.9, -1.6, roy, 0.02); const c = M(new THREE.OctahedronGeometry(0.3, 0), toon('#58d8ff', { emissive: new THREE.Color('#58d8ff'), emissiveIntensity: 1.6 }), sx * 3.2, 3.6, 3.1, roy, 0.02); c.scale.y = 1.5; glowSprite(sx * 3.2, 3.6, 3.1, 0x58d8ff, 2.4, 0.8, roy); }
  const embD = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40), new THREE.MeshToonMaterial({ map: emb, gradientMap: grad, emissive: 0xffffff, emissiveMap: emb, emissiveIntensity: 0.4 })); embD.position.set(0, 7.1, 2.55); embD.rotation.x = -0.28; roy.add(embD);
  M(BOX(1.4, 1.8, 0.4), toon('#7a1d2a'), 0, 3.95, -1.4, roy, 0.03); M(BOX(1.6, 0.4, 1.1), toon('#7a1d2a'), 0, 3.35, -0.9, roy, 0.03);
  M(BOX(1.6, 0.04, 5), toon('#c0283a'), 0, 0.02, -(RING - 2.4), null, 0);
  const king = makeFox({ key: 'king', outfit: 'armor', look: KING_MIGHT, torso: ['#7a808c', '#474d59', '#23272f'], crest: 'M', crown: true, eyes: ['#e6b45a', '#e6b45a'], mood: 'warm' });
  king.position.set(0, 3.15, -(RING + 4.2) - 0.7); king.scale.multiplyScalar(1.1);
  const KING_HEAD = new THREE.Vector3(0, 3.15 + 1.62 * 1.1 * KING_MIGHT.bodyScale + 0.15, -(RING + 4.9)); const camTmp = new THREE.Vector3();
  const kingLook = new THREE.Vector3();
  const gate = new THREE.Group(); gate.position.set(0, 0, RING + 1.2); scene.add(gate);
  for (const sx of [-1, 1]) { M(BOX(1.0, 4.2, 2.6), toon('#262b52'), sx * 2.3, 2.1, 0.8, gate, 0.04); const c = M(new THREE.OctahedronGeometry(0.25, 0), toon('#58d8ff', { emissive: new THREE.Color('#58d8ff'), emissiveIntensity: 1.6 }), sx * 2.3, 4.6, -0.2, gate, 0.02); c.scale.y = 1.5; glowSprite(sx * 2.3, 4.6, -0.2, 0x58d8ff, 2, 0.8, gate); }
  M(BOX(5.6, 0.8, 2.6), toon('#262b52'), 0, 4.6, 0.8, gate, 0.04); M(BOX(3.6, 3.8, 0.2), toon('#0b0d1c'), 0, 1.9, 1.9, gate, 0);
  // torches round the ring + flood towers
  const flames = [];
  for (let i = 0; i < 16; i++) { const a = (i + 0.5) / 16 * Math.PI * 2, r = RING + 0.85; if (Math.abs(Math.sin(a)) > 0.97 && Math.cos(a) * 0 === 0 && Math.abs(Math.cos(a)) < 0.25) continue; const x = Math.sin(a) * r, z = Math.cos(a) * r; M(new THREE.CylinderGeometry(0.16, 0.2, 0.35, 10), toon('#4a4560'), x, 1.6, z, null, 0.02, 0.2); const f = M(new THREE.ConeGeometry(0.17, 0.45, 8), toon('#ff9a3a', { emissive: new THREE.Color('#ff9a3a'), emissiveIntensity: 2 }), x, 2.0, z, null, 0); f.castShadow = false; flames.push({ f, ph: rnd() * 9 }); glowSprite(x, 2.0, z, 0xff9a40, 2.6, 0.85); }
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const x = sx * (WALL - 4), z = sz * (WALL - 4); M(new THREE.CylinderGeometry(0.25, 0.35, 14, 10), stoneD, x, 7, z, null, 0.04, 0.35); M(BOX(1.6, 0.8, 1.6), toon('#ffe9b0', { emissive: new THREE.Color('#ffe2a0'), emissiveIntensity: 1.6 }), x, 14.2, z, null, 0.04); glowSprite(x, 14.2, z, 0xffe2a0, 9, 0.7); const L = new THREE.PointLight(0xffd8a0, 120, 60, 1.6); L.position.set(x, 14, z); scene.add(L); }
  for (let i = 0; i < 4; i++) { const L = new THREE.PointLight(0xff9a50, 10, 16, 2); const a = i / 4 * Math.PI * 2 + Math.PI / 4; L.position.set(Math.sin(a) * (RING - 1), 2.4, Math.cos(a) * (RING - 1)); scene.add(L); }
  // banners on the wall
  const bnT = bannerTex(), bnM = new THREE.MeshToonMaterial({ map: bnT, gradientMap: grad, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  for (let i = -3; i <= 3; i++) { if (!i) continue; for (const [x, z, ry] of [[i * 5, -WALL + 0.85, 0], [i * 5, WALL - 0.85, Math.PI], [-WALL + 0.85, i * 5, Math.PI / 2], [WALL - 0.85, i * 5, -Math.PI / 2]]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.8), bnM); b.position.set(x, 7.4, z); b.rotation.y = ry; scene.add(b); } }

  // ---------- the crowd ----------
  const crowd = [], shirts = ['#c42d3c', '#f2f0ea', '#38bdf8', '#e6b45a', '#7c3aed', '#1e3a8a', '#ea580c', '#4ade80'].map(c => new THREE.Color(c));
  for (let i = 0; i < TIERS; i++) { const r = T0 + i * TW + TW * 0.55, y = 1.4 + i * TH, n = Math.floor(2 * Math.PI * r / 0.62); for (let k = 0; k < n; k++) { const a = (k + rr(-0.2, 0.2)) / n * Math.PI * 2; const x = Math.sin(a) * r, z = Math.cos(a) * r; if (z < -RING && Math.abs(x) < 5.4) continue; if (z > RING && Math.abs(x) < 3.6) continue; if (rnd() < 0.12) continue; crowd.push({ x, y, z, a, ph: rr(0, 6.28), s: rr(0.85, 1.05), shirt: pick(shirts) }); } }
  const cBody = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.2, 0.32, 3, 8), toon('#ffffff'), crowd.length);
  const cHead = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 12, 8), toon('#f07a2a'), crowd.length);
  const earG = new THREE.ConeGeometry(0.08, 0.2, 4); const cEarL = new THREE.InstancedMesh(earG, toon('#1e293b'), crowd.length), cEarR = new THREE.InstancedMesh(earG, toon('#1e293b'), crowd.length);
  crowd.forEach((c, i) => cBody.setColorAt(i, c.shirt));
  [cBody, cHead, cEarL, cEarR].forEach(m => { m.castShadow = false; m.receiveShadow = true; scene.add(m); });
  const dm = new THREE.Object3D();
  let cheer = 0.2;
  function updateCrowd(t) {
    crowd.forEach((c, i) => {
      const hop = Math.max(0, Math.sin(t * (4 + cheer * 6) + c.ph)) * (0.04 + cheer * 0.28);
      const face = Math.atan2(-c.x, -c.z);
      dm.position.set(c.x, c.y + 0.36 + hop, c.z); dm.rotation.set(0, face, 0); dm.scale.setScalar(c.s); dm.updateMatrix(); cBody.setMatrixAt(i, dm.matrix);
      dm.position.y = c.y + 0.86 + hop; dm.updateMatrix(); cHead.setMatrixAt(i, dm.matrix);
      for (const [im, s] of [[cEarL, -1], [cEarR, 1]]) { dm.position.set(c.x + Math.cos(face) * s * 0.13, c.y + 1.08 + hop, c.z - Math.sin(face) * s * 0.13); dm.rotation.set(0, face, -s * 0.3); dm.updateMatrix(); im.setMatrixAt(i, dm.matrix); }
    });
    [cBody, cHead, cEarL, cEarR].forEach(m => m.instanceMatrix.needsUpdate = true);
  }
  updateCrowd(0);

  // ---------- fx ----------
  const sparkN = 260, sparkArr = new Float32Array(sparkN * 3), sparkV = Array.from({ length: sparkN }, () => ({ v: new THREE.Vector3(), life: 0, col: 0 }));
  const sparkGeo = new THREE.BufferGeometry(); sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkArr, 3)); sparkArr.fill(-999);
  const sparkMat = new THREE.PointsMaterial({ color: 0xffd38a, map: dotTex, size: 0.14, transparent: true, depthWrite: false, alphaTest: 0.1, blending: THREE.AdditiveBlending });
  const sparks = new THREE.Points(sparkGeo, sparkMat); sparks.frustumCulled = false; scene.add(sparks); let sparkI = 0;
  function burst(p, n = 16, speed = 6) { for (let k = 0; k < n; k++) { const s = sparkV[sparkI]; s.life = rr(0.25, 0.6); s.v.set(rr(-1, 1), rr(0.2, 1.4), rr(-1, 1)).normalize().multiplyScalar(rr(0.4, 1) * speed); sparkArr.set([p.x, p.y, p.z], sparkI * 3); sparkI = (sparkI + 1) % sparkN; } }
  const popups = [];
  function popup(p, text, color = '#ffffff') {
    const t = canvasTex(256, 96, (g) => { g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#14111f'; g.strokeText(text, 128, 50); g.fillStyle = color; g.fillText(text, 128, 50); });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.position.copy(p); s.scale.set(1.6, 0.6, 1); s.renderOrder = 10; scene.add(s); popups.push({ s, t: 0 });
  }
  const bolts = [], beams = [];
  const boltGeo = new THREE.CapsuleGeometry(0.06, 0.7, 3, 6); boltGeo.rotateX(Math.PI / 2);
  const boltMat = new THREE.MeshBasicMaterial({ color: 0x9ff3ff }), beamMat = new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const aimMat = new THREE.MeshBasicMaterial({ color: 0xff6b5a, transparent: true, opacity: 0.5, depthWrite: false });

  // ---------- the fox, armed ----------
  const fox = makeFox({ torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', mood: 'determined', look: PLAYER_MALE, outfit: 'armor', gear: 'both' });
  const FP = fox.userData.P, hand = FP.arms[1], gunArm = FP.arms[0], sword = FP.sword, gun = FP.gun;
  const muzzle = new THREE.Object3D(); muzzle.position.set(0, 0.16, 0.7); gun.add(muzzle);
  const flash = glowSprite(0, 0.16, 0.72, 0x9ff3ff, 0.9, 0, gun);
  const trailMat = new THREE.MeshBasicMaterial({ color: 0x9ff3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const trail = new THREE.Mesh(new THREE.RingGeometry(0.7, 2.1, 32, 1, -1.25, 2.5), trailMat); trail.rotation.x = -Math.PI / 2; trail.position.y = 1.0; fox.add(trail);
  const reticle = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.7, 32), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.85, depthTest: false, side: THREE.DoubleSide })); reticle.renderOrder = 9; scene.add(reticle);

  // ---------- machines ----------
  const metal = toon('#8b95a1'), metalD = toon('#59626d'), metalK = toon('#2c333b'), redEye = () => new THREE.MeshToonMaterial({ color: '#ff3b30', gradientMap: grad, emissive: new THREE.Color('#ff3b30'), emissiveIntensity: 1.6 });
  function hitable(g) { const mats = []; g.traverse(o => { if (o.isMesh && o.material !== outlineMat && o.material.emissive && !o.userData.keep) { o.material = o.material.clone(); mats.push(o.material); } }); return mats; }
  function makeDrone() {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    M(new THREE.CylinderGeometry(0.62, 0.72, 0.32, 20), metal, 0, 0, 0, body, 0.03, 0.72);
    M(new THREE.SphereGeometry(0.42, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), metalD, 0, 0.14, 0, body, 0.03, 0.42);
    M(new THREE.CylinderGeometry(0.5, 0.36, 0.22, 20), metalK, 0, -0.26, 0, body, 0.025, 0.5);
    const eye = M(new THREE.SphereGeometry(0.17, 14, 10), redEye(), 0, 0, 0.62, body, 0.02, 0.17); eye.userData.keep = true; eye.scale.z = 0.6;
    glowSprite(0, 0, 0.7, 0xff3b30, 0.9, 0.9, body);
    const rotors = [];
    for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + Math.PI / 4, x = Math.sin(a) * 0.82, z = Math.cos(a) * 0.82; M(BOX(0.42, 0.06, 0.08), metalK, Math.sin(a) * 0.62, 0.06, Math.cos(a) * 0.62, body, 0.01).rotation.y = a + Math.PI / 2; M(new THREE.TorusGeometry(0.26, 0.035, 6, 20), metalD, x, 0.08, z, body, 0.012).rotation.x = Math.PI / 2; const r = new THREE.Group(); r.position.set(x, 0.1, z); body.add(r); M(BOX(0.46, 0.015, 0.07), toon('#c3cbd4'), 0, 0, 0, r, 0); M(BOX(0.07, 0.015, 0.46), toon('#c3cbd4'), 0, 0, 0, r, 0); rotors.push(r); }
    M(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 5), metalK, 0.18, 0.5, -0.1, body, 0); M(new THREE.SphereGeometry(0.04, 6, 4), redEye(), 0.18, 0.72, -0.1, body, 0).userData.keep = true;
    scene.add(g); return { g, body, rotors, mats: hitable(g) };
  }
  function makeRobot() {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const steel = toon('#c3cbd4'), steelD = toon('#7d8792'), dark = toon('#3b434c');
    const legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.2, 0.75, 0); body.add(p); M(BOX(0.2, 0.62, 0.24), steelD, 0, -0.32, 0, p, 0.025); M(BOX(0.28, 0.14, 0.4), dark, 0, -0.68, 0.06, p, 0.02); return p; });
    M(BOX(0.78, 0.7, 0.5), steel, 0, 1.16, 0, body, 0.035); M(BOX(0.62, 0.22, 0.44), steelD, 0, 0.74, 0, body, 0.025);
    const core = M(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 16), new THREE.MeshToonMaterial({ color: '#5fe3ff', gradientMap: grad, emissive: new THREE.Color('#5fe3ff'), emissiveIntensity: 1.3 }), 0, 1.2, 0.26, body, 0.012, 0.11); core.rotation.x = Math.PI / 2;
    const head = new THREE.Group(); head.position.y = 1.72; body.add(head);
    M(BOX(0.46, 0.36, 0.42), steel, 0, 0, 0, head, 0.03); const visor = M(BOX(0.38, 0.1, 0.05), new THREE.MeshToonMaterial({ color: '#5fe3ff', gradientMap: grad, emissive: new THREE.Color('#5fe3ff'), emissiveIntensity: 1.6 }), 0, 0.02, 0.22, head, 0.01);
    M(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 5), dark, 0.14, 0.32, 0, head, 0);
    const armL = new THREE.Group(); armL.position.set(-0.5, 1.4, 0); body.add(armL); M(BOX(0.18, 0.62, 0.2), steelD, 0, -0.28, 0, armL, 0.022);
    const shield = M(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 6), dark, 0, -0.42, 0.22, armL, 0.03, 0.5); shield.rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 6), steelD, 0, 0, 0, shield, 0); M(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 12), toon('#ff3b30', { emissive: new THREE.Color('#ff3b30'), emissiveIntensity: 1 }), 0, 0, 0, shield, 0);
    const armR = new THREE.Group(); armR.position.set(0.5, 1.4, 0); body.add(armR); M(BOX(0.18, 0.62, 0.2), steelD, 0, -0.28, 0, armR, 0.022);
    const rb = new THREE.Group(); rb.position.set(0, -0.6, 0.05); armR.add(rb); M(BOX(0.08, 0.22, 0.08), dark, 0, 0, 0, rb, 0.01); const rbl = M(BOX(0.08, 1.0, 0.03), new THREE.MeshToonMaterial({ color: '#ffd0cc', gradientMap: grad, emissive: new THREE.Color('#ff3b30'), emissiveIntensity: 0.4 }), 0, 0.6, 0, rb, 0.012); rb.rotation.x = Math.PI / 2;
    const warn = new THREE.Mesh(new THREE.RingGeometry(0.4, 2.4, 32, 1, -Math.PI / 2 - 0.95, 1.9), new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); warn.rotation.x = -Math.PI / 2; warn.position.y = 0.04; g.add(warn);
    scene.add(g); return { g, body, legs, head, armL, armR, shield, warn, bladeMat: rbl.material, visorMat: visor.material, mats: hitable(g) };
  }

  // ---------- state ----------
  const St = { mode: 'attract', phase: 'idle', t: 0, yaw: 0, pitch: 0.42, dist: 8.2, dialog: null, tip: null, roundT: 0, totalT: 0, shake: 0, hitStop: 0, muted: false, results: null, attackQueued: false, committed: -1, commitCd: 1.2 };
  const P = { x: 0, z: 9, y: 0, vx: 0, vz: 0, vy: 0, face: Math.PI, ground: true, hp: 100, en: 100, enT: 0, inv: 0, hurt: 0, weapon: 'RAYGUN', unlocked: ['RAYGUN'], fireCd: 0, swing: 0, swingHit: new Set(), combo: 0, comboT: 0, dash: 0, dashCd: 0, dx: 0, dz: 0, stepT: 0, target: null };
  let foes = [];
  const G = { style: 0, styleT: 0, score: 0, lastWeapon: null, super: 0, pickups: [], sweep: null, sweepCd: 7, waves: [], bossRef: null, summoned: false };
  const RANKS = ['D', 'C', 'B', 'A', 'S'], rankOf = () => RANKS[Math.min(4, Math.floor(G.style / 20))];
  function addStyle(n, label) { G.style = clamp(G.style + n, 0, 100); G.styleT = 2.2; if (label) popup(v3.set(P.x, 3.0, P.z), label, '#ffd76a'); }
  function addSuper(n) { const was = G.super < 100; G.super = Math.min(100, G.super + n); if (was && G.super >= 100) { popup(v3.set(P.x, 3.3, P.z), 'BURST READY', '#5fe3ff'); audio.tone(660, 0.3, 0.05, 'triangle', 2); } }
  const audio = new Ambience();
  function sfxLaser() { audio.tone(1500, 0.14, 0.05, 'sawtooth', 0.35); audio.tone(900, 0.1, 0.03, 'square', 0.5); }
  function sfxSwing() { audio.burst(0.12, 2600, 0.12); }
  function sfxHit() { audio.tone(220, 0.08, 0.07, 'square', 0.6); audio.burst(0.06, 1400, 0.12); }
  function sfxBlock() { audio.tone(1900, 0.18, 0.05, 'triangle', 0.98); audio.tone(2400, 0.12, 0.03, 'sine'); }
  function sfxBoom() { audio.burst(0.5, 500, 0.3); audio.tone(90, 0.4, 0.08, 'sine', 0.5); }
  function sfxHurt() { audio.tone(300, 0.18, 0.06, 'sawtooth', 0.5); }
  function sfxCheer() { if (!audio.ctx || audio.muted) return; const ctx = audio.ctx, t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = audio.noise; const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 1100; b.Q.value = 0.6; const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.22, t + 0.3); g.gain.exponentialRampToValueAtTime(0.001, t + 2.2); s.connect(b); b.connect(g); g.connect(audio.master); s.start(t); s.stop(t + 2.3); }
  function crowdHum() { if (!audio.ctx || audio.hum) return; const ctx = audio.ctx, s = ctx.createBufferSource(); s.buffer = audio.noise; s.loop = true; const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 700; b.Q.value = 0.5; const g = ctx.createGain(); g.gain.value = 0.05; s.connect(b); b.connect(g); g.connect(audio.master); s.start(); audio.hum = g; }

  function spawnWave(kind) {
    foes.forEach(f => scene.remove(f.m.g)); foes = [];
    if (kind === 'laser') for (let i = 0; i < 4; i++) { const m = makeDrone(), a = i / 4 * Math.PI * 2; foes.push({ kind: 'drone', m, hp: 60, max: 60, a, dir: i % 2 ? 1 : -1, R: 7.5, close: 1, cd: 2.2 + i * 0.6, aim: 0, aimFrom: new THREE.Vector3(), aimTo: new THREE.Vector3(), flash: 0, x: 0, z: 0, y: 2.4, dead: 0 }); }
    if (kind === 'sword') for (let i = 0; i < 4; i++) { const m = makeRobot(), a = Math.atan2(-P.x, -P.z) + (i - 1.5) * 0.75; let sx = P.x + Math.sin(a) * 7.5, sz = P.z + Math.cos(a) * 7.5; const sr = Math.hypot(sx, sz); if (sr > RING - 1.5) { sx *= (RING - 1.5) / sr; sz *= (RING - 1.5) / sr; } if (Math.hypot(sx - P.x, sz - P.z) < 4.5) { sx = -P.x * 0.6 + Math.sin(a) * 3; sz = -P.z * 0.6 + Math.cos(a) * 3; } foes.push({ kind: 'robot', m, hp: 115, max: 115, slot: i, x: sx, z: sz, y: 0, face: 0, mode: 'circle', mt: 0, guard: 1, flash: 0, kx: 0, kz: 0, walk: 0, dead: 0, hitDone: false }); }
    if (kind === 'boss') { const m = makeRobot(); m.g.scale.setScalar(2.2); m.mats.forEach(mt => { if (mt.color) mt.color.lerp(new THREE.Color('#4b5390'), 0.35); });
      const crown = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 6), new THREE.MeshToonMaterial({ color: '#ec3013', gradientMap: grad, emissive: new THREE.Color('#ec3013'), emissiveIntensity: 1 })); crown.rotation.x = Math.PI / 2; crown.position.y = 0.3; m.head.add(crown);
      const ringM = new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }); const tele = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1), ringM); tele.rotation.x = -Math.PI / 2; tele.position.y = 0.05; scene.add(tele);
      const f = { kind: 'robot', boss: true, rad: 1.6, m, hp: 700, max: 700, slot: 0, x: 0, z: -6, y: 0, face: 0, mode: 'idle', mt: 0, guard: 1, flash: 0, kx: 0, kz: 0, walk: 0, dead: 0, hitDone: false, atk: 0, tele, cdBoss: 2.0 };
      foes.push(f); G.bossRef = f; G.summoned = false; }
    St.committed = -1; St.commitCd = 2.2; P.inv = 1.2;
    foes.forEach(f => { f.m.g.position.set(f.x, f.y, f.z); });
  }
  const alive = () => foes.filter(f => !f.dead);
  function say(lines, then) { St.dialog = { lines: lines.map(l => l.who === 'player' ? { name: 'You', role: 'Fox Soldier', text: l.text, you: true } : { name: KING, role: 'Meru', text: l.text }), i: 0, chars: 0, then }; audio.blip(); }
  function showTip(kind) { St.tip = { text: TIPS[kind][0], sub: TIPS[kind][1], t: 0, life: 5.5 }; }
  function startRound(kind) { G.sweepCd = kind === 'boss' ? 6 : 7; St.phase = kind; St.lastRound = kind; if (kind === 'boss' && !P.unlocked.includes('SWORD')) P.unlocked.push('SWORD'); St.roundT = 0; spawnWave(kind); showTip(kind); if (kind === 'sword' && !P.unlocked.includes('SWORD')) P.unlocked.push('SWORD'); P.weapon = kind === 'laser' ? 'RAYGUN' : 'SWORD'; if (kind === 'boss') P.unlocked = ['RAYGUN', 'SWORD']; P.en = 100; cheer = 0.7; sfxCheer(); }
  function resetPlayer() { P.x = 0; P.z = 9; P.vx = P.vz = 0; P.hp = 100; P.en = 100; P.face = Math.PI; St.yaw = 0; P.inv = 0; }

  // ---------- input ----------
  const keys = new Set(), input = { jx: 0, jy: 0, jump: false };
  const onKeyDown = e => {
    if (/INPUT|TEXTAREA/.test(e.target.tagName) || St.mode !== 'play') return; keys.add(e.code);
    if (e.code === 'Space') { e.preventDefault(); if (St.dialog) api.advance(); else input.jump = true; }
    if (e.code === 'KeyE' || e.code === 'Enter') api.advance();
    if (e.code === 'KeyF' || e.code === 'KeyJ') api.attack();
    if (e.code === 'Tab') { e.preventDefault(); api.cycleTarget(); } if (e.code === 'KeyC' || e.code === 'KeyT' || e.code === 'Escape') { if (e.code === 'Escape' && !St.lock) {} else api.toggleLock(); } if (e.code === 'KeyR' || e.code === 'KeyV') gateBurst(); if (e.code === 'KeyQ') api.swap(); if (e.code === 'Digit1') api.select('RAYGUN'); if (e.code === 'Digit2') api.select('SWORD');
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') api.dodge();
    if (/Arrow/.test(e.code)) e.preventDefault();
  };
  const onKeyUp = e => keys.delete(e.code), onBlur = () => keys.clear();
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); window.addEventListener('blur', onBlur);
  const el = renderer.domElement, ptrs = new Map();
  const joyBase = document.createElement('div'), joyKnob = document.createElement('div');
  joyBase.style.cssText = 'position:absolute;width:112px;height:112px;border:2px solid #f3f2f2;background:rgba(32,30,29,.25);transform:translate(-50%,-50%);display:none;pointer-events:none;';
  joyKnob.style.cssText = 'position:absolute;width:44px;height:44px;background:#ec3013;transform:translate(-50%,-50%);display:none;pointer-events:none;';
  container.append(joyBase, joyKnob);
  el.addEventListener('pointerdown', e => {
    if (St.mode !== 'play') return; el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect(), lx = e.clientX - r.left, ly = e.clientY - r.top;
    const joy = e.pointerType === 'touch' && lx < r.width * 0.45 && ![...ptrs.values()].some(p => p.joy);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, ox: lx, oy: ly, joy, btn: e.button, t: performance.now() });
    if (joy) { joyBase.style.display = joyKnob.style.display = 'block'; joyBase.style.left = joyKnob.style.left = lx + 'px'; joyBase.style.top = joyKnob.style.top = ly + 'px'; }
    if (e.pointerType === 'mouse' && e.button === 1) { e.preventDefault(); api.toggleLock(); }
    if (e.pointerType === 'mouse' && e.button === 0) { if (St.dialog) api.advance(); else { St.mouseHeld = true; api.attack(); } }
  });
  el.addEventListener('pointermove', e => { const p = ptrs.get(e.pointerId); if (!p) return; if (p.joy) { const r = el.getBoundingClientRect(); let dx = e.clientX - r.left - p.ox, dy = e.clientY - r.top - p.oy; const l = Math.hypot(dx, dy); if (l > 50) { dx *= 50 / l; dy *= 50 / l; } input.jx = dx / 50; input.jy = -dy / 50; joyKnob.style.left = p.ox + dx + 'px'; joyKnob.style.top = p.oy + dy + 'px'; } else if (p.btn !== 0 || e.pointerType === 'touch') { const k = e.pointerType === 'touch' ? 0.008 : 0.005; St.dragT = 1.2; St.yaw -= (e.clientX - p.x) * k; St.pitch = clamp(St.pitch + (e.clientY - p.y) * k * 0.8, 0.05, 1.1); } p.x = e.clientX; p.y = e.clientY; });
  const endPtr = e => { const p = ptrs.get(e.pointerId); if (p && p.btn === 0 && e.pointerType === 'mouse') St.mouseHeld = false; if (p && p.joy) { input.jx = input.jy = 0; joyBase.style.display = joyKnob.style.display = 'none'; } if (p && e.pointerType === 'touch' && !p.joy && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) < 10 && performance.now() - p.t < 250) { if (St.dialog) api.advance(); else api.attack(); } ptrs.delete(e.pointerId); };
  el.addEventListener('pointerup', endPtr); el.addEventListener('pointercancel', endPtr);
  el.addEventListener('wheel', e => { if (St.mode !== 'play') return; St.dist = clamp(St.dist + e.deltaY * 0.01, 4, 14); e.preventDefault(); }, { passive: false });
  el.addEventListener('contextmenu', e => e.preventDefault());
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); }); ro.observe(container);

  // ---------- combat ----------
  const v3 = new THREE.Vector3(), v4 = new THREE.Vector3();
  function pickTarget() {
    let best = null, bs = -1e9; const fx = Math.sin(P.face), fz = Math.cos(P.face);
    for (const f of alive()) { const dx = f.x - P.x, dz = f.z - P.z, d = Math.hypot(dx, dz); if (d > 20) continue; const dot = (dx * fx + dz * fz) / (d || 1); const sc = dot * 2 - d * 0.12; if (dot > 0.25 && sc > bs) { bs = sc; best = f; } }
    if (!best) for (const f of alive()) { const d = Math.hypot(f.x - P.x, f.z - P.z); if (d < 4 && -d > bs) { bs = -d; best = f; } }
    return best;
  }
  function damageFoe(f, dmg, weapon, from, breaker) {
    if (f.dead) return;
    if (f.kind === 'robot' && f.guard > 0.5 && breaker) { f.guard = 0; f.stagger = 0.9; sfxBlock(); audio.burst(0.2, 900, 0.2); popup(v3.set(f.x, 2.7, f.z), 'GUARD BREAK', '#ffd76a'); St.shake = 0.25; }
    else if (f.kind === 'robot' && f.guard > 0.5) { const fx = Math.sin(f.face), fz = Math.cos(f.face), dx = from.x - f.x, dz = from.z - f.z, d = Math.hypot(dx, dz) || 1; if ((dx * fx + dz * fz) / d > 0.2) { sfxBlock(); burst(v3.set(f.x + fx * 0.6, 1.2, f.z + fz * 0.6), 10, 5); popup(v3.set(f.x, 2.4, f.z), 'BLOCKED', '#cbd5e1'); f.m.shield.rotation.z += 0.3; return; } }
    f.hp -= dmg; f.flash = 0.12; sfxHit(); burst(v3.set(f.x, f.y + (f.kind === 'drone' ? 0 : 1.2), f.z), 14, 6);
    popup(v3.set(f.x + rr(-0.3, 0.3), f.y + (f.kind === 'drone' ? 0.9 : f.boss ? 4.6 : 2.3), f.z), String(dmg), weapon === 'SWORD' ? '#9ff3ff' : weapon === 'BURST' ? '#ffd76a' : '#ffffff');
    G.score += Math.round(dmg * (1 + RANKS.indexOf(rankOf()) * 0.25)); addSuper(weapon === 'BURST' ? 0 : 4);
    if (G.lastWeapon && G.lastWeapon !== weapon && weapon !== 'BURST') addStyle(10, 'MIX UP'); else addStyle(5); G.lastWeapon = weapon;
    if (f.kind === 'robot') { const dx = f.x - P.x, dz = f.z - P.z, d = Math.hypot(dx, dz) || 1, kb = f.boss ? 0.6 : 4.5; f.kx += dx / d * kb; f.kz += dz / d * kb; f.stagger = Math.max(f.stagger || 0, 0.35); f.guard = 0; if (f.mode === 'windup' || f.mode === 'swing') { f.mode = 'recover'; f.mt = 0.2; } }
    if (f.hp <= 0) { f.dead = 1; sfxBoom(); addStyle(12, f.boss ? null : null); addSuper(10); G.score += f.boss ? 2000 : 150; dropPickup(f); burst(v3.set(f.x, f.y + (f.kind === 'drone' ? 0 : 1), f.z), 40, 9); cheer = 1; sfxCheer(); St.shake = 0.35; if (St.committed === foes.indexOf(f)) { St.committed = -1; St.commitCd = 0.8; } }
    else cheer = Math.min(1, cheer + 0.15);
  }
  function hurtPlayer(dmg, from) {
    if (P.inv > 0 || P.dash > 0 || St.dialog) return; P.hp = Math.max(0, P.hp - dmg); G.style = Math.max(0, G.style - 35); P.inv = 0.7; P.hurt = 0.3; St.shake = 0.3; sfxHurt();
    const dx = P.x - from.x, dz = P.z - from.z, d = Math.hypot(dx, dz) || 1; P.vx += dx / d * 7; P.vz += dz / d * 7;
    popup(v3.set(P.x, 2.4, P.z), '-' + dmg, '#ff6b5a');
    if (P.hp <= 0) { St.phase = 'down'; St.results = { win: false, round: St.lastRound, score: G.score, rank: rankOf() }; cheer = 0.3; }
  }

  // ---------- pickups ----------
  const orbGeo = new THREE.OctahedronGeometry(0.22, 0);
  function dropPickup(f) {
    const r = rnd(); if (r > 0.75) return; const kind = r < 0.3 ? 'health' : r < 0.6 ? 'energy' : 'burst';
    const col = kind === 'health' ? '#ec3013' : kind === 'energy' ? '#38bdf8' : '#ffd76a';
    const m = new THREE.Mesh(orbGeo, new THREE.MeshToonMaterial({ color: col, gradientMap: grad, emissive: new THREE.Color(col), emissiveIntensity: 1.2 })); m.position.set(f.x, 1, f.z); scene.add(m);
    glowSprite(0, 0, 0, new THREE.Color(col).getHex(), 1.3, 0.8, m);
    G.pickups.push({ m, kind, t: 0, vy: 5, x: f.x, z: f.z });
  }
  function updatePickups(dt) {
    for (let i = G.pickups.length - 1; i >= 0; i--) {
      const p = G.pickups[i]; p.t += dt; p.vy -= 14 * dt; const y = Math.max(0.6 + Math.sin(p.t * 3) * 0.15, p.m.position.y + p.vy * dt); if (y <= 0.75) p.vy = 0;
      const dx = P.x - p.x, dz = P.z - p.z, d = Math.hypot(dx, dz);
      if (d < 3.2 && p.t > 0.4) { p.x += dx / d * Math.min(d, 9 * dt); p.z += dz / d * Math.min(d, 9 * dt); }
      p.m.position.set(p.x, y, p.z); p.m.rotation.y += dt * 3;
      if (d < 0.9 && p.t > 0.4) {
        if (p.kind === 'health') { P.hp = Math.min(100, P.hp + 20); popup(v3.set(P.x, 2.6, P.z), '+20 HP', '#ec3013'); }
        else if (p.kind === 'energy') { P.en = 100; popup(v3.set(P.x, 2.6, P.z), 'ENERGY', '#38bdf8'); }
        else { addSuper(25); popup(v3.set(P.x, 2.6, P.z), '+BURST', '#ffd76a'); }
        audio.tone(880, 0.15, 0.05, 'triangle', 1.5); scene.remove(p.m); G.pickups.splice(i, 1); continue;
      }
      if (p.t > 14) { scene.remove(p.m); G.pickups.splice(i, 1); }
    }
  }
  // ---------- floor sweep hazard (rounds 2 and 3) ----------
  const sweepMat = new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const sweep = new THREE.Group(); scene.add(sweep);
  const beamA = new THREE.Mesh(new THREE.BoxGeometry(RING * 2, 0.16, 0.22), sweepMat); beamA.position.y = 0.35; sweep.add(beamA);
  const beamB = beamA.clone(); beamB.rotation.y = Math.PI / 2; sweep.add(beamB);
  const pylonM = new THREE.MeshToonMaterial({ color: '#2a2f55', gradientMap: grad }); const hub = M(new THREE.CylinderGeometry(0.5, 0.7, 0.6, 16), pylonM, 0, 0.3, 0, sweep, 0.03, 0.7); hub.visible = false;
  function updateSweep(dt, fighting) {
    const on = fighting && (St.phase === 'sword' || St.phase === 'boss');
    if (!on) { sweepMat.opacity = damp(sweepMat.opacity, 0, 8, dt); G.sweep = null; return; }
    if (!G.sweep) { G.sweepCd -= dt; if (G.sweepCd <= 0) { G.sweep = { t: 0, dir: rnd() < 0.5 ? 1 : -1, ang: rr(0, Math.PI) }; popup(v3.set(P.x, 3.2, P.z), 'JUMP!', '#ff3b30'); audio.tone(300, 0.5, 0.04, 'sawtooth', 2); } }
    const s = G.sweep; hub.visible = !!s;
    if (!s) return;
    s.t += dt; const warn = s.t < 1.3, active = !warn && s.t < 5.2;
    s.ang += (active ? 0.95 : 0.15) * s.dir * dt; sweep.rotation.y = s.ang;
    sweepMat.opacity = warn ? 0.18 + 0.25 * (Math.sin(s.t * 18) > 0 ? 1 : 0) : active ? 0.9 : Math.max(0, 0.9 - (s.t - 5.2) * 3);
    beamA.scale.set(1, active ? 1 : 0.4, active ? 1 : 0.5); beamB.scale.copy(beamA.scale);
    if (active && P.y < 0.55 && P.dash <= 0) {
      for (const off of [0, Math.PI / 2]) { const ang = s.ang + off, ex = Math.cos(ang), ez = -Math.sin(ang); const dist = Math.abs(P.x * ez - P.z * ex); if (dist < 0.45) { hurtPlayer(10, { x: P.x - ez * Math.sign(P.x * ez - P.z * ex), z: P.z + ex * Math.sign(P.x * ez - P.z * ex) }); break; } }
    }
    if (active && P.y > 0.6) { for (const off of [0, Math.PI / 2]) { const ang = s.ang + off, ex = Math.cos(ang), ez = -Math.sin(ang); if (Math.abs(P.x * ez - P.z * ex) < 0.7 && !s.jumped) { s.jumped = true; addStyle(14, 'CLEARED'); addSuper(6); setTimeout(() => s && (s.jumped = false), 400); } } }
    if (s.t > 5.5) { G.sweep = null; G.sweepCd = St.phase === 'boss' ? rr(8, 11) : rr(9, 13); }
  }
  // ---------- shockwaves (boss stomp) ----------
  const waveMat = new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  function shockwave(x, z, dmg = 14, speed = 9, max = 13) { const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 64), waveMat.clone()); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.08, z); scene.add(m); const wall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.5, 64, 1, true), waveMat.clone()); wall.position.set(x, 0.25, z); scene.add(wall); G.waves.push({ m, wall, x, z, r: 0.5, speed, max, dmg, hit: false }); St.shake = 0.5; audio.burst(0.4, 300, 0.3); audio.tone(70, 0.5, 0.08, 'sine', 0.6); }
  function updateWaves(dt) {
    for (let i = G.waves.length - 1; i >= 0; i--) {
      const w = G.waves[i]; w.r += w.speed * dt; w.m.scale.setScalar(w.r); w.wall.scale.set(w.r, 1, w.r); const fade = 1 - w.r / w.max; w.m.material.opacity = 0.85 * fade; w.wall.material.opacity = 0.5 * fade;
      const d = Math.hypot(P.x - w.x, P.z - w.z);
      if (!w.hit && Math.abs(d - w.r) < 0.55) { if (P.y < 0.45 && P.dash <= 0) { w.hit = true; hurtPlayer(w.dmg, { x: w.x, z: w.z }); } else if (!w.cleared) { w.cleared = true; addStyle(14, 'CLEARED'); addSuper(6); } }
      if (w.r > w.max) { scene.remove(w.m); scene.remove(w.wall); G.waves.splice(i, 1); }
    }
  }
  // ---------- 8-GATE BURST ----------
  const burstMat = new THREE.MeshBasicMaterial({ color: 0x5fe3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const burstRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.12, 8, 64), burstMat); burstRing.rotation.x = Math.PI / 2; scene.add(burstRing); let burstT = -1;
  function gateBurst() {
    if (G.super < 100 || St.dialog || !(St.phase === 'laser' || St.phase === 'sword' || St.phase === 'boss')) return false;
    G.super = 0; burstT = 0; St.slow = 0.7; St.shake = 0.8; P.inv = 0.8; cheer = 1; sfxCheer();
    audio.tone(220, 0.8, 0.08, 'sawtooth', 4); audio.burst(0.6, 1600, 0.3);
    popup(v3.set(P.x, 3.4, P.z), '8-GATE BURST', '#5fe3ff');
    for (const f of alive()) { const d = Math.hypot(f.x - P.x, f.z - P.z); if (d < 9 + (f.rad || 0)) { if (f.kind === 'robot') { f.guard = 0; f.stagger = f.boss ? 2.2 : 1.4; } damageFoe(f, f.boss ? 70 : 45, 'BURST', P, true); } }
    G.waves.forEach(w => { w.r = w.max + 1; }); if (G.sweep) G.sweep.t = 5.2;
    burst(v3.set(P.x, 1, P.z), 60, 12); return true;
  }
  function updateBurst(dt) { if (burstT < 0) return; burstT += dt; const r = 0.5 + burstT * 22; burstRing.position.set(P.x, 1.0, P.z); burstRing.scale.setScalar(r); burstMat.opacity = Math.max(0, 1 - burstT * 2.2); if (burstT > 0.5) { burstT = -1; burstMat.opacity = 0; } }
  // ---------- THE IRON WARDEN ----------
  function bossUpdate(f, dt, fighting) {
    const m = f.m, dxp = P.x - f.x, dzp = P.z - f.z, dp = Math.hypot(dxp, dzp) || 1, toP = Math.atan2(dxp, dzp);
    f.mt += dt; let sp = 0, turnK = 3;
    if (fighting && f.stagger > 0) { f.stagger -= dt; f.guard = 0; f.mode = 'stunned'; }
    else if (fighting) {
      if (f.mode === 'stunned') { f.mode = 'idle'; f.mt = 0; f.cdBoss = 0.8; }
      if (f.mode === 'idle') { f.guard = 1; sp = dp > 5 ? 1.8 : 0; f.cdBoss -= dt; if (f.cdBoss <= 0) { const opts2 = dp < 4 ? ['slam', 'stomp', 'slam'] : ['charge', 'stomp', 'charge']; f.mode = pick(opts2); f.mt = 0; if (f.mode === 'charge') { f.cdir = toP; audio.tone(180, 0.8, 0.05, 'sawtooth', 2.5); } if (f.mode === 'stomp') audio.tone(120, 0.9, 0.05, 'square', 0.5); if (f.mode === 'slam') audio.tone(260, 0.6, 0.05, 'sawtooth', 2.2); } }
      else if (f.mode === 'stomp') { f.guard = 1; turnK = 0.5; if (f.mt > 0.95 && !f.hitDone) { f.hitDone = true; shockwave(f.x, f.z, 14, 9, 14); if (f.hp < f.max * 0.5) setTimeout(() => fighting && !f.dead && shockwave(f.x, f.z, 12, 7, 12), 650); } if (f.mt > 1.6) { f.mode = 'idle'; f.mt = 0; f.hitDone = false; f.cdBoss = rr(1.2, 2.2); } }
      else if (f.mode === 'charge') {
        f.guard = 0.5; turnK = f.mt < 0.85 ? 4 : 0; if (f.mt < 0.85) { f.cdir = toP; }
        f.tele.material.opacity = f.mt < 0.85 ? 0.25 + 0.35 * (Math.sin(f.mt * 30) > 0 ? 1 : 0) : 0;
        const len = 12; f.tele.scale.set(1, len, 1); f.tele.position.set(f.x + Math.sin(f.cdir) * len / 2, 0.05, f.z + Math.cos(f.cdir) * len / 2); f.tele.rotation.set(-Math.PI / 2, 0, -f.cdir + Math.PI); 
        if (f.mt >= 0.85) { const v = 15; f.x += Math.sin(f.cdir) * v * dt; f.z += Math.cos(f.cdir) * v * dt; f.walk += dt * 18; if (rnd() < 0.5) burst(v3.set(f.x, 0.2, f.z), 2, 3);
          if (dp < 2.2 && !f.hitDone) { f.hitDone = true; hurtPlayer(16, f); }
          if (Math.hypot(f.x, f.z) > RING - 2.2) { f.mode = 'crash'; f.mt = 0; f.stagger = 2.4; St.shake = 0.7; sfxBoom(); burst(v3.set(f.x, 1.5, f.z), 40, 9); popup(v3.set(f.x, 5, f.z), 'STUNNED', '#ffd76a'); cheer = 1; } }
        if (f.mt > 2.4 && f.mode === 'charge') { f.mode = 'idle'; f.mt = 0; f.hitDone = false; f.cdBoss = 1.2; }
      }
      else if (f.mode === 'slam') { f.guard = 0; turnK = f.mt < 0.6 ? 5 : 0.3; if (f.mt > 0.75 && !f.hitDone) { f.hitDone = true; const a2 = Math.atan2(Math.sin(toP - f.face), Math.cos(toP - f.face)); St.shake = 0.5; sfxSwing(); audio.burst(0.3, 500, 0.25); if (dp < 4.4 && Math.abs(a2) < 1.2 && P.y < 1.2) hurtPlayer(18, f); burst(v3.set(f.x + Math.sin(f.face) * 3, 0.3, f.z + Math.cos(f.face) * 3), 24, 6); } if (f.mt > 1.5) { f.mode = 'idle'; f.mt = 0; f.hitDone = false; f.cdBoss = rr(1, 1.8); } }
      if (!f.summoned && f.hp < f.max * 0.5) { f.summoned = true; popup(v3.set(f.x, 5.2, f.z), 'REINFORCEMENTS', '#ff3b30'); for (let i = 0; i < 2; i++) { const dm = makeDrone(), a0 = i * Math.PI; foes.push({ kind: 'drone', m: dm, hp: 45, max: 45, a: a0, dir: i ? 1 : -1, R: 9, close: 1, cd: 3 + i, aim: 0, aimFrom: new THREE.Vector3(), aimTo: new THREE.Vector3(), flash: 0, x: 0, z: 0, y: 2.4, dead: 0 }); } }
    }
    if (f.mode !== 'charge') f.tele.material.opacity = damp(f.tele.material.opacity, 0, 10, dt);
    if (sp) { f.x += dxp / dp * sp * dt; f.z += dzp / dp * sp * dt; f.walk += sp * dt * 2; }
    f.x += f.kx * dt; f.z += f.kz * dt; f.kx = damp(f.kx, 0, 6, dt); f.kz = damp(f.kz, 0, 6, dt);
    const rr2 = Math.hypot(f.x, f.z); if (rr2 > RING - 2) { f.x *= (RING - 2) / rr2; f.z *= (RING - 2) / rr2; }
    let df = toP - f.face; df = Math.atan2(Math.sin(df), Math.cos(df)); f.face += df * Math.min(1, dt * turnK);
    const st = f.mode === 'stomp' ? Math.sin(Math.min(1, f.mt / 0.95) * Math.PI) * (f.mt < 0.95 ? 0.9 : 0) : 0;
    m.g.position.set(f.x, st, f.z); m.g.rotation.y = f.face;
    const sw = Math.sin(f.walk) * 0.6; m.legs[0].rotation.x = sw; m.legs[1].rotation.x = -sw;
    m.armL.rotation.x = lerp(0, -1.35, f.guard); m.armL.rotation.y = lerp(0, 0.5, f.guard);
    const wind = f.mode === 'slam' ? smooth(0, 0.75, f.mt) : 0, hitp = f.mode === 'slam' && f.mt > 0.75 ? smooth(0.75, 0.9, f.mt) : 0;
    m.armR.rotation.x = f.mode === 'slam' ? (f.mt < 0.75 ? -2.9 * wind : lerp(-2.9, -0.2, hitp)) : f.mode === 'stomp' ? -1.2 : -0.4; m.armR.rotation.z = 0;
    m.bladeMat.emissiveIntensity = f.mode === 'slam' ? 0.6 + wind * 2.6 : 0.5;
    const hot = f.mode === 'slam' || f.mode === 'charge' || f.mode === 'stomp'; m.visorMat.color.set(f.mode === 'stunned' ? '#ffd76a' : hot ? '#ff3b30' : '#5fe3ff'); m.visorMat.emissive.copy(m.visorMat.color);
    m.body.rotation.x = f.mode === 'stunned' ? -0.35 + Math.sin(St.t * 6) * 0.05 : f.mode === 'charge' && f.mt > 0.85 ? 0.35 : 0;
    m.head.rotation.z = f.mode === 'stunned' ? Math.sin(St.t * 8) * 0.2 : 0;
    m.warn.material.opacity = f.mode === 'slam' && f.mt < 0.9 ? 0.25 + wind * 0.6 : 0; m.warn.scale.setScalar(1.25);
  }

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, hudKey = '', hudT = 0;
  const camPos = new THREE.Vector3(0, 14, 24), camLook = new THREE.Vector3();
  function update(dt) {
    const rdt = dt; St.t += dt;
    if (St.hitStop > 0) { St.hitStop -= dt; dt *= 0.08; }
    if (St.slow > 0) { St.slow -= dt; dt *= 0.35; }
    P.crit = Math.max(0, (P.crit || 0) - dt);
    const play = St.mode === 'play', fighting = play && (St.phase === 'laser' || St.phase === 'sword' || St.phase === 'boss') && !St.dialog;
    if (fighting) { St.roundT += dt; St.totalT += dt; }
    // player
    if (play && St.phase !== 'down' && St.phase !== 'won') {
      let ix = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + input.jx;
      let iy = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) + input.jy;
      const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
      const fx = -Math.sin(St.yaw), fz = -Math.cos(St.yaw), rx = Math.cos(St.yaw), rz = -Math.sin(St.yaw);
      let mx = fx * iy + rx * ix, mz = fz * iy + rz * ix; const ml = Math.hypot(mx, mz); if (ml > 0) { mx /= ml; mz /= ml; }
      const spd = (P.swing > 0 ? 3.2 : 6.4) * Math.min(1, il);
      if (St.dialog) { mx = mz = 0; }
      if (P.lungeT > 0) { P.lungeT -= dt; P.vx = P.ldx * P.lsp; P.vz = P.ldz * P.lsp; }
      else if (P.dash > 0) { P.dash -= dt; P.vx = P.dx * 17; P.vz = P.dz * 17; if (rnd() < 0.6) burst(v3.set(P.x, 0.2, P.z), 1, 1.5); }
      else { P.vx = damp(P.vx, mx * spd, 18, dt); P.vz = damp(P.vz, mz * spd, 18, dt); }
      P.x += P.vx * dt; P.z += P.vz * dt;
      const r = Math.hypot(P.x, P.z); if (r > RING - 0.5) { P.x *= (RING - 0.5) / r; P.z *= (RING - 0.5) / r; }
      for (const f of alive()) { if (f.kind !== 'robot') continue; const dx = P.x - f.x, dz = P.z - f.z, d = Math.hypot(dx, dz), rr0 = f.boss ? 1.9 : 0.95; if (d < rr0 && d > 1e-3) { P.x = f.x + dx / d * rr0; P.z = f.z + dz / d * rr0; } }
      const hs = Math.hypot(P.vx, P.vz);
      if (St.lock && (St.lock.dead || !fighting || Math.hypot(St.lock.x - P.x, St.lock.z - P.z) > 26)) { St.lock = null; }
      St.soft = fighting ? pickTarget() : null;
      P.target = St.lock || St.soft;
      let wantFace = hs > 0.4 ? Math.atan2(P.vx, P.vz) : P.face;
      if ((P.swing > 0 || P.fireCd > 0.1) && P.target) wantFace = Math.atan2(P.target.x - P.x, P.target.z - P.z);
      let df = wantFace - P.face; df = Math.atan2(Math.sin(df), Math.cos(df)); P.face += df * Math.min(1, dt * 14);
      St.dragT = (St.dragT || 0) - dt;
      if (fighting && St.lock && St.dragT <= 0) { const want = Math.atan2(P.x - P.target.x, P.z - P.target.z); let dy = want - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, dt * 2.4); }
      else if (opts.followCam && hs > 0.6 && St.dragT <= 0 && P.dash <= 0) { let dy = (Math.atan2(P.vx, P.vz) + Math.PI) - St.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); St.yaw += dy * Math.min(1, dt * 1.6); }
      if (input.jump && P.ground && !St.dialog) { P.vy = 8; P.ground = false; } input.jump = false;
      P.vy -= 24 * dt; P.y += P.vy * dt; if (P.y <= 0) { P.y = 0; P.vy = 0; P.ground = true; }
      if (P.ground && hs > 1 && P.dash <= 0) { P.stepT -= dt * hs; if (P.stepT < 0) { P.stepT = 2.2; audio.step(); } }
      P.fireCd = Math.max(0, P.fireCd - dt); P.dashCd = Math.max(0, P.dashCd - dt); P.inv = Math.max(0, P.inv - dt); P.hurt = Math.max(0, P.hurt - dt);
      P.enT -= dt; if (P.enT < 0) P.en = Math.min(100, P.en + dt * 26);
      P.comboT -= dt; if (P.comboT < 0) P.combo = 0;
      if (St.attackQueued && P.swing <= 0) { St.attackQueued = false; api.attack(); }
      if (fighting && P.weapon === 'RAYGUN' && (St.mouseHeld || keys.has('KeyF') || keys.has('KeyJ'))) api.attack();
      // sword swing
      if (P.swing > 0) {
        const dur = P.swingDur, prog = 1 - P.swing / dur; P.swing -= dt;
        const side = P.combo % 2 ? -1 : 1;
        P.pose = { prog, side, combo: P.combo };
        trail.rotation.z = P.combo === 3 ? -prog * Math.PI * 2 : side * lerp(1.0, -1.0, prog) + Math.PI; trailMat.opacity = Math.sin(prog * Math.PI) * (P.crit > 0 ? 0.9 : 0.6);
        if (prog > 0.15 && prog < 0.85) for (const f of alive()) {
          if (P.swingHit.has(f)) continue; const dx = f.x - P.x, dz = f.z - P.z, d = Math.hypot(dx, dz), reach = f.kind === 'drone' ? 2.4 : f.boss ? 3.9 : 2.8;
          const ang = Math.atan2(dx, dz) - P.face, a2 = Math.atan2(Math.sin(ang), Math.cos(ang));
          const yOk = f.kind === 'drone' ? P.y > 0.9 : true;
          if (d < reach + 0.4 && Math.abs(a2) < (P.combo === 3 ? 3.2 : 1.5) && yOk) { P.swingHit.add(f); const crit = P.crit > 0; damageFoe(f, Math.round(DMG.SWORD * (P.combo === 3 ? 1.4 : 1) * (crit ? 1.6 : 1)), 'SWORD', P, P.combo === 3 || crit); St.hitStop = crit ? 0.14 : 0.08; if (crit) P.crit = 0; }
        }
      } else { P.pose = null; trailMat.opacity = damp(trailMat.opacity, 0, 12, dt); hand.rotation.y = damp(hand.rotation.y, 0, 10, dt); FP.body.rotation.y = 0; }
      fox.position.set(P.x, P.y, P.z); fox.rotation.y = P.face;
      fox.userData.mood = P.hurt > 0 ? 'stern' : P.dash > 0 ? 'determined' : St.phase === 'won' ? 'excited' : 'determined';
      animFox(fox, dt, P.dash > 0 ? 0 : hs, !P.ground);
      if (P.dash > 0) fox.userData.P.body.rotation.x = (1 - P.dash / 0.24) * Math.PI * 2;
      else fox.userData.P.body.rotation.x = damp(fox.userData.P.body.rotation.x % (Math.PI * 2), 0, 14, dt);
      if (P.pose) {
        const { prog, side, combo } = P.pose, sp = smooth(0, 1, prog);
        if (combo === 1) { hand.rotation.set(prog < 0.3 ? lerp(-1.0, -3.0, prog / 0.3) : lerp(-3.0, -0.3, Math.pow((prog - 0.3) / 0.7, 0.7)), 0, 0.12); sword.rotation.set(Math.PI - 0.3, 0, 0); FP.body.rotation.x = prog < 0.3 ? -0.08 : 0.16 * Math.sin((prog - 0.3) / 0.7 * Math.PI); }
        else if (combo === 2) { hand.rotation.set(-1.45, 0, lerp(1.35, -1.25, sp)); sword.rotation.set(Math.PI - 0.15, 0, 0); FP.body.rotation.y = lerp(0.5, -0.55, sp); }
        else { hand.rotation.set(-1.5, 0, 0.9); sword.rotation.set(Math.PI - 0.2, 0, 0); FP.body.rotation.y = -sp * Math.PI * 2; FP.body.position.y += Math.sin(prog * Math.PI) * 0.25; }
      }
      if (P.weapon === 'RAYGUN' && (P.fireCd > 0 || P.target) && !St.dialog) { gunArm.rotation.set(-1.48 - (P.recoil || 0) * 0.35, 0, -0.08); gun.rotation.set(1.43 - (P.recoil || 0) * 0.5, 0, 0); }
      P.recoil = damp(P.recoil || 0, 0, 14, dt);
      if (P.crit > 0) FP.bladeMat.emissiveIntensity = 2.8;
      sword.scale.setScalar(P.weapon === 'SWORD' || P.pose ? 0.8 : 0.72);
      flash.material.opacity = damp(flash.material.opacity, 0, 18, dt);
      fox.visible = !(P.inv > 0 && Math.floor(St.t * 20) % 2 === 0 && P.hurt <= 0);
    } else { fox.position.set(P.x, 0, P.z); fox.rotation.y = P.face; animFox(fox, dt, 0); }
    reticle.visible = !!P.target && (P.weapon === 'RAYGUN' || !!St.lock); reticle.material.opacity = St.lock ? 0.95 : 0.35; reticle.material.color.set(St.lock ? 0xec3013 : 0xffffff); if (P.target) { const f = P.target; reticle.position.set(f.x, f.y + (f.kind === 'drone' ? 0 : f.boss ? 2.4 : 1.2), f.z); reticle.scale.multiplyScalar(f.boss ? 2 : 1); reticle.lookAt(camera.position); reticle.scale.setScalar(1 + Math.sin(St.t * 8) * 0.06); }

    // bolts
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i]; b.life -= dt;
      if (b.target && !b.target.dead) { v4.set(b.target.x, b.target.y + (b.target.kind === 'drone' ? 0 : b.target.boss ? 2.4 : 1.2), b.target.z).sub(b.m.position).normalize(); b.v.lerp(v4.multiplyScalar(60), Math.min(1, dt * 8)); }
      b.m.position.addScaledVector(b.v, dt); b.m.lookAt(v4.copy(b.m.position).add(b.v));
      let hit = null; for (const f of alive()) { v4.set(f.x, f.y + (f.kind === 'drone' ? 0 : 1.1), f.z); if (f.boss) v4.y = 2.4; if (v4.distanceTo(b.m.position) < (f.kind === 'drone' ? 1.05 : f.boss ? 1.9 : 0.95)) { hit = f; break; } }
      if (hit) damageFoe(hit, DMG.RAYGUN, 'RAYGUN', P);
      if (hit || b.life < 0 || Math.hypot(b.m.position.x, b.m.position.z) > RING + 1) { if (!hit) burst(b.m.position, 4, 2); scene.remove(b.m); bolts.splice(i, 1); }
    }
    for (let i = beams.length - 1; i >= 0; i--) { const b = beams[i]; b.life -= dt; b.m.material.opacity = Math.max(0, b.life / 0.25) * (b.aim ? 0.5 : 0.95); if (b.life <= 0) { scene.remove(b.m); beams.splice(i, 1); } }

    // foes
    let commitAlive = St.committed >= 0 && foes[St.committed] && !foes[St.committed].dead;
    if (!commitAlive) St.committed = -1;
    if (fighting && St.phase === 'sword' && St.committed < 0) { St.commitCd -= dt; if (St.commitCd <= 0) { const cand = alive().filter(f => f.kind === 'robot' && !f.boss); if (cand.length) { cand.sort((a, b) => Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z)); const f = cand[Math.floor(rnd() * Math.min(2, cand.length))]; St.committed = foes.indexOf(f); f.mode = 'approach'; f.mt = 0; } } }
    for (const f of foes) {
      const m = f.m;
      if (f.dead) { f.dead += dt; m.g.position.y -= dt * (f.kind === 'drone' ? 6 : 0); m.g.rotation.z += dt * 4; m.g.scale.setScalar(Math.max(0.001, 1 - f.dead * 2.2)); if (f.dead > 0.5) m.g.visible = false; continue; }
      f.flash = Math.max(0, f.flash - dt); m.mats.forEach(mt => mt.emissive.setRGB(f.flash > 0 ? 1 : 0, f.flash > 0 ? 1 : 0, f.flash > 0 ? 1 : 0));
      if (f.kind === 'drone') {
        f.close = Math.max(0, f.close - dt * 0.35);
        if (fighting) f.a += f.dir * dt * 0.32;
        const R = f.R * (1 + f.close * 0.6); f.x = Math.sin(f.a) * R; f.z = Math.cos(f.a) * R; f.y = 2.4 + Math.sin(St.t * 2 + f.a) * 0.25;
        m.g.position.set(f.x, f.y, f.z); m.g.lookAt(P.x, P.y + 1.0, P.z); m.body.rotation.z = Math.sin(St.t * 3 + f.a) * 0.12;
        m.rotors.forEach(r => r.rotation.y += dt * 30);
        if (fighting) {
          if (f.aim > 0) { f.aim -= dt; if (f.aimLine) { f.aimLine.material.opacity = 0.25 + (1 - f.aim / 0.6) * 0.6; } if (f.aim <= 0) {
              if (f.aimLine) { scene.remove(f.aimLine); f.aimLine = null; }
              const from = f.aimFrom, to = f.aimTo, len = from.distanceTo(to);
              const bm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, len, 8, 1, true), beamMat.clone()); bm.position.copy(from).lerp(to, 0.5); bm.lookAt(to); bm.rotateX(Math.PI / 2); scene.add(bm); beams.push({ m: bm, life: 0.25 });
              audio.tone(700, 0.2, 0.05, 'sawtooth', 0.4);
              const ab = v4.subVectors(to, from), t = clamp(((P.x - from.x) * ab.x + (P.y + 1 - from.y) * ab.y + (P.z - from.z) * ab.z) / ab.lengthSq(), 0, 1);
              const cx = from.x + ab.x * t, cy = from.y + ab.y * t, cz = from.z + ab.z * t; if (Math.hypot(P.x - cx, P.y + 1 - cy, P.z - cz) < 0.75) hurtPlayer(6, f);
              f.cd = rr(2.2, 3.6);
            } }
          else { f.cd -= dt; if (f.cd < 0 && f.close < 0.4) { f.aim = 0.6; f.aimFrom.set(f.x, f.y, f.z); f.aimTo.set(P.x, P.y + 1.0, P.z).sub(f.aimFrom).multiplyScalar(1.6).add(f.aimFrom); f.aimTo.y = Math.max(0.05, f.aimTo.y); const len = f.aimFrom.distanceTo(f.aimTo); const al = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 6, 1, true), aimMat.clone()); al.position.copy(f.aimFrom).lerp(f.aimTo, 0.5); al.lookAt(f.aimTo); al.rotateX(Math.PI / 2); scene.add(al); f.aimLine = al; audio.tone(520, 0.08, 0.025, 'square'); } }
        }
      } else {
        if (f.boss) { bossUpdate(f, dt, fighting); continue; }
        const dxp = P.x - f.x, dzp = P.z - f.z, dp = Math.hypot(dxp, dzp) || 1, toP = Math.atan2(dxp, dzp);
        let tx = f.x, tz = f.z, sp = 0; f.mt += dt;
        if (fighting && f.stagger > 0) { f.stagger -= dt; f.guard = 0; }
        else if (fighting) {
          if (f.mode === 'circle') { const ang = toP + Math.PI + (f.slot - 1.5) * 0.9 + Math.sin(St.t * 0.3 + f.slot) * 0.4; tx = P.x + Math.sin(ang) * 4.6; tz = P.z + Math.cos(ang) * 4.6; sp = 2.2; f.guard = damp(f.guard, 1, 4, dt); }
          else if (f.mode === 'approach') { tx = P.x - dxp / dp * 1.7; tz = P.z - dzp / dp * 1.7; sp = 3.6; f.guard = 1; if (dp < 2.3 || f.mt > 3) { f.mode = 'windup'; f.mt = 0; audio.tone(260, 0.4, 0.04, 'sawtooth', 2.2); } }
          else if (f.mode === 'windup') { f.guard = 0; if (f.mt > 0.7) { f.mode = 'swing'; f.mt = 0; f.hitDone = false; f.kx += dxp / dp * 6; f.kz += dzp / dp * 6; sfxSwing(); } }
          else if (f.mode === 'swing') { f.guard = 0; if (!f.hitDone && f.mt > 0.1) { f.hitDone = true; const a2 = Math.atan2(Math.sin(toP - f.face), Math.cos(toP - f.face)); if (dp < 2.3 && Math.abs(a2) < 1.1 && P.y < 1) hurtPlayer(9, f); } if (f.mt > 0.3) { f.mode = 'recover'; f.mt = 0; } }
          else if (f.mode === 'recover') { f.guard = 0; if (f.mt > 0.8) { f.mode = 'circle'; f.mt = 0; St.committed = -1; St.commitCd = rr(0.6, 1.4); } }
        }
        const dx = tx - f.x, dz = tz - f.z, d = Math.hypot(dx, dz);
        if (d > 0.1 && sp) { const st = Math.min(d, sp * dt); f.x += dx / d * st; f.z += dz / d * st; f.walk += st * 3; }
        f.x += f.kx * dt; f.z += f.kz * dt; f.kx = damp(f.kx, 0, 6, dt); f.kz = damp(f.kz, 0, 6, dt);
        for (const o of alive()) { if (o === f || o.kind !== 'robot') continue; const ex = f.x - o.x, ez = f.z - o.z, ed = Math.hypot(ex, ez); if (ed < 1.3 && ed > 1e-3) { f.x += ex / ed * (1.3 - ed) * 0.5; f.z += ez / ed * (1.3 - ed) * 0.5; } }
        const rr2 = Math.hypot(f.x, f.z); if (rr2 > RING - 0.8) { f.x *= (RING - 0.8) / rr2; f.z *= (RING - 0.8) / rr2; }
        let df = toP - f.face; df = Math.atan2(Math.sin(df), Math.cos(df)); f.face += df * Math.min(1, dt * (f.mode === 'swing' ? 2 : 7));
        m.g.position.set(f.x, 0, f.z); m.g.rotation.y = f.face;
        const sw = Math.sin(f.walk) * 0.6; m.legs[0].rotation.x = sw; m.legs[1].rotation.x = -sw;
        m.armL.rotation.x = lerp(0, -1.35, f.guard); m.armL.rotation.y = lerp(0, 0.5, f.guard);
        const wind = f.mode === 'windup' ? smooth(0, 0.7, f.mt) : 0, sv = f.mode === 'swing' ? smooth(0, 0.2, f.mt) : 0;
        m.armR.rotation.x = f.mode === 'windup' ? -2.6 * wind : f.mode === 'swing' ? lerp(-2.6, -0.4, sv) : -0.4; m.armR.rotation.z = f.mode === 'swing' ? lerp(0, 1.1, sv) : 0;
        m.bladeMat.emissiveIntensity = f.mode === 'windup' ? 0.6 + wind * 2.4 * (0.7 + 0.3 * Math.sin(St.t * 40)) : 0.4;
        m.visorMat.color.set(f.mode === 'windup' || f.mode === 'swing' ? '#ff3b30' : '#5fe3ff'); m.visorMat.emissive.copy(m.visorMat.color);
        m.body.rotation.x = f.stagger > 0 ? -0.3 : f.mode === 'recover' ? 0.18 : 0;
        m.warn.material.opacity = f.mode === 'windup' ? 0.2 + wind * 0.55 : f.mode === 'swing' ? 0.75 : 0;
      }
    }
    updatePickups(dt); updateSweep(dt, fighting); updateWaves(dt); updateBurst(dt);
    G.styleT -= dt; if (G.styleT < 0) G.style = Math.max(0, G.style - dt * 7);
    // round over?
    if (fighting && foes.length && !alive().length && !St.roundEnding) {
      St.roundEnding = true; const kind = St.phase; St.lastRound = kind;
      St.splits = St.splits || {}; St.splits[kind] = St.roundT;
      setTimeout(() => { St.roundEnding = false; G.waves.forEach(w => { scene.remove(w.m); scene.remove(w.wall); }); G.waves = []; G.sweep = null; if (kind === 'laser') say(SCRIPT.toSword, () => startRound('sword')); else if (kind === 'sword') say(SCRIPT.toBoss, () => startRound('boss')); else { St.phase = 'won'; if (G.bossRef) { scene.remove(G.bossRef.tele); } say(SCRIPT.finish, () => { St.results = { win: true, time: St.totalT, splits: St.splits, score: G.score, rank: rankOf() }; }); } }, 900);
    }
    if (St.dialog) { const d = St.dialog, ln = d.lines[d.i]; d.chars = Math.min(ln.text.length, d.chars + dt * 48); king.userData.talking = !ln.you && d.chars < ln.text.length; fox.userData.talking = ln.you && d.chars < ln.text.length; }
    else { king.userData.talking = false; fox.userData.talking = false; }
    king.userData.mood = St.phase === 'won' ? 'excited' : St.dialog ? 'happy' : 'warm'; const kingSpeaking = St.dialog && !St.dialog.lines[St.dialog.i].you; king.userData.lookAt = kingSpeaking ? kingLook.copy(camera.position) : kingLook.set(P.x, 1.5, P.z); animFox(king, dt, 0);
    fox.userData.lookAt = St.dialog ? kingLook.set(0, 4.5, -(RING + 4.9)) : null;

    // fx
    for (let i = 0; i < sparkN; i++) { const s = sparkV[i]; if (s.life <= 0) continue; s.life -= dt; s.v.y -= 14 * dt; sparkArr[i * 3] += s.v.x * dt; sparkArr[i * 3 + 1] += s.v.y * dt; sparkArr[i * 3 + 2] += s.v.z * dt; if (s.life <= 0 || sparkArr[i * 3 + 1] < 0) { s.life = 0; sparkArr[i * 3 + 1] = -999; } }
    sparkGeo.attributes.position.needsUpdate = true;
    for (let i = popups.length - 1; i >= 0; i--) { const p = popups[i]; p.t += dt; p.s.position.y += dt * 1.2; p.s.material.opacity = 1 - smooth(0.5, 0.9, p.t); if (p.t > 0.9) { scene.remove(p.s); p.s.material.map.dispose(); popups.splice(i, 1); } }
    flames.forEach(f => f.f.scale.set(1, 1 + Math.sin(St.t * 12 + f.ph) * 0.15, 1));
    cheer = damp(cheer, fighting ? 0.35 : 0.2, 0.6, dt); if (Math.floor(St.t * 30) % 2 === 0) updateCrowd(St.t);
    if (audio.hum) audio.hum.gain.setTargetAtTime(0.03 + cheer * 0.09, audio.ctx.currentTime, 0.3);
    if (St.tip) { St.tip.t += dt; if (St.tip.t > St.tip.life) St.tip = null; }

    // camera
    if (play) {
      let tx = P.x, ty = 1.6, tz = P.z; if (St.lock && !St.dialog) { tx = lerp(P.x, St.lock.x, 0.3); tz = lerp(P.z, St.lock.z, 0.3); }
      const distK = St.lock ? (St.lock.boss ? 1.35 : 1.12) : 1;
      v3.set(tx + Math.sin(St.yaw) * Math.cos(St.pitch) * St.dist * distK, ty + Math.sin(St.pitch) * St.dist * distK + 0.6, tz + Math.cos(St.yaw) * Math.cos(St.pitch) * St.dist * distK);
      const cr = Math.hypot(v3.x, v3.z); if (cr > RING + 2 && !St.dialog) { v3.x *= (RING + 2) / cr; v3.z *= (RING + 2) / cr; v3.y = Math.max(v3.y, 3.5); }
      let lx = tx, ly = ty, lz = tz;
      let wantFov = 58, ck = 9;
      if (St.dialog) {
        const ln = St.dialog.lines[St.dialog.i], key = St.dialog.i + (ln.you ? 'y' : 'k');
        if (key !== St.shotKey) { St.shotKey = key; St.shotT = 0; St.shotSide = ln.you ? 0 : (St.shotSide === 1 ? -1 : 1); }
        St.shotT = (St.shotT || 0) + rdt; const t = St.shotT;
        const kx = 0, kz = -(RING + 4.2), dx = kx - P.x, dz = kz - P.z, dl = Math.hypot(dx, dz) || 1;
        if (!ln.you) {
          // CLOSE-UP ON THE KING: punch in, a gentle drift, alternating sides on each line
          const side = St.shotSide || 1, drift = Math.sin(t * 0.6) * 0.25;
          king.userData.P.head.getWorldPosition(camTmp); const HY = camTmp.y; lx = camTmp.x; ly = HY - 0.42; lz = camTmp.z;
          v3.set(camTmp.x + side * (1.1 + drift), HY + 0.1, camTmp.z + 4.2 - Math.min(t, 1.2) * 0.25);
          const punch = t < 0.18 ? lerp(58, 41, t / 0.18) : 44 + Math.sin(Math.min(1, (t - 0.18) / 0.35) * Math.PI) * -3;
          wantFov = punch; ck = t < 0.25 ? 14 : 5;
        } else {
          lx = lerp(P.x, kx, 0.35); ly = 2.6; lz = lerp(P.z, kz, 0.35);
          v3.set(P.x - dx / dl * 6.0 + (-dz / dl) * 1.6, 3.4, P.z - dz / dl * 6.0 + (dx / dl) * 1.6); wantFov = 46; ck = 6;
        }
        St.yaw = Math.atan2(-dx, -dz); St.wasTalking = 0.6;
      } else if (St.wasTalking > 0) { St.wasTalking -= rdt; ck = 6; St.shotKey = null; }
      camPos.x = damp(camPos.x, v3.x, ck, rdt); camPos.y = damp(camPos.y, v3.y, ck, rdt); camPos.z = damp(camPos.z, v3.z, ck, rdt);
      camLook.x = damp(camLook.x, lx, ck + 2, rdt); camLook.y = damp(camLook.y, ly, ck + 2, rdt); camLook.z = damp(camLook.z, lz, ck + 2, rdt);
      const nf = damp(camera.fov, wantFov, St.dialog ? 12 : 5, rdt); if (Math.abs(nf - camera.fov) > 0.01) { camera.fov = nf; camera.updateProjectionMatrix(); }
    } else { const a = St.t * 0.06 + 0.4; camPos.set(Math.sin(a) * 26, 13, Math.cos(a) * 26); camLook.set(0, 2, 0); }
    St.shake = Math.max(0, St.shake - rdt); const sh = St.dialog ? 0 : St.shake * 0.3;
    camera.position.set(camPos.x + rr(-sh, sh), camPos.y + rr(-sh, sh), camPos.z + rr(-sh, sh)); camera.lookAt(camLook); sky.position.copy(camera.position);

    hudT -= dt;
    if (hudT < 0) {
      hudT = 0.05; const d = St.dialog, ln = d && d.lines[d.i];
      const left = alive().length, round = St.phase === 'laser' ? 1 : St.phase === 'sword' ? 2 : St.phase === 'boss' || St.phase === 'won' ? 3 : 0;
      const hud = { phase: St.phase, round, roundName: St.phase === 'laser' ? 'The laser' : St.phase === 'sword' ? 'The sword' : St.phase === 'boss' ? 'The Warden' : St.phase === 'won' ? 'Champion' : 'Briefing',
        foeLabel: St.phase === 'laser' ? `Drones ${left} / 4` : St.phase === 'sword' ? `Robots ${left} / 4` : St.phase === 'boss' ? (G.bossRef && !G.bossRef.dead ? 'Iron Warden' : 'Finish them') : '',
        rank: rankOf(), locked: !!St.lock, style: Math.round(G.style % 20 * 5), styleOn: G.style > 1, score: G.score, super: Math.round(G.super), superReady: G.super >= 100,
        boss: St.phase === 'boss' && G.bossRef && !G.bossRef.dead ? { hp: Math.max(0, Math.round(G.bossRef.hp / G.bossRef.max * 100)), stunned: G.bossRef.mode === 'stunned' } : null,
        time: fmt(St.totalT), hp: Math.round(P.hp), en: Math.round(P.en), weapon: P.weapon, unlocked: P.unlocked.join(','), muted: St.muted,
        tip: St.tip && !d ? { text: St.tip.text, sub: St.tip.sub } : null,
        dialog: d ? { name: ln.name, role: ln.role, text: ln.text.slice(0, Math.floor(d.chars)), step: d.i + 1, total: d.lines.length, done: d.chars >= ln.text.length } : null,
        results: St.results };
      const k = JSON.stringify(hud); if (k !== hudKey) { hudKey = k; onState(hud); }
    }
  }
  const fmt = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}.${Math.floor((t % 1) * 10)}`;
  function frame() { raf = requestAnimationFrame(frame); try { update(Math.min(clock.getDelta(), 0.05)); } catch (e) { if (!frame.err) { frame.err = 1; console.error('arena update failed:', e && e.stack || e); } } renderer.render(scene, camera); }
  frame();

  const api = {
    start() { St.mode = 'play'; audio.init(); audio.setMuted(St.muted); crowdHum(); camPos.set(0, 6, 18); resetPlayer(); St.phase = 'briefing'; setTimeout(() => say(SCRIPT.intro, () => startRound('laser')), 700); },
    advance() { const d = St.dialog; if (!d) return; const L = d.lines[d.i].text.length; if (d.chars < L) { d.chars = L; return; } if (d.i < d.lines.length - 1) { d.i++; d.chars = 0; audio.blip(); return; } St.dialog = null; d.then && d.then(); },
    attack() {
      if (St.mode !== 'play' || St.dialog || !(St.phase === 'laser' || St.phase === 'sword' || St.phase === 'boss')) return;
      if (P.weapon === 'RAYGUN') {
        if (P.fireCd > 0) return; if (P.en < COST.RAYGUN) { audio.tone(160, 0.1, 0.04, 'square'); return; }
        P.en -= COST.RAYGUN; P.enT = 0.4; P.fireCd = 0.15; const t = St.lock || pickTarget(); if (t) P.face = Math.atan2(t.x - P.x, t.z - P.z);
        fox.updateMatrixWorld(true); muzzle.getWorldPosition(v3);
        const dir = t ? v4.set(t.x, t.y + (t.kind === 'drone' ? 0 : t.boss ? 2.4 : 1.2), t.z).sub(v3).normalize() : v4.set(Math.sin(P.face), 0.02, Math.cos(P.face));
        const m = new THREE.Mesh(boltGeo, boltMat); m.position.copy(v3); scene.add(m); m.add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x5fe3ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })));
        m.children[0].scale.set(0.9, 0.9, 0.9); bolts.push({ m, v: dir.clone().multiplyScalar(60), life: 1.2, target: t }); flash.material.opacity = 1; P.recoil = 1; sfxLaser();
      } else {
        if (P.swing > 0) { if (P.swing < P.swingDur * 0.65) St.attackQueued = true; return; }
        P.combo = P.comboT > 0 ? (P.combo % 3) + 1 : 1; P.comboT = 0.75; P.swingDur = P.combo === 3 ? 0.36 : 0.24; P.swing = P.swingDur; P.swingHit = new Set(); sfxSwing();
        const t = P.target || pickTarget(); if (t) { const d = Math.hypot(t.x - P.x, t.z - P.z); if (d < 6) { P.face = Math.atan2(t.x - P.x, t.z - P.z); if (d > 1.7) { P.ldx = Math.sin(P.face); P.ldz = Math.cos(P.face); P.lunge = 0; P.lungeT = 0.12; P.lsp = Math.min(30, (d - 1.5) / 0.12); } } }
      }
    },
    dodge() { if (St.mode !== 'play' || St.dialog || P.dashCd > 0 || P.dash > 0) return; let dx = P.vx, dz = P.vz; const l = Math.hypot(dx, dz); if (l < 0.5) { dx = Math.sin(P.face); dz = Math.cos(P.face); } else { dx /= l; dz /= l; } P.dx = dx; P.dz = dz; P.dash = 0.24; P.dashCd = 0.5; audio.burst(0.14, 1800, 0.1);
      let perfect = false; for (const f of alive()) { const d = Math.hypot(f.x - P.x, f.z - P.z); if (f.kind === 'robot' && ((f.mode === 'windup' && f.mt > 0.4) || f.mode === 'swing') && d < 3.2) perfect = true; if (f.kind === 'drone' && f.aim > 0 && f.aim < 0.3) perfect = true; }
      for (const w of G.waves) if (Math.abs(Math.hypot(P.x - w.x, P.z - w.z) - w.r) < 2) perfect = true; if (G.bossRef && !G.bossRef.dead && (G.bossRef.mode === 'slam' || (G.bossRef.mode === 'charge' && G.bossRef.mt > 0.6)) && Math.hypot(G.bossRef.x - P.x, G.bossRef.z - P.z) < 5) perfect = true;
      if (perfect) { addStyle(20); addSuper(15); St.slow = 0.5; P.crit = 2.2; P.en = 100; popup(v3.set(P.x, 2.6, P.z), 'PERFECT', '#5fe3ff'); audio.tone(900, 0.35, 0.05, 'sine', 2); cheer = 1; } },
    cycleTarget() { const list = alive().filter(f => Math.hypot(f.x - P.x, f.z - P.z) < 26).sort((a2, b) => Math.hypot(a2.x - P.x, a2.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z)); if (!list.length) { St.lock = null; return; } if (!St.lock) St.lock = pickTarget() || list[0]; else { const i = list.indexOf(St.lock); St.lock = list[(i + 1) % list.length]; } audio.tone(980, 0.06, 0.04, 'triangle'); },
    toggleLock() { if (St.lock) { St.lock = null; audio.tone(520, 0.06, 0.03, 'triangle'); } else api.cycleTarget(); },
    releaseLock() { St.lock = null; },
    jump() { input.jump = true; },
    swap() { const i = P.unlocked.indexOf(P.weapon); P.weapon = P.unlocked[(i + 1) % P.unlocked.length]; audio.blip(); },
    select(w) { if (P.unlocked.includes(w)) { P.weapon = w; audio.blip(); } },
    retry() { G.pickups.forEach(p => scene.remove(p.m)); G.pickups = []; G.waves.forEach(w => { scene.remove(w.m); scene.remove(w.wall); }); G.waves = []; G.sweep = null; if (G.bossRef) scene.remove(G.bossRef.tele); if (St.phase !== 'down') { G.score = 0; G.style = 0; G.super = 0; } St.results = null; bolts.forEach(b => scene.remove(b.m)); bolts.length = 0; foes.forEach(f => { if (f.aimLine) scene.remove(f.aimLine); }); resetPlayer(); St.dialog = null;
      if (St.phase === 'down') { St.phase = St.lastRound || 'laser'; startRound(St.phase); } else { St.totalT = 0; St.splits = {}; P.unlocked = ['RAYGUN']; St.phase = 'briefing'; say(SCRIPT.intro, () => startRound('laser')); } },
    toTown() { try { sessionStorage.setItem('meru.spawn', 'east'); } catch (e) {} onNavigate('Meru Town Square.dc.html'); },
    burst() { gateBurst(); },
    toggleSound() { St.muted = !St.muted; audio.init(); audio.setMuted(St.muted); },
    setOptions(o) { if (o.outlines != null) outlineMat.visible = !!o.outlines; if (o.followCam != null) opts.followCam = !!o.followCam; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur); audio.dispose(); renderer.dispose(); el.remove(); joyBase.remove(); joyKnob.remove(); },
  };
  return api;
}
