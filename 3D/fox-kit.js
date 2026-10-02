// Shared 3D fox model + face animation, used by every Meru scene.
export const LOOK_KEY = 'meru.foxLook.v1';
export const DEFAULT_LOOK = {"armorAccent":"#38bdf8","snout":"#f9a96a","fur":"#f07a2a","furDark":"#c2410c","muzzle":"#ffb772","chin":"#ffc179","ear":"#1e293b","earInner":"#9d174d","fluff":"#ffffff","leg":"#e2e8f0","boot":"#0f172a","paw":"#f07a2a","nose":"#0b0a12","tailBase":"#c2410c","tailMid":"#fb923c","tailTip":"#ffffff","ink":"#1e293b","headScale":1.14,"headWidth":0.85,"headHeight":0.97,"cheeks":2,"chinPoint":1.5,"snoutLength":0.61,"snoutSize":0.77,"earHeight":0.98,"earWidth":0.75,"earSpread":0.82,"earTilt":0.52,"earBack":0.37,"fluffSize":0.86,"headTuft":0,"eyeSize":1.22,"eyeSpacing":50,"eyeY":92,"irisSize":0.98,"pupil":1,"eyeTilt":0,"lashes":1,"browWeight":10,"blush":0.42,"whiskers":1,"bodyScale":1,"legLength":1.5,"tailSize":1,"tailCurl":0.42,"tailLift":1.53};
export const PLAYER_FEMALE = {"armorAccent":"#38bdf8","snout":"#f9a96a","fur":"#f07a2a","furDark":"#c2410c","muzzle":"#ffb772","chin":"#ffc179","ear":"#1e293b","earInner":"#9d174d","fluff":"#ffffff","leg":"#e2e8f0","boot":"#0f172a","paw":"#f07a2a","nose":"#0b0a12","tailBase":"#c2410c","tailMid":"#fb923c","tailTip":"#ffffff","ink":"#1e293b","headScale":1.14,"headWidth":0.85,"headHeight":0.97,"cheeks":2,"chinPoint":1.5,"snoutLength":0.61,"snoutSize":0.77,"earHeight":0.98,"earWidth":0.75,"earSpread":0.82,"earTilt":0.52,"earBack":0.37,"fluffSize":0.86,"headTuft":0,"eyeSize":1.22,"eyeSpacing":50,"eyeY":92,"irisSize":0.98,"pupil":1,"eyeTilt":0,"lashes":1,"browWeight":10,"blush":0.42,"whiskers":1,"bodyScale":1,"legLength":1.5,"tailSize":1,"tailCurl":0.42,"tailLift":1.53};
export const PLAYER_MALE = {"armorAccent":"#38bdf8","snout":"#f3b26b","fur":"#f07a2a","furDark":"#c2410c","muzzle":"#ffb772","chin":"#ffc179","ear":"#1e293b","earInner":"#9d174d","fluff":"#ffffff","leg":"#e2e8f0","boot":"#0f172a","paw":"#f07a2a","nose":"#0b0a12","tailBase":"#c2410c","tailMid":"#fb923c","tailTip":"#ffffff","ink":"#1e293b","headScale":1.14,"headWidth":0.95,"headHeight":0.97,"cheeks":1.57,"chinPoint":1.01,"snoutLength":0.61,"snoutSize":0.85,"earHeight":0.98,"earWidth":1.5,"earSpread":0.82,"earTilt":0.52,"earBack":1,"fluffSize":1.8,"headTuft":1.14,"eyeSize":1.22,"eyeSpacing":58,"eyeY":92,"irisSize":0.98,"pupil":1,"eyeTilt":0,"lashes":1,"browWeight":10,"blush":0,"whiskers":1,"bodyScale":1,"legLength":1.5,"tailSize":1,"tailCurl":0.42,"tailLift":1.53};
export const KING_MIGHT = { ...PLAYER_MALE, elder: 1, fur: '#d9733a', furDark: '#9a4a22', muzzle: '#f1c9a6', snout: '#e8b48a', chin: '#f4f1ec', fluff: '#f4f4f6', tailMid: '#e8945a', tailTip: '#ffffff', browColor: '#f8fafc', browWeight: 10, beard: '#eef0f4', eyeSize: 1.05, irisSize: 0.9, eyeY: 96, headTuft: 0.6, fluffSize: 1.9, cheeks: 1.7, chinPoint: 0.8, headWidth: 1.0, earBack: 0.6, blush: 0, armorAccent: '#c42d3c', bodyScale: 1.08 };
export function loadLook() { try { return { ...DEFAULT_LOOK, ...JSON.parse(localStorage.getItem(LOOK_KEY) || '{}') }; } catch (e) { return { ...DEFAULT_LOOK }; } }
export function foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp }) {
  // ---------- foxes ----------
  const crestTexes = { '8': crestTex('8', '#38bdf8'), U: crestTex('U', '#eab308'), L: crestTex('L', '#eab308'), J: crestTex('J', '#1e3a8a', '#ffffff', '#1e3a8a'), G: crestTex('G', '#38bdf8'), M: crestTex('M', '#e6b45a', '#151b3d') };
  const crestStyle = { '8': ['#ffffff', '#0b1430', '#ffffff'], U: ['#eab308', '#2a1606', '#fff3c4'], L: ['#eab308', '#2a0a0a', '#fff3c4'], J: ['#1e3a8a', '#ffffff', '#1e3a8a'], G: ['#38bdf8', '#120d2a', '#ffffff'], M: ['#ffffff', '#0b1430', '#ffffff'] };
  const crestCache = {};
  function armorCrest(letter) {
    if (crestCache[letter]) return crestCache[letter];
    const [ring, bg, fg] = crestStyle[letter] || crestStyle['8'];
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#38bdf8'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#0e7fb8'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill();
    g.fillStyle = '#7dd3fc'; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill();
    g.fillStyle = ring; g.beginPath(); g.arc(128, 128, 106, 0, 7); g.fill();
    g.fillStyle = bg; g.beginPath(); g.arc(128, 128, 90, 0, 7); g.fill();
    g.strokeStyle = ring; g.globalAlpha = 0.35; g.lineWidth = 3; g.beginPath(); g.arc(128, 128, 80, 0, 7); g.stroke(); g.globalAlpha = 1;
    if (letter === '8') {
      g.lineCap = 'round'; g.lineJoin = 'round';
      const eight = () => { g.beginPath(); g.ellipse(128, 92, 30, 28, 0, 0, 7); g.moveTo(128 + 36, 166); g.ellipse(128, 166, 36, 32, 0, 0, 7); };
      g.strokeStyle = '#7dd3fc'; g.lineWidth = 25; eight(); g.stroke();
      g.strokeStyle = fg; g.lineWidth = 18; eight(); g.stroke();
      g.fillStyle = '#05070f'; g.beginPath(); g.ellipse(128, 92, 19, 17, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(128, 166, 24, 21, 0, 0, 7); g.fill();
    } else {
      g.font = '900 168px "Archivo", "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 12; g.strokeStyle = ring; g.strokeText(letter, 128, 140); g.fillStyle = fg; g.fillText(letter, 128, 140);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; crestCache[letter] = t; return t;
  }
  // brow (inner, outer) lift, upper-lid drop, iris scale, resting mouth
  const MOOD = {
    neutral: { bi: 0, bo: 0, lid: 0, iris: 1, mouth: 'w' }, happy: { bi: -4, bo: -2, lid: 0, iris: 1, mouth: 'smile' },
    excited: { bi: -8, bo: -6, lid: 0, iris: 1, mouth: 'grin', closed: true }, surprised: { bi: -12, bo: -10, lid: -0.15, iris: 0.68, mouth: 'o' },
    sad: { bi: -9, bo: 4, lid: 0.32, iris: 1, mouth: 'frown' }, stern: { bi: 9, bo: -2, lid: 0.28, iris: 0.95, mouth: 'flat' },
    smug: { bi: 4, bo: -2, lid: 0.38, iris: 1, mouth: 'smirk', browR: -9 }, determined: { bi: 7, bo: -1, lid: 0.18, iris: 1, mouth: 'flat' },
    warm: { bi: -3, bo: 0, lid: 0.16, iris: 1, mouth: 'smile' }, curious: { bi: -2, bo: 0, lid: 0, iris: 1, mouth: 'o', browL: -9 },
  };
  const moodOf = (text, base, isPlayer) => {
    if (/^Shh|Lower your voice/.test(text)) return 'surprised';
    if (/\.\.\.|graves|die |eats .* alive|rotting|ghost/.test(text)) return isPlayer ? 'curious' : 'sad';
    if (/!/.test(text)) return isPlayer ? 'happy' : 'excited';
    if (/\?$/.test(text)) return 'curious';
    return base;
  };
  function drawFace(g, f) {
    const W = 256; g.clearRect(0, 0, W, W);
    const md = MOOD[f.mood] || MOOD.neutral, L = f.L || DEFAULT_LOOK, ES = L.eyeSize, EX = L.eyeSpacing, EY = L.eyeY, INK = L.ink;
    // muzzle + chin
    g.fillStyle = L.muzzle; g.beginPath(); g.ellipse(128, 176, 66, 46, 0, 0, 7); g.fill();
    g.fillStyle = L.chin; g.beginPath(); g.ellipse(128, 222, 42, 24, 0, 0, 7); g.fill();
    if (L.elder) { g.fillStyle = 'rgba(235,235,240,0.55)'; for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI, r = 58 + (i % 3) * 6; g.beginPath(); g.ellipse(128 + Math.cos(a) * r * 0.9, 178 + Math.sin(a) * r * 0.55, 6, 3, a, 0, 7); g.fill(); } }
    g.fillStyle = `rgba(244,114,182,${L.blush})`; for (const x of [62, 194]) { g.beginPath(); g.ellipse(x, 154, 17, 9, 0, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(30,41,59,0.45)'; g.lineWidth = 2; g.lineCap = 'round';
    if (L.whiskers > 0.5) for (const s of [-1, 1]) for (const dy of [0, 9]) { g.beginPath(); g.moveTo(128 + s * 56, 170 + dy); g.lineTo(128 + s * 84, 164 + dy * 1.5); g.stroke(); }
    // eyes
    const eye = (cx, cy, side, col) => {
      g.save(); g.translate(cx, cy); g.rotate(-side * L.eyeTilt); g.translate(-cx, -cy); const hw = 25 * ES, hh = 22 * ES, open = Math.max(0, (1 - f.blink) * (1 - Math.max(0, md.lid)));
      g.lineCap = 'round'; g.lineJoin = 'round';
      if (md.closed || open < 0.14) {
        g.strokeStyle = '#1e293b'; g.lineWidth = 6; g.beginPath();
        if (md.closed) { g.moveTo(cx - hw, cy + 6); g.quadraticCurveTo(cx, cy - 18, cx + hw, cy + 6); }
        else { g.moveTo(cx - hw, cy + 2); g.quadraticCurveTo(cx, cy + 10, cx + hw, cy + 2); g.moveTo(cx + side * hw, cy + 2); g.lineTo(cx + side * (hw + 7), cy - 4); }
        g.stroke(); g.restore(); return;
      }
      const ry = hh * open * (1 - Math.min(0, md.lid)), top = cy + hh - ry * 2 + (hh - ry) * -0.0, ccy = cy + (hh - ry) * 0.55;
      g.save(); g.beginPath(); g.ellipse(cx, ccy, hw, ry, 0, 0, 7); g.fillStyle = '#ffffff'; g.fill(); g.clip();
      const ir = 17 * ES * L.irisSize * md.iris, ix = cx + f.look * 8 * ES, iy = ccy + 3;
      const gr = g.createLinearGradient(0, iy - ir, 0, iy + ir); gr.addColorStop(0, '#1e1b2e'); gr.addColorStop(0.45, col); gr.addColorStop(1, '#ffffff');
      g.fillStyle = gr; g.beginPath(); g.arc(ix, iy, ir, 0, 7); g.fill();
      g.fillStyle = '#0b0a12'; g.beginPath(); g.ellipse(ix, iy + 1, 4.5 * md.iris * L.pupil * ES, 10 * md.iris * L.pupil * ES, 0, 0, 7); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ix - 6 * ES, iy - 7 * ES, 5.5 * ES, 0, 7); g.fill(); g.beginPath(); g.arc(ix + 6 * ES, iy + 6 * ES, 2.6 * ES, 0, 7); g.fill();
      g.restore();
      g.strokeStyle = INK; g.lineWidth = 6.5; g.beginPath(); g.ellipse(cx, ccy, hw, ry, 0, Math.PI * 1.04, Math.PI * 1.96); g.stroke();
      if (L.lashes > 0.5) { g.beginPath(); g.moveTo(cx + side * hw * 0.92, ccy - ry * 0.35); g.lineTo(cx + side * (hw + 9), ccy - ry * 0.75 - 4); g.stroke(); }
      g.lineWidth = 2; g.beginPath(); g.ellipse(cx, ccy, hw * 0.92, ry, 0, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); g.restore();
    };
    eye(128 - EX, EY, -1, f.eyeL); eye(128 + EX, EY, 1, f.eyeR);
    // brows
    g.strokeStyle = L.browColor || INK; g.lineWidth = L.browWeight; g.lineCap = 'round';
    for (const [cx, side] of [[128 - EX, -1], [128 + EX, 1]]) {
      const extra = side < 0 ? (md.browL || 0) : (md.browR || 0);
      const ix = cx - side * 14 * ES, ox = cx + side * 20 * ES, by = EY - 34 * ES, iy = by + md.bi + extra, oy = by - 2 + md.bo + extra;
      g.beginPath(); g.moveTo(ix, iy); g.quadraticCurveTo((ix + ox) / 2, Math.min(iy, oy) - 5, ox, oy); g.stroke();
      if (L.elder) { g.save(); g.lineWidth = 3; g.strokeStyle = 'rgba(30,41,59,0.55)'; g.beginPath(); g.moveTo(ix, iy + 6); g.quadraticCurveTo((ix + ox) / 2, Math.min(iy, oy) + 1, ox, oy + 6); g.stroke(); g.lineWidth = 4; g.strokeStyle = L.browColor || '#fff'; for (let t = 0; t < 3; t++) { const px = ox + side * (2 + t * 5), py = oy + t * 4; g.beginPath(); g.moveTo(px - side * 8, py); g.lineTo(px, py + 5); g.stroke(); } g.restore(); }
    }
    if (L.elder) { g.save(); g.strokeStyle = 'rgba(120,60,20,0.45)'; g.lineWidth = 2.5; g.lineCap = 'round';
      for (const s of [-1, 1]) { const cx = 128 + s * EX; g.beginPath(); g.moveTo(cx + s * 26 * ES, EY + 6); g.lineTo(cx + s * 36 * ES, EY + 2); g.moveTo(cx + s * 26 * ES, EY + 12); g.lineTo(cx + s * 35 * ES, EY + 14); g.stroke(); }
      g.beginPath(); g.moveTo(112, 44); g.quadraticCurveTo(128, 40, 144, 44); g.moveTo(116, 54); g.quadraticCurveTo(128, 51, 140, 54); g.stroke(); g.restore(); }
    // mouth
    const m = f.mouth, mx = 128, my = 214; g.strokeStyle = '#1e293b'; g.lineWidth = 4;
    if (m > 0.08 || md.mouth === 'grin') {
      const open = Math.max(m, md.mouth === 'grin' ? 0.55 : 0), w = 15 + open * 8 + (md.mouth === 'grin' ? 8 : 0), h = 5 + open * 17;
      const off = md.mouth === 'smirk' ? 5 : 0;
      g.fillStyle = '#5b1a2a'; g.beginPath(); g.moveTo(mx - w + off, my - 2); g.quadraticCurveTo(mx + off, my - 2 - (md.mouth === 'grin' ? -2 : 3), mx + w + off, my - 2); g.quadraticCurveTo(mx + off, my + h * 1.5, mx - w + off, my - 2); g.fill(); g.stroke();
      g.save(); g.clip(); g.fillStyle = '#f0708a'; g.beginPath(); g.ellipse(mx + off, my + h * 1.05, w * 0.6, h * 0.55, 0, 0, 7); g.fill(); g.restore();
    } else {
      g.beginPath();
      if (md.mouth === 'w') { g.moveTo(mx - 14, my - 4); g.quadraticCurveTo(mx - 7, my + 6, mx, my - 2); g.quadraticCurveTo(mx + 7, my + 6, mx + 14, my - 4); }
      else if (md.mouth === 'smile') { g.moveTo(mx - 18, my - 6); g.quadraticCurveTo(mx, my + 12, mx + 18, my - 6); }
      else if (md.mouth === 'o') { g.ellipse(mx, my + 1, 6, 7, 0, 0, 7); g.fillStyle = '#5b1a2a'; g.fill(); }
      else if (md.mouth === 'frown') { g.moveTo(mx - 12, my + 4); g.quadraticCurveTo(mx, my - 6, mx + 12, my + 4); }
      else if (md.mouth === 'smirk') { g.moveTo(mx - 12, my); g.quadraticCurveTo(mx + 4, my + 4, mx + 16, my - 8); }
      else { g.moveTo(mx - 11, my + 1); g.lineTo(mx + 11, my + 1); }
      g.stroke();
    }
  }
  function latheColored(profile, colorAt, segs = 20) {
    const geo = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segs);
    const p = geo.attributes.position, c = new Float32Array(p.count * 3), col = new THREE.Color();
    for (let i = 0; i < p.count; i++) { colorAt(p.getY(i), col); c.set([col.r, col.g, col.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); geo.computeVertexNormals(); return geo;
  }
  const vcToon = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad });
  let LOOK = loadLook(); const geoCache = new Map();
  const C3 = h => new THREE.Color(h);
  const tailGeoFor = L => { const k = 'tail' + L.tailBase + L.tailMid + L.tailTip + L.tailCurl; if (geoCache.has(k)) return geoCache.get(k); const g = (() => {
    const prof = [[0, 0], [0.08, 0.06], [0.17, 0.2], [0.25, 0.38], [0.29, 0.55], [0.27, 0.72], [0.2, 0.86], [0.1, 0.96], [0, 1.02]];
    const o1 = C3(L.tailBase), o2 = C3(L.tailMid), wh = C3(L.tailTip);
    const g = latheColored(prof, (y, c) => y > 0.74 ? c.copy(wh) : c.copy(o1).lerp(o2, y / 0.74), 18);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, p.getZ(i) - y * y * L.tailCurl); p.setY(i, y * 0.95); }
    g.computeVertexNormals(); return g;
  })(); geoCache.set(k, g); return g; };
  function foxSkull(r, ws, hs, p0, pl, t0, tl, L = LOOK) {
    const g = p0 == null ? new THREE.SphereGeometry(r, ws, hs) : new THREE.SphereGeometry(r, ws, hs, p0, pl, t0, tl);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i) / r, y = p.getY(i) / r, z = p.getZ(i) / r;
      const cheek = Math.exp(-(((y + 0.28) / 0.3) ** 2)); x *= 1 + 0.26 * L.cheeks * cheek * (0.6 + 0.4 * Math.max(0, z));
      if (y < -0.35) { const t = Math.min(1, (-0.35 - y) / 0.65); x *= 1 - 0.5 * L.chinPoint * t; z += 0.16 * L.chinPoint * t * Math.max(0, z); }
      if (y > 0.35) y -= (y - 0.35) * 0.18;
      if (z < 0) z *= 0.86; else z *= 1 - 0.08 * Math.max(0, y);
      p.setXYZ(i, x * r, y * r, z * r);
    }
    g.computeVertexNormals(); return g;
  }
  const snoutGeoFor = L => { const k = 'snout' + (L.snout || L.muzzle) + L.chin; if (geoCache.has(k)) return geoCache.get(k); const gg = (() => {
    const prof = [[0, 0], [0.17, 0.0], [0.19, 0.07], [0.165, 0.15], [0.11, 0.22], [0.05, 0.26], [0, 0.27]];
    const top = C3(L.snout || L.muzzle), wh = C3(L.chin);
    const g = new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 22); g.rotateX(Math.PI / 2);
    const p = g.attributes.position, c = new Float32Array(p.count * 3), col = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) * 1.2); p.setY(i, y * (y > 0 ? 0.78 : 0.62) + p.getZ(i) * 0.12); col.copy(top).lerp(wh, smooth(-0.03, -0.09, y)); c.set([col.r, col.g, col.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); return g;
  })(); geoCache.set(k, gg); return gg; };
  let _glowT = null;
  function glowTexFor() { if (_glowT) return _glowT; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); _glowT = new THREE.CanvasTexture(c); _glowT.colorSpace = THREE.SRGBColorSpace; return _glowT; }
  function makeFox({ key, torso, crest, bow, glasses, cane, chair, crown, eyes = ['#f472b6', '#2dd4bf'], mood = 'neutral', look, gear = 'none', outfit = 'armor', prints = null }) {
    const L = { ...LOOK, ...(look || {}) };
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const P = { body };
    const fur = toon(L.fur), furDark = toon(L.furDark), white = toon(L.fluff), ink = toon(L.ear), leg = toon(L.leg), boot = toon(L.boot);
    const legX = chair ? 0 : 0.5 * (L.legLength - 1), lift = (chair ? 0.28 : 0) + legX;
    P.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.14, 0.5 + lift, 0); p.scale.y = L.legLength; body.add(p);
      M(new THREE.CapsuleGeometry(0.095, 0.24, 4, 10), leg, 0, -0.2, 0, p, 0.025);
      M(new THREE.SphereGeometry(0.14, 14, 10), boot, 0, -0.42, 0.05, p, 0.022, 0.14).scale.set(1, 0.62, 1.35);
      if (chair) p.rotation.x = -1.45; return p; });
    const t0 = C3(torso[0]), t1 = C3(torso[1]), t2 = C3(torso[2]);
    if (outfit === 'armor') {
      // ---- armour ----
      const accent = toon(L.armorAccent || '#38bdf8', { emissive: new THREE.Color(L.armorAccent || '#38bdf8'), emissiveIntensity: 0.25 }); const shadeHex = c => '#' + new THREE.Color(torso[0]).lerp(new THREE.Color(L.armorAccent || '#38bdf8'), c).getHexString(); const accentShade = toon(shadeHex(0.9)), accentShadeD = toon('#' + new THREE.Color(L.armorAccent || '#38bdf8').multiplyScalar(0.78).getHexString()); const under = toon(torso[2]), plate = toon(torso[0]), plateMid = toon(torso[1]), trim = toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.25 }), steel = toon('#94a3b8');
      M(latheColored([[0, 0.42], [0.22, 0.42], [0.27, 0.5], [0.24, 0.66], [0.25, 0.9], [0.27, 1.12], [0.14, 1.24], [0, 1.25]], (y, c) => c.copy(t2), 20), vcToon, 0, lift, 0, body, 0.025);
      const cuirass = latheColored([[0.255, 0.66], [0.3, 0.7], [0.335, 0.82], [0.36, 0.98], [0.355, 1.08], [0.32, 1.17], [0.22, 1.23], [0.1, 1.255], [0, 1.26]],
        (y, c) => c.copy(t1).lerp(t0, smooth(0.7, 1.15, y)), 28);
      const cp = cuirass.attributes.position; for (let i = 0; i < cp.count; i++) { const z = cp.getZ(i); if (z > 0) cp.setZ(i, z * 1.12); else cp.setZ(i, z * 0.9); } cuirass.computeVertexNormals();
      M(cuirass, vcToon, 0, lift, 0, body, 0.03);
      { const r1 = M(new THREE.TorusGeometry(0.3, 0.028, 8, 32), trim, 0, 0.7 + lift, 0.01, body, 0); r1.rotation.x = Math.PI / 2; r1.scale.set(1, 1.08, 1); }
      M(new THREE.BoxGeometry(0.035, 0.42, 0.03), trim, 0, 0.94 + lift, 0.365, body, 0).rotation.x = -0.2;
      M(new THREE.TorusGeometry(0.2, 0.045, 8, 26), steel, 0, 1.24 + lift, 0.01, body, 0.012).rotation.x = Math.PI / 2;
      // crest medallion
      const crestM = new THREE.MeshToonMaterial({ map: armorCrest(crest), gradientMap: grad, emissive: 0xffffff, emissiveMap: armorCrest(crest), emissiveIntensity: 0.18 });
      const med = M(new THREE.CylinderGeometry(0.19, 0.2, 0.05, 40), [accent, crestM, accent], 0, 1.04 + lift, 0.425, body, 0.012, 0.2); med.rotation.set(Math.PI / 2 - 0.3, Math.PI / 2, 0, 'XYZ');
      // waist + faulds
      M(new THREE.CylinderGeometry(0.29, 0.28, 0.1, 28), under, 0, 0.64 + lift, 0, body, 0.018, 0.29);
      M(new THREE.BoxGeometry(0.13, 0.1, 0.04), trim, 0, 0.64 + lift, 0.3, body, 0.012);
      for (let k = -2; k <= 2; k++) { const ang = k * 0.62, f = M(new THREE.BoxGeometry(0.17, 0.2, 0.035), k % 2 ? accentShadeD : accentShade, Math.sin(ang) * 0.29, 0.5 + lift, Math.cos(ang) * 0.29, body, 0.012); f.rotation.set(0.28, ang, 0); M(new THREE.BoxGeometry(0.17, 0.03, 0.04), accent, 0, -0.085, 0.002, f, 0); M(new THREE.BoxGeometry(0.03, 0.14, 0.04), accent, 0, 0.01, 0.004, f, 0); }
      // pauldrons: two layered domes each
      for (const s of [-1, 1]) {
        const pg = new THREE.Group(); pg.position.set(s * 0.36, 1.17 + lift, 0); pg.rotation.z = -s * 0.42; body.add(pg);
        M(new THREE.SphereGeometry(0.19, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), accentShade, 0, 0, 0, pg, 0.02, 0.19).scale.set(1, 0.75, 1.05);
        M(new THREE.TorusGeometry(0.19, 0.024, 6, 24), accent, 0, 0.0, 0, pg, 0).rotation.x = Math.PI / 2;
        const p2 = M(new THREE.SphereGeometry(0.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), accentShadeD, 0, -0.07, 0, pg, 0.018, 0.17); p2.scale.set(1.05, 0.55, 1.08);
        M(new THREE.SphereGeometry(0.03, 8, 6), steel, 0, 0.13, 0, pg, 0); M(new THREE.TorusGeometry(0.175, 0.016, 6, 24), accent, 0, -0.075, 0, pg, 0).rotation.x = Math.PI / 2;
      }
          P.arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.42, 1.12 + lift, 0); p.scale.setScalar(1.25); body.add(p);
        M(new THREE.CapsuleGeometry(0.07, 0.26, 4, 10), under, 0, -0.17, 0, p, 0.02);
        M(new THREE.CylinderGeometry(0.095, 0.085, 0.17, 14), plate, 0, -0.28, 0, p, 0.016, 0.095);
        M(new THREE.TorusGeometry(0.093, 0.016, 6, 18), trim, 0, -0.2, 0, p, 0).rotation.x = Math.PI / 2;
        M(new THREE.SphereGeometry(0.06, 10, 8), steel, 0, -0.13, 0.02, p, 0.012, 0.06);
        M(new THREE.SphereGeometry(0.095, 12, 8), toon(L.paw), 0, -0.4, 0.01, p, 0.02, 0.095); return p; });
      P.legs.forEach(p => { M(new THREE.CylinderGeometry(0.105, 0.095, 0.2, 14), plate, 0, -0.28, 0.005, p, 0.016, 0.105); M(new THREE.SphereGeometry(0.075, 10, 8), plateMid, 0, -0.14, 0.06, p, 0.012, 0.075).scale.set(1, 0.8, 0.7); M(new THREE.TorusGeometry(0.1, 0.014, 6, 18), trim, 0, -0.19, 0.005, p, 0).rotation.x = Math.PI / 2; });
    } else {
      // ---- clothes (everyone who is not a guard) ----
      const C = { light: toon(torso[0]), mid: toon(torso[1]), dark: toon(torso[2]), gold: toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.25 }), cream: toon('#f7f1e6'), ink: toon('#1e293b'), fur: toon('#f8fafc') };
      const lathe = (pts, col, segs = 26, squash = 1.1) => { const gg = latheColored(pts, (y, c) => typeof col === 'function' ? col(y, c) : c.copy(col), segs); const pp = gg.attributes.position; for (let i = 0; i < pp.count; i++) { const z = pp.getZ(i); pp.setZ(i, z > 0 ? z * squash : z * 0.92); } gg.computeVertexNormals(); return gg; };
      const badge = (x, y, z, r = 0.075, rx = -0.2) => { const tex = armorCrest(crest); const bm = M(new THREE.CylinderGeometry(r, r, 0.02, 28), [C.gold, new THREE.MeshToonMaterial({ map: tex, gradientMap: grad }), C.gold], x, y + lift, z, body, 0.008, r); bm.rotation.set(Math.PI / 2 + rx, Math.PI / 2, 0, 'XYZ'); return bm; };
      const sleeve = (mat, cuffMat, wide = false) => [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.4, 1.12 + lift, 0); p.scale.setScalar(1.25); body.add(p);
        if (wide) { M(new THREE.CylinderGeometry(0.075, 0.15, 0.34, 14, 1, true), mat, 0, -0.2, 0, p, 0.016, 0.15); M(new THREE.TorusGeometry(0.148, 0.018, 6, 18), cuffMat, 0, -0.37, 0, p, 0).rotation.x = Math.PI / 2; }
        else { M(new THREE.CapsuleGeometry(0.078, 0.26, 4, 10), mat, 0, -0.17, 0, p, 0.02); M(new THREE.CylinderGeometry(0.088, 0.088, 0.07, 14), cuffMat, 0, -0.31, 0, p, 0.012, 0.088); }
        M(new THREE.SphereGeometry(0.095, 12, 8), toon(L.paw), 0, -0.4, 0.01, p, 0.02, 0.095); return p; });
      const kind = outfit;
      if (kind === 'robe') {          // advisor's robe: floor length, wide sleeves, sash
        M(lathe([[0.3, 0.06], [0.36, 0.08], [0.33, 0.4], [0.28, 0.7], [0.29, 0.95], [0.33, 1.12], [0.24, 1.22], [0.12, 1.26], [0, 1.27]], (y, c) => c.copy(t1).lerp(t2, smooth(0.9, 0.1, y))), vcToon, 0, lift - 0.02, 0, body, 0.03);
        M(new THREE.TorusGeometry(0.29, 0.045, 8, 28), C.gold, 0, 0.72 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        const tie = M(new THREE.BoxGeometry(0.08, 0.36, 0.03), C.gold, 0.12, 0.54 + lift, 0.31, body, 0.01); tie.rotation.z = 0.12;
        M(new THREE.BoxGeometry(0.1, 0.62, 0.03), C.light, 0, 0.98 + lift, 0.33, body, 0.01).rotation.x = -0.18;
        M(new THREE.TorusGeometry(0.2, 0.06, 8, 22, Math.PI * 1.3), C.light, 0, 1.22 + lift, 0.02, body, 0.012).rotation.set(Math.PI / 2, 0, -Math.PI * 0.15 + Math.PI);
        badge(-0.17, 1.03, 0.34, 0.065);
        P.arms = sleeve(C.mid, C.gold, true);
        P.legs.forEach(p => p.visible = false);
      } else if (kind === 'coat' || kind === 'dress') {   // officer's long coat; the dress version flares
        const flare = kind === 'dress' ? 0.42 : 0.33;
        M(lathe([[flare, 0.22], [flare - 0.02, 0.3], [0.29, 0.6], [0.27, 0.72], [0.3, 0.95], [0.34, 1.1], [0.27, 1.2], [0.12, 1.25], [0, 1.26]], (y, c) => c.copy(t1).lerp(t0, smooth(0.6, 1.15, y))), vcToon, 0, lift, 0, body, 0.03);
        M(new THREE.TorusGeometry(0.275, 0.03, 8, 28), C.dark, 0, 0.72 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        M(new THREE.BoxGeometry(0.11, 0.08, 0.035), C.gold, 0, 0.72 + lift, 0.3, body, 0.01);
        for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) M(new THREE.SphereGeometry(0.022, 8, 6), C.gold, sx * 0.1, 0.84 + k * 0.1 + lift, 0.31 + k * 0.012, body, 0);
        M(new THREE.CylinderGeometry(0.17, 0.2, 0.11, 22), C.mid, 0, 1.24 + lift, 0, body, 0.014, 0.2);
        for (const s of [-1, 1]) { const ep = M(new THREE.BoxGeometry(0.2, 0.04, 0.2), C.gold, s * 0.36, 1.2 + lift, 0, body, 0.012); ep.rotation.z = -s * 0.3; for (let k = -2; k <= 2; k++) M(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 4), C.gold, k * 0.04, -0.05, 0.1, ep, 0); }
        if (kind === 'dress') M(new THREE.TorusGeometry(0.4, 0.018, 6, 30), C.gold, 0, 0.24 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        badge(-0.15, 1.02, 0.32);
        P.arms = sleeve(C.mid, C.gold);
      } else if (kind === 'vest') {   // shirt, open vest, neck scarf
        M(lathe([[0, 0.42], [0.23, 0.42], [0.28, 0.52], [0.25, 0.68], [0.27, 0.95], [0.32, 1.12], [0.22, 1.22], [0.1, 1.26], [0, 1.27]], C3('#f7f1e6')), vcToon, 0, lift, 0, body, 0.028);
        const vest = M(lathe([[0.27, 0.52], [0.275, 0.66], [0.29, 0.95], [0.335, 1.12], [0.25, 1.21]], (y, c) => c.copy(t1), 26), vcToon, 0, lift, 0, body, 0.026);
        vest.geometry = vest.geometry.clone(); { const pp = vest.geometry.attributes.position; for (let i = 0; i < pp.count; i++) if (pp.getZ(i) > 0.2 && Math.abs(pp.getX(i)) < 0.08) pp.setZ(i, pp.getZ(i) - 0.02); }
        M(new THREE.BoxGeometry(0.04, 0.58, 0.04), C.dark, -0.07, 0.86 + lift, 0.3, body, 0); M(new THREE.BoxGeometry(0.04, 0.58, 0.04), C.dark, 0.07, 0.86 + lift, 0.3, body, 0);
        M(new THREE.TorusGeometry(0.28, 0.035, 8, 28), C.ink, 0, 0.58 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        M(new THREE.BoxGeometry(0.1, 0.07, 0.03), C.gold, 0, 0.58 + lift, 0.3, body, 0.01);
        M(new THREE.BoxGeometry(0.14, 0.12, 0.08), toon('#6b4a35'), 0.2, 0.52 + lift, 0.2, body, 0.012).rotation.y = 0.5;
        M(new THREE.TorusGeometry(0.17, 0.055, 8, 22), C.dark, 0, 1.24 + lift, 0.02, body, 0.012).rotation.x = Math.PI / 2;
        const tail2 = M(new THREE.BoxGeometry(0.08, 0.2, 0.03), C.dark, 0.06, 1.12 + lift, 0.2, body, 0.008); tail2.rotation.z = -0.2;
        badge(0.15, 1.02, 0.33, 0.06);
        P.arms = sleeve(toon('#f7f1e6'), C.mid);
      } else if (kind === 'suit') {   // fitted jacket, lapels, cravat
        M(lathe([[0, 0.42], [0.24, 0.42], [0.29, 0.5], [0.26, 0.66], [0.27, 0.95], [0.33, 1.12], [0.24, 1.21], [0.1, 1.26], [0, 1.27]], (y, c) => c.copy(t1).lerp(t2, smooth(0.7, 0.4, y))), vcToon, 0, lift, 0, body, 0.03);
        for (const sx of [-1, 1]) { const lp = M(new THREE.BoxGeometry(0.1, 0.36, 0.025), C.dark, sx * 0.09, 1.02 + lift, 0.32, body, 0.008); lp.rotation.set(-0.2, 0, sx * 0.32); }
        M(new THREE.BoxGeometry(0.1, 0.2, 0.03), C.cream, 0, 1.08 + lift, 0.33, body, 0).rotation.x = -0.2;
        M(new THREE.OctahedronGeometry(0.05, 0), C.gold, 0, 1.12 + lift, 0.355, body, 0.008).scale.set(1, 0.7, 0.4);
        for (let k = 0; k < 2; k++) M(new THREE.SphereGeometry(0.022, 8, 6), C.gold, 0, 0.75 + k * 0.1 + lift, 0.31, body, 0);
        M(new THREE.TorusGeometry(0.262, 0.026, 8, 28), C.dark, 0, 0.6 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        M(new THREE.CylinderGeometry(0.17, 0.2, 0.1, 22), C.cream, 0, 1.24 + lift, 0, body, 0.012, 0.2);
        badge(-0.17, 1.02, 0.31, 0.055);
        P.arms = sleeve(C.mid, C.cream);
      } else if (kind === 'hoodie' || kind === 'tee') {  // black tee (logo on the chest) under a wide-open hoodie with a print on the back
        const teeC = prints && prints.tee || '#141414', hoodC = prints && prints.hood || '#2b2b30';
        const tee = toon(teeC), hood = toon(hoodC), rib = toon('#' + new THREE.Color(hoodC).multiplyScalar(0.72).getHexString());
        const squashed = (geo, front = 1.1, back = 0.92) => { const pp = geo.attributes.position; for (let i = 0; i < pp.count; i++) { const z = pp.getZ(i); pp.setZ(i, z > 0 ? z * front : z * back); } geo.computeVertexNormals(); return geo; };
        const prof = [[0.23, 0.42], [0.28, 0.52], [0.25, 0.68], [0.27, 0.95], [0.32, 1.12], [0.22, 1.22], [0.1, 1.26], [0, 1.27]];
        M(lathe([[0, 0.42], ...prof], C3(teeC)), vcToon, 0, lift, 0, body, 0.028);
        // the hoodie: same profile pushed out a little, open down the front
        if (kind === 'hoodie') {
        const gap = 0.62;
        const hp = [[0.27, 0.4], [0.31, 0.5], [0.29, 0.68], [0.305, 0.95], [0.35, 1.12], [0.26, 1.21]].map(([r, y]) => new THREE.Vector2(r, y));
        const shell = M(squashed(new THREE.LatheGeometry(hp, 30, gap, Math.PI * 2 - gap * 2)), hood, 0, lift, 0, body, 0.026); shell.material = shell.material.clone(); shell.material.side = THREE.DoubleSide;
        // front edges (zipper tape), hem band, hood lying on the shoulders, drawstrings
        for (const s of [-1, 1]) { const a = s * gap; const ed = M(new THREE.BoxGeometry(0.035, 0.74, 0.03), rib, Math.sin(a) * 0.3 * 1.0, 0.8 + lift, Math.cos(a) * 0.3 * 1.1, body, 0.006); ed.rotation.y = a;
          const st = M(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 5), toon('#f3f2f2'), s * 0.155, 1.0 + lift, 0.33, body, 0); st.rotation.z = s * 0.06; M(new THREE.SphereGeometry(0.016, 6, 5), toon('#f3f2f2'), s * 0.165, 0.84 + lift, 0.33, body, 0); }
        const hem = M(squashed(new THREE.LatheGeometry([new THREE.Vector2(0.285, 0.36), new THREE.Vector2(0.29, 0.44)], 30, gap, Math.PI * 2 - gap * 2)), rib, 0, lift, 0, body, 0.012); hem.material = hem.material.clone(); hem.material.side = THREE.DoubleSide;
        const hoodUp = M(new THREE.SphereGeometry(0.25, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hood, 0, 1.19 + lift, -0.2, body, 0.02); hoodUp.scale.set(1.0, 0.42, 0.62); hoodUp.rotation.x = -0.75; hoodUp.material = hoodUp.material.clone(); hoodUp.material.side = THREE.DoubleSide;
        M(new THREE.TorusGeometry(0.2, 0.05, 8, 24, Math.PI * 1.25), hood, 0, 1.2 + lift, -0.02, body, 0.012).rotation.set(Math.PI / 2, 0, Math.PI * 0.5 - Math.PI * 0.125 + Math.PI);
        }
        // prints: chest logo on the tee (shows through the open front) and the big back print
        const printMat = tex => new THREE.MeshToonMaterial({ map: tex, gradientMap: grad, transparent: true, alphaTest: 0.05, side: THREE.FrontSide, polygonOffset: true, polygonOffsetFactor: -2 });
        const T = kind === 'tee';
        if (prints && prints.front) { const fw = T ? (prints.frontW || 1.78) : 0.62; const f = new THREE.Mesh(T ? new THREE.CylinderGeometry(0.322, 0.256, 0.43, 28, 1, true, -fw / 2, fw) : new THREE.CylinderGeometry(0.33, 0.275, 0.26, 16, 1, true, -fw / 2, fw), printMat(prints.front)); f.position.set(0, (T ? 0.895 : 1.0) + lift, 0); f.scale.z = 1.1; body.add(f); }
        if (prints && prints.back && T) {   // tee: the back print follows the shirt's own profile, up high between the shoulder blades
          const rAt = y => { for (let i = 0; i < prof.length - 1; i++) { const [r0, y0] = prof[i], [r1, y1] = prof[i + 1]; if (y >= y0 && y <= y1) return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return prof[prof.length - 1][0]; };
          const Y0 = 0.79, Y1 = 1.225, N = 16, pts = []; for (let i = 0; i <= N; i++) { const y = Y0 + (Y1 - Y0) * i / N; pts.push(new THREE.Vector2(rAt(y) + 0.012, y)); }
          const bw = 1.6, b = new THREE.Mesh(new THREE.LatheGeometry(pts, 28, Math.PI - bw / 2, bw), printMat(prints.back)); b.position.y = lift; body.add(b);
        } else if (prints && prints.back) { const bw = T ? 1.8 : 1.6; const b = new THREE.Mesh(T ? new THREE.CylinderGeometry(0.325, 0.264, 0.5, 28, 1, true, Math.PI - bw / 2, bw) : new THREE.CylinderGeometry(0.352, 0.298, 0.52, 24, 1, true, Math.PI - bw / 2, bw), printMat(prints.back)); b.position.set(0, (T ? 0.87 : 0.87) + lift, 0); b.scale.z = 0.93; body.add(b); }
        P.arms = T ? sleeve(tee, tee) : sleeve(hood, rib);
      } else if (kind === 'royal') {  // the King: gown, cape, ermine
        M(lathe([[0.36, 0.06], [0.4, 0.08], [0.36, 0.4], [0.3, 0.7], [0.3, 0.95], [0.34, 1.12], [0.24, 1.22], [0.12, 1.26], [0, 1.27]], (y, c) => c.copy(t1).lerp(t0, smooth(0.3, 1.1, y))), vcToon, 0, lift - 0.02, 0, body, 0.03);
        const cape = M(new THREE.CylinderGeometry(0.34, 0.52, 1.18, 28, 1, true, Math.PI * 0.62, Math.PI * 0.76), toon('#c42d3c', { side: THREE.DoubleSide }), 0, 0.62 + lift, -0.02, body, 0.03); cape.material.side = THREE.DoubleSide;
        const erm = toon('#ffffff'); M(new THREE.TorusGeometry(0.28, 0.08, 10, 30), erm, 0, 1.18 + lift, 0, body, 0.02).rotation.x = Math.PI / 2;
        for (let k = 0; k < 10; k++) { const a2 = k / 10 * Math.PI * 2; M(new THREE.BoxGeometry(0.025, 0.04, 0.02), C.ink, Math.sin(a2) * 0.35, 1.18 + lift, Math.cos(a2) * 0.35, body, 0).rotation.y = a2; }
        M(new THREE.TorusGeometry(0.38, 0.05, 8, 30), erm, 0, 0.08 + lift, 0, body, 0.012).rotation.x = Math.PI / 2;
        M(new THREE.TorusGeometry(0.3, 0.035, 8, 28), C.gold, 0, 0.72 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        badge(0, 0.98, 0.34, 0.11);
        P.arms = sleeve(C.mid, erm, true);
        P.legs.forEach(p => p.visible = false);
      }
    }
    // head
    const head = new THREE.Group(); head.position.y = 1.6 + lift + (L.headScale - 1) * 0.3; head.scale.setScalar(L.headScale); body.add(head); P.head = head;
    const skull = M(foxSkull(0.4, 40, 30, null, 0, 0, 0, L), fur, 0, 0, 0, head, 0.04, 0.4); skull.scale.set(L.headWidth, L.headHeight, 1);
    const SZ = 0.32, tipZ = SZ + 0.25 * L.snoutLength; const snoutMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad, emissive: new THREE.Color(L.snout || L.muzzle), emissiveIntensity: 0.32 }); const snout = M(snoutGeoFor(L), snoutMat, 0, -0.075, SZ, head, 0.022); snout.scale.set(L.snoutSize, L.snoutSize, L.snoutLength);
    M(new THREE.SphereGeometry(0.055, 14, 10), toon(L.nose), 0, -0.045, tipZ, head, 0.012, 0.055).scale.set(1.3 * L.snoutSize, 0.85 * L.snoutSize, 0.9);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); shine.position.set(-0.02, -0.027, tipZ + 0.048); head.add(shine);
    const fc = document.createElement('canvas'); fc.width = fc.height = 256; const fctx = fc.getContext('2d');
    const ftex = new THREE.CanvasTexture(fc); ftex.colorSpace = THREE.SRGBColorSpace; ftex.anisotropy = 4;
    const faceMat = new THREE.MeshToonMaterial({ map: ftex, transparent: true, alphaTest: 0.04, gradientMap: grad, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    const mask = new THREE.Mesh(foxSkull(0.403, 40, 32, Math.PI / 2 - 0.85, 1.7, Math.PI / 2 - 0.75, 1.5, L), faceMat); skull.add(mask);
    for (const s of [-1, 1]) for (const [dy, dz, len, rz] of [[-0.1, 0.1, 0.2, 0.55], [-0.2, 0.06, 0.16, 0.95]]) {
      const t = M(new THREE.ConeGeometry(0.06, len, 6), white, s * 0.42 * L.headWidth / 1.08, dy, dz, head, 0.016); t.rotation.z = -s * (Math.PI / 2 + rz); t.scale.setScalar(L.fluffSize); t.visible = L.fluffSize > 0.05;
    }
    for (const [x, rz, h] of [[-0.07, 0.4, 0.13], [0.02, -0.1, 0.16], [0.09, -0.5, 0.12]]) { const t = M(new THREE.ConeGeometry(0.06, h * L.headTuft, 6), furDark, x, 0.36 * L.headHeight / 0.96, 0.2, head, 0.014); t.visible = L.headTuft > 0.05; t.rotation.set(1.1, 0, rz); }
    P.ears = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.24 * L.earSpread, 0.27 * L.headHeight / 0.96, -0.02 - L.earBack * 0.12); e.rotation.z = -s * L.earTilt; e.scale.set(L.earWidth, L.earHeight, 1); e.userData.baseTilt = L.earTilt; e.userData.baseX = -L.earBack * 0.4; head.add(e);
      const outer = M(new THREE.ConeGeometry(0.17, 0.48, 4), ink, 0, 0.22, 0, e, 0.022); outer.rotation.y = Math.PI / 4; outer.scale.z = 0.5;
      const inner = M(new THREE.ConeGeometry(0.1, 0.32, 4), toon(L.earInner), 0, 0.17, 0.05, e, 0); inner.rotation.y = Math.PI / 4; inner.scale.z = 0.35;
      const fl = M(new THREE.ConeGeometry(0.06, 0.2, 5), white, 0, 0.06, 0.08, e, 0); fl.rotation.x = 0.4;
      return e; });
    if (bow) { const b = new THREE.Group(); b.position.set(0, 0.36, 0.12); b.rotation.x = -0.35; head.add(b);
      for (const s of [-1, 1]) { const w = M(new THREE.SphereGeometry(1, 14, 10), white, s * 0.11, 0, 0, b, 0.012); w.scale.set(0.11, 0.075, 0.045); w.rotation.z = s * 0.25; }
      M(new THREE.BoxGeometry(0.075, 0.07, 0.06), toon('#1e293b'), 0, 0, 0.01, b, 0.01); M(new THREE.SphereGeometry(0.018, 6, 4), toon('#38bdf8', { emissive: new THREE.Color('#38bdf8'), emissiveIntensity: 0.6 }), 0, 0, 0.045, b, 0); }
    if (L.elder) {
      const beardM = toon(L.beard || '#eef0f4');
      for (let i = 0; i < 7; i++) { const t2 = (i - 3) / 3, b = M(new THREE.ConeGeometry(0.075, 0.26 - Math.abs(t2) * 0.06, 6), beardM, t2 * 0.2, -0.33 + Math.abs(t2) * 0.05, 0.2 - Math.abs(t2) * 0.06, head, 0.014); b.rotation.set(Math.PI - 0.35, 0, t2 * 0.35); }
      for (const s of [-1, 1]) { const tm = M(new THREE.SphereGeometry(0.13, 12, 8), beardM, s * 0.36, 0.1, -0.05, head, 0.012, 0.13); tm.scale.set(0.5, 0.9, 1); }
    }
    if (crown) { const cw = new THREE.Group(); cw.position.set(0, 0.36, -0.02); cw.rotation.x = -0.12; head.add(cw); const gold = toon('#e6b45a', { emissive: new THREE.Color('#7a5a1a'), emissiveIntensity: 0.4 });
      M(new THREE.CylinderGeometry(0.2, 0.22, 0.1, 20, 1, true), gold, 0, 0, 0, cw, 0.015, 0.22);
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; M(new THREE.ConeGeometry(0.045, 0.14, 4), gold, Math.sin(a) * 0.2, 0.11, Math.cos(a) * 0.2, cw, 0.01); M(new THREE.SphereGeometry(0.025, 6, 4), toon('#c42d3c', { emissive: new THREE.Color('#c42d3c'), emissiveIntensity: 0.6 }), Math.sin(a) * 0.215, 0.0, Math.cos(a) * 0.215, cw, 0); } }
    if (glasses) { const lens = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.42 }); for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.016, 6, 22), toon('#334155')); r.position.set(s * 0.13, 0.03, 0.43); r.scale.x = 0.95 / 1.14; skull.add(r); const l = new THREE.Mesh(new THREE.CircleGeometry(0.095, 22), lens); l.position.set(s * 0.13, 0.03, 0.432); l.scale.x = 0.95 / 1.14; skull.add(l); } M(new THREE.BoxGeometry(0.08, 0.018, 0.018), toon('#334155'), 0, 0.05, 0.44, skull, 0); }
    if (cane) { const c = M(new THREE.CylinderGeometry(0.017, 0.017, 1.25, 6), white, 0, -0.9, 0.22, P.arms[1], 0.012); c.rotation.x = 0.35; M(new THREE.SphereGeometry(0.035, 6, 4), toon('#dc2626'), 0, -0.62, 0, c, 0); }
    const tail = new THREE.Group(); tail.position.set(0, 0.6 + lift, -0.24); body.add(tail); P.tail = tail;
    const tm = M(tailGeoFor(L), vcToon, 0, 0, 0, tail, 0.03); tm.rotation.x = -L.tailLift; tm.scale.setScalar(L.tailSize); if (L.tailSide) { tm.rotation.order = 'ZXY'; tm.rotation.z = L.tailSide; }   // tailSide: sweep the tail to one side (shows a back print)
    if (chair) {
      const ch = new THREE.Group(); g.add(ch); P.wheels = [];
      M(new THREE.BoxGeometry(0.7, 0.08, 0.6), toon('#334155'), 0, 0.6, 0, ch, 0.025); M(new THREE.BoxGeometry(0.7, 0.75, 0.08), toon('#334155'), 0, 1.0, -0.3, ch, 0.025);
      for (const s of [-1, 1]) { const w = M(new THREE.TorusGeometry(0.42, 0.045, 8, 28), toon('#0f172a'), s * 0.43, 0.45, -0.05, ch, 0.015); w.rotation.y = Math.PI / 2; M(new THREE.TorusGeometry(0.36, 0.015, 4, 20), toon('#cbd5e1'), 0, 0, 0, w, 0); P.wheels.push(w); M(new THREE.SphereGeometry(0.08, 8, 6), toon('#0f172a'), s * 0.3, 0.08, 0.32, ch, 0.01, 0.08); }
      M(new THREE.BoxGeometry(0.5, 0.05, 0.25), toon('#334155'), 0, 0.12, 0.4, ch, 0.015);
    }
    const hold = { left: gear === 'laser' || gear === 'both', right: gear === 'sword' || gear === 'both' };
    if (gear === 'laser') { hold.right = true; hold.left = false; }
    const glowCyan = new THREE.MeshToonMaterial({ color: '#e8f8ff', gradientMap: grad, emissive: new THREE.Color(L.armorAccent || '#38bdf8'), emissiveIntensity: 0.9 });
    const gold = toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.25 }), navy = toon('#1b2350'), steelL = toon('#cbd5e1'), wht = toon('#f3f4f6'), acc = toon(L.armorAccent || '#38bdf8', { emissive: new THREE.Color(L.armorAccent || '#38bdf8'), emissiveIntensity: 0.35 });
    if (gear === 'sword' || gear === 'both') {
      const sw = new THREE.Group(); sw.position.set(0, -0.42, 0.04); sw.scale.setScalar(0.8); P.arms[1].add(sw); P.sword = sw;
      M(new THREE.CylinderGeometry(0.035, 0.04, 0.24, 10), navy, 0, -0.02, 0, sw, 0.012, 0.04);
      for (let k = 0; k < 4; k++) M(new THREE.TorusGeometry(0.04, 0.009, 4, 12), gold, 0, -0.11 + k * 0.06, 0, sw, 0).rotation.x = Math.PI / 2;
      M(new THREE.SphereGeometry(0.055, 12, 8), gold, 0, -0.17, 0, sw, 0.012, 0.055);
      const guard = M(new THREE.BoxGeometry(0.09, 0.06, 0.42), gold, 0, 0.13, 0, sw, 0.014); 
      for (const sx of [-1, 1]) M(new THREE.SphereGeometry(0.04, 8, 6), gold, 0, 0.13, sx * 0.22, sw, 0.01, 0.04);
      M(new THREE.OctahedronGeometry(0.05, 0), acc, 0.05, 0.13, 0, sw, 0.008).scale.set(0.6, 1.3, 1);
      const bl = new THREE.Shape(); bl.moveTo(-0.045, 0); bl.lineTo(0.045, 0); bl.lineTo(0.045, 1.0); bl.lineTo(0, 1.16); bl.lineTo(-0.045, 1.0); bl.closePath();
      const bg = new THREE.ExtrudeGeometry(bl, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 1 }); bg.translate(0, 0, -0.011);
      const bladeMat = glowCyan.clone(); const blade = M(bg, bladeMat, 0, 0.16, 0, sw, 0); blade.rotation.y = Math.PI / 2; P.bladeMat = bladeMat;
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 1.35), new THREE.MeshBasicMaterial({ map: glowTexFor(), color: new THREE.Color(L.armorAccent || '#38bdf8'), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); halo.position.set(0, 0.75, 0); sw.add(halo); P.bladeHalo = halo; halo.visible = false; const bo = new THREE.Mesh(bg, outlineMat); bo.scale.set(1.35, 1.02, 1.6); bo.position.y = -0.01; blade.add(bo);
      M(new THREE.BoxGeometry(0.035, 0.85, 0.014), acc, 0, 0.62, 0, sw, 0);
    }
    if (gear === 'laser' || gear === 'both') {
      const arm = gear === 'laser' ? P.arms[1] : P.arms[0]; arm.children.filter(c => c.isMesh && c.geometry.type === 'SphereGeometry' && Math.abs(c.position.y + 0.4) < 0.01).forEach(c => c.scale.setScalar(0.75));
      const gn = new THREE.Group(); gn.position.set(0, -0.44, 0.1); gn.scale.setScalar(0.8); arm.add(gn); P.gun = gn;
      M(new THREE.BoxGeometry(0.13, 0.17, 0.42), wht, 0, 0.02, 0.14, gn, 0.016);
      M(new THREE.BoxGeometry(0.135, 0.05, 0.3), acc, 0, 0.1, 0.12, gn, 0.01);
      M(new THREE.BoxGeometry(0.1, 0.2, 0.1), navy, 0, -0.13, 0.0, gn, 0.014).rotation.x = -0.25;
      M(new THREE.BoxGeometry(0.04, 0.06, 0.12), navy, 0, -0.07, 0.12, gn, 0.008);
      const br = M(new THREE.CylinderGeometry(0.045, 0.055, 0.26, 14), steelL, 0, 0.03, 0.44, gn, 0.012, 0.055); br.rotation.x = Math.PI / 2;
      for (const z of [0.36, 0.46]) M(new THREE.TorusGeometry(0.056, 0.012, 6, 16), acc, 0, 0.03, z, gn, 0);
      const tipMat = glowCyan.clone(); M(new THREE.SphereGeometry(0.045, 12, 8), tipMat, 0, 0.03, 0.58, gn, 0.008, 0.045); P.tipMat = tipMat;
      const tipGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexFor(), color: new THREE.Color(L.armorAccent || '#38bdf8'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); tipGlow.position.set(0, 0.03, 0.6); tipGlow.scale.setScalar(0.3); gn.add(tipGlow); P.tipGlow = tipGlow;
      M(new THREE.BoxGeometry(0.02, 0.05, 0.16), glowCyan, 0.068, 0.01, 0.12, gn, 0); M(new THREE.BoxGeometry(0.02, 0.05, 0.16), glowCyan, -0.068, 0.01, 0.12, gn, 0);
      M(new THREE.BoxGeometry(0.03, 0.05, 0.04), navy, 0, 0.13, 0.3, gn, 0.006);
      gn.children.forEach(c => { c.position.y += 0.13; c.position.z += 0.06; });
      const pawM = toon(L.paw);
      for (let k = 0; k < 3; k++) M(new THREE.SphereGeometry(0.05, 10, 8), pawM, 0, 0.03 - k * 0.055, 0.125, gn, 0.012, 0.05).scale.set(1.25, 0.9, 0.9);
      M(new THREE.SphereGeometry(0.048, 10, 8), pawM, 0.075, 0.09, 0.07, gn, 0.012, 0.048).scale.set(0.8, 0.8, 1.3);
    }
    g.traverse(o => { if (o.isMesh && o.material !== outlineMat && o.material !== faceMat) o.castShadow = true; });
    g.userData = { hold, P, phase: rr(0, 6), amt: 0, blink: rr(1, 4), blinkT: 0, chair: !!chair, base: mood, mood, moodT: 0, look: 0, lookT: rr(1, 3), lookTo: 0, mouth: 0, talking: false, hop: 0, hopY: 0,
      face: { ctx: fctx, tex: ftex, eyeL: eyes[0], eyeR: eyes[1], key: '', L }, lookAt: null };
    g.scale.setScalar(L.bodyScale);
    scene.add(g); return g;
  }
  const tmpV = new THREE.Vector3();
  function animFox(c, dt, speed, air = false) {
    const u = c.userData, P = u.P, mv = speed > 0.2; u.phase += dt * (mv ? 3 + speed * 1.4 : 1.4); u.amt = damp(u.amt, mv ? Math.min(1, speed / 4) : 0, 10, dt);
    const mood = u.lineMood || u.mood, md = MOOD[mood] || MOOD.neutral, lively = mood === 'excited' || mood === 'happy';
    const sw = Math.sin(u.phase) * 0.9 * u.amt;
    if (u.hop > 0) { u.hop = Math.max(0, u.hop - dt * 2.6); }
    u.hopY = Math.sin((1 - u.hop) * Math.PI) * (u.hop > 0 ? 0.22 : 0);
    if (!u.chair) {
      P.legs[0].rotation.x = air ? -0.6 : sw; P.legs[1].rotation.x = air ? 0.4 : -sw;
      P.arms[0].rotation.x = air ? -2.3 : -sw * 0.8; P.arms[1].rotation.x = air ? -2.3 : sw * 0.8;
      P.body.position.y = Math.abs(Math.sin(u.phase)) * 0.06 * u.amt + u.hopY + (mv ? 0 : Math.sin(u.phase * 1.3) * 0.008);
    } else { P.wheels.forEach(w => w.rotation.x += speed * dt / 0.42); P.arms.forEach(a => a.rotation.x = -0.5 + Math.sin(u.phase) * 0.4 * u.amt); P.body.position.y = u.hopY * 0.4; }
    if (u.talking && !mv && !u.chair) { P.arms[1].rotation.x = -0.5 + Math.sin(u.phase * 2.2) * 0.25; P.arms[1].rotation.z = 0.35; } else { P.arms[1].rotation.z = 0.12; }
    P.arms[0].rotation.z = -0.12;
    if (u.hold && !air) { if (u.hold.right && !(u.talking && !mv)) { P.arms[1].rotation.x = P.arms[1].rotation.x * 0.35 - 0.55; P.arms[1].rotation.z = 0.18; } if (u.hold.left) { P.arms[0].rotation.x = P.arms[0].rotation.x * 0.35 - 0.75; P.arms[0].rotation.z = -0.16; } }
    u.pulseT = (u.pulseT || 0) + dt;
    if (P.sword) { P.sword.rotation.set(0.95 - P.arms[1].rotation.x, 0, -0.5); const p = 0.5 + 0.5 * Math.sin(u.pulseT * 3.2); P.bladeMat.emissiveIntensity = 0.4 + p * 1.6; P.bladeMat.color.setRGB(1, 1, 1).lerp(P.bladeMat.emissive, 0.15 + p * 0.65);  }
    if (P.tipMat) { const p = Math.pow(0.5 + 0.5 * Math.sin(u.pulseT * 5.0 + 1), 2); P.tipMat.emissiveIntensity = 0.6 + p * 2.6; P.tipGlow.scale.setScalar(0.18 + p * 0.32); P.tipGlow.material.opacity = 0.35 + p * 0.65; }
    if (P.gun) { const ga = P.gun.parent; P.gun.rotation.set(-ga.rotation.x - 0.05, 0, 0); }
    P.body.rotation.x = damp(P.body.rotation.x, mv ? 0.08 * u.amt : (mood === 'sad' ? 0.06 : mood === 'excited' ? -0.05 : 0), 6, dt);
    // tail + ears by mood
    const wag = lively ? 2.6 : mv ? 1 : 0.6;
    P.tail.rotation.y = Math.sin(u.phase * wag) * (lively ? 0.55 : 0.32); P.tail.rotation.x = (mood === 'sad' ? 0.5 : -0.1) + Math.sin(u.phase * 0.5) * 0.08;
    const earX = mood === 'sad' ? 0.55 : mood === 'stern' || mood === 'determined' ? 0.28 : mood === 'surprised' || lively ? -0.18 : 0;
    const earZ = mood === 'sad' ? 0.35 : 0;
    P.ears.forEach((e, i) => { const s = i ? 1 : -1; const flick = i === 1 && (u.phase % 7) < 0.22 ? -0.35 : 0; e.rotation.x = damp(e.rotation.x, (e.userData.baseX || 0) + earX + flick, 10, dt); e.rotation.z = damp(e.rotation.z, -s * ((e.userData.baseTilt ?? 0.3) + earZ), 8, dt); });
    // head: look at a target, idle tilt
    let hy = 0, hx = mood === 'sad' ? 0.12 : 0;
    if (u.lookAt) { c.updateWorldMatrix(true, false); tmpV.copy(u.lookAt); c.worldToLocal(tmpV); hy = clamp(Math.atan2(tmpV.x, tmpV.z), -0.85, 0.85); hx += clamp(-Math.atan2(tmpV.y - 1.6, Math.hypot(tmpV.x, tmpV.z)) * 0.5, -0.25, 0.25); }
    P.head.rotation.y = damp(P.head.rotation.y, hy, 6, dt); P.head.rotation.x = damp(P.head.rotation.x, hx, 6, dt);
    P.head.rotation.z = damp(P.head.rotation.z, (mood === 'curious' ? 0.16 : 0) + Math.sin(u.phase * 0.35) * 0.04, 5, dt);
    // face
    u.blink -= dt; if (u.blink < 0) { u.blinkT = 0.14; u.blink = rr(2, 5); } u.blinkT = Math.max(0, u.blinkT - dt);
    const bl = u.blinkT > 0 ? Math.sin((u.blinkT / 0.14) * Math.PI) : 0;
    u.lookT -= dt; if (u.lookT < 0) { u.lookT = rr(1.2, 3.5); u.lookTo = u.lookAt || u.talking ? 0 : pick([-1, -0.6, 0, 0, 0.6, 1]); }
    u.look = damp(u.look, u.lookTo, 8, dt);
    u.mouth = u.talking ? Math.max(0, Math.sin(u.phase * 7.5)) * 0.85 + 0.1 : damp(u.mouth, 0, 14, dt);
    const f = u.face, key = `${Math.round(bl * 4)}|${mood}|${Math.round(u.mouth * 5)}|${Math.round(u.look * 4)}`;
    if (key !== f.key) { f.key = key; drawFace(f.ctx, { L: f.L, eyeL: f.eyeL, eyeR: f.eyeR, blink: Math.round(bl * 4) / 4, mood, mouth: Math.round(u.mouth * 5) / 5, look: Math.round(u.look * 4) / 4 }); f.tex.needsUpdate = true; }
  }


  return { makeFox, animFox, MOOD, moodOf, setLook(l) { LOOK = { ...DEFAULT_LOOK, ...l }; }, getLook: () => ({ ...LOOK }) };
}
