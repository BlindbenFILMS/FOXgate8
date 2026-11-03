// 8 GATES — RESTAURANT KIT. Shared pieces for every restaurant job (Meru Burgers is the reference; Luxor Deli, Jidda smoothie bar, Ur espresso, Zion bakery, Earth breakfast reuse it).
// Each shop keeps its OWN game file (stations, recipes, interior, orders) and imports these:
//   createStage(container, { bg })      → renderer, scene, camera, toon/M/addOutline, fox kit, audio + tone(), smoke puff(), sun
//   cameraFit(ST)                       → SAFE (free screen area), fitShot(points, el, yaw, margin), shotFor(key, pointsFn, …) cached per size
//   hintRings(ST)                       → the pulsing next-step rings: place(hint | null, t, dt)
//   registerKit(ST, REG, { open })      → register close-up: drawer, bill, change dish, live display, coin arcs (payProps / coinDrop / regDraw / bill())
//   dinerUniform(ST, fox, { print, stripe, towelCol, printSize, printY }) → paper hat + checked towel + a shirt print (pair with fox-kit outfit 'tee')
//   vegArt(ST)                          → whole veggies for the cutting station + the knife
// Change something here and every restaurant gets it. Shop-specific look goes in the options, never in this file.
import * as THREE from '../vendor/three/three.module.js';
import { rr, clamp, smooth, damp, pick, makeGradient, glowTexture, Ambience } from '../village-game.js';
import { crestTex, canvasTex } from './textures.js';   // same helpers meru-game.js re-exports; importing them here keeps every shop page light (no whole-Meru load)
import { foxKit } from '../fox-kit.js';

export function createStage(container, { bg = '#f2e8d8' } = {}) {
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CHh = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.75 : 2)); renderer.setSize(CW(), CHh());
  renderer.shadowMap.enabled = !touch; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(bg); const camera = new THREE.PerspectiveCamera(50, CW() / CHh(), 0.05, 80);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp }), audio = new Ambience();
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x8a6a5a, 1.15)); const sun = new THREE.DirectionalLight(0xfff0d8, 1.6); sun.position.set(3, 8, 6); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 }); scene.add(sun);
  const tone = (f, d, v, type = 'triangle') => { try { audio.tone(f, d, v, type); } catch (e) {} };
  const smokeS = []; for (let i = 0; i < 24; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); scene.add(s); smokeS.push({ s, life: 0, v: V3() }); } let smI = 0;
  const puff = (x, y, z, col = 0xffffff, n = 2) => { for (let i = 0; i < n; i++) { const p = smokeS[smI = (smI + 1) % smokeS.length]; p.s.position.set(x + rr(-0.05, 0.05), y, z + rr(-0.05, 0.05)); p.s.material.color.setHex(col); p.life = 1; p.v.set(rr(-0.05, 0.05), rr(0.3, 0.5), rr(-0.05, 0.05)); } };
  return { THREE, touch, CW, CHh, renderer, scene, camera, grad, glowTex, cache, V3, toon, outlineMat, addOutline, M, kit, audio, sun, tone, puff, smokeS, canvasTex };
}

export function cameraFit(ST) {
  const { camera, CW, CHh, V3 } = ST;
  const SAFE = { top: 0, bottom: 0, left: 0 }, fitCam = new THREE.PerspectiveCamera(50, 1, 0.05, 80), fitCache = new Map(), _p = V3();
  function fitShot(pts, el, yaw = 0, margin = 0.06) { const W = CW(), H = CHh(); fitCam.aspect = W / H; fitCam.fov = camera.fov; fitCam.updateProjectionMatrix();
    const yT = 1 - 2 * SAFE.top / H - margin * 1.2, yB = -1 + 2 * SAFE.bottom / H + margin * 1.2, xR = 1 - margin, xL = -1 + 2 * SAFE.left / W + margin, sx = (xL + xR) / 2, sy = (yT + yB) / 2;
    const dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), -Math.cos(yaw) * Math.cos(el)), c = V3(); pts.forEach(p => c.add(p)); c.multiplyScalar(1 / pts.length); const tgt = c.clone();
    const bounds = d => { fitCam.position.copy(tgt).addScaledVector(dir, d); fitCam.lookAt(tgt); fitCam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitCam); if (_p.z > 1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
    const fits = d => { const b = bounds(d); return b && b.x0 >= xL && b.x1 <= xR && b.y0 >= yB && b.y1 <= yT; };
    let d = 3; for (let it = 0; it < 4; it++) { let lo = 0.4, hi = 24; for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m; } d = hi; const b = bounds(d); if (!b) break;
      const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, th = Math.tan(fitCam.fov * Math.PI / 360) * d, right = V3().setFromMatrixColumn(fitCam.matrixWorld, 0), up = V3().setFromMatrixColumn(fitCam.matrixWorld, 1);
      tgt.addScaledVector(right, (cx - sx) * th * fitCam.aspect).addScaledVector(up, (cy - sy) * th); }
    return { pos: tgt.clone().addScaledVector(dir, d), look: tgt }; }
  function shotFor(key, ptsFn, el, yaw, margin) { const ck = key + '|' + CW() + 'x' + CHh() + '|' + SAFE.top + '|' + SAFE.bottom + '|' + SAFE.left; if (!fitCache.has(ck)) { if (fitCache.size > 60) fitCache.clear(); fitCache.set(ck, fitShot(ptsFn(), el, yaw, margin)); } return fitCache.get(ck); }
  return { SAFE, fitShot, shotFor, setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } } };
}

export function hintRings(ST) {
  const { scene, camera } = ST;
  const arrow = new THREE.Group(); { const am = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true }), om = new THREE.MeshBasicMaterial({ color: 0x201e1d, depthTest: false, side: THREE.BackSide, transparent: true });
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.2, 4), am); head.rotation.x = Math.PI; head.rotation.y = Math.PI / 4; head.position.y = 0.1; const ho = new THREE.Mesh(head.geometry, om); ho.scale.setScalar(1.28); head.add(ho);
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.16, 0.065), am); shaft.position.y = 0.27; const so = new THREE.Mesh(shaft.geometry, om); so.scale.set(1.5, 1.2, 1.5); shaft.add(so);
    arrow.add(head, shaft); arrow.traverse(m => m.renderOrder = m.material === om ? 30 : 31); arrow.visible = false; scene.add(arrow); }
  const pulse = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false })); pulse.renderOrder = 29; pulse.visible = false; scene.add(pulse);
  const pulse2 = pulse.clone(); pulse2.material = pulse.material.clone(); scene.add(pulse2);
  function place(h, hintT, dt) { arrow.visible = false; pulse.visible = pulse2.visible = !!h; if (!h) return;
    const d = camera.position.distanceTo(h.p), s = clamp(d * 0.2, 0.55, 2), bob = Math.sin(hintT * 5) * 0.05 * s; arrow.position.set(h.p.x, h.p.y + 0.32 * s + bob + (h.r > 0.3 ? 1.9 : 0.12), h.p.z); arrow.scale.setScalar(s); arrow.rotation.y += dt * 1.6;
    const k = (hintT * 1.2) % 1, k2 = (hintT * 1.2 + 0.5) % 1; pulse.position.set(h.p.x, h.p.y + 0.012, h.p.z); pulse2.position.copy(pulse.position); pulse.scale.setScalar(h.r * (0.8 + k * 0.7)); pulse2.scale.setScalar(h.r * (0.8 + k2 * 0.7)); pulse.material.opacity = 0.9 * (1 - k); pulse2.material.opacity = 0.9 * (1 - k2); }
  return { arrow, pulse, pulse2, place };
}

export function registerKit(ST, REG, { open = 'OPEN' } = {}) {
  const { scene, toon, addOutline, V3 } = ST;
  const regCv = document.createElement('canvas'); regCv.width = 256; regCv.height = 96; const regTex = new THREE.CanvasTexture(regCv); regTex.colorSpace = THREE.SRGBColorSpace;
  const regDisp = new THREE.Sprite(new THREE.SpriteMaterial({ map: regTex, depthTest: false })); regDisp.scale.set(0.46, 0.17, 1); regDisp.renderOrder = 24; regDisp.position.set(REG.x, REG.y + 0.42, REG.z - 0.05); scene.add(regDisp);
  const drawer = new THREE.Group(); { const d = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.07, 0.3), toon('#3a3836')); addOutline(d, 0.008); drawer.add(d); for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.24), toon(['#e6b45a', '#c9a24a', '#a8792e', '#86d44e'][i])); s.position.set(-0.14 + i * 0.093, 0.035, 0); drawer.add(s); } drawer.position.set(REG.x, REG.y + 0.04, REG.z - 0.05); scene.add(drawer); }
  function regDraw(P) { const c = regCv.getContext('2d'); c.fillStyle = '#0b2a14'; c.fillRect(0, 0, 256, 96); c.fillStyle = '#5cff8a'; c.font = '800 22px Archivo, monospace'; c.textBaseline = 'top'; if (!P) { c.fillText(open, 14, 36); } else { c.fillText('BILL ' + P.total + 'g   PAID ' + P.paid + 'g', 12, 10); c.font = '900 28px Archivo, monospace'; c.fillStyle = P.given === P.owed ? '#ffffff' : '#ffd23a'; c.fillText('CHANGE ' + P.given + ' / ' + P.owed + 'g', 12, 48); } regTex.needsUpdate = true; } regDraw(null);
  const billTex = v => canvasTex(160, 80, c => { c.fillStyle = '#86c98a'; c.fillRect(0, 0, 160, 80); c.strokeStyle = '#2f6d36'; c.lineWidth = 6; c.strokeRect(6, 6, 148, 68); c.fillStyle = '#2f6d36'; c.beginPath(); c.arc(80, 40, 22, 0, 7); c.fill(); c.fillStyle = '#e8f5e9'; c.font = '900 26px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('8', 80, 42); c.fillStyle = '#1a3d1e'; c.font = '900 22px Archivo, Arial'; c.fillText(v + 'g', 30, 24); c.fillText(v + 'g', 130, 58); });
  let billM = null; const coinsOut = []; const DISH = V3(REG.x + 0.4, REG.y, REG.z - 0.12);
  { const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.025, 20), toon('#d7dde3')); dish.position.set(DISH.x, DISH.y + 0.012, DISH.z); addOutline(dish, 0.006, 0.13); scene.add(dish); }
  function payProps(P) { if (billM) { scene.remove(billM); billM = null; } coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; if (!P) { regDraw(null); return; }
    billM = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), new THREE.MeshBasicMaterial({ map: billTex(P.paid) })); billM.rotation.set(-Math.PI / 2, 0, Math.PI + 0.25); billM.position.set(REG.x + 0.36, REG.y + 0.006, REG.z - 0.42); scene.add(billM); regDraw(P); }
  function coinDrop(v) { const r = v >= 10 ? 0.05 : v >= 5 ? 0.045 : v >= 2 ? 0.04 : 0.034, m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.012, 18), toon(v >= 5 ? '#e6b45a' : '#c9a24a')); addOutline(m, 0.004, r); const n = coinsOut.length; m.userData.target = V3(DISH.x + (n % 3 - 1) * 0.05, DISH.y + 0.03 + Math.floor(n / 3) * 0.013, DISH.z + ((n >> 1) % 2 - 0.5) * 0.04); m.userData.t = 0; m.position.set(drawer.position.x, drawer.position.y + 0.08, drawer.position.z); scene.add(m); coinsOut.push(m); }
  return { REG, DISH, regDisp, drawer, regDraw, billTex, coinsOut, payProps, coinDrop, bill: () => billM };
}

export function dinerUniform(ST, fox, { print, stripe = '#c42d3c', towelCol = '#c42d3c', printSize = 0.435, printY = 1.07 } = {}) {
  const { M, toon, grad } = ST, BP = fox.userData.P, hs = BP.head.scale.x || 1;
    const hat = new THREE.Group(); hat.position.set(0, BP.head.position.y + 0.27 * hs, 0.06); hat.scale.set(hs * 1.35, hs, hs); hat.rotation.x = 0.04; BP.body.add(hat);
    const prof = new THREE.Shape([new THREE.Vector2(-0.34, 0), new THREE.Vector2(0.34, 0), new THREE.Vector2(0.27, 0.17), new THREE.Vector2(0.06, 0.21), new THREE.Vector2(-0.27, 0.17)]);
    const hg = new THREE.ExtrudeGeometry(prof, { depth: 0.3, bevelEnabled: false }); hg.translate(0, 0, -0.15); hg.rotateY(Math.PI / 2); const hm = M(hg, toon('#fbfbf7'), 0, 0, 0, hat, 0.012); hm.scale.x = 0.95;
    M(new THREE.BoxGeometry(0.29, 0.035, 0.69), toon(stripe), 0, 0.055, 0, hat, 0); M(new THREE.BoxGeometry(0.004, 0.13, 0.5), toon('#e8e4da'), 0.146, 0.11, 0, hat, 0); M(new THREE.BoxGeometry(0.004, 0.13, 0.5), toon('#e8e4da'), -0.146, 0.11, 0, hat, 0);
    // checked towel over the left shoulder: front + back flaps
    const chk = canvasTex(64, 64, c => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#fbfbf7' : towelCol; c.fillRect(x * 16, y * 16, 16, 16); } }), towelM = new THREE.MeshToonMaterial({ map: chk, gradientMap: grad });
    const towel = new THREE.Group(); towel.position.set(0.36, 1.2, 0); BP.body.add(towel);
    M(new THREE.BoxGeometry(0.2, 0.03, 0.42), towelM, 0, 0.03, 0, towel, 0.008); const tf = M(new THREE.BoxGeometry(0.2, 0.4, 0.025), towelM, 0.02, -0.18, 0.21, towel, 0.008); tf.rotation.x = 0.1; const tb = M(new THREE.BoxGeometry(0.2, 0.32, 0.025), towelM, 0.02, -0.14, -0.21, towel, 0.008); tb.rotation.x = -0.1;
    for (const tz of [0.234, -0.234]) M(new THREE.BoxGeometry(0.2, 0.02, 0.012), toon('#fbfbf7'), 0.02, tz > 0 ? -0.37 : -0.29, tz, towel, 0);
    const pr = new THREE.Mesh(new THREE.PlaneGeometry(printSize, printSize), new THREE.MeshToonMaterial({ map: print, transparent: true, gradientMap: grad, depthTest: false })); pr.renderOrder = 20; pr.position.set(0, printY, 0.34); pr.rotation.x = -0.1; BP.body.add(pr);
  return { hat, towel, print: pr, parts: [hat, towel] };
}

export function vegArt(ST) {
  const { scene, toon, addOutline } = ST;
  function wholeVeg(k) { const g = new THREE.Group(), add = (geo, col, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, toon(col)); m.position.set(x, y, z); m.castShadow = true; addOutline(m, 0.01); g.add(m); return m; };
    if (k === 'tomato') { add(new THREE.SphereGeometry(0.11, 18, 14), '#d83a28', 0, 0.1).scale.y = 0.85; add(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 6), '#3f6b2a', 0, 0.2); for (let i = 0; i < 5; i++) add(new THREE.BoxGeometry(0.06, 0.006, 0.02), '#4f8a2a', Math.cos(i * 1.26) * 0.03, 0.19, Math.sin(i * 1.26) * 0.03).rotation.y = -i * 1.26; }
    else if (k === 'lettuce') { for (let i = 0; i < 6; i++) { const m = add(new THREE.SphereGeometry(0.14 - i * 0.012, 14, 10), i % 2 ? '#86d44e' : '#5aa83a', Math.cos(i * 2) * 0.02, 0.12 + i * 0.01, Math.sin(i * 2) * 0.02); m.scale.set(1, 0.8, 1); } }
    else if (k === 'onion') { add(new THREE.SphereGeometry(0.1, 16, 12), '#b35a8a', 0, 0.1); add(new THREE.ConeGeometry(0.03, 0.06, 8), '#e8c9e0', 0, 0.21); }
    else { const m = add(new THREE.CapsuleGeometry(0.05, 0.28, 4, 10), '#3f6b2a', 0, 0.06); m.rotation.z = Math.PI / 2; for (let i = 0; i < 8; i++) add(new THREE.SphereGeometry(0.01, 5, 4), '#6f9a3a', -0.14 + i * 0.04, 0.105, (i % 2 - 0.5) * 0.04); }
    return g; }
  const knife = (() => { const g = new THREE.Group(); const bl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.008, 0.07), toon('#d7dde3')); bl.position.x = 0.15; addOutline(bl, 0.005); g.add(bl); const h = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.04), toon('#201e1d')); h.position.x = -0.06; addOutline(h, 0.005); g.add(h); g.visible = false; scene.add(g); return g; })();
  return { wholeVeg, knife };
}
