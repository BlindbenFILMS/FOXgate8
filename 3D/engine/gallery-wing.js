// Blind Canvas gallery: honey-oak floors + the New Artists Wing (built from Ben's artist pages)
import * as THREE from '../vendor/three/three.module.js';
import { TEXMEM, lean } from './gallery-texmem.js';
import { makePlant } from './gallery-props.js';

// ------------------------------------------------------------ hardwood
export function makeWood({ size = 1024, planksAcross = 16, hue = 32, sat = 46, light = 45 } = {}) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const c = cv.getContext('2d');
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const ph = size / planksAcross;
  for (let r = 0; r < planksAcross; r++) {
    let x = -rnd() * size * 0.4;
    while (x < size) {
      const len = size * (0.22 + rnd() * 0.32);
      const L = light + (rnd() - 0.5) * 12, S = sat + (rnd() - 0.5) * 12, Hh = hue + (rnd() - 0.5) * 6;
      const draw = ox => {
        const y = r * ph;
        const g = c.createLinearGradient(0, y, 0, y + ph); g.addColorStop(0, `hsl(${Hh},${S}%,${L + 3}%)`); g.addColorStop(1, `hsl(${Hh},${S}%,${L - 4}%)`);
        c.fillStyle = g; c.fillRect(x + ox, y, len, ph);
        // grain: long wavy streaks
        c.save(); c.beginPath(); c.rect(x + ox, y, len, ph); c.clip();
        for (let k = 0; k < 26; k++) {
          const gy = y + rnd() * ph, amp = 0.6 + rnd() * 2.2, fr = 0.004 + rnd() * 0.01, dark = rnd() < 0.7;
          c.strokeStyle = dark ? `hsla(${Hh - 4},${S + 8}%,${L - 22}%,${0.08 + rnd() * 0.14})` : `hsla(${Hh + 4},${S}%,${L + 14}%,${0.06 + rnd() * 0.08})`;
          c.lineWidth = 0.6 + rnd() * 1.6; c.beginPath();
          for (let t = 0; t <= len; t += 8) { const px = x + ox + t, py = gy + Math.sin(t * fr + k) * amp; t ? c.lineTo(px, py) : c.moveTo(px, py); }
          c.stroke();
        }
        if (rnd() < 0.18) { const kx = x + ox + len * (0.2 + rnd() * 0.6), ky = y + ph * (0.3 + rnd() * 0.4); for (let q = 4; q > 0; q--) { c.strokeStyle = `hsla(${Hh - 6},${S + 10}%,${L - 26}%,${0.12})`; c.lineWidth = 1.2; c.beginPath(); c.ellipse(kx, ky, q * 4, q * 1.8, 0, 0, Math.PI * 2); c.stroke(); } }
        c.restore();
        // seams
        c.fillStyle = `hsla(${Hh},40%,${L - 34}%,0.85)`; c.fillRect(x + ox, y, len, 1.5); c.fillRect(x + ox, y, 1.5, ph);
      };
      draw(0); if (x + len > size) draw(-size); if (x < 0) draw(size);
      x += len;
    }
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.generateMipmaps = true;
  return t;
}
// Lambert material: any upward-facing surface takes the planks, in world space (4 m per tile)
export function woodify(mat, wood, metresPerTile = 4, walls = false) {
  mat.onBeforeCompile = sh => {
    sh.uniforms.uWood = { value: wood }; sh.uniforms.uWoodK = { value: 1 / metresPerTile }; sh.uniforms.uWoodDim = { value: mat.userData.dimK ?? 1 };   // (28 Oct: a dimmed room's planks)
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <project_vertex>', `#include <project_vertex>
      #ifdef USE_INSTANCING
        mat4 wm = modelMatrix * instanceMatrix;
      #else
        mat4 wm = modelMatrix;
      #endif
      vWP = (wm * vec4(transformed, 1.0)).xyz; vWN = normalize(mat3(wm) * objectNormal);`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform sampler2D uWood; uniform float uWoodK; uniform float uWoodDim;')
      .replace('#include <map_fragment>', `#include <map_fragment>
      if (vWN.y > 0.9 && min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b)) > 0.72) { diffuseColor.rgb = texture2D(uWood, vWP.xz * uWoodK).rgb * uWoodDim;
        // (Ben, 28 Oct) Meditate with Morten is an outdoor garden: warm slate pavers in running bond with mossy joints, not hardwood
        if (vWP.x < -246.4 && vWP.x > -266.5 && vWP.z > -6.7 && vWP.z < 34.5 && vWP.y < -3.0) {
          vec2 q = vWP.xz / vec2(1.2, 0.8); float row = floor(q.y); q.x += mod(row, 2.0) * 0.5; vec2 f = fract(q), id = floor(q);
          float h = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453), e = min(min(f.x, 1.0 - f.x) * 1.2, min(f.y, 1.0 - f.y) * 0.8);
          vec3 st = mix(vec3(0.15, 0.14, 0.125), vec3(0.24, 0.225, 0.2), h) * (0.93 + 0.07 * sin(vWP.x * 6.3 + h * 9.0) * sin(vWP.z * 4.1));
          diffuseColor.rgb = mix(vec3(0.05, 0.08, 0.035), st, smoothstep(0.012, 0.03, e));
        } }${walls ? `
      else if (abs(vWN.y) < 0.35) { float mx = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b)), mn = min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b));
        if (mx - mn < 0.035 && mx > 0.03 && mx < 0.4) diffuseColor.rgb = vec3(0.835, 0.827, 0.81); }
      // (Ben, 28 Oct) the curved hall round the music room + the music room: not one flat white. Hall walls a warm limestone that
      // darkens toward the floor (grounds the blocks), an ink skirting and an ink line at 4.3 m that runs on round the ring with the
      // glazing's transoms; the music room's black drum turns deep Ora navy, lighter as it rises.
      if (abs(vWN.y) < 0.35 && vWP.x < -177.4 && length(vWP.xz - vec2(-210.0, 0.0)) < 41.0 && vWP.y > -3.6 && vWP.y < 17.0) {
        float hh = vWP.y + 3.34, mx2 = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b)), gr = mix(0.66, 1.0, smoothstep(0.0, 5.0, hh));
        if (mx2 < 0.03) diffuseColor.rgb = vec3(0.010, 0.016, 0.052) * mix(0.8, 1.7, smoothstep(0.0, 12.0, hh));
        else if (mx2 > 0.5) diffuseColor.rgb = vec3(0.80, 0.73, 0.64) * gr;
        if (hh < 0.16 || abs(hh - 7.64) < 0.07) diffuseColor.rgb = vec3(0.012, 0.011, 0.011);
      }
      // (Ben, 28 Oct) MAIN GALLERY tones (ground floor, x -145.5..-66, |z| < 23): long walls a soft warm limestone that
      // lets the art lead; the END walls (facing along the hall) a deep Ora navy, lighter as they rise; an ink skirting all round
      if (abs(vWN.y) < 0.35 && vWP.x > -145.5 && vWP.x < -66.0 && abs(vWP.z) < 23.0 && vWP.y > -3.6 && vWP.y < 5.4) {
        float hh = vWP.y + 3.34, mx4 = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b));
        if (mx4 > 0.5) diffuseColor.rgb = abs(vWN.x) > 0.7 ? vec3(0.018, 0.03, 0.085) * mix(0.85, 1.35, smoothstep(0.0, 8.0, hh)) : vec3(0.80, 0.765, 0.70);
        if (hh < 0.16) diffuseColor.rgb = vec3(0.012, 0.011, 0.011);
      }
      // (Ben, 28 Oct) Meditate with Morten: soft sage walls, darker toward the floor, warm charcoal for the black pieces, ink skirting
      if (abs(vWN.y) < 0.35 && vWP.x < -246.4 && vWP.x > -267.0 && vWP.z > -7.2 && vWP.z < 35.0 && vWP.y < 9.0) {
        float hh = vWP.y + 3.34, mx3 = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b));
        if (mx3 < 0.03) diffuseColor.rgb = vec3(0.030, 0.028, 0.022);
        else if (mx3 > 0.5) diffuseColor.rgb = vec3(0.50, 0.55, 0.45) * mix(0.72, 1.0, smoothstep(0.0, 4.0, hh));
        if (hh < 0.16) diffuseColor.rgb = vec3(0.012, 0.011, 0.011);
      }` : ''}`);
  };
  mat.customProgramCacheKey = () => walls ? 'woodify-walls' : 'woodify';
  mat.needsUpdate = true;
  return mat;
}
// candidates: untextured or palette-textured (gltf-transform packs flat colours into tiny palette strips); the shader then only swaps WHITE, upward-facing pixels
// New Wing palette pass for the original building: grey walls go gallery white (linear 0.835 ~ #eceae6), white floors go oak
export const isPaletteMat = m => !m.transparent && m.color && (!m.map || (m.map.image && m.map.image.height <= 8));
export const isWhiteFloorMat = m => !m.transparent && m.color && m.color.r > 0.78 && m.color.g > 0.78 && m.color.b > 0.78 && (!m.map || (m.map.image && m.map.image.height <= 8));

// ------------------------------------------------------------ canvas text
function wrap(ctx, text, maxW) { const out = []; for (const para of String(text).split('\n')) { let line = ''; for (const w of para.split(/\s+/)) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } out.push(line); } return out; }
function panelTex(w, h, draw) { const k = TEXMEM.scale, cv = document.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(h * k); const c = cv.getContext('2d'); c.scale(k, k); draw(c, w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return lean(t); }   // (drawn at w x h, stored smaller on phones; let go after upload)
const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';

// ------------------------------------------------------------ the wing
// Laid out along -x from its origin O (entrance), floor at O.y. Returns meshes for collision, art entries and doors.
export function buildWing({ dim = 1, scene, wing, O, rotY = 0, doorW = 0, wood, resolveImg, L = 66, title = null, logo = null, spacious = false, endVideo = null, floorLogo = null, fillLogo = null, doorSign = 'NEW ARTISTS WING', videoKicker = 'BLINDNESS · AN INTERVIEW WITH', bayW: bayWIn = 0, Wd: WdIn = 0, lip = 1, frontWall = true, doorZ = 0, sideDoor = null, hang = null, titleY = 3.0, community = null, frontWins = null }) {
  const g = new THREE.Group(); g.position.copy(O); g.rotation.y = rotY; scene.add(g); g.updateMatrixWorld(true);
  // local layout -> world (the wing can be turned to join any doorway of the building)
  const toW = v => v.clone().applyMatrix4(g.matrixWorld), dirW = v => v.clone().applyQuaternion(g.quaternion);
  const boxW = (a, b) => new THREE.Box3().setFromPoints([0, 1, 2, 3, 4, 5, 6, 7].map(i => toW(new THREE.Vector3(i & 1 ? a.x : b.x, i & 2 ? a.y : b.y, i & 4 ? a.z : b.z))));
  const Wd = WdIn || (spacious ? 22 : 18), Hh = spacious ? 7 : 6.4, HW = Wd / 2;
  const T = title || { kicker: 'THE BLIND CANVAS PROJECT', lines: ['New Artists', 'Wing'], sub: wing.artists.map(a => a.name).join(' · ') };
  const col = [], arts = [], loaders = [], canvases = [], artTex = [];
  const wallM = new THREE.MeshLambertMaterial({ color: 0xeceae6 });
  const greyM = new THREE.MeshLambertMaterial({ color: 0x55585e });
  const inkM = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
  const floorM = woodify(new THREE.MeshLambertMaterial({ color: 0xffffff }), wood);
  const ceilM = new THREE.MeshLambertMaterial({ color: 0xf6f5f3 });
  const lightM = new THREE.MeshBasicMaterial({ color: 0xfff6e2 });
  // (28 Oct) dim: a room with its house lights down (the AMB, so its stage lights shine): walls, floor and ceiling darker, the
  // ceiling strips a low glow. The art faces and cards are unlit materials, so they stay bright, like a gallery at a concert.
  if (dim < 1) { for (const m of [wallM, greyM, ceilM]) m.color.multiplyScalar(dim); floorM.userData.dimK = 0.45 + dim * 0.5; floorM.needsUpdate = true; lightM.color.multiplyScalar(0.55 + dim * 0.3); }
  const box = (w, h, d, m, x, y, z, collide = true) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); if (collide) col.push(b); return b; };
  // shell
  // (lip: how far the floor and ceiling run out past the front wall; a room that opens off another room's side has none,
  //  so the two floors don't overlap and flicker)
  box(L + 1 + lip, 0.4, Wd + 2, floorM, -(L + 1 - lip) / 2, -0.2, 0);
  box(L + 1 + lip, 0.3, Wd + 2, ceilM, -(L + 1 - lip) / 2, Hh + 0.15, 0);
  if (!frontWall) {}   // (the front is the other room's wall, with the doorway in it: see sideDoor)
  else if (doorW > 0 && doorZ) {   // an entrance off to one side of the front wall
    const a = doorZ - doorW / 2, b = doorZ + doorW / 2, DH = 3.6;
    box(0.4, Hh, a + HW, wallM, 0.2, Hh / 2, (-HW + a) / 2); box(0.4, Hh, HW - b, wallM, 0.2, Hh / 2, (b + HW) / 2); box(0.4, Hh - DH, doorW, wallM, 0.2, DH + (Hh - DH) / 2, doorZ);
  } else if (doorW > 0) {   // open entrance: walk straight in from the building's hallway
    const side = (Wd - doorW) / 2, lintel = 5.0;
    // (28 Oct, Ben) frontWins: real see-through windows in the front wall, [zc, w, y0, y1] in the wing's own frame; each hole gets
    // an unseen blocker (solid; the speed-saver rays see past it) and the glass + frames come from the caller (gallery-amb.js)
    const sideWall = (za, zb) => { let cur = za;
      for (const [zc, ww, y0, y1] of (frontWins || []).filter(h => h[0] > za && h[0] < zb).sort((p, q) => p[0] - q[0])) {
        const h0 = zc - ww / 2, h1 = zc + ww / 2;
        box(0.4, Hh, h0 - cur, wallM, 0.2, Hh / 2, (cur + h0) / 2); box(0.4, y0, ww, wallM, 0.2, y0 / 2, zc); box(0.4, Hh - y1, ww, wallM, 0.2, (y1 + Hh) / 2, zc);
        const bl = box(0.4, y1 - y0, ww, null, 0.2, (y0 + y1) / 2, zc); bl.visible = false; bl.userData.see = true; cur = h1; }
      box(0.4, Hh, zb - cur, wallM, 0.2, Hh / 2, (cur + zb) / 2); };
    sideWall(-HW, -doorW / 2); sideWall(doorW / 2, HW);
    box(0.4, Hh - lintel, doorW, wallM, 0.2, lintel + (Hh - lintel) / 2, 0);
    const sg = panelTex(1024, 128, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 10, h); c.fillStyle = '#fff'; let fs = 64; c.font = `800 ${fs}px ${FONT}`; while (c.measureText(doorSign).width > w - 70 && fs > 30) { fs -= 2; c.font = `800 ${fs}px ${FONT}`; } c.textBaseline = 'middle'; c.fillText(doorSign, 40, 66); });   // shrink to fit: the whole name always shows
    for (const r of [0, Math.PI]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(doorW - 0.4, 1.0), new THREE.MeshBasicMaterial({ map: sg })); m.position.set(r ? 0.45 : -0.05, lintel + 0.6, 0); m.rotation.y = r ? Math.PI / 2 : -Math.PI / 2; g.add(m); }
    // the threshold: an ink portal with a red inner edge, and a dark band across the floor, so you feel the room begin
    const redM = new THREE.MeshBasicMaterial({ color: 0xec3013 });
    for (const sz of [-1, 1]) { box(0.7, lintel, 0.28, inkM, 0.2, lintel / 2, sz * (doorW / 2 + 0.14), false); box(0.72, lintel, 0.05, redM, 0.2, lintel / 2, sz * (doorW / 2 - 0.02), false); }
    box(0.7, 0.32, doorW + 0.56, inkM, 0.2, lintel + 0.16, 0, false); box(0.72, 0.05, doorW, redM, 0.2, lintel - 0.02, 0, false);
    box(1.4, 0.02, doorW, inkM, -0.5, 0.012, 0, false);
    for (const sz of [-1, 1]) { const pl = makePlant(2.2); pl.group.position.set(-1.6, 0, sz * (HW - 1.0)); g.add(pl.group); const cb = new THREE.Mesh(new THREE.BoxGeometry(...pl.size)); cb.position.set(-1.6, 0.8, sz * (HW - 1.0)); cb.visible = false; g.add(cb); col.push(cb); }   // a plant either side, just inside
  } else box(0.4, Hh, Wd, wallM, 0.2, Hh / 2, 0);
  box(0.4, Hh, Wd, wallM, -L - 0.2, Hh / 2, 0);
  // the side walls (one may have a doorway through to another room: sideDoor { side: -1 | 1, x: its centre, w, h, sign, backSign })
  for (const sd of [-1, 1]) {
    const zc = sd * (HW + 0.2), zb = sd * (HW - 0.03);
    if (sideDoor && sideDoor.side === sd) {
      const D = sideDoor, DH = D.h || 3.6, x1 = D.x + D.w / 2, x0 = D.x - D.w / 2;   // (x1 nearer the front)
      box(-x1, Hh, 0.4, wallM, x1 / 2, Hh / 2, zc); box(L + x0, Hh, 0.4, wallM, (x0 - L) / 2, Hh / 2, zc); box(D.w, Hh - DH, 0.4, wallM, D.x, DH + (Hh - DH) / 2, zc);
      box(-x1, 0.18, 0.06, inkM, x1 / 2, 0.09, zb, false); box(L + x0, 0.18, 0.06, inkM, (x0 - L) / 2, 0.09, zb, false);
      // the gallery's doorway: an ink portal (right through the wall) with the red inner edge, and a sign over it on both sides
      const redM = new THREE.MeshBasicMaterial({ color: 0xec3013 });
      for (const sx of [-1, 1]) { box(0.28, DH, 0.7, inkM, D.x + sx * (D.w / 2 + 0.14), DH / 2, zc, false); box(0.05, DH, 0.72, redM, D.x + sx * (D.w / 2 - 0.02), DH / 2, zc, false); }
      box(D.w + 0.56, 0.28, 0.7, inkM, D.x, DH + 0.14, zc, false); box(D.w, 0.05, 0.72, redM, D.x, DH - 0.02, zc, false);
      for (const [face, text] of [[-sd, D.sign], [sd, D.backSign]]) { if (!text) continue;
        const st = panelTex(1024, 200, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 10, h); c.fillStyle = '#fff'; let fs = 70; c.font = `800 ${fs}px ${FONT}`; while (c.measureText(text).width > w - 80 && fs > 30) { fs -= 2; c.font = `800 ${fs}px ${FONT}`; } c.textBaseline = 'middle'; c.fillText(text, 40, h / 2 + 4); });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(D.w + 1.4, (D.w + 1.4) * 200 / 1024), new THREE.MeshBasicMaterial({ map: st })); m.position.set(D.x, DH + 0.75, zc + face * 0.37); m.rotation.y = face < 0 ? Math.PI : 0; g.add(m); }
    } else { box(L, Hh, 0.4, wallM, -L / 2, Hh / 2, zc); box(L, 0.18, 0.06, inkM, -L / 2, 0.09, zb, false); }
  }
  // a red accent line (the Modernist rule)
  box(L, 0.05, 0.03, new THREE.MeshBasicMaterial({ color: 0xec3013 }), -L / 2, 4.9, -HW + 0.02, false); box(L, 0.05, 0.03, new THREE.MeshBasicMaterial({ color: 0xec3013 }), -L / 2, 4.9, HW - 0.02, false);
  // ceiling light strips + bench seats down the middle
  for (let x = -5; x > -L; x -= 7.5) { box(5.5, 0.06, 0.5, lightM, x, Hh - 0.02, -4, false); box(5.5, 0.06, 0.5, lightM, x, Hh - 0.02, 4, false); }
  if (!spacious) for (let x = -16; x > -L + 6; x -= 15) { box(3.2, 0.45, 0.9, greyM, x, 0.225, 0); }
  // (no lights here: ambient + hemisphere light the rooms; even a 0-intensity point light costs every surface in the gallery)

  // a logo on an ink panel (wall or floor); the image loads with the room
  const logoPanel = (LW, LH, img) => {
    const lm = new THREE.MeshBasicMaterial({ color: 0x1d1c1b });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(LW, LH), lm);
    loaders.push(() => { const im = new Image(); im.onload = () => {
      const t = panelTex(Math.round(Math.min(2048, LW * 160)), Math.round(Math.min(2048, LW * 160) * LH / LW), (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, Math.max(6, h * 0.02));
        const k = Math.min((w * 0.88) / im.width, (h * 0.8) / im.height), iw = im.width * k, ih = im.height * k; c.drawImage(im, (w - iw) / 2, (h - ih) / 2 + 4, iw, ih); });
      lm.map = t; lm.color.set(0xffffff); lm.needsUpdate = true; }; im.src = resolveImg(img); });
    return m;
  };
  const screens = [];
  if (endVideo) {   // the far wall is one big screen: an ink wall with the film filling it
    box(0.06, Hh - 0.2, Wd - 0.4, inkM, -L + 0.05, Hh / 2, 0, false);
    const VH = Hh - 0.7, VW = Math.min(Wd - 1.2, VH * 16 / 9);
    const posterMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    if (endVideo.poster) new THREE.TextureLoader().load(resolveImg(endVideo.poster), t => { t.colorSpace = THREE.SRGBColorSpace; posterMat.map = t; posterMat.color.set(0xffffff); posterMat.needsUpdate = true; });
    const dark = new THREE.MeshBasicMaterial({ color: 0x151515 });
    const scr = new THREE.Mesh(new THREE.BoxGeometry(0.08, VH, VW), [posterMat, dark, dark, dark, dark, dark]); scr.position.set(-L + 0.12, Hh / 2 + 0.05, 0); g.add(scr);
    screens.push({ u: endVideo.url, local: endVideo.url, box: scr, faces: [0], posterMat, vol: 0.85, dist: L + 6, reach: endVideo.reach, minVol: endVideo.minVol,
      zones: (endVideo.extraZones || []).map(z => new THREE.Box3(new THREE.Vector3(...z[0]), new THREE.Vector3(...z[1]))), zoneGains: (endVideo.extraZones || []).map(z => z[2] ?? 1),   // world boxes outside the room where the film still plays (and is heard, fading with distance)
      p: toW(scr.position.clone()).toArray(),
      zone: boxW(new THREE.Vector3(-L, -1, -HW), new THREE.Vector3(0.5, 6, HW)) });
  } else {
  // title wall at the far end (with a logo: the title on the left, the logo large on the right)
  const TW = logo ? 7.2 : 9.6, TPX = Math.round(TW / 4.2 * 700);
  const titleT = panelTex(TPX, 700, (c, w, h) => {
    c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ec3013'; c.fillRect(70, 70, 16, h - 140);
    c.fillStyle = '#ff9783'; c.font = `800 46px ${FONT}`; c.fillText(T.kicker, 130, 140);
    const lines = T.lines.slice(0, 3); let fs = lines.length > 2 ? 118 : T.lines.some(l => l.length > 11) ? 112 : 150;
    c.font = `800 ${fs}px ${FONT}`; while (fs > 60 && lines.some(l => c.measureText(l).width > w - 190)) { fs -= 4; c.font = `800 ${fs}px ${FONT}`; }
    const lh = fs * 1.0, y0 = lines.length > 2 ? 250 : 300;
    c.fillStyle = '#f3f2f2'; lines.forEach((l, i) => c.fillText(l, 124, y0 + i * lh));
    c.font = `500 ${lines.length > 2 ? 34 : 40}px ${FONT}`; c.fillStyle = '#cfcaca';
    wrap(c, T.sub || '', w - 220).slice(0, 2).forEach((l, i) => c.fillText(l, 130, (lines.length > 2 ? 590 : 560) + i * 46));
  });
  const tp = new THREE.Mesh(new THREE.PlaneGeometry(TW, 4.2), new THREE.MeshBasicMaterial({ map: titleT })); tp.position.set(-L + 0.02, titleY, logo ? -HW + 0.6 + TW / 2 : 0); tp.rotation.y = Math.PI / 2; g.add(tp);
  if (logo) {   // the partner's logo, large, on an ink panel
    const LW = Wd - 1.2 - TW - 0.5, LH = 4.2;
    const lm = new THREE.MeshBasicMaterial({ color: 0x1d1c1b });
    const lp = new THREE.Mesh(new THREE.PlaneGeometry(LW, LH), lm); lp.position.set(-L + 0.02, titleY, HW - 0.6 - LW / 2); lp.rotation.y = Math.PI / 2; g.add(lp);
    loaders.push(() => { const img = new Image(); img.onload = () => {
      const t = panelTex(Math.round(LW * 160), Math.round(LH * 160), (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 10);
        const k = Math.min((w * 0.88) / img.width, (h * 0.8) / img.height), iw = img.width * k, ih = img.height * k; c.drawImage(img, (w - iw) / 2, (h - ih) / 2 + 5, iw, ih); });
      lm.map = t; lm.color.set(0xffffff); lm.needsUpdate = true; }; img.src = resolveImg(logo); });
  }

  }
  // bays: left wall (z=-HW, facing +z) then right wall (z=+HW, facing -z)
  // spacious: 30 m bays, each piece gets its own stretch of wall with a description card beside it
  const bayW = bayWIn || (spacious ? 30 : 15), x0 = spacious ? -17 : -8.5, slots = [];   // (bayW: a tighter room can pack its bays closer)
  const nb = Math.max(1, Math.floor((L - 4) / bayW));
  for (let i = 0; i < nb; i++) slots.push({ x: x0 - i * bayW, side: -1 });
  for (let i = 0; i < nb; i++) slots.push({ x: x0 - i * bayW, side: 1 });
  if (spacious) for (let i = 0; i < nb; i++) for (const dx of [-9, 9]) box(3.2, 0.45, 0.9, greyM, x0 - i * bayW + dx, 0.225, 0);   // benches either side of each totem
  // interview totems: one per pair of bays, the -z face for the left artist, +z for the right
  const totems = {};
  const totemAt = x => {
    if (totems[x]) return totems[x];
    const dark = new THREE.MeshBasicMaterial({ color: 0x151515 });
    const tv = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.03, 0.14), [dark, dark, dark, dark, dark, dark]); tv.position.set(x, 2.35, 0); g.add(tv); col.push(tv);
    box(0.25, 1.4, 0.25, inkM, x, 0.7, 0); box(1.4, 0.08, 0.8, inkM, x, 0.04, 0);
    return (totems[x] = tv);
  };
  // eye-level layout (22 Oct): each wall run is hung in order from its start deeper into the room: the bio board, then each
  // canvas with its description card beside it at eye level (hang: [{ side, x, a: artist index, items: ['bio', 0, 1, 2] }])
  if (hang) for (const H of hang) {
    const A = wing.artists[H.a]; if (!A) continue;
    const side = H.side, zf = side * (HW - 0.05), rotYp = side < 0 ? 0 : Math.PI, n = new THREE.Vector3(0, 0, -side); let x = H.x;
    const at = (lx, y, dz = 0) => new THREE.Vector3(lx, y, zf - side * dz);
    for (const it of H.items) {
      if (it && it.gap) { x -= it.gap; continue; }   // (room left for a doorway)
      if (it === 'bio') {
        const bioT = panelTex(900, 1100, (c, w, h) => {
          c.fillStyle = '#3d4046'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 14);
          c.fillStyle = '#ff9783'; c.font = `800 30px ${FONT}`; c.fillText('ARTIST', 60, 92);
          c.fillStyle = '#ffffff'; c.font = `800 74px ${FONT}`; let y = 180; wrap(c, A.name.toUpperCase(), w - 120).forEach(l => { c.fillText(l, 60, y); y += 78; });
          c.font = `600 30px ${FONT}`; c.fillStyle = '#e9e5e5'; for (const sub of A.sub) { wrap(c, sub, w - 120).forEach(l => { c.fillText(l, 60, y); y += 38; }); }
          y += 18; c.fillStyle = '#ec3013'; c.fillRect(60, y, 120, 6); y += 50;
          c.font = `400 31px ${FONT}`; c.fillStyle = '#f3f2f2';
          for (const p of A.bio) { for (const l of wrap(c, p, w - 120)) { if (y > h - 70) break; c.fillText(l, 60, y); y += 41; } y += 14; }
        });
        const bio = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.67), new THREE.MeshBasicMaterial({ map: bioT }));
        bio.position.copy(at(x - 1.5, 2.2, 0.03)); bio.rotation.y = rotYp; g.add(bio);
        arts.push({ title: A.name, desc: [...A.sub, ...A.bio].join(' / '), imgDesc: '', img: A.photo ? resolveImg(A.photo) : null, ctr: toW(bio.position), n: dirW(n), artist: A.name, au: A.au || null, bio: true });
        x -= 3.0 + 1.0; continue;
      }
      const p = A.pieces[it]; if (!p) continue;
      const S = 2.6, CW = 2.7, CH = 2.0, K = 300, cx = x - S / 2;
      const faceM = new THREE.MeshBasicMaterial({ color: 0xdddddd }), sideM = new THREE.MeshLambertMaterial({ color: 0xf4f2ee });
      const cvs = new THREE.Mesh(new THREE.BoxGeometry(S, S, 0.07), [sideM, sideM, sideM, sideM, faceM, sideM]);
      cvs.position.copy(at(cx, 2.3, 0.04)); cvs.rotation.y = rotYp; g.add(cvs); canvases.push({ mesh: cvs, w: S, h: S, key: p.img });
      artTex.push({ faceM, url: resolveImg(p.img) });
      const cT = panelTex(CW * K, CH * K, (c, w, h) => {
        c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 12, h); c.fillStyle = '#ffffff';
        const pad = 50; let y = 92; let ts = 70; c.font = `800 ${ts}px ${FONT}`; const tl = () => wrap(c, p.title, w - pad * 2); while (tl().length > 2 && ts > 46) { ts -= 4; c.font = `800 ${ts}px ${FONT}`; }
        c.fillStyle = '#ffffff'; tl().slice(0, 2).forEach(l => { c.fillText(l, pad, y); y += ts * 1.06; });
        c.font = `500 42px ${FONT}`; c.fillStyle = '#e9e5e5'; c.fillText(A.name, pad, y + 4); y += 72;
        const q = p.quote ? '\u201c' + p.quote.replace(/^["\u201c]|["\u201d]$/g, '') + '\u201d' : (p.paras[0] || '');
        c.font = `italic 400 38px ${FONT}`; c.fillStyle = '#f3f2f2'; const ql = wrap(c, q, w - pad * 2); const room = Math.floor((h - y - 76) / 50);
        ql.slice(0, Math.max(0, room)).forEach((l, i, arr) => { c.fillText(i === arr.length - 1 && ql.length > arr.length ? l + ' \u2026' : l, pad, y); y += 50; });
        c.fillStyle = '#ff9783'; c.font = `800 26px ${FONT}`; c.fillText('APPROACH TO VIEW \u00b7 READ ALOUD', pad, h - 34);
      });
      const card = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), new THREE.MeshBasicMaterial({ map: cT }));
      card.position.copy(at(x - S - 0.35 - CW / 2, 1.6, 0.03)); card.rotation.y = rotYp; g.add(card);
      arts.push({ title: p.title, desc: (p.quote ? p.quote + ' — ' : '') + A.name, imgDesc: p.paras.join(' '), img: resolveImg(p.img), ctr: toW(cvs.position), n: dirW(n), artist: A.name, au: p.au || null, aus: !!p.aus });
      x -= S + 0.35 + CW + 0.9;
    }
  }
  if (!hang) wing.artists.forEach((A, ai) => {
    const s = slots[ai]; if (!s) return;
    if (A.video) {
      const tv = totemAt(s.x), face = s.side < 0 ? 5 : 4;
      const posterT = panelTex(640, 360, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 8); c.fillStyle = '#ff9783'; c.font = `800 22px ${FONT}`; c.fillText(A.videoKicker || videoKicker, 34, 150); c.fillStyle = '#fff'; c.font = `800 46px ${FONT}`; wrap(c, A.name.toUpperCase(), w - 68).forEach((l, i) => c.fillText(l, 34, 205 + i * 50)); });
      const posterMat = new THREE.MeshBasicMaterial({ map: posterT }); tv.material[face] = posterMat;
      const z0 = s.side < 0 ? -HW : 0, z1 = s.side < 0 ? 0 : HW;
      screens.push({ u: A.video, local: A.video, box: tv, faces: [face], posterMat, vol: 0.8, dist: 16, interview: true, p: toW(new THREE.Vector3(s.x, 2.35, 0)).toArray(),
        zone: boxW(new THREE.Vector3(s.x - bayW / 2 + 0.1, -1, z0), new THREE.Vector3(s.x + bayW / 2 - 0.1, 6, z1)) });
    }
    const zf = s.side * (HW - 0.05);   // wall face
    const rotY = s.side < 0 ? 0 : Math.PI;   // plane faces +z on the left wall, -z on the right
    const dirX = s.side < 0 ? 1 : -1;        // walking along the wall, "to the right" as you face it
    const n = new THREE.Vector3(0, 0, -s.side);
    const at = (dx, y, dz = 0) => new THREE.Vector3(s.x + dx * dirX, y, zf - s.side * dz);
    // bio board
    const bioT = panelTex(900, 1100, (c, w, h) => {
      c.fillStyle = '#3d4046'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 14);
      c.fillStyle = '#ff9783'; c.font = `800 30px ${FONT}`; c.fillText('ARTIST', 60, 92);
      c.fillStyle = '#ffffff'; c.font = `800 74px ${FONT}`; let y = 180; wrap(c, A.name.toUpperCase(), w - 120).forEach(l => { c.fillText(l, 60, y); y += 78; });
      c.font = `600 30px ${FONT}`; c.fillStyle = '#e9e5e5'; for (const sub of A.sub) { wrap(c, sub, w - 120).forEach(l => { c.fillText(l, 60, y); y += 38; }); }
      y += 18; c.fillStyle = '#ec3013'; c.fillRect(60, y, 120, 6); y += 50;
      c.font = `400 31px ${FONT}`; c.fillStyle = '#f3f2f2';
      for (const p of A.bio) { for (const l of wrap(c, p, w - 120)) { if (y > h - 70) break; c.fillText(l, 60, y); y += 41; } y += 14; }
    });
    const bio = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.67), new THREE.MeshBasicMaterial({ map: bioT }));
    bio.position.copy(at(spacious ? -12.3 : -5.3, 2.35, 0.03)); bio.rotation.y = rotY; g.add(bio);
    arts.push({ title: A.name, desc: [...A.sub, ...A.bio].join(' / '), imgDesc: '', img: A.photo ? resolveImg(A.photo) : null, ctr: toW(bio.position), n: dirW(n), artist: A.name, au: A.au || null, bio: true });
    // three canvases, no frames: a shallow box with the image on its face + a plaque below
    A.pieces.forEach((p, k) => {
      const cx = spacious ? -6.5 + k * 8.2 : -1.5 + k * 3.7, S = spacious ? 3.4 : 2.7;
      const faceM = new THREE.MeshBasicMaterial({ color: 0xdddddd });
      const sideM = new THREE.MeshLambertMaterial({ color: 0xf4f2ee });
      const cvs = new THREE.Mesh(new THREE.BoxGeometry(S, S, 0.07), [sideM, sideM, sideM, sideM, faceM, sideM]);
      cvs.position.copy(at(cx, spacious ? 2.75 : 2.65, 0.04)); cvs.rotation.y = rotY; g.add(cvs); canvases.push({ mesh: cvs, w: S, h: S, key: p.img });
      artTex.push({ faceM, url: resolveImg(p.img) });   // loaded when you come near, let go when you're far away (see load/unload)
      const plT = panelTex(1100, 300, (c, w, h) => {   // 3.3 x 0.9 m: big type, low on the wall so you can walk right up to it
        c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 12, h); c.fillStyle = '#ffffff';
        let ts = 68; c.font = `800 ${ts}px ${FONT}`; while (c.measureText(p.title).width > w - 80 && ts > 44) { ts -= 2; c.font = `800 ${ts}px ${FONT}`; }
        c.fillText(wrap(c, p.title, w - 80)[0], 44, 104);
        c.font = `500 46px ${FONT}`; c.fillStyle = '#e9e5e5'; c.fillText(A.name, 44, 184);
        c.fillStyle = '#ff9783'; c.font = `800 30px ${FONT}`; c.fillText('APPROACH TO VIEW · READ ALOUD', 44, 262);
      });
      if (spacious) {   // a description card beside the canvas, like the main gallery's (title, artist, quote), low enough to read up close
        const CW = 2.9, CH = 2.2, K = 300;
        const cT = panelTex(CW * K, CH * K, (c, w, h) => {
          c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 12, h); c.fillStyle = '#ffffff';
          const pad = 52; let y = 96; let ts = 74; c.font = `800 ${ts}px ${FONT}`; const tl = () => wrap(c, p.title, w - pad * 2); while (tl().length > 2 && ts > 50) { ts -= 4; c.font = `800 ${ts}px ${FONT}`; }
          c.fillStyle = '#ffffff'; tl().slice(0, 2).forEach(l => { c.fillText(l, pad, y); y += ts * 1.06; });
          c.font = `500 44px ${FONT}`; c.fillStyle = '#e9e5e5'; c.fillText(A.name, pad, y + 6); y += 76;
          const q = p.quote ? '\u201c' + p.quote.replace(/^["\u201c]|["\u201d]$/g, '') + '\u201d' : (p.paras[0] || '');
          c.font = `italic 400 40px ${FONT}`; c.fillStyle = '#f3f2f2'; const ql = wrap(c, q, w - pad * 2); const room = Math.floor((h - y - 80) / 52);
          ql.slice(0, Math.max(0, room)).forEach((l, i, arr) => { c.fillText(i === arr.length - 1 && ql.length > arr.length ? l + ' \u2026' : l, pad, y); y += 52; });
          c.fillStyle = '#ff9783'; c.font = `800 26px ${FONT}`; c.fillText('APPROACH TO VIEW \u00b7 READ ALOUD', pad, h - 36);
        });
        const card = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), new THREE.MeshBasicMaterial({ map: cT }));
        card.position.copy(at(cx + S / 2 + 0.45 + CW / 2, 1.95, 0.03)); card.rotation.y = rotY; g.add(card);
      } else {
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.9), new THREE.MeshBasicMaterial({ map: plT }));
      pl.position.copy(at(cx, 0.78, 0.03)); pl.rotation.y = rotY; g.add(pl);
      }
      arts.push({ title: p.title, desc: (p.quote ? p.quote + ' — ' : '') + A.name, imgDesc: p.paras.join(' '), img: resolveImg(p.img), ctr: toW(cvs.position), n: dirW(n), artist: A.name, au: p.au || null, aus: !!p.aus });
    });
  });
  // the partner's logo on the floor just inside the door, upright as you walk in
  if (floorLogo) { const fl = logoPanel(8.4, 3.9, floorLogo); fl.rotation.x = -Math.PI / 2; fl.rotation.z = Math.PI / 2; fl.position.set(-6.2, 0.012, 0); fl.material.polygonOffset = true; fl.material.polygonOffsetFactor = -2; fl.renderOrder = 1; g.add(fl); }
  // empty bays get the logo, so no wall is left bare
  // (22 Oct) community photos: square prints with a caption, on walls that would otherwise stand bare
  const comm = (community || []).slice();
  const capT = panelTex(860, 200, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 12, h);
    c.fillStyle = '#ffffff'; c.font = `800 62px ${FONT}`; c.fillText('OUR COMMUNITY', 44, 92); c.fillStyle = '#e9e5e5'; c.font = `500 38px ${FONT}`; c.fillText('The Blind Canvas Project, together', 44, 160); });
  const capM = new THREE.MeshBasicMaterial({ map: capT });
  const photo = (img, p, ry, nrm) => {
    const S = 3.2, faceM = new THREE.MeshBasicMaterial({ color: 0xdddddd }), sideM = new THREE.MeshLambertMaterial({ color: 0xf4f2ee });
    const cvs = new THREE.Mesh(new THREE.BoxGeometry(S, S, 0.07), [sideM, sideM, sideM, sideM, faceM, sideM]); cvs.position.copy(p); cvs.rotation.y = ry; g.add(cvs);
    canvases.push({ mesh: cvs, w: S, h: S, key: img }); artTex.push({ faceM, url: resolveImg(img) });
    const cap = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.6), capM); cap.position.copy(p).addScaledVector(nrm, -0.01); cap.position.y = 0.72; cap.rotation.y = ry; g.add(cap);
    arts.push({ title: 'Our community', desc: 'The Blind Canvas Project community, together', imgDesc: '', img: resolveImg(img), ctr: toW(cvs.position), n: dirW(nrm), artist: 'The Blind Canvas Project' });
  };
  // empty bays get the logo (smaller, when there are photos to hang round it), so no wall is left bare
  if (fillLogo && !hang) for (let i = wing.artists.length; i < slots.length; i++) { const sl = slots[i], ry = sl.side < 0 ? 0 : Math.PI, nrm = new THREE.Vector3(0, 0, -sl.side), zf = sl.side * (HW - 0.09);
    const withPhotos = comm.length >= 4, lp = withPhotos ? logoPanel(7.4, 3.6, fillLogo) : logoPanel(11, 4.8, fillLogo); lp.position.set(sl.x, withPhotos ? 2.75 : 2.9, sl.side * (HW - 0.04)); lp.rotation.y = ry; g.add(lp);
    if (withPhotos) for (const dx of [-10.4, -6.2, 6.2, 10.4]) photo(comm.shift(), new THREE.Vector3(sl.x + dx, 2.75, zf), ry, nrm); }
  // the end wall either side of the title
  if (!logo && comm.length >= 2) for (const z of [-7.6, 7.6]) photo(comm.shift(), new THREE.Vector3(-L + 0.09, titleY, z), Math.PI / 2, new THREE.Vector3(1, 0, 0));
  g.updateMatrixWorld(true);
  let loaded = false, artGen = 0, artOn = false;
  const TL = new THREE.TextureLoader();
  const loadArt = () => { if (artOn) return; artOn = true; const gen = ++artGen;
    for (const A of artTex) TL.load(A.url, t => { if (gen !== artGen) { t.dispose(); return; } t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; A.faceM.map = t; A.faceM.color.set(0xffffff); A.faceM.needsUpdate = true; }); };
  const unloadArt = () => { if (!artOn) return; artOn = false; artGen++;
    for (const A of artTex) if (A.faceM.map) { A.faceM.map.dispose(); A.faceM.map = null; A.faceM.color.set(0xdddddd); A.faceM.needsUpdate = true; } };
  const bounds = boxW(new THREE.Vector3(-L - 0.5, -1, -HW - 0.5), new THREE.Vector3(0.5, Hh + 0.5, HW + 0.5));
  return { group: g, col, arts, screens, canvases, bounds, load() { loadArt(); if (loaded) return; loaded = true; loaders.forEach(f => f()); }, unload: unloadArt, artLoaded: () => artOn, length: L };
}

// ------------------------------------------------------------ a doorway (freestanding arch with a glowing teal opening)
export function buildDoor({ scene, pos, face, title, sub }) {
  const g = new THREE.Group(); g.position.copy(pos); g.rotation.y = face; scene.add(g);
  const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b });
  const add = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; };
  add(0.35, 3.8, 0.5, ink, -1.75, 1.9, 0); add(0.35, 3.8, 0.5, ink, 1.75, 1.9, 0); add(3.85, 0.4, 0.5, ink, 0, 3.8, 0);
  const glowC = document.createElement('canvas'); glowC.width = 64; glowC.height = 128; const gc = glowC.getContext('2d'); const gr = gc.createRadialGradient(32, 80, 4, 32, 70, 90); gr.addColorStop(0, '#d9fffb'); gr.addColorStop(0.45, '#22b8b0'); gr.addColorStop(1, '#0b3f44'); gc.fillStyle = gr; gc.fillRect(0, 0, 64, 128);
  const gt = new THREE.CanvasTexture(glowC); gt.colorSpace = THREE.SRGBColorSpace;
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 3.6), new THREE.MeshBasicMaterial({ map: gt, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })); portal.position.set(0, 1.8, 0); g.add(portal);
  const st = panelTex(1024, 300, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 12); c.fillStyle = '#ffffff'; c.font = `800 92px ${FONT}`; c.fillText(title, 40, 130); c.fillStyle = '#cfcaca'; c.font = `500 38px ${FONT}`; wrap(c, sub, w - 80).slice(0, 2).forEach((l, i) => c.fillText(l, 40, 200 + i * 46)); });
  for (const r of [0, Math.PI]) { const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.35), new THREE.MeshBasicMaterial({ map: st })); sign.position.set(0, 4.75, r ? -0.02 : 0.02); sign.rotation.y = r; g.add(sign); }
  g.updateMatrixWorld(true);
  return { group: g, portal, pos: pos.clone(), face, t: 0 };
}
