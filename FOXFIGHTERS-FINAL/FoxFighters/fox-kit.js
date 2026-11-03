// Shared 3D fox model + face animation, used by every Meru scene.
export const LOOK_KEY = 'meru.foxLook.v1';
// FOX_SHAPE (Ben, s149 Fox Workshop): the shared head shape for every fox (snout, under the snout, ears, eyes). Colours stay per fox.
export const FOX_SHAPE = {"snoutLength":0.52,"earHeight":0.81,"earWidth":0.86,"earSpread":0.71,"earBack":0.32,"eyeSize":1.5,"eyeSpacing":72,"eyeY":80,"lashes":0,"muzzleWedge":0.31,"underDepth":1.6,"jawTuck":0.36,"muzzleLow":1.4,"throat":0,"chinLine":0.44,"underRise":0.59};
export const DEFAULT_LOOK = { ...{"armorAccent":"#38bdf8","snout":"#f9a96a","fur":"#f07a2a","furDark":"#c2410c","muzzle":"#ffb772","chin":"#ffc179","ear":"#1e293b","earInner":"#9d174d","fluff":"#ffe4c4","leg":"#e2e8f0","boot":"#0f172a","paw":"#f07a2a","nose":"#0b0a12","tailBase":"#c2410c","tailMid":"#fb923c","tailTip":"#ffffff","ink":"#1e293b","headScale":1.14,"headWidth":0.85,"headHeight":0.97,"cheeks":2,"chinPoint":1.5,"snoutLength":0.61,"snoutSize":0.77,"earHeight":0.98,"earWidth":0.75,"earSpread":0.82,"earTilt":0.52,"earBack":0.37,"fluffSize":0.86,"headTuft":0,"eyeSize":1.3,"eyeSpacing":64,"eyeY":86,"irisSize":1.08,"pupil":1,"eyeTilt":0,"lashes":1,"browWeight":10,"blush":0.28,"whiskers":1,"bodyScale":1,"legLength":1.5,"tailSize":1,"tailCurl":0.42,"tailLift":1.53}, ...FOX_SHAPE };
export const PLAYER_FEMALE = { ...{"armorAccent":"#38bdf8","snout":"#f9a96a","fur":"#f07a2a","furDark":"#c2410c","muzzle":"#ffb772","chin":"#ffc179","ear":"#1e293b","earInner":"#9d174d","fluff":"#ffe4c4","leg":"#e2e8f0","boot":"#0f172a","paw":"#f07a2a","nose":"#0b0a12","tailBase":"#c2410c","tailMid":"#fb923c","tailTip":"#ffffff","ink":"#1e293b","headScale":1.14,"headWidth":0.85,"headHeight":0.97,"cheeks":2,"chinPoint":1.5,"snoutLength":0.61,"snoutSize":0.77,"earHeight":0.98,"earWidth":0.75,"earSpread":0.82,"earTilt":0.52,"earBack":0.37,"fluffSize":0.86,"headTuft":0,"eyeSize":1.3,"eyeSpacing":64,"eyeY":86,"irisSize":1.08,"pupil":1,"eyeTilt":0,"lashes":1,"browWeight":10,"blush":0.28,"whiskers":1,"bodyScale":1,"legLength":1.5,"tailSize":1,"tailCurl":0.42,"tailLift":1.53}, ...FOX_SHAPE };
export const PLAYER_MALE = { ...{"armorAccent":"#38bdf8","snout":"#f3b26b","fur":"#f2741f","furDark":"#c2410c","muzzle":"#ffb772","chin":"#ffc179","ear":"#1e293b","earInner":"#9d174d","fluff":"#ffe4c4","leg":"#e2e8f0","boot":"#0f172a","paw":"#f2741f","nose":"#0b0a12","tailBase":"#d9560f","tailMid":"#f2741f","tailTip":"#ffffff","ink":"#1e293b","headScale":1.14,"headWidth":0.95,"headHeight":0.97,"cheeks":1.57,"chinPoint":1.01,"snoutLength":0.61,"snoutSize":0.85,"earHeight":0.98,"earWidth":1.5,"earSpread":0.82,"earTilt":0.52,"earBack":1,"fluffSize":1.8,"headTuft":1.14,"eyeSize":1.3,"eyeSpacing":64,"eyeY":86,"irisSize":1.08,"pupil":1,"eyeTilt":0,"lashes":1,"browWeight":10,"blush":0.28,"whiskers":1,"bodyScale":1,"legLength":1.5,"tailSize":1,"tailCurl":0.42,"tailLift":1.53}, ...FOX_SHAPE };   // same orange as Hope
// Hope: a bright orange fox, cream-white muzzle and chin, black ears, orange paws, white tail tip
export const HOPE_LOOK = { ...PLAYER_FEMALE, fur: '#f2741f', furDark: '#c2410c', snout: '#f6d2ad', muzzle: '#f7efe4', chin: '#ffffff', fluff: '#ffffff', ear: '#1c1917', earInner: '#3f2a22', paw: '#f2741f', tailBase: '#d9560f', tailMid: '#f2741f', tailTip: '#ffffff', ink: '#1c1917' };
export const KING_MIGHT = { ...PLAYER_MALE, elder: 1, fur: '#d9733a', furDark: '#9a4a22', muzzle: '#f1c9a6', snout: '#e8b48a', chin: '#f4f1ec', fluff: '#f4f4f6', tailMid: '#e8945a', tailTip: '#ffffff', browColor: '#f8fafc', browWeight: 10, beard: '#eef0f4', eyeSize: 1.05, irisSize: 0.9, eyeY: 96, headTuft: 0.6, fluffSize: 1.9, cheeks: 1.7, chinPoint: 0.8, headWidth: 1.0, earBack: 0.6, blush: 0, armorAccent: '#c42d3c', bodyScale: 1.08 };
export function loadLook() { try { return { ...DEFAULT_LOOK, ...JSON.parse(localStorage.getItem(LOOK_KEY) || '{}') }; } catch (e) { return { ...DEFAULT_LOOK }; } }
export function foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp, merge: MERGE_DEFAULT = false }) {
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
  const SUN = { w: 33, h: 27 };
  // closed fist paw (learned on the humans): rounded palm, a row of 4 knuckle pads, curled finger row under it, thumb wrapped across the front
  function pawFist(p, L0) { const L = L0 || p.userData.L || DEFAULT_LOOK, pm = toon(L.paw), sd = p.position.x >= 0 ? 1 : -1, g = new THREE.Group(); g.position.set(0, -0.4, 0.01); p.add(g);
    const palm = M(new THREE.SphereGeometry(0.088, 14, 10), pm, 0, 0.005, -0.01, g, 0.02, 0.09); palm.scale.set(1.05, 1.05, 0.95);
    for (let k = 0; k < 4; k++) { const x = (k - 1.5) * 0.04; M(new THREE.SphereGeometry(0.028, 10, 8), pm, x, -0.025, 0.066, g, 0.008, 0.028).scale.set(1, 0.95, 1.05); M(new THREE.SphereGeometry(0.024, 8, 6), pm, x * 0.95, -0.065, 0.045, g, 0.006, 0.024); }
    const th = M(new THREE.CapsuleGeometry(0.024, 0.05, 4, 8), pm, -sd * 0.05, -0.01, 0.07, g, 0.007); th.rotation.set(0.2, 0, sd * 1.25);
    return g; }
  function drawFace(g, f) {
    const W = 256; g.clearRect(0, 0, W, W);
    const md = MOOD[f.mood] || MOOD.neutral, L = f.L || DEFAULT_LOOK, ES = L.eyeSize, EX = L.eyeSpacing, EY = L.eyeY, INK = L.ink;
    // muzzle + chin
    const jd = (f.mouth || 0) * 32; g.fillStyle = L.muzzle; g.beginPath(); g.ellipse(128, 176 - jd * 0.15, 66 + jd * 0.45, 46 + jd * 0.55, 0, 0, 7); g.fill(); { const ml = L.muzzleLow ?? 1; g.beginPath(); g.ellipse(128, 200 + jd * 0.3, (60 + jd * 0.4) * ml, (30 + jd * 0.3) * ml, 0, 0, 7); g.fill(); } { const tg2 = g.createRadialGradient(128, 150 - jd * 0.4, 4, 128, 160 - jd * 0.3, 52); tg2.addColorStop(0, L.snout || L.muzzle); tg2.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = tg2; g.globalAlpha = 0.55 + jd * 0.01; g.beginPath(); g.ellipse(128, 156 - jd * 0.4, 46, 26, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
    { const cp = L.chinPatch ?? 1; g.fillStyle = L.chin; g.beginPath(); g.ellipse(128, 222 + jd - (cp - 1) * 10, (42 + jd * 0.2) * cp, (24 + jd * 0.25) * cp, 0, 0, 7); g.fill(); }
    { const mc = L.muzzle; g.save(); g.strokeStyle = mc; g.lineWidth = 3; g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const a = Math.PI * (0.05 + i / 25 * 0.9), ex = 128 + Math.cos(a) * 64 * (1 + jd * 0.006), ey = 176 - jd * 0.15 + Math.sin(a) * 44 - 44 * 0.15; if (Math.sin(a) > 0.5) continue; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + Math.cos(a) * 6, ey - Math.abs(Math.sin(a)) * 5 - 2); g.stroke(); } g.restore(); }
    { const ct = L.chinTuft ?? 1; if (ct > 0.02) { g.save(); g.fillStyle = L.chin; for (const [dx, dy, rz] of [[-10, 0, 0.3], [0, 4, 0], [10, 0, -0.3]]) { g.beginPath(); g.ellipse(128 + dx * Math.min(1.6, 0.6 + 0.4 * ct), 240 + jd + dy + 4 * ct, 5 * Math.min(1.5, 0.5 + 0.5 * ct), 9 * ct, rz, 0, 7); g.fill(); } g.restore(); } }
    if (L.elder) { g.fillStyle = 'rgba(235,235,240,0.55)'; for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI, r = 58 + (i % 3) * 6; g.beginPath(); g.ellipse(128 + Math.cos(a) * r * 0.9, 178 + Math.sin(a) * r * 0.55, 6, 3, a, 0, 7); g.fill(); } }
    const cl = -(f.mouth || 0) * 8; for (const x of [128 - EX - 4, 128 + EX + 4]) { const bg2 = g.createRadialGradient(x, 150 + cl, 2, x, 150 + cl, 22); bg2.addColorStop(0, `rgba(244,114,182,${L.blush})`); bg2.addColorStop(1, 'rgba(244,114,182,0)'); g.fillStyle = bg2; g.beginPath(); g.ellipse(x, 150 + cl, 22, 12, 0, 0, 7); g.fill(); if (L.blush > 0.15) { g.save(); g.strokeStyle = `rgba(219,39,119,${L.blush * 1.2})`; g.lineWidth = 2; g.lineCap = 'round'; for (let q = 0; q < 3; q++) { g.beginPath(); g.moveTo(x - 8 + q * 7, 146 + cl); g.lineTo(x - 11 + q * 7, 153 + cl); g.stroke(); } g.restore(); } }
    if ((f.mouth || 0) > 0.08) { const sh = g.createLinearGradient(0, 190, 0, 214); sh.addColorStop(0, 'rgba(120,53,15,0)'); sh.addColorStop(1, `rgba(120,53,15,${0.25 * f.mouth})`); g.fillStyle = sh; g.beginPath(); g.ellipse(128, 204, 44, 14, 0, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(30,41,59,0.45)'; g.lineWidth = 2; g.lineCap = 'round';
    if (L.whiskers > 0.5) for (const s of [-1, 1]) for (const dy of [0, 9]) { g.beginPath(); g.moveTo(128 + s * 56, 170 + dy + cl * 0.5); g.lineTo(128 + s * 84, 164 + dy * 1.5 + cl); g.stroke(); }
    { const bx = 128, by2 = EY - 4 * ES, tg3 = g.createRadialGradient(bx, by2, 1, bx, by2, 16 * ES), c3 = new THREE.Color(L.snout || L.muzzle), rgb = 'rgba(' + Math.round(c3.r * 255) + ',' + Math.round(c3.g * 255) + ',' + Math.round(c3.b * 255) + ','; tg3.addColorStop(0, rgb + '0.95)'); tg3.addColorStop(0.6, rgb + '0.6)'); tg3.addColorStop(1, rgb + '0)'); g.fillStyle = tg3; g.beginPath(); g.ellipse(bx, by2, 13 * ES, 17 * ES, 0, 0, 7); g.fill(); }
    // eye area: soft darker socket, light brow fur, a few fur flicks at the outer corners
    for (const side of [-1, 1]) { const cx = 128 + side * EX, cy = EY; g.save(); const sg = g.createRadialGradient(cx, cy + 2, 18 * ES, cx, cy, 40 * ES); sg.addColorStop(0, 'rgba(150,60,20,0.12)'); sg.addColorStop(1, 'rgba(120,40,10,0)'); g.fillStyle = sg; g.beginPath(); g.ellipse(cx, cy, 40 * ES, 34 * ES, 0, 0, 7); g.fill();
      const lg = g.createRadialGradient(cx - side * 4, cy - 30 * ES, 2, cx, cy - 26 * ES, 26 * ES); lg.addColorStop(0, 'rgba(255,214,170,0.55)'); lg.addColorStop(1, 'rgba(255,214,170,0)'); g.fillStyle = lg; g.beginPath(); g.ellipse(cx, cy - 26 * ES, 28 * ES, 12 * ES, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(160,60,15,0.55)'; g.lineWidth = 2.2; g.lineCap = 'round'; for (let q = 0; q < 3; q++) { const a0 = -0.35 + q * 0.32, x0 = cx + side * 25 * ES * Math.cos(a0), y0 = cy + 2 + 22 * ES * Math.sin(a0); g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + side * 7 * ES, y0 - 1, x0 + side * 11 * ES, y0 - 4 + q * 2); g.stroke(); }
      g.restore(); }
    // eyes
    const eye = (cx, cy, side, col) => {
      g.save(); g.translate(cx, cy); g.rotate(-side * L.eyeTilt); g.translate(-cx, -cy); const hw = 25 * ES, hh = 24 * ES, open = Math.max(0, (1 - f.blink) * (1 - Math.max(0, md.lid + Math.max(0, (f.mouth || 0) - 0.5) * 0.35)));
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
      const gr = g.createRadialGradient(ix, iy + ir * 0.35, ir * 0.1, ix, iy, ir); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.25, col); gr.addColorStop(0.8, col); gr.addColorStop(1, '#0f2a2a');
      g.fillStyle = gr; g.beginPath(); g.arc(ix, iy, ir, 0, 7); g.fill();
      g.fillStyle = 'rgba(12,18,30,0.5)'; g.beginPath(); g.ellipse(ix, iy - ir * 0.45, ir, ir * 0.6, 0, Math.PI, 0); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = 1.4; for (let q = 0; q < 10; q++) { const a = q / 10 * Math.PI * 2; g.beginPath(); g.moveTo(ix + Math.cos(a) * ir * 0.35, iy + Math.sin(a) * ir * 0.35); g.lineTo(ix + Math.cos(a) * ir * 0.8, iy + Math.sin(a) * ir * 0.8); g.stroke(); }
      g.strokeStyle = '#0b1430'; g.lineWidth = 2.5; g.beginPath(); g.arc(ix, iy, ir - 1, 0, 7); g.stroke();
      g.fillStyle = '#0b0a12'; g.beginPath(); g.ellipse(ix, iy + 1, 4.5 * md.iris * L.pupil * ES, 10 * md.iris * L.pupil * ES, 0, 0, 7); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(ix - 6 * ES, iy - 7 * ES, 7.5 * ES, 6 * ES, -0.4, 0, 7); g.fill(); g.beginPath(); g.arc(ix - 1 * ES, iy - 11 * ES, 1.8 * ES, 0, 7); g.fill(); { const sx2 = ix + 7 * ES, sy2 = iy - 8 * ES, k = 3.2 * ES; g.beginPath(); g.moveTo(sx2, sy2 - k); g.lineTo(sx2 + k * 0.28, sy2); g.lineTo(sx2, sy2 + k); g.lineTo(sx2 - k * 0.28, sy2); g.closePath(); g.moveTo(sx2 - k, sy2); g.lineTo(sx2, sy2 + k * 0.28); g.lineTo(sx2 + k, sy2); g.lineTo(sx2, sy2 - k * 0.28); g.closePath(); g.fill(); } g.beginPath(); g.arc(ix + 6 * ES, iy + 6 * ES, 2.6 * ES, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(ix, iy + ir * 0.7, ir * 0.55, ir * 0.14, 0, 0, 7); g.fill();
      g.restore();
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, ccy, hw, ry, 0, Math.PI * 1.02, Math.PI * 1.98); g.stroke(); g.lineWidth = 7.5; g.beginPath(); g.ellipse(cx, ccy, hw, ry, 0, side > 0 ? Math.PI * 1.3 : Math.PI * 1.08, side > 0 ? Math.PI * 1.92 : Math.PI * 1.7); g.stroke();
      if (L.lashes > 0.5) { g.lineWidth = 4.5; for (const [k0, k1] of [[0.35, 0.8], [0.62, 1.05]]) { g.beginPath(); g.moveTo(cx + side * hw * (1 - k0 * 0.15), ccy - ry * k0); g.quadraticCurveTo(cx + side * (hw + 6), ccy - ry * k1, cx + side * (hw + 10), ccy - ry * k1 - 6); g.stroke(); } }
      g.lineWidth = 2.2; g.strokeStyle = 'rgba(30,41,59,0.6)'; g.beginPath(); g.ellipse(cx, ccy, hw * 0.92, ry, 0, Math.PI * 0.18, Math.PI * 0.82); g.stroke(); g.restore();
    };
    eye(128 - EX, EY, -1, f.eyeL); eye(128 + EX, EY, 1, f.eyeR);
    if (L.scar) {   // FACIAL SCAR (s149, Lox): a pale slash from brow to cheek through the eye that is not patched, with stitch ticks
      const sx = L.eyePatch === 'R' ? -1 : 1, cx = 128 + sx * EX, x0 = cx - sx * 4, y0 = EY - 46 * ES, x1 = cx + sx * 16, y1 = EY + 52 * ES;
      const gap = 30 * ES, ta = (EY - gap - y0) / (y1 - y0), tb = (EY + gap - y0) / (y1 - y0), segs = [[0, ta], [tb, 1]], pt = t2 => [x0 + (x1 - x0) * t2, y0 + (y1 - y0) * t2];   // the scar skips the eyeball (stops at the lids)
      g.save(); g.lineCap = 'round'; for (const [lw, col] of [[9, 'rgba(70,20,16,0.85)'], [4, '#f2c6b4']]) { g.strokeStyle = col; g.lineWidth = lw; for (const [a0, a1] of segs) { const [ax, ay] = pt(a0), [bx, by] = pt(a1); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); } }
      g.strokeStyle = 'rgba(70,20,16,0.9)'; g.lineWidth = 2.5; for (let k = 1; k < 6; k++) { const t2 = k / 6, px = x0 + (x1 - x0) * t2, py = y0 + (y1 - y0) * t2; if (Math.abs(py - EY) < gap + 4) continue; g.beginPath(); g.moveTo(px - 7, py - 1.5 * sx); g.lineTo(px + 7, py + 1.5 * sx); g.stroke(); } g.restore(); }
    if (L.eyePatch) {   // EYE PATCH (s149, Lox): black patch over one eye + the strap running up over the brow and round the side
      const sx = L.eyePatch === 'R' ? 1 : -1, cx = 128 + sx * EX, rw = 30 * ES, rh = 27 * ES;
      g.save(); g.fillStyle = '#141312'; g.beginPath(); g.ellipse(cx, EY + 2, rw, rh, sx * 0.15, 0, 7); g.fill(); g.strokeStyle = '#3a3634'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, EY + 2, rw - 5, rh - 5, sx * 0.15, 0, 7); g.stroke(); g.restore(); }
    if (f.sun) {   // sunglasses painted onto the face so the lenses wrap the head exactly
      const lw = SUN.w * ES, lh = SUN.h * ES;
      g.lineJoin = 'round'; g.strokeStyle = '#111827'; g.lineWidth = 6; g.beginPath(); g.moveTo(128 - EX + lw * 0.7, EY - lh * 0.45); g.quadraticCurveTo(128, EY - lh * 0.75, 128 + EX - lw * 0.7, EY - lh * 0.45); g.stroke();
      for (const s of [-1, 1]) { const cx = 128 + s * EX; g.save(); g.translate(cx, EY); g.rotate(-s * L.eyeTilt * 0.5);
        g.fillStyle = '#0b0f19'; g.beginPath(); g.ellipse(0, 0, lw, lh, 0, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = '#111827'; g.stroke();
        g.strokeStyle = 'rgba(148,163,184,0.55)'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.ellipse(0, 0, lw * 0.7, lh * 0.66, 0, Math.PI * 1.1, Math.PI * 1.45); g.stroke(); g.restore(); }
    }
    // brows
    g.strokeStyle = L.browColor || INK; g.lineWidth = L.browWeight; g.lineCap = 'round';
    for (const [cx, side] of [[128 - EX, -1], [128 + EX, 1]]) {
      const extra = side < 0 ? (md.browL || 0) : (md.browR || 0);
      const ix = cx - side * 14 * ES, ox = cx + side * 20 * ES, by = EY - 40 * ES - (f.browUp || 0) * 7, iy = by + md.bi + extra, oy = by - 2 + md.bo + extra, mxB = (ix + ox) / 2, myB = Math.min(iy, oy) - 5, bw = L.browWeight;
      g.save(); g.fillStyle = g.strokeStyle; g.beginPath(); g.moveTo(ix, iy - bw * 0.55); g.quadraticCurveTo(mxB, myB - bw * 0.45, ox, oy - bw * 0.12); g.lineTo(ox, oy + bw * 0.12); g.quadraticCurveTo(mxB, myB + bw * 0.45, ix, iy + bw * 0.55); g.closePath(); g.fill(); g.beginPath(); g.arc(ix, iy, bw * 0.55, 0, 7); g.fill(); g.restore();
      if (L.elder) { g.save(); g.lineWidth = 3; g.strokeStyle = 'rgba(30,41,59,0.55)'; g.beginPath(); g.moveTo(ix, iy + 6); g.quadraticCurveTo((ix + ox) / 2, Math.min(iy, oy) + 1, ox, oy + 6); g.stroke(); g.lineWidth = 4; g.strokeStyle = L.browColor || '#fff'; for (let t = 0; t < 3; t++) { const px = ox + side * (2 + t * 5), py = oy + t * 4; g.beginPath(); g.moveTo(px - side * 8, py); g.lineTo(px, py + 5); g.stroke(); } g.restore(); }
    }
    if (L.elder) { g.save(); g.strokeStyle = 'rgba(120,60,20,0.45)'; g.lineWidth = 2.5; g.lineCap = 'round';
      for (const s of [-1, 1]) { const cx = 128 + s * EX; g.beginPath(); g.moveTo(cx + s * 26 * ES, EY + 6); g.lineTo(cx + s * 36 * ES, EY + 2); g.moveTo(cx + s * 26 * ES, EY + 12); g.lineTo(cx + s * 35 * ES, EY + 14); g.stroke(); }
      g.beginPath(); g.moveTo(112, 44); g.quadraticCurveTo(128, 40, 144, 44); g.moveTo(116, 54); g.quadraticCurveTo(128, 51, 140, 54); g.stroke(); g.restore(); }
    // mouth
    const m = f.mouth, mx = 128, my = 214, vis = f.vis || 'a'; g.strokeStyle = '#1e293b'; g.lineWidth = 14; g.lineCap = 'round'; g.lineJoin = 'round';
    g.save(); g.fillStyle = 'rgba(120,53,15,0.18)'; g.beginPath(); g.ellipse(mx, my + 22, 12, 4, 0, 0, 7); g.fill(); g.restore();
    const gm = md.mouth === 'grin' ? Math.max(m, 0.55) : m; if (gm > 0.08) { const m = gm, w = 26 + m * 10 - (vis === 'o' ? 8 : 0), d = 8 + m * 48, top = my - 8;
      const uw = w * 0.45, uh = 3 + m * 14; const MP = new Path2D(); MP.moveTo(mx - w, top); MP.quadraticCurveTo(mx - uw * 1.25, top - uh * 0.1, mx - uw * 0.85, top - uh * 0.75); MP.quadraticCurveTo(mx, top - uh * 1.35, mx + uw * 0.85, top - uh * 0.75); MP.quadraticCurveTo(mx + uw * 1.25, top - uh * 0.1, mx + w, top); MP.bezierCurveTo(mx + w * 0.98, top + d * 1.1, mx - w * 0.98, top + d * 1.1, mx - w, top); MP.closePath(); g.fillStyle = '#3a0f1c'; g.fill(MP);
      g.save(); g.clip(MP); g.fillStyle = '#f0708a'; g.beginPath(); g.ellipse(mx, top + d * 0.95, w * 0.62, d * 0.42, 0, 0, 7); g.fill(); if (vis !== 'o' && vis !== 'm') { g.fillStyle = '#ffffff'; g.fillRect(mx - w, top - uh, w * 2, Math.min(6, uh * 0.5)); } g.restore();
      g.lineWidth = 9; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(MP);
    } else {
      g.beginPath();
      if (md.mouth === 'w') { g.moveTo(mx - 14, my - 4); g.quadraticCurveTo(mx - 7, my + 6, mx, my - 2); g.quadraticCurveTo(mx + 7, my + 6, mx + 14, my - 4); }
      else if (md.mouth === 'smile') { g.moveTo(mx - 22, my - 8); g.bezierCurveTo(mx - 20, my + 12, mx + 20, my + 12, mx + 22, my - 8); }
      else if (md.mouth === 'o') { g.ellipse(mx, my + 1, 6, 7, 0, 0, 7); g.fillStyle = '#5b1a2a'; g.fill(); }
      else if (md.mouth === 'frown') { g.moveTo(mx - 12, my + 4); g.quadraticCurveTo(mx, my - 6, mx + 12, my + 4); }
      else if (md.mouth === 'smirk') { g.moveTo(mx - 12, my); g.quadraticCurveTo(mx + 4, my + 4, mx + 16, my - 8); }
      else { g.moveTo(mx - 16, my - 2); g.bezierCurveTo(mx - 12, my + 4, mx + 12, my + 4, mx + 16, my - 2); }
      g.stroke(); if (md.mouth !== 'o') { g.save(); g.lineWidth = 5; g.strokeStyle = 'rgba(30,41,59,0.6)'; for (const sx of [-1, 1]) { g.beginPath(); g.arc(mx + sx * 21, my - 3, 3.5, sx > 0 ? Math.PI * 0.6 : Math.PI * -0.6, sx > 0 ? Math.PI * 1.1 : Math.PI * 0.1, sx < 0); g.stroke(); } g.restore(); }
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
      if (y > 0.2) y -= (y - 0.2) * 0.32;                                   // flatter, wider fox crown
      if (y > 0) x *= 1 + 0.06 * Math.min(1, y * 2);                          // broad between the ears
      if (z < 0) { z *= 0.74; if (y > 0) y *= 1 - 0.14 * (-z); } else z *= 1 - 0.1 * Math.max(0, y);
      if (z > 0) z += 0.2 * z * Math.exp(-(((y - 0.02) / 0.34) ** 2)) * Math.exp(-((x / 0.5) ** 2));   // profile: forehead slopes forward into the snout (fox 'stop')
      if (y < -0.5 && z < 0.3) y += (-0.5 - y) * (L.jawTuck ?? 0.25);
      if (z > 0.1 && y < -0.22) { const tt = Math.min(1, (-0.22 - y) / 0.6); z -= (L.throat ?? 0.35) * tt * (z - 0.1); y += 0.12 * (L.throat ?? 0.35) * tt * Math.max(0, z); }   // throat: lower front recedes under the snout (fox jaw line)                       // tuck the jaw so the head is not a ball underneath
      if (z > 0 && y < 0.15 && y > -0.6) { const br = Math.exp(-((x / 0.42) ** 2)) * Math.exp(-(((y + 0.18) / 0.3) ** 2)); z += (L.muzzleWedge ?? 0.26) * br * z; }  // muzzle wedge running into the snout
      { const ruff = Math.exp(-(((y + 0.35) / 0.22) ** 2)) * Math.max(0, 1 - Math.abs(z) * 0.6); x *= 1 + 0.12 * L.cheeks * ruff; }  // cheek ruff flares out (triangle face)
      p.setXYZ(i, x * r, y * r, z * r);
    }
    g.computeVertexNormals(); return g;
  }
  const snoutGeoFor = L => { const k = 'snout' + (L.snout || L.muzzle) + (L.underSnout || L.chin) + '|' + (L.underDepth ?? 1) + '|' + (L.underWidth ?? 1) + '|' + (L.chinLine ?? 0) + '|' + (L.underRise ?? 0.45); if (geoCache.has(k)) return geoCache.get(k); const gg = (() => {
    const prof = [[0, 0], [0.18, 0.0], [0.185, 0.05], [0.17, 0.13], [0.14, 0.21], [0.1, 0.28], [0.062, 0.33], [0.026, 0.37], [0, 0.38]];
    const top = C3(L.snout || L.muzzle), wh = C3(L.underSnout || L.chin), uD = L.underDepth ?? 1, uW = L.underWidth ?? 1, cL = (L.chinLine ?? 0) * 0.05, uR = L.underRise ?? 0.45;
    const g = new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 22); g.rotateX(Math.PI / 2);
    const p = g.attributes.position, c = new Float32Array(p.count * 3), col = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const t = Math.min(1, Math.max(0, p.getZ(i) / 0.38)); if (p.getY(i) < 0) p.setY(i, p.getY(i) * (1 - uR * Math.pow(t, 1.3))); else p.setY(i, p.getY(i) * (1 - 0.18 * t)); p.setX(i, p.getX(i) * (1 - 0.12 * t)); const y = p.getY(i); p.setX(i, p.getX(i) * 1.2 * (1 + (uW - 1) * smooth(0.02, -0.08, y))); p.setY(i, y * (y > 0 ? 0.78 : 0.62 * uD) + p.getZ(i) * 0.12); col.copy(top).lerp(wh, smooth(-0.03 + cL, -0.09 + cL, y)); c.set([col.r, col.g, col.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); return g;
  })(); geoCache.set(k, gg); return gg; };
  let _glowT = null;
  function glowTexFor() { if (_glowT) return _glowT; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); _glowT = new THREE.CanvasTexture(c); _glowT.colorSpace = THREE.SRGBColorSpace; return _glowT; }
  function makeFox({ key, name, torso, crest, bow, glasses, legColor, cane, chair, crown, eyes = ['#38bdf8', '#38bdf8'], mood = 'neutral', look, gear = 'none', outfit = 'armor', merged }) {
    const L = { ...LOOK, ...(look || {}) };
    if (typeof torso === 'string') { const c = new THREE.Color(torso); torso = [torso, '#' + c.clone().multiplyScalar(0.72).getHexString(), '#' + c.clone().multiplyScalar(0.42).getHexString()]; }   // one colour → light / mid / dark
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
      { const st = M(new THREE.BoxGeometry(0.035, 0.12, 0.03), trim, 0, 0.73 + lift, 0.345, body, 0); st.rotation.x = -0.2; }   // s149: gold centre strip shortened so it stops below the crest
      M(new THREE.TorusGeometry(0.2, 0.045, 8, 26), steel, 0, 1.24 + lift, 0.01, body, 0.012).rotation.x = Math.PI / 2;
      // crest medallion
      const crestM = new THREE.MeshToonMaterial({ map: armorCrest(crest), gradientMap: grad, emissive: 0xffffff, emissiveMap: armorCrest(crest), emissiveIntensity: 0.18 });
      // s149: the crest is a DECAL that hugs the breastplate (projected onto the cuirass lathe profile) instead of a disc standing off it
      { const PR = [[0.255, 0.66], [0.3, 0.7], [0.335, 0.82], [0.36, 0.98], [0.355, 1.08], [0.32, 1.17], [0.22, 1.23], [0.1, 1.255]], rAt = y => { const sm = (k, y0) => { const f = Math.max(0, Math.min(1, (y0 - PR[k - 1][1]) / (PR[k][1] - PR[k - 1][1]))); return PR[k - 1][0] + (PR[k][0] - PR[k - 1][0]) * f; }; let r = 0, wsum = 0; for (const d of [-0.03, -0.015, 0, 0.015, 0.03]) { const yy = y + d; let v = PR[PR.length - 1][0]; if (yy <= PR[0][1]) v = PR[0][0]; else for (let k = 1; k < PR.length; k++) if (yy <= PR[k][1]) { v = sm(k, yy); break; } const w = 1 - Math.abs(d) * 20; r += v * w; wsum += w; } return r / wsum; };   // smoothed profile (no kink line)
        const CY0 = 1.0, RD = 0.18, zAt = (x, y, off) => { const r = rAt(y) + off; return Math.sqrt(Math.max(0, r * r - x * x)) * 1.12; };
        const decal = (rad, off, N = 22) => { const pos = [], uv = [], idx = []; for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) { const u = i / N, v = j / N, x = (u * 2 - 1) * rad, y = CY0 + (v * 2 - 1) * rad; pos.push(x, y, zAt(x, y, off)); uv.push(u, v); }
          for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const p = j * (N + 1) + i, cx = ((i + 0.5) / N * 2 - 1), cy = ((j + 0.5) / N * 2 - 1); if (cx * cx + cy * cy > 1.08) continue; idx.push(p, p + 1, p + N + 2, p, p + N + 2, p + N + 1); }
          const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); gg.setIndex(idx); gg.computeVertexNormals(); gg.translate(0, lift, 0); return gg; };
        const rimPts = []; for (let k = 0; k <= 64; k++) { const an = k / 64 * Math.PI * 2, x = Math.cos(an) * (RD + 0.012), y = CY0 + Math.sin(an) * (RD + 0.012); rimPts.push(new THREE.Vector3(x, y + lift, zAt(x, y, 0.014))); }
        const rim = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPts, true), 96, 0.016, 6, true), accent); rim.userData.crest = true; body.add(rim);
        const cm = new THREE.MeshBasicMaterial({ map: crestM.map, color: 0xeeeeee, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });   // unlit: no toon shading band across the curved crest
        const med = new THREE.Mesh(decal(RD, 0.012), cm); med.userData.crest = true; body.add(med); }
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
        pawFist(p, L); return p; });
      P.legs.forEach(p => { M(new THREE.CylinderGeometry(0.105, 0.095, 0.2, 14), plate, 0, -0.28, 0.005, p, 0.016, 0.105); M(new THREE.SphereGeometry(0.075, 10, 8), plateMid, 0, -0.14, 0.06, p, 0.012, 0.075).scale.set(1, 0.8, 0.7); M(new THREE.TorusGeometry(0.1, 0.014, 6, 18), trim, 0, -0.19, 0.005, p, 0).rotation.x = Math.PI / 2; });
    } else {
      // ---- clothes (everyone who is not a guard) ----
      const C = { light: toon(torso[0]), mid: toon(torso[1]), dark: toon(torso[2]), gold: toon('#e6b45a', { emissive: new THREE.Color('#5a3e10'), emissiveIntensity: 0.25 }), cream: toon('#f7f1e6'), ink: toon('#1e293b'), fur: toon('#f8fafc') };
      const lathe = (pts, col, segs = 26, squash = 1.1) => { const gg = latheColored(pts, (y, c) => typeof col === 'function' ? col(y, c) : c.copy(col), segs); const pp = gg.attributes.position; for (let i = 0; i < pp.count; i++) { const z = pp.getZ(i); pp.setZ(i, z > 0 ? z * squash : z * 0.92); } gg.computeVertexNormals(); return gg; };
      const badge = (x, y, z, r = 0.075, rx = -0.2) => { const tex = armorCrest(crest); const bm = M(new THREE.CylinderGeometry(r, r, 0.02, 28), [C.gold, new THREE.MeshToonMaterial({ map: tex, gradientMap: grad }), C.gold], x, y + lift, z, body, 0.008, r); bm.rotation.set(Math.PI / 2 + rx, Math.PI / 2, 0, 'XYZ'); return bm; };
      const sleeve = (mat, cuffMat, wide = false) => [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.4, 1.12 + lift, 0); p.scale.setScalar(1.25); body.add(p);
        if (wide) { M(new THREE.CylinderGeometry(0.075, 0.15, 0.34, 14, 1, true), mat, 0, -0.2, 0, p, 0.016, 0.15); M(new THREE.TorusGeometry(0.148, 0.018, 6, 18), cuffMat, 0, -0.37, 0, p, 0).rotation.x = Math.PI / 2; }
        else { M(new THREE.CapsuleGeometry(0.078, 0.26, 4, 10), mat, 0, -0.17, 0, p, 0.02); M(new THREE.CylinderGeometry(0.088, 0.088, 0.07, 14), cuffMat, 0, -0.31, 0, p, 0.012, 0.088); }
        pawFist(p, L); return p; });
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
      } else if (kind === 'tee') {    // plain T-shirt (diner crew): ringer collar + short sleeves
        M(lathe([[0, 0.5], [0.27, 0.5], [0.285, 0.6], [0.26, 0.72], [0.28, 0.95], [0.31, 1.1], [0.22, 1.21], [0.1, 1.25], [0, 1.26]], (y, c) => c.copy(t0)), vcToon, 0, lift, 0, body, 0.028);
        M(new THREE.TorusGeometry(0.135, 0.028, 8, 24), C.dark, 0, 1.235 + lift, 0.02, body, 0.008).rotation.x = Math.PI / 2;
        M(new THREE.TorusGeometry(0.272, 0.022, 6, 28), C.dark, 0, 0.52 + lift, 0, body, 0).rotation.x = Math.PI / 2;
        P.arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.4, 1.12 + lift, 0); p.scale.setScalar(1.25); body.add(p);
          M(new THREE.CylinderGeometry(0.095, 0.105, 0.14, 14), C.light, 0, -0.06, 0, p, 0.014, 0.105); M(new THREE.TorusGeometry(0.1, 0.016, 6, 16), C.dark, 0, -0.13, 0, p, 0).rotation.x = Math.PI / 2;
          M(new THREE.CapsuleGeometry(0.06, 0.2, 4, 10), toon(L.fur), 0, -0.24, 0, p, 0.018); pawFist(p, L); return p; });
      } else if (kind === 'boxer') {  // bare-chested boxer: torso[0] shorts · torso[1] waistband · torso[2] gloves
        M(lathe([[0, 0.7], [0.27, 0.7], [0.27, 0.95], [0.3, 1.1], [0.22, 1.21], [0.1, 1.25], [0, 1.26]], (y, c) => c.copy(C3(L.fur))), vcToon, 0, lift, 0, body, 0.028);
        M(new THREE.SphereGeometry(0.17, 14, 10), white, 0, 0.98 + lift, 0.18, body, 0.01, 0.17).scale.set(1, 1.25, 0.45);
        M(lathe([[0, 0.4], [0.3, 0.4], [0.335, 0.5], [0.3, 0.62], [0.28, 0.72], [0, 0.72]], (y, c) => c.copy(t0)), vcToon, 0, lift, 0, body, 0.028);
        M(new THREE.TorusGeometry(0.285, 0.05, 8, 28), toon(torso[1]), 0, 0.71 + lift, 0, body, 0.008).rotation.x = Math.PI / 2;
        for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.035, 0.26, 0.02), toon(torso[1]), sx * 0.3, 0.55 + lift, 0.05, body, 0).rotation.z = sx * 0.12;
        P.arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.38, 1.12 + lift, 0); p.scale.setScalar(1.25); body.add(p);
          M(new THREE.CapsuleGeometry(0.065, 0.24, 4, 10), fur, 0, -0.2, 0, p, 0.018); const gl = M(new THREE.SphereGeometry(0.15, 14, 10), toon(torso[2]), 0, -0.42, 0.03, p, 0.022, 0.15); gl.scale.set(1, 1.05, 1.2); M(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 12), toon('#fbf8ec'), 0, -0.31, 0.01, p, 0.008, 0.1); return p; });
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
    const LOD = (merged ?? MERGE_DEFAULT) && FOX_PHONE && !CAST_KEYS.has(key), skull = M(foxSkull(0.4, LOD ? 26 : 40, LOD ? 20 : 30, null, 0, 0, 0, L), fur, 0, 0, 0, head, 0.04, 0.4); skull.scale.set(L.headWidth, L.headHeight, 1);
    const SZ = 0.3, SL = L.snoutLength * 1.6, tipZ = SZ + 0.345 * SL; const snoutMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad, emissive: new THREE.Color(L.snout || L.muzzle), emissiveIntensity: 0.32 }); const snout = M(snoutGeoFor(L), snoutMat, 0, -0.06, SZ, head, 0.022); snout.scale.set(L.snoutSize * 0.86, L.snoutSize * 0.92, SL); snout.rotation.x = 0.02; P.snout = snout;
    { // NOSE BRIDGE: a fur ridge that rounds up from the forehead and runs down the top of the snout, so the profile is one curve
      const bg = new THREE.SphereGeometry(1, LOD ? 12 : 20, LOD ? 9 : 14), p = bg.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), y = p.getY(i); p.setY(i, y - Math.max(0, z) * 0.35 * (y > 0 ? 0.6 : 1)); } p.needsUpdate = true; bg.computeVertexNormals();
      const br = M(bg, fur, 0, 0.07, SZ + 0.02, head, 0.022); br.scale.set(0.15 * L.snoutSize, 0.15, 0.27 * SL + 0.08); br.rotation.x = 0.22; P.bridge = br; }

    P.nose = M(new THREE.SphereGeometry(0.055, 14, 10), toon(L.nose), 0, -0.045, tipZ, head, 0.012, 0.055); P.nose.scale.set(1.3 * L.snoutSize, 0.85 * L.snoutSize, 0.9);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); shine.position.set(-0.02, -0.027, tipZ + 0.048); head.add(shine); P.shine = shine;
    const fc = document.createElement('canvas'); fc.width = fc.height = 256; const fctx = fc.getContext('2d');
    const ftex = new THREE.CanvasTexture(fc); ftex.colorSpace = THREE.SRGBColorSpace; ftex.anisotropy = 4;
    const faceMat = new THREE.MeshToonMaterial({ map: ftex, transparent: true, alphaTest: 0.04, gradientMap: grad, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    const mask = new THREE.Mesh(foxSkull(0.403, LOD ? 26 : 40, LOD ? 22 : 32, Math.PI / 2 - 0.85, 1.7, Math.PI / 2 - 0.75, 1.5, L), faceMat); skull.add(mask);
    for (const s of [-1, 1]) for (const [dy, dz, len, rz] of [[-0.1, 0.1, 0.2, 0.55], [-0.2, 0.06, 0.16, 0.95]]) {
      const t = M(new THREE.ConeGeometry(0.06, len, 6), toon(L.fluff || L.muzzle), s * 0.42 * L.headWidth / 1.08, dy, dz, head, 0.016); t.rotation.z = -s * (Math.PI / 2 + rz); t.scale.setScalar(L.fluffSize); t.visible = L.fluffSize > 0.05;
    }
    for (const [x, rz, h] of [[-0.07, 0.4, 0.13], [0.02, -0.1, 0.16], [0.09, -0.5, 0.12]]) { const t = M(new THREE.ConeGeometry(0.06, h * L.headTuft, 6), furDark, x, 0.36 * L.headHeight / 0.96, 0.2, head, 0.014); t.visible = L.headTuft > 0.05; t.rotation.set(1.1, 0, rz); }
    P.ears = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.24 * L.earSpread, 0.27 * L.headHeight / 0.96, -0.02 - L.earBack * 0.12); e.rotation.z = -s * L.earTilt; e.scale.set(L.earWidth, L.earHeight, 1); e.userData.baseTilt = L.earTilt; e.userData.baseX = -L.earBack * 0.4; head.add(e);
      const outer = M(new THREE.ConeGeometry(0.17, 0.48, 4), ink, 0, 0.22, 0, e, 0.022); outer.rotation.y = Math.PI / 4; outer.scale.z = 0.5;
      const inner = M(new THREE.ConeGeometry(0.1, 0.32, 4), toon(L.earInner), 0, 0.17, 0.05, e, 0); inner.rotation.y = Math.PI / 4; inner.scale.z = 0.35;
      const fl = M(new THREE.ConeGeometry(0.06, 0.2, 5), toon(L.fluff || L.muzzle), 0, 0.06, 0.08, e, 0); fl.rotation.x = 0.4;
      { const rc = M(new THREE.SphereGeometry(0.11, 14, 10), fur, e.position.x, e.position.y + 0.005, e.position.z, head, 0.016); rc.scale.set(1.25 * L.earSpread, 0.6, 0.85); }
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
    if (L.eyePatch) {   // EYE PATCH STRAP (s149): a black band that hugs the skull: through the patch, over the far brow, round the back (raycast onto the head)
      g.updateMatrixWorld(true); const sx = L.eyePatch === 'R' ? 1 : -1, uv = mask.geometry.attributes.uv, pos = mask.geometry.attributes.position, V3 = (x, y, z) => new THREE.Vector3(x, y, z);
      const atUV = (px, py) => { const tu = px / 256, tv = 1 - py / 256; let bi = 0, bd = 1e9; for (let k = 0; k < uv.count; k++) { const d = (uv.getX(k) - tu) ** 2 + (uv.getY(k) - tv) ** 2; if (d < bd) { bd = d; bi = k; } } return head.worldToLocal(mask.localToWorld(V3().fromBufferAttribute(pos, bi))); };
      const E = atUV(128 + sx * L.eyeSpacing, L.eyeY + 2), T = atUV(128 - sx * (L.eyeSpacing + 40), L.eyeY - 62), Bk = V3(0, E.y + 0.06, -0.5);
      const n = T.clone().sub(E).cross(Bk.clone().sub(E)).normalize(), c = n.clone().multiplyScalar(n.dot(E)), u = E.clone().sub(c).normalize(), v = n.clone().cross(u).normalize();
      const rc = new THREE.Raycaster(), tgt = [skull, mask], pts = [];
      for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2, d = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(v, Math.sin(a)), o = c.clone().addScaledVector(d, 1.4);
        rc.set(head.localToWorld(o.clone()), head.localToWorld(c.clone()).sub(head.localToWorld(o.clone())).normalize()); const h = rc.intersectObjects(tgt, false)[0];
        if (h) pts.push(head.worldToLocal(h.point.clone()).addScaledVector(d, 0.014)); }
      if (pts.length > 8) { const band = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 96, 0.022, 6, true), toon('#141312')); head.add(band); P.patchBand = band; } }
    if (glasses === 'sun') {   // SUN LAYER (s149): the lenses + bridge also go on a copy of the face mask pulled 7 cm toward the camera, so they sit ON TOP of the snout / nose bridge from any angle
      { const sc = document.createElement('canvas'); sc.width = sc.height = 256; const sg = sc.getContext('2d'), ES = L.eyeSize, EX = L.eyeSpacing, EY = L.eyeY, lw = SUN.w * ES, lh = SUN.h * ES;
        sg.lineJoin = 'round'; sg.lineCap = 'round'; sg.strokeStyle = '#111827'; sg.lineWidth = 16; sg.beginPath(); sg.moveTo(128 - EX + lw * 0.55, EY - lh * 0.25); sg.quadraticCurveTo(128, EY - lh * 0.55, 128 + EX - lw * 0.55, EY - lh * 0.25); sg.stroke();
        for (const s of [-1, 1]) { sg.save(); sg.translate(128 + s * EX, EY); sg.rotate(-s * L.eyeTilt * 0.5); sg.fillStyle = '#0b0f19'; sg.beginPath(); sg.ellipse(0, 0, lw, lh, 0, 0, 7); sg.fill(); sg.lineWidth = 5; sg.strokeStyle = '#111827'; sg.stroke();
          sg.strokeStyle = 'rgba(148,163,184,0.55)'; sg.lineWidth = 3; sg.lineCap = 'round'; sg.beginPath(); sg.ellipse(0, 0, lw * 0.7, lh * 0.66, 0, Math.PI * 1.1, Math.PI * 1.45); sg.stroke(); sg.restore(); }
        const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace; st.anisotropy = 4;
        const sm = new THREE.MeshBasicMaterial({ map: st, transparent: true, alphaTest: 0.04, depthWrite: false });
        sm.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  mvPosition.z += 0.16; gl_Position = projectionMatrix * mvPosition;'); };
        const sunL = new THREE.Mesh(mask.geometry, sm); sunL.renderOrder = 4; skull.add(sunL); P.sunLayer = sunL; }
      // side shields + arms back to the ears,
      // starting from the painted lens's outer edge, found through the face mask's UVs
      const fr = toon('#111827'), shield = toon('#0b0f19'); g.updateMatrixWorld(true);
      const pos = mask.geometry.attributes.position, uv = mask.geometry.attributes.uv, nrm = mask.geometry.attributes.normal, nm = new THREE.Matrix3().getNormalMatrix(mask.matrixWorld);
      const at = (px, py) => { const tu = px / 256, tv = 1 - py / 256; let bi = 0, bd = 1e9; for (let i = 0; i < uv.count; i++) { const d = (uv.getX(i) - tu) ** 2 + (uv.getY(i) - tv) ** 2; if (d < bd) { bd = d; bi = i; } }
        const p = head.worldToLocal(mask.localToWorld(new THREE.Vector3().fromBufferAttribute(pos, bi))), n = new THREE.Vector3().fromBufferAttribute(nrm, bi).applyMatrix3(nm).normalize(); return { p, n }; };
      const rc = new THREE.Raycaster(), hitSide = (sx, y, z) => { rc.set(head.localToWorld(new THREE.Vector3(sx * 2, y, z)), new THREE.Vector3(-sx, 0, 0)); const h = rc.intersectObject(skull, false)[0]; if (!h) return null; return head.worldToLocal(h.point.clone()); };
      const Zf = new THREE.Vector3(0, 0, 1);
      const seg = (A, B, w, h, mat) => { const d = B.clone().sub(A), m = M(new THREE.BoxGeometry(w, h, d.length()), mat, (A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2, head, 0.006); m.quaternion.setFromUnitVectors(Zf, d.normalize()); return m; };
      const lw = SUN.w * L.eyeSize;
      { // 3D BRIDGE (s149): a black bar from lens to lens that arches over the nose ridge, so the orange never splits the glasses
        const lh = SUN.h * L.eyeSize, iy = L.eyeY - lh * 0.25, A = at(128 - (L.eyeSpacing - lw * 0.6), iy), B = at(128 + (L.eyeSpacing - lw * 0.6), iy);
        const my = (A.p.y + B.p.y) / 2, front = [P.bridge, skull, P.snout].filter(Boolean); rc.set(head.localToWorld(new THREE.Vector3(0, my, 2)), head.localToWorld(new THREE.Vector3(0, my, 0)).sub(head.localToWorld(new THREE.Vector3(0, my, 2))).normalize());
        const hm = rc.intersectObjects(front, false)[0], mid = hm ? head.worldToLocal(hm.point.clone()).add(new THREE.Vector3(0, 0, 0.014)) : A.p.clone().lerp(B.p, 0.5).add(new THREE.Vector3(0, 0, 0.08));
        const a0 = A.p.clone().addScaledVector(A.n, 0.008), b0 = B.p.clone().addScaledVector(B.n, 0.008), ma = a0.clone().lerp(mid, 0.5), mb = b0.clone().lerp(mid, 0.5); ma.z = Math.max(ma.z, mid.z - 0.02); mb.z = Math.max(mb.z, mid.z - 0.02);
        for (const [p, q] of [[a0, ma], [ma, mid], [mid, mb], [mb, b0]]) seg(p, q, 0.03, 0.026, fr); }
      for (const cs of [-1, 1]) { const e = at(128 + cs * (L.eyeSpacing + lw - 2), L.eyeY), sx = Math.sign(e.p.x) || cs;
        const hinge = e.p.clone().addScaledVector(e.n, 0.006), pts = [hinge];
        for (const back of [0.08, 0.2, 0.32]) { const q = hitSide(sx, hinge.y, hinge.z - back); if (q) pts.push(q.add(new THREE.Vector3(sx * 0.01, 0, 0))); }
        for (let i = 0; i < pts.length - 1; i++) seg(pts[i], pts[i + 1], 0.014, 0.02, fr);
        if (pts[1]) { const sh = seg(pts[0], pts[1], 0.008, 0.07, shield); sh.position.y -= 0.006; }
      }
    } else if (glasses) { const lens = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.42 }); for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.016, 6, 22), toon('#334155')); r.position.set(s * 0.13, 0.03, 0.43); r.scale.x = 0.95 / 1.14; skull.add(r); const l = new THREE.Mesh(new THREE.CircleGeometry(0.095, 22), lens); l.position.set(s * 0.13, 0.03, 0.432); l.scale.x = 0.95 / 1.14; skull.add(l); } M(new THREE.BoxGeometry(0.08, 0.018, 0.018), toon('#334155'), 0, 0.05, 0.44, skull, 0); }
    if (cane) { const c = M(new THREE.CylinderGeometry(0.017, 0.017, 1.25, 6), white, 0, -0.9, 0.22, P.arms[1], 0.012); c.rotation.x = 0.35; M(new THREE.SphereGeometry(0.035, 6, 4), toon('#dc2626'), 0, -0.62, 0, c, 0); }
    const tail = new THREE.Group(); tail.position.set(0, 0.6 + lift, -0.24); body.add(tail); P.tail = tail;
    const tm = M(tailGeoFor(L), vcToon, 0, 0, 0, tail, 0.03); tm.rotation.x = -L.tailLift; tm.scale.setScalar(L.tailSize);
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
    if (legColor) { const lm = toon(legColor); P.legs.forEach(p => p.children.forEach(c => { if (c.isMesh && !(c.geometry.type === 'SphereGeometry' && c.geometry.parameters.radius === 0.14)) c.material = lm; })); }
    g.traverse(o => { if (o.isMesh && o.material !== outlineMat && o.material !== faceMat) o.castShadow = true; });
    g.userData = { hold, P, phase: rr(0, 6), amt: 0, blink: rr(1, 4), blinkT: 0, chair: !!chair, base: mood, mood, moodT: 0, look: 0, lookT: rr(1, 3), lookTo: 0, mouth: 0, talking: false, hop: 0, hopY: 0,
      face: { ctx: fctx, tex: ftex, eyeL: eyes[0], eyeR: eyes[1], key: '', L, sun: glasses === 'sun' }, lookAt: null };
    // PHONE PERF (step 3): MERGED FOX. Static meshes are baked into one mesh per moving part (+ one ink shell per part).
    // Off for Hope + Noble (their cane + chair rigs read the raw parts) and for the chair pose. The player has no rig: merged too (s32, ~200 → ~45 draws).
    if ((merged ?? MERGE_DEFAULT) && !chair && key !== 'hope' && key !== 'noble') mergeFoxParts(g, P);
    g.scale.setScalar(L.bodyScale); g.userData.foxKey = key || ''; g.userData.foxName = name || '';   // s104g: the CHARACTER ROSTER reads these
    scene.add(g); return g;
  }
  const FOX_PHONE = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches, CAST_KEYS = new Set(['player', 'hope', 'noble']), _m4 = new THREE.Matrix4(), _inv = new THREE.Matrix4(), _n3 = new THREE.Matrix3(), _v = new THREE.Vector3(), _c = new THREE.Color();
  function mergeFoxParts(g, P) {
    const bones = new Set([g]); const addB = o => { if (!o) return; if (Array.isArray(o)) o.forEach(addB); else if (o.isObject3D) bones.add(o); };
    for (const k in P) addB(P[k]);
    const live = new Set([P.bladeMat, P.tipMat].filter(Boolean));
    const okMat = m => m && !Array.isArray(m) && (m === outlineMat || (m.isMeshToonMaterial && !m.map && !m.transparent && !live.has(m)));
    const ok = new Map(); const can = o => { if (ok.has(o)) return ok.get(o); let r = o.isMesh && !bones.has(o) && o.visible && okMat(o.material) && !o.isSkinnedMesh && !o.isInstancedMesh;
      if (r) for (const c of o.children) if (!can(c)) { r = false; break; } ok.set(o, r); return r; };
    const isAnchor = o => bones.has(o) || (o.isMesh && !can(o)) || (!o.isMesh && [...o.children].some(c => !can(c) && !(c.children.length === 0 && !c.isMesh)) && hasKept(o));
    const kept = new Map(); const hasKept = o => { if (kept.has(o)) return kept.get(o); let r = false; for (const c of o.children) if ((c.isMesh && !can(c)) || bones.has(c) || (!c.isMesh && hasKept(c))) { r = true; break; } if (!o.isMesh && !bones.has(o) && o.children.length === 0) r = true; kept.set(o, r); return r; };
    g.updateMatrixWorld(true);
    const bins = new Map(), take = [];   // anchor -> sig -> [meshes]
    g.traverse(o => { if (!o.isMesh || !can(o)) return; if (o.parent && o.parent.isMesh && can(o.parent)) { /* merged with its parent's walk */ }
      let a = o.parent; while (a && !(bones.has(a) || (a.isMesh && !can(a)) || (!a.isMesh && hasKept(a)))) a = a.parent; if (!a) return;
      const m = o.material, sig = m === outlineMat ? 'ink' : [m.emissive ? m.emissive.getHex() : 0, m.emissiveIntensity, m.side].join('|');
      let A = bins.get(a); if (!A) bins.set(a, A = new Map()); let L = A.get(sig); if (!L) A.set(sig, L = []); L.push(o); take.push(o); });
    for (const [a, A] of bins) { _inv.copy(a.matrixWorld).invert();
      for (const [sig, list] of A) { if (list.length < 2 && sig !== 'ink') { if (list.length === 1 && list[0].parent === a) { const i = take.indexOf(list[0]); if (i >= 0) take.splice(i, 1); continue; } }
        let nv = 0, ni = 0; for (const o of list) { const gg = o.geometry; nv += gg.attributes.position.count; ni += gg.index ? gg.index.count : gg.attributes.position.count; }
        const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new (nv > 65535 ? Uint32Array : Uint16Array)(ni); let vo = 0, io = 0;
        for (const o of list) { const gg = o.geometry; if (!gg.attributes.normal) gg.computeVertexNormals(); _m4.multiplyMatrices(_inv, o.matrixWorld); _n3.getNormalMatrix(_m4); const flip = _m4.determinant() < 0;
          const p = gg.attributes.position, n = gg.attributes.normal, vc = o.material.vertexColors && gg.attributes.color, base = o.material.color || _c.set(0xffffff), c = gg.attributes.color;
          for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i).applyMatrix4(_m4); pos.set([_v.x, _v.y, _v.z], (vo + i) * 3); _v.fromBufferAttribute(n, i).applyMatrix3(_n3).normalize(); nor.set([_v.x, _v.y, _v.z], (vo + i) * 3);
            const r = vc ? c.getX(i) * base.r : base.r, gr = vc ? c.getY(i) * base.g : base.g, b = vc ? c.getZ(i) * base.b : base.b; col[(vo + i) * 3] = r; col[(vo + i) * 3 + 1] = gr; col[(vo + i) * 3 + 2] = b; }
          if (gg.index) { const ix = gg.index.array; for (let i = 0; i < ix.length; i += 3) { idx[io++] = ix[i] + vo; idx[io++] = (flip ? ix[i + 2] : ix[i + 1]) + vo; idx[io++] = (flip ? ix[i + 1] : ix[i + 2]) + vo; } }
          else for (let i = 0; i < p.count; i += 3) { idx[io++] = vo + i; idx[io++] = vo + (flip ? i + 2 : i + 1); idx[io++] = vo + (flip ? i + 1 : i + 2); }
          vo += p.count; }
        const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setIndex(new THREE.BufferAttribute(idx, 1)); G.computeBoundingSphere();
        let mat; if (sig === 'ink') mat = outlineMat; else { G.setAttribute('color', new THREE.BufferAttribute(col, 3)); const m0 = list[0].material; mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: m0.gradientMap || grad, side: m0.side }); if (m0.emissive) { mat.emissive.copy(m0.emissive); mat.emissiveIntensity = m0.emissiveIntensity; } }
        const me = new THREE.Mesh(G, mat); me.name = 'merged'; me.userData.merged = list.length; if (sig !== 'ink') me.castShadow = me.receiveShadow = true; a.add(me); } }
    for (const o of take) if (o.parent) o.parent.remove(o);
    // drop groups left empty by the merge (not bones)
    const empty = []; g.traverse(o => { if (!o.isMesh && !bones.has(o) && o.children.length === 0 && !o.isSprite && !o.isLight) empty.push(o); }); for (const o of empty) if (o.parent) o.parent.remove(o);
    g.userData.mergedFox = true; }
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
    if (u.talking && !mv && !u.chair) { const ga = (u.talkStyle && u.talkStyle.gest) ?? 1; P.arms[1].rotation.x = -0.5 * ga + Math.sin(u.phase * 2.2 * ((u.talkStyle && u.talkStyle.rate) || 1)) * 0.25 * ga; P.arms[1].rotation.z = 0.12 + 0.23 * ga; if (ga > 1.2) { P.arms[0].rotation.x = -0.4 + Math.sin(u.phase * 2.6 + 1) * 0.3; } } else { P.arms[1].rotation.z = 0.12; }
    P.arms[0].rotation.z = -0.12;
    if (u.hold && !air) { if (u.hold.right && !(u.talking && !mv)) { P.arms[1].rotation.x = P.arms[1].rotation.x * 0.35 - 0.55; P.arms[1].rotation.z = 0.18; } if (u.hold.left) { P.arms[0].rotation.x = P.arms[0].rotation.x * 0.35 - 0.75; P.arms[0].rotation.z = -0.16; } }
    u.pulseT = (u.pulseT || 0) + dt;
    if (P.sword) { P.sword.rotation.set(0.95 - P.arms[1].rotation.x, 0, -0.5); const p = 0.5 + 0.5 * Math.sin(u.pulseT * 3.2); P.bladeMat.emissiveIntensity = 0.4 + p * 1.6; P.bladeMat.color.setRGB(1, 1, 1).lerp(P.bladeMat.emissive, 0.15 + p * 0.65);  }
    if (P.tipMat) { const p = Math.pow(0.5 + 0.5 * Math.sin(u.pulseT * 5.0 + 1), 2); P.tipMat.emissiveIntensity = 0.6 + p * 2.6; P.tipGlow.scale.setScalar(0.18 + p * 0.32); P.tipGlow.material.opacity = 0.35 + p * 0.65; }
    if (P.gun) { const ga = P.gun.parent; P.gun.rotation.set(-ga.rotation.x - 0.05, 0, 0); }
    P.body.rotation.x = damp(P.body.rotation.x, mv ? 0.08 * u.amt : (mood === 'sad' ? 0.06 : mood === 'excited' ? -0.05 : 0), 6, dt);
    // tail + ears by mood
    const wag = (lively ? 2.6 : mv ? 1 : 0.6) * (u.wagMul ?? 1);   // u.wagMul: per-fox wag speed (1 = default)
    P.tail.rotation.y = Math.sin(u.phase * wag) * (lively ? 0.55 : 0.32); P.tail.rotation.x = (mood === 'sad' ? 0.5 : -0.1) + Math.sin(u.phase * 0.5) * 0.08;
    const earX = mood === 'sad' ? 0.55 : mood === 'stern' || mood === 'determined' ? 0.28 : mood === 'surprised' || lively ? -0.18 : 0;
    const earZ = mood === 'sad' ? 0.35 : 0;
    P.ears.forEach((e, i) => { const s = i ? 1 : -1; const flick = i === 1 && (u.phase % 7) < 0.22 ? -0.35 : 0; e.rotation.x = damp(e.rotation.x, (e.userData.baseX || 0) + earX + flick, 10, dt); e.rotation.z = damp(e.rotation.z, -s * ((e.userData.baseTilt ?? 0.3) + earZ), 8, dt); });
    // head: look at a target, idle tilt
    let hy = 0, hx = mood === 'sad' ? 0.12 : 0, hz = 0; if (u.talking) { const ts = u.talkStyle || {}, ga = ts.gest ?? 1, mt = u.mt || 0; hx += (u.mouth || 0) * 0.06 * ga + Math.sin(mt * 2.1) * 0.025 * ga; hy += Math.sin(mt * 0.9) * 0.08 * ga; hz = Math.sin(mt * 1.3 + 0.7) * 0.05 * ga; } u.hz = damp(u.hz || 0, hz, 6, dt);
    if (u.lookAt) { c.updateWorldMatrix(true, false); tmpV.copy(u.lookAt); c.worldToLocal(tmpV); hy = clamp(Math.atan2(tmpV.x, tmpV.z), -0.85, 0.85); hx += clamp(-Math.atan2(tmpV.y - 1.6, Math.hypot(tmpV.x, tmpV.z)) * 0.5, -0.25, 0.25); }
    P.head.rotation.y = damp(P.head.rotation.y, hy, 6, dt); P.head.rotation.x = damp(P.head.rotation.x, hx, 6, dt);
    P.head.rotation.z = damp(P.head.rotation.z, (mood === 'curious' ? 0.16 : 0) + Math.sin(u.phase * 0.35) * 0.04 + (u.hz || 0), 5, dt);
    if (u.talking && P.ears) { u.earT = (u.earT || 0) - dt; if (u.earT < 0) { u.earT = 1.2 + Math.random() * 1.6; u.earK = 0.25; } u.earK = Math.max(0, (u.earK || 0) - dt); if (u.earK > 0) { const e = P.ears[u.earT > 2 ? 0 : 1]; e.rotation.x -= Math.sin(u.earK / 0.25 * Math.PI) * 0.14; } }
    // face
    u.blink -= dt; if (u.blink < 0) { u.blinkT = 0.14; u.blink = rr(2, 5); } u.blinkT = Math.max(0, u.blinkT - dt);
    const bl = u.blinkT > 0 ? Math.sin((u.blinkT / 0.14) * Math.PI) : 0;
    u.lookT -= dt; if (u.lookT < 0) { u.lookT = rr(1.2, 3.5); u.lookTo = u.lookAt || u.talking ? 0 : pick([-1, -0.6, 0, 0, 0.6, 1]); }
    u.look = damp(u.look, u.lookTo, 8, dt);
    u.mt = (u.mt || 0) + dt; { const ts = u.talkStyle || { rate: 1, amp: 1, base: 0.25 };
      if (u.say && u.say.text) { const S2 = u.say; S2.t += dt * ts.rate; const cps = 13, i = Math.floor(S2.t * cps), ch = (S2.text[i] || '').toLowerCase(), fr = S2.t * cps - i;
        let tgt = 0; u.vis = /[ou]/.test(ch) ? 'o' : /[mbp]/.test(ch) ? 'm' : /[fv]/.test(ch) ? 'f' : 'a'; if (/[aeiy]/.test(ch)) tgt = 0.75; else if (/[ou]/.test(ch)) tgt = 0.9; else if (/[mbp]/.test(ch)) tgt = 0; else if (/[a-z]/.test(ch)) tgt = 0.3; else if (/[!?.,]/.test(ch)) tgt = 0;
        tgt *= ts.amp * (0.85 + 0.15 * Math.sin(fr * Math.PI)); u.mouth = damp(u.mouth, Math.min(1, tgt), 28, dt); S2.shown = Math.min(S2.text.length, i + 1); u.talking = i < S2.text.length + 4; if (i > S2.text.length + 10) { u.say = null; u.talking = false; } }
      else { u.vis = 'a'; } if (!(u.say && u.say.text)) u.mouth = u.talking ? Math.min(1, Math.max(0, (Math.sin(u.mt * 13 * ts.rate) * 0.7 + Math.sin(u.mt * 21.3 * ts.rate) * 0.35 + Math.sin(u.mt * 3.7) * 0.3 + ts.base) * ts.amp)) : damp(u.mouth, 0, 14, dt); }
    { const mo = u.mouth || 0; if (P.snout) { const a = damp(u.snoutA || 0, -mo * 0.24, 20, dt); u.snoutA = a; P.snout.rotation.x = 0.02 + a;
        if (!u.snoutBase) { const o = P.snout.position.clone(); u.snoutBase = [P.nose, P.shine, P.bridge].filter(Boolean).map(m => [m, m.position.clone(), m.rotation.x]); u.snoutO = o; }
        const c = Math.cos(a), sn = Math.sin(a), O = u.snoutO; for (const [m, p0, r0] of u.snoutBase) { const dy = p0.y - O.y, dz = p0.z - O.z; m.position.set(p0.x, O.y + dy * c - dz * sn, O.z + dy * sn + dz * c); m.rotation.x = r0 + a; } } u.browUp = damp(u.browUp || 0, u.talking ? Math.max(0, mo - 0.55) * 2.2 : 0, 10, dt); }
    const f = u.face, key = `${Math.round(bl * 4)}|${mood}|${Math.round(u.mouth * 5)}|${u.vis}|${Math.round((u.browUp || 0) * 3)}|${Math.round(u.look * 4)}`;
    if (key !== f.key) { f.key = key; drawFace(f.ctx, { vis: u.vis, browUp: Math.round((u.browUp || 0) * 3) / 3, L: f.L, sun: f.sun, eyeL: f.eyeL, eyeR: f.eyeR, blink: Math.round(bl * 4) / 4, mood, mouth: Math.round(u.mouth * 5) / 5, look: Math.round(u.look * 4) / 4 }); f.tex.needsUpdate = true; }
    if (u.rig) u.rig.update(dt, speed);   // Hope's cane, Noble's chair (engine/cast.js)
  }


  return { makeFox, animFox, MOOD, moodOf, setLook(l) { LOOK = { ...DEFAULT_LOOK, ...l }; }, getLook: () => ({ ...LOOK }) };
}
